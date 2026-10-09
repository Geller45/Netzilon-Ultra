---
id: office-excel-grundlagen
bereich: AP1
block: OF
kapitel: Office (Tabellenkalkulation & Textverarbeitung)
titel: Excel-Grundlagen – Zellbezüge, Formeln, Autoausfüllen, Formate
stufe: Einsteiger
fach: Office (EF)
pruefungen: [AP1, Schule]
quellen: [Microsoft-Support – Excel/Word]
verweise: [office-excel-funktionen, office-excel-nachschlagen-datum]
---

## Profi

### Aufbau einer Arbeitsmappe
Eine Excel-Datei (**Arbeitsmappe**, engl. *Workbook*) besteht aus **Arbeitsblättern** (*Worksheets*). Jedes Blatt hat Spalten (A … XFD, 16.384 Stück) und Zeilen (1 … 1.048.576). Der Schnittpunkt ist eine **Zelle**, adressiert über **Spalte + Zeile**, z. B. `B3`. Ein **Bereich** wird mit Doppelpunkt angegeben (`A1:C10`), mehrere getrennte Bereiche mit Semikolon (`A1:A5;C1:C5`) – in der deutschen Excel-Version ist das **Semikolon das Argumenttrennzeichen**, das **Komma das Dezimalzeichen**.

### Formeln
Jede Formel beginnt mit **`=`**. Rechenoperatoren: `+ - * /`, Potenz `^`, Prozent `%`, Textverkettung `&`, Vergleich `= <> < > <= >=`. Es gilt **Punkt- vor Strichrechnung**, Klammern zuerst. Beispiel Bruttopreis: `=B2*(1+$F$1)` mit dem Mehrwertsteuersatz 19 % in `F1`.

### Zellbezüge
| Art | Schreibweise | Verhalten beim Kopieren |
|---|---|---|
| **relativ** | `A1` | Spalte und Zeile passen sich an |
| **absolut** | `$A$1` | bleibt immer gleich |
| **gemischt (Spalte fix)** | `$A1` | Spalte bleibt, Zeile wandert |
| **gemischt (Zeile fix)** | `A$1` | Zeile bleibt, Spalte wandert |

Mit **F4** schaltet man beim Bearbeiten zyklisch durch: `A1 → $A$1 → A$1 → $A1 → A1`. Bezüge auf andere Blätter: `Tabelle2!B4`, auf andere Mappen: `[Preise.xlsx]Tabelle1!$B$4`. **Namen** (Formeln → Namens-Manager), z. B. `MwSt` für `$F$1`, machen Formeln lesbar und sind automatisch absolut.

Klassisches Beispiel **Einmaleins-Tabelle**: In `B2` steht `=$A2*B$1` – kopiert über den ganzen Bereich bleibt Spalte A (Zeilenköpfe) und Zeile 1 (Spaltenköpfe) fest.

### Autoausfüllen (*AutoFill*)
Das **Ausfüllkästchen** (kleines Quadrat unten rechts an der markierten Zelle) ziehen oder **doppelklicken** (füllt bis zum Ende der Nachbarspalte). Excel erkennt Reihen: `Jan` → Feb, Mär …; `Mo` → Di …; `1, 2` (zwei Zellen markiert) → 3, 4 …; `PC-01` → PC-02. Formeln werden dabei **mit relativen Bezügen angepasst**. **Blitzvorschau** (*Flash Fill*, Strg+E) erkennt Muster, z. B. Vorname aus „Max Muster“. **Strg+Enter** schreibt eine Eingabe in alle markierten Zellen.

### Zellformate
Format ändert nur die **Anzeige**, nicht den gespeicherten Wert (Strg+1 → Zellen formatieren):
- **Zahl**, **Währung** (`1.234,50 €`), **Buchhaltung**, **Prozent** (0,19 wird als 19 % angezeigt), **Datum/Uhrzeit** (Datum ist intern eine **fortlaufende Zahl**, 1 = 01.01.1900), **Text** (Zahl wird nicht gerechnet), **Benutzerdefiniert** (z. B. `0" Stk."`, `#.##0,00 €`, `TT.MM.JJJJ`).
- Ausrichtung, Rahmen, Füllfarbe, **Zellen verbinden** (sparsam – stört Sortieren), **Zeilenumbruch**.
- **Format übertragen** (Pinsel) kopiert nur die Formatierung.
- **Als Tabelle formatieren** (Strg+T) erzeugt eine **intelligente Tabelle** mit strukturierten Verweisen (`=[@Menge]*[@Preis]`), Filter und automatischer Erweiterung.

