---
id: db-dml
bereich: Datenbanken
pruefungen: [Schule, AP2]
fach: SQL / Datenbanken
block: D2
kapitel: DML
titel: DML – INSERT, UPDATE, DELETE, TRUNCATE, MERGE, OUTPUT
stufe: Fortgeschritten
quellen: [dml_skript.pdf]
verweise: [db-ddl, db-select-basics, db-transaktionen]
---

## Profi

### INSERT
```
INSERT INTO UnitMeasure (UnitCode, Name, ModifiedDate) VALUES ('F2', 'Square Feet', GETDATE());
INSERT INTO UnitMeasure VALUES ('F2','Square Feet',GETDATE()), ('Y2','Square Yards',GETDATE());  -- mehrere Zeilen
INSERT INTO Archiv (a,b) SELECT a,b FROM Aktuell WHERE Jahr < 2020;   -- INSERT … SELECT
SELECT * INTO myOrders FROM orders;                                   -- neue Tabelle aus Abfrage (ohne Constraints)
```
Die **Spaltenliste** bestimmt Reihenfolge und Ziel; fehlende Spalten erhalten DEFAULT/NULL/IDENTITY. IDENTITY-Spalten werden automatisch gefüllt; `SET IDENTITY_INSERT tab ON` erlaubt eigene Werte. `INSERT … EXEC proc` übernimmt das Ergebnis einer Prozedur.

### UPDATE
```
UPDATE Sales.SalesPerson SET Bonus = Bonus * 2;                         -- alle Zeilen!
UPDATE Production.Product SET Color = 'Metallic Red' WHERE Name LIKE 'Road-250%' AND Color = 'Red';
UPDATE a SET a.preis = b.preis FROM Artikel a JOIN Preisliste b ON a.nr = b.nr;   -- mit Daten aus anderer Tabelle
```
Drei Klauseln: **SET** (Spalten), **FROM** (Werte aus anderen Tabellen), **WHERE** (Zeilenfilter). Pro Anweisung nur eine Basistabelle ändern.

### DELETE und TRUNCATE
`DELETE FROM Kunde WHERE Stadt = 'Hamburg' AND Seit < '20130301';` – ohne WHERE werden **alle** Zeilen gelöscht.
| | DELETE | TRUNCATE TABLE |
|---|---|---|
| Typ | DML | DDL |
| WHERE | ja | nein |
| Protokollierung | zeilenweise (mehr Log) | seitenweise (minimal) |
| IDENTITY | bleibt | wird zurückgesetzt |
| Trigger | feuern | feuern nicht |
| FK-Verweis | möglich | **nicht erlaubt** |
| Rollback | ja | ja (innerhalb Transaktion) |

### OUTPUT-Klausel
Gibt betroffene Zeilen zurück: `DELETE dbo.Culture OUTPUT DELETED.*;` `UPDATE … SET Bonus = 10000 OUTPUT INSERTED.Bonus INTO @var;` Pseudotabellen `INSERTED` (neue Werte) und `DELETED` (alte Werte).

### MERGE (Upsert)
```
MERGE INTO Ziel AS t USING Quelle AS s ON t.id = s.id
WHEN MATCHED THEN UPDATE SET t.wert = s.wert
WHEN NOT MATCHED BY TARGET THEN INSERT (id, wert) VALUES (s.id, s.wert)
WHEN NOT MATCHED BY SOURCE THEN DELETE;
```
Ändert das Ziel abhängig davon, ob die Quelle passt (Zeile existiert / existiert nicht im Ziel / nicht in der Quelle).

## Einfach

Mit **DML** arbeitest du mit dem **Inhalt** der Tabellen – wie bei einer Kartei:

- **INSERT** = eine **neue Karteikarte** hinzufügen. `INSERT INTO Kunde VALUES (...)`.
- **UPDATE** = eine **Karte ändern**, z. B. neue Telefonnummer eintragen. Wichtig: Sag **welche** Karte (**WHERE**)!
- **DELETE** = eine **Karte wegwerfen**. Auch hier: **welche** (WHERE)!
- **TRUNCATE** = den **ganzen Kartenstapel** auf einmal in den Müll kippen – schneller als eine nach der anderen wegzuwerfen, aber dafür kann man keine Auswahl treffen.
- **MERGE** = „Wenn es die Karte schon gibt, aktualisiere sie, sonst lege eine neue an.“ Praktisch zum Abgleich mit einer neuen Liste.

