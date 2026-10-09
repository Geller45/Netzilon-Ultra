---
id: netz-ascii-code
bereich: AP1
block: Netzwerk
kapitel: Kodierung
titel: ASCII-Code – 7-Bit-Zeichencode, Steuerzeichen, Latin-1 und Unicode
stufe: Einsteiger
fach: ITK / Grundlagen
pruefungen: [AP1, Schule]
quellen: [ASCII-Code.pdf]
verweise: [ap1-a3-zahlensysteme, ccna-ssh-ftp-tftp]
---

## Profi

### Grundlagen
**ASCII** (American Standard Code for Information Interchange) wurde **1963** als ANSI-Standard in den USA festgelegt. Ziel: **einheitliche Darstellung von Zeichen** in Computern und Kommunikation. Jedes Zeichen bekommt eine eindeutige Zahl; der Computer speichert Zahlen, die Darstellung als Zeichen übernimmt die Software (Beispiel: 65 = `A`).

### Aufbau
- **7 Bit pro Zeichen** → 2⁷ = **128 Zeichen** (Code 0–127). Ursprünglich aus Hardwaregründen: Das 8. Bit diente oft als **Paritätsbit** zur Fehlerprüfung.
- **0–31: Steuerzeichen** (nicht druckbar), z. B. 9 = TAB, 10 = LF (Line Feed, Zeilenumbruch), 13 = CR (Carriage Return, Wagenrücklauf), 27 = ESC.
- **32–126: druckbare Zeichen:** 32 = Leerzeichen, **48–57** = Ziffern 0–9, **65–90** = A–Z, **97–122** = a–z, dazwischen Satz- und Sonderzeichen.
- **127: DEL** (Löschen; historisch Lochstreifen/Terminals).

### Wichtige Werte
| Zeichen | Dezimal | Hex | Binär (7 Bit) |
|---|---|---|---|
| `0` | 48 | 0x30 | 0110000 |
| `9` | 57 | 0x39 | 0111001 |
| `A` | 65 | 0x41 | 1000001 |
| `Z` | 90 | 0x5A | 1011010 |
| `a` | 97 | 0x61 | 1100001 |
| `z` | 122 | 0x7A | 1111010 |
Merkregel: Kleinbuchstabe = Großbuchstabe + 32 (Bit 5 gesetzt). Ziffernzeichen: Wert = Ziffer + 48.

### Erweiterungen und Bedeutung heute
- ASCII kennt nur **englische Zeichen** (keine Umlaute). **ISO-8859-1 (Latin-1)** nutzt das 8. Bit und ergänzt ä, ö, ü, ß und westeuropäische Zeichen (**Extended ASCII**, 256 Zeichen).
- **Unicode** (z. B. UTF-8) enthält ASCII **1:1** in den ersten 128 Codes; UTF-8 ist rückwärtskompatibel (ein Byte für ASCII, Mehrbyte für andere Zeichen).
- Textprotokolle und Dateiformate (HTTP, SMTP, Konfigurationsdateien) basieren auf ASCII bzw. kompatiblen Codierungen. Zeilenende: Windows **CR LF**, Linux **LF**.

## Einfach

Ein Computer kann nur mit **Zahlen** rechnen, nicht mit Buchstaben. Deshalb haben Menschen eine **Geheimtabelle** erfunden: Jeder Buchstabe bekommt eine Nummer. Das große **A** ist die **65**, das **B** die 66, und so weiter. Das kleine **a** ist die **97**. Wenn du auf der Tastatur „A“ tippst, speichert der Computer eigentlich die Zahl 65.

Die Tabelle heißt **ASCII**. Sie hat **128 Plätze** (0 bis 127), weil sie 7 Bit nutzt. Die ersten 32 Plätze (0–31) sind **Befehle**, die man nicht sieht, zum Beispiel „neue Zeile“ oder „Tab“. Ab Platz 32 kommen die sichtbaren Zeichen: das Leerzeichen, die Ziffern (48 bis 57), die großen Buchstaben (65 bis 90) und die kleinen (97 bis 122). Platz 127 ist „Löschen“.

