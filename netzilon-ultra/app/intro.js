// Netzilon – Paket 5: Start-Intro (Matrix, Admin vs. Linux, GPProductions-Würfel)
const Intro = (() => {
  function play(darfSkip) {
    return new Promise(resolve => {
      const ov = document.createElement('div');
      ov.id = 'intro';
      ov.innerHTML = `<canvas></canvas><canvas></canvas>
        <div class="intro-titel">NETZILON</div>
        <div class="gp"><div class="wuerfel">${['GP', 'GP', 'NET', 'ZI', 'LON', '⌘'].map((t, i) => `<div class="seite s${i}">${t}</div>`).join('')}</div>
          <div class="gp-name">GPProductions</div><div class="gp-sub">präsentiert</div></div>
        ${darfSkip ? '<div class="intro-skip">Überspringen: Klick · Leertaste · Esc</div>' : ''}`;
      document.body.appendChild(ov);
      const [cv, cv2] = ov.querySelectorAll('canvas'), m = cv.getContext('2d'), c = cv2.getContext('2d');
      let W, H; const fit = () => { W = cv.width = cv2.width = innerWidth; H = cv.height = cv2.height = innerHeight; }; fit(); addEventListener('resize', fit);
      const zeichen = '01アイウエオ10.168.192NETZILON$#>_ipconfig';
      let spalten = []; const fs = 16;
      const t0 = performance.now(); let raf, fertig = false, tasten = [], getroffen = 0;
      const ende = () => {
        if (fertig) return; fertig = true; cancelAnimationFrame(raf);
        removeEventListener('resize', fit); removeEventListener('keydown', key);
        ov.classList.add('weg'); setTimeout(() => { ov.remove(); resolve(); }, 600);
      };
      const key = e => { if (darfSkip && [' ', 'Escape', 'Enter'].includes(e.key)) { e.preventDefault(); ende(); } };
      if (darfSkip) { ov.addEventListener('click', ende); addEventListener('keydown', key); }

      function figur(x, y, farbe, pose, t, dir) {
        c.save(); c.translate(x, y); c.scale(dir, 1);
        c.strokeStyle = farbe; c.lineWidth = 5; c.lineCap = 'round'; c.shadowColor = farbe; c.shadowBlur = 12;
        const s = Math.sin(t * 14);
        const bein = pose === 'lauf' ? s * 0.7 : pose === 'fall' ? 1.2 : 0.25;
        c.beginPath(); c.arc(0, -78, 13, 0, 7); c.stroke();
        c.beginPath(); c.moveTo(0, -64); c.lineTo(0, -28);
        c.moveTo(0, -28); c.lineTo(Math.sin(bein) * 26, 0); c.moveTo(0, -28); c.lineTo(-Math.sin(bein) * 26, 0);
        c.moveTo(0, -56); c.lineTo(-20, -40 - (pose === 'lauf' ? s * 8 : 0));
        c.stroke(); c.restore();
      }
      function arm(x, y, winkel, farbe) { // Schlag-Arm + Tastatur
        c.save(); c.translate(x, y - 56); c.rotate(winkel);
        c.strokeStyle = farbe; c.lineWidth = 5; c.lineCap = 'round'; c.shadowColor = farbe; c.shadowBlur = 12;
        c.beginPath(); c.moveTo(0, 0); c.lineTo(30, 0); c.stroke();
        c.shadowBlur = 0; c.fillStyle = '#2b2f36'; c.strokeStyle = '#9fc9ef'; c.lineWidth = 2;
        c.fillRect(26, -10, 70, 22); c.strokeRect(26, -10, 70, 22);
        c.fillStyle = '#cfd8e3';
        for (let r = 0; r < 3; r++) for (let k = 0; k < 9; k++) if (!(r === 1 && k < getroffen * 3)) c.fillRect(29 + k * 7.4, -7 + r * 6.5, 5, 4.5);
        c.restore();
      }
      function blase(x, y, txt, farbe) {
        c.save(); c.font = 'bold 22px "JetBrains Mono", Consolas, monospace';
        const w = c.measureText(txt).width + 28;
        c.fillStyle = 'rgba(0,0,0,.75)'; c.strokeStyle = farbe; c.lineWidth = 2;
        c.beginPath(); c.roundRect(x - w / 2, y - 44, w, 38, 10); c.fill(); c.stroke();
        c.fillStyle = farbe; c.textAlign = 'center'; c.fillText(txt, x, y - 18); c.restore();
      }
      function tastenFliegen(x, y) {
        const b = 'QWERTZASDFGHYXCVB';
        for (let i = 0; i < 9; i++) tasten.push({ x, y, vx: 2 + Math.random() * 7, vy: -6 - Math.random() * 7, r: Math.random() * 6, vr: (Math.random() - .5) * .5, ch: b[Math.random() * b.length | 0] });
        window.ton?.('schlecht');
      }

      function frame(now) {
        const t = (now - t0) / 1000;
        // Matrix
        if (spalten.length !== Math.ceil(W / fs)) spalten = Array.from({ length: Math.ceil(W / fs) }, () => Math.random() * -50);
        m.fillStyle = 'rgba(4,12,8,.16)'; m.fillRect(0, 0, W, H);
        m.font = fs + 'px "JetBrains Mono", Consolas, monospace';
        spalten.forEach((y, i) => {
          m.fillStyle = Math.random() < .03 ? '#e8fff0' : '#2fdc7a';
          m.fillText(zeichen[Math.random() * zeichen.length | 0], i * fs, y * fs);
          spalten[i] = y * fs > H && Math.random() > .975 ? 0 : y + 1;
        });
        c.clearRect(0, 0, W, H);
        // Netzwerk-Linien
        c.strokeStyle = 'rgba(159,201,239,.10)'; c.lineWidth = 1;
        for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(0, H * (i + 1) / 7); c.lineTo(W, H * (i + 1) / 7 + Math.sin(t + i) * 30); c.stroke(); }

        const boden = H * 0.72, mitte = W / 2;
        c.fillStyle = 'rgba(4,12,8,.8)'; c.fillRect(0, boden + 4, W, 3);
        if (t > 1 && t < 5.4) {
          const rein = Math.min(1, (t - 1) / 0.9);
          let ax = mitte - 420 + rein * 180, lx = mitte + 420 - rein * 180, lpose = rein < 1 ? 'lauf' : 'steh', ly = boden, ldir = -1;
          let apose = rein < 1 ? 'lauf' : 'steh', winkel = -2.2;
          if (t > 3.1) { // Angriff
            const a = Math.min(1, (t - 3.1) / 0.35); ax = mitte - 240 + a * 150; apose = a < 1 ? 'lauf' : 'steh';
            if (t > 3.45) {
              const phase = ((t - 3.45) / 0.3) % 1, schlag = Math.floor((t - 3.45) / 0.3);
              winkel = -2.4 + phase * 2.6;
              if (schlag < 3 && schlag >= getroffen && phase > 0.6) { getroffen = schlag + 1; tastenFliegen(ax + 80, boden - 56); }
            }
          }
          if (getroffen >= 3 && t > 4.35) { // Linux fliegt weg
            const f = t - 4.35; lx += f * 700; ly = boden - f * 520 + f * f * 900; lpose = 'fall';
          }
          figur(lx, ly, '#f5a66b', lpose, t, ldir);
          if (lpose !== 'fall') { c.save(); c.fillStyle = '#111'; c.strokeStyle = '#f5a66b'; c.lineWidth = 2; c.beginPath(); c.ellipse(lx + 22, boden - 60, 9, 12, 0, 0, 7); c.fill(); c.stroke(); c.fillStyle = '#f3d86a'; c.fillRect(lx + 18, boden - 50, 8, 3); c.restore(); }
          figur(ax, boden, '#9fc9ef', apose, t, 1);
          arm(ax, boden, winkel, '#9fc9ef');
          if (t > 1.9 && t < 3.1) blase(lx, boden - 100, 'sudo apt install', '#f5a66b');
          if (t > 2.5 && t < 4.4) blase(ax, boden - 100, 'FÜR KLICKI!', '#9fc9ef');
          c.save(); c.font = '600 15px "Atkinson Hyperlegible", sans-serif'; c.textAlign = 'center';
          c.fillStyle = '#9fc9ef'; c.fillText('Domänen-Admin', ax, boden + 28);
          if (lpose !== 'fall') { c.fillStyle = '#f5a66b'; c.fillText('Linux-User', lx, boden + 28); }
          c.restore();
        }
        // fliegende Tasten
        c.font = 'bold 12px Consolas, monospace'; c.textAlign = 'center';
        tasten.forEach(k => {
          k.x += k.vx; k.y += k.vy; k.vy += 0.35; k.r += k.vr;
          c.save(); c.translate(k.x, k.y); c.rotate(k.r); c.fillStyle = '#cfd8e3'; c.fillRect(-9, -9, 18, 18);
          c.fillStyle = '#2b2f36'; c.fillText(k.ch, 0, 4); c.restore();
        });
        tasten = tasten.filter(k => k.y < H + 40);
        ov.classList.toggle('titel-an', t > 0.2 && t < 5.4);
        ov.classList.toggle('gp-an', t > 5.4);
        if (t > 5.4 && !ov._gong) { ov._gong = 1; window.ton?.('gong'); }
        if (t > 9) return ende();
        raf = requestAnimationFrame(frame);
      }
      m.fillStyle = '#040c08'; m.fillRect(0, 0, W, H);
      raf = requestAnimationFrame(frame);
    });
  }
  return { play };
})();
