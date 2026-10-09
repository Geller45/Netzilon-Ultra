---
id: az800-dns-weiterleitung
bereich: AZ-800
block: A7
kapitel: Netzwerkinfrastruktur
titel: DNS-Weiterleitung – Weiterleitungen, bedingte Weiterleitung, Stubzonen, Stammhinweise & DNS-Richtlinien
stufe: Fortgeschritten
quellen: [AZ-800 Study Guide, Microsoft Learn, Netzwerkinfrastruktur_mit_Windows_Server_2016_implementieren_70-741.pdf]
verweise: [az800-dns, az800-azure-dns-private, az800-trusts, ap1-a5-dns, ap1-a5-dns-zonen]
---

## Profi

### Wie ein Windows-DNS-Server auflöst
1. **Autoritative Zone** vorhanden? → direkt antworten.
2. **Cache** → Antwort aus dem Zwischenspeicher.
3. **Bedingte Weiterleitung** für diese Domäne? → an die festgelegten Server.
4. **Weiterleitungen** (allgemein) konfiguriert? → an diese.
5. Sonst (oder wenn Weiterleitungen nicht antworten und Fallback erlaubt) → **Stammhinweise** (*Root Hints*) → iterativ von den Root-Servern abwärts.

### Vergleich der Methoden
| Methode | Wofür | Pflege | Replizierbar über AD |
|---|---|---|---|
| **Weiterleitung** (*Forwarder*) | **alle** nicht lokal bekannten Namen (z. B. Internet über Provider-DNS/Firewall) | manuell | nein (pro Server) |
| **Bedingte Weiterleitung** (*Conditional Forwarder*) | **bestimmte Domäne** (z. B. Partnerfirma, Azure-Zone) an **feste** IPs | manuell, IPs ändern sich → nachpflegen | **ja** (Domäne/Forest) |
| **Stubzone** | bestimmte Domäne, Server-Liste **automatisch** aktuell (holt NS-Einträge) | automatisch | ja (AD-integriert möglich) |
| **Sekundärzone** | vollständige Kopie der Zone | automatisch | nein (Zonenübertragung) |
| **Stammhinweise** | rekursive Auflösung übers Internet ohne Weiterleitung | kaum | – |
| **Delegierung** | Unterdomäne der **eigenen** Zone an andere Server abgeben | – | mit Zone |

**Merkregel**: Domänen **außerhalb** der eigenen Namenshierarchie (Partner nach Firmenfusion, **Vertrauensstellung**) → **bedingte Weiterleitung** oder **Stubzone**. Unterdomäne **innerhalb** → **Delegierung**.

### Wichtige Einstellungen
- **Stammhinweise verwenden, wenn keine Weiterleitungen verfügbar sind** (Standard an) – für strenge Umgebungen deaktivieren.
- **Rekursion deaktivieren** (Server → Erweitert): Server beantwortet nur eigene Zonen (reiner autoritativer DNS, z. B. in DMZ). Achtung: dann funktionieren **auch Weiterleitungen nicht**.
- **Weiterleitungs-Zeitüberschreitung** (Standard 3 s pro Server).
- **Server-Cache leeren**: `Clear-DnsServerCache`; Client: `ipconfig /flushdns`.
- **Cache Locking** und **Socket Pool** gegen Cache-Poisoning (Standard aktiv).
- **Response Rate Limiting (RRL)** gegen DNS-Amplification-Angriffe.

### DNS-Richtlinien (*DNS Policies*, ab Server 2016)
Richtlinien entscheiden anhand von **Kriterien** (Client-Subnetz, Schnittstelle, Uhrzeit, FQDN, Abfragetyp, Transportprotokoll), **wie** der Server antwortet.
| Szenario | Umsetzung |
|---|---|
| **Split-Brain** | gleicher Name, **intern** andere IP als **extern** → **Zonenbereiche** (*Zone Scopes*) + Richtlinie nach Clientsubnetz oder Serverschnittstelle |
| **Geo-Standort** | Clients aus Subnetz Berlin bekommen den Berliner Webserver |
| **Anwendungslastausgleich** | Antworten gewichtet auf mehrere Rechenzentren verteilen |
| **Filterung / Blockieren** | Abfragen bestimmter Domänen oder Clients **ignorieren** oder verweigern (z. B. Malware-Domäne) |
| **Tageszeit** | außerhalb der Geschäftszeit anderes Ziel |
| **Selektive Rekursion** | Rekursion nur für interne Clients (**Rekursionsbereiche**) |
Richtlinienebenen: **Serverebene** (Rekursion, Filter) und **Zonenebene** (Antworten). Konfiguration **nur per PowerShell**.

