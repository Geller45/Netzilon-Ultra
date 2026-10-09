---
id: azd-azure-sql
bereich: Azure Data
pruefungen: [DP-203, Schule]
fach: Data Engineering
block: A4
kapitel: Datenbanken in Azure
titel: Azure SQL – VM, Managed Instance, SQL Database, Elastic Pool, MySQL/PostgreSQL, Verbindung mit SSMS
stufe: Fortgeschritten
quellen: [04_Data_Engineering_-_Datenbanken_1.pdf, Workshop_02_-_Erste_Azure_SQL_Datenbank_mit_Beispieldaten.docx, Workshop_03_-_MySQL_und_PostgreSQL.docx, Workshop_04_-_Verbindung_zwischen_einer_Azure_SQL_Datenbank_und_dem_SSMS.docx, Workshop_05_-_Erstellen_einer_Einzeldatenbank.docx]
verweise: [azd-sicherheit, azd-cosmos-db, azd-ressourcengruppen, db-ddl, db-backup-restore]
---

## Profi

### Azure SQL – Sammelbegriff
| Variante | Modell | Merkmale |
|---|---|---|
| **SQL Server auf Azure-VM** | **IaaS** | eigenständige Installation auf VM; volle Kontrolle; einfachste **Komplettmigration** (Lift & Shift); Zusatzkosten und Verwaltungsaufwand für OS/Patches/Backups |
| **Azure SQL Managed Instance (MI)** | **PaaS** | installierte SQL-Server-Instanz, nahezu vollständige Kompatibilität (SQL Agent, Cross-DB-Abfragen, Linked Server); Updates, Backups, Wartung automatisiert; geeignet für **Teilmigration**; Instanzpools für kleine Instanzen; auch **Azure-Arc-fähig** (Hybrid/Kubernetes) |
| **Azure SQL Database** | **PaaS**, cloudnativ | kein eigener SQL Server, nur Kernfunktionen auf **Datenbankebene** (keine Server-Features); minimaler Verwaltungsaufwand, automatische Skalierung/Backups; **Einzeldatenbank** oder **Pool für elastische Datenbanken** |
| Azure SQL Edge | Edge/IoT | der Vollständigkeit halber |
Faustregel: Mehr Kontrolle = mehr Aufwand (VM > MI > Database).

### Einzeldatenbank vs. Elastic Pool
- **Einzeldatenbank (Single Database)**: eigene dedizierte Ressourcen (DTU oder vCore), vorhersehbare Last.
- **Pool für elastische Datenbanken**: mehrere Datenbanken teilen sich Ressourcen und Preis des Pools, Last schwankt und ist unvorhersehbar; nach Nutzung werden Ressourcen frei.
- **Logischer Server**: Container für Datenbanken, bietet Authentifizierung, Firewallregeln, Überwachung, Sicherheitsrichtlinien; Server-Admin bzw. Entra-Admin. `CREATE DATABASE` darf Server-Admin, Entra-Admin oder Mitglied der Rolle **dbmanager** in master.
- Kaufmodelle: **DTU** (gebündelt) oder **vCore**; Computeebenen provisioned oder **serverless** (Auto-Pause); Dienstebenen General Purpose/Business Critical/Hyperscale; Basic/Standard/Premium bei DTU. Zonenredundanz optional; Backup-Redundanz (lokal/zonen/geo).
- Workloadumgebung Entwicklung/Produktion; Beispieldaten **AdventureWorks**, Wide World Importers (Restore/BACPAC).

### Open-Source-Datenbanken in Azure
**Azure Database for MySQL**, **MariaDB**, **PostgreSQL** (Flexible Server): verwaltete relationale Open-Source-DBMS mit unterschiedlichen Spezialisierungen. Workshops: DP-900-Labs für MySQL und PostgreSQL.

### Verbindung und Netzwerk
- **Firewall auf Serverebene**: IP-Regeln, „Azure-Dienste zulassen“, VNet-Regeln, **Private Endpoint**. Eigene Client-IP muss freigegeben werden.
- Port **1433** (TCP), SSMS: Servername `<server>.database.windows.net`, Authentifizierung SQL-Anmeldung oder **Microsoft Entra** (MFA), Datenbank wählen.
- Ad-hoc: **Abfrage-Editor im Azure-Portal** (weniger komfortabel als SSMS).
- **Microsoft Defender für SQL**: optional (im Workshop nicht aktiviert, kostenpflichtig).
- Managed Instance: nur über VNet/privaten Endpunkt; SQL Server auf VM: wie lokal.

### Migration und Betrieb
Datenbank per **BACPAC** importieren/exportieren; Managed Instance unterstützt native RESTORE aus Blob. Backups automatisch (Point-in-Time Restore, Aufbewahrung Standard 7 Tage), Georeplikation/Failover-Gruppen für DR.

## Einfach

