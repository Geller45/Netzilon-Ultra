---
id: pr-dp203-nachtrag-2
bereich: Prüfung
block: DP-203
kapitel: DP-203 Azure Data Engineer – Prüfungsfragen
titel: DP-203 – Nachtrag 2
stufe: Profi
typ: fragen
pruefungen: [DP-203]
fach: SQL / Admin
quellen: [DE_A_ohne_D_1_bis_370.pdf, T1_-_1_bis_40_-_Lösung_und_Kommentare.pdf, T1_-_41_bis_80_-_Lösung_und_Kommentare.pdf, T1_-_81_bis_120_-_Lösung_und_Kommentare.pdf, T1_-_121_bis_140_-_Lösung_und_Kommentare.pdf, T2_-_141_bis_160_-_Lösung_und_Kommentare.pdf, T2_-_161_bis_180_-_Lösung_und_Kommentare.pdf, T2_-_181_bis_200_-_Lösung_und_Kommentare.pdf, T2_-_201_bis_240_-_Lösung_und_Kommentare.pdf, T2_-_241_bis_280_-_Lösung_und_Kommentare.pdf, 1_bis_40.pdf, 41_bis_80.pdf, 81_bis_120.pdf, 121_bis_160.pdf, 161_bis_200.pdf, 201_bis_240.pdf, 241_bis_280.pdf, 281_bis_320.pdf, 320_bis_370.pdf]
verweise: []
---

## Quiz

