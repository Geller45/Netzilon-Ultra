---
id: office-excel-datenanalyse
bereich: AP1
block: OF
kapitel: Office (Tabellenkalkulation & Textverarbeitung)
titel: Excel-Datenanalyse – Sortieren, Filtern, bedingte Formatierung, Diagramme, PivotTable, Datenüberprüfung
stufe: Fortgeschritten
fach: Office (EF)
pruefungen: [AP1, Schule]
quellen: [Microsoft-Support – Excel/Word]
verweise: [office-excel-funktionen, office-excel-nachschlagen-datum]
---

## Profi

### Beispiel: Inventarliste IT-Hardware
| A Inv.-Nr. | B Gerät | C Abteilung | D Kaufdatum | E Anschaffungskosten | F Nutzungsdauer (J.) | G jährl. AfA | H Restbuchwert |
|---|---|---|---|---|---|---|---|
| INV-001 | Notebook | Vertrieb | 15.02.2024 | 1.200,00 € | 3 | 400,00 € | … |
| INV-002 | Server | IT | 01.07.2023 | 6.000,00 € | 5 | 1.200,00 € | … |

**Lineare Abschreibung** (Absetzung für Abnutzung, AfA): gleich hohe Jahresbeträge = Anschaffungskosten ÷ Nutzungsdauer. Excel: `=E2/F2` oder Funktion **LIA** (SLN): `=LIA(Kosten;Restwert;Nutzungsdauer)` → `=LIA(E2;0;F2)`. Restbuchwert nach n Jahren: `=MAX(0;E2-G2*n)`. Steuerlich gelten die AfA-Tabellen (Computerhardware und Software seit 2021 mit Nutzungsdauer **1 Jahr** möglich, geringwertige Wirtschaftsgüter bis 800 € netto sofort abschreibbar) – die Excel-Logik bleibt gleich; im Unterjahr wird steuerlich **monatsgenau (pro rata temporis)** abgeschrieben.

### Sortieren und Filtern
- **Sortieren** (Daten → Sortieren): mehrere Ebenen, z. B. Abteilung A–Z, dann Kaufdatum aufsteigend. Wichtig: **gesamten Datenbereich** sortieren, sonst werden Zeilen zerrissen; Kopfzeile als Überschrift markieren.
- **AutoFilter** (Strg+Umschalt+L): Pfeile in der Kopfzeile, Text-/Zahlen-/Datumsfilter (z. B. „größer als 1000“, „vor dem 01.01.2023“). Gefilterte Zeilen sind nur **ausgeblendet**. **TEILERGEBNIS** (SUBTOTAL) bzw. **AGGREGAT** rechnet nur sichtbare Zeilen: `=TEILERGEBNIS(109;E2:E200)`.
- **Erweiterter Filter** mit Kriterienbereich; in 365 die Funktionen **FILTER**, **SORTIEREN** (SORT), **EINDEUTIG** (UNIQUE).

### Bedingte Formatierung
Start → Bedingte Formatierung: Regeln zum Hervorheben (größer als, Datum liegt, doppelte Werte), **obere/untere Regeln**, **Datenbalken**, **Farbskalen**, **Symbolsätze**, eigene Regel per **Formel**: z. B. ganze Zeile rot, wenn Garantie abgelaufen: Bereich A2:H200, Formel `=$I2<HEUTE()` (Spalte fixiert, Zeile relativ). Verwaltung über „Regeln verwalten“ (Reihenfolge, „Anhalten“).

### Diagrammtyp wählen
| Aussage | Diagrammtyp |
|---|---|
| Kategorien vergleichen (Geräte je Abteilung) | **Säulen**- / **Balkendiagramm** (lange Beschriftungen) |
| Entwicklung über Zeit (Ausgaben je Monat) | **Liniendiagramm** |
| Anteile an einem Ganzen (max. ~5–6 Teile) | **Kreis**- / **Ringdiagramm** |
| Zusammenhang zweier Messgrößen (Alter vs. Störungen) | **Punkt (XY)-Diagramm** |
| Zusammensetzung im Vergleich | **gestapelte Säulen** |
| Zwei Größenordnungen | **Verbunddiagramm** mit Sekundärachse |
Gute Diagramme: aussagekräftiger Titel, beschriftete Achsen mit Einheit, Legende nur bei mehreren Reihen, Achse bei Säulen **bei 0 beginnen**, kein 3D. **Sparklines** sind Mini-Diagramme in einer Zelle.

