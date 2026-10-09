---
id: az801-cluster-sets-sofs
bereich: AZ-801
block: A9
kapitel: Hochverfügbarkeit
titel: Cluster Sets und Scale-Out File Server (SOFS)
stufe: Profi
quellen: [AZ-801 Study Guide, Microsoft Learn]
verweise: [az801-failover-cluster, az801-s2d, az801-cluster-storage-quorum, az800-dfs]
---

## Profi

### Cluster Sets – Zweck
Ein **Cluster Set** (*Cluster Set*, ab **Server 2019**) **fasst mehrere Failover-Cluster** **zu einer Einheit** **zusammen**, **um sehr große Umgebungen** (**über 64 Knoten hinaus**) **zu skalieren**. **VMs** **wandern** **zwischen den Clustern** **per Live Migration**, **ohne Storage-Freigabe** **zwischen den Clustern**.

### Bausteine
| Element | Erklärung |
|---|---|
| **Management-Cluster** | **Cluster**, **der das Cluster Set verwaltet** (**hostet Namespace**) |
| **Member-Cluster** | **Cluster**, **die Workloads** (**VMs**) **tragen** (**eigener S2D/Speicher**) |
| **Cluster Set Master** | **Rolle im Management-Cluster** (**Set-Verwaltung**) |
| **Cluster Set Worker** | **Rolle in jedem Member-Cluster** |
| **Infrastructure SOFS** | **SMB-Namespace** **im Management-Cluster**, **speichert Member-VM-Dateipfade** |
| **Unified Namespace** | **Einheitlicher SMB-Pfad** `\\<Namespace>\<Freigabe>` **über alle Member** |
| **Availability Set** | **Fault Domain/Update Domain** **über Cluster hinweg** |

### Vorteile
| Vorteil | Beschreibung |
|---|---|
| **Größere Skalierung** | **Mehrere Cluster** **als eine Fläche** |
| **VM-Mobilität** | **Live Migration** **zwischen Clustern** |
| **Flexible Lebenszyklen** | **Cluster** **einzeln aktualisieren/außer Dienst stellen** |
| **Mischbetrieb** | **Verschiedene OS-Versionen/Hardware** |
| **Fehlerdomänen** | **Availability Sets** **über Cluster** |

### Voraussetzungen
- **Server 2019 oder neuer** **auf allen Knoten**.
- **Jeder Member-Cluster** **funktionsfähig** **(Quorum, Speicher)**.
- **Alle Cluster** **in derselben AD-Gesamtstruktur**.
- **Managementcluster** **mit SOFS-Rolle (Infrastruktur)**.
- **Netzwerk**: **Konnektivität** **zwischen allen Clustern**.

### Aufbau
```powershell
# Auf NODE01 im Management-Cluster – Cluster Set anlegen
New-ClusterSet -Name CSET01 -NamespaceRoot SOFS-CS -CimSession MGMT-CLU

# Member hinzufügen
Add-ClusterSetMember -ClusterName CLU-A -CimSession CSET01 -InfraSOFSName SOFS-CLU-A
Add-ClusterSetMember -ClusterName CLU-B -CimSession CSET01 -InfraSOFSName SOFS-CLU-B

# Status
Get-ClusterSet -CimSession CSET01
Get-ClusterSetMember -CimSession CSET01
Get-ClusterSetNode -CimSession CSET01

# VM in Cluster Set anlegen und verschieben
New-ClusterSetVM -Name VM01 -CimSession CSET01 -Node NODE01 -ClusterName CLU-A
Move-ClusterSetVM -CimSession CSET01 -VMName VM01 -Node NODE03

# Availability Set
New-ClusterSetAvailabilitySet -Name AS01 -CimSession CSET01 -FaultDomainCount 2 -UpdateDomainCount 4
```

### Wichtige Eigenschaften
- **Kein gemeinsamer Speicher** **zwischen Clustern** (**jeder Cluster** **hat eigenen Pool**).
- **VM-Migration** **verschiebt Compute und Storage-Zugriff** **per SMB**.
- **Cluster Set** **ersetzt** **kein** **Disaster Recovery** (**kein Storage Replica**).
- **Azure Stack HCI** **nutzt** **Cluster Sets** **nicht** (**dort andere Konzepte**).

---

### Scale-Out File Server (SOFS)
Ein **SOFS** (*Scale-Out File Server for application data*) **stellt SMB-Freigaben** **aktiv/aktiv** **auf allen Knoten** **bereit**.
| Merkmal | Details |
|---|---|
| **Basis** | **Failover-Cluster** **mit CSV** |
| **Zugriff** | **Alle Knoten** **liefern** **dieselben Freigaben gleichzeitig** |
| **Ausfallsicherheit** | **SMB Transparent Failover** (**Sitzungen** **bleiben** **erhalten**) |
| **Skalierung** | **Mehr Knoten = mehr Durchsatz** |
| **Nutzlast** | **Hyper-V-VHDX**, **SQL-Datenbanken** (**Anwendungsdaten**) |
| **Nicht für** | **Benutzerdateien** (**Home/Profil**) |
| **Freigabe** | **Kontinuierlich verfügbar** (*Continuously Available, CA*) |
| **Zugriffspfad** | **Ein Client-Access-Point (DNS-Name)** **mit mehreren IPs** (**DNS-Round-Robin**) |

