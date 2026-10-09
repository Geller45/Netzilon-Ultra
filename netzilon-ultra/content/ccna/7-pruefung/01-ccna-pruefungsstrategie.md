---
id: ccna-pruefungsfragen
bereich: CCNA
block: CCNA 200-301
kapitel: Prüfung
titel: CCNA 200-301 – Prüfungsstrategie, Themengewichtung und Szenarioaufgaben
stufe: Profi
fach: TCP/IP – CCNA – Basic
pruefungen: [CCNA]
quellen: [200_301_CCNA_v1.0_2.pdf, 200-301.pdf, cisco_100-101.pdf, CCNA_200-301_Notes_-_Jeremys_IT_Lab.pdf]
verweise: [ccna-ueberblick, ccna-subnetting, ccna-ospf, ccna-acl-extended, ccna-stp, ccna-vlan]
---

## Profi

### Aufbau der Prüfung 200-301
Dauer **120 Minuten**, ca. 100–120 Fragen (Multiple Choice, Mehrfachauswahl, Drag-and-Drop, Simulationen/Lab, Testlets). Bestehensgrenze rund 825/1000 (nicht veröffentlicht). Keine Rückkehr zu beantworteten Fragen in Testlets möglich; Simulationen sind ohne Fehlermeldung (kein `?`-Kontext in manchen Aufgaben). Strategie: Zeit pro Frage ca. 60–70 s, Simulationen priorisiert nach Gewichtung.

### Gewichtung (Domänen, Stand 200-301 v1.1)
| Domäne | Anteil |
|---|---|
| 1 Network Fundamentals | 20 % |
| 2 Network Access | 20 % |
| 3 IP Connectivity | 25 % |
| 4 IP Services | 10 % |
| 5 Security Fundamentals | 15 % |
| 6 Automation and Programmability | 10 % |

### Lernpfad in Netzilon Ultra
1. **Grundlagen** (OSI, Kabel, Switching, TCP/UDP, IPv4/IPv6, Subnetting) – Subnetting muss in unter 30 Sekunden gelingen.
2. **Netzzugang**: VLAN, Trunk, STP, EtherChannel, WLAN.
3. **IP-Konnektivität**: Routing-Tabelle, statisch, OSPF, FHRP.
4. **IP-Dienste**: DHCP, DNS, NAT, NTP, SNMP, Syslog, QoS, SSH.
5. **Sicherheit**: ACL, Port Security, DHCP Snooping/DAI, VPN, AAA, WLAN-Sicherheit.
6. **Automation**: SDN, REST/JSON, Ansible.

### Typische Prüfungsmuster
- **Show-Ausgabe lesen**: `show ip route`, `show interfaces trunk`, `show spanning-tree`, `show ip ospf neighbor`, `show etherchannel summary` – Codes (C, L, S, O), Rollen, States interpretieren.
- **Fehlersuche**: Layer-für-Layer von unten (Kabel → VLAN → IP → Gateway → DNS).
- **Subnetting**: Netz/Broadcast/Hosts, VLSM-Zuweisung, Summary-Route.
- **Konfig. ergänzen**: fehlende Befehle erkennen (z. B. ip routing, ip nat outside, no shutdown).
- **Reihenfolgefragen** (Drag-and-Drop): DORA, OSPF-Zustände, STP-Zustände.

## Einfach

Die CCNA-Prüfung ist wie ein **großer Test in der Fahrschule**, nur eben für Netzwerke. Sie dauert 2 Stunden, und es gibt verschiedene Fragearten: Ankreuzen, Zuordnen und kleine Praxisaufgaben, bei denen du wirklich an einem simulierten Router Befehle eintippst.

Was kommt dran? Wie in der Schule gibt es **Fächer** mit unterschiedlicher Wichtigkeit:
- Das größte Fach (**IP-Konnektivität**, ein Viertel) sind Routing und OSPF.
- Dann kommen **Grundlagen** und **Netzzugang** (VLANs, Spanning Tree) mit je einem Fünftel.
- **Sicherheit** zählt 15 %, **Dienste** (DHCP, NAT …) und **Automation** je 10 %.

Wie lernst du am besten?
1. **Erst die Grundlagen sicher** (Subnetting übst du, bis es wie Einmaleins klingt).
2. **Dann jedes Thema einmal selbst bauen** – im Packet Tracer ein kleines Netz mit Router, Switch und PCs. Wer einmal selbst ein VLAN eingerichtet hat, vergisst es nicht.
3. **Befehle lesen lernen**: Du bekommst oft nur die Ausgabe eines Befehls und sollst sagen, was los ist.
4. **Zeit einteilen**: Bei Zeitdruck lieber eine schwere Aufgabe überspringen und zurückkommen (aber Achtung: in manchen Aufgabenblöcken geht das nicht).

Trick: Wenn du dir bei einer Frage unsicher bist, streiche zuerst die Antworten, die offensichtlich falsch sind. Meist bleiben zwei übrig, und dann kannst du raten oder logisch schließen.

