---
id: ihk-algorithmen-suchen-sortieren
bereich: Prüfung
block: IHK
kapitel: Programmieren und Algorithmen
titel: Algorithmen – Datenstrukturen, Suchen, Sortieren, O-Notation, Rekursion, Regex
stufe: Fortgeschritten
fach: PV – AP2
pruefungen: [AP1, AP2]
quellen: [Algorithmen-Logik.md (Obsidian v2), Big-O-Notation.md, Select Sorting.md, Array & Pseudocode.docx]
verweise: [ihk-lz-programmierung-uml, ihk-handlungsschritte, bonus-csharp-kompakt]
---

## Profi

Ein **Algorithmus** (algorithm) ist eine endliche Folge eindeutiger Anweisungen zur Lösung eines Problems. In der IHK-Prüfung wird er als **Pseudocode** oder **Aktivitätsdiagramm** verlangt; der Code muss nicht kompilierbar sein, aber Einrückung und Blockenden (END IF, END FOR) müssen erkennbar sein. Pflichtregeln: Vergleich mit `==` (nicht `=`), `RETURN` liefert einen Wert zurück, `OUTPUT` gibt nur aus, `DIV` ist Ganzzahldivision, `MOD` der Rest.

### Datenstrukturen
| Struktur | Prinzip | Einsatz | Zugriff |
|---|---|---|---|
| Array | Index, zusammenhängender Speicher | Tabellen, Listen | Lesen O(1), Einfügen mitten O(n) |
| Verkettete Liste (linked list) | Knoten mit Zeiger auf den Nachfolger | dynamische Größe, Anhängen | Lesen O(n), Anhängen O(1) |
| Stack | LIFO, push/pop/peek | Undo, Browser-Zurück, Aufrufstapel | O(1) |
| Queue | FIFO, enqueue/dequeue | Druckwarteschlange, Tasks | O(1) |
| Map/Hash | Schlüssel → Wert | Zähler, Caches | O(1) im Mittel |
| Set | nur eindeutige Werte | Duplikate vermeiden | O(1) im Mittel |

Ein Array belegt aufeinanderfolgende Speicherzellen: Der Zugriff per Index ist sehr schnell, aber beim Vergrößern muss oft der ganze Block verschoben werden. Eine verkettete Liste liegt verstreut im Speicher; Anhängen ist billig, die Suche in der Mitte langsam, weil man sich von Knoten zu Knoten hangeln muss.

### Suchen
- **Lineare Suche:** Element für Element prüfen, keine Voraussetzung, Worst Case O(n), Best Case O(1). Liefert den ersten Treffer.
- **Binäre Suche:** Array **muss sortiert** sein. Mitte prüfen, passende Hälfte behalten: `middle ← (left + right) DIV 2`. Worst Case O(log n); bei 1.000 Elementen ca. 10, bei 1.000.000 ca. 20 Schritte (⌈log₂ n⌉).

### Sortieren (einfache Verfahren)
| Verfahren | Idee | Best | Worst | Tauschen | stabil |
|---|---|---|---|---|---|
| Bubble Sort | Nachbarn vergleichen/tauschen, Großes „blubbert“ nach hinten | O(n) mit swapped-Flag | O(n²) | O(n²) | ja |
| Selection Sort | Minimum suchen, an Position i tauschen (Skript: Maximum in neue Liste kopieren) | O(n²) | O(n²) | O(n) | nein |
| Insertion Sort | Element in den sortierten Teil einfügen | O(n) | O(n²) | O(n²) | ja |

Beim Selection Sort sucht man bei n Elementen n, dann n−1, n−2 … 1 Vergleiche: Summe = n(n+1)/2, also **O(n²)**.

