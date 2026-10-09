---
id: pr-dp203-stream-2
bereich: Prüfung
block: DP-203
kapitel: DP-203 Azure Data Engineer – Prüfungsfragen
titel: DP-203 – Stream Analytics und Event Hubs (Teil 2/2)
stufe: Profi
typ: fragen
pruefungen: [DP-203]
fach: SQL / Admin
quellen: [DE_A_ohne_D_1_bis_370.pdf, T1_-_1_bis_40_-_Lösung_und_Kommentare.pdf, T1_-_41_bis_80_-_Lösung_und_Kommentare.pdf, T1_-_81_bis_120_-_Lösung_und_Kommentare.pdf, T1_-_121_bis_140_-_Lösung_und_Kommentare.pdf, T2_-_141_bis_160_-_Lösung_und_Kommentare.pdf, T2_-_161_bis_180_-_Lösung_und_Kommentare.pdf, T2_-_181_bis_200_-_Lösung_und_Kommentare.pdf, T2_-_201_bis_240_-_Lösung_und_Kommentare.pdf, T2_-_241_bis_280_-_Lösung_und_Kommentare.pdf, 1_bis_40.pdf, 41_bis_80.pdf, 81_bis_120.pdf, 121_bis_160.pdf, 161_bis_200.pdf, 201_bis_240.pdf, 241_bis_280.pdf, 281_bis_320.pdf, 320_bis_370.pdf, 02d_Data_Engineering_-_SQL_Beispiele_und_Prüfungsfragen.pdf, 03d_Data_Engineering_-_Prüfungsfragen.pdf]
verweise: []
---

## Quiz

? Stream Analytics empfängt Daten aus Event Hubs und schreibt in Blob Storage. Jede Minute soll die Anzahl der in den letzten fünf Minuten empfangenen Datensätze ausgegeben werden. Welche Fensterfunktion?
- Session
- Tumbling
- Sliding
* Hopping
! `HoppingWindow(minute, 5, 1)`: Fenstergröße 5 Minuten, Hop 1 Minute – überlappende Fenster mit fester Ausgabefrequenz.
@ DP-203 Frage 153

? Sie überwachen einen Stream-Analytics-Auftrag mit Metriken. In den letzten 12 Stunden ist die durchschnittliche Wasserzeichenverzögerung (Watermark Delay) ständig größer als die konfigurierte Toleranz für verspätete Ankunft. Was ist eine mögliche Ursache?
- Ereignisse, deren Anwendungszeitstempel mehr als fünf Minuten vor der Ankunftszeit liegt, treffen als Eingaben ein.
- Die Eingabedaten enthalten Fehler.
- Die Richtlinie für verspätete Ankunft verwirft Ereignisse.
* Dem Auftrag fehlen Ressourcen, um das eingehende Datenvolumen zu verarbeiten.
! Watermark Delay steigt bei zu wenig Rechenleistung (SUs), gedrosselten Eingabebrokern (Event-Hubs-Durchsatzeinheiten) oder gedrosselten Ausgabesenken.
@ DP-203 Frage 161

? Stream Analytics empfängt Twitter-Daten aus Event Hubs und schreibt in Blob Storage. Alle fünf Minuten soll die Anzahl der Tweets der letzten fünf Minuten ausgegeben werden, jeder Tweet nur einmal. Welche Fensterfunktion?
- ein fünfminütiges Sliding Window
- ein fünfminütiges Session Window
- ein fünfminütiges Hopping Window mit einer Minute Hop
* ein fünfminütiges Tumbling Window
! Tumbling Windows wiederholen sich, überlappen nicht und jedes Ereignis gehört zu genau einem Fenster.
@ DP-203 Frage 181

? Eine Anomalieerkennung für Streamingdaten aus IoT Hub soll Ausgaben an Synapse senden, Spitzen und Einbrüche in Zeitreihen erkennen und wenig Entwicklungsaufwand haben. Was nehmen Sie auf?
- Azure Databricks
* Azure Stream Analytics
- Azure SQL Database
! Stream Analytics hat integrierte ML-Funktionen (AnomalyDetection_SpikeAndDip, ChangePoint).
@ DP-203 Frage 184

? Ein Unternehmen überwacht Geräte mit Stream Analytics und verdoppelt die Geräteanzahl. Welche Metrik zeigt, ob genug Verarbeitungsressourcen für die zusätzliche Last vorhanden sind?
- Early Input Events
- Late Input Events
* Watermark Delay
- Input Deserialization Errors
! Steigende Wasserzeichenverzögerung = Auftrag kommt nicht hinterher (zu wenig SUs, gedrosselte Ein-/Ausgaben).
@ DP-203 Frage 185

