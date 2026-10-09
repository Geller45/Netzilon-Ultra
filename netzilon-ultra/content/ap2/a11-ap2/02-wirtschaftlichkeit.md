---
id: ap2-wirtschaftlichkeit
bereich: AP2
block: A11
kapitel: Wirtschaftlichkeit
titel: Wirtschaftlichkeit (Kalkulation, Nutzwertanalyse, Amortisation, Break-even, TCO)
stufe: Fortgeschritten
quellen: [IHK-Prüfungskatalog]
verweise: [ap2-beschaffung, ap2-projektmanagement]
---

## Profi

### Kostenarten
| Art | Beispiel |
|---|---|
| **Fixe Kosten** | Miete, Leasingrate, Lizenzabo – **unabhängig von Menge** |
| **Variable Kosten** | Strom je Stunde, Material je Stück |
| **Einzelkosten** | Direkt einem Produkt/Projekt zurechenbar |
| **Gemeinkosten** | Verwaltung, Heizung – per **Zuschlag** verteilt |
| **Einmalige Kosten** | Anschaffung, Installation, Schulung |
| **Laufende Kosten** | Wartung, Support, Energie |

### Stundensatz / Projektkosten
**Kosten = Personalstunden × Stundensatz + Sachkosten**. **Stundensatz** ≈ **(Jahresgehalt + Lohnnebenkosten + Gemeinkosten) ÷ produktive Jahresstunden**.

### Zuschlagskalkulation (Angebotspreis)
```
  Materialeinzelkosten
+ Materialgemeinkosten (%)
+ Fertigungslöhne
+ Fertigungsgemeinkosten (%)
= Herstellkosten
+ Verwaltungs-/Vertriebsgemeinkosten (%)
= Selbstkosten
+ Gewinnzuschlag (%)
= Barverkaufspreis
+ Kundenskonto (im Hundert)
= Zielverkaufspreis
+ Kundenrabatt (im Hundert)
= Listenverkaufspreis (netto)
+ 19 % USt
= Bruttopreis
```
**Im Hundert**: Skonto/Rabatt werden **vom Endwert** gerechnet → **Wert ÷ (1 − Satz)**.

### Bezugskalkulation (Einkauf)
**Listeneinkaufspreis − Rabatt = Zieleinkaufspreis − Skonto = Bareinkaufspreis + Bezugskosten (Fracht, Verpackung) = Bezugspreis (Einstandspreis)**.

### Amortisation (statisch)
**Amortisationsdauer = Investition ÷ jährliche Einsparung (bzw. Rückfluss)**.
Beispiel: **Server 12.000 €**, **spart 4.000 €/Jahr** → **3 Jahre**.

### Break-even-Point (Gewinnschwelle)
**Menge = Fixkosten ÷ (Preis − variable Kosten je Stück)**. **(Preis − variable Stückkosten) = Deckungsbeitrag**.
Beispiel: Fix **6.000 €**, Preis **50 €**, variabel **20 €** → **200 Stück**.

### Kostenvergleich (Kauf, Leasing, Cloud)
**Gesamtkosten über Laufzeit** vergleichen: **Kauf** (Anschaffung + Wartung + Strom) vs. **Leasing** (Rate × Monate) vs. **Cloud** (Nutzung × Preis). **Schnittpunkt** = **ab wann günstiger**.
Beispiel: **Kauf 3.600 € + 20 €/Monat**, **Miete 120 €/Monat** → **3.600 + 20x = 120x** → **x = 36 Monate**.

### TCO (Total Cost of Ownership)
**Alle Kosten über den Lebenszyklus**: **Anschaffung, Einrichtung, Schulung, Betrieb (Strom, Kühlung), Wartung, Support, Ausfallzeiten, Entsorgung**. **Direkte + indirekte Kosten**.

### Nutzwertanalyse
1. **Kriterien** festlegen.
2. **Gewichtung** (Summe **100 %**).
3. **Punkte** je Alternative (z. B. **1–10**).
4. **Punkte × Gewicht** → **Summe** → **höchster Nutzwert gewinnt**.

| Kriterium | Gew. | A Pkt | A gew. | B Pkt | B gew. |
|---|---|---|---|---|---|
| Preis | 40 % | 8 | 3,2 | 6 | 2,4 |
| Leistung | 35 % | 6 | 2,1 | 9 | 3,15 |
| Support | 25 % | 7 | 1,75 | 8 | 2,0 |
| **Summe** | 100 % | | **7,05** | | **7,55** → **B** |

### Abschreibung (AfA, linear)
**Jährliche AfA = Anschaffungskosten ÷ Nutzungsdauer**. **Computerhardware und Software**: **Nutzungsdauer 1 Jahr möglich** (seit 2021). **GWG** (geringwertige Wirtschaftsgüter): **bis 800 € netto sofort abschreibbar**.

### Stromkosten
**Kosten = Leistung (kW) × Stunden × Preis/kWh**.
Beispiel: **Server 400 W**, **24/7 ein Jahr**: 0,4 × 8760 = **3.504 kWh** × 0,30 € = **1.051,20 €**.

