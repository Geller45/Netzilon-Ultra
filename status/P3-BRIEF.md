# Paket 3 – SQL-Labor (Netzilon Ultra 2.3.0) – gemeinsame Vorgaben

Projekt `/home/user/Netzilon-Ultra/netzilon-ultra/`. Integration ist ERLEDIGT: `app/index.html` lädt (in dieser Reihenfolge) `vendor/sql-wasm.js` (sql.js 1.10.3, definiert global `initSqlJs`), `vendor/sql-wasm-bin.js` (`window.NZ_SQL_WASM_B64` = WASM base64), `vendor/sql-asm-gz.js` (`window.NZ_SQL_ASM_GZ` = asm.js-Fallback gzip+base64), `app/sqldb.js`, `app/sql.js`. CSP enthält `'wasm-unsafe-eval'` und `blob:` für Skripte. Route `sql` (Werkzeuge), Startseite/Hub verlinkt. Fortschritt: `S.p.sql = { geloest: {}, db: null (base64 der DB oder null), verlauf: [], editor: '' }` (migriert). XP: `melde('sql', 1)` = 15 XP, Quest „2 Aufgaben im SQL-Labor“, Abzeichen sql1/sql25/sqlall (`SqlLabor.alleGeloest()` muss existieren).
Keine CDN-/Netzzugriffe. Läuft in Electron (file://) UND in der Einzel-HTML (`node tools/build-html.js` konkateniert alle Skripte in EIN Inline-Skript → keine `import`/`export`, keine Top-Level-Namenskollisionen; nur `const X = (() => {…})(); window.X = X;`).

## Schema der Firmen-Datenbank „Netzilon GmbH“ (SQLite, Namen exakt so)
```sql
CREATE TABLE standorte (standort_id INTEGER PRIMARY KEY, stadt TEXT NOT NULL, plz TEXT, strasse TEXT, land TEXT DEFAULT 'DE');
CREATE TABLE abteilungen (abt_id INTEGER PRIMARY KEY, name TEXT NOT NULL UNIQUE, kuerzel TEXT, standort_id INTEGER REFERENCES standorte(standort_id), leiter_id INTEGER REFERENCES mitarbeiter(ma_id), budget REAL);
CREATE TABLE mitarbeiter (ma_id INTEGER PRIMARY KEY, personalnr TEXT UNIQUE, vorname TEXT NOT NULL, nachname TEXT NOT NULL, benutzername TEXT UNIQUE, email TEXT UNIQUE, telefon TEXT, geburtsdatum TEXT, eintritt TEXT NOT NULL, austritt TEXT, abt_id INTEGER REFERENCES abteilungen(abt_id), vorgesetzter_id INTEGER REFERENCES mitarbeiter(ma_id), position TEXT, gehalt REAL CHECK (gehalt > 0), wochenstunden REAL DEFAULT 40, azubi INTEGER DEFAULT 0);
CREATE TABLE kunden (kunde_id INTEGER PRIMARY KEY, firma TEXT NOT NULL, branche TEXT, stadt TEXT, plz TEXT, ansprechpartner TEXT, email TEXT, seit TEXT);
CREATE TABLE projekte (projekt_id INTEGER PRIMARY KEY, name TEXT NOT NULL, kunde_id INTEGER REFERENCES kunden(kunde_id), leiter_id INTEGER REFERENCES mitarbeiter(ma_id), start TEXT, ende TEXT, budget REAL, status TEXT CHECK (status IN ('geplant','aktiv','abgeschlossen','gestoppt')));
CREATE TABLE projekt_mitarbeiter (projekt_id INTEGER REFERENCES projekte(projekt_id), ma_id INTEGER REFERENCES mitarbeiter(ma_id), rolle TEXT, stunden_geplant REAL, PRIMARY KEY (projekt_id, ma_id));
CREATE TABLE artikel (artikel_id INTEGER PRIMARY KEY, bezeichnung TEXT NOT NULL, kategorie TEXT, einkaufspreis REAL, verkaufspreis REAL, lagerbestand INTEGER DEFAULT 0);
CREATE TABLE bestellungen (best_id INTEGER PRIMARY KEY, kunde_id INTEGER NOT NULL REFERENCES kunden(kunde_id), ma_id INTEGER REFERENCES mitarbeiter(ma_id), datum TEXT NOT NULL, status TEXT CHECK (status IN ('offen','versendet','bezahlt','storniert')));
CREATE TABLE bestellpositionen (best_id INTEGER REFERENCES bestellungen(best_id), pos INTEGER, artikel_id INTEGER REFERENCES artikel(artikel_id), menge INTEGER CHECK (menge > 0), einzelpreis REAL, PRIMARY KEY (best_id, pos));
CREATE TABLE zeiterfassung (eintrag_id INTEGER PRIMARY KEY, ma_id INTEGER NOT NULL REFERENCES mitarbeiter(ma_id), projekt_id INTEGER REFERENCES projekte(projekt_id), datum TEXT NOT NULL, stunden REAL CHECK (stunden > 0 AND stunden <= 12), taetigkeit TEXT);
```
Datumswerte als ISO-Text `YYYY-MM-DD`. Geld in Euro (REAL, 2 Nachkommastellen).
Mengen: 6 Standorte (Hamburg [Zentrale], Berlin, Köln, München, Leipzig, Frankfurt am Main), 10 Abteilungen (Geschäftsführung, IT-Betrieb, IT-Support, Netzwerk & Sicherheit, Softwareentwicklung, Vertrieb, Einkauf, Buchhaltung, Personal, Ausbildung), GENAU 100 Mitarbeiter (inkl. ~8 Azubis FiSi/FIAE, 1 Geschäftsführer ohne Vorgesetzten, ~3 mit austritt gesetzt), 40 Kunden, 15 Projekte, 30 Artikel (IT-Hardware/Lizenzen/Dienstleistung), ~250 Bestellungen, ~700 Positionen, ~2000 Zeiterfassungs-Einträge (Jahr 2025 bis Anfang 2026). Alles erfundene Namen (keine realen Personen/Firmen), deterministisch per Seed (gleicher Seed → identische DB). Einige bewusste „Lern-Anomalien“: 2 Mitarbeiter ohne Abteilung (abt_id NULL), 1 Kunde ohne Bestellung, 1 Projekt ohne Zeiterfassung, 1 Artikel nie bestellt (für LEFT JOIN / IS NULL-Aufgaben).
benutzername = `vorname.nachname` klein, ohne Umlaute (ä→ae, ö→oe, ü→ue, ß→ss), max. 20 Zeichen, eindeutig (bei Dopplung Ziffer anhängen). email = benutzername@netzilon.example (Domäne `.example` = reserviert).

## API `app/sqldb.js` (Agent SQL-Kern)
```js
window.FirmaDB = {
  SEED,                         // Standard-Seed (Zahl)
  daten(seed?) -> { standorte:[], abteilungen:[], mitarbeiter:[], kunden:[], projekte:[], projekt_mitarbeiter:[], artikel:[], bestellungen:[], bestellpositionen:[], zeiterfassung:[] }  // reine JS-Objekte, Spaltennamen wie Schema; deterministisch; gecacht
  mitarbeiter(seed?) -> Array    // Kurzform; wird in Paket 4 (Domänen-Simulator) für AD-Benutzer genutzt
  schemaSql() -> String          // CREATE TABLE … (genau obiges Schema) + sinnvolle Indizes optional NICHT (Indizes legt der Lernende an)
  datenSql(seed?) -> String      // INSERT-Statements
  TABELLEN: [{ name, spalten:[{name, typ, pk, fk:'tabelle.spalte'|null, notNull}] }]  // für ER-Diagramm
};
window.SqlKern = {
  laden() -> Promise<SQL>        // einmalig: initSqlJs({ wasmBinary }) aus NZ_SQL_WASM_B64; bei Fehler Fallback asm.js (NZ_SQL_ASM_GZ via DecompressionStream → Blob-URL-<script> → initSqlJs); merkt sich Modus 'wasm'|'asm'
  modus() -> 'wasm'|'asm'|null,
  neueDb(seed?) -> Promise<Database>       // frische DB mit Schema + Daten, PRAGMA foreign_keys=ON
  ausBase64(b64) -> Promise<Database>, nachBase64(db) -> String
  ausfuehren(db, sql) -> { ok, ergebnisse:[{columns, values}], geaendert:Number, fehler?:String, ms }   // fängt Fehler, mehrere Statements erlaubt
  vergleiche(ergA, ergB, { reihenfolge:boolean }) -> boolean     // Ergebnis-Vergleich für automatische Prüfung (Spaltenanzahl/Werte, Zahlen tolerant ±0.005, Reihenfolge optional)
};
```
Hinweis: `initSqlJs` aus sql-asm.js überschreibt das globale `initSqlJs` – vorher sichern.

## UI `app/sql.js` (Agent SQL-Labor) – Objekt `window.SqlLabor`, View `window.VIEWS.sql`
Alle CSS-Klassen/IDs mit Präfix `sql-` (CSS per `<style id="sql-style">` injiziert; `.s1`–`.s5` sind belegt). `SqlLabor.alleGeloest()` → Boolean.

## Inhalte `content/datenbanken/d4-sql-labor/` (Agent SQL-Inhalte)
Themenseiten nach `/home/user/Netzilon-Ultra/status/P2-BRIEF.md` (inkl. Legende), Beispiele immer auf obiges Schema bezogen („Probier es im SQL-Labor aus“).
