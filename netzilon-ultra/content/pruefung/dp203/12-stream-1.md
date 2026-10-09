---
id: pr-dp203-stream-1
bereich: Prüfung
block: DP-203
kapitel: DP-203 Azure Data Engineer – Prüfungsfragen
titel: DP-203 – Stream Analytics und Event Hubs (Teil 1/2)
stufe: Profi
typ: fragen
pruefungen: [DP-203]
fach: SQL / Admin
quellen: [DE_A_ohne_D_1_bis_370.pdf, T1_-_1_bis_40_-_Lösung_und_Kommentare.pdf, T1_-_41_bis_80_-_Lösung_und_Kommentare.pdf, T1_-_81_bis_120_-_Lösung_und_Kommentare.pdf, T1_-_121_bis_140_-_Lösung_und_Kommentare.pdf, T2_-_141_bis_160_-_Lösung_und_Kommentare.pdf, T2_-_161_bis_180_-_Lösung_und_Kommentare.pdf, T2_-_181_bis_200_-_Lösung_und_Kommentare.pdf, T2_-_201_bis_240_-_Lösung_und_Kommentare.pdf, T2_-_241_bis_280_-_Lösung_und_Kommentare.pdf, 1_bis_40.pdf, 41_bis_80.pdf, 81_bis_120.pdf, 121_bis_160.pdf, 161_bis_200.pdf, 201_bis_240.pdf, 241_bis_280.pdf, 281_bis_320.pdf, 320_bis_370.pdf, 02d_Data_Engineering_-_SQL_Beispiele_und_Prüfungsfragen.pdf, 03d_Data_Engineering_-_Prüfungsfragen.pdf]
verweise: []
---

## Quiz

