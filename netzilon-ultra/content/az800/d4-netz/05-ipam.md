---
id: az800-ipam
bereich: AZ-800
block: A7
kapitel: Netzwerkinfrastruktur
titel: IPAM – IP-Adressverwaltung für DHCP, DNS und IP-Adressräume
stufe: Fortgeschritten
quellen: [AZ-800 Study Guide, Microsoft Learn, Netzwerkinfrastruktur_mit_Windows_Server_2016_implementieren_70-741.pdf]
verweise: [az800-dhcp, az800-dns, ap1-a4-subnetting, ap1-a5-dhcp, ap1-a6-gpo-grundlagen]
---

## Profi

### Was ist IPAM?
**IP Address Management (IPAM)** ist ein Windows-Server-**Feature** zur zentralen **Planung, Verwaltung, Überwachung (Monitoring) und Prüfung (Audit)** des IP-Adressraums sowie der **DHCP-** und **DNS-Server** eines Unternehmens. Ersetzt Excel-Listen und verteilte Einzelkonsolen.

### Funktionen
| Bereich | Möglichkeiten |
|---|---|
| **Adressraum** | IP-Adressblöcke → IP-Adressbereiche → einzelne Adressen verwalten; Auslastung, Konflikte, **freie Adressen suchen**; IPv4 und IPv6 |
| **DHCP** | Bereiche, Reservierungen, Optionen, Failover, Richtlinien **zentral** auf vielen DHCP-Servern bearbeiten |
| **DNS** | Zonen und Einträge anzeigen/erstellen, Zonenstatus überwachen |
| **Überwachung** | Server- und Bereichsstatus, Auslastungswarnungen (Standard: Warnung ab 80 %) |
| **Überwachung/Audit** | **Konfigurationsänderungen** (wer hat was geändert), **IP-Adressverlauf** (welche IP hatte welches Gerät/Benutzer wann – über DHCP-Leases und DC-Anmeldeereignisse) |
| **Rollenbasierte Zugriffssteuerung** | Rollen (z. B. IPAM-DHCP-Administrator), Zugriffsbereiche (*Access Scopes*) |

### Architektur und Grenzen
- IPAM-Server ist **Mitgliedsserver**, **kein Domänencontroller** (Installation auf DC nicht unterstützt).
- Verwaltet Server **eines Active-Directory-Forests** (mehrere Domänen im Forest möglich, **keine** fremden Forests über Trust in klassischer Form, keine Arbeitsgruppen).
- Verwaltbare Server: **DC** (für Ereignisse), **DHCP**, **DNS**, **NPS** (für Anmeldeereignisse) – nur **Windows Server**; keine Fremdprodukte (Infoblox, BIND…).
- **Kein** Verwaltungs-Agent: IPAM greift über **RPC/WMI/Remote-Eventlog** zu.
- Datenbank: **Windows Internal Database (WID)** (Standard) oder **SQL Server** (für große Umgebungen/Hochverfügbarkeit).
- Kein Azure-Adressraum; für Azure-IPAM gibt es separate Azure-Werkzeuge (Azure Virtual Network Manager IPAM).

### Bereitstellungsmethode (Provisioning)
| Methode | Funktionsweise | Einsatz |
|---|---|---|
| **Gruppenrichtlinienbasiert** (empfohlen) | `Invoke-IpamGpoProvisioning` erstellt **3 GPOs** (`<Präfix>_DHCP`, `<Präfix>_DNS`, `<Präfix>_DC_NPS`), die Firewallregeln, Freigaben und Gruppenmitgliedschaften setzen; Server müssen im **Sicherheitsfilter** der GPOs stehen (IPAM trägt sie ein, wenn Status „Verwaltet“) | Standard |
| **Manuell** | jede Einstellung auf jedem Server von Hand (Firewall, Gruppe **Ereignisprotokollleser**, DHCP-Administratoren, Freigabe `dhcpaudit`) | wenige Server, keine GPO-Rechte |
Die Methode wird beim Setup gewählt und ist danach **nicht** einfach umschaltbar.

