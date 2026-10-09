---
id: server-speicher-storage-spaces
bereich: AP2
block: SP
kapitel: Speicher & SAN vertieft
titel: Storage Spaces – Speicherpool, virtuelle Datenträger, Resilienz, Tiering und S2D-Grundlagen
stufe: Fortgeschritten
fach: Windows Server / AZ-800
pruefungen: [AP2, AZ-800, Schule]
quellen: [SAN_Präsentation.pdf, Microsoft Learn – iSCSI/MPIO/Storage Spaces, SNIA-Grundlagen]
verweise: [az800-storage-spaces, az801-s2d, az800-datentraeger, server-speicher-raid, server-speicher-funktionen, az801-failover-cluster]
---

## Profi

### Idee
**Storage Spaces** (deutsch **Speicherplätze**) ist die **softwaredefinierte Speicherlösung** in Windows Server und Windows 11. Statt eines Hardware-RAID-Controllers fasst Windows einzelne Platten zu einem **Speicherpool** zusammen und schneidet daraus **virtuelle Datenträger** mit gewünschter **Resilienz** (Ausfallschutz). Drei Ebenen:

1. **Physische Datenträger** (*physical disks*): SATA, SAS, NVMe (am Desktop auch USB). Sie müssen **leer**, nicht partitioniert und **direkt** sichtbar sein (HBA statt RAID-Controller). `Get-PhysicalDisk -CanPool $true` zeigt geeignete Platten; alle noch nicht verwendeten Platten liegen im **Primordial Pool** (Ursprungspool).
2. **Speicherpool** (*storage pool*): Sammlung physischer Platten, erweiterbar durch Hinzufügen weiterer Platten.
3. **Virtueller Datenträger** (*virtual disk*, in der GUI „Speicherplatz“): logische Platte aus dem Pool mit festgelegter Resilienz und Bereitstellungsart. Darauf werden **Partitionen und Volumes** (NTFS oder ReFS) angelegt.

### Resilienztypen (eigenständiger Server)
| Resilienz | Entspricht etwa | Mindestplatten | Ausfalltoleranz | Effizienz | Einsatz |
|---|---|---|---|---|---|
| **Simple** | RAID 0 | 1 | **0** | 100 % | temporäre Daten, Scratch |
| **Mirror, 2-Wege** | RAID 1/10 | 2 | 1 Platte | 50 % | allgemeine Daten, VMs |
| **Mirror, 3-Wege** | dreifache Spiegelung | 5 | 2 Platten | 33 % | kritische Workloads |
| **Parity (einfach)** | RAID 5 | 3 | 1 Platte | bis (n − 1)/n | Archiv, sequenzielles Schreiben |
| **Parity (dual)** | RAID 6 | 7 | 2 Platten | bis (n − 2)/n | große Archive, Backups |

Wichtig: Storage Spaces arbeitet nicht mit ganzen Platten wie klassisches RAID, sondern verteilt **Slabs** (Stücke von 256 MB; bei S2D „Extents“ von 1 GB) über die Platten. Die Spaltenanzahl (*columns*) bestimmt, über wie viele Platten parallel geschrieben wird. Parity ist beim zufälligen Schreiben **langsam** – für VMs Mirror verwenden.

### Bereitstellung: Fixed oder Thin
- **Fixed** (fest): Der gesamte Platz wird sofort im Pool reserviert. Vorhersehbar, Voraussetzung für **Tiering**.
- **Thin** (dynamisch): Platz wird erst beim Schreiben belegt; der virtuelle Datenträger darf größer als der Pool sein (**Überbuchung**). Pool-Füllstand überwachen – ist der Pool voll, gehen virtuelle Datenträger offline bzw. in einen Fehlerzustand.

### Tiering (Speicherebenen)
Bei gemischten Medien (SSD + HDD) bildet man **Speicherebenen** (*storage tiers*): häufig genutzte Daten („heiß“) liegen auf der **SSD-Ebene**, selten genutzte („kalt“) auf der **HDD-Ebene**. Windows misst die Zugriffe und verschiebt Daten per geplanter Aufgabe (**Storage Tiers Optimization**, standardmäßig täglich nachts; manuell `Optimize-Volume -TierOptimize`). Zusätzlich gibt es einen **Write-Back-Cache** auf SSD (Standard 1 GB bei Ebenen). Tiering setzt **Fixed** voraus. Einzelne Dateien lassen sich mit `Set-FileStorageTier` an eine Ebene **anheften** (*pinning*).

