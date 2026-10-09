---
id: azd-stream-analytics
bereich: Azure Data
pruefungen: [DP-203]
fach: Data Engineering
block: A2
kapitel: Streaming
titel: Azure Stream Analytics und Event Hubs – Echtzeitverarbeitung, Fenster, SA-QL
stufe: Fortgeschritten
quellen: [08_b_Data_Engineering_-_Synapse_Analysis.pdf, 03a_Data_Engineering_-_Datentypen_und_Strukturen.pdf, 08_a_Data_Engineering_-_Data_Warehouse.pdf]
verweise: [azd-synapse, azd-grundlagen, azd-cosmos-db]
---

## Profi

Hinweis zur Quelle: Im Kurs wird Streaming in „Synapse Analytics 02“ mit Event Hubs, Stream Analytics (SA-QL), Streaming Units und Ereignisverarbeitung behandelt; Fenster-Funktionen und Details stammen aus dem DP-203-Standardstoff.

### Ereignisverarbeitung
**Event Producer** (Sensoren, Apps, Systeme, .NET SDK) → **Aufnahme** (Event Hubs, IoT Hub, Blob Storage) → **Event Processor / Analytical Engine** (Azure Stream Analytics, Query Language **SA-QL**) → **Event Consumer / Ziel** (Data Lake, Cosmos DB, SQL-Datenbank, Blob Storage, Power BI, Warnungen, Dashboards).
Ereignisse: einzeln (Herzfrequenz-Monitor) oder mehrere gleichzeitig (Maut-Spursensor).

### Event Hubs
Hochskalierbarer Dienst, der **Millionen Ereignisse pro Sekunde** aufnimmt und an mehrere Anwendungen streamt; Ereignis = kleines Informationspaket (einzeln oder im Batch). Konzepte: **Namespace**, **Event Hub**, **Partitionen** (Parallelität, Reihenfolge je Partition), **Consumer Groups** (getrennte Lesesichten), **Capture** (automatische Archivierung in Blob/ADLS, Avro). Einsatz: Anomalieerkennung (Betrug/Ausreißer), Anwendungsprotokolle, Clickstream-Pipelines, Live-Dashboards, Archivierung, Transaktionsverarbeitung, Benutzer-/Gerätetelemetrie. **IoT Hub**: bidirektionale Gerätekommunikation (Cloud-zu-Gerät), Gerätemanagement.

### Azure Stream Analytics
Vollständig verwalteter Echtzeit-Analysedienst: **Job** mit **Input(s)**, **Query** (SQL-ähnlich, SA-QL) und **Output(s)**. Kosten über **Streaming Units (SU)** (Rechen-/Speicherressourcen des Jobs). Zeitbezug: **Event time** vs. Ankunftszeit (`TIMESTAMP BY`), Toleranz für verspätete/unsortierte Ereignisse.
**Zeitfenster (Windowing)**
| Fenster | Prinzip |
|---|---|
| **Tumbling** | feste, nicht überlappende Intervalle (jede Minute) |
| **Hopping** | feste Größe, überlappend (5 Minuten Fenster alle 1 Minute) |
| **Sliding** | wird bei jedem Ereignis neu ausgewertet, nur wenn sich Inhalt ändert |
| **Session** | gruppiert Ereignisse bis zu einer Pause (Timeout) |
| **Snapshot** | Ereignisse mit identischem Zeitstempel |
```
SELECT System.Timestamp AS Fenster, DeviceId, AVG(Temperatur) AS AvgTemp
INTO [PowerBIOut]
FROM [EventHubIn] TIMESTAMP BY EventTime
GROUP BY DeviceId, TumblingWindow(minute, 1)
HAVING AVG(Temperatur) > 80
```
Joins mit Referenzdaten (Blob/SQL), Stream-zu-Stream-Join (`DATEDIFF`), Machine-Learning-Funktionen (Anomalieerkennung).
**Alternativen**: Spark Structured Streaming (Databricks/Synapse), Azure Data Explorer. **Lambda-Architektur** (Batch + Speed Layer) vs. Kappa (nur Stream).