### PivotTable
Einfügen → **PivotTable** fasst große Listen ohne Formeln zusammen. Bereiche: **Filter**, **Spalten**, **Zeilen**, **Werte** (Summe, Anzahl, Mittelwert …). Beispiel: Zeilen = Abteilung, Spalten = Gerät, Werte = Summe Anschaffungskosten. Gruppieren von Datumswerten nach Jahr/Quartal, **Datenschnitt** (Slicer) zum Filtern, **PivotChart**. Nach Datenänderung: **Aktualisieren** (Alt+F5) – Pivot rechnet nicht automatisch. Quelle am besten als intelligente Tabelle.

### Datenüberprüfung
Daten → **Datenüberprüfung** (*Data Validation*): erlaubt nur bestimmte Eingaben – **Liste** (Dropdown „Vertrieb;IT;Verwaltung“ oder Bereich), ganze Zahl zwischen 1 und 10, Datum, Textlänge, benutzerdefinierte Formel (z. B. `=ZÄHLENWENN($A:$A;A2)=1` gegen doppelte Inventarnummern). Registerkarten **Eingabemeldung** und **Fehlermeldung** (Stopp, Warnung, Information). „Ungültige Daten einkreisen“ markiert vorhandene Verstöße.

## Einfach
Stell dir eine riesige **Kiste mit Lego-Steinen** vor – das ist deine Inventarliste.

**Sortieren** heißt: Steine der Reihe nach hinlegen, z. B. nach Farbe. **Filtern** heißt: nur die roten Steine anschauen, die anderen bleiben in der Kiste versteckt, sind aber nicht weg.

**Bedingte Formatierung** ist wie ein **Ampelsystem**: Excel malt alte Geräte automatisch rot an, neue grün. Du musst nichts selbst anmalen.

**Diagramme** sind Bilder aus Zahlen. Säulen zum Vergleichen („Wer hat mehr?“), Linien für den Verlauf („Wie hat sich das entwickelt?“), ein Kuchen für Anteile („Wie groß ist mein Stück?“).

Eine **PivotTable** ist eine **Zählmaschine**: Du sagst „zeig mir pro Abteilung, wie viel Geld für Geräte ausgegeben wurde“ und sie rechnet es sofort aus – ohne eine einzige Formel.

**Datenüberprüfung** ist ein **Türsteher**: In die Spalte „Abteilung“ darf nur rein, was auf der Liste steht. Tippfehler wie „Vertireb“ bleiben draußen.

**Abschreibung** heißt: Ein Notebook für 1.200 €, das 3 Jahre hält, „verliert“ jedes Jahr 400 € an Wert.

## Merksatz
- **Sortieren ordnet, Filtern blendet aus – nichts wird gelöscht.**
- **Säule vergleicht, Linie zeigt Zeit, Kreis zeigt Anteile, Punkt zeigt Zusammenhang.**
- **Pivot: Zeilen – Spalten – Werte – Filter; nach Änderungen aktualisieren.**
- **Lineare AfA = Anschaffungskosten ÷ Nutzungsdauer.**
- **Datenüberprüfung verhindert falsche Eingaben, bevor sie entstehen.**

## Prüfungsfalle
- Nur **eine Spalte** markiert sortieren zerreißt Datensätze – immer den ganzen Bereich.
- SUMME rechnet auch **ausgeblendete/gefilterte** Zeilen mit, TEILERGEBNIS(109;…) nicht.
- **Kreisdiagramm** für Zeitverläufe oder viele Kategorien ist falsch.
- Eine PivotTable aktualisiert sich **nicht automatisch** nach Änderung der Quelldaten.
- Bei bedingter Formatierung mit Formel muss die **Spalte absolut**, die Zeile relativ sein (`=$I2<HEUTE()`).
- Datenüberprüfung greift nicht bei **eingefügten** (kopierten) Werten – bestehende Daten mit „Ungültige Daten einkreisen“ prüfen.
- Lineare AfA rechnet mit **Anschaffungskosten (netto)**, nicht mit dem Bruttopreis (bei vorsteuerabzugsberechtigten Unternehmen).

