---
id: db-labor-dml
bereich: Datenbanken
block: D4
kapitel: SQL-Labor (Firmen-DB)
titel: INSERT, UPDATE, DELETE – Daten sicher ändern
stufe: Fortgeschritten
fach: SQL / Datenbanken
pruefungen: [AP1, AP2, Schule]
quellen: [SQLite-Dokumentation, Microsoft Learn – T-SQL]
verweise: [db-dml, db-labor-ddl, db-labor-transaktionen, db-labor-select]
---

## Profi

### Überblick DML
Die **Data Manipulation Language** ändert Daten: `INSERT` (einfügen), `UPDATE` (ändern), `DELETE` (löschen). Alle Beispiele beziehen sich auf die Firmen-DB der **Netzilon GmbH**. Probier es im SQL-Labor (Werkzeuge) aus – die Labor-DB lässt sich jederzeit zurücksetzen, deshalb darfst du dort gefahrlos löschen.

### INSERT – einfügen
**Immer mit Spaltenliste** schreiben – dann ist die Reihenfolge eindeutig und neue Spalten brechen den Befehl nicht:
```sql
INSERT INTO kunden (firma, branche, stadt, plz, ansprechpartner, email, seit)
VALUES ('Elbwerft Beispiel GmbH', 'Maschinenbau', 'Hamburg', '20457',
        'Frau Muster', 'einkauf@elbwerft.example', '2026-02-01');
```
`kunde_id` fehlt in der Liste: Als `INTEGER PRIMARY KEY` wird sie in SQLite automatisch vergeben (nächster Wert nach dem höchsten, Alias für die interne `rowid`). Abfragen: `SELECT last_insert_rowid();`.
Nicht genannte Spalten erhalten ihren **DEFAULT** (z. B. `wochenstunden` = 40, `azubi` = 0) oder NULL.

**Mehrzeilig** (multi-row insert) in einer Anweisung:
```sql
INSERT INTO artikel (bezeichnung, kategorie, einkaufspreis, verkaufspreis, lagerbestand)
VALUES ('USB-C-Dockingstation', 'Hardware', 95.00, 149.00, 20),
       ('Headset kabellos',     'Hardware', 48.50,  79.90, 35),
       ('Patchkabel Cat6 3 m',  'Zubehör',   1.20,   3.90, 400);
```

**INSERT … SELECT** – Ergebnis einer Abfrage einfügen, z. B. alle aktiven Azubis in ein neues Projekt „Azubi-Lernlabor“ (projekt_id 3 als Beispiel):
```sql
INSERT INTO projekt_mitarbeiter (projekt_id, ma_id, rolle, stunden_geplant)
SELECT 3, ma_id, 'Azubi', 40
FROM mitarbeiter
WHERE azubi = 1 AND austritt IS NULL;
```
Bei Konflikten mit dem Primärschlüssel hilft in SQLite `INSERT OR IGNORE` bzw. **Upsert**: `... ON CONFLICT (projekt_id, ma_id) DO UPDATE SET stunden_geplant = excluded.stunden_geplant`.

### UPDATE – ändern
```sql
-- Gehaltserhöhung 3 % für den IT-Support (abt_id 3), nur aktive
UPDATE mitarbeiter
SET gehalt = ROUND(gehalt * 1.03, 2)
WHERE abt_id = 3 AND austritt IS NULL;
```
Mehrere Spalten: `SET position = 'Teamleitung', gehalt = 5200 WHERE ma_id = 17;`
Mit Unterabfrage: Status aller Bestellungen eines Kunden aus Leipzig ändern:
```sql
UPDATE bestellungen
SET status = 'versendet'
WHERE status = 'offen'
  AND kunde_id IN (SELECT kunde_id FROM kunden WHERE stadt = 'Leipzig');
```
Alle Ausdrücke rechts von SET sehen die **alten** Werte der Zeile (`SET a = b, b = a` tauscht).

### DELETE – löschen
```sql
DELETE FROM zeiterfassung
WHERE datum < '2025-01-01';
```
`DELETE FROM tabelle;` **ohne WHERE löscht alle Zeilen** (Tabelle bleibt bestehen). `DROP TABLE` entfernt dagegen die ganze Tabelle (DDL).

