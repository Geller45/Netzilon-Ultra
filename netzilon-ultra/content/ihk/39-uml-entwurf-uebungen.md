---
id: ihk-uml-entwurf-uebungen
bereich: AP1
block: IHK
kapitel: Softwareentwurf (LF 5)
titel: UML-Übungen und Entwurf – Klassen-, Anwendungsfall-, Aktivitätsdiagramm, PAP, Entscheidungstabelle, ER-Modell
stufe: Fortgeschritten
fach: PV – AP1
pruefungen: [AP1, Schule]
quellen: [Uebersicht.rar (ex.html, LF5.html), 88295bfb-Aufgaben_-_USE_CASE.pdf, b3adcc75-01_UML-Diagramme_-_USE_CASE.pdf]
verweise: [ihk-lz-programmierung-uml, ihk-epk-bpmn, ihk-oop-grundlagen, ihk-lz-datenbank-sql, bonus-csharp-oop]
---

## Profi

Dieses Kapitel sammelt die Entwurfsaufgaben aus dem Übersichtsmaterial (LF 5.4 Software-Entwurf, 8.3 UML-Diagramme, 5.7 Datenbanken) mit Musterlösungen in Textform. Die Zeichnungen der Quelle sind Bilder; die Lösungen sind hier als Notation beschrieben.

### Klassendiagramm: Zug (Aggregation, Vererbung, Komposition)
**Aufgabe:** Ein Zug wird für eine Fahrt aus einem Triebwagen und 1 bis 20 Waggons zusammengestellt. Triebwagen sind Diesel-Loks oder E-Loks. Waggons sind Güterwaggon, Personenwaggon oder Speisewagen. Ein Personenwaggon hat bis zu 10 Abteile.
**Lösung:**
- Klassen: `Zug`, `Triebwagen`, `Waggon`, `DieselLok`, `ELok`, `Güterwaggon`, `Personenwaggon`, `Speisewagen`, `Abteil`.
- `Zug` o-- `Triebwagen` (Aggregation, Multiplizität 1) und `Zug` o-- `Waggon` (Aggregation, 1..20): Triebwagen und Waggons existieren auch ohne den Zug und werden ihm nur für einen Zeitraum zugeordnet.
- `DieselLok` und `ELok` erben von `Triebwagen`; `Güterwaggon`, `Personenwaggon`, `Speisewagen` erben von `Waggon` (Vererbung: durchgezogene Linie, hohles Dreieck).
- `Personenwaggon` *-- `Abteil` (Komposition, 0..10, gefüllte Raute): Abteile existieren nur, solange der Personenwaggon existiert.

### Anwendungsfalldiagramm: Hotelreservierung
**Aufgabe:** Kunden reservieren Zimmer in einem Onlineportal; die Reservierung prüft immer die Verfügbarkeit und verlangt eine Zahlungsmethode; bei Kreditkarte prüft die Bank die Angaben.
**Lösung:**
- Akteure: `Kunde` (primär), `Bank` (externes System, sekundär).
- Anwendungsfälle: „Zimmer reservieren", „Verfügbarkeit prüfen", „Zahlungsmethode angeben", „Kreditkarte prüfen".
- Beziehungen: Kunde - Zimmer reservieren. „Zimmer reservieren" **<<include>>** „Verfügbarkeit prüfen" (immer) und **<<include>>** „Zahlungsmethode angeben". „Kreditkarte prüfen" **<<extend>>** „Zahlungsmethode angeben" (nur bei Kreditkarte). Bank - Kreditkarte prüfen.
- Merke: include = immer enthalten, extend = optionale Erweiterung unter Bedingung. Pfeilrichtung: include vom Basisfall zum eingebundenen Fall, extend vom erweiternden Fall zum Basisfall.

### Aktivitätsdiagramm: Restaurantbesuch
**Aufgabe:** Gast, Bedienung und Koch; das Bezahlen ist ein paralleler, interaktiver Prozess.
**Lösung:** Rahmen „Restaurantbesuch" mit drei **Partitionen (Swimlanes)** Gast, Bedienung, Koch. Ablauf: Startknoten -> Gast: Restaurant betreten -> an Tisch setzen -> Essen auswählen -> Bedienung: Bestellung aufnehmen -> Koch: Essen zubereiten -> Bedienung: Essen servieren -> Gast: Essen zu sich nehmen -> **Fork** (Synchronisationsbalken): parallel Gast: Essen bezahlen und Bedienung: Bezahlung entgegennehmen -> **Join** -> Gast: Restaurant verlassen -> Endknoten.

