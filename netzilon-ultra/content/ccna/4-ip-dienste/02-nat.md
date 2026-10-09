---
id: ccna-nat
bereich: CCNA
block: CCNA 4.1
kapitel: IP Services
titel: NAT und PAT – Static, Dynamic, Overload, Inside/Outside Local/Global
stufe: Fortgeschritten
fach: TCP/IP – CCNA – Basic
pruefungen: [CCNA, AP1, AP2]
quellen: [CCNA_200-301_Notes_-_Jeremys_IT_Lab.pdf, 200_301_CCNA_v1.0_2.pdf, 200-301.pdf]
verweise: [ccna-ipv4-adressierung, ccna-acl-extended, ccna-routing-grundlagen, ccna-tcp-udp]
---

## Profi

### Zweck
**NAT** (Network Address Translation, RFC 3022) übersetzt IP-Adressen an der Grenze zwischen **inside** (privat, RFC 1918: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16) und **outside** (öffentlich). Löst die **IPv4-Knappheit** (Adressen sparen), trennt interne Struktur und ist ein (schwacher) Schutz – Hosts sind nicht direkt von außen erreichbar. NAT bricht die Ende-zu-Ende-Transparenz (Probleme für IPsec-AH, SIP, aktive FTP). IPv6 braucht kein NAT.

### Begriffe (Adresstypen)
| Begriff | Bedeutung |
|---|---|
| **Inside Local** | Private Adresse des internen Hosts (192.168.1.10) |
| **Inside Global** | Öffentliche Adresse, hinter der der interne Host im Internet erscheint (203.0.113.5) |
| **Outside Global** | Öffentliche Adresse des externen Ziels |
| **Outside Local** | Adresse des externen Ziels, wie sie intern aussieht (meist gleich Outside Global) |
Merkregel: **Local = aus Sicht des Inside-Netzes, Global = aus Sicht des Internets.**

### Varianten
1. **Static NAT**: 1:1-Zuordnung (Server nach außen erreichbar). `ip nat inside source static 192.168.1.10 203.0.113.10`.
2. **Dynamic NAT**: Pool öffentlicher Adressen, 1:1 bei Bedarf (Pool kann leer werden).
3. **PAT / NAT Overload**: **viele interne Adressen → eine öffentliche**, unterschieden durch **Quellportnummern** (bis ~65.000 Sessions je IP). Heimrouter-Standard.

### Konfiguration PAT mit Interface-IP
```
interface g0/0
 ip address 192.168.1.1 255.255.255.0
 ip nat inside
interface g0/1
 ip address 203.0.113.2 255.255.255.252
 ip nat outside
access-list 1 permit 192.168.1.0 0.0.0.255
ip nat inside source list 1 interface g0/1 overload
ip route 0.0.0.0 0.0.0.0 203.0.113.1
```
Mit Pool: `ip nat pool PUB 203.0.113.8 203.0.113.15 netmask 255.255.255.248` und `ip nat inside source list 1 pool PUB [overload]`. Kontrolle: `show ip nat translations`, `show ip nat statistics`, `clear ip nat translation *`, `debug ip nat`.

### Ablauf
Paket vom Inside-Host → am **inside**-Interface angekommen → **Routing-Entscheidung** → NAT-Übersetzung der Quelladresse (bei Inside→Outside erst Routing, dann NAT; bei Outside→Inside erst NAT, dann Routing) → Ausgang am outside-Interface. Eintrag in der **NAT-Tabelle** erlaubt die Rückübersetzung. Standardmäßige Idle-Timeouts: TCP 24 h, UDP 5 min, DNS 1 min.

## Einfach

Stell dir ein großes Wohnhaus mit 200 Wohnungen vor, aber nur **einer Postadresse** an der Straße. Alle Bewohner dürfen Briefe verschicken. Der Hausmeister (der **Router**) klebt auf jeden ausgehenden Brief als Absender die Hausadresse – und merkt sich auf einem Zettel: „Brief Nr. 5001 kam von Wohnung 12, Brief Nr. 5002 von Wohnung 7.“ Kommt die Antwort an die Hausadresse mit der Nummer 5001, weiß er: „Das ist für Wohnung 12!“ und bringt es hin. Das ist **PAT** (oder NAT Overload).

Wenn ein Bewohner einen eigenen Laden im Erdgeschoss hat und die Kunden von draußen kommen sollen, bekommt er eine **feste Zuordnung**: „Alles an Hausnummer 10 geht in den Laden.“ Das ist **Static NAT**.

Die vier Namen merkst du dir so:
- **Inside Local** – wie Wohnung 12 intern heißt (192.168.1.10).
- **Inside Global** – wie die Außenwelt dieselbe Wohnung sieht (203.0.113.5, die Hausadresse).
- **Outside Global** – der Name des Empfängers im Internet.
- **Outside Local** – wie der Empfänger bei uns im Haus genannt wird (meist derselbe).

Privatadressen (192.168…, 10…, 172.16–31…) dürfen im Internet nicht auftauchen – dafür braucht man NAT. Im neuen Internet (IPv6) gibt es genug Adressen, da braucht man es nicht.

## Merksatz
- **Local = intern gesehen, Global = Internet gesehen.**
- **PAT/Overload = viele → eine IP, unterschieden durch Ports.**
- **`ip nat inside` / `ip nat outside` – beide Seiten markieren!**
- **ACL (permit) bestimmt, WER übersetzt wird.**
- **RFC 1918: 10/8, 172.16/12, 192.168/16.**

