---
id: az800-azure-dns-private
bereich: AZ-800
block: A7
kapitel: Netzwerkinfrastruktur
titel: Azure DNS – private Zonen, VNet-Verknüpfungen, Autoregistrierung & Private Resolver
stufe: Fortgeschritten
quellen: [AZ-800 Study Guide, Microsoft Learn]
verweise: [az800-dns-weiterleitung, az800-dns, az800-azure-vms, az800-dcs-azure, az800-s2s-vpn]
---

## Profi

### Namensauflösung in Azure – Optionen
| Option | Beschreibung | Grenzen |
|---|---|---|
| **Von Azure bereitgestellte Auflösung** (Standard) | VMs eines VNets lösen sich unter `*.internal.cloudapp.net` auf; DNS-IP **168.63.129.16** | nur **innerhalb eines VNets**, keine eigenen Namen |
| **Azure DNS – öffentliche Zone** | autoritatives DNS für Internet-Domänen (z. B. `example.com`) | öffentlich |
| **Azure DNS – private Zone** | eigene Namen (z. B. `azure.example.com`) für **ein oder mehrere VNets** | nicht aus dem Internet, on-prem nur über Resolver/Weiterleitung |
| **Eigener DNS-Server** (DC-VM) | VNet-Einstellung „Benutzerdefinierte DNS-Server“ auf die DC-IPs | VM-Betrieb, Hochverfügbarkeit selbst sichern |
| **Azure DNS Private Resolver** | verwalteter Dienst, verbindet on-prem-DNS und Azure-DNS **in beide Richtungen** | kostenpflichtig, eigene Subnetze nötig |

### Private Zonen im Detail
- Ressource **Private DNS-Zone**, global (keine Region), Name frei wählbar (auch identisch mit öffentlicher Zone → Split-Horizon).
- **Virtuelle Netzwerkverknüpfung** (*Virtual Network Link*): Zone wird für ein VNet sichtbar. Nur verknüpfte VNets können die Zone auflösen.
- **Autoregistrierung** (*Auto registration*): bei aktivierter Verknüpfung werden **A-Einträge der VMs automatisch** angelegt/entfernt.
  - Ein VNet kann mit **mehreren** privaten Zonen verknüpft sein, aber **nur mit einer** davon mit **Autoregistrierung**.
  - Nur **VM-NICs** werden registriert (keine anderen Dienste); autoregistrierte Einträge kann man nicht manuell bearbeiten.
- **Private Endpunkte** (*Private Link*): Dienste wie Storage/SQL bekommen private IPs; die Namensauflösung läuft über Zonen wie `privatelink.blob.core.windows.net`.
- Unterstützte Eintragstypen: A, AAAA, CNAME, MX, PTR, SOA, SRV, TXT.
- **Reverse-Zonen** (`x.x.10.in-addr.arpa`) als private Zone möglich.
- Auflösung erfolgt immer über **168.63.129.16** – vom **Azure-Rechenzentrum aus**, nicht von on-prem.

### Hybrid – on-prem ↔ Azure
**Voraussetzung**: VPN (Site-to-Site) oder ExpressRoute zwischen on-prem und Azure.

| Richtung | Lösung A (klassisch) | Lösung B (modern) |
|---|---|---|
| **on-prem → Azure** (Private Zone auflösen) | DNS-Server-VM in Azure (z. B. DC) mit Weiterleitung an **168.63.129.16**; on-prem bedingte Weiterleitung auf diese VM | **Private Resolver Inbound-Endpunkt** (private IP im Subnetz); on-prem **bedingte Weiterleitung** auf diese IP |
| **Azure → on-prem** (AD-Domäne auflösen) | VNet-DNS-Server = DCs (in Azure oder on-prem) | **Outbound-Endpunkt** + **DNS-Weiterleitungsregelsatz** (*Forwarding Ruleset*), Regel `example.com.` → on-prem-DC-IPs; Regelsatz mit VNets verknüpfen |
- Inbound- und Outbound-Endpunkte benötigen je ein **eigenes, delegiertes Subnetz** (mind. /28) im VNet.
- Werden **benutzerdefinierte DNS-Server** am VNet gesetzt, fragen VMs **diese** statt 168.63.129.16 → die Custom-DNS-Server müssen für private Zonen selbst an 168.63.129.16 (oder den Inbound-Endpunkt) weiterleiten.
- Nach Änderung der VNet-DNS-Server: VMs **neu starten** oder DHCP-Lease erneuern (`ipconfig /renew`).

