---
id: wiso-beschaffung-tco-roi
bereich: WiSo
block: WiSo
kapitel: Beschaffung und Wirtschaftlichkeit (LF 2)
titel: Handelskalkulation, ABC-Analyse, Beschaffung, TCO und ROI
stufe: Fortgeschritten
fach: WiSo
pruefungen: [AP1, Schule]
quellen: [Uebersicht.rar (LF2.html, ex.html, FS.html)]
verweise: [wiso-kalkulation, ihk-nutzwertanalyse, ihk-kalkulation, wiso-kaufvertrag]
---

## Profi

### Bezugskalkulation und Handelskalkulation
Vorwärtskalkulation (Einkauf bis Verkauf):
```
Listeneinkaufspreis
- Liefererrabatt            (Mengenrabatt)
= Zieleinkaufspreis
- Liefererskonto            (2-3 % bei Zahlung in der Skontofrist)
= Bareinkaufspreis
+ Bezugskosten              (Verpackung, Fracht, Zoll, Transportversicherung)
= Bezugspreis (Einstandspreis)
+ Handlungskostenzuschlag   (Miete, Personal, Verwaltung, Werbung)
= Selbstkostenpreis
+ Gewinnzuschlag            (Risiko, Zukunftsvorsorge)
= Barverkaufspreis
+ Kundenskonto + Vertreterprovision (in % vom Zielverkaufspreis)
= Zielverkaufspreis
+ Kundenrabatt
= Listenverkaufspreis (netto)
+ 19 % Umsatzsteuer
= Bruttoverkaufspreis
```
Wichtig: Kundenskonto und Rabatt rechnen **im Hundert**, Zuschläge auf Bezugspreis und Selbstkosten **auf Hundert**. **Rückwärtskalkulation:** Der Verkaufspreis ist vorgegeben, man rechnet zurück auf den höchstzulässigen Einkaufspreis. **Zuschlagsfaktor** = Verkaufspreis / Bezugspreis; **Handelsspanne** = (Verkaufspreis - Bezugspreis) / Verkaufspreis in %.

### Beschaffung
- **E-Procurement:** Beschaffung über das Internet und spezielle IT-Systeme (große Unternehmen mit eigenen Systemen). **Marktplatzsysteme:** KMU beschaffen auf elektronischen Marktplätzen.
- **ABC-Analyse:** A-Artikel = wenig Menge, hoher Wertanteil (Server, Notebooks): intensive Marktanalyse, Konditionen verhandeln, häufige Bestandskontrolle, optimale Bestellmenge. C-Artikel = viel Menge, kleiner Wertanteil (USB-Sticks): vereinfachte Bestellung, wenige Bestellungen im Jahr, Vorrat unkritisch. B-Artikel dazwischen.
- **Nutzwertanalyse** für qualitative Kriterien: Qualität, Folgekosten, Lieferzeit, Service, Reklamationsverhalten, Image, Konditionen (siehe `ihk-nutzwertanalyse`).
- **Vertragsarten:** Kauf, Miete, Leasing, Werkvertrag, Dienstvertrag, Mietkauf; **AGB** = vorformulierte Bedingungen für viele Verträge.

### TCO und ROI
**TCO (Total Cost of Ownership):** alle direkten und indirekten Kosten über die Nutzungsdauer (Anschaffung, Betrieb, Strom, Wartung, Support, Schulung, Entsorgung), nicht nur der Kaufpreis. **ROI (Return on Investment):** Kennzahl für die Rendite einer Einzelinvestition.
`ROI = Totalerfolg / Investitionskosten` (Totalerfolg = Gesamtrückfluss/Einsparung über die Nutzungsdauer).
**Beispiel aus der Quelle:** Warenwirtschaftssystem 10.000 EUR; jährliche Einsparung Personal 12.000 + Lager 8.000 + Zinsen 40.000 + Logistik 7.000 = 67.000 EUR; Nutzungsdauer 3 Jahre.
Korrekte Rechnung: Totalerfolg = 67.000 * 3 = 201.000 EUR; ROI = 201.000 / 10.000 = **20,1** (also 2.010 %). **Amortisationszeit** = Investition / Jahresrückfluss = 10.000 / 67.000 = 0,149 Jahre = **ca. 1,8 Monate**.
Hinweis: Die Quelle schreibt ROI = 67.000 * 3 * 100 / 10.000 = 2,01 und eine Amortisation von 17,9 Monaten. Das ist rechnerisch falsch: 67.000 * 3 / 10.000 = 20,1 (als Prozentwert 2.010 %), und die Amortisation 36 / 20,1 betrüge nur 1,8 Monate. Der Wert 2,01 ist um den Faktor 10 zu klein. In der Prüfung immer Einheit und Plausibilität prüfen: Ein System, das jährlich das Sechsfache seiner Kosten einspart, amortisiert sich in wenigen Wochen.

