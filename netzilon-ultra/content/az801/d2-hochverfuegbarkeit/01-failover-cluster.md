---
id: az801-failover-cluster
bereich: AZ-801
block: A9
kapitel: Hochverfügbarkeit
titel: Failover-Cluster
stufe: Fortgeschritten
quellen: [AZ-801 Study Guide, Microsoft Learn]
verweise: [az801-cluster-storage-quorum, az801-cluster-netzwerk, az801-knoten-recovery, az801-cau-rolling-upgrade, az800-vhdx]
---

## Profi

### Zweck
Ein **Failover-Cluster** (*Failover Cluster*) ist eine **Gruppe unabhängiger Server (Knoten, Nodes)**, die **gemeinsam Rollen hochverfügbar** betreiben. **Fällt ein Knoten aus**, **übernimmt ein anderer** die **Rolle** (**Failover**). Ziel: **Ausfallzeit minimieren**, **Wartung ohne Downtime**.

### Bausteine
| Begriff | Erklärung |
|---|---|
| **Knoten** (*Node*) | **Server** im Cluster, **bis zu 64** je Cluster |
| **Clusterrolle** (*Clustered Role*) | **Dienst/Workload**: **Hyper-V-VM**, **Dateiserver**, **SQL Server**, **DHCP**, **generischer Dienst** |
| **Clusterressource** | **Einzelne Komponente** einer Rolle: **IP-Adresse**, **Netzwerkname**, **Disk**, **Dienst** |
| **CNO** (*Cluster Name Object*) | **Computerkonto** des **Clusters** in **AD** |
| **VCO** (*Virtual Computer Object*) | **Computerkonto** einer **Rolle** (z. B. Dateiserver-Name) |
| **Clusterdienst** | `ClusSvc` auf **jedem Knoten** |
| **Cluster-Datenbank** | **Konfiguration**, **auf allen Knoten synchron** (Registry `HKLM\Cluster`) |
| **Heartbeat** | **Lebenszeichen** zwischen Knoten über **Clusternetzwerke** |
| **Quorum** | **Mehrheitsentscheidung**, **verhindert Split-Brain** (siehe **Quorum-Seite**) |

### Voraussetzungen
| Punkt | Details |
|---|---|
| **Betriebssystem** | **Gleiche Windows-Server-Version**, **Edition Standard oder Datacenter** |
| **Hardware** | **Ähnlich**, **Validierung** muss **bestanden** werden |
| **Domäne** | **Alle Knoten in derselben AD-Domäne** (**Standard**). **Ausnahmen**: **Workgroup-Cluster** und **Multi-Domain-Cluster** (**DNS-Namen**, **ohne Kerberos**, **kein CNO**) |
| **Konten** | **Anlegender Benutzer**: **Lokaladmin** auf **allen Knoten** und **Recht „Computerobjekte erstellen“** (oder **vorbereitetes CNO**) |
| **Netzwerk** | **Mindestens 2 Netzwerke** empfohlen (**Client**, **Heartbeat/Speicher**) |
| **Storage** | **Gemeinsam** (**iSCSI/FC/SAS**) **oder** **Storage Spaces Direct** |
| **Feature** | `Failover-Clustering` **auf jedem Knoten** |

### Ablauf der Einrichtung
1. **Feature** **installieren** (**alle Knoten**).
2. **Validierung** (`Test-Cluster`) **ausführen**, **Bericht prüfen**.
3. **Cluster erstellen** (`New-Cluster`), **Name** + **IP** festlegen.
4. **Storage/Quorum** **konfigurieren** (**Witness**).
5. **Rollen hinzufügen** (**VM**, **Dateiserver** …).

**Ohne bestandene Validierung** ist der **Cluster** **nicht supportet**.

### Failover-Verhalten einer Rolle
| Einstellung | Bedeutung |
|---|---|
| **Bevorzugter Besitzer** (*Preferred Owner*) | **Knoten**, auf dem die Rolle **normalerweise läuft** |
| **Mögliche Besitzer** (*Possible Owners*) | **Knoten**, auf die die Rolle **wechseln darf** |
| **Failover-Schwelle** (*Maximum failures in the specified period*) | **Standard 2 Fehler in 6 Stunden**, **danach bleibt die Rolle „Fehlgeschlagen“** |
| **Failback** | **Rolle wandert zurück** zum **bevorzugten Knoten** (**sofort** oder **Zeitfenster**) |
| **Priorität** (*Priority*) | **Hoch/Mittel/Niedrig/Kein Autostart** (**Startreihenfolge**) |

### Migration von VMs
| Art | Wirkung |
|---|---|
| **Live Migration** | **Ohne Unterbrechung**, **geplant** |
| **Quick Migration** | **Kurze Unterbrechung** (**Speichern → Verschieben**) |
| **Failover (ungeplant)** | **VM startet neu** auf **anderem Knoten** (**Crash-konsistent**) |

