---
id: pr-dp203-nachtrag-5
bereich: Prüfung
block: DP-203
kapitel: DP-203 Azure Data Engineer – Prüfungsfragen
titel: DP-203 – Nachtrag 5
stufe: Profi
typ: fragen
pruefungen: [DP-203]
fach: SQL / Admin
quellen: [DE_A_ohne_D_1_bis_370.pdf, T1_-_1_bis_40_-_Lösung_und_Kommentare.pdf, T1_-_41_bis_80_-_Lösung_und_Kommentare.pdf, T1_-_81_bis_120_-_Lösung_und_Kommentare.pdf, T1_-_121_bis_140_-_Lösung_und_Kommentare.pdf, T2_-_141_bis_160_-_Lösung_und_Kommentare.pdf, T2_-_161_bis_180_-_Lösung_und_Kommentare.pdf, T2_-_181_bis_200_-_Lösung_und_Kommentare.pdf, T2_-_201_bis_240_-_Lösung_und_Kommentare.pdf, T2_-_241_bis_280_-_Lösung_und_Kommentare.pdf, 1_bis_40.pdf, 41_bis_80.pdf, 81_bis_120.pdf, 121_bis_160.pdf, 161_bis_200.pdf, 201_bis_240.pdf, 241_bis_280.pdf, 281_bis_320.pdf, 320_bis_370.pdf]
verweise: []
---

## Quiz

? Frage 140 (Hotspot): Database1 (Azure SQL: Name und Führerscheinnummer der Fahrer), HubA (Fahrtroute, -strecke, -dauer) und HubB (Fahrpreis, Zahlung) liefern Daten. Stream Analytics soll den durchschnittlichen Fahrpreis pro Meile pro Fahrer berechnen. Welchen Eingabetyp konfigurieren Sie für HubA und HubB?
* HubA: Stream; HubB: Stream
- HubA: Reference; HubB: Stream
- HubA: Stream; HubB: Reference
- HubA: Reference; HubB: Reference
! Event Hubs liefern fortlaufende Ereignisströme (Stream).
@ DP-203 Frage 140

? Frage 140 (Hotspot): Welchen Eingabetyp hat Database1 (Fahrerstammdaten)?
- Stream
* Reference
- Windowed
- Output
! Referenzdaten sind ein endlicher, statischer oder sich langsam ändernder Datensatz, mit dem Datenströme angereichert werden; Stream Analytics lädt sie für geringe Latenz in den Arbeitsspeicher.
@ DP-203 Frage 140

? Frage 142 (Hotspot): Stream-Analytics-Abfrage (IoT Hub → Blob Storage): Die Differenz der Messwerte pro Sensor und Stunde berechnen: growth = reading - ____(reading) OVER (PARTITION BY sensorId ____ (hour, 1)). Welche Elemente fehlen?
* LAG und LIMIT DURATION
- LEAD und WHEN
- LAST und OFFSET
- LAG und OFFSET
! LAG liest den vorherigen Wert; LIMIT DURATION begrenzt die Rückschau auf das Zeitfenster (hier eine Stunde).
@ DP-203 Frage 142

? Frage 147 (Hotspot): 500 Fahrzeuge senden minütlich GPS-Daten an einen Event Hub; die erwarteten Gebiete stehen in einer CSV-Datei (ADLS). Bei einer Position außerhalb muss innerhalb von 30 Sekunden eine Nachricht an einen anderen Event Hub gehen; Kosten minimieren. Welchen Dienst verwenden Sie?
- Azure-Synapse-Apache-Spark-Pool
- Serverloser Azure-Synapse-SQL-Pool
- Azure Data Factory
* Azure Stream Analytics
! Stream Analytics verarbeitet Event-Hub-Daten nahezu in Echtzeit; die CSV-Datei dient als Referenzdaten-Eingabe.
@ DP-203 Frage 147

? Frage 147 (Hotspot): Welches Fenster und welche Analyseart verwenden Sie?
* Hopping-Fenster und „Point within polygon“ (Punkt-in-Polygon)
- Tumbling-Fenster und „Polygon overlap“
- Session-Fenster und „Lagged record comparison“
- Kein Fenster und „Event pattern matching“
! Die Prüfung, ob eine GPS-Position innerhalb des erlaubten Gebiets liegt, ist ein Punkt-in-Polygon-Test (ST_WITHIN). Die Quelle wählt hier ein Hopping-Fenster.
@ DP-203 Frage 147

