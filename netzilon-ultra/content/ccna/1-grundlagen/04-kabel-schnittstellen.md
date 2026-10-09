---
id: ccna-kabel-schnittstellen
bereich: CCNA
block: CCNA 1.3–1.4
kapitel: Network Fundamentals
titel: Kabel und Schnittstellen – UTP, Glasfaser, Pinbelegung, Duplex, Interface-Fehler
stufe: Fortgeschritten
fach: TCP/IP – CCNA – Basic
pruefungen: [CCNA, AP1]
quellen: [CCNA_200-301_Notes_-_Jeremys_IT_Lab.pdf, 200-301.pdf, cisco_100-101.pdf, OSI_Schichtenmodell.pdf, Kupferkabel. Twisted Pair.md, Lichtwellenleiter.md, Switchin-Internet.md]
verweise: [ap1-a4-topologie, netz-strukturierte-verkabelung, ccna-switching-mac-arp, ccna-netzwerkkomponenten]
---

## Profi

### Ethernet-Standards (IEEE 802.3)
Ethernet ist eine **Familie von Standards** (IEEE 802.3, seit 1983) für Kabel, Stecker und Rahmenformat. Geschwindigkeiten in **bit/s** (1 kbit = 1.000 bit, 1 Mbit = 10⁶, 1 Gbit = 10⁹).
| Geschwindigkeit | Name | Standard | Bezeichnung | max. Länge | Adernpaare |
|---|---|---|---|---|---|
| 10 Mbit/s | Ethernet | 802.3i | 10BASE-T | 100 m | 2 |
| 100 Mbit/s | Fast Ethernet | 802.3u | 100BASE-TX | 100 m | 2 |
| 1 Gbit/s | Gigabit Ethernet | 802.3ab | 1000BASE-T | 100 m | 4 |
| 10 Gbit/s | 10 Gigabit | 802.3an | 10GBASE-T | 100 m (Cat 6A) | 4 |
**BASE** = Basisband, **T** = Twisted Pair. UTP (Unshielded Twisted Pair): Die Verdrillung schützt gegen **EMI** (elektromagnetische Störungen) und Übersprechen.

### Pinbelegung RJ45 (10/100BASE-T)
| Gerät | sendet (TX) auf Pins | empfängt (RX) auf Pins |
|---|---|---|
| Router, Firewall, PC (MDI) | **1, 2** | **3, 6** |
| Switch, Hub (MDI-X) | **3, 6** | **1, 2** |
- **Straight-Through** (1:1): verbindet **unterschiedliche** Gerätegruppen (PC↔Switch, Router↔Switch).
- **Crossover** (1↔3, 2↔6): verbindet **gleiche** Gerätegruppen (Switch↔Switch, Router↔Router, PC↔PC, **PC↔Router**).
- **Rollover/Konsolenkabel**: RJ45 ↔ DB9/USB zum **Console-Port** (9600 Baud, 8N1).
- **Auto-MDI-X**: moderne Ports erkennen die Belegung selbst – das Kabel ist dann egal.
- 1000BASE-T/10GBASE-T nutzen **alle 4 Paare bidirektional**.

### Glasfaser (LWL)
Aufbau: **Kern (Core)** – **Mantel (Cladding)** – **Schutzbeschichtung (Buffer)** – **Außenmantel (Jacket)**. Anschluss am Switch meist über **SFP/SFP+-Transceiver**; getrennte Fasern für Senden/Empfangen.
| | **Singlemode (SMF)** | **Multimode (MMF)** |
|---|---|---|
| Kerndurchmesser | **schmal** (ca. 9 µm) | breiter (50/62,5 µm) |
| Lichtquelle | **Laser**, ein Lichtweg (Mode) | **LED/VCSEL**, mehrere Moden |
| Reichweite | **größte** (km bis 40+ km) | kürzer als SMF, länger als UTP |
| Kosten | teurer (Laser-SFP) | günstiger |
| Beispiel | 1000BASE-LX (5 km SMF), 10GBASE-LR (10 km), 10GBASE-ER (30/40 km) | 1000BASE-SX (550 m), 10GBASE-SR (300–400 m) |

### UTP vs. Glasfaser
| UTP | Glasfaser |
|---|---|
| günstig, RJ45-Ports billiger als SFP | teurer |
| max. ca. 100 m | große Reichweite |
| anfällig für EMI | keine EMI, galvanische Trennung |
| strahlt schwach ab → **abhörbar** | keine Abstrahlung → abhörsicher |
| unterstützt **PoE** | kein PoE |

