---
id: netz-dhcp-uebung
bereich: AZ-800
block: Netzwerk
kapitel: Netzwerkdienste
titel: DHCP unter Windows Server – Scope, Optionen, Reservierung, Relay, Failover (Schule + Server 2025)
stufe: Fortgeschritten
fach: Windows Server / AZ-800
pruefungen: [AZ-800, AP2, Schule]
quellen: [13_DHCP.pdf, DHCP_WindowsServer2025.pdf, 09-1-Uebung-einfaches_Netzwerk.pdf]
verweise: [ccna-dhcp-dns, ccna-dhcp-snooping-dai, netz-dns-uebung]
---

## Profi

### Aufgaben des DHCP-Servers
DHCP (RFC 2131) hilft bei der automatischen IP-Konfiguration: vermeidet doppelte und ungültige Adressen, registriert DNS-Daten, verwaltet **ein oder mehrere Subnetze**, vergibt **Leases** (Konfiguration + Gültigkeit), die Client auch manuell erneuern kann (`ipconfig /renew`). DORA: Discover → Offer → Request → Acknowledge (Broadcast bzw. Unicast).

### Lease-Verhalten (Schule 2012 und Server 2025)
- Beim Start sendet der Client einen Request an den Server, von dem er die Lease hatte.
- Spätestens bei **50 % (T1)** erneuert er per Unicast (Request → ACK).
- Bei ungültiger Anforderung: **DHCPNACK** – der Client verwirft die Konfiguration sofort.
- Bei **87,5 % (T2)** versucht er es bei **jedem** erreichbaren Server (Rebind, Broadcast).
- Bei **Ablauf (100 %)** wird die Adresse freigegeben, ein neues Discover folgt.
- Standard-Lease unter Windows: **8 Tage** (LAN); WLAN/mobile Geräte Stunden bis 1 Tag; Gäste 1–4 Stunden.

### Autorisierung in Active Directory
DHCP-Server müssen in AD **autorisiert** werden (`Add-DhcpServerInDC -DnsName dhcp1.exa.local -IPAddress 10.0.0.3`, `Get-DhcpServerInDC`); sonst startet der Dienst nicht bzw. vergibt nichts. Nicht autorisierte Server = **Rogue-Server**. (NT4-Server verteilten auch ohne Autorisierung.) Erstmalige Autorisierung: Enterprise Admins oder Delegation. Lokale Gruppen: **DHCP Administrators** (Verwaltung), **DHCP Users** (lesen).

### Scope und Optionen
Ein **Bereich (Scope)** versorgt **genau ein Subnetz** und muss **aktiviert** werden. Eigenschaften: Netzwerkkennung, Subnetzmaske, Adressbereich, Lease-Dauer, Router (Gateway), Bereichsname, **Ausschlussbereich** (nie vergebene Adressen – z. B. statische Server/Drucker), **Reservierung** (MAC → feste IP). Bereiche können gruppiert werden (**Superscope**).
Optionen (Auswahl): 003 Router, 006 DNS-Server, 015 DNS-Domänenname, 044 WINS (Legacy), 051 Lease-Zeit, 066/067 Boot-Server/-Datei (PXE). Ebenen: **Server → Bereich → Klasse → Reservierung**; **die Einstellung, die am nächsten am Objekt ist, zählt**.

### DNS-Registrierung
Standard: **A-Eintrag registriert der Client, PTR der DHCP-Server**. Alternativ „immer dynamisch aktualisieren“ (Server registriert A und PTR), Einträge beim Löschen der Lease verwerfen, ältere Clients unterstützen. Bei Registrierung für andere sollten DHCP-Server Mitglied der Gruppe **DnsUpdateProxy** sein (Vorsicht: Sicherheitsrisiko bei DCs).

### Relay-Agent
Router, die DHCP-Broadcasts nicht weiterleiten (nicht RFC-1542-konform), benötigen einen **DHCP-Relay-Agent** (Windows: RRAS-Relay, Cisco: `ip helper-address`). Auf dem Server wird für jedes Subnetz ein eigener Scope angelegt.

### Hochverfügbarkeit
**DHCP-Failover** (ab Server 2012): zwei Server replizieren Leases – **Load Balance** (z. B. 50/50) oder **Hot Standby** (aktiv/passiv). Alternativ klassischer **Split-Scope** (80/20). Zusätzlich: Backup der Datenbank, Audit-Logs, **DHCP-Guard** (Hyper-V), **Name Protection**.

