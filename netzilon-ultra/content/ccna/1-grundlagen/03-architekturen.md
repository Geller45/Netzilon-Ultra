---
id: ccna-architekturen
bereich: CCNA
block: CCNA 1.2
kapitel: Network Fundamentals
titel: Netzwerkarchitekturen – Two-Tier, Three-Tier, Spine-Leaf, WAN, SOHO, On-Prem/Cloud
stufe: Fortgeschritten
fach: TCP/IP – CCNA – Basic
pruefungen: [CCNA, AP2]
quellen: [CCNA_200-301_Notes_-_Jeremys_IT_Lab.pdf, 200_301_CCNA_v1.0_2.pdf, 200-301.pdf, Netzwerk-Topologien.md, Netzwerke im Allgemeinen.md]
verweise: [ap1-a4-topologie, ap2-netzwerk-design, ccna-vpn-wan, ccna-virtualisierung-cloud, netz-datenuebertragung-switching]
---

## Profi

### Topologie-Grundbegriffe
- **Stern** (Star): alle Geräte an einem zentralen Gerät (typisch: PCs an Access-Switch).
- **Full Mesh**: jedes Gerät mit jedem verbunden – maximale Redundanz, Anzahl Links = n·(n−1)/2.
- **Partial Mesh**: nur einige Geräte direkt verbunden.
- **Physische** Topologie = Verkabelung; **logische** Topologie = Weg der Signale (Hub: physisch Stern, logisch Bus).

### Two-Tier (Collapsed Core)
Zwei Hierarchieebenen:
- **Access Layer**: Endgeräte (PCs, Drucker, Kameras, APs) werden angeschlossen. Viele Ports, häufig **PoE**. Hier passieren **QoS-Markierung** und Sicherheitsfunktionen (**Port Security, DHCP Snooping, DAI**).
- **Distribution Layer** (Aggregation): bündelt die Access-Switches, ist meist die **Grenze zwischen Layer 2 und Layer 3** (SVIs, Inter-VLAN-Routing), verbindet zu WAN/Internet/Diensten.
„Collapsed Core“, weil die Core-Ebene in die Distribution „hineingefaltet“ ist – geeignet für kleine bis mittlere Standorte.

### Three-Tier
Zusätzlich ein **Core Layer**: verbindet mehrere Distribution-Blöcke (z. B. mehrere Gebäude). Cisco empfiehlt einen Core ab **mehr als drei Distribution-Paaren** an einem Standort.
- Ziel: **schneller Transport** („fast transport“).
- **Keine CPU-intensiven Funktionen** (keine Sicherheitsfilter, keine QoS-Klassifizierung).
- Verbindungen **nur Layer 3** – kein Spanning Tree im Core.
- Hohe Ausfallsicherheit (redundante Links und Geräte).

### Spine-Leaf (Clos, Rechenzentrum)
Früher nutzten Rechenzentren ebenfalls Three-Tier. Mit virtualisierten, verteilten Anwendungen stieg der **East-West-Verkehr** (Server ↔ Server) stark an – Three-Tier erzeugt dabei Engpässe und unterschiedliche Latenzen. Lösung: **Spine-Leaf** (z. B. Cisco ACI).
Regeln:
1. **Jeder Leaf ist mit jedem Spine verbunden.**
2. Leaf-Switches sind **nicht** untereinander verbunden, Spines ebenfalls nicht.
3. **Endgeräte/Server nur an Leaf-Switches.**
4. Der Weg über die Spines wird verteilt (ECMP) → **gleiche Hop-Zahl** zwischen beliebigen Servern → **konstante Latenz**.

### North-South vs. East-West
- **North-South**: Verkehr zwischen Rechenzentrum und außen (Clients, Internet).
- **East-West**: Verkehr innerhalb des Rechenzentrums (Server zu Server).

### WAN-Topologien
- **Point-to-Point** (z. B. Mietleitung zwischen zwei Standorten).
- **Hub-and-Spoke**: Zentrale (Hub) ist mit allen Filialen (Spokes) verbunden; Filialverkehr läuft über die Zentrale.
- **Full/Partial Mesh**: Standorte direkt verbunden.
- **Single-homed/Dual-homed/Multihomed/Dual-multihomed**: eine oder mehrere Verbindungen zu einem oder mehreren Providern (Redundanz der Internetanbindung).
Technologien: Mietleitung (seriell, HDLC/PPP), **Metro Ethernet**, **MPLS**, **Internet-VPN** (IPsec), DSL, Kabel, Glasfaser, 4G/5G – Details in `ccna-vpn-wan`.