### Wartung
- Platte hinzufügen: `Add-PhysicalDisk`, danach `Optimize-StoragePool` (verteilt Daten neu).
- Virtuellen Datenträger vergrößern: `Resize-VirtualDisk`, dann Partition vergrößern.
- Defekte Platte ersetzen: `Set-PhysicalDisk -Usage Retired` → neue Platte hinzufügen → `Repair-VirtualDisk` → `Remove-PhysicalDisk`.
- Zustand: `Get-StoragePool`, `Get-VirtualDisk` (HealthStatus, OperationalStatus), `Get-StorageJob` für laufende Reparaturen.

### Storage Spaces Direct (S2D) – Grundlagen
**S2D** erweitert Storage Spaces auf einen **Failover-Cluster**: Die **lokalen Platten** (DAS) aller Knoten werden über das Netzwerk (**Software Storage Bus**) zu **einem gemeinsamen Pool** – ein **hyperkonvergentes** System bzw. „Virtual SAN“.
- **Edition**: Windows Server **Datacenter** (bzw. Azure Local/Azure Stack HCI).
- **Knoten**: **mindestens 2, maximal 16** pro Cluster.
- **Platten**: lokal angeschlossen, **HBA im Durchreichmodus**, **kein** RAID-Controller; schnellste Medien (NVMe/SSD) werden automatisch zum **Cache**.
- **Netzwerk**: mindestens 10 GbE, empfohlen **RDMA** (RoCE oder iWARP) mit SMB Direct.
- **Volumes**: **CSV** mit **ReFS** (`CSVFS_ReFS`).
- **Resilienz nach Knotenzahl**: 2 Knoten → 2-Wege-Mirror (ab Server 2019 auch *nested resiliency*) plus **Zeuge** (Cloud-, Dateifreigabe- oder USB-Zeuge); 3 Knoten → **3-Wege-Mirror**; ab 4 Knoten auch **Dual Parity** bzw. **Mirror-accelerated Parity**.
- Aktivierung: `Test-Cluster` → `New-Cluster` → `Enable-ClusterStorageSpacesDirect` → `New-Volume`.

Probier es im **Speicher-Labor unter Werkzeuge** aus: Dort ziehst du Platten in einen Pool, wählst Resilienz und siehst, wie viel nutzbar bleibt und was beim Plattenausfall passiert.

## Einfach

Stell dir vor, du und deine Freunde habt viele **verschieden große Legokisten** (Festplatten). Statt jede Kiste einzeln zu benutzen, **kippt ihr alle Steine in einen großen Topf** – das ist der **Speicherpool**.

Aus dem Topf baut ihr jetzt **eigene Bauwerke** (die **virtuellen Datenträger**). Für jedes Bauwerk entscheidet ihr, wie sicher es sein soll:
- **Simple**: Ihr baut es **einmal**. Fällt ein Stein raus, ist es kaputt.
- **Mirror (Spiegel)**: Ihr baut es **zweimal** (oder sogar **dreimal**). Fällt eins um, steht das andere noch. Kostet aber doppelt (oder dreimal) so viele Steine.
- **Parity**: Ihr baut es einmal und schreibt dazu eine **Bauanleitung**, mit der man fehlende Teile nachbauen kann. Spart Steine, aber das Aufschreiben dauert.

**Thin** heißt: Ihr **versprecht** jemandem ein großes Bauwerk, nehmt aber erst Steine aus dem Topf, wenn wirklich gebaut wird. Praktisch – aber wenn alle gleichzeitig bauen wollen, ist der Topf plötzlich leer. **Fixed** heißt: Die Steine werden **sofort** beiseitegelegt.

**Tiering** ist wie ein **Schreibtisch und ein Keller**: Die Steine, die du ständig brauchst, liegen auf dem **Schreibtisch** (schnelle SSD), die anderen im **Keller** (langsame HDD). Jede Nacht räumt jemand um.

**S2D** heißt: Mehrere Kinder in **verschiedenen Häusern** werfen ihre Steine **über eine Seilbahn** (Netzwerk) in einen gemeinsamen Topf – auch wenn ein Haus mal zu ist, bleiben die Bauwerke stehen.

