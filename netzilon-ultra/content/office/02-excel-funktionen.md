---
id: office-excel-funktionen
bereich: AP1
block: OF
kapitel: Office (Tabellenkalkulation & Textverarbeitung)
titel: Excel-Funktionen – SUMME, MITTELWERT, WENN, UND/ODER, ZÄHLENWENN, SUMMEWENN, RUNDEN
stufe: Einsteiger
fach: Office (EF)
pruefungen: [AP1, Schule]
quellen: [Microsoft-Support – Excel/Word]
verweise: [office-excel-grundlagen, office-excel-nachschlagen-datum]
---

## Profi

### Aufbau einer Funktion
`=FUNKTIONSNAME(Argument1;Argument2;…)` – Argumente sind Werte, Bezüge, Bereiche, Text in Anführungszeichen oder andere Funktionen (**Verschachtelung**, bis 64 Ebenen). Einfügen über **fx** (Funktion einfügen) oder Formeln → Funktionsbibliothek. Die deutschen Namen sind lokalisiert; eine englische Datei wird beim Öffnen automatisch übersetzt.

### Statistische Grundfunktionen
| Deutsch (Englisch) | Zweck | Beispiel |
|---|---|---|
| **SUMME** (SUM) | addiert | `=SUMME(B2:B20)` |
| **MITTELWERT** (AVERAGE) | arithmetisches Mittel, leere Zellen und Text werden ignoriert, **0 zählt mit** | `=MITTELWERT(C2:C20)` |
| **MIN / MAX** (MIN/MAX) | kleinster / größter Wert | `=MAX(D2:D20)` |
| **ANZAHL** (COUNT) | zählt Zellen mit **Zahlen** | `=ANZAHL(A2:A50)` |
| **ANZAHL2** (COUNTA) | zählt **nicht leere** Zellen | `=ANZAHL2(A2:A50)` |
| **ANZAHLLEEREZELLEN** (COUNTBLANK) | zählt leere Zellen | |

**AutoSumme** (Alt+=) fügt SUMME mit vorgeschlagenem Bereich ein.

### Logik: WENN, UND, ODER
`=WENN(Prüfung;Dann_Wert;Sonst_Wert)` (IF). Beispiel: `=WENN(C2>=50;"bestanden";"nicht bestanden")`.

**Verschachteltes WENN** für mehrere Stufen – Bedingungen **von der strengsten zur schwächsten** ordnen:
`=WENN(B2>=92;1;WENN(B2>=81;2;WENN(B2>=67;3;WENN(B2>=50;4;WENN(B2>=30;5;6)))))` (IHK-Notenschlüssel). Alternative ab Excel 2019/365: **WENNS** (IFS): `=WENNS(B2>=92;1;B2>=81;2;…;WAHR;6)`.

**UND** (AND) ist WAHR, wenn **alle** Bedingungen wahr sind; **ODER** (OR), wenn **mindestens eine** wahr ist; **NICHT** (NOT) kehrt um. Sie stehen meist **innerhalb** von WENN:
`=WENN(UND(B2>=50;C2>=50);"bestanden";"nicht bestanden")`
`=WENN(ODER(D2="defekt";E2>5);"austauschen";"ok")`

**WENNFEHLER** (IFERROR) fängt Fehlerwerte ab: `=WENNFEHLER(A2/B2;0)`.

### Bedingtes Zählen und Summieren
- **ZÄHLENWENN** (COUNTIF): `=ZÄHLENWENN(Bereich;Kriterium)` – z. B. `=ZÄHLENWENN(D2:D100;"Notebook")`, `=ZÄHLENWENN(E2:E100;">=1000")`, Kriterium aus Zelle: `">"&G1`.
- **SUMMEWENN** (SUMIF): `=SUMMEWENN(Kriterienbereich;Kriterium;Summenbereich)` – z. B. `=SUMMEWENN(D2:D100;"Monitor";F2:F100)`.
- Mehrere Kriterien: **ZÄHLENWENNS** (COUNTIFS), **SUMMEWENNS** (SUMIFS) – Achtung: bei SUMMEWENNS steht der **Summenbereich zuerst**.
- Platzhalter: `*` beliebig viele Zeichen, `?` genau ein Zeichen (`"PC*"`).

