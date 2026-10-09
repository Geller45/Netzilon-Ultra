// Netzilon Ultra 2.3.0 – SQL-Kern: Firmen-Datenbank „Netzilon GmbH“ (deterministischer Generator) + sql.js-Lader
//
// ===================================== API =====================================
// window.FirmaDB = {
//   SEED                       Standard-Seed (Zahl). Gleicher Seed → identische Daten/identisches SQL.
//   daten(seed?)               → { standorte, abteilungen, mitarbeiter, kunden, projekte, projekt_mitarbeiter,
//                                  artikel, bestellungen, bestellpositionen, zeiterfassung }
//                                Arrays reiner JS-Objekte, Schlüssel = Spaltennamen des Schemas, NULL = null.
//                                Gecacht je Seed – NICHT verändern (bei Bedarf kopieren).
//   mitarbeiter(seed?)         → Array (Kopien) der Mitarbeiter mit Zusatzfeldern:
//                                abteilung (Name|null), kuerzel (|null), stadt (Standort der Abteilung bzw. Zentrale),
//                                aktiv (Boolean: kein austritt), vorgesetzter (benutzername|null)  – für Paket 4 (AD-Benutzer)
//   schemaSql()                → String: CREATE TABLE … (exakt das Schema, keine Indizes)
//   datenSql(seed?)            → String: INSERT-Statements (in BEGIN/COMMIT; abteilungen.leiter_id per UPDATE nach
//                                den Mitarbeitern, damit alles mit PRAGMA foreign_keys=ON fehlerfrei läuft). Gecacht.
//   TABELLEN                   → [{ name, spalten:[{ name, typ, pk, fk:'tabelle.spalte'|null, notNull }] }] (ER-Diagramm)
// };
// window.SqlKern = {
//   laden()                    → Promise<SQL> (einmalig, gecacht). WASM aus window.NZ_SQL_WASM_B64
//                                (initSqlJs({ wasmBinary })); bei Fehler Fallback asm.js aus window.NZ_SQL_ASM_GZ
//                                (DecompressionStream('gzip') → Blob-URL-<script> → initSqlJs). Bei Fehlschlag
//                                Reject mit verständlicher Meldung; ein späterer Aufruf versucht es erneut.
//   modus()                    → 'wasm' | 'asm' | null (noch nicht geladen)
//   neueDb(seed?)              → Promise<Database>: frische DB mit Schema + Daten, PRAGMA foreign_keys=ON
//   ausBase64(b64)             → Promise<Database> (PRAGMA foreign_keys=ON; Reject, wenn keine gültige SQLite-Datei)
//   nachBase64(db)             → String (base64 der DB-Datei; blockweise, ohne Stack-Overflow).
//                                Hinweis: db.export() öffnet die Verbindung neu – foreign_keys wird danach wieder AN gesetzt.
//   ausfuehren(db, sql)        → { ok, ergebnisse:[{columns, values}], geaendert:Number, fehler?:String, ms:Number }
//                                mehrere Statements erlaubt; wirft nie. geaendert = Summe geänderter Zeilen
//                                (total_changes()-Differenz, Fallback db.getRowsModified()).
//   vergleiche(a, b, { reihenfolge:false }) → Boolean
//                                a/b: ausfuehren()-Ergebnis, ergebnisse-Array (letzte Ergebnismenge zählt) oder
//                                {columns, values}. Vergleicht Spaltenanzahl, Zeilenanzahl und Werte: Zahlen ±0.005,
//                                Zahl vs. numerischer Text tolerant, NULL nur gleich NULL. Ohne reihenfolge:true werden
//                                die Zeilen vor dem Vergleich sortiert. Spaltennamen werden nicht verglichen.
//   _erzwingeAsm               Testhook: vor laden() auf true setzen → WASM wird übersprungen (Fallback-Test).
// };
// ================================================================================