Wichtige Anzeigen: `#####` = Spalte zu schmal; grünes Dreieck = möglicher Fehler (z. B. Zahl als Text gespeichert).

## Einfach
Eine Excel-Tabelle ist wie ein riesiges **Kästchenpapier**. Jedes Kästchen hat einen Namen wie beim **Schiffe-versenken**: Buchstabe für die Spalte, Zahl für die Zeile – zum Beispiel **B3**.

In ein Kästchen kannst du eine **Rechenaufgabe** schreiben. Damit Excel weiß, dass es rechnen soll, fängst du mit einem **Gleichheitszeichen** an: `=2+3` zeigt 5. Noch besser: `=A1+A2` rechnet mit dem, was in A1 und A2 steht. Änderst du A1, rechnet Excel sofort neu.

Wenn du so eine Rechnung nach unten **kopierst**, denkt Excel mit: Aus `=A1+A2` wird in der nächsten Zeile `=A2+A3`. Das nennt man **relativ** – der Bezug „wandert mit“, wie eine Wegbeschreibung „zwei Häuser weiter“.

Manchmal soll ein Kästchen aber **immer gleich** bleiben, z. B. der Steuersatz. Dann setzt du **Dollarzeichen** davor: `$F$1`. Das ist wie eine feste Hausadresse – egal wo du stehst, sie zeigt immer auf dasselbe Haus. Ein Dollar nur vor dem Buchstaben oder nur vor der Zahl hält nur die Spalte oder nur die Zeile fest.

Ziehst du am kleinen Quadrat unten rechts, füllt Excel Listen **von allein** weiter: Januar, Februar, März … Und mit dem **Format** bestimmst du, wie eine Zahl aussieht – mit Euro-Zeichen, als Prozent oder als Datum. Die Zahl darunter bleibt aber dieselbe.

## Merksatz
- **Formel = Gleichheitszeichen zuerst.**
- **Dollar = Anker: `$A$1` fest, `$A1` Spalte fest, `A$1` Zeile fest – F4 schaltet um.**
- **Format ändert die Anzeige, nie den Wert.**
- **Deutsch: Semikolon trennt Argumente, Komma trennt Dezimalstellen.**

## Prüfungsfalle
- `$A1` hält die **Spalte** fest, nicht die Zeile – der Dollar steht **vor** dem fixierten Teil.
- Eine als **Text** formatierte Zelle zeigt die Formel statt des Ergebnisses an.
- 19 % ist intern **0,19** – `=B2*19%` und `=B2*0,19` sind gleich, `=B2*19` nicht.
- **Gerundete Anzeige** (Format mit 2 Nachkommastellen) rechnet trotzdem mit allen Stellen weiter – zum echten Runden braucht man RUNDEN.
- `#####` ist **kein Fehler**, nur eine zu schmale Spalte.
- Beim Kopieren in eine andere Zeile ändert sich ein relativer Bezug, beim **Ausschneiden/Verschieben** nicht.

## Grafik
### Relativer und absoluter Bezug beim Kopieren
1. Zelle C2: Formel =B2*$F$1 (Netto × MwSt-Satz)
2. C2 -> C3: Ausfüllkästchen nach unten ziehen
3. C3: Excel passt den relativen Teil an zu =B3*$F$1
4. F1: absoluter Bezug bleibt fest auf dem Steuersatz
5. C10: letzte Zeile =B10*$F$1 – alle Zeilen rechnen mit demselben Satz

## Lab
**Maschine**: CL01.example.com (Windows 11, Excel aus Microsoft 365), Datei `Preisliste.xlsx` im Ordner Dokumente.

### GUI
1. **CL01**: Start → Excel → **Leere Arbeitsmappe**.
2. A1 `Artikel`, B1 `Netto`, C1 `MwSt`, D1 `Brutto`, F1 `0,19` eintragen; F1 markieren → Start → Zahl → **Prozentformat**.
3. A2:A6 Artikel (Maus, Tastatur, Monitor, Dockingstation, Headset), B2:B6 Nettopreise eintragen.
4. C2 anklicken, `=B2*` tippen, F1 anklicken, **F4** drücken → `=B2*$F$1`, Enter.
5. D2: `=B2+C2`; C2:D2 markieren → **Doppelklick auf das Ausfüllkästchen**.
6. B2:D6 markieren → **Strg+1** → Zahlen → **Währung**, 2 Dezimalstellen, Symbol €.
7. A1:D6 markieren → Start → **Als Tabelle formatieren** → „Tabelle hat Überschriften“ bestätigen.
8. F1 auf `7 %` ändern → prüfen, dass alle Zeilen neu rechnen. Datei → Speichern unter → `Preisliste.xlsx`.

