// Netzilon Ultra – Motivation: XP, Level, Ränge, Streak, Tagesziel, 3 tägliche Mini-Quests, Abzeichen, Konfetti
const Mot = (() => {
  const XP = { start: 10, gelesen: 20, karte: 2, richtig: 5, falsch: 1, lab: 3, labKomplett: 25, kartenSitzung: 10, spiel: 10, terminal: 8, netsim: 15, ping: 1, rechner: 5, dojo: 5, freitext: 3, tagesaufgabe: 30, quest: 25, subnetz: 0, puzzle: 0, luecke: 0, pruefung: 50, speicher: 15 };
  const RAENGE = [[1, 'Azubi', '🎒'], [5, 'Junior-Admin', '🔧'], [10, 'Admin', '🖥'], [15, 'Senior-Admin', '🛡'], [20, 'Domain Admin', '👑'], [30, 'Enterprise Admin', '🌐'], [45, 'System-Architekt', '🏗'], [60, 'Cloud-Architekt', '☁'], [75, 'IT-Leiter', '🧭'], [90, 'Legende', '⭐'], [100, 'Netzilon-Meister (Durchgespielt)', '🏆']];
  const MAXLV = 100;
  // Kurve 2.1: Level 100 bei ca. 62.700 XP (erreichbar bis zum Ende der Ausbildung)
  const xpFuer = l => Math.round(40 * Math.pow(Math.max(0, l - 1), 1.6));
  const level = xp => { xp = Math.max(0, xp); let l = Math.min(MAXLV, Math.floor(Math.pow(xp / 40, 1 / 1.6)) + 1); while (l < MAXLV && xpFuer(l + 1) <= xp) l++; while (l > 1 && xpFuer(l) > xp) l--; return l; };
  const rang = l => RAENGE.filter(r => l >= r[0]).slice(-1)[0];
  const QUESTS = [
    { art: 'karte', ziel: 15, txt: '15 Karteikarten wiederholen' }, { art: 'richtig', ziel: 8, txt: '8 Aufgaben richtig lösen' },
    { art: 'gelesen', ziel: 1, txt: '1 Thema lesen und abhaken' }, { art: 'rechner', ziel: 2, txt: '2 Rechner-Zufallsaufgaben lösen' },
    { art: 'terminal', ziel: 2, txt: '2 Terminal-Aufgaben lösen' }, { art: 'spiel', ziel: 1, txt: '1 Lernspiel spielen' },
    { art: 'netsim', ziel: 1, txt: '1 Aufgabe im Netzwerk-Simulator lösen' }, { art: 'luecke', ziel: 5, txt: '5 Lücken richtig füllen' },
    { art: 'dojo', ziel: 3, txt: '3 IHK-Fallen im Dojo knacken' }, { art: 'puzzle', ziel: 2, txt: '2 Zuordnen-/Reihenfolge-Aufgaben lösen' },
    { art: 'lab', ziel: 3, txt: '3 Lab-Schritte abhaken' }, { art: 'freitext', ziel: 1, txt: '1 Freitext- oder Szenario-Aufgabe bewerten' },
    { art: 'speicher', ziel: 1, txt: '1 Aufgabe im Speicher-Labor lösen' }
  ];
  const z = k => (S.p.zaehler || {})[k] || 0;
  const gelesenWo = re => Object.keys(S.p.gelesen).filter(id => re.test(id) || (S.byId[id] && re.test(S.byId[id].titel))).length;
  const richtigWo = re => Object.entries(S.p.quiz).filter(([id, s]) => re.test(id) || (S.byId[id.split('#')[0]] && re.test(S.byId[id.split('#')[0]].titel))).reduce((n, [, s]) => n + (s.r || 0), 0);
  const ABZEICHEN = [
    { id: 'start', name: 'Erster Login', txt: 'Profil angelegt', icon: '🔑', ok: () => !!S.p.profil },
    { id: 'lese10', name: 'Leseratte', txt: '10 Themen gelesen', icon: '📖', ok: () => Object.keys(S.p.gelesen).length >= 10 },
    { id: 'lese50', name: 'Bücherwurm', txt: '50 Themen gelesen', icon: '📚', ok: () => Object.keys(S.p.gelesen).length >= 50 },
    { id: 'lese150', name: 'Bibliothekar', txt: '150 Themen gelesen', icon: '🏛', ok: () => Object.keys(S.p.gelesen).length >= 150 },
    { id: 'karte100', name: 'Kartenhai', txt: '100 Karteikarten wiederholt', icon: '🦈', ok: () => z('karte') >= 100 },
    { id: 'karte1000', name: 'Kartenmeister', txt: '1000 Karteikarten wiederholt', icon: '🃏', ok: () => z('karte') >= 1000 },
    { id: 'quiz50', name: 'Quizfuchs', txt: '50 Aufgaben richtig', icon: '🦊', ok: () => z('richtig') >= 50 },
    { id: 'quiz500', name: 'Quiz-Gott', txt: '500 Aufgaben richtig', icon: '⚡', ok: () => z('richtig') >= 500 },
    { id: 'subnetz', name: 'Subnetting-Gott', txt: '25 Subnetting-Aufgaben richtig (Rechner, Spiele, Simulator)', icon: '🧮', ok: () => z('subnetz') >= 25 },
    { id: 'gpo', name: 'GPO-Meister', txt: '20 richtige Antworten zu Gruppenrichtlinien', icon: '📜', ok: () => richtigWo(/gpo|gruppenrichtlinie/i) >= 20 },
    { id: 'root', name: 'Root-Rechte', txt: '10 Linux-Terminal-Aufgaben gelöst', icon: '🐧', ok: () => z('terminal_bash') >= 10 },
    { id: 'ps', name: 'PowerShell-Profi', txt: '10 PowerShell-Aufgaben gelöst', icon: '💠', ok: () => z('terminal_ps') >= 10 },
    { id: 'ios', name: 'Cisco-Ninja', txt: '10 Cisco-IOS-Aufgaben gelöst', icon: '🥷', ok: () => z('terminal_ios') >= 10 },
    { id: 'cmd', name: 'CMD-Veteran', txt: '10 CMD-Aufgaben gelöst', icon: '⬛', ok: () => z('terminal_cmd') >= 10 },
    { id: 'ping', name: 'Ping-Pong', txt: 'Erster erfolgreicher Ping im Simulator', icon: '🏓', ok: () => z('ping') >= 1 },
    { id: 'netz5', name: 'Netzarchitekt', txt: '5 Simulator-Aufgaben gelöst', icon: '🕸', ok: () => z('netsim') >= 5 },
    { id: 'pruef1', name: 'Prüfling', txt: 'Erste Prüfung geschrieben', icon: '📝', ok: () => S.p.pruefungen.length >= 1 },
    { id: 'note1', name: 'Einser-Kandidat', txt: 'Note 1 in einer Prüfung (mind. 20 Aufgaben)', icon: '🥇', ok: () => S.p.pruefungen.some(p => p.note === 1 && p.fragen >= 20) },
    { id: 'ihk', name: 'IHK-ready', txt: 'Eine IHK-Probeprüfung bestanden', icon: '🎓', ok: () => S.p.pruefungen.some(p => p.doc && p.note <= 4) },
    { id: 'streak7', name: 'Durchhalter', txt: '7 Tage Streak', icon: '🔥', ok: () => S.p.streak.best >= 7 },
    { id: 'streak30', name: 'Eiserner Wille', txt: '30 Tage Streak', icon: '🏔', ok: () => S.p.streak.best >= 30 },
    { id: 'eule', name: 'Nachteule', txt: 'Nach 22 Uhr gelernt', icon: '🦉', ok: () => z('nacht') >= 1 },
    { id: 'frueh', name: 'Frühaufsteher', txt: 'Vor 7 Uhr gelernt', icon: '🌅', ok: () => z('frueh') >= 1 },
    { id: 'spiel25', name: 'Spielkind', txt: '25 Lernspiele gespielt', icon: '🎮', ok: () => z('spiel') >= 25 },
    { id: 'lab', name: 'Laborratte', txt: 'Ein Lab komplett abgehakt', icon: '🧪', ok: () => z('labKomplett') >= 1 },
    { id: 'fehler10', name: 'Fehlerjäger', txt: '10 vorher falsche Aufgaben später richtig', icon: '🎯', ok: () => Object.values(S.p.quiz).reduce((n, q) => n + (q.korrigiert || 0), 0) >= 10 },
    { id: 'dojo20', name: 'Dojo-Meister', txt: '20 IHK-Fallen geknackt', icon: '🥋', ok: () => z('dojo') >= 20 },
    { id: 'rechner25', name: 'Rechenkünstler', txt: '25 Rechner-Zufallsaufgaben gelöst', icon: '🧾', ok: () => z('rechner') >= 25 },
    { id: 'luecke25', name: 'Lückenfüller', txt: '25 Lücken richtig gefüllt', icon: '🧩', ok: () => z('luecke') >= 25 },
    { id: 'puzzle10', name: 'Ordnungsamt', txt: '10 Zuordnen-/Reihenfolge-Aufgaben', icon: '🗂', ok: () => z('puzzle') >= 10 },
    { id: 'freitext10', name: 'Schreiberling', txt: '10 Freitexte selbst bewertet', icon: '✍', ok: () => z('freitext') >= 10 },
    { id: 'quest10', name: 'Questgeber', txt: '10 Mini-Quests erledigt', icon: '📯', ok: () => z('quest') >= 10 },
    { id: 'linux', name: 'Pinguin-Flüsterer', txt: '20 Linux-Themen gelesen', icon: '🐧', ok: () => Object.keys(S.p.gelesen).filter(id => S.byId[id]?.bereich === 'Linux').length >= 20 },
    { id: 'l10', name: 'Admin', txt: 'Level 10 erreicht', icon: '🖥', ok: () => level(S.p.xp.gesamt) >= 10 },
    { id: 'l20', name: 'Domain Admin', txt: 'Level 20 erreicht', icon: '👑', ok: () => level(S.p.xp.gesamt) >= 20 },
    { id: 'l30', name: 'Enterprise Admin', txt: 'Level 30 erreicht', icon: '🌐', ok: () => level(S.p.xp.gesamt) >= 30 },
    { id: 'l50', name: 'System-Architekt', txt: 'Level 50 erreicht', icon: '🏗', ok: () => level(S.p.xp.gesamt) >= 50 },
    { id: 'l75', name: 'IT-Leiter', txt: 'Level 75 erreicht', icon: '🧭', ok: () => level(S.p.xp.gesamt) >= 75 },
    { id: 'l100', name: 'Durchgespielt', txt: 'Level 100 erreicht – alles gelernt', icon: '🏆', ok: () => level(S.p.xp.gesamt) >= 100 },
    { id: 'meister', name: 'Meisterschaft 95 %', txt: 'Gesamt-Meisterschaft ≥ 95 % (gelesen, Aufgaben erfolgreich, Karten)', icon: '💎', ok: () => !!window.Ziele && Ziele.meisterschaft().pz >= 95 },
    { id: 'tag30', name: 'Monats-Aufgabe', txt: '30 Aufgaben des Tages gelöst', icon: '🎯', ok: () => z('tagesaufgabe') >= 30 },
    { id: 'tag365', name: 'Ein Jahr Aufgaben', txt: '365 Aufgaben des Tages gelöst', icon: '📆', ok: () => z('tagesaufgabe') >= 365 },
    { id: 'san1', name: 'LUN-Lotse', txt: 'Erste Aufgabe im Speicher-Labor gelöst', icon: '🗄', ok: () => z('speicher') >= 1 },
    { id: 'san10', name: 'SAN-Architekt', txt: '10 Aufgaben im Speicher-Labor gelöst', icon: '🧱', ok: () => z('speicher') >= 10 },
    { id: 'zufall5', name: 'Zufalls-Prüfling', txt: '5 Zufallsprüfungen geschrieben', icon: '🎲', ok: () => ((S.p.zufall && S.p.zufall.n) || 0) >= 5 }
  ];

  // ---- Tag / Quests ----
  function hash(s) { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; }
  function tagCheck() {
    if (S.p.tag && S.p.tag.datum === heute()) return S.p.tag;
    let h = hash(heute() + (S.p.profil?.name || '')); const pool = QUESTS.slice(), qs = [];
    while (qs.length < 3 && pool.length) { const k = h % pool.length; qs.push({ ...pool.splice(k, 1)[0], stand: 0, fertig: false }); h = hash(String(h)); }
    S.p.tag = { datum: heute(), xp: 0, z: {}, minuten: 0, quests: qs, ziel: false };
    return S.p.tag;
  }
  function streakAnzeige() {
    const st = S.p.streak; const gestern = plusTage(-1);
    return st.letzter === heute() || st.letzter === gestern ? st.tage : 0;
  }

  function ereignis(art, n = 1, extra = {}) {
    if (!S.p || !S.p.profil && art !== 'start') return;
    const t = tagCheck();
    const lvlVor = level(S.p.xp.gesamt);
    S.p.zaehler[art] = (S.p.zaehler[art] || 0) + n;
    t.z[art] = (t.z[art] || 0) + n;
    let gewinn = (XP[art] || 0) * (art === 'pruefung' ? 1 : n);
    if (art === 'karte' && extra.q >= 2) gewinn += 1;
    if (art === 'tagesaufgabe' && extra.ok) gewinn += 20;
    if (art === 'pruefung') gewinn += Math.round((extra.prozent || 0) / 2);
    const std = new Date().getHours();
    if (std >= 22 || std < 4) S.p.zaehler.nacht = (S.p.zaehler.nacht || 0) + 1;
    if (std >= 4 && std < 7) S.p.zaehler.frueh = (S.p.zaehler.frueh || 0) + 1;
    // Quests
    for (const q of t.quests) {
      if (q.fertig || q.art !== art) continue;
      q.stand = Math.min(q.ziel, q.stand + n);
      if (q.stand >= q.ziel) { q.fertig = true; gewinn += XP.quest; S.p.zaehler.quest = (S.p.zaehler.quest || 0) + 1; setTimeout(() => { toast(`Quest erledigt: ${q.txt} (+${XP.quest} XP)`, 'gold'); konfetti(40); }, 200); }
    }
    if (gewinn) {
      S.p.xp.gesamt += gewinn; t.xp += gewinn;
      S.p.xp.tage[heute()] = (S.p.xp.tage[heute()] || 0) + gewinn;
      plusXp(gewinn);
    }
    // Tagesziel → Streak
    if (!t.ziel && t.xp >= (S.p.einstellungen.tagesXP || 60)) {
      t.ziel = true;
      const st = S.p.streak;
      st.tage = st.letzter === plusTage(-1) ? st.tage + 1 : st.letzter === heute() ? st.tage : 1;
      st.letzter = heute(); st.best = Math.max(st.best || 0, st.tage);
      setTimeout(() => { toast(`Tagesziel erreicht! 🔥 Streak: ${st.tage} Tag${st.tage === 1 ? '' : 'e'}`, 'gold'); konfetti(60); }, 400);
    }
    const lvlNach = level(S.p.xp.gesamt);
    if (lvlNach > lvlVor) {
      const rv = rang(lvlVor), rn = rang(lvlNach);
      setTimeout(() => {
        if (lvlNach >= MAXLV) { toast('🏆 LEVEL 100 – DURCHGESPIELT! Du bist Netzilon-Meister!', 'gold'); konfetti(400); setTimeout(() => konfetti(300), 700); }
        else { toast(rn !== rv ? `Beförderung! Du bist jetzt ${rn[1]} ${rn[2]}` : `Level ${lvlNach}!`, 'gold'); konfetti(120); }
        ton('level');
      }, 300);
    }
    pruefeAbzeichen();
    chip(); speichern();
  }
  function pruefeAbzeichen(still) {
    for (const a of ABZEICHEN) {
      if (S.p.abzeichen[a.id]) continue;
      let ok = false; try { ok = a.ok(); } catch {}
      if (ok) { S.p.abzeichen[a.id] = heute(); if (!still) setTimeout(() => { toast(`Abzeichen: ${a.icon} ${a.name}`, 'gold'); konfetti(80); }, 700); }
    }
  }

  // ---- Anzeige ----
  function chip() {
    const el = $('#xp-chip'); if (!el || !S.p?.profil) return;
    const l = level(S.p.xp.gesamt), r = rang(l), st = streakAnzeige();
    const ant = l >= MAXLV ? 1 : (S.p.xp.gesamt - xpFuer(l)) / (xpFuer(l + 1) - xpFuer(l));
    el.innerHTML = `<span class="xp-rang" title="${E(r[1])}">${r[2]}</span><span class="xp-lvl">Lv ${l}</span><span class="xp-mini"><i style="width:${Math.round(ant * 100)}%"></i></span><span class="xp-streak ${st ? 'an' : ''}" title="Streak">🔥${st}</span>`;
    el.hidden = false;
  }
  function plusXp(n) {
    if (!S.p.einstellungen.effekte) return;
    const el = $('#xp-chip'); if (!el || el.offsetParent === null) return;
    const r = el.getBoundingClientRect(), f = document.createElement('div');
    f.className = 'xp-float'; f.textContent = `+${n} XP`; f.style.left = (r.left + r.width / 2) + 'px'; f.style.top = (r.bottom + 4) + 'px';
    document.body.appendChild(f); setTimeout(() => f.remove(), 1100);
  }
  function kopfHtml() {
    const t = tagCheck(), l = level(S.p.xp.gesamt), r = rang(l), st = streakAnzeige();
    const ant = l >= MAXLV ? 1 : (S.p.xp.gesamt - xpFuer(l)) / (xpFuer(l + 1) - xpFuer(l)), ziel = S.p.einstellungen.tagesXP || 60, zAnt = Math.min(1, t.xp / ziel);
    const nr = RAENGE.find(x => x[0] > l);
    return `<button class="glas rang-karte" data-go="erfolge" title="Erfolge ansehen">
      <div class="ring" style="--p:${Math.round(zAnt * 100)}"><span>${t.xp}<small>/${ziel}</small></span></div>
      <div class="rang-info"><b>${r[2]} ${E(r[1])} · Level ${l}</b><div class="balken"><i style="width:${Math.round(ant * 100)}%"></i></div>
      <small>${(S.p.xp.gesamt).toLocaleString('de-DE')} XP · ${l >= MAXLV ? '🏆 DURCHGESPIELT – Level 100!' : `noch ${(xpFuer(l + 1) - S.p.xp.gesamt).toLocaleString('de-DE')} bis Level ${l + 1}`}${nr ? ` · ${nr[1]} ab Level ${nr[0]}` : ''}</small>
      <small>🔥 Streak ${st} Tag${st === 1 ? '' : 'e'} · Tagesziel ${t.ziel ? 'erreicht ✓' : `${Math.round(zAnt * 100)} %`} · ${Object.keys(S.p.abzeichen).length}/${ABZEICHEN.length} Abzeichen</small></div></button>`;
  }
  function questsHtml() {
    const t = tagCheck();
    return `<section class="karte-w quests"><div class="w-titel">⚔ Mini-Quests heute</div>${t.quests.map(q => `<div class="quest ${q.fertig ? 'fertig' : ''}"><span>${q.fertig ? '✓' : '○'}</span><div><b>${E(q.txt)}</b><div class="balken"><i style="width:${Math.round(q.stand / q.ziel * 100)}%"></i></div><small>${q.stand}/${q.ziel} · +${XP.quest} XP</small></div></div>`).join('')}</section>`;
  }
  function binden() {}

  // ---- Ansicht Erfolge ----
  function erfolge() {
    krumen([START, { txt: 'Erfolge' }]);
    pruefeAbzeichen(true);
    const l = level(S.p.xp.gesamt), r = rang(l);
    $('#inhalt').innerHTML = `<h1>Erfolge</h1><p class="unter">${r[2]} ${E(r[1])} · Level ${l} · ${S.p.xp.gesamt.toLocaleString('de-DE')} XP · Streak ${streakAnzeige()} (Rekord ${S.p.streak.best})</p>
      ${kopfHtml()}
      <h2>Ränge</h2><div class="raenge">${RAENGE.map((x, k) => `<div class="glas rang-stufe ${l >= x[0] ? 'erreicht' : ''} ${r === x ? 'akt' : ''}"><span>${x[2]}</span><b>${E(x[1])}</b><small>ab Level ${x[0]} (${xpFuer(x[0]).toLocaleString('de-DE')} XP)</small></div>`).join('<span class="rang-pfeil">→</span>')}</div>
      <h2>Abzeichen (${Object.keys(S.p.abzeichen).length}/${ABZEICHEN.length})</h2>
      <div class="abzeichen">${ABZEICHEN.map(a => `<div class="glas abz ${S.p.abzeichen[a.id] ? 'hat' : ''}" title="${E(a.txt)}"><span class="abz-icon">${S.p.abzeichen[a.id] ? a.icon : '🔒'}</span><b>${E(a.name)}</b><small>${E(a.txt)}</small>${S.p.abzeichen[a.id] ? `<em>${Plan.dtxt(S.p.abzeichen[a.id])}</em>` : ''}</div>`).join('')}</div>
      <h2>So bekommst du XP</h2><div class="tablewrap"><table><tbody>${[['Thema gelesen', XP.gelesen], ['Aufgabe richtig', XP.richtig], ['Karteikarte', XP.karte + '–' + (XP.karte + 1)], ['Prüfung', '50 + Prozent/2'], ['Mini-Quest', XP.quest], ['Terminal-Aufgabe', XP.terminal], ['Simulator-Aufgabe', XP.netsim], ['Rechner-/Dojo-Aufgabe', XP.rechner], ['Lernspiel', XP.spiel], ['Lab komplett', XP.labKomplett]].map(([a, b]) => `<tr><td>${a}</td><td>${b} XP</td></tr>`).join('')}</tbody></table></div>`;
  }

  // ---- Konfetti ----
  function konfetti(n = 90) {
    if (!S.p?.einstellungen.effekte) return;
    if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const cv = document.createElement('canvas'); cv.className = 'konfetti'; document.body.appendChild(cv);
    const c = cv.getContext('2d'), W = cv.width = innerWidth, H = cv.height = innerHeight;
    const farben = ['#7ee0ff', '#f3d86a', '#9fe0a8', '#f2a6c4', '#c7b3f5', '#ff9f6b'];
    const p = Array.from({ length: n }, () => ({ x: W / 2 + (Math.random() - 0.5) * W * 0.3, y: H * 0.35, vx: (Math.random() - 0.5) * 14, vy: -Math.random() * 13 - 4, r: Math.random() * 6 + 3, f: farben[Math.random() * farben.length | 0], a: Math.random() * 6, va: (Math.random() - 0.5) * 0.4 }));
    const t0 = performance.now();
    const frame = now => {
      const t = now - t0; c.clearRect(0, 0, W, H);
      for (const q of p) { q.vy += 0.35; q.vx *= 0.99; q.x += q.vx; q.y += q.vy; q.a += q.va; c.save(); c.translate(q.x, q.y); c.rotate(q.a); c.fillStyle = q.f; c.globalAlpha = Math.max(0, 1 - t / 1800); c.fillRect(-q.r / 2, -q.r / 4, q.r, q.r / 2); c.restore(); }
      if (t < 1800) requestAnimationFrame(frame); else cv.remove();
    };
    requestAnimationFrame(frame);
  }

  // ---- Lernzeit messen (aktive Minuten) ----
  let letzteAktivitaet = Date.now();
  function start() {
    ['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach(ev => addEventListener(ev, () => { letzteAktivitaet = Date.now(); }, { passive: true }));
    setInterval(() => {
      if (!S.p?.profil || document.hidden || Date.now() - letzteAktivitaet > 120000) return;
      const t = tagCheck(); t.minuten = (t.minuten || 0) + 1; S.p.zaehler.minuten = (S.p.zaehler.minuten || 0) + 1; speichern();
    }, 60000);
    tagCheck(); pruefeAbzeichen(true); chip();
  }

  window.VIEWS = Object.assign(window.VIEWS || {}, { erfolge });
  return { ereignis, kopfHtml, questsHtml, binden, chip, konfetti, start, level, rang, ABZEICHEN, RAENGE, tagCheck, streakAnzeige };
})();
window.Mot = Mot;