### DCs in Azure und DNS
Typisch: DC-VMs in Azure mit **statischer privater IP** (in Azure festgelegt), VNet-DNS-Server = diese DCs (+ on-prem-DC als Reserve). Die DC-DNS-Server leiten an 168.63.129.16 weiter, damit auch private Zonen/Private Endpoints funktionieren.

## Lab
**Maschinen**: **Admin-PC** (Portal/Az-PowerShell), Azure-VNets **VNet-Hub** (10.10.0.0/16) und **VNet-App** (10.20.0.0/16) mit VMs **AZ-SRV01** (Hub) und **AZ-APP01** (App), on-prem **DC01** (example.com, 192.168.10.10) mit S2S-VPN.

### GUI
1. **Admin-PC** → Portal → **Private DNS-Zonen** → Erstellen → `azure.example.com` in `RG-Netzilon`.
2. Zone → **Virtuelle Netzwerkverknüpfungen** → Hinzufügen → `link-hub` → VNet-Hub → **Automatische Registrierung aktivieren**.
3. Zweite Verknüpfung `link-app` → VNet-App → ohne Autoregistrierung (oder mit, falls keine andere Zone registriert).
4. Zone → **Datensatzgruppen**: prüfen, dass `az-srv01` automatisch erschienen ist; manuell `A`-Eintrag `intranet` → 10.10.1.50 anlegen.
5. **AZ-APP01**: `Resolve-DnsName az-srv01.azure.example.com` → Antwort 10.10.x.x.
6. Portal → **DNS Private Resolver** → Erstellen in VNet-Hub → Inbound-Endpunkt (Subnetz `snet-dns-in` /28) → IP notieren (z. B. 10.10.10.4). Outbound-Endpunkt (Subnetz `snet-dns-out` /28).
7. Portal → **DNS-Weiterleitungsregelsätze** → Erstellen → Outbound-Endpunkt wählen → Regel `example.com.` → Ziel `192.168.10.10:53` → Regelsatz mit VNet-Hub und VNet-App verknüpfen.
8. **DC01**: DNS-Manager → Bedingte Weiterleitungen → Neu → `azure.example.com` → `10.10.10.4` → in AD speichern.
9. **DC01**: `nslookup az-srv01.azure.example.com` → Antwort aus Azure. **AZ-APP01**: `nslookup dc01.example.com` → Antwort von on-prem.

### PowerShell
```powershell
# Auf dem Admin-PC – private Zone + Verknüpfungen
Connect-AzAccount
$hub = Get-AzVirtualNetwork -Name VNet-Hub -ResourceGroupName RG-Netzilon
$app = Get-AzVirtualNetwork -Name VNet-App -ResourceGroupName RG-Netzilon
New-AzPrivateDnsZone -ResourceGroupName RG-Netzilon -Name "azure.example.com"
New-AzPrivateDnsVirtualNetworkLink -ResourceGroupName RG-Netzilon -ZoneName "azure.example.com" -Name link-hub -VirtualNetworkId $hub.Id -EnableRegistration
New-AzPrivateDnsVirtualNetworkLink -ResourceGroupName RG-Netzilon -ZoneName "azure.example.com" -Name link-app -VirtualNetworkId $app.Id

# Manueller Eintrag
New-AzPrivateDnsRecordSet -ResourceGroupName RG-Netzilon -ZoneName "azure.example.com" -Name intranet -RecordType A -Ttl 3600 `
  -PrivateDnsRecords (New-AzPrivateDnsRecordConfig -IPv4Address 10.10.1.50)
Get-AzPrivateDnsRecordSet -ResourceGroupName RG-Netzilon -ZoneName "azure.example.com"

