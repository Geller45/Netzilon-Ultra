---
id: azd-synapse
bereich: Azure Data
pruefungen: [DP-203, Schule]
fach: Data Engineering
block: A2
kapitel: Synapse und Data Warehouse
titel: Azure Synapse Analytics – Pools, Spark, Pipelines, Streaming, Event Hubs, Kosten
stufe: Fortgeschritten
quellen: [08_b_Data_Engineering_-_Synapse_Analysis.pdf]
verweise: [azd-data-warehouse, azd-externe-tabellen, azd-databricks, azd-grundlagen]
---

## Profi

### Überblick
**Azure Synapse Analytics** ist ein integrierter Unternehmensanalysedienst für Data Warehousing und Big Data. Er vereint:
- **SQL** für Data Warehousing (SQL-Pools)
- **Apache Spark** für Big Data (Notebooks, mehrere Sprachen)
- **Data Explorer** für Protokoll- und Zeitreihenanalyse
- **Pipelines** (Basis: Azure Data Factory) für Datenintegration und ETL/ELT
- Integration in Power BI, Cosmos DB, Azure ML
Jeder Arbeitsbereich (Workspace) hat einen **Standard-Data-Lake** (ADLS Gen2), angebunden über **verknüpfte Dienste** (Linked Services).

### SQL-Pools
| | Serverloser SQL-Pool | Dedizierter SQL-Pool (ehem. SQL DW) |
|---|---|---|
| Bereitstellung | integriert, **keine Speicherreservierung**, automatische Skalierung | selbst angelegt, **DWU**-Leistungsstufe |
| Kosten | nach **verarbeiteten Daten** (pro TB) | nach DWU/Stunde; **pausierbar** (nur Speicher zahlen) |
| Zweck | Exploration/Abfragen von Dateien im Data Lake (`OPENROWSET`, externe Tabellen) | großes relationales DW (Hash/Replicate/CCI, materialisierte Sichten) |
Abfragen werden in kleinere aufgeteilt und parallel verarbeitet (MPP – Massively Parallel Processing: Control Node + Compute Nodes).

### Analysearten
Deskriptiv (was ist passiert?), diagnostisch (warum?), prädiktiv (was wird passieren?), präskriptiv (was sollen wir tun?).

### Streaming und Event Hubs
Ereignisverarbeitung: **Event Producer** (Sensoren, Apps) → **Event Processor** (z. B. Stream Analytics mit SA-QL) → **Event Consumer** (Dashboard, Warnung, Data Lake, Cosmos DB, SQL DB, Power BI). **Azure Event Hubs**: hochskalierbarer Dienst, Millionen Ereignisse/Sekunde; Einsatz: Anomalieerkennung (Betrug), Anwendungsprotokolle, Clickstream-Pipelines, Live-Dashboards, Archivierung, Telemetrie (Benutzer, Geräte). **IoT Hub** für Gerätekommunikation.

### Kostenmodelle (Prüfungsrelevant)
| Dienst | Einheit |
|---|---|
| Azure SQL Database | **DTU** (Mix aus CPU, RAM, I/O; Verdopplung = doppelte Ressourcen) oder vCore |
| Synapse dediziert (DW) | **DWU** (Data Warehouse Unit); **1 DWU ≈ 7,5 DTU** |
| Cosmos DB | **RU** (Request Unit); Punktlesen 1 KB = 1 RU; Minimum 400 RU/s |
| Stream Analytics | **Streaming Units (SU)** |
| Serverless SQL | pro TB verarbeiteter Daten |

## Einfach

**Azure Synapse Analytics** ist eine **Werkstatt für Datenanalyse unter einem Dach**: Sie hat mehrere Werkbänke, zwischen denen man hin- und herspringen kann:
1. **SQL-Werkbank** für Tabellen und Berichte (das Data Warehouse),
2. **Spark-Werkbank** für riesige, unordentliche Datenmengen (Notebooks mit Python),
3. **Pipelines** zum Datenholen und Umbauen (wie Förderbänder),
4. **Data Explorer** für Logfiles und Messreihen.

