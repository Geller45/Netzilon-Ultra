---
id: ihk-lz-protokolle
bereich: Prüfung
block: IHK
kapitel: Lernzettel-Inhalte
titel: Protokolle im Überblick – DHCP, HTTP, TLS, ICMP, ARP, STP, SNMP, RADIUS, Routing, Firewall
stufe: Fortgeschritten
fach: PV – AP2
pruefungen: [AP1, AP2]
quellen: [Protokolle.docx, Protokolle.pdf, Lernzettel_AP1AP2_2024.pdf, Ergänzung Lernzettel.docx]
verweise: [ihk-lz-dns-email, ihk-fehleranalyse, ihk-lz-nat-netzplan, ihk-lz-sicherheit]
---

## Profi

### Anwendungsschicht
| Protokoll | Funktion | Troubleshooting |
|---|---|---|
| **DNS** | FQDN → IP (A/AAAA, MX, TXT), Port 53 | Ping auf IP ok, Name nicht → DNS-Server prüfen (`ipconfig /all`, z. B. 8.8.8.8) |
| **DHCP** | IP, Maske, Gateway, DNS per **DORA** (Discover, Offer, Request, Acknowledge) | 169.254.x.x (APIPA): DHCP nicht erreicht; Discover (Broadcast) kommt nicht im richtigen VLAN an → DHCP-Relay/Helper |
| **HTTP/HTTPS** | Web, HTTPS = TLS, Port 80/443 | 404; Zertifikat abgelaufen/Unknown Issuer → Kette und Systemzeit |
| **SMTP/IMAP/POP3** | Mailversand/-abruf (465, 587, 993) | Spam/Ablehnung → SPF/DKIM |
| **MQTT** | leichtgewichtiges IoT-Protokoll (Publish/Subscribe, TCP) | |
| **SNMP** | Überwachung von Netzkomponenten (CPU, Temperatur) | Community String und erlaubte Management-IPs |

### Transport/Sicherheit
- **TLS** 1.3: veraltete Algorithmen (RSA-Key-Exchange) entfernt, schnellerer Handshake.
- **ICMP**: Diagnose (Ping, Tracert); „Zeitüberschreitung“ → Firewall-Regel (ICMP erlaubt?) oder Rückroute fehlt.
- **IPsec / SSL-VPN**: Site-to-Site oder End-to-Site; Problem „Internet ja, Firmennetz nein“ → Split- vs. Full-Tunneling, Firewall-Regeln am VPN-Interface.

### Netzzugang/Vermittlung
- **IPv4/IPv6**: Adressierung, IPv6 SLAAC ohne DHCP. Keine Kommunikation zwischen Subnetzen → Gateway/Inter-VLAN-Routing (Router-on-a-Stick).
- **ARP**: IP → MAC im LAN. **ARP-Probe** prüft, ob die eigene IP schon vergeben ist (IP-Konflikt). **Gratuitous ARP**: unaufgeforderte Ankündigung der MAC, aktualisiert ARP-Tabellen.
- **802.1Q**: VLAN-Tag; Uplinks als Tagged (Trunk), sonst keine Kommunikation über Stockwerke.
- **STP/RSTP**: verhindert Loops durch Port-Blockierung; Root-Bridge-Priorität prüfen. **LACP**: Link Aggregation (Portchannel).
- **MTU**: große Pakete scheitern, kleine Pings nicht → MTU/Fragmentierung.

### AAA und WLAN
- **RADIUS**: AAA (Authentication, Authorization, Accounting) für WPA2/3-Enterprise. **IEEE 802.1X**: portbasierte Zugriffskontrolle (Supplicant, Authenticator, Authentication Server).

### Routing und Firewall
- **Distance-Vector (RIP)**: Hops. **Link-State (OSPF)**: Topologiekarte, bester Pfad. Dynamisch reagiert schneller als statisch.
- **Paketfilter** vs. **SPI** (Zustand/Verbindung) vs. **NGFW** (Application Control, IPS, Deep Packet/SSL-Inspection).
- **Cloud**: IaaS (virtuelle Server), PaaS (Entwicklungs-/Laufzeitumgebung, Datenbank), SaaS (fertige Anwendung, z. B. Microsoft 365).

