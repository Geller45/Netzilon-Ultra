---
id: ihk-netzplan
bereich: AP1
block: IHK
kapitel: Projektmanagement
titel: Netzplan, Gantt-Diagramm und kritischer Pfad
stufe: Fortgeschritten
fach: PV – AP1
pruefungen: [AP1, AP2]
quellen: [AP1_Lernplan_1.pdf, 3fd94b97-AP1_Lernplan__1_.md, Projektmanagement ++.docx, AP2_Masterplan_FiSi_1.0.md, Lernzettel_AP1AP2_2024.pdf, Abschlussprüfung_Lernzettel.pdf]
verweise: [wiso-projektwirtschaft, ihk-nutzwertanalyse, ihk-pruefungsaufbau]
---

## Profi

### Begriffe
- **Vorgang** (Arbeitspaket) mit **Dauer D**, **Vorgänger/Nachfolger**.
- **FAZ** frühester Anfangszeitpunkt, **FEZ** frühester Endzeitpunkt, **SAZ** spätester Anfangszeitpunkt, **SEZ** spätester Endzeitpunkt.
- **GP** Gesamtpuffer, **FP** freier Puffer.
- **Kritischer Pfad**: Weg mit GP = 0 (längster Weg durch den Netzplan) = **Projektdauer**. Verzögerung dort verschiebt das Projektende.

### Vorgehen (Vorwärts- und Rückwärtsrechnung)
**Vorwärts (Vorwärtsterminierung)**: FAZ des ersten Vorgangs = 0 (oder 1, je Aufgabe). **FEZ = FAZ + D**. FAZ eines Nachfolgers = **höchster** FEZ aller Vorgänger.
**Rückwärts**: SEZ des letzten Vorgangs = FEZ (Projektende). **SAZ = SEZ − D**. SEZ eines Vorgängers = **kleinster** SAZ aller Nachfolger.
**GP = SAZ − FAZ = SEZ − FEZ.** **FP = FAZ(Nachfolger) − FEZ(Vorgang)** (kleinster Nachfolger).

### Beispiel
| Vorgang | Dauer | Vorgänger |
|---|---|---|
| A Planung | 2 | – |
| B Hardware bestellen | 3 | A |
| C Software installieren | 4 | A |
| D Test | 2 | B, C |
Vorwärts: A 0–2; B 2–5; C 2–6; D FAZ = max(5, 6) = 6, FEZ 8. Projektdauer **8**.
Rückwärts: D SEZ 8, SAZ 6; B SEZ 6, SAZ 3; C SEZ 6, SAZ 2; A SEZ = min(3, 2) = 2, SAZ 0.
GP: A 0, B 3−2 = **1**, C 0, D 0. **Kritischer Pfad: A → C → D.**

### Gantt-Diagramm
Balkendiagramm: Zeitachse horizontal, Vorgänge vertikal, Balkenlänge = Dauer, Abhängigkeiten per Pfeil, Meilensteine als Raute. Vorteil: anschaulich, Überblick; Nachteil: Abhängigkeiten weniger klar als im Netzplan. Netzplan: logische Abhängigkeiten, kritischer Pfad, Puffer.

### Weitere Begriffe
Meilenstein (Dauer 0), Vorgangsknoten-Netzplan (CPM/MPM), Pufferzeiten, Ressourcenplanung, Crashing (Dauer verkürzen am kritischen Pfad), Parallelisierung, Projektstrukturplan (PSP/WBS).

## Einfach

Ein Netzplan ist wie ein **Plan für einen Kuchenbacktag mit mehreren Helfern**: Manche Aufgaben können gleichzeitig laufen (Teig rühren und Ofen vorheizen), andere müssen warten (backen erst, wenn der Teig fertig ist).

Jede Aufgabe ist ein Kästchen mit einer **Dauer**. Pfeile zeigen, was zuerst fertig sein muss.

**Vorwärts rechnen:** Wann kann ich frühestens anfangen und frühestens fertig sein? Beispiel: A dauert 2 Tage, startet bei 0, ist bei 2 fertig. Folgt etwas, das auf zwei Dinge wartet (B bis 5, C bis 6), dann fängt es bei **6** an, denn es muss auf den Langsameren warten.

**Rückwärts rechnen:** Wann muss ich spätestens anfangen, damit das Ende nicht verschoben wird? Du startest hinten (Projektende) und rechnest zurück. Bei mehreren Nachfolgern nimmst du den **kleinsten** Wert.

**Puffer:** Wie viel darf eine Aufgabe zu spät fertig werden, ohne dass das Projekt später endet? B kann einen Tag trödeln, C nicht. Wo der Puffer **null** ist, geht es nicht ohne Verzögerung: Das ist der **kritische Pfad**. Er ist wie der längste Weg durch ein Labyrinth: Er bestimmt, wie lange du insgesamt brauchst.

**Merke:** Vorwärts: Maximum der Vorgänger. Rückwärts: Minimum der Nachfolger. Puffer = spätester minus frühester Start.

