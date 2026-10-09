---
id: pr-dp203-nachtrag-7
bereich: Prüfung
block: DP-203
kapitel: DP-203 Azure Data Engineer – Prüfungsfragen
titel: DP-203 – Nachtrag 7
stufe: Profi
typ: fragen
pruefungen: [DP-203]
fach: SQL / Admin
quellen: [DE_A_ohne_D_1_bis_370.pdf, T1_-_1_bis_40_-_Lösung_und_Kommentare.pdf, T1_-_41_bis_80_-_Lösung_und_Kommentare.pdf, T1_-_81_bis_120_-_Lösung_und_Kommentare.pdf, T1_-_121_bis_140_-_Lösung_und_Kommentare.pdf, T2_-_141_bis_160_-_Lösung_und_Kommentare.pdf, T2_-_161_bis_180_-_Lösung_und_Kommentare.pdf, T2_-_181_bis_200_-_Lösung_und_Kommentare.pdf, T2_-_201_bis_240_-_Lösung_und_Kommentare.pdf, T2_-_241_bis_280_-_Lösung_und_Kommentare.pdf, 1_bis_40.pdf, 41_bis_80.pdf, 81_bis_120.pdf, 121_bis_160.pdf, 161_bis_200.pdf, 201_bis_240.pdf, 241_bis_280.pdf, 281_bis_320.pdf, 320_bis_370.pdf]
verweise: []
---

## Quiz

? Frage 276 (Drag-and-Drop): storage1 (ADLS Gen2), container1/directory1/File1. User1 hat die Azure-Rolle „Storage-Blobdatenleser“ und soll Daten an File1 anhängen können (geringste Rechte). Welche ACL-Berechtigung benötigt User1 auf container1 und directory1?
* Execute (x)
- Read (r)
- Write (w)
- Read und Write
! Zum Durchlaufen der Verzeichnishierarchie genügt auf Container und Verzeichnis die Berechtigung Execute.
@ DP-203 Frage 276

? Frage 276 (Drag-and-Drop): Welche ACL-Berechtigung benötigt User1 auf File1 zum Anhängen von Daten?
- Read
* Write
- Execute
- Read und Execute
! Auf Dateien erlaubt Write (w) das Schreiben oder Anhängen; Lesen erlaubt bereits die Rolle „Blobdatenleser“.
@ DP-203 Frage 276

? Frage 277 (Hotspot): Der Apache-Hive-Katalog des Synapse-Spark-Pools pool1 soll für Azure Databricks freigegeben werden. Zu welchem Dienst erstellen Sie in synapse1 einen verknüpften Dienst?
- Azure Cosmos DB
- Azure Data Lake Storage Gen2
* Azure SQL Database
- Azure Purview
! Ein externer Hive-Metastore wird in einer Azure-SQL-Datenbank gehalten; Synapse und Databricks verwenden dieselbe Metastore-Datenbank.
@ DP-203 Frage 277

? Frage 277 (Hotspot): Wofür konfigurieren Sie pool1 mit dem verknüpften Dienst?
- Ein Azure-Purview-Konto
* Einen (externen) Hive-Metastore
- Einen verwalteten Hive-Metastore-Dienst
- Ein Azure-Key-Vault-Geheimnis
! Der Spark-Pool wird so konfiguriert, dass er den externen Hive-Metastore über den verknüpften Dienst nutzt.
@ DP-203 Frage 277

? Frage 278 (Hotspot): Ein ADLS-Gen2-Premium-Konto: Blobs älter als 365 Tage müssen gelöscht werden, Verwaltungsaufwand und Kosten minimieren. Was minimiert die Kosten?
* Lokal redundanter Speicher (LRS)
- Die Archiv-Zugriffsebene
- Die Cool-Zugriffsebene
- Zonenredundanter Speicher (ZRS)
! Premium-Konten unterstützen nur LRS und ZRS, keine Cool-/Archive-Ebene; LRS ist die günstigste Variante. (Die Quelle nennt die Archivebene, die bei Premium-Konten nicht verfügbar ist.)
@ DP-203 Frage 278

