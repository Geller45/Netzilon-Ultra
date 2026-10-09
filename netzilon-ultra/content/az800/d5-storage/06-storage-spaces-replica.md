---
id: az800-storage-spaces
bereich: AZ-800
block: A7
kapitel: Storage & Dateidienste
titel: Speicherplätze (Storage Spaces) und Speicherreplikat (Storage Replica)
stufe: Fortgeschritten
quellen: [AZ-800 Study Guide, Microsoft Learn, Speicher-/Dateidienste-Unterlagen]
verweise: [az800-datentraeger, ap1-a2-raid, az800-dateisysteme, az800-dedup, az800-dfs]
---

## Profi

### Speicherplätze (*Storage Spaces*) – Aufbau
**Software-definierter Speicher** in Windows Server: physische Datenträger werden zu **Pools** zusammengefasst, daraus entstehen **virtuelle Datenträger** mit wählbarer Ausfallsicherheit.
| Ebene | Beschreibung |
|---|---|
| **Physische Datenträger** | SATA/SAS/NVMe, USB (nur Test), **nicht** RAID-Controller-Volumes (HBA im Passthrough-Modus), unpartitioniert, ≥ 4 GB |
| **Speicherpool** (*Storage Pool*) | Sammlung physischer Datenträger; primordialer Pool = alle verfügbaren, noch nicht zugeordneten Datenträger |
| **Virtueller Datenträger** (*Storage Space*) | aus dem Pool angelegt; Layout + Bereitstellungstyp |
| **Volume** | auf dem virtuellen Datenträger, NTFS oder ReFS |

### Layouts (Resilienz)
| Layout | Prinzip | Mindestanzahl Datenträger | Toleriert Ausfälle | Effizienz |
|---|---|---|---|---|
| **Einfach** (*Simple*) | Striping, keine Redundanz | 1 | 0 | 100 % |
| **Zwei-Wege-Spiegel** | 2 Kopien | 2 | 1 | 50 % |
| **Drei-Wege-Spiegel** | 3 Kopien | 5 | 2 | 33 % |
| **Parität** (*Single Parity*) | Parität wie RAID 5 | 3 | 1 | 67–90 % (schlechtere Schreibleistung) |
| **Duale Parität** | wie RAID 6 | 7 | 2 | höher |
Spiegel → **Leistung** (VMs, Datenbanken); Parität → **Kapazität** (Archiv, Backup).

### Bereitstellung, Tiering, Hot Spare
- **Feste** (*Fixed*) vs. **Dünne** Bereitstellung (*Thin Provisioning*: Größe größer als physisch vorhanden, Speicher wird bei Bedarf belegt; Pool-Auslastung überwachen!).
- **Speicherebenen** (*Storage Tiers*): **SSD-Ebene + HDD-Ebene** in einem virtuellen Datenträger; häufig genutzte Daten wandern automatisch auf SSD (Optimierung nächtlich per geplanter Aufgabe), **Rückschreibcache** (*Write-back Cache*, Standard 1 GB). Nur **feste** Bereitstellung.
- **Hot Spare**: Datenträger mit Nutzung **Hotspare**, springt bei Ausfall ein; Alternativ **Neuerstellung im Pool** (*Retire* + Repair) über freien Speicher.
- **Enclosure Awareness**: Kopien auf verschiedene JBOD-Gehäuse verteilen.

### Wartung
- Ausgefallener Datenträger: Status **Warnung/Fehlerhaft** → Datenträger als **Ausgemustert** (*Retired*) markieren → neuen hinzufügen → `Repair-VirtualDisk` → alten entfernen.
- Pool erweitern: Datenträger hinzufügen; bei Spiegeln Anzahl **Spalten** (*Columns*) beachten (Erweiterung erfordert Vielfaches der Spaltenanzahl × Kopien).
- **Storage Spaces Direct (S2D)**: lokale Datenträger **mehrerer Clusterknoten** zu einem Pool (Hyperconverged) → AZ-801 Hochverfügbarkeit.

