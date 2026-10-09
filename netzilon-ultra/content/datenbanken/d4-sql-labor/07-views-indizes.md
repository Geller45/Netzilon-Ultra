---
id: db-labor-views-indizes
bereich: Datenbanken
block: D4
kapitel: SQL-Labor (Firmen-DB)
titel: Views und Indizes – Sichten anlegen, Abfragen beschleunigen
stufe: Profi
fach: SQL / Datenbanken
pruefungen: [AP1, AP2, Schule]
quellen: [SQLite-Dokumentation, Microsoft Learn – T-SQL]
verweise: [db-labor-ddl, db-labor-joins, db-dcl, db-partitionierung, db-labor-transaktionen]
---

## Profi

### View (Sicht)
Eine **View** ist eine **gespeicherte SELECT-Abfrage**, die wie eine Tabelle angesprochen wird. Sie speichert (in SQLite und als normale View in SQL Server) **keine Daten**, sondern wird bei jedem Zugriff neu ausgewertet. Alle Beispiele: Firmen-DB der **Netzilon GmbH**. Probier es im SQL-Labor (Werkzeuge) aus.
```sql
CREATE VIEW IF NOT EXISTS v_mitarbeiter_aktiv AS
SELECT m.ma_id, m.vorname, m.nachname, m.email, m.position,
       a.name AS abteilung, s.stadt AS standort
FROM mitarbeiter m
LEFT JOIN abteilungen a ON a.abt_id = m.abt_id
LEFT JOIN standorte  s ON s.standort_id = a.standort_id
WHERE m.austritt IS NULL;

SELECT abteilung, COUNT(*) AS anzahl
FROM v_mitarbeiter_aktiv
GROUP BY abteilung;
```
**Nutzen**:
- **Vereinfachung**: komplexe Joins einmal definieren, oft wiederverwenden (z. B. Umsatz je Kunde).
- **Datenschutz/Sicherheit**: Nur bestimmte Spalten/Zeilen freigeben – eine Telefonlisten-View **ohne** `gehalt` und `geburtsdatum`. In SQL Server erhält eine Rolle dann `GRANT SELECT` nur auf die View (DSGVO: Datenminimierung).
- **Stabile Schnittstelle**: Anwendungen greifen auf die View zu; die Basistabellen können umgebaut werden.
- **Einheitliche Kennzahlen**: „Umsatz“ ist überall gleich definiert.

**Grenzen**:
- Keine eigenen Daten → keine Beschleunigung an sich (Ausnahme: indizierte/materialisierte Views).
- In **SQLite sind Views schreibgeschützt** (INSERT/UPDATE/DELETE nur über `INSTEAD OF`-Trigger).
- In SQL Server sind einfache Views (eine Basistabelle, keine Aggregate/DISTINCT) aktualisierbar; `WITH CHECK OPTION` verhindert Änderungen, die aus der View „herausfallen“.
- `ORDER BY` in der View-Definition garantiert keine Sortierung beim Abfragen (in T-SQL ohne TOP sogar verboten).
- Ändert sich die Basistabelle (Spalte umbenannt/gelöscht), kann die View ungültig werden. SQLite kennt kein `ALTER VIEW` → `DROP VIEW` + `CREATE VIEW`.

Umsatz-View als Kennzahlen-Schnittstelle:
```sql
CREATE VIEW v_umsatz_kunde AS
SELECT k.kunde_id, k.firma, k.stadt,
       COUNT(DISTINCT b.best_id)             AS bestellungen,
       ROUND(SUM(p.menge * p.einzelpreis), 2) AS umsatz
FROM kunden k
JOIN bestellungen b      ON b.kunde_id = k.kunde_id AND b.status <> 'storniert'
JOIN bestellpositionen p ON p.best_id = b.best_id
GROUP BY k.kunde_id, k.firma, k.stadt;

SELECT * FROM v_umsatz_kunde ORDER BY umsatz DESC LIMIT 5;
```