? Frage 278 (Hotspot): Womit löschen Sie Blobs nach 365 Tagen automatisch?
- Azure-Automation-Runbooks
* Azure-Storage-Lebenszyklusverwaltung
- Vorläufiges Löschen (Soft Delete)
- Azure-Data-Factory-Pipelines
! Eine Lifecycle-Regel mit daysAfterModificationGreaterThan 365 löscht Blobs ohne Betriebsaufwand.
@ DP-203 Frage 278

? Frage 279 (Hotspot): Nummernschildfotos (Petabytes) in ZRS: In den ersten 30 Tagen mehrmals täglich Zugriff (SLA 99,9 %). Welche Ebene?
- Archive
- Cool
* Hot
- Premium
! Häufig genutzte Daten gehören in die Hot-Ebene.
@ DP-203 Frage 279

? Frage 279 (Hotspot): Nach 90 Tagen selten genutzt, aber Zugriff innerhalb von 30 Sekunden. Nach 365 Tagen selten genutzt, aber Zugriff innerhalb von fünf Minuten. Welche Ebene jeweils?
- Nach 90 Tagen Archive, nach 365 Tagen Archive
- Nach 90 Tagen Cool, nach 365 Tagen Archive
* Nach 90 Tagen Cool, nach 365 Tagen Cool
- Nach 90 Tagen Hot, nach 365 Tagen Cool
! Cool ist online (sofortiger Zugriff) und günstiger als Hot. Archive scheidet wegen der Wiederherstellungszeit (Stunden) aus.
@ DP-203 Frage 279

? Frage 280 (Drag-and-Drop): Storage-Konto (ADLS Gen2): Auflistungs- und Leserechte auf Speicherkontoebene, zusätzliche Rechte auf einzelnen Objekten, Authentifizierung über Azure-AD-Prinzipale. Was verwenden Sie auf Speicherkontoebene und was auf Objektebene?
* Kontoebene: rollenbasierte Zugriffssteuerung (RBAC-Rollen); Objektebene: Zugriffssteuerungslisten (ACLs)
- Kontoebene: ACLs; Objektebene: RBAC-Rollen
- Kontoebene: Shared Access Signatures; Objektebene: ACLs
- Kontoebene: Shared Account Keys; Objektebene: RBAC-Rollen
! RBAC-Rollen gelten für das ganze Konto/den Container, ACLs fein granular auf Verzeichnisse und Dateien; beide nutzen Azure-AD-Identitäten (SAS und Kontoschlüssel nicht).
@ DP-203 Frage 280

? Frage 282 (Hotspot): User1 (ohne RBAC-Rolle) soll per ACL File1 in Directory1 von container1 löschen können (geringste Rechte). Welche ACL setzen Sie auf container1?
* --x
- -wx
- ---
- rwx
! Auf dem Container genügt Execute zum Durchlaufen.
@ DP-203 Frage 282

? Frage 282 (Hotspot): Welche ACL setzen Sie auf Directory1 und File1?
* Directory1: -wx; File1: ---
- Directory1: --x; File1: -wx
- Directory1: -wx; File1: -wx
- Directory1: ---; File1: -wx
! Zum Löschen einer Datei braucht man Write und Execute auf dem übergeordneten Verzeichnis; auf der Datei selbst ist keine Berechtigung nötig.
@ DP-203 Frage 282

? Frage 285 (Hotspot): DB1 im dedizierten SQL-Pool: Von Kreditkartennummern sollen in Anwendungen nur die letzten vier Ziffern sichtbar sein. Was setzen Sie ein?
- Sicherheit auf Spaltenebene
* Dynamic Data Masking
- Sicherheit auf Zeilenebene (RLS)
- Transparent Data Encryption
! Mit Dynamic Data Masking (Funktion partial) werden Teile von Werten maskiert.
@ DP-203 Frage 285

