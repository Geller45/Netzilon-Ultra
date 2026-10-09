// Netzilon Ultra – Schwächenanalyse: Themen-Ampel, Fehlerkatalog, automatischer Wiederholplan, Tagesplan, IHK-Notenprognose
const Analyse = (() => {
  let cache = null, cacheZeit = 0;
  function statsJeDoc() {
    if (cache && Date.now() - cacheZeit < 1500) return cache;
    const m = {};
    for (const [id, s] of Object.entries(S.p.quiz)) {
      const d = id.split('#')[0], x = m[d] || (m[d] = { r: 0, f: 0, ok: 0, nok: 0 });
      x.r += s.r || 0; x.f += s.f || 0; if (s.zuletzt) x.ok++; else x.nok++;
    }
    for (const [id, k] of Object.entries(S.p.karten)) {
      const d = id.split('#')[0], x = m[d] || (m[d] = { r: 0, f: 0, ok: 0, nok: 0 });
      x.kn = (x.kn || 0) + 1; x.kl = (x.kl || 0) + (k.lapses || 0); x.kef = (x.kef || 0) + (k.ef || 2.5);
    }
    cache = m; cacheZeit = Date.now(); return m;
  }
  function wert(d) {
    const s = statsJeDoc()[d.id];
    if (!s) return null;
    const teile = [];
    if (s.ok + s.nok) teile.push([s.ok / (s.ok + s.nok), 2]);
    if (s.kn) teile.push([Math.max(0, Math.min(1, 1 - s.kl / (s.kn * 1.5))) * Math.max(0.3, Math.min(1, (s.kef / s.kn - 1.3) / 1.2)), 1]);
    if (!teile.length) return null;
    return teile.reduce((n, [v, g]) => n + v * g, 0) / teile.reduce((n, [, g]) => n + g, 0);
  }
  function ampel(d) {
    const w = wert(d);
    if (w === null) return S.p.gelesen[d.id] ? { farbe: 'gelb', txt: 'gelesen, noch nicht geübt', wert: 0.55 } : { farbe: 'grau', txt: 'noch offen', wert: null };
    const p = Math.round(w * 100);
    return w >= 0.8 ? { farbe: 'gruen', txt: `sitzt (${p} %)`, wert: w } : w >= 0.5 ? { farbe: 'gelb', txt: `wackelt (${p} %)`, wert: w } : { farbe: 'rot', txt: `Schwäche (${p} %)`, wert: w };
  }
  const schwacheDocs = () => S.docs.map(d => ({ d, a: ampel(d) })).filter(x => x.a.farbe === 'rot' || (x.a.farbe === 'gelb' && x.a.wert !== null && x.a.wert < 0.8 && wert(x.d) !== null)).sort((a, b) => (a.a.wert ?? 1) - (b.a.wert ?? 1)).map(x => x.d);
  const fehlerItems = () => Object.entries(S.p.quiz).filter(([, s]) => s.zuletzt === false).map(([id, s]) => ({ it: Formen.nachId(id), s })).filter(x => x.it);

  // ---- Tagesplan ----
  function tagesplan() {
    const L = S.p.lernen, t = window.Mot ? Mot.tagCheck() : { minuten: 0, z: {} };
    const karten = Math.min(Lernen.faelligAnzahl() + Lernen.neuHeute(), Math.max(L.neuProTag, Lernen.faelligAnzahl()));
    const fragen = L.fragenProTag || 10;
    const pt = Plan.tag(heute());
    let thema = null, grund = '';
    if (pt.fach) { thema = Plan.docsFuerFach(pt.fach).find(d => !S.p.gelesen[d.id]); if (thema) grund = `Fach heute: ${pt.fach}`; }
    if (!thema) { const s = schwacheDocs()[0]; if (s) { thema = s; grund = 'größte Schwäche'; } }
    if (!thema) { thema = S.docs.find(d => !S.p.gelesen[d.id] && d.typ === 'thema'); if (thema) grund = 'nächstes ungelesenes Thema'; }
    const min = Math.round(karten * 0.4 + fragen * 1.2 + (thema ? 15 : 0));
    return { karten, fragen, thema, grund, min, gelernt: t.minuten || 0, ziel: L.minutenProTag, erledigtK: (t.z || {}).karte || 0, erledigtF: ((t.z || {}).richtig || 0) + ((t.z || {}).falsch || 0) };
  }
  function tagesplanHtml() {
    const tp = tagesplan();
    return `<section class="karte-w tagesplan"><div class="w-titel">🗓 Tagesplan</div>
      <h3>Heute: ca. ${tp.min} Minuten${tp.thema ? `, ${E(tp.thema.titel)}` : ''}, ${tp.karten} Karten, ${tp.fragen} Fragen</h3>
      <ul class="tp-liste">
        ${tp.thema ? `<li class="${S.p.gelesen[tp.thema.id] ? 'ok' : ''}"><a class="verweis" data-go="lesen" data-param="${E(tp.thema.id)}">Thema: ${E(tp.thema.titel)}</a> <small>(${E(tp.grund)})</small></li>` : ''}
        <li class="${tp.erledigtK >= tp.karten && tp.karten ? 'ok' : ''}"><a class="verweis" data-go="karteikarten">${tp.karten} Karteikarten</a> <small>${tp.erledigtK} erledigt</small></li>
        <li class="${tp.erledigtF >= tp.fragen ? 'ok' : ''}"><a class="verweis" id="tp-fragen">${tp.fragen} Fragen (Schwächen + Fach)</a> <small>${tp.erledigtF} beantwortet</small></li>
      </ul><small>Lernzeit heute: ${tp.gelernt} von ${tp.ziel} min</small></section>`;
  }
  function tagesFragen() {
    const tp = tagesplan(), schwach = new Set(schwacheDocs().slice(0, 15).map(d => d.id)), pt = Plan.tag(heute());
    const fach = pt.fach ? new Set(Plan.docsFuerFach(pt.fach).map(d => d.id)) : new Set();
    let pool = Formen.alle(d => schwach.has(d.id) || fach.has(d.id), ['mc', 'luecke', 'zuordnen', 'reihenfolge']);
    if (pool.length < tp.fragen) pool = pool.concat(mischen(Formen.alle(null, ['mc', 'luecke'])).slice(0, tp.fragen * 2));
    const fr = mischen(pool).slice(0, tp.fragen);
    if (!fr.length) { toast('Noch keine Aufgaben vorhanden.'); return; }
    gehe('quiz', 'uebung'); Lernen.uebung(fr);
  }
  document.addEventListener('click', e => { if (e.target.closest('#tp-fragen')) { e.preventDefault(); tagesFragen(); } });

  // ---- Notenprognose ----
  function prognose(tag) {
    const docs = S.docs.filter(d => passtZuTag(d, tag)), ids = new Set(docs.map(d => d.id));
    if (!docs.length) return null;
    const items = docs.reduce((n, d) => n + Formen.itemsVon(d).length, 0);
    let versucht = 0, ok = 0;
    for (const [id, s] of Object.entries(S.p.quiz)) if (ids.has(id.split('#')[0])) { versucht++; if (s.zuletzt) ok++; }
    const abd = items ? Math.min(1, versucht / items) : 0, quote = versucht ? ok / versucht : 0;
    const basis = versucht ? (quote * 100) * abd + 25 * (1 - abd) + (quote * 100 - 25) * (1 - abd) * 0.5 : null;
    const pr = S.p.pruefungen.filter(p => p.tag === tag).slice(-3);
    const prAvg = pr.length ? pr.reduce((n, p) => n + p.prozent, 0) / pr.length : null;
    const wertP = basis === null ? prAvg : prAvg === null ? basis : basis * 0.5 + prAvg * 0.5;
    if (wertP === null) return { tag, docs: docs.length, items, versucht, abd, quote, wert: null };
    const pz = Math.round(Math.max(0, Math.min(100, wertP)));
    return { tag, docs: docs.length, items, versucht, abd, quote, pruef: pr.length, prAvg, wert: pz, note: note(pz), sicher: abd >= 0.3 || pr.length >= 2 };
  }

  // ---- Ansicht ----
  function ansicht(tab = 'ampel') {
    krumen([START, { txt: 'Schwächenanalyse' }]);
    const tabs = { ampel: 'Themen-Ampel', fehler: 'Fehlerkatalog', wiederholen: 'Wiederholplan', prognose: 'Notenprognose' };
    $('#inhalt').innerHTML = `<h1>Schwächenanalyse</h1><p class="unter">Grün = sitzt (≥ 80 %), Gelb = wackelt, Rot = Schwäche (< 50 %), Grau = noch nicht bearbeitet. Grundlage: letzte Antworten und Karteikarten-Verlauf.</p>
      <div class="filterleiste">${Object.entries(tabs).map(([k, v]) => `<button class="glas knopf ${k === tab ? 'an' : ''}" data-go="analyse" data-param="${k}">${v}</button>`).join('')}</div><div id="an-inhalt"></div>`;
    const el = $('#an-inhalt');
    if (tab === 'fehler') return fehlerkatalog(el);
    if (tab === 'wiederholen') return wiederholplan(el);
    if (tab === 'prognose') return prognoseAnsicht(el);
    // Ampel nach Bereich/Kapitel
    const zaehl = { gruen: 0, gelb: 0, rot: 0, grau: 0 };
    const html = BEREICHE.filter(b => docsIn(b.key).length).map(b => {
      const kap = kapitelVon(b.key);
      return `<details class="abschnitt"><summary>${E(b.name)} ${ampelLeiste(docsIn(b.key), zaehl)}</summary><div class="text">${kap.map(k => { const l = docsIn(b.key).filter(d => d.kapitel === k);
        return `<div class="amp-kap"><b>${E(k || '(ohne Kapitel)')}</b><div class="amp-themen">${l.map(d => { const a = ampel(d); return `<a class="amp-thema ${a.farbe}" data-go="lesen" data-param="${E(d.id)}" title="${E(a.txt)}"><i class="ampel ${a.farbe}"></i>${E(d.titel)}</a>`; }).join('')}</div></div>`; }).join('')}</div></details>`;
    }).join('');
    el.innerHTML = `<div class="pausenbrett klein">${[['gruen', 'sitzt'], ['gelb', 'wackelt'], ['rot', 'Schwäche'], ['grau', 'offen']].map(([f, t]) => `<div class="glas aktion"><b><i class="ampel ${f}"></i> ${zaehl[f]}</b><span>${t}</span></div>`).join('')}</div>${html}`;
  }
  function ampelLeiste(list, zaehl) {
    const z = { gruen: 0, gelb: 0, rot: 0, grau: 0 }; list.forEach(d => { const f = ampel(d).farbe; z[f]++; if (zaehl) zaehl[f]++; });
    const n = list.length || 1;
    return `<span class="amp-leiste">${['gruen', 'gelb', 'rot', 'grau'].map(f => `<i class="${f}" style="width:${z[f] / n * 100}%"></i>`).join('')}</span><small>${z.rot ? z.rot + ' rot · ' : ''}${z.gruen}/${list.length} grün</small>`;
  }
  function fehlerkatalog(el) {
    const f = fehlerItems();
    const frueher = Object.entries(S.p.quiz).filter(([, s]) => s.zuletzt && s.f > 0).length;
    if (!f.length) { el.innerHTML = `<p class="leer">Keine offenen Fehler. ${frueher ? `${frueher} frühere Fehler hast du inzwischen richtig. 💪` : 'Leg los – falsch beantwortete Aufgaben landen hier automatisch.'}</p>`; return; }
    const nachB = {};
    f.forEach(x => (nachB[x.it.doc.bereich] = nachB[x.it.doc.bereich] || []).push(x));
    el.innerHTML = `<p class="unter">${f.length} Aufgaben zuletzt falsch beantwortet · ${frueher} frühere Fehler inzwischen korrigiert.</p>
      <div class="lesen-fuss"><button class="glas knopf primär" id="fk-ueben">Alle Fehler üben</button><button class="glas knopf" id="fk-druck">Drucken</button></div>
      ${Object.entries(nachB).map(([b, l]) => `<h2>${E(bereichName(b))} (${l.length})</h2>${l.map(({ it, s }) => `<div class="glas fehler-karte"><div class="item-kopf"><span class="art-chip">${Formen.ARTEN[it.art]}</span><span class="art-chip">${s.f}× falsch · ${s.r}× richtig</span></div>
        <div class="frage">${Parser.inline(it.frage || it.titel || it.text)}</div>${Formen.loesungHtml(it, {})}
        <p class="unter klein">Aus: <a class="verweis" data-go="lesen" data-param="${E(it.doc.id)}">${E(it.doc.titel)}</a></p></div>`).join('')}`).join('')}`;
    $('#fk-ueben').onclick = () => { gehe('quiz', 'uebung'); Lernen.uebung(mischen(f.map(x => x.it)).slice(0, 40)); };
    $('#fk-druck').onclick = () => Extras.drucken();
  }
  function wiederholplan(el) {
    const schwach = schwacheDocs();
    const faellig = Lernen.faelligAnzahl();
    const stufen = [['Heute', 0, 4], ['Morgen', 1, 4], ['In 3 Tagen', 3, 5], ['In 1 Woche', 7, 6], ['In 2 Wochen', 14, 99]];
    let k = 0;
    el.innerHTML = `<p class="unter">Automatisch nach dem Prinzip „verteiltes Wiederholen“: schwächste Themen zuerst, dann in wachsenden Abständen. Dazu kommen ${faellig} fällige Karteikarten.</p>
      ${schwach.length ? stufen.map(([t, tage, n]) => { const l = schwach.slice(k, k + n); k += n; return l.length ? `<div class="wp-stufe"><h3>${t} <small>${Plan.dtxt(plusTage(tage))}</small></h3>${l.map(d => `<div class="wp-zeile"><i class="ampel ${ampel(d).farbe}"></i><a class="verweis" data-go="lesen" data-param="${E(d.id)}">${E(d.titel)}</a><small>${E(ampel(d).txt)}</small><button class="glas knopf klein" data-ueben="${E(d.id)}">Üben</button></div>`).join('')}</div>` : ''; }).join('') : '<p class="leer">Keine roten oder gelben Themen – entweder alles grün oder noch nichts geübt.</p>'}
      <div class="lesen-fuss"><button class="glas knopf primär" data-go="karteikarten">Fällige Karten (${faellig})</button><button class="glas knopf" data-go="analyse" data-param="fehler">Fehlerkatalog</button></div>`;
    el.querySelectorAll('[data-ueben]').forEach(b => b.onclick = () => { const its = Formen.itemsVon(S.byId[b.dataset.ueben]).filter(i => !Formen.selbstbewertet(i)); if (!its.length) { toast('Keine Aufgaben in diesem Thema – lies es noch einmal.'); return; } gehe('quiz', 'uebung'); Lernen.uebung(mischen(its).slice(0, 15)); });
  }
  function prognoseAnsicht(el) {
    const rows = PRUEF_TAGS.map(prognose).filter(Boolean);
    el.innerHTML = `<p class="unter">Prognose = Trefferquote deiner letzten Antworten, gewichtet mit der Abdeckung (wie viel vom Stoff du schon geübt hast) und deinen letzten Prüfungsergebnissen. Ungeübter Stoff wird zwischen Raten (25 %) und deiner bisherigen Quote angesetzt. Sicher erst ab ca. 30 % Abdeckung.</p>
      <div class="prognose">${rows.map(r => `<div class="glas prog-karte ${r.wert === null ? 'leer' : 'n' + r.note[1]}">
        <div class="prog-kopf"><b>${E(r.tag)}</b>${r.wert !== null ? `<span class="prog-note">${r.note[1]}</span>` : ''}</div>
        ${r.wert !== null ? `<div class="prog-wert">${r.wert} % · ${r.note[2]}${r.sicher ? '' : ' <small>(unsicher)</small>'}</div>` : '<div class="prog-wert">noch keine Daten</div>'}
        <div class="balken"><i style="width:${Math.round(r.abd * 100)}%"></i></div>
        <small>${r.docs} Themen · ${r.versucht}/${r.items} Aufgaben geübt (${Math.round(r.abd * 100)} %)${r.versucht ? ` · ${Math.round(r.quote * 100)} % richtig` : ''}${r.pruef ? ` · Ø ${Math.round(r.prAvg)} % in ${r.pruef} Prüfung(en)` : ''}</small></div>`).join('')}</div>
      <p class="tipp">IHK-Schlüssel: 100–92 = 1 · 91–81 = 2 · 80–67 = 3 · 66–50 = 4 · 49–30 = 5 · 29–0 = 6</p>`;
  }

  window.VIEWS = Object.assign(window.VIEWS || {}, { analyse: ansicht });
  return { ampel, wert, schwacheDocs, fehlerItems, tagesplan, tagesplanHtml, prognose, ampelLeiste };
})();
window.Analyse = Analyse;
