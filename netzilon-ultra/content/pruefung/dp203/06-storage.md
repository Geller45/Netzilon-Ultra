---
id: pr-dp203-storage
bereich: Prüfung
block: DP-203
kapitel: DP-203 Azure Data Engineer – Prüfungsfragen
titel: DP-203 – Data Lake Storage – Ordnerstruktur, Redundanz, Zugriffsebenen, Lebenszyklus
stufe: Profi
typ: fragen
pruefungen: [DP-203]
fach: SQL / Admin
quellen: [DE_A_ohne_D_1_bis_370.pdf, T1_-_1_bis_40_-_Lösung_und_Kommentare.pdf, T1_-_41_bis_80_-_Lösung_und_Kommentare.pdf, T1_-_81_bis_120_-_Lösung_und_Kommentare.pdf, T1_-_121_bis_140_-_Lösung_und_Kommentare.pdf, T2_-_141_bis_160_-_Lösung_und_Kommentare.pdf, T2_-_161_bis_180_-_Lösung_und_Kommentare.pdf, T2_-_181_bis_200_-_Lösung_und_Kommentare.pdf, T2_-_201_bis_240_-_Lösung_und_Kommentare.pdf, T2_-_241_bis_280_-_Lösung_und_Kommentare.pdf, 1_bis_40.pdf, 41_bis_80.pdf, 81_bis_120.pdf, 121_bis_160.pdf, 161_bis_200.pdf, 201_bis_240.pdf, 241_bis_280.pdf, 281_bis_320.pdf, 320_bis_370.pdf, 02d_Data_Engineering_-_SQL_Beispiele_und_Prüfungsfragen.pdf, 03d_Data_Engineering_-_Prüfungsfragen.pdf]
verweise: []
---

## Quiz

? Sie entwerfen die Ordnerstruktur eines ADLS-Gen2-Containers. Abfragen kommen aus Databricks und serverlosen Synapse-SQL-Pools, die Daten werden nach Fachgebiet (Subject Area) abgesichert, die meisten Abfragen betreffen das aktuelle Jahr oder den aktuellen Monat. Welche Ordnerstruktur unterstützt schnelle Abfragen und einfache Ordnersicherheit?
- /{SubjectArea}/{DataSource}/{DD}/{MM}/{YYYY}/{FileData}_{YYYY}_{MM}_{DD}.csv
- /{DD}/{MM}/{YYYY}/{SubjectArea}/{DataSource}/{FileData}_{YYYY}_{MM}_{DD}.csv
- /{YYYY}/{MM}/{DD}/{SubjectArea}/{DataSource}/{FileData}_{YYYY}_{MM}_{DD}.csv
* /{SubjectArea}/{DataSource}/{YYYY}/{MM}/{DD}/{FileData}_{YYYY}_{MM}_{DD}.csv
! Fachgebiet vorne → Berechtigungen (POSIX-ACLs) einmal pro Fachgebiet-Ordner; Datum hinten in der Reihenfolge Jahr/Monat/Tag → Partition Pruning für „aktuelles Jahr/Monat“. Dozent: „Beachten Sie die Pfadangabe!“
@ DP-203 Frage 6

? Ein ADLS-Gen2-Container mit 100 TB soll bei einem Ausfall der primären Region für Lese-Workloads in einer sekundären Region verfügbar sein. Die Kosten sollen minimal sein. Welche Redundanz wählen Sie?
- Georedundanter Speicher (GRS)
* Georedundanter Speicher mit Lesezugriff (RA-GRS)
- Zonenredundanter Speicher (ZRS)
- Lokal redundanter Speicher (LRS)
! Nur RA-GRS erlaubt das Lesen in der Sekundärregion jederzeit, ohne Failover abzuwarten. Community stimmte zu 66 % für GRS (billiger; nach Failover ebenfalls lesbar) – Prüfungsfalle: Achten Sie darauf, ob „sofort lesbar ohne Failover“ gefordert ist (RA-GRS) oder nur Datenschutz (GRS).
@ DP-203 Frage 17

? Ein ADLS-Gen2-Konto soll verfügbar bleiben, wenn ein Rechenzentrum in der primären Azure-Region ausfällt. Die Kosten sollen minimal sein. Welche Replikation?
- Georedundanter Speicher (GRS)
- Geozonenredundanter Speicher (GZRS)
- Lokal redundanter Speicher (LRS)
* Zonenredundanter Speicher (ZRS)
! ZRS repliziert synchron über drei Verfügbarkeitszonen der Region – schützt vor Ausfall eines Rechenzentrums und ist günstiger als GRS/GZRS. LRS liegt nur in einem Rechenzentrum.
@ DP-203 Frage 18

