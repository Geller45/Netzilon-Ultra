---
id: pr-dp203-spark-1
bereich: Prüfung
block: DP-203
kapitel: DP-203 Azure Data Engineer – Prüfungsfragen
titel: DP-203 – Apache Spark und Azure Databricks (Teil 1/2)
stufe: Profi
typ: fragen
pruefungen: [DP-203]
fach: SQL / Admin
quellen: [DE_A_ohne_D_1_bis_370.pdf, T1_-_1_bis_40_-_Lösung_und_Kommentare.pdf, T1_-_41_bis_80_-_Lösung_und_Kommentare.pdf, T1_-_81_bis_120_-_Lösung_und_Kommentare.pdf, T1_-_121_bis_140_-_Lösung_und_Kommentare.pdf, T2_-_141_bis_160_-_Lösung_und_Kommentare.pdf, T2_-_161_bis_180_-_Lösung_und_Kommentare.pdf, T2_-_181_bis_200_-_Lösung_und_Kommentare.pdf, T2_-_201_bis_240_-_Lösung_und_Kommentare.pdf, T2_-_241_bis_280_-_Lösung_und_Kommentare.pdf, 1_bis_40.pdf, 41_bis_80.pdf, 81_bis_120.pdf, 121_bis_160.pdf, 161_bis_200.pdf, 201_bis_240.pdf, 241_bis_280.pdf, 281_bis_320.pdf, 320_bis_370.pdf, 02d_Data_Engineering_-_SQL_Beispiele_und_Prüfungsfragen.pdf, 03d_Data_Engineering_-_Prüfungsfragen.pdf]
verweise: []
---

## Quiz

? Ein Synapse-Arbeitsbereich MyWorkspace enthält die Spark-Datenbank `mytestdb`. In einem Spark-Pool wird ausgeführt: `CREATE TABLE mytestdb.myParquetTable(EmployeeID int, EmployeeName string, EmployeeStartDate date) USING Parquet`. Danach wird per Spark die Zeile (Alice, 24, 2020-01-25) eingefügt. Eine Minute später läuft im serverlosen SQL-Pool: `SELECT EmployeeID FROM mytestdb.dbo.myParquetTable WHERE EmployeeName = 'Alice';` Was liefert die Abfrage?
* 24
- einen Fehler
- einen NULL-Wert
! Spark-Datenbanken und Parquet-Tabellen werden automatisch (asynchron, mit kurzer Verzögerung) als externe Tabellen in den serverlosen SQL-Pool synchronisiert; nach einer Minute ist die Tabelle abfragbar → 24. Community: B 60 % / A 40 % – in der Variante auf der Dozenten-Folie lautet die WHERE-Klausel `WHERE name = 'Alice'`; eine nicht existierende Spalte würde einen Fehler liefern. Prüfungsfalle: genau auf Spalten- und Tabellennamen achten.
@ DP-203 Frage 2

? Arbeitsbereich WS1 enthält den Spark-Pool Pool1. In Pool1 soll die Datenbank DB1 entstehen; neu erstellte Tabellen sollen automatisch als externe Tabellen im integrierten serverlosen SQL-Pool verfügbar sein. Welches Format verwenden Sie für die Tabellen?
- CSV
- ORC
- JSON
* Parquet
! Der serverlose SQL-Pool synchronisiert Spark-Metadaten automatisch: Für jede Spark-Tabelle auf Basis von Parquet (oder CSV, Delta) in Azure Storage entsteht eine externe Tabelle. Dozent: Deshalb kann man Spark-Pools herunterfahren und trotzdem abfragen.
@ DP-203 Frage 26

? Ein Spark-Pool Pool1 soll JSON-Dateien aus ADLS Gen2 in Tabellen laden. Struktur und Datentypen variieren je Datei; die Quelldatentypen sollen erhalten bleiben. Was tun Sie?
- eine Transformation für bedingte Teilung (Conditional Split) in einem Synapse-Datenfluss verwenden
- eine Aktivität „Metadaten abrufen“ (Get Metadata) in Data Factory verwenden
- die Daten mit OPENROWSET in einen serverlosen SQL-Pool laden
* die Daten mit PySpark laden
! Spark liest JSON mit Schema-Inferenz je Datei und behält die Datentypen; die Tabellen liegen ohnehin im Spark-Pool. Die Sammlung nennt C, die Community 91 % D.
@ DP-203 Frage 49

