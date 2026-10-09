---
id: ihk-formelsammlung-uebungen
bereich: AP1
block: IHK
kapitel: Rechnen in der Prüfung
titel: Formelsammlung AP1 mit Rechenübungen (Zahlensysteme, Subnetting, Verfügbarkeit, Übertragung, Strom)
stufe: Fortgeschritten
fach: PV – AP1
pruefungen: [AP1]
quellen: [Uebersicht.rar (FS.html, ex.html)]
verweise: [ihk-berechnungen-lernzettel, ihk-lz-vlan-wlan-ipv6, ihk-lz-server-storage, wiso-beschaffung-tco-roi, ihk-ap1-ip-kameras]
---

## Profi

### Formelsammlung
| Größe | Formel |
|---|---|
| Leistung | `P = U * I` (mal Anzahl der Geräte) |
| Ohmsches Gesetz | `U = R * I` |
| Elektrische Arbeit | `W = P * t` (kWh = kW * h) |
| Übertragungsrate | `C = D / t` (Mbit/s = Datenmenge in Bit / Zeit in s) |
| Bildgröße | `Länge (Pixel) * Breite (Pixel) * Farbtiefe (Bit/Pixel)` |
| Binärpräfixe | 1 GiB = 1024 MiB = 1024^2 KiB = 1024^3 Byte |
| ROI | `Totalerfolg / Investitionskosten` (ohne Einheit) |
| Verfügbarkeit | `A = t_up / t_gesamt = 1 - t_down / t_gesamt` |
| Ausfallzeit | `t_down = t_gesamt * (1 - A)`; ein Jahr = 8.760 h = 525.600 min |

### Zahlensysteme
- **Dual nach Dezimal:** Stellenwerte 2^n. `110101` (2) = 32 + 16 + 4 + 1 = **53**.
- **Hex nach Dezimal:** Stellenwerte 16^n. `F0A4` (16) = 15*4096 + 0*256 + 10*16 + 4 = 61.440 + 160 + 4 = **61.604**.
- **Dezimal nach Dual:** größte Zweierpotenz abziehen: 673 = 512 + 128 + 32 + 1 -> Einsen an Stelle 9, 7, 5, 0 -> `1010100001`. Alternative: fortlaufend durch 2 teilen, Reste von unten nach oben lesen.
- **Dezimal nach Hex:** durch 16 teilen, Reste von unten nach oben: 14.893 = 3*4096 + 10*256 + 2*16 + 13 -> **3A2D** (D = 13, A = 10).

### Subnetting
**Netzadresse und Host-Range:** Das relevante Oktett ist das, in dem die Maske endet. Blockgröße = 256 - Maskenwert (im relevanten Oktett). Netzadresse = größtes Vielfaches der Blockgröße kleiner/gleich dem IP-Oktett. Broadcast = Netzadresse + Blockgröße - 1; erster Host = Netz + 1; letzter Host = Broadcast - 1; Hosts = 2^(32 - Präfix) - 2.

Beispiel `189.125.78.22 /12`: relevantes Oktett = 2.; Hostbits dort = 4; Blockgröße 16; 125 / 16 = 7,8 -> 7 * 16 = 112. Netz **189.112.0.0**, erster Host 189.112.0.1, Broadcast **189.127.255.255**, letzter Host 189.127.255.254, Hosts 2^20 - 2 = 1.048.574 (die Quelle nennt 1.048.576 Adressen im Netz).
Alternative per UND-Verknüpfung: IP-Oktett 125 (01111101) UND Maske 240 (11110000) = 01110000 = 112.

**Weitere Beispiele (selbst gerechnet):**
- `67.88.99.66 255.255.248.0` (/21): Blockgröße 8 im 3. Oktett, 99/8 = 12 -> 96. Netz 67.88.96.0, erster Host 67.88.96.1, letzter Host 67.88.103.254, Broadcast 67.88.103.255.
- `77.88.99.182 255.255.255.224` (/27): Blockgröße 32, 182/32 = 5 -> 160. Netz 77.88.99.160, erster Host .161, letzter Host .190, Broadcast .191.
- `40.1.1.11 255.255.255.248` (/29): Blockgröße 8, Netz 40.1.1.8, erster Host .9, letzter Host .14, Broadcast 40.1.1.15.

**VLSM-Aufgabe:** Netz 192.168.168.0/24 in 3 Subnetze für 100, 55 und 28 Endgeräte.
| Raum | Bedarf | Subnetzgröße | Netzadresse | Hosts | Broadcast |
|---|---|---|---|---|---|
| 1 | 100 | 128 (/25) | 192.168.168.0 | .1 bis .126 | 192.168.168.127 |
| 2 | 55 | 64 (/26) | 192.168.168.128 | .129 bis .190 | 192.168.168.191 |
| 3 | 28 | 32 (/27) | 192.168.168.192 | .193 bis .222 | 192.168.168.223 |
Vorgehen: Größte Gruppe zuerst, nächste Zweierpotenz >= Bedarf + 2. Broadcast + 1 = nächstes Netz. Rest: 192.168.168.224 bis .255 = noch ein /27 mit 30 Hosts.

