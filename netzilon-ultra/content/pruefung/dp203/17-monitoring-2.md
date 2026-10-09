---
id: pr-dp203-monitoring-2
bereich: Prüfung
block: DP-203
kapitel: DP-203 Azure Data Engineer – Prüfungsfragen
titel: DP-203 – Überwachung und Optimierung (Teil 2/2)
stufe: Profi
typ: fragen
pruefungen: [DP-203]
fach: SQL / Admin
quellen: [DE_A_ohne_D_1_bis_370.pdf, T1_-_1_bis_40_-_Lösung_und_Kommentare.pdf, T1_-_41_bis_80_-_Lösung_und_Kommentare.pdf, T1_-_81_bis_120_-_Lösung_und_Kommentare.pdf, T1_-_121_bis_140_-_Lösung_und_Kommentare.pdf, T2_-_141_bis_160_-_Lösung_und_Kommentare.pdf, T2_-_161_bis_180_-_Lösung_und_Kommentare.pdf, T2_-_181_bis_200_-_Lösung_und_Kommentare.pdf, T2_-_201_bis_240_-_Lösung_und_Kommentare.pdf, T2_-_241_bis_280_-_Lösung_und_Kommentare.pdf, 1_bis_40.pdf, 41_bis_80.pdf, 81_bis_120.pdf, 121_bis_160.pdf, 161_bis_200.pdf, 201_bis_240.pdf, 241_bis_280.pdf, 281_bis_320.pdf, 320_bis_370.pdf, 02d_Data_Engineering_-_SQL_Beispiele_und_Prüfungsfragen.pdf, 03d_Data_Engineering_-_Prüfungsfragen.pdf]
verweise: []
---

## Quiz

? Mehrere Data-Factory-Pipelines enthalten Aktivitäten vom Typ Wrangling Data Flow, Notebook, Copy und Jar. Welche ZWEI Azure-Dienste verwenden Sie zum Debuggen?
- Azure Synapse Analytics
- Azure HDInsight
- Azure Machine Learning
* Azure Data Factory
* Azure Databricks
! Wrangling Data Flow und Copy debuggt man in ADF; Notebook- und Jar-Aktivitäten laufen auf Databricks und werden dort debuggt. Die Sammlung nennt AC, die Community (99 %) DE.
@ DP-203 Frage 313

? Pool1 (dediziert) enthält DB1 mit der Faktentabelle Table1. Wie ermitteln Sie in Synapse Studio das Ausmaß der Datenschiefe?
- mit dem integrierten Pool verbinden und sys.dm_pdw_nodes_db_partition_stats ausführen
- mit Pool1 verbinden und DBCC CHECKALLOC ausführen
- mit dem integrierten Pool verbinden und DBCC CHECKALLOC ausführen
* mit Pool1 verbinden und sys.dm_pdw_nodes_db_partition_stats abfragen
! Skew-Analyse erfolgt im dedizierten Pool, in dem die Tabelle liegt; die DMV liefert Zeilenzahlen je Verteilung.
@ DP-203 Frage 314

? Häufig genutzte Abfragen in Synapse sind langsam, selten genutzte unverändert. Welche Metrik überwachen Sie?
- Prozentsatz lokaler tempdb
* Prozentsatz des verwendeten Caches
- Daten-E/A-Prozentsatz
- CPU-Prozentsatz
! Adaptiver Cache: Ist er voll bzw. zu klein (Cache used %), werden häufig genutzte Columnstore-Segmente verdrängt.
@ DP-203 Frage 315

? Sie wollen die Pipelinefehler einer Data Factory der letzten 180 Tage untersuchen. Was verwenden Sie?
- das Aktivitätsprotokoll
- die Pipelineausführungen in der ADF-Oberfläche
- das Blatt Ressourcenintegrität
* ADF-Aktivitätsausführungen in Azure Monitor (Log Analytics)
! ADF speichert Ausführungsdaten nur 45 Tage – länger nur über Diagnoseeinstellungen nach Azure Monitor.
@ DP-203 Frage 316

? In SA1 (dedizierter SQL-Pool) sollen Tabellen mit hohem Anteil gelöschter Zeilen identifiziert werden. Was führen Sie aus?
- sys.pdw_nodes_column_store_segments
- sys.dm_db_column_store_row_group_operational_stats
* sys.pdw_nodes_column_store_row_groups
- sys.dm_db_column_store_row_group_physical_stats
! Die Sicht enthält je Rowgroup total_rows und deleted_rows – daraus ergibt sich der Anteil gelöschter Zeilen (Kandidaten für REBUILD).
@ DP-203 Frage 318

? Ein Synapse-Data-Warehouse soll überwacht werden, um zu entscheiden, ob auf einen höheren Servicelevel (DWU) hochskaliert werden muss. Welche Metrik ist am besten?
- DWU used
- CPU-Prozentsatz
* DWU-Prozentsatz
- Daten-E/A-Prozentsatz
! DWU % = Maximum aus CPU % und Daten-E/A % – zeigt die Auslastung relativ zum aktuellen Servicelevel. Die Sammlung nennt A, die Community (79 %) C.
@ DP-203 Frage 319

