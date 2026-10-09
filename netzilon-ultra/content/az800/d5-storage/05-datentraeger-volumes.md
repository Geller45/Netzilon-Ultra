---
id: az800-datentraeger
bereich: AZ-800
block: A7
kapitel: Storage & Dateidienste
titel: Datenträger und Volumes – MBR/GPT, Basis/dynamisch, Volumetypen, iSCSI
stufe: Grundlagen
quellen: [AZ-800 Study Guide, Microsoft Learn, ap1-Hardware-Unterlagen]
verweise: [ap1-a2-raid, ap1-a2-dateisysteme, az800-storage-spaces, az800-dateisysteme, az800-vhdx]
---

## Profi

### Partitionsstile
| | **MBR** (*Master Boot Record*) | **GPT** (*GUID-Partitionstabelle*) |
|---|---|---|
| Max. Datenträgergröße | **2 TB** | **18 EB** (praktisch unbegrenzt) |
| Partitionen | **4 primäre** (oder 3 + erweiterte mit logischen Laufwerken) | **128** (Windows) |
| Boot | BIOS/Legacy | **UEFI** (Pflicht für Secure Boot, Gen2-VMs) |
| Redundanz | keine | **Backup-Header** am Ende + CRC |
Umwandlung MBR → GPT: leerer Datenträger (`Initialize-Disk`/diskpart `convert gpt`) oder für Systemdatenträger verlustfrei mit **`mbr2gpt.exe`**.

### Basis- vs. dynamische Datenträger
| | **Basisdatenträger** (Standard) | **Dynamischer Datenträger** (veraltet) |
|---|---|---|
| Aufbau | Partitionen | **Volumes** mit LDM-Datenbank |
| Volumetypen | primär/logisch (einfach) | **einfach, übergreifend, Stripeset (RAID 0), gespiegelt (RAID 1), RAID-5** |
| Empfehlung | **Standard** | nur Legacy; Microsoft empfiehlt stattdessen **Speicherplätze** (*Storage Spaces*) |
Umwandlung Basis → dynamisch verlustfrei; zurück nur nach **Löschen aller Volumes**.

### Volumetypen (dynamisch) im Vergleich
| Typ | Datenträger | Ausfallsicher | Nutzbare Kapazität |
|---|---|---|---|
| **Einfach** | 1 | nein | 100 % |
| **Übergreifend** (*Spanned*) | 2–32 | nein (ein Ausfall = alles weg) | Summe |
| **Stripeset** (RAID 0) | 2–32 | nein | Summe, schneller |
| **Gespiegelt** (RAID 1) | 2 | ja | 50 % |
| **RAID-5** | ≥ 3 | ja (1 Datenträger) | (n − 1) / n |

### Volumes verwalten
- **Neuer Datenträger**: online schalten → **initialisieren** (GPT) → Partition/Volume → **formatieren** (NTFS/ReFS) → Laufwerksbuchstabe **oder Bereitstellungspunkt** (leerer NTFS-Ordner, z. B. `C:\Daten\SSD2`).
- **Erweitern** (*Extend*): nur mit **angrenzendem** freien Speicher auf Basisdatenträgern; NTFS und ReFS erweiterbar.
- **Verkleinern** (*Shrink*): nur **NTFS** (ReFS nicht), begrenzt durch nicht verschiebbare Dateien (Auslagerungsdatei, Schattenkopien).
- **Clustergröße** (Zuordnungseinheit): Standard NTFS 4 KB; für Hyper-V/SQL-Volumes oft **64 KB**.
- **VHD/VHDX** einbinden (`Mount-VHD`), per Datenträgerverwaltung erstellen.
- Werkzeuge: **Datenträgerverwaltung** (`diskmgmt.msc`), **Server-Manager → Datei-/Speicherdienste → Volumes/Datenträger**, **WAC → Speicher**, `diskpart`, Storage-Modul (`Get-Disk`, `Get-Partition`, `Get-Volume`).
- Dateisystemprüfung: `Repair-Volume -Scan/-SpotFix` (Online-Reparatur), `chkdsk`.