### Verfügbarkeit und Übertragung
- Verfügbarkeit 99,9 % im Jahr: `t_down = 8.760 h * 0,001 = 8,76 h`. 99,99 %: 52,6 min. 99,999 %: 5,26 min.
- Datei 55 GiB in 2 min 37 s: `t = 157 s`, `D = 55 * 1024^3 Byte = 59.055.800.320 Byte`, `D / t = 376.152.... Byte/s`, mal 8 = **ca. 3,0 Gbit/s** (Quelle: ca. 3 Gbit/s).

### ROI
Siehe `wiso-beschaffung-tco-roi` (inkl. Korrektur des ROI-Beispiels).

## Einfach

Die Formelsammlung ist dein Werkzeugkasten. Du musst nicht alles im Kopf haben, aber du musst wissen, **welches Werkzeug** zu welcher Aufgabe passt.

**Strom:** Watt = Volt mal Ampere. Das ist wie bei einem Wasserrohr: Druck (Volt) mal Menge (Ampere) ergibt, wie viel Kraft rauskommt (Watt). Wie viel Strom du verbrauchst, hängt auch davon ab, wie lange das Gerät läuft: Watt mal Stunden.

**Datenübertragung:** Wie schnell ist die Leitung? Menge geteilt durch Zeit. Achtung, Speicher zählt in Byte, Leitungen in Bit, und ein Byte hat 8 Bit.

**Dual und Hex:** Binär hat nur 0 und 1. Jede Stelle ist doppelt so viel wert wie die rechts daneben: 1, 2, 4, 8, 16... Du addierst nur die Stellen, an denen eine 1 steht. Hex hat 16 Zeichen (0 bis 9 und A bis F), jede Stelle ist 16-mal so viel wert wie die rechte.

**Subnetting** ist, ein großes Grundstück in kleine Parzellen zu teilen. Jede Parzelle hat eine Größe, die eine Zweierpotenz ist (32, 64, 128). Die erste Adresse ist der Name der Parzelle, die letzte ist die Durchsage an alle. Dazwischen wohnen die Geräte. Beginne immer mit der größten Parzelle, damit nichts durcheinanderkommt.

**Verfügbarkeit** sagt, wie oft ein System läuft. 99,9 % klingt perfekt, aber im Jahr sind das fast 9 Stunden Pause.

## Merksatz
- P = U * I, W = P * t.
- Byte mal 8 = Bit.
- Dual: Stellenwerte 1, 2, 4, 8, 16, 32, 64, 128.
- Hex: A = 10, B = 11, C = 12, D = 13, E = 14, F = 15.
- Hosts = 2^Hostbits - 2.
- Broadcast + 1 = nächstes Netz.
- 99,9 % = 8,76 Stunden Ausfall pro Jahr.

## Prüfungsfalle
- Kilo = 1000 bei Übertragungsraten, aber Kibi = 1024 bei Speicher (GiB, MiB).
- Beim Subnetting zwei Adressen (Netz und Broadcast) nicht abziehen.
- Beim VLSM nicht mit der größten Gruppe beginnen: dann überlappen die Netze.
- Hex-Buchstaben falsch zuordnen (D = 13, nicht 14).
- Bei Rechenaufgaben die Einheiten nicht mitschreiben, Punktabzug.
- Quelle nennt 1.048.576 als Host-Anzahl eines /12-Netzes; nutzbar sind 2^20 - 2 = 1.048.574.

## Grafik
### Dezimal nach Dual (Methode Zweierpotenzen)
1. Rechner: 673, größte Zweierpotenz ist 512
2. Rechner: 673 - 512 = 161, nächste Potenz 128
3. Rechner: 161 - 128 = 33, nächste Potenz 32
4. Rechner: 33 - 32 = 1, nächste Potenz 1
5. Rechner: Einsen an Stelle 9, 7, 5, 0 ergeben 1010100001

### VLSM
1. Admin: Bedarf 100, 55, 28 sortieren
2. Admin: 100 Geräte brauchen 128 Adressen, Netz 192.168.168.0/25
3. Admin: Broadcast .127, nächstes Netz beginnt bei .128
4. Admin: 55 Geräte brauchen 64 Adressen, Netz 192.168.168.128/26
5. Admin: 28 Geräte brauchen 32 Adressen, Netz 192.168.168.192/27

