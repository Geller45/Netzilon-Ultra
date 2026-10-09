---
id: pr-dp203-nachtrag-1
bereich: Prüfung
block: DP-203
kapitel: DP-203 Azure Data Engineer – Prüfungsfragen
titel: DP-203 – Nachtrag 1: Hotspot und Drag-and-Drop (Fragen 3 bis 41)
stufe: Profi
typ: fragen
pruefungen: [DP-203]
fach: SQL / Admin
quellen: [DE_A_ohne_D_1_bis_370.pdf, T1_-_1_bis_40_-_Lösung_und_Kommentare.pdf, T1_-_41_bis_80_-_Lösung_und_Kommentare.pdf, T1_-_81_bis_120_-_Lösung_und_Kommentare.pdf, T1_-_121_bis_140_-_Lösung_und_Kommentare.pdf, T2_-_141_bis_160_-_Lösung_und_Kommentare.pdf, T2_-_161_bis_180_-_Lösung_und_Kommentare.pdf, T2_-_181_bis_200_-_Lösung_und_Kommentare.pdf, T2_-_201_bis_240_-_Lösung_und_Kommentare.pdf, T2_-_241_bis_280_-_Lösung_und_Kommentare.pdf, 1_bis_40.pdf, 41_bis_80.pdf, 81_bis_120.pdf, 121_bis_160.pdf, 161_bis_200.pdf, 201_bis_240.pdf, 241_bis_280.pdf, 281_bis_320.pdf, 320_bis_370.pdf]
verweise: []
---

## Quiz

? Drag-and-Drop (Frage 3): SalesFact (Synapse, nach Monat partitioniert, 1 Mrd. Zeilen, gruppierter Columnstore-Index) enthält 36 Monate Umsatzdaten. Zu Monatsbeginn müssen Daten, die älter als 36 Monate sind, so schnell wie möglich entfernt werden. Welche drei Aktionen führen Sie in der gespeicherten Prozedur in welcher Reihenfolge aus?
* 1. Leere Tabelle SalesFact_Work mit gleichem Schema wie SalesFact erstellen; 2. Die Partition mit den veralteten Daten von SalesFact nach SalesFact_Work umschalten (SWITCH); 3. Tabelle SalesFact_Work löschen (DROP)
- 1. Per DELETE alle Zeilen älter als 36 Monate löschen; 2. Tabelle per CTAS kopieren; 3. SalesFact_Work löschen
- 1. Die Partition mit den veralteten Daten abschneiden (TRUNCATE); 2. Leere Tabelle SalesFact_Work erstellen; 3. Partition umschalten
- 1. Daten per CTAS in eine neue Tabelle kopieren; 2. DELETE auf die Originaltabelle; 3. SalesFact_Work löschen
! Partition Switching ist ein reiner Metadatenvorgang und daher bei einer Milliarde Zeilen viel schneller als DELETE: Hilfstabelle anlegen, Partition umschalten, Hilfstabelle verwerfen.
@ DP-203 Frage 3

? Frage 5 (Hotspot), Bericht 1: Es werden drei Spalten aus einer Datei mit 50 Spalten gelesen (Azure Data Lake Storage Gen2, Lesezeit minimieren). Welches Format empfehlen Sie?
- Avro
- CSV
* Parquet
- TSV
! Parquet speichert spaltenorientiert; nur die drei benötigten Spalten werden gelesen. (Hinweis: Die Quelle nennt hier CSV, das ist fachlich nicht sinnvoll – für Spaltenzugriffe gilt Parquet.)
@ DP-203 Frage 5

? Frage 5 (Hotspot), Bericht 2: Es wird ein einzelner Datensatz anhand eines Zeitstempels abgefragt (Lesezeit minimieren). Welches Format empfehlen Sie?
* Avro
- CSV
- Parquet
- TSV
! Avro ist zeilenorientiert und eignet sich für den Zugriff auf einzelne vollständige Datensätze (und unterstützt Zeitstempel).
@ DP-203 Frage 5

