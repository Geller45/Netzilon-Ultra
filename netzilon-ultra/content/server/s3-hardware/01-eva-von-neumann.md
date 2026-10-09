---
id: server-hw-eva
bereich: AP1
pruefungen: [AP1, Schule]
fach: ITK / Grundlagen
block: S3
kapitel: Hardware
titel: EVA-Prinzip, Von-Neumann-Rechner und Stellenwertsysteme
stufe: Einsteiger
quellen: [EVA-Prinzip.pdf, 03-Folien-Rechnerarchitektur-zahlensysteme.pdf]
verweise: [ap1-a1-chipsatz, ap1-a1-rechneraufbau, ap1-a1-prozessor, ap1-a3-zahlensysteme, server-hw-rechenaufgaben]
---

## Profi

### EVA-Prinzip
Das **EVA-Prinzip** (*Eingabe – Verarbeitung – Ausgabe*, engl. IPO: *Input – Process – Output*) beschreibt das Grundmuster jeder Datenverarbeitung. Ergänzt wird es oft um **S** für **Speicherung** (EVAS).

| Schritt | Bedeutung | Beispielgeräte | Funktionsweise |
|---|---|---|---|
| **E – Eingabe** (Input) | Daten gelangen **von außen** ins System | Tastatur, Maus, Mikrofon, Scanner, Kamera, Sensoren, Touchscreen | Tastatur sendet Scancodes, Maus Positions-/Klickdaten, Mikrofon wandelt Schall per A/D-Wandler in digitale Werte, Scanner liest ein Bild ein |
| **V – Verarbeitung** (Processing) | Daten werden nach **Programmanweisungen** bearbeitet | **CPU**, GPU, spezielle Prozessoren (NPU, DSP) + **Software** | **Rechnen** (Summen), **Vergleichen** („> 10?“), **Steuern** (Roboter, Spiel) |
| **A – Ausgabe** (Output) | Ergebnisse werden **sichtbar, hörbar oder greifbar** | Bildschirm, LED, Drucker, Lautsprecher, Kopfhörer, Roboterarm, Motor | Lautsprecher wandelt digitale Audiodaten per D/A-Wandler in Töne |
| (S – Speicherung) | Daten/Programme dauerhaft ablegen | RAM (flüchtig), SSD/HDD (nichtflüchtig) | Zwischenergebnisse und Ergebnisse sichern |

**Eingabearten**: **manuell** (Tastatur, Maus, Mikrofon) oder **automatisch/sensorisch** (Scanner, Kamera, Temperatur-/Bewegungssensor). **Ohne Eingabe passiert nichts** – der Computer ist passiv. **Ausgabeformen**: visuell, akustisch, physisch. **Ohne Ausgabe** wüsste der Nutzer nicht, was der Computer getan hat. Manche Geräte sind beides (**Ein-/Ausgabegerät**): Touchscreen, Headset, Multifunktionsdrucker, Netzwerkkarte.

### Von-Neumann-Architektur (Folie Herr Schwab)
Die meisten Rechner basieren auf dem Konzept von **John von Neumann** (1945):
- **Speicher (RAM)**: enthält **Programmcode und Daten gemeinsam**, unterteilt in **Speicheradressen**.
- **Steuerwerk** (Leitwerk, *Control Unit*): steuert den Programmablauf – holt Befehle, decodiert sie, steuert die anderen Einheiten (Befehlszähler, Befehlsregister).
- **Rechenwerk** (**ALU**, *Arithmetic Logic Unit*): verarbeitet die Daten durch **logische und arithmetische Operationen**; Register, Akkumulator, Flags.
- **Steuerwerk + Rechenwerk = CPU.**
- **Ein-/Ausgabewerk** (I/O): Verbindung zur Außenwelt (Peripherie).
- **Bussystem**: Daten-, Adress- und Steuerbus verbinden alle Einheiten.

Befehlszyklus (**Von-Neumann-Zyklus**): **Fetch** (Befehl holen) → **Decode** (decodieren) → **Fetch Operands** (Operanden holen) → **Execute** (ausführen) → **Write Back** (Ergebnis speichern) → Befehlszähler erhöhen.

**Von-Neumann-Flaschenhals**: Befehle und Daten teilen sich **einen Bus** zum Speicher – die CPU wartet oft auf den Speicher. Gegenmittel: **Caches** (L1 getrennt in Befehls- und Datencache = „modifizierte Harvard-Architektur“), Pipelining, Prefetching. **Harvard-Architektur**: getrennte Speicher und Busse für Befehle und Daten (Mikrocontroller, DSPs).

