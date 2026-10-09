---
id: az800-dcs-azure
bereich: AZ-800
block: A7
kapitel: AD DS on-premises & Cloud
titel: Domänencontroller in Azure (IaaS)
stufe: Profi
quellen: [AZ-800 Study Guide, Microsoft Learn]
verweise: [az800-adds-dc, az800-azure-vms, az800-s2s-vpn, az800-standorte-replikation, az800-join-entra]
---

## Profi

### Warum DCs in Azure?
- **Hybride Umgebung**: Server/Anwendungen laufen als Azure-VMs und brauchen **lokale Authentifizierung** (Kerberos, LDAP, GPOs) mit geringer Latenz.
- **Ausfallsicherheit/Disaster Recovery**: Azure als weiterer „Standort“ – fällt das eigene Rechenzentrum aus, existiert AD weiter.
- **Migration** von Anwendungen in die Cloud (Lift-and-Shift), die AD voraussetzen.

### Drei Optionen für „AD in Azure“
| Option | Was ist das? | Verwaltung | Einsatz |
|---|---|---|---|
| **AD DS auf Azure-VMs** (IaaS) | klassische DCs als Windows-Server-VMs, Teil der **eigenen** Domäne | voll durch den Admin (Domänen-Admin, Schema, GPOs) | Erweiterung der on-prem-Domäne |
| **Microsoft Entra Domain Services** (früher Azure AD DS) | **verwalteter** Dienst: Microsoft betreibt zwei DCs, synchronisiert aus Entra ID | eingeschränkt: kein Domänen-Admin, kein Schema-Admin, eigene OUs/GPOs möglich | Lift-and-Shift ohne eigene DCs |
| **Microsoft Entra ID** | Cloud-Identitätsdienst (OAuth/OIDC/SAML), **kein** LDAP/Kerberos/GPO | Portal, Graph | Cloud-Apps, Microsoft 365, moderne Geräteverwaltung |

### Planung von DCs auf Azure-VMs
- **Netzwerk**: Azure-**VNet** muss mit dem lokalen Netz verbunden sein – **Site-to-Site-VPN** (VPN Gateway) oder **ExpressRoute** (private Leitung). Für eine **neue, isolierte** Gesamtstruktur in Azure ist keine Verbindung nötig.
- **Statische IP**: Die private IP der DC-NIC in Azure auf **Statisch** setzen (in Azure, **nicht** im Gastbetriebssystem – dort bleibt DHCP!). Im Gast keine manuelle IP eintragen.
- **DNS des VNets**: Unter VNet → DNS-Server **„Benutzerdefiniert“** → IPs der DCs (Azure-DCs + ggf. on-prem-DCs) eintragen, damit alle VMs im VNet die DCs als DNS nutzen. Nach dem Ändern VMs neu starten.
- **Datenträger**: AD-Datenbank, Protokolle und SYSVOL auf einen **separaten Datenträger** mit **Hostcache „Keiner“** (None) legen – Schreibcaching gefährdet die AD-Konsistenz. Das Betriebssystem-Volume hat standardmäßig Lese-/Schreibcache.
- **Verfügbarkeit**: mindestens **zwei DCs** in einer **Verfügbarkeitsgruppe** oder in **verschiedenen Verfügbarkeitszonen**.
- **AD-Standort**: In „AD-Standorte und -Dienste“ einen eigenen **Standort „Azure“** mit dem **VNet-Adressraum als Subnetz** anlegen und per **Standortverknüpfung** mit dem Hauptstandort verbinden → Clients in Azure nutzen die Azure-DCs, Replikation über die Verknüpfung wird planbar.
- **RODC** in Azure erwägen, wenn die Umgebung als weniger vertrauenswürdig gilt.
- **Sicherheit**: Keine öffentlichen IPs für DCs, NSGs (Network Security Groups) nur für benötigte Ports (DNS 53, Kerberos 88, LDAP 389/636, GC 3268/3269, SMB 445, RPC 135 + dynamisch), Verwaltung über **Azure Bastion** oder VPN, Azure Backup für Systemstatus.
- **Nicht** per Azure-„Neu bereitstellen“/Snapshot-Wiederherstellung zurücksetzen (USN-Rollback; VM-Generation-ID wird in Azure unterstützt, trotzdem Systemstatus-Backups nutzen).

