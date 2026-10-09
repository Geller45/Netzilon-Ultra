---
id: azd-grundlagen
bereich: Azure Data
pruefungen: [DP-203, Schule]
fach: Data Engineering
block: A1
kapitel: Grundlagen
titel: Data Engineering – Datenstrukturen, OLTP vs. OLAP, ACID, Big Data
stufe: Einsteiger
quellen: [03a_Data_Engineering_-_Datentypen_und_Strukturen.pdf, 03b_Data_Engineering_-_OLTP_und_OLAP.pdf]
verweise: [azd-datenformate, azd-data-warehouse, azd-storage, db-transaktionen]
---

## Profi

### Data Engineering
Data Engineers sammeln, transformieren und stellen Daten für Analysen bereit. Sie arbeiten mit **strukturierten, teilstrukturierten und unstrukturierten** Daten, führen **Integration, Transformation und Konsolidierung** durch und nutzen SQL, Python, Scala, R, Java/.NET. Zentrale Konzepte:
- **Operative vs. analytische Daten**: operativ = Transaktionsdaten der Anwendungen, analytisch = für Auswertung/Berichte optimiert.
- **Streaming-Daten**: permanente Echtzeit-Datenfeeds.
- **Data Pipelines**: orchestrierte Aktivitäten zum Übertragen/Transformieren von Daten; implementieren **ETL** (Extract–Transform–Load) oder **ELT** (Extract–Load–Transform).
- **Data Lake**: analytische Daten als Dateien in verteiltem, massiv skalierbarem Speicher.
- **Data Warehouse**: analytische Daten in relationaler Datenbank, meist als **Sternschema**.
- **Apache Spark**: Open-Source-Engine für verteilte Datenverarbeitung.
Azure-Dienste: **Azure Synapse Analytics**, **Azure Data Lake Storage Gen2**, **Azure Stream Analytics**, **Azure Databricks**, **Azure Data Factory**, **Power BI** (Modellierung/Visualisierung).

### Datenstrukturen
| Art | Merkmal | Beispiele |
|---|---|---|
| **Strukturiert** | festes Schema, Zeilen/Spalten, gleiche Felder | relationale Tabellen, CSV |
| **Teilstrukturiert** | Struktur vorhanden, aber nicht relational | JSON, XML, Key-Value-Stores, Graph-Datenbanken |
| **Unstrukturiert** | keine Struktur | Audio, Video, Bilder, Binärdateien |

### OLTP
**Online Transactional Processing**: viele kurze Lese-/Schreibtransaktionen auf **Datensatzebene** (CRUD), relationale Datenbanken, **zeilenorientierte** Speicherung (schnelles Einfügen, ganze Zeile gleichzeitig), **ACID**-fähig; Kennzahl: Transaktionen pro Sekunde, Fokus Datenintegrität.
### OLAP
**Online Analytical Processing**: komplexe Analyseabfragen über sehr große Datenmengen mit mehreren Dimensionen (Region, Quartal, Produkt), **spaltenorientierte** Speicherung – liest nur benötigte Spalten, höhere Kompression (gleicher Typ nebeneinander). Typisch: **OLAP-Cubes**, Data Warehouse, BI.
| | OLTP | OLAP |
|---|---|---|
| Zweck | Tagesgeschäft | Analyse/Reporting |
| Abfragen | kurz, einfach | komplex, aggregierend |
| Speicherung | zeilenorientiert | spaltenorientiert |
| Daten | aktuell, normalisiert | historisch, denormalisiert (Stern) |
| Beispiel | Shop-Bestellungen | Umsatzauswertung |

### ACID
Atomicity, Consistency, Isolation, Durability – siehe Transaktionen. Bei NoSQL oft **BASE** (Basically Available, Soft state, Eventually consistent).

### Big Data
Große Mengen aus unterschiedlichsten Quellen (Streaming-, Aktivitäts-, Kunden-, Produktions- und Verkaufsdaten). Fragen: Welcher Datentyp? Wie schnell verfügbar? Wer greift zu? Analysen? Zentral oder dezentral? (**3 V**: Volume, Velocity, Variety.)

## Einfach

