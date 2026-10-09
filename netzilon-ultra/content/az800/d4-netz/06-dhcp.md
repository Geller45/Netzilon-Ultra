---
id: az800-dhcp
bereich: AZ-800
block: A7
kapitel: Netzwerkinfrastruktur
titel: DHCP – Autorisierung, Bereiche, Optionen, Richtlinien, Relay & DHCPv6
stufe: Fortgeschritten
quellen: [AZ-800 Study Guide, Microsoft Learn, Netzwerkinfrastruktur_mit_Windows_Server_2016_implementieren_70-741.pdf]
verweise: [ap1-a5-dhcp, az800-dhcp-failover, az800-ipam, az800-dns, ap1-a4-ipv6, az800-vpn]
---

## Profi

### DORA und Lease
**D**iscover (Broadcast) → **O**ffer → **R**equest (Broadcast) → **A**ck. Verlängerung bei **50 %** der Leasedauer (Unicast an den Server, T1) und bei **87,5 %** an beliebigen Server (T2). Standard-Leasedauer Windows: **8 Tage** (Drahtlos-/Gastnetze kürzer, z. B. 1–8 Stunden).

### Autorisierung in AD
Ein Windows-DHCP-Server in einer Domäne vergibt **erst nach Autorisierung** in Active Directory Adressen (Schutz vor Rogue-DHCP unter Windows). Nötig: **Organisations-Admin** (Enterprise Admins) bzw. delegierte Rechte; Einträge im Container `CN=NetServices,CN=Services,CN=Configuration`. Nicht-Domänen-Server (Arbeitsgruppe) prüfen, ob ein autorisierter Server im Subnetz ist, und stoppen dann.
Nach Installation: **Konfiguration nach Bereitstellung abschließen** → legt Gruppen **DHCP-Administratoren** und **DHCP-Benutzer** an + Autorisierung.

### Bereichsarten
| Art | Beschreibung |
|---|---|
| **Bereich** (*Scope*) | Adresspool eines Subnetzes + Ausschlüsse + Reservierungen + Optionen |
| **Bereichsgruppierung** (*Superscope*) | fasst mehrere Bereiche für **ein physisches Segment mit mehreren logischen IP-Netzen** zusammen (Multinet), z. B. wenn der erste Bereich voll ist |
| **Multicastbereich** (MADCAP) | vergibt Multicastadressen (224.0.0.0–239.255.255.255) an Anwendungen |
| **Split-Scope** (Legacy) | 80/20-Regel auf zwei Servern – heute durch **Failover** ersetzt |

### Optionen – Ebenen und Vorrang
**Server** → **Bereich** → **Richtlinie** → **Reservierung** (spezifischer gewinnt). Wichtige Optionen:
| Nr. | Option |
|---|---|
| 003 | Router (Standardgateway) |
| 006 | DNS-Server |
| 015 | DNS-Domänenname |
| 044/046 | WINS-Server / Knotentyp (Legacy) |
| 060/066/067 | PXE: Client-ID / Startserver / Startdateiname (WDS/SCCM) |
| 121 | Klassenlose statische Routen |
| 252 | WPAD (Proxy-Autokonfiguration) |

### Klassen und Richtlinien
- **Herstellerklassen** (*Vendor Class*, Option 60) und **Benutzerklassen** (*User Class*, Option 77, am Client `ipconfig /setclassid`).
- **DHCP-Richtlinien** (ab 2012): Bedingungen nach **Herstellerklasse, Benutzerklasse, MAC-Adresse (mit Platzhalter), Client-ID, FQDN, Relay-Agent-Info (Option 82)** → eigener **IP-Teilbereich**, eigene **Optionen**, eigene **Leasedauer**. Beispiel: VoIP-Telefone (MAC-Präfix) in Adressen .200–.250 mit eigenem VLAN-Hinweis; Gäste mit kurzer Lease.
- Richtlinien auf **Server-** oder **Bereichsebene**, mit **Verarbeitungsreihenfolge**.

