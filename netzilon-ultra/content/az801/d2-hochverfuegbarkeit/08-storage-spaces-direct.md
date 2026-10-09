---
id: az801-s2d
bereich: AZ-801
block: A9
kapitel: Hochverfügbarkeit
titel: Storage Spaces Direct (S2D)
stufe: Profi
quellen: [AZ-801 Study Guide, Microsoft Learn]
verweise: [az801-failover-cluster, az801-cluster-storage-quorum, az801-cluster-sets-sofs, az800-storage-spaces, az800-dateisysteme]
---

## Profi

### Zweck
**Storage Spaces Direct** (**S2D**) **fasst die lokalen Datenträger** **aller Clusterknoten** **zu einem gemeinsamen, ausfallsicheren Speicherpool** **zusammen**. **Kein SAN nötig**, **Software-Defined Storage**.

### Voraussetzungen
| Punkt | Details |
|---|---|
| **Edition** | **Windows Server Datacenter** (**oder Azure Stack HCI**) |
| **Knoten** | **2 bis 16**, **identische Hardware** empfohlen |
| **Datenträger** | **NVMe, SSD, HDD**, **direkt angebunden** (**SAS/SATA/NVMe**), **keine RAID-Controller** (**nur HBA/Pass-through**) |
| **Netzwerk** | **Mindestens 10 GbE**, **RDMA** (**iWARP oder RoCE**) **empfohlen** (**Pflicht ab 4 Knoten** **für gute Leistung**) |
| **Domäne** | **AD-Mitglied** |
| **Cluster** | **Failover-Cluster** **ohne Speicher** (`-NoStorage`) |
| **Witness** | **Cloud/File Share** (**bei 2 Knoten Pflicht**) |
| **Firmware** | **UEFI**, **TPM** **(optional)** |

### Laufwerkstypen und Cache
| Konfiguration | Cache | Kapazität |
|---|---|---|
| **NVMe + HDD** | **NVMe (Cache)** | **HDD** |
| **SSD + HDD** | **SSD (Cache)** | **HDD** |
| **NVMe + SSD** | **NVMe (Cache)** | **SSD** |
| **All-Flash** (**nur NVMe** **oder** **nur SSD**) | **Kein Cache** **(optional)** | **Alle Laufwerke** |

- **Cache-Laufwerke** **werden** **automatisch** **an Kapazitätslaufwerke** **gebunden**.
- **Cache** **Lese-/Schreib-Cache** **(bei SSD)** **oder** **nur Schreib-Cache** **(bei NVMe vor SSD)**.
- **Empfehlung**: **2+ Cache-Laufwerke** **je Knoten**, **Verhältnis** **z. B. 1:4** **bis 1:6**.

### Architektur
| Schicht | Aufgabe |
|---|---|
| **Physische Datenträger** | **Lokal** **in Knoten** |
| **Software Storage Bus** | **SMB 3** **über Netzwerk** **(alle Knoten sehen alle Datenträger)** |
| **Speicherpool** | **Ein Pool** **pro Cluster** (`S2D on <Cluster>`) |
| **Speicherplätze (Spaces/Volumes)** | **Virtuelle Datenträger** **mit Resilienz** |
| **CSV (ReFS)** | **Clusterfreigabe** **`C:\ClusterStorage\VolumeX`** |
| **Health Service** | **Überwachung**, **Warnungen**, **automatische Reparatur** |

### Resilienzarten
| Resilienz | Knoten | Toleranz | Effizienz | Hinweis |
|---|---|---|---|---|
| **Zwei-Wege-Spiegelung** (*Two-way mirror*) | **2+** | **1 Ausfall** | **50 %** | **Standard bei 2 Knoten** |
| **Drei-Wege-Spiegelung** (*Three-way mirror*) | **3+** | **2 Ausfälle** | **33 %** | **Beste Leistung**, **Standard ab 3 Knoten** |
| **Duale Parität** (*Dual parity*) | **4+** | **2 Ausfälle** | **50–80 %** | **Platzsparend**, **langsamer schreibend** |
| **Spiegelbeschleunigte Parität** (*Mirror-accelerated parity*) | **4+** | **2 Ausfälle** | **~50 %** | **Heiße Daten gespiegelt**, **kalte Daten Parität** |
| **Geschachtelte Resilienz** (*Nested resiliency*) | **2** | **2 Ausfälle** (**Knoten + Laufwerk**) | **25–40 %** | **Server 2019+**, **nur 2-Knoten** |

