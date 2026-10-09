---
id: ccna-dhcp-dns
bereich: CCNA
block: CCNA 4.3 / 4.5
kapitel: IP Services
titel: DHCP und DNS auf Cisco – DORA, Relay, Pool, Lease, DNS-Auflösung
stufe: Fortgeschritten
fach: TCP/IP – CCNA – Basic
pruefungen: [CCNA, AP1, AP2]
quellen: [CCNA_200-301_Notes_-_Jeremys_IT_Lab.pdf, 13_DHCP.pdf, DHCP_WindowsServer2025.pdf, 200_301_CCNA_v1.0_2.pdf, 1-Folien-DNS-Einf_hrung.pdf]
verweise: [netz-dhcp-uebung, netz-dns-uebung, ccna-dhcp-snooping-dai, ccna-tcp-udp, ap1-a5-dhcp]
---

## Profi

### DHCP – DORA
**DHCP** (Dynamic Host Configuration Protocol, UDP **67** Server / **68** Client) vergibt IP-Adresse, Maske, Gateway, DNS-Server u. a. als **Lease**. Vier Schritte **DORA**:
1. **Discover** – Client-Broadcast (0.0.0.0 → 255.255.255.255, MAC FF:FF:FF:FF:FF:FF).
2. **Offer** – Server bietet Adresse an (Unicast/Broadcast).
3. **Request** – Client fordert die gewählte Adresse an (Broadcast – informiert auch andere Server).
4. **Acknowledge** – Server bestätigt, Lease beginnt. Bei ungültiger Anfrage: **DHCPNAK** (Client verwirft Konfiguration).
Weitere Nachrichten: **Release**, **Decline** (Adresskonflikt per ARP-Check), **Inform**.

### Lease-Erneuerung
**T1 = 50 %** der Lease: Client erneuert per Unicast beim bekannten Server (Request → ACK). **T2 = 87,5 %**: Erneuerung per Broadcast bei beliebigem Server (**Rebind**). Läuft die Lease ab, wird die Adresse verworfen, neuer DORA. Bei Windows-Neustart: Request zur alten Adresse. **APIPA** (169.254.0.0/16), wenn kein DHCP antwortet.

### Optionen und Bereiche
Option 3 Router, 6 DNS, 15 Domänenname, 51 Lease-Dauer, 66/150 TFTP (Telefone), 43 (WLC-Adresse). Windows: **Bereich (Scope)** versorgt ein Subnetz mit Netz-ID, Maske, Adressbereich, **Ausschlussbereich**, Lease, Router; **Reservierung** (MAC → feste IP); Optionen auf Server-/Bereichs-/Klassen-/Reservierungsebene (**nächstliegende zählt**). DHCP-Server muss in AD **autorisiert** sein (sonst Rogue Server). Failover/Split-Scope für Redundanz.

### Relay-Agent
Broadcasts überqueren keinen Router. Lösung: **DHCP-Relay** (`ip helper-address <DHCP-Server>` auf dem Client-seitigen Interface/SVI). Der Router wandelt den Broadcast in Unicast, trägt im Feld **giaddr** die Interface-IP ein, woran der Server den Scope wählt. `ip helper-address` leitet standardmäßig auch TFTP, DNS, NetBIOS, TACACS u. a.

### Cisco-Router als DHCP-Server
```
ip dhcp excluded-address 192.168.10.1 192.168.10.10
ip dhcp pool LAN10
 network 192.168.10.0 255.255.255.0
 default-router 192.168.10.1
 dns-server 8.8.8.8
 domain-name exa.local
 lease 1 0 0
```
Kontrolle: `show ip dhcp binding`, `show ip dhcp pool`, `show ip dhcp conflict`. Client-Interface: `ip address dhcp`.

### DNS
**DNS** (UDP/TCP **53**) löst Namen in IP-Adressen auf. Hierarchie: Root → TLD (.de) → Domäne → Host (FQDN, endet mit Punkt). Rekursive Anfrage (Client → Resolver), iterative (Resolver → Root/TLD/Auth). Records: **A** (IPv4), **AAAA** (IPv6), **CNAME** (Alias), **MX** (Mail), **NS** (Nameserver), **PTR** (Reverse), **SOA**, **SRV** (AD-Dienste). Cisco-Router: `ip name-server 8.8.8.8`, `ip domain-lookup`, `ip domain-name exa.local`. Test: `nslookup`, `dig`.

## Einfach

