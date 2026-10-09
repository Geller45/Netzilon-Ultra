---
id: db-labor-transaktionen
bereich: Datenbanken
block: D4
kapitel: SQL-Labor (Firmen-DB)
titel: Transaktionen und ACID – BEGIN, COMMIT, ROLLBACK, SAVEPOINT
stufe: Profi
fach: SQL / Datenbanken
pruefungen: [AP1, AP2, Schule]
quellen: [SQLite-Dokumentation, Microsoft Learn – T-SQL]
verweise: [db-transaktionen, db-backup-restore, db-labor-dml, db-labor-views-indizes]
---

## Profi

### Was ist eine Transaktion?
Eine **Transaktion** ist eine Folge von SQL-Anweisungen, die als **eine logische Einheit** behandelt wird: entweder werden **alle** Änderungen dauerhaft gespeichert (**COMMIT**) oder **keine** (**ROLLBACK**). Beispiele in der Firmen-DB der **Netzilon GmbH**: Budget zwischen zwei Abteilungen umbuchen, Bestellung mit allen Positionen anlegen, Mitarbeiter versetzen und Projektrollen anpassen. Probier es im SQL-Labor (Werkzeuge) aus.

### ACID
| Eigenschaft | Bedeutung | Beispiel Umbuchung |
|---|---|---|
| **A**tomicity (Atomarität) | alles oder nichts | Abbuchen und Gutschreiben passieren beide oder keins |
| **C**onsistency (Konsistenz) | von einem gültigen Zustand in den nächsten; Constraints bleiben erfüllt | Summe der Budgets bleibt gleich, kein negatives Budget (CHECK) |
| **I**solation | parallele Transaktionen beeinflussen sich nicht (je nach Isolationsstufe) | Andere sehen keinen Zwischenstand „Geld weg, aber noch nicht angekommen“ |
| **D**urability (Dauerhaftigkeit) | nach COMMIT bleibt die Änderung auch nach Absturz/Stromausfall erhalten | Journal/Write-Ahead-Log (WAL) bzw. Transaktionsprotokoll |

### Steuerbefehle (TCL)
- `BEGIN TRANSACTION;` (SQLite auch `BEGIN;`) – Transaktion starten.
- `COMMIT;` – Änderungen dauerhaft machen und Sperren freigeben.
- `ROLLBACK;` – alle Änderungen seit BEGIN verwerfen.
- `SAVEPOINT name;` – Zwischenstand markieren; `ROLLBACK TO name;` setzt nur bis dorthin zurück (Transaktion bleibt offen); `RELEASE name;` entfernt den Savepoint.
- **Autocommit**: Ohne explizites BEGIN ist **jede einzelne Anweisung** eine eigene Transaktion (SQLite und SQL Server standardmäßig).

### Beispiel: Budget-Umbuchung
Die Geschäftsführung bucht 20 000 Euro vom Budget des Vertriebs (abt_id 6) zur Ausbildung (abt_id 10) um:
```sql
BEGIN TRANSACTION;

UPDATE abteilungen SET budget = budget - 20000 WHERE abt_id = 6;
UPDATE abteilungen SET budget = budget + 20000 WHERE abt_id = 10;

-- Kontrolle: Vertriebsbudget darf nicht negativ werden
SELECT abt_id, name, budget FROM abteilungen WHERE abt_id IN (6, 10);

COMMIT;   -- bei Fehler oder negativem Budget stattdessen: ROLLBACK;
```
Stürzt das Programm zwischen den beiden UPDATEs ab, wird die unvollständige Transaktion beim nächsten Öffnen automatisch zurückgerollt (Atomarität über Journal/WAL).

### Fehler innerhalb einer Transaktion
Wichtig: Ein Fehler in **einer** Anweisung bricht in SQLite **nicht automatisch** die ganze Transaktion ab. Nur die fehlerhafte Anweisung schlägt fehl (bei Constraint-Verletzung mit Standard-Konfliktauflösung ABORT), die vorherigen Änderungen bleiben in der offenen Transaktion. Die Anwendung muss den Fehler erkennen und `ROLLBACK` ausführen. In SQL Server entsprechend: Nicht jeder Fehler bricht ab – deshalb `SET XACT_ABORT ON` oder `TRY…CATCH` mit ROLLBACK.