### Programmablaufplan (PAP) und Pseudocode: Rabattberechnung
**Aufgabe:** Bestellwert eingeben; übersteigt er 100,00 EUR, gibt es 10 % Rabatt; Ausgabe: gewährter Rabatt.
```
EINGABE bestellwert
WENN bestellwert > 100 DANN
    rabatt <- bestellwert * 0,10
SONST
    rabatt <- 0
ENDE WENN
AUSGABE rabatt
```
PAP-Symbole: Oval = Start/Ende, Parallelogramm = Ein-/Ausgabe, Rechteck = Verarbeitung, Raute = Verzweigung, Pfeile = Ablauf. C#-Umsetzung: `decimal rabatt = bestellwert > 100m ? bestellwert * 0.10m : 0m;`. Der Pseudocode ist nicht genormt und darf frei, aber eindeutig formuliert werden.

### Entscheidungstabelle
Eine Entscheidungstabelle beschreibt, welche **Aktionen** bei welchen **Bedingungen** erfolgen; jede Spalte ist eine **Regel**. Beispiel Rabatt:
| Bedingung/Aktion | R1 | R2 |
|---|---|---|
| Bestellwert > 100 EUR? | J | N |
| 10 % Rabatt gewähren | X | - |
| Kein Rabatt | - | X |
Bei n Bedingungen (ja/nein) gibt es 2^n Regeln; unmögliche Kombinationen streicht man, gleiche Aktionen kann man zusammenfassen.

### ER-Modell: Kundenbestellungen
**Aufgabe:** Ein Kunde (KundenNr, Name) macht mehrere Bestellungen; jede Bestellung (BestellNr, Datum) hat mehrere Positionen mit Artikel (ArtikelNr, Name) und Anzahl.
**Lösung:** Entitäten `Kunde`, `Bestellung`, `Artikel`; Beziehungen Kunde 1:n Bestellung; Bestellung und Artikel n:m, aufgelöst durch die Zwischentabelle `Bestellposition`.
Relationenmodell:
- `Kunde(KundenNr PK, Name)`
- `Bestellung(BestellNr PK, Datum, KundenNr FK)`
- `Artikel(ArtikelNr PK, Name)`
- `Bestellposition(BestellNr FK, ArtikelNr FK, Anzahl)`, Primärschlüssel zusammengesetzt (BestellNr, ArtikelNr).
```sql
CREATE TABLE Bestellposition (
  BestellNr INT NOT NULL REFERENCES Bestellung(BestellNr),
  ArtikelNr INT NOT NULL REFERENCES Artikel(ArtikelNr),
  Anzahl    INT NOT NULL CHECK (Anzahl > 0),
  PRIMARY KEY (BestellNr, ArtikelNr)
);
```

### Mapping auf C#
Zug-Beispiel: `abstract class Waggon {}`, `class Personenwaggon : Waggon { List<Abteil> abteile = new(); }` (Komposition: Abteile werden im Waggon erzeugt), `class Zug { Triebwagen? Lok; List<Waggon> Waggons = new(); }` (Aggregation: Objekte werden von außen übergeben).

## Einfach

Bevor man ein Haus baut, zeichnet man einen Plan. Genauso zeichnet man vor der Software **UML-Diagramme**. Jedes Diagramm beantwortet eine andere Frage.

Das **Klassendiagramm** zeigt, welche Dinge es gibt und wie sie zusammenhängen. Ein Zug besteht aus einer Lok und Waggons. Die Lok und die Waggons gibt es auch ohne den Zug, sie werden nur ausgeliehen (Aggregation, hohle Raute, wie ein Spieler in einem Team). Ein Abteil gibt es nur im Waggon; wenn der Waggon verschrottet wird, ist auch das Abteil weg (Komposition, gefüllte Raute, wie ein Zimmer in einem Haus). Eine Diesel-Lok ist ein besonderer Triebwagen (Vererbung, Pfeil mit hohlem Dreieck).

Das **Anwendungsfalldiagramm** zeigt, wer was mit dem System tun darf. Strichmännchen sind Akteure. Ovale sind Aufgaben. „Include" heißt: Das gehört immer dazu (beim Reservieren wird immer geprüft, ob das Zimmer frei ist). „Extend" heißt: Das kommt nur manchmal dazu (Kreditkarte prüfen nur, wenn man mit Karte zahlt).

Das **Aktivitätsdiagramm** ist ein Ablaufplan mit Bahnen: Gast, Bedienung, Koch. Wenn zwei Dinge gleichzeitig passieren (Gast zahlt, Bedienung kassiert), teilt sich der Weg an einem dicken Balken und kommt später wieder zusammen.