Wenn du in einem Hotel ankommst, hast du kein Zimmer. Du gehst zur Rezeption und rufst in die Halle: „Ich brauche ein Zimmer!“ (**Discover**). Der Rezeptionist antwortet: „Zimmer 12 ist frei, möchten Sie das?“ (**Offer**). Du sagst: „Ja, Zimmer 12 bitte!“ (**Request**). Er schreibt es in sein Buch: „Okay, Zimmer 12 gehört dir für 24 Stunden“ (**Acknowledge**). Das ist **DHCP**: Dein Computer bekommt automatisch seine Adresse, den Weg nach draußen (Gateway) und die Telefonbuch-Nummer (DNS-Server).

Der Zimmerschlüssel hat eine Laufzeit (Lease). Nach der halben Zeit gehst du hin und verlängerst. Wenn die Rezeption nicht da ist, versuchst du es nach 7/8 der Zeit bei jedem anderen Empfang. Wenn nirgends jemand antwortet, schläfst du mit einer Notadresse (169.254.x.x).

Weil die Halle (das Netz) nur ein Stockwerk umfasst, hören Rufe in andere Stockwerke nicht. Dann steht im Flur ein **Bote (Relay)**, der deinen Ruf in einem Umschlag zur Rezeption in einem anderen Stockwerk trägt.

**DNS** ist das **Telefonbuch des Internets**. Du tippst „www.beispiel.de“ – dein Computer fragt: „Welche Nummer hat der?“ Der DNS-Server antwortet: „93.184.216.34.“ Dafür muss der Rechner nicht jede Nummer auswendig kennen; er fragt weiter, bis jemand es weiß: erst die Auskunft für „.de“, dann die für „beispiel.de“.

## Merksatz
- **DORA: Discover – Offer – Request – Acknowledge.**
- **DHCP: UDP 67 (Server) / 68 (Client). DNS: 53.**
- **Lease: T1 50 % (Renew, Unicast), T2 87,5 % (Rebind, Broadcast).**
- **Relay = `ip helper-address` auf dem Client-Interface.**
- **A = IPv4, AAAA = IPv6, PTR = Rückwärts, MX = Mail.**

## Prüfungsfalle
- Die `ip helper-address` kommt auf das **Interface in Richtung Client**, nicht zum Server.
- DHCP-Discover und -Request sind **Broadcasts**; das Offer ist je nach Broadcast-Flag Unicast oder Broadcast.
- Im Schulskript (`13_DHCP.pdf`, Server 2008) steht, bei 87,5 % werde „wieder ein Discover“ gesendet – tatsächlich sendet der Client dann einen **Rebind-Request (Broadcast)**; erst nach Ablauf der Lease beginnt ein vollständiges DORA.
- `ip dhcp excluded-address` **vor** Pool-Anlage setzen, sonst werden Server-IPs vergeben.
- DNS nutzt UDP **und** TCP 53 (TCP bei Zonentransfer und großen Antworten).
- APIPA 169.254.0.0/16 bedeutet: kein DHCP erreicht.
- Auf Windows: A-Eintrag registriert der Client, PTR der DHCP-Server (Standard).

## Grafik
### DHCP-DORA
1. Client -> DHCP-Server: DHCPDISCOVER (Broadcast, UDP 68 -> 67)
2. DHCP-Server -> Client: DHCPOFFER (192.168.10.50)
3. Client -> DHCP-Server: DHCPREQUEST (Broadcast)
4. DHCP-Server -> Client: DHCPACK (Lease 24 h, Gateway, DNS)

### DHCP-Relay
1. Client -> Router: Discover (Broadcast)
2. Router: ip helper-address, giaddr = 192.168.10.1
3. Router -> DHCP-Server: Discover als Unicast
4. DHCP-Server -> Router: Offer für Scope 192.168.10.0/24
5. Router -> Client: Offer weitergeleitet

### DNS-Auflösung
1. Client -> Resolver: www.beispiel.de?
2. Resolver -> Root-Server: Wer kennt .de?
3. Root-Server -> Resolver: TLD-Server .de
4. Resolver -> Autoritativer Server: beispiel.de?
5. Autoritativer Server -> Resolver: A 93.184.216.34
6. Resolver -> Client: 93.184.216.34 (zwischengespeichert)

## Lab
**Packet Tracer: R1 als DHCP-Server für LAN 192.168.10.0/24; zweites LAN über Relay**

### Cisco IOS
```
R1(config)# ip dhcp excluded-address 192.168.10.1 192.168.10.10
R1(config)# ip dhcp pool LAN10
R1(dhcp-config)# network 192.168.10.0 255.255.255.0
R1(dhcp-config)# default-router 192.168.10.1
R1(dhcp-config)# dns-server 192.168.10.5
R1(dhcp-config)# end
R1# show ip dhcp binding
R2(config)# interface g0/0
R2(config-if)# ip helper-address 10.0.0.1
R1# show ip dhcp pool
```
1. PCs auf „DHCP“ stellen, Adresse und Gateway prüfen.
2. Lease-Dauer ansehen (`show ip dhcp binding`).
3. Windows-Befehle auf dem Client: `ipconfig /release`, `ipconfig /renew`, `ipconfig /all`, `ipconfig /flushdns`.
4. Windows Server (DC01) GUI: Server-Manager → Rollen → DHCP; PowerShell: `Add-DhcpServerv4Scope -Name LAN -StartRange 192.168.1.100 -EndRange 192.168.1.200 -SubnetMask 255.255.255.0`, `Add-DhcpServerInDC`.

