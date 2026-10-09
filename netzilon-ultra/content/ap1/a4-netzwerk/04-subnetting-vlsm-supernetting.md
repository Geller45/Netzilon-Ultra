---
id: ap1-a4-subnetting
bereich: AP1
block: A4
kapitel: Netzwerk
titel: Subnetting, VLSM & Supernetting
stufe: Fortgeschritten
quellen: [05_Subnetting_Supernetting.pdf, 05_Y_IPv4_2.pdf, 05_Y_IPv4_3.pdf, 05_Y_IPv4_4.pdf, 05_Y_IPv4_5.pdf, Aufgaben10.pdf]
verweise: [ap1-a4-ipv4, ap1-a3-zahlensysteme, ap1-a3-logik, ap1-a4-routing, ap1-a4-vlan]
---

## Profi

### Warum Subnetting?
Ein großes Netz wird in **kleinere Teilnetze** zerlegt, indem man **Bits vom Hostanteil für den Netzanteil „leiht“**. Vorteile:
- **Weniger Broadcast-Last** (kleinere Broadcastdomänen)
- **Sicherheit**: Abteilungen/Server trennen, Firewall-/ACL-Regeln zwischen Subnetzen
- **Organisation** nach Standorten, Abteilungen, VLANs
- **Effiziente Nutzung** knapper öffentlicher Adressen

### Die zwei Grundformeln
- **Anzahl Subnetze = 2^(geliehene Bits)**
- **Hosts pro Subnetz = 2^(Hostbits) − 2**

**Benötigte Bits ermitteln**: nächste Zweierpotenz **≥** Bedarf.
- Für **Subnetze**: 6 Subnetze → 2³ = 8 → **3 Bit**.
- Für **Hosts**: **+2** (Netz + Broadcast) nicht vergessen! 18 Hosts → 20 → 2⁵ = 32 → **5 Hostbits** → /27. 62 Hosts → 64 → /26, aber **64 Hosts → 66 → 2⁷ → /25**!

### Masken-Tabelle (auswendig lernen)
| Präfix | Maske | Blockgröße (letztes relevantes Oktett) | Hosts |
|---|---|---|---|
| /24 | 255.255.255.0 | 256 | 254 |
| /25 | 255.255.255.128 | 128 | 126 |
| /26 | 255.255.255.192 | 64 | 62 |
| /27 | 255.255.255.224 | 32 | 30 |
| /28 | 255.255.255.240 | 16 | 14 |
| /29 | 255.255.255.248 | 8 | 6 |
| /30 | 255.255.255.252 | 4 | 2 (Punkt-zu-Punkt) |
| /31 | 255.255.255.254 | 2 | 2 (nur P2P, RFC 3021) |
| /23 | 255.255.254.0 | 2 (im 3. Oktett) | 510 |
| /22 | 255.255.252.0 | 4 | 1.022 |
| /21 | 255.255.248.0 | 8 | 2.046 |
| /20 | 255.255.240.0 | 16 | 4.094 |
| /19 | 255.255.224.0 | 32 | 8.190 |
| /18 | 255.255.192.0 | 64 | 16.382 |
| /17 | 255.255.128.0 | 128 | 32.766 |
| /16 | 255.255.0.0 | 256 | 65.534 |

### Die Blockgrößen-Methode (schnellster Weg)
1. **Interessantes Oktett** finden (das, in dem die Maske weder 255 noch 0 ist).
2. **Blockgröße = 256 − Maskenwert** in diesem Oktett (z. B. 256 − 224 = **32**).
3. Subnetze beginnen bei Vielfachen der Blockgröße: 0, 32, 64, 96 …
4. **Broadcast** = nächste Netzadresse − 1. **Erster Host** = Netz + 1, **letzter Host** = Broadcast − 1.

**Beispiel**: In welchem Netz liegt 192.168.10.77/26? Blockgröße 64 → Netze .0, .64, .128, .192 → 77 liegt in **.64** → Netz 192.168.10.64, Hosts .65–.126, Broadcast .127.

