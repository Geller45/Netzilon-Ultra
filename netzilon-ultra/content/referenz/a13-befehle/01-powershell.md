---
id: ref-powershell
bereich: Referenz
block: A13
kapitel: Befehlsreferenz
titel: PowerShell-Befehlsreferenz (Windows Server)
stufe: Einsteiger
typ: referenz
quellen: [Eigene Zusammenstellung, Microsoft Learn PowerShell-Doku]
verweise: [ap1-a6-powershell, ap2-skripte-sql, legacy-tools-skripting]
---

## Profi

PowerShell-Cmdlets folgen dem Muster **Verb-Substantiv** (`Get-Service`, `New-ADUser`). Ausgaben sind **Objekte**, die man per **Pipeline** (`|`) filtert und weitergibt. Die häufigsten Verben: **Get** (lesen), **Set** (ändern), **New** (anlegen), **Remove** (löschen), **Add** (hinzufügen), **Enable/Disable**, **Start/Stop/Restart**, **Install/Uninstall**, **Test**.

Hilfe bekommt man mit `Get-Help <Cmdlet> -Examples`, Befehle findet man mit `Get-Command *stichwort*`, und Eigenschaften eines Ergebnisses mit `| Get-Member`. Gefährliche Befehle lassen sich mit **`-WhatIf`** (nur simulieren) und **`-Confirm`** (nachfragen) testen. Module wie **ActiveDirectory**, **DnsServer**, **DhcpServer**, **Hyper-V** und **GroupPolicy** kommen mit den Verwaltungstools der jeweiligen Rolle.

## Einfach

PowerShell ist wie ein **Bestellzettel mit festem Aufbau**: erst das **Tun-Wort** (Get, Set, New), dann **was** (Service, User, Route). „Get-Service“ heißt „Hol mir die Dienste“. Mit dem senkrechten Strich reichst du das Ergebnis an den nächsten weiter, wie an einem Fließband: erst alle Dienste holen, dann nur die **laufenden** behalten, dann nach **Namen** sortieren. Wenn du dir bei einem Befehl unsicher bist, fragst du `Get-Help`, und mit **`-WhatIf`** übst du erst mal, ohne dass etwas kaputtgeht.

## Merksatz
- Verb-Substantiv: **Get / Set / New / Remove / Add**.
- **`Get-Help`, `Get-Command`, `Get-Member`** = die drei Helfer.
- **`-WhatIf`** = nur simulieren, **`-Confirm`** = nachfragen.
- IP setzen: **`New-NetIPAddress` + `Set-DnsClientServerAddress`**.
- AD: **`Install-ADDSForest`** (erste Domäne), **`Install-ADDSDomainController`** (weiterer DC), **`Install-ADDSDomain`** (Kinddomäne).

## Prüfungsfalle
- `route add` ohne `-p` ist nicht dauerhaft, **`New-NetRoute`** speichert persistent.
- **`Unlock-ADAccount`** (gesperrt) ist etwas anderes als **`Enable-ADAccount`** (deaktiviert).
- **`Test-NetConnection -Port`** prüft **TCP**, nicht UDP.
- Der **AD-Papierkorb** lässt sich nach dem Aktivieren **nicht mehr abschalten**.
- **`Set-NetIPInterface -Forwarding Enabled`** macht den Server erst zum Router.

## Grafik

### Fließband
Ein Förderband mit vier Stationen: `Get-Service` (alle Dienste als Kisten), `Where-Object` (Filter lässt nur „Running“ durch), `Sort-Object` (ordnet nach Name), `Format-Table` (druckt die Liste). Ein Klick auf „-WhatIf“ lässt das Fließband mit Geisterkisten laufen, ohne etwas zu ändern.

## Befehle