## Einfach

Protokolle sind **Spielregeln**, nach denen Computer miteinander reden. Wenn zwei Geräte verschiedene Regeln benutzen, verstehen sie sich nicht.

- **DHCP** ist der Pförtner: „Hallo, ich bin neu!“ (Discover) – „Du bekommst Zimmer 12.“ (Offer) – „Okay, nehme ich.“ (Request) – „Abgemacht.“ (Acknowledge). Wenn kein Pförtner antwortet, nimmt der Computer eine Notadresse 169.254… (APIPA).
- **DNS** übersetzt Namen in Nummern (Telefonbuch).
- **HTTP/HTTPS** ist die Sprache für Webseiten, bei HTTPS mit Geheimcode (TLS).
- **ICMP** ist der „Ruf zum Echo“: Ping fragt „Bist du da?“. Manche Türsteher (Firewalls) lassen diese Frage nicht durch.
- **ARP** fragt im Raum laut: „Wer hat die IP 192.168.1.5?“ – „Ich! Meine Hausnummer (MAC) ist …“
- **VLAN-Tags** sind Farbaufkleber auf Paketen: rot = Schule, blau = Verwaltung. Switches erkennen die Farbe.
- **STP** ist die Verkehrsampel, die Kreisverkehre verhindert (Schleifen im Netz).
- **SNMP** ist der Hausmeister mit Fragebogen: „Wie warm ist die CPU?“
- **RADIUS** ist wie ein Ausweis-Check am Eingang: Jeder hat seinen eigenen Ausweis.
- **MQTT**: Kleine Sensoren rufen „Es ist 20 Grad“ in den Raum, und wer sich dafür interessiert, hört zu.

**Routing:** Statisch = du schreibst den Weg auf. RIP = „Wie viele Häuser muss ich passieren?“ OSPF = „Ich habe eine Karte der ganzen Stadt und nehme den besten Weg.“

**Cloud-Pizza:** IaaS = du bekommst die Küche (Server). PaaS = du bekommst die Küche mit Ofen und Zutaten und bäckst selbst. SaaS = du bekommst die fertige Pizza (Software).

## Merksatz
- DORA: Discover, Offer, Request, Acknowledge.
- 169.254 = kein DHCP, 443 = HTTPS, 53 = DNS.
- RIP = Hops, OSPF = Karte.
- IaaS = Hardware, PaaS = Plattform, SaaS = fertige Software.
- RADIUS = AAA, 802.1X = Port-Zugang.

## Prüfungsfalle
- DORA-Reihenfolge und dass Discover ein **Broadcast** ist.
- Ping-Timeout kann Firewall sein (ICMP gesperrt), nicht nur Ausfall.
- „VPN-Nutzer kann Internet, aber nicht Firmennetz“ → Tunnelkonfiguration/Firewall, nicht DNS.
- 802.1Q-Trunk muss **tagged** sein.
- SPI vs. NGFW: NGFW kann Anwendungen und verschlüsselten Verkehr (SSL-Inspection) prüfen.

## Grafik
### DHCP-DORA
1. Client -> DHCP-Server: DHCP Discover (Broadcast)
2. DHCP-Server -> Client: DHCP Offer (IP, Maske, Gateway, DNS)
3. Client -> DHCP-Server: DHCP Request
4. DHCP-Server -> Client: DHCP Acknowledge

### ARP im LAN
1. PC -> Switch: ARP-Request (Broadcast): Wer hat 192.168.1.1?
2. Switch -> Router: Broadcast wird weitergeleitet
3. Router -> PC: ARP-Reply mit MAC-Adresse
4. PC: speichert IP-MAC im ARP-Cache

