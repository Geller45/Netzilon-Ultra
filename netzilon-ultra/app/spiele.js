// Netzilon – Paket 4: sechs Lernspiele
const Spiele = (() => {
  const PORTS = [
    ['20', 'FTP-Daten'], ['21', 'FTP-Steuerung'], ['22', 'SSH / SFTP'], ['23', 'Telnet'], ['25', 'SMTP'], ['53', 'DNS'],
    ['67/68', 'DHCP'], ['69', 'TFTP'], ['80', 'HTTP'], ['88', 'Kerberos'], ['110', 'POP3'], ['123', 'NTP'],
    ['135', 'RPC Endpoint Mapper'], ['143', 'IMAP'], ['161/162', 'SNMP'], ['389', 'LDAP'], ['443', 'HTTPS'],
    ['445', 'SMB'], ['464', 'Kerberos Kennwortänderung'], ['465', 'SMTPS'], ['500', 'IKE (IPsec)'], ['514', 'Syslog'],
    ['587', 'SMTP Submission'], ['636', 'LDAPS'], ['853', 'DNS over TLS'], ['990', 'FTPS'], ['993', 'IMAPS'],
    ['995', 'POP3S'], ['1433', 'Microsoft SQL Server'], ['1701', 'L2TP'], ['1723', 'PPTP'], ['1812', 'RADIUS Authentifizierung'],
    ['3268', 'Global Catalog'], ['3306', 'MySQL'], ['3389', 'RDP'], ['4500', 'IPsec NAT-T'], ['5985', 'WinRM (HTTP)'], ['5986', 'WinRM (HTTPS)']
  ];
  let filter = '*', tasten = null;

  const rnd = n => Math.floor(Math.random() * n);
  const wahl = a => a[rnd(a.length)];
  const kurz = (s, n) => s.length > n ? s.slice(0, n - 1) + '…' : s;
  const sek = start => Math.round((Date.now() - start) / 1000);
  const docsF = () => S.docs.filter(d => filter === '*' || d.bereich === filter);
  const stat = id => { S.p.spiele = S.p.spiele || {}; return (S.p.spiele[id] = S.p.spiele[id] || { best: 0, gespielt: 0 }); };
  function melde(id, punkte) {
    const s = stat(id); s.gespielt++; s.zuletzt = punkte;
    const rekord = punkte > s.best; if (rekord) s.best = punkte;
    speichern(); ton(rekord ? 'gong' : 'gut'); return rekord;
  }
  function tick(root, ms, fn) {
    const t = setInterval(() => { if (!root.isConnected) { clearInterval(t); return; } fn(t); }, ms);
    return t;
  }
  const spaeter = (root, ms, fn) => setTimeout(() => { if (root.isConnected) fn(); }, ms);
  const taste = e => (e.key.length === 1 ? e.key.toLowerCase() : e.key);
  const leer = root => { tasten = null; root.innerHTML = '<p class="leer">Für dieses Spiel gibt es im gewählten Bereich noch nicht genug Inhalt. Wähle unter „Lernspiele“ einen anderen Bereich.</p>'; };

  function fragenPool() {
    const out = [];
    for (const d of docsF()) d.quiz.forEach((q, i) => { if (q.antworten.length >= 2) out.push({ ...q, id: d.id + '#' + i, doc: d }); });
    return out;
  }

  function ende(root, id, punkte, zeile, neustart) {
    const rekord = melde(id, punkte);
    tasten = e => { if (e.key === 'Enter') { e.preventDefault(); neustart(); } };
    root.innerHTML = `<div class="sp-ende">
      <h2>${rekord ? 'Neuer Rekord!' : 'Geschafft'}</h2>
      <div class="sp-punkte">${punkte}</div>
      <p>${zeile}</p>
      <p class="unter">Bestwert: ${stat(id).best} · gespielt: ${stat(id).gespielt}×</p>
      <div class="lesen-fuss" style="justify-content:center"><button class="glas knopf primär" id="sp-nochmal">Nochmal (Enter)</button><button class="glas knopf" data-go="spiele">Zu den Spielen</button></div>
    </div>`;
    root.querySelector('#sp-nochmal').onclick = neustart;
  }

  // ================= 1. BLITZ-QUIZ =================
  function blitz(root) {
    const pool = mischen(fragenPool());
    if (pool.length < 5) return leer(root);
    const ZEIT = 20, MAX = Math.min(40, pool.length);
    const z = { leben: 3, punkte: 0, serie: 0, beste: 0, i: 0, richtig: 0 };
    const frage = () => {
      if (z.leben <= 0 || z.i >= MAX) return ende(root, 'blitz', z.punkte, `${z.richtig} von ${z.i} richtig · längste Serie: ${z.beste}`, () => blitz(root));
      const q = pool[z.i++], ant = mischen(q.antworten);
      let rest = ZEIT, fertig = false, weiter = null, gew = false;
      root.innerHTML = `<div class="sp-hud"><span class="herz">${'♥'.repeat(z.leben)}</span><span>${z.punkte} Punkte</span><span>Serie ${z.serie}</span><span>Frage ${z.i}/${MAX}</span></div>
        <div class="sp-zeit"><i id="sp-z"></i></div>
        <div class="sp-frage">${Parser.inline(q.frage)}</div>
        <div class="antworten">${ant.map((a, i) => `<button class="glas antwort" data-i="${i}"><kbd>${i + 1}</kbd> ${Parser.inline(a.text)}</button>`).join('')}</div>
        <div class="erklaerung" id="sp-erkl" hidden></div><div class="lesen-fuss" id="sp-weiter"></div>`;
      const bar = root.querySelector('#sp-z');
      const t = tick(root, 100, () => { rest -= 0.1; bar.style.width = Math.max(0, rest / ZEIT * 100) + '%'; if (rest <= 0) antwort(-1); });
      function antwort(i) {
        if (fertig) return; fertig = true; clearInterval(t);
        const ok = !!(ant[i] && ant[i].richtig);
        root.querySelectorAll('.antwort').forEach((b, k) => { if (ant[k].richtig) b.classList.add('richtig'); else if (k === i) b.classList.add('falsch'); b.disabled = true; });
        if (ok) {
          z.punkte += 10 + Math.min(z.serie, 10) * 2 + Math.ceil(rest); z.serie++; z.richtig++; z.beste = Math.max(z.beste, z.serie);
          ton('gut'); spaeter(root, 750, frage);
        } else {
          z.leben--; z.serie = 0; ton('schlecht');
          const e = root.querySelector('#sp-erkl');
          e.hidden = false; e.innerHTML = i < 0 ? 'Zeit abgelaufen. ' + (q.erklaerung ? Parser.inline(q.erklaerung) : '') : (q.erklaerung ? Parser.inline(q.erklaerung) : 'Die richtige Antwort ist grün markiert.');
          root.querySelector('#sp-weiter').innerHTML = '<button class="glas knopf primär" id="sp-w">Weiter (Enter)</button>';
          weiter = () => { if (gew) return; gew = true; frage(); };
          root.querySelector('#sp-w').onclick = weiter;
        }
      }
      root.querySelectorAll('.antwort').forEach((b, i) => b.onclick = () => antwort(i));
      tasten = e => {
        const k = taste(e), idx = '1234'.includes(k) && k.length === 1 ? +k - 1 : 'abcd'.includes(k) && k.length === 1 ? 'abcd'.indexOf(k) : -1;
        if (idx >= 0 && idx < ant.length) { e.preventDefault(); antwort(idx); }
        else if (e.key === 'Enter' && weiter) { e.preventDefault(); weiter(); }
      };
    };
    frage();
  }

  // ================= 2. MEMORY =================
  function memory(root) {
    const pool = [], fs = new Set(), as = new Set();
    for (const d of docsF()) for (const c of d.cards) {
      if (c.f.length < 4 || c.f.length > 80 || c.a.length > 80 || c.f === c.a || fs.has(c.f) || as.has(c.a)) continue;
      fs.add(c.f); as.add(c.a); pool.push(c);
    }
    if (pool.length < 6) return leer(root);
    const set = mischen(pool).slice(0, 6);
    const tiles = mischen(set.flatMap((c, i) => [{ p: i, t: c.f, art: 'f' }, { p: i, t: c.a, art: 'a' }]));
    let offen = [], gefunden = 0, zuege = 0, sperre = false;
    const start = Date.now();
    root.innerHTML = `<div class="sp-hud"><span id="m-z">0 Züge</span><span id="m-g">0 / 6 Paare</span><span id="m-t">0 s</span></div>
      <p class="unter">Finde zu jeder Frage die passende Antwort.</p>
      <div class="memo-grid">${tiles.map((_, i) => `<button class="memo-karte zu" data-i="${i}">?</button>`).join('')}</div>`;
    const zeit = tick(root, 1000, () => { root.querySelector('#m-t').textContent = sek(start) + ' s'; });
    const zeige = (b, t, auf) => { b.className = 'memo-karte ' + (auf ? 'auf ' + (t.art === 'f' ? 'fr' : 'an') : 'zu'); b.innerHTML = auf ? Parser.inline(t.t) : '?'; };
    root.querySelectorAll('.memo-karte').forEach(b => b.onclick = () => {
      const i = +b.dataset.i, t = tiles[i];
      if (sperre || offen.includes(i) || b.classList.contains('fest')) return;
      zeige(b, t, true); ton('klick'); offen.push(i);
      if (offen.length < 2) return;
      zuege++; root.querySelector('#m-z').textContent = zuege + ' Züge';
      const [a, c] = offen.map(k => tiles[k]), bs = offen.map(k => root.querySelector(`.memo-karte[data-i="${k}"]`));
      if (a.p === c.p) {
        bs.forEach(x => x.classList.add('fest')); offen = []; gefunden++; ton('gut');
        root.querySelector('#m-g').textContent = gefunden + ' / 6 Paare';
        if (gefunden === 6) {
          clearInterval(zeit);
          const s = sek(start), punkte = Math.max(50, 1000 - (zuege - 6) * 30 - s * 3);
          spaeter(root, 700, () => ende(root, 'memory', punkte, `${zuege} Züge in ${s} Sekunden`, () => memory(root)));
        }
      } else {
        sperre = true; ton('schlecht');
        const alt = offen.slice(); offen = [];
        spaeter(root, 1000, () => { alt.forEach(k => zeige(root.querySelector(`.memo-karte[data-i="${k}"]`), tiles[k], false)); sperre = false; });
      }
    });
    tasten = null;
  }

  // ================= 3. ZUORDNEN =================
  function zuordnen(root) {
    tasten = null;
    root.innerHTML = `<p>Was möchtest du zuordnen?</p><div class="sp-wahl">
      <button class="glas knopf primär" data-m="befehle">Befehle ↔ Erklärung</button>
      <button class="glas knopf primär" data-m="ports">Ports ↔ Dienst</button></div>`;
    root.querySelectorAll('[data-m]').forEach(b => b.onclick = () => zuStart(root, b.dataset.m));
  }
  function zuStart(root, modus) {
    let paare;
    if (modus === 'ports') paare = mischen(PORTS).slice(0, 8).map(([l, r]) => ({ l, r }));
    else {
      const ls = new Set(), rs = new Set(), pool = [];
      for (const d of docsF()) for (const b of d.befehle) {
        if (b.befehl.length > 38 || b.text.length > 90 || ls.has(b.befehl) || rs.has(b.text)) continue;
        ls.add(b.befehl); rs.add(b.text); pool.push({ l: b.befehl, r: b.text });
      }
      if (pool.length < 6) return leer(root);
      paare = mischen(pool).slice(0, 8);
    }
    const links = mischen(paare.map((p, i) => ({ i, t: p.l }))), rechts = mischen(paare.map((p, i) => ({ i, t: p.r })));
    let sel = null, fehler = 0, fertig = 0;
    const start = Date.now();
    root.innerHTML = `<div class="sp-hud"><span id="z-f">0 Fehler</span><span id="z-g">0 / ${paare.length}</span><span id="z-t">0 s</span></div>
      <p class="unter">Links und rechts anklicken, was zusammengehört.</p>
      <div class="zu-spalten">
        <div class="zu-spalte">${links.map(x => `<button class="glas zu-item l" data-s="l" data-i="${x.i}">${modus === 'ports' ? E(x.t) : `<code>${E(x.t)}</code>`}</button>`).join('')}</div>
        <div class="zu-spalte">${rechts.map(x => `<button class="glas zu-item r" data-s="r" data-i="${x.i}">${modus === 'ports' ? E(x.t) : Parser.inline(x.t)}</button>`).join('')}</div>
      </div>`;
    const zeit = tick(root, 1000, () => { root.querySelector('#z-t').textContent = sek(start) + ' s'; });
    root.querySelectorAll('.zu-item').forEach(b => b.onclick = () => {
      if (b.classList.contains('fest')) return;
      if (!sel || sel.dataset.s === b.dataset.s) {
        if (sel) sel.classList.remove('sel');
        sel = b; b.classList.add('sel'); ton('klick'); return;
      }
      const a = sel; a.classList.remove('sel'); sel = null;
      if (a.dataset.i === b.dataset.i) {
        a.classList.add('fest'); b.classList.add('fest'); fertig++; ton('gut');
        root.querySelector('#z-g').textContent = `${fertig} / ${paare.length}`;
        if (fertig === paare.length) {
          clearInterval(zeit);
          const s = sek(start), punkte = Math.max(50, 800 - fehler * 60 - s * 3);
          spaeter(root, 600, () => ende(root, 'zuordnen', punkte, `${fehler} Fehler in ${s} Sekunden`, () => zuordnen(root)));
        }
      } else {
        fehler++; ton('schlecht'); root.querySelector('#z-f').textContent = fehler + ' Fehler';
        [a, b].forEach(x => { x.classList.remove('shake'); void x.offsetWidth; x.classList.add('shake'); });
      }
    });
  }

  // ================= 4. WAHR ODER FALSCH =================
  function wf(root) {
    const pool = fragenPool().filter(q => q.antworten.some(a => a.richtig) && q.antworten.some(a => !a.richtig));
    if (pool.length < 8) return leer(root);
    let reihe = mischen(pool), pos = 0;
    const z = { zeit: 60, punkte: 0, serie: 0, richtig: 0, gesamt: 0, sperre: false, aus: null, fertig: false };
    root.innerHTML = `<div class="sp-hud"><span id="w-zeit"></span><span id="w-pkt"></span><span id="w-serie"></span></div>
      <div class="sp-zeit"><i id="w-bar"></i></div>
      <div id="w-karte"></div>
      <div class="tf-knoepfe"><button class="glas knopf tf-f" data-w="0">✗ Falsch <kbd>←</kbd></button><button class="glas knopf tf-w" data-w="1">✓ Wahr <kbd>→</kbd></button></div>
      <div class="erklaerung" id="w-fb" style="min-height:28px;margin-top:14px"></div>`;
    const hud = () => {
      root.querySelector('#w-zeit').textContent = Math.max(0, Math.ceil(z.zeit)) + ' s';
      root.querySelector('#w-pkt').textContent = z.punkte + ' Punkte';
      root.querySelector('#w-serie').textContent = 'Serie ' + z.serie;
      root.querySelector('#w-bar').style.width = Math.max(0, z.zeit / 60 * 100) + '%';
    };
    const neu = () => {
      if (pos >= reihe.length) { reihe = mischen(pool); pos = 0; }
      const q = reihe[pos++], wahr = Math.random() < 0.5;
      const a = wahl(q.antworten.filter(x => !!x.richtig === wahr));
      z.aus = { q, a, wahr };
      root.querySelector('#w-karte').innerHTML = `<div class="tf-karte"><div class="sp-frage" style="margin:0">${Parser.inline(q.frage)}</div><div class="aus">→ ${Parser.inline(a.text)}</div></div>`;
    };
    const antwort = w => {
      if (z.sperre || z.fertig || !z.aus) return;
      z.sperre = true; z.gesamt++;
      const ok = w === z.aus.wahr, fb = root.querySelector('#w-fb');
      if (ok) { z.punkte += 10 + Math.min(z.serie, 10); z.serie++; z.richtig++; ton('gut'); fb.innerHTML = '<span class="fb-ok">✓ Richtig</span>'; }
      else {
        z.serie = 0; z.zeit -= 5; ton('schlecht');
        const r = z.aus.q.antworten.find(x => x.richtig);
        fb.innerHTML = `<span class="fb-nein">✗ −5 s.</span> ${z.aus.wahr ? 'Die Aussage war <b>wahr</b>.' : 'Die Aussage war <b>falsch</b>. Richtig: ' + Parser.inline(r.text)}`;
      }
      hud();
      spaeter(root, ok ? 300 : 1500, () => { if (z.fertig) return; z.sperre = false; fb.innerHTML = ''; neu(); });
    };
    const t = tick(root, 100, () => {
      z.zeit -= 0.1; hud();
      if (z.zeit <= 0) {
        z.fertig = true; clearInterval(t);
        ende(root, 'wf', z.punkte, `${z.richtig} von ${z.gesamt} richtig`, () => wf(root));
      }
    });
    root.querySelectorAll('[data-w]').forEach(b => b.onclick = () => antwort(b.dataset.w === '1'));
    tasten = e => {
      const k = taste(e);
      if (['ArrowRight', 'j', 'w'].includes(k)) { e.preventDefault(); antwort(true); }
      else if (['ArrowLeft', 'n', 'f'].includes(k)) { e.preventDefault(); antwort(false); }
    };
    hud(); neu();
  }

  // ================= 5. RECHEN-SPRINT =================
  const ip2n = ip => ip.split('.').reduce((a, b) => a * 256 + +b, 0);
  const n2ip = n => [24, 16, 8, 0].map(s => Math.floor(n / 2 ** s) % 256).join('.');
  const maske = c => (c === 0 ? 0 : (0xFFFFFFFF << (32 - c)) >>> 0);
  const ohneNull = s => s.replace(/\s/g, '').replace(/^0+(?=.)/, '');

  function aufgZahl() {
    const t = rnd(5), n = 1 + rnd(255), bin8 = x => x.toString(2).padStart(8, '0');
    if (t === 0) return { f: `Dezimal ${n} als 8-Bit-Dualzahl?`, l: bin8(n), ok: s => ohneNull(s) === ohneNull(bin8(n)) };
    if (t === 1) return { f: `Dual ${bin8(n)} als Dezimalzahl?`, l: String(n), ok: s => s.trim() === String(n) };
    if (t === 2) { const h = n.toString(16).toUpperCase(); return { f: `Dezimal ${n} als Hexadezimalzahl?`, l: h, ok: s => ohneNull(s.replace(/^0x/i, '')).toUpperCase() === ohneNull(h) }; }
    if (t === 3) { const h = n.toString(16).toUpperCase(); return { f: `Hex ${h} als Dezimalzahl?`, l: String(n), ok: s => s.trim() === String(n) }; }
    const k = 1 + rnd(127), zk = bin8(256 - k);
    return { f: `−${k} als 8-Bit-Zweierkomplement?`, l: zk, ok: s => s.replace(/\s/g, '') === zk };
  }
  function aufgSubnetz() {
    const c = 20 + rnd(11), b = wahl([[192, 168], [10, rnd(256)], [172, 16 + rnd(16)]]);
    const ip = `${b[0]}.${b[1]}.${rnd(256)}.${1 + rnd(254)}`, m = maske(c), n = ip2n(ip);
    const net = (n & m) >>> 0, bc = (net | (~m >>> 0)) >>> 0, ipOk = l => s => s.replace(/\s/g, '') === l;
    const t = rnd(7);
    if (t === 0) return { f: `Netzadresse von ${ip}/${c}?`, l: n2ip(net), ok: ipOk(n2ip(net)) };
    if (t === 1) return { f: `Broadcast-Adresse von ${ip}/${c}?`, l: n2ip(bc), ok: ipOk(n2ip(bc)) };
    if (t === 2) return { f: `Erste nutzbare Hostadresse von ${ip}/${c}?`, l: n2ip(net + 1), ok: ipOk(n2ip(net + 1)) };
    if (t === 3) return { f: `Letzte nutzbare Hostadresse von ${ip}/${c}?`, l: n2ip(bc - 1), ok: ipOk(n2ip(bc - 1)) };
    if (t === 4) { const h = 2 ** (32 - c) - 2; return { f: `Wie viele nutzbare Hosts hat ein /${c}-Netz?`, l: String(h), ok: s => s.replace(/\s/g, '') === String(h) }; }
    if (t === 5) return { f: `Subnetzmaske zu /${c}?`, l: n2ip(m), ok: ipOk(n2ip(m)) };
    return { f: `CIDR-Präfix zur Maske ${n2ip(m)}?`, l: '/' + c, ok: s => s.trim().replace(/^\//, '') === String(c) };
  }
  function rechnen(root) {
    tasten = null;
    root.innerHTML = `<p>Welche Aufgaben?</p><div class="sp-wahl">
      <button class="glas knopf primär" data-m="zahlen">Zahlensysteme</button>
      <button class="glas knopf primär" data-m="subnetz">Subnetting</button>
      <button class="glas knopf primär" data-m="mix">Gemischt</button></div>
      <p class="unter">10 Aufgaben, du tippst die Antwort. Punkte: 100 pro richtige Antwort, minus 2 pro Sekunde.</p>`;
    root.querySelectorAll('[data-m]').forEach(b => b.onclick = () => rechnenStart(root, b.dataset.m));
  }
  function rechnenStart(root, modus) {
    const N = 10, start = Date.now();
    let i = 0, richtig = 0, geprueft = false, a = null;
    const gen = () => modus === 'zahlen' ? aufgZahl() : modus === 'subnetz' ? aufgSubnetz() : (Math.random() < 0.5 ? aufgZahl() : aufgSubnetz());
    const zeit = tick(root, 1000, () => { const el = root.querySelector('#r-zeit'); if (el) el.textContent = sek(start) + ' s'; });
    const weiter = () => {
      if (i >= N) {
        clearInterval(zeit);
        const s = sek(start), punkte = Math.max(0, richtig * 100 - s * 2);
        return ende(root, 'rechnen', punkte, `${richtig} von ${N} richtig in ${s} Sekunden`, () => rechnen(root));
      }
      a = gen(); i++; geprueft = false;
      root.innerHTML = `<div class="sp-hud"><span>Aufgabe ${i}/${N}</span><span>${richtig} richtig</span><span id="r-zeit">${sek(start)} s</span></div>
        <div class="sp-frage">${E(a.f)}</div>
        <input type="text" id="r-in" autocomplete="off" spellcheck="false" placeholder="Antwort, dann Enter">
        <div class="erklaerung" id="r-fb" style="min-height:28px;margin-top:12px"></div>
        <div class="lesen-fuss"><button class="glas knopf primär" id="r-ok">Prüfen (Enter)</button></div>`;
      const inp = root.querySelector('#r-in'), btn = root.querySelector('#r-ok');
      const aktion = () => {
        if (geprueft) return weiter();
        geprueft = true; const ok = a.ok(inp.value); inp.readOnly = true;
        if (ok) { richtig++; ton('gut'); root.querySelector('#r-fb').innerHTML = '<span class="fb-ok">✓ Richtig</span>'; }
        else { ton('schlecht'); root.querySelector('#r-fb').innerHTML = `<span class="fb-nein">✗ Falsch.</span> Lösung: <code>${E(a.l)}</code>`; }
        btn.textContent = i >= N ? 'Ergebnis (Enter)' : 'Weiter (Enter)';
      };
      btn.onclick = aktion;
      inp.onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); aktion(); } };
      inp.focus();
    };
    weiter();
  }

  // ================= 6. LAB-REIHENFOLGE =================
  function labs(root) {
    const kand = [];
    for (const d of docsF()) {
      const gruppen = {};
      for (const s of d.labSchritte || []) (gruppen[s.teil] = gruppen[s.teil] || []).push(s.text);
      for (const [teil, steps] of Object.entries(gruppen)) if (steps.length >= 5) kand.push({ d, teil, steps });
    }
    if (!kand.length) return leer(root);
    const k = wahl(kand), n = Math.min(6, k.steps.length), von = rnd(k.steps.length - n + 1);
    const orig = k.steps.slice(von, von + n).map((t, i) => ({ i, t: kurz(t, 220) }));
    let karten = mischen(orig);
    for (let v = 0; v < 6 && karten.every((x, j) => x.i === j); v++) karten = mischen(orig);
    let naechst = 0, fehler = 0;
    tasten = null;
    root.innerHTML = `<div class="sp-hud"><span>${E(k.d.titel)}</span><span>${E(k.teil)}</span><span id="l-f">0 Fehler</span></div>
      <p class="unter">Diese Schritte sind durcheinander geraten. Klicke sie in der richtigen Reihenfolge an, beginnend mit Schritt 1.</p>
      <div class="lab-liste">${karten.map(x => `<button class="glas lab-schritt" data-i="${x.i}"><span class="nr">·</span><span>${Parser.inline(x.t)}</span></button>`).join('')}</div>`;
    root.querySelectorAll('.lab-schritt').forEach(b => b.onclick = () => {
      if (b.classList.contains('fest')) return;
      if (+b.dataset.i === naechst) {
        b.classList.add('fest'); b.querySelector('.nr').textContent = (naechst + 1) + '.'; naechst++; ton('gut');
        if (naechst === n) {
          const punkte = Math.max(0, n * 100 - fehler * 50);
          spaeter(root, 800, () => ende(root, 'labs', punkte, `${fehler} Fehler bei ${n} Schritten · ${E(k.d.titel)}`, () => labs(root)));
        }
      } else {
        fehler++; ton('schlecht'); root.querySelector('#l-f').textContent = fehler + ' Fehler';
        b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake');
      }
    });
  }

  // ================= Übersicht + Spielansicht =================
  const SPIELE = [
    { id: 'blitz', name: 'Blitz-Quiz', sub: '3 Leben, 20 s pro Frage, Serien-Bonus', hilfe: 'Antworte schnell und richtig. Tasten 1–4 oder A–D. Falsch oder zu langsam kostet ein Leben.', start: blitz },
    { id: 'memory', name: 'Memory', sub: 'Karteikarten-Fragen und Antworten paaren', hilfe: 'Decke zwei Karten auf: Frage und passende Antwort ergeben ein Paar. Wenige Züge bringen viele Punkte.', start: memory },
    { id: 'zuordnen', name: 'Zuordnen', sub: 'Befehle oder Ports mit Erklärung verbinden', hilfe: 'Klicke links einen Eintrag und rechts den passenden. Fehler und Zeit kosten Punkte.', start: zuordnen },
    { id: 'wf', name: 'Wahr oder Falsch', sub: '60 Sekunden, jede Frage eine Aussage', hilfe: 'Stimmt die Antwort zur Frage? Pfeiltasten links/rechts. Ein Fehler kostet 5 Sekunden.', start: wf },
    { id: 'rechnen', name: 'Rechen-Sprint', sub: 'Dual, Hex, Zweierkomplement, Subnetting', hilfe: 'Rechne im Kopf oder auf Papier und tippe das Ergebnis. Enter prüft und geht weiter.', start: rechnen },
    { id: 'labs', name: 'Lab-Reihenfolge', sub: 'Durcheinandergeratene Lab-Schritte sortieren', hilfe: 'Klicke die Schritte in der richtigen Reihenfolge an. Falsche Klicks kosten Punkte.', start: labs }
  ];

  function spiele() {
    tasten = null;
    krumen([{ txt: 'Stundenplan', go: 'home' }, { txt: 'Lernspiele' }]);
    $('#inhalt').innerHTML = `<h1>Lernspiele</h1>
      <p class="unter">Sechs Spiele mit deinem Lernstoff. Bereich für Fragen, Karten und Befehle: <select class="sp-select" id="sp-filter"><option value="*">Alle Bereiche</option>${BEREICHE.filter(b => docsIn(b.key).length).map(b => `<option value="${E(b.key)}" ${filter === b.key ? 'selected' : ''}>${E(b.name)}</option>`).join('')}</select></p>
      <div class="pausenbrett">${SPIELE.map(s => `<button class="glas aktion" data-sp="${s.id}"><b>${E(s.name)}</b><span>${E(s.sub)}</span><em class="best">Bestwert: ${stat(s.id).best} · ${stat(s.id).gespielt}× gespielt</em></button>`).join('')}</div>`;
    $('#sp-filter').onchange = e => { filter = e.target.value; ton('kreide'); spiele(); };
    document.querySelectorAll('[data-sp]').forEach(b => b.onclick = () => gehe('spiel', b.dataset.sp));
  }
  function spiel(id) {
    const s = SPIELE.find(x => x.id === id);
    if (!s) return spiele();
    tasten = null;
    krumen([{ txt: 'Stundenplan', go: 'home' }, { txt: 'Lernspiele', go: 'spiele' }, { txt: s.name }]);
    $('#inhalt').innerHTML = `<h1>${E(s.name)}</h1><p class="unter">${E(s.hilfe)}${filter !== '*' ? ` · Bereich: ${E(filter)}` : ''}</p><div id="sp-root"></div>`;
    s.start($('#sp-root'));
  }

  document.addEventListener('keydown', e => {
    if (!tasten || !S.ansicht || S.ansicht.ansicht !== 'spiel') return;
    if (e.target.matches && e.target.matches('input,select,textarea')) return;
    tasten(e);
  });

  window.VIEWS = Object.assign(window.VIEWS || {}, { spiele, spiel });
  return { stat, aufgZahl, aufgSubnetz, anzahl: () => SPIELE.length };
})();
window.Spiele = Spiele;
