---
id: ap1-a5-dhcp
bereich: AP1
block: A5
kapitel: Netzdienste
titel: DHCP – Dynamische IP-Vergabe
stufe: Fortgeschritten
quellen: [DHCP_WindowsServer2025.pdf, 13_DHCP.pdf, 14-Folien-dhcp-namen.pdf]
verweise: [ap1-a4-ipv4, ap1-a4-routing, ap1-a5-dns, ap1-a4-ipv6, az800-dhcp, az800-ipam]
---

## Profi

### Zweck
Das **Dynamic Host Configuration Protocol** versorgt Clients **automatisch** mit IP-Konfiguration: IPv4-/IPv6-Adresse, Subnetzmaske, Standardgateway, DNS-Server, Domänenname u. a. – zentral verwaltet, mit **zeitlich befristeten Leases**.

| Manuelle Konfiguration | DHCP |
|---|---|
| hoher Aufwand pro Gerät | automatische, fehlerfreie Vergabe |
| Risiko von IP-Konflikten und Tippfehlern | vermeidet doppelte/ungültige Adressen |
| Änderungen (neuer DNS-Server) überall einzeln | zentrale Änderung für alle Clients |
| kaum machbar bei vielen/mobilen Geräten | Wiederverwendung von Adressen, skaliert auf tausende Geräte, registriert DNS-Daten |
Statisch bleiben: Server, Router, Drucker (oder per **Reservierung**).

### Ports und Architektur
DHCPv4 nutzt **UDP 67 (Server)** und **UDP 68 (Client)**. Komponenten: **DHCP-Client**, **DHCP-Server** (verwaltet Bereiche), **Relay-Agent** (bei getrennten Subnetzen).

### DORA-Prozess
| Schritt | Nachricht | Richtung | Art |
|---|---|---|---|
| 1 | **D**HCPDISCOVER | Client → alle | Broadcast (Client hat noch keine IP, Quelle 0.0.0.0) |
| 2 | DHCP**O**FFER | Server → Client | Angebot freie IP + Optionen |
| 3 | DHCP**R**EQUEST | Client → alle | **Broadcast** – nimmt ein Angebot an und teilt anderen Servern mit, dass ihre Angebote abgelehnt sind |
| 4 | DHCP**A**CK | Server → Client | Bestätigung, Lease beginnt |
**DHCPNAK**: Server lehnt eine Anforderung ab (z. B. Client in anderem Subnetz) → Client verwirft sofort seine Konfiguration und startet neu mit Discover. **DHCPRELEASE**: Client gibt Adresse zurück (`ipconfig /release`). **DHCPDECLINE**: Client meldet, dass die Adresse bereits belegt ist.

### Lease-Verlängerung
- Bei jedem **Neustart** fragt der Client (Request) beim bisherigen Server nach.
- **T1 = 50 %** der Lease-Dauer: Verlängerung per Unicast beim **ursprünglichen Server**.
- **T2 = 87,5 %**: Rebinding per Broadcast bei **jedem** erreichbaren Server.
- **100 %**: Lease abgelaufen → Konfiguration verworfen → neuer Discover.
Empfohlene Lease-Dauer: kabelgebundenes LAN **8 Tage** (Windows-Standard), WLAN/viele mobile Geräte Stunden bis 1 Tag, Gäste 1–4 Stunden.

### Begriffe
| Begriff | Bedeutung |
|---|---|
| **Bereich (Scope)** | zusammenhängender Adresspool für **ein** Subnetz: Netzwerkkennung, Maske, Start-/Endadresse, Lease-Dauer, Name; muss **aktiviert** werden |
| **Ausschlussbereich** | Adressen im Bereich, die **nicht** vergeben werden (statische Server, Drucker) |
| **Reservierung** | feste Adresse für ein Gerät anhand seiner **MAC-Adresse** (Client-ID) |
| **Optionen** | Zusatzparameter (Gateway, DNS …) |
| **Superbereich (Superscope)** | Gruppierung mehrerer Bereiche als Einheit (mehrere logische Subnetze auf einem physischen Segment) |
| **Lease** | befristete Zuweisung |