### Heartbeat-Einstellungen (Standardwerte je Version)
| Wert | Bedeutung |
|---|---|
| `SameSubnetDelay` | **Intervall** im **gleichen Subnetz** (**1000 ms**) |
| `SameSubnetThreshold` | **Verpasste Heartbeats** bis **Ausfall** (**10**) |
| `CrossSubnetDelay` | **Intervall** **zwischen Subnetzen** (**1000 ms**) |
| `CrossSubnetThreshold` | **Verpasste Heartbeats** **zwischen Subnetzen** (**20**) |

### Verwaltung
```powershell
# Auf NODE01 und NODE02 – Feature installieren
Install-WindowsFeature Failover-Clustering -IncludeManagementTools

# Auf NODE01 – Validierung
Test-Cluster -Node NODE01, NODE02

# Auf NODE01 – Cluster erstellen (ohne Storage, mit statischer IP)
New-Cluster -Name CLU01 -Node NODE01, NODE02 -StaticAddress 192.168.10.50 -NoStorage

# Status
Get-Cluster
Get-ClusterNode
Get-ClusterGroup
Get-ClusterResource

# Rolle verschieben, Besitzer festlegen
Move-ClusterGroup -Name "VM01" -Node NODE02
Set-ClusterOwnerNode -Group "VM01" -Owners NODE01, NODE02

# Failover-Schwelle
(Get-ClusterGroup "VM01").FailoverThreshold = 3
(Get-ClusterGroup "VM01").FailoverPeriod = 6

# Heartbeat anpassen
(Get-Cluster).SameSubnetThreshold = 20
```

### Sonderformen
| Form | Erklärung |
|---|---|
| **Workgroup-Cluster** | **Ohne AD**, **lokale Konten**, **DNS-Name** |
| **Multi-Domain-Cluster** | **Knoten in verschiedenen Domänen** |
| **AD-Detached Cluster** | **Ohne CNO/VCO** in AD (**Netzwerkname nur in DNS**) |
| **Gast-Cluster** | **Cluster aus VMs** (auch **in Azure**) |
| **Hyper-V-Cluster** | **Hyper-V-Hosts** als **Knoten**, **VMs** als **Rollen** |

## Lab
**Maschinen**: **DC01** (example.com, DNS), **NODE01**, **NODE02** (**Server 2022**, Domäne example.com), **beide** mit **2 Netzwerkkarten** (**LAN 192.168.10.0/24**, **Heartbeat 10.0.0.0/24**). Anmeldung als **Domänenadmin**.

### GUI
1. **NODE01** und **NODE02**: **Server-Manager → Rollen und Features hinzufügen → Features → Failover-Clusterunterstützung** → **Installieren**.
2. **NODE01**: **Server-Manager → Tools → Failovercluster-Manager**.
3. **NODE01**: **Rechtsklick Failovercluster-Manager → Konfiguration überprüfen** → **NODE01, NODE02** hinzufügen → **Alle Tests ausführen** → **Bericht ansehen**.
4. **NODE01**: **Häkchen „Cluster jetzt mit den überprüften Knoten erstellen“** → **Clustername CLU01**, **IP 192.168.10.50** → **Speicher: Alle geeigneten Speichermedien zum Cluster hinzufügen** **abwählen** → **Fertig stellen**.
5. **DC01**: **ADUC → Computers** → **CNO CLU01** **prüfen**, **DNS** → **A-Eintrag CLU01**.
6. **NODE01**: **Failovercluster-Manager → CLU01 → Rollen → Rolle konfigurieren → Allgemeiner Dienst** → **z. B. Druckspooler**.
7. **NODE01**: **Rolle → Rechtsklick → Verschieben → Bestleistungsknoten wählen** → **auf NODE02** prüfen.
8. **NODE02**: **Herunterfahren** → **Rolle** **wandert automatisch** zu **NODE01**.

### PowerShell
```powershell
# Auf NODE01 und NODE02
Install-WindowsFeature Failover-Clustering -IncludeManagementTools

# Auf NODE01
Test-Cluster -Node NODE01, NODE02
New-Cluster -Name CLU01 -Node NODE01, NODE02 -StaticAddress 192.168.10.50 -NoStorage
Add-ClusterGenericServiceRole -ServiceName Spooler -Name PRINT-CLU
Move-ClusterGroup -Name PRINT-CLU -Node NODE02
Get-ClusterGroup
```

## Einfach

Ein **Failover-Cluster** ist wie **zwei Kassierer** im Supermarkt. **Beide kennen die gleichen Preise** und **schauen sich gegenseitig zu**. **Wird einer krank**, **übernimmt der andere sofort** – **die Kunden merken fast nichts**.