## Lücken
- Die Leistung berechnet sich als P = {U * I}.
- Bei der Übertragungsrate gilt C = {D / t}.
- Die Hexziffer F entspricht dezimal {15}.
- Ein Jahr hat {8760} Stunden.
- Ein /27-Netz hat {30} nutzbare Hostadressen.

## Zuordnen
### Hexziffer und Dezimalwert
- A => 10
- B => 11
- C => 12
- D => 13
- F => 15

### Präfix und Hostanzahl
- /24 => 254
- /25 => 126
- /26 => 62
- /27 => 30
- /28 => 14

## Spickzettel
- P = U * I, W = P * t, U = R * I
- C = D / t, Byte * 8 = Bit
- 1 GiB = 1024^3 Byte
- Hosts = 2^h - 2
- /25 128 Adressen, /26 64, /27 32, /28 16, /29 8, /30 4
- A = t_up / t_gesamt, Jahr = 8760 h
- ROI = Totalerfolg / Investition

## Übungen
- A: Rechnen Sie 11010110 (2) in Dezimal um. | L: 128 + 64 + 16 + 4 + 2 = 214.
- A: Rechnen Sie 255 in Hex um. | L: 255 / 16 = 15 Rest 15 -> FF.
- A: Netzadresse und Broadcast von 192.168.5.77/26? | L: Blockgröße 64, 77/64 = 1 -> 64. Netz 192.168.5.64, Broadcast 192.168.5.127.
- A: Ein Dienst darf pro Jahr höchstens 4 Stunden ausfallen. Mindestverfügbarkeit? | L: A = 1 - 4/8760 = 99,954 %.
- A: Ein Gerät mit 500 W läuft 8 h am Tag, 30 Tage. kWh und Kosten bei 0,35 EUR/kWh? | L: 0,5 kW * 8 h * 30 = 120 kWh; 120 * 0,35 = 42 EUR.
- A: Wie lange dauert die Übertragung von 2 GiB bei 100 Mbit/s? | L: 2 * 1024^3 * 8 = 17.179.869.184 Bit / 100.000.000 = ca. 172 s, rund 2 min 52 s.

## Karteikarten
- F: Formel der elektrischen Leistung? | A: P = U * I.
- F: Formel der elektrischen Arbeit? | A: W = P * t.
- F: Formel der Übertragungsrate? | A: C = D / t.
- F: Wie viele Byte hat 1 GiB? | A: 1024^3 = 1.073.741.824 Byte.
- F: Wie berechnet man die Bildgröße? | A: Breite * Höhe * Farbtiefe (Bit pro Pixel).
- F: Formel der Verfügbarkeit? | A: A = t_up / t_gesamt.
- F: Wie viele Stunden hat ein Jahr (Verfügbarkeitsrechnung)? | A: 8.760 h.
- F: Dual 1010 in Dezimal? | A: 10.
- F: Hex FF in Dezimal? | A: 255.
- F: Wie viele Hosts hat ein /26-Netz? | A: 62.
- F: Wie berechnet man den Broadcast? | A: Netzadresse + Blockgröße - 1.
- F: Womit beginnt man beim VLSM? | A: Mit dem größten Subnetz.
- F: Wie wird die Netzadresse per UND-Verknüpfung berechnet? | A: IP-Adresse UND Subnetzmaske.

## Quiz
? Wie lautet die Formel der Leistung?
* P = U * I
- P = U / I
- P = R * I
- P = W / U

? Was ist 110101 (dual) dezimal?
* 53
- 43
- 63
- 35

? Was ist F0A4 (hex) dezimal?
* 61604
- 61440
- 15024
- 41204

? Wie viele nutzbare Hosts hat ein /27-Netz?
* 30
- 32
- 28
- 62

? Wie groß ist die Netzadresse von 192.168.5.77/26?
* 192.168.5.64
- 192.168.5.0
- 192.168.5.128
- 192.168.5.76

? Wie viel Ausfall pro Jahr entspricht 99,9 % Verfügbarkeit?
* ca. 8,76 Stunden
- ca. 52 Minuten
- ca. 87,6 Stunden
- ca. 5 Minuten

? Wie viele Bit hat ein Byte?
* 8
- 4
- 10
- 16

? Mit welchem Subnetz beginnt man beim VLSM?
* Dem größten
- Dem kleinsten
- Dem mittleren
- Beliebig

? Welche Netzadresse hat 77.88.99.182/27?
* 77.88.99.160
- 77.88.99.128
- 77.88.99.176
- 77.88.99.192

? Welche Aussagen sind richtig? (mehrere)
* 1 GiB = 1024^3 Byte.
* Broadcast + 1 ist die Netzadresse des nächsten Subnetzes (bei lückenloser Aufteilung).
- Hostanzahl = 2^Hostbits.
- Hexziffer D entspricht 14.