### SAVEPOINT – Teilrücknahme
Neue Bestellung mit Positionen; eine Position soll wieder verworfen werden:
```sql
BEGIN;
INSERT INTO bestellungen (kunde_id, ma_id, datum, status) VALUES (1, 2, '2026-03-02', 'offen');
INSERT INTO bestellpositionen (best_id, pos, artikel_id, menge, einzelpreis)
VALUES (last_insert_rowid(), 1, 1, 2, 899.00);
SAVEPOINT vor_pos2;
INSERT INTO bestellpositionen (best_id, pos, artikel_id, menge, einzelpreis)
VALUES ((SELECT MAX(best_id) FROM bestellungen), 2, 2, 50, 449.00);
ROLLBACK TO vor_pos2;     -- nur Position 2 verwerfen
RELEASE vor_pos2;
COMMIT;                   -- Bestellung + Position 1 bleiben
```

### Isolationsstufen (Überblick, SQL Server)
Parallele Transaktionen können folgende **Anomalien** erzeugen:
- **Dirty Read**: Lesen nicht bestätigter Daten einer anderen Transaktion (die später zurückgerollt wird).
- **Non-repeatable Read**: Dieselbe Zeile liefert beim zweiten Lesen einen anderen Wert (zwischendurch von anderen geändert und bestätigt).
- **Phantom Read**: Dieselbe Abfrage liefert beim zweiten Mal **zusätzliche/fehlende Zeilen** (neue Zeilen eingefügt).
- **Lost Update**: Zwei Transaktionen lesen denselben Wert und überschreiben sich gegenseitig.

| Isolationsstufe (SQL Server) | Dirty Read | Non-repeatable | Phantom | Mechanismus |
|---|---|---|---|---|
| READ UNCOMMITTED | möglich | möglich | möglich | keine Lesesperren (`NOLOCK`) |
| READ COMMITTED (**Standard**) | verhindert | möglich | möglich | kurze Lesesperren bzw. Zeilenversionen (RCSI) |
| REPEATABLE READ | verhindert | verhindert | möglich | Lesesperren bis Transaktionsende |
| SERIALIZABLE | verhindert | verhindert | verhindert | Bereichssperren (key-range locks) |
| SNAPSHOT | verhindert | verhindert | verhindert | Zeilenversionen in tempdb, Update-Konflikt bei Kollision |

Einstellung: `SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;` vor `BEGIN TRANSACTION`.

### Sperren (Locks)
- **Shared Lock (S)**: Lesesperre – mehrere Leser gleichzeitig möglich.
- **Exclusive Lock (X)**: Schreibsperre – exklusiv, blockiert andere Schreiber (und je nach Stufe Leser).
- **Update Lock (U)** (SQL Server): vor dem Ändern, verhindert eine typische Deadlock-Form.
- **Granularität** in SQL Server: Zeile → Seite → Tabelle (Lock Escalation).
- **Deadlock**: Transaktion A wartet auf B, B wartet auf A. SQL Server erkennt das und bricht ein „Opfer“ ab (Fehler 1205). Vorbeugen: Tabellen immer in derselben Reihenfolge ändern, Transaktionen kurz halten.
- **SQLite** sperrt die **gesamte Datenbankdatei**: beliebig viele Leser, aber nur **ein Schreiber** gleichzeitig. `BEGIN DEFERRED` (Standard, Sperre erst beim ersten Zugriff), `BEGIN IMMEDIATE` (Schreibsperre sofort), `BEGIN EXCLUSIVE`. Im WAL-Modus blockieren Leser und Schreiber sich nicht gegenseitig. Transaktionen in SQLite sind **serialisierbar**.