Die **Kassierer** heißen **Knoten**. Das, **was sie tun** (z. B. **Dateien bereitstellen**, **virtuelle Computer laufen lassen**), heißt **Rolle**.

Die **beiden rufen sich ständig zu**: „**Ich bin noch da!**“ Das ist der **Heartbeat**. **Kommt kein Ruf mehr**, **weiß der andere**: **Der Kollege ist weg** → **Ich übernehme.**

**Vorher** macht man einen **Test** (**Validierung**), **ob beide gut zusammenpassen**. **Ohne bestandenen Test** gibt es **keinen Support** von Microsoft.

## Merksatz
- **Cluster** = **Knoten + Rollen + gemeinsamer Speicher + Quorum**.
- **CNO** = **Cluster**, **VCO** = **Rolle**.
- **Erst `Test-Cluster`**, **dann `New-Cluster`**.
- **Heartbeat** = „**Lebt der andere noch?**“
- **Live Migration** = **geplant und ohne Ausfall**, **Failover** = **ungeplant mit Neustart**.
- **2 Fehler in 6 Stunden** = **Standard-Failoverschwelle**.

## Prüfungsfalle
- **Alle Knoten** brauchen **dieselbe Windows-Version** (**Ausnahme**: **Rolling Upgrade** **vorübergehend gemischt**).
- **Validierung** **nicht bestanden** = **kein Support**, **Cluster** **lässt sich** **trotzdem** **anlegen** (**nicht empfohlen**).
- **Feature** muss **auf jedem Knoten** installiert sein, **nicht nur auf einem**.
- **Für das CNO** braucht der **Ersteller** das **Recht „Computerobjekte erstellen“** (**sonst vorbereitetes Konto**).
- **Failover-Schwelle überschritten** → **Rolle bleibt offline**.
- **Live Migration** **≠** **Failover**.
- **Workgroup-Cluster** **ohne Kerberos** (**NTLM/Zertifikate**).
- **Gast-Cluster** **in Azure**: **Load Balancer** **für Cluster-IP** nötig.

## Grafik
### Zwei Kassierer
Zwei Kassen; ein Kassierer wird „krank“, der andere rückt nach.

### Heartbeat
Zwei Server, dazwischen ein pulsierendes Herzsymbol; Puls fällt aus, Rolle springt über.

### Cluster erstellen
Validierungs-Häkchen erscheinen, danach entsteht der Cluster-Kreis um beide Knoten.

## Karteikarten
- F: Was ist ein Failover-Cluster? | A: Gruppe von Servern (Knoten), die Rollen hochverfügbar betreiben.
- F: Wie viele Knoten sind maximal möglich? | A: 64.
- F: Was ist das CNO? | A: Das Computerkonto des Clusters in AD.
- F: Was ist ein VCO? | A: Das Computerkonto einer geclusterten Rolle.
- F: Was macht der Heartbeat? | A: Prüft, ob die Knoten noch leben.
- F: Welches Cmdlet prüft die Clustertauglichkeit? | A: Test-Cluster.
- F: Welches Cmdlet erstellt einen Cluster? | A: New-Cluster.
- F: Standard-Failoverschwelle? | A: 2 Fehler in 6 Stunden.
- F: Live Migration oder Quick Migration ohne Unterbrechung? | A: Live Migration.
- F: Was ist ein Workgroup-Cluster? | A: Cluster ohne AD-Domäne, mit DNS-Namen.
- F: Was bedeutet Preferred Owner? | A: Knoten, auf dem die Rolle normalerweise läuft.
- F: Welches Feature installiert man? | A: Failover-Clustering.

## Quiz
? Welches Cmdlet prüft, ob Server für einen Cluster geeignet sind?
* Test-Cluster
- Get-Cluster
- New-ClusterValidation
- Start-ClusterNode

? Welches Objekt repräsentiert den Cluster in AD?
* CNO (Cluster Name Object)
- SRV-Record
- GPO
- DRA

? Eine Rolle fällt dreimal in 6 Stunden aus und bleibt offline. Ursache?
* Failover-Schwelle überschritten
- Quorum ist zu groß
- DNS-Zone fehlt
- Kein Heartbeat-Netz

? Was unterscheidet Live Migration von Failover?
* Live Migration ist geplant und ohne Ausfall
- Failover ist geplant
- Live Migration braucht kein Netzwerk
- Beides ist identisch

? Wie viele Knoten unterstützt ein Windows-Server-Cluster maximal?
* 64
- 8
- 16
- 128

? Welche Voraussetzung gilt für einen normalen Cluster?
* Knoten in derselben Domäne mit gleicher Windows-Version
- Jeder Knoten in eigener Gesamtstruktur
- Nur Windows 10
- Kein Speicher nötig
