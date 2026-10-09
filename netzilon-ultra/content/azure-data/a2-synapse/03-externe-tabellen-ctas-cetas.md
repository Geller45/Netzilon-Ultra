---
id: azd-externe-tabellen
bereich: Azure Data
pruefungen: [DP-203]
fach: Data Engineering
block: A2
kapitel: Synapse und Data Warehouse
titel: Externe Tabellen, OPENROWSET, CTAS, CETAS, COPY INTO und Laden eines Data Warehouse
stufe: Profi
quellen: [08_d_Data_Engineering_-_Externe_Tabellen.pdf]
verweise: [azd-synapse, azd-data-warehouse, azd-datenformate, db-dml]
---

## Profi

### Externe Tabellen
Eine **externe Tabelle** ist eine relationale Abstraktion über Dateien in Azure Storage Blob, Data Lake (ADLS Gen2) oder Hadoop. Die Daten bleiben **außerhalb** der Datenbank; in Backup/Restore sind sie nicht enthalten. Daher sind **UPDATE, INSERT, DELETE nicht möglich**, nur Lesen (bzw. Schreiben per CETAS). Vorbereitung im serverlosen Pool:
```
CREATE DATABASE SalesDB COLLATE Latin1_General_100_BIN2_UTF8;
USE SalesDB;
CREATE DATABASE SCOPED CREDENTIAL sqlcred WITH IDENTITY='SHARED ACCESS SIGNATURE', SECRET='sv=xxx...';
CREATE EXTERNAL DATA SOURCE files WITH (LOCATION='https://mydatalake.blob.core.windows.net/data/files/', CREDENTIAL=sqlcred);
CREATE EXTERNAL FILE FORMAT CsvFormat WITH (FORMAT_TYPE=DELIMITEDTEXT, FORMAT_OPTIONS(FIELD_TERMINATOR=',', STRING_DELIMITER='"'));
CREATE EXTERNAL TABLE dbo.products (product_id INT, product_name VARCHAR(20), list_price DECIMAL(5,2))
WITH (DATA_SOURCE=files, LOCATION='products/*.csv', FILE_FORMAT=CsvFormat);
SELECT * FROM dbo.Products;
```
Bausteine: **Database Scoped Credential** (autorisierter Zugriff, z. B. SAS), **External Data Source** (Verbindung zum Speicherort), **External File Format** (Dateityp/Format), **External Table** (Schema + Verweis).

### OPENROWSET (serverloser Pool, ad hoc)
```
SELECT * FROM OPENROWSET(BULK 'https://.../data/files/*.csv', FORMAT='csv', PARSER_VERSION='2.0', HEADER_ROW=TRUE)
WITH (product_id INT, product_name VARCHAR(20), list_price DECIMAL(5,2)) AS rows;
-- JSON: FORMAT='csv', Terminatoren 0x0b, eine NVARCHAR(MAX)-Spalte, dann JSON_VALUE(doc,'$.product_name')
-- Parquet mit Partitionsordnern:
SELECT * FROM OPENROWSET(BULK 'https://.../orders/year=*/month=*/*.*', FORMAT='parquet') AS orders
WHERE orders.filepath(1)='2020' AND orders.filepath(2) IN ('1','2');
```
`filepath(n)` filtert auf Platzhalter-Position (Partition Elimination im Ordnerbaum). Wildcards `*` im Pfad; `WITH` legt Spaltennamen/-typen fest.

### CTAS und CETAS
- `SELECT * INTO` kann Verteilung und Index **nicht** festlegen.
- **CTAS** (`CREATE TABLE AS SELECT`) im dedizierten Pool: neue (interne) Tabelle mit frei wählbarer **DISTRIBUTION**, **Index** und **PARTITION**; zum Kopieren, Umverteilen, Typen ändern, Spalten reduzieren.
```
CREATE TABLE dbo.FactInternetSales_new
WITH (DISTRIBUTION = ROUND_ROBIN, CLUSTERED COLUMNSTORE INDEX,
      PARTITION (OrderDateKey RANGE RIGHT FOR VALUES (20000101,20010101,20020101)))
AS SELECT * FROM dbo.FactInternetSales;
```
- **CETAS** (`CREATE EXTERNAL TABLE AS SELECT`): schreibt das **Abfrageergebnis als Dateien** (z. B. Parquet) in Blob/Data Lake und legt eine externe Tabelle darauf an; im serverlosen Pool zum **Exportieren** von Transformationsergebnissen.
```
CREATE EXTERNAL TABLE SpecialOrders WITH (LOCATION='special_orders/', DATA_SOURCE=files, FILE_FORMAT=ParquetFormat)
AS SELECT OrderID, CustomerName, OrderTotal FROM OPENROWSET(BULK 'sales_orders/*.csv', DATA_SOURCE='files', FORMAT='CSV', PARSER_VERSION='2.0', HEADER_ROW=TRUE) AS source_data
WHERE OrderType='Special Order';
```
| Anweisung | Ergebnis |
|---|---|
| CREATE TABLE | leere Tabelle |
| CREATE EXTERNAL TABLE | Tabellendefinition in der DB, Daten bleiben im Blob/Lake |
| CTAS | neue interne Tabelle aus SELECT |
| CETAS | neue externe Tabelle (Dateien im Lake) aus SELECT |