### T-SQL-Unterschied
| Thema | SQLite (SQL-Labor) | T-SQL (SQL Server) |
|---|---|---|
| Start | `BEGIN;` / `BEGIN TRANSACTION;` / `BEGIN IMMEDIATE;` | `BEGIN TRANSACTION;` (`BEGIN TRAN`), optional benannt |
| Savepoint | `SAVEPOINT sp;` / `ROLLBACK TO sp;` / `RELEASE sp;` | `SAVE TRANSACTION sp;` / `ROLLBACK TRANSACTION sp;` (kein RELEASE) |
| Fehlerbehandlung | in der Anwendung (sql.js: try/catch) | `BEGIN TRY … COMMIT … END TRY BEGIN CATCH IF @@TRANCOUNT > 0 ROLLBACK; THROW; END CATCH` |
| Automatischer Abbruch | nein (außer `ON CONFLICT ROLLBACK`) | `SET XACT_ABORT ON` |
| Offene Transaktionen | `sqlite3_get_autocommit()` (API) | `@@TRANCOUNT`, `DBCC OPENTRAN` |
| Isolationsstufen | faktisch SERIALIZABLE; `PRAGMA read_uncommitted` nur bei Shared Cache | 5 Stufen, Standard READ COMMITTED |
| Sperrebene | ganze Datenbankdatei | Zeile/Seite/Tabelle, Deadlock-Erkennung |
| Haltbarkeit | Rollback-Journal oder WAL-Datei | Transaktionsprotokoll (.ldf), Wiederherstellungsmodell FULL/SIMPLE |
| Implizite Transaktionen | – | `SET IMPLICIT_TRANSACTIONS ON` (wie Oracle: nach jedem Befehl COMMIT nötig) |

## Einfach

Stell dir vor, du gibst deinem Freund 10 Euro. Dazu passieren **zwei** Dinge: Du hast 10 Euro **weniger**, er hat 10 Euro **mehr**. Was wäre, wenn genau dazwischen etwas schiefgeht – das Geld ist bei dir weg, kommt aber nie bei ihm an? Das darf nicht passieren!

Eine **Transaktion** ist wie ein **Versprechen**: „Entweder klappt **alles**, oder es bleibt **alles wie vorher**.“
- **BEGIN** – „Achtung, jetzt fängt ein zusammenhängender Vorgang an.“
- **COMMIT** – „Alles hat geklappt, jetzt gilt es endgültig!“ (Wie „Speichern“.)
- **ROLLBACK** – „Abbruch! Alles zurück wie vorher.“ (Wie „Rückgängig“ für den ganzen Vorgang.)
- **SAVEPOINT** – ein **Zwischenspeicherpunkt** wie in einem Videospiel: Du kannst zu diesem Punkt zurück, ohne ganz von vorne anzufangen.

Die vier Regeln heißen **ACID**:
- **A** – Alles oder nichts.
- **C** – Am Ende stimmt alles (keine Regel ist gebrochen).
- **I** – Jeder arbeitet wie allein: Andere sehen deinen halbfertigen Vorgang nicht.
- **D** – Was gespeichert ist, bleibt gespeichert – auch wenn danach der Strom ausfällt.

Bei der Netzilon GmbH ist das z. B. wichtig, wenn Budget von einer Abteilung zur anderen geschoben wird. Probier es im SQL-Labor (Werkzeuge) aus: Starte mit BEGIN, ändere etwas, schau es dir an – und mach es mit ROLLBACK wieder rückgängig.

## Merksatz
- **ACID: Alles oder nichts, Constraints halten, Isoliert arbeiten, Dauerhaft speichern.**
- BEGIN öffnet, COMMIT speichert, ROLLBACK verwirft.
- SAVEPOINT = Zwischenstand, ROLLBACK TO = nur bis dahin zurück.
- Ohne BEGIN: Autocommit – jede Anweisung ist eine Transaktion.
- Transaktionen kurz halten – Sperren blockieren andere.
- SQL Server Standard: READ COMMITTED.

## Prüfungsfalle
- ROLLBACK nach COMMIT ist wirkungslos – bestätigt ist bestätigt.
- Ein Fehler in einer Anweisung rollt die Transaktion nicht automatisch zurück (SQLite; SQL Server ohne XACT_ABORT).
- Dirty Read gibt es nur bei READ UNCOMMITTED.
- Phantom ≠ Non-repeatable Read: Phantom = neue/fehlende **Zeilen**, Non-repeatable = geänderter **Wert**.
- C in ACID heißt Consistency (Konsistenz), nicht „Commit“.
- SQLite: DDL (CREATE/DROP) ist ebenfalls transaktional und kann zurückgerollt werden; in SQL Server meist auch, `TRUNCATE` inklusive.
- SQL Server: `SAVE TRANSACTION` statt `SAVEPOINT`.

