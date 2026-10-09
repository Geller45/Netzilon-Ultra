---
id: ccna-ipv6-typen-ndp
bereich: CCNA
block: CCNA 1.9
kapitel: Network Fundamentals
titel: IPv6-Adresstypen, Multicast, NDP, SLAAC und DAD
stufe: Fortgeschritten
fach: TCP/IP – CCNA – Basic
pruefungen: [CCNA, AP1, AP2]
quellen: [CCNA_200-301_Notes_-_Jeremys_IT_Lab.pdf, Unterschied_zwischen_IPv4_und_IPv6.pdf, 200_301_CCNA_v1.0_2.pdf]
verweise: [ccna-ipv6-adressen, ap1-a4-ipv6, ccna-switching-mac-arp, ccna-dhcp-dns, netz-ipv4-vs-ipv6]
---

## Profi

### Unicast-Typen
| Typ | Bereich | Eigenschaften | IPv4-Pendant |
|---|---|---|---|
| **Global Unicast (GUA)** | ursprünglich **2000::/3** (2000:: – 3FFF:…), heute alles nicht Reservierte | öffentlich, weltweit eindeutig, registriert, im Internet routbar | öffentliche Adresse |
| **Unique Local (ULA)** | **FC00::/7**, praktisch **FD00::/8** (8. Bit = 1) | privat, nicht im Internet routbar, ohne Registrierung; 40-Bit-**Global-ID** zufällig wählen (Fusionen!) | RFC 1918 |
| **Link-Local (LLA)** | **FE80::/10** (praktisch immer **FE80::/64**) | automatisch auf jedem IPv6-Interface, **nur im eigenen Link**, wird **nicht geroutet**; Interface-ID per EUI-64 oder zufällig | 169.254.0.0/16 |
| Unspecified | **::/128** | „noch keine Adresse“ (Quelle bei DAD/DHCPv6), Default-Route **::/0** | 0.0.0.0 |
| Loopback | **::1/128** | Test des eigenen Stacks | 127.0.0.1 |
| IPv4-mapped | ::ffff:0:0/96 | IPv4 in IPv6-Darstellung | – |
Link-Local wird genutzt für: **NDP**, **OSPFv3-/EIGRP-Nachbarschaften**, **Next-Hop** in Routen (Router-Advertisements kommen von der LLA). Bei Link-Local-Next-Hop muss das **Ausgangsinterface** angegeben werden.

### Multicast (FF00::/8) – IPv6 kennt keinen Broadcast
| Adresse | Gruppe | IPv4-Pendant |
|---|---|---|
| **FF02::1** | alle Knoten (All Nodes) | 224.0.0.1 |
| **FF02::2** | alle Router | 224.0.0.2 |
| **FF02::5** | alle OSPF-Router | 224.0.0.5 |
| **FF02::6** | OSPF DR/BDR | 224.0.0.6 |
| FF02::9 | RIPng-Router | 224.0.0.9 |
| FF02::A | EIGRP-Router | 224.0.0.10 |
| FF02::1:2 | DHCPv6-Server/Relays | – |
| **FF02::1:FFxx:xxxx** | **Solicited-Node** | – |
**Scopes** (4. Hex-Ziffer): **FF01** Interface-Local, **FF02** Link-Local, **FF05** Site-Local, **FF08** Organization-Local, **FF0E** Global.

### Anycast
„One-to-one-of-many“: **dieselbe Unicast-Adresse** auf mehreren Geräten; das Routing führt zum **nächstgelegenen** (nach Metrik). Kein eigener Adressbereich: `ipv6 address 2001:db8:1:1::99/128 anycast`.

### Solicited-Node-Multicast
Aus jeder Unicast-Adresse: **FF02::1:FF** + **letzte 24 Bit** der Adresse. Beispiel `2001:db8::7a2b:cbff:feac:867` → `FF02::1:FFAC:867`. Jeder Host tritt automatisch dieser Gruppe bei → Adressauflösung ohne Broadcast.