### Laden eines Data Warehouse
1. Dateien im Data Lake ablegen (Staging).
2. **Staging-Tabelle** laden – entweder per **externer Tabelle** (liest direkt aus Dateien, **PolyBase**) oder (Best Practice, schnellste Ladeleistung) per **`COPY INTO dbo.StageProduct FROM 'https://…/*.parquet' WITH (FILE_TYPE='PARQUET', MAXERRORS=0)`**. Staging: ROUND_ROBIN, Heap.
3. **Dimensionstabellen** per CTAS (DISTRIBUTION=REPLICATE, CCI) aus Staging befüllen; Surrogatschlüssel z. B. `ROW_NUMBER() OVER(ORDER BY ProdID)` (kein IDENTITY-Zwang in CTAS).
4. **Faktentabellen** per CTAS (HASH) mit Lookups auf Dimensionen-Surrogatschlüssel.
5. Statistiken aktualisieren, Staging aufräumen.

## Einfach

Stell dir vor, deine Daten liegen als **Papierstapel in einem Lagerhaus** (der Data Lake: CSV-, JSON-, Parquet-Dateien). Du willst sie mit SQL abfragen, aber nicht erst alles abtippen.

- **Externe Tabelle** = ein **Schaufenster/Fenster zum Lagerhaus**. Die Daten bleiben im Lager, aber du kannst sie durch das Fenster ansehen wie eine normale Tabelle. Verändern (UPDATE/DELETE) kannst du sie durch das Fenster nicht – du schaust nur.
- Für das Fenster brauchst du **drei Dinge**: einen **Schlüssel** zum Lager (Credential), die **Adresse** des Lagers (Data Source) und die **Beschreibung**, wie die Zettel aussehen (File Format: „Spalten mit Komma getrennt“).
- **OPENROWSET** = ein **kurzer Blick** durch die Tür ohne Fenster einzubauen („Zeig mir mal schnell, was in den CSV-Dateien steht“).

Zwei Kopierwerkzeuge:
- **CTAS** („Create Table As Select“) = **Kopieren mit Umbau**: Du kopierst eine Tabelle in eine neue und bestimmst dabei, **wie sie verteilt wird** (Hash/Replicate/Round Robin) und welchen Index sie bekommt. Ideal fürs Aufräumen und Neuordnen.
- **CETAS** = **Ergebnis ins Lagerhaus zurückschreiben**: Das Ergebnis deiner Abfrage wird als neue Dateien im Data Lake abgelegt, und du bekommst gleich ein Fenster dazu.

**Daten ins Warehouse laden** wie beim Umzug: erst alles in **Kartons** (Staging-Tabelle) per **COPY INTO** (am schnellsten), dann einsortieren in die **Schränke** (Dimensionen und Fakten) per CTAS.

## Merksatz
- **Externe Tabelle = nur lesen, Daten bleiben im Lake.**
- **Credential – Data Source – File Format – External Table.**
- **CTAS = interne Tabelle mit Verteilung/Index; CETAS = Dateien im Lake.**
- **COPY INTO = schnellstes Laden.**
- **filepath() filtert Partitionen im Ordnerpfad.**

## Prüfungsfalle
- Auf externen Tabellen sind **INSERT/UPDATE/DELETE nicht erlaubt**; auch kein Backup der Daten durch die DB.
- `SELECT … INTO` erlaubt keine Verteilung/Indexwahl – dafür CTAS.
- CETAS **exportiert** (schreibt Dateien), CTAS **importiert/kopiert** in die Datenbank.
- Im Staging: ROUND_ROBIN + Heap, nicht HASH.
- Für JSON mit OPENROWSET: FORMAT='csv' mit Terminator 0x0b und JSON_VALUE.
- Serverlose Pool-Datenbank braucht UTF-8-Collation (Latin1_General_100_BIN2_UTF8) für beste Parquet/CSV-Leistung.

