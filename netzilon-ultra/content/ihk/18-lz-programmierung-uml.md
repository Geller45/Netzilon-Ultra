---
id: ihk-lz-programmierung-uml
bereich: Prüfung
block: IHK
kapitel: Lernzettel-Inhalte
titel: Arrays, Pseudocode, Schreibtischtest und UML-Diagramme
stufe: Fortgeschritten
fach: PV – AP1
pruefungen: [AP1, AP2]
quellen: [Array & Pseudocode.docx, Array & Pseudocode.pdf, UML & Dokumentation.docx, UML & Dokumentation.pdf, Projektmanagement ++.docx, 88295bfb-Aufgaben_-_USE_CASE.pdf, b3adcc75-01_UML-Diagramme_-_USE_CASE.pdf, AP1_Lernplan_1.pdf, Ergänzung Lernzettel.docx, d74a0e17-BPM_2.0.pdf, 252d9c4e-bpmn-2-0-poster.pdf]
verweise: [ihk-fehleranalyse, ihk-lz-datenbank-sql, ihk-lernzettel-guide, bonus-csharp-kompakt]
---

## Profi

### Arrays
Feste Anzahl gleichartiger Werte unter einem Namen; **Index ab 0** (24 Felder → 0 … 23). Deklaration z. B. `int[] werte = new int[24];`, Länge `werte.Length`. Typ- und Wertebereich beachten (byte 0–255, int ±2,1 Mrd.; kleinere Typen sparen Speicher).

### Pseudocode (Syntax-Beilage)
`for`, `while` (kopfgesteuert), `do … while` (fußgesteuert, mindestens ein Durchlauf), `if … else`, Operatoren `&&` (UND), `||` (ODER), `!`, **Ganzzahldivision** `/` und **Modulo** `%` (Rest; z. B. Stellen aus IDs extrahieren: `id % 10` = letzte Ziffer, `id / 10`).

### Klassiker
```
// Maximum
int max = werte[0];
for (int i = 1; i < werte.Length; i++)
    if (werte[i] > max) max = werte[i];

// Mittelwert
int summe = 0;
for (int i = 0; i < werte.Length; i++) summe += werte[i];
double mittel = (double) summe / werte.Length;

// Schwellenwert zählen (> 80 % CPU)
int anzahl = 0;
for (...) if (cpu[i] > 80) anzahl++;

// Bubblesort
for (int a = 0; a < n - 1; a++)
  for (int b = 0; b < n - 1 - a; b++)
    if (feld[b] > feld[b+1]) { temp = feld[b]; feld[b] = feld[b+1]; feld[b+1] = temp; }
```
Glättung: Mittel aus Dreiergruppen in ein neues Array. **Fehlerarten**: Syntax-, Semantik-, Laufzeitfehler (`IndexOutOfRange`, Division durch 0). **Schreibtischtest** mit **Trace-Tabelle**. **Testverfahren**: White-/Black-Box. **OOP**: Datenkapselung (Zugriff nur über Methoden), Vererbung (im AP1-Katalog 2025 gestrichen; Klassen, Attribute, Objekte, Methoden, Sichtbarkeit `+ − #` bleiben). **Pseudocode** ist sprachunabhängig und konzentriert sich auf die Logik.

