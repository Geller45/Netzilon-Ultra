---
id: ap1-a3-zahlensysteme
bereich: AP1
block: A3
kapitel: Zahlen & Logik
titel: Zahlensysteme & Umrechnung
stufe: Einsteiger
quellen: [03-1-uebung-Zahlensysteme.pdf, 03-3-uebung-Zahlensysteme.pdf]
verweise: [ap1-a3-rechnen, ap1-a3-zweierkomplement, ap1-a4-ipv4, ap1-a4-ipv6]
---

## Profi

### Stellenwertsysteme
Jede Stelle einer Zahl hat einen **Stellenwert** = **Basis hoch Position** (Position von rechts, beginnend bei 0). Der Wert einer Zahl ist die Summe aus Ziffer × Stellenwert.

| System | Basis | Ziffern | Kennzeichnung | Einsatz in der IT |
|---|---|---|---|---|
| Dezimal | 10 | 0–9 | 123₁₀ | Menschen |
| **Dual/Binär** | 2 | 0, 1 | 1011₂, 0b1011 | Rechnerintern, Subnetzmasken |
| Oktal | 8 | 0–7 | 17₈ | Linux-Rechte (chmod 755) |
| **Hexadezimal** | 16 | 0–9, A–F | 1F₁₆, 0x1F, 1Fh | MAC-Adressen, IPv6, Farbcodes, Speicheradressen |

Hex-Ziffern: A = 10, B = 11, C = 12, D = 13, E = 14, F = 15.

### Stellenwerttabellen
| 2⁷ | 2⁶ | 2⁵ | 2⁴ | 2³ | 2² | 2¹ | 2⁰ |
|---|---|---|---|---|---|---|---|
| 128 | 64 | 32 | 16 | 8 | 4 | 2 | 1 |

| 16⁴ | 16³ | 16² | 16¹ | 16⁰ |
|---|---|---|---|---|
| 65536 | 4096 | 256 | 16 | 1 |

Zweierpotenzen bis 2¹⁶ auswendig kennen: 256 (2⁸), 512, 1024 (2¹⁰), 2048, 4096, 8192, 16384, 32768, 65536 (2¹⁶).

### Informationsgehalt
Mit **n Bit** lassen sich **2ⁿ verschiedene Zustände** darstellen. Wertebereich ohne Vorzeichen: **0 bis 2ⁿ − 1**.
- 1 Bit → 2 Zustände; 4 Bit (Nibble) → 16; **8 Bit (1 Byte) → 256** (0–255); 16 Bit → 65.536; 32 Bit → ca. 4,29 Mrd. (IPv4); 128 Bit → 3,4 × 10³⁸ (IPv6).
- Umgekehrt: Für **z** Zustände braucht man **⌈log₂ z⌉ Bit** – die nächsthöhere Zweierpotenz (wichtig fürs Subnetting: 6 Subnetze → 8 = 2³ → 3 Bit).

### Umrechnungsverfahren
**1. Beliebige Basis → Dezimal**: Ziffern mit Stellenwerten multiplizieren und addieren.
- 0111 1001₂ = 64 + 32 + 16 + 8 + 1 = **121**
- A6E₁₆ = 10 × 256 + 6 × 16 + 14 × 1 = 2560 + 96 + 14 = **2670**

**2. Dezimal → Dual**
- **Subtraktionsmethode**: Größte passende Zweierpotenz abziehen, dort 1 eintragen, sonst 0.
  98 = 64 + 32 + 2 → 0110 0010₂
- **Divisionsmethode** (Restwertverfahren): Fortlaufend durch 2 teilen, Reste **von unten nach oben** lesen.

| Rechnung | Ergebnis | Rest |
|---|---|---|
| 98 ÷ 2 | 49 | 0 |
| 49 ÷ 2 | 24 | 1 |
| 24 ÷ 2 | 12 | 0 |
| 12 ÷ 2 | 6 | 0 |
| 6 ÷ 2 | 3 | 0 |
| 3 ÷ 2 | 1 | 1 |
| 1 ÷ 2 | 0 | 1 |
Von unten gelesen: **110 0010** → 0110 0010₂.