### Zuverlässigkeit
Zustellgarantie: **at-least-once**; Exactly-once bei geeigneten Zielen. Neustart-Strategien, Checkpoints, Late-Arrival-Policy.

## Einfach

Normale Datenanalyse ist wie ein **Fotoalbum**: Man sammelt Bilder und schaut sie später an. **Streaming** ist wie ein **Live-Video**: Man reagiert **sofort**, während es passiert.

- **Event Hubs** = ein **riesiger Trichter am Fluss**: Er fängt Millionen kleiner Meldungen pro Sekunde auf (z. B. von Sensoren, Handys, Mautstellen).
- **Stream Analytics** = der **Wächter am Fluss**. Er schaut jede Meldung an und rechnet sofort: „Wie hoch war die Durchschnittstemperatur in der letzten Minute? Wenn über 80, schlage Alarm!“ Seine Frage schreibt man in einer Sprache, die fast wie SQL aussieht (SA-QL).
- **Ziele** = wohin das Ergebnis geht: ein Live-Dashboard (Power BI), ein Lager (Data Lake), eine Datenbank oder eine Alarmmeldung.

**Fenster** sind wie **Stoppuhr-Abschnitte**: Weil ein Strom nie endet, muss man ihn in Stücke schneiden, um zu rechnen:
- **Tumbling** = jede Minute ein **neues Stück**, kein Überlappen (Kuchen in gleiche Stücke).
- **Hopping** = Stücke, die **sich überlappen** (jede Minute die letzten fünf Minuten ansehen).
- **Sliding** = immer, wenn etwas passiert, schaut man **rückwärts** auf die letzte Zeitspanne.
- **Session** = ein Stück **endet erst, wenn für eine Weile Ruhe ist** (wie ein Gespräch: bis eine Pause entsteht).

Bezahlt wird mit **Streaming Units (SU)** – je mehr, desto mehr Rechenpower für den Wächter.

## Merksatz
- **Event Hubs nimmt auf, Stream Analytics rechnet.**
- **Fenster: Tumbling, Hopping, Sliding, Session (und Snapshot).**
- **Tumbling = ohne Überlappung, Hopping = mit Überlappung.**
- **Kosten: Streaming Units (SU).**
- **SA-QL = SQL-ähnlich + TIMESTAMP BY + Fenster.**

## Prüfungsfalle
- Event Hubs analysiert nicht – es nimmt Ereignisse auf.
- IoT Hub kann Befehle **an Geräte** senden, Event Hubs nicht.
- Tumbling-Fenster überlappen nicht, Hopping schon.
- Event time (TIMESTAMP BY) ≠ Ankunftszeit am Event Hub.
- Reihenfolge gilt nur innerhalb einer Event-Hub-Partition.
- Stream Analytics: Kosten über SU, nicht DTU/RU.
- Für Archivierung in Blob/ADLS: Event Hubs **Capture**.

## Grafik
### Stream-Pipeline mit Tumbling Window
1. Sensor -> Event Hubs: Temperaturwert 78
2. Sensor -> Event Hubs: Temperaturwert 83
3. Event Hubs -> Stream Analytics: Ereignisstrom
4. Stream Analytics: Tumbling Window 1 Minute, AVG = 80,5
5. Stream Analytics -> Power BI: Dashboard aktualisiert
6. Stream Analytics -> Data Lake: Archiv
### Fenstertypen
1. Tumbling: Fenster 0-1, 1-2, 2-3 Minuten ohne Überlappung
2. Hopping: Fenster 0-5, 1-6, 2-7 mit Überlappung
3. Session: Fenster endet nach Pause von 30 Sekunden

