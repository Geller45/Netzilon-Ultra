---
id: db-erd-tabelle
bereich: Datenbanken
pruefungen: [Schule, AP1, AP2]
fach: SQL / Datenbanken
block: D1
kapitel: Datenmodellierung
titel: Vom ER-Modell zur Tabelle – 1:1, 1:n und n:m umsetzen
stufe: Fortgeschritten
quellen: [erd_zu_tabelle.pdf, relationen.pdf]
verweise: [db-er-modell, db-normalisierung, db-ddl]
---

## Profi

### Grundregeln
- Jeder **Entitätstyp** wird eine **Tabelle**, jede **Entität** eine **Zeile**, jedes **Attribut** eine **Spalte**.
- Der Wertebereich einer Spalte heißt **Domäne** (Domain), im DBMS der **Datentyp** (zunächst Text, Zahl, Datum, Zeit, Bool; später INT, VARCHAR, DATE, BIT …).
- Je Spalte festlegen: Datentyp, **NULL erlaubt?**, Schlüssel (PK/FK), eindeutig (UNIQUE).

| Spalte | Typ | NULL | Schlüssel | Eindeutig |
|---|---|---|---|---|
| EMail | Text | nein | PK | ja |
| Name | Text | nein | – | – |
| Fax | Text | ja | – | – |

### Regel 1: Entitätstyp → Tabelle
Eigene Tabelle, eine Spalte je Attribut, Datentyp und NULL-Zulässigkeit bestimmen, **Primärschlüssel markieren**.

### Regel 2: 1:1-Beziehung
Der PK der einen Tabelle wird als **Fremdschlüssel** in die andere übernommen. Welche Seite ihn aufnimmt, ist prinzipiell egal (Hinweis: Seite, die „meistens“ existiert, bekommt den FK nicht). In der FK-Spalte müssen die Werte **eindeutig** sein (UNIQUE) – kein Wert doppelt. Beziehungsattribute wandern als Spalten in die Tabelle mit dem FK.
Beispiel: Fahrer(**PersonalNr**, Name) – LKW(**Kennzeichen**, Modell, PersonalNr **FK UNIQUE**). Ist die FK-Spalte **NOT NULL**, muss jeder LKW einen Fahrer haben (Muss-Beziehung); erlaubt NULL = Kann-Beziehung.

### Regel 3: 1:n-Beziehung
Die Tabelle auf der **n-Seite** nimmt den PK der **1-Seite** als Fremdschlüssel auf. Werte dürfen sich beliebig wiederholen. Beispiel: Verlag(**VID**, Name, Tel) 1:n Buch(**ISBN**, Titel, Seiten, Jahr, **VID FK**).

### Regel 4: n:m-Beziehung
**Immer eine Zwischentabelle** (Verknüpfungs-/Assoziationstabelle). Beide PKs werden dort FK; zusammen bilden sie den **zusammengesetzten PK**. Beziehungsattribute werden Spalten der Zwischentabelle. Beispiel: Autor(**AUID**…), Buch(**ISBN**…), Autor_zu_Buch(**AUID FK, ISBN FK**).

