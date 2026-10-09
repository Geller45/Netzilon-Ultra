---
id: ccna-ipv4-adressierung
bereich: CCNA
block: CCNA 1.6–1.7, 1.10
kapitel: Network Fundamentals
titel: IPv4 – Header, Adressklassen, private Adressen, Konfiguration und Client-Prüfung
stufe: Einsteiger
fach: TCP/IP – CCNA – Basic
pruefungen: [CCNA, AP1]
quellen: [CCNA_200-301_Notes_-_Jeremys_IT_Lab.pdf, 200-301.pdf, Netzwerkgrundlagen_Basic.pdf, Unterschied_zwischen_IPv4_und_IPv6.pdf, Routig. Verschiedene Netzwerke..md]
verweise: [ap1-a4-ipv4, ccna-subnetting, ccna-nat, ccna-cli-grundlagen, ap1-a3-zahlensysteme]
---

## Profi

### Aufbau einer IPv4-Adresse
32 Bit, in vier **Oktetten** dezimal mit Punkten (**dotted decimal**): `192.168.1.10` = `11000000.10101000.00000001.00001010`. Die **Subnetzmaske** (bzw. **Präfixlänge** in CIDR-Schreibweise `/24`) trennt **Netzanteil** (1-Bits) und **Hostanteil** (0-Bits).
- **Netzadresse**: alle Hostbits 0 (nicht vergebbar).
- **Broadcastadresse**: alle Hostbits 1 (nicht vergebbar).
- **Nutzbare Hosts**: **2ⁿ − 2** (n = Hostbits). Erste Hostadresse = Netz + 1, letzte = Broadcast − 1.

### Adressklassen (historisch, „classful“)
| Klasse | erstes Oktett | führende Bits | Standardmaske | Netze | Hosts je Netz |
|---|---|---|---|---|---|
| A | 1–126 | 0 | /8 255.0.0.0 | 126 | 16.777.214 |
| B | 128–191 | 10 | /16 255.255.0.0 | 16.384 | 65.534 |
| C | 192–223 | 110 | /24 255.255.255.0 | 2.097.152 | 254 |
| D | 224–239 | 1110 | – | Multicast | – |
| E | 240–255 | 1111 | – | reserviert/experimentell | – |
**127.0.0.0/8** = Loopback (Klasse A-Bereich, aber nicht nutzbar). Heute gilt **CIDR** (classless) – die Klasse spielt nur noch für Begriffe und klassische Routingprotokolle (RIPv1) eine Rolle.

### Besondere Adressen
| Bereich | Zweck |
|---|---|
| **10.0.0.0/8**, **172.16.0.0/12** (172.16.0.0–172.31.255.255), **192.168.0.0/16** | **private Adressen (RFC 1918)** |
| 127.0.0.0/8 | Loopback (127.0.0.1) |
| 169.254.0.0/16 | **APIPA**/Link-Local (kein DHCP-Server erreichbar) |
| 0.0.0.0 | „diese Host“/unbekannt, Default-Route 0.0.0.0/0 |
| 255.255.255.255 | limitierter Broadcast |
| 100.64.0.0/10 | Carrier-Grade NAT (Provider) |
| 192.0.2.0/24, 198.51.100.0/24, 203.0.113.0/24 | Dokumentation (TEST-NET) |

### Warum private Adressen? (Blueprint 1.7)
- **IPv4-Knappheit**: 2³² ≈ 4,3 Mrd. Adressen; IANA vergibt an **RIRs** (RIPE NCC, ARIN, APNIC, LACNIC, AFRINIC); ARIN erschöpft 2015, LACNIC 2020, RIPE NCC 2019.
- Private Adressen dürfen **ohne Zuteilung** frei genutzt werden, müssen nicht weltweit eindeutig sein, werden **im Internet nicht geroutet** → Zugriff nach außen über **NAT/PAT**.
- Vorteil: **Flexibilität im Netzdesign** (200-301 Frage 3), Einsparung öffentlicher Adressen. Nachteil: Überschneidungen bei Firmenfusionen.