? ADLS-Gen2-Ordnerstruktur: Abfragen über serverlose SQL- und Spark-Pools, meist mit Filter auf aktuelles Jahr oder aktuelle Woche, Daten werden nach Datenquelle abgesichert. Ordnersicherheit vereinfachen, Abfragezeiten minimieren. Welche Struktur?
* \DataSource\SubjectArea\YYYY\WW\FileData_YYYY_MM_DD.parquet
- \DataSource\SubjectArea\YYYY-WW\FileData_YYYY_MM_DD.parquet
- \DataSource\SubjectArea\WW\YYYY\FileData_YYYY_MM_DD.parquet
- \YYYY\WW\DataSource\SubjectArea\FileData_YYYY_MM_DD.parquet
- \WW\YYYY\SubjectArea\DataSource\FileData_YYYY_MM_DD.parquet
! Sicherheitsgrenze (DataSource) ganz vorne, darunter Jahr und dann Woche als eigene Ebenen – so filtern Abfragen auf Jahr oder Jahr+Woche über den Pfad.
@ DP-203 Frage 70

? Für das ADLS-Gen2-Konto storage1 soll die Abfragebeschleunigung (Query Acceleration) implementiert werden. Welche ZWEI Dateitypen werden unterstützt?
* JSON
- Apache Parquet
- XML
* CSV
- Avro
! Query Acceleration filtert serverseitig Zeilen/Spalten in CSV- und JSON-Dateien und überträgt nur das Ergebnis.
@ DP-203 Frage 85

? Ordnerstruktur für einen ADLS-Gen2-Container mit Daten aus drei Jahren: Partition Elimination für serverlose SQL-Pools, schneller Abruf der Daten des aktuellen Monats, einfache Sicherheitsverwaltung nach Abteilung. Welche Struktur?
* \Department\DataSource\YYYY\MM\DataFile_YYYYMMDD.parquet
- \DataSource\Department\YYYYMM\DataFile_YYYYMMDD.parquet
- \DD\MM\YYYY\Department\DataSource\DataFile_DDMMYY.parquet
- \YYYY\MM\DD\Department\DataSource\DataFile_YYYYMMDD.parquet
! Abteilung ganz oben (ACLs einmal je Abteilung), Jahr/Monat als eigene Ebenen darunter (Partition Elimination über den Pfad).
@ DP-203 Frage 203

? In ADLS Gen2 sollen Workloads Filterprädikate und Spaltenprojektionen schon beim Lesen vom Datenträger anwenden können. Welche ZWEI Aktionen?
* den Azure-Storage-Ressourcenanbieter erneut registrieren
- eine Speicherrichtlinie für einen Container erstellen
- den Ressourcenanbieter Microsoft Data Lake Store erneut registrieren
- eine Speicherrichtlinie mit Containerpräfixfilter erstellen
* das Feature Abfragebeschleunigung (Query Acceleration) registrieren
! Query Acceleration: Feature registrieren (Register-AzProviderFeature) und danach den Ressourcenanbieter Microsoft.Storage neu registrieren. Community gespalten (DE 63 %).
@ DP-203 Frage 327

? Für container1 in account1 (ADLS Gen2) sollen Lebenszyklusregeln Blobs abhängig vom letzten Zugriff zwischen Zugriffsebenen verschieben. Was tun Sie zuerst?
- Objektreplikation konfigurieren
- eine Azure-Anwendung erstellen
* die Nachverfolgung der Zugriffszeit (Access Time Tracking) aktivieren
- den hierarchischen Namespace aktivieren
! Bedingungen wie daysAfterLastAccessTimeGreaterThan funktionieren nur mit aktivierter Last-Access-Time-Nachverfolgung.
@ DP-203 Frage 334

## Zuordnen

### DP-203 Frage 10 (Hotspot): ADLS-Gen2-Archivierung – neue Daten heiß; Daten > 5 Jahre selten, aber innerhalb 1 Sekunde verfügbar; Daten > 7 Jahre nie mehr gelesen, aber billigst aufbewahren. Kosten minimieren.
- Daten älter als 5 Jahre => In die kalte Ebene (Cool) verschieben
- Daten älter als 7 Jahre => In die Archivebene (Archive) verschieben

### DP-203 Frage 29 (Hotspot): Lebenszyklusrichtlinie „contosorule“ – version.delete nach 60 Tagen seit Erstellung, baseBlob.tierToCool nach 30 Tagen seit Änderung, Filter blobTypes = blockBlob, prefixMatch = "container1/contoso".
- Was passiert mit den Dateien nach 30 Tagen? => Sie werden in die kalte Ebene (Cool) verschoben
- Für welche Datei gilt die Richtlinie? => container1/contoso.csv (Präfix beginnt mit Containername + „contoso“)