### Grundlagen
- `Get-Help Get-Service -Examples` – Hilfe zu einem Cmdlet mit Beispielen
- `Update-Help` – Hilfedateien aktualisieren
- `Get-Command *service*` – Befehle nach Namensmuster suchen
- `Get-Member` – Eigenschaften und Methoden eines Objekts anzeigen
- `Get-Alias` – Aliase (z. B. ls, dir, gci) anzeigen
- `Where-Object` – Objekte in der Pipeline filtern
- `Select-Object Name, Status` – Bestimmte Eigenschaften auswählen
- `Sort-Object -Descending` – Objekte sortieren
- `ForEach-Object` – Für jedes Objekt der Pipeline einen Skriptblock ausführen
- `Format-Table -AutoSize` – Ausgabe als Tabelle formatieren
- `Export-Csv -Path a.csv -NoTypeInformation` – Objekte als CSV-Datei speichern
- `Import-Csv a.csv` – CSV-Datei als Objekte einlesen
- `$PSVersionTable` – Zeigt die PowerShell-Version
- `Get-ExecutionPolicy -List` – Ausführungsrichtlinien anzeigen

### System und Dienste
- `Get-Service` – Dienste und ihren Status anzeigen
- `Restart-Service Spooler` – Dienst neu starten
- `Set-Service -Name Spooler -StartupType Disabled` – Starttyp eines Dienstes ändern
- `Get-Process` – Laufende Prozesse anzeigen
- `Stop-Process -Name notepad` – Prozess beenden
- `Rename-Computer -NewName SRV01 -Restart` – Computer umbenennen und neu starten
- `Restart-Computer` – Computer neu starten
- `Get-WinEvent -LogName System -MaxEvents 20` – Letzte Ereignisse aus dem Systemprotokoll lesen
- `Get-HotFix` – Installierte Updates anzeigen
- `Get-ComputerInfo` – Ausführliche System- und Betriebssysteminformationen
- `Get-Volume` – Volumes mit Laufwerksbuchstaben und freiem Platz
- `Get-Disk` – Datenträger und Partitionsstil (MBR/GPT) anzeigen

### Netzwerk
- `Get-NetIPConfiguration` – Kompakte IP-Konfiguration aller Adapter
- `New-NetIPAddress -InterfaceAlias Ethernet -IPAddress 10.0.0.10 -PrefixLength 24 -DefaultGateway 10.0.0.1` – Statische IP-Adresse mit Präfix und Gateway setzen
- `Set-DnsClientServerAddress -InterfaceAlias Ethernet -ServerAddresses 10.0.0.2` – DNS-Server eines Adapters setzen
- `Get-NetAdapter` – Netzwerkadapter mit Status und Geschwindigkeit
- `Get-NetRoute` – Routingtabelle anzeigen
- `New-NetRoute -DestinationPrefix 10.2.0.0/24 -NextHop 10.1.0.254 -InterfaceAlias Ethernet` – Statische Route dauerhaft anlegen
- `Set-NetIPInterface -Forwarding Enabled` – IP-Weiterleitung (Routing) auf einer Schnittstelle aktivieren
- `Test-NetConnection 10.0.0.5 -Port 445` – Erreichbarkeit eines TCP-Ports prüfen
- `Resolve-DnsName www.example.com` – DNS-Namen auflösen
- `Clear-DnsClientCache` – DNS-Client-Cache leeren
- `Get-NetFirewallRule -Enabled True` – Aktive Firewallregeln anzeigen
- `New-NetFirewallRule -DisplayName "HTTP" -Direction Inbound -Protocol TCP -LocalPort 80 -Action Allow` – Eingehende Firewallregel anlegen
- `Set-NetFirewallProfile -Profile Domain -Enabled True` – Firewallprofil ein- oder ausschalten

### Dateien und Freigaben
- `Get-ChildItem C:\Daten -Recurse` – Ordnerinhalt rekursiv auflisten
- `New-Item -ItemType Directory -Path D:\Freigaben\HR` – Ordner anlegen
- `Copy-Item a.txt D:\Backup` – Datei kopieren
- `Remove-Item a.txt` – Datei löschen
- `Get-Content a.txt` – Textdatei einlesen
- `Get-Acl D:\Freigaben\HR` – NTFS-Berechtigungen (ACL) anzeigen
- `New-SmbShare -Name HR -Path D:\Freigaben\HR -FullAccess "Administratoren"` – SMB-Freigabe erstellen
- `Get-SmbShare` – SMB-Freigaben auflisten
- `Grant-SmbShareAccess -Name HR -AccountName "FIRMA\GG-HR" -AccessRight Change -Force` – Freigabeberechtigung vergeben