? Frage 44 (Drag-and-Drop): Tausende CSV-Dateien (mit Kopfzeile) liegen in ADLS Gen2 und sollen täglich per PolyBase in einen dedizierten Synapse-SQL-Pool geladen werden; die Kopfzeile muss übersprungen werden. Welche drei Aktionen bereiten die Datenbankobjekte in welcher Reihenfolge vor?
* 1. Datenbankbezogene Anmeldeinformationen (Database Scoped Credential) mit Azure-AD-Anwendung und Dienstprinzipalschlüssel erstellen; 2. Externe Datenquelle mit abfs-Speicherort erstellen; 3. Externes Dateiformat erstellen und die Option FIRST_ROW setzen
- 1. Externe Datenquelle mit abfs-Speicherort erstellen; 2. CREATE EXTERNAL TABLE AS SELECT (CETAS) mit Reject-Optionen ausführen; 3. Externes Dateiformat erstellen
- 1. Externes Dateiformat mit FIRST_ROW erstellen; 2. CETAS mit Reject-Optionen ausführen; 3. Externe Datenquelle erstellen
- 1. CETAS mit Reject-Optionen ausführen; 2. Externes Dateiformat erstellen; 3. Anmeldeinformationen erstellen
! Reihenfolge: Credential, externe Datenquelle (abfs[s]://), externes Dateiformat mit FIRST_ROW = 2. Die CETAS-Anweisung gehört nicht zur Vorbereitung.
@ DP-203 Frage 44

? Frage 45 (Hotspot): Faktentabelle FactTransaction (Transaktionen H1/2020) im dedizierten SQL-Pool: Löschen von Daten älter als 10 Jahre soll schnell gehen, Abfragen für Year-to-Date sollen wenig E/A erzeugen. Welches Schlüsselwort steht in WITH (CLUSTERED COLUMNSTORE INDEX, DISTRIBUTION = HASH([TransactionTypeID]), ____ (… RANGE RIGHT FOR VALUES (20200101, …)))?
- DISTRIBUTION
* PARTITION
- TRUNCATE_TARGET
- CLUSTERED COLUMNSTORE INDEX
! RANGE RIGHT FOR VALUES gehört zur PARTITION-Klausel; alte Partitionen lassen sich per Switch/Truncate sehr schnell entfernen.
@ DP-203 Frage 45

? Frage 45 (Hotspot): Nach welcher Spalte wird partitioniert, damit Year-to-Date-Abfragen möglichst wenige Partitionen lesen?
* [TransactionDateID]
- [TransactionDateID], [TransactionTypeID]
- HASH([TransactionTypeID])
- ROUND ROBIN
! Die Partitionierung erfolgt nach der Datumsspalte; so werden bei YTD-Abfragen nur die passenden Monatspartitionen gelesen.
@ DP-203 Frage 45

? Frage 47 (Drag-and-Drop): PySpark in Azure Databricks soll die JSON-Struktur {"persons": [{"name", "age", "dogs": [..]}]} in eine Tabelle mit den Spalten owner, age, dog (eine Zeile pro Hund) überführen. Welche Funktion zerlegt das Array dogs in einzelne Zeilen?
- array_union
- createDataFrame
* explode
- translate
! explode() erzeugt je Arrayelement eine eigene Zeile. Ablauf: source_df.select(explode("persons").alias("persons")) und danach persons.select(col("persons.name").alias("owner"), col("persons.age").alias("age"), explode("persons.dogs").alias("dog")).
@ DP-203 Frage 47

? Frage 47 (Drag-and-Drop): Mit welcher Methode benennen Sie die Spalten im selben PySpark-Beispiel in owner, age und dog um?
- rename
* alias
- translate
- withColumn
! Column.alias() gibt die Spalte unter einem neuen Namen zurück.
@ DP-203 Frage 47

? Frage 48 (Hotspot): Medizinische Bilddaten (Petabytes): erste Woche häufiger Zugriff; nach einem Monat Zugriff innerhalb von 30 Sekunden, selten genutzt; nach einem Jahr selten genutzt, aber innerhalb von fünf Minuten erreichbar. Kosten minimieren. Welche Ebene in der ersten Woche?
- Archive
- Cool
* Hot
- Premium
! Häufig genutzte Daten gehören in die Hot-Ebene (höchste Speicher-, niedrigste Zugriffskosten).
@ DP-203 Frage 48

? Frage 48 (Hotspot): Welche Speicherebene verwenden Sie nach einem Monat und nach einem Jahr (Zugriff jeweils innerhalb von Sekunden bis Minuten nötig)?
- Nach einem Monat Hot, nach einem Jahr Archive
- Nach einem Monat Archive, nach einem Jahr Archive
* Nach einem Monat Cool, nach einem Jahr Cool
- Nach einem Monat Cool, nach einem Jahr Archive
! Cool bietet Online-Zugriff in Millisekunden bei niedrigeren Speicherkosten (mind. 30 Tage). Archive scheidet aus, weil die Reaktivierung Stunden dauert.
@ DP-203 Frage 48

? Frage 51 (Hotspot): Ein Stream-Analytics-Auftrag liest Referenzdaten aus einer täglich aktualisierten Datei product.csv; im Container refdata liegt sie unter dem Ordner 2020-03-20. Welches Pfadmuster (Path pattern) konfigurieren Sie?
* {date}/product.csv
- {date}/{time}/product.csv
- product.csv
- */product.csv
! Die Variable {date} wird durch das Datum ersetzt; ein {time}-Teil wäre nur nötig, wenn der Pfad auch eine Uhrzeit enthielte.
@ DP-203 Frage 51

? Frage 51 (Hotspot): Welches Datumsformat (Date format) entspricht dem Ordnernamen 2020-03-20?
- MM/DD/YYYY
- YYYY/MM/DD
- YYYY-DD-MM
* YYYY-MM-DD
! Der Ordnername 2020-03-20 hat das Format YYYY-MM-DD.
@ DP-203 Frage 51

? Frage 53 (Hotspot): In einem serverlosen Synapse-SQL-Pool soll aus Parquet-Dateien (id, address_housenumber, address_line, applicant1_name, applicant2_name) eine Tabelle nur mit den Adressfeldern erstellt werden (…WITH (LOCATION, DATA_SOURCE, FILE_FORMAT) AS SELECT … FROM ____ (BULK '…', FORMAT='PARQUET')). Welche Anweisung beginnt das Statement?
* CREATE EXTERNAL TABLE (CETAS)
- CREATE TABLE
- CREATE VIEW
- CREATE EXTERNAL DATA SOURCE
! CETAS (CREATE EXTERNAL TABLE AS SELECT) schreibt das Ergebnis als Dateien und legt eine externe Tabelle darüber an; im serverlosen Pool gibt es keine lokalen Tabellen.
@ DP-203 Frage 53

? Frage 53 (Hotspot): Welche Funktion steht in der FROM-Klausel, um die Parquet-Dateien direkt zu lesen?
- OPENJSON
- CROSS APPLY
* OPENROWSET
- OPENQUERY
! OPENROWSET(BULK '…', FORMAT = 'PARQUET') liest die Dateien im Data Lake direkt.
@ DP-203 Frage 53

? Frage 54 (Hotspot): Im dedizierten Pool Pool1 soll für ein ADLS-Gen2-Konto Account1 eine externe Datenquelle angelegt werden: CREATE EXTERNAL DATA SOURCE source1 WITH (LOCATION = 'https://account1.____.core.windows.net', TYPE = ____). Welche Werte setzen Sie ein (in dieser Reihenfolge)?
* blob und HADOOP
- table und HADOOP
- blob und BLOB_STORAGE
- dfs und BLOB_STORAGE
! In dedizierten SQL-Pools werden externe Datenquellen für Azure Storage mit TYPE = HADOOP (PolyBase) definiert; BLOB_STORAGE gilt für Massenoperationen (BULK INSERT).
@ DP-203 Frage 54

? Frage 56 (Drag-and-Drop): Tabelle FactSales im dedizierten SQL-Pool; Daten werden 5 Jahre aufbewahrt, einmal jährlich werden ältere Daten gelöscht; gleichmäßige Verteilung auf die Partitionen, Löschaufwand minimieren. Welche Verteilung und welche Partitionsspalte setzen Sie ein: CREATE TABLE … WITH (CLUSTERED COLUMNSTORE INDEX, DISTRIBUTION = ____ ([ProductKey]), PARTITION ([____] RANGE RIGHT FOR VALUES (20170101, 20180101, …)))?
* HASH und OrderDateKey
- ROUND_ROBIN und CustomerKey
- REPLICATE und OrderDateKey
- HASH und SalesOrderNumber
! Hash-Verteilung auf ProductKey für große Faktentabellen; die Partitionierung nach dem Datumsschlüssel OrderDateKey ermöglicht, jährlich eine ganze Partition umzuschalten.
@ DP-203 Frage 56

? Frage 57 (Hotspot): ADLS Gen2: Daten älter als fünf Jahre werden selten gebraucht, müssen aber innerhalb einer Sekunde verfügbar sein. Was tun Sie?
- Blob löschen
- In den Archivspeicher verschieben
* In den kühlen Speicher (Cool) verschieben
- In den heißen Speicher (Hot) verschieben
! Cool: günstiger als Hot, sofortiger Zugriff. Archive-Daten müssen erst reaktiviert werden (Stunden).
@ DP-203 Frage 57

? Frage 57 (Hotspot): Daten älter als sieben Jahre werden nicht mehr gelesen, sollen aber möglichst günstig erhalten bleiben. Was tun Sie?
- Blob löschen
* In den Archivspeicher verschieben
- In den kühlen Speicher verschieben
- In den heißen Speicher verschieben
! Archive ist die günstigste Speicherebene.
@ DP-203 Frage 57