? Pool1 (dediziert) enthält DB1 mit der Faktentabelle Table1. Wie ermitteln Sie in Synapse Studio die Datenschiefe?
- mit dem integrierten Pool verbinden und sys.dm_pdw_nodes_db_partition_stats abfragen
- mit dem integrierten Pool verbinden und DBCC CHECKALLOC ausführen
- mit Pool1 verbinden und sys.dm_pdw_node_status abfragen
* mit Pool1 verbinden und sys.dm_pdw_nodes_db_partition_stats abfragen
! Die DMV zeigt Zeilen je Verteilung – im dedizierten Pool, nicht im serverlosen (integrierten) Pool. (Die Erklärung der Sammlung nennt fälschlich den integrierten Pool.)
@ DP-203 Frage 325

? Pool1 (dediziert) enthält die Faktentabelle Table1. Wie ermitteln Sie in Synapse Studio die Datenschiefe?
* mit Pool1 verbinden und DBCC PDW_SHOWSPACEUSED ausführen
- mit dem integrierten Pool verbinden und DBCC PDW_SHOWSPACEUSED ausführen
- mit dem integrierten Pool verbinden und DBCC CHECKALLOC ausführen
- mit dem integrierten Pool verbinden und sys.dm_pdw_sys_info abfragen
! `DBCC PDW_SHOWSPACEUSED('dbo.Table1')` im dedizierten Pool zeigt Zeilen und Speicher je Verteilung. Die Sammlung nennt D, die Community (93 %) A.
@ DP-203 Frage 326

? Pool1 (dediziert) enthält die Faktentabelle Table1. Wie ermitteln Sie in Synapse Studio die Datenschiefe?
* mit Pool1 verbinden und DBCC PDW_SHOWSPACEUSED ausführen
- mit dem integrierten Pool verbinden und DBCC PDW_SHOWSPACEUSED ausführen
- mit Pool1 verbinden und DBCC CHECKALLOC ausführen
- mit dem integrierten Pool verbinden und sys.dm_pdw_sys_info abfragen
! DBCC PDW_SHOWSPACEUSED gibt es nur im dedizierten Pool. Die Sammlung nennt B, die Community (95 %) A.
@ DP-203 Frage 328

? Häufig genutzte Abfragen in Synapse sind langsam, selten genutzte unverändert. Welche Metrik überwachen Sie?
- DWU-Grenzwert
- Daten-E/A-Prozentsatz
* Prozentsatz der Cachetreffer
- CPU-Prozentsatz
! Niedrige Cache-Trefferquote im adaptiven Cache verlangsamt gerade die häufig wiederholten Abfragen.
@ DP-203 Frage 335

? Häufig genutzte Abfragen in Synapse sind langsam, selten genutzte unverändert. Welche Metrik überwachen Sie?
- DWU-Prozentsatz
* Prozentsatz der Cachetreffer
- verwendete DWU
- Daten-E/A-Prozentsatz
! Der adaptive Cache (lokale SSD) beschleunigt wiederholte Abfragen; seine Trefferquote erklärt das Muster.
@ DP-203 Frage 337

? Pool1 (dediziert) enthält die Faktentabelle Table1. Wie ermitteln Sie in Synapse Studio die Datenschiefe?
- mit dem integrierten Pool verbinden und sys.dm_pdw_nodes_db_partition_stats abfragen
* mit Pool1 verbinden und DBCC PDW_SHOWSPACEUSED ausführen
- mit Pool1 verbinden und sys.dm_pdw_node_status abfragen
- mit dem integrierten Pool verbinden und sys.dm_pdw_sys_info abfragen
! Skew prüft man im dedizierten Pool, in dem die Tabelle liegt. Die Sammlung nennt A, die Community (100 %) B.
@ DP-203 Frage 340

? Mehrere Data-Factory-Pipelines enthalten Power-Query-, Notebook-, Copy- und Jar-Aktivitäten. Welche ZWEI Dienste verwenden Sie zum Debuggen?
- Azure Machine Learning
* Azure Data Factory
- Azure Synapse Analytics
- Azure HDInsight
* Azure Databricks
! Power Query und Copy debuggt man in ADF, Notebook- und Jar-Aktivitäten auf Databricks.
@ DP-203 Frage 341

? Häufig genutzte Abfragen in Synapse sind langsam, selten genutzte unverändert. Welche Metrik überwachen Sie?
- DWU-Prozentsatz
* Prozentsatz der Cachetreffer
- DWU-Grenzwert
- verwendete DWU
! Siehe adaptiver Cache: Die Cache-Trefferquote entscheidet über die Geschwindigkeit wiederholter Abfragen.
@ DP-203 Frage 346