? Der Databricks-Arbeitsbereich workspace1 (Standard-Tarif) hat den Allzweckcluster cluster1. Start- und Hochskalierzeit von cluster1 sollen sinken, Kosten minimal bleiben. Was tun Sie zuerst?
- ein globales Init-Skript für workspace1 konfigurieren
- eine Clusterrichtlinie erstellen
- workspace1 auf den Premium-Tarif upgraden
* einen Pool in workspace1 erstellen
! Databricks-Pools halten einen Cache bereitstehender VM-Instanzen vor; Cluster starten und skalieren dadurch deutlich schneller. Pools sind auch im Standard-Tarif verfügbar.
@ DP-203 Frage 50

? Ein Databricks-Arbeitsbereich enthält die Delta-Lake-Dimensionstabelle Table1 (SCD Typ 2). Aktualisierungen aus einer Quelltabelle sollen angewendet werden. Welche Spark-SQL-Operation verwenden Sie?
- CREATE
- UPDATE
- ALTER
* MERGE
! Mit MERGE INTO werden in einem Schritt alte Versionen als nicht aktuell markiert (UPDATE bei Treffer) und neue Versionen eingefügt (INSERT ohne Treffer) – das typische SCD-Typ-2-Muster in Delta Lake.
@ DP-203 Frage 63

? Ein Databricks-Arbeitsbereich soll das ADLS-Gen2-Konto storage1 (täglich neue Dateien) als Structured-Streaming-Quelle nutzen: neue Dateien inkrementell verarbeiten, wenig Implementierungs- und Wartungsaufwand, geringe Kosten bei Millionen Dateien, Schema-Inferenz und Schema-Drift. Was empfehlen Sie?
- COPY INTO
- Azure Data Factory
* Auto Loader
- Apache Spark FileStreamSource
! Auto Loader (`cloudFiles`) erkennt neue Dateien effizient (Dateibenachrichtigung statt Verzeichnislisting), skaliert auf Millionen Dateien und unterstützt Schema-Inferenz und -Evolution.
@ DP-203 Frage 76

? Arbeitsbereich WS1 enthält den Spark-Pool Pool1; in Pool1 entsteht die Datenbank DB1. Neue Tabellen sollen automatisch als externe Tabellen im integrierten serverlosen SQL-Pool erscheinen. Welches Format verwenden Sie?
* Parquet
- ORC
- JSON
- HIVE
! Nur Spark-Tabellen auf Basis von Parquet, CSV (und Delta) werden automatisch mit dem serverlosen SQL-Pool synchronisiert.
@ DP-203 Frage 84

? workspace1 und workspace3 nutzen datalake1 als primären Speicher, workspace2 datalake2; alle sollen in datalake1 lesen/schreiben. Jeder Spark-Pool soll Katalogobjekte gemeinsam nutzen, die auf datalake1 verweisen (externer Hive-Metastore). Welche Aussagen treffen zu?
* Die gemeinsamen Katalogobjekte können in Azure Database for MySQL gespeichert werden.
* Für den Hive-Metastore jedes Arbeitsbereichs muss ein verknüpfter Dienst mit Benutzer/Kennwort-Authentifizierung konfiguriert werden.
* Die Benutzer von workspace1 benötigen die Rolle Storage Blob Data Contributor für datalake1.
- Keine der Aussagen trifft zu.
! Externer Hive-Metastore: Azure SQL Database oder Azure Database for MySQL; der verknüpfte Dienst unterstützt nur SQL-(Benutzer/Kennwort-)Authentifizierung; Lese-/Schreibzugriff auf den Data Lake erfordert Storage Blob Data Contributor. (Antwortbild in der Quelle unleserlich – Lösung nach Microsoft-Doku.)
@ DP-203 Frage 87

? SparkPool1 enthält die Delta-Lake-Tabelle SparkTable1. Es sollen T-SQL-Abfragen auf die Daten möglich sein, die Partition Elimination nutzen. Was empfehlen Sie?
- eine partitionierte Tabelle in einem dedizierten SQL-Pool
- eine partitionierte Sicht in einem dedizierten SQL-Pool
- einen partitionierten Index in einem dedizierten SQL-Pool
* eine partitionierte Sicht in einem serverlosen SQL-Pool
! Der serverlose SQL-Pool liest Delta-Lake-Ordner direkt (OPENROWSET FORMAT='DELTA'); Sichten mit filepath()/Partitionsspalten erlauben Partition Elimination ohne Datenkopie. Community 57 % D, 43 % A.
@ DP-203 Frage 97

