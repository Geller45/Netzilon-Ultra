---
id: az800-vpn
bereich: AZ-800
block: A7
kapitel: Netzwerkinfrastruktur
titel: RAS – RRAS, VPN-Protokolle, Authentifizierung, Always On VPN, NAT & Routing
stufe: Fortgeschritten
quellen: [AZ-800 Study Guide, Microsoft Learn, Netzwerkinfrastruktur_mit_Windows_Server_2016_implementieren_70-741.pdf]
verweise: [ap1-a5-vpn, ap1-a4-routing, az800-nps, az800-dhcp, az800-s2s-vpn, az800-webanwendungsproxy]
---

## Profi

### Rolle „Remotezugriff“ (*Remote Access*) – Rollendienste
| Rollendienst | Aufgabe |
|---|---|
| **DirectAccess und VPN (RAS)** | Einwahl-/VPN-Server, DirectAccess (Legacy) |
| **Routing** | IPv4/IPv6-Routing, **NAT**, Wählen bei Bedarf (*Demand-Dial*, Site-to-Site), RIP (Legacy), DHCP-Relay |
| **Webanwendungsproxy** | Reverse-Proxy für veröffentlichte Webanwendungen (eigene Seite) |
Verwaltung: Konsole **Routing und RAS** (`rrasmgmt.msc`), **Remotezugriffs-Verwaltungskonsole**, **WAC**, PowerShell-Modul `RemoteAccess`.

### VPN-Tunnelprotokolle
| Protokoll | Transport / Ports | Verschlüsselung | Bewertung |
|---|---|---|---|
| **PPTP** | TCP **1723** + **GRE (IP-Protokoll 47)** | MPPE | **unsicher**, Legacy |
| **L2TP/IPsec** | UDP **500**, **4500** (NAT-T), **ESP (IP 50)** | IPsec, Zertifikat oder **Pre-Shared Key** | gut, NAT/Firewall-Probleme möglich |
| **SSTP** | TCP **443** (HTTPS/TLS) | TLS | geht durch fast jede Firewall/Proxy; Serverzertifikat nötig |
| **IKEv2** | UDP **500**, **4500** | IPsec | **modern, empfohlen**; **VPN Reconnect** (MOBIKE) – Tunnel überlebt Netzwechsel (WLAN → LTE) |
Standard-Porte des RRAS-Servers: je Protokoll **128** (anpassbar).

### Authentifizierungsprotokolle
| Protokoll | Bewertung |
|---|---|
| **PAP** | Klartext – nie verwenden |
| **CHAP** | MD5, reversible Kennwortspeicherung nötig – Legacy |
| **MS-CHAPv2** | Kennwort, gegenseitige Authentifizierung, heute nur in **PEAP** eingebettet akzeptabel |
| **EAP / PEAP-MS-CHAPv2** | Kennwort in TLS-Tunnel (Serverzertifikat) |
| **EAP-TLS / PEAP-TLS** | **Zertifikate** (Benutzer/Computer, Smartcard) – **am sichersten**, Standard für Always On VPN |
Zertifikate für IKEv2/SSTP/EAP kommen aus der **AD CS** (Vorlagen: RAS- und IAS-Server, Benutzer, Computer).

### Adressvergabe und Autorisierung
- VPN-Clients erhalten IPs über **DHCP** (RRAS mietet Adressen in 10er-Blöcken) oder aus einem **statischen Adresspool** (Pool-Netz muss im LAN geroutet werden).
- **Autorisierung**: RRAS nutzt **Windows-Authentifizierung** mit lokalen **Netzwerkrichtlinien** oder **RADIUS** (NPS). Benutzerkonto → Registerkarte **Einwählen**: *Zugriff erlauben / verweigern / über NPS-Netzwerkrichtlinien steuern* (Standard).