### Die „WHERE vergessen“-Falle
`UPDATE mitarbeiter SET gehalt = 5000;` setzt **alle 100** Gehälter auf 5000. Schutzmaßnahmen:
1. Erst als **SELECT** mit gleichem WHERE testen und Zeilen zählen.
2. In einer **Transaktion** ausführen (`BEGIN; UPDATE …; SELECT …; COMMIT;` oder `ROLLBACK;`).
3. Anzahl geänderter Zeilen prüfen (SQLite `changes()`, SQL Server `@@ROWCOUNT`, SSMS-Meldung „(100 rows affected)“).
4. Backup vor Massenänderungen; in Produktion Rechte einschränken.

### Fremdschlüssel-Verletzungen (FK violations)
Die Labor-DB läuft mit `PRAGMA foreign_keys = ON` (in SQLite standardmäßig **aus**!). Dann gilt:
- **INSERT/UPDATE** mit nicht existierendem Bezug schlägt fehl: `INSERT INTO bestellungen (kunde_id, datum, status) VALUES (9999, '2026-01-10', 'offen');` → *FOREIGN KEY constraint failed*.
- **DELETE** eines referenzierten Datensatzes schlägt fehl (Standardaktion NO ACTION): Kunde mit Bestellungen löschen → Fehler. Erst die abhängigen Zeilen (Bestellpositionen → Bestellungen) löschen oder `ON DELETE CASCADE` im Schema definieren.
- Reihenfolge beim Löschen: **Kind vor Eltern** (bestellpositionen → bestellungen → kunden); beim Einfügen umgekehrt: **Eltern vor Kind**.

### Weitere Constraint-Verletzungen
- `CHECK`: `UPDATE mitarbeiter SET gehalt = 0 WHERE ma_id = 1;` → *CHECK constraint failed* (gehalt > 0).
- `NOT NULL`: `INSERT INTO mitarbeiter (vorname, nachname) VALUES ('Test', 'Person');` → eintritt fehlt.
- `UNIQUE`: doppelter `benutzername` oder doppelte `email`.
- `CHECK` mit IN-Liste: `status = 'geliefert'` ist kein erlaubter Bestellstatus.

### T-SQL-Unterschied
| Thema | SQLite (SQL-Labor) | T-SQL (SQL Server) |
|---|---|---|
| Automatische ID | `INTEGER PRIMARY KEY` (rowid), optional `AUTOINCREMENT` | `INT IDENTITY(1,1)` |
| Letzte ID | `last_insert_rowid()` | `SCOPE_IDENTITY()` oder `OUTPUT inserted.kunde_id` |
| Wert in ID-Spalte erzwingen | einfach angeben | `SET IDENTITY_INSERT dbo.kunden ON;` |
| Geänderte Zeilen | `changes()` | `@@ROWCOUNT` |
| Upsert | `INSERT ... ON CONFLICT DO UPDATE` | `MERGE` oder `UPDATE` + `IF @@ROWCOUNT = 0 INSERT` |
| Erste n Zeilen ändern | `UPDATE ... WHERE rowid IN (SELECT rowid ... LIMIT n)` | `UPDATE TOP (n) ...` / `DELETE TOP (n) ...` |
| UPDATE mit Join | `UPDATE ... FROM` (seit 3.33) | `UPDATE m SET ... FROM dbo.mitarbeiter m JOIN ...` |
| Geänderte Zeilen zurückgeben | `RETURNING *` (seit 3.35) | `OUTPUT inserted.*, deleted.*` |
| Fremdschlüssel aktiv | nur mit `PRAGMA foreign_keys = ON` | immer aktiv (sofern nicht `NOCHECK`) |
| Alle Zeilen schnell löschen | `DELETE FROM t;` (intern optimiert) | `TRUNCATE TABLE t;` (DDL, nicht bei FK-Verweisen) |

## Einfach

Bisher hast du nur **geschaut** (SELECT). Jetzt **arbeitest** du mit den Karteikarten der Netzilon GmbH:

