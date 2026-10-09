---
id: ap1-a4-netzwerkgrundlagen
bereich: AP1
block: A4
kapitel: Netzwerk
titel: OSI- & DoD-Modell, Protokolle und Ports
stufe: Einsteiger
quellen: [Netzwerkgrundlagen_Basic.pdf, 01-Folien-physische-Netzwerktopologie.pdf, uebung-Physische-Netzwerkstruktur.pdf]
verweise: [ap1-a4-topologie, ap1-a4-ipv4, ap1-a4-subnetting, ap1-a5-dns, ap1-a5-dhcp]
---

## Profi

### Warum Schichtenmodelle?
Netzwerkkommunikation wird in **Schichten** zerlegt. Jede Schicht erfüllt eine klar definierte Aufgabe und bietet der darüberliegenden Schicht Dienste an. Vorteile:
- **Austauschbarkeit**: Eine Schicht kann ersetzt werden, ohne die anderen zu ändern (z. B. WLAN statt Kabel, IPv6 statt IPv4).
- **Herstellerunabhängigkeit** durch standardisierte Schnittstellen.
- **Übersichtlichkeit** bei Entwicklung, Lehre und **Fehlersuche** (von unten nach oben prüfen: Kabel → Link → IP → Port → Anwendung).
- Geringere Komplexität je Schicht.

### OSI-Modell (ISO, 7 Schichten, theoretisches Referenzmodell)
| Nr. | Schicht | Aufgabe | Beispiele | Dateneinheit | Geräte |
|---|---|---|---|---|---|
| 7 | Anwendung (Application) | Schnittstelle zur Anwendung | HTTP, FTP, SMTP, DNS, DHCP | Daten | Proxy, Firewall (ALG) |
| 6 | Darstellung (Presentation) | Codierung, Kompression, Verschlüsselung (systemunabhängig) | TLS, ASCII, JPEG | Daten | |
| 5 | Sitzung (Session) | Aufbau, Synchronisation, Abbau von Sitzungen | RPC, NetBIOS, SOCKS | Daten | |
| 4 | Transport | Segmentierung, Reihenfolge, Ende-zu-Ende, Ports | TCP, UDP | **Segment** | |
| 3 | Vermittlung (Network) | logische Adressierung, **Routing** | IP, ICMP, IPsec | **Paket** | Router, Layer-3-Switch |
| 2 | Sicherung (Data Link) | physische Adressierung (MAC), Fehlererkennung (CRC), Zugriffsverfahren | Ethernet, WLAN (802.11), ARP*, PPP | **Frame (Rahmen)** | Switch, Bridge, Access Point |
| 1 | Bitübertragung (Physical) | Übertragung der Bits über das Medium | Kabel, Stecker, Funk, RS-232 | **Bit** | Hub, Repeater, Medienkonverter, Kabel |
*ARP wird je nach Lehrmeinung Schicht 2 oder 2/3 zugeordnet.

Merksatz von oben nach unten: **„Alle Deutschen Studenten Trinken Verschiedene Sorten Bier“**. Von unten: **„Please Do Not Throw Salami Pizza Away“**.

### DoD-Modell / TCP/IP-Modell (4 Schichten, praxisnah)
| DoD | Name | entspricht OSI | Protokolle |
|---|---|---|---|
| 4 | **Process / Anwendung** | 5, 6, 7 | HTTP(S), SMTP, DNS, FTP, SSH, DHCP |
| 3 | **Host to Host / Transport** | 4 | TCP, UDP |
| 2 | **Internet** | 3 | IP, ICMP, IGMP, ARP |
| 1 | **Network Access / Netzzugang** | 1, 2 | Ethernet, WLAN |

### Kapselung (Encapsulation)
Beim **Senden** fügt jede Schicht ihre Steuerinformationen (**Header**) hinzu – beim **Empfangen** entfernt jede Schicht ihren Header wieder. Beispiel E-Mail mit Thunderbird: Anwendung → **SMTP** (Process) → **TCP** (Host to Host, teilt große Daten in nummerierte Segmente) → **IP** (Internet, Adressen) → **Ethernet** (Netzzugang, MAC-Adressen, Prüfsumme). Beim Empfänger setzt TCP die Segmente in der richtigen Reihenfolge wieder zusammen.