**3. Dezimal → Hex**: fortlaufend durch 16 teilen, Reste von unten lesen.
2043 ÷ 16 = 127 Rest **11 (B)**; 127 ÷ 16 = 7 Rest **15 (F)**; 7 ÷ 16 = 0 Rest **7** → **7FB₁₆**.

**4. Dual ↔ Hex (Nibble-Methode)** – der schnellste Weg: **Je 4 Bit = eine Hex-Ziffer**, von rechts gruppieren, links mit Nullen auffüllen.
| Hex | Dual | Hex | Dual |
|---|---|---|---|
| 0 | 0000 | 8 | 1000 |
| 1 | 0001 | 9 | 1001 |
| 2 | 0010 | A | 1010 |
| 3 | 0011 | B | 1011 |
| 4 | 0100 | C | 1100 |
| 5 | 0101 | D | 1101 |
| 6 | 0110 | E | 1110 |
| 7 | 0111 | F | 1111 |
- 1011 0010 1101 1001₂ → B 2 D 9 → **B2D9₁₆**
- 11 0111 1010₂ → 0011 0111 1010 → **37A₁₆**
- 8CD₁₆ → 1000 1100 1101₂

**5. Dual ↔ Oktal**: analog mit **3-Bit-Gruppen** (111 101 101 = 755₈).

### Praxisbezug
- **IPv4**: 4 Oktette à 8 Bit (192.168.1.10 = 11000000.10101000.00000001.00001010).
- **MAC-Adresse**: 48 Bit = 12 Hex-Ziffern (00-15-5D-01-02-03).
- **IPv6**: 128 Bit = 32 Hex-Ziffern in 8 Blöcken.
- **Farben**: #FF8000 = Rot 255, Grün 128, Blau 0.

## Übungen
- A: 0111 1001₂ in dezimal | L: 64 + 32 + 16 + 8 + 1 = 121
- A: 1010 0110₂ in dezimal | L: 128 + 32 + 4 + 2 = 166
- A: 1101 1001₂ in dezimal | L: 128 + 64 + 16 + 8 + 1 = 217
- A: 1001 0010₂ in dezimal | L: 128 + 16 + 2 = 146
- A: 98 in dual | L: 64 + 32 + 2 → 0110 0010
- A: 229 in dual | L: 128 + 64 + 32 + 4 + 1 → 1110 0101
- A: 176 in dual | L: 128 + 32 + 16 → 1011 0000
- A: 79 in dual | L: 64 + 8 + 4 + 2 + 1 → 0100 1111
- A: 391 in hex | L: 391 ÷ 16 = 24 R 7; 24 ÷ 16 = 1 R 8; 1 → 187
- A: 264 in hex | L: 264 ÷ 16 = 16 R 8; 16 ÷ 16 = 1 R 0; 1 → 108
- A: 26 in hex | L: 1 × 16 + 10 → 1A
- A: 124 in hex | L: 7 × 16 + 12 → 7C
- A: 2043 in hex | L: 7FB
- A: A6E₁₆ in dezimal | L: 10·256 + 6·16 + 14 = 2670
- A: 9A₁₆ in dezimal | L: 9·16 + 10 = 154
- A: 3C7₁₆ in dezimal | L: 3·256 + 12·16 + 7 = 967
- A: FA₁₆ in dezimal | L: 15·16 + 10 = 250
- A: 248₁₆ in dezimal | L: 2·256 + 4·16 + 8 = 584
- A: B3E₁₆ in dual | L: 1011 0011 1110
- A: A6₁₆ in dual | L: 1010 0110
- A: 8CD₁₆ in dual | L: 1000 1100 1101
- A: 25₁₆ in dual | L: 0010 0101
- A: 6E9₁₆ in dual | L: 0110 1110 1001
- A: 1001 1101₂ in hex | L: 9D
- A: 0110 1010 0110₂ in hex | L: 6A6
- A: 1101 0111₂ in hex | L: D7
- A: 1011 0010 1101 1001₂ in hex | L: B2D9
- A: 1111 0110 1011 0100₂ in hex | L: F6B4
- A: Informationsgehalt einer 8-stelligen Binärinformation? | L: 2⁸ = 256 Zustände (0–255)
- A: 1101111010₂ in dezimal | L: 512 + 256 + 64 + 32 + 16 + 8 + 2 = 890
- A: 1010110₂ in dezimal | L: 64 + 16 + 4 + 2 = 86
- A: 1111111001₂ in dezimal | L: 1017
- A: 1100110011₂ in dezimal | L: 512 + 256 + 32 + 16 + 2 + 1 = 819
- A: 14F5B₁₆ in dezimal | L: 1·65536 + 4·4096 + 15·256 + 5·16 + 11 = 85851
- A: AB3D₁₆ in dezimal | L: 10·4096 + 11·256 + 3·16 + 13 = 43837
- A: 5EA3₁₆ in dezimal | L: 5·4096 + 14·256 + 10·16 + 3 = 24227
- A: 9C23₁₆ in dezimal | L: 9·4096 + 12·256 + 2·16 + 3 = 39971
- A: 3786 in dual und hex | L: 1110 1100 1010₂ = ECA₁₆
- A: 14876 in dual und hex | L: 0011 1010 0001 1100₂ = 3A1C₁₆
- A: 2243 in dual und hex | L: 1000 1100 0011₂ = 8C3₁₆
- A: 1024 in dual und hex | L: 0100 0000 0000₂ = 400₁₆
- A: 1101111010₂ in hex | L: 0011 0111 1010 → 37A
- A: 1010110₂ in hex | L: 0101 0110 → 56
- A: 1111111001₂ in hex | L: 0011 1111 1001 → 3F9
- A: 1100110011₂ in hex | L: 0011 0011 0011 → 333
- A: 14F5B₁₆ in dual | L: 0001 0100 1111 0101 1011
- A: AB3D₁₆ in dual | L: 1010 1011 0011 1101
- A: 5EA3₁₆ in dual | L: 0101 1110 1010 0011
- A: 9C23₁₆ in dual | L: 1001 1100 0010 0011

