---
id: erg-sql-praxisfaelle
bereich: AP2
block: ERG
kapitel: Ergänzungen 2.2
titel: SQL und Datenbanken im IT-Betrieb – Inventar-Datenbank, Abfragen, Normalisierung, Rechte und Sicherung
stufe: Fortgeschritten
fach: SQL / Datenbanken
pruefungen: [AP1, AP2, Schule]
quellen: [ISO/IEC 9075 (SQL), Microsoft Learn – T-SQL-Referenz und SQL Server Backup, IHK-Prüfungsaufgaben SQL (AP1/AP2)]
verweise: [db-select-basics, db-select-join, db-select-aggregate, db-normalisierung, db-ddl, db-dml, db-dcl, db-backup-restore, ihk-lz-datenbank-sql, ap2-skripte-sql]
---

## Profi

### Beispielmodell: IT-Inventar
Eine typische IHK-Situation ist eine **Inventar- oder Ticketdatenbank**. Modell (3NF):
- **Abteilung**(AbtID **PK**, Name, Kostenstelle)
- **Mitarbeiter**(MaID **PK**, Name, Vorname, AbtID **FK** → Abteilung)
- **Geraet**(GeraetID **PK**, Inventarnr UNIQUE, Typ, Hersteller, Kaufdatum, Preis, MaID **FK** → Mitarbeiter, NULL erlaubt = im Lager)
- **Ticket**(TicketID **PK**, GeraetID **FK**, Erstellt, Status, Beschreibung)

Beziehungen: Abteilung 1:n Mitarbeiter, Mitarbeiter 1:n Gerät, Gerät 1:n Ticket. Eine **n:m-Beziehung** (z. B. Mitarbeiter – Software-Lizenz) wird über eine **Zwischentabelle** mit zusammengesetztem Primärschlüssel aufgelöst.

### Wichtige Abfragen
```sql
-- Alle Notebooks, die älter als 5 Jahre sind
SELECT Inventarnr, Hersteller, Kaufdatum
FROM Geraet
WHERE Typ = 'Notebook' AND Kaufdatum < DATEADD(year, -5, GETDATE())
ORDER BY Kaufdatum;

-- Anzahl Geräte und Gesamtwert je Abteilung, nur Abteilungen mit mehr als 10 Geräten
SELECT a.Name, COUNT(g.GeraetID) AS Anzahl, SUM(g.Preis) AS Wert
FROM Abteilung a
JOIN Mitarbeiter m ON m.AbtID = a.AbtID
JOIN Geraet g ON g.MaID = m.MaID
GROUP BY a.Name
HAVING COUNT(g.GeraetID) > 10;

-- Mitarbeiter ohne Gerät (LEFT JOIN + IS NULL)
SELECT m.Name, m.Vorname
FROM Mitarbeiter m
LEFT JOIN Geraet g ON g.MaID = m.MaID
WHERE g.GeraetID IS NULL;

-- Gerät ins Lager zurückbuchen
UPDATE Geraet SET MaID = NULL WHERE Inventarnr = 'INV-2023-0042';
```
Merke die **logische Verarbeitungsreihenfolge**: FROM/JOIN → WHERE → GROUP BY → HAVING → SELECT → ORDER BY. Deshalb filtert **WHERE einzelne Zeilen vor** der Gruppierung, **HAVING Gruppen danach**; Aggregatfunktionen sind in WHERE nicht erlaubt.

### Normalisierung kurz
- **1NF**: atomare Werte, keine Wiederholungsgruppen.
- **2NF**: 1NF + jedes Nichtschlüsselattribut voll vom **gesamten** Primärschlüssel abhängig (relevant bei zusammengesetzten Schlüsseln).
- **3NF**: 2NF + keine **transitiven Abhängigkeiten** (Nichtschlüsselattribut hängt von anderem Nichtschlüsselattribut ab, z. B. PLZ → Ort).
Ziel: Redundanz und **Anomalien** (Einfüge-, Änderungs-, Löschanomalie) vermeiden.