### Runden
- **RUNDEN** (ROUND): `=RUNDEN(Zahl;Stellen)` – kaufmännisch (ab 5 aufrunden). `=RUNDEN(12,345;2)` → 12,35; negative Stellen runden vor dem Komma (−2 = Hunderter): `=RUNDEN(1234;-2)` → 1200.
- **AUFRUNDEN** (ROUNDUP) / **ABRUNDEN** (ROUNDDOWN): immer weg von / hin zur Null.
- **GANZZAHL** (INT) rundet auf die nächstkleinere ganze Zahl ab.
Runden per Funktion ändert den **Wert**, Runden per Zellformat nur die **Anzeige** (Rundungsdifferenzen in Summen!).

## Einfach
Funktionen sind wie **fertige Rechen-Werkzeuge** im Werkzeugkasten. Statt `=A1+A2+A3+…+A20` zu tippen, sagst du einfach `=SUMME(A1:A20)` – „zähl alles von A1 bis A20 zusammen“.

**MITTELWERT** ist der Durchschnitt, wie bei deinen Schulnoten. **MAX** findet den größten Wert, **MIN** den kleinsten.

**WENN** ist eine **Weiche** wie bei der Eisenbahn: „**Wenn** die Punkte mindestens 50 sind, **dann** schreib ‚bestanden‘, **sonst** ‚nicht bestanden‘.“ Für mehrere Stufen (Note 1 bis 6) baut man mehrere Weichen hintereinander – das ist ein **verschachteltes WENN**.

**UND** heißt: Alles muss stimmen (Hausaufgaben gemacht **und** Zimmer aufgeräumt → Fernsehen). **ODER** heißt: Eins reicht (Regen **oder** Schnee → Jacke an).

**ZÄHLENWENN** zählt nur bestimmte Dinge: „Wie viele rote Murmeln sind in der Kiste?“ **SUMMEWENN** rechnet nur bestimmte Dinge zusammen: „Wie viel haben alle Monitore zusammen gekostet?“

**RUNDEN** macht aus 12,345 € glatte 12,35 € – wie an der Kasse.

## Merksatz
- **WENN(Prüfung; Dann; Sonst) – drei Teile, zwei Semikolons.**
- **UND = alle, ODER = mindestens eine.**
- **Verschachteltes WENN: strengste Bedingung zuerst.**
- **SUMMEWENN: Wo suchen; was suchen; was addieren.**
- **RUNDEN ändert den Wert – Format nur die Optik.**

## Prüfungsfalle
- Text in WENN muss in **Anführungszeichen** stehen, Zahlen nicht.
- Verschachteltes WENN in falscher Reihenfolge (`>=50` vor `>=92`) liefert für alle guten Werte die schlechtere Note.
- **ANZAHL** zählt nur Zahlen, **ANZAHL2** alles Nicht-Leere.
- MITTELWERT ignoriert **leere** Zellen, aber **nicht Nullen**.
- Bei SUMMEWENN ist der Summenbereich das **dritte** Argument, bei SUMMEWENNS das **erste**.
- Vergleichsoperator im Kriterium immer als Text: `">=1000"`, nicht `>=1000`.

## Grafik
### Entscheidungsweg eines verschachtelten WENN
1. Punkte: Wert in B2 wird geprüft
2. B2 >= 92: ja -> Note 1
3. B2 >= 81: ja -> Note 2
4. B2 >= 67: ja -> Note 3
5. B2 >= 50: ja -> Note 4
6. B2 >= 30: ja -> Note 5, sonst Note 6

## Lab
**Maschine**: CL01.example.com (Windows 11, Excel aus Microsoft 365), Datei `Pruefung.xlsx`.