? Frage 7 (Hotspot): Aus Azure Data Factory werden Dateien ausgegeben. Welches Format verwenden Sie für ein spaltenorientiertes Ausgabeformat?
- Avro
- GZip
* Parquet
- TXT
! Parquet speichert Daten in Spalten (leseintensive Analytik); Avro speichert zeilenbasiert. GZip ist ein Kompressionsverfahren, TXT kein ADF-Format.
@ DP-203 Frage 7

? Frage 7 (Hotspot): Welches Format verwenden Sie für „JSON mit Zeitstempel“?
* Avro
- GZip
- Parquet
- TXT
! Ein Avro-Schema wird im JSON-Format definiert, Avro unterstützt Zeitstempel (Logical Types).
@ DP-203 Frage 7

? Frage 8 (Hotspot): Mit Data Factory werden 10 kleine JSON-Dateien aus ADLS Gen2 in einen anderen Ordner verschoben und transformiert (schnellste Abfragezeiten für serverlose SQL-Pools, Schema automatisch ableiten). Welches Kopierverhalten (Copy behavior) wählen Sie?
- Flatten hierarchy
* Merge files
- Preserve hierarchy
- Dateien einzeln unverändert kopieren
! Wenige große Dateien statt vieler kleiner Dateien beschleunigen serverlose Abfragen. (Die Quelle gibt hier eine mehrdeutige Übersetzung „Serverhierarchie“ an; sinngemäß gilt das Zusammenführen der Dateien.)
@ DP-203 Frage 8

? Frage 8 (Hotspot): Welcher Sink-Dateityp liefert die schnellsten Abfragen und leitet das Schema automatisch ab?
- CSV
- JSON
* Parquet
- TXT
! Parquet ist spaltenorientiert, komprimiert und enthält das Schema in der Datei.
@ DP-203 Frage 8

? Frage 9 (Hotspot): Sternschema in Azure Synapse. Alle Dimensionstabellen sind komprimiert kleiner als 2 GB und relativ statisch, die Faktentabelle Fact_DailyBookings ist ca. 6 TB groß. Welchen Tabellentyp verwenden Sie für Dim_Customer, Dim_Employee und Dim_Time?
- Hash-verteilt (Hash distributed)
- Round-Robin
* Repliziert (Replicated)
- Heap
! Kleine, statische Dimensionstabellen (< 2 GB) werden repliziert, damit Joins ohne Datenverschiebung auskommen.
@ DP-203 Frage 9

? Frage 9 (Hotspot): Welchen Tabellentyp verwenden Sie für die ca. 6 TB große Faktentabelle Fact_DailyBookings?
* Hash-verteilt (Hash distributed)
- Round-Robin
- Repliziert (Replicated)
- Heap
! Große Faktentabellen werden hash-verteilt (mit gruppiertem Columnstore-Index), um Joins und Aggregationen zu beschleunigen.
@ DP-203 Frage 9

? Frage 10 (Hotspot): ADLS-Gen2-Archivierung: Neue Daten werden häufig genutzt; Daten älter als fünf Jahre werden selten gebraucht, müssen aber auf Anfrage innerhalb einer Sekunde verfügbar sein. Was tun Sie mit den fünf Jahre alten Daten?
- Blob löschen
- In den Archivspeicher verschieben
* In den kühlen Speicher (Cool) verschieben
- In den heißen Speicher (Hot) verschieben
! Cool ist für selten genutzte Daten mit sofortigem Zugriff geeignet; Archive braucht Stunden zum Wiederherstellen.
@ DP-203 Frage 10

? Frage 10 (Hotspot): Daten älter als sieben Jahre werden nicht mehr gelesen, müssen aber zu den geringstmöglichen Kosten persistent bleiben. Was tun Sie?
- Blob löschen
* In den Archivspeicher verschieben
- In den kühlen Speicher verschieben
- In den heißen Speicher verschieben
! Archive ist die günstigste Ebene für dauerhaft gespeicherte, nicht benötigte Daten (Reaktivierung dauert Stunden).
@ DP-203 Frage 10

