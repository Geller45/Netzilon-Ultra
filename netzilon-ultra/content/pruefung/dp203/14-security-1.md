---
id: pr-dp203-security-1
bereich: Prüfung
block: DP-203
kapitel: DP-203 Azure Data Engineer – Prüfungsfragen
titel: DP-203 – Sicherheit – RBAC/ACL, Maskierung, RLS/CLS, TDE, Purview (Teil 1/2)
stufe: Profi
typ: fragen
pruefungen: [DP-203]
fach: SQL / Admin
quellen: [DE_A_ohne_D_1_bis_370.pdf, T1_-_1_bis_40_-_Lösung_und_Kommentare.pdf, T1_-_41_bis_80_-_Lösung_und_Kommentare.pdf, T1_-_81_bis_120_-_Lösung_und_Kommentare.pdf, T1_-_121_bis_140_-_Lösung_und_Kommentare.pdf, T2_-_141_bis_160_-_Lösung_und_Kommentare.pdf, T2_-_161_bis_180_-_Lösung_und_Kommentare.pdf, T2_-_181_bis_200_-_Lösung_und_Kommentare.pdf, T2_-_201_bis_240_-_Lösung_und_Kommentare.pdf, T2_-_241_bis_280_-_Lösung_und_Kommentare.pdf, 1_bis_40.pdf, 41_bis_80.pdf, 81_bis_120.pdf, 121_bis_160.pdf, 161_bis_200.pdf, 201_bis_240.pdf, 241_bis_280.pdf, 281_bis_320.pdf, 320_bis_370.pdf, 02d_Data_Engineering_-_SQL_Beispiele_und_Prüfungsfragen.pdf, 03d_Data_Engineering_-_Prüfungsfragen.pdf]
verweise: []
---

## Quiz

? Ein ADLS-Gen2-Konto ist nur über das VNet VNET1 erreichbar. Ein Synapse-SQL-Pool soll stündlich Verkaufsdaten daraus laden. Alle Vertriebsmitarbeiter sind in der Azure-AD-Gruppe „Sales“, der Zugriff auf die Dateien ist per POSIX-ACLs an diese Gruppe vergeben. Welche DREI Aktionen führen Sie aus?
* Die verwaltete Identität zur Gruppe „Sales“ hinzufügen
* Die verwaltete Identität als Anmeldeinformation für das Laden verwenden
- Eine Shared Access Signature (SAS) erstellen
- Ihr eigenes Azure-AD-Konto zur Gruppe „Sales“ hinzufügen
- Die SAS als Anmeldeinformation für das Laden verwenden
* Eine verwaltete Identität erstellen
! Bei einem per VNet geschützten Speicherkonto muss eine verwaltete Identität (Managed Identity) verwendet werden; sie wird erstellt, in die Gruppe mit den ACL-Rechten aufgenommen und als Credential beim Laden (COPY/PolyBase) genutzt.
@ DP-203 Frage 13

? Ein Synapse-Arbeitsbereich soll eine doppelte Verschlüsselung aller ruhenden Daten erhalten. Welche ZWEI Komponenten gehören in die Empfehlung?
- ein X.509-Zertifikat
* ein RSA-Schlüssel
- ein VNet mit NSG
- eine Azure-Policy-Initiative
* ein Azure Key Vault mit aktiviertem Löschschutz (Purge Protection)
! Die zweite Verschlüsselungsschicht nutzt einen kundenseitig verwalteten RSA-Schlüssel (2048/3072) aus einem Key Vault mit Soft Delete und Purge Protection.
@ DP-203 Frage 196

? Eine Data Factory ist mit einem Microsoft-Purview-Konto verbunden und dort registriert. Nach einer Pipeline-Änderung soll die aktualisierte Herkunft (Lineage) in Purview verfügbar sein. Was tun Sie zuerst?
- das Purview-Konto von der Data Factory trennen
* die Pipeline ausführen
- eine Azure-DevOps-Buildpipeline ausführen
- die Ressource im Purview-Portal suchen
! ADF meldet Lineage an Purview erst bei der Ausführung einer Aktivität (z. B. Copy, Data Flow).
@ DP-203 Frage 211