**Azure SQL** ist **Microsofts SQL Server in der Cloud**, aber in drei „Mietstufen“ – wie bei einer Wohnung:
1. **SQL Server auf einer VM** = Du mietest ein **leeres Haus** (virtuelle Maschine) und baust die Möbel (SQL Server) selbst auf. Alles ist erlaubt, aber du musst auch selbst putzen, reparieren, Updates einspielen. Gut, wenn du einen alten Server **1:1 umziehen** willst.
2. **Managed Instance** = Du mietest eine **möblierte Wohnung**. Der Vermieter (Microsoft) kümmert sich um Reparaturen, Backups und Updates, aber die Wohnung verhält sich wie dein altes Zuhause (fast alle SQL-Server-Funktionen).
3. **Azure SQL Database** = Du mietest nur ein **Zimmer in einer WG**. Du bekommst eine Datenbank, um die sich fast alles von allein kümmert. Dafür gibt es keine Dinge, die zum „ganzen Haus“ gehören (Server-Funktionen).

**Einzeldatenbank oder Pool?** Wenn jede Datenbank immer ungefähr gleich viel braucht: **Einzeldatenbank** (eigene Portion). Wenn mal die eine, mal die andere viel braucht: **Elastic Pool** – wie ein gemeinsamer Topf Nudeln, aus dem sich jeder nimmt, was er gerade braucht.

**Verbindung:** Die Datenbank hat eine Adresse im Internet (`servername.database.windows.net`). Damit nicht jeder hineinschauen darf, hat sie eine **Firewall**: Du musst deine eigene IP-Adresse freischalten. Danach verbindest du dich von SSMS aus oder einfach über den Abfrage-Editor im Browser.

Außerdem gibt es fertige **MySQL-** und **PostgreSQL-**Datenbanken in Azure – kostenlose Open-Source-Systeme, die Microsoft für dich betreibt.

**Kosten-Tipp:** Nach dem Üben immer die **Ressourcengruppe löschen**, sonst läuft der Zähler weiter!

## Merksatz
- **VM = IaaS (alles selbst), MI = PaaS (fast alles), SQL Database = PaaS (nur Datenbank).**
- **Einzeldatenbank = eigene Ressourcen, Elastic Pool = geteilte Ressourcen.**
- **Firewall: eigene IP freigeben; Port 1433.**
- **Nach dem Lab: Ressourcengruppe löschen.**
- **Komplettmigration → VM, Teilmigration → MI.**

## Prüfungsfalle
- Azure SQL Database hat **keine** SQL-Agent-/Server-Features, Managed Instance schon.
- Elastic Pools gibt es für SQL Database, nicht für VMs.
- Komplettmigration bestehender Strukturen = SQL Server auf VM (IaaS).
- Ohne Firewall-Regel (oder Private Endpoint) ist keine Verbindung von außen möglich.
- DTU ≠ vCore: beide sind Kaufmodelle für SQL Database.
- Kosten fallen für Compute **und** Speicher an; Löschen der Datenbank ohne Löschen des Servers lässt Kosten ggf. weiterlaufen (Server selbst kostenlos).
- Passwörter in Workshops nie wiederverwenden – im Alltag starke, einmalige Kennwörter.

## Grafik
### Verbindung zu Azure SQL Database
1. Client -> Azure-Firewall: Verbindung mit sql-lab.database.windows.net:1433
2. Azure-Firewall: prüft IP-Regel des Servers
3. Azure-Firewall -> Logischer Server: Anfrage erlaubt
4. Logischer Server: Authentifizierung (SQL oder Entra ID)
5. Logischer Server -> Client: Zugriff auf Datenbank AdventureWorks
### Wahl der Variante
1. Anforderung: 1:1-Migration eines alten SQL Servers
2. Entscheidung: SQL Server auf Azure-VM (IaaS)
3. Anforderung: wenig Verwaltung, nur Datenbankfunktionen
4. Entscheidung: Azure SQL Database
5. Anforderung: SQL-Agent, Cross-DB, wenig Verwaltung
6. Entscheidung: Managed Instance

## Lab
### GUI
Maschine: Windows-Client (Browser + SSMS). Azure Portal > Azure SQL > SQL-Datenbanken > Einzeldatenbank > Erstellen: neue Ressourcengruppe, Datenbank AdventureWorks, neuen logischen Server (Region, SQL-Authentifizierung mit **eigenem starken Kennwort**), Pool für elastische Datenbanken: Nein, Workload Entwicklung, Backup-Redundanz lokal, Netzwerk: Öffentlicher Endpunkt + aktuelle Client-IP hinzufügen, Defender nicht aktivieren, Zusätzliche Einstellungen: Beispiel AdventureWorksLT. Danach Abfrage-Editor oder SSMS (Servername `…database.windows.net`).
### PowerShell
```
New-AzResourceGroup -Name rg-sql -Location westeurope
New-AzSqlServer -ResourceGroupName rg-sql -ServerName sql-lab-2026 -Location westeurope -SqlAdministratorCredentials (Get-Credential)
New-AzSqlServerFirewallRule -ResourceGroupName rg-sql -ServerName sql-lab-2026 -FirewallRuleName meineIP -StartIpAddress <IP> -EndIpAddress <IP>
New-AzSqlDatabase -ResourceGroupName rg-sql -ServerName sql-lab-2026 -DatabaseName AdventureWorks -Edition Basic
```

