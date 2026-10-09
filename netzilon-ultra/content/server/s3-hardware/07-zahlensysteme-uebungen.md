---
id: server-hw-zahlensysteme-uebungen
bereich: AP1
pruefungen: [AP1, Schule]
fach: ITK / Grundlagen
block: S3
kapitel: Hardware
titel: Zahlensysteme – Übungen 03-01, 03-02 und Zusatzaufgaben komplett gelöst
stufe: Einsteiger
quellen: [03-1-uebung-Zahlensysteme.pdf, 03-2-uebung-Zahlensysteme2.pdf, 03-3-uebung-Zahlensysteme.pdf]
verweise: [ap1-a3-zahlensysteme, ap1-a3-rechnen, ap1-a3-zweierkomplement, ap1-a3-logik, server-hw-eva]
---

## Profi

Die Theorie steht in den AP1-Themen **Zahlensysteme**, **Rechnen mit Dual und Hex**, **Zweierkomplement** und **Logik**. Diese Seite enthält die **Rechenwege und alle Lösungen** der drei Übungsblätter (03-01, 03-02, Zusatzaufgaben) – jede Zahl wurde nachgerechnet.

### Umrechnungen
- **Dual (binär, Basis 2)**: Stellenwerte 128 64 32 16 8 4 2 1 (bei 8 Bit). Dezimal → Dual: größtes passendes Stellenwert-Bit setzen, Rest weiter zerlegen, oder fortlaufend durch 2 teilen und die Reste **von unten nach oben** lesen.
- **Hexadezimal (Basis 16)**: Ziffern 0–9 und A=10, B=11, C=12, D=13, E=14, F=15. Stellenwerte 1, 16, 256, 4096 … Dezimal → Hex: durch 16 teilen, Reste von unten nach oben.
- **Dual ↔ Hex** geht ohne Rechnen: **eine Hex-Ziffer = 4 Bit (Tetrade)**. Von rechts in Vierergruppen teilen, links mit Nullen auffüllen.
- **Informationsgehalt**: n Bit unterscheiden 2^n Zustände (8 Bit → 256 Werte, 0–255).

### Rechnen im Dualsystem
- **Addition**: 0+0=0, 0+1=1, 1+1=10 (0, Übertrag 1), 1+1+1=11. Bei 8 Bit ist ein Übertrag aus dem höchsten Bit ein **Überlauf** (Ergebnis > 255).
- **Subtraktion** schriftlich mit Borgen, im Rechner als **Addition des Zweierkomplements**.
- **Multiplikation**: je 1 im Multiplikator wird der Multiplikand um die Stelle nach links verschoben und alles addiert (Schieben + Addieren).
- **Division**: wie schriftlich im Dezimalsystem, aber es wird nur subtrahiert oder nicht subtrahiert.

### Logische Verknüpfungen (bitweise)
| A | B | UND | ODER | XOR |
|---|---|---|---|---|
| 0 | 0 | 0 | 0 | 0 |
| 0 | 1 | 0 | 1 | 1 |
| 1 | 0 | 0 | 1 | 1 |
| 1 | 1 | 1 | 1 | 0 |

### Zweierkomplement (8 Bit)
Wertebereich **−128 bis +127**. Negation: alle Bits invertieren, +1. Das höchste Bit ist das Vorzeichenbit (1 = negativ). A − B wird als A + (−B) gerechnet; ein Übertrag aus dem höchsten Bit wird verworfen. Liegt das echte Ergebnis außerhalb −128…+127 (z. B. 98 + 30 = 128), tritt ein Überlauf auf und das Ergebnis ist falsch (hier 1000 0000 = −128).

## Einfach

Computer kennen nur **an und aus**. Eine Lampe ist an (1) oder aus (0). Mit vielen Lampen nebeneinander kann man Zahlen zeigen – das ist das **Dualsystem**.

Stell dir 8 Lampen vor. Jede Lampe ist eine Münze mit festem Wert: 128, 64, 32, 16, 8, 4, 2, 1. Leuchtet die Lampe, zählt ihr Wert mit. Leuchten 64, 32 und 2, ist die Zahl 64 + 32 + 2 = **98**. Umgekehrt fragst du bei einer Zahl von links nach rechts: „Passt die 128 noch rein? Ja oder nein?“ – so entsteht die Binärzahl.

