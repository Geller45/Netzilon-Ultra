---
id: ccna-virtualisierung-cloud
bereich: CCNA
block: CCNA 1.12
kapitel: Network Fundamentals
titel: Virtualisierung – Hypervisor, Container, VRF und Cloud-Modelle
stufe: Fortgeschritten
fach: TCP/IP – CCNA – Basic
pruefungen: [CCNA, AP1, AP2]
quellen: [CCNA_200-301_Notes_-_Jeremys_IT_Lab.pdf, 200-301.pdf, Cloud-Typen.md, Netzwerke im Allgemeinen.md]
verweise: [ap2-virtualisierung-cloud, az800-vswitch, az800-windows-container, ccna-architekturen, ccna-vpn-wan]
---

## Profi

### Server-Virtualisierung
Früher: **ein physischer Server = ein Betriebssystem** – teuer (Platz, Strom, Kühlung) und schlecht ausgelastet. **Virtualisierung** bricht diese 1:1-Beziehung: ein **Hypervisor** (VMM, Virtual Machine Monitor) verteilt CPU, RAM, Speicher und NICs an mehrere **VMs**.
| | **Typ 1** (bare metal, nativ) | **Typ 2** (hosted) |
|---|---|---|
| läuft auf | direkt auf der Hardware | als Programm auf einem Host-OS |
| Beispiele | VMware ESXi, Microsoft Hyper-V, KVM, Xen | VMware Workstation, Oracle VirtualBox, Parallels |
| Einsatz | Rechenzentrum | Arbeitsplatz, Labor (z. B. CML, GNS3) |
Vorteile: **Partitionierung** (mehrere OS auf einer Maschine), **Isolation** (Fehler/Sicherheit), **Kapselung** (VM = Dateien, leicht kopierbar/verschiebbar), **Hardwareunabhängigkeit** (Migration auf andere Hosts).
**Virtuelle Netze**: VMs hängen an einem **vSwitch** im Hypervisor; dessen Ports können **Access oder Trunk** sein (VLANs), Uplinks gehen auf die physischen NICs (oft als NIC-Team/EtherChannel zum Top-of-Rack-Switch).

### Container
Ein **Container** enthält eine **Anwendung mit allen Abhängigkeiten** (Bins/Libs), aber **kein eigenes Betriebssystem**; Container teilen sich den **Kernel** des Host-OS (meist Linux) über eine **Container-Engine** (Docker, containerd, Podman). **Orchestrierung**: **Kubernetes** (ursprünglich Google), Docker Swarm – automatisches Bereitstellen, Skalieren, Neustarten (Microservices mit Tausenden Containern).
| | VM | Container |
|---|---|---|
| Startzeit | Minuten | Millisekunden/Sekunden |
| Größe | Gigabyte | Megabyte |
| Ressourcen | höher (eigenes OS) | geringer (geteilter Kernel) |
| Isolation | stärker | schwächer (Kernel-Absturz betrifft alle) |
| Portabilität | gleicher Hypervisor | sehr hoch (Image läuft fast überall) |

### VRF (Virtual Routing and Forwarding)
VRF teilt **einen Router** in **mehrere virtuelle Router** mit **getrennten Routingtabellen** (wie VLANs einen Switch teilen). Layer-3-Interfaces, SVIs und Routed Ports werden einer VRF zugeordnet; Verkehr zwischen VRFs ist nur mit **VRF Leaking** möglich. Kundenadressen dürfen sich **überlappen**. **VRF-Lite** = VRF ohne MPLS; bei Providern meist mit **MPLS L3VPN**.
```
R1(config)# ip vrf KUNDE1
R1(config-vrf)# exit
R1(config)# interface g0/0
R1(config-if)# ip vrf forwarding KUNDE1
R1(config-if)# ip address 192.168.1.1 255.255.255.0
R1# show ip route vrf KUNDE1
R1# ping vrf KUNDE1 192.168.1.10
```
Achtung: `ip vrf forwarding` **löscht** eine bereits konfigurierte IP – danach neu eintragen. Moderne Syntax: `vrf definition` / `vrf forwarding`.

