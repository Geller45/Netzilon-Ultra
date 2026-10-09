---
id: erg-dns-dhcp-betrieb
bereich: AP1
block: ERG
kapitel: Ergänzungen 2.2
titel: DNS und DHCP im Betrieb – Abläufe, Einträge, Zusammenspiel und Fehlersuche
stufe: Fortgeschritten
fach: Windows Server / AZ-800
pruefungen: [AP1, AP2, Schule]
quellen: [RFC 1034/1035 (DNS), RFC 2131/2132 (DHCP), Microsoft Learn – DNS- und DHCP-Server unter Windows Server 2022/2025]
verweise: [ap1-a5-dns, ap1-a5-dns-zonen, ap1-a5-dhcp, az800-dns, az800-dhcp, az800-dhcp-failover, netz-dns-einfuehrung, netz-dhcp-uebung, ccna-dhcp-dns]
---

## Profi

### DHCP – Ablauf DORA
1. **Discover** – Client (0.0.0.0) sendet Broadcast an 255.255.255.255, UDP-Port 67 (Server) / 68 (Client).
2. **Offer** – Server bietet eine Adresse aus dem **Bereich (Scope)** an.
3. **Request** – Client fordert das Angebot an (Broadcast, damit andere Server ihr Angebot zurückziehen).
4. **Acknowledge** – Server bestätigt, **Lease** beginnt.
Verlängerung: nach **50 % der Leasedauer (T1)** per Unicast beim selben Server, nach **87,5 % (T2)** per Broadcast bei jedem Server. Wichtige **Optionen**: 003 Router (Gateway), 006 DNS-Server, 015 DNS-Domänenname, 042 NTP, 066/067 PXE-Boot. **Reservierungen** binden eine Adresse fest an eine MAC-Adresse (Drucker, Server). **Ausschlüsse** halten Bereiche für statische Adressen frei. Liegt der DHCP-Server in einem anderen Netz, leitet ein **DHCP-Relay-Agent** (`ip helper-address`) die Broadcasts als Unicast weiter. Unter Windows Server muss ein DHCP-Server in der Domäne im AD **autorisiert** werden. Hochverfügbarkeit: **DHCP-Failover** (Lastenausgleich oder Hot Standby) oder Split-Scope (80/20).

### DNS – Namensauflösung
**Rekursive Anfrage**: Der Client fragt seinen DNS-Server und erwartet eine fertige Antwort. **Iterative Anfragen**: Der DNS-Server fragt nacheinander **Root-Server** → **TLD-Server** (.de) → **autoritativen Server** der Zone und speichert die Antworten im **Cache** (Dauer = **TTL**). Interne Server leiten externe Anfragen häufig per **Weiterleitung (Forwarder)** an den Provider-DNS weiter; **bedingte Weiterleitungen** für Partnerdomänen.

Wichtige **Ressourceneinträge (Resource Records)**:
| Typ | Bedeutung |
|---|---|
| A / AAAA | Name → IPv4 / IPv6 |
| PTR | IP → Name (Reverse-Zone, in-addr.arpa / ip6.arpa) |
| CNAME | Alias → kanonischer Name |
| MX | Mailserver der Domäne mit Priorität |
| NS | zuständige Nameserver der Zone |
| SOA | Start of Authority – Seriennummer, Refresh, Zuständigkeit |
| SRV | Dienst-Standort (z. B. _ldap._tcp.dc._msdcs – Domänencontroller finden) |
| TXT | Freitext, z. B. SPF, DKIM, Domain-Verifizierung |

Zonentypen: **primär** (beschreibbar), **sekundär** (Kopie per Zonentransfer), **Stub** (nur NS/SOA/Glue), **AD-integriert** (Replikation über AD, sichere dynamische Updates).

### Zusammenspiel im Windows-Netz
Der DHCP-Server kann im Namen der Clients **dynamische DNS-Updates** durchführen (A- und PTR-Einträge). Clients registrieren sich sonst selbst (`ipconfig /registerdns`). Domänenmitglieder finden ihre DCs über **SRV-Einträge** – deshalb müssen Clients **nur** den internen DNS-Server eingetragen haben, nie direkt den Provider-DNS.