Lange Binärzahlen sind schwer zu lesen. Darum fasst man **je 4 Lampen** zu einem Zeichen zusammen. 4 Lampen können 16 Muster zeigen, also braucht man 16 Zeichen: 0–9 und dazu A bis F. Das ist das **Hexadezimalsystem** – eine Abkürzung für Binärzahlen. 1111 ist F, 1010 ist A, 0110 ist 6.

**Addieren** geht wie in der Grundschule, nur dass 1 + 1 schon „10“ ergibt (null hinschreiben, eins merken). Wenn die Lampenreihe zu kurz ist und die Zahl hinten herausfällt, nennt man das **Überlauf** – wie ein Kilometerzähler, der von 999 999 auf 000 000 springt.

**Negative Zahlen** bekommen die oberste Lampe als Minus-Lampe. Um aus 13 die −13 zu machen, kehrst du jede Lampe um (an wird aus, aus wird an) und rechnest +1. Dann kann der Computer Abziehen einfach als Zusammenzählen erledigen.

**UND, ODER, XOR** sind Regeln für zwei Schalter: UND = Licht nur, wenn beide an sind (Reihenschaltung). ODER = Licht, wenn mindestens einer an ist (Parallelschaltung). XOR = Licht, wenn genau einer an ist (Wechselschalter im Flur).

## Merksatz
- **Hex-Ziffer = 4 Bit** – 1 Byte sind immer 2 Hex-Ziffern.
- **Invertieren und +1** macht aus einer Zahl ihr Negativ.
- **1 + 1 = 10** im Dualsystem.
- **UND = beide, ODER = mindestens einer, XOR = genau einer.**
- 8 Bit: 0…255 ohne Vorzeichen, −128…+127 mit Zweierkomplement.

## Prüfungsfalle
- Bei Dezimal → Dual die Reste **von unten nach oben** lesen, nicht von oben.
- Hex-Buchstaben nicht verwechseln: A=10 … F=15 (nicht A=1).
- Zweierkomplement: erst auf die **richtige Bitbreite** auffüllen, dann invertieren. −1 ist immer 1111 1111.
- Ein Übertrag aus dem höchsten Bit ist bei vorzeichenbehafteten Zahlen nicht immer ein Fehler – entscheidend ist, ob das Ergebnis in −128…+127 liegt (98 + 30 = 128 ist ein echter Überlauf).
- XOR ist **nicht** ODER: bei 1 XOR 1 kommt 0 heraus.

## Grafik
### Dezimal 98 in Binär umrechnen
1. Zahl: Start mit 98, Stellenwerte 128 64 32 16 8 4 2 1
2. Zahl -> Stellenwert 128: passt nicht, Bit = 0
3. Zahl -> Stellenwert 64: passt, Bit = 1, Rest 34
4. Zahl -> Stellenwert 32: passt, Bit = 1, Rest 2
5. Zahl -> Stellenwert 2: passt, Bit = 1, Rest 0
6. Ergebnis: 0110 0010 = 62h

### Zweierkomplement von 13
1. Betrag: 13 = 0000 1101
2. Betrag -> Inverter: alle Bits umdrehen
3. Inverter -> Addierer: 1111 0010
4. Addierer: +1 ergibt 1111 0011
5. Ergebnis: -13 = 1111 0011

## Lab
### GUI
**Maschine: Windows-11-Client.** Taschenrechner (calc.exe) öffnen → Menü ☰ → **Programmierer**. Zahl 98 als **DEZ** eingeben und beobachten, wie **HEX** (62) und **BIN** (0110 0010) mitwechseln. Auf **BIN** klicken und einzelne Bits per Klick umschalten; mit **ODER/UND/XOR/NICHT** logische Verknüpfungen testen. Bitbreite auf **BYTE** stellen und −13 eingeben: der Rechner zeigt das Zweierkomplement 1111 0011.

### PowerShell
```powershell
# Maschine: Windows-11-Client (PowerShell)
[Convert]::ToString(98,2).PadLeft(8,'0')      # 01100010
[Convert]::ToString(2043,16).ToUpper()         # 7FB
[Convert]::ToInt32('A6E',16)                   # 2670
[Convert]::ToInt32('01111001',2)               # 121
0x9C -band 0x53                                 # UND
0x9C -bor  0x53                                 # ODER
0x9C -bxor 0x53                                 # XOR
[Convert]::ToString([byte](256-13),2)          # 11110011  (-13 als 8 Bit)
```