### Sicherheit bei Lieferung und Installation
Berufsgenossenschaften verhüten Arbeitsunfälle und Berufskrankheiten und entschädigen Verunglückte. Gefährdungsbeurteilung in IT-Bereichen: elektrisch, Brand/Explosion, Arbeitsumgebung (Klima, Licht, Fluchtwege), Mensch-Maschine-Schnittstelle. **Fünf Sicherheitsregeln** der Elektrotechnik: 1. Freischalten, 2. gegen Wiedereinschalten sichern, 3. Spannungsfreiheit feststellen, 4. Erden und kurzschließen, 5. benachbarte Teile abdecken oder abschranken.

## Einfach

Du willst ein Fahrrad weiterverkaufen und musst wissen, was es dich wirklich gekostet hat. Auf dem Preisschild steht 1.000 Euro (Liste). Der Händler gibt 10 % Mengenrabatt: Das ist der Zielpreis. Zahlst du schnell, gibt es noch 2 % Skonto (Bonus fürs schnelle Zahlen): Das ist der Barpreis. Dann kommt das Porto dazu (Bezugskosten). Jetzt weißt du, was es wirklich gekostet hat: der **Bezugspreis**. Danach rechnest du deine eigenen Kosten und Gewinn drauf, und zum Schluss die Mehrwertsteuer.

Beim **ABC-Prinzip** schaust du, wo das Geld steckt. Wenige teure Dinge (Server) beobachtest du ganz genau, viele billige Dinge (Büroklammern, USB-Sticks) bestellst du einfach auf einmal und denkst nicht lange nach.

**TCO** heißt: Das Handy kostet nicht nur 800 Euro. Dazu kommen Hülle, Versicherung, Strom und Reparatur. Alles zusammen ist der echte Preis. **ROI** fragt: Wie viel kommt am Ende heraus im Vergleich zu dem, was ich reingesteckt habe? Wenn ich 10 Euro reinstecke und 20 Euro Gewinn habe, ist der ROI 2. Eine Kennzahl ohne Einheit, die sagt: Jeder eingesetzte Euro bringt zwei Euro zurück.

Zum Schluss noch die **Fünf Sicherheitsregeln** beim Arbeiten an Strom: Erst ausschalten, dann gegen Wiedereinschalten sichern (Schloss dranhängen), dann nachmessen, dass wirklich kein Strom mehr da ist, dann erden und zuletzt Nachbarteile abdecken. Genau in dieser Reihenfolge, denn Strom verzeiht keine Fehler.

## Merksatz
- Liste - Rabatt - Skonto + Bezugskosten = Bezugspreis.
- A-Artikel: wenig Menge, viel Wert. C-Artikel: viel Menge, wenig Wert.
- TCO = alle Kosten, nicht nur Kaufpreis.
- ROI = Totalerfolg / Investition (ohne Einheit).
- Amortisation = Investition / Rückfluss pro Zeit.
- Fünf Sicherheitsregeln: frei, sichern, prüfen, erden, abdecken.

## Prüfungsfalle
- Skonto vor Rabatt abziehen.
- Bezugskosten vor dem Skonto addieren (Skonto bezieht sich nur auf den Warenwert).
- Beim ROI die Nutzungsdauer vergessen oder mit 100 multiplizieren, obwohl die Aufgabe eine Verhältniszahl verlangt. Nachrechnen: Eine Amortisation von 17,9 Monaten bei 6.700 EUR Rückfluss pro Monat wäre unplausibel.
- TCO mit Anschaffungskosten gleichsetzen.
- ABC-Analyse nach Stückzahl statt nach Wertanteil bewerten.
- Handelsspanne mit Zuschlag verwechseln (Basis Verkaufspreis versus Bezugspreis).

## Grafik
### Bezugskalkulation
1. Lieferant: nennt Listeneinkaufspreis
2. Lieferant -> Einkauf: gewährt Liefererrabatt, ergibt Zieleinkaufspreis
3. Einkauf -> Lieferant: zahlt fristgerecht und zieht Skonto ab (Bareinkaufspreis)
4. Spedition -> Einkauf: Bezugskosten kommen hinzu
5. Einkauf: Ergebnis ist der Bezugspreis

### ABC-Analyse
1. Lager: sortiert Artikel nach Wertanteil
2. Lager: A-Artikel (ca. 20 % Menge, ca. 80 % Wert) intensiv überwachen
3. Lager: B-Artikel mittel überwachen
4. Lager: C-Artikel (viel Menge, wenig Wert) vereinfacht beschaffen

## Lücken
- Der Bezugspreis ergibt sich aus Bareinkaufspreis plus {Bezugskosten}.
- {TCO} bezeichnet alle direkten und indirekten Kosten über die Nutzungsdauer.
- Bei der {ABC}-Analyse sind Server typische A-Artikel.
- Der ROI wird als Quotient aus {Totalerfolg} und Investitionskosten berechnet.
- Der erste Schritt der Fünf Sicherheitsregeln ist {Freischalten}.

## Reihenfolge
### Bezugskalkulation
1. Listeneinkaufspreis
2. Liefererrabatt abziehen
3. Liefererskonto abziehen
4. Bezugskosten addieren
5. Bezugspreis