### Geteiltes Medium vs. Punkt-zu-Punkt
- **Shared Media**: alte Ethernet-Busse/Hubs – alle teilen sich die Leitung, **Halbduplex**, Kollisionen, **CSMA/CD**.
- **Point-to-Point**: Switch-Port ↔ Gerät – eigene Leitung, **Vollduplex**, keine Kollisionen. Full Duplex braucht **eigenen Switch-Port** pro Knoten und beide Seiten müssen Vollduplex können (100-101 Frage 1: A, B, E).

### Speed/Duplex und Autonegotiation
Standard auf Cisco-Ports: `speed auto`, `duplex auto`. Beide Seiten tauschen ihre Fähigkeiten aus und wählen das Beste. **Ist auf der Gegenseite Autonegotiation aus:**
- **Speed**: Der Switch erkennt die Geschwindigkeit elektrisch; klappt das nicht, nimmt er die **langsamste** (10 Mbit/s).
- **Duplex**: bei 10/100 Mbit/s → **Halbduplex**, bei ≥1 Gbit/s → **Vollduplex**.
Ergebnis kann ein **Duplex-Mismatch** sein (eine Seite voll, eine halb): Verbindung „funktioniert“, aber langsam, mit **Late Collisions** auf der Halbduplex-Seite und CRC/Runts auf der anderen. **Speed-Mismatch** → Interface `down/down`.

### Interface-Zähler (`show interfaces`)
| Zähler | Bedeutung | typische Ursache |
|---|---|---|
| **Runts** | Frames **< 64 Byte** | Kollisionen, Duplex-Mismatch |
| **Giants** | Frames **> 1518 Byte** | MTU-Fehler, falsche Konfiguration |
| **CRC** | FCS-Prüfung fehlgeschlagen | defektes Kabel, EMI, Duplex-Mismatch |
| **Frame** | falsches Format | Leitungsstörung |
| **Input errors** | Summe der Eingangsfehler | – |
| **Output errors** | Senden fehlgeschlagen | – |
| **Collisions** / **Late collisions** | Kollisionen (nach 64 Byte = late) | Halbduplex, Duplex-Mismatch, zu lange Kabel |

### Interface-Status
`show ip interface brief`: **Status** = Layer 1, **Protocol** = Layer 2.
| Status/Protocol | Bedeutung |
|---|---|
| up/up | funktioniert |
| administratively down/down | `shutdown` konfiguriert (Standard bei **Router**-Ports) |
| down/down | kein Kabel/Gegenseite aus, Speed-Mismatch |
| up/down | L1 ok, L2-Problem (z. B. Kapselung HDLC↔PPP, Keepalive) |
| down/down (err-disabled) | Port Security, BPDU Guard o. Ä. |

## Einfach

Ein Netzwerkkabel ist wie eine **Straße mit acht Fahrspuren** (acht Adern). Bei alten 100-Mbit-Netzen werden nur vier Spuren genutzt: zwei zum **Hinfahren** (Senden) und zwei zum **Zurückfahren** (Empfangen).

Ein **PC** fährt auf Spur 1+2 los und erwartet Antworten auf Spur 3+6. Ein **Switch** macht es genau **umgekehrt** – so passen PC und Switch mit einem **geraden Kabel** (Straight-Through) zusammen. Verbindet man aber zwei **gleiche** Geräte (Switch mit Switch), würden beide auf derselben Spur losfahren – Frontalzusammenstoß! Deshalb gibt es das **gekreuzte Kabel** (Crossover). Heute sind die Geräte schlau (**Auto-MDI-X**) und tauschen die Spuren selbst.

**Glasfaser** schickt **Licht** statt Strom. Das ist wie eine **Taschenlampe in einem verspiegelten Rohr**:
- **Singlemode**: ganz dünnes Rohr, ein Laserstrahl geht schnurgerade – kommt sehr weit (viele Kilometer).
- **Multimode**: dickeres Rohr, das Licht springt im Zickzack – billiger, aber nur ein paar hundert Meter.

**Duplex**: **Vollduplex** ist wie ein **Telefonat** – beide reden gleichzeitig. **Halbduplex** ist wie ein **Walkie-Talkie** – einer redet, der andere wartet. Stellt man ein Gerät auf Telefon und das andere auf Walkie-Talkie, gibt es Chaos (Duplex-Mismatch): Es geht irgendwie, aber sehr langsam und mit vielen Fehlern.

