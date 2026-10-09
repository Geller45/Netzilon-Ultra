---
id: pr-dp203-nachtrag-4
bereich: Prüfung
block: DP-203
kapitel: DP-203 Azure Data Engineer – Prüfungsfragen
titel: DP-203 – Nachtrag 4
stufe: Profi
typ: fragen
pruefungen: [DP-203]
fach: SQL / Admin
quellen: [DE_A_ohne_D_1_bis_370.pdf, T1_-_1_bis_40_-_Lösung_und_Kommentare.pdf, T1_-_41_bis_80_-_Lösung_und_Kommentare.pdf, T1_-_81_bis_120_-_Lösung_und_Kommentare.pdf, T1_-_121_bis_140_-_Lösung_und_Kommentare.pdf, T2_-_141_bis_160_-_Lösung_und_Kommentare.pdf, T2_-_161_bis_180_-_Lösung_und_Kommentare.pdf, T2_-_181_bis_200_-_Lösung_und_Kommentare.pdf, T2_-_201_bis_240_-_Lösung_und_Kommentare.pdf, T2_-_241_bis_280_-_Lösung_und_Kommentare.pdf, 1_bis_40.pdf, 41_bis_80.pdf, 81_bis_120.pdf, 121_bis_160.pdf, 161_bis_200.pdf, 201_bis_240.pdf, 241_bis_280.pdf, 281_bis_320.pdf, 320_bis_370.pdf]
verweise: []
---

## Quiz

? Frage 110 (Drag-and-Drop): SQL1 (dedizierter Pool) enthält die hashverteilte Faktentabelle Table1. Sie soll mit einer neuen Verteilungsspalte neu erstellt werden; die Datenverfügbarkeit soll maximal bleiben. Welche vier Aktionen in welcher Reihenfolge?
* Neue Tabelle Table1v2 per CTAS erstellen; Table1 in Table1_old umbenennen; Table1v2 in Table1 umbenennen; Table1_old löschen
- Indizes von Table1 löschen; Table1v2 per CTAS erstellen; Table1 löschen; Table1v2 in Table1 umbenennen
- DBCC PDW_SHOWSPACEUSED ausführen; Table1 löschen; Table1v2 per CTAS erstellen; Table1v2 umbenennen
- Table1 in Table1_old umbenennen; Table1_old löschen; Table1v2 per CTAS erstellen; Table1v2 in Table1 umbenennen
! CTAS legt die neue Tabelle mit neuer Verteilungsspalte an, während Table1 weiter verfügbar bleibt; das Umbenennen ist nur ein kurzer Metadatenvorgang.
@ DP-203 Frage 110

? Frage 114 (Hotspot): CSV-Dateien liegen partitioniert unter /data/salesorders/year=xxxx/month=y. Im serverlosen SQL-Pool (OPENROWSET mit Wildcards) sollen nur Aufträge von Januar und Februar 2023 geladen werden. Welche WHERE-Bedingung ist richtig?
* so.filepath(1) = '2023' AND so.filepath(2) IN ('1', '2')
- so.filepath(0) = 2023 AND (so.month = 1 OR so.month = 2)
- so.year = 2023 AND so.filepath(1) IN (1, 2)
- so.filepath(1) IN (1, 2) AND so.year = 2023
! filepath(n) liefert den Wert des n-ten Wildcards (Zählung ab 1) im BULK-Pfad (Partitionselimination); year und month sind keine Spalten der Dateien.
@ DP-203 Frage 114

? Frage 115 (Hotspot): Eine Echtzeit-Überwachungs-App soll Benutzer warnen, wenn sich ein Gerät mehr als 200 m von einem Standort entfernt (Stream Analytics, möglichst wenig Code). Welchen Eingabetyp (Input type) verwenden Sie?
* Stream
- Reference
- Batch
- Archive
! Die Gerätepositionen kommen als Datenstrom.
@ DP-203 Frage 115