### Einrichtungsablauf (Server-Manager → IPAM)
1. **Mit IPAM-Server verbinden**
2. **IPAM-Server bereitstellen** (Datenbank WID/SQL, Methode GPO, **GPO-Präfix** z. B. `IPAM`)
3. **Serverermittlung konfigurieren** (Domänen und Rollen DC/DHCP/DNS auswählen)
4. **Serverermittlung starten** (geplante Aufgabe)
5. **Server auswählen oder hinzufügen** → Verwaltungsstatus auf **Verwaltet** setzen
6. **Daten von verwalteten Servern abrufen**
Zwischen 2 und 5: PowerShell-Befehl `Invoke-IpamGpoProvisioning` auf dem IPAM-Server ausführen (Domänen-Admin nötig) und `gpupdate` auf den Zielservern. Status muss „**IPAM-Zugriff: Entsperrt**“ zeigen.

### Rollen (lokale Sicherheitsgruppen auf dem IPAM-Server / RBAC)
| Rolle | Rechte |
|---|---|
| **IPAM-Administratoren** | alles, inkl. Einstellungen und Rollen |
| **IPAM-Benutzer** | nur lesen (ohne IP-Adressverlauf) |
| **IPAM-MSM-Administratoren** | Multi-Server-Management: DHCP/DNS verwalten |
| **IPAM-ASM-Administratoren** | Adressraumverwaltung |
| **IPAM-IP-Überwachungsadministratoren** | IP-Adressverlauf ansehen (**datenschutzrelevant**) |
Zusätzlich vordefinierte RBAC-Rollen wie **DNS-Eintragsadministrator**, **DHCP-Reservierungsadministrator**, kombinierbar mit **Zugriffsbereichen** (z. B. nur Standort Berlin).

## Lab
**Maschinen**: **DC01** (example.com, DNS), **DHCP01** (DHCP), **IPAM01** (Mitgliedsserver, Windows Server 2022).

### GUI
1. **IPAM01**: Server-Manager → Rollen und Features → Features → **IP-Adressverwaltungsserver (IPAM)** → installieren.
2. **IPAM01**: Server-Manager → Knoten **IPAM** → **IPAM-Server bereitstellen** → WID → **Gruppenrichtlinienbasiert**, Präfix `IPAM`.
3. **IPAM01**: PowerShell als Domänen-Admin: `Invoke-IpamGpoProvisioning` (siehe unten).
4. **IPAM01**: **Serverermittlung konfigurieren** → Domäne `example.com`, Rollen DC, DHCP, DNS → **Serverermittlung starten**.
5. **IPAM01**: **Server auswählen oder hinzufügen** → DC01, DHCP01 → Kontextmenü **Server bearbeiten** → Verwaltungsstatus **Verwaltet**.
6. **DC01** und **DHCP01**: `gpupdate /force` (GPOs `IPAM_DC_NPS`, `IPAM_DNS`, `IPAM_DHCP` wirken).
7. **IPAM01**: Server → **Serverzugriffsstatus aktualisieren** → „Entsperrt“ → **Daten von verwalteten Servern abrufen**.
8. **IPAM01**: **IP-Adressblöcke** → Block `192.168.0.0/16` anlegen → Bereich `192.168.10.0/24` wird aus DHCP importiert → Auslastung ansehen → **Nächste verfügbare IP-Adresse suchen**.
9. **IPAM01**: **DHCP-Bereiche** → Bereich auf DHCP01 zentral bearbeiten (z. B. Option 006 DNS-Server).
10. **IPAM01**: **Ereigniskatalog → IP-Adressverlauf** → nach MAC/IP/Benutzer suchen.