## Befehle
- `[Convert]::ToString(98,2)` – Dezimal → Dual (Basis 2, 8 oder 16)
- `[Convert]::ToInt32('A6E',16)` – Hex → Dezimal
- `-band, -bor, -bxor, -bnot` – bitweise UND, ODER, XOR, NICHT in PowerShell
- `calc` – Windows-Taschenrechner, Modus Programmierer

## Übungen
- A: 03-01 Aufg. 1: Binär → Dezimal: 0111 1001, 1010 0110, 1101 1001, 1001 0010 | L: 0111 1001 = 121; 1010 0110 = 166; 1101 1001 = 217; 1001 0010 = 146. Rechenweg: Stellenwerte 128 64 32 16 8 4 2 1 addieren, wo eine 1 steht (z. B. 0111 1001 = 64+32+16+8+1 = 121).
- A: 03-01 Aufg. 2: Dezimal → Binär: 98, 229, 176, 79 | L: 98 = 0110 0010; 229 = 1110 0101; 176 = 1011 0000; 79 = 0100 1111. Rechenweg: Stellenwerte von links abziehen (98 = 64+32+2) oder fortlaufend durch 2 teilen und die Reste von unten nach oben lesen.
- A: 03-01 Aufg. 3: Dezimal → Hexadezimal: 391, 264, 26, 124, 2043 | L: 391 = 187h; 264 = 108h; 26 = 1Ah; 124 = 7Ch; 2043 = 7FBh. Rechenweg: durch 16 teilen, Reste von unten nach oben (391 = 1·256 + 8·16 + 7 → 187h).
- A: 03-01 Aufg. 4: Hexadezimal → Dezimal: A6E, 9A, 3C7, FA, 248 | L: A6E = 2670; 9A = 154; 3C7 = 967; FA = 250; 248 = 584. Rechenweg: Ziffer × 16^Stelle (A6E = 10·256 + 6·16 + 14).
- A: 03-01 Aufg. 5: Hexadezimal → Binär: B3E, A6, 8CD, 25, 6E9 | L: B3E = 1011 0011 1110; A6 = 1010 0110; 8CD = 1000 1100 1101; 25 = 0010 0101; 6E9 = 0110 1110 1001. Regel: jede Hex-Ziffer = genau 4 Bit (Tetrade); B=1011, 3=0011, E=1110.
- A: 03-01 Aufg. 6: Binär → Hexadezimal: 1001 1101, 0110 1010 0110, 1101 0111, 1011 0010 1101 1001, 1111 0110 1011 0100 | L: 1001 1101 = 9Dh; 0110 1010 0110 = 6A6h; 1101 0111 = D7h; 1011 0010 1101 1001 = B2D9h; 1111 0110 1011 0100 = F6B4h. Regel: je 4 Bit von rechts zu einer Hex-Ziffer zusammenfassen.
- A: 03-02 Aufg. 1: Addiere 1001 1100 + 0101 0011 sowie 0110 1011 + 1011 1001 | L: 1001 1100 + 0101 0011 = 1110 1111 = 239; 0110 1011 + 1011 1001 = 0010 0100 (Übertrag, 9 Bit: 1 0010 0100 = 292 dezimal; im 8-Bit-Register Überlauf). Spaltenweise von rechts: 1+1 = 10 (0, Übertrag 1).
- A: 03-02 Aufg. 2: Addiere 0111 1100 + 1101 1011 sowie 1110 1001 + 1011 0101 | L: 0111 1100 + 1101 1011 = 0101 0111 (Übertrag, 9 Bit: 1 0101 0111 = 343 dezimal; im 8-Bit-Register Überlauf); 1110 1001 + 1011 0101 = 1001 1110 (Übertrag, 9 Bit: 1 1001 1110 = 414 dezimal; im 8-Bit-Register Überlauf).
- A: 03-02 Aufg. 3: Wahrheitstabellen UND, ODER, XOR (W = wahr = 1, F = falsch = 0) | L: UND: W∧W=W, W∧F=F, F∧W=F, F∧F=F. ODER: W∨W=W, W∨F=W, F∨W=W, F∨F=F. XOR (entweder-oder): W⊕W=F, W⊕F=W, F⊕W=W, F⊕F=F. Merke: UND nur wahr, wenn beide wahr; ODER nur falsch, wenn beide falsch; XOR wahr, wenn die Eingänge verschieden sind.
- A: 03-02 Aufg. 4: UND-Verknüpfung 1001 1100 UND 0101 0011 sowie 0110 1011 UND 1011 1001 | L: 1001 1100 UND 0101 0011 = 0001 0000; 0110 1011 UND 1011 1001 = 0010 1001. Bitweise Spalte für Spalte anwenden.
- A: 03-02 Aufg. 4: ODER-Verknüpfung 1001 1100 ODER 0101 0011 sowie 0110 1011 ODER 1011 1001 | L: 1001 1100 ODER 0101 0011 = 1101 1111; 0110 1011 ODER 1011 1001 = 1111 1011. Bitweise Spalte für Spalte anwenden.
- A: 03-02 Aufg. 4: XOR-Verknüpfung 1001 1100 XOR 0101 0011 sowie 0110 1011 XOR 1011 1001 | L: 1001 1100 XOR 0101 0011 = 1100 1111; 0110 1011 XOR 1011 1001 = 1101 0010. Bitweise Spalte für Spalte anwenden.
- A: 03-02 Aufg. 5: Zweierkomplement (8 Bit): -13, -112, -73, -56, -1 | L: -13 = 1111 0011; -112 = 1001 0000; -73 = 1011 0111; -56 = 1100 1000; -1 = 1111 1111. Rechenweg: Betrag binär, alle Bits invertieren, +1 (−13: 0000 1101 → 1111 0010 → 1111 0011).
- A: 03-02 Aufg. 6: Binär rechnen im Zweierkomplement: 93 − 42, 22 − 24, 83 − 97, 98 + 30 | L: 93 - 42: 0101 1101 + 1101 0110 = 0011 0011 = 51; 22 - 24: 0001 0110 + 1110 1000 = 1111 1110 = -2; 83 - 97: 0101 0011 + 1001 1111 = 1111 0010 = -14; 98 + 30: 0110 0010 + 0001 1110 = 1000 0000 = 128 → Überlauf im 8-Bit-Zweierkomplement (Wertebereich −128 bis +127), 9 Bit nötig. Subtraktion = Addition des Zweierkomplements des Subtrahenden; Übertrag aus dem höchsten Bit wird verworfen.
- A: Zusatz 1: Informationsgehalt einer 8-stelligen Binärinformation | L: 8 Bit → 2^8 = 256 verschiedene Zustände (Werte 0 bis 255) = 1 Byte.
- A: Zusatz 2: Dualzahlen → Dezimal: a) 1101111010 b) 1010110 c) 1111111001 d) 1100110011 | L: 1101111010 = 890; 1010110 = 86; 1111111001 = 1017; 1100110011 = 819
- A: Zusatz 3: Hex → Dezimal: a) 14F5B b) AB3D c) 5EA3 d) 9C23 | L: 14F5B = 85851; AB3D = 43837; 5EA3 = 24227; 9C23 = 39971
- A: Zusatz 4: Dezimal → Dual und Hex: a) 3786 b) 14876 c) 2243 d) 1024 | L: 3786 = 1110 1100 1010 = ECAh; 14876 = 0011 1010 0001 1100 = 3A1Ch; 2243 = 1000 1100 0011 = 8C3h; 1024 = 0100 0000 0000 = 400h
- A: Zusatz 5: Dual → Hex: a) 1101111010 b) 1010110 c) 1111111001 d) 1100110011 | L: 1101111010 = 37Ah; 1010110 = 56h; 1111111001 = 3F9h; 1100110011 = 333h (von rechts in Vierergruppen, links mit Nullen auffüllen).
- A: Zusatz 6: Hex → Dual: a) 14F5B b) AB3D c) 5EA3 d) 9C23 | L: 14F5B = 0001 0100 1111 0101 1011; AB3D = 1010 1011 0011 1101; 5EA3 = 0101 1110 1010 0011; 9C23 = 1001 1100 0010 0011
- A: Zusatz 7: Addition: a) 1110 + 1001 b) 110111 + 101110 c) 1010110 + 1100111 | L: 1110 + 1001 = 10111 = 23; 110111 + 101110 = 1100101 = 101; 1010110 + 1100111 = 10111101 = 189
- A: Zusatz 8: Subtraktion: a) 110111 − 11010 b) 1100110 − 111001 c) 10101010 − 1111101 | L: 110111 − 11010 = 11101 = 29; 1100110 − 111001 = 101101 = 45; 10101010 − 1111101 = 101101 = 45
- A: Zusatz 9: Multiplikation: a) 111 · 1011 b) 1010 · 110011 c) 111 · 1101 | L: 111 · 1011 = 1001101 = 77; 1010 · 110011 = 111111110 = 510; 111 · 1101 = 1011011 = 91. Schriftlich: Multiplikand je nach 1 im Multiplikator verschoben addieren.
- A: Zusatz 10: Division: a) 10010001 : 101 b) 1101100110 : 1010 c) 1111111001 : 1110001 | L: 10010001 : 101 = 11101 Rest 0 (145 : 5 = 29 Rest 0); 1101100110 : 1010 = 1010111 Rest 0 (870 : 10 = 87 Rest 0); 1111111001 : 1110001 = 1001 Rest 0 (1017 : 113 = 9 Rest 0)

