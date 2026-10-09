---
id: pr-dp203-nachtrag-6
bereich: Prüfung
block: DP-203
kapitel: DP-203 Azure Data Engineer – Prüfungsfragen
titel: DP-203 – Nachtrag 6
stufe: Profi
typ: fragen
pruefungen: [DP-203]
fach: SQL / Admin
quellen: [DE_A_ohne_D_1_bis_370.pdf, T1_-_1_bis_40_-_Lösung_und_Kommentare.pdf, T1_-_41_bis_80_-_Lösung_und_Kommentare.pdf, T1_-_81_bis_120_-_Lösung_und_Kommentare.pdf, T1_-_121_bis_140_-_Lösung_und_Kommentare.pdf, T2_-_141_bis_160_-_Lösung_und_Kommentare.pdf, T2_-_161_bis_180_-_Lösung_und_Kommentare.pdf, T2_-_181_bis_200_-_Lösung_und_Kommentare.pdf, T2_-_201_bis_240_-_Lösung_und_Kommentare.pdf, T2_-_241_bis_280_-_Lösung_und_Kommentare.pdf, 1_bis_40.pdf, 41_bis_80.pdf, 81_bis_120.pdf, 121_bis_160.pdf, 161_bis_200.pdf, 201_bis_240.pdf, 241_bis_280.pdf, 281_bis_320.pdf, 320_bis_370.pdf]
verweise: []
---

## Quiz

? Frage 224 (Hotspot): ADF ist an ein Git-Repository angebunden. Wann werden Änderungen an einem verknüpften Dienst, die in einem Feature-Branch vorgenommen wurden, im Live-Dienst wirksam?
- beim Speichern der Änderungen
- sofort beim Erstellen des Feature-Branches
* erst wenn die Änderungen in den Kollaborationszweig gemergt und veröffentlicht werden
- beim Schließen des Branches
! Veröffentlicht wird nur aus dem Kollaborationszweig (Standard main); Änderungen im Feature-Branch gelangen erst nach dem Merge in den Live-Dienst.
@ DP-203 Frage 224

? Frage 225 (Hotspot): ADF-Zeitplantrigger (wöchentlich, Zeitzone Pacific Standard Time, hours 3 und 21, weekDays Sunday und Saturday, Startzeit 2022-08-05). Wie oft wird er am Sonntag, 3. März 2024 ausgeführt?
- einmal
* zweimal
- keinmal
- dreimal
! Sonntag ist in der Liste der Wochentage, und es gibt zwei Uhrzeiten (3:00 und 21:00 Uhr). Die Sommerzeit beginnt in den USA erst am 10. März 2024, spielt hier also keine Rolle.
@ DP-203 Frage 225

? Frage 232 (Hotspot): ADF mit Azure-Repos-Git-Integration (Standardwerte für Kollaborations- und Veröffentlichungsbranch). Sie ändern pipeline1 im Branch feature1 und wählen in Data Factory Studio „Veröffentlichen“. Aus welchem Branch wird der Quellcode erzeugt?
- adf_publish
- feature1
* main
- feature
! Veröffentlichen baut immer auf dem Kollaborationszweig (main) auf; Feature-Branches müssen zuerst per Pull Request dorthin gemergt werden.
@ DP-203 Frage 232

? Frage 232 (Hotspot): In welchem Branch landet die Ausgabe der ARM-Vorlage?
* adf_publish
- feature1
- main
- feature
! Die generierten ARM-Vorlagen werden in den Veröffentlichungsbranch (adf_publish) geschrieben.
@ DP-203 Frage 232

? Frage 233 (Drag-and-Drop): Eine ADF-Aktivität soll eine Datei aus Blob Storage in mehrere Ziele kopieren; Quell- und Zielpfade sollen konsistent bleiben. Welchen Aktivitätstyp setzen Sie für die äußere Aktivität ein (isSequential, items: @pipeline().parameters.mySinkDatasetFolderPath, innere Copy-Aktivität)?
- Switch
- Until
* ForEach
- Filter
! ForEach iteriert über die Liste der Zielordner und führt die Kopieraktivität je Ziel aus.
@ DP-203 Frage 233