### Cloud Computing (NIST SP 800-145)
**Fünf wesentliche Eigenschaften:**
1. **On-Demand Self-Service** – Kunde bucht/kündigt selbst per Portal.
2. **Broad Network Access** – Zugriff über Standardnetze von vielen Gerätetypen.
3. **Resource Pooling** – gemeinsamer Ressourcenpool, Mandantenfähigkeit (Multi-Tenancy).
4. **Rapid Elasticity** – schnelles Hoch- und Runterskalieren, Ressourcen wirken unbegrenzt.
5. **Measured Service** – Verbrauch wird gemessen und abgerechnet (Pay-as-you-go).
**Drei Servicemodelle:** **SaaS** (Software, z. B. Microsoft 365), **PaaS** (Plattform, z. B. Google App Engine, AWS Lambda, Azure App Service), **IaaS** (Infrastruktur/VMs, z. B. Amazon EC2, Azure VMs, Google Compute Engine).
**Vier Bereitstellungsmodelle:** **Public** (am häufigsten: AWS, Azure, GCP, OCI, IBM, Alibaba), **Private** (eine Organisation, on- oder off-premises, ggf. von Dritten betrieben), **Community** (Gruppe mit gemeinsamen Anforderungen, am seltensten), **Hybrid** (Kombination, z. B. Private Cloud mit Auslagerung in Public Cloud „Cloud Bursting“).
**Vorteile:** geringere **CapEx** (stattdessen OpEx), globale Skalierung, Geschwindigkeit/Agilität, Produktivität, Zuverlässigkeit (Backups, georedundante Spiegelung).
**Anbindung an die Public Cloud:** über das **Internet** (ggf. mit **Site-to-Site-VPN**), über eine **private WAN-Verbindung** (MPLS, Direktanschluss wie Azure ExpressRoute/AWS Direct Connect) oder über einen **Intercloud Exchange**/Carrier-Neutral-Provider.

## Einfach

**Virtualisierung** ist wie ein **Mehrfamilienhaus**: Früher hatte jede Familie (jedes Programm) ein eigenes Haus (Server) – teuer und meist halb leer. Heute baut man **ein großes Haus** (einen starken Server) und teilt es in **Wohnungen** (VMs). Der **Hausverwalter** (Hypervisor) verteilt Strom, Wasser und Platz. Jede Wohnung hat ihre **eigene Küche und eigene Tür** (eigenes Betriebssystem).

**Container** sind wie **Zimmer in einer WG**: Alle teilen sich **eine Küche** (den Kernel), jeder hat nur sein eigenes Zimmer mit seinen Sachen (der App). Das ist viel **schneller eingerichtet** und braucht weniger Platz – aber wenn die Küche brennt, sind alle betroffen.

**VRF** ist wie ein **Router mit mehreren getrennten Gehirnen**: Kunde A und Kunde B benutzen denselben Router, sehen sich aber nie – selbst wenn beide die Hausnummer 192.168.1.1 haben.

**Cloud** heißt **mieten statt kaufen**:
- **IaaS** = du mietest ein **leeres Haus** und richtest alles selbst ein.
- **PaaS** = du mietest ein **möbliertes Haus**, bringst nur deine Kleidung (deine App) mit.
- **SaaS** = du mietest ein **Hotelzimmer**: alles fertig, du nutzt es nur (z. B. Microsoft 365).

## Merksatz
- **Typ 1 auf Blech, Typ 2 auf Windows/Linux.**
- **VM = eigenes OS, Container = geteilter Kernel.**
- **VRF = mehrere Routingtabellen in einem Router.**
- **NIST: 5 Eigenschaften – 3 Services – 4 Modelle („5-3-4“).**
- **IaaS Haus – PaaS möbliert – SaaS Hotel.**

## Prüfungsfalle
- **Hyper-V ist Typ 1**, auch wenn man es unter Windows aktiviert (Windows läuft dann selbst als Parent-Partition über dem Hypervisor).
- Container haben **kein eigenes Betriebssystem** – sie sind daher **weniger isoliert** als VMs.
- Private Cloud bedeutet **nicht** zwingend on-premises.
- Community Cloud ist das **seltenste** Modell, Public Cloud das häufigste.
- Obsidian-Notiz „Cloud-Typen“ nennt nur die vier Namen ohne Erklärung – die Definitionen (Public/Private/Community/Hybrid) stehen hier.
- Drag-and-Drop-Fragen (200-301 D&D 4) fragen die **fünf NIST-Eigenschaften** ab – „Measured Service“ = Abrechnung nach Nutzung, „Resource Pooling“ = Mandantenfähigkeit.

