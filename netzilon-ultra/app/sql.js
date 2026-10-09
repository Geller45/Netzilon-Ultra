// Netzilon Ultra 2.3.0 – SQL-Labor: echtes SQLite (sql.js, offline) auf der Firmen-DB „Netzilon GmbH“.
// Editor mit Highlighting, animierte Ergebnisse, Fehler-Erklärhilfe, ER-Diagramm + Live-Schema, T-SQL-Hinweise,
// Aufgabenreihe (window.SQL_AUFGABEN) mit automatischer Prüfung, Legende.
// Öffentlich: window.SqlLabor = { ansicht, alleGeloest, uebersetzeFehler, tsqlHinweise, _test }, window.VIEWS.sql
const SqlLabor = (() => {
  const MAX_ZEIGEN = 200, MAX_HALTEN = 5000, MAX_ZAEHLEN = 200000, MAX_B64 = 3 * 1024 * 1024, VERLAUF_MAX = 30;
  const STUFEN = { 1: 'leicht', 2: 'mittel', 3: 'schwer' };

  // ---------- Zustand ----------
  let db = null, dbRef = null, refDb = null, ladeFehler = null, ladeHinweis = null, bereit = false;
  let speicherT = 0, dirty = false, groesseWarnung = false, txOffen = false;
  let akt = null, wartendWarnung = null, zuletztAusgefuehrt = null, beobachter = null;
  const uiTimer = new Set();
  const fehl = {}, hStufe = {}, sollCache = {};

  const istObj = o => o && typeof o === 'object' && !Array.isArray(o);
  const jetzt = () => (typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now());
  const datumHeute = () => (typeof heute === 'function' ? heute() : new Date().toISOString().slice(0, 10));
  const aktiv = () => !!(S.ansicht && S.ansicht.ansicht === 'sql' && document.getElementById('sql-wurzel'));
  const el = id => document.getElementById(id);
  const inl = s => (window.Parser && Parser.inline ? Parser.inline(s) : E(s));

  function P() {
    const p = S.p;
    if (!istObj(p.sql)) p.sql = { geloest: {}, db: null, verlauf: [], editor: '' };
    const q = p.sql;
    if (!istObj(q.geloest)) q.geloest = {};
    if (!Array.isArray(q.verlauf)) q.verlauf = [];
    q.verlauf = q.verlauf.filter(x => typeof x === 'string' && x.length < 20000).slice(0, VERLAUF_MAX);
    if (typeof q.editor !== 'string') q.editor = '';
    if (q.db !== null && typeof q.db !== 'string') q.db = null;
    return q;
  }
  function timer(fn, ms) {
    const t = setTimeout(() => { uiTimer.delete(t); if (aktiv()) fn(); }, ms);
    uiTimer.add(t); return t;
  }
  function stoppen() {
    for (const t of uiTimer) clearTimeout(t);
    uiTimer.clear();
    if (beobachter) { beobachter.disconnect(); beobachter = null; }
    if (speicherT) sichernJetzt();
  }

  // ---------- Aufgaben ----------
  function aufgaben() {
    const l = Array.isArray(window.SQL_AUFGABEN) ? window.SQL_AUFGABEN : [];
    const ok = l.filter(a => istObj(a) && typeof a.id === 'string' && typeof a.loesung === 'string' && (a.art === 'abfrage' || (a.art === 'aenderung' && typeof a.pruefSql === 'string')));
    return ok.map((a, i) => [a, i]).sort((x, y) => ((+x[0].stufe || 1) - (+y[0].stufe || 1)) || x[1] - y[1]).map(x => x[0]);
  }
  function alleGeloest() {
    try {
      if (!S.p) return false;
      const l = aufgaben(); const g = P().geloest;
      return l.length > 0 && l.every(a => !!g[a.id]);
    } catch (e) { return false; }
  }
  const aufgabeVon = id => aufgaben().find(a => a.id === id) || null;
  function naechsteOffen(nach) {
    const l = aufgaben(), g = P().geloest;
    if (!l.length) return null;
    const i0 = nach ? l.findIndex(a => a.id === nach) : -1;
    for (let k = 1; k <= l.length; k++) { const a = l[(i0 + k + l.length) % l.length]; if (!g[a.id]) return a.id; }
    return nach || l[0].id;
  }

  // ---------- SQL ausführen (eigener Runner mit Ergebnis-Begrenzung) ----------
  const einzel = (d, q) => { try { const r = d.exec(q); return r[0].values[0][0]; } catch (e) { return null; } };
  function fuehreAus(d, sql, maxHalten) {
    maxHalten = maxHalten || MAX_HALTEN;
    const t0 = jetzt();
    const vorC = einzel(d, 'SELECT total_changes();'), vorS = einzel(d, 'PRAGMA schema_version;');
    const ergebnisse = []; let fehler = null;
    if (typeof d.iterateStatements !== 'function') {
      const r = SqlKern.ausfuehren(d, sql);
      r.ergebnisse = r.ergebnisse.map(e => ({ columns: e.columns, values: e.values.slice(0, maxHalten), gesamt: e.values.length, abgebrochen: false }));
      r.ddl = einzel(d, 'PRAGMA schema_version;') !== vorS;
      return r;
    }
    let it = null;
    try {
      it = d.iterateStatements(String(sql == null ? '' : sql));
      for (;;) {
        const n = it.next(); if (n.done) break;
        const st = n.value;
        const cols = st.getColumnNames();
        const values = []; let gesamt = 0, abgebrochen = false;
        while (st.step()) {
          if (gesamt < maxHalten) values.push(st.get());
          gesamt++;
          if (gesamt >= MAX_ZAEHLEN) { abgebrochen = true; break; }
        }
        if (cols.length) ergebnisse.push({ columns: cols, values, gesamt, abgebrochen });
        if (abgebrochen) break;
      }
    } catch (e) {
      fehler = (e && e.message) ? e.message : String(e);
    } finally {
      // restliche Statements nur vorbereiten/freigeben (führt nichts aus)
      try { if (it) for (let i = 0; i < 10000; i++) { if (it.next().done) break; } } catch (e) { /* egal */ }
    }
    const nachC = einzel(d, 'SELECT total_changes();'), nachS = einzel(d, 'PRAGMA schema_version;');
    let geaendert = (vorC !== null && nachC !== null) ? nachC - vorC : 0;
    if (geaendert < 0) geaendert = 0;
    const o = { ok: !fehler, ergebnisse, geaendert, ddl: vorS !== nachS, ms: Math.round((jetzt() - t0) * 10) / 10 };
    if (fehler) o.fehler = fehler;
    return o;
  }
  function transaktionOffen(d) {
    if (!d) return false;
    try { d.exec('BEGIN;'); } catch (e) { return true; }
    try { d.exec('ROLLBACK;'); } catch (e) { /* egal */ }
    return false;
  }
  // Spalten/Werte einer Ergebnismenge (letzte zählt)
  const letzte = r => (r && r.ergebnisse && r.ergebnisse.length) ? r.ergebnisse[r.ergebnisse.length - 1] : { columns: [], values: [] };

  // ---------- Datenbank laden / speichern ----------
  async function dbBereit() {
    await SqlKern.laden();
    const p = P();
    if (db && (speicherT || dirty || dbRef === p.db)) return null;
    if (db) { try { db.close(); } catch (e) { /* egal */ } db = null; }
    let hinweis = null;
    if (typeof p.db === 'string' && p.db) {
      try { db = await SqlKern.ausBase64(p.db); dbRef = p.db; }
      catch (e) {
        db = null; p.db = null; speichern();
        hinweis = 'Deine gespeicherte Arbeits-Datenbank war beschädigt und wurde verworfen. Du arbeitest jetzt mit einer frischen Firmen-Datenbank.';
      }
    }
    if (!db) { db = await SqlKern.neueDb(); dbRef = p.db; dirty = false; }
    txOffen = transaktionOffen(db);
    return hinweis;
  }
  function planeSpeichern() { clearTimeout(speicherT); speicherT = setTimeout(sichernJetzt, 700); }
  function sichernJetzt() {
    clearTimeout(speicherT); speicherT = 0;
    if (!db || !dirty) return;
    if (transaktionOffen(db)) return; // offene Transaktion nicht durch export() abbrechen – nach COMMIT/ROLLBACK speichern
    let b64;
    try { b64 = SqlKern.nachBase64(db); } catch (e) { console.warn('SQL-Labor: Speichern fehlgeschlagen', e); return; }
    dirty = false;
    if (b64.length > MAX_B64) {
      if (!groesseWarnung) { groesseWarnung = true; statusZeigen(); toast('Arbeits-DB ist größer als 3 MB – sie wird nicht gespeichert.', 'rot'); }
      return;
    }
    groesseWarnung = false;
    P().db = b64; dbRef = b64; speichern();
    statusZeigen();
  }
  async function zuruecksetzen() {
    if (!confirm('Arbeits-Datenbank wirklich zurücksetzen?\nAlle deine Änderungen (eigene Tabellen, INSERTs, UPDATEs …) gehen verloren.')) return;
    clearTimeout(speicherT); speicherT = 0;
    try { if (db) db.close(); } catch (e) { /* egal */ }
    db = null; dirty = false; groesseWarnung = false; zuletztAusgefuehrt = null;
    P().db = null; dbRef = null; speichern();
    try {
      db = await SqlKern.neueDb(); txOffen = false;
      if (!aktiv()) return;
      zeigeMeldung('ok', '✓ Datenbank zurückgesetzt – die Firmen-DB ist wieder im Originalzustand (100 Mitarbeiter, 40 Kunden …).');
      schemaZeigen(); statusZeigen();
      toast('Datenbank zurückgesetzt');
    } catch (e) { zeigeLadeFehler(e); }
  }

  // ---------- Fehler übersetzen ----------
  const FEHLER = [
    [/no such column: ?(\S+)/i, m => `Die Spalte <code>${E(m[1])}</code> gibt es nicht.`, 'Prüfe die Schreibweise (Schema unten im ER-Diagramm) und ob der Tabellen-Alias stimmt (z. B. <code>m.nachname</code>). Texte gehören in einfache Anführungszeichen: <code>\'Hamburg\'</code> – doppelte Anführungszeichen bedeuten in SQL einen Spaltennamen.'],
    [/no such table: ?(\S+)/i, m => `Die Tabelle <code>${E(m[1])}</code> gibt es nicht.`, 'Tabellennamen sind hier klein und ohne Umlaute: mitarbeiter, abteilungen, standorte, kunden, projekte, projekt_mitarbeiter, artikel, bestellungen, bestellpositionen, zeiterfassung. Eigene Tabellen musst du erst mit CREATE TABLE anlegen.'],
    [/no such function: ?(\S+)/i, m => `Die Funktion <code>${E(m[1])}</code> kennt SQLite nicht.`, 'Viele T-SQL-Funktionen heißen in SQLite anders: GETDATE() → date(\'now\'), ISNULL() → IFNULL(), LEN() → length(), YEAR(x) → strftime(\'%Y\', x), DATEADD → date(x, \'+7 days\').'],
    [/FOREIGN KEY constraint failed/i, () => 'Fremdschlüssel-Verletzung: Der Datensatz verweist auf etwas, das es nicht gibt – oder es wird ein Datensatz gelöscht, auf den noch andere verweisen.', 'Prüfe, ob die referenzierte ID existiert (z. B. <code>SELECT * FROM abteilungen WHERE abt_id = 99</code>). Beim Löschen erst die abhängigen Zeilen (Kind-Tabelle) löschen oder umhängen. Fremdschlüssel sichern die referenzielle Integrität.'],
    [/UNIQUE constraint failed: ?(\S+)/i, m => `Eindeutigkeit verletzt: In <code>${E(m[1])}</code> gibt es diesen Wert schon (UNIQUE bzw. Primärschlüssel).`, 'Nimm einen anderen Wert oder lass die ID weg – bei <code>INTEGER PRIMARY KEY</code> vergibt SQLite automatisch die nächste freie Nummer. Hast du die Anweisung vielleicht zweimal ausgeführt?'],
    [/NOT NULL constraint failed: ?(\S+)/i, m => `Pflichtfeld leer: <code>${E(m[1])}</code> darf nicht NULL sein.`, 'Gib in der Spaltenliste des INSERT auch diese Spalte mit einem Wert an.'],
    [/CHECK constraint failed:? ?(.*)/i, m => `Prüfregel (CHECK) verletzt${m[1] ? ': <code>' + E(m[1]) + '</code>' : ''}.`, 'Die Tabelle erlaubt nur bestimmte Werte, z. B. gehalt &gt; 0, stunden zwischen 0 und 12, status nur \'geplant\', \'aktiv\', \'abgeschlossen\' oder \'gestoppt\'. Schau dir die Definition mit <code>SELECT sql FROM sqlite_master WHERE name = \'projekte\'</code> an.'],
    [/ambiguous column name: ?(\S+)/i, m => `Mehrdeutig: <code>${E(m[1])}</code> gibt es in mehreren Tabellen des JOINs.`, 'Schreib den Tabellennamen oder Alias davor, z. B. <code>m.abt_id</code> statt <code>abt_id</code>.'],
    [/incomplete input/i, () => 'Die Anweisung ist unvollständig.', 'Fehlt eine schließende Klammer, ein Anführungszeichen oder ein Teil wie FROM/END?'],
    [/near "([^"]*)": syntax error/i, m => `Syntaxfehler in der Nähe von <code>${E(m[1])}</code>.`, 'Typische Ursachen: fehlendes Komma zwischen Spalten, Schlüsselwort falsch geschrieben, falsche Reihenfolge (SELECT … FROM … WHERE … GROUP BY … HAVING … ORDER BY … LIMIT) oder T-SQL-Syntax wie TOP.'],
    [/syntax error/i, () => 'Syntaxfehler – SQLite versteht die Anweisung nicht.', 'Prüfe Schreibweise, Kommas, Klammern und Anführungszeichen.'],
    [/misuse of aggregate/i, () => 'Aggregatfunktion (COUNT, SUM, AVG …) an falscher Stelle.', 'Bedingungen auf Aggregate gehören in HAVING, nicht in WHERE: <code>GROUP BY abt_id HAVING COUNT(*) &gt; 5</code>.'],
    [/(table|index|view|trigger) (\S+) already exists/i, m => `Das Objekt <code>${E(m[2])}</code> existiert bereits.`, 'Nutze <code>CREATE … IF NOT EXISTS</code>, lösche es vorher mit DROP oder setze die Datenbank zurück.'],
    [/cannot start a transaction within a transaction/i, () => 'Es läuft schon eine Transaktion.', 'Beende sie erst mit COMMIT (speichern) oder ROLLBACK (verwerfen).'],
    [/cannot (commit|rollback)[^-]*- no transaction is active/i, () => 'Es ist gar keine Transaktion offen.', 'Starte sie mit BEGIN; – ohne BEGIN wird jede Anweisung sofort automatisch festgeschrieben (Autocommit).'],
    [/cannot modify (\S+) because it is a view/i, m => `<code>${E(m[1])}</code> ist eine View – in SQLite kann man Views nicht direkt ändern.`, 'Ändere die zugrunde liegende Tabelle (oder lege einen INSTEAD-OF-Trigger an).'],
    [/do not have the same number of result columns/i, () => 'UNION: Beide SELECTs müssen gleich viele Spalten liefern.', 'Zähle die Spalten links und rechts vom UNION und gleiche sie an.'],
    [/sub-select returns (\d+) columns - expected 1/i, m => `Die Unterabfrage liefert ${E(m[1])} Spalten, erwartet wird genau 1.`, 'Bei <code>WHERE x IN (SELECT …)</code> oder <code>= (SELECT …)</code> darf die Unterabfrage nur eine Spalte zurückgeben.'],
    [/datatype mismatch/i, () => 'Datentyp passt nicht.', 'Bei INTEGER PRIMARY KEY sind nur ganze Zahlen erlaubt.'],
    [/no tables specified/i, () => 'SELECT * ohne FROM.', 'Gib mit FROM an, aus welcher Tabelle gelesen wird.'],
    [/(\d+) values for (\d+) columns/i, m => `${E(m[1])} Werte für ${E(m[2])} Spalten.`, 'Die Anzahl der Werte in VALUES muss genau zur Spaltenliste passen.'],
    [/table (\S+) has (\d+) columns but (\d+) values were supplied/i, m => `Tabelle <code>${E(m[1])}</code> hat ${E(m[2])} Spalten, es kamen aber ${E(m[3])} Werte.`, 'Gib die Spaltenliste beim INSERT an: <code>INSERT INTO tabelle (spalte1, spalte2) VALUES (…)</code>.']
  ];
  function uebersetzeFehler(msg) {
    msg = String(msg || '');
    for (const [re, f, tipp] of FEHLER) { const m = re.exec(msg); if (m) return { text: f(m), tipp }; }
    return { text: 'SQLite meldet einen Fehler.', tipp: 'Lies die Originalmeldung oben – oft steht dort, welches Wort oder welche Spalte nicht passt.' };
  }

  // ---------- T-SQL-Erkennung ----------
  const TSQL = [
    [/\bSELECT\s+(?:DISTINCT\s+)?TOP\s*\(?\s*\d+/i, 'TOP n', 'SQLite kennt kein <code>TOP</code>. Schreibe <code>LIMIT n</code> ans Ende: <code>SELECT * FROM mitarbeiter ORDER BY gehalt DESC LIMIT 5;</code>'],
    [/\b(GETDATE|SYSDATETIME|GETUTCDATE)\s*\(\s*\)/i, 'GETDATE()', 'Aktuelles Datum in SQLite: <code>date(\'now\')</code>, mit Uhrzeit <code>datetime(\'now\', \'localtime\')</code> oder <code>CURRENT_TIMESTAMP</code>.'],
    [/\bISNULL\s*\(/i, 'ISNULL()', 'In SQLite heißt es <code>IFNULL(a, b)</code> – oder standardkonform <code>COALESCE(a, b, …)</code> (geht in beiden).'],
    [/'s'\s*\+|\+\s*'s'/i, '+ bei Texten', 'Texte verkettet SQLite mit <code>||</code>: <code>vorname || \' \' || nachname</code>. Ein <code>+</code> rechnet in SQLite immer (Text wird zu 0).'],
    [/\bIDENTITY\b/i, 'IDENTITY', 'Auto-Nummer in SQLite: <code>id INTEGER PRIMARY KEY</code> (optional <code>AUTOINCREMENT</code>) statt <code>INT IDENTITY(1,1)</code>.'],
    [/\b(NVARCHAR|NCHAR|DATETIME2|MONEY|UNIQUEIDENTIFIER)\b/i, 'NVARCHAR & Co.', 'SQLite akzeptiert solche Typnamen, speichert aber nach Typaffinität als TEXT/INTEGER/REAL – Längen wie (50) werden nicht geprüft. Üblich: <code>TEXT</code>, <code>INTEGER</code>, <code>REAL</code>.'],
    [/\bN's'/, "N'…'", 'Unicode-Literale <code>N\'…\'</code> gibt es in SQLite nicht – alle Texte sind schon Unicode: einfach <code>\'Müller\'</code>.'],
    [/\bDATEADD\s*\(/i, 'DATEADD', 'Datum rechnen in SQLite mit Modifikatoren: <code>date(eintritt, \'+7 days\')</code>, <code>date(\'now\', \'-1 month\')</code>.'],
    [/\bDATEDIFF\s*\(/i, 'DATEDIFF', 'Tage zwischen zwei Daten: <code>julianday(ende) - julianday(start)</code>.'],
    [/\bLEN\s*\(/i, 'LEN()', 'In SQLite: <code>length(text)</code>.'],
    [/\b(YEAR|MONTH|DAY|DATEPART)\s*\(/i, 'YEAR()/MONTH()', 'Datumsteile in SQLite: <code>strftime(\'%Y\', datum)</code>, <code>strftime(\'%m\', datum)</code> – Ergebnis ist Text, ggf. <code>CAST(… AS INTEGER)</code>.'],
    [/\bCHARINDEX\s*\(/i, 'CHARINDEX', 'In SQLite: <code>instr(text, suche)</code> – Achtung, umgekehrte Reihenfolge der Argumente.'],
    [/\bCONVERT\s*\(/i, 'CONVERT', 'In SQLite nur <code>CAST(wert AS TEXT|INTEGER|REAL)</code>.'],
    [/\bOFFSET\s+\d+\s+ROWS?\b|\bFETCH\s+(NEXT|FIRST)\b/i, 'OFFSET … FETCH', 'In SQLite: <code>LIMIT 10 OFFSET 20</code>.'],
    [/\bBEGIN\s+TRAN\b|\bCOMMIT\s+TRAN\b|\bROLLBACK\s+TRAN\b/i, 'BEGIN TRAN', 'In SQLite: <code>BEGIN;</code> … <code>COMMIT;</code> bzw. <code>ROLLBACK;</code> (TRANSACTION ausgeschrieben geht auch).'],
    [/^\s*GO\s*;?\s*$/im, 'GO', '<code>GO</code> ist kein SQL, sondern ein Batch-Trenner von SSMS/sqlcmd. In SQLite einfach weglassen und Anweisungen mit <code>;</code> trennen.'],
    [/\bDECLARE\s+@|@\w+/i, '@Variablen', 'SQLite hat keine Variablen wie <code>@x</code>. Werte direkt einsetzen oder eine CTE (<code>WITH</code>) nutzen.'],
    [/\bSELECT\b[^;]*?\bINTO\s+\w+\s+FROM\b/i, 'SELECT … INTO', 'Neue Tabelle aus Abfrage in SQLite: <code>CREATE TABLE neu AS SELECT …;</code>'],
    [/\bCREATE\s+PROC(EDURE)?\b|\bEXEC(UTE)?\s+\w/i, 'Prozeduren', 'Gespeicherte Prozeduren gibt es in SQLite nicht (nur Trigger und Views).'],
    [/\bMERGE\b/i, 'MERGE', 'Upsert in SQLite: <code>INSERT … ON CONFLICT(spalte) DO UPDATE SET …</code>.'],
    [/\bTRUNCATE\s+TABLE\b/i, 'TRUNCATE', 'In SQLite: <code>DELETE FROM tabelle;</code> (ohne WHERE).'],
    [/\b(GRANT|REVOKE|DENY)\b/i, 'DCL', 'SQLite ist eine Datei-Datenbank ohne Benutzerverwaltung – GRANT/REVOKE (DCL) gibt es nur in Server-DBMS wie SQL Server.']
  ];
  function bereinigt(sql) {
    return String(sql || '').replace(/--[^\n]*/g, ' ').replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/'(?:[^']|'')*'/g, "'s'");
  }
  function tsqlHinweise(sql) {
    const s = bereinigt(sql);
    return TSQL.filter(([re]) => re.test(s)).map(([, name, txt]) => ({ name, txt }));
  }
  // Rekursive CTE ohne LIMIT und ohne Abbruchbedingung (WHERE/ON im rekursiven Teil) → Warnung vor Endlosschleife
  function rekursivOhneLimit(sql) {
    const s = bereinigt(sql);
    if (!/\bWITH\s+RECURSIVE\b/i.test(s) || /\bLIMIT\b/i.test(s)) return false;
    const re = /\bAS\s*\(/gi; let m;
    while ((m = re.exec(s))) {
      let tiefe = 1, i = re.lastIndex;
      for (; i < s.length && tiefe; i++) { if (s[i] === '(') tiefe++; else if (s[i] === ')') tiefe--; }
      const koerper = s.slice(re.lastIndex, i);
      const teile = koerper.split(/\bUNION\b/i);
      if (teile.length > 1 && !/\b(WHERE|ON)\b/i.test(teile.slice(1).join(' '))) return true;
    }
    return false;
  }

  // ---------- Highlighting ----------
  const KW = new Set(('SELECT FROM WHERE AND OR NOT IN IS NULL LIKE GLOB BETWEEN EXISTS AS ON JOIN LEFT RIGHT FULL INNER OUTER CROSS NATURAL USING GROUP BY HAVING ORDER ASC DESC LIMIT OFFSET DISTINCT ALL UNION INTERSECT EXCEPT ' +
    'INSERT INTO VALUES UPDATE SET DELETE CREATE TABLE VIEW INDEX UNIQUE TRIGGER DROP ALTER ADD COLUMN RENAME TO PRIMARY KEY FOREIGN REFERENCES DEFAULT CHECK CONSTRAINT AUTOINCREMENT IF ' +
    'BEGIN COMMIT ROLLBACK TRANSACTION SAVEPOINT RELEASE END CASE WHEN THEN ELSE WITH RECURSIVE OVER PARTITION ROWS RANGE CAST PRAGMA EXPLAIN QUERY PLAN REPLACE CONFLICT DO NOTHING ' +
    'INTEGER TEXT REAL BLOB NUMERIC TOP GO').split(' '));
  function hervorheben(sql) {
    const re = /(--[^\n]*|\/\*[\s\S]*?(?:\*\/|$))|('(?:[^']|'')*'?)|("(?:[^"]|"")*"?)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_][A-Za-z0-9_]*)(?=(\s*\()?)/g;
    let out = '', last = 0, m;
    const s = String(sql);
    while ((m = re.exec(s))) {
      out += E(s.slice(last, m.index)); last = re.lastIndex;
      if (m[1]) out += `<span class="sql-hk">${E(m[1])}</span>`;
      else if (m[2]) out += `<span class="sql-hs">${E(m[2])}</span>`;
      else if (m[3]) out += `<span class="sql-hi">${E(m[3])}</span>`;
      else if (m[4]) out += `<span class="sql-hz">${E(m[4])}</span>`;
      else if (m[5]) {
        const w = m[5].toUpperCase();
        out += KW.has(w) ? `<span class="sql-hw">${E(m[5])}</span>` : m[6] ? `<span class="sql-hf">${E(m[5])}</span>` : E(m[5]);
      }
      if (m[0] === '') re.lastIndex++;
    }
    return out + E(s.slice(last)) + '\n';
  }

  // ---------- Beispiele / Legende / T-SQL-Tabelle ----------
  const BEISPIELE = [
    ['SELECT', "SELECT vorname, nachname, position\nFROM mitarbeiter\nWHERE azubi = 1\nORDER BY nachname;"],
    ['JOIN', "SELECT m.vorname, m.nachname, a.name AS abteilung, s.stadt\nFROM mitarbeiter m\nLEFT JOIN abteilungen a ON a.abt_id = m.abt_id\nLEFT JOIN standorte s ON s.standort_id = a.standort_id\nORDER BY a.name, m.nachname;"],
    ['GROUP BY', "SELECT a.name AS abteilung, COUNT(*) AS anzahl, ROUND(AVG(m.gehalt), 2) AS schnitt\nFROM mitarbeiter m\nJOIN abteilungen a ON a.abt_id = m.abt_id\nGROUP BY a.name\nHAVING COUNT(*) >= 5\nORDER BY anzahl DESC;"],
    ['Subquery', "SELECT vorname, nachname, gehalt\nFROM mitarbeiter\nWHERE gehalt > (SELECT AVG(gehalt) FROM mitarbeiter WHERE azubi = 0)\nORDER BY gehalt DESC;"],
    ['INSERT', "INSERT INTO kunden (firma, branche, stadt, plz, ansprechpartner, email, seit)\nVALUES ('Beispiel Bau GmbH', 'Bau', 'Bremen', '28195', 'Eva Muster', 'info@beispiel-bau.example', date('now'));\n\nSELECT * FROM kunden ORDER BY kunde_id DESC LIMIT 3;"],
    ['UPDATE', "UPDATE artikel\nSET verkaufspreis = ROUND(verkaufspreis * 1.05, 2)\nWHERE kategorie = 'Lizenz';\n\nSELECT bezeichnung, verkaufspreis FROM artikel WHERE kategorie = 'Lizenz';"],
    ['DELETE', "-- Vorsicht: DELETE ohne WHERE löscht ALLE Zeilen!\nDELETE FROM zeiterfassung\nWHERE datum < '2025-01-15';\n\nSELECT COUNT(*) AS rest FROM zeiterfassung;"],
    ['CREATE', "CREATE TABLE IF NOT EXISTS schulungen (\n  schulung_id INTEGER PRIMARY KEY,\n  titel       TEXT NOT NULL,\n  datum       TEXT,\n  ma_id       INTEGER REFERENCES mitarbeiter(ma_id)\n);\n\nINSERT INTO schulungen (titel, datum, ma_id) VALUES ('SQL-Grundlagen', '2026-05-04', 1);\nSELECT * FROM schulungen;"],
    ['VIEW', "CREATE VIEW IF NOT EXISTS v_azubis AS\n  SELECT vorname, nachname, position, eintritt\n  FROM mitarbeiter\n  WHERE azubi = 1;\n\nSELECT * FROM v_azubis ORDER BY eintritt;"],
    ['INDEX', "CREATE INDEX IF NOT EXISTS idx_ze_datum ON zeiterfassung(datum);\n\nEXPLAIN QUERY PLAN\nSELECT * FROM zeiterfassung WHERE datum = '2025-03-03';"],
    ['Transaktion', "BEGIN;\nUPDATE mitarbeiter SET gehalt = gehalt + 100 WHERE ma_id = 2;\nSELECT ma_id, vorname, gehalt FROM mitarbeiter WHERE ma_id = 2;\nROLLBACK;  -- alles rückgängig (COMMIT würde festschreiben)\n\nSELECT ma_id, vorname, gehalt FROM mitarbeiter WHERE ma_id = 2;"]
  ];
  const TSQL_TABELLE = [
    ['Zeilen begrenzen', "SELECT … LIMIT 5", "SELECT TOP 5 … / OFFSET 0 ROWS FETCH NEXT 5 ROWS ONLY"],
    ['Aktuelles Datum', "date('now'), datetime('now','localtime'), CURRENT_TIMESTAMP", 'GETDATE(), SYSDATETIME()'],
    ['NULL ersetzen', 'IFNULL(a, b), COALESCE(a, b)', 'ISNULL(a, b), COALESCE(a, b)'],
    ['Texte verketten', "vorname || ' ' || nachname", "vorname + ' ' + nachname, CONCAT(…)"],
    ['Auto-Nummer', 'id INTEGER PRIMARY KEY [AUTOINCREMENT]', 'id INT IDENTITY(1,1) PRIMARY KEY'],
    ['Datentypen', 'TEXT, INTEGER, REAL, BLOB, NUMERIC (dynamisch, Typaffinität)', 'NVARCHAR(n), INT, DECIMAL(p,s), DATE, DATETIME2, BIT (streng)'],
    ['Datum rechnen', "date(d, '+7 days'), julianday(b) - julianday(a)", 'DATEADD(day, 7, d), DATEDIFF(day, a, b)'],
    ['Datumsteile', "strftime('%Y', d)", 'YEAR(d), MONTH(d), DATEPART(…)'],
    ['Textlänge / Suche', 'length(s), instr(s, x)', 'LEN(s), CHARINDEX(x, s)'],
    ['Transaktion', 'BEGIN; … COMMIT; / ROLLBACK;', 'BEGIN TRAN; … COMMIT TRAN; / ROLLBACK TRAN;'],
    ['Fremdschlüssel', 'PRAGMA foreign_keys = ON nötig (hier schon an)', 'immer aktiv'],
    ['Spalten ändern', 'ALTER TABLE … ADD/RENAME/DROP COLUMN (kein ALTER COLUMN)', 'ALTER TABLE … ALTER COLUMN …'],
    ['Tabelle aus Abfrage', 'CREATE TABLE neu AS SELECT …', 'SELECT … INTO neu FROM …'],
    ['Upsert', 'INSERT … ON CONFLICT DO UPDATE / INSERT OR REPLACE', 'MERGE …'],
    ['Variablen / Prozeduren', 'keine (nur Trigger, Views, CTEs)', 'DECLARE @x, CREATE PROCEDURE, EXEC'],
    ['Rechte (DCL)', 'keine – Zugriff über Dateirechte', 'GRANT / REVOKE / DENY, Logins, Rollen'],
    ['Batch-Trenner', '; genügt', 'GO (SSMS/sqlcmd)'],
    ['Bezeichner quoten', '"name" (auch [name])', '[name] (oder "name" mit QUOTED_IDENTIFIER)']
  ];
  const LEGENDE = [
    ['SQL (Structured Query Language)', 'Standardisierte Sprache, um relationale Datenbanken abzufragen und zu verändern.', 'Deklarativ: Man beschreibt WAS man haben will (SELECT … FROM … WHERE …), das DBMS entscheidet, WIE es die Daten holt (Ausführungsplan).', 'Immer, wenn Daten in Tabellen gespeichert, gesucht, ausgewertet oder geändert werden.', 'In jedem relationalen DBMS: SQLite (Datei), SQL Server, MySQL/MariaDB, PostgreSQL, Oracle – mit kleinen Dialekt-Unterschieden.', 'Eine Sprache für (fast) alle Datenbanken; mächtige Auswertungen mit wenigen Zeilen.'],
    ['DDL / DML / DCL / TCL', 'Die vier Befehlsgruppen von SQL.', 'DDL (Data Definition): CREATE, ALTER, DROP. DML (Data Manipulation): SELECT, INSERT, UPDATE, DELETE. DCL (Data Control): GRANT, REVOKE. TCL (Transaction Control): BEGIN, COMMIT, ROLLBACK, SAVEPOINT.', 'DDL beim Aufbau der Struktur, DML im Tagesgeschäft, DCL bei der Rechtevergabe, TCL wenn mehrere Änderungen zusammengehören.', 'In jedem SQL-DBMS; SQLite hat keine DCL (keine Benutzer).', 'Typische Prüfungsfrage (AP1/AP2): Befehle der richtigen Gruppe zuordnen.'],
    ['Primärschlüssel (PK)', 'Spalte(n), die jede Zeile eindeutig identifizieren – nie NULL, nie doppelt. 🔑 im ER-Diagramm.', 'PRIMARY KEY in CREATE TABLE; meist eine künstliche ID (ma_id), auch zusammengesetzt möglich (projekt_id, ma_id).', 'In jeder Tabelle – ohne PK keine sauberen Beziehungen.', 'In der Tabellendefinition; das DBMS legt automatisch einen eindeutigen Index an.', 'Eindeutige Identifikation, Grundlage für Fremdschlüssel und schnelle Suche.'],
    ['Fremdschlüssel (FK)', 'Spalte, die auf den Primärschlüssel einer anderen (oder derselben) Tabelle verweist.', 'REFERENCES tabelle(spalte); das DBMS prüft, dass der Wert existiert (referenzielle Integrität). In SQLite mit PRAGMA foreign_keys = ON.', 'Bei jeder 1:n-Beziehung (eine Abteilung – viele Mitarbeiter); n:m über eine Zwischentabelle (projekt_mitarbeiter).', 'Auf der n-Seite der Beziehung, z. B. mitarbeiter.abt_id.', 'Verhindert „verwaiste“ Datensätze, z. B. Bestellungen für nicht existierende Kunden.'],
    ['JOIN', 'Verknüpfung von Tabellen über gemeinsame Werte (meist FK = PK).', 'INNER JOIN liefert nur passende Paare; LEFT JOIN alle Zeilen der linken Tabelle, fehlende rechts als NULL; CROSS JOIN jede mit jeder.', 'Wenn die Information auf mehrere Tabellen verteilt ist (Mitarbeiter + Abteilungsname).', 'In der FROM-Klausel: FROM mitarbeiter m JOIN abteilungen a ON a.abt_id = m.abt_id.', 'Normalisierte Daten wieder zusammenführen, ohne sie doppelt zu speichern.'],
    ['GROUP BY / HAVING', 'Fasst Zeilen mit gleichen Werten zu Gruppen zusammen, auf die Aggregatfunktionen (COUNT, SUM, AVG, MIN, MAX) angewendet werden.', 'SELECT abt_id, COUNT(*) FROM mitarbeiter GROUP BY abt_id HAVING COUNT(*) > 5; – WHERE filtert vor dem Gruppieren, HAVING danach.', 'Für Auswertungen: Anzahl pro Abteilung, Umsatz pro Kunde, Stunden pro Projekt.', 'Nach WHERE, vor ORDER BY.', 'Kennzahlen direkt in der Datenbank berechnen statt in Excel.'],
    ['View (Sicht)', 'Gespeicherte Abfrage, die wie eine (virtuelle) Tabelle benutzt werden kann.', 'CREATE VIEW v_azubis AS SELECT …; danach SELECT * FROM v_azubis.', 'Für häufig gebrauchte, komplexe Abfragen oder um nur bestimmte Spalten freizugeben (z. B. ohne Gehalt).', 'Im Schema der Datenbank (sqlite_master, type = \'view\').', 'Vereinfachung, Wiederverwendung und Datenschutz (Zugriff nur auf die Sicht).'],
    ['Index', 'Zusätzliche, sortierte Suchstruktur (B-Baum) über einer oder mehreren Spalten.', 'CREATE INDEX idx_name ON tabelle(spalte); mit EXPLAIN QUERY PLAN sieht man, ob er genutzt wird (SEARCH … USING INDEX statt SCAN).', 'Bei Spalten, nach denen oft gesucht, gejoint oder sortiert wird (FKs, Datum).', 'Im Schema neben der Tabelle; PK und UNIQUE erzeugen automatisch einen Index.', 'Beschleunigt Lesen stark; kostet Speicher und macht INSERT/UPDATE etwas langsamer.'],
    ['Transaktion / ACID', 'Folge von Anweisungen, die ganz oder gar nicht ausgeführt wird.', 'BEGIN; … COMMIT; (festschreiben) oder ROLLBACK; (verwerfen). ACID: Atomarität, Konsistenz, Isolation, Dauerhaftigkeit.', 'Wenn mehrere Änderungen zusammengehören, z. B. Umbuchung: Betrag hier abziehen UND dort gutschreiben.', 'Im DBMS (Transaktions-Log/Journal); ohne BEGIN gilt Autocommit je Anweisung.', 'Keine halben Änderungen bei Fehlern oder Absturz – die Daten bleiben konsistent.'],
    ['Normalisierung', 'Aufteilen der Daten auf mehrere Tabellen, um Redundanz und Anomalien zu vermeiden.', '1. NF: atomare Werte; 2. NF: keine Abhängigkeit von nur einem Teil des Schlüssels; 3. NF: keine transitiven Abhängigkeiten (Nicht-Schlüssel hängt nicht von Nicht-Schlüssel ab).', 'Beim Datenbankentwurf (ER-Modell → Tabellen), bevor Daten erfasst werden.', 'Im Entwurf; hier z. B. Abteilungen und Standorte als eigene Tabellen statt Text in jeder Mitarbeiterzeile.', 'Verhindert Einfüge-, Änderungs- und Löschanomalien; Änderungen nur an einer Stelle.']
  ];

  // ---------- ER-Diagramm ----------
  const ER_LAYOUT = {
    standorte: [0, 0], bestellpositionen: [0, 1], artikel: [0, 2],
    abteilungen: [1, 0], bestellungen: [1, 1], kunden: [1, 2],
    mitarbeiter: [2, 0],
    projekte: [3, 0], projekt_mitarbeiter: [3, 1], zeiterfassung: [3, 2]
  };
  const BW = 232, KOPF = 28, ZH = 19, SPALT = 300, X0 = 40, Y0 = 12, LUECKE = 36;
  function erSvg() {
    const tabs = (window.FirmaDB && Array.isArray(FirmaDB.TABELLEN)) ? FirmaDB.TABELLEN : [];
    const pos = {}; const colY = {};
    let extraCol = 4;
    tabs.forEach(t => {
      const lay = ER_LAYOUT[t.name] || [extraCol, 9];
      const c = lay[0];
      const h = KOPF + t.spalten.length * ZH + 8;
      const y = colY[c] === undefined ? Y0 : colY[c];
      pos[t.name] = { x: X0 + c * SPALT, y, h, t };
      colY[c] = y + h + LUECKE;
    });
    const W = Math.max(...Object.values(pos).map(p => p.x + BW), 600) + 50;
    const H = Math.max(...Object.values(pos).map(p => p.y + p.h), 200) + 16;
    const zeileY = (p, spalte) => { const i = p.t.spalten.findIndex(s => s.name === spalte); return p.y + KOPF + (i < 0 ? 0 : i) * ZH + ZH / 2 + 2; };
    let linien = '';
    for (const t of tabs) {
      const a = pos[t.name];
      for (const s of t.spalten) {
        if (!s.fk) continue;
        const [zt, zs] = String(s.fk).split('.'); const b = pos[zt]; if (!b) continue;
        const y1 = zeileY(a, s.name), y2 = zeileY(b, zs);
        let d, l1, l2;
        if (a === b) {
          const x = a.x + BW;
          d = `M${x} ${y1} C${x + 42} ${y1}, ${x + 42} ${y2}, ${x} ${y2}`; l1 = [x + 8, y1 - 4]; l2 = [x + 8, y2 - 4];
        } else if (a.x === b.x) {
          const x = a.x;
          d = `M${x} ${y1} C${x - 34} ${y1}, ${x - 34} ${y2}, ${x} ${y2}`; l1 = [x - 12, y1 - 4]; l2 = [x - 12, y2 - 4];
        } else if (b.x > a.x) {
          const x1 = a.x + BW, x2 = b.x, dx = Math.max(30, (x2 - x1) / 2);
          d = `M${x1} ${y1} C${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`; l1 = [x1 + 9, y1 - 4]; l2 = [x2 - 9, y2 - 4];
        } else {
          const x1 = a.x, x2 = b.x + BW, dx = Math.max(30, (x1 - x2) / 2);
          d = `M${x1} ${y1} C${x1 - dx} ${y1}, ${x2 + dx} ${y2}, ${x2} ${y2}`; l1 = [x1 - 9, y1 - 4]; l2 = [x2 + 9, y2 - 4];
        }
        linien += `<g class="sql-er-fk" data-von="${E(t.name)}" data-nach="${E(zt)}"><path d="${d}"/><text x="${l1[0]}" y="${l1[1]}" class="sql-er-kard">n</text><text x="${l2[0]}" y="${l2[1]}" class="sql-er-kard">1</text><title>${E(t.name + '.' + s.name)} → ${E(s.fk)} (1:n)</title></g>`;
      }
    }
    let kaesten = '';
    for (const t of tabs) {
      const p = pos[t.name];
      let z = '';
      t.spalten.forEach((s, i) => {
        const y = p.y + KOPF + i * ZH + ZH / 2 + 6;
        const icon = s.pk ? '🔑' : s.fk ? '🔗' : '';
        z += `<text x="${p.x + 8}" y="${y}" class="sql-er-icon">${icon}</text><text x="${p.x + 28}" y="${y}" class="sql-er-sp${s.pk ? ' sql-er-pk' : ''}${s.fk ? ' sql-er-fkt' : ''}">${E(s.name)}${s.notNull && !s.pk ? '*' : ''}</text><text x="${p.x + BW - 8}" y="${y}" class="sql-er-typ">${E(s.typ || '')}</text>`;
      });
      kaesten += `<g class="sql-er-tab" data-tab="${E(t.name)}" tabindex="0" role="button" aria-label="Tabelle ${E(t.name)} anzeigen"><rect x="${p.x}" y="${p.y}" width="${BW}" height="${p.h}" rx="9" class="sql-er-rahmen"/><rect x="${p.x}" y="${p.y}" width="${BW}" height="${KOPF}" rx="9" class="sql-er-kopf"/><rect x="${p.x}" y="${p.y + KOPF - 9}" width="${BW}" height="9" class="sql-er-kopf"/><text x="${p.x + BW / 2}" y="${p.y + 19}" class="sql-er-name">${E(t.name)}</text>${z}<title>Klick: SELECT * FROM ${E(t.name)} LIMIT 20</title></g>`;
    }
    return `<svg id="sql-er-svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="ER-Diagramm der Firmen-Datenbank"><g class="sql-er-linien">${linien}</g>${kaesten}</svg>`;
  }

  // ---------- Live-Schema ----------
  function liveSchemaHtml() {
    if (!db) return '<p class="sql-leise">Datenbank wird geladen …</p>';
    let r;
    try { r = db.exec("SELECT type, name, tbl_name FROM sqlite_master WHERE name NOT LIKE 'sqlite_%' ORDER BY type, name;"); } catch (e) { return `<p class="sql-leise">Schema nicht lesbar: ${E(e.message || e)}</p>`; }
    const zeilen = r.length ? r[0].values : [];
    const basis = new Set(((window.FirmaDB && FirmaDB.TABELLEN) || []).map(t => t.name));
    const gruppen = { table: [], view: [], index: [], trigger: [] };
    zeilen.forEach(([typ, name, tbl]) => { (gruppen[typ] || (gruppen[typ] = [])).push({ name, tbl }); });
    const vorhanden = new Set(gruppen.table.map(x => x.name));
    const fehlend = [...basis].filter(n => !vorhanden.has(n));
    const chip = (x, typ) => {
      const neu = typ !== 'table' || !basis.has(x.name);
      const ziel = typ === 'index' || typ === 'trigger' ? x.tbl : x.name;
      return `<button class="glas sql-chip${neu ? ' sql-chip-neu' : ''}" data-a="schema" data-typ="${typ}" data-name="${E(x.name)}" data-ziel="${E(ziel)}" title="${typ === 'index' ? 'Index auf ' + E(x.tbl) : typ === 'trigger' ? 'Trigger auf ' + E(x.tbl) : 'Inhalt anzeigen'}">${typ === 'view' ? '👁 ' : typ === 'index' ? '⚡ ' : typ === 'trigger' ? '⚙ ' : ''}${E(x.name)}${neu ? ' <small>neu</small>' : ''}</button>`;
    };
    const grp = (titel, typ) => gruppen[typ] && gruppen[typ].length ? `<div class="sql-schema-g"><b>${titel} (${gruppen[typ].length})</b><div class="sql-chips">${gruppen[typ].map(x => chip(x, typ)).join('')}</div></div>` : '';
    return `${grp('Tabellen', 'table')}${grp('Views', 'view')}${grp('Indizes', 'index')}${grp('Trigger', 'trigger')}
      ${!gruppen.view.length && !gruppen.index.length ? '<p class="sql-leise klein">Noch keine eigenen Views oder Indizes – probiere die Beispiele „VIEW“ und „INDEX“.</p>' : ''}
      ${fehlend.length ? `<p class="sql-warn klein">Gelöscht: ${fehlend.map(E).join(', ')} – „Datenbank zurücksetzen“ stellt sie wieder her.</p>` : ''}`;
  }

  // ---------- Ergebnis-Darstellung ----------
  const istZahl = v => typeof v === 'number' || typeof v === 'bigint';
  function zelle(v) {
    if (v === null || v === undefined) return '<td class="sql-null">NULL</td>';
    if (istZahl(v)) return `<td class="sql-zahl">${E(String(v))}</td>`;
    if (v instanceof Uint8Array) return `<td class="sql-null">BLOB (${v.length} Byte)</td>`;
    const s = String(v);
    return `<td title="${s.length > 60 ? E(s) : ''}">${E(s.length > 200 ? s.slice(0, 200) + '…' : s)}</td>`;
  }
  function tabelleHtml(e, nr, anz, animiert) {
    const zeigen = e.values.slice(0, MAX_ZEIGEN);
    const kopf = `<div class="sql-erg-kopf"><b>${anz > 1 ? `Ergebnis ${nr}` : 'Ergebnis'}</b> · <span class="sql-anz">${e.abgebrochen ? 'mehr als ' + MAX_ZAEHLEN.toLocaleString('de-DE') : e.gesamt.toLocaleString('de-DE')} Zeile${e.gesamt === 1 ? '' : 'n'}</span> · ${e.columns.length} Spalte${e.columns.length === 1 ? '' : 'n'}</div>`;
    const zeilen = zeigen.map((r, i) => `<tr class="${animiert ? 'sql-z' : ''}" style="${animiert ? `animation-delay:${Math.min(i * 22, 1400)}ms` : ''}">${r.map(zelle).join('')}</tr>`).join('');
    const mehr = e.gesamt - zeigen.length;
    return `<div class="sql-erg">${kopf}<div class="sql-tw"><table class="sql-tab"><thead><tr>${e.columns.map(c => `<th>${E(c)}</th>`).join('')}</tr></thead><tbody>${zeilen || `<tr><td colspan="${Math.max(1, e.columns.length)}" class="sql-leise">(keine Zeilen)</td></tr>`}</tbody></table></div>
      ${mehr > 0 ? `<p class="sql-leise klein sql-mehr">… ${e.abgebrochen ? 'sehr viele' : mehr.toLocaleString('de-DE')} weitere Zeile${mehr === 1 ? '' : 'n'} (angezeigt werden max. ${MAX_ZEIGEN}${e.abgebrochen ? '; Abfrage nach ' + MAX_ZAEHLEN.toLocaleString('de-DE') + ' Zeilen abgebrochen – nutze LIMIT oder WHERE' : ''}).</p>` : ''}</div>`;
  }
  function fehlerHtml(msg, sql) {
    const u = uebersetzeFehler(msg);
    const ts = tsqlHinweise(sql);
    return `<div class="sql-fehler" role="alert"><div class="sql-fehler-orig">✗ <code>${E(msg)}</code></div>
      <p class="sql-fehler-text"><b>Was heißt das?</b> ${u.text}</p><p class="sql-fehler-tipp"><b>Tipp:</b> ${u.tipp}</p>
      ${ts.length ? `<div class="sql-tsql-hin"><b>T-SQL erkannt:</b><ul>${ts.map(h => `<li><b>${E(h.name)}:</b> ${h.txt}</li>`).join('')}</ul></div>` : ''}</div>`;
  }
  function ergebnisHtml(r, sql) {
    const meta = `<div class="sql-meta"><span>⏱ ${String(r.ms).replace('.', ',')} ms</span>${txOffen ? '<span class="sql-badge sql-badge-tx">Transaktion offen</span>' : ''}</div>`;
    let o = '';
    if (r.geaendert > 0) o += `<div class="sql-geaendert sql-blitz">✓ ${r.geaendert.toLocaleString('de-DE')} Zeile${r.geaendert === 1 ? '' : 'n'} geändert</div>`;
    else if (r.ddl && r.ok) o += '<div class="sql-geaendert sql-blitz">✓ Struktur geändert (DDL ausgeführt)</div>';
    o += r.ergebnisse.map((e, i) => tabelleHtml(e, i + 1, r.ergebnisse.length, true)).join('');
    if (r.ok && !r.ergebnisse.length && !r.geaendert && !r.ddl) o += '<p class="sql-leise">✓ Ausgeführt – die Anweisung liefert keine Ergebniszeilen.</p>';
    if (!r.ok) o += fehlerHtml(r.fehler, sql);
    return meta + o;
  }
  function zeigeMeldung(art, html) {
    const z = el('sql-ergebnis-inhalt'); if (!z) return;
    z.innerHTML = `<div class="${art === 'ok' ? 'sql-geaendert' : art === 'warn' ? 'sql-warnbox' : 'sql-fehler'}">${html}</div>`;
  }

  // ---------- Ausführen ----------
  function editorText() { const t = el('sql-editor'); return t ? t.value : P().editor; }
  function setzeEditor(txt, fokus) {
    const t = el('sql-editor'); if (!t) return;
    t.value = txt; P().editor = txt; speichern(); editorAktualisieren();
    if (fokus) { try { t.focus({ preventScroll: true }); } catch (e) { /* egal */ } }
  }
  function verlaufDazu(sql) {
    P().editor = editorText();
    const s = sql.trim(); if (!s || s.length > 20000) return;
    const v = P().verlauf.filter(x => x !== s); v.unshift(s); P().verlauf = v.slice(0, VERLAUF_MAX);
    const box = el('sql-verlauf'); if (box) box.outerHTML = verlaufHtml();
  }
  function nachAusfuehrung(r) {
    if (r.geaendert > 0 || r.ddl) dirty = true;
    const vorTx = txOffen;
    txOffen = transaktionOffen(db);
    if (dirty && (!txOffen || vorTx !== txOffen)) planeSpeichern();
    if (r.ddl) schemaZeigen();
    statusZeigen();
  }
  function ausfuehren(trotzdem) {
    if (!bereit || !db) { toast('Die Datenbank lädt noch …'); return null; }
    const sql = editorText();
    if (!sql.trim()) { toast('Schreib zuerst eine SQL-Anweisung in den Editor.'); return null; }
    if (!trotzdem && rekursivOhneLimit(sql)) {
      wartendWarnung = sql;
      zeigeMeldung('warn', `⚠ <b>WITH RECURSIVE ohne LIMIT</b> – eine rekursive CTE ohne Abbruchbedingung läuft endlos und würde die App einfrieren. Füge eine Bedingung (z. B. <code>WHERE n &lt; 10</code>) oder <code>LIMIT</code> hinzu. <div class="sql-knoepfe"><button class="glas knopf klein" data-a="trotzdem">Trotzdem ausführen</button></div>`);
      return null;
    }
    wartendWarnung = null;
    const r = fuehreAus(db, sql);
    if (r.ok && r.geaendert > 0) zuletztAusgefuehrt = sql.trim();
    verlaufDazu(sql); speichern();
    nachAusfuehrung(r);
    const z = el('sql-ergebnis-inhalt');
    if (z) {
      z.innerHTML = ergebnisHtml(r, sql);
      const b = z.querySelector('.sql-blitz'); if (b) timer(() => b.classList.remove('sql-blitz'), 1600);
    }
    return r;
  }

  // ---------- Aufgaben prüfen ----------
  async function referenz() {
    if (!refDb) refDb = await SqlKern.neueDb();
    return refDb;
  }
  async function soll(a) {
    const key = a.id + '\u0000' + a.loesung + '\u0000' + (a.pruefSql || '');
    if (sollCache[key]) return sollCache[key];
    let r;
    if (a.art === 'abfrage') {
      const d = await referenz();
      try { d.exec('SAVEPOINT nz_pruef;'); } catch (e) { /* egal */ }
      r = fuehreAus(d, a.loesung, 100000);
      try { d.exec('ROLLBACK TO nz_pruef; RELEASE nz_pruef;'); } catch (e) { /* egal */ }
    } else {
      const d = await SqlKern.neueDb();
      try {
        const l = fuehreAus(d, a.loesung, 100000);
        r = l.ok ? fuehreAus(d, a.pruefSql, 100000) : l;
      } finally { try { d.close(); } catch (e) { /* egal */ } }
    }
    if (!r.ok) throw new Error('Musterlösung von ' + a.id + ' ist fehlerhaft: ' + r.fehler);
    sollCache[key] = r;
    return r;
  }
  function sortSchl(z) { return JSON.stringify(z.map(v => v === null || v === undefined ? [0] : istZahl(v) ? [1, Math.round(Number(v) * 100) / 100] : [2, String(v)])); }
  function sortiert(werte) { return werte.map(r => [sortSchl(r), r]).sort((x, y) => (x[0] < y[0] ? -1 : x[0] > y[0] ? 1 : 0)).map(x => x[1]); }
  const zellText = v => v === null || v === undefined ? 'NULL' : v instanceof Uint8Array ? 'BLOB' : String(v);
  function gleicheZelle(a, b) {
    if (a === null || a === undefined || b === null || b === undefined) return (a == null) && (b == null);
    if (istZahl(a) || istZahl(b)) { const x = Number(a), y = Number(b); return !isNaN(x) && !isNaN(y) && Math.abs(x - y) <= 0.005 + 1e-9; }
    return String(a) === String(b);
  }
  function diffHtml(a, ist, sl) {
    const i = letzte(ist), s = letzte(sl);
    const teile = [];
    teile.push(`<li>Zeilen: Soll <b>${s.values.length}</b> · Ist <b>${i.values.length}</b> ${s.values.length === i.values.length ? '✓' : '✗'}</li>`);
    teile.push(`<li>Spalten: Soll <b>${s.columns.length}</b> · Ist <b>${i.columns.length}</b> ${s.columns.length === i.columns.length ? '✓' : '✗'}</li>`);
    if (a.spaltenNamen) {
      const ok = s.columns.length === i.columns.length && s.columns.every((c, k) => String(c).toLowerCase() === String(i.columns[k]).toLowerCase());
      teile.push(`<li>Spaltennamen/Aliase: Soll <code>${E(s.columns.join(', '))}</code> · Ist <code>${E(i.columns.join(', ') || '–')}</code> ${ok ? '✓' : '✗'}</li>`);
    }
    if (s.columns.length === i.columns.length && i.columns.length) {
      const zs = a.reihenfolge ? s.values : sortiert(s.values), zi = a.reihenfolge ? i.values : sortiert(i.values);
      const n = Math.max(zs.length, zi.length);
      for (let k = 0; k < n; k++) {
        const x = zs[k], y = zi[k];
        if (x && y && x.length === y.length && x.every((v, j) => gleicheZelle(v, y[j]))) continue;
        teile.push(`<li>Erste abweichende Zeile${a.reihenfolge ? '' : ' (nach Sortierung)'}: Nr. ${k + 1}<div class="sql-tw"><table class="sql-tab sql-diff"><tbody>
          <tr><th>Soll</th>${x ? x.map(v => `<td>${E(zellText(v))}</td>`).join('') : '<td class="sql-leise">(keine Zeile mehr)</td>'}</tr>
          <tr><th>Ist</th>${y ? y.map((v, j) => `<td class="${x && !gleicheZelle(v, x[j]) ? 'sql-falsch' : ''}">${E(zellText(v))}</td>`).join('') : '<td class="sql-leise">(keine Zeile mehr)</td>'}</tr></tbody></table></div></li>`);
        break;
      }
      if (a.reihenfolge && s.values.length === i.values.length && CMP(sortiert(s.values), sortiert(i.values))) teile.push('<li>Die Zeilen stimmen, aber die <b>Reihenfolge</b> nicht – prüfe ORDER BY.</li>');
    }
    if (!i.columns.length) teile.push('<li>Deine Anweisung liefert keine Ergebnismenge.</li>');
    return `<ul class="sql-diffliste">${teile.join('')}</ul>`;
  }
  const CMP = (za, zb) => za.length === zb.length && za.every((r, k) => r.length === zb[k].length && r.every((v, j) => gleicheZelle(v, zb[k][j])));

  async function pruefen(trotzdem) {
    const a = aufgabeVon(akt);
    if (!a) return;
    if (!bereit || !db) { toast('Die Datenbank lädt noch …'); return; }
    const sql = editorText();
    if (!sql.trim()) { toast('Schreib zuerst deine Lösung in den Editor.'); return; }
    const fb = el('sql-fb');
    if (fb) fb.innerHTML = '<p class="sql-leise">⏳ Prüfe …</p>';
    let ist, sl, vorher = null;
    try {
      if (a.art === 'abfrage') {
        if (!trotzdem && rekursivOhneLimit(sql)) { if (fb) fb.innerHTML = `<div class="sql-warnbox">⚠ <b>WITH RECURSIVE ohne LIMIT/Abbruchbedingung</b> – das könnte endlos laufen. <div class="sql-knoepfe"><button class="glas knopf klein" data-a="trotzdem-pruefen">Trotzdem prüfen</button></div></div>`; return; }
        ist = fuehreAus(db, sql, 100000);
        verlaufDazu(sql); nachAusfuehrung(ist);
        const z = el('sql-ergebnis-inhalt'); if (z) z.innerHTML = ergebnisHtml(ist, sql);
        if (!ist.ok) return fehlversuch(a, `<p>Deine Abfrage hat einen Fehler – siehe Ergebnisbereich.</p>`);
      } else {
        // Änderung nur ausführen, wenn sie nicht gerade schon ausgeführt wurde
        if (sql.trim() !== zuletztAusgefuehrt) {
          vorher = fuehreAus(db, sql);
          verlaufDazu(sql); nachAusfuehrung(vorher);
          if (vorher.ok && vorher.geaendert > 0) zuletztAusgefuehrt = sql.trim();
          const z = el('sql-ergebnis-inhalt'); if (z) z.innerHTML = ergebnisHtml(vorher, sql);
        }
        ist = fuehreAus(db, a.pruefSql, 100000);
      }
      sl = await soll(a);
    } catch (e) {
      console.warn('SQL-Labor: Prüfung', e);
      if (fb) fb.innerHTML = `<div class="sql-fehler">Prüfung nicht möglich: ${E(e.message || e)}</div>`;
      return;
    }
    if (!aktiv() || akt !== a.id) return;
    let gut = SqlKern.vergleiche(letzte(ist), letzte(sl), { reihenfolge: !!a.reihenfolge });
    if (gut && a.spaltenNamen) { const i = letzte(ist).columns, s = letzte(sl).columns; gut = i.length === s.length && i.every((c, k) => String(c).toLowerCase() === String(s[k]).toLowerCase()); }
    if (gut) return geloest(a);
    let extra = '';
    if (a.art === 'abfrage' && (P().db || dirty)) extra = '<p class="klein sql-leise">Hinweis: Das Soll wird auf der <b>Original-DB</b> berechnet. Hast du Daten verändert, kann dein Ergebnis deshalb abweichen – dann „Datenbank zurücksetzen“.</p>';
    if (a.art === 'aenderung') {
      if (vorher && !vorher.ok) extra += `<p>Deine Anweisung hat einen Fehler gemeldet (siehe Ergebnis).</p>`;
      if (!ist.ok) extra += `<p>Die Kontrollabfrage scheitert auf deiner DB: <code>${E(ist.fehler)}</code> – ${uebersetzeFehler(ist.fehler).text}</p>`;
      extra += '<p class="klein sql-leise">Geprüft wird mit <code>' + E(a.pruefSql) + '</code> auf deiner Arbeits-DB. Lief deine Änderung doppelt oder falsch, setze die Datenbank zurück und führe sie einmal korrekt aus.</p>';
    }
    fehlversuch(a, diffHtml(a, ist, sl) + extra);
  }
  function fehlversuch(a, html) {
    fehl[a.id] = (fehl[a.id] || 0) + 1;
    const fb = el('sql-fb');
    if (fb) fb.innerHTML = `<div class="sql-falschbox"><b>Noch nicht richtig</b> (Versuch ${fehl[a.id]}).${html}</div>`;
    aufgabeZeigen(true);
    try { if (window.ton) ton('schlecht'); } catch (e) { /* egal */ }
  }
  function geloest(a) {
    const g = P().geloest, erstes = !g[a.id];
    if (erstes) { g[a.id] = datumHeute(); melde('sql', 1); }
    speichern();
    try { if (window.Mot && Mot.konfetti) Mot.konfetti(60); } catch (e) { /* egal */ }
    try { if (window.ton) ton('gut'); } catch (e) { /* egal */ }
    toast(erstes ? `✓ Gelöst: ${a.titel || a.id}${alleGeloest() ? ' – alle Aufgaben geschafft! 🏆' : ''}` : `✓ Wieder richtig: ${a.titel || a.id}`, 'gold');
    const fb = el('sql-fb');
    if (fb) fb.innerHTML = `<div class="sql-gutbox"><b>✓ Richtig – ${E(a.titel || a.id)}</b>${a.erklaerung ? `<p>${inl(a.erklaerung)}</p>` : ''}${a.tsql ? `<p class="klein"><b>T-SQL:</b> ${inl(a.tsql)}</p>` : ''}</div>`;
    akt = naechsteOffen(a.id);
    aufgabeZeigen(false); listeZeigen();
  }

  // ---------- Rendering ----------
  function statusZeigen() {
    const s = el('sql-status'); if (!s) return;
    if (ladeFehler) { s.innerHTML = ''; return; }
    if (!bereit) { s.innerHTML = '<span class="sql-badge">⏳ lädt …</span>'; return; }
    const m = SqlKern.modus();
    s.innerHTML = `<span class="sql-badge sql-badge-ok">SQLite bereit · ${m === 'asm' ? 'asm.js' : 'WebAssembly'}</span>
      <span class="sql-badge">${P().db || dirty ? 'Arbeits-DB verändert' : 'Original-DB'}</span>
      ${txOffen ? '<span class="sql-badge sql-badge-tx">Transaktion offen – COMMIT oder ROLLBACK</span>' : ''}
      ${groesseWarnung ? '<span class="sql-badge sql-badge-tx">DB &gt; 3 MB – wird nicht gespeichert</span>' : ''}`;
  }
  function schemaZeigen() { const s = el('sql-live'); if (s) s.innerHTML = liveSchemaHtml(); }
  function verlaufHtml() {
    const v = P().verlauf;
    return `<details id="sql-verlauf" class="sql-det"><summary>Verlauf (${v.length})</summary>${v.length ? `<ol class="sql-verlauf-liste">${v.map((x, i) => `<li><button class="sql-vl" data-a="verlauf" data-i="${i}" title="In den Editor laden"><code>${E(x.length > 160 ? x.slice(0, 160) + ' …' : x)}</code></button></li>`).join('')}</ol>` : '<p class="sql-leise klein">Noch keine Abfragen.</p>'}</details>`;
  }
  function editorAktualisieren() {
    const t = el('sql-editor'), h = el('sql-hl'); if (!t || !h) return;
    h.innerHTML = hervorheben(t.value);
    t.style.height = 'auto';
    t.style.height = Math.max(150, t.scrollHeight + 2) + 'px';
  }
  function tsqlLive() {
    const z = el('sql-tsql-live'); if (!z) return;
    const ts = tsqlHinweise(editorText());
    z.innerHTML = ts.length ? `<div class="sql-tsql-hin"><b>💡 T-SQL-Syntax erkannt – so heißt es in SQLite:</b><ul>${ts.map(h => `<li><b>${E(h.name)}:</b> ${h.txt}</li>`).join('')}</ul></div>` : '';
  }
  function aufgabeZeigen(fehlerStand) {
    const z = el('sql-akt'); if (!z) return;
    const l = aufgaben();
    if (!l.length) { z.innerHTML = '<p class="sql-leise">Die Aufgabenreihe wird gerade vorbereitet. Bis dahin: Beispiele ausprobieren und die Firmen-DB erkunden!</p>'; return; }
    let a = aufgabeVon(akt); if (!a) { akt = naechsteOffen(null); a = aufgabeVon(akt); }
    const g = P().geloest, n = l.indexOf(a) + 1;
    const hs = Array.isArray(a.hinweise) ? a.hinweise : [];
    const st = Math.min(hStufe[a.id] || 0, hs.length);
    const loesungFrei = (fehl[a.id] || 0) >= 2 || (hs.length >= 2 && st >= 2) || (hs.length < 2 && st >= hs.length && st > 0) || !!g[a.id];
    z.innerHTML = `<div class="sql-a-kopf"><span class="sql-stufe sql-st${+a.stufe || 1}">${STUFEN[+a.stufe || 1] || 'leicht'}</span>${a.thema ? `<span class="sql-thema">${E(a.thema)}</span>` : ''}<span class="sql-leise">Aufgabe ${n}/${l.length}</span>${g[a.id] ? `<span class="sql-ok">✓ gelöst am ${E(g[a.id])}</span>` : ''}</div>
      <h3 class="sql-a-titel">${E(a.titel || a.id)}</h3>
      <p class="sql-a-text">${inl(a.text || '')}</p>
      <p class="klein sql-leise">${a.art === 'abfrage' ? 'Abfrage: dein Ergebnis wird mit dem der Musterlösung auf der Original-DB verglichen' + (a.reihenfolge ? ' (Reihenfolge zählt)' : '') + (a.spaltenNamen ? ' (Spaltennamen/Aliase zählen)' : '') + '.' : 'Änderung: deine Anweisung wird auf deiner Arbeits-DB ausgeführt und das Ergebnis anschließend kontrolliert.'}</p>
      <div class="sql-knoepfe">
        <button class="glas knopf primär" data-a="pruefen" id="sql-pruefen">✓ Prüfen</button>
        ${hs.length ? `<button class="glas knopf klein" data-a="hinweis" ${st >= hs.length ? 'disabled' : ''}>💡 Hinweis ${Math.min(st + 1, hs.length)}/${hs.length}</button>` : ''}
        <button class="glas knopf klein" data-a="loesung" ${loesungFrei ? '' : 'disabled title="Nach 2 Fehlversuchen oder dem 2. Hinweis"'}>🔓 Lösung zeigen</button>
        <button class="glas knopf klein" data-a="weiter">Nächste →</button>
      </div>
      ${st ? `<ol class="sql-hinweise">${hs.slice(0, st).map(h => `<li>${inl(h)}</li>`).join('')}</ol>` : ''}
      <div id="sql-loesung-box"></div>`;
    if (!fehlerStand) { /* nichts */ }
  }
  function listeZeigen() {
    const z = el('sql-liste'); if (!z) return;
    const l = aufgaben(), g = P().geloest;
    if (!l.length) { z.innerHTML = '<p class="sql-leise">Noch keine Aufgaben vorhanden.</p>'; return; }
    const ges = l.filter(a => g[a.id]).length;
    let o = `<div class="sql-fort"><b>${ges}/${l.length} gelöst</b><div class="sql-bar"><i style="width:${Math.round(ges / l.length * 100)}%"></i></div></div>`;
    for (const st of [1, 2, 3]) {
      const grp = l.filter(a => (+a.stufe || 1) === st); if (!grp.length) continue;
      const n = grp.filter(a => g[a.id]).length;
      o += `<details class="sql-grp" ${grp.some(a => a.id === akt) ? 'open' : ''}><summary><span class="sql-stufe sql-st${st}">${STUFEN[st]}</span> <b>${n}/${grp.length}</b><span class="sql-bar sql-bar-k"><i style="width:${Math.round(n / grp.length * 100)}%"></i></span></summary>
        <ol class="sql-al">${grp.map(a => `<li><button class="sql-ai${a.id === akt ? ' sql-ai-akt' : ''}${g[a.id] ? ' sql-ai-ok' : ''}" data-a="waehle" data-aid="${E(a.id)}"><span>${g[a.id] ? '✓' : '○'}</span> <span class="sql-ai-t">${E(a.titel || a.id)}</span>${a.thema ? ` <small>${E(a.thema)}</small>` : ''}</button></li>`).join('')}</ol></details>`;
    }
    z.innerHTML = o;
  }
  function zeigeLadeFehler(e) {
    ladeFehler = e; bereit = false;
    const z = el('sql-ergebnis-inhalt');
    if (z) z.innerHTML = `<div class="sql-fehler" role="alert"><b>Die SQL-Engine konnte nicht gestartet werden.</b><p>${E(e && e.message || e)}</p><p class="klein">Das Labor braucht WebAssembly oder (Fallback) DecompressionStream – aktuelle Browser/Electron können beides. Der Rest der App funktioniert weiter.</p><button class="glas knopf klein" data-a="neu-laden">Erneut versuchen</button></div>`;
    statusZeigen();
  }

  function stil() {
    if (document.getElementById('sql-style')) return;
    const st = document.createElement('style'); st.id = 'sql-style';
    st.textContent = `
#sql-wurzel{min-width:0}
.sql-raster{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(0,1fr);gap:14px;margin:0 0 14px;align-items:start}
.sql-spalte{min-width:0;display:flex;flex-direction:column;gap:14px}
.sql-karte{background:var(--glas);border:1px solid var(--glas-rand);border-radius:var(--radius-klein);padding:12px 14px;margin:0 0 14px;min-width:0;overflow-wrap:anywhere}
.sql-spalte>.sql-karte{margin:0}
.sql-karte h2{margin:2px 0 10px;font-size:25px}
#sql-status{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 12px}
.sql-badge{display:inline-block;font-size:12.5px;border:1px solid var(--glas-rand);border-radius:12px;padding:1px 9px;color:var(--tinte-leise)}
.sql-badge-ok{border-color:var(--gruen);color:var(--gruen)}
.sql-badge-tx{border-color:var(--akzent);color:var(--akzent);animation:sql-puls 1.6s infinite}
.sql-lade{display:flex;align-items:center;gap:10px;color:var(--tinte-leise)}
.sql-spinner{width:18px;height:18px;border-radius:50%;border:3px solid var(--glas-rand);border-top-color:var(--akzent);animation:sql-dreh .8s linear infinite;flex:none}
.sql-ed{position:relative;border:1px solid var(--glas-rand);border-radius:8px;background:var(--code-bg);min-width:0}
.sql-ed:focus-within{outline:2px solid var(--akzent);outline-offset:1px}
#sql-hl,#sql-editor{margin:0;padding:10px 12px;font-family:var(--mono);font-size:14.5px;line-height:1.5;white-space:pre-wrap;overflow-wrap:anywhere;word-break:normal;tab-size:2;border:0;box-sizing:border-box;width:100%;letter-spacing:0}
#sql-hl{position:absolute;inset:0;pointer-events:none;color:var(--tinte);overflow:hidden}
#sql-editor{position:relative;display:block;background:transparent;color:transparent;caret-color:var(--akzent);resize:none;outline:none;min-height:150px;overflow:hidden}
#sql-editor::selection{background:rgba(126,224,255,.3);color:transparent}
#sql-editor::placeholder{color:var(--tinte-leise)}
.sql-hw{color:var(--akzent);font-weight:700}.sql-hs{color:var(--gruen)}.sql-hz{color:#f5a66b}.sql-hk{color:var(--tinte-leise);font-style:italic}.sql-hf{color:var(--blau)}.sql-hi{color:#f2a6c4}
.sql-knoepfe{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px;align-items:center}
.sql-knoepfe .knopf[disabled]{opacity:.45;cursor:not-allowed;transform:none}
.sql-tipp{font-size:12.5px;color:var(--tinte-leise)}
.sql-beisp{display:flex;flex-wrap:wrap;gap:5px;margin-top:8px}
.sql-chip{font-size:13px;padding:3px 10px;border-radius:14px}
.sql-chip small{font-size:10.5px;color:var(--gruen)}
.sql-chip-neu{border-color:var(--gruen)}
.sql-chips{display:flex;flex-wrap:wrap;gap:5px;margin:4px 0 8px}
.sql-det{border:1px solid var(--glas-rand);border-radius:8px;margin:8px 0 0;padding:6px 10px;background:var(--code-bg)}
.sql-det>summary{cursor:pointer}
.sql-verlauf-liste{margin:6px 0;padding-left:22px;max-height:260px;overflow:auto}
.sql-vl{background:none;border:0;color:var(--tinte);text-align:left;cursor:pointer;padding:3px 0;font:inherit;width:100%}
.sql-vl code{font-family:var(--mono);font-size:12.5px;white-space:pre-wrap;overflow-wrap:anywhere}
.sql-vl:hover code{color:var(--akzent)}
.sql-meta{display:flex;gap:10px;flex-wrap:wrap;font-size:13px;color:var(--tinte-leise);margin-bottom:6px}
.sql-erg{margin:8px 0 12px}
.sql-erg-kopf{font-size:14px;margin-bottom:4px}
.sql-tw{overflow-x:auto;max-width:100%;-webkit-overflow-scrolling:touch}
.sql-tab{border-collapse:collapse;font-size:13.5px;font-family:var(--mono)}
.sql-tab th,.sql-tab td{border-bottom:1px solid var(--glas-rand);padding:4px 9px;text-align:left;white-space:nowrap;max-width:340px;overflow:hidden;text-overflow:ellipsis}
.sql-tab th{background:var(--glas);font-family:var(--text);font-size:13px;position:sticky;top:0}
.sql-tab td.sql-zahl{text-align:right;font-variant-numeric:tabular-nums}
.sql-null{color:var(--tinte-leise);font-style:italic;opacity:.8}
.sql-z{animation:sql-ein .35s ease-out both}
.sql-tab tbody tr:hover{background:var(--glas)}
.sql-geaendert{border:1px solid var(--gruen);color:var(--gruen);border-radius:8px;padding:6px 10px;margin:6px 0;font-weight:700}
.sql-blitz{animation:sql-blitz 1.4s ease-out}
.sql-fehler{border:1px solid var(--rot);border-radius:8px;padding:8px 12px;margin:6px 0;background:rgba(255,100,110,.08)}
.sql-fehler-orig{color:var(--rot);font-weight:700}
.sql-fehler-orig code{font-family:var(--mono);font-size:13px}
.sql-fehler p{margin:6px 0}
.sql-warnbox{border:1px solid var(--akzent);border-radius:8px;padding:8px 12px;margin:6px 0}
.sql-tsql-hin{border-left:3px solid var(--blau);background:var(--code-bg);padding:6px 10px;border-radius:6px;margin:8px 0;font-size:14px}
.sql-tsql-hin ul{margin:4px 0;padding-left:20px}
.sql-tsql-hin code,.sql-fehler code,.sql-a-text code,.sql-hinweise code,.sql-gutbox code,.sql-falschbox code,.sql-leg code{font-family:var(--mono);font-size:.88em;background:var(--code-bg);padding:0 5px;border-radius:4px}
.sql-leise{color:var(--tinte-leise)}
.sql-warn{color:var(--akzent)}
.sql-ok{color:var(--gruen);font-weight:700}
.sql-a-kopf{display:flex;flex-wrap:wrap;gap:8px;align-items:center;font-size:13px}
.sql-a-titel{margin:8px 0 4px}
.sql-stufe{border-radius:10px;padding:0 8px;font-size:12px;border:1px solid}
.sql-st1{color:var(--gruen)}.sql-st2{color:var(--akzent)}.sql-st3{color:var(--rot)}
.sql-thema{border-radius:10px;padding:0 8px;font-size:12px;background:var(--code-bg)}
.sql-hinweise{margin:8px 0;padding-left:22px;font-size:14.5px}
.sql-hinweise li{margin:3px 0}
.sql-gutbox{border:1px solid var(--gruen);border-radius:8px;padding:8px 12px;margin:0 0 10px;background:rgba(120,230,150,.07);animation:sql-ein .4s ease-out}
.sql-gutbox b:first-child{color:var(--gruen)}
.sql-falschbox{border:1px solid var(--rot);border-radius:8px;padding:8px 12px;margin:0 0 10px;animation:sql-wackel .35s}
.sql-diffliste{margin:6px 0;padding-left:20px;font-size:14px}
.sql-diff th{font-family:var(--text)}
.sql-falsch{color:var(--rot);font-weight:700}
.sql-loesung pre{font-family:var(--mono);font-size:13.5px;background:var(--code-bg);border:1px solid var(--glas-rand);padding:8px 10px;border-radius:8px;white-space:pre-wrap;overflow-wrap:anywhere;margin:6px 0}
.sql-fort{margin:0 0 10px}
.sql-bar{display:block;height:8px;border-radius:6px;background:var(--glas-rand);overflow:hidden;margin-top:4px}
.sql-bar i{display:block;height:100%;background:var(--gruen);transition:width .4s}
.sql-bar-k{display:inline-block;width:90px;vertical-align:middle;margin:0 0 0 8px}
.sql-grp{border-top:1px dashed var(--glas-rand);padding:6px 0}
.sql-grp>summary{cursor:pointer;display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.sql-al{list-style:none;padding:0;margin:6px 0 0;display:flex;flex-direction:column;gap:3px}
.sql-ai{width:100%;text-align:left;background:none;border:1px solid transparent;border-radius:7px;color:var(--tinte);font:inherit;font-size:14.5px;padding:5px 8px;cursor:pointer;display:flex;gap:6px;align-items:baseline}
.sql-ai:hover{background:var(--glas-hover)}
.sql-ai small{color:var(--tinte-leise);margin-left:auto;font-size:11.5px;white-space:nowrap}
.sql-ai-t{min-width:0}
.sql-ai-akt{border-color:var(--akzent)}
.sql-ai-ok>span:first-child{color:var(--gruen)}
.sql-er-wrap{overflow-x:auto;max-width:100%;-webkit-overflow-scrolling:touch;border:1px solid var(--glas-rand);border-radius:8px;background:var(--code-bg);margin:8px 0}
#sql-er-svg{display:block;width:100%;min-width:900px;height:auto}
.sql-er-tab{cursor:pointer}
.sql-er-rahmen{fill:var(--grund2,#101828);stroke:var(--glas-rand);stroke-width:1.5}
.sql-er-kopf{fill:var(--akzent);opacity:.9}
.sql-er-tab:hover .sql-er-rahmen,.sql-er-tab:focus .sql-er-rahmen{stroke:var(--akzent);stroke-width:2.5}
.sql-er-tab:focus{outline:none}
.sql-er-name{fill:var(--grund2,#000);font:700 14px var(--text);text-anchor:middle}
.sql-er-sp{fill:var(--tinte);font:12.5px var(--mono)}
.sql-er-pk{font-weight:700;fill:var(--akzent)}
.sql-er-fkt{fill:var(--blau);font-style:italic}
.sql-er-typ{fill:var(--tinte-leise);font:10.5px var(--mono);text-anchor:end}
.sql-er-icon{font-size:11px}
.sql-er-fk path{fill:none;stroke:var(--blau);stroke-width:1.6;opacity:.75}
.sql-er-fk:hover path{stroke:var(--akzent);stroke-width:3;opacity:1}
.sql-er-kard{fill:var(--blau);font:700 12px var(--text);text-anchor:middle}
.sql-er-leg{font-size:13px;color:var(--tinte-leise)}
.sql-schema-g{font-size:14px}
.sql-tsql-tab{border-collapse:collapse;font-size:13.5px;min-width:620px}
.sql-tsql-tab th,.sql-tsql-tab td{border-bottom:1px solid var(--glas-rand);padding:5px 8px;text-align:left;vertical-align:top}
.sql-tsql-tab td code{font-family:var(--mono);font-size:12.5px}
.sql-leg ul{padding-left:18px}.sql-leg li{margin:4px 0}
@keyframes sql-ein{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:none}}
@keyframes sql-blitz{0%{background:rgba(120,230,150,.45);transform:scale(1.02)}100%{background:transparent;transform:none}}
@keyframes sql-puls{50%{opacity:.5}}
@keyframes sql-dreh{to{transform:rotate(360deg)}}
@keyframes sql-wackel{25%{transform:translateX(-4px)}75%{transform:translateX(4px)}}
[data-effekte="0"] .sql-z,[data-effekte="0"] .sql-blitz,[data-effekte="0"] .sql-gutbox,[data-effekte="0"] .sql-falschbox{animation:none}
@media (prefers-reduced-motion:reduce){.sql-z,.sql-blitz,.sql-gutbox,.sql-falschbox,.sql-badge-tx{animation:none}}
@media (max-width:820px){
 .sql-raster{grid-template-columns:minmax(0,1fr)}
 .sql-karte{padding:10px}
 #sql-hl,#sql-editor{font-size:13.5px}
 .sql-tab{font-size:12.5px}
 .sql-ai small{display:none}
}`;
    document.head.appendChild(st);
  }

  function geruest() {
    const p = P();
    return `<div id="sql-status"></div>
    <div class="sql-raster">
      <div class="sql-spalte">
        <section class="sql-karte" id="sql-edit-karte">
          <h2>Editor</h2>
          <div class="sql-ed"><pre id="sql-hl" aria-hidden="true"></pre><textarea id="sql-editor" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" aria-label="SQL-Editor" placeholder="SELECT * FROM mitarbeiter LIMIT 10;">${E(p.editor)}</textarea></div>
          <div class="sql-knoepfe">
            <button class="glas knopf primär" data-a="ausfuehren" id="sql-run" disabled>▶ Ausführen</button>
            <button class="glas knopf klein" data-a="leeren">Leeren</button>
            <span class="sql-tipp">Strg + Enter = Ausführen · Tab = 2 Leerzeichen · Esc, dann Tab = Editor verlassen</span>
          </div>
          <div class="sql-beisp" aria-label="Beispiele">${BEISPIELE.map(([n], i) => `<button class="glas sql-chip" data-a="beispiel" data-i="${i}">${E(n)}</button>`).join('')}</div>
          <div id="sql-tsql-live"></div>
          ${verlaufHtml()}
        </section>
        <section class="sql-karte" id="sql-ergebnis"><h2>Ergebnis</h2><div id="sql-ergebnis-inhalt" aria-live="polite"><div class="sql-lade"><span class="sql-spinner"></span> SQL-Engine und Firmen-Datenbank werden geladen …</div></div></section>
      </div>
      <div class="sql-spalte">
        <section class="sql-karte" id="sql-aufgabe"><h2>Aufgabe</h2><div id="sql-fb"></div><div id="sql-akt"></div></section>
        <section class="sql-karte" id="sql-aufgaben"><h2>Aufgabenreihe</h2><div id="sql-liste"></div></section>
      </div>
    </div>
    <details class="sql-karte abschnitt" id="sql-er-box"><summary>ER-Diagramm & Live-Schema</summary>
      <p class="sql-er-leg">Firmen-DB „Netzilon GmbH“: 🔑 Primärschlüssel · 🔗 Fremdschlüssel (blau) · * NOT NULL · Linien = Beziehung 1:n (die „n“-Seite trägt den Fremdschlüssel). Klick auf eine Tabelle zeigt ihren Inhalt.</p>
      <div class="sql-er-wrap" id="sql-er">${erSvg()}</div>
      <h3>Live-Schema deiner Arbeits-DB</h3><div id="sql-live"><p class="sql-leise">Datenbank wird geladen …</p></div>
    </details>
    <details class="sql-karte abschnitt" id="sql-tsql-panel"><summary>SQLite ↔ T-SQL (SQL Server)</summary>
      <p>In der Prüfung und im Betrieb begegnet dir oft Microsoft SQL Server (T-SQL). Das Labor nutzt SQLite – die Grundbefehle sind gleich, im Detail gibt es Unterschiede:</p>
      <div class="sql-tw"><table class="sql-tsql-tab"><thead><tr><th>Thema</th><th>SQLite (hier)</th><th>T-SQL (SQL Server)</th></tr></thead><tbody>${TSQL_TABELLE.map(([t, a, b]) => `<tr><td>${E(t)}</td><td><code>${E(a)}</code></td><td><code>${E(b)}</code></td></tr>`).join('')}</tbody></table></div>
      <p class="klein sql-leise">Tippst du T-SQL-Syntax (TOP, GETDATE(), ISNULL, + bei Texten, IDENTITY, NVARCHAR, DATEADD …), zeigt das Labor direkt unter dem Editor, wie es in SQLite heißt.</p>
    </details>
    <section class="sql-karte" id="sql-legende"><h2>Legende</h2>${LEGENDE.map(([b, was, wie, wann, wo, warum]) => `<details class="abschnitt sql-leg"><summary>${E(b)}</summary><div class="text"><ul><li><b>Was:</b> ${E(was)}</li><li><b>Wie:</b> ${E(wie)}</li><li><b>Wann:</b> ${E(wann)}</li><li><b>Wo:</b> ${E(wo)}</li><li><b>Warum:</b> ${E(warum)}</li></ul></div></details>`).join('')}</section>
    <div class="lesen-fuss"><button class="glas knopf" data-a="reset">Datenbank zurücksetzen</button><button class="glas knopf" data-go="werkzeuge">Zu den Werkzeugen</button></div>`;
  }

  // ---------- Ereignisse ----------
  function klick(e) {
    const t = e.target; if (!t.closest) return;
    const er = t.closest('.sql-er-tab');
    if (er) return tabelleZeigen(er.dataset.tab);
    const b = t.closest('[data-a]'); if (!b || b.disabled) return;
    const d = b.dataset;
    switch (d.a) {
      case 'ausfuehren': return void ausfuehren(false);
      case 'trotzdem': if (wartendWarnung !== null) { if (editorText() !== wartendWarnung) setzeEditor(wartendWarnung); ausfuehren(true); } return;
      case 'leeren': return setzeEditor('', true);
      case 'beispiel': { const x = BEISPIELE[+d.i]; if (x) setzeEditor(x[1], true); tsqlLive(); return; }
      case 'verlauf': { const v = P().verlauf[+d.i]; if (v !== undefined) { setzeEditor(v, true); tsqlLive(); } return; }
      case 'schema': {
        if (d.typ === 'index' || d.typ === 'trigger') { setzeEditor(`SELECT type, name, tbl_name, sql\nFROM sqlite_master\nWHERE name = '${String(d.name).replace(/'/g, "''")}';`, true); return void ausfuehren(false); }
        return tabelleZeigen(d.name);
      }
      case 'reset': return void zuruecksetzen();
      case 'neu-laden': return void starte();
      case 'pruefen': return void pruefen(false);
      case 'trotzdem-pruefen': return void pruefen(true);
      case 'hinweis': { const a = aufgabeVon(akt); if (!a) return; hStufe[a.id] = Math.min((hStufe[a.id] || 0) + 1, (a.hinweise || []).length); return aufgabeZeigen(); }
      case 'loesung': {
        const a = aufgabeVon(akt); const z = el('sql-loesung-box'); if (!a || !z) return;
        z.innerHTML = `<div class="sql-loesung"><b>Musterlösung:</b><pre>${hervorheben(a.loesung)}</pre>${a.art === 'aenderung' ? `<p class="klein sql-leise">Geprüft mit: <code>${E(a.pruefSql)}</code></p>` : ''}${a.erklaerung ? `<p class="klein">${inl(a.erklaerung)}</p>` : ''}<button class="glas knopf klein" data-a="uebernehmen">In den Editor übernehmen</button></div>`;
        return;
      }
      case 'uebernehmen': { const a = aufgabeVon(akt); if (a) setzeEditor(a.loesung, true); return; }
      case 'weiter': { akt = naechsteOffen(akt); const fb = el('sql-fb'); if (fb) fb.innerHTML = ''; aufgabeZeigen(); listeZeigen(); return; }
      case 'waehle': {
        akt = d.aid; const fb = el('sql-fb'); if (fb) fb.innerHTML = '';
        aufgabeZeigen(); listeZeigen();
        const k = el('sql-aufgabe'); if (k && k.scrollIntoView && istSchmal()) k.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }
  }
  function tabelleZeigen(name) {
    if (!name) return;
    const q = /^[A-Za-z_][A-Za-z0-9_]*$/.test(name) ? name : `"${String(name).replace(/"/g, '""')}"`;
    setzeEditor(`SELECT * FROM ${q} LIMIT 20;`, false);
    tsqlLive();
    if (bereit) ausfuehren(false);
    const k = el('sql-edit-karte'); if (k && k.scrollIntoView) k.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  let escGedrueckt = false, tsqlT = 0, editorT = 0;
  function taste(e) {
    if (e.target.id === 'sql-editor') {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); ausfuehren(false); return; }
      if (e.key === 'Escape') { escGedrueckt = true; return; }
      if (e.key === 'Tab' && !e.shiftKey && !e.ctrlKey && !e.altKey && !e.metaKey) {
        if (escGedrueckt) { escGedrueckt = false; return; }
        e.preventDefault();
        const t = e.target, a = t.selectionStart, b = t.selectionEnd;
        t.setRangeText('  ', a, b, 'end');
        eingabe();
        return;
      }
      escGedrueckt = false;
      return;
    }
    if ((e.key === 'Enter' || e.key === ' ') && e.target.classList && e.target.classList.contains('sql-er-tab')) { e.preventDefault(); tabelleZeigen(e.target.dataset.tab); }
  }
  function eingabe() {
    editorAktualisieren();
    clearTimeout(editorT); editorT = timer(() => { P().editor = editorText(); speichern(); }, 500);
    clearTimeout(tsqlT); tsqlT = timer(tsqlLive, 350);
  }

  // ---------- Start / Ansicht ----------
  async function starte() {
    ladeFehler = null; bereit = false;
    const z = el('sql-ergebnis-inhalt');
    if (z) z.innerHTML = '<div class="sql-lade"><span class="sql-spinner"></span> SQL-Engine und Firmen-Datenbank werden geladen …</div>';
    statusZeigen();
    try {
      ladeHinweis = await dbBereit();
    } catch (e) {
      console.warn('SQL-Labor: Laden fehlgeschlagen', e);
      if (aktiv()) zeigeLadeFehler(e); else ladeFehler = e;
      return;
    }
    bereit = true;
    if (!aktiv()) return;
    const w = el('sql-wurzel'); if (w) w.dataset.bereit = '1';
    const run = el('sql-run'); if (run) run.disabled = false;
    const z2 = el('sql-ergebnis-inhalt');
    if (z2) z2.innerHTML = (ladeHinweis ? `<div class="sql-warnbox">⚠ ${E(ladeHinweis)}</div>` : '') +
      `<p class="sql-leise">✓ Bereit. Die Firmen-DB „Netzilon GmbH“ hat 10 Tabellen (100 Mitarbeiter, 40 Kunden, 15 Projekte, 250 Bestellungen, 2000 Zeiteinträge). Schreib eine Abfrage und drück <b>Strg + Enter</b> – oder wähle ein Beispiel.</p>`;
    if (ladeHinweis) toast('Gespeicherte SQL-Datenbank war beschädigt – frische DB geladen.', 'rot');
    ladeHinweis = null;
    schemaZeigen(); statusZeigen();
  }
  function ansicht() {
    krumen([START, { txt: 'Werkzeuge', go: 'werkzeuge' }, { txt: 'SQL-Labor' }]);
    stil();
    stoppen();
    P();
    $('#inhalt').innerHTML = `<h1>SQL-Labor</h1>
      <p class="unter">Echtes SQLite – komplett offline – mit der Firmen-Datenbank der „Netzilon GmbH“. Abfragen schreiben, Daten ändern, Tabellen, Views und Indizes anlegen, Transaktionen testen und Aufgaben lösen. Kaputtmachen erlaubt: „Datenbank zurücksetzen“ stellt alles wieder her.</p>
      <div id="sql-wurzel">${geruest()}</div>`;
    const w = el('sql-wurzel');
    w.addEventListener('click', klick);
    w.addEventListener('keydown', taste);
    const t = el('sql-editor');
    t.addEventListener('input', eingabe);
    akt = aufgabeVon(akt) ? akt : naechsteOffen(null);
    editorAktualisieren(); tsqlLive(); aufgabeZeigen(); listeZeigen(); statusZeigen();
    // Verlassen der Ansicht erkennen → Timer stoppen, ausstehendes Speichern sofort erledigen
    try {
      const inh = $('#inhalt');
      beobachter = new MutationObserver(() => { if (!document.getElementById('sql-wurzel')) stoppen(); });
      beobachter.observe(inh, { childList: true });
    } catch (e) { /* egal */ }
    starte();
  }
  try { window.addEventListener('pagehide', () => { if (speicherT) sichernJetzt(); }); } catch (e) { /* egal */ }

  window.VIEWS = Object.assign(window.VIEWS || {}, { sql: ansicht });
  return {
    ansicht, alleGeloest, uebersetzeFehler, tsqlHinweise,
    _test: {
      bereit: () => bereit && !!db,
      db: () => db,
      fuehreAus: sql => fuehreAus(db, sql),
      sichernJetzt: () => { if (dirty) sichernJetzt(); },
      vergessen: () => { if (speicherT) sichernJetzt(); try { if (db) db.close(); } catch (e) { /* egal */ } db = null; dbRef = undefined; dirty = false; },
      laeuft: () => ({ ui: uiTimer.size, beobachter: !!beobachter }),
      akt: () => akt,
      aufgaben
    }
  };
})();
window.SqlLabor = SqlLabor;