? Frage 115 (Hotspot): Welche Funktionsgruppe nutzen Sie in der Abfrage für die Entfernungsberechnung?
- Aggregate
* Geospatial (Geodatenfunktionen)
- Windowing
- Analytic
! Mit integrierten Geodatenfunktionen wie ST_DISTANCE lassen sich Entfernungen berechnen, ohne eigenen Code.
@ DP-203 Frage 115

? Frage 119 (Hotspot): Mautstelle: Stream Analytics soll Kennzeichen, Fahrzeugmarke und Zeit des letzten Fahrzeugs je 10-Minuten-Fenster liefern. Welche Aggregatfunktion steht in der WITH-Klausel (… (Time) AS LastEventTime)?
- COUNT
* MAX
- MIN
- TOPONE
! MAX(Time) liefert den spätesten Zeitstempel im Fenster.
@ DP-203 Frage 119

? Frage 119 (Hotspot): Welches Fenster und welche Funktion im Join verwenden Sie (GROUP BY …(minute, 10); ON ___(minute, Input, LastInWindow) BETWEEN 0 AND 10)?
* TumblingWindow und DATEDIFF
- HoppingWindow und DATEADD
- SessionWindow und DATEPART
- SlidingWindow und DATENAME
! Das Tumbling Window bildet feste, nicht überlappende 10-Minuten-Fenster; DATEDIFF berechnet den Zeitabstand im Temporal Join.
@ DP-203 Frage 119

? Frage 121 (Hotspot): Neue Datenpipeline mit PaaS: Quellen anbinden, Workflow orchestrieren, SSIS-Pakete ausführen. Welche Technologie für Ingest?
- Logic Apps
* Azure Data Factory
- Azure Automation
- Azure Functions
! ADF orchestriert Pipelines, bindet viele Quellen an und kann SSIS-Pakete ausführen (Azure-SSIS-Integration-Runtime).
@ DP-203 Frage 121

? Frage 121 (Hotspot): Welche Technologie nutzen Sie für Store (Big-Data-optimiert, Verschlüsselung im Ruhezustand, ohne Größenbeschränkung) und für Prepare and Train (interaktiver Arbeitsbereich, R/SQL/Python/Scala/Java, Azure-AD-Anmeldung)?
* Store: Azure Data Lake Storage; Prepare and Train: Azure Databricks
- Store: Azure Blob Storage; Prepare and Train: HDInsight Apache Spark
- Store: Azure Files; Prepare and Train: HDInsight Apache Storm
- Store: Azure Data Lake Storage; Prepare and Train: HDInsight Apache Kafka
! Data Lake Storage ist für Big Data optimiert und praktisch unbegrenzt; Databricks bietet Notebooks in mehreren Sprachen mit Azure-AD-Anmeldung.
@ DP-203 Frage 121

? Frage 121 (Hotspot): Welche Technologie ist für Model and Serve geeignet (nativer Spaltenspeicher, SQL, strukturiertes Streaming)?
- HDInsight Apache Kafka
* Azure Synapse Analytics
- Azure Data Lake Storage
- Azure Files
! Synapse Analytics bietet Spaltenspeicher (Columnstore), SQL und Spark-Streaming.
@ DP-203 Frage 121