### Wichtige Optionen
| Code | Name | Zweck |
|---|---|---|
| **003** | Router | Standardgateway |
| **006** | DNS Servers | DNS-Server |
| **015** | DNS Domain Name | DNS-Suffix |
| 044 | WINS/NBNS Servers | WINS (Legacy) |
| 051 | Lease Time | Lease-Dauer |
| **066 / 067** | Boot Server / Boot File | PXE-Netzwerkboot (WDS/MDT) |
**Ebenen** (von allgemein nach speziell): **Server** → **Bereich** → **Klassen** (Benutzer-/Herstellerklassen, Richtlinien) → **Reservierung**. Es gilt die Einstellung, die **am nächsten am Client** ist (Reservierung schlägt Bereich schlägt Server).

### Autorisierung in Active Directory
In einer Domäne darf ein Windows-DHCP-Server **erst nach Autorisierung** Adressen vergeben. Nicht autorisierte Server erkennen ihre Domänenmitgliedschaft und **verweigern** die Vergabe – Schutz gegen **Rogue-DHCP-Server** (Schurkenserver, z. B. ein mitgebrachter WLAN-Router). Für die (erste) Autorisierung ist die Gruppe **Organisations-Admins (Enterprise Admins)** oder eine Delegation nötig. Nicht-Windows-Router/Server prüfen das nicht.

### Relay-Agent (DHCP-Relay / IP-Helper)
DHCP-Discover ist ein **Broadcast** – Router leiten Broadcasts **nicht** weiter. Steht der DHCP-Server in einem anderen Subnetz, braucht man:
- einen Router, der **RFC 1542** unterstützt und DHCP weiterleitet (Cisco: `ip helper-address`), oder
- einen **DHCP-Relay-Agent** (Windows RRAS: IPv4 → Allgemein → Neues Routingprotokoll → DHCP-Relay-Agent).
Der Relay-Agent nimmt den Broadcast entgegen und schickt ihn per **Unicast** an den DHCP-Server; dabei trägt er die **eigene Schnittstellen-IP (giaddr)** ein – daran erkennt der Server, **aus welchem Bereich** er eine Adresse vergeben muss. Der Server braucht also für jedes Subnetz einen eigenen Bereich (mit Router-Option dieses Subnetzes).

### DNS-Registrierung durch DHCP
- **Nur nach Aufforderung** (Standard): Der Client registriert seinen **A-Eintrag** selbst, der DHCP-Server den **PTR**.
- **Immer dynamisch aktualisieren**: DHCP-Server registriert **A und PTR**.
- „Einträge beim Löschen der Lease verwerfen“ hält DNS sauber; für Nicht-Windows-Clients „DNS-Einträge für Clients aktualisieren, die keine Updates anfordern“ aktivieren.
- **Name Protection** verhindert, dass fremde Geräte bestehende DNS-Namen überschreiben.

### Hochverfügbarkeit
**DHCP-Failover** (ab Server 2012): Zwei Server bilden eine Failover-Beziehung und replizieren Leases.
- **Lastenausgleich (Load Balance)**: beide aktiv, Verteilung z. B. 50/50.
- **Hot Standby**: einer aktiv, der zweite springt bei Ausfall ein (Aktiv/Passiv, typisch Außenstelle).
Alternativ (älter): **Split-Scope** (80/20-Regel: Server A verteilt 80 %, Server B 20 % desselben Netzes) oder Cluster.

### Sicherheit & Betrieb
- **DHCP Guard** (Hyper-V-Netzwerkkarte): verwirft DHCP-Angebote von nicht autorisierten VMs.
- Switch-Funktion **DHCP Snooping** (trusted/untrusted Ports).
- **Rollenbasierte Delegation**: lokale Gruppen **DHCP-Administratoren** (volle Rechte) und **DHCP-Benutzer** (nur lesen).
- **Auditprotokolle** (`%SystemRoot%\System32\dhcp\DhcpSrvLog-*.log`), regelmäßige **Sicherung** der DHCP-Datenbank (`Backup-DhcpServer`, automatisch stündlich nach `...\dhcp\backup`).
- In Server 2025 funktional unverändert.