### Allgemeiner vs. Scale-Out-Dateiserver
| Merkmal | **Dateiserver für allgemeine Nutzung** | **Scale-Out File Server** |
|---|---|---|
| **Betrieb** | **Aktiv/Passiv** | **Aktiv/Aktiv** |
| **Nutzung** | **Benutzerfreigaben** | **Anwendungsdaten (Hyper-V/SQL)** |
| **Dedup, FSRM, DFS-N** | **Ja** | **Eingeschränkt** (**Dedup nur VDI**) |
| **Kontinuierlich verfügbar** | **Optional** | **Standard** |
| **SMB-Zeugenprotokoll** (*SMB Witness*) | **Nur bei CA-Freigaben** | **Ja (Standard)** |

### Einrichtung
```powershell
# Auf NODE01 – Rollen installieren
Install-WindowsFeature FS-FileServer, Failover-Clustering -IncludeManagementTools

# SOFS-Rolle anlegen (CSV muss bereits existieren)
Add-ClusterScaleOutFileServerRole -Name SOFS01 -Cluster CLU01

# Freigabe
New-Item -Path C:\ClusterStorage\Volume1\Shares\VMs -ItemType Directory
New-SmbShare -Name VMs -Path C:\ClusterStorage\Volume1\Shares\VMs -ContinuouslyAvailable $true -FullAccess "example\Hyper-V-Hosts","example\Domain Admins"

# Berechtigung der Hyper-V-Hosts (Computerkonten!) auf NTFS
Set-SmbPathAcl -ShareName VMs
```

### Hyper-V auf SOFS
- **VM-Speicherpfad**: `\\SOFS01\VMs\VM01\VM01.vhdx`.
- **Berechtigung**: **Computerkonten der Hyper-V-Hosts** (**`example\HV01$`**) **haben Vollzugriff**.
- **SMB-Multichannel/RDMA** **empfohlen**.

### Hyperkonvergent vs. konvergent (disaggregiert)
| Modell | Beschreibung |
|---|---|
| **Hyperkonvergent** | **Compute + Storage** **auf denselben Knoten** (**S2D**) |
| **Konvergent (Disaggregated)** | **SOFS-Cluster** (**Storage**) **getrennt** **vom Hyper-V-Cluster** (**Compute**) |

## Lab
**Maschinen**: **DC01**, **NODE01**, **NODE02** (**Cluster CLU01** **mit CSV**), **HV01** (**Hyper-V-Host**).

### GUI
1. **NODE01**: **Failovercluster-Manager → CLU01 → Rollen → Rolle konfigurieren → Dateiserver → Dateiserver für Anwendungsdaten mit horizontaler Skalierung (Scale-Out File Server)**.
2. **NODE01**: **Clientzugriffspunkt** **Name SOFS01** → **Fertigstellen**.
3. **NODE01**: **Rolle SOFS01 → Rechtsklick → Dateifreigabe hinzufügen → SMB-Freigabe – Anwendungen** → **Volume1** → **Name VMs**.
4. **NODE01**: **Freigabeeinstellungen**: **Kontinuierliche Verfügbarkeit aktivieren** (**Standard**).
5. **NODE01**: **Berechtigungen**: **Computerkonto HV01$** **Vollzugriff**.
6. **HV01**: **Hyper-V-Manager → Neue VM → Speicherort** `\\SOFS01\VMs`.
7. **NODE02**: **Herunterfahren** → **VM läuft weiter** (**Transparent Failover**).

### PowerShell
```powershell
# Auf NODE01
Add-ClusterScaleOutFileServerRole -Name SOFS01
New-SmbShare -Name VMs -Path C:\ClusterStorage\Volume1\Shares\VMs -ContinuouslyAvailable $true -FullAccess "EXAMPLE\HV01$","EXAMPLE\Domain Admins"
Get-SmbShare -Name VMs | Select-Object Name, ContinuouslyAvailable, ScopeName

# Auf HV01
New-VM -Name VM01 -MemoryStartupBytes 2GB -Path \\SOFS01\VMs -NewVHDPath \\SOFS01\VMs\VM01\VM01.vhdx -NewVHDSizeBytes 40GB -Generation 2
```

## Einfach