- **INSERT** = eine **neue Karte** in die Schublade legen. Du schreibst dazu, welche Felder du ausfüllst (Spaltenliste) und was hineinkommt (VALUES). Die Kartennummer (ID) vergibt die Datenbank selbst.
- **UPDATE** = mit dem **Radiergummi** etwas auf vorhandenen Karten ändern. Mit **WHERE** sagst du, **welche** Karten.
- **DELETE** = Karten **wegwerfen** – wieder mit WHERE, welche.

Die gefährlichste Falle: **WHERE vergessen!** Dann radierst du nicht eine Karte, sondern **alle 100**. Stell dir vor, du willst einer Kollegin mehr Gehalt geben und plötzlich verdienen alle gleich viel. Deshalb: Vorher mit **SELECT** schauen, welche Karten getroffen werden.

Die Datenbank passt auch auf: Eine Bestellung muss zu einem **existierenden** Kunden gehören. Willst du eine Bestellung für Kunde 9999 anlegen, den es nicht gibt, sagt sie „Nein!“ (Fremdschlüssel). Und einen Kunden, der noch Bestellungen hat, darfst du nicht einfach wegwerfen – sonst hätten die Bestellungen keinen „Besitzer“ mehr.

Probier es im SQL-Labor (Werkzeuge) aus – dort kannst du die Datenbank jederzeit zurücksetzen.

## Merksatz
- **Erst SELECT, dann UPDATE/DELETE.**
- UPDATE/DELETE ohne WHERE trifft **alle** Zeilen.
- INSERT immer mit Spaltenliste.
- Einfügen: Eltern vor Kind – Löschen: Kind vor Eltern.
- SQLite prüft Fremdschlüssel nur mit `PRAGMA foreign_keys = ON`.

## Prüfungsfalle
- `DELETE FROM kunden` ohne WHERE löscht alle Kunden – die Tabelle bleibt aber erhalten.
- DELETE ist DML (zeilenweise, Transaktion möglich), TRUNCATE ist DDL, DROP entfernt die Tabelle.
- `INSERT INTO artikel VALUES (...)` ohne Spaltenliste verlangt **alle** Spalten in Tabellenreihenfolge.
- `UPDATE … SET gehalt = gehalt * 1.03` ohne WHERE = Erhöhung für alle.
- Löschen eines referenzierten Kunden scheitert an der FK-Prüfung (oder kaskadiert, wenn ON DELETE CASCADE gesetzt ist).
- SQLite ohne `PRAGMA foreign_keys = ON` akzeptiert verwaiste Fremdschlüssel kommentarlos.

## Grafik
### Sicheres Massen-UPDATE
1. Admin: schreibt SELECT mit dem geplanten WHERE
2. SQLite -> Admin: zeigt die betroffenen Zeilen (z. B. 12)
3. Admin: BEGIN startet die Transaktion
4. Admin: führt UPDATE mit identischem WHERE aus
5. SQLite -> Admin: meldet 12 geänderte Zeilen
6. Admin: COMMIT, weil die Anzahl stimmt

### Fremdschlüssel-Prüfung
1. Client -> SQLite: INSERT INTO bestellungen mit kunde_id 9999
2. SQLite: sucht kunde_id 9999 in kunden
3. SQLite: kein Treffer gefunden
4. SQLite -> Client: FOREIGN KEY constraint failed

## Lab
### GUI
Maschine: SQL-Labor in Netzilon (Werkzeuge → SQL-Labor), Firmen-DB „Netzilon GmbH“ (nach dem Lab zurücksetzen).
1. Einen neuen Kunden einfügen und die vergebene ID mit `last_insert_rowid()` abfragen.
2. Drei Artikel mit einem mehrzeiligen INSERT anlegen.
3. Vor der Gehaltserhöhung per SELECT prüfen, wie viele Zeilen betroffen sind.
4. Gehaltserhöhung in einer Transaktion ausführen und mit `changes()` kontrollieren.
5. Eine FK-Verletzung provozieren (Bestellung für nicht existierenden Kunden).
6. Eine CHECK-Verletzung provozieren (Gehalt 0).
7. Eine stornierte Bestellung samt Positionen in der richtigen Reihenfolge löschen.