### Index
Ein **Index** ist eine zusätzliche, sortierte Datenstruktur (in SQLite und SQL Server ein **B-Baum / B-Tree**) über eine oder mehrere Spalten, die auf die Zeilen verweist – wie das **Stichwortverzeichnis** eines Buches. Ohne Index muss die Datenbank die ganze Tabelle lesen (**Full Table Scan**), mit Index springt sie gezielt zu den Treffern (**Index Seek**).
```sql
CREATE INDEX idx_zeit_ma_datum ON zeiterfassung (ma_id, datum);
CREATE INDEX idx_best_kunde    ON bestellungen (kunde_id);
CREATE UNIQUE INDEX idx_ma_personalnr ON mitarbeiter (personalnr);
DROP INDEX IF EXISTS idx_best_kunde;
```
Primärschlüssel und UNIQUE-Constraints erhalten automatisch einen Index. **Fremdschlüsselspalten** dagegen **nicht** – sie sind die wichtigsten Kandidaten (Joins, FK-Prüfung beim Löschen).

### EXPLAIN QUERY PLAN (SQLite)
Zeigt, wie SQLite eine Abfrage ausführen will:
```sql
EXPLAIN QUERY PLAN
SELECT datum, stunden FROM zeiterfassung WHERE ma_id = 17 AND datum >= '2025-06-01';
```
- Ohne Index: `SCAN zeiterfassung` → alle ~2000 Zeilen werden gelesen.
- Mit `idx_zeit_ma_datum`: `SEARCH zeiterfassung USING INDEX idx_zeit_ma_datum (ma_id=? AND datum>?)`.
- `USING COVERING INDEX` = alle benötigten Spalten stehen im Index, Tabelle wird gar nicht gelesen.
- `USE TEMP B-TREE FOR ORDER BY` = zusätzliche Sortierung nötig.

### Wann helfen Indizes?
- Spalten in **WHERE**, **JOIN … ON**, **ORDER BY**, **GROUP BY** mit hoher **Selektivität** (viele verschiedene Werte, z. B. `ma_id`, `datum`, `email`).
- **Zusammengesetzter Index** `(ma_id, datum)`: wirkt für `WHERE ma_id = ?` und `WHERE ma_id = ? AND datum > ?`, **nicht** für `WHERE datum > ?` allein (Präfix-Regel, wie Telefonbuch: erst Nachname, dann Vorname).
- **Abdeckender Index** (covering index): enthält alle Spalten der Abfrage.

### Wann schaden oder nutzen sie nicht?
- Jeder Index **verlangsamt INSERT/UPDATE/DELETE** und kostet Speicher – er muss mitgepflegt werden.
- Spalten mit **geringer Selektivität** (`azubi` 0/1, `status` mit 4 Werten) – Scan ist oft gleich schnell.
- **Kleine Tabellen** (10 Abteilungen) – Scan ist billiger.
- **Funktionen auf der Spalte** verhindern Indexnutzung: `WHERE strftime('%Y', datum) = '2025'` → besser `WHERE datum BETWEEN '2025-01-01' AND '2025-12-31'` (sargable). `LIKE '%xyz'` (führender Platzhalter) kann keinen Index nutzen.
- Zu viele, sich überschneidende Indizes verwirren den Optimierer nicht, kosten aber Schreibleistung.

### T-SQL-Unterschied
| Thema | SQLite (SQL-Labor) | T-SQL (SQL Server) |
|---|---|---|
| Ausführungsplan | `EXPLAIN QUERY PLAN SELECT ...` | Geschätzter Plan Strg+L, tatsächlicher Plan Strg+M; `SET SHOWPLAN_XML ON`; `SET STATISTICS IO ON` |
| Indexarten | B-Baum, partieller Index (`WHERE`), Ausdrucksindex | **gruppiert (clustered)** = Tabelle selbst sortiert (max. 1), **nicht gruppiert (nonclustered)**, Columnstore, gefilterter Index |
| Zusatzspalten im Index | nur als Schlüsselspalten | `CREATE INDEX ... ON t (ma_id) INCLUDE (stunden, datum)` |
| View ändern | DROP + CREATE | `CREATE OR ALTER VIEW` (ab 2016 SP1) / `ALTER VIEW` |
| Materialisiert | nicht vorhanden | **indizierte View** (`WITH SCHEMABINDING` + eindeutiger gruppierter Index) |
| Schreiben über View | nur per `INSTEAD OF`-Trigger | einfache Views direkt, `WITH CHECK OPTION` |
| Verschlüsselte Definition | – | `WITH ENCRYPTION` |
| Statistiken | `ANALYZE;` | automatisch, `UPDATE STATISTICS dbo.zeiterfassung;` |
| Rechte | keine Benutzer/Rechte (Datei) | `GRANT SELECT ON dbo.v_telefonliste TO rolle_alle;` |