### Speicherreplikat (*Storage Replica*)
**Blockbasierte** Replikation von **Volumes** zwischen Servern oder Clustern (Notfallwiederherstellung, Stretch-Cluster).
| Merkmal | Details |
|---|---|
| Modi | **Synchron** (Schreibvorgang erst bestätigt, wenn auf **beiden** Seiten geschrieben → **kein Datenverlust**, RPO = 0; Latenz ≤ **5 ms** Round-Trip empfohlen) und **Asynchron** (lokal bestätigt, dann repliziert → Weitverkehr, geringer Datenverlust möglich) |
| Szenarien | **Server-zu-Server**, **Cluster-zu-Cluster**, **Stretch-Cluster** (ein Cluster über zwei Standorte) |
| Voraussetzungen | **Datacenter**-Edition (**Standard**: max. **1 Partnerschaft**, **1 Volume**, **≤ 2 TB**), GPT, **Daten- und Protokollvolume** auf beiden Seiten **gleich groß** (Log ≥ 9 GB empfohlen, SSD), Active Directory, SMB 3 (TCP 445) + WS-MAN (5985) + ICMP |
| Zielvolume | während der Replikation **nicht bereitgestellt/nicht zugreifbar** (Dismounted) |
| Richtung umkehren | `Set-SRPartnership` (geplanter Failover) |
| Test | `Test-SRTopology` erzeugt Bericht (Latenz, Durchsatz, Eignung) |
| Unterschied DFS-R | Storage Replica = **Block-Ebene**, **eine Richtung**, auch geöffnete Dateien, Ziel nicht nutzbar; DFS-R = **Datei-Ebene**, Multimaster, beide Seiten nutzbar |
| Azure | Replikation zu einer Azure-VM (asynchron) möglich |

## Lab
**Maschinen**: **FS01** (4 leere Datenträger à 50 GB + 1 à 50 GB als Hot Spare), **SR01** und **SR02** (je 2 zusätzliche Datenträger: Daten 40 GB, Log 10 GB, Windows Server 2022 Datacenter, Domäne example.com).

### GUI
1. **FS01**: Server-Manager → Datei-/Speicherdienste → **Speicherpools** → Primordial → **Neuer Speicherpool** → `Pool1` → 4 Datenträger **Automatisch**, 1 Datenträger **Hotspare**.
2. **FS01**: Pool1 → **Neuer virtueller Datenträger** → `VD-Spiegel` → Speicherlayout **Spiegel** → Resilienz **Zwei-Wege-Spiegel** → **Dünn** → 150 GB → Assistent **Neues Volume** → F:, ReFS.
3. **FS01**: zweiten virtuellen Datenträger `VD-Paritaet` → **Parität** → **Fest** → 60 GB → G:, NTFS.
4. **FS01** (Hyper-V): einen Datenträger der VM entfernen → Server-Manager → Pool/Virtueller Datenträger zeigt **Warnung** → Hot Spare springt ein bzw. `Repair-VirtualDisk`.
5. **SR01** und **SR02**: Feature **Speicherreplikat** + Neustart; Daten-Volume **D:** (40 GB, GPT) und Log-Volume **L:** (10 GB) auf beiden Servern gleich groß.
6. **ADMIN-PC**: Windows Admin Center → SR01 → **Speicherreplikat** → **Neue Partnerschaft** → Quelle SR01 D:/L:, Ziel SR02 D:/L:, **Synchron** → Erstellen.
7. **SR02**: Datenträgerverwaltung/Explorer → D: nicht zugreifbar (Replikationsziel).
8. Rollen tauschen (geplanter Failover) per PowerShell `Set-SRPartnership` → jetzt ist D: auf SR02 nutzbar.

### PowerShell
```powershell
# Auf FS01 – Speicherpool mit Hot Spare
$disks = Get-PhysicalDisk -CanPool $true
New-StoragePool -FriendlyName Pool1 -StorageSubSystemFriendlyName "Windows Storage*" -PhysicalDisks ($disks | Select-Object -First 4)
Add-PhysicalDisk -StoragePoolFriendlyName Pool1 -PhysicalDisks ($disks | Select-Object -Last 1) -Usage HotSpare

# Virtuelle Datenträger + Volumes
New-VirtualDisk -StoragePoolFriendlyName Pool1 -FriendlyName VD-Spiegel -ResiliencySettingName Mirror -NumberOfDataCopies 2 -ProvisioningType Thin -Size 150GB
Get-VirtualDisk VD-Spiegel | Get-Disk | Initialize-Disk -PartitionStyle GPT -PassThru | New-Partition -DriveLetter F -UseMaximumSize | Format-Volume -FileSystem ReFS
New-Volume -StoragePoolFriendlyName Pool1 -FriendlyName VD-Paritaet -ResiliencySettingName Parity -ProvisioningType Fixed -Size 60GB -DriveLetter G -FileSystem NTFS

# Tiering (SSD + HDD im Pool vorausgesetzt)
New-StorageTier -StoragePoolFriendlyName Pool1 -FriendlyName SSD-Tier -MediaType SSD
New-StorageTier -StoragePoolFriendlyName Pool1 -FriendlyName HDD-Tier -MediaType HDD

# Wartung
Get-PhysicalDisk | Select-Object FriendlyName,HealthStatus,OperationalStatus,Usage
Set-PhysicalDisk -FriendlyName "PhysicalDisk2" -Usage Retired
Repair-VirtualDisk -FriendlyName VD-Spiegel
Get-StorageJob

# Auf SR01 und SR02 – Storage Replica
Install-WindowsFeature Storage-Replica -IncludeManagementTools -Restart

# Auf SR01 – Eignung testen, Partnerschaft erstellen
Test-SRTopology -SourceComputerName SR01 -SourceVolumeName D: -SourceLogVolumeName L: `
  -DestinationComputerName SR02 -DestinationVolumeName D: -DestinationLogVolumeName L: -DurationInMinutes 10 -ResultPath C:\Temp
