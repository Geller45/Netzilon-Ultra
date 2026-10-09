---
id: az800-vhdx
bereich: AZ-800
block: A7
kapitel: VMs & Container
titel: Virtuelle Festplatten – VHD, VHDX, VHD Set, Typen & Bearbeitung
stufe: Fortgeschritten
quellen: [AZ-800 Study Guide, Microsoft Learn, Uebung-Vorlagen-DC-3-Rechner.pdf]
verweise: [ap1-a6-sysprep, az800-pruefpunkte, ap1-a2-dateisysteme, az800-storage-spaces]
---

## Profi

### Formate
| | **VHD** | **VHDX** | **VHD Set (.vhds)** |
|---|---|---|---|
| Maximale Größe | **2 TB** (2.040 GB) | **64 TB** | 64 TB |
| Sektorgröße | 512 Byte | **4K-Sektoren** (logisch 512/4096) | wie VHDX |
| Stromausfall-Schutz | nein | **Protokoll (Log) für Metadaten** → widerstandsfähiger | ja |
| Online vergrößern/verkleinern | nein | **ja** (SCSI, Server 2012 R2+) | ja |
| TRIM/UNMAP | nein | ja (Speicher freigeben) | ja |
| Einsatz | Kompatibilität (alte Systeme, **Azure**-Upload: Azure akzeptiert nur **VHD mit fester Größe**) | **Standard** | **gemeinsame** Datenträger für **Gastcluster** (Nachfolger von Shared VHDX), mit Prüfpunkten/Backup |
Umwandeln mit `Convert-VHD` (VM aus).

### Datenträgertypen
| Typ | Beschreibung | Vor-/Nachteil |
|---|---|---|
| **Feste Größe** (Fixed) | voller Platz sofort reserviert | beste, gleichmäßige Leistung, kein Überbuchungsrisiko; Platzbedarf; empfohlen für Produktion mit hoher IO-Last (heute Unterschied gering) |
| **Dynamisch erweiterbar** (Dynamic) | wächst mit den Daten bis zur Maximalgröße | spart Platz; **Überbuchung** (Volume läuft voll → VMs pausieren); leicht mehr Fragmentierung; Standard |
| **Differenzierend** (Differencing) | speichert nur Änderungen gegenüber einem **Eltern-Datenträger** | sehr platzsparend (Labs, VDI, Vorlagen); Eltern darf **nie** verändert werden; Leistung durch Kette |
| **Pass-through** (physischer Datenträger) | physische Disk direkt an VM (offline am Host) | Legacy – keine Prüfpunkte/Replikation, heute kaum genutzt |

### Controller: IDE vs. SCSI
- **Generation 1**: Boot-Datenträger muss am **IDE**-Controller hängen; SCSI nur für Datenlaufwerke.
- **Generation 2**: **nur SCSI** (Booten von SCSI, UEFI, Secure Boot), bis 64 Datenträger pro Controller, 4 Controller.
- Datenträger an **SCSI** können im **laufenden Betrieb hinzugefügt/entfernt** werden (Hot-Add).

### Datenträger bearbeiten
Hyper-V-Manager → **Datenträger bearbeiten** (bzw. `Optimize-VHD`, `Resize-VHD`, `Merge-VHD`, `Convert-VHD`):
- **Komprimieren** (Compact/Optimize): ungenutzten Platz dynamischer Disks freigeben (VM aus oder Disk schreibgeschützt eingebunden; vorher im Gast defragmentieren/`Optimize-Volume -ReTrim`).
- **Konvertieren**: VHD ↔ VHDX, fest ↔ dynamisch.
- **Erweitern**: Größe erhöhen (VHDX an SCSI **online**), danach **im Gast** Volume erweitern (Datenträgerverwaltung → Volume erweitern / `Resize-Partition`).
- **Verkleinern**: nur, wenn im Gast vorher Volume verkleinert wurde (nicht zugeordneter Platz am Ende).
- **Zusammenführen** (Merge): Differenzierende Disk in Eltern bzw. neue Disk einarbeiten.
- **Überprüfen**/`Test-VHD`: Kette und Integrität prüfen; bei verschobener Eltern-Disk **„Neu verbinden“** (`Set-VHD -ParentPath`).

### VHDX außerhalb von VMs
- **Einbinden** im Host: Doppelklick bzw. `Mount-VHD` → erscheint als Laufwerk (z. B. für Offline-Bearbeitung, Treiber einspielen mit DISM).
- **Native Boot** von VHDX (Windows vom VHDX-Datei starten, `bcdboot`).
- Datenträgerverwaltung: **VHD erstellen/anfügen** – z. B. als Container für Daten.

