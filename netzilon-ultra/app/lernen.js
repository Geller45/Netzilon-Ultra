// Netzilon Ultra – Karteikarten (SM-2), Quiz (alle Aufgabenarten), Prüfungsmodus mit IHK-Zeitlimits und
// IHK-Probeprüfungen, Labs, Statistik
const heute = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const plusTage = n => { const d = new Date(); d.setDate(d.getDate() + Math.round(n)); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const mischen = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const IHK = [[92, 1, 'sehr gut'], [81, 2, 'gut'], [67, 3, 'befriedigend'], [50, 4, 'ausreichend'], [30, 5, 'mangelhaft'], [0, 6, 'ungenügend']];
const note = pz => IHK.find(n => pz >= n[0]);
const PRUEF_TAGS = ['AP1', 'AP2', 'WiSo', 'LPIC-1', 'CCNA', 'AZ-800', 'AZ-801', 'DP-203', 'Schule'];
const passtZuTag = (d, tag) => !tag || d.pruefungen.includes(tag) || d.bereich === tag || (tag === 'DP-203' && d.bereich === 'Azure Data') || (tag === 'LPIC-1' && d.bereich === 'Linux' && !d.pruefungen.length) || (tag === 'CCNA' && d.bereich === 'CCNA');
const ZEITLIMITS = [
  { key: 'frage', name: 'Sekunden pro Aufgabe', min: 0 },
  { key: 'ap1', name: 'AP1 – 90 min', min: 90 },
  { key: 'ap2', name: 'AP2 – je Prüfungsbereich 90 min', min: 90 },
  { key: 'wiso', name: 'WiSo – 60 min', min: 60 },
  { key: 'zert', name: 'Zertifikat – 120 min', min: 120 },
  { key: 'aus', name: 'Ohne Zeitlimit', min: -1 }
];

const Lernen = (() => {
  // ---------- Hilfen ----------
  function alleKarten(filter) {
    const out = [];
    for (const d of S.docs) {
      if (filter && !filter(d)) continue;
      d.cards.forEach((c, i) => out.push({ id: d.id + '#' + i, doc: d, f: c.f, a: c.a }));
    }
    return out;
  }
  function tagCheck() { if (S.p.kartenTag.datum !== heute()) S.p.kartenTag = { datum: heute(), neu: 0, wdh: 0 }; }
  const faelligAnzahl = () => Object.entries(S.p.karten).filter(([id, k]) => k.due <= heute() && S.byId[id.split('#')[0]]).length;
  const neuHeute = () => { tagCheck(); return Math.max(0, S.p.lernen.neuProTag - S.p.kartenTag.neu); };

  // ---------- Filterauswahl (Bereich/Kapitel) ----------
  function auswahlHtml(name) {
    return `<div class="auswahl" id="${name}">
      ${BEREICHE.filter(b => docsIn(b.key).length).map(b => `
        <details class="abschnitt"><summary><label class="sum-label"><input type="checkbox" class="b-alle" data-b="${E(b.key)}" checked> ${E(b.name)} <small>(${docsIn(b.key).length})</small></label></summary>
        <div class="text kap-liste">${kapitelVon(b.key).map(k => `<label><input type="checkbox" class="k" data-b="${E(b.key)}" data-k="${E(k)}" checked> ${E(k || '(ohne Kapitel)')}</label>`).join('')}</div></details>`).join('')}
    </div>`;
  }
  function auswahlBinden(name) {
    const root = document.getElementById(name);
    root.querySelectorAll('.sum-label').forEach(l => l.addEventListener('click', e => { e.stopPropagation(); if (e.target.tagName !== 'INPUT') { e.preventDefault(); const i = l.querySelector('input'); i.checked = !i.checked; i.dispatchEvent(new Event('change')); } }));
    root.querySelectorAll('.b-alle').forEach(b => b.onchange = () => root.querySelectorAll(`.k[data-b="${CSS.escape(b.dataset.b)}"]`).forEach(k => k.checked = b.checked));
    root.querySelectorAll('.k').forEach(k => k.onchange = () => {
      const alle = root.querySelectorAll(`.k[data-b="${CSS.escape(k.dataset.b)}"]`);
      root.querySelector(`.b-alle[data-b="${CSS.escape(k.dataset.b)}"]`).checked = [...alle].some(x => x.checked);
    });
    return () => { const set = new Set([...root.querySelectorAll('.k:checked')].map(k => k.dataset.b + '||' + k.dataset.k)); return d => set.has(d.bereich + '||' + d.kapitel); };
  }
  function alleAus(name, an) { document.querySelectorAll(`#${name} input`).forEach(i => i.checked = an); }
  function schalterBinden(id, cb) { document.querySelectorAll(`#${id} button`).forEach(b => b.onclick = () => { document.querySelectorAll(`#${id} button`).forEach(x => x.classList.remove('an')); b.classList.add('an'); cb(b.dataset); }); }

  // ---------- SM-2 ----------
  function vorschau(k, q) {
    const L = S.p.lernen, ef = k ? k.ef : 2.5, iv = k ? k.iv : 0, rep = k ? k.rep : 0;
    if (q === 0) return 0;
    if (q === 1) return Math.max(1, Math.round(iv * 1.2 * L.faktor) || 1);
    let n = rep === 0 ? 1 : rep === 1 ? L.zweites : Math.round(iv * ef * L.faktor);
    if (q === 3) n = Math.round((rep === 0 ? 3 : n * 1.3));
    return Math.max(1, n);
  }
  function bewerten(id, q) { // 0 Nochmal, 1 Schwer, 2 Gut, 3 Leicht
    const alt = S.p.karten[id];
    const k = alt ? { ...alt } : { ef: 2.5, iv: 0, rep: 0, lapses: 0, neu: true };
    const tage = vorschau(alt, q);
    if (q === 0) { k.rep = 0; k.iv = 0; k.lapses++; k.ef = Math.max(1.3, k.ef - 0.2); }
    else {
      k.iv = tage; k.rep++;
      k.ef = Math.max(1.3, k.ef + (q === 1 ? -0.15 : q === 3 ? 0.15 : 0));
    }
    k.due = plusTage(tage); k.zuletzt = heute(); delete k.neu;
    S.p.karten[id] = k; speichern();
  }
  const tageTxt = n => n === 0 ? '< 10 min' : n === 1 ? '1 Tag' : n < 31 ? `${n} Tage` : n < 365 ? `${Math.round(n / 30)} Mon.` : `${(n / 365).toFixed(1)} J.`;

  function karteikarten(param) {
    krumen([START, { txt: 'Karteikarten' }]);
    tagCheck();
    $('#inhalt').innerHTML = `<h1>Karteikarten</h1>
      <p class="unter">${faelligAnzahl()} fällig · ${neuHeute()} neue heute möglich · ${Object.keys(S.p.karten).length} von ${alleKarten().length} Karten gelernt. Prinzip wie Anki (SM-2). Am iPhone: tippen = umdrehen, wischen ← Nochmal · → Gut · ↑ Leicht · ↓ Schwer.</p>
      <div class="einst-zeile"><div>Prüfung/Ziel</div><div class="schalter wrap" id="kk-tag"><button data-t="" class="an">Alle</button>${PRUEF_TAGS.map(t => `<button data-t="${t}">${t}</button>`).join('')}</div></div>
      <div class="lesen-fuss"><button class="glas knopf primär" id="kk-start">Lernen starten</button><button class="glas knopf" id="kk-an">Alle</button><button class="glas knopf" id="kk-aus">Keine</button></div>
      ${auswahlHtml('kk-aus-w')}`;
    const filter = auswahlBinden('kk-aus-w');
    let tag = '';
    schalterBinden('kk-tag', ds => tag = ds.t);
    $('#kk-an').onclick = () => alleAus('kk-aus-w', true); $('#kk-aus').onclick = () => alleAus('kk-aus-w', false);
    const starten = (nurDoc) => {
      const f = filter(), karten = alleKarten(d => (nurDoc ? d.id === nurDoc : f(d) && passtZuTag(d, tag))), L = S.p.lernen;
      const faellig = mischen(karten.filter(k => S.p.karten[k.id] && S.p.karten[k.id].due <= heute())).slice(0, Math.max(0, L.maxWdh - (S.p.kartenTag.wdh || 0)));
      const neu = karten.filter(k => !S.p.karten[k.id]).slice(0, nurDoc ? 999 : neuHeute());
      const stapel = [...faellig, ...neu];
      if (!stapel.length) { toast('Heute nichts fällig in dieser Auswahl. 🎉'); return; }
      sitzung(stapel);
    };
    $('#kk-start').onclick = () => starten();
    if (param && S.byId[param]) starten(param);
  }
  function sitzung(stapel) {
    let pos = 0, umgedreht = false, stats = { gut: 0, nochmal: 0 };
    const zeigen = () => {
      if (pos >= stapel.length) {
        ton('gong'); taste = null;
        $('#inhalt').innerHTML = `<div class="ergebnis"><h1>Fertig für heute!</h1><p class="unter">${stats.gut} gewusst · ${stats.nochmal}× nochmal</p><div class="lesen-fuss"><button class="glas knopf primär" data-go="home">Zur Startseite</button><button class="glas knopf" data-go="quiz" data-param="uebung">Weiter mit Quiz</button></div></div>`;
        melde('kartenSitzung');
        return;
      }
      const k = stapel[pos], st = S.p.karten[k.id];
      umgedreht = false;
      $('#inhalt').innerHTML = `<div class="lern-karte-wrap">
        <p class="unter">${pos + 1} / ${stapel.length} · ${st ? 'Wiederholung' : 'Neu'} · <a class="verweis" data-go="lesen" data-param="${E(k.doc.id)}">${E(k.doc.titel)}</a></p>
        <div class="quiz-fortschritt"><i style="width:${pos / stapel.length * 100}%"></i></div>
        <button class="lern-karte" id="lk"><div class="innen"><div class="seite">${Parser.inline(k.f)}</div><div class="seite rück">${Parser.inline(k.a)}</div></div></button>
        <div class="bewerten" id="bw" hidden>
          ${['Nochmal', 'Schwer', 'Gut', 'Leicht'].map((n, q) => `<button class="glas knopf bw${q}" data-q="${q}">${n}<small>${tageTxt(vorschau(st, q))}</small><kbd>${q + 1}</kbd></button>`).join('')}
        </div>
        <p class="tipp">Leertaste = umdrehen · 1–4 = bewerten · Wischen: ← Nochmal · → Gut · ↑ Leicht · ↓ Schwer</p></div>`;
      $('#lk').onclick = () => { if (!$('#lk')._wisch) drehen(); };
      $$('#bw button').forEach(b => b.onclick = () => bew(+b.dataset.q));
      wischen($('#lk'));
    };
    const drehen = () => { umgedreht = !umgedreht; $('#lk').classList.toggle('dreh', umgedreht); $('#bw').hidden = false; ton('kreide'); };
    const bew = q => {
      if (!umgedreht) { drehen(); return; }
      const k = stapel[pos], warNeu = !S.p.karten[k.id];
      bewerten(k.id, q); tagCheck();
      if (warNeu) S.p.kartenTag.neu++; else S.p.kartenTag.wdh = (S.p.kartenTag.wdh || 0) + 1;
      if (q === 0) { stats.nochmal++; stapel.splice(Math.min(stapel.length, pos + 5), 0, k); ton('schlecht'); } else { stats.gut++; ton('gut'); }
      melde('karte', 1, { q, doc: k.doc });
      pos++; zeigen();
    };
    // Wischgesten (Touch + Maus)
    function wischen(el) {
      let x0 = null, y0 = null, t0 = 0;
      el.addEventListener('pointerdown', e => { x0 = e.clientX; y0 = e.clientY; t0 = Date.now(); el._wisch = false; });
      el.addEventListener('pointermove', e => { if (x0 === null) return; const dx = e.clientX - x0, dy = e.clientY - y0; if (Math.hypot(dx, dy) > 12) el.style.transform = `translate(${dx * 0.4}px, ${dy * 0.25}px) rotate(${dx / 40}deg)`; });
      const ende = e => {
        if (x0 === null) return;
        const dx = e.clientX - x0, dy = e.clientY - y0; x0 = null; el.style.transform = '';
        if (Math.hypot(dx, dy) < 60 || Date.now() - t0 > 1200) return;
        el._wisch = true; setTimeout(() => { el._wisch = false; }, 50);
        if (!umgedreht) { drehen(); return; }
        if (Math.abs(dx) > Math.abs(dy)) bew(dx < 0 ? 0 : 2); else bew(dy < 0 ? 3 : 1);
      };
      el.addEventListener('pointerup', ende); el.addEventListener('pointercancel', () => { x0 = null; el.style.transform = ''; });
    }
    taste = e => {
      if (S.ansicht?.ansicht !== 'karteikarten') return;
      if (e.code === 'Space') { e.preventDefault(); if (pos < stapel.length) drehen(); }
      if (/^[1-4]$/.test(e.key)) bew(+e.key - 1);
    };
    zeigen();
  }
  let taste = null;
  document.addEventListener('keydown', e => { if (taste && !(e.target.matches && e.target.matches('input,textarea,select'))) taste(e); else if (taste && e.key === 'Enter' && e.target.matches && e.target.matches('textarea') && e.ctrlKey) taste(e); });

  // ---------- Quiz-Einstieg ----------
  function quizStat(id, richtig) {
    const s = S.p.quiz[id] || { r: 0, f: 0 };
    richtig ? s.r++ : s.f++;
    if (s.zuletzt === false && richtig) s.korrigiert = (s.korrigiert || 0) + 1;
    s.zuletzt = richtig; s.datum = heute(); S.p.quiz[id] = s; speichern();
  }
  const ihkProben = () => S.docs.filter(d => /(^|\/)pruefung\/ihk\//.test(d.order) && Formen.itemsVon(d).length);
  function quiz(modus = 'uebung') {
    const pr = modus === 'pruefung';
    krumen([START, { txt: pr ? 'Prüfungsmodus' : 'Quiz' }]);
    const proben = pr ? ihkProben() : [];
    const anzArt = a => Formen.alle(null, [a]).length;
    $('#inhalt').innerHTML = `<h1>${pr ? 'Prüfungsmodus' : 'Quiz – Übungsmodus'}</h1>
      <p class="unter">${pr ? 'Wie in der IHK-Prüfung: Zeitlimit, Punkte, Note nach IHK-Schlüssel. Freitext- und Szenario-Aufgaben bewertest du am Ende selbst mit der Musterlösung.' : 'Nach jeder Aufgabe siehst du sofort die Lösung und die Erklärung.'}</p>
      ${pr && proben.length ? `<h2>IHK-Probeprüfungen</h2><div class="themenliste">${proben.map(d => { const its = Formen.itemsVon(d); const letzte = S.p.pruefungen.filter(p => p.doc === d.id).slice(-1)[0];
        return `<button class="glas thema-kachel" data-probe="${E(d.id)}"><b>${E(d.titel)}</b><span class="meta"><span>${its.length} Aufgaben</span><span>${d.zeit || 90} min</span><span>${d.punkte || its.reduce((n, i) => n + i.punkte, 0)} Punkte</span>${letzte ? `<span>zuletzt Note ${letzte.note}</span>` : ''}</span></button>`; }).join('')}</div><h2>Eigene Prüfung zusammenstellen</h2>` : ''}
      <div class="einst-zeile"><div>Anzahl Aufgaben</div><div class="schalter wrap" id="q-anz">${[10, 20, 30, 50, 100, 0].map(n => `<button data-n="${n}" class="${n === (pr ? 30 : 10) ? 'an' : ''}">${n || 'Alle'}</button>`).join('')}</div></div>
      <div class="einst-zeile"><div>Aufgabenarten<small>beliebig mischbar</small></div><div class="arten-wahl" id="q-arten">${Object.entries(Formen.ARTEN).map(([k, v]) => `<label><input type="checkbox" data-art="${k}" ${k === 'mc' || k === 'luecke' || k === 'zuordnen' || k === 'reihenfolge' || pr ? 'checked' : ''}> ${v} <small>(${anzArt(k)})</small></label>`).join('')}</div></div>
      <div class="einst-zeile"><div>Prüfung/Ziel</div><div class="schalter wrap" id="q-tag"><button data-t="" class="an">Alle</button>${PRUEF_TAGS.map(t => `<button data-t="${t}">${t}</button>`).join('')}</div></div>
      <div class="einst-zeile"><div>Aufgaben-Pool</div><div class="schalter wrap" id="q-pool"><button data-p="alle" class="an">Alle</button><button data-p="falsch">Nur falsch beantwortete</button><button data-p="neu">Nur neue</button><button data-p="schwach">Schwache Themen</button></div></div>
      ${pr ? `<div class="einst-zeile"><div>Zeitlimit</div><div class="schalter wrap" id="q-zeit">${ZEITLIMITS.map((z, i) => `<button data-z="${z.key}" class="${i === 0 ? 'an' : ''}">${z.key === 'frage' ? S.p.lernen.quizZeit + ' s pro Aufgabe' : z.name}</button>`).join('')}</div></div>` : ''}
      <div class="lesen-fuss"><button class="glas knopf primär" id="q-start">${pr ? 'Prüfung starten' : 'Quiz starten'}</button><button class="glas knopf" id="q-an">Alle Bereiche</button><button class="glas knopf" id="q-aus">Keine</button></div>
      ${auswahlHtml('q-w')}`;
    const filter = auswahlBinden('q-w');
    let anz = pr ? 30 : 10, pool = 'alle', tag = '', zeit = 'frage';
    schalterBinden('q-anz', ds => anz = +ds.n);
    schalterBinden('q-pool', ds => pool = ds.p);
    schalterBinden('q-tag', ds => { tag = ds.t; if (pr) { const z = { AP1: 'ap1', AP2: 'ap2', WiSo: 'wiso', 'LPIC-1': 'zert', CCNA: 'zert', 'DP-203': 'zert', 'AZ-800': 'zert', 'AZ-801': 'zert' }[tag]; if (z) { zeit = z; document.querySelectorAll('#q-zeit button').forEach(b => b.classList.toggle('an', b.dataset.z === z)); } } });
    if (pr) schalterBinden('q-zeit', ds => zeit = ds.z);
    $('#q-an').onclick = () => alleAus('q-w', true); $('#q-aus').onclick = () => alleAus('q-w', false);
    document.querySelectorAll('[data-probe]').forEach(b => b.onclick = () => probepruefung(b.dataset.probe));
    $('#q-start').onclick = () => {
      const arten = [...document.querySelectorAll('#q-arten input:checked')].map(i => i.dataset.art);
      if (!arten.length) { toast('Mindestens eine Aufgabenart wählen.'); return; }
      const f = filter();
      let fr = Formen.alle(d => f(d) && passtZuTag(d, tag), arten);
      if (pool === 'falsch') fr = fr.filter(q => S.p.quiz[q.id] && S.p.quiz[q.id].zuletzt === false);
      if (pool === 'neu') fr = fr.filter(q => !S.p.quiz[q.id]);
      if (pool === 'schwach' && window.Analyse) { const schwach = new Set(Analyse.schwacheDocs().map(d => d.id)); fr = fr.filter(q => schwach.has(q.doc.id)); }
      fr = mischen(fr); if (anz) fr = fr.slice(0, anz);
      if (!fr.length) { toast('Keine Aufgaben in dieser Auswahl.'); return; }
      if (pr) {
        const z = ZEITLIMITS.find(x => x.key === zeit);
        const sek = z.min > 0 ? z.min * 60 : z.min < 0 ? 0 : fr.length * S.p.lernen.quizZeit;
        pruefung(fr, { sek, titel: tag ? `Prüfung ${tag}` : 'Prüfungssimulation', tag });
      } else uebung(fr);
    };
  }
  function probepruefung(id) {
    const d = S.byId[id]; if (!d) return;
    const its = Formen.itemsVon(d);
    const sumP = its.reduce((n, i) => n + i.punkte, 0);
    const faktor = d.punkte && sumP ? d.punkte / sumP : 1;
    const tag = d.pruefungen[0] || (/ap2/i.test(d.id) ? 'AP2' : 'AP1');
    pruefung(its.slice(), { sek: (d.zeit || 90) * 60, titel: d.titel, tag, doc: d.id, faktor, gesamt: d.punkte || sumP });
  }

  // ---------- Übungsmodus ----------
  function uebung(fr) {
    let i = 0, punkte = 0, max = 0, richtig = 0, ctl = null, fertig = false;
    const zeige = () => {
      if (i >= fr.length) { ergebnis({ n: fr.length, richtig, punkte, max, fehler: [], pr: false }); return; }
      fertig = false;
      const it = fr[i];
      $('#inhalt').innerHTML = `<div class="quiz-kopf"><span>Aufgabe ${i + 1} / ${fr.length}</span><span>${richtig} richtig</span></div>
        <div class="quiz-fortschritt"><i style="width:${(i / fr.length) * 100}%"></i></div><div id="q-item"></div>
        <p class="unter">Aus: <a class="verweis" data-go="lesen" data-param="${E(it.doc.id)}">${E(it.doc.titel)}</a></p>
        <div class="lesen-fuss"><button class="glas knopf" id="q-skip">Überspringen</button><button class="glas knopf primär" id="q-weiter" hidden>Weiter (Enter)</button></div>`;
      ctl = Formen.render(it, $('#q-item'), { modus: 'uebung', state: {}, fertig: r => {
        fertig = true; punkte += r.punkte || 0; max += r.max; if (r.max && r.punkte / r.max >= (it.art === 'mc' ? 1 : 0.5)) richtig++;
        $('#q-weiter').hidden = false; $('#q-skip').hidden = true; setTimeout(() => $('#q-weiter') && $('#q-weiter').focus({ preventScroll: true }), 30);
      } });
      $('#q-weiter').onclick = () => { i++; zeige(); };
      $('#q-skip').onclick = () => { i++; zeige(); };
    };
    taste = e => {
      if (S.ansicht?.ansicht !== 'quiz' || !ctl) return;
      const k = e.key.toLowerCase(), m = 'abcdefgh'.indexOf(k), z = '12345678'.indexOf(k);
      if (!fertig && fr[i]?.art === 'mc' && (m >= 0 || z >= 0) && k.length === 1) { e.preventDefault(); ctl.waehle(m >= 0 ? m : z); return; }
      if (e.key === 'Enter') { e.preventDefault(); if (fertig) { i++; zeige(); } else ctl.pruefen(); }
    };
    zeige();
  }

  // ---------- Prüfungsmodus ----------
  // opts: { sek (0 = ohne Limit), titel, tag, doc, faktor, gesamt }
  function pruefung(fr, opts = {}) {
    const start = Date.now(), zustand = fr.map(it => { const st = {}; Formen.vorbereiten(it, st, true); return st; }); // vorbereitet, damit Zuordnen/Reihenfolge schon vor dem Anzeigen auswertbar sind
    let i = 0, timer, ctl;
    const faktor = opts.faktor || 1;
    const rest = () => opts.sek ? Math.max(0, opts.sek - Math.floor((Date.now() - start) / 1000)) : null;
    const fmt = s => s === null ? '∞' : `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
    const beantwortet = j => { const r = Formen.auswerten(fr[j], zustand[j]); return r.beantwortet; };
    const zeige = () => {
      const it = fr[i];
      $('#inhalt').innerHTML = `<div class="quiz-kopf"><span>${E(opts.titel || 'Prüfung')} · Aufgabe ${i + 1} / ${fr.length}</span><span class="uhr" id="uhr">${fmt(rest())}</span></div>
        <div class="quiz-fortschritt"><i style="width:${(i / fr.length) * 100}%"></i></div><div id="q-item"></div>
        <div class="lesen-fuss"><button class="glas knopf" id="p-zur" ${i ? '' : 'disabled'}>‹ Zurück</button><button class="glas knopf" id="p-vor">${i < fr.length - 1 ? 'Weiter ›' : 'Zur Übersicht'}</button><button class="glas knopf primär" id="p-abgabe">Abgeben</button></div>
        <div class="nummern">${fr.map((x, j) => `<button class="glas nr ${beantwortet(j) ? 'ok' : ''} ${j === i ? 'akt' : ''}" data-j="${j}" title="${Formen.ARTEN[x.art]}">${j + 1}</button>`).join('')}</div>`;
      ctl = Formen.render(it, $('#q-item'), { modus: 'pruefung', state: zustand[i], nr: i + 1, punkteAnzeige: it.punkte * faktor, geaendert: () => { const b = document.querySelector(`.nummern .nr[data-j="${i}"]`); if (b) b.classList.toggle('ok', beantwortet(i)); } });
      $('#p-zur').onclick = () => { i--; zeige(); };
      $('#p-vor').onclick = () => { if (i < fr.length - 1) { i++; zeige(); } };
      $('#p-abgabe').onclick = () => { const offen = fr.filter((_, j) => !beantwortet(j)).length; if (!offen || confirm(`${offen} Aufgabe(n) unbeantwortet. Trotzdem abgeben?`)) abgeben(); };
      document.querySelectorAll('.nummern .nr').forEach(b => b.onclick = () => { i = +b.dataset.j; zeige(); });
    };
    const abgeben = () => {
      clearInterval(timer); taste = null;
      const dauer = Math.floor((Date.now() - start) / 1000);
      const selbst = fr.map((it, j) => ({ it, st: zustand[j], j })).filter(x => Formen.selbstbewertet(x.it) && Formen.auswerten(x.it, x.st).beantwortet);
      if (selbst.length) selbstbewertung(selbst, () => auswertung(dauer)); else auswertung(dauer);
    };
    const selbstbewertung = (liste, weiter) => {
      krumen([START, { txt: 'Prüfung' }, { txt: 'Selbstbewertung' }]);
      $('#inhalt').innerHTML = `<h1>Selbstbewertung</h1><p class="unter">${liste.length} offene Aufgabe(n): Vergleiche deine Antwort mit der Musterlösung und vergib Punkte – so wie ein IHK-Prüfer.</p>
        ${liste.map(({ it, st, j }) => `<div class="glas selbst-karte" data-j="${j}"><div class="frage">${j + 1}. ${Parser.inline(it.frage || it.titel)}</div>
          <div class="deine">${it.art === 'freitext' ? `<b>Deine Antwort:</b> ${E(st.text || '–')}` : it.fragen.map((f, k) => `<p><b>${k + 1}.</b> ${E((st.txt || {})[k] || '–')}</p>`).join('')}</div>
          ${it.art === 'freitext' ? Formen.loesungHtml(it) : ''}<div class="sb-root">${Formen.selbstHtml(it, st)}</div></div>`).join('')}
        <div class="lesen-fuss"><button class="glas knopf primär" id="sb-fertig">Auswerten</button></div>`;
      liste.forEach(({ it, st, j }) => Formen.selbstBinden(it, st, document.querySelector(`.selbst-karte[data-j="${j}"] .sb-root`), () => {}));
      $('#sb-fertig').onclick = () => {
        const offen = liste.filter(({ it, st }) => Formen.auswerten(it, st).punkte === null).length;
        if (offen && !confirm(`${offen} Aufgabe(n) noch ohne Punkte – die zählen dann 0. Weiter?`)) return;
        liste.forEach(({ it, st }) => { if (Formen.auswerten(it, st).punkte === null) { if (it.art === 'freitext') st.selbst = 0; else { st.selbst = st.selbst || {}; it.fragen.forEach((_, k) => { if (st.selbst[k] === undefined) st.selbst[k] = 0; }); } } });
        weiter();
      };
    };
    const auswertung = dauer => {
      let punkte = 0, max = 0, richtig = 0; const fehler = [];
      fr.forEach((it, j) => {
        const st = zustand[j]; const r = Formen.auswerten(it, st);
        const p = (r.punkte || 0) * faktor, m = r.max * faktor;
        punkte += p; max += m;
        const ok = r.max && (r.punkte || 0) / r.max >= (it.art === 'mc' ? 1 : 0.5);
        if (ok) richtig++; else fehler.push({ it, st, p, m });
        if (r.beantwortet || it.art === 'mc') Formen.verbuchen(it, { punkte: r.punkte || 0, max: r.max });
      });
      const pz = max ? Math.round(punkte / max * 100) : 0;
      S.p.pruefungen.push({ datum: new Date().toISOString(), titel: opts.titel || 'Prüfung', tag: opts.tag || '', doc: opts.doc || '', fragen: fr.length, richtig, punkte: Math.round(punkte * 10) / 10, max: Math.round(max * 10) / 10, prozent: pz, note: note(pz)[1], dauer });
      speichern(); melde('pruefung', 1, { prozent: pz, note: note(pz)[1] });
      ergebnis({ n: fr.length, richtig, punkte, max, fehler, pr: true, titel: opts.titel });
    };
    timer = setInterval(() => {
      if (S.ansicht?.ansicht !== 'quiz') { clearInterval(timer); return; }
      const u = document.getElementById('uhr'); const r = rest();
      if (u) { u.textContent = fmt(r); u.classList.toggle('knapp', r !== null && r < 300); }
      if (r === 0) { clearInterval(timer); toast('Zeit abgelaufen! Die Prüfung wird abgegeben.'); abgeben(); }
    }, 1000);
    taste = e => {
      if (S.ansicht?.ansicht !== 'quiz' || !ctl) return;
      const k = e.key.toLowerCase(), m = 'abcdefgh'.indexOf(k);
      if (fr[i]?.art === 'mc' && m >= 0 && k.length === 1 && ctl.waehle) { ctl.waehle(m); const b = document.querySelector(`.nummern .nr[data-j="${i}"]`); if (b) b.classList.toggle('ok', beantwortet(i)); }
      if (e.key === 'ArrowRight' && i < fr.length - 1) { i++; zeige(); }
      if (e.key === 'ArrowLeft' && i > 0) { i--; zeige(); }
    };
    zeige();
  }
  function ergebnis({ n, richtig, punkte, max, fehler, pr, titel }) {
    taste = null;
    krumen([START, { txt: pr ? 'Prüfung' : 'Quiz' }, { txt: 'Ergebnis' }]);
    const pz = max ? Math.round(punkte / max * 100) : 0, nt = note(pz);
    ton(nt[1] <= 4 ? 'gong' : 'schlecht');
    if (pr && nt[1] <= 4 && window.Mot) Mot.konfetti();
    const f1 = x => Formen.fmtP(Math.round(x * 10) / 10);
    $('#inhalt').innerHTML = `<div class="ergebnis">
      <div class="note-stempel n${nt[1]}">${nt[1]}</div>
      <h1>${pz} % · ${nt[2]}</h1>
      <p class="unter">${titel ? E(titel) + ' · ' : ''}${f1(punkte)} von ${f1(max)} Punkten · ${richtig} von ${n} Aufgaben richtig${pr ? '<br>IHK-Schlüssel: 100–92 = 1, 91–81 = 2, 80–67 = 3, 66–50 = 4, 49–30 = 5, 29–0 = 6' : ''}</p>
      <div class="lesen-fuss"><button class="glas knopf primär" data-go="quiz" data-param="${pr ? 'pruefung' : 'uebung'}">Nochmal</button><button class="glas knopf" data-go="analyse" data-param="fehler">Fehlerkatalog</button><button class="glas knopf" data-go="home">Start</button></div>
      ${fehler.length ? `<h2>Falsch, teilweise oder offen (${fehler.length})</h2>` + fehler.map(({ it, st, p, m }) => `<div class="quizfrage glas fehler-karte"><div class="item-kopf"><span class="art-chip">${Formen.ARTEN[it.art]}</span>${m ? `<span class="art-chip">${f1(p)} / ${f1(m)} P</span>` : ''}</div><div class="frage">${Parser.inline(it.frage || it.titel || it.text)}</div>
        ${Formen.loesungHtml(it, st)}<p class="unter klein">Aus: <a class="verweis" data-go="lesen" data-param="${E(it.doc.id)}">${E(it.doc.titel)}</a></p></div>`).join('') : ''}
    </div>`;
  }

  // ---------- Labs ----------
  function labHtml(d) {
    const z = {}, erledigt = S.p.lab[d.id] || {};
    const html = Parser.md(d.sections['Lab'], { check: true, erledigt, zaehler: z });
    const fertig = Object.values(erledigt).filter(Boolean).length;
    return `<details class="abschnitt lab" open><summary>Lab – Praxis <small class="lab-stand">${z.n ? `${fertig}/${z.n} erledigt` : ''}</small></summary>
      <div class="text">${html}${z.n ? '<button class="glas knopf" id="lab-reset" style="margin-top:10px">Häkchen zurücksetzen</button>' : ''}</div></details>`;
  }
  function labBinden(d) {
    document.querySelectorAll('.lab input[data-schritt]').forEach(cb => cb.onchange = () => {
      const l = S.p.lab[d.id] = S.p.lab[d.id] || {};
      if (cb.checked) { l[cb.dataset.schritt] = true; melde('lab', 1); } else delete l[cb.dataset.schritt];
      speichern(); ton(cb.checked ? 'kreide' : 'klick');
      const n = document.querySelectorAll('.lab input[data-schritt]').length, f = Object.keys(l).length;
      document.querySelector('.lab-stand').textContent = `${f}/${n} erledigt`;
      if (f === n) { ton('gong'); toast('Lab komplett erledigt!'); melde('labKomplett', 1); }
    });
    const r = document.getElementById('lab-reset');
    if (r) r.onclick = () => { delete S.p.lab[d.id]; speichern(); lesen(d.id); };
  }
  function labs() {
    krumen([START, { txt: 'Labs' }]);
    const liste = S.docs.filter(d => d.sections['Lab']).map(d => { const z = {}; Parser.md(d.sections['Lab'], { check: true, zaehler: z }); return { d, n: z.n, f: Object.keys(S.p.lab[d.id] || {}).length }; }).filter(x => x.n);
    $('#inhalt').innerHTML = `<h1>Labs</h1><p class="unter">${liste.length} Anleitungen · ${liste.filter(x => x.f >= x.n).length} komplett erledigt. Jeder Schritt lässt sich abhaken – Maschine steht immer dabei.</p>` +
      BEREICHE.map(b => { const l = liste.filter(x => x.d.bereich === b.key); return l.length ? `<div class="gruppe-titel">${E(b.name)}</div><div class="themenliste">${l.map(x => `
        <button class="glas thema-kachel" data-go="lesen" data-param="${E(x.d.id)}"><b>${x.f >= x.n ? '<span class="haken">✓</span> ' : ''}${E(x.d.titel)}</b>
        <span class="meta"><span>${E(x.d.kapitel)}</span><span>${x.f}/${x.n} Schritte</span></span>
        <div class="balken" style="margin:4px 0 0"><i style="width:${Math.round(x.f / x.n * 100)}%"></i></div></button>`).join('')}</div>` : ''; }).join('');
  }

  // ---------- Statistik ----------
  function statistik() {
    krumen([START, { txt: 'Statistik' }]);
    const qs = Object.values(S.p.quiz), r = qs.reduce((n, s) => n + s.r, 0), f = qs.reduce((n, s) => n + s.f, 0);
    const kk = Object.values(S.p.karten), reif = kk.filter(k => k.iv >= 21).length;
    const pr = S.p.pruefungen.slice(-20).reverse();
    const tage = Object.entries(S.p.xp.tage || {}).sort().slice(-28);
    const maxXp = Math.max(1, ...tage.map(([, v]) => v));
    $('#inhalt').innerHTML = `<h1>Statistik</h1>
      <div class="pausenbrett">
        <div class="glas aktion"><b>${Object.keys(S.p.gelesen).filter(id => S.byId[id]).length} / ${S.docs.length}</b><span>Themen gelesen</span></div>
        <div class="glas aktion"><b>${kk.length} / ${alleKarten().length}</b><span>Karten gelernt · ${reif} sitzen (≥ 21 Tage)</span></div>
        <div class="glas aktion"><b>${r + f ? Math.round(r / (r + f) * 100) : 0} %</b><span>Trefferquote (${r + f} Antworten)</span></div>
        <div class="glas aktion"><b>${S.p.pruefungen.length}</b><span>Prüfungen geschrieben</span></div>
        <div class="glas aktion"><b>${Object.values(S.p.spiele || {}).reduce((n, x) => n + (x.gespielt || 0), 0)}</b><span>Lernspiele gespielt</span></div>
        <div class="glas aktion"><b>${(S.p.xp.gesamt || 0).toLocaleString('de-DE')} XP</b><span>Gesamt · Streak ${S.p.streak.tage} Tage (Rekord ${S.p.streak.best})</span></div>
      </div>
      <h2>XP der letzten 4 Wochen</h2>
      ${tage.length ? `<div class="xp-chart">${tage.map(([d, v]) => `<div class="xp-bar" title="${d}: ${v} XP"><i style="height:${Math.round(v / maxXp * 100)}%"></i><small>${d.slice(8)}</small></div>`).join('')}</div>` : '<p class="leer">Noch keine XP gesammelt.</p>'}
      <h2>Nach Bereich</h2>
      <div class="tablewrap"><table><thead><tr><th>Bereich</th><th>Gelesen</th><th>Karten gelernt</th><th>Aufgaben-Quote</th></tr></thead><tbody>
      ${BEREICHE.filter(b => docsIn(b.key).length).map(b => {
        const l = docsIn(b.key), ids = new Set(l.map(d => d.id));
        const kn = Object.keys(S.p.karten).filter(k => ids.has(k.split('#')[0])).length, kg = l.reduce((n, d) => n + d.cards.length, 0);
        let rr = 0, ff = 0; for (const [k, s] of Object.entries(S.p.quiz)) if (ids.has(k.split('#')[0])) { rr += s.r; ff += s.f; }
        return `<tr><td>${E(b.name)}</td><td>${l.filter(d => S.p.gelesen[d.id]).length}/${l.length}</td><td>${kn}/${kg}</td><td>${rr + ff ? Math.round(rr / (rr + ff) * 100) + ' %' : '–'}</td></tr>`;
      }).join('')}</tbody></table></div>
      <h2>Letzte Prüfungen</h2>
      ${pr.length ? `<div class="tablewrap"><table><thead><tr><th>Datum</th><th>Prüfung</th><th>Aufgaben</th><th>Punkte</th><th>Note</th><th>Dauer</th></tr></thead><tbody>${pr.map(p => `<tr><td>${new Date(p.datum).toLocaleString('de-DE')}</td><td>${E(p.titel || 'Simulation')}</td><td>${p.fragen}</td><td>${p.max ? `${Formen.fmtP(p.punkte)}/${Formen.fmtP(p.max)}` : p.richtig} (${p.prozent} %)</td><td>${p.note}</td><td>${Math.floor(p.dauer / 60)} min</td></tr>`).join('')}</tbody></table></div>` : '<p class="leer">Noch keine Prüfung geschrieben.</p>'}`;
  }

  window.VIEWS = Object.assign(window.VIEWS || {}, { karteikarten, quiz, labs, statistik });
  function kartenSitzung(karten) { tagCheck(); const f = karten.filter(k => S.p.karten[k.id] && S.p.karten[k.id].due <= heute()); const n = karten.filter(k => !S.p.karten[k.id]).slice(0, Math.max(10, neuHeute())); const st = [...mischen(f), ...n]; if (!st.length) { toast('Nichts fällig. 🎉'); return; } sitzung(st); }
  return { faelligAnzahl, neuHeute, quizStat, labHtml, labBinden, alleKarten, probepruefung, ihkProben, pruefung, uebung, kartenSitzung, passtZuTag };
})();