### NDP (Neighbor Discovery Protocol, ICMPv6)
| Nachricht | ICMPv6-Typ | Ziel | Zweck |
|---|---|---|---|
| **RS** Router Solicitation | **133** | FF02::2 | „Gibt es Router?“ beim Hochfahren |
| **RA** Router Advertisement | **134** | FF02::1 (oder Unicast) | Router meldet Präfix, Gateway (LLA), Flags; periodisch (Cisco 200 s) und als Antwort |
| **NS** Neighbor Solicitation | **135** | Solicited-Node-Multicast | „Welche MAC hat Adresse X?“ – ersetzt ARP-Request |
| **NA** Neighbor Advertisement | **136** | Unicast | Antwort mit MAC – ersetzt ARP-Reply |
| Redirect | 137 | Unicast | besserer Next-Hop |
Nachbartabelle: `show ipv6 neighbors` (Cisco), `netsh interface ipv6 show neighbors` (Windows), `ip -6 neigh` (Linux).

### Adresskonfiguration
| Methode | Woher Präfix/Gateway | Woher DNS | RA-Flags |
|---|---|---|---|
| Statisch | manuell | manuell | – |
| **SLAAC** | RA | RA (RDNSS) oder fehlt | A=1, M=0, O=0 |
| **SLAAC + zustandsloses DHCPv6** | RA | DHCPv6 | A=1, O=1 |
| **Zustandsbehaftetes DHCPv6** | Adresse per DHCPv6, Gateway per RA | DHCPv6 | M=1 |
**SLAAC**: Host lernt das /64-Präfix per RA und bildet die Interface-ID per **EUI-64** oder **zufällig** (Privacy Extensions). Cisco: `ipv6 address autoconfig`; mit `ipv6 address 2001:db8:1::/64 eui-64` wird das Präfix manuell angegeben.

### DAD (Duplicate Address Detection)
Bei jeder neuen IPv6-Adresse (manuell, SLAAC, DHCPv6) und bei `no shutdown` sendet der Host ein **NS an die eigene Adresse** (Quelle ::). Kommt ein **NA**, ist die Adresse **doppelt** und wird nicht genutzt; keine Antwort → Adresse eindeutig.

### IPv4 vs. IPv6 – Kurzvergleich
| | IPv4 | IPv6 |
|---|---|---|
| Kommunikationsarten | Unicast, **Broadcast**, Multicast | Unicast, Multicast, **Anycast** (kein Broadcast) |
| Adressauflösung | ARP (Broadcast) | NDP (ICMPv6, Solicited-Node-Multicast) |
| Autokonfiguration | DHCP, APIPA | SLAAC, DHCPv6 |
| DNS-Eintrag | A | AAAA |
| NAT | üblich | nicht vorgesehen (NAT66/NPTv6 selten) |

## Einfach

Bei IPv6 gibt es verschiedene **Adressarten**, wie verschiedene **Briefarten**:
- **Global Unicast (beginnt mit 2 oder 3)** = deine **weltweite Postadresse**. Damit erreicht dich jeder auf der Welt.
- **Unique Local (beginnt mit fd)** = eine **Firmen-interne Hausnummer**. Gilt nur innerhalb der Firma.
- **Link-Local (beginnt mit fe80)** = dein **Spitzname im eigenen Zimmer**. Nur die Leute im selben Raum (im selben Netzsegment) kennen ihn. Jeder hat automatisch einen.
- **Multicast (beginnt mit ff)** = ein **Rundbrief an eine Gruppe**, z. B. „an alle Router“ (ff02::2).
- **Anycast** = „**an den nächsten Pizzaladen**“: Viele Läden haben dieselbe Nummer, du landest beim nächsten.

**Einen Broadcast („an alle!“) gibt es bei IPv6 nicht mehr.** Stattdessen spricht man gezielt Gruppen an – das ist leiser und schont die Geräte.

**NDP** ersetzt ARP: Statt ins ganze Haus zu brüllen „Wer hat diese Adresse?“, flüstert man in einen **kleinen Gruppenchat** (Solicited-Node-Multicast), in dem fast nur der Gesuchte sitzt.

**SLAAC** ist wie **„Adresse selbst basteln“**: Der Router ruft: „Unsere Straße heißt 2001:db8:1::/64!“ (Router Advertisement). Jeder PC hängt seine eigene Hausnummer dran – fertig, ohne DHCP-Server. Und mit **DAD** fragt er vorher nach: „Wohnt hier schon jemand mit dieser Nummer?“