### iSCSI – Blockspeicher über Ethernet
| Rolle | Aufgabe |
|---|---|
| **iSCSI-Zielserver** (*Target*) | Rollendienst auf Windows Server; stellt **virtuelle Datenträger (VHDX)** als **LUNs** bereit |
| **iSCSI-Initiator** | integriert in Windows (`iscsicpl.exe`), verbindet sich mit dem Ziel |
- Port **TCP 3260**; Adressierung per **IQN** (`iqn.1991-05.com.microsoft:fs01-ziel01-target`).
- Zugriffssteuerung am Ziel über **Initiator-IDs** (IQN, IP, MAC, DNS-Name) + optional **CHAP** (Initiator authentifiziert sich) / **Reverse-CHAP** (gegenseitig).
- **MPIO** (Multipfad-E/A) für redundante Pfade (zwei NICs, zwei Subnetze).
- Einsatz: gemeinsamer Speicher für **Failovercluster** im Labor, Blockspeicher ohne SAN.
- Ein LUN darf **nicht gleichzeitig** von mehreren Nicht-Cluster-Servern genutzt werden (Dateisystembeschädigung).

## Lab
**Maschinen**: **FS01** (Windows Server, 3 zusätzliche leere Datenträger 20/20/20 GB), **ISCSI01** (iSCSI-Zielserver), **SRV01** (Initiator).

### GUI
1. **FS01**: `diskmgmt.msc` → Datenträger 1 **Online** → **Initialisieren** → **GPT**.
2. **FS01**: Datenträger 1 → **Neues einfaches Volume** → 10 GB → Laufwerk **E:** → NTFS, Bezeichnung „Daten“.
3. **FS01**: E: → **Volume erweitern** → +5 GB → E: → **Volume verkleinern** → −2 GB.
4. **FS01**: restlichen Speicher → neues Volume → **In folgendem leeren NTFS-Ordner bereitstellen** → `E:\Archiv` (Bereitstellungspunkt).
5. **FS01** (nur zum Verständnis): Datenträger 2 und 3 → **In dynamischen Datenträger konvertieren** → **Neues gespiegeltes Volume** → Hinweis: in der Praxis Speicherplätze nutzen.
6. **ISCSI01**: Server-Manager → Datei-/Speicherdienste → **iSCSI-Zielserver** installieren → iSCSI → **Neuer virtueller iSCSI-Datenträger** → `E:\iSCSI\LUN1.vhdx`, 30 GB, dynamisch → **Neues iSCSI-Ziel** `ziel01` → Initiator **SRV01** (IQN oder IP) → CHAP optional.
7. **SRV01**: `iscsicpl.exe` → Ziel `ISCSI01` → **Schnell verbinden** → Datenträgerverwaltung → neuer Datenträger online, initialisieren, formatieren.

