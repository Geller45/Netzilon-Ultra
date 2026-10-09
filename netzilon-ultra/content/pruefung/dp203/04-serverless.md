---
id: pr-dp203-serverless
bereich: Prüfung
block: DP-203
kapitel: DP-203 Azure Data Engineer – Prüfungsfragen
titel: DP-203 – Serverloser SQL-Pool, externe Tabellen, PolyBase, OPENROWSET
stufe: Profi
typ: fragen
pruefungen: [DP-203]
fach: SQL / Admin
quellen: [DE_A_ohne_D_1_bis_370.pdf, T1_-_1_bis_40_-_Lösung_und_Kommentare.pdf, T1_-_41_bis_80_-_Lösung_und_Kommentare.pdf, T1_-_81_bis_120_-_Lösung_und_Kommentare.pdf, T1_-_121_bis_140_-_Lösung_und_Kommentare.pdf, T2_-_141_bis_160_-_Lösung_und_Kommentare.pdf, T2_-_161_bis_180_-_Lösung_und_Kommentare.pdf, T2_-_181_bis_200_-_Lösung_und_Kommentare.pdf, T2_-_201_bis_240_-_Lösung_und_Kommentare.pdf, T2_-_241_bis_280_-_Lösung_und_Kommentare.pdf, 1_bis_40.pdf, 41_bis_80.pdf, 81_bis_120.pdf, 121_bis_160.pdf, 161_bis_200.pdf, 201_bis_240.pdf, 241_bis_280.pdf, 281_bis_320.pdf, 320_bis_370.pdf, 02d_Data_Engineering_-_SQL_Beispiele_und_Prüfungsfragen.pdf, 03d_Data_Engineering_-_Prüfungsfragen.pdf]
verweise: []
---

## Quiz