```sql
-- 1
INSERT INTO kunden (firma, branche, stadt, seit)
VALUES ('Elbwerft Beispiel GmbH', 'Maschinenbau', 'Hamburg', '2026-02-01');
SELECT last_insert_rowid() AS neue_id;

-- 2
INSERT INTO artikel (bezeichnung, kategorie, einkaufspreis, verkaufspreis, lagerbestand)
VALUES ('USB-C-Dockingstation', 'Hardware', 95.00, 149.00, 20),
       ('Headset kabellos', 'Hardware', 48.50, 79.90, 35),
       ('Patchkabel Cat6 3 m', 'Zubehör', 1.20, 3.90, 400);

-- 3 und 4
SELECT COUNT(*) FROM mitarbeiter WHERE abt_id = 3 AND austritt IS NULL;
BEGIN;
UPDATE mitarbeiter SET gehalt = ROUND(gehalt * 1.03, 2) WHERE abt_id = 3 AND austritt IS NULL;
SELECT changes() AS geaendert;
COMMIT;

-- 7: Kind vor Eltern
DELETE FROM bestellpositionen
WHERE best_id IN (SELECT best_id FROM bestellungen WHERE status = 'storniert');
DELETE FROM bestellungen WHERE status = 'storniert';
```

```text
-- 5 und 6: erwartete Fehlermeldungen
INSERT INTO bestellungen (kunde_id, datum, status) VALUES (9999, '2026-01-10', 'offen');
  → FOREIGN KEY constraint failed
UPDATE mitarbeiter SET gehalt = 0 WHERE ma_id = 1;
  → CHECK constraint failed: gehalt > 0
```

### T-SQL
Maschine: SQL01.example.com, SSMS, Datenbank `Netzilon`.
1. Neuen Kunden mit `OUTPUT` einfügen und die IDENTITY-ID sofort zurückbekommen.
2. Gehaltserhöhung mit `@@ROWCOUNT` absichern.
3. Kundendaten per MERGE abgleichen (Upsert).

```tsql
USE Netzilon;
INSERT INTO dbo.kunden (firma, branche, stadt, seit)
OUTPUT inserted.kunde_id
VALUES (N'Elbwerft Beispiel GmbH', N'Maschinenbau', N'Hamburg', '2026-02-01');

BEGIN TRANSACTION;
UPDATE dbo.mitarbeiter SET gehalt = ROUND(gehalt * 1.03, 2)
WHERE abt_id = 3 AND austritt IS NULL;
IF @@ROWCOUNT > 20 ROLLBACK TRANSACTION; ELSE COMMIT TRANSACTION;
```

## Legende
### INSERT
- Was: Fügt neue Zeilen ein.
- Wie: `INSERT INTO t (spalten) VALUES (...), (...);` oder `INSERT INTO t (spalten) SELECT ...;`
- Wann: Neue Kunden, Artikel, Buchungen, Projektzuordnungen.
- Warum: Spaltenliste macht den Befehl robust gegen Schemaänderungen.
### UPDATE und DELETE
- Was: Ändern bzw. Löschen vorhandener Zeilen.
- Wie: `UPDATE t SET spalte = wert WHERE ...;` / `DELETE FROM t WHERE ...;`
- Wann: Gehaltsanpassung, Statuswechsel, Bereinigung alter Daten.
- Warum: WHERE begrenzt die Wirkung – ohne WHERE trifft es alle Zeilen.
### Fremdschlüssel-Verletzung
- Was: Verweis auf einen nicht existierenden Datensatz oder Löschen eines referenzierten Datensatzes.
- Wo: SQLite nur mit `PRAGMA foreign_keys = ON` (im SQL-Labor aktiv), SQL Server immer.
- Beispiel: Bestellung für kunde_id 9999 → FOREIGN KEY constraint failed.

