---
id: az800-dateisysteme
bereich: AZ-800
block: A7
kapitel: Storage & Dateidienste
titel: ReFS im Vergleich zu NTFS
stufe: Fortgeschritten
quellen: [AZ-800 Study Guide, Microsoft Learn, Speicher-/Dateidienste-Unterlagen]
verweise: [az800-storage-spaces, az800-datentraeger, az800-dedup, ap1-a2-dateisysteme, az800-freigaben]
---

## Profi

### Überblick
| Dateisystem | Kurzbeschreibung |
|---|---|
| **NTFS** (*New Technology File System*) | **Standard** seit Windows NT; universell: Berechtigungen (ACL), Kontingente, EFS, Komprimierung, **Startvolume** |
| **ReFS** (*Resilient File System*) | Seit Server 2012; auf **Ausfallsicherheit**, **Skalierung** und **Virtualisierung** ausgelegt; **kein Boot-Laufwerk** (Systemvolume bleibt NTFS) |

### Vergleich
| Merkmal | **NTFS** | **ReFS** |
|---|---|---|
| **Startvolume/Systemlaufwerk** | ja | **nein** |
| **Max. Volumegröße** | 256 TB (bei 64-KB-Cluster) | **35 PB** |
| **Max. Dateigröße** | 256 TB | **35 PB** |
| **Berechtigungen (ACL)** | ja | ja |
| **Verschlüsselung** | **EFS**, **BitLocker** | **BitLocker** (**kein EFS**) |
| **Komprimierung** (NTFS-Kompression) | ja | **nein** |
| **Datenträgerkontingente** (*Quotas*) | ja | **nein** |
| **Deduplizierung** | ja | ja (ab Server 2019) |
| **Selbstheilung / Prüfsummen** | nein (nur Metadaten-Journal) | **Integritätsströme** (*Integrity Streams*): **Prüfsummen** für Metadaten **und** optional Daten; **automatische Reparatur** aus Spiegelkopie |
| **Fehlerbehandlung** | `chkdsk` (Volume **offline**) | **Kein chkdsk**; **online** Reparatur (*Salvage*), **Scrubber** im Hintergrund |
| **Block Cloning** | nein | **ja** – `ReFS Block Cloning` (Dateien **kopieren** = nur Metadaten, sehr schnell; Hyper-V-Prüfpunkte, VHDX-Zusammenführung) |
| **Sparse VDL** (*Valid Data Length*) | nein | ja – **VHDX fester Größe in Sekunden** anlegen, ohne Nullen zu schreiben |
| **Hardlinks, Alternate Data Streams** | ja | Hardlinks ab ReFS 3.5 (Server 2022), **ADS** ja |
| **Kurze Dateinamen (8.3)** | ja | **nein** |
| **Speicherplätze/S2D** | ja | **ja, empfohlen** (Reparatur mit Spiegel/Parität) |
| **Storage Replica** | ja | ja |
| **Cluster Shared Volume (CSV)** | ja | **ja, bevorzugt** (**Direct I/O** im S2D-Cluster) |
| **Wechselmedien** | ja | **nein** |

### Einsatzempfehlung
| Szenario | Dateisystem |
|---|---|
| **Systemlaufwerk C:**, allgemeine Dateiserver mit **EFS/Quotas/Kompression** | **NTFS** |
| **Hyper-V-VMs**, **VHDX**, Prüfpunkte, Backup-Ziele (**Veeam** nutzt Block Cloning), **S2D**, große **Datenbank-Volumes**, **Archiv** | **ReFS** |
| **Wechseldatenträger**, **Dual-Boot** | **NTFS** (oder exFAT) |

### Integritätsströme (*Integrity Streams*)
- **Metadaten**: **immer** mit Prüfsumme.
- **Daten**: per **Ordner/Datei** aktivierbar (`Set-FileIntegrity`).
- Bei **Spiegel-/Paritätslayout** (Storage Spaces): fehlerhafter Block wird aus der **gesunden Kopie** **automatisch repariert**.
- **Ohne Redundanz** (einfaches Layout): Fehler wird **erkannt und protokolliert**, aber **nicht repariert**.
- **Nachteil**: **Schreiben** etwas **langsamer** (Prüfsummen).

### Konvertierung
- **NTFS → ReFS**: **nicht** direkt umwandelbar → **Daten sichern**, Volume **neu formatieren** (`Format-Volume -FileSystem ReFS`), Daten zurückkopieren.
- **ReFS → NTFS**: ebenso **nur per Neuformatierung**.
- **FAT32 → NTFS**: mit `convert D: /fs:ntfs` **verlustfrei** (nur NTFS).