Das Problem: In der Tabelle gibt es kein „ä“ oder „ß“. Deshalb wurde sie später erweitert (**Latin-1**), und heute nutzt man **Unicode**, in dem fast alle Schriftzeichen der Welt Platz haben. Die ersten 128 Plätze sind dort genau wie bei ASCII – alles bleibt kompatibel.

Ein Rätsel zum Üben: Das Wort „Hi“ besteht aus H (72) und i (105). Der Computer speichert also die Zahlen 72 und 105, in Bits 01001000 und 01101001. Beim Anzeigen schaut er in der Tabelle nach und malt wieder die Buchstaben. Schickst du den Text per E-Mail oder Webseite, wandern genau diese Zahlen durchs Netz – darum müssen Sender und Empfänger dieselbe Tabelle benutzen, sonst erscheinen kaputte Zeichen wie „Ã¤“ statt „ä“.

## Merksatz
- **ASCII = 7 Bit = 128 Zeichen: 0–31 Steuerzeichen, 32–126 druckbar, 127 DEL.**
- **A = 65, a = 97, 0 = 48, Leerzeichen = 32.**
- **Klein = Groß + 32.**
- **Unicode enthält ASCII 1:1 in den ersten 128 Codes.**

## Prüfungsfalle
- Das **Zeichen „0“ hat den Code 48**, nicht 0 (Code 0 = NUL).
- ASCII hat **128**, nicht 256 Zeichen – 256 gilt erst für **Extended ASCII/Latin-1** (8 Bit).
- 127 (DEL) ist ein Steuerzeichen, obwohl es hinter den druckbaren liegt.
- Zeilenumbruch: **LF = 10**, **CR = 13**; Windows nutzt beide (CR LF), Linux nur LF.
- Die Unterlage sagt, ASCII sei „nur für englische Sprache“ geeignet. Korrekt: nur für Zeichen **ohne Umlaute und Sonderzeichen**; das gilt auch für viele andere Sprachen.
- ASCII ≠ Unicode; **UTF-8 ist eine Codierung von Unicode** und zu ASCII kompatibel.

## Grafik
### Vom Tastendruck zum Bit-Muster
1. Tastatur: Taste „A“ gedrückt
2. Tastatur -> Computer: Scancode der Taste
3. Computer: Zeichen A → ASCII-Code 65
4. Computer: 65 dezimal = 0x41 = 1000001 binär
5. Computer -> Speicher: Speichert das Byte 01000001
6. Speicher -> Bildschirm: Schriftart zeichnet wieder ein „A“

### ASCII-Bereiche
1. Text: 0–31 Steuerzeichen (LF 10, CR 13, ESC 27)
2. Text: 32 Leerzeichen, 48–57 Ziffern
3. Text: 65–90 Großbuchstaben, 97–122 Kleinbuchstaben
4. Text: 127 DEL

## Lab
### Cisco IOS
Gerät: **R1**. Das **Banner** wird durch ein Begrenzungszeichen (Delimiter) umschlossen; das Zeichen darf im Text nicht vorkommen. Passwörter, Namen und Banner sind ASCII-Text.
```
R1> enable
R1# configure terminal
R1(config)# banner motd #
Enter TEXT message.  End with the character '#'.
Nur fuer autorisierte Benutzer!
#
R1(config)# hostname R1
R1(config)# end
R1# show running-config | include banner
R1# terminal length 0
```
Hinweis: Umlaute (ä, ö, ü, ß) können im Banner oder Hostnamen zu Darstellungsfehlern führen, weil die CLI nur ASCII sicher verarbeitet – deshalb im Beispiel „fuer“ statt „für“. Namen nach RFC 1123: Buchstaben, Ziffern, Bindestrich.
### Linux (Kontrolle)
```
printf 'A' | xxd
printf '%d\n' "'A"
```
Ausgabe: `41` (hex) bzw. `65` (dezimal).