? Frage 149 (Hotspot): Selbstgehostete Integration Runtime mit einem Knoten (X-M), Hochverfügbarkeit: Falsch, gleichzeitige Jobs 2/14, CPU-Auslastung 6 %. Was passiert mit den laufenden Pipelines, wenn der Knoten X-M nicht mehr verfügbar ist?
* Sie schlagen fehl, bis der Knoten wieder online ist.
- Sie wechseln zu einer anderen Integration Runtime.
- Sie überschreiten das CPU-Limit.
- Sie laufen auf einem zweiten, automatisch erzeugten Knoten weiter.
! Bei nur einem Knoten ohne Hochverfügbarkeit ist die Integration Runtime ein Single Point of Failure.
@ DP-203 Frage 149

? Frage 149 (Hotspot): Was folgt aus 2 laufenden Jobs bei einem Limit von 14 und 6 % CPU-Auslastung für den Wert „Gleichzeitige Jobs (Ausgeführt/Limit)“?
- Er sollte gesenkt werden.
* Er sollte erhöht werden.
- Er sollte unverändert bleiben.
- Er sollte auf 0 gesetzt werden.
! Die Auslastung ist sehr gering – es ist Spielraum für mehr parallele Jobs (Quelle: erhöhen).
@ DP-203 Frage 149

? Frage 154 (Hotspot): ADF mit Git-Anbindung (Azure DevOps Git): Repository dwh_batchetl, Collaboration branch main, Publish branch adf_publish, Root folder /. In welchem Zweig werden die ARM-Vorlagen für die Pipeline-Ressourcen gespeichert?
* adf_publish
- main
- dwh_batchetl
- Parameterization template
! Der Publish-Branch (Standard adf_publish) enthält die beim Veröffentlichen erzeugten ARM-Vorlagen.
@ DP-203 Frage 154

? Frage 154 (Hotspot): Wo findet man die ARM-Vorlage der Data Factory „contososales“?
- /contososales
* /dwh_batchetl/adf_publish/contososales
- /main
- /adf_publish/main
! Pfad: /<Repositoryname>/<Publish-Branch>/<Factory-Name>.
@ DP-203 Frage 154

? Frage 155 (Hotspot): Stream Analytics soll aus einem Event Hub (Chatdaten) alle 15 Sekunden die Nachrichten pro Zeitzone zählen: SELECT TimeZone, COUNT(*) AS MessageCount FROM MessageStream ____ CreatedAt GROUP BY TimeZone, ____(second, 15). Was setzen Sie ein?
* TIMESTAMP BY und TUMBLINGWINDOW
- OVER und HOPPINGWINDOW
- LAST und SESSIONWINDOW
- SYSTEM.TIMESTAMP() und SLIDINGWINDOW
! TIMESTAMP BY nutzt den Ereigniszeitstempel; das Tumbling Window bildet feste, nicht überlappende 15-Sekunden-Fenster.
@ DP-203 Frage 155

? Frage 156 (Hotspot): P1 kopiert von einer nicht partitionierten Tabelle in einem dedizierten SQL-Pool (WS1) nach ADLS Gen2, P2 kopiert aus Textdateien in ADLS Gen2 in eine nicht partitionierte Tabelle in einem dedizierten SQL-Pool (WS2). Parallelität und Leistung maximieren. Welche Einstellung wählen Sie für P1 (Quelle: dedizierter SQL-Pool)?
- Copy method auf Bulk insert
- Copy method auf PolyBase
- Isolation level auf Repeatable read
* Partition option auf Dynamic range
! Bei einer Synapse-Quelle wird die Parallelität über die Partitionsoption (Dynamic range) erhöht.
@ DP-203 Frage 156

? Frage 156 (Hotspot): Welche Einstellung wählen Sie für P2 (Senke: dedizierter SQL-Pool, Quelle Textdateien in ADLS)?
- Copy method auf Bulk insert
* Copy method auf PolyBase
- Isolation level auf Repeatable read
- Partition option auf Dynamic range
! PolyBase ist die schnellste und skalierbarste Methode, Daten aus ADLS in einen dedizierten SQL-Pool zu laden. (Die Quelle ordnet die Einstellungen etwas missverständlich zu; fachlich gilt: Quelle Synapse = Dynamic range, Senke Synapse = PolyBase.)
@ DP-203 Frage 156

? Frage 157 (Hotspot): Ein Speicherkonto erzeugt täglich 200.000 neue Dateien (Format {YYYY}/{MM}/{DD}/{HH}/{CustomerID}.csv). ADF soll stündlich neue Daten in einen Data Lake laden; Ladezeit und Kosten minimieren. Welche Lademethode?
- Vollständiges Laden (Full load)
* Inkrementelles Laden (Incremental load)
- Einzelne Dateien beim Eintreffen laden
- Mehrere Speicherkonten verwenden
! Nur neue Daten werden geladen (zeitscheibenbasierte Ordner); ein Event-Trigger pro Datei wäre bei 200.000 Dateien zu teuer.
@ DP-203 Frage 157