# VNet auf benutzerdefinierte DNS-Server (DCs) umstellen
$hub.DhcpOptions.DnsServers = @("10.10.1.4","192.168.10.10")
Set-AzVirtualNetwork -VirtualNetwork $hub

# Auf DC01 – bedingte Weiterleitung zum Inbound-Endpunkt
Add-DnsServerConditionalForwarderZone -Name "azure.example.com" -MasterServers 10.10.10.4 -ReplicationScope Domain

# Auf einer DC-VM in Azure (klassische Variante) – Weiterleitung an Azure DNS
Set-DnsServerForwarder -IPAddress 168.63.129.16

# Auf AZ-APP01 – Test
Resolve-DnsName az-srv01.azure.example.com
Resolve-DnsName dc01.example.com
```

## Einfach

In Azure gibt es einen **eingebauten Auskunftsschalter** mit der Nummer **168.63.129.16**. Den kann aber **nur jemand anrufen, der selbst in Azure sitzt**.

**Private DNS-Zone** = ein **eigenes Telefonbuch** für deine Azure-Netze, z. B. „azure.example.com“. Das Internet sieht es nicht.
- **Verknüpfung** = du legst das Telefonbuch in ein bestimmtes **VNet** (Stadtteil). Nur Stadtteile mit Buch können nachschlagen.
- **Autoregistrierung** = jede neue VM **trägt sich selbst ein**, und wenn sie gelöscht wird, verschwindet der Eintrag. Pro Stadtteil darf aber nur **ein** Telefonbuch „selbst-eintragend“ sein.

**Problem**: Dein Büro (on-prem) kann den Azure-Schalter nicht anrufen. **Lösung**: der **Private Resolver** – ein **Empfangsschalter mit eigener Nummer** in Azure:
- **Eingang (Inbound)** = on-prem ruft dort an („Wer ist az-srv01?“), der Empfang fragt intern nach und antwortet.
- **Ausgang (Outbound)** + **Regelbuch** = Azure-VMs fragen nach „example.com“ → der Ausgang leitet die Frage durch den VPN-Tunnel an deinen DC im Büro weiter.

Früher hat man dafür eine **eigene DNS-VM** (oft ein DC) in Azure gebaut, die an 168.63.129.16 weiterleitet. Geht heute noch – aber der Resolver ist **fertig verwaltet** und muss nicht gepatcht werden.

## Merksatz
- **168.63.129.16** = Azure-DNS, **nur aus Azure** erreichbar.
- Private Zone wirkt nur in **verknüpften VNets**.
- **Autoregistrierung**: pro VNet **nur eine** Zone.
- on-prem → Azure: **Inbound-Endpunkt** + bedingte Weiterleitung.
- Azure → on-prem: **Outbound-Endpunkt** + **Weiterleitungsregelsatz**.
- Eigene VNet-DNS-Server → müssen an 168.63.129.16 weiterleiten, sonst keine private Zone.

## Prüfungsfalle
- VNet mit zweiter Zone mit Autoregistrierung verknüpfen → nicht erlaubt.
- VM in nicht verknüpftem VNet kann private Zone nicht auflösen (Peering allein reicht nicht).
- On-prem-Weiterleitung direkt auf 168.63.129.16 schlägt fehl.
- Benutzerdefinierte DNS-Server am VNet ohne Weiterleitung an Azure DNS → Private Endpoints/Zonen nicht auflösbar.
- Nach Änderung der VNet-DNS-Server VMs neu starten.
- Resolver-Endpunkte benötigen eigene dedizierte Subnetze.

## Grafik
### Telefonbuch pro Stadtteil
Zwei VNets als Stadtteile; das Buch „azure.example.com“ liegt in beiden (Verknüpfung). Neue VM im Hub stellt sich vor → Name erscheint automatisch im Buch.

### Nur-Azure-Nummer
Büro-DC wählt 168.63.129.16 → Besetztzeichen. Azure-VM wählt dieselbe Nummer → Antwort.

### Empfangsschalter
Büro → VPN-Tunnel → Inbound-Schalter → Antwort zurück; Azure-VM → Outbound-Schalter mit Regelbuch „example.com → 192.168.10.10“ → durch den Tunnel zum Büro-DC.

## Karteikarten
- F: IP des von Azure bereitgestellten DNS? | A: 168.63.129.16.
- F: Wodurch wird eine private DNS-Zone in einem VNet nutzbar? | A: Virtuelle Netzwerkverknüpfung.
- F: Was bewirkt Autoregistrierung? | A: VMs des verknüpften VNets erhalten automatisch A-Einträge.
- F: Mit wie vielen privaten Zonen darf ein VNet mit Autoregistrierung verknüpft sein? | A: Mit einer.
- F: Welcher Resolver-Teil beantwortet Anfragen von on-prem? | A: Inbound-Endpunkt.
- F: Wie lösen Azure-VMs über den Private Resolver on-prem-Namen auf? | A: Outbound-Endpunkt + DNS-Weiterleitungsregelsatz, mit VNet verknüpft.
- F: Mindestgröße der Resolver-Subnetze? | A: /28, je Endpunkt eigenes Subnetz.
- F: Was tun nach Änderung der VNet-DNS-Server? | A: VMs neu starten bzw. DHCP-Lease erneuern.
- F: Welche Zone nutzen Private Endpoints für Blob Storage? | A: privatelink.blob.core.windows.net
- F: Cmdlet für eine VNet-Verknüpfung mit Autoregistrierung? | A: New-AzPrivateDnsVirtualNetworkLink … -EnableRegistration

## Quiz
? On-prem-DCs sollen Namen einer Azure Private DNS Zone auflösen, ohne DNS-VM in Azure. Lösung?
* Azure DNS Private Resolver mit Inbound-Endpunkt und bedingter Weiterleitung on-prem
- Bedingte Weiterleitung auf 168.63.129.16
- Öffentliche Azure-DNS-Zone
- VNet-Peering zum on-prem-Netz

? VMs in VNet-App können azure.example.com nicht auflösen; VNet-Hub klappt. Ursache?
* VNet-App ist nicht mit der privaten Zone verknüpft
- Autoregistrierung ist in VNet-Hub aktiv
- Die Zone ist global
- Der TTL ist zu hoch

? Ein VNet ist bereits mit Autoregistrierung an zone1 verknüpft. Was gilt für zone2?
* Verknüpfung nur ohne Autoregistrierung möglich
- Verknüpfung nicht möglich
- zone1 wird automatisch entfernt
- Beide registrieren automatisch

? Azure-VMs sollen example.com über den Private Resolver auflösen. Welche Komponenten?
* Outbound-Endpunkt und DNS-Weiterleitungsregelsatz
- Inbound-Endpunkt und Autoregistrierung
- Öffentliche Zone und CNAME
- Nur VNet-Peering

? Nach Umstellung der VNet-DNS-Server auf die DCs lösen VMs noch alte Server auf. Was tun?
* VMs neu starten bzw. DHCP-Lease erneuern
- Zone neu erstellen
- NSG löschen
- Autoregistrierung aktivieren

? Welche IP-Adresse beantwortet in Azure DNS-Abfragen für VMs mit Azure-bereitgestelltem DNS?
* 168.63.129.16
- 8.8.8.8
- 10.0.0.1
- 127.0.0.53
! Die virtuelle öffentliche Azure-IP für DNS, DHCP und Health Probes.

? Was bewirkt die Autoregistrierung einer Private DNS Zone?
* VMs im verknüpften VNet erhalten automatisch A-Einträge in der Zone.
- Die Zone wird öffentlich im Internet sichtbar.
- Clients erhalten automatisch eine öffentliche IP.
- DNSSEC wird aktiviert.
! Pro VNet ist nur eine Zone mit Autoregistrierung möglich.

? Welche Komponente des Azure DNS Private Resolver nimmt Anfragen von on-prem entgegen?
* Eingehender Endpunkt (Inbound Endpoint)
- Ausgehender Endpunkt
- DNS-Weiterleitungsregelsatz
- Netzwerksicherheitsgruppe
! Ausgehende Endpunkte mit Regelsätzen leiten Azure-Anfragen an on-prem-DNS weiter.
