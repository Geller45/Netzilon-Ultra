---
id: db-backup-restore
bereich: Datenbanken
pruefungen: [Schule, AP2]
fach: SQL / Datenbanken
block: D3
kapitel: Administration
titel: SQL Server Backup und Restore – Wiederherstellungsmodelle, Sicherungstypen, Transaktionsprotokoll
stufe: Profi
quellen: [backup_restore.pdf, backup_und_recovery.pdf]
verweise: [db-transaktionen, db-partitionierung]
---

## Profi

### Transaktionsprotokoll (Transaction Log)
Änderungen werden zuerst im **Protokoll** (Write-Ahead-Logging) festgehalten (LSN = Log Sequence Number), später bei **Checkpoint** in die Datendatei übertragen. Das Log besteht aus virtuellen Logdateien (VLF); es gibt einen **aktiven** und einen **passiven** Teil.
- **Einfaches Modell (SIMPLE):** passiver Teil wird nach Checkpoint automatisch „frei“ (abgeschnitten).
- **Vollständig/Massenprotokolliert:** passiver Teil wird **erst nach einer Protokollsicherung** abgeschnitten – ohne Log-Backups wächst das Log unbegrenzt.
Überwachung: `DBCC SQLPERF(LOGSPACE)`, `DBCC LOGINFO`.

### Wiederherstellungsmodelle
| Modell | Vollsicherung | Differenziell | Protokollsicherung | Eigenschaft |
|---|---|---|---|---|
| **SIMPLE** | ja | ja | **nein** | Wiederherstellung nur bis zur letzten (Diff-)Sicherung, Datenverlust möglich; wenig Verwaltung |
| **BULK_LOGGED** | ja | ja | ja | Massenoperationen (bcp, BULK INSERT, SELECT INTO) minimal protokolliert; point-in-time dort eingeschränkt |
| **FULL** | ja | ja | ja | alle Änderungen protokolliert, **Point-in-Time-Recovery** möglich |
Umschalten: `ALTER DATABASE db SET RECOVERY FULL;`

### Sicherungstypen
| Typ | Inhalt |
|---|---|
| **Vollständig** | alle Datendateien + Teil des Protokolls |
| **Differenziell** | alle Seiten, die sich seit der letzten **Vollsicherung** geändert haben (nur zusammen mit passender Vollsicherung nutzbar) |
| **Transaktionsprotokoll** | alle seit der letzten Log-Sicherung protokollierten Änderungen (**lückenlose Kette** nötig) |
| Protokollfragment (Tail-Log) | aktiver Teil des Protokolls, z. B. vor Restore |
| Datei/Dateigruppe, Teilsicherung | einzelne Dateigruppen |
| **Kopiesicherung** (COPY_ONLY) | beeinflusst die Sicherungssequenz nicht |
Einsatz: Voll bei kleinen/selten geänderten DBs; Differenziell bei häufig geänderten DBs und kurzem Backup-Fenster; zusätzlich Protokollsicherungen bei häufigen Änderungen und geringem Datenverlust (RPO).
Backup-Rechte: **sysadmin, db_owner, db_backupoperator**. Medien: Festplatte, Band, URL (Azure Blob). Ein Sicherungssatz (backup set) liegt auf einem Medium/Mediensatz; mehrere Sätze in einer .bak-Datei.

### T-SQL
```
BACKUP DATABASE [TeachSQL] TO DISK = 'E:\Backups\TeachSQL.bak' WITH INIT, FORMAT;      -- voll
BACKUP DATABASE [TeachSQL] TO DISK = 'E:\Backups\TeachSQL.bak' WITH DIFFERENTIAL;       -- differenziell
BACKUP LOG      [TeachSQL] TO DISK = 'E:\Backups\TeachSQL.bak';                         -- Protokoll
RESTORE VERIFYONLY FROM DISK = 'E:\Backups\TeachSQL.bak';       -- Medium prüfen
RESTORE HEADERONLY FROM DISK = 'E:\Backups\TeachSQL.bak';       -- Sicherungssätze anzeigen
```
### Restore
Phasen: **Datenkopiervorgang → Rollforward (Redo) → Rollback (Undo)**. `WITH NORECOVERY` = weitere Sicherungen folgen (DB bleibt „Wird wiederhergestellt“), `WITH RECOVERY` = abschließen, DB online. `MOVE … TO` ändert Dateipfade, `REPLACE` überschreibt eine vorhandene DB, `STOPAT` für Point-in-Time.
```
RESTORE DATABASE TeachSQL FROM DISK='E:\Backups\TeachSQL.bak' WITH FILE=1, NORECOVERY;
RESTORE DATABASE TeachSQL FROM DISK='E:\Backups\TeachSQL.bak' WITH FILE=2, NORECOVERY;   -- Diff
RESTORE LOG TeachSQL FROM DISK='E:\Backups\TeachSQL.bak' WITH FILE=3, NORECOVERY;
RESTORE LOG TeachSQL FROM DISK='E:\Backups\TeachSQL.bak' WITH FILE=4, RECOVERY;
```
Reihenfolge: **letzte Vollsicherung → letzte Differenzielle → alle Protokollsicherungen danach in Reihenfolge**.