### SOHO (Small Office/Home Office)
Kleines Büro oder Heimnetz mit wenigen Geräten: **ein Gerät** („Home Router“, „Wireless Router“) vereint **Router, Switch, Firewall, WLAN-AP und Modem** (oft auch DHCP-Server, DNS-Proxy, NAT).

### On-Premises vs. Cloud
| Modell | Hardware gehört | Standort | Verantwortung für Strom/Kühlung |
|---|---|---|---|
| **On-Premises** | Firma | Firmengelände | Firma |
| **Colocation** | Firma | fremdes Rechenzentrum | RZ-Betreiber (Raum, Strom, Kühlung); Geräte bleiben Kundensache |
| **Cloud** | Anbieter | Rechenzentrum des Anbieters | Anbieter; Abrechnung nach Nutzung |
Cloud-Bereitstellungsmodelle (NIST SP 800-145): **Public, Private, Community, Hybrid**. Servicemodelle: **IaaS, PaaS, SaaS** – siehe `ccna-virtualisierung-cloud`.

## Einfach

Denk an eine **Schule**:
- **Access Layer** = die **Klassenzimmer-Steckdosenleisten**: Hier stecken die Schüler (PCs) ihre Geräte ein. Hier steht auch der Lehrer, der kontrolliert, wer reinkommt (Port Security).
- **Distribution Layer** = der **Flur auf jeder Etage**: Alle Klassenzimmer münden hier. Hier wird entschieden, ob man zu einer anderen Klasse (anderes VLAN) darf.
- **Core Layer** = das **große Treppenhaus**, das alle Gebäude verbindet. Dort wird nicht kontrolliert, sondern nur **gerannt** – so schnell wie möglich.

Hat die Schule nur ein kleines Gebäude, lässt man das Treppenhaus weg: **Two-Tier**.

Im **Rechenzentrum** ist es anders: Dort reden die Server ständig **miteinander** (wie Kollegen in einem Großraumbüro). Damit keiner weite Wege hat, baut man **Spine-Leaf**: Jeder Schreibtisch (Leaf) hat einen direkten Draht zu **jeder** Hauptleitung (Spine). Egal wohin – es sind immer gleich viele Schritte.

Zu Hause hast du **SOHO**: Deine **Fritzbox** ist Router, Switch, WLAN, Firewall und Modem in einem Kasten.

**Cloud** heißt: Du mietest den Computer bei jemand anderem, statt ihn selbst in den Keller zu stellen – wie ein Mietauto statt eines eigenen Autos.

## Merksatz
- **Access – Distribution – Core: „Anschließen – Aufteilen – Ab die Post“.**
- **Core: schnell, Layer 3, keine Filter.**
- **Spine-Leaf: jeder Leaf an jeden Spine, Server nur am Leaf.**
- **SOHO = alles in einer Box.**

## Prüfungsfalle
- Spine-Leaf: Leafs sind **nicht** untereinander verbunden – „Each leaf switch is connected to each spine switch“ (200-301 Frage 15).
- Port Security, DAI und QoS-Marking gehören in den **Access Layer**, nicht in den Core.
- Two-Tier heißt **Collapsed Core**, nicht „Collapsed Distribution“.
- Colocation ist **keine** Cloud – die Hardware gehört weiter dem Kunden.
- Obsidian-Notiz „Netzwerke im Allgemeinen“ listet WAN/MAN/GAN unter der Überschrift „Private Netze“ – richtig ist: **öffentliche** Netze (Weitverkehrsnetze).

## Grafik
### Three-Tier-Aufbau
1. PC1: Steckt am Access-Switch ASW1
2. PC1 -> ASW1: Frame im VLAN 10
3. ASW1 -> DSW1: Uplink-Trunk zur Distribution
4. DSW1: Routet zwischen VLANs (SVI)
5. DSW1 -> CSW1: Layer-3-Link in den Core
6. CSW1 -> DSW2: Schneller Transport ins Nachbargebäude
7. DSW2 -> ASW2: Zustellung an Ziel-Access-Switch

### Spine-Leaf East-West
1. SRV1 -> Leaf1: Paket an SRV9
2. Leaf1 -> Spine2: ECMP wählt einen Spine
3. Spine2 -> Leaf4: Weiter zum Ziel-Leaf
4. Leaf4 -> SRV9: Zustellung – immer 3 Hops

