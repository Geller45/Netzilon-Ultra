---
id: pr-dp203-security-2
bereich: Prüfung
block: DP-203
kapitel: DP-203 Azure Data Engineer – Prüfungsfragen
titel: DP-203 – Sicherheit – RBAC/ACL, Maskierung, RLS/CLS, TDE, Purview (Teil 2/2)
stufe: Profi
typ: fragen
pruefungen: [DP-203]
fach: SQL / Admin
quellen: [DE_A_ohne_D_1_bis_370.pdf, T1_-_1_bis_40_-_Lösung_und_Kommentare.pdf, T1_-_41_bis_80_-_Lösung_und_Kommentare.pdf, T1_-_81_bis_120_-_Lösung_und_Kommentare.pdf, T1_-_121_bis_140_-_Lösung_und_Kommentare.pdf, T2_-_141_bis_160_-_Lösung_und_Kommentare.pdf, T2_-_161_bis_180_-_Lösung_und_Kommentare.pdf, T2_-_181_bis_200_-_Lösung_und_Kommentare.pdf, T2_-_201_bis_240_-_Lösung_und_Kommentare.pdf, T2_-_241_bis_280_-_Lösung_und_Kommentare.pdf, 1_bis_40.pdf, 41_bis_80.pdf, 81_bis_120.pdf, 121_bis_160.pdf, 161_bis_200.pdf, 201_bis_240.pdf, 241_bis_280.pdf, 281_bis_320.pdf, 320_bis_370.pdf, 02d_Data_Engineering_-_SQL_Beispiele_und_Prüfungsfragen.pdf, 03d_Data_Engineering_-_Prüfungsfragen.pdf]
verweise: []
---

## Quiz

? Eine Synapse-Lösung stellt eine Abfrageschnittstelle für Daten in einem Speicherkonto bereit, das nur über ein virtuelles Netzwerk erreichbar ist. Welchen Authentifizierungsmechanismus empfehlen Sie?
* eine verwaltete Identität
- anonymer öffentlicher Lesezugriff
- ein gemeinsam genutzter Schlüssel
! Bei VNet-geschützten Speicherkonten muss Synapse per Managed Identity zugreifen (vertrauenswürdige Microsoft-Dienste).
@ DP-203 Frage 267

? Eine Anwendung nutzt ADLS Gen2. Einer bestimmten Anwendung sollen für einen begrenzten Zeitraum Berechtigungen erteilt werden. Was empfehlen Sie?
- Rollenzuweisungen
* Shared Access Signatures (SAS)
- Azure-AD-Identitäten
- Kontoschlüssel
! Eine SAS legt Ressourcen, Rechte und Gültigkeitsdauer fest – ideal für zeitlich begrenzten, delegierten Zugriff.
@ DP-203 Frage 268

? In der Tabelle Contacts (dedizierter SQL-Pool) sollen Benutzer einer bestimmten Rolle in der Spalte Phone nur die letzten vier Ziffern sehen. Was nehmen Sie in die Lösung auf?
- Tabellenpartitionen
- einen Standardwert
- Sicherheit auf Zeilenebene
- Spaltenverschlüsselung
* dynamische Datenmaskierung
! Mit der Maskierungsfunktion partial() zeigt man nur Teile an, z. B. `MASKED WITH (FUNCTION = 'partial(0,"XXX-XXX-",4)')`.
@ DP-203 Frage 270

? Ein dedizierter SQL-Pool soll Betrugserkennung im E-Commerce unterstützen. Benutzer sollen verdächtige Transaktionen identifizieren und Kreditkarten als Merkmal in Modellen nutzen können, die tatsächlichen Kreditkartennummern aber NICHT sehen. Was empfehlen Sie?
- Transparent Data Encryption (TDE)
- Sicherheit auf Zeilenebene (RLS)
* Verschlüsselung auf Spaltenebene
- Azure-AD-Passthrough-Authentifizierung
! Verschlüsselte Spaltenwerte (deterministisch) sind als Merkmal vergleichbar/gruppierbar, ohne den Klartext preiszugeben. TDE schützt nur ruhende Dateien, nicht vor berechtigten Lesern.
@ DP-203 Frage 271

? ServicePrincipal1 hat die ACLs container1: Access-Execute, Folder1: Access-Execute, Folder2: Access-Read. Er soll untergeordnete Elemente durchlaufen und Dateien lesen können, die in Folder2 erstellt werden – mit geringsten Rechten. Welche ZWEI Berechtigungen erteilen Sie für Folder2?
- Access – Read
- Access – Write
* Access – Execute
* Default – Read
- Default – Write
- Default – Execute
! Execute auf Folder2 (Access-ACL) erlaubt das Durchlaufen des Ordners; die Default-ACL „Read“ vererbt Leserechte an neu erstellte Dateien. Die Sammlung nennt DF, die Community ist gespalten (CD 47 %, DF 34 %, AF 19 %).
@ DP-203 Frage 272

