---
id: azd-datenformate
bereich: Azure Data
pruefungen: [DP-203]
fach: Data Engineering
block: A1
kapitel: Grundlagen
titel: Datenformate – CSV, JSON, Avro, Parquet, ORC, Schema Evolution
stufe: Fortgeschritten
quellen: [03c_Data_Engineering_-_Datenformate.pdf]
verweise: [azd-grundlagen, azd-databricks, azd-externe-tabellen]
---

## Profi

### Überblick
Die Formatwahl hängt vom Einsatzzweck ab (BI, Netzwerkkommunikation, Web, Batch/Stream). Faustregel: **CSV** einfach und verbreitet; **JSON** (und XML) Webkommunikation; **Avro** (und Protocol Buffers) Streaming/Serialisierung; **Parquet** und **ORC** spaltenorientierte Formate für Analysen.

### Text vs. Binär
Textformate (CSV, JSON, XML) sind lesbar und mit Editor änderbar, aber größer; Binärformate (Avro, Parquet, ORC) brauchen Tool/Bibliothek, bieten aber bessere Leistung und Speicherersparnis (Zeichenfolge „1234“ = 4 Byte, binäre Zahl = 2 Byte). **Skalartypen** (Zahl, Bool, String, Null) vs. **komplexe Typen** (Array, Objekt). Typdeklaration erlaubt, Zahl von String bzw. NULL von „null“ zu unterscheiden.

### Avro
Apache-Hadoop-Projekt; **zeilenbasiert**; Serialisierungssystem (RPC); **Schema im JSON-Format im Header**, Daten binär in Blöcken. Vorteile: kompakt, schnell, teilbar, komprimierbar, **Schema Evolution**, gut für Streaming/Batch (Kafka, Spark), Austauschformat. Nachteil: nicht menschenlesbar, nicht in allen Sprachen integriert.

### Parquet
Open Source (Twitter + Cloudera), **spaltenorientiert**, binär, Spaltenmetadaten am Dateiende (Schreiben in einem Durchgang), **Write Once Read Many**. Vorteile: teilbar, hohe Kompression, sehr effizient für OLAP, Schemaentwicklung, Spark/Impala/Drill. Nachteil: nicht lesbar, Updates schwierig (Datei neu erstellen), nur Batch.

### ORC (Optimized Row Columnar)
Hortonworks + Facebook, **spaltenorientiert**, Daten in **Stripes** (Streifen, Standard 250 MB) mit Footer und Postscript; hoch komprimierbar (bis ca. 75 %), ideal für Hive, nur Batch. Nachteile: kein Anfügen ohne Neuerstellung, keine Schemaentwicklung, Impala unterstützt ORC nicht.

| Format | Orientierung | Schema | Lesbar | Typischer Einsatz |
|---|---|---|---|---|
| CSV | Zeile | nein | ja | Austausch |
| JSON | Dokument | lose | ja | Web/APIs |
| Avro | Zeile | im Header (JSON) | nein | Streaming, Kafka |
| Parquet | Spalte | in Metadaten | nein | Analyse, Spark |
| ORC | Spalte | im Footer | nein | Hive, Analyse |

### Schema-Eigenschaften
**Schemaerzwingung** (Gültigkeit, Typ, Format; mit den Daten oder separat) und **Schema Evolution** (Schema ändern, Abwärtskompatibilität zu alten Daten). Archive/Logs sind meist unveränderlich.

## Einfach

Dateiformate sind wie **verschiedene Verpackungen** für dieselben Daten:

- **CSV** = ein **Zettel mit Kommas** dazwischen. Jeder kann ihn lesen, aber er weiß nicht, ob „5“ eine Zahl oder ein Text ist. Wie eine handgeschriebene Einkaufsliste.
- **JSON** = ein **Zettel mit Etiketten**: `{"name": "Anna", "alter": 12}`. Die Webseiten reden so miteinander.
- **Avro** = ein **Päckchen mit Beipackzettel**. Vorne steht beschrieben, was drin ist (das Schema), dahinter die Daten, platzsparend verpackt. Ideal für Datenströme (Streaming).
- **Parquet** und **ORC** = **Schubladenschränke nach Spalten**. Statt jede Karteikarte komplett abzulegen, packst du alle „Alter“-Werte in eine Schublade, alle „Namen“ in eine andere. Wer nur das Durchschnittsalter wissen will, öffnet **nur eine Schublade**. Das ist superschnell für Analysen und spart Platz, weil in einer Schublade ähnliche Dinge liegen (leicht zu komprimieren). Nachteil: Etwas nachträglich ändern ist mühsam.

**Text vs. Binär:** Textformate kann ein Mensch mit dem Editor lesen, Binärformate nur Programme – dafür sind sie kleiner und schneller.

**Schema Evolution** heißt: „Das Formular darf sich ändern (neue Spalte), und alte Daten bleiben trotzdem lesbar.“

Merke dir: **Zeilenweise = schnell schreiben/streamen (Avro). Spaltenweise = schnell auswerten (Parquet, ORC).**

