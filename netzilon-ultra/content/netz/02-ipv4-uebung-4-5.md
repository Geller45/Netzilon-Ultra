---
id: netz-ipv4-uebung-4-5
bereich: AP1
block: Netzwerk
kapitel: IPv4 – Übungen
titel: IPv4-Übungen Teil 4 und 5 – Subnetze, VLSM und Adressplan mit Lösungen
stufe: Fortgeschritten
fach: TCP/IP – CCNA – Basic
pruefungen: [AP1, AP2, CCNA, Schule]
quellen: [05_Y_IPv4_4.pdf, 05_Y_IPv4_5.pdf]
verweise: [ccna-vlsm, ccna-subnetting, netz-ipv4-uebung-2-3, ap1-a4-subnetting]
---

## Profi

### Teil 4 – Lösungen
**Aufgabe 1: 192.168.0.0/24, 6 Netze.**
a) 3 Bit (2³ = 8 ≥ 6). b) **/27 = 255.255.255.224**. c) Netze: 1 = 192.168.0.0, 2 = 192.168.0.32, 3 = 192.168.0.64, 4 = 192.168.0.96, 5 = 192.168.0.128, 6 = 192.168.0.160 (alle /27; Netz 7 = .192 und Netz 8 = .224 bleiben frei). d) Subnetz 4 (192.168.0.96/27): Hosts **192.168.0.97 – 192.168.0.126**. e) Broadcast Subnetz 2 (192.168.0.32/27): **192.168.0.63**.

**Aufgabe 2: 192.168.0.0/24, Netze für je 10 Rechner.**
a) 2⁴ − 2 = 14 ≥ 10 → 4 Hostbits → **/28 = 255.255.255.240**. b) maximal **14 Rechner**. c) Netz 1 = **192.168.0.0/28**, Netz 2 = **192.168.0.16/28**. d) Broadcast Netz 1: **192.168.0.15**. e) Rechner in Subnetz 2: **192.168.0.17 – 192.168.0.30** (Broadcast .31).

**Aufgabe 3: Maske je Clientzahl.**
| Clients | Hostbits | Schrägstrich | Punktschreibweise |
|---|---|---|---|
| 1000 | 10 (1022) | /22 | 255.255.252.0 |
| 18 | 5 (30) | /27 | 255.255.255.224 |
| 500 | 9 (510) | /23 | 255.255.254.0 |
| 60 | 6 (62) | /26 | 255.255.255.192 |
| 10 | 4 (14) | /28 | 255.255.255.240 |

**Aufgabe 4: 194.100.10.0/24 (VLSM, größte Anforderung zuerst).**
| Bedarf | Netz | Präfix |
|---|---|---|
| 2 × 60 Clients | 194.100.10.0 und 194.100.10.64 | /26 (62 Hosts) |
| 1 × 40 Clients | 194.100.10.128 | /26 (62 Hosts) |
| 1 × 28 Clients | 194.100.10.192 | /27 (30 Hosts) |
| 2 × 10 Clients | 194.100.10.224 und 194.100.10.240 | /28 (14 Hosts) |
Summe 64 + 64 + 64 + 32 + 16 + 16 = 256 – es passt exakt.

### Teil 5 – Lösungen
**Aufgabe 1: 132.45.0.0/16, 6 Teilnetze.**
a) **3** Bit. b) **/19 = 255.255.224.0**. c) 132.45.0.0, 132.45.32.0, 132.45.64.0, 132.45.96.0, 132.45.128.0, 132.45.160.0 (alle /19). d) Teilnetz 3 (132.45.64.0/19): **132.45.64.1 – 132.45.95.254**. e) Broadcast: **132.45.95.255**.

**Aufgabe 2: 200.35.1.0/24, 20 Rechner je Teilnetz.**
a) 2⁵ − 2 = 30 ≥ 20 → **/27 = 255.255.255.224**. b) Netze: .0, .32, .64, .96, .128, .160, .192, .224 (alle /27 → 8 Stück, 200.35.1.x). c) Netz 7 (200.35.1.192/27): **200.35.1.193 – 200.35.1.222**. d) Broadcast: **200.35.1.223**.