? Frage 233 (Drag-and-Drop): Welchen CopyBehavior-Wert setzen Sie in der BlobSink, damit die Ordnerstruktur gleich bleibt?
- FlattenHierarchy
- MergeFiles
* PreserveHierarchy
- DeleteHierarchy
! PreserveHierarchy behält die relative Pfadstruktur der Quelle im Ziel bei.
@ DP-203 Frage 233

? Frage 238 (Drag-and-Drop): Mit einem serverlosen Synapse-SQL-Pool soll ein Balkendiagramm „Umsatz nach Produkt“ erzeugt werden (Entwicklungsaufwand minimieren). Welche Reihenfolge ist richtig?
* SQL-Skript in Synapse Studio erstellen; SELECT-Anweisung mit dem Umsatz je Produkt ergänzen; Skript ausführen; zur Diagrammansicht wechseln; Diagrammeinstellungen anpassen
- Diagrammansicht öffnen; SQL-Skript erstellen; SELECT ergänzen; Skript ausführen; Diagrammeinstellungen anpassen
- SQL-Skript erstellen; Skript ausführen; SELECT ergänzen; Diagrammeinstellungen anpassen; zur Diagrammansicht wechseln
- SELECT ergänzen; SQL-Skript erstellen; zur Diagrammansicht wechseln; Skript ausführen; Diagrammeinstellungen anpassen
! Synapse Studio zeigt Abfrageergebnisse direkt als Diagramm an; ohne Power BI ist kein weiterer Entwicklungsaufwand nötig.
@ DP-203 Frage 238

? Frage 239 (Drag-and-Drop): Eine Kopie eines dedizierten Synapse-SQL-Pools soll 28 Tage lang verfügbar sein (Kosten minimieren). Welche drei Aktionen in welcher Reihenfolge?
* Benutzerdefinierten Wiederherstellungspunkt erstellen; die Kopie aus diesem Wiederherstellungspunkt in ein neues Data Warehouse wiederherstellen; das wiederhergestellte Data Warehouse anhalten
- Letzten automatischen Wiederherstellungspunkt in ein neues Data Warehouse wiederherstellen; das Warehouse anhalten; Wiederherstellungspunkt erstellen
- Benutzerdefinierten Wiederherstellungspunkt erstellen; Kopie in das aktuelle Data Warehouse wiederherstellen; das aktuelle Warehouse anhalten
- Letzten automatischen Wiederherstellungspunkt in das aktuelle Data Warehouse wiederherstellen; Kopie anhalten; neuen Punkt erstellen
! Die Kopie entsteht aus einem benutzerdefinierten Wiederherstellungspunkt in einem neuen Warehouse; angehalten fallen keine Computekosten an.
@ DP-203 Frage 239

? Frage 240 (Hotspot): Synapse-Spark-Pool: CSV-Datei lesen und in eine Delta-Tabelle schreiben: df.____.save(delta_table_path). Was setzen Sie ein?
- cache()
- inputFiles()
* write.format("delta")
- write.parquet
! write.format("delta").save(Pfad) schreibt das DataFrame im Delta-Format.
@ DP-203 Frage 240

? Frage 240 (Hotspot): Wie erzeugen Sie danach das DeltaTable-Objekt: deltaTable = ____(spark, delta_table_path)?
- deltaTable.alias
- deltaTable.convertToDelta
* DeltaTable.forPath
- deltaTable.update
! DeltaTable.forPath(spark, Pfad) lädt eine vorhandene Delta-Tabelle als Objekt.
@ DP-203 Frage 240