### Hybrid-Bezug (Azure)
- Namen aus **Azure DNS Private Zones** von on-prem auflösen: bedingte Weiterleitung auf den **Inbound-Endpunkt** des **Azure DNS Private Resolver** (oder einen DNS-Server-VM in Azure, die an **168.63.129.16** weiterleitet). 168.63.129.16 ist **nur aus Azure** erreichbar.
- Azure-VMs sollen die AD-Domäne auflösen: VNet-DNS-Server auf die **DCs** stellen oder **Outbound-Endpunkt** + **Weiterleitungsregelsatz** (*Forwarding Ruleset*).

## Lab
**Maschinen**: **DC01** (example.com, DNS), **DC-P01** (Partnerdomäne partner.local, DNS, IP 192.168.50.10), **CL01**.

### GUI
1. **DC01**: DNS-Manager → Server → Eigenschaften → **Weiterleitungen** → Bearbeiten → `1.1.1.1` und `9.9.9.9` → Häkchen „Stammhinweise verwenden…“ lassen.
2. **DC01**: Knoten **Bedingte Weiterleitungen** → Neu → Domäne `partner.local` → IP `192.168.50.10` → **„Diese bedingte Weiterleitung in Active Directory speichern…“** → Alle DNS-Server in dieser Domäne.
3. **CL01**: `nslookup srv.partner.local` → Antwort von DC01 (über Weiterleitung).
4. Alternative testen: bedingte Weiterleitung löschen → **DC01**: Neue Zone → **Stubzone** → `partner.local` → Master `192.168.50.10` → in AD speichern. **DC-P01** muss Zonenübertragung an DC01 erlauben.
5. **DC01**: Server → Eigenschaften → **Stammhinweise** anzeigen; Registerkarte **Erweitert** → Rekursion (nur ansehen, nicht deaktivieren).
6. **DC01**: Server → Kontextmenü → **Cache löschen**.

### PowerShell
```powershell
# Auf DC01 – Weiterleitungen
Set-DnsServerForwarder -IPAddress 1.1.1.1,9.9.9.9 -UseRootHint $true -Timeout 3
Get-DnsServerForwarder

# Auf DC01 – bedingte Weiterleitung, in AD repliziert
Add-DnsServerConditionalForwarderZone -Name "partner.local" -MasterServers 192.168.50.10 -ReplicationScope Domain
Get-DnsServerZone | Where-Object ZoneType -eq Forwarder

# Auf DC01 – Stubzone als Alternative
Add-DnsServerStubZone -Name "partner.local" -MasterServers 192.168.50.10 -ReplicationScope Domain

# Auf DC01 – Split-Brain mit DNS-Richtlinie
Add-DnsServerClientSubnet -Name "Intern" -IPv4Subnet 192.168.10.0/24
Add-DnsServerZoneScope -ZoneName "example.com" -Name "InternScope"
Add-DnsServerResourceRecord -ZoneName "example.com" -A -Name "www" -IPv4Address 192.168.10.80 -ZoneScope "InternScope"
Add-DnsServerQueryResolutionPolicy -Name "SplitBrainIntern" -Action ALLOW -ClientSubnet "eq,Intern" -ZoneScope "InternScope,1" -ZoneName "example.com"

# Auf DC01 – Malware-Domäne blockieren
Add-DnsServerQueryResolutionPolicy -Name "BlockBoese" -Action IGNORE -FQDN "EQ,*.boese.example"

# Auf DC01 – Rekursion nur für interne Clients
Set-DnsServerRecursionScope -Name . -EnableRecursion $false
Add-DnsServerRecursionScope -Name "InternRek" -EnableRecursion $true
Add-DnsServerQueryResolutionPolicy -Name "RekIntern" -Action ALLOW -ApplyOnRecursion -RecursionScope "InternRek" -ClientSubnet "eq,Intern"

# Cache/Diagnose
Clear-DnsServerCache -Force
Resolve-DnsName srv.partner.local -Server 192.168.10.10
```