? Frage 157 (Hotspot): Welchen Trigger verwenden Sie?
- Fester Zeitplan (Schedule)
- Neue Datei (Storage event)
* Tumbling window
- Manueller Trigger
! Tumbling-Window-Trigger arbeiten mit festen, nicht überlappenden Zeitintervallen (hier stündlich) und können die Zeitscheibe als Parameter übergeben.
@ DP-203 Frage 157

? Frage 160 (Drag-and-Drop): Sie haben Mitwirkendenzugriff auf ein ADLS-Gen2-Konto (Anwendungs-ID und Zugriffsschlüssel vorhanden) und konfigurieren PolyBase für das Laden in Azure Synapse Analytics. Welche drei Komponenten erstellen Sie in welcher Reihenfolge?
* Schlüssel (Datenbank-Hauptschlüssel/asymmetrischer Schlüssel), datenbankweit gültige Anmeldeinformationen, externe Datenquelle
- Externes Dateiformat, externe Datenquelle, datenbankweit gültige Anmeldeinformationen
- Datenbankverschlüsselungsschlüssel, externe Datenquelle, externes Dateiformat
- Externe Datenquelle, datenbankweit gültige Anmeldeinformationen, asymmetrischer Schlüssel
! Zuerst wird der Schlüssel (Master Key) zum Schutz der Anmeldeinformationen angelegt, dann das Database Scoped Credential, danach die externe Datenquelle, die dieses Credential verwendet. (Die Quelle nennt den „asymmetrischen Schlüssel“; gemeint ist der Datenbank-Hauptschlüssel.)
@ DP-203 Frage 160

? Frage 207 (Drag-and-Drop): Databricks-Notebook mit df_sales (Customer, SalesPerson, Region, Amount): Die drei besten Vertriebsmitarbeiter nach Betrag für die Region „HQ“ ermitteln. Welche Abfrage ist richtig?
* df_sales.filter(col('Region')=='HQ').groupBy(col('SalesPerson')).agg(sum('Amount').alias('TotalAmount')).orderBy(desc('TotalAmount')).limit(3)
- df_sales.filter(col('Region')=='HQ').groupBy(col('TotalAmount')).agg(sum('Amount').alias('TotalAmount')).orderBy(col('TotalAmount')).limit(3)
- df_sales.filter(col('SalesPerson')).groupBy(col('Region')).agg(col('SalesPerson')).orderBy(desc('TotalAmount')).limit(3)
- df_sales.groupBy(col('SalesPerson')).filter(col('Region')=='HQ').agg(sum('Amount')).orderBy(col('TotalAmount')).limit(3)
! Reihenfolge: filtern (Region), gruppieren (SalesPerson), summieren, absteigend sortieren (desc) und auf drei Zeilen begrenzen (limit(3)).
@ DP-203 Frage 207

? Frage 209 (Drag-and-Drop): Synapse-Arbeitsbereich Workspace1 soll Pipeline-Artefakte in Repo1 (Azure DevOps, Branch main) speichern, Entwicklung nur in einem Feature-Branch. Welche vier Aktionen in Synapse Studio in welcher Reihenfolge?
* Code-Repository konfigurieren und Repo1 auswählen; neuen Branch erstellen; Pipeline-Artefakte im neuen Branch erstellen und speichern; Pull Request erstellen, um den neuen Branch in main zusammenzuführen
- Pipeline-Artefakte im Branch main erstellen und speichern; Repository konfigurieren; neuen Branch erstellen; Pull Request erstellen
- Code-Repository konfigurieren; Branch main als Kollaborationszweig festlegen; Artefakte in main speichern; neuen Branch erstellen
- Neuen Branch erstellen; Code-Repository konfigurieren; Artefakte im neuen Branch speichern; main in den neuen Branch mergen
! Zuerst die Git-Integration einrichten, dann im Feature-Branch entwickeln und per Pull Request nach main (Kollaborationszweig) zusammenführen; veröffentlicht wird aus main.
@ DP-203 Frage 209

? Frage 214 (Hotspot): Blob-Konto mit einem Ordner (120.000 Dateien, je 62 Spalten, täglich 1.500 neue Dateien); fünf Spalten aus jeder neuen Datei sollen inkrementell nach Synapse geladen werden (Dauer minimieren). Wie speichern Sie die Dateien?
- In mehreren Blob-Speicherkonten
- In mehreren Containern im Blob-Speicherkonto
* Mit Zeitscheiben-Partitionierung in den Ordnern
- Alle Dateien in einem Ordner
! Zeitscheiben-Ordner (z. B. Jahr/Monat/Tag) erlauben, nur neue Dateien zu lesen.
@ DP-203 Frage 214

? Frage 214 (Hotspot): Welches Format wählen Sie (nur 5 von 62 Spalten werden gelesen)?
* Apache Parquet
- CSV
- JSON
- XML
! Parquet ist spaltenorientiert und liest nur die benötigten Spalten.
@ DP-203 Frage 214

