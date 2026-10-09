---
id: az800-azure-network-adapter
bereich: AZ-800
block: A7
kapitel: Netzwerkinfrastruktur
titel: Azure Network Adapter, Azure Extended Network & Azure Relay
stufe: Profi
quellen: [AZ-800 Study Guide, Microsoft Learn]
verweise: [az800-wac, az800-s2s-vpn, az800-vpn, az800-azure-vms, az800-webanwendungsproxy]
---

## Profi

Drei Werkzeuge verbinden **einzelne on-prem-Server oder -Dienste** mit Azure, ohne gleich das ganze Netz zu koppeln.

### 1. Azure Network Adapter
| Punkt | Details |
|---|---|
| Zweck | **einen einzelnen** Windows-Server (on-prem) per VPN mit einem **Azure-VNet** verbinden |
| Technik | **Point-to-Site-VPN** (P2S) vom Server zum **Azure VPN Gateway**; Protokolle **IKEv2/SSTP**; Authentifizierung über **Zertifikat** (selbstsigniertes Stammzertifikat wird automatisch erzeugt und hochgeladen) |
| Einrichtung | ausschließlich über **Windows Admin Center** (WAC muss bei Azure registriert sein) → Server → **Netzwerk** → **Azure Network Adapter hinzufügen** |
| Gateway | WAC kann das VPN Gateway **neu erstellen** (Subnetz `GatewaySubnet`, P2S-Clientadresspool, SKU z. B. VpnGw1) oder ein **vorhandenes** nutzen; Erstellung dauert **bis zu 45 Minuten** |
| Voraussetzungen | Server 2012 R2 oder neuer, Azure-Abonnement, **VNet** vorhanden, **routenbasiertes** Gateway (Basic-SKU unterstützt kein IKEv2) |
| Einsatz | Server braucht Zugriff auf Azure-VMs/Dienste, aber kein komplettes Site-to-Site nötig (z. B. Backup-Server, Test, kleine Außenstelle) |
| Nicht | kein Netzwerkzugang für andere Geräte im on-prem-Netz (nur dieser eine Server) |

### 2. Azure Extended Network
| Punkt | Details |
|---|---|
| Zweck | ein **on-prem-Subnetz nach Azure verlängern** (Layer-2-Stretch) – migrierte VMs **behalten ihre IP-Adressen** |
| Technik | zwei **Appliance-VMs** mit **Windows Server 2022 Datacenter: Azure Edition** (eine on-prem auf Hyper-V/Azure Local, eine in Azure) bauen einen **VXLAN**-Tunnel über bestehendes **S2S-VPN oder ExpressRoute** |
| Einrichtung | Windows Admin Center → Erweiterung **Azure Extended Network** |
| Netzwerk | Appliance on-prem: NIC im zu verlängernden Subnetz + NIC im Routing-Netz; Appliance Azure: NIC im **verlängerten Azure-Subnetz** (gleicher Adressbereich wie on-prem) + NIC im erreichbaren Subnetz |
| Einsatz | **schrittweise Migration** in Azure, Apps mit fest codierten IPs, keine Neu-Adressierung möglich |
| Einschränkungen | nur **IPv4**, verlängerte Adressen in Azure müssen **manuell** in der Appliance angegeben werden; langfristig Neu-Adressierung empfohlen (Übergangslösung) |

### 3. Azure Relay
| Punkt | Details |
|---|---|
| Zweck | on-prem-Dienst **aus der Cloud erreichbar machen**, **ohne** eingehende Firewallports, VPN oder Änderungen am Unternehmensnetz |
| Technik | on-prem-Listener baut eine **ausgehende** Verbindung (WebSockets/HTTPS **443**) zu einem **Relay-Namespace** in Azure auf; Clients verbinden sich mit dem Namespace, Azure leitet durch |
| Varianten | **Hybridverbindungen** (*Hybrid Connections*, WebSockets, plattformunabhängig) und **WCF Relay** (Legacy, .NET-WCF) |
| App Service Hybrid Connections | Azure **Web Apps** greifen auf **einen bestimmten Host:Port** on-prem zu (z. B. `SQL01:1433`); on-prem läuft der **Hybrid Connection Manager (HCM)** |
| Sicherheit | Zugriff über **SAS-Schlüssel** (Shared Access Signature) bzw. Entra ID |
| Unterschied zu VPN | kein Netzwerkzugang, nur **gezielte Anwendungsverbindung**; kein UDP |

### Entscheidungshilfe
| Anforderung | Lösung |
|---|---|
| **Ein** Server soll ins Azure-VNet | Azure Network Adapter |
| **Ganzes Büro** soll ins Azure-VNet | Site-to-Site-VPN / ExpressRoute |
| Migrierte VMs sollen **IP behalten** | Azure Extended Network |
| Azure-Web-App soll **on-prem-Datenbank** erreichen, keine Firewalländerung | App Service Hybrid Connections (Azure Relay) |
| Interne Web-App **extern veröffentlichen** | WAP / Entra-Anwendungsproxy |

