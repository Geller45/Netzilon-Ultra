---
id: az801-sms
bereich: AZ-801
block: A10
kapitel: Migration
titel: Storage Migration Service (SMS)
stufe: Profi
quellen: [AZ-801 Study Guide, Microsoft Learn]
verweise: [az801-azure-files, az800-azure-file-sync, az801-migration-serverrollen]
---

## Profi

### Zweck
Der **Storage Migration Service** (**SMS**) **verschiebt** **Dateiserver** **samt Daten, Freigaben, Sicherheit und Identität** **auf** **einen neuen Server** **oder** **in eine Azure-VM**, **ohne** **dass Clients** **etwas ändern** **müssen**. **Bedient** **wird** **er** **über** **Windows Admin Center** (**Erweiterung „Storage Migration Service“**).

### Rollen
| Rolle | Erklärung |
|---|---|
| **Orchestrator** | **Server**, **auf dem** **SMS** **läuft** (**Windows Server 2019 oder neuer**), **koordiniert alles** |
| **Quellserver** (*Source*) | **Windows Server 2003 und neuer**, **Linux mit Samba**, **NetApp CIFS**, **Failovercluster** |
| **Zielserver** (*Destination*) | **Windows Server 2012 R2 oder neuer** **oder** **Azure-VM**, **auch Azure File Sync** **nachgelagert** |
| **SMS-Proxy** | **Dienst** **auf** **Ziel-Server** (**bei Windows Server 2019+**), **wenn** **Orchestrator** **nicht** **das Ziel** **ist**, **bis zu 2× schneller** |

### Die drei Phasen
| Phase | Was passiert |
|---|---|
| **1. Inventarisierung** (*Inventory*) | **Quellserver** **wird** **gescannt**: **Freigaben**, **Dateien**, **Konfiguration**, **Netzwerk** |
| **2. Übertragung** (*Transfer*) | **Daten** **und** **Freigaben** **werden** **kopiert** (**mehrfach wiederholbar**, **inkrementell**) |
| **3. Cutover** | **Identität wechseln**: **Zielserver** **übernimmt** **Name, IP, Konto** **des Quellservers**, **Quelle** **wird** **umbenannt** |

### Was wird migriert
- **Dateien** **und** **Ordner** **mit** **NTFS-Rechten** **(ACLs)**.
- **SMB-Freigaben** **inkl.** **Freigabeberechtigungen**, **Einstellungen**.
- **Lokale Benutzer/Gruppen** (**optional**).
- **Nicht**: **Anwendungen**, **Druckerfreigaben**, **DFS-Namespaces** **(werden nur angepasst)**.

### Cutover im Detail
1. **Zielserver** **bekommt** **Namen des Quellservers**.
2. **Zielserver** **bekommt** **IP-Adresse** **des Quellservers** **(oder** **neue**)**.
3. **Quellserver** **wird** **umbenannt** **(zufälliger Name)** **und** **bekommt** **neue IP**.
4. **AD-Computerkonto** **wird** **angepasst**.
5. **Clients** **verbinden** **sich** **weiterhin** **mit** **`\\FILE01\Freigabe`**.

### Voraussetzungen
| Punkt | Details |
|---|---|
| **Konto** | **Migrationskonto** **mit** **Administratorrechten** **auf** **Quelle und Ziel** |
| **Firewall** | **SMB (445)**, **WMI/DCOM (135 + dynamische Ports)**, **SMS-Proxy (28940)** |
| **Funktionen** | `Storage-Migration-Service`, `SMS-Proxy` |
| **Netz** | **Orchestrator** **muss** **Quelle und Ziel** **erreichen** |
| **Kapazität** | **Ziel** **braucht** **genug Platz** |

### PowerShell
```powershell
# Auf ORCH01 (Orchestrator, Server 2022)
Install-WindowsFeature -Name SMS, SMS-Proxy -IncludeManagementTools
Get-Command -Module StorageMigrationService

# Auf DEST01 (Zielserver)
Install-WindowsFeature -Name SMS-Proxy -IncludeManagementTools

# Firewall auf Quelle und Ziel
Enable-NetFirewallRule -DisplayGroup "Datei- und Druckerfreigabe"
Enable-NetFirewallRule -DisplayGroup "Windows-Verwaltungsinstrumentation (WMI)"
Enable-NetFirewallRule -DisplayGroup "Netzwerk-Erkennung"
```

## Lab
**Maschinen**: **ORCH01** (**Orchestrator + WAC**), **OLD01** (**Quelle**, **Freigabe „Daten“**), **NEW01** (**Ziel**), **DC01**.