## Prüfungsfalle
- `ip nat inside source list 1 interface g0/1 overload` – ohne **overload** kein PAT!
- Die ACL im NAT-Befehl **permit** = „übersetzen“, nicht „durchlassen“; `deny` = nicht übersetzen.
- **Inside/Outside** vergessen → keine Übersetzung.
- Inside Global ≠ Outside Global: Inside Global ist die **Adresse des internen Hosts** im Internet.
- Die ACL erlaubt die **Inside Local**-Adressen (vor der Übersetzung).
- Eine statische Route/Default-Route zum Provider wird zusätzlich gebraucht.
- NAT ist **kein** Firewall-Ersatz.

## Grafik
### PAT
1. PC1 -> Router: 192.168.1.10:51000 → 8.8.8.8:80
2. Router: NAT-Tabelle: 192.168.1.10:51000 ↔ 203.0.113.2:51000
3. Router -> Server: 203.0.113.2:51000 → 8.8.8.8:80
4. Server -> Router: Antwort an 203.0.113.2:51000
5. Router -> PC1: zurückübersetzt auf 192.168.1.10:51000

### Static NAT
1. Internet-Client -> Router: Ziel 203.0.113.10:443
2. Router: Static NAT 203.0.113.10 ↔ 192.168.1.10
3. Router -> Webserver: Ziel 192.168.1.10:443

## Lab
**Packet Tracer: PC1, PC2 – R1 (NAT) – ISP-Router – Server 8.8.8.8**

### Cisco IOS
```
R1(config)# interface g0/0
R1(config-if)# ip nat inside
R1(config-if)# interface g0/1
R1(config-if)# ip nat outside
R1(config-if)# exit
R1(config)# access-list 1 permit 192.168.1.0 0.0.0.255
R1(config)# ip nat inside source list 1 interface g0/1 overload
R1(config)# ip route 0.0.0.0 0.0.0.0 203.0.113.1
R1# show ip nat translations
R1# show ip nat statistics
```
1. PC1 und PC2 pingen den Server; `show ip nat translations` zeigt je Ping einen Eintrag (ICMP-ID statt Port).
2. Static NAT für den Webserver: `ip nat inside source static tcp 192.168.1.10 80 203.0.113.2 8080`.
3. Fehler: `ip nat outside` entfernen → Pakete werden nicht übersetzt.

## Befehle
- `ip nat inside` / `ip nat outside` – Interfaces markieren
- `ip nat inside source static a b` – Static NAT
- `ip nat inside source list 1 pool P overload` – PAT mit Pool
- `show ip nat translations` – NAT-Tabelle
- `clear ip nat translation *` – Tabelle löschen
- `debug ip nat` – Echtzeitanalyse

## Übungen
- A: Welche Befehle sind für PAT über die WAN-Schnittstelle nötig? | L: ip nat inside/outside, ACL mit inside-Netz, ip nat inside source list N interface X overload.
- A: Wie heißt die private Adresse des internen Hosts in der NAT-Terminologie? | L: Inside Local.
- A: Wie viele öffentliche IPs braucht PAT minimal? | L: Eine.
- A: Welche privaten Bereiche gibt es? | L: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16.
- A: Ein Webserver (192.168.1.10) soll unter 203.0.113.10 erreichbar sein. | L: ip nat inside source static 192.168.1.10 203.0.113.10
- A: Warum fehlt PAT: "Translation nicht angelegt", obwohl alles konfiguriert ist? | L: inside/outside nicht gesetzt oder ACL passt nicht auf die Inside-Local-Adressen.

## Karteikarten
- F: Wofür NAT? | A: Private Adressen zu öffentlichen übersetzen, IPv4-Adressen sparen.
- F: Was ist PAT? | A: NAT Overload – viele interne Adressen auf eine öffentliche mit Port-Unterscheidung.
- F: Inside Local? | A: Interne, private Adresse des Hosts.
- F: Inside Global? | A: Öffentliche Adresse, unter der der interne Host erscheint.
- F: Befehl für Static NAT? | A: ip nat inside source static <local> <global>
- F: Welches Schlüsselwort aktiviert PAT? | A: overload
- F: Befehl für NAT-Tabelle? | A: show ip nat translations
- F: Was gibt die ACL im NAT-Befehl an? | A: Welche Inside-Local-Adressen übersetzt werden.
- F: RFC-1918-Bereiche? | A: 10/8, 172.16/12, 192.168/16.
- F: Warum kein NAT bei IPv6? | A: Ausreichend viele globale Adressen.

## Quiz
? Was bedeutet Inside Local?
* Private Adresse des internen Hosts
- Öffentliche Adresse des internen Hosts
- Adresse des Internetservers
- Adresse des Routers
? Welches Schlüsselwort macht aus NAT PAT?
* overload
- dynamic
- extended
- pool
? Was bestimmt die ACL im Befehl ip nat inside source list?
* Welche Quelladressen übersetzt werden
- Welche Ports offen sind
- Welche Pakete verworfen werden
- Den Gateway-Eintrag
? Welche Adresse gehört NICHT zu RFC 1918?
* 172.32.0.1
- 10.5.5.5
- 172.16.9.9
- 192.168.99.1
? Wie viele öffentliche Adressen braucht PAT mindestens?
* 1
- 2
- 254
- 65.535
? Wie unterscheidet PAT die Verbindungen?
* Durch Portnummern
- Durch MAC-Adressen
- Durch VLAN-IDs
- Durch TTL
? Welcher Befehl zeigt die Übersetzungen?
* show ip nat translations
- show nat status
- show ip nat interface
- show translations
? Static NAT ist…
* eine feste 1:1-Zuordnung
- eine Zuordnung vieler auf eine Adresse
- nur für IPv6
- ein DHCP-Verfahren
? Warum erreicht ein Inside-Host nach NAT-Konfiguration das Internet nicht (typische Ursache)?
* Fehlende Default-Route oder fehlendes inside/outside
- Zu viele Ports
- Falsche DNS-Zone
- NTP-Fehler
