// Netzilon Ultra 2.1.0 – App-Kern (Navigation, Profil, Startseite, Lesen, Einstellungen)
const VERSION = '2.1.0';
const BEREICH_INFO = [
  { key: 'AP1', name: 'AP1', sub: 'Abschlussprüfung Teil 1' },
  { key: 'AP2', name: 'AP2', sub: 'Abschlussprüfung Teil 2' },
  { key: 'WiSo', name: 'WiSo', sub: 'Wirtschafts- und Sozialkunde, Kaufmännisches' },
  { key: 'Linux', name: 'Linux', sub: 'Linux I/II, LPIC-1' },
  { key: 'CCNA', name: 'CCNA', sub: 'TCP/IP, Netzwerk, Cisco 200-301' },
  { key: 'AZ-800', name: 'AZ-800', sub: 'Windows Server Hybrid – Kern' },
  { key: 'AZ-801', name: 'AZ-801', sub: 'Windows Server Hybrid – Erweitert' },
  { key: 'Datenbanken', name: 'Datenbanken', sub: 'SQL, Datenbankentwurf, Administration' },
  { key: 'Azure Data', name: 'Azure Data', sub: 'DP-203 Data Engineering' },
  { key: 'Prüfung', name: 'Prüfung', sub: 'Prüfungsfragen, IHK-Aufgaben & Probeprüfungen' },
  { key: 'Referenz', name: 'Referenz', sub: 'Befehle, Ports, Glossar' },
  { key: 'Legacy', name: 'Legacy-Box', sub: 'Alte Technik, die noch geprüft wird' },
  { key: 'Bonus', name: 'Bonus', sub: 'Zusatzkapitel (z. B. C#)' }
];
let BEREICHE = BEREICH_INFO.slice();
const FARBEN = ['#7ee0ff', '#f3d86a', '#9fe0a8', '#9fc9ef', '#f2a6c4', '#f5a66b', '#c7b3f5'];
const THEMES = { nacht: 'Nacht (Standard)', tafel: 'Tafel', weltall: 'Weltall' };

const S = { docs: [], byId: {}, p: null, verlauf: [], ansicht: null, fehler: [], items: null, ladezeit: 0 };
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const E = Parser.esc;
const istSchmal = () => window.innerWidth < 820;

// Ereignis an Motivation/Analyse melden (XP, Quests, Abzeichen)
function melde(art, n = 1, extra) { try { if (window.Mot) Mot.ereignis(art, n, extra); } catch (e) { console.warn('Motivation', e); } }

// ---------- Fortschritt ----------
function neuerFortschritt() {
  return { version: 2, app: 'Netzilon Ultra', profil: null, starts: 0, zuletzt: null,
    einstellungen: { theme: 'nacht', hell: false, ton: false, lautstaerke: 0.15, stickman: true, intro: true, modus: 'profi', effekte: true, fokus: false, tagesXP: 60 },
    lernen: { neuProTag: 20, maxWdh: 200, faktor: 1.0, zweites: 4, quizZeit: 60, fragenProTag: 10, minutenProTag: 45 },
    gelesen: {}, karten: {}, kartenTag: { datum: '', neu: 0, wdh: 0 }, quiz: {}, pruefungen: [], lab: {}, spiele: {},
    termine: [], xp: { gesamt: 0, tage: {} }, streak: { tage: 0, letzter: '', best: 0 }, tag: null, zaehler: {}, abzeichen: {},
    freitext: {}, terminal: {}, netsim: { geloest: {}, topo: null }, rechner: {}, dojo: { r: 0, f: 0 },
    schwer: {}, zufall: { n: 0, gesehen: {} }, tagesaufgabe: { aktuell: null, ausgegeben: 0, historie: [], serie: 0, best: 0, letzterTag: '' } };
}
function migrieren(d) {
  const n = neuerFortschritt();
  if (!d || typeof d !== 'object') return n;
  const alt = !d.version || d.version < 2;
  const p = Object.assign(n, d);
  p.einstellungen = Object.assign(neuerFortschritt().einstellungen, d.einstellungen || {});
  p.lernen = Object.assign(neuerFortschritt().lernen, d.lernen || {});
  for (const k of ['gelesen', 'karten', 'quiz', 'lab', 'spiele', 'zaehler', 'abzeichen', 'freitext', 'terminal', 'rechner', 'schwer'])
    if (!p[k] || typeof p[k] !== 'object' || Array.isArray(p[k])) p[k] = {};
  for (const k of ['pruefungen', 'termine']) if (!Array.isArray(p[k])) p[k] = [];
  p.xp = Object.assign({ gesamt: 0, tage: {} }, p.xp || {});
  p.streak = Object.assign({ tage: 0, letzter: '', best: 0 }, p.streak || {});
  p.netsim = Object.assign({ geloest: {}, topo: null }, p.netsim || {});
  p.dojo = Object.assign({ r: 0, f: 0 }, p.dojo || {});
  p.kartenTag = Object.assign({ datum: '', neu: 0, wdh: 0 }, p.kartenTag || {});
  if (!THEMES[p.einstellungen.theme]) p.einstellungen.theme = p.einstellungen.theme === 'heft' ? 'weltall' : 'nacht';
  if (alt) {
    // Netzilon 1.x → Ultra 2.0: Töne jetzt standardmäßig aus, Startbonus-XP für bisherigen Fortschritt
    p.einstellungen.ton = false; p.einstellungen.lautstaerke = Math.min(p.einstellungen.lautstaerke || 0.15, 0.2);
    p.xp.gesamt = (p.xp.gesamt || 0) + Object.keys(p.gelesen).length * 20 + Object.keys(p.karten).length * 2 +
      Object.values(p.quiz).reduce((s, q) => s + (q.r || 0) * 5, 0) + p.pruefungen.length * 50;
    p.migriert = { von: d.version || 1, am: new Date().toISOString(), aus: d._migriertAus || 'fortschritt.json' };
  }
  delete p._migriertAus;
  p.version = 2; p.app = 'Netzilon Ultra';
  return p;
}
let speicherTimer;
function speichern() { clearTimeout(speicherTimer); speicherTimer = setTimeout(() => { try { window.api.saveProgress(S.p); } catch (e) { console.warn(e); } }, 300); }