## Karteikarten
- F: Warum INSERT immer mit Spaltenliste? | A: Eindeutige Zuordnung der Werte, robust gegen neue/umsortierte Spalten, DEFAULT-Werte greifen.
- F: Wie fügt man mehrere Zeilen in einer Anweisung ein? | A: `INSERT INTO t (a, b) VALUES (1, 2), (3, 4), (5, 6);`
- F: Was macht INSERT … SELECT? | A: Fügt das Ergebnis einer Abfrage als neue Zeilen ein (Spaltenanzahl und -reihenfolge müssen passen).
- F: Was passiert bei `UPDATE mitarbeiter SET gehalt = 5000;`? | A: Alle Zeilen werden geändert – WHERE fehlt.
- F: Wie testet man ein UPDATE gefahrlos vorher? | A: Gleiches WHERE als SELECT/COUNT ausführen, dann in einer Transaktion ändern und Zeilenzahl prüfen.
- F: In welcher Reihenfolge löscht man Bestellung und Positionen? | A: Erst bestellpositionen (Kind), dann bestellungen (Eltern).
- F: Wann prüft SQLite Fremdschlüssel? | A: Nur wenn `PRAGMA foreign_keys = ON` gesetzt ist (pro Verbindung).
- F: Wie erhält man die zuletzt vergebene ID in SQLite und T-SQL? | A: SQLite `last_insert_rowid()`, T-SQL `SCOPE_IDENTITY()` oder `OUTPUT inserted.id`.
- F: Unterschied DELETE ohne WHERE und DROP TABLE? | A: DELETE leert die Tabelle (Struktur bleibt), DROP TABLE entfernt die Tabelle samt Struktur.
- F: Was ist ein Upsert? | A: Einfügen oder bei Schlüsselkonflikt aktualisieren – SQLite `ON CONFLICT DO UPDATE`, T-SQL `MERGE`.
- F: Welche Fehlermeldung kommt bei `gehalt = 0`? | A: CHECK constraint failed (gehalt > 0).
- F: Wie zählt man in T-SQL die zuletzt geänderten Zeilen? | A: `@@ROWCOUNT` direkt nach der Anweisung.

## Quiz
? Welche Anweisung fügt einen Kunden korrekt ein und lässt die ID automatisch vergeben?
* `INSERT INTO kunden (firma, stadt) VALUES ('Elbwerft Beispiel GmbH', 'Hamburg');`
- `INSERT kunden SET firma = 'Elbwerft Beispiel GmbH', stadt = 'Hamburg';`
- `INSERT INTO kunden VALUES ('Elbwerft Beispiel GmbH', 'Hamburg');`
- `UPDATE kunden ADD ('Elbwerft Beispiel GmbH', 'Hamburg');`
! Ohne Spaltenliste müssten alle 8 Spalten angegeben werden; `INSERT … SET` ist MySQL-Syntax.

? Was bewirkt `DELETE FROM zeiterfassung;`?
- Löscht die Tabelle zeiterfassung samt Struktur
* Löscht alle Zeilen, die Tabelle bleibt bestehen
- Löscht nur die erste Zeile
- Erzeugt einen Fehler, weil WHERE fehlt
! Für das Entfernen der Struktur wäre DROP TABLE nötig.

? Welche Anweisung erhöht nur die Gehälter der aktiven Mitarbeitenden in Abteilung 3 um 3 %?
- `UPDATE mitarbeiter SET gehalt = gehalt * 1.03;`
- `UPDATE mitarbeiter SET gehalt = 1.03 WHERE abt_id = 3;`
* `UPDATE mitarbeiter SET gehalt = gehalt * 1.03 WHERE abt_id = 3 AND austritt IS NULL;`
- `UPDATE mitarbeiter WHERE abt_id = 3 SET gehalt = gehalt + 3;`
! SET steht vor WHERE; „um 3 %“ heißt Faktor 1,03.

? Was passiert bei aktivem `foreign_keys` mit `INSERT INTO bestellungen (kunde_id, datum, status) VALUES (9999, '2026-01-10', 'offen');`, wenn Kunde 9999 nicht existiert?
- Der Kunde 9999 wird automatisch angelegt
- Die Bestellung wird mit kunde_id NULL gespeichert
- Die Bestellung wird gespeichert, eine Warnung erscheint
* Fehler: FOREIGN KEY constraint failed
! Referenzielle Integrität verhindert verwaiste Bestellungen.