Der **PAP** und der **Pseudocode** erzählen eine Rechenregel in Schritten: „Wenn Bestellwert über 100, dann zehn Prozent Rabatt." Die **Entscheidungstabelle** ist eine Wenn-Dann-Liste, damit man keinen Fall vergisst.

Das **ER-Modell** ist der Plan für Tabellen. Ein Kunde hat viele Bestellungen. Eine Bestellung hat viele Artikel, und ein Artikel kommt in vielen Bestellungen vor. Für diese Viele-zu-viele-Beziehung braucht man eine Zwischentabelle, die Bestellposition.

## Merksatz
- Aggregation = hohle Raute (Teil existiert allein), Komposition = gefüllte Raute (Teil stirbt mit dem Ganzen).
- Vererbung = durchgezogene Linie mit hohlem Dreieck.
- include = immer, extend = manchmal.
- Fork und Join für Parallelität im Aktivitätsdiagramm.
- n:m braucht immer eine Zwischentabelle.
- Bei n Bedingungen gibt es 2^n Regeln.

## Prüfungsfalle
- Aggregation und Komposition vertauschen.
- include und extend verwechseln oder die Pfeilrichtung vertauschen.
- Im Use-Case-Diagramm Abläufe zeichnen: Es zeigt nur das Was, nicht das Wie.
- Im Aktivitätsdiagramm Schleifen ohne Entscheidungsknoten oder Parallelität ohne Fork/Join darstellen.
- n:m-Beziehung direkt in zwei Tabellen mit Fremdschlüsseln ausdrücken.
- Rabatt falsch berechnen: „übersteigt 100" bedeutet größer als 100, nicht größer oder gleich.
- PAP-Symbole falsch verwenden: Raute für Verzweigung, Parallelogramm für Ein-/Ausgabe.
- Das Klassendiagramm mit Eigenschaften überladen, wenn die Aufgabe ausdrücklich darauf verzichtet.

## Grafik
### Zug-Klassendiagramm
1. Zug: besteht aus Triebwagen (1) und Waggons (1 bis 20), Aggregation
2. Triebwagen: Spezialisierungen DieselLok und ELok (Vererbung)
3. Waggon: Spezialisierungen Güterwaggon, Personenwaggon, Speisewagen
4. Personenwaggon: enthält bis zu 10 Abteile (Komposition)
5. Abteil: existiert nur zusammen mit seinem Personenwaggon

### Reservierungsablauf (Use Case)
1. Kunde -> Portal: Zimmer reservieren
2. Portal: include Verfügbarkeit prüfen
3. Portal: include Zahlungsmethode angeben
4. Kunde -> Portal: wählt Kreditkarte
5. Portal -> Bank: Kreditkarte prüfen (extend)
6. Bank -> Portal: Freigabe, Reservierung bestätigt

## Lücken
- Eine {Komposition} wird mit gefüllter Raute dargestellt.
- Bei einer {Aggregation} können Teile auch ohne das Ganze existieren.
- Beziehungen, die immer dazugehören, heißen {include}.
- Eine n:m-Beziehung löst man durch eine {Zwischentabelle} auf.
- Ein Aktivitätsdiagramm teilt Verantwortliche in {Partitionen} (Swimlanes).

## Zuordnen
### UML-Diagramm und Zweck
- Klassendiagramm => Struktur: Klassen, Attribute, Methoden, Beziehungen
- Anwendungsfalldiagramm => Wer nutzt das System wofür
- Aktivitätsdiagramm => Ablauf mit Entscheidungen und Parallelität
- Sequenzdiagramm => zeitlicher Nachrichtenaustausch zwischen Objekten

### PAP-Symbol und Bedeutung
- Oval => Start oder Ende
- Parallelogramm => Ein- oder Ausgabe
- Rechteck => Verarbeitung
- Raute => Verzweigung

## Reihenfolge
### Restaurantbesuch (Gast und Bedienung)
1. Restaurant betreten
2. An Tisch setzen
3. Essen auswählen
4. Bestellung aufnehmen
5. Essen zubereiten
6. Essen servieren
7. Essen zu sich nehmen
8. Bezahlen und Bezahlung entgegennehmen (parallel)
9. Restaurant verlassen

## Spickzettel
- Aggregation hohle Raute, Komposition gefüllte Raute
- Vererbung: Dreieck hohl, durchgezogen
- Interface-Implementierung: Dreieck hohl, gestrichelt
- Use Case: include immer, extend optional
- Aktivität: Fork/Join, Swimlanes, Entscheidungsraute
- n:m = Zwischentabelle, PK zusammengesetzt
- Entscheidungstabelle: 2^n Regeln

