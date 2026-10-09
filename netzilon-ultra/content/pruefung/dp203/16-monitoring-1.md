---
id: pr-dp203-monitoring-1
bereich: Prüfung
block: DP-203
kapitel: DP-203 Azure Data Engineer – Prüfungsfragen
titel: DP-203 – Überwachung und Optimierung (Teil 1/2)
stufe: Profi
typ: fragen
pruefungen: [DP-203]
fach: SQL / Admin
quellen: [DE_A_ohne_D_1_bis_370.pdf, T1_-_1_bis_40_-_Lösung_und_Kommentare.pdf, T1_-_41_bis_80_-_Lösung_und_Kommentare.pdf, T1_-_81_bis_120_-_Lösung_und_Kommentare.pdf, T1_-_121_bis_140_-_Lösung_und_Kommentare.pdf, T2_-_141_bis_160_-_Lösung_und_Kommentare.pdf, T2_-_161_bis_180_-_Lösung_und_Kommentare.pdf, T2_-_181_bis_200_-_Lösung_und_Kommentare.pdf, T2_-_201_bis_240_-_Lösung_und_Kommentare.pdf, T2_-_241_bis_280_-_Lösung_und_Kommentare.pdf, 1_bis_40.pdf, 41_bis_80.pdf, 81_bis_120.pdf, 121_bis_160.pdf, 161_bis_200.pdf, 201_bis_240.pdf, 241_bis_280.pdf, 281_bis_320.pdf, 320_bis_370.pdf, 02d_Data_Engineering_-_SQL_Beispiele_und_Prüfungsfragen.pdf, 03d_Data_Engineering_-_Prüfungsfragen.pdf]
verweise: []
---

## Quiz

? In einem dedizierten SQL-Pool schreiben Analysten eine komplexe SELECT-Abfrage mit mehreren JOINs und CASE-Anweisungen, deren Ergebnis einmal täglich von Bestandsberichten mit zusätzlichen WHERE-Parametern genutzt wird. Die Abfragezeiten sollen minimal sein. Was implementieren Sie?
- einen geordneten gruppierten Columnstore-Index
* eine materialisierte Sicht (Materialized View)
- Zwischenspeicherung von Resultsets (Result Set Caching)
- eine replizierte Tabelle
! Materialisierte Sichten speichern das vorberechnete Ergebnis komplexer Joins/Aggregationen und werden automatisch aktualisiert. Result Set Caching greift nur bei identischen Abfragen – hier ändern sich die WHERE-Parameter je Bericht.
@ DP-203 Frage 25

? In die Tabelle table1 des dedizierten SQL-Pools Pool1 wurden 5 TB geladen. Die Columnstore-Komprimierung soll maximiert werden. Welche Anweisung führen Sie aus?
- DBCC INDEXDEFRAG (pool1, table1)
- DBCC DBREINDEX (table1)
- ALTER INDEX ALL ON table1 REORGANIZE
* ALTER INDEX ALL ON table1 REBUILD
! REBUILD erstellt alle Rowgroups neu und komprimiert offene/kleine Rowgroups optimal; REORGANIZE ist schonender, komprimiert aber weniger gründlich.
@ DP-203 Frage 71

? Benutzer melden langsame Leistung bei häufig genutzten Abfragen in Synapse; selten genutzte Abfragen sind unverändert. Welche Metrik überwachen Sie, um die Ursache zu finden?
- DWU-Grenzwert
* Prozentsatz der Cachetreffer (Cache hit percentage)
- Prozentsatz lokaler tempdb
- Daten-E/A-Prozentsatz
! Häufige Abfragen profitieren vom adaptiven Cache (lokale SSD für Columnstore-Segmente). Sinkt die Cache-Trefferquote, werden gerade diese Abfragen langsamer.
@ DP-203 Frage 95

? Für das Data Warehouse DW1 (Synapse) auf Server1 soll die Größe der Transaktionsprotokolldatei jeder Verteilung ermittelt werden. Was tun Sie?
* auf DW1 eine Abfrage gegen sys.database_files ausführen
- in Azure Monitor die Protokolle von DW1 abfragen
- die Protokolle per Get-AzOperationalInsightsSearchResult abfragen
- in master die DMV sys.dm_pdw_nodes_os_performance_counters abfragen
! sys.database_files enthält size, max_size und growth der Protokolldatei.
@ DP-203 Frage 183