### Active Directory
- `Install-WindowsFeature AD-Domain-Services -IncludeManagementTools` – AD-DS-Rolle mit Verwaltungstools installieren
- `Install-ADDSForest -DomainName firma.local` – Neue Gesamtstruktur und erste Domäne erstellen
- `Install-ADDSDomainController -DomainName firma.local` – Zusätzlichen Domänencontroller heraufstufen
- `Add-Computer -DomainName firma.local -Credential FIRMA\Administrator` – Computer in die Domäne aufnehmen
- `New-ADOrganizationalUnit -Name Vertrieb -Path "DC=firma,DC=local"` – OU anlegen
- `New-ADUser -Name "Anna Beispiel" -SamAccountName abeispiel` – Benutzerkonto anlegen
- `Set-ADAccountPassword abeispiel -Reset` – Kennwort zurücksetzen
- `Unlock-ADAccount abeispiel` – Gesperrtes Konto entsperren
- `Disable-ADAccount abeispiel` – Konto deaktivieren
- `New-ADGroup -Name GG-HR -GroupScope Global` – Globale Sicherheitsgruppe anlegen
- `Add-ADGroupMember GG-HR -Members abeispiel` – Gruppenmitglied hinzufügen
- `Get-ADUser -Filter * -Properties LastLogonDate` – Benutzer mit weiteren Eigenschaften auflisten
- `Get-ADDomain` – Domäneninformationen (Funktionsebene, FSMO) anzeigen
- `Enable-ADOptionalFeature "Recycle Bin Feature" -Scope ForestOrConfigurationSet -Target firma.local` – AD-Papierkorb aktivieren (nicht umkehrbar)
- `Restore-ADObject` – Gelöschtes AD-Objekt aus dem Papierkorb wiederherstellen
- `Move-ADDirectoryServerOperationMasterRole -Identity DC02 -OperationMasterRole 0,1,2,3,4` – FSMO-Rollen kontrolliert übertragen
- `Test-ComputerSecureChannel -Repair` – Sicheren Kanal zur Domäne prüfen und reparieren
- `New-GPO -Name GPO-Test` – Neue Gruppenrichtlinie erstellen
- `New-GPLink -Name GPO-Test -Target "OU=Vertrieb,DC=firma,DC=local"` – GPO mit einer OU verknüpfen
- `Invoke-GPUpdate -Computer CL01 -Force` – GPO-Aktualisierung remote anstoßen

### DNS und DHCP
- `Add-DnsServerPrimaryZone -Name firma.local -ReplicationScope Domain` – AD-integrierte Forward-Lookupzone anlegen
- `Add-DnsServerResourceRecordA -Name web01 -ZoneName firma.local -IPv4Address 10.0.0.30` – A-Eintrag hinzufügen
- `Add-DnsServerForwarder -IPAddress 8.8.8.8` – DNS-Weiterleitung einrichten
- `Add-DnsServerConditionalForwarderZone -Name fabrikam.com -MasterServers 203.0.113.53` – Bedingte Weiterleitung anlegen
- `Install-WindowsFeature DHCP -IncludeManagementTools` – DHCP-Rolle installieren
- `Add-DhcpServerInDC` – DHCP-Server in AD autorisieren
- `Add-DhcpServerv4Scope -Name LAN -StartRange 10.0.0.100 -EndRange 10.0.0.200 -SubnetMask 255.255.255.0` – DHCP-Bereich anlegen
- `Add-DhcpServerv4ExclusionRange` – Ausschlussbereich definieren
- `Add-DhcpServerv4Reservation` – DHCP-Reservierung (MAC → feste IP) anlegen
- `Set-DhcpServerv4OptionValue -Router 10.0.0.1 -DnsServer 10.0.0.2` – Bereichsoptionen (Gateway, DNS) setzen