## Merksatz
- **Platten → Pool → virtueller Datenträger → Volume.**
- **Simple 1, Mirror 2 (3-Wege 5), Parity 3, Dual Parity 7 Platten.**
- **Mirror für VMs, Parity fürs Archiv.**
- **Tiering nur mit Fixed.**
- **Thin heißt überwachen.**
- **S2D: Datacenter, 2–16 Knoten, HBA statt RAID, CSVFS_ReFS.**

## Prüfungsfalle
- Platten mit Partitionen oder hinter einem **RAID-Controller** erscheinen nicht mit **CanPool = True**.
- **3-Wege-Mirror** braucht auf einem Einzelserver **mindestens 5 Platten**, **Dual Parity 7** – nicht 3 bzw. 4.
- **Simple** hat **keinen** Ausfallschutz, auch wenn mehrere Platten im Pool sind.
- **Thin Provisioning** kann den Pool überbuchen – läuft er voll, fallen Datenträger aus.
- Tiering funktioniert **nicht** mit Thin-Datenträgern.
- S2D läuft nur auf **Datacenter**, nicht auf Standard; ein **Zeuge** ist bei 2 Knoten Pflicht.
- Storage Spaces ersetzt **kein Backup**.

## Grafik
### Vom Pool zum Volume
1. FS01: Get-PhysicalDisk zeigt vier leere Platten mit CanPool True
2. FS01 -> Pool01: New-StoragePool fasst die Platten zusammen
3. Pool01 -> VD-Mirror: New-VirtualDisk mit 2-Wege-Mirror, Thin, 500 GB
4. VD-Mirror -> Volume D: Initialisieren, Partition und ReFS-Formatierung
5. Platte 2: fällt aus, VD-Mirror ist „Degraded“ und bleibt online
6. Admin -> Pool01: neue Platte hinzufügen, Repair-VirtualDisk stellt die Redundanz wieder her

### S2D mit drei Knoten
1. HV01, HV02, HV03: steuern je vier lokale NVMe/SSD-Laufwerke bei
2. Software Storage Bus: verbindet alle Laufwerke über RDMA zu einem Pool
3. Pool -> CSV01: New-Volume mit 3-Wege-Mirror und CSVFS_ReFS
4. HV02: fällt aus, Daten liegen noch auf HV01 und HV03
5. HV01: übernimmt die VMs von HV02 per Failover

## Lab
**Maschinen**: **FS01.example.com** (Windows Server 2025 als VM auf **HV01.example.com**, mit fünf zusätzlichen leeren VHDX à 50 GB: drei als „SSD“, zwei als „HDD“ markiert). Für S2D zusätzlich die Knoten **HV01**, **HV02** (nested, Datacenter) – nur lesend nachvollziehen. Schule: `exa.local`.

### GUI
1. **HV01**: Hyper-V-Manager → FS01 → Einstellungen → SCSI-Controller → 5 × neue VHDX (50 GB) → OK.
2. **FS01**: Server-Manager → Datei-/Speicherdienste → Volumes → **Speicherpools** → Primordial-Pool zeigt die fünf Platten.
3. **FS01**: Aufgaben → **Neuer Speicherpool** → Name `Pool01` → alle Platten wählen → Erstellen.
4. **FS01**: Rechtsklick auf Pool01 → **Neuer virtueller Datenträger** → Name `VD-Mirror` → Layout **Mirror** → Bereitstellung **Dünn (Thin)** → 200 GB → Assistent für neues Volume → Laufwerk D:, **ReFS**.
5. **FS01**: Zweiten Datenträger `VD-Parity` mit Layout **Parity**, **Fest** → 60 GB → Volume E:, NTFS.
6. **FS01**: Pool-Ansicht → Kapazität und belegten Platz vergleichen (Mirror belegt doppelt, Parity ca. (n − 1)/n).
7. **HV01**: Eine VHDX von FS01 im laufenden Betrieb entfernen → FS01: virtueller Datenträger zeigt **Warnung/Degraded**, Daten bleiben lesbar.
8. **HV01**: neue VHDX hinzufügen → **FS01**: Pool → **Physischen Datenträger hinzufügen** → virtuellen Datenträger **reparieren**.
9. Spiel verschiedene Resilienztypen im **Speicher-Labor unter Werkzeuge** durch.