### Speicher-QoS und Freigaben
- **Storage QoS** pro VHDX (Minimum/Maximum **IOPS**, normiert auf 8 KB) → siehe Storage-Bereich.
- VHDX-Dateien können auf **SMB 3-Freigaben** (Scale-Out File Server) liegen.
- **Shared VHDX / VHD Set** für **Gastcluster** (mehrere VMs greifen gemeinsam zu) auf CSV/SOFS.

## Lab
**Maschinen**: Hyper-V-**Host**, VM **SRV01** (Gen 2), Vorlage `C:\Hyper-V\Vorlagen\Server2025.vhdx`.

### GUI
1. **Host**: Hyper-V-Manager → Neu → **Festplatte** → **VHDX** → **Dynamisch erweiterbar** → `D:\Hyper-V\SRV01\Daten.vhdx`, 40 GB.
2. **SRV01** (läuft) → Einstellungen → **SCSI-Controller** → Festplatte → Hinzufügen → `Daten.vhdx` (Hot-Add) → im Gast: Datenträgerverwaltung → Online → Initialisieren (GPT) → Volume E:.
3. **Host**: Daten.vhdx → **Datenträger bearbeiten** → **Erweitern** auf 60 GB (online) → im Gast: Volume E: → **Volume erweitern**.
4. **Host**: Neu → Festplatte → **Differenzierend** → übergeordnet `Server2025.vhdx` → `TEST01.vhdx` → neue VM mit dieser Disk.
5. **Host**: Datenträger bearbeiten → `TEST01.vhdx` → **Überprüfen** (Elternbeziehung) → Vorlage verschieben → Überprüfen → **Neu verbinden**.
6. **Host**: Neu → Festplatte → **VHD, feste Größe** 30 GB (für Azure-Upload); `Convert-VHD` VHDX → VHD fest.

### PowerShell
```powershell
# Auf dem Host
New-VHD -Path D:\Hyper-V\SRV01\Daten.vhdx -SizeBytes 40GB -Dynamic
Add-VMHardDiskDrive -VMName SRV01 -ControllerType SCSI -Path D:\Hyper-V\SRV01\Daten.vhdx
Resize-VHD -Path D:\Hyper-V\SRV01\Daten.vhdx -SizeBytes 60GB
Invoke-Command -VMName SRV01 -Credential (Get-Credential) {
  Resize-Partition -DriveLetter E -Size (Get-PartitionSupportedSize -DriveLetter E).SizeMax }

New-VHD -Path D:\Hyper-V\TEST01.vhdx -ParentPath C:\Hyper-V\Vorlagen\Server2025.vhdx -Differencing
Get-VHD -Path D:\Hyper-V\TEST01.vhdx | Select-Object VhdType, ParentPath, FileSize, Size
Test-VHD -Path D:\Hyper-V\TEST01.vhdx
Set-VHD -Path D:\Hyper-V\TEST01.vhdx -ParentPath E:\Vorlagen\Server2025.vhdx   # nach Verschieben neu verbinden

Optimize-VHD -Path D:\Hyper-V\SRV01\Daten.vhdx -Mode Full      # VM aus / Disk nicht in Verwendung
Convert-VHD -Path D:\Hyper-V\Upload.vhdx -DestinationPath D:\Hyper-V\Upload.vhd -VHDType Fixed
Merge-VHD -Path D:\Hyper-V\TEST01.vhdx -DestinationPath D:\Hyper-V\TEST01-voll.vhdx

Mount-VHD -Path D:\Hyper-V\Upload.vhd -ReadOnly; Dismount-VHD -Path D:\Hyper-V\Upload.vhd

# VHD Set für Gastcluster
New-VHD -Path C:\ClusterStorage\Volume1\Shared.vhds -SizeBytes 100GB -Dynamic
```

## Einfach

Eine **virtuelle Festplatte** ist einfach eine **große Datei** auf dem Host, die sich für die VM wie eine echte Festplatte anfühlt.

**Formate**:
- **VHD** = der **alte Koffer**: max. 2 TB, empfindlich bei Stromausfall. Heute noch für **Azure** (dort nur VHD mit fester Größe).
- **VHDX** = der **moderne Koffer**: bis 64 TB, robuster (Tagebuch gegen Stromausfall), kann im Betrieb **größer** gemacht werden. **Standard**.
- **VHD Set** = ein Koffer, den **mehrere VMs gleichzeitig** benutzen (für Cluster).

