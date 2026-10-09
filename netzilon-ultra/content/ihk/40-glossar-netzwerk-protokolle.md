---
id: ihk-glossar-netzwerk
bereich: AP1
block: IHK
kapitel: Glossar
titel: Glossar Netzwerk und Protokolle (Abkürzungen A-Z)
stufe: Einsteiger
fach: PV – AP1
pruefungen: [AP1, AP2]
quellen: [Abkürzungsverzeichnis.md (Obsidian FI Ausbildung-Themen, Version 1.0.0), Themen-Beziehungskarte.md]
verweise: [ihk-fachbegriffe-technik, ihk-fachbegriffe-betrieb-security]
---

## Profi

Netzwerkabkürzungen sind das Vokabular jeder AP1-Aufgabe: Protokolle, Adressen, WLAN, Routing und Dienste. Wer die Kürzel sofort auflösen kann, versteht Aufgabentexte schneller und verschenkt keine Punkte. Das Glossar enthält 112 Einträge, alphabetisch, jeweils mit Auflösung und Kurzerklärung.

| Kürzel | Bedeutung | Erklärung |
|---|---|---|
| AAAA | AAAA-Record | DNS-Ressourceneintrag, der einen Domainnamen auf eine IPv6-Adresse abbildet (Pendant zum A-Record für IPv4). |
| ACK | Acknowledgement | Bestätigungs-Flag/-Paket in Protokollen (z. B. TCP-Handshake `SYN → SYN-ACK → ACK`, DHCP-DORA). |
| AP | Access Point | Funkzugangspunkt (Layer 2), an dem sich WLAN-Clients anmelden; verbindet das Funknetz mit dem kabelgebundenen LAN. |
| APIPA | Automatic Private IP Addressing | Windows-Mechanismus: Wenn kein DHCP-Server antwortet, vergibt sich der Client selbst eine Adresse aus `169.254.0.0/16` - typisches Fehlersymptom bei ausgefallenem DHCP. |
| ARP | Address Resolution Protocol | Löst eine bekannte IP-Adresse in die zugehörige MAC-Adresse im lokalen Netz auf; arbeitet formal auf Layer 2, nutzt aber Layer-3-Adressen. Vertiefung: Notiz ARP noch ohne Inhalt → siehe Notizen ohne Inhalt |
| BEB | Binary Exponential Backoff | Algorithmus zur Kollisionsauflösung bei CSMA/CD (Ethernet): nach einer Kollision wartet die Station eine zufällige, exponentiell wachsende Zeitspanne. |
| BGP | Border Gateway Protocol | Routing-Protokoll zwischen autonomen Systemen - das „Routing-Protokoll des Internets". |
| BSC | Binary Synchronous Communication | Älteres, byteorientiertes Übertragungsprotokoll der Sicherungsschicht (nutzt Steuerzeichen wie STX/ETX). |
| CIDR | Classless Inter-Domain Routing | Notation für IP-Netze mit variabler Subnetzmaske (z. B. `/24`); löste das starre Klassen-A/B/C-System ab. |
| CIFS | Common Internet File System | Microsoft-Dialekt des SMB-Protokolls für Datei-/Druckerfreigaben im Netz. |
| CNAME | Canonical Name | DNS-Ressourceneintrag, der einen Domainnamen als Alias auf einen anderen Domainnamen umleitet. |
| CRC | Cyclic Redundancy Check | Prüfsummenverfahren zur Fehlererkennung in übertragenen Daten (z. B. Teil der FCS bei Ethernet-Frames). |
| CSMA | Carrier Sense Multiple Access | Zugriffsverfahren, bei dem Stationen vor dem Senden das Medium abhören („Carrier Sense") und sich das Medium teilen („Multiple Access"). Zwei Varianten: CSMA/CA und CSMA/CD. |
| CSMA-CA | Carrier Sense Multiple Access / Collision Avoidance | CSMA-Variante, die Kollisionen aktiv vermeidet (u. a. durch Wartezeiten/RTS-CTS) - Standard bei WLAN, wo Kollisionserkennung nicht zuverlässig funktioniert. Schreibweisen: CSMA/CA Vertiefung: Notiz CSMA-CA noch ohne Inhalt → siehe Notizen ohne Inhalt |
| CSMA-CD | Carrier Sense Multiple Access / Collision Detection | CSMA-Variante, die Kollisionen während der Übertragung erkennt und abbricht (BEB-Backoff) - klassisches Ethernet-Zugriffsverfahren (bei modernem Vollduplex-Switching nicht mehr nötig). Schreibweisen: CSMA/CD Vertiefung: CSMA-CD |
| DHCP | Dynamic Host Configuration Protocol | Vergibt IP-Adressen und Netzwerkkonfiguration automatisch an Clients - Ablauf nach dem DORA-Schema (Discover-Offer-Request-Ack). |
| DIX | DIX-Ethernet-Standard | (Digital, Intel, Xerox) Ursprünglicher Ethernet-Frame-Standard der drei Herstellerfirmen, Vorläufer von IEEE 802.3. |
| DLE | Data Link Escape | Steuerzeichen, das in älteren byteorientierten Protokollen (z. B. BSC) Steuersequenzen einleitet. |
| DMZ | Demilitarized Zone | Abgeschottetes Zwischennetz zwischen Internet und internem Netz für öffentlich erreichbare Server (Web-, Mail-Server) - begrenzt den Schaden bei Kompromittierung. |
| DNS | Domain Name System | Übersetzt Domainnamen in IP-Adressen (und umgekehrt); hierarchisch verteilte Datenbank. |
| DORA | Merkwort | für den DHCP-Ablauf: Discover → Offer → Request → Acknowledge. |
| DSL | Digital Subscriber Line | Breitband-Übertragungstechnik über die klassische Kupfer-Telefonleitung. Vertiefung: Notiz DSL noch ohne Inhalt → siehe Notizen ohne Inhalt |
| DT | Datenübertragungstechnik | (Alias der Notiz) Vertiefung: Datenübertragungstechnik |
| ETX | End of Text | Steuerzeichen, das in älteren Protokollen (BSC) das Ende eines Textblocks markiert (Gegenstück zu STX). |
| FCS | Frame Check Sequence | Prüfsumme am Ende eines Ethernet-Frames zur Fehlererkennung (nutzt CRC). |
| FTP | File Transfer Protocol | Protokoll zur Dateiübertragung; unverschlüsselt (Gegenstück: FTPS). |
| FTPS | File Transfer Protocol Secured | FTP mit TLS-Verschlüsselung. |
| GAN | Global Area Network | Netz mit weltweiter Ausdehnung (Internet, Telefonnetz) - die größte Netzklasse. |
| GPRS | General Packet Radio Service | Paketvermittelter Mobilfunkstandard der 2. Generation (2.5G), Vorläufer von UMTS. |
| GPS | Global Positioning System | Satellitengestütztes Ortungssystem. |
| GRE | Generic Routing Encapsulation | Tunneling-Protokoll, das beliebige Netzwerkprotokolle in IP-Pakete kapselt (u. a. Baustein für VPNs). |
| GSM | Global System for Mobile Communications | Mobilfunkstandard der 2. Generation. |
| GW | Gateway | Netzübergang, der zwischen unterschiedlichen Netzen/Protokollen vermittelt (z. B. Standard-Gateway = Router zum nächsten Netz). |
| HDLC | High-Level Data Link Control | Bitorientiertes Standardprotokoll der Sicherungsschicht, Nachfolger byteorientierter Protokolle wie BSC. |
| HTTP | HyperText Transfer Protocol | Anwendungsschicht-Protokoll für die Übertragung von Webinhalten; zustandslos, nutzt Methoden wie GET/POST/PUT/DELETE. Verschlüsselte Variante: HTTPS. |
| HTTPS | HyperText Transfer Protocol Secure | HTTP über eine TLS-verschlüsselte Verbindung - schützt Vertraulichkeit und Integrität der Übertragung und ist Grundschutz gegen Man-in-the-Middle-Angriffe. |
| IAB | Internet Architecture Board | Gremium, das die Weiterentwicklung der Internet-Protokolle/-Architektur beaufsichtigt; koordiniert IETF und IRTF. |
| ICMP | Internet Control Message Protocol | Steuerungs- und Fehlermeldungsprotokoll der Netzwerkschicht (u. a. Basis von `ping`/`traceroute`). |
| IEEE | Institute of Electrical and Electronics Engineers | Internationale Fachorganisation, Herausgeberin der 802.x-Standards (Ethernet, WLAN, VLAN, …). |
| IETF | Internet Engineering Task Force | Erarbeitet Internet-Standards, veröffentlicht als RFCs. |
| IHL | Internet Header Length | Feld im IPv4-Header, das die Länge des Headers angibt. |
| IMAP | Internet Message Access Protocol | E-Mail-Abrufprotokoll: E-Mails bleiben auf dem Server, mehrere Geräte sehen denselben Postfach-Zustand (Gegenstück: POP3). |
| IoT | Internet of Things | Internet der Dinge Vernetzung physischer Alltagsgeräte, die Daten senden/empfangen (Sensoren, Aktoren) - oft mit stromsparenden Funkstandards (LPWAN, NFC, …). |
| IP | Internet Protocol | Vermittlungsschicht-Protokoll, das logische Adressierung (IP-Adresse) und Routing zwischen Netzen ermöglicht. Aktuelle Versionen: IPv4, IPv6. |
| IPP | Internet Printing Protocol | Protokoll für Netzwerkdruck über IP-Netze. |
| IPv4 | Internet Protocol Version 4 | 32-Bit-Adressierung, klassisches IP-Adressformat (`x.x.x.x`); begrenzter Adressraum → Grund für IPv6. Vertiefung: Notiz IPv4 noch ohne Inhalt → siehe Notizen ohne Inhalt |
| IPv6 | Internet Protocol Version 6 | 128-Bit-Adressierung, Nachfolger von IPv4 mit erheblich größerem Adressraum. Vertiefung: Notiz IPv6 noch ohne Inhalt → siehe Notizen ohne Inhalt |
| IRTF | Internet Research Task Force | Forschungsgegenstück zur standardsetzenden IETF, beide koordiniert durch das IAB. |
| ISO | International Organization for Standardization | Internationale Normungsorganisation (u. a. Herausgeberin des OSI-Modells und der 27000-Normenreihe zusammen mit der IEC). |
| ISP | Internet Service Provider | Anbieter, der Endkunden Zugang zum Internet bereitstellt. |
| LAN | Local Area Network | Lokales Netz, auf ein Gebäude/Betriebsgelände begrenzt (z. B. IEEE-802.3-Ethernet). |
| LDAP | Lightweight Directory Access Protocol | Protokoll für den Zugriff auf Verzeichnisdienste (z. B. Benutzer-/Gruppenverwaltung). |
| LLC | Logical Link Control | Obere Teilschicht der Sicherungsschicht (OSI Layer 2), unabhängig vom physischen Übertragungsmedium (Gegenstück: MAC-Teilschicht). Vertiefung: Notiz LLC noch ohne Inhalt → siehe Notizen ohne Inhalt |
| LPWAN | Low Power Wide Area Network | Funknetztechnik für batteriebetriebene Geräte über große Entfernungen bei sehr geringem Energieverbrauch (IoT). |
| LTE | Long Term Evolution | Mobilfunkstandard der 4. Generation (4G). |
| MAC | Media Access Control | 1. Untere Teilschicht der Sicherungsschicht (OSI Layer 2), regelt den Zugriff auf das gemeinsame Medium. 2. MAC-Adresse - die weltweit (theoretisch) eindeutige Hardware-Adresse einer Netzwerkschnittstelle. Vertiefung: MAC |
| MAN | Metropolitan Area Network | Netz zwischen Städten/innerhalb einer Region, größer als LAN, kleiner als WAN. |
| MHz | Megahertz | Frequenzeinheit, z. B. bei Funkkanälen. |
| MIME | Multipurpose Internet Mail Extensions | Standard, der Mail-/HTTP-Inhalte mit Typinformation versieht (z. B. `text/html`, `image/png`). |
| MIMO | Multiple Input Multiple Output | Funktechnik mit mehreren Sende-/Empfangsantennen zur Steigerung von Durchsatz/Reichweite (u. a. bei modernem WLAN). |
| MSTP | Multiple Spanning Tree Protocol | Erweitert RSTP um mehrere unabhängige Spanning Trees für VLANs. |
| MX | Mail Exchange | DNS-Ressourceneintrag, der den zuständigen Mailserver einer Domain angibt. |
| NAT | Network Address Translation | Übersetzt private IP-Adressen in eine (oder wenige) öffentliche Adresse(n) beim Übergang ins Internet. |
| NetBIOS | Network Basic Input/Output System | Älterer Namens-/Sitzungsdienst für Windows-Netzwerke, historisch eng mit SMB verknüpft. |
| NFC | Near Field Communication | Funktechnik für sehr kurze Reichweite (wenige cm), z. B. kontaktloses Bezahlen. |
| NFS | Network File System | Protokoll für dateibasierte Netzwerkfreigaben, verbreitet im Unix/Linux-Umfeld (Pendant zu SMB/CIFS bei Windows). |
| NIC | Network Interface Card | Netzwerkkarte |
| NT | Netzwerk-Topologie | (Alias der Notiz) Vertiefung: Netzwerk-Topologien |
| NTP | Network Time Protocol | Protokoll zur Zeitsynchronisation von Systemen im Netz. |
| OFDM | Orthogonal Frequency Division Multiplexing | Modulationsverfahren, das ein Signal auf viele schmale, orthogonale Unterträger aufteilt - Basis moderner WLAN-/Mobilfunkstandards. |
| OSI | Open Systems Interconnection | 7-Schichten-Referenzmodell (ISO) zur Beschreibung der Netzwerkkommunikation, von der physischen Übertragung bis zur Anwendung. |
| OSPF | Open Shortest Path First | Link-State-Routing-Protokoll innerhalb eines autonomen Systems (Gegenstück: BGP zwischen Systemen). |
| OUI | Organizationally Unique Identifier | Erste 24 Bit einer MAC-Adresse; identifiziert den Hersteller der Netzwerkkomponente. |
| P2P | Peer-to-Peer | Netzwerkarchitektur, bei der Teilnehmer gleichberechtigt direkt miteinander kommunizieren, ohne zentralen Server. |
| PAN | Personal Area Network | Netz sehr kurzer Reichweite um eine Person (z. B. Bluetooth, NFC). |
| PAT | Port Address Translation | (auch: NAT-Overload) NAT-Variante, bei der viele private Adressen über verschiedene Ports auf eine einzige öffentliche IP abgebildet werden. |
| PCP | Priority Code Point | Feld im 802.1Q-VLAN-Tag, das die Priorität eines Frames (QoS) angibt. |
| PDU | Protocol Data Unit | Allgemeiner Begriff für die auf einer OSI-Schicht ausgetauschte Dateneinheit (z. B. Frame auf Schicht 2, Paket auf Schicht 3). |
| POP3 | Post Office Protocol Version 3 | E-Mail-Abrufprotokoll: E-Mails werden i. d. R. lokal heruntergeladen und vom Server gelöscht (Gegenstück: IMAP). |
| PPP | Point-to-Point Protocol | Sicherungsschicht-Protokoll für direkte Punkt-zu-Punkt-Verbindungen (z. B. klassische Einwahlverbindungen, manche DSL-Anschlüsse). |
| PTR | Pointer Record | DNS-Ressourceneintrag für die Reverse-Auflösung: IP-Adresse → Domainname. |
| QoS | Quality of Service | Mechanismen, die bestimmten Netzwerkverkehr priorisieren (z. B. Sprache/Video vor Datei-Downloads). |
| RFC | Request for Comments | Dokumentnummerierung der IETF für Internet-Standards und -Spezifikationen. |
| RFID | Radio-Frequency Identification | Funktechnik zur berührungslosen Identifikation/Auslesung von Transpondern (z. B. Zutrittskarten). |
| RSTP | Rapid Spanning Tree Protocol | Schnellere Weiterentwicklung von STP mit kürzerer Konvergenzzeit nach Topologieänderungen. |
| SMB | Server Message Block | Protokoll für Datei-/Druckerfreigaben im Netz, vor allem im Windows-Umfeld (Dialekt: CIFS). |
| SMS | Short Message Service | Kurznachrichtendienst im Mobilfunk. |
| SMTP | Simple Mail Transfer Protocol | Protokoll zum Versenden von E-Mails (Abrufen erfolgt über IMAP/POP3). |
| SNMP | Simple Network Management Protocol | Protokoll zur Überwachung und Verwaltung von Netzwerkgeräten (Router, Switches, …). |
| SSH | Secure Shell | Verschlüsseltes Protokoll für den sicheren Fernzugriff auf ein System (Terminal, Dateitransfer). |
| STP | Spanning Tree Protocol | Verhindert Schleifen (Loops) in redundant vermaschten Switch-Netzen, indem es Alternativpfade blockiert. Vertiefung: STP |
| STX | Start of Text | Steuerzeichen, das in älteren Protokollen (BSC) den Beginn eines Textblocks markiert (Gegenstück zu ETX). |
| SYN | Synchronize | TCP-Flag zum Verbindungsaufbau (Drei-Wege-Handshake: `SYN → SYN-ACK → ACK`). |
| TCI | Tag Control Information | Datenfeld im 802.1Q-VLAN-Tag, das u. a. PCP, DEI und VID enthält. |
| TCP | Transmission Control Protocol | Verbindungsorientiertes, zuverlässiges Transportschicht-Protokoll (Drei-Wege-Handshake, Flusskontrolle) - Gegenstück zum verbindungslosen UDP. |
| TCP-IP | TCP/IP-Referenzmodell | Praxisnahes, vierschichtiges Netzwerkmodell (Anwendung, Transport, Internet, Netzzugang), Grundlage des Internets - kompakter als das theoretische 7-Schichten-OSI-Modell. Schreibweisen: TCP/IP |
| TLD | Top-Level-Domain | Oberste Ebene der DNS-Hierarchie (z. B. `.de`, `.com`). |
| ToS | Type of Service | Feld im IPv4-Header zur Priorisierung von Datenverkehr (Vorläufer von DiffServ/QoS-Feldern). |
| TPID | Tag Protocol Identifier | Feld im 802.1Q-Frame, das anzeigt, dass es sich um einen VLAN-getaggten Frame handelt. |
| UDP | User Datagram Protocol | Verbindungsloses, „bestmögliches" Transportschicht-Protokoll ohne Zustellgarantie - schneller als TCP, genutzt z. B. bei DNS, Streaming, VoIP. |
| UMTS | Universal Mobile Telecommunications System | Mobilfunkstandard der 3. Generation (3G), Nachfolger von GPRS. |
| URI | Uniform Resource Identifier | Zeichenkette, die eine Ressource eindeutig identifiziert (Oberbegriff, zu dem u. a. die URL gehört). |
| VID | VLAN Identifier | 12-Bit-Feld im 802.1Q-Tag, das die VLAN-Zugehörigkeit eines Frames angibt (1–4094). |
| VLAN | Virtual LAN | Logische Unterteilung eines physischen Netzes in mehrere getrennte Broadcast-Domänen, realisiert über Switches (802.1Q-Tagging). Vertiefung: VLAN |
| VoIP | Voice over IP | Telefonie über IP-Netze statt klassischer Telefonnetze. |
| VPN | Virtual Private Network | Verschlüsselter Tunnel über ein öffentliches Netz, der ein sicheres, logisches Netz nachbildet (Site-to-Site oder Remote-Access). Vertiefung: VPN |
| W3C | World Wide Web Consortium | Standardisierungsgremium für Web-Technologien (HTML, CSS, WCAG, …). |
| WAN | Wide Area Network | Öffentliches Netz über große Entfernungen (z. B. Internet, Provider-Netze) - Gegenstück zum lokalen LAN. |
| WiFi | Wi-Fi | (Markenname, umgangssprachlich für WLAN nach IEEE 802.11) |
| WiMax | Worldwide Interoperability for Microwave Access | Funkstandard (IEEE 802.16) für drahtlose Breitbandnetze über größere Entfernungen als WLAN. |
| WLAN | Wireless LAN | Funkbasiertes lokales Netz (IEEE 802.11), auf ein Gebäude/Gelände begrenzt. |
| WS | WebSocket | Protokoll für bidirektionale, dauerhafte Verbindungen zwischen Client und Server über eine einzige TCP-Verbindung (z. B. für Echtzeit-Updates). |