### Subnetting eines /16 (Beispiel 132.45.0.0/16, 6 Teilnetze)
3 Bit → /19 → Maske 255.255.**224**.0 → Blockgröße **32 im dritten Oktett** → 132.45.0.0, .32.0, .64.0, .96.0, .128.0, .160.0 … Teilnetz 3 (132.45.64.0/19): Hosts **132.45.64.1 – 132.45.95.254**, Broadcast **132.45.95.255**.

### VLSM – Variable Length Subnet Masking
Subnetze **unterschiedlicher Größe** aus einem Block, um keine Adressen zu verschwenden.
**Vorgehen**:
1. Anforderungen **nach Größe absteigend sortieren**.
2. Für jedes die passende Maske bestimmen (Hosts + 2 → Zweierpotenz).
3. Vom Anfang des Blocks lückenlos vergeben: das nächste Subnetz beginnt direkt nach dem Broadcast des vorherigen.

Beispiel 192.168.1.64/26 → Subnetze mit 30, 6, 14, 2 Hosts; sortiert 30 → 14 → 6 → 2:
| Subnetz | Bedarf | Präfix | Netzadresse | Hostbereich | Broadcast | max. Hosts |
|---|---|---|---|---|---|---|
| 1 | 30 | /27 (255.255.255.224) | 192.168.1.64 | .65 – .94 | 192.168.1.95 | 30 |
| 3 | 14 | /28 (255.255.255.240) | 192.168.1.96 | .97 – .110 | 192.168.1.111 | 14 |
| 2 | 6 | /29 (255.255.255.248) | 192.168.1.112 | .113 – .118 | 192.168.1.119 | 6 |
| 4 | 2 | /30 (255.255.255.252) | 192.168.1.120 | .121 – .122 | 192.168.1.123 | 2 |
Rest frei: 192.168.1.124 – .127.

### Supernetting / Routenzusammenfassung (Summarization)
Das Gegenteil von Subnetting: **Mehrere benachbarte Netze** werden zu **einem größeren** zusammengefasst, indem man die Maske **verkürzt**. Zweck: kleinere Routingtabellen, einfachere Firewall-Regeln, Adressvergabe durch Provider (**CIDR**).

**Vorgehen**: Netzadressen binär untereinander schreiben, **gemeinsame führende Bits** zählen → das ist das neue Präfix.
Beispiel 192.168.0.0/24 bis 192.168.3.0/24:
```
192.168.000000|00.0
192.168.000000|01.0
192.168.000000|10.0
192.168.000000|11.0
→ 22 gemeinsame Bits → 192.168.0.0/22 (255.255.252.0)
```
Bedingung: Die Netze müssen **zusammenhängend** sein und die Anzahl eine **Zweierpotenz**, beginnend an einer passenden Grenze (192.168.1.0–192.168.4.0 lässt sich **nicht** sauber zu einem /22 zusammenfassen).

**Prüfungsbeispiel (Aufgaben10)**: Der Router kennt `192.168.0.0/19 via 172.16.31.2`. Ein /19 umfasst **192.168.0.0 – 192.168.31.255** → VLAN-Netze 192.168.10.0/26 und 192.168.20.0/27 sind enthalten, **192.168.40.0/29 (Management) nicht** → kein Internet aus dem Management-VLAN. Lösung: Zusammenfassung auf **/18** (192.168.0.0 – 192.168.63.255) oder zusätzliche Route `192.168.40.0/29 via 172.16.31.2`.

