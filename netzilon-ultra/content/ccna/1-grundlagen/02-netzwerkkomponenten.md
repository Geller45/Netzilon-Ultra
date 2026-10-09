---
id: ccna-netzwerkkomponenten
bereich: CCNA
block: CCNA 1.1
kapitel: Network Fundamentals
titel: Netzwerkkomponenten – Router, Switch, Firewall, AP, WLC, PoE
stufe: Einsteiger
fach: TCP/IP – CCNA – Basic
pruefungen: [CCNA, AP1, AP2]
quellen: [CCNA_200-301_Notes_-_Jeremys_IT_Lab.pdf, 200_301_CCNA_v1.0_2.pdf, Netzwerkgrundlagen_Basic.pdf, cisco_100-101.pdf]
verweise: [ap1-a4-topologie, ccna-architekturen, ccna-wlan-architektur, ccna-switching-mac-arp, ap1-a2-netzteil, ap1-a5-firewall]
---

## Profi

### Grundbegriffe
Ein **Netzwerk** ist ein digitales Telekommunikationsnetz, in dem **Knoten** (Nodes) **Ressourcen** teilen. Ein **Client** nutzt einen Dienst, ein **Server** stellt ihn bereit. Ein Gerät kann je nach Situation beides sein (Peer-to-Peer).

### Komponenten nach Blueprint 1.1
| Komponente | OSI | Aufgabe | Merkmal |
|---|---|---|---|
| **Router** | 3 | verbindet **verschiedene Netze/LANs**, wählt Wege anhand der **Routingtabelle**, Zugang zum Internet/WAN | wenige Ports, trennt Broadcastdomänen, Standardgateway der Hosts |
| **Layer-2-Switch** | 2 | verbindet Hosts **innerhalb eines LANs**, lernt MAC-Adressen, leitet Frames gezielt weiter | viele Ports (24/48), jeder Port eigene Kollisionsdomäne, VLAN-fähig |
| **Layer-3-Switch** (Multilayer) | 2+3 | Switching **und** Routing, **SVIs** pro VLAN, Routed Ports (`no switchport`) | Inter-VLAN-Routing in Hardware (schnell), `ip routing` |
| **Firewall** | 3/4/7 | kontrolliert ein-/ausgehenden Verkehr nach Regeln, **zustandsbehaftet** (stateful) | innen/außen platzierbar; Host-Firewall = Software auf dem PC |
| **NGFW** (Next-Generation Firewall) | bis 7 | zusätzlich **Anwendungserkennung** (AVC), **URL-Filter**, **IPS**, Malware-Schutz (AMP), TLS-Inspektion | z. B. Cisco Secure Firewall (Firepower) |
| **IPS** (Intrusion Prevention System) | bis 7 | erkennt Angriffe anhand von **Signaturen**/Anomalien und **blockiert** sie inline | IDS nur erkennen/melden, IPS verhindern |
| **Access Point (AP)** | 2 | Übergang **WLAN ↔ LAN** (Bridge zwischen 802.11 und 802.3) | autonom oder lightweight (mit WLC) |
| **WLC** (Wireless LAN Controller) | 2/3 | zentrale Verwaltung vieler **Lightweight-APs** (CAPWAP), RF-Management, Roaming, Sicherheit | Hardware, virtuell, Cloud (Meraki) oder im Switch eingebettet |
| **Controller** (Catalyst Center, ehem. DNA Center) | – | **SDN-Controller** für Campus: Automatisierung, Assurance, Richtlinien | Northbound-REST-API |
| **Endpunkte** (Endpoints) | – | Endgeräte: PCs, Notebooks, Smartphones, IP-Telefone, Drucker, IoT-Sensoren, Kameras | Quelle/Ziel des Verkehrs |
| **Server** | – | stellen Dienste bereit (Web, Mail, DNS, DHCP, Datei) | meist feste IP, oft redundante NICs |

### PoE (Power over Ethernet)
**PoE** versorgt Geräte über das Netzwerkkabel mit Strom. Begriffe: **PSE** (Power Sourcing Equipment, meist der Switch) und **PD** (Powered Device: IP-Telefon, AP, Kamera). Der Switch prüft zuerst per **niedriger Spannung/Signatur**, ob ein PoE-Gerät angeschlossen ist und welche **Klasse** es braucht, und liefert dann nur so viel Leistung wie nötig.
| Standard | Name | Leistung am PSE-Port | genutzte Paare |
|---|---|---|---|
| Cisco Inline Power | (proprietär, alt) | 7 W | 2 |
| **802.3af** | PoE | **15,4 W** | 2 |
| **802.3at** | PoE+ | **30 W** | 2 |
| Cisco UPoE | Universal PoE | 60 W | 4 |
| **802.3bt** | PoE++ (Typ 3/4) | **60 W / 90–100 W** | 4 |
**Power Policing** (`power inline police`) schützt vor Geräten, die zu viel ziehen: Standard-Aktion **err-disable** + Syslog; Variante `power inline police action log` startet den Port nur neu und loggt.