### Ablauf (Überblick)
1. VNet + Subnetz planen (Adressraum darf **nicht** mit on-prem überlappen).
2. S2S-VPN/ExpressRoute zwischen on-prem und VNet.
3. VNet-DNS auf on-prem-DCs zeigen lassen (für den Beitritt).
4. Windows-Server-VM erstellen, statische private IP, zusätzlicher Datendisk ohne Cache.
5. VM der Domäne beitreten, AD DS installieren, **zusätzlichen DC** heraufstufen (DB/SYSVOL auf den Datendisk, z. B. F:).
6. AD-Standort „Azure“ + Subnetz + Standortverknüpfung.
7. VNet-DNS auf die Azure-DCs (und on-prem als Backup) umstellen.

## Lab
**Voraussetzung**: Azure-Abonnement (kostenpflichtig) – sonst nur Konzept. Maschinen: Azure-VM **AZDC01**, on-prem **DC01**.

### GUI (Azure-Portal)
1. **Portal**: Virtuelle Netzwerke → **vnet-hybrid** (10.50.0.0/16), Subnetz **snet-dc** (10.50.1.0/24).
2. VPN Gateway + lokales Netzwerkgateway + Verbindung zum on-prem-Router (Site-to-Site) – siehe Seite S2S-VPN.
3. **vnet-hybrid → DNS-Server → Benutzerdefiniert** → 192.168.1.1 (DC01).
4. VM **AZDC01** (Windows Server 2025, keine öffentliche IP) → **Datenträger**: zusätzlicher Datenträger 32 GB, **Hostcaching: Keine**.
5. AZDC01 → Netzwerk → NIC → IP-Konfigurationen → **Statisch** 10.50.1.4.
6. **AZDC01** (per Bastion): Datendisk initialisieren (F:), Domäne contoso.local beitreten, AD DS installieren, heraufstufen mit Pfaden `F:\NTDS`, `F:\SYSVOL`.
7. **DC01**: `dssite.msc` → Standort **Azure** → Subnetz 10.50.0.0/16 → Standortverknüpfung.
8. **Portal**: VNet-DNS → 10.50.1.4, 192.168.1.1.

### PowerShell
```powershell
# Azure (Az-Modul, auf dem Admin-PC)
$nic = Get-AzNetworkInterface -Name "azdc01-nic" -ResourceGroupName "rg-hybrid"
$nic.IpConfigurations[0].PrivateIpAllocationMethod = "Static"
$nic.IpConfigurations[0].PrivateIpAddress = "10.50.1.4"
Set-AzNetworkInterface -NetworkInterface $nic
$vnet = Get-AzVirtualNetwork -Name vnet-hybrid -ResourceGroupName rg-hybrid
$vnet.DhcpOptions.DnsServers = @("10.50.1.4","192.168.1.1"); Set-AzVirtualNetwork -VirtualNetwork $vnet

# Auf AZDC01
Get-Disk | Where PartitionStyle -eq RAW | Initialize-Disk -PassThru | New-Partition -DriveLetter F -UseMaximumSize | Format-Volume -FileSystem NTFS
Add-Computer -DomainName contoso.local -Restart
Install-WindowsFeature AD-Domain-Services -IncludeManagementTools
Install-ADDSDomainController -DomainName contoso.local -InstallDns -SiteName "Azure" `
  -DatabasePath F:\NTDS -LogPath F:\NTDS -SysvolPath F:\SYSVOL -Credential (Get-Credential) `
  -SafeModeAdministratorPassword (Read-Host -AsSecureString) -Force

# Auf DC01 – Standort
New-ADReplicationSite -Name "Azure"
New-ADReplicationSubnet -Name "10.50.0.0/16" -Site "Azure"
New-ADReplicationSiteLink -Name "HQ-Azure" -SitesIncluded "Default-First-Site-Name","Azure" -Cost 100 -ReplicationFrequencyInMinutes 15
```