## Einfach

Stell dir den DNS-Server als **Auskunftsschalter** vor. Weiß er eine Adresse nicht, hat er mehrere Möglichkeiten:
- **Weiterleitung** = „Frag mal den großen Schalter in der Stadt.“ Alles Unbekannte geht dorthin (z. B. an den DNS des Internetanbieters).
- **Bedingte Weiterleitung** = „Fragen zur **Firma Partner** gehen **immer** an den Schalter von Partner, Telefonnummer 192.168.50.10.“ Ändert Partner die Nummer, musst **du** sie ändern.
- **Stubzone** = ein **Zettel mit den Schaltern von Partner**, der sich **selbst aktualisiert**. Kommt ein neuer Schalter dazu, steht er automatisch drauf.
- **Stammhinweise** = die **Adressen der Zentrale der Welt** (Root-Server). Von dort fragt man sich Stück für Stück durch: `.de` → `firma.de` → `www.firma.de`.

**DNS-Richtlinien** = der Schalter antwortet **je nach Fragesteller** unterschiedlich:
- Mitarbeiter **drinnen** fragen nach `www.example.com` → bekommen die **interne** Adresse; Leute **draußen** → die **öffentliche** (Split-Brain).
- Fragen nach einer **Schadsoftware-Seite** werden einfach **ignoriert**.

**Azure-Trick**: Den Azure-DNS-Auskunftsschalter (168.63.129.16) erreicht man **nur von innen aus Azure**. Deshalb stellt man dort einen „**Empfangsschalter**“ (Private Resolver) auf, an den on-prem weiterleiten kann.

## Merksatz
- **Alles Unbekannte** → Weiterleitung; **eine Domäne** → bedingte Weiterleitung.
- **Stubzone** aktualisiert NS-Server selbst, bedingte Weiterleitung nicht.
- **Delegierung** nur für **eigene** Unterdomänen.
- Rekursion aus = auch **Weiterleitungen aus**.
- **DNS-Richtlinien** nur per **PowerShell**; Split-Brain = **Zonenbereich** + Clientsubnetz.
- **168.63.129.16** nur aus Azure erreichbar.

## Prüfungsfalle
- Bedingte Weiterleitung bricht nach IP-Wechsel der Partner-DNS-Server → Stubzone wäre automatisch aktuell.
- Bedingte Weiterleitung ohne „In AD speichern“ gilt nur auf dem einen Server.
- Stubzone benötigt Zonenübertragung vom Master (bei Nicht-AD-Master).
- Deaktivierte Rekursion stoppt auch Weiterleitungen.
- On-prem-Weiterleitung direkt auf 168.63.129.16 funktioniert nicht.
- DNS-Richtlinien sind nicht im DNS-Manager konfigurierbar.

## Grafik
### Auskunftsschalter
Client fragt DC01; Pfeilweg: eigene Zone? nein → Cache? nein → bedingte Weiterleitung passt? → Partner-Schalter; sonst → Weiterleitung → Internet; sonst → Root-Hints-Treppe (. → de → firma.de).

### Zettel vs. feste Nummer
Links bedingte Weiterleitung mit fest geschriebener Nummer – Partner zieht um, Anruf ins Leere. Rechts Stubzone-Zettel, der sich selbst neu beschreibt.

### Split-Brain
Zwei Personen fragen nach www: interner Mitarbeiter bekommt Karte 192.168.10.80, externer Besucher bekommt öffentliche IP.

### Azure-Empfang
On-prem-DNS → VPN-Tunnel → Inbound-Endpunkt Private Resolver → 168.63.129.16 → private Zone.

