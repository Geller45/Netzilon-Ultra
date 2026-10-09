---
id: linux-l2-15-netzwerke
bereich: Linux
fach: Linux II
pruefungen: [LPIC-1, Schule]
block: L2
kapitel: Linux II – Administration
titel: 1.15 Netzwerke – Grundlagen, IP, Konfiguration, Diagnose, DNS
stufe: Fortgeschritten
quellen: [1.15_Linux_-_Netzwerke.pdf, LPI-Learning-Material-102-500-de.pdf]
verweise: [linux-102-109-1-netzgrundlagen, linux-102-109-2-netzkonfig, linux-102-109-3-netzprobleme, linux-102-109-4-dns, linux-l2-18-sicherheit]
---

## Profi

### Einordnung
**109.1 (4), 109.2 (4), 109.3 (4), 109.4 (2)** – zusammen 14 Punkte, das schwerste Cluster der Prüfung 102 und für FiSis das wichtigste Praxisthema. Szenario: Netzplan für Etage 2 (192.168.1.0/24 in vier Subnetze), Server srv-web01, srv-db04.

### Modelle
- **OSI** (7): Physical, Data Link, Network, Transport, Session, Presentation, Application. **TCP/IP** (4): Netzzugang, Internet, Transport, Anwendung. Kapselung: Daten → Segment → Paket → Frame → Bits.
- **MAC** = 48-Bit-Hardware-Adresse (Layer 2), **Switch** leitet Frames per MAC-Tabelle. **ARP** löst IP → MAC im LAN auf (`ip neigh`). **Router** verbindet Netze, **Default-Gateway** = Router für alles außerhalb des eigenen Netzes. **NAT**: SNAT/Masquerading (ausgehend), DNAT/Port-Forwarding (eingehend).

### IPv4, Subnetting, IPv6
- IPv4: 32 Bit, vier Oktette. **Private Bereiche (RFC 1918)**: `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`; Loopback `127.0.0.0/8`; APIPA `169.254.0.0/16`.
- Subnetting: je geliehenem Bit verdoppelt sich die Netzzahl und halbiert sich die Hostzahl; Hosts = 2^n − 2. Beispiel: /24 in 4 Netze → **/26** (255.255.255.192, 62 Hosts je Netz).
- **IPv6**: 128 Bit, hexadezimal, `::` darf einmal Nullblöcke kürzen; Link-Local `fe80::/10`; Loopback `::1`; typisch /64-Subnetze; kein ARP (→ NDP), kein Broadcast.

### Protokolle und Ports
| Dienst | Port | Dienst | Port |
|---|---|---|---|
| FTP | 20/21 | SSH | 22 |
| Telnet | 23 | SMTP | 25 |
| DNS | 53 (UDP/TCP) | DHCP | 67/68 UDP |
| HTTP | 80 | POP3 / IMAP | 110 / 143 |
| NTP | 123 UDP | HTTPS | 443 |
- TCP = verbindungsorientiert (Drei-Wege-Handshake), UDP = verbindungslos, **ICMP** für ping/Fehlermeldungen. `/etc/services` ordnet Namen und Ports zu.

### Konfiguration (109.2)
- Hostname: `hostnamectl set-hostname`, `/etc/hostname`, `/etc/hosts` (lokale Namensauflösung).
- **NetworkManager**: `nmcli device`, `nmcli connection show|add|modify|up`, `nmtui`. Debian klassisch `/etc/network/interfaces`, Netplan unter Ubuntu (`/etc/netplan/*.yaml`), Red Hat früher `ifcfg-*`.
- Temporär per `ip` (nicht persistent!): `ip addr add 192.168.1.10/24 dev eth0`, `ip link set eth0 up`, `ip route add default via 192.168.1.1`. **DHCP** vergibt IP, Gateway, DNS.
- Weiterleitung für Router: `net.ipv4.ip_forward=1` (`sysctl`).

### Diagnose (109.3)
- `ip a`, `ip link`, `ip route`, `ip neigh`, `ping`/`ping6`, **`ss -tulpn`** (Ersatz für `netstat`), `traceroute`/`tracepath`, `ifconfig`/`route`/`netstat` = **Legacy** (net-tools).
- Fehler **von unten nach oben** eingrenzen: Link → IP → Gateway → DNS → Dienst.

### DNS-Client (109.4)
- `/etc/resolv.conf` (`nameserver`, `search`), `/etc/nsswitch.conf` (`hosts: files dns` = Reihenfolge), `/etc/hosts`. Tools: `dig`, `host`, `nslookup`, `getent hosts`. systemd-resolved: `resolvectl`.
- Weiteres (Praxis): `tcpdump`, `nmap`, Firewall (nftables/ufw/firewalld).

## Einfach