### Formeln
```text
C2  =B2*$F$1          MwSt mit absolutem Bezug
D2  =B2+C2            Bruttopreis
B8  =SUMME(B2:B6)     Summe Netto (SUM)
Einmaleins B2: =$A2*B$1  (gemischte Bezüge, über B2:K11 ausfüllen)
Mit Namen: F1 → Namenfeld "MwSt" → C2 =B2*MwSt
```

## Legende
### Zellbezug
- Was: Verweis einer Formel auf eine Zelle oder einen Bereich (relativ, absolut, gemischt).
- Wie: Adresse eintippen oder anklicken, mit F4 die Dollarzeichen setzen.
- Wann: Immer, wenn eine Formel mit Werten aus anderen Zellen rechnet und kopiert wird.
- Wo: In der Bearbeitungsleiste von Excel, auch blattübergreifend (`Tabelle2!A1`).
- Warum: Formeln einmal schreiben und korrekt auf viele Zeilen übertragen.
### Zellformat
- Was: Darstellung eines Werts (Währung, Prozent, Datum, Text).
- Wie: Strg+1 → Zellen formatieren oder Start → Zahl.
- Warum: Lesbarkeit – der gespeicherte Wert bleibt unverändert.

## Karteikarten
- F: Womit beginnt jede Excel-Formel? | A: Mit einem Gleichheitszeichen (=).
- F: Was bedeutet der Bezug $A$1? | A: Absoluter Bezug – Spalte und Zeile bleiben beim Kopieren fest.
- F: Was hält der Bezug $A1 fest? | A: Nur die Spalte A; die Zeilennummer passt sich beim Kopieren an.
- F: Was hält der Bezug A$1 fest? | A: Nur die Zeile 1; der Spaltenbuchstabe passt sich an.
- F: Welche Taste wechselt zwischen relativen, absoluten und gemischten Bezügen? | A: F4 (beim Bearbeiten der Formel).
- F: Welches Zeichen trennt in der deutschen Excel-Version Funktionsargumente? | A: Das Semikolon (;), da das Komma Dezimaltrennzeichen ist.
- F: Was ist das Ausfüllkästchen? | A: Das kleine Quadrat unten rechts an der Markierung; Ziehen oder Doppelklicken setzt Reihen fort und kopiert Formeln (AutoFill).
- F: Was bewirkt Strg+E? | A: Blitzvorschau (Flash Fill) – Excel erkennt ein Muster und füllt die Spalte entsprechend.
- F: Wie speichert Excel ein Datum intern? | A: Als fortlaufende Zahl (Seriennummer); 1 entspricht dem 01.01.1900.
- F: Was bedeutet die Anzeige ##### in einer Zelle? | A: Die Spalte ist zu schmal für den Inhalt (meist Zahl oder Datum).
- F: Was ist ein strukturierter Verweis? | A: Ein Bezug auf Spalten einer intelligenten Tabelle per Name, z. B. =[@Menge]*[@Preis].
- F: Wie bezieht man sich auf Zelle B4 im Blatt Preise? | A: Mit =Preise!B4.

## Lücken
- In der deutschen Excel-Version werden Argumente durch ein {Semikolon} getrennt.
- Der Bezug {$B$2} bleibt beim Kopieren vollständig unverändert.
- Mit der Taste {F4} schaltet man zwischen den Bezugsarten um.
- Ein Zellformat ändert nur die {Anzeige} eines Werts, nicht den gespeicherten Wert.

## Zuordnen
### Bezugsart erkennen
- A1 => relativ
- $A$1 => absolut
- $A1 => gemischt, Spalte fixiert
- A$1 => gemischt, Zeile fixiert
- Tabelle2!A1 => Bezug auf ein anderes Arbeitsblatt

## Reihenfolge
### Bruttopreis-Spalte anlegen
1. Steuersatz in eine eigene Zelle (F1) schreiben
2. In C2 die Formel =B2* beginnen
3. F1 anklicken und mit F4 absolut setzen
4. Formel mit Enter bestätigen
5. Ausfüllkästchen doppelklicken
6. Ergebnis mit Währungsformat formatieren