### Always On VPN (Nachfolger von DirectAccess)
| | **Gerätetunnel** (*Device Tunnel*) | **Benutzertunnel** (*User Tunnel*) |
|---|---|---|
| Wann | **vor** der Anmeldung (Anmelden an DC, GPOs, Remoteverwaltung) | **nach** der Benutzeranmeldung |
| Protokoll | nur **IKEv2** | IKEv2, SSTP (Fallback) |
| Auth | **Computerzertifikat** | Benutzerzertifikat / PEAP |
| Client | Windows **Enterprise/Education**, domänengebunden | Windows Pro/Enterprise |
- Konfiguration per **ProfileXML** (VPNv2-CSP) über **Intune**, SCCM oder PowerShell/WMI – **nicht per GPO**.
- Funktionen: automatische Verbindung, **Trusted Network Detection** (im Firmennetz keine Verbindung), **Split-Tunneling** vs. **Force-Tunneling**, **App-Trigger**.
- Server: **RRAS** (IKEv2/SSTP) + **NPS** (RADIUS) + **AD CS**; alternativ Drittanbieter oder Azure VPN Gateway (P2S).
- **DirectAccess**: IPv6/IPsec-basiert, nur Enterprise, **Legacy/nicht mehr empfohlen** → Always On VPN.

### NAT und Routing mit RRAS
- **NAT**: private Netze teilen sich eine öffentliche IP; RRAS → IPv4 → NAT → öffentliche Schnittstelle „mit dem Internet verbunden, NAT aktivieren“; **Portzuordnung** (Dienste und Ports) für eingehende Weiterleitung.
- **Statische Routen**, **Standardroute**; **Wählen bei Bedarf** für Site-to-Site-VPN zwischen zwei RRAS-Servern (dauerhaft oder bei Bedarf, Authentifizierung per Benutzerkonto mit dem Namen der Wählschnittstelle).
- **RRAS in Azure-VMs wird nicht unterstützt** → **Azure VPN Gateway** bzw. Virtual WAN (Seite S2S/P2S).

### Firewall/Portfreigaben am Perimeter
IKEv2/L2TP: UDP 500, 4500 (+ ESP 50 für L2TP ohne NAT-T); SSTP: TCP 443; PPTP: TCP 1723 + GRE 47. Der RRAS-Server steht typischerweise mit **zwei NICs** (intern/DMZ) hinter der Firewall.

## Lab
**Maschinen**: **DC01** (example.com, AD CS mit Enterprise-CA), **VPN01** (Mitgliedsserver, 2 NICs: „Intern“ 192.168.10.30, „Extern“ 203.0.113.10), **CL01** (Windows 11 Enterprise, extern im Netz 203.0.113.0/24).

### GUI
1. **DC01**: AD-Benutzer → Gruppe `VPN-Benutzer` → Mitglied `max`.
2. **DC01**: Zertifikatvorlagen → Vorlage **RAS- und IAS-Server** duplizieren → „VPN-Server“ → Antragsteller: im Antrag angeben, Anwendungsrichtlinien **Serverauthentifizierung** + **IP-Sicherheit IKE, dazwischenliegend** → veröffentlichen.
3. **VPN01**: `certlm.msc` → Eigene Zertifikate → Neues Zertifikat → „VPN-Server“ → CN/SAN `vpn.example.com`.
4. **VPN01**: Server-Manager → Rolle **Remotezugriff** → Rollendienste **DirectAccess und VPN (RAS)** + **Routing**.
5. **VPN01**: Routing und RAS → Server → **Routing und RAS konfigurieren und aktivieren** → **Benutzerdefiniert** → **VPN-Zugriff** + **NAT** → Dienst starten.
6. **VPN01**: Server → Eigenschaften → **IPv4** → **Statischer Adresspool** 192.168.99.1–192.168.99.50; Registerkarte **Sicherheit** → Authentifizierungsmethoden: **EAP** und **MS-CHAPv2**; SSL-Zertifikatbindung = VPN-Server-Zertifikat.
7. **VPN01**: Ports → Eigenschaften → PPTP **deaktivieren** (0 Ports), IKEv2 und SSTP je 128.
8. **DC01**: Route für 192.168.99.0/24 via 192.168.10.30 im internen Router/Gateway eintragen.
9. **CL01**: Einstellungen → Netzwerk → **VPN** → hinzufügen → Anbieter Windows, Server `vpn.example.com`, Typ **IKEv2**, Anmeldung Benutzername/Kennwort → Verbinden als `max`.
10. **VPN01**: Routing und RAS → **Remotezugriffsclients** → Verbindung von max sichtbar.