**Gantt-Diagramm:** Wie ein Stundenplan mit Balken. Jede Aufgabe hat einen Balken so lang wie ihre Dauer. Man sieht auf einen Blick, was wann läuft.

## Merksatz
- Vorwärts: FEZ = FAZ + D, Nachfolger-FAZ = MAX der FEZ.
- Rückwärts: SAZ = SEZ − D, Vorgänger-SEZ = MIN der SAZ.
- GP = SAZ − FAZ; GP = 0 ist kritisch.
- Kritischer Pfad = längster Pfad = Projektdauer.

## Prüfungsfalle
- Vorwärts **Maximum**, rückwärts **Minimum**. Genau umgekehrt ist der häufigste Fehler.
- Start bei 0 oder 1: Aufgabentext beachten (Konvention der Prüfung).
- Der kritische Pfad kann mehrfach auftreten (mehrere Pfade mit GP = 0).
- Verkürzung eines nicht-kritischen Vorgangs verkürzt das Projekt NICHT.
- Gantt zeigt Abhängigkeiten weniger gut als Netzplan.
- Meilensteine haben Dauer 0.

## Grafik
### Netzplan-Beispiel A -> B/C -> D
1. A: Planung, Dauer 2, FAZ 0, FEZ 2
2. A -> B: Hardware bestellen, Dauer 3, FEZ 5
3. A -> C: Software installieren, Dauer 4, FEZ 6
4. B -> D: Test wartet auf B (5)
5. C -> D: Test wartet auf C (6), FAZ = 6
6. D: Test, Dauer 2, FEZ 8 = Projektende
7. C: Kritischer Pfad A, C, D mit GP = 0

## Übungen
- A: Vorgänge: A (3 Tage, kein Vorgänger), B (2, A), C (5, A), D (1, B und C). Projektdauer und kritischer Pfad? | L: B 3–5; C 3–8; D FAZ = max(5, 8) = 8 → FEZ 9. Projektdauer 9, kritischer Pfad A–C–D; B hat 3 Tage Puffer
- A: Vorgang X: FAZ 4, SAZ 7. Gesamtpuffer? | L: GP = SAZ − FAZ = 3
- A: Wie verändert sich die Projektdauer, wenn B in der oberen Aufgabe von 2 auf 4 Tage verlängert wird? | L: B endet bei 7 < 8, Pfad bleibt kritisch bei C; Projektdauer unverändert (9), der Puffer von B sinkt auf 1

## Karteikarten
- F: Was bedeutet FAZ? | A: Frühester Anfangszeitpunkt eines Vorgangs
- F: FEZ-Formel? | A: FEZ = FAZ + Dauer
- F: SAZ-Formel? | A: SAZ = SEZ − Dauer
- F: Gesamtpuffer? | A: GP = SAZ − FAZ = SEZ − FEZ
- F: Was ist der kritische Pfad? | A: Pfad mit Gesamtpuffer 0, bestimmt die Projektdauer
- F: Vorwärtsrechnung bei mehreren Vorgängern? | A: FAZ = größter FEZ der Vorgänger
- F: Rückwärtsrechnung bei mehreren Nachfolgern? | A: SEZ = kleinster SAZ der Nachfolger
- F: Was ist ein Meilenstein? | A: Ereignis ohne Dauer, markiert Projektziel oder Zwischenergebnis
- F: Gantt vs. Netzplan? | A: Gantt zeigt Zeit/Balken, Netzplan Abhängigkeiten und kritischen Pfad
- F: Freier Puffer? | A: Zeit, um die ein Vorgang verschoben werden kann, ohne den frühesten Start der Nachfolger zu verschieben

## Quiz
? Wie berechnet man den FEZ?
* FAZ + Dauer
- SAZ − Dauer
- SEZ + Dauer
- FAZ − Dauer

? Was ist der kritische Pfad?
* Der Pfad mit Gesamtpuffer 0
- Der kürzeste Pfad
- Der Pfad mit dem größten Puffer
- Der Pfad mit den meisten Vorgängen

? Wie bestimmt man den FAZ eines Vorgangs mit mehreren Vorgängern?
* Größter FEZ der Vorgänger
- Kleinster FEZ der Vorgänger
- Mittelwert
- Summe

? Wie bestimmt man den SEZ eines Vorgangs mit mehreren Nachfolgern?
* Kleinster SAZ der Nachfolger
- Größter SAZ
- Summe der Dauern
- Durchschnitt

? Vorgang: FAZ 5, SAZ 9. Gesamtpuffer?
* 4
- 14
- 5
- 0

? Was passiert bei Verzögerung eines Vorgangs auf dem kritischen Pfad?
* Das Projektende verschiebt sich
- Nichts, der Puffer fängt es auf
- Das Projekt wird kürzer
- Der Netzplan wird ungültig

? Welche Diagrammform zeigt Balken auf einer Zeitachse?
* Gantt-Diagramm
- Use-Case-Diagramm
- Klassendiagramm
- ER-Diagramm

? Welche Dauer hat ein Meilenstein?
* Null
- Einen Tag
- Eine Woche
- Die Projektdauer