## Übungen
- A: Eine Bibliothek hat Bücher; ein Buch hat mehrere Exemplare; ein Exemplar kann an einen Leser ausgeliehen sein. Welche Beziehungen? | L: Buch 1:n Exemplar (Komposition, Exemplar existiert nur mit Buchtitel), Leser 1:n Ausleihe, Exemplar 1:n Ausleihe über die Zeit; Ausleihe als Zwischenklasse/-tabelle.
- A: Erstellen Sie eine Entscheidungstabelle: Versand kostenlos ab 50 EUR oder für Premiumkunden, sonst 4,90 EUR. | L: Bedingungen: Bestellwert >= 50 (J/N), Premiumkunde (J/N); Regeln: J/J, J/N, N/J -> kostenlos; N/N -> 4,90 EUR.
- A: Schreiben Sie Pseudocode: Gib alle geraden Zahlen von 1 bis 10 aus. | L: FÜR i VON 1 BIS 10: WENN i MOD 2 = 0 DANN AUSGABE i; ENDE FÜR.
- A: Setzen Sie die Rabattregel in C# um. | L: decimal rabatt = bestellwert > 100m ? bestellwert * 0.10m : 0m;

## Karteikarten
- F: Was zeigt ein Klassendiagramm? | A: Klassen mit Attributen, Methoden und ihre Beziehungen.
- F: Aggregation oder Komposition: Teil existiert ohne Ganzes? | A: Aggregation (hohle Raute).
- F: Wie stellt man Vererbung dar? | A: Durchgezogene Linie mit hohlem Dreieck an der Oberklasse.
- F: Was zeigt ein Anwendungsfalldiagramm? | A: Akteure und ihre Anwendungsfälle (das Was).
- F: include oder extend: immer enthalten? | A: include.
- F: Wofür steht ein Fork im Aktivitätsdiagramm? | A: Aufteilung in parallele Abläufe (Join führt sie wieder zusammen).
- F: Was sind Swimlanes? | A: Partitionen, die Aktionen den Verantwortlichen zuordnen.
- F: Welches PAP-Symbol steht für eine Verzweigung? | A: Die Raute.
- F: Was beschreibt eine Entscheidungstabelle? | A: Welche Aktionen bei welchen Bedingungskombinationen erfolgen.
- F: Wie viele Regeln hat eine Tabelle mit 3 Ja/Nein-Bedingungen? | A: 8 (2^3).
- F: Wie löst man eine n:m-Beziehung auf? | A: Zwischentabelle mit den Fremdschlüsseln beider Seiten.
- F: Was ist Pseudocode? | A: Umgangssprachliche, programmiersprachennahe Beschreibung eines Ablaufs, nicht genormt.
- F: Was bedeutet Multiplizität 1..20? | A: Mindestens 1, höchstens 20 Objekte.

## Quiz
? Welche Beziehung beschreibt Personenwaggon und Abteil am besten?
* Komposition
- Aggregation
- Assoziation ohne Zahl
- Generalisierung

? Wie stellt man Vererbung im Klassendiagramm dar?
* Durchgezogene Linie mit hohlem Dreieck
- Gestrichelte Linie mit offenem Pfeil
- Gefüllte Raute
- Gestrichelte Linie mit gefülltem Dreieck

? Welche Beziehung bedeutet „immer enthalten" im Use-Case-Diagramm?
* include
- extend
- generalization
- association

? Wozu dienen Swimlanes?
* Aktionen den Verantwortlichen zuordnen
- Datenbanktabellen verbinden
- Schleifen darstellen
- Fehler markieren

? Wie viele Regeln hat eine Entscheidungstabelle mit 2 Ja/Nein-Bedingungen?
* 4
- 2
- 3
- 8

? Wie löst man eine n:m-Beziehung in Tabellen auf?
* Zwischentabelle mit zwei Fremdschlüsseln
- Ein Fremdschlüssel in einer Tabelle
- Eine zusätzliche Spalte
- Gar nicht

? Welches PAP-Symbol steht für Ein-/Ausgabe?
* Parallelogramm
- Raute
- Oval
- Rechteck

? Was zeigt ein Anwendungsfalldiagramm nicht?
* Wie das System intern umgesetzt wird
- Akteure
- Anwendungsfälle
- Beziehungen zwischen Anwendungsfällen

? Der Rabatt gilt, wenn der Bestellwert 100 EUR übersteigt. Bei 100,00 EUR?
* Kein Rabatt
- 10 % Rabatt
- 5 % Rabatt
- Es hängt vom Kunden ab

? Welche Aussagen zur Aggregation sind richtig? (mehrere)
* Das Teil kann ohne das Ganze existieren.
* Sie wird mit hohler Raute dargestellt.
- Sie ist identisch mit Vererbung.
- Das Teil wird mit dem Ganzen gelöscht.