### Troubleshooting
| Symptom | Mögliche Ursache | Diagnose |
|---|---|---|
| Client erhält keine IP (169.254.x.x) | Server nicht autorisiert, Bereich inaktiv, Dienst aus, Firewall | `Get-DhcpServerInDC`, `Get-DhcpServerv4Scope` |
| Bereich läuft voll | zu kleiner Bereich / zu lange Lease | `Get-DhcpServerv4ScopeStatistics` |
| Doppelte/falsche Adressen | Rogue-DHCP-Server | Auditprotokoll, `ipconfig /all` (welcher DHCP-Server?) |
| Kein Zugriff aus anderem Subnetz | Relay-Agent/IP-Helper fehlt oder falsch | Relay-Konfiguration, `Test-NetConnection` |
Ereignisanzeige: Quelle **Microsoft-Windows-DHCP-Server** (System).

## Lab
**Maschinen**: DC01 (DHCP-Server, Netz A 192.168.1.0/24, IP .1), RTR01 (Router, Netz A .254 / Netz B 10.10.10.1), CL01 (Netz A), CL02 (Netz B) – Domäne vorhanden (sonst Autorisierung entfällt).

### GUI
1. **DC01**: Server-Manager → Rollen und Features → **DHCP-Server** → Installieren → Gelbes Fähnchen → **„DHCP-Konfiguration abschließen“** (legt Sicherheitsgruppen an, **autorisiert** in AD).
2. **DC01**: Tools → **DHCP** → IPv4 → Rechtsklick **Neuer Bereich** → Name „LAN-A“ → 192.168.1.100 – 192.168.1.200, Maske /24 → Ausschluss 192.168.1.100 – .110 → Lease 8 Tage → Optionen jetzt konfigurieren → **Router 192.168.1.254** → DNS 192.168.1.1, Domäne → WINS überspringen → **Bereich aktivieren**.
3. Zweiter Bereich „LAN-B“: 10.10.10.100 – .200 /24, **Router 10.10.10.1**, DNS 192.168.1.1, aktivieren.
4. Reservierung: Bereich LAN-A → Reservierungen → Neue Reservierung → Name „Drucker“, IP 192.168.1.50, MAC (ohne Trennzeichen oder mit Bindestrichen).
5. **RTR01**: Routing und RAS → IPv4 → **Allgemein** → Rechtsklick **Neues Routingprotokoll** → **DHCP-Relay-Agent** → danach Rechtsklick DHCP-Relay-Agent → **Eigenschaften** → DHCP-Server-Adresse **192.168.1.1** hinzufügen → Rechtsklick **Neue Schnittstelle** → **LAN-B** auswählen (Schnittstelle, auf der die Clients ohne Server liegen).
6. **CL01/CL02**: IPv4 auf „IP-Adresse automatisch beziehen“ → `ipconfig /release` → `ipconfig /renew` → `ipconfig /all` (DHCP-Server, Lease-Zeiten prüfen).
7. **DC01**: DHCP-Konsole → Adressleases (beide Clients sichtbar), Bereichsstatistik.

### PowerShell
```powershell
# Auf DC01
Install-WindowsFeature DHCP -IncludeManagementTools
Add-DhcpServerSecurityGroup
Add-DhcpServerInDC -DnsName dc01.contoso.local -IPAddress 192.168.1.1
Restart-Service dhcpserver
Set-ItemProperty HKLM:\SOFTWARE\Microsoft\ServerManager\Roles\12 -Name ConfigurationState -Value 2  # Hinweis im Server-Manager entfernen

Add-DhcpServerv4Scope -Name "LAN-A" -StartRange 192.168.1.100 -EndRange 192.168.1.200 -SubnetMask 255.255.255.0 -LeaseDuration 8.00:00:00 -State Active
Add-DhcpServerv4ExclusionRange -ScopeId 192.168.1.0 -StartRange 192.168.1.100 -EndRange 192.168.1.110
Set-DhcpServerv4OptionValue -ScopeId 192.168.1.0 -Router 192.168.1.254 -DnsServer 192.168.1.1 -DnsDomain contoso.local
Add-DhcpServerv4Reservation -ScopeId 192.168.1.0 -IPAddress 192.168.1.50 -ClientId "00-15-5D-01-02-03" -Name "Drucker"

Add-DhcpServerv4Scope -Name "LAN-B" -StartRange 10.10.10.100 -EndRange 10.10.10.200 -SubnetMask 255.255.255.0 -State Active
Set-DhcpServerv4OptionValue -ScopeId 10.10.10.0 -Router 10.10.10.1 -DnsServer 192.168.1.1

Get-DhcpServerv4ScopeStatistics
Get-DhcpServerv4Lease -ScopeId 192.168.1.0

# Failover (zweiter DHCP-Server DC02 vorhanden)
Add-DhcpServerv4Failover -Name "DC01-DC02" -PartnerServer dc02.contoso.local -ScopeId 192.168.1.0 -LoadBalancePercent 50 -SharedSecret "Geheim123!"

# Auf RTR01 – DHCP-Relay (RRAS muss aktiv sein)
netsh routing ip relay install
netsh routing ip relay add dhcpserver 192.168.1.1
netsh routing ip relay add interface "LAN-B"

# Auf CL02
ipconfig /release
ipconfig /renew
ipconfig /all
```

