---
id: ihk-epk-bpmn
bereich: Prüfung
block: IHK
kapitel: Projekt und Entwicklung
titel: Prozessmodellierung – EPK, eEPK, BPMN 2.0 und Vergleich mit UML-Aktivitätsdiagramm
stufe: Fortgeschritten
fach: PV – AP2
pruefungen: [AP2]
quellen: [Prozessmodellierung-EPK-BPMN.md (Obsidian v2), Prozess-Modellierung.md (v1), BPM_2.0.pdf, bpmn-2-0-poster.pdf, UML & Dokumentation.docx]
verweise: [ihk-lz-programmierung-uml, wiso-organisation, ihk-requirements-vorgehensmodelle]
---

## Profi

### EPK (ereignisgesteuerte Prozesskette, EPC)
Vier Grundelemente:
| Element | Form | Sprache | Beispiel |
|---|---|---|---|
| **Ereignis** (event) | Sechseck | passiv, Partizip/Zustand | „Bestellung ist eingegangen“ |
| **Funktion** (function) | abgerundetes Rechteck | aktiv, Verb | „Bestellung prüfen“ |
| **Konnektor** | Kreis mit ∧ / ∨ / ⊕ | Verzweigung/Zusammenführung | XOR-Split |
| **Kontrollfluss** | Pfeil | Richtung | – |

**Die fünf EPK-Regeln**
1. **Strikte Alternation:** Ereignis und Funktion wechseln sich ab, nie zwei Funktionen oder zwei Ereignisse direkt hintereinander.
2. **Start und Ende sind Ereignisse.**
3. **Entscheidungsverbot für Ereignisse:** Nach einem Ereignis kein öffnender XOR/ODER-Konnektor (ein öffnendes UND ist erlaubt). Nur Funktionen entscheiden.
4. Nach einem öffnenden XOR/ODER folgen Ereignisse, die das Ergebnis benennen (z. B. „Bestand vorhanden“).
5. **Split/Join-Symmetrie:** mit demselben Konnektortyp öffnen und schließen (sonst Deadlock-Gefahr).

**Konnektoren:** UND (∧) alle Zweige parallel („sowohl-als-auch“); ODER (∨) mindestens ein Zweig, auch mehrere; XOR (⊕) genau ein Zweig („entweder-oder“).

**Beispiel Bestellprozess:** [Bestellung eingegangen] → (Bestellung prüfen) → ⊕ → [Bestand vorhanden] / [Bestand fehlt] → (Ware kommissionieren) / (Ware bestellen) → [Ware kommissioniert] / [Ware bestellt] → ⊕-Join → (Ware versenden) → [Ware versendet].

**eEPK (erweiterte EPK):** zusätzlich Organisationseinheiten (wer?), Informationsobjekte/Daten und Anwendungssysteme.

### BPMN 2.0 (Business Process Model and Notation)
OMG-Standard (ISO/IEC 19510), ausführbar auf Process-Engines (z. B. Camunda).
- **Start-Event** (dünner Kreis), **End-Event** (dicker Kreis), **Task** (abgerundetes Rechteck), **Gateway** (Raute), **Sequenzfluss** (durchgezogen, innerhalb eines Pools), **Nachrichtenfluss** (gestrichelt, zwischen Pools), **Pool** (Beteiligter/Organisation), **Lane** (Rolle/Abteilung im Pool).
- Gateways: **Exclusive** (X) = genau ein Pfad = EPK-XOR; **Parallel** (+) = alle = EPK-UND; **Inclusive** (○) = einer oder mehrere = EPK-ODER.
- Optional (nur erkennen): Timer-Zwischenereignis, Subprozess (+), Message-Event, Datenobjekt.
- Goldene Regel: **Kein Sequenzfluss über Pool-Grenzen**, nur Nachrichtenfluss.

### Vergleich EPK vs. BPMN
| | EPK | BPMN |
|---|---|---|
| Paradigma | zustandsgetrieben | aktivitätsgetrieben |
| Ereignisse | zwischen Funktionen Pflicht | optional |
| Ausführbar | nein, deskriptiv | ja |
| Rollen | nur via eEPK | Pools/Lanes im Kern |
| Kollaboration | nicht vorgesehen | Message Flow |
| Herkunft | SAP/ARIS, deutschsprachig | OMG, international |

### Isomorphie mit UML-Aktivitätsdiagramm
Start: Ereignis ↔ Start-Event ↔ gefüllter Kreis. Tätigkeit: Funktion ↔ Task ↔ Aktion. XOR ↔ Exclusive Gateway ↔ Entscheidungsknoten mit Guards `[Bedingung]`. UND ↔ Parallel Gateway ↔ Fork/Join-Balken. Rolle: eEPK-Spalte ↔ Pool/Lane ↔ Swimlane. Für ODER hat UML kein direktes Äquivalent.

## Einfach

Ein **Prozess** ist ein Rezept für eine Arbeit, zum Beispiel „eine Pizza bestellen“. Mit **EPK** und **BPMN** zeichnest du dieses Rezept als Bild.

