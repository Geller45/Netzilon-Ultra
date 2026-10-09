// Netzilon – Paket 5: Rand-Stickman, gejagt vom Ticket „Drucker geht nicht“
const Stickman = (() => {
  const WAFFEN = [
    ['Tacker', '📎'], ['Toner-Kartusche', '🖨'], ['Gummi-Ente (Rubber-Duck-Debugging)', '🦆'], ['Kaffeetasse', '☕'],
    ['USB-Stick', '💾'], ['Patchkabel-Lasso', '🔌'], ['Handbuch (nie gelesen)', '📕'], ['Neustart-Hammer', '🔨'],
    ['Ping-Pong-Ball (ICMP)', '🏓'], ['Sysprep-Spray', '🧴']
  ];
  const IDLE = 120000, R = 18;
  let cv, c, klick, W, H, s = 0, gap = 520, lastAktiv = Date.now(), aktiv = false, raf, t0 = performance.now();
  let tempo = 2.2, sprint = 0, sprung = 0, gefangen = 0, schuesse = [], meldung = null, ticketNr = 4711;

  function umfang() { return 2 * (W - 2 * R) + 2 * (H - 2 * R); }
  function punkt(p) { // Rundlauf: unten →, rechts ↑, oben ←, links ↓
    const a = W - 2 * R, b = H - 2 * R, U = umfang(); p = ((p % U) + U) % U;
    if (p < a) return { x: R + p, y: H - R, w: 0, kante: 'unten' };
    p -= a; if (p < b) return { x: W - R, y: H - R - p, w: -Math.PI / 2, kante: 'rechts' };
    p -= b; if (p < a) return { x: W - R - p, y: R, w: Math.PI, kante: 'oben' };
    p -= a; return { x: R, y: R + p, w: Math.PI / 2, kante: 'links' };
  }
  function fit() { W = cv.width = innerWidth; H = cv.height = innerHeight; }
  const aktivitaet = () => { lastAktiv = Date.now(); };

  function figur(pt, t, pose) {
    c.save(); c.translate(pt.x, pt.y); c.rotate(pt.w);
    const hoch = pose === 'sprung' ? -Math.sin(sprung * Math.PI) * 38 : 0;
    c.translate(0, hoch);
    c.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--tinte').trim() || '#ecefe4';
    c.lineWidth = 2.6; c.lineCap = 'round';
    const f = pose === 'gefangen' ? 0 : Math.sin(t * (10 + sprint * 8));
    c.beginPath(); c.arc(0, -30, 5.5, 0, 7); c.stroke();
    c.beginPath(); c.moveTo(0, -24); c.lineTo(2, -11);
    if (pose === 'sprung') { c.moveTo(2, -11); c.lineTo(-7, -3); c.moveTo(2, -11); c.lineTo(9, -5); }
    else if (pose === 'gefangen') { c.moveTo(2, -11); c.lineTo(-4, 0); c.moveTo(2, -11); c.lineTo(6, 0); }
    else { c.moveTo(2, -11); c.lineTo(2 + f * 9, 0); c.moveTo(2, -11); c.lineTo(2 - f * 9, 0); }
    if (pose === 'gefangen') { c.moveTo(0, -22); c.lineTo(-8, -36); c.moveTo(0, -22); c.lineTo(8, -36); }
    else { c.moveTo(0, -21); c.lineTo(8 - f * 6, -14); c.moveTo(0, -21); c.lineTo(-7 + f * 6, -15); }
    c.stroke();
    if (sprint > 0.3 && pose !== 'gefangen') { c.globalAlpha = .4; c.beginPath(); for (let i = 0; i < 3; i++) { c.moveTo(-10 - i * 5, -26 + i * 8); c.lineTo(-22 - i * 5, -26 + i * 8); } c.stroke(); }
    c.restore();
  }
  function ticket(pt, t) {
    c.save(); c.translate(pt.x, pt.y); c.rotate(pt.w); c.translate(0, -30 + Math.sin(t * 6) * 2); c.rotate(Math.sin(t * 9) * 0.08);
    c.shadowColor = 'rgba(0,0,0,.45)'; c.shadowBlur = 8; c.shadowOffsetY = 3;
    c.fillStyle = '#fff3a8'; c.strokeStyle = '#c8322b'; c.lineWidth = 2;
    c.beginPath(); c.roundRect(-72, -28, 144, 56, 5); c.fill(); c.shadowColor = 'transparent'; c.stroke();
    c.fillStyle = '#c8322b'; c.beginPath(); c.roundRect(-72, -28, 144, 16, [5, 5, 0, 0]); c.fill();
    c.fillStyle = '#fff'; c.font = 'bold 11px "Atkinson Hyperlegible", Arial'; c.textAlign = 'center';
    c.fillText('TICKET #' + ticketNr + ' · PRIO 1', 0, -16);
    c.fillStyle = '#3a3210'; c.font = 'bold 14px "Atkinson Hyperlegible", Arial';
    c.fillText('Drucker geht nicht', 0, 5);
    c.font = '11px "Atkinson Hyperlegible", Arial'; c.fillText('Status: ESKALIERT', 0, 20);
    c.fillStyle = '#c8322b'; c.beginPath(); c.arc(-14, -36, 4, 0, 7); c.arc(14, -36, 4, 0, 7); c.fill(); // Augen
    c.fillStyle = '#fff'; c.beginPath(); c.arc(-13, -37, 1.5, 0, 7); c.arc(15, -37, 1.5, 0, 7); c.fill();
    c.restore();
    klick.style.transform = `translate(${pt.x - 75}px, ${pt.y - 75}px)`;
  }
  function frame(now) {
    const t = (now - t0) / 1000, idle = Date.now() - lastAktiv;
    c.clearRect(0, 0, W, H);
    const U = umfang();
    if (gefangen > 0) {
      gefangen -= 1 / 60;
      const p = punkt(s); figur(p, t, 'gefangen'); ticket(punkt(s - 60), t);
      if (gefangen <= 0) { gap = 520; ticketNr++; lastAktiv = Date.now(); }
    } else {
      if (Math.random() < 0.004) sprint = 1;
      sprint = Math.max(0, sprint - 0.006);
      const v = tempo + sprint * 5;
      s += v;
      if (sprung > 0) sprung = Math.min(1, sprung + 0.035), sprung >= 1 && (sprung = 0);
      else if (punkt(s).kante === 'unten' && Math.random() < 0.006) sprung = 0.01;
      // Ticket: bei Aktivität Abstand halten, ab 2 min Inaktivität aufholen
      const ziel = idle > IDLE ? 0 : 520;
      gap += idle > IDLE ? -(3 + sprint * 2) : (ziel - gap) * 0.004 - sprint * 1.2 + 0.4;
      gap = Math.max(60, Math.min(900, gap));
      if (gap <= 60) { gefangen = 3.2; meldung = { txt: `Ticket #${ticketNr} zugewiesen. Drucker geht immer noch nicht.`, bis: t + 3.2 }; window.ton?.('schlecht'); }
      figur(punkt(s), t, sprung > 0 ? 'sprung' : 'lauf');
      ticket(punkt(s - gap), t);
    }
    // Waffen
    schuesse.forEach(w => {
      w.k = Math.min(1, w.k + 0.045);
      const z = punkt(s - gap), x = w.x + (z.x - w.x) * w.k, y = w.y + (z.y - w.y) * w.k - Math.sin(w.k * Math.PI) * 70;
      c.save(); c.font = '22px "Segoe UI Emoji", sans-serif'; c.translate(x, y); c.rotate(w.k * 12); c.textAlign = 'center'; c.fillText(w.e, 0, 8); c.restore();
      if (w.k >= 1 && !w.hit) { w.hit = 1; gap += 260; meldung = { txt: `${w.n}! Ticket zurückgeworfen.`, bis: t + 1.8 }; window.ton?.('gut'); }
    });
    schuesse = schuesse.filter(w => !w.hit);
    if (meldung && t < meldung.bis) {
      const p = punkt(s);
      c.save(); c.font = '600 13px "Atkinson Hyperlegible", sans-serif';
      const w = c.measureText(meldung.txt).width + 18;
      let x = Math.min(Math.max(p.x, w / 2 + 30), W - w / 2 - 30), y = Math.min(Math.max(p.y, 90), H - 70) - 40;
      c.fillStyle = 'rgba(0,0,0,.78)'; c.beginPath(); c.roundRect(x - w / 2, y - 18, w, 26, 8); c.fill();
      c.fillStyle = '#fff3a8'; c.textAlign = 'center'; c.fillText(meldung.txt, x, y); c.restore();
    }
    raf = requestAnimationFrame(frame);
  }
  function werfen(e) {
    e.stopPropagation();
    if (gefangen > 0) return;
    const [n, em] = WAFFEN[Math.random() * WAFFEN.length | 0], p = punkt(s);
    schuesse.push({ x: p.x, y: p.y - 20, k: 0, n, e: em });
    lastAktiv = Date.now();
  }
  function start() {
    if (aktiv) return; aktiv = true;
    if (!cv) {
      cv = document.createElement('canvas'); cv.id = 'stickman'; c = cv.getContext('2d');
      klick = document.createElement('button'); klick.id = 'ticket-klick'; klick.title = 'Ticket abwehren!'; klick.setAttribute('aria-label', 'Ticket abwehren');
      klick.addEventListener('click', werfen);
    }
    document.body.append(cv, klick); fit();
    addEventListener('resize', fit);
    ['mousemove', 'keydown', 'mousedown', 'wheel'].forEach(ev => addEventListener(ev, aktivitaet, { passive: true }));
    lastAktiv = Date.now(); raf = requestAnimationFrame(frame);
  }
  function stop() {
    if (!aktiv) return; aktiv = false; cancelAnimationFrame(raf);
    cv.remove(); klick.remove(); removeEventListener('resize', fit);
    ['mousemove', 'keydown', 'mousedown', 'wheel'].forEach(ev => removeEventListener(ev, aktivitaet));
  }
  return { start, stop, _test: { setIdle: ms => { lastAktiv = Date.now() - ms; } } };
})();
window.Stickman = Stickman;
