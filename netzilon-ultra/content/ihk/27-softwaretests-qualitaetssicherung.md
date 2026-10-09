---
id: ihk-softwaretests-qs
bereich: Prüfung
block: IHK
kapitel: Projekt und Entwicklung
titel: Softwaretests und Qualitätssicherung – Black-/White-Box, Äquivalenzklassen, Grenzwerte, Teststufen, Coverage
stufe: Fortgeschritten
fach: PV – AP2
pruefungen: [AP2]
quellen: [Software-Tests-Qualitaetssicherung.md (Obsidian v2), Softwarequalitaet-Testen.md (v1), Lernzettel_AP1AP2_2024.pdf, 5._Durchführen_und_Dokumentieren_von_qualitätssichernden_Maßnahmen.pdf]
verweise: [ihk-requirements-vorgehensmodelle, ihk-oop-grundlagen, ihk-algorithmen-suchen-sortieren]
---

## Profi

### Statisch und dynamisch
**Statische Verfahren** prüfen Code oder Dokumente **ohne Ausführung** (Code-Review, Inspektion, Walkthrough, Schreibtischtest). **Dynamische Verfahren** führen die Software aus (Unit-, Integrations-, Systemtest). Der **Schreibtischtest** (desk check) spielt den Computer auf Papier nach; Ergebnis ist die Trace-Tabelle mit Variablenwerten je Schritt (z. B. `sum` nach i=1,2,3: 1, 3, 6).

### Black-Box vs. White-Box
| | Black-Box | White-Box |
|---|---|---|
| Quellcode bekannt | nein | ja |
| Testbasis | Spezifikation | Code/Kontrollfluss |
| Sicht | WAS tut es (von außen) | WIE tut es das (von innen) |
| Wer | Tester/QA, Kunde | Entwickler |
| Findet | falsche/fehlende Funktionen | toten Code, nicht durchlaufene Zweige |

Black-Box-Methoden: Äquivalenzklassen, Grenzwertanalyse, Zustandsübergänge, Entscheidungstabellen, anwendungsfallbasiert, Extremwerte.
White-Box-**Überdeckung:** C0 Anweisungsüberdeckung (jede Anweisung 1×), C1 Zweigüberdeckung (jeder Zweig true UND false), C2 Pfadüberdeckung (alle Pfade, meist unpraktikabel). 100 % C1 ⇒ 100 % C0, nicht umgekehrt. Berechnung: C0 = durchlaufene Anweisungen / alle × 100 (8 von 10 = 80 %); C1 = durchlaufene Zweige / alle (4 von 6 ≈ 66,7 %). **Unit-Test ist eine Teststufe, White-Box ein Verfahren** – kein Synonym.

### Äquivalenzklassen und Grenzwerte
Vorgehen: Eingabebereiche erkennen → gültige UND ungültige Klassen bilden → pro Klasse einen Repräsentanten → Grenzwerte (direkt unter, auf, direkt über der Grenze).
Beispiel „Alter 18 bis 65“: ÄK1 <18 ungültig, ÄK2 18–65 gültig, ÄK3 >65 ungültig. Repräsentanten 10, 40, 80. Grenzwerte 17 (ungültig), 18, 19, 64, 65, 66 (ungültig). Entscheidend sind die ungültigen Nachbarn **17 und 66**. Bei Dezimalzahlen sind die Nachbarn 17,99 / 18,01 usw.

### Teststufen (Testpyramide)
| Stufe | Wer | Objekt |
|---|---|---|
| Unit-/Komponententest | Entwickler | einzelne Methode/Klasse, isoliert mit Mocks |
| Integrationstest | Entwickler/QA | Schnittstellen zwischen getesteten Komponenten |
| Systemtest | unabhängiges QA-Team | Gesamtsystem gegen Lastenheft/Spezifikation |
| E2E-Test | QA | kompletter Geschäftsprozess über alle Systeme, keine Mocks |
| Abnahmetest | Auftraggeber | System gegen Akzeptanzkriterien, formale Freigabe |