Mehrdeutige Kürzel (z. B. CD, CI, AG) haben je nach Fach unterschiedliche Bedeutung. In Prüfungsaufgaben entscheidet der Kontext, welche gemeint ist.

## Einfach

Stell dir das Netzwerk als Straßenverkehr vor. Jede Abkürzung ist ein Verkehrsschild oder eine Regel: **IP** ist die Hausadresse, **MAC** die Seriennummer des Autos, **DNS** das Navi, das aus dem Namen eine Adresse macht, **DHCP** der Parkwächter, der jedem Auto einen Platz zuteilt, **TCP** der Einschreibebrief und **UDP** die Postkarte. **VLAN** sind getrennte Fahrspuren auf derselben Straße, **VPN** ein privater Tunnel unter der Straße. Wenn du eine Abkürzung nicht kennst, frag dich: Gehört sie zu Adresse, Regel, Gerät oder Dienst? Das grenzt die Antwort schon ein. Üb die Kürzel mit den Karteikarten, bis du sie ohne Nachdenken auflösen kannst, zum Beispiel beim Frühstück oder im Bus.

So gehst du vor: Schau dir jeden Tag zehn Kürzel an. Sprich die Langform laut aus, überlege dir ein Beispiel aus deinem Alltag oder deinem Betrieb und decke danach die Antwort zu. Wenn du ein Kürzel dreimal richtig hattest, wandert es in den hinteren Teil des Stapels. Kürzel, die du verwechselst, schreibst du nebeneinander auf und notierst den einen Satz, der sie unterscheidet. In der Prüfung hilft dir das doppelt: Du erkennst Aufgabentexte schneller, und wenn die Langform verlangt wird, schreibst du sie sicher und ohne Rechtschreibfehler. Wer die Kürzel kennt, spart in der Klausur wertvolle Minuten für die Rechenaufgaben.

