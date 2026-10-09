---
id: ap1-a3-zweierkomplement
bereich: AP1
block: A3
kapitel: Zahlen & Logik
titel: Negative Zahlen – Einer- und Zweierkomplement
stufe: Fortgeschritten
quellen: [03-2-uebung-Zahlensysteme2.pdf, Zweierkomplement.ods]
verweise: [ap1-a3-rechnen, ap1-a3-zahlensysteme, ap1-a3-logik]
---

## Profi

### Problem
Computer kennen nur 0 und 1 – ein Minuszeichen gibt es nicht. Negative Zahlen müssen also **im Bitmuster codiert** werden. Außerdem soll die CPU Subtraktion möglichst mit demselben **Addierwerk** erledigen.

### Verfahren im Überblick (8 Bit)
| Verfahren | Idee | Wertebereich (8 Bit) | Nachteil |
|---|---|---|---|
| Vorzeichen-Betrag | höchstes Bit = Vorzeichen (1 = negativ), Rest = Betrag | −127 … +127 | **zwei Nullen** (+0, −0), Addition kompliziert |
| **Einerkomplement** | alle Bits **invertieren** | −127 … +127 | ebenfalls **zwei Nullen** (0000 0000 und 1111 1111), Rechnen braucht Korrektur (End-around-Carry) |
| **Zweierkomplement** | invertieren **+ 1** | **−128 … +127** | – (Standard in allen CPUs) |

Allgemein: Zweierkomplement mit n Bit → **−2ⁿ⁻¹ bis 2ⁿ⁻¹ − 1**. 16 Bit: −32.768 … 32.767; 32 Bit: ca. ±2,1 Mrd.

### Zweierkomplement bilden
1. Positive Zahl in Dualdarstellung mit **fester Bitbreite** schreiben (führende Nullen!).
2. Alle Bits **invertieren** (0 ↔ 1) → Einerkomplement.
3. **1 addieren** → Zweierkomplement.

Beispiel −13 (8 Bit):
| Schritt | Bits |
|---|---|
| +13 | 0000 1101 |
| invertiert (Einerkomplement) | 1111 0010 |
| + 1 | **1111 0011** |

Beispiele aus der Tabelle (4 Bit): 2 = 0010 → 1101 → **1110**; 5 = 0101 → 1010 → **1011**.

**Schnellmethode**: Von rechts alle Bits bis **einschließlich der ersten 1** abschreiben, alle weiteren invertieren. 0011 1000 (56) → 1100 **1000** (−56).

**Rückwandlung**: Ist das höchste Bit 1 (negativ), erneut Zweierkomplement bilden → Betrag. Oder: höchstes Bit zählt **negativ** (−128), Rest normal: 1111 0011 = −128 + 64 + 32 + 16 + 2 + 1 = **−13**.

### Stellenwerte im Zweierkomplement (8 Bit)
| −128 | 64 | 32 | 16 | 8 | 4 | 2 | 1 |
|---|---|---|---|---|---|---|---|

### Subtrahieren durch Addieren
**A − B = A + (Zweierkomplement von B)**. Ein Übertrag über die höchste Stelle hinaus wird **ignoriert** (fällt raus).

Beispiel aus der Tabelle (4 Bit): 5 − 2
```
    0101   (5)
  + 1110   (−2)
  ------
  1 0011   → Übertrag ignoriert → 0011 = 3 ✔
```

Beispiel 93 − 42 (8 Bit):
```
    0101 1101   (93)
  + 1101 0110   (−42)
  -----------
  1 0011 0011   → Übertrag ignorieren → 0011 0011 = 51 ✔
```
Beispiel 22 − 24:
```
    0001 0110   (22)
  + 1110 1000   (−24)
  -----------
    1111 1110   → höchstes Bit 1 → negativ → Komplement: 0000 0010 → −2 ✔
```

### Überlauf (Overflow)
Liegt das Ergebnis **außerhalb des Wertebereichs**, ist es falsch. Erkennen: Zwei **positive** Zahlen ergeben ein **negatives** Ergebnis (oder zwei negative ein positives).
Beispiel 98 + 30 (8 Bit): 0110 0010 + 0001 1110 = **1000 0000** → als Zweierkomplement **−128** statt 128 → **Overflow**, weil +128 in 8 Bit nicht darstellbar ist (max. +127). Die CPU setzt dafür das **Overflow-Flag** (nicht zu verwechseln mit dem Carry-Flag).

