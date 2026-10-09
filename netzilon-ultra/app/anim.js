// Netzilon Ultra – Animations-Engine für "## Grafik"
// Zeilen: "N. A -> B: Text" (Paket fliegt), "N. A: Text" (Akteur leuchtet), "N. Text" (Erklärschritt)
// Akteure = Glas-Kästen, Steuerung: Play/Pause, Schritt vor/zurück, Tempo, Neustart; Fallback = Textdarstellung.
const Anim = (() => {
  const ICONS = [
    [/client|pc|rechner|laptop|notebook|benutzer-pc|workstation|host/i, '💻'], [/dhcp/i, '📋'], [/dns|resolver|nameserver/i, '📖'],
    [/router|gateway|rras/i, '⇄'], [/switch|bridge/i, '⇆'], [/firewall|fw\b|nps|radius/i, '🧱'], [/internet|cloud|azure|entra|wan|isp/i, '☁'],
    [/server|dc\b|domänencontroller|ca\b|kdc|iis|web/i, '🗄'], [/disk|platte|hdd|ssd|raid|volume|lun|speicher|nas|san/i, '💽'],
    [/benutzer|user|admin|kunde|azubi|mensch|chef|anwender/i, '👤'], [/kernel|cpu|prozessor|hardware|bios|uefi/i, '⚙'],
    [/datenbank|sql|db\b|tabelle/i, '🛢'], [/shell|bash|terminal|powershell|cmd/i, '>_'], [/mail|smtp|imap|pop/i, '✉'],
    [/drucker|printer/i, '🖨'], [/usv|ups|strom|akku/i, '🔋'], [/zertifikat|cert|schlüssel|key/i, '🔑'], [/handy|smartphone|iphone/i, '📱']
  ];
  const icon = n => (ICONS.find(([re]) => re.test(n)) || [0, '◆'])[1];
  const players = [];

  function akteureVon(g) {
    const a = [];
    const add = n => { n = String(n).trim(); if (n && n !== '*' && !a.includes(n)) a.push(n); };
    for (const s of g.schritte) { if (s.art === 'paket') { add(s.von); s.nach.forEach(add); } else if (s.art === 'akteur') add(s.akteur); }
    return a.slice(0, 12);
  }
  function html(d, i) {
    const g = d.grafiken[i];
    return `<div class="anim" data-anim="${i}">
      <div class="anim-kopf"><h3>${E(g.name)}</h3><div class="anim-steuer">
        <button class="glas mini" data-a="zurueck" title="Schritt zurück" aria-label="Schritt zurück">⏮</button>
        <button class="glas mini an" data-a="play" title="Abspielen/Pause" aria-label="Abspielen">▶</button>
        <button class="glas mini" data-a="vor" title="Schritt vor" aria-label="Schritt vor">⏭</button>
        <button class="glas mini" data-a="neu" title="Von vorn" aria-label="Von vorn">↺</button>
        <select class="anim-tempo" aria-label="Tempo"><option value="0.5">0,5×</option><option value="1" selected>1×</option><option value="1.6">1,6×</option><option value="2.5">2,5×</option></select>
        <button class="glas mini" data-a="text" title="Als Text anzeigen">Text</button></div></div>
      <div class="anim-buehne"><svg class="anim-svg" viewBox="0 0 900 300" role="img" aria-label="${E(g.name)}"></svg></div>
      <div class="anim-caption" aria-live="polite"></div>
      <ol class="anim-liste">${g.schritte.map((s, k) => `<li data-k="${k}">${s.art === 'paket' ? `<b>${E(s.von)} → ${E(s.nach.join(', '))}</b>: ` : s.art === 'akteur' ? `<b>${E(s.akteur)}</b>: ` : ''}${Parser.inline(s.text)}</li>`).join('')}</ol>
      <div class="anim-text" hidden>${Parser.md(g.text)}</div></div>`;
  }
  function binden(d) {
    players.splice(0).forEach(p => p.stop());
    document.querySelectorAll('.anim[data-anim]').forEach(el => { const g = d.grafiken[+el.dataset.anim]; if (g && g.animierbar) players.push(spieler(el, g)); });
  }

  function spieler(root, g) {
    const svg = root.querySelector('.anim-svg'), cap = root.querySelector('.anim-caption');
    const akteure = akteureVon(g);
    const n = akteure.length, zweiReihen = n > 6;
    const W = 900, H = zweiReihen ? 330 : 230, BW = Math.min(150, (W - 40) / Math.ceil(n / (zweiReihen ? 2 : 1)) - 18), BH = 74;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    const pos = {};
    akteure.forEach((a, k) => {
      const reihe = zweiReihen ? k % 2 : 0, proReihe = zweiReihen ? Math.ceil(n / 2) : n, idx = zweiReihen ? Math.floor(k / 2) : k;
      const x = 20 + (W - 40) * (idx + 0.5) / proReihe, y = zweiReihen ? (reihe ? 245 : 80) : 115;
      pos[a] = { x, y };
    });
    const zielPos = name => name === '*' ? null : pos[name];
    let i = -1, spielt = false, tempo = 1, timer = null, raf = null, aktiv = true;
    const reduziert = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

    function grund() {
      return `<defs><filter id="glow-${g.name.length}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <marker id="pfeil" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="anim-pfeilspitze"/></marker></defs>
        <g class="spuren"></g>
        ${akteure.map(a => { const p = pos[a]; return `<g class="akteur" data-a="${E(a)}" transform="translate(${p.x - BW / 2},${p.y - BH / 2})">
          <rect class="akteur-box" width="${BW}" height="${BH}" rx="14"/><rect class="akteur-glanz" x="4" y="4" width="${BW - 8}" height="${BH / 2 - 6}" rx="10"/>
          <text class="akteur-icon" x="${BW / 2}" y="32" text-anchor="middle">${icon(a)}</text>
          <text class="akteur-name" x="${BW / 2}" y="58" text-anchor="middle">${E(a.length > 18 ? a.slice(0, 17) + '…' : a)}</text></g>`; }).join('')}
        <g class="pakete"></g><g class="blase"></g>`;
    }
    svg.innerHTML = grund();
    const spuren = svg.querySelector('.spuren'), pakete = svg.querySelector('.pakete'), blase = svg.querySelector('.blase');

    const linie = (a, b) => { const dx = b.x - a.x, dy = b.y - a.y, l = Math.hypot(dx, dy) || 1, ox = dx / l * (BW / 2 + 4), oy = dy / l * (BH / 2 + 4); return { x1: a.x + (Math.abs(dx) > Math.abs(dy) ? ox : dx / l * 10), y1: a.y + (Math.abs(dx) > Math.abs(dy) ? oy * 0.4 : oy), x2: b.x - (Math.abs(dx) > Math.abs(dy) ? ox : dx / l * 10), y2: b.y - (Math.abs(dx) > Math.abs(dy) ? oy * 0.4 : oy) }; };
    const ziele = s => (s.nach.includes('*') ? akteure.filter(a => a !== s.von) : s.nach).filter(z => pos[z] && z !== s.von);

    function zeige(k, animieren) {
      cancelAnimationFrame(raf);
      i = Math.max(-1, Math.min(g.schritte.length - 1, k));
      root.querySelectorAll('.anim-liste li').forEach(li => { const kk = +li.dataset.k; li.classList.toggle('akt', kk === i); li.classList.toggle('vorbei', kk < i); });
      svg.querySelectorAll('.akteur').forEach(el => el.classList.remove('leuchtet', 'sender', 'empfaenger'));
      blase.innerHTML = ''; pakete.innerHTML = '';
      // Spuren aller vorherigen Pakete
      spuren.innerHTML = g.schritte.slice(0, Math.max(0, i)).filter(s => s.art === 'paket').map(s => ziele(s).map(z => { const L = linie(pos[s.von], pos[z]); return `<line class="spur" x1="${L.x1}" y1="${L.y1}" x2="${L.x2}" y2="${L.y2}" marker-end="url(#pfeil)"/>`; }).join('')).join('');
      if (i < 0) { cap.innerHTML = `<span class="anim-nr">Start</span> ${n} Akteure · ${g.schritte.length} Schritte – ▶ drücken`; return; }
      const s = g.schritte[i];
      cap.innerHTML = `<span class="anim-nr">${i + 1}/${g.schritte.length}</span> ${s.art === 'paket' ? `<b>${E(s.von)} → ${E(s.nach.join(', '))}</b>: ` : s.art === 'akteur' ? `<b>${E(s.akteur)}</b>: ` : ''}${Parser.inline(s.text)}`;
      const hl = (name, cls) => { const el = svg.querySelector(`.akteur[data-a="${CSS.escape(name)}"]`); if (el) el.classList.add('leuchtet', cls); };
      if (s.art === 'akteur') {
        hl(s.akteur, 'leuchtet');
        const p = pos[s.akteur];
        if (p) {
          const txt = s.text.length > 46 ? s.text.slice(0, 45) + '…' : s.text, w = Math.min(380, txt.length * 7.2 + 24);
          const bx = Math.max(6, Math.min(W - w - 6, p.x - w / 2)), by = p.y - BH / 2 - 42 < 4 ? p.y + BH / 2 + 8 : p.y - BH / 2 - 42;
          blase.innerHTML = `<g class="sprechblase" transform="translate(${bx},${by})"><rect width="${w}" height="32" rx="10"/><text x="${w / 2}" y="21" text-anchor="middle">${E(txt.replace(/`/g, ''))}</text></g>`;
        }
      } else if (s.art === 'paket') {
        hl(s.von, 'sender'); const zs = ziele(s); zs.forEach(z => hl(z, 'empfaenger'));
        const label = (s.text.replace(/`/g, '').split(/[.:;(]/)[0] || '').slice(0, 26);
        const bahnen = zs.map(z => linie(pos[s.von], pos[z]));
        pakete.innerHTML = bahnen.map(L => `<line class="bahn" x1="${L.x1}" y1="${L.y1}" x2="${L.x2}" y2="${L.y2}"/>`).join('') +
          bahnen.map(() => `<g class="paket"><rect x="-15" y="-11" width="30" height="22" rx="5"/><path d="M-15,-11 L0,2 L15,-11" class="paket-lasche"/></g>`).join('') +
          (label ? `<text class="paket-label" x="0" y="0" text-anchor="middle">${E(label)}</text>` : '');
        const gs = [...pakete.querySelectorAll('.paket')], lab = pakete.querySelector('.paket-label');
        const dauer = 1100 / tempo, t0 = performance.now();
        const frame = now => {
          if (!aktiv || !root.isConnected) return stop();
          let t = reduziert || !animieren ? 1 : Math.min(1, (now - t0) / dauer);
          const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
          bahnen.forEach((L, k) => { const x = L.x1 + (L.x2 - L.x1) * e, y = L.y1 + (L.y2 - L.y1) * e; gs[k].setAttribute('transform', `translate(${x},${y})`); if (k === 0 && lab) { lab.setAttribute('x', x); lab.setAttribute('y', y - 18); } });
          if (t < 1) raf = requestAnimationFrame(frame);
          else gs.forEach(x => x.classList.add('angekommen'));
        };
        raf = requestAnimationFrame(frame);
      } else {
        svg.querySelectorAll('.akteur').forEach(el => el.classList.add('ruhig'));
        setTimeout(() => svg.querySelectorAll('.akteur').forEach(el => el.classList.remove('ruhig')), 600);
      }
    }
    const btnPlay = root.querySelector('[data-a="play"]');
    function plan() {
      clearTimeout(timer);
      if (!spielt) return;
      timer = setTimeout(() => {
        if (!aktiv || !root.isConnected) return stop();
        if (i >= g.schritte.length - 1) { spielt = false; btnPlay.textContent = '▶'; btnPlay.setAttribute('aria-label', 'Abspielen'); return; }
        zeige(i + 1, true); plan();
      }, (i < 0 ? 300 : 2300) / tempo);
    }
    function play() { if (i >= g.schritte.length - 1) zeige(-1); spielt = !spielt; btnPlay.textContent = spielt ? '⏸' : '▶'; btnPlay.setAttribute('aria-label', spielt ? 'Pause' : 'Abspielen'); if (spielt) { if (i < 0) zeige(0, true); plan(); } else clearTimeout(timer); }
    function stop() { aktiv = false; clearTimeout(timer); cancelAnimationFrame(raf); }
    root.querySelector('[data-a="vor"]').onclick = () => { spielt = false; btnPlay.textContent = '▶'; clearTimeout(timer); zeige(i + 1, true); };
    root.querySelector('[data-a="zurueck"]').onclick = () => { spielt = false; btnPlay.textContent = '▶'; clearTimeout(timer); zeige(i - 1, false); };
    root.querySelector('[data-a="neu"]').onclick = () => { spielt = false; clearTimeout(timer); zeige(-1); play(); };
    btnPlay.onclick = play;
    root.querySelector('.anim-tempo').onchange = e => { tempo = +e.target.value; plan(); };
    root.querySelector('[data-a="text"]').onclick = e => { const t = root.querySelector('.anim-text'); t.hidden = !t.hidden; e.target.classList.toggle('an', !t.hidden); };
    root.querySelectorAll('.anim-liste li').forEach(li => li.onclick = () => { spielt = false; btnPlay.textContent = '▶'; clearTimeout(timer); zeige(+li.dataset.k, true); });
    zeige(-1);
    return { stop, play, zeige };
  }
  return { html, binden, spieler, akteureVon };
})();
window.Anim = Anim;