**EPK** ist wie ein Brettspiel mit zwei Feldertypen, die sich immer abwechseln: ein **Zustand** (Sechseck: „Bestellung ist da“) und eine **Tätigkeit** (Rechteck: „Bestellung prüfen“). Zustände sind wie Fotos („ist eingegangen“), Tätigkeiten wie Filme („prüfen“). Nach einem Foto kommt ein Film, dann wieder ein Foto. Nie zwei Fotos oder zwei Filme direkt hintereinander.

Entscheiden darf nur eine **Tätigkeit**: „Prüfen“ kann zu „Ja“ oder „Nein“ führen. Ein Zustand kann nichts entscheiden, er ist ja nur ein Foto.

**Konnektoren** sind Weichen: UND = alle Wege gleichzeitig (Pizza backen UND Getränk holen). XOR = genau ein Weg (bar ODER Karte). ODER = einer oder auch beide (Brief oder E-Mail oder beides). Wer eine Weiche aufmacht, macht sie mit demselben Typ wieder zu, sonst steht der Zug ewig.

**BPMN** ist moderner und zeigt auch, **wer** etwas tut: Der große Kasten ist der **Pool** (die Firma), die Streifen darin sind **Lanes** (Vertrieb, Buchhaltung). Innerhalb einer Firma gehen durchgezogene Pfeile. Zwischen zwei Firmen schickt man Briefe: gestrichelte Pfeile (Nachrichtenfluss). Die Weichen heißen **Gateways** (Rauten): X = ein Weg, + = alle, ○ = ein oder mehrere.

## Merksatz
- Ereignis = Zustand (Partizip), Funktion = Tätigkeit (Verb).
- Ereignisse entscheiden nie.
- Weiche auf – Weiche zu: gleicher Konnektor.
- X = XOR, + = UND, ○ = ODER.
- Durchgezogen im Pool, gestrichelt zwischen Pools.
- EPK beschreibt, BPMN kann laufen.

## Prüfungsfalle
- Zwei Funktionen oder zwei Ereignisse direkt hintereinander.
- XOR/ODER-Split direkt nach einem Ereignis.
- Ereignis als Verb formulieren („Bestellung prüfen“ im Sechseck).
- Split XOR, Join UND: Deadlock.
- Notationen mischen (EPK-Sechsecke in BPMN).
- Sequenzfluss über Pool-Grenzen statt Nachrichtenfluss.
- XOR und ODER verwechseln.
- Prozess beginnt oder endet mit einer Funktion statt einem Ereignis.

## Grafik
### EPK Bestellprozess
1. Kunde -> Shop: Ereignis „Bestellung ist eingegangen“
2. Shop: Funktion „Bestellung prüfen“
3. Shop: XOR-Split nach der Funktion
4. Shop -> Lager: Ereignis „Bestand vorhanden“, Funktion „Ware kommissionieren“
5. Lager -> Kunde: Funktion „Ware versenden“, Endereignis „Ware ist versendet“

### BPMN mit zwei Pools
1. Kunde -> Unternehmen: Nachrichtenfluss Bestellung
2. Vertrieb: Task Bestellung erfassen
3. Vertrieb -> Buchhaltung: Sequenzfluss innerhalb des Pools
4. Buchhaltung -> Kunde: Nachrichtenfluss Rechnung

## Übungen
- A: Was ist an „[Bestellung eingegangen] → ⊕ → (Prüfen)“ falsch? | L: XOR-Split direkt nach einem Ereignis ist verboten. Zuerst eine Funktion (Bestellung prüfen), dann der Split
- A: Welches BPMN-Gateway entspricht dem EPK-UND? | L: Parallel Gateway (Raute mit +)
- A: Ein Kunde und ein Unternehmen (zwei Pools) tauschen Daten aus. Welche Linienart? | L: Nachrichtenfluss (gestrichelt)

## Lücken
- Ein EPK-Ereignis wird als {Sechseck} dargestellt und im {Partizip} formuliert.
- Mit dem {Exclusive} Gateway wird genau ein Pfad gewählt.
- Zwischen zwei Pools darf nur ein {Nachrichtenfluss} verlaufen.
- Die erweiterte EPK heißt {eEPK}.

## Zuordnen
### EPK zu BPMN
- XOR-Konnektor => Exclusive Gateway (X)
- UND-Konnektor => Parallel Gateway (+)
- ODER-Konnektor => Inclusive Gateway (○)
- Ereignis/Funktion => Event/Task

## Reihenfolge
### EPK-Grundmuster
1. Startereignis
2. Funktion
3. Ereignis (Ergebnis)
4. Weitere Funktion
5. Endereignis

