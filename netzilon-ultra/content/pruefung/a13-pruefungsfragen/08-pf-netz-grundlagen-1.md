---
id: pf-netz-grundlagen-1
bereich: Prüfung
block: A13
kapitel: Prüfungsfragen Netzwerk (IPv4/IPv6, Routing, DNS, DHCP)
titel: Netzwerk – Grundlagen (IPv4, IPv6, Routing, DNS, DHCP) – Teil 1/2
stufe: Fortgeschritten
typ: fragen
quellen: [Windows Server 2022 – Netzwerk, 30 Prüfungsfragen]
verweise: [ap1-a4-ipv4, ap1-a4-ipv6, ap1-a4-routing, ap1-a5-dns, ap1-a5-dhcp]
---

## Quiz

? Netzwerk Frage 1: Wie viele nutzbare Hostadressen bietet ein IPv4-Subnetz mit der Präfixlänge /26?
- 30
* 62
- 64
- 126
! 2^6 = 64 Adressen, abzüglich Netz- und Broadcastadresse = 62 Hosts.

? Netzwerk Frage 2: Welche der folgenden IPv4-Adressen liegt in einem privaten Adressbereich (RFC 1918)?
- 172.32.1.1
* 172.20.5.4
- 192.169.1.1
- 11.0.0.1
! Privat sind 10.0.0.0/8, 172.16.0.0/12 (172.16–172.31) und 192.168.0.0/16.

? Netzwerk Frage 3: Welcher Adressbereich wird bei einem Windows-Client verwendet, wenn kein DHCP-Server erreichbar ist (APIPA)?
- 127.0.0.0/8
- 224.0.0.0/4
* 169.254.0.0/16
- 192.0.2.0/24
! APIPA vergibt Adressen aus 169.254.0.0/16 (Link-Local).

? Netzwerk Frage 4: Welche Subnetzmaske entspricht der Präfixlänge /27?
- 255.255.255.192
* 255.255.255.224
- 255.255.255.240
- 255.255.255.248
! /27 = 27 Netzbits, letztes Oktett 11100000 = 224.

? Netzwerk Frage 5: Wie lautet die Broadcastadresse des Hosts 192.168.10.70/26?
- 192.168.10.71
- 192.168.10.95
* 192.168.10.127
- 192.168.10.255
! Das Netz ist 192.168.10.64/26 (64–127); die Broadcastadresse ist .127.

? Netzwerk Frage 6: Welche Aufgabe hat das Standardgateway eines Clients?
- Namen in IP-Adressen auflösen
- IP-Adressen vergeben
- Datenverkehr verschlüsseln
* Pakete in andere Netze weiterleiten, wenn das Ziel nicht im lokalen Subnetz liegt
! Für Ziele außerhalb des eigenen Subnetzes wird das Paket an das Standardgateway (Router) gesendet.

? Netzwerk Frage 7: Wie lang ist eine IPv6-Adresse?
* 128 Bit
- 64 Bit
- 32 Bit
- 256 Bit
! IPv6-Adressen haben 128 Bit (IPv4: 32 Bit).

? Netzwerk Frage 8: Welches Präfix kennzeichnet IPv6-Link-Local-Adressen?
- fc00::/7
- 2000::/3
* fe80::/10
- ff00::/8
! fe80::/10 ist Link-Local; fc00::/7 sind Unique-Local, 2000::/3 globale Unicast, ff00::/8 Multicast.

? Netzwerk Frage 9: Wie lautet die korrekte Kurzschreibweise von 2001:0db8:0000:0000:0000:0000:0000:0001?
- 2001:db8:1
* 2001:db8::1
- 2001::db8::1
- 2001:db8:0:1
! Führende Nullen entfallen, eine Folge von Nullgruppen wird einmal durch :: ersetzt.

? Netzwerk Frage 10: Welche Adresse ist die IPv6-Loopback-Adresse?
- ::
- fe80::1
* ::1
- ff02::1
! ::1 ist Loopback (entspricht 127.0.0.1); :: ist die unspezifizierte Adresse.

? Netzwerk Frage 11: Welches Konzept ersetzt in IPv6 den Broadcast?
* Multicast
- Unicast-Flooding
- ARP-Broadcast
- NetBIOS
! IPv6 kennt keinen Broadcast; stattdessen werden Multicast-Adressen (z. B. ff02::1) genutzt.

? Netzwerk Frage 12: Welches Protokoll ersetzt in IPv6 das ARP von IPv4?
- DHCPv6
* Neighbor Discovery Protocol (NDP, ICMPv6)
- RIPng
- ICMPv4
! NDP übernimmt Adressauflösung, Router-Erkennung und mehr.

? Netzwerk Frage 13: Wie zeigen Sie unter Windows Server 2022 per PowerShell die Routingtabelle an?
* Get-NetRoute (oder route print)
- Get-DnsClientCache
- Get-NetAdapter
- Get-DhcpServerv4Scope
! Get-NetRoute und route print zeigen die IPv4/IPv6-Routen an.

? Netzwerk Frage 14: Mit welcher Serverrolle lässt sich Windows Server 2022 als Router (LAN-Routing) betreiben?
- DHCP-Server
* Remotezugriff mit Rollendienst Routing
- Hyper-V
- WSUS
! Die Rolle Remotezugriff enthält den Rollendienst Routing.

? Netzwerk Frage 15: Welcher Befehl legt dauerhaft eine statische Route zum Netz 10.2.0.0/16 über das Gateway 10.1.0.1 an?
* route add 10.2.0.0 mask 255.255.0.0 10.1.0.1 -p
- ip route add 10.2.0.0/16 via 10.1.0.1
- add-route 10.2.0.0 10.1.0.1
- netsh route add 10.2.0.0 10.1.0.1
! route add ... -p (oder New-NetRoute) legt die Route dauerhaft an; ip route ist ein Linux-Befehl.
