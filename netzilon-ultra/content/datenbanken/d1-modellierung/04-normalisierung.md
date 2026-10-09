---
id: db-normalisierung
bereich: Datenbanken
pruefungen: [Schule, AP1, AP2]
fach: SQL / Datenbanken
block: D1
kapitel: Datenmodellierung
titel: Normalisierung – Anomalien, 1NF, 2NF, 3NF, BCNF
stufe: Fortgeschritten
quellen: [Normalisierung.pdf, 01-Normalisierung.pdf, 02-Normalisierung.pdf, Normalisierung_MH.pdf]
verweise: [db-er-modell, db-erd-tabelle, db-einfuehrung]
---

## Profi

### Motivation: Redundanz und Anomalien
Redundanz (Mehrfachspeicherung) kostet Speicher und führt zu **Inkonsistenz**. Daten aus Listen und Excel-Tabellen vermengen mehrere Entitäten; direkt übernommen entstehen **Anomalien**:
- **UPDATE-Anomalie (Änderungsanomalie)**: Telefonnummer eines Verlags steht in 50 Zeilen; wird eine vergessen, sind die Daten widersprüchlich.
- **INSERT-Anomalie (Einfügeanomalie)**: Ein neuer Verlag ohne Bücher kann nicht eingetragen werden (Buchspalten bleiben leer / PK unvollständig).
- **DELETE-Anomalie (Löschanomalie)**: Werden alle Bücher eines Verlags gelöscht, verschwindet der Verlag mit.
Ziel: Daten einer Entität unabhängig von anderen bearbeiten können – durch **Normalisierung** (Zerlegung in Tabellen höherer Normalform), in der Praxis bis zur **3NF**.

### Funktionale Abhängigkeit
- Y ist **funktional abhängig** von X (X → Y), wenn zu jedem Wert von X genau ein Wert von Y gehört. Beispiel: {PersonalNr} → {Name}.
- **Voll funktional abhängig**: Y hängt vom gesamten X ab, nicht von einer echten Teilmenge.
- **Transitiv abhängig**: A → B und B → C (B kein Schlüssel), also A → C nur „über“ B.
- **Determinante**: Attribut(e), von denen andere funktional abhängen.

