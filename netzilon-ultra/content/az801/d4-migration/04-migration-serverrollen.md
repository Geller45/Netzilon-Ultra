---
id: az801-migration-serverrollen
bereich: AZ-801
block: A10
kapitel: Migration
titel: Migration von IIS, Hyper-V, RDS, DHCP und Druckserver
stufe: Profi
quellen: [AZ-801 Study Guide, Microsoft Learn]
verweise: [az801-sms, az801-azure-migrate, az801-hyperv-replica, az800-dhcp, ap1-a6-druckserver]
---

## Profi

### Grundprinzip
**Serverrollen** **werden** **fast immer** **nach dem gleichen Muster** **migriert**: **neuen Server** **installieren** → **Rolle** **installieren** → **Konfiguration/Daten** **exportieren und importieren** → **testen** → **Clients umstellen** → **alten Server abschalten**.

### Windows Server Migration Tools (WSMT)
**WSMT** **überträgt** **Rollen, Features, Freigaben, lokale Benutzer/Gruppen, IP-Konfiguration** **zwischen** **Servern** **(auch** **verschiedene Versionen)**.

| Schritt | Befehl / Ort |
|---|---|
| **Feature** **installieren** | `Install-WindowsFeature Migration` **(auf Zielserver)** |
| **Bereitstellungspaket** | `smigdeploy.exe /package /architecture amd64 /os WS22 /path C:\SMT` |
| **Auf Quellserver** | **Paket** **kopieren** **→** `smigdeploy.exe` |
| **Prüfen** | `Get-SmigServerFeature` |
| **Export** | `Export-SmigServerSetting` |
| **Import** | `Import-SmigServerSetting` |
| **Daten senden/empfangen** | `Send-SmigServerData` / `Receive-SmigServerData` |

### IIS
- **Web Deploy** (*msdeploy*): **Webseiten, App-Pools, Konfiguration** **packen** **und übertragen**.
- **Shared Configuration**: **IIS-Konfiguration** **auf** **Freigabe**, **mehrere Webserver** **teilen** **sie**.
- **Export/Import** **der** **Zertifikate** (**PFX**) **und** **Bindungen** **nicht vergessen**.
- **App-Pool-Identität**, **NTFS-Rechte** **und** **.NET-Versionen** **prüfen**.
- **Sicherung**: `appcmd add backup`.

```powershell
# Auf OLD-IIS – Konfiguration exportieren
Import-Module WebAdministration
& "$env:windir\system32\inetsrv\appcmd.exe" add backup "vor-migration"
& "C:\Program Files\IIS\Microsoft Web Deploy V3\msdeploy.exe" -verb:sync -source:webServer -dest:package=C:\Temp\web.zip

# Auf NEW-IIS – importieren
Install-WindowsFeature Web-Server, Web-Mgmt-Service -IncludeManagementTools
& "C:\Program Files\IIS\Microsoft Web Deploy V3\msdeploy.exe" -verb:sync -source:package=C:\Temp\web.zip -dest:webServer
```

### Hyper-V
| Methode | Erklärung |
|---|---|
| **Export/Import** | `Export-VM`, `Import-VM` **(offline)** |
| **Live Migration** | **VM** **ohne Ausfall** **zwischen Hosts** |
| **Shared-Nothing Live Migration** | **Ohne gemeinsamen Speicher**, **Kerberos** **oder** **CredSSP** |
| **Storage Migration** | **VM-Dateien** **im Betrieb verschieben** |
| **Hyper-V Replica** | **Replikation**, **Failover** |
| **Nach Wechsel** | `Update-VMVersion` **(VM ausgeschaltet)** |

**Kerberos-Einschränkte Delegierung** **(Constrained Delegation)** **für** **CIFS** **und** **Microsoft Virtual System Migration Service** **auf** **beiden Hosts**.

```powershell
# Auf HV01
Enable-VMMigration
Set-VMHost -VirtualMachineMigrationAuthenticationType Kerberos
Move-VM -Name VM01 -DestinationHost HV02 -IncludeStorage -DestinationStoragePath "D:\VMs\VM01"
Export-VM -Name VM02 -Path D:\Export
# Auf HV02
Import-VM -Path "D:\Export\VM02\Virtual Machines\<GUID>.vmcx" -Copy -GenerateNewId
```

