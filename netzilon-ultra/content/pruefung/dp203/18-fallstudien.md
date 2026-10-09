---
id: pr-dp203-fallstudien
bereich: Prüfung
block: DP-203
kapitel: DP-203 Azure Data Engineer – Prüfungsfragen
titel: DP-203 – Fallstudien (Contoso, Litware)
stufe: Profi
typ: fragen
pruefungen: [DP-203]
fach: SQL / Admin
quellen: [DE_A_ohne_D_1_bis_370.pdf, T1_-_1_bis_40_-_Lösung_und_Kommentare.pdf, T1_-_41_bis_80_-_Lösung_und_Kommentare.pdf, T1_-_81_bis_120_-_Lösung_und_Kommentare.pdf, T1_-_121_bis_140_-_Lösung_und_Kommentare.pdf, T2_-_141_bis_160_-_Lösung_und_Kommentare.pdf, T2_-_161_bis_180_-_Lösung_und_Kommentare.pdf, T2_-_181_bis_200_-_Lösung_und_Kommentare.pdf, T2_-_201_bis_240_-_Lösung_und_Kommentare.pdf, T2_-_241_bis_280_-_Lösung_und_Kommentare.pdf, 1_bis_40.pdf, 41_bis_80.pdf, 81_bis_120.pdf, 121_bis_160.pdf, 161_bis_200.pdf, 201_bis_240.pdf, 241_bis_280.pdf, 281_bis_320.pdf, 320_bis_370.pdf, 02d_Data_Engineering_-_SQL_Beispiele_und_Prüfungsfragen.pdf, 03d_Data_Engineering_-_Prüfungsfragen.pdf]
verweise: []
---

## Quiz

? Fallstudie Contoso: Für die Tabelle der Einzelhandelsgeschäfte (ca. 2 MB, Adressen der 2.000 Filialen) soll ein Surrogatschlüssel Änderungen an den Adressen abbilden. Was erstellen Sie?
* eine Tabelle mit IDENTITY-Eigenschaft
- eine temporale Tabelle mit Systemversionierung
- ein benutzerdefiniertes SEQUENCE-Objekt
- eine Tabelle mit FOREIGN-KEY-Einschränkung
! IDENTITY ist im dedizierten SQL-Pool die empfohlene Methode für Surrogatschlüssel; SEQUENCE und temporale Tabellen werden dort nicht unterstützt.
@ DP-203 Frage 361

? Fallstudie Contoso: Twitter-Feeds werden per Event Hubs Capture als Parquet in Azure Storage gespeichert; Datensätze älter als zwei Jahre sollen gelöscht werden, bei minimalem Verwaltungsaufwand. Welches Azure-Storage-Feature nehmen Sie auf?
- Änderungsfeed (Change Feed)
- vorläufiges Löschen (Soft Delete)
- zeitbasierte Aufbewahrung (Immutable Storage)
* Lebenszyklusverwaltung (Lifecycle Management)
! Eine Lebenszyklusregel löscht Blobs automatisch nach 730 Tagen. Zeitbasierte Aufbewahrung verhindert dagegen das Löschen.
@ DP-203 Frage 364

? Fallstudie Litware: Der analytische Datenspeicher soll nur aus dem lokalen Firmennetz und von Azure-Diensten erreichbar sein; Litware plant weder ExpressRoute noch VPN. Was empfehlen Sie, um Benutzer außerhalb des lokalen Netzes auszusperren?
- eine VNet-Regel auf Serverebene
- eine VNet-Regel auf Datenbankebene
* eine Firewall-IP-Regel auf Serverebene
- eine Firewall-IP-Regel auf Datenbankebene
! Ohne VPN/ExpressRoute kommt das lokale Netz über öffentliche IPs → Server-Firewallregel für diese IP-Bereiche (plus „Azure-Diensten Zugriff erlauben“). Synapse-Pools unterstützen keine Firewallregeln auf Datenbankebene.
@ DP-203 Frage 368

? Fallstudie Litware: Business-Analysten (Power BI) sollen keinen Zugriff auf Kundenkontaktinformationen wie Telefonnummern haben, weil diese analytisch irrelevant sind. Was empfehlen Sie?
- Transparent Data Encryption (TDE)
- Sicherheit auf Zeilenebene
* Sicherheit auf Spaltenebene
- Vertraulichkeitsbezeichnungen
! Column-Level Security sperrt die Kontaktspalten für die Analystenrolle. Bezeichnungen klassifizieren nur, sie beschränken keinen Zugriff. Die Sammlung nennt D, die Community (93 %) C.
@ DP-203 Frage 369

