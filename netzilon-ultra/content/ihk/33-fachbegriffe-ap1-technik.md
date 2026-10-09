---
id: ihk-fachbegriffe-technik
bereich: AP1
block: IHK
kapitel: Fachbegriffe AP1
titel: AP1-Fachbegriffe Teil 1 – Cloud, Netzwerkprotokolle, IPv4/IPv6, Bussysteme, Datenbanken, UML, Software
stufe: Einsteiger
fach: PV – AP1
pruefungen: [AP1]
quellen: [baf15487-Fachbegriffe.pdf]
verweise: [ihk-fachbegriffe-betrieb-security, ihk-lz-protokolle, ihk-lz-vlan-wlan-ipv6, ihk-lz-datenbank-sql, ihk-entwicklungswerkzeuge]
---

## Profi

### Cloud-Modelle
**Bereitstellung:** *Public Cloud* (externer Anbieter über das Internet), *Private Cloud* (nur eine Organisation, on-premise oder gehostet), *Hybrid Cloud* (unkritisches öffentlich, datenschutzkritisches im eigenen Haus). **Servicemodelle:** *IaaS* (Anbieter liefert Storage, Virtualisierung, Server, Netz; Kunde verwaltet OS, Anwendungen, Daten; z. B. AWS EC2, Azure VM), *PaaS* (Anbieter betreibt zusätzlich die Laufzeitumgebung; Kunde entwickelt und betreibt Anwendungen; z. B. Google App Engine), *SaaS* (fertige Anwendung im Browser, Anbieter macht Updates; z. B. OneDrive, Microsoft 365).

### Protokolle und Dienste
| Protokoll | Kern | Port |
|---|---|---|
| TCP | verbindungsorientiert, zuverlässig, geordnet | – |
| UDP | verbindungslos, schnell, kein Handshake (Streaming, Gaming, DNS) | – |
| FTP | unverschlüsselt, zwei Verbindungen (Befehle, Daten) | 20/21 |
| SSH / SFTP | verschlüsselter Fernzugriff, SFTP über eine Verbindung | 22 |
| Telnet | veraltet, unverschlüsselt | 23 |
| SMTP | E-Mail senden | 25 |
| DNS | Name in IP auflösen | 53 |
| DHCP | IP, Maske, Gateway, DNS automatisch | 67/68 |
| HTTP / HTTPS | Web, zustandslos; HTTPS = HTTP über TLS | 80 / 443 |
| POP3 | Mails laden, standardmäßig vom Server löschen | 110 |
| IMAP | Mails zentral auf dem Server, mehrere Geräte | 143 |
| RDP | Windows-Fernzugriff | 3389 |

**ARP** ermittelt per Broadcast die MAC-Adresse zu einer IPv4-Adresse (Schicht 2/3). **ICMP** (Schicht 3) meldet Fehler und Status, Basis für ping und traceroute. **VPN** = verschlüsselter Tunnel zu einem VPN-Server. **SSL** ist veraltet, **TLS** der Nachfolger (Vertraulichkeit, Authentizität, Integrität). **HTML** strukturiert Webinhalte, **CSS** gestaltet sie.
**IoT-Funk:** MQTT (M2M-Nachrichten), LoRaWAN (stromsparend, bis ca. 15 km), BLE (Bluetooth Low Energy), ZigBee (Mesh, Gebäudeautomation), RFID (berührungslose Identifikation), NFC (auf RFID basiert, kurze Distanz, Bezahlen).

### Adressen
- **MAC:** 48 Bit, hexadezimal, erste 24 Bit = Herstellerkennung (OUI).
- **IPv4:** 32 Bit, vier Oktette, Netzteil + Hostteil, Subnetzmaske oder CIDR-Suffix (/24 = 255.255.255.0). **APIPA** 169.254.0.1 bis 169.254.255.254 (Maske 255.255.0.0), wenn kein DHCP erreichbar ist; kein Gateway, daher nur lokale Kommunikation.
- **IPv6:** 128 Bit, 8 Blöcke zu je 16 Bit; Standard-Präfix /64 (Standortpräfix + Teilnetz-ID), Rest = Interface Identifier. Typen: Global Unicast `2000::/3`, Unique Local `fc00::/7`, Link Local `fe80::/10`, Loopback `::1`. Multicast ersetzt Broadcast. Vergabe: SLAAC, DHCPv6, statisch. Adressdopplung verhindern NDP und DAD. Privacy Extensions wechseln die Adresse zufällig.
- **Kürzen:** führende Nullen weglassen, **einmal** eine Folge reiner Nullblöcke durch `::` ersetzen. `2a02:0000:0000:99a0:bf15:0000:67aa:1c1a` wird `2a02::99a0:bf15:0:67aa:1c1a`.

