---
id: db-partitionierung
bereich: Datenbanken
pruefungen: [Schule, AP2]
fach: SQL / Datenbanken
block: D3
kapitel: Administration
titel: Tabellen partitionieren – Dateigruppen, Partitionsfunktion, Partitionsschema, SWITCH
stufe: Profi
quellen: [partitionierte_tabellen.pdf]
verweise: [db-backup-restore, db-ddl]
---

## Profi

### Idee
Bei sehr großen Tabellen wird die Tabelle **horizontal** in **Partitionen** zerlegt, die auf verschiedene **Dateigruppen** (Datendateien/Platten) verteilt werden können. Vorteile: bessere Verwaltbarkeit (Wartung, Backup einzelner Dateigruppen, Archivierung), **Partition Elimination** (Abfragen lesen nur relevante Partitionen), paralleler Zugriff, schnelles **Laden/Entfernen von Daten per SWITCH**. Voraussetzung: Partitionierungsspalte (z. B. Datum, Land, Punkte).

### Bausteine
1. **Dateigruppen und Dateien** anlegen (`ALTER DATABASE Movie ADD FILEGROUP PG_MOVIE_P2; ALTER DATABASE Movie ADD FILE (NAME='P2', FILENAME='…\P2.ndf', SIZE=10MB, FILEGROWTH=5MB) TO FILEGROUP PG_MOVIE_P2;`)
2. **Partitionsfunktion** (Partition Function): definiert die Grenzwerte.
3. **Partitionsschema** (Partition Scheme): ordnet Partitionen Dateigruppen zu.
4. **Partitionierte Tabelle** mit `ON schema(spalte)`.
```
CREATE PARTITION FUNCTION pfMovieByPoints (FLOAT)
AS RANGE RIGHT FOR VALUES (4.0, 6.0, 8.0, 9.0);      -- 5 Partitionen: [-∞,4[ [4,6[ [6,8[ [8,9[ [9,∞[
CREATE PARTITION SCHEME partitionSchema_MovieByPoints
AS PARTITION pfMovieByPoints TO (PG_MOVIE_P1, PG_MOVIE_P2, PG_MOVIE_P3, PG_MOVIE_P4, PG_MOVIE_P5);
CREATE TABLE Movie (ID INT, Titel VARCHAR(100), Punkte FLOAT) ON partitionSchema_MovieByPoints(Punkte);
```
`RANGE RIGHT`: Grenzwert gehört zur **rechten** (höheren) Partition ([4,6[); `RANGE LEFT`: Grenzwert gehört zur linken. n Grenzwerte → n+1 Partitionen; n+1 Dateigruppen im Schema (oder `ALL TO ([PRIMARY])`).

### Verwaltung
- Zeilen pro Partition: `SELECT $PARTITION.pfMovieByPoints(Punkte) AS Partition, COUNT(*) FROM Movie GROUP BY $PARTITION.pfMovieByPoints(Punkte);` bzw. `sys.partitions`.
- **MERGE RANGE**: Partitionen verschmelzen – `ALTER PARTITION FUNCTION pfMovieByPoints() MERGE RANGE (9.0);`
- **SPLIT RANGE**: Partition teilen (`ALTER PARTITION SCHEME … NEXT USED …; ALTER PARTITION FUNCTION … SPLIT RANGE (…)`).
- **SWITCH**: Metadaten-Operation, verschiebt eine ganze Partition in eine Staging-/Archivtabelle (identische Struktur, gleiche Dateigruppe, Check-Constraint) in Sekundenbruchteilen: `ALTER TABLE Movie SWITCH PARTITION 1 TO Movie_Archiv;`
- Partitionierung ≠ Sharding (verteilte Server) ≠ vertikale Partitionierung (Spalten aufteilen).

### Auswahl des Partitionsschlüssels (MONDIAL-Aufgabe)
Datenverteilung analysieren (`GROUP BY`), Schlüssel mit gleichmäßiger Verteilung und häufiger Filterung wählen: Kontinent/Region (wenige, ungleich große Werte), Ländercode, Bevölkerung/Fläche (Bereiche), Datum (typisch für Logs). Begründung dokumentieren.

## Einfach

Stell dir eine **riesige Bibliothek mit einem einzigen Regal** vor, in dem 10 Millionen Bücher stehen. Jede Suche dauert ewig. Jetzt teilst du die Bücher auf: **Regal A–F, G–M, N–R, S–Z**. Wer ein Buch mit „M“ sucht, geht nur noch zum zweiten Regal. Genau das ist **Partitionieren**: Eine große Tabelle wird in **Teile (Partitionen)** zerlegt, die auf **verschiedenen Regalen (Dateigruppen / Festplatten)** stehen. Für dich als Benutzer bleibt es **eine** Tabelle.

Man braucht drei Dinge:
1. **Regale bauen** = Dateigruppen mit Dateien.
2. **Teilungsregel** = die **Partitionsfunktion** („unter 4 Punkte, 4 bis 6, 6 bis 8 …“).
3. **Zuordnung** = das **Partitionsschema** („Teil 1 kommt in Regal 1, Teil 2 in Regal 2 …“).

Dann baust du die Tabelle und sagst: „Sortiere nach der Spalte **Punkte**“.

Der Trick **SWITCH**: Stell dir vor, du willst alte Bücher ins Archiv bringen. Statt jedes einzeln zu tragen, **hebst du das ganze Regal um** – das dauert eine Sekunde. SWITCH tauscht ganze Partitionen blitzschnell zwischen Tabellen aus. Mit **MERGE** schiebst du zwei benachbarte Regale zu einem zusammen.

## Merksatz
- **Funktion = Grenzen, Schema = Dateigruppen, Tabelle = ON Schema(Spalte).**
- **n Grenzwerte → n+1 Partitionen.**
- **SWITCH ist eine Metadaten-Operation (sekundenschnell).**
- **RANGE RIGHT: Grenzwert gehört nach rechts.**

## Prüfungsfalle
- Anzahl Dateigruppen im Schema muss Partitionszahl entsprechen (n+1).
- RANGE LEFT/RIGHT verwechselt → Grenzwerte landen in der falschen Partition.
- SWITCH setzt identische Struktur, Indizes und Dateigruppe voraus.
- Partitionierung ist keine Backup-Strategie, hilft aber beim Teil-Backup per Dateigruppe.
- Partitionierung bringt nur Vorteil, wenn Abfragen die Partitionsspalte filtern (Partition Elimination).

## Grafik
### Aufbau der Partitionierung
1. Dateigruppen: PG_MOVIE_P1 bis P5 mit je einer Datei
2. Partitionsfunktion: Grenzen 4.0, 6.0, 8.0, 9.0
3. Partitionsschema: Partition 1 bis 5 -> Dateigruppen P1 bis P5
4. Tabelle Movie: ON Schema(Punkte)
5. INSERT Blade Runner 9.1 -> landet in Partition 5
### SWITCH
1. Partition 1 (alte Daten) in Tabelle Movie
2. Movie -> Movie_Archiv: ALTER TABLE SWITCH PARTITION 1
3. Movie_Archiv: enthält jetzt die alten Daten, Movie ist leer in P1

## Lab
### SQL
Maschine: SQL-Server-VM (SSMS), Datenbank Movie (Dateien in C:\SQLData).
```
INSERT INTO Movie VALUES (100,'Star Wars',7.5),(101,'Blade Runner',9.1);
SELECT $PARTITION.pfMovieByPoints(Punkte) AS Partition, COUNT(*) AS Anzahl FROM Movie GROUP BY $PARTITION.pfMovieByPoints(Punkte);
ALTER PARTITION FUNCTION pfMovieByPoints() MERGE RANGE (9.0);
```

## Befehle
- `CREATE PARTITION FUNCTION f (typ) AS RANGE LEFT|RIGHT FOR VALUES (…)`
- `CREATE PARTITION SCHEME s AS PARTITION f TO (fg1, fg2, …)`
- `ALTER PARTITION FUNCTION f() SPLIT|MERGE RANGE (x)`
- `ALTER TABLE t SWITCH PARTITION n TO t2`
- `$PARTITION.f(spalte)` – Partitionsnummer eines Werts

## Übungen
- A: In welche Partition fällt der Film mit 7.5 Punkten (RANGE RIGHT, Grenzen 4, 6, 8, 9)? | L: Partition 3 ([6,8[).
- A: Wie viele Partitionen entstehen bei 4 Grenzwerten? | L: 5.
- A: Wie verschmelzen Sie die beiden letzten Partitionen? | L: ALTER PARTITION FUNCTION pfMovieByPoints() MERGE RANGE (9.0); – Danach 4 Partitionen, die letzte [8,∞[.
- A: Wozu dient SWITCH? | L: Blitzschnelles Verschieben ganzer Partitionen (z. B. Archivierung, Daten laden) ohne Datenkopie.
- A: Welche Spalte eignet sich für die MONDIAL-Tabelle City als Partitionsschlüssel? | L: z. B. Population (Bereiche) oder Ländercode/Kontinent; Begründung anhand der Datenverteilung.

## Karteikarten
- F: Was ist eine Partitionierung? | A: Horizontale Zerlegung einer großen Tabelle in Teile, verteilt auf Dateigruppen.
- F: Welche Objekte braucht man? | A: Dateigruppen, Partitionsfunktion, Partitionsschema, partitionierte Tabelle.
- F: Aufgabe der Partitionsfunktion? | A: Definiert die Grenzwerte (Wertebereiche) der Partitionen.
- F: Aufgabe des Partitionsschemas? | A: Ordnet Partitionen Dateigruppen zu.
- F: RANGE LEFT vs. RIGHT? | A: Grenzwert gehört zur linken bzw. rechten Partition.
- F: Wie viele Partitionen bei n Grenzwerten? | A: n+1.
- F: Was macht SWITCH? | A: Verschiebt eine Partition als Metadaten-Operation in eine andere Tabelle.
- F: Was macht MERGE RANGE? | A: Verschmilzt zwei benachbarte Partitionen.
- F: Was ist Partition Elimination? | A: Optimierer liest nur relevante Partitionen.

## Quiz
? Welches Objekt legt die Grenzwerte einer Partitionierung fest?
* Partitionsfunktion
- Partitionsschema
- Dateigruppe
- Index

? Wie viele Partitionen ergeben 4 Grenzwerte?
* 5
- 4
- 3
- 6

? Was ordnet Partitionen den Dateigruppen zu?
* Das Partitionsschema
- Die Partitionsfunktion
- Der Primärschlüssel
- Der Trigger

? Was bewirkt ALTER TABLE … SWITCH PARTITION?
* Verschiebt eine Partition schnell als Metadatenoperation
- Kopiert alle Daten zeilenweise
- Löscht die Tabelle
- Teilt die Partition

? Welche Option verschmilzt Partitionen?
* MERGE RANGE
- SPLIT RANGE
- SWITCH
- UNION

? Wohin gehört bei RANGE RIGHT der Wert 6.0?
* In die Partition [6,8[
- In die Partition [4,6[
- In die erste Partition
- In keine

? Wann bringt Partitionierung Leistungsvorteile?
* Wenn Abfragen nach der Partitionsspalte filtern
- Immer bei jeder Tabelle
- Nur bei kleinen Tabellen
- Nur bei NULL-Werten

? Was ist keine Voraussetzung für SWITCH?
* Unterschiedliche Spaltenstruktur
- Gleiche Spaltenstruktur
- Gleiche Dateigruppe
- Passende Constraints

## Lücken
- Eine {Partitionsfunktion} definiert die Grenzwerte, ein {Partitionsschema} ordnet Dateigruppen zu.

## Spickzettel
- Dateigruppen → Partition Function → Partition Scheme → Tabelle ON schema(spalte)
- n Grenzen = n+1 Partitionen; RANGE LEFT/RIGHT
- SPLIT / MERGE / SWITCH
- $PARTITION.f(wert)
