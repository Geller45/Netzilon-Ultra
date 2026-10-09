---
id: ccna-ueberblick
bereich: CCNA
block: CCNA 0
kapitel: CCNA – Überblick
titel: CCNA 200-301 – Prüfung, Blueprint v1.1 und Lernweg
stufe: Einsteiger
fach: TCP/IP – CCNA – Basic
pruefungen: [CCNA, AP2]
quellen: [200_301_CCNA_v1.0_2.pdf, CCNA_200-301_Notes_-_Jeremys_IT_Lab.pdf, 200-301.pdf, cisco_100-101.pdf]
verweise: [ccna-netzwerkkomponenten, ccna-osi-tcpip, ccna-cli-grundlagen, ccna-pruefungsfragen, ref-cisco-ios]
---

## Profi

### Die Prüfung
Die **CCNA** (Cisco Certified Network Associate) ist die Einstiegs-Zertifizierung von Cisco für Netzwerktechnik. Es gibt **eine** Prüfung: **200-301 CCNA**, Dauer **120 Minuten**, Sprache Englisch (bzw. Japanisch), abgelegt bei Pearson VUE (Testcenter oder online). Fragetypen: Multiple Choice (eine/mehrere richtige), **Drag and Drop**, **Simlets/Testlets** (Konfiguration ablesen) und **Simulationen** (Konfiguration im simulierten IOS). Zurückblättern ist **nicht** möglich – jede Frage ist endgültig. Die Zertifizierung ist **3 Jahre** gültig (Rezertifizierung per Prüfung oder Continuing Education Credits).

### Blueprint v1.1 (gültig seit August 2024)
Die Quelle `200_301_CCNA_v1.0_2.pdf` zeigt die Version **1.0** (2020/2021). Die aktuelle Version **1.1** behält die sechs Bereiche und Gewichte bei, bringt aber Änderungen:

| Bereich | Gewicht | Kernthemen |
|---|---|---|
| 1.0 **Network Fundamentals** | 20 % | Komponenten, Topologien, Kabel, TCP/UDP, IPv4/IPv6, Subnetting, WLAN-Grundlagen, Virtualisierung, Switching |
| 2.0 **Network Access** | 20 % | VLANs, Trunks/802.1Q, CDP/LLDP, EtherChannel (LACP), Rapid PVST+, WLAN-Architekturen, WLC |
| 3.0 **IP Connectivity** | 25 % | Routingtabelle, Longest Prefix Match, AD, statische Routen (IPv4/IPv6), OSPFv2 Single Area, FHRP |
| 4.0 **IP Services** | 10 % | NAT (statisch, Pool), NTP, DHCP/DNS, SNMP, Syslog, DHCP-Relay, QoS (PHB), SSH, TFTP/FTP |
| 5.0 **Security Fundamentals** | 15 % | Bedrohungen, Passwörter/MFA, IPsec-VPN, ACLs, Port Security, DHCP Snooping, DAI, AAA, WPA2/WPA3 |
| 6.0 **Automation and Programmability** | 10 % | Automatisierung, Controller/SDN, Catalyst Center, REST/JSON, Ansible/Terraform, KI/ML |

**Änderungen in v1.1 gegenüber v1.0** (für die Prüfung 2026 maßgeblich):
- **Cisco DNA Center** heißt jetzt **Cisco Catalyst Center**.
- **Puppet und Chef** wurden gestrichen, dafür **Terraform** (neben Ansible) aufgenommen.
- Neu: **KI (generativ und prädiktiv) und Machine Learning im Netzwerkbetrieb** sowie Cloud-Netzwerkverwaltung (z. B. Meraki-Dashboard).
- Begriffe wie Cloud-Management und Netzwerkautomatisierung werden stärker betont; Fachinhalte zu Routing/Switching bleiben gleich.

### Was nicht (mehr) geprüft wird
Jeremy's IT Lab kennzeichnet **DTP/VTP** als „Not in Syllabus“ – sie tauchen aber in Demo-Fragen auf (z. B. `switchport mode dynamic auto`). **RIP und EIGRP** werden nicht konfiguriert, aber AD-Werte und Grundprinzip (Distance Vector) muss man kennen. **ICND1/ICND2 (100-101/200-101)** sind die **alten** Prüfungen bis 2020 – die Frage-Inhalte (OSI, CDP, TCP/UDP) sind trotzdem weiter gültig.