### Volumes anlegen
```powershell
# Auf NODE01 – Vorbereitung
Test-Cluster -Node NODE01, NODE02, NODE03, NODE04 -Include "Storage Spaces Direct","Inventory","Network","System Configuration"
New-Cluster -Name CLU-S2D -Node NODE01, NODE02, NODE03, NODE04 -NoStorage -StaticAddress 192.168.10.70
Set-ClusterQuorum -CloudWitness -AccountName "stclusterwit01" -AccessKey "<Schlüssel>"

# S2D aktivieren (erstellt Pool, Cache, Tiers)
Enable-ClusterStorageSpacesDirect -Confirm:$false

# Volumes
New-Volume -FriendlyName "Vol1" -FileSystem CSVFS_ReFS -StoragePoolFriendlyName "S2D*" -Size 1TB -ResiliencySettingName Mirror
New-Volume -FriendlyName "Archiv" -FileSystem CSVFS_ReFS -StoragePoolFriendlyName "S2D*" -Size 4TB -ResiliencySettingName Parity
New-Volume -FriendlyName "Mixed" -FileSystem CSVFS_ReFS -StoragePoolFriendlyName "S2D*" -StorageTierFriendlyNames Performance, Capacity -StorageTierSizes 200GB, 800GB

# Status
Get-StoragePool -IsPrimordial $false
Get-PhysicalDisk | Select-Object FriendlyName, MediaType, Usage, HealthStatus, Size
Get-VirtualDisk | Select-Object FriendlyName, ResiliencySettingName, HealthStatus, OperationalStatus
Get-StorageSubSystem Cluster* | Get-StorageHealthReport
Get-StorageJob
```

### Bereitstellungsmodelle
| Modell | Beschreibung |
|---|---|
| **Hyperkonvergent** | **Hyper-V-VMs** **laufen** **auf denselben Knoten**, **die Speicher liefern** (**kompakt**, **Branch Office**) |
| **Konvergent / disaggregiert** | **S2D-Cluster** **als SOFS** **(Speicher)** **und** **getrennter Hyper-V-Cluster** **(Compute)** |

### Reservekapazität
- **Empfehlung**: **Kapazität** **eines Laufwerks** **pro Knoten** **(bis 4 Laufwerke)** **frei lassen**.
- **Zweck**: **Automatischer Wiederaufbau** **(Repair)** **nach Laufwerkausfall** **ohne Ersatz**.
- **Ohne Reserve**: **Repair** **erst nach Ersatz des Laufwerks**.

### Wartung und Austausch
| Aufgabe | Vorgehen |
|---|---|
| **Knoten warten** | `Suspend-ClusterNode -Drain` → **Storage-Wartungsmodus** **(`Enable-StorageMaintenanceMode`)** → **Wartung** → **Modus beenden** → `Resume-ClusterNode` |
| **Nächsten Knoten** | **Erst nach** **Ende** **aller Storage-Jobs** (`Get-StorageJob`) |
| **Laufwerk defekt** | **Alt-Laufwerk** **entfernen**, **neues einbauen**, **Pool** **erkennt** **automatisch** (**Retire/Remove** **falls nötig**) |
| **Reparatur** | `Repair-VirtualDisk`, `Repair-ClusterStorageSpacesDirect` |
| **Kapazität erweitern** | **Laufwerke/Knoten** **hinzufügen**, **Pool** **wächst** **automatisch** |

### Nachteile / Grenzen
- **Nur Datacenter** **(Server)**.
- **Hardware** **muss** **zertifiziert** **sein** **(Windows Server Catalog: „Software-Defined Data Center“)**.
- **Kein RAID-Controller**.
- **Nur ReFS** **empfohlen**, **NTFS** **möglich**, **Dedup** **nur auf** **ReFS** **(2019+)** **und NTFS**.
- **Netzwerk** **ist Rückgrat** **(Latenz/Bandbreite)**.

