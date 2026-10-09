---
id: azd-data-factory
bereich: Azure Data
pruefungen: [DP-203]
fach: Data Engineering
block: A2
kapitel: Datenintegration
titel: Azure Data Factory – Pipelines, Aktivitäten, Datasets, Linked Services, Integration Runtime, Trigger
stufe: Fortgeschritten
quellen: [08_b_Data_Engineering_-_Synapse_Analysis.pdf, 10_Data_Engineering_-_Databricks.pdf, 03a_Data_Engineering_-_Datentypen_und_Strukturen.pdf]
verweise: [azd-synapse, azd-databricks, azd-grundlagen, azd-externe-tabellen]
---

## Profi

Hinweis zur Quelle: Der Kursstoff erwähnt Data Factory als Orchestrierungsdienst (Synapse-Pipelines basieren darauf; Databricks-Notebooks werden per ADF-Aktivität eingebunden). Die folgenden Details ergänzen den DP-203-Standardstoff.

### Aufgabe
**Azure Data Factory (ADF)** ist der cloudbasierte, serverlose Dienst für **Datenintegration und Orchestrierung** (ETL/ELT) mit grafischem Designer (**Azure Data Factory Studio**) und ohne Infrastrukturverwaltung. Synapse Analytics enthält dieselbe Pipeline-Engine („Integrate“-Hub).

### Bausteine
| Baustein | Bedeutung |
|---|---|
| **Pipeline** | logische Gruppierung von Aktivitäten, die eine Aufgabe erledigen |
| **Activity** | Verarbeitungsschritt: **Data movement** (Copy), **Data transformation** (Mapping Data Flow, Databricks Notebook, Stored Procedure, Spark), **Control** (ForEach, If, Until, Wait, Web, Execute Pipeline) |
| **Dataset** | benannte Sicht auf Daten (Tabelle, Datei, Ordner), verweist auf Linked Service |
| **Linked Service** | Verbindungsinformation zu Datenspeicher/Compute (wie ein Connection String), Geheimnisse in **Azure Key Vault** |
| **Integration Runtime (IR)** | Compute-Infrastruktur: **Azure IR** (Cloud), **Self-hosted IR** (lokale/Netzwerk-Daten), **Azure-SSIS IR** (SSIS-Pakete) |
| **Trigger** | startet Pipelines: **Schedule**, **Tumbling Window** (zusammenhängende, nicht überlappende Fenster, Wiederholung/Backfill), **Event-based** (z. B. Blob erstellt), manuell |
| **Parameter / Variablen** | dynamische Pipelines; Ausdrücke `@pipeline().parameters.name` |
| **Mapping Data Flow** | grafische Spark-Transformation (Join, Aggregate, Derived Column …) ohne Code |
| **Copy-Aktivität** | kopiert zwischen über 90 Quellen/Senken; **DIUs** (Data Integration Units) für Durchsatz |

### Typische Muster
- **Ingest**: Copy aus lokaler SQL-DB (Self-hosted IR) in den Data Lake (Rohzone).
- **Transform**: Databricks-Notebook oder Mapping Data Flow bereinigt (Rohzone → Bereinigt → Kuratiert, „Medallion“: Bronze/Silber/Gold).
- **Load**: Copy oder CTAS/COPY INTO in Synapse-Dedicated-Pool; danach Power-BI-Refresh.
- **Inkrementelles Laden** über Watermark-Spalte oder Change Tracking.
- **Fehlerbehandlung**: Retry-Richtlinien, Timeout, Aktivitätsabhängigkeiten (Succeeded, Failed, Completed, Skipped), Alerts über Azure Monitor.
- **CI/CD**: Git-Integration (Azure DevOps/GitHub), ARM-Template-Export.
Kosten: nach Aktivitätsläufen und Data-Flow-Cluster-Stunden, IR-Laufzeiten.

## Einfach

**Azure Data Factory** ist die **Fabrik-Leiterin** für Daten. Sie arbeitet nicht selbst mit den Daten, sondern **sagt anderen, was wann zu tun ist**: „Hole um 2 Uhr nachts die Verkaufszahlen aus dem Kassensystem, lege sie im Lager ab, lass sie vom Reinigungsteam (Databricks) aufräumen und stell sie dann dem Chef im Warenhaus (Synapse) bereit.“

Die Bausteine in Alltagssprache:
- **Pipeline** = das **Rezept/der Ablaufplan** mit mehreren Schritten.
- **Aktivität** = ein **einzelner Schritt** im Rezept („Kopiere“, „Transformiere“, „Warte“, „Wenn-dann“).
- **Linked Service** = die **Telefonnummer und Zugangsdaten** eines Partners („Hier erreichst du die Datenbank im Keller“).
- **Dataset** = der **konkrete Aktenordner**, mit dem der Schritt arbeitet.
- **Integration Runtime** = die **Arbeitsmaschine/der Lieferwagen**, der die Daten wirklich transportiert. Für Daten im **eigenen Firmennetz** braucht man einen eigenen Lieferwagen (Self-hosted), weil die Cloud nicht einfach hinein darf.
- **Trigger** = der **Wecker**: Jeden Tag um 2 Uhr, oder sofort, wenn eine neue Datei ankommt.

Das Schöne: Man klickt die Pipelines im Browser **wie ein Flussdiagramm** zusammen, ohne Programmieren. Wenn ein Schritt fehlschlägt, kann man einstellen: nochmal versuchen oder eine Warn-E-Mail schicken.