## Merksatz
- **PC und Router senden auf 1/2, Switch auf 3/6.**
- **Gleich ↔ gleich = Crossover, verschieden = Straight.**
- **Singlemode = schmal + Laser + weit; Multimode = breit + LED + kürzer.**
- **Runt < 64, Giant > 1518.**
- **Status = L1, Protocol = L2.**

## Prüfungsfalle
- PC ↔ Router direkt braucht **Crossover** (beide senden auf 1/2).
- Jeremys Notes vertauschen in Kapitel 9 die Spalten („Status (Layer 2) und Protocol (Layer 1)“) – richtig: **Status = Layer 1, Protocol = Layer 2**.
- Cat 6 schafft 10 Gbit/s nur bis **55 m**; für 100 m braucht man **Cat 6A**.
- Duplex-Mismatch erzeugt **Late Collisions** auf der Halbduplex-Seite – nicht nur „langsames Netz“.
- Router-Ports sind standardmäßig `shutdown`, Switch-Ports nicht.

## Grafik
### Straight-Through zwischen PC und Switch
1. PC1: Sendet auf Pin 1 und 2
2. PC1 -> SW1: Signal über Pin 1/2 kommt am Switch an Pin 1/2 an
3. SW1: Empfängt auf Pin 1/2 (MDI-X)
4. SW1 -> PC1: Antwort auf Pin 3/6
5. PC1: Empfängt auf Pin 3/6 – Vollduplex

### Duplex-Mismatch
1. SW1: Steht auf Vollduplex und sendet sofort
2. PC1: Steht auf Halbduplex und sendet ebenfalls
3. PC1: Erkennt Kollision nach 64 Byte (Late Collision)
4. SW1: Zählt CRC-Fehler und Runts
5. Text: Lösung – beide Seiten auf auto oder gleich fest einstellen

## Lab
**Packet Tracer: SW1 (2960) – PC1 an Fa0/1, SW2 an Gi0/1**

### Cisco IOS
1. PC1 mit Straight-Through an SW1, SW2 mit Crossover an SW1 Gi0/1 (in Packet Tracer werden falsche Kabel rot).
2. Auf SW1 Speed/Duplex festsetzen und Fehler beobachten.
```
SW1# configure terminal
SW1(config)# interface fastEthernet0/1
SW1(config-if)# description ## zu PC1 ##
SW1(config-if)# speed 100
SW1(config-if)# duplex full
SW1(config-if)# exit
SW1(config)# interface range fastEthernet0/5 - 24
SW1(config-if-range)# description ## nicht genutzt ##
SW1(config-if-range)# shutdown
SW1(config-if-range)# end
SW1# show interfaces status
SW1# show interfaces fastEthernet0/1
SW1# show interfaces description
```
3. In `show interfaces fa0/1` die Zeilen **runts, giants, CRC, collisions, late collision** suchen.

## Befehle
- `speed {10 | 100 | 1000 | auto}` – Geschwindigkeit setzen (config-if)
- `duplex {half | full | auto}` – Duplex setzen
- `interface range f0/5 - 24` – mehrere Ports gleichzeitig konfigurieren
- `description ## Text ##` – Portbeschreibung
- `show interfaces status` – Status, VLAN, Duplex, Speed, Typ
- `show interfaces` – Zähler: Runts, Giants, CRC, Collisions
- `show interfaces description` – Beschreibungen anzeigen
- `mdix auto` – Auto-MDI-X auf älteren Switches aktivieren

## Übungen
- A: Welches Kabel zwischen Router und Switch, wenn Auto-MDI-X fehlt? | L: Straight-Through (Router sendet 1/2, Switch empfängt 1/2).
- A: Welches Kabel zwischen zwei Switches ohne Auto-MDI-X (Pins 1↔3, 2↔6)? | L: Crossover.
- A: Ein 1-Gbit-Port, Gegenseite hat Autonegotiation aus und läuft 100 Mbit/s. Welcher Duplex? | L: 100 Mbit/s → Halbduplex (bei ≥1 Gbit/s wäre es Vollduplex).
- A: `show interfaces` zeigt viele Late Collisions. Ursache? | L: Duplex-Mismatch oder zu langes Kabel; Halbduplex-Seite erkennt Kollisionen nach den ersten 64 Byte.
- A: Welche Glasfaser für 25 km zwischen zwei Gebäuden? | L: Singlemode (z. B. 10GBASE-ER).