### Vergleich: S2D vs. Storage Spaces vs. Storage Replica
| Merkmal | **S2D** | **Storage Spaces** | **Storage Replica** |
|---|---|---|---|
| **Umfang** | **Cluster, mehrere Knoten** | **Einzelner Server** | **Replikation Volume A → B** |
| **Zweck** | **Hochverfügbarer Speicher** | **Pool/Resilienz lokal** | **Disaster Recovery** |
| **Ausfallschutz** | **Knoten- und Laufwerksausfall** | **Nur Laufwerksausfall** | **Standort-/Servertod** |

## Lab
**Maschinen**: **DC01**, **NODE01**–**NODE04** **(Hyper-V Gen 2 VMs, geschachtelte Virtualisierung**, **je 1 OS-Disk + 4 × 100 GB Daten-VHDX**, **2 NICs**), **Server 2022 Datacenter**.

### GUI
1. **NODE01–NODE04**: **Feature „Failover-Clustering“** **installieren**.
2. **NODE01**: **Failovercluster-Manager → Konfiguration überprüfen → Storage Spaces Direct** **Test** **wählen** **(Alle Tests)**.
3. **NODE01**: **Cluster erstellen → CLU-S2D** → **Häkchen** **„Alle geeigneten Speicher hinzufügen“** **abwählen**.
4. **NODE01**: **Cluster → Eigenschaften → Speicherplätze direkt aktivieren** **(oder Windows Admin Center → Cluster → Storage Spaces Direct aktivieren)**.
5. **NODE01**: **Speicher → Pools → „S2D on CLU-S2D“** **prüfen**.
6. **NODE01**: **Pool → Rechtsklick → Neuer virtueller Datenträger** → **Name Vol1**, **Größe 500 GB**, **Layout Spiegel** → **Volume erstellen (ReFS)**.
7. **NODE01**: **Datenträger → Vol1 → Zu Clusterfreigabevolumes hinzufügen**.
8. **NODE04**: **Herunterfahren** → **Vol1** **bleibt online** **(Warnung Pool)**; **hochfahren** → **Storage-Job Reparatur** **beobachten** **(`Get-StorageJob`)**.

### PowerShell
```powershell
# Auf NODE01
Install-WindowsFeature Failover-Clustering -IncludeManagementTools   # auf allen Knoten
Test-Cluster -Node NODE01,NODE02,NODE03,NODE04 -Include "Storage Spaces Direct","Inventory","Network","System Configuration"
New-Cluster -Name CLU-S2D -Node NODE01,NODE02,NODE03,NODE04 -NoStorage -StaticAddress 192.168.10.70
Enable-ClusterStorageSpacesDirect -Confirm:$false
New-Volume -FriendlyName Vol1 -FileSystem CSVFS_ReFS -StoragePoolFriendlyName "S2D*" -Size 500GB -ResiliencySettingName Mirror
Get-StoragePool "S2D*" | Get-PhysicalDisk
Get-StorageJob
```

## Einfach

Stell dir **vier Freunde** vor, **jeder hat einen kleinen Schrank mit Spielzeug**. **Bei S2D werfen alle ihre Schränke zusammen** **zu einem riesigen Spielzeuglager**. **Jedes Spielzeug wird zusätzlich bei anderen Freunden aufbewahrt** (**Spiegelung**). **Geht bei einem Freund ein Schrank kaputt**, **ist nichts verloren**.

**Zwei-Wege-Spiegel** = **jedes Spielzeug 2-mal** (**hält einen Ausfall**). **Drei-Wege-Spiegel** = **3-mal** (**hält zwei Ausfälle**, **kostet aber mehr Platz**). **Parität** = **Rechentrick**, **spart Platz**, **braucht aber mehr Rechenzeit**.

**Schnelle Schränke** (**NVMe/SSD**) **arbeiten wie eine Schnell-Ablage vorne**, **große langsame Schränke** (**HDD**) **halten die Masse**.

## Merksatz
- **S2D** = **lokale Platten aller Knoten → ein Pool**.
- **Datacenter**, **2–16 Knoten**, **10 GbE + RDMA**.
- **2 Knoten** = **2-Wege**, **3+** = **3-Wege**, **4+** = **Parität**.
- **Reserve** = **1 Laufwerk pro Knoten** **frei**.
- **`Enable-ClusterStorageSpacesDirect`** = **Startknopf**.
- **Nach Wartung**: **Storage-Jobs abwarten**.