### Troubleshooting
| Symptom | Ursache | Prüfung |
|---|---|---|
| Client ohne IP (169.254.x.x) | Server nicht autorisiert / Scope inaktiv | `Get-DhcpServerInDC`, `Get-DhcpServerv4Scope` |
| Pool leer | Scope zu klein / Lease zu lang | `Get-DhcpServerv4ScopeStatistics` |
| Falsche Adressen | Rogue-DHCP | Audit-Log, Netzscan, DHCP Snooping |
| Anderes Subnetz erhält nichts | Relay fehlt | `Test-NetConnection` Port 67/68, Helper |

## Einfach

Stell dir eine **Wohnungsverwaltung** vor. Der DHCP-Server ist der Hausverwalter, der jedem neuen Mieter (Computer) eine Wohnung (IP-Adresse) zuteilt und ihm dazu ein Infoblatt gibt: „Der Hausmeister (Gateway) ist Herr Müller, die Telefonauskunft (DNS) ist unter 10.0.0.10 erreichbar.“

Wichtige Wörter, einfach erklärt:
- **Scope (Bereich)** = die Liste der Wohnungen in einem Haus (Subnetz), die er vergeben darf.
- **Ausschluss** = Wohnungen, die er nie vergeben darf, weil sie schon jemandem fest gehören (Drucker, Server).
- **Reservierung** = „Wohnung 50 gehört immer dem Mieter mit dem Namensschild X“ (MAC-Adresse).
- **Lease** = der Mietvertrag mit Ablaufdatum (meist 8 Tage). Nach der halben Zeit fragt der Mieter: „Darf ich verlängern?“. Ist der Verwalter nicht erreichbar, fragt er bei 7/8 der Zeit jeden anderen Verwalter. Läuft der Vertrag ab, muss er ausziehen und neu suchen.
- **Autorisierung** = Der Verwalter braucht eine Bescheinigung vom Hausbesitzer (Active Directory). Ohne die darf er nicht arbeiten. So verhindert man, dass sich jemand als falscher Verwalter ausgibt (Rogue).
- **Relay** = Ein Bote an der Haustür eines anderen Hauses, der Anfragen zum Verwalter trägt, der nur in einem Haus sitzt.
- **Failover** = Zwei Verwalter teilen sich die Arbeit. Wird einer krank, macht der andere weiter.

Die Einstellungen kann man auf vier Ebenen geben: für das ganze Büro, für ein Haus, für eine Gruppe oder für eine einzelne Wohnung. Gilt für die Wohnung etwas anderes als fürs Haus, gewinnt immer die genauere Regel.

## Merksatz
- **DORA – T1 50 % – T2 87,5 % – Ablauf 100 %.**
- **Autorisieren in AD, dann Scope aktivieren.**
- **Optionen: Server → Bereich → Klasse → Reservierung (nächstes gewinnt).**
- **Relay-Agent für andere Subnetze, Failover gegen Ausfall.**
- **Ausschluss = nie vergeben, Reservierung = immer dieselbe IP.**

## Prüfungsfalle
- Die Folien von 2012 (Server 2008) schreiben, bei 87,5 % werde „wieder ein Discover“ ausgesendet. Technisch richtig ist: bei T2 ein **Rebind** (Request-Broadcast an jeden Server); ein echtes Discover beginnt erst bei Ablauf der Lease.
- **Ausschlussbereich ≠ Reservierung**: Ausschluss ist nie vergeben (für statische Geräte), Reservierung bindet MAC an IP.
- **Scope muss aktiviert sein**, sonst keine Vergabe.
- **Ein Scope = ein Subnetz**; für mehrere Subnetze mehrere Scopes (ggf. Superscope).
- Ohne **Autorisierung** (in einer Domäne) vergibt der Server nichts.
- DHCP-Server brauchen selbst eine **statische IP**.
- Windows-Standard-Lease: **8 Tage** (nicht 24 h wie bei vielen Heimroutern).
- Der PTR-Eintrag wird standardmäßig vom **DHCP-Server**, der A-Eintrag vom **Client** registriert.

## Grafik
### DORA mit Server 2025
1. Client -> DHCP-Server: DHCPDISCOVER (Broadcast)
2. DHCP-Server -> Client: DHCPOFFER (10.10.10.101, Maske, GW, DNS)
3. Client -> DHCP-Server: DHCPREQUEST
4. DHCP-Server -> Client: DHCPACK (Lease 8 Tage)

