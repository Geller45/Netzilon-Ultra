---
id: office-excel-nachschlagen-datum
bereich: AP1
block: OF
kapitel: Office (Tabellenkalkulation & Textverarbeitung)
titel: Excel – SVERWEIS, XVERWEIS, INDEX/VERGLEICH, Datumsfunktionen und Fehlerwerte
stufe: Fortgeschritten
fach: Office (EF)
pruefungen: [AP1, Schule]
quellen: [Microsoft-Support – Excel/Word]
verweise: [office-excel-funktionen, office-excel-datenanalyse]
---

## Profi

### SVERWEIS (VLOOKUP)
`=SVERWEIS(Suchkriterium;Matrix;Spaltenindex;[Bereich_Verweis])`
- Sucht das Kriterium in der **ersten (linken) Spalte** der Matrix und gibt den Wert aus der Spalte Nr. *Spaltenindex* derselben Zeile zurück.
- **Bereich_Verweis**: `FALSCH` (oder 0) = **exakte Übereinstimmung** – Normalfall bei Artikelnummern. `WAHR` (oder weggelassen!) = **ungefähre Übereinstimmung**: erste Spalte muss **aufsteigend sortiert** sein, geliefert wird der größte Wert ≤ Suchkriterium (z. B. Rabattstaffeln, Notenschlüssel).
- Matrix **absolut** setzen (`$A$2:$D$100`), sonst verrutscht sie beim Kopieren.
- Grenzen: kann nicht **nach links** suchen; Spaltenindex ist eine feste Zahl und bricht, wenn Spalten eingefügt werden. **WVERWEIS** (HLOOKUP) sucht waagerecht in der ersten Zeile.

Beispiel: `=SVERWEIS(A2;Artikel!$A$2:$D$500;3;FALSCH)` → Preis (3. Spalte) zur Artikelnummer.

### XVERWEIS (XLOOKUP) – Excel 2021 / Microsoft 365
`=XVERWEIS(Suchkriterium;Suchmatrix;Rückgabematrix;[wenn_nicht_gefunden];[Vergleichsmodus];[Suchmodus])`
- Standard ist **exakte** Übereinstimmung.
- Such- und Rückgabespalte getrennt → **Suche nach links** möglich, robust gegen eingefügte Spalten.
- Eingebauter Ersatztext: `=XVERWEIS(A2;Artikel!A:A;Artikel!C:C;"unbekannt")`.
- Suchmodus −1 sucht von unten (letzter Treffer).

### INDEX und VERGLEICH (INDEX/MATCH)
- **VERGLEICH** (MATCH) liefert die **Position**: `=VERGLEICH(Suchkriterium;Suchmatrix;0)` (0 = exakt).
- **INDEX** liefert den **Wert an einer Position**: `=INDEX(Matrix;Zeile;[Spalte])`.
- Kombiniert: `=INDEX(C2:C500;VERGLEICH(A2;A2:A500;0))` – funktioniert in allen Excel-Versionen, sucht in beliebige Richtung.

### Datum und Zeit
Datum = **fortlaufende Zahl** (Tage seit 01.01.1900), Uhrzeit = **Bruchteil eines Tages** (12:00 = 0,5). Daher kann man rechnen: `=B2-A2` → Anzahl Tage.
| Funktion (Englisch) | Ergebnis |
|---|---|
| **HEUTE()** (TODAY) | aktuelles Datum, ändert sich bei jeder Neuberechnung |
| **JETZT()** (NOW) | Datum + Uhrzeit |
| **DATUM(J;M;T)** (DATE) | baut ein Datum zusammen |
| **JAHR/MONAT/TAG** (YEAR/MONTH/DAY) | zerlegt ein Datum |
| **TAGE(Ende;Anfang)** (DAYS) | Tage zwischen zwei Daten |
| **NETTOARBEITSTAGE** (NETWORKDAYS) | Werktage Mo–Fr, optional Feiertagsliste |
| **EDATUM(Datum;Monate)** (EDATE) | Datum ± n Monate, z. B. Garantieende |
| **DATEDIF(Anfang;Ende;"Y")** | volle Jahre/Monate/Tage („Y“, „M“, „D“) – undokumentierte Kompatibilitätsfunktion, erscheint nicht im Funktionsassistenten |

Beispiel Gerätealter in Jahren: `=DATEDIF(C2;HEUTE();"Y")`; Garantieablauf: `=EDATUM(C2;36)`.