? Pool1 sendet Protokolle an den Log-Analytics-Arbeitsbereich la1. Sie wollen prüfen, ob eine kürzlich ausgeführte Abfrage den Result Set Cache genutzt hat. Welche ZWEI Möglichkeiten (jeweils vollständige Lösung)?
- die DMV sys.dm_pdw_sql_requests in Pool1 prüfen
* die DMV sys.dm_pdw_exec_requests in Pool1 prüfen
* den Monitor-Hub in Synapse Studio verwenden
- die Tabelle AzureDiagnostics in la1 prüfen
- die DMV sys.dm_pdw_request_steps in Pool1 prüfen
! sys.dm_pdw_exec_requests enthält die Spalte result_cache_hit; der Monitor-Hub zeigt ebenfalls, ob das Ergebnis aus dem Cache kam. Community 67 % BC.
@ DP-203 Frage 348

? DF1 enthält eine Pipeline mit Zeitplantrigger. In den Diagnoseeinstellungen werden die Pipelineausführungen an eine ressourcenspezifische Tabelle in Log Analytics gesendet. Welche Tabelle fragen Sie mit KQL ab?
* ADFPipelineRun
- ADFTriggerRun
- ADFActivityRun
- AzureDiagnostics
! Ressourcenspezifische Tabellen: ADFPipelineRun (Pipelineläufe), ADFActivityRun, ADFTriggerRun; AzureDiagnostics ist der Legacy-Modus. Die Sammlung nennt B – laut englischem Original („pipeline runs“) ist A korrekt.
@ DP-203 Frage 350

? WS1 hat einen dedizierten SQL-Pool, Group1 ist eine Azure-Monitor-Aktionsgruppe. Überwachungsdaten der Integrationsaktivitätsläufe sollen archiviert werden; darauf basierend sollen benutzerdefinierte Warnungen Group1 auslösen – mit minimalem Aufwand. Welche Diagnoseeinstellung?
* An Log-Analytics-Arbeitsbereich senden
- In einem Speicherkonto archivieren
- An einen Event Hub streamen
- An eine Partnerlösung senden
! Log-Analytics-Daten lassen sich direkt mit KQL-basierten Warnungsregeln (Log Alerts) und Aktionsgruppen verknüpfen.
@ DP-203 Frage 352

? In Pool1 gibt es: Query1 (deterministische Laufzeitausdrücke, 25 MB Ergebnis), Query2 (deterministische integrierte Funktionen, 1 GB), Query3 (benutzerdefinierte Funktionen, 50 MB), Query4 (Row-Level Security, 15 GB). Welche Ergebnisse werden bei aktiviertem Result Set Caching zwischengespeichert?
- nur Query1
- nur Query2
* nur Query1 und Query2
- nur Query1 und Query3
- nur Query1, Query2 und Query3
! Nicht zwischengespeichert werden u. a. Abfragen mit UDFs, nichtdeterministischen Funktionen, RLS/CLS sowie Ergebnisse über 10 GB.
@ DP-203 Frage 353

? Ein Mapping-Datenfluss in einer Synapse-Pipeline schreibt in Pool1. Wie lange das Schreiben in Pool1 dauert, soll aus den Ausführungsinformationen ermittelt werden. Welche Metrik?
- geschriebene Zeilen
* Verarbeitungszeit der Senke (Sink processing time)
- Verarbeitungszeit der Transformation
- Nachbearbeitungszeit
! Die Senkenverarbeitungszeit misst die Dauer des Schreibens in das Ziel.
@ DP-203 Frage 354

? DF1 enthält eine Pipeline mit fünf Aktivitäten. Die Warteschlangenzeiten der Aktivitäten sollen mit Log Analytics überwacht werden. Was tun Sie in DF1?
- DF1 mit einem Purview-Konto verbinden
* eine Diagnoseeinstellung hinzufügen, die Aktivitätsausführungen an Log Analytics sendet
- automatische Aktualisierung der Arbeitsmappe „Activity Log Insights“ aktivieren
- eine Diagnoseeinstellung hinzufügen, die Pipelineausführungen an Log Analytics sendet
! Warteschlangenzeiten gehören zu den Aktivitätsläufen (ActivityRuns), nicht zu den Pipelineläufen.
@ DP-203 Frage 355

? Pool1 (dediziert) soll so überwacht werden, dass Start- und Endzeiten jeder abgeschlossenen Abfrage erfasst werden. Welche Diagnoseeinstellung?
- SQL Requests
- Request Steps
- DMS Workers
* Exec Requests
! Die Kategorie ExecRequests entspricht sys.dm_pdw_exec_requests und enthält Start-/Endzeit, Status und Befehl jeder Abfrage.
@ DP-203 Frage 356

## Zuordnen

### DP-203 Frage 331 (Hotspot): Dedizierter SQL-Pool – lang laufende Abfragen überwachen und Abfragen finden, die auf Ressourcen warten.
- Lang laufende Abfragen überwachen => sys.dm_pdw_exec_requests
- Abfragen, die auf Ressourcen warten => sys.dm_pdw_waits

### DP-203 Frage 336 (Hotspot): DF1 hat 10 Pipelines, stündlich per Zeitplantrigger auf einer Azure IR. Trends bei den Wartezeiten über Pipelineausführungen und Aktivitäten sollen erkennbar sein – mit minimalem Verwaltungsaufwand.
- Sammeln => Protokoll der Pipeline-Aktivitätsausführungen (ActivityRuns)
- Senden an => Log-Analytics-Arbeitsbereich
