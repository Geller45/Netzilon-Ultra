---
id: db-sql-grundlagen
bereich: Datenbanken
pruefungen: [Schule, AP1, AP2]
fach: SQL / Datenbanken
block: D2
kapitel: SQL Grundlagen
titel: Was ist SQL? – Geschichte, T-SQL, DDL, DML, DCL, Mengenlehre
stufe: Einsteiger
quellen: [tsql.pdf, sql.pdf, SQL_Lernen_1.pdf, Lernen_SQL.pdf]
verweise: [db-einfuehrung, db-select-basics, db-ddl, db-dml, db-dcl]
---

## Profi

### Herkunft und Standard
SQL (früher *Structured Query Language*, heute Eigenname) wurde in den 1970er Jahren bei IBM entwickelt und von ANSI/ISO genormt. SQL ist **deklarativ**: man beschreibt **was** man haben will, nicht **wie** der Server es holt. Microsofts Dialekt heißt **Transact-SQL (T-SQL)**; weitere Dialekte: PL/SQL (Oracle), PL/pgSQL (PostgreSQL), MySQL/MariaDB-SQL.
Standard-Stufen: Entry, Intermediate, Full Level. Versionen: SQL-86/87, **SQL-92 (SQL2)** – Stand der meisten RDBMS, SQL:1999 (objektrelational, Trigger, rekursive Abfragen), SQL:2003 (XML), SQL:2008 (Geodaten), später JSON, Window-Funktionen. SQL Server unterstützt SQL-92 Entry Level voll und eigene prozedurale Erweiterungen (Variablen, IF/WHILE, TRY/CATCH).

### Sprachbestandteile
| Teil | Zweck | Befehle |
|---|---|---|
| **DDL** Data Definition Language | Objekte definieren | CREATE, ALTER, DROP, TRUNCATE |
| **DML** Data Manipulation Language | Daten abfragen/ändern | SELECT, INSERT, UPDATE, DELETE, MERGE |
| **DCL** Data Control Language | Rechte | GRANT, REVOKE, DENY |
| **TCL** Transaction Control | Transaktionen | BEGIN TRAN, COMMIT, ROLLBACK, SAVE TRAN |
(Je nach Lehrbuch wird SELECT auch als eigene DQL geführt.)

### Mengenlehre als Grundlage
Relationale Datenbanken basieren auf Mengen und der **relationalen Algebra** (Selektion σ = WHERE, Projektion π = SELECT-Spaltenliste, Vereinigung ∪, Differenz −, Kreuzprodukt ×, Join ⋈). Eigenschaften:
- Eine Tabelle ist eine **Menge** gleichartiger Elemente (Zeilen), die **eindeutig** sein sollen (Primärschlüssel).
- Man arbeitet **mengenbasiert** auf der ganzen Tabelle gleichzeitig, **nicht zeilenweise** (Cursor vermeiden).
- Eine Menge hat **keine Reihenfolge** – nur ORDER BY garantiert eine.

### Syntaxregeln
Schlüsselwörter nicht case-sensitiv; Anweisungen mit `;` abschließen; Zeichenketten in `'…'`; Kommentare `-- Zeile` und `/* Block */`; Bezeichner mit Sonderzeichen in `[eckigen Klammern]` (T-SQL) bzw. `"…"`; Namen vollqualifiziert `Server.Datenbank.Schema.Objekt`; `GO` ist Batch-Trennzeichen von SSMS (kein SQL).

### Werkzeuge
SSMS (SQL Server Management Studio), Azure Data Studio, sqlcmd (CLI), PowerShell-Modul SqlServer (`Invoke-Sqlcmd`).

## Einfach

**SQL** ist die **Sprache, mit der man mit einer Datenbank spricht**. Wie bei einem Gespräch im Restaurant: Du sagst nicht dem Koch, wie er das Schnitzel braten soll, sondern nur **was** du willst („Schnitzel mit Pommes“). Das nennt man **deklarativ**.

Die SQL-Befehle sind in **drei große Familien** sortiert (Merkhilfe: **D**-D-D):
1. **DDL – Bauen** (Definition): Du **baust** die Schränke und Regale – `CREATE TABLE` (neu bauen), `ALTER TABLE` (umbauen), `DROP TABLE` (abreißen).
2. **DML – Arbeiten** (Manipulation): Du **legst Sachen hinein, holst sie raus, änderst sie** – `SELECT` (anschauen), `INSERT` (hineinlegen), `UPDATE` (ändern), `DELETE` (wegwerfen).
3. **DCL – Erlauben** (Control): Du **verteilst Schlüssel**: Wer darf was? – `GRANT` (erlauben), `REVOKE` (zurücknehmen), `DENY` (verbieten).

Ganz wichtig: Eine Tabelle ist wie eine **Menge in Mathe** – ein Sack mit Dingen, **ohne feste Reihenfolge**. Wenn du eine Reihenfolge willst, musst du sie ausdrücklich verlangen (`ORDER BY`). Und wie ein guter Sack soll jedes Ding **einmalig** sein, deshalb hat jede Zeile einen **Primärschlüssel**.

**T-SQL** ist der Dialekt von Microsoft – wie Hochdeutsch und Bayrisch: Man versteht sich, aber manche Wörter sind anders (z. B. `TOP 5` bei Microsoft, `LIMIT 5` bei MySQL).

