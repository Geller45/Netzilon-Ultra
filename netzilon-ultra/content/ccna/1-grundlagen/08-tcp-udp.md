---
id: ccna-tcp-udp
bereich: CCNA
block: CCNA 1.5
kapitel: Network Fundamentals
titel: TCP und UDP – Ports, Three-Way-Handshake, Zuverlässigkeit
stufe: Fortgeschritten
fach: TCP/IP – CCNA – Basic
pruefungen: [CCNA, AP1, AP2]
quellen: [CCNA_200-301_Notes_-_Jeremys_IT_Lab.pdf, 200-301.pdf, cisco_100-101.pdf, Well-known Ports.md]
verweise: [ref-ports, ccna-osi-tcpip, ccna-acl-extended, ccna-nat, ccna-security-grundlagen]
---

## Profi

### Aufgaben der Transportschicht
- **Host-zu-Host**-Kommunikation (Ende-zu-Ende), transparent für die Anwendung.
- **Layer-4-Adressierung** über **Ports** (16 Bit, 0–65535): identifiziert die Anwendung, ermöglicht **Session-Multiplexing** (mehrere Verbindungen gleichzeitig).
- Optional: zuverlässige Übertragung, Fehlerbehebung, Sequenzierung, Flusskontrolle (nur TCP).
Ein **Socket** ist die Kombination **IP-Adresse + Protokoll + Port**; eine Verbindung wird durch das 5-Tupel (Quell-IP, Ziel-IP, Protokoll, Quellport, Zielport) beschrieben.

### Portbereiche (IANA)
| Bereich | Name | Nutzung |
|---|---|---|
| 0–1023 | **Well-Known** | Serverdienste (HTTP 80, SSH 22) |
| 1024–49151 | **Registered** | registrierte Anwendungen (RDP 3389, MySQL 3306) |
| 49152–65535 | **Ephemeral/Dynamic/Private** | zufällige Quellports der Clients |

### TCP (Transmission Control Protocol)
- **Verbindungsorientiert**: **Three-Way-Handshake** vor der Datenübertragung: **SYN → SYN-ACK → ACK**.
- Abbau: **FIN → ACK → FIN → ACK** (vier Schritte, auch FIN/ACK kombiniert), Abbruch per **RST**.
- **Zuverlässig**: Jedes Segment wird **bestätigt** (ACK, kumulativ); fehlt die Bestätigung, wird **erneut gesendet** (Retransmission).
- **Sequenzierung**: **Sequenznummern** erlauben die richtige Reihenfolge.
- **Flusskontrolle**: **Window Size** (Sliding Window) – der Empfänger teilt mit, wie viele Bytes er ohne Bestätigung annimmt.
- Header mindestens **20 Byte** (bis 60) mit Feldern: Quellport, Zielport, Sequenznummer, Acknowledgment Number, Data Offset, Flags (**URG, ACK, PSH, RST, SYN, FIN**), Window, Checksum, Urgent Pointer, Options.

### UDP (User Datagram Protocol)
- **Verbindungslos**: Daten werden sofort gesendet, kein Handshake.
- **Keine Zuverlässigkeit**: keine Bestätigung, keine Wiederholung („**best effort**“).
- **Keine Sequenzierung**, **keine Flusskontrolle**.
- **Prüfsumme** ist vorhanden (Fehlererkennung).
- Header nur **8 Byte**: Quellport, Zielport, Länge, Checksum.
- Unterstützt **Broadcast und Multicast** (TCP nur Unicast).
- Ideal für **Echtzeit** (VoIP, Video, Online-Spiele), kurze Anfragen (DNS, DHCP, SNMP, NTP, TFTP, Syslog).

