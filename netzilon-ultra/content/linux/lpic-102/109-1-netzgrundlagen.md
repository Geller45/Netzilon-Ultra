---
id: linux-102-109-1-netzgrundlagen
bereich: Linux
fach: Linux II
pruefungen: [LPIC-1]
block: LPIC-102
kapitel: LPIC-1 Prüfung 102 – Netzwerkgrundlagen
titel: 109.1 Grundlagen von Internetprotokollen
stufe: Fortgeschritten
quellen: [LPI-Learning-Material-102-500-de.pdf]
verweise: [linux-l2-15-netzwerke, linux-102-109-2-netzkonfig]
---

## Profi

### Lernziel (Gewicht 4)
IP-Adressierung (IPv4/IPv6), Subnetze, TCP/UDP/ICMP, wichtige Ports und `/etc/services`.

### IPv4
- 32 Bit, dezimal in vier Oktetten (`192.168.10.5`). **Subnetzmaske** bzw. **CIDR**-Präfix (`/24` = 255.255.255.0) trennt Netz- und Hostanteil. Hosts je Netz = 2^(32-Präfix) - 2.
- Private Bereiche (RFC 1918): `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`. Loopback `127.0.0.0/8`, Link-Local (APIPA) `169.254.0.0/16`. NAT übersetzt private in öffentliche Adressen.
- **Gateway** (Standard-Router) für Ziele außerhalb des eigenen Netzes.

### IPv6
- 128 Bit, hexadezimal in acht Gruppen (`2001:db8::1`), Kürzung von Nullen (`::` nur einmal). Loopback `::1`, Link-Local `fe80::/10`, Unique Local `fc00::/7`, Global Unicast `2000::/3`. Präfix meist /64. Kein Broadcast, stattdessen Multicast (`ff02::1`). Autokonfiguration via SLAAC/NDP.

### Transport- und Netzprotokolle
- **TCP** (verbindungsorientiert, 3-Wege-Handshake SYN/SYN-ACK/ACK, zuverlässig), **UDP** (verbindungslos, schnell), **ICMP** (Fehler-/Diagnosemeldungen, `ping`, `traceroute`).
- Ports 0–1023 sind „well known“: 20/21 FTP, 22 SSH, 23 Telnet, 25 SMTP, 53 DNS, 67/68 DHCP, 80 HTTP, 110 POP3, 123 NTP, 143 IMAP, 161 SNMP, 443 HTTPS, 514 Syslog, 631 IPP, 993 IMAPS, 3306 MySQL.
- `/etc/services` ordnet Namen und Ports zu; `/etc/protocols` die IP-Protokollnummern (ICMP 1, TCP 6, UDP 17).

## Einfach

Ein Netzwerk funktioniert wie die **Post**. Jeder Computer hat eine **IP-Adresse** wie eine Hausanschrift: `192.168.10.5`. Die **Subnetzmaske** sagt, welcher Teil der Adresse die „Straße“ (das Netz) ist und welcher die „Hausnummer“ (der Rechner). Bei `/24` sind die ersten drei Zahlen die Straße.

Willst du jemanden in der gleichen Straße erreichen, gehst du direkt hin. Liegt das Ziel woanders, gibst du den Brief dem **Gateway**, also dem Postamt der Straße. Adressen, die mit 192.168 beginnen, sind **privat**: Sie gelten nur zu Hause und nie im Internet.

IPv4 hat nur etwa 4 Milliarden Adressen, das reicht nicht mehr. Deshalb gibt es **IPv6** mit unvorstellbar vielen. Sie sehen länger aus: `2001:db8::1`.

Wie „sprechen“ Programme miteinander? Über **Ports**, das sind die Türnummern am Haus. Webseiten sind Tür 80/443, SSH ist Tür 22, E-Mail-Versand Tür 25. **TCP** ist wie ein Einschreiben mit Empfangsbestätigung, **UDP** wie eine Postkarte: schnell, aber ohne Garantie. **ICMP** nutzt der Befehl `ping`, um zu fragen: „Bist du da?“