**Die große Gefahr:** Vergisst du bei UPDATE oder DELETE das **WHERE**, trifft es **alle** Karten! `DELETE FROM Kunde;` löscht jeden Kunden. Deshalb gilt die Profi-Regel: **Erst mit SELECT testen** (`SELECT * FROM Kunde WHERE Stadt = 'Hamburg'`), dann dasselbe WHERE bei DELETE/UPDATE verwenden – am besten in einer **Transaktion**, die man mit ROLLBACK zurücknehmen kann.

**OUTPUT** ist wie ein Kassenbon: Die Datenbank zeigt dir nach dem Ändern, welche Zeilen sie angefasst hat (alter und neuer Wert).

## Merksatz
- **UPDATE/DELETE ohne WHERE trifft alle Zeilen!**
- **Erst SELECT, dann DELETE** (gleiches WHERE).
- **TRUNCATE: schnell, kein WHERE, IDENTITY zurückgesetzt, DDL.**
- **INSERT … SELECT** kopiert Daten, **SELECT … INTO** erzeugt neue Tabelle.

## Prüfungsfalle
- TRUNCATE ist DDL, nicht DML, und nicht mit WHERE.
- `TRUNCATE` scheitert bei Tabellen, auf die ein FOREIGN KEY zeigt.
- `SELECT … INTO` übernimmt keine Constraints/Indizes.
- Beim INSERT muss die Wertereihenfolge zur Spaltenliste passen; ohne Spaltenliste zur Tabellendefinition.
- Beim DELETE einer 1-Seite mit abhängigen Zeilen: Fehler (FK) oder CASCADE.
- DROP ≠ DELETE ≠ TRUNCATE: DROP entfernt die Struktur, DELETE Zeilen, TRUNCATE alle Zeilen schnell.

## Grafik
### UPDATE mit WHERE
1. Client -> SQL-Server: UPDATE Kunde SET Ort = 'Bochum' WHERE KundenNr = 7
2. SQL-Server: sucht Zeile mit KundenNr 7 (Index)
3. SQL-Server: sperrt die Zeile und schreibt ins Transaktionsprotokoll
4. SQL-Server -> Client: (1 Zeile betroffen)
### Vergessenes WHERE
1. Client -> SQL-Server: DELETE FROM Kunde
2. SQL-Server: löscht alle Zeilen
3. Client: Fehler bemerkt – nur ROLLBACK oder Backup hilft

## Lab
### SQL
Maschine: SQL-Server-VM (SSMS), Datenbank Schulung (Tabelle Kunde aus db-ddl).
```
BEGIN TRAN;
INSERT INTO Kunde VALUES (1,'Müller','mueller@example.com'),(2,'Schmidt','schmidt@example.com');
UPDATE Kunde SET Name = 'Müller-Meier' WHERE KundenNr = 1;
DELETE FROM Kunde OUTPUT DELETED.* WHERE KundenNr = 2;
SELECT * FROM Kunde;
ROLLBACK;
```

## Befehle
- `INSERT INTO t (a,b) VALUES (1,2);` – Zeile einfügen
- `UPDATE t SET a = 1 WHERE b = 2;` – ändern
- `DELETE FROM t WHERE b = 2;` – löschen
- `TRUNCATE TABLE t;` – alle Zeilen schnell löschen
- `MERGE … USING … ON …` – Upsert
- `OUTPUT INSERTED.* / DELETED.*` – geänderte Zeilen anzeigen

