---
id: ihk-lz-nat-netzplan
bereich: Prüfung
block: IHK
kapitel: Lernzettel-Inhalte
titel: NAT/PAT und Netzwerkpläne lesen
stufe: Fortgeschritten
fach: PV – AP2
pruefungen: [AP2]
quellen: [NAT % PAT.docx, NAT % PAT.pdf, Netzwerkplan Lesen.docx, Netzwerkplan Lesen.pdf, Lernzettel_AP1AP2_2024.pdf]
verweise: [ihk-lz-protokolle, ihk-berechnungen-lernzettel, ihk-lz-vlan-wlan-ipv6]
---

## Profi

### NAT / PAT
- **NAT** (Network Address Translation): Übersetzt private IPv4-Adressen (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16) in öffentliche und umgekehrt, weil private Bereiche im Internet nicht geroutet werden.
- **PAT** (Port Address Translation, NAPT, „NAT mit Überlastung“): mehrere interne IPs → **eine** öffentliche IP, Unterscheidung über **Quell-Portnummern**.
- **Warum**: IPv4-Adressmangel, Maskierung interner Hosts (Sicherheit), Routing (Antworten müssen zurückfinden).
- **Header-Manipulation** (Client 10.0.0.1:49152 → Webserver 12.7.51.9:443):

| Feld | intern | extern (nach dem Router) |
|---|---|---|
| Quell-IP | 10.0.0.1 | öffentliche IP des Routers |
| Ziel-IP | 12.7.51.9 | unverändert |
| Quell-Port | 49152 | vom Router vergeben (z. B. 50000) |
| Ziel-Port | 443 | unverändert |
Auch bei TLS möglich: nur der Payload ist verschlüsselt, IP- und Port-Header bleiben lesbar. Zwei Clients zum gleichen Dienst → unterschiedliche Quell-Ports (NAT-Tabelle).
- **Port Forwarding (Destination NAT)**: Zugriff von außen auf Server im privaten Netz/DMZ (öffentliche IP:Port → private IP:Port).
- **Static NAT**: feste 1:1-Zuordnung. **CGNAT** (Carrier Grade NAT): Provider vergibt private (100.64/10 oder 10.x) Adressen, Nachteil: nicht von außen erreichbar. **IPv6** braucht kein NAT.

### Netzwerkplan lesen
- **Symbole**: Router (runder Knoten mit Pfeilen), Switch (Rechteck; L2 vs. L3/Core-Switch als Gateway der VLANs), Server, Clients, Cloud (Internet), Firewall.
- **Adressierung**: Netz-ID mit CIDR (192.168.1.0/24), Interfaces (eth0, g0/1, tun0) für Routing-Tabellen, Gateways (erste/letzte nutzbare IP).
- **Segmentierung**: VLANs (Tagged 802.1Q zwischen Switches, Untagged am Endgerät), **DMZ** (abgeschottet zwischen Firewall-Schnittstellen, Server aus dem Internet erreichbar), **Portchannel** (Link Aggregation).
- **WAN**: VPN-Tunnel (Site-to-Site, End-to-Site), LWL-Standleitungen, DSL/VDSL, LTE/5G.
- **Analysestrategie**: 1) Internet-Gateway und zentralen Router suchen; 2) Bereiche: LAN, DMZ, Produktion; 3) Masken prüfen, Dual Stack; 4) Paketweg vom Client zum Server verfolgen (welche Router/Firewalls?).
- **Routing-Tabelle**: Zielnetz | Maske | Next-Hop (Gateway) oder Interface | ggf. Metrik. Default Route 0.0.0.0/0.

## Einfach

**NAT: Der Postbote in der Schule.** Stell dir vor, deine Schule hat nur EINE öffentliche Adresse (die Straße), aber 500 Schüler im Haus. Wenn ein Schüler (10.0.0.1) einen Brief ins Internet schreibt, tauscht der Pförtner (Router) den Absender aus: „Schule, Hauptstraße 1“. Damit die Antwort später beim richtigen Schüler ankommt, schreibt er eine **Postfachnummer** (Port) dazu und merkt sich in einer Liste: „Postfach 50000 gehört zu Schüler 10.0.0.1.“ Das ist **PAT**.

Wenn zwei Schüler gleichzeitig zur gleichen Webseite schreiben, bekommen sie verschiedene Postfachnummern. So wird nichts verwechselt.

**Portforwarding:** Draußen will jemand zum Schulserver. Der Pförtner liest: „Anruf an Hauptstraße 1, Nebenstelle 443“ und leitet ihn an den Raum des Servers weiter.

**Netzwerkplan lesen:** Das ist wie eine Landkarte. Wolke = Internet. Rechteck = Switch (Verteiler). Runder Knoten = Router (Kreuzung). Linien = Kabel. Wenn Linien „VLAN 10“ oder „Tagged“ sagen, laufen darin mehrere Farben (VLANs) auf einer Straße.

