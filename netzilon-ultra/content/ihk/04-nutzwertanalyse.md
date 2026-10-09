---
id: ihk-nutzwertanalyse
bereich: AP1
block: IHK
kapitel: Entscheidung und Wirtschaftlichkeit
titel: Nutzwertanalyse und Angebotsvergleich
stufe: Einsteiger
fach: PV – AP1
pruefungen: [AP1, AP2]
quellen: [AP1_Lernplan_1.pdf, 3fd94b97-AP1_Lernplan__1_.md, AP2_Masterplan_FiSi_1.0.md, 3._Beurteilen_marktgängiger_IT-Systeme_und_kundenspezifischer_Lösungen.pdf, kaufmaennisch_80.md (Abschnitt E), Abschlussprüfung_Lernzettel.pdf, Lernzettel_AP1AP2_2024.pdf]
verweise: [ihk-kalkulation, wiso-kostenrechnung, wiso-projektwirtschaft]
---

## Profi

### Zweck
Die **Nutzwertanalyse (NWA, Scoring-Modell)** bewertet Alternativen anhand mehrerer **qualitativer und quantitativer Kriterien** und führt sie auf einen Nutzwert zurück. Typischer Einsatz in AP1 und Projektdokumentation: Auswahl von Hardware, Software, Cloud vs. On-Premise, Anbietern.

### Ablauf
1. **Kriterien festlegen** (Leistung, Preis, Support, Garantie, Energieverbrauch, Skalierbarkeit, Referenzen).
2. **K.-o.-Kriterien** (Muss) prüfen: nicht erfüllt = Alternative scheidet aus. **Soll-Kriterien** gehen in die Bewertung ein.
3. **Gewichtung** je Kriterium (Summe 100 % oder Gewichte 1–5). Gewichtung ist **subjektiv** und eine Entscheidung des Auftraggebers; sie muss begründet werden.
4. **Bewertung** je Alternative (Punkte, z. B. 0–5 oder 1–10; höher = besser). Bei Kosten: günstiger = mehr Punkte.
5. **Teilnutzwert** = Gewichtung × Bewertung; **Nutzwert** = Summe der Teilnutzwerte.
6. **Rangfolge**: höchster Nutzwert gewinnt; ggf. Sensitivitätsanalyse (Gewichte ändern, bleibt Ergebnis stabil?) und Wirtschaftlichkeit/TCO ergänzen.

### Beispiel
| Kriterium | Gewicht | Angebot A Punkte | A Teil | Angebot B Punkte | B Teil |
|---|---|---|---|---|---|
| Preis | 40 % | 3 | 1,2 | 5 | 2,0 |
| Leistung | 30 % | 5 | 1,5 | 3 | 0,9 |
| Support | 20 % | 4 | 0,8 | 2 | 0,4 |
| Garantie | 10 % | 3 | 0,3 | 4 | 0,4 |
| **Summe** | 100 % | | **3,8** | | **3,7** |
Angebot A gewinnt knapp.

### Quantitativer vs. qualitativer Angebotsvergleich
Quantitativ: Preise, Rabatt, Skonto, Lieferkosten, **Gesamtkosten (TCO)**. Qualitativ: Support, Garantie, Referenzen, Lieferzeit, Nachhaltigkeit. Die Prüfung verlangt oft beides: Erst Preis auf Basis der Einstandspreise rechnen, dann die NWA.

### Fehlerquellen
Doppelt gezählte Kriterien, Gewichte ≠ 100 %, Preispunkte falsch herum, K.-o.-Kriterium vergessen, subjektive Bewertung ohne Begründung.

## Einfach

Du willst ein neues Handy kaufen und hast zwei zur Auswahl. Wie entscheidest du fair?

**Schritt 1: Was ist mir wichtig?** Preis, Kamera, Akku, Garantie. Das sind deine **Kriterien**.
**Schritt 2: Wie wichtig ist jedes?** Preis ist dir sehr wichtig (40 %), Kamera auch (30 %), Akku (20 %), Garantie (10 %). Das ist die **Gewichtung**. Alles zusammen ergibt 100 %.
**Schritt 3: Wie gut ist jedes Handy?** Du gibst Punkte von 1 bis 5 (5 = super). Das billigere Handy bekommt beim Preis mehr Punkte.
**Schritt 4: Rechnen.** Punkte × Gewichtung für jede Zeile, dann alles zusammenzählen. Wer die meisten Punkte hat, gewinnt.

**K.-o.-Kriterium:** Manchmal gibt es etwas, das MUSS stimmen: Das Handy muss in meine Hosentasche passen. Wenn nicht, fliegt es sofort raus, egal wie gut der Rest ist.

**Achtung:** Die Gewichtung ist deine Meinung. Eine andere Person hätte vielleicht andere Gewichte und andere Sieger. In der Prüfung wird das akzeptiert, solange du es **begründest**.

