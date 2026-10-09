---
id: pr-dp203-spark-2
bereich: Prüfung
block: DP-203
kapitel: DP-203 Azure Data Engineer – Prüfungsfragen
titel: DP-203 – Apache Spark und Azure Databricks (Teil 2/2)
stufe: Profi
typ: fragen
pruefungen: [DP-203]
fach: SQL / Admin
quellen: [DE_A_ohne_D_1_bis_370.pdf, T1_-_1_bis_40_-_Lösung_und_Kommentare.pdf, T1_-_41_bis_80_-_Lösung_und_Kommentare.pdf, T1_-_81_bis_120_-_Lösung_und_Kommentare.pdf, T1_-_121_bis_140_-_Lösung_und_Kommentare.pdf, T2_-_141_bis_160_-_Lösung_und_Kommentare.pdf, T2_-_161_bis_180_-_Lösung_und_Kommentare.pdf, T2_-_181_bis_200_-_Lösung_und_Kommentare.pdf, T2_-_201_bis_240_-_Lösung_und_Kommentare.pdf, T2_-_241_bis_280_-_Lösung_und_Kommentare.pdf, 1_bis_40.pdf, 41_bis_80.pdf, 81_bis_120.pdf, 121_bis_160.pdf, 161_bis_200.pdf, 201_bis_240.pdf, 241_bis_280.pdf, 281_bis_320.pdf, 320_bis_370.pdf, 02d_Data_Engineering_-_SQL_Beispiele_und_Prüfungsfragen.pdf, 03d_Data_Engineering_-_Prüfungsfragen.pdf]
verweise: []
---

## Quiz

? Ein neues Databricks-Notebook nutzt R als Hauptsprache, soll aber auch Scala und SQL unterstützen. Mit welchem Schalter wechseln Sie die Sprache in einer Zelle?
* %<Sprache>
- @<Sprache>
- \\[<Sprache>]
- \\(<Sprache>)
! Magic Commands am Zellanfang: `%python`, `%r`, `%scala`, `%sql` (außerdem `%md`, `%sh`, `%fs`).
@ DP-203 Frage 169

? Eine Structured-Streaming-Lösung in Databricks zählt neue Ereignisse in Fünf-Minuten-Intervallen und meldet nur Ereignisse, die im Intervall eintreffen; Ausgabe in eine Delta-Tabelle. Welcher Ausgabemodus?
- update
- complete
* append
! Append schreibt nur neue Zeilen, die sich nicht mehr ändern (abgeschlossene Fenster). Complete schreibt jedes Mal die ganze Ergebnistabelle, Update nur geänderte Zeilen.
@ DP-203 Frage 172

? Serie (gleiches Szenario): Täglich inkrementelle Daten aus der Staging-Zone erfassen, per R-Skript transformieren und in Synapse einfügen. Lösung: Ein ADF-Zeitplantrigger startet eine Pipeline, die ein Databricks-Notebook ausführt und die Daten danach in das Data Warehouse einfügt. Erreicht das das Ziel?
* Ja
- Nein
! Databricks-Notebooks können R ausführen und per Synapse-Connector schreiben. Die Sammlung nennt Nein (sie verlangt eine Custom-Aktivität), die Community hält diese Lösung überwiegend für richtig.
@ DP-203 Frage 177

? Serie (gleiches Szenario): Daten per R-Skript transformieren und in Synapse einfügen. Lösung: Sie planen einen Databricks-Job, der ein R-Notebook ausführt und die Daten danach ins Data Warehouse einfügt. Erreicht das das Ziel?
- Ja
* Nein
! Laut Sammlung Nein („Data Factory muss verwendet werden“). Prüfungsfalle: Die Community sieht auch diese Lösung teils als gültig an – in der Prüfung auf die genaue Anforderung achten.
@ DP-203 Frage 179

? Eine Structured-Streaming-Lösung in Databricks streamt Verkaufstransaktionen (gekaufte Artikel, Menge, Zeilensumme Umsatz, Zeilensumme Steuer – aggregiert in Databricks). Transaktionen werden nie geändert, Korrekturen kommen als neue Zeilen. Welcher Ausgabemodus minimiert doppelte Daten?
- Update
- Complete
* Append
! Da nie geändert, sondern nur ergänzt wird, schreibt Append jede Zeile genau einmal. Die Sammlung nennt Update, die Community stimmte mehrheitlich (ca. 60 %) für Append.
@ DP-203 Frage 182