## Karteikarten
- F: Auf welchen Pins sendet ein PC bei 100BASE-TX? | A: Auf Pin 1 und 2 (empfängt auf 3 und 6).
- F: Auf welchen Pins sendet ein Switch? | A: Auf Pin 3 und 6.
- F: Wann braucht man ein Crossover-Kabel? | A: Zwischen gleichartigen Geräten (Switch–Switch, Router–Router, PC–PC, PC–Router), wenn kein Auto-MDI-X vorhanden ist.
- F: Was ist Auto-MDI-X? | A: Automatische Erkennung der Sende-/Empfangspaare – Kabeltyp egal.
- F: Unterschied Singlemode/Multimode? | A: SMF: schmaler Kern, Laser, große Reichweite, teurer. MMF: breiter Kern, LED, kürzer, günstiger.
- F: Was sind Runts und Giants? | A: Runts: Frames kleiner 64 Byte. Giants: Frames größer 1518 Byte.
- F: Welcher Duplex bei 100 Mbit/s ohne Autonegotiation der Gegenseite? | A: Halbduplex.
- F: Was zeigt die Spalte Status in show ip interface brief? | A: Layer-1-Status (Protocol = Layer 2).
- F: Was bedeutet administratively down? | A: Das Interface wurde mit shutdown deaktiviert (Standard bei Router-Ports).
- F: Was ist ein SFP? | A: Small Form-Factor Pluggable – steckbarer Transceiver für Glasfaser oder Kupfer.
- F: Warum ist UTP ein Sicherheitsrisiko? | A: Es strahlt schwache Signale ab, die abgegriffen werden können.

## Quiz
? Welches Kabel verbindet Router und Switch, wenn der Switch auf Pin 1/2 empfängt, auf 3/6 sendet und kein Auto-MDI-X verfügbar ist?
* Straight-Through
- Crossover
- Rollover
- Konsolenkabel
@ 200-301.pdf Question 12

? Welche drei Aussagen zu Vollduplex-Ethernet stimmen? (Mehrfachauswahl)
* Im Vollduplex gibt es keine Kollisionen
* Jeder Vollduplex-Knoten braucht einen eigenen Switch-Port
* NIC und Switch-Port müssen beide Vollduplex unterstützen
- Hub-Ports sind für Vollduplex vorkonfiguriert
@ cisco_100-101.pdf Question 1

? Welche Glasfaser nutzt einen Laser und schafft die größten Entfernungen?
* Singlemode
- Multimode
- OM3
- Cat 6A

? Was sind Giants?
* Frames größer als 1518 Byte
- Frames kleiner als 64 Byte
- Frames mit falscher FCS
- Frames ohne Zieladresse

? Ein Interface zeigt „up/down“. Was ist wahrscheinlich?
* Layer 1 funktioniert, auf Layer 2 gibt es ein Problem
- Das Interface ist per shutdown deaktiviert
- Kein Kabel ist eingesteckt
- Alles funktioniert normal

? Welche Verbindung braucht ein Crossover-Kabel (ohne Auto-MDI-X)?
* PC direkt an Router
- PC an Switch
- Router an Switch
- Access Point an Switch

? Welcher Standard ist 1000BASE-T?
* IEEE 802.3ab
- IEEE 802.3u
- IEEE 802.3an
- IEEE 802.3af

? Welches Symptom deutet auf einen Duplex-Mismatch hin?
* Late Collisions auf einer Seite und CRC-Fehler auf der anderen
- Interface im Status administratively down
- Giants auf beiden Seiten
- Keine Fehler, aber falsches VLAN

## Lücken
- Router und PCs senden bei 100BASE-TX auf den Pins {1 und 2}.
- Ein Frame kleiner als {64} Byte heißt Runt.
- {Singlemode}-Glasfaser nutzt einen Laser und hat den schmaleren Kern.
- Bei 10/100 Mbit/s ohne Autonegotiation wählt der Switch {Halbduplex}.

## Spickzettel
- MDI (PC/Router) TX 1/2 · MDI-X (Switch) TX 3/6
- verschieden = Straight · gleich = Crossover · Console = Rollover
- 1000BASE-T/10GBASE-T: 4 Paare, 100 m
- SMF schmal/Laser/weit · MMF breit/LED/kürzer
- Runt <64 B · Giant >1518 B · CRC = FCS kaputt
- Duplex-Mismatch → Late Collisions
