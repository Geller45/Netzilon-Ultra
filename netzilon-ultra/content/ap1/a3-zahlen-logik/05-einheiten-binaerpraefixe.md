---
id: ap1-a3-binaerpraefixe
bereich: AP1
block: A3
kapitel: Zahlen & Logik
titel: Einheiten, Binärpräfixe & Übertragungszeiten
stufe: Fortgeschritten
quellen: [Aufgaben10.pdf]
verweise: [ap1-a3-zahlensysteme, ap1-a1-arbeitsspeicher, ap1-a1-usb, ap1-a4-netzwerkgrundlagen]
---

## Profi

### Bit und Byte
- **Bit** (b): kleinste Informationseinheit, 0 oder 1.
- **Byte** (B): **8 Bit**. Großes **B = Byte**, kleines **b = Bit**.
- **Nibble**: 4 Bit (eine Hex-Ziffer). **Oktett**: genau 8 Bit (Netzwerktechnik).

### Dezimal- vs. Binärpräfixe (IEC 60027-2)
| Dezimal (SI) | Faktor | Binär (IEC) | Faktor | Abweichung |
|---|---|---|---|---|
| kB (Kilobyte) | 10³ = 1.000 | **KiB** (Kibibyte) | 2¹⁰ = 1.024 | 2,4 % |
| MB (Megabyte) | 10⁶ | **MiB** (Mebibyte) | 2²⁰ = 1.048.576 | 4,9 % |
| GB (Gigabyte) | 10⁹ | **GiB** (Gibibyte) | 2³⁰ = 1.073.741.824 | 7,4 % |
| TB (Terabyte) | 10¹² | **TiB** (Tebibyte) | 2⁴⁰ | 10 % |
| PB | 10¹⁵ | PiB | 2⁵⁰ | 12,6 % |

**Wer verwendet was?**
| Bereich | übliche Einheit |
|---|---|
| Festplatten-/SSD-Hersteller | dezimal (1 TB = 10¹² Byte) |
| Windows-Explorer | rechnet **binär**, beschriftet aber mit „GB“/„TB“ |
| Linux, macOS (seit 10.6) | korrekt: binär mit KiB/MiB **oder** dezimal |
| Arbeitsspeicher | binär (16 GB RAM = 16 GiB) |
| **Datenübertragung** (Ethernet, DSL, USB, PCIe) | **immer dezimal**, meist in **Bit/s** |

**Warum zeigt Windows bei einer 1-TB-Platte nur ca. 931 GB?**
1 TB = 1.000.000.000.000 Byte ÷ 1.073.741.824 (Byte pro GiB) = **931,3 GiB** – Windows schreibt „GB“, meint aber GiB. Es fehlt nichts.

**AP-Prüfungshinweis** (so in der Aufgabe vorgegeben):
- Speicherkapazität (z. B. Festplatten) in **MiB = 1.024 × 1.024 Byte**
- Transferrate (z. B. PCI-Bus) in **MB/s = 1.000 × 1.000 Byte/s**
- Transferrate (z. B. Ethernet, DSL) in **Mbit/s = 1.000 × 1.000 bit/s**
→ Immer die im Aufgabentext genannten Definitionen verwenden!

### Übertragungszeit berechnen
**t = Datenmenge (in Bit) ÷ Übertragungsrate (in Bit/s)**

Vorgehen:
1. Datenmenge in **Bit** umrechnen (Byte × 8; bei MiB zusätzlich × 1.048.576).
2. Übertragungsrate in **Bit/s** umrechnen (Mbit/s × 1.000.000).
3. Teilen → Sekunden, dann ggf. in Minuten/Stunden.

**Beispiel 1**: 700 MiB über 100 Mbit/s
- Datenmenge: 700 × 1.048.576 Byte × 8 = 5.872.025.600 Bit
- Rate: 100.000.000 Bit/s
- t = 58,72 s ≈ **59 s**