## Einfach

Wir Menschen zählen mit **zehn Fingern** – deshalb haben wir 10 Ziffern (0 bis 9). Wenn wir bei 9 ankommen, fangen wir eine neue Stelle an: 10.

Ein Computer hat nur **zwei „Finger“**: Strom **an (1)** oder **aus (0)**. Deshalb zählt er im **Dualsystem**: 0, 1, und dann ist schon Schluss – neue Stelle: 10 (das ist „zwei“), 11 (drei), 100 (vier) …

**Der Trick mit der Tabelle**: Schreib dir diese Zahlen auf – jede ist doppelt so groß wie die rechts daneben:

**128 · 64 · 32 · 16 · 8 · 4 · 2 · 1**

Jetzt stell dir vor, das sind **Lichtschalter**. Eine 1 heißt „Licht an, Zahl zählt mit“, eine 0 heißt „aus“. 0110 0010 bedeutet: 64 an, 32 an, 2 an → 64 + 32 + 2 = **98**. Fertig!

Andersrum: Du willst 98 darstellen? Welche Zahlen aus der Tabelle passen rein? 64 passt (bleiben 34), 32 passt (bleiben 2), 2 passt (bleiben 0). Also: Schalter bei 64, 32 und 2 an.

**Hexadezimal** ist ein Zählsystem mit **16 Fingern**. Weil wir nur 10 Ziffern haben, nimmt man für 10 bis 15 einfach Buchstaben: A, B, C, D, E, F.

Das Geniale: **Vier Lichtschalter ergeben genau eine Hex-Ziffer.** 1111 = 8+4+2+1 = 15 = F. So kann man lange Binärzahlen ganz kurz schreiben: 1011 0010 1101 1001 → B2D9. Deshalb sehen MAC-Adressen und IPv6-Adressen so „komisch“ aus – das sind einfach Hex-Zahlen.

**Wie viele Möglichkeiten?** Mit einem Schalter hast du 2 Möglichkeiten (an/aus). Mit zwei Schaltern 4. Mit acht Schaltern schon **256**. Jeder zusätzliche Schalter **verdoppelt** die Möglichkeiten.