? Eine ADF-Aktivität ruft täglich eine gespeicherte Prozedur in Synapse auf. Sie wollen die Dauer der letzten Ausführung prüfen. Was verwenden Sie?
* Aktivitätsausführungen in Azure Monitor (ADF-Überwachung)
- das Aktivitätsprotokoll in Synapse
- die DMV sys.dm_pdw_wait_stats
- eine ARM-Vorlage
! Die Ansicht der Aktivitätsläufe zeigt je Aktivität Start, Dauer und Status.
@ DP-203 Frage 188

? Ein Synapse-Job verwendet Scala. Wie sehen Sie seinen Status?
- Synapse Studio → Monitor → SQL-Anforderungen
- Azure Monitor: Kusto-Abfrage auf AzureDiagnostics
* Synapse Studio → Monitor → Apache-Spark-Anwendungen
- Azure Monitor: Kusto-Abfrage auf SparkLoggingEvent_CL
! Scala läuft auf Spark-Pools; laufende und abgeschlossene Spark-Anwendungen zeigt der Monitor-Hub.
@ DP-203 Frage 190

? SQLPool1 (dedizierter SQL-Pool) ist angehalten. Sein aktueller Zustand soll in einem neuen SQL-Pool wiederhergestellt werden. Was tun Sie zuerst?
- einen Arbeitsbereich erstellen
- einen benutzerdefinierten Wiederherstellungspunkt erstellen
* SQLPool1 fortsetzen (Resume)
- einen neuen SQL-Pool erstellen
! Ein benutzerdefinierter Wiederherstellungspunkt kann nur für einen laufenden Pool erstellt werden – daher erst fortsetzen. Die Sammlung nennt B, die Community (85 %) C.
@ DP-203 Frage 195

? Pool1 erhält alle 24 Stunden neue Daten. Funktion: `create function dbo.udfFtoC(F decimal) returns decimal as begin return (F - 32) * 5.0/9 end`. Alle 15 Minuten läuft: `select avg_date, sensorid, avg_f, dbo.udfFtoC(avg_temperature) as avg_c from SensorTemps where avg_date = @parameter` (@parameter = aktuelles Datum). Welche ZWEI Aktionen minimieren die Antwortzeit?
- einen Index auf avg_f erstellen
* avg_c in eine berechnete Spalte umwandeln
- einen Index auf sensorid erstellen
* Zwischenspeicherung von Resultsets (Result Set Caching) aktivieren
- die Tabellenverteilung auf repliziert ändern
! Die Daten ändern sich nur alle 24 h, die gleiche Abfrage läuft alle 15 min → Result Set Caching. Die UDF-Berechnung pro Zeile entfällt durch eine vorberechnete Spalte. Indizes helfen hier nicht (keine Joins).
@ DP-203 Frage 204

? User1 soll in SQL1 (dedizierter SQL-Pool) die Anforderungen über die DMV sys.dm_pdw_exec_requests sehen können – geringste Rechte. Welche Berechtigung?
* VIEW DATABASE STATE
- SHOWPLAN
- CONTROL SERVER
- VIEW ANY DATABASE
! DMVs auf Datenbankebene erfordern VIEW DATABASE STATE.
@ DP-203 Frage 289

? Eine Faktentabelle (50 Spalten, 5 Mrd. Zeilen) im dedizierten SQL-Pool ist ein Heap. Die meisten Abfragen aggregieren ca. 100 Mio. Zeilen und geben nur zwei Spalten zurück; sie sind sehr langsam. Welcher Index liefert die schnellsten Abfragen?
- nicht gruppierter Columnstore-Index
* gruppierter Columnstore-Index
- nicht gruppierter Index
- gruppierter Index
! Aggregationen über viele Zeilen und wenige Spalten sind der Idealfall für einen Clustered Columnstore Index (nur benötigte Spalten werden gelesen, Batch-Modus).
@ DP-203 Frage 292

? Beim Erstellen eines Databricks-Clusters wurde eine zusätzliche Bibliothek angegeben; im Notebook wird sie nicht gefunden. Was prüfen Sie, um die Ursache zu finden?
- Notebook-Protokolle
* Cluster-Ereignisprotokolle
- Protokolle globaler Init-Skripts
- Arbeitsbereichsprotokolle
! Die Bibliotheksinstallation (inkl. Fehler) wird in den Cluster-Ereignisprotokollen bzw. im Bibliotheksstatus des Clusters angezeigt. Die Sammlung nennt C (Init-Skripts), die Community (68 %) B.
@ DP-203 Frage 293