### O-Notation
Die O-Notation (big-O) gibt die **obere Schranke** (Worst Case) des Wachstums an – schlechter als angegeben wird es nicht. Reihenfolge von schnell nach langsam: O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(2ⁿ) < O(n!). Herleitung aus Code: eine Schleife → O(n); verschachtelte Schleifen → O(n²); Halbieren (`n ← n DIV 2`) → O(log n); **dreieckige** Schleifen (innere bis i) bleiben O(n²), weil n(n+1)/2 ∈ O(n²). Konstanten und kleinere Terme entfallen.

### Rekursion
Eine Funktion ruft sich selbst auf. Zwingend: **Basisfall** (Abbruch) und ein Schritt, der sich dem Basisfall nähert. Fakultät: `fact(n) = n * fact(n-1)`, Basis `fact(0)=1`. Fehlt der Basisfall, entsteht ein Stapelüberlauf (stack overflow). Rekursives Fibonacci ohne Zwischenspeicher ist O(2ⁿ), iterativ O(n). Iteration ist meist speicherschonender, Rekursion oft lesbarer.

### Reguläre Ausdrücke (Regex)
`^` Anfang, `$` Ende, `.` ein Zeichen, `*` 0..n, `+` 1..n, `?` 0..1, `[0-9]` Zeichenklasse, `\d` Ziffer, `{5}` genau fünf, `|` oder. PLZ: `^[0-9]{5}$`. Einfache E-Mail: `^[^@\s]+@[^@\s]+\.[a-z]{2,}$`. Ohne Anker `^…$` passt auch ein Teilstück.

### Trace-Tabelle (Schreibtischtest)
Spalten für alle Variablen, pro Schritt eine Zeile, Werte exakt nachführen. Sichere Punkte, wenn man sauber arbeitet.

## Einfach

Stell dir vor, du suchst eine Seite in einem Buch.

**Lineare Suche:** Du blätterst Seite für Seite von vorn. Funktioniert immer, dauert bei dicken Büchern lange.

**Binäre Suche:** Du schlägst das Buch in der Mitte auf. „Meine Zahl ist kleiner“ – also wirfst du die rechte Hälfte weg und machst links weiter. Nach wenigen Schritten bist du da. Aber: Das klappt nur, wenn die Seiten **geordnet** sind. Ein Buch mit durcheinandergewürfelten Seiten kannst du so nicht durchsuchen.

**Sortieren:** Stell dir Kinder vor, die sich nach Größe aufstellen.
- Bubble Sort: Immer zwei Nachbarn vergleichen; ist der linke größer, tauschen sie. So wandert das größte Kind ganz nach hinten.
- Selection Sort: Du suchst das kleinste Kind, stellst es an den Anfang, dann das zweitkleinste usw.
- Insertion Sort: Wie beim Kartenspiel: Du nimmst eine neue Karte und steckst sie an die richtige Stelle in deiner Hand.

**O-Notation:** Sie sagt nur, wie sehr die Arbeit wächst, wenn es mehr Dinge werden. Doppelt so viele Kinder: Bei „O(n)“ doppelt so viel Arbeit, bei „O(n²)“ viermal so viel, bei „O(log n)“ nur einen Schritt mehr. Und es geht immer um den **schlimmsten** Fall.

**Stack und Queue:** Stack ist ein Tellerstapel – der letzte Teller oben wird zuerst genommen. Queue ist die Schlange an der Kasse – wer zuerst kam, wird zuerst bedient.

**Rekursion:** Wie russische Matroschka-Puppen: Du öffnest eine Puppe und findest eine kleinere, bis du die kleinste (den Basisfall) erreichst. Ohne kleinste Puppe würdest du ewig weiteröffnen.

**Regex:** Eine Schablone für Text. `[0-9]{5}` heißt: genau fünf Ziffern hintereinander.

## Merksatz
- Binäre Suche braucht Sortierung, sonst Unsinn.
- Stack = Teller (LIFO), Queue = Kasse (FIFO).
- O = Obergrenze = Worst Case.
- Dreieck-Schleife bleibt n².
- Rekursion: ohne Basisfall kein Ende.
- `==` vergleicht, `←` weist zu, RETURN gibt zurück, OUTPUT zeigt nur an.