## Merksatz
- Schichtzuordnung: ARP (2/3), IP und ICMP (3), TCP und UDP (4), HTTP, DNS, DHCP (7).
- Ports: 20/21 FTP, 22 SSH, 23 Telnet, 25 SMTP, 53 DNS, 67/68 DHCP, 80 HTTP, 110 POP3, 143 IMAP, 443 HTTPS, 3389 RDP.
- Kürzel nie nur auswendig, sondern mit Schicht und Zweck lernen.

## Prüfungsfalle
- Ähnliche Kürzel vertauschen: SMTP (senden) gegenüber IMAP/POP3 (empfangen), NAT gegenüber PAT, VLAN gegenüber VPN.
- IPv4-Kürzel auf IPv6 übertragen (z. B. ARP wird durch NDP ersetzt, Broadcast durch Multicast).
- Nur die Abkürzung nennen, wenn „ausgeschrieben und erläutert“ verlangt ist.

## Grafik
### So lernst du Abkürzungen
1. Lernender: liest das Kürzel
2. Lernender -> Gedächtnis: spricht die Langform laut aus
3. Gedächtnis: verknüpft sie mit Zweck und Schicht oder Kategorie
4. Lernender -> Karteikarte: prüft sich selbst nach einem Tag
5. Karteikarte -> Lernender: Wiederholung nach einer Woche festigt es