? Sie wollen die Pipelinefehler einer Data Factory der letzten 60 Tage untersuchen. Was verwenden Sie?
- das Aktivitätsprotokoll der Data-Factory-Ressource
- die App „Überwachen und Verwalten“ in Data Factory
- das Blatt Ressourcenintegrität
* Azure Monitor
! Data Factory speichert Pipeline-Ausführungsdaten nur 45 Tage – für längere Zeiträume Diagnoseeinstellungen nach Azure Monitor/Log Analytics senden.
@ DP-203 Frage 294

? In DW1 laufen viele gleichzeitige Ad-hoc-Abfragen; regelmäßige automatisierte Datenladevorgänge sollen dennoch genug Arbeitsspeicher haben und schnell abschließen. Was tun Sie?
- große Faktentabellen vor dem Laden verteilen
- den Ladeabfragen eine kleinere Ressourcenklasse zuweisen
* den Ladeabfragen eine größere Ressourcenklasse zuweisen
- Stichprobenstatistiken für jede Spalte erstellen
! Größere Ressourcenklassen (z. B. largerc/staticrc60) geben einer Abfrage mehr Speicher, reduzieren aber die Parallelität – ideal für den Ladebenutzer.
@ DP-203 Frage 297

? In DB1 (Pool1) soll das Ausmaß der Datenschiefe (Skew) der Faktentabelle Table1 in Synapse Studio ermittelt werden. Was tun Sie?
- mit dem integrierten Pool verbinden und DBCC PDW_SHOWSPACEUSED ausführen
- mit dem integrierten Pool verbinden und DBCC CHECKALLOC ausführen
- mit Pool1 verbinden und sys.dm_pdw_node_status abfragen
* mit Pool1 verbinden und sys.dm_pdw_nodes_db_partition_stats abfragen
! Die DMV liefert Zeilenzahlen je Verteilung; DBCC PDW_SHOWSPACEUSED ginge auch, aber nur im dedizierten Pool – nicht im integrierten (serverlosen) Pool.
@ DP-203 Frage 298

? Abfragen in einem Synapse-SQL-Pool schlagen fehl oder dauern lange. Sie wollen zurückgesetzte (Rollback-)Transaktionen überwachen. Welche DMV fragen Sie ab?
- sys.dm_pdw_request_steps
* sys.dm_pdw_nodes_tran_database_transactions
- sys.dm_pdw_waits
- sys.dm_pdw_exec_sessions
! Über database_transaction_next_undo_lsn in sys.dm_pdw_nodes_tran_database_transactions sieht man laufende Rollbacks je Knoten.
@ DP-203 Frage 300

? Abfragen in einem Synapse-SQL-Pool dauern zu lange; das Problem betrifft abgefragte Columnstore-Segmente. Welche ZWEI Metriken des zugrunde liegenden Speichers überwachen Sie?
- Größe des Snapshotspeichers
* Prozentsatz des verwendeten Caches
- DWU-Grenzwert
* Prozentsatz der Cachetreffer
! Columnstore-Segmente werden im lokalen SSD-Cache gehalten: Cache used % (Auslastung) und Cache hit % (Treffer) zeigen, ob der adaptive Cache greift.
@ DP-203 Frage 305

? Häufig genutzte Abfragen in Synapse sind langsam, selten genutzte unverändert. Welche Metrik überwachen Sie?
- DWU-Prozentsatz
* Prozentsatz der Cachetreffer
- DWU-Grenzwert
- Daten-E/A-Prozentsatz
! Häufige Abfragen profitieren vom adaptiven Cache; eine niedrige Trefferquote erklärt die Verlangsamung.
@ DP-203 Frage 306

? Für eine Databricks-Ressource sollen Aktionen protokolliert werden, die Änderungen an der Compute-Leistung betreffen. Welcher Databricks-Dienst muss protokolliert werden?
* clusters
- workspace
- dbfs
- ssh
- jobs
! Die Diagnoseprotokollkategorie „clusters“ erfasst Erstellen, Ändern, Skalieren, Starten und Beenden von Clustern (Compute). Die Sammlung nennt B, die Community (88 %) A.
@ DP-203 Frage 307