### Dokumentation und UML
- **Statische Sicht** (Struktur): **Klassendiagramm**. **Dynamische Sicht** (Verhalten): **Aktivitäts-**, **Sequenz-**, Zustandsdiagramm; Use-Case für Anforderungen.
- **Aktivitätsdiagramm**: Startknoten (ausgefüllter Kreis), Aktion (abgerundetes Rechteck), Entscheidung (Raute mit `[Bedingung]`), Teilung/Synchronisation (dicker Balken, parallel), Ablaufende (Kreis mit X), Endknoten (Kreis mit Punkt), Swimlanes (Verantwortliche). Vollständigkeit: alle Bedingungen beschriftet, jeder Pfad endet.
- **Klassendiagramm**: Klassenname | Attribute | Methoden; Sichtbarkeit `+` public, `−` private, `#` protected; Kardinalitäten (1, 0..1, 1..*, *); **Aggregation** (leere Raute, Teil existiert unabhängig, z. B. Abteilung–Mitarbeiter), **Komposition** (gefüllte Raute, Teil existenzabhängig, z. B. Gebäude–Raum), Vererbung (Pfeil mit leerem Dreieck).
- **Use-Case**: Akteur, Systemgrenze, Anwendungsfall, `<<include>>` (Pflicht), `<<extend>>` (optional).
- **Sequenzdiagramm**: Lebenslinien vertikal, Nachrichten horizontal (z. B. TLS-Handshake: Zertifikat, AES-Sitzungsschlüssel); Fragmente `alt`, `opt`, `loop`.
- **BPMN**: Start-/Zwischen-/Endereignis, Task, Gateway (XOR, AND, OR), Pools/Lanes; **EPK**: Ereignis – Funktion – Konnektoren.
- **ER-Modell (Chen)** siehe `ihk-lz-datenbank-sql`.

## Einfach

**Array = Eierkarton.** Es hat feste Fächer, jedes mit einer Nummer. Wichtig: Die erste Nummer ist **0**. Bei 12 Eiern gehen die Fächer von 0 bis 11. Wer Fach 12 aufmacht, bekommt einen Fehler (IndexOutOfRange).

**Schleife = Karton durchgehen.** `for (i = 0; i < Länge; i++)` heißt: Start bei Fach 0, mach weiter, solange i kleiner als die Länge ist. Mit `<=` würdest du ein Fach zu viel ansehen.

**Das Maximum finden:** Du merkst dir die größte Zahl bisher. Bei jedem Fach vergleichst du: „Ist die hier größer? Dann merke ich mir die neue.“ **Mittelwert:** Alles zusammenzählen, durch die Anzahl teilen. **Zählen:** Bei jeder Überschreitung eine Strichliste führen.

**Bubblesort:** Wie Kinder, die sich der Größe nach aufstellen. Immer zwei Nebeneinanderstehende vergleichen und tauschen, falls falsch herum. Beim Tauschen braucht man einen freien Platz (`temp`), sonst überschreibst du dein Wissen.

**Modulo (`%`):** Rest beim Teilen. 17 % 5 = 2, denn 17 = 3 × 5 + 2. Praktisch: `id % 10` ist die letzte Ziffer.

**Schreibtischtest:** Du bist der Computer. Auf Papier hast du eine Tabelle mit allen Variablen und schreibst nach jedem Schritt die neuen Werte ein.

**Diagramme:**
- **Aktivitätsdiagramm** = Flussdiagramm: Start, Kästchen für Schritte, Raute für Ja/Nein, Ende.
- **Klassendiagramm** = Bauplan: Welche „Dinge“ gibt es und wie hängen sie zusammen?
- **Aggregation** (leere Raute): Die Mannschaft hat Spieler. Löst sich die Mannschaft auf, gibt es die Spieler noch.
- **Komposition** (gefüllte Raute): Das Haus hat Zimmer. Wird das Haus abgerissen, sind die Zimmer weg.
- **Sequenzdiagramm** = Gespräch: Wer sagt wann was zu wem?

## Merksatz
- Index ab 0, Schleife `i < Länge`.
- Max: erstes Element als Start, vergleichen.
- Leere Raute = Aggregation, gefüllte = Komposition.
- Statisch = Klassen, dynamisch = Aktivität/Sequenz.
- Semantikfehler = läuft, aber falsch.

## Prüfungsfalle
- Start des Maximums bei 0 kann bei negativen Werten falsch sein; sicherer: `max = werte[0]`.
- Ganzzahldivision: `7 / 2 = 3` bei Integer.
- Summe/Länge mit Cast auf `double`, sonst fehlen Nachkommastellen.
- Bubblesort: innere Schleife läuft bis `n−1−a`.
- Entscheidungsraute: beide Ausgänge beschriften.
- Aggregation/Komposition nicht vertauschen.