### Fehlersuche
- `ipconfig /all` – Adresse, Lease, DNS-Server; **169.254.x.x** = kein DHCP.
- `ipconfig /release` und `/renew` – Lease neu anfordern.
- `ipconfig /displaydns` / `/flushdns` – Client-Cache anzeigen/leeren; `Clear-DnsServerCache` auf dem Server.
- `nslookup name server`, `Resolve-DnsName -Type MX example.com`.
- DHCP-Server: Bereich erschöpft? Server nicht autorisiert? Relay fehlt? Fremder DHCP-Server (Rogue)?

## Einfach
**DHCP** ist wie der **Empfang in einem Hotel**. Ein neuer Gast (Computer) kommt und ruft laut in die Halle: „Ich brauche ein Zimmer!“ (**Discover**). Der Empfang antwortet: „Zimmer 23 ist frei!“ (**Offer**). Der Gast sagt: „Das nehme ich!“ (**Request**). Der Empfang gibt ihm den Schlüssel: „Gebucht für 8 Tage!“ (**Acknowledge**). Dazu bekommt der Gast einen Zettel mit wichtigen Infos: Wo ist der Ausgang (**Gateway**)? Wo ist die Auskunft (**DNS-Server**)? Bevor die Zeit abläuft, verlängert der Gast einfach seine Buchung.

**DNS** ist das **Telefonbuch des Internets**. Menschen merken sich Namen wie „www.example.com“, Computer brauchen Nummern (IP-Adressen). Fragt dein PC nach einem Namen, fragt sein DNS-Server notfalls die ganze Kette ab: erst den obersten Chef (**Root**), dann den Zuständigen für „.com“ und am Ende den, der genau „example.com“ kennt. Die Antwort merkt er sich eine Weile (**Cache**), damit es beim nächsten Mal schneller geht.

Im Telefonbuch gibt es verschiedene **Einträge**: Ein **A-Eintrag** sagt „Name → Nummer“, ein **MX-Eintrag** sagt „Hier ist der Briefkasten für E-Mails“, ein **CNAME** ist ein Spitzname, der auf den richtigen Namen zeigt.

In der Firma arbeiten beide zusammen: Der Hotel-Empfang (DHCP) trägt jeden neuen Gast sofort ins Telefonbuch (DNS) ein. So kann man jeden Computer mit Namen finden.

## Merksatz
- **DORA: Discover – Offer – Request – Acknowledge.**
- **DHCP: Server 67, Client 68 (UDP). DNS: 53.**
- **T1 = 50 %, T2 = 87,5 % der Lease.**
- **A = Name→IPv4, PTR = IP→Name, MX = Mail, SRV = Dienst.**
- **Domänen-Clients fragen nur den internen DNS.**

## Prüfungsfalle
- **DHCP-Broadcasts** werden nicht geroutet – ohne **Relay** bekommen andere Subnetze keine Adresse.
- **Reservierung ≠ Ausschluss**: Reservierung = feste Adresse für eine MAC, Ausschluss = Adressen gar nicht vergeben.
- **CNAME** darf nicht auf der Zonenwurzel (example.com) neben SOA/NS stehen.
- Externer DNS-Server am Domänen-Client → Anmeldung/GPO schlagen fehl (SRV-Einträge fehlen).
- Nach einer DNS-Änderung sieht der Client die alte IP, bis die **TTL** im Cache abläuft – `ipconfig /flushdns`.

## Grafik
### DHCP-DORA
1. Client -> Alle: DHCPDISCOVER (Broadcast, UDP 68 → 67)
2. DHCP-Server -> Client: DHCPOFFER 192.168.1.50
3. Client -> Alle: DHCPREQUEST für 192.168.1.50
4. DHCP-Server -> Client: DHCPACK mit Lease, Gateway, DNS
5. DHCP-Server -> DNS-Server: Dynamisches Update A und PTR

### Rekursive und iterative DNS-Auflösung
1. Client -> DNS-Server: Wie lautet die IP von www.example.com?
2. DNS-Server -> Root-Server: Anfrage
3. Root-Server -> DNS-Server: Verweis auf .com-Server
4. DNS-Server -> TLD-Server: Anfrage
5. TLD-Server -> DNS-Server: Verweis auf ns1.example.com
6. DNS-Server -> Autoritativer Server: Anfrage
7. Autoritativer Server -> DNS-Server: A-Eintrag mit TTL
8. DNS-Server -> Client: Antwort, Eintrag im Cache