### Warum Zweierkomplement?
- Nur **eine Null**.
- Addition und Subtraktion mit **demselben Addierwerk** – keine Sonderbehandlung.
- Vorzeichen am höchsten Bit sofort erkennbar.
- In Programmiersprachen: `int`, `short`, `sbyte` (vorzeichenbehaftet) nutzen Zweierkomplement; `byte`/`uint` sind vorzeichenlos.

## Übungen
- A: −13 im Zweierkomplement (8 Bit) | L: 13 = 0000 1101 → 1111 0010 → 1111 0011
- A: −112 im Zweierkomplement (8 Bit) | L: 112 = 0111 0000 → 1000 1111 → 1001 0000
- A: −73 im Zweierkomplement (8 Bit) | L: 73 = 0100 1001 → 1011 0110 → 1011 0111
- A: −56 im Zweierkomplement (8 Bit) | L: 56 = 0011 1000 → 1100 0111 → 1100 1000
- A: −1 im Zweierkomplement (8 Bit) | L: 1 = 0000 0001 → 1111 1110 → 1111 1111
- A: 93 − 42 binär (Zweierkomplement) | L: 0101 1101 + 1101 0110 = (1) 0011 0011 = 51
- A: 22 − 24 binär (Zweierkomplement) | L: 0001 0110 + 1110 1000 = 1111 1110 = −2
- A: 83 − 97 binär (Zweierkomplement) | L: 0101 0011 + 1001 1111 = 1111 0010 = −14
- A: 98 + 30 binär (8 Bit Zweierkomplement) | L: 0110 0010 + 0001 1110 = 1000 0000 → Überlauf! (128 > 127, wird als −128 gelesen)
- A: 5 − 2 mit 4 Bit | L: 0101 + 1110 = (1) 0011 = 3
- A: Zweierkomplement von 7 (4 Bit) | L: 0111 → 1000 → 1001

## Einfach

Computer kennen kein Minuszeichen. Wie schreiben sie dann „−5“? Mit einem cleveren Trick – dem **Zweierkomplement**.

Stell dir einen **Kilometerzähler im Auto** vor, der nur 3 Stellen hat (000 bis 999). Fährst du von 000 einen Kilometer **rückwärts**, springt er auf **999**. Also bedeutet 999 so etwas wie „−1“, 998 wie „−2“. Genau so macht es der Computer mit Bits: 1111 1111 ist **−1**.

**Das Rezept für eine negative Zahl** (drei Schritte):
1. Schreib die **positive** Zahl hin – immer mit allen 8 Stellen (vorne Nullen auffüllen!).
2. **Dreh alles um**: Jede 0 wird 1, jede 1 wird 0.
3. **Zähl 1 dazu.**

Beispiel −13: 13 = 0000 1101 → umgedreht 1111 0010 → plus 1 = **1111 0011**. Fertig!

**Woran erkennt man negative Zahlen?** Steht **ganz links eine 1**, ist die Zahl negativ.

**Warum der ganze Aufwand?** Weil der Computer dann **nicht mehr minus rechnen muss**! 93 − 42 ist dasselbe wie 93 + (−42). Er rechnet also einfach Plus mit der „umgedrehten“ Zahl. Was ganz links über den Rand hinausfällt, wird einfach **weggeworfen**.

**Vorsicht, Überlauf!** Mit 8 Bit kann man nur von −128 bis +127 zählen. Rechnest du 98 + 30 = 128, passt das nicht mehr rein – der Kilometerzähler springt über und zeigt plötzlich **−128**. Das nennt man **Überlauf**. Es ist wie bei einem alten Videospiel, bei dem der Punktestand über das Maximum springt und plötzlich wieder bei null oder negativ anfängt.

## Merksatz
- **Invertieren + 1** = Zweierkomplement.
- Höchstes Bit **1** = negativ.
- 8 Bit: **−128 bis +127**.
- **A − B = A + (−B)**, Übertrag **wegwerfen**.
- Plus + Plus = Minus → **Overflow**!