## Prüfungsfalle
- `=` statt `==` beim Vergleich kostet direkt Punkte.
- RETURN und OUTPUT verwechseln.
- Binäre Suche auf unsortiertem Array anwenden.
- Bubble Sort: innere Schleife läuft bis n−2−i (bereits sortierter Rest wird nicht erneut geprüft); Best Case O(n) nur mit swapped-Flag.
- Dreieckige Schleife für „weniger als n²“ halten.
- Ganzzahl-Division: `7 DIV 2 = 3`, nicht 3,5.
- Binäre Suche findet bei Duplikaten irgendeinen, nicht unbedingt den ersten Treffer.
- Regex ohne Anker `^` und `$` erlaubt auch Treffer im Teilstring.

## Grafik
### Binäre Suche nach 23
1. Suchprogramm: Array [3, 8, 15, 23, 42, 57, 61], links=0, rechts=6
2. Suchprogramm -> Array: Mitte Index 3 prüfen
3. Array: Wert 23 gefunden, Rückgabe Index 3
4. Array -> Suchprogramm: Treffer bei Index 3 nach nur einem Vergleich

### Bubble Sort [5, 3, 8, 1]
1. Array: Ausgangszustand [5, 3, 8, 1]
2. Array -> Array: 5 > 3 tauschen, Zustand [3, 5, 8, 1]
3. Array -> Array: 8 > 1 tauschen, Zustand [3, 5, 1, 8]
4. Array: Durchlauf 2 ergibt [3, 1, 5, 8]
5. Array: Durchlauf 3 ergibt [1, 3, 5, 8], sortiert

## Übungen
- A: Wie viele Vergleiche braucht die binäre Suche höchstens bei 1.024 Elementen? | L: log₂(1024) = 10, also höchstens ca. 10 (bzw. 11 inkl. letztem Test) Schritte
- A: Bestimmen Sie die O-Notation: FOR i FROM 0 TO n-1 DO FOR j FROM 0 TO n-1 DO … | L: O(n²), zwei verschachtelte Schleifen mit je n Durchläufen
- A: Welche Datenstruktur eignet sich für die „Zurück“-Funktion eines Browsers? | L: Stack (LIFO), zuletzt besuchte Seite wird zuerst zurückgegeben

## Lücken
- Die binäre Suche setzt ein {sortiertes} Array voraus und hat die Komplexität O({log n}).
- Ein Stack arbeitet nach dem Prinzip {LIFO}, eine Queue nach {FIFO}.
- Jede Rekursion braucht einen {Basisfall}, sonst droht ein Stapelüberlauf.
- Die O-Notation beschreibt die {obere Schranke} (Worst Case) des Wachstums.

## Zuordnen
### Struktur zu Anwendung
- Stack => Browser-Zurück-Funktion
- Queue => Druckwarteschlange
- Map => Wörter zählen
- Set => Duplikate verhindern

## Reihenfolge
### Binäre Suche (Ablauf einer Runde)
1. left und right bestimmen
2. middle = (left + right) DIV 2 berechnen
3. Wert an middle mit Ziel vergleichen
4. Passende Hälfte wählen (left oder right anpassen)
5. Wiederholen, bis Treffer oder left > right

## Freitext
- F: Erläutern Sie, warum die binäre Suche auf unsortierten Daten nicht funktioniert. | M: Sie verwirft nach jedem Vergleich eine Hälfte unter der Annahme, dass links nur kleinere und rechts nur größere Werte liegen. Bei unsortierten Daten gilt das nicht, das Ziel kann in der verworfenen Hälfte liegen. | P: 3
- F: Nennen Sie je einen Vorteil von Array und verketteter Liste. | M: Array: schneller Indexzugriff O(1). Liste: schnelles Anhängen/Einfügen ohne Verschieben (O(1) am Ende). | P: 2

