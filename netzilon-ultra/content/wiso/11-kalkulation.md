---
id: wiso-kalkulation
bereich: WiSo
block: WiSo
kapitel: Betriebswirtschaft
titel: Kalkulation – Einkauf, Selbstkosten, Verkaufspreis, Skonto und Rabatt
stufe: Fortgeschritten
fach: WiSo
pruefungen: [AP1, AP2]
quellen: [kaufmaennisch_80.md (Abschnitt E), Gratzke_Hauser_Patett_Ringhand_IT_Berufe_Grundstufe_Lernfelder_1.pdf, Lernzettel_AP1AP2_2024.pdf (Berechnungen), Abschlussprüfung_Lernzettel.pdf]
verweise: [wiso-steuern-ust, wiso-kennzahlen, wiso-kostenrechnung, ihk-kalkulation]
---

## Profi

### Bezugskalkulation (Einkauf, vorwärts)
```
  Listeneinkaufspreis (netto)
− Liefererrabatt
= Zieleinkaufspreis
− Liefererskonto
= Bareinkaufspreis
+ Bezugskosten (Fracht, Verpackung, Versicherung)
= Einstandspreis (Bezugspreis)
```
Beispiel: 1.000 € − 10 % Rabatt = 900 € (Ziel); − 2 % Skonto (18 €) = 882 € (Bar); + 30 € Bezugskosten = **912 €** Einstandspreis.

### Handelskalkulation (Verkauf, vorwärts)
```
  Einstandspreis
+ Handlungskostenzuschlag (z. B. 20 %)
= Selbstkostenpreis
+ Gewinnzuschlag (z. B. 10 %)
= Barverkaufspreis
+ Kundenskonto (im Hundert) + Vertreterprovision (im Hundert)
= Zielverkaufspreis
+ Kundenrabatt (im Hundert)
= Listenverkaufspreis (netto)
+ Umsatzsteuer 19 %
= Bruttoverkaufspreis
```
**Achtung:** Skonto, Rabatt und Provision werden vom **Zielverkaufs- bzw. Listenpreis** berechnet („auf Hundert“): Barverkaufspreis = 100 % − Skonto % ... Beispiel: Skonto 2 %: Bar = 98 % des Ziels, Ziel = Bar : 0,98.

### Rückwärts- und Differenzkalkulation
- **Rückwärtskalkulation**: vom Marktpreis (Listenverkaufspreis) rückwärts zum höchstzulässigen Einstandspreis.
- **Differenzkalkulation**: Vergleich von Verkaufspreis und Selbstkosten, Ergebnis ist der **Gewinn bzw. die Gewinnspanne**.
- **Kalkulationszuschlag**, **Kalkulationsfaktor** (z. B. 1,45) und **Handelsspanne** = (Listenverkaufspreis − Einstandspreis) : Listenverkaufspreis.

### IT-Dienstleistung: Stundensatz
Stundensatz = (Personalkosten + Gemeinkosten + Gewinn) : produktive Stunden. Produktive Stunden < Arbeitsstunden (Urlaub, Krankheit, Schulung). Angebotspreis = Stunden × Stundensatz + Material (Hardware, Lizenzen) + ggf. Reisekosten.

### Skonto vs. Kredit
Skonto 2 % bei Zahlung in 10 Tagen statt 30 Tagen entspricht einem Jahreszins von ca. 2 % × 360 : 20 ≈ **36 %**, meist günstiger als Kontokorrentkredit → Skonto nutzen.

### Umsatzsteuer
Netto × 1,19 = Brutto; Brutto : 1,19 = Netto (siehe `wiso-steuern-ust`).

## Einfach

Kalkulieren heißt: **Wie viel muss ich verlangen, damit am Ende etwas übrig bleibt?** Stell dir vor, du kaufst Spielkarten in großen Mengen und verkaufst sie weiter.

**Einkauf:** Die Karten kosten laut Liste 1.000 €. Der Großhändler schenkt dir 10 % Mengenrabatt (Rabatt = Preisnachlass fürs Viel-Kaufen). Das sind noch 900 €. Wenn du schnell zahlst, gibt es 2 % Skonto (Skonto = Belohnung fürs schnelle Bezahlen). Jetzt sind es 882 €. Dann kommt noch der Postweg dazu: +30 € Fracht. Ergebnis: **912 € Einstandspreis**. Das ist dein echter Einkaufspreis.

**Verkauf:** Zu den 912 € kommt dein Anteil für Miete, Strom, Verpackung usw. (Handlungskosten), z. B. 20 %. Dann kommt dein Gewinn dazu. Danach denkst du daran, dass dein Kunde auch Skonto und Rabatt verlangt, also muss der Preis höher sein. Zum Schluss packst du 19 % Mehrwertsteuer drauf, die du aber ans Finanzamt weiterleiten musst. Sie gehört dir nicht.

**Warum Rechnen wie eine Treppe?** Jede Zeile baut auf der vorherigen auf. In der Prüfung: Immer das Schema hinschreiben, dann Zeile für Zeile rechnen, Zwischenergebnisse notieren. Auch bei falschem Endergebnis gibt es so Punkte für den Rechenweg.

**Vorwärts** = vom Einkauf zum Verkauf (mit Aufschlägen). **Rückwärts** = vom Marktpreis zum Einkaufspreis (mit Abzügen).