## Karteikarten
- F: Wie viele Werte unterscheidet 1 Byte? | A: 2^8 = 256 Werte (0 bis 255 ohne Vorzeichen).
- F: Wie viele Bit hat eine Hex-Ziffer? | A: 4 Bit (Tetrade, 16 Werte).
- F: Welche Dezimalwerte haben die Hex-Ziffern A bis F? | A: A=10, B=11, C=12, D=13, E=14, F=15.
- F: Wie rechnet man Dezimal in Dual um? | A: Fortlaufend durch 2 teilen und die Reste von unten nach oben lesen, oder die Stellenwerte 128, 64, 32 … abziehen.
- F: Wie rechnet man Dual in Hex um? | A: Von rechts in Vierergruppen teilen, links mit Nullen auffüllen, jede Gruppe in eine Hex-Ziffer übersetzen.
- F: Was ist 1 + 1 im Dualsystem? | A: 10 (null, Übertrag 1).
- F: Wie bildet man das Zweierkomplement einer Zahl? | A: Alle Bits invertieren und 1 addieren.
- F: Wertebereich 8 Bit im Zweierkomplement? | A: −128 bis +127.
- F: Wie wird 93 − 42 im Rechner berechnet? | A: Als 93 + (−42) mit Zweierkomplement; 0101 1101 + 1101 0110 = 0011 0011 = 51 (Übertrag verworfen).
- F: Wann ist XOR wahr? | A: Wenn genau einer der beiden Eingänge wahr ist (verschiedene Werte).
- F: Was ist 0110 1011 UND 1011 1001? | A: 0010 1001.
- F: Was ergibt 98 + 30 in 8 Bit Zweierkomplement? | A: 1000 0000 – ein Überlauf (korrekt wäre 128, aber der Bereich endet bei +127).