### Stellenwertsysteme (Folie)
- **Ziffer**: Element einer Menge von Symbolen zur Darstellung von Zahlen.
- **Zahl**: Anordnung von Ziffern, die in einem vereinbarten Zahlensystem einen Wert darstellt.
- Jedes System hat eine **Basis B**: dezimal 10, dual 2, oktal 8, hexadezimal 16.
- Jede Stelle hat eine **Wertigkeit** B^i: 1. Stelle links vom Komma B^0, 2. Stelle B^1 …; rechts vom Komma B^-1, B^-2. Der Gesamtwert ist die **Summe** aller Produkte: **Z = Σ aᵢ · Bⁱ** (i von −m bis n).
- Beispiele: 241 = 2·10² + 4·10¹ + 1·10⁰; 68,24 = 6·10¹ + 8·10⁰ + 2·10⁻¹ + 4·10⁻²; 1011₂ = 1·2³ + 0·2² + 1·2¹ + 1·2⁰ = **11**; CE₁₆ = 12·16¹ + 14·16⁰ = **206**.
- **Dezimal → andere Basis**: fortlaufend durch die Basis teilen, **Reste von unten nach oben** (rechts nach links) notieren. 19 → 19:2 = 9 R1, 9:2 = 4 R1, 4:2 = 2 R0, 2:2 = 1 R0, 1:2 = 0 R1 → **10011₂**. 732 → 732:16 = 45 R12 (C), 45:16 = 2 R13 (D), 2:16 = 0 R2 → **2DC₁₆**.

## Einfach

Ein Computer arbeitet wie ein **Koch in einer Küche**:
- **Eingabe**: Jemand bringt die **Zutaten** und sagt, was gekocht werden soll – das sind Tastatur, Maus oder Mikrofon.
- **Verarbeitung**: Der **Koch** (die CPU) schnippelt, rührt und würzt nach **Rezept** (Programm).
- **Ausgabe**: Das fertige **Essen** kommt auf den Teller – das ist der Bildschirm, der Drucker oder der Lautsprecher.
- **Speicher**: Der **Kühlschrank** (Festplatte) bewahrt Zutaten lange auf, die **Arbeitsfläche** (RAM) nur, solange gekocht wird.

**Merksatz der Schule:** „Eingabe liefert die Daten, Verarbeitung denkt drüber nach, Ausgabe zeigt das Ergebnis.“

**Von Neumann** hatte die Idee, dass **Rezept und Zutaten im selben Kühlschrank** liegen (Programm und Daten im selben Speicher). Im Koch stecken zwei Teile: der **Chef** (Steuerwerk), der sagt „jetzt Schritt 3 vom Rezept“, und die **Hände** (Rechenwerk), die wirklich schneiden und mischen. Weil aber alles durch **eine einzige Küchentür** muss, steht der Koch manchmal herum und wartet – das ist der **Von-Neumann-Flaschenhals**. Deshalb gibt es kleine **Ablagen direkt neben dem Herd** (Caches).

**Zahlensysteme** sind verschiedene Arten zu zählen: Wir zählen mit **10 Fingern** (dezimal), der Computer nur mit **„an/aus“** (dual, 2 Zustände). Jede Stelle ist mehr wert als die rechts daneben – im Dezimalsystem zehnmal, im Dualsystem doppelt so viel.

## Merksatz
- **E-V-A(-S)**: rein, rechnen, raus (und speichern).
- **Steuerwerk + Rechenwerk = CPU.**
- Von Neumann: **ein Speicher für Programm und Daten**, ein Bus → **Flaschenhals**.
- Zyklus: **Fetch – Decode – Execute** (– Write Back).
- Umrechnen: **teilen, Rest notieren, von unten lesen**.

## Prüfungsfalle
- Ein **Touchscreen** ist **Ein- und Ausgabegerät**, eine Festplatte ist **Speicher**, nicht Eingabe.
- Die **GPU** gehört zur **Verarbeitung**, nicht zur Ausgabe – der Monitor ist die Ausgabe.
- Harvard ≠ Von Neumann: Harvard hat **getrennte** Befehls- und Datenspeicher.
- Beim Umrechnen die **Reste von unten nach oben** lesen (sonst kommt die Zahl gespiegelt heraus).

## Grafik
### EVA am Beispiel Tastendruck
1. Tastatur -> CPU: Scancode der Taste „A“
2. CPU: Textverarbeitung ordnet Zeichen „A“ zu
3. CPU -> RAM: Zeichen im Dokument speichern
4. CPU -> Grafikkarte: Bild neu berechnen
5. Grafikkarte -> Monitor: „A“ erscheint
### Von-Neumann-Befehlszyklus
1. Steuerwerk -> RAM: Befehl an Adresse aus Befehlszähler holen
2. Steuerwerk: Befehl decodieren
3. RAM -> Rechenwerk: Operanden laden
4. Rechenwerk: Operation ausführen
5. Rechenwerk -> RAM: Ergebnis zurückschreiben
6. Steuerwerk: Befehlszähler erhöhen

