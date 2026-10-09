---
id: netz-ipv4-vs-ipv6
bereich: AP1
block: Netzwerk
kapitel: IP-Protokoll
titel: Unterschied IPv4 und IPv6 – Adressraum, Header, Kommunikationsarten, Migration
stufe: Einsteiger
fach: TCP/IP – CCNA – Basic
pruefungen: [AP1, AP2, CCNA, Schule]
quellen: [Unterschied_zwischen_IPv4_und_IPv6.pdf]
verweise: [ccna-ipv6-adressen, ccna-ipv6-typen-ndp, ccna-ipv4-adressierung, ccna-nat]
---

## Profi

### Überblick
| Merkmal | IPv4 | IPv6 |
|---|---|---|
| Adresslänge | 32 Bit (2³² ≈ 4,29 Mrd.) | 128 Bit (2¹²⁸ ≈ 3,4 × 10³⁸) |
| Schreibweise | 4 Dezimalzahlen 0–255, Punkte (197.0.0.1) | 8 Gruppen à 4 Hexzeichen, Doppelpunkte (2600:1400:d:5a3::3bd4); führende Nullen weglassen, **eine** Nullfolge als `::` |
| Loopback | 127.0.0.1 | ::1 |
| Header | variabel 20–60 Byte, mit **Prüfsumme** | fest **40 Byte**, **keine Prüfsumme**, Erweiterungs-Header |
| Kommunikation | Unicast, **Broadcast**, Multicast | Unicast, Multicast, **Anycast** (kein Broadcast) |
| Adresskonfiguration | manuell, DHCP | **SLAAC**, DHCPv6 (stateful/stateless), manuell |
| NAT | üblich (Adressmangel) | nicht nötig |
| Namensauflösung | A-Record | AAAA-Record |
| Fragmentierung | Router und Sender | nur der Sender (Path MTU Discovery) |
| Sicherheit | IPsec optional | IPsec Bestandteil des Standards (Nutzung optional) |
| Auflösung L2 | ARP | NDP (Neighbor Discovery, ICMPv6) |

### Hintergrund
IPv4 (RFC 791, 1981) war die erste weit verbreitete Version. Der freie IPv4-Pool der IANA war **2011 erschöpft**; RIRs verteilen Reste. Abhilfen: **CIDR**, **private Adressen (RFC 1918)**, **NAT/PAT**. IPv6 wurde in den 1990er Jahren entwickelt (RFC 2460, 1998; heute **RFC 8200**, seit 2017 Internet-Standard). 

### Kommunikationsarten
- **Unicast**: eins zu eins.
- **Broadcast** (nur IPv4): an alle Geräte im Netz (255.255.255.255 bzw. Netz-Broadcast).
- **Multicast**: an eine Gruppe (IPv4 224.0.0.0/4, IPv6 ff00::/8).
- **Anycast** (IPv6, auch im Betrieb mit IPv4 möglich): an den „nächsten“ Empfänger mit derselben Adresse (z. B. DNS-Root-Server).

### Migration
**Dual Stack** (beide parallel), **Tunneling** (6in4, 6to4, Teredo – meist Legacy), **Translation** (NAT64/DNS64). Unternehmen betreiben heute überwiegend Dual Stack.

### Datenschutz
IPv6-Adressen mit EUI-64 enthalten die MAC; **Privacy Extensions** (RFC 4941) erzeugen zufällige temporäre Adressen. IPv4: Anonymisierung durch Kürzen der letzten 8 Bit.

## Einfach

Jedes Gerät im Internet braucht eine Adresse – wie jedes Haus eine Hausnummer. **IPv4** hat etwa **4 Milliarden Hausnummern**. Das klingt viel, aber es gibt viel mehr Handys, Computer, Smart-TVs und Kühlschränke. Die Hausnummern sind **seit 2011 aufgebraucht**.

Deshalb wurde **IPv6** erfunden. Es hat so viele Adressen, dass jedes Gerät der Welt problemlos eine eigene bekommt (rund 3,4 × 10³⁸ – eine Zahl mit 39 Stellen). IPv4 sieht so aus: `197.0.0.1`. IPv6 sieht so aus: `2600:1400:d:5a3::3bd4` – mit Buchstaben und Doppelpunkten, weil es länger ist. Das `::` ist eine Abkürzung für „hier stehen lauter Nullen“.

Was sich noch unterscheidet:
- Bei IPv4 gibt es **Broadcast** („Ruf in die ganze Halle“). IPv6 hat das nicht mehr; dafür gibt es **Multicast** („Ruf an eine bestimmte Gruppe“) und **Anycast** („Ruf an den Nächsten, der die gleiche Nummer hat“).
- IPv4 braucht oft **NAT**, weil viele Geräte sich eine öffentliche Adresse teilen. Bei IPv6 hat jedes Gerät seine eigene.
- Bei IPv6 kann sich ein Gerät seine Adresse **selbst** ausrechnen (SLAAC), ganz ohne DHCP.
- Der Paketkopf (Header) von IPv6 ist **immer gleich groß** und einfacher; Router brauchen weniger Zeit dafür.