Der Primärschlüssel ist in SQL Server standardmäßig der **gruppierte Index**. Eine SQLite-Tabelle mit `INTEGER PRIMARY KEY` ist intern ebenfalls nach der rowid sortiert (vergleichbar).

## Einfach

**View**: Stell dir vor, die Netzilon GmbH hat einen großen Aktenschrank mit allen Mitarbeiterdaten – auch Gehalt und Geburtsdatum. Für den Empfang soll es aber nur eine **Telefonliste** geben. Statt eine Kopie anzulegen, baust du ein **Fenster** in den Schrank: Durch das Fenster sieht man nur Name, Abteilung und Telefon. Das ist eine **View** – eine gespeicherte Abfrage, die wie eine Tabelle aussieht, aber **keine eigenen Daten** hat. Ändert sich im Schrank etwas, sieht man es sofort im Fenster.

**Index**: Du suchst in einem dicken Buch das Wort „Router“. Ohne **Stichwortverzeichnis** müsstest du **jede Seite** lesen. Mit Verzeichnis schaust du hinten nach: „Router – Seite 214“ und springst hin. Ein **Index** ist genau dieses Stichwortverzeichnis für eine Tabelle.

Aber: Jedes Mal, wenn ein neues Kapitel ins Buch kommt, muss das Verzeichnis **auch** aktualisiert werden. Deshalb macht man **nicht für jede Spalte** einen Index – nur für die, nach denen oft gesucht wird. Und bei einer Spalte, die nur „ja/nein“ enthält, hilft das Verzeichnis kaum: Die Hälfte aller Seiten steht drin.

Mit **EXPLAIN QUERY PLAN** fragst du die Datenbank: „Wie willst du suchen – jede Seite lesen (SCAN) oder im Verzeichnis nachschauen (SEARCH)?“

Probier es im SQL-Labor (Werkzeuge) aus!

## Merksatz
- **View = gespeicherte Abfrage, keine Daten.**
- **Index = Stichwortverzeichnis: schneller lesen, langsamer schreiben.**
- SCAN = ganze Tabelle, SEARCH = über Index.
- Fremdschlüssel bekommen keinen automatischen Index – selbst anlegen.
- Zusammengesetzter Index wirkt von links nach rechts.
- Keine Funktion um indizierte Spalten in WHERE.

## Prüfungsfalle
- Eine normale View beschleunigt nichts – sie ist nur eine gespeicherte Abfrage.
- SQLite-Views sind nicht direkt beschreibbar.
- Index auf `(ma_id, datum)` hilft nicht bei `WHERE datum = ...` allein.
- Indizes auf Spalten mit wenigen Werten (azubi, status) bringen kaum etwas.
- Mehr Indizes = langsamere INSERT/UPDATE/DELETE.
- `WHERE strftime('%Y', datum) = '2025'` verhindert die Indexnutzung.
- SQL Server: nur **ein** gruppierter Index pro Tabelle.

## Grafik
### Suche ohne und mit Index
1. Abfrage: WHERE ma_id = 17 auf zeiterfassung
2. Ohne Index: SCAN liest alle 2000 Zeilen
3. CREATE INDEX: B-Baum über ma_id und datum wird aufgebaut
4. Mit Index: SEARCH springt über den B-Baum zu den Treffern
5. Ergebnis: nur ca. 20 Zeilen gelesen statt 2000

### View als Fenster
1. Empfang -> v_telefonliste: SELECT * ausführen
2. v_telefonliste -> mitarbeiter: gespeicherte Abfrage wird eingesetzt
3. mitarbeiter: liefert nur Name, Abteilung, Telefon
4. v_telefonliste -> Empfang: Gehalt und Geburtsdatum bleiben unsichtbar