## Lab
**Maschinen**: Domänencontroller **DC01** (Windows Server 2025, DNS) und DHCP-Server **SRV01** (Windows Server 2025), Client **CL01** im Heimlabor **example.com**.

### GUI
1. **SRV01**: Server-Manager → Rollen und Features → DHCP-Server installieren → Assistent „DHCP-Konfiguration abschließen“ (Autorisierung im AD).
2. **SRV01**: DHCP-Konsole → IPv4 → Neuer Bereich 192.168.1.100–192.168.1.200 /24, Router 192.168.1.1, DNS 192.168.1.10, Domäne example.com.
3. **SRV01**: Bereich → Reservierungen → Drucker **PRN01** mit MAC-Adresse und 192.168.1.20.
4. **DC01**: DNS-Manager → Forward-Lookupzone example.com → Neuer Host (A) **intranet** → 192.168.1.30, „Zugehörigen PTR-Eintrag erstellen“ aktivieren; Neuer Alias (CNAME) **www** → intranet.example.com.
5. **CL01**: `ipconfig /renew`, danach `nslookup www.example.com`.

### PowerShell
```powershell
# SRV01
Install-WindowsFeature DHCP -IncludeManagementTools
Add-DhcpServerInDC -DnsName srv01.example.com -IPAddress 192.168.1.11
Add-DhcpServerv4Scope -Name 'LAN' -StartRange 192.168.1.100 -EndRange 192.168.1.200 -SubnetMask 255.255.255.0
Set-DhcpServerv4OptionValue -ScopeId 192.168.1.0 -Router 192.168.1.1 -DnsServer 192.168.1.10 -DnsDomain example.com
Add-DhcpServerv4Reservation -ScopeId 192.168.1.0 -IPAddress 192.168.1.20 -ClientId '00-11-22-33-44-55' -Name 'PRN01'

# DC01
Add-DnsServerResourceRecordA -ZoneName example.com -Name intranet -IPv4Address 192.168.1.30 -CreatePtr
Add-DnsServerResourceRecordCName -ZoneName example.com -Name www -HostNameAlias intranet.example.com

# CL01
ipconfig /renew
Resolve-DnsName www.example.com
```

## Legende
### Lease
- Was: Zeitlich begrenzte Zuteilung einer IP-Adresse durch DHCP.
- Wie: Beginnt mit DHCPACK; Verlängerung bei 50 % (T1, Unicast) und 87,5 % (T2, Broadcast).
- Wann: Bei jedem Client mit dynamischer Adresse.
- Wo: Auf dem DHCP-Server unter „Adressleases“, am Client in ipconfig /all.
- Warum: Nicht mehr genutzte Adressen fallen automatisch an den Pool zurück.

### TTL (DNS)
- Was: Lebensdauer eines DNS-Eintrags in Caches, in Sekunden.
- Wie: Wird vom autoritativen Server mitgeliefert und im Cache heruntergezählt.
- Wann: Bei jeder DNS-Antwort; wichtig vor geplanten IP-Umzügen.
- Wo: In jedem Resource Record und im SOA (Minimum/negative TTL).
- Warum: Gleichgewicht zwischen Entlastung (Cache) und Aktualität.

## Karteikarten
- F: Wofür steht DORA? | A: Discover, Offer, Request, Acknowledge – Ablauf der DHCP-Adressvergabe.
- F: Welche Ports nutzt DHCP? | A: UDP 67 (Server) und UDP 68 (Client).
- F: Wann versucht ein Client, seine Lease zu verlängern? | A: Bei 50 % der Leasedauer (T1) beim eigenen Server, bei 87,5 % (T2) bei jedem Server.
- F: Was macht ein DHCP-Relay-Agent? | A: Leitet DHCP-Broadcasts aus einem Subnetz als Unicast an einen DHCP-Server in einem anderen Netz weiter.
- F: Unterschied Reservierung und Ausschluss? | A: Reservierung: feste IP für eine bestimmte MAC. Ausschluss: Adressen werden gar nicht dynamisch vergeben.
- F: Was ist ein PTR-Eintrag? | A: Reverse-Eintrag: ordnet einer IP-Adresse einen Namen zu.
- F: Wozu dienen SRV-Einträge im AD? | A: Clients finden darüber Dienste wie Domänencontroller (LDAP, Kerberos).
- F: Unterschied rekursive und iterative Anfrage? | A: Rekursiv: Server liefert die fertige Antwort. Iterativ: Server liefert einen Verweis auf den nächsten zuständigen Server.
- F: Was bedeutet die TTL eines DNS-Eintrags? | A: Wie lange der Eintrag in Caches gespeichert werden darf.
- F: Warum muss ein DHCP-Server in der Domäne autorisiert werden? | A: Damit nur zugelassene Windows-DHCP-Server Adressen vergeben (Schutz vor nicht autorisierten Servern).

