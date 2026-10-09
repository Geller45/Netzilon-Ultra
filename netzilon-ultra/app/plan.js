// Netzilon Ultra – Lernplanung: Ausbildungsplan (IT-Akademie, FiSi) Tag für Tag, Startseiten-Widgets,
// Kalender, Fahrplan, Fortschritt je Fach, Prüfungstermine mit Countdown und Rückwärts-Lernplan.
const Plan = (() => {
  // ---- Fächer laut Ausbildungsplan (exakt wie in der Vorlage geschrieben) ----
  const F = {
    START: 'Start / ITK', ITK: 'ITK / Grundlagen', OF: 'Office (EF)', GDP: 'GDP / OOP', SQLDB: 'SQL / Datenbanken', SQLA: 'SQL / Admin',
    L1: 'Linux I', L2: 'Linux II', WSB: 'Windows Server / Basic', WSA: 'Windows Server / Adv.', AZ8: 'Windows Server / AZ - 800', AZ1: 'Windows Server / AZ - 801',
    CB: 'TCP/IP – CCNA – Basic', CA: 'CCNA – Adv.', PV1: 'PV – AP1', AP1: 'AP 1', PV2: 'PV – AP2'
  };
  // Kürzel: S = Sa., O = So., R = Ferien, '' = kein Eintrag, 'F:Name' = Feiertag, 'S:Notiz' / 'O:Notiz' = Wochenende mit Notiz
  const r = (code, n) => Array(n).fill(code);
  const MONATE = {
    '2026-02': ['O', 'START', ...r('ITK', 4), 'S', 'O', ...r('OF', 5), 'S', 'O', ...r('OF', 5), 'S', 'O', ...r('ITK', 5), 'S'],
    '2026-03': ['O', '', ...r('ITK', 4), 'S', 'O', ...r('ITK', 5), 'S', 'O', ...r('ITK', 5), 'S', 'O', ...r('ITK', 5), 'S', 'O', 'GDP', 'GDP'],
    '2026-04': ['GDP', 'GDP', 'F:Karfreitag', 'S', 'O', 'F:Ostermontag', ...r('GDP', 4), 'S', 'O', ...r('GDP', 5), 'S', 'O', ...r('GDP', 5), 'S', 'O', 'GDP', 'GDP', 'SQLDB', 'SQLDB'],
    '2026-05': ['F:Tag der Arbeit', 'S', 'O', ...r('SQLDB', 5), 'S', 'O', ...r('SQLDB', 3), 'F:Christi Himmelfahrt', 'R', 'S', 'O', ...r('SQLDB', 5), 'S', 'O', 'F:Pfingstmontag', 'SQLDB', 'SQLA', 'SQLA', 'SQLA', 'S', 'O'],
    '2026-06': [...r('SQLA', 3), 'F:Fronleichnam', 'R', 'S', 'O', ...r('SQLA', 5), 'S', 'O', ...r('L1', 5), 'S', 'O', ...r('L1', 5), 'S', 'O', 'L1', 'L1'],
    '2026-07': [...r('L1', 3), 'S', 'O', ...r('L1', 5), 'S', 'O', ...r('L2', 5), 'S', 'O', ...r('R', 5), 'S', 'O', ...r('R', 5)],
    '2026-08': ['S', 'O', ...r('L2', 5), 'S', 'O', ...r('L2', 5), 'S', 'O', 'L2', 'L2', ...r('WSB', 3), 'S', 'O', ...r('WSB', 5), 'S', 'O', 'WSB'],
    '2026-09': [...r('WSB', 4), 'S', 'O', ...r('WSB', 5), 'S', 'O', 'WSB', 'WSB', ...r('WSA', 3), 'S', 'O', ...r('WSA', 5), 'S', 'O', ...r('WSA', 3)],
    '2026-10': ['WSA', 'WSA', 'S:Tag der Deutschen Einheit', 'O', ...r('WSA', 5), 'S', 'O', ...r('WSA', 5), 'S', 'O', ...r('WSA', 5), 'S', 'O', ...r('AZ8', 5), 'S'],
    '2026-11': ['O:Allerheiligen', ...r('AZ8', 5), 'S', 'O', ...r('AZ8', 5), 'S', 'O', ...r('AZ8', 5), 'S', 'O', ...r('AZ1', 5), 'S', 'O', 'AZ1'],
    '2026-12': [...r('AZ1', 4), 'S', 'O', ...r('AZ1', 5), 'S', 'O', ...r('AZ1', 5), 'S', 'O', ...r('AZ1', 3), 'R', 'F:1. Weihnachtsfeiertag', 'S', 'O', ...r('R', 4)],
    '2027-01': ['F:Neujahr', 'S', 'O', ...r('CB', 5), 'S', 'O', ...r('CB', 5), 'S', 'O', '', ...r('CB', 4), 'S', 'O', ...r('CB', 5), 'S', 'O'],
    '2027-02': [...r('CB', 5), 'S', 'O', ...r('PV1', 5), 'S', 'O', ...r('PV1', 5), 'S', 'O', 'PV1', 'PV1', 'AP1', 'CB', 'CB', 'S', 'O'],
    '2027-03': [...r('CB', 5), 'S', 'O', ...r('CB', 5), 'S', 'O', ...r('CB', 5), 'S', 'O', ...r('CA', 4), 'F:Karfreitag', 'S', 'O', 'F:Ostermontag', '', ''],
    '2027-04': ['CA', 'CA', 'S', 'O', ...r('CA', 5), 'S', 'O', ...r('CA', 5), 'S', 'O', ...r('CA', 5), 'S', 'O', ...r('R', 5)],
    '2027-11': ['F:Allerheiligen', ...r('PV2', 4), 'S', 'O', ...r('PV2', 5), 'S', 'O', ...r('PV2', 5), 'S', 'O', ...r('PV2', 5), 'S', 'O', 'PV2', 'PV2']
  };
  // Farbige Markierungen der Vorlage (hellgrau/dunkelgrau, meist Fachwechsel)
  const MARKIERT = { '2026-02-02': 'hell', '2026-03-02': 'dunkel', '2026-03-30': 'dunkel', '2026-04-29': 'hell', '2026-05-27': 'dunkel', '2026-06-24': 'hell', '2026-07-22': 'dunkel', '2026-08-19': 'hell', '2026-09-16': 'dunkel' };
  const WT = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
  const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const ausIso = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
  const dtxt = s => ausIso(s).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const tageBis = s => Math.round((ausIso(s) - ausIso(heute())) / 86400000);

  // Tabelle aller Tage
  const TAGE = {};
  for (const [ym, liste] of Object.entries(MONATE)) liste.forEach((code, k) => {
    const datum = `${ym}-${String(k + 1).padStart(2, '0')}`;
    let t;
    if (code === 'S' || code.startsWith('S:')) t = { art: 'wochenende', text: 'Sa.' + (code.length > 2 ? ` (${code.slice(2)})` : '') };
    else if (code === 'O' || code.startsWith('O:')) t = { art: 'wochenende', text: 'So.' + (code.length > 2 ? ` (${code.slice(2)})` : '') };
    else if (code === 'R') t = { art: 'ferien', text: 'Ferien' };
    else if (code.startsWith('F:')) t = { art: 'feiertag', text: 'Feiertag (' + code.slice(2) + ')' };
    else if (!code) t = { art: 'leer', text: 'kein Eintrag im Plan' };
    else t = { art: code === 'AP1' ? 'pruefung' : 'fach', fach: F[code], text: F[code] };
    TAGE[datum] = { datum, ...t, markiert: MARKIERT[datum] || '' };
  });
  const ALLE_FAECHER = [...new Set(Object.values(TAGE).filter(t => t.fach).map(t => t.fach))];
  const ERSTER = Object.keys(TAGE).sort()[0], LETZTER = Object.keys(TAGE).sort().slice(-1)[0];

  function tag(datum) {
    if (TAGE[datum]) return TAGE[datum];
    const wd = ausIso(datum).getDay();
    if (wd === 0 || wd === 6) return { datum, art: 'wochenende', text: WT[wd] + '.' };
    return { datum, art: 'unbekannt', text: datum < ERSTER ? 'vor Ausbildungsbeginn' : 'nicht im Plan (Monat fehlt in der Vorlage)' };
  }
  function naechsterFachtag(ab) {
    const d = ausIso(ab);
    for (let k = 1; k < 120; k++) { d.setDate(d.getDate() + 1); const t = tag(iso(d)); if (t.fach) return t; if (iso(d) > LETZTER) break; }
    return null;
  }
  // ---- Fach ↔ Inhalte (Kopf "fach:", sonst sinnvolle Zuordnung über Bereich/Ordner) ----
  const fnorm = s => String(s || '').toLowerCase().replace(/[–—]/g, '-').replace(/\s+/g, '').replace(/\.$/, '').replace('adv.', 'adv').replace('fortgeschritten', 'adv');
  const FALLBACK = {
    [F.START]: d => d.bereich === 'AP1', [F.ITK]: d => d.bereich === 'AP1',
    [F.OF]: d => /office|excel|word|tabellenkalk/i.test(d.titel + d.kapitel),
    [F.GDP]: d => d.bereich === 'Bonus' || /pseudocode|programmier|oop|struktogramm/i.test(d.titel + d.kapitel),
    [F.SQLDB]: d => d.bereich === 'Datenbanken', [F.SQLA]: d => d.bereich === 'Datenbanken',
    [F.L1]: d => d.bereich === 'Linux', [F.L2]: d => d.bereich === 'Linux',
    [F.WSB]: d => /(^|\/)ap1\/a6-windows\//.test(d.order) || /(^|\/)server\//.test(d.order),
    [F.WSA]: d => /(^|\/)server\//.test(d.order) || /a13-pruefungsfragen/.test(d.order) || (d.bereich === 'AZ-800' && /d1-adds/.test(d.order)),
    [F.AZ8]: d => d.bereich === 'AZ-800', [F.AZ1]: d => d.bereich === 'AZ-801',
    [F.CB]: d => d.bereich === 'CCNA' || /(^|\/)ap1\/a4-netzwerk\//.test(d.order) || /(^|\/)netz\//.test(d.order), [F.CA]: d => d.bereich === 'CCNA',
    [F.PV1]: d => passtZuTag(d, 'AP1'), [F.AP1]: d => passtZuTag(d, 'AP1'), [F.PV2]: d => passtZuTag(d, 'AP2') || d.bereich === 'WiSo'
  };
  function docsFuerFach(fach) {
    const n = fnorm(fach), fb = FALLBACK[fach];
    const exakt = S.docs.filter(d => d.fach.some(f => fnorm(f) === n));
    const weitere = fb ? S.docs.filter(d => !exakt.includes(d) && !d.fach.length && fb(d)) : [];
    return [...exakt, ...weitere];
  }
  function fachStand(fach) {
    const list = docsFuerFach(fach), ids = new Set(list.map(d => d.id));
    let r = 0, f = 0; for (const [k, s] of Object.entries(S.p.quiz)) if (ids.has(k.split('#')[0])) { r += s.r; f += s.f; }
    const tage = Object.values(TAGE).filter(t => t.fach === fach), vorbei = tage.filter(t => t.datum <= heute()).length;
    return { list, gelesen: list.filter(d => S.p.gelesen[d.id]).length, quote: r + f ? Math.round(r / (r + f) * 100) : null, tage: tage.length, vorbei };
  }

  // ---- Widgets für die Startseite ----
  function heuteHtml() {
    const t = tag(heute());
    let titel, unter = '', knopf = '';
    if (t.fach) {
      const st = fachStand(t.fach);
      titel = `Heute: ${E(t.fach)}`; unter = `${st.gelesen}/${st.list.length} Themen gelesen${st.quote !== null ? ` · ${st.quote} % richtig` : ''} · Tag ${st.vorbei} von ${st.tage} im Plan`;
      knopf = `<button class="glas knopf primär klein" data-go="plan" data-param="fach:${E(t.fach)}">Zum Fach</button>`;
    } else if (t.art === 'pruefung') { titel = 'Heute: AP 1 – Prüfungstag!'; unter = 'Viel Erfolg! Spickzettel noch einmal durchgehen.'; knopf = '<button class="glas knopf primär klein" data-go="spickzettel" data-param="AP1">Spickzettel AP1</button>'; }
    else {
      const n = naechsterFachtag(heute());
      titel = `Heute: ${E(t.text)}`; unter = (t.art === 'unbekannt' ? '' : 'Zeit für Wiederholung. ') + (n ? `Nächster Schultag ${WT[ausIso(n.datum).getDay()]}, ${dtxt(n.datum)}: ${E(n.fach)}` : '');
      knopf = n ? `<button class="glas knopf klein" data-go="plan" data-param="fach:${E(n.fach)}">Vorbereiten</button>` : '';
    }
    return `<section class="karte-w heute"><div class="w-titel">📅 Ausbildungsplan</div><h3>${titel}</h3><p>${unter}</p><div class="w-fuss">${knopf}<button class="glas knopf klein" data-go="plan">Kalender</button></div></section>`;
  }
  function wocheHtml() {
    const d = ausIso(heute()); const mo = new Date(d); mo.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    const tage = Array.from({ length: 7 }, (_, k) => { const x = new Date(mo); x.setDate(mo.getDate() + k); return tag(iso(x)); });
    return `<h2>Diese Woche</h2><div class="woche">${tage.map(t => `<button class="glas wtag ${t.art} ${t.datum === heute() ? 'heute' : ''}" ${t.fach ? `data-go="plan" data-param="fach:${E(t.fach)}"` : 'data-go="plan"'}><small>${WT[ausIso(t.datum).getDay()]} ${t.datum.slice(8)}.${t.datum.slice(5, 7)}.</small><b>${E(t.fach || t.text)}</b></button>`).join('')}</div>`;
  }
  function fachFortschrittHtml() {
    const faecher = ALLE_FAECHER.filter(f => f !== F.START && f !== F.AP1);
    return `<h2>Fortschritt je Fach</h2><div class="fach-raster">${faecher.map(f => {
      const st = fachStand(f), p = st.list.length ? Math.round(st.gelesen / st.list.length * 100) : 0;
      const akt = tag(heute()).fach === f;
      return `<button class="glas fach-k ${akt ? 'akt' : ''}" data-go="plan" data-param="fach:${E(f)}"><b>${E(f)}</b><span>${st.list.length ? `${st.gelesen}/${st.list.length} Themen · ${st.quote !== null ? st.quote + ' % richtig' : 'noch kein Quiz'}` : 'noch keine Inhalte zugeordnet'}</span><div class="balken"><i style="width:${p}%"></i></div><small>${st.vorbei >= st.tage ? 'im Plan abgeschlossen' : st.vorbei ? `läuft · Tag ${st.vorbei}/${st.tage}` : `ab ${dtxt(Object.values(TAGE).find(t => t.fach === f).datum)}`}</small></button>`;
    }).join('')}</div>`;
  }
  function countdownHtml() {
    const kommend = (S.p.termine || []).filter(t => t.datum >= heute()).sort((a, b) => a.datum.localeCompare(b.datum));
    if (!kommend.length) return `<section class="karte-w"><div class="w-titel">⏳ Countdown</div><p>Noch keine Prüfungstermine eingetragen – der Countdown startet, sobald du einen Termin einträgst.</p><div class="w-fuss"><button class="glas knopf klein" data-go="einstellungen" data-param="termine">Termin eintragen</button></div></section>`;
    return `<section class="karte-w countdown"><div class="w-titel">⏳ Countdown</div>${kommend.slice(0, 3).map(t => { const n = tageBis(t.datum); return `<div class="cd-zeile"><b class="cd-tage">${n === 0 ? 'HEUTE' : n}</b><span>${n === 0 ? '' : n === 1 ? 'Tag bis ' : 'Tage bis '}<b>${E(t.name)}</b><br><small>${dtxt(t.datum)} · ${E(t.art)}</small></span><button class="glas knopf klein" data-go="plan" data-param="rueck:${E(t.id)}">Lernplan</button></div>`; }).join('')}</section>`;
  }
  function binden() {}

  // ---- Prüfungstermine (Einstellungen) ----
  const ARTEN = ['AP1', 'AP2', 'Klausur', 'Zertifikat', 'Sonstiges'];
  function termineHtml() {
    const ts = (S.p.termine || []).slice().sort((a, b) => a.datum.localeCompare(b.datum));
    const apPlan = Object.values(TAGE).find(t => t.art === 'pruefung');
    const vorschlag = apPlan && !ts.some(t => t.art === 'AP1') ? `<p class="unter">Im Ausbildungsplan steht <b>AP 1</b> am ${dtxt(apPlan.datum)}. <button class="glas knopf klein" id="t-vorschlag">Als Termin übernehmen</button></p>` : '';
    return `<p class="unter">AP1, AP2, Klausuren, Zertifikate (LPIC-1, CCNA, DP-203 …). Mit Termin gibt es Countdown und Rückwärts-Lernplan – ohne Termin kein Countdown.</p>${vorschlag}
      ${ts.length ? `<div class="tablewrap"><table><thead><tr><th>Datum</th><th>Art</th><th>Name</th><th>Bezug</th><th></th></tr></thead><tbody>${ts.map(t => `<tr><td>${dtxt(t.datum)}${t.datum < heute() ? ' <small>(vorbei)</small>' : ` <small>(${tageBis(t.datum)} T.)</small>`}</td><td>${E(t.art)}</td><td>${E(t.name)}</td><td>${E(t.bezug || '–')}</td><td><button class="glas mini" data-go="plan" data-param="rueck:${E(t.id)}" title="Rückwärts-Lernplan">📋</button> <button class="glas mini t-weg" data-id="${E(t.id)}" title="Löschen" aria-label="Termin löschen">✕</button></td></tr>`).join('')}</tbody></table></div>` : ''}
      <div class="r-eingabe termin-form">
        <label class="r-feld"><span>Art</span><select id="t-art">${ARTEN.map(a => `<option>${a}</option>`).join('')}</select></label>
        <label class="r-feld"><span>Name</span><input id="t-name" placeholder="z. B. AP1 Frühjahr 2027"></label>
        <label class="r-feld"><span>Datum</span><input id="t-datum" type="date"></label>
        <label class="r-feld"><span>Bezug (Inhalte)</span><select id="t-bezug"><option value="">automatisch</option>${PRUEF_TAGS.map(t => `<option>${t}</option>`).join('')}${ALLE_FAECHER.map(f => `<option value="fach:${E(f)}">Fach: ${E(f)}</option>`).join('')}</select></label>
        <button class="glas knopf primär" id="t-neu" style="align-self:flex-end">Eintragen</button>
      </div>`;
  }
  function termineBinden() {
    const neu = $('#t-neu'); if (!neu) return;
    const art = $('#t-art'), name = $('#t-name');
    art.onchange = () => { if (!name.value) name.placeholder = art.value === 'Zertifikat' ? 'z. B. CCNA 200-301' : art.value === 'Klausur' ? 'z. B. Klausur Linux I' : `${art.value} …`; };
    neu.onclick = () => {
      const datum = $('#t-datum').value;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(datum)) { toast('Bitte ein Datum wählen.'); return; }
      const a = art.value, bez = $('#t-bezug').value || (['AP1', 'AP2'].includes(a) ? a : '');
      S.p.termine.push({ id: 't' + Date.now().toString(36), art: a, name: name.value.trim() || a, datum, bezug: bez });
      speichern(); toast('Termin eingetragen – Countdown läuft.'); einstellungen('termine');
    };
    document.querySelectorAll('.t-weg').forEach(b => b.onclick = () => { S.p.termine = S.p.termine.filter(t => t.id !== b.dataset.id); speichern(); einstellungen('termine'); });
    const v = $('#t-vorschlag');
    if (v) v.onclick = () => { const ap = Object.values(TAGE).find(t => t.art === 'pruefung'); S.p.termine.push({ id: 't' + Date.now().toString(36), art: 'AP1', name: 'AP1 (laut Ausbildungsplan)', datum: ap.datum, bezug: 'AP1' }); speichern(); toast('AP1-Termin übernommen.'); einstellungen('termine'); };
  }

  // ---- Rückwärts-Lernplan ----
  function docsFuerTermin(t) {
    let list;
    if (t.bezug && t.bezug.startsWith('fach:')) list = docsFuerFach(t.bezug.slice(5));
    else { const tagName = t.bezug || ({ AP1: 'AP1', AP2: 'AP2' }[t.art]) || ''; list = tagName ? S.docs.filter(d => passtZuTag(d, tagName)) : S.docs.slice(); }
    return list.filter(d => d.typ !== 'referenz');
  }
  function rueckwaerts(t) {
    const tage = tageBis(t.datum);
    const docs = docsFuerTermin(t);
    const prio = d => { const a = window.Analyse ? Analyse.ampel(d) : { farbe: 'grau' }; return (S.p.gelesen[d.id] ? 2 : 0) + ({ rot: 0, gelb: 1, grau: 0.5, gruen: 3 }[a.farbe] || 1); };
    const offen = docs.filter(d => !(S.p.gelesen[d.id] && window.Analyse && Analyse.ampel(d).farbe === 'gruen')).sort((a, b) => prio(a) - prio(b) || a.order.localeCompare(b.order, 'de', { numeric: true }));
    const lernTage = Math.max(1, tage - 7);
    const wochen = Math.max(1, Math.ceil(lernTage / 7));
    const proWoche = Math.ceil(offen.length / wochen);
    const plan = [];
    for (let w = 0; w < wochen; w++) {
      const von = ausIso(heute()); von.setDate(von.getDate() + w * 7);
      plan.push({ von: iso(von), themen: offen.slice(w * proWoche, (w + 1) * proWoche) });
    }
    return { tage, docs, offen, plan, proTag: Math.ceil(offen.length / lernTage) };
  }

  // ---- Ansicht "Lernplan" ----
  let monat = null;
  function ansicht(param) {
    param = param || '';
    if (param.startsWith('fach:')) return fachAnsicht(param.slice(5));
    if (param.startsWith('rueck:')) return rueckAnsicht(param.slice(6));
    krumen([START, { txt: 'Lernplan' }]);
    if (!monat) { const h = heute().slice(0, 7); monat = MONATE[h] ? h : (h < ERSTER ? ERSTER.slice(0, 7) : h); }
    const tab = param === 'fahrplan' ? 'fahrplan' : 'kalender';
    $('#inhalt').innerHTML = `<h1>Lernplan</h1><p class="unter">Ausbildungsplan FiSi (IT-Akademie) von ${dtxt(ERSTER)} bis ${dtxt(LETZTER)} · Prüfungstermine trägst du in den <a class="verweis" data-go="einstellungen" data-param="termine">Einstellungen</a> ein.</p>
      <div class="start-raster">${heuteHtml()}${countdownHtml()}</div>
      <div class="filterleiste"><button class="glas knopf ${tab === 'kalender' ? 'an' : ''}" data-go="plan">Kalender</button><button class="glas knopf ${tab === 'fahrplan' ? 'an' : ''}" data-go="plan" data-param="fahrplan">Fahrplan</button>${(S.p.termine || []).filter(t => t.datum >= heute()).map(t => `<button class="glas knopf" data-go="plan" data-param="rueck:${E(t.id)}">Rückwärtsplan: ${E(t.name)}</button>`).join('')}</div>
      <div id="plan-inhalt"></div>`;
    if (tab === 'fahrplan') fahrplan(); else kalender();
  }
  function kalender() {
    const [y, m] = monat.split('-').map(Number);
    const erster = new Date(y, m - 1, 1), tageImMonat = new Date(y, m, 0).getDate(), versatz = (erster.getDay() + 6) % 7;
    const termine = S.p.termine || [];
    const zellen = [];
    for (let k = 0; k < versatz; k++) zellen.push('<div class="kal-zelle leer"></div>');
    for (let d = 1; d <= tageImMonat; d++) {
      const ds = `${monat}-${String(d).padStart(2, '0')}`, t = tag(ds), tm = termine.filter(x => x.datum === ds);
      zellen.push(`<button class="kal-zelle ${t.art} ${ds === heute() ? 'heute' : ''} ${t.markiert ? 'mark-' + t.markiert : ''}" ${t.fach ? `data-go="plan" data-param="fach:${E(t.fach)}"` : ''} title="${E(dtxt(ds) + ': ' + t.text)}"><span class="kal-nr">${d}</span><span class="kal-txt">${E(t.fach || (t.art === 'wochenende' ? '' : t.text))}</span>${tm.map(x => `<span class="kal-termin">${E(x.name)}</span>`).join('')}</button>`);
    }
    const monate = [...new Set([...Object.keys(MONATE), heute().slice(0, 7), ...termine.map(t => t.datum.slice(0, 7))])].sort();
    const idx = monate.indexOf(monat);
    $('#plan-inhalt').innerHTML = `<div class="kal-kopf"><button class="glas knopf klein" id="kal-zur" ${idx > 0 ? '' : 'disabled'}>‹</button><h2>${erster.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}${MONATE[monat] ? '' : ' <small>(nicht in der Vorlage)</small>'}</h2><button class="glas knopf klein" id="kal-vor" ${idx < monate.length - 1 ? '' : 'disabled'}>›</button><button class="glas knopf klein" id="kal-heute">Heute</button></div>
      <div class="kalender">${['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(w => `<div class="kal-wt">${w}</div>`).join('')}${zellen.join('')}</div>
      <p class="tipp">Legende: <span class="leg fach">Fach</span> <span class="leg feiertag">Feiertag</span> <span class="leg ferien">Ferien</span> <span class="leg pruefung">Prüfung</span> <span class="leg mark-dunkel">in der Vorlage markiert</span></p>`;
    $('#kal-zur').onclick = () => { monat = monate[idx - 1]; kalender(); };
    $('#kal-vor').onclick = () => { monat = monate[idx + 1]; kalender(); };
    $('#kal-heute').onclick = () => { monat = heute().slice(0, 7); kalender(); };
  }
  function bloeckeListe() {
    const tage = Object.values(TAGE).sort((a, b) => a.datum.localeCompare(b.datum)), out = [];
    for (const t of tage) {
      const key = t.fach ? 'f:' + t.fach : t.art === 'ferien' ? 'ferien' : t.art === 'pruefung' ? 'pruefung' : null;
      if (!key) continue;
      const l = out[out.length - 1];
      if (l && l.key === key && (ausIso(t.datum) - ausIso(l.bis)) / 86400000 <= 4) { l.bis = t.datum; l.n++; }
      else out.push({ key, von: t.datum, bis: t.datum, n: 1, fach: t.fach, art: t.art });
    }
    return out;
  }
  function fahrplan() {
    const bl = bloeckeListe(), h = heute();
    $('#plan-inhalt').innerHTML = `<div class="fahrplan">${bl.map(b => { const st = b.fach ? fachStand(b.fach) : null; const zustand = b.bis < h ? 'vorbei' : b.von <= h ? 'jetzt' : 'kommt';
      return `<div class="fp-zeile ${zustand} ${b.art}"><div class="fp-datum">${dtxt(b.von)} – ${dtxt(b.bis)}<small>${b.n} Tag(e)</small></div><div class="fp-punkt"></div><div class="fp-inhalt">${b.fach ? `<a class="verweis" data-go="plan" data-param="fach:${E(b.fach)}"><b>${E(b.fach)}</b></a><small>${st.list.length} Themen · ${st.gelesen} gelesen${st.quote !== null ? ` · ${st.quote} % richtig` : ''}</small>` : b.art === 'pruefung' ? '<b>AP 1 – Prüfung</b>' : '<b>Ferien</b>'}</div></div>`; }).join('')}
      <div class="fp-zeile kommt"><div class="fp-datum">Mai – Okt. 2027</div><div class="fp-punkt"></div><div class="fp-inhalt"><b>(nicht in der Vorlage)</b><small>Danach im November 2027: PV – AP2</small></div></div></div>`;
  }
  function fachAnsicht(fach) {
    krumen([START, { txt: 'Lernplan', go: 'plan' }, { txt: fach }]);
    const st = fachStand(fach);
    const tage = Object.values(TAGE).filter(t => t.fach === fach).map(t => t.datum).sort();
    $('#inhalt').innerHTML = `<h1>${E(fach)}</h1><p class="unter">${tage.length ? `Im Plan: ${dtxt(tage[0])} – ${dtxt(tage[tage.length - 1])} (${tage.length} Tage)` : 'nicht im Plan'} · ${st.list.length} Themen · ${st.gelesen} gelesen${st.quote !== null ? ` · ${st.quote} % richtig` : ''}</p>
      <div class="lesen-fuss"><button class="glas knopf primär" id="f-quiz">Quiz zu diesem Fach</button><button class="glas knopf" id="f-karten">Karteikarten</button><button class="glas knopf" id="f-pruef">Prüfung (30 Aufgaben)</button></div>
      ${st.list.length ? `<div class="themenliste">${st.list.map(kachel).join('')}</div>` : '<p class="leer">Diesem Fach sind (noch) keine Inhalte zugeordnet. Inhalte bekommen das Fach über das Kopffeld „fach:“.</p>'}`;
    const ids = new Set(st.list.map(d => d.id));
    const its = () => mischen(Formen.alle(d => ids.has(d.id)));
    $('#f-quiz').onclick = () => { const fr = its().filter(i => i.art !== 'freitext' && i.art !== 'szenario').slice(0, 15); if (!fr.length) return toast('Keine Aufgaben vorhanden.'); gehe('quiz', 'uebung'); Lernen.uebung(fr); };
    $('#f-pruef').onclick = () => { const fr = its().slice(0, 30); if (!fr.length) return toast('Keine Aufgaben vorhanden.'); gehe('quiz', 'pruefung'); Lernen.pruefung(fr, { sek: fr.length * S.p.lernen.quizZeit, titel: 'Prüfung ' + fach, tag: '' }); };
    $('#f-karten').onclick = () => { const k = Lernen.alleKarten(d => ids.has(d.id)); if (!k.length) return toast('Keine Karteikarten.'); gehe('karteikarten'); Lernen.kartenSitzung(k); };
  }
  function rueckAnsicht(id) {
    const t = (S.p.termine || []).find(x => x.id === id);
    krumen([START, { txt: 'Lernplan', go: 'plan' }, { txt: t ? 'Rückwärtsplan' : 'Termin fehlt' }]);
    if (!t) { $('#inhalt').innerHTML = '<p class="leer">Termin nicht gefunden.</p>'; return; }
    const r = rueckwaerts(t);
    const endeLern = ausIso(t.datum); endeLern.setDate(endeLern.getDate() - 7);
    $('#inhalt').innerHTML = `<h1>Rückwärts-Lernplan: ${E(t.name)}</h1>
      <p class="unter">${dtxt(t.datum)} · ${r.tage >= 0 ? `noch ${r.tage} Tage` : 'vorbei'} · ${r.docs.length} passende Themen, davon ${r.offen.length} offen (ungelesen oder nicht grün) · ca. ${r.proTag} Thema/Themen pro Tag</p>
      ${r.tage < 0 ? '<p class="leer">Dieser Termin liegt in der Vergangenheit.</p>' : `
      <div class="fahrplan">${r.plan.map((w, k) => `<div class="fp-zeile ${k === 0 ? 'jetzt' : 'kommt'}"><div class="fp-datum">Woche ${k + 1}<small>ab ${dtxt(w.von)}</small></div><div class="fp-punkt"></div><div class="fp-inhalt">${w.themen.length ? w.themen.map(d => `<a class="verweis rp-thema" data-go="lesen" data-param="${E(d.id)}">${window.Analyse ? `<i class="ampel ${Analyse.ampel(d).farbe}"></i>` : ''}${E(d.titel)}</a>`).join('') : '<small>Puffer / Wiederholung</small>'}</div></div>`).join('')}
        <div class="fp-zeile pruefung"><div class="fp-datum">Letzte 7 Tage<small>ab ${dtxt(iso(endeLern))}</small></div><div class="fp-punkt"></div><div class="fp-inhalt"><b>Endspurt</b><small>Fehlerkatalog abarbeiten · Spickzettel lesen · 2 Probeprüfungen unter Zeit · ausschlafen</small>
          <div class="lesen-fuss klein"><button class="glas knopf klein" data-go="analyse" data-param="fehler">Fehlerkatalog</button><button class="glas knopf klein" data-go="spickzettel" data-param="${E(t.bezug && !t.bezug.startsWith('fach:') ? t.bezug : t.art)}">Spickzettel</button><button class="glas knopf klein" data-go="quiz" data-param="pruefung">Prüfungsmodus</button></div></div></div></div>`}`;
  }

  window.VIEWS = Object.assign(window.VIEWS || {}, { plan: ansicht });
  return { tag, TAGE, MONATE, F, ALLE_FAECHER, docsFuerFach, fachStand, heuteHtml, wocheHtml, fachFortschrittHtml, countdownHtml, binden, termineHtml, termineBinden, rueckwaerts, naechsterFachtag, iso, ausIso, dtxt, tageBis };
})();
window.Plan = Plan;