Viele schnelle Unit-Tests unten, wenige teure E2E-/Abnahmetests oben. **Mock** = Attrappe für eine Abhängigkeit (Datenbank, API), **Stub** liefert feste Antworten, **Treiber** ruft die Testobjekte auf.

### Weitere Begriffe
- **TDD** (test-driven development): erst Test schreiben (rot), dann implementieren (grün), dann aufräumen (refactor).
- **Regressionstest:** bestehende Tests nach Änderungen wiederholen. **Smoke-Test:** schnelle Grundprüfung nach dem Build.
- **Debugging:** Fehler lokalisieren und beheben, Breakpoints, Einzelschritt.
- **Testprotokoll** (Soll/Ist) und **Abnahmeprotokoll** (rechtlich bindende Freigabe).
- **Coverage** (Überdeckungsgrad): Anteil des durch Tests ausgeführten Codes.

## Einfach

Stell dir vor, du hast einen Toaster gebaut und willst wissen, ob er funktioniert.

**Black-Box:** Du kennst nur die Bedienungsanleitung: „Brot rein, Hebel runter, Toast kommt raus.“ Du probierst es mit Brot, ohne Brot, mit zwei Scheiben aus – aber du schaust nicht in den Toaster. **White-Box:** Du schraubst ihn auf und prüfst jeden Draht und jede Verbindung, ob Strom darüber fließt.

**Äquivalenzklassen:** Wenn ein Schild sagt „Eintritt ab 18 bis 65“, reicht es, einen 10-Jährigen, einen 40-Jährigen und einen 80-Jährigen zu testen – alle in derselben Gruppe verhalten sich gleich. **Grenzwerte:** Aber die gemeinen Fehler stecken an der Kante: Was passiert mit 17, 18, 65 und 66? Die Türsteher machen genau dort die Fehler, darum testen wir dort besonders.

**Teststufen** wie beim Auto:
- Unit-Test: Du prüfst eine Schraube allein.
- Integrationstest: Passen Motor und Getriebe zusammen?
- Systemtest: Das ganze Auto auf der Teststrecke.
- E2E: Fahrt vom Haus zur Arbeit mit Navi, Tankstelle und Parkhaus.
- Abnahmetest: Der Kunde fährt Probe und unterschreibt.

**Mock:** Ein Stuntdouble – du testest die Szene, ohne den echten Schauspieler (die Datenbank) zu brauchen. **Regressionstest:** Nach jeder Reparatur prüfst du noch einmal, ob das Licht noch geht. **TDD:** Erst die Prüfaufgabe stellen, dann die Lösung bauen.

## Merksatz
- Black-Box: Spezifikation. White-Box: Code.
- Bei Grenzwerten immer unten drunter und oben drüber testen (17 und 66).
- C0 < C1 < C2 (Anweisung < Zweig < Pfad).
- Unit = Stufe, White-Box = Verfahren.
- Pyramide: unten viele billige, oben wenige teure Tests.
- Review = Produkt, Retro = Prozess (aus Scrum, nicht verwechseln mit Test-Review).

## Prüfungsfalle
- Nur 18, 40, 65 als Testfälle: ungültige Nachbarn 17 und 66 vergessen.
- Gültig/ungültig vertauschen (< vs. ≤ beachten).
- Integrationstest mit Systemtest verwechseln.
- Unit-Test mit White-Box gleichsetzen.
- 100 % C0 als vollständiges Testen werten – ein else-Zweig kann ungetestet sein.
- Systemtest und E2E-Test verwechseln (E2E ohne Mocks mit allen Fremdsystemen).
- Testen beweist nie die Fehlerfreiheit, es zeigt nur Fehler auf.
- Abnahmeprotokoll ohne Unterschrift/Datum ist wertlos.