? Eine hochverfügbare ADLS-Lösung nutzt GZRS. Replikationsverzögerungen, die das Recovery Point Objective (RPO) beeinflussen, sollen überwacht werden. Was nehmen Sie auf?
- 5xx-Serverfehler
- durchschnittliche erfolgreiche E2E-Latenz
- Verfügbarkeit
* letzte Synchronisierungszeit (Last Sync Time)
! Georeplikation ist asynchron; die Last Sync Time zeigt, bis wann Daten sicher in der Sekundärregion liegen.
@ DP-203 Frage 308

? PolyBase lädt CSV-Dateien aus ADLS Gen2 über eine externe Tabelle in Synapse; Dateien mit ungültigem Schema verursachen Fehler. Auf welchen Fehler müssen Sie achten?
- EXTERNAL TABLE-Zugriff fehlgeschlagen: HdfsBridge_Connect … [com.microsoft.polybase.client.KerberosSecureLogin]
* „Remote Query“ für OLE DB-Anbieter „SQLNCLI11“ kann nicht ausgeführt werden. Abfrage abgebrochen: Der maximale Ablehnungsschwellenwert (0 Zeilen) wurde erreicht: 1 zurückgewiesene Zeile von 1 verarbeiteten Zeilen.
- EXTERNAL TABLE-Zugriff fehlgeschlagen: HdfsBridge_Connect … [Unable to instantiate LoginClass]
- EXTERNAL TABLE-Zugriff fehlgeschlagen: HdfsBridge_Connect … [No FileSystem for scheme: wasbs]
! Passen Spalten/Datentypen einer Datei nicht zur externen Tabelle, werden Zeilen abgelehnt; mit REJECT_VALUE = 0 bricht die Abfrage ab. Die anderen Meldungen sind Authentifizierungs-/Treiberprobleme.
@ DP-203 Frage 309

? `DBCC PDW_SHOWSPACEUSED('dbo.FactInternetSales')` zeigt je Verteilung sehr unterschiedliche Zeilenzahlen (z. B. 5995, 3008, 1550 … und mehrfach 0). Welche Aussage trifft zu?
- Alle Verteilungen enthalten Daten.
- Die Tabelle enthält weniger als 10.000 Zeilen.
- Die Tabelle verwendet Round-Robin-Verteilung.
* Die Tabelle ist schief verteilt (Data Skew).
! Ungleich verteilte Zeilen (einige Verteilungen leer, andere mit Tausenden Zeilen) = Datenschiefe; Round-Robin würde gleichmäßig verteilen.
@ DP-203 Frage 310

## Reihenfolge

### DP-203 Frage 239 (Drag & Drop): Eine Kopie des dedizierten SQL-Pools (Data Warehouse) soll 28 Tage verfügbar sein – bei minimalen Kosten. Reihenfolge der drei Aktionen?
1. Neuen benutzerdefinierten Wiederherstellungspunkt erstellen
2. Kopie aus dem neuen benutzerdefinierten Wiederherstellungspunkt in ein neues Data Warehouse wiederherstellen
3. Das wiederhergestellte Data Warehouse anhalten (Pause – nur Speicher wird berechnet)

### DP-203 Frage 274 (Drag & Drop): ADF-Pipeline-Ausführungsdaten sollen 120 Tage aufbewahrt und mit Kusto (KQL) abfragbar sein. Reihenfolge der vier Aktionen? (Community-Lösung; die Sammlung beginnt mit einem Speicherkonto mit Lebenszyklusrichtlinie)
1. Log-Analytics-Arbeitsbereich mit Datenaufbewahrung 120 Tage erstellen
2. Im Azure-Portal eine Diagnoseeinstellung für die Data Factory hinzufügen
3. Die Kategorie PipelineRuns auswählen
4. Die Daten an den Log-Analytics-Arbeitsbereich senden

## Zuordnen

### DP-203 Frage 299 (Hotspot): Anwendungsmetriken, Streaming-Abfrageereignisse und Anwendungsprotokolle eines Databricks-Clusters sollen gesammelt werden.
- Bibliothek => Azure Databricks Monitoring Library
- Arbeitsbereich => Azure Log Analytics