## Quiz
? In welcher Reihenfolge laufen die DHCP-Nachrichten ab?
* Discover, Offer, Request, Acknowledge
- Request, Offer, Discover, Acknowledge
- Offer, Discover, Acknowledge, Request
- Discover, Request, Offer, Acknowledge
! DORA.

? Welcher DNS-Eintrag gibt den Mailserver einer Domäne an?
* MX
- CNAME
- PTR
- SOA
! MX-Einträge enthalten zusätzlich eine Priorität.

? Ein Client in VLAN 20 erhält keine Adresse, der DHCP-Server steht in VLAN 10. Was fehlt wahrscheinlich?
* Ein DHCP-Relay-Agent (ip helper-address)
- Ein PTR-Eintrag
- Eine Weiterleitung im DNS
- Ein CNAME
! Broadcasts werden von Routern nicht weitergeleitet.

? Wann versucht ein Client erstmals, seine Lease beim selben Server zu verlängern?
* Nach 50 % der Leasedauer
- Nach 10 % der Leasedauer
- Erst nach Ablauf der Lease
- Nach 87,5 % der Leasedauer
! T1 = 50 % (Unicast), T2 = 87,5 % (Broadcast).

? Welcher Eintrag ordnet einer IP-Adresse einen Hostnamen zu?
* PTR
- A
- MX
- NS
! PTR-Einträge liegen in der Reverse-Lookupzone.

? Welche DNS-Server sollen Domänenmitglieder in ihrer IP-Konfiguration eingetragen haben?
* Nur die internen DNS-Server der Domäne
- Nur den DNS-Server des Providers
- Abwechselnd intern und extern
- Keinen, die Domäne findet sich selbst
! Nur interne Server kennen die SRV-Einträge der DCs.

? Ein Server wurde umgezogen, Clients erreichen noch die alte IP. Was hilft am Client?
* ipconfig /flushdns
- ipconfig /release
- gpupdate /force
- arp -d
! Der Client-Cache hält den alten Eintrag bis zum Ablauf der TTL.

? Welche Option übermittelt das Standardgateway per DHCP?
* 003 Router
- 006 DNS-Server
- 015 Domänenname
- 066 Bootserver
! 006 = DNS-Server, 015 = DNS-Domänenname.

? Welcher Zonentyp repliziert über Active Directory und erlaubt sichere dynamische Updates?
* AD-integrierte Zone
- Sekundäre Zone
- Stubzone
- Root-Hints-Zone
! Sekundäre Zonen sind schreibgeschützte Kopien per Zonentransfer.

## Lücken
- Der DHCP-Ablauf heißt kurz {DORA}.
- Der DHCP-Server lauscht auf UDP-Port {67}.
- Ein {PTR}-Eintrag ordnet einer IP-Adresse einen Namen zu.
- Die Verweildauer eines DNS-Eintrags im Cache bestimmt die {TTL|Time to Live}.
- Ein DHCP-{Relay|Relay-Agent} leitet Broadcasts in andere Subnetze weiter.

## Zuordnen
### DNS-Eintrag und Bedeutung
- A => Name zu IPv4-Adresse
- AAAA => Name zu IPv6-Adresse
- CNAME => Alias auf einen anderen Namen
- MX => Mailserver der Domäne
- SRV => Standort eines Dienstes, z. B. Domänencontroller

### DHCP-Option und Inhalt
- 003 => Router (Standardgateway)
- 006 => DNS-Server
- 015 => DNS-Domänenname
- 042 => NTP-Server

