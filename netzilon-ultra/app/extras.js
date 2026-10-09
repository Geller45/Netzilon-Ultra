// Netzilon Ultra – Extras: Glossar, Cheat-Sheets (druckbar), Spickzettel-Modus, Druck/PDF-Export, Tagesspruch
const Extras = (() => {
  const SPRUECHE = [
    'Jede Karteikarte ist ein kleiner Schritt zur bestandenen Prüfung.', 'Wer den Rechenweg aufschreibt, bekommt auch Teilpunkte.', 'Lieber 20 Minuten täglich als 5 Stunden vor der Prüfung.',
    'Ping geht nicht? Erst Kabel, dann Schicht 3, dann Firewall.', 'Aus Fehlern lernt der Admin – und das Backup rettet den Rest.', 'Netzwerk ist wie Straßenverkehr: Adresse, Weg, Regeln.',
    'Heute Subnetting, morgen Domain Admin.', 'Lies die Aufgabe zweimal – die IHK versteckt die Falle im letzten Satz.', 'Wiederholung schlägt Talent.', 'Ein sauberes Lab heute spart eine Panik morgen.'
  ];
  function spruchHtml() {
    const d = new Date(), i = (d.getFullYear() * 400 + d.getMonth() * 31 + d.getDate()) % SPRUECHE.length;
    return `<p class="tagesspruch">„${E(SPRUECHE[i])}“</p>`;
  }
  function drucken() {
    document.querySelectorAll('#inhalt details').forEach(d => d.open = true);
    document.body.classList.add('drucken');
    setTimeout(() => { try { window.print(); } catch { toast('Drucken ist hier nicht möglich.'); } setTimeout(() => document.body.classList.remove('drucken'), 500); }, 80);
  }
  const druckKnopf = () => `<button class="glas knopf" id="x-druck" title="Als PDF speichern oder drucken">🖨 Drucken / PDF</button>`;
  const druckBinden = () => { const b = document.getElementById('x-druck'); if (b) b.onclick = drucken; };

  // ---------- Glossar ----------
  let glossarCache = null;
  function glossarDaten() {
    if (glossarCache && glossarCache.n === S.docs.length) return glossarCache.l;
    const map = new Map();
    const kuerzen = (t, n = 240) => { t = String(t || '').replace(/\s+/g, ' ').trim(); if (t.length <= n) return t; const s = t.slice(0, n); const p = Math.max(s.lastIndexOf('. '), s.lastIndexOf('; ')); return (p > 80 ? s.slice(0, p + 1) : s.replace(/\s\S*$/, '') + ' …'); };
    for (const d of S.docs) {
      if (d.typ === 'fragen') continue;
      for (const c of d.cards || []) {
        const m = String(c.f || '').match(/^(?:Was (?:ist|sind|bedeutet|bedeuten|versteht man unter|macht)(?: ein| eine| der| die| das)?|Wofür steht|Wofür wird)\s+(.{2,40}?)\s*\??$/i);
        const ant = c.a;
        if (m && ant && !map.has(m[1].toLowerCase())) map.set(m[1].toLowerCase(), { begriff: m[1].replace(/\?$/, ''), text: kuerzen(ant), d });
      }
    }
    for (const d of S.docs) {
      if (d.typ === 'fragen' || d.typ === 'uebung') continue;
      const key = d.titel.toLowerCase();
      if (map.has(key) || d.titel.length > 50) continue;
      const roh = (d.sections && (d.sections['Einfach'] || d.sections['Profi'])) || '';
      const t = roh.replace(/```[\s\S]*?```/g, '').replace(/^#+.*$/gm, '').replace(/[|*_`>#-]+/g, ' ').trim();
      if (t.length > 40) map.set(key, { begriff: d.titel, text: kuerzen(t), d });
    }
    const l = [...map.values()].sort((a, b) => a.begriff.localeCompare(b.begriff, 'de'));
    glossarCache = { n: S.docs.length, l };
    return l;
  }
  function glossar() {
    krumen([START, { txt: 'Glossar' }]);
    const l = glossarDaten();
    $('#inhalt').innerHTML = `<h1>Glossar</h1><p class="unter">${l.length} Fachbegriffe aus allen Themen – automatisch aus Karteikarten und Themenseiten.</p>
      <div class="such-zeile"><input id="g-suche" class="suchfeld" placeholder="Begriff filtern …" autocomplete="off"> ${druckKnopf()}</div>
      <div class="abc" id="g-abc"></div><div id="g-liste"></div>`;
    druckBinden();
    const render = () => {
      const q = $('#g-suche').value.trim().toLowerCase(), f = l.filter(e => !q || e.begriff.toLowerCase().includes(q) || e.text.toLowerCase().includes(q));
      const buchst = [...new Set(f.map(e => e.begriff[0].toUpperCase()))];
      $('#g-abc').innerHTML = buchst.map(b => `<a href="#g-${b}" class="abc-b" data-b="${b}">${b}</a>`).join('');
      let last = '';
      $('#g-liste').innerHTML = f.slice(0, 600).map(e => { const b = e.begriff[0].toUpperCase(); const kopf = b !== last ? `<h2 id="g-${b}" class="glossar-b">${b}</h2>` : ''; last = b;
        return `${kopf}<div class="glossar-eintrag"><b>${E(e.begriff)}</b> – ${E(e.text)} <a class="verweis" data-go="lesen" data-param="${E(e.d.id)}">→ ${E(e.d.titel)}</a></div>`; }).join('') || '<p class="leer">Nichts gefunden.</p>';
      document.querySelectorAll('.abc-b').forEach(a => a.onclick = ev => { ev.preventDefault(); const t = document.getElementById('g-' + a.dataset.b); if (t) t.scrollIntoView({ behavior: 'smooth' }); });
    };
    $('#g-suche').oninput = render; render();
  }

  // ---------- Cheat-Sheets ----------
  const SHEETS = [
    { id: 'ports', titel: 'Wichtige Ports', html: () => tabelle(['Port', 'Protokoll', 'Dienst'], [[20 + '/' + 21, 'TCP', 'FTP (Daten/Steuerung)'], [22, 'TCP', 'SSH, SFTP'], [23, 'TCP', 'Telnet (unsicher)'], [25, 'TCP', 'SMTP'], [53, 'UDP/TCP', 'DNS'], ['67/68', 'UDP', 'DHCP (Server/Client)'], [69, 'UDP', 'TFTP'], [80, 'TCP', 'HTTP'], [88, 'TCP/UDP', 'Kerberos'], [110, 'TCP', 'POP3'], [123, 'UDP', 'NTP'], [135, 'TCP', 'RPC'], [137 + '-139', 'TCP/UDP', 'NetBIOS'], [143, 'TCP', 'IMAP'], [161 + '/162', 'UDP', 'SNMP'], [389, 'TCP/UDP', 'LDAP'], [443, 'TCP', 'HTTPS'], [445, 'TCP', 'SMB'], [465 + '/587', 'TCP', 'SMTPS / Submission'], [636, 'TCP', 'LDAPS'], [993, 'TCP', 'IMAPS'], [995, 'TCP', 'POP3S'], [1433, 'TCP', 'MS SQL'], [3306, 'TCP', 'MySQL/MariaDB'], [3389, 'TCP', 'RDP'], [5985 + '/5986', 'TCP', 'WinRM (HTTP/HTTPS)']]) },
    { id: 'subnet', titel: 'Subnetting-Tabelle', html: () => tabelle(['Präfix', 'Maske', 'Adressen', 'Hosts'], [24, 25, 26, 27, 28, 29, 30, 23, 22, 21, 20, 16, 8].map(p => { const m = (0xFFFFFFFF << (32 - p)) >>> 0, a = Math.pow(2, 32 - p); return ['/' + p, [24, 16, 8, 0].map(s => (m >>> s) & 255).join('.'), a, Math.max(0, a - 2)]; })) + '<p>Hosts = 2<sup>Hostbits</sup> − 2 · Netzadresse = IP UND Maske · Broadcast = Netz + alle Hostbits 1</p>' },
    { id: 'zahlen', titel: 'Zahlensysteme & Einheiten', html: () => tabelle(['Dezimal', 'Binär', 'Hex'], Array.from({ length: 16 }, (_, i) => [i, i.toString(2).padStart(4, '0'), i.toString(16).toUpperCase()])) + tabelle(['Einheit', 'Wert'], [['1 KiB', '1 024 Byte'], ['1 MiB', '1 024 KiB'], ['1 GiB', '1 024 MiB'], ['1 kB', '1 000 Byte'], ['1 MB', '1 000 kB'], ['1 Byte', '8 Bit'], ['Übertragung', 'Dateigröße (Bit) ÷ Rate (Bit/s) = Zeit (s)']]) },
    { id: 'raid', titel: 'RAID-Level', html: () => tabelle(['Level', 'Mindest-Platten', 'Nutzkapazität', 'Ausfallsicherheit'], [['RAID 0', 2, 'n × C', 'keine'], ['RAID 1', 2, 'C', '1 Platte'], ['RAID 5', 3, '(n−1) × C', '1 Platte'], ['RAID 6', 4, '(n−2) × C', '2 Platten'], ['RAID 10', 4, 'n/2 × C', '1 je Spiegel']]) },
    { id: 'formeln', titel: 'IHK-Formeln', html: () => tabelle(['Thema', 'Formel'], [['Verfügbarkeit', '(Betriebszeit − Ausfallzeit) ÷ Betriebszeit × 100 %'], ['Brutto', 'Netto × 1,19 (19 % USt)'], ['Netto aus Brutto', 'Brutto ÷ 1,19'], ['Break-even', 'Fixkosten ÷ (Preis − variable Stückkosten)'], ['Amortisation', 'Investition ÷ jährliche Einsparung'], ['Stromkosten', 'kW × Stunden × Preis je kWh'], ['USV-Last', 'Scheinleistung VA = W ÷ Leistungsfaktor'], ['Nutzwert', 'Σ (Gewicht × Punkte)'], ['Skonto', 'Rechnung × (1 − Skontosatz)']]) },
    { id: 'osi', titel: 'OSI & TCP/IP', html: () => tabelle(['Schicht', 'OSI-Name', 'Beispiele'], [[7, 'Anwendung', 'HTTP, DNS, DHCP, SMTP'], [6, 'Darstellung', 'TLS, Kodierung'], [5, 'Sitzung', 'RPC, NetBIOS'], [4, 'Transport', 'TCP, UDP'], [3, 'Vermittlung', 'IP, ICMP, Router'], [2, 'Sicherung', 'Ethernet, Switch, MAC, VLAN'], [1, 'Bitübertragung', 'Kabel, Hub, Funk']]) + '<p>Merksatz: <b>A</b>lle <b>D</b>eutschen <b>S</b>ind <b>T</b>reue <b>V</b>erbraucher <b>S</b>üßer <b>B</b>onbons (7→1)</p>' },
    { id: 'befehle', titel: 'Befehle aus allen Themen', html: () => { const a = []; for (const d of S.docs) for (const b of d.befehle) a.push([`<code>${E(b.befehl)}</code>`, Parser.inline(b.text), E(d.titel)]); return a.length ? tabelle(['Befehl', 'Erklärung', 'Thema'], a.slice(0, 400), true) + (a.length > 400 ? `<p>… weitere ${a.length - 400} in der Befehlsreferenz.</p>` : '') : '<p>Keine Befehle gefunden.</p>'; } }
  ];
  function tabelle(kopf, zeilen, roh) {
    return `<div class="tablewrap"><table><thead><tr>${kopf.map(k => `<th>${k}</th>`).join('')}</tr></thead><tbody>${zeilen.map(r => `<tr>${r.map(c => `<td>${roh ? c : E(String(c))}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  }
  function cheatsheets(id) {
    krumen([START, { txt: 'Cheat-Sheets' }]);
    const sel = SHEETS.find(s => s.id === id);
    $('#inhalt').innerHTML = `<h1>Cheat-Sheets</h1><p class="unter">Eine Seite pro Thema, druckfertig (Drucken → „Als PDF speichern“).</p>
      <div class="term-tabs">${SHEETS.map(s => `<button class="glas knopf ${sel && sel.id === s.id ? 'primär' : ''}" data-go="cheatsheets" data-param="${s.id}">${E(s.titel)}</button>`).join('')}<button class="glas knopf ${!sel ? 'primär' : ''}" data-go="cheatsheets">Alle</button></div>
      <div class="actions">${druckKnopf()}</div>
      ${(sel ? [sel] : SHEETS.filter(s => s.id !== 'befehle')).map(s => `<section class="cheat"><h2>${E(s.titel)}</h2>${s.html()}</section>`).join('')}`;
    druckBinden();
  }

  // ---------- Spickzettel-Modus ----------
  function spickzettel(tag) {
    krumen([START, { txt: 'Spickzettel' }]);
    const tags = ['AP1', 'AP2', 'WiSo', 'LPIC-1', 'CCNA', 'AZ-800', 'AZ-801', 'DP-203', 'Schule'];
    tag = tag || S.p.spickTag || 'AP1';
    S.p.spickTag = tag;
    const docs = S.docs.filter(d => d.spickzettel.length && passtZuTag(d, tag));
    $('#inhalt').innerHTML = `<h1>Spickzettel-Modus</h1><p class="unter">Kurzform fürs Lernen am Prüfungstag: je Thema die wichtigsten Zeilen. Zum Mitnehmen lernen – nicht zum Mogeln.</p>
      <div class="term-tabs">${tags.map(t => `<button class="glas knopf ${t === tag ? 'primär' : ''}" data-go="spickzettel" data-param="${t}">${t}</button>`).join('')}</div>
      <div class="actions">${druckKnopf()}<span class="unter">${docs.length} Themen</span></div>
      <div class="spick-raster">${docs.length ? docs.map(d => `<div class="spick glas"><h3><a class="verweis" data-go="lesen" data-param="${E(d.id)}">${E(d.titel)}</a></h3><ul>${d.spickzettel.map(z => `<li>${Parser.inline(z)}</li>`).join('')}</ul></div>`).join('') : `<p class="leer">Für ${E(tag)} gibt es noch keine Spickzettel-Abschnitte. Alternativ: die Merksätze der Themen.</p>`}</div>
      ${docs.length ? '' : `<div class="spick-raster">${S.docs.filter(d => d.sections && d.sections['Merksatz'] && passtZuTag(d, tag)).slice(0, 60).map(d => `<div class="spick glas"><h3>${E(d.titel)}</h3>${Parser.md(d.sections['Merksatz'])}</div>`).join('')}</div>`}`;
    druckBinden(); speichern();
  }
  window.VIEWS = Object.assign(window.VIEWS || {}, { glossar, cheatsheets, spickzettel });
  return { spruchHtml, drucken, glossarDaten, SHEETS };
})();
window.Extras = Extras;