### Snapshots und Systemdatenbanken
**Datenbank-Snapshot**: schreibgeschützte Sicht auf einen Zeitpunkt (Copy-on-Write); gelöschte Zeilen/Objekte daraus zurückholbar. Systemdatenbanken **master, model, msdb** nach Änderungen sichern. Ist master defekt: Instanz im Einzelbenutzermodus starten, master-Backup einspielen; ohne Zugriff master mit Setup neu erstellen, dann master, msdb, model wiederherstellen.

## Einfach

Ein **Backup** ist eine **Sicherheitskopie** – wie ein Foto von deinem Zimmer, falls mal alles durcheinandergeworfen wird.

Es gibt drei Arten, Fotos zu machen:
1. **Vollsicherung** = Ein **komplettes Foto** vom ganzen Zimmer. Dauert lange, ist aber vollständig. (z. B. Sonntag)
2. **Differenzielle Sicherung** = Ein Foto nur von dem, was sich **seit dem letzten Komplettfoto** verändert hat. Schneller. (z. B. jeden Abend)
3. **Protokollsicherung** = Ein **Tagebuch** aller Änderungen, Schritt für Schritt (z. B. jede Stunde). Damit kannst du das Zimmer so herstellen, wie es **um 10:47 Uhr** aussah. Wichtig: Die Tagebuchseiten müssen **lückenlos** aufeinander folgen. Fehlt eine Seite, brichst du ab.

**Wiederherstellen** (Restore): Erst das Komplettfoto einspielen, dann das letzte Differenzfoto, dann alle Tagebuchseiten der Reihe nach. Bei allen außer dem Letzten sagst du **NORECOVERY** („Moment, es kommt noch mehr!“), beim allerletzten **RECOVERY** („Fertig, Datenbank freigeben!“).

Die **Wiederherstellungsmodelle** sind wie drei Sicherheitsstufen:
- **Einfach:** Kein Tagebuch. Wenn es knallt, sind alle Änderungen seit dem letzten Foto weg.
- **Vollständig:** Tagebuch wird geführt; nichts geht verloren. Dafür muss man es regelmäßig sichern, sonst wird es immer dicker (die Logdatei wächst).
- **Massenprotokolliert:** Wie vollständig, aber riesige Massenimporte werden nur grob notiert.

Und ganz wichtig: Ein Backup, das man **nie getestet** hat, ist kein Backup. Deshalb gibt es `RESTORE VERIFYONLY`.

## Merksatz
- **Voll – Differenziell – Log.**
- **Restore: Voll → letzte Diff → Logs in Reihenfolge; NORECOVERY bis zum Schluss, dann RECOVERY.**
- **SIMPLE = keine Log-Backups, FULL = Point-in-Time.**
- **Log wird in FULL erst durch Log-Backup abgeschnitten.**
- **Ein ungetestetes Backup ist keins.**

## Prüfungsfalle
- Differenzielle Sicherung bezieht sich immer auf die **letzte Vollsicherung**, nicht auf die letzte Differenzielle.
- Im Modell **SIMPLE** sind Protokollsicherungen **nicht** möglich.
- Vergisst man `NORECOVERY` bei der Voll-/Differenzialsicherung, können keine Logs mehr eingespielt werden.
- Wachsendes Log im FULL-Modell: fehlende Log-Backups sind meist die Ursache.
- Kopiesicherung bricht die Sicherungskette nicht.
- Zum Sichern berechtigt: sysadmin, db_owner, db_backupoperator.
- Backups auf **dieselbe Platte** wie die DB bringen nichts (Hardwaredefekt) – 3-2-1-Regel.