New-SRPartnership -SourceComputerName SR01 -SourceRGName RG01 -SourceVolumeName D: -SourceLogVolumeName L: `
  -DestinationComputerName SR02 -DestinationRGName RG02 -DestinationVolumeName D: -DestinationLogVolumeName L: -ReplicationMode Synchronous
Get-SRGroup; Get-SRPartnership
(Get-SRGroup).Replicas | Select-Object DataVolume,ReplicationStatus,NumOfBytesRemaining

# Richtung umkehren (SR02 wird Quelle)
Set-SRPartnership -NewSourceComputerName SR02 -SourceRGName RG02 -DestinationComputerName SR01 -DestinationRGName RG01
```

## Einfach

**Speicherplätze** = du wirfst mehrere Festplatten in einen **großen Topf** (Pool). Aus dem Topf schöpfst du dann **virtuelle Festplatten** in der Größe, die du brauchst – und sagst, **wie sicher** sie sein sollen:
- **Einfach** = schnell, aber **kein Schutz**.
- **Spiegel** = alles wird **zwei- oder dreimal** gespeichert → eine (bzw. zwei) Platte(n) dürfen kaputtgehen. Gut für **schnelle** Sachen wie VMs.
- **Parität** = spart Platz mit einer **Prüfsumme** (wie ein Sudoku, mit dem man eine fehlende Zahl ausrechnen kann) → gut fürs **Archiv**, aber Schreiben ist langsamer.

**Dünn bereitgestellt** = du sagst „diese Platte hat 150 GB“, obwohl im Topf nur 100 GB sind – belegt wird erst, wenn wirklich Daten kommen. Praktisch, aber den Topf **im Auge behalten**, sonst läuft er über.

**Tiering** = schnelle **SSDs** und große **HDDs** zusammen: Was oft benutzt wird, liegt automatisch auf der **SSD**.

**Hot Spare** = die **Ersatzplatte auf der Bank**, die sofort einspringt.

**Speicherreplikat** = ein **Zwilling** deines Laufwerks auf einem anderen Server:
- **Synchron** = jede Änderung wird **erst dann bestätigt**, wenn **beide** Server sie haben → **nichts geht verloren**, aber die Server müssen **nah beieinander** sein (schnelle Leitung).
- **Asynchron** = erst lokal speichern, dann rüberschicken → geht auch über **weite Strecken**, im Notfall fehlen vielleicht die letzten Sekunden.
Der Zwilling ist währenddessen **verschlossen** – man kann ihn erst benutzen, wenn man die Rollen tauscht.

## Merksatz
- Pool → virtueller Datenträger → Volume.
- **Zwei-Wege-Spiegel** 2 Platten / 1 Ausfall; **Drei-Wege** 5 Platten / 2 Ausfälle; **Parität** 3 Platten / 1 Ausfall.
- **Spiegel = Leistung**, **Parität = Kapazität**.
- **Tiering** nur mit **fester** Bereitstellung.
- Storage Replica: **Block**-Ebene, **synchron** (RPO 0, ≤ 5 ms) oder **asynchron**.
- **Standard-Edition**: 1 Partnerschaft, 1 Volume, ≤ 2 TB.
- **Daten- + Log-Volume** auf beiden Seiten gleich groß; Ziel nicht zugreifbar.