**Aufgabe 3: 194.25.0.0/16.**
a) In 4 gleich große Netze (2 Bit → /18): Netz 0 = 194.25.0.0, Netz 1 = 194.25.64.0, Netz 2 = 194.25.128.0, Netz 3 = 194.25.192.0. b) **255.255.192.0 (/18)**. c) Netz 0 in 4 Teile (2 Bit → /20): 0-0 = 194.25.0.0, 0-1 = 194.25.16.0, 0-2 = 194.25.32.0, 0-3 = 194.25.48.0. d) **255.255.240.0 (/20)**. e) 12 Hostbits → 2¹² − 2 = **4.094 IPs** je Netz.

**Aufgabe 4: VLSM aus 192.168.1.64/26 (Adressen .64 – .127).**
Sortiert nach Größe: 30, 14, 6, 2 Hosts.
| Subnetz | Hosts | Netzadresse | Maske | Broadcast | max. Hosts |
|---|---|---|---|---|---|
| 1 | 30 | 192.168.1.64/27 | 255.255.255.224 | 192.168.1.95 | 30 |
| 3 | 14 | 192.168.1.96/28 | 255.255.255.240 | 192.168.1.111 | 14 |
| 2 | 6 | 192.168.1.112/29 | 255.255.255.248 | 192.168.1.119 | 6 |
| 4 | 2 | 192.168.1.120/30 | 255.255.255.252 | 192.168.1.123 | 2 |
Rest 192.168.1.124 – .127 bleibt frei. Reihenfolge der Vergabe: **größtes Subnetz zuerst**, immer ab der nächsten freien Adresse und an der **Blockgröße ausgerichtet**.

## Einfach

Stell dir ein Grundstück vor, das du an mehrere Familien verteilst. Eine große Familie braucht ein großes Stück, ein Single nur ein kleines. Damit nichts Platz verschwendet wird, **teilst du zuerst den größten Wunsch aus** und gehst dann zu den kleineren.

Das Rezept ist immer das Gleiche:
1. Wie viele Geräte? Plus 2 (Namensschild + Lautsprecher) → nächste Zweierpotenz → so viele Hostbits.
2. Aus den Hostbits den Präfix berechnen: 32 − Hostbits.
3. Das Stück beginnt immer an einer „runden Zahl“: bei einem Stück mit 32 Adressen bei 0, 32, 64, 96, … ; bei 16 Adressen bei 0, 16, 32, …
4. Das nächste Stück beginnt direkt nach dem Broadcast des vorherigen.

**Beispiel**: Du hast 192.168.1.64 bis .127. Familie A braucht 30 Plätze → ein /27-Stück: .64 bis .95. Familie B braucht 14 → /28: .96 bis .111. Familie C braucht 6 → /29: .112 bis .119. Familie D braucht 2 → /30: .120 bis .123. Es bleiben nur vier Adressen übrig (.124 – .127).

Wenn du jede Aufgabe mit einer kleinen Zeichnung beginnst (ein Streifen von 0 bis 255 und darauf die Blöcke), verrechnest du dich kaum noch.

Noch ein Tipp aus der Praxis: Schreibe dir vor dem Start die Reihenfolge der Wünsche groß auf, sortiert vom größten zum kleinsten. Zeichne dann einen langen Balken von 0 bis 255 und male die Blöcke nacheinander hinein. Wenn am Ende der Balken genau gefüllt ist (wie bei 64 + 64 + 64 + 32 + 16 + 16 = 256), weißt du, dass du keinen Fehler gemacht hast. Passt etwas nicht, hast du entweder zu klein geschätzt oder die Reihenfolge verwechselt.

## Merksatz
- **VLSM: größtes Netz zuerst.**
- **Nächstes Netz = Broadcast des letzten + 1.**
- **Block muss an seiner Größe ausgerichtet sein.**
- **Hosts = Blockgröße − 2.**

## Prüfungsfalle
- Falsche Reihenfolge der VLSM-Vergabe führt zu Überschneidungen oder Löchern.
- In Teil 5 Aufgabe 2 ist bei **8 Netzen** von 200.35.1.0/24 jedes Netz /27; Netz **7** beginnt bei **.192** (nicht .224).
- **Broadcast Netz 3** in der /19-Aufteilung ist 132.45.**95**.255, nicht .96.255.
- **Netz 0** bei Aufgabe 3 ist das erste Netz (194.25.0.0), nicht Netz 1.
- In VLSM: 2 Hosts brauchen **/30**, nicht /31 (Router-Link /31 nur Spezialfall).
- Bei 28 Clients ist **/27 (30 Hosts)** richtig, nicht /28.

