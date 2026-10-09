---
id: ap1-a3-rechnen
bereich: AP1
block: A3
kapitel: Zahlen & Logik
titel: Rechnen im Dual- und Hexadezimalsystem
stufe: Fortgeschritten
quellen: [03-2-uebung-Zahlensysteme2.pdf, 03-3-uebung-Zahlensysteme.pdf, Aufgaben_Zahlensysteme.txt]
verweise: [ap1-a3-zahlensysteme, ap1-a3-zweierkomplement, ap1-a3-logik]
---

## Profi

### Schriftliche Addition (dual)
Regeln – wie im Dezimalsystem, nur dass der **Übertrag schon bei 2** entsteht:
| A | B | Übertrag rein | Summe | Übertrag raus |
|---|---|---|---|---|
| 0 | 0 | 0 | 0 | 0 |
| 0 | 1 | 0 | 1 | 0 |
| 1 | 1 | 0 | 0 | 1 |
| 1 | 1 | 1 | 1 | 1 |

Beispiel 110111 + 101110:
```
    1 1 0 1 1 1   (55)
  + 1 0 1 1 1 0   (46)
  Ü 1 1 1 1 1 0
  -------------
  1 1 0 0 1 0 1   (101)
```

### Schriftliche Subtraktion (dual)
**Regeln**: 0 − 0 = 0 · 1 − 0 = 1 · 1 − 1 = 0 · **0 − 1 = 1 mit Borgen (Übertrag 1 in die nächste Stelle)**.
Beispiel 110111 − 011010:
```
    1 1 0 1 1 1   (55)
  − 0 1 1 0 1 0   (26)
  B   1 1
  -------------
    0 1 1 1 0 1   (29)
```
Alternative: Subtraktion über **Addition des Zweierkomplements** (siehe eigenes Thema) – so rechnet der Prozessor.

### Schriftliche Multiplikation (dual)
Wie im Dezimalsystem, aber einfacher: Jede Stelle des zweiten Faktors ist 0 oder 1 → Zeile ist **0** oder der **erste Faktor, um die Stelle verschoben**. Dann addieren.
Beispiel 111 × 1101 (7 × 13):
```
        1 1 1 × 1 1 0 1
  ---------------------
              1 1 1        ← 111 · 1 (Stelle 0)
            0 0 0 ·        ← 111 · 0 (Stelle 1)
          1 1 1 · ·        ← 111 · 1 (Stelle 2)
        1 1 1 · · ·        ← 111 · 1 (Stelle 3)
  ---------------------
        1 0 1 1 0 1 1      = 91
```
Kurzform: Multiplizieren mit 2ⁿ = **n Nullen anhängen** (Linksverschiebung / Shift).

### Schriftliche Division (dual)
Wie im Dezimalsystem: Divisor unter die Stellen des Dividenden schieben; passt er hinein, **1** ins Ergebnis und subtrahieren, sonst **0** und nächste Stelle herunterholen.
Beispiel 10010001 : 101 (145 : 5):
```
  1001 0001 : 101 = 11101
 −101                       1001 ≥ 101 → 1
  ----
   100  ↓0 → 1000           1000 ≥ 101 → 1
  − 101
   ----
     11  ↓0 → 110           110 ≥ 101 → 1
   − 101
    ----
       1  ↓0 → 10           10 < 101  → 0
          ↓1 → 101          101 ≥ 101 → 1
        − 101
        -----
            0  (Rest)
```
Ergebnis **11101₂ = 29**, Rest 0.

Praxis-Tipp für die Prüfung: Division und Multiplikation lassen sich **zur Kontrolle dezimal** prüfen (145 : 5 = 29 = 11101₂). Division durch 2ⁿ = **n Stellen rechts abschneiden** (Rechtsverschiebung, Rest = abgeschnittene Bits).

### Rechnen im Hexadezimalsystem
**Addition**: Stellen addieren; ab **16** entsteht ein Übertrag von 1, von der Summe 16 abziehen.
```
    A 3 F        (10 3 15)
  + B 4 E        (11 4 14)
  -------
  1 5 8 D
```
F + E = 15 + 14 = 29 = 16 + **13 (D)**, Übertrag 1 · 3 + 4 + 1 = **8** · A + B = 10 + 11 = 21 = 16 + **5**, Übertrag **1** → **158D₁₆** (= 5517).

**Subtraktion**: Reicht die Stelle nicht, von der nächsten Stelle **16 borgen**.
```
    E 8 D
  − A 4 C
  -------
    4 4 1
```
Beispiel mit Borgen: 2A3 − 1B2: 3 − 2 = 1 · A − B geht nicht → 16 + 10 − 11 = **15 (F)**, Borgen · 2 − 1 − 1 = **0** → **F1₁₆** (= 241).