## Merksatz
- **/24 = 255.255.255.0 = 254 Hosts.**
- **Privat: 10/8, 172.16/12, 192.168/16.**
- **22 SSH, 25 SMTP, 53 DNS, 80 HTTP, 443 HTTPS.**
- **TCP = Einschreiben, UDP = Postkarte.**

## Prüfungsfalle
- Hosts = 2^n - 2 (Netz- und Broadcastadresse abziehen).
- `172.16.0.0/12` reicht bis 172.31.255.255; 172.32.x.x ist öffentlich.
- IPv6 kennt **keinen Broadcast**; `::` darf nur einmal vorkommen.
- DNS nutzt UDP **und** TCP (Port 53).

## Grafik

### TCP-Handshake
1. Client -> Server: SYN
2. Server -> Client: SYN-ACK
3. Client -> Server: ACK
4. Client: Verbindung steht, Daten fließen

## Lab
**Maschine**: debian01.
```bash
ip -4 a
ip -6 a
grep -E '^(ssh|domain|http|https)\s' /etc/services
ss -tuln
ping -c 3 192.168.10.1
```

## Befehle
- `ip a` – Adressen anzeigen
- `ss -tuln` – lauschende Ports
- `getent services ssh` – Port aus /etc/services
- `ping` / `ping6` – ICMP-Test

## Übungen
- A: Wie viele Hosts hat 10.1.2.0/26? | L: 2^6 - 2 = 62
- A: Welcher Port gehört zu HTTPS? | L: 443
- A: Wie lautet die IPv6-Loopback-Adresse? | L: ::1

## Karteikarten
- F: Wie viele Bit hat eine IPv4-Adresse? | A: 32
- F: Wie viele Bit hat eine IPv6-Adresse? | A: 128
- F: Was ist /24 als Subnetzmaske? | A: 255.255.255.0
- F: Welche Netze sind privat (RFC 1918)? | A: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16
- F: Welcher Port gehört zu SSH? | A: 22/TCP
- F: Welcher Port gehört zu DNS? | A: 53 (UDP und TCP)
- F: Was ist der Unterschied TCP/UDP? | A: TCP verbindungsorientiert und zuverlässig, UDP verbindungslos.
- F: Wofür ist ICMP? | A: Diagnose- und Fehlermeldungen (ping, traceroute).
- F: Welche Adresse hat Link-Local in IPv6? | A: fe80::/10
- F: Welche Datei ordnet Portnummern Namen zu? | A: /etc/services

## Quiz
? Wie viele nutzbare Hosts hat ein /24-Netz?
* 254
- 256
- 255
- 253

? Welcher Bereich ist privat?
* 172.20.5.1
- 172.40.0.1
- 11.0.0.1
- 193.168.1.1

? Welcher Port wird für SSH genutzt?
* 22
- 23
- 21
- 25

? Welches Protokoll nutzt der Befehl ping?
* ICMP
- TCP
- UDP
- ARP

? Was ist die IPv6-Loopback-Adresse?
* ::1
- ::
- fe80::1
- 127::1

? Welche Aussage zu IPv6 ist richtig?
* Es gibt keinen Broadcast, stattdessen Multicast
- Adressen haben 64 Bit
- Es gibt keine Link-Local-Adressen
- :: darf beliebig oft vorkommen

? Welche Datei zeigt Protokollnummern wie TCP=6?
* /etc/protocols
- /etc/services
- /etc/hosts
- /etc/networks

? Wie beginnt der TCP-Verbindungsaufbau?
* SYN
- ACK
- FIN
- RST

## Lücken
- Ein /24-Netz hat die Maske {255.255.255.0}.
- DNS nutzt Port {53}.
- {TCP} ist verbindungsorientiert, {UDP} nicht.

## Spickzettel
- Hosts = 2^n - 2
- Privat: 10/8, 172.16/12, 192.168/16
- 22 SSH · 25 SMTP · 53 DNS · 80/443 Web · 110 POP3 · 143 IMAP
- TCP 6, UDP 17, ICMP 1
- IPv6 ::1, fe80::/10, kein Broadcast