? Serie (gleiches Szenario): Databricks mit Data-Engineers-Workload (Python, SQL; gemeinsamer Cluster), Jobs-Workload (Python, Scala, SQL; per Anforderungsprozess) und drei Data Scientists (Scala, R; je eigener Cluster, Auto-Terminierung nach 120 Minuten). Lösung: Standard-Cluster je Data Scientist, ein High-Concurrency-Cluster für die Data Engineers und ein Standard-Cluster für die Aufträge. Erreicht das das Ziel?
* Ja
- Nein
! Data Engineers teilen sich einen Cluster → High Concurrency (Python/SQL unterstützt). Jobs brauchen Scala → Standard-Cluster. Data Scientists je eigener Standard-Cluster mit Auto-Terminierung. Die Sammlung nennt Nein, die Community (85 %) Ja.
@ DP-203 Frage 201

? Serie (gleiches Szenario): Databricks mit Data-Engineers-, Jobs- (Python, Scala, SQL) und Data-Scientists-Workload. Lösung: Standard-Cluster je Data Scientist, High-Concurrency-Cluster für die Data Engineers und High-Concurrency-Cluster für die Aufträge. Erreicht das das Ziel?
- Ja
* Nein
! High-Concurrency-Cluster unterstützen kein Scala – der Jobs-Workload braucht aber Scala. Die Sammlung nennt Ja, die Community (100 %) Nein.
@ DP-203 Frage 202

? Ein Spark-Auftrag in Databricks erfasst JSON-Daten. Eine verschachtelte JSON-Zeichenfolge (Array) soll in einen DataFrame mit mehreren Zeilen umgewandelt werden. Welche Spark-SQL-Funktion?
* explode
- filter
- coalesce
- extract
! `explode()` erzeugt aus jedem Array-Element eine eigene Zeile.
@ DP-203 Frage 206

? Event Hubs Capture schreibt Daten von Hub1 nach account1. Ein Spark-Notebook in Synapse soll mehrere vollständige Datensätze abrufen, Abfragezeit und Datenverarbeitung minimieren. Welches Datenformat?
* Parquet
- Avro
- ORC
- JSON
! Laut Lösung (Community 100 %) Parquet: Event Hubs Capture kann (über den No-Code-Editor) Parquet schreiben, das Spark spaltenbasiert und komprimiert sehr schnell verarbeitet. Standardformat von Capture ist allerdings Avro.
@ DP-203 Frage 230

? Daten in dl1 (ADLS) sollen mit dem Spark-Pool Pool1 in workspace1 abgefragt werden. Welche ZWEI Aktionen erreichen das Ziel (jeweils vollständige Lösung)?
- Azure Synapse Link implementieren
* die Daten in das primäre Speicherkonto von workspace1 laden
* in workspace1 einen verknüpften Dienst für dl1 erstellen
- dl1 in Microsoft Purview als Datenquelle registrieren
! Spark-Pools erreichen das primäre Speicherkonto direkt; weitere Konten werden über einen verknüpften Dienst angebunden. Purview ist ein Katalog, kein Zugriffsweg. Die Sammlung nennt CD, die Community (100 %) BC.
@ DP-203 Frage 288

? Ein interaktiver Databricks-Cluster wird selten genutzt und automatisch beendet. Seine Konfiguration soll nach dem Beenden unbegrenzt erhalten bleiben – kostengünstig. Was tun Sie?
* den Cluster anheften (Pin)
- ein Runbook erstellen, das ihn alle 90 Tage startet
- ihn nach der Verarbeitung manuell beenden
- ihn nach dem Beenden klonen
! Databricks behält Konfigurationen beendeter Allzweckcluster nur 30 Tage; angeheftete Cluster bleiben dauerhaft erhalten.
@ DP-203 Frage 296

? Mit Apache-Spark-Analysen sollen Netzwerk- und Systemaktivitätsdaten (Intrusion Detection) auf bösartige Aktivitäten untersucht werden – bei minimalem Verwaltungsaufwand. Was empfehlen Sie?
- Azure HDInsight
- Azure Data Factory
- Azure Data Lake Storage
* Azure Databricks
! Databricks ist eine vollständig verwaltete Spark-Plattform (Autoskalierung, Auto-Terminierung); HDInsight erfordert mehr Clusterverwaltung.
@ DP-203 Frage 330

