---
id: ihk-bpmn-elemente
bereich: AP2
block: IHK
kapitel: Prozessmodellierung
titel: BPMN 2.0 Elemente – Aktivitäten, Ereignisse, Konversation und Choreographie
stufe: Profi
fach: PV – AP2
pruefungen: [AP1, AP2]
quellen: [bpmn-2-0-poster.pdf, BPM_2.0.pdf]
verweise: [ihk-uml-entwurf-uebungen]
---

## Profi

Ergänzung zur Seite „Prozessmodellierung EPK und BPMN“: die Elementgruppen des BPMN-2.0-Posters.

### Aktivitäten (Rechtecke mit abgerundeten Ecken)
| Element | Bedeutung |
|---|---|
| **Aufgabe (Task)** | Arbeitseinheit, nicht weiter zerlegt |
| **Teilprozess (Sub-Process)** | zerlegbare Aktivität; zugeklappt mit **+** Symbol, aufgeklappt mit eigenem Ablauf |
| **Transaktion** | Gruppe logisch zusammengehöriger Aktivitäten (doppelte Umrandung), ganz oder gar nicht; ein Transaktionsprotokoll kann angegeben werden |
| **Ereignis-Teilprozess** | wird in einem anderen Teilprozess platziert (gepunktet umrandet); wird durch ein Ereignis ausgelöst, kann den umgebenden Teilprozess **unterbrechen** oder **parallel** (nicht unterbrechend) laufen |
| **Aufruf-Aktivität (Call Activity)** | ruft einen global definierten Teilprozess oder eine Aufgabe auf, die in mehreren Prozessen **wiederverwendet** wird (fette Umrandung) |

Markierungen an Aktivitäten: Schleife, Mehrfachinstanz (parallel |||, sequenziell ≡), Kompensation.

### Ereignisse (Kreise)
- **Start** (dünner Rand), **Zwischenereignis** (doppelter Rand), **Ende** (dicker Rand).
- Auslösertypen im Symbol: Nachricht (Umschlag), Zeit (Uhr), Fehler, Signal, Bedingung, Eskalation, Abbruch, Kompensation, Link; **Blanko** = untypisiert (meist Start/Ende).
- **Unterbrechend** (durchgezogener Rand) bricht die Aktivität ab; **nicht unterbrechend** (gestrichelter Rand) läuft parallel zur Aktivität.
- An den Rand einer Aktivität geheftete Zwischenereignisse (Boundary Events) behandeln Fehler, Timeouts oder Nachrichten.

### Gateways (Rauten)
Exklusiv (X), Parallel (+), Inklusiv (○), Ereignisbasiert, Komplex (✱).

### Konversationsdiagramm und Choreographie
- **Konversation**: Sechseck; fasst zusammengehörigen Nachrichtenaustausch zwischen Beteiligten (A, B, C) zusammen. **Teilkonversation** mit +, **Aufruf-Konversation** mit fetter Umrandung. Ein **Konversationslink** verknüpft Konversation und Teilnehmer.
- **Choreographie**: beschreibt die Interaktion (den Nachrichtenaustausch) zwischen Beteiligten ohne einen zentralen Prozess. **Choreographie-Aufgabe** = Interaktion zwischen zwei Beteiligten; **Choreographie-Teilprozess** = verfeinerte Choreographie mit mehreren Interaktionen; **Aufruf-Choreographie** = global definierte Choreographie.

## Einfach

Stell dir ein Spiel mit Bausteinen vor. Ein **Task** ist ein kleiner Stein: „Brief schreiben“. Ein **Teilprozess** ist eine Kiste, in der viele kleine Steine liegen: „Bewerbung erledigen“. Die **Aufruf-Aktivität** ist wie ein Zettel „siehe Rezeptbuch Seite 5“: dort steht der Ablauf, den mehrere Rezepte benutzen.

**Ereignisse** sind Kreise: Am Anfang ein dünner, in der Mitte ein doppelter, am Ende ein dicker. Ein Wecker im Kreis bedeutet „nach Zeit“, ein Umschlag „Nachricht angekommen“. Wenn der Rand **durchgezogen** ist, wird das Laufende abgebrochen, wie wenn die Feuerwehr kommt. Ist er **gestrichelt**, läuft alles weiter und das Neue passiert nebenbei, wie ein Anruf, während du kochst.

Eine **Choreographie** ist ein Tanzplan: Er zeigt nur, wer wem wann etwas zuwirft, nicht was jeder zu Hause macht.

## Merksatz
- Kreis dünn – doppelt – dick: Start, Zwischen, Ende.
- Durchgezogen unterbricht, gestrichelt läuft parallel.
- Plus im Kasten = Teilprozess, fette Umrandung = Aufruf.
- Choreographie = nur die Nachrichten zwischen den Beteiligten.

