---
id: netz-ipv4-uebung-2-3
bereich: AP1
block: Netzwerk
kapitel: IPv4 – Übungen
titel: IPv4-Übungen Teil 2 und 3 – Subnetting-Grundrechnen mit Lösungen
stufe: Einsteiger
fach: TCP/IP – CCNA – Basic
pruefungen: [AP1, AP2, CCNA, Schule]
quellen: [05_Y_IPv4_2.pdf, 05_Y_IPv4_3.pdf]
verweise: [ccna-subnetting, ccna-vlsm, netz-ipv4-uebung-4-5, ap1-a4-subnetting, ap1-a3-zahlensysteme]
---

## Profi

### Rechenwerkzeug
- **Zweierpotenzen**: 2¹=2, 2²=4, 2³=8, 2⁴=16, 2⁵=32, 2⁶=64, 2⁷=128, 2⁸=256, 2⁹=512, 2¹⁰=1024, 2¹¹=2048, 2¹²=4096, 2¹³=8192.
- **Subnetze**: n Subnetze → kleinste Bitzahl s mit 2^s ≥ n (geliehene Bits).
- **Hosts**: h Hosts → kleinste Bitzahl k mit 2^k − 2 ≥ h (Hostbits).
- **Präfix** = 32 − Hostbits = Netzbits.
- Punktdezimalmaske: pro Oktett 255 (8 Bit), 254 (7), 252 (6), 248 (5), 240 (4), 224 (3), 192 (2), 128 (1), 0 (0 Bit).

### Teil 2 – Aufgabe: 206.73.118.0/24 teilen
| Anforderung | Bits Netz-ID | Bits Host-ID | Schrägstrich | Punktschreibweise |
|---|---|---|---|---|
| 6 Subnetze | 27 (24 + 3) | 5 | **/27** | 255.255.255.224 |
| 9 Subnetze | 28 (24 + 4) | 4 | **/28** | 255.255.255.240 |
| 18 Hosts je Subnetz | 27 | 5 | **/27** | 255.255.255.224 (30 Hosts) |
| 64 Hosts je Subnetz | 25 | 7 | **/25** | 255.255.255.128 (126 Hosts) |
Begründung: 6 Subnetze → 2³ = 8 ≥ 6; 9 → 2⁴ = 16; 18 Hosts → 2⁵ − 2 = 30 ≥ 18; 64 Hosts → 2⁶ − 2 = 62 < 64, daher 2⁷ − 2 = 126.

### Teil 3 – Aufgaben mit Lösungen
**1. Nächstgrößere Zweierpotenz / benötigte Bits**: 200 → 256 / 8; 40 → 64 / 6; 312 → 512 / 9; 20 → 32 / 5; 96 → 128 / 7; 12 → 16 / 4; 150 → 256 / 8; 3 → 4 / 2; 2500 → 4096 / 12; 6 → 8 / 3; 64 → 128 / 7 (wenn 64 Adressen **plus** Netz-/Broadcast-Adresse nötig sind; für reine Adresszählung 2⁶ = 64); 10 → 16 / 4; 1775 → 2048 / 11; 103 → 128 / 7; 17 → 32 / 5; 255 → 512 / 9 (255 + 2 = 257); 3242 → 4096 / 12; 2 → 4 / 2.
**2. Schrägstrich → Punktdezimal**: /28 255.255.255.240; /21 255.255.248.0; /30 255.255.255.252; /19 255.255.224.0; /26 **255.255.255.192**; /22 255.255.252.0; /27 255.255.255.224; /17 255.255.128.0; /20 255.255.240.0; /29 255.255.255.248; /23 255.255.254.0; /25 255.255.255.128.
**3. Punktdezimal → Schrägstrich**: 255.255.255.248 /29; 255.255.192.0 /18; 255.255.255.128 /25; 255.255.248.0 /21; 255.255.255.224 /27; 255.255.252.0 /22; 255.255.128.0 /17.
**4. Hosts → Maske**: 125 → /25 (126 Hosts); 400 → /23 (510); **127 → /24** (254; /25 hat nur 126); 650 → /22 (1022); 7 → /28 (14; /29 hat 6 Hosts, reicht nicht); 2000 → /21 (2046); 4 → /29 (6); 3500 → /20 (4094); 20 → /27 (30); 32 → /26 (62).
**5. Contoso**: Block 192.168.10.0/24 mit Maske 255.255.255.192 (/26) → 2 geliehene Bits → **4 Subnetze** (a).

## Einfach

Hier üben wir die Grundrechenarten des Subnetting. Du brauchst nur zwei Fragen:

**„Wie viele Netze will ich?“** – Jedes geliehene Bit verdoppelt die Anzahl: 1 Bit = 2 Netze, 2 Bit = 4, 3 Bit = 8, 4 Bit = 16. Du leihst so viele Bits, bis es reicht. Bei 6 Netzen leihst du 3 Bit (denn 8 reichen), bei 9 Netzen 4 Bit (16 reichen, 8 nicht).

**„Wie viele Geräte passen in ein Netz?“** – Ein Netz hat immer zwei Adressen, die du nicht benutzen darfst (Namensschild und Lautsprecher: Netzadresse und Broadcast). Darum: Gerätezahl + 2, dann die nächste Zweierpotenz suchen. Für 18 Geräte: 18 + 2 = 20 → 32 ist die nächste Potenz = 5 Bit. Für 64 Geräte: 66 → 128 = 7 Bit.

