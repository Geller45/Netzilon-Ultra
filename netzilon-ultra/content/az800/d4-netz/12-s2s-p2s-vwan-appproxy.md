---
id: az800-s2s-vpn
bereich: AZ-800
block: A7
kapitel: Netzwerkinfrastruktur
titel: Azure VPN Gateway (S2S/P2S), ExpressRoute, Virtual WAN & Entra-Anwendungsproxy
stufe: Profi
quellen: [AZ-800 Study Guide, Microsoft Learn]
verweise: [az800-vpn, az800-azure-network-adapter, az800-webanwendungsproxy, az800-azure-dns-private, az800-dcs-azure, ap1-a5-vpn]
---

## Profi

### Azure VPN Gateway – Bausteine
| Ressource | Aufgabe |
|---|---|
| **GatewaySubnet** | eigenes Subnetz, **Name exakt „GatewaySubnet“**, empfohlen **/27** oder größer, keine VMs/NSG-Spielereien |
| **Virtuelles Netzwerkgateway** (*VNet Gateway*) | Typ **VPN** (oder ExpressRoute), **routenbasiert** (*RouteBased*, Standard, IKEv2, P2S, BGP) oder **richtlinienbasiert** (*PolicyBased*, Legacy, nur 1 S2S, IKEv1, kein P2S) |
| **SKU** | **VpnGw1–5** (+ **AZ**-Varianten zonenredundant); **Basic** = Legacy (kein IKEv2-P2S, kein BGP) |
| **Öffentliche IP** | Standard-SKU, statisch |
| **Lokales Netzwerkgateway** (*Local Network Gateway*) | beschreibt die **on-prem-Seite**: öffentliche IP (oder FQDN) des on-prem-VPN-Geräts + **on-prem-Adressbereiche** |
| **Verbindung** (*Connection*) | verknüpft VNet-Gateway und lokales Gateway, Typ **IPsec**, **gemeinsamer Schlüssel** (PSK) |
Erstellung des Gateways dauert **30–45 Minuten**. Pro VNet **ein** VPN-Gateway.

### Site-to-Site (S2S)
- Verbindet **ganzes on-prem-Netz** ↔ Azure-VNet über **IPsec/IKE** im Internet.
- on-prem-Gerät: Firewall/Router mit öffentlicher IPv4 (nicht hinter NAT), **oder Windows-RRAS** als S2S-Endpunkt (Demand-Dial, IKEv2).
- **Adressbereiche dürfen sich nicht überschneiden**.
- **BGP** optional (dynamisches Routing, Transit, Aktiv-Aktiv).
- **Aktiv-Aktiv**-Gateway (zwei Instanzen, zwei öffentliche IPs) für höhere Verfügbarkeit.
- Mehrere Standorte = **Multi-Site**-Verbindungen (nur routenbasiert).

### Point-to-Site (P2S)
| Punkt | Details |
|---|---|
| Zweck | **einzelne Clients** (Laptops, Admins, auch Azure Network Adapter) ↔ VNet |
| Protokolle | **OpenVPN** (SSL/TLS 443, Windows/macOS/Linux/Mobil), **IKEv2**, **SSTP** (nur Windows) |
| Authentifizierung | **Azure-Zertifikat** (Stamm-Zertifikat hochladen, Clientzertifikate daraus), **Microsoft Entra ID** (nur **OpenVPN**, MFA/bedingter Zugriff), **RADIUS** (z. B. NPS, AD-Anmeldung) |
| Client | **Azure VPN Client** bzw. Profilpaket aus dem Portal herunterladen |
| Adresspool | eigener, nicht überlappender **Clientadresspool** |

### ExpressRoute
- **Private, dedizierte Verbindung** über einen **Konnektivitätsanbieter** – **nicht über das Internet**.
- Höhere Bandbreite (50 Mbit/s bis 10/100 Gbit/s), geringe Latenz, SLA.
- **Private Peering** (VNets) und **Microsoft Peering** (Microsoft 365, öffentliche Azure-Dienste).
- Standardmäßig **nicht verschlüsselt** → optional IPsec/MACsec.
- **S2S-VPN als Backup** zu ExpressRoute möglich (Koexistenz).

### Azure Virtual WAN
- **Verwalteter Hub-and-Spoke**-Netzwerkdienst: Microsoft betreibt **virtuelle Hubs** pro Region; VNets, Filialen (S2S), Remote-Benutzer (P2S) und ExpressRoute verbinden sich mit dem Hub.
- **Any-to-Any**-Konnektivität (Filiale ↔ Filiale, Filiale ↔ VNet, Benutzer ↔ VNet) über das Microsoft-Backbone.
- Typen: **Basic** (nur **S2S-VPN**) und **Standard** (S2S, P2S, ExpressRoute, VNet-zu-VNet-Transit, Azure Firewall im Hub = **Secured Virtual Hub**).
- Einsatz: **viele Standorte**, globale Unternehmen, SD-WAN-Partnergeräte (automatische Konfiguration).