## Prüfungsfalle
- Drei-Wege-Spiegel benötigt mindestens 5 Datenträger.
- Datenträger hinter Hardware-RAID-Volumes sind nicht poolfähig.
- Dünne Bereitstellung ohne Überwachung → Pool läuft voll, Volumes gehen offline.
- Speicherebenen nicht mit dünner Bereitstellung.
- Synchrone Storage Replica über WAN mit hoher Latenz → schlechte Leistung → asynchron.
- Unterschiedlich große Daten-/Log-Volumes verhindern die Partnerschaft.
- Storage-Replica-Ziel kann nicht gleichzeitig gelesen werden (anders als DFS-R).

## Grafik
### Topf
Vier Festplatten fallen in einen Topf „Pool1“; Kelle schöpft zwei virtuelle Datenträger (Spiegel, Parität); daneben eine Ersatzplatte auf der Bank.

### Layouts
Spiegel: jedes Datenstück zweimal auf unterschiedlichen Platten; Parität: Datenstücke + Sudoku-Prüfstein; eine Platte explodiert – Spiegel kopiert, Parität rechnet aus.

### Tiering
Aufzug: heiße Daten fahren nachts auf die SSD-Etage, kalte in den HDD-Keller.

### Zwilling
SR01 schreibt Block; synchron: Bestätigung erst nachdem SR02 „angekommen“ meldet; asynchron: sofortige Bestätigung, Block folgt kurz danach. SR02-Laufwerk trägt ein Schloss.

## Karteikarten
- F: Aufbau von Speicherplätzen? | A: Physische Datenträger → Speicherpool → virtueller Datenträger → Volume.
- F: Mindestanzahl Datenträger für Zwei-Wege-Spiegel? | A: 2.
- F: Mindestanzahl Datenträger für Drei-Wege-Spiegel? | A: 5.
- F: Mindestanzahl Datenträger für Parität? | A: 3.
- F: Wann Spiegel, wann Parität? | A: Spiegel für Leistung (VMs, DB), Parität für Kapazität (Archiv).
- F: Was ist dünne Bereitstellung? | A: Virtuelle Größe über der physischen Kapazität, Belegung erst bei Bedarf.
- F: Voraussetzung für Speicherebenen? | A: SSD- und HDD-Datenträger im Pool, feste Bereitstellung.
- F: Unterschied synchrone und asynchrone Storage Replica? | A: Synchron bestätigt erst nach Schreiben auf beiden Seiten (kein Datenverlust), asynchron lokal zuerst.
- F: Einschränkungen der Standard-Edition bei Storage Replica? | A: 1 Partnerschaft, 1 Volume, max. 2 TB.
- F: Welche Volumes braucht Storage Replica je Seite? | A: Datenvolume und Protokollvolume, jeweils gleich groß.
- F: Cmdlet zum Prüfen der Eignung für Storage Replica? | A: Test-SRTopology
- F: Unterschied Storage Replica und DFS-R? | A: SR blockbasiert, einseitig, Ziel nicht nutzbar; DFS-R dateibasiert, Multimaster.

## Quiz
? Ein virtueller Datenträger muss zwei gleichzeitige Datenträgerausfälle überstehen und hohe Schreibleistung bieten. Layout?
* Drei-Wege-Spiegel
- Zwei-Wege-Spiegel
- Parität
- Einfach

? Ein Archivvolume soll maximale Kapazität bei einfacher Ausfallsicherheit bieten. Layout?
* Parität
- Drei-Wege-Spiegel
- Einfach
- Zwei-Wege-Spiegel

? Zwei Rechenzentren mit 2 ms Latenz; Datenverlust im Notfall ist nicht akzeptabel. Lösung?
* Storage Replica synchron
- Storage Replica asynchron
- DFS-R mit Hub and Spoke
- BranchCache gehosteter Cache

? New-SRPartnership schlägt fehl; Quell-Log 10 GB, Ziel-Log 8 GB. Ursache?
* Log-Volumes müssen auf beiden Seiten gleich groß sein
- Storage Replica unterstützt keine Log-Volumes
- Synchron ist nur in der Standard-Edition möglich
- Das Ziel muss dynamisch sein

? Eine Speicherebene aus SSD und HDD soll angelegt werden, der virtuelle Datenträger ist dünn bereitgestellt. Problem?
* Speicherebenen erfordern feste Bereitstellung
- Speicherebenen erfordern Parität
- SSDs sind in Pools nicht erlaubt
- Tiering benötigt dynamische Datenträger