**Daten** gibt es heute überall: Verkaufszahlen, Fotos, Videos, Sensordaten, Chatnachrichten. Ein **Data Engineer** ist wie ein **Wasserwerker für Daten**: Er baut die Leitungen (Pipelines), die Daten sammeln, reinigen und dorthin bringen, wo Analysten sie brauchen.

**Drei Arten von Daten** – denk an deinen Kleiderschrank:
- **Strukturiert** = Socken, ordentlich sortiert in beschrifteten Schubladen (Tabelle mit Spalten).
- **Teilstrukturiert** = ein Karton mit Zetteln, auf jedem steht „Name: …, Alter: …“, aber nicht jeder Zettel hat dieselben Felder (JSON).
- **Unstrukturiert** = ein Haufen loser Sachen: Fotos, Videos, Tonaufnahmen.

**OLTP und OLAP** – zwei Arten von Läden:
- **OLTP** = die **Supermarktkasse**. Ganz viele kleine, schnelle Vorgänge: „Ein Brot kaufen, bezahlen, fertig.“ Wichtig ist, dass nichts schiefgeht (**ACID**). Die Daten stehen **Zeile für Zeile** wie auf einem Kassenbon.
- **OLAP** = die **Chefetage, die den Jahresbericht liest**. Wenige, aber riesige Fragen: „Wie viel Umsatz hatten wir pro Region und Quartal mit Camping-Zubehör?“ Hier ist es klüger, alle Zahlen einer **Spalte** zusammen zu speichern (alle Umsätze nebeneinander) – dann liest man nur diese eine Spalte und nicht den ganzen Kassenbon.

**ETL** heißt: Daten **holen** (Extract), **umbauen** (Transform), **ablegen** (Load). Bei **ELT** legt man erst ab und baut später um.

## Merksatz
- **OLTP = Zeilen, Tagesgeschäft, ACID. OLAP = Spalten, Analyse.**
- **Strukturiert – teilstrukturiert (JSON) – unstrukturiert (Medien).**
- **ETL: Extract – Transform – Load; ELT: erst laden.**
- **Data Lake = Dateien, Data Warehouse = Tabellen im Sternschema.**

## Prüfungsfalle
- JSON, XML, Key-Value, Graph = **teilstrukturiert** (nicht strukturiert!).
- OLAP-Daten sind **spaltenorientiert**, OLTP **zeilenorientiert**.
- ETL ≠ ELT: Bei ELT findet die Transformation im Ziel (Warehouse/Spark) statt.
- Data Warehouse speichert **analytische** Daten, nicht operative.
- Azure Synapse = Analytics-Plattform, Databricks = Spark-basiert, Data Factory = Orchestrierung/Pipelines, Stream Analytics = Echtzeit.

## Grafik
### Datenfluss in Azure
1. Quellen: Anwendungen, Sensoren, Dateien
2. Quellen -> Data Factory: Daten werden per Pipeline erfasst (Ingest)
3. Data Factory -> Data Lake: Rohdaten landen als Dateien
4. Data Lake -> Databricks: Spark bereinigt und transformiert
5. Databricks -> Synapse: Daten werden ins Warehouse geladen
6. Synapse -> Power BI: Modellierung und Visualisierung
### OLTP vs. OLAP
1. OLTP: Kasse bucht eine Zeile (Bestellung 4711)
2. OLTP -> OLAP: nächtlicher ETL-Lauf überträgt Daten
3. OLAP: Analyst fragt Umsatz je Region und Quartal ab

## Lab
### GUI
Maschine: Windows-Client (Browser). Im Azure Portal (portal.azure.com) die Dienste „Synapse Analytics“, „Data Factory“, „Databricks“, „Stream Analytics“ und „Storage accounts“ in der Suche öffnen und die Beschreibung vergleichen. Zuordnen: welche Datenstruktur verarbeitet welcher Dienst?
### PowerShell
```
Connect-AzAccount
Get-AzResourceGroup | Select-Object ResourceGroupName, Location
```