### Filter und Schutz
- **MAC-Filter**: **Zulassen**- oder **Ablehnen**-Liste (bei aktivierter Zulassen-Liste bekommen nur gelistete Clients Adressen).
- **Namensschutz** (*Name Protection*, DHCID-Eintrag): verhindert, dass ein Nicht-Windows-Gerät einen bestehenden DNS-Namen überschreibt (**Name Squatting**).
- **DNS-Registrierung**: DHCP registriert A/PTR, „veraltete Einträge löschen, wenn Lease abläuft“; eigene **DNS-Anmeldeinformationen** hinterlegen.
- **Konflikterkennung**: Server pingt Adresse vor Vergabe (Anzahl Versuche 0–5), sinnvoll nach Wiederherstellung.

### DHCP-Relay
DHCP nutzt **Broadcasts** → Router leiten sie nicht weiter. Lösung: **DHCP-Relay-Agent** im Client-Subnetz, der Anfragen per **Unicast** an den DHCP-Server schickt und die **Feld giaddr** (Gateway-Adresse) setzt → Server wählt passenden Bereich.
- Windows: **RRAS → IPv4 → Allgemein → Neues Routingprotokoll → DHCP-Relay-Agent**
- Cisco: `ip helper-address <DHCP-IP>` auf dem Router-/SVI-Interface.

### DHCPv6
| Modus | Adresse | Optionen (DNS…) | Flags im Router Advertisement |
|---|---|---|---|
| **SLAAC** (ohne DHCP) | vom Client selbst (Präfix + Interface-ID) | per RDNSS im RA möglich | M=0, O=0 |
| **Zustandslos** (*stateless* DHCPv6) | SLAAC | vom DHCPv6-Server | M=0, **O=1** |
| **Zustandsbehaftet** (*stateful* DHCPv6) | vom DHCPv6-Server | vom DHCPv6-Server | **M=1** |
DHCPv6 nutzt UDP **546 (Client) / 547 (Server)**, Multicast **ff02::1:2**; Client-ID = **DUID** statt MAC. Windows-DHCPv6 verteilt **kein Standardgateway** – das kommt immer per **Router Advertisement**.

### Sichern, Migrieren, Datenbank
- Datenbank `%SystemRoot%\System32\dhcp\dhcp.mdb`, automatische Sicherung alle **60 Minuten** in `…\dhcp\backup`.
- `Backup-DhcpServer`/`Restore-DhcpServer` bzw. `Export-DhcpServer`/`Import-DhcpServer` (XML, auch mit Leases) für Migration.

## Lab
**Maschinen**: **DC01** (example.com), **DHCP01** (192.168.10.20), **RTR01** (RRAS, Netze 192.168.10.0/24 und 192.168.20.0/24), **CL01** (Netz 20), **CL02** (Netz 10).

### GUI
1. **DHCP01**: Server-Manager → Rolle **DHCP-Server** → Benachrichtigung **DHCP-Konfiguration abschließen** → Autorisierung mit Domänen-Admin-Konto.
2. **DHCP01**: DHCP-Konsole → IPv4 → **Neuer Bereich** „Netz10“ 192.168.10.100–200 /24, Ausschluss .100–.110, Lease 8 Tage, Option 003 = 192.168.10.1, 006 = 192.168.10.10, 015 = example.com.
3. Zweiter Bereich „Netz20“ 192.168.20.100–200, Router 192.168.20.1.
4. **DHCP01**: Netz10 → **Reservierungen** → Drucker, MAC `00-15-5D-01-02-03` → 192.168.10.150.
5. **DHCP01**: Netz10 → **Richtlinien** → Neu „VoIP“ → Bedingung **MAC-Adresse** gleich `00155D*` (Platzhalter) → IP-Teilbereich .180–.199 → Leasedauer 1 Tag.
6. **DHCP01**: IPv4 → Eigenschaften → Registerkarte **DNS** → „Namensschutz aktivieren“ → Erweitert → Konflikterkennung 2.
7. **RTR01**: RRAS → IPv4 → Allgemein → Neues Routingprotokoll → **DHCP-Relay-Agent** → Eigenschaften → Server 192.168.10.20 → Schnittstelle zum Netz 20 hinzufügen.
8. **CL01**: `ipconfig /release` + `ipconfig /renew` → Adresse aus Netz20; **DHCP01**: Adressleases prüfen.
9. **DHCP01**: IPv4 → **Filter** → Zulassen → Filter aktivieren (nur Test, danach wieder deaktivieren).