### Wichtige Protokolle
**ARP** (Address Resolution Protocol): ermittelt zu einer bekannten **IP-Adresse** die **MAC-Adresse** im lokalen Netz (Broadcast „Wer hat 192.168.1.1?“). Ergebnisse liegen einige Minuten im **ARP-Cache**. `arp -a` zeigt den Cache, `arp -d` löscht ihn. Risiko: **ARP-Spoofing** (gefälschte Antworten → Man-in-the-Middle).

**MAC-Adresse**: 48 Bit (6 Byte), z. B. `08-00-20-AE-FD-7E`. Die ersten 24 Bit sind die Herstellerkennung (**OUI**), die letzten 24 Bit die Gerätenummer. Weltweit eindeutig vergeben (kann aber per Software geändert werden). `FF-FF-FF-FF-FF-FF` = Broadcast.

**IP**: logische Adressierung und Weiterleitung (Routing) der Pakete, **verbindungslos, keine Fehlerkorrektur**.

**ICMP**: Status- und Fehlermeldungen zwischen Hosts und Routern – `ping` (Echo Request/Reply), `tracert` (nutzt TTL-Ablauf), „Ziel nicht erreichbar“, „Fragmentierung nötig“.

**IGMP**: Verwaltung von **Multicast**-Gruppen (IPTV, Streaming).

### TCP vs. UDP
| | **TCP** (Transmission Control Protocol) | **UDP** (User Datagram Protocol) |
|---|---|---|
| Verbindung | **verbindungsorientiert** (3-Wege-Handshake SYN → SYN/ACK → ACK) | **verbindungslos** |
| Zuverlässigkeit | Bestätigungen (ACK), Sequenznummern, erneutes Senden, Reihenfolge, Flusskontrolle | keine Bestätigung, keine Wiederholung |
| Overhead | größerer Header (20 Byte+) | kleiner Header (8 Byte), **schneller** |
| Einsatz | HTTP(S), SMTP, FTP, SSH, RDP | DNS-Abfragen, DHCP, VoIP, Streaming, Online-Spiele, NTP, TFTP |

### Ports (Auswahl, prüfungsrelevant)
Ports (0–65535) kennzeichnen **Dienste** auf einem Host. **Well-Known Ports: 0–1023**, Registered: 1024–49151, Dynamic/Private: 49152–65535. **Socket** = IP-Adresse + Port + Protokoll.
| Port | Protokoll | Dienst |
|---|---|---|
| 20/21 | TCP | FTP (Daten/Steuerung) |
| 22 | TCP | SSH, SFTP, SCP |
| 23 | TCP | Telnet (unsicher) |
| 25 | TCP | SMTP |
| 53 | UDP/TCP | DNS |
| 67/68 | UDP | DHCP (Server/Client) |
| 69 | UDP | TFTP |
| 80 | TCP | HTTP |
| 88 | TCP/UDP | Kerberos |
| 110 | TCP | POP3 |
| 123 | UDP | NTP |
| 143 | TCP | IMAP |
| 161/162 | UDP | SNMP / Traps |
| 389 / 636 | TCP | LDAP / LDAPS |
| 443 | TCP | HTTPS (auch DoH, SSTP) |
| 445 | TCP | SMB (Dateifreigaben) |
| 465/587 | TCP | SMTP über TLS / Submission |
| 514 | UDP | Syslog |
| 993 / 995 | TCP | IMAPS / POP3S |
| 1812/1813 | UDP | RADIUS |
| 3389 | TCP/UDP | RDP |
| 5985/5986 | TCP | WinRM (HTTP/HTTPS) |

### Adressierung auf einen Blick
| Schicht | Adresse | Beispiel |
|---|---|---|
| 2 | MAC-Adresse | 00-15-5D-0A-01-02 |
| 3 | IP-Adresse | 192.168.10.20 |
| 4 | Port | 443 |
| 7 | Name (FQDN/URL) | www.example.com |