## Übungen
- A: Ordnen Sie zu: Tabelle Kunden, JSON-Dokument, MP4-Video. | L: strukturiert, teilstrukturiert, unstrukturiert.
- A: Eine Shop-Bestellung wird gespeichert – OLTP oder OLAP? Auswertung des Jahresumsatzes nach Region? | L: Bestellung = OLTP (zeilenorientiert, ACID); Auswertung = OLAP (spaltenorientiert).
- A: Warum ist spaltenorientierte Speicherung für Analysen schneller? | L: Es werden nur die benötigten Spalten gelesen; gleichartige Werte komprimieren besser.
- A: Unterschied Data Lake und Data Warehouse? | L: Lake: Dateien, beliebige Strukturen, schema-on-read; Warehouse: relationale Tabellen, Sternschema, schema-on-write.
- A: Was ist der Unterschied ETL und ELT? | L: ETL transformiert vor dem Laden, ELT lädt Rohdaten und transformiert im Zielsystem.

## Karteikarten
- F: Was ist OLTP? | A: Online Transactional Processing – viele kleine Transaktionen auf Datensatzebene, zeilenorientiert, ACID.
- F: Was ist OLAP? | A: Online Analytical Processing – Analyseabfragen über große Datenmengen mit mehreren Dimensionen, spaltenorientiert.
- F: Was ist ein OLAP-Cube? | A: Mehrdimensionale Datenstruktur für Auswertungen (z. B. Region × Quartal × Produkt).
- F: Drei Datenstrukturen? | A: Strukturiert, teilstrukturiert, unstrukturiert.
- F: Beispiele teilstrukturierter Daten? | A: JSON, XML, Key-Value-Speicher, Graph-Datenbanken.
- F: Was ist ETL? | A: Extract, Transform, Load.
- F: Was ist ELT? | A: Extract, Load, Transform – Transformation im Zielsystem.
- F: Was ist ein Data Lake? | A: Verteilter Speicher für analytische Daten als Dateien.
- F: Was ist ein Data Warehouse? | A: Relationale Datenbank für analytische Daten, meist Sternschema.
- F: Was ist Apache Spark? | A: Open-Source-Engine für verteilte Datenverarbeitung.
- F: Welche Azure-Dienste gehören zum Data Engineering? | A: Synapse Analytics, Data Lake Storage Gen2, Stream Analytics, Databricks, Data Factory, Power BI.

## Quiz
? Welche Speicherung ist typisch für OLAP?
* Spaltenorientiert
- Zeilenorientiert
- Graphbasiert
- Dateibasiert ohne Schema

? In welche Kategorie fällt JSON?
* Teilstrukturiert
- Strukturiert
- Unstrukturiert
- Binär

? Wofür steht ACID?
* Atomicity, Consistency, Isolation, Durability
- Availability, Consistency, Integrity, Data
- Access, Control, Identity, Data
- Atomicity, Concurrency, Isolation, Delivery

? Welches System ist typisch für OLTP?
* Online-Shop-Bestellungen
- Jahresumsatz-Cube
- Data Lake
- BI-Dashboard

? Was ist ELT?
* Laden und danach im Ziel transformieren
- Transformieren und dann laden
- Nur extrahieren
- Löschen und laden

? Welcher Azure-Dienst dient der Orchestrierung von Pipelines?
* Azure Data Factory
- Azure Stream Analytics
- Azure Files
- Azure Queue

? Was ist ein Data Warehouse?
* Relationale Datenbank für analytische Daten, meist als Sternschema
- Ein Dateispeicher für Rohdaten
- Ein Streamingdienst
- Ein Backup-Medium

? Was gehört zu unstrukturierten Daten?
* Videodateien
- CSV
- SQL-Tabelle
- JSON

## Lücken
- {OLTP} verarbeitet Transaktionen zeilenweise, {OLAP} beantwortet Analyseabfragen spaltenorientiert.
- ETL steht für Extract, {Transform}, Load.

## Zuordnen
### Dienst und Aufgabe
- Azure Data Factory => Pipelines/Orchestrierung
- Azure Databricks => Spark-Analyse
- Azure Stream Analytics => Echtzeit-Datenströme
- Azure Synapse Analytics => Analytics-Plattform/Warehouse
- Data Lake Storage Gen2 => Speicher für Rohdaten

## Spickzettel
- OLTP: Zeilen, ACID, Tagesgeschäft; OLAP: Spalten, Analyse, Cubes
- strukturiert / teilstrukturiert (JSON) / unstrukturiert
- ETL vs. ELT; Lake (Dateien) vs. Warehouse (Sternschema)
- Dienste: ADF, Databricks, Synapse, Stream Analytics, ADLS Gen2, Power BI
