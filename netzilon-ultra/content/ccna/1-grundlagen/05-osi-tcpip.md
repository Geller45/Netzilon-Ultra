---
id: ccna-osi-tcpip
bereich: CCNA
block: CCNA 1.0
kapitel: Network Fundamentals
titel: OSI-Modell, TCP/IP-Modell, Kapselung und „Life of a Packet“
stufe: Einsteiger
fach: TCP/IP – CCNA – Basic
pruefungen: [CCNA, AP1, AP2]
quellen: [CCNA_200-301_Notes_-_Jeremys_IT_Lab.pdf, OSI_Schichtenmodell.pdf, OSI - TCP-IP Model.md, Netzwerke im Allgemeinen.md, cisco_100-101.pdf, Netzwerkgrundlagen_Basic.pdf]
verweise: [ap1-a4-netzwerkgrundlagen, ccna-tcp-udp, ccna-switching-mac-arp, ccna-ipv4-adressierung, netz-ethernet-csma-cd-frame]
---

## Profi

### Wozu Modelle?
Netzwerkmodelle **ordnen Protokolle und Standards** in Schichten. Jede Schicht bietet der darüberliegenden einen **Dienst** (Service) über eine **Schnittstelle** (Interface, vertikal im selben System) und spricht mit der gleichen Schicht der Gegenseite über ein **Protokoll** (horizontal, zwischen Systemen).

### OSI-Modell (ISO, 1984) – „De-jure-Standard“
| Nr. | Schicht (EN) | deutsch | Aufgabe | PDU | Beispiele | Geräte |
|---|---|---|---|---|---|---|
| 7 | Application | Anwendung | Schnittstelle zur Anwendung, Kommunikationspartner finden | Daten | HTTP(S), DNS, DHCP, FTP, SMTP, SNMP, SSH | – |
| 6 | Presentation | Darstellung | Format, Kodierung, Verschlüsselung, Kompression | Daten | ASCII, UTF-8, JPEG, MPEG, TLS* | – |
| 5 | Session | Sitzung | Sitzungen auf-/abbauen, synchronisieren | Daten | RPC, NetBIOS, SIP, SMB-Session | – |
| 4 | Transport | Transport | Ende-zu-Ende, **Segmentierung**, Ports, Zuverlässigkeit, Flusskontrolle | **Segment** (TCP) / Datagramm (UDP) | TCP, UDP | Firewall (L4) |
| 3 | Network | Vermittlung | **logische Adressierung** (IP), Wegwahl | **Paket** | IPv4, IPv6, ICMP, OSPF, IPsec | **Router**, L3-Switch |
| 2 | Data Link | Sicherung | **Node-to-Node**, physische Adressierung (MAC), Fehlererkennung (FCS) | **Frame** | Ethernet, 802.11, PPP, HDLC, STP, ARP** | **Switch**, Bridge, AP |
| 1 | Physical | Bitübertragung | Bits als elektrische/optische/Funk-Signale, Stecker, Pegel | **Bit** | 1000BASE-T, RJ45, LWL, DSL-Physik | Hub, Repeater, Kabel |
\* TLS wird je nach Lehrbuch Schicht 5, 6 oder 4/7 zugeordnet. \*\* ARP sitzt zwischen 2 und 3 (meist „Schicht 2,5“ oder L2).

Eselsbrücke von oben nach unten: **„Alle Deutschen Schüler Trinken Verschiedene Sorten Bier“** (Anwendung – Darstellung – Sitzung – Transport – Vermittlung – Sicherung – Bitübertragung). Englisch von unten: **„Please Do Not Throw Sausage Pizza Away“**.

### TCP/IP-Modell (DoD, DARPA) – „De-facto-Standard“
| TCP/IP | entspricht OSI | Protokolle |
|---|---|---|
| Application (Anwendung) | 5–7 | HTTP, DNS, DHCP, SSH, SNMP |
| Transport | 4 | TCP, UDP |
| Internet | 3 | IPv4, IPv6, ICMP |
| Network Access / Link (Netzzugang) | 1–2 | Ethernet, Wi-Fi |
Manche Bücher (auch Cisco) nutzen ein **5-Schichten-Modell** mit getrennter Data-Link- und Physical-Schicht. Die **Network-Access-Schicht** kombiniert OSI 1 und 2 (100-101 Frage 3).