? Streamingdaten aus Apache Kafka sollen aggregiert und in ADLS Gen2 ausgegeben werden. Die Entwickler der Streamverarbeitung arbeiten mit Java. Welchen Dienst empfehlen Sie?
- Azure Event Hubs
- Azure Data Factory
- Azure Stream Analytics
* Azure Databricks
! Databricks (Spark Structured Streaming) unterstützt Java, Scala, Python, R und SQL sowie Kafka als Quelle. Stream Analytics nutzt eine SQL-ähnliche Abfragesprache (Erweiterung nur mit JavaScript/C#).
@ DP-203 Frage 27

? Social-Media-Streamingdaten werden mit Stream Analytics in ADLS-Dateien geschrieben und dann mit Databricks und PolyBase (Synapse) genutzt. Welches Ausgabeformat sorgt für möglichst wenige Fehler, schnelle Abfragen und erhaltene Datentypinformationen?
- JSON
* Parquet
- CSV
- Avro
! Parquet ist spaltenbasiert, speichert das Schema mit Datentypen und wird von Databricks und PolyBase unterstützt (PolyBase liest kein Avro). Dozent: „Parquet unterstützt Databricks und PolyBase.“
@ DP-203 Frage 32

? Stream-Analytics-Abfrage: `WITH step1 AS (SELECT * FROM input1 PARTITION BY StateID INTO 10), step2 AS (SELECT * FROM input2 PARTITION BY StateID INTO 10) SELECT * INTO output FROM step1 PARTITION BY StateID UNION SELECT * INTO output FROM step2 PARTITION BY StateID`. Welche Aussagen treffen zu?
- Die Abfrage kombiniert zwei Streams partitionierter Daten.
* Schlüssel und Anzahl des Partitionsschemas der Streams müssen zum Ausgabeschema passen.
* 60 Streamingeinheiten (SUs) optimieren die Leistung der Abfrage.
! Laut Lösung: Aussage 1 Nein, 2 Ja (neu partitionierte Streams brauchen denselben Partitionsschlüssel und dieselbe Anzahl), 3 Ja (Faustregel 6 SUs je Partition × 10 Partitionen = 60 SUs).
@ DP-203 Frage 52

? Eine Echtzeit-Lösung nutzt Event Hubs zur Erfassung und einen Stream-Analytics-Cloudauftrag mit 120 Streamingeinheiten (SU). Die Leistung soll optimiert werden. Welche ZWEI Aktionen führen Sie aus?
- Ereignisreihenfolge implementieren
- benutzerdefinierte Funktionen (UDF) implementieren
* Abfrageparallelisierung durch Partitionieren der Datenausgabe implementieren
- die SU-Anzahl erhöhen
- die SU-Anzahl verringern
* Abfrageparallelisierung durch Partitionieren der Dateneingabe implementieren
! „Embarrassingly parallel“: Eingabe und Ausgabe gleich partitionieren, damit jede Partition unabhängig verarbeitet wird. Die Sammlung nennt DF (mehr SUs + Eingabe partitionieren), die Community ist gespalten (CF 48 %, DF 40 %); 120 SUs sind bereits viel, daher hier CF.
@ DP-203 Frage 116

? Eine statistische Analyse soll eigene, proprietäre Python-Funktionen auf nahezu Echtzeitdaten aus Event Hubs anwenden – mit minimaler Latenz. Welchen Dienst empfehlen Sie?
- Azure Synapse Analytics
* Azure Databricks
- Azure Stream Analytics
- Azure SQL Database
! Stream Analytics unterstützt UDFs nur in JavaScript und C#, nicht in Python. Databricks (Spark Structured Streaming) führt Python-Code auf Event-Hubs-Streams aus. Die Sammlung nennt C, die Community (64 %) B.
@ DP-203 Frage 127

? Serie (gleiches Szenario): Stream Analytics soll Tweets in jedem 10-Sekunden-Fenster zählen, jeder Tweet nur einmal. Lösung: Hopping Window mit Hopgröße 10 Sekunden und Fenstergröße 10 Sekunden. Erreicht das das Ziel?
* Ja
- Nein
! Ist die Hopgröße gleich der Fenstergröße, überlappen die Fenster nicht – das Hopping Window verhält sich wie ein Tumbling Window. Die Sammlung nennt Nein, die Community (70 %) Ja; laut Microsoft-Doku ist Ja korrekt.
@ DP-203 Frage 130

? Serie (gleiches Szenario): Tweets in jedem 10-Sekunden-Fenster zählen, jeder Tweet nur einmal. Lösung: Hopping Window mit Hopgröße 5 Sekunden und Fenstergröße 10 Sekunden. Erreicht das das Ziel?
- Ja
* Nein
! Hop 5 s < Fenster 10 s → Fenster überlappen, jeder Tweet wird zweimal gezählt. Richtig: Tumbling Window (oder Hop = Fenster).
@ DP-203 Frage 131

? Ein Stream-Analytics-Auftrag erhält Clickstreamdaten aus Event Hubs. Gezählt werden sollen die Klicks je Land in jedem 10-Sekunden-Fenster, kein Klick mehr als einmal. Welche Abfrage?
- `SELECT Country, Avg(*) AS Average FROM ClickStream TIMESTAMP BY CreatedAt GROUP BY Country, SlidingWindow(second, 10)`
* `SELECT Country, Count(*) AS Count FROM ClickStream TIMESTAMP BY CreatedAt GROUP BY Country, TumblingWindow(second, 10)`
- `SELECT Country, Avg(*) AS Average FROM ClickStream TIMESTAMP BY CreatedAt GROUP BY Country, HoppingWindow(second, 10, 2)`
- `SELECT Country, Count(*) AS Count FROM ClickStream TIMESTAMP BY CreatedAt GROUP BY Country, SessionWindow(second, 5, 10)`
! Tumbling Windows sind feste, lückenlose, nicht überlappende Intervalle – jedes Ereignis gehört genau zu einem Fenster. Außerdem wird gezählt (Count), nicht gemittelt.
@ DP-203 Frage 141

? Eine Stream-Analytics-Lösung hat Streamingdaten und Referenzdaten. Welchen Eingabetyp verwenden Sie für die Referenzdaten?
- Azure Cosmos DB
* Azure Blob Storage
- Azure IoT Hub
- Azure Event Hubs
! Referenzdaten können aus Azure Blob Storage/ADLS Gen2 oder Azure SQL Database kommen; Event Hubs und IoT Hub sind Streameingaben.
@ DP-203 Frage 145

? Ein Stream-Analytics-Auftrag soll aus Sensordaten im Einzelhandel einen laufenden Durchschnitt der Kundenzahlen der letzten 15 Minuten bilden, berechnet alle 5 Minuten. Welches Fenster?
- Snapshot
- Tumbling (rollierend)
* Hopping (springend)
- Sliding (gleitend)
! Hopping Window mit Fenstergröße 15 Minuten und Hop 5 Minuten: `HoppingWindow(minute, 15, 5)` – überlappende Fenster in festem Takt.
@ DP-203 Frage 146

? Serie (gleiches Szenario): Tweets in jedem 10-Sekunden-Fenster zählen, jeder Tweet nur einmal. Lösung: Sie verwenden ein rollierendes Fenster (Tumbling Window) mit 10 Sekunden. Erreicht das das Ziel?
* Ja
- Nein
! `GROUP BY TimeZone, TumblingWindow(second, 10)` – feste, nicht überlappende Intervalle, jeder Tweet zählt genau einmal.
@ DP-203 Frage 151

? Serie (gleiches Szenario): Tweets in jedem 10-Sekunden-Fenster zählen, jeder Tweet nur einmal. Lösung: Sie verwenden ein Sitzungsfenster (Session Window) mit 10 Sekunden Timeout. Erreicht das das Ziel?
- Ja
* Nein
! Sitzungsfenster haben variable Länge (sie enden erst nach 10 s ohne Ereignis) – keine festen 10-Sekunden-Intervalle.
@ DP-203 Frage 152

## Reihenfolge

### DP-203 Frage 138 (Drag & Drop): Ein Stream-Analytics-Projekt in Visual Studio akzeptiert JSON von IoT-Geräten und soll künftig das Protobuf-Format akzeptieren. Reihenfolge der drei Aktionen?
1. Projekt „Azure Stream Analytics Custom Deserializer Project (.NET)“ zur Projektmappe hinzufügen
2. .NET-Deserialisierungscode für Protobuf im Custom-Deserializer-Projekt hinzufügen
3. In der input.json des Auftrags das Ereignisserialisierungsformat auf Protobuf setzen und auf die DLL verweisen

## Zuordnen

### DP-203 Frage 51 (Hotspot): Stream-Analytics-Referenzeingabe „products“ – Container refdata, bisher Pfadmuster `product.csv`; die Datei liegt jedoch unter `refdata/2020-03-20/product.csv` und wird täglich aktualisiert. Was konfigurieren Sie?
- Pfadmuster (Path pattern) => {date}/product.csv
- Datumsformat (Date format) => YYYY-MM-DD

### DP-203 Frage 115 (Hotspot): Echtzeit-Überwachungs-App soll warnen, wenn sich ein Gerät mehr als 200 m von einem Standort entfernt – Stream-Analytics-Auftrag mit möglichst wenig Code und Technologien.
- Eingabetyp => Stream
- Funktion => Geodatenfunktion (Geospatial)

### DP-203 Frage 119 (Hotspot): Mautstelle – Kennzeichen, Marke und Uhrzeit des letzten Fahrzeugs je 10-Minuten-Fenster. `WITH LastInWindow AS (SELECT [1](Time) AS LastEventTime FROM Input TIMESTAMP BY Time GROUP BY [2](minute, 10)) SELECT Input.License_plate, Input.Make, Input.Time FROM Input TIMESTAMP BY Time INNER JOIN LastInWindow ON [3](minute, Input, LastInWindow) BETWEEN 0 AND 10 AND Input.Time = LastInWindow.LastEventTime`
- [1] => MAX
- [2] => TumblingWindow
- [3] => DATEDIFF

### DP-203 Frage 132 (Hotspot): Stream Analytics soll die Dauer zwischen Start- und End-Ereignis je Benutzer und Feature berechnen: `SELECT [user], feature, [1](second, [2](Time) OVER (PARTITION BY [user], feature LIMIT DURATION(hour, 1) WHEN Event = 'start'), Time) AS duration FROM input TIMESTAMP BY Time WHERE Event = 'end'`
- [1] => DATEDIFF
- [2] => LAST

### DP-203 Frage 137 (Hotspot): Echtzeit-Dashboard für Sensordaten – Durchschnitt je 10-Sekunden-Intervall, Daten nach Anzeige verwerfen; Latenz Event Hub → Dashboard, Speicher und Entwicklungsaufwand minimieren.
- Eingabetyp von Stream Analytics => Azure Event Hub
- Ausgabetyp von Stream Analytics => Microsoft Power BI
- Ort der Aggregationsabfrage => Azure Stream Analytics

### DP-203 Frage 140 (Hotspot): Durchschnittlicher Fahrpreis pro Meile und Fahrer – Database1 (Name, Führerscheinnummer), HubA (Route, Distanz, Dauer), HubB (Fahrpreis, Zahlung). Welcher Stream-Analytics-Eingabetyp je Quelle?
- HubA => Stream
- HubB => Stream
- Database1 => Referenz (Reference)

### DP-203 Frage 142 (Hotspot): Stream Analytics (IoT Hub → Blob Storage) soll die Differenz der Messwerte je Sensor innerhalb einer Stunde berechnen: `SELECT sensorId, growth = reading - [1](reading) OVER (PARTITION BY sensorId [2](hour, 1)) FROM input`
- [1] => LAG
- [2] => LIMIT DURATION

### DP-203 Frage 147 (Hotspot): 500 Fahrzeuge senden minütlich GPS-Daten an einen Event Hub; eine CSV in ADLS Gen2 enthält das erwartete Gebiet je Fahrzeug. Innerhalb von 30 Sekunden soll eine Nachricht an einen anderen Event Hub gehen, wenn eine Position außerhalb liegt – kostengünstig. (Sammlung: Fenster „Hopping“; Community: „kein Fenster“, da jede Position einzeln geprüft wird)
- Dienst => Azure Stream Analytics
- Fenster => kein Fenster (No window)
- Analysetyp => Punkt innerhalb eines Polygons (Point within polygon)
