---
id: az800-wac
bereich: AZ-800
block: A7
kapitel: Hybrid-Verwaltung
titel: Windows Admin Center (WAC)
stufe: Fortgeschritten
quellen: [AZ-800 Study Guide, Microsoft Learn]
verweise: [az800-powershell-remoting, az800-azure-arc, az800-credssp-delegation, az801-wac-system-insights]
---

## Profi

### Was ist Windows Admin Center?
**Windows Admin Center (WAC)** ist Microsofts **browserbasiertes Verwaltungswerkzeug** für Windows Server, Windows-Clients, Failover-Cluster, **Hyper-V** und **Azure Stack HCI/Azure Local** – kostenlos, ohne Cloudpflicht. Es ersetzt viele MMC-Konsolen und den Server-Manager für die tägliche Arbeit und ist besonders wichtig für **Server Core** (kein GUI).
Technisch ist WAC ein **Gateway**, das per **PowerShell Remoting (WinRM)** und **WMI/CIM** mit den Zielsystemen spricht – auf den verwalteten Servern wird **kein Agent** installiert.

### Bereitstellungsvarianten
| Variante | Installation | Einsatz |
|---|---|---|
| **Lokaler Client** | auf Windows 10/11, Zugriff nur lokal (`https://localhost:<Port>`) | Admin-Arbeitsplatz, Test |
| **Gatewayserver** | auf Windows Server (Desktop oder **Core**), Zugriff für mehrere Admins über HTTPS (Standard **Port 443**) | Unternehmen – zentrale Verwaltung |
| **Verwalteter Server** | auf einem Server, der sich selbst verwaltet | kleine Umgebungen |
| **Hochverfügbar** | Gateway als **Failover-Cluster-Rolle** | große Umgebungen |
| **WAC in Azure** | direkt im **Azure-Portal** für Azure-VMs und **Arc-fähige Server** (Erweiterung) | Hybrid ohne eigenes Gateway |
**Nicht** auf einem **Domänencontroller** installieren. Zertifikat: selbstsigniert (60 Tage, nur Test) oder eigenes Zertifikat (PKI).

### Funktionen (Auswahl)
Übersicht (CPU/RAM/Netz), Zertifikate, Geräte, Ereignisse, Dateien und Freigaben, Firewall, installierte Apps, lokale Benutzer/Gruppen, Netzwerk, PowerShell-Konsole im Browser, Prozesse, Registrierung, **Remotedesktop** im Browser, Rollen und Features, geplante Aufgaben, Dienste, **Speicher** (Datenträger, Volumes, Storage Spaces), **Storage Migration Service**, **Storage Replica**, **System Insights**, **Updates**, **Hyper-V** (VMs, Switches), **Failover-Cluster**, **Azure-Hybriddienste** (Azure Backup, Azure Site Recovery, Azure File Sync, Azure Monitor, **Azure Arc**-Onboarding, Azure Update Manager, Azure Network Adapter).
**Erweiterungen** (Microsoft und Drittanbieter, z. B. Dell/HPE/Lenovo-Hardware) über **Einstellungen → Erweiterungen**.
**PowerShell-Skripte anzeigen**: In vielen Tools zeigt das Symbol **„>_“** den ausgeführten PowerShell-Code – ideal zum Lernen und Automatisieren.

### Zugriff und Sicherheit
- **Gateway-Benutzer** und **Gateway-Administratoren** (Einstellungen → Gatewayzugriff): lokale Gruppen oder AD-/Entra-Gruppen; optional **Smartcard** oder **Microsoft Entra-Authentifizierung** (inkl. MFA/Bedingter Zugriff) für den Gatewayzugang.
- **Rollenbasierte Zugriffssteuerung (RBAC)** auf den Zielservern: Rollen **Administratoren**, **Hyper-V-Administratoren**, **Leser** – technisch umgesetzt über **JEA** (Just Enough Administration); Einrichtung pro Server über WAC („Rollenbasierte Zugriffssteuerung anwenden“).
- **Anmeldeinformationen**: Standardmäßig mit den Anmeldedaten des Browserbenutzers (Kerberos) oder „Verwalten als“ mit anderem Konto. **Zweiter Hop** (Gateway → Zielserver mit Benutzeridentität): **ressourcenbasierte eingeschränkte Kerberos-Delegierung** für das Gateway-Computerkonto auf den Zielsystemen einrichten, sonst werden Anmeldedaten bei jedem Server erneut abgefragt.
- **Firewall**: Ziele brauchen **WinRM** (5985 HTTP / 5986 HTTPS) und SMB (Dateitransfer).
- **Workgroup-/Nicht-Domänen-Ziele**: `TrustedHosts` am Gateway pflegen (`Set-Item WSMan:\localhost\Client\TrustedHosts`), Zielname auflösbar, lokales Admin-Konto.
- Aktivität wird in Ereignisprotokollen **Microsoft-ServerManagementExperience** protokolliert.