### Überläufe
Hat das Ergebnis **mehr Stellen** als die Operanden (z. B. 8 Bit + 8 Bit = 9 Bit), entsteht ein **Übertrag (Carry)**. In einem Register fester Breite geht dieses Bit verloren bzw. landet im **Carry-Flag** der CPU. 1101 0110 + 1011 0011 = **1 1000 1001** (393) – passt nicht mehr in 8 Bit (max. 255).

## Übungen
- A: 1001 1100 + 0101 0011 | L: 1110 1111 (156 + 83 = 239)
- A: 0110 1011 + 1011 1001 | L: 1 0010 0100 (107 + 185 = 292, Übertrag in 9. Stelle)
- A: 0111 1100 + 1101 1011 | L: 1 0101 0111 (124 + 219 = 343)
- A: 1110 1001 + 1011 0101 | L: 1 1001 1110 (233 + 181 = 414)
- A: 1110 + 1001 | L: 10111 = 23
- A: 110111 + 101110 | L: 1100101 = 101
- A: 1010110 + 1100111 | L: 10111101 = 189
- A: 110111 − 11010 | L: 11101 = 29
- A: 1100110 − 111001 | L: 101101 = 45
- A: 10101010 − 1111101 | L: 101101 = 45
- A: 111 × 1011 | L: 1001101 = 77
- A: 1010 × 110011 | L: 111111110 = 510
- A: 111 × 1101 | L: 1011011 = 91
- A: 10010001 : 101 | L: 11101 = 29 (Rest 0)
- A: 1101100110 : 1010 | L: 1010111 = 87 (Rest 0)
- A: 1111111001 : 1110001 | L: 1001 = 9 (Rest 0)
- A: 1011 + 0110 | L: 10001 = 17
- A: 1101 + 1010 | L: 10111 = 23
- A: 11001 + 01110 | L: 100111 = 39
- A: 1110 − 0101 | L: 1001 = 9
- A: 10110 − 01011 | L: 1011 = 11
- A: 111001 − 011010 | L: 11111 = 31
- A: 11010110 + 10110011 | L: 110001001 = 393 = 189₁₆
- A: 10111001 + 11001101 | L: 110000110 = 390
- A: 111000111 + 100111001 | L: 1100000000 = 768
- A: 11110000 − 10101101 | L: 1000011 = 67
- A: 100010101 − 011011011 | L: 111010 = 58
- A: 11111111 − 10000000 | L: 1111111 = 127
- A: A3F + B4E (hex) | L: 158D = 5517
- A: 1F7 + 2D5 (hex) | L: 4CC = 1228
- A: FF0 + 00F (hex) | L: FFF = 4095
- A: E8D − A4C (hex) | L: 441 = 1089
- A: 2A3 − 1B2 (hex) | L: F1 = 241
- A: 1000 − FFF (hex) | L: 1
- A: 1011₂ + 0110₂, Ergebnis auch dezimal | L: 10001₂ = 17 (11 + 6)
- A: 25 + 13 dezimal, dann dual | L: 38; 11001 + 01101 = 100110 = 38 ✔
- A: 10101₂ − 01100₂, Probe dezimal | L: 01001₂ = 9 (21 − 12 = 9 ✔)
- A: 11010110₂ + 10110011₂ in dezimal und hex | L: 110001001₂ = 393 = 189₁₆
- A: 7B4₁₆ + 2C9₁₆ in dual und dezimal | L: A7D₁₆ = 1010 0111 1101₂ = 2685
- A: 10000000₂ − 1111111₂, auch in hex | L: 1₂ = 1₁₆ (128 − 127)
- A: 256 + 128 in dual und hex | L: 1 0000 0000 + 1000 0000 = 1 1000 0000₂; 100₁₆ + 80₁₆ = 180₁₆; beides = 384 ✔

## Einfach

Rechnen im Dualsystem ist **leichter als du denkst** – es gibt ja nur 0 und 1!

**Plus rechnen**: Genau wie in der Schule untereinander schreiben und von rechts anfangen.
- 0 + 0 = 0
- 0 + 1 = 1
- 1 + 1 = **10** → du schreibst **0 hin und merkst dir 1** (Übertrag) – wie bei 5 + 5 = 10 im Dezimalsystem!
- 1 + 1 + 1 (mit Übertrag) = **11** → schreibe 1, merke 1.

