---
id: azd-databricks
bereich: Azure Data
pruefungen: [DP-203, Schule]
fach: Data Engineering
block: A2
kapitel: Spark und Databricks
titel: Azure Databricks – Apache Spark, Cluster, Notebooks, Delta Lake, Pipelines
stufe: Fortgeschritten
quellen: [10_Data_Engineering_-_Databricks.pdf]
verweise: [azd-synapse, azd-datenformate, azd-grundlagen, azd-storage]
---

## Profi

### Apache Spark
Datenanalyse-Framework für **Big Data**, **In-Memory-Verarbeitung**, bis zu ca. 100-mal schneller als Hadoop MapReduce (auch auf Platte ~10-mal), verteilte parallele Verarbeitung in **Clustern** (Driver + Worker), integrierte Module (Spark SQL, **MLlib**, **Structured Streaming**, GraphX). Daten werden in Partitionen geteilt und parallel verarbeitet. In Synapse gibt es **Spark-Pools**, die Konzepte entsprechen Databricks.

### Azure Databricks
Vollständig verwaltete, cloudbasierte **Analyseplattform auf Apache-Spark-Basis**, Azure-Ressource (Tarife **Standard, Premium, Trial**), webbasierter Workspace, native Integration mit **Microsoft Entra ID** und Azure-Diensten (Data Lake, Synapse, Data Factory, Power BI).
Teilbereiche:
1. **Databricks Data Science & Engineering** – Batch/Streaming-Ingest, Notebooks, ETL.
2. **Databricks Machine Learning** – Modelltraining (SparkML u. a.).
3. **Databricks SQL** – SQL-Abfragen auf dem Lake, Dashboards; **nur Premium**.
Konzepte: **Cluster** (VMs), **DBFS** (Databricks File System, verteilter Speicher), **Notebooks**, **Metastore** (Tabellen über Dateien), **Delta Lake** (ACID, Versionierung/Time Travel, Upserts auf dem Data Lake), **SQL Warehouses** (relationale Endpunkte).

### Cluster
| Clustermodus | Eigenschaft |
|---|---|
| **Standard** | Einzelbenutzer, Sprachen Python, SQL, Scala, R |
| **High Concurrency (HC)** | viele Benutzer gleichzeitig, Zugriffssteuerung, SQL/Python/R, **kein Scala** |
| **Single Node** | nur Driver, für ML/kleine Analysen |
Typen nach Verwendung: **Universal-/All-Purpose-Cluster** (interaktiv in Notebooks) und **Job-/Auftragscluster** (automatisierte Batch-Aufträge, Cluster entsteht für den Job und wird danach beendet – kostengünstiger). Standard- und Single-Node-Cluster werden nach **120 Minuten Inaktivität** automatisch beendet, bei HC muss man den Timeout selbst setzen. **Pools** (Instance Pools) halten Leerlauf-VMs bereit und **beschleunigen Clusterstart**. **Autoscaling** (Min/Max Worker) spart Kosten, kann aber nach Leerlauf kurz verlangsamen. Kosten = Anzahl und Größe der VMs + DBUs.

### Notebooks
Zellen mit Code/Text/Visualisierung; Sprachen **Python, Scala, SQL, R, Java**; Sprachwechsel pro Zelle mit **Magic Command** `%python`, `%sql`, `%scala`, `%md`.
```
df = spark.read.load('/data/products.csv', format='csv', header=True)
display(df.limit(10))
df.createOrReplaceTempView("products")
%sql SELECT Category, COUNT(ProductID) AS ProductCount FROM products GROUP BY Category ORDER BY Category
```
Visualisierung mit Built-in-Charts oder matplotlib.

### Pipelines mit Data Factory / Synapse
Notebook-Aktivität in einer Pipeline: **Zugriffstoken** (Personal Access Token) im Workspace erzeugen, in ADF einen **Linked Service** für Databricks anlegen, Aktivität mit Notebook-Pfad, Parametern, Timeout und Retries konfigurieren. Parameter im Notebook: `dbutils.widgets.text("folder","data")`, `dbutils.widgets.get("folder")`, Rückgabe `dbutils.notebook.exit(path)`.

### Structured Streaming – Ausgabemodi
Datenstrom wird wie eine unbegrenzt wachsende Tabelle behandelt. **Append** (nur neue Zeilen seit letztem Trigger), **Complete** (gesamte Ergebnistabelle), **Update** (nur geänderte Zeilen). Neue Daten alle 5 Minuten an eine bestehende Tabelle anfügen → **Append**.

