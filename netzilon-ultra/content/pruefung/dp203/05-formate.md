---
id: pr-dp203-formate
bereich: Prüfung
block: DP-203
kapitel: DP-203 Azure Data Engineer – Prüfungsfragen
titel: DP-203 – Dateiformate und Laden (Parquet, Avro, CSV, PolyBase)
stufe: Profi
typ: fragen
pruefungen: [DP-203]
fach: SQL / Admin
quellen: [DE_A_ohne_D_1_bis_370.pdf, T1_-_1_bis_40_-_Lösung_und_Kommentare.pdf, T1_-_41_bis_80_-_Lösung_und_Kommentare.pdf, T1_-_81_bis_120_-_Lösung_und_Kommentare.pdf, T1_-_121_bis_140_-_Lösung_und_Kommentare.pdf, T2_-_141_bis_160_-_Lösung_und_Kommentare.pdf, T2_-_161_bis_180_-_Lösung_und_Kommentare.pdf, T2_-_181_bis_200_-_Lösung_und_Kommentare.pdf, T2_-_201_bis_240_-_Lösung_und_Kommentare.pdf, T2_-_241_bis_280_-_Lösung_und_Kommentare.pdf, 1_bis_40.pdf, 41_bis_80.pdf, 81_bis_120.pdf, 121_bis_160.pdf, 161_bis_200.pdf, 201_bis_240.pdf, 241_bis_280.pdf, 281_bis_320.pdf, 320_bis_370.pdf, 02d_Data_Engineering_-_SQL_Beispiele_und_Prüfungsfragen.pdf, 03d_Data_Engineering_-_Prüfungsfragen.pdf]
verweise: []
---

## Quiz

? Serie (gleiches Szenario): Ein Speicherkonto enthält 100 GB Dateien mit Textzeilen und Zahlen; 75 % der Zeilen enthalten Beschreibungsdaten mit durchschnittlich 1,1 MB. Die Daten sollen schnell in ein Synapse-Data-Warehouse kopiert werden. Lösung: Sie konvertieren die Dateien in komprimierte, durch Trennzeichen getrennte Textdateien. Erreicht das das Ziel?
* Ja
- Nein
! Für das schnellste Laden empfiehlt Microsoft komprimierte Delimited-Text-Dateien (CSV). Dozent: „Komprimierte CSV-Dateien sind am schnellsten zu laden.“
@ DP-203 Frage 22

? Serie (gleiches Szenario): 100 GB Dateien, 75 % der Zeilen mit Beschreibungsdaten von durchschnittlich 1,1 MB, schnelles Kopieren in ein Synapse-Data-Warehouse. Lösung: Sie kopieren die Dateien in eine Tabelle mit Columnstore-Index. Erreicht das das Ziel?
- Ja
* Nein
! Ein Columnstore-Index beschleunigt das Lesen, nicht den Kopiervorgang (Dozent). Richtig wäre die Umwandlung in komprimierte Delimited-Text-Dateien.
@ DP-203 Frage 23

? Serie (gleiches Szenario): 100 GB Dateien, 75 % der Zeilen mit Beschreibungsdaten von durchschnittlich 1,1 MB, schnelles Kopieren in ein Synapse-Data-Warehouse. Lösung: Sie ändern die Dateien so, dass jede Zeile größer als 1 MB ist. Erreicht das das Ziel?
- Ja
* Nein
! PolyBase/COPY laden Zeilen bis 1 MB effizient; größere Zeilen verschlechtern das Laden. Richtig wäre die Umwandlung in komprimierte Delimited-Text-Dateien.
@ DP-203 Frage 24

? Ein ADLS-Gen2-Container soll CSV-Dateien aufnehmen, deren Größe je nach Ereignissen pro Stunde zwischen 4 KB und 5 GB schwankt. Die Dateien sollen für die Stapelverarbeitung (Batch) optimiert sein. Was tun Sie?
- Dateien in JSON konvertieren
- Dateien in Avro konvertieren
- Dateien komprimieren
* Dateien zusammenführen (Merge)
! Analytische Engines arbeiten am effizientesten mit wenigen großen Dateien (ca. 256 MB–100 GB); viele kleine Dateien erzeugen Overhead. Die Sammlung und der Dozent nennen Avro (B), die Community (73 %) „Dateien zusammenführen“ – letzteres entspricht der Microsoft-Empfehlung für Batch-Optimierung.
@ DP-203 Frage 28

? Ein Batch-Dataset im Parquet-Format wird mit Data Factory in ADLS Gen2 erzeugt und von einem serverlosen SQL-Pool genutzt. Die Speicherkosten sollen minimal sein. Was tun Sie?
* Snappy-Komprimierung für die Dateien verwenden
- OPENROWSET zum Abfragen der Parquet-Dateien verwenden
- eine externe Tabelle mit einer Teilmenge der Spalten erstellen
- alle Daten als Zeichenfolge in den Parquet-Dateien speichern
! Nur Komprimierung verringert den Speicherplatz. Eine externe Tabelle oder OPENROWSET ändert nichts an der Dateigröße. Die Sammlung nennt C, die Community (67 %) A.
@ DP-203 Frage 40

? Daten in Blob-Speicher storage1 werden vom dedizierten SQL-Pool Pool1 gelesen. Anforderungen: Pool1 soll unnötige Spalten und Zeilen überspringen können, Spaltenstatistiken sollen automatisch erstellt werden, Dateigröße minimal. Welcher Dateityp?
- JSON
* Parquet
- Avro
- CSV
! Parquet ist spaltenbasiert und komprimiert, enthält Min/Max-Metadaten (Row Groups überspringbar) und unterstützt automatische Statistikerstellung; für CSV müssen Statistiken manuell angelegt werden.
@ DP-203 Frage 55

? JSON-Rohdateien in Data Lake sollen für analytische Workloads transformiert werden. Anforderungen: Datentypen je Spalte enthalten, Abfrage einer Teilmenge von Spalten, leseintensive Analysen, minimale Dateigröße. Welches Format?
- JSON
- CSV
- Apache Avro
* Apache Parquet
! Parquet = spaltenbasiert, typisiert, stark komprimiert; nur benötigte Spalten werden gelesen. Avro ist zeilenbasiert (gut für Landing Zone und Schreiben).
@ DP-203 Frage 64

? Serie (gleiches Szenario): 100 GB Dateien, 75 % der Zeilen mit Beschreibungsdaten von durchschnittlich 1,1 MB, schnelles Kopieren in ein Synapse-Data-Warehouse. Lösung: Sie ändern die Dateien so, dass jede Zeile kleiner als 1 MB ist. Erreicht das das Ziel?
* Ja
- Nein
! PolyBase lädt Zeilen kleiner als 1 MB effizient (größere Zeilen sind problematisch). Community 70 % Ja.
@ DP-203 Frage 65

## Zuordnen

### DP-203 Frage 5 (Hotspot): ADLS Gen2 – Bericht1 liest 3 von 50 Spalten, Bericht2 fragt einen einzelnen Datensatz anhand eines Zeitstempels ab. Lesezeiten minimieren – welches Format je Bericht?
- Bericht1 (3 von 50 Spalten) => Parquet (spaltenbasiert)
- Bericht2 (Einzeldatensatz per Zeitstempel) => Avro (zeilenbasiert, Zeitstempel)

### DP-203 Frage 7 (Hotspot): Welches Dateiformat verwenden Sie für die Ausgabe aus Azure Data Factory?
- Spaltenorientiertes Format (Columnar) => Parquet
- JSON mit Zeitstempel => Avro (Schema im JSON-Format, unterstützt Zeitstempel)