Danach rechnest du in zwei Schritten zur Maske:
1. **Netzbits = 32 − Hostbits** (z. B. 5 Hostbits → 27 Netzbits → /27).
2. **Punktschreibweise**: Für /27 sind die ersten drei Zahlen 255 und das vierte hat 3 Einsen am Anfang: 128 + 64 + 32 = 224. Also 255.255.255.224.

Übe die Tabelle 128 – 192 – 224 – 240 – 248 – 252 – 254 – 255 so lange, bis du sie im Schlaf aufsagen kannst. Das ist die halbe Prüfung.

Ein kleines Beispiel zum Mitrechnen: Du sollst 18 Geräte in ein Netz packen. 18 + 2 = 20. Die nächste Zweierpotenz über 20 ist 32 (das ist 2 hoch 5). Also 5 Hostbits. Von den 32 Bits einer IPv4-Adresse bleiben 27 für das Netz: /27. Kontrolle: 32 Plätze, davon 2 reserviert = 30 Plätze für Geräte, und 18 passen locker hinein. Wenn du dich beim Ergebnis nicht sicher bist, rechne rückwärts: Hat /27 genug Hosts? Ja. Hat /28 genug (14)? Nein. Also ist /27 die kleinste passende Wahl.

## Merksatz
- **Subnetze: 2^s ≥ n. Hosts: 2^k − 2 ≥ h.**
- **Präfix = 32 − Hostbits.**
- **Maskenwerte: 128, 192, 224, 240, 248, 252, 254, 255.**
- **Aus /24 in 4 Netze → /26, in 8 → /27, in 16 → /28.**

## Prüfungsfalle
- Die Lösung der Schulunterlage `05_Y_IPv4_3.pdf` enthält den Tippfehler **„/26 = 225.225.225.192“** – richtig ist **255.255.255.192**.
- In Aufgabe 4 der Unterlage steht **„127 Hosts → /26“**: falsch. /26 hat nur 62 Hosts, /25 nur 126 → richtig **/24**.
- Die Tabelle „nächste 2er-Potenz“ ist dort inkonsistent: 64 → 128 und 255 → 512 berücksichtigen die zwei reservierten Adressen, 2 → 4 ebenfalls; für reine Adresszählung wäre 64 → 64.
- **18 Hosts → /27** (nicht /28: 14 Hosts).
- **9 Subnetze → 4 Bit**, nicht 3 (8 reicht nicht).

## Grafik
### Bits leihen
1. Text: /24 – 8 Hostbits, 1 Netz mit 254 Hosts
2. Text: 1 Bit leihen → /25 – 2 Netze à 126
3. Text: 2 Bit leihen → /26 – 4 Netze à 62
4. Text: 3 Bit leihen → /27 – 8 Netze à 30
5. Text: 4 Bit leihen → /28 – 16 Netze à 14

## Übungen
- A: 206.73.118.0/24 in 6 Subnetze: Bits, Maske | L: 3 Bit geliehen, Netz-ID 27, Host-ID 5, /27, 255.255.255.224.
- A: 206.73.118.0/24 in 9 Subnetze | L: 4 Bit, /28, 255.255.255.240.
- A: 18 Hosts je Subnetz | L: 5 Hostbits (30 Hosts), /27.
- A: 64 Hosts je Subnetz | L: 7 Hostbits (126), /25.
- A: Maske für 400 Hosts | L: 9 Hostbits (510) → /23 = 255.255.254.0.
- A: Maske für 127 Hosts | L: 8 Hostbits (254) → /24.
- A: Maske für 3500 Hosts | L: 12 Hostbits (4094) → /20.
- A: /26 auf 192.168.10.0/24 – wie viele Subnetze? | L: 4.
- A: 255.255.255.248 in Schrägstrich | L: /29.
- A: /21 in Punktschreibweise | L: 255.255.248.0.

## Karteikarten
- F: Maske /27 in Punktschreibweise? | A: 255.255.255.224
- F: Maske /29 in Punktschreibweise? | A: 255.255.255.248
- F: Hosts in /26? | A: 62
- F: Hosts in /25? | A: 126
- F: Wie viele Subnetze bei 3 geliehenen Bits? | A: 8
- F: Bits für 20 Hosts? | A: 5 (32 − 2 = 30)
- F: Bits für 150 Hosts? | A: 8 (254 Hosts)
- F: Maske für 1000 Clients? | A: /22 (1022 Hosts)
- F: Maske für 500 Clients? | A: /23 (510 Hosts)
- F: Maske für 60 Clients? | A: /26 (62 Hosts)

## Quiz
? Welche Maske hat /26 in Punktschreibweise?
* 255.255.255.192
- 255.255.255.224
- 255.255.255.128
- 255.255.192.0
? Wie viele Hostbits braucht man für 18 Hosts?
* 5
- 4
- 6
- 3
? Wie viele Subnetze entstehen bei /24 → /27?
* 8
- 4
- 16
- 6
? Welche Maske passt zu 127 Hosts?
* /24
- /25
- /26
- /23
? Wie viele nutzbare Hosts hat /28?
* 14
- 16
- 30
- 6
? Wie viele Bits muss man für 9 Subnetze leihen?
* 4
- 3
- 5
- 2
? Welche Maske gehört zu 650 Hosts?
* /22
- /23
- /21
- /24
? Was ist 255.255.248.0 als Präfix?
* /21
- /20
- /22
- /19
? Was ist die Maske für 3500 Hosts?
* /20
- /21
- /19
- /22