## Lab
**Maschinen**: **ADMIN01** (Windows Admin Center, bei Azure registriert), **SRV01** (on-prem, Server 2022), **SQL01** (on-prem SQL Server, Port 1433), Azure: **VNet-Netzilon** (10.10.0.0/16), **AZ-SRV01** (10.10.1.4), Web-App **netzilon-web**.

### GUI
1. **ADMIN01**: WAC → Einstellungen → **Azure** → **Registrieren** (Entra-App-Registrierung für WAC, Admin-Zustimmung erteilen).
2. **ADMIN01**: WAC → SRV01 verbinden → **Netzwerk** → **Aktionen → Azure Network Adapter hinzufügen (Vorschau)** → Abonnement, Region, **VNet-Netzilon** → „Neues VPN Gateway erstellen“ → Gateway-Subnetz 10.10.255.0/27, Clientadresspool 172.16.200.0/24 → Erstellen (Wartezeit bis 45 Min.).
3. **SRV01**: `ipconfig` → neue VPN-Schnittstelle mit Adresse aus 172.16.200.0/24 → `Test-NetConnection 10.10.1.4 -Port 3389`.
4. **ADMIN01**: WAC → SRV01 → Netzwerk → Azure Network Adapter **Trennen/Entfernen** (Gateway bleibt in Azure bestehen → ggf. im Portal löschen, verursacht Kosten).
5. **Admin-PC**: Azure-Portal → Web-App **netzilon-web** → **Netzwerk** → **Hybridverbindungen** → Hinzufügen → Name `sql01`, Endpunkthost `SQL01`, Port `1433`, neuen **Relay-Namespace** erstellen.
6. **SQL01** (oder anderer on-prem-Server im selben Netz): **Hybrid Connection Manager** aus dem Portal herunterladen und installieren → mit Azure anmelden → Verbindung `sql01` auswählen → Status **Verbunden**.
7. Web-App nutzt Verbindungszeichenfolge `Server=SQL01,1433;…` – ohne VPN, ohne offene eingehende Ports.
8. (Extended Network, nur ansehen) WAC → Erweiterungen → **Azure Extended Network** installieren → Assistent zeigt benötigte on-prem- und Azure-Appliance-VMs (Azure Edition).

### PowerShell
```powershell
# Auf dem Admin-PC – VPN-Gateway für P2S vorbereiten (Alternative zur WAC-Automatik)
Connect-AzAccount
$vnet = Get-AzVirtualNetwork -Name VNet-Netzilon -ResourceGroupName RG-Netzilon
Add-AzVirtualNetworkSubnetConfig -Name GatewaySubnet -AddressPrefix 10.10.255.0/27 -VirtualNetwork $vnet | Set-AzVirtualNetwork
$pip = New-AzPublicIpAddress -Name GW-PIP -ResourceGroupName RG-Netzilon -Location westeurope -AllocationMethod Static -Sku Standard
$vnet = Get-AzVirtualNetwork -Name VNet-Netzilon -ResourceGroupName RG-Netzilon
$sub = Get-AzVirtualNetworkSubnetConfig -Name GatewaySubnet -VirtualNetwork $vnet
$ipcfg = New-AzVirtualNetworkGatewayIpConfig -Name gwcfg -SubnetId $sub.Id -PublicIpAddressId $pip.Id
New-AzVirtualNetworkGateway -Name VNG-Netzilon -ResourceGroupName RG-Netzilon -Location westeurope `
  -IpConfigurations $ipcfg -GatewayType Vpn -VpnType RouteBased -GatewaySku VpnGw1 `
  -VpnClientAddressPool 172.16.200.0/24 -VpnClientProtocol IkeV2,SSTP

# Auf dem Admin-PC – Relay-Namespace und Hybridverbindung
New-AzRelayNamespace -ResourceGroupName RG-Netzilon -Name netzilon-relay -Location westeurope
New-AzRelayHybridConnection -ResourceGroupName RG-Netzilon -Namespace netzilon-relay -Name sql01 -RequiresClientAuthorization $true

# Auf SRV01 – Verbindung prüfen
Get-VpnConnection
Test-NetConnection 10.10.1.4 -Port 3389
```

## Einfach

Drei Werkzeuge, drei Probleme:

**Azure Network Adapter** = ein **privates Tunnelkabel für einen einzigen Server**. Nur dieser eine Server bekommt einen VPN-Tunnel zu deinem Azure-Netz – die anderen PCs im Büro nicht. Eingerichtet wird alles **mit ein paar Klicks im Windows Admin Center**, auch das Tor in Azure (VPN Gateway). Das Tor zu bauen dauert aber bis zu einer Dreiviertelstunde.

**Azure Extended Network** = du **verlängerst eine Straße** aus deinem Büro bis nach Azure. Häuser (VMs), die du nach Azure umziehst, **behalten ihre Hausnummer** (IP-Adresse). Dafür stehen an beiden Enden der Straße zwei **Brückenwärter** (Appliance-VMs mit Windows Server Azure Edition). Gedacht als **Übergang**, bis alles umgezogen ist.