// ---------- Ton (leise, WebAudio, standardmäßig aus) ----------
let ac;
function ton(art = 'klick') {
  if (!S.p?.einstellungen.ton) return;
  try {
    ac = ac || new AudioContext();
    const v = S.p.einstellungen.lautstaerke ?? 0.15, t = ac.currentTime, g = ac.createGain();
    g.connect(ac.destination);
    if (art === 'kreide') {
      const len = 0.09, buf = ac.createBuffer(1, ac.sampleRate * len, ac.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length) * 0.5;
      const src = ac.createBufferSource(), f = ac.createBiquadFilter();
      f.type = 'bandpass'; f.frequency.value = 3200; src.buffer = buf; src.connect(f); f.connect(g);
      g.gain.value = v * 0.35; src.start();
    } else if (art === 'gong') {
      [523, 659, 784].forEach((hz, i) => {
        const o = ac.createOscillator(), gg = ac.createGain();
        o.frequency.value = hz; o.type = 'sine'; o.connect(gg); gg.connect(ac.destination);
        gg.gain.setValueAtTime(0, t + i * 0.18); gg.gain.linearRampToValueAtTime(v * 0.25, t + i * 0.18 + 0.02);
        gg.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.18 + 1.1);
        o.start(t + i * 0.18); o.stop(t + i * 0.18 + 1.2);
      });
    } else {
      const o = ac.createOscillator(); o.type = art === 'gut' ? 'triangle' : 'sine';
      o.frequency.value = art === 'gut' ? 880 : art === 'schlecht' ? 180 : art === 'level' ? 1046 : 620; o.connect(g);
      g.gain.setValueAtTime(v * 0.18, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
      o.start(t); o.stop(t + 0.13);
    }
  } catch {}
}
window.ton = ton;

function toast(txt, art) { const el = $('#toast'); if (!el) return; el.textContent = txt; el.className = 'zeigen' + (art ? ' ' + art : ''); clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove('zeigen'), 2400); }

// ---------- Theme / Hell-Dunkel / Fokus ----------
function themeAnwenden() {
  const e = S.p.einstellungen, r = document.documentElement;
  r.dataset.theme = e.theme; r.dataset.hell = e.hell ? '1' : '0'; r.dataset.fokus = e.fokus ? '1' : '0';
  r.dataset.effekte = e.effekte ? '1' : '0';
  const meta = document.querySelector('meta[name="theme-color"]'); if (meta) meta.content = e.hell ? '#eef3fa' : '#0a1222';
}
function setzeTheme(t) { S.p.einstellungen.theme = THEMES[t] ? t : 'nacht'; themeAnwenden(); speichern(); }
function setzeHell(h) { S.p.einstellungen.hell = !!h; themeAnwenden(); speichern(); }
function setzeFokus(f) { S.p.einstellungen.fokus = !!f; themeAnwenden(); speichern(); if (window.Stickman) (f || !S.p.einstellungen.stickman || istSchmal()) ? Stickman.stop() : Stickman.start(); toast(f ? 'Fokus-Modus an – nur Lernstoff' : 'Fokus-Modus aus'); }

// ---------- Navigation ----------
function gehe(ansicht, param, ohneVerlauf) {
  if (!ohneVerlauf && S.ansicht) { S.verlauf.push(S.ansicht); if (S.verlauf.length > 60) S.verlauf.shift(); }
  S.ansicht = { ansicht, param };
  ton('klick');
  const lokal = { home, bereich, kapitel, lesen, einstellungen, changelog, werkzeuge: hubWerkzeuge, lernhub: hubLernen, mehr: hubMehr };
  const f = (window.VIEWS || {})[ansicht] || lokal[ansicht] || home;
  document.body.classList.remove('menue-offen');
  try { f(param); }
  catch (err) {
    console.error(err);
    $('#inhalt').innerHTML = `<h1>Hoppla</h1><p class="unter">Diese Ansicht hatte einen Fehler: ${E(err && err.message || err)}</p><button class="glas knopf primär" data-go="home">Zur Startseite</button>`;
  }
  const tab = { home: 'home', lernhub: 'lernhub', karteikarten: 'lernhub', bereich: 'lernhub', kapitel: 'lernhub', lesen: 'lernhub', labs: 'lernhub', quiz: 'quiz', werkzeuge: 'werkzeuge', rechner: 'werkzeuge', netsim: 'werkzeuge', terminal: 'werkzeuge', befehle: 'werkzeuge', spiele: 'werkzeuge', spiel: 'werkzeuge', glossar: 'werkzeuge', cheatsheets: 'werkzeuge', spickzettel: 'werkzeuge', dojo: 'werkzeuge', suche: 'werkzeuge', zufall: 'quiz', schwierigkeit: 'quiz', fortschritt: 'lernhub', tagesaufgabe: 'lernhub' }[ansicht] || 'mehr';
  $$('#tableiste button').forEach(b => b.classList.toggle('an', b.dataset.go === tab));
  const inh = $('#inhalt'); inh.scrollTop = 0; try { inh.focus({ preventScroll: true }); } catch {}
}
function zurueck() { const v = S.verlauf.pop(); if (v) gehe(v.ansicht, v.param, true); else if (S.ansicht?.ansicht !== 'home') gehe('home', undefined, true); }
function krumen(teile) {
  $('#brotkrumen').innerHTML = teile.map(t => t.go ? `<a data-go="${t.go}" data-param="${E(t.param || '')}">${E(t.txt)}</a>` : `<span>${E(t.txt)}</span>`).join('<span class="trenner">›</span>');
}
const START = { txt: 'Start', go: 'home' };

// ---------- Daten ----------
async function ladeInhalte() {
  const t0 = performance.now();
  let r;
  try { r = await window.api.loadContent(); } catch (e) { r = { files: [], fehler: [{ path: 'content', msg: 'Inhalte nicht ladbar: ' + e.message }] }; }
  const files = Array.isArray(r) ? r : (r && r.files) || [];
  S.fehler = ((r && r.fehler) || []).map(f => ({ ...f, art: 'fehler' }));
  const map = {};
  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    if (i % 40 === 39) await new Promise(res => setTimeout(res, 0)); // UI nie blockieren
    const { doc, fehler } = Parser.parseSicher(f.text, { path: f.path, source: f.source });
    if (fehler) { S.fehler.push({ path: f.path, msg: fehler, art: 'fehler' }); continue; }
    if (doc.warnungen.length) S.fehler.push({ path: f.path, msg: doc.warnungen.join(' · '), art: 'warnung' });
    if (map[doc.id]) {
      if (f.source === 'extern') { map[doc.id] = doc; continue; } // extern überschreibt eingebaut
      if (map[doc.id].source !== 'extern') S.fehler.push({ path: f.path, msg: `id „${doc.id}“ doppelt (auch in ${map[doc.id].path}) – Datei übersprungen`, art: 'fehler' });
      continue;
    }
    map[doc.id] = doc;
  }
  S.docs = Object.values(map).sort((a, b) => a.order.localeCompare(b.order, 'de', { numeric: true }));
  S.byId = map; S.items = null;
  const bekannt = BEREICH_INFO.map(b => b.key), unbekannt = [...new Set(S.docs.map(d => d.bereich))].filter(b => !bekannt.includes(b)).sort((a, b) => a.localeCompare(b, 'de'));
  BEREICHE = [...BEREICH_INFO, ...unbekannt.map(k => ({ key: k, name: k, sub: 'Weitere Inhalte' }))];
  S.ladezeit = Math.round(performance.now() - t0);
  statuszeile();
}
function statuszeile() {
  const el = $('#status'); if (!el) return;
  const nq = S.docs.reduce((n, d) => n + d.quiz.length + d.luecken.length + d.zuordnen.length + d.reihenfolge.length + d.freitext.length + d.szenarien.length, 0);
  const fz = S.fehler.filter(f => f.art === 'fehler').length;
  el.innerHTML = `${S.docs.length} Themen · ${nq} Aufgaben · ${S.docs.reduce((n, d) => n + d.cards.length, 0)} Karten${fz ? ` · <a data-go="einstellungen" data-param="fehler" class="warn">${fz} Inhaltsfehler</a>` : ''}`;
}
const docsIn = b => S.docs.filter(d => d.bereich === b);
function kapitelVon(b) {
  const k = [];
  for (const d of docsIn(b)) if (!k.includes(d.kapitel)) k.push(d.kapitel);
  return k;
}
const gelesenAnteil = list => list.length ? list.filter(d => S.p.gelesen[d.id]).length / list.length : 0;
const bereichName = key => (BEREICHE.find(x => x.key === key) || { name: key }).name;