### Rollen, Remoting, Hyper-V
- `Get-WindowsFeature` – Rollen und Features mit Installationsstatus
- `Install-WindowsFeature Web-Server -IncludeManagementTools` – IIS-Rolle installieren
- `Uninstall-WindowsFeature` – Rolle oder Feature entfernen
- `Enable-PSRemoting -Force` – PowerShell-Remoting (WinRM) aktivieren
- `Enter-PSSession -ComputerName SRV01` – Interaktive Remotesitzung öffnen
- `Invoke-Command -ComputerName SRV01 -ScriptBlock { Get-Service }` – Befehl auf einem Remotecomputer ausführen
- `Enter-PSSession -VMName VM01 -Credential (Get-Credential)` – PowerShell Direct in eine Hyper-V-VM (ohne Netzwerk)
- `New-VM -Name VM01 -Generation 2 -MemoryStartupBytes 2GB` – Neue Hyper-V-VM anlegen
- `Start-VM VM01` – VM starten
- `Checkpoint-VM -Name VM01 -SnapshotName Vorher` – Prüfpunkt einer VM erstellen
- `New-VMSwitch -Name Extern -NetAdapterName Ethernet` – Virtuellen Switch anlegen
- `Get-VM` – VMs mit Status, CPU und RAM anzeigen