Beide laufen heute parallel im selben Netz – das nennt man **Dual Stack**.

## Merksatz
- **IPv4 = 32 Bit, IPv6 = 128 Bit.**
- **IPv6: kein Broadcast, dafür Multicast + Anycast.**
- **IPv4-Header 20–60 Byte, IPv6 fix 40 Byte.**
- **A-Record = IPv4, AAAA = IPv6. Loopback 127.0.0.1 / ::1.**
- **Dual Stack ist der Normalfall der Migration.**

## Prüfungsfalle
- Die Unterlage `Unterschied_zwischen_IPv4_und_IPv6.pdf` nennt die Gruppen bei IPv4 „dreistellig“ – es sind **Zahlen 0–255** (1–3 Stellen). 
- Der Satz „IPv6 wurde 1995 entwickelt, aber erst 2017 offiziell eingeführt“ ist verkürzt: Der Standard RFC 8200 wurde **2017** zum Internet-Standard; produktive Nutzung läuft seit Jahren (World IPv6 Launch 2012).
- Die Unterlage schreibt, IPv6-Header erlaubten „separate Header-Pakete“: gemeint sind **Erweiterungs-Header**.
- **IPv6 hat keine Header-Prüfsumme**, IPv4 schon.
- „IPv6 ist sicherer“ stimmt nur eingeschränkt; IPsec ist unterstützt, aber nicht automatisch aktiv.
- IPv6 hat **kein ARP**, sondern NDP.

## Grafik
### Dual Stack
1. Client -> DNS-Server: Anfrage A und AAAA für www.beispiel.de
2. DNS-Server -> Client: A 93.184.216.34 und AAAA 2606:2800:220:1::
3. Client: Bevorzugt IPv6 (Happy Eyeballs)
4. Client -> Server: Verbindung über IPv6, Rückfall auf IPv4 bei Fehler

### Adresskürzung
1. Text: 2001:0db8:0000:0000:0000:0000:0000:0001
2. Text: Führende Nullen weg: 2001:db8:0:0:0:0:0:1
3. Text: Längste Nullfolge als :: → 2001:db8::1

## Übungen
- A: Kürzen Sie 2001:0db8:0000:0000:0000:ff00:0042:8329 | L: 2001:db8::ff00:42:8329
- A: Wie viele Adressen hat IPv4 / IPv6? | L: 2³² ≈ 4,29 Mrd. / 2¹²⁸ ≈ 3,4 × 10³⁸.
- A: Welche Kommunikationsarten gibt es nur bei IPv4 bzw. nur bei IPv6? | L: Broadcast nur IPv4; Anycast nur IPv6 (Unicast/Multicast bei beiden).
- A: Welche DNS-Records gehören zu IPv4/IPv6? | L: A / AAAA.
- A: Header-Größen? | L: IPv4 20–60 Byte, IPv6 fix 40 Byte.
- A: Wie heißt das automatische IPv6-Verfahren ohne DHCP? | L: SLAAC.
- A: Was bedeutet Dual Stack? | L: Gleichzeitiger Betrieb von IPv4 und IPv6 auf demselben Gerät/Netz.

## Karteikarten
- F: Länge einer IPv4-Adresse? | A: 32 Bit.
- F: Länge einer IPv6-Adresse? | A: 128 Bit.
- F: IPv6-Loopback? | A: ::1
- F: IPv4-Loopback? | A: 127.0.0.1
- F: Gibt es IPv6-Broadcast? | A: Nein, stattdessen Multicast.
- F: Was ist Anycast? | A: Zustellung an den nächstgelegenen von mehreren Empfängern mit gleicher Adresse.
- F: IPv6-Header-Größe? | A: 40 Byte.
- F: Adressauto­konfiguration IPv6? | A: SLAAC (und DHCPv6).
- F: DNS-Record für IPv6? | A: AAAA
- F: Wann war der IPv4-Pool der IANA erschöpft? | A: 2011.

## Quiz
? Wie viele Bit hat eine IPv6-Adresse?
* 128
- 32
- 64
- 256
? Welcher Kommunikationstyp existiert nur in IPv4?
* Broadcast
- Unicast
- Multicast
- Anycast
? Welcher DNS-Record gehört zu IPv6?
* AAAA
- A
- MX
- PTR
? Wie groß ist der IPv6-Header?
* 40 Byte
- 20 Byte
- 60 Byte
- 128 Bit
? Was ist die IPv6-Loopback-Adresse?
* ::1
- 127.0.0.1
- fe80::1
- ::0
? Wie heißt die parallele Nutzung von IPv4 und IPv6?
* Dual Stack
- Double NAT
- Hybrid Routing
- Mirror Mode
? Welches Verfahren konfiguriert IPv6-Adressen automatisch?
* SLAAC
- DORA
- ARP
- RARP
? Was hat IPv4 im Header, IPv6 nicht?
* Prüfsumme
- Quelladresse
- Zieladresse
- Hop Limit
? Was wird in IPv6 statt ARP verwendet?
* NDP
- DHCP
- ICMPv4
- RIP