## Grafik
### Teststufen aufwärts
1. Entwickler -> Unit-Test: Methode isoliert prüfen
2. Unit-Test -> Integrationstest: Komponenten zusammenstecken
3. Integrationstest -> Systemtest: Gesamtsystem prüfen
4. Systemtest -> E2E-Test: Geschäftsprozess mit allen Systemen
5. E2E-Test -> Auftraggeber: Abnahmetest und Abnahmeprotokoll

### Grenzwertanalyse Alter 18–65
1. Tester: Gültiger Bereich 18 bis 65
2. Tester -> System: Alter 17 eingeben, erwartet ungültig
3. Tester -> System: Alter 18 eingeben, erwartet gültig
4. Tester -> System: Alter 65 eingeben, erwartet gültig
5. Tester -> System: Alter 66 eingeben, erwartet ungültig

## Übungen
- A: Bilden Sie Testfälle für „Rabatt 5 % ab 50 €, 10 % ab 200 €“ (Grenzwerte). | L: 49,99 (0 %), 50,00 (5 %), 199,99 (5 %), 200,00 (10 %); ungültig: negative Beträge
- A: Von 12 Anweisungen werden 9 durchlaufen. C0? | L: 9/12 = 75 %
- A: Welche Teststufe führt der Kunde durch? | L: Abnahmetest anhand der Akzeptanzkriterien

## Lücken
- Beim {Black-Box}-Test wird nur die Spezifikation betrachtet, beim {White-Box}-Test der Quellcode.
- Die Testfälle an den Rändern des Bereichs nennt man {Grenzwertanalyse}.
- {Mocks} ersetzen im Unit-Test Abhängigkeiten wie eine Datenbank.
- Bei TDD wird der Test {vor} der Implementierung geschrieben.

## Zuordnen
### Teststufe zu Verantwortlichem
- Unit-Test => Entwickler
- Systemtest => unabhängiges QA-Team
- Abnahmetest => Auftraggeber
- Integrationstest => Entwickler/QA, Fokus Schnittstellen

## Reihenfolge
### Vorgehen Äquivalenzklassentest
1. Eingabebereiche aus der Spezifikation erkennen
2. Gültige und ungültige Äquivalenzklassen bilden
3. Pro Klasse einen Repräsentanten wählen
4. Grenzwerte ergänzen
5. Testfälle mit Soll-Ergebnis protokollieren

## Freitext
- F: Erläutern Sie den Unterschied zwischen Black-Box- und White-Box-Test. | M: Black-Box prüft das Verhalten anhand der Spezifikation ohne Kenntnis des Codes; White-Box nutzt die Codestruktur (Anweisungen, Zweige, Pfade) und wird meist vom Entwickler durchgeführt. | P: 4
- F: Nennen Sie Testfälle für die Eingabe „Alter von 18 bis 65 Jahren“. | M: Ungültig: 17, 66; gültig: 18, 19, 40, 64, 65; Repräsentanten ungültig: 10, 80. | P: 4
- F: Warum sind Regressionstests nach Änderungen wichtig? | M: Änderungen können bestehende Funktionen unbeabsichtigt beschädigen; wiederholte Tests decken das früh auf. | P: 2

## Spickzettel
- Statisch: ohne Ausführung (Review, Schreibtischtest)
- Dynamisch: mit Ausführung
- Black-Box Spezifikation, White-Box Code
- C0 Anweisung, C1 Zweig, C2 Pfad
- Grenzwerte: 17, 18, 65, 66
- Stufen: Unit, Integration, System, E2E, Abnahme
- Mock = Attrappe, TDD = Test zuerst
- Regression / Smoke