### Befehl und Zweck
- ipconfig /renew => DHCP-Lease neu anfordern
- ipconfig /flushdns => DNS-Cache des Clients leeren
- nslookup => DNS-Server gezielt abfragen
- ipconfig /registerdns => Eigene DNS-Einträge neu registrieren

## Reihenfolge
### DHCP-Server unter Windows Server einrichten
1. Rolle DHCP-Server installieren
2. Server im Active Directory autorisieren
3. Bereich mit Adressbereich und Maske anlegen
4. Ausschlüsse und Reservierungen festlegen
5. Optionen Router, DNS und Domäne setzen
6. Bereich aktivieren und mit Client testen

### Iterative DNS-Auflösung durch den Server
1. Cache prüfen
2. Root-Server fragen
3. TLD-Server fragen
4. Autoritativen Server der Zone fragen
5. Antwort cachen und an den Client liefern

### Client erhält keine IP-Adresse
1. ipconfig /all auf APIPA prüfen
2. Kabel/VLAN des Switchports prüfen
3. ipconfig /renew ausführen
4. DHCP-Bereich auf freie Adressen prüfen
5. Relay-Agent und Autorisierung des Servers prüfen

## Freitext
- F: Beschreiben Sie den DHCP-Ablauf DORA mit Angabe von Broadcast/Unicast. | M: Discover (Broadcast vom Client), Offer (Angebot vom Server), Request (Broadcast, damit andere Server ihr Angebot zurückziehen), Acknowledge (Bestätigung mit Lease und Optionen). | P: 4
- F: Erläutern Sie den Unterschied zwischen einer DHCP-Reservierung und einer statischen IP-Konfiguration am Gerät. | M: Reservierung: Gerät bleibt DHCP-Client, Server vergibt immer dieselbe Adresse per MAC – zentrale Verwaltung, Optionen werden mitgeliefert. Statisch: Konfiguration lokal am Gerät, Änderungen müssen dort erfolgen, Gefahr von Konflikten. | P: 4
- F: Begründen Sie, warum Domänen-Clients keinen externen DNS-Server eingetragen haben dürfen. | M: Externe Server kennen die interne Zone und die SRV-Einträge der DCs nicht; Anmeldung, Gruppenrichtlinien und Namensauflösung interner Ressourcen schlagen fehl. Externe Anfragen erledigt der interne DNS über Weiterleitungen. | P: 4

## Szenario
### Neuer Standort ohne DHCP
In einer Außenstelle (VLAN 40, 10.0.40.0/24) erhalten Clients 169.254-Adressen. Der zentrale DHCP-Server 10.0.1.5 hat bereits einen Bereich 10.0.40.0 angelegt.
- F: Was ist die wahrscheinlichste Ursache? | A: Auf dem Router/Layer-3-Switch der Außenstelle fehlt der DHCP-Relay (ip helper-address 10.0.1.5). | P: 2
- F: Wie erkennt der DHCP-Server, aus welchem Bereich er vergeben muss? | A: Am Feld giaddr (Gateway-Adresse des Relays) im weitergeleiteten Paket. | P: 2

### Intranet-Umzug
Das Intranet zieht von 192.168.1.30 auf 192.168.1.40 um. Nach der Änderung des A-Eintrags erreichen viele Benutzer stundenlang den alten Server.
- F: Warum? | A: Clients und DNS-Server haben den alten Eintrag bis zum Ablauf der TTL im Cache. | P: 2
- F: Wie hätten Sie den Umzug vorbereiten sollen? | A: TTL einige Tage vorher stark verkürzen, nach dem Umzug wieder erhöhen; ggf. Caches leeren (ipconfig /flushdns, Clear-DnsServerCache). | P: 3

### Anmeldung an der Domäne schlägt fehl
Ein Notebook hat statisch DNS 8.8.8.8 eingetragen. Die Anmeldung an example.com dauert ewig, GPOs werden nicht angewendet.
- F: Erklären Sie die Ursache. | A: Der öffentliche DNS kennt die SRV-Einträge der Domäne nicht – das Notebook findet keinen Domänencontroller. | P: 2
- F: Wie lösen Sie das Problem? | A: Internen DNS (DC) eintragen bzw. per DHCP verteilen, externe Auflösung über Weiterleitungen am internen DNS. | P: 2