## Grafik
### Von der Inventarliste zur PivotTable
1. Inventarliste: Rohdaten als intelligente Tabelle (Strg+T)
2. Inventarliste -> PivotTable: Einfügen → PivotTable → neues Arbeitsblatt
3. PivotTable: Feld Abteilung in den Bereich Zeilen ziehen
4. PivotTable: Feld Anschaffungskosten in den Bereich Werte (Summe)
5. PivotTable -> PivotChart: Säulendiagramm Kosten je Abteilung
6. Inventarliste -> PivotTable: neue Geräte erfasst → Aktualisieren (Alt+F5)

## Lab
**Maschine**: CL01.example.com (Windows 11, Excel aus Microsoft 365), Datei `Inventar-IT.xlsx`.

### GUI
1. **CL01**: Excel → neue Mappe; Kopfzeile A1:H1 wie in der Tabelle oben, 15 Geräte erfassen.
2. A1:H16 → **Strg+T** → Tabelle benennen (Tabellenentwurf → Tabellenname `Inventar`).
3. G2: `=LIA([@Anschaffungskosten];0;[@Nutzungsdauer])`; H2: Restbuchwert (siehe Formeln).
4. Spalte C markieren → Daten → **Datenüberprüfung** → Zulassen **Liste** → Quelle `Vertrieb;IT;Verwaltung` → Fehlermeldung „Stopp“.
5. A2:H16 → Start → **Bedingte Formatierung → Neue Regel → Formel** `=$H2=0` → Füllung grau (abgeschriebene Geräte).
6. Spalte E → Bedingte Formatierung → **Datenbalken**.
7. Daten → **Sortieren**: Abteilung A–Z, dann Kaufdatum aufsteigend. Danach Filter: Gerät = Notebook.
8. Einfügen → **PivotTable** → Neues Arbeitsblatt → Zeilen: Abteilung, Spalten: Gerät, Werte: Summe Anschaffungskosten → PivotTable-Analyse → **PivotChart** → gruppierte Säulen.
9. Ein Gerät ergänzen → in der Pivot **Rechtsklick → Aktualisieren**.

### Formeln
```text
G2  =LIA(E2;0;F2)                          lineare AfA pro Jahr (SLN)
G2  =E2/F2                                 gleichwertig ohne Restwert
H2  =MAX(0;E2-G2*DATEDIF(D2;HEUTE();"Y"))  Restbuchwert nach vollen Jahren
J1  =TEILERGEBNIS(109;E2:E200)             Summe nur sichtbarer Zeilen
Bedingte Formatierung: =$H2=0
Datenüberprüfung gegen Duplikate: =ZÄHLENWENN($A:$A;A2)=1
```

## Legende
### PivotTable
- Was: Interaktive Auswertungstabelle, die Daten gruppiert und zusammenfasst.
- Wie: Einfügen → PivotTable, Felder in Zeilen/Spalten/Werte/Filter ziehen.
- Wann: Bei großen Listen, wenn Summen/Anzahlen nach Kategorien gebraucht werden.
- Wo: Auf eigenem Arbeitsblatt, Quelle idealerweise eine intelligente Tabelle.
- Warum: Schnelle Auswertung ohne Formeln, flexibel umbaubar.
### Lineare Abschreibung
- Was: Gleichmäßige Verteilung der Anschaffungskosten auf die Nutzungsdauer.
- Wie: Anschaffungskosten ÷ Nutzungsdauer oder =LIA(Kosten;Restwert;Dauer).
- Beispiel: Notebook 1.200 € / 3 Jahre = 400 € pro Jahr.
### Datenüberprüfung
- Was: Eingaberegel für Zellen (Liste, Zahlenbereich, Datum, Formel).
- Warum: Fehleingaben und Tippfehler vermeiden, einheitliche Werte für Pivot und Filter.