## Prüfungsfalle
- **Cluster** **mit `-NoStorage`** **anlegen**, **sonst** **greifen** **Datenträger** **falsch**.
- **RAID-Controller** **nicht erlaubt** **(HBA nötig)**.
- **Standard Edition** **unterstützt kein S2D**.
- **2 Knoten** **brauchen Witness**.
- **Dual Parity** **erst ab 4 Knoten**.
- **Nested Resiliency** **nur bei 2 Knoten**.
- **Nächsten Knoten** **erst patchen**, **wenn** **Storage-Jobs fertig**.
- **S2D** **≠** **Storage Replica**: **S2D** **hält** **im Cluster**, **SR** **repliziert** **zwischen** **Clustern/Servern**.
- **Cache-Laufwerke** **zählen nicht** **zur Kapazität**.
- **ReFS** **empfohlen** **(schnelle VHDX-Vorgänge)**.

## Grafik
### Schränke zusammenwerfen
Vier Schränke verschmelzen zu einem Lager; Spielzeug erscheint dreifach verteilt.

### Ausfall-Test
Ein Schrank fällt um, Kopien springen ein, Balken „Reparatur“ läuft.

### Cache-Schicht
Schneller Tresen vorne, große Regale dahinter.

## Karteikarten
- F: Was ist S2D? | A: Software-Defined Storage, der lokale Datenträger mehrerer Knoten zu einem Pool bündelt.
- F: Welche Edition ist nötig? | A: Datacenter.
- F: Wie viele Knoten sind möglich? | A: 2 bis 16.
- F: Welches Netzwerk wird empfohlen? | A: 10 GbE oder schneller mit RDMA.
- F: Welche Resilienz bei 2 Knoten? | A: Zwei-Wege-Spiegelung.
- F: Welche Resilienz toleriert zwei Ausfälle bei 3 Knoten? | A: Drei-Wege-Spiegelung.
- F: Ab wie vielen Knoten gibt es Parität? | A: 4.
- F: Welches Cmdlet aktiviert S2D? | A: Enable-ClusterStorageSpacesDirect.
- F: Welches Dateisystem wird empfohlen? | A: ReFS (CSVFS_ReFS).
- F: Was ist Reservekapazität? | A: Freier Platz für automatischen Wiederaufbau (1 Laufwerk je Knoten, bis 4).
- F: Warum -NoStorage? | A: Damit der Cluster nicht automatisch Datenträger einbindet.
- F: Was ist hyperkonvergent? | A: Compute und Storage auf denselben Knoten.

## Quiz
? Wie viele Ausfälle verkraftet eine Drei-Wege-Spiegelung?
* Zwei
- Einen
- Drei
- Keinen

? Welche Voraussetzung gilt für S2D-Hardware?
* Datenträger direkt angebunden ohne RAID-Controller
- Nur Fibre-Channel-SAN
- Nur HDD
- Nur ein Knoten

? Wie aktiviert man S2D auf einem Cluster ohne Speicher?
* Enable-ClusterStorageSpacesDirect
- New-StoragePool -Direct
- Add-ClusterDisk
- Set-ClusterQuorum

? Welche Edition ist für S2D erforderlich?
* Datacenter
- Standard
- Essentials
- Core

? Welche Resilienz eignet sich bei 2 Knoten für zwei gleichzeitige Ausfälle?
* Geschachtelte Resilienz (Nested Resiliency)
- Duale Parität
- Einfache Parität
- Keine Resilienz

? Was tun, bevor der nächste Knoten gepatcht wird?
* Storage-Jobs (Resync) abwarten
- Quorum löschen
- Cache-Laufwerke entfernen
- CNO neu anlegen

? Wie viele Knoten unterstützt ein S2D-Cluster höchstens?
* 16
- 4
- 64
- 2
! Mindestens 2 Knoten (mit Witness).

? Welche Netzwerkanforderung gilt für S2D empfohlen?
* Mindestens 10 Gbit/s, bevorzugt mit RDMA (iWARP oder RoCE)
- 100 Mbit/s genügen
- WLAN zwischen den Knoten
- Nur USB-Verbindungen
! Der Ost-West-Speicherverkehr läuft über SMB 3 mit SMB Direct.