const FirmaDB = (() => {
  const SEED = 2301;
  const VON = '2025-01-01', BIS = '2026-03-31';

  const SCHEMA = [
    "CREATE TABLE standorte (standort_id INTEGER PRIMARY KEY, stadt TEXT NOT NULL, plz TEXT, strasse TEXT, land TEXT DEFAULT 'DE');",
    'CREATE TABLE abteilungen (abt_id INTEGER PRIMARY KEY, name TEXT NOT NULL UNIQUE, kuerzel TEXT, standort_id INTEGER REFERENCES standorte(standort_id), leiter_id INTEGER REFERENCES mitarbeiter(ma_id), budget REAL);',
    'CREATE TABLE mitarbeiter (ma_id INTEGER PRIMARY KEY, personalnr TEXT UNIQUE, vorname TEXT NOT NULL, nachname TEXT NOT NULL, benutzername TEXT UNIQUE, email TEXT UNIQUE, telefon TEXT, geburtsdatum TEXT, eintritt TEXT NOT NULL, austritt TEXT, abt_id INTEGER REFERENCES abteilungen(abt_id), vorgesetzter_id INTEGER REFERENCES mitarbeiter(ma_id), position TEXT, gehalt REAL CHECK (gehalt > 0), wochenstunden REAL DEFAULT 40, azubi INTEGER DEFAULT 0);',
    'CREATE TABLE kunden (kunde_id INTEGER PRIMARY KEY, firma TEXT NOT NULL, branche TEXT, stadt TEXT, plz TEXT, ansprechpartner TEXT, email TEXT, seit TEXT);',
    "CREATE TABLE projekte (projekt_id INTEGER PRIMARY KEY, name TEXT NOT NULL, kunde_id INTEGER REFERENCES kunden(kunde_id), leiter_id INTEGER REFERENCES mitarbeiter(ma_id), start TEXT, ende TEXT, budget REAL, status TEXT CHECK (status IN ('geplant','aktiv','abgeschlossen','gestoppt')));",
    'CREATE TABLE projekt_mitarbeiter (projekt_id INTEGER REFERENCES projekte(projekt_id), ma_id INTEGER REFERENCES mitarbeiter(ma_id), rolle TEXT, stunden_geplant REAL, PRIMARY KEY (projekt_id, ma_id));',
    'CREATE TABLE artikel (artikel_id INTEGER PRIMARY KEY, bezeichnung TEXT NOT NULL, kategorie TEXT, einkaufspreis REAL, verkaufspreis REAL, lagerbestand INTEGER DEFAULT 0);',
    "CREATE TABLE bestellungen (best_id INTEGER PRIMARY KEY, kunde_id INTEGER NOT NULL REFERENCES kunden(kunde_id), ma_id INTEGER REFERENCES mitarbeiter(ma_id), datum TEXT NOT NULL, status TEXT CHECK (status IN ('offen','versendet','bezahlt','storniert')));",
    'CREATE TABLE bestellpositionen (best_id INTEGER REFERENCES bestellungen(best_id), pos INTEGER, artikel_id INTEGER REFERENCES artikel(artikel_id), menge INTEGER CHECK (menge > 0), einzelpreis REAL, PRIMARY KEY (best_id, pos));',
    'CREATE TABLE zeiterfassung (eintrag_id INTEGER PRIMARY KEY, ma_id INTEGER NOT NULL REFERENCES mitarbeiter(ma_id), projekt_id INTEGER REFERENCES projekte(projekt_id), datum TEXT NOT NULL, stunden REAL CHECK (stunden > 0 AND stunden <= 12), taetigkeit TEXT);'
  ];
  const schemaSql = () => SCHEMA.join('\n') + '\n';

  // ---------- TABELLEN (aus dem Schema abgeleitet) ----------
  function teileSpalten(innen) {
    const teile = []; let tiefe = 0, akt = '';
    for (const c of innen) {
      if (c === '(') tiefe++; else if (c === ')') tiefe--;
      if (c === ',' && tiefe === 0) { teile.push(akt.trim()); akt = ''; } else akt += c;
    }
    if (akt.trim()) teile.push(akt.trim());
    return teile;
  }
  const TABELLEN = SCHEMA.map(st => {
    const m = st.match(/^CREATE TABLE (\w+) \(([\s\S]*)\);$/);
    const spalten = [], pkListe = [];
    for (const teil of teileSpalten(m[2])) {
      const pk = teil.match(/^PRIMARY KEY \(([^)]+)\)/);
      if (pk) { pkListe.push(...pk[1].split(',').map(s => s.trim())); continue; }
      const [name, typ] = teil.split(/\s+/);
      const fk = teil.match(/REFERENCES (\w+)\((\w+)\)/);
      const istPk = /PRIMARY KEY/.test(teil);
      spalten.push({ name, typ, pk: istPk, fk: fk ? fk[1] + '.' + fk[2] : null, notNull: /NOT NULL/.test(teil) || istPk });
    }
    for (const s of spalten) if (pkListe.includes(s.name)) s.pk = true;
    return { name: m[1], spalten };
  });

  // ---------- Hilfen ----------
  function seedZahl(s) {
    if (s === undefined || s === null || s === '') return SEED;
    if (typeof s === 'number' && isFinite(s)) return Math.floor(Math.abs(s)) >>> 0;
    let h = 2166136261;
    for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function mulberry32(seed) {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6D2B79F5) >>> 0; let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const r2 = x => Math.round(x * 100) / 100;
  const TAG = 86400000;
  const ms = s => Date.UTC(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10));
  const iso = t => new Date(t).toISOString().slice(0, 10);
  const minD = (a, b) => (a < b ? a : b), maxD = (a, b) => (a > b ? a : b);
  const FEIERTAGE = new Set(['2025-01-01', '2025-04-18', '2025-04-21', '2025-05-01', '2025-05-29', '2025-06-09', '2025-10-03', '2025-12-25', '2025-12-26', '2026-01-01']);
  const WERKTAGE = (() => {
    const w = [];
    for (let t = ms(VON); t <= ms(BIS); t += TAG) {
      const d = new Date(t).getUTCDay(), s = iso(t);
      if (d !== 0 && d !== 6 && !FEIERTAGE.has(s)) w.push(s);
    }
    return w;
  })();
  const werktageIn = (a, b) => WERKTAGE.filter(d => d >= a && d <= b);

  function ascii(s) {
    return s.toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
      .normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9.-]/g, '');
  }
  function benutzername(vor, nach, vergeben) {
    const basis = ascii(vor) + '.' + ascii(nach);
    const kurz = (s, n) => s.slice(0, n).replace(/[.-]+$/, '');
    let name = kurz(basis, 20), i = 2;
    while (vergeben.has(name)) { const z = String(i++); name = kurz(basis, 20 - z.length) + z; }
    vergeben.add(name);
    return name;
  }

  // ---------- Stammdaten (fest) ----------
  const STANDORTE = [
    ['Hamburg', '20457', 'Hafenstraße 12', '040'], ['Berlin', '10179', 'Lindenweg 4', '030'], ['Köln', '50667', 'Rheinuferstraße 21', '0221'],
    ['München', '80331', 'Isarring 33', '089'], ['Leipzig', '04109', 'Auenweg 5', '0341'], ['Frankfurt am Main', '60311', 'Messeallee 17', '069']
  ];
  // Positionen: [männlich, weiblich, Gehalt min, Gehalt max] – Monatsgehalt brutto in €
  const POS = {
    gf: ['Geschäftsführer', 'Geschäftsführerin', 9000, 9500],
    assist: ['Assistent der Geschäftsführung', 'Assistentin der Geschäftsführung', 3300, 3900],
    dsb: ['Datenschutzbeauftragter (Stabsstelle)', 'Datenschutzbeauftragte (Stabsstelle)', 4600, 5600],
    qmb: ['Qualitätsmanagementbeauftragter (Stabsstelle)', 'Qualitätsmanagementbeauftragte (Stabsstelle)', 4200, 5200],
    lItb: ['Leiter IT-Betrieb', 'Leiterin IT-Betrieb', 6400, 7600],
    sysS: ['Senior Systemadministrator', 'Senior Systemadministratorin', 5200, 6300],
    sys: ['Systemadministrator', 'Systemadministratorin', 3900, 5100],
    fisi: ['Fachinformatiker Systemintegration', 'Fachinformatikerin Systemintegration', 3200, 4100],
    cloud: ['Cloud-Administrator', 'Cloud-Administratorin', 4500, 5800],
    lIts: ['Leiter IT-Support', 'Leiterin IT-Support', 5800, 6900],
    sup2: ['IT-Support-Spezialist (2nd Level)', 'IT-Support-Spezialistin (2nd Level)', 3500, 4300],
    sup1: ['IT-Support-Mitarbeiter (1st Level)', 'IT-Support-Mitarbeiterin (1st Level)', 2850, 3400],
    lNws: ['Leiter Netzwerk & Sicherheit', 'Leiterin Netzwerk & Sicherheit', 6600, 7800],
    netz: ['Netzwerkadministrator', 'Netzwerkadministratorin', 4100, 5300],
    netzT: ['Netzwerktechniker', 'Netzwerktechnikerin', 3400, 4300],
    sec: ['IT-Sicherheitsspezialist', 'IT-Sicherheitsspezialistin', 4800, 6200],
    isb: ['Informationssicherheitsbeauftragter', 'Informationssicherheitsbeauftragte', 5200, 6400],
    lSwe: ['Leiter Softwareentwicklung', 'Leiterin Softwareentwicklung', 6800, 7900],
    devS: ['Senior Softwareentwickler', 'Senior Softwareentwicklerin', 5300, 6600],
    dev: ['Softwareentwickler', 'Softwareentwicklerin', 4000, 5400],
    fiae: ['Fachinformatiker Anwendungsentwicklung', 'Fachinformatikerin Anwendungsentwicklung', 3400, 4300],
    devops: ['DevOps-Engineer', 'DevOps-Engineer', 4800, 6200],
    test: ['Softwaretester', 'Softwaretesterin', 3500, 4500],
    lVt: ['Vertriebsleiter', 'Vertriebsleiterin', 6500, 8200],
    kam: ['Key-Account-Manager', 'Key-Account-Managerin', 4600, 6100],
    vt: ['Vertriebsmitarbeiter', 'Vertriebsmitarbeiterin', 3300, 4600],
    vtI: ['Mitarbeiter Vertriebsinnendienst', 'Mitarbeiterin Vertriebsinnendienst', 2900, 3500],
    lEk: ['Leiter Einkauf', 'Leiterin Einkauf', 5600, 6600],
    ek: ['Einkäufer', 'Einkäuferin', 3300, 4400],
    ekS: ['Sachbearbeiter Einkauf', 'Sachbearbeiterin Einkauf', 2900, 3500],
    lBh: ['Leiter Buchhaltung', 'Leiterin Buchhaltung', 5700, 6800],
    fibu: ['Finanzbuchhalter', 'Finanzbuchhalterin', 3600, 4500],
    bh: ['Buchhalter', 'Buchhalterin', 3100, 3900],
    lohn: ['Lohnbuchhalter', 'Lohnbuchhalterin', 3400, 4200],
    lPe: ['Personalleiter', 'Personalleiterin', 5900, 7000],
    pref: ['Personalreferent', 'Personalreferentin', 3700, 4700],
    peS: ['Sachbearbeiter Personal', 'Sachbearbeiterin Personal', 2900, 3500],
    lAus: ['Ausbildungsleiter', 'Ausbildungsleiterin', 5400, 6400],
    ausb: ['Ausbilder IT', 'Ausbilderin IT', 4300, 5100],
    azFisi: ['Auszubildender FiSi', 'Auszubildende FiSi', 0, 0],
    azFiae: ['Auszubildender FIAE', 'Auszubildende FIAE', 0, 0]
  };
  // [Name, Kürzel, Standort-Nr, Budget (Jahr), Leiter-Position, [[Position, Anzahl], …]]
  const ABTEILUNGEN = [
    ['Geschäftsführung', 'GF', 1, 450000, 'gf', [['assist', 1]]],
    ['IT-Betrieb', 'ITB', 1, 1250000, 'lItb', [['sysS', 2], ['sys', 5], ['fisi', 4], ['cloud', 2]]],
    ['IT-Support', 'ITS', 2, 820000, 'lIts', [['sup2', 4], ['sup1', 6], ['fisi', 3]]],
    ['Netzwerk & Sicherheit', 'NWS', 1, 980000, 'lNws', [['netz', 4], ['netzT', 2], ['sec', 2], ['isb', 1]]],
    ['Softwareentwicklung', 'SWE', 3, 1600000, 'lSwe', [['devS', 4], ['dev', 7], ['fiae', 3], ['devops', 2], ['test', 1]]],
    ['Vertrieb', 'VT', 4, 900000, 'lVt', [['kam', 3], ['vt', 6], ['vtI', 2]]],
    ['Einkauf', 'EK', 5, 380000, 'lEk', [['ek', 3], ['ekS', 2]]],
    ['Buchhaltung', 'BH', 6, 420000, 'lBh', [['fibu', 3], ['bh', 2], ['lohn', 1]]],
    ['Personal', 'PE', 1, 360000, 'lPe', [['pref', 3], ['peS', 1]]],
    ['Ausbildung', 'AUS', 1, 310000, 'lAus', [['ausb', 1], ['azFisi', 6], ['azFiae', 2]]]
  ];
  const VORNAMEN_M = ['Alexander', 'Andreas', 'Benjamin', 'Björn', 'Christian', 'Daniel', 'David', 'Dennis', 'Dominik', 'Fabian', 'Felix', 'Florian', 'Frank', 'Hans-Peter', 'Jan', 'Jannik', 'Jens', 'Jonas', 'Jörg', 'Julian', 'Jürgen', 'Kai', 'Kevin', 'Lars', 'Leon', 'Lukas', 'Malte', 'Marcel', 'Markus', 'Martin', 'Matthias', 'Maximilian', 'Mehmet', 'Michael', 'Moritz', 'Niklas', 'Oliver', 'Patrick', 'Paul', 'Philipp', 'René', 'Sebastian', 'Simon', 'Sören', 'Stefan', 'Sven', 'Tim', 'Tobias', 'Uwe'];
  const VORNAMEN_W = ['Andrea', 'Anja', 'Anna', 'Annika', 'Ayşe', 'Birgit', 'Carina', 'Christina', 'Claudia', 'Daniela', 'Elena', 'Eva', 'Franziska', 'Hannah', 'Heike', 'Isabel', 'Jana', 'Jasmin', 'Julia', 'Katharina', 'Kerstin', 'Laura', 'Lea', 'Lena', 'Lisa', 'Maike', 'Mareike', 'Marie', 'Melanie', 'Miriam', 'Nadine', 'Nicole', 'Özlem', 'Petra', 'Sabine', 'Sandra', 'Sarah', 'Silke', 'Sophie', 'Stefanie', 'Susanne', 'Tanja', 'Vanessa', 'Yvonne'];
  const NACHNAMEN = ['Albrecht', 'Arnold', 'Baumann', 'Beck', 'Becker', 'Berger', 'Bergmann', 'Böhm', 'Brandt', 'Braun', 'Busch', 'Demir', 'Dietrich', 'Engel', 'Fischer', 'Franke', 'Friedrich', 'Fuchs', 'Graf', 'Groß', 'Günther', 'Haas', 'Hahn', 'Hartmann', 'Heinrich', 'Herrmann', 'Hoffmann', 'Hofmann', 'Horn', 'Huber', 'Jäger', 'Jung', 'Kaiser', 'Kaya', 'Keller', 'Klein', 'Koch', 'Köhler', 'König', 'Kowalski', 'Krämer', 'Kraus', 'Krause', 'Krüger', 'Kühn', 'Kuhn', 'Lang', 'Lange', 'Lehmann', 'Lorenz', 'Ludwig', 'Maier', 'Meier', 'Meyer', 'Möller', 'Müller', 'Neumann', 'Nowak', 'Otto', 'Öztürk', 'Peters', 'Petrović', 'Pfeiffer', 'Pohl', 'Richter', 'Roth', 'Sauer', 'Schäfer', 'Schmidt', 'Schmitz', 'Schneider', 'Scholz', 'Schröder', 'Schubert', 'Schulte', 'Schulz', 'Schumacher', 'Schuster', 'Schwarz', 'Seidel', 'Sommer', 'Stein', 'Strauß', 'Vogel', 'Vogt', 'Voigt', 'Voß', 'Wagner', 'Walter', 'Weber', 'Weiß', 'Werner', 'Winkler', 'Winter', 'Wolf', 'Zimmermann'];

  const KUNDEN_PRAEFIX = ['Elbtal', 'Nordwind', 'Alsterblick', 'Weserbogen', 'Spreeufer', 'Rheinkiesel', 'Isargrund', 'Harzblick', 'Saaletal', 'Mainbrücke', 'Ostseeküste', 'Heidekamp', 'Moselhang', 'Lindenhof', 'Eichenhain', 'Birkenweg', 'Ahornfeld', 'Kranichsee', 'Möwenstein', 'Sonnenhang', 'Morgenrot', 'Falkenhorst', 'Wiesengrund', 'Seeblick', 'Brückenwerk', 'Kornblume', 'Hafenkante', 'Lotsenhaus', 'Windrose', 'Ankerplatz', 'Glockenberg', 'Mühlbach', 'Feldmark', 'Nordstern', 'Silberdistel', 'Kiefernhain', 'Tannenhöhe', 'Bernsteinbucht', 'Dünenweg', 'Fichtelgrund', 'Neckarblick', 'Werrastein', 'Lahnaue', 'Ruhrbogen'];
  const BRANCHEN = [
    ['Logistik', p => `${p} Logistik GmbH`], ['Maschinenbau', p => `${p} Maschinenbau AG`], ['Gesundheitswesen', p => `Praxisgemeinschaft ${p}`],
    ['Gesundheitswesen', p => `${p} Klinikverbund gGmbH`], ['Handel', p => `${p} Handelshaus KG`], ['Steuerberatung', p => `Steuerkanzlei ${p} PartG mbB`],
    ['Bildung', p => `${p} Bildungswerk e. V.`], ['Handwerk', p => `${p} Elektrotechnik GmbH & Co. KG`], ['Hotellerie', p => `Hotel ${p} GmbH`],
    ['Immobilien', p => `${p} Immobilien GmbH`], ['Öffentliche Verwaltung', p => `Zweckverband ${p}`], ['Medien', p => `${p} Medienhaus GmbH`],
    ['Energie', p => `${p} Energie GmbH`], ['Logistik', p => `Spedition ${p} GmbH`], ['Handel', p => `${p} Großhandel GmbH`]
  ];
  const STAEDTE = [['Hamburg', '22111'], ['Lübeck', '23552'], ['Kiel', '24103'], ['Bremen', '28195'], ['Hannover', '30159'], ['Berlin', '10115'], ['Potsdam', '14467'], ['Leipzig', '04109'], ['Dresden', '01067'], ['Köln', '50667'], ['Düsseldorf', '40213'], ['Bonn', '53111'], ['München', '80331'], ['Augsburg', '86150'], ['Nürnberg', '90402'], ['Frankfurt am Main', '60311'], ['Mainz', '55116'], ['Erfurt', '99084'], ['Magdeburg', '39104'], ['Rostock', '18055']];

  // [Bezeichnung, Kategorie, EK, VK, Mengen-Bereich bei Bestellung]
  const ARTIKEL = [
    ['Notebook 14 Zoll Business', 'Hardware', 719.00, 949.00, [1, 12]], ['Notebook 15,6 Zoll Standard', 'Hardware', 519.00, 699.00, [1, 12]],
    ['Desktop-PC Office', 'Hardware', 479.00, 649.00, [1, 15]], ['Workstation CAD', 'Hardware', 1649.00, 2189.00, [1, 4]],
    ['Monitor 24 Zoll', 'Hardware', 114.90, 169.00, [1, 20]], ['Monitor 27 Zoll WQHD', 'Hardware', 209.00, 299.00, [1, 12]],
    ['Dockingstation USB-C', 'Hardware', 94.50, 149.00, [1, 15]], ['Thin Client', 'Hardware', 259.00, 349.00, [2, 20]],
    ['Tablet 11 Zoll', 'Hardware', 329.00, 449.00, [1, 8]], ['Server 1 HE Rack', 'Hardware', 2890.00, 3890.00, [1, 2]],
    ['Serverschrank 42 HE', 'Hardware', 689.00, 989.00, [1, 2]], ['USV 1500 VA', 'Hardware', 309.00, 449.00, [1, 4]],
    ['NAS 4 Bay', 'Hardware', 419.00, 589.00, [1, 3]], ['SSD 1 TB', 'Hardware', 61.90, 99.00, [1, 20]],
    ['Switch 24 Port managed', 'Netzwerk', 289.00, 419.00, [1, 6]], ['Switch 48 Port PoE', 'Netzwerk', 889.00, 1289.00, [1, 4]],
    ['Router Business', 'Netzwerk', 239.00, 349.00, [1, 3]], ['Firewall-Appliance', 'Netzwerk', 1149.00, 1689.00, [1, 2]],
    ['WLAN Access Point Wi-Fi 6', 'Netzwerk', 134.00, 199.00, [1, 16]], ['Patchkabel Cat6a 2 m', 'Netzwerk', 2.10, 4.90, [10, 100]],
    ['Patchpanel 24 Port Cat6a', 'Netzwerk', 37.80, 69.00, [1, 6]], ['Tastatur-Maus-Set kabellos', 'Zubehör', 23.90, 39.00, [1, 25]],
    ['Headset USB', 'Zubehör', 37.50, 59.00, [1, 25]], ['Microsoft-365-Lizenz (Jahr)', 'Lizenz', 109.00, 149.00, [5, 60]],
    ['Windows-Server-Lizenz Standard', 'Lizenz', 819.00, 1089.00, [1, 4]], ['Virenschutz-Lizenz (Jahr)', 'Lizenz', 17.50, 29.00, [5, 80]],
    ['Backup-Software-Lizenz (Jahr)', 'Lizenz', 289.00, 419.00, [1, 5]], ['Installation vor Ort (Stunde)', 'Dienstleistung', 45.00, 95.00, [1, 16]],
    ['Fernwartung (Stunde)', 'Dienstleistung', 35.00, 85.00, [1, 12]], ['Schulung (Tag)', 'Dienstleistung', 300.00, 890.00, [1, 3]]
  ];
  const NIE_BESTELLT = 'Serverschrank 42 HE'; // Lern-Anomalie: Artikel ohne Bestellposition

  // [Name, für Kunden?, Start, Ende (null = offen), Status, Abteilungs-Pools, Budget, Tätigkeiten]
  const PROJEKTE = [
    ['Umstellung auf Microsoft 365', true, '2025-01-13', '2025-06-27', 'abgeschlossen', ['ITB', 'ITS'], 48000, ['Postfachmigration', 'Lizenzzuweisung', 'Benutzerschulung']],
    ['Netzwerkmodernisierung Lagerhalle', true, '2025-02-03', '2025-05-30', 'abgeschlossen', ['NWS'], 36000, ['Verkabelung', 'Switch-Konfiguration', 'VLAN-Planung']],
    ['Firewall-Erneuerung', true, '2025-10-06', '2026-06-30', 'aktiv', ['NWS', 'ITB'], 42000, ['Regelwerk-Analyse', 'Firewall-Konfiguration', 'Penetrationstest']],
    ['Backup-Konzept 3-2-1', true, '2025-04-01', '2025-09-30', 'abgeschlossen', ['ITB'], 28000, ['Backup-Jobs einrichten', 'Wiederherstellungstest', 'NAS-Einrichtung']],
    ['Active-Directory-Bereinigung', false, '2025-03-03', '2025-07-31', 'abgeschlossen', ['ITB', 'ITS', 'AUS'], 15000, ['Konten prüfen', 'OU-Struktur anpassen', 'Gruppenrichtlinien']],
    ['WLAN-Ausleuchtung Klinikneubau', true, '2025-11-03', '2026-05-29', 'aktiv', ['NWS'], 39000, ['Ausleuchtung vor Ort', 'Access Points montieren', 'Controller-Konfiguration']],
    ['Einführung Ticketsystem', false, '2025-09-01', null, 'aktiv', ['ITS', 'SWE', 'AUS'], 22000, ['Workflow-Design', 'Schnittstellen', 'Kategorien pflegen']],
    ['Servervirtualisierung', true, '2025-05-05', '2025-12-19', 'abgeschlossen', ['ITB', 'NWS'], 65000, ['Hypervisor-Installation', 'VM-Migration', 'Speicheranbindung']],
    ['Client-Rollout Windows 11', true, '2025-08-04', '2026-04-17', 'aktiv', ['ITS', 'ITB', 'AUS'], 54000, ['Image erstellen', 'Geräte ausrollen', 'Altgeräte entsorgen']],
    ['VPN-Zugang Außendienst', true, '2025-03-17', '2025-07-11', 'gestoppt', ['NWS'], 18000, ['VPN-Gateway', 'Zertifikate', 'Client-Profile']],
    ['Relaunch Kundenportal', true, '2025-06-02', '2026-09-30', 'aktiv', ['SWE'], 120000, ['Programmierung', 'Code-Review', 'Datenbankdesign', 'UI-Entwurf']],
    ['Monitoring-Einführung', false, '2025-01-20', '2025-04-30', 'abgeschlossen', ['ITB', 'NWS'], 12000, ['Sensoren anlegen', 'Alarmierung', 'Dashboard']],
    ['Datenschutz-Audit', true, '2025-09-15', '2025-12-12', 'abgeschlossen', ['NWS', 'STAB'], 16000, ['Verarbeitungsverzeichnis', 'TOM prüfen', 'Auditbericht']],
    ['VoIP-Telefonanlage', true, '2026-01-12', '2026-06-30', 'aktiv', ['NWS', 'ITS'], 31000, ['Rufnummernplan', 'Telefone einrichten', 'SIP-Trunk']],
    ['Rechenzentrum-Umzug', true, '2026-05-04', '2026-10-30', 'geplant', ['ITB', 'NWS'], 95000, ['Umzugsplanung']] // Lern-Anomalie: ohne Zeiterfassung
  ];
  const TAET_ALLG = ['Projektbesprechung', 'Dokumentation', 'Abstimmung mit Kunde', 'Test', 'Fehleranalyse'];
  const STUNDEN = [1, 1.5, 2, 2, 2.5, 3, 3, 3.5, 4, 4, 4.5, 5, 6, 6, 7, 8];

  // ---------- Generator ----------
  function erzeuge(seed) {
    const rnd = mulberry32(seed);
    const zahl = (a, b) => a + Math.floor(rnd() * (b - a + 1));
    const wahl = arr => arr[Math.floor(rnd() * arr.length)];
    const mische = arr => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
    const datumZw = (a, b) => iso(ms(a) + Math.floor(rnd() * ((ms(b) - ms(a)) / TAG + 1)) * TAG);
    const monatsErster = (j1, j2) => `${zahl(j1, j2)}-${String(zahl(1, 12)).padStart(2, '0')}-01`;

    // Standorte
    const standorte = STANDORTE.map(([stadt, plz, strasse], i) => ({ standort_id: i + 1, stadt, plz, strasse, land: 'DE' }));

    // Abteilungen
    const abteilungen = ABTEILUNGEN.map(([name, kuerzel, st, budget], i) => ({
      abt_id: i + 1, name, kuerzel, standort_id: st, leiter_id: null, budget: Math.round(budget * (0.9 + rnd() * 0.2) / 1000) * 1000
    }));
    const abtNr = {}; abteilungen.forEach(a => { abtNr[a.kuerzel] = a.abt_id; });

    // Mitarbeiter
    const benutzt = new Set(), namenSet = new Set(), unames = new Set();
    function neuerName(w) {
      for (let v = 0; v < 500; v++) {
        const vor = wahl(w ? VORNAMEN_W : VORNAMEN_M), nach = wahl(NACHNAMEN), k = vor + ' ' + nach;
        if (!namenSet.has(k)) { namenSet.add(k); return [vor, nach]; }
      }
      throw new Error('Namen erschöpft');
    }
    const mitarbeiter = [];
    function neu(posKey, abtK, vorg, opt = {}) {
      const w = opt.w !== undefined ? opt.w : rnd() < 0.38;
      const [vorname, nachname] = opt.name || neuerName(w);
      const p = POS[posKey], azubi = posKey.startsWith('az');
      const id = mitarbeiter.length + 1;
      const bn = benutzername(vorname, nachname, unames);
      const abt_id = abtK ? abtNr[abtK] : null;
      const st = abt_id ? abteilungen[abt_id - 1].standort_id : 1;
      let geburt, eintritt, gehalt, ws = 40;
      if (azubi) {
        eintritt = opt.eintritt;
        geburt = datumZw(`${+eintritt.slice(0, 4) - 21}-01-01`, `${+eintritt.slice(0, 4) - 17}-06-30`);
        const lj = 2026 - +eintritt.slice(0, 4); // Lehrjahr (Stand Anfang 2026)
        gehalt = (posKey === 'azFiae' ? 20 : 0) + [1050, 1150, 1250][Math.min(2, Math.max(0, lj - 1))];
      } else {
        const gj = opt.leiter ? zahl(1966, 1988) : zahl(1964, 2000);
        geburt = datumZw(`${gj}-01-01`, `${gj}-12-28`);
        eintritt = opt.eintritt || (opt.leiter ? monatsErster(Math.max(2011, gj + 25), 2020) : monatsErster(Math.max(2011, gj + 21), 2025));
        if (eintritt > '2025-10-01') eintritt = '2025-10-01';
        gehalt = Math.round((p[2] + rnd() * (p[3] - p[2])) / 10) * 10;
        if (!opt.leiter && posKey !== 'gf' && rnd() < 0.12) { ws = wahl([30, 32, 35]); gehalt = Math.max(2800, Math.round(gehalt * ws / 40 / 10) * 10); }
      }
      const m = {
        ma_id: id, personalnr: 'NZ-' + String(1000 + id), vorname, nachname, benutzername: bn, email: bn + '@netzilon.example',
        telefon: `${STANDORTE[st - 1][3]} 5550-${String(100 + id)}`, geburtsdatum: geburt, eintritt, austritt: null,
        abt_id, vorgesetzter_id: vorg, position: p[w ? 1 : 0], gehalt: r2(gehalt), wochenstunden: ws, azubi: azubi ? 1 : 0
      };
      m._pos = posKey; m._abt = abtK; m._leiter = !!opt.leiter;
      mitarbeiter.push(m);
      return m;
    }
    const gf = neu('gf', 'GF', null, { leiter: true, eintritt: '2011-04-01' });
    abteilungen[0].leiter_id = gf.ma_id;
    neu('assist', 'GF', gf.ma_id);
    // Lern-Anomalie: 2 Stabsstellen ohne Abteilung (abt_id NULL), direkt der Geschäftsführung unterstellt
    neu('dsb', null, gf.ma_id, { w: true });
    neu('qmb', null, gf.ma_id, { w: false });
    for (let i = 1; i < ABTEILUNGEN.length; i++) {
      const [, k, , , lPos, glieder] = ABTEILUNGEN[i];
      const l = neu(lPos, k, gf.ma_id, { leiter: true });
      abteilungen[i].leiter_id = l.ma_id;
      let ausbilder = null; const azJahre = { azFisi: ['2023-08-01', '2023-08-01', '2024-08-01', '2024-08-01', '2025-08-01', '2025-08-01'], azFiae: ['2024-08-01', '2025-08-01'] };
      for (const [pk, n] of glieder) {
        for (let j = 0; j < n; j++) {
          if (pk.startsWith('az')) neu(pk, k, ausbilder.ma_id, { eintritt: azJahre[pk][j] });
          else { const m = neu(pk, k, l.ma_id); if (pk === 'ausb') ausbilder = m; }
        }
      }
    }
    // Namensdopplung (gleicher Vor- und Nachname) → benutzername mit Ziffer
    {
      const a = mitarbeiter[20], b = mitarbeiter[71];
      unames.delete(b.benutzername); namenSet.delete(b.vorname + ' ' + b.nachname);
      b.vorname = a.vorname; b.nachname = a.nachname;
      b.position = POS[b._pos][VORNAMEN_W.includes(a.vorname) ? 1 : 0];
      b.benutzername = benutzername(b.vorname, b.nachname, unames); b.email = b.benutzername + '@netzilon.example';
    }
    // ~3 Austritte (keine Leitungen, keine Azubis, keine Stabsstellen)
    {
      const kand = mische(mitarbeiter.filter(m => !m._leiter && !m.azubi && m._abt && m._abt !== 'GF' && m._pos !== 'ausb' && m.eintritt <= '2024-06-01'));
      ['2025-06-30', '2025-11-30', '2026-02-28'].forEach((d, i) => { kand[i].austritt = d; });
    }
    const aktivAm = (m, d) => m.eintritt <= d && (!m.austritt || d <= m.austritt);

    // Kunden
    const praefixe = mische(KUNDEN_PRAEFIX).slice(0, 40);
    const kunden = praefixe.map((p, i) => {
      const [branche, f] = wahl(BRANCHEN);
      const [stadt, plz] = wahl(STAEDTE);
      const w = rnd() < 0.45, [v, n] = [wahl(w ? VORNAMEN_W : VORNAMEN_M), wahl(NACHNAMEN)];
      return { kunde_id: i + 1, firma: f(p), branche, stadt, plz, ansprechpartner: `${v} ${n}`, email: 'kontakt@' + ascii(p) + '.example', seit: datumZw('2012-01-01', '2024-12-31') };
    });
    const ohneBestellung = zahl(1, 40); // Lern-Anomalie: Kunde ohne Bestellung

    // Projekte + Projektmitarbeiter
    const projekte = [], projekt_mitarbeiter = [];
    const kundenFuerProjekte = mische(kunden.map(k => k.kunde_id));
    const poolVon = k => k === 'STAB' ? mitarbeiter.filter(m => !m.abt_id) : mitarbeiter.filter(m => m._abt === k && m._pos !== 'gf');
    PROJEKTE.forEach(([name, extern, start, ende, status, pools, budget], i) => {
      const fensterA = maxD(start, VON), fensterB = ende ? minD(ende, BIS) : BIS;
      const kann = m => status === 'geplant' ? !m.austritt : werktageIn(maxD(fensterA, m.eintritt), minD(fensterB, m.austritt || BIS)).length >= 5;
      const kandidaten = [...new Set(pools.flatMap(poolVon))].filter(kann);
      const leiterKand = kandidaten.filter(m => !m.azubi && !m.austritt && (m._leiter || /^(sysS|devS|netz|sec|sup2|cloud|isb|dsb)$/.test(m._pos)));
      const leiter = wahl(leiterKand.length ? leiterKand : kandidaten);
      const p = { projekt_id: i + 1, name, kunde_id: extern ? kundenFuerProjekte[i] : null, leiter_id: leiter.ma_id, start, ende, budget: r2(budget), status };
      projekte.push(p);
      const team = [leiter, ...mische(kandidaten.filter(m => m !== leiter)).slice(0, zahl(2, 6))];
      if (extern && rnd() < 0.5) {
        const kam = mitarbeiter.filter(m => m._pos === 'kam' && kann(m));
        if (kam.length) team.push(wahl(kam));
      }
      team.sort((a, b) => a.ma_id - b.ma_id);
      for (const m of team) {
        const rolle = m === leiter ? 'Projektleitung' : m._pos === 'kam' ? 'Kundenbetreuung' : m.azubi ? 'Mitarbeit (Azubi)'
          : /^(dev|devS|fiae|test|devops)$/.test(m._pos) ? 'Entwicklung' : m._pos === 'dsb' || m._pos === 'isb' ? 'Beratung' : 'Technik';
        projekt_mitarbeiter.push({ projekt_id: p.projekt_id, ma_id: m.ma_id, rolle, stunden_geplant: m === leiter ? zahl(10, 25) * 8 : zahl(4, 30) * 8 });
      }
    });

    // Artikel
    const artikel = ARTIKEL.map(([bezeichnung, kategorie, ek, vk], i) => ({
      artikel_id: i + 1, bezeichnung, kategorie, einkaufspreis: r2(ek), verkaufspreis: r2(vk),
      lagerbestand: (kategorie === 'Lizenz' || kategorie === 'Dienstleistung') ? 0 : (rnd() < 0.1 ? 0 : zahl(2, kategorie === 'Netzwerk' && vk < 10 ? 400 : 60))
    }));
    const bestellbar = artikel.filter(a => a.bezeichnung !== NIE_BESTELLT);

    // Bestellungen (250) + Positionen (genau 700)
    const vertrieb = mitarbeiter.filter(m => m._abt === 'VT');
    const kundenMitBest = kunden.filter(k => k.kunde_id !== ohneBestellung).map(k => k.kunde_id);
    const gewicht = kundenMitBest.map(() => 0.3 + rnd() * rnd() * 3);
    const gSumme = gewicht.reduce((a, b) => a + b, 0);
    const kundeGewichtet = () => { let x = rnd() * gSumme; for (let i = 0; i < gewicht.length; i++) { x -= gewicht[i]; if (x <= 0) return kundenMitBest[i]; } return kundenMitBest[kundenMitBest.length - 1]; };
    const roh = [];
    for (let i = 0; i < 250; i++) {
      const datum = wahl(WERKTAGE);
      const kunde_id = i < kundenMitBest.length ? kundenMitBest[i] : kundeGewichtet();
      const vt = vertrieb.filter(m => aktivAm(m, datum));
      const ma_id = (rnd() < 0.03 || !vt.length) ? null : wahl(vt).ma_id; // wenige Online-Bestellungen ohne Bearbeiter
      let status;
      const x = rnd();
      if (x < 0.05) status = 'storniert';
      else if (datum >= '2026-03-01') status = x < 0.6 ? 'offen' : 'versendet';
      else if (datum >= '2026-01-15') status = x < 0.25 ? 'offen' : x < 0.6 ? 'versendet' : 'bezahlt';
      else status = x < 0.08 ? 'versendet' : 'bezahlt';
      roh.push({ kunde_id, ma_id, datum, status });
    }
    roh.sort((a, b) => (a.datum < b.datum ? -1 : a.datum > b.datum ? 1 : a.kunde_id - b.kunde_id));
    const bestellungen = roh.map((b, i) => ({ best_id: i + 1, kunde_id: b.kunde_id, ma_id: b.ma_id, datum: b.datum, status: b.status }));
    const anzahl = bestellungen.map(() => 1);
    for (let rest = 700 - 250; rest > 0;) { const i = zahl(0, 249); if (anzahl[i] < 6) { anzahl[i]++; rest--; } }
    const bestellpositionen = [];
    bestellungen.forEach((b, i) => {
      const arts = mische(bestellbar).slice(0, anzahl[i]);
      const rabatt = wahl([0, 0, 0, 0.05, 0.1]);
      arts.forEach((a, j) => {
        const bereich = ARTIKEL[a.artikel_id - 1][4];
        bestellpositionen.push({ best_id: b.best_id, pos: j + 1, artikel_id: a.artikel_id, menge: zahl(bereich[0], bereich[1]), einzelpreis: r2(a.verkaufspreis * (1 - rabatt)) });
      });
    });

    // Zeiterfassung (genau 2000; nur Werktage, nur Projektmitglieder, nur während der Beschäftigung, ≤ 10 h/Tag je Person)
    const ZIEL = 2000;
    const plan = projekte.filter(p => p.status !== 'geplant').map((p, idx) => {
      const fA = maxD(p.start, VON), fB = p.ende ? minD(p.ende, BIS) : BIS;
      const team = projekt_mitarbeiter.filter(x => x.projekt_id === p.projekt_id).map(x => {
        const m = mitarbeiter[x.ma_id - 1];
        return { m, tage: werktageIn(maxD(fA, m.eintritt), minD(fB, m.austritt || BIS)) };
      }).filter(t => t.tage.length);
      const def = PROJEKTE[p.projekt_id - 1];
      return { p, team, gewicht: werktageIn(fA, fB).length * team.length, taet: def[7], extern: def[1], idx };
    });
    const gSum = plan.reduce((a, b) => a + b.gewicht, 0);
    plan.forEach(x => { x.n = Math.floor(ZIEL * x.gewicht / gSum); });
    for (let rest = ZIEL - plan.reduce((a, b) => a + b.n, 0), i = 0; rest > 0; rest--, i++) plan[i % plan.length].n++;
    const proTag = new Map(), schluessel = new Set(), zeitRoh = [];
    for (const x of plan) {
      let n = x.n, versuche = 0;
      while (n > 0 && versuche < x.n * 50) {
        versuche++;
        const t = wahl(x.team), datum = wahl(t.tage);
        const k = t.m.ma_id + '|' + x.p.projekt_id + '|' + datum;
        if (schluessel.has(k)) continue;
        const std = wahl(STUNDEN), tk = t.m.ma_id + '|' + datum, bisher = proTag.get(tk) || 0;
        if (bisher + std > 10) continue;
        schluessel.add(k); proTag.set(tk, bisher + std);
        const allg = x.extern ? TAET_ALLG : TAET_ALLG.filter(s => s !== 'Abstimmung mit Kunde').concat('Abstimmung intern');
        zeitRoh.push({ ma_id: t.m.ma_id, projekt_id: x.p.projekt_id, datum, stunden: std, taetigkeit: rnd() < 0.65 ? wahl(x.taet) : wahl(allg) });
        n--;
      }
    }
    zeitRoh.sort((a, b) => (a.datum < b.datum ? -1 : a.datum > b.datum ? 1 : a.ma_id - b.ma_id || a.projekt_id - b.projekt_id));
    const zeiterfassung = zeitRoh.map((z, i) => Object.assign({ eintrag_id: i + 1 }, z));

    for (const m of mitarbeiter) { delete m._pos; delete m._abt; delete m._leiter; }
    return { standorte, abteilungen, mitarbeiter, kunden, projekte, projekt_mitarbeiter, artikel, bestellungen, bestellpositionen, zeiterfassung };
  }

  const CACHE = new Map(), SQLCACHE = new Map();
  function daten(seed) {
    const s = seedZahl(seed);
    if (!CACHE.has(s)) CACHE.set(s, erzeuge(s));
    return CACHE.get(s);
  }
  function mitarbeiter(seed) {
    const d = daten(seed);
    return d.mitarbeiter.map(m => {
      const abt = m.abt_id ? d.abteilungen[m.abt_id - 1] : null;
      const vg = m.vorgesetzter_id ? d.mitarbeiter[m.vorgesetzter_id - 1] : null;
      return Object.assign({}, m, {
        abteilung: abt ? abt.name : null, kuerzel: abt ? abt.kuerzel : null,
        stadt: d.standorte[(abt ? abt.standort_id : 1) - 1].stadt, aktiv: !m.austritt, vorgesetzter: vg ? vg.benutzername : null
      });
    });
  }

  const wert = v => v === null || v === undefined ? 'NULL' : typeof v === 'number' ? String(v) : "'" + String(v).replace(/'/g, "''") + "'";
  function inserts(tab, zeilen, ohne) {
    if (!zeilen.length) return '';
    const sp = Object.keys(zeilen[0]);
    return zeilen.map(z => `INSERT INTO ${tab} (${sp.join(', ')}) VALUES (${sp.map(c => (ohne && ohne.includes(c)) ? 'NULL' : wert(z[c])).join(', ')});`).join('\n') + '\n';
  }
  function datenSql(seed) {
    const s = seedZahl(seed);
    if (SQLCACHE.has(s)) return SQLCACHE.get(s);
    const d = daten(s);
    let sql = `-- Netzilon GmbH – Beispieldaten (Seed ${s})\nBEGIN TRANSACTION;\n`;
    sql += inserts('standorte', d.standorte);
    sql += '-- leiter_id wird nach den Mitarbeitern gesetzt (Fremdschlüssel in beide Richtungen)\n';
    sql += inserts('abteilungen', d.abteilungen, ['leiter_id']);
    sql += inserts('mitarbeiter', d.mitarbeiter);
    sql += d.abteilungen.map(a => `UPDATE abteilungen SET leiter_id = ${wert(a.leiter_id)} WHERE abt_id = ${a.abt_id};`).join('\n') + '\n';
    for (const t of ['kunden', 'projekte', 'projekt_mitarbeiter', 'artikel', 'bestellungen', 'bestellpositionen', 'zeiterfassung']) sql += inserts(t, d[t]);
    sql += 'COMMIT;\n';
    SQLCACHE.set(s, sql);
    return sql;
  }

  return { SEED, daten, mitarbeiter, schemaSql, datenSql, TABELLEN };
})();
window.FirmaDB = FirmaDB;