**DMZ:** Das ist der Vorgarten der Firma. Dort steht der Webserver, den jeder besuchen darf. Das Haus (interne Netz) ist dahinter geschützt.

**Schritt für Schritt:** 1. Wo geht es ins Internet? 2. Welche Bereiche gibt es? 3. Welche Adressen und Masken stehen dran? 4. Verfolge ein Paket mit dem Finger vom Computer bis zum Ziel.

## Merksatz
- PAT = viele private IPs, eine öffentliche, Ports unterscheiden.
- Beim Verlassen: Quell-IP = öffentlich, Ziel bleibt.
- DMZ = Server für das Internet, abgeschottet vom LAN.
- Tagged zwischen Switches, untagged am Endgerät.

## Prüfungsfalle
- Bei NAT ändern sich Quell-IP und Quell-Port, **nicht** das Ziel.
- NAT bricht TLS nicht, weil Header sichtbar bleiben.
- „Private Adresse im Internet“: wird nicht geroutet.
- CGNAT: Kunde ist von außen nicht erreichbar.
- Next-Hop (IP) ≠ Interface (Port).

## Grafik
### PAT-Übersetzung
1. Client -> Router: Paket von 10.0.0.1:49152 an 12.7.51.9:443
2. Router: NAT-Tabelle: 10.0.0.1:49152 = 203.0.113.5:50000
3. Router -> Webserver: Quelle 203.0.113.5:50000, Ziel unverändert
4. Webserver -> Router: Antwort an 203.0.113.5:50000
5. Router: Tabelle nachschlagen, Ziel zurück auf 10.0.0.1:49152
6. Router -> Client: Antwort zugestellt

## Spickzettel
- PAT: viele intern → 1 öffentliche IP + Ports
- Header: Quell-IP/Port ändern, Ziel gleich
- Port Forwarding = DNAT
- DMZ: Web/Mail aus dem Internet
- Routing-Tabelle: Ziel, Maske, Next-Hop/Interface

## Karteikarten
- F: Was macht NAT? | A: Übersetzt private in öffentliche IP-Adressen
- F: Was ist PAT? | A: NAT mit Ports: viele interne Hosts teilen sich eine öffentliche IP
- F: Welche Header-Felder ändert der NAT-Router? | A: Quell-IP und Quell-Port
- F: Was ist Portforwarding? | A: Destination NAT: Zugriff von außen auf einen internen Server
- F: Was ist Static NAT? | A: Feste 1:1-Zuordnung privater zu öffentlicher IP
- F: Was ist CGNAT? | A: Provider übersetzt zentral; Kunde hat private Adresse
- F: Was ist die DMZ? | A: Abgeschotteter Bereich für aus dem Internet erreichbare Server
- F: Was ist ein Portchannel? | A: Gebündelte Leitungen (Link Aggregation)
- F: Was steht in einer Routing-Tabelle? | A: Zielnetz, Maske, Next-Hop oder Interface
- F: Erster Schritt beim Lesen eines Netzplans? | A: Internet-Gateway und zentralen Router finden

## Quiz
? Was ist PAT?
* Übersetzung vieler interner Adressen auf eine öffentliche IP mithilfe von Ports
- Übersetzung von MAC zu IP
- Verschlüsselung von Paketen
- DNS-Auflösung

? Welche Felder werden beim Verlassen des Routers verändert?
* Quell-IP und Quell-Port
- Ziel-IP und Ziel-Port
- Nur das Ziel-Port
- Nur der Payload

? Warum funktioniert NAT trotz TLS?
* Nur die Nutzdaten sind verschlüsselt, Header bleiben lesbar
- TLS ist deaktiviert
- NAT entschlüsselt TLS
- NAT arbeitet nur mit HTTP

? Wozu dient Portforwarding?
* Zugriff von außen auf Dienste im privaten Netz
- Verhindert jeden Zugriff
- Beschleunigt DNS
- Verschlüsselt WLAN

? Was ist eine DMZ?
* Abgeschotteter Bereich für öffentlich erreichbare Server
- Ein Backup-Verfahren
- Ein Routingprotokoll
- Ein Verschlüsselungsstandard

? Welcher Adressbereich ist privat?
* 172.16.0.0/12
- 8.8.8.0/24
- 100.0.0.0/8
- 200.1.1.0/24

? Welches Merkmal hat CGNAT?
* Kunde ist von außen nicht direkt erreichbar
- Kunde erhält mehrere öffentliche IPs
- Kunde braucht kein NAT
- Es wird IPv6 benötigt

? Was kennzeichnet einen Trunk-Port?
* Tagged-Übertragung mehrerer VLANs
- Untagged für ein Endgerät
- Deaktivierter Port
- Port für Strom

? Was bedeutet 0.0.0.0/0 in einer Routing-Tabelle?
* Default Route
- Loopback
- Broadcast
- Netz 192.168.0.0