## Lab
### GUI
Maschine: Windows-Client (Azure Portal). Event Hubs Namespace + Event Hub erstellen, Stream-Analytics-Job anlegen (1 SU), Input = Event Hub, Output = Blob, Query bearbeiten, Testdaten hochladen, Job starten. Danach RG löschen.
### SQL
```
SELECT System.Timestamp AS t, COUNT(*) AS anzahl INTO [BlobOut] FROM [EventHubIn] GROUP BY TumblingWindow(second, 10)
```

## Übungen
- A: Alle 5 Minuten soll der Durchschnitt der letzten 5 Minuten berechnet werden. Welches Fenster? | L: Tumbling Window (5 Minuten).
- A: Jede Minute soll der Durchschnitt der letzten 10 Minuten berechnet werden. | L: Hopping Window (Größe 10, Hop 1 Minute).
- A: Ein Kunde möchte Ereignisse automatisch im Data Lake archivieren. | L: Event Hubs Capture.
- A: Welcher Dienst nimmt Millionen Ereignisse/s auf? | L: Azure Event Hubs.

## Karteikarten
- F: Was ist Azure Stream Analytics? | A: Verwalteter Echtzeit-Analysedienst mit SQL-ähnlicher Sprache (SA-QL).
- F: Kosteneinheit von Stream Analytics? | A: Streaming Unit (SU).
- F: Was ist Event Hubs? | A: Dienst zur Aufnahme von Millionen Ereignissen pro Sekunde.
- F: Was ist Capture bei Event Hubs? | A: Automatische Archivierung der Ereignisse in Blob/Data Lake.
- F: Tumbling Window? | A: Feste, nicht überlappende Zeitfenster.
- F: Hopping Window? | A: Feste Größe, überlappend durch kleineren Hop.
- F: Session Window? | A: Gruppiert Ereignisse bis zu einer Pause (Timeout).
- F: Wofür TIMESTAMP BY? | A: Verwendet die Ereigniszeit statt der Ankunftszeit.
- F: Event Hubs vs. IoT Hub? | A: Event Hubs: Ereignisaufnahme; IoT Hub: zusätzlich bidirektionale Gerätekommunikation.
- F: Was sind typische Senken? | A: Power BI, Data Lake, Cosmos DB, SQL-Datenbank, Blob.

## Quiz
? Welches Fenster überlappt nicht?
* Tumbling
- Hopping
- Sliding
- Alle überlappen

? Wofür dient TIMESTAMP BY?
* Ereigniszeit als Zeitbezug verwenden
- Daten verschlüsseln
- Ausgabe sortieren
- Pipeline starten

? Wie werden Stream-Analytics-Jobs abgerechnet?
* Streaming Units
- DTU
- RU
- DWU

? Welcher Dienst nimmt Ereignisse auf?
* Event Hubs
- Stream Analytics
- Power BI
- Azure Files

? Was archiviert Event Hubs automatisch in Blob?
* Capture
- Replikation
- Snapshot
- Lifecycle

? Welches Fenster endet nach einer Ereignispause?
* Session
- Tumbling
- Hopping
- Snapshot

? Welche Sprache nutzt Stream Analytics?
* SA-QL (SQL-ähnlich)
- Python only
- R
- Bash

? Welcher Dienst kann Befehle an Geräte senden?
* IoT Hub
- Event Hubs
- Blob Storage
- Table Storage

## Lücken
- Stream Analytics wird über {Streaming Units} abgerechnet.
- Ein {Tumbling} Window hat feste, nicht überlappende Intervalle.

## Zuordnen
### Fenster und Verhalten
- Tumbling => ohne Überlappung
- Hopping => mit Überlappung
- Sliding => ereignisgetrieben
- Session => endet nach Pause

## Spickzettel
- Producer → Event Hubs → Stream Analytics (SA-QL) → Ziele
- Fenster: Tumbling, Hopping, Sliding, Session, Snapshot
- Kosten: SU; Capture archiviert
- IoT Hub für bidirektionale Geräte