## Merksatz
- **Avro = Zeile + Streaming + Schema im Header.**
- **Parquet/ORC = Spalte + Analyse + WORM.**
- **Parquet für Spark, ORC für Hive.**
- **CSV/JSON = Text, Avro/Parquet/ORC = Binär.**

## Prüfungsfalle
- Avro ist **zeilenorientiert**, Parquet und ORC **spaltenorientiert**.
- Parquet/ORC sind für **Batch/OLAP**, nicht für häufige Einzel-Updates.
- Das Avro-Schema ist **JSON**, die Daten sind binär.
- ORC unterstützt (laut Unterlage) keine Schemaentwicklung, Parquet und Avro schon.
- JSON ist teilstrukturiert, CSV strukturiert ohne Typinformation.

## Grafik
### Zeilen- vs. Spaltenspeicherung
1. Tabelle: Name, Alter, Ort mit 3 Zeilen
2. Zeilenformat (Avro): Zeile 1 komplett, Zeile 2 komplett, Zeile 3 komplett
3. Spaltenformat (Parquet): alle Namen, dann alle Alter, dann alle Orte
4. Abfrage -> Spaltenformat: AVG(Alter) liest nur die Alter-Spalte
5. Spaltenformat -> Abfrage: Ergebnis mit minimalem Lesevorgang

## Lab
### GUI
Maschine: Windows-Client mit Python. Vergleich der Dateigrößen: CSV, JSON, Parquet derselben Tabelle.
### PowerShell
```
pip install pandas pyarrow
python -c "import pandas as pd; df=pd.DataFrame({'a':range(100000),'b':['x']*100000}); df.to_csv('t.csv'); df.to_json('t.json'); df.to_parquet('t.parquet')"
Get-ChildItem t.* | Select-Object Name, Length
```

## Übungen
- A: Welches Format für Kafka-Streaming und warum? | L: Avro – zeilenorientiert, kompakt, Schema im Header, unterstützt Schema Evolution.
- A: Welches Format für schnelle Spark-Analysen über Terabytes? | L: Parquet (spaltenorientiert, komprimiert, WORM).
- A: Nennen Sie Vor- und Nachteile von Textformaten. | L: Vorteil: menschenlesbar, einfach; Nachteil: größer, langsamer, keine Typen.
- A: Was bedeutet Schema Evolution? | L: Das Schema darf sich ändern, bei Abwärtskompatibilität zu alten Daten.

## Karteikarten
- F: Zeilen- oder spaltenorientiert: Avro? | A: Zeilenorientiert.
- F: Zeilen- oder spaltenorientiert: Parquet/ORC? | A: Spaltenorientiert.
- F: Wo steht das Avro-Schema? | A: Im Header der Datei, im JSON-Format.
- F: Wofür steht ORC? | A: Optimized Row Columnar.
- F: Was bedeutet WORM bei Parquet? | A: Write Once, Read Many.
- F: Nachteile von Parquet? | A: Nicht lesbar, Updates schwierig, nur Batch.
- F: Was sind Stripes in ORC? | A: Streifen (Standard 250 MB) mit Zeilengruppen, Footer und Postscript.
- F: Welches Format für Webkommunikation? | A: JSON.
- F: Was ist Schemaerzwingung? | A: Schema garantiert gültige Daten (Typ und Format).
- F: Skalar- vs. komplexe Typen? | A: Skalar: einzelner Wert; komplex: Array/Objekt.

## Quiz
? Welches Format ist zeilenbasiert und speichert sein Schema als JSON im Header?
* Avro
- Parquet
- ORC
- CSV

? Welches Format wird typischerweise mit Spark für Analysen eingesetzt?
* Parquet
- XML
- Avro
- TXT

? Wofür eignet sich ORC besonders?
* Hive / Batch-Analyse
- Streaming-Serialisierung
- Webkommunikation
- Texteditor-Bearbeitung

? Was ist ein Nachteil von Parquet?
* Updates sind schwierig
- Nicht komprimierbar
- Nicht teilbar
- Keine Spaltenorientierung

? Was bedeutet Schema Evolution?
* Schemaänderung bei Abwärtskompatibilität
- Löschen des Schemas
- Verschlüsselung des Schemas
- Schema nur lesbar

? Welches Format ist ein Textformat?
* JSON
- Avro
- Parquet
- ORC

? Warum sind Spaltenformate gut komprimierbar?
* Gleichartige Werte stehen nebeneinander
- Sie speichern weniger Daten
- Sie sind textbasiert
- Sie haben kein Schema

? Welches Format ist für Streaming (z. B. Kafka) privilegiert?
* Avro
- ORC
- CSV
- XLSX

## Lücken
- {Parquet} und {ORC} sind spaltenorientiert, {Avro} ist zeilenorientiert.

## Zuordnen
### Format und Merkmal
- Avro => Schema im JSON-Header, Streaming
- Parquet => spaltenorientiert, Spark
- ORC => Stripes, Hive
- JSON => Web, lesbar
- CSV => einfach, ohne Typen

## Spickzettel
- Avro = Zeile, Streaming, Schema im Header
- Parquet/ORC = Spalte, Analyse, WORM
- CSV/JSON = Text; Avro/Parquet/ORC = binär
- Schema Evolution = Abwärtskompatibilität