? Frage 11 (Drag-and-Drop): Sie erstellen eine partitionierte Tabelle im dedizierten SQL-Pool: CREATE TABLE table1 (ID INTEGER, col1 VARCHAR(10), col2 VARCHAR(10)) WITH (CLUSTERED INDEX (ID), ____ = HASH(ID), ____ (ID RANGE LEFT FOR VALUES (1, 1000000, 2000000))). Welche beiden Schlüsselwörter gehören in die Lücken (in dieser Reihenfolge)?
* DISTRIBUTION und PARTITION
- PARTITION und DISTRIBUTION
- PARTITION FUNCTION und PARTITION SCHEME
- COLLATE und PARTITION
! Mit DISTRIBUTION = HASH(Spalte) wird die Verteilung festgelegt, mit PARTITION (Spalte RANGE LEFT FOR VALUES (...)) die Partitionierung. In dedizierten SQL-Pools gibt es keine getrennten Partitionsfunktionen/-schemas.
@ DP-203 Frage 11

? Frage 14 (Hotspot): Dedizierter Synapse-SQL-Pool, Dynamic Data Masking. User1 ist Serveradministrator, User2 ist db_datareader. Welche Werte erhält User2, wenn er die Spalte YearlyIncome (Datentyp money, Maskierungsfunktion default()) abfragt?
- eine Zufallszahl
- die in der Datenbank gespeicherten Werte
- XXXX
* 0
! default() maskiert numerische Datentypen mit 0 (Zeichenfolgen mit XXXX, Datumswerte mit 1900-01-01).
@ DP-203 Frage 14

? Frage 14 (Hotspot): Welche Werte erhält User1 (Serveradministrator) bei einer Abfrage der Spalte BirthDate (Maskierung default())?
- ein zufälliges Datum
* die in der Datenbank gespeicherten Werte
- XXXX
- 1900-01-01
! Serveradministratoren (und Benutzer mit UNMASK-Berechtigung) sehen die unmaskierten Daten.
@ DP-203 Frage 14

? Frage 16 (Hotspot): Parquet-Dateien sollen mit einer Data-Factory-Kopieraktivität von Storage1 nach Storage2 kopiert werden: keine Transformation, ursprüngliche Ordnerstruktur beibehalten, möglichst schnell. Welchen Quell-Dataset-Typ wählen Sie?
* Binary
- Parquet
- Delimited text
- JSON
! Ohne Transformation werden die Dateien am schnellsten als Binary-Dataset 1:1 kopiert (kein Parsen). (Die Quelle nennt Parquet; für reine Dateikopien ist Binary üblich und schneller.)
@ DP-203 Frage 16

? Frage 16 (Hotspot): Welches Copy behavior wählen Sie, damit die ursprüngliche Ordnerstruktur erhalten bleibt?
- FlattenHierarchy
- MergeFiles
* PreserveHierarchy
- Alle drei erhalten die Struktur
! PreserveHierarchy (Standard) erhält die relative Dateihierarchie; FlattenHierarchy legt alle Dateien auf die erste Ebene, MergeFiles fasst sie zu einer Datei zusammen.
@ DP-203 Frage 16

? Frage 19 (Hotspot): Täglich werden ca. 1 Million Zeilen aus Blob Storage in eine Stagingtabelle eines Synapse-SQL-Pools geladen; die Tabelle wird vor jedem Laden abgeschnitten. Die Ladedauer soll minimal sein. Welche Verteilung wählen Sie?
- Hash
- Repliziert
* Round-Robin
- Keine Angabe möglich
! Round-Robin lädt am schnellsten, weil keine Verteilungsspalte berechnet wird – ideal für Stagingtabellen. (Die Quelle nennt Hash; für Staging gilt Round-Robin.)
@ DP-203 Frage 19