## Quiz
? Wie lautet 0111 1001 dezimal?
* 121
- 119
- 129
- 111
! 64 + 32 + 16 + 8 + 1 = 121.
@ Übung 03-01 Aufgabe 1

? Wie lautet 229 binär?
* 1110 0101
- 1110 0011
- 1101 0101
- 1111 0101
! 229 = 128 + 64 + 32 + 4 + 1.
@ Übung 03-01 Aufgabe 2

? Wie lautet 2043 hexadezimal?
* 7FB
- 7F3
- 8FB
- 7BF
! 2043 = 7·256 + 15·16 + 11.
@ Übung 03-01 Aufgabe 3

? Wie lautet A6E hexadezimal dezimal?
* 2670
- 2660
- 2760
- 1670
! 10·256 + 6·16 + 14 = 2670.
@ Übung 03-01 Aufgabe 4

? Wie lautet 6E9 hexadezimal binär?
* 0110 1110 1001
- 0110 1101 1001
- 0111 1110 1001
- 0110 1110 0101
! 6 = 0110, E = 1110, 9 = 1001.
@ Übung 03-01 Aufgabe 5

? Wie lautet 1011 0010 1101 1001 hexadezimal?
* B2D9
- B2D3
- A2D9
- B3D9
! 1011 = B, 0010 = 2, 1101 = D, 1001 = 9.
@ Übung 03-01 Aufgabe 6

? Was ergibt 1001 1100 + 0101 0011?
* 1110 1111
- 1110 1011
- 1111 1111
- 0110 1111
! 156 + 83 = 239 = 1110 1111.
@ Übung 03-02 Aufgabe 1