## Karteikarten
- F: Wie berechnet man die lineare Abschreibung? | A: Anschaffungskosten ÷ Nutzungsdauer; in Excel =LIA(Kosten;Restwert;Nutzungsdauer) (SLN).
- F: Notebook 1.500 €, Nutzungsdauer 3 Jahre: jährliche AfA? | A: 500 € pro Jahr.
- F: Was ist der Unterschied zwischen Sortieren und Filtern? | A: Sortieren ändert die Reihenfolge, Filtern blendet nicht passende Zeilen nur aus.
- F: Welche Funktion summiert nur sichtbare (gefilterte) Zeilen? | A: TEILERGEBNIS (SUBTOTAL) mit Funktionsnummer 109 bzw. AGGREGAT.
- F: Welcher Diagrammtyp eignet sich für eine Entwicklung über Zeit? | A: Das Liniendiagramm.
- F: Wann nutzt man ein Kreisdiagramm? | A: Für Anteile an einem Ganzen mit wenigen Kategorien.
- F: Welche vier Bereiche hat eine PivotTable? | A: Filter, Spalten, Zeilen, Werte.
- F: Was muss man nach Änderung der Quelldaten einer PivotTable tun? | A: Aktualisieren (Rechtsklick → Aktualisieren bzw. Alt+F5).
- F: Was ist ein Datenschnitt? | A: Ein grafischer Filter mit Schaltflächen für PivotTables und Tabellen (Slicer).
- F: Wozu dient die Datenüberprüfung? | A: Sie lässt nur zulässige Eingaben zu, z. B. per Dropdown-Liste, und zeigt Eingabe-/Fehlermeldungen.
- F: Wie lautet eine Formel für bedingte Formatierung, die Zeilen mit abgelaufener Garantie (Spalte I) markiert? | A: =$I2<HEUTE() angewendet auf den gesamten Datenbereich.
- F: Was sind Sparklines? | A: Kleine Diagramme innerhalb einer einzelnen Zelle.
- F: Welcher Diagrammtyp zeigt den Zusammenhang zweier Messgrößen? | A: Das Punkt-(XY-)Diagramm.

## Lücken
- Eine Regel, die Zellen abhängig vom Wert einfärbt, heißt {bedingte Formatierung}.
- Die Excel-Funktion für lineare Abschreibung heißt {LIA} (englisch SLN).
- Für Anteile an einem Ganzen eignet sich ein {Kreisdiagramm|Ringdiagramm}.
- Eine PivotTable muss nach Datenänderungen {aktualisiert} werden.

## Zuordnen
### Aussage und Diagrammtyp
- Anzahl Geräte je Abteilung vergleichen => Säulendiagramm
- Monatliche IT-Ausgaben 2026 => Liniendiagramm
- Anteil der Betriebssysteme im Bestand => Kreisdiagramm
- Gerätealter gegenüber Störungsanzahl => Punktdiagramm (XY)
- Kosten je Abteilung, aufgeteilt nach Gerätetyp => gestapeltes Säulendiagramm

## Reihenfolge
### PivotTable erstellen
1. Datenliste als Tabelle mit Überschriften vorbereiten
2. Eine Zelle der Liste markieren
3. Einfügen → PivotTable wählen
4. Ziel „Neues Arbeitsblatt“ bestätigen
5. Felder in Zeilen, Spalten und Werte ziehen
6. Wertfeldeinstellungen (Summe, Anzahl) und Zahlenformat anpassen

## Freitext
- F: Die Geschäftsführung möchte die IT-Ausgaben der letzten 12 Monate und deren Verteilung auf Abteilungen sehen. Schlagen Sie zwei geeignete Diagrammtypen vor und begründen Sie. | M: Verlauf über 12 Monate: Liniendiagramm (zeigt Trend über Zeit). Verteilung auf Abteilungen: Säulen-/Balkendiagramm zum Vergleich oder Kreisdiagramm für Anteile bei wenigen Abteilungen. Achsen beschriften, Titel, Einheit €. | P: 6