### PowerShell
```powershell
# FS01: geeignete Platten und Pool
Get-PhysicalDisk -CanPool $true | Format-Table FriendlyName, Size, MediaType, CanPool
$disks = Get-PhysicalDisk -CanPool $true
New-StoragePool -FriendlyName Pool01 -StorageSubSystemFriendlyName "Windows Storage*" -PhysicalDisks $disks

# FS01: Medientyp setzen (in VMs nicht automatisch erkannt)
Get-PhysicalDisk | Where-Object Size -eq 50GB | Select-Object -First 3 | Set-PhysicalDisk -MediaType SSD
Get-PhysicalDisk -StoragePool (Get-StoragePool Pool01) | Where-Object MediaType -ne SSD | Set-PhysicalDisk -MediaType HDD

# FS01: 2-Wege-Mirror, Thin, und Volume
New-VirtualDisk -StoragePoolFriendlyName Pool01 -FriendlyName VD-Mirror -ResiliencySettingName Mirror -NumberOfDataCopies 2 -ProvisioningType Thin -Size 200GB
Get-VirtualDisk VD-Mirror | Get-Disk | Initialize-Disk -PartitionStyle GPT -PassThru |
  New-Partition -DriveLetter D -UseMaximumSize | Format-Volume -FileSystem ReFS -NewFileSystemLabel Mirror

# FS01: Volume mit Tiering (nur Fixed) in einem Schritt
$ssd = New-StorageTier -StoragePoolFriendlyName Pool01 -FriendlyName SSD-Tier -MediaType SSD -ResiliencySettingName Mirror
$hdd = New-StorageTier -StoragePoolFriendlyName Pool01 -FriendlyName HDD-Tier -MediaType HDD -ResiliencySettingName Mirror
New-Volume -StoragePoolFriendlyName Pool01 -FriendlyName VD-Tiered -StorageTiers $ssd, $hdd -StorageTierSizes 20GB, 40GB -FileSystem NTFS -DriveLetter T

# FS01: Zustand und Wartung
Get-VirtualDisk | Format-Table FriendlyName, ResiliencySettingName, ProvisioningType, HealthStatus, Size, FootprintOnPool
Get-StorageJob
Repair-VirtualDisk -FriendlyName VD-Mirror

# HV01/HV02 (Cluster, nur Datacenter): S2D aktivieren
Test-Cluster -Node HV01, HV02 -Include "Storage Spaces Direct", "Inventory", "Network", "System Configuration"
Enable-ClusterStorageSpacesDirect
New-Volume -StoragePoolFriendlyName "S2D*" -FriendlyName CSV01 -FileSystem CSVFS_ReFS -Size 1TB
```

## Legende
### Speicherpool
- Was: Sammlung physischer Platten, aus der virtuelle Datenträger erstellt werden.
- Wie: New-StoragePool mit Platten, die CanPool True melden.
- Wo: auf einem Einzelserver wie FS01 oder clusterweit bei S2D.
- Warum: flexible Kapazität ohne Hardware-RAID, später erweiterbar.
### Resilienz
- Was: Ausfallschutz eines virtuellen Datenträgers.
- Wie: Simple, Mirror (2- oder 3-Wege) oder Parity (einfach oder dual).
- Wann: bei der Erstellung des virtuellen Datenträgers festlegen.
- Warum: Abwägung zwischen Kapazität, Leistung und Ausfalltoleranz.
### Storage Spaces Direct
- Was: Storage Spaces über mehrere Cluster-Knoten mit lokalen Platten.
- Wie: Enable-ClusterStorageSpacesDirect im Failover-Cluster, Volumes als CSVFS_ReFS.
- Wo: auf 2 bis 16 Knoten mit Windows Server Datacenter.
- Warum: hyperkonvergenter Speicher ohne teures SAN.