## Merksatz
- **2/3 global · fd privat · fe80 Link · ff Multicast.**
- **ff02::1 alle Knoten, ff02::2 alle Router.**
- **RS 133 – RA 134 – NS 135 – NA 136.**
- **Solicited-Node = ff02::1:ff + letzte 24 Bit.**
- **Kein Broadcast in IPv6.**

## Prüfungsfalle
- ULA ist **FC00::/7**, genutzt wird aber nur **FD**-Präfix (L-Bit = 1).
- Link-Local beginnt mit **FE80** (FE80::/10), FE9/FEA/FEB kommen praktisch nicht vor.
- Anycast hat **keinen eigenen** Adressbereich.
- RA wird an **FF02::1** (alle Knoten) gesendet, RS an **FF02::2** (alle Router) – nicht verwechseln.
- Router leiten Link-Local-Ziele **nie** weiter; Routen zu Link-Local-Next-Hops brauchen das Ausgangsinterface.
- Die Quelle `Unterschied_zwischen_IPv4_und_IPv6.pdf` sagt „Adressübersetzung erforderlich: IPv6 Nein“ – richtig ist: NAT ist bei IPv6 **nicht vorgesehen**, aber Übergangstechniken (NAT64, NPTv6) existieren.

## Grafik
### SLAAC mit DAD
1. PC1 -> Router: RS an ff02::2 „Gibt es Router?“
2. Router -> PC1: RA an ff02::1 „Präfix 2001:db8:1::/64, Gateway fe80::1“
3. PC1: Bildet 2001:db8:1::7a2b:cbff:feac:867 (EUI-64)
4. PC1 -> Netz: NS an eigene Solicited-Node-Adresse (DAD)
5. PC1: Keine Antwort – Adresse eindeutig, wird aktiv

### Adressauflösung mit NDP
1. PC1: Braucht MAC von 2001:db8:1::20
2. PC1 -> PC2: NS an ff02::1:ff00:20
3. PC2 -> PC1: NA (Unicast) mit MAC
4. PC1: Eintrag in Neighbor-Cache

## Lab
**Packet Tracer: R1 als RA-Router für 2001:db8:1::/64, PC1 per SLAAC**

### Cisco IOS
```
R1(config)# ipv6 unicast-routing
R1(config)# interface g0/0
R1(config-if)# ipv6 address 2001:db8:1::1/64
R1(config-if)# ipv6 address fe80::1 link-local
R1(config-if)# ipv6 address 2001:db8:1::99/128 anycast
R1(config-if)# no shutdown
R1(config-if)# end
R1# show ipv6 interface g0/0
R1# show ipv6 neighbors
```
In `show ipv6 interface g0/0` die Zeilen **Joined group address(es)**: FF02::1, FF02::2, FF02::1:FF00:1 und FF02::1:FF00:99 suchen.

### Clients
1. **PC1**: IPv6 auf Automatic → erhält 2001:db8:1::/64 + EUI-64.
2. **PC1** (Windows): `netsh interface ipv6 show neighbors`.
3. **Linux-Host**: `ip -6 addr`, `ip -6 neigh`, `ping ff02::1%eth0` (alle Knoten im Link).

## Befehle
- `show ipv6 interface g0/0` – Adressen und beigetretene Multicast-Gruppen
- `show ipv6 neighbors` – NDP-Nachbartabelle (Cisco)
- `ipv6 address … anycast` – Anycast-Adresse konfigurieren
- `ipv6 nd prefix …` – Präfix in RAs steuern
- `ipv6 nd managed-config-flag` – M-Flag (DHCPv6 stateful) setzen
- `netsh interface ipv6 show neighbors` – Nachbarcache (Windows)
- `ip -6 neigh` – Nachbarcache (Linux)

## Übungen
- A: Typ von fd12:3456:789a:1::10? | L: Unique Local (FD00::/8 aus FC00::/7).
- A: Typ von fe80::1? | L: Link-Local.
- A: Typ von 2001:db8:abcd::1? | L: Global Unicast (2000::/3; 2001:db8::/32 ist Dokumentationspräfix).
- A: Solicited-Node-Adresse zu 2001:db8::1:2:3:4567:89ab? | L: FF02::1:FF67:89AB (letzte 24 Bit 67:89ab).
- A: Welche ICMPv6-Typen ersetzen ARP? | L: Neighbor Solicitation (135) und Neighbor Advertisement (136).
- A: Wie heißt das IPv6-Pendant zu 0.0.0.0/0? | L: ::/0.

