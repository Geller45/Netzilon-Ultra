---
id: az801-cluster-netzwerk
bereich: AZ-801
block: A9
kapitel: Hochverfügbarkeit
titel: Cluster-Netzwerk, Floating IP und Load Balancing
stufe: Profi
quellen: [AZ-801 Study Guide, Microsoft Learn]
verweise: [az801-failover-cluster, az801-stretch-cluster, az800-vswitch, az800-azure-vms]
---

## Profi

### Clusternetzwerke
Der Cluster **erkennt Netzwerke automatisch** (**je Subnetz eines**). **Jedem Netzwerk** weist man **eine Rolle** zu.
| Rolle | Wert | Nutzung |
|---|---|---|
| **Keine** (*Do not allow cluster network communication*) | **0** | **iSCSI/Speicher**, **nie Cluster-Verkehr** |
| **Nur Clusterkommunikation** (*Cluster only*) | **1** | **Heartbeat**, **CSV**, **Live Migration** |
| **Cluster und Client** (*Cluster and Client*) | **3** | **Zusätzlich Zugriff durch Clients** (**Client-Access-Point**) |

```powershell
# Auf NODE01 – Netzwerke anzeigen und Rolle setzen
Get-ClusterNetwork | Select-Object Name, Role, Address, Metric
(Get-ClusterNetwork "Heartbeat").Role = 1
(Get-ClusterNetwork "iSCSI").Role = 0
(Get-ClusterNetwork "LAN").Role = 3
```

### Empfohlene Netzwerktrennung
| Netzwerk | Zweck |
|---|---|
| **Management/Client** | **Zugriff** **der Benutzer** und **Verwaltung** |
| **Heartbeat/CSV** | **Cluster-Kommunikation**, **CSV-Umleitung** |
| **Live Migration** | **VM-Speicher übertragen** (**RDMA/SMB** **empfohlen**) |
| **Speicher** (*iSCSI/SMB*) | **Trennung** **zur Performance** |

**Mindestens 2 Netzwerke**, **Redundanz** **über NIC-Teaming** oder **SET** (*Switch Embedded Teaming*).

### Metrik und Priorität
- **Cluster** **wählt** **das Netzwerk** **mit niedrigster Metrik** **für interne Kommunikation**.
- **Metrik** **automatisch**, **manuell**: `(Get-ClusterNetwork "Heartbeat").Metric = 900`.
- **CSV-Verkehr** **nutzt das Netzwerk** **mit niedrigster Metrik**.
- **Live Migration** **legt man** **pro Netzwerk** **fest** (**Failovercluster-Manager → Netzwerke → Live-Migrationseinstellungen**).

### SMB Multichannel und RDMA
| Funktion | Nutzen |
|---|---|
| **SMB Multichannel** | **Mehrere NICs** **parallel** **für SMB (CSV, Live Migration)** |
| **RDMA** (*SMB Direct*) | **Direkter Speicherzugriff**, **niedrige CPU-Last** |
| **QoS/DCB** | **Bandbreitenreservierung** **für Cluster-Verkehr** |

### Cluster-IP und Netzwerkname
| Ressource | Aufgabe |
|---|---|
| **IP-Adresse (Cluster IP Address)** | **Client-Access-IP** |
| **Netzwerkname (Network Name)** | **DNS-Name** **des Clusters/der Rolle** |
| **Abhängigkeit** | **Name → IP-Adresse** |
| **Mehrere Subnetze** | **IP1 ODER IP2** (**OR-Abhängigkeit**) |

**Wichtig**: **Zugriff** **per Rollenname**, **nie direkt auf Knoten-IP**.

### Floating IP
**Floating IP** = **virtuelle IP**, **die zwischen Knoten wandert**.
| Umgebung | Umsetzung |
|---|---|
| **On-Prem** | **Cluster-IP-Ressource** **wechselt** **mit der Rolle** (**ARP-Update**) |
| **Azure** | **Azure Load Balancer** **mit „Floating IP (Direct Server Return)“** **aktiviert** |
| **Grund Azure** | **Gast-IP** **im Azure-VNet** **wird nicht per ARP verteilt** |

### Cluster in Azure – Ablauf
1. **Azure Load Balancer (intern, Standard-SKU)** **erstellen**.
2. **Front-End-IP** **= Cluster-IP** (**Rollen-IP**).
3. **Backend-Pool** **= Cluster-VMs**.
4. **Integritätstest (Health Probe)** **TCP** **auf Port 59999** (**beliebig**).
5. **Lastenausgleichsregel**: **Port**, **Backend-Port**, **Floating IP = Aktiviert**, **Sitzungspersistenz keine**.
6. **Cluster-IP-Ressource** **konfigurieren**: `ProbePort`, `SubnetMask 255.255.255.255`, `EnableDhcp 0`, `OverrideAddressMatch 1`.

