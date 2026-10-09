---
id: az801-cluster-storage-quorum
bereich: AZ-801
block: A9
kapitel: Hochverfügbarkeit
titel: Cluster-Storage, Quorum und Cloud Witness
stufe: Profi
quellen: [AZ-801 Study Guide, Microsoft Learn]
verweise: [az801-failover-cluster, az801-stretch-cluster, az801-s2d, az800-storage-spaces]
---

## Profi

### Clusterspeicher
| Typ | Erklärung |
|---|---|
| **iSCSI** | **Blockspeicher über IP** (**iSCSI-Target** → **Initiator** auf Knoten) |
| **Fibre Channel (FC)** | **SAN**, **HBA**, **Zoning** |
| **Shared SAS** | **Direkt angeschlossenes Shelf** |
| **Storage Spaces Direct** | **Lokale Datenträger** **der Knoten** **als gemeinsamer Pool** |
| **SMB-Freigabe** | **Nur für Hyper-V-VMs** (**SOFS**) |

**Regel**: **Ein Datenträger** **gehört immer nur einem Knoten** **(Besitzer)**, **außer CSV**.

### Cluster Shared Volumes (CSV)
**CSV** (*Cluster Shared Volumes*) macht **einen NTFS/ReFS-Datenträger** **auf allen Knoten gleichzeitig les- und schreibbar**.
| Merkmal | Details |
|---|---|
| **Pfad** | `C:\ClusterStorage\Volume1` **auf jedem Knoten** |
| **Koordinator** | **Ein Knoten** **verwaltet Metadaten** (**Besitzer**), **andere** **schreiben direkt** |
| **Nutzen** | **Viele VMs** **auf einem LUN**, **Live Migration** **ohne LUN-Wechsel** |
| **Dateisystem** | **ReFS** (**empfohlen**) oder **NTFS** |
| **Cache** | **CSV-Blockcache** (**RAM**), **für Lesezugriffe** |
| **Modi** | **Direct**, **File System Redirected**, **Block Redirected** (**bei Fehlern**) |

```powershell
# Auf NODE01 – Disk zum Cluster hinzufügen und als CSV freigeben
Get-Disk | Where-Object PartitionStyle -eq RAW
Get-ClusterAvailableDisk | Add-ClusterDisk
Add-ClusterSharedVolume -Name "Cluster Disk 1"
Get-ClusterSharedVolume
```

### Quorum – Warum?
**Quorum** = **Mehrheit der Stimmen**. **Nur die Seite mit Mehrheit** **darf weiterlaufen**. **So** **verhindert** der Cluster **Split-Brain**.

### Stimmen
| Element | Stimmen |
|---|---|
| **Jeder Knoten** | **1** |
| **Witness** (**Disk, Datei, Cloud**) | **1** (**bei Bedarf**) |
| **Mehrheit** | **> 50 %** |

### Quorum-Konfigurationen
| Modell | Anwendung |
|---|---|
| **Knotenmehrheit** (*Node Majority*) | **Ungerade Knotenanzahl**, **kein Witness** |
| **Knoten- und Datenträgermehrheit** | **Gerade Knotenzahl** + **Disk Witness** |
| **Knoten- und Dateifreigabemehrheit** | **Gerade Knotenzahl** + **File Share Witness** |
| **Knoten- und Cloudzeugenmehrheit** | **Gerade Knotenzahl** + **Cloud Witness** |
| **Kein Mehrheit (nur Datenträger)** | **Legacy**, **Single Point of Failure** |

**Faustregel**: **Gerade Knotenzahl → Witness**, **ungerade Knotenzahl → Witness optional (empfohlen)**.

### Witness-Typen
| Witness | Details |
|---|---|
| **Disk Witness** | **Kleiner Datenträger (≥ 512 MB, meist 1 GB)** **im Cluster-Speicher**, **NTFS/ReFS**, **speichert Cluster-Datenbankkopie** |
| **File Share Witness** | **SMB-Freigabe** **auf einem Server außerhalb des Clusters**, **speichert nur Zeitstempel/Metadaten**, **Konto CNO braucht Schreibrecht** |
| **Cloud Witness** | **Azure Blob Storage** (**Standard-Konto, „Allgemein v2“**), **HTTPS 443**, **ideal für Stretch/Standort ohne 3. RZ** |
| **USB Witness** (2025) | **USB-Stick am Router/Switch** **als File Share Witness** (**Branch Office**) |

### Cloud Witness im Detail
| Punkt | Details |
|---|---|
| **Container** | `msft-cloud-witness` **im Speicherkonto** |
| **Blob** | **Eine Datei pro Cluster** (**Cluster-ID**), **wenige KB** |
| **Anforderungen** | **Azure-Abo**, **Speicherkonto**, **Internet ausgehend TCP 443** |
| **Authentifizierung** | **Speicherkonto-Name + Zugriffsschlüssel** (**oder SAS in neueren Builds**) |
| **Redundanz** | **LRS** **genügt** |
| **Kosten** | **Minimal** (**wenige Cent**) |