## Grafik
### Budget-Umbuchung mit Absturz
1. Anwendung -> SQLite: BEGIN TRANSACTION
2. Anwendung -> SQLite: UPDATE Vertrieb budget minus 20000
3. SQLite: schreibt Änderung zuerst ins Journal
4. Stromausfall: Programm bricht vor dem zweiten UPDATE ab
5. SQLite: erkennt beim Neustart das Journal und rollt zurück
6. Ergebnis: Vertriebsbudget unverändert, nichts geht verloren

### Lost Update ohne Sperre
1. Transaktion A: liest lagerbestand 10
2. Transaktion B: liest lagerbestand 10
3. Transaktion A: schreibt 10 - 3 = 7
4. Transaktion B: schreibt 10 - 5 = 5
5. Ergebnis: Bestand 5 statt 2 – Änderung von A verloren

### Savepoint
1. Admin: BEGIN und INSERT Bestellung
2. Admin: INSERT Position 1
3. Admin: SAVEPOINT vor_pos2
4. Admin: INSERT Position 2 mit falscher Menge
5. Admin: ROLLBACK TO vor_pos2 entfernt nur Position 2
6. Admin: COMMIT speichert Bestellung und Position 1

## Lab
### GUI
Maschine: SQL-Labor in Netzilon (Werkzeuge → SQL-Labor), Firmen-DB „Netzilon GmbH“ (nach dem Lab zurücksetzen).
1. Budgets von Vertrieb (6) und Ausbildung (10) sowie die Gesamtsumme notieren.
2. Umbuchung in einer Transaktion durchführen und mit COMMIT bestätigen.
3. Gesamtsumme der Budgets erneut prüfen – sie muss gleich geblieben sein.
4. Einen „Fehler“ simulieren: BEGIN, alle Gehälter auf 1 setzen, prüfen, ROLLBACK.
5. Savepoint-Beispiel mit einer neuen Bestellung durchspielen.
6. Fehler in der Transaktion provozieren (CHECK-Verletzung) und beobachten, dass die erste Änderung noch offen ist.

```sql
-- 1 bis 3
SELECT abt_id, name, budget FROM abteilungen WHERE abt_id IN (6, 10);
SELECT SUM(budget) AS gesamt_vorher FROM abteilungen;
BEGIN TRANSACTION;
UPDATE abteilungen SET budget = budget - 20000 WHERE abt_id = 6;
UPDATE abteilungen SET budget = budget + 20000 WHERE abt_id = 10;
COMMIT;
SELECT SUM(budget) AS gesamt_nachher FROM abteilungen;

-- 4
BEGIN;
UPDATE mitarbeiter SET gehalt = 1;
SELECT COUNT(*) AS betroffen FROM mitarbeiter WHERE gehalt = 1;
ROLLBACK;
SELECT MIN(gehalt), MAX(gehalt) FROM mitarbeiter;

-- 5
BEGIN;
INSERT INTO bestellungen (kunde_id, ma_id, datum, status) VALUES (1, 2, '2026-03-02', 'offen');
INSERT INTO bestellpositionen (best_id, pos, artikel_id, menge, einzelpreis)
VALUES ((SELECT MAX(best_id) FROM bestellungen), 1, 1, 2, 899.00);
SAVEPOINT vor_pos2;
INSERT INTO bestellpositionen (best_id, pos, artikel_id, menge, einzelpreis)
VALUES ((SELECT MAX(best_id) FROM bestellungen), 2, 2, 50, 449.00);
ROLLBACK TO vor_pos2;
RELEASE vor_pos2;
COMMIT;
SELECT * FROM bestellpositionen WHERE best_id = (SELECT MAX(best_id) FROM bestellungen);
```

```text
-- 6: Ablauf und erwartete Meldungen
BEGIN;
UPDATE abteilungen SET budget = budget - 1000 WHERE abt_id = 6;     -- ok
UPDATE mitarbeiter SET gehalt = -5 WHERE ma_id = 1;                 -- CHECK constraint failed
SELECT budget FROM abteilungen WHERE abt_id = 6;                    -- zeigt bereits -1000!
ROLLBACK;                                                           -- Anwendung muss selbst zurückrollen
```