? In welcher Reihenfolge löschen Sie eine Bestellung mit Positionen bei Fremdschlüssel NO ACTION?
- Erst bestellungen, dann bestellpositionen
* Erst bestellpositionen, dann bestellungen
- Beide gleichzeitig mit einem DELETE
- Die Reihenfolge ist egal
! Kind vor Eltern – sonst würden Positionen auf eine gelöschte Bestellung zeigen.

? Welche Anweisung fügt alle aktiven Azubis als Mitglieder in Projekt 3 ein?
- `INSERT INTO projekt_mitarbeiter VALUES (SELECT * FROM mitarbeiter WHERE azubi = 1);`
- `UPDATE projekt_mitarbeiter SET projekt_id = 3 WHERE azubi = 1;`
- `INSERT INTO projekt_mitarbeiter (3, ma_id) FROM mitarbeiter WHERE azubi = 1;`
* `INSERT INTO projekt_mitarbeiter (projekt_id, ma_id, rolle) SELECT 3, ma_id, 'Azubi' FROM mitarbeiter WHERE azubi = 1 AND austritt IS NULL;`
! INSERT … SELECT: Konstante 3 als erste Spalte, ma_id aus der Abfrage.

? Welchen Wert erhält `wochenstunden` bei `INSERT INTO mitarbeiter (vorname, nachname, eintritt) VALUES ('Test', 'Person', '2026-03-01');`?
- NULL
- 0
* 40
- Der Insert schlägt fehl
! Nicht genannte Spalten bekommen ihren DEFAULT-Wert – im Schema `DEFAULT 40`.

? Welche Funktion liefert in SQL Server die zuletzt im aktuellen Gültigkeitsbereich erzeugte IDENTITY-ID?
- `last_insert_rowid()`
- `@@ROWCOUNT`
- `NEWID()`
* `SCOPE_IDENTITY()`
! `@@IDENTITY` kann durch Trigger verfälscht werden; `NEWID()` erzeugt eine GUID.

? Was ist der sicherste Ablauf für eine Massenlöschung in Produktion?
* Vorher SELECT-Test, dann DELETE in Transaktion mit Zeilenprüfung
- DELETE sofort ausführen und bei Fehlern anschließend nach einem Backup suchen
- TRUNCATE TABLE verwenden, weil es schneller ist und weniger protokolliert
- Fremdschlüsselprüfung abschalten, löschen und danach wieder einschalten
! Testen, absichern, kontrollieren – erst dann bestätigen.

? Welche Verletzung löst `UPDATE projekte SET status = 'pausiert' WHERE projekt_id = 1;` aus?
- FOREIGN KEY
- NOT NULL
* CHECK
- UNIQUE
! status darf nur 'geplant', 'aktiv', 'abgeschlossen' oder 'gestoppt' sein.

? Was bewirkt `UPDATE artikel SET verkaufspreis = einkaufspreis, einkaufspreis = verkaufspreis WHERE artikel_id = 1;`?
- Beide Spalten erhalten den alten Einkaufspreis
* Die beiden Werte werden vertauscht
- Beide Spalten erhalten den alten Verkaufspreis
- Fehler, eine Spalte darf rechts nicht vorkommen
! Alle Ausdrücke rechts von SET lesen die alten Werte der Zeile.

? Wie lautet in SQLite ein Upsert für projekt_mitarbeiter?
- `MERGE INTO projekt_mitarbeiter USING neu ON (...) WHEN MATCHED THEN UPDATE SET stunden_geplant = neu.stunden_geplant;`
- `INSERT OR MERGE INTO projekt_mitarbeiter (...) VALUES (...) SET stunden_geplant = excluded.stunden_geplant;`
- `UPSERT INTO projekt_mitarbeiter (...) VALUES (...) WHEN EXISTS UPDATE stunden_geplant;`
* `INSERT INTO projekt_mitarbeiter (...) VALUES (...) ON CONFLICT (projekt_id, ma_id) DO UPDATE SET stunden_geplant = excluded.stunden_geplant;`
! `excluded` bezeichnet die Zeile, die eingefügt werden sollte; MERGE ist T-SQL.

