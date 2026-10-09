---
id: ihk-sql-server-db-anlegen
bereich: Datenbanken
block: IHK
kapitel: SQL Server Praxis
titel: SQL Server – Datenbanken anlegen (Dateien, Dateigruppen, Snapshot)
stufe: Fortgeschritten
fach: SQL / Datenbanken
pruefungen: [Schule]
typ: uebung
quellen: [5f1f9b7e-dateien_aufgabe_1.pdf, a18b4a93-dateien_aufgabe2_arbeitsauftrag.pdf, 53982cea-dateien_aufgabe3.pdf]
verweise: [ihk-lz-datenbank-sql]
---

## Profi

Drei Übungsblätter „Administration SQL-Server / Datenbanken anlegen" (Stand 01.06.2026). Voraussetzung: SQL Server Express (oder Developer) und SQL Server Management Studio (SSMS). Optional in einer VM (Hyper-V oder VMware) mit **vier zusätzlichen virtuellen Festplatten** (E:, F:, G: und eine weitere), damit Daten- und Logdateien auf getrennten Laufwerken liegen.

### Dateiarten einer SQL-Server-Datenbank
- **MDF**: primäre Datendatei (genau eine je Datenbank).
- **NDF**: sekundäre Datendatei (optional, mehrere möglich, in Dateigruppen).
- **LDF**: Transaktionsprotokoll (Log). Daten und Log gehören aus Performance- und Ausfallsicherheitsgründen auf getrennte Laufwerke.
- **Dateigruppe (Filegroup)**: logischer Container für Datendateien; Tabellen werden einer Dateigruppe zugeordnet (`ON RO_Data`). Standard ist `PRIMARY`.
- Eigenschaften je Datei: Startgröße (`SIZE`), Wachstum (`FILEGROWTH` in MB oder Prozent), Obergrenze (`MAXSIZE`).

### Aufgabe 1 – NewDB1 per SSMS
1. Rechtsklick auf Datenbanken > Neue Datenbank. Name `NewDB1`.
2. Datendatei: Pfad `E:\TestDatabases\NewDB1.mdf`, Anfangsgröße 15 MB, Autowachstum 5 MB, Maximalgröße 50 MB.
3. Protokoll: Pfad `F:\TestLogs\NewDB_Log.ldf`.
4. Tabelle anlegen und viele Zeilen einfügen, bis die MDF-Datei wächst (in den Dateieigenschaften beobachten).

```sql
-- Test: Daten erzeugen, bis die MDF wächst
USE NewDB1;
CREATE TABLE dbo.Fuell (id INT IDENTITY PRIMARY KEY, txt CHAR(2000) DEFAULT REPLICATE('x', 2000));
INSERT dbo.Fuell DEFAULT VALUES;
GO 5000   -- Batch 5000-mal ausführen
```
Die Ordner `E:\TestDatabases` und `F:\TestLogs` müssen vorher existieren und das SQL-Server-Dienstkonto braucht Schreibrechte.

### Aufgabe 2 – NewDB2 per T-SQL
```sql
CREATE DATABASE NewDB2
ON PRIMARY
(
  NAME = N'NewDB2_F1', FILENAME = N'E:\TestDatabases\NewDB2_F1.mdf',
  SIZE = 10MB, FILEGROWTH = 25%, MAXSIZE = 150MB
),
(
  NAME = N'NewDB2_F2', FILENAME = N'G:\TestDatabases\NewDB2_F2.ndf',
  SIZE = 15MB, FILEGROWTH = 10MB, MAXSIZE = 1GB
)
LOG ON
(
  NAME = N'NewDB2_Log', FILENAME = N'F:\TestLogs\NewDB2_Log.ldf'
);
```
Die NDF liegt hier in der Dateigruppe PRIMARY (mehrere Dateien einer Gruppe werden gleichmäßig befüllt).