```powershell
# Auf NODE01 – Cloud Witness einrichten
Set-ClusterQuorum -CloudWitness -AccountName "stclusterwit01" -AccessKey "<Speicherkonto-Schlüssel>" -Endpoint "core.windows.net"

# File Share Witness
Set-ClusterQuorum -FileShareWitness \\FS01\ClusterWitness

# Disk Witness
Set-ClusterQuorum -DiskWitness "Cluster Disk 2"

# Nur Knotenmehrheit
Set-ClusterQuorum -NoWitness

# Status
Get-ClusterQuorum
Get-ClusterNode | Select-Object Name, State, NodeWeight, DynamicWeight
```

### Dynamic Quorum (ab 2012 R2)
- **Cluster** **passt Stimmen** **automatisch** **an** (**Knoten, die ausfallen, verlieren Stimme**).
- **Dynamic Witness** (**2012 R2+**): **Witness-Stimme** **wird automatisch** **gesetzt/entzogen**, **um ungerade Gesamtzahl** **zu erhalten**.
- **Ergebnis**: **Cluster** **kann** **bis zum letzten Knoten** **weiterlaufen** (**Last Man Standing**), **sofern** **Reihenfolge** **stimmt**.
- **Stimme** **manuell** **entziehen**: `(Get-ClusterNode NODE04).NodeWeight = 0` (**z. B. DR-Standort**).

### Quorum-Verlust und Wiederherstellung
| Situation | Maßnahme |
|---|---|
| **Quorum verloren** (**Ereignis 1177**) | **Fehlende Knoten** **wieder online** |
| **Nur ein Knoten übrig** | `Start-ClusterNode -Name NODE01 -FixQuorum` (**Force-Quorum**) |
| **Nach Force-Start** | **Andere Knoten** **starten sauber** **und** **verwerfen alte Daten** (**Prevent Quorum**) |

## Lab
**Maschinen**: **DC01**, **NODE01**, **NODE02** (**Cluster CLU01**), **ISCSI01** (**iSCSI-Target**, **1 LUN 20 GB**, **1 LUN 1 GB** für **Witness**), **FS01** (**File Share Witness**). Alles **Domäne example.com**.

### GUI
1. **ISCSI01**: **Server-Manager → Datei-/Speicherdienste → iSCSI → Neuer iSCSI-virtueller Datenträger** → **LUN-20GB**, **LUN-1GB** → **Ziel** **mit Initiator NODE01/NODE02** verknüpfen.
2. **NODE01, NODE02**: **Server-Manager → Tools → iSCSI-Initiator** → **Ziel ISCSI01** → **Verbinden** → **MPIO** **optional**.
3. **NODE01**: **Datenträgerverwaltung → beide Datenträger online**, **initialisieren (GPT)**, **NTFS formatieren**.
4. **NODE01**: **Failovercluster-Manager → CLU01 → Speicher → Datenträger → Datenträger hinzufügen** → **beide** **auswählen**.
5. **NODE01**: **Datenträger 20 GB → Rechtsklick → Zu Clusterfreigabevolumes hinzufügen** → **`C:\ClusterStorage\Volume1`** **prüfen**.
6. **NODE01**: **CLU01 → Weitere Aktionen → Clusterquorumeinstellungen konfigurieren → Quorumzeugen auswählen → Datenträgerzeuge** → **1-GB-Disk**.
7. **NODE01**: **Erneut → Dateifreigabezeuge** → `\\FS01\ClusterWitness` → **Berechtigungen für CLU01$ prüfen**.
8. **NODE01**: **Azure-Portal → Speicherkonto erstellen (Standard, LRS)** → **Zugriffsschlüssel kopieren** → **Failovercluster-Manager → Cloudzeuge**.

### PowerShell
```powershell
# Auf NODE01 und NODE02
Start-Service MSiSCSI; Set-Service MSiSCSI -StartupType Automatic
New-IscsiTargetPortal -TargetPortalAddress 192.168.10.30
Get-IscsiTarget | Connect-IscsiTarget -IsPersistent $true

# Auf NODE01
Get-Disk | Where-Object PartitionStyle -eq RAW | Initialize-Disk -PartitionStyle GPT
Get-ClusterAvailableDisk | Add-ClusterDisk
Add-ClusterSharedVolume -Name "Cluster Disk 1"
Set-ClusterQuorum -DiskWitness "Cluster Disk 2"
Get-ClusterQuorum
```

## Einfach

Stell dir **vier Freunde** vor, die **gemeinsam etwas entscheiden** müssen. **Bricht die Verbindung ab** und **zwei Freunde sitzen links, zwei rechts**, **denken beide Seiten**: „**Wir bestimmen!**“ – **Chaos**.