? Frage 124 (Drag-and-Drop): Ein Spark-DataFrame temperatures (Date, Temp) soll mit Spark SQL in eine Tabelle Year, JAN, FEB, … überführt werden (SELECT * FROM (SELECT YEAR(Date) Year, MONTH(Date) Month, Temp FROM temperatures WHERE …) ____ (AVG(CAST(Temp AS DECIMAL(4,1))) FOR Month in (1 JAN, 2 FEB, …)). Welches Schlüsselwort fehlt?
- UNPIVOT
* PIVOT
- FLATTEN
- COLLATE
! PIVOT dreht eindeutige Werte einer Spalte (Monate) in Ausgabespalten und aggregiert dabei (hier AVG).
@ DP-203 Frage 124

? Frage 128 (Hotspot): FactOnlineSales (2009 bis 2012) soll in vier Partitionen je Kalenderjahr nach OrderDateKey aufgeteilt werden. Wie lautet die PARTITION-Klausel?
* RANGE RIGHT FOR VALUES (20100101, 20110101, 20120101)
- RANGE LEFT FOR VALUES (20100101, 20110101, 20120101)
- RANGE RIGHT FOR VALUES (20090101, 20121231)
- RANGE LEFT FOR VALUES (20090101, 20100101, 20110101, 20120101)
! Drei Grenzwerte ergeben vier Partitionen. Bei RANGE RIGHT gehört der Grenzwert zur rechten (neueren) Partition: 2009 | 2010 | 2011 | 2012. Bei LEFT würde 1. Januar jeweils noch zum Vorjahr zählen.
@ DP-203 Frage 128

? Frage 132 (Hotspot): Stream Analytics soll die Dauer zwischen Start- und Endereignissen eines Features berechnen: SELECT [user], feature, ____(second, ____(Time) OVER (PARTITION BY [user], feature LIMIT DURATION(hour, 1) WHEN Event = 'start'), Time) AS duration FROM input TIMESTAMP BY Time WHERE Event = 'end'. Welche Funktionen setzen Sie ein?
* DATEDIFF und LAST
- DATEADD und ISFIRST
- DATEPART und TOPONE
- DATEDIFF und TOPONE
! LAST holt das letzte Start-Ereignis innerhalb der Stunde, DATEDIFF berechnet die Differenz in Sekunden zum Endereignis.
@ DP-203 Frage 132

? Frage 134 (Drag-and-Drop): Eine ADF-Pipeline verarbeitet Daten für E-Commerce, Einzelhandel und Großhandel; Daten müssen auch für das gesamte Unternehmen verarbeitet werden können. Wie lautet das Data-Flow-Skript der bedingten Aufteilung (Conditional Split) ab CleanData split(…)?
* split(dept=='ecommerce', dept=='retail', dept=='wholesale', disjoint: false) ~> SplitByDept@(ecommerce, retail, wholesale, all)
- split(dept=='ecommerce', dept=='retail', dept=='wholesale', disjoint: true) ~> SplitByDept@(ecommerce, retail, wholesale)
- split(dept=='ecommerce', dept=='wholesale', dept=='retail', disjoint: true) ~> SplitByDept@(all, ecommerce, retail, wholesale)
- split(dept=='ecommerce', dept=='retail', disjoint: false) ~> SplitByDept@(ecommerce, retail, all)
! Mit disjoint: false darf eine Zeile mehrere Bedingungen erfüllen (alle passenden Streams) – so landen Zeilen in der Abteilung und im Stream „all“. Der letzte Ausgabestream ist der Standard-Stream (alles, was keine Bedingung erfüllt, bzw. alle bei disjoint false).
@ DP-203 Frage 134

? Frage 135 (Drag-and-Drop): JSON-Kundendatei in ADLS Gen2 (FirstName, LastName) soll mit Azure Databricks in eine Synapse-Tabelle kopiert werden, inklusive einer neuen Spalte mit verkettetem Namen. Zieltabelle, Blob-Container und Dienstprinzipal existieren. Welche fünf Aktionen im Notebook in welcher Reihenfolge?
* Data Lake Storage in DBFS einbinden; Datei in einen DataFrame lesen; Transformationen auf den DataFrame anwenden; temporären Ordner zum Staging angeben; Ergebnisse in eine Tabelle in Synapse schreiben
- Datei in einen DataFrame lesen; Data Lake Storage einbinden; Transformationen auf die Datei anwenden; Ergebnisse in Data Lake Storage schreiben; DataFrame löschen
- Data Lake Storage einbinden; Transformationen auf die Datei anwenden; temporären Ordner angeben; Ergebnisse in Synapse schreiben; DataFrame löschen
- Temporären Ordner angeben; Datei lesen; Ergebnisse in Data Lake Storage schreiben; Transformationen anwenden; in Synapse schreiben
! Typischer Ablauf: mounten, lesen, transformieren (Spalte concat), Staging-Verzeichnis (tempDir) für den Synapse-Connector festlegen, in Synapse schreiben.
@ DP-203 Frage 135

? Frage 136 (Hotspot): ADF-Pipeline lädt /in/{YYYY}/{MM}/{DD}/{HH}/{mm} (frühester Ordner /in/2021/01/01/00/00, neuester /in/2021/01/15/01/45). Vorhandene Daten laden, alle 30 Minuten laden, bis zu 2 Minuten verspätete Daten berücksichtigen. Welcher Triggertyp?
- Event
- On-demand
- Schedule
* Tumbling window
! Nur der Tumbling-Window-Trigger kann rückwirkend (Startzeit in der Vergangenheit, Backfill) laufen und hat den Parameter Delay.
@ DP-203 Frage 136

? Frage 136 (Hotspot): Welche zusätzlichen Eigenschaften setzen Sie am Trigger?
- Prefix: /in/, Event: Blob created
- Recurrence: 30 minutes, Start time: 2021-01-01T00:00
* Recurrence: 30 minutes, Start time: 2021-01-01T00:00, Delay: 2 minutes
- Recurrence: 32 minutes, Start time: 2021-01-15T01:45
! Startzeit am frühesten Ordner (damit vorhandene Daten geladen werden), 30-Minuten-Intervall, Delay von 2 Minuten für verspätete Daten.
@ DP-203 Frage 136

? Frage 137 (Hotspot): Near-Real-Time-Dashboard mit Streamingdaten aus Event Hub, Mittelwert je 10-Sekunden-Intervall, danach verwerfen; Latenz, Speicher und Entwicklungsaufwand minimieren. Welchen Eingabetyp und welchen Ausgabetyp verwenden Sie?
* Eingabe: Azure Event Hub; Ausgabe: Microsoft Power BI
- Eingabe: Azure Event Hub; Ausgabe: Azure SQL Database
- Eingabe: Azure SQL Database; Ausgabe: Microsoft Power BI
- Eingabe: Microsoft Power BI; Ausgabe: Azure Event Hub
! Stream Analytics kann direkt nach Power BI ausgeben (Streaming-Dataset); eine zwischengeschaltete Datenbank würde Latenz und Speicher kosten.
@ DP-203 Frage 137

? Frage 137 (Hotspot): Wo wird die Aggregationsabfrage (Mittelwert je 10 Sekunden) ausgeführt?
- Azure Event Hub
- Azure SQL Database
* Azure Stream Analytics
- Microsoft Power BI
! Die Aggregation (Tumbling Window von 10 Sekunden) gehört in die Stream-Analytics-Abfrage.
@ DP-203 Frage 137

? Frage 138 (Drag-and-Drop): Ein Stream-Analytics-Auftrag (Visual-Studio-Lösung) verarbeitet JSON von IoT-Geräten und soll künftig das Protobuf-Format akzeptieren. Welche drei Aktionen in welcher Reihenfolge?
* Ein Projekt „Azure Stream Analytics Custom Deserializer Project (.NET)“ zur Lösung hinzufügen; .NET-Deserialisierungscode für Protobuf im Deserializer-Projekt ergänzen; in input.json das Serialisierungsformat auf Protobuf ändern und die DLL referenzieren
- Das Serialisierungsformat in input.json ändern; Deserializer-Projekt hinzufügen; Code im Stream-Analytics-Projekt ergänzen
- Ein Azure-Stream-Analytics-Anwendungsprojekt hinzufügen; Code im Stream-Analytics-Projekt ergänzen; Format in input.json ändern
- Protobuf-Code im Stream-Analytics-Projekt ergänzen; Deserializer-Projekt hinzufügen; DLL referenzieren
! Benutzerdefinierte .NET-Deserialisierer benötigen ein eigenes Projekt; die erzeugte DLL wird in der Eingabe (input.json) referenziert.
@ DP-203 Frage 138
