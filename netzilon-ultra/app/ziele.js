// Netzilon Ultra 2.1 – Ziele: Schwierigkeits-Markierung (leicht/mittel/schwer), Fortschritt "33/77 erfolgreich",
// Zufallsprüfungen (60 Fragen aus dem ganzen Pool), Aufgabe des Tages (365), Meisterschaft/Durchgespielt-Anzeige
const Ziele = (() => {
  const TAG_MS = 24 * 60 * 60 * 1000;
  const STUFEN = { 1: { name: 'leicht', farbe: 'gruen' }, 2: { name: 'mittel', farbe: 'gelb' }, 3: { name: 'schwer', farbe: 'rot' } };
  const AUTO = ['mc', 'luecke', 'zuordnen', 'reihenfolge'];
  const SELBST = ['freitext', 'szenario'];

  // ---------- Zustand (robust gegen alte Speicherstände) ----------
  function P() {
    const p = S.p;
    if (!p.schwer || typeof p.schwer !== 'object' || Array.isArray(p.schwer)) p.schwer = {};
    if (!p.zufall || typeof p.zufall !== 'object') p.zufall = { n: 0, gesehen: {} };
    if (!p.zufall.gesehen || typeof p.zufall.gesehen !== 'object') p.zufall.gesehen = {};
    if (!p.tagesaufgabe || typeof p.tagesaufgabe !== 'object') p.tagesaufgabe = {};
    const t = p.tagesaufgabe;
    if (!Array.isArray(t.historie)) t.historie = [];
    if (t.aktuell === undefined) t.aktuell = null;
    for (const k of ['ausgegeben', 'serie', 'best']) if (typeof t[k] !== 'number') t[k] = 0;
    if (typeof t.letzterTag !== 'string') t.letzterTag = '';
    return p;
  }
  const TA = () => P().tagesaufgabe;

  // ---------- Schwierigkeit ----------
  function vorgabe(it) {
    const s = it.doc && it.doc.stufe;
    let n = s === 'Profi' ? 3 : s === 'Fortgeschritten' ? 2 : s === 'Einsteiger' ? 1 : 2;
    if (it.art === 'freitext' || it.art === 'szenario' || (it.art === 'mc' && it.multi)) n = Math.min(3, n + 1);
    return n;
  }
  const gewaehlt = it => P().schwer[it.id] || 0;
  function setzeSchwer(id, n) {
    const m = P().schwer;
    if (!n || m[id] === n) delete m[id]; else m[id] = n;
    speichern();
  }
  function markerHtml(it) {
    const g = gewaehlt(it), v = vorgabe(it);
    return `<div class="schwer-leiste" data-sid="${E(it.id)}"><span class="schwer-txt">Schwierigkeit markieren:</span>${[1, 2, 3].map(n =>
      `<button type="button" class="schwer-btn sg${n} ${g === n ? 'an' : ''} ${!g && v === n ? 'vorschlag' : ''}" data-n="${n}" aria-pressed="${g === n}" title="${g === n ? 'Markierung entfernen' : (!g && v === n ? 'Vorschlag: ' : '') + 'als ' + STUFEN[n].name + ' markieren'}">${STUFEN[n].name}</button>`).join('')}</div>`;
  }
  function markerEinfuegen(it, el) {
    if (!el || !el.parentNode || !it || !it.id) return;
    const vor = el.previousElementSibling;
    if (vor && vor.classList.contains('schwer-leiste')) vor.remove();
    el.insertAdjacentHTML('beforebegin', markerHtml(it));
  }
  // Formen.render um die Markierungsleiste erweitern (sitzt VOR dem Aufgaben-Container, übersteht Neuzeichnen)
  function patchFormen() {
    if (!window.Formen || Formen._zielePatch) return;
    const orig = Formen.render;
    Formen.render = function (it, el, ctx) {
      const ctl = orig.apply(this, arguments);
      try { if (!(ctx && ctx.ohneMarker)) markerEinfuegen(it, el); } catch (e) { console.warn('Marker', e); }
      return ctl;
    };
    Formen._zielePatch = true;
  }
  document.addEventListener('click', e => {
    const b = e.target.closest && e.target.closest('.schwer-btn');
    if (!b) return;
    const leiste = b.closest('.schwer-leiste, .sw-zeile'); if (!leiste) return;
    e.preventDefault(); e.stopPropagation();
    const id = leiste.dataset.sid, n = +b.dataset.n;
    if (!id || !(n >= 1 && n <= 3)) return;
    const war = P().schwer[id] === n;
    setzeSchwer(id, n);
    if (leiste.classList.contains('sw-zeile')) { toast(war ? 'Markierung entfernt' : `Jetzt: ${STUFEN[n].name}`); schwierigkeit(swMerk); return; }
    const it = Formen.nachId(id); const g = P().schwer[id] || 0, v = it ? vorgabe(it) : 0;
    leiste.querySelectorAll('.schwer-btn').forEach(x => { const k = +x.dataset.n; x.classList.toggle('an', g === k); x.classList.toggle('vorschlag', !g && v === k); x.setAttribute('aria-pressed', g === k); });
    toast(war ? 'Markierung entfernt' : `Markiert: ${STUFEN[n].name} – siehst du unter „Nach Schwierigkeit“`);
  }, true);

  // ---------- Fortschritt x/y ----------
  const erfolgreich = it => { const s = S.p.quiz[it.id]; return !!(s && s.zuletzt === true); };
  function zaehle(items) { let ok = 0; for (const it of items) if (erfolgreich(it)) ok++; return { ok, n: items.length }; }
  const docStat = d => zaehle(Formen.itemsVon(d));
  const tagStat = tag => zaehle(Formen.alle(d => passtZuTag(d, tag)));
  const bereichStat = key => zaehle(Formen.alle(d => d.bereich === key));
  const gesamtStat = () => zaehle(Formen.alle());
  function balken(z, label, extra = '') {
    const p = z.n ? Math.round(z.ok / z.n * 100) : 0;
    return `<div class="fb ${extra}"><div class="fb-kopf"><span>${label}</span><b>${z.ok}/${z.n} <small>${p} %</small></b></div><div class="balken fb-balken"><i style="width:${p}%"></i></div></div>`;
  }
  const mini = z => z.n ? `<span class="fb-mini" title="${z.ok} von ${z.n} Aufgaben zuletzt richtig">✓ ${z.ok}/${z.n}</span>` : '';
  function kartenStat() {
    const gesamt = S.docs.reduce((n, d) => n + d.cards.length, 0);
    const gelernt = Object.keys(S.p.karten).filter(k => S.p.karten[k]).length;
    return { ok: Math.min(gelernt, gesamt), n: gesamt };
  }
  function lesenStat() { return { ok: Object.keys(S.p.gelesen).filter(id => S.byId[id]).length, n: S.docs.length }; }
  function meisterschaft() {
    const l = lesenStat(), a = gesamtStat(), k = kartenStat(), lv = Mot.level(S.p.xp.gesamt);
    const teile = [l.n ? l.ok / l.n : 0, a.n ? a.ok / a.n : 0, k.n ? k.ok / k.n : 0];
    const pz = Math.round(teile.reduce((x, y) => x + y, 0) / teile.length * 100);
    return { pz, l, a, k, lv };
  }

  // ---------- Ansicht: Fortschritt ----------
  function fortschritt() {
    krumen([START, { txt: 'Fortschritt' }]);
    const m = meisterschaft(), r = Mot.rang(m.lv);
    const dg = m.lv >= 100;
    const nach = Object.values(STUFEN).map((s, i) => {
      const its = Formen.alle().filter(it => P().schwer[it.id] === i + 1);
      return { s, n: its.length, ok: its.filter(erfolgreich).length };
    });
    $('#inhalt').innerHTML = `<h1>Fortschritt</h1>
      <p class="unter">${r[2]} ${E(r[1])} · Level ${m.lv} von 100 ${dg ? '· 🏆 DURCHGESPIELT' : ''} · Meisterschaft ${m.pz} %</p>
      <section class="karte-w fb-gross"><div class="w-titel">Gesamt</div>
        ${balken({ ok: m.lv, n: 100 }, 'Level (Weg zu „Durchgespielt“)')}
        ${balken(m.l, 'Themen gelesen')}
        ${balken(m.a, 'Aufgaben erfolgreich (zuletzt richtig)')}
        ${balken(m.k, 'Karteikarten gelernt')}
        ${balken({ ok: m.pz, n: 100 }, 'Meisterschaft gesamt')}
      </section>
      <h2>Nach Prüfung / Ziel</h2><div class="fb-raster">${PRUEF_TAGS.map(t => { const z = tagStat(t); return z.n ? balken(z, t) : ''; }).join('')}</div>
      <h2>Nach Bereich</h2><div class="fb-raster">${BEREICHE.map(b => { const z = bereichStat(b.key); return z.n ? `<a class="fb-link" data-go="bereich" data-param="${E(b.key)}">${balken(z, E(b.name))}</a>` : ''; }).join('')}</div>
      <h2>Nach Schwierigkeit <small>(von dir markiert)</small></h2><div class="fb-raster">${nach.map(x => balken({ ok: x.ok, n: x.n }, x.s.name, 'sf-' + x.s.farbe)).join('')}</div>
      <div class="lesen-fuss"><button class="glas knopf primär" data-go="schwierigkeit">Rubrik „Nach Schwierigkeit“</button><button class="glas knopf" data-go="zufall">Zufallsprüfung</button><button class="glas knopf" data-go="tagesaufgabe">Aufgabe des Tages</button></div>`;
  }

  // ---------- Ansicht: Rubrik nach Schwierigkeit ----------
  function plain(it) { return String(it.frage || it.titel || it.text || '').replace(/[`*_#]/g, '').replace(/\s+/g, ' ').trim(); }
  let swMerk = 0;
  function schwierigkeit(param) {
    const stufe = [1, 2, 3].includes(+param) ? +param : 0;
    krumen([START, { txt: 'Nach Schwierigkeit' }]);
    const alle = Formen.alle();
    const marks = P().schwer;
    const gruppen = { 1: [], 2: [], 3: [] };
    for (const it of alle) if (marks[it.id]) gruppen[marks[it.id]].push(it);
    const sicht = stufe || (gruppen[3].length ? 3 : gruppen[2].length ? 2 : 1);
    swMerk = sicht;
    const liste = gruppen[sicht];
    const offen = liste.filter(it => !erfolgreich(it));
    const nachDoc = {};
    for (const it of liste) (nachDoc[it.doc.id] = nachDoc[it.doc.id] || []).push(it);
    $('#inhalt').innerHTML = `<h1>Nach Schwierigkeit</h1>
      <p class="unter">Alles, was du mit <b>leicht / mittel / schwer</b> markiert hast. Markieren kannst du bei jeder Aufgabe im Quiz, in der Prüfung und beim Lesen.</p>
      <div class="schalter wrap" id="sw-tabs">${[1, 2, 3].map(n => `<button data-n="${n}" class="${n === sicht ? 'an' : ''} sw-t${n}">${STUFEN[n].name} (${gruppen[n].length})</button>`).join('')}</div>
      ${liste.length ? `<div class="fb-raster">${balken(zaehle(liste), 'Davon erfolgreich', 'sf-' + STUFEN[sicht].farbe)}</div>
      <div class="lesen-fuss"><button class="glas knopf primär" id="sw-ueben">Alle ${liste.length} üben</button><button class="glas knopf" id="sw-offen" ${offen.length ? '' : 'disabled'}>Nur nicht erfolgreiche (${offen.length})</button></div>
      ${Object.entries(nachDoc).map(([id, its]) => `<div class="gruppe-titel"><a class="verweis" data-go="lesen" data-param="${E(id)}">${E(S.byId[id].titel)}</a> <small>${E(bereichName(S.byId[id].bereich))}</small></div>
        <div class="sw-liste">${its.map(it => `<div class="glas sw-zeile" data-sid="${E(it.id)}"><span class="sw-ok ${erfolgreich(it) ? 'ja' : (S.p.quiz[it.id] ? 'nein' : '')}" title="${erfolgreich(it) ? 'zuletzt richtig' : (S.p.quiz[it.id] ? 'zuletzt falsch' : 'noch nicht beantwortet')}">${erfolgreich(it) ? '✓' : (S.p.quiz[it.id] ? '✗' : '○')}</span><span class="art-chip">${E(Formen.ARTEN[it.art])}</span><span class="sw-frage">${E(plain(it)).slice(0, 170)}</span><span class="sw-knoepfe">${[1, 2, 3].map(n => `<button type="button" class="schwer-btn sg${n} ${marks[it.id] === n ? 'an' : ''}" data-n="${n}" title="${STUFEN[n].name}">${STUFEN[n].name[0].toUpperCase()}</button>`).join('')}<button type="button" class="schwer-btn weg" data-n="${marks[it.id]}" title="Markierung entfernen">×</button></span></div>`).join('')}</div>`).join('')}`
      : `<p class="leer">Noch nichts als „${STUFEN[sicht].name}“ markiert. Öffne eine Aufgabe (Quiz, Prüfung oder Thema) und klicke über der Frage auf <b>${STUFEN[sicht].name}</b>.</p><div class="lesen-fuss"><button class="glas knopf primär" data-go="quiz" data-param="uebung">Quiz starten</button></div>`}`;
    document.querySelectorAll('#sw-tabs button').forEach(b => b.onclick = () => schwierigkeit(+b.dataset.n));
    const start = items => { if (!items.length) return; const f = items.slice(); gehe('quiz', 'uebung'); Lernen.uebung(mischen(f)); };
    const bu = $('#sw-ueben'); if (bu) bu.onclick = () => start(liste);
    const bo = $('#sw-offen'); if (bo) bo.onclick = () => start(offen);
  }

  // ---------- Zufallsprüfung ----------
  const POOLS = {
    AP1: { name: 'AP1', sub: 'Abschlussprüfung Teil 1', filter: d => passtZuTag(d, 'AP1'), zeit: 90, tag: 'AP1' },
    AP2: { name: 'AP2', sub: 'Abschlussprüfung Teil 2 inkl. Wirtschafts- und Sozialkunde', filter: d => passtZuTag(d, 'AP2') || passtZuTag(d, 'WiSo'), zeit: 90, tag: 'AP2' },
    WiSo: { name: 'WiSo / Kaufmännisch', sub: 'Wirtschafts- und Sozialkunde', filter: d => passtZuTag(d, 'WiSo'), zeit: 60, tag: 'WiSo' },
    ALLES: { name: 'Alles gemischt', sub: 'Aus dem gesamten Fragenpool der App', filter: () => true, zeit: 120, tag: '' }
  };
  function zieheZufall(key, anzahl) {
    const pool = POOLS[key];
    const kand = Formen.alle(pool.filter);
    const gesehen = new Set(P().zufall.gesehen[key] || []);
    let auto = kand.filter(it => AUTO.includes(it.art)), selbst = kand.filter(it => SELBST.includes(it.art));
    const maxSelbst = Math.min(selbst.length, Math.round(anzahl * 0.13));
    const brauchAuto = Math.min(auto.length, anzahl - maxSelbst);
    let neuA = mischen(auto.filter(it => !gesehen.has(it.id)));
    let neuS = mischen(selbst.filter(it => !gesehen.has(it.id)));
    let zurueckgesetzt = false;
    if (neuA.length < brauchAuto || neuS.length < maxSelbst) { // Pool durchgespielt -> neue Runde
      P().zufall.gesehen[key] = []; gesehen.clear(); zurueckgesetzt = true;
      neuA = mischen(auto); neuS = mischen(selbst);
    }
    let wahl = neuA.slice(0, brauchAuto).concat(neuS.slice(0, maxSelbst));
    if (wahl.length < anzahl) { // Rest auffüllen (falls eine Art zu klein ist)
      const rest = mischen(kand.filter(it => !wahl.includes(it)));
      wahl = wahl.concat(rest.slice(0, anzahl - wahl.length));
    }
    P().zufall.gesehen[key] = (P().zufall.gesehen[key] || []).concat(wahl.map(it => it.id));
    P().zufall.n = (P().zufall.n || 0) + 1;
    speichern();
    return { items: mischen(wahl), neueRunde: zurueckgesetzt, pool: kand.length };
  }
  function zufall() {
    krumen([START, { txt: 'Zufallsprüfung' }]);
    const zeilen = Object.entries(POOLS).map(([key, p]) => {
      const kand = Formen.alle(p.filter), gs = new Set(P().zufall.gesehen[key] || []);
      const neu = kand.filter(it => !gs.has(it.id)).length;
      return { key, p, n: kand.length, neu };
    });
    $('#inhalt').innerHTML = `<h1>Zufallsprüfung</h1>
      <p class="unter">Jedes Mal eine neue Prüfung: die App zieht <b>zufällig 60 Fragen</b> aus dem Pool, bevorzugt solche, die du in einer Zufallsprüfung noch nicht hattest. Mit Zeitlimit, Punkten und IHK-Note. ${P().zufall.n ? `Bisher: ${P().zufall.n} Zufallsprüfung(en).` : ''}</p>
      <div class="einst-zeile"><div>Anzahl Fragen</div><div class="schalter wrap" id="zf-anz">${[20, 40, 60, 100].map(n => `<button data-n="${n}" class="${n === 60 ? 'an' : ''}">${n}</button>`).join('')}</div></div>
      <div class="pausenbrett">${zeilen.map(z => `<button class="glas aktion" data-zf="${z.key}" ${z.n ? '' : 'disabled'}><span class="aktion-icon">🎲</span><b>${E(z.p.name)}</b><span>${E(z.p.sub)}</span><span class="klein">${z.n} Fragen im Pool · ${z.neu} noch ungezogen · ${z.p.zeit} min</span></button>`).join('')}</div>
      <p class="unter klein">Offene Aufgaben (Freitext/Szenario) bewertest du am Ende selbst mit der Musterlösung; sie machen höchstens etwa jede achte Frage aus.</p>`;
    let anz = 60;
    document.querySelectorAll('#zf-anz button').forEach(b => b.onclick = () => { anz = +b.dataset.n; document.querySelectorAll('#zf-anz button').forEach(x => x.classList.toggle('an', x === b)); });
    document.querySelectorAll('[data-zf]').forEach(b => b.onclick = () => zufallStart(b.dataset.zf, anz));
  }
  function zufallStart(key, anz = 60) {
    const pool = POOLS[key]; if (!pool) return;
    const z = zieheZufall(key, anz);
    if (!z.items.length) { toast('Keine Fragen in diesem Pool.'); return; }
    if (z.neueRunde) toast('Pool einmal komplett durch – neue Runde beginnt! 🎉', 'gold');
    gehe('quiz', 'pruefung');
    Lernen.pruefung(z.items, { sek: pool.zeit * 60, titel: `Zufallsprüfung ${pool.name} #${P().zufall.n}`, tag: pool.tag });
  }

  // ---------- Aufgabe des Tages ----------
  let poolCache = null, poolStand = -1;
  function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function tagesPool() {
    Formen.alle(); // S.items sicherstellen
    if (poolCache && poolStand === S.items.length) return poolCache;
    let kand = Formen.alle(d => passtZuTag(d, 'AP1') || passtZuTag(d, 'AP2') || passtZuTag(d, 'WiSo'), AUTO);
    if (kand.length < 30) kand = Formen.alle(null, AUTO);
    kand = kand.slice().sort((a, b) => a.id < b.id ? -1 : 1);
    const r = rng(20260210);
    for (let i = kand.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [kand[i], kand[j]] = [kand[j], kand[i]]; }
    poolCache = kand; poolStand = S.items.length;
    return kand;
  }
  function naechsteAufgabe() {
    const hist = new Set(TA().historie.map(h => h.id));
    const pool = tagesPool();
    return pool.find(it => !hist.has(it.id)) || pool[TA().historie.length % Math.max(1, pool.length)] || null;
  }
  const fmtRest = ms => { const m = Math.max(0, Math.ceil(ms / 60000)); return `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, '0')} min`; };
  const naechsteIn = () => { const t = TA(); return Math.max(0, (t.ausgegeben || 0) + TAG_MS - Date.now()); };

  let gezeigtFuer = 0;
  function pruefeTag(manuell) {
    try {
      if (!S.p || !S.p.profil || !S.items && !S.docs.length) return;
      const t = TA(), jetzt = Date.now();
      if (!(t.aktuell && !t.aktuell.erledigt) && (!t.ausgegeben || jetzt - t.ausgegeben >= TAG_MS)) {
        const it = naechsteAufgabe(); if (!it) return;
        t.aktuell = { id: it.id, nr: t.historie.length + 1, t: jetzt, erledigt: false };
        t.ausgegeben = jetzt; speichern();
        if (window.Mot) Mot.chip();
      }
      if (t.aktuell && !t.aktuell.erledigt) {
        const gesperrt = document.getElementById('ta-overlay') || document.getElementById('intro') || (S.ansicht && ['quiz', 'spiel', 'terminal', 'netsim', 'speicher', 'sql', 'domaene', 'wireshark'].includes(S.ansicht.ansicht));
        if (manuell || (!gesperrt && gezeigtFuer !== t.aktuell.t)) { gezeigtFuer = t.aktuell.t; oeffneTagesaufgabe(); }
      }
    } catch (e) { console.warn('Tagesaufgabe', e); }
  }
  function schliesseTa() { const o = document.getElementById('ta-overlay'); if (o) o.remove(); if (S.ansicht && S.ansicht.ansicht === 'home') gehe('home', undefined, true); else if (S.ansicht && S.ansicht.ansicht === 'tagesaufgabe') tagesaufgabe(); }
  function oeffneTagesaufgabe() {
    const t = TA(); if (!t.aktuell || t.aktuell.erledigt) return;
    const it = Formen.nachId(t.aktuell.id);
    if (!it) { t.aktuell = null; t.ausgegeben = 0; speichern(); return; }
    const alt = document.getElementById('ta-overlay'); if (alt) alt.remove();
    const o = document.createElement('div'); o.id = 'ta-overlay';
    o.innerHTML = `<div class="glas ta-box" role="dialog" aria-modal="true" aria-label="Aufgabe des Tages">
      <div class="ta-kopf"><div><span class="ta-badge">🎯 Aufgabe des Tages</span><h2>Nr. ${t.aktuell.nr} von 365</h2><small>${E(bereichName(it.doc.bereich))} · ${E(it.doc.titel)} · 🔥 Tages-Serie ${t.serie}</small></div><button class="glas icon" id="ta-zu" title="Später (Esc)">✕</button></div>
      <div id="ta-item"></div><div id="ta-ergebnis"></div>
      <div class="lesen-fuss"><button class="glas knopf" id="ta-spaeter">Später lösen</button></div></div>`;
    document.body.appendChild(o);
    const zu = () => { o.remove(); };
    $('#ta-zu').onclick = zu; $('#ta-spaeter').onclick = zu;
    o.addEventListener('click', e => { if (e.target === o) zu(); });
    Formen.render(it, $('#ta-item'), { modus: 'uebung', state: {}, fertig: r => {
      const ok = r.max && (r.punkte / r.max) >= (it.art === 'mc' ? 1 : 0.5);
      t.aktuell.erledigt = true; t.aktuell.ok = !!ok;
      t.historie.push({ id: it.id, ok: !!ok, datum: heute(), nr: t.aktuell.nr });
      if (t.letzterTag === plusTage(-1)) t.serie++; else if (t.letzterTag !== heute()) t.serie = 1;
      t.letzterTag = heute(); t.best = Math.max(t.best, t.serie);
      speichern();
      melde('tagesaufgabe', 1, { ok: !!ok });
      const bonus = 30 + (ok ? 20 : 0);
      const ez = $('#ta-ergebnis');
      if (ez) ez.innerHTML = `<div class="ta-fertig ${ok ? 'ok' : 'nein'}"><b>${ok ? '✓ Richtig!' : '✗ Diesmal nicht – die Lösung steht oben.'}</b> +${bonus} Bonus-XP · Aufgabe ${t.historie.length}/365 · 🔥 Serie ${t.serie}<br><small>Nächste Aufgabe in ${fmtRest(naechsteIn())}.</small></div>`;
      const sp = $('#ta-spaeter'); if (sp) { sp.textContent = 'Fertig'; sp.className = 'glas knopf primär'; sp.onclick = schliesseTa; }
      $('#ta-zu').onclick = schliesseTa;
    } });
  }
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && document.getElementById('ta-overlay')) { e.preventDefault(); e.stopImmediatePropagation(); document.getElementById('ta-overlay').remove(); }
  }, true);

  function tagesaufgabe() {
    krumen([START, { txt: 'Aufgabe des Tages' }]);
    const t = TA(), offen = t.aktuell && !t.aktuell.erledigt;
    const ok = t.historie.filter(h => h.ok).length;
    $('#inhalt').innerHTML = `<h1>Aufgabe des Tages</h1>
      <p class="unter">Alle 24 Stunden wartet eine neue Frage aus AP1/AP2/WiSo auf dich – 365 Tage, 365 Aufgaben. Die App merkt sich, wann die nächste dran ist.</p>
      <section class="karte-w"><div class="ta-stand">
        <div class="ta-zahl"><b>${t.historie.length}</b><small>von 365 erledigt</small></div>
        <div class="ta-zahl"><b>${ok}</b><small>richtig</small></div>
        <div class="ta-zahl"><b>🔥 ${t.serie}</b><small>Tage am Stück (Rekord ${t.best})</small></div>
        <div class="ta-zahl"><b>${offen ? 'offen' : fmtRest(naechsteIn())}</b><small>${offen ? 'heutige Aufgabe wartet' : 'bis zur nächsten Aufgabe'}</small></div></div>
        <div class="lesen-fuss">${offen ? '<button class="glas knopf primär" id="ta-jetzt">Aufgabe jetzt lösen</button>' : '<button class="glas knopf" id="ta-pruef">Neu prüfen</button>'}</div></section>
      <h2>Dein 365-Tage-Raster</h2>
      <div class="ta-raster">${Array.from({ length: 365 }, (_, i) => { const h = t.historie[i]; return `<span class="ta-feld ${h ? (h.ok ? 'ok' : 'nein') : (offen && i === t.historie.length ? 'jetzt' : '')}" title="Tag ${i + 1}${h ? (h.ok ? ' ✓' : ' ✗') : ''}">${i + 1}</span>`; }).join('')}</div>`;
    const b = $('#ta-jetzt'); if (b) b.onclick = () => pruefeTag(true);
    const c = $('#ta-pruef'); if (c) c.onclick = () => { pruefeTag(true); tagesaufgabe(); };
  }

  // ---------- Startseiten-Karte ----------
  function homeHtml() {
    const t = TA(), offen = t.aktuell && !t.aktuell.erledigt, m = meisterschaft();
    const rest = naechsteIn();
    return `<section class="karte-w ziele-w"><div class="w-titel">🎯 Aufgabe des Tages</div>
      <p class="ta-zeile">${offen ? `<b>Nr. ${t.aktuell.nr} wartet auf dich!</b>` : `<b>Erledigt ✓</b> · nächste in ${fmtRest(rest)}`}<br><small>${t.historie.length}/365 · 🔥 Serie ${t.serie}</small></p>
      <div class="balken"><i style="width:${Math.round(t.historie.length / 365 * 100)}%"></i></div>
      <div class="lesen-fuss klein"><button class="glas knopf ${offen ? 'primär' : ''}" data-go="tagesaufgabe">${offen ? 'Jetzt lösen' : 'Raster ansehen'}</button><button class="glas knopf" data-go="zufall">Zufallsprüfung</button><button class="glas knopf" data-go="fortschritt">Fortschritt ${m.pz} %</button></div></section>`;
  }

  function start() {
    patchFormen();
    P();
    setTimeout(() => pruefeTag(false), 1200);
    setInterval(() => pruefeTag(false), 60000);
  }

  window.VIEWS = Object.assign(window.VIEWS || {}, { fortschritt, schwierigkeit, zufall, tagesaufgabe });
  patchFormen();
  return { start, homeHtml, mini, docStat, bereichStat, tagStat, gesamtStat, balken, meisterschaft, zaehle, erfolgreich, vorgabe, zufallStart, pruefeTag, oeffneTagesaufgabe, markerHtml };
})();
window.Ziele = Ziele;