## Befehle
- `ip dhcp pool NAME` – DHCP-Pool
- `ip dhcp excluded-address a b` – Adressen ausschließen
- `ip helper-address 10.0.0.1` – Relay
- `ip address dhcp` – Interface als DHCP-Client
- `show ip dhcp binding` – vergebene Leases
- `ip name-server 8.8.8.8` – DNS-Server des Routers
- `nslookup www.beispiel.de` – DNS-Test
- `ipconfig /renew` – Lease erneuern (Windows)

## Übungen
- A: Beschreiben Sie DORA mit Ports und Adressen. | L: Discover (0.0.0.0:68 → 255.255.255.255:67), Offer, Request (Broadcast), Ack. Ports UDP 68 (Client) / 67 (Server).
- A: Nach wie viel Prozent der Lease erneuert der Client, nach wie viel rebindet er? | L: 50 % (Renew) / 87,5 % (Rebind).
- A: Auf welchem Interface kommt die helper-address? | L: Auf dem Interface zum Client-Netz.
- A: Bereichseigenschaften eines Windows-DHCP-Scope nennen. | L: Netz-ID, Subnetzmaske, Adressbereich, Lease-Dauer, Router, Bereichsname, Ausschlussbereich.
- A: Welcher Record löst IPv6 auf? | L: AAAA.
- A: Client hat 169.254.17.3. Ursache? | L: Kein DHCP-Server erreichbar (APIPA).

## Karteikarten
- F: Was bedeutet DORA? | A: Discover, Offer, Request, Acknowledge.
- F: DHCP-Ports? | A: UDP 67 (Server), UDP 68 (Client).
- F: Was ist ein Lease? | A: Zeitlich begrenzte Adressvergabe.
- F: Wann erneuert der Client die Lease? | A: Nach 50 % (T1), Rebind bei 87,5 % (T2).
- F: Was ist DHCPNAK? | A: Ablehnung: Client muss Konfiguration verwerfen.
- F: Was macht ip helper-address? | A: Wandelt DHCP-Broadcasts in Unicast zum Server (Relay).
- F: Was ist APIPA? | A: 169.254.0.0/16 – Selbstvergabe ohne DHCP.
- F: DNS-Port? | A: 53 (UDP/TCP).
- F: A-, AAAA-, PTR-Record? | A: IPv4-Adresse, IPv6-Adresse, Rückwärtsauflösung.
- F: Was ist ein Rogue DHCP Server? | A: Nicht autorisierter DHCP-Server im Netz.
- F: Welche DNS-Records gehören zu Mail? | A: MX.

## Quiz
? In welcher Reihenfolge läuft DHCP?
* Discover, Offer, Request, Acknowledge
- Request, Offer, Discover, Acknowledge
- Offer, Discover, Acknowledge, Request
- Discover, Request, Offer, Acknowledge
? Welche UDP-Ports nutzt DHCP?
* 67 und 68
- 53 und 54
- 161 und 162
- 123 und 124
? Wann beginnt der Client die erste Lease-Erneuerung?
* Nach 50 % der Lease
- Nach 87,5 %
- Nach 100 %
- Nach 25 %
? Wo wird ip helper-address konfiguriert?
* Auf dem Interface zum Client-Netz
- Auf dem Interface zum Server
- Global im DHCP-Pool
- Auf dem Switch-Trunk
? Welche Adresse bekommt ein Client ohne DHCP-Antwort?
* 169.254.x.x
- 127.0.0.1
- 0.0.0.0
- 224.0.0.1
? Welcher DNS-Record ist ein Alias?
* CNAME
- MX
- PTR
- SOA
? Welcher Record dient der Rückwärtsauflösung?
* PTR
- NS
- AAAA
- SRV
? Was ist das Feld giaddr?
* Relay-Interface-Adresse im DHCP-Paket
- Die Gateway-MAC des Servers
- Die Lease-Dauer
- Die Client-ID
? Welcher Befehl erneuert die Lease unter Windows?
* ipconfig /renew
- ipconfig /flushdns
- ipconfig /registerdns
- ipconfig /displaydns
? Was passiert beim DHCPNAK?
* Client verwirft seine Konfiguration
- Lease wird verlängert
- Server startet neu
- Client wird Rogue Server
