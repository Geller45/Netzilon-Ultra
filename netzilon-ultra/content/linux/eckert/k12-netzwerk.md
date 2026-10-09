---
id: linux-eckert-k12-netzwerkkonfiguration
bereich: Linux
fach: Linux I
pruefungen: [LPIC-1, Schule]
block: CompTIA Linux+ / LPIC-1 (Eckert)
kapitel: Eckert – CompTIA Linux+ and LPIC-1 (6th Edition)
titel: Kap. 12 Netzwerkkonfiguration
stufe: Fortgeschritten
quellen: [Eckert_J._W._and_triOS_College_-_CompTIA_Linux_and_LPIC-1_6th_Edition_-_2024.pdf]
verweise: [linux-102-109-1-netzgrundlagen,linux-102-109-2-netzkonfig,linux-102-109-3-netzprobleme]
---

## Profi

### Grundlagen
Netzwerk = verbundene Computer; **Protokoll** = Regelwerk (TCP/IP). **IPv4** (32 Bit, Klassen A/B/C historisch, **ANDing** von Adresse und Maske ergibt die Netzwerkadresse, CIDR), **IPv6** (128 Bit). Konfiguration **manuell**, per **DHCP/BOOTP** oder **autokonfiguriert** (**APIPA** 169.254/16 bei IPv4; bei IPv6 link-local und Router-Advertisement/SLAAC via ICMPv6).

### Schnittstellenkonfiguration
- Befehle: `ip addr/link/route`, `ifconfig`/`route` (Legacy), `nmcli`, `nmtui`, `nm-connection-editor`, `networkctl`. Konfigurationsdateien: Fedora/RHEL `/etc/NetworkManager/system-connections/`, Ubuntu Server `/etc/netplan/*.yaml` (`netplan apply`), Debian `/etc/network/interfaces`, SUSE `wicked`.
- **Bonding/Aggregation** (mehrere NICs als eine, Ausfallsicherheit/Durchsatz), **Bridging** (Verbindung von Netzsegmenten, z. B. VMs), VLANs.

### Namensauflösung
**Hostname** (kurz) vs. **FQDN** (`srv01.example.com`), hierarchischer **Domain Name Space**. Auflösung: `/etc/hosts` → DNS (`/etc/resolv.conf`; Reihenfolge `/etc/nsswitch.conf`). Tools `nslookup`, `host`, `dig`, `hostnamectl`.

### Routing
Router leiten IP-Pakete zwischen Netzen weiter; jedes System hat eine **Routingtabelle** (`ip route`, `route -n`, `netstat -r`); **Default-Gateway**. Statische Route: `ip route add 10.2.0.0/16 via 10.0.0.254`. Weiterleitung aktivieren: `net.ipv4.ip_forward=1`.

### Dienste und Ports
Dienste lauschen auf **Ports** (`/etc/services`), gestartet durch eigenständigen Daemon, auf Anforderung durch **inetd/xinetd** (Super-Daemon) oder per systemd-**Socket-Unit**. Testen: `ss -tulpn`, `netstat`, `nc`.

### Fernadministration
`telnet` (unverschlüsselt, Legacy), **`ssh`** (`ssh -X` für grafische Programme), `scp`, `sftp`, **VNC** für ganze grafische Sitzungen. Diagnose: `ping`, `traceroute`/`tracepath`, `mtr`, `tcpdump`, `nmap`, `ethtool`, ICMP.

## Einfach

Ein **Netzwerk** verbindet Computer, damit sie Daten austauschen. Die gemeinsame Sprache heißt **TCP/IP**. Jeder Rechner braucht eine **IP-Adresse**. Du kannst sie per Hand eintragen, vom **DHCP-Server** zuteilen lassen oder, wenn niemand antwortet, vergibt sich der Rechner selbst eine Notadresse (**APIPA**, 169.254.x.x).

Weil Zahlen schwer zu merken sind, hat jeder Computer zusätzlich einen **Namen**. Der vollständige Name mit Domäne heißt **FQDN**, z. B. `srv01.example.com`. Ein **DNS-Server** übersetzt Namen in Adressen. Vorher schaut der Rechner in seine kleine private Liste `/etc/hosts`.

Willst du ein Paket in ein anderes Netz schicken, braucht der Rechner einen **Router**, der es weiterreicht. Welchen Weg welches Paket nimmt, steht in der **Routingtabelle**. Der Standardweg heißt **Default-Gateway**.