## Karteikarten
- F: Welche drei Ebenen hat Storage Spaces? | A: Physische Datenträger → Speicherpool → virtueller Datenträger (darauf Volumes)
- F: Welches Cmdlet zeigt poolfähige Platten? | A: Get-PhysicalDisk -CanPool $true
- F: Was ist der Primordial Pool? | A: Ursprungspool mit allen noch nicht verwendeten, poolfähigen Platten
- F: Mindestplatten für 2-Wege- und 3-Wege-Mirror auf einem Einzelserver? | A: 2 bzw. 5 Platten
- F: Mindestplatten für Parity und Dual Parity auf einem Einzelserver? | A: 3 bzw. 7 Platten
- F: Welche Resilienz hat keine Ausfalltoleranz? | A: Simple
- F: Unterschied Fixed und Thin? | A: Fixed reserviert den Platz sofort, Thin belegt ihn erst beim Schreiben und erlaubt Überbuchung
- F: Welche Voraussetzung hat Tiering? | A: Fixed-Bereitstellung und Medien unterschiedlicher Typen (SSD und HDD)
- F: Wie verschiebt Windows Daten zwischen den Ebenen? | A: Geplante Aufgabe Storage Tiers Optimization bzw. Optimize-Volume -TierOptimize
- F: Wie viele Knoten unterstützt S2D? | A: Mindestens 2, höchstens 16 pro Cluster
- F: Welche Edition braucht S2D? | A: Windows Server Datacenter (bzw. Azure Local)
- F: Mit welchem Cmdlet aktiviert man S2D? | A: Enable-ClusterStorageSpacesDirect
- F: Wie erstellt man einen 2-Wege-Mirror per PowerShell? | A: New-VirtualDisk -StoragePoolFriendlyName Pool01 -ResiliencySettingName Mirror -NumberOfDataCopies 2 -Size 200GB

## Quiz
? Welches Cmdlet zeigt Platten, die zu einem Pool hinzugefügt werden können?
* Get-PhysicalDisk -CanPool $true
- Get-Disk -IsPoolable
- Get-Volume -Free
- Get-StoragePool -Primordial -Add
! CanPool True bedeutet: leer, nicht partitioniert, direkt erreichbar.

? Welche Resilienz entspricht etwa einem RAID 6?
* Dual Parity
- Simple
- 2-Wege-Mirror
- Single Parity
! Dual Parity übersteht zwei Plattenausfälle.

? Wie viele Platten braucht ein 3-Wege-Mirror auf einem eigenständigen Server mindestens?
* 5
- 3
- 2
- 7
! Für Einzelserver nennt Microsoft 5 Platten für den 3-Wege-Mirror und 7 für Dual Parity.

? Welche Resilienz sollte man für VM-Festplatten wählen?
* Mirror
- Simple
- Parity
- Dual Parity mit Thin
! Parity ist bei zufälligen Schreibzugriffen langsam; Mirror bietet Leistung und Schutz.

? Was ist bei Thin Provisioning zu beachten?
* Der Pool kann überbucht werden und muss überwacht werden
- Die Größe des Datenträgers kann nie mehr erweitert werden
- Thin Provisioning ist Voraussetzung für Speicherebenen (Tiering)
- Thin bietet automatisch eine Spiegelung auf zwei Platten
! Läuft der Pool voll, fallen die virtuellen Datenträger aus.

? Welche Voraussetzung gilt für Speicherebenen (Tiering)?
* Feste Bereitstellung (Fixed)
- Thin Provisioning
- Nur HDDs gleicher Größe
- Ein Hardware-RAID-Controller
! Tiering funktioniert nur mit Fixed und gemischten Medien (SSD/HDD).

? Warum erscheint eine Platte hinter einem RAID-Controller oft nicht als poolfähig?
* Storage Spaces braucht direkten Zugriff auf jede Platte (HBA)
- Storage Spaces unterstützt grundsätzlich keine SAS-Platten
- RAID-Controller werden von Windows Server nicht unterstützt
- Die Platte muss zuerst mit NTFS formatiert werden
! RAID-Controller verbergen die einzelnen Platten; nötig ist ein HBA im Durchreichmodus (Pass-Through).

? Wie viele Knoten darf ein S2D-Cluster höchstens haben?
* 16
- 4
- 8
- 64
! S2D unterstützt 2 bis 16 Knoten pro Cluster.

? Welche Windows-Server-Edition ist für S2D erforderlich?
* Datacenter
- Standard
- Essentials
- Jede Edition
! S2D gehört zum Funktionsumfang von Datacenter.

? Welches Dateisystem wird für S2D-Volumes empfohlen?
* CSVFS_ReFS
- FAT32
- exFAT
- NTFS ohne CSV
! S2D-Volumes sind Cluster Shared Volumes mit ReFS.

? Was ist bei einem S2D-Cluster mit zwei Knoten zwingend?
* Ein Zeuge (z. B. Cloud- oder Dateifreigabezeuge)
- Ein Hardware-RAID-Controller pro Knoten
- Ein Fibre-Channel-SAN
- Dual Parity
! Ohne Zeuge verliert der Cluster beim Ausfall eines Knotens das Quorum.