### T-SQL
Maschine: SQL01.example.com, SSMS, Datenbank `Netzilon`.
1. Umbuchung mit TRY…CATCH und XACT_ABORT absichern.
2. In einem zweiten Abfragefenster während offener Transaktion lesen – Blockierung beobachten (READ COMMITTED).
3. Mit `SELECT @@TRANCOUNT;` offene Transaktionen prüfen.

```tsql
USE Netzilon;
SET XACT_ABORT ON;
BEGIN TRY
  BEGIN TRANSACTION;
    UPDATE dbo.abteilungen SET budget = budget - 20000 WHERE abt_id = 6;
    UPDATE dbo.abteilungen SET budget = budget + 20000 WHERE abt_id = 10;
    IF EXISTS (SELECT 1 FROM dbo.abteilungen WHERE budget < 0)
      THROW 50001, N'Budget darf nicht negativ werden.', 1;
  COMMIT TRANSACTION;
END TRY
BEGIN CATCH
  IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
  THROW;
END CATCH;

-- Fenster 2 (zweite Sitzung), während Fenster 1 eine Transaktion offen hält:
SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
SELECT budget FROM dbo.abteilungen WHERE abt_id = 6;   -- wartet auf die Sperre
```

## Legende
### Transaktion
- Was: Folge von Anweisungen als unteilbare Einheit (alles oder nichts).
- Wie: `BEGIN TRANSACTION; ... COMMIT;` bzw. `ROLLBACK;`, Teilrücknahme mit SAVEPOINT.
- Wann: Wenn mehrere Änderungen fachlich zusammengehören (Umbuchung, Bestellung mit Positionen).
- Wo: SQL-Labor (SQLite, Datenbank-Sperre), SQL01.example.com (T-SQL, Zeilen-/Seitensperren).
- Warum: Verhindert inkonsistente Zwischenzustände bei Fehlern, Abstürzen und paralleler Nutzung.
### ACID
- Was: Atomicity, Consistency, Isolation, Durability – Grundeigenschaften von Transaktionen.
- Wie: Journal/Protokoll (A, D), Constraints (C), Sperren/Zeilenversionen (I).
- Beispiel: Budget-Umbuchung zwischen Vertrieb und Ausbildung.
### Isolationsstufe
- Was: Grad der Abschirmung paralleler Transaktionen.
- Wie: `SET TRANSACTION ISOLATION LEVEL ...` (SQL Server), Standard READ COMMITTED.
- Warum: Abwägung zwischen Konsistenz (weniger Anomalien) und Parallelität (weniger Sperren).

## Karteikarten
- F: Wofür steht ACID? | A: Atomicity (alles oder nichts), Consistency (gültiger Zustand), Isolation (keine Beeinflussung), Durability (dauerhaft nach COMMIT).
- F: Was bewirkt ROLLBACK? | A: Verwirft alle Änderungen seit BEGIN der aktuellen Transaktion.
- F: Was ist ein SAVEPOINT? | A: Ein benannter Zwischenstand in einer Transaktion, zu dem man mit ROLLBACK TO zurückkehren kann.
- F: Was ist Autocommit? | A: Ohne explizites BEGIN wird jede einzelne Anweisung sofort als eigene Transaktion bestätigt.
- F: Was ist ein Dirty Read? | A: Lesen von Änderungen einer anderen Transaktion, die noch nicht bestätigt (und evtl. zurückgerollt) sind.
- F: Was ist ein Phantom Read? | A: Eine wiederholte Abfrage liefert zusätzliche oder fehlende Zeilen, weil andere Zeilen eingefügt/gelöscht haben.
- F: Standard-Isolationsstufe in SQL Server? | A: READ COMMITTED.
- F: Welche Isolationsstufe verhindert alle drei Anomalien durch Sperren? | A: SERIALIZABLE.
- F: Was ist ein Deadlock? | A: Zwei Transaktionen warten gegenseitig auf Sperren des anderen; SQL Server bricht eine ab (Fehler 1205).
- F: Wie sperrt SQLite? | A: Die gesamte Datenbankdatei – viele Leser, aber nur ein Schreiber gleichzeitig.
- F: Wie heißt SAVEPOINT in T-SQL? | A: `SAVE TRANSACTION name;` und Rücksprung mit `ROLLBACK TRANSACTION name;`.
- F: Wozu dient `SET XACT_ABORT ON`? | A: Bei einem Laufzeitfehler wird die gesamte Transaktion automatisch zurückgerollt.

