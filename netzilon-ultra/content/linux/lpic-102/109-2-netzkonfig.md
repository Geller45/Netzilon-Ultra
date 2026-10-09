---
id: linux-102-109-2-netzkonfig
bereich: Linux
fach: Linux II
pruefungen: [LPIC-1]
block: LPIC-102
kapitel: LPIC-1 Prüfung 102 – Netzwerkgrundlagen
titel: 109.2 Persistente Netzwerkkonfiguration
stufe: Fortgeschritten
quellen: [LPI-Learning-Material-102-500-de.pdf]
verweise: [linux-l2-15-netzwerke, linux-102-109-3-netzprobleme]
---

## Profi

### Lernziel (Gewicht 4)
Netzwerkschnittstellen sicht-, temporär und dauerhaft konfigurieren: `ip`, **NetworkManager** (`nmcli`), **systemd-networkd**, ifupdown/Netplan, Hostname, Routing.

### Schnittstellennamen
Vorhersagbare Namen (udev): `enp0s3` (PCI), `ens33`, `wlp2s0`, `eth0` (klassisch), `lo`. Wechsel zurück mit Kernelparameter `net.ifnames=0`.

### Temporär mit `ip` (iproute2)
- `ip addr show`, `ip addr add 192.168.10.5/24 dev enp0s3`, `ip link set enp0s3 up|down`, `ip route show`, `ip route add default via 192.168.10.1`, `ip neigh` (ARP). Änderungen verschwinden beim Neustart.
- Legacy: `ifconfig`, `route`, `netstat`, `arp` (net-tools) – durch `ip`/`ss` ersetzt.

### Persistent
- **Debian klassisch**: `/etc/network/interfaces` (`auto enp0s3`, `iface enp0s3 inet static`, `address`, `netmask`/`gateway`), `ifup`/`ifdown`.
- **Netplan** (Ubuntu): YAML in `/etc/netplan/*.yaml`, `netplan apply`.
- **RHEL/Fedora/Desktop**: **NetworkManager**: `nmcli con show`, `nmcli con mod "Wired" ipv4.addresses 192.168.10.5/24 ipv4.gateway 192.168.10.1 ipv4.dns 192.168.10.2 ipv4.method manual`, `nmcli con up`, `nmtui`. Frühere Dateien: `/etc/sysconfig/network-scripts/ifcfg-*`.
- **systemd-networkd**: `/etc/systemd/network/*.network` (`[Match]`, `[Network]`, `Address=`, `Gateway=`, `DHCP=yes`), `networkctl`.

### Hostname und Namensauflösung
`hostnamectl set-hostname srv01`, `/etc/hostname`, `/etc/hosts`. IP-Forwarding: `sysctl net.ipv4.ip_forward=1`; dauerhaft in `/etc/sysctl.conf` oder `/etc/sysctl.d/`.

## Einfach

Damit ein Linux-Rechner im Netzwerk mitspielen kann, braucht er vier Dinge: eine **IP-Adresse**, eine **Subnetzmaske**, ein **Gateway** (Ausgang ins große Netz) und einen **DNS-Server** (Telefonbuch für Namen).

Du kannst diese Werte auf zwei Arten setzen. Die **schnelle Art**: `ip addr add …`. Das gilt sofort, ist aber nach dem Neustart weg, wie ein Bleistiftstrich. Die **dauerhafte Art**: Du trägst die Werte in eine Konfigurationsdatei oder in den NetworkManager ein, wie Kugelschreiber.

Welches Werkzeug dafür zuständig ist, hängt von der Distribution ab. Debian alt: Datei `/etc/network/interfaces`. Ubuntu: Netplan. Fedora/RHEL und Desktops: **NetworkManager** mit `nmcli`. Die Idee ist immer dieselbe.

Mit `ip a` siehst du, was gerade gilt. `ip r` zeigt die Wege (Routen). Der Rechner hat außerdem einen Namen, den du mit `hostnamectl` änderst.

Wichtig: Alte Befehle wie `ifconfig` gibt es nur noch, wenn man sie extra installiert. Prüfungsfragen fragen aber trotzdem danach.

## Merksatz
- **ip = schnell/temporär, Datei/nmcli = dauerhaft.**
- **`ip a`, `ip r`, `ip link set up`.**
- **hostnamectl set-hostname.**
- **Forwarding: net.ipv4.ip_forward=1 (sysctl).**