### GUI
1. **ORCH01**: **Windows Admin Center → Verbindung zu ORCH01 → Extensions → „Storage Migration Service“ installieren**.
2. **ORCH01**: **WAC → Storage Migration Service → Auftrag erstellen** → **Name „Fileserver-Umzug“** → **Quelle: Windows-Server**.
3. **ORCH01**: **Anmeldedaten** **eingeben** (**Migrationskonto**) → **Quellserver OLD01 hinzufügen** → **Scan starten**.
4. **ORCH01**: **Inventarisierung prüfen** → **Weiter zum Übertragen**.
5. **ORCH01**: **Zielserver NEW01 eintragen** → **Volume-Zuordnung prüfen** → **Übertragung validieren → Übertragung starten**.
6. **ORCH01**: **Fertig?** → **Cutover: Netzwerkzuordnung** **(IP übernehmen)** → **Validieren → Cutover starten**.
7. **Client**: **`\\OLD01\Daten`** **öffnen** – **erreicht** **jetzt** **NEW01**.

## Einfach

Du hast **einen alten Schrank** (**Quellserver**) **voller Ordner**. **Du kaufst** **einen neuen Schrank** (**Zielserver**). **Der Umzugshelfer** (**SMS**) **macht** **drei Dinge**:

1. **Zählen**: **Was ist alles im Schrank?** (**Inventar**)
2. **Umpacken**: **Alles** **in den neuen Schrank**, **auch die Schilder** (**Rechte und Freigaben**).
3. **Schilder tauschen**: **Der neue Schrank** **bekommt** **das Namensschild des alten**. **Alle**, **die** **den alten Schrank suchen**, **finden** **den neuen** **– ohne** **es zu merken**.

## Merksatz
- **I-T-C**: **Inventory → Transfer → Cutover**.
- **Orchestrator** **= Dirigent**, **WAC** **= Dirigentenpult**.
- **Cutover = Name + IP tauschen**.
- **SMS-Proxy** **= schneller** **auf dem Ziel**.
- **Quelle** **ab Windows Server 2003**, **Ziel** **ab 2012 R2**.
- **Ports**: **445, 135, 28940**.

## Prüfungsfalle
- **Orchestrator** **muss** **Server 2019 oder neuer** **sein**.
- **SMS** **migriert** **Dateiserver**, **nicht** **Anwendungen**.
- **Cutover** **erst** **nach** **erfolgreicher Übertragung**.
- **Ohne** **Firewallregeln** **(WMI/SMB)** **schlägt** **Inventar** **fehl**.
- **SMS-Proxy** **nur auf Ziel** **(nicht** **auf** **Quelle)**.
- **Ziel** **kann** **Azure-VM** **sein**.
- **Quelle** **kann** **Linux (Samba)** **sein**.

## Grafik
### Drei Umzugsphasen
Schrank zählen, umpacken, Schild tauschen; Pfeile zwischen alten und neuen Schrank.

### Dirigent
Orchestrator in der Mitte, Pfeile zu Quelle und Ziel.

### Cutover
Namensschilder wechseln die Türen; alter Schrank bekommt „OLD-Random“.

## Karteikarten
- F: Wie heißen die drei SMS-Phasen? | A: Inventarisierung, Übertragung, Cutover.
- F: Womit steuert man SMS? | A: Windows Admin Center (Erweiterung).
- F: Welche Mindestversion hat der Orchestrator? | A: Windows Server 2019.
- F: Welche Quellen sind möglich? | A: Windows Server ab 2003, Linux Samba, NetApp CIFS.
- F: Was passiert beim Cutover? | A: Ziel übernimmt Name und IP der Quelle.
- F: Welche Rolle beschleunigt den Transfer? | A: SMS-Proxy auf dem Ziel.
- F: Welcher Port für SMS-Proxy? | A: 28940.
- F: Was wird nicht migriert? | A: Anwendungen und Druckerfreigaben.
- F: Kann das Ziel eine Azure-VM sein? | A: Ja.

## Quiz
? Ein Dateiserver soll auf neue Hardware umziehen, Clients sollen nichts merken. Lösung?
* Storage Migration Service
- DFS-R
- Robocopy allein
- Azure Backup

? Wie heißt die letzte SMS-Phase?
* Cutover
- Inventory
- Transfer
- Cleanup

? Wo steuert man SMS grafisch?
* Windows Admin Center
- Server-Manager
- Hyper-V-Manager
- Gruppenrichtlinienverwaltung

? Welche Mindestversion hat der SMS-Orchestrator?
* Windows Server 2019
- Windows Server 2008
- Windows Server 2012
- Windows 10

? Was übernimmt der Zielserver beim Cutover?
* Namen und IP-Adresse des Quellservers
- Nur die Daten
- Nur die Berechtigungen
- Keine Identität

? Welche Rolle installiert man auf dem Zielserver für schnellere Übertragung?
* SMS-Proxy
- DFS-Replikation
- Storage Replica
- BranchCache