## Befehle
- `New-AzSqlServer / New-AzSqlDatabase` – logischer Server und Datenbank
- `New-AzSqlServerFirewallRule` – IP freigeben
- `az sql db create` – CLI-Variante
- `sqlcmd -S server.database.windows.net -d db -U user` – Verbindung per CLI
- `SELECT @@VERSION; SELECT DB_NAME();` – Informationen

## Übungen
- A: Ein Unternehmen will seinen lokalen SQL Server unverändert in Azure betreiben. Welche Variante? | L: SQL Server auf Azure-VM (IaaS).
- A: Wenig Verwaltungsaufwand, nur eine Datenbank, schwankende Last mehrerer Datenbanken – was? | L: Azure SQL Database im Pool für elastische Datenbanken.
- A: Verbindung mit SSMS scheitert. Mögliche Ursache? | L: Client-IP nicht in der Serverfirewall freigegeben (Port 1433 blockiert).
- A: Wer darf CREATE DATABASE ausführen? | L: Server-Admin, Entra-Admin oder Mitglied von dbmanager in master.
- A: Welche Open-Source-Datenbanken bietet Azure? | L: MySQL, MariaDB, PostgreSQL.

## Karteikarten
- F: IaaS / PaaS bei Azure SQL? | A: SQL Server auf VM = IaaS; Managed Instance und SQL Database = PaaS.
- F: Was ist Azure SQL Managed Instance? | A: Verwaltete SQL-Server-Instanz mit hoher Kompatibilität, automatisierte Wartung.
- F: Was ist Azure SQL Database? | A: Cloudnativer Datenbankdienst ohne eigene Instanz (Einzeldatenbank oder Pool).
- F: Einzeldatenbank vs. Elastic Pool? | A: Eigene Ressourcen vs. gemeinsam genutzter Ressourcenpool.
- F: Was ist der logische Server? | A: Verwaltungscontainer für Datenbanken (Auth, Firewall, Überwachung).
- F: Port für SQL? | A: TCP 1433.
- F: Wie verbindet man sich von außen? | A: Firewall-Regel (IP), Private Endpoint; Servername *.database.windows.net.
- F: DTU vs. vCore? | A: Gebündeltes vs. flexibles Kaufmodell.
- F: Was ist ein BACPAC? | A: Exportdatei (Schema + Daten) zum Import/Export von Azure SQL Database.
- F: Was bedeutet Azure-Arc-fähige MI? | A: Läuft hybrid/multi-cloud auf Kubernetes mit Azure-Verwaltung.

## Quiz
? Welche Variante eignet sich für die Komplettmigration eines bestehenden SQL Servers?
* SQL Server auf Azure-VM
- Azure SQL Database
- Cosmos DB
- Azure Table

? Welche Option teilt Ressourcen zwischen mehreren Datenbanken?
* Elastic Pool
- Einzeldatenbank
- SQL Server auf VM
- Azure Files

? Welche Variante ist ein vollständiger SQL Server als PaaS?
* Managed Instance
- Azure SQL Database
- VM
- Azure SQL Edge

? Was ist nötig, damit man sich von einem Heimrechner verbinden kann?
* IP-Firewallregel am Server
- Eine VPN-Lizenz
- Ein Blob-Container
- Eine Queue

? Welcher TCP-Port wird für SQL Server genutzt?
* 1433
- 3389
- 443 nur
- 25

? Welcher Dienst verwaltet MySQL/PostgreSQL in Azure?
* Azure Database for MySQL / PostgreSQL
- Azure Cosmos DB
- Synapse
- Data Factory

? Wer darf in Azure SQL Database CREATE DATABASE ausführen?
* Mitglieder von dbmanager in master
- Jeder Benutzer
- Nur db_owner
- Nur Gäste

? Welches Modell kostet nach Nutzung mit automatischer Pause?
* Serverless-Compute
- Provisioned DTU
- VM
- Reservierte Instanz

## Lücken
- {Managed Instance} ist PaaS und bietet nahezu vollen SQL-Server-Funktionsumfang.
- Verbindung zur Azure SQL Database läuft über TCP-Port {1433}.

## Zuordnen
### Variante und Eigenschaft
- SQL Server auf VM => IaaS, volle Kontrolle
- Managed Instance => PaaS, hohe Kompatibilität
- Azure SQL Database => PaaS, nur Datenbankebene
- Elastic Pool => geteilte Ressourcen

## Spickzettel
- VM (IaaS) – MI (PaaS) – SQL Database (PaaS, Einzel/Pool)
- Logischer Server: Firewall, Auth, Port 1433
- DTU vs. vCore, serverless
- MySQL/MariaDB/PostgreSQL verwaltet
- Nach dem Lab Ressourcengruppe löschen