? In Azure Databricks soll einmal täglich eine Batchverarbeitung laufen. Welchen Clustertyp verwenden Sie?
- High Concurrency
* automatisiert (Job-Cluster)
- interaktiv (All-Purpose)
! Automatisierte Job-Cluster werden pro Auftrag gestartet und danach beendet – günstig und isoliert für geplante Batch-Jobs.
@ DP-203 Frage 118

? Ein Databricks-Cluster wird so angelegt: autoscale min 2 / max 8 Worker, `"spark.databricks.cluster.profile": "serverless"`, `"spark.databricks.repl.allowedLanguages": "sql,python,r"`, `"ResourceClass": "Serverless"`, Knotentyp Standard_DS13_v2, autotermination 90 Minuten. Welche Aussagen treffen zu?
* Der Cluster unterstützt mehrere gleichzeitige Benutzer.
- Der Cluster minimiert die Kosten bei geplanten Jobs, die Notebooks ausführen.
* Der Cluster unterstützt das Erstellen einer Delta-Lake-Tabelle.
- Keine der Aussagen trifft zu.
! Profil „serverless“ + ResourceClass Serverless = High-Concurrency-Cluster (mehrere Benutzer). Für geplante Jobs ist ein Job-Cluster günstiger (Allzweck-Cluster werden zum teureren All-Purpose-Tarif abgerechnet). Delta Lake geht auf jedem Databricks-Cluster.
@ DP-203 Frage 126

? Eine Databricks-Tabelle erfasst ca. 20 Mio. Streamingereignisse pro Tag. Die Ereignisse sollen für inkrementelle Ladejobs in Databricks erhalten bleiben; Speicherkosten und inkrementelle Ladezeiten sollen minimal sein. Was nehmen Sie in die Lösung auf?
- nach DateTime-Feldern partitionieren
* Senke in Azure Queue Storage
- eine Wasserzeichenspalte hinzufügen
- JSON als physisches Speicherformat
! Laut Lösung: Der ABS-AQS-Connector nutzt Azure Queue Storage, um neue Dateien zu finden, ohne alle Dateien aufzulisten (weniger Latenz, keine teuren LIST-Aufrufe). Community 69 % B, 23 % A. Heute übernimmt das Auto Loader im Dateibenachrichtigungsmodus.
@ DP-203 Frage 148

? workspace1 (Databricks, Standard-Tarif) soll die automatische Skalierung von Allzweckclustern so unterstützen, dass Worker nach drei Minuten ohne Auslastung herunterskaliert werden, das Hochskalieren auf das Maximum schnell geht und die Kosten minimal sind. Was tun Sie zuerst?
- Containerdienste aktivieren
* workspace1 auf den Premium-Tarif upgraden
- den Clustermodus High Concurrency festlegen
- eine Clusterrichtlinie erstellen
! Die optimierte Autoskalierung (in 2 Schritten von min auf max, Herunterskalieren nach 150 s Unterauslastung) gibt es nur im Premium-Tarif; Standard skaliert erst nach 10 Minuten Leerlauf herunter.
@ DP-203 Frage 150

? Serie (gleiches Szenario): Databricks-Arbeitsbereich mit drei Workloads – Data Engineers (Python, SQL; sollen sich einen Cluster teilen), Aufträge (Notebooks in Python, Scala, SQL; Bereitstellung über Anforderungsprozess) und drei Data Scientists (Scala, R; je eigener Cluster, Auto-Terminierung nach 120 Minuten). Lösung: Standard-Cluster je Data Scientist, ein Standard-Cluster für die Data Engineers und ein High-Concurrency-Cluster für die Aufträge. Erreicht das das Ziel?
- Ja
* Nein
! Die Data Engineers teilen sich einen Cluster → High Concurrency. Der Jobs-Workload nutzt Scala – High-Concurrency-Cluster unterstützen kein Scala, daher ist er dort falsch.
@ DP-203 Frage 158