## Übungen
- A: Ordnen Sie die OSI-Schichten den DoD-Schichten zu | L: OSI 1+2 → Network Access; 3 → Internet; 4 → Host to Host; 5+6+7 → Process
- A: Vorteile eines Schichtenmodells | L: Schichten austauschbar, herstellerunabhängige Standards, übersichtlich, einfachere Fehlersuche, geringere Komplexität je Schicht
- A: Tool: MAC-Adresse des eigenen Rechners | L: ipconfig /all (oder getmac)
- A: Tool: MAC-Adresse des Gateways | L: arp -a (nach einem ping auf das Gateway)
- A: Tool: Anzahl Hops zu einem externen Server | L: tracert
- A: Tool: Unterstützt www.ihk.de IPv6? | L: nslookup (AAAA-Eintrag) bzw. Resolve-DnsName -Type AAAA
- A: Tool: Erreichbarkeit des Webservers fortlaufend kontrollieren | L: ping -t
- A: MTU einer Verbindung per ping ermitteln | L: ping -f -l <Größe> Ziel; -f verbietet Fragmentierung, Größe erhöhen bis „Paket müsste fragmentiert werden“; MTU = größte funktionierende Größe + 28 Byte (20 IP + 8 ICMP), z. B. ping -f -l 1472 www.future-gmbh.de → MTU 1500

## Befehle
- `ipconfig /all` – IP-Konfiguration inkl. MAC, DNS, DHCP
- `arp -a` / `arp -d` – ARP-Cache anzeigen / löschen
- `ping <ziel>` / `ping -t` / `ping -f -l 1472` – Erreichbarkeit / Dauerping / MTU-Test
- `tracert <ziel>` – Route und Hops
- `pathping <ziel>` – Route + Paketverlust je Hop
- `netstat -ano` – offene Verbindungen und Ports mit Prozess-ID
- `Test-NetConnection <ziel> -Port 443` – PowerShell: Port erreichbar?
- `Get-NetTCPConnection -State Listen` – lauschende Ports
- `Get-NetNeighbor` – PowerShell-Pendant zu arp -a

## Einfach

Stell dir vor, du schickst einen **Brief an deine Oma**. Dafür passieren viele kleine Schritte – und jeder Schritt wird von jemand anderem erledigt:

1. Du **schreibst** den Brief (Anwendung).
2. Du achtest auf die richtige **Sprache**, damit Oma ihn lesen kann (Darstellung).
3. Du vereinbarst, dass ihr euch **regelmäßig schreibt** (Sitzung).
4. Ist der Brief zu dick, teilst du ihn auf **mehrere Umschläge** auf und **nummerierst** sie (Transport).
5. Du schreibst die **Adresse** drauf – Stadt, Straße (Vermittlung = IP-Adresse).
6. Der Postbote weiß, welches **Haus in der Straße** gemeint ist (Sicherung = MAC-Adresse).
7. Der Brief wird **mit dem Auto gefahren** (Bitübertragung = Kabel/Funk).

Bei Oma läuft alles **rückwärts**: ausladen, Umschläge öffnen, Seiten sortieren, lesen. Das ist das **OSI-Modell** mit 7 Schichten. Das **DoD-Modell** fasst einige Schritte zusammen und hat nur 4 – es ist die „Praxis-Version“.

**Warum Schichten?** Wenn statt Auto ein Fahrrad fährt (WLAN statt Kabel), muss niemand den Brief anders schreiben. Jeder macht nur seinen Job.

**TCP und UDP** sind zwei Arten zu verschicken:
- **TCP** ist das **Einschreiben mit Rückschein**: Jeder Umschlag wird bestätigt. Fehlt einer, wird er neu geschickt. Sicher, aber langsamer.
- **UDP** ist die **Postkarte**: einfach losschicken, keine Bestätigung. Schnell – wenn mal eine fehlt, egal (z. B. bei einem Live-Video, wo ein verlorenes Bild nicht nachgeschickt werden muss).

**Ports** sind wie **Wohnungsnummern im Hochhaus**: Die IP-Adresse ist das Haus, der Port die Wohnung. Port 80 ist die Wohnung „Webseite“, Port 25 die „E-Mail-Post“.

**ARP** ist wie in der Klasse rufen: „Wer von euch hat die Nummer 192.168.1.1?“ – und der Richtige meldet sich mit seinem echten Namen (MAC-Adresse).