Programme, die Dienste anbieten, warten an **Ports**. Manche laufen dauerhaft, andere startet ein Aufpasser erst bei Bedarf (xinetd oder systemd-Socket).

Aus der Ferne steuerst du einen Rechner mit **SSH** (verschlüsselt, sicher). **Telnet** machte das früher, ist aber unverschlüsselt und gilt als veraltet. Mit `ssh -X` zeigt sich ein Programm sogar grafisch auf deinem Bildschirm.

Wenn das Netz hakt: erst `ip a`, dann `ping`, dann `traceroute`, dann DNS prüfen.

## Merksatz
- **IP + Maske + Gateway + DNS.**
- **hosts → DNS.**
- **APIPA 169.254.x.x = kein DHCP.**
- **ssh statt telnet.**

## Prüfungsfalle
- Netplan ist Ubuntu-Server, NetworkManager-Dateien sind Fedora; `/etc/network/interfaces` ist Debian.
- IPv6-Autokonfiguration nutzt **ICMPv6**, nicht ARP.
- `telnet` und `rsh` sind unverschlüsselt.
- Ping-Erfolg beweist nicht, dass ein TCP-Dienst läuft.

## Grafik

### Routing-Entscheidung
1. Client -> Routingtabelle: Ziel 8.8.8.8, im eigenen Netz?
2. Routingtabelle -> Client: Nein, Default-Gateway nutzen
3. Client -> Router: Paket an Gateway 192.168.1.1
4. Router -> Internet: Paket weiterleiten

## Lab
**Maschine**: debian01.
```bash
ip a; ip r
sudo nmcli con show
ping -c 3 192.168.1.1
dig www.example.com +short
ss -tulpn
ssh -X philipp@debian02 xeyes
```

## Befehle
- `ip route add 10.2.0.0/16 via 10.0.0.254` – statische Route
- `nmcli con mod …` – NetworkManager
- `netplan apply` – Ubuntu
- `dig name` – DNS
- `ss -tulpn` – Ports
- `ssh -X host` – X11-Weiterleitung

## Übungen
- A: Wie heißt IPv4-Autokonfiguration ohne DHCP? | L: APIPA (169.254.0.0/16).
- A: Wie lautet die Netzwerkadresse von 192.168.10.77/26? | L: 192.168.10.64
- A: Wo steht die Netplan-Konfiguration? | L: /etc/netplan/

## Karteikarten
- F: Was ist ein FQDN? | A: Vollständiger Domänenname, z. B. host.example.com.
- F: Was bedeutet APIPA? | A: Automatic Private IP Addressing (169.254/16).
- F: Was macht ANDing? | A: Verknüpft IP und Maske bitweise zur Netzadresse.
- F: Was ist Bonding? | A: Bündelung mehrerer NICs zu einer logischen Schnittstelle.
- F: Was ist Bridging? | A: Verbindung von Netzsegmenten auf Schicht 2.
- F: Wofür steht ICMPv6? | A: IPv6-Kontroll-/Autokonfigurationsprotokoll.
- F: Wo liegt DNS-Konfiguration? | A: /etc/resolv.conf
- F: Was ist xinetd? | A: Super-Daemon, der Dienste bei Bedarf startet.
- F: Welche Konfig nutzt Ubuntu Server? | A: Netplan (YAML).
- F: Wie zeigt man die Routingtabelle? | A: ip route

## Quiz
? Welche Adresse vergibt APIPA?
* 169.254.x.x
- 10.0.0.x
- 127.0.0.1
- 192.0.2.x

? Welche Konfiguration nutzt Ubuntu Server?
* Netplan
- ifcfg-Dateien
- wicked
- NetworkManager-Keyfiles only

? Was ist ein FQDN?
* Vollständiger Hostname inklusive Domäne
- Kurzname
- IP-Adresse
- MAC-Adresse

? Was wird beim ANDing berechnet?
* Netzwerkadresse
- Broadcast
- Hostadresse
- Gateway

? Welcher Befehl zeigt Routen?
* ip route
- ip addr
- ip link
- ip neigh

? Was ist sicherer als Telnet?
* SSH
- RSH
- TFTP
- FTP

? Welche Technik bündelt mehrere NICs?
* Bonding
- Bridging
- VLAN
- NAT

? Welcher Dienst startet andere Dienste bei Bedarf?
* xinetd
- crond
- rsyslogd
- cupsd

## Spickzettel
- DHCP · APIPA · SLAAC/ICMPv6
- hosts → DNS · FQDN
- Netplan · NM · interfaces
- ip route · default via
- ssh -X · telnet = Legacy