? Frage 19 (Hotspot): Welchen Index und welche Partitionierung wählen Sie für die Stagingtabelle (Ladedauer minimieren)?
* Heap, keine Partitionierung
- Gruppierter Columnstore, Partitionierung nach Datum
- Gruppierter Index, Partitionierung nach Datum
- Gruppierter Columnstore, keine Partitionierung
! Heap-Tabellen laden schneller als Indextabellen; bei ca. 1 Mio. Zeilen pro Tag lohnt sich keine Partitionierung (Staging wird ohnehin geleert).
@ DP-203 Frage 19

? Frage 21 (Hotspot): Sternschema für Website-Analyse mit den Tabellen DimDate, DimChannel, DimEvent und FactEvents. Zu welcher Tabelle gehört die Spalte EventCategory?
- DimChannel
- DimDate
* DimEvent
- FactEvents
! EventCategory, EventAction und EventLabel beschreiben das Ereignis und gehören in die Dimension DimEvent.
@ DP-203 Frage 21

? Frage 21 (Hotspot): Zu welcher Tabelle gehört die Spalte ChannelGrouping?
* DimChannel
- DimDate
- DimEvent
- FactEvents
! ChannelGrouping beschreibt den Kanal (z. B. Social) und gehört in die Dimension DimChannel.
@ DP-203 Frage 21

? Frage 21 (Hotspot): Zu welcher Tabelle gehört die Spalte TotalEvents?
- DimChannel
- DimDate
- DimEvent
* FactEvents
! Messwerte (TotalEvents, UniqueEvents, SessionWithEvents) gehören in die Faktentabelle.
@ DP-203 Frage 21

? Frage 29 (Hotspot): Eine Lifecycle-Richtlinie in ADLS Gen2 hat die Aktion tierToCool (daysAfterModificationGreaterThan 30), Filter blockBlob mit prefixMatch „container1/contoso“ und löscht Versionen nach 60 Tagen. Was passiert mit den Dateien nach 30 Tagen?
- Sie werden aus dem Container gelöscht.
- Sie werden in den Archivspeicher verschoben.
* Sie werden in den kalten Speicher (Cool) verschoben.
- Sie werden in den heißen Speicher verschoben.
! tierToCool verschiebt Blobs von Hot nach Cool.
@ DP-203 Frage 29

? Frage 29 (Hotspot): Auf welchen Pfad trifft die Richtlinie (prefixMatch „container1/contoso“) zu?
* container1/contoso.csv
- container1/docs/contoso.json
- container1/mycontoso/contoso.csv
- auf alle drei Pfade
! prefixMatch vergleicht den Anfang des Blobnamens: Nur container1/contoso.csv beginnt mit „container1/contoso“.
@ DP-203 Frage 29

? Frage 31 (Hotspot): Protokolle in account1: Infrastruktur 60 Tage, Anwendung 360 Tage Aufbewahrung, kein Zugriff erwartet; Speicherkosten minimieren. Welche Ebenen wählen Sie?
- Beide Protokollarten in der Archivebene
- Beide Protokollarten in der kühlen Ebene
* Infrastrukturprotokolle in der kühlen Ebene, Anwendungsprotokolle in der Archivebene
- Infrastrukturprotokolle in der Archivebene, Anwendungsprotokolle in der kühlen Ebene
! Archiv hat 180 Tage Mindestspeicherdauer: Für 60 Tage wäre das teurer (Frühlöschgebühr), daher Cool (30 Tage Minimum); für 360 Tage ist Archive am günstigsten.
@ DP-203 Frage 31

? Frage 31 (Hotspot): Womit löschen Sie die Protokolle am Ende der Aufbewahrungszeit automatisch?
- Azure-Data-Factory-Pipelines
* Lebenszyklusverwaltungsregeln von Azure Blob Storage (Lifecycle Management)
- Unveränderlicher Azure-Blob-Speicher mit zeitbasierten Aufbewahrungsrichtlinien
- Azure-Monitor-Warnungen
! Lifecycle-Management-Regeln löschen oder verschieben Blobs regelbasiert; Immutable Storage verhindert dagegen das Löschen.
@ DP-203 Frage 31