## Freitext
- F: Nennen Sie zwei Regeln für korrekte EPK. | M: Strikte Alternation Ereignis/Funktion; Start und Ende sind Ereignisse; Ereignisse haben keine öffnenden XOR/ODER; Split und Join gleichen Typs. | P: 2
- F: Nennen Sie drei Unterschiede zwischen EPK und BPMN. | M: EPK zustandsgetrieben und nur beschreibend, BPMN aktivitätsgetrieben und ausführbar; BPMN hat Pools/Lanes und Nachrichtenfluss; Ereignisse sind in EPK Pflicht, in BPMN optional. | P: 3
- F: Wofür steht eine Lane? | M: Rolle, Abteilung oder System innerhalb eines Pools. | P: 1

## Spickzettel
- EPK: Ereignis Sechseck (Partizip), Funktion Rechteck (Verb)
- Alternation, Start/Ende = Ereignis
- Ereignis entscheidet nie
- Split = Join (gleicher Typ)
- X = XOR, + = UND, ○ = ODER
- Pool = Organisation, Lane = Rolle
- Sequenzfluss im Pool, Nachrichtenfluss zwischen Pools
- eEPK = + Organisation, Daten, Systeme

## Karteikarten
- F: Was ist eine EPK? | A: Ereignisgesteuerte Prozesskette – Notation für Geschäftsprozesse aus Ereignissen, Funktionen und Konnektoren
- F: Wie wird ein EPK-Ereignis dargestellt und formuliert? | A: Sechseck, passiv im Partizip (z. B. „Rechnung ist erstellt“)
- F: Wie wird eine EPK-Funktion formuliert? | A: Aktiv mit Verb (z. B. „Rechnung erstellen“)
- F: Was bedeutet strikte Alternation? | A: Ereignis und Funktion wechseln sich immer ab
- F: Was ist der Unterschied zwischen XOR und ODER? | A: XOR: genau ein Zweig; ODER: mindestens ein Zweig, auch mehrere
- F: Welches BPMN-Symbol steht für Parallelität? | A: Parallel Gateway, Raute mit +
- F: Was ist ein Pool? | A: Großer Rahmen für einen Beteiligten/eine Organisation
- F: Was ist eine Lane? | A: Bahn im Pool für Rolle, Abteilung oder System
- F: Wofür steht eEPK? | A: Erweiterte EPK mit Organisationseinheiten, Informationsobjekten und Systemen
- F: Welches Entscheidungselement kennt das UML-Aktivitätsdiagramm? | A: Entscheidungsknoten (Raute) mit Guards [Bedingung]
- F: Warum ist BPMN ausführbar? | A: Hat eine formale Semantik und kann auf Process-Engines (z. B. Camunda) laufen
- F: Welcher Pfeil gilt zwischen Pools in BPMN? | A: Gestrichelter Nachrichtenfluss

## Quiz
? Wie wird in der EPK ein Ereignis dargestellt?
* Sechseck, formuliert als Zustand (Partizip)
- Abgerundetes Rechteck mit Verb
- Raute
- Kreis mit X
! Funktionen sind die abgerundeten Rechtecke.

? Was ist verboten?
* Ein öffnender XOR-Konnektor direkt nach einem Ereignis
- Ein öffnender XOR-Konnektor nach einer Funktion
- Ein Ereignis am Prozessende
- Ein UND-Konnektor nach einer Funktion
! Ereignisse entscheiden nicht.

? Welcher Konnektor erlaubt „mindestens einen, auch mehrere“ Zweige?
* ODER
- XOR
- UND
- NICHT
! XOR: genau einer.

? Womit beginnt und endet jede korrekte EPK?
* Mit einem Ereignis
- Mit einer Funktion
- Mit einem Konnektor
- Mit einer Lane
! Start-/Endereignis.

? Welches BPMN-Gateway entspricht dem EPK-XOR?
* Exclusive Gateway
- Parallel Gateway
- Inclusive Gateway
- Event-Gateway
! X in der Raute.

? Welche Verbindung gilt zwischen zwei Pools?
* Nachrichtenfluss
- Sequenzfluss
- Assoziation
- Kontrollfluss
! Sequenzfluss bleibt im Pool.

? Was stellt eine Lane in BPMN dar?
* Rolle oder Abteilung innerhalb eines Pools
- Eine Organisation
- Einen Datenspeicher
- Ein Ereignis
! Pool = Organisation.

? Was ist ein Hauptunterschied von BPMN zur EPK?
* BPMN-Modelle sind ausführbar und kennen Pools/Lanes
- BPMN ist rein deskriptiv
- BPMN kennt keine Gateways
- BPMN hat nur Ereignisse
! EPK ist deskriptiv.

? Was kann passieren, wenn ein XOR-Split durch einen UND-Join geschlossen wird?
* Deadlock, weil der Join auf nie kommende Token wartet
- Nichts
- Beschleunigung
- Doppelte Ausführung aller Zweige
! Gleiche Konnektortypen verwenden.

? Welches UML-Element entspricht dem UND-Konnektor?
* Fork/Join (Synchronisationsbalken)
- Startknoten
- Notiz
- Swimlane
! Parallelität im Aktivitätsdiagramm.