## Lab
### GUI
Maschine: SQL-Labor in Netzilon (Werkzeuge → SQL-Labor), Firmen-DB „Netzilon GmbH“ (nach dem Lab zurücksetzen).
1. View `v_telefonliste` ohne Gehalt und Geburtsdatum anlegen und abfragen.
2. Versuchen, über die View ein UPDATE auszuführen – Fehlermeldung lesen.
3. Ausführungsplan einer Zeiterfassungs-Abfrage ohne Index ansehen (SCAN).
4. Zusammengesetzten Index anlegen und den Plan erneut prüfen (SEARCH).
5. Abfrage nur auf `datum` testen – wird der Index genutzt?
6. Abfrage mit `strftime` vs. BETWEEN im Plan vergleichen.
7. Vorhandene Indizes und Views über `sqlite_master` auflisten.

```sql
-- 1
CREATE VIEW v_telefonliste AS
SELECT m.nachname, m.vorname, a.name AS abteilung, m.telefon, m.email
FROM mitarbeiter m LEFT JOIN abteilungen a ON a.abt_id = m.abt_id
WHERE m.austritt IS NULL;
SELECT * FROM v_telefonliste ORDER BY nachname LIMIT 10;

-- 3 und 4
EXPLAIN QUERY PLAN SELECT datum, stunden FROM zeiterfassung WHERE ma_id = 17 AND datum >= '2025-06-01';
CREATE INDEX idx_zeit_ma_datum ON zeiterfassung (ma_id, datum);
EXPLAIN QUERY PLAN SELECT datum, stunden FROM zeiterfassung WHERE ma_id = 17 AND datum >= '2025-06-01';

-- 5 und 6
EXPLAIN QUERY PLAN SELECT * FROM zeiterfassung WHERE datum = '2025-07-01';
CREATE INDEX idx_zeit_datum ON zeiterfassung (datum);
EXPLAIN QUERY PLAN SELECT * FROM zeiterfassung WHERE strftime('%Y', datum) = '2025';
EXPLAIN QUERY PLAN SELECT * FROM zeiterfassung WHERE datum BETWEEN '2025-01-01' AND '2025-12-31';

-- 7
SELECT type, name, tbl_name FROM sqlite_master WHERE type IN ('index', 'view');
```

```text
-- Erwartet bei Schritt 2:
UPDATE v_telefonliste SET telefon = '040 1234' WHERE nachname = 'Beispiel';
  → cannot modify v_telefonliste because it is a view
```

### T-SQL
Maschine: SQL01.example.com, SSMS, Datenbank `Netzilon`.
1. View mit `CREATE OR ALTER VIEW` anlegen und Leserecht nur auf die View vergeben.
2. Nicht gruppierten Index mit INCLUDE-Spalten anlegen.
3. Tatsächlichen Ausführungsplan (Strg+M) einschalten: Index Seek statt Table/Clustered Index Scan prüfen; `SET STATISTICS IO ON` zeigt die gelesenen Seiten.

```tsql
USE Netzilon;
GO
CREATE OR ALTER VIEW dbo.v_telefonliste
AS
SELECT m.nachname, m.vorname, a.name AS abteilung, m.telefon, m.email
FROM dbo.mitarbeiter AS m
LEFT JOIN dbo.abteilungen AS a ON a.abt_id = m.abt_id
WHERE m.austritt IS NULL;
GO
GRANT SELECT ON dbo.v_telefonliste TO rolle_empfang;

CREATE NONCLUSTERED INDEX ix_zeit_ma_datum
ON dbo.zeiterfassung (ma_id, datum) INCLUDE (stunden);

SET STATISTICS IO ON;
SELECT datum, stunden FROM dbo.zeiterfassung WHERE ma_id = 17 AND datum >= '2025-06-01';
```