? Frage 285 (Hotspot): Steuernummern sollen nur für bestimmte Benutzer sichtbar sein. Was setzen Sie ein?
* Sicherheit auf Spaltenebene (Column-level security)
- Sicherheit auf Zeilenebene (RLS)
- Transparent Data Encryption (TDE)
- Dynamic Data Masking
! Per GRANT SELECT auf einzelne Spalten sehen nur berechtigte Benutzer die Spalte.
@ DP-203 Frage 285

? Frage 299 (Hotspot): Für einen Azure-Databricks-Cluster sollen Anwendungsmetriken, Streaming-Abfrageereignisse und Anwendungsprotokolle gesammelt werden. Welche Bibliothek verwenden Sie?
* Azure Databricks Monitoring Library
- Microsoft Azure Management Monitoring Library
- PyTorch
- TensorFlow
! Die Databricks Monitoring Library (GitHub) sendet Metriken und Logs an Log Analytics.
@ DP-203 Frage 299

? Frage 299 (Hotspot): Und welchen Arbeitsbereich?
- Azure Databricks
* Azure Log Analytics
- Azure Machine Learning
- Azure Synapse
! Die Daten werden in einem Log-Analytics-Arbeitsbereich gespeichert und per KQL ausgewertet.
@ DP-203 Frage 299

? Frage 312 (Hotspot): ADF-Pipeline: Aktivitäten Set variable1 und Web1 (Erfolgspfad) führen zu Stored procedure1; Set variable2 hängt am Fehlerpfad. Wie läuft Stored procedure1 ab?
* Stored procedure1 wird nur ausgeführt, wenn Web1 und Set variable1 erfolgreich waren.
- Stored procedure1 wird auch bei Fehlern von Web1 ausgeführt.
- Stored procedure1 wird nur bei Fehlern ausgeführt.
- Stored procedure1 wird immer ausgeführt.
! Mehrere Abhängigkeiten mit „bei Erfolg“ werden mit UND verknüpft: Alle müssen erfolgreich sein.
@ DP-203 Frage 312

? Frage 312 (Hotspot): Web1 schlägt fehl, Set variable2 (Fehlerpfad) ist erfolgreich. Welchen Status hat die Pipeline?
- Abgebrochen (Canceled)
* Fehlgeschlagen (Failed)
- Erfolgreich (Succeeded)
- Wartend
! Die Pipeline gilt als fehlgeschlagen, wenn eine Aktivität ohne Behandlung durch einen Fehlerpfad fehlschlägt bzw. der Erfolgspfad nicht erreicht wird; ein erfolgreicher Fehlerpfad allein macht die Pipeline nicht erfolgreich.
@ DP-203 Frage 312

? Frage 321 (Hotspot): Event Hub retailhub mit 16 Partitionen (Partitionsschlüssel TransactionID); ein Stream-Analytics-Auftrag schreibt Ergebnisse in den Event Hub fraudhub; hochskalierbar und schnellstmöglich. Wie viele Partitionen für die Ausgabe?
- 1
- 8
* 16
- 32
! Ein „embarrassingly parallel“-Auftrag verbindet eine Eingabepartition mit einer Abfrageinstanz und einer Ausgabepartition: gleiche Anzahl (16).
@ DP-203 Frage 321

? Frage 321 (Hotspot): Welchen Partitionsschlüssel verwenden Sie für die Ausgabe?
- Fraud indicator
- Fraud score
- Individual line items
* TransactionID
! Derselbe Partitionsschlüssel wie in der Eingabe (TransactionID) erhält die Parallelität.
@ DP-203 Frage 321

? Frage 331 (Hotspot): Dedizierter Synapse-Pool: Mit welcher DMV überwachen Sie die Datenbank auf Abfragen mit langer Laufzeit?
* sys.dm_pdw_exec_requests
- sys.dm_pdw_sql_requests
- sys.dm_pdw_exec_sessions
- sys.dm_pdw_waits
! sys.dm_pdw_exec_requests zeigt alle aktuellen und kürzlich ausgeführten Abfragen inkl. Dauer.
@ DP-203 Frage 331