### Werkzeuge zum Üben
- **Cisco Packet Tracer** (kostenlos über Netacad) – Simulation von Routern, Switches, PCs, WLC; reicht für 90 % der CCNA-Labs.
- **Cisco Modeling Labs (CML)**, GNS3, EVE-NG – echte IOS-Images, näher an der Praxis.
- Eigene Lab-Konvention in dieser App: Geräte heißen **R1, R2 (Router), SW1, SW2 (Switch), PC1, PC2, SRV1**. Der Prompt zeigt immer den Modus, z. B. `R1(config-if)#`.

### Lernstrategie (Rückwärtsplan)
1. Grundlagen + Subnetting sicher (Ziel: /24–/30 im Kopf in 30 s).
2. Switching (VLAN, Trunk, STP, EtherChannel) im Packet Tracer bauen.
3. Routing (statisch, OSPF) und Routingtabellen lesen.
4. Dienste und Sicherheit (NAT, DHCP, ACL, Port Security).
5. Automation-Theorie (JSON lesen, REST-Verben, SDN-Begriffe).
6. Zwei Wochen nur Fragenpools + Simulationen.

## Einfach

Stell dir vor, die CCNA ist der **Führerschein für Netzwerke**. Wer ihn hat, beweist: „Ich weiß, wie Daten durch ein Firmennetz fahren, und ich kann die Ampeln (Router) und Kreuzungen (Switches) selbst einstellen.“

Die Prüfung hat **sechs Kapitel** – wie sechs Fächer in einem Zeugnis:
1. **Grundlagen** – Was ist ein Kabel, eine IP-Adresse, ein Switch?
2. **Netzzugang** – Wie werden Geräte im Haus verbunden (VLANs, WLAN)?
3. **IP-Verbindungen** – Wie findet ein Paket den Weg in ein anderes Netz (Routing)?
4. **Dienste** – Helfer wie DHCP (verteilt Adressen), DNS (Telefonbuch), NTP (Uhrzeit).
5. **Sicherheit** – Türsteher (ACLs), Ausweiskontrolle (Port Security).
6. **Automatisierung** – Statt jeden Router per Hand einzustellen, schreibt man ein „Rezept“, das ein Programm für alle ausführt.

Du hast **zwei Stunden**. Du kannst nicht zurückblättern – also jede Frage gleich richtig beantworten. Manche Aufgaben sind wie ein Computerspiel: Du tippst Befehle in einen simulierten Router.

Das Wichtigste zum Üben ist **Packet Tracer**: ein kostenloses Programm, in dem du Router und Switches per Maus hinstellst und verkabelst – wie Lego für Netzwerker. Alles, was du in dieser App bei „Lab“ findest, kannst du dort nachbauen.

Für deine **IHK-Prüfung (AP1/AP2)** hilft die CCNA auch: Subnetting, VLAN, Routing, NAT und Ports kommen dort ständig dran.

## Merksatz
- **6 Bereiche, 120 Minuten, kein Zurück.**
- Gewichte: **20 – 20 – 25 – 10 – 15 – 10** („Zwanzig, zwanzig, fünfundzwanzig – dann zehn, fünfzehn, zehn“).
- v1.1: **DNA Center → Catalyst Center**, **Puppet/Chef raus, Terraform rein**, **KI/ML neu**.

## Prüfungsfalle
- Die Schul-Unterlage `200_301_CCNA_v1.0_2.pdf` ist **Version 1.0** – Puppet/Chef und „DNA Center“ sind dort noch enthalten; für Prüfungen ab August 2024 gilt **v1.1**.
- 100-101 (ICND1) ist eine **abgelaufene** Prüfung – Fragen daraus sind Übungsmaterial, keine aktuelle Prüfungsquelle.
- Frage-Dumps (z. B. „exams4sure“, „Demo Questions“) enthalten teils **falsche Lösungen** – immer mit der Theorie gegenprüfen (siehe `ccna-pruefungsfragen`).

## Grafik
### Sechs Bereiche als Tortendiagramm
1. Tortendiagramm erscheint mit sechs Segmenten in Blau/Cyan.
2. Segment 3.0 IP Connectivity (25 %) wächst und leuchtet als größtes.
3. Segmente 1.0 und 2.0 (je 20 %) blinken nacheinander.
4. Segmente 4.0, 5.0, 6.0 erscheinen mit Beschriftung 10/15/10.
5. Klick auf ein Segment springt zur Kapitelübersicht.