## Einfach
**Wirtschaftlichkeit** heißt: **Lohnt sich das?** **Amortisation** ist wie **ein Sparschwein**: Du bezahlst **120 €** für ein **Fahrrad** und sparst **pro Monat 30 € Busgeld** – nach **4 Monaten** hast du es „raus“. **Nutzwertanalyse** ist wie **Handy-Vergleich mit Punkten**: Was dir wichtiger ist (z. B. Akku), zählt mehr.

## Merksatz
- **Amortisation = Investition ÷ Ersparnis pro Jahr**.
- **Break-even = Fix ÷ (Preis − variabel)**.
- **Skonto/Rabatt im Verkauf: im Hundert (÷ (1 − p))**.
- **Nutzwert: Gewicht × Punkte, Summe**.
- **kW × h × €/kWh**.
- **TCO = Alles über die ganze Lebenszeit**.

## Prüfungsfalle
- **Watt nicht in kW umgerechnet** (÷ 1000).
- **Jahr = 8.760 h** (365 × 24).
- **Rabatt im Einkauf vom Listenpreis (vom Hundert)**, **im Verkauf auf den Zielpreis (im Hundert)**.
- **Netto/brutto verwechselt** (19 % USt).
- **Gewichte müssen 100 % ergeben**.
- **Einmalige und laufende Kosten** beim Vergleich **beide** berücksichtigen.

## Grafik
### Break-even
Zwei Geraden: Kosten (Start bei Fixkosten) und Erlöse (Start bei 0); Schnittpunkt markiert.

### Sparschwein
Investition als Loch, jedes Jahr füllt Ersparnis nach; nach n Jahren voll.

### Waage Nutzwert
Zwei Waagschalen mit gewichteten Punkten.

## Übungen
- A: Switch 2.400 €, spart 800 €/Jahr. Amortisation? | L: 3 Jahre.
- A: Server 250 W, 24/7, 365 Tage, 0,32 €/kWh. Kosten? | L: 0,25 × 8760 = 2190 kWh × 0,32 = 700,80 €.
- A: Selbstkosten 1.000 €, Gewinn 10 %, Skonto 2 %. Zielverkaufspreis? | L: 1.100 ÷ 0,98 = 1.122,45 €.
- A: Fixkosten 9.000 €, Preis 60 €, variabel 15 €. Break-even? | L: 9.000 ÷ 45 = 200 Stück.

## Karteikarten
- F: Formel Amortisationsdauer? | A: Investition ÷ jährliche Einsparung.
- F: Formel Break-even-Menge? | A: Fixkosten ÷ (Preis − variable Stückkosten).
- F: Was ist der Deckungsbeitrag? | A: Preis − variable Stückkosten.
- F: Was ist TCO? | A: Gesamtkosten über den gesamten Lebenszyklus.
- F: Wie viele Stunden hat ein Jahr? | A: 8.760.
- F: Bis zu welchem Nettowert ist ein GWG? | A: 800 €.
- F: Wie rechnet man Skonto im Verkauf? | A: Im Hundert: Barpreis ÷ (1 − Skontosatz).
- F: Schritte der Nutzwertanalyse? | A: Kriterien, Gewichtung, Punkte, gewichtete Summe.
- F: Einmalige Kosten Beispiele? | A: Anschaffung, Installation, Schulung.

## Quiz
? Ein NAS kostet 3.000 € und spart 1.000 € pro Jahr. Amortisation?
* 3 Jahre
- 1 Jahr
- 30 Jahre
- 0,3 Jahre

? Ein Gerät mit 500 W läuft 10 h bei 0,30 €/kWh. Kosten?
* 1,50 €
- 15 €
- 150 €
- 0,15 €

? Worauf beruht die Entscheidung in der Nutzwertanalyse?
* Summe aus Gewicht × Punkte
- Nur Preis
- Anzahl Kriterien
- Alphabetische Reihenfolge

? Fixkosten 4.000 €, Preis 30 €, variable Kosten 10 €. Break-even?
* 200 Stück
- 400 Stück
- 133 Stück
- 100 Stück

? Was ist Teil der TCO, aber nicht der Anschaffungskosten?
* Strom und Wartung
- Kaufpreis
- Listenpreis
- Rabatt

? Was ist der Unterschied zwischen fixen und variablen Kosten?
* Fixe Kosten sind unabhängig von der Menge, variable steigen mit der Menge.
- Fixe Kosten ändern sich täglich.
- Variable Kosten fallen nur einmal an.
- Es gibt keinen Unterschied.
! Beispiel fix: Miete; variabel: Material je Stück.

? Bezugspreis 800 €, Handlungskosten 25 %, Gewinn 10 %. Wie hoch ist der Barverkaufspreis?
* 1.100 €
- 1.080 €
- 1.000 €
- 1.120 €
! 800 + 200 = 1.000 Selbstkosten; + 10 % = 1.100 €.

? Was berechnet die lineare Abschreibung?
* Gleichmäßige Verteilung der Anschaffungskosten auf die Nutzungsdauer
- Den Restwert nach einem Jahr Nutzung im Gebrauchtmarkt
- Die Zinsen eines Kredits
- Die Mehrwertsteuer
! Beispiel: 3.000 € über 3 Jahre = 1.000 € pro Jahr.