**Azure Relay** = ein **Postfach in der Cloud**. Dein interner Server (z. B. die Datenbank) **schaut von sich aus** regelmäßig ins Postfach („Hat jemand was für mich?“). Die Cloud-Webseite legt ihre Fragen dort ab. Weil der Server **selbst nach draußen** geht, muss man **keine Tür in der Firewall** öffnen. Es entsteht aber **kein** ganzes Netzwerk – nur diese eine Verbindung.

## Merksatz
- **Ein Server** → Azure Network Adapter (P2S, per **WAC**).
- **Ganzes Netz** → Site-to-Site.
- **IP behalten** bei Migration → Extended Network (**Azure Edition**, VXLAN).
- **Keine eingehenden Ports**, nur eine App-Verbindung → **Azure Relay** / Hybrid Connections (443 ausgehend).
- Hybrid Connections brauchen den **Hybrid Connection Manager** on-prem.

## Prüfungsfalle
- Azure Network Adapter nur über Windows Admin Center, und WAC muss bei Azure registriert sein.
- Basic-Gateway-SKU unterstützt IKEv2/Azure Network Adapter nicht.
- Azure Network Adapter verbindet nur den einen Server, nicht das LAN.
- Extended Network benötigt Windows Server 2022 Datacenter: Azure Edition als Appliance.
- Azure Relay benötigt keine eingehenden Firewallports.
- Hybrid Connections unterstützen nur TCP-Endpunkte (Host:Port), kein UDP.

## Grafik
### Privates Kabel
Büro mit vielen PCs; nur SRV01 hat ein leuchtendes Kabel durch die Wolke zum Azure-VNet; die anderen PCs bleiben ohne Kabel.

### Verlängerte Straße
Straße „192.168.10.x“ im Büro läuft über eine Brücke (VXLAN) nach Azure weiter; ein Haus mit Nummer .55 fährt auf einem Umzugswagen nach Azure und behält die Nummer.

### Postfach in der Wolke
Datenbankserver streckt die Hand nach oben (ausgehend 443) zum Wolken-Postfach; Web-App legt Anfrage hinein; Firewall-Tür bleibt verschlossen.

## Karteikarten
- F: Wofür Azure Network Adapter? | A: Einen einzelnen on-prem-Server per P2S-VPN mit einem Azure-VNet verbinden.
- F: Womit wird Azure Network Adapter eingerichtet? | A: Mit Windows Admin Center.
- F: Welche Protokolle nutzt Azure Network Adapter? | A: IKEv2 und SSTP (Point-to-Site).
- F: Wozu dient Azure Extended Network? | A: On-prem-Subnetz nach Azure verlängern, damit migrierte VMs ihre IP behalten.
- F: Welches Betriebssystem brauchen die Extended-Network-Appliances? | A: Windows Server 2022 Datacenter: Azure Edition.
- F: Welche Tunneltechnik nutzt Extended Network? | A: VXLAN über S2S-VPN oder ExpressRoute.
- F: Was ist Azure Relay? | A: Dienst, der on-prem-Dienste über ausgehende Verbindungen aus der Cloud erreichbar macht.
- F: Welche Komponente läuft on-prem für App Service Hybrid Connections? | A: Hybrid Connection Manager.
- F: Welcher Port wird von Azure Relay ausgehend genutzt? | A: 443 (HTTPS/WebSockets).
- F: Wie lange kann die Erstellung eines VPN Gateways dauern? | A: Bis zu etwa 45 Minuten.

## Quiz
? Nur der Backup-Server on-prem soll auf ein Azure-VNet zugreifen, ohne S2S-VPN. Lösung?
* Azure Network Adapter über Windows Admin Center
- Azure Extended Network
- Azure Relay WCF
- Webanwendungsproxy

? Bei einer Migration sollen VMs in Azure ihre bisherigen on-prem-IP-Adressen behalten. Lösung?
* Azure Extended Network
- Azure Network Adapter
- Azure Private DNS Zone
- App Service Hybrid Connections

? Eine Azure-Web-App soll SQL01 on-prem (Port 1433) nutzen; Firewall darf keine eingehenden Ports öffnen. Lösung?
* App Service Hybrid Connections mit Hybrid Connection Manager
- Site-to-Site-VPN mit Port 1433 eingehend
- Webanwendungsproxy mit Pass-Through
- Azure Extended Network

? Womit wird Azure Network Adapter konfiguriert?
* Windows Admin Center
- Server-Manager → Rollen
- Routing und RAS
- NPS-Konsole

? Welche Voraussetzung gilt für Azure Extended Network?
* Appliance-VMs mit Windows Server 2022 Datacenter: Azure Edition
- Nur ein Basic-VPN-Gateway
- Ein einzelner Server mit Hybrid Connection Manager
- AD FS in der DMZ