? Frage 35 (Hotspot): Eine SQL-Server-Datenbank in dritter Normalform wird in ein Sternschema in einem dedizierten Synapse-SQL-Pool migriert (Lesevorgänge optimieren). Wie transformieren Sie die Daten für die Dimensionstabellen?
- Beibehaltung der dritten Normalform
- Normalisierung zur vierten Normalform
* Denormalisierung zur zweiten Normalform
- Normalisierung zur ersten Normalform
! Dimensionstabellen werden denormalisiert, damit Lesezugriffe weniger Joins brauchen.
@ DP-203 Frage 35

? Frage 35 (Hotspot): Was verwenden Sie für die Primärschlüsselspalten der Dimensionstabellen?
* Neue IDENTITY-Spalten
- Eine neue berechnete Spalte
- Die Business-Key-Spalte des Quellsystems
- Eine GUID aus dem Quellsystem
! Ersatzschlüssel (Surrogate Keys) per IDENTITY entkoppeln das Warehouse vom Quellsystem.
@ DP-203 Frage 35

? Frage 36 (Hotspot): Azure Databricks, Dataset Purchases mit StoreID, Year, Month, Day, Hour. Stündliche inkrementelle Ladepipelines je StoreID, Speicherkosten minimieren. Welche Schreibmethode vervollständigt df.write ... .mode("append")?
- bucketBy
* partitionBy
- range
- sortBy
! partitionBy("StoreID", "Year", "Month", "Day", "Hour") legt eine Ordnerhierarchie an; so kann je Store und Stunde inkrementell geschrieben werden.
@ DP-203 Frage 36

? Frage 36 (Hotspot): Mit welchem Ausgabeformat speichern Sie die Daten am kostengünstigsten?
- .csv("/Purchases")
- .json("/Purchases")
* .parquet("/Purchases")
- .saveAsTable("/Purchases")
! Parquet ist komprimiert und spaltenorientiert und spart daher Speicherkosten.
@ DP-203 Frage 36

? Frage 38 (Hotspot): Die Tabelle DimProduct hat ProductKey (IDENTITY), ProductSourceID, Attribute sowie SellStartDate, SellEndDate, RowInsertedDateTime, RowUpdatedDateTime und ETLAuditID. Um welchen SCD-Typ handelt es sich?
- Typ 0
- Typ 1
* Typ 2
- Typ 3
! Typ 2 versioniert Zeilen: Ersatzschlüssel plus Gültigkeitsspalten (SellStartDate/SellEndDate).
@ DP-203 Frage 38

? Frage 38 (Hotspot): Was ist die Spalte ProductKey (IDENTITY) in DimProduct?
* ein Ersatzschlüssel (Surrogate Key)
- ein Geschäftsschlüssel (Business Key)
- eine Auditspalte
- ein Fremdschlüssel
! ProductKey wird im Warehouse vergeben; ProductSourceID ist der Geschäftsschlüssel aus dem Quellsystem.
@ DP-203 Frage 38

? Frage 41 (Drag-and-Drop): Benutzer sollen aus einem serverlosen Synapse-SQL-Pool bestimmte Dateien in einem ADLS-Gen2-Konto abfragen können. Welche drei Aktionen führen Sie aus?
* Externe Datenquelle erstellen, externes Dateiformat-Objekt erstellen, externe Tabelle erstellen
- Tabelle erstellen, CTAS-Abfrage erstellen, externe Datenquelle erstellen
- Externes Dateiformat erstellen, Tabelle erstellen, CTAS-Abfrage erstellen
- Externe Tabelle erstellen, Tabelle erstellen, externe Datenquelle erstellen
! Externe Tabellen im serverlosen Pool benötigen eine externe Datenquelle (Speicherort) und ein externes Dateiformat; danach wird die externe Tabelle darauf definiert (die Reihenfolge von Quelle und Format ist beliebig).
@ DP-203 Frage 41