? Welche Reihenfolge ist beim Ersetzen einer defekten Platte richtig?
* Retired setzen, neue Platte hinzufügen, Repair-VirtualDisk, alte entfernen
- Alte Platte entfernen, Pool löschen, Pool und Datenträger neu anlegen
- Format-Volume ausführen, dann Add-PhysicalDisk und Optimize-StoragePool
- Optimize-Volume ausführen, dann Remove-StoragePool und neu erstellen
! So bleibt die Redundanz während des Tauschs erhalten.

? Was bewirkt Optimize-StoragePool nach dem Hinzufügen neuer Platten?
* Es verteilt die Daten gleichmäßig auf alle Platten
- Es löscht den Primordial Pool und legt ihn neu an
- Es wandelt gespiegelte Datenträger in Parität um
- Es aktiviert Storage Spaces Direct auf dem Server
! Ohne Neuverteilung würden neue Platten erst nach und nach genutzt.

## Lücken
- Ein virtueller Datenträger mit der Resilienz {Simple} hat keine Ausfalltoleranz.
- Für Tiering muss die Bereitstellung {Fixed|fest} sein.
- S2D wird mit dem Cmdlet {Enable-ClusterStorageSpacesDirect} aktiviert und braucht mindestens {2} Knoten.

## Zuordnen
### Resilienz und Mindestplatten (Einzelserver)
- Simple => 1 Platte
- 2-Wege-Mirror => 2 Platten
- Parity => 3 Platten
- 3-Wege-Mirror => 5 Platten
- Dual Parity => 7 Platten

## Reihenfolge
### Gespiegeltes Volume mit Storage Spaces auf FS01
1. Leere Platten an FS01 anschließen
2. Poolfähige Platten mit Get-PhysicalDisk -CanPool prüfen
3. Speicherpool mit New-StoragePool anlegen
4. Virtuellen Datenträger mit Mirror-Resilienz erstellen
5. Datenträger initialisieren (GPT)
6. Partition anlegen und mit ReFS formatieren

## Freitext
- F: Vergleichen Sie Mirror- und Parity-Resilienz in Storage Spaces hinsichtlich Kapazität, Leistung und Einsatzzweck. | M: Mirror speichert 2 bzw. 3 Kopien (50 % bzw. 33 % Effizienz), bietet hohe Leistung auch bei zufälligen Schreibzugriffen und eignet sich für VMs und Datenbanken. Parity speichert Paritätsinformationen (Effizienz bis (n − 1)/n bzw. (n − 2)/n), spart Kapazität, ist aber beim Schreiben langsamer und eignet sich für Archive und sequenzielle Daten. | P: 6

## Szenario
### Speicher für FS01 bei der Firma Lorenz
Die Firma Lorenz hat auf FS01.example.com zwei 1,92-TB-SSDs und vier 8-TB-HDDs an einem HBA. Benötigt werden ein schnelles Volume für Projektdaten mit häufigem Zugriff und ein großes Archiv. Der Praktikant hat bereits versucht, ein Volume mit Tiering und Thin Provisioning anzulegen – ohne Erfolg. Zwei HDDs zeigen außerdem CanPool False.
- F: Warum schlug das Tiering-Volume fehl? | A: Tiering erfordert Fixed-Bereitstellung, Thin ist nicht möglich | P: 2
- F: Welche Gründe kann CanPool False haben? | A: Die Platten haben noch Partitionen/Daten, sind bereits in einem Pool oder hängen hinter einem RAID-Controller; mit Clear-Disk leeren bzw. HBA-Modus prüfen | P: 3
- F: Welche Resilienz empfehlen Sie für Projektdaten und Archiv? | A: Projektdaten: Mirror mit SSD- und HDD-Ebene (Tiering, Fixed); Archiv: Parity auf HDDs für bessere Kapazitätsausnutzung | P: 3
- F: Wie stellen Sie nach einem Plattenausfall die Redundanz wieder her? | A: Defekte Platte als Retired markieren, neue Platte hinzufügen (Add-PhysicalDisk), Repair-VirtualDisk, Fortschritt mit Get-StorageJob prüfen, alte Platte mit Remove-PhysicalDisk entfernen | P: 2