## Karteikarten
- F: Unterschied Weiterleitung und bedingte Weiterleitung? | A: Weiterleitung für alle unbekannten Namen, bedingte nur für eine bestimmte Domäne.
- F: Vorteil Stubzone gegenüber bedingter Weiterleitung? | A: Liste der autoritativen Server aktualisiert sich automatisch.
- F: Wann Delegierung statt bedingter Weiterleitung? | A: Für Unterdomänen der eigenen Zone.
- F: Was passiert bei deaktivierter Rekursion? | A: Server beantwortet nur eigene Zonen, auch Weiterleitungen funktionieren nicht.
- F: Cmdlet für bedingte Weiterleitung? | A: Add-DnsServerConditionalForwarderZone
- F: Womit wird Split-Brain per DNS-Richtlinie umgesetzt? | A: Zonenbereich (Zone Scope) + Clientsubnetz + Query Resolution Policy.
- F: Wie konfiguriert man DNS-Richtlinien? | A: Nur mit PowerShell.
- F: Azure-interne DNS-IP? | A: 168.63.129.16 (nur aus Azure erreichbar).
- F: Wie lösen on-prem-Server Azure Private DNS auf? | A: Bedingte Weiterleitung auf Inbound-Endpunkt des Azure DNS Private Resolver.
- F: Bedingte Weiterleitung auf allen DNS-DCs der Domäne verfügbar machen? | A: In AD speichern (-ReplicationScope Domain).

## Quiz
? Nach einer Fusion sollen Namen von partner.local aufgelöst werden; deren DNS-Server-IPs ändern sich häufig. Beste Lösung?
* Stubzone für partner.local
- Bedingte Weiterleitung für partner.local
- Delegierung an partner.local
- Allgemeine Weiterleitung

? Interne Clients sollen für www.example.com eine interne IP, externe eine öffentliche erhalten, mit einem DNS-Server. Lösung?
* DNS-Richtlinie mit Zonenbereich (Split-Brain)
- Stubzone
- Zweite Weiterleitung
- Rekursion deaktivieren

? Ein DNS-Server in der DMZ soll nur eigene Zonen beantworten. Einstellung?
* Rekursion deaktivieren
- Stammhinweise löschen und Weiterleitungen setzen
- Sichere dynamische Updates
- Scavenging aktivieren

? On-prem-Server sollen eine Azure Private DNS Zone auflösen. Was ist nötig?
* Bedingte Weiterleitung auf den Inbound-Endpunkt eines Azure DNS Private Resolver
- Bedingte Weiterleitung direkt auf 168.63.129.16
- Stubzone auf 168.63.129.16
- Delegierung der Private Zone

? Alle DNS-DCs der Domäne sollen dieselbe bedingte Weiterleitung nutzen. Wie?
* Beim Erstellen in Active Directory speichern
- Auf jedem Server einzeln anlegen ist der einzige Weg
- Als Sekundärzone anlegen
- Per DHCP-Option 006 verteilen

? Was ist ein Stammhinweis (Root Hint)?
* Liste der Root-Server, die ohne Weiterleitung für die iterative Auflösung genutzt wird
- Ein Alias für den lokalen DNS-Server
- Eine Zone mit SOA-Eintrag
- Ein DHCP-Optionswert
! Wird verwendet, wenn keine Weiterleitung konfiguriert oder erreichbar ist.

? Was unterscheidet eine Stubzone von einer bedingten Weiterleitung?
* Die Stubzone aktualisiert die NS-Einträge der Zielzone automatisch, die bedingte Weiterleitung nutzt fest eingetragene IPs.
- Es gibt keinen Unterschied.
- Die bedingte Weiterleitung enthält alle Einträge der Zone.
- Die Stubzone verschlüsselt Anfragen.
! Stubzonen eignen sich bei sich ändernden Nameserver-Adressen.

? Mit welchem Cmdlet legt man eine bedingte Weiterleitung an?
* Add-DnsServerConditionalForwarderZone
- Add-DnsServerForwarder
- Add-DnsServerStubZone
- Set-DnsClientServerAddress
! Mit -ReplicationScope wird sie im AD repliziert.