### Kapselung (Encapsulation)
Auf dem Weg nach unten fügt jede Schicht Steuerinformationen hinzu:
1. Anwendung erzeugt **Daten**.
2. Transport fügt **L4-Header** (Ports, Sequenznummern) hinzu → **Segment**.
3. Vermittlung fügt **L3-Header** (Quell-/Ziel-IP, TTL) hinzu → **Paket**.
4. Sicherung fügt **L2-Header** (Ziel-/Quell-MAC, Typ) **und Trailer** (FCS) hinzu → **Frame**.
5. Bitübertragung sendet **Bits**.
Beim Empfänger läuft die **Entkapselung** (De-encapsulation) von unten nach oben.
- **Adjacent-Layer Interaction**: Schichten auf **demselben** Host reichen sich Daten weiter.
- **Same-Layer Interaction**: die gleiche Schicht auf **verschiedenen** Hosts (z. B. Browser ↔ Webserver auf Schicht 7).

### Life of a Packet (PC1 → R1 → R2 → PC2)
1. PC1 stellt per **AND-Verknüpfung** fest: Ziel liegt in fremdem Netz → Paket geht an das **Standardgateway**.
2. PC1 kennt die MAC des Gateways nicht → **ARP-Request (Broadcast)**, R1 antwortet per **ARP-Reply (Unicast)**.
3. PC1 sendet Frame: **Ziel-MAC = R1**, Ziel-IP = PC2.
4. R1 entfernt den L2-Header, schaut in die Routingtabelle, verringert **TTL um 1**, berechnet die IP-Prüfsumme neu, baut einen **neuen Frame** mit Quell-MAC = R1-Ausgang, Ziel-MAC = R2.
5. R2 macht dasselbe Richtung PC2 (ggf. ARP für PC2).
**Wichtig:** **IP-Adressen bleiben Ende-zu-Ende gleich** (ohne NAT), **MAC-Adressen ändern sich bei jedem Hop**. Im **Ethernet-Header** steht die **Ziel-MAC vor der Quell-MAC**, im **IP-Header** die **Quell-IP vor der Ziel-IP**.

### Normungsgremien
- **ISO**: OSI-Modell. **IEEE**: 802.x (802.3 Ethernet, 802.11 WLAN, 802.1Q VLAN, 802.15 Bluetooth/PAN, 802.16 WiMAX). **IETF**: Internetprotokolle als **RFCs**. **W3C**: Webstandards (HTML, CSS, XML). **IANA**: Ports, Adressräume.

## Einfach

Stell dir vor, du schickst ein **Geschenk per Post**:
1. **Anwendung**: Du schreibst einen Brief (die Daten).
2. **Darstellung**: Du schreibst ihn so, dass der andere ihn lesen kann (Sprache, vielleicht Geheimschrift).
3. **Sitzung**: Du verabredest: „Ich schicke dir jetzt drei Briefe hintereinander.“
4. **Transport**: Ist der Brief zu dick, teilst du ihn in mehrere Umschläge und nummerierst sie (Segmente). Du schreibst dazu, **für wen im Haus** er ist (Port – z. B. „für Papa“).
5. **Vermittlung**: Auf den Umschlag kommt die **Adresse mit Stadt** (IP-Adresse).
6. **Sicherung**: Der Postbote klebt einen **Zettel für die nächste Station** drauf: „Von Postamt A zu Postamt B“ (MAC-Adresse). An jeder Station wird dieser Zettel **ausgetauscht** – die Hausadresse bleibt gleich!
7. **Bitübertragung**: Der Lastwagen fährt über die Straße (Kabel, Funk).

Beim Empfänger wird alles **wieder ausgepackt** – Schicht für Schicht, von unten nach oben.

Das **TCP/IP-Modell** ist die **praktische Kurzversion** mit nur vier Stockwerken: Anwendung, Transport, Internet, Netzzugang. Das Internet benutzt wirklich TCP/IP – OSI ist eher die **Landkarte zum Erklären**.

## Merksatz
- **„Alle Deutschen Schüler Trinken Verschiedene Sorten Bier“** (7 → 1).
- **Daten – Segment – Paket – Frame – Bit.**
- **IP bleibt, MAC wechselt** – an jedem Router.
- **Router = 3, Switch = 2, Hub = 1.**