### 1. Normalform (1NF)
Alle Attribute sind **atomar** (ein Wert je Zelle, keine Wiederholungsgruppen, keine Listen wie „SQL, C#, Linux“) und jeder Datensatz ist über einen **Primärschlüssel** eindeutig. Was atomar ist, hängt von der Geschäftslogik ab: PLZ und Ort trennt man fast immer (Suche nach beiden), Straße + Hausnummer oft nicht. Für die 1NF darf kurzzeitig Redundanz entstehen (Mehrfachzeilen), die später verschwindet.

### 2. Normalform (2NF)
1NF + jedes **Nichtschlüsselattribut** hängt **voll funktional vom gesamten Primärschlüssel** ab. Relevant nur bei **zusammengesetztem Schlüssel**; bei einfachem Schlüssel ist 1NF automatisch 2NF.
Beispiel CD-Tabelle (CDID, TrackNr, Interpret, Titel, Track): Interpret und Titel hängen nur von CDID ab → auslagern in CD(CDID, Interpret, Titel); Track(CDID FK, TrackNr, Track).
Beispiel Projekt: {SNR} → Name; {Projekt} → Beschreibung, Typ; {SNR, Projekt} → Stunden ⇒ drei Tabellen Student(SNR, Name), Projekt(Projekt, Beschreibung, Typ), Mitarbeit(SNR, Projekt, Stunden).

### 3. Normalform (3NF)
2NF + **kein Nichtschlüsselattribut ist transitiv vom Schlüssel abhängig** (es gibt keine Abhängigkeiten zwischen Nichtschlüsselattributen). Beispiel: CD(CDID, Interpret, Titel, Herkunftsland): CDID → Interpret → Herkunftsland. Zerlegung: CD(CDID, Interpret FK, Titel) und Interpret(Interpret, Herkunftsland). Beispiel Rechnerraum: PcNr → Raum → Standort ⇒ Raum(Raum, Standort) auslagern.

### BCNF (Boyce-Codd)
Etwas strenger als 3NF: **Jede Determinante ist ein Schlüsselkandidat.** Nur relevant bei mehreren überlappenden Schlüsselkandidaten (z. B. LieferantNr ↔ LieferantName). Weitere: 4NF (mehrwertige Abhängigkeiten), 5NF.

### Vorgehen in der Prüfung
1. Schlüssel bestimmen, Abhängigkeiten notieren.
2. 1NF: Listen in Zeilen auflösen, Adressen zerlegen.
3. 2NF: Teilabhängigkeiten auslagern.
4. 3NF: transitive Abhängigkeiten auslagern.
5. Fremdschlüssel setzen, Ergebnis als Schema `Tabelle(PK, Attribut, #FK)` notieren.
**Denormalisierung** erfolgt bewusst aus Performance-Gründen (z. B. Data Warehouse).

## Einfach

Stell dir eine **Klassenliste** vor, in der in jeder Zeile steht: Schülername, seine Klasse, der Klassenlehrer **und** die Adresse des Lehrers. Wenn der Lehrer umzieht, musst du die Adresse bei **jedem** Schüler seiner Klasse ändern. Vergisst du einen, stimmt die Liste nicht mehr. Das ist die **Änderungs-Anomalie**. Willst du einen neuen Lehrer eintragen, der noch keine Klasse hat, geht das nicht (**Einfüge-Anomalie**). Löschst du den letzten Schüler einer Klasse, ist auch der Lehrer weg (**Lösch-Anomalie**).

Die Lösung heißt **Normalisieren** – das ist **Aufräumen in drei Schritten**:
1. **1. Normalform – „Eine Zelle, ein Wert.“** In ein Feld gehört nur **eine** Sache. Nicht „SQL, C#, Linux“ in ein Kästchen, sondern drei Zeilen. Und nicht „Hauptstr. 5, 44532 Lünen“ in einem Kästchen, sondern Straße, PLZ, Ort einzeln.
2. **2. Normalform – „Alles hängt am ganzen Schlüssel.“** Wenn deine Zeile durch **zwei** Dinge gefunden wird (z. B. CD-Nummer + Titelnummer), muss jede weitere Info von **beiden** abhängen. Der Name der Band hängt nur an der CD, nicht am Track – also in eine eigene CD-Tabelle.
3. **3. Normalform – „Nur direkt am Schlüssel, nicht über Umwege.“** Wenn die CD zur Band gehört und die Band zu einem Land, dann gehört das Land in die Band-Tabelle, nicht in die CD-Tabelle.

Merkformel (Eselsbrücke): **„Der Schlüssel, der ganze Schlüssel und nichts als der Schlüssel – so wahr mir Codd helfe.“** Danach darf jede Information **nur an einer Stelle** stehen. Willst du etwas ändern, änderst du es einmal.

## Merksatz
- **1NF: atomar. 2NF: ganzer Schlüssel. 3NF: nichts als der Schlüssel.**
- „The key, the whole key and nothing but the key, so help me Codd.“
- Anomalien: **Insert – Update – Delete.**
- 2NF ist nur bei **zusammengesetztem** Schlüssel ein Thema.
- Nach dem Normalisieren: **Fremdschlüssel** nicht vergessen.

## Prüfungsfalle
- Wiederholungsgruppen („1,2,3“ in einer Zelle) verletzen die **1NF**, nicht die 2NF.
- Bei einfachem Primärschlüssel kann die 2NF **nicht** verletzt sein.
- Transitive Abhängigkeit (Raum → Standort) = **3NF**, Teilabhängigkeit = **2NF**.
- Nach dem Zerlegen muss die Verbindung (Fremdschlüssel) erhalten bleiben – sonst geht Information verloren.
- Normalisierung vermeidet Redundanz, **verbessert nicht automatisch die Performance** (mehr JOINs).
- Aufgabe „Welche Normalform hat die Tabelle?“ = höchste erfüllte Form nennen und die verletzte begründen.

## Grafik
### Normalisierung Schritt für Schritt
1. Ausgangstabelle: Lektor, Projekte als Liste in einer Zelle
2. 1NF: Liste wird aufgelöst, eine Zeile je Lektor und Projekt
3. 2NF: Name hängt nur an LektorNr – Tabelle Lektor wird ausgelagert
4. 2NF: Titel hängt nur an ProjektNr – Tabelle Projekt wird ausgelagert
5. Mitarbeit: PK (LektorNr, ProjektNr), Attribut Stunden
6. 3NF: keine transitiven Abhängigkeiten mehr – fertig
### Update-Anomalie
1. Anwendung -> Datenbank: UPDATE Tel von Verlag APRESS in Zeile 1
2. Datenbank: Zeilen 2 bis 5 enthalten noch die alte Nummer
3. Datenbank: Inkonsistenz entsteht

## Lab
### SQL
Maschine: SQL-Server-VM (SSMS). 3NF-Schema für Aufgabe Lektor/Projekt:
```
CREATE TABLE Lektor (LektorNr INT PRIMARY KEY, Name VARCHAR(80));
CREATE TABLE Projekt (ProjektNr INT PRIMARY KEY, Titel VARCHAR(120));
CREATE TABLE Mitarbeit (LektorNr INT REFERENCES Lektor, ProjektNr INT REFERENCES Projekt, Stunden INT, PRIMARY KEY (LektorNr, ProjektNr));
```

## Übungen
- A: Lektor-Tabelle: LektorNr, Name, ProjektNr (Liste 1,2,3), Titel, Stunden – bringen Sie sie in die 3NF. | L: Lektor(LektorNr, Name); Projekt(ProjektNr, Titel); Mitarbeit(LektorNr FK, ProjektNr FK, Stunden), PK der Mitarbeit = (LektorNr, ProjektNr).
- A: PC-Tabelle: PcNr, Name, Raum, Standort, Status, Generation, SNr, Schülername – 3NF? | L: PC(PcNr, Name, Status, Generation, Raum FK, SNr FK); Raum(Raum, Standort); Schüler(SNr, Name). Transitiv: PcNr → Raum → Standort.
- A: AG-Tabelle (Schüler, Name, Klasse, Lehrer, Angebote als Liste, Beschreibung, Zeit) – 3NF. | L: Schüler(SNr, Name, Klasse FK); Klasse(Klasse, Lehrer); Angebot(AngebotNr, Beschreibung); Teilnahme(SNr, AngebotNr, Zeit).
- A: Warum ist die Tabelle CD(CDID, TrackNr, Interpret, Titel, Track) nicht in 2NF? | L: Interpret und Titel hängen nur von CDID ab (Teil des zusammengesetzten Schlüssels).
- A: Nennen Sie die drei Anomalien mit je einem Beispiel. | L: Update (Verlagstelefon in vielen Zeilen), Insert (neuer Verlag ohne Buch nicht eintragbar), Delete (letztes Buch löschen entfernt den Verlag).

## Karteikarten
- F: Was ist Redundanz? | A: Mehrfachspeicherung derselben Information; führt zu Inkonsistenz-Risiko und Speicherverbrauch.
- F: Welche drei Anomalien gibt es? | A: Insert-, Update- (Änderungs-) und Delete- (Lösch-) Anomalie.
- F: Definition 1NF? | A: Alle Attribute atomar, keine Wiederholungsgruppen, eindeutiger Primärschlüssel.
- F: Definition 2NF? | A: 1NF + jedes Nichtschlüsselattribut voll funktional vom ganzen (zusammengesetzten) Primärschlüssel abhängig.
- F: Definition 3NF? | A: 2NF + keine transitiven Abhängigkeiten zwischen Nichtschlüsselattributen.
- F: Wann ist 1NF automatisch 2NF? | A: Wenn der Primärschlüssel nicht zusammengesetzt ist.
- F: Was ist eine transitive Abhängigkeit? | A: A → B → C, wobei B kein Schlüssel ist; C hängt nur über B von A ab.
- F: Was fordert die BCNF? | A: Jede Determinante ist ein Schlüsselkandidat.
- F: Was ist funktionale Abhängigkeit? | A: Zu jedem Wert von X gibt es genau einen Wert von Y (X → Y).
- F: Eselsbrücke für 1NF-3NF? | A: Der Schlüssel, der ganze Schlüssel und nichts als der Schlüssel.
- F: Bis zu welcher Normalform wird in der Praxis normalisiert? | A: Meist bis zur 3NF, selten BCNF.

## Quiz
? Welche Normalform verletzt die Zelle „SQL, C#, Linux“?
* 1NF
- 2NF
- 3NF
- BCNF

? Wann kann die 2NF überhaupt verletzt werden?
* Bei zusammengesetztem Primärschlüssel
- Bei jedem Primärschlüssel
- Nur bei Fremdschlüsseln
- Nur bei NULL-Werten

? Was ist eine Update-Anomalie?
* Eine Information ist mehrfach gespeichert und wird nur teilweise geändert
- Ein Datensatz kann nicht eingefügt werden
- Ein Datensatz wird versehentlich gelöscht
- Der Primärschlüssel ändert sich

? PcNr → Raum → Standort. Welche Normalform wird verletzt?
* 3NF (transitive Abhängigkeit)
- 1NF
- 2NF
- keine

? Was bedeutet atomar?
* Jede Zelle enthält genau einen nicht weiter zerlegbaren Wert
- Die Spalte ist ein Primärschlüssel
- Die Tabelle hat keine Fremdschlüssel
- Die Spalte ist verschlüsselt

? Interpret hängt nur von CDID, Schlüssel ist (CDID, TrackNr). Welche Form wird verletzt?
* 2NF
- 1NF
- 3NF
- Keine

? Was ist das Ziel der Normalisierung?
* Redundanz und Anomalien vermeiden
- Abfragen immer schneller machen
- Mehr Tabellen zu erzeugen
- Daten zu verschlüsseln

? Was fordert die BCNF zusätzlich zur 3NF?
* Jede Determinante muss Schlüsselkandidat sein
- Keine Fremdschlüssel
- Genau eine Tabelle
- Alle Spalten NOT NULL

## Lücken
- Die {1NF} fordert atomare Attribute, die {2NF} volle Abhängigkeit vom ganzen Schlüssel, die {3NF} keine transitiven Abhängigkeiten.
- Die drei Anomalien heißen Insert-, {Update}- und {Delete}-Anomalie.

## Reihenfolge
### Normalisierung
1. Schlüssel und Abhängigkeiten bestimmen
2. 1NF herstellen (atomare Werte)
3. 2NF herstellen (Teilabhängigkeiten auslagern)
4. 3NF herstellen (transitive Abhängigkeiten auslagern)
5. Fremdschlüssel setzen

## Zuordnen
### Normalform und Problem
- Liste in einer Zelle => verletzt 1NF
- Teilabhängigkeit vom Schlüssel => verletzt 2NF
- Transitive Abhängigkeit => verletzt 3NF
- Determinante kein Schlüsselkandidat => verletzt BCNF

## Freitext
- F: Erläutern Sie, warum Daten normalisiert werden. | M: Redundanz vermeiden, Anomalien (Insert/Update/Delete) verhindern, Konsistenz sichern, Speicher sparen, Daten einer Entität unabhängig pflegen. | P: 4

## Spickzettel
- 1NF atomar; 2NF voll abhängig vom ganzen Schlüssel; 3NF nicht transitiv
- Anomalien: Insert, Update, Delete
- Der Schlüssel, der ganze Schlüssel, nichts als der Schlüssel
- 2NF nur bei zusammengesetztem PK
- BCNF: jede Determinante ist Schlüsselkandidat