## Merksatz
- OSI oben → unten: „**A**lle **D**eutschen **S**tudenten **T**rinken **V**erschiedene **S**orten **B**ier“.
- DoD = **4** Schichten: Process – Host to Host – Internet – Network Access.
- Dateneinheiten 1–4: **Bit – Frame – Paket – Segment**.
- **TCP = Einschreiben**, **UDP = Postkarte**.
- ARP: **IP → MAC**.

## Prüfungsfalle
- OSI-Schichten und DoD-Schichten falsch zugeordnet (OSI 1+2 = DoD 1).
- DNS nutzt **UDP 53** für Abfragen, **TCP 53** für Zonentransfers/große Antworten.
- DHCP: Server **67**, Client **68** (UDP).
- Router arbeitet auf Schicht **3**, Switch auf **2**, Hub auf **1**.
- ICMP hat **keine Ports**.

## Grafik
### Brief durch die Schichten
Ein Brief fällt von Schicht 7 nach unten; jede Schicht klebt ein farbiges Etikett (Header) dran; auf Schicht 1 wird er zu Bits und fliegt über ein Kabel; beim Empfänger werden die Etiketten in umgekehrter Reihenfolge abgezogen.

### OSI ↔ DoD
Zwei Säulen nebeneinander; Verbindungslinien zeigen die Zuordnung; beim Hover leuchten passende Protokolle und Geräte auf.

### 3-Wege-Handshake
Client und Server; SYN, SYN/ACK, ACK fliegen als Pfeile hin und her; danach Datenfluss mit ACKs; Umschalter auf UDP zeigt nur einseitige Pakete ohne Bestätigung.

### Port-Hochhaus
Ein Haus mit IP-Adresse; Fenster mit Portnummern; Klick auf ein Fenster zeigt den Dienst.

## Karteikarten
- F: Nenne die 7 OSI-Schichten von unten. | A: Bitübertragung, Sicherung, Vermittlung, Transport, Sitzung, Darstellung, Anwendung.
- F: Die 4 DoD-Schichten? | A: Network Access, Internet, Host to Host, Process.
- F: Auf welcher Schicht arbeitet ein Router? | A: OSI 3 (Vermittlung) / DoD 2 (Internet).
- F: Auf welcher Schicht arbeitet ein Switch? | A: OSI 2 (Sicherung).
- F: Was macht ARP? | A: Ermittelt zur IP-Adresse die MAC-Adresse im lokalen Netz.
- F: Aufbau einer MAC-Adresse? | A: 48 Bit; 24 Bit Hersteller (OUI) + 24 Bit Gerätenummer.
- F: Drei Merkmale von TCP? | A: Verbindungsorientiert (Handshake), Bestätigungen/Wiederholung, Reihenfolge per Sequenznummern.
- F: Wann nutzt man UDP? | A: Wenn Geschwindigkeit wichtiger als Zuverlässigkeit ist: DNS, DHCP, VoIP, Streaming.
- F: Port von HTTPS, SSH, RDP? | A: 443, 22, 3389.
- F: Port von SMB, DNS, DHCP-Server? | A: 445, 53, 67.
- F: Wozu dient ICMP? | A: Status- und Fehlermeldungen (ping, tracert).
- F: Was ist ein Socket? | A: Kombination aus IP-Adresse, Protokoll und Port.

## Quiz
? Welche OSI-Schichten fasst die DoD-Schicht „Process“ zusammen?
* 5, 6 und 7
- 1 und 2
- 3 und 4
- nur 7

? Welches Protokoll ermittelt die MAC-Adresse zu einer IP-Adresse?
* ARP
- DNS
- ICMP
- DHCP

? Welcher Dienst nutzt Port 3389?
* RDP
- SSH
- SMB
- LDAP

? Welche Aussage zu UDP ist richtig?
* UDP ist verbindungslos und bestätigt keine Pakete
- UDP verwendet einen 3-Wege-Handshake
- UDP garantiert die Reihenfolge der Daten
- UDP ist langsamer als TCP

? Welche Dateneinheit gehört zur Sicherungsschicht?
* Frame
- Segment
- Paket
- Bit