### Betrieb: Rechte, Transaktionen, Sicherung
- **DCL**: `GRANT SELECT ON Geraet TO Rolle_Support;` `REVOKE …`, `DENY …` (SQL Server). Rechte an **Rollen**, nicht an einzelne Benutzer.
- **Transaktionen** (ACID: Atomarität, Konsistenz, Isolation, Dauerhaftigkeit): `BEGIN TRANSACTION … COMMIT` bzw. `ROLLBACK`.
- **Sicherung** (SQL Server): **Vollsicherung**, **differenzielle Sicherung** (Änderungen seit der letzten Vollsicherung), **Protokollsicherung** (Transaktionsprotokoll, nur im Wiederherstellungsmodell **Vollständig**) → Wiederherstellung bis zu einem Zeitpunkt (**Point-in-Time**). Im Modell **Einfach** sind keine Protokollsicherungen möglich.
- **SQL-Injection** verhindern: parametrisierte Abfragen / Prepared Statements, minimale Rechte des Anwendungskontos, Eingaben validieren.

## Einfach
Eine Datenbank ist wie ein **Karteikasten mit mehreren Schubladen**. In einer Schublade liegen die **Abteilungen**, in einer anderen die **Mitarbeiter**, in einer dritten die **Geräte**. Jede Karte hat eine eindeutige **Nummer** (Primärschlüssel). Auf der Gerätekarte steht nicht noch einmal der ganze Name und die Abteilung des Mitarbeiters, sondern nur seine **Nummer** (Fremdschlüssel). So muss man eine Änderung, zum Beispiel einen neuen Nachnamen nach der Hochzeit, nur an **einer** Stelle machen.

**SQL** ist die Sprache, mit der du den Karteikasten befragst:
- **SELECT** – „Zeig mir …“
- **WHERE** – „… aber nur die, bei denen …“
- **JOIN** – „Leg die Karten aus zwei Schubladen nebeneinander, die zusammengehören.“
- **GROUP BY** – „Mach Stapel, zum Beispiel einen Stapel pro Abteilung.“
- **COUNT/SUM** – „Zähl die Karten im Stapel / rechne die Preise zusammen.“
- **HAVING** – „Zeig nur die Stapel, die groß genug sind.“

Nicht jeder darf alles im Karteikasten: Der Support darf nur **lesen**, der Einkauf darf **neue Geräte eintragen**. Das regelt man mit **GRANT**.

Und weil der Karteikasten so wichtig ist, macht man regelmäßig **Kopien**: einmal pro Woche eine komplette, jeden Tag die Änderungen und alle 15 Minuten das Tagebuch aller Änderungen. Dann kann man im Notfall fast bis auf die Minute genau zurückspringen.

## Merksatz
- **WHERE filtert Zeilen, HAVING filtert Gruppen.**
- **FROM – WHERE – GROUP BY – HAVING – SELECT – ORDER BY.**
- **LEFT JOIN + IS NULL = „ohne Partner“.**
- **3NF: Alles hängt vom Schlüssel ab, vom ganzen Schlüssel und nur vom Schlüssel.**
- **Point-in-Time nur mit Protokollsicherung (Modell Vollständig).**

## Prüfungsfalle
- `WHERE COUNT(*) > 10` ist falsch – Aggregatbedingungen gehören in **HAVING**.
- Vergleich mit NULL nie mit `= NULL`, sondern mit **IS NULL**.
- **UPDATE/DELETE ohne WHERE** betrifft alle Zeilen.
- Jede Spalte in SELECT, die **nicht aggregiert** ist, muss in **GROUP BY** stehen.
- **DELETE** protokolliert zeilenweise und kann gefiltert werden, **TRUNCATE** leert die ganze Tabelle.

## Grafik
### Logische Verarbeitung einer SELECT-Abfrage
1. Datenbank: FROM und JOIN – Tabellen verknüpfen
2. Datenbank: WHERE – Zeilen filtern
3. Datenbank: GROUP BY – Gruppen bilden
4. Datenbank: HAVING – Gruppen filtern
5. Datenbank: SELECT – Spalten und Aggregate berechnen
6. Datenbank -> Client: ORDER BY – sortiertes Ergebnis

### Wiederherstellung bis zu einem Zeitpunkt
1. Admin -> SQL-Server: Restore Vollsicherung Sonntag (NORECOVERY)
2. Admin -> SQL-Server: Restore differenzielle Sicherung Dienstag (NORECOVERY)
3. Admin -> SQL-Server: Restore Protokollsicherungen bis 10:45 (STOPAT)
4. SQL-Server: RECOVERY – Datenbank wieder online

## Lab
**Maschinen**: Datenbankserver **SQL01** (Windows Server 2025, SQL Server 2022 Developer) und Client **ADM01** mit SQL Server Management Studio im Heimlabor **example.com**.