### IPv4-Header (20–60 Byte)
| Feld | Bit | Bedeutung |
|---|---|---|
| Version | 4 | 4 = IPv4 |
| IHL | 4 | Headerlänge in 4-Byte-Einheiten (5 = 20 Byte, 15 = 60 Byte) |
| DSCP + ECN | 6 + 2 | QoS-Markierung, Stauanzeige (früher ToS) |
| Total Length | 16 | Paketlänge inkl. Header (max. 65.535) |
| Identification | 16 | gleiche ID für alle Fragmente eines Pakets |
| Flags | 3 | Bit 0 reserviert, **DF** (Don't Fragment), **MF** (More Fragments) |
| Fragment Offset | 13 | Position des Fragments (in 8-Byte-Einheiten) |
| **TTL** | 8 | Router verringern um 1; bei 0 verworfen + ICMP Time Exceeded (Windows-Start 128, Linux 64, Cisco 255) |
| Protocol | 8 | **1 ICMP, 6 TCP, 17 UDP, 89 OSPF, 88 EIGRP, 50 ESP** |
| Header Checksum | 16 | nur für den Header, wird pro Hop neu berechnet |
| Quell-/Ziel-IP | je 32 | Adressen |
| Options | 0–320 | selten |

### Lokal oder entfernt? (AND-Verknüpfung)
Der Host verknüpft **eigene IP UND eigene Maske** sowie **Ziel-IP UND eigene Maske**. Gleiches Ergebnis → direkt zustellen (ARP auf Ziel); verschieden → an das **Standardgateway** (ARP auf Gateway). Der Host nutzt **seine eigene Maske** – die Maske des Zielnetzes kennt er nicht.

### IP auf Cisco-Geräten
```
R1(config)# interface g0/0
R1(config-if)# ip address 10.255.255.254 255.0.0.0
R1(config-if)# no shutdown
```
Switch (L2) bekommt eine **Management-IP auf einer SVI** und ein Gateway: `interface vlan 1`, `ip address …`, `no shutdown`, global `ip default-gateway 192.168.1.1`.

### IP-Parameter am Client prüfen (Blueprint 1.10)
| OS | Befehl | zeigt |
|---|---|---|
| **Windows** | `ipconfig`, `ipconfig /all` | IP, Maske, Gateway, DNS, MAC, DHCP-Lease |
| Windows | `ipconfig /release`, `/renew`, `/flushdns`, `/displaydns` | DHCP-Lease erneuern, DNS-Cache |
| Windows (PowerShell) | `Get-NetIPConfiguration`, `Get-NetIPAddress` | wie ipconfig |
| **macOS** | `ifconfig`, `networksetup -getinfo Wi-Fi`, `netstat -rn` | IP, Maske (hex), Gateway |
| **Linux** | `ip addr`, `ip route`, `ip link`, `resolvectl status`, `cat /etc/resolv.conf` | IP, Route/Gateway, MAC, DNS |
| alle | `ping`, `traceroute`/`tracert`, `nslookup` | Erreichbarkeit, Weg, DNS |

## Einfach

Eine IP-Adresse ist wie eine **Postadresse**: **Straße + Hausnummer**.
- Der **Netzanteil** ist die **Straße** („Musterstraße“).
- Der **Hostanteil** ist die **Hausnummer** („Nr. 10“).
Die **Subnetzmaske** sagt, wo die Straße aufhört und die Hausnummer anfängt. Bei `/24` sind die ersten drei Zahlen die Straße, die letzte die Hausnummer.

In jeder Straße sind zwei Nummern **reserviert**: die **0** (das Straßenschild – Netzadresse) und die **255** (der **Lautsprecher** für alle – Broadcast). Deshalb passen bei `/24` nur **254** Häuser hinein.

**Private Adressen** (192.168.x.x, 10.x.x.x, 172.16–31.x.x) sind wie **Zimmernummern im Hotel**: Jedes Hotel hat ein Zimmer 101 – das ist kein Problem, weil die Zimmernummer nur **innen** gilt. Will ein Gast einen Brief nach draußen schicken, schreibt die **Rezeption** (der Router mit NAT) die **Hoteladresse** als Absender drauf.

Will dein PC etwas schicken, rechnet er kurz: „**Wohnt der Empfänger in meiner Straße?**“ Wenn ja – direkt hinlaufen. Wenn nein – ab zum **Gateway** (Router), der kennt den Weg.

Mit `ipconfig` (Windows) oder `ip addr` (Linux) siehst du deine eigene Adresse – wie ein Blick auf dein **Klingelschild**.

## Merksatz
- **Hosts = 2ⁿ − 2.**
- **Privat: 10/8 – 172.16/12 – 192.168/16.**
- **169.254 = „DHCP hat mich vergessen“.**
- **Protokoll 1 ICMP, 6 TCP, 17 UDP, 89 OSPF.**
- **Eigene Maske für beide AND-Rechnungen.**

## Prüfungsfalle
- 172.16.0.0/**12** reicht bis **172.31.255.255** – 172.32.x.x ist öffentlich.
- 127.x.x.x ist **nicht** Klasse A nutzbar; 0 und 127 als erstes Oktett sind reserviert.
- Private Adressen werden **nicht** durch eine ACL internettauglich – sie brauchen **NAT** (200-301 Frage 22).
- Ein **L2-Switch** braucht `ip default-gateway`, nicht `ip route`, um aus fremden Netzen erreichbar zu sein.
- Jeremys Notes: „10.255.255.254/16 is the LAST USABLE ADDRESS“ – Tippfehler, beim Klasse-A-Beispiel ist es **/8**.
- Die Quelle `Unterschied_zwischen_IPv4_und_IPv6.pdf` nennt als IPv4-Beispiel 197.0.0.1 – eine gültige öffentliche Klasse-C-Adresse, keine Sonderadresse.

## Grafik
### AND-Entscheidung lokal/entfernt
1. Client1: IP 172.16.10.1 UND Maske 255.255.0.0 = 172.16.0.0
2. Client1: Ziel 10.10.0.10 UND 255.255.0.0 = 10.10.0.0
3. Client1: 172.16.0.0 ≠ 10.10.0.0 → anderes Netz
4. Client1 -> Router: Paket an Gateway 172.16.0.254

### Private Adresse ins Internet
1. PC1 -> R1: Quelle 192.168.1.10 → Ziel 203.0.113.80
2. R1: NAT ersetzt Quelle durch 198.51.100.2
3. R1 -> Internet: Paket mit öffentlicher Absenderadresse
4. Internet -> R1: Antwort an 198.51.100.2
5. R1 -> PC1: Rückübersetzung auf 192.168.1.10

## Lab
**Packet Tracer: R1 (ISR) G0/0 – SW1 (2960) – PC1 (Windows), PC2 (Linux-Server)**

### Cisco IOS
```
R1(config)# interface gigabitEthernet0/0
R1(config-if)# ip address 192.168.10.1 255.255.255.0
R1(config-if)# no shutdown
SW1(config)# interface vlan 1
SW1(config-if)# ip address 192.168.10.2 255.255.255.0
SW1(config-if)# no shutdown
SW1(config-if)# exit
SW1(config)# ip default-gateway 192.168.10.1
SW1# show ip interface brief
R1# show ip interface g0/0
```

### Clients
1. **PC1 (Windows 11)**: Einstellungen → Netzwerk und Internet → Ethernet → IP-Zuweisung bearbeiten → Manuell → IPv4: 192.168.10.10, Maske 255.255.255.0, Gateway 192.168.10.1, DNS 192.168.10.1.
2. **PC1**: `ipconfig /all` und `ping 192.168.10.1`.
3. **PC2 (Linux)**: `sudo ip addr add 192.168.10.20/24 dev eth0`, `sudo ip route add default via 192.168.10.1`, `ip addr`, `ip route`.

## Befehle
- `ip address 192.168.10.1 255.255.255.0` – IPv4-Adresse auf Interface setzen
- `ip default-gateway 192.168.10.1` – Gateway für L2-Switch-Management
- `show ip interface brief` – Übersicht IP/Status
- `ipconfig /all` – vollständige IP-Konfiguration (Windows)
- `Get-NetIPConfiguration` – IP-Konfiguration (PowerShell)
- `ip addr` / `ip route` – IP und Routen (Linux)
- `ifconfig` – IP-Konfiguration (macOS, älteres Linux)

## Übungen
- A: Wie viele Hosts hat ein /26-Netz? | L: 32 − 26 = 6 Hostbits → 2⁶ − 2 = 62.
- A: Netz-ID und Broadcast von 172.16.10.1/16? | L: Netz 172.16.0.0, Broadcast 172.16.255.255.
- A: Ist 172.33.4.1 privat? | L: Nein, privat ist nur 172.16.0.0–172.31.255.255.
- A: Ein Client hat 169.254.12.7. Ursache? | L: Kein DHCP-Server erreichbar – APIPA-Adresse.
- A: Welcher Wert steht im Protocol-Feld bei einem OSPF-Paket? | L: 89.
- A: Ein IPv4-Header hat IHL = 6. Wie groß ist er? | L: 6 · 4 = 24 Byte (20 + 4 Byte Optionen).

## Karteikarten
- F: Wie viele Bit hat eine IPv4-Adresse? | A: 32 Bit (4 Oktette).
- F: Formel für nutzbare Hosts? | A: 2ⁿ − 2 (n = Hostbits).
- F: Private IPv4-Bereiche nach RFC 1918? | A: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16.
- F: Wofür steht 169.254.0.0/16? | A: APIPA/Link-Local – Selbstvergabe ohne DHCP.
- F: Was macht das TTL-Feld? | A: Jeder Router verringert es um 1; bei 0 wird das Paket verworfen (Schleifenschutz).
- F: Welche Protokollnummern haben ICMP, TCP, UDP? | A: 1, 6, 17.
- F: Minimale und maximale Länge des IPv4-Headers? | A: 20 bzw. 60 Byte.
- F: Wofür steht das DF-Bit? | A: Don't Fragment – Paket darf nicht fragmentiert werden.
- F: Klasse-C-Bereich im ersten Oktett? | A: 192–223.
- F: Wie prüft man unter Linux IP und Gateway? | A: ip addr und ip route.
- F: Warum nutzt man private Adressen? | A: Flexibles Design ohne Zuteilung, Einsparung öffentlicher IPv4-Adressen, Zugang nach außen per NAT.

## Quiz
? Warum würde ein Administrator RFC-1918-Adressen einsetzen?
* Für Flexibilität im IP-Netzdesign
- Um die Zahl der Hosts zu begrenzen
- Um überlappende Adressen mit anderen Netzen zu erzeugen
- Um Verkehr im Internet zu routen
@ 200-301.pdf Question 3

? Welches Merkmal haben private IPv4-Adressen?
* Sie werden ohne Zuteilung durch eine regionale Registry genutzt
- Sie verkleinern die Routingtabellen im Internet
- Sie gelangen mit einer ausgehenden ACL ins Internet
- Sie ermöglichen sichere Verbindungen über das Internet
@ 200-301.pdf Question 22

? Welche Adresse ist privat?
* 172.20.5.1
- 172.32.0.1
- 192.169.1.1
- 11.0.0.1

? Ein PC hat 169.254.33.8. Was ist die wahrscheinlichste Ursache?
* Der DHCP-Server ist nicht erreichbar
- Das Gateway ist falsch eingetragen
- Der DNS-Server antwortet nicht
- Die IP-Adresse ist doppelt vergeben

? Wie viele nutzbare Hosts hat ein /27?
* 30
- 32
- 62
- 14

? Welcher Wert im Protocol-Feld kennzeichnet UDP?
* 17
- 6
- 1
- 89

? Was passiert, wenn das TTL eines Pakets auf 0 fällt?
* Der Router verwirft es und sendet ICMP Time Exceeded
- Der Router setzt TTL auf 255 zurück
- Der Router fragmentiert das Paket
- Das Paket wird an das Default Gateway geschickt

? Welcher Befehl zeigt unter Windows MAC, DNS-Server und DHCP-Lease?
* ipconfig /all
- ipconfig /renew
- arp -d
- netstat -r

## Lücken
- Die Netzadresse hat alle {Hostbits} auf 0.
- Der Bereich {172.16.0.0/12} ist privat und reicht bis 172.31.255.255.
- Ein IHL-Wert von 5 bedeutet einen Header von {20} Byte.
- Ein L2-Switch erhält sein Gateway mit {ip default-gateway}.

## Szenario
### Client findet das Netz nicht
Ein Windows-11-PC hat die Adresse 192.168.10.50/24 und das Gateway 192.168.1.1. Der Router hat auf dem LAN-Interface 192.168.10.1/24. Webseiten im Internet sind nicht erreichbar, Drucker im eigenen Netz schon.
- F: Woran liegt das Problem? | A: Das Gateway 192.168.1.1 liegt nicht im eigenen Subnetz – der PC kann es nicht per ARP erreichen.
- F: Wie lautet die Korrektur? | A: Gateway auf 192.168.10.1 ändern.
- F: Mit welchem Befehl prüfst du die Einstellung? | A: ipconfig /all bzw. Get-NetIPConfiguration.

## Spickzettel
- IPv4 32 Bit, Hosts 2ⁿ−2, Netz = Hostbits 0, Broadcast = Hostbits 1
- Privat 10/8 · 172.16/12 · 192.168/16 · APIPA 169.254/16 · Loopback 127/8
- Klassen A 1–126 · B 128–191 · C 192–223 · D 224–239 · E 240–255
- Header 20–60 B, TTL −1, Protocol 1/6/17/89
- Win ipconfig /all · Linux ip addr / ip route · mac ifconfig