? Die Herkunftsansicht einer CSV-Datei destfile.csv in Purview zeigt eine Copy-Aktivität („Updated … by Azure Data Factory pipeline“). Wie werden die Lineage-Daten befüllt?
- manuell
- durch Scannen von Datenspeichern
* durch Ausführen einer Data-Factory-Pipeline
! Scans erfassen Schema/Metadaten der Assets; die Lineage zwischen Quelle und Ziel liefert die ausgeführte ADF-Pipeline.
@ DP-203 Frage 212

? MP1 (Purview) scannt storage1; DF1 ist mit MP1 verbunden und enthält das Dataset DS1, das auf eine Datei in storage1 zeigt. Wo können Sie Schema- und Herkunftsinformationen zu den Daten von DS1 in MP1 finden? (ZWEI Antworten, jede eine vollständige Lösung)
* die Suchleiste im Microsoft-Purview-Governanceportal
- den Storage-Browser von storage1 im Azure-Portal
- die Suchleiste im Azure-Portal
* die Suchleiste in Azure Data Factory Studio
! Ist ADF mit Purview verbunden, durchsucht die Suchleiste in ADF Studio auch den Purview-Katalog. Die Sammlung nennt AB, die Community (81 %) AD.
@ DP-203 Frage 213

? Sie durchsuchen den Microsoft-Purview-Datenkatalog nach Assets, deren Eigenschaft assetType Table oder View ist. Welche Abfrage?
- assetType IN ('Table', 'View')
* assetType:Table OR assetType:View
- assetType = (Table OR View)
- assetType:(Table OR View)
! Purview-Suchsyntax: `Eigenschaft:Wert` kombiniert mit OR/AND.
@ DP-203 Frage 247

? Für einen dedizierten SQL-Pool soll schnell erkennbar sein, welche Abfragen vertrauliche Informationen (laut Datenschutzrichtlinien) zurückgegeben haben und welche Benutzer sie ausgeführt haben. Welche ZWEI Komponenten?
* Vertraulichkeitsbezeichnungen (Sensitivity Labels) auf den betroffenen Spalten
- Ressourcen-Tags für Datenbanken mit vertraulichen Informationen
* Überwachungsprotokolle (Auditing), die an einen Log-Analytics-Arbeitsbereich gesendet werden
- dynamische Datenmaskierung für die betroffenen Spalten
! Data Discovery & Classification versieht Spalten mit Labels; das Audit-Log enthält dann im Feld data_sensitivity_information, welche klassifizierten Daten eine Abfrage zurückgegeben hat – inklusive Benutzer.
@ DP-203 Frage 250

? Eine Tabelle Customers im Synapse-Data-Warehouse enthält Kreditkarteninformationen. Vertriebsmitarbeiter sollen alle Einträge sehen, die Kreditkartendaten aber weder sehen noch ableiten können. Was empfehlen Sie?
- Datenmaskierung
- Always Encrypted
* Sicherheit auf Spaltenebene (Column-Level Security)
- Sicherheit auf Zeilenebene
! Column-Level Security (GRANT/DENY auf Spalten) verhindert jeden Zugriff auf die Spalte. Bei dynamischer Maskierung könnten Werte über WHERE-Filter erraten (abgeleitet) werden.
@ DP-203 Frage 251

? Projektmitglieder sollen per RBAC die Azure-Data-Lake-Storage-Ressourcen verwalten können. Welche DREI Aktionen führen Sie aus?
* Sicherheitsgruppen in Azure AD (Entra ID) anlegen und Projektmitglieder hinzufügen
- Endbenutzerauthentifizierung für das Data-Lake-Konto konfigurieren
* die Azure-AD-Sicherheitsgruppen dem Data-Lake-Konto zuweisen
- Dienst-zu-Dienst-Authentifizierung konfigurieren
* Zugriffssteuerungslisten (ACLs) für das Data-Lake-Konto konfigurieren
! Gruppen statt Einzelpersonen berechtigen: Gruppe anlegen, per RBAC am Konto zuweisen und feingranular per ACL auf Ordner/Dateien berechtigen.
@ DP-203 Frage 252

? Die Data Factory V2 Df1 enthält einen verknüpften Dienst. Df1 soll mit dem Schlüssel key1 aus dem Key Vault vault1 verschlüsselt werden (Customer-managed Key). Was tun Sie zuerst?
- eine private Endpunktverbindung zu vault1 hinzufügen
- Azure RBAC für vault1 aktivieren
* den verknüpften Dienst aus Df1 entfernen
- eine selbstgehostete Integration Runtime erstellen
! Ein kundenseitig verwalteter Schlüssel kann nur für eine LEERE Data Factory (ohne Ressourcen wie verknüpfte Dienste) aktiviert werden.
@ DP-203 Frage 253