### PowerShell
```powershell
# Auf FS01 – Datenträger initialisieren, partitionieren, formatieren
Get-Disk | Where-Object PartitionStyle -eq 'RAW'
Initialize-Disk -Number 1 -PartitionStyle GPT
New-Partition -DiskNumber 1 -Size 10GB -DriveLetter E | Format-Volume -FileSystem NTFS -NewFileSystemLabel "Daten" -AllocationUnitSize 65536
Resize-Partition -DriveLetter E -Size 15GB
Get-PartitionSupportedSize -DriveLetter E
$p = New-Partition -DiskNumber 1 -UseMaximumSize; Format-Volume -Partition $p -FileSystem NTFS
New-Item E:\Archiv -ItemType Directory
Add-PartitionAccessPath -DiskNumber 1 -PartitionNumber $p.PartitionNumber -AccessPath "E:\Archiv"
Get-Volume
Repair-Volume -DriveLetter E -Scan

# Systemdatenträger MBR -> GPT (verlustfrei, im Betriebssystem)
mbr2gpt /validate /allowFullOS
mbr2gpt /convert /allowFullOS

# Auf ISCSI01 – iSCSI-Ziel
Install-WindowsFeature FS-iSCSITarget-Server -IncludeManagementTools
New-IscsiVirtualDisk -Path E:\iSCSI\LUN1.vhdx -SizeBytes 30GB
New-IscsiServerTarget -TargetName ziel01 -InitiatorIds "IPAddress:192.168.10.25"
Add-IscsiVirtualDiskTargetMapping -TargetName ziel01 -Path E:\iSCSI\LUN1.vhdx
Get-IscsiServerTarget | Select-Object TargetName,TargetIqn,Status

# Auf SRV01 – Initiator
Set-Service MSiSCSI -StartupType Automatic; Start-Service MSiSCSI
New-IscsiTargetPortal -TargetPortalAddress ISCSI01.example.com
Get-IscsiTarget | Connect-IscsiTarget -IsPersistent $true
Get-Disk | Where-Object BusType -eq iSCSI
```

## Einfach

Eine neue Festplatte ist wie ein **leeres Grundstück**:
1. **Initialisieren** = das Grundstück ins **Grundbuch** eintragen. Moderne Art: **GPT** (riesige Grundstücke, bis zu 128 Häuser). Alte Art: **MBR** (max. 2 TB, nur 4 Häuser).
2. **Partition/Volume** = ein **Haus** darauf bauen.
3. **Formatieren** = die **Zimmer einrichten** (Dateisystem NTFS/ReFS).
4. **Laufwerksbuchstabe** = die **Hausnummer** (E:). Oder statt eigener Hausnummer ein **Anbau** an ein bestehendes Haus (**Bereitstellungspunkt**: die Platte erscheint als Ordner `E:\Archiv`).

**Basis vs. dynamisch**: Mit alten **dynamischen** Datenträgern konnte man Platten spiegeln oder zusammenlegen. Heute macht man das mit **Speicherplätzen** (nächste Seite) – dynamisch ist **veraltet**.

**Volumetypen**:
- **Übergreifend** = zwei Platten **hintereinander** – fällt eine aus, ist **alles** weg.
- **Stripeset** = zwei Platten **abwechselnd** beschreiben – **schnell**, aber auch alles weg bei Ausfall.
- **Gespiegelt** = zwei Platten mit **identischem** Inhalt – eine darf kaputtgehen.

**iSCSI** = eine **Festplatte über das Netzwerkkabel**. Der Server (Ziel) bietet eine Platte an, ein anderer Server (Initiator) steckt sie sich „virtuell“ ein und sieht sie wie eine lokale Platte.

## Merksatz
- **MBR** 2 TB / 4 primäre; **GPT** 128 Partitionen, **UEFI**.
- System-MBR → GPT verlustfrei mit **mbr2gpt**.
- **Dynamisch = veraltet** → Speicherplätze.
- **Verkleinern nur NTFS**.
- **Bereitstellungspunkt** = Volume als leerer NTFS-Ordner.
- iSCSI: **TCP 3260**, **IQN**, **CHAP**, **MPIO**.

## Prüfungsfalle
- 3-TB-Datenträger mit MBR → nur 2 TB nutzbar.
- ReFS-Volumes lassen sich nicht verkleinern.
- Dynamisch → Basis nur nach Löschen aller Volumes.
- Übergreifende Volumes und Stripesets sind nicht ausfallsicher.
- iSCSI-LUN gleichzeitig von zwei Nicht-Cluster-Servern nutzen → Datenbeschädigung.
- iSCSI-Ziel lässt nur zugelassene Initiator-IDs zu.

## Grafik
### Grundstück
Leeres Grundstück → Grundbuch (GPT) → Haus (Partition) → Zimmer eingerichtet (NTFS) → Hausnummer E:; daneben Anbau „E:\Archiv“.