### PowerShell
```powershell
# Auf VPN01 – Rolle und VPN
Install-WindowsFeature RemoteAccess, DirectAccess-VPN, Routing -IncludeManagementTools
Install-RemoteAccess -VpnType Vpn
Set-VpnIPAddressAssignment -IPAssignmentMethod StaticPool -IPAddressRange 192.168.99.1,192.168.99.50
Set-VpnAuthProtocol -UserAuthProtocolAccepted EAP,MsChapv2 -TunnelAuthProtocolsAdvertised Certificates
Set-RemoteAccess -SslCertificate (Get-ChildItem Cert:\LocalMachine\My | Where-Object Subject -like "*vpn.example.com*")
Get-RemoteAccess
Get-VpnServerConfiguration

# Auf VPN01 – NAT (RRAS-NAT per netsh)
netsh routing ip nat install
netsh routing ip nat add interface "Extern" full
netsh routing ip nat add interface "Intern" private

# Auf VPN01 – aktive Verbindungen
Get-RemoteAccessConnectionStatistics

# Auf DC01 – Benutzer darf einwählen (sonst NPS-Richtlinie)
Set-ADUser max -Replace @{msNPAllowDialin=$true}

# Auf CL01 – VPN-Verbindung
Add-VpnConnection -Name "Firma-VPN" -ServerAddress vpn.example.com -TunnelType Ikev2 -AuthenticationMethod Eap -EncryptionLevel Required -SplitTunneling $true -RememberCredential
rasdial "Firma-VPN" max *
Get-VpnConnection
```

## Einfach

**VPN** = ein **geheimer, blickdichter Tunnel** durch das öffentliche Internet direkt in dein Firmennetz. Von zuhause fühlt es sich an, als säßest du im Büro.

**RRAS** ist der **Tunnelwächter** auf einem Windows-Server. Er baut Tunnel, verteilt Adressen an die Gäste im Tunnel und kann auch als Router und **NAT** (viele PCs teilen sich eine Internet-Adresse) arbeiten.

**Tunnelarten** (Protokolle):
- **PPTP** = alter Holztunnel – **einsturzgefährdet**, nicht mehr benutzen.
- **L2TP/IPsec** = stabiler Steintunnel, aber manche Firewalls mögen ihn nicht.
- **SSTP** = Tunnel **getarnt als normale Webseite** (Port 443) – kommt fast überall durch, auch im Hotel-WLAN.
- **IKEv2** = moderner Tunnel, der **mitläuft**: Wechselst du vom WLAN ins Handynetz, bleibt er offen (**VPN Reconnect**).

**Ausweiskontrolle** (Authentifizierung): Am sichersten mit **Zertifikaten** (digitaler Ausweis) statt nur mit Kennwort.

**Always On VPN** = das VPN **baut sich von selbst auf**, sobald du nicht im Büro bist – du merkst es gar nicht.
- **Gerätetunnel** = der **Laptop** verbindet sich schon **vor** der Anmeldung (damit er z. B. mit dem DC reden kann).
- **Benutzertunnel** = verbindet sich, **nachdem du dich angemeldet** hast.

## Merksatz
- **PPTP** 1723+GRE = unsicher. **L2TP** = UDP 500/4500 + ESP. **SSTP** = TCP 443. **IKEv2** = UDP 500/4500 + Reconnect.
- **EAP-TLS** = Zertifikate = am sichersten.
- Always On VPN: **Gerätetunnel = IKEv2 + Computerzertifikat + Enterprise**.
- Always On VPN wird per **ProfileXML/Intune** verteilt, **nicht per GPO**.
- DirectAccess = **Legacy**.
- **Kein RRAS in Azure** → VPN Gateway.