Ein Netzwerk ist wie eine **Stadt mit Straßen und Postboten**. Jeder Rechner hat zwei Adressen: die **MAC-Adresse** ist wie die Seriennummer deines Fahrrads, fest eingebaut, und die **IP-Adresse** ist wie deine Hausanschrift, die man ändern kann.

Innerhalb deiner Straße (dem **LAN**) fragt dein Computer laut: „Wer hat die Hausnummer 192.168.1.1?“ Das ist **ARP**. Der Nachbar antwortet mit seiner Seriennummer. Willst du aber in eine andere Stadt, gibst du den Brief dem **Router** – dem Postamt am Ortsausgang. Seine Adresse heißt **Standard-Gateway**.

Eine **Netzmaske** sagt, wo die Straße aufhört und die Hausnummer anfängt. Teilst du eine große Straße in vier kleine, brauchst du zwei Bits mehr – aus /24 wird /26. Weil die vielen Heimadressen (192.168…) im Internet nicht gültig sind, übersetzt der Router sie mit **NAT** auf eine gemeinsame Adresse – wie ein Pförtner, der alle Briefe unter der Firmenadresse versendet.

Weil Menschen sich keine Zahlen merken, gibt es **DNS**: das Telefonbuch des Internets. Du sagst „www.beispiel.de“, und DNS verrät die IP.

Wenn etwas nicht geht, prüfst du **von unten nach oben**: Ist das Kabel drin? Habe ich eine Adresse? Erreiche ich das Gateway (`ping`)? Klappt der Name (`dig`)? Läuft der Dienst (`ss`)? Mit `ip a` siehst du deine Adresse, mit `ip route` den Weg zum Postamt.

## Merksatz
- **Fehlersuche von unten nach oben: Kabel – IP – Gateway – DNS – Dienst.**
- **MAC = Seriennummer, IP = Anschrift, ARP = „wer hat diese IP?“**
- **ip statt ifconfig, ss statt netstat.**
- **Hosts = 2^n − 2.**
- **`ip`-Änderungen sind flüchtig, Konfigurationsdateien/nmcli sind dauerhaft.**
- **nsswitch.conf bestimmt: erst files (hosts), dann dns.**

