// Test des SQL-Kerns (app/sqldb.js) in Node ohne Browser: sql.js (WASM) + Firmen-Datenbank „Netzilon GmbH“
// Aufruf: node tools/test-sqldb.js
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.join(__dirname, '..');
let fails = 0; const ok = (c, m) => { console.log((c ? 'OK     ' : 'FEHLER ') + m); if (!c) fails++; };

const initSqlJs = require(path.join(root, 'app', 'vendor', 'sql-wasm.js'));
const binJs = fs.readFileSync(path.join(root, 'app', 'vendor', 'sql-wasm-bin.js'), 'utf8');
const b64 = (binJs.match(/NZ_SQL_WASM_B64\s*=\s*'([A-Za-z0-9+/=]+)'/) || [])[1];
if (!b64) { console.error('WASM-base64 nicht gefunden'); process.exit(1); }

// app/sqldb.js in einem vm-Kontext mit window-Objekt laden
const sandbox = { console, atob, btoa, performance, initSqlJs, NZ_SQL_WASM_B64: b64 };
sandbox.window = sandbox; sandbox.globalThis = sandbox;
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(root, 'app', 'sqldb.js'), 'utf8'), sandbox, { filename: 'sqldb.js' });
const { FirmaDB, SqlKern } = sandbox;