## Grafik
### VM vs. Container
1. Text: Links ein Server mit Hypervisor und drei VMs (je eigenes OS)
2. Text: Rechts ein Server mit Host-OS, Docker-Engine und fünf Containern
3. Text: Start-Uhr: VM 60 s, Container 1 s
4. Text: Größe: VM 20 GB, Container 200 MB

### Cloud-Servicemodelle
1. Text: Stapel Netzwerk – Speicher – Server – Virtualisierung – OS – Middleware – Runtime – Daten – Anwendung
2. Text: IaaS: Anbieter verwaltet bis Virtualisierung (blau), Kunde den Rest
3. Text: PaaS: Anbieter bis Runtime, Kunde Daten und Anwendung
4. Text: SaaS: Anbieter verwaltet alles

## Lab
**Hyper-V-Host (Heimlabor) und R1 in Packet Tracer bzw. CML**

### GUI (Hyper-V-Host, Windows Server 2022/2025)
1. Server-Manager → Rollen → **Hyper-V** installieren (Typ-1-Hypervisor).
2. Hyper-V-Manager → Manager für virtuelle Switches → **Externer Switch** an physischer NIC.
3. VM **CL01** → Einstellungen → Netzwerkkarte → VLAN-ID 10 aktivieren.

### PowerShell (Hyper-V-Host)
```powershell
New-VMSwitch -Name "vSwitch-Extern" -NetAdapterName "Ethernet" -AllowManagementOS $true
New-VM -Name "CL01" -MemoryStartupBytes 2GB -Generation 2 -SwitchName "vSwitch-Extern"
Set-VMNetworkAdapterVlan -VMName "CL01" -Access -VlanId 10
```

### Cisco IOS (R1 – VRF-Lite)
```
R1(config)# ip vrf KUNDE1
R1(config)# ip vrf KUNDE2
R1(config)# interface g0/0
R1(config-if)# ip vrf forwarding KUNDE1
R1(config-if)# ip address 192.168.1.1 255.255.255.0
R1(config-if)# no shutdown
R1(config-if)# interface g0/1
R1(config-if)# ip vrf forwarding KUNDE2
R1(config-if)# ip address 192.168.1.1 255.255.255.0
R1(config-if)# no shutdown
R1(config-if)# end
R1# show ip vrf
R1# show ip route vrf KUNDE1
```
Gleiche IP auf zwei Interfaces ist möglich, weil sie in **verschiedenen VRFs** liegen.

## Befehle
- `ip vrf NAME` – VRF anlegen
- `ip vrf forwarding NAME` – Interface einer VRF zuordnen (löscht vorhandene IP)
- `show ip vrf` – VRFs und Interfaces anzeigen
- `show ip route vrf NAME` – Routingtabelle einer VRF
- `ping vrf NAME 192.168.1.10` – Ping innerhalb einer VRF
- `docker run -d nginx` – Container starten (Linux)
- `kubectl get pods` – Container-Pods in Kubernetes anzeigen

## Übungen
- A: Ordne zu: ESXi, VirtualBox, Hyper-V, VMware Workstation | L: Typ 1: ESXi, Hyper-V. Typ 2: VirtualBox, VMware Workstation.
- A: Nenne die fünf Eigenschaften nach NIST. | L: On-Demand Self-Service, Broad Network Access, Resource Pooling, Rapid Elasticity, Measured Service.
- A: Microsoft 365, Azure VM, Azure App Service – welches Servicemodell? | L: SaaS, IaaS, PaaS.
- A: Zwei Kunden nutzen beide 10.0.0.0/24 an einem Provider-Router. Welche Technik trennt sie? | L: VRF (z. B. VRF-Lite oder MPLS L3VPN).
- A: Drei Vorteile von Containern gegenüber VMs? | L: Schnellerer Start, geringerer Speicherbedarf, weniger CPU/RAM-Verbrauch, hohe Portabilität.

