// Weltall-Modus: Sternenfeld mit Parallaxe, Funkeln, Sternschnuppen, Planet mit Ring
const Weltall = (() => {
  let cv, c, W = 0, H = 0, sterne = [], schnuppen = [], raf = 0, t0 = 0, naechsteSchnuppe = 0;
  const dpr = () => Math.min(window.devicePixelRatio || 1, 2);
  function fit() {
    const r = cv.parentElement.getBoundingClientRect(), d = dpr();
    W = r.width; H = r.height; cv.width = W * d; cv.height = H * d; c.setTransform(d, 0, 0, d, 0, 0);
    const n = Math.round(W * H / 2600);
    sterne = Array.from({ length: n }, () => {
      const ebene = Math.random() < .6 ? 0 : Math.random() < .75 ? 1 : 2;
      return { x: Math.random() * W, y: Math.random() * H, r: [.6, 1.1, 1.7][ebene], v: [2, 5, 10][ebene],
        ph: Math.random() * 6.28, f: .5 + Math.random() * 2, farbe: ['#ffffff', '#cfe3ff', '#ffe9c4', '#d8c8ff'][Math.random() * 4 | 0] };
    });
  }
  function planet(t) {
    const x = W * .86, y = H * .2, r = Math.min(W, H) * .07;
    const g = c.createRadialGradient(x - r * .4, y - r * .4, r * .1, x, y, r);
    g.addColorStop(0, '#9fb6ff'); g.addColorStop(.6, '#4b4fa8'); g.addColorStop(1, '#1a1840');
    c.save(); c.globalAlpha = .55;
    c.strokeStyle = 'rgba(190,200,255,.5)'; c.lineWidth = 2;
    c.beginPath(); c.ellipse(x, y, r * 1.9, r * .45, -.35, Math.PI, Math.PI * 2); c.stroke();
    c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.ellipse(x, y, r * 1.9, r * .45, -.35, 0, Math.PI); c.stroke();
    // Mond
    const a = t / 18000 * Math.PI * 2;
    c.fillStyle = '#d9dcef'; c.beginPath(); c.arc(x + Math.cos(a) * r * 2.6, y + Math.sin(a) * r * .9, r * .14, 0, Math.PI * 2); c.fill();
    c.restore();
  }
  function frame(t) {
    const dt = Math.min(50, t - (t0 || t)) / 1000; t0 = t;
    c.clearRect(0, 0, W, H);
    planet(t);
    for (const s of sterne) {
      s.x -= s.v * dt; if (s.x < -2) { s.x = W + 2; s.y = Math.random() * H; }
      const a = .45 + .55 * Math.abs(Math.sin(s.ph + t / 1000 * s.f));
      c.globalAlpha = a; c.fillStyle = s.farbe;
      c.beginPath(); c.arc(s.x, s.y, s.r, 0, Math.PI * 2); c.fill();
      if (s.r > 1.5 && a > .9) { c.globalAlpha = a * .35; c.fillRect(s.x - 4, s.y - .4, 8, .8); c.fillRect(s.x - .4, s.y - 4, .8, 8); }
    }
    c.globalAlpha = 1;
    if (t > naechsteSchnuppe) {
      schnuppen.push({ x: Math.random() * W * .8 + W * .2, y: Math.random() * H * .4, vx: -(380 + Math.random() * 300), vy: 160 + Math.random() * 140, leben: 1 });
      naechsteSchnuppe = t + 4000 + Math.random() * 7000;
    }
    schnuppen = schnuppen.filter(s => s.leben > 0);
    for (const s of schnuppen) {
      s.x += s.vx * dt; s.y += s.vy * dt; s.leben -= dt * .9;
      const g = c.createLinearGradient(s.x, s.y, s.x - s.vx * .18, s.y - s.vy * .18);
      g.addColorStop(0, `rgba(255,255,255,${s.leben})`); g.addColorStop(1, 'rgba(126,224,255,0)');
      c.strokeStyle = g; c.lineWidth = 2; c.beginPath(); c.moveTo(s.x, s.y); c.lineTo(s.x - s.vx * .18, s.y - s.vy * .18); c.stroke();
    }
    raf = requestAnimationFrame(frame);
  }
  function start() {
    if (cv) return;
    const rahmen = document.getElementById('rahmen'); if (!rahmen) return;
    cv = document.createElement('canvas'); cv.id = 'sterne'; c = cv.getContext('2d');
    rahmen.prepend(cv); fit(); addEventListener('resize', fit);
    t0 = 0; naechsteSchnuppe = performance.now() + 1500; raf = requestAnimationFrame(frame);
  }
  function stop() {
    if (!cv) return; cancelAnimationFrame(raf); removeEventListener('resize', fit); cv.remove(); cv = null; schnuppen = [];
  }
  const pruefen = () => (document.documentElement.dataset.theme === 'weltall' && !document.hidden) ? start() : stop();
  new MutationObserver(pruefen).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  document.addEventListener('visibilitychange', pruefen);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', pruefen); else pruefen();
  return { start, stop };
})();