**Cluster Set** = **Mehrere Supermärkte** (**Cluster**) **bilden eine Kette**. **Ein Kunde** (**VM**) **kann von Markt A nach Markt B umziehen**, **ohne dass er es merkt**. **Ein Chef-Laden** (**Management-Cluster**) **hält die Kette zusammen**.

**SOFS** = **Ein Lagerhaus**, **bei dem alle Mitarbeiter gleichzeitig Pakete rausgeben**. **Fällt einer aus**, **machen die anderen** **nahtlos weiter**. **Das Lagerhaus** ist **für große Kisten** (**virtuelle Festplatten**, **Datenbanken**), **nicht für Omas Urlaubsfotos** (**Benutzerdateien**).

## Merksatz
- **Cluster Set** = **Cluster über Cluster**.
- **Management-Cluster** **+ Member-Cluster**.
- **SOFS** = **aktiv/aktiv**, **CSV**, **Anwendungsdaten**.
- **Kein SOFS** **für Benutzer-Home-Verzeichnisse**.
- **Computerkonten** **der Hyper-V-Hosts** **brauchen Zugriff**.
- **Transparent Failover** = **Sitzung bleibt**.

## Prüfungsfalle
- **Cluster Set** **braucht Server 2019+**.
- **Member-Cluster** **teilen keinen Speicher**.
- **SOFS** **für Benutzer** = **falsch**, **richtig ist General Purpose File Server**.
- **SOFS** **nur mit CSV**.
- **VM** **auf SOFS**: **Computerkonto** **nicht Benutzerkonto** **berechtigen**.
- **Cluster Set** **≠** **Stretch-Cluster** (**keine Replikation**).
- **Cluster Set** **ersetzt kein DR**.
- **Kontinuierlich verfügbar** **kann Schreibleistung** **etwas senken** (**Write-Through**).

## Grafik
### Supermarktkette
Drei Märkte, ein Chef-Laden in der Mitte; Kunde zieht von Markt A nach B.

### Lagerhaus
Mehrere Mitarbeiter (Knoten) an einer Rampe; einer fällt aus, andere übernehmen.

### Kette der Namen
Ein gemeinsamer Ordnername verzweigt zu den Membern.

## Karteikarten
- F: Was ist ein Cluster Set? | A: Verbund mehrerer Failover-Cluster mit clusterübergreifender VM-Mobilität.
- F: Ab welcher Version gibt es Cluster Sets? | A: Windows Server 2019.
- F: Was ist ein Management-Cluster? | A: Cluster, der das Cluster Set und den Namespace verwaltet.
- F: Was ist ein SOFS? | A: Aktiv/aktiv-Dateiserver für Anwendungsdaten auf CSV.
- F: Wofür ist SOFS geeignet? | A: Hyper-V-VHDX und SQL-Datenbanken.
- F: Wofür nicht? | A: Benutzerdateien/Home-Laufwerke.
- F: Was ist Transparent Failover? | A: SMB-Sitzung bleibt bei Knotenausfall erhalten.
- F: Welches Cmdlet legt SOFS an? | A: Add-ClusterScaleOutFileServerRole.
- F: Welches Cmdlet legt ein Cluster Set an? | A: New-ClusterSet.
- F: Wer braucht Zugriff auf die SOFS-Freigabe? | A: Computerkonten der Hyper-V-Hosts.
- F: Was ist ein Availability Set im Cluster Set? | A: Verteilung von VMs auf Fault-/Update-Domänen über Cluster.
- F: Was bedeutet konvergent? | A: Storage (SOFS) und Compute (Hyper-V) getrennt.

## Quiz
? Mehrere Hyper-V-Cluster sollen als eine Ressource mit VM-Mobilität verwaltet werden. Lösung?
* Cluster Set
- Stretch-Cluster
- DFS-Namespace
- NLB

? Welche Dateiserver-Variante ist für Hyper-V-VHDX auf SMB gedacht?
* Scale-Out File Server
- Dateiserver für allgemeine Nutzung
- DFS-R
- Azure Files

? Wer braucht Vollzugriff auf die SOFS-Freigabe für VMs?
* Die Computerkonten der Hyper-V-Hosts
- Nur Domänenbenutzer
- Nur Gäste
- Der DC

? Was bietet SMB Transparent Failover?
* Sitzungen bleiben bei Knotenausfall erhalten
- Automatische Replikation
- Schnellere DNS-Auflösung
- Verschlüsselung

? Welche Aussage zu Cluster Sets stimmt?
* Member-Cluster haben jeweils eigenen Speicher
- Alle teilen einen SAN-Pool
- Sie benötigen Server 2012
- Sie ersetzen Storage Replica

? Welches Cmdlet erzeugt die SOFS-Rolle?
* Add-ClusterScaleOutFileServerRole
- New-SofsServer
- Set-ClusterSofs
- Install-Sofs