// ---------- Profil ----------
function profilAnlegen() {
  krumen([{ txt: 'Willkommen' }]);
  let farbe = FARBEN[0];
  $('#inhalt').innerHTML = `
    <div class="profil-seite">
      <h1>Netzilon <span class="ultra">Ultra</span></h1>
      <p class="unter">Neues Profil anlegen. Dein Fortschritt landet in <code>fortschritt.json</code> neben der NetzilonUltra.exe (im Browser/iPhone: im Gerätespeicher – mit Export sichern).</p>
      <input type="text" id="p-name" placeholder="Dein Name" maxlength="24" autofocus>
      <div class="farben">${FARBEN.map((c, i) => `<button class="farbe ${i ? '' : 'an'}" data-f="${c}" style="background:${c}" title="Farbe wählen" aria-label="Farbe ${i + 1}"></button>`).join('')}</div>
      <button class="glas knopf primär" id="p-ok">Profil anlegen</button>
      <p class="unter" style="margin-top:22px">Schon Netzilon benutzt? <button class="glas knopf klein" id="p-imp">Alten Fortschritt importieren</button></p>
    </div>`;
  $$('.farbe').forEach(b => b.onclick = () => {
    $$('.farbe').forEach(x => x.classList.remove('an')); b.classList.add('an'); farbe = b.dataset.f; ton('kreide');
  });
  const ok = () => {
    const name = $('#p-name').value.trim();
    if (!name) { toast('Bitte einen Namen eingeben.'); return; }
    S.p.profil = { name, farbe, erstellt: new Date().toISOString() };
    speichern(); ton('gong'); melde('start'); gehe('home');
  };
  $('#p-ok').onclick = ok;
  $('#p-name').onkeydown = e => { if (e.key === 'Enter') ok(); };
  $('#p-imp').onclick = importieren;
}
async function importieren() {
  const d = await window.api.importProgress();
  if (!d || !d.profil) { toast('Datei ist kein Netzilon-Fortschritt.'); return; }
  S.p = migrieren(d); speichern(); themeAnwenden(); toast(d.version >= 2 ? 'Importiert.' : 'Netzilon-1.x-Fortschritt übernommen.'); S.verlauf = []; gehe('home');
}

// ---------- Startseite ----------
function widget(fn) { try { return fn() || ''; } catch (e) { console.warn('Widget', e); return ''; } }
function home() {
  krumen([{ txt: 'Start' }]);
  const pr = S.p.profil, h = new Date().getHours();
  const gruss = h < 5 ? 'Noch wach' : h < 11 ? 'Guten Morgen' : h < 18 ? 'Hallo' : 'Guten Abend';
  const datum = new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const letzte = S.p.zuletzt && S.byId[S.p.zuletzt];
  const anzahlGelesen = Object.keys(S.p.gelesen).filter(id => S.byId[id]).length;

  const aktionen = [
    letzte ? { t: 'Weiterlesen', s: letzte.titel, go: 'lesen', param: letzte.id, i: '▶' } : { t: 'Loslegen', s: 'Mit dem Fach von heute anfangen', go: 'plan', i: '▶' },
    { t: 'Karteikarten', s: `${Lernen.faelligAnzahl()} fällig · ${Lernen.neuHeute()} neue heute`, go: 'karteikarten', i: '🂠' },
    { t: 'Quiz', s: 'Alle Aufgabenarten gemischt', go: 'quiz', param: 'uebung', i: '?' },
    { t: 'Prüfungsmodus', s: 'IHK-Zeitlimit, Punkte, Note', go: 'quiz', param: 'pruefung', i: '⏱' },
    { t: 'Zufallsprüfung', s: '60 neue Fragen, jedes Mal anders', go: 'zufall', i: '🎲' },
    { t: 'Nach Schwierigkeit', s: 'leicht · mittel · schwer', go: 'schwierigkeit', i: '🚦' },
    { t: 'Fortschritt', s: 'x/y erfolgreich · Level · Meisterschaft', go: 'fortschritt', i: '📊' },
    { t: 'Lernplan', s: 'Kalender, Termine, Countdown', go: 'plan', i: '📅' },
    { t: 'Schwächen', s: 'Ampel, Fehlerkatalog, Wiederholplan', go: 'analyse', i: '🚦' },
    { t: 'Rechner', s: 'Subnetting bis Netzplan – mit Rechenweg', go: 'rechner', i: '∑' },
    { t: 'Netzwerk-Simulator', s: 'Packet-Tracer-light: bauen & pingen', go: 'netsim', i: '⇄' },
    { t: 'Terminal-Trainer', s: 'PowerShell, CMD, Cisco IOS, Bash', go: 'terminal', i: '>_' },
    { t: 'Lernspiele', s: `${window.Spiele ? Spiele.anzahl() : 6} Spiele mit deinem Stoff`, go: 'spiele', i: '🎮' },
    { t: 'IHK-Fallen-Dojo', s: 'KiB vs. KB, Brutto/Netto …', go: 'dojo', i: '🥋' },
    { t: 'Spickzettel', s: 'Kurzform für den Prüfungstag', go: 'spickzettel', i: '📝' },
    { t: 'Labs', s: 'Anleitungen zum Abhaken', go: 'labs', i: '🧪' },
    { t: 'Suche', s: 'Alles durchsuchen (Strg+K)', go: 'suche', i: '⌕' },
    { t: 'Statistik', s: 'Fortschritt und Prüfungsnoten', go: 'statistik', i: '📈' },
    { t: 'Zufallsthema', s: 'Überrasch mich', zufall: true, i: '🎲' }
  ];

  $('#inhalt').innerHTML = `
    <div class="start-kopf">
      <div>
        <p class="gruss"><span class="avatar" style="background:${E(pr.farbe)}">${E(pr.name[0].toUpperCase())}</span> ${gruss}, ${E(pr.name)}!</p>
        <div class="datum">${datum} · ${anzahlGelesen} von ${S.docs.length} Themen gelesen</div>
      </div>
      ${widget(() => Mot.kopfHtml())}
    </div>
    ${widget(() => Extras.spruchHtml())}
    <div class="start-raster">
      ${widget(() => Ziele.homeHtml())}
      ${widget(() => Plan.heuteHtml())}
      ${widget(() => Analyse.tagesplanHtml())}
      ${widget(() => Mot.questsHtml())}
      ${widget(() => Plan.countdownHtml())}
    </div>
    <div class="pausenbrett">
      ${aktionen.map((a, i) => `<button class="glas aktion" data-a="${i}"><span class="aktion-icon" aria-hidden="true">${a.i}</span><b>${E(a.t)}</b><span>${E(a.s)}</span></button>`).join('')}
    </div>
    ${widget(() => Plan.wocheHtml())}
    ${widget(() => Plan.fachFortschrittHtml())}
    <h2>Stundenplan nach Bereichen</h2>
    <div class="stundenplan">
      ${BEREICHE.filter(b => docsIn(b.key).length).map(b => {
        const list = docsIn(b.key), ant = gelesenAnteil(list), kap = kapitelVon(b.key);
        return `<section class="fach">
          <div class="fach-kopf" data-go="bereich" data-param="${E(b.key)}"><h2>${E(b.name)}</h2><small>${list.length} Themen${window.Ziele ? ' · ' + (z => z.n ? z.ok + '/' + z.n + ' ✓' : '')(Ziele.bereichStat(b.key)) : ''}</small></div>
          <div class="balken" style="margin-top:10px"><i style="width:${Math.round(ant * 100)}%"></i></div>
          <ol>${kap.slice(0, 12).map((k, i) => {
            const kl = list.filter(d => d.kapitel === k), g = kl.filter(d => S.p.gelesen[d.id]).length;
            return `<li><button class="glas stunde" data-go="kapitel" data-param="${E(b.key + '||' + k)}"><span class="nr">${i + 1}.</span><span>${E(k || '(ohne Kapitel)')}</span><span class="fort">${g}/${kl.length}</span></button></li>`;
          }).join('')}${kap.length > 12 ? `<li><button class="glas stunde" data-go="bereich" data-param="${E(b.key)}"><span class="nr">…</span><span>${kap.length - 12} weitere Kapitel</span><span></span></button></li>` : ''}</ol>
        </section>`;
      }).join('')}
    </div>`;
  $$('.aktion[data-a]').forEach(btn => btn.onclick = () => {
    const a = aktionen[btn.dataset.a];
    if (a.zufall) { const d = S.docs.filter(x => x.typ !== 'fragen'); if (d.length) gehe('lesen', d[Math.floor(Math.random() * d.length)].id); return; }
    gehe(a.go, a.param);
  });
  try { Mot.binden(); } catch {}
  try { Plan.binden(); } catch {}
}