Zwei Sorten SQL:
- **Serverlos** = wie ein **Taxi**: Du zahlst nur, wenn du fährst (pro abgefragtem Datenvolumen). Perfekt, um mal schnell in Dateien im Data Lake zu schauen.
- **Dediziert** = wie ein **eigenes Auto**: Du mietest feste Power (DWU), die ständig bereitsteht. Teuer, wenn es im Stau steht – deshalb kannst du es **pausieren** (dann zahlst du nur den Parkplatz = Speicher).

**Streaming** = ein **Fluss** statt eines Sees: Sensoren und Apps senden dauernd Ereignisse (Herzfrequenz, Maut-Sensoren). **Event Hubs** ist der **Trichter**, der Millionen Ereignisse pro Sekunde aufnimmt. **Stream Analytics** ist der **Wächter am Fluss**, der sofort reagiert („Betrug entdeckt!“) und Ergebnisse auf ein Dashboard oder in einen Speicher schickt.

**Kosten – jede Dienst hat seine eigene „Währung“:** DTU (SQL-Datenbank), DWU (Warehouse), RU (Cosmos DB), SU (Stream Analytics). Das ist wie: Supermarkt rechnet in Euro, Tankstelle in Litern, Kino in Tickets.

## Merksatz
- **Serverless = Taxi (pro Abfrage), dediziert = eigenes Auto (DWU, pausierbar).**
- **Synapse = SQL + Spark + Pipelines + Data Explorer.**
- **DTU – DWU – RU – SU.**
- **1 DWU = 7,5 DTU.**
- **Event Hubs nimmt auf, Stream Analytics verarbeitet.**

## Prüfungsfalle
- Dedizierter Pool: **pausieren** spart Rechenkosten, Speicher kostet weiter.
- Serverlos: keine Verteilung/Tabellen im Sinne eines DW, Abfragen auf Dateien; Kosten = Datenmenge.
- Cosmos DB rechnet in **RU**, nicht DTU; Minimum 400 RU.
- Stream Analytics: Kosten über **Streaming Units**.
- Event Hubs speichert/transportiert Ereignisse, analysiert sie nicht.

## Grafik
### Streaming-Pipeline
1. Sensoren -> Event Hubs: Ereignisse (Telemetrie)
2. Event Hubs -> Stream Analytics: Ereignisstrom wird gelesen
3. Stream Analytics: SA-QL-Abfrage aggregiert pro Minute
4. Stream Analytics -> Power BI: Live-Dashboard
5. Stream Analytics -> Data Lake: Archivierung
### Serverless vs. dediziert
1. Analyst -> Serverloser SQL-Pool: SELECT auf Parquet im Data Lake
2. Serverloser SQL-Pool -> Data Lake: liest Dateien, Kosten nach Datenvolumen
3. Pipeline -> Dedizierter SQL-Pool: lädt Daten per COPY/Polybase
4. Dedizierter SQL-Pool: 60 Distributionen verarbeiten parallel

## Lab
### GUI
Maschine: Windows-Client (Azure Portal). Synapse-Arbeitsbereich erstellen (Storage-Konto mit Hierarchischem Namespace/ADLS Gen2), Synapse Studio öffnen > Develop > SQL-Skript (serverless „Built-in“) > Abfrage `OPENROWSET`. Danach Ressourcengruppe löschen (Kosten!).
### SQL
```
SELECT TOP 10 * FROM OPENROWSET(BULK 'https://<konto>.dfs.core.windows.net/data/sales/*.parquet', FORMAT='PARQUET') AS r;
```