### Microsoft Entra-Anwendungsproxy (*Application Proxy*)
| Punkt | Details |
|---|---|
| Zweck | interne **Web-Apps** sicher extern veröffentlichen, **ohne** VPN und **ohne eingehende Ports** |
| Technik | **Private-Network-Connector** (früher Application Proxy Connector) on-prem auf Windows Server → **nur ausgehend** 80/443 zum Entra-Clouddienst |
| Anmeldung | **Vorauthentifizierung mit Entra ID** (MFA, **bedingter Zugriff**) oder Passthrough |
| SSO zur App | **KCD** (IWA-Apps, Connector-Server domänengebunden + Delegierung), header-basiert, SAML, kennwortbasiert |
| Hochverfügbarkeit | **mehrere Connectors** in einer **Connectorgruppe** (automatische Lastverteilung) |
| Externe URL | `https://<app>-<tenant>.msappproxy.net` oder **eigene Domäne** (CNAME + Zertifikat) |
| Lizenz | **Entra ID P1/P2** |
| Vergleich WAP | kein AD FS, keine DMZ, keine eingehende Firewallregel, Cloud-Richtlinien |

### Entscheidungstabelle
| Anforderung | Lösung |
|---|---|
| Büro ↔ Azure verschlüsselt über Internet | **S2S-VPN** |
| Einzelne Admins/Homeoffice ↔ Azure | **P2S-VPN** |
| P2S mit Entra-MFA | **P2S + OpenVPN + Entra-ID-Authentifizierung** |
| Hohe Bandbreite, kein Internet | **ExpressRoute** |
| Viele Filialen weltweit, Any-to-Any | **Virtual WAN (Standard)** |
| Interne Web-App extern mit MFA, ohne Ports | **Entra-Anwendungsproxy** |

## Lab
**Maschinen**: **RTR01** (on-prem Windows Server mit RRAS als S2S-Endpunkt, öffentliche IP 203.0.113.10, LAN 192.168.10.0/24), **DC01**, **APPPX01** (Mitgliedsserver für Connector), **WEB01** (internes Intranet), **Admin-PC**; Azure: **VNet-Netzilon** 10.10.0.0/16.

### GUI
1. **Admin-PC** → Portal → VNet-Netzilon → Subnetze → **+ Gatewaysubnetz** 10.10.255.0/27.
2. Portal → **Gateways für virtuelle Netzwerke** → Erstellen → `VNG-Netzilon`, VPN, **routenbasiert**, **VpnGw1**, VNet-Netzilon, neue öffentliche IP → Erstellen (30–45 Min.).
3. Portal → **Lokale Netzwerkgateways** → `LNG-Buero`, IP 203.0.113.10, Adressraum 192.168.10.0/24.
4. VNG-Netzilon → **Verbindungen** → Hinzufügen → **Site-to-Site (IPsec)** → LNG-Buero → PSK `Netz1lonS2S!` → Konfiguration herunterladen (Gerät „Generic“/„Windows Server RRAS“).
5. **RTR01**: Routing und RAS → Netzwerkschnittstellen → **Neue Wählen-bei-Bedarf-Schnittstelle** → `Azure` → **VPN** → **IKEv2** → Ziel = öffentliche IP des VNG → statische Route 10.10.0.0/16 → **Vorinstallierter Schlüssel** `Netz1lonS2S!` → Verbinden.
6. Portal → Verbindung → Status **Verbunden**; **DC01**: `Test-NetConnection 10.10.1.4 -Port 3389`.
7. P2S: VNG-Netzilon → **Punkt-zu-Standort-Konfiguration** → Adresspool 172.16.201.0/24 → Tunneltyp **OpenVPN** → Authentifizierung **Microsoft Entra ID** → VPN-Client herunterladen → **Azure VPN Client** importieren → Verbinden mit Entra-Konto.
8. Entra-Anwendungsproxy: Entra Admin Center → **Globaler sicherer Zugriff/Anwendungsproxy** → **Connectordienst herunterladen** → auf **APPPX01** installieren und anmelden → Enterprise-Anwendungen → **Neue Anwendung → Lokale Anwendung** → interne URL `http://web01.example.com/`, Vorauthentifizierung **Microsoft Entra ID** → Benutzer zuweisen → externe URL im Browser testen (MFA-Abfrage).
9. SSO per KCD: **DC01** → APPPX01-Computerkonto Delegierung an `HTTP/WEB01` (wie beim WAP) → App → **Einmaliges Anmelden → Integrierte Windows-Authentifizierung** → SPN `HTTP/web01.example.com`.

