---
id: pr-dp203-nachtrag-3
bereich: Prüfung
block: DP-203
kapitel: DP-203 Azure Data Engineer – Prüfungsfragen
titel: DP-203 – Nachtrag 3
stufe: Profi
typ: fragen
pruefungen: [DP-203]
fach: SQL / Admin
quellen: [DE_A_ohne_D_1_bis_370.pdf, T1_-_1_bis_40_-_Lösung_und_Kommentare.pdf, T1_-_41_bis_80_-_Lösung_und_Kommentare.pdf, T1_-_81_bis_120_-_Lösung_und_Kommentare.pdf, T1_-_121_bis_140_-_Lösung_und_Kommentare.pdf, T2_-_141_bis_160_-_Lösung_und_Kommentare.pdf, T2_-_161_bis_180_-_Lösung_und_Kommentare.pdf, T2_-_181_bis_200_-_Lösung_und_Kommentare.pdf, T2_-_201_bis_240_-_Lösung_und_Kommentare.pdf, T2_-_241_bis_280_-_Lösung_und_Kommentare.pdf, 1_bis_40.pdf, 41_bis_80.pdf, 81_bis_120.pdf, 121_bis_160.pdf, 161_bis_200.pdf, 201_bis_240.pdf, 241_bis_280.pdf, 281_bis_320.pdf, 320_bis_370.pdf]
verweise: []
---

## Quiz

? Frage 58 (Hotspot): Neues ADLS-Gen2-Konto: höchstmögliche Datenresilienz; Inhalte müssen für Schreibvorgänge verfügbar bleiben, wenn ein primäres Rechenzentrum ausfällt. Welcher Replikationsmechanismus wird empfohlen?
- Änderungsfeed (Change feed)
* Zonenredundanter Speicher (ZRS)
- Georedundanter Speicher mit Lesezugriff (RA-GRS)
- Geo-zonenredundanter Speicher mit Lesezugriff (RA-GZRS)
! Laut Quelle genügt ZRS: Daten werden synchron über mehrere Verfügbarkeitszonen repliziert, Schreibzugriffe laufen bei Ausfall eines Rechenzentrums (einer Zone) weiter. (Die geografischen Varianten benötigen für Schreibzugriffe nach einem Regionsausfall ein Failover.)
@ DP-203 Frage 58

? Frage 58 (Hotspot): Wer löst im Katastrophenfall (Regionsausfall) bei georedundantem Speicher das Failover standardmäßig aus?
* Microsoft (Failover durch Microsoft)
- Der Kunde manuell
- Ein Azure-Automation-Auftrag automatisch
- Azure Monitor automatisch
! In der Quellenlösung wird „Failover initiated by Microsoft“ gewählt; ein vom Kunden initiiertes Failover (Customer-managed failover) ist eine zusätzliche Option, kein Automatismus über Automation-Aufträge.
@ DP-203 Frage 58

? Frage 60 (Drag-and-Drop): Pool1 (dedizierter SQL-Pool) enthält Common.Date (7.300 Zeilen, jährlich neue Zeilen), Marketing.WebSessions (1,5 Mrd. Zeilen, stündliche Inserts/Updates) und Staging.WebSessions (300.000 Zeilen, stündlich geleert und neu befüllt). Ladeleistung in Staging maximieren, Berichtsabfragen minimieren. Welche Verteilungen?
* Common.Date: Replicated; Marketing.WebSessions: Hash; Staging.WebSessions: Round-robin
- Common.Date: Round-robin; Marketing.WebSessions: Hash; Staging.WebSessions: Replicated
- Common.Date: Hash; Marketing.WebSessions: Replicated; Staging.WebSessions: Round-robin
- Common.Date: Replicated; Marketing.WebSessions: Round-robin; Staging.WebSessions: Hash
! Kleine Dimension: replizieren; große Faktentabelle: Hash; Staging: Round-robin (schnellstes Laden).
@ DP-203 Frage 60