### Schnittstellen und Bussysteme (Mikrocontroller)
GPIO (frei programmierbare Pins), UART (asynchron seriell), I2C (2 Leitungen, mehrere Teilnehmer), SPI (4 Leitungen, Master und Slave, schnell), OneWire (1 Datenleitung, auch Stromversorgung).

### Datenbanken
DBS = Daten + DBMS (Software). Normalisierung vermeidet Redundanz und Anomalien (Einfüge-, Änderungs-, Löschanomalie). ERM: Entität, Attribut, Beziehung, Kardinalität 1:1, 1:n, n:m. Relationenmodell: Tabellen mit Primär- und Fremdschlüsseln, aus dem ERM abgeleitet.

### UML
Use-Case-Diagramm (Was tut das System für wen, nicht wie), Aktivitätsdiagramm (Ablauf von Start bis Ende mit Entscheidungen), Klassendiagramm (Klassen, Attribute, Methoden, Beziehungen).

### Software
Schreibtischtest (Variablen in Tabelle verfolgen). Sprachebenen: Maschinensprache (binär), Assembler, Hochsprache (Compiler oder Interpreter). Paradigmen: imperativ (C, Java, Python), deklarativ (SQL, HTML, CSS), objektorientiert. Phasen: Anforderungsanalyse, Entwurf, Implementierung, Test, Dokumentation, Integration/Betrieb, Wartung. Systemsoftware (Betriebssystem, Treiber, Dienstprogramme), Standardsoftware, Individualsoftware. Lizenzen: Open Source (Quellcode offen: Linux), Freeware (kostenlos, Quellcode geschlossen: z. B. Adobe Reader), Shareware (zeit-/funktionsbegrenzt), Closed Source (kostenpflichtig, Windows). Compiler, Interpreter, Linker, Debugger, IDE; Bibliothek (Funktionssammlung, wird aufgerufen) gegenüber Framework (Grundgerüst, ruft deinen Code auf).

## Einfach

**Cloud** heißt: Du mietest, anstatt zu kaufen. Public Cloud ist wie ein Hochhaus, in dem viele Firmen wohnen. Private Cloud ist dein eigenes Haus. Hybrid ist beides gemischt. Bei **IaaS** mietest du nur das leere Grundstück mit Strom und baust alles selbst. Bei **PaaS** mietest du eine fertig eingerichtete Werkstatt, du bringst dein Projekt mit. Bei **SaaS** nutzt du das fertige Produkt wie Leitungswasser aus dem Hahn.

**TCP** ist ein Einschreibebrief: Der Empfänger bestätigt, und alles kommt in der richtigen Reihenfolge an. **UDP** ist eine Postkarte: schnell, aber ohne Garantie. **DNS** ist das Telefonbuch des Internets. **DHCP** ist die Hausverwaltung, die jedem neuen Gerät eine Wohnung (IP) zuteilt. **ARP** fragt laut in die Runde: „Wem gehört diese IP? Wie ist deine Hausnummer (MAC)?"

**POP3** holt die Briefe aus dem Briefkasten und nimmt sie mit nach Hause. **IMAP** lässt sie im Briefkasten und zeigt sie dir überall.

**IPv4** hat vier Zahlen wie eine Postleitzahl mit Hausnummer. **IPv6** ist das neue, riesige Adresssystem, weil die alten Nummern knapp wurden. Bei der Kurzschreibweise darfst du eine Folge von Nullen genau einmal durch `::` ersetzen, sonst weiß man nicht, wie viele Nullen wo stehen.