### Vergleich
| Merkmal | TCP | UDP |
|---|---|---|
| Verbindung | verbindungsorientiert | verbindungslos |
| Zuverlässigkeit | ACK + Retransmission | keine |
| Reihenfolge | Sequenznummern | keine |
| Flusskontrolle | Window | keine |
| Header | 20 Byte (min.) | 8 Byte |
| Overhead | höher | gering |
| Typisch | Web, Mail, Dateien, SSH | VoIP, Video, DNS-Anfragen, DHCP |
Manche Anwendungen bauen Zuverlässigkeit **in der Anwendung** (TFTP, QUIC), andere nutzen beide (DNS: UDP für Anfragen, TCP für Zonentransfer/große Antworten).

### Wichtige Ports (CCNA)
| Port | Protokoll | Dienst |
|---|---|---|
| 20/21 TCP | FTP | Daten/Steuerung |
| 22 TCP | SSH, SFTP, SCP | sichere Shell |
| 23 TCP | Telnet | unsichere Shell |
| 25 TCP | SMTP | Mailversand |
| 53 UDP/TCP | DNS | Namensauflösung |
| 67/68 UDP | DHCP | Server/Client |
| 69 UDP | TFTP | einfache Dateiübertragung |
| 80 TCP | HTTP | Web |
| 110 TCP | POP3 | Mailabruf |
| 123 UDP | NTP | Zeit |
| 143 TCP | IMAP | Mailzugriff |
| 161/162 UDP | SNMP | Agent/Trap |
| 389 TCP/UDP | LDAP | Verzeichnis |
| 443 TCP (UDP bei QUIC) | HTTPS | Web sicher |
| 514 UDP | Syslog | Logging |
| 636 TCP | LDAPS | LDAP über TLS |
| 1812/1813 UDP | RADIUS | AAA |
| 49 TCP | TACACS+ | AAA |
| 3389 TCP | RDP | Remotedesktop |

## Einfach

**TCP** ist wie ein **Einschreiben mit Rückschein**:
1. Erst fragst du: „Bist du da?“ (**SYN**)
2. Der andere: „Ja, bin da – bist du auch da?“ (**SYN-ACK**)
3. Du: „Ja!“ (**ACK**) – jetzt steht die Verbindung.
Jeder Brief hat eine **Nummer**. Der Empfänger schickt für jeden eine **Quittung**. Fehlt eine Quittung, schickst du den Brief **nochmal**. Kommen die Briefe durcheinander an, sortiert er sie nach Nummer. Und wenn er nicht hinterherkommt, sagt er: „Langsamer bitte!“ (Fenstergröße).

**UDP** ist wie eine **Postkarte** oder ein **Radiosender**: einfach losschicken, ohne zu fragen, ohne Quittung. Geht eine verloren – Pech. Dafür ist es **schnell**. Beim **Telefonieren übers Internet** ist das perfekt: Ein verlorenes Stückchen Ton merkt man kaum, aber eine Verzögerung wäre nervig.

**Ports** sind die **Zimmernummern** in einem Haus (dem Computer): Die IP-Adresse bringt das Paket zum richtigen Haus, die Portnummer ins richtige Zimmer – Zimmer 80 ist der Webserver, Zimmer 22 SSH, Zimmer 53 DNS.

## Merksatz
- **SYN – SYN/ACK – ACK = „Hallo? – Hallo, hörst du mich? – Ja!“**
- **TCP: zuverlässig, sortiert, langsamer · UDP: schnell, egal, leicht.**
- **TCP 20 Byte, UDP 8 Byte Header.**
- **Well-known < 1024, ephemeral ab 49152.**
- **„22 sicher, 23 Klartext“.**