### Router vs. Switch – woran erkennt man es in der Prüfung?
- Hosts in **verschiedenen Subnetzen** brauchen einen **Router** (oder L3-Switch).
- Ein **Hub** (Layer 1) leitet alles an alle weiter → eine Kollisionsdomäne, Halbduplex. Ein Switch **lernt MAC-Adressen** (Frage 7 aus 100-101: „How does a switch differ from a hub?“ → *tracks MAC addresses*).
- Mietleitung (Leased Line) ins Internet → **Router mit einer Ethernet- und einer seriellen Schnittstelle** (100-101 Frage 6).

### Cisco-Gerätebeispiele
Router: ISR 1000/4000, Catalyst 8000 Edge. Switches: Catalyst 9200 (Access), 9300/9400, 9500 (Core). WLC: Catalyst 9800. Firewall: Secure Firewall 1000/3100/4200.

## Einfach

Stell dir eine **Stadt** vor:
- Die **Häuser** sind die **Endgeräte** (PC, Handy, Drucker). Dort wohnen die Daten.
- Ein **Switch** ist die **Straße mit Hausnummern** in einem Viertel. Er weiß genau, welches Haus an welcher Einfahrt liegt (MAC-Tabelle), und bringt Briefe nur dorthin.
- Ein **Router** ist die **Autobahnauffahrt** zwischen zwei Städten. Willst du in eine andere Stadt (anderes Netz), musst du über ihn.
- Die **Firewall** ist der **Grenzposten**: Sie kontrolliert, wer rein und raus darf. Eine **Next-Generation-Firewall** schaut sogar in den Kofferraum (welches Programm, welche Website).
- Ein **IPS** ist der **Spürhund** am Grenzposten: Er erkennt Schmuggler (Angriffe) und hält sie sofort fest.
- Der **Access Point** ist ein **Funkturm** im Viertel: Er verbindet Handys ohne Kabel mit der Straße.
- Der **WLC** ist die **Funkzentrale**, die alle Funktürme gleichzeitig steuert – statt jeden einzeln einzustellen.
- **Server** sind die **Rathäuser und Läden**: Sie bieten Dienste an (Webseiten, Mails).

**PoE** ist wie ein **Gartenschlauch, durch den auch Strom fließt**: Das IP-Telefon oder die Kamera braucht keine eigene Steckdose – der Switch liefert den Strom gleich mit dem Netzwerkkabel. Der Switch fragt vorher höflich: „Brauchst du Strom, und wie viel?“ So geht kein Gerät kaputt.

## Merksatz
- **Switch = innerhalb des LANs (MAC), Router = zwischen Netzen (IP).**
- **PoE 15 – PoE+ 30 – PoE++ 60/90 Watt** („af – at – bt: fünfzehn – dreißig – neunzig“).
- **IDS meldet, IPS verhindert.**
- **PSE liefert, PD verbraucht.**

## Prüfungsfalle
- Ein L2-Switch **verringert nicht** die Zahl der Broadcastdomänen – nur Kollisionsdomänen (jeder Port eine eigene).
- Firewalls arbeiten nicht nur auf Layer 3: Stateful bis Layer 4, NGFW bis Layer 7.
- PoE-Leistungen: 15,4 W/30 W sind Werte **am Switch-Port**; am Gerät kommen weniger an (802.3af ca. 12,95 W, 802.3at ca. 25,5 W).
- Ein Layer-3-Switch routet erst nach `ip routing`.

## Grafik
### Paket durch die Komponenten
1. PC1: Erzeugt Paket an Webserver im Internet
2. PC1 -> SW1: Frame an MAC des Gateways
3. SW1 -> R1: Frame wird gezielt weitergeleitet (MAC-Tabelle)
4. R1 -> FW1: Router wählt Weg Richtung Internet
5. FW1: Prüft Regel und Anwendung (NGFW/IPS)
6. FW1 -> Internet: Paket darf passieren

### PoE-Erkennung
1. SW1 -> Telefon: Kleine Prüfspannung (Detection)
2. Telefon -> SW1: Signaturwiderstand und Klasse
3. SW1: Reserviert Leistung im PoE-Budget
4. SW1 -> Telefon: Volle Spannung, Telefon bootet

## Lab
**Packet Tracer – Geräte erkennen und PoE prüfen** (SW1 = Catalyst 3560/9200, IP-Phone 7960, R1 = ISR 4331)

### Cisco IOS
1. SW1 und R1 hinstellen, PC1 und ein IP-Telefon an SW1, R1 an SW1 Gi0/1.
2. Auf SW1 die Ports und PoE anzeigen.
```
SW1# show interfaces status
SW1# show power inline
SW1# show power inline fastEthernet0/2
SW1# configure terminal
SW1(config)# interface fastEthernet0/2
SW1(config-if)# power inline police
SW1(config-if)# end
SW1# show cdp neighbors
```
3. Auf R1: `R1# show ip interface brief` – Router-Ports sind standardmäßig **administratively down**.

## Befehle
- `show power inline` – PoE-Budget und Verbrauch je Port
- `power inline police` – Power Policing (Standard: err-disable)
- `show interfaces status` – Ports, VLAN, Duplex, Speed (Switch)
- `show ip interface brief` – Schnittstellen, IP, Status/Protocol
- `show version` – Modell, IOS-Version, Seriennummer
- `ip routing` – Routing auf Layer-3-Switch aktivieren