? Für einen Stream-Analytics-Auftrag wird SU % Utilization überwacht, um genug Streamingeinheiten sicherzustellen. Welche ZWEI weiteren Metriken überwachen Sie?
* Backlogged Input Events
* Watermark Delay
- Function Events
- Out of order Events
- Late Input Events
! Empfehlung: Warnung bei 80 % SU-Auslastung, dazu Watermark Delay und Backlog beobachten.
@ DP-203 Frage 187

? Streamingdaten aus Event Hubs sollen verarbeitet und in ADLS ausgegeben werden; Analysten sollen die Streamingdaten interaktiv abfragen können. Was verwenden Sie?
- Azure Stream Analytics und Azure-Synapse-Notebooks
* Structured Streaming in Azure Databricks
- Ereignistrigger in Azure Data Factory
- Azure Queue Storage und RA-GRS
! Databricks Structured Streaming liest Event Hubs, schreibt in ADLS (z. B. Delta) und erlaubt in Notebooks interaktive Abfragen auf denselben Daten. Community 65 % B.
@ DP-203 Frage 205

? Eine Streaminglösung nimmt variable Datenmengen auf; die Partitionsanzahl soll nach der Erstellung änderbar sein. Welchen Dienst verwenden Sie zur Erfassung?
* Azure Event Hubs Dedicated
- Azure Stream Analytics
- Azure Data Factory
- Azure Synapse Analytics
! Die Partitionsanzahl eines Event Hubs ist nach dem Anlegen fix – außer im Dedicated-Tarif (und Premium), wo sie erhöht werden kann.
@ DP-203 Frage 259

? In der letzten Stunde betrug die Anzahl zurückgebliebener Eingabeereignisse (Backlogged Input Events) eines Stream-Analytics-Auftrags 20. Wie verringern Sie sie?
- verspätet eintreffende Ereignisse verwerfen
- ein Speicherkonto hinzufügen
* die Streamingeinheiten (SUs) erhöhen
- den Auftrag stoppen
! Ein Backlog ungleich null zeigt, dass der Auftrag mit den eingehenden Ereignissen nicht mithält → hochskalieren (mehr SUs).
@ DP-203 Frage 295

? Die Metrik „Zurückgebliebene Eingabeereignisse“ eines Stream-Analytics-Auftrags steigt langsam und ist dauerhaft ungleich null. Der Auftrag soll alle Ereignisse verarbeiten. Was tun Sie?
- den Kompatibilitätsgrad ändern
* die Anzahl der Streamingeinheiten (SUs) erhöhen
- benannte Consumergruppen entfernen und $Default verwenden
- einen zusätzlichen Ausgabestream erstellen
! Dauerhafter Backlog = zu wenig Rechenleistung → SUs erhöhen (ggf. Abfrage parallelisieren).
@ DP-203 Frage 301

? Ein Unternehmen überwacht Fertigungsmaschinen mit IoT-Geräten über Azure IoT Hub und will die Geräte in Echtzeit überwachen. Was empfehlen Sie?
- Azure Analysis Services mit dem Azure-Portal
- Azure Analysis Services mit Azure PowerShell
* Azure-Stream-Analytics-Cloudauftrag über das Azure-Portal
- Azure Data Factory mit Visual Studio
! Stream Analytics liest Ereignisse direkt aus IoT Hub und führt Echtzeitabfragen aus.
@ DP-203 Frage 304

? IoT-Geräte überwachen Fertigungsmaschinen über Azure IoT Hub; eine Echtzeitüberwachung wird benötigt. Was empfehlen Sie?
- Azure Analysis Services mit Azure PowerShell
* Azure Stream Analytics Edge-Anwendung mit Microsoft Visual Studio
- Azure Analysis Services mit Visual Studio
- Azure Data Factory mit dem Azure-Portal
! Stream Analytics on IoT Edge bringt Echtzeitanalyse direkt an die Geräte; Edge-Jobs werden mit den Stream-Analytics-Tools in Visual Studio erstellt. (Ist eine Cloud-Variante unter den Antworten, gilt auch der Cloud-Auftrag.)
@ DP-203 Frage 317

? IoT-Geräte überwachen Fertigungsmaschinen über Azure IoT Hub; eine Echtzeitüberwachung wird benötigt. Was empfehlen Sie?
- Azure Analysis Services mit Azure PowerShell
- Azure Data Factory mit Azure PowerShell
* Azure-Stream-Analytics-Cloudauftrag über das Azure-Portal
- Azure Data Factory mit Visual Studio
! Stream Analytics liest IoT-Hub-Ereignisse und führt Echtzeitabfragen aus; Analysis Services und Data Factory sind keine Echtzeit-Streaming-Dienste.
@ DP-203 Frage 320