? Die Daten in einem dedizierten SQL-Pool sollen im Ruhezustand verschlüsselt werden, ohne dass Anwendungen geändert werden müssen. Was tun Sie?
- Verschlüsselung ruhender Daten für das ADLS-Gen2-Konto aktivieren
* Transparent Data Encryption (TDE) für den Pool aktivieren
- doppelte Verschlüsselung mit kundenseitig verwaltetem Schlüssel für den Arbeitsbereich
- einen Key Vault erstellen und Zugriff auf den Pool gewähren
! TDE ver- und entschlüsselt transparent auf Speicherebene (inkl. Backups und Logs) – Anwendungen merken nichts.
@ DP-203 Frage 275

? Die Tabelle Sales in Pool1 nutzt RLS mit dem Prädikat `CREATE FUNCTION Security.fn_securitypredicate(@SalesRep AS sysname) RETURNS TABLE WITH SCHEMABINDING AS RETURN SELECT 1 AS fn_securitypredicate_result WHERE @SalesRep = USER_NAME() OR USER_NAME() = 'Manager';`. SalesUser1 hat db_datareader. Welche Zeilen sieht SalesUser1?
- nur Zeilen, deren Spalte User_Name SalesUser1 ist
- alle Zeilen
- nur Zeilen, deren Spalte SalesRep „Manager“ ist
* nur Zeilen, deren Spalte SalesRep SalesUser1 ist
! Das Prädikat lässt eine Zeile durch, wenn SalesRep dem aktuellen Benutzernamen entspricht – oder wenn der Benutzer „Manager“ heißt (dann alle Zeilen).
@ DP-203 Frage 281

? Die Entra-Gruppe Group1 soll Lesezugriff auf container1 im Konto myaccount1 (mit container1 und container2) erhalten – geringste Rechte. Welche Rolle weisen Sie zu?
- Storage Table Data Reader für myaccount1
* Storage Blob Data Reader für container1
- Storage Blob Data Reader für myaccount1
- Storage Table Data Reader für container1
! Blob-Datenrolle auf dem engsten Bereich (Container) statt auf dem ganzen Konto; Table-Rollen betreffen Azure Tables, nicht Blobs/ADLS.
@ DP-203 Frage 283

? Eine Gruppe von Benutzern soll die E-Mail-Adressen in dbo.Users (dedizierter SQL-Pool) nicht lesen können. Was verwenden Sie?
* Sicherheit auf Spaltenebene
- Sicherheit auf Zeilenebene
- Transparent Data Encryption
- dynamische Datenmaskierung
! Column-Level Security (GRANT SELECT nur auf erlaubte Spalten) verhindert das Lesen der Spalte vollständig; Maskierung zeigt nur verfremdete Werte.
@ DP-203 Frage 284

? Mitglieder der Gruppe Group1 sollen CSV-Dateien aus storage1 per OPENROWSET im serverlosen SQL-Pool von ws1 lesen und dabei die datenbankweit gültige Anmeldeinformation credential1 verwenden – geringste Rechte. Welche Berechtigung erteilen Sie?
- EXECUTE
- CONTROL
* REFERENCES
- SELECT
! `GRANT REFERENCES ON DATABASE SCOPED CREDENTIAL::credential1 TO [Group1]` erlaubt die Nutzung der Credential in OPENROWSET/Datenquellen. Die Sammlung nennt A, die Community (68 %) C.
@ DP-203 Frage 287

? Die Entra-Gruppe DepartmentA soll in storage1 alle Dateien in fs1 lesen, schreiben und auflisten können, aber keinen Zugriff auf fs2 haben – geringste Rechte. Welche Rolle?
- Mitwirkender für fs1
- Storage Blob Data Owner für fs1
- Storage Blob Data Contributor für storage1
* Storage Blob Data Contributor für fs1
! Data Contributor (Lesen/Schreiben/Löschen von Daten) im Bereich des Containers fs1. „Mitwirkender“ ist eine Verwaltungsrolle ohne Datenzugriff, Owner zu viel, Kontoebene würde fs2 einschließen.
@ DP-203 Frage 290

? In pool1 soll monatlich geprüft werden, welche SQL-Anweisungen vertrauliche Daten betreffen – mit minimalem Verwaltungsaufwand. Was nehmen Sie auf?
- Workload Management
* Vertraulichkeitsbezeichnungen (Sensitivity Labels)
- dynamische Datenmaskierung
- Microsoft Defender für SQL
! Klassifizierte Spalten erscheinen im Audit-Log (data_sensitivity_information) – so lassen sich Zugriffe auf vertrauliche Daten auswerten.
@ DP-203 Frage 343