### Fünf Sicherheitsregeln
1. Freischalten
2. Gegen Wiedereinschalten sichern
3. Spannungsfreiheit feststellen
4. Erden und kurzschließen
5. Benachbarte Teile abdecken

## Spickzettel
- Bezugspreis = Liste - Rabatt - Skonto + Bezugskosten
- Zuschlagsfaktor = Verkaufspreis / Bezugspreis
- Handelsspanne = (VP - BP) / VP
- ROI = Totalerfolg / Investition
- Amortisation = Investition / Jahresrückfluss
- A = wertvoll, C = viel, aber billig
- TCO = Gesamtkosten über Lebensdauer

## Übungen
- A: Liste 2.000 EUR, 15 % Rabatt, 3 % Skonto, Fracht 50 EUR. Bezugspreis? | L: 2.000 - 300 = 1.700; - 51 = 1.649; + 50 = 1.699 EUR.
- A: Investition 10.000 EUR, jährlicher Rückfluss 4.000 EUR, Nutzungsdauer 5 Jahre. ROI und Amortisation? | L: Totalerfolg 20.000; ROI = 2,0; Amortisation = 10.000 / 4.000 = 2,5 Jahre.
- A: Bezugspreis 80 EUR, Verkaufspreis 120 EUR. Zuschlagsfaktor und Handelsspanne? | L: Faktor 1,5; Spanne (120 - 80) / 120 = 33,3 %.

## Karteikarten
- F: Was ist der Bezugspreis? | A: Einkaufspreis nach Abzügen plus Bezugskosten.
- F: Welche Kosten sind Bezugskosten? | A: Verpackung, Fracht, Zoll, Transportversicherung.
- F: Was ist Liefererskonto? | A: Nachlass für fristgerechte Zahlung, meist 2 bis 3 %.
- F: Was ist eine Rückwärtskalkulation? | A: Aus dem vorgegebenen Verkaufspreis den höchsten Einkaufspreis ermitteln.
- F: Was ist ein A-Artikel? | A: Geringe Menge, hoher Wertanteil.
- F: Was ist ein C-Artikel? | A: Große Menge, kleiner Wertanteil.
- F: Was ist E-Procurement? | A: Beschaffung über das Internet und spezielle IT-Systeme.
- F: Was bedeutet TCO? | A: Total Cost of Ownership: alle Kosten über die Nutzungsdauer.
- F: Wie berechnet man ROI? | A: Totalerfolg geteilt durch Investitionskosten.
- F: Wie berechnet man die Amortisationszeit? | A: Investition geteilt durch jährlichen Rückfluss.
- F: Wie lautet die dritte Sicherheitsregel? | A: Spannungsfreiheit feststellen.
- F: Was prüft die Gefährdungsbeurteilung im IT-Bereich? | A: Elektrische, Brand-, Umgebungs- und Mensch-Maschine-Gefährdungen.

## Quiz
? Wie lautet die richtige Reihenfolge der Kalkulation?
* Liste - Rabatt - Skonto + Bezugskosten
- Liste - Skonto - Rabatt + Bezugskosten
- Liste + Bezugskosten - Rabatt - Skonto
- Liste - Rabatt + Skonto + Bezugskosten

? Welche Artikel überwacht man bei der ABC-Analyse am intensivsten?
* A-Artikel
- B-Artikel
- C-Artikel
- Alle gleich

? Was umfasst TCO?
* Alle direkten und indirekten Kosten über die Nutzungsdauer
- Nur den Kaufpreis
- Nur die Betriebskosten
- Nur die Entsorgung

? Wie berechnet sich der ROI?
* Totalerfolg / Investitionskosten
- Investition / Gewinn pro Monat
- Umsatz / Mitarbeiterzahl
- Gewinn - Steuern

? Investition 10.000 EUR, Rückfluss 67.000 EUR pro Jahr. Amortisation ungefähr?
* 1,8 Monate
- 17,9 Monate
- 3 Jahre
- 10 Jahre

? Was ist Schritt 2 der Fünf Sicherheitsregeln?
* Gegen Wiedereinschalten sichern
- Erden und kurzschließen
- Abdecken
- Freischalten

? Was ist ein Marktplatzsystem?
* Elektronischer Marktplatz für Einkauf von KMU
- Wochenmarkt
- Lagersoftware
- Zahlungsdienst

? Wofür dient die Rückwärtskalkulation?
* Höchstzulässiger Einkaufspreis bei vorgegebenem Verkaufspreis
- Berechnung der Steuer
- Ermittlung des Gehalts
- Berechnung der Abschreibung

? Welche Aussagen sind richtig? (mehrere)
* Skonto gibt es für fristgerechte Zahlung.
* Bezugskosten erhöhen den Bezugspreis.
- Rabatt wird nur bei Barzahlung gewährt.
- Bezugskosten senken den Bezugspreis.

? Wofür sind Berufsgenossenschaften zuständig?
* Gesetzliche Unfallversicherung
- Krankenversicherung
- Arbeitslosenversicherung
- Rentenversicherung