## Grafik
### Maximumsuche im Array
1. Programm: max = werte[0] = 12
2. Programm: i = 1, werte[1] = 7, nicht größer
3. Programm: i = 2, werte[2] = 25, größer, max = 25
4. Programm: i = 3, werte[3] = 9, nicht größer
5. Programm: Schleife endet bei i = Länge, Ergebnis max = 25

## Spickzettel
- Index ab 0; `i < Length`
- `/` Ganzzahl, `%` Rest
- Max, Mittelwert, Zähler, Bubblesort
- Syntax / Semantik / Laufzeit
- Aggregation leere Raute, Komposition gefüllte
- Aktivität: Start, Aktion, Raute, Balken, Ende

## Übungen
- A: Array [3, 9, 4, 12, 7]. Trace-Tabelle für Maximum (max = 0 Start). | L: i0: 3 → max 3; i1: 9 → max 9; i2: 4 → 9; i3: 12 → max 12; i4: 7 → 12; Ergebnis 12
- A: Was ergibt 47 % 10 und 47 / 10 bei Ganzzahlen? | L: 7 (Rest) und 4 (Ganzzahl)
- A: Welcher Fehler liegt vor: for (i = 0; i <= arr.Length; i++)? | L: IndexOutOfRangeException, richtig i < arr.Length

## Karteikarten
- F: Index des ersten Array-Elements? | A: 0
- F: Wie viele Durchläufe bei for (i=0; i<n; i++)? | A: n
- F: Unterschied while und do-while? | A: while kopfgesteuert, do-while fußgesteuert (mind. 1 Durchlauf)
- F: Modulo-Operator? | A: % liefert den Rest der Division
- F: Schleifenfehler IndexOutOfRange? | A: i <= Länge statt i < Länge
- F: Syntax- vs. Semantikfehler? | A: Formfehler vs. Logikfehler
- F: White-Box vs. Black-Box? | A: Code bekannt vs. nur Ein-/Ausgabe
- F: Aggregation vs. Komposition? | A: Leere Raute (Teil unabhängig) vs. gefüllte Raute (Teil abhängig)
- F: Symbol Entscheidung im Aktivitätsdiagramm? | A: Raute mit Bedingungen in eckigen Klammern
- F: Wofür der dicke Balken? | A: Parallele Abläufe starten oder synchronisieren
- F: include vs. extend? | A: Pflicht vs. optionale Erweiterung
- F: Wofür Sequenzdiagramm? | A: Zeitlicher Ablauf von Nachrichten zwischen Objekten

## Quiz
? Welchen Index hat das erste Element eines Arrays?
* 0
- 1
- -1
- Länge

? Welche Bedingung durchläuft ein Array korrekt?
* i < arr.Length
- i <= arr.Length
- i > arr.Length
- i != 0

? Was ergibt 17 % 5?
* 2
- 3
- 3,4
- 0

? Was zeigt eine gefüllte Raute im Klassendiagramm?
* Komposition
- Aggregation
- Vererbung
- Assoziation

? Welche Diagrammart beschreibt den zeitlichen Ablauf von Nachrichten?
* Sequenzdiagramm
- Klassendiagramm
- Use-Case-Diagramm
- ER-Diagramm

? Was ist ein Semantikfehler?
* Das Programm läuft, liefert aber ein falsches Ergebnis
- Fehlende Klammer
- Fehlende Datei
- Speicherüberlauf

? Welche Schleife wird mindestens einmal durchlaufen?
* do-while
- while
- for mit falscher Bedingung
- Keine

? Wozu dient eine Trace-Tabelle?
* Variablenwerte schrittweise verfolgen
- Datenbank modellieren
- Netzwerk planen
- Passwörter speichern

? Wofür steht <<extend>> im Use-Case-Diagramm?
* Optionale Erweiterung eines Anwendungsfalls
- Pflichtbestandteil
- Vererbung
- Akteur

? Welches Symbol hat das Ende eines gesamten Ablaufs im Aktivitätsdiagramm?
* Kreis mit Punkt (Endknoten)
- Raute
- Dicker Balken
- Rechteck