? User1 soll die Synapse-Datenbankvorlagen aus dem Katalog (Gallery) prüfen können – mit geringsten Rechten. Welche Rolle?
- Storage Blob Data Contributor
- Synapse Administrator
- Synapse Contributor
* Synapse User
! Synapse User erlaubt das Anzeigen/Verwenden von Arbeitsbereichsartefakten wie der Vorlagengalerie. Die Sammlung nennt C, die Community (100 %) D.
@ DP-203 Frage 347

## Zuordnen

### DP-203 Frage 266 (Hotspot): Ein Databricks-Cluster soll sich per Azure-AD-Integration automatisch mit ADLS Gen2 verbinden.
- Tarif => Premium
- Zu aktivierende erweiterte Option => Azure Data Lake Storage Credential Passthrough

### DP-203 Frage 269 (Hotspot): Data Scientists und Engineers fragen ADLS-Gen2-Daten in interaktiven Databricks-Notebooks ab; jeder darf nur die Ordner seiner Projekte sehen. Verwaltungs- und Entwicklungsaufwand minimieren. (Laut Sammlung; ein Teil der Community wählt für beide Azure-AD-Passthrough)
- Databricks => Persönliche Zugriffstoken (Personal Access Tokens)
- Data Lake Storage => Azure-AD-Credential-Passthrough

### DP-203 Frage 273 (Hotspot): Authentifizierungslösung für Pool1 (Azure-AD-Hybridmandant) mit Multi-Faktor-Authentifizierung und Authentifizierung auf Datenbankebene.
- MFA => Azure-AD-Authentifizierung (Microsoft Entra ID)
- Authentifizierung auf Datenbankebene => Benutzer eigenständiger Datenbanken (Contained Database Users)

### DP-203 Frage 276 (Drag & Drop): User1 (Rolle „Storage Blob Data Reader“ auf storage1) soll Daten an container1/directory1/File1 anhängen können – geringste Rechte per ACL.
- container1 => Execute
- directory1 => Execute
- File1 => Write

### DP-203 Frage 280 (Drag & Drop): Zugriff auf storage1 (ADLS Gen2) – Auflisten/Lesen auf Kontoebene, zusätzliche Rechte auf einzelne Objekte, Authentifizierung über Entra-ID-Sicherheitsprinzipale.
- Berechtigungen auf Speicherkontoebene => Rollen der rollenbasierten Zugriffssteuerung (RBAC)
- Berechtigungen auf Objektebene => Zugriffssteuerungslisten (ACLs)

### DP-203 Frage 282 (Hotspot): User1 (keine RBAC-Rollen auf account1) soll per ACL die Datei container1/Directory1/File1 löschen können – geringste Rechte.
- container1 => --X
- Directory1 => -WX (Löschen erfordert Schreiben + Ausführen auf dem übergeordneten Ordner)
- File1 => --- (auf die Datei selbst sind keine Rechte nötig)

### DP-203 Frage 285 (Hotspot): DB1 im dedizierten SQL-Pool – in Anwendungen sollen von Kreditkartennummern nur die letzten vier Ziffern sichtbar sein; Steuernummern sollen nur für bestimmte Benutzer sichtbar sein.
- Kreditkartennummern => Dynamische Datenmaskierung (partial)
- Steuernummern => Sicherheit auf Spaltenebene (Column-Level Security)

### DP-203 Frage 338 (Hotspot): ws1 mit Spark-Pool sp1 und benutzerzugewiesener verwalteter Identität UAMI1; Spark-Notebooks sollen Geheimnisse aus kv1 mit UAMI1 abrufen.
- Im Azure-Portal => RBAC-Rolle für UAMI1 auf kv1 hinzufügen (z. B. Key Vault Secrets User)
- In Synapse Studio => verknüpften Dienst zu kv1 erstellen

### DP-203 Frage 349 (Hotspot): RLS für Sales.Orders – Vertriebsmitarbeiter sehen nur Zeilen, deren SalesRep ihrem Benutzernamen entspricht: `CREATE FUNCTION Security.tvf_securitypredicate(@SalesRep AS nvarchar(50)) RETURNS TABLE WITH [1] AS RETURN SELECT 1 AS tvf_securitypredicate_result WHERE @SalesRep = USER_NAME(); CREATE SECURITY POLICY SalesFilter [2] ON Sales.Orders WITH (STATE = ON);`
- [1] => SCHEMABINDING
- [2] => ADD FILTER PREDICATE Security.tvf_securitypredicate(SalesRep)

### DP-203 Frage 351 (Hotspot): In sqlpool1 enthält jede Zeile der Tabelle Sales den Benutzernamen eines Vertriebsanalysten; per RLS sollen Analysten nur ihre eigenen Zeilen sehen.
- Zur Konfiguration von RLS erstellen => eine Sicherheitsrichtlinie (Security Policy) für die Tabelle Sales
- Festlegen, welche Zeilen ein Analyst sieht, mit => einer Tabellenwertfunktion (Prädikatfunktion)