**Datenbank** ist ein riesiger Aktenschrank mit Tabellen. Normalisieren heißt: dieselbe Info nicht zweimal aufschreiben. **UML** sind Skizzen zum Planen von Software.

## Merksatz
- IaaS = Infrastruktur, PaaS = Plattform, SaaS = fertige Software.
- TCP zuverlässig, UDP schnell.
- POP3 holt ab, IMAP synchronisiert.
- Ports: 20/21 FTP, 22 SSH, 23 Telnet, 25 SMTP, 53 DNS, 80 HTTP, 110 POP3, 143 IMAP, 443 HTTPS, 3389 RDP.
- IPv6: `::` nur einmal, Link Local fe80::/10, Loopback ::1.
- APIPA 169.254.x.x = kein DHCP erreicht.
- I2C 2 Drähte, SPI 4 Drähte, OneWire 1 Draht.

## Prüfungsfalle
- „Mehrfaches `::` ist erlaubt": nein, nur einmal je Adresse.
- APIPA-Adresse als Internetfähigkeit deuten: ohne Gateway kein Internet.
- IMAP und POP3 vertauschen.
- SFTP mit FTPS verwechseln: SFTP läuft über SSH (Port 22), FTPS ist FTP mit TLS.
- Quelle nennt für FAT32 „8 TB Partitionsgröße"; üblich gelten bis 2 TB (512-Byte-Sektoren), Dateien maximal 4 GB. In der Prüfung die 4-GB-Dateigrenze nennen.
- Quelle schreibt „SCLAAC"; richtig ist SLAAC (Stateless Address Autoconfiguration).
- Freeware mit Open Source gleichsetzen: Freeware hat keinen offenen Quellcode. Die Quelle nennt VLC als Freeware; VLC ist in Wirklichkeit Open Source (GPL), als Freeware-Beispiel besser Adobe Reader.
- Use-Case-Diagramm beschreibt das Was, nicht das Wie.

## Grafik
### ARP-Auflösung
1. Client: kennt die Ziel-IP, aber nicht die MAC
2. Client -> Switch: ARP-Request als Broadcast
3. Switch -> Server: Broadcast wird an alle Ports verteilt
4. Server -> Client: ARP-Reply mit der eigenen MAC (Unicast)
5. Client: speichert IP und MAC im ARP-Cache

### E-Mail-Weg
1. Absender -> Mailserver A: SMTP sendet die Nachricht
2. Mailserver A -> Mailserver B: SMTP leitet sie weiter
3. Empfänger -> Mailserver B: ruft per IMAP oder POP3 ab
4. Mailserver B -> Empfänger: liefert die Nachricht

## Lücken
- Eine IPv6-Adresse hat {128} Bit und besteht aus {8} Blöcken.
- Die APIPA-Adresse beginnt mit {169.254}.
- {IMAP} synchronisiert Mails zentral auf dem Server, {POP3} lädt sie herunter.
- Der Port von HTTPS ist {443}, der von SSH {22}.
- Die ersten 24 Bit einer MAC-Adresse nennt man {OUI} (Herstellerkennung).

## Zuordnen
### Dienst und Port
- FTP => 20/21
- SSH => 22
- SMTP => 25
- DNS => 53
- RDP => 3389

### Servicemodell und Beispiel
- IaaS => Microsoft Azure VM
- PaaS => Google App Engine
- SaaS => OneDrive

## Spickzettel
- IaaS Infrastruktur, PaaS Plattform, SaaS fertige Software
- TCP zuverlässig, UDP schnell ohne Handshake
- Ports: 22 SSH, 25 SMTP, 53 DNS, 80 HTTP, 110 POP3, 143 IMAP, 443 HTTPS, 3389 RDP
- IPv6 128 Bit, 8 Blöcke, `::` nur einmal
- APIPA 169.254.0.0/16
- MAC 48 Bit, erste 24 Bit OUI
- I2C 2 Draht, SPI 4 Draht, OneWire 1 Draht
- Normalisierung gegen Redundanz und Anomalien