## Befehle
- `banner motd <delim>` – Begrüßungstext mit Begrenzungszeichen
- `show running-config | include banner` – Banner prüfen
- `printf 'A' \| xxd` (Linux) – Hexwert eines Zeichens
- `Get-Content datei.txt -Encoding ASCII` (PowerShell) – Datei als ASCII lesen

## Übungen
- A: Wie viele Zeichen kann ASCII darstellen und wie viele Bit werden dafür benötigt? | L: 128 Zeichen, 7 Bit.
- A: Welcher Dezimalcode hat „A“, „a“, „0“? | L: 65, 97, 48.
- A: Wandle „B“ in Binär um. | L: B = 66 = 1000010.
- A: Welche Zeichen belegen 0–31? | L: Steuerzeichen (nicht druckbar), z. B. TAB 9, LF 10, CR 13, ESC 27.
- A: Nenne den Unterschied zwischen ASCII und Latin-1. | L: ASCII 7 Bit/128 Zeichen ohne Umlaute; Latin-1 8 Bit/256 Zeichen mit ä, ö, ü, ß.
- A: Wie groß ist der Abstand zwischen Groß- und Kleinbuchstabe? | L: 32 (z. B. A 65, a 97).
- A: Welche Codes benutzen Windows und Linux für den Zeilenumbruch? | L: Windows CR LF (13 10), Linux LF (10).

## Karteikarten
- F: Wofür steht ASCII? | A: American Standard Code for Information Interchange.
- F: Wann wurde ASCII standardisiert? | A: 1963 (ANSI, USA).
- F: Bitbreite von ASCII? | A: 7 Bit = 128 Zeichen (0–127).
- F: Bereich der Steuerzeichen? | A: 0–31.
- F: Bereich der druckbaren Zeichen? | A: 32–126.
- F: Welches Zeichen hat Code 127? | A: DEL (Löschen).
- F: Code der Ziffern 0–9? | A: 48–57.
- F: Code der Großbuchstaben A–Z? | A: 65–90.
- F: Code der Kleinbuchstaben a–z? | A: 97–122.
- F: Code von LF und CR? | A: LF = 10, CR = 13.
- F: Warum 7 statt 8 Bit? | A: Hardwaregründe; das 8. Bit diente oft als Paritätsbit.
- F: Welche Erweiterung fügt ä, ö, ü, ß hinzu? | A: ISO-8859-1 (Latin-1, Extended ASCII).
- F: Wie verhält sich Unicode zu ASCII? | A: Die ersten 128 Codes sind identisch.

## Quiz
? Wie viele Zeichen kann 7-Bit-ASCII darstellen?
* 128
- 64
- 256
- 512
? Welcher ASCII-Code gehört zum Großbuchstaben „A“?
* 65
- 41
- 97
- 48
? Welcher Bereich enthält die druckbaren Zeichen?
* 32–126
- 0–31
- 0–127 ohne 127
- 128–255
? Welchen Code hat das Zeichen „0“?
* 48
- 0
- 30
- 64
? Welches Zeichen hat den Code 127?
* DEL
- ESC
- NUL
- CR
? Welcher Code steht für den Zeilenumbruch „Line Feed“?
* 10
- 13
- 9
- 27
? Was ergänzt ISO-8859-1 gegenüber ASCII?
* Umlaute und weitere westeuropäische Zeichen
- Chinesische Zeichen
- Emojis
- Steuerzeichen
? Wie steht Unicode zu ASCII?
* Die ersten 128 Codes stimmen überein
- Unicode ist völlig inkompatibel
- Unicode ersetzt ASCII nur in Windows
- ASCII erweitert Unicode
? Wie unterscheiden sich Groß- und Kleinbuchstaben im ASCII-Code?
* Um 32
- Um 16
- Um 64
- Um 1
? Wozu diente das 8. Bit ursprünglich oft?
* Paritätsbit zur Fehlerprüfung
- Verschlüsselung
- Kompression
- Farbinformation
@ ASCII-Code.pdf