## Prüfungsfalle
- Die Zieladresse eines Hosts in einem **anderen Netz** steht im **Network-Layer-Header** (Schicht 3), nicht im Data-Link-Header (100-101 Frage 2).
- **Zuverlässigkeit, Flusskontrolle, Sequenzierung, Bestätigungen** = **Schicht 4** (100-101 Frage 10).
- Obsidian-Notiz „OSI – TCP-IP Model“ ordnet **DHCP** der Schicht 3 zu – falsch: DHCP ist ein **Anwendungsprotokoll** (Schicht 7, nutzt UDP 67/68). ARP wird dort ebenfalls Schicht 3 zugeordnet – üblich ist **Schicht 2** (bzw. 2,5). Ethernet/Wi-Fi gehören zu **Schicht 1 und 2**, nicht nur Schicht 1.
- Jeremys Notes schreiben in Kapitel 12 „In a TCP HEADER source IP comes before destination IP“ – gemeint ist der **IP-Header**; TCP enthält **keine** IP-Adressen, sondern Ports.
- Der Ethernet-**Trailer** (FCS) wird nur auf Schicht 2 angefügt – andere Schichten haben nur Header.

## Grafik
### Kapselung
1. Anwendung: Daten „GET /index.html“
2. Transport: + TCP-Header (Quellport 50000, Zielport 80) = Segment
3. Vermittlung: + IP-Header (192.168.1.10 → 203.0.113.80) = Paket
4. Sicherung: + Ethernet-Header und FCS = Frame
5. Bitübertragung: 0101… auf das Kabel

### Life of a Packet
1. PC1 -> SW1: ARP-Request Broadcast „Wer hat 192.168.1.1?“
2. R1 -> PC1: ARP-Reply Unicast mit MAC von R1
3. PC1 -> R1: Frame Ziel-MAC R1, Ziel-IP PC2
4. R1: TTL 128 → 127, neuer Frame
5. R1 -> R2: Frame Ziel-MAC R2, Ziel-IP PC2 unverändert
6. R2 -> PC2: Frame Ziel-MAC PC2, Zustellung

## Lab
**Packet Tracer – Simulation Mode** (PC1 – SW1 – R1 – R2 – SW2 – PC2)

### Cisco IOS
1. Netz aufbauen, IP-Adressen vergeben (PC1 192.168.1.10/24, GW .1; PC2 192.168.2.10/24, GW .1), statische Routen auf R1/R2.
2. In Packet Tracer **Simulation** einschalten, Filter auf ICMP und ARP.
3. `ping 192.168.2.10` auf PC1 und jedes Paket anklicken: Reiter **OSI Model** zeigt pro Gerät die Schichten; **Inbound/Outbound PDU Details** zeigen, dass sich MAC-Adressen ändern, die IP aber nicht.
```
R1# show arp
R1# show ip route
R1# debug ip packet
R1# undebug all
```

## Befehle
- `show arp` – ARP-Tabelle eines Cisco-Geräts
- `arp -a` – ARP-Cache unter Windows
- `ping` – Erreichbarkeit (ICMP Echo Request/Reply)
- `traceroute` / `tracert` – Hops über TTL-Ablauf ermitteln
- `debug ip packet` – IP-Weiterleitung live anzeigen (nur im Lab)

## Übungen
- A: Ordne zu: TCP, IP, Ethernet, HTTP, Bits auf Kupfer | L: TCP 4, IP 3, Ethernet 2 (und 1), HTTP 7, Bits 1.
- A: Welche Schicht des TCP/IP-Modells vereint OSI 1 und 2? | L: Network Access (Netzzugangsschicht).
- A: Welche Felder ändert ein Router beim Weiterleiten (ohne NAT)? | L: Quell- und Ziel-MAC (neuer Frame), TTL, IP-Header-Prüfsumme – nicht die IP-Adressen.
- A: Was ist der Unterschied zwischen Schnittstelle (Interface) und Protokoll im Schichtenmodell? | L: Schnittstelle = vertikal zwischen benachbarten Schichten im selben System; Protokoll = horizontal zwischen gleichen Schichten verschiedener Systeme.