## Spickzettel
- DORA; APIPA 169.254
- HTTPS 443, DNS 53, SMTP 25, SMTPS 465, Submission 587, IMAPS 993
- ARP IP→MAC; ARP-Probe = IP-Konflikt
- 802.1Q Tag, Trunk tagged
- STP Loops; LACP Bündelung
- RIP Hops, OSPF Link-State
- NGFW: IPS, Application Control, SSL-Inspection

## Zuordnen
### Protokoll und Aufgabe
- DHCP => Automatische IP-Vergabe
- ARP => IP zu MAC
- STP => Loop-Vermeidung
- LACP => Link Aggregation
- SNMP => Netzüberwachung
- RADIUS => Zentrale Authentifizierung
- MQTT => IoT-Nachrichten

## Reihenfolge
### DHCP-Ablauf
1. Discover
2. Offer
3. Request
4. Acknowledge

## Karteikarten
- F: DORA bedeutet? | A: Discover, Offer, Request, Acknowledge
- F: Was bedeutet APIPA? | A: 169.254.x.x, Selbstzuweisung, wenn kein DHCP erreichbar
- F: Aufgabe von ARP? | A: Zuordnung IP-Adresse zu MAC-Adresse im lokalen Netz
- F: Gratuitous ARP? | A: Unaufgeforderte Ankündigung der eigenen MAC zur Aktualisierung von ARP-Tabellen
- F: Aufgabe von STP? | A: Verhindert Schleifen durch Blockieren von Ports
- F: Aufgabe von LACP? | A: Bündelung mehrerer Leitungen zu einer logischen
- F: Was ist RADIUS? | A: Zentrales AAA-Protokoll (Authentication, Authorization, Accounting)
- F: Was leistet 802.1X? | A: Portbasierte Zugriffskontrolle für Geräte
- F: Distance-Vector vs. Link-State? | A: Hops (RIP) vs. Topologiekarte (OSPF)
- F: SPI vs. NGFW? | A: SPI prüft Zustand; NGFW zusätzlich Anwendung, IPS, SSL-Inspection
- F: IaaS, PaaS, SaaS? | A: Infrastruktur, Plattform, fertige Software
- F: Wofür MQTT? | A: Leichtgewichtiges IoT-Protokoll (Publish/Subscribe)

## Quiz
? Was ist die Reihenfolge des DHCP-Prozesses?
* Discover, Offer, Request, Acknowledge
- Offer, Discover, Acknowledge, Request
- Request, Offer, Discover, Acknowledge
- Discover, Request, Offer, Acknowledge

? Was bedeutet eine Adresse 169.254.x.x?
* Kein DHCP-Server erreicht
- Öffentliche Adresse
- Multicast
- Loopback

? Wozu dient ARP?
* IP-Adresse in MAC-Adresse auflösen
- Name in IP auflösen
- Pakete verschlüsseln
- VLANs anlegen

? Welches Protokoll verhindert Schleifen in redundanten Switch-Netzen?
* STP
- ARP
- DHCP
- SNMP

? Wofür steht RADIUS?
* Zentrale Authentifizierung, Autorisierung und Abrechnung (AAA)
- Routingprotokoll
- Verschlüsselungsverfahren
- Dateiformat

? Wie arbeitet OSPF?
* Link-State: Karte der Topologie und Berechnung des besten Pfads
- Zählt nur Hops
- Statische Tabellen
- Nur für WLAN

? Was ist SaaS?
* Fertige Software über das Internet
- Virtuelle Server
- Entwicklungsplattform
- Netzwerkkabel

? Warum kann Ping im Timeout enden, obwohl der Host läuft?
* ICMP wird von einer Firewall blockiert
- DHCP läuft
- Das Kabel ist zu lang
- DNS ist aktiv

? Was ist 802.1X?
* Portbasierte Netzwerkzugriffskontrolle
- Ein Routing-Protokoll
- Ein WLAN-Standard für Funkreichweite
- Ein Backup-Verfahren