? In Databricks werden Delta-Lake-Tabellen genutzt. Abfragen auf nicht partitionierte Tabellen und Joins über nicht partitionierte Spalten sollen möglichst kurz dauern. Welche ZWEI Optionen?
- der Befehl CLONE
* Z-Ordering
- Apache-Spark-Caching
* Dynamic File Pruning (DFP)
! Z-Ordering legt zusammengehörige Werte in denselben Dateien ab (Data Skipping); Dynamic File Pruning überspringt bei Joins Dateien, die keine passenden Werte enthalten.
@ DP-203 Frage 333

## Reihenfolge

### DP-203 Frage 191 (Drag & Drop): Kunden-JSON (FirstName, LastName) in ADLS Gen2 per Databricks in eine Synapse-Tabelle kopieren, mit neuer verketteter Namensspalte. Zieltabelle, Blob-Container und Dienstprinzipal existieren. Reihenfolge?
1. Data Lake Storage in DBFS einbinden (Mount)
2. Datei in einen DataFrame lesen
3. Transformationen auf dem DataFrame ausführen
4. Temporären Ordner zum Staging angeben
5. Ergebnisse in eine Tabelle in Azure Synapse schreiben

## Zuordnen

### DP-203 Frage 207 (Drag & Drop): DataFrame df_sales (Customer, SalesPerson, Region, Amount) – die drei umsatzstärksten Vertriebsmitarbeiter für die Region „HQ“: `df_sales.filter(col('Region')=='HQ').[1].agg(sum('Amount').alias('TotalAmount')).[2].limit(3)`
- [1] => groupBy(col('SalesPerson'))
- [2] => orderBy(desc('TotalAmount'))

### DP-203 Frage 222 (Hotspot): Inhalt des PySpark-DataFrames pyspark_df (sparkpool1) soll in eine Tabelle in SQLPool1 geschrieben werden: `pyspark_df.createOrReplaceTempView("pysparkdftemptable")` – nächste Zelle: `[1]` `val scala_df = spark.sqlContext.sql("select * from pysparkdftemptable")` `scala_df.write.[2]("sqlpool1.dbo.PySparkTable", Constants.INTERNAL)`
- [1] Zellen-Magic => %%spark (Scala)
- [2] Methode => synapsesql

### DP-203 Frage 240 (Hotspot): Spark-Pool Pool1 soll CSV lesen und in eine Delta-Tabelle schreiben: `df = spark.read.load('abfss://…/stage/products.csv', format='csv', header=True)`, `delta_table_path = "/delta/products-delta"`, `df.[1].save(delta_table_path)`, `deltaTable = [2](spark, delta_table_path)`
- [1] => write.format("delta")
- [2] => DeltaTable.forPath

### DP-203 Frage 246 (Drag & Drop): Die lokale Datei /tmp/file1 enthält ein JSON-Array mit mehrzeiligen Objekten (string, int, dict). Sie soll mit Scala in einen DataFrame gelesen werden: `val df = spark.read.option("[1]", "true").[2]("/tmp/file1")` (die Sammlung zeigt „inferSchema“; mehrzeiliges JSON braucht jedoch multiLine)
- [1] Option => multiLine
- [2] Methode => json

### DP-203 Frage 261 (Hotspot): Databricks-Dataset DBTBL1 (SensorTypeID, GeographyRegionID, Year, Month, Day, Hour, Minute, Temperature, WindSpeed, Other) soll tägliche inkrementelle Ladevorgänge je GeographyRegionID unterstützen, Speicherkosten minimieren: `df.write.[1]([2]).mode("append").[3]` (Sammlung: Datumsspalten zuerst und saveAsTable; Community: wie unten)
- [1] => partitionBy
- [2] => ("GeographyRegionID", "Year", "Month", "Day")
- [3] => parquet("/DBTBL1")

### DP-203 Frage 277 (Hotspot): Ein Apache-Hive-Katalog aus dem Spark-Pool pool1 (synapse1) soll mit databricks1 geteilt werden.
- Von synapse1 einen verknüpften Dienst erstellen zu => Azure SQL Database (externer Hive-Metastore)
- pool1 konfigurieren, den verknüpften Dienst zu verwenden als => einen Hive-Metastore