## Spickzettel
- Binäre Suche: sortiert, O(log n); linear: O(n)
- Bubble/Selection/Insertion: Worst O(n²)
- Selection: wenigste Tausche (O(n))
- Insertion/Bubble(+Flag): Best O(n)
- Stack LIFO, Queue FIFO
- 1.000 → log₂ ≈ 10; 1 Mio → 20
- Dreieck-Schleife = O(n²)
- PLZ-Regex: ^[0-9]{5}$

## Karteikarten
- F: Was ist ein Algorithmus? | A: Endliche Folge eindeutiger Anweisungen zur Lösung eines Problems
- F: Voraussetzung der binären Suche? | A: Das Array muss sortiert sein
- F: Komplexität der binären Suche? | A: O(log n)
- F: Komplexität der linearen Suche im Worst Case? | A: O(n)
- F: Was bedeutet LIFO? | A: Last In, First Out – zuletzt hinzugefügtes Element wird zuerst entnommen (Stack)
- F: Was bedeutet FIFO? | A: First In, First Out – Queue
- F: Welcher einfache Sortieralgorithmus hat die wenigsten Tauschvorgänge? | A: Selection Sort (O(n))
- F: Was ist der Basisfall einer Rekursion? | A: Die Abbruchbedingung, bei der keine weiteren Selbstaufrufe erfolgen
- F: Was ergibt 7 DIV 2 und 7 MOD 2? | A: 3 und 1
- F: Regex für fünfstellige PLZ? | A: ^[0-9]{5}$
- F: Worst Case Anhängen am Ende bei einem Array/einer verketteten Liste? | A: Array O(n) (Verschieben/Umkopieren), Liste O(1)
- F: Wofür steht die O-Notation? | A: Obere Schranke des Wachstums von Laufzeit oder Speicher (Worst Case)

## Quiz
? Welche Voraussetzung hat die binäre Suche?
* Das Array ist sortiert
- Das Array hat gerade Länge
- Das Array enthält keine Duplikate
- Das Array ist verkettet
! Ohne Sortierung kann keine Hälfte sicher verworfen werden.
@ Algorithmen-Logik.md

? Welche Komplexität hat die binäre Suche im Worst Case?
* O(log n)
- O(n)
- O(1)
- O(n²)
! Pro Schritt wird die Datenmenge halbiert.

? Welche Datenstruktur arbeitet nach LIFO?
* Stack
- Queue
- Set
- Map
! Letzter rein, erster raus.

? Welche Struktur passt zur Druckwarteschlange?
* Queue
- Stack
- Set
- Array 2D
! First In, First Out.

? Welche Komplexität hat eine dreieckige Doppelschleife (innere bis i)?
* O(n²)
- O(n)
- O(n log n)
- O(log n)
! 1+2+…+n = n(n+1)/2 ∈ O(n²).

? Welcher Sortieralgorithmus benötigt die wenigsten Tauschvorgänge?
* Selection Sort
- Bubble Sort
- Insertion Sort
- alle gleich viele
! Selection Sort tauscht höchstens n−1-mal.

? Was fehlt einer Rekursion ohne Basisfall?
* Ein Abbruch, es kommt zum Stapelüberlauf
- Nichts, sie endet von selbst
- Ein Rückgabewert, sonst ist alles ok
- Eine Schleife
! Jeder Aufruf legt einen Stackframe an, der Speicher läuft voll.

? Was liefert 7 DIV 2?
* 3
- 3,5
- 4
- 1
! DIV ist ganzzahlig, der Rest (1) ist MOD.

? Welcher Regex passt auf genau fünf Ziffern?
* ^[0-9]{5}$
- [0-9]*
- ^[0-9]+
- [a-z]{5}
! Anker und genaue Anzahl.

? Wie lange dauert Lesen per Index im Array?
* O(1)
- O(n)
- O(log n)
- O(n²)
! Adresse wird direkt berechnet.