## Prüfungsfalle
- Feste Bitbreite vergessen (−13 mit 4 Bit ist nicht darstellbar, mit 8 Bit schon).
- Nur invertiert, +1 vergessen (das ist dann Einerkomplement).
- Übertrag über die höchste Stelle **nicht** ignoriert.
- Negatives Ergebnis (höchstes Bit 1) wie eine positive Zahl gelesen.
- Überlauf nicht erkannt (98 + 30 in 8 Bit).

## Grafik
### Zahlenrad
Ein Kreis mit 16 Positionen (4 Bit): oben 0000 = 0, im Uhrzeigersinn bis 0111 = 7, dann springt es auf 1000 = −8 bis 1111 = −1. Plus-Knopf dreht vorwärts, Minus-Knopf rückwärts; Überlauf-Stelle zwischen 7 und −8 blinkt rot.

### Drei-Schritt-Rezept
Eine positive Binärzahl erscheint, alle Bits drehen sich mit Flip-Animation um, danach addiert eine „+1“-Kugel von rechts mit Überträgen.

### Subtraktion ohne Minus
93 und 42 erscheinen; 42 verwandelt sich in −42 (Rezept), dann wird addiert; das herausfallende neunte Bit fällt sichtbar in einen Papierkorb.

## Karteikarten
- F: Wie bildet man das Zweierkomplement? | A: Alle Bits invertieren und 1 addieren.
- F: Wertebereich 8-Bit-Zweierkomplement? | A: −128 bis +127.
- F: Woran erkennt man eine negative Zahl im Zweierkomplement? | A: Höchstwertiges Bit ist 1.
- F: −1 in 8 Bit? | A: 1111 1111.
- F: Nachteil des Einerkomplements? | A: Zwei Darstellungen der Null (0000 0000 und 1111 1111).
- F: Wie subtrahiert die CPU? | A: Sie addiert das Zweierkomplement des Subtrahenden; Übertrag über die höchste Stelle wird ignoriert.
- F: Was ist ein Overflow? | A: Ergebnis liegt außerhalb des Wertebereichs, z. B. zwei positive Zahlen ergeben ein negatives Ergebnis.
- F: Stellenwert des höchsten Bits im 8-Bit-Zweierkomplement? | A: −128.
- F: −56 im Zweierkomplement? | A: 1100 1000.

## Quiz
? Wie lautet −5 im 8-Bit-Zweierkomplement?
* 1111 1011
- 1111 1010
- 1000 0101
- 0000 0101

? Welchen Wert hat 1111 0000 im 8-Bit-Zweierkomplement?
* −16
- 240
- −112
- −15

? Welcher Wertebereich gilt für 16-Bit-Zweierkomplement?
* −32.768 bis 32.767
- 0 bis 65.535
- −32.767 bis 32.767
- −65.536 bis 65.535

? 100 + 50 wird in einem 8-Bit-Zweierkomplement-Register berechnet. Was passiert?
* Es tritt ein Überlauf auf, das Ergebnis wird negativ interpretiert
- Das Ergebnis ist korrekt 150
- Der Übertrag wird ignoriert und 50 bleibt übrig
- Die CPU wechselt automatisch auf 16 Bit

? Was ist das Einerkomplement von 0101 1010?
* 1010 0101
- 1010 0110
- 0101 1011
- 1111 1111

? Wie bildet man das Zweierkomplement einer Binärzahl?
* Alle Bits invertieren und 1 addieren
- Alle Bits invertieren
- 1 subtrahieren
- Die Bits in umgekehrter Reihenfolge schreiben
! Einerkomplement + 1 = Zweierkomplement.

? Welcher Wertebereich gilt für 8-Bit-Zweierkomplement?
* −128 bis +127
- −127 bis +127
- 0 bis 255
- −256 bis +255
! Es gibt nur eine Null, daher eine negative Zahl mehr.

? Woran erkennt man im Zweierkomplement eine negative Zahl?
* Am höchstwertigen Bit (MSB) = 1
- Am niedrigsten Bit = 1
- An einer ungeraden Anzahl Einsen
- Am Vorzeichen-Byte vor der Zahl
! Das MSB fungiert als Vorzeichen.