## Prüfungsfalle
- `ip addr add` ohne Persistenz überlebt keinen Neustart.
- `nmcli con mod` ändert nur; erst `nmcli con up` wendet an.
- `ifconfig`/`route`/`netstat` sind **Legacy** (net-tools).
- Netplan: Einrückung mit Leerzeichen, keine Tabs.

## Grafik

### Netzwerk dauerhaft konfigurieren
1. Admin: IP-Daten festlegen (Adresse, Maske, Gateway, DNS)
2. Admin -> NetworkManager: nmcli con mod
3. NetworkManager: Profil speichern
4. Admin -> NetworkManager: nmcli con up
5. NetworkManager -> Schnittstelle: Werte anwenden, bleibt nach Reboot

## Lab
**Maschine**: debian01 / fedora01.
```bash
ip a
ip r
sudo ip addr add 192.168.10.50/24 dev enp0s3
sudo nmcli con show
sudo nmcli con mod "Wired connection 1" ipv4.method manual ipv4.addresses 192.168.10.50/24 ipv4.gateway 192.168.10.1 ipv4.dns 192.168.10.2
sudo nmcli con up "Wired connection 1"
sudo hostnamectl set-hostname srv01
```

## Befehle
- `ip addr show` – Adressen
- `ip route add default via IP` – Standardroute
- `nmcli con show` – NM-Profile
- `nmtui` – Textoberfläche
- `hostnamectl` – Hostname
- `sysctl -w net.ipv4.ip_forward=1` – Forwarding
- `netplan apply` – Ubuntu-Konfiguration anwenden

## Übungen
- A: Wie setzt du temporär eine Standardroute über 10.0.0.1? | L: `ip route add default via 10.0.0.1`
- A: Wie änderst du den Hostnamen dauerhaft? | L: `hostnamectl set-hostname name`
- A: Wo liegt Netplan-Konfiguration? | L: /etc/netplan/*.yaml

## Karteikarten
- F: Welcher Befehl zeigt IP-Adressen (modern)? | A: ip addr show (ip a)
- F: Was ersetzt ifconfig? | A: ip (iproute2)
- F: Was ersetzt netstat? | A: ss
- F: Welche Datei hält Debians klassische Netzwerkkonfiguration? | A: /etc/network/interfaces
- F: Welcher Befehl konfiguriert NetworkManager per CLI? | A: nmcli
- F: Wie schaltet man IPv4-Forwarding dauerhaft ein? | A: net.ipv4.ip_forward=1 in /etc/sysctl.conf oder sysctl.d.
- F: Was ist enp0s3? | A: Vorhersagbarer Schnittstellenname (Ethernet, PCI-Bus 0, Slot 3).
- F: Wo liegt der Hostname? | A: /etc/hostname
- F: Was zeigt ip route? | A: Die Routingtabelle.
- F: Wie wendet man Netplan an? | A: netplan apply

## Quiz
? Welcher Befehl setzt temporär eine IP auf eine Schnittstelle?
* ip addr add 192.168.1.5/24 dev eth0
- nmcli add ip
- hostname 192.168.1.5
- netplan set

? Wie sieht man die Routingtabelle?
* ip route
- ip link
- ip neigh
- ip addr

? Welche Datei enthält den Hostnamen?
* /etc/hostname
- /etc/hosts.deny
- /etc/resolv.conf
- /etc/hostid

? Welches Tool ist der moderne Ersatz für netstat?
* ss
- ifconfig
- route
- arp

? Was macht nmcli con up?
* Aktiviert das Verbindungsprofil
- Löscht das Profil
- Zeigt Profile
- Startet DHCP-Server

? Welche Einstellung aktiviert IPv4-Routing?
* net.ipv4.ip_forward=1
- net.ipv4.route=on
- ip.forward=yes
- net.ipv6.forward=0

? Wo konfiguriert man Netplan?
* /etc/netplan/
- /etc/network/
- /etc/sysconfig/
- /etc/NetworkManager/ only

? Wie ändert man den Hostnamen persistent?
* hostnamectl set-hostname
- hostname -t
- echo > /dev/hostname
- sysctl hostname

## Lücken
- Die Standardroute setzt man mit ip route add {default} via 10.0.0.1.
- Mit {nmcli} konfiguriert man den NetworkManager.
- Der moderne Ersatz für ifconfig ist {ip}.

## Spickzettel
- ip a · ip r · ip link set X up
- Dauerhaft: NetworkManager/nmcli, Netplan, /etc/network/interfaces
- hostnamectl, /etc/hosts
- sysctl net.ipv4.ip_forward=1