? Fallstudie Litware: Echtzeit-Verkaufsdaten vom POS-System laufen über einen Event Hub in den Datenspeicher. Wie verbessern Sie die Hochverfügbarkeit der Echtzeit-Verarbeitung?
- einen High-Concurrency-Databricks-Cluster bereitstellen
- einen Stream-Analytics-Auftrag mit Azure-Automation-Runbook zur Statusprüfung und zum Neustart
- Data Lake Storage auf GRS umstellen
* identische Stream-Analytics-Aufträge in gekoppelten Azure-Regionen bereitstellen
! Microsoft rollt Dienstupdates nicht gleichzeitig in gekoppelten Regionen aus – identische Aufträge in Regionspaaren erhöhen die Zuverlässigkeit.
@ DP-203 Frage 370

## Reihenfolge

### DP-203 Frage 359 (Fallstudie Contoso, Drag & Drop): Twitter-Feeds liegen per Event Hubs Capture als Parquet in Azure Storage; Benutzer sollen sie per PolyBase im dedizierten SQL-Pool abfragen und sich mit eigenen Azure-AD-Anmeldeinformationen authentifizieren (also keine Database Scoped Credential nötig). Reihenfolge der drei DDL-Befehle? (Sammlung: als dritten Schritt CREATE EXTERNAL TABLE AS SELECT)
1. CREATE EXTERNAL DATA SOURCE
2. CREATE EXTERNAL FILE FORMAT
3. CREATE EXTERNAL TABLE

### DP-203 Frage 366 (Fallstudie Contoso, Drag & Drop): Änderungen an Erfassungs- und Transformationspipelines sollen versioniert und von mehreren Data Engineers unabhängig entwickelt werden. Reihenfolge der Aktionen?
1. Repository und main-Branch erstellen
2. Feature-Branch erstellen
3. Pull Request erstellen
4. Änderungen zusammenführen (Merge)
5. Änderungen veröffentlichen (Publish)

## Zuordnen

### DP-203 Frage 358 (Fallstudie Contoso, Hotspot): Bekleidungshändler, Verkaufstransaktionen als eine Tabelle mit 5 Mrd. Zeilen in Synapse; Abfragen verknüpfen und filtern nach Produkt-ID; monatliche Partitionen (Grenzwert rechts), alte Daten monatlich entfernen. Datenablage für die Verkaufstransaktionen? (Sammlung: Verteilungsspalte Verkaufsdatum – Datumsspalten sind als Verteilungsschlüssel ungeeignet; Community-Lösung unten)
- Tabellentyp für die Verkaufstransaktionen => Hash
- Beim Erstellen der Tabelle => Verteilungsspalte auf Produkt-ID setzen

### DP-203 Frage 360 (Fallstudie Contoso, Hotspot): Partitionen für die Produktverkaufstransaktionen – effizientes monatliches Laden, Grenzwerte gehören zur rechten Partition, Kosten und Leistung des Speichers sollen vorhersehbar sein.
- Partitionieren nach => Verkaufsdatum (Sales date)
- Speichern in => einem dedizierten SQL-Pool in Azure Synapse (feste DWU = planbare Kosten/Leistung)

### DP-203 Frage 362 (Fallstudie Contoso, Hotspot): Analytische Speicherlösung – Tabelle der Einzelhandelsgeschäfte ca. 2 MB, Promotion-Tabelle ca. 200 GB (Promotion-ID je Produkt-ID); Abfragen joinen/filtern nach Produkt-ID.
- Tabellentyp für Filialdaten => Repliziert
- Tabellentyp für Promotion-Daten => Hash (auf Produkt-ID)

### DP-203 Frage 363 (Fallstudie Contoso, Hotspot): Datenbankobjekt für die Verkaufstransaktionen in Synapse – monatliche Partitionen, Grenzwert gehört zur rechten Partition.
- T-SQL-DDL-Befehl => CREATE TABLE
- Partitionsoption in der WITH-Klausel => RANGE RIGHT FOR VALUES

### DP-203 Frage 365 (Fallstudie Litware, Hotspot): Convenience-Store-Kette; tägliche Bestandsdaten liegen auf einem SQL Server in einem privaten Netzwerk (kein VPN/ExpressRoute) und sollen per Data Factory nach ADLS Gen2 importiert werden.
- Integration-Runtime-Typ => Selbstgehostete Integration Runtime
- Triggertyp => Zeitplantrigger (Schedule)
- Aktivitätstyp => Kopieraktivität (Copy)

### DP-203 Frage 367 (Fallstudie Contoso, Hotspot): Erfassung der Twitter-Feeds – Durchsatz Event Hubs → Storage maximieren, ohne zusätzliche Durchsatz- oder Kapazitätseinheiten zu kaufen; Speicher mit Azure-AD-Zugriffssteuerung bis auf Objektebene.
- Durchsatz erhöhen => Event-Hubs-Partitionen konfigurieren (Auto-Inflate/Dedicated würden zusätzliche Einheiten kosten)
- Speicherung der Twitter-Daten => Azure Data Lake Storage Gen2 (RBAC + POSIX-ACLs)