## Karteikarten
- F: Wofür steht AAAA? | A: AAAA-Record – DNS-Ressourceneintrag, der einen Domainnamen auf eine IPv6-Adresse abbildet (Pendant zum A-Record für IPv4).
- F: Wofür steht ACK? | A: Acknowledgement – Bestätigungs-Flag/-Paket in Protokollen (z. B. TCP-Handshake `SYN → SYN-ACK → ACK`, DHCP-DORA).
- F: Wofür steht AP? | A: Access Point – Funkzugangspunkt (Layer 2), an dem sich WLAN-Clients anmelden; verbindet das Funknetz mit dem kabelgebundenen LAN.
- F: Wofür steht APIPA? | A: Automatic Private IP Addressing – Windows-Mechanismus: Wenn kein DHCP-Server antwortet, vergibt sich der Client selbst eine Adresse aus `169.254.0.0/16` - typisches Fehlersymptom bei ausgefallenem DHCP.
- F: Wofür steht ARP? | A: Address Resolution Protocol – Löst eine bekannte IP-Adresse in die zugehörige MAC-Adresse im lokalen Netz auf; arbeitet formal auf Layer 2, nutzt aber Layer-3-Adressen. Vertiefung: Notiz ARP noch ohne Inhalt → siehe Notizen ohne Inhalt
- F: Wofür steht BEB? | A: Binary Exponential Backoff – Algorithmus zur Kollisionsauflösung bei CSMA/CD (Ethernet): nach einer Kollision wartet die Station eine zufällige, exponentiell wachsende Zeitspanne.
- F: Wofür steht BGP? | A: Border Gateway Protocol – Routing-Protokoll zwischen autonomen Systemen - das „Routing-Protokoll des Internets".
- F: Wofür steht BSC? | A: Binary Synchronous Communication – Älteres, byteorientiertes Übertragungsprotokoll der Sicherungsschicht (nutzt Steuerzeichen wie STX/ETX).
- F: Wofür steht CIDR? | A: Classless Inter-Domain Routing – Notation für IP-Netze mit variabler Subnetzmaske (z. B. `/24`); löste das starre Klassen-A/B/C-System ab.
- F: Wofür steht CIFS? | A: Common Internet File System – Microsoft-Dialekt des SMB-Protokolls für Datei-/Druckerfreigaben im Netz.
- F: Wofür steht CNAME? | A: Canonical Name – DNS-Ressourceneintrag, der einen Domainnamen als Alias auf einen anderen Domainnamen umleitet.
- F: Wofür steht CRC? | A: Cyclic Redundancy Check – Prüfsummenverfahren zur Fehlererkennung in übertragenen Daten (z. B. Teil der FCS bei Ethernet-Frames).
- F: Wofür steht CSMA? | A: Carrier Sense Multiple Access – Zugriffsverfahren, bei dem Stationen vor dem Senden das Medium abhören („Carrier Sense") und sich das Medium teilen („Multiple Access"). Zwei Varianten: CSMA/CA und CSMA/CD.
- F: Wofür steht CSMA-CA? | A: Carrier Sense Multiple Access / Collision Avoidance – CSMA-Variante, die Kollisionen aktiv vermeidet (u. a. durch Wartezeiten/RTS-CTS) - Standard bei WLAN, wo Kollisionserkennung nicht zuverlässig funktioniert. Schreibweisen: CSMA/CA Vertiefung: Notiz CSMA-CA noch ohne Inhalt → siehe Notizen ohne Inhalt
- F: Wofür steht CSMA-CD? | A: Carrier Sense Multiple Access / Collision Detection – CSMA-Variante, die Kollisionen während der Übertragung erkennt und abbricht (BEB-Backoff) - klassisches Ethernet-Zugriffsverfahren (bei modernem Vollduplex-Switching nicht mehr nötig). Schreibweisen: CSMA/CD Vertiefung: CSMA-CD
- F: Wofür steht DHCP? | A: Dynamic Host Configuration Protocol – Vergibt IP-Adressen und Netzwerkkonfiguration automatisch an Clients - Ablauf nach dem DORA-Schema (Discover-Offer-Request-Ack).
- F: Wofür steht DIX? | A: DIX-Ethernet-Standard – (Digital, Intel, Xerox) Ursprünglicher Ethernet-Frame-Standard der drei Herstellerfirmen, Vorläufer von IEEE 802.3.
- F: Wofür steht DLE? | A: Data Link Escape – Steuerzeichen, das in älteren byteorientierten Protokollen (z. B. BSC) Steuersequenzen einleitet.
- F: Wofür steht DMZ? | A: Demilitarized Zone – Abgeschottetes Zwischennetz zwischen Internet und internem Netz für öffentlich erreichbare Server (Web-, Mail-Server) - begrenzt den Schaden bei Kompromittierung.
- F: Wofür steht DNS? | A: Domain Name System – Übersetzt Domainnamen in IP-Adressen (und umgekehrt); hierarchisch verteilte Datenbank.
- F: Wofür steht DORA? | A: Merkwort – für den DHCP-Ablauf: Discover → Offer → Request → Acknowledge.
- F: Wofür steht DSL? | A: Digital Subscriber Line – Breitband-Übertragungstechnik über die klassische Kupfer-Telefonleitung. Vertiefung: Notiz DSL noch ohne Inhalt → siehe Notizen ohne Inhalt
- F: Wofür steht DT? | A: Datenübertragungstechnik – (Alias der Notiz) Vertiefung: Datenübertragungstechnik
- F: Wofür steht ETX? | A: End of Text – Steuerzeichen, das in älteren Protokollen (BSC) das Ende eines Textblocks markiert (Gegenstück zu STX).
- F: Wofür steht FCS? | A: Frame Check Sequence – Prüfsumme am Ende eines Ethernet-Frames zur Fehlererkennung (nutzt CRC).
- F: Wofür steht FTP? | A: File Transfer Protocol – Protokoll zur Dateiübertragung; unverschlüsselt (Gegenstück: FTPS).
- F: Wofür steht FTPS? | A: File Transfer Protocol Secured – FTP mit TLS-Verschlüsselung.
- F: Wofür steht GAN? | A: Global Area Network – Netz mit weltweiter Ausdehnung (Internet, Telefonnetz) - die größte Netzklasse.
- F: Wofür steht GPRS? | A: General Packet Radio Service – Paketvermittelter Mobilfunkstandard der 2. Generation (2.5G), Vorläufer von UMTS.
- F: Wofür steht GPS? | A: Global Positioning System – Satellitengestütztes Ortungssystem.
- F: Wofür steht GRE? | A: Generic Routing Encapsulation – Tunneling-Protokoll, das beliebige Netzwerkprotokolle in IP-Pakete kapselt (u. a. Baustein für VPNs).
- F: Wofür steht GSM? | A: Global System for Mobile Communications – Mobilfunkstandard der 2. Generation.
- F: Wofür steht GW? | A: Gateway – Netzübergang, der zwischen unterschiedlichen Netzen/Protokollen vermittelt (z. B. Standard-Gateway = Router zum nächsten Netz).
- F: Wofür steht HDLC? | A: High-Level Data Link Control – Bitorientiertes Standardprotokoll der Sicherungsschicht, Nachfolger byteorientierter Protokolle wie BSC.
- F: Wofür steht HTTP? | A: HyperText Transfer Protocol – Anwendungsschicht-Protokoll für die Übertragung von Webinhalten; zustandslos, nutzt Methoden wie GET/POST/PUT/DELETE. Verschlüsselte Variante: HTTPS.
- F: Wofür steht HTTPS? | A: HyperText Transfer Protocol Secure – HTTP über eine TLS-verschlüsselte Verbindung - schützt Vertraulichkeit und Integrität der Übertragung und ist Grundschutz gegen Man-in-the-Middle-Angriffe.
- F: Wofür steht IAB? | A: Internet Architecture Board – Gremium, das die Weiterentwicklung der Internet-Protokolle/-Architektur beaufsichtigt; koordiniert IETF und IRTF.
- F: Wofür steht ICMP? | A: Internet Control Message Protocol – Steuerungs- und Fehlermeldungsprotokoll der Netzwerkschicht (u. a. Basis von `ping`/`traceroute`).
- F: Wofür steht IEEE? | A: Institute of Electrical and Electronics Engineers – Internationale Fachorganisation, Herausgeberin der 802.x-Standards (Ethernet, WLAN, VLAN, …).
- F: Wofür steht IETF? | A: Internet Engineering Task Force – Erarbeitet Internet-Standards, veröffentlicht als RFCs.
- F: Wofür steht IHL? | A: Internet Header Length – Feld im IPv4-Header, das die Länge des Headers angibt.
- F: Wofür steht IMAP? | A: Internet Message Access Protocol – E-Mail-Abrufprotokoll: E-Mails bleiben auf dem Server, mehrere Geräte sehen denselben Postfach-Zustand (Gegenstück: POP3).
- F: Wofür steht IoT? | A: Internet of Things – Internet der Dinge Vernetzung physischer Alltagsgeräte, die Daten senden/empfangen (Sensoren, Aktoren) - oft mit stromsparenden Funkstandards (LPWAN, NFC, …).
- F: Wofür steht IP? | A: Internet Protocol – Vermittlungsschicht-Protokoll, das logische Adressierung (IP-Adresse) und Routing zwischen Netzen ermöglicht. Aktuelle Versionen: IPv4, IPv6.
- F: Wofür steht IPP? | A: Internet Printing Protocol – Protokoll für Netzwerkdruck über IP-Netze.
- F: Wofür steht IPv4? | A: Internet Protocol Version 4 – 32-Bit-Adressierung, klassisches IP-Adressformat (`x.x.x.x`); begrenzter Adressraum → Grund für IPv6. Vertiefung: Notiz IPv4 noch ohne Inhalt → siehe Notizen ohne Inhalt
- F: Wofür steht IPv6? | A: Internet Protocol Version 6 – 128-Bit-Adressierung, Nachfolger von IPv4 mit erheblich größerem Adressraum. Vertiefung: Notiz IPv6 noch ohne Inhalt → siehe Notizen ohne Inhalt
- F: Wofür steht IRTF? | A: Internet Research Task Force – Forschungsgegenstück zur standardsetzenden IETF, beide koordiniert durch das IAB.
- F: Wofür steht ISO? | A: International Organization for Standardization – Internationale Normungsorganisation (u. a. Herausgeberin des OSI-Modells und der 27000-Normenreihe zusammen mit der IEC).
- F: Wofür steht ISP? | A: Internet Service Provider – Anbieter, der Endkunden Zugang zum Internet bereitstellt.
- F: Wofür steht LAN? | A: Local Area Network – Lokales Netz, auf ein Gebäude/Betriebsgelände begrenzt (z. B. IEEE-802.3-Ethernet).
- F: Wofür steht LDAP? | A: Lightweight Directory Access Protocol – Protokoll für den Zugriff auf Verzeichnisdienste (z. B. Benutzer-/Gruppenverwaltung).
- F: Wofür steht LLC? | A: Logical Link Control – Obere Teilschicht der Sicherungsschicht (OSI Layer 2), unabhängig vom physischen Übertragungsmedium (Gegenstück: MAC-Teilschicht). Vertiefung: Notiz LLC noch ohne Inhalt → siehe Notizen ohne Inhalt
- F: Wofür steht LPWAN? | A: Low Power Wide Area Network – Funknetztechnik für batteriebetriebene Geräte über große Entfernungen bei sehr geringem Energieverbrauch (IoT).
- F: Wofür steht LTE? | A: Long Term Evolution – Mobilfunkstandard der 4. Generation (4G).
- F: Wofür steht MAC? | A: Media Access Control – 1. Untere Teilschicht der Sicherungsschicht (OSI Layer 2), regelt den Zugriff auf das gemeinsame Medium. 2. MAC-Adresse - die weltweit (theoretisch) eindeutige Hardware-Adresse einer Netzwerkschnittstelle. Vertiefung: MAC
- F: Wofür steht MAN? | A: Metropolitan Area Network – Netz zwischen Städten/innerhalb einer Region, größer als LAN, kleiner als WAN.
- F: Wofür steht MHz? | A: Megahertz – Frequenzeinheit, z. B. bei Funkkanälen.
- F: Wofür steht MIME? | A: Multipurpose Internet Mail Extensions – Standard, der Mail-/HTTP-Inhalte mit Typinformation versieht (z. B. `text/html`, `image/png`).
- F: Wofür steht MIMO? | A: Multiple Input Multiple Output – Funktechnik mit mehreren Sende-/Empfangsantennen zur Steigerung von Durchsatz/Reichweite (u. a. bei modernem WLAN).
- F: Wofür steht MSTP? | A: Multiple Spanning Tree Protocol – Erweitert RSTP um mehrere unabhängige Spanning Trees für VLANs.
- F: Wofür steht MX? | A: Mail Exchange – DNS-Ressourceneintrag, der den zuständigen Mailserver einer Domain angibt.
- F: Wofür steht NAT? | A: Network Address Translation – Übersetzt private IP-Adressen in eine (oder wenige) öffentliche Adresse(n) beim Übergang ins Internet.
- F: Wofür steht NetBIOS? | A: Network Basic Input/Output System – Älterer Namens-/Sitzungsdienst für Windows-Netzwerke, historisch eng mit SMB verknüpft.
- F: Wofür steht NFC? | A: Near Field Communication – Funktechnik für sehr kurze Reichweite (wenige cm), z. B. kontaktloses Bezahlen.
- F: Wofür steht NFS? | A: Network File System – Protokoll für dateibasierte Netzwerkfreigaben, verbreitet im Unix/Linux-Umfeld (Pendant zu SMB/CIFS bei Windows).
- F: Wofür steht NIC? | A: Network Interface Card – Netzwerkkarte
- F: Wofür steht NT? | A: Netzwerk-Topologie – (Alias der Notiz) Vertiefung: Netzwerk-Topologien
- F: Wofür steht NTP? | A: Network Time Protocol – Protokoll zur Zeitsynchronisation von Systemen im Netz.
- F: Wofür steht OFDM? | A: Orthogonal Frequency Division Multiplexing – Modulationsverfahren, das ein Signal auf viele schmale, orthogonale Unterträger aufteilt - Basis moderner WLAN-/Mobilfunkstandards.
- F: Wofür steht OSI? | A: Open Systems Interconnection – 7-Schichten-Referenzmodell (ISO) zur Beschreibung der Netzwerkkommunikation, von der physischen Übertragung bis zur Anwendung.
- F: Wofür steht OSPF? | A: Open Shortest Path First – Link-State-Routing-Protokoll innerhalb eines autonomen Systems (Gegenstück: BGP zwischen Systemen).
- F: Wofür steht OUI? | A: Organizationally Unique Identifier – Erste 24 Bit einer MAC-Adresse; identifiziert den Hersteller der Netzwerkkomponente.
- F: Wofür steht P2P? | A: Peer-to-Peer – Netzwerkarchitektur, bei der Teilnehmer gleichberechtigt direkt miteinander kommunizieren, ohne zentralen Server.
- F: Wofür steht PAN? | A: Personal Area Network – Netz sehr kurzer Reichweite um eine Person (z. B. Bluetooth, NFC).
- F: Wofür steht PAT? | A: Port Address Translation – (auch: NAT-Overload) NAT-Variante, bei der viele private Adressen über verschiedene Ports auf eine einzige öffentliche IP abgebildet werden.
- F: Wofür steht PCP? | A: Priority Code Point – Feld im 802.1Q-VLAN-Tag, das die Priorität eines Frames (QoS) angibt.
- F: Wofür steht PDU? | A: Protocol Data Unit – Allgemeiner Begriff für die auf einer OSI-Schicht ausgetauschte Dateneinheit (z. B. Frame auf Schicht 2, Paket auf Schicht 3).
- F: Wofür steht POP3? | A: Post Office Protocol Version 3 – E-Mail-Abrufprotokoll: E-Mails werden i. d. R. lokal heruntergeladen und vom Server gelöscht (Gegenstück: IMAP).
- F: Wofür steht PPP? | A: Point-to-Point Protocol – Sicherungsschicht-Protokoll für direkte Punkt-zu-Punkt-Verbindungen (z. B. klassische Einwahlverbindungen, manche DSL-Anschlüsse).
- F: Wofür steht PTR? | A: Pointer Record – DNS-Ressourceneintrag für die Reverse-Auflösung: IP-Adresse → Domainname.
- F: Wofür steht QoS? | A: Quality of Service – Mechanismen, die bestimmten Netzwerkverkehr priorisieren (z. B. Sprache/Video vor Datei-Downloads).
- F: Wofür steht RFC? | A: Request for Comments – Dokumentnummerierung der IETF für Internet-Standards und -Spezifikationen.
- F: Wofür steht RFID? | A: Radio-Frequency Identification – Funktechnik zur berührungslosen Identifikation/Auslesung von Transpondern (z. B. Zutrittskarten).
- F: Wofür steht RSTP? | A: Rapid Spanning Tree Protocol – Schnellere Weiterentwicklung von STP mit kürzerer Konvergenzzeit nach Topologieänderungen.
- F: Wofür steht SMB? | A: Server Message Block – Protokoll für Datei-/Druckerfreigaben im Netz, vor allem im Windows-Umfeld (Dialekt: CIFS).
- F: Wofür steht SMS? | A: Short Message Service – Kurznachrichtendienst im Mobilfunk.
- F: Wofür steht SMTP? | A: Simple Mail Transfer Protocol – Protokoll zum Versenden von E-Mails (Abrufen erfolgt über IMAP/POP3).
- F: Wofür steht SNMP? | A: Simple Network Management Protocol – Protokoll zur Überwachung und Verwaltung von Netzwerkgeräten (Router, Switches, …).
- F: Wofür steht SSH? | A: Secure Shell – Verschlüsseltes Protokoll für den sicheren Fernzugriff auf ein System (Terminal, Dateitransfer).
- F: Wofür steht STP? | A: Spanning Tree Protocol – Verhindert Schleifen (Loops) in redundant vermaschten Switch-Netzen, indem es Alternativpfade blockiert. Vertiefung: STP
- F: Wofür steht STX? | A: Start of Text – Steuerzeichen, das in älteren Protokollen (BSC) den Beginn eines Textblocks markiert (Gegenstück zu ETX).
- F: Wofür steht SYN? | A: Synchronize – TCP-Flag zum Verbindungsaufbau (Drei-Wege-Handshake: `SYN → SYN-ACK → ACK`).
- F: Wofür steht TCI? | A: Tag Control Information – Datenfeld im 802.1Q-VLAN-Tag, das u. a. PCP, DEI und VID enthält.
- F: Wofür steht TCP? | A: Transmission Control Protocol – Verbindungsorientiertes, zuverlässiges Transportschicht-Protokoll (Drei-Wege-Handshake, Flusskontrolle) - Gegenstück zum verbindungslosen UDP.
- F: Wofür steht TCP-IP? | A: TCP/IP-Referenzmodell – Praxisnahes, vierschichtiges Netzwerkmodell (Anwendung, Transport, Internet, Netzzugang), Grundlage des Internets - kompakter als das theoretische 7-Schichten-OSI-Modell. Schreibweisen: TCP/IP
- F: Wofür steht TLD? | A: Top-Level-Domain – Oberste Ebene der DNS-Hierarchie (z. B. `.de`, `.com`).
- F: Wofür steht ToS? | A: Type of Service – Feld im IPv4-Header zur Priorisierung von Datenverkehr (Vorläufer von DiffServ/QoS-Feldern).
- F: Wofür steht TPID? | A: Tag Protocol Identifier – Feld im 802.1Q-Frame, das anzeigt, dass es sich um einen VLAN-getaggten Frame handelt.
- F: Wofür steht UDP? | A: User Datagram Protocol – Verbindungsloses, „bestmögliches" Transportschicht-Protokoll ohne Zustellgarantie - schneller als TCP, genutzt z. B. bei DNS, Streaming, VoIP.
- F: Wofür steht UMTS? | A: Universal Mobile Telecommunications System – Mobilfunkstandard der 3. Generation (3G), Nachfolger von GPRS.
- F: Wofür steht URI? | A: Uniform Resource Identifier – Zeichenkette, die eine Ressource eindeutig identifiziert (Oberbegriff, zu dem u. a. die URL gehört).
- F: Wofür steht VID? | A: VLAN Identifier – 12-Bit-Feld im 802.1Q-Tag, das die VLAN-Zugehörigkeit eines Frames angibt (1–4094).
- F: Wofür steht VLAN? | A: Virtual LAN – Logische Unterteilung eines physischen Netzes in mehrere getrennte Broadcast-Domänen, realisiert über Switches (802.1Q-Tagging). Vertiefung: VLAN
- F: Wofür steht VoIP? | A: Voice over IP – Telefonie über IP-Netze statt klassischer Telefonnetze.
- F: Wofür steht VPN? | A: Virtual Private Network – Verschlüsselter Tunnel über ein öffentliches Netz, der ein sicheres, logisches Netz nachbildet (Site-to-Site oder Remote-Access). Vertiefung: VPN
- F: Wofür steht W3C? | A: World Wide Web Consortium – Standardisierungsgremium für Web-Technologien (HTML, CSS, WCAG, …).
- F: Wofür steht WAN? | A: Wide Area Network – Öffentliches Netz über große Entfernungen (z. B. Internet, Provider-Netze) - Gegenstück zum lokalen LAN.
- F: Wofür steht WiFi? | A: Wi-Fi – (Markenname, umgangssprachlich für WLAN nach IEEE 802.11)
- F: Wofür steht WiMax? | A: Worldwide Interoperability for Microwave Access – Funkstandard (IEEE 802.16) für drahtlose Breitbandnetze über größere Entfernungen als WLAN.
- F: Wofür steht WLAN? | A: Wireless LAN – Funkbasiertes lokales Netz (IEEE 802.11), auf ein Gebäude/Gelände begrenzt.
- F: Wofür steht WS? | A: WebSocket – Protokoll für bidirektionale, dauerhafte Verbindungen zwischen Client und Server über eine einzige TCP-Verbindung (z. B. für Echtzeit-Updates).