? Für einen dedizierten SQL-Pool soll der Zugriff auf personenbezogene Daten (PII) überwacht werden können. Was nehmen Sie in die Lösung auf?
- Sicherheit auf Spaltenebene
- dynamische Datenmaskierung
- Sicherheit auf Zeilenebene
* Vertraulichkeitsklassifizierungen (Sensitivity Classifications)
! Data Discovery & Classification markiert PII-Spalten; das Auditing protokolliert dann den Zugriff auf diese klassifizierten Daten.
@ DP-203 Frage 254

? Gruppen: Executives (kein Zugriff auf sensible Daten), Analysts (Zugriff auf sensible Daten der eigenen Region), Engineers (Zugriff auf alle numerischen sensiblen Daten). Sensibel je Region: RegionA Finanz+PII, RegionB Finanz+PII+Medizin, RegionC Finanz+Medizin. Tabellen Patients je Region mit CardOnFile (Finanz), Height (Medizin, numerisch, cm), ContactEmail (PII). Welche Aussage zur dynamischen Datenmaskierung trifft zu?
- Analysts in RegionA benötigen Maskierungsregeln für [Patients_RegionA].
- Engineers in RegionC benötigen eine Maskierungsregel für [Patients_RegionA].[Height].
- Engineers in RegionB benötigen eine Maskierungsregel für [Patients_RegionB].[Height].
* Keine der drei Aussagen trifft zu.
! Analysts sehen die sensiblen Daten ihrer eigenen Region (keine Maske nötig); Height ist numerisch und Engineers dürfen alle numerischen sensiblen Daten sehen (in RegionA ist Height zudem gar nicht sensibel). Lösung: Nein / Nein / Nein.
@ DP-203 Frage 256

? Die Daten in einem Synapse-Data-Warehouse sollen im Ruhezustand verschlüsselt sein. Was aktivieren Sie?
- Advanced Data Security
* Transparent Data Encryption (TDE)
- „Sichere Übertragung erforderlich“
- dynamische Datenmaskierung
! TDE verschlüsselt Datenbank, Backups und Logs im Ruhezustand. Sichere Übertragung betrifft Daten während der Übertragung (in transit).
@ DP-203 Frage 258

? Ein dedizierter SQL-Pool dient mehreren Unternehmen; Benutzer jedes Unternehmens sollen nur die Daten ihres Unternehmens sehen. Welche ZWEI Objekte gehören in die Lösung?
* eine Sicherheitsrichtlinie (Security Policy)
- eine benutzerdefinierte RBAC-Rolle
* eine Prädikatfunktion (Inline-Tabellenwertfunktion)
- ein Spaltenverschlüsselungsschlüssel
- asymmetrische Schlüssel
! Row-Level Security = Prädikatfunktion (Filterlogik) + `CREATE SECURITY POLICY`, die sie an die Tabelle bindet. Die Sammlung nennt AB, die Community (52 %) AC.
@ DP-203 Frage 262

? In dbo.Customers (SQL-Pool in Synapse) sollen Benutzer ohne Administratorrechte die Spalte Email nur im Format aXXX@XXXX.com sehen. Was tun Sie?
* in SQL Server Management Studio eine E-Mail-Maske für die Spalte Email festlegen
- im Azure-Portal eine Maske für die Spalte Email festlegen
- in SSMS SELECT auf alle Spalten außer Email erteilen
- im Azure-Portal die Klassifizierung „Vertraulich“ für Email festlegen
! Dynamische Datenmaskierung mit der Funktion email(): `ALTER TABLE dbo.Customers ALTER COLUMN Email ADD MASKED WITH (FUNCTION = 'email()')` – zeigt den ersten Buchstaben und XXX@XXXX.com. Community 66 % A, 34 % B (das Portal bietet für Synapse-Pools keine Masken-UI).
@ DP-203 Frage 263

? Das ADLS-Gen2-Konto adls2 ist durch ein virtuelles Netzwerk geschützt. Ein SQL-Pool in Synapse nutzt adls2 als Quelle. Womit authentifizieren Sie sich bei adls2?
- einem Azure-AD-Benutzer
- einem gemeinsam genutzten Schlüssel (Shared Key)
- einer Shared Access Signature (SAS)
* einer verwalteten Identität
! Ist das Speicherkonto an ein VNet gebunden, ist die Authentifizierung per Managed Identity erforderlich.
@ DP-203 Frage 264