## Merksatz
- **128-64-32-16-8-4-2-1** – das „Einmaleins“ der IT.
- **4 Bit = 1 Hex-Ziffer**, **8 Bit = 2 Hex-Ziffern = 1 Byte**.
- Restwertverfahren: Reste **von unten nach oben** lesen.
- n Bit → **2ⁿ** Möglichkeiten, größter Wert **2ⁿ − 1**.
- A B C D E F = 10 11 12 13 14 15.

## Prüfungsfalle
- Reste beim Divisionsverfahren in falscher Reihenfolge gelesen.
- Beim Gruppieren in 4er-Blöcke von **links** statt von **rechts** begonnen.
- 8 Bit = 256 Zustände, aber größter Wert 255.
- Hex-Buchstaben falsch zugeordnet (z. B. B = 12 statt 11).
- Führende Nullen vergessen, wo eine feste Bitbreite gefordert ist (Oktett = immer 8 Stellen).

## Grafik
### Lichtschalter-Wand
Acht Schalter mit den Werten 128–1; Klick schaltet um, die Dezimalzahl und die Hex-Darstellung aktualisieren sich live. Modus „Aufgabe“: Zielzahl wird angezeigt, Nutzer schaltet, bis sie erreicht ist.

### Restwertverfahren
Die Division durch 2 läuft Zeile für Zeile ab; Reste fallen in eine Spalte; ein Pfeil liest sie von unten nach oben und setzt die Binärzahl zusammen.

### Nibble-Zauber
Eine lange Binärzahl zerfällt von rechts in 4er-Gruppen, jede Gruppe verwandelt sich mit einem Funken in ihre Hex-Ziffer.

## Karteikarten
- F: Wie viele Zustände lassen sich mit 8 Bit darstellen? | A: 2⁸ = 256 (Werte 0–255).
- F: Stellenwerte eines Bytes? | A: 128, 64, 32, 16, 8, 4, 2, 1.
- F: Wie viele Bit entsprechen einer Hex-Ziffer? | A: 4 Bit (ein Nibble).
- F: Welchen Dezimalwert hat D₁₆? | A: 13.
- F: 1111 1111₂ in dezimal und hex? | A: 255 / FF.
- F: Wie funktioniert das Restwertverfahren? | A: Fortlaufend durch die Zielbasis teilen, Reste von unten nach oben lesen.
- F: 200 in dual? | A: 1100 1000 (128 + 64 + 8).
- F: 0x2F in dezimal? | A: 2 × 16 + 15 = 47.
- F: Wofür wird Oktal in der IT verwendet? | A: Linux-Dateirechte (z. B. chmod 755).
- F: Wie viele Hex-Ziffern hat eine MAC-Adresse? | A: 12 (48 Bit).
- F: Wie viele Bit braucht man für 6 Subnetze? | A: 3 Bit (2³ = 8 ≥ 6).

## Quiz
? Welche Dezimalzahl entspricht 1100 0000₂?
* 192
- 128
- 12
- 160

? Wie lautet 255 im Hexadezimalsystem?
* FF
- EE
- 100
- F0

? 3C₁₆ entspricht dezimal…
* 60
- 36
- 312
- 48

? Wie viele Bit werden mindestens benötigt, um 300 verschiedene Werte darzustellen?
* 9
- 8
- 10
- 300

? Welche Binärzahl entspricht A5₁₆?
* 1010 0101
- 0101 1010
- 1010 1111
- 1100 0101

? Wie lautet die Dezimalzahl 100 im Binärsystem?
* 0110 0100
- 0110 0010
- 0101 0100
- 1100 0100
! 64 + 32 + 4 = 100.

? Wie viele verschiedene Werte lassen sich mit 8 Bit darstellen?
* 256
- 255
- 128
- 512
! 2^8 = 256 (0 bis 255).

? Welche Hexadezimalzahl entspricht 1111 1010₂?
* FA₁₆
- AF₁₆
- F5₁₆
- EA₁₆
! 1111 = F, 1010 = A.