## Merksatz
- **120 Minuten, ca. 100 Fragen, ca. 825/1000 Punkte.**
- **Gewichtung: 20 – 20 – 25 – 10 – 15 – 10.**
- **Immer von unten nach oben prüfen (OSI).**
- **Subnetting und Routing sind die Punktebringer.**
- **Befehle nach Ausgaben lesen, nicht auswendig.**

## Prüfungsfalle
- **Mehrfachauswahl-Fragen** geben an, wie viele Antworten gesucht sind („Choose two“).
- **Verlockende Altlasten**: ISL, RIPv1, Telnet sind Legacy.
- **Simulationen**: Konfiguration speichern (`copy run start`) vergessen, wenn gefordert.
- **Subnetting-Falle**: Hostanzahl +2 vergessen.
- **Wildcard statt Subnetzmaske** bei OSPF/ACL – häufiger Fehler.
- **Gigabit-Cost = 1** in OSPF bei Standardreferenz.
- Die Zahlen zur Prüfung ändern sich durch Cisco-Updates; immer aktuelle Blueprint-PDF prüfen.

## Grafik
### Lernplan
1. Text: Woche 1–2 Grundlagen und Subnetting
2. Text: Woche 3–4 VLAN, Trunk, STP, EtherChannel
3. Text: Woche 5–6 Routing statisch und OSPF
4. Text: Woche 7 IP-Dienste (DHCP, NAT, NTP, SNMP)
5. Text: Woche 8 Sicherheit, Automation, Probeprüfung

## Lab
**Packet Tracer: Abschlusslab mit allen Themen**

### Cisco IOS
1. Topologie: 2 Router (OSPF), 2 Switches (Trunk, STP, EtherChannel), VLAN 10/20/99, ROAS oder L3-Switch, DHCP-Relay, NAT/PAT zum ISP, ACL (nur Web aus VLAN 10), Port Security an f0/1–f0/10, SSH-Zugriff.
2. Checkliste:
```
show vlan brief
show interfaces trunk
show spanning-tree
show etherchannel summary
show ip route
show ip ospf neighbor
show ip dhcp binding
show ip nat translations
show access-lists
show port-security
show ip ssh
```
3. Ziel: Jede Ausgabe erklären können, Fehler einbauen und finden.

## Befehle
- `show running-config | section ospf` – Abschnitt filtern
- `show ip interface brief` – Interface-Übersicht
- `show version` – IOS, Uptime
- `show interfaces status` – Port-Status am Switch

## Übungen
- A: Wie lange dauert die CCNA-Prüfung? | L: 120 Minuten.
- A: Welche Domäne hat den größten Anteil? | L: IP Connectivity (25 %).
- A: Nennen Sie die sechs Domänen. | L: Network Fundamentals, Network Access, IP Connectivity, IP Services, Security Fundamentals, Automation and Programmability.
- A: Was heißt „Choose two“? | L: Es sind genau zwei Antworten auszuwählen.
- A: Wie gehen Sie bei Fehlersuche vor? | L: Schichtweise von Layer 1 nach oben (Kabel/Link → VLAN/Trunk → IP/Gateway → Routing → Dienste).
- A: Welche Befehle zeigen alle Interfaces mit IP? | L: show ip interface brief.

## Karteikarten
- F: Dauer der CCNA 200-301? | A: 120 Minuten.
- F: Größte Domäne? | A: IP Connectivity (25 %).
- F: Anteil Security Fundamentals? | A: 15 %.
- F: Anteil Automation? | A: 10 %.
- F: Anteil IP Services? | A: 10 %.
- F: Anteil Network Fundamentals und Network Access? | A: Je 20 %.
- F: Befehl zur Interface-Übersicht? | A: show ip interface brief
- F: Befehl zur Trunk-Prüfung? | A: show interfaces trunk
- F: Befehl zur OSPF-Nachbarschaft? | A: show ip ospf neighbor
- F: Wie speichert man die Konfig? | A: copy running-config startup-config

## Quiz
? Wie lange dauert die CCNA 200-301?
* 120 Minuten
- 60 Minuten
- 180 Minuten
- 240 Minuten
? Welche Domäne wiegt am meisten?
* IP Connectivity
- Security Fundamentals
- Automation
- IP Services
? Wie hoch ist der Anteil von Network Access?
* 20 %
- 10 %
- 25 %
- 15 %
? Was bedeutet "Choose two"?
* Genau zwei Antworten wählen
- Höchstens zwei
- Mindestens zwei
- Alle
? Welche Wildcard gehört zu /30?
* 0.0.0.3
- 0.0.0.7
- 0.0.0.1
- 0.0.0.15
? Welcher Befehl zeigt Trunk-Ports?
* show interfaces trunk
- show vlan trunk
- show trunk
- show ip trunk
? Wie sichert man die Konfiguration dauerhaft?
* copy running-config startup-config
- write mem all
- save running
- backup nvram
? Welche Reihenfolge hat DORA?
* Discover, Offer, Request, Acknowledge
- Offer, Discover, Acknowledge, Request
- Request, Offer, Acknowledge, Discover
- Acknowledge, Request, Discover, Offer
? In welcher Reihenfolge prüft man bei Fehlersuche?
* Von Layer 1 nach oben
- Von Layer 7 nach unten
- Zufällig
- Nur Layer 3
