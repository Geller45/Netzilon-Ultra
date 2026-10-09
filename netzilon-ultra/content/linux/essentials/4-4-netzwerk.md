---
id: linux-ess-rechner-im-netzwerk
bereich: Linux
fach: Linux I
pruefungen: [LPIC-1, Schule]
block: Linux Essentials
kapitel: Thema 4 – Das Linux-Betriebssystem
titel: 4.4 Der Rechner im Netzwerk
stufe: Einsteiger
quellen: [LPI-Learning-Material-010-160-de.pdf]
verweise: [linux-102-109-1-netzgrundlagen,linux-l2-15-netzwerke]
---

## Profi

### Lernziel (Gewicht 2)
Netzwerkgrundlagen, Konfiguration und Fehlersuche auf Einsteigerniveau.

### Grundlagen
- **LAN/WAN**, **Switch**, **Router**, **Access Point**, **Modem**. **IP-Adresse** (IPv4: 4 Oktette, IPv6: 128 Bit), **Subnetzmaske**, **Gateway**, **DNS**, **DHCP** (automatische Konfiguration). **MAC-Adresse** (Schicht 2, 48 Bit). Private Adressbereiche: 10/8, 172.16/12, 192.168/16; Loopback 127.0.0.1/::1.
- **Ports**: 22 SSH, 25 SMTP, 53 DNS, 80 HTTP, 443 HTTPS, 110 POP3, 143 IMAP. **TCP** vs. **UDP**. Browser (Client) ↔ Webserver (Server).

### Konfiguration anzeigen
- `ip addr` (Adressen), `ip route` (Routen, Standardgateway `default via …`), `ip link`, `cat /etc/resolv.conf` (DNS), `hostname`, `nmcli` (NetworkManager). Alt: `ifconfig`, `route`, `netstat`.

### Test und Fehlersuche
- `ping -c 4 ziel` (ICMP), `traceroute`/`tracepath`, `host`/`dig` (DNS), `ss -tuln` (offene Ports), `curl`/`wget` (HTTP), `ssh user@host`.
- Vorgehen: Link → IP → Gateway → Internet-IP (`8.8.8.8`) → Name → Dienst.

### Sicherheit
Firewall (`ufw`, `firewalld`, `nftables`), nur nötige Dienste, WLAN-Verschlüsselung WPA2/WPA3.

## Einfach

Ein Netzwerk verbindet Computer, damit sie miteinander reden können, wie ein Telefonnetz. Die Geräte dafür: Der **Switch** verbindet Geräte im selben Haus (LAN). Der **Router** verbindet dein Heimnetz mit dem Internet.

Jedes Gerät braucht eine **IP-Adresse**, wie eine Hausnummer, damit Pakete ankommen. Meist verteilt der Router die Adressen automatisch (**DHCP**). Außerdem braucht es das **Gateway**, also die Tür nach draußen, und einen **DNS-Server**, der Namen wie `www.example.com` in Zahlen übersetzt.

Auf Linux zeigst du das alles an mit `ip a` (Adressen) und `ip r` (Wege). Zum Testen nutzt du `ping`: Er schickt ein kleines Paket los und wartet auf die Antwort, wie „Hallo, bist du da?“. Funktioniert `ping 8.8.8.8`, aber nicht `ping www.example.com`, hast du ein Problem mit DNS.

Programme sprechen über **Ports** (Türnummern) miteinander: 80 und 443 für Webseiten, 22 für SSH. Mit `ss -tuln` siehst du, welche Türen dein Computer geöffnet hat.

Wichtig für die Sicherheit: Lass nur Türen offen, die du wirklich brauchst, und nutze eine Firewall.

## Merksatz
- **IP + Maske + Gateway + DNS.**
- **Ping erst ans Gateway, dann ins Internet, dann mit Namen.**
- **ip a / ip r / ss -tuln.**
- **80 HTTP, 443 HTTPS, 22 SSH.**

## Prüfungsfalle
- `ping` nutzt ICMP, hat also keinen Port.
- 127.0.0.1 ist der eigene Rechner, nicht das Gateway.
- DHCP vergibt Adresse, Gateway und DNS; DNS löst nur Namen auf.
- Private Adressen sind im Internet nicht routbar (NAT nötig).

## Grafik

### Weg ins Internet
1. Laptop -> Router: Paket an Ziel-IP (Gateway)
2. Router: NAT, private Adresse in öffentliche
3. Router -> Internet: Paket weiter
4. Internet -> Router: Antwort
5. Router -> Laptop: Antwort zugestellt

## Befehle
- `ip a` – Adressen
- `ip r` – Routen
- `ping -c 4 ziel` – Erreichbarkeit
- `dig name` – DNS testen
- `ss -tuln` – offene Ports
- `curl -I https://example.com` – HTTP-Kopf
- `traceroute ziel` – Weg anzeigen

## Übungen
- A: Wie findest du das Standardgateway? | L: `ip route` (Zeile default via …)
- A: Wie prüfst du, ob DNS funktioniert? | L: `dig www.example.com`
- A: Welche Ports sind lauschend? | L: `ss -tuln`

## Karteikarten
- F: Wofür steht DHCP? | A: Automatische Vergabe von IP-Konfiguration.
- F: Wofür steht DNS? | A: Namensauflösung Name → IP.
- F: Was ist ein Gateway? | A: Router-Adresse für Ziele außerhalb des eigenen Netzes.
- F: Was ist eine MAC-Adresse? | A: Hardwareadresse der Netzwerkkarte (48 Bit).
- F: Welcher Port gehört zu HTTPS? | A: 443
- F: Was ist 127.0.0.1? | A: Loopback (der eigene Rechner).
- F: Was zeigt ip route? | A: Die Routingtabelle.
- F: Was macht ping? | A: Sendet ICMP Echo, um Erreichbarkeit zu testen.
- F: Was macht ein Switch? | A: Verbindet Geräte im LAN.
- F: Was macht ein Router? | A: Verbindet Netze miteinander.

## Quiz
? Was löst Namen in IP-Adressen auf?
* DNS
- DHCP
- NAT
- ARP

? Was teilt IP-Adressen automatisch zu?
* DHCP
- DNS
- SSH
- ICMP

? Welcher Port ist HTTPS?
* 443
- 80
- 22
- 25

? Was ist 127.0.0.1?
* Loopback
- Gateway
- Broadcast
- DNS

? Welcher Befehl zeigt IP-Adressen modern?
* ip a
- ifup
- netcfg
- arp -a

? Ping auf IP klappt, auf Namen nicht – was ist defekt?
* DNS
- Kabel
- Switch
- MAC

? Welches Gerät verbindet das LAN mit dem Internet?
* Router
- Hub
- Repeater
- Bridge

? Welcher Befehl listet offene Ports?
* ss -tuln
- ping
- ip r
- host

## Spickzettel
- IP · Maske · Gateway · DNS · DHCP
- ip a · ip r · ping · dig · ss -tuln
- 22 80 443 53 25
- Privat: 10/8 172.16/12 192.168/16