## Legende
### View
- Was: Gespeicherte SELECT-Abfrage, die wie eine (virtuelle) Tabelle genutzt wird.
- Wie: `CREATE VIEW name AS SELECT ...;` – Abfrage mit `SELECT * FROM name`.
- Wann: Wiederkehrende Joins, Kennzahlen, eingeschränkte Sicht auf sensible Daten.
- Wo: SQLite (nur lesend), SQL Server (aktualisierbar, Rechte per GRANT, indizierte Views).
- Warum: Vereinfachung, Sicherheit/Datenschutz, stabile Schnittstelle.
### Index
- Was: Sortierte Hilfsstruktur (B-Baum) für schnelles Finden von Zeilen.
- Wie: `CREATE INDEX idx_name ON tabelle (spalte1, spalte2);` – Wirkung mit EXPLAIN QUERY PLAN prüfen.
- Wann: Häufig gefilterte/verknüpfte Spalten mit hoher Selektivität, Fremdschlüssel.
- Warum: Lesen schneller (SEARCH statt SCAN) – dafür Schreiben langsamer und mehr Speicher.

## Karteikarten
- F: Was ist eine View? | A: Eine gespeicherte SELECT-Abfrage, die wie eine Tabelle abgefragt wird und keine eigenen Daten speichert.
- F: Nenne drei Vorteile von Views. | A: Vereinfachung komplexer Abfragen, Datenschutz (nur bestimmte Spalten/Zeilen), stabile Schnittstelle/einheitliche Kennzahlen.
- F: Kann man in SQLite über eine View Daten ändern? | A: Nicht direkt – nur über einen INSTEAD-OF-Trigger.
- F: Was ist ein Index? | A: Eine sortierte Hilfsstruktur (B-Baum) über Spalten, die gezieltes Finden ohne Full Table Scan ermöglicht.
- F: Welche Nachteile haben Indizes? | A: Zusätzlicher Speicher und langsamere INSERT/UPDATE/DELETE, da der Index mitgepflegt werden muss.
- F: Was zeigt EXPLAIN QUERY PLAN? | A: Den geplanten Zugriffsweg von SQLite, z. B. SCAN (ganze Tabelle) oder SEARCH USING INDEX.
- F: Warum hilft ein Index auf (ma_id, datum) nicht bei WHERE datum = …? | A: Ein zusammengesetzter Index ist zuerst nach ma_id sortiert; nur ein Präfix der Spalten kann genutzt werden.
- F: Welche Spalten erhalten automatisch einen Index? | A: Primärschlüssel und UNIQUE-Spalten – Fremdschlüssel nicht.
- F: Was ist ein gruppierter Index in SQL Server? | A: Ein Index, der die physische Reihenfolge der Tabellenzeilen bestimmt; nur einer pro Tabelle (meist der PK).
- F: Was bedeutet „covering index“? | A: Der Index enthält alle Spalten, die die Abfrage braucht – die Tabelle selbst muss nicht gelesen werden.
- F: Warum verhindert `strftime('%Y', datum) = '2025'` die Indexnutzung? | A: Die Funktion wird auf jede Zeile angewendet; der Index ist nach datum, nicht nach dem Funktionsergebnis sortiert.
- F: Wie ändert man in SQLite eine View? | A: DROP VIEW und neu CREATE VIEW (kein ALTER VIEW).

## Quiz
? Welche Aussage über eine normale View trifft zu?
- Sie speichert eine Kopie der Daten, die bei jeder Änderung nachgezogen wird
- Sie beschleunigt jede Abfrage automatisch
* Sie speichert nur die Abfrage und wird bei jedem Zugriff ausgewertet
- Sie kann nur eine einzige Spalte enthalten
! Nur indizierte/materialisierte Views speichern Ergebnisse.

? Welche Anweisung legt eine View für eine Telefonliste ohne Gehaltsdaten an?
* `CREATE VIEW v_telefonliste AS SELECT nachname, vorname, telefon FROM mitarbeiter;`
- `CREATE MATERIALIZED TABLE v_telefonliste AS VIEW mitarbeiter (nachname, vorname, telefon);`
- `CREATE VIEW v_telefonliste FROM mitarbeiter SELECT nachname, telefon;`
- `CREATE INDEX v_telefonliste ON mitarbeiter (nachname, telefon);`
! Syntax: CREATE VIEW name AS SELECT …