**Beispiel 2**: 4,7 GB (dezimal) über DSL 50 Mbit/s
- 4,7 × 10⁹ × 8 = 37,6 × 10⁹ Bit ÷ 50 × 10⁶ = **752 s ≈ 12 min 32 s**

**Beispiel 3**: Wie viel MB/s liefert Gigabit-Ethernet? 1.000 Mbit/s ÷ 8 = **125 MB/s** (theoretisch; real ca. 110–118 MB/s durch Protokoll-Overhead).

### Speicherbedarf berechnen
- **Bild (unkomprimiert)**: Breite × Höhe × Farbtiefe (Bit) ÷ 8 = Byte. 1920 × 1080 × 24 Bit ÷ 8 = 6.220.800 Byte ≈ **5,93 MiB**.
- **Audio (PCM)**: Abtastrate × Bittiefe × Kanäle × Sekunden ÷ 8. CD: 44.100 × 16 × 2 = 1.411.200 Bit/s ≈ 1,41 Mbit/s → 1 Minute ≈ 10,1 MiB.
- **Video**: Bilder pro Sekunde × Bildgröße (unkomprimiert) – deshalb ist Kompression (H.264/HEVC/AV1) unverzichtbar.

### Zusammenhang Bitbreite und Adressraum
- 32-Bit-Adressbus → 2³² Byte = **4 GiB** adressierbar.
- 64-Bit → theoretisch 16 EiB (praktisch durch CPU begrenzt, z. B. 48/57 Bit).

## Übungen
- A: Wie viele Byte sind 1 MiB? | L: 1.024 × 1.024 = 1.048.576 Byte
- A: Wie viele GiB zeigt Windows bei einer 2-TB-Festplatte? | L: 2 × 10¹² ÷ 2³⁰ ≈ 1.862,6 GiB (≈ 1,82 TiB)
- A: Übertragungszeit 700 MiB bei 100 Mbit/s | L: 700 × 1.048.576 × 8 ÷ 100.000.000 ≈ 58,7 s
- A: 1 Gbit/s in MB/s | L: 1.000.000.000 ÷ 8 = 125.000.000 Byte/s = 125 MB/s
- A: Speicherbedarf Full-HD-Bild mit 24 Bit Farbtiefe | L: 1920 × 1080 × 3 Byte = 6.220.800 Byte ≈ 5,93 MiB

## Einfach

**Bit und Byte**: Ein Bit ist ein einzelner **Lichtschalter** (an/aus). Ein Byte sind **8 Lichtschalter** nebeneinander – damit kann man z. B. einen Buchstaben speichern. Merke: kleines **b** = Bit, großes **B** = Byte.

**Das große Einheiten-Durcheinander**: Normalerweise heißt „Kilo“ **1.000** (1 Kilogramm = 1.000 Gramm). Computer zählen aber in Zweierpotenzen, und 2¹⁰ = **1.024** liegt so nah an 1.000, dass man früher einfach auch „Kilo“ gesagt hat. Das gibt Chaos! Deshalb gibt es extra Namen:
- **KB, MB, GB** = in **1.000er**-Schritten (wie beim Metermaß)
- **KiB, MiB, GiB** („Kibi, Mebi, Gibi“) = in **1.024er**-Schritten

**Warum „fehlt“ Platz auf der Festplatte?** Der Hersteller verkauft dir 1 TB in 1.000er-Schritten. Windows rechnet aber in 1.024er-Schritten – und schreibt trotzdem „GB“ dahin. Deshalb siehst du nur ca. 931 „GB“. Es ist wie bei einer Waage, die in einer anderen Einheit misst – **das Gewicht ist dasselbe, nur die Zahl anders**.

**Wie lange dauert ein Download?** Stell dir einen **Wasserschlauch** vor:
- Die **Datei** ist ein Eimer Wasser (wie viel muss durch).
- Die **Leitung** (Mbit/s) sagt, wie viel pro Sekunde durchfließt.
- Zeit = Eimergröße ÷ Durchfluss.