## Karteikarten
- F: Wie heißt die PDU auf Schicht 4, 3 und 2? | A: Segment, Paket, Frame.
- F: Welche Schicht ist für logische Adressierung zuständig? | A: Schicht 3 (Vermittlung).
- F: Welche Schicht sorgt für Node-to-Node-Zustellung und MAC-Adressierung? | A: Schicht 2 (Sicherung/Data Link).
- F: Was ist Kapselung? | A: Jede Schicht fügt beim Senden Header (und auf L2 Trailer) hinzu.
- F: Welche Adressen ändern sich auf dem Weg durch Router? | A: Die MAC-Adressen (pro Hop), IP-Adressen bleiben gleich.
- F: Wie viele Schichten hat das TCP/IP-Modell? | A: Vier: Anwendung, Transport, Internet, Netzzugang.
- F: Wer hat das OSI-Modell veröffentlicht? | A: Die ISO (1984).
- F: Was ist Same-Layer Interaction? | A: Kommunikation der gleichen Schicht auf verschiedenen Hosts.
- F: Auf welcher Schicht arbeiten Zuverlässigkeit, Sequenzierung und Flusskontrolle? | A: Schicht 4 (Transport).
- F: Welches Gremium veröffentlicht RFCs? | A: Die IETF.

## Quiz
? Welcher OSI-Header enthält die Adresse eines Zielhosts in einem anderen Netz?
* Network (Schicht 3)
- Data Link (Schicht 2)
- Transport (Schicht 4)
- Session (Schicht 5)
@ cisco_100-101.pdf Question 2

? Welche Schicht des TCP/IP-Stacks vereint die OSI-Schichten Physical und Data Link?
* Network Access Layer
- Internet Layer
- Transport Layer
- Application Layer
@ cisco_100-101.pdf Question 3

? Welche OSI-Schicht steuert die Zuverlässigkeit über Flusskontrolle, Sequenzierung und Bestätigungen?
* Transport
- Network
- Data Link
- Physical
@ cisco_100-101.pdf Question 10

? Wie heißt die PDU der Schicht 2?
* Frame
- Paket
- Segment
- Bit

? Was ändert ein Router beim Weiterleiten eines Pakets ohne NAT?
* Die Quell- und Ziel-MAC-Adresse
- Die Quell- und Ziel-IP-Adresse
- Die Zielportnummer
- Die Sequenznummer von TCP

? Welchem Gremium verdanken wir die 802.x-Standards?
* IEEE
- IETF
- W3C
- ISO

? Auf welcher Schicht arbeitet DHCP?
* Anwendungsschicht (7)
- Vermittlungsschicht (3)
- Sicherungsschicht (2)
- Transportschicht (4)
! DHCP ist ein Anwendungsprotokoll über UDP 67/68.

? Welche Reihenfolge der Kapselung stimmt?
* Daten – Segment – Paket – Frame – Bits
- Daten – Paket – Segment – Frame – Bits
- Bits – Frame – Paket – Segment – Daten
- Segment – Daten – Paket – Frame – Bits

## Zuordnen
### Protokoll zu OSI-Schicht
- HTTP => Schicht 7
- TLS => Schicht 6 (Darstellung, je nach Lehrbuch 4–7)
- TCP => Schicht 4
- OSPF => Schicht 3
- Ethernet-Frame => Schicht 2
- RJ45/1000BASE-T => Schicht 1

## Reihenfolge
### OSI-Schichten von unten nach oben
1. Physical (Bitübertragung)
2. Data Link (Sicherung)
3. Network (Vermittlung)
4. Transport
5. Session (Sitzung)
6. Presentation (Darstellung)
7. Application (Anwendung)

## Freitext
- F: Erläutern Sie den Unterschied zwischen OSI- und TCP/IP-Modell. | M: OSI ist ein theoretisches 7-Schichten-Referenzmodell der ISO (De-jure-Standard); TCP/IP ist das praktisch eingesetzte 4-Schichten-Modell des DoD (De-facto-Standard), Anwendung umfasst OSI 5–7, Netzzugang OSI 1–2. | P: 4
- F: Beschreiben Sie, wie ein Router ein Paket weiterleitet. | M: Frame empfangen, FCS prüfen, L2-Header entfernen, Ziel-IP mit Routingtabelle vergleichen (Longest Prefix Match), TTL −1, Prüfsumme neu, neuen L2-Header für nächsten Hop (ggf. ARP) bauen, senden. | P: 5

## Spickzettel
- 7 Anwendung · 6 Darstellung · 5 Sitzung · 4 Transport · 3 Vermittlung · 2 Sicherung · 1 Bitübertragung
- PDU: Daten · Segment · Paket · Frame · Bit
- TCP/IP: Anwendung · Transport · Internet · Netzzugang
- IP bleibt gleich, MAC wechselt pro Hop, TTL −1
- Eth-Header: Ziel-MAC vor Quell-MAC; IP-Header: Quell-IP vor Ziel-IP