### Lernweg
1. Lernender: Startet bei Grundlagen
2. Lernender -> Switching: Pfeil zu VLAN/STP
3. Switching -> Routing: Pfeil zu OSPF
4. Routing -> Dienste: Pfeil zu NAT/DHCP
5. Dienste -> Sicherheit: Pfeil zu ACL
6. Sicherheit -> Prüfung: Pokal erscheint

## Übungen
- A: Nenne die sechs Bereiche des CCNA-Blueprints mit Gewichtung. | L: Network Fundamentals 20 %, Network Access 20 %, IP Connectivity 25 %, IP Services 10 %, Security Fundamentals 15 %, Automation and Programmability 10 %.
- A: Welche drei inhaltlichen Änderungen bringt Blueprint v1.1? | L: DNA Center heißt Catalyst Center; Puppet/Chef entfallen, Terraform kommt dazu; KI/ML im Netzwerkbetrieb neu.
- A: Welcher Bereich hat das höchste Gewicht und was gehört dazu? | L: IP Connectivity (25 %): Routingtabelle, Longest Prefix Match, AD, statisches Routing, OSPFv2, FHRP.

## Karteikarten
- F: Wie heißt die aktuelle CCNA-Prüfung und wie lange dauert sie? | A: 200-301 CCNA, 120 Minuten.
- F: Wie lange ist die CCNA gültig? | A: 3 Jahre.
- F: Welcher Blueprint-Bereich ist am stärksten gewichtet? | A: 3.0 IP Connectivity mit 25 %.
- F: Wie heißt Cisco DNA Center seit v1.1 im Blueprint? | A: Cisco Catalyst Center.
- F: Welche Konfigurationsmanagement-Tools nennt Blueprint v1.1? | A: Ansible und Terraform (Puppet/Chef entfallen).
- F: Kann man in der CCNA-Prüfung zu früheren Fragen zurückspringen? | A: Nein, jede Antwort ist endgültig.
- F: Welches kostenlose Simulationsprogramm nutzt man für CCNA-Labs? | A: Cisco Packet Tracer.
- F: Welche Fragetypen gibt es? | A: Multiple Choice, Drag and Drop, Testlets/Simlets und Simulationen.
- F: Was war die 100-101? | A: Die alte ICND1-Prüfung (bis 2020), Vorgänger-Teil der CCNA.
- F: Welche zwei Bereiche haben je 10 %? | A: IP Services und Automation and Programmability.

## Quiz
? Wie viel Prozent macht „Security Fundamentals“ im CCNA-Blueprint aus?
* 15 %
- 10 %
- 20 %
- 25 %
! Gewichte: 20/20/25/10/15/10.

? Welches Werkzeug wurde in Blueprint v1.1 neu aufgenommen?
* Terraform
- Puppet
- Chef
- SaltStack
! Puppet und Chef wurden gestrichen, Terraform ergänzt Ansible.

? Wie lange dauert die 200-301-Prüfung?
* 120 Minuten
- 90 Minuten
- 60 Minuten
- 180 Minuten

? Welcher Bereich enthält OSPFv2?
* IP Connectivity
- Network Access
- IP Services
- Network Fundamentals

? Wie heißt Ciscos Controller-Plattform für Campus-Netze im aktuellen Blueprint?
* Catalyst Center
- DNA Center
- Prime Infrastructure
- Meraki Hub

? In welchem Bereich wird EtherChannel (LACP) geprüft?
* Network Access
- IP Connectivity
- Security Fundamentals
- Automation and Programmability

? Was gilt für Antworten in der CCNA-Prüfung?
* Man kann nicht zu früheren Fragen zurückkehren
- Man kann alle Fragen am Ende überprüfen
- Simulationen werden nicht bewertet
- Es gibt nur Multiple-Choice-Fragen

? Welcher Bereich ist mit 20 % gewichtet?
* Network Fundamentals
- IP Services
- Security Fundamentals
- Automation and Programmability

## Spickzettel
- 200-301, 120 min, kein Zurückblättern, 3 Jahre gültig
- 20 % Fundamentals · 20 % Access · 25 % IP Connectivity
- 10 % IP Services · 15 % Security · 10 % Automation
- v1.1: Catalyst Center, Terraform statt Puppet/Chef, KI/ML
- Labs: Packet Tracer, Prompt-Modus immer beachten