## Karteikarten
- F: Wofür steht/was bewirkt Get-Help Get-Service -Examples? | A: Hilfe zu einem Cmdlet mit Beispielen
- F: Wofür steht/was bewirkt Update-Help? | A: Hilfedateien aktualisieren
- F: Wofür steht/was bewirkt Get-Command *service*? | A: Befehle nach Namensmuster suchen
- F: Wofür steht/was bewirkt Get-Member? | A: Eigenschaften und Methoden eines Objekts anzeigen
- F: Wofür steht/was bewirkt Get-Alias? | A: Aliase (z. B. ls, dir, gci) anzeigen
- F: Wofür steht/was bewirkt Where-Object? | A: Objekte in der Pipeline filtern
- F: Wofür steht/was bewirkt Select-Object Name, Status? | A: Bestimmte Eigenschaften auswählen
- F: Wofür steht/was bewirkt Sort-Object -Descending? | A: Objekte sortieren
- F: Wofür steht/was bewirkt ForEach-Object? | A: Für jedes Objekt der Pipeline einen Skriptblock ausführen
- F: Wofür steht/was bewirkt Format-Table -AutoSize? | A: Ausgabe als Tabelle formatieren
- F: Wofür steht/was bewirkt Export-Csv -Path a.csv -NoTypeInformation? | A: Objekte als CSV-Datei speichern
- F: Wofür steht/was bewirkt Import-Csv a.csv? | A: CSV-Datei als Objekte einlesen
- F: Wofür steht/was bewirkt $PSVersionTable? | A: Zeigt die PowerShell-Version
- F: Wofür steht/was bewirkt Get-ExecutionPolicy -List? | A: Ausführungsrichtlinien anzeigen
- F: Wofür steht/was bewirkt Get-Service? | A: Dienste und ihren Status anzeigen
- F: Wofür steht/was bewirkt Restart-Service Spooler? | A: Dienst neu starten
- F: Wofür steht/was bewirkt Set-Service -Name Spooler -StartupType Disabled? | A: Starttyp eines Dienstes ändern
- F: Wofür steht/was bewirkt Get-Process? | A: Laufende Prozesse anzeigen
- F: Wofür steht/was bewirkt Stop-Process -Name notepad? | A: Prozess beenden
- F: Wofür steht/was bewirkt Rename-Computer -NewName SRV01 -Restart? | A: Computer umbenennen und neu starten
- F: Wofür steht/was bewirkt Restart-Computer? | A: Computer neu starten
- F: Wofür steht/was bewirkt Get-WinEvent -LogName System -MaxEvents 20? | A: Letzte Ereignisse aus dem Systemprotokoll lesen
- F: Wofür steht/was bewirkt Get-HotFix? | A: Installierte Updates anzeigen
- F: Wofür steht/was bewirkt Get-ComputerInfo? | A: Ausführliche System- und Betriebssysteminformationen
- F: Wofür steht/was bewirkt Get-Volume? | A: Volumes mit Laufwerksbuchstaben und freiem Platz
- F: Wofür steht/was bewirkt Get-Disk? | A: Datenträger und Partitionsstil (MBR/GPT) anzeigen
- F: Wofür steht/was bewirkt Get-NetIPConfiguration? | A: Kompakte IP-Konfiguration aller Adapter
- F: Wofür steht/was bewirkt New-NetIPAddress -InterfaceAlias Ethernet -IPAddress 10.0.0.10 -PrefixLength 24 -DefaultGateway 10.0.0.1? | A: Statische IP-Adresse mit Präfix und Gateway setzen
- F: Wofür steht/was bewirkt Set-DnsClientServerAddress -InterfaceAlias Ethernet -ServerAddresses 10.0.0.2? | A: DNS-Server eines Adapters setzen
- F: Wofür steht/was bewirkt Get-NetAdapter? | A: Netzwerkadapter mit Status und Geschwindigkeit
- F: Wofür steht/was bewirkt Get-NetRoute? | A: Routingtabelle anzeigen
- F: Wofür steht/was bewirkt New-NetRoute -DestinationPrefix 10.2.0.0/24 -NextHop 10.1.0.254 -InterfaceAlias Ethernet? | A: Statische Route dauerhaft anlegen
- F: Wofür steht/was bewirkt Set-NetIPInterface -Forwarding Enabled? | A: IP-Weiterleitung (Routing) auf einer Schnittstelle aktivieren
- F: Wofür steht/was bewirkt Test-NetConnection 10.0.0.5 -Port 445? | A: Erreichbarkeit eines TCP-Ports prüfen
- F: Wofür steht/was bewirkt Resolve-DnsName www.example.com? | A: DNS-Namen auflösen
- F: Wofür steht/was bewirkt Clear-DnsClientCache? | A: DNS-Client-Cache leeren
- F: Wofür steht/was bewirkt Get-NetFirewallRule -Enabled True? | A: Aktive Firewallregeln anzeigen
- F: Wofür steht/was bewirkt New-NetFirewallRule -DisplayName "HTTP" -Direction Inbound -Protocol TCP -LocalPort 80 -Action Allow? | A: Eingehende Firewallregel anlegen
- F: Wofür steht/was bewirkt Set-NetFirewallProfile -Profile Domain -Enabled True? | A: Firewallprofil ein- oder ausschalten
- F: Wofür steht/was bewirkt Get-ChildItem C:\Daten -Recurse? | A: Ordnerinhalt rekursiv auflisten
- F: Wofür steht/was bewirkt New-Item -ItemType Directory -Path D:\Freigaben\HR? | A: Ordner anlegen
- F: Wofür steht/was bewirkt Copy-Item a.txt D:\Backup? | A: Datei kopieren
- F: Wofür steht/was bewirkt Remove-Item a.txt? | A: Datei löschen
- F: Wofür steht/was bewirkt Get-Content a.txt? | A: Textdatei einlesen
- F: Wofür steht/was bewirkt Get-Acl D:\Freigaben\HR? | A: NTFS-Berechtigungen (ACL) anzeigen
- F: Wofür steht/was bewirkt New-SmbShare -Name HR -Path D:\Freigaben\HR -FullAccess "Administratoren"? | A: SMB-Freigabe erstellen
- F: Wofür steht/was bewirkt Get-SmbShare? | A: SMB-Freigaben auflisten
- F: Wofür steht/was bewirkt Grant-SmbShareAccess -Name HR -AccountName "FIRMA\GG-HR" -AccessRight Change -Force? | A: Freigabeberechtigung vergeben
- F: Wofür steht/was bewirkt Install-WindowsFeature AD-Domain-Services -IncludeManagementTools? | A: AD-DS-Rolle mit Verwaltungstools installieren
- F: Wofür steht/was bewirkt Install-ADDSForest -DomainName firma.local? | A: Neue Gesamtstruktur und erste Domäne erstellen
- F: Wofür steht/was bewirkt Install-ADDSDomainController -DomainName firma.local? | A: Zusätzlichen Domänencontroller heraufstufen
- F: Wofür steht/was bewirkt Add-Computer -DomainName firma.local -Credential FIRMA\Administrator? | A: Computer in die Domäne aufnehmen
- F: Wofür steht/was bewirkt New-ADOrganizationalUnit -Name Vertrieb -Path "DC=firma,DC=local"? | A: OU anlegen
- F: Wofür steht/was bewirkt New-ADUser -Name "Anna Beispiel" -SamAccountName abeispiel? | A: Benutzerkonto anlegen
- F: Wofür steht/was bewirkt Set-ADAccountPassword abeispiel -Reset? | A: Kennwort zurücksetzen
- F: Wofür steht/was bewirkt Unlock-ADAccount abeispiel? | A: Gesperrtes Konto entsperren
- F: Wofür steht/was bewirkt Disable-ADAccount abeispiel? | A: Konto deaktivieren
- F: Wofür steht/was bewirkt New-ADGroup -Name GG-HR -GroupScope Global? | A: Globale Sicherheitsgruppe anlegen
- F: Wofür steht/was bewirkt Add-ADGroupMember GG-HR -Members abeispiel? | A: Gruppenmitglied hinzufügen
- F: Wofür steht/was bewirkt Get-ADUser -Filter * -Properties LastLogonDate? | A: Benutzer mit weiteren Eigenschaften auflisten
- F: Wofür steht/was bewirkt Get-ADDomain? | A: Domäneninformationen (Funktionsebene, FSMO) anzeigen
- F: Wofür steht/was bewirkt Enable-ADOptionalFeature "Recycle Bin Feature" -Scope ForestOrConfigurationSet -Target firma.local? | A: AD-Papierkorb aktivieren (nicht umkehrbar)
- F: Wofür steht/was bewirkt Restore-ADObject? | A: Gelöschtes AD-Objekt aus dem Papierkorb wiederherstellen
- F: Wofür steht/was bewirkt Move-ADDirectoryServerOperationMasterRole -Identity DC02 -OperationMasterRole 0,1,2,3,4? | A: FSMO-Rollen kontrolliert übertragen
- F: Wofür steht/was bewirkt Test-ComputerSecureChannel -Repair? | A: Sicheren Kanal zur Domäne prüfen und reparieren
- F: Wofür steht/was bewirkt New-GPO -Name GPO-Test? | A: Neue Gruppenrichtlinie erstellen
- F: Wofür steht/was bewirkt New-GPLink -Name GPO-Test -Target "OU=Vertrieb,DC=firma,DC=local"? | A: GPO mit einer OU verknüpfen
- F: Wofür steht/was bewirkt Invoke-GPUpdate -Computer CL01 -Force? | A: GPO-Aktualisierung remote anstoßen
- F: Wofür steht/was bewirkt Add-DnsServerPrimaryZone -Name firma.local -ReplicationScope Domain? | A: AD-integrierte Forward-Lookupzone anlegen
- F: Wofür steht/was bewirkt Add-DnsServerResourceRecordA -Name web01 -ZoneName firma.local -IPv4Address 10.0.0.30? | A: A-Eintrag hinzufügen
- F: Wofür steht/was bewirkt Add-DnsServerForwarder -IPAddress 8.8.8.8? | A: DNS-Weiterleitung einrichten
- F: Wofür steht/was bewirkt Add-DnsServerConditionalForwarderZone -Name fabrikam.com -MasterServers 203.0.113.53? | A: Bedingte Weiterleitung anlegen
- F: Wofür steht/was bewirkt Install-WindowsFeature DHCP -IncludeManagementTools? | A: DHCP-Rolle installieren
- F: Wofür steht/was bewirkt Add-DhcpServerInDC? | A: DHCP-Server in AD autorisieren
- F: Wofür steht/was bewirkt Add-DhcpServerv4Scope -Name LAN -StartRange 10.0.0.100 -EndRange 10.0.0.200 -SubnetMask 255.255.255.0? | A: DHCP-Bereich anlegen
- F: Wofür steht/was bewirkt Add-DhcpServerv4ExclusionRange? | A: Ausschlussbereich definieren
- F: Wofür steht/was bewirkt Add-DhcpServerv4Reservation? | A: DHCP-Reservierung (MAC → feste IP) anlegen
- F: Wofür steht/was bewirkt Set-DhcpServerv4OptionValue -Router 10.0.0.1 -DnsServer 10.0.0.2? | A: Bereichsoptionen (Gateway, DNS) setzen
- F: Wofür steht/was bewirkt Get-WindowsFeature? | A: Rollen und Features mit Installationsstatus
- F: Wofür steht/was bewirkt Install-WindowsFeature Web-Server -IncludeManagementTools? | A: IIS-Rolle installieren
- F: Wofür steht/was bewirkt Uninstall-WindowsFeature? | A: Rolle oder Feature entfernen
- F: Wofür steht/was bewirkt Enable-PSRemoting -Force? | A: PowerShell-Remoting (WinRM) aktivieren
- F: Wofür steht/was bewirkt Enter-PSSession -ComputerName SRV01? | A: Interaktive Remotesitzung öffnen
- F: Wofür steht/was bewirkt Invoke-Command -ComputerName SRV01 -ScriptBlock { Get-Service }? | A: Befehl auf einem Remotecomputer ausführen
- F: Wofür steht/was bewirkt Enter-PSSession -VMName VM01 -Credential (Get-Credential)? | A: PowerShell Direct in eine Hyper-V-VM (ohne Netzwerk)
- F: Wofür steht/was bewirkt New-VM -Name VM01 -Generation 2 -MemoryStartupBytes 2GB? | A: Neue Hyper-V-VM anlegen
- F: Wofür steht/was bewirkt Start-VM VM01? | A: VM starten
- F: Wofür steht/was bewirkt Checkpoint-VM -Name VM01 -SnapshotName Vorher? | A: Prüfpunkt einer VM erstellen
- F: Wofür steht/was bewirkt New-VMSwitch -Name Extern -NetAdapterName Ethernet? | A: Virtuellen Switch anlegen
- F: Wofür steht/was bewirkt Get-VM? | A: VMs mit Status, CPU und RAM anzeigen