## Karteikarten
- F: Bereich der Global-Unicast-Adressen (ursprünglich)? | A: 2000::/3.
- F: Bereich der Unique-Local-Adressen? | A: FC00::/7 (genutzt: FD00::/8).
- F: Bereich der Link-Local-Adressen? | A: FE80::/10.
- F: Multicast-Bereich bei IPv6? | A: FF00::/8.
- F: Was ist FF02::1? | A: Alle Knoten im Link (All Nodes).
- F: Was ist FF02::2? | A: Alle Router im Link.
- F: Welche NDP-Nachricht schickt ein Router mit Präfixinformation? | A: Router Advertisement (ICMPv6 Typ 134).
- F: Wie wird eine Solicited-Node-Adresse gebildet? | A: FF02::1:FF + die letzten 24 Bit der Unicast-Adresse.
- F: Was ist DAD? | A: Duplicate Address Detection – NS an die eigene Adresse; Antwort bedeutet Duplikat.
- F: Was ist SLAAC? | A: Stateless Address Autoconfiguration – Präfix per RA, Interface-ID selbst gebildet.
- F: Was ist eine Anycast-Adresse? | A: Gleiche Unicast-Adresse auf mehreren Geräten, Zustellung an das nächste.
- F: Was ersetzt in IPv6 den Broadcast? | A: Multicast (z. B. FF02::1).

## Quiz
? Mit welchen Zeichen beginnt eine Link-Local-Adresse?
* fe80
- fd00
- ff02
- 2001

? Welche IPv6-Adresstypen gibt es NICHT?
* Broadcast
- Anycast
- Multicast
- Unicast

? Welche Nachricht sendet ein Host, um Router zu finden?
* Router Solicitation an FF02::2
- Router Advertisement an FF02::1
- Neighbor Advertisement an FF02::2
- DHCP Discover an FF02::1

? Welche Adresse ist ein Unique Local Address?
* fd00:1:2:3::10
- fe80::10
- 2001:db8::10
- ff05::10

? Wie wird bei SLAAC das Präfix gelernt?
* Über Router Advertisements
- Über DHCPv6 Request
- Über ARP Replies
- Über DNS AAAA-Einträge

? Welche ICMPv6-Nachricht entspricht dem ARP-Request?
* Neighbor Solicitation (135)
- Router Solicitation (133)
- Neighbor Advertisement (136)
- Echo Request (128)

? Wie lautet die Solicited-Node-Adresse zu 2001:db8::ac:867?
* ff02::1:ffac:867
- ff02::1:ff00:867
- ff02::ac:867
- ff02::1:867
! Die letzten 24 Bit von …:00ac:0867 sind ac:0867 → ff02::1:ff + ac:0867 = ff02::1:ffac:867.

? Welche Aussage über Link-Local-Adressen stimmt?
* Sie werden von Routern nicht in andere Netze weitergeleitet
- Sie müssen registriert werden
- Sie werden nur per DHCPv6 vergeben
- Sie beginnen mit fd

## Zuordnen
### Adresse und Typ
- 2001:db8:1::10 => Global Unicast
- fd5c:12::1 => Unique Local
- fe80::a1 => Link-Local
- ff02::2 => Multicast alle Router
- ::1 => Loopback
- :: => Unspecified

## Spickzettel
- GUA 2000::/3 · ULA FC00::/7 (FD) · LLA FE80::/10 · MC FF00::/8
- ::/0 Default · ::1 Loopback · :: unspecified
- FF02::1 Knoten · ::2 Router · ::5/6 OSPF · ::A EIGRP · ::1:2 DHCPv6
- NDP: RS 133, RA 134, NS 135, NA 136; DAD per NS an eigene Adresse
- Solicited-Node FF02::1:FF + letzte 24 Bit
- SLAAC (RA) · stateless DHCPv6 (O) · stateful DHCPv6 (M)