### Verbindung zu Azure
**Einstellungen → Azure → Registrieren**: WAC-Gateway wird als **App-Registrierung** in Entra ID eingetragen. Danach Integration: Server in **Azure Arc** aufnehmen, **Azure Backup** aktivieren, **Azure File Sync**, **Azure Monitor/Insights**, **Azure Update Manager**, **Azure Site Recovery** für Hyper-V-VMs, **Azure Network Adapter** (Point-to-Site in ein VNet).

## Lab
**Maschinen**: WAC01 (Server Core oder Desktop, Domänenmitglied), SRV01, SRV03 (Server Core), CL01 (Admin-Browser).

### GUI
1. **WAC01**: WAC-Installer (`WindowsAdminCenter.exe`/MSI) herunterladen → Installation → **Gatewaymodus**, Port **443**, **selbstsigniertes Zertifikat** (Lab) → „WinRM über HTTPS“ nicht zwingend.
2. **CL01**: Edge → `https://wac01.contoso.local` → Anmeldung mit Domänenkonto.
3. **Hinzufügen** → Server → `SRV01`, `SRV03` → Verbindung (Anmeldeinformationen des aktuellen Benutzers).
4. SRV03 öffnen → **Übersicht**, **Rollen und Features** (z. B. „Dateiserver-Ressourcen-Manager“ installieren), **Dienste**, **Firewall**, **PowerShell**-Tool.
5. In **Dateien und Dateifreigabe** Ordner anlegen → Symbol **„>_“** → angezeigten PowerShell-Code kopieren.
6. **Einstellungen (Zahnrad oben) → Gatewayzugriff** → **Benutzer**: `CONTOSO\GG-Serveradmins`, **Administratoren**: `CONTOSO\Domänen-Admins`.
7. SRV01 → **Einstellungen → Rollenbasierte Zugriffssteuerung** → Anwenden → Rolle **Leser** an `GG-Helpdesk` (lokale Gruppe „Windows Admin Center Readers“ wird angelegt).
8. **Erweiterungen**: Einstellungen → Erweiterungen → verfügbare Erweiterungen installieren (z. B. „Active Directory“, „DNS“, „DHCP“).
9. Optional **Azure**: Einstellungen → Azure → Registrieren → Server → Azure-Hybriddienste → **Azure Arc** → Onboarding.

### PowerShell
```powershell
# Auf WAC01 – unbeaufsichtigte Installation (MSI-Variante)
msiexec /i WindowsAdminCenter.msi /qn /L*v log.txt SME_PORT=443 SSL_CERTIFICATE_OPTION=generate

# Auf den Zielservern – WinRM sicherstellen
Enable-PSRemoting -Force
Get-NetFirewallRule -DisplayGroup "Windows-Remoteverwaltung" | Select-Object DisplayName, Enabled

# Ressourcenbasierte eingeschränkte Delegierung für das Gateway (auf DC01) – vermeidet Mehrfach-Anmeldungen
$gw = Get-ADComputer WAC01
Set-ADComputer -Identity SRV01 -PrincipalsAllowedToDelegateToAccount $gw
Set-ADComputer -Identity SRV03 -PrincipalsAllowedToDelegateToAccount $gw

# Workgroup-Ziel zulassen (auf WAC01)
Set-Item WSMan:\localhost\Client\TrustedHosts -Value "SRV-WG01" -Concatenate -Force
```

## Einfach

Stell dir vor, du bist Hausmeister für **20 Gebäude** (Server). Früher musstest du für jedes Gebäude zu einer anderen Schaltzentrale laufen (viele verschiedene Konsolen) – und manche Gebäude hatten gar keine Schaltzentrale (**Server Core** ohne Bildschirm-Oberfläche).

**Windows Admin Center** ist eine **Fernbedienung im Browser** für alle Gebäude:
- Du öffnest einfach eine Webseite, wählst das Gebäude und siehst: Stromverbrauch (CPU/RAM), Türen (Dienste), Alarmanlage (Firewall), Keller (Festplatten), Wohnungen (Hyper-V-VMs)…
- Auf den Gebäuden musst du **nichts installieren** – die Fernbedienung benutzt die vorhandenen „Kabel“ (PowerShell Remoting).
- Der Clou: Bei vielen Knöpfen kannst du dir anzeigen lassen, **welcher PowerShell-Befehl** dahintersteckt – so lernst du nebenbei PowerShell.