### Aufgabe 3 – ShopDB mit Dateigruppe RO_Data
```sql
CREATE DATABASE ShopDB
ON PRIMARY (NAME = N'ShopDB', FILENAME = N'E:\ShopDB\ShopDB.mdf',
            SIZE = 50MB, FILEGROWTH = 50MB, MAXSIZE = 1000MB)
LOG ON     (NAME = N'ShopDB_Log', FILENAME = N'F:\ShopLogs\ShopDB_Log.ldf');
GO
ALTER DATABASE ShopDB ADD FILEGROUP RO_Data;
ALTER DATABASE ShopDB ADD FILE
  (NAME = N'ShopDB_RO', FILENAME = N'E:\ShopDB_RO\ShopDB_RO.ndf',
   SIZE = 10MB, FILEGROWTH = 10MB, MAXSIZE = 30MB)
  TO FILEGROUP RO_Data;
```
Das Skript `Ortsdaten.sql` muss so angepasst werden, dass jede `CREATE TABLE` mit `ON RO_Data` endet (Primärschlüssel-Index wird automatisch in dieselbe Gruppe gelegt, wenn man ihn nicht anders angibt: Clustered Index = Tabelle). Prüfung der Zuordnung:
```sql
SELECT t.name AS tabelle, i.name AS indexname, f.name AS dateigruppe
FROM sys.tables t
JOIN sys.indexes i ON i.object_id = t.object_id
JOIN sys.filegroups f ON f.data_space_id = i.data_space_id;
```
Schreibschutz setzen und testen:
```sql
ALTER DATABASE ShopDB MODIFY FILEGROUP RO_Data READ_ONLY;
-- als sqladmin:
DELETE FROM dbo.Ort WHERE id = 1;   -- Fehler: Dateigruppe ist schreibgeschützt
DROP TABLE dbo.Ort;                 -- ebenfalls Fehler: Tabellenseiten liegen in der schreibgeschützten Gruppe
```
Erwartung der Aufgabe: Weder Zeilen löschen noch Einfügen/Ändern noch Löschen der Tabelle gelingt, solange die Dateigruppe READ_ONLY ist; Lesen funktioniert. Zum Ändern zuerst `READ_WRITE` setzen (die Anweisung braucht exklusiven Datenbankzugriff).

Danach Optionen: Wiederherstellungsmodell **Einfach (SIMPLE)**, Kompatibilitätsgrad 100:
```sql
ALTER DATABASE ShopDB SET RECOVERY SIMPLE;
ALTER DATABASE ShopDB SET COMPATIBILITY_LEVEL = 100;   -- SQL Server 2008 R2
```
Wiederherstellungsmodelle: **FULL** (alle Transaktionen im Log, Point-in-Time-Restore, Logsicherung nötig), **BULK_LOGGED** (Massenoperationen minimal protokolliert), **SIMPLE** (Log wird automatisch gekürzt, nur Voll-/Differenzsicherung, kein Point-in-Time).

### Aufgabe 4 – Mondial: Snapshot
```sql
CREATE DATABASE Mondial_Snap
ON (NAME = N'Mondial', FILENAME = N'E:\Snapshots\Mondial_Snap.ss')
AS SNAPSHOT OF Mondial;
```
Der Snapshot ist eine **schreibgeschützte, zeitpunktbezogene Sicht**; er speichert nur geänderte Datenseiten (Copy-on-Write) in einer Sparse-Datei. Daher wächst er mit jeder Änderung an der Quelldatenbank. Wiederherstellen:
```sql
USE master;
RESTORE DATABASE Mondial FROM DATABASE_SNAPSHOT = 'Mondial_Snap';
```
Vor dem Restore dürfen nur ein einziger Snapshot und keine Verbindungen bestehen. Ein Snapshot ersetzt kein Backup (liegt auf demselben Datenträger).

## Einfach

Eine Datenbank in SQL Server besteht aus mindestens zwei Dateien. Die **MDF** ist der Aktenschrank mit den Daten. Die **LDF** ist das Tagebuch, in dem steht, was alles gemacht wurde. Wenn der Strom ausfällt, liest SQL Server das Tagebuch und stellt alles wieder her. Darum legt man Aktenschrank und Tagebuch am besten in zwei verschiedene Räume (Laufwerke).

**Wachstum** bedeutet: Wenn der Schrank voll ist, baut SQL Server ein Stück an, zum Beispiel 5 MB. **Maximalgröße** ist die Grenze, ab der er nicht mehr anbaut und „voll" meldet.

