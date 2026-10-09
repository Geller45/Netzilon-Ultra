---
id: db-er-modell
bereich: Datenbanken
pruefungen: [Schule, AP1, AP2]
fach: SQL / Datenbanken
block: D1
kapitel: Datenmodellierung
titel: ER-Modell – Chen-Notation, Beziehungstypen, Kardinalitäten, schwache Entitäten
stufe: Fortgeschritten
quellen: [erd.pdf, relationen.pdf, 01-ER-Modelle.pdf, 03-ER-Modelle.pdf, 02-ER-Modelle.pdf]
verweise: [db-einfuehrung, db-erd-tabelle, db-normalisierung]
---

## Profi

### Zweck
Das **Entity-Relationship-Modell** (ER-Modell, ERM) beschreibt fachliche Zusammenhänge der realen Welt im **konzeptionellen Entwurf**, unabhängig vom DBMS. Es ist die Grundlage für den physischen Entwurf. Jeder DB-Admin muss ein ERD lesen, ein guter DB-Admin kann es erstellen.

### Chen-Notation (Peter Chen)
| Symbol | Bedeutung |
|---|---|
| Rechteck | Entitätstyp (z. B. TEILNEHMER) |
| Doppeltes Rechteck | schwache Entität |
| Ellipse | Attribut |
| Ellipse mit unterstrichenem Namen | Primärschlüsselattribut |
| Doppelte Ellipse | mehrwertiges Attribut (z. B. Anschrift = PLZ, Ort, Straße; wird später durch Normalisierung aufgespalten) |
| Gestrichelte Ellipse | abgeleitetes Attribut (berechenbar, z. B. Alter aus Geburtsdatum) |
| Raute | Beziehung (Relation), meist mit Verb beschriftet (kauft, besucht, liefert) |
| Linie mit 1 / n / m | Kardinalität |