? In ADLS Gen2 liegen `/topfolder/File1.csv`, `/topfolder/folder1/File2.csv`, `/topfolder/folder2/File3.csv` und `/topfolder/File4.csv`. Sie erstellen eine externe Tabelle ExtTable mit `LOCATION='/topfolder/'` und fragen sie über einen serverlosen Synapse-SQL-Pool ab. Welche Dateien werden zurückgegeben?
- nur File2.csv und File3.csv
* nur File1.csv und File4.csv
- File1.csv, File2.csv, File3.csv und File4.csv
- nur File1.csv
! Externe Tabellen im serverlosen SQL-Pool lesen Unterordner NICHT rekursiv, solange der Pfad nicht mit `/**` endet → nur File1 und File4. Die Sammlung nennt C, die Community (73 %) und die Microsoft-Doku (CREATE EXTERNAL TABLE: „serverless SQL pool … doesn't return subfolders unless /** is specified“) stützen B.
@ DP-203 Frage 4

? In einem Synapse-Data-Warehouse haben Sie mit PolyBase die externe Tabelle `[Ext].[Items]` (3 Spalten) über Parquet-Dateien in ADLS Gen2 angelegt. Die Dateien enthalten zusätzlich die Spalte ItemID. Wie fügen Sie ItemID der externen Tabelle hinzu?
- `ALTER EXTERNAL TABLE [Ext].[Items] ADD [ItemID] int;`
- `DROP EXTERNAL FILE FORMAT parquetfile1;` und `CREATE EXTERNAL FILE FORMAT parquetfile1 WITH (FORMAT_TYPE = PARQUET, DATA_COMPRESSION = 'org.apache.hadoop.io.compress.SnappyCodec');`
* `DROP EXTERNAL TABLE [Ext].[Items]` und anschließend `CREATE EXTERNAL TABLE [Ext].[Items] ([ItemID] int NULL, [ItemName] nvarchar(50) NULL, [ItemType] nvarchar(20) NULL, [ItemDescription] nvarchar(250)) WITH (LOCATION='/Items/', DATA_SOURCE = AzureDataLakeStore, FILE_FORMAT = PARQUET, REJECT_TYPE = VALUE, REJECT_VALUE = 0);`
- `ALTER TABLE [Ext].[Items] ADD [ItemID] int;`
! Externe Tabellen kennen kein ALTER; erlaubt sind nur CREATE/DROP TABLE, CREATE/DROP STATISTICS und CREATE/DROP VIEW. Also löschen und mit der neuen Spalte neu anlegen.
@ DP-203 Frage 15

? Ein serverloser SQL-Pool führt aus: `SELECT payment_type, SUM(fare_amount) AS fare_total FROM OPENROWSET(BULK 'csv/busfare/tripdata_2020*.csv', DATA_SOURCE = 'BusData', FORMAT = 'CSV', PARSER_VERSION = '2.0', FIRSTROW = 2) WITH (payment_type INT 10, fare_amount FLOAT 11) AS nyc GROUP BY payment_type ORDER BY payment_type;` Was enthalten die Ergebnisse?
- nur CSV-Dateien im Unterordner tripdata_2020
- alle Dateien, deren Name mit „tripdata_2020“ beginnt
- alle CSV-Dateien, deren Name „tripdata_2020“ enthält
* nur CSV-Dateien, deren Name mit „tripdata_2020“ beginnt
! Das Platzhaltermuster `tripdata_2020*.csv` im Ordner csv/busfare passt auf Dateien, die mit tripdata_2020 beginnen und auf .csv enden.
@ DP-203 Frage 46

? Serverloser SQL-Pool, native externe Tabelle dbo.Table1, Datenquelle `CREATE EXTERNAL DATA SOURCE Datalake WITH (LOCATION = 'https://mydatalake.dfs.core.windows.net/container1/folder1/**', CREDENTIAL = DatalakeCred)`. Laut Abbildung liegt mydata2.csv unterhalb von folder1, mydata3.csv außerhalb, _mydata4.csv unterhalb (Unterstrich-Präfix). Welche Aussage trifft beim Auswählen aller Zeilen zu?
* Daten aus mydata2.csv werden zurückgegeben.
- Daten aus mydata3.csv werden zurückgegeben.
- Daten aus _mydata4.csv werden zurückgegeben.
- Daten aus allen drei Dateien werden zurückgegeben.
! Laut Lösung: Ja / Nein / Nein. `/**` liest rekursiv alle Unterordner von folder1; Dateien, deren Name mit `_` oder `.` beginnt, gelten als versteckt und werden ignoriert. (Ordnerabbildung fehlt in der Quelle.)
@ DP-203 Frage 68

? Im serverlosen SQL-Pool von workspace1 soll eine externe Tabelle auf CSV-Dateien in account1 (ADLS Gen2) verweisen – bei maximaler Leistung. Wie konfigurieren Sie sie?
* native externe Tabelle, Authentifizierung per Shared Access Signature (SAS)
- native externe Tabelle, Authentifizierung per Speicherkontoschlüssel
- Hadoop-externe Tabelle, Authentifizierung per SAS
- Hadoop-externe Tabelle, Authentifizierung per Dienstprinzipal in Microsoft Entra ID
! Serverlose Pools unterstützen nur native externe Tabellen (schneller als Hadoop/PolyBase); als Credential sind SAS, Managed Identity oder Entra-Passthrough möglich – ein Speicherkontoschlüssel nicht.
@ DP-203 Frage 74

? storage1 enthält öffentlich zugängliche TSV-Dateien ohne Kopfzeile; WS1 hat einen serverlosen SQL-Pool. Die Dateien sollen ad hoc mit OPENROWSET gelesen werden, dabei sollen Namen vergeben und die abgeleiteten Datentypen jeder Spalte überschrieben werden. Was nehmen Sie in OPENROWSET auf?
* die WITH-Klausel
- die Bulk-Option ROWSET_OPTIONS
- die Bulk-Option DATAFILETYPE
- den Parameter DATA_SOURCE
! Mit `WITH (Spalte1 Typ 1, Spalte2 Typ 2 …)` legt man Spaltennamen, Typen und Ordinalpositionen explizit fest. DATA_SOURCE bestimmt nur den Speicherort. Die Sammlung nennt D, die Community (74 %) A.
@ DP-203 Frage 77

? storage1 enthält öffentlich zugängliche JSON-Dateien, WS1 einen serverlosen SQL-Pool. Mit OPENROWSET soll jedes Rowset genau einen JSON-Datensatz enthalten. Auf welchen Wert setzen Sie die FORMAT-Option?
- JSON
- DELTA
- PARQUET
* CSV
! JSON-Dateien werden im serverlosen Pool mit `FORMAT = 'CSV'` und `FIELDTERMINATOR = '0x0b'`, `FIELDQUOTE = '0x0b'` gelesen – jede Zeile (ein JSON-Dokument) wird eine Spalte, die man mit JSON_VALUE/OPENJSON auswertet. Ein Format „JSON“ gibt es in OPENROWSET nicht. Die Sammlung nennt A, die Community (98 %) D.
@ DP-203 Frage 86

? ws1 hat einen serverlosen SQL-Pool, das Cosmos-DB-Konto Cosmos1 enthält container1. Die Daten in container1 sollen mit dem serverlosen SQL-Pool abgefragt werden. Welche DREI Aktionen führen Sie aus?
* Azure Synapse Link für Cosmos1 aktivieren
- den Analysespeicher für container1 deaktivieren
* in ws1 einen verknüpften Dienst auf Cosmos1 erstellen
* den Analysespeicher (Analytical Store) für container1 aktivieren
- die Indizierung für container1 deaktivieren
! Synapse Link + Analytical Store stellen eine spaltenbasierte Kopie bereit, die per verknüpftem Dienst/OPENROWSET aus Synapse abgefragt wird, ohne die Transaktionslast zu stören.
@ DP-203 Frage 90

? container1 (storage1, hierarchischer Namespace) enthält im Ordner Webdata/Monthly die Dateien _monthly.csv und Monthly.csv sowie .testdata.csv und testdata.csv. Pool1 (dediziert): `CREATE EXTERNAL DATA SOURCE Ds1 WITH (LOCATION = 'abfss://container1@storage1.dfs.core.windows.net', CREDENTIAL = credential1, TYPE = HADOOP)`. Serverlos: `CREATE EXTERNAL DATA SOURCE Ds2 WITH (LOCATION = 'https://storage1.blob.core.windows.net/container1/Webdata/', CREDENTIAL = credential2)`. Welche Aussage trifft zu?
- Eine externe Tabelle über Ds1 kann _monthly.csv lesen.
* Eine externe Tabelle über Ds1 kann Monthly.csv lesen.
- Eine externe Tabelle über Ds2 kann .testdata.csv lesen.
- Keine der Aussagen trifft zu.
! Lösung: Nein / Ja / Nein. Dateien, deren Name mit `_` oder `.` beginnt, gelten als versteckt und werden von externen Tabellen nicht gelesen.
@ DP-203 Frage 91

? Im serverlosen SQL-Pool läuft: `CREATE EXTERNAL TABLE Orders WITH (LOCATION = 'orders/', DATA_SOURCE = sales, FILE_FORMAT = SalesOrders) AS SELECT OrderID, CustomerName, OrderTotal FROM OPENROWSET(BULK 'sales_orders/*.csv', DATA_SOURCE = 'sales', FORMAT = 'CSV', PARSER_VERSION = '2.0', HEADER_ROW = TRUE) AS source_data WHERE OrderType = 'Customer Order';` Wo werden die zurückgegebenen Zeilen gespeichert?
* in einer Datei in einem Data Lake
- in einer relationalen Datenbank
- in einer globalen temporären Tabelle
- in einer temporären Sitzungstabelle
! CETAS (CREATE EXTERNAL TABLE AS SELECT) schreibt das Abfrageergebnis als Dateien in den Speicherort LOCATION der Datenquelle; die Datenbank enthält nur die Metadaten.
@ DP-203 Frage 102

? Ressourcen: Synapse-Arbeitsbereich workspace1, Azure-SQL-Server sql1 mit der Datenbank SQLDb1. Es soll Azure Synapse Link für Azure SQL Database implementiert werden. Welche ZWEI Aktionen führen Sie auf sql1 aus?
* Firewallregeln so anpassen, dass Azure-Dienste auf sql1 zugreifen dürfen
* Die systemseitig zugewiesene verwaltete Identität aktivieren
- der verwalteten Identität von workspace1 per IAM die Rolle „Mitwirkender“ zuweisen
- Transparent Data Encryption (TDE) deaktivieren
! Voraussetzungen für Synapse Link für Azure SQL: System-Managed-Identity am logischen Server und Zugriff für Azure-Dienste in der Server-Firewall.
@ DP-203 Frage 112

? Für eine Cosmos-DB-Datenbank mit Synapse Link ist für den Analysespeicher das Schema mit voller Genauigkeit (Full Fidelity) konfiguriert. Eingefügt werden `{"customerID": 12, "customer": "Tailspin Toys"}` und danach `{"customerID": "14", "customer": "Contoso"}`. Wie viele Spalten enthält der Analysespeicher?
- 1
- 2
* 3
- 4
! Full Fidelity speichert jede Eigenschaft je Datentyp in einer eigenen Spalte: customerID.int32, customerID.string und customer.string = 3. (Beim „Well-defined“-Schema wären es 2 – die Sammlung nennt B; laut Microsoft-Doku zum Full-Fidelity-Schema ist C korrekt.)
@ DP-203 Frage 113

? Serverloser Pool Pool1 und ADLS-Gen2-Konto storage1 (AllowBlobPublicAccess deaktiviert). Eine externe Datenquelle soll Azure-AD-Benutzern Zugriff auf storage1 aus Pool1 ermöglichen. Was erstellen Sie zuerst?
- einen externen Ressourcenpool
- eine externe Bibliothek
* datenbankweit gültige Anmeldeinformationen (Database Scoped Credential)
- eine Remotedienstbindung
! Die externe Datenquelle verweist auf eine Credential (z. B. Managed Identity oder SAS), über die auf den Speicher zugegriffen wird.
@ DP-203 Frage 197

? storage1 enthält eine CSV-Datei, die nur per Kontoschlüssel erreichbar ist. Ein dedizierter SQL-Pool soll sie über eine externe Tabelle lesen; dafür wird eine externe Datenquelle benötigt. Was erstellen Sie zuerst?
- eine Datenbankrolle
* datenbankweit gültige Anmeldeinformationen (Database Scoped Credential)
- eine Datenbanksicht
- ein externes Dateiformat
! Die externe Datenquelle verweist per CREDENTIAL auf die Anmeldeinformation mit dem Speicherschlüssel – diese muss vorher existieren (und davor ein Master Key).
@ DP-203 Frage 286

## Reihenfolge

### DP-203 Frage 41 (Drag & Drop): Benutzer sollen bestimmte Dateien in ADLS Gen2 über einen serverlosen SQL-Pool abfragen können. Reihenfolge der drei Aktionen?
1. Externe Datenquelle erstellen (CREATE EXTERNAL DATA SOURCE)
2. Externes Dateiformat erstellen (CREATE EXTERNAL FILE FORMAT)
3. Externe Tabelle erstellen (CREATE EXTERNAL TABLE)

### DP-203 Frage 44 (Drag & Drop): Tausende CSV-Dateien mit Kopfzeile in ADLS Gen2 sollen täglich per PolyBase in einen dedizierten SQL-Pool geladen werden; die Kopfzeile ist zu überspringen. Welche drei Datenbankobjekte bereiten Sie VOR dem Lademuster in dieser Reihenfolge vor? (Sammlung: Datenquelle → Dateiformat → CETAS; Community: wie unten)
1. Datenbankweit gültige Anmeldeinformationen (Database Scoped Credential) mit Azure-AD-Anwendung und Dienstprinzipalschlüssel erstellen
2. Externe Datenquelle mit abfs-Speicherort erstellen
3. Externes Dateiformat erstellen und die Option FIRST_ROW setzen

### DP-203 Frage 109 (Drag & Drop): Cosmos-DB-Container Container1 (Analysespeicher an, TTL 3600) – Analysespeicher-Unterstützung entfernen, Auswirkungen auf Apps und Speichernutzung minimieren. Reihenfolge der vier Aktionen?
1. Neuen Container Container2 erstellen und den Inhalt von Container1 nach Container2 kopieren
2. Container1 löschen
3. Erneut einen Container namens Container1 erstellen (ohne Analysespeicher) und den Inhalt von Container2 dorthin kopieren
4. Container2 löschen

### DP-203 Frage 160 (Drag & Drop): Ihr Konto hat Mitwirkender-Rechte auf ein ADLS-Gen2-Konto, Anwendungs-ID und Zugriffsschlüssel liegen vor. PolyBase soll das Synapse-Data-Warehouse mit dem Speicherkonto verbinden. Welche drei Komponenten erstellen Sie nacheinander? (Sammlung: asymmetrischer Schlüssel → Credential → Datenquelle; benötigt wird aber ein Datenbank-HAUPTschlüssel, der symmetrisch ist – Community-Lösung unten)
1. Datenbankweit gültige Anmeldeinformationen (Database Scoped Credential)
2. Externe Datenquelle (External Data Source)
3. Externes Dateiformat (External File Format)

### DP-203 Frage 238 (Drag & Drop): Mit dem serverlosen SQL-Pool soll aus Vertriebsdaten in account1 ein Balkendiagramm „Umsatz je Produkt“ entstehen – mit minimalem Aufwand. Reihenfolge aller Aktionen?
1. SQL-Skript in Synapse Studio erstellen
2. SELECT-Anweisung hinzufügen, die Umsatz je Produkt liefert
3. Skript ausführen
4. Zur Diagrammansicht (Chart) wechseln
5. Diagrammeinstellungen anpassen

## Zuordnen

### DP-203 Frage 53 (Hotspot): Serverloser SQL-Pool, Parquet-Dateien mit id, address_housenumber, address_line, applicant1_name, applicant2_name. Eine Tabelle nur mit den Adressfeldern soll entstehen: `[1] applications WITH (LOCATION='applications/', DATA_SOURCE=applications_ds, FILE_FORMAT=applications_file_format) AS SELECT id, address_housenumber, address_line FROM [2](BULK 'https://contoso1.dfs.core.windows.net/applications/year=*/*.parquet', FORMAT='PARQUET') AS [r]`
- [1] => CREATE EXTERNAL TABLE (CETAS)
- [2] => OPENROWSET

### DP-203 Frage 54 (Hotspot): In Pool1 (dedizierter SQL-Pool) soll eine externe Datenquelle für das ADLS-Gen2-Konto account1 entstehen: `CREATE EXTERNAL DATA SOURCE source1 WITH (LOCATION = 'https://account1.[1].core.windows.net', [2])`
- [1] Endpunkt => dfs (ADLS-Gen2-Endpunkt; die Sammlung nennt „blob“, die Community „dfs“)
- [2] Option => TYPE = HADOOP

### DP-203 Frage 83 (Drag & Drop): Serverloser SQL-Pool, öffentlicher Container container1 in adls1 – die obersten 100 Zeilen aller CSV-Dateien in folder1 abfragen: `SELECT TOP 100 * FROM [1]( [2] 'https://adls1.dfs.core.windows.net/container1/folder1/*.csv', FORMAT = 'CSV') AS rows`
- [1] => OPENROWSET
- [2] => BULK

### DP-203 Frage 96 (Hotspot): Serverloser SQL-Pool, Parquet-Datei mit 10 Spalten – nur zwei Spalten zurückgeben: `SELECT * FROM OPENROWSET([1] N'https://myaccount.dfs.core.windows.net/mycontainer/mysubfolder/data.parquet', FORMAT = 'PARQUET') [2] (Col1 int, Col2 varchar(20)) AS rows`
- [1] => BULK
- [2] => WITH

### DP-203 Frage 114 (Hotspot): CSV-Auftragsdaten sind partitioniert als /data/salesorders/year=xxxx/month=y; nur Aufträge von Januar und Februar 2023 sollen per OPENROWSET (BULK '…/salesorders/**') gelesen werden. `WHERE [1] AND [2]`
- [1] => so.filepath(1) = '2023'
- [2] => so.filepath(2) IN ('1', '2')

### DP-203 Frage 123 (Drag & Drop): Serverloser SQL-Pool in WS1 soll verschachtelte JSON-Dateien (context.data, context.session, context.custom.dimensions[].customerInfo) lesen: `SELECT * FROM [1](BULK 'https://contoso.blob.core.windows.net/contosodw', FORMAT='CSV', FIELDTERMINATOR='0x0b', FIELDQUOTE='0x0b', ROWTERMINATOR='0x0b') WITH (…, contextcustomdimensions varchar(max) '$.context.custom.dimensions') AS q CROSS APPLY [2](contextcustomdimensions) WITH (ProfileType …, RoomName …, CustomerName …, UserName …)`
- [1] => OPENROWSET
- [2] => OPENJSON

### DP-203 Frage 194 (Hotspot): Externe Datenquelle in Pool1 (dediziert) zum Lesen von .orc-Dateien in storage1 (ADLS, sichere Übertragung erforderlich): `CREATE EXTERNAL DATA SOURCE AzureDataLakeStore WITH (LOCATION = '[1]://data@newyorktaxidataset.dfs.core.windows.net', CREDENTIAL = ADLS_credential, TYPE = [2])`
- [1] Protokoll => abfss (TLS-gesichert)
- [2] Typ => HADOOP

### DP-203 Frage 217 (Hotspot): Serverloser SQL-Pool soll JSON-Dokumente aus einer Datei lesen: `SELECT * FROM OPENROWSET(BULK 'https://sourcedatalake.blob.core.windows.net/public/docs.json', FORMAT = [1], FIELDTERMINATOR = '0x0b', FIELDQUOTE = [2], ROWTERMINATOR = '0x0b') WITH (jsondoc nvarchar(max)) AS JsonDocuments`
- [1] => 'CSV'
- [2] => '0x0b'

### DP-203 Frage 241 (Hotspot): ADLS enthält stündliche CSV-Dateien vom 1.1.2020 bis 31.1.2023, partitioniert nach csv/system1/{Jahr}/{Monat}/…. Der serverlose SQL-Pool soll die Zeilenanzahl jeder Datei der letzten drei Monate 2022 liefern: `SELECT r.filepath() AS filepath, COUNT_BIG(*) AS [rows] FROM OPENROWSET(BULK [1], DATA_SOURCE='MyDataLake', FORMAT='CSV', PARSER_VERSION='2.0', FIRSTROW=2) WITH (vendor_id INT) AS [r] WHERE [2] IN ('10','11','12') GROUP BY r.filepath()` (Ordnerabbildung fehlt in der Quelle)
- [1] BULK-Pfad => 'csv/system1/2022/*/*.csv'
- [2] Filter => r.filepath(1)