### GUI
1. **ADM01**: SSMS → Verbindung mit SQL01 (Windows-Authentifizierung) → Neue Datenbank **Inventar**.
2. **ADM01**: Neue Abfrage → Tabellen Abteilung, Mitarbeiter, Geraet mit PK/FK anlegen (siehe unten) → Datenbankdiagramm ansehen.
3. **ADM01**: Datenbank Inventar → Eigenschaften → Optionen → Wiederherstellungsmodell „Vollständig“.
4. **ADM01**: Rechtsklick Inventar → Tasks → Sichern → Vollständig → Ziel D:\Backup\Inventar.bak.

### PowerShell
```powershell
# ADM01 (Modul SqlServer)
Install-Module SqlServer -Scope CurrentUser
Invoke-Sqlcmd -ServerInstance SQL01 -Database Inventar -Query @"
CREATE TABLE Abteilung (AbtID INT PRIMARY KEY, Name NVARCHAR(50) NOT NULL);
CREATE TABLE Mitarbeiter (MaID INT PRIMARY KEY, Name NVARCHAR(50), Vorname NVARCHAR(50), AbtID INT REFERENCES Abteilung(AbtID));
CREATE TABLE Geraet (GeraetID INT IDENTITY PRIMARY KEY, Inventarnr NVARCHAR(20) UNIQUE, Typ NVARCHAR(30), Preis DECIMAL(10,2), MaID INT NULL REFERENCES Mitarbeiter(MaID));
"@
Backup-SqlDatabase -ServerInstance SQL01 -Database Inventar -BackupFile 'D:\Backup\Inventar.bak'
Backup-SqlDatabase -ServerInstance SQL01 -Database Inventar -BackupAction Log -BackupFile 'D:\Backup\Inventar.trn'
```

## Legende
### Fremdschlüssel (Foreign Key)
- Was: Spalte, die auf den Primärschlüssel einer anderen Tabelle verweist.
- Wie: REFERENCES-Constraint in CREATE/ALTER TABLE.
- Wann: Bei jeder 1:n-Beziehung (auf der n-Seite) und in Zwischentabellen für n:m.
- Wo: Im relationalen Modell, z. B. Geraet.MaID → Mitarbeiter.MaID.
- Warum: Sichert referenzielle Integrität – keine Verweise ins Leere.

### HAVING
- Was: Filterbedingung für Gruppen nach GROUP BY.
- Wie: HAVING mit Aggregatfunktion, z. B. HAVING COUNT(*) > 10.
- Wann: Wenn nach gruppierten Ergebnissen gefiltert werden soll.
- Wo: Nach GROUP BY, vor ORDER BY.
- Warum: WHERE kann keine Aggregate auswerten, da es vor der Gruppierung arbeitet.

## Karteikarten
- F: Unterschied WHERE und HAVING? | A: WHERE filtert einzelne Zeilen vor der Gruppierung, HAVING filtert Gruppen nach GROUP BY (mit Aggregaten).
- F: Wie findet man Datensätze ohne passenden Partner in einer anderen Tabelle? | A: LEFT JOIN und WHERE Partner.Schlüssel IS NULL (oder NOT EXISTS).
- F: Wie wird eine n:m-Beziehung umgesetzt? | A: Über eine Zwischentabelle mit zwei Fremdschlüsseln, die zusammen den Primärschlüssel bilden.
- F: Was verlangt die 3. Normalform? | A: 2NF und keine transitiven Abhängigkeiten zwischen Nichtschlüsselattributen.
- F: Nennen Sie die drei Anomalien nicht normalisierter Tabellen. | A: Einfüge-, Änderungs- und Löschanomalie.
- F: Wofür steht ACID? | A: Atomarität, Konsistenz, Isolation, Dauerhaftigkeit – Eigenschaften von Transaktionen.
- F: Welches Wiederherstellungsmodell erlaubt Point-in-Time-Restore? | A: Vollständig (Full) mit Protokollsicherungen.
- F: Was sichert eine differenzielle Sicherung? | A: Alle Änderungen seit der letzten Vollsicherung.
- F: Wie verhindert man SQL-Injection? | A: Parametrisierte Abfragen/Prepared Statements, Eingabevalidierung, minimale Rechte des DB-Kontos.
- F: Mit welchem Befehl erhält eine Rolle Leserechte auf eine Tabelle? | A: GRANT SELECT ON Tabelle TO Rolle;