Alternative: **Martin-Notation / Krähenfußnotation** (Crow's Foot): Tabellen als Kästen, Beziehung als Linie, „Krähenfuß“ = Mehrseite.

### Beziehungstypen (Kardinalitäten)
- **1:1** – Bürger – Reisepass, Auto – Kennzeichen, Hotelzimmer – Safe, Mitarbeiter – Dienstwagen.
- **1:n** – Kunde – Bestellung, Land – Städte, Team – Spieler, Lager – Lagerplatz, Mutter – Kinder.
- **n:m** – Schauspieler – Film, Autor – Buch, Artikel – Lager, Client – Server.
- **Reflexiv (rekursiv)**: Entitätstyp steht mit sich selbst in Beziehung (Mitarbeiter ist Vorgesetzter von Mitarbeiter; Ehepartner).
- **Mehrstellig (ternär)**: mehr als zwei Entitätstypen, z. B. Lieferant – Artikel – Lager.
- Beziehungen können **eigene Attribute** haben (Arbeitsstunden bei Mitarbeiter–Projekt, Preis und Kalenderwoche bei Lieferant–Artikel).
- **Min-Max-Angaben**: (1,n) = mindestens 1, höchstens beliebig viele. „Jeder Mitarbeiter in mind. einem Projekt, jedes Projekt mind. 3 Mitarbeiter“ = (1,n) bzw. (3,n).

### Schwache Entität (Weak Entity)
Entität **ohne eigenen vollständigen Schlüssel**. Sie hängt von einer **starken Entität** in einer **1:n-Beziehung** ab (1 auf Seite der starken). Sie hat nur einen **lokalen Schlüssel (Partialschlüssel)**; zusammen mit dem Schlüssel der starken Entität ergibt sich der Gesamtschlüssel. Beispiel: **Stadt** zu **Bundesland** (Frankfurt/Main in Hessen vs. Frankfurt/Oder in Brandenburg); Rechnungsposition zu Rechnung (Pos 1, 2, 3 je Rechnung).

### Anforderungen an Primärschlüssel
Eindeutig, nie NULL, unveränderlich, minimal. Zusammengesetzte Schlüssel bei Beziehungs-Tabellen (z. B. PersonalNr + ProjektNr + Kalenderwoche).

### Vorgehen bei der Modellierung
1. Problemrahmen abstecken (Aufgabentext/Pflichtenheft lesen)
2. **Substantive** → Entitätstypen (Kunde, Artikel)
3. **Verben** → Beziehungstypen (kauft, liefert)
4. **Mengenangaben**, Singular/Plural → Kardinalitäten
5. Attribute, Wertebereiche, Schlüssel festlegen
6. Auf Redundanz und Normalisierung prüfen

### Beispiellösung Aufgabe „Mitarbeiter–Projekt“
Entitätstypen MITARBEITER(**PersonalNr**, Name, Vorname, Adresse) und PROJEKT(**ProjektNr**, Name, Beginn, Ende, Budget). Beziehung **arbeitet_an** n:m mit Attributen Kalenderwoche und Stunden. Gesamtschlüssel der Beziehung: PersonalNr + ProjektNr + Jahr + KW (da mehrere Jahre gespeichert werden!).

## Einfach

Ein **ER-Diagramm** ist der **Bauplan vor dem Hausbau**. Bevor man eine Datenbank baut, zeichnet man auf, **was** es gibt und **wie** es zusammenhängt.

- **Kästchen** = Dinge, über die man etwas wissen will: Schüler, Lehrer, Klasse.
- **Kringel** = was man über das Ding wissen will: Name, Alter. Der **unterstrichene Kringel** ist die eindeutige Nummer (wie die Nummer auf dem Trikot).
- **Raute** = das Wort dazwischen: „Lehrer **unterrichtet** Klasse“.
- **Zahlen an den Linien**: Eine Mutter hat **viele** Kinder, aber ein Kind hat nur **eine** leibliche Mutter: das ist **1:n**. Ein Schauspieler spielt in **vielen** Filmen und ein Film hat **viele** Schauspieler: das ist **n:m**. Dein Reisepass gehört genau **einer** Person: **1:1**.
- **Schwache Entität** = ein Ding, das ohne ein anderes gar nicht existieren kann, z. B. die „Zimmer 3“ gibt es nur in einem bestimmten Hotel – es braucht den Hotelnamen dazu, um eindeutig zu sein.

Trick beim Aufgabenlesen: **Hauptwörter** unterstreichen = Kästchen. **Tuwörter** unterstreichen = Rauten. Auf „mehrere“, „jeder“, „genau ein“ achten = Zahlen.

## Merksatz
- **Substantiv = Entität, Verb = Beziehung, Zahlwort = Kardinalität.**
- **Rechteck – Ellipse – Raute** (Entität, Attribut, Beziehung).
- Unterstrichen = Primärschlüssel; doppelt = mehrwertig / schwach; gestrichelt = abgeleitet.
- n:m gibt es nur im ER-Modell – in der Datenbank wird daraus eine **Zwischentabelle**.

## Prüfungsfalle
- Beziehungsattribute (Stunden, Preis, Datum) gehören an die **Beziehung**, nicht an einen der beiden Entitätstypen.
- Bei zeitabhängigen Daten (Preis gilt je Kalenderwoche, Arbeitsstunden je KW) muss die **Zeit im Schlüssel** stehen.
- Ein abgeleitetes Attribut (Alter) wird **nicht gespeichert**, sondern berechnet.
- Das **Alter** als gespeichertes Attribut ist Redundanz; das **Geburtsdatum** nicht.
- „Mindestens 3 Mitarbeiter“ ist eine Min-Max-Angabe (3,n), nicht einfach „n“.
- Mehrstellige Beziehung nicht in mehrere zweistellige zerlegen, wenn dadurch Information verloren geht.

## Grafik
### Von der Aufgabe zum ERD
1. Aufgabentext: Substantive suchen
2. Entitätstypen: Mitarbeiter und Projekt zeichnen
3. Mitarbeiter -> Projekt: Beziehung arbeitet_an (n:m)
4. Beziehung: Attribute Kalenderwoche und Stunden anhängen
5. Primärschlüssel: PersonalNr, ProjektNr unterstreichen
### Kardinalitäten
1. Kunde -> Bestellung: 1:n – ein Kunde, viele Bestellungen
2. Autor -> Buch: n:m – braucht Zwischentabelle
3. Bürger -> Reisepass: 1:1

## Lab
### GUI
Maschine: Windows-Client (z. B. WIN11-CL01). Diagramm zeichnen mit draw.io (diagrams.net) oder in SSMS: Datenbank > Datenbankdiagramme > Neues Datenbankdiagramm. Entitäten als Tabellen anlegen, Beziehungen per Drag & Drop zwischen PK und FK ziehen.
### SQL
Maschine: SQL-Server-VM (SSMS). Modell Projekt-Verwaltung zum Ausprobieren in der nächsten Lektion (db-erd-tabelle) in Tabellen umsetzen.

## Übungen
- A: Zeichnen Sie ein ER-Modell: Ein IT-Berater arbeitet an mehreren Projekten, an einem Projekt arbeiten mehrere Berater. | L: BERATER(BeraterNr) n:m PROJEKT(ProjektNr) über Beziehung arbeitet_mit (später Zwischentabelle Berater_Projekt mit PK BeraterNr+ProjektNr).
- A: Ein Busunternehmen: Bus wird immer in derselben Werkstatt repariert, Mechaniker wechseln. Welche Beziehungen? | L: BUS n:1 WERKSTATT; WERKSTATT 1:n MECHANIKER; REPARATUR als Beziehung bzw. Entität zwischen BUS und MECHANIKER (Datum, Art); FAHRER n:m BUS.
- A: Piloten und Flugzeugtypen mit Flugstunden – welche Beziehung und welche Attribute? | L: PILOT n:m FLUGZEUGTYP (darf_fliegen); Beziehungsattribut Flugstunden_auf_Typ; Gesamtflugstunden Pilot = abgeleitet (Summe), Gesamtflugstunden je Typ = abgeleitet.
- A: Baumarkt: Artikel–Lieferant–Preis pro Kalenderwoche. Schlüssel? | L: Beziehung liefert(Artikel, Lieferant) mit Preis und KW; PK = ArtikelNr + LieferantNr + Jahr + KW. Lagerbestand: Artikel–Lager mit Mindest-/Höchstbestand.
- A: Ordnen Sie 1:1, 1:n, n:m zu: Autor–Buch, Land–Hauptstadt, Team–Spieler. | L: Autor–Buch n:m; Land–Hauptstadt 1:1; Team–Spieler 1:n.

## Karteikarten
- F: Wofür wird das ER-Modell verwendet? | A: Konzeptioneller Entwurf einer Datenbank, DBMS-unabhängig.
- F: Chen-Notation: Symbol für Entität / Attribut / Beziehung? | A: Rechteck / Ellipse / Raute.
- F: Was ist ein abgeleitetes Attribut? | A: Berechenbarer Wert (z. B. Alter aus Geburtsdatum), gestrichelte Ellipse, wird nicht gespeichert.
- F: Was ist ein mehrwertiges Attribut? | A: Attribut mit mehreren Informationen/Werten (Anschrift); wird durch Normalisierung aufgespalten.
- F: Was ist eine schwache Entität? | A: Entität ohne eigenen vollständigen Schlüssel; nur mit starker Entität (1:n) eindeutig identifizierbar (Partialschlüssel + Fremdschlüssel).
- F: Beispiel für schwache Entität? | A: Stadt zu Bundesland (Frankfurt/Main vs. Frankfurt/Oder), Rechnungsposition zu Rechnung.
- F: Was ist eine reflexive Beziehung? | A: Ein Entitätstyp steht mit sich selbst in Beziehung (Mitarbeiter – Vorgesetzter).
- F: Wie finde ich Entitäten und Beziehungen im Aufgabentext? | A: Substantive = Entitätstypen, Verben = Beziehungen, Zahlwörter = Kardinalitäten.
- F: Wohin gehören Attribute einer n:m-Beziehung? | A: In die Zwischentabelle der Beziehung (z. B. Menge, Preis, Datum).
- F: Wie heißt die alternative Notation mit Krähenfuß? | A: Martin-Notation (Crow's Foot).

## Quiz
? Welches Symbol steht in der Chen-Notation für eine Beziehung?
* Raute
- Rechteck
- Ellipse
- Dreieck

? Was ist ein abgeleitetes Attribut?
* Ein berechenbarer Wert, z. B. Alter aus dem Geburtsdatum
- Ein Attribut, das mehrere Werte hat
- Ein Fremdschlüssel
- Ein Attribut, das NULL sein darf

? Wie wird eine n:m-Beziehung in Tabellen umgesetzt?
* Mit einer Zwischentabelle
- Durch einen Fremdschlüssel auf der 1-Seite
- Durch Zusammenlegen beider Tabellen
- Gar nicht, sie ist nicht umsetzbar

? Welche Beziehung ist 1:n?
* Kunde – Bestellung
- Autor – Buch
- Bürger – Reisepass
- Schauspieler – Film

? Was kennzeichnet eine schwache Entität?
* Sie hat keinen vollständigen eigenen Schlüssel und hängt von einer starken Entität ab
- Sie hat keine Attribute
- Sie steht in einer n:m-Beziehung
- Sie wird nicht in einer Tabelle gespeichert

? Wo wird das Attribut „Arbeitsstunden“ bei Mitarbeiter und Projekt modelliert?
* An der Beziehung arbeitet_an
- Am Entitätstyp Mitarbeiter
- Am Entitätstyp Projekt
- Gar nicht

? Wonach sucht man im Aufgabentext, um Beziehungen zu finden?
* Verben
- Adjektive
- Zahlen
- Eigennamen

? Was bedeutet die Kardinalität (3,n) an Projekt?
* Mindestens 3, beliebig viele Mitarbeiter je Projekt
- Genau 3 Mitarbeiter
- Höchstens 3 Mitarbeiter
- 3 Projekte je Mitarbeiter

## Lücken
- Ein Rechteck steht für eine {Entität}, eine Raute für eine {Beziehung}.
- Eine m:n-Beziehung wird durch eine {Zwischentabelle} aufgelöst.
- Ein {abgeleitetes} Attribut wird nicht gespeichert, sondern berechnet.

## Zuordnen
### Beziehung und Kardinalität
- Bürger – Reisepass => 1:1
- Kunde – Bestellung => 1:n
- Autor – Buch => n:m
- Mitarbeiter – Vorgesetzter => reflexiv

## Spickzettel
- Chen: Rechteck Entität, Ellipse Attribut, Raute Beziehung
- Unterstrichen = PK, doppelt = mehrwertig, gestrichelt = abgeleitet
- Kardinalität 1:1, 1:n, n:m; Min-Max (min,max)
- Schwache Entität: Partialschlüssel + Schlüssel der starken Entität
- Substantiv = Entität, Verb = Beziehung