? Frage 241 (Hotspot): Stündliche CSV-Dateien (2020 bis 2023) liegen unter csv/system1/{year}/{month}/{filename}.csv. Im serverlosen Pool soll die Zeilenanzahl jeder Datei für Oktober bis Dezember 2022 ermittelt werden. Welchen BULK-Pfad verwenden Sie?
- 'csv/system1/2022'
* 'csv/system1/2022/*/*.csv'
- 'csv/system1/*/*.csv'
- 'csv/system1/2022/**'
! Das erste Wildcard * entspricht dem Monatsordner, das zweite dem Dateinamen.
@ DP-203 Frage 241

? Frage 241 (Hotspot): Welche Bedingung filtert die letzten drei Monate: WHERE ____ IN ('10', '11', '12')?
- r.filepath()
* r.filepath(1)
- r.filepath(2)
- r.filepath(0)
! filepath(1) liefert den Wert des ersten Wildcards (hier Monat).
@ DP-203 Frage 241

? Frage 242 (Hotspot): Dedizierter Synapse-Pool Pool1 mit externer Tabelle Sales; Zeilenebenensicherheit (RLS): Verkäufer sollen nur ihre eigenen Verkäufe sehen. Was erstellen Sie?
- Eine materialisierte Sicht in Pool1
* Eine Sicherheitsrichtlinie (Security Policy) für Sales
- Datenbankweit gültige Anmeldeinformationen in Pool1
- Eine Maskierungsregel
! RLS wird mit einer Sicherheitsrichtlinie (CREATE SECURITY POLICY) umgesetzt, die ein Filterprädikat an die Tabelle bindet.
@ DP-203 Frage 242

? Frage 242 (Hotspot): Womit schränken Sie den Zeilenzugriff ein?
- Eine Maskierungsregel
* Eine Tabellenwertfunktion (inline table-valued function)
- Das CONTAINS-Prädikat
- Eine Berechtigung DENY SELECT
! Das Filterprädikat ist eine Inline-Tabellenwertfunktion, die z. B. USER_NAME() mit der Verkäuferspalte vergleicht.
@ DP-203 Frage 242

? Frage 246 (Drag-and-Drop): In Databricks soll die lokale Datei /tmp/file1 (mehrzeiliges JSON-Array) mit Scala eingelesen werden: val df = spark.read.option("____", "true").____("/tmp/file1"). Was setzen Sie ein?
* multiline und json
- inferSchema und text
- ignoreExtension und schema
- multiline und text
! Ein über mehrere Zeilen verteiltes JSON-Dokument braucht die Option multiline = true; gelesen wird mit .json(). (In der Quelle ist die Option unleserlich als „inferSchema“ erkennbar; für ein Array über mehrere Zeilen ist multiline nötig.)
@ DP-203 Frage 246

? Frage 248 (Drag-and-Drop): Group1 (Azure-AD-Sicherheitsgruppe) soll im dedizierten Pool dw1 schreibgeschützten Zugriff auf alle Tabellen und Sichten in schema1 bekommen (geringste Rechte). Welche drei Aktionen in welcher Reihenfolge?
* Datenbankbenutzer für Group1 mit FROM EXTERNAL PROVIDER erstellen; Datenbankrolle Role1 erstellen und SELECT auf schema1 gewähren; Role1 dem Group1-Datenbankbenutzer zuweisen
- Azure-RBAC-Rolle „Leser“ für dw1 Group1 zuweisen; Rolle Role1 mit SELECT auf dw1 erstellen; Role1 zuweisen
- Rolle Role1 mit SELECT auf dw1 erstellen; Benutzer erstellen; Azure-RBAC-Leser zuweisen
- Azure-RBAC-Leser zuweisen; Benutzer für Group1 erstellen; Rolle Role1 mit SELECT auf dw1 gewähren
! SELECT auf das Schema (nicht auf die ganze Datenbank) erfüllt das Prinzip der geringsten Rechte; die Azure-RBAC-Rolle „Leser“ gibt keinen Datenzugriff.
@ DP-203 Frage 248