## Grafik
### Backup-Strategie und Restore
1. Sonntag: Vollsicherung der Datenbank
2. Montag: Differenzielle Sicherung (Änderungen seit Sonntag)
3. Dienstag: Differenzielle Sicherung (Änderungen seit Sonntag)
4. Stündlich: Protokollsicherung
5. Crash am Dienstag 11:00 Uhr
6. Restore: Voll (NORECOVERY), Diff Dienstag (NORECOVERY), Logs bis 11:00 (letzter mit RECOVERY)
### Log im Modell FULL
1. Client -> Transaktionsprotokoll: Änderung wird protokolliert
2. Transaktionsprotokoll -> Datenbankdatei: Checkpoint überträgt Daten
3. Transaktionsprotokoll: passiver Teil bleibt erhalten
4. Admin -> Transaktionsprotokoll: BACKUP LOG
5. Transaktionsprotokoll: passiver Teil wird abgeschnitten, Platz frei

## Lab
### GUI
Maschine: SQL-Server-VM (SSMS). Datenbank BackupTest anlegen (Optionen > Wiederherstellungsmodell: Vollständig). Rechtsklick Datenbank > Aufgaben > Sichern > Typ Vollständig, Ziel Ordner C:\SQLBackup. Danach Datenbank löschen: Aufgaben > Wiederherstellen > Datenbank.
### SQL
```
CREATE DATABASE BackupTest; ALTER DATABASE BackupTest SET RECOVERY FULL;
BACKUP DATABASE BackupTest TO DISK='C:\SQLBackup\BackupTest.bak' WITH INIT;
-- Änderungen ...
BACKUP DATABASE BackupTest TO DISK='C:\SQLBackup\BackupTest_diff.bak' WITH DIFFERENTIAL;
BACKUP LOG BackupTest TO DISK='C:\SQLBackup\BackupTest_log.trn';
DROP DATABASE BackupTest;
RESTORE DATABASE BackupTest FROM DISK='C:\SQLBackup\BackupTest.bak' WITH NORECOVERY;
RESTORE DATABASE BackupTest FROM DISK='C:\SQLBackup\BackupTest_diff.bak' WITH NORECOVERY;
RESTORE LOG BackupTest FROM DISK='C:\SQLBackup\BackupTest_log.trn' WITH RECOVERY;
```

## Befehle
- `BACKUP DATABASE db TO DISK='…'` – Vollsicherung
- `… WITH DIFFERENTIAL` – differenziell
- `BACKUP LOG db TO DISK='…'` – Protokoll
- `RESTORE DATABASE … WITH NORECOVERY | RECOVERY`
- `RESTORE VERIFYONLY` / `RESTORE HEADERONLY` – prüfen / Inhalt anzeigen
- `ALTER DATABASE db SET RECOVERY FULL|SIMPLE|BULK_LOGGED`

## Übungen
- A: Welche Sicherungen brauchen Sie nach Vollsicherung (So), Diff (Mo), Diff (Di), Log (Di 10 Uhr) bei Crash am Di 11 Uhr? | L: Vollsicherung So, Diff Di (letzte), Log Di 10 Uhr, plus Tail-Log-Backup (aktiver Teil) für Datenstand bis 11 Uhr.
- A: Warum wächst die Logdatei im FULL-Modell ohne Log-Backup? | L: Passiver Teil wird nur durch Protokollsicherung abgeschnitten.
- A: Welcher Befehl prüft eine Sicherungsdatei, ohne wiederherzustellen? | L: RESTORE VERIFYONLY FROM DISK=…
- A: Wann verwenden Sie WITH NORECOVERY? | L: Bei allen Restore-Schritten außer dem letzten, wenn weitere Diff-/Log-Sicherungen folgen.
- A: Welche Wiederherstellungsmodelle erlauben Log-Backups? | L: FULL und BULK_LOGGED, nicht SIMPLE.