? Frage 61 (Hotspot): FactInternetSales (100 Mio. Zeilen, Spalten SalesAmount und OrderQuantity) wird für ein bestimmtes Produkt aus dem letzten Jahr aggregiert. Datengröße und Abfragezeit minimieren. Welchen Index wählen Sie?
* CLUSTERED COLUMNSTORE INDEX
- CLUSTERED INDEX ([OrderDateKey])
- HEAP
- INDEX on [ProductKey]
! Gruppierte Columnstore-Indizes komprimieren stark und beschleunigen Aggregationen auf großen Faktentabellen.
@ DP-203 Frage 61

? Frage 61 (Hotspot): Welche Verteilung wählen Sie für FactInternetSales (Abfragen nach einem bestimmten Produkt)?
- Hash([OrderDateKey])
* Hash([ProductKey])
- REPLICATE
- ROUND ROBIN
! Hash-Verteilung auf die gefilterte/gejointe Spalte ProductKey verteilt die Zeilen gleichmäßig und vermeidet Datenverschiebung.
@ DP-203 Frage 61

? Frage 73 (Hotspot): Dedizierter Synapse-SQL-Pool: Tabelle Country (195 Zeilen), Tabelle Sales (100 Mio. Zeilen); Abfrage: Gesamtumsatz nach Land und Kunde der letzten 30 Tage. Abfrageleistung maximieren. Wie legen Sie Country an?
- DISTRIBUTION = HASH([CountryCode])
- DISTRIBUTION = HASH([CountryId])
* DISTRIBUTION = REPLICATE
- DISTRIBUTION = ROUND_ROBIN
! Kleine Dimensionstabellen werden repliziert.
@ DP-203 Frage 73

? Frage 73 (Hotspot): Wie verteilen Sie die Tabelle Sales (100 Mio. Zeilen, Abfrage nach Land und Kunde)?
* DISTRIBUTION = HASH([CustomerId]) mit CLUSTERED COLUMNSTORE INDEX
- DISTRIBUTION = HASH([OrderDate])
- DISTRIBUTION = REPLICATE
- DISTRIBUTION = ROUND_ROBIN
! Hash auf CustomerId (hohe Kardinalität, in der Abfrage genutzt); auf das Datum zu hashen würde zu Datenschiefe bei den letzten 30 Tagen führen.
@ DP-203 Frage 73

? Frage 75 (Hotspot): Serverloser Synapse-SQL-Pool, Datenmodell mit FactOrders, DimCustomer, DimGeography, DimStore, Date, Product, ProductLine. Wie wandeln Sie das Snowflake-Modell in ein Sternschema um?
* DimGeography und DimCustomer verbinden (Join)
- DimGeography und FactOrders verbinden (Join)
- DimGeography und DimCustomer vereinigen (Union)
- DimGeography und FactOrders vereinigen (Union)
! In einem Sternschema werden Dimensionen denormalisiert: Die Geografie wird in die Kundendimension hineingejoint (Join, nicht Union).
@ DP-203 Frage 75

? Frage 80 (Hotspot): Data-Lake-Entwicklungsumgebung auf ADLS Gen2: Lese-/Schreibzugriff muss bei Ausfall einer Verfügbarkeitszone erhalten bleiben; Daten, die seit zwei Jahren nicht geändert wurden, sollen automatisch gelöscht werden; Kosten minimieren. Welche Redundanz wählen Sie?
- Geo-zonenredundanter Speicher (GZRS)
- Lokal redundanter Speicher (LRS)
* Zonenredundanter Speicher (ZRS)
- Georedundanter Speicher (GRS)
! ZRS übersteht den Ausfall einer Zone und ist günstiger als GZRS; LRS bietet keinen Schutz vor Zonenausfall.
@ DP-203 Frage 80

? Frage 80 (Hotspot): Womit löschen Sie automatisch Daten, die seit mehr als zwei Jahren nicht geändert wurden?
* Eine Lebenszyklusverwaltungsrichtlinie (Lifecycle Management Policy)
- Vorläufiges Löschen (Soft Delete)
- Versionsverwaltung (Versioning)
- Eine unveränderliche Speicherrichtlinie
! Lifecycle-Regeln (daysAfterModificationGreaterThan) löschen Blobs automatisch.
@ DP-203 Frage 80