### PowerShell
```powershell
# Auf IPAM01 – Installation und Bereitstellung
Install-WindowsFeature IPAM -IncludeManagementTools
Invoke-IpamServerProvisioning -WorkingMode GPO -ProvisioningMethod Automatic -GpoPrefix "IPAM" -Force
Invoke-IpamGpoProvisioning -Domain example.com -GpoPrefixName "IPAM" -IpamServerFqdn IPAM01.example.com -DelegatedGpoUser "EXAMPLE\IPAM-Admin" -Force

# Auf IPAM01 – Ermittlung und verwaltete Server
Add-IpamDiscoveryDomain -Name example.com -DiscoverDc $true -DiscoverDhcp $true -DiscoverDns $true
Start-ScheduledTask -TaskPath "\Microsoft\Windows\IPAM\" -TaskName "ServerDiscovery"
Get-IpamServerInventory
Set-IpamServerInventory -ServerName DHCP01.example.com -ManageabilityStatus Managed
Set-IpamServerInventory -ServerName DC01.example.com -ManageabilityStatus Managed

# Auf DC01 und DHCP01 – GPOs übernehmen
gpupdate /force

# Auf IPAM01 – Adressraum
Add-IpamBlock -NetworkId 192.168.0.0/16
Add-IpamRange -NetworkId 192.168.20.0/24 -StartIPAddress 192.168.20.10 -EndIPAddress 192.168.20.200
Find-IpamFreeAddress -NetworkId 192.168.20.0/24 -NumAddress 3
Get-IpamRange | Select-Object NetworkId,Utilization

# Auf IPAM01 – Rollen
Add-LocalGroupMember -Group "IPAM ASM Administrators" -Member "EXAMPLE\Netzteam"
```

## Einfach

Stell dir vor, deine Firma hat **tausende Hausnummern** (IP-Adressen), verteilt auf viele Straßen (Subnetze), und mehrere **Hausnummern-Verteiler** (DHCP-Server) und **Telefonbücher** (DNS-Server). Ohne IPAM führt jeder seine eigene Liste – Chaos.

**IPAM** ist das **Grundbuchamt** für alle Adressen:
- Du siehst **auf einen Blick**, welche Straße wie voll ist (z. B. 85 % belegt → Warnung).
- Du findest sofort **freie Hausnummern**.
- Du kannst **alle DHCP-Server von einem Platz aus** bearbeiten.
- Du kannst nachschauen: **„Wer hatte gestern um 14 Uhr die Adresse 192.168.10.55?“** – super bei Sicherheitsvorfällen.

**Einrichtung in einem Satz**: IPAM auf einen **normalen Server** (nicht auf den DC!) installieren, dann verteilt eine **Gruppenrichtlinie** automatisch die nötigen Erlaubnisse an DHCP-, DNS- und DC-Server, und IPAM darf dort Daten einsammeln.

**Grenzen**: Nur **Windows**-Server, nur **ein Forest**, **nicht** auf einem DC.

## Merksatz
- IPAM **nie auf einem DC**.
- **Ein Forest**, nur **Windows**-DHCP/DNS/DC/NPS.
- GPO-Methode = **3 GPOs**: `_DHCP`, `_DNS`, `_DC_NPS`.
- `Invoke-IpamGpoProvisioning` nicht vergessen, danach Server auf **Verwaltet**.
- Datenbank: **WID** oder **SQL**.
- **IP-Adressverlauf** = wer hatte wann welche IP.

## Prüfungsfalle
- Installation auf einem DC wird nicht unterstützt.
- Server bleibt „Blockiert“, wenn Status nicht „Verwaltet“ oder GPO noch nicht angewendet.
- Keine Verwaltung von Servern aus anderen Forests oder Fremd-DNS/DHCP.
- Bereitstellungsmethode (GPO/manuell) nachträglich nicht einfach änderbar.
- IP-Adressverlauf erfordert die Rolle IPAM-IP-Überwachungsadministratoren.
- Ohne DC/NPS als verwaltete Server fehlen Benutzeranmeldedaten im Verlauf.

## Grafik
### Grundbuchamt
Viele Straßen (Subnetze) mit Häusern; über jeder Straße ein Füllstandsbalken; bei 80 % wird er gelb. Lupe sucht freie Hausnummer.