## Karteikarten
- F: Was sichert eine Vollsicherung? | A: Alle Datendateien und einen Teil des Transaktionsprotokolls.
- F: Was sichert eine differenzielle Sicherung? | A: Alle Änderungen seit der letzten Vollsicherung.
- F: Was sichert eine Protokollsicherung? | A: Die im Transaktionsprotokoll aufgezeichneten Änderungen seit dem letzten Log-Backup.
- F: Welche Modelle gibt es? | A: SIMPLE, BULK_LOGGED, FULL.
- F: Wann ist Point-in-Time-Recovery möglich? | A: Im Modell FULL (mit Log-Backups, STOPAT).
- F: NORECOVERY vs. RECOVERY? | A: NORECOVERY: weitere Restores folgen; RECOVERY: abschließen, DB online.
- F: Wer darf sichern? | A: sysadmin, db_owner, db_backupoperator.
- F: Phasen eines Restore? | A: Datenkopie, Rollforward, Rollback.
- F: Was ist ein Datenbank-Snapshot? | A: Schreibgeschützte Momentaufnahme (Copy-on-Write) zum Zurückholen von Daten.
- F: Was ist ein Tail-Log-Backup? | A: Sicherung des aktiven Protokollteils vor einem Restore, um letzte Änderungen zu retten.
- F: Welche Systemdatenbanken sichern? | A: master, model, msdb.

## Quiz
? Welches Modell erlaubt keine Protokollsicherung?
* SIMPLE
- FULL
- BULK_LOGGED
- Keines

? Worauf bezieht sich eine differenzielle Sicherung?
* Auf die letzte Vollsicherung
- Auf die letzte Differenzielle
- Auf die letzte Protokollsicherung
- Auf den Checkpoint

? Welche Option nutzt man bei allen Restore-Schritten außer dem letzten?
* NORECOVERY
- RECOVERY
- REPLACE
- MOVE

? Was schneidet im FULL-Modell das Log ab?
* Eine Protokollsicherung
- Ein Checkpoint
- Ein SELECT
- Ein Neustart

? Welcher Befehl listet die Sicherungssätze einer Datei?
* RESTORE HEADERONLY
- RESTORE VERIFYONLY
- BACKUP LOG
- DBCC OPENTRAN

? Wer darf Datenbanken sichern?
* db_backupoperator
- db_datareader
- db_denydatawriter
- public

? Was muss bei Protokollsicherungen eingehalten werden?
* Eine lückenlose Kette
- Beliebige Reihenfolge
- Nur die letzte wird benötigt
- Gleiche Dateigröße

? Welche Sicherung eignet sich bei häufigen Änderungen und kurzem Backup-Fenster?
* Differenziell (plus Log)
- Nur Vollsicherung wöchentlich
- Keine
- Nur Kopiesicherung

## Lücken
- Eine {differenzielle} Sicherung enthält alle Änderungen seit der letzten {Vollsicherung}.
- Im Modell {SIMPLE} sind keine Protokollsicherungen möglich.

## Reihenfolge
### Restore-Reihenfolge
1. Letzte Vollsicherung (NORECOVERY)
2. Letzte differenzielle Sicherung (NORECOVERY)
3. Protokollsicherungen in Reihenfolge (NORECOVERY)
4. Letzte Protokollsicherung (RECOVERY)

## Zuordnen
### Modell und Eigenschaft
- SIMPLE => keine Log-Backups, Log wird automatisch abgeschnitten
- FULL => Point-in-Time-Recovery
- BULK_LOGGED => Massenoperationen minimal protokolliert

## Freitext
- F: Erläutern Sie, wann Sie differenzielle Sicherungen und Protokollsicherungen einsetzen. | M: Differenziell bei häufig geänderten Datenbanken zur Verkürzung von Backup-Zeit und Restore-Kette; Protokollsicherung zusätzlich, wenn kaum Datenverlust akzeptabel ist (Point-in-Time, Modell FULL) und eine Vollsicherung zu lange dauert. | P: 4

## Spickzettel
- Voll, Differenziell (seit Voll), Log (lückenlose Kette)
- Modelle: SIMPLE / BULK_LOGGED / FULL
- Restore: Voll → Diff → Logs; NORECOVERY … RECOVERY
- Rechte: sysadmin, db_owner, db_backupoperator
- Systemdatenbanken: master, model, msdb