Eine **Dateigruppe** ist ein Regal im Keller. Du entscheidest, welche Ordner (Tabellen) in welches Regal kommen. Wenn du das Regal auf „nur lesen" stellst, kann niemand mehr etwas hineinlegen oder herausnehmen. Perfekt für alte Daten, die sich nie ändern, zum Beispiel Postleitzahlen.

Ein **Snapshot** ist ein Foto der Datenbank zu einem Zeitpunkt. Das Foto bleibt, auch wenn sich das Original ändert. Dafür muss SQL Server die alten Seiten aufheben, deshalb wird das Foto größer, je mehr Änderungen passieren. Wenn du dich vertan hast, kannst du das Original zum Foto zurückholen.

## Merksatz
- MDF = Daten, NDF = weitere Daten, LDF = Protokoll.
- Daten und Log auf getrennte Laufwerke.
- SIMPLE = Log wird selbst gekürzt, kein Point-in-Time.
- Snapshot = Foto mit Copy-on-Write, wächst bei Änderungen, ersetzt kein Backup.
- Dateigruppe READ_ONLY: nur lesen, auch für sqladmin.

## Prüfungsfalle
- Wachstum in Prozent mit MB verwechseln (`FILEGROWTH = 25%` versus `10MB`).
- Pfade angeben, die nicht existieren; das Dienstkonto braucht Rechte.
- Snapshot für ein Backup halten.
- Im Skript `Ortsdaten.sql` die Dateigruppe vergessen, dann liegen die Tabellen in PRIMARY.
- Bei SIMPLE Logsicherungen erwarten; sie sind nicht möglich.
- Einen Snapshot-Restore mit mehreren vorhandenen Snapshots der Datenbank versuchen.

## Grafik
### Dateien einer Datenbank
1. Datenbank: besteht aus Daten- und Protokolldateien
2. Datenbank -> Laufwerk E: MDF und NDF liegen in Dateigruppen
3. Datenbank -> Laufwerk F: LDF protokolliert alle Änderungen
4. Client -> Datenbank: schreibt eine Transaktion
5. Datenbank -> Laufwerk F: Eintrag im Log (Write-Ahead)
6. Datenbank -> Laufwerk E: Seiten werden später in die Datendatei geschrieben

### Snapshot mit Copy-on-Write
1. Admin -> Mondial: erstellt den Snapshot (zunächst fast leer)
2. Client -> Mondial: ändert eine Seite
3. Mondial -> Snapshot: kopiert die alte Seite in die Sparse-Datei
4. Mondial: speichert die neue Seite im Original
5. Client -> Snapshot: liest den Stand von früher
6. Admin -> Mondial: RESTORE ... FROM DATABASE_SNAPSHOT setzt den Zustand zurück

## Befehle
`CREATE DATABASE ... ON PRIMARY (...) LOG ON (...)` – Datenbank mit Dateiangaben anlegen
`ALTER DATABASE x ADD FILEGROUP y` – Dateigruppe hinzufügen
`ALTER DATABASE x ADD FILE (...) TO FILEGROUP y` – Datei in Gruppe legen
`ALTER DATABASE x MODIFY FILEGROUP y READ_ONLY` – Schreibschutz setzen
`ALTER DATABASE x SET RECOVERY SIMPLE` – Wiederherstellungsmodell ändern
`ALTER DATABASE x SET COMPATIBILITY_LEVEL = 100` – Kompatibilitätsgrad setzen
`CREATE DATABASE s ON (...) AS SNAPSHOT OF x` – Snapshot erstellen
`RESTORE DATABASE x FROM DATABASE_SNAPSHOT = 's'` – Auf Snapshot zurücksetzen
`SELECT * FROM sys.filegroups` – Dateigruppen anzeigen