## Merksatz
- Einkauf: **L**ieferer-**R**abatt, **S**konto, **B**ezugskosten (Rabatt kommt zuerst, dann Skonto, dann Fracht).
- Rabatt und Skonto werden immer vom **vorherigen Zwischenwert** abgezogen, nicht vom Listenpreis.
- Brutto : 1,19 = Netto. Nie einfach 19 % abziehen.
- Vorwärts mit Zuschlag, rückwärts mit Abzug auf Hundert.

## Prüfungsfalle
- Skonto ist **nach** Rabatt zu rechnen (vom Zieleinkaufspreis), nicht vom Listenpreis.
- Bezugskosten werden **nach** Skonto addiert und sind nicht skontierfähig.
- Im Verkauf werden Skonto und Rabatt „auf Hundert“ gerechnet (Divisor 0,98 / 0,90), nicht einfach mit 1,02 multipliziert.
- Umsatzsteuer ist durchlaufender Posten, kein Kostenbestandteil.
- Aufgabenstellung beachten: netto oder brutto gefragt?

## Grafik
### Bezugskalkulation
1. Lieferer -> Einkauf: Listenpreis 1.000 €
2. Einkauf: − 10 % Rabatt = 900 € Zieleinkaufspreis
3. Einkauf: − 2 % Skonto = 882 € Bareinkaufspreis
4. Spediteur -> Einkauf: + 30 € Bezugskosten
5. Einkauf: = 912 € Einstandspreis

## Übungen
- A: Listeneinkaufspreis 2.500 €, Rabatt 20 %, Skonto 3 %, Bezugskosten 80 €. Einstandspreis? | L: 2.500 − 500 = 2.000; − 3 % (60) = 1.940; + 80 = 2.020 €
- A: Einstandspreis 2.020 €, Handlungskosten 25 %, Gewinn 10 %. Barverkaufspreis? | L: 2.020 × 1,25 = 2.525 (Selbstkosten); × 1,10 = 2.777,50 €
- A: Bruttopreis 1.190 €. Nettopreis und USt? | L: 1.190 : 1,19 = 1.000 € netto; USt 190 €

## Karteikarten
- F: Schema Bezugskalkulation? | A: Listenpreis − Rabatt = Ziel; − Skonto = Bar; + Bezugskosten = Einstandspreis
- F: Schema Handelskalkulation? | A: Einstandspreis + Handlungskosten = Selbstkosten; + Gewinn = Barverkaufspreis; + Skonto/Provision = Zielverkaufspreis; + Rabatt = Listenverkaufspreis; + USt = Brutto
- F: Was ist der Einstandspreis? | A: Tatsächlicher Einkaufspreis inklusive Bezugskosten
- F: Skonto vs. Rabatt? | A: Skonto: Nachlass bei schneller Zahlung; Rabatt: Preisnachlass (Menge, Treue, Aktion)
- F: Brutto zu Netto bei 19 %? | A: Brutto : 1,19
- F: Netto zu Brutto bei 19 %? | A: Netto × 1,19
- F: Was ist Rückwärtskalkulation? | A: Vom Marktpreis zurück zum maximal zulässigen Einstandspreis
- F: Was ist die Handelsspanne? | A: (Listenverkaufspreis − Einstandspreis) : Listenverkaufspreis
- F: Warum sind Skonto und Rabatt „im Hundert“? | A: Sie beziehen sich auf den höheren Preis, daher Division durch (1 − Prozentsatz)
- F: Wann lohnt sich Skonto? | A: Fast immer, 2 % in 20 Tagen entspricht ca. 36 % Jahreszins

## Quiz
? Wie lautet die Reihenfolge der Bezugskalkulation?
* Listenpreis − Rabatt − Skonto + Bezugskosten
- Listenpreis + Bezugskosten − Rabatt − Skonto
- Listenpreis − Skonto − Rabatt + Bezugskosten
- Listenpreis + Gewinn − Rabatt

? Listenpreis 1.000 €, 10 % Rabatt, 2 % Skonto, 30 € Bezugskosten. Einstandspreis?
* 912,00 €
- 900,00 €
- 960,00 €
- 970,00 €
! 900 − 18 = 882, + 30 = 912.

? Was gehört zu den Selbstkosten?
* Einstandspreis + Handlungskosten
- Einstandspreis + Gewinn
- Barverkaufspreis − Skonto
- Nettoverkaufspreis

? Nettopreis 500 €, USt 19 %. Bruttopreis?
* 595 €
- 519 €
- 590 €
- 605 €

? Bruttopreis 357 €, 19 % USt enthalten. Nettopreis?
* 300 €
- 289,17 €
- 338 €
- 321,30 €

? Was ist Skonto?
* Preisnachlass bei schneller Zahlung
- Preisnachlass bei Mengenabnahme
- Zuschlag für Lieferung
- Mahngebühr

? Worauf wird in der Bezugskalkulation der Skonto berechnet?
* Auf den Zieleinkaufspreis
- Auf den Listeneinkaufspreis
- Auf den Einstandspreis
- Auf den Bruttopreis

? Was ist die Differenzkalkulation?
* Vergleich von Verkaufspreis und Selbstkosten zur Ermittlung des Gewinns
- Berechnung des Einstandspreises
- Berechnung der Umsatzsteuer
- Berechnung der Abschreibung