```powershell
# Auf NODE01 (Azure-VM) – Cluster-IP für Azure Load Balancer vorbereiten
$ClusterNetworkName = "Cluster Network 1"
$IPResourceName = "IP Address 10.0.0.100"
$ILBIP = "10.0.0.100"
Get-ClusterResource $IPResourceName | Set-ClusterParameter -Multiple @{
  Address = $ILBIP
  ProbePort = 59999
  SubnetMask = "255.255.255.255"
  Network = $ClusterNetworkName
  EnableDhcp = 0
  OverrideAddressMatch = 1
}
```
**Windows Firewall**: **Probe-Port** **(59999)** **erlauben**.

### Network Load Balancing (NLB)
| Merkmal | Failover-Cluster | **NLB** |
|---|---|---|
| **Zweck** | **Zustandsbehaftete Dienste** (**SQL**, **Datei**, **VM**) | **Zustandslose Dienste** (**Web**, **VPN**, **Proxy**) |
| **Speicher** | **Gemeinsam** | **Keiner** |
| **Verteilung** | **Aktiv/Passiv (meist)** | **Aktiv/Aktiv** |
| **Status** | **Aktuell** | **Legacy** (**seit 2016 abgekündigt**) |

**NLB-Modi**: **Unicast**, **Multicast**, **IGMP-Multicast**. **Port-Regeln**: **Filter** **(Multi-Host, Single-Host, Disabled)**, **Affinität** (**None/Single/Class C**).

```powershell
# Auf NODE01 – NLB (Legacy)
Install-WindowsFeature NLB -IncludeManagementTools
New-NlbCluster -InterfaceName "Ethernet" -ClusterName WEB-NLB -ClusterPrimaryIP 192.168.10.80 -OperationMode Multicast
Add-NlbClusterNode -InterfaceName "Ethernet" -NewNodeName NODE02 -NewNodeInterface "Ethernet"
```

### Alternativen zu NLB
- **Azure Load Balancer**, **Application Gateway**, **Front Door**.
- **Hardware-Loadbalancer** (**F5**, **Kemp**).
- **Windows-Feature** **„Web Application Proxy“** **mit Cluster**.

### Fehlerbilder
| Symptom | Ursache |
|---|---|
| **Netzwerk „Teilweise verfügbar“** | **Nicht alle Knoten** **erreichen** **das Subnetz** |
| **Zwei Netzwerke gleiches Subnetz** | **Automatisch zusammengefasst**, **NICs falsch konfiguriert** |
| **Rolle offline nach Failover in Azure** | **Probe-Port/Floating IP** **falsch** |
| **Ereignis 1135** | **Knoten aus Membership entfernt** (**Heartbeat verloren**) |

## Lab
**Maschinen**: **NODE01**, **NODE02** (**Cluster CLU01**), **jeder** **mit 3 NICs**: **LAN (192.168.10.0/24)**, **HB (10.0.0.0/24)**, **iSCSI (10.0.1.0/24)**.

### GUI
1. **NODE01**: **Failovercluster-Manager → CLU01 → Netzwerke**.
2. **NODE01**: **Cluster Network 1 → Rechtsklick → Umbenennen → „LAN“**, **Network 2 → „HB“**, **Network 3 → „iSCSI“**.
3. **NODE01**: **iSCSI → Eigenschaften → „Clusterkommunikation in diesem Netzwerk nicht zulassen“**.
4. **NODE01**: **HB → Eigenschaften → „Clusterkommunikation zulassen“**, **Client-Verbindung nicht**.
5. **NODE01**: **LAN → Eigenschaften → „Clusterkommunikation zulassen“** **+ „Clients dürfen sich verbinden“**.
6. **NODE01**: **Rechtsklick Netzwerke → Live-Migrationseinstellungen** → **nur HB aktivieren**.
7. **NODE01**: **Azure-Portal** (**für Azure-Variante**): **Load Balancer → Lastenausgleichsregel → Floating IP: Aktiviert**.

### PowerShell
```powershell
# Auf NODE01
Get-ClusterNetwork
(Get-ClusterNetwork "Cluster Network 1").Name = "LAN"
(Get-ClusterNetwork "Cluster Network 2").Name = "HB"
(Get-ClusterNetwork "Cluster Network 3").Name = "iSCSI"
(Get-ClusterNetwork "LAN").Role = 3
(Get-ClusterNetwork "HB").Role = 1
(Get-ClusterNetwork "iSCSI").Role = 0

# Live-Migration nur über HB
Get-ClusterResourceType "Virtual Machine" | Set-ClusterParameter -Name MigrationExcludeNetworks -Value ((Get-ClusterNetwork | Where-Object Name -ne "HB").Id -join ";")
```

## Einfach

Ein **Cluster** hat **mehrere „Straßen“** (**Netzwerke**):
- **Hauptstraße (LAN)**: **Da kommen die Kunden**.
- **Nebenstraße (Heartbeat)**: **Nur die Server reden dort miteinander**.
- **Lieferweg (iSCSI)**: **Nur für die Lieferung von Daten** – **kein Gespräch**.