// ---------- Hubs (iPhone-Tab-Leiste + Übersicht) ----------
function hub(titel, unter, eintraege) {
  krumen([START, { txt: titel }]);
  $('#inhalt').innerHTML = `<h1>${E(titel)}</h1><p class="unter">${E(unter)}</p><div class="pausenbrett">${eintraege.map(a => `<button class="glas aktion" data-go="${a.go}" ${a.param ? `data-param="${E(a.param)}"` : ''}><span class="aktion-icon" aria-hidden="true">${a.i || '•'}</span><b>${E(a.t)}</b><span>${E(a.s || '')}</span></button>`).join('')}</div>`;
}
function hubLernen() {
  hub('Lernen', 'Lesen, wiederholen, üben', [
    { t: 'Karteikarten', s: `${Lernen.faelligAnzahl()} fällig`, go: 'karteikarten', i: '🂠' },
    { t: 'Quiz', s: 'Übungsmodus', go: 'quiz', param: 'uebung', i: '?' },
    { t: 'Prüfungsmodus', s: 'Mit Zeitlimit und Note', go: 'quiz', param: 'pruefung', i: '⏱' },
    { t: 'Zufallsprüfung', s: '60 neue Fragen aus dem ganzen Pool', go: 'zufall', i: '🎲' },
    { t: 'Aufgabe des Tages', s: '365 Tage · alle 24 h eine neue', go: 'tagesaufgabe', i: '🎯' },
    { t: 'Nach Schwierigkeit', s: 'Deine Markierungen: leicht · mittel · schwer', go: 'schwierigkeit', i: '🚦' },
    { t: 'Fortschritt', s: 'x/y Aufgaben erfolgreich, Level, Meisterschaft', go: 'fortschritt', i: '📊' },
    { t: 'Fehlerkatalog', s: 'Alles, was du falsch hattest', go: 'analyse', param: 'fehler', i: '✗' },
    { t: 'Labs', s: 'Praxis zum Abhaken', go: 'labs', i: '🧪' },
    ...BEREICHE.filter(b => docsIn(b.key).length).map(b => ({ t: b.name, s: `${docsIn(b.key).length} Themen · ${b.sub}`, go: 'bereich', param: b.key, i: '📚' }))
  ]);
}
function hubWerkzeuge() {
  hub('Werkzeuge', 'Rechnen, simulieren, nachschlagen', [
    { t: 'Rechner', s: 'Subnetting, VLSM, IPv6, RAID, USV, Kalkulation …', go: 'rechner', i: '∑' },
    { t: 'IHK-Fallen-Dojo', s: 'Typische Rechenfallen', go: 'dojo', i: '🥋' },
    { t: 'Netzwerk-Simulator', s: 'Geräte verbinden, ping, traceroute', go: 'netsim', i: '⇄' },
    { t: 'Terminal-Trainer', s: 'PowerShell · CMD · IOS · Bash', go: 'terminal', i: '>_' },
    { t: 'Befehlsreferenz', s: 'Alle Befehle filterbar', go: 'befehle', i: '⌘' },
    { t: 'Glossar', s: 'Fachbegriffe A–Z', go: 'glossar', i: 'A–Z' },
    { t: 'Cheat-Sheets', s: 'Druckbar: Befehle, Ports, Subnetze', go: 'cheatsheets', i: '🖨' },
    { t: 'Spickzettel-Modus', s: 'Kurzform je Prüfung', go: 'spickzettel', i: '📝' },
    { t: 'Lernspiele', s: 'Quiz, Memory, Port-Ninja …', go: 'spiele', i: '🎮' },
    { t: 'Suche', s: 'Volltext mit Tippfehler-Toleranz', go: 'suche', i: '⌕' }
  ]);
}
function hubMehr() {
  hub('Mehr', 'Planung, Auswertung, Einstellungen', [
    { t: 'Lernplan', s: 'Ausbildungsplan & Prüfungstermine', go: 'plan', i: '📅' },
    { t: 'Schwächenanalyse', s: 'Ampel, Wiederholplan, Notenprognose', go: 'analyse', i: '🚦' },
    { t: 'Erfolge', s: 'XP, Rang, Abzeichen', go: 'erfolge', i: '🏆' },
    { t: 'Statistik', s: 'Zahlen & Prüfungsverlauf', go: 'statistik', i: '📈' },
    { t: 'Einstellungen', s: 'Aussehen, Termine, Daten', go: 'einstellungen', i: '⚙' },
    { t: 'Changelog', s: 'Was ist neu in ' + VERSION, go: 'changelog', i: '📜' }
  ]);
}