**Wer darf die Fernbedienung benutzen?** Das stellst du am **Gateway** ein (Gateway-Benutzer und -Administratoren). Und auf den Gebäuden selbst kannst du festlegen: „Der Helpdesk darf **nur gucken**“ (Rolle Leser).

**Mit Azure verbinden**: Die Fernbedienung kann auch Cloud-Dienste einschalten – Backup in die Cloud, Überwachung, Updates, Azure Arc.

## Merksatz
- WAC = **Browser + Gateway + WinRM**, **kein Agent** auf den Zielen.
- **Nicht auf einem DC** installieren; Gateway-Port meist **443**.
- **„>_“** zeigt den PowerShell-Code.
- RBAC-Rollen: **Administratoren, Hyper-V-Administratoren, Leser** (über JEA).
- Zweiter Hop → **ressourcenbasierte eingeschränkte Delegierung** für das Gateway.

## Prüfungsfalle
- WAC benötigt WinRM (5985/5986) auf den Zielen, nicht RDP.
- Selbstsigniertes Zertifikat läuft nach 60 Tagen ab – nur für Tests.
- Gatewayzugriff (wer darf WAC öffnen) ≠ Rechte auf den Zielservern.
- Workgroup-Server brauchen TrustedHosts-Eintrag am Gateway.
- Für Azure-Integration muss das Gateway in Entra ID registriert werden.

## Grafik
### Universal-Fernbedienung
Browser mit WAC-Oberfläche in der Mitte; Pfeile (WinRM) zu mehreren Servern, einer davon Server Core ohne Monitor; Klick auf „>_“ öffnet ein Fenster mit PowerShell-Code.

### Gateway-Architektur
Admins → HTTPS 443 → Gateway (Rollen Benutzer/Administratoren) → WinRM → Server/Cluster/Hyper-V; zweiter Hop mit Delegierungs-Schlüssel.

### Azure-Brücke
Gateway mit „Azure registriert“-Plakette; Buttons Backup, Arc, File Sync, Monitor leuchten auf und verbinden sich mit der Wolke.

## Karteikarten
- F: Was ist Windows Admin Center? | A: Browserbasiertes, kostenloses Verwaltungswerkzeug für Windows Server, Cluster, Hyper-V und Clients.
- F: Benötigt WAC einen Agent auf den verwalteten Servern? | A: Nein – es nutzt PowerShell Remoting/WinRM und WMI.
- F: Welche Bereitstellungsvarianten gibt es? | A: Lokaler Client, Gatewayserver, verwalteter Server, hochverfügbar (Cluster), WAC im Azure-Portal.
- F: Wo sollte WAC nicht installiert werden? | A: Auf einem Domänencontroller.
- F: Welche RBAC-Rollen bietet WAC auf Zielservern? | A: Administratoren, Hyper-V-Administratoren, Leser.
- F: Wie vermeidet man wiederholte Anmeldeabfragen beim Gateway? | A: Ressourcenbasierte eingeschränkte Kerberos-Delegierung vom Zielserver zum Gateway-Computerkonto.
- F: Welche Ports benötigt WAC auf den Zielen? | A: WinRM 5985/5986 (plus SMB für Dateiübertragungen).
- F: Wie sieht man den PowerShell-Code hinter einer WAC-Aktion? | A: Über das Symbol „>_“ (PowerShell-Skripts anzeigen).
- F: Wie integriert man WAC mit Azure? | A: Gateway in Entra ID registrieren (Einstellungen → Azure), dann Azure-Hybriddienste nutzen.

## Quiz
? Ein Admin will Server-Core-Server ohne RDP bequem grafisch verwalten. Welches Werkzeug?
* Windows Admin Center
- Server-Manager lokal auf dem Core-Server
- Die Datenträgerverwaltung auf dem Core-Server
- Hyper-V-Manager im Gast

? Welches Protokoll nutzt WAC hauptsächlich zu den Zielservern?
* WinRM (PowerShell Remoting)
- RDP
- FTP
- SNMP

? Der Helpdesk soll in WAC nur lesend auf SRV01 zugreifen. Was richtet man ein?
* Rollenbasierte Zugriffssteuerung auf SRV01 mit der Rolle Leser
- Gateway-Administrator-Rechte
- Domänen-Admin-Rechte
- Eine Stubzone

? Wo darf WAC NICHT installiert werden?
* Auf einem Domänencontroller
- Auf Windows 11
- Auf Server Core
- Auf einem Mitgliedsserver

? Was ist nötig, um aus WAC heraus Azure Backup zu aktivieren?
* Registrierung des WAC-Gateways bei Azure (Entra ID)
- Installation eines RODC
- Ein Forest-Trust zu Azure
- Deaktivieren von WinRM