## Übungen
- A: 206.73.118.0/24 – 6 Subnetze | L: 3 Bit geliehen → Netz-ID 27 Bit, Host-ID 5 Bit, /27, 255.255.255.224
- A: 206.73.118.0/24 – 9 Subnetze | L: 4 Bit → Netz-ID 28, Host-ID 4, /28, 255.255.255.240
- A: 206.73.118.0/24 – 18 Hosts pro Subnetz | L: 18 + 2 = 20 → 32 → Host-ID 5, Netz-ID 27, /27, 255.255.255.224
- A: 206.73.118.0/24 – 64 Hosts pro Subnetz | L: 64 + 2 = 66 → 128 → Host-ID 7, Netz-ID 25, /25, 255.255.255.128
- A: Nächste Zweierpotenz und Bits für 200, 40, 312, 20, 96, 12 | L: 256/8, 64/6, 512/9, 32/5, 128/7, 16/4
- A: Nächste Zweierpotenz und Bits für 150, 3, 2500, 6, 64, 10 | L: 256/8, 4/2, 4096/12, 8/3, 64/6, 16/4
- A: Nächste Zweierpotenz und Bits für 1775, 103, 17, 255, 3242, 2 | L: 2048/11, 128/7, 32/5, 256/8, 4096/12, 2/1
- A: /28, /21, /30, /19, /26, /22 in Punktnotation | L: 255.255.255.240, 255.255.248.0, 255.255.255.252, 255.255.224.0, 255.255.255.192, 255.255.252.0
- A: /27, /17, /20, /29, /23, /25 in Punktnotation | L: 255.255.255.224, 255.255.128.0, 255.255.240.0, 255.255.255.248, 255.255.254.0, 255.255.255.128
- A: 255.255.255.248, 255.255.192.0, 255.255.255.128, 255.255.248.0 in Präfix | L: /29, /18, /25, /21
- A: 255.255.255.224, 255.255.252.0, 255.255.128.0 in Präfix | L: /27, /22, /17
- A: Maske für 125, 400, 127, 650, 7 Hosts | L: /25, /23, /24, /22, /28
- A: Maske für 2000, 4, 3500, 32 Hosts | L: /21, /29, /20, /26
- A: Contoso Binghamton: 192.168.10.0/24, Hosts mit 255.255.255.192 – wie viele Subnetze? | L: a) 4 (2 geliehene Bits → 2² = 4)
- A: 192.168.0.0/24, 6 Netze: Bits und Maske | L: 3 Bit, /27 = 255.255.255.224
- A: 192.168.0.0/24, 6 Netze: Netzadressen | L: .0, .32, .64, .96, .128, .160 (jeweils /27)
- A: 192.168.0.0/24, 6 Netze: Rechneradressen Subnetz 4 | L: 192.168.0.97 – 192.168.0.126
- A: 192.168.0.0/24, 6 Netze: Broadcast Subnetz 2 | L: 192.168.0.63
- A: 192.168.0.0/24, Netze für je 10 Rechner: Maske und max. Rechner | L: /28 = 255.255.255.240, max. 14 Rechner
- A: /28-Netze: erste 2 Teilnetze, Broadcast Netz 1, Bereich Netz 2 | L: 192.168.0.0 und 192.168.0.16; Broadcast 192.168.0.15; Netz 2: .17 – .30
- A: Maske für 1000, 18, 500, 60, 10 Clients | L: /22 255.255.252.0; /27 255.255.255.224; /23 255.255.254.0; /26 255.255.255.192; /28 255.255.255.240
- A: 194.100.10.0/24: 2 × 60, 1 × 40, 1 × 28, 2 × 10 Clients | L: 194.100.10.0/26, .64/26, .128/26 (40 Clients brauchen /26), .192/27, .224/28, .240/28
- A: 132.45.0.0/16, 6 Teilnetze: Bits, Maske | L: 3 Bit, /19 = 255.255.224.0
- A: 132.45.0.0/16, 6 Teilnetze: Netze | L: 132.45.0.0, .32.0, .64.0, .96.0, .128.0, .160.0
- A: 132.45.0.0/16: Hostbereich und Broadcast Teilnetz 3 | L: 132.45.64.1 – 132.45.95.254, Broadcast 132.45.95.255
- A: 200.35.1.0/24: Maske für 20 Rechner, alle 8 Teilnetze | L: /27 = 255.255.255.224; .0, .32, .64, .96, .128, .160, .192, .224
- A: 200.35.1.192/27: Rechneradressen und Broadcast | L: 200.35.1.193 – 200.35.1.222, Broadcast 200.35.1.223
- A: 194.25.0.0/16 in 4 gleich große Netze | L: 194.25.0.0, 194.25.64.0, 194.25.128.0, 194.25.192.0 – Maske /18 = 255.255.192.0
- A: Netz 0 (194.25.0.0/18) nochmals in 4 Teile | L: 194.25.0.0, .16.0, .32.0, .48.0 – Maske /20 = 255.255.240.0 – je 4.094 IPs
- A: 192.168.1.64/26 VLSM (30, 6, 14, 2 Hosts) | L: S1 .64/27 (BC .95, 30 Hosts); S3 .96/28 (BC .111, 14); S2 .112/29 (BC .119, 6); S4 .120/30 (BC .123, 2)
- A: Event GmbH: Verwaltung 192.168.10.0, 54 Hosts – Maske, Gateway (letzte IP) | L: /26 255.255.255.192, GW 192.168.10.62
- A: Event GmbH: Entwicklung 192.168.20.0, 28 Hosts | L: /27 255.255.255.224, GW 192.168.20.30
- A: Event GmbH: Management 192.168.40.0, 5 Hosts | L: /29 255.255.255.248, GW 192.168.40.6
- A: Warum erreicht das Management-VLAN das Internet nicht (Route 192.168.0.0/19)? | L: /19 reicht nur bis 192.168.31.255 – 192.168.40.0 fehlt; Route auf /18 ändern oder 192.168.40.0/29 zusätzlich eintragen