## Einfach

**Spark** ist wie ein **riesiges Küchenteam**: Statt dass ein einzelner Koch 1 Million Kartoffeln schält, bekommen **100 Köche** (Computer) je 10.000 Kartoffeln und arbeiten **gleichzeitig**. Spark merkt sich dabei vieles im **Arbeitsspeicher** statt auf der Festplatte – darum ist es so schnell.

**Azure Databricks** ist die **fertig eingerichtete Großküche** in der Cloud: Du musst keine Herde und Kühlhäuser selbst bauen, Microsoft und Databricks stellen sie hin. Du schreibst nur deine **Rezepte** in **Notebooks** – das sind wie digitale **Notizbücher mit Code-Kästchen**, in denen du Python, SQL, Scala oder R mischen kannst. Wechsel zwischen den Sprachen mit `%sql` oder `%python` am Zeilenanfang.

Die **Köche** heißen **Cluster** (mehrere virtuelle Computer):
- **Standard-Cluster** = für dich allein.
- **High-Concurrency-Cluster** = für viele Leute gleichzeitig, aber **kein Scala**.
- **Single Node** = ein einzelner Koch.
- **Job-Cluster** = ein Koch, der **nur für ein bestimmtes Gericht eingestellt wird** (Batch-Auftrag) und danach nach Hause geht – spart Geld.
- **Pool** = Köche, die schon **im Umkleideraum warten**, damit der Start schneller geht.
- **Autoscaling** = automatisch mehr Köche rufen, wenn viel los ist, und weniger, wenn nichts zu tun ist.

**Delta Lake** ist ein **Aufbewahrungsregal mit Protokollbuch**: Es merkt sich jede Änderung, so dass man zurückblättern und sogar Daten sicher aktualisieren kann.

Und **Data Factory** ist die **Einsatzleiterin**, die sagt: „Starte um 2 Uhr nachts das Notebook ‚Daten bereinigen‘ und gib ihm den Ordnernamen mit.“

## Merksatz
- **Spark = In-Memory, verteilt, parallel.**
- **HC-Cluster: mehrere Nutzer, kein Scala. Job-Cluster: Batch, billig.**
- **Pool = schneller Clusterstart, Autoscaling = Kosten sparen.**
- **Databricks SQL = nur Premium.**
- **Streaming in bestehende Tabelle = Append.**

## Prüfungsfalle
- High-Concurrency-Cluster unterstützen **Scala nicht** (SQL, Python, R ja).
- Job-Cluster = automatisierte Batch-Aufträge; All-Purpose = interaktiv.
- Cluster-**Pool** beschleunigt den Start (nicht die Abfrage selbst).
- Autoscaling kann nach Leerlauf kurz verlangsamen (Hochskalieren).
- Standard-/Single-Node-Cluster stoppen nach 120 Minuten Inaktivität automatisch, HC nicht.
- Sprache pro Zelle wechselt man mit `%`-Magic, nicht durch neues Notebook.
- Databricks ist nicht Synapse: beide Spark, Databricks eigene Plattform, Synapse integrierter Dienst.

## Grafik
### Notebook in der Pipeline
1. Data Factory -> Databricks: Notebook-Aktivität über Linked Service (Access Token)
2. Databricks: startet Job-Cluster
3. Databricks -> Data Lake: liest Rohdaten (CSV)
4. Databricks: Spark transformiert (bereinigen, aggregieren)
5. Databricks -> Data Lake: schreibt Delta/Parquet
6. Databricks -> Data Factory: dbutils.notebook.exit(path)
### Cluster
1. Driver: verteilt Aufgaben
2. Driver -> Worker 1: Partition 1
3. Driver -> Worker 2: Partition 2
4. Worker 1 -> Driver: Teilergebnis
5. Worker 2 -> Driver: Teilergebnis

## Lab
### GUI
Maschine: Windows-Client (Azure Portal). Ressource „Azure Databricks“ anlegen (Standard oder Trial) > Workspace starten > Compute > Create compute (Single Node, Auto-Terminierung 30 min) > Workspace > Notebook anlegen, Cluster anhängen > Zelle ausführen. Danach Ressourcengruppe löschen.
### SQL
```
%python
df = spark.range(1000000)
print(df.count())
%sql
SELECT 1 AS test
```

## Befehle
- `spark.read.load(pfad, format='csv', header=True)` – Datei lesen
- `df.createOrReplaceTempView("t")` – DataFrame als SQL-Sicht
- `display(df)` – Tabelle/Chart im Notebook
- `dbutils.widgets.text("p","default")` / `dbutils.widgets.get("p")` – Parameter
- `dbutils.notebook.exit(wert)` – Rückgabewert
- `%sql`, `%python`, `%scala`, `%md` – Magic Commands