## Szenario
### IT-Inventar der Netzilon GmbH
Die Netzilon GmbH hat 240 Geräte in einer Excel-Inventarliste (Inventarnr., Gerät, Abteilung, Kaufdatum, Anschaffungskosten netto, Nutzungsdauer). Der Controller fragt nach der jährlichen Abschreibung und einer Übersicht je Abteilung. In der Spalte Abteilung stehen „IT“, „It“ und „EDV“ gemischt.
- F: Ein Server kostet 7.500 € netto, Nutzungsdauer 5 Jahre. Wie hoch ist die lineare AfA pro Jahr und wie lautet die Excel-Formel? | A: 1.500 €; =LIA(E2;0;F2) bzw. =E2/F2. | P: 3
- F: Wie verhindern Sie künftig uneinheitliche Abteilungsnamen? | A: Datenüberprüfung mit Liste (Dropdown) für die Spalte Abteilung; Altbestand bereinigen (Suchen/Ersetzen). | P: 2
- F: Wie erstellen Sie die Übersicht der Anschaffungskosten je Abteilung? | A: PivotTable: Abteilung in Zeilen, Summe der Anschaffungskosten in Werte, ggf. PivotChart als Säulen. | P: 3
- F: Wie heben Sie voll abgeschriebene Geräte automatisch hervor? | A: Bedingte Formatierung mit Formel, z. B. =$H2=0 auf den Datenbereich. | P: 2

## Quiz
? Ein Notebook kostet 1.200 € netto bei 4 Jahren Nutzungsdauer. Wie hoch ist die lineare AfA pro Jahr?
* 300 €
- 400 €
- 240 €
- 1.200 €
! 1.200 € ÷ 4 Jahre = 300 € pro Jahr.

? Welche Excel-Funktion berechnet die lineare Abschreibung?
* LIA
- RMZ
- ZINS
- GDA
! LIA (SLN); GDA ist geometrisch-degressiv, RMZ berechnet Raten.

? Welcher Diagrammtyp passt zu „Ausgaben pro Monat im Jahresverlauf“?
* Liniendiagramm
- Kreisdiagramm
- Punktdiagramm
- Ringdiagramm
! Zeitverläufe werden als Linie dargestellt.

? Was passiert mit gefilterten Zeilen?
* Sie werden ausgeblendet, bleiben aber erhalten
- Sie werden endgültig aus der Tabelle gelöscht und nur in der Zwischenablage gesichert
- Sie werden in ein neues Blatt verschoben
- Sie werden ans Ende sortiert
! Filter ändern nur die Sichtbarkeit.

? Welche Formel summiert nur die sichtbaren Werte in E2:E200?
* =TEILERGEBNIS(109;E2:E200)
- =SUMME(E2:E200)
- =SUMMEWENN(E2:E200;"sichtbar")
- =ANZAHL(E2:E200)
! Code 109 = Summe ohne ausgeblendete Zeilen.

? Die Quelldaten einer PivotTable wurden geändert, die Pivot zeigt alte Werte. Was tun?
* PivotTable aktualisieren
- Datei neu speichern
- Bedingte Formatierung löschen
- Pivot neu sortieren
! PivotTables rechnen erst nach „Aktualisieren“ (Alt+F5) neu.

? Womit erzwingen Sie eine Dropdown-Auswahl für Abteilungen?
* Datenüberprüfung mit Zulassen „Liste“
- Bedingte Formatierung
- AutoFilter
- Zellen verbinden
! Die Datenüberprüfung (Data Validation) beschränkt Eingaben.

? Welche Regel färbt eine Zeile, wenn der Wert in Spalte H 0 ist (Bereich ab Zeile 2)?
* =$H2=0
- =H$2=0
- =$H$2=0
- =H:H=0
! Spalte fixieren, Zeile relativ lassen, damit jede Zeile ihren eigenen Wert prüft.

? Was ist beim Sortieren einer Liste besonders wichtig?
* Den gesamten zusammenhängenden Datenbereich sortieren
- Vorher alle Formeln löschen
- Immer nur die erste Spalte markieren, damit die übrigen Spalten unverändert bleiben
- Die Kopfzeile mitsortieren
! Sonst werden Datensätze auseinandergerissen.

? Welches Feld kommt bei „Summe der Kosten je Abteilung“ in den Wertebereich?
* Anschaffungskosten
- Abteilung
- Inventarnummer
- Kaufdatum
! Abteilung gehört in die Zeilen, die Kosten werden in Werte summiert.

? Wofür eignet sich ein Kreisdiagramm am besten?
* Anteile weniger Kategorien an einem Ganzen
- Verlauf über viele Monate
- Zusammenhang zweier Messgrößen
- Vergleich von 20 Kategorien mit jeweils sehr ähnlichen Werten über mehrere Jahre
! Mehr als 5–6 Segmente werden unübersichtlich.