### DHCP
```powershell
# Auf OLD-DHCP
Export-DhcpServer -ComputerName OLD-DHCP -File C:\Temp\dhcp.xml -Leases
# Auf NEW-DHCP
Install-WindowsFeature DHCP -IncludeManagementTools
Import-DhcpServer -ComputerName NEW-DHCP -File C:\Temp\dhcp.xml -BackupPath C:\Temp\dhcp-backup -Leases
Add-DhcpServerInDC -DnsName new-dhcp.exa.local -IPAddress 10.0.0.12
# Auf OLD-DHCP – danach
Remove-DhcpServerInDC -DnsName old-dhcp.exa.local
Stop-Service DHCPServer; Set-Service DHCPServer -StartupType Disabled
```
**Wichtig**: **Nur einer** **darf** **aktive Bereiche** **haben**, **sonst** **doppelte Adressen**.

### Druckserver
**Druckerdaten** **sichern** **mit** **`PrintBrm.exe`** **(Druckerverwaltung/Printer Migration)**:
```powershell
# Auf OLD-PRINT
& "$env:windir\System32\spool\tools\PrintBrm.exe" -B -F C:\Temp\print.printerExport
# Auf NEW-PRINT
Install-WindowsFeature Print-Services -IncludeManagementTools
& "$env:windir\System32\spool\tools\PrintBrm.exe" -R -F C:\Temp\print.printerExport
```
**Treiber, Warteschlangen, Ports, Freigaben** **werden** **mitgenommen**. **Clients** **ändern** **nichts**, **wenn** **DNS-Alias/Namen** **identisch** **oder** **per** **GPO** **verteilt**.

### RDS (Remotedesktopdienste)
| Komponente | Migrationsweg |
|---|---|
| **Sitzungshost** (*RDSH*) | **Neuer Host** **einrichten**, **Sammlung** **dazu**, **alten Host** **aus Sammlung** **entfernen** |
| **Verbindungsbroker** (*RDCB*) | **Neuer Broker**, **HA-Datenbank** **(SQL)**, **Konfiguration** **neu** **zuordnen** |
| **Lizenzserver** (*RDLS*) | **Lizenzen** **auf** **neuem Server** **aktivieren**, **Lizenzdatenbank** **migrieren** (**Sicherungskopie** **oder** **Microsoft Clearinghouse**) |
| **Gateway/Web Access** | **Zertifikate** **importieren**, **neue Server** **eintragen** |
| **Benutzerprofile** | **UPD-Datenträger** **auf** **neue Freigabe** |

### Checkliste vor dem Umschalten
1. **Sicherung** **des Altsystems**.
2. **Testclients** **auf neuen Server** **richten**.
3. **DNS-Einträge** **oder** **Aliase** **ändern**.
4. **Alten Server** **einige Tage** **ausgeschaltet** **halten**.
5. **Erst** **dann** **löschen** (**Rückweg**).

## Lab
**Maschinen**: **OLD-DHCP**, **NEW-DHCP**, **DC01**.

### GUI
1. **OLD-DHCP**: **DHCP-Konsole → Rechtsklick auf Server → Weitere Aktionen → Sichern** → **Ordner C:\DHCPSicherung**.
2. **NEW-DHCP**: **Server-Manager → Rollen hinzufügen → DHCP-Server** → **Installation** **abschließen** → **Nachträgliche DHCP-Konfiguration** **(Autorisieren)**.
3. **NEW-DHCP**: **DHCP-Konsole → Rechtsklick auf Server → Weitere Aktionen → Wiederherstellen** → **Ordner** **wählen**.
4. **NEW-DHCP**: **Bereiche** **prüfen**, **Leases** **prüfen**.
5. **OLD-DHCP**: **Bereiche** **deaktivieren** → **Server** **aus AD** **entfernen** (**Autorisierung aufheben**).

### PowerShell
```powershell
# Auf OLD-DHCP
Export-DhcpServer -File C:\Temp\dhcp.xml -Leases
# Auf NEW-DHCP
Import-DhcpServer -File C:\Temp\dhcp.xml -BackupPath C:\Temp\bak -Leases
```

## Einfach

**Serverrollen umziehen** **ist wie eine Wohnung wechseln**: **Erst** **die neue Wohnung** **einrichten**, **dann** **alles** **einpacken** **(Export)** **und** **dort ausräumen** **(Import)**. **Dann** **die** **Adresse** **ändern** (**DNS/Name**). **Die alte Wohnung** **bleibt** **erstmal** **stehen**, **falls** **du** **was vergessen hast**.

**Bei DHCP** **gilt**: **Es** **darf nur ein Verteiler** **gleichzeitig** **Adressen austeilen**, **sonst** **bekommen** **zwei Geräte** **dieselbe Nummer**.