## Quiz
? Welche Klausel filtert Gruppen nach einer Aggregatfunktion?
* HAVING
- WHERE
- ORDER BY
- DISTINCT
! WHERE wird vor der Gruppierung ausgewertet.

? Welche Abfrage liefert Mitarbeiter ohne Gerät?
* LEFT JOIN Geraet und WHERE Geraet.GeraetID IS NULL
- INNER JOIN Geraet und WHERE Geraet.GeraetID IS NULL
- RIGHT JOIN Mitarbeiter ohne Bedingung
- CROSS JOIN mit COUNT
! Der INNER JOIN liefert nur Mitarbeiter mit Gerät.

? Wie prüft man in SQL korrekt auf fehlende Werte?
* IS NULL
- = NULL
- == NULL
- LIKE NULL
! Ein Vergleich mit = NULL ergibt immer UNKNOWN.

? Welche Normalform verletzt die Tabelle Mitarbeiter(MaID, Name, PLZ, Ort)?
* 3NF – Ort hängt transitiv über PLZ vom Schlüssel ab
- 1NF – nicht atomar
- 2NF – zusammengesetzter Schlüssel
- Keine
! PLZ → Ort ist eine Abhängigkeit zwischen Nichtschlüsselattributen.

? Was passiert bei UPDATE Geraet SET Preis = 0; ohne WHERE?
* Alle Zeilen der Tabelle werden geändert.
- Nur die erste Zeile wird geändert.
- Der Befehl wird abgelehnt.
- Nur NULL-Werte werden geändert.
! Deshalb vor Änderungen immer mit SELECT und gleicher WHERE-Bedingung prüfen.

? In welcher logischen Reihenfolge wird eine SELECT-Abfrage verarbeitet?
* FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY
- SELECT, FROM, WHERE, GROUP BY, HAVING, ORDER BY
- WHERE, FROM, SELECT, ORDER BY, GROUP BY, HAVING
- FROM, SELECT, WHERE, HAVING, GROUP BY, ORDER BY
! Deshalb kann ORDER BY Spaltenaliasse aus SELECT nutzen, WHERE nicht.

? Welche Sicherung ist Voraussetzung für eine Wiederherstellung bis 10:45 Uhr?
* Protokollsicherung im Wiederherstellungsmodell Vollständig
- Nur eine Vollsicherung vom Vortag
- Differenzielle Sicherung im Modell Einfach
- Kopie der MDF-Datei im laufenden Betrieb
! Mit STOPAT wird das Protokoll bis zum gewünschten Zeitpunkt eingespielt.

? Welche Eigenschaft von ACID stellt sicher, dass eine Transaktion ganz oder gar nicht ausgeführt wird?
* Atomarität
- Konsistenz
- Isolation
- Dauerhaftigkeit
! Bei Fehlern wird per ROLLBACK alles zurückgesetzt.

? Welcher Befehl gehört zur DCL?
* GRANT
- SELECT
- CREATE TABLE
- INSERT
! DCL = Data Control Language: GRANT, REVOKE, DENY.

## Lücken
- Gruppen werden mit {HAVING} gefiltert.
- Fehlende Werte prüft man mit {IS NULL}.
- Eine n:m-Beziehung wird über eine {Zwischentabelle|Verknüpfungstabelle} aufgelöst.
- Leserechte vergibt man mit {GRANT} SELECT.
- Point-in-Time-Restore erfordert das Wiederherstellungsmodell {Vollständig|Full}.

## Zuordnen
### SQL-Befehl und Sprachgruppe
- CREATE TABLE => DDL
- INSERT => DML
- GRANT => DCL
- SELECT => DQL bzw. DML
- COMMIT => TCL (Transaktionssteuerung)

### Join-Art und Ergebnis
- INNER JOIN => nur Zeilen mit Partner in beiden Tabellen
- LEFT JOIN => alle Zeilen links, rechts NULL ohne Partner
- RIGHT JOIN => alle Zeilen rechts, links NULL ohne Partner
- CROSS JOIN => kartesisches Produkt

### Sicherungsart und Inhalt
- Vollsicherung => gesamte Datenbank
- Differenzielle Sicherung => Änderungen seit der letzten Vollsicherung
- Protokollsicherung => Transaktionsprotokoll seit der letzten Protokollsicherung
- Kopie nur (Copy-only) => Sicherung ohne Einfluss auf die Sicherungskette