### PowerShell
```powershell
# Auf dem Admin-PC – Azure-Seite S2S (VNG existiert bereits, siehe Azure-Network-Adapter-Seite)
Connect-AzAccount
New-AzLocalNetworkGateway -Name LNG-Buero -ResourceGroupName RG-Netzilon -Location westeurope `
  -GatewayIpAddress 203.0.113.10 -AddressPrefix 192.168.10.0/24
$vng = Get-AzVirtualNetworkGateway -Name VNG-Netzilon -ResourceGroupName RG-Netzilon
$lng = Get-AzLocalNetworkGateway -Name LNG-Buero -ResourceGroupName RG-Netzilon
New-AzVirtualNetworkGatewayConnection -Name CON-Buero -ResourceGroupName RG-Netzilon -Location westeurope `
  -VirtualNetworkGateway1 $vng -LocalNetworkGateway2 $lng -ConnectionType IPsec -SharedKey "Netz1lonS2S!"
Get-AzVirtualNetworkGatewayConnection -Name CON-Buero -ResourceGroupName RG-Netzilon | Select-Object ConnectionStatus

# Auf RTR01 – RRAS als S2S-Endpunkt
Install-RemoteAccess -VpnType VpnS2S
Add-VpnS2SInterface -Name "Azure" -Destination <Oeffentliche-IP-des-VNG> -Protocol IKEv2 `
  -AuthenticationMethod PSKOnly -SharedSecret "Netz1lonS2S!" -IPv4Subnet @("10.10.0.0/16:100") -Persistent
Connect-VpnS2SInterface -Name "Azure"
Get-VpnS2SInterface

# Auf dem Admin-PC – P2S nachträglich konfigurieren
Set-AzVirtualNetworkGateway -VirtualNetworkGateway $vng -VpnClientAddressPool 172.16.201.0/24 -VpnClientProtocol OpenVPN