## Prüfungsfalle
- `ifconfig`, `route`, `netstat` sind **Legacy** (net-tools); aktuell sind `ip` und `ss`.
- Änderungen mit `ip addr add` gehen beim **Neustart verloren**.
- `/etc/hosts` wird laut Standard-nsswitch **vor** DNS ausgewertet.
- DNS nutzt **UDP und TCP** Port 53; DHCP: Server 67, Client 68.
- Private Bereiche: 172.16.0.0/**12** (172.16–172.31), nicht /16.
- `::` darf in IPv6 nur **einmal** vorkommen.
- /26 hat **62** nutzbare Hosts, nicht 64.
- `ping` nutzt ICMP – eine Firewall kann es blockieren, der Dienst läuft trotzdem.

## Grafik

### Paket ins Internet
1. Client: will 8.8.8.8 erreichen (außerhalb des eigenen Netzes)
2. Client -> Router: ARP – Wer hat 192.168.1.1 (Gateway)?
3. Router -> Client: ARP-Antwort mit MAC-Adresse
4. Client -> Router: IP-Paket an 8.8.8.8 im Frame zur Router-MAC
5. Router: NAT – ersetzt private durch öffentliche Quelladresse
6. Router -> Internet: Paket wird weitergeleitet

### Namensauflösung
1. Client: ping www.beispiel.de
2. Client -> hosts-Datei: Eintrag vorhanden? (nsswitch: files)
3. Client -> DNS-Server: Anfrage A-Record
4. DNS-Server -> Client: Antwort mit IP-Adresse
5. Client: baut Verbindung zur IP auf

## Lab
**Maschinen**: srv-web01 (Debian 12, 192.168.1.10/24, Gateway 192.168.1.1).
```bash
# auf srv-web01 – Ist-Zustand
ip a; ip route; ip neigh
hostnamectl
cat /etc/resolv.conf /etc/nsswitch.conf | grep -E "nameserver|hosts"

# auf srv-web01 – temporär konfigurieren (nicht persistent)
sudo ip addr add 192.168.1.20/24 dev eth0
sudo ip route add default via 192.168.1.1

# auf srv-web01 – dauerhaft mit NetworkManager
nmcli connection show
sudo nmcli connection modify "Wired connection 1" ipv4.addresses 192.168.1.10/24 ipv4.gateway 192.168.1.1 ipv4.dns 1.1.1.1 ipv4.method manual
sudo nmcli connection up "Wired connection 1"

# auf srv-web01 – Diagnose von unten nach oben
ip link show eth0; ping -c 3 192.168.1.1; ping -c 3 8.8.8.8
dig www.example.com +short; getent hosts www.example.com
ss -tulpn; traceroute 8.8.8.8
```

## Befehle
- `ip a` – Adressen anzeigen
- `ip route` – Routing-Tabelle
- `ip neigh` – ARP-Cache
- `ip link set eth0 up` – Schnittstelle aktivieren
- `ping -c 3 host` – Erreichbarkeit per ICMP
- `ss -tulpn` – lauschende Ports mit Prozess
- `traceroute host` – Weg der Pakete
- `nmcli connection show` – NetworkManager-Verbindungen
- `hostnamectl set-hostname name` – Hostname setzen
- `dig name` – DNS-Abfrage
- `getent hosts name` – Auflösung nach nsswitch
- `sysctl -w net.ipv4.ip_forward=1` – Routing aktivieren

## Übungen
- A: Teile 192.168.1.0/24 in vier gleiche Subnetze. | L: /26 (255.255.255.192): .0, .64, .128, .192, je 62 Hosts.
- A: Wie viele Hosts hat ein /27? | L: 2^5 − 2 = 30.
- A: Welcher Befehl ersetzt netstat? | L: ss
- A: Wie setzt du die Default-Route temporär? | L: ip route add default via 192.168.1.1
- A: Wo steht die Reihenfolge der Namensauflösung? | L: /etc/nsswitch.conf (Zeile hosts:)
- A: Welche Ports nutzt DHCP? | L: UDP 67 (Server), 68 (Client).
- A: Nenne die RFC-1918-Bereiche. | L: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16.

## Karteikarten
- F: Wofür steht ARP? | A: Address Resolution Protocol – löst IPv4-Adresse in MAC-Adresse auf.
- F: Welcher Befehl zeigt die Routing-Tabelle? | A: ip route
- F: Welche Datei listet die DNS-Server? | A: /etc/resolv.conf
- F: Was ist der Default-Gateway? | A: Der Router für alle Ziele außerhalb des eigenen Netzes.
- F: Welche Länge hat eine IPv6-Adresse? | A: 128 Bit.
- F: Welches Präfix haben IPv6-Link-Local-Adressen? | A: fe80::/10
- F: Was ist der Nachfolger von netstat? | A: ss
- F: Welches Tool fragt DNS-Server ab? | A: dig (auch host, nslookup).
- F: Welcher Port gehört zu SSH? | A: TCP 22.
- F: Was macht SNAT/Masquerading? | A: Ersetzt private Quelladressen ausgehender Pakete durch eine öffentliche.
- F: Wie viele nutzbare Hosts hat ein /24? | A: 254.

## Quiz
? Welcher Befehl zeigt die IP-Adressen aller Schnittstellen (modern)?
* ip a
- ifconfig -a
- netstat -r
- arp -a

? Welche Datei bestimmt die Reihenfolge hosts/dns?
* /etc/nsswitch.conf
- /etc/hosts
- /etc/resolv.conf
- /etc/services

? Wie viele nutzbare Hosts hat ein /26?
* 62
- 64
- 30
- 126

? Welcher Bereich ist privat nach RFC 1918?
* 172.16.0.0/12
- 172.0.0.0/8
- 169.254.0.0/16
- 100.0.0.0/8

? Welches Tool ersetzt netstat zur Anzeige lauschender Ports?
* ss
- ipcalc
- arping
- route

? Auf welchem Port arbeitet DNS?
* 53
- 25
- 67
- 110

? Was passiert mit einer per ip addr add gesetzten Adresse nach dem Neustart?
* Sie geht verloren
- Sie bleibt dauerhaft
- Sie wird per DHCP bestätigt
- Sie wird in /etc/hosts gespeichert

? Welcher Befehl zeigt den ARP-Cache?
* ip neigh
- ip route
- ip link
- ip maddr

? Wie viele Mal darf :: in einer IPv6-Adresse stehen?
* Einmal
- Zweimal
- Beliebig oft
- Gar nicht

? Welche Fehlersuche-Reihenfolge ist sinnvoll?
* Link, IP, Gateway, DNS, Dienst
- DNS, Dienst, Link, IP
- Dienst, DNS, Gateway, Link
- Gateway, Link, Dienst, IP

## Lücken
- Der Befehl {ss} zeigt lauschende Sockets und ersetzt {netstat}.
- Mit {ARP} wird im LAN eine IP-Adresse in eine MAC-Adresse aufgelöst.
- Ein /26-Netz bietet {62} nutzbare Hosts.

## Spickzettel
- OSI 7 · TCP/IP 4 · Kapselung Segment-Paket-Frame
- RFC 1918: 10/8 · 172.16/12 · 192.168/16
- Hosts = 2^n − 2 · /26 = 62
- ip a / route / neigh · ss -tulpn · traceroute
- nmcli (persistent) vs ip (flüchtig)
- /etc/hosts · resolv.conf · nsswitch.conf
- Ports: 22 SSH · 25 SMTP · 53 DNS · 80/443 · 67/68 DHCP
- Legacy: ifconfig, route, netstat