In der Prüfung kommt fast immer eine Tabelle mit Angeboten. Erst rechnest du manchmal die Preise aus (Rabatt, Skonto), dann die Tabelle. Schreibe jeden Teilnutzwert auf, auch wenn du den Taschenrechner benutzt.

## Merksatz
- Nutzwert = Summe(Gewichtung × Punkte).
- Erst K.-o.-Kriterien, dann Soll-Kriterien.
- Gewichtung = Entscheidung des Kunden, deshalb begründen.
- Höchster Nutzwert gewinnt (nicht der billigste).

## Prüfungsfalle
- Gewichtung muss sich auf 100 % (oder angegebene Summe) addieren.
- Bei Preis: **niedrigerer Preis = höhere Punktzahl**.
- Ergebnis immer mit **Empfehlung und Begründung** formulieren.
- Wirtschaftlichkeit (Kosten) kann ein anderes Ergebnis zeigen: Beide Sichten nennen.
- Teilnutzwerte nicht mit Gewicht als Prozent UND Faktor mischen (40 % = 0,4).

## Grafik
### Nutzwertanalyse in 4 Schritten
1. Projektteam: Kriterien und K.-o.-Kriterien festlegen
2. Auftraggeber -> Projektteam: Gewichtung der Kriterien
3. Projektteam: Punkte je Angebot vergeben
4. Projektteam: Teilnutzwerte berechnen (Gewicht × Punkte)
5. Projektteam -> Auftraggeber: Empfehlung mit höchstem Nutzwert

## Übungen
- A: Kriterien: Preis 50 % (A:4, B:2), Leistung 30 % (A:2, B:5), Support 20 % (A:3, B:4). Welches Angebot gewinnt? | L: A = 2,0 + 0,6 + 0,6 = 3,2; B = 1,0 + 1,5 + 0,8 = 3,3 → Angebot B gewinnt
- A: Nenne zwei Beispiele für K.-o.-Kriterien bei der Serverbeschaffung. | L: Mindestens 2 Netzteile (Redundanz); Rackformfaktor passt; Herstellersupport vor Ort 4 h

## Karteikarten
- F: Was ist eine Nutzwertanalyse? | A: Bewertung von Alternativen nach gewichteten Kriterien
- F: Formel Teilnutzwert? | A: Gewichtung × Bewertung (Punkte)
- F: Was ist ein K.-o.-Kriterium? | A: Muss-Kriterium; wird es nicht erfüllt, scheidet die Alternative aus
- F: Wer bestimmt die Gewichtung? | A: Der Auftraggeber bzw. das Projektteam (subjektiv, begründet)
- F: Wie bei Preis punkten? | A: Niedriger Preis ergibt hohe Punktzahl
- F: Wann gewinnt eine Alternative? | A: Bei höchstem Gesamtnutzwert
- F: Qualitative Kriterien Beispiele? | A: Support, Garantie, Referenzen
- F: Quantitative Kriterien Beispiele? | A: Preis, Leistungsdaten, Energieverbrauch
- F: Was ergänzt die NWA? | A: Wirtschaftlichkeitsrechnung (TCO, Amortisation)

## Quiz
? Wie berechnet man die Nutzwertanalyse?
* Gewichtung × Bewertung je Kriterium, Summe der Teilnutzwerte
- Nur Preisvergleich
- Durchschnitt aller Preise
- Kosten : Nutzen

? Was ist ein K.-o.-Kriterium?
* Ein Muss-Kriterium, bei dessen Nichterfüllung die Alternative ausscheidet
- Ein unwichtiges Kriterium
- Ein Kriterium mit hoher Punktzahl
- Eine Bewertung von 0

? Wie sollten Gewichtungen insgesamt zusammenpassen?
* Summe 100 % (bzw. vorgegebene Summe)
- Mindestens 200 %
- Beliebig
- Genau 10

? Welche Aussage zur Gewichtung ist richtig?
* Sie ist subjektiv und muss begründet werden
- Sie ist objektiv messbar
- Sie wird von der IHK vorgegeben
- Sie entfällt bei NWA

? Wie bewertet man den Preis in der NWA?
* Niedrigerer Preis ergibt höhere Punkte
- Höherer Preis ergibt höhere Punkte
- Preis wird nicht bewertet
- Preis zählt doppelt

? Preis 50 %, A:4 B:2; Leistung 50 %, A:2 B:5. Welches Angebot gewinnt?
* B (3,5 gegenüber 3,0)
- A (3,5 gegenüber 3,0)
- Gleichstand
- Keines

? Welcher Schritt kommt in der NWA zuerst?
* Kriterien festlegen
- Rangfolge bilden
- Punkte summieren
- Empfehlung schreiben

? Welche zusätzliche Analyse sichert eine NWA-Entscheidung ab?
* Sensitivitätsanalyse
- Break-even-Analyse für Stromkosten
- ABC-Analyse
- SWOT-Analyse