### PowerShell
```powershell
# Auf DHCP01 – Installation, Gruppen, Autorisierung
Install-WindowsFeature DHCP -IncludeManagementTools
netsh dhcp add securitygroups
Restart-Service DHCPServer
Add-DhcpServerInDC -DnsName DHCP01.example.com -IPAddress 192.168.10.20
Set-ItemProperty HKLM:\SOFTWARE\Microsoft\ServerManager\Roles\12 -Name ConfigurationState -Value 2

# Auf DHCP01 – Bereiche und Optionen
Add-DhcpServerv4Scope -Name "Netz10" -StartRange 192.168.10.100 -EndRange 192.168.10.200 -SubnetMask 255.255.255.0 -LeaseDuration 8.00:00:00
Add-DhcpServerv4ExclusionRange -ScopeId 192.168.10.0 -StartRange 192.168.10.100 -EndRange 192.168.10.110
Set-DhcpServerv4OptionValue -ScopeId 192.168.10.0 -Router 192.168.10.1
Set-DhcpServerv4OptionValue -DnsServer 192.168.10.10 -DnsDomain example.com
Add-DhcpServerv4Scope -Name "Netz20" -StartRange 192.168.20.100 -EndRange 192.168.20.200 -SubnetMask 255.255.255.0
Set-DhcpServerv4OptionValue -ScopeId 192.168.20.0 -Router 192.168.20.1

# Reservierung, Richtlinie, Superscope
Add-DhcpServerv4Reservation -ScopeId 192.168.10.0 -IPAddress 192.168.10.150 -ClientId "00-15-5D-01-02-03" -Name "Drucker01"
Add-DhcpServerv4Policy -Name "VoIP" -ScopeId 192.168.10.0 -Condition OR -MacAddress EQ,00155D* -LeaseDuration 1.00:00:00
Add-DhcpServerv4PolicyIPRange -Name "VoIP" -ScopeId 192.168.10.0 -StartRange 192.168.10.180 -EndRange 192.168.10.199
Add-DhcpServerv4Superscope -SuperscopeName "Gebaeude-A" -ScopeId 192.168.10.0,192.168.20.0

# Filter, Namensschutz, Konflikterkennung
Add-DhcpServerv4Filter -List Allow -MacAddress "00-15-5D-0A-0B-0C" -Description "CL02"
Set-DhcpServerv4FilterList -Allow $false -Deny $true
Set-DhcpServerv4DnsSetting -NameProtection $true -DeleteDnsRROnLeaseExpiry $true
Set-DhcpServerSetting -ConflictDetectionAttempts 2

# DHCPv6 zustandslos (nur Optionen)
Set-DhcpServerv6OptionValue -DnsServer 2001:db8:10::10 -DomainSearchList example.com

# Sicherung / Migration
Backup-DhcpServer -Path C:\DHCPBackup
Export-DhcpServer -File C:\DHCPBackup\dhcp.xml -Leases -Force

# Auf RTR01 – Relay-Agent
Install-RemoteAccess -VpnType RoutingOnly
netsh routing ip relay install
netsh routing ip relay add dhcpserver 192.168.10.20
netsh routing ip relay add interface "Netz20"

# Auf CL01 – Test
ipconfig /release; ipconfig /renew; ipconfig /all
```