## Übungen
- A: Fügen Sie den Kunden Meier aus Hamburg ein. | L: INSERT INTO Kunde (Name, Stadt) VALUES ('Meier','Hamburg');
- A: Erhöhen Sie alle Preise um 5 %. | L: UPDATE Artikel SET Preis = Preis * 1.05;
- A: Löschen Sie alle Kunden aus Hamburg, die vor dem 01.03.2013 aufgenommen wurden. | L: DELETE FROM Kunde WHERE Stadt = 'Hamburg' AND Seit < '20130301';
- A: Unterschied DELETE und TRUNCATE? | L: DELETE zeilenweise, mit WHERE, protokolliert, Trigger; TRUNCATE alle Zeilen, kein WHERE, minimal protokolliert, setzt IDENTITY zurück, DDL.
- A: Kopieren Sie alle Bestellungen vor 2020 in die Tabelle Archiv. | L: INSERT INTO Archiv SELECT * FROM Bestellung WHERE Datum < '20200101';

## Karteikarten
- F: Was macht INSERT? | A: Fügt eine oder mehrere neue Zeilen in eine Tabelle ein.
- F: Was passiert bei UPDATE ohne WHERE? | A: Alle Zeilen der Tabelle werden geändert.
- F: Was macht TRUNCATE TABLE? | A: Löscht alle Zeilen schnell (DDL, minimal protokolliert, IDENTITY-Reset).
- F: DELETE vs. TRUNCATE? | A: DELETE: WHERE möglich, zeilenweise protokolliert; TRUNCATE: alle Zeilen, schneller, nicht bei FK-Verweisen.
- F: Was ist OUTPUT? | A: Gibt betroffene Zeilen (INSERTED/DELETED) zurück.
- F: Wofür ist MERGE? | A: Upsert: je nach Übereinstimmung UPDATE, INSERT oder DELETE.
- F: Was macht SELECT … INTO? | A: Erzeugt eine neue Tabelle aus dem Abfrageergebnis (ohne Constraints).
- F: Wie fügt man mehrere Zeilen in einem INSERT ein? | A: VALUES (…),(…),(…) mit mehreren Wertlisten.
- F: Wie erlaubt man das Einfügen in IDENTITY-Spalten? | A: SET IDENTITY_INSERT tabelle ON.

## Quiz
? Was löscht DELETE FROM Kunde; ohne WHERE?
* Alle Zeilen der Tabelle
- Nur die erste Zeile
- Die Tabelle selbst
- Nichts

? Zu welcher Sprachgruppe gehört TRUNCATE?
* DDL
- DML
- DCL
- TCL

? Was gilt für TRUNCATE?
* Kein WHERE möglich
- Mit WHERE möglich
- Feuert Trigger
- Funktioniert immer bei FK-Verweisen

? Wofür ist MERGE?
* Zusammenführen: UPDATE/INSERT/DELETE nach Bedingung
- Nur zum Sortieren
- Nur zum Löschen
- Nur zum Lesen

? Was zeigt OUTPUT DELETED.*?
* Die gelöschten Zeilen
- Die eingefügten Zeilen
- Die Tabellenstruktur
- Den Ausführungsplan

? Welche Anweisung kopiert Daten in eine bestehende Tabelle?
* INSERT … SELECT
- SELECT … INTO
- CREATE TABLE
- MERGE VIEW

? Was erzeugt SELECT * INTO neu FROM alt?
* Eine neue Tabelle ohne Constraints
- Eine Sicht
- Einen Index
- Einen Trigger

? Wie schützt man sich vor versehentlichem DELETE?
* Erst mit SELECT testen und in Transaktion mit ROLLBACK-Möglichkeit arbeiten
- Keinen WHERE verwenden
- TRUNCATE nutzen
- Primärschlüssel entfernen

## Lücken
- Bei {UPDATE} und {DELETE} immer die {WHERE}-Klausel prüfen.
- {TRUNCATE TABLE} löscht alle Zeilen schnell und setzt IDENTITY zurück.

## Spickzettel
- INSERT INTO t (spalten) VALUES (…)
- UPDATE t SET … WHERE … (WHERE nicht vergessen!)
- DELETE FROM t WHERE …
- TRUNCATE = alle Zeilen, DDL, kein WHERE
- MERGE = Upsert, OUTPUT = Änderungen anzeigen