## Quiz

? Wofür steht IMAP?
* Internet Message Access Protocol
- Metropolitan Area Network
- Long Term Evolution
- Classless Inter-Domain Routing

? Wofür steht DNS?
* Domain Name System
- Global System for Mobile Communications
- Cyclic Redundancy Check
- Open Shortest Path First

? Wofür steht LAN?
* Local Area Network
- Media Access Control
- Binary Synchronous Communication
- World Wide Web Consortium

? Wofür steht RFID?
* Radio-Frequency Identification
- Organizationally Unique Identifier
- Dynamic Host Configuration Protocol
- General Packet Radio Service

? Wofür steht BGP?
* Border Gateway Protocol
- Quality of Service
- Port Address Translation
- Classless Inter-Domain Routing

? Wofür steht CIFS?
* Common Internet File System
- Personal Area Network
- Port Address Translation
- Lightweight Directory Access Protocol

? Wofür steht VPN?
* Virtual Private Network
- Border Gateway Protocol
- General Packet Radio Service
- Binary Exponential Backoff

? Wofür steht NTP?
* Network Time Protocol
- Organizationally Unique Identifier
- Wireless LAN
- Data Link Escape

? Wofür steht CSMA?
* Carrier Sense Multiple Access
- Institute of Electrical and Electronics Engineers
- Long Term Evolution
- Domain Name System

? Wofür steht IPv6?
* Internet Protocol Version 6
- Open Systems Interconnection
- Dynamic Host Configuration Protocol
- Personal Area Network

? Wofür steht PAN?
* Personal Area Network
- Internet Engineering Task Force
- Open Shortest Path First
- Virtual Private Network

? Wofür steht BSC?
* Binary Synchronous Communication
- Simple Network Management Protocol
- Frame Check Sequence
- Carrier Sense Multiple Access / Collision Detection

? Wofür steht NFC?
* Near Field Communication
- Port Address Translation
- Personal Area Network
- Request for Comments

? Wofür steht GAN?
* Global Area Network
- Frame Check Sequence
- International Organization for Standardization
- Carrier Sense Multiple Access

? Wofür steht ARP?
* Address Resolution Protocol
- Open Shortest Path First
- Synchronize
- Common Internet File System

? Wofür steht CRC?
* Cyclic Redundancy Check
- Peer-to-Peer
- Binary Synchronous Communication
- Pointer Record