## Einfach

Der **DHCP-Server** ist die **Anmeldung im Hotel**: Neuer Gast (PC) kommt rein und ruft „Hallo, ich brauche ein Zimmer!“ (**Discover**). Die Rezeption bietet Zimmer 105 an (**Offer**), der Gast sagt „Nehm ich“ (**Request**), die Rezeption bestätigt (**Ack**). Dazu bekommt er einen **Zettel**: Wo ist der Ausgang (Gateway), wo ist die Auskunft (DNS).

- **Lease** = das Zimmer ist nur **gemietet** (Standard 8 Tage). Nach der Hälfte fragt der Gast: „Darf ich verlängern?“
- **Ausschluss** = Zimmer, die nie vergeben werden (für Server mit fester IP).
- **Reservierung** = Stammgast (z. B. Drucker) bekommt **immer dasselbe Zimmer**.
- **Richtlinie** = „Alle Telefone bekommen Zimmer im 2. Stock und nur 1 Tag Miete.“
- **Autorisierung** = die Rezeption braucht eine **Genehmigung vom Hotelchef** (AD), sonst darf sie keine Zimmer vergeben. So kann kein fremder Server einfach Zimmer verteilen.

**Relay-Agent**: Der Ruf „Ich brauche ein Zimmer!“ geht nicht durch Wände (Router blocken Broadcasts). Im Nebengebäude steht deshalb ein **Portier**, der die Anfrage per Telefon an die Rezeption weitergibt und sagt, **aus welchem Gebäude** der Gast kommt.

**IPv6**: Oft bauen sich Geräte ihre Adresse **selbst** (SLAAC). DHCPv6 liefert dann nur noch die **Infos** (zustandslos) – oder vergibt wie früher auch die Adresse (zustandsbehaftet). Das **Gateway** kommt bei IPv6 **immer vom Router**, nie vom DHCP.

## Merksatz
- **DORA**: Discover – Offer – Request – Ack.
- Verlängern bei **50 %** und **87,5 %**.
- Vorrang: Server < Bereich < Richtlinie < **Reservierung**.
- **Superscope** = mehrere IP-Netze auf einem Kabel.
- Broadcasts über Router → **Relay-Agent** / `ip helper-address`.
- **M-Flag** = stateful, **O-Flag** = stateless; Gateway **immer per RA**.
- Autorisierung nur mit **Enterprise-Admin**-Rechten.

## Prüfungsfalle
- Nicht autorisierter Domänen-DHCP-Server vergibt keine Adressen.
- Option 003 auf Serverebene für mehrere Subnetze ist falsch – gehört in den Bereich.
- Superscope für mehrere logische Netze im selben Segment, nicht für Netze hinter Routern.
- Clients im Nachbarnetz ohne Relay-Agent bekommen APIPA (169.254.x.x).
- DHCPv6 verteilt kein Standardgateway.
- Namensschutz verhindert Namensübernahme durch Nicht-Windows-Clients.

## Grafik
### Hotelrezeption DORA
Gast betritt Lobby, ruft laut (Broadcast); Rezeption zeigt Zimmerschlüssel 105; Gast nimmt ihn; Stempel „Ack“. Uhr zeigt Lease, bei 50 % klopft der Gast zur Verlängerung.

### Genehmigung vom Chef
Neue Rezeption öffnet; Schild „Nicht autorisiert“ – Gäste werden nicht bedient; AD-Chef stempelt Genehmigung, Rezeption beginnt Schlüssel auszugeben.

### Portier im Nebengebäude
Client ruft im Netz 20; Wand (Router) blockt; Portier (Relay) telefoniert mit Rezeption im Netz 10 und nennt „Gebäude 192.168.20.1“; Schlüssel für Netz 20 kommt zurück.