? Was ergibt 0110 1011 XOR 1011 1001?
* 1101 0010
- 0010 1001
- 1111 1011
- 1101 0011
! Gleiche Bits ergeben 0, verschiedene 1.
@ Übung 03-02 Aufgabe 4

? Wie lautet −13 im 8-Bit-Zweierkomplement?
* 1111 0011
- 1111 0010
- 1000 1101
- 0000 1101
! 13 = 0000 1101, invertiert 1111 0010, plus 1 = 1111 0011.
@ Übung 03-02 Aufgabe 5

? Was ergibt 83 − 97 im 8-Bit-Zweierkomplement?
* 1111 0010 (= −14)
- 0000 1110 (= 14)
- 1111 0001 (= −15)
- 1000 1110 (= −114)
! 0101 0011 + 1001 1111 = 1111 0010, das ist −14.
@ Übung 03-02 Aufgabe 6

? Wie viele verschiedene Zustände hat eine 8-stellige Binärinformation?
* 256
- 128
- 255
- 512
! 2^8 = 256.
@ Zusatzaufgaben Zahlensysteme Aufgabe 1

? Wie lautet 1101111010 dezimal?
* 890
- 880
- 986
- 762
! 512 + 256 + 64 + 32 + 16 + 8 + 2 = 890.
@ Zusatzaufgaben Zahlensysteme Aufgabe 2

? Wie lautet 1024 hexadezimal?
* 400
- 1024
- 040
- 4000
! 1024 = 4·256.
@ Zusatzaufgaben Zahlensysteme Aufgabe 4

? Was ergibt 111 · 1011 (dual)?
* 1001101 (= 77)
- 1000101 (= 69)
- 1101101 (= 109)
- 101101 (= 45)
! 7 · 11 = 77.
@ Zusatzaufgaben Zahlensysteme Aufgabe 9

## Lücken
- Eine Hex-Ziffer entspricht {4} Bit.
- Das Zweierkomplement bildet man durch {Invertieren} und anschließendes Addieren von {1}.
- 8 Bit im Zweierkomplement reichen von {−128} bis {+127}.
- Das logische {XOR} ist nur wahr, wenn die Eingänge verschieden sind.

## Zuordnen
### Hex-Ziffer und Dezimalwert
- A => 10
- C => 12
- E => 14
- F => 15
### Verknüpfung und Ergebnis bei 1 und 1
- UND => 1
- ODER => 1
- XOR => 0

## Reihenfolge
### Dezimal in Dual umrechnen (Teilen durch 2)
1. Zahl durch 2 teilen und den Rest notieren
2. Ergebnis erneut durch 2 teilen, Rest notieren
3. Wiederholen, bis das Ergebnis 0 ist
4. Reste von unten nach oben lesen

## Freitext
- F: Erläutern Sie, warum Rechner Subtraktionen über das Zweierkomplement durchführen. | M: Mit dem Zweierkomplement wird die Subtraktion A − B zur Addition A + (−B). Dadurch braucht die CPU nur ein Addierwerk, kein eigenes Subtrahierwerk; Vorzeichen und Betrag werden einheitlich behandelt. | P: 3
- F: Nennen Sie zwei Gründe, warum Hexadezimalzahlen in der IT verwendet werden. | M: Sie sind kompakt (1 Hex-Ziffer = 4 Bit, 1 Byte = 2 Ziffern) und lassen sich ohne Rechnen in Binär umwandeln; Adressen und MAC-Adressen sind dadurch gut lesbar. | P: 2

## Szenario
### Subnetzmaske im Binärsystem
Ein Techniker liest die Subnetzmaske 255.255.255.192 und will die Hostbits bestimmen.
- F: Wie lautet das letzte Oktett binär? | A: 192 = 1100 0000
- F: Wie viele Hostbits hat das Subnetz? | A: 6 Hostbits (6 Nullen), also 2^6 − 2 = 62 nutzbare Hosts.

## Spickzettel
- Stellenwerte: 128 64 32 16 8 4 2 1
- Hex: A=10 B=11 C=12 D=13 E=14 F=15
- 1 Hex-Ziffer = 4 Bit, 1 Byte = 2 Hex-Ziffern
- 1 + 1 = 10 (Übertrag)
- Zweierkomplement: invertieren, +1
- 8 Bit: 0…255 oder −128…+127
- UND beide, ODER mindestens einer, XOR genau einer