// ---------- Bereich / Kapitel ----------
function kachel(d) {
  const amp = window.Analyse ? Analyse.ampel(d) : null;
  const n = d.quiz.length + d.luecken.length + d.zuordnen.length + d.reihenfolge.length + d.freitext.length + d.szenarien.length;
  return `<button class="glas thema-kachel" data-go="lesen" data-param="${E(d.id)}">
    <b>${amp ? `<i class="ampel ${amp.farbe}" title="${E(amp.txt)}"></i>` : ''}${S.p.gelesen[d.id] ? '<span class="haken">✓</span> ' : ''}${E(d.titel)}</b>
    <span class="meta">${d.stufe ? `<span>${E(d.stufe)}</span>` : ''}${d.cards.length ? `<span>${d.cards.length} Karten</span>` : ''}${n ? `<span>${n} Aufgaben</span>` : ''}${window.Ziele ? Ziele.mini(Ziele.docStat(d)) : ''}${d.bereich === 'Legacy' ? '<span class="legacy-mini">Legacy</span>' : ''}${d.source === 'extern' ? '<span>extern</span>' : ''}</span>
  </button>`;
}
function bereich(key) {
  const b = BEREICHE.find(x => x.key === key) || { name: key, sub: '' };
  krumen([START, { txt: b.name }]);
  const list = docsIn(key);
  $('#inhalt').innerHTML = `<h1>${E(b.name)}</h1><p class="unter">${E(b.sub)} · ${list.length} Themen · ${Math.round(gelesenAnteil(list) * 100)} % gelesen</p>${window.Ziele ? widget(() => Ziele.balken(Ziele.bereichStat(key), 'Aufgaben erfolgreich')) : ''}` +
    kapitelVon(key).map(k => `<div class="gruppe-titel">${E(k || '(ohne Kapitel)')}</div><div class="themenliste">${list.filter(d => d.kapitel === k).map(kachel).join('')}</div>`).join('');
}
function kapitel(param) {
  const [key, k] = String(param).split('||');
  const b = BEREICHE.find(x => x.key === key) || { name: key };
  krumen([START, { txt: b.name, go: 'bereich', param: key }, { txt: k || '(ohne Kapitel)' }]);
  const list = docsIn(key).filter(d => d.kapitel === k);
  $('#inhalt').innerHTML = `<h1>${E(k || '(ohne Kapitel)')}</h1><p class="unter">${list.length} Themen · ${Math.round(gelesenAnteil(list) * 100)} % gelesen</p><div class="themenliste">${list.map(kachel).join('')}</div>`;
}