### MBR vs. GPT
Kleines Grundstück mit Zaun bei 2 TB und nur 4 Häusern; riesiges GPT-Grundstück mit vielen Häusern und einem Ersatz-Grundbuch am Ende.

### Volumetypen
Zwei Platten: übergreifend (hintereinander), Stripe (abwechselnd A1 B1 A2 B2), Spiegel (identisch) – eine Platte fällt aus: nur beim Spiegel bleibt alles grün.

### Festplatte übers Kabel
ISCSI01 mit LUN-Paket; Kabel TCP 3260 zu SRV01; dort erscheint die Platte in der Datenträgerverwaltung.

## Karteikarten
- F: Maximale Datenträgergröße bei MBR? | A: 2 TB.
- F: Wie viele Partitionen unterstützt GPT unter Windows? | A: 128.
- F: Welcher Partitionsstil ist für UEFI-Boot nötig? | A: GPT.
- F: Werkzeug für verlustfreie MBR-zu-GPT-Umwandlung des Systemdatenträgers? | A: mbr2gpt.exe
- F: Welche Volumetypen bieten dynamische Datenträger? | A: Einfach, übergreifend, Stripeset, gespiegelt, RAID-5.
- F: Was empfiehlt Microsoft statt dynamischer Datenträger? | A: Speicherplätze (Storage Spaces).
- F: Welches Dateisystem lässt sich nicht verkleinern? | A: ReFS.
- F: Was ist ein Bereitstellungspunkt? | A: Volume, das in einen leeren NTFS-Ordner eingebunden ist.
- F: Standardport von iSCSI? | A: TCP 3260.
- F: Womit wird ein iSCSI-Ziel identifiziert? | A: IQN (iSCSI Qualified Name).
- F: Wozu MPIO bei iSCSI? | A: Redundante/mehrere Pfade zum Speicher.
- F: Cmdlet zum Initialisieren eines Datenträgers als GPT? | A: Initialize-Disk -PartitionStyle GPT

## Quiz
? Ein neuer 4-TB-Datenträger soll vollständig als ein Volume nutzbar sein. Welcher Partitionsstil?
* GPT
- MBR
- Dynamisch mit MBR
- Erweiterte Partition

? Der Systemdatenträger eines Servers soll ohne Datenverlust von MBR auf GPT umgestellt werden. Werkzeug?
* mbr2gpt.exe
- diskpart clean
- Initialize-Disk
- Convert-VHD

? Welcher dynamische Volumetyp verliert alle Daten, wenn ein Datenträger ausfällt, bietet aber die höchste Geschwindigkeit?
* Stripeset (RAID 0)
- Gespiegelt
- RAID-5
- Einfach

? Ein ReFS-Volume soll verkleinert werden. Was gilt?
* Nicht möglich, nur NTFS kann verkleinert werden
- Möglich mit Resize-Partition
- Nur mit Datenträgerverwaltung möglich
- Nur bei GPT möglich

? SRV01 soll einen Datenträger von ISCSI01 nutzen; nur SRV01 darf zugreifen. Wo wird das festgelegt?
* Initiator-IDs am iSCSI-Ziel (optional mit CHAP)
- NTFS-Berechtigungen auf der VHDX
- Freigabeberechtigungen
- MPIO-Richtlinie

? Welcher Partitionsstil ist für Datenträger größer als 2 TiB erforderlich?
* GPT
- MBR
- FAT32
- Dynamisch auf MBR
! MBR adressiert maximal 2 TiB.

? Welches Cmdlet initialisiert einen neuen Datenträger mit GPT?
* Initialize-Disk -PartitionStyle GPT
- New-Partition -GPT
- Format-Volume -GPT
- Set-Disk -Online
! Danach New-Partition und Format-Volume.

? Welche Rolle stellt in Windows Server iSCSI-Datenträger für andere Server bereit?
* iSCSI-Zielserver
- iSCSI-Initiator
- DFS-Namespace
- Speicherreplikat
! Der Initiator ist die Clientseite.