## Merksatz
- **Neu bauen → Exportieren → Importieren → Testen → Umstellen → Alt aus**.
- **WSMT** **= Werkzeugkasten** **für Rollen**.
- **Print** **= PrintBrm**, **DHCP** **= Export-DhcpServer**.
- **Web Deploy** **= IIS**.
- **Shared-Nothing** **= Live Migration ohne Shared Storage**.
- **Nur ein DHCP aktiv**.

## Prüfungsfalle
- **Kerberos-Delegierung** **für Live Migration** **zwischen Hosts** **vergessen**.
- **DHCP** **auf beiden Servern** **aktiv** **→** **Konflikte**.
- **PFX-Zertifikate** **bei IIS** **nicht** **mit-exportiert**.
- **RDS-Lizenzen** **müssen** **neu** **aktiviert** **werden**.
- **PrintBrm** **exportiert** **nur** **die Druckerkonfiguration**, **keine Anwendungen**.
- **Alten Server** **nicht** **sofort löschen**.
- **VM-Version** **hochstufen** **nur**, **wenn** **die VM aus** **ist**.

## Grafik
### Umzug
Kisten (Export) wandern von der alten in die neue Wohnung.

### Ein Verteiler
Zwei DHCP-Server, einer mit Stopp-Schild; nur einer teilt Adressen aus.

### Live Migration
VM gleitet zwischen zwei Hosts, Zuschauer merken nichts.

## Karteikarten
- F: Was sind WSMT? | A: Windows Server Migration Tools zum Übertragen von Rollen und Features.
- F: Wie exportiert man DHCP? | A: Export-DhcpServer -File ... -Leases.
- F: Wie importiert man DHCP? | A: Import-DhcpServer -File ... -BackupPath ... -Leases.
- F: Welches Tool migriert Drucker? | A: PrintBrm.exe.
- F: Welches Tool migriert IIS? | A: Web Deploy (msdeploy).
- F: Was braucht Shared-Nothing Live Migration? | A: Kerberos-Delegierung oder CredSSP.
- F: Was passiert mit RDS-Lizenzen bei Migration? | A: Sie müssen auf dem neuen Lizenzserver aktiviert werden.
- F: Welches Cmdlet nutzt man nach Hyper-V-Wechsel? | A: Update-VMVersion.
- F: Wie viele DHCP-Server dürfen denselben Bereich aktiv bedienen? | A: Nur einer.

## Quiz
? Wie exportiert man Druckerwarteschlangen und Treiber?
* PrintBrm.exe
- Export-DhcpServer
- Web Deploy
- robocopy

? Welches Cmdlet sichert DHCP-Bereiche und Leases?
* Export-DhcpServer
- Backup-DhcpLeases
- Save-DhcpConfig
- Get-DhcpServerv4Scope

? Was ist nötig für Shared-Nothing Live Migration mit Kerberos?
* Eingeschränkte Delegierung auf beiden Hosts
- Ein gemeinsames SAN
- Ein Cluster
- Azure Arc

? Womit migriert man IIS-Seiten samt Konfiguration?
* Web Deploy
- Windows Backup
- FSRM
- Storage Replica

? Was ist vor dem Löschen des alten Servers ratsam?
* Einige Tage ausgeschaltet als Rückweg behalten
- Sofort löschen
- Neu installieren
- Domäne umbenennen

? Welches Feature bringt WSMT auf den Zielserver?
* Migration (Windows-Server-Migration-Tools)
- SMS
- Web-Server
- Print-Services

? Mit welchem Werkzeug werden Drucker samt Warteschlangen und Treibern migriert?
* Druckermigration (PrintBrm.exe) bzw. Druckverwaltung → Drucker migrieren
- Robocopy
- DFS-R
- Storage Migration Service
! Export in eine .printerExport-Datei und Import am Ziel.

? Wie werden die DHCP-Daten auf den neuen Server übernommen?
* Import-DhcpServer mit der zuvor per Export-DhcpServer erzeugten Datei
- Kopieren der Registry
- Erneutes manuelles Anlegen aller Leases
- Über Entra Connect
! Danach alten Server deautorisieren bzw. Dienst stoppen.

? Welche Voraussetzung gilt beim Ersetzen eines Servers mit gleichem Namen?
* Der alte Server muss vorher außer Betrieb bzw. umbenannt sein, um Namens- und IP-Konflikte zu vermeiden
- Beide Server laufen dauerhaft parallel mit gleichem Namen
- Der neue Server muss eine ältere Windows-Version haben
- Der DNS-Server muss deinstalliert werden
! Doppelte Namen führen zu Konflikten in AD und DNS.