## Einfach

Stell dir vor, deine Firma eröffnet eine **Filiale in der Cloud** (Azure). Die Mitarbeiter und Programme dort wollen sich auch anmelden – und zwar schnell, ohne jedes Mal ins Hauptbüro zu telefonieren. Also stellt man dort ein **eigenes Einwohnermeldeamt (DC)** auf.

Dafür braucht es:
- einen **Tunnel** zwischen Hauptbüro und Cloud (VPN), damit die Ämter ihre Akten abgleichen können;
- eine **feste Adresse** für das Cloud-Amt – aber Achtung: Die feste Adresse stellt man **in Azure** ein, nicht im Windows selbst;
- einen **Schrank ohne Zwischenablage** für die Akten: Die AD-Datenbank kommt auf eine Extra-Festplatte ohne Schreib-Cache, damit nichts „halb gespeichert“ verloren geht;
- ein **Schild „Filiale Azure“** (AD-Standort), damit Cloud-Computer das Cloud-Amt benutzen und nicht über den Tunnel ins Hauptbüro laufen.

**Drei Möglichkeiten**:
1. **Eigenes Amt auf einer Cloud-VM** – du machst alles selbst (volle Kontrolle).
2. **Entra Domain Services** – Microsoft betreibt das Amt für dich, du darfst aber nicht alles (kein Chef-Schlüssel).
3. **Entra ID** – ein ganz anderes, modernes Anmeldesystem für Cloud-Apps (ohne die alten Amts-Formulare wie GPOs).

## Merksatz
- Statische IP **in Azure**, im Gast **DHCP** lassen.
- AD-Daten auf **Datendisk mit Hostcache „Keiner“**.
- **VNet-DNS** auf die DCs setzen.
- Eigener **AD-Standort** für das Azure-VNet.
- IaaS-DC ≠ Entra Domain Services ≠ Entra ID.

## Prüfungsfalle
- IP im Gastbetriebssystem statisch setzen → Verbindungsverlust in Azure.
- NTDS auf OS-Disk bzw. Datendisk mit Schreibcache.
- Überlappende Adressräume zwischen VNet und on-prem verhindern das VPN.
- Entra Domain Services bietet keine Domänen-Admin-Rechte.
- DNS-Änderungen am VNet greifen erst nach Neustart der VMs.

## Grafik
### Cloud-Filiale
On-prem-Gebäude mit DC01, Tunnel (S2S-VPN) zur Azure-Wolke mit VNet und AZDC01; Replikationspfeile laufen über den Tunnel; Clients in Azure fragen den nahen DC (kurzer Pfeil).

### Datendisk-Cache
Zwei Festplatten-Symbole: OS-Disk mit Cache (Blitz) und Datendisk „Hostcache: Keine“ mit NTDS-Ordner; rotes Kreuz, wenn NTDS auf der Cache-Disk liegt.

### Drei Optionen
Drei Säulen (IaaS-DC, Entra DS, Entra ID) mit Symbolen für Kontrolle, Protokolle (Kerberos/LDAP vs. OAuth) und Aufwand.