// ---------- Lesen ----------
function abschnitt(titel, inhalt, offen, cls = '') {
  return inhalt ? `<details class="abschnitt ${cls}" ${offen ? 'open' : ''}><summary>${E(titel)}</summary><div class="text">${inhalt}</div></details>` : '';
}
function lesen(id) {
  const d = S.byId[id];
  if (!d) { krumen([START, { txt: 'Nicht gefunden' }]); $('#inhalt').innerHTML = `<p class="leer">Thema „${E(id)}“ gibt es (noch) nicht.</p>`; return; }
  krumen([START, { txt: bereichName(d.bereich), go: 'bereich', param: d.bereich }, { txt: d.kapitel || '…', go: 'kapitel', param: d.bereich + '||' + d.kapitel }, { txt: d.titel }]);
  S.p.zuletzt = id; speichern();
  const s = d.sections, modus = S.p.einstellungen.modus;
  const hatBeide = s['Profi'] && s['Einfach'];
  const haupt = hatBeide ? (modus === 'einfach' ? s['Einfach'] : s['Profi']) : (s['Profi'] || s['Einfach'] || '');
  const verweise = d.verweise.filter(v => S.byId[v]);
  const items = Formen.itemsVon(d);
  const nichtMc = items.filter(it => it.art !== 'mc');
  const amp = window.Analyse ? Analyse.ampel(d) : null;
  const unbekannt = Object.keys(s).filter(k => !Parser.SECTIONS.includes(k) && k !== 'Luecken');

  $('#inhalt').innerHTML = `<article class="lesen">
    <div class="lesen-kopf">
      <div>
        <h1>${E(d.titel)}${d.bereich === 'Legacy' ? '<span class="legacy-stempel">LEGACY</span>' : ''}</h1>
        <p class="unter">${amp ? `<span class="plakette"><i class="ampel ${amp.farbe}"></i>${E(amp.txt)}</span>` : ''}${d.stufe ? `<span class="plakette">${E(d.stufe)}</span>` : ''}<span class="plakette">${E(bereichName(d.bereich))} ${E(d.block)}</span>${d.fach.map(f => `<span class="plakette fachp">${E(f)}</span>`).join('')}${d.pruefungen.map(p => `<span class="plakette pp">${E(p)}</span>`).join('')}${d.quellen.length ? `<span class="plakette" title="${E(d.quellen.join(', '))}">${d.quellen.length} Quelle(n)</span>` : ''}</p>
      </div>
      <div class="lesen-werkzeug">
        ${hatBeide ? `<div class="schalter"><button data-m="profi" class="${modus !== 'einfach' ? 'an' : ''}">Profi</button><button data-m="einfach" class="${modus === 'einfach' ? 'an' : ''}">Einfach erklärt</button></div>` : ''}
        <button class="glas icon" id="btn-druck" title="Drucken / als PDF speichern">🖨</button>
      </div>
    </div>
    ${d.bereich === 'Legacy' ? '<p class="unter">Veraltete Technik: Wissen für Prüfung und Altbestand. In neuen Umgebungen nicht mehr einsetzen.</p>' : ''}
    <div class="text">${Parser.md(haupt)}</div>
    ${s['Merksatz'] ? `<div class="zettel">${s['Merksatz'].split('\n').filter(x => x.trim()).map(x => `<p>${Parser.inline(x.replace(/^[-*]\s*/, ''))}</p>`).join('')}</div>` : ''}
    ${s['Prüfungsfalle'] ? `<section class="falle"><h2>Prüfungsfalle</h2><div class="text">${Parser.md(s['Prüfungsfalle'])}</div></section>` : ''}
    ${d.grafiken.length ? `<details class="abschnitt grafik-abschnitt" open><summary>Grafik${d.grafiken.some(g => g.animierbar) ? ' – Animation' : ''}</summary><div class="text">${d.grafiken.map((g, i) => g.animierbar && window.Anim ? Anim.html(d, i) : `<h3>${E(g.name)}</h3>${Parser.md(g.text)}`).join('')}</div></details>` : ''}
    ${s['Lab'] ? Lernen.labHtml(d) : ''}
    ${abschnitt('Befehle', d.befehle.length ? `<div class="tablewrap"><table><thead><tr><th>Befehl</th><th>Erklärung</th></tr></thead><tbody>${d.befehle.map(x => `<tr><td><code>${E(x.befehl)}</code></td><td>${Parser.inline(x.text)}</td></tr>`).join('')}</tbody></table></div>` : Parser.md(s['Befehle']), d.typ === 'referenz')}
    ${abschnitt(`Übungen (${d.uebungen.length})`, d.uebungen.map((u, i) => `<div class="uebung"><b>${i + 1}.</b> ${Parser.inline(u.a)} <button class="glas knopf klein zeige-l">Lösung</button><div class="loesung">${Parser.inline(u.l)}</div></div>`).join(''), d.typ === 'uebung')}
    ${nichtMc.length ? `<details class="abschnitt" ${d.typ !== 'thema' ? 'open' : ''}><summary>Aufgaben (${nichtMc.length}) – Lücken, Zuordnen, Reihenfolge, Freitext, Szenario</summary><div class="text" id="lesen-aufgaben"></div></details>` : ''}
    ${abschnitt(`Karteikarten (${d.cards.length})`, d.cards.length ? `<div class="karten">${d.cards.map(c => `<button class="karte"><div class="innen"><div class="seite">${Parser.inline(c.f)}</div><div class="seite rück">${Parser.inline(c.a)}</div></div></button>`).join('')}</div>` : '')}
    ${d.quiz.length ? `<details class="abschnitt" ${d.typ === 'fragen' ? 'open' : ''}><summary>Quiz (${d.quiz.length})</summary><div class="text" id="lesen-quiz"></div></details>` : ''}
    ${d.spickzettel.length ? `<div class="spick"><h3>Spickzettel</h3><ul>${d.spickzettel.map(z => `<li>${Parser.inline(z)}</li>`).join('')}</ul></div>` : ''}
    ${unbekannt.map(k => abschnitt(k, Parser.md(s[k]))).join('')}
    ${verweise.length ? `<h3>Siehe auch</h3><p>${verweise.map(v => `<a class="verweis" data-go="lesen" data-param="${E(v)}">${E(S.byId[v].titel)}</a>`).join(' · ')}</p>` : ''}
    ${d.quellen.length ? `<p class="quellen">Quellen: ${d.quellen.map(E).join(', ')}</p>` : ''}
    <div class="lesen-fuss">
      <button class="glas knopf primär" id="btn-gelesen">${S.p.gelesen[id] ? '✓ Gelesen' : 'Als gelesen markieren'}</button>
      ${nachbar(d, -1)}${nachbar(d, 1)}
    </div>
  </article>`;

  $$('.lesen-kopf .schalter button').forEach(b => b.onclick = () => { S.p.einstellungen.modus = b.dataset.m; speichern(); ton('kreide'); lesen(id); });
  $('#btn-gelesen').onclick = () => {
    if (S.p.gelesen[id]) delete S.p.gelesen[id]; else { S.p.gelesen[id] = new Date().toISOString(); ton('gut'); toast('Abgehakt.'); melde('gelesen', 1, { doc: d }); }
    speichern(); $('#btn-gelesen').textContent = S.p.gelesen[id] ? '✓ Gelesen' : 'Als gelesen markieren';
  };
  $('#btn-druck').onclick = () => Extras.drucken();
  $$('.karte').forEach(k => k.onclick = () => { k.classList.toggle('dreh'); ton('kreide'); });
  Lernen.labBinden(d);
  $$('.zeige-l').forEach(b => b.onclick = () => b.parentElement.classList.toggle('offen'));
  if (window.Anim) Anim.binden(d);
  const qEl = $('#lesen-quiz');
  if (qEl) items.filter(it => it.art === 'mc').forEach((it, i) => { const box = document.createElement('div'); box.className = 'lesen-item'; qEl.appendChild(box); Formen.render(it, box, { modus: 'lesen', nr: i + 1 }); });
  const aEl = $('#lesen-aufgaben');
  if (aEl) nichtMc.forEach((it, i) => { const box = document.createElement('div'); box.className = 'lesen-item'; aEl.appendChild(box); Formen.render(it, box, { modus: 'lesen', nr: i + 1 }); });
}
function nachbar(d, r) {
  const list = S.docs.filter(x => x.bereich === d.bereich), i = list.indexOf(d), n = list[i + r];
  return n ? `<button class="glas knopf" data-go="lesen" data-param="${E(n.id)}">${r < 0 ? '‹ ' : ''}${E(n.titel)}${r > 0 ? ' ›' : ''}</button>` : '';
}