? Frage 81 (Hotspot): HR-Daten werden nach der Erstverarbeitung sieben Jahre aufbewahrt und selten abgerufen; Kosten minimieren. Welche Speicherrichtlinie?
* Archivspeicher nach einem Tag und Löschen nach 2.555 Tagen
- Archivspeicher nach 2.555 Tagen
- Kühler Speicher nach 180 Tagen und Löschen nach 2.555 Tagen
- Löschen nach 180 Tagen
! Selten genutzte, aufzubewahrende Daten kommen sofort ins Archiv; nach 7 Jahren (2.555 Tage) werden sie gelöscht.
@ DP-203 Frage 81

? Frage 81 (Hotspot): Betriebsdaten werden in den ersten sechs Monaten häufig und danach einmal pro Monat genutzt. Welche Speicherrichtlinie?
- Archivspeicher nach einem Tag und Löschen nach 2.555 Tagen
- Kühler Speicher nach einem Tag
* Kühler Speicher nach 180 Tagen
- Löschen nach 180 Tagen
! Hot für die ersten ca. 180 Tage, danach Cool (monatlicher Zugriff, Sofortzugriff nötig).
@ DP-203 Frage 81

? Frage 82 (Hotspot): Ein Zuordnungsdatenfluss (Mapping Data Flow) lädt Kundendaten per SCD Typ 1 nach DimCustomer. Welche Transformation verwenden Sie, um einen Upsert in die Tabelle auszuführen?
* Alter row
- Assert
- Cast
- Aggregate
! Mit „Alter row“ legen Sie Zeilenrichtlinien (insert/update/upsert/delete) für die Senke fest.
@ DP-203 Frage 82

? Frage 82 (Hotspot): Welche Transformation verwenden Sie, um zu erkennen, ob sich die Daten eines Kunden in DimCustomer geändert haben?
- Aggregate
- Derived column
* Surrogate key
- Cast
! Laut Quelle wird die Surrogatschlüssel-Transformation für die Erkennung/Zuordnung bestehender Kunden genutzt (Hinweis: In der Praxis wird der Vergleich oft zusätzlich mit einer Derived-Column-Hash-Spalte umgesetzt).
@ DP-203 Frage 82

? Frage 83 (Drag-and-Drop): Serverloser Synapse-SQL-Pool: Die obersten 100 Zeilen aller CSV-Dateien in folder1 des öffentlichen Containers container1 (adls1) sollen abgefragt werden. SELECT TOP 100 * FROM ____ (____ 'https://adls1.dfs.core.windows.net/container1/folder1/*.csv', FORMAT = 'CSV') AS rows. Welche beiden Schlüsselwörter fehlen?
* OPENROWSET und BULK
- OPENQUERY und LOCATION
- OPENROWSET und DATASOURCE
- OPENROWSET und LOCATION
! OPENROWSET(BULK '<URL>', FORMAT = 'CSV') liest Dateien direkt aus dem Data Lake.
@ DP-203 Frage 83

? Frage 88 (Drag-and-Drop): Eine SCD „Product“ mit ProductName, ProductColor, ProductSize: Änderungen an ProductName verhindern; bei ProductSize nur aktuellen und letzten Wert behalten; bei ProductColor alle aktuellen und früheren Werte behalten. Welche SCD-Typen?
* ProductName: Typ 0; ProductColor: Typ 2; ProductSize: Typ 3
- ProductName: Typ 1; ProductColor: Typ 2; ProductSize: Typ 3
- ProductName: Typ 0; ProductColor: Typ 3; ProductSize: Typ 2
- ProductName: Typ 3; ProductColor: Typ 1; ProductSize: Typ 0
! Typ 0 = nie ändern, Typ 1 = überschreiben, Typ 2 = neue Zeile mit voller Historie, Typ 3 = zusätzliche Spalte für den Vorgängerwert (aktuell und letzter).
@ DP-203 Frage 88

? Frage 89 (Hotspot): Batches werden vor dem Laden in Faktentabellen in Stagingtabellen eines dedizierten SQL-Pools bereitgestellt (so schnell wie möglich). Welche Tabellenverteilung und -struktur?
* Verteilung ROUND_ROBIN, Struktur Heap
- Verteilung HASH, Struktur Clustered Index
- Verteilung REPLICATE, Struktur Columnstore-Index
- Verteilung HASH, Struktur Columnstore-Index
! Stagingtabellen: Round-Robin + Heap lädt am schnellsten.
@ DP-203 Frage 89