**Typen**:
- **Feste Größe** = ein Koffer, der **sofort** so groß ist, wie angegeben – auch wenn er leer ist. Braucht viel Platz, ist aber gleichmäßig schnell.
- **Dynamisch** = ein **Luftballon**: wächst mit dem Inhalt. Spart Platz – aber Vorsicht: Wenn viele Ballons gleichzeitig wachsen, **platzt** der Keller (Host-Platte voll) und die VMs bleiben stehen.
- **Differenzierend** = eine **Folie über einem Foto**: Das Original (Vorlage) bleibt unverändert, auf die Folie werden nur die **Änderungen** gemalt. Riesige Platzersparnis im Lab. Aber: Das Originalfoto darf **niemand anfassen**!

**Größer machen**: Erst den Koffer (VHDX) vergrößern, dann **im Windows der VM** das Laufwerk erweitern – sonst sieht man den neuen Platz nicht.

## Merksatz
- **VHD 2 TB**, **VHDX 64 TB** (+ Log, online Resize, 4K).
- **Fest – Dynamisch – Differenzierend**.
- **Gen 2 = nur SCSI**; SCSI erlaubt **Hot-Add**.
- Vergrößern: **Resize-VHD** + **im Gast Volume erweitern**.
- Azure-Upload: **VHD, feste Größe**.

## Prüfungsfalle
- Gen-1-VMs booten nur von IDE.
- Verkleinern geht nur, wenn im Gast vorher Platz freigegeben wurde.
- Eltern-Disk einer differenzierenden Disk verändert → Kette kaputt.
- Dynamische Disks können das Host-Volume überbuchen.
- VHDX lässt sich nicht direkt in Azure hochladen.

## Grafik
### Koffer, Ballon, Folie
Drei Symbole: fester Koffer (voller Platzbalken), Luftballon (wächst mit Daten, Warnung bei vollem Keller), Folie über Foto (Differenzierend, Schloss am Original).

### Resize in zwei Schritten
VHDX wird größer (grauer freier Bereich), dann schiebt der Gast sein Volume in den freien Bereich.

## Karteikarten
- F: Maximalgröße VHD und VHDX? | A: VHD 2 TB, VHDX 64 TB.
- F: Vorteile VHDX gegenüber VHD? | A: 64 TB, Schutz durch Metadaten-Log, 4K-Sektoren, Online-Größenänderung, TRIM.
- F: Drei Typen virtueller Festplatten? | A: Feste Größe, dynamisch erweiterbar, differenzierend.
- F: Welchen Controller nutzen Gen-2-VMs? | A: Ausschließlich SCSI.
- F: Wie vergrößert man ein Datenlaufwerk einer laufenden VM? | A: Resize-VHD (VHDX an SCSI), danach im Gast Volume erweitern.
- F: Welches Format akzeptiert Azure für Uploads? | A: VHD mit fester Größe.
- F: Wofür ist ein VHD Set (.vhds)? | A: Gemeinsame virtuelle Datenträger für Gastcluster.
- F: Cmdlet zum Neu-Verbinden einer differenzierenden Disk? | A: Set-VHD -ParentPath.
- F: Womit gibt man ungenutzten Platz einer dynamischen VHDX frei? | A: Optimize-VHD (Komprimieren).

## Quiz
? Eine VM braucht einen 10-TB-Datenträger. Welches Format?
* VHDX
- VHD
- VHD mit fester Größe
- ISO

? Eine VHDX wurde auf 200 GB erweitert, im Gast ist das Laufwerk aber weiterhin 100 GB groß. Was fehlt?
* Das Volume im Gast muss erweitert werden
- Die VM muss Gen 1 sein
- Die VHDX muss in VHD konvertiert werden
- Ein neuer Prüfpunkt

? Welcher Festplattentyp eignet sich für viele Lab-VMs auf Basis einer Vorlage?
* Differenzierend
- Feste Größe
- Pass-through
- VHD Set

? Welches Cmdlet konvertiert eine VHDX in eine VHD fester Größe?
* Convert-VHD
- Resize-VHD
- Optimize-VHD
- Merge-VHD

? Wodurch ist VHDX robuster gegenüber Stromausfällen?
* Durch ein Protokoll (Log) für Metadatenänderungen
- Durch eine Prüfsumme pro Datei im Gast
- Durch RAID 1 innerhalb der Datei
- Durch automatische Prüfpunkte
