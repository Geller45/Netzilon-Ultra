// Test der SQL-Aufgaben (app/sqlaufgaben.js) gegen die Firmen-DB (app/sqldb.js) mit sql.js in Node.
// Aufruf: node tools/test-sqlaufgaben.js   (Exit 1 bei Fehler)
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.join(__dirname, '..');
let fails = 0; const ok = (c, m) => { if (!c) { console.log('FEHLER ' + m); fails++; } else if (process.argv.includes('-v')) console.log('OK     ' + m); return c; };

const initSqlJs = require(path.join(root, 'app', 'vendor', 'sql-wasm.js'));
const binJs = fs.readFileSync(path.join(root, 'app', 'vendor', 'sql-wasm-bin.js'), 'utf8');
const b64 = (binJs.match(/NZ_SQL_WASM_B64\s*=\s*'([A-Za-z0-9+/=]+)'/) || [])[1];
if (!b64) { console.error('WASM-base64 nicht gefunden'); process.exit(1); }
const sandbox = { console, atob, btoa, performance, initSqlJs, NZ_SQL_WASM_B64: b64 };
sandbox.window = sandbox; sandbox.globalThis = sandbox;
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(root, 'app', 'sqldb.js'), 'utf8'), sandbox, { filename: 'sqldb.js' });
vm.runInContext(fs.readFileSync(path.join(root, 'app', 'sqlaufgaben.js'), 'utf8'), sandbox, { filename: 'sqlaufgaben.js' });
const { SqlKern } = sandbox;
const A = sandbox.SQL_AUFGABEN;