? Frage 92 (Drag-and-Drop): In ADLS Gen2 (account1) soll User1 alle Dateien in container1/folder1 auflisten und lesen können (Prinzip der geringsten Rechte). Welche Berechtigungen setzen Sie auf container1/ und container1/folder1?
* container1/: Execute; container1/folder1: Read and Execute
- container1/: Read; container1/folder1: Read and Execute
- container1/: Read and Execute; container1/folder1: Read and Write
- container1/: None; container1/folder1: Read
! Zum Durchlaufen übergeordneter Ordner genügt Execute (x); zum Auflisten und Lesen im Zielordner sind Read und Execute nötig.
@ DP-203 Frage 92

? Frage 96 (Hotspot): Eine Parquet-Datei mit 10 Spalten wird im serverlosen Synapse-SQL-Pool per SELECT * FROM OPENROWSET(____ 'https://…/data.parquet', FORMAT = 'PARQUET') ____ AS rows abgefragt; es sollen nur zwei Spalten zurückgegeben werden. Was setzen Sie ein?
* BULK und WITH (Col1 int, Col2 varchar(20))
- DELTA und WITH (Col1 int, Col2 varchar(20))
- OPENQUERY und PARSER_VERSION = '2.0'
- SINGLE_BLOB und FILEPATH(2)
! BULK nennt den Dateipfad; die WITH-Klausel beschränkt das Ergebnis auf die benannten Spalten (Schemaangabe).
@ DP-203 Frage 96

? Frage 101 (Hotspot): Tabelle1 (Fakten, dedizierter Pool) erhält monatlich 65 Mio. Zeilen; am Monatsende müssen Daten älter als 36 Monate entfernt werden (Dauer minimieren). Wie partitionieren Sie?
- Nach Datum mit einer Partition pro Tag
* Nach Datum mit einer Partition pro Monat
- Nach Produkt
- Gar nicht partitionieren
! Eine Partition pro Monat passt zur monatlichen Entfernung und hält die Partitionen groß genug für gute Columnstore-Komprimierung (ca. 65 Mio. Zeilen).
@ DP-203 Frage 101

? Frage 101 (Hotspot): Wie entfernen Sie die alten Daten am schnellsten?
- Per DELETE mit WHERE-Klausel
- Per DELETE mit JOIN
* Die älteste Partition in eine andere Tabelle (Table2) umschalten und Table2 löschen
- Die älteste Partition abschneiden
! Partition Switching ist ein Metadatenvorgang und daher sehr schnell.
@ DP-203 Frage 101

? Frage 108 (Hotspot): In Databricks sollen Zeilen eines DataFrames zu einer vorhandenen Delta-Tabelle hinzugefügt werden: new_rows_df.write.____.save(delta_table_path). Was setzen Sie ein?
* format("delta").mode("append")
- format("delta").mode("overwrite")
- format("parquet").mode("append")
- format("csv").mode("error")
! Format delta und der Modus append fügen Zeilen hinzu, ohne vorhandene zu überschreiben.
@ DP-203 Frage 108

? Frage 109 (Drag-and-Drop): Cosmos DB for NoSQL: Container1 hat Analysespeicher „Ein“ und TTL 3600. Die Unterstützung für den Analysespeicher soll entfernt werden (geringe Auswirkung auf Apps, Speicher minimieren). Welche vier Aktionen in welcher Reihenfolge?
* Container2 erstellen und Inhalt von Container1 kopieren; Container1 löschen; neuen Container1 (ohne Analysespeicher) erstellen und Inhalt von Container2 kopieren; Container2 löschen
- TTL von Container1 auf 0 setzen; Container2 erstellen und kopieren; Container1 löschen; Container2 löschen
- TTL von Container1 auf null setzen; neuen Container1 erstellen; Container2 löschen; Container1 löschen
- Container1 löschen; Container2 erstellen; Inhalt kopieren; Container2 löschen
! Der Analysespeicher kann bei einem bestehenden Container nicht deaktiviert werden. Daher: Daten in Hilfscontainer sichern, Original löschen, mit gleichem Namen ohne Analysespeicher neu erstellen, Daten zurückkopieren, Hilfscontainer löschen.
@ DP-203 Frage 109