## Prüfungsfalle
- UDP hat **sehr wohl** eine Prüfsumme – nur keine Bestätigungen.
- TCP-Handshake = **drei** Nachrichten, nicht fünf (200-301 Frage 11).
- **Multicast/Broadcast nur mit UDP**, nicht TCP (200-301 Frage 1, Option A ist vertauscht).
- Vor HTTP muss eine **TCP-Verbindung zum Webserver** stehen – nicht zum Gateway (100-101 Frage 8).
- FTP nutzt TCP (verbindungsorientiert), **TFTP UDP** (100-101 Frage 4).
- Fehler in der Obsidian-Portliste „Well-known Ports“: HTTPS ist **443**, nicht 433; **LDAP = 389**, 636 ist LDAPS; **NTP und SNMP nutzen UDP** (123/161); FTP Steuerung 21 und SSH 22 sind TCP (UDP-Kreuz dort nicht relevant); Port 201 AppleTalk ist veraltet (**Legacy**).

## Grafik
### Three-Way-Handshake
1. Client -> Server: SYN (Seq=100)
2. Server -> Client: SYN-ACK (Seq=300, Ack=101)
3. Client -> Server: ACK (Ack=301)
4. Client -> Server: Daten HTTP GET
5. Server -> Client: ACK + Daten

### TCP-Retransmission
1. Client -> Server: Segment 1
2. Server -> Client: ACK 2
3. Client -> Server: Segment 2 geht verloren
4. Client: Timer läuft ab
5. Client -> Server: Segment 2 erneut
6. Server -> Client: ACK 3

### UDP-Stream
1. Telefon1 -> Telefon2: Sprachpaket 1
2. Telefon1 -> Telefon2: Sprachpaket 2 (geht verloren)
3. Telefon1 -> Telefon2: Sprachpaket 3
4. Telefon2: Spielt 1 und 3 ab – keine Wiederholung

## Lab
**PC1 (Windows 11) und Packet Tracer – Verbindungen und Ports beobachten**

### Windows
1. **PC1**: Eingabeaufforderung → `netstat -ano` – zeigt TCP/UDP-Verbindungen mit Ports und Prozess-ID.
2. **PC1** PowerShell: `Get-NetTCPConnection -State Established` und `Test-NetConnection 192.168.1.1 -Port 22`.

### Cisco IOS (R1)
```
R1# show control-plane host open-ports
R1# show tcp brief
R1# telnet 192.168.1.2 22
```
`telnet <IP> <Port>` testet, ob ein TCP-Port offen ist (Verbindung baut sich auf → Port offen).

## Befehle
- `netstat -ano` – Verbindungen, Ports, PIDs (Windows)
- `ss -tulpn` – lauschende TCP/UDP-Ports (Linux)
- `Test-NetConnection host -Port 443` – TCP-Port prüfen (PowerShell)
- `show tcp brief` – TCP-Sitzungen des Routers
- `show control-plane host open-ports` – offene Ports auf dem Cisco-Gerät

## Übungen
- A: Nenne die drei Schritte des TCP-Verbindungsaufbaus. | L: SYN – SYN-ACK – ACK.
- A: Warum nutzt VoIP UDP? | L: Geringe Latenz und kein Warten auf Wiederholungen; ein verlorenes Paket ist unkritischer als Verzögerung.
- A: Ordne zu: DNS-Anfrage, Dateidownload per FTP, TFTP-IOS-Upload, SSH | L: UDP 53, TCP 20/21, UDP 69, TCP 22.
- A: Ein Client nutzt Quellport 51544. Zu welchem Bereich gehört er? | L: Ephemeral/dynamisch (49152–65535).

## Karteikarten
- F: Was ist der Three-Way-Handshake? | A: TCP-Verbindungsaufbau: SYN, SYN-ACK, ACK.
- F: Wie groß ist der minimale TCP-Header? | A: 20 Byte.
- F: Wie groß ist der UDP-Header? | A: 8 Byte.
- F: Welche Felder hat der UDP-Header? | A: Quellport, Zielport, Länge, Prüfsumme.
- F: Wie realisiert TCP Flusskontrolle? | A: Über die Window Size (Sliding Window).
- F: Welche Portbereiche definiert die IANA? | A: 0–1023 well-known, 1024–49151 registered, 49152–65535 ephemeral.
- F: Hat UDP eine Prüfsumme? | A: Ja, aber keine Bestätigungen/Wiederholungen.
- F: Welches Protokoll unterstützt Broadcast und Multicast? | A: UDP.
- F: Port von SNMP Agent und SNMP Trap? | A: UDP 161 und UDP 162.
- F: Port von Syslog? | A: UDP 514.
- F: Port von TACACS+ und RADIUS? | A: TCP 49 sowie UDP 1812/1813.