## Prüfungsfalle
- SSTP ist die Wahl, wenn nur Port 443 offen ist.
- VPN Reconnect gibt es nur mit IKEv2.
- Gerätetunnel unterstützt nur IKEv2 und erfordert Windows Enterprise/Education.
- Statischer Adresspool ohne Rückroute im LAN → Tunnel steht, aber keine Kommunikation.
- CHAP erfordert reversibel gespeicherte Kennwörter.
- RRAS auf Azure-VMs ist nicht unterstützt.

## Grafik
### Tunnelbau
Laptop zuhause → Internet-Wolke → leuchtender Tunnel zu VPN01 → Firmennetz; Laptop bekommt Adresse 192.168.99.5.

### Tunnel-Vergleich
Vier Tunnel: Holz (PPTP, bröckelt), Stein (L2TP, Firewall-Schranke halb zu), Web-Tarnung (SSTP, winkt durch Tor 443), Gummi-Tunnel (IKEv2, bleibt verbunden, während Laptop vom WLAN-Café ins LTE-Netz läuft).

### Always On
Laptop wird aufgeklappt: zuerst Gerätetunnel (Zahnrad-Symbol) vor dem Anmeldebildschirm, nach Login zusätzlich Benutzertunnel (Personen-Symbol).

## Karteikarten
- F: Welches VPN-Protokoll nutzt TCP 443? | A: SSTP.
- F: Welches Protokoll unterstützt VPN Reconnect? | A: IKEv2.
- F: Ports von IKEv2? | A: UDP 500 und 4500.
- F: Warum PPTP nicht verwenden? | A: Unsichere Verschlüsselung/Authentifizierung (MS-CHAPv2/MPPE).
- F: Sicherste Authentifizierung für VPN? | A: EAP-TLS (Zertifikate).
- F: Unterschied Gerätetunnel und Benutzertunnel? | A: Gerätetunnel vor Anmeldung (Computerzertifikat, IKEv2), Benutzertunnel nach Anmeldung.
- F: Wie wird Always On VPN konfiguriert? | A: ProfileXML (VPNv2-CSP) über Intune, SCCM oder PowerShell.
- F: Zwei Wege der IP-Vergabe an VPN-Clients? | A: DHCP oder statischer Adresspool.
- F: Rollendienste der Rolle Remotezugriff? | A: DirectAccess und VPN (RAS), Routing, Webanwendungsproxy.
- F: VPN in Azure statt RRAS? | A: Azure VPN Gateway.
- F: Cmdlet für VPN-Verbindung am Client? | A: Add-VpnConnection

## Quiz
? Mitarbeiter im Hotel-WLAN können nur HTTPS nutzen. Welches VPN-Protokoll funktioniert?
* SSTP
- L2TP/IPsec
- PPTP
- IKEv2

? Laptops sollen VPN-Verbindung halten, wenn sie von WLAN auf Mobilfunk wechseln. Protokoll?
* IKEv2
- SSTP
- PPTP
- L2TP ohne NAT-T

? Laptops sollen schon vor der Benutzeranmeldung GPOs vom DC erhalten. Welche Lösung?
* Always On VPN Gerätetunnel
- Always On VPN Benutzertunnel
- SSTP mit PAP
- Split-Scope-DHCP

? VPN-Clients verbinden sich (Pool 192.168.99.0/24), erreichen aber keine internen Server. Wahrscheinliche Ursache?
* Rückroute zum Pool-Netz fehlt im internen Netz
- IKEv2 ist nicht aktiviert
- Das Serverzertifikat fehlt
- DHCP-Failover fehlt

? Wie wird ein Always-On-VPN-Profil an Clients verteilt?
* ProfileXML über Intune oder PowerShell
- Gruppenrichtlinie „VPN-Profil“
- DHCP-Option 252
- NRPT-Regel