(async () => {
  ok(FirmaDB && SqlKern, 'FirmaDB und SqlKern am window');
  ok(typeof FirmaDB.SEED === 'number', 'SEED ist Zahl: ' + FirmaDB.SEED);
  for (const f of ['daten', 'mitarbeiter', 'schemaSql', 'datenSql']) ok(typeof FirmaDB[f] === 'function', 'FirmaDB.' + f);
  for (const f of ['laden', 'modus', 'neueDb', 'ausBase64', 'nachBase64', 'ausfuehren', 'vergleiche']) ok(typeof SqlKern[f] === 'function', 'SqlKern.' + f);
  ok(SqlKern.modus() === null, 'modus() vor laden() = null');

  const SQL = await SqlKern.laden();
  ok(SqlKern.modus() === 'wasm', 'laden() über WASM (Modus ' + SqlKern.modus() + ')');
  ok(SqlKern.laden() === SqlKern.laden(), 'laden() liefert gecachtes Promise');

  // Schema + Daten von Hand, um Fehler genau zu sehen
  const db = new SQL.Database();
  db.exec('PRAGMA foreign_keys = ON;');
  let fehler = null; try { db.exec(FirmaDB.schemaSql()); } catch (e) { fehler = e.message; }
  ok(!fehler, 'Schema anlegen ' + (fehler || ''));
  fehler = null; try { db.exec(FirmaDB.datenSql()); } catch (e) { fehler = e.message; }
  ok(!fehler, 'alle INSERTs mit foreign_keys=ON fehlerfrei ' + (fehler || ''));
  const q = sql => { const r = db.exec(sql); return r.length ? r[0].values : []; };
  const eins = sql => { const v = q(sql); return v.length ? v[0][0] : null; };
  ok(eins('PRAGMA foreign_keys') === 1, 'foreign_keys aktiv');
  ok(q('PRAGMA foreign_key_check').length === 0, 'PRAGMA foreign_key_check leer');
  ok(eins('PRAGMA integrity_check') === 'ok', 'integrity_check ok');

  // Tabellen / TABELLEN
  const tabs = q("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").map(r => r[0]);
  const erwartet = ['abteilungen', 'artikel', 'bestellpositionen', 'bestellungen', 'kunden', 'mitarbeiter', 'projekt_mitarbeiter', 'projekte', 'standorte', 'zeiterfassung'];
  ok(JSON.stringify(tabs) === JSON.stringify(erwartet), '10 Tabellen exakt nach Schema');
  ok(q("SELECT name FROM sqlite_master WHERE type='index' AND sql IS NOT NULL").length === 0, 'keine eigenen Indizes');
  let tabOk = FirmaDB.TABELLEN.length === 10;
  for (const t of FirmaDB.TABELLEN) {
    const info = q(`PRAGMA table_info(${t.name})`); // cid, name, type, notnull, dflt, pk
    const fks = q(`PRAGMA foreign_key_list(${t.name})`); // id, seq, table, from, to
    if (info.length !== t.spalten.length) { tabOk = false; console.log('  Spaltenzahl', t.name); }
    info.forEach((c, i) => {
      const s = t.spalten[i], fk = fks.find(f => f[3] === c[1]);
      if (!s || s.name !== c[1] || s.typ !== c[2] || s.pk !== (c[5] > 0) || s.fk !== (fk ? fk[2] + '.' + fk[4] : null)) { tabOk = false; console.log('  Abweichung', t.name, c[1], JSON.stringify(s)); }
      if (c[3] && !s.notNull) { tabOk = false; console.log('  notNull', t.name, c[1]); }
    });
  }
  ok(tabOk, 'TABELLEN passt zu PRAGMA table_info/foreign_key_list');

  // Mengen
  const n = t => eins(`SELECT COUNT(*) FROM ${t}`);
  const ca = (x, ziel) => x >= ziel * 0.9 && x <= ziel * 1.1;
  ok(n('mitarbeiter') === 100, 'SELECT COUNT(*) FROM mitarbeiter = ' + n('mitarbeiter'));
  ok(n('standorte') === 6, 'standorte = 6');
  ok(n('abteilungen') === 10, 'abteilungen = 10');
  ok(n('kunden') === 40, 'kunden = 40');
  ok(n('projekte') === 15, 'projekte = 15');
  ok(n('artikel') === 30, 'artikel = 30');
  ok(ca(n('bestellungen'), 250), 'bestellungen ~250: ' + n('bestellungen'));
  ok(ca(n('bestellpositionen'), 700), 'bestellpositionen ~700: ' + n('bestellpositionen'));
  ok(ca(n('zeiterfassung'), 2000), 'zeiterfassung ~2000: ' + n('zeiterfassung'));
  ok(n('projekt_mitarbeiter') >= 45, 'projekt_mitarbeiter: ' + n('projekt_mitarbeiter'));
  const az = eins('SELECT COUNT(*) FROM mitarbeiter WHERE azubi = 1');
  ok(az >= 7 && az <= 9, 'Azubis ~8: ' + az);
  ok(eins('SELECT COUNT(*) FROM mitarbeiter WHERE vorgesetzter_id IS NULL') === 1, 'genau 1 Mitarbeiter ohne Vorgesetzten');
  ok(/^Geschäftsführer/.test(eins('SELECT position FROM mitarbeiter WHERE vorgesetzter_id IS NULL')), 'der ohne Vorgesetzten ist Geschäftsführer/in');
  const aus = eins('SELECT COUNT(*) FROM mitarbeiter WHERE austritt IS NOT NULL');
  ok(aus >= 2 && aus <= 4, 'Austritte ~3: ' + aus);
  ok(eins('SELECT COUNT(*) FROM abteilungen WHERE leiter_id IS NULL') === 0, 'alle Abteilungen haben leiter_id');
  ok(eins('SELECT COUNT(*) FROM abteilungen a JOIN mitarbeiter m ON m.ma_id = a.leiter_id WHERE m.abt_id <> a.abt_id') === 0, 'Leiter gehört zur eigenen Abteilung');
  ok(eins(`SELECT COUNT(*) FROM abteilungen a JOIN mitarbeiter m ON m.ma_id = a.leiter_id
           WHERE a.name <> 'Geschäftsführung' AND m.vorgesetzter_id <> (SELECT ma_id FROM mitarbeiter WHERE vorgesetzter_id IS NULL)`) === 0, 'Abteilungsleiter → Geschäftsführer');
  ok(eins(`SELECT COUNT(*) FROM mitarbeiter m JOIN abteilungen a ON a.abt_id = m.abt_id
           WHERE m.azubi = 0 AND m.ma_id <> a.leiter_id AND m.vorgesetzter_id <> a.leiter_id`) === 0, 'Mitarbeiter → Abteilungsleiter');
  ok(eins("SELECT COUNT(*) FROM standorte WHERE stadt = 'Hamburg' AND standort_id = 1") === 1, 'Zentrale Hamburg');

  // Plausibilität
  ok(eins('SELECT COUNT(*) FROM mitarbeiter WHERE azubi = 1 AND (gehalt < 1000 OR gehalt > 1300)') === 0, 'Azubi-Vergütung 1.000–1.300 €');
  ok(eins('SELECT COUNT(*) FROM mitarbeiter WHERE azubi = 0 AND (gehalt < 2800 OR gehalt > 9500)') === 0, 'Gehälter 2.800–9.500 €');
  ok(eins("SELECT COUNT(*) FROM mitarbeiter WHERE vorgesetzter_id >= ma_id") === 0, 'Vorgesetzte vor Mitarbeitern angelegt');
  ok(eins('SELECT COUNT(*) FROM mitarbeiter WHERE austritt IS NOT NULL AND austritt <= eintritt') === 0, 'austritt nach eintritt');
  ok(eins("SELECT COUNT(*) FROM bestellungen WHERE datum < '2025-01-01' OR datum > '2026-03-31'") === 0, 'Bestelldaten 2025-01-01 … 2026-03-31');
  ok(eins("SELECT COUNT(*) FROM zeiterfassung WHERE datum < '2025-01-01' OR datum > '2026-03-31'") === 0, 'Zeiterfassung 2025-01-01 … 2026-03-31');
  ok(eins('SELECT MAX(stunden) FROM zeiterfassung') <= 12, 'Zeiterfassung ≤ 12 h je Eintrag');
  ok(eins('SELECT MAX(s) FROM (SELECT SUM(stunden) s FROM zeiterfassung GROUP BY ma_id, datum)') <= 12, 'Zeiterfassung ≤ 12 h je Person und Tag');
  ok(eins("SELECT COUNT(*) FROM zeiterfassung WHERE strftime('%w', datum) IN ('0','6')") === 0, 'keine Wochenenden in der Zeiterfassung');
  ok(eins('SELECT COUNT(*) FROM zeiterfassung z LEFT JOIN projekt_mitarbeiter pm ON pm.projekt_id = z.projekt_id AND pm.ma_id = z.ma_id WHERE pm.ma_id IS NULL') === 0, 'Zeiterfassung nur für Projektmitglieder');
  ok(eins('SELECT COUNT(*) FROM zeiterfassung z JOIN mitarbeiter m USING (ma_id) WHERE z.datum < m.eintritt OR (m.austritt IS NOT NULL AND z.datum > m.austritt)') === 0, 'Zeiterfassung nur während der Beschäftigung');
  ok(eins('SELECT COUNT(*) FROM zeiterfassung z JOIN projekte p USING (projekt_id) WHERE z.datum < p.start OR (p.ende IS NOT NULL AND z.datum > p.ende)') === 0, 'Zeiterfassung innerhalb der Projektlaufzeit');
  ok(eins('SELECT COUNT(*) FROM bestellungen b JOIN mitarbeiter m USING (ma_id) WHERE b.datum < m.eintritt OR (m.austritt IS NOT NULL AND b.datum > m.austritt)') === 0, 'Bestellungen nur durch beschäftigte Mitarbeiter');
  ok(eins('SELECT COUNT(*) FROM bestellungen b LEFT JOIN bestellpositionen p USING (best_id) WHERE p.best_id IS NULL') === 0, 'jede Bestellung hat Positionen');
  ok(eins('SELECT COUNT(*) FROM artikel WHERE verkaufspreis <= einkaufspreis') === 0, 'Verkaufspreis > Einkaufspreis');
  ok(eins('SELECT COUNT(*) FROM projekte p LEFT JOIN projekt_mitarbeiter pm ON pm.projekt_id = p.projekt_id AND pm.ma_id = p.leiter_id WHERE pm.ma_id IS NULL') === 0, 'Projektleiter ist Projektmitglied');

  // Benutzernamen
  const bn = q('SELECT benutzername, email FROM mitarbeiter').map(r => r);
  ok(new Set(bn.map(r => r[0])).size === 100, 'benutzername eindeutig');
  ok(bn.every(r => /^[a-z0-9.-]{3,20}$/.test(r[0])), 'benutzername ASCII, klein, ≤ 20 Zeichen');
  ok(bn.every(r => r[1] === r[0] + '@netzilon.example'), 'email = benutzername@netzilon.example');
  ok(eins("SELECT COUNT(*) FROM mitarbeiter WHERE nachname GLOB '*[äöüßÄÖÜ]*' OR vorname GLOB '*[äöüßÄÖÜ]*'") >= 3, 'einige Namen mit Umlauten/ß');
  ok(eins("SELECT COUNT(*) FROM mitarbeiter WHERE benutzername GLOB '*[0-9]'") >= 1, 'Namensdopplung → Ziffer im benutzername');

  // Lern-Anomalien
  ok(eins('SELECT COUNT(*) FROM mitarbeiter WHERE abt_id IS NULL') === 2, '2 Mitarbeiter ohne Abteilung');
  ok(eins('SELECT COUNT(*) FROM mitarbeiter m LEFT JOIN abteilungen a ON a.abt_id = m.abt_id WHERE a.abt_id IS NULL') >= 1, 'LEFT JOIN: Mitarbeiter ohne Abteilung');
  ok(eins('SELECT COUNT(*) FROM kunden k LEFT JOIN bestellungen b ON b.kunde_id = k.kunde_id WHERE b.best_id IS NULL') === 1, 'LEFT JOIN: 1 Kunde ohne Bestellung');
  ok(eins('SELECT COUNT(*) FROM projekte p LEFT JOIN zeiterfassung z ON z.projekt_id = p.projekt_id WHERE z.eintrag_id IS NULL') === 1, 'LEFT JOIN: 1 Projekt ohne Zeiterfassung');
  ok(eins('SELECT COUNT(*) FROM artikel a LEFT JOIN bestellpositionen bp ON bp.artikel_id = a.artikel_id WHERE bp.best_id IS NULL') === 1, 'LEFT JOIN: 1 Artikel nie bestellt');

  // Determinismus
  const s1 = FirmaDB.datenSql(), s2 = FirmaDB.datenSql(FirmaDB.SEED);
  ok(s1 === s2, 'gleicher Seed → identisches datenSql');
  ok(FirmaDB.daten() === FirmaDB.daten(FirmaDB.SEED), 'daten() gecacht');
  const s3 = FirmaDB.datenSql(4711);
  ok(s3 !== s1, 'anderer Seed → andere Daten');
  // frischer Kontext → gleiches Ergebnis (kein globaler Zustand)
  const sb2 = { console, atob, btoa, performance }; sb2.window = sb2; vm.createContext(sb2);
  vm.runInContext(fs.readFileSync(path.join(root, 'app', 'sqldb.js'), 'utf8'), sb2);
  ok(sb2.FirmaDB.datenSql(4711) === s3 && sb2.FirmaDB.datenSql() === s1, 'Determinismus über neuen Kontext');
  ok(FirmaDB.mitarbeiter().length === 100 && FirmaDB.mitarbeiter()[0].abteilung === 'Geschäftsführung', 'mitarbeiter() Kurzform');

  // anderer Seed: auch fehlerfrei
  const dbX = await SqlKern.neueDb(4711);
  ok(SqlKern.ausfuehren(dbX, 'SELECT COUNT(*) FROM mitarbeiter').ergebnisse[0].values[0][0] === 100, 'Seed 4711: 100 Mitarbeiter');
  ok(dbX.exec('PRAGMA foreign_key_check').length === 0, 'Seed 4711: FKs gültig');

  // SqlKern-API
  const d = await SqlKern.neueDb();
  let r = SqlKern.ausfuehren(d, 'SELECT COUNT(*) AS anzahl FROM mitarbeiter; SELECT 1');
  ok(r.ok && r.ergebnisse.length === 2 && r.ergebnisse[0].columns[0] === 'anzahl' && r.ergebnisse[0].values[0][0] === 100 && typeof r.ms === 'number', 'ausfuehren: mehrere Statements');
  r = SqlKern.ausfuehren(d, "UPDATE artikel SET lagerbestand = lagerbestand + 1 WHERE kategorie = 'Netzwerk'; UPDATE artikel SET lagerbestand = 0 WHERE artikel_id = 1");
  ok(r.ok && r.geaendert === 8, 'ausfuehren: geaendert über mehrere Statements = ' + r.geaendert);
  r = SqlKern.ausfuehren(d, 'SELEKT * FROM x');
  ok(!r.ok && typeof r.fehler === 'string' && r.fehler.length > 0, 'ausfuehren: Fehlertext "' + r.fehler + '"');
  r = SqlKern.ausfuehren(d, 'DELETE FROM abteilungen WHERE abt_id = 2');
  ok(!r.ok && /FOREIGN KEY/i.test(r.fehler), 'ausfuehren: FK-Verletzung wird gemeldet');
  const b = SqlKern.nachBase64(d);
  ok(typeof b === 'string' && b.length > 1000, 'nachBase64: ' + Math.round(b.length / 1024) + ' KB');
  ok(SqlKern.ausfuehren(d, 'PRAGMA foreign_keys').ergebnisse[0].values[0][0] === 1, 'foreign_keys nach export wieder an');
  const d2 = await SqlKern.ausBase64(b);
  ok(SqlKern.ausfuehren(d2, 'SELECT lagerbestand FROM artikel WHERE artikel_id = 1').ergebnisse[0].values[0][0] === 0, 'ausBase64: Änderungen erhalten');
  ok(SqlKern.ausfuehren(d2, 'PRAGMA foreign_keys').ergebnisse[0].values[0][0] === 1, 'ausBase64: foreign_keys an');
  let abgelehnt = false; try { await SqlKern.ausBase64(Buffer.from('keine datenbank, sondern text, der lang genug ist für den header'.repeat(10)).toString('base64')); } catch (e) { abgelehnt = true; }
  ok(abgelehnt, 'ausBase64: ungültige Daten → Reject');

  // vergleiche
  const e1 = SqlKern.ausfuehren(d, 'SELECT abt_id, COUNT(*) FROM mitarbeiter GROUP BY abt_id ORDER BY abt_id');
  const e2 = SqlKern.ausfuehren(d, 'SELECT abt_id, COUNT(*) AS n FROM mitarbeiter GROUP BY abt_id ORDER BY 2 DESC, 1');
  ok(SqlKern.vergleiche(e1, e2, { reihenfolge: false }), 'vergleiche: ohne Reihenfolge gleich (inkl. NULL)');
  ok(!SqlKern.vergleiche(e1, e2, { reihenfolge: true }), 'vergleiche: mit Reihenfolge ungleich');
  ok(SqlKern.vergleiche({ columns: ['a'], values: [[1.004], [null]] }, [{ columns: ['b'], values: [[null], [1]] }]), 'vergleiche: Toleranz ±0.005 und NULL');
  ok(!SqlKern.vergleiche({ columns: ['a'], values: [[1.01]] }, { columns: ['a'], values: [[1]] }), 'vergleiche: 1.01 ≠ 1');
  ok(!SqlKern.vergleiche({ columns: ['a'], values: [[null]] }, { columns: ['a'], values: [[0]] }), 'vergleiche: NULL ≠ 0');
  ok(!SqlKern.vergleiche({ columns: ['a', 'b'], values: [[1, 2]] }, { columns: ['a'], values: [[1]] }), 'vergleiche: Spaltenanzahl');
  ok(SqlKern.vergleiche({ columns: ['a'], values: [['10']] }, { columns: ['a'], values: [[10]] }), 'vergleiche: Zahl vs. numerischer Text');
  ok(SqlKern.vergleiche(SqlKern.ausfuehren(d, 'SELECT 1 WHERE 0'), { columns: ['x'], values: [] }) === false, 'vergleiche: leeres Ergebnis ohne Spalten ≠ leeres mit Spalte');

  // Übersicht
  console.log('Mengen: ' + erwartet.map(t => `${t}=${n(t)}`).join(', '));
  console.log('datenSql: ' + Math.round(s1.length / 1024) + ' KB, DB-Datei: ' + Math.round(b.length * 3 / 4 / 1024) + ' KB');
  console.log('Beispiel: ' + JSON.stringify(q("SELECT vorname, nachname, benutzername, position, gehalt FROM mitarbeiter WHERE benutzername GLOB '*[0-9]' OR nachname GLOB '*[äöüß]*' LIMIT 4")));
  console.log(fails ? `\n${fails} FEHLER` : '\nALLES OK'); process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