## Übungen
- A: Welcher Pool kostet nur nach verarbeiteten Daten? | L: Serverloser SQL-Pool.
- A: Wie sparen Sie Kosten im dedizierten Pool außerhalb der Arbeitszeit? | L: Pool pausieren (nur Speicher wird berechnet) bzw. DWU skalieren.
- A: Nennen Sie die Kosteneinheiten von SQL Database, Synapse DW, Cosmos DB, Stream Analytics. | L: DTU/vCore, DWU, RU, SU.
- A: Welche Rolle hat Event Hubs? | L: Hochskalierbare Ereignisaufnahme (Ingestion), Streaming an mehrere Konsumenten.
- A: Welche vier Analysearten gibt es? | L: deskriptiv, diagnostisch, prädiktiv, präskriptiv.

## Karteikarten
- F: Was ist Azure Synapse Analytics? | A: Integrierter Analysedienst: SQL-DW, Spark, Pipelines, Data Explorer.
- F: Serverloser vs. dedizierter SQL-Pool? | A: Serverless: automatisch, pro Datenvolumen, Dateiabfragen; dediziert: DWU, DW, pausierbar.
- F: Was ist eine DWU? | A: Data Warehouse Unit – Leistungseinheit des dedizierten Pools (1 DWU = 7,5 DTU).
- F: Was ist eine DTU? | A: Database Transaction Unit – Mix aus CPU, RAM, Lesen/Schreiben (Azure SQL Database).
- F: Was ist eine RU? | A: Request Unit – Durchsatzwährung in Cosmos DB; Punktlesen 1 KB = 1 RU; Minimum 400.
- F: Was ist Event Hubs? | A: Dienst zur Aufnahme von Millionen Ereignissen pro Sekunde.
- F: Was ist Stream Analytics? | A: Echtzeit-Ereignisverarbeitung mit SQL-ähnlicher Sprache (SA-QL), Kosten über Streaming Units.
- F: Welche Technologien vereint Synapse? | A: SQL, Spark, Data Explorer, Pipelines.
- F: Was ist ein Linked Service? | A: Verbindung zu externen Datenspeichern (z. B. Data Lake).

## Quiz
? Welcher Pool wird nach verarbeiteten Datenmengen abgerechnet?
* Serverloser SQL-Pool
- Dedizierter SQL-Pool
- Spark-Pool
- Elastischer Pool

? Was bedeutet 1 DWU?
* Etwa 7,5 DTU
- 1 Request Unit
- 1 vCore
- 1 Streaming Unit

? Wie spart man Kosten im dedizierten SQL-Pool?
* Pool pausieren
- Pool löschen und neu anlegen
- Mehr DWU buchen
- Replikation aktivieren

? Welche Einheit nutzt Cosmos DB?
* Request Units (RU)
- DTU
- DWU
- SU

? Welche Einheit nutzt Stream Analytics?
* Streaming Units
- DWU
- RU
- DTU

? Wofür dient Event Hubs?
* Aufnahme von Ereignisströmen
- Speicherung von Dateien
- SQL-Abfragen
- Reporting

? Welche Analyseart beantwortet „Was wird passieren?“?
* Prädiktiv
- Deskriptiv
- Diagnostisch
- Präskriptiv

? Wie viele RU kostet ein Punktlesen eines 1-KB-Elements?
* 1
- 10
- 400
- 7,5

## Lücken
- Der {serverlose} SQL-Pool wird pro verarbeiteter Datenmenge abgerechnet, der {dedizierte} Pool über DWU.
- Cosmos DB rechnet in {RU} ab, Stream Analytics in {SU}.

## Zuordnen
### Dienst und Kosteneinheit
- Azure SQL Database => DTU
- Synapse dedizierter Pool => DWU
- Cosmos DB => RU
- Stream Analytics => Streaming Unit

## Spickzettel
- Synapse = SQL + Spark + Pipelines + Data Explorer
- Serverless (pro TB) vs. dediziert (DWU, pausierbar)
- DTU / DWU (1 DWU = 7,5 DTU) / RU (min 400) / SU
- Event Hubs → Stream Analytics → Power BI/Lake