## Einfach

Stell dir vor, du bekommst einen **riesigen Parkplatz mit 256 Stellplätzen** (ein /24-Netz). Jetzt kommen drei Firmen, die alle eigene, abgetrennte Bereiche wollen. Du ziehst also **Zäune** und teilst den Parkplatz in kleinere Parkplätze auf. Das ist **Subnetting**.

**Die wichtigste Regel**: Parkplätze kann man nur in **Zweierpotenz-Größen** machen: 4, 8, 16, 32, 64, 128 Plätze. Und in jedem Bereich sind **zwei Plätze reserviert**: das Schild am Eingang (Netzadresse) und der Lautsprecher (Broadcast).

**Wie groß muss ein Bereich sein?** Firma braucht 18 Plätze → plus 2 reservierte = 20 → nächste Größe ist **32**. Also bekommt sie einen 32er-Bereich (/27). Tipp: Die Zahl hinter dem Schrägstrich wird **größer**, wenn das Netz **kleiner** wird – wie eine **Lupe**: Mehr Vergrößerung zeigt einen kleineren Ausschnitt.

**Der Blockgrößen-Trick**: 256 minus die letzte Maskenzahl = Größe jedes Bereichs. Bei 255.255.255.224: 256 − 224 = **32**. Die Bereiche starten also bei 0, 32, 64, 96 … wie **Zahlenstrahl-Sprünge**. Die letzte Nummer vor dem nächsten Start ist der Lautsprecher (Broadcast).

**VLSM** ist wie **Tetris mit Parkplätzen**: Die Firmen brauchen unterschiedlich viel Platz. Du fängst mit der **größten** an und legst die kleineren lückenlos dahinter. So bleibt kein Platz ungenutzt.

**Supernetting** ist das Gegenteil: Du **reißt Zäune ab** und machst aus vier kleinen Parkplätzen einen großen. Der Vorteil: Der Wegweiser (Router) muss nicht vier Schilder aufhängen, sondern nur eins: „Alle Parkplätze 0 bis 3 → hier lang“. Aber Achtung: Wenn der große Bereich zu klein gewählt ist (wie in der Prüfungsaufgabe mit dem /19), fehlt auf dem Schild ein Parkplatz – und wer dort parkt, findet nie den Weg hinaus!