? Frage 249 (Hotspot): TDE für Server1 mit Pool1: Verwendung der Verschlüsselungsschlüssel verfolgen. Was empfehlen Sie?
- Always Encrypted
* TDE mit kundenseitig verwalteten Schlüsseln
- TDE mit plattformseitig verwalteten Schlüsseln
- Dynamic Data Masking
! Kundenseitig verwaltete Schlüssel liegen im Azure Key Vault; dessen Zugriffe lassen sich protokollieren und überwachen.
@ DP-203 Frage 249

? Frage 249 (Hotspot): Was sorgt dafür, dass Client-Apps bei einem Ausfall des Azure-Rechenzentrums (Schlüssel nicht verfügbar) weiter auf Pool1 zugreifen können?
* Azure Key Vaults in zwei Azure-Regionen erstellen und konfigurieren
- Advanced Data Security auf Server1 aktivieren
- Client-Apps mit einem Microsoft-.NET-Framework-Datenanbieter implementieren
- Always Encrypted aktivieren
! Ein zweiter Key Vault in einer anderen Region hält den TDE-Schutzschlüssel redundant verfügbar.
@ DP-203 Frage 249

? Frage 255 (Hotspot): Data Factory soll aus jedem Ordner von DataLake1 lesen und schreiben (geringste Rechte, geringes Missbrauchsrisiko, wenig Wartungsaufwand). Womit authentifizieren Sie?
- Shared Access Signature (SAS) mit gespeicherter Zugriffsrichtlinie
- Shared Key mit Authorization-Header
* Microsoft Azure AD (Entra ID) mit einer verwalteten Identität (Managed Identity)
- Shared Key mit gespeicherter Zugriffsrichtlinie
! Eine Managed Identity benötigt keine Geheimnisse und wird per Azure-RBAC (z. B. Storage-Blobdatenmitwirkender) berechtigt.
@ DP-203 Frage 255

? Frage 257 (Drag-and-Drop): In Pool1 (Server1) soll TDE mit einem benutzerdefinierten Schlüssel key1 aktiviert werden. Welche fünf Aktionen in welcher Reihenfolge?
* Server1 eine verwaltete Identität zuweisen; Azure Key Vault erstellen und der Identität Berechtigungen gewähren; key1 zum Key Vault hinzufügen; key1 als TDE-Schutz für Server1 konfigurieren; TDE für Pool1 aktivieren
- TDE für Pool1 aktivieren; Key Vault erstellen; key1 hinzufügen; Identität zuweisen; key1 als TDE-Schutz konfigurieren
- Key Vault erstellen; key1 hinzufügen; TDE aktivieren; Identität zuweisen; key1 als TDE-Schutz konfigurieren
- key1 als TDE-Schutz konfigurieren; Identität zuweisen; Key Vault erstellen; key1 hinzufügen; TDE aktivieren
! Reihenfolge: Identität, Key Vault + Rechte, Schlüssel, TDE-Protector, TDE einschalten.
@ DP-203 Frage 257

? Frage 261 (Hotspot): Databricks-Dataset DBTBL1 (SensorTypeID, GeographyRegionID, Year, Month, Day, Hour, Minute, Temperature, WindSpeed, Other): Tägliche inkrementelle Ladepipelines je GeographyRegionID, Speicherkosten minimieren. Welche Methode: df.write.____(…).mode("append")?
- bucketBy
- format
* partitionBy
- sortBy
! partitionBy("GeographyRegionID", "Year", "Month", "Day") legt Ordner je Region und Tag an – ideal für inkrementelle Loads.
@ DP-203 Frage 261

? Frage 261 (Hotspot): Welches Ausgabeformat wählen Sie für die geringsten Speicherkosten?
- .csv("/DBTBL1")
- .json("/DBTBL1")
* .parquet("/DBTBL1")
- .saveAsTable("/DBTBL1")
! Parquet ist komprimiert und spaltenorientiert.
@ DP-203 Frage 261