## Übungen
- A: Mehrere Datenanalysten arbeiten mit Python und SQL gleichzeitig – welcher Clustertyp? | L: High-Concurrency-Cluster.
- A: Ein Scala-Entwickler braucht ein Cluster – HC oder Standard? | L: Standard (HC unterstützt Scala nicht).
- A: Ein nächtlicher Batch-Auftrag soll kostengünstig laufen. | L: Job-/Auftragscluster (Pipeline mit Notebook-Aktivität).
- A: Wie beschleunigen Sie den Start von Clustern? | L: Instance Pool im Workspace anlegen (Leerlauf-VMs).
- A: Alle 5 Minuten fallen neue Daten an, die an eine bestehende Tabelle angefügt werden sollen. Ausgabemodus? | L: Append.
- A: Wie wechselt man in einem Notebook in SQL? | L: Magic Command %sql am Zellenanfang.

## Karteikarten
- F: Was ist Apache Spark? | A: Verteiltes In-Memory-Framework für Big-Data-Verarbeitung.
- F: Was ist Azure Databricks? | A: Verwaltete Analyseplattform auf Spark-Basis in Azure.
- F: Drei Databricks-Teilbereiche? | A: Data Science & Engineering, Machine Learning, SQL.
- F: Was ist Delta Lake? | A: Speicherschicht mit ACID, Versionierung und Upserts auf dem Data Lake.
- F: Was ist DBFS? | A: Databricks File System – verteilter Speicher über Data Lake/Blob.
- F: Welche Clustermodi gibt es? | A: Standard, High Concurrency, Single Node.
- F: Was unterstützt HC nicht? | A: Scala.
- F: Wofür ein Pool? | A: Schnellerer Clusterstart durch vorgehaltene Leerlauf-VMs.
- F: Wofür Job-Cluster? | A: Automatisierte Batch-Aufträge, Cluster nur für die Laufzeit.
- F: Nach wie vielen Minuten werden Standard-Cluster automatisch beendet? | A: Nach 120 Minuten Inaktivität.
- F: Wie wird die Sprache pro Zelle gewählt? | A: Magic Command (%python, %sql, %scala, %r).
- F: Wie bindet Data Factory Databricks an? | A: Linked Service mit Zugriffstoken, Notebook-Aktivität in der Pipeline.

## Quiz
? Welcher Clustertyp unterstützt kein Scala?
* High Concurrency
- Standard
- Single Node
- Job

? Was beschleunigt den Start eines Clusters?
* Ein Pool
- Autoscaling
- Mehr Worker
- Delta Lake

? Welcher Streaming-Ausgabemodus fügt nur neue Zeilen an?
* Append
- Complete
- Update all
- Overwrite

? Welche Edition ist für Databricks SQL nötig?
* Premium
- Standard
- Trial nicht möglich
- Alle

? Wie ruft man einen Parameter im Notebook ab?
* dbutils.widgets.get
- spark.param
- notebook.get
- widgets.exit

? Wofür steht Autoscaling?
* Dynamische Anpassung der Workerzahl an die Last
- Automatisches Backup
- Automatische Verschlüsselung
- Automatisches Löschen des Notebooks

? Welcher Cluster eignet sich für automatisierte Batch-Verarbeitung?
* Auftragscluster (Job)
- Universalcluster
- Single Node für jeden
- Kein Cluster

? Was ist Delta Lake?
* Speicherschicht mit ACID-Transaktionen auf dem Data Lake
- Eine Programmiersprache
- Ein Cluster-Typ
- Ein Monitoring-Tool

## Lücken
- Mit {%sql} wechselt man in einer Python-Notebook-Zelle zu SQL.
- Ein {Pool} beschleunigt das Starten von Clustern.

## Zuordnen
### Cluster und Eigenschaft
- Standard => Einzelbenutzer, inkl. Scala
- High Concurrency => viele Nutzer, kein Scala
- Single Node => nur Driver
- Job-Cluster => Batch, nur für die Laufzeit

## Spickzettel
- Spark: In-Memory, parallel, verteilt
- Cluster: Standard / High Concurrency (kein Scala) / Single Node; Job vs. All-Purpose
- Pool = schneller Start; Autoscaling = Kosten
- Magic: %python %sql %scala; dbutils.widgets
- Streaming: Append / Complete / Update