## Karteikarten
- F: Was ist ein statisches Testverfahren? | A: Prüfung ohne Programmausführung, z. B. Review, Inspektion, Schreibtischtest
- F: Was ist ein Schreibtischtest? | A: Manuelles Nachvollziehen des Ablaufs auf Papier mit Trace-Tabelle
- F: Worin liegt der Unterschied zwischen Black-Box und White-Box? | A: Black-Box nutzt nur die Spezifikation, White-Box die Codestruktur
- F: Was bedeutet C1-Überdeckung? | A: Jeder Zweig (true und false jeder Entscheidung) wird mindestens einmal durchlaufen
- F: Wie berechnet man C0? | A: durchlaufene Anweisungen / alle Anweisungen × 100
- F: Welche Testfälle ergibt die Grenzwertanalyse für 18 bis 65? | A: 17, 18, 19, 64, 65, 66
- F: Wer führt den Abnahmetest durch? | A: Der Auftraggeber/Endnutzer
- F: Was ist ein Mock? | A: Attrappe für eine Abhängigkeit zur Isolierung im Unit-Test
- F: Was bedeutet TDD? | A: Test-Driven Development – erst Test, dann Code (Red-Green-Refactor)
- F: Was ist ein Regressionstest? | A: Wiederholung vorhandener Tests nach einer Änderung
- F: Was ist ein Smoke-Test? | A: Schnelle Prüfung der Grundfunktionen nach einem Build
- F: Was unterscheidet Systemtest und E2E-Test? | A: Systemtest prüft das eigene System, E2E den kompletten Geschäftsprozess mit allen Fremdsystemen ohne Mocks

## Quiz
? Welche Testfälle sind für den Bereich 18 bis 65 (Ganzzahl) die wichtigsten ungültigen Grenzwerte?
* 17 und 66
- 18 und 65
- 0 und 100
- 40 und 41
! Die Nachbarn außerhalb der Grenzen sind prüfungsentscheidend.

? Was prüft ein Black-Box-Test?
* Verhalten anhand der Spezifikation ohne Kenntnis des Codes
- Jede Anweisung im Code
- Nur die Hardware
- Die Dokumentation
! White-Box nutzt den Code.

? Welche Überdeckung verlangt, dass jeder Zweig true und false durchlaufen wird?
* C1 Zweigüberdeckung
- C0 Anweisungsüberdeckung
- C2 Pfadüberdeckung
- C3 Datenüberdeckung
! C1 impliziert C0.

? 8 von 10 Anweisungen werden durchlaufen. Wie hoch ist C0?
* 80 %
- 8 %
- 20 %
- 100 %
! 8/10 × 100.

? Was ist ein Unit-Test?
* Test einer einzelnen Methode oder Klasse isoliert
- Test des gesamten Geschäftsprozesses
- Kundenabnahme
- Lasttest der Hardware
! Er ist eine Teststufe, kein Verfahren.

? Wer führt den Abnahmetest durch?
* Der Auftraggeber
- Der Entwickler
- Der Compiler
- Die IHK
! Er prüft gegen Akzeptanzkriterien.

? Was ist der Zweck eines Mocks?
* Eine Abhängigkeit im Test durch eine Attrappe ersetzen
- Code verschlüsseln
- Speicher freigeben
- Fehler beheben
! Z. B. Datenbank oder API.

? Was beschreibt TDD?
* Tests werden vor der Implementierung geschrieben
- Tests entfallen
- Nur der Kunde testet
- Tests nur am Projektende
! Red – Green – Refactor.

? Was prüft ein Regressionstest?
* Dass bestehende Funktionen nach einer Änderung weiter funktionieren
- Die Netzwerkgeschwindigkeit
- Nur neue Funktionen
- Die Benutzerfreundlichkeit
! Wiederholung vorhandener Tests.

? Was ist der Unterschied Integrationstest vs. Systemtest?
* Integration prüft das Zusammenspiel der Komponenten, System das komplette Produkt gegen die Anforderungen
- Beides ist identisch
- Integration ist die Kundenabnahme
- System testet nur die Datenbank
! Häufigste Verwechslung.