# Auf DC01 – Test
Test-NetConnection 10.10.1.4 -Port 3389
```

## Einfach

Wie verbindet man das **Büro** mit der **Azure-Cloud**?

- **Site-to-Site-VPN** = eine **feste, verschlüsselte Brücke** zwischen dem **ganzen Büro** und Azure. Jeder PC im Büro kann dann Azure-Server erreichen. Auf der Azure-Seite steht das **VPN Gateway** (Brückenpfeiler), auf der Büro-Seite dein Router/Firewall. Beide kennen ein **gemeinsames Geheimwort** (PSK). Wichtig: Die Hausnummern (IP-Bereiche) dürfen sich **nicht überschneiden**.
- **Point-to-Site-VPN** = ein **persönlicher Tunnel für einen einzelnen Laptop** (Homeoffice). Mit **OpenVPN + Entra ID** meldet man sich mit seinem Firmenkonto an – inklusive Handy-Bestätigung (MFA).
- **ExpressRoute** = eine **eigene Privatstraße** zu Microsoft, gar nicht übers Internet. Schnell und zuverlässig, aber teuer.
- **Virtual WAN** = ein **großer Verkehrsknoten** (Hub), den Microsoft für dich betreibt. Alle Filialen, Laptops und Azure-Netze fahren dort hin und kommen von dort überallhin. Perfekt bei **vielen Standorten**.

**Entra-Anwendungsproxy** = eine **Webseite aus dem Firmennetz** ins Internet bringen, **ohne** eine Tür in der Firewall zu öffnen: Ein kleines Programm (Connector) im Büro **ruft selbst** bei Microsoft an und holt die Besucher ab. Vorher prüft **Entra ID**, wer du bist (mit MFA).

## Merksatz
- Subnetz heißt exakt **GatewaySubnet**, mind. **/27** empfohlen.
- **Lokales Netzwerkgateway** = Beschreibung der **on-prem-Seite**.
- **Routenbasiert** = modern (P2S, BGP, IKEv2); **richtlinienbasiert** = Legacy.
- P2S mit **Entra-Anmeldung** → nur **OpenVPN**.
- **ExpressRoute** = privat, **nicht** übers Internet, nicht automatisch verschlüsselt.
- **Virtual WAN Basic** = nur S2S; **Standard** = alles.
- **App Proxy**: Connector **ausgehend**, **Entra ID P1**.

## Prüfungsfalle
- Überlappende Adressbereiche on-prem/Azure verhindern S2S-Routing.
- Richtlinienbasiertes Gateway unterstützt kein P2S und nur eine S2S-Verbindung.
- Entra-ID-Authentifizierung für P2S nur mit OpenVPN, nicht mit IKEv2/SSTP.
- SSTP nur für Windows-Clients.
- Virtual WAN Basic unterstützt kein P2S und kein ExpressRoute.
- Entra-Anwendungsproxy benötigt keine eingehenden Ports, WAP schon.
- Für KCD-SSO muss der Connector-Server domänengebunden sein.

## Grafik
### Brücke vs. persönlicher Tunnel
Links ein ganzes Bürogebäude, verbunden durch eine breite Brücke (S2S) mit der Azure-Wolke; rechts ein Laptop im Homeoffice mit dünnem persönlichen Tunnel (P2S) und Handy-MFA-Häkchen.

### Privatstraße
Internet-Autobahn mit Stau; daneben eine leere Privatstraße ExpressRoute direkt zum Microsoft-Rechenzentrum.

### Verkehrsknoten
Weltkarte, in jeder Region ein Hub-Kreisel (Virtual WAN); Filialen, Laptops und VNets fahren in den Kreisel und von dort überallhin.

### Connector ruft an
Interner Webserver, daneben Connector-Kiste, die einen Pfeil nur nach außen schickt; Besucher meldet sich bei Entra ID mit MFA an und wird durch diesen Pfeil zurückgeholt; Firewall-Tür bleibt zu.

## Karteikarten
- F: Wie muss das Subnetz für ein VPN Gateway heißen? | A: GatewaySubnet (empfohlen /27 oder größer).
- F: Was beschreibt ein lokales Netzwerkgateway? | A: Öffentliche IP und Adressbereiche der on-prem-Seite.
- F: Unterschied routenbasiert und richtlinienbasiert? | A: Routenbasiert: IKEv2, P2S, BGP, mehrere Verbindungen; richtlinienbasiert: Legacy, IKEv1, eine S2S-Verbindung.
- F: P2S-Protokolle in Azure? | A: OpenVPN, IKEv2, SSTP.
- F: Welche P2S-Authentifizierung erlaubt MFA mit Entra ID? | A: Microsoft Entra ID (nur mit OpenVPN).
- F: Was ist ExpressRoute? | A: Private, dedizierte Verbindung zu Azure über einen Anbieter, nicht über das Internet.
- F: Unterschied Virtual WAN Basic und Standard? | A: Basic nur S2S; Standard zusätzlich P2S, ExpressRoute, Transit, Firewall.
- F: Welche Verbindung baut der Entra-Anwendungsproxy-Connector auf? | A: Nur ausgehend (80/443) zum Entra-Clouddienst.
- F: Lizenz für Entra-Anwendungsproxy? | A: Microsoft Entra ID P1 oder P2.
- F: Wie wird der Anwendungsproxy hochverfügbar? | A: Mehrere Connectors in einer Connectorgruppe.
- F: Cmdlet für die S2S-Verbindung in Azure? | A: New-AzVirtualNetworkGatewayConnection -ConnectionType IPsec
- F: Cmdlet für RRAS-S2S-Schnittstelle? | A: Add-VpnS2SInterface

## Quiz
? Homeoffice-Benutzer sollen per VPN auf Azure zugreifen und sich mit Entra-ID-Konto inkl. MFA anmelden. Konfiguration?
* P2S mit OpenVPN und Microsoft-Entra-ID-Authentifizierung
- P2S mit SSTP und Zertifikaten
- S2S mit PSK
- Richtlinienbasiertes Gateway mit IKEv1

? Ein Unternehmen mit 40 Filialen weltweit braucht Any-to-Any-Verbindungen zu Azure und untereinander. Lösung?
* Azure Virtual WAN (Standard)
- Einzelnes richtlinienbasiertes VPN Gateway
- Azure Network Adapter je Filiale
- Azure Relay

? Eine interne IIS-App soll extern mit MFA erreichbar sein, ohne eingehende Firewallports und ohne AD FS. Lösung?
* Microsoft Entra-Anwendungsproxy
- Webanwendungsproxy mit Pass-Through
- S2S-VPN
- ExpressRoute Microsoft Peering

? Welche Ressource beschreibt in Azure das on-prem-VPN-Gerät und dessen Netze?
* Lokales Netzwerkgateway
- Virtuelles Netzwerkgateway
- GatewaySubnet
- Virtual Hub

? Eine Firma braucht 10 Gbit/s zu Azure mit planbarer Latenz, ohne Internet. Lösung?
* ExpressRoute
- S2S-VPN mit VpnGw1
- P2S mit OpenVPN
- Virtual WAN Basic