### Lease-Erneuerung
1. Client: Lease-Start (0 %)
2. Client -> DHCP-Server: Renew bei 50 % (T1, Unicast)
3. DHCP-Server -> Client: ACK, Lease verlängert
4. Text: Wenn Server nicht antwortet: bei 87,5 % (T2) Rebind an jeden Server
5. Text: Bei 100 %: Adresse verworfen, neues Discover

### Relay und Failover
1. Client -> Router: Broadcast Discover (anderes Subnetz)
2. Router -> DHCP-Server: Relay als Unicast mit giaddr
3. DHCP-Server -> Router: Offer für den passenden Scope
4. Text: Partner-Server hält per Failover dieselben Leases bereit

## Lab
**Heimlabor / Schule: DC01 (192.168.1.1, DHCP + DNS), Server-A, Win10-1 als Client (Übung „einfaches Netzwerk“)**

### GUI
1. **Maschine DC01**: Server-Manager → Verwalten → Rollen und Features hinzufügen → DHCP-Server → Installieren → Postinstallations-Konfiguration → Autorisieren (Domänen-Admin).
2. **DC01**: DHCP-Konsole (`dhcpmgmt.msc`) → IPv4 → Neuer Bereich: Name „LAN“, 192.168.1.100 – 192.168.1.200, Maske 255.255.255.0, Ausschluss 192.168.1.1 – 192.168.1.20, Lease 8 Tage.
3. Bereichsoptionen: 003 Router 192.168.1.1, 006 DNS 192.168.1.1, 015 Domänenname.
4. Reservierung für Drucker: Bereich → Reservierungen → Neu → MAC → IP 192.168.1.50.
5. Rechtsklick Bereich → Aktivieren.
6. **Maschine Win10-1** (Client): `ipconfig /release`, `ipconfig /renew`, `ipconfig /all`.

### PowerShell
Auf **DC01** (als Administrator):
```
Install-WindowsFeature DHCP -IncludeManagementTools
Add-DhcpServerInDC -DnsName dc01.exa.local -IPAddress 192.168.1.1
Add-DhcpServerv4Scope -Name "LAN" -StartRange 192.168.1.100 -EndRange 192.168.1.200 -SubnetMask 255.255.255.0
Add-DhcpServerv4ExclusionRange -ScopeId 192.168.1.0 -StartRange 192.168.1.1 -EndRange 192.168.1.20
Set-DhcpServerv4OptionValue -ScopeId 192.168.1.0 -Router 192.168.1.1 -DnsServer 192.168.1.1 -DnsDomain exa.local
Add-DhcpServerv4Reservation -ScopeId 192.168.1.0 -IPAddress 192.168.1.50 -ClientId "00-11-22-33-44-55"
Set-DhcpServerv4Scope -ScopeId 192.168.1.0 -State Active
Get-DhcpServerv4ScopeStatistics -ScopeId 192.168.1.0
Get-DhcpServerv4Lease -ScopeId 192.168.1.0
```
Auf **Win10-1**:
```
ipconfig /release
ipconfig /renew
Get-NetIPConfiguration
```
**Übung „einfaches Netzwerk“ (09-1)**: 3 VMs (Server 2022) umbenennen (DC01, Server-A, Server-B), statische IP 192.168.1.1 / .100 / .101 (Maske 255.255.255.0, Gateway 192.168.1.1), auf Server-B die Firewall zum Test ausschalten (`Set-NetFirewallProfile -Profile Domain,Private,Public -Enabled False` – nur im Lab!), mit `ping` gegenseitig prüfen. Danach DHCP statt statisch ausprobieren.

## Befehle
- `Install-WindowsFeature DHCP -IncludeManagementTools` – Rolle installieren
- `Add-DhcpServerInDC` – in AD autorisieren
- `Get-DhcpServerInDC` – autorisierte Server
- `Add-DhcpServerv4Scope` – Scope anlegen
- `Set-DhcpServerv4OptionValue` – Optionen setzen
- `Add-DhcpServerv4Reservation` – Reservierung
- `Get-DhcpServerv4ScopeStatistics` – Auslastung
- `ipconfig /renew` – Lease erneuern
- `Add-DhcpServerv4Failover` – Failover einrichten