? Was zeigt `EXPLAIN QUERY PLAN` mit dem Eintrag `SCAN zeiterfassung`?
- Ein Index wird genutzt
* Die gesamte Tabelle wird gelesen
- Die Abfrage ist fehlerhaft
- Die Tabelle ist leer
! SEARCH … USING INDEX würde einen Indexzugriff anzeigen.

? Für welche Abfrage nutzt SQLite den Index `idx_zeit_ma_datum ON zeiterfassung (ma_id, datum)`?
- `WHERE datum = '2025-07-01'`
- `WHERE stunden > 8`
- `WHERE taetigkeit LIKE '%Doku%'`
* `WHERE ma_id = 17 AND datum >= '2025-06-01'`
! Zusammengesetzter Index: nur über die führende Spalte (Präfix) nutzbar.

? Welcher Nachteil entsteht durch viele Indizes auf einer Tabelle?
- SELECT-Abfragen werden langsamer
- Fremdschlüssel funktionieren nicht mehr
* INSERT, UPDATE und DELETE werden langsamer
- Die Tabelle kann keine NULL-Werte mehr speichern
! Jeder Index muss bei Datenänderungen mitgepflegt werden.

? Auf welcher Spalte lohnt sich ein Index am ehesten?
- `mitarbeiter.azubi` (nur die Werte 0 und 1)
- `bestellungen.status` (vier mögliche Werte)
* `zeiterfassung.ma_id` (viele Werte, oft im JOIN)
- `abteilungen.kuerzel` (Tabelle mit 10 Zeilen)
! Hohe Selektivität und häufige Verwendung in JOIN/WHERE; kleine Tabellen und Spalten mit wenigen Werten profitieren kaum.

? Was passiert in SQLite bei `UPDATE v_telefonliste SET telefon = '040 1234' WHERE nachname = 'Beispiel';`?
- Die Basistabelle mitarbeiter wird geändert
* Fehler: Eine View kann nicht geändert werden
- Nur die View wird geändert, die Tabelle nicht
- Die View wird gelöscht
! SQLite-Views sind schreibgeschützt; Ausweg: INSTEAD-OF-Trigger.

? Wie viele gruppierte (clustered) Indizes kann eine Tabelle in SQL Server haben?
- Beliebig viele
- Zwei
* Einen
- Keinen, das gibt es nur in SQLite
! Die Daten können physisch nur in einer Reihenfolge sortiert sein.

? Welche WHERE-Bedingung kann einen Index auf `datum` nutzen?
- `WHERE strftime('%Y', datum) = '2025'`
- `WHERE CAST(substr(datum, 1, 4) AS INTEGER) = 2025`
* `WHERE datum BETWEEN '2025-01-01' AND '2025-12-31'`
- `WHERE datum LIKE '%2025'`
! Funktionen um die Spalte und führende Platzhalter verhindern einen Index-Zugriff.

? Wie ergänzt man in T-SQL Spalten in einem Index, ohne dass sie Teil des Schlüssels sind?
- `WITH COLUMNS (stunden)`
- `ADD stunden`
- `COVER (stunden)`
* `INCLUDE (stunden)`
! INCLUDE-Spalten liegen nur in den Blattseiten des nicht gruppierten Index.

? Welche Anweisung zeigt in SQLite alle Indizes und Views?
* `SELECT type, name FROM sqlite_master WHERE type IN ('index', 'view');`
- `SHOW INDEXES AND VIEWS;`
- `SELECT name, type_desc FROM sys.indexes UNION SELECT name, type_desc FROM sys.views;`
- `PRAGMA list_all;`
! sqlite_master (auch sqlite_schema) enthält alle Schemaobjekte; sys.indexes ist SQL Server.

? Wozu dient `WITH CHECK OPTION` bei einer View in SQL Server?
- Sie prüft die Syntax der View
- Sie erzwingt einen Index
* Sie verhindert Änderungen, nach denen die Zeile nicht mehr in der View sichtbar wäre
- Sie verschlüsselt die View-Definition, sodass sie im Objekt-Explorer nicht mehr lesbar ist
! Beispiel: In einer View „nur aktive“ darf man austritt nicht über die View setzen.