### IPv6-Flaggen
Router hisst Flagge M → Client holt Adresse bei DHCPv6; Flagge O → Client baut Adresse selbst und holt nur DNS-Info.

## Karteikarten
- F: Vier Schritte der DHCP-Adressvergabe? | A: Discover, Offer, Request, Acknowledge (DORA).
- F: Wann versucht der Client zuerst die Lease zu verlängern? | A: Bei 50 % der Leasedauer.
- F: Warum vergibt ein neuer Domänen-DHCP-Server keine Adressen? | A: Er ist nicht in AD autorisiert.
- F: Wofür eine Bereichsgruppierung (Superscope)? | A: Mehrere logische IP-Netze auf einem physischen Segment.
- F: Welche Optionsebene hat höchsten Vorrang? | A: Reservierung.
- F: Wie gelangen DHCP-Anfragen über einen Router? | A: DHCP-Relay-Agent bzw. ip helper-address.
- F: Wofür DHCP-Richtlinien? | A: Bestimmten Clients (z. B. nach MAC/Herstellerklasse) eigene IP-Bereiche, Optionen und Leasedauern zuweisen.
- F: Was verhindert der Namensschutz? | A: Dass Nicht-Windows-Clients bestehende DNS-Namen übernehmen.
- F: Welches RA-Flag steht für zustandsbehaftetes DHCPv6? | A: M-Flag (Managed).
- F: Liefert Windows-DHCPv6 ein Standardgateway? | A: Nein, das kommt per Router Advertisement.
- F: DHCP-Option für DNS-Server? | A: 006.
- F: Cmdlet zur Autorisierung? | A: Add-DhcpServerInDC

## Quiz
? Clients im Subnetz 192.168.20.0 erhalten APIPA-Adressen; der DHCP-Server steht in 192.168.10.0. Lösung?
* DHCP-Relay-Agent im Subnetz 20 einrichten
- Superscope erstellen
- Bereich 192.168.20.0 löschen
- Namensschutz aktivieren

? Alle VoIP-Telefone (MAC-Präfix 00-15-5D) sollen Adressen .180–.199 mit 1 Tag Lease bekommen. Lösung?
* DHCP-Richtlinie mit MAC-Bedingung
- MAC-Filter Zulassen
- Reservierungen für jede MAC
- Neuer Superscope

? Ein neuer DHCP-Server in der Domäne startet, vergibt aber keine Leases. Häufigste Ursache?
* Er ist nicht in Active Directory autorisiert
- Die Leasedauer ist zu lang
- Option 015 fehlt
- Konflikterkennung ist deaktiviert

? Welche Kombination im Router Advertisement bedeutet zustandsloses DHCPv6?
* M=0, O=1
- M=1, O=0
- M=1, O=1
- M=0, O=0

? Der Bereich 192.168.10.0/24 ist voll; im selben Segment wird zusätzlich 192.168.11.0/24 genutzt. Lösung?
* Bereichsgruppierung (Superscope) aus beiden Bereichen
- DHCP-Failover
- Multicastbereich
- Zweiter DHCP-Server mit Split-Scope

? Welche Funktion verteilt Adressen eines Bereichs an Clients aus mehreren logischen Subnetzen im selben Segment?
* Superbereich (Superscope)
- Multicastbereich
- Ausschlussbereich
- Reservierung
! Superbereiche fassen mehrere Bereiche zusammen.

? Welche DHCP-Funktion schützt vor dem Ausfall eines einzelnen Servers ohne Bereichsaufteilung?
* DHCP-Failover
- DHCP-Relay
- Superbereich
- Bereichsoption 015
! Modi Lastenausgleich oder Hot Standby.

? Welche Option ist für den PXE-Netzwerkstart relevant?
* 066 (Bootserver) und 067 (Bootdateiname)
- 003 und 006
- 015 und 044
- 042 und 043
! Besser ist oft ein IP-Helper zum WDS-Server statt Optionen.