? Eine Stream-Analytics-Abfrage liefert ein Resultset mit 10.000 unterschiedlichen Werten der Spalte clusterID; die Latenz ist hoch. Welche ZWEI Aktionen senken die Latenz (jeweils vollständige Lösung)?
- eine Pass-Through-Abfrage hinzufügen
* die Anzahl der Streamingeinheiten erhöhen
- eine temporale Analysefunktion hinzufügen
* die Abfrage mit PARTITION BY skalieren
- die Abfrage in eine Referenzabfrage umwandeln
! Mehr SUs = mehr CPU/Speicher; PARTITION BY verteilt die Verarbeitung auf parallele Partitionen.
@ DP-203 Frage 324

? IoT-Geräte überwachen Fertigungsmaschinen über Azure IoT Hub; eine Echtzeitüberwachung wird benötigt. Was empfehlen Sie?
- Azure Analysis Services mit Visual Studio
- Azure Data Factory mit Azure PowerShell
- Azure Analysis Services mit Azure PowerShell
* Azure-Stream-Analytics-Cloudauftrag über das Azure-Portal
! Stream Analytics verarbeitet IoT-Hub-Daten in Echtzeit.
@ DP-203 Frage 342

? IoT-Geräte überwachen Fertigungsmaschinen über Azure IoT Hub; eine Echtzeitüberwachung wird benötigt. Was empfehlen Sie?
- Azure Analysis Services mit dem Azure-Portal
* Azure Stream Analytics Edge-Anwendung mit Microsoft Visual Studio
- Azure Analysis Services mit Azure PowerShell
- Azure Analysis Services mit Visual Studio
! Stream Analytics on IoT Edge (erstellt mit den Visual-Studio-Tools) analysiert die Gerätedaten nahezu in Echtzeit.
@ DP-203 Frage 344

? Metriken von Job1 (letzte Stunde): SU (Memory) % 70, CPU % 20, Laufzeitfehler 0, Watermark Delay 20 s (Durchschnitt), Deserialisierungsfehler 0; Toleranz für verspätete Ankunft 5 s. Welche ZWEI Aktionen optimieren Job1 (jeweils vollständige Lösung)?
* die Anzahl der Streamingeinheiten (SUs) erhöhen
* die Abfrage parallelisieren
- Fehler in der Ausgabeverarbeitung beheben
- Fehler in der Eingabeverarbeitung beheben
! Ein Watermark Delay von 20 s (über der Toleranz) bei hoher Speicherauslastung zeigt fehlende Ressourcen – mehr SUs oder Parallelisierung (PARTITION BY). Fehler gibt es keine.
@ DP-203 Frage 357

## Zuordnen

### DP-203 Frage 155 (Hotspot): Chatdaten aus Event Hubs – Anzahl Nachrichten je Zeitzone alle 15 Sekunden: `SELECT TimeZone, count(*) AS MessageCount FROM MessageStream [1] CreatedAt GROUP BY TimeZone, [2](second, 15)`
- [1] => TIMESTAMP BY
- [2] => TUMBLINGWINDOW

### DP-203 Frage 162 (Hotspot): Stream Analytics soll für jedes Spiel in jedem Fünf-Minuten-Intervall den Datensatz mit der höchsten Punktzahl liefern: `SELECT [1] AS HighestScore FROM input TIMESTAMP BY CreatedAt GROUP BY [2]` (Sammlung: Hopping(minute,5); ein Hopping Window braucht jedoch eine Hopgröße – für feste 5-Minuten-Intervalle ist Tumbling richtig, Community-Lösung)
- [1] => TopOne() OVER(PARTITION BY Game ORDER BY Score Desc)
- [2] => Tumbling(minute, 5)

### DP-203 Frage 168 (Hotspot): Geräte senden bei Fehlern alle 5 s ein Fehlerereignis, sonst alle 5 s einen HeartBeat. Die Betriebszeit zwischen Fehlern soll berechnet werden: `SELECT DeviceID, MIN(EventTime) AS StartTime, MAX(EventTime) AS EndTime, DATEDIFF(second, MIN(EventTime), MAX(EventTime)) AS duration_in_seconds FROM input TIMESTAMP BY EventTime [1] GROUP BY DeviceID, [2] HAVING DATEDIFF(second, MIN(EventTime), MAX(EventTime)) > 5` (Sammlung: TumblingWindow(second,5); Community-Lösung unten)
- [1] => WHERE EventType = 'HeartBeat'
- [2] => SessionWindow(second, 5, 50000) OVER (PARTITION BY DeviceID) – fasst lückenlose HeartBeats zu einer Sitzung zusammen

### DP-203 Frage 321 (Hotspot): Event Hub retailhub (16 Partitionen, Partitionsschlüssel TransactionID) → Stream-Analytics-Betrugserkennung → Ausgabe an Event Hub fraudhub; maximal skalierbar und schnell.
- Anzahl Partitionen der Ausgabe => 16
- Partitionsschlüssel => TransactionID (embarrassingly parallel: Eingabe- und Ausgabepartitionen 1:1)