### GUI
1. **CL01**: Excel öffnen → Leere Arbeitsmappe; A1 `Name`, B1 `Teil 1`, C1 `Teil 2`, D1 `Gesamt`, E1 `Note`, F1 `Ergebnis`.
2. Zehn Namen und Punktzahlen (0–100) eintragen.
3. D2 markieren → Formeln → **AutoSumme → Mittelwert** → Bereich B2:C2 → Enter.
4. E2 → **fx** → Kategorie Logik → WENN → im Dialog verschachteln (siehe Formeln).
5. F2: `=WENN(UND(B2>=50;C2>=50);"bestanden";"nicht bestanden")`.
6. D2:F2 markieren → Ausfüllkästchen doppelklicken.
7. H2: Anzahl Bestandene mit ZÄHLENWENN; H3: Durchschnitt mit RUNDEN auf 1 Stelle.
8. Formeln → **Formelüberwachung → Formeln anzeigen** (Strg+#) zum Kontrollieren.

### Formeln
```text
D2  =MITTELWERT(B2:C2)
E2  =WENN(D2>=92;1;WENN(D2>=81;2;WENN(D2>=67;3;WENN(D2>=50;4;WENN(D2>=30;5;6)))))
F2  =WENN(UND(B2>=50;C2>=50);"bestanden";"nicht bestanden")
H2  =ZÄHLENWENN(F2:F11;"bestanden")
H3  =RUNDEN(MITTELWERT(D2:D11);1)
H4  =SUMMEWENN(F2:F11;"bestanden";D2:D11)
```

## Legende
### WENN-Funktion (IF)
- Was: Logische Funktion, die abhängig von einer Prüfung einen von zwei Werten liefert.
- Wie: =WENN(Prüfung;Dann_Wert;Sonst_Wert), bei mehreren Stufen verschachtelt oder WENNS.
- Wann: Bei Fallunterscheidungen wie bestanden/nicht bestanden, Rabatt ja/nein.
- Wo: Formeln → Logisch oder direkt in der Bearbeitungsleiste.
- Warum: Entscheidungen automatisieren statt manuell zu prüfen.
### SUMMEWENN / ZÄHLENWENN
- Was: Summieren bzw. Zählen nur der Zeilen, die ein Kriterium erfüllen.
- Beispiel: =SUMMEWENN(D:D;"Monitor";F:F) summiert alle Monitorpreise.

## Karteikarten
- F: Wie lautet der Aufbau der WENN-Funktion? | A: =WENN(Prüfung;Dann_Wert;Sonst_Wert) – englisch IF.
- F: Wann liefert UND den Wert WAHR? | A: Wenn alle Bedingungen wahr sind.
- F: Wann liefert ODER den Wert WAHR? | A: Wenn mindestens eine Bedingung wahr ist.
- F: Unterschied ANZAHL und ANZAHL2? | A: ANZAHL (COUNT) zählt nur Zahlen, ANZAHL2 (COUNTA) alle nicht leeren Zellen.
- F: Wie lautet die Syntax von SUMMEWENN? | A: =SUMMEWENN(Bereich;Kriterium;Summe_Bereich) – englisch SUMIF.
- F: Wie zählt man alle Zellen in D2:D50 mit dem Text „Notebook“? | A: =ZÄHLENWENN(D2:D50;"Notebook").
- F: Was liefert =RUNDEN(12,345;2)? | A: 12,35 (kaufmännisch gerundet, ab 5 wird aufgerundet).
- F: Was macht WENNFEHLER? | A: Liefert einen Ersatzwert, wenn eine Formel einen Fehler ergibt (IFERROR).
- F: In welcher Reihenfolge prüft man beim verschachtelten WENN mit „>=“? | A: Von der höchsten Schwelle zur niedrigsten.
- F: Welche Funktion ersetzt mehrfach verschachtelte WENN in Excel 365? | A: WENNS (IFS).
- F: Wofür steht der Platzhalter * im Kriterium? | A: Für beliebig viele Zeichen, z. B. "PC*".
- F: Was liefert =ABRUNDEN(7,9;0)? | A: 7.

## Lücken
- Die Funktion {MITTELWERT} berechnet das arithmetische Mittel (AVERAGE).
- {ODER} liefert WAHR, wenn mindestens eine Bedingung erfüllt ist.
- Bei SUMMEWENN ist das dritte Argument der {Summenbereich|Summe_Bereich}.
- Die englische Funktion COUNTIF heißt auf Deutsch {ZÄHLENWENN}.

## Zuordnen
### Deutsch – Englisch
- SUMME => SUM
- MITTELWERT => AVERAGE
- WENN => IF
- ZÄHLENWENN => COUNTIF
- SUMMEWENN => SUMIF
- RUNDEN => ROUND

## Reihenfolge
### Note aus Punkten (verschachteltes WENN) prüfen
1. Ist der Wert mindestens 92? Dann Note 1
2. Ist der Wert mindestens 81? Dann Note 2
3. Ist der Wert mindestens 67? Dann Note 3
4. Ist der Wert mindestens 50? Dann Note 4
5. Ist der Wert mindestens 30? Dann Note 5
6. Sonst Note 6

## Freitext
- F: Erstellen Sie eine Formel, die in G2 „Rabatt“ ausgibt, wenn die Menge (B2) mindestens 10 ODER der Umsatz (C2) über 5.000 € liegt, sonst „kein Rabatt“. Erläutern Sie die Funktionsweise. | M: =WENN(ODER(B2>=10;C2>5000);"Rabatt";"kein Rabatt"). ODER liefert WAHR, sobald eine Bedingung zutrifft; WENN gibt dann den Dann-Wert, sonst den Sonst-Wert aus. | P: 5

## Szenario
### Hardware-Bestellungen der Netzilon GmbH
Die Netzilon GmbH führt eine Liste der Bestellungen 2026: Spalte A Datum, B Artikelgruppe (Notebook, Monitor, Zubehör), C Menge, D Einzelpreis, E Gesamtpreis.
- F: Wie berechnen Sie den Gesamtpreis in E2? | A: =C2*D2, nach unten ausfüllen. | P: 1
- F: Wie ermitteln Sie die Summe aller Notebook-Bestellungen? | A: =SUMMEWENN(B2:B200;"Notebook";E2:E200). | P: 2
- F: Wie viele Bestellungen lagen über 1.000 €? | A: =ZÄHLENWENN(E2:E200;">1000"). | P: 2
- F: Spalte F soll „Freigabe GF“ anzeigen, wenn der Gesamtpreis über 2.500 € liegt UND es sich um Notebooks handelt. | A: =WENN(UND(E2>2500;B2="Notebook");"Freigabe GF";""). | P: 3

## Quiz
? Welche Formel gibt „ok“ aus, wenn A1 größer als 10 ist, sonst „zu klein“?
* =WENN(A1>10;"ok";"zu klein")
- =WENN(A1>10;ok;zu klein)
- =WENN("A1>10";"ok";"zu klein")
- =WENN(A1>10,"ok","zu klein")
! Text braucht Anführungszeichen, die deutsche Version trennt mit Semikolon.

? Wann liefert =UND(A1>5;B1<3) WAHR?
* Nur wenn beide Bedingungen erfüllt sind
- Wenn mindestens eine erfüllt ist
- Wenn keine erfüllt ist
- Wenn genau eine erfüllt ist
! UND verlangt, dass alle Teilbedingungen WAHR sind.

? A1:A4 enthält 4, leer, 0, 8. Was liefert =MITTELWERT(A1:A4)?
* 4
- 3
- 6
- 2
! Leere Zellen werden ignoriert, die 0 zählt: (4+0+8)/3 = 4.

? Welche Funktion zählt alle nicht leeren Zellen?
* ANZAHL2
- ANZAHL
- ZÄHLENWENN
- SUMME
! ANZAHL2 (COUNTA) zählt auch Text; ANZAHL (COUNT) nur Zahlen.

? Welche SUMMEWENN-Formel addiert alle Beträge in C für „Monitor“ in Spalte B?
* =SUMMEWENN(B:B;"Monitor";C:C)
- =SUMMEWENN(C:C;"Monitor";B:B)
- =SUMMEWENN("Monitor";B:B;C:C)
- =SUMME(B:B;"Monitor";C:C)
! Reihenfolge: Kriterienbereich; Kriterium; Summenbereich.

? Was liefert =RUNDEN(1549;-2)?
* 1500
- 1600
- 1549
- 1550
! −2 Stellen = auf Hunderter runden; 49 liegt unter 50, also abrunden.

? Warum liefert =WENN(B2>=50;4;WENN(B2>=92;1;6)) für 95 Punkte Note 4?
* Die schwächere Bedingung wird zuerst geprüft und greift schon
- WENN kann nicht verschachtelt werden
- 95 ist keine gültige Zahl
- Die Klammern sind falsch gesetzt
! Bei >= immer die höchste Schwelle zuerst prüfen.

? Welches Kriterium zählt mit ZÄHLENWENN alle Werte ab 1.000?
* ">=1000"
- >=1000
- "=>1000"
- ">1000"
! Operatoren werden als Text in Anführungszeichen übergeben; „>“ würde 1000 selbst ausschließen.

? Wie heißt RUNDEN auf Englisch?
* ROUND
- RUN
- ROUNDUP
- INT
! ROUNDUP ist AUFRUNDEN, INT ist GANZZAHL.

? Welche Formel fängt die Division durch null ab?
* =WENNFEHLER(A2/B2;0)
- =WENN(A2/B2;0)
- =RUNDEN(A2/B2;0)
- =ODER(A2/B2;0)
! WENNFEHLER (IFERROR) liefert den Ersatzwert bei jedem Fehlerwert, z. B. #DIV/0!.

? Was liefert =ODER(1>2;3>2)?
* WAHR
- FALSCH
- #WERT!
- 0
! Eine wahre Bedingung genügt bei ODER.