## Quiz

? Was bewirkt `Enable-PSRemoting -Force`?
* PowerShell-Remoting (WinRM) aktivieren
- CSV-Datei als Objekte einlesen
- Ausschlussbereich definieren
- Kennwort zurücksetzen

? Was bewirkt `Get-Service`?
* Dienste und ihren Status anzeigen
- Aliase (z. B. ls, dir, gci) anzeigen
- Eigenschaften und Methoden eines Objekts anzeigen
- CSV-Datei als Objekte einlesen

? Was bewirkt `Get-Member`?
* Eigenschaften und Methoden eines Objekts anzeigen
- Datei kopieren
- Textdatei einlesen
- Rollen und Features mit Installationsstatus

? Was bewirkt `Clear-DnsClientCache`?
* DNS-Client-Cache leeren
- Eigenschaften und Methoden eines Objekts anzeigen
- PowerShell Direct in eine Hyper-V-VM (ohne Netzwerk)
- Datenträger und Partitionsstil (MBR/GPT) anzeigen

? Was bewirkt `New-NetRoute -DestinationPrefix 10.2.0.0/24 -NextHop 10.1.0.254 -InterfaceAlias Ethernet`?
* Statische Route dauerhaft anlegen
- Interaktive Remotesitzung öffnen
- GPO mit einer OU verknüpfen
- Datei kopieren