## Grafik
### Externe Tabelle
1. Analyst -> Serverloser SQL-Pool: SELECT * FROM dbo.products
2. Serverloser SQL-Pool: prüft Credential und External Data Source
3. Serverloser SQL-Pool -> Data Lake: liest products/*.csv laut File Format
4. Data Lake -> Serverloser SQL-Pool: Zeilen
5. Serverloser SQL-Pool -> Analyst: Ergebnis wie aus einer Tabelle
### Laden ins Warehouse
1. Data Lake: Parquet-Dateien im Staging-Ordner
2. Data Lake -> Staging-Tabelle: COPY INTO (Round Robin, Heap)
3. Staging-Tabelle -> DimProduct: CTAS (REPLICATE, CCI)
4. Staging-Tabelle -> FactSales: CTAS (HASH)

## Lab
### SQL
Maschine: Windows-Client (Synapse Studio), serverloser SQL-Pool.
```
SELECT TOP 10 * FROM OPENROWSET(BULK 'https://<konto>.dfs.core.windows.net/data/files/*.csv', FORMAT='csv', PARSER_VERSION='2.0', HEADER_ROW=TRUE) AS r;
COPY INTO dbo.StageProduct FROM 'https://<konto>.dfs.core.windows.net/data/products/*.parquet' WITH (FILE_TYPE='PARQUET', MAXERRORS=0);
```

## Befehle
- `CREATE EXTERNAL DATA SOURCE / FILE FORMAT / TABLE` – externe Tabelle aufbauen
- `OPENROWSET(BULK …)` – Datei ad hoc abfragen
- `CREATE TABLE … AS SELECT` – CTAS
- `CREATE EXTERNAL TABLE … AS SELECT` – CETAS
- `COPY INTO tabelle FROM 'url'` – Massenladen
- `filepath(n)` – Platzhalter im Pfad auswerten

## Übungen
- A: Sie müssen das Ergebnis einer Transformation als Parquet im Data Lake ablegen. Welche Anweisung? | L: CETAS (CREATE EXTERNAL TABLE AS SELECT) im serverlosen Pool.
- A: Sie möchten eine bestehende Faktentabelle mit anderer Verteilung (HASH) neu anlegen. | L: CTAS mit WITH (DISTRIBUTION = HASH(spalte), CLUSTERED COLUMNSTORE INDEX).
- A: Welche Methode lädt Staging-Daten mit bester Leistung? | L: COPY INTO.
- A: Warum kann man externe Tabellen nicht mit UPDATE ändern? | L: Daten liegen außerhalb der Datenbank in Dateien (kein Zeilenspeicher der DB).
- A: Welche Objekte sind für eine externe Tabelle nötig? | L: Scoped Credential, External Data Source, External File Format, External Table.

## Karteikarten
- F: Was ist eine externe Tabelle? | A: Relationale Sicht auf Dateien im Blob/Data Lake; Daten bleiben extern, nur lesbar.
- F: Was ist CTAS? | A: CREATE TABLE AS SELECT – neue Tabelle mit wählbarer Verteilung/Index/Partition.
- F: Was ist CETAS? | A: CREATE EXTERNAL TABLE AS SELECT – Ergebnis als Dateien in den Lake schreiben + externe Tabelle.
- F: Wozu OPENROWSET? | A: Ad-hoc-Abfrage von Dateien (CSV, JSON, Parquet) ohne Tabellendefinition.
- F: Was macht COPY INTO? | A: Lädt Dateien performant in eine Tabelle (Best Practice für Staging).
- F: Was ist ein External File Format? | A: Definiert Dateityp (DELIMITEDTEXT, PARQUET) und Optionen.
- F: Was ist ein Database Scoped Credential? | A: Gespeicherte Zugriffsdaten (z. B. SAS) für externen Speicher.
- F: Was bewirkt filepath()? | A: Filtert Dateien nach Platzhalter-Position im Pfad (Partitionen).
- F: Verteilung der Staging-Tabelle? | A: ROUND_ROBIN (Heap).
- F: Warum CTAS statt SELECT INTO? | A: CTAS erlaubt Verteilung, Index und Partitionierung.

## Quiz
? Welche Anweisung schreibt Abfrageergebnisse als Dateien in den Data Lake?
* CETAS
- CTAS
- INSERT INTO
- BULK INSERT

? Was ist mit externen Tabellen nicht möglich?
* UPDATE und DELETE
- SELECT
- Abfrage von Parquet
- Verwendung von Wildcards

? Welche Methode lädt Staging-Daten am schnellsten?
* COPY INTO
- INSERT … VALUES
- Zeilenweises Einfügen
- SELECT INTO

? Was erlaubt CTAS, aber nicht SELECT INTO?
* Verteilung und Indexart festlegen
- Daten kopieren
- Spalten auswählen
- WHERE verwenden

? Welches Objekt definiert den Dateityp einer externen Tabelle?
* External File Format
- External Data Source
- Credential
- View

? Wozu dient OPENROWSET?
* Ad-hoc-Abfrage von Dateien
- Löschen von Dateien
- Erstellen von Pools
- Verschlüsseln von Daten

? Welche Verteilung hat eine Staging-Tabelle idealerweise?
* ROUND_ROBIN
- HASH
- REPLICATE
- PARTITION

? Welche Bausteine braucht man für eine externe Tabelle?
* Credential, Data Source, File Format, Tabelle
- Nur Tabelle
- Nur Credential
- Trigger und Index

## Lücken
- Mit {CTAS} erstellt man intern eine Tabelle, mit {CETAS} schreibt man Ergebnisse als Dateien in den Lake.
- Daten werden am schnellsten per {COPY INTO} in die Staging-Tabelle geladen.

## Reihenfolge
### Externe Tabelle anlegen
1. Database Scoped Credential
2. External Data Source
3. External File Format
4. External Table

## Spickzettel
- Externe Tabelle: Credential → Data Source → File Format → Table; nur lesen
- OPENROWSET ad hoc; filepath() für Partitionen
- CTAS (intern, Verteilung/Index), CETAS (Dateien im Lake)
- COPY INTO für Staging; Dimensionen per CTAS