## Einfach

Stell dir vor, du kommst in ein **Hotel**. Du musst dir nicht selbst ein Zimmer aussuchen – die **Rezeption** (DHCP-Server) gibt dir eins, zusammen mit einem Zettel: „Frühstücksraum ist hier, WLAN-Passwort ist das.“ Genau so bekommt jeder Computer automatisch seine **Adresse** und alle wichtigen Infos (Gateway, DNS).

**Das Zimmer bekommst du in vier Schritten – DORA**:
1. **D**iscover: Du rufst in die Lobby: „Hallo, gibt's hier eine Rezeption?“
2. **O**ffer: Die Rezeption: „Du kannst Zimmer 105 haben.“
3. **R**equest: Du rufst: „Ich nehme Zimmer 105!“ (laut, damit andere Rezeptionen wissen, dass du versorgt bist)
4. **A**cknowledge: „Gebucht! Hier ist dein Schlüssel.“

**Lease** = die **Aufenthaltsdauer**. Nach der Hälfte der Zeit fragst du an der Rezeption: „Darf ich verlängern?“ Klappt das nicht, fragst du bei 87,5 % **jede** Rezeption. Läuft die Zeit ab, musst du ausziehen und neu fragen.

**Ausschlussbereich**: Zimmer, die nicht an Gäste gehen (die wohnen schon fest: Server, Drucker). **Reservierung**: Stammgast Drucker bekommt **immer** Zimmer 50 – erkannt an seinem Ausweis (MAC-Adresse).

**Autorisierung**: Nur **offiziell zugelassene Rezeptionen** dürfen Zimmer vergeben. Stellt jemand einen Fake-Schalter auf (ein mitgebrachter WLAN-Router), verteilt der falsche Zimmer – das ist ein **Rogue-DHCP-Server**.

**Relay-Agent**: Dein Rufen in der Lobby (Broadcast) hört man nur in **deinem Gebäude**. Ist die Rezeption im Nachbargebäude, braucht es einen **Boten**, der deine Frage hinüberträgt und dazusagt, aus welchem Gebäude du kommst – damit du ein Zimmer im richtigen Gebäude bekommst.

**Failover**: Zwei Rezeptionen teilen sich die Arbeit – fällt eine aus, macht die andere weiter.

## Merksatz
- **DORA**: Discover – Offer – Request – Acknowledge.
- Verlängern bei **50 %** (eigener Server), **87,5 %** (jeder Server).
- Ports **67 Server / 68 Client** (UDP).
- Optionen: **003 Router, 006 DNS, 015 Domäne, 066/067 PXE**.
- Ohne **Relay-Agent** kein DHCP über Router (Broadcast!).

## Prüfungsfalle
- Request ist ein **Broadcast**, kein Unicast.
- Ausschluss (nicht vergeben) ≠ Reservierung (fest vergeben).
- Bereich muss **aktiviert** und der Server **autorisiert** sein.
- Relay-Agent auf der Router-Schnittstelle einrichten, **an der die Clients hängen**.
- Für jedes Subnetz ein eigener Bereich mit **eigener Router-Option**.

## Grafik
### DORA-Animation
Client ohne IP (Fragezeichen), Server; vier Briefe fliegen nacheinander (Broadcast-Wellen für D und R), am Ende erscheint die IP über dem Client mit Lease-Uhr.