## Lücken
- Neue Zeilen fügt man mit {INSERT INTO} ein, vorhandene ändert man mit {UPDATE}.
- Fehlt beim DELETE die {WHERE}-Klausel, werden alle Zeilen gelöscht.
- SQLite prüft Fremdschlüssel nur mit {PRAGMA foreign_keys = ON}.
- Beim Löschen gilt: {Kind} vor Eltern.

## Zuordnen
### Fehlermeldung und Ursache
- FOREIGN KEY constraint failed => Bezug auf nicht existierenden Datensatz
- CHECK constraint failed => Wert verletzt Bedingung, z. B. gehalt = 0
- NOT NULL constraint failed => Pflichtfeld wie eintritt fehlt
- UNIQUE constraint failed => benutzername oder email doppelt
- UPDATE ändert 100 Zeilen => WHERE vergessen

## Reihenfolge
### Sicheres UPDATE in der Firmen-DB
1. SELECT mit geplantem WHERE ausführen und Zeilen zählen
2. BEGIN – Transaktion starten
3. UPDATE mit identischem WHERE ausführen
4. Anzahl geänderter Zeilen mit changes() prüfen
5. COMMIT bei korrekter Anzahl, sonst ROLLBACK

## Freitext
- F: Ein Kollege hat `UPDATE mitarbeiter SET abt_id = 5;` ausgeführt. Beschreiben Sie Folgen und wie dies hätte verhindert werden können. | M: Alle 100 Mitarbeitenden gehören nun zur Abteilung 5. Verhindern: WHERE-Klausel, vorher SELECT-Test, Ausführung in Transaktion mit Prüfung der Zeilenzahl (changes()/@@ROWCOUNT) und ggf. ROLLBACK; Wiederherstellung aus Backup, eingeschränkte Rechte. | P: 4
- F: Schreiben Sie die Anweisungen, um die Bestellung 42 vollständig zu löschen, und begründen Sie die Reihenfolge. | M: `DELETE FROM bestellpositionen WHERE best_id = 42; DELETE FROM bestellungen WHERE best_id = 42;` – Positionen verweisen per Fremdschlüssel auf die Bestellung, daher zuerst das Kind löschen (sonst FK-Fehler). | P: 4

## Szenario
### Neue Auszubildende einstellen
Die Personalabteilung der Netzilon GmbH möchte zum 1. August 2026 eine neue Auszubildende (Fachinformatikerin Systemintegration) in der Abteilung Ausbildung anlegen und sie dem Projekt „Azubi-Lernlabor“ zuordnen. Außerdem sollen alle Zeiterfassungen ausgetretener Mitarbeitender aus 2024 bereinigt werden.
- F: Schreiben Sie das INSERT für die Auszubildende (Werte frei wählbar, abt_id 10). | A: `INSERT INTO mitarbeiter (personalnr, vorname, nachname, benutzername, email, eintritt, abt_id, position, gehalt, azubi) VALUES ('P0101', 'Ida', 'Beispiel', 'ida.beispiel', 'ida.beispiel@netzilon.example', '2026-08-01', 10, 'Auszubildende FiSi', 1100, 1);` | P: 3
- F: Wie ordnen Sie sie dem Projekt zu, ohne ihre ma_id zu kennen? | A: `INSERT INTO projekt_mitarbeiter (projekt_id, ma_id, rolle) SELECT p.projekt_id, m.ma_id, 'Azubi' FROM projekte p, mitarbeiter m WHERE p.name = 'Azubi-Lernlabor' AND m.benutzername = 'ida.beispiel';` | P: 3
- F: Formulieren Sie die Bereinigung der Zeiterfassung. | A: `DELETE FROM zeiterfassung WHERE datum < '2025-01-01' AND ma_id IN (SELECT ma_id FROM mitarbeiter WHERE austritt IS NOT NULL);` – vorher als SELECT testen. | P: 3
- F: Welche Fehler könnten beim INSERT auftreten? | A: UNIQUE (personalnr/benutzername/email doppelt), NOT NULL (eintritt fehlt), CHECK (gehalt ≤ 0), FOREIGN KEY (abt_id existiert nicht). | P: 2