## Freitext
- F: Erläutern Sie den Unterschied zwischen relativem, absolutem und gemischtem Zellbezug an einem Beispiel. | M: Relativ (A1) passt Spalte und Zeile beim Kopieren an; absolut ($A$1) bleibt fest, z. B. für einen Steuersatz; gemischt ($A1 oder A$1) fixiert nur Spalte oder Zeile, z. B. beim Einmaleins =$A2*B$1. | P: 6

## Szenario
### Preisliste der Netzilon GmbH
Die Netzilon GmbH erstellt für den Vertrieb eine Preisliste mit Nettopreisen in Spalte B. Der Mehrwertsteuersatz steht in F1. Ein Azubi hat in C2 `=B2*F1` geschrieben und nach unten kopiert – ab Zeile 3 erscheinen falsche Werte (0).
- F: Warum liefern die kopierten Formeln falsche Ergebnisse? | A: F1 ist relativ; beim Kopieren wird daraus F2, F3 … – diese Zellen sind leer, also Ergebnis 0. | P: 2
- F: Wie lautet die korrekte Formel in C2? | A: =B2*$F$1 (oder mit Namen =B2*MwSt). | P: 2
- F: Der Vertrieb möchte Preise mit Euro-Zeichen sehen, die Werte sollen aber rechenbar bleiben. Was tun Sie? | A: Zellformat Währung (Strg+1) zuweisen statt „€“ als Text einzutippen. | P: 2

## Quiz
? Welche Formel kopiert man korrekt nach unten, wenn der MwSt-Satz in F1 steht?
* =B2*$F$1
- =B2*F1
- =$B$2*F1
- =B$2*F$1
! F1 muss absolut sein, B2 relativ, damit jede Zeile ihren eigenen Nettopreis nutzt.

? Was hält der Bezug $C5 beim Kopieren fest?
* Die Spalte C
- Die Zeile 5
- Spalte und Zeile
- Nichts, er ist relativ
! Das Dollarzeichen steht vor dem C – nur die Spalte ist verankert.

? In B2 steht =$A2*B$1 und wird nach C3 kopiert. Wie lautet die Formel dort?
* =$A3*C$1
- =$A2*C$1
- =$B3*C$1
- =$A3*B$1
! Spalte A bleibt fest, Zeile 2 wird 3; bei B$1 wandert die Spalte zu C, Zeile 1 bleibt.

? Was zeigt Excel, wenn eine Zahl breiter ist als die Spalte?
* #####
- #WERT!
- #NV
- #BEZUG!
! Kein echter Fehler – Spalte verbreitern genügt.

? Welche Zahl speichert Excel, wenn in einer Zelle „19 %“ angezeigt wird?
* 0,19
- 19
- 1,9
- 0,019
! Prozentformat multipliziert die Anzeige mit 100 und hängt % an.

? Welche Tastenkombination öffnet „Zellen formatieren“?
* Strg+1
- Strg+F
- Strg+T
- Strg+E
! Strg+T erzeugt eine Tabelle, Strg+E ist Blitzvorschau, Strg+F sucht.

? Welches Ergebnis liefert =2+3*4?
* 14
- 20
- 24
- 9
! Punkt vor Strich: 3*4 = 12, plus 2 = 14.

? Was passiert bei Doppelklick auf das Ausfüllkästchen?
* Die Formel wird bis zum Ende der Daten in der Nachbarspalte kopiert
- Die Zelle wird gelöscht
- Die Formel wird in einen festen Wert umgewandelt
- Die ganze Spalte wird markiert
! Praktisch für lange Listen – Excel orientiert sich an der benachbarten gefüllten Spalte.

? Wie verknüpft man Text aus A2 und B2 mit Leerzeichen?
* =A2&" "&B2
- =A2+" "+B2
- =A2;B2
- =A2*B2
! Das kaufmännische Und (&) verkettet Text; alternativ TEXTKETTE (TEXTJOIN/CONCAT).

? Warum zeigt eine Zelle „=A1+A2“ statt des Ergebnisses an?
* Sie war vor der Eingabe als Text formatiert
- Die Datei ist schreibgeschützt
- A1 ist leer
- Die automatische Berechnung ist aus
! Als Text formatierte Zellen behandeln Eingaben nicht als Formel – Format ändern und neu bestätigen.

? Welcher Vorteil hat eine mit Strg+T erstellte Tabelle?
* Sie erweitert Formeln und Formate automatisch für neue Zeilen
- Sie verschlüsselt die Daten
- Sie verhindert jede Formelbearbeitung
- Sie wandelt alle Zahlen in Text um
! Intelligente Tabellen bringen Filter, strukturierte Verweise und automatische Erweiterung mit.