## Übungen
- A: Kürzen Sie 2a02:0000:0000:99a0:0f15:0000:00aa:1c1a. | L: 2a02::99a0:f15:0:aa:1c1a
- A: Welches Netzteil/Hostteil hat 192.168.0.1/24? | L: Netzteil 192.168.0, Hostteil .1; Maske 255.255.255.0.
- A: Nennen Sie je zwei Vorteile von IMAP gegenüber POP3. | L: Zugriff von mehreren Geräten, Nachrichten und Ordner bleiben zentral und synchron.

## Karteikarten
- F: Public, Private, Hybrid Cloud? | A: Extern für alle, nur für eine Organisation, Mischform mit kritischen Daten im Haus.
- F: Was verwaltet der Kunde bei IaaS? | A: Betriebssystem, Laufzeit, Anwendungen und Daten.
- F: Unterschied TCP und UDP? | A: TCP verbindungsorientiert und zuverlässig, UDP verbindungslos und schnell.
- F: Wofür dient ICMP? | A: Fehler- und Statusmeldungen auf Schicht 3, Basis für ping und traceroute.
- F: Was macht ARP? | A: Findet per Broadcast die MAC-Adresse zu einer IPv4-Adresse.
- F: Was ist APIPA? | A: Automatische Adresse 169.254.x.x, wenn kein DHCP erreichbar ist; ohne Gateway.
- F: Aufbau einer IPv6-Adresse? | A: 128 Bit, 8 Blöcke zu 16 Bit; Präfix (meist /64) plus Interface Identifier.
- F: Link-Local-Adresse bei IPv6? | A: fe80::/10, immer vorhanden.
- F: Welche Aufgabe haben NDP und DAD? | A: Nachbarn finden und doppelte Adressen erkennen.
- F: Was ist MQTT? | A: Leichtgewichtiges Nachrichtenprotokoll für M2M/IoT.
- F: Was unterscheidet I2C und SPI? | A: I2C 2 Leitungen, SPI 4 Leitungen und schneller.
- F: Unterschied Bibliothek und Framework? | A: Bibliothek wird vom Programm aufgerufen, Framework gibt die Struktur vor und ruft den Code auf.
- F: Was ist ein Schreibtischtest? | A: Manuelles Durchspielen des Codes mit Variablentabelle.
- F: Deklarative Sprachen? | A: SQL, HTML, CSS: beschreiben das Ergebnis, nicht den Weg.

## Quiz
? Welche Aussage zu IaaS ist richtig?
* Der Kunde verwaltet Betriebssystem und Anwendungen selbst.
- Der Anbieter liefert eine fertige Anwendung im Browser.
- Der Anbieter pflegt auch alle Anwendungen.
- Es gibt keine virtuellen Server.

? Welche Adresse ist eine APIPA-Adresse?
* 169.254.12.7
- 192.168.1.1
- 10.0.0.5
- 172.16.4.9

? Wie lautet die Loopback-Adresse bei IPv6?
* ::1
- fe80::1
- 2000::1
- ff02::1

? Welches Protokoll lässt Mails zentral auf dem Server und erlaubt Zugriff von mehreren Geräten?
* IMAP
- POP3
- SMTP
- FTP

? Wie viele Bit hat eine MAC-Adresse?
* 48
- 32
- 64
- 128

? Was ist ein Linker?
* Programm, das Objektdateien und Bibliotheken zur ausführbaren Datei verbindet
- Programm, das Quelltext zeilenweise ausführt
- Werkzeug zum schrittweisen Prüfen von Fehlern
- Texteditor

? Welche Software hat offenen Quellcode?
* Linux
- Windows
- Photoshop
- Microsoft Office

? Wofür steht SPI?
* Serial Peripheral Interface
- Simple Protocol Interface
- Secure Packet Inspection
- Serial Port Input

? Was beschreibt ein Use-Case-Diagramm?
* Anwendungsfälle und Akteure
- Datenbanktabellen
- Zeitliche Abläufe mit Zweigen
- Klassen und Vererbung

? Welche Aussagen zu IPv6-Kürzung sind richtig? (mehrere)
* Führende Nullen dürfen entfallen.
* `::` darf nur einmal vorkommen.
- `::` darf beliebig oft vorkommen.
- Nullen in der Mitte dürfen nie gekürzt werden.