Im Dezimalsystem gibt's den Übertrag ab 10, im Dualsystem schon ab **2**, im Hexsystem ab **16**. Das ist der ganze Unterschied!

**Minus rechnen**: 1 − 0 = 1, 1 − 1 = 0, 0 − 0 = 0. Und 0 − 1? Geht nicht – also **leihst** du dir von der nächsten Stelle links etwas. Wie wenn dir beim Bezahlen Kleingeld fehlt und du einen Schein wechselst.

**Mal rechnen** ist sogar super einfach: Du malst entweder mit 0 (dann kommt 0 raus) oder mit 1 (dann schreibst du die Zahl einfach ab). Jede Zeile rutscht eine Stelle nach links. Am Ende alles zusammenzählen.

**Geheimtrick**: Eine Binärzahl **mal 2** = hinten eine **0 dranhängen**. 101 (5) × 2 = 1010 (10). Genau wie im Dezimalsystem × 10 eine 0 anhängt!

**Hex rechnen**: Denk bei jeder Stelle in Dezimalzahlen (A = 10, F = 15 …), rechne ganz normal – und wenn es **16 oder mehr** wird, ziehst du 16 ab und merkst dir 1.

**Kontrolle**: Wenn du unsicher bist, rechne beide Zahlen in Dezimal um, rechne dort, und schau, ob dasselbe rauskommt. Das ist in der Prüfung die beste Probe!

## Merksatz
- Dual: **1 + 1 = 10** (0 hin, 1 im Sinn).
- Übertrag bei der **Basis**: dual ab 2, dezimal ab 10, hex ab 16.
- **0 − 1 → borgen**.
- × 2ⁿ = n Nullen **anhängen**; : 2ⁿ = n Stellen **abschneiden**.
- **Immer dezimal gegenprüfen!**

## Prüfungsfalle
- Übertrag in die neue höchste Stelle vergessen (Ergebnis hat eine Stelle mehr).
- Beim Borgen die nächste Stelle nicht verringert.
- Hex-Überträge bei 10 statt bei 16 gesetzt.
- Multiplikation: Zeilen falsch eingerückt.
- Bei fester Bitbreite (8 Bit) den Überlauf nicht erkannt.

## Grafik
### Rechenkarussell
Zwei Binärzahlen stehen untereinander; von rechts nach links wird Stelle für Stelle addiert, Überträge hüpfen als kleine Kugeln nach links. Umschaltbar auf Subtraktion (Borg-Pfeil) und Hex.

### Shift-Maschine
Binärzahl in Kästchen; Knopf „× 2“ schiebt alle Bits nach links und füllt rechts mit 0; „: 2“ schiebt nach rechts, das herausfallende Bit wird als Rest angezeigt.

## Karteikarten
- F: 1 + 1 im Dualsystem? | A: 10 (0, Übertrag 1).
- F: 1 + 1 + 1 im Dualsystem? | A: 11 (1, Übertrag 1).
- F: Was tut man bei 0 − 1 im Dualsystem? | A: Von der nächsthöheren Stelle borgen → Ergebnis 1.
- F: Wie multipliziert man eine Binärzahl mit 4? | A: Zwei Nullen anhängen (Linksverschiebung um 2).
- F: F + 1 im Hexsystem? | A: 10₁₆ (16).
- F: 9 + 8 im Hexsystem? | A: 11₁₆ (17 = 16 + 1).
- F: Wie prüft man ein Ergebnis am sichersten? | A: Operanden dezimal umrechnen, dort rechnen, vergleichen.
- F: Was ist ein Carry/Überlauf? | A: Übertrag über die höchste verfügbare Stelle hinaus – bei fester Bitbreite geht er verloren.

## Quiz
? Was ergibt 1011₂ + 0111₂?
* 10010₂
- 1110₂
- 10000₂
- 11010₂

? Was ergibt 1100₂ − 0101₂?
* 0111₂
- 0110₂
- 1001₂
- 0101₂

? Was ergibt 1F₁₆ + 1₁₆?
* 20₁₆
- 1G₁₆
- 110₁₆
- 2F₁₆

? Wie lautet 101₂ × 100₂?
* 10100₂
- 1001₂
- 101100₂
- 1010₂

? Zwei 8-Bit-Zahlen 1111 0000 und 0001 0000 werden addiert. Was passiert in einem 8-Bit-Register?
* Es entsteht ein Überlauf, das Register enthält 0000 0000
- Das Ergebnis ist 1111 1111
- Das Ergebnis ist 1110 0000
- Es passiert nichts Besonderes