const SqlKern = (() => {
  const W = typeof window !== 'undefined' ? window : globalThis;
  // Original-initSqlJs (WASM-Variante) sichern, bevor ein asm.js-Fallback das globale initSqlJs überschreibt
  const INIT_WASM = typeof initSqlJs === 'function' ? initSqlJs : (typeof W.initSqlJs === 'function' ? W.initSqlJs : null);
  let SQL = null, MODUS = null, LADE = null;
  const jetzt = () => (typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now());

  function zuBytes(b64) {
    const bin = atob(b64), u = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
    return u;
  }
  function zuB64(u8) {
    let s = '';
    for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000));
    return btoa(s);
  }
  const text = e => (e && e.message) ? e.message : String(e);

  async function ladeWasm() {
    if (typeof WebAssembly !== 'object') throw new Error('WebAssembly nicht verfügbar');
    const init = INIT_WASM || (typeof W.initSqlJs === 'function' ? W.initSqlJs : null);
    if (!init) throw new Error('sql-wasm.js nicht geladen (initSqlJs fehlt)');
    if (!W.NZ_SQL_WASM_B64) throw new Error('WASM-Daten fehlen (NZ_SQL_WASM_B64)');
    return await init({ wasmBinary: zuBytes(W.NZ_SQL_WASM_B64) });
  }
  async function ladeAsm() {
    if (!W.NZ_SQL_ASM_GZ) throw new Error('asm.js-Daten fehlen (NZ_SQL_ASM_GZ)');
    if (typeof DecompressionStream !== 'function') throw new Error('DecompressionStream fehlt (Browser zu alt)');
    if (typeof document === 'undefined') throw new Error('kein document für das asm.js-Skript');
    const strom = new Blob([zuBytes(W.NZ_SQL_ASM_GZ)]).stream().pipeThrough(new DecompressionStream('gzip'));
    const code = await new Response(strom).text();
    const vorher = W.initSqlJs;
    const url = URL.createObjectURL(new Blob([code], { type: 'text/javascript' }));
    try {
      await new Promise((ok, fehler) => {
        const s = document.createElement('script');
        s.src = url;
        s.onload = () => ok();
        s.onerror = () => fehler(new Error('asm.js-Skript wurde blockiert oder ist fehlerhaft'));
        (document.head || document.documentElement).appendChild(s);
      });
    } finally { URL.revokeObjectURL(url); }
    const initAsm = W.initSqlJs;
    try { W.initSqlJs = vorher; } catch (e) { /* ignorieren */ }
    if (typeof initAsm !== 'function' || initAsm === vorher) throw new Error('asm.js-Skript hat initSqlJs nicht bereitgestellt');
    return await initAsm({});
  }

  function laden() {
    if (LADE) return LADE;
    LADE = (async () => {
      let fehlerWasm = null;
      if (!api._erzwingeAsm) {
        try { SQL = await ladeWasm(); MODUS = 'wasm'; return SQL; } catch (e) { fehlerWasm = e; }
      } else fehlerWasm = new Error('übersprungen (_erzwingeAsm)');
      try { SQL = await ladeAsm(); MODUS = 'asm'; return SQL; } catch (e) {
        throw new Error(`SQL-Engine konnte nicht geladen werden. WebAssembly: ${text(fehlerWasm)}; asm.js-Fallback: ${text(e)}`);
      }
    })();
    LADE.catch(() => { LADE = null; });
    return LADE;
  }
  const fkAn = db => { db.exec('PRAGMA foreign_keys = ON;'); return db; };

  async function neueDb(seed) {
    const S = await laden();
    const db = new S.Database();
    fkAn(db);
    db.exec(FirmaDB.schemaSql());
    db.exec(FirmaDB.datenSql(seed));
    return db;
  }
  async function ausBase64(b64) {
    const S = await laden();
    const db = new S.Database(zuBytes(b64));
    try { db.exec('SELECT count(*) FROM sqlite_master;'); } catch (e) { try { db.close(); } catch (e2) { /* egal */ } throw new Error('Keine gültige Datenbank: ' + text(e)); }
    return fkAn(db);
  }
  function nachBase64(db) {
    const b = zuB64(db.export());
    try { fkAn(db); } catch (e) { /* egal */ }
    return b;
  }
  const gesamtAenderungen = db => { try { const r = db.exec('SELECT total_changes();'); return r[0].values[0][0]; } catch (e) { return null; } };

  function ausfuehren(db, sql) {
    const t0 = jetzt();
    const vor = gesamtAenderungen(db);
    const ende = (o) => {
      const nach = gesamtAenderungen(db);
      let g = (vor !== null && nach !== null) ? nach - vor : null;
      if (g === null || g < 0) { try { g = db.getRowsModified(); } catch (e) { g = 0; } }
      o.geaendert = g; o.ms = Math.round((jetzt() - t0) * 10) / 10;
      return o;
    };
    try {
      const ergebnisse = db.exec(String(sql == null ? '' : sql)).map(r => ({ columns: r.columns, values: r.values }));
      return ende({ ok: true, ergebnisse });
    } catch (e) {
      return ende({ ok: false, ergebnisse: [], fehler: text(e) });
    }
  }

  // ---------- Ergebnis-Vergleich ----------
  function normal(x) {
    if (!x) return { columns: [], values: [] };
    if (Array.isArray(x.ergebnisse)) x = x.ergebnisse;
    if (Array.isArray(x)) x = x.length ? x[x.length - 1] : { columns: [], values: [] };
    return { columns: x.columns || [], values: x.values || [] };
  }
  const istZahl = v => typeof v === 'number' || typeof v === 'bigint';
  const alsZahl = v => istZahl(v) ? Number(v) : (typeof v === 'string' && v.trim() !== '' && isFinite(Number(v)) ? Number(v) : NaN);
  function gleich(a, b) {
    if (a === null || a === undefined || b === null || b === undefined) return (a === null || a === undefined) && (b === null || b === undefined);
    if (a instanceof Uint8Array || b instanceof Uint8Array) {
      if (!(a instanceof Uint8Array && b instanceof Uint8Array) || a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
      return true;
    }
    if (istZahl(a) || istZahl(b)) { const x = alsZahl(a), y = alsZahl(b); return !isNaN(x) && !isNaN(y) && Math.abs(x - y) <= 0.005 + 1e-9; }
    return String(a) === String(b);
  }
  function sortSchluessel(zeile) {
    return JSON.stringify(zeile.map(v => v === null || v === undefined ? [0] : istZahl(v) ? [1, Math.round(Number(v) * 100) / 100]
      : v instanceof Uint8Array ? [3, Array.from(v).join(',')] : [2, String(v)]));
  }
  function vergleiche(ergA, ergB, opt) {
    const a = normal(ergA), b = normal(ergB);
    if (a.columns.length !== b.columns.length || a.values.length !== b.values.length) return false;
    let za = a.values, zb = b.values;
    if (!(opt && opt.reihenfolge)) {
      const so = z => z.map(r => [sortSchluessel(r), r]).sort((x, y) => (x[0] < y[0] ? -1 : x[0] > y[0] ? 1 : 0)).map(x => x[1]);
      za = so(za); zb = so(zb);
    }
    for (let i = 0; i < za.length; i++) {
      if (za[i].length !== zb[i].length) return false;
      for (let j = 0; j < za[i].length; j++) if (!gleich(za[i][j], zb[i][j])) return false;
    }
    return true;
  }

  const api = { laden, modus: () => MODUS, neueDb, ausBase64, nachBase64, ausfuehren, vergleiche, _erzwingeAsm: false };
  return api;
})();
window.SqlKern = SqlKern;