### Drei GPO-Boten
IPAM01 schickt drei Boten (GPO_DHCP, GPO_DNS, GPO_DC_NPS) zu den Servern; Tür-Schloss springt auf „Entsperrt“.

### Zeitreise
Zeitleiste; Adresse 192.168.10.55 gehört um 9 Uhr Laptop A (Benutzer Max), um 14 Uhr Laptop B (Benutzerin Lea).

## Karteikarten
- F: Wofür steht IPAM? | A: IP Address Management – zentrale Verwaltung von IP-Adressraum, DHCP und DNS.
- F: Darf IPAM auf einem DC installiert werden? | A: Nein.
- F: Welche Server kann IPAM verwalten? | A: Windows-DCs, DHCP-, DNS- und NPS-Server eines Forests.
- F: Welche zwei Bereitstellungsmethoden gibt es? | A: Gruppenrichtlinienbasiert und manuell.
- F: Welche GPOs erstellt IPAM? | A: <Präfix>_DHCP, <Präfix>_DNS, <Präfix>_DC_NPS.
- F: Cmdlet zum Erstellen der IPAM-GPOs? | A: Invoke-IpamGpoProvisioning
- F: Welche Datenbanken unterstützt IPAM? | A: Windows Internal Database oder SQL Server.
- F: Was zeigt der IP-Adressverlauf? | A: Welches Gerät/welcher Benutzer wann welche IP hatte.
- F: Welcher Verwaltungsstatus ist nötig, damit IPAM Daten abruft? | A: Verwaltet (Managed).
- F: Standard-Warnschwelle für Bereichsauslastung? | A: 80 %.

## Quiz
? Wo sollte IPAM installiert werden?
* Auf einem Mitgliedsserver
- Auf dem PDC-Emulator
- Auf jedem DHCP-Server
- Auf einem RODC

? Nach dem Hinzufügen zeigt DHCP01 in IPAM „IPAM-Zugriff: Blockiert“. Was fehlt am wahrscheinlichsten?
* Verwaltungsstatus „Verwaltet“ und Anwendung der IPAM-GPOs
- Die DHCP-Rolle auf IPAM01
- Ein SQL Server
- Eine Vertrauensstellung

? Ein Sicherheitsteam will wissen, welcher Benutzer gestern 192.168.10.55 hatte. Welche IPAM-Funktion?
* IP-Adressverlauf
- Konfigurationsüberwachung
- Adressblöcke
- DNS-Zonenüberwachung

? Welche Umgebung kann IPAM NICHT verwalten?
* DNS-Server eines anderen Forests
- Mehrere Domänen im selben Forest
- Windows-DHCP-Failover-Paare
- NPS-Server im eigenen Forest

? Welches Cmdlet erstellt die für IPAM nötigen Gruppenrichtlinien?
* Invoke-IpamGpoProvisioning
- Install-WindowsFeature IPAM
- New-GPO -Name IPAM
- Add-IpamDiscoveryDomain

? Welche Bereitstellungsmethode wird für IPAM-Gruppenrichtlinien empfohlen?
* Gruppenrichtlinienbasierte Bereitstellung mit Invoke-IpamGpoProvisioning
- Manuelle Konfiguration auf jedem Server ohne GPO
- Bereitstellung über DHCP-Optionen
- Installation auf jedem Client
! Danach Server in IPAM auf „Verwaltet“ setzen.

? Welche Datenbank kann IPAM statt der Windows Internal Database nutzen?
* Microsoft SQL Server
- Access
- MySQL
- Excel
! Für größere Umgebungen empfohlen.

? Welche Funktion bietet IPAM für DHCP-Server?
* Zentrale Verwaltung von Bereichen, Reservierungen und Optionen mehrerer DHCP-Server
- Automatische Verschlüsselung der Leases
- Ersatz für DHCP-Relay
- Einrichtung von VLANs
! Zudem Überwachung der Bereichsauslastung.