## Lücken
- Eine {View} ist eine gespeicherte Abfrage ohne eigene Daten.
- Ohne Index liest SQLite die ganze Tabelle ({SCAN}), mit Index sucht es gezielt ({SEARCH}).
- Indizes beschleunigen das Lesen, verlangsamen aber {INSERT}, UPDATE und DELETE.
- In SQL Server bestimmt der {gruppierte|clustered} Index die physische Reihenfolge der Zeilen.

## Zuordnen
### Begriff und Bedeutung
- View => gespeicherte Abfrage als virtuelle Tabelle
- Index => B-Baum zum schnellen Finden
- SCAN => ganze Tabelle wird gelesen
- SEARCH USING INDEX => gezielter Zugriff über Index
- COVERING INDEX => Index enthält alle benötigten Spalten
- INSTEAD OF-Trigger => Änderungen über SQLite-View umleiten

## Reihenfolge
### Langsame Abfrage optimieren
1. Abfrage und Laufzeit notieren
2. EXPLAIN QUERY PLAN ausführen und SCAN erkennen
3. Spalten aus WHERE und JOIN als Indexkandidaten bestimmen
4. CREATE INDEX mit sinnvoller Spaltenreihenfolge anlegen
5. EXPLAIN QUERY PLAN erneut prüfen (SEARCH USING INDEX)
6. Auswirkung auf Schreibvorgänge bewerten

## Freitext
- F: Erläutern Sie, warum ein Index auf `mitarbeiter.azubi` kaum Nutzen bringt, ein Index auf `zeiterfassung.ma_id` dagegen schon. | M: azubi hat nur zwei Werte (geringe Selektivität); ein Index würde viele Zeilen liefern, ein Scan ist ähnlich schnell, außerdem ist die Tabelle klein. zeiterfassung ist groß (~2000 Zeilen), ma_id hat viele Werte und wird in WHERE/JOIN genutzt (Fremdschlüssel ohne automatischen Index) → gezielte SEARCH statt SCAN. | P: 4
- F: Nennen Sie zwei Vorteile und zwei Grenzen von Views am Beispiel der Firmen-DB. | M: Vorteile: Telefonliste ohne Gehalt (Datenschutz, GRANT nur auf View); Umsatz je Kunde einheitlich definiert und einfach abfragbar. Grenzen: keine eigene Beschleunigung, in SQLite nicht beschreibbar, kein ALTER VIEW, kann bei Schemaänderungen ungültig werden. | P: 4

## Szenario
### Datensparsame Telefonliste und schnelle Stundenauswertung
Die Personalabteilung der Netzilon GmbH möchte, dass der Empfang eine Telefonliste aller aktiven Mitarbeitenden sehen darf, aber keine Gehälter oder Geburtsdaten. Gleichzeitig beschweren sich Teamleitungen, dass die Monatsauswertung der Zeiterfassung pro Mitarbeitendem langsam ist.
- F: Wie setzen Sie die Telefonliste um? | A: View `v_telefonliste` mit nachname, vorname, abteilung, telefon, email und `WHERE austritt IS NULL`; in SQL Server `GRANT SELECT ON dbo.v_telefonliste TO rolle_empfang` ohne Rechte auf die Tabelle. | P: 3
- F: Wie finden Sie heraus, warum die Stundenauswertung langsam ist? | A: `EXPLAIN QUERY PLAN` (SQLite) bzw. tatsächlichen Ausführungsplan (SSMS) ansehen – SCAN über zeiterfassung zeigt fehlenden Index. | P: 2
- F: Welchen Index legen Sie an? | A: `CREATE INDEX idx_zeit_ma_datum ON zeiterfassung (ma_id, datum);` – passend zu `WHERE ma_id = ? AND datum BETWEEN ...`; in T-SQL ggf. `INCLUDE (stunden)`. | P: 3
- F: Eine Teamleitung schlägt vor, auf alle Spalten aller Tabellen Indizes zu legen. Bewerten Sie. | A: Abzulehnen: jeder Index kostet Speicher und verlangsamt Schreibvorgänge (Zeiterfassung wird täglich beschrieben); Indizes gezielt für häufige Filter/Joins anlegen. | P: 2