## Übungen
- A: Nennen Sie die Eigenschaften eines DHCP-Bereichs. | L: Netzwerkkennung, Subnetzmaske, Adressbereich, Lease-Dauer, Router (Gateway), Bereichsname, Ausschlussbereich.
- A: Wann erneuert ein Client seine Lease? | L: Spätestens nach 50 % beim ursprünglichen Server, nach 87,5 % bei jedem Server, nach 100 % verwirft er die Adresse.
- A: Was geschieht bei einem DHCPNAK? | L: Der Client verwirft die Konfiguration sofort und beginnt neu.
- A: Was ist ein Rogue-Server und wie schützt AD davor? | L: Ein nicht autorisierter DHCP-Server; DHCP-Server müssen in AD autorisiert sein.
- A: Wie ist die Reihenfolge der Optionsebenen? | L: Server, Bereich, Klasse, Reservierung; die am nächsten am Objekt zählt.
- A: Wer registriert A- und PTR-Eintrag standardmäßig? | L: A der Client, PTR der DHCP-Server.
- A: Wozu dient ein Relay-Agent? | L: Weiterleitung von DHCP-Broadcasts über Router in andere Subnetze.
- A: Übung „Netzwerk erstellen“: IPs für DC01, Server-A, Server-B? | L: 192.168.1.1, 192.168.1.100, 192.168.1.101, jeweils /24 und Gateway 192.168.1.1.
- A: Load Balance vs. Hot Standby? | L: Beide Server aktiv (z. B. 50/50) vs. einer aktiv, der andere als Reserve.

## Karteikarten
- F: Was bedeutet DORA? | A: Discover, Offer, Request, Acknowledge.
- F: Standard-Lease-Dauer unter Windows? | A: 8 Tage.
- F: T1 / T2? | A: 50 % (Renew) / 87,5 % (Rebind).
- F: Option 003 / 006 / 015? | A: Router / DNS-Server / DNS-Domänenname.
- F: Option 066/067? | A: Boot-Server/Bootdatei (PXE).
- F: Autorisierung Befehl? | A: Add-DhcpServerInDC
- F: Was ist ein Ausschlussbereich? | A: Adressen im Scope, die nicht automatisch vergeben werden.
- F: Was ist eine Reservierung? | A: Feste IP für eine bestimmte MAC-Adresse.
- F: Was ist ein Superscope? | A: Gruppierung mehrerer Scopes.
- F: Was ist DHCP-Failover? | A: Zwei Server replizieren Leases (Load Balance oder Hot Standby).
- F: Was ist DHCP-Guard? | A: Hyper-V-Funktion, die unautorisierte VMs als DHCP-Server blockiert.

## Quiz
? Welche Reihenfolge hat DORA?
* Discover, Offer, Request, Acknowledge
- Offer, Discover, Request, Acknowledge
- Discover, Request, Offer, Acknowledge
- Request, Discover, Acknowledge, Offer
? Wann beginnt der Client die Lease-Erneuerung?
* Nach 50 % der Lease
- Nach 87,5 %
- Nach 100 %
- Nach 10 %
? Was geschieht ohne Autorisierung in AD?
* Der DHCP-Dienst vergibt keine Adressen
- Der Server vergibt trotzdem
- Der Server wird DC
- Der Server wird Relay
? Welche Option definiert das Standardgateway?
* 003
- 006
- 015
- 051
? Welcher Cmdlet erstellt einen Scope?
* Add-DhcpServerv4Scope
- New-DhcpScope
- Set-DhcpServerv4Lease
- Install-DhcpScope
? Welche Einstellungsebene zählt bei widersprüchlichen Optionen?
* Die am nächsten am Objekt (Reservierung)
- Die Serverebene
- Die höchste Nummer
- Die zuletzt angelegte
? Was bedeutet Ausschlussbereich?
* Adressen werden nie automatisch vergeben
- Adressen sind für eine MAC reserviert
- Der Scope ist deaktiviert
- Der Scope ist redundant
? Welche Aufgabe hat der Relay-Agent?
* Broadcasts über Subnetzgrenzen weiterleiten
- Leases speichern
- DNS auflösen
- Firewall-Regeln setzen
? Wie lautet die Standard-Leasedauer unter Windows Server?
* 8 Tage
- 1 Stunde
- 24 Stunden
- 30 Tage