// ---------- Einstellungen ----------
async function einstellungen(fokus) {
  krumen([START, { txt: 'Einstellungen' }]);
  const e = S.p.einstellungen;
  let info = {}; try { info = await window.api.info(); } catch {}
  const fehler = S.fehler.filter(f => f.art === 'fehler'), warn = S.fehler.filter(f => f.art === 'warnung');
  const an = b => b ? 'An' : 'Aus';
  $('#inhalt').innerHTML = `<h1>Einstellungen</h1>
    <div class="einst-zeile"><div>Profil<small>${E(S.p.profil.name)}, seit ${new Date(S.p.profil.erstellt).toLocaleDateString('de-DE')}</small></div><button class="glas knopf" id="e-name">Namen ändern</button></div>
    <h2>Aussehen</h2>
    <div class="einst-zeile"><div>Farbwelt<small>Nacht = dunkel mit Blau/Cyan (Standard) · Tafel = grüne Kreidetafel · Weltall = Sternenfeld</small></div><div class="schalter">${Object.entries(THEMES).map(([k, v]) => `<button data-t="${k}" class="${e.theme === k ? 'an' : ''}">${v.replace(' (Standard)', '')}</button>`).join('')}</div></div>
    <div class="einst-zeile"><div>Hell / Dunkel<small>Heller Modus für Tageslicht und Druck</small></div><div class="schalter"><button data-h="0" class="${!e.hell ? 'an' : ''}">Dunkel</button><button data-h="1" class="${e.hell ? 'an' : ''}">Hell</button></div></div>
    <div class="einst-zeile"><div>Effekte<small>Konfetti, Level-Up, Mikro-Animationen</small></div><button class="glas knopf" id="e-eff">${an(e.effekte)}</button></div>
    <div class="einst-zeile"><div>Fokus-Modus<small>Blendet Ablenkungen aus (Stickman, Statuszeile, XP-Anzeige) · Strg+Umschalt+F</small></div><button class="glas knopf" id="e-fokus">${an(e.fokus)}</button></div>
    <div class="einst-zeile"><div>Ton<small>Kreide, Gong, Klicks – leise, standardmäßig aus</small></div><div><input type="range" id="e-vol" min="0" max="0.5" step="0.05" value="${e.lautstaerke}" aria-label="Lautstärke"> <button class="glas knopf" id="e-ton">${an(e.ton)}</button></div></div>
    <div class="einst-zeile"><div>Rand-Stickman<small>Flieht vor dem Ticket „Drucker geht nicht“ · Ticket anklicken = Waffe werfen (nur am PC)</small></div><button class="glas knopf" id="e-stick">${an(e.stickman)}</button></div>
    <div class="einst-zeile"><div>Start-Intro<small>Domänen-Admin vs. Linux-User, ab dem 2. Start überspringbar</small></div><button class="glas knopf" id="e-intro">${an(e.intro !== false)}</button></div>
    <h2>Lernziele</h2>
    <div class="einst-zeile"><div>Tagesziel (XP)<small>Wird es erreicht, wächst deine Streak</small></div><input type="number" class="zahl" data-e="tagesXP" min="10" max="2000" step="10" value="${e.tagesXP}"></div>
    <div class="einst-zeile"><div>Neue Karten pro Tag<small>Standard 20 · Grundlage für den Tagesplan</small></div><input type="number" class="zahl" data-l="neuProTag" min="0" max="500" value="${S.p.lernen.neuProTag}"></div>
    <div class="einst-zeile"><div>Fragen pro Tag (Tagesplan)</div><input type="number" class="zahl" data-l="fragenProTag" min="0" max="200" value="${S.p.lernen.fragenProTag}"></div>
    <div class="einst-zeile"><div>Lernzeit pro Tag (Minuten)</div><input type="number" class="zahl" data-l="minutenProTag" min="5" max="600" step="5" value="${S.p.lernen.minutenProTag}"></div>
    <div class="einst-zeile"><div>Max. Wiederholungen pro Tag</div><input type="number" class="zahl" data-l="maxWdh" min="10" max="2000" value="${S.p.lernen.maxWdh}"></div>
    <div class="einst-zeile"><div>Intervall-Faktor<small>1,0 = wie Anki · kleiner = öfter wiederholen · größer = seltener</small></div><input type="number" class="zahl" data-l="faktor" min="0.5" max="2" step="0.1" value="${S.p.lernen.faktor}"></div>
    <div class="einst-zeile"><div>Zweites Intervall (Tage)<small>Abstand nach der ersten richtigen Wiederholung</small></div><input type="number" class="zahl" data-l="zweites" min="1" max="30" value="${S.p.lernen.zweites}"></div>
    <div class="einst-zeile"><div>Prüfungsmodus: Sekunden pro Aufgabe<small>Gilt, wenn kein IHK-Zeitlimit gewählt ist</small></div><input type="number" class="zahl" data-l="quizZeit" min="15" max="600" step="5" value="${S.p.lernen.quizZeit}"></div>
    <h2 id="termine">Prüfungstermine</h2>
    ${widget(() => Plan.termineHtml())}
    <h2 id="fehler">Inhaltsfehler</h2>
    ${fehler.length ? `<p class="unter">${fehler.length} Datei(en) wurden übersprungen – die App läuft trotzdem weiter.</p><div class="tablewrap"><table><thead><tr><th>Datei</th><th>Problem</th></tr></thead><tbody>${fehler.map(f => `<tr><td class="mono">${E(f.path)}</td><td>${E(f.msg)}</td></tr>`).join('')}</tbody></table></div>` : '<p class="unter">Keine Inhaltsfehler – alle Dateien wurden gelesen. ✓</p>'}
    ${warn.length ? `<details class="abschnitt"><summary>${warn.length} Hinweis(e) zu Inhalten</summary><div class="text"><div class="tablewrap"><table><tbody>${warn.map(f => `<tr><td class="mono">${E(f.path)}</td><td>${E(f.msg)}</td></tr>`).join('')}</tbody></table></div></div></details>` : ''}
    <h2>Daten</h2>
    <div class="einst-zeile"><div>Fortschritt exportieren<small>Als Datei sichern oder auf PC/iPhone mitnehmen (Sync nur per Export/Import)</small></div><button class="glas knopf" id="e-exp">Exportieren</button></div>
    <div class="einst-zeile"><div>Fortschritt importieren<small>Ersetzt den aktuellen Stand · Netzilon-1.x-Dateien werden automatisch übernommen</small></div><button class="glas knopf" id="e-imp">Importieren</button></div>
    <div class="einst-zeile"><div>Alles zurücksetzen<small>Löscht Profil und Fortschritt</small></div><button class="glas knopf" id="e-reset" style="border-color:var(--rot);color:var(--rot)">Zurücksetzen</button></div>
    ${info.externalContent ? `<div class="einst-zeile"><div>Eigene Inhalte<small>Neue .md-Dateien in diesen Ordner legen und Netzilon Ultra neu starten:<br><code>${E(info.externalContent)}</code></small></div></div>` : ''}
    ${S.p.migriert ? `<div class="einst-zeile"><div>Übernommen aus Netzilon ${E(S.p.migriert.von)}<small>${E(S.p.migriert.aus)} · ${new Date(S.p.migriert.am).toLocaleDateString('de-DE')}</small></div></div>` : ''}
    <div class="einst-zeile"><div>Netzilon Ultra ${E(info.version || VERSION)}<small>GPProductions · ${info.plattform === 'web' ? 'Browser-/iPhone-Version' : 'Windows-Version'} · Inhalte geladen in ${S.ladezeit} ms</small></div><button class="glas knopf" data-go="changelog">Changelog</button></div>`;
  $$('[data-t]').forEach(b => b.onclick = () => { setzeTheme(b.dataset.t); einstellungen(); });
  $$('[data-h]').forEach(b => b.onclick = () => { setzeHell(b.dataset.h === '1'); einstellungen(); });
  $$('.zahl[data-l]').forEach(i => i.onchange = () => { const v = parseFloat(i.value); if (!isNaN(v)) { S.p.lernen[i.dataset.l] = v; speichern(); toast('Gespeichert.'); } });
  $$('.zahl[data-e]').forEach(i => i.onchange = () => { const v = parseFloat(i.value); if (!isNaN(v)) { e[i.dataset.e] = v; speichern(); toast('Gespeichert.'); } });
  $('#e-vol').oninput = ev => { e.lautstaerke = +ev.target.value; speichern(); ton('klick'); };
  $('#e-eff').onclick = () => { e.effekte = !e.effekte; themeAnwenden(); speichern(); einstellungen(); };
  $('#e-fokus').onclick = () => { setzeFokus(!e.fokus); einstellungen(); };
  $('#e-stick').onclick = () => { e.stickman = !e.stickman; (e.stickman && !istSchmal() && !e.fokus) ? Stickman.start() : Stickman.stop(); speichern(); einstellungen(); };
  $('#e-intro').onclick = () => { e.intro = e.intro === false; speichern(); einstellungen(); };
  $('#e-ton').onclick = () => { e.ton = !e.ton; speichern(); tonKnopf(); einstellungen(); };
  $('#e-name').onclick = () => { const n = prompt('Neuer Name:', S.p.profil.name); if (n && n.trim()) { S.p.profil.name = n.trim().slice(0, 24); speichern(); einstellungen(); } };
  $('#e-exp').onclick = async () => { if (await window.api.exportProgress(S.p)) toast('Exportiert.'); };
  $('#e-imp').onclick = importieren;
  $('#e-reset').onclick = () => {
    if (!confirm('Wirklich alles löschen? Das kann nicht rückgängig gemacht werden.')) return;
    S.p = neuerFortschritt(); speichern(); themeAnwenden(); S.verlauf = []; profilAnlegen();
  };
  try { Plan.termineBinden(); } catch (er) { console.warn(er); }
  if (fokus) { const z = document.getElementById(fokus); if (z) setTimeout(() => z.scrollIntoView({ block: 'start' }), 30); }
}
async function changelog() {
  krumen([START, { txt: 'Einstellungen', go: 'einstellungen' }, { txt: 'Changelog' }]);
  let t = ''; try { t = await window.api.changelog(); } catch {}
  $('#inhalt').innerHTML = `<article class="lesen"><div class="text">${Parser.md(String(t || '').replace(/^# /gm, '### ').replace(/^## /gm, '#### '))}</div></article>`;
}