## Reihenfolge
### Logische Verarbeitung von SELECT
1. FROM/JOIN
2. WHERE
3. GROUP BY
4. HAVING
5. SELECT
6. ORDER BY

### Wiederherstellung bis zu einem Zeitpunkt
1. Protokollfragment sichern (Tail-Log-Backup)
2. Letzte Vollsicherung mit NORECOVERY einspielen
3. Letzte differenzielle Sicherung mit NORECOVERY einspielen
4. Protokollsicherungen der Reihe nach einspielen, letzte mit STOPAT
5. Datenbank mit RECOVERY online schalten

### Tabelle normalisieren
1. Wiederholungsgruppen auflösen, Werte atomar machen (1NF)
2. Teilabhängigkeiten vom zusammengesetzten Schlüssel auslagern (2NF)
3. Transitive Abhängigkeiten auslagern (3NF)
4. Primär- und Fremdschlüssel festlegen

## Freitext
- F: Erstellen Sie eine SQL-Abfrage, die je Gerätetyp die Anzahl und den Durchschnittspreis ausgibt, sortiert nach Anzahl absteigend. | M: SELECT Typ, COUNT(*) AS Anzahl, AVG(Preis) AS Schnitt FROM Geraet GROUP BY Typ ORDER BY Anzahl DESC; | P: 4
- F: Erläutern Sie den Unterschied zwischen WHERE und HAVING an einem Beispiel. | M: WHERE filtert Zeilen vor der Gruppierung (WHERE Typ = 'Notebook'), HAVING filtert gebildete Gruppen nach Aggregaten (HAVING COUNT(*) > 10). | P: 4
- F: Beschreiben Sie eine Sicherungsstrategie für eine SQL-Datenbank mit maximal 15 Minuten Datenverlust. | M: Wiederherstellungsmodell Vollständig; wöchentliche Vollsicherung, tägliche differenzielle Sicherung, Protokollsicherung alle 15 Minuten; Sicherungen auf separatem Speicher/offsite, regelmäßige Restore-Tests. | P: 5

## Szenario
### Inventarbericht für die Geschäftsleitung
Die Geschäftsleitung möchte wissen, welche Abteilungen Geräte im Wert von über 20.000 € haben, absteigend sortiert.
- F: Formulieren Sie die Abfrage. | A: SELECT a.Name, SUM(g.Preis) AS Wert FROM Abteilung a JOIN Mitarbeiter m ON m.AbtID = a.AbtID JOIN Geraet g ON g.MaID = m.MaID GROUP BY a.Name HAVING SUM(g.Preis) > 20000 ORDER BY Wert DESC; | P: 5
- F: Warum gehört die Bedingung nicht in WHERE? | A: Sie bezieht sich auf ein Aggregat (SUM) der Gruppe, WHERE wird vor der Gruppierung ausgewertet. | P: 2

### Versehentliches Löschen
Um 10:50 Uhr hat ein Kollege versehentlich DELETE FROM Ticket ohne WHERE ausgeführt. Es gibt eine Vollsicherung von Sonntag, eine differenzielle von heute 06:00 Uhr und Protokollsicherungen alle 15 Minuten; Modell Vollständig.
- F: Bis zu welchem Zeitpunkt können Sie wiederherstellen? | A: Bis unmittelbar vor 10:50 Uhr (z. B. 10:49), wenn vorher ein Tail-Log-Backup gesichert wird. | P: 2
- F: In welcher Reihenfolge spielen Sie die Sicherungen ein? | A: Tail-Log sichern; Vollsicherung (NORECOVERY), differenzielle 06:00 (NORECOVERY), alle Protokollsicherungen ab 06:00 (NORECOVERY), letzte mit STOPAT 10:49, dann RECOVERY. | P: 4

### Webformular mit SQL-Injection
Ein internes Webformular baut die Abfrage so zusammen: "SELECT * FROM Mitarbeiter WHERE Name = '" + eingabe + "'". Ein Tester gibt ' OR '1'='1 ein und erhält alle Datensätze.
- F: Erklären Sie den Angriff. | A: Die Eingabe verändert die SQL-Syntax; die Bedingung wird immer wahr, alle Zeilen werden ausgegeben (SQL-Injection). | P: 2
- F: Nennen Sie zwei Gegenmaßnahmen. | A: Parametrisierte Abfragen/Prepared Statements, Eingabevalidierung, Anwendungskonto mit minimalen Rechten, WAF. | P: 2