// Bewusst FALSCHE Lösungen (typische Fehler) – müssen von vergleiche als falsch erkannt werden.
const FALSCH = [
  ['sql-05', `SELECT vorname, nachname, position, gehalt FROM mitarbeiter WHERE gehalt > 5000;`, 'falscher Grenzwert'],
  ['sql-06', `SELECT best_id, kunde_id, datum, status FROM bestellungen WHERE datum BETWEEN '2025-01-01' AND '2025-03-31';`, 'falsches Jahr'],
  ['sql-09', `SELECT ma_id, vorname, nachname, position FROM mitarbeiter WHERE abt_id = NULL;`, '= NULL statt IS NULL'],
  ['sql-10', `SELECT vorname, nachname, wochenstunden FROM mitarbeiter WHERE wochenstunden < 40;`, 'Austritt nicht beachtet'],
  ['sql-11', `SELECT vorname, nachname, position FROM mitarbeiter WHERE azubi = 1 ORDER BY nachname;`, 'zweite Sortierspalte fehlt'],
  ['sql-12', `SELECT bezeichnung, verkaufspreis FROM artikel ORDER BY verkaufspreis LIMIT 5;`, 'aufsteigend statt absteigend'],
  ['sql-13', `SELECT branche FROM kunden ORDER BY branche;`, 'DISTINCT fehlt'],
  ['sql-16', `INSERT INTO artikel (artikel_id, bezeichnung, kategorie, einkaufspreis, verkaufspreis) VALUES (31, 'USB-Stick 64 GB', 'Zubehör', 6.50, 12.90);`, 'Lagerbestand vergessen'],
  ['sql-17', `UPDATE artikel SET lagerbestand = 12;`, 'UPDATE ohne WHERE'],
  ['sql-19', `SELECT MIN(gehalt), MAX(gehalt), ROUND(AVG(gehalt), 2) FROM mitarbeiter;`, 'Azubis/Ausgetretene mitgerechnet'],
  ['sql-22', `SELECT kunde_id, COUNT(*) FROM bestellungen GROUP BY kunde_id HAVING COUNT(*) > 10;`, '> statt >='],
  ['sql-24', `SELECT m.vorname, m.nachname, a.name FROM mitarbeiter m LEFT JOIN abteilungen a ON a.abt_id = m.abt_id;`, 'LEFT statt INNER JOIN'],
  ['sql-26', `SELECT k.firma, k.ansprechpartner FROM kunden k JOIN bestellungen b ON b.kunde_id = k.kunde_id WHERE b.best_id IS NULL;`, 'INNER JOIN findet keine fehlenden Partner'],
  ['sql-28', `SELECT p.name, k.firma FROM projekte p JOIN kunden k ON k.kunde_id = p.kunde_id;`, 'interne Projekte fehlen'],
  ['sql-30', `SELECT a.name, COUNT(*) AS anzahl FROM mitarbeiter m JOIN abteilungen a ON a.abt_id = m.abt_id GROUP BY a.name ORDER BY anzahl DESC, a.name;`, 'Ausgetretene mitgezählt'],
  ['sql-31', `SELECT k.firma, ROUND(SUM(p.einzelpreis), 2) AS umsatz FROM kunden k JOIN bestellungen b ON b.kunde_id = k.kunde_id JOIN bestellpositionen p ON p.best_id = b.best_id WHERE b.status <> 'storniert' GROUP BY k.kunde_id ORDER BY umsatz DESC LIMIT 5;`, 'Menge vergessen'],
  ['sql-32', `SELECT CASE WHEN gehalt < 4000 THEN 'unter 4000' WHEN gehalt < 6000 THEN '4000 bis 5999' WHEN azubi = 1 THEN 'Ausbildung' ELSE 'ab 6000' END AS band, COUNT(*) FROM mitarbeiter GROUP BY band;`, 'CASE-Reihenfolge falsch'],
  ['sql-37', `UPDATE mitarbeiter SET gehalt = ROUND(gehalt * 1.03, 2) WHERE abt_id = 3;`, 'Ausgetretene erhöht'],
  ['sql-37', `UPDATE mitarbeiter SET gehalt = gehalt + 3 WHERE abt_id = 3 AND austritt IS NULL;`, '+3 € statt +3 %'],
  ['sql-40', `DELETE FROM kunden WHERE kunde_id NOT IN (SELECT kunde_id FROM projekte);`, 'NOT IN mit NULL in der Unterabfrage löscht nichts'],
  ['sql-43', `SELECT vorname, nachname, gehalt FROM mitarbeiter WHERE azubi = 0 AND austritt IS NULL AND gehalt > (SELECT AVG(gehalt) FROM mitarbeiter);`, 'Durchschnitt inkl. Azubis'],
  ['sql-44', `SELECT a.artikel_id, a.bezeichnung FROM artikel a JOIN bestellpositionen p ON p.artikel_id = a.artikel_id JOIN bestellungen b ON b.best_id = p.best_id WHERE b.status = 'storniert';`, 'JOIN erzeugt Doppelte'],
  ['sql-48', `SELECT p.name, SUM(pm.stunden_geplant), SUM(z.stunden) FROM projekte p JOIN projekt_mitarbeiter pm ON pm.projekt_id = p.projekt_id JOIN zeiterfassung z ON z.projekt_id = p.projekt_id GROUP BY p.projekt_id HAVING SUM(z.stunden) > SUM(pm.stunden_geplant);`, 'Summen durch JOIN vervielfacht'],
  ['sql-49', `WITH RECURSIVE kette(ma_id, vorgesetzter_id, ebene) AS (SELECT ma_id, vorgesetzter_id, 0 FROM mitarbeiter WHERE ma_id = 97 UNION ALL SELECT m.ma_id, m.vorgesetzter_id, k.ebene + 1 FROM mitarbeiter m JOIN kette k ON m.ma_id = k.vorgesetzter_id) SELECT k.ebene, m.vorname, m.nachname, m.position FROM kette k JOIN mitarbeiter m ON m.ma_id = k.ma_id ORDER BY k.ebene DESC;`, 'falsche Sortierrichtung'],
  ['sql-52', `SELECT k.firma, b.best_id, b.datum FROM bestellungen b JOIN kunden k ON k.kunde_id = b.kunde_id;`, 'nicht auf die jüngste reduziert'],
  ['sql-55', `INSERT INTO projekt_mitarbeiter (projekt_id, ma_id, rolle, stunden_geplant) SELECT 9, ma_id, 'Mitarbeit (Azubi)', 40 FROM mitarbeiter WHERE azubi = 1 AND position LIKE '%FiSi';`, 'PK-Verletzung, nichts eingefügt'],
  ['sql-56', `DELETE FROM bestellungen WHERE status = 'storniert';`, 'falsche Reihenfolge → FK-Fehler'],
  ['sql-57', `CREATE TABLE schulungen (schulung_id INTEGER PRIMARY KEY, ma_id INTEGER, titel TEXT, datum TEXT, kosten REAL);`, 'Constraints fehlen'],
  ['sql-58', `CREATE VIEW v_telefonbuch AS SELECT m.vorname || ' ' || m.nachname AS name, a.name AS abteilung, m.telefon FROM mitarbeiter m JOIN abteilungen a ON a.abt_id = m.abt_id WHERE m.austritt IS NULL;`, 'INNER statt LEFT JOIN'],
  ['sql-59', `UPDATE abteilungen SET budget = budget - 50000 WHERE abt_id = 2;`, 'Gegenbuchung fehlt'],
  ['sql-60', `UPDATE mitarbeiter SET abt_id = NULL WHERE abt_id = 10; DELETE FROM abteilungen WHERE abt_id = 10;`, 'Mitarbeitende abteilungslos gemacht'],
];