// ---------- Globale Ereignisse ----------
document.addEventListener('click', e => {
  const go = e.target.closest('[data-go]');
  if (go && !go.disabled) { e.preventDefault(); gehe(go.dataset.go, go.dataset.param || undefined); return; }
  const x = e.target.closest('.xref'); if (x) { gehe('lesen', x.dataset.id); return; }
  const c = e.target.closest('.copy');
  if (c) { try { navigator.clipboard.writeText(c.parentElement.querySelector('code').textContent); toast('Kopiert.'); } catch {} }
});
document.addEventListener('keydown', e => {
  const imFeld = e.target.matches && e.target.matches('input,textarea,select,[contenteditable]');
  if (e.key === 'F11') { e.preventDefault(); try { window.api.toggleFullscreen(); } catch {} }
  if (e.ctrlKey && e.shiftKey && (e.key === 'F' || e.key === 'f')) { e.preventDefault(); setzeFokus(!S.p.einstellungen.fokus); return; }
  if (e.key === 'Escape') {
    if ($('#hilfe-overlay')) { $('#hilfe-overlay').remove(); return; }
    if (!imFeld && !['terminal'].includes(S.ansicht?.ansicht)) zurueck();
    else if (imFeld) e.target.blur();
  }
  if (e.altKey && e.key === 'ArrowLeft' && !imFeld) zurueck();
  if (e.key === '?' && !imFeld && !['terminal', 'spiel'].includes(S.ansicht?.ansicht)) { e.preventDefault(); tastenHilfe(); }
});
function tastenHilfe() {
  if ($('#hilfe-overlay')) { $('#hilfe-overlay').remove(); return; }
  const div = document.createElement('div'); div.id = 'hilfe-overlay';
  div.innerHTML = `<div class="hilfe-box glas"><h2>Tastenkürzel</h2><table><tbody>
    ${[['Strg + K', 'Suche'], ['Esc', 'Zurück / Dialog schließen'], ['Leertaste', 'Karteikarte umdrehen'], ['1 – 4', 'Karte bewerten (Nochmal/Schwer/Gut/Leicht) bzw. Antwort wählen'], ['A – D', 'Antwort im Quiz'], ['Enter', 'Weiter / Prüfen'], ['← →', 'Prüfung: vorige/nächste Aufgabe'], ['Tab', 'Terminal: Befehl vervollständigen'], ['Strg + Umschalt + F', 'Fokus-Modus'], ['F11', 'Vollbild'], ['?', 'Diese Hilfe']].map(([k, t]) => `<tr><td><kbd>${k}</kbd></td><td>${t}</td></tr>`).join('')}
    </tbody></table><button class="glas knopf primär" id="hilfe-zu">Schließen</button></div>`;
  document.body.appendChild(div);
  div.onclick = ev => { if (ev.target === div || ev.target.id === 'hilfe-zu') div.remove(); };
}
function tonKnopf() { const b = $('#btn-ton'); if (b) { b.classList.toggle('aus', !S.p.einstellungen.ton); b.title = S.p.einstellungen.ton ? 'Ton an (klicken = aus)' : 'Ton aus (klicken = an)'; } }

// ---------- Start ----------
(async function start() {
  let roh = null;
  try { roh = await window.api.loadProgress(); } catch {}
  S.p = migrieren(roh);
  S.p.starts++; speichern();
  themeAnwenden();
  const reihe = Object.keys(THEMES);
  $('#btn-theme').onclick = () => { setzeTheme(reihe[(reihe.indexOf(S.p.einstellungen.theme) + 1) % reihe.length]); toast('Farbwelt: ' + THEMES[S.p.einstellungen.theme]); ton('kreide'); if (S.ansicht?.ansicht === 'einstellungen') einstellungen(); };
  $('#btn-hell').onclick = () => { setzeHell(!S.p.einstellungen.hell); if (S.ansicht?.ansicht === 'einstellungen') einstellungen(); };
  $('#btn-fokus').onclick = () => setzeFokus(!S.p.einstellungen.fokus);
  $('#btn-ton').onclick = () => { S.p.einstellungen.ton = !S.p.einstellungen.ton; speichern(); tonKnopf(); toast(S.p.einstellungen.ton ? 'Ton an' : 'Ton aus'); };
  tonKnopf();
  $('#btn-voll').onclick = () => { try { window.api.toggleFullscreen(); } catch {} };
  const introAn = !(S.p.einstellungen.intro === false && S.p.starts > 1);
  await Promise.all([ladeInhalte(), introAn ? Intro.play(S.p.starts > 1) : null]);
  if (S.p.einstellungen.stickman && !S.p.einstellungen.fokus && !istSchmal()) Stickman.start();
  try { if (window.Mot) Mot.start(); } catch (e) { console.warn(e); }
  try { if (window.Ziele) Ziele.start(); } catch (e) { console.warn(e); }
  if (!S.p.profil) profilAnlegen(); else gehe('home');
  window.__netzilonBereit = true;
})();