## Übungen
- A: Wie viele Verbindungen braucht ein Full Mesh mit 6 Routern? | L: n·(n−1)/2 = 6·5/2 = 15 Verbindungen.
- A: Spine-Leaf mit 4 Spines und 10 Leafs – wie viele Uplinks? | L: Jeder Leaf an jeden Spine: 4 · 10 = 40 Links.
- A: Ab wann empfiehlt Cisco einen Core-Layer? | L: Wenn mehr als drei Distribution-Layer (Paare) an einem Standort vorhanden sind.
- A: Ordne zu: Port Security, Inter-VLAN-Routing, schneller L3-Transport | L: Access – Distribution – Core.

## Karteikarten
- F: Was ist ein Collapsed Core? | A: Two-Tier-Design: Core- und Distribution-Funktion in einer Ebene.
- F: Welche Aufgaben hat der Access Layer? | A: Endgeräte anschließen, PoE, QoS-Markierung, Port Security, DHCP Snooping, DAI.
- F: Welche Aufgabe hat der Distribution Layer? | A: Access-Switches aggregieren, L2/L3-Grenze, Verbindung zu WAN/Internet.
- F: Was soll im Core vermieden werden? | A: CPU-intensive Funktionen wie Filter und QoS-Klassifizierung; außerdem Spanning Tree (nur L3).
- F: Regeln von Spine-Leaf? | A: Jeder Leaf an jeden Spine, keine Leaf-Leaf- oder Spine-Spine-Links, Server nur an Leafs.
- F: Was ist East-West-Verkehr? | A: Verkehr zwischen Servern innerhalb des Rechenzentrums.
- F: Was vereint ein SOHO-Router? | A: Router, Switch, Firewall, WLAN-AP, Modem (meist auch DHCP/NAT).
- F: Unterschied On-Premises und Colocation? | A: Colocation: eigene Hardware im fremden Rechenzentrum, das Raum, Strom und Kühlung stellt.
- F: Was ist Hub-and-Spoke? | A: WAN-Topologie, in der alle Filialen nur mit der Zentrale verbunden sind.
- F: Wie berechnet man die Zahl der Links im Full Mesh? | A: n·(n−1)/2.

## Quiz
? Wie sind Switches in einer Spine-Leaf-Topologie verbunden?
* Jeder Leaf-Switch ist mit jedem Spine-Switch verbunden
- Jeder Leaf-Switch ist mit genau einem Spine-Switch verbunden
- Leaf-Switches sind ringförmig untereinander verbunden
- Jeder Leaf-Switch hängt an einem zentralen Leaf-Switch
@ 200-301.pdf Question 15

? Welche Ebene ist im Three-Tier-Design auf schnellen Transport ohne Filter ausgelegt?
* Core
- Access
- Distribution
- Edge

? Wo wird Port Security typischerweise konfiguriert?
* Access Layer
- Core Layer
- Spine Layer
- WAN-Edge

? Wie nennt man ein Two-Tier-Design noch?
* Collapsed Core
- Spine-Leaf
- Hub-and-Spoke
- Full Mesh

? Welche Aussage über Colocation stimmt?
* Die Hardware gehört dem Kunden, steht aber im Rechenzentrum eines Anbieters
- Die Hardware gehört dem Cloud-Anbieter und wird nach Nutzung abgerechnet
- Alles steht auf dem eigenen Firmengelände
- Es handelt sich um eine Public Cloud

? Warum wurde Spine-Leaf in Rechenzentren eingeführt?
* Wegen stark gestiegenem East-West-Verkehr zwischen Servern
- Weil Spanning Tree im Rechenzentrum Pflicht ist
- Um Kosten für Glasfaser zu sparen
- Weil Clients direkt an Spines angeschlossen werden müssen

? Wie viele Links hat ein Full Mesh aus 5 Geräten?
* 10
- 20
- 5
- 25

? Welche Geräte vereint ein typischer SOHO-Router?
* Router, Switch, Firewall, Access Point und Modem
- Nur Router und Modem
- Core- und Distribution-Switch
- WLC und Spine-Switch

## Reihenfolge
### Weg eines Pakets im Three-Tier-Campus (Gebäude A nach B)
1. Access-Switch Gebäude A
2. Distribution-Switch Gebäude A
3. Core-Switch
4. Distribution-Switch Gebäude B
5. Access-Switch Gebäude B

## Spickzettel
- Two-Tier = Access + Distribution (Collapsed Core)
- Three-Tier = + Core (schnell, L3, keine Filter), ab >3 Distribution-Paaren
- Spine-Leaf: Leaf↔jeder Spine, Server nur am Leaf, East-West
- SOHO = Router+Switch+FW+AP+Modem
- On-Prem · Colocation · Cloud (Public/Private/Community/Hybrid)