? Frage 215 (Drag-and-Drop): Daten sollen im Batch aus einer Stagingtabelle in die Zieltabelle eines dedizierten SQL-Pools geladen werden; bei einem Fehler müssen alle Einfügungen des Stapels zurückgerollt werden. Wie beginnen Sie die Transaktion?
- BEGIN DISTRIBUTED TRANSACTION
* BEGIN TRAN
- SET RESULT_SET_CACHING ON
- BEGIN CATCH
! BEGIN TRAN startet eine Transaktion; verteilte Transaktionen (BEGIN DISTRIBUTED TRANSACTION) werden in dedizierten Synapse-SQL-Pools nicht unterstützt. Die Quelle zeigt BEGIN DISTRIBUTED TRANSACTION; für Synapse gilt BEGIN TRAN.
@ DP-203 Frage 215

? Frage 215 (Drag-and-Drop): Was führen Sie im CATCH-Block aus (IF @@TRANCOUNT > 0 BEGIN … END)?
- COMMIT TRAN
* ROLLBACK TRAN
- END TRY
- SET RESULT_SET_CACHING ON
! Im Fehlerfall wird die offene Transaktion zurückgerollt, nach dem Block wird ansonsten per COMMIT TRAN abgeschlossen.
@ DP-203 Frage 215

? Frage 216 (Hotspot): Inkrementelles Laden von DB1.Table1 (LastModifiedOn) in Blob Storage mit einem Wasserzeichen (Watermark.WatermarkValue in DB2). Welche Aktivität liest den Wasserzeichenwert?
- Filter
- Get Metadata
* Lookup
- Wait
! Die Lookup-Aktivität liest einen Wert (Wasserzeichen) aus einer Tabelle.
@ DP-203 Frage 216

? Frage 216 (Hotspot): Welche Aktivität führt den Upload durch (wenig Aufwand, steuerbare Anzahl der Datenintegrationseinheiten)?
* Copy data
- Custom
- Data flow
- Stored procedure
! Die Kopieraktivität erlaubt es, die Datenintegrationseinheiten (DIU) direkt festzulegen.
@ DP-203 Frage 216

? Frage 217 (Hotspot): Im serverlosen Synapse-SQL-Pool sollen JSON-Dokumente mit OPENROWSET gelesen werden (WITH (jsondoc nvarchar(max)) AS JsonDocuments). Welches FORMAT verwenden Sie?
* 'CSV'
- 'DELTA'
- 'JSON'
- 'PARQUET'
! JSON-Zeilen werden als Textdatei mit geeigneten Trennzeichen (FIELDTERMINATOR/FIELDQUOTE = 0x0b) gelesen; ein eigenes JSON-Format gibt es in OPENROWSET nicht.
@ DP-203 Frage 217

? Frage 217 (Hotspot): Welcher Wert gehört für FIELDQUOTE (zusammen mit FIELDTERMINATOR = '0x0b')?
- '0x09'
- '0x0a'
* '0x0b'
- '0x0c'
! Die Zeichen 0x0b für Feldtrenner und Anführungszeichen kommen in JSON-Text nicht vor, so wird jede Zeile als eine Spalte gelesen.
@ DP-203 Frage 217

? Frage 219 (Drag-and-Drop): In Workspace1 wurde die Quellcodeverwaltung eingerichtet, ein Branch „Feature“ aus dem Kollaborationszweig erstellt, darin gearbeitet. Von welchem Branch aus erstellen Sie den Pull Request?
- Collaboration
* Feature
- Publish
- main und Feature gleichzeitig
! Der Pull Request wird aus dem Feature-Branch in den Kollaborationszweig gestellt.
@ DP-203 Frage 219

? Frage 219 (Drag-and-Drop): Von welchem Branch aus veröffentlichen Sie die Änderungen in Azure Synapse?
* Collaboration
- Feature
- Ein beliebiger Branch
- adf_publish
! Veröffentlichen ist nur aus dem Kollaborationszweig möglich.
@ DP-203 Frage 219

? Frage 222 (Hotspot): Aus dem Spark-Pool sparkpool1 soll der DataFrame pyspark_df in eine Tabelle von SQLPool1 geschrieben werden (pyspark_df.createOrReplaceTempView(...); ____; val scala_df = spark.sqlContext.sql(…); scala_df.write.____("sqlpool1.dbo.PySparkTable", Constants.INTERNAL)). Was setzen Sie ein?
* %%spark und synapsesql
- %%local und jdbc
- %%sql und saveAsTable
- %%spark und saveAsTable
! Der Scala-Connector für dedizierte SQL-Pools wird über die Magic-Zelle %%spark und die Methode synapsesql aufgerufen (Constants.INTERNAL = interne Tabelle).
@ DP-203 Frage 222