? Frage 331 (Hotspot): Mit welcher DMV erkennen Sie, welche Abfragen auf Ressourcen warten?
* sys.dm_pdw_waits
- sys.dm_pdw_lock_waits
- sys.resource_governor_workload_groups
- sys.dm_pdw_exec_sessions
! sys.dm_pdw_waits zeigt Wartezustände (Sperren und Ressourcenwartezeiten) von Anfragen.
@ DP-203 Frage 331

? Frage 338 (Hotspot): Synapse-Arbeitsbereich ws1, Key Vault kv1, benutzerseitig zugewiesene verwaltete Identität UAMI1 (mit ws1 verknüpft), Spark-Pool sp1. Geheimnisse aus kv1 sollen in Notebooks mit UAMI1 abrufbar sein. Was tun Sie im Azure-Portal?
* Eine RBAC-Rolle für kv1 hinzufügen
- Eine RBAC-Rolle für ws1 hinzufügen
- Einen verknüpften Dienst zu kv1 erstellen
- Einen neuen Spark-Pool erstellen
! UAMI1 muss auf dem Key Vault berechtigt werden (z. B. „Key Vault Secrets User“).
@ DP-203 Frage 338

? Frage 338 (Hotspot): Was tun Sie in Synapse Studio?
- Eine RBAC-Rolle für kv1 hinzufügen
- Eine RBAC-Rolle für ws1 hinzufügen
* Einen verknüpften Dienst zu kv1 erstellen
- Eine Pipeline für kv1 erstellen
! In Synapse Studio wird kv1 als verknüpfter Dienst angebunden, damit Notebooks Geheimnisse abrufen können.
@ DP-203 Frage 338

? Frage 349 (Hotspot): RLS für Sales.Orders (Spalte SalesRep): Die Funktion Security.tvf_securitypredicate gibt WHERE @SalesRep = USER_NAME() zurück. Welche Option steht in der WITH-Klausel der Funktion?
- ENCRYPTION
- RETURNS NULL ON NULL INPUT
* SCHEMABINDING
- RECOMPILE
! Prädikatfunktionen für Sicherheitsrichtlinien müssen mit SCHEMABINDING erstellt werden.
@ DP-203 Frage 349

? Frage 349 (Hotspot): Wie lautet die Zeile der Sicherheitsrichtlinie, damit Vertriebsmitarbeiter nur ihre eigenen Zeilen sehen?
- ADD BLOCK PREDICATE Security.tvf_securitypredicate(SalesRep)
- ADD BLOCK PREDICATE tvf_securitypredicate_result
* ADD FILTER PREDICATE Security.tvf_securitypredicate(SalesRep)
- ADD FILTER PREDICATE USER_NAME(SalesRep)
! Ein FILTER PREDICATE blendet nicht passende Zeilen aus (BLOCK PREDICATE verhindert dagegen Schreibvorgänge).
@ DP-203 Frage 349

? Frage 351 (Hotspot): sqlpool1 mit Tabelle Sales1 (Spalte mit dem Analysten-Benutzernamen): Analysten sollen nur ihre Zeilen sehen. Was erstellen Sie?
- Eine materialisierte Sicht in sqlpool1
* Eine Sicherheitsrichtlinie für die Tabelle Sales
- Datenbankweit gültige Anmeldeinformationen in sqlpool1
- Eine Maskierungsregel
! RLS = Sicherheitsrichtlinie mit Filterprädikat.
@ DP-203 Frage 351

? Frage 351 (Hotspot): Womit legen Sie fest, auf welche Zeilen jeder Analyst zugreifen darf?
- Eine Maskierungsregel
* Eine Tabellenwertfunktion
- Das CONTAINS-Prädikat
- Eine Berechtigung DENY
! Die Inline-Tabellenwertfunktion vergleicht die Spalte mit USER_NAME().
@ DP-203 Frage 351