### Fehlerwerte
| Fehler | Bedeutung | typische Ursache |
|---|---|---|
| **#NV** (#N/A) | Wert nicht verfügbar | SVERWEIS findet das Suchkriterium nicht |
| **#BEZUG!** (#REF!) | ungültiger Bezug | referenzierte Zeile/Spalte gelöscht, Spaltenindex > Matrixbreite |
| **#DIV/0!** | Division durch null | Nenner leer oder 0 |
| **#WERT!** (#VALUE!) | falscher Datentyp | Text in Rechnung |
| **#NAME?** | unbekannter Name | Funktion falsch geschrieben, Text ohne Anführungszeichen |
| **#ZAHL!** (#NUM!) | ungültige Zahl | z. B. Wurzel aus negativer Zahl |
| **#ÜBERLAUF!** (#SPILL!) | dynamisches Array kann nicht ausgegeben werden | Zielbereich belegt |
Abfangen mit **WENNFEHLER** (IFERROR) oder gezielt **WENNNV** (IFNA).

## Einfach
Stell dir ein **Telefonbuch** vor. Du kennst den Namen und willst die Nummer. Du fährst mit dem Finger die **linke Spalte** runter, bis du den Namen findest, und schaust dann **nach rechts** zur Nummer. Genau das macht **SVERWEIS**: „Such links, gib mir was von rechts.“ Mit **FALSCH** am Ende sagst du: „Nur den **genau** richtigen Namen!“

**XVERWEIS** ist der neue, schlauere Bruder: Er kann auch nach links schauen und sagt höflich „unbekannt“, wenn er nichts findet.

Für Excel ist ein Datum nur eine **Zahl** – wie viele Tage seit Neujahr 1900 vergangen sind. Deshalb kann man Daten einfach voneinander abziehen: Ferienende minus Ferienbeginn = Anzahl Ferientage. **HEUTE()** ist wie ein Kalender, der jeden Tag selbst umblättert.

Wenn Excel etwas nicht kann, zeigt es einen **Fehlercode** mit Raute: **#NV** heißt „Hab ich nicht gefunden“, **#DIV/0!** heißt „Durch null teilen geht nicht“, **#BEZUG!** heißt „Die Zelle, auf die du zeigst, gibt’s nicht mehr“.

## Merksatz
- **SVERWEIS: links suchen, rechts liefern – FALSCH für exakt.**
- **XVERWEIS: Suchspalte + Rückgabespalte, exakt ist Standard.**
- **INDEX holt, VERGLEICH findet.**
- **Datum ist eine Zahl – Ende minus Anfang = Tage.**
- **#NV nicht gefunden, #BEZUG! gelöscht, #DIV/0! durch null.**

## Prüfungsfalle
- SVERWEIS **ohne** viertes Argument sucht **ungefähr** – bei unsortierten Artikelnummern kommen falsche Treffer statt #NV.
- Der Spaltenindex zählt **ab der ersten Spalte der Matrix**, nicht ab Spalte A des Blatts.
- SVERWEIS kann nicht nach links suchen – dann XVERWEIS oder INDEX/VERGLEICH.
- **HEUTE()** ist **volatil**: Ein Ausdruck von gestern zeigt heute andere Werte.
- Ergebnis einer Datumsdifferenz als Datum formatiert sieht aus wie „15.01.1900“ – auf **Zahl** umstellen.
- Zahl als Text (z. B. Artikelnummer „1001“ als Text) wird von SVERWEIS nicht gefunden → #NV.

## Grafik
### So arbeitet SVERWEIS
1. Zelle A2: Suchkriterium Artikelnummer 1003
2. SVERWEIS -> Matrix: sucht 1003 in der ersten Spalte von oben nach unten
3. Matrix: Treffer in Zeile 4 der Matrix
4. Matrix -> Spalte 3: Wert in derselben Zeile wird gelesen
5. Ergebnis: Preis 249,00 € wird zurückgegeben, ohne Treffer #NV

## Lab
**Maschine**: CL01.example.com (Windows 11, Excel aus Microsoft 365), Datei `Bestellung.xlsx` mit Blättern `Artikel` und `Bestellung`.

### GUI
1. **CL01**: Excel → neue Mappe; Blatt 1 umbenennen (Doppelklick auf Register) in `Artikel`.
2. `Artikel`: A1 `ArtNr`, B1 `Bezeichnung`, C1 `Preis`, D1 `Kaufdatum`; fünf Artikel 1001–1005 eintragen.
3. Neues Blatt (+) `Bestellung`: A2 `1003` eintragen.
4. B2 → Formeln → **Nachschlagen und Verweisen → SVERWEIS** → Matrix im Blatt Artikel markieren → **F4** → Spaltenindex 2 → Bereich_Verweis `FALSCH`.
5. C2: XVERWEIS für den Preis (siehe Formeln); A2 auf `9999` ändern → Ersatztext „unbekannt“ prüfen.
6. Im Blatt Artikel E2: Alter des Geräts mit DATEDIF; F2: Garantieende mit EDATUM; F2 als **Datum** formatieren.
7. Formeln → **Formelüberwachung → Formel auswerten**, um SVERWEIS Schritt für Schritt nachzuvollziehen.