## Übungen
- A: Ordnen Sie zu: Scanner, Drucker, CPU, Touchscreen, SSD | L: Scanner = Eingabe, Drucker = Ausgabe, CPU = Verarbeitung, Touchscreen = Ein-/Ausgabe, SSD = Speicherung
- A: Nennen Sie die Komponenten der Von-Neumann-Architektur. | L: Speicher (Programm + Daten), Steuerwerk, Rechenwerk (zusammen CPU), Ein-/Ausgabewerk, Bussystem
- A: Erklären Sie den Von-Neumann-Flaschenhals. | L: Befehle und Daten müssen über denselben Bus aus demselben Speicher geholt werden; die schnelle CPU wartet auf den langsameren Speicher. Gegenmittel: Caches, Pipelining.
- A: Rechnen Sie 19 dezimal in dual um. | L: 19:2=9 R1, 9:2=4 R1, 4:2=2 R0, 2:2=1 R0, 1:2=0 R1 → 10011
- A: Rechnen Sie 732 dezimal in hexadezimal um. | L: 732:16=45 R12(C), 45:16=2 R13(D), 2:16=0 R2 → 2DC
- A: Welchen Dezimalwert hat CE₁₆? | L: 12·16 + 14 = 206
- A: Zerlegen Sie 68,24 nach Stellenwerten. | L: 6·10¹ + 8·10⁰ + 2·10⁻¹ + 4·10⁻²

## Karteikarten
- F: Wofür steht EVA? | A: Eingabe – Verarbeitung – Ausgabe (oft + Speicherung)
- F: Nenne drei Eingabegeräte. | A: Tastatur, Maus, Mikrofon (auch Scanner, Kamera, Sensoren)
- F: Drei Aufgaben der Verarbeitung? | A: Rechnen, Vergleichen, Steuern
- F: Drei Formen der Ausgabe? | A: Visuell, akustisch, physisch
- F: Was bilden Steuerwerk und Rechenwerk zusammen? | A: Die CPU
- F: Was liegt bei Von Neumann im gemeinsamen Speicher? | A: Programmcode und Daten
- F: Was ist die ALU? | A: Arithmetic Logic Unit – das Rechenwerk für arithmetische und logische Operationen
- F: Was ist die Harvard-Architektur? | A: Getrennte Speicher und Busse für Befehle und Daten
- F: Formel für den Wert einer Zahl im Stellenwertsystem? | A: Summe aller Ziffern mal Basis hoch Stelle (Σ aᵢ·Bⁱ)
- F: Wie rechnet man dezimal in eine andere Basis um? | A: Fortlaufend durch die Basis teilen, Reste von unten nach oben lesen

## Quiz
? Welches Gerät ist ein reines Ausgabegerät?
* Lautsprecher
- Mikrofon
- Touchscreen
- Scanner

? Was gehört zur Verarbeitung im EVA-Prinzip?
* Die CPU führt Berechnungen nach Programmanweisungen aus
- Der Monitor zeigt ein Bild
- Die Maus überträgt Klicks
- Der Drucker gibt Papier aus

? Welche zwei Einheiten bilden nach Von Neumann die CPU?
* Steuerwerk und Rechenwerk
- Speicher und Bus
- Ein- und Ausgabewerk
- Cache und RAM

? Was beschreibt den Von-Neumann-Flaschenhals?
* Programm und Daten teilen sich einen Bus zum Speicher
- Die CPU ist langsamer als die Festplatte
- Es gibt keinen Cache
- Die Grafikkarte blockiert die CPU

? 19 dezimal ergibt dual:
* 10011
- 11001
- 10101
- 10010

? 732 dezimal ergibt hexadezimal:
* 2DC
- CD2
- 2CD
- 1DC

? Welches Gerät ist Ein- UND Ausgabegerät?
* Touchscreen
- Tastatur
- Beamer
- Webcam

? Welche Wertigkeit hat die erste Stelle rechts vom Komma im Dezimalsystem?
* 10⁻¹
- 10⁰
- 10¹
- 10⁻²

## Zuordnen
### Gerät und EVA-Kategorie
- Tastatur => Eingabe
- CPU => Verarbeitung
- Drucker => Ausgabe
- SSD => Speicherung
- Headset => Ein- und Ausgabe

## Reihenfolge
### Von-Neumann-Befehlszyklus
1. Befehl aus dem Speicher holen (Fetch)
2. Befehl decodieren (Decode)
3. Operanden holen
4. Befehl ausführen (Execute)
5. Ergebnis zurückschreiben (Write Back)

## Spickzettel
- EVA(S): Eingabe, Verarbeitung, Ausgabe, Speicherung
- CPU = Steuerwerk + Rechenwerk (ALU)
- Von Neumann: gemeinsamer Speicher + Bus → Flaschenhals, Cache hilft
- Zyklus Fetch – Decode – Execute – Write Back
- Wert = Σ Ziffer · Basis^Stelle; Umrechnen: teilen, Reste von unten