? Was bewirkt `Set-DnsClientServerAddress -InterfaceAlias Ethernet -ServerAddresses 10.0.0.2`?
* DNS-Server eines Adapters setzen
- DNS-Weiterleitung einrichten
- Virtuellen Switch anlegen
- AD-DS-Rolle mit Verwaltungstools installieren

? Was bewirkt `Get-Process`?
* Laufende Prozesse anzeigen
- Hilfe zu einem Cmdlet mit Beispielen
- IP-Weiterleitung (Routing) auf einer Schnittstelle aktivieren
- GPO mit einer OU verknüpfen

? Was bewirkt `Get-ExecutionPolicy -List`?
* Ausführungsrichtlinien anzeigen
- Globale Sicherheitsgruppe anlegen
- Neue Gesamtstruktur und erste Domäne erstellen
- Erreichbarkeit eines TCP-Ports prüfen

? Was bewirkt `Start-VM VM01`?
* VM starten
- Statische IP-Adresse mit Präfix und Gateway setzen
- Textdatei einlesen
- Ausführungsrichtlinien anzeigen

? Was bewirkt `Add-DnsServerResourceRecordA -Name web01 -ZoneName firma.local -IPv4Address 10.0.0.30`?
* A-Eintrag hinzufügen
- CSV-Datei als Objekte einlesen
- AD-DS-Rolle mit Verwaltungstools installieren
- Zeigt die PowerShell-Version