### Lease-Uhr
Kreis mit 0–100 %; Markierungen T1 (50 %) und T2 (87,5 %); beim Erreichen läuft die jeweilige Anfrage los; Knopf „Server aus“ zeigt Rebinding und Ablauf.

### Relay über den Router
Zwei Subnetze, Router in der Mitte; Discover-Broadcast prallt am Router ab; mit aktivem Relay wird er als Unicast mit giaddr-Etikett zum Server weitergeleitet, die Antwort kommt zurück.

### Rogue-DHCP
Zweiter, unautorisierter „Server“ (WLAN-Router) antwortet schneller; Client bekommt falsches Gateway; DHCP Guard/Snooping blockt die Antwort.

## Karteikarten
- F: Die vier DORA-Schritte? | A: Discover, Offer, Request, Acknowledge.
- F: Welche DHCP-Nachrichten sind Broadcasts? | A: Discover und Request (Offer/ACK je nach Client ggf. auch).
- F: Wann versucht ein Client die Lease zu verlängern? | A: Bei 50 % (T1) beim ursprünglichen Server, bei 87,5 % (T2) bei jedem Server.
- F: Was ist ein DHCPNAK? | A: Ablehnung durch den Server – Client verwirft seine Konfiguration.
- F: UDP-Ports von DHCP? | A: Server 67, Client 68.
- F: Unterschied Ausschluss und Reservierung? | A: Ausschluss: Adressen werden nicht vergeben. Reservierung: feste Adresse für eine bestimmte MAC.
- F: Optionscode für Standardgateway und DNS? | A: 003 und 006.
- F: Warum muss ein DHCP-Server in AD autorisiert werden? | A: Schutz vor Rogue-DHCP-Servern – nicht autorisierte Windows-Server vergeben keine Adressen.
- F: Wozu dient ein DHCP-Relay-Agent? | A: Leitet DHCP-Broadcasts als Unicast über Router zum DHCP-Server weiter.
- F: Zwei Modi des DHCP-Failovers? | A: Lastenausgleich (Load Balance) und Hot Standby.
- F: Was registriert der DHCP-Server standardmäßig in DNS? | A: Den PTR-Eintrag (A-Eintrag registriert der Client selbst).
- F: Standard-Lease-Dauer Windows? | A: 8 Tage.
- F: Was ist ein Superbereich? | A: Zusammenfassung mehrerer Bereiche als Einheit.

## Quiz
? In welcher Reihenfolge laufen die DHCP-Nachrichten ab?
* Discover, Offer, Request, Acknowledge
- Request, Offer, Discover, Acknowledge
- Offer, Discover, Acknowledge, Request
- Discover, Request, Offer, Acknowledge

? Ein Client im Subnetz B erhält keine Adresse vom DHCP-Server in Subnetz A. Was fehlt am wahrscheinlichsten?
* Ein DHCP-Relay-Agent bzw. IP-Helper auf dem Router
- Eine Reservierung
- Die Option 015
- Ein Ausschlussbereich

? Bei wie viel Prozent der Lease-Dauer versucht der Client die erste Verlängerung?
* 50 %
- 25 %
- 87,5 %
- 100 %

? Welche DHCP-Option gibt das Standardgateway an?
* 003
- 006
- 015
- 066

? Welche Einstellung gewinnt bei widersprüchlichen Optionen?
* Die Reservierungsoption
- Die Serveroption
- Die Bereichsoption
- Die zuerst angelegte Option

? Welche Ports verwendet DHCP für IPv4?
* UDP 67 (Server) und UDP 68 (Client)
- TCP 53 und UDP 53
- UDP 546 und 547
- TCP 80 und 443
! DHCPv6 nutzt UDP 546/547.

? Was ist eine DHCP-Reservierung?
* Eine feste IP-Adresse, die immer an dieselbe MAC-Adresse vergeben wird
- Ein Adressbereich, der nicht vergeben wird
- Eine Lease mit unbegrenzter Dauer für alle Clients
- Ein zweiter DHCP-Server
! Ausschlüsse dagegen werden gar nicht vergeben.

? Welche DHCP-Option übermittelt die DNS-Server?
* Option 006
- Option 003
- Option 015
- Option 066
! 003 Router, 015 Domänenname, 066 Bootserver.