## Übungen
- A: Welches Gerät verbindet zwei unterschiedliche IP-Netze? | L: Router (oder Layer-3-Switch).
- A: Welches Gerät braucht man, um an einer Mietleitung (seriell) ins Internet zu gehen, und welche Schnittstellen mindestens? | L: Einen Router mit einer Ethernet- und einer seriellen Schnittstelle.
- A: Ein AP braucht 25 W. Welcher PoE-Standard reicht mindestens? | L: 802.3at (PoE+, 30 W am Port).
- A: Nenne drei Zusatzfunktionen einer NGFW gegenüber einer klassischen Firewall. | L: Anwendungserkennung (AVC), integriertes IPS, URL-Filter, Malware-Schutz, TLS-Inspektion.

## Karteikarten
- F: Auf welcher OSI-Schicht arbeitet ein Router? | A: Schicht 3 (Vermittlung/Network).
- F: Was unterscheidet einen Switch von einem Hub? | A: Der Switch lernt MAC-Adressen und leitet Frames gezielt weiter; der Hub sendet alles an alle.
- F: Was ist eine SVI? | A: Switch Virtual Interface – virtuelle Layer-3-Schnittstelle eines VLANs auf einem L3-Switch.
- F: Unterschied IDS und IPS? | A: IDS erkennt und meldet, IPS liegt inline und blockiert.
- F: Was macht ein WLC? | A: Zentrale Verwaltung von Lightweight-APs (CAPWAP), Konfiguration, RF, Roaming, Sicherheit.
- F: Was bedeuten PSE und PD? | A: Power Sourcing Equipment (liefert Strom, z. B. Switch) und Powered Device (verbraucht, z. B. Telefon).
- F: Leistung 802.3af / 802.3at / 802.3bt? | A: 15,4 W / 30 W / 60–90 W am Port.
- F: Was ist Power Policing? | A: Begrenzung der PoE-Leistung; bei Überschreitung err-disable und Syslog (Standard).
- F: Was ist eine NGFW? | A: Firewall mit Anwendungserkennung, IPS, URL-Filter und Malware-Schutz bis Layer 7.
- F: Wie heißt Ciscos Campus-Controller heute? | A: Cisco Catalyst Center (früher DNA Center).

## Quiz
? Welches Gerät trennt Broadcastdomänen?
* Router
- Hub
- Layer-2-Switch
- Repeater

? Welcher PoE-Standard liefert bis zu 30 W am Port?
* IEEE 802.3at
- IEEE 802.3af
- IEEE 802.3bt
- IEEE 802.3ab
! 802.3ab ist 1000BASE-T, kein PoE-Standard.

? Wie unterscheidet sich ein Switch von einem Hub?
* Der Switch merkt sich die MAC-Adressen angeschlossener Geräte
- Der Switch arbeitet auf einer niedrigeren OSI-Schicht
- Der Switch reduziert die Zahl der Broadcastdomänen
- Der Switch verursacht keinerlei Latenz
@ cisco_100-101.pdf Question 7

? Was unterscheidet ein IPS von einem IDS?
* Das IPS blockiert erkannte Angriffe inline
- Das IPS arbeitet nur auf Layer 2
- Das IPS benötigt keine Signaturen
- Das IPS ersetzt die Firewall vollständig

? Wofür ist ein WLC zuständig?
* Zentrale Steuerung von Lightweight Access Points
- Vergabe von IP-Adressen an PCs
- Übersetzung privater in öffentliche Adressen
- Zeitsynchronisation im Netzwerk

? Welcher Befehl aktiviert Routing auf einem Layer-3-Switch?
* ip routing
- ipv4 forward
- router enable
- switchport routing

? Welches Gerät ist ein typisches PD?
* IP-Telefon
- Access-Switch
- Core-Router
- Patchpanel

? Ein Unternehmen braucht eine Mietleitung ins Internet. Was ist die Mindestausstattung?
* Ein Router mit einer Ethernet- und einer seriellen Schnittstelle
- Ein Switch mit zwei Ethernet-Schnittstellen
- Ein Router mit zwei Ethernet-Schnittstellen
- Ein Switch mit einer seriellen Schnittstelle
@ cisco_100-101.pdf Question 6

## Zuordnen
### Gerät und Aufgabe
- Router => verbindet verschiedene IP-Netze
- Switch => leitet Frames anhand der MAC-Tabelle weiter
- Access Point => Übergang WLAN zu LAN
- WLC => steuert viele Lightweight-APs
- IPS => blockiert Angriffe anhand von Signaturen
- PSE => liefert PoE-Strom

## Spickzettel
- Switch L2 (MAC), Router L3 (IP), L3-Switch = beides (SVI, ip routing)
- Hub = 1 Kollisionsdomäne, Switch = 1 pro Port
- NGFW = Firewall + AVC + IPS + URL + AMP
- PoE: af 15,4 W · at 30 W · bt 60/90 W
- PSE = Switch, PD = Telefon/AP/Kamera