## Lab
**Maschine**: **FS01** (Windows Server 2022, **zwei** leere Datenträger 20 GB).

### GUI
1. **FS01**: **Datenträgerverwaltung** (`diskmgmt.msc`) → Datenträger 1 → **Online** → **GPT initialisieren** → **Neues einfaches Volume** → **E:** → **NTFS**.
2. **FS01**: Datenträger 2 → ebenso → **F:** → Dateisystem **ReFS**, Zuordnungseinheit **Standard**.
3. **FS01**: Rechtsklick **E:** → **Eigenschaften** → Register **Allgemein**: Option **Laufwerk komprimieren** vorhanden; bei **F:** **nicht** vorhanden.
4. **FS01**: Rechtsklick **F:** → **Eigenschaften** → **Sicherheit** / **Kontingent**: **Kontingent**-Register nur bei E:.
5. **FS01**: Große Datei (ISO, 4 GB) auf **E:** kopieren (Zeit merken), dann auf **F:** kopieren; **innerhalb** von F: nochmals **kopieren** → geht nahezu sofort (**Block Cloning**).
6. **FS01**: Explorer → Rechtsklick auf Datei **F:\Test\datei.txt** → **Eigenschaften → Erweitert**: **Verschlüsseln** (EFS) ist bei ReFS **ausgegraut**.

### PowerShell
```powershell
# Auf FS01 – Volumes anlegen
Get-Disk | Where-Object PartitionStyle -eq 'RAW'
Initialize-Disk -Number 1 -PartitionStyle GPT
New-Partition -DiskNumber 1 -DriveLetter E -UseMaximumSize | Format-Volume -FileSystem NTFS -NewFileSystemLabel "Daten-NTFS"
Initialize-Disk -Number 2 -PartitionStyle GPT
New-Partition -DiskNumber 2 -DriveLetter F -UseMaximumSize | Format-Volume -FileSystem ReFS -NewFileSystemLabel "Daten-ReFS"

# Dateisystem anzeigen
Get-Volume | Select-Object DriveLetter,FileSystem,FileSystemLabel,Size,SizeRemaining

# Integritätsströme prüfen/setzen
Get-FileIntegrity -FileName F:\Test\datei.txt
Set-FileIntegrity -FileName F:\Test\datei.txt -Enable $true

# ReFS-Volume mit Dedup (Server 2019+)
Enable-DedupVolume -Volume F: -UsageType Backup

# Reparatur/Scrubber (nur ReFS, ohne chkdsk)
Repair-Volume -DriveLetter F -Scan
Repair-Volume -DriveLetter F -SpotFix

# NTFS: klassisch
chkdsk E: /f
# FAT32 → NTFS (nur dieser Weg)
convert G: /fs:ntfs
```

## Einfach

**NTFS** = das **Schweizer Taschenmesser** unter den Dateisystemen: kann **alles** – Berechtigungen, Verschlüsselung, Komprimierung, Kontingente – und du kannst **Windows** darauf **starten**.

**ReFS** = das **Spezialwerkzeug** für **riesige** Datenmengen und **virtuelle Maschinen**. Es hat einen eingebauten **Wächter**: Jeder Datenblock bekommt eine **Prüfsumme** (wie ein **Siegel**). Ist ein Block **kaputt**, merkt ReFS das und **repariert** ihn aus der **Sicherheitskopie** (wenn es im Speicherplatz gespiegelt ist) – **ohne** das Laufwerk **anzuhalten**.

Ein Kunststück von ReFS: **Block Cloning**. Eine **100-GB-Datei kopieren** heißt nicht, alle Daten zu **schaufeln**, sondern nur, einen **zweiten Zettel** mit Verweis auf dieselben Blöcke zu schreiben → **sofort fertig**. Deshalb sind **Hyper-V**-Prüfpunkte und **Backups** auf ReFS so **flott**.

**Aber**: ReFS kann **nicht** von der **Startplatte C:** laufen, hat **kein EFS**, **keine NTFS-Komprimierung**, **keine Kontingente** und **keine 8.3-Namen**.

**Faustregel**: **C:** und **normale Dateiserver** → **NTFS**. **VMs, Backup, S2D** → **ReFS**.

## Merksatz
- **NTFS** = **Universal** (Boot, EFS, Quotas, Kompression).
- **ReFS** = **Resilient** (Prüfsummen, Selbstheilung, **Block Cloning**, **Sparse VDL**).
- **ReFS**: **kein Boot**, **kein EFS**, **keine Kompression**, **kein chkdsk**.
- **Selbstheilung** braucht **Redundanz** (Spiegel/Parität) – sonst nur **Erkennung**.
- **Umwandeln** NTFS ↔ ReFS nur durch **Neuformatieren**.
- **VMs/CSV/S2D** → **ReFS**; **C:** → **NTFS**.