Darum gibt es **einen fünften „Stimmzähler“ (Witness)**. **Wer ihn erreicht, hat die Mehrheit** und **darf weitermachen**. **Der Stimmzähler** kann **eine kleine Festplatte** (**Disk**), **ein Ordner auf einem anderen Server** (**File Share**) oder **eine kleine Datei in der Microsoft-Cloud** (**Cloud Witness**) sein.

**CSV** ist wie **ein gemeinsamer Schreibtisch**, **an dem alle Server gleichzeitig arbeiten dürfen**. **Ohne CSV** darf **immer nur einer an die Festplatte**.

## Merksatz
- **Mehrheit = mehr als die Hälfte der Stimmen**.
- **Gerade Zahl → Witness**.
- **Cloud Witness** = **Azure Blob, Port 443, wenige KB**.
- **CSV** = **`C:\ClusterStorage\VolumeX` auf allen Knoten**.
- **Dynamic Quorum** = **Stimmen passen sich an**.
- **`-FixQuorum`** = **Notstart mit einem Knoten**.

## Prüfungsfalle
- **Disk Witness** **nicht als CSV** **nutzen**.
- **Cloud Witness** **braucht Internet (TCP 443)**, **kein VPN nötig**.
- **File Share Witness** **auf einem Cluster-Knoten** ist **unzulässig**.
- **Zwei Knoten ohne Witness** = **Ausfall eines Knotens** **stoppt den Cluster**.
- **Dynamic Witness** **berechnet Stimme** **automatisch**, **nicht manuell setzen**.
- **Cloud Witness** **braucht Standard-Speicherkonto**, **kein Premium**, **kein Blob-only**.
- **Quorum verloren** = **Ereignis 1177**.
- **CSV** **≠** **Cluster-Disk**: **CSV** **gleichzeitig auf allen Knoten**.

## Grafik
### Stimmenwaage
Vier Server links/rechts, Witness in der Mitte; Waage kippt zur Seite mit Witness.

### CSV-Schreibtisch
Ein Laufwerk, drei Server schreiben gleichzeitig darauf.

### Cloud Witness
Wolke mit kleinem Dokument, Pfeil über Port 443 von beiden Standorten.

## Karteikarten
- F: Was bedeutet Quorum? | A: Mehrheit der Stimmen im Cluster.
- F: Wann braucht man einen Witness? | A: Bei gerader Knotenzahl.
- F: Nenne drei Witness-Typen. | A: Disk, File Share, Cloud.
- F: Welcher Port für Cloud Witness? | A: TCP 443.
- F: Was macht CSV? | A: Ein Volume wird von allen Knoten gleichzeitig genutzt.
- F: Wo finde ich CSV-Volumes? | A: C:\ClusterStorage\VolumeX.
- F: Was ist Dynamic Quorum? | A: Automatische Anpassung der Stimmen bei Knotenausfall.
- F: Welches Cmdlet setzt den Witness? | A: Set-ClusterQuorum.
- F: Wie startet man mit nur einem Knoten? | A: Start-ClusterNode -FixQuorum.
- F: Welche Ereignis-ID meldet Quorumverlust? | A: 1177.
- F: Welche Dateien hält der File Share Witness? | A: Nur Metadaten/Zeitstempel.
- F: Welcher Dateisystemtyp wird für CSV empfohlen? | A: ReFS (oder NTFS).

## Quiz
? Ein Cluster hat vier Knoten in zwei Standorten. Was braucht er?
* Einen Witness (idealerweise Cloud Witness)
- Keine Änderung
- Zwei zusätzliche Knoten
- Nur eine CSV

? Welche Maßnahme bringt einen Cluster nach Quorumverlust mit einem Knoten hoch?
* Start-ClusterNode -FixQuorum
- Remove-Cluster
- Test-Cluster
- Move-ClusterGroup

? Welcher Port wird für Cloud Witness verwendet?
* TCP 443
- TCP 445
- TCP 3389
- UDP 53

? Was ist der Vorteil von CSV?
* Alle Knoten greifen gleichzeitig auf dasselbe Volume zu
- Schnellere CPU
- Weniger Speicher
- Kein Quorum nötig

? Welche Witness-Art hat man, wenn kein dritter Standort verfügbar ist?
* Cloud Witness
- Disk Witness
- Domänen-Witness
- Kein Witness

? Wie viele Stimmen hat ein Knoten?
* 1
- 2
- 0
- Abhängig von RAM

? Wo darf die File-Share-Witness-Freigabe nicht liegen?
* Auf einem Knoten des Clusters
- Auf einem Dateiserver
- Auf einem NAS
- Auf einem separaten Server

? Was speichert ein Cloud Witness in Azure?
* Eine kleine Blob-Datei im Speicherkonto als Stimme für das Quorum
- Alle VM-Daten
- Die Clusterlogs
- Die Active-Directory-Datenbank
! Konfiguration mit Set-ClusterQuorum -CloudWitness.