## Quiz
? Was ist der Unterschied zwischen TCP und UDP?
* TCP sichert geordnete, zuverlässige Zustellung, UDP bietet geringe Latenz und hohen Durchsatz
- TCP verwaltet Multicast und Broadcast, UDP nur Unicast
- TCP wird nur im Internet, UDP nur im LAN verwendet
- TCP dient der Dateiintegrität, UDP nur dem Broadcast
@ 200-301.pdf Question 1

? Welche Aussage zu den Headern stimmt?
* TCP hat mindestens 20 Byte Header, UDP 8 Byte
- TCP nutzt nur eine Prüfsumme, UDP hat Bestätigungen
- TCP braucht fünf Pakete zum Verbindungsaufbau, UDP drei
- UDP setzt Pakete in einer festen Reihenfolge zusammen
@ 200-301.pdf Question 11

? Welches Protokoll nutzt einen verbindungsorientierten Dienst, um Dateien zu übertragen?
* FTP
- TFTP
- DNS
- SNMP
@ cisco_100-101.pdf Question 4

? Was muss passieren, bevor eine Workstation HTTP mit einem Webserver austauschen kann?
* Eine TCP-Verbindung zwischen Workstation und Webserver muss aufgebaut werden
- Eine UDP-Verbindung zum Standardgateway muss aufgebaut werden
- Eine TCP-Verbindung zum Standardgateway muss aufgebaut werden
- Eine ICMP-Verbindung zum Webserver muss aufgebaut werden
@ cisco_100-101.pdf Question 8

? Wodurch unterscheidet sich TCP von UDP? (Mehrfachauswahl)
* TCP bietet synchronisierte Kommunikation
* TCP nummeriert Segmente mit Sequenznummern
- TCP bietet Best-Effort-Zustellung
- TCP nutzt Broadcast-Zustellung
@ cisco_100-101.pdf Question 9

? Welcher Port gehört zu TFTP?
* UDP 69
- TCP 21
- TCP 22
- UDP 514

? Welche TCP-Flags werden beim Verbindungsaufbau genutzt?
* SYN und ACK
- FIN und RST
- PSH und URG
- RST und ACK

? Zu welchem Bereich gehört Port 3389?
* Registered Ports
- Well-Known Ports
- Ephemeral Ports
- Reservierte Systemports unter 1024

## Zuordnen
### Dienst und Port
- SSH => TCP 22
- DNS => UDP/TCP 53
- DHCP-Server => UDP 67
- NTP => UDP 123
- HTTPS => TCP 443
- Syslog => UDP 514

## Lücken
- Der TCP-Verbindungsaufbau besteht aus SYN, {SYN-ACK} und ACK.
- UDP hat einen Header von {8} Byte.
- Die Flusskontrolle bei TCP erfolgt über die {Window Size}.
- Ports ab {49152} sind ephemeral.

## Spickzettel
- TCP: verbindungsorientiert, ACK, Seq, Window, 20 B Header
- UDP: verbindungslos, best effort, Checksum, 8 B Header, Multicast
- Handshake SYN → SYN-ACK → ACK; Abbau FIN/ACK
- 0–1023 well-known · 1024–49151 registered · 49152+ ephemeral
- 20/21 FTP · 22 SSH · 23 Telnet · 53 DNS · 67/68 DHCP · 69 TFTP · 123 NTP · 161/162 SNMP · 443 HTTPS · 514 Syslog