## Reihenfolge

### DP-203 Frage 248 (Drag & Drop): Die Azure-AD-Gruppe Group1 soll Lesezugriff auf alle Tabellen und Sichten in schema1 des dedizierten SQL-Pools dw1 erhalten – nach dem Prinzip der geringsten Rechte. Reihenfolge der drei Aktionen?
1. In dw1 einen Datenbankbenutzer für Group1 mit `CREATE USER … FROM EXTERNAL PROVIDER` anlegen
2. Datenbankrolle Role1 erstellen und ihr SELECT auf schema1 erteilen
3. Role1 dem Datenbankbenutzer von Group1 zuweisen

### DP-203 Frage 257 (Drag & Drop): TDE für Pool1 auf Server1 mit dem kundenseitig verwalteten Schlüssel key1. Reihenfolge der fünf Aktionen?
1. Server1 eine verwaltete Identität zuweisen
2. Azure Key Vault erstellen und der verwalteten Identität Berechtigungen erteilen
3. key1 zum Key Vault hinzufügen
4. key1 als TDE-Schutzvorrichtung (TDE Protector) für Server1 konfigurieren
5. TDE für Pool1 aktivieren

## Zuordnen

### DP-203 Frage 14 (Hotspot): Dynamische Datenmaskierung in DimCustomer – BirthDate (date, default()), Gender (nvarchar, default()), EmailAddress (email()), YearlyIncome (money, default()). User1 = Server admin, User2 = db_datareader; nur User1 darf unmaskiert lesen. Was wird zurückgegeben?
- User2 fragt YearlyIncome ab => 0 (default() maskiert numerische Typen wie money mit 0)
- User1 fragt BirthDate ab => die in der Datenbank gespeicherten Werte (Administratoren sind von der Maskierung ausgenommen)

### DP-203 Frage 92 (Drag & Drop): User1 soll alle Dateien in container1/folder1 (account1, ADLS Gen2) auflisten und lesen können – nach dem Prinzip der geringsten Rechte. Welche ACL je Ordner?
- container1/ => Execute (nur Durchlaufen)
- container1/folder1 => Read and Execute (Auflisten + Lesen)

### DP-203 Frage 242 (Hotspot): Pool1 enthält die externe Tabelle Sales (eine Zeile je Verkauf inkl. Verkäufername). Mit Row-Level Security sollen Verkäufer nur ihre eigenen Verkäufe sehen.
- Erstellen => eine Sicherheitsrichtlinie (Security Policy) für Sales
- Zeilenzugriff einschränken mit => einer Inline-Tabellenwertfunktion (Prädikatfunktion)

### DP-203 Frage 249 (Hotspot): TDE-Lösung für Server1 (dedizierter Pool Pool1): Nutzung der Verschlüsselungsschlüssel nachverfolgen und Client-Zugriff erhalten, falls ein Rechenzentrumsausfall die Verfügbarkeit der Schlüssel beeinträchtigt.
- Schlüsselnutzung nachverfolgen => TDE mit kundenseitig verwalteten Schlüsseln (Customer-managed Keys im Key Vault, mit Protokollierung)
- Client-Zugriff bei Rechenzentrumsausfall erhalten => Azure Key Vaults in zwei Azure-Regionen erstellen und konfigurieren

### DP-203 Frage 255 (Hotspot): Eine Data Factory soll Daten aus jedem Ordner im Container DataLake1 lesen und schreiben – Risiko unbefugten Zugriffs minimieren, geringste Rechte, wenig Wartung.
- Verwenden Sie => Microsoft Entra ID (Azure AD)
- zur Authentifizierung mithilfe => einer verwalteten Identität (Managed Identity)

### DP-203 Frage 265 (Hotspot): Der Zugriff der Azure-AD-Gruppe Group1 auf bestimmte Spalten und Zeilen einer Tabelle in Pool1 soll gesteuert werden. Welche T-SQL-Befehle?
- Spaltenzugriff steuern => GRANT (Column-Level Security)
- Zeilenzugriff steuern => CREATE SECURITY POLICY (Row-Level Security mit Prädikatfunktion)