### Formeln
```text
B2  =SVERWEIS(A2;Artikel!$A$2:$D$6;2;FALSCH)
C2  =XVERWEIS(A2;Artikel!$A$2:$A$6;Artikel!$C$2:$C$6;"unbekannt")
D2  =INDEX(Artikel!$C$2:$C$6;VERGLEICH(A2;Artikel!$A$2:$A$6;0))
Artikel!E2  =DATEDIF(D2;HEUTE();"Y")
Artikel!F2  =EDATUM(D2;36)
G2  =WENNFEHLER(SVERWEIS(A2;Artikel!$A$2:$D$6;3;FALSCH);"fehlt")
```

## Legende
### SVERWEIS (VLOOKUP)
- Was: Senkrechte Nachschlagefunktion – sucht in der ersten Spalte, liefert einen Wert aus derselben Zeile.
- Wie: =SVERWEIS(Kriterium;Matrix;Spaltenindex;FALSCH).
- Wann: Preise, Namen oder Daten zu einer Schlüsselnummer holen.
- Wo: Formeln → Nachschlagen und Verweisen; Matrix oft auf einem eigenen Blatt.
- Warum: Daten einmal pflegen und überall abrufen statt abzutippen.
### Fehlerwert
- Was: Rückmeldung von Excel, dass eine Formel nicht berechnet werden kann (#NV, #BEZUG!, #DIV/0! …).
- Womit: WENNFEHLER/WENNNV abfangen oder Ursache beheben.

## Karteikarten
- F: Wie lautet die Syntax von SVERWEIS? | A: =SVERWEIS(Suchkriterium;Matrix;Spaltenindex;Bereich_Verweis) – englisch VLOOKUP.
- F: Was bewirkt FALSCH als viertes Argument von SVERWEIS? | A: Exakte Übereinstimmung; ohne Treffer kommt #NV.
- F: Was ist die Voraussetzung für die ungefähre Suche (WAHR)? | A: Die erste Spalte der Matrix muss aufsteigend sortiert sein.
- F: Welche Vorteile hat XVERWEIS gegenüber SVERWEIS? | A: Exakt als Standard, Suche nach links, getrennte Rückgabespalte, Ersatzwert bei Nichtfinden.
- F: Was liefert VERGLEICH (MATCH)? | A: Die Position eines Werts in einem Bereich.
- F: Wofür steht #NV? | A: Wert nicht verfügbar – meist findet eine Suchfunktion das Kriterium nicht (#N/A).
- F: Wann entsteht #BEZUG!? | A: Wenn eine Formel auf gelöschte Zellen zeigt oder der Spaltenindex außerhalb der Matrix liegt (#REF!).
- F: Wann entsteht #DIV/0!? | A: Bei Division durch 0 oder eine leere Zelle.
- F: Was liefert =HEUTE()? | A: Das aktuelle Datum (TODAY), wird bei jeder Neuberechnung aktualisiert.
- F: Wie berechnet man volle Jahre zwischen Kaufdatum C2 und heute? | A: =DATEDIF(C2;HEUTE();"Y").
- F: Wie speichert Excel die Uhrzeit 18:00? | A: Als Bruchteil eines Tages: 0,75.
- F: Was berechnet EDATUM(C2;24)? | A: Das Datum 24 Monate nach C2 (EDATE), z. B. Garantieende.
- F: Was bedeutet #NAME? | A: Excel kennt einen Funktions- oder Bereichsnamen nicht, z. B. Tippfehler.

## Lücken
- SVERWEIS sucht immer in der {ersten} Spalte der Matrix.
- Für eine exakte Suche wird das vierte Argument auf {FALSCH|0} gesetzt.
- Der Fehlerwert {#DIV/0!} entsteht bei Division durch null.
- Die Funktion {HEUTE} liefert das aktuelle Datum.

## Zuordnen
### Fehlerwert und Ursache
- #NV => Suchkriterium nicht gefunden
- #BEZUG! => Bezug auf gelöschte Zelle
- #DIV/0! => Division durch null
- #WERT! => Text statt Zahl in einer Rechnung
- #NAME? => Funktionsname falsch geschrieben

## Reihenfolge
### SVERWEIS-Formel aufbauen
1. Zielzelle markieren und =SVERWEIS( eingeben
2. Zelle mit dem Suchkriterium anklicken
3. Matrix markieren und mit F4 absolut setzen
4. Spaltenindex der gewünschten Rückgabespalte angeben
5. FALSCH für exakte Übereinstimmung ergänzen
6. Mit Enter bestätigen und nach unten ausfüllen

## Freitext
- F: Erläutern Sie zwei Nachteile von SVERWEIS und nennen Sie eine Alternative. | M: SVERWEIS sucht nur in der ersten Spalte und kann nicht nach links liefern; der Spaltenindex ist fest und stimmt nach Einfügen von Spalten nicht mehr; ohne FALSCH ungefähre Suche. Alternative: XVERWEIS oder INDEX/VERGLEICH. | P: 5

## Szenario
### Inventarnummern bei der Netzilon GmbH
Die Netzilon GmbH pflegt im Blatt `Inventar` alle Geräte (A Inventarnr., B Gerät, C Standort, D Kaufdatum). Im Blatt `Ticket` soll zur eingegebenen Inventarnummer automatisch der Standort erscheinen.
- F: Welche SVERWEIS-Formel liefert in B2 den Standort zur Inventarnummer in A2? | A: =SVERWEIS(A2;Inventar!$A$2:$D$500;3;FALSCH). | P: 2
- F: Für Nummern, die es nicht gibt, erscheint #NV. Wie zeigen Sie stattdessen „nicht inventarisiert“ an? | A: =WENNFEHLER(SVERWEIS(…);"nicht inventarisiert") oder XVERWEIS mit Argument wenn_nicht_gefunden. | P: 2
- F: Nachdem eine Spalte im Inventar gelöscht wurde, zeigt die Formel #BEZUG!. Warum? | A: Der Spaltenindex 3 liegt nun außerhalb der kleineren Matrix bzw. der Bezug zeigt auf gelöschte Zellen. | P: 2
- F: Wie berechnen Sie das Gerätealter in vollen Jahren? | A: =DATEDIF(D2;HEUTE();"Y"). | P: 2

## Quiz
? Welche Formel sucht die Artikelnummer aus A2 exakt und liefert die 3. Spalte?
* =SVERWEIS(A2;$F$2:$I$50;3;FALSCH)
- =SVERWEIS(A2;$F$2:$I$50;3;WAHR)
- =SVERWEIS(3;$F$2:$I$50;A2;FALSCH)
- =SVERWEIS($F$2:$I$50;A2;3;FALSCH)
! Reihenfolge: Kriterium; Matrix; Spaltenindex; FALSCH für exakt.

? SVERWEIS liefert #NV. Was ist die wahrscheinlichste Ursache?
* Das Suchkriterium kommt in der ersten Spalte nicht vor
- Die Spalte ist zu schmal
- Es wurde durch null geteilt
- Der Spaltenindex ist größer als die Anzahl der Zeilen der Matrix
! #NV = nicht verfügbar; oft auch Zahl-als-Text-Problem.

? Welche Funktion kann ohne Hilfskonstruktion nach links nachschlagen?
* XVERWEIS
- SVERWEIS
- WVERWEIS
- ZÄHLENWENN
! XVERWEIS trennt Such- und Rückgabematrix.

? A1 = 01.03.2026, B1 = 15.03.2026. Was ergibt =B1-A1 im Zahlenformat?
* 14
- 15
- 0,5
- #WERT!
! Daten sind fortlaufende Zahlen, die Differenz ist die Anzahl der Tage.

? Welcher Fehler erscheint, wenn eine referenzierte Zeile gelöscht wurde?
* #BEZUG!
- #NV
- #NAME?
- #ZAHL!
! Englisch #REF! – der Bezug ist ungültig geworden.

? Was liefert =VERGLEICH("Maus";A1:A5;0), wenn „Maus“ in A4 steht?
* 4
- A4
- Maus
- WAHR
! VERGLEICH gibt die Position im Bereich zurück, nicht den Inhalt.

? Was passiert bei SVERWEIS ohne viertes Argument?
* Es wird ungefähr gesucht, die erste Spalte muss sortiert sein
- Es wird immer exakt gesucht
- Es entsteht automatisch #NV
- Excel fragt beim ersten Ausführen in einem Dialog nach dem gewünschten Suchmodus
! Weggelassen entspricht WAHR – eine häufige Fehlerquelle.

? Wie speichert Excel die Uhrzeit 06:00?
* 0,25
- 6
- 0,6
- 600
! Ein Tag = 1, sechs Stunden = ein Viertel.

? Welche Funktion addiert 36 Monate zu einem Kaufdatum?
* EDATUM
- HEUTE
- TAGE
- JETZT
! EDATUM (EDATE) verschiebt ein Datum um ganze Monate.

? Welcher Fehler entsteht bei =A1/B1, wenn B1 leer ist?
* #DIV/0!
- #NV
- #WERT!
- #BEZUG!
! Leere Zellen zählen als 0.

? In welcher Spalte sucht SVERWEIS das Suchkriterium?
* In der ersten Spalte der angegebenen Matrix
- In Spalte A des Arbeitsblatts
- In der Spalte des Spaltenindex
- In allen Spalten der Matrix nacheinander von links nach rechts bis zum ersten Treffer
! Die Matrix kann z. B. bei F beginnen – dann wird in F gesucht.