## Übungen
- A: Legen Sie per T-SQL die Datenbank Demo an: MDF 20 MB, Wachstum 10 MB, Maximum 100 MB auf D:\Daten, Log auf E:\Logs. | L: CREATE DATABASE Demo ON PRIMARY (NAME=N'Demo', FILENAME=N'D:\Daten\Demo.mdf', SIZE=20MB, FILEGROWTH=10MB, MAXSIZE=100MB) LOG ON (NAME=N'Demo_Log', FILENAME=N'E:\Logs\Demo_Log.ldf');
- A: Wie legen Sie eine Tabelle in die Dateigruppe RO_Data? | L: CREATE TABLE dbo.Ort (id INT PRIMARY KEY, name NVARCHAR(100)) ON RO_Data;
- A: Wie prüfen Sie, in welcher Dateigruppe eine Tabelle liegt? | L: Über sys.tables, sys.indexes und sys.filegroups verknüpfen (index.data_space_id = filegroup.data_space_id).
- A: Wie stellen Sie Mondial auf den Snapshot-Stand zurück? | L: USE master; RESTORE DATABASE Mondial FROM DATABASE_SNAPSHOT = 'Mondial_Snap';

## Karteikarten
- F: Dateiendung der primären Datendatei? | A: .mdf
- F: Dateiendung einer sekundären Datendatei? | A: .ndf
- F: Dateiendung des Transaktionsprotokolls? | A: .ldf
- F: Wozu dienen Dateigruppen? | A: Zuordnung von Tabellen zu Datendateien/Laufwerken, Schreibschutz, Performance.
- F: Welche Parameter steuern die Dateigröße? | A: SIZE, FILEGROWTH, MAXSIZE.
- F: Wiederherstellungsmodelle? | A: FULL, BULK_LOGGED, SIMPLE.
- F: Was kann SIMPLE nicht? | A: Point-in-Time-Restore und Logsicherungen.
- F: Was ist ein Datenbank-Snapshot? | A: Schreibgeschützte Sicht auf den Zustand zu einem Zeitpunkt (Copy-on-Write).
- F: Warum wächst ein Snapshot? | A: Bei jeder Änderung am Original wird die alte Seite hineinkopiert.
- F: Ersetzt ein Snapshot ein Backup? | A: Nein, er liegt auf demselben Datenträger und hängt vom Original ab.
- F: Kompatibilitätsgrad 100 entspricht? | A: SQL Server 2008 R2.
- F: Warum Log und Daten trennen? | A: Performance und Ausfallsicherheit (sequentielles Logschreiben, getrennte Ausfalldomänen).

## Quiz
? Welche Datei enthält das Transaktionsprotokoll?
* .ldf
- .mdf
- .ndf
- .bak

? Welche Option begrenzt die maximale Dateigröße?
* MAXSIZE
- SIZE
- FILEGROWTH
- LIMIT

? Welches Wiederherstellungsmodell kürzt das Log automatisch?
* SIMPLE
- FULL
- BULK_LOGGED
- DIFFERENTIAL

? Wie legt man eine Tabelle in eine bestimmte Dateigruppe?
* CREATE TABLE ... ON Dateigruppenname
- CREATE TABLE ... IN Dateigruppenname
- ALTER TABLE ... SET Dateigruppe
- USE FILEGROUP

? Was macht `ALTER DATABASE ShopDB MODIFY FILEGROUP RO_Data READ_ONLY`?
* Setzt die Dateigruppe auf schreibgeschützt
- Löscht die Dateigruppe
- Verschlüsselt die Daten
- Erstellt ein Backup

? Warum wird ein Snapshot größer?
* Geänderte Seiten des Originals werden hineinkopiert
- Er speichert alle Abfragen
- Er komprimiert nicht
- Er legt das Log ab

? Welche Systemsichten prüfen die Dateigruppenzuordnung?
* sys.tables, sys.indexes, sys.filegroups
- sys.users, sys.roles, sys.logins
- sys.databases, sys.servers, sys.jobs
- sys.dm_os_wait_stats, sys.sessions, sys.events

? Welchen Befehl nutzt man für einen Snapshot-Restore?
* RESTORE DATABASE ... FROM DATABASE_SNAPSHOT
- ALTER DATABASE ... RESTORE
- ROLLBACK DATABASE
- DBCC RESTORE

? Welche Aussagen zu Dateigruppen stimmen? (mehrere)
* Eine Dateigruppe kann mehrere Dateien enthalten.
* Tabellen lassen sich einer Dateigruppe zuordnen.
- Dateigruppen enthalten immer das Log.
- Es gibt immer genau eine Datei je Gruppe.
