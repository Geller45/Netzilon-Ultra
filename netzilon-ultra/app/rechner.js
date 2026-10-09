// Netzilon Ultra – Rechner mit IHK-Rechenweg + Zufallsaufgaben, Dojo „IHK-Fallen“
const Rechner = (() => {
  const W = () => Werkzeuge;
  const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const wahl = a => a[Math.floor(Math.random() * a.length)];
  const zahlDe = s => { s = String(s ?? '').trim().replace(/\s|€|%/g, ''); if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.'); else if ((s.match(/\./g) || []).length > 1) s = s.replace(/\./g, ''); const n = parseFloat(s); return n; };
  const f = (n, d = 2) => (isFinite(n) ? Number(n).toLocaleString('de-DE', { maximumFractionDigits: d }) : '–');
  const eur = n => f(n, 2) + ' €';
  const eur2 = n => Number(n).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  const tab = (rows, kopf) => `<div class="tablewrap"><table>${kopf ? `<thead><tr>${kopf.map(k => `<th>${k}</th>`).join('')}</tr></thead>` : ''}<tbody>${rows.map(r => `<tr>${r.map((c, i) => `<td${i ? ' class="mono"' : ''}>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  const weg = schritte => `<div class="rechenweg"><b>IHK-Rechenweg</b><ol>${schritte.map(s => `<li>${s}</li>`).join('')}</ol></div>`;
  const feld = (id, label, wert, extra = '') => `<label class="r-feld"><span>${label}</span><input id="${id}" value="${E(String(wert))}" ${extra}></label>`;
  const sel = (id, label, opts, wert) => `<label class="r-feld"><span>${label}</span><select id="${id}">${opts.map(([v, t]) => `<option value="${E(v)}" ${String(v) === String(wert) ? 'selected' : ''}>${t}</option>`).join('')}</select></label>`;
  const flaeche = (id, label, wert, rows = 6) => `<label class="r-feld breit"><span>${label}</span><textarea id="${id}" rows="${rows}" spellcheck="false">${E(wert)}</textarea></label>`;
  const v = id => (document.getElementById(id) || {}).value || '';
  const z = id => zahlDe(v(id));
  const privIp = () => wahl([() => `10.${rnd(0, 255)}.${rnd(0, 255)}.${rnd(1, 254)}`, () => `172.${rnd(16, 31)}.${rnd(0, 255)}.${rnd(1, 254)}`, () => `192.168.${rnd(0, 255)}.${rnd(1, 254)}`])();

  // ---------- Netzplan-Berechnung ----------
  function netzplan(text) {
    const vg = [];
    for (const zeile of text.split('\n')) {
      const t = zeile.trim(); if (!t || t.startsWith('#')) continue;
      const [n, d, vor = ''] = t.split(/\s*;\s*/);
      if (!n || isNaN(zahlDe(d))) throw `Zeile „${t}“: Format Vorgang; Dauer; Vorgänger (Komma-getrennt oder -)`;
      vg.push({ n: n.trim(), d: zahlDe(d), vor: vor.trim() === '-' || !vor.trim() ? [] : vor.split(',').map(x => x.trim()).filter(Boolean) });
    }
    const by = Object.fromEntries(vg.map(x => [x.n, x]));
    vg.forEach(x => x.vor.forEach(p => { if (!by[p]) throw `Vorgänger „${p}“ von ${x.n} existiert nicht`; }));
    const reihe = [], besucht = {};
    const visit = (x, stack = new Set()) => { if (besucht[x.n]) return; if (stack.has(x.n)) throw 'Zyklus im Netzplan'; stack.add(x.n); x.vor.forEach(p => visit(by[p], stack)); besucht[x.n] = 1; reihe.push(x); };
    vg.forEach(x => visit(x));
    for (const x of reihe) { x.faz = x.vor.length ? Math.max(...x.vor.map(p => by[p].fez)) : 0; x.fez = x.faz + x.d; }
    const dauer = Math.max(...vg.map(x => x.fez));
    const nach = n => vg.filter(y => y.vor.includes(n));
    for (const x of reihe.slice().reverse()) { const N = nach(x.n); x.sez = N.length ? Math.min(...N.map(y => y.saz)) : dauer; x.saz = x.sez - x.d; }
    for (const x of vg) { x.gp = x.saz - x.faz; const N = nach(x.n); x.fp = (N.length ? Math.min(...N.map(y => y.faz)) : dauer) - x.fez; x.krit = x.gp === 0; }
    // kritischer Pfad (Kette über GP = 0)
    const pfad = []; let akt = vg.find(x => x.krit && !x.vor.length);
    while (akt) { pfad.push(akt.n); akt = nach(akt.n).find(y => y.krit && y.faz === akt.fez); }
    return { vg, reihe, dauer, pfad };
  }
  function netzplanSvg(r) {
    const ebene = {}; for (const x of r.reihe) ebene[x.n] = x.vor.length ? Math.max(...x.vor.map(p => ebene[p])) + 1 : 0;
    const spalten = {}; r.reihe.forEach(x => (spalten[ebene[x.n]] = spalten[ebene[x.n]] || []).push(x));
    const BW = 150, BH = 74, GX = 60, GY = 22, nS = Object.keys(spalten).length, maxZ = Math.max(...Object.values(spalten).map(l => l.length));
    const Wd = nS * (BW + GX) + 20, Hd = maxZ * (BH + GY) + 20, pos = {};
    Object.entries(spalten).forEach(([s, l]) => l.forEach((x, k) => pos[x.n] = { x: 10 + s * (BW + GX), y: 10 + k * (BH + GY) + (maxZ - l.length) * (BH + GY) / 2 }));
    let svg = `<svg class="netzplan-svg" viewBox="0 0 ${Wd} ${Hd}" style="max-width:${Wd}px">`;
    for (const x of r.vg) for (const p of x.vor) { const a = pos[p], b = pos[x.n]; svg += `<line x1="${a.x + BW}" y1="${a.y + BH / 2}" x2="${b.x}" y2="${b.y + BH / 2}" class="np-kante ${x.krit && r.vg.find(y => y.n === p).krit ? 'krit' : ''}"/>`; }
    for (const x of r.vg) { const p = pos[x.n]; svg += `<g transform="translate(${p.x},${p.y})" class="np-knoten ${x.krit ? 'krit' : ''}"><rect width="${BW}" height="${BH}" rx="6"/><line x1="0" y1="24" x2="${BW}" y2="24"/><line x1="0" y1="50" x2="${BW}" y2="50"/><line x1="${BW / 3}" y1="0" x2="${BW / 3}" y2="24"/><line x1="${BW * 2 / 3}" y1="0" x2="${BW * 2 / 3}" y2="24"/><line x1="${BW / 3}" y1="50" x2="${BW / 3}" y2="${BH}"/><line x1="${BW * 2 / 3}" y1="50" x2="${BW * 2 / 3}" y2="${BH}"/>
      <text x="${BW / 6}" y="17">${x.faz}</text><text x="${BW / 2}" y="17">${f(x.d)}</text><text x="${BW * 5 / 6}" y="17">${x.fez}</text><text x="${BW / 2}" y="42" class="np-name">${E(x.n)}</text><text x="${BW / 6}" y="67">${x.saz}</text><text x="${BW / 2}" y="67">GP ${x.gp}</text><text x="${BW * 5 / 6}" y="67">${x.sez}</text></g>`; }
    return svg + '</svg><p class="tipp">Knoten: oben FAZ | Dauer | FEZ, unten SAZ | GP | SEZ. Rot = kritischer Pfad.</p>';
  }

  // ---------- Kalkulation ----------
  function kalkulation(e) {
    const r = [];
    const lep = e.lep, zep = lep * (1 - e.rab / 100), bep = zep * (1 - e.sko / 100), bzp = bep + e.bzk;
    const sk = bzp * (1 + e.hk / 100), bvp = sk * (1 + e.gew / 100), zvp = bvp / (1 - e.ksk / 100), lvp = zvp / (1 - e.kra / 100), brutto = lvp * (1 + e.ust / 100);
    r.push(['Listeneinkaufspreis (LEP)', eur2(lep), '']);
    r.push([`− Liefererrabatt ${f(e.rab)} % (vom Hundert)`, eur2(lep - zep), `${eur2(lep)} · ${f(e.rab)} / 100`]);
    r.push(['= Zieleinkaufspreis (ZEP)', eur2(zep), '']);
    r.push([`− Liefererskonto ${f(e.sko)} % (vom Hundert)`, eur2(zep - bep), `${eur2(zep)} · ${f(e.sko)} / 100`]);
    r.push(['= Bareinkaufspreis (BEP)', eur2(bep), '']);
    r.push(['+ Bezugskosten', eur2(e.bzk), 'Fracht, Verpackung, Versicherung']);
    r.push(['<b>= Bezugspreis / Einstandspreis</b>', `<b>${eur2(bzp)}</b>`, 'Ende der Bezugskalkulation']);
    r.push([`+ Handlungskosten ${f(e.hk)} %`, eur2(sk - bzp), `${eur2(bzp)} · ${f(e.hk)} / 100`]);
    r.push(['= Selbstkosten', eur2(sk), '']);
    r.push([`+ Gewinn ${f(e.gew)} %`, eur2(bvp - sk), `${eur2(sk)} · ${f(e.gew)} / 100`]);
    r.push(['= Barverkaufspreis (BVP)', eur2(bvp), '']);
    r.push([`+ Kundenskonto ${f(e.ksk)} % (im Hundert!)`, eur2(zvp - bvp), `${eur2(bvp)} / (100 − ${f(e.ksk)}) · ${f(e.ksk)}`]);
    r.push(['= Zielverkaufspreis (ZVP)', eur2(zvp), '']);
    r.push([`+ Kundenrabatt ${f(e.kra)} % (im Hundert!)`, eur2(lvp - zvp), `${eur2(zvp)} / (100 − ${f(e.kra)}) · ${f(e.kra)}`]);
    r.push(['<b>= Listenverkaufspreis netto</b>', `<b>${eur2(lvp)}</b>`, '']);
    r.push([`+ Umsatzsteuer ${f(e.ust)} %`, eur2(brutto - lvp), '']);
    r.push(['= Listenverkaufspreis brutto', eur2(brutto), '']);
    return { r, bzp, sk, bvp, zvp, lvp, brutto, kalkZuschlag: (lvp / bzp - 1) * 100 };
  }

  // ---------- Tabs ----------
  const TABS = {
    ipv4: {
      name: 'IPv4-Subnetz', html: () => `<div class="r-eingabe">${feld('i-ip', 'IP-Adresse (auch mit /Präfix)', '192.168.10.77/26')}${feld('i-m', 'oder Maske (falls kein /)', '255.255.255.0')}</div>`,
      rechne: () => {
        const rows = W().ipv4(v('i-ip'), v('i-m'));
        let [ip, p] = v('i-ip').split('/'); p = p !== undefined ? W().maskeZuPrefix(p) : W().maskeZuPrefix(v('i-m') || '24');
        const okt = Math.min(3, Math.floor(p / 8)), bits = p - okt * 8, block = 2 ** (8 - bits), o = +ip.split('.')[okt];
        const st = p % 8 === 0 ? [`/${p} endet genau auf einer Oktettgrenze → Netzanteil = die ersten ${p / 8} Oktette.`] :
          [`/${p} = ${p} Einsen → im ${okt + 1}. Oktett stehen ${bits} Netzbits: Maskenwert ${256 - block}.`, `Blockgröße (Magic Number) = 256 − ${256 - block} = <b>${block}</b>.`, `${o} liegt im Block ${Math.floor(o / block) * block}–${Math.floor(o / block) * block + block - 1} → Netzadresse und Broadcast ablesen.`];
        return tab(rows.map(r => [r[0], E(r[1]), E(r[2])])) + weg([...st, `Hosts = 2<sup>32 − ${p}</sup> − 2 = 2<sup>${32 - p}</sup> − 2 (Netz- und Broadcastadresse abziehen).`]);
      },
      aufgabe: () => {
        const p = rnd(18, 30), ip = privIp(), rows = W().ipv4(`${ip}/${p}`), wert = k => rows.find(r => r[0] === k)[1];
        const art = wahl(['Netzadresse', 'Broadcast', 'Hosts', 'Erster Host', 'Letzter Host', 'Maske']);
        const antwort = art === 'Hosts' ? 2 ** (32 - p) - 2 : art === 'Maske' ? wert('Subnetzmaske').split(' ')[0] : wert(art);
        return { text: `Gegeben ist <code>${ip}/${p}</code>. ${art === 'Hosts' ? 'Wie viele Hosts sind nutzbar?' : art === 'Maske' ? 'Wie lautet die Subnetzmaske in Punktschreibweise?' : `Wie lautet ${art === 'Broadcast' ? 'die Broadcastadresse' : art === 'Netzadresse' ? 'die Netzadresse' : 'der ' + art}?`}`, antwort, subnetz: true, weg: () => tab(rows.map(r => [r[0], E(r[1]), ''])) };
      }
    },
    vlsm: {
      name: 'VLSM', html: () => `<div class="r-eingabe">${feld('v-n', 'Ausgangsnetz', '192.168.10.0/24')}${feld('v-l', 'Bedarf (Name=Hosts, getrennt mit Komma)', 'Verwaltung=54, Entwicklung=28, Management=5, WAN=2', 'class="breit"')}</div>`,
      rechne: () => { const r = W().vlsm(v('v-n'), v('v-l')); return tab(r.out.map(x => x.map(c => E(String(c)))), ['Netz', 'Bedarf', 'Netz-ID', 'Maske', 'Hostbereich', 'Broadcast', 'Hosts']) + `<p class="unter">Noch frei: ${r.frei} Adressen.</p>` + weg(['Bedarfe <b>absteigend</b> sortieren (größtes Netz zuerst).', 'Je Netz kleinstes n mit 2<sup>n</sup> − 2 ≥ Hosts suchen → Präfix = 32 − n.', 'Netze lückenlos hintereinander vergeben; jede Netzadresse muss ein Vielfaches der Blockgröße sein.', 'Broadcast = nächste Netzadresse − 1.']); },
      aufgabe: () => {
        const basis = `192.168.${rnd(0, 250)}.0/24`, namen = ['Vertrieb', 'Technik', 'Lager', 'Verwaltung', 'Gäste', 'WLAN'];
        const bed = mischen(namen).slice(0, 4).map((n, k) => `${n}=${[rnd(50, 110), rnd(20, 50), rnd(6, 14), 2][k]}`);
        const r = W().vlsm(basis, bed.join(',')), ziel = wahl(r.out.slice(1));
        return { text: `Ausgangsnetz <code>${basis}</code>, Bedarf: ${bed.join(', ')}. Vergabe nach VLSM (größtes zuerst, lückenlos). Welches Netz (Adresse/Präfix) bekommt <b>${ziel[0]}</b>?`, antwort: ziel[2], subnetz: true, weg: () => tab(r.out.map(x => x.map(c => E(String(c)))), ['Netz', 'Bedarf', 'Netz-ID', 'Maske', 'Hostbereich', 'Broadcast', 'Hosts']) };
      }
    },
    ipv6: {
      name: 'IPv6', html: () => `<div class="r-eingabe">${feld('6-a', 'IPv6-Adresse/Präfix', '2001:db8:abcd:12::1/48')}${feld('6-n', 'Aufteilen in /', '52', 'type="number"')}${feld('6-c', 'Anzahl anzeigen', '8', 'type="number"')}</div>`,
      rechne: () => { const r = W().ipv6(v('6-a'), v('6-n'), v('6-c')); return tab(r.zeilen.map(x => x.map(E))) + (r.subs.length ? '<h3>Teilnetze</h3>' + tab(r.subs.map((s, i) => [i + 1, E(s)])) : '') + weg(['Kürzen: führende Nullen je Block weglassen.', 'Die <b>längste</b> Folge von Null-Blöcken (mind. 2) durch <code>::</code> ersetzen – nur <b>einmal</b> pro Adresse.', 'Teilnetze: 2<sup>neu − alt</sup> Stück, z. B. /48 → /64 = 2<sup>16</sup> = 65.536.']); },
      aufgabe: () => {
        if (Math.random() < 0.5) {
          const bl = ['2001', '0db8', wahl(['0000', '00a1', '0bc0']), '0000', '0000', wahl(['0000', '0001']), wahl(['0000', '00ff']), wahl(['0001', '0abc'])];
          const voll = bl.join(':'), kurz = W().v6kurz(W().v6parse(voll));
          return { text: `Kürze die IPv6-Adresse so weit wie möglich: <code>${voll}</code>`, antwort: kurz, weg: () => weg([`Ergebnis: <code>${kurz}</code>`, 'Führende Nullen weg, längste Nullfolge → ::']) };
        }
        const a = wahl([32, 40, 48, 56]), b = wahl([56, 60, 64]); const n = 2 ** (b - a);
        return { text: `Wie viele /${b}-Teilnetze passen in ein /${a}-Präfix?`, antwort: n, weg: () => weg([`2<sup>${b} − ${a}</sup> = 2<sup>${b - a}</sup> = ${f(n, 0)}`]) };
      }
    },
    zahlen: {
      name: 'Zahlensysteme', html: () => `<div class="r-eingabe">${feld('z-w', 'Wert', '172')}${sel('z-b', 'Eingabe ist', [[10, 'Dezimal'], [2, 'Binär'], [16, 'Hexadezimal'], [8, 'Oktal']], 10)}</div>`,
      rechne: () => {
        const rows = W().zahl(v('z-w'), +v('z-b'));
        const n = parseInt(v('z-w').replace(/\s|_/g, '').replace(/^0x|^0b/i, ''), +v('z-b'));
        const st = [];
        if (n >= 0 && n <= 65535) { let x = n, schritte = []; while (x > 0 && schritte.length < 16) { schritte.push(`${x} : 2 = ${Math.floor(x / 2)} Rest <b>${x % 2}</b>`); x = Math.floor(x / 2); } if (schritte.length) st.push('Dezimal → Binär (Restwertmethode, Reste von unten nach oben lesen):<br>' + schritte.join('<br>')); }
        st.push('Binär → Hex: von rechts in 4er-Gruppen (Nibbles) teilen, jede Gruppe = eine Hex-Ziffer (1010 = A … 1111 = F).');
        st.push('Hex/Binär → Dezimal: Stellenwerte addieren (Basis<sup>Position</sup>).');
        return tab(rows.map(r => [r[0], E(r[1])])) + weg(st);
      },
      aufgabe: () => {
        const n = rnd(20, 255), art = wahl(['d2b', 'd2h', 'h2d', 'b2d']);
        const t = { d2b: [`Wandle ${n} (dezimal) in Binär um (8 Bit).`, n.toString(2).padStart(8, '0')], d2h: [`Wandle ${n} (dezimal) in Hexadezimal um.`, n.toString(16).toUpperCase()], h2d: [`Wandle 0x${n.toString(16).toUpperCase()} in Dezimal um.`, n], b2d: [`Wandle ${n.toString(2).padStart(8, '0')} (binär) in Dezimal um.`, n] }[art];
        return { text: t[0], antwort: t[1], vergleich: art === 'd2b' ? (a, b) => String(a).replace(/\s/g, '').padStart(8, '0') === String(b) : null, weg: () => tab(W().zahl(String(n), 10).map(r => [r[0], E(r[1])])) };
      }
    },
    raid: {
      name: 'RAID', html: () => `<div class="r-eingabe">${sel('ra-l', 'RAID-Level', [[0, 'RAID 0 (Striping)'], [1, 'RAID 1 (Spiegel)'], [5, 'RAID 5 (Parität)'], [6, 'RAID 6 (Doppelparität)'], [10, 'RAID 10 (1+0)']], 5)}${feld('ra-g', 'Plattengrößen in TB (Komma/Semikolon, z. B. 4;4;4;2)', '4; 4; 4; 4', 'class="breit"')}</div>`,
      rechne: () => {
        const l = +v('ra-l'), g = v('ra-g').split(/[;\s]+/).map(zahlDe).filter(x => x > 0), n = g.length, min = Math.min(...g);
        const mind = { 0: 2, 1: 2, 5: 3, 6: 4, 10: 4 }[l]; if (n < mind) throw `RAID ${l} braucht mindestens ${mind} Platten`; if (l === 10 && n % 2) throw 'RAID 10 braucht eine gerade Anzahl';
        const nutz = { 0: n * min, 1: min, 5: (n - 1) * min, 6: (n - 2) * min, 10: n / 2 * min }[l], brutto = g.reduce((a, b) => a + b, 0);
        const ausfall = { 0: '0 Platten', 1: `${n - 1} Platte(n)`, 5: '1 Platte', 6: '2 beliebige Platten', 10: '1 pro Spiegelpaar (max. ' + n / 2 + ')' }[l];
        const formel = { 0: 'n · G<sub>min</sub>', 1: 'G<sub>min</sub>', 5: '(n − 1) · G<sub>min</sub>', 6: '(n − 2) · G<sub>min</sub>', 10: 'n / 2 · G<sub>min</sub>' }[l];
        return tab([['Formel', formel], ['Nutzkapazität', f(nutz) + ' TB'], ['Brutto', f(brutto) + ' TB'], ['Effizienz', Math.round(nutz / brutto * 100) + ' %'], ['Darf ausfallen', ausfall]]) +
          weg([`Kleinste Platte bestimmt die nutzbare Größe je Platte: G<sub>min</sub> = ${f(min)} TB${g.some(x => x !== min) ? ' (<b>Falle:</b> größere Platten werden nur teilweise genutzt!)' : ''}.`, `Formel RAID ${l}: ${formel} = ${f(nutz)} TB.`, `Verschnitt/Redundanz = ${f(brutto)} − ${f(nutz)} = ${f(brutto - nutz)} TB.`]);
      },
      aufgabe: () => {
        const l = wahl([0, 1, 5, 6, 10]), n = l === 10 ? wahl([4, 6, 8]) : rnd(l === 6 ? 4 : 3, 6), gr = wahl([1, 2, 4, 8, 12]);
        const g = Array(n).fill(gr); if (Math.random() < 0.3 && l !== 1) g[n - 1] = gr / 2;
        const min = Math.min(...g), nutz = { 0: n * min, 1: min, 5: (n - 1) * min, 6: (n - 2) * min, 10: n / 2 * min }[l];
        return { text: `RAID ${l} aus ${g.map(x => f(x) + ' TB').join(', ')}. Wie groß ist die Nutzkapazität in TB?`, antwort: nutz, einheit: 'TB', weg: () => weg([`G<sub>min</sub> = ${f(min)} TB`, `Nutzkapazität = ${f(nutz)} TB`]) };
      }
    },
    usv: {
      name: 'USV', html: () => `<div class="r-eingabe">${feld('u-p', 'Wirkleistung der Last (W)', '1200')}${feld('u-c', 'Leistungsfaktor cos φ', '0,8')}${feld('u-v', 'Akkuspannung (V)', '24')}${feld('u-ah', 'Akkukapazität (Ah)', '18')}${feld('u-e', 'Wirkungsgrad (%)', '90')}${feld('u-r', 'Reserve (%)', '25')}</div>`,
      rechne: () => {
        const P = z('u-p'), c = z('u-c'), S_ = P / c, E_ = z('u-v') * z('u-ah'), t = E_ * z('u-e') / 100 / P * 60, res = S_ * (1 + z('u-r') / 100);
        return tab([['Scheinleistung S', f(S_, 0) + ' VA'], ['Empfohlene USV-Größe mit Reserve', f(res, 0) + ' VA'], ['Akkuenergie E', f(E_, 0) + ' Wh'], ['Überbrückungszeit t', f(t, 1) + ' min']]) +
          weg([`S = P / cos φ = ${f(P)} W / ${f(c)} = <b>${f(S_, 0)} VA</b> (USVs werden in VA angegeben!)`, `Mit Reserve: ${f(S_, 0)} VA · (1 + ${f(z('u-r'))} %) = ${f(res, 0)} VA`, `E = U · Q = ${f(z('u-v'))} V · ${f(z('u-ah'))} Ah = ${f(E_, 0)} Wh`, `t = E · η / P = ${f(E_, 0)} Wh · ${f(z('u-e') / 100)} / ${f(P)} W = ${f(t / 60, 3)} h = <b>${f(t, 1)} min</b>`]);
      },
      aufgabe: () => {
        if (Math.random() < 0.5) { const P = rnd(3, 30) * 100, c = wahl([0.6, 0.7, 0.8, 0.9]); return { text: `Ein Serverschrank zieht ${f(P)} W bei cos φ = ${f(c)}. Welche Scheinleistung (VA) muss die USV mindestens liefern? (ganze Zahl)`, antwort: Math.round(P / c), tol: 1, einheit: 'VA', weg: () => weg([`S = P / cos φ = ${P} / ${f(c)} = ${f(P / c, 1)} VA`]) }; }
        const U = wahl([12, 24, 48]), Q = wahl([7, 9, 12, 18, 26]), P = rnd(2, 12) * 50, eta = wahl([85, 90, 95]), t = U * Q * eta / 100 / P * 60;
        return { text: `USV-Akku ${U} V / ${Q} Ah, Wirkungsgrad ${eta} %, Last ${P} W. Wie viele Minuten Überbrückung? (1 Nachkommastelle)`, antwort: Math.round(t * 10) / 10, tol: 0.15, einheit: 'min', weg: () => weg([`E = ${U} · ${Q} = ${U * Q} Wh`, `t = ${U * Q} · ${eta / 100} / ${P} h = ${f(t, 1)} min`]) };
      }
    },
    datei: {
      name: 'Dateigröße', html: () => `<div class="r-eingabe">${sel('d-art', 'Art', [['bild', 'Bild (Rastergrafik)'], ['audio', 'Audio (PCM, unkomprimiert)'], ['video', 'Video (unkomprimiert)'], ['text', 'Text']], 'bild')}${feld('d-a', 'Breite px / Abtastrate Hz / Zeichen', '1920')}${feld('d-b', 'Höhe px / Bittiefe / Bytes je Zeichen', '1080')}${feld('d-c', 'Farbtiefe Bit / Kanäle / –', '24')}${feld('d-d', 'Dauer s / fps (Video)', '0')}${feld('d-e', 'Video: Sekunden', '0')}</div>`,
      rechne: () => {
        const art = v('d-art'), a = z('d-a'), b = z('d-b'), c = z('d-c'), d = z('d-d'), e = z('d-e');
        let bit, st;
        if (art === 'bild') { bit = a * b * c; st = [`Bit = Breite · Höhe · Farbtiefe = ${f(a)} · ${f(b)} · ${f(c)} = ${f(bit, 0)} bit`]; }
        else if (art === 'audio') { bit = a * b * c * d; st = [`Bit = Abtastrate · Bittiefe · Kanäle · Sekunden = ${f(a)} · ${f(b)} · ${f(c)} · ${f(d)} = ${f(bit, 0)} bit`]; }
        else if (art === 'video') { bit = a * b * c * d * e; st = [`Bit = Breite · Höhe · Farbtiefe · fps · Sekunden = ${f(a)} · ${f(b)} · ${f(c)} · ${f(d)} · ${f(e)} = ${f(bit, 0)} bit`]; }
        else { bit = a * b * 8; st = [`Bit = Zeichen · Bytes je Zeichen · 8 = ${f(a)} · ${f(b)} · 8`]; }
        const B = bit / 8;
        st.push(`Byte = Bit / 8 = ${f(B, 0)} Byte`, `Dezimal (SI): 1 MB = 1.000.000 Byte → ${f(B / 1e6, 3)} MB`, `Binär (IEC): 1 MiB = 1.048.576 Byte → ${f(B / 1048576, 3)} MiB`);
        return tab([['Bit', f(bit, 0)], ['Byte', f(B, 0)], ['kB / KiB', `${f(B / 1e3, 2)} kB · ${f(B / 1024, 2)} KiB`], ['MB / MiB', `${f(B / 1e6, 3)} MB · ${f(B / 1048576, 3)} MiB`], ['GB / GiB', `${f(B / 1e9, 4)} GB · ${f(B / 1073741824, 4)} GiB`]]) + weg(st);
      },
      aufgabe: () => {
        if (Math.random() < 0.6) { const [w, h] = wahl([[1920, 1080], [1280, 720], [3840, 2160], [1024, 768], [800, 600]]), t = wahl([8, 16, 24, 32]), B = w * h * t / 8; const mib = Math.random() < 0.5;
          return { text: `Ein unkomprimiertes Bild hat ${w} × ${h} Pixel bei ${t} Bit Farbtiefe. Wie groß ist es in ${mib ? 'MiB' : 'MB'}? (2 Nachkommastellen)`, antwort: Math.round(B / (mib ? 1048576 : 1e6) * 100) / 100, tol: 0.011, einheit: mib ? 'MiB' : 'MB', weg: () => weg([`${w} · ${h} · ${t} / 8 = ${f(B, 0)} Byte`, `/ ${mib ? '1.048.576' : '1.000.000'} = ${f(B / (mib ? 1048576 : 1e6), 2)}`]) }; }
        const hz = wahl([44100, 48000]), bitt = wahl([16, 24]), k = 2, s = rnd(1, 5) * 60, B = hz * bitt * k * s / 8;
        return { text: `Stereo-Audio, ${f(hz)} Hz, ${bitt} Bit, ${s / 60} Minute(n), unkomprimiert. Größe in MB (SI, 2 Nachkommastellen)?`, antwort: Math.round(B / 1e6 * 100) / 100, tol: 0.011, einheit: 'MB', weg: () => weg([`${hz} · ${bitt} · 2 · ${s} / 8 = ${f(B, 0)} Byte = ${f(B / 1e6, 2)} MB`]) };
      }
    },
    uebertragung: {
      name: 'Übertragungszeit', html: () => `<div class="r-eingabe">${feld('ue-m', 'Datenmenge', '4,7')}${sel('ue-e', 'Einheit', [['1', 'Byte'], ['1000', 'kB'], ['1000000', 'MB'], ['1000000000', 'GB'], ['1000000000000', 'TB'], ['1024', 'KiB'], ['1048576', 'MiB'], ['1073741824', 'GiB'], ['1099511627776', 'TiB']], '1000000000')}${feld('ue-r', 'Übertragungsrate', '100')}${sel('ue-re', 'Einheit Rate', [['1000', 'kbit/s'], ['1000000', 'Mbit/s'], ['1000000000', 'Gbit/s']], '1000000')}</div>`,
      rechne: () => {
        const bit = z('ue-m') * +v('ue-e') * 8, rate = z('ue-r') * +v('ue-re'), s = bit / rate;
        const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), sec = (s % 60).toFixed(1);
        return tab([['Datenmenge in Bit', f(bit, 0) + ' bit'], ['Rate in bit/s', f(rate, 0)], ['Zeit', f(s, 2) + ' s'], ['Umgerechnet', `${h} h ${m} min ${sec.replace('.', ',')} s`]]) +
          weg([`Datenmenge in Bit: ${f(z('ue-m'))} · ${f(+v('ue-e'), 0)} Byte · 8 = ${f(bit, 0)} bit`, `Rate in bit/s: ${f(z('ue-r'))} · ${f(+v('ue-re'), 0)} = ${f(rate, 0)} bit/s (Raten immer dezimal!)`, `t = Datenmenge / Rate = ${f(s, 2)} s`]);
      },
      aufgabe: () => { const m = wahl([250, 700, 1500, 4700, 8000]), r = wahl([16, 50, 100, 250, 1000]), s = m * 8 / r; return { text: `Wie viele Sekunden dauert die Übertragung von ${f(m)} MB bei ${r} Mbit/s (ohne Overhead)?`, antwort: Math.round(s * 10) / 10, tol: 0.15, einheit: 's', weg: () => weg([`${m} MB · 8 = ${m * 8} Mbit`, `${m * 8} / ${r} = ${f(s, 1)} s`]) }; }
    },
    strom: {
      name: 'Stromkosten', html: () => `<div class="r-eingabe">${feld('s-p', 'Leistung je Gerät (W)', '350')}${feld('s-n', 'Anzahl Geräte', '4')}${feld('s-h', 'Stunden pro Tag', '24')}${feld('s-t', 'Tage pro Jahr', '365')}${feld('s-k', 'Preis €/kWh', '0,35')}</div>`,
      rechne: () => {
        const P = z('s-p') * z('s-n'), kwh = P * z('s-h') * z('s-t') / 1000, k = kwh * z('s-k');
        return tab([['Gesamtleistung', f(P) + ' W'], ['Energie pro Jahr', f(kwh, 1) + ' kWh'], ['Kosten pro Jahr', eur2(k)], ['Kosten pro Monat', eur2(k / 12)]]) +
          weg([`Gesamtleistung = ${f(z('s-p'))} W · ${f(z('s-n'))} = ${f(P)} W`, `W → kW: ${f(P)} / 1000 = ${f(P / 1000, 3)} kW (<b>Falle:</b> nicht vergessen!)`, `Energie = ${f(P / 1000, 3)} kW · ${f(z('s-h'))} h · ${f(z('s-t'))} Tage = ${f(kwh, 1)} kWh`, `Kosten = ${f(kwh, 1)} kWh · ${f(z('s-k'))} €/kWh = ${eur2(k)}`]);
      },
      aufgabe: () => { const p = rnd(5, 60) * 10, n = rnd(1, 10), h = wahl([8, 10, 24]), t = wahl([220, 250, 365]), pr = wahl([0.3, 0.32, 0.35, 0.4]), k = p * n * h * t / 1000 * pr; return { text: `${n} Gerät(e) à ${p} W laufen ${h} h/Tag an ${t} Tagen im Jahr. Strompreis ${f(pr)} €/kWh. Jährliche Kosten in €? (2 Nachkommastellen)`, antwort: Math.round(k * 100) / 100, tol: 0.011, einheit: '€', weg: () => weg([`${p} · ${n} · ${h} · ${t} / 1000 = ${f(k / pr, 2)} kWh`, `· ${f(pr)} € = ${eur2(k)}`]) }; }
    },
    kalk: {
      name: 'Kalkulation', html: () => `<div class="r-eingabe">${feld('k-lep', 'Listeneinkaufspreis €', '800')}${feld('k-rab', 'Liefererrabatt %', '10')}${feld('k-sko', 'Liefererskonto %', '2')}${feld('k-bzk', 'Bezugskosten €', '25')}${feld('k-hk', 'Handlungskosten %', '30')}${feld('k-gew', 'Gewinn %', '15')}${feld('k-ksk', 'Kundenskonto %', '3')}${feld('k-kra', 'Kundenrabatt %', '5')}${feld('k-ust', 'USt %', '19')}</div>`,
      werte: () => ({ lep: z('k-lep'), rab: z('k-rab'), sko: z('k-sko'), bzk: z('k-bzk'), hk: z('k-hk'), gew: z('k-gew'), ksk: z('k-ksk'), kra: z('k-kra'), ust: z('k-ust') }),
      rechne: () => { const k = kalkulation(TABS.kalk.werte()); return tab(k.r, ['Schema', 'Betrag', 'Rechnung']) + `<p class="unter">Kalkulationszuschlag: ${f(k.kalkZuschlag)} % · Handelsspanne: ${f((k.lvp - k.bzp) / k.lvp * 100)} %</p>` + weg(['Einkauf: Rabatt und Skonto werden <b>vom Hundert</b> abgezogen (Basis = Preis davor).', 'Verkauf: Kundenskonto und Kundenrabatt werden <b>im Hundert</b> aufgeschlagen: Wert / (100 − p) · 100.', 'Erst Bezugspreis, dann Handlungskosten → Selbstkosten, dann Gewinn → Barverkaufspreis.']); },
      aufgabe: () => {
        const e = { lep: rnd(2, 40) * 50, rab: wahl([0, 5, 10, 15, 20]), sko: wahl([0, 2, 3]), bzk: rnd(0, 8) * 5, hk: wahl([20, 25, 30, 40]), gew: wahl([10, 15, 20]), ksk: wahl([2, 3]), kra: wahl([0, 5, 10]), ust: 19 };
        const k = kalkulation(e), frage = wahl([['den Bezugspreis', k.bzp], ['die Selbstkosten', k.sk], ['den Barverkaufspreis', k.bvp], ['den Listenverkaufspreis (netto)', k.lvp]]);
        return { text: `LEP ${eur2(e.lep)}, Liefererrabatt ${e.rab} %, Liefererskonto ${e.sko} %, Bezugskosten ${eur2(e.bzk)}, Handlungskosten ${e.hk} %, Gewinn ${e.gew} %, Kundenskonto ${e.ksk} %, Kundenrabatt ${e.kra} %. Berechne ${frage[0]} (€, 2 Nachkommastellen).`, antwort: Math.round(frage[1] * 100) / 100, tol: 0.011, einheit: '€', weg: () => tab(k.r, ['Schema', 'Betrag', 'Rechnung']) };
      }
    },
    nutzwert: {
      name: 'Nutzwertanalyse', html: () => `<div class="r-eingabe">${feld('n-alt', 'Alternativen (Komma)', 'Server A, Server B, Cloud C', 'class="breit"')}${flaeche('n-tab', 'Kriterien: Name; Gewicht %; Punkte je Alternative (0–10)', 'Preis; 30; 6; 8; 9\nLeistung; 25; 9; 7; 6\nSupport; 20; 8; 6; 7\nDatenschutz; 15; 9; 9; 5\nSkalierbarkeit; 10; 5; 6; 10')}</div>`,
      rechne: () => {
        const alt = v('n-alt').split(',').map(s => s.trim()).filter(Boolean);
        const kr = v('n-tab').split('\n').map(l => l.trim()).filter(Boolean).map(l => { const t = l.split(/\s*;\s*/); return { n: t[0], g: zahlDe(t[1]), p: t.slice(2).map(zahlDe) }; });
        const sg = kr.reduce((n, k) => n + k.g, 0);
        const summe = alt.map((_, a) => kr.reduce((n, k) => n + k.g / 100 * (k.p[a] || 0), 0));
        const best = summe.indexOf(Math.max(...summe));
        return tab([...kr.map(k => [E(k.n), f(k.g) + ' %', ...alt.map((_, a) => `${f(k.p[a] || 0)} → ${f(k.g / 100 * (k.p[a] || 0), 2)}`)]), ['<b>Nutzwert</b>', f(sg) + ' %', ...summe.map((s, a) => `<b>${f(s, 2)}</b>${a === best ? ' ★' : ''}`)]], ['Kriterium', 'Gewicht', ...alt.map(E)]) +
          (Math.abs(sg - 100) > 0.01 ? `<p class="fehler">Gewichte ergeben ${f(sg)} % statt 100 %!</p>` : '') +
          weg(['Gewichtung festlegen (Summe 100 %).', 'Jede Alternative je Kriterium bewerten (Punkte).', 'Teilnutzwert = Gewicht · Punkte; Nutzwert = Summe der Teilnutzwerte.', `Höchster Nutzwert gewinnt: <b>${E(alt[best] || '–')}</b> mit ${f(summe[best], 2)}.`]);
      },
      aufgabe: () => {
        const g = wahl([[50, 30, 20], [40, 40, 20], [30, 50, 20], [60, 25, 15]]), p = [0, 1].map(() => g.map(() => rnd(2, 10)));
        const nw = p.map(x => x.reduce((n, v_, k) => n + v_ * g[k] / 100, 0)), a = rnd(0, 1);
        return { text: `Kriterien Preis (${g[0]} %), Leistung (${g[1]} %), Service (${g[2]} %). Angebot A: ${p[0].join(' / ')} Punkte, Angebot B: ${p[1].join(' / ')} Punkte. Nutzwert von Angebot ${'AB'[a]}? (2 Nachkommastellen)`, antwort: Math.round(nw[a] * 100) / 100, tol: 0.011, weg: () => weg([`A: ${p[0].map((x, k) => `${x}·${g[k] / 100}`).join(' + ')} = ${f(nw[0], 2)}`, `B: ${p[1].map((x, k) => `${x}·${g[k] / 100}`).join(' + ')} = ${f(nw[1], 2)}`]) };
      }
    },
    netzplan: {
      name: 'Netzplan', html: () => `<div class="r-eingabe">${flaeche('np-t', 'Vorgänge: Name; Dauer; Vorgänger (Komma oder -)', 'A; 3; -\nB; 5; A\nC; 2; A\nD; 4; B, C\nE; 3; C\nF; 2; D, E', 7)}</div>`,
      rechne: () => {
        const r = netzplan(v('np-t'));
        return tab(r.vg.map(x => [`${x.krit ? '<b>' : ''}${E(x.n)}${x.krit ? '</b>' : ''}`, f(x.d), x.vor.join(', ') || '–', x.faz, x.fez, x.saz, x.sez, x.gp, x.fp]), ['Vorgang', 'Dauer', 'Vorgänger', 'FAZ', 'FEZ', 'SAZ', 'SEZ', 'GP', 'FP']) +
          `<p class="unter">Projektdauer: <b>${f(r.dauer)}</b> · Kritischer Pfad: <b>${r.pfad.join(' → ')}</b></p>` + netzplanSvg(r) +
          weg(['Vorwärtsrechnung: FAZ = größter FEZ aller Vorgänger (Start = 0), FEZ = FAZ + Dauer.', 'Rückwärtsrechnung: SEZ = kleinster SAZ aller Nachfolger (Ende = Projektdauer), SAZ = SEZ − Dauer.', 'Gesamtpuffer GP = SAZ − FAZ; freier Puffer FP = kleinster FAZ der Nachfolger − FEZ.', 'Kritischer Pfad = alle Vorgänge mit GP = 0 – jede Verzögerung verschiebt das Projektende.']);
      },
      aufgabe: () => {
        const d = Array.from({ length: 6 }, () => rnd(1, 8));
        const txt = `A; ${d[0]}; -\nB; ${d[1]}; A\nC; ${d[2]}; A\nD; ${d[3]}; B\nE; ${d[4]}; B, C\nF; ${d[5]}; D, E`;
        const r = netzplan(txt), x = wahl(r.vg), frage = wahl(['dauer', 'gp']);
        return { text: `Netzplan: ${txt.split('\n').map(l => l.replace(/; /g, ' | ')).join(' · ')} (Vorgang | Dauer | Vorgänger). ${frage === 'dauer' ? 'Wie lang ist die Projektdauer?' : `Wie groß ist der Gesamtpuffer von Vorgang ${x.n}?`}`, antwort: frage === 'dauer' ? r.dauer : x.gp, weg: () => tab(r.vg.map(y => [y.n, y.d, y.faz, y.fez, y.saz, y.sez, y.gp]), ['Vorgang', 'Dauer', 'FAZ', 'FEZ', 'SAZ', 'SEZ', 'GP']) + `<p>Kritischer Pfad: ${r.pfad.join(' → ')}</p>` };
      }
    },
    breakeven: {
      name: 'Break-even', html: () => `<div class="r-eingabe">${feld('b-kf', 'Fixkosten €', '24000')}${feld('b-p', 'Verkaufspreis je Stück €', '89')}${feld('b-kv', 'Variable Kosten je Stück €', '49')}</div>`,
      rechne: () => {
        const kf = z('b-kf'), p = z('b-p'), kv = z('b-kv'), db = p - kv; if (db <= 0) throw 'Preis muss über den variablen Kosten liegen (Deckungsbeitrag > 0)';
        const x = kf / db;
        return tab([['Deckungsbeitrag je Stück', eur2(db)], ['Break-even-Menge', `${f(x, 2)} Stück → ab ${Math.ceil(x)} Stück Gewinn`], ['Break-even-Umsatz', eur2(Math.ceil(x) * p)]]) +
          weg([`Deckungsbeitrag db = p − k<sub>v</sub> = ${eur2(p)} − ${eur2(kv)} = ${eur2(db)}`, `Gewinnschwelle x = K<sub>fix</sub> / db = ${eur2(kf)} / ${eur2(db)} = ${f(x, 2)} Stück`, 'Aufrunden: Erst ab dem nächsten ganzen Stück wird Gewinn gemacht.']);
      },
      aufgabe: () => { const kf = rnd(5, 60) * 1000, kv = rnd(10, 80), p = kv + rnd(5, 60), x = Math.ceil(kf / (p - kv)); return { text: `Fixkosten ${eur2(kf)}, Preis ${eur2(p)} je Stück, variable Kosten ${eur2(kv)} je Stück. Ab welcher Stückzahl wird Gewinn erzielt (aufrunden)?`, antwort: x, einheit: 'Stück', weg: () => weg([`db = ${p} − ${kv} = ${p - kv} €`, `${kf} / ${p - kv} = ${f(kf / (p - kv), 2)} → ${x} Stück`]) }; }
    },
    amort: {
      name: 'Amortisation', html: () => `<div class="r-eingabe">${feld('a-i', 'Anschaffungskosten €', '18000')}${feld('a-e', 'Jährliche Einsparung / Mehrertrag €', '7500')}${feld('a-k', 'Zusätzliche laufende Kosten pro Jahr €', '1500')}${feld('a-n', 'Nutzungsdauer (Jahre)', '5')}</div>`,
      rechne: () => {
        const I = z('a-i'), R = z('a-e') - z('a-k'); if (R <= 0) throw 'Rückfluss pro Jahr muss positiv sein';
        const t = I / R, n = z('a-n');
        return tab([['Rückfluss pro Jahr', eur2(R)], ['Amortisationszeit', `${f(t, 2)} Jahre = ${f(t * 12, 1)} Monate`], ['Bewertung', t <= n ? `lohnt sich (vor Ende der Nutzungsdauer von ${f(n)} Jahren)` : 'lohnt sich nicht innerhalb der Nutzungsdauer']]) +
          weg([`Rückfluss = Einsparung − laufende Kosten = ${eur2(z('a-e'))} − ${eur2(z('a-k'))} = ${eur2(R)}`, `Amortisationszeit = Anschaffungskosten / Rückfluss = ${eur2(I)} / ${eur2(R)} = ${f(t, 2)} Jahre`, `In Monaten: ${f(t, 2)} · 12 = ${f(t * 12, 1)}`]);
      },
      aufgabe: () => { const I = rnd(4, 60) * 1000, e = rnd(2, 20) * 500, k = rnd(0, 4) * 250; const R = e - k > 0 ? e - k : e; const t = I / R; return { text: `Anschaffung ${eur2(I)}, jährliche Einsparung ${eur2(e)}, zusätzliche Wartung ${eur2(e - k > 0 ? k : 0)} pro Jahr. Amortisationszeit in Jahren? (2 Nachkommastellen)`, antwort: Math.round(t * 100) / 100, tol: 0.011, einheit: 'Jahre', weg: () => weg([`Rückfluss = ${eur2(R)}`, `${eur2(I)} / ${eur2(R)} = ${f(t, 2)} Jahre`]) }; }
    }
  };

  // ---------- Prüfen von Antworten ----------
  function stimmt(eingabe, a) {
    if (typeof a.antwort === 'number') { const x = zahlDe(eingabe); if (isNaN(x)) return false; const tol = a.tol ?? Math.max(0.0001, Math.abs(a.antwort) * 0.001); return Math.abs(x - a.antwort) <= tol; }
    if (a.vergleich) return a.vergleich(eingabe, a.antwort);
    const n = s => String(s).toLowerCase().replace(/\s+/g, '').replace(/^0x/, '');
    return n(eingabe) === n(a.antwort);
  }
  const antwortTxt = a => typeof a.antwort === 'number' ? f(a.antwort, 4) + (a.einheit ? ' ' + a.einheit : '') : String(a.antwort);

  function ansicht(tabKey = 'ipv4') {
    if (!TABS[tabKey]) tabKey = 'ipv4';
    krumen([START, { txt: 'Rechner' }]);
    const T = TABS[tabKey];
    $('#inhalt').innerHTML = `<h1>Rechner</h1><div class="filterleiste">${Object.entries(TABS).map(([k, t]) => `<button class="glas knopf ${k === tabKey ? 'an' : ''}" data-tab="${k}">${t.name}</button>`).join('')}<button class="glas knopf" data-go="dojo">🥋 IHK-Fallen</button></div>
      <div class="rechner"><div id="r-feld">${T.html()}</div><div id="r-aus"></div>
      <div class="zufall glas"><div class="zufall-kopf"><b>🎲 Zufallsaufgabe ${E(T.name)}</b><small>${(S.p.rechner[tabKey] || { r: 0 }).r || 0} gelöst</small><button class="glas knopf klein" id="z-neu">Neue Aufgabe</button></div><div id="z-aufgabe"><p class="tipp">Übe wie in der IHK: Aufgabe lösen, eintippen, Rechenweg vergleichen.</p></div></div></div>`;
    document.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => { S.ansicht.param = b.dataset.tab; ansicht(b.dataset.tab); ton('kreide'); });
    const run = () => { try { $('#r-aus').innerHTML = T.rechne(); } catch (e) { $('#r-aus').innerHTML = `<p class="fehler">${E(String(e && e.message || e))}</p>`; } };
    document.querySelectorAll('#r-feld input, #r-feld select, #r-feld textarea').forEach(i => i.oninput = run);
    run();
    $('#z-neu').onclick = () => neueAufgabe(tabKey, T);
  }
  function neueAufgabe(key, T) {
    let a; try { a = T.aufgabe(); } catch (e) { toast('Aufgabe konnte nicht erzeugt werden.'); return; }
    const box = $('#z-aufgabe'); let fertig = false;
    box.innerHTML = `<p class="z-text">${a.text}</p><div class="r-eingabe"><label class="r-feld"><span>Deine Lösung${a.einheit ? ' (' + E(a.einheit) + ')' : ''}</span><input id="z-ein" autocomplete="off"></label><button class="glas knopf primär" id="z-pruef" style="align-self:flex-end">Prüfen</button><button class="glas knopf" id="z-weg" style="align-self:flex-end">Lösungsweg</button></div><div id="z-erg"></div>`;
    const ein = $('#z-ein'); ein.focus();
    const zeigeWeg = () => { $('#z-erg').innerHTML += `<div class="z-weg">Lösung: <b>${E(antwortTxt(a))}</b>${a.weg ? a.weg() : ''}</div>`; $('#z-weg').disabled = true; };
    const pruefen = () => {
      if (fertig) { neueAufgabe(key, T); return; }
      if (!ein.value.trim()) return;
      fertig = true; const ok = stimmt(ein.value, a);
      const st = S.p.rechner[key] = S.p.rechner[key] || { r: 0, f: 0 }; ok ? st.r++ : st.f++; speichern();
      ein.classList.add(ok ? 'ok' : 'nein');
      $('#z-erg').innerHTML = ok ? '<p class="fb-ok">Richtig! ✓</p>' : '<p class="fb-nein">Leider falsch.</p>';
      ton(ok ? 'gut' : 'schlecht');
      if (ok) { melde('rechner', 1); if (a.subnetz) melde('subnetz', 1); }
      zeigeWeg(); $('#z-pruef').textContent = 'Nächste (Enter)';
    };
    $('#z-pruef').onclick = pruefen; $('#z-weg').onclick = () => { if (!fertig) { fertig = true; zeigeWeg(); $('#z-pruef').textContent = 'Nächste (Enter)'; } };
    ein.onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); pruefen(); } };
  }

  // ================= DOJO „IHK-Fallen“ =================
  const FALLEN = [
    () => { const b = rnd(2, 9) * 1000000 + rnd(0, 999) * 1000; return { titel: 'MB vs. MiB', frage: `Eine Datei hat ${f(b, 0)} Byte. Wie viele <b>MiB</b> sind das? (2 Nachkommastellen)`, antwort: Math.round(b / 1048576 * 100) / 100, tol: 0.011, einheit: 'MiB', falle: 'MiB ist binär: 1 MiB = 1024 · 1024 = 1.048.576 Byte – nicht 1.000.000!' }; },
    () => { const tb = wahl([1, 2, 4, 8, 12]); return { titel: 'TB vs. TiB', frage: `Hersteller: „${tb} TB“. Wie viele <b>TiB</b> zeigt Windows an? (2 Nachkommastellen)`, antwort: Math.round(tb * 1e12 / 1024 ** 4 * 100) / 100, tol: 0.011, einheit: 'TiB', falle: 'Hersteller rechnen dezimal (10¹²), Windows binär (2⁴⁰) – deshalb „fehlen“ scheinbar ca. 9 %.' }; },
    () => { const mb = wahl([100, 250, 500, 800]), r = wahl([16, 25, 50, 100]); return { titel: 'Mbit vs. MB', frage: `Download von ${mb} MB bei ${r} Mbit/s – wie viele <b>Sekunden</b>?`, antwort: mb * 8 / r, tol: 0.05, einheit: 's', falle: 'Byte ≠ Bit: Datenmenge mal 8! Raten sind in Bit/s angegeben.' }; },
    () => { const n = rnd(5, 60) * 100, br = n * 1.19; return { titel: 'Brutto/Netto', frage: `Eine Rechnung beträgt ${eur2(br)} <b>brutto</b> inkl. 19 % USt. Wie hoch ist der Nettobetrag?`, antwort: n, tol: 0.011, einheit: '€', falle: 'Netto = Brutto / 1,19 – NICHT Brutto − 19 % (das ergibt zu wenig).' }; },
    () => { const n = rnd(5, 60) * 100, br = n * 1.19; return { titel: 'USt herausrechnen', frage: `Wie viel <b>Umsatzsteuer</b> steckt in ${eur2(br)} brutto (19 %)?`, antwort: Math.round((br - n) * 100) / 100, tol: 0.011, einheit: '€', falle: 'USt = Brutto / 1,19 · 0,19 – nicht Brutto · 0,19.' }; },
    () => { const bvp = rnd(4, 40) * 97 / 1, s = 3; return { titel: 'Skonto im Hundert', frage: `Barverkaufspreis ${eur2(bvp)}. Dem Kunden werden 3 % Skonto gewährt. Wie hoch muss der <b>Zielverkaufspreis</b> sein?`, antwort: Math.round(bvp / 0.97 * 100) / 100, tol: 0.011, einheit: '€', falle: 'Beim Verkauf im Hundert rechnen: BVP / 0,97 – nicht BVP · 1,03.' }; },
    () => { const g = wahl([4, 6, 8]), k = wahl([2, 3]); return { titel: 'RAID 5 gemischt', frage: `RAID 5 aus 3 × ${g} TB und 1 × ${k} TB. <b>Nutzkapazität</b> in TB?`, antwort: 3 * k, einheit: 'TB', falle: 'Die kleinste Platte bestimmt alle: (n − 1) · kleinste Platte.' }; },
    () => { const p = rnd(3, 15) * 100, c = wahl([0.6, 0.75, 0.8]); return { titel: 'Watt vs. VA', frage: `Last ${p} W, cos φ = ${f(c)}. Mindestgröße der USV in <b>VA</b>? (ganze Zahl)`, antwort: Math.round(p / c), tol: 1, einheit: 'VA', falle: 'USV-Leistung wird in VA angegeben: S = P / cos φ – die VA-Zahl ist größer als die Watt-Zahl.' }; },
    () => { const p = rnd(22, 30); return { titel: 'Hosts zählen', frage: `Wie viele <b>nutzbare Hosts</b> hat ein /${p}-Netz?`, antwort: 2 ** (32 - p) - 2, falle: 'Netzadresse und Broadcast abziehen: 2ⁿ − 2.', subnetz: true }; },
    () => { const w = rnd(2, 9) * 50, pr = wahl([0.3, 0.32, 0.35]); return { titel: 'Watt vs. kWh', frage: `Ein Server mit ${w} W läuft ein Jahr durch (365 Tage, 24 h). Kosten bei ${f(pr)} €/kWh?`, antwort: Math.round(w * 8760 / 1000 * pr * 100) / 100, tol: 0.011, einheit: '€', falle: 'Watt in Kilowatt umrechnen (/1000) und mit Stunden multiplizieren: 365 · 24 = 8760 h.' }; },
    () => { const [x, y] = wahl([[1920, 1080], [1280, 1024], [2560, 1440]]), t = 24; return { titel: 'Bit vs. Byte bei Bildern', frage: `Bild ${x} × ${y}, ${t} Bit Farbtiefe, unkomprimiert. Größe in <b>MiB</b>? (2 Nachkommastellen)`, antwort: Math.round(x * y * 3 / 1048576 * 100) / 100, tol: 0.011, einheit: 'MiB', falle: '24 Bit = 3 Byte pro Pixel. Durch 8 teilen nicht vergessen, dann durch 1.048.576.' }; },
    () => { const v = wahl([99, 99.5, 99.9, 99.99]); return { titel: 'Verfügbarkeit', frage: `Verfügbarkeit ${f(v)} % – wie viele <b>Stunden</b> Ausfall sind pro Jahr erlaubt? (2 Nachkommastellen)`, antwort: Math.round((100 - v) / 100 * 8760 * 100) / 100, tol: 0.011, einheit: 'h', falle: 'Mit der Nicht-Verfügbarkeit (100 − x) rechnen und 8760 h/Jahr verwenden.' }; },
    () => { const kib = wahl([256, 512, 1024]), r = 64; return { titel: 'kbit dezimal', frage: `${kib} KiB über eine 64-kbit/s-Leitung. Wie viele <b>Sekunden</b>? (2 Nachkommastellen)`, antwort: Math.round(kib * 1024 * 8 / 64000 * 100) / 100, tol: 0.011, einheit: 's', falle: 'KiB ist binär (1024 Byte), kbit/s ist dezimal (1000 bit/s) – beides sauber umrechnen.' }; },
    () => { const lep = rnd(4, 30) * 100, r = wahl([10, 15, 20]), s = 2; return { titel: 'Rabatt vor Skonto', frage: `LEP ${eur2(lep)}, ${r} % Rabatt, danach 2 % Skonto. <b>Bareinkaufspreis</b>?`, antwort: Math.round(lep * (1 - r / 100) * 0.98 * 100) / 100, tol: 0.011, einheit: '€', falle: 'Nacheinander rechnen: Skonto vom Zieleinkaufspreis, nicht (r + s) % vom LEP.' }; },
    () => { const n = wahl([3, 5, 7, 12, 20]); let b = 0; while (2 ** b < n) b++; return { titel: 'Subnetzbits', frage: `Ein Netz soll in mindestens ${n} gleich große Subnetze geteilt werden. Wie viele Bits müssen geliehen werden?`, antwort: b, falle: '2ⁿ ≥ Anzahl Subnetze – aufrunden auf die nächste Zweierpotenz.', subnetz: true }; }
  ];
  function dojo() {
    krumen([START, { txt: 'Werkzeuge', go: 'werkzeuge' }, { txt: 'IHK-Fallen-Dojo' }]);
    const d = S.p.dojo;
    $('#inhalt').innerHTML = `<h1>🥋 IHK-Fallen-Dojo</h1><p class="unter">Die Klassiker, bei denen in der Prüfung Punkte verloren gehen: KiB vs. KB, Brutto/Netto, Mbit vs. MB, im/vom Hundert, W vs. VA … ${d.r} geknackt · ${d.f} reingefallen.</p><div id="dojo-feld"></div>`;
    runde();
  }
  function runde() {
    const a = wahl(FALLEN)(), feld = $('#dojo-feld'); let fertig = false;
    feld.innerHTML = `<div class="glas dojo-karte"><span class="art-chip">${E(a.titel)}</span><p class="z-text">${a.frage}</p>
      <div class="r-eingabe"><label class="r-feld"><span>Antwort${a.einheit ? ' (' + E(a.einheit) + ')' : ''}</span><input id="dj-ein" autocomplete="off" inputmode="decimal"></label><button class="glas knopf primär" id="dj-ok" style="align-self:flex-end">Prüfen (Enter)</button></div><div id="dj-erg"></div></div>`;
    const ein = $('#dj-ein'); ein.focus();
    const ok = () => {
      if (fertig) return runde();
      if (!ein.value.trim()) return;
      fertig = true; const r = stimmt(ein.value, a);
      r ? S.p.dojo.r++ : S.p.dojo.f++; speichern(); ton(r ? 'gut' : 'schlecht');
      if (r) { melde('dojo', 1); if (a.subnetz) melde('subnetz', 1); }
      ein.classList.add(r ? 'ok' : 'nein');
      $('#dj-erg').innerHTML = `<p class="${r ? 'fb-ok' : 'fb-nein'}">${r ? 'Falle umgangen! ✓' : 'Reingefallen.'} Lösung: <b>${E(antwortTxt(a))}</b></p><div class="falle-box"><b>Die Falle:</b> ${a.falle}</div>`;
      $('#dj-ok').textContent = 'Nächste Falle (Enter)';
    };
    $('#dj-ok').onclick = ok; ein.onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); ok(); } };
  }

  window.VIEWS = Object.assign(window.VIEWS || {}, { rechner: ansicht, dojo });
  return { TABS, netzplan, kalkulation, stimmt, FALLEN, zahlDe };
})();
window.Rechner = Rechner;