## Prüfungsfalle
- Unterbrechend und nicht unterbrechend verwechseln.
- Teilprozess mit Aufruf-Aktivität verwechseln: Aufruf verweist auf global definierte Elemente.
- Sequenzfluss über Poolgrenzen zeichnen.
- Konversation (Überblick) mit Choreographie (Ablauf der Nachrichten) gleichsetzen.

## Grafik
### Boundary-Event
1. Prozess: Aufgabe „Bestellung prüfen“ läuft
2. Zeit -> Prozess: Timer-Ereignis nach 2 Tagen löst aus
3. Prozess: unterbrechend, Aufgabe wird abgebrochen
4. Prozess: Eskalationspfad startet

## Übungen
- A: Eine Aufgabe wird in drei Prozessen identisch verwendet. Welches Element? | L: Aufruf-Aktivität (Call Activity) auf einen globalen Teilprozess
- A: Ein Anruf des Kunden soll die laufende Bearbeitung nicht stoppen. Welcher Ereignistyp? | L: Nicht unterbrechendes Ereignis (gestrichelter Rand)

## Lücken
- Das Symbol {+} im Rechteck kennzeichnet einen zugeklappten Teilprozess.
- Ein Ereignis mit doppeltem Rand ist ein {Zwischenereignis}.
- Eine {Choreographie} beschreibt die Interaktion zwischen Beteiligten ohne zentralen Prozess.

## Spickzettel
- Task, Sub-Process (+), Transaktion (doppelt), Ereignis-Teilprozess (gepunktet), Call Activity (fett)
- Start dünn, Zwischen doppelt, Ende dick
- Unterbrechend = durchgezogen, nicht unterbrechend = gestrichelt
- Konversation = Sechseck, Choreographie-Aufgabe = Interaktion zweier Beteiligter

## Karteikarten
- F: Was ist ein BPMN-Task? | A: Eine nicht weiter zerlegte Arbeitseinheit
- F: Wie wird ein zugeklappter Teilprozess gekennzeichnet? | A: Mit einem Plus-Symbol im unteren Rand
- F: Was ist eine Transaktion in BPMN? | A: Eine Gruppe logisch zusammengehöriger Aktivitäten, die ganz oder gar nicht ausgeführt werden
- F: Was ist ein Ereignis-Teilprozess? | A: Ein in einem anderen Teilprozess platzierter Teilprozess, der durch ein Ereignis ausgelöst wird
- F: Was ist eine Aufruf-Aktivität? | A: Verweis auf einen global definierten Teilprozess oder eine Aufgabe zur Wiederverwendung
- F: Woran erkennt man Start-, Zwischen- und Endereignis? | A: Dünner, doppelter und dicker Rand
- F: Was bedeutet ein gestrichelter Ereignisrand? | A: Nicht unterbrechend: die Aktivität läuft parallel weiter
- F: Was zeigt ein Konversationsdiagramm? | A: Den zusammengehörigen Nachrichtenaustausch zwischen Beteiligten als Überblick
- F: Was ist eine Choreographie-Aufgabe? | A: Eine Interaktion (Nachrichtenaustausch) zwischen zwei Beteiligten
- F: Was ist Blanko bei Ereignissen? | A: Ein untypisiertes Ereignis ohne Auslöser, meist Start oder Ende

## Quiz
? Welches Element ruft einen global definierten Teilprozess auf?
* Aufruf-Aktivität
- Aufgabe
- Transaktion
- Konversation

? Woran erkennt man ein Endereignis?
* Dicker Rand
- Dünner Rand
- Doppelter Rand
- Gestrichelter Rand

? Was bedeutet ein gestrichelter Rand beim Ereignis?
* Nicht unterbrechend
- Unterbrechend
- Fehlerereignis
- Endereignis

? Was kennzeichnet einen zugeklappten Teilprozess?
* Ein Plus-Symbol
- Ein X
- Ein Kreis
- Ein Umschlag

? Was beschreibt eine Choreographie?
* Den Nachrichtenaustausch zwischen Beteiligten ohne zentralen Prozess
- Den internen Ablauf eines Pools
- Die Datenbankstruktur
- Das Netzwerkdesign

? Was ist eine Transaktion in BPMN?
* Gruppe zusammengehöriger Aktivitäten, die als Einheit gelten
- Ein Bezahlvorgang
- Eine einzelne Aufgabe
- Ein Pool

? Welches Symbol hat ein Zwischenereignis?
* Kreis mit doppeltem Rand
- Kreis mit dickem Rand
- Raute mit X
- Sechseck

? Wofür steht ein Umschlag im Ereigniskreis?
* Nachricht
- Zeit
- Fehler
- Abbruch