### Weitere Fälle
- **Schwache Entität**: PK = FK der starken Entität + Partialschlüssel (z. B. Rechnung_Position(RechnungsNr, PosNr)).
- **Reflexive Beziehung**: FK auf die eigene Tabelle (Mitarbeiter.VorgesetzterID → Mitarbeiter.ID, NULL beim Chef).
- **Ternäre Beziehung**: Tabelle mit drei FKs.
- Das Ergebnis heißt **relationales Schema**: Notation `Buch(ISBN, Titel, Seiten, Jahr, #VID)` (PK unterstrichen, FK mit # oder gestrichelt).

## Einfach

Stell dir vor, du verwaltest eine Bücherei mit **Karteikarten**.

- **1:n** (ein Verlag, viele Bücher): Auf **jede Buchkarte** schreibst du die **Verlagsnummer**. Das Buch weiß also, zu welchem Verlag es gehört. Der Verlag muss nicht alle seine Bücher aufschreiben.
- **1:1** (ein Fahrer, ein LKW): Auf die LKW-Karte kommt die Personalnummer des Fahrers – und keine Nummer darf zweimal vorkommen.
- **n:m** (Autoren schreiben viele Bücher, Bücher haben mehrere Autoren): Hier geht es nicht mit einer Zahl auf der Karte. Du legst eine **dritte Liste** an, eine Art **Verbindungsliste**: „Autor 3 – Buch 12“, „Autor 3 – Buch 15“, „Autor 4 – Buch 12“. Jede Zeile ist ein Pfeil zwischen zwei Karten.

Faustregel: **Die „Viele“-Seite bekommt die Nummer der „Eins“-Seite.** Und wenn auf beiden Seiten „viele“ steht: eine Verbindungstabelle.

## Merksatz
- **1:n – der Fremdschlüssel steht auf der n-Seite.**
- **1:1 – Fremdschlüssel + UNIQUE.**
- **n:m – Zwischentabelle, PK = beide FKs.**
- Beziehungsattribute wandern zum Fremdschlüssel.

## Prüfungsfalle
- Fremdschlüssel nicht auf der 1-Seite einbauen (Verlag mit Spalte „ISBN“ wäre falsch).
- Bei n:m den **zusammengesetzten Primärschlüssel** der Zwischentabelle nicht vergessen.
- Bei 1:1 den **UNIQUE**-Zusatz am FK nennen, sonst entsteht eine 1:n-Beziehung.
- NULL im FK = Beziehung optional; NOT NULL = Pflichtbeziehung.
- Datentyp des FK muss zum PK passen.

## Grafik
### n:m auflösen
1. Autor: AUID 1 Müller, AUID 2 Schmidt
2. Buch: ISBN A, ISBN B
3. Autor -> Autor_zu_Buch: AUID wird Fremdschlüssel
4. Buch -> Autor_zu_Buch: ISBN wird Fremdschlüssel
5. Autor_zu_Buch: PK = (AUID, ISBN)
### 1:n umsetzen
1. Verlag: VID ist PK
2. Verlag -> Buch: VID wandert als FK in die Buch-Tabelle
3. Buch: viele Zeilen dürfen dieselbe VID haben

## Lab
### SQL
Maschine: SQL-Server-VM (SSMS), neue Datenbank Buecherei.
```
CREATE TABLE Verlag (VID INT PRIMARY KEY, Name VARCHAR(100) NOT NULL);
CREATE TABLE Buch (ISBN CHAR(13) PRIMARY KEY, Titel VARCHAR(200) NOT NULL, VID INT NOT NULL REFERENCES Verlag(VID));
CREATE TABLE Autor (AUID INT PRIMARY KEY, Name VARCHAR(100));
CREATE TABLE Autor_zu_Buch (AUID INT REFERENCES Autor(AUID), ISBN CHAR(13) REFERENCES Buch(ISBN), PRIMARY KEY (AUID, ISBN));
```

## Befehle
- `PRIMARY KEY (a, b)` – zusammengesetzter Primärschlüssel
- `REFERENCES Tabelle(Spalte)` – Fremdschlüssel
- `UNIQUE` – Wert darf nur einmal vorkommen (1:1)

## Übungen
- A: Setzen Sie Schüler 1:1 Schülerausweis in Tabellen um. | L: Schüler(SchuelerNr PK, Name); Ausweis(AusweisNr PK, Gueltig_bis, SchuelerNr FK UNIQUE NOT NULL).
- A: Setzen Sie Kunde 1:n Bestellung um. | L: Kunde(KundenNr PK, Name); Bestellung(BestellNr PK, Datum, KundenNr FK NOT NULL).
- A: Setzen Sie Artikel n:m Lager mit Mindestbestand und Höchstmenge um. | L: Artikel(ArtNr PK), Lager(LagerNr PK), Lagerbestand(ArtNr FK, LagerNr FK, Mindestbestand, Hoechstmenge, PK(ArtNr, LagerNr)).
- A: Wie setzen Sie die Beziehung Mitarbeiter ist Vorgesetzter von Mitarbeiter um? | L: Spalte VorgesetzterID in Mitarbeiter als FK auf Mitarbeiter(ID), NULL erlaubt für die Geschäftsführung.

## Karteikarten
- F: Entitätstyp wird zu …? | A: einer Tabelle (Entität = Zeile, Attribut = Spalte).
- F: Was ist eine Domäne? | A: Wertebereich/Datentyp einer Spalte.
- F: Wo steht der Fremdschlüssel bei 1:n? | A: In der Tabelle der n-Seite.
- F: Wie wird 1:1 umgesetzt? | A: FK in einer der beiden Tabellen, zusätzlich UNIQUE.
- F: Wie wird n:m umgesetzt? | A: Zwischentabelle mit beiden PKs als FK; PK = Kombination.
- F: Wohin kommen Attribute einer Beziehung? | A: In die Tabelle, die den FK bzw. die Beziehung aufnimmt (bei n:m: Zwischentabelle).
- F: Was bedeutet NULL im Fremdschlüssel? | A: Die Beziehung ist optional (kein Partner).
- F: Wie wird eine reflexive Beziehung umgesetzt? | A: FK-Spalte, die auf den PK der eigenen Tabelle zeigt.
- F: Wie sieht der PK einer schwachen Entität aus? | A: FK der starken Entität + Partialschlüssel.

## Quiz
? Wo steht der Fremdschlüssel bei einer 1:n-Beziehung Verlag–Buch?
* In der Tabelle Buch
- In der Tabelle Verlag
- In beiden Tabellen
- In einer dritten Tabelle

? Was ist bei n:m immer nötig?
* Eine Zwischentabelle
- Ein UNIQUE-Index
- Ein Trigger
- Eine View

? Was macht eine 1:1-Beziehung im Fremdschlüssel aus?
* Die FK-Spalte ist UNIQUE
- Die FK-Spalte erlaubt Duplikate
- Es gibt keinen FK
- Der FK ist immer NULL

? Wie sieht der PK der Zwischentabelle Autor_zu_Buch aus?
* Kombination aus AUID und ISBN
- Nur AUID
- Nur ISBN
- Ein Textfeld

? Was bedeutet FK NOT NULL?
* Jeder Datensatz muss einen Partner haben
- Die Beziehung ist optional
- Der FK ist eindeutig
- Der FK ist der PK

? Wohin gehört das Beziehungsattribut „Menge“ bei Artikel–Lager?
* In die Zwischentabelle
- In die Artikel-Tabelle
- In die Lager-Tabelle
- In keine Tabelle

? Was ist der Wertebereich einer Spalte?
* Die Domäne (Datentyp)
- Der Schlüssel
- Die Relation
- Die Entität

? Wie nennt man die Notation Buch(ISBN, Titel, #VID)?
* Relationales Schema
- ER-Diagramm
- View
- Datenwörterbuch

## Lücken
- Bei 1:n nimmt die {n}-Seite den Primärschlüssel der 1-Seite als {Fremdschlüssel} auf.
- Eine n:m-Beziehung braucht eine {Zwischentabelle}.

## Spickzettel
- Entitätstyp = Tabelle; Attribut = Spalte
- 1:1: FK + UNIQUE; 1:n: FK auf n-Seite; n:m: Zwischentabelle
- Zwischentabelle: PK = (FK1, FK2)
- Beziehungsattribute zum FK / in die Zwischentabelle