## Merksatz
- Hosts: **+2**, dann nächste **Zweierpotenz**.
- Blockgröße = **256 − Maskenwert**.
- Broadcast = **nächstes Netz − 1**.
- VLSM: **groß zuerst**.
- Größeres Präfix = **kleineres** Netz.

## Prüfungsfalle
- Bei Hosts das „+2“ vergessen (64 Hosts passen **nicht** in /26!).
- Bei Subnetzen dagegen **kein** +2.
- Blockgröße im falschen Oktett angewendet (/19 → drittes Oktett).
- VLSM nicht absteigend sortiert → Überschneidungen/Lücken.
- Summary-Route zu klein gewählt (fehlende Netze) oder zu groß (fremde Netze eingeschlossen).

## Grafik
### Parkplatz-Zerteiler
Ein /24 als Balken mit 256 Feldern; Schieberegler für das Präfix teilt den Balken animiert in gleich große farbige Blöcke; Netz- und Broadcastfeld jedes Blocks leuchten grau/rot.

### VLSM-Tetris
Anforderungen als Blöcke unterschiedlicher Größe fallen herab und rasten von groß nach klein lückenlos ein; falsche Reihenfolge erzeugt sichtbare Lücken.

### Supernetting
Vier /24-Netze in Binär untereinander; gemeinsame Bits leuchten grün, eine Linie wandert an die Grenze; Ergebnis /22 erscheint. Modus „Prüfungsfehler“: /19 deckt 192.168.0–31 ab, das Management-Netz 192.168.40.0 liegt sichtbar außerhalb.

### Subnetting-Rechner (interaktiv)
IP und Präfix eingeben → Netzadresse, erste/letzte Host-IP, Broadcast, Anzahl Hosts, Maske in Punkt- und Binärnotation, Rechenweg.

## Karteikarten
- F: Formel Anzahl Subnetze? | A: 2^(geliehene Bits).
- F: Formel Hosts pro Subnetz? | A: 2^(Hostbits) − 2.
- F: Maske für /27? | A: 255.255.255.224.
- F: Maske für /22? | A: 255.255.252.0.
- F: Blockgröße bei 255.255.255.240? | A: 16.
- F: Welches /26-Netz enthält 10.1.1.150? | A: 10.1.1.128/26 (Broadcast .191).
- F: Wie viele Hosts in einem /29? | A: 6.
- F: Welches Präfix für 100 Hosts? | A: /25 (126 Hosts).
- F: Welches Präfix für 500 Hosts? | A: /23 (510 Hosts).
- F: Was ist VLSM? | A: Unterschiedlich große Subnetze aus einem Adressblock; von groß nach klein vergeben.
- F: Was ist Supernetting? | A: Zusammenfassen benachbarter Netze durch Verkürzen der Maske (Routenzusammenfassung).
- F: 192.168.0.0/24 – 192.168.3.0/24 zusammengefasst? | A: 192.168.0.0/22.
- F: Welches Präfix für Router-Punkt-zu-Punkt-Links? | A: /30 (2 Hosts), alternativ /31.

## Quiz
? Wie lautet die Broadcastadresse von 172.16.5.70/27?
* 172.16.5.95
- 172.16.5.63
- 172.16.5.127
- 172.16.5.255

? Welche Maske wird für ein Netz mit 64 Hosts mindestens benötigt?
* 255.255.255.128
- 255.255.255.192
- 255.255.255.224
- 255.255.255.0

? Wie viele /26-Subnetze passen in ein /24?
* 4
- 2
- 6
- 64

? Welche Summary-Route fasst 10.0.8.0/24 bis 10.0.15.0/24 zusammen?
* 10.0.8.0/21
- 10.0.8.0/22
- 10.0.0.0/20
- 10.0.8.0/23

? In welchem Subnetz liegt 192.168.100.200/28?
* 192.168.100.192
- 192.168.100.128
- 192.168.100.200
- 192.168.100.208
