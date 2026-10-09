# P3 – SQL-Kern (Agent „SQL-Kern“) – Bericht

Dateien: `netzilon-ultra/app/sqldb.js` (ersetzt den Platzhalter), `netzilon-ultra/tools/test-sqldb.js` (neu). Sonst wurde nichts geändert und nichts committet.

## API (exakt wie in P3-BRIEF, ausführlich oben in sqldb.js dokumentiert)
- `FirmaDB.SEED` = 2301. `daten(seed?)` liefert reine Objekte, gecacht je Seed (nicht verändern). Strings als Seed werden gehasht.
- `FirmaDB.mitarbeiter(seed?)` liefert Kopien mit diesen Zusatzfeldern: `abteilung`, `kuerzel`, `stadt`, `aktiv` (kein austritt), `vorgesetzter` (benutzername). Gedacht für Paket 4 (AD).
- `schemaSql()`: das Schema 1:1, ohne Indizes. `datenSql(seed?)`: INSERTs in `BEGIN…COMMIT`. `abteilungen.leiter_id` wird zuerst NULL eingefügt und nach den Mitarbeitern per `UPDATE` gesetzt, damit mit `foreign_keys=ON` keine Fehler entstehen. Gecacht.
- `TABELLEN` wird aus dem Schema abgeleitet. Der Test prüft es gegen `PRAGMA table_info`/`foreign_key_list`. `pk` ist auch bei zusammengesetzten Schlüsseln gesetzt. `notNull` = NOT NULL oder PK.
- `SqlKern.laden()` versucht zuerst WASM (`initSqlJs({wasmBinary})`). Klappt das nicht, folgt der asm.js-Weg: gzip → DecompressionStream → Blob-URL-`<script>`. Danach wird das globale `initSqlJs` wiederhergestellt. Das Promise wird gecacht. Bei einem Fehler wird es verworfen, damit ein neuer Versuch möglich ist. Die Fehlermeldung nennt beide Ursachen.
- `modus()` liefert `'wasm' | 'asm' | null`.
- `neueDb(seed?)`, `ausBase64(b64)` (lehnt ungültige Daten ab), `nachBase64(db)` (arbeitet blockweise mit 32 KB). **Achtung:** `db.export()` öffnet die Verbindung in sql.js neu. Deshalb schaltet `nachBase64` danach `foreign_keys` wieder ein.
- `ausfuehren(db, sql)` liefert `{ ok, ergebnisse:[{columns,values}], geaendert, fehler?, ms }` und wirft nie. `geaendert` ist die Differenz von `total_changes()` und damit über mehrere Statements korrekt. Fallback ist `getRowsModified()`.
- `vergleiche(a, b, {reihenfolge})`:
  - Erlaubte Eingaben: ein ausfuehren-Ergebnis, ein Array `ergebnisse` (es zählt die letzte Ergebnismenge) oder `{columns, values}`.
  - Verglichen werden Spaltenanzahl, Zeilenanzahl und Werte. Zahlen dürfen um ±0.005 abweichen, eine Zahl gilt gleich einem numerischen Text, NULL ist nur gleich NULL.
  - Standard ist `reihenfolge:false`: Die Zeilen werden vor dem Vergleich sortiert. Spaltennamen werden nicht verglichen.
- Testhook: `SqlKern._erzwingeAsm = true` vor `laden()` setzen.

## Erzeugte DB (Seed 2301)
| Tabelle | Zeilen |
|---|---|
| standorte | 6 (Hamburg ist Zentrale, id 1) |
| abteilungen | 10 (alle mit leiter_id) |
| mitarbeiter | 100: 8 Azubis (6 FiSi, 2 FIAE), 1 Geschäftsführer ohne Vorgesetzten, 3 mit austritt |
| kunden | 40 |
| projekte | 15 (3 intern mit kunde_id NULL; 1 mit ende NULL; Status: geplant, aktiv, abgeschlossen, gestoppt) |
| projekt_mitarbeiter | 78 |
| artikel | 30 |
| bestellungen | 250 (wenige mit ma_id NULL, „Online-Bestellung“) |
| bestellpositionen | 700 |
| zeiterfassung | 2000 |

- **Hierarchie:** Geschäftsführer → Abteilungsleiter → Mitarbeiter. Die Azubis sind dem Ausbilder unterstellt, der Ausbilder dem Ausbildungsleiter.
- **Gehälter:**
  - Azubis: 1.050 / 1.150 / 1.250 € je Lehrjahr (FIAE jeweils +20 €).
  - Alle anderen: 2.800–9.500 € brutto im Monat.
  - Teilzeit: 30, 32 oder 35 Stunden.
- **Namen:** Die Namen sind gemischt und enthalten einige Umlaute und ß (Beispiel: Öztürk → `tanja.oeztuerk`). Eine Namensdopplung ist absichtlich eingebaut (Beispiel: `birgit.graf2`).
- **Zeiterfassung:**
  - nur an Werktagen (ohne bundesweite Feiertage)
  - nur für Projektmitglieder
  - nur während der Beschäftigung und innerhalb der Projektlaufzeit
  - höchstens 10 h pro Person und Tag
- **Lern-Anomalien:**
  - 2 Mitarbeiter ohne Abteilung: die Stabsstellen Datenschutz und QM, beide der Geschäftsführung unterstellt
  - 1 Kunde ohne Bestellung (per Seed gewählt)
  - 1 Projekt ohne Zeiterfassung: „Rechenzentrum-Umzug“ (geplant)
  - 1 Artikel, der nie bestellt wurde: „Serverschrank 42 HE“
- **Größe:** datenSql ist etwa 447 KB groß, die DB-Datei etwa 208 KB.

## Tests
- `node tools/test-sqldb.js` → ALLES OK. Geprüft wird Folgendes:
  - Schema und alle INSERTs mit FK=ON; foreign_key_check und integrity_check
  - die Struktur von TABELLEN
  - alle Mengen und die Hierarchie
  - Gehaltsbereiche und Datumsbereiche
  - Zeiterfassung: höchstens 12 h, keine Wochenenden, nur für Mitglieder, innerhalb von Beschäftigung und Laufzeit
  - benutzername (eindeutig, ASCII, höchstens 20 Zeichen) und E-Mail
  - die 4 Anomalien per LEFT JOIN
  - Determinismus, auch in einem neuen vm-Kontext; ein anderer Seed ergibt andere Daten und ist ebenfalls fehlerfrei
  - ausfuehren (mehrere Statements, geaendert, Fehlertext, FK-Verletzung)
  - Base64-Rundreise
  - vergleiche
- Browser-Test mit Playwright (Skript `scratchpad/browser-sql.js`) gegen die gebaute Einzel-HTML:
  - **WASM:** Laden 53 ms, neueDb 143 ms.
  - **asm** (`_erzwingeAsm`): Laden 265 ms, neueDb 340 ms.
  - Ergebnis in beiden Modi: COUNT(*) = 100, Base64-Rundreise ok, keine Konsolenfehler.
- Bestehende Tests: `check-content` hat 0 Fehler, `test-ui` meldet „Alle Tests bestanden“, `test-paket` meldet ALLES OK.

## Einzel-HTML
`dist/Netzilon-Ultra.html` ist **5,34 MB** groß (634 Inhaltsdateien). Darin stecken die sql.js-Vendor-Dateien mit etwa 1,5 MB.