## Merksatz
- **Pipeline ⊃ Aktivitäten; Linked Service = Verbindung; Dataset = Daten; IR = Rechner; Trigger = Auslöser.**
- **Self-hosted IR für lokale Daten.**
- **ADF orchestriert, es speichert nicht und analysiert nicht selbst.**
- **Copy = Data Movement, Data Flow = Transformation.**

## Prüfungsfalle
- Tumbling-Window-Trigger: feste, nicht überlappende Zeitfenster mit Zustand; Schedule-Trigger hat keinen Fenster-Zustand.
- Zugriff auf lokale Datenquellen → **Self-hosted Integration Runtime**.
- Zugangsdaten gehören in **Key Vault**, nicht in den Pipeline-Code.
- Azure-SSIS IR nur für SSIS-Pakete.
- Synapse-Pipelines ≈ ADF-Pipelines, aber im Synapse-Workspace.
- Databricks wird per Linked Service + Zugriffstoken angebunden.

## Grafik
### Pipeline-Ablauf
1. Trigger -> Pipeline: startet täglich um 2:00 Uhr
2. Pipeline -> Quelle SQL: Copy-Aktivität liest Verkaufsdaten (Self-hosted IR)
3. Pipeline -> Data Lake: schreibt Rohdaten als Parquet
4. Pipeline -> Databricks: Notebook-Aktivität bereinigt Daten
5. Pipeline -> Synapse: lädt Faktentabelle per Copy
6. Pipeline: bei Fehler Retry und Benachrichtigung

## Lab
### GUI
Maschine: Windows-Client (Browser). Azure Portal > Data Factory erstellen (RG rg-lab) > „Studio starten“ > Author > Pipeline > Copy-Daten-Tool: Quelle Blob (CSV), Ziel Blob (Parquet) > Debuggen > Trigger hinzufügen. Danach RG löschen.
### PowerShell
```
Set-AzDataFactoryV2 -ResourceGroupName rg-lab -Name adf-lab-2026 -Location westeurope
Invoke-AzDataFactoryV2Pipeline -ResourceGroupName rg-lab -DataFactoryName adf-lab-2026 -PipelineName CopySales
```

## Übungen
- A: Ein Datentransfer aus dem lokalen Rechenzentrum ist nötig. Welche IR? | L: Self-hosted Integration Runtime.
- A: Eine Pipeline soll starten, sobald eine Datei im Blob erscheint. | L: Event-basierter Trigger (Storage Events).
- A: Wie bindet man ein Databricks-Notebook ein? | L: Linked Service (Access Token) + Notebook-Aktivität.
- A: Wo speichert man Passwörter für Linked Services sicher? | L: Azure Key Vault.

## Karteikarten
- F: Was ist ADF? | A: Serverloser Cloud-Dienst zur Datenintegration und Orchestrierung (ETL/ELT).
- F: Was ist eine Pipeline? | A: Gruppe von Aktivitäten, die gemeinsam eine Aufgabe erledigen.
- F: Drei Arten von Aktivitäten? | A: Data Movement, Data Transformation, Control.
- F: Was ist ein Linked Service? | A: Verbindungsdefinition zu einem Datenspeicher oder Compute.
- F: Was ist ein Dataset? | A: Benannte Sicht auf Daten, verweist auf einen Linked Service.
- F: Was ist eine Integration Runtime? | A: Compute-Infrastruktur für Kopier-, Transformations- und Dispatch-Aufgaben.
- F: Wofür Self-hosted IR? | A: Zugriff auf lokale/private Netzwerke.
- F: Welche Trigger gibt es? | A: Schedule, Tumbling Window, Event-based, manuell.
- F: Was ist ein Mapping Data Flow? | A: Grafische Spark-basierte Transformation ohne Code.

## Quiz
? Welche Integration Runtime greift auf lokale Datenquellen zu?
* Self-hosted IR
- Azure IR
- Azure-SSIS IR
- Keine

? Was ist ein Linked Service?
* Verbindung zu einem Datenspeicher oder Compute
- Ein Zeitplan
- Eine Transformation
- Ein Cluster

? Welcher Trigger arbeitet mit nicht überlappenden Zeitfenstern?
* Tumbling Window
- Schedule
- Event
- Manuell
? Wo sollten Geheimnisse gespeichert werden?
* Azure Key Vault
- Im Pipeline-Namen
- In einer CSV-Datei
- Im Dataset-Namen

? Was ist eine Aktivität?
* Ein Verarbeitungsschritt in einer Pipeline
- Ein Zeitplan
- Ein Speicher
- Ein Benutzer

? Wofür steht ETL/ELT-Orchestrierung in Azure?
* Data Factory
- Azure Files
- Event Hubs
- Cosmos DB

? Welche Aktivität kopiert Daten zwischen Quellen und Senken?
* Copy
- ForEach
- Wait
- If Condition

? Welche IR führt SSIS-Pakete aus?
* Azure-SSIS IR
- Azure IR
- Self-hosted IR
- Spark IR

## Lücken
- Eine {Pipeline} besteht aus mehreren {Aktivitäten}.
- Lokale Daten erreicht man über eine {Self-hosted} Integration Runtime.

## Zuordnen
### Baustein und Aufgabe
- Pipeline => Ablaufplan
- Linked Service => Verbindung
- Dataset => Daten-Sicht
- Trigger => Auslöser
- Integration Runtime => Compute-Infrastruktur

## Spickzettel
- Pipeline, Activity, Dataset, Linked Service, IR, Trigger
- Self-hosted IR für lokal; Key Vault für Geheimnisse
- Trigger: Schedule, Tumbling Window, Event
- ADF orchestriert; Synapse-Pipelines = ADF-Engine