? Frage 266 (Hotspot): Ein Azure-Databricks-Cluster soll sich per Azure-AD-Integration automatisch mit ADLS Gen2 verbinden. Welchen Tarif benötigen Sie?
* Premium
- Standard
- Basic
- Free
! Credential Passthrough erfordert den Databricks-Premium-Plan.
@ DP-203 Frage 266

? Frage 266 (Hotspot): Welche erweiterte Option aktivieren Sie?
* Azure Data Lake Storage Credential Passthrough
- Table Access Control
- Cluster-Autoskalierung
- Spot-Instanzen
! Mit Credential Passthrough nutzt der Cluster die Azure-AD-Identität des Benutzers für ADLS-Zugriffe.
@ DP-203 Frage 266

? Frage 269 (Hotspot): Data Scientists und Data Engineers fragen mit Databricks-Notebooks ADLS-Gen2-Daten ab; Benutzer sehen nur die Ordner ihrer Projekte; Verwaltungsaufwand minimieren. Welche Authentifizierungsmethode für Databricks?
- Azure-AD-Credential-Passthrough
- Azure-Key-Vault-Geheimnisse
* Persönliche Zugriffstoken (Personal Access Tokens)
- Shared Access Keys
! Laut Quelle: Databricks wird per persönlichem Zugriffstoken genutzt, der Zugriff auf Data Lake Storage über Azure-AD-Passthrough.
@ DP-203 Frage 269

? Frage 269 (Hotspot): Welche Methode für Data Lake Storage?
* Azure-AD-Credential-Passthrough
- Shared Access Keys
- Shared Access Signatures
- Anonymer Zugriff
! Mit Passthrough gelten die ACLs/Rollen des angemeldeten Benutzers automatisch – keine Schlüsselverwaltung.
@ DP-203 Frage 269

? Frage 273 (Hotspot): Azure-Synapse-SQL-Pool Pool1 in einem Hybridmandanten: Die Lösung muss MFA und Authentifizierung auf Datenbankebene unterstützen. Welche Authentifizierung ermöglicht MFA?
* Azure-AD-Authentifizierung
- Microsoft-SQL-Server-Authentifizierung
- Kennwortlose Authentifizierung
- Windows-Authentifizierung
! Nur die Azure-AD-Authentifizierung unterstützt MFA.
@ DP-203 Frage 273

? Frage 273 (Hotspot): Was verwenden Sie für die Authentifizierung auf Datenbankebene?
- Anwendungsrollen
* Benutzer eigenständiger Datenbanken (Contained Database Users)
- Datenbankrollen
- Microsoft-SQL-Server-Anmeldungen
! Azure-AD-Identitäten werden über eigenständige Datenbankbenutzer auf Datenbankebene authentifiziert.
@ DP-203 Frage 273

? Frage 274 (Drag-and-Drop): Pipeline-Ausführungsdaten einer Data Factory sollen 120 Tage aufbewahrt und mit Kusto (KQL) abfragbar sein. Welche vier Aktionen in welcher Reihenfolge?
* Log-Analytics-Arbeitsbereich mit 120 Tagen Datenaufbewahrung erstellen; im Azure-Portal eine Diagnoseeinstellung hinzufügen; die Kategorie PipelineRuns auswählen; Daten an den Log-Analytics-Arbeitsbereich senden
- Speicherkonto mit Lebenszyklusrichtlinie erstellen; Diagnoseeinstellung hinzufügen; Kategorie TriggerRuns wählen; an Event Hub streamen
- Diagnoseeinstellung hinzufügen; an Event Hub streamen; Kategorie PipelineRuns wählen; Speicherkonto erstellen
- Log-Analytics-Arbeitsbereich erstellen; an Event Hub streamen; PipelineRuns wählen; Diagnoseeinstellung hinzufügen
! KQL-Abfragen setzen Log Analytics voraus; die Aufbewahrung wird am Arbeitsbereich eingestellt. (Mehrere Reihenfolgen der mittleren Schritte sind möglich.)
@ DP-203 Frage 274