## Grafik
### VLSM-Streifen
1. Text: 192.168.1.64/26 – Streifen von .64 bis .127
2. Text: 30 Hosts → /27: .64 – .95 belegt
3. Text: 14 Hosts → /28: .96 – .111 belegt
4. Text: 6 Hosts → /29: .112 – .119 belegt
5. Text: 2 Hosts → /30: .120 – .123 belegt, .124 – .127 frei

## Übungen
- A: 192.168.0.0/24 in 6 Netze – Maske, Netz 4 Hostbereich | L: /27; Netz 4 = 192.168.0.96/27, Hosts .97 – .126.
- A: Broadcast von 192.168.0.32/27 | L: 192.168.0.63.
- A: Netze für 10 Rechner in 192.168.0.0/24 – Maske, Netz 2 | L: /28; Netz 2 = 192.168.0.16, Hosts .17 – .30.
- A: 194.100.10.0/24: 2×60, 1×40, 1×28, 2×10 Clients | L: .0/26, .64/26, .128/26, .192/27, .224/28, .240/28.
- A: 132.45.0.0/16 in 6 Teilnetze – Netz 3 | L: /19; 132.45.64.0 – 132.45.95.255, Hosts .64.1 – .95.254.
- A: 200.35.1.0/24, 20 Rechner – Netz 7 | L: /27; 200.35.1.192/27, Hosts .193 – .222, Broadcast .223.
- A: 194.25.0.0/16 in 4 Netze, Netz 0 nochmals in 4 | L: /18 (0, 64.0, 128.0, 192.0); Netz 0-x /20: 0.0, 16.0, 32.0, 48.0; je 4.094 IPs.
- A: VLSM aus 192.168.1.64/26 mit 30/6/14/2 Hosts | L: 1: .64/27, 3: .96/28, 2: .112/29, 4: .120/30.

## Karteikarten
- F: Maske für 6 Netze aus /24? | A: /27 (3 Bit).
- F: Broadcast von 192.168.0.32/27? | A: 192.168.0.63
- F: Maske für 1000 Clients? | A: /22
- F: Maske für 18 Clients? | A: /27
- F: Reihenfolge bei VLSM? | A: Größtes Subnetz zuerst.
- F: Netz 3 von 132.45.0.0/19? | A: 132.45.64.0
- F: Hosts je /20? | A: 4.094
- F: Subnetz 192.168.1.112/29 – Broadcast? | A: 192.168.1.119
- F: Wie viele Hosts hat /30? | A: 2
- F: Wie viele Netze entstehen aus /16 mit /18? | A: 4

## Quiz
? Welches Netz hat 14 Hosts?
* /28
- /29
- /27
- /26
? Wie lautet Netz 2 von 192.168.0.0/28?
* 192.168.0.16
- 192.168.0.14
- 192.168.0.15
- 192.168.0.32
? Welches ist die Maske für 6 Netze aus 132.45.0.0/16?
* 255.255.224.0
- 255.255.192.0
- 255.255.240.0
- 255.255.255.0
? Wie lautet der Broadcast von 200.35.1.192/27?
* 200.35.1.223
- 200.35.1.255
- 200.35.1.224
- 200.35.1.222
? Wie viele IP-Adressen hat jedes /20-Netz (nutzbar)?
* 4.094
- 4.096
- 2.046
- 1.022
? Welche Reihenfolge ist bei VLSM richtig?
* Größtes Subnetz zuerst
- Kleinstes zuerst
- Zufällig
- Alphabetisch
? Wie viele Hostbits hat /26?
* 6
- 5
- 7
- 4
? Wie viele Adressen verbraucht ein /30 insgesamt?
* 4
- 2
- 6
- 8
? Welches Netz kommt nach 192.168.1.96/28?
* 192.168.1.112
- 192.168.1.100
- 192.168.1.111
- 192.168.1.128