## Quiz
? Wofür steht das „A“ in ACID?
- Availability
* Atomicity
- Authentication
- Auditing
! Atomarität = alles oder nichts.

? Was passiert bei `BEGIN; UPDATE mitarbeiter SET gehalt = 1; ROLLBACK;`?
- Alle Gehälter sind danach 1
* Die Gehälter bleiben unverändert
- Nur das erste Gehalt wird geändert
- Es entsteht ein Syntaxfehler
! ROLLBACK verwirft alle Änderungen seit BEGIN.

? In einer SQLite-Transaktion schlägt das zweite von drei UPDATEs wegen CHECK fehl. Was gilt?
- Alle drei UPDATEs werden automatisch zurückgerollt
- Die Transaktion wird automatisch bestätigt
* Das erste UPDATE bleibt in der offenen Transaktion; die Anwendung muss entscheiden
- Die Datenbank wird gesperrt, bis sie neu gestartet wird
! Nur die fehlerhafte Anweisung wird abgebrochen; ROLLBACK muss explizit erfolgen.

? Welche Anomalie beschreibt: „Transaktion A liest einen Wert, den B geändert, aber noch nicht bestätigt hat“?
* Dirty Read
- Phantom Read
- Lost Update
- Deadlock
! Möglich nur bei READ UNCOMMITTED.

? Welche Isolationsstufe ist in SQL Server Standard?
- READ UNCOMMITTED
- SERIALIZABLE
- SNAPSHOT
* READ COMMITTED
! Dirty Reads werden verhindert, Non-repeatable und Phantom Reads sind möglich.

? Wie lautet die Savepoint-Syntax in T-SQL?
- `SAVEPOINT sp1;`
- `CREATE SAVEPOINT sp1;`
* `SAVE TRANSACTION sp1;`
- `BEGIN SAVEPOINT sp1;`
! Zurück mit `ROLLBACK TRANSACTION sp1;` – ein RELEASE gibt es in T-SQL nicht.

? Was bewirkt `ROLLBACK TO vor_pos2;` in SQLite?
- Beendet die Transaktion und verwirft alles
* Nimmt die Änderungen nach dem Savepoint zurück, die Transaktion bleibt offen
- Bestätigt alle Änderungen bis zum Savepoint
- Löscht den Savepoint ohne Rücknahme
! Für das Entfernen des Savepoints ohne Rücknahme dient RELEASE.

? Zwei Transaktionen lesen Lagerbestand 10, A schreibt 7, B schreibt 5. Wie heißt das Problem?
- Dirty Read
- Phantom Read
- Deadlock
* Lost Update
! Die Änderung von A wird überschrieben. Abhilfe: Sperren, `SET lagerbestand = lagerbestand - 5` statt Lesen/Schreiben, höhere Isolation.

? Welche ACID-Eigenschaft wird durch das Transaktionsprotokoll bzw. Journal nach einem Stromausfall sichergestellt?
- Isolation
- Consistency
* Durability (und Atomicity)
- Keine, dafür braucht man ein Backup
! Bestätigte Änderungen werden wiederhergestellt, unbestätigte zurückgerollt.

? Wie viele gleichzeitige Schreiber erlaubt SQLite auf eine Datenbankdatei?
* Einen
- Zwei
- Einen pro Tabelle
- Beliebig viele
! SQLite sperrt die ganze Datei; im WAL-Modus können Leser parallel zum Schreiber lesen.

? Welche Isolationsstufe verhindert Phantom Reads durch Bereichssperren?
- READ COMMITTED
- REPEATABLE READ
- READ UNCOMMITTED
* SERIALIZABLE
! REPEATABLE READ schützt gelesene Zeilen, aber nicht vor neu eingefügten.

? Was gibt `@@TRANCOUNT` in SQL Server zurück?
- Anzahl abgeschlossener Transaktionen seit Serverstart
* Anzahl offener (verschachtelter) Transaktionen der Sitzung
- Anzahl gesperrter Tabellen
- Anzahl geänderter Zeilen
! 0 = keine offene Transaktion; `@@ROWCOUNT` liefert die geänderten Zeilen.