## Karteikarten
- F: Wo wird die statische IP eines DCs in Azure konfiguriert? | A: An der Azure-NIC (Portal/PowerShell), nicht im Gastbetriebssystem.
- F: Welche Hostcache-Einstellung für den NTDS-Datenträger? | A: Keine (None).
- F: Wie verbindet man on-prem und Azure-VNet für die AD-Replikation? | A: Site-to-Site-VPN oder ExpressRoute.
- F: Wie sorgt man dafür, dass Azure-VMs die DCs als DNS nutzen? | A: VNet → DNS-Server → Benutzerdefiniert → DC-IPs.
- F: Warum einen eigenen AD-Standort für Azure? | A: Clients authentifizieren beim nächstgelegenen DC; Replikation über Standortverknüpfung steuerbar.
- F: Unterschied Entra Domain Services und DCs auf Azure-VMs? | A: Entra DS ist verwaltet (keine Domänen-Admin-Rechte, Sync aus Entra ID); VMs sind vollwertige eigene DCs.
- F: Unterstützt Entra ID GPOs und Kerberos? | A: Nein – Cloud-Protokolle (OAuth/OIDC/SAML), keine GPOs/LDAP.
- F: Wie erreicht man Hochverfügbarkeit für Azure-DCs? | A: Mindestens zwei DCs in Verfügbarkeitszonen oder einer Verfügbarkeitsgruppe.

## Quiz
? Wo wird die private IP eines Azure-DCs statisch festgelegt?
* In der IP-Konfiguration der Azure-Netzwerkschnittstelle
- In den IPv4-Eigenschaften im Gastbetriebssystem
- In der DHCP-Konsole des DCs
- Im DNS-Manager

? Welche Cache-Einstellung ist für den Datenträger mit der AD-Datenbank korrekt?
* Keine
- Lesen/Schreiben
- Nur Schreiben
- Automatisch

? Ein Unternehmen möchte AD-abhängige Apps in Azure betreiben, aber keine eigenen DCs verwalten. Welche Lösung?
* Microsoft Entra Domain Services
- Nur Microsoft Entra ID ohne Zusatzdienst
- AD LDS auf dem Client
- Ein RODC on-premises

? Was muss nach dem Hinzufügen der DC-IPs als VNet-DNS geschehen, damit bestehende VMs sie nutzen?
* Die VMs neu starten
- Die VMs löschen
- Das VPN Gateway entfernen
- Den Schemamaster verschieben

? Welche Verbindung wird benötigt, damit ein Azure-DC mit on-prem-DCs repliziert?
* Site-to-Site-VPN oder ExpressRoute
- Nur eine öffentliche IP pro DC
- Azure DNS Private Zones allein
- Point-to-Site-VPN eines Admins

? Welches Azure-Merkmal schützt DCs vor gleichzeitigem Ausfall in einer Region?
* Verfügbarkeitszonen bzw. Verfügbarkeitsgruppen
- Ressourcengruppen
- Tags
- Azure Policy
! Mindestens zwei DCs auf verschiedene Zonen verteilen.

? Warum sollten AD-Datenbank, Protokolle und SYSVOL auf einem Azure-Datenträger ohne Host-Schreibcache liegen?
* Damit Schreibvorgänge sofort dauerhaft gespeichert werden und die AD-Datenbank konsistent bleibt
- Weil sonst keine IP-Adresse vergeben wird
- Weil Azure sonst den DC löscht
- Weil die Lizenz es verlangt
! Host-Caching „None“ für den Datenträger mit NTDS und SYSVOL.

? Wie sollten Azure-DCs ihre IP-Adressen erhalten?
* Statisch in der Azure-Netzwerkschnittstelle (nicht im Gast-Betriebssystem eingetragen)
- Per APIPA
- Dynamisch ohne Reservierung
- Über einen öffentlichen DNS-Dienst
! Im Gast bleibt DHCP aktiv; Azure liefert immer dieselbe Adresse.

? Wie gelangen on-prem-Benutzer in einem hybriden Szenario zu einem Azure-DC derselben Domäne?
* Über AD-Replikation per Site-to-Site-VPN oder ExpressRoute
- Durch Kopieren der NTDS.dit
- Durch Export in eine CSV-Datei
- Durch Entra Connect allein
! Der Azure-DC ist ein regulärer zusätzlicher DC, idealerweise in eigenem AD-Standort.