const THEMEN = ['SELECT', 'WHERE', 'ORDER', 'AGGREGAT', 'GROUP BY', 'JOIN', 'SUBQUERY', 'CTE', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'VIEW', 'INDEX', 'TRANSAKTION', 'FENSTER'];

(async () => {
  ok(Array.isArray(A), 'SQL_AUFGABEN ist ein Array');
  await SqlKern.laden();
  const vorlage = await SqlKern.neueDb();
  const bytes = vorlage.export(); vorlage.close();
  const SQL = await SqlKern.laden();
  const neu = () => { const d = new SQL.Database(bytes); d.exec('PRAGMA foreign_keys = ON;'); return d; };

  // Mengen
  const nAbf = A.filter(a => a.art === 'abfrage').length, nAend = A.filter(a => a.art === 'aenderung').length;
  ok(A.length >= 45, `mindestens 45 Aufgaben (${A.length})`);
  ok(nAbf >= 30, `mindestens 30 Abfragen (${nAbf})`);
  ok(nAend >= 12, `mindestens 12 Änderungen (${nAend})`);
  ok(FALSCH.length >= Math.ceil(A.length / 5), `mindestens eine Falschlösung je 5 Aufgaben (${FALSCH.length} für ${A.length})`);
  for (const t of THEMEN) ok(A.some(a => a.thema === t), 'Thema abgedeckt: ' + t);

  // Felder, ids, Stufen
  const ids = new Set(); let letzteStufe = 1;
  for (const a of A) {
    const w = 'Aufgabe ' + (a && a.id);
    ok(typeof a.id === 'string' && /^sql-\d{2,}$/.test(a.id), w + ': id-Format');
    ok(!ids.has(a.id), w + ': id eindeutig'); ids.add(a.id);
    ok([1, 2, 3].includes(a.stufe), w + ': stufe 1–3');
    ok(a.stufe >= letzteStufe, w + ': stufe nicht fallend'); letzteStufe = Math.max(letzteStufe, a.stufe);
    ok(THEMEN.includes(a.thema), w + ': thema gültig (' + a.thema + ')');
    for (const f of ['titel', 'text', 'loesung', 'tsql', 'erklaerung']) ok(typeof a[f] === 'string' && a[f].trim().length > 0, w + ': Feld ' + f);
    ok(a.art === 'abfrage' || a.art === 'aenderung', w + ': art');
    ok(typeof a.reihenfolge === 'boolean' && typeof a.spaltenNamen === 'boolean', w + ': reihenfolge/spaltenNamen boolean');
    ok(Array.isArray(a.hinweise) && a.hinweise.length >= 2 && a.hinweise.length <= 3 && a.hinweise.every(h => typeof h === 'string' && h.trim()), w + ': 2–3 hinweise');
    ok(!/date\(\s*'now'|datetime\(\s*'now'|current_date|current_timestamp/i.test(a.loesung + (a.pruefSql || '')), w + ': kein heutiges Datum in loesung/pruefSql');
    if (a.art === 'abfrage') {
      ok(a.pruefSql === null, w + ': pruefSql null bei abfrage');
      if (a.reihenfolge) ok(/ORDER\s+BY/i.test(a.loesung.replace(/OVER\s*\([^)]*\)/gi, '')), w + ': reihenfolge:true nur mit ORDER BY');
    } else ok(typeof a.pruefSql === 'string' && a.pruefSql.trim().length > 0, w + ': pruefSql Pflicht bei aenderung');
  }

  // Ausführung
  const soll = new Map();
  for (const a of A) {
    const w = a.id + ' (' + a.titel + ')';
    if (a.art === 'abfrage') {
      const db = neu();
      const r = SqlKern.ausfuehren(db, a.loesung);
      if (ok(r.ok, w + ': Musterlösung fehlerfrei ' + (r.fehler || ''))) {
        const letzte = r.ergebnisse[r.ergebnisse.length - 1];
        ok(letzte && letzte.values.length >= 1, w + ': liefert mindestens 1 Zeile');
        ok(r.geaendert === 0, w + ': Abfrage ändert die DB nicht');
        ok(SqlKern.vergleiche(r, SqlKern.ausfuehren(db, a.loesung), { reihenfolge: a.reihenfolge }), w + ': Ergebnis stabil');
        soll.set(a.id, r);
        if (process.argv.includes('-v')) console.log('       ' + (letzte ? letzte.values.length : 0) + ' Zeilen');
      }
      db.close();
    } else {
      const roh = neu(), ref = neu();
      const p0 = SqlKern.ausfuehren(roh, a.pruefSql);
      const r = SqlKern.ausfuehren(ref, a.loesung);
      if (ok(r.ok, w + ': Musterlösung fehlerfrei ' + (r.fehler || ''))) {
        const p1 = SqlKern.ausfuehren(ref, a.pruefSql);
        ok(p1.ok, w + ': pruefSql nach Lösung fehlerfrei ' + (p1.fehler || ''));
        ok(p1.ok && p1.ergebnisse.length > 0 && p1.ergebnisse[p1.ergebnisse.length - 1].values.length >= 1, w + ': pruefSql liefert Zeilen');
        ok(SqlKern.vergleiche(p1, SqlKern.ausfuehren(ref, a.pruefSql), { reihenfolge: a.reihenfolge }), w + ': pruefSql stabil (gegen sich selbst)');
        ok(!p0.ok || !SqlKern.vergleiche(p0, p1, { reihenfolge: a.reihenfolge }), w + ': pruefSql unterscheidet frische DB von gelöster');
        ok(ref.exec('PRAGMA foreign_key_check').length === 0, w + ': Fremdschlüssel nach Lösung gültig');
        soll.set(a.id, p1);
      }
      roh.close(); ref.close();
    }
  }

  // Falschlösungen
  for (const [id, sql, grund] of FALSCH) {
    const a = A.find(x => x.id === id);
    if (!ok(a, 'Falschlösung verweist auf existierende Aufgabe ' + id)) continue;
    const db = neu();
    let gleich;
    if (a.art === 'abfrage') {
      const r = SqlKern.ausfuehren(db, sql);
      gleich = r.ok && SqlKern.vergleiche(r, soll.get(id), { reihenfolge: a.reihenfolge });
    } else {
      SqlKern.ausfuehren(db, sql);
      const p = SqlKern.ausfuehren(db, a.pruefSql);
      gleich = p.ok && SqlKern.vergleiche(p, soll.get(id), { reihenfolge: a.reihenfolge });
    }
    ok(!gleich, `${id}: Falschlösung „${grund}“ wird als falsch erkannt`);
    db.close();
  }

  // Gegenprobe: Musterlösung als Eingabe gilt als richtig (wie in der UI)
  for (const a of A) {
    const db = neu();
    const r = SqlKern.ausfuehren(db, a.loesung);
    const erg = a.art === 'abfrage' ? r : SqlKern.ausfuehren(db, a.pruefSql);
    ok(soll.has(a.id) && SqlKern.vergleiche(erg, soll.get(a.id), { reihenfolge: a.reihenfolge }), a.id + ': Musterlösung wird als richtig erkannt');
    db.close();
  }

  const proStufe = [1, 2, 3].map(s => `Stufe ${s}: ${A.filter(a => a.stufe === s).length}`).join(', ');
  console.log(`${A.length} Aufgaben (${nAbf} Abfragen, ${nAend} Änderungen; ${proStufe}), ${FALSCH.length} Falschlösungen geprüft`);
  console.log(fails ? `\n${fails} FEHLER` : '\nALLES OK'); process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