## Merksatz
- **DDL baut, DML bewegt, DCL erlaubt.**
- **SQL = deklarativ: sagen WAS, nicht WIE.**
- Menge = keine Reihenfolge ohne ORDER BY.
- T-SQL = Microsoft-Dialekt.

## Prüfungsfalle
- SELECT gehört zur DML (nicht DDL).
- TRUNCATE ist DDL (nicht DML), DELETE ist DML.
- `GO` ist kein SQL-Befehl, sondern SSMS-Batchtrenner.
- T-SQL ≠ Standard-SQL: `TOP`, `ISNULL`, `+`-Verkettung sind herstellerspezifisch.
- GRANT/REVOKE/DENY gehören zur DCL: DENY hat Vorrang vor GRANT.

## Grafik
### Die drei Befehlsfamilien
1. DDL: CREATE TABLE Kunde (...) baut die Struktur
2. DML: INSERT INTO Kunde VALUES (...) füllt sie
3. DML: SELECT * FROM Kunde liest sie
4. DCL: GRANT SELECT ON Kunde TO vertrieb erlaubt Zugriff
### Weg einer Anweisung
1. Client -> SQL-Server: Anweisung als Text
2. SQL-Server: Parser prüft Syntax
3. SQL-Server: Optimierer erstellt Ausführungsplan
4. SQL-Server -> Client: Ergebnis oder Fehlermeldung

## Lab
### SQL
Maschine: SQL-Server-VM (SSMS), Verbindung mit Windows-Authentifizierung.
```
SELECT @@VERSION;
SELECT name FROM sys.databases;
CREATE DATABASE Schulung;
GO
USE Schulung;
```

## Befehle
- `CREATE / ALTER / DROP` – Objekte bauen, ändern, löschen (DDL)
- `SELECT / INSERT / UPDATE / DELETE` – Daten (DML)
- `GRANT / REVOKE / DENY` – Rechte (DCL)
- `BEGIN TRAN / COMMIT / ROLLBACK` – Transaktion (TCL)

## Übungen
- A: Ordnen Sie zu: CREATE, SELECT, GRANT, DELETE, ALTER, DENY. | L: DDL: CREATE, ALTER; DML: SELECT, DELETE; DCL: GRANT, DENY.
- A: Was bedeutet „deklarativ“? | L: Man beschreibt das gewünschte Ergebnis, der Server bestimmt den Weg (Optimierer).
- A: Warum garantiert SELECT ohne ORDER BY keine Reihenfolge? | L: Tabellen sind Mengen; die Ausgabereihenfolge hängt vom Ausführungsplan ab.

## Karteikarten
- F: Wofür steht DDL? | A: Data Definition Language – CREATE, ALTER, DROP.
- F: Wofür steht DML? | A: Data Manipulation Language – SELECT, INSERT, UPDATE, DELETE.
- F: Wofür steht DCL? | A: Data Control Language – GRANT, REVOKE, DENY.
- F: Was ist T-SQL? | A: Microsofts SQL-Dialekt mit prozeduralen Erweiterungen (Transact-SQL).
- F: Was bedeutet deklarativ? | A: Man sagt was man will, nicht wie es berechnet wird.
- F: Welcher SQL-Standard ist bei den meisten RDBMS Stand? | A: SQL-92 (SQL2).
- F: Wofür ist GO in SSMS? | A: Batch-Trennzeichen, kein SQL-Befehl.
- F: Gibt es bei Tabellen eine Reihenfolge? | A: Nein, nur durch ORDER BY.
- F: Welche relationale Operation entspricht WHERE? | A: Selektion.

## Quiz
? Zu welcher Gruppe gehört CREATE TABLE?
* DDL
- DML
- DCL
- TCL

? Zu welcher Gruppe gehört SELECT?
* DML
- DDL
- DCL
- keine

? Was bedeutet deklarativ?
* Beschreiben, was man will, nicht wie
- Schritt für Schritt programmieren
- Nur Lesen
- Nur Schreiben

? Welcher Befehl verbietet Zugriff ausdrücklich?
* DENY
- REVOKE
- GRANT
- DROP

? Was ist T-SQL?
* Microsofts SQL-Dialekt
- Ein Datenbanktyp
- Eine Tabelle
- Ein Backup-Format

? Welcher SQL-Standard ist bei den meisten RDBMS Stand?
* SQL-92
- SQL-86
- SQL:2023
- SQL-2050

? Was ist GO?
* Batchtrenner von SSMS
- Ein DML-Befehl
- Ein DCL-Befehl
- Ein Datentyp

? Was entspricht der Projektion in SQL?
* Die Spaltenliste im SELECT
- WHERE
- ORDER BY
- JOIN

## Lücken
- {DDL} definiert Objekte, {DML} verändert Daten, {DCL} vergibt Rechte.
- SQL ist {deklarativ}.

## Zuordnen
### Befehl und Sprachgruppe
- CREATE => DDL
- INSERT => DML
- GRANT => DCL
- COMMIT => TCL

## Spickzettel
- DDL CREATE/ALTER/DROP; DML SELECT/INSERT/UPDATE/DELETE; DCL GRANT/REVOKE/DENY
- SQL deklarativ, T-SQL = Microsoft
- Tabelle = Menge, Reihenfolge nur mit ORDER BY