## Lücken
- Eine Transaktion beginnt mit {BEGIN TRANSACTION|BEGIN}, wird mit {COMMIT} bestätigt und mit {ROLLBACK} verworfen.
- ACID steht für Atomicity, {Consistency}, Isolation und {Durability}.
- Die Standard-Isolationsstufe von SQL Server ist {READ COMMITTED}.
- Einen Zwischenstand setzt man in SQLite mit {SAVEPOINT}, in T-SQL mit SAVE TRANSACTION.

## Zuordnen
### Anomalie und Beschreibung
- Dirty Read => Lesen unbestätigter Änderungen
- Non-repeatable Read => gleiche Zeile, anderer Wert beim zweiten Lesen
- Phantom Read => zusätzliche oder fehlende Zeilen beim zweiten Lesen
- Lost Update => parallele Änderung wird überschrieben
- Deadlock => gegenseitiges Warten auf Sperren

## Reihenfolge
### Budget-Umbuchung als Transaktion
1. BEGIN TRANSACTION
2. UPDATE: Budget Vertrieb um 20000 senken
3. UPDATE: Budget Ausbildung um 20000 erhöhen
4. SELECT: Budgets und Gesamtsumme kontrollieren
5. COMMIT bei korrekten Werten, sonst ROLLBACK

## Freitext
- F: Erläutern Sie die ACID-Eigenschaften am Beispiel einer Bestellung mit drei Positionen in der Firmen-DB. | M: Atomicity: Bestellung und alle drei Positionen werden gemeinsam gespeichert oder gar nicht. Consistency: Fremdschlüssel (kunde_id, artikel_id) und CHECKs (menge > 0, status) bleiben erfüllt. Isolation: Andere Nutzer sehen keine halbe Bestellung. Durability: Nach COMMIT bleibt die Bestellung auch bei Absturz erhalten (Journal/Protokoll). | P: 6
- F: Unterscheiden Sie Non-repeatable Read und Phantom Read und nennen Sie die jeweils mindestens nötige Isolationsstufe zur Vermeidung. | M: Non-repeatable Read: dieselbe Zeile hat beim erneuten Lesen einen anderen Wert – verhindert ab REPEATABLE READ. Phantom Read: bei erneuter Abfrage tauchen neue Zeilen auf/verschwinden – verhindert erst bei SERIALIZABLE (oder SNAPSHOT). | P: 4

## Szenario
### Versetzung einer Mitarbeiterin
Die Personalabteilung der Netzilon GmbH möchte eine Mitarbeiterin (ma_id 23) zum 1. April 2026 vom IT-Support (abt_id 3) in die Abteilung Netzwerk & Sicherheit (abt_id 4) versetzen. Dabei ändern sich Abteilung, Vorgesetzte(r) und Gehalt; außerdem soll sie aus allen Projekten des Supports als „Unterstützung“ ausgetragen werden. Bricht ein Schritt ab, darf kein halber Zustand entstehen.
- F: Warum muss der Vorgang als Transaktion laufen? | A: Mehrere zusammengehörige Änderungen (mitarbeiter, projekt_mitarbeiter); bei Fehler sonst inkonsistenter Zustand – Atomarität. | P: 2
- F: Schreiben Sie den Ablauf in SQLite. | A: `BEGIN; UPDATE mitarbeiter SET abt_id = 4, vorgesetzter_id = (SELECT leiter_id FROM abteilungen WHERE abt_id = 4), gehalt = ROUND(gehalt * 1.05, 2) WHERE ma_id = 23; DELETE FROM projekt_mitarbeiter WHERE ma_id = 23 AND rolle = 'Unterstützung'; COMMIT;` – bei Fehler ROLLBACK. | P: 4
- F: Wie sichern Sie den Vorgang in T-SQL ab? | A: `SET XACT_ABORT ON; BEGIN TRY BEGIN TRANSACTION; ... COMMIT; END TRY BEGIN CATCH IF @@TRANCOUNT > 0 ROLLBACK; THROW; END CATCH;` | P: 3
- F: Während der Transaktion läuft ein Gehaltsreport in einer anderen Sitzung (READ COMMITTED). Was sieht er? | A: Er sieht den alten, bestätigten Stand bzw. wartet auf die Sperre (ohne RCSI); keine unbestätigten Werte (kein Dirty Read). | P: 2