### DP-203 Frage 31 (Hotspot): account1 speichert Anwendungsprotokolle (Aufbewahrung 360 Tage) und Infrastrukturprotokolle (60 Tage); während der Aufbewahrung kein Zugriff. Automatisch löschen und Kosten minimieren.
- Speicherkosten minimieren => Infrastrukturprotokolle in Cool, Anwendungsprotokolle in Archive (Archive hat 180 Tage Mindestdauer)
- Protokolle automatisch löschen => Lebenszyklusverwaltungsregeln von Azure Blob Storage

### DP-203 Frage 48 (Hotspot): Petabytes medizinischer Bilddaten – erste Woche häufiger Zugriff; nach einem Monat selten, aber innerhalb 30 Sekunden verfügbar; nach einem Jahr selten, aber innerhalb 5 Minuten verfügbar. Kosten minimieren.
- Erste Woche => Hot (heiß)
- Nach einem Monat => Cool (kalt)
- Nach einem Jahr => Cool (kalt) – Archive braucht Stunden zur Rehydrierung

### DP-203 Frage 57 (Hotspot): ADLS-Gen2-Archivierung – Daten älter als 5 Jahre selten genutzt, aber innerhalb 1 Sekunde verfügbar; Daten älter als 7 Jahre nie mehr genutzt; Kosten minimieren.
- Daten älter als 5 Jahre => In die kalte Ebene (Cool) verschieben
- Daten älter als 7 Jahre => In die Archivebene (Archive) verschieben

### DP-203 Frage 58 (Hotspot): Neues ADLS-Gen2-Konto – höchstmögliche Datenresilienz, Inhalte sollen für Schreibvorgänge verfügbar bleiben, wenn das primäre Rechenzentrum ausfällt. (Antwortbild fehlt in der Quelle; Lösung nach Community-Diskussion)
- Replikationsmechanismus => Geozonenredundanter Speicher mit Lesezugriff (RA-GZRS)
- Failoverprozess => vom Kunden manuell ausgelöstes Failover (Customer-managed failover)

### DP-203 Frage 80 (Hotspot): Data-Lake-Entwicklungsumgebung in ADLS Gen2 – Lese-/Schreibzugriff muss beim Ausfall einer Verfügbarkeitszone erhalten bleiben, Daten mit letzter Änderung vor > 2 Jahren automatisch löschen, Kosten minimieren.
- Speicherredundanz => Zonenredundanter Speicher (ZRS)
- Datenlöschung => Lebenszyklusverwaltungsrichtlinie (Lifecycle management policy)

### DP-203 Frage 81 (Hotspot): Personal-Daten (HR) werden nach Erstverarbeitung 7 Jahre aufbewahrt und selten abgerufen; Daten der Betriebsabteilung (Operations) in den ersten 6 Monaten häufig, danach einmal monatlich genutzt. Speicherkosten minimieren.
- HR => Nach einem Tag ins Archiv, nach 2.555 Tagen löschen
- Operations => Nach 180 Tagen in die kalte Ebene (Cool)

### DP-203 Frage 167 (Drag & Drop): Telemetrie von 25 Mio. Geräten in sieben Regionen (JSON über Event Hubs, jede Minute). Data Engineers jeder Region bauen Pipelines nur für ihre Region; Verarbeitung mindestens alle 15 Minuten für serverlose SQL-Pools. Ordnerstruktur `[1]/[2]/[3].json`
- [1] => {regionID}/raw
- [2] => {YYYY}/{MM}/{DD}/{HH}/{mm}
- [3] => {deviceID}

### DP-203 Frage 214 (Hotspot): Ein Blob-Ordner enthält 120.000 Dateien mit je 62 Spalten, täglich kommen 1.500 Dateien hinzu. Fünf Spalten jeder neuen Datei sollen inkrementell in Synapse geladen werden – Ladedauer minimieren.
- Speicherung => Zeitscheiben-Partitionierung in den Ordnern (Timeslice partitioning)
- Format => Apache Parquet

### DP-203 Frage 278 (Hotspot): Ein ADLS-Gen2-Premium-Konto – Blobs älter als 365 Tage löschen, Verwaltungsaufwand und Kosten minimieren. (Die Sammlung nennt die Archive-Ebene – Premium-Konten unterstützen jedoch keine Zugriffsebenen; Community-Lösung unten)
- Kosten minimieren => Lokal redundanter Speicher (LRS)
- Blobs löschen => Azure-Storage-Lebenszyklusverwaltung

### DP-203 Frage 279 (Hotspot): Petabytes Kennzeichenfotos in ADLS Gen2 (ZRS) – erste 30 Tage mehrmals täglich, SLA 99,9 %; nach 90 Tagen selten, aber in 30 Sekunden verfügbar; nach 365 Tagen selten, aber in 5 Minuten verfügbar. Kosten minimieren.
- Erste 30 Tage => Hot
- Nach 90 Tagen => Cool
- Nach 365 Tagen => Cool (Archive braucht Stunden zur Rehydrierung)