? Serie (gleiches Szenario): Databricks mit Data-Engineers- (Python, SQL; gemeinsamer Cluster), Jobs- (Python, Scala, SQL) und Data-Scientists-Workload (Scala, R; je eigener Cluster mit Auto-Terminierung nach 120 Minuten). Lösung: High-Concurrency-Cluster für jeden Data Scientist, High-Concurrency-Cluster für die Data Engineers und Standard-Cluster für die Aufträge. Erreicht das das Ziel?
- Ja
* Nein
! Data Scientists brauchen Scala und R und je einen eigenen Cluster → Standard-Cluster (High Concurrency unterstützt kein Scala und terminiert nicht standardmäßig automatisch).
@ DP-203 Frage 164

? Ein Databricks-Cluster führt benutzerdefinierte lokale Prozesse aus. Anforderungen: minimale Abfragelatenz, möglichst viele gleichzeitige Benutzer, Kosten senken ohne die anderen Anforderungen zu verletzen. Welcher Clustertyp?
- Standard mit Auto-Terminierung
* High Concurrency mit Autoskalierung
- High Concurrency mit Auto-Terminierung
- Standard mit Autoskalierung
! High Concurrency = feingranulares Teilen für viele Benutzer und geringe Latenz; Autoskalierung passt die Worker an die Last an und spart Kosten. Community ca. 70 % B, 29 % C.
@ DP-203 Frage 165

## Reihenfolge

### DP-203 Frage 135 (Drag & Drop): Eine Kunden-JSON-Datei (FirstName, LastName) in ADLS Gen2 soll mit Databricks in eine Synapse-Tabelle kopiert werden, inklusive neuer Spalte mit verkettetem Namen. Zieltabelle, Blob-Container und Dienstprinzipal existieren. Reihenfolge der fünf Notebook-Aktionen?
1. Data Lake Storage in DBFS einbinden (Mount)
2. Datei in einen DataFrame lesen
3. Transformationen auf dem DataFrame ausführen
4. Temporären Ordner zum Bereitstellen (Staging) der Daten angeben
5. Ergebnisse in eine Tabelle in Azure Synapse schreiben

## Zuordnen

### DP-203 Frage 36 (Hotspot): Databricks-Dataset Purchases (ProductID, ItemPrice, LineTotal, Quantity, StoreID, Minute, Month, Hour, Year, Day) soll stündliche inkrementelle Ladepipelines je StoreID unterstützen, Speicherkosten minimieren. Code: `df.write.[1]([2]).mode("append").[3]`
- [1] Methode => partitionBy
- [2] Spalten => ("StoreID", "Year", "Month", "Day", "Hour")
- [3] Ausgabe => parquet("/Purchases")

### DP-203 Frage 47 (Drag & Drop): PySpark in Databricks – JSON `{"persons":[{"name":"Keith","age":30,"dogs":["Fido","Fluffy"]},{"name":"Donna","age":46,"dogs":["Spot"]}]}` soll als Tabelle owner / age / dog (eine Zeile je Hund) ausgegeben werden. `persons = source_df.[1](explode("persons").alias("persons"))`, `persons_dogs = persons.select(col("persons.name").alias("owner"), col("persons.age").alias("age"), [2]("persons.dogs").[3]("dog"))`
- [1] => select
- [2] => explode
- [3] => alias

### DP-203 Frage 108 (Hotspot): Databricks-Notebook – Zeilen aus dem DataFrame new_rows_df sollen einer vorhandenen Delta-Tabelle hinzugefügt werden: `new_rows_df.write.[1].[2].save(delta_table_path)`
- [1] => format("delta")
- [2] => mode("append")

### DP-203 Frage 124 (Drag & Drop): Spark-DataFrame temperatures (Date, Temp) soll per Spark SQL zu einer Tabelle Year × JAN…MAY mit Durchschnittstemperaturen gedreht werden: `SELECT * FROM (SELECT YEAR(Date) Year, MONTH(Date) Month, Temp FROM temperatures WHERE date BETWEEN DATE '2019-01-01' AND DATE '2021-08-31') [1] (AVG([2](Temp AS DECIMAL(4,1))) FOR Month IN (1 JAN, 2 FEB, …, 12 DEC)) ORDER BY Year ASC`
- [1] => PIVOT
- [2] => CAST