**Die Floating IP** ist **wie eine Telefonnummer**, **die immer beim aktuellen Chef klingelt**. **Wechselt der Chef**, **wandert die Nummer mit**. **In der Azure-Cloud** **klappt das nicht von allein**, **deshalb** **macht ein „Türsteher“** (**Load Balancer**) **das Weiterleiten**: **Er fragt alle paar Sekunden**: „**Wer ist der Chef?**“ (**Health Probe**).

**NLB** ist **was anderes**: **Viele gleiche Kassen** (**Webserver**), **Kunden werden verteilt** – **aber ohne gemeinsame Daten**.

## Merksatz
- **Rolle 0 = keine, 1 = Cluster, 3 = Cluster + Client**.
- **Minimum**: **2 Netzwerke**.
- **Azure** = **Load Balancer + Floating IP + Probe-Port**.
- **NLB** = **zustandslos, Legacy**.
- **Live Migration** **auf eigenes Netz**.
- **Ereignis 1135** = **Knoten raus**.

## Prüfungsfalle
- **iSCSI-Netzwerk** **immer Rolle 0** (**Kein Cluster-Verkehr**).
- **Azure**: **Floating IP** **muss aktiviert sein**, **sonst** **kein Zugriff nach Failover**.
- **Azure**: **SubnetMask 255.255.255.255**, **EnableDhcp 0**.
- **Probe-Port** **in Firewall erlauben**.
- **NLB** **ist nicht Ersatz** **für Failover-Cluster**.
- **NLB** **und** **Failover-Cluster** **auf demselben Host** **nicht kombinieren**.
- **Gleiches Subnetz** **auf zwei NICs** = **ein Netzwerk**.
- **Standard-SKU Load Balancer** **für Azure-Zonen**.

## Grafik
### Drei Straßen
Server mit drei Straßen; Kunden nur auf der LAN-Straße.

### Wandernde Telefonnummer
Nummer klingelt bei NODE01, wandert bei Ausfall zu NODE02.

### Azure-Türsteher
Load Balancer fragt beide Knoten per Probe-Port; nur aktiver antwortet, Verkehr fließt dorthin.

## Karteikarten
- F: Welche Rollen gibt es für Clusternetzwerke? | A: Keine (0), Nur Cluster (1), Cluster und Client (3).
- F: Welche Rolle für iSCSI? | A: Keine (0).
- F: Wie viele Netzwerke mindestens empfohlen? | A: 2.
- F: Was ist eine Floating IP? | A: IP, die mit der Rolle zwischen Knoten wandert.
- F: Was braucht ein Cluster in Azure? | A: Load Balancer mit Floating IP und Probe-Port.
- F: Subnetzmaske der Cluster-IP in Azure? | A: 255.255.255.255.
- F: Wofür ist NLB? | A: Lastverteilung zustandsloser Dienste (Legacy).
- F: Was ist SMB Multichannel? | A: Parallele Nutzung mehrerer NICs für SMB.
- F: Was bedeutet Ereignis 1135? | A: Knoten aus dem Cluster-Membership entfernt.
- F: Was macht SET? | A: Switch Embedded Teaming im Hyper-V-vSwitch.
- F: Wie ändert man die Rolle eines Netzwerks? | A: (Get-ClusterNetwork "X").Role = Wert.
- F: Wo stellt man Live-Migration-Netzwerke ein? | A: Failovercluster-Manager → Netzwerke → Live-Migrationseinstellungen.

## Quiz
? Ein Cluster in Azure ist nach Failover nicht erreichbar. Was fehlt am wahrscheinlichsten?
* Floating IP am Load Balancer
- Ein zweiter DNS-Server
- Ein zusätzlicher Witness
- BitLocker

? Welche Rolle bekommt ein reines iSCSI-Netzwerk?
* Keine Clusterkommunikation
- Cluster und Client
- Nur Cluster
- Nur Client

? Welche Technik verteilt zustandslose Webanfragen auf mehrere Server?
* Network Load Balancing
- Cluster Shared Volumes
- Storage Replica
- DFS-N

? Welcher Wert ist bei Cluster-IP in Azure zu setzen?
* SubnetMask 255.255.255.255
- SubnetMask 255.255.255.0
- EnableDhcp 1
- ProbePort 0

? Was passiert bei zwei NICs im selben Subnetz?
* Sie bilden ein Clusternetzwerk
- Sie bilden zwei Netzwerke
- Der Cluster startet nicht
- Quorum geht verloren

? Wofür nutzt man ein eigenes Live-Migration-Netzwerk?
* Um VM-Übertragungen vom Client-Verkehr zu trennen
- Um DNS zu beschleunigen
- Um AD-Replikation zu ersetzen
- Um Kerberos zu verbessern