## Prüfungsfalle
- ReFS ist **nicht** als **Startvolume** geeignet.
- **BitLocker** geht mit ReFS, **EFS** **nicht**.
- Integritätsströme **reparieren** nur bei **Spiegel/Parität** – bei einfachem Layout nur **Erkennen**.
- **chkdsk** gibt es für ReFS **nicht** (stattdessen **Repair-Volume**/Scrubber).
- **Kontingente** (NTFS-Datenträgerkontingent) und **NTFS-Komprimierung** gibt es unter **ReFS nicht**.
- **In-Place-Konvertierung** NTFS → ReFS **nicht** möglich (nur **FAT32 → NTFS** per `convert`).
- Dedup ist unter ReFS **erst ab Server 2019** möglich.
- **Wechselmedien** (USB-Stick) können **nicht** mit ReFS formatiert werden.

## Grafik
### Siegel
Datenblöcke laufen mit **Prüfsummen-Siegeln** über ein Band; ein Block bekommt einen Riss (roter Blitz), der Wächter holt eine Kopie aus dem Spiegel und tauscht ihn aus, das Band läuft weiter.

### Klonen
Links **NTFS**: Datei wird Block für Block in eine zweite Datei geschaufelt (lange Fortschrittsanzeige). Rechts **ReFS**: zweite Datei zeigt nur mit Pfeilen auf dieselben Blöcke, Balken springt sofort auf 100 %.

### Tabelle
Zwei Werkzeugkästen nebeneinander: Schweizer Messer (NTFS) und Spezial-Klonschneider (ReFS) mit Häkchen und Kreuzen für die Merkmale.

## Karteikarten
- F: Wofür steht ReFS? | A: Resilient File System.
- F: Kann ReFS als Startvolume dienen? | A: Nein.
- F: Welche Verschlüsselung unterstützt ReFS nicht? | A: EFS (BitLocker geht).
- F: Was sind Integritätsströme? | A: Prüfsummen für Metadaten (optional Daten) mit automatischer Reparatur aus redundanter Kopie.
- F: Voraussetzung für Selbstheilung in ReFS? | A: Redundanz (Spiegel- oder Paritätslayout in Storage Spaces).
- F: Was ist Block Cloning? | A: Kopieren nur über Metadaten (gemeinsame Blöcke), sehr schnell, z. B. Hyper-V-Prüfpunkte.
- F: Was macht Sparse VDL? | A: Feste VHDX in Sekunden anlegen, ohne Nullen zu schreiben.
- F: Wie kann man NTFS in ReFS umwandeln? | A: Nur Daten sichern, neu formatieren, zurückkopieren.
- F: Welches Dateisystem für Hyper-V-VMs, CSV und S2D? | A: ReFS.
- F: Welches Dateisystem für Systemlaufwerk und EFS/Quotas? | A: NTFS.
- F: Wie prüft man ReFS statt mit chkdsk? | A: Repair-Volume -Scan bzw. Scrubber.
- F: Wie wandelt man FAT32 verlustfrei um? | A: convert X: /fs:ntfs

## Quiz
? Auf einem Server sollen Hyper-V-VHDX-Dateien liegen; Prüfpunkte und Zusammenführungen sollen möglichst schnell gehen. Dateisystem?
* ReFS
- NTFS mit Komprimierung
- exFAT
- FAT32

? Auf einem Volume sollen einzelne Dateien mit EFS verschlüsselt werden. Dateisystem?
* NTFS
- ReFS
- exFAT
- FAT32

? Ein ReFS-Volume liegt auf einem einfachen Speicherplatz ohne Redundanz. Eine Datei zeigt einen Prüfsummenfehler. Ergebnis?
* Fehler wird erkannt, aber nicht repariert
- Automatische Reparatur aus Spiegelkopie
- Volume wird per chkdsk repariert
- Datei wird gelöscht

? Ein vorhandenes NTFS-Datenvolume soll ohne Datenverlust zu ReFS werden. Vorgehen?
* Daten sichern, mit ReFS neu formatieren, Daten zurückkopieren
- convert D: /fs:refs
- Dateisystemeigenschaft im Explorer umstellen
- Set-FileIntegrity -Enable

? Welche Funktion hat ReFS, NTFS nicht?
* Block Cloning
- BitLocker
- ACL-Berechtigungen
- Zugriffsbasierte Kontingente pro Benutzer

? Auf welchem Volume ist ReFS nicht einsetzbar?
* Startvolume mit Windows
- Cluster Shared Volume
- Storage-Spaces-Direct-Volume
- Backup-Zielvolume