**Aufpassen**: Internetgeschwindigkeit wird in **Bit** pro Sekunde angegeben, Dateien aber in **Byte**. Du musst also erst alles in dieselbe Einheit bringen – meist Byte mal 8 = Bit. Deshalb lädt eine 100-Mbit-Leitung „nur“ etwa 12,5 MB pro Sekunde.

## Merksatz
- **B**yte **B**ig, **b**it **b**ig nicht → B = Byte, b = Bit.
- **Kibi = 1.024**, **Kilo = 1.000**.
- Übertragungsraten sind **immer dezimal** und meist in **Bit/s**.
- Zeit = **Datenmenge ÷ Rate** – vorher beides in **Bit**!
- Mbit/s ÷ 8 = MB/s.

## Prüfungsfalle
- Byte/Bit-Umrechnung (× 8) vergessen.
- MiB (1.048.576) mit MB (1.000.000) vermischt – die Aufgabenhinweise zu Einheiten genau lesen.
- Ergebnis in Sekunden nicht in Minuten/Stunden umgerechnet.
- Kleines k (kilo = 1.000) vs. Ki (kibi = 1.024).

## Grafik
### Einheiten-Waage
Links 1 TB (dezimal), rechts 931 GiB; die Waage bleibt im Gleichgewicht, die Anzeige wechselt zwischen den Beschriftungen.

### Download-Schlauch
Datei als Wassertank, Leitung als Schlauch mit einstellbarer Dicke (Mbit/s); Tank leert sich, Uhr zeigt die berechnete Zeit; Rechenweg läuft Schritt für Schritt mit.

### Präfix-Treppe
Treppenstufen kB → MB → GB → TB neben KiB → MiB → GiB → TiB; die Lücke zwischen beiden Treppen wird mit jeder Stufe größer (2,4 % … 10 %).

## Karteikarten
- F: Wie viele Bit hat ein Byte? | A: 8.
- F: Unterschied MB und MiB? | A: MB = 1.000.000 Byte (dezimal), MiB = 1.048.576 Byte (binär).
- F: Warum zeigt Windows bei einer 1-TB-Platte ca. 931 GB? | A: Hersteller rechnen dezimal, Windows binär (GiB) – beschriftet aber mit „GB“.
- F: Formel Übertragungszeit? | A: t = Datenmenge (Bit) ÷ Übertragungsrate (Bit/s).
- F: 1 Gbit/s in MB/s? | A: 125 MB/s.
- F: Werden Übertragungsraten dezimal oder binär angegeben? | A: Dezimal (1 Mbit/s = 1.000.000 bit/s).
- F: Speicherbedarf eines Bildes? | A: Breite × Höhe × Farbtiefe (Bit) ÷ 8 = Byte.
- F: Wie viel Speicher adressiert ein 32-Bit-Adressbus? | A: 2³² Byte = 4 GiB.

## Quiz
? Wie lange dauert die Übertragung von 500 MB (dezimal) über eine 100-Mbit/s-Leitung theoretisch?
* 40 Sekunden
- 5 Sekunden
- 500 Sekunden
- 4 Sekunden

? Wie viele Byte hat 1 KiB?
* 1.024
- 1.000
- 8.192
- 1.048.576

? Welche Einheit verwendet ein Internetanbieter für die DSL-Geschwindigkeit?
* Mbit/s (dezimal)
- MiB/s
- MB (binär)
- GiB/h

? Eine SSD wird mit 512 GB verkauft. Welche Größe zeigt Windows ungefähr an?
* ca. 476 GB
- ca. 512 GB
- ca. 549 GB
- ca. 500 GB

? Wie viel Byte belegt ein unkomprimiertes Bild mit 800 × 600 Pixeln und 8 Bit Farbtiefe?
* 480.000 Byte
- 3.840.000 Byte
- 60.000 Byte
- 1.440.000 Byte