## Karteikarten
- F: Was ist ein Typ-1-Hypervisor? | A: Läuft direkt auf der Hardware (bare metal), z. B. ESXi, Hyper-V.
- F: Was ist ein Typ-2-Hypervisor? | A: Läuft als Anwendung auf einem Host-OS, z. B. VirtualBox.
- F: Was unterscheidet Container von VMs? | A: Container teilen den Kernel des Hosts und enthalten nur App + Abhängigkeiten, kein eigenes OS.
- F: Was ist Kubernetes? | A: Der verbreitetste Container-Orchestrator (Deployment, Skalierung, Management).
- F: Was ist VRF? | A: Virtual Routing and Forwarding – mehrere getrennte Routingtabellen in einem Router.
- F: Was ist VRF-Lite? | A: VRF ohne MPLS.
- F: Was bedeutet Rapid Elasticity? | A: Ressourcen können schnell hoch- und herunterskaliert werden.
- F: Was bedeutet Measured Service? | A: Nutzung wird gemessen und nach Verbrauch abgerechnet.
- F: Die drei Servicemodelle der Cloud? | A: IaaS, PaaS, SaaS.
- F: Die vier Bereitstellungsmodelle der Cloud? | A: Public, Private, Community, Hybrid.
- F: Wie verbinden sich VMs mit dem Netzwerk? | A: Über einen virtuellen Switch (vSwitch) im Hypervisor.

## Quiz
? Welcher Hypervisor ist ein Typ-1-Hypervisor?
* VMware ESXi
- Oracle VirtualBox
- VMware Workstation
- Parallels Desktop

? Was teilen sich Container auf einem Host?
* Den Kernel des Host-Betriebssystems
- Ein gemeinsames Gast-Betriebssystem pro VM
- Die BIOS-Firmware
- Einen Typ-2-Hypervisor

? Welche Technik erlaubt mehrere getrennte Routingtabellen auf einem Router?
* VRF
- VLAN
- VTP
- HSRP

? Welches Cloud-Servicemodell ist Microsoft 365?
* SaaS
- PaaS
- IaaS
- DaaS

? Welche NIST-Eigenschaft beschreibt die Abrechnung nach Verbrauch?
* Measured Service
- Resource Pooling
- Rapid Elasticity
- Broad Network Access

? Welches Bereitstellungsmodell ist am häufigsten?
* Public Cloud
- Community Cloud
- Private Cloud
- Hybrid Cloud

? Was ist ein Nachteil von Containern gegenüber VMs?
* Schwächere Isolation, da alle den gleichen Kernel nutzen
- Sie starten deutlich langsamer
- Sie benötigen mehr Speicherplatz
- Sie können keine Anwendungen ausführen

? Was passiert bei „ip vrf forwarding“ auf einem Interface mit IP-Adresse?
* Die vorhandene IP-Adresse wird entfernt und muss neu gesetzt werden
- Die IP-Adresse wird in alle VRFs kopiert
- Das Interface wird administrativ deaktiviert
- Die Routingtabelle wird gelöscht

## Zuordnen
### Cloud-Begriff und Bedeutung
- On-Demand Self-Service => Kunde bucht selbst per Portal
- Resource Pooling => gemeinsamer Ressourcenpool für viele Mandanten
- Rapid Elasticity => schnelles Hoch- und Runterskalieren
- Broad Network Access => Zugriff über Standardnetze mit vielen Geräten
- Measured Service => Abrechnung nach Nutzung

## Spickzettel
- Typ 1: ESXi, Hyper-V, KVM · Typ 2: VirtualBox, Workstation
- VM eigenes OS · Container geteilter Kernel (Docker, Kubernetes)
- vSwitch mit Access/Trunk-Ports
- VRF = getrennte Routingtabellen, VRF-Lite ohne MPLS
- NIST 5-3-4: Self-Service, Network Access, Pooling, Elasticity, Measured · IaaS/PaaS/SaaS · Public/Private/Community/Hybrid
