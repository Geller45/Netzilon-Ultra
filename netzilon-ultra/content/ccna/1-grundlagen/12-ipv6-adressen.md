---
id: ccna-ipv6-adressen
bereich: CCNA
block: CCNA 1.8
kapitel: Network Fundamentals
titel: IPv6 – Schreibweise, Präfix, Header, Konfiguration und EUI-64
stufe: Fortgeschritten
fach: TCP/IP – CCNA – Basic
pruefungen: [CCNA, AP1, AP2]
quellen: [CCNA_200-301_Notes_-_Jeremys_IT_Lab.pdf, Unterschied_zwischen_IPv4_und_IPv6.pdf, 200_301_CCNA_v1.0_2.pdf]
verweise: [ap1-a4-ipv6, ap1-a4-ipv6-subnetting, ccna-ipv6-typen-ndp, netz-ipv4-vs-ipv6, ccna-statisches-routing]
---

## Profi

### Warum IPv6?
IPv4 bietet nur 2³² ≈ 4,3 Mrd. Adressen; VLSM, private Adressen und NAT sind Übergangslösungen. IPv6 hat **128 Bit** (= 16 Byte) → 2¹²⁸ ≈ 3,4 · 10³⁸ Adressen. IANA vergibt Blöcke an die RIRs, die an Provider; Unternehmen erhalten typischerweise ein **/48**, Endkunden /56 oder /64, ein **Subnetz ist /64**.

### Schreibweise
8 Gruppen (Hextets) à 16 Bit, je 4 Hex-Ziffern, getrennt durch Doppelpunkt: `2001:0db8:0000:0001:0f2a:4fff:fea3:00b1`.
**Kürzen nach RFC 5952 (verbindlich):**
1. **Führende Nullen** jeder Gruppe **müssen** entfallen: `0db8` → `db8`, `00b1` → `b1`, `0000` → `0`.
2. Die **längste** Folge von Null-Gruppen wird **einmal** durch `::` ersetzt.
3. Eine **einzelne** Nullgruppe wird **nicht** mit `::` gekürzt.
4. Bei gleich langen Folgen wird die **linke** gekürzt.
5. Hex-Buchstaben **klein** schreiben.
Beispiele: `2001:0000:0000:0000:0f2a:0000:0000:00b1` → `2001::f2a:0:0:b1`; `2001:0db8:0000:0000:0f2a:0000:0000:00b1` → `2001:db8::f2a:0:0:b1`.
**Erweitern**: Gruppen auf 4 Ziffern mit Nullen auffüllen, `::` durch so viele `0000` ersetzen, bis es 8 Gruppen sind.

### Präfix und Interface-ID
Global-Unicast-Struktur (typisch): **Global Routing Prefix** (/48, vom Provider) + **Subnet-ID** (16 Bit → 65.536 Subnetze) + **Interface-ID** (64 Bit). Das Präfix eines Hosts findet man, indem man alle Bits nach der Präfixlänge auf 0 setzt.
**Beispiel /93** (Jeremy): `2001:0db8:8b00:0001:fb89:017b:0020:0011/93` – 93 = 5 · 16 + 13, also 13 Bit der 6. Gruppe `017b` = `0000 0001 0111 1011` behalten: `0000 0001 0111 1` + `000` → `0178`. Präfix: `2001:db8:8b00:1:fb89:178::/93`.

### IPv6-Header (fest 40 Byte)
| Feld | Bit | Bedeutung |
|---|---|---|
| Version | 4 | 6 |
| Traffic Class | 8 | QoS (wie DSCP/ECN) |
| Flow Label | 20 | kennzeichnet einen Datenfluss |
| Payload Length | 16 | Länge der Nutzdaten (ohne den 40-Byte-Header) |
| Next Header | 8 | nächster Header (TCP 6, UDP 17, ICMPv6 58, Extension Header) – wie IPv4 „Protocol“ |
| Hop Limit | 8 | wie TTL |
| Quell-/Zieladresse | je 128 | – |
Keine Header-Prüfsumme, keine Fragmentierung durch Router (nur durch den Sender, Path MTU Discovery), Optionen über **Extension Header**.

### Modified EUI-64
Erzeugt aus der **48-Bit-MAC** eine **64-Bit-Interface-ID**:
1. MAC in der Mitte teilen: `782B.CB | AC.0867` → `782BCB` und `AC0867`.
2. `FFFE` einfügen: `782B:CBFF:FEAC:0867`.
3. **7. Bit** (U/L-Bit) des ersten Bytes **invertieren**: `78` = `0111 1000` → `0111 1010` = `7A`.
Ergebnis: `7A2B:CBFF:FEAC:0867`. Mit Präfix `2001:db8::/64` → `2001:db8::7a2b:cbff:feac:867`.
Warum invertieren? In der MAC bedeutet U/L = 0 „universell (UAA)“; in der EUI-64-ID bedeutet **1 = universell** – eine echte Hersteller-MAC ergibt also gesetztes Bit.

### Konfiguration auf Cisco
```
R1(config)# ipv6 unicast-routing
R1(config)# interface g0/0
R1(config-if)# ipv6 address 2001:db8:0:1::1/64
R1(config-if)# ipv6 address 2001:db8:0:2::/64 eui-64
R1(config-if)# ipv6 address autoconfig
R1(config-if)# ipv6 enable
R1(config-if)# no shutdown
```
- `ipv6 unicast-routing` ist nötig, damit der Router IPv6 **weiterleitet** (IPv4-Routing ist standardmäßig an, IPv6 nicht).
- Jede IPv6-Schnittstelle erzeugt automatisch eine **Link-Local-Adresse** (FE80::/10 + EUI-64).
- `ipv6 enable` aktiviert IPv6 nur mit Link-Local-Adresse.
- `ipv6 address autoconfig` = **SLAAC** (Präfix per Router Advertisement).

### Clients
Windows: `ipconfig` (zeigt temporäre und Link-Local-Adressen, `%12` = Zonen-ID), `netsh interface ipv6 show addresses`. Linux: `ip -6 addr`, `ip -6 route`. Windows nutzt standardmäßig **zufällige Interface-IDs** (Privacy Extensions, RFC 4941/8981) statt EUI-64.

## Einfach

IPv4-Adressen sind wie **Telefonnummern mit nur 10 Ziffern** – irgendwann sind alle vergeben. IPv6 ist wie eine Telefonnummer mit **so vielen Ziffern**, dass jedes Sandkorn der Erde eine eigene bekommen könnte.

Weil die Nummer so lang ist, schreibt man sie in **Hexadezimal** (0–9 und a–f) und in **8 Blöcken**:
`2001:0db8:0000:0000:0000:0000:0000:0001`

Damit man nicht so viel schreiben muss, gibt es zwei **Abkürz-Regeln**:
1. **Nullen am Anfang eines Blocks weglassen**: `0db8` → `db8`, `0001` → `1`.
2. **Ein langer Haufen Null-Blöcke** darf **einmal** durch `::` ersetzt werden.
Ergebnis: `2001:db8::1` – viel kürzer!

Warum nur **einmal** `::`? Weil man sonst nicht mehr weiß, wie viele Nullen wo fehlen – wie bei einem Puzzle, in dem zwei Teile gleichzeitig fehlen.

Eine IPv6-Adresse besteht aus zwei Hälften: **vorne die Straße** (Präfix, meist 64 Bit), **hinten das Haus** (Interface-ID, 64 Bit). Das Haus kann sich seine Nummer sogar **selbst ausdenken** – zum Beispiel aus seiner MAC-Adresse (EUI-64): MAC in der Mitte aufschneiden, `FFFE` dazwischenkleben und ein bestimmtes Bit umdrehen.

## Merksatz
- **128 Bit, 8 × 16, hex, Doppelpunkt.**
- **Führende Nullen weg, längste Nullkette einmal ::.**
- **/48 Firma – /64 Subnetz – 64 Bit Interface-ID.**
- **EUI-64: teilen – FFFE – 7. Bit kippen.**
- **Ohne ipv6 unicast-routing kein IPv6-Routing.**

## Prüfungsfalle
- `::` darf **nur einmal** vorkommen.
- Nur **führende** Nullen dürfen entfallen – `2001:db80::` ist **nicht** `2001:db8::`.
- EUI-64 invertiert das **7. Bit** (nicht das erste Bit, nicht das ganze Byte).
- Jeremys Notes: „An IPv6 address is 128 bits (**8 bytes**)“ – falsch, **16 Byte**.
- Die Quelle `Unterschied_zwischen_IPv4_und_IPv6.pdf` schreibt „IPv6 wurde 1995 entwickelt, aber erst 2017 offiziell eingeführt“ – genauer: erste RFC 1995 (RFC 1883), **Internet-Standard seit 2017 (RFC 8200)**; produktiv genutzt seit dem World IPv6 Launch **2012**. Auch „IPv6-Header kürzer“ stimmt nicht: Er ist mit **40 Byte** fest, aber **einfacher** (weniger Felder) als der 20-Byte-IPv4-Header.

## Grafik
### Kürzen einer IPv6-Adresse
1. Text: 2001:0db8:0000:0000:0f2a:0000:0000:00b1
2. Text: Führende Nullen fallen weg → 2001:db8:0:0:f2a:0:0:b1
3. Text: Zwei gleich lange Nullfolgen – die linke wird gekürzt
4. Text: Ergebnis 2001:db8::f2a:0:0:b1

### EUI-64
1. Text: MAC 782B.CBAC.0867
2. Text: Teilen in 782BCB und AC0867
3. Text: FFFE einfügen → 782B:CBFF:FEAC:0867
4. Text: 7. Bit kippen: 78 → 7A
5. Text: Interface-ID 7A2B:CBFF:FEAC:0867

## Lab
**Packet Tracer: R1 (ISR) – SW1 – PC1/PC2, Präfix 2001:db8:0:1::/64**

### Cisco IOS
```
R1(config)# ipv6 unicast-routing
R1(config)# interface g0/0
R1(config-if)# ipv6 address 2001:db8:0:1::1/64
R1(config-if)# ipv6 address fe80::1 link-local
R1(config-if)# no shutdown
R1(config-if)# end
R1# show ipv6 interface brief
R1# show ipv6 interface g0/0
R1# show ipv6 route
```
1. **PC1**: IP Configuration → IPv6 → **Automatic** (SLAAC) – PC1 bildet Adresse aus Präfix + EUI-64.
2. **PC2**: statisch 2001:db8:0:1::20/64, Gateway fe80::1.
3. **PC1**: `ipv6config` bzw. `ipconfig`, dann `ping 2001:db8:0:1::20`.

## Befehle
- `ipv6 unicast-routing` – IPv6-Weiterleitung aktivieren
- `ipv6 address 2001:db8:0:1::1/64` – statische IPv6-Adresse
- `ipv6 address 2001:db8:0:2::/64 eui-64` – Interface-ID per EUI-64
- `ipv6 address autoconfig` – SLAAC am Router-Interface
- `ipv6 enable` – nur Link-Local aktivieren
- `show ipv6 interface brief` – IPv6-Adressen je Interface
- `ipconfig` / `ip -6 addr` – IPv6 am Client prüfen

## Übungen
- A: Kürze 2001:0db8:0000:0001:0f2a:4fff:fea3:00b1. | L: 2001:db8:0:1:f2a:4fff:fea3:b1 (nur eine Nullgruppe → kein ::).
- A: Kürze fe80:0000:0000:0000:0202:b3ff:fe1e:8329. | L: fe80::202:b3ff:fe1e:8329.
- A: Erweitere 2001:db8::1:0:0:1. | L: 2001:0db8:0000:0000:0001:0000:0000:0001.
- A: EUI-64-Interface-ID aus MAC 0050.56C0.0001? | L: 0050.56 | C0.0001 → 0050:56FF:FEC0:0001, 00 → 02 → 0250:56ff:fec0:1.
- A: EUI-64 aus MAC 782B.CBAC.0867? | L: 7A2B:CBFF:FEAC:0867.
- A: Präfix von 2001:db8:abcd:12::99/64? | L: 2001:db8:abcd:12::/64.
- A: Wie viele /64-Subnetze hat ein /48? | L: 2¹⁶ = 65.536.

## Karteikarten
- F: Wie lang ist eine IPv6-Adresse? | A: 128 Bit = 16 Byte, 8 Gruppen à 16 Bit.
- F: Wie oft darf :: in einer Adresse vorkommen? | A: Genau einmal.
- F: Welche Nullen darf man in einer Gruppe weglassen? | A: Nur führende Nullen.
- F: Typische Präfixlänge eines IPv6-Subnetzes? | A: /64.
- F: Welches Präfix bekommt ein Unternehmen meist? | A: /48 (65.536 /64-Subnetze).
- F: Wie groß ist der IPv6-Header? | A: Fest 40 Byte.
- F: Welches IPv6-Feld entspricht der TTL? | A: Hop Limit.
- F: Welches Feld entspricht dem IPv4-Protocol-Feld? | A: Next Header.
- F: Was macht Modified EUI-64? | A: MAC teilen, FFFE einfügen, 7. Bit invertieren → 64-Bit-Interface-ID.
- F: Welcher Befehl aktiviert IPv6-Routing auf Cisco? | A: ipv6 unicast-routing
- F: Welche RFC regelt die Kurzschreibweise? | A: RFC 5952.

## Quiz
? Welche Schreibweise von 2001:0db8:0000:0000:0000:0000:0000:0001 ist korrekt gekürzt?
* 2001:db8::1
- 2001:db8:::1
- 2001:db8::0:1::
- 2001:db8:0::0:1

? Welches Bit wird bei Modified EUI-64 invertiert?
* Das 7. Bit des ersten Bytes
- Das erste Bit
- Das letzte Bit
- Alle Bits des ersten Bytes

? Wie lautet die EUI-64-Interface-ID der MAC 782B.CBAC.0867?
* 7A2B:CBFF:FEAC:0867
- 782B:CBFF:FEAC:0867
- 7A2B:CBFE:FFAC:0867
- 782B:CBAC:FFFE:0867

? Welcher Befehl ist nötig, damit ein Cisco-Router IPv6-Pakete zwischen Netzen weiterleitet?
* ipv6 unicast-routing
- ipv6 enable
- ip routing
- ipv6 forwarding enable

? Wie groß ist der IPv6-Header?
* 40 Byte fest
- 20 bis 60 Byte
- 32 Byte
- 128 Byte

? Wie kürzt man 2001:0db8:0000:0000:0f2a:0000:0000:00b1 korrekt?
* 2001:db8::f2a:0:0:b1
- 2001:db8:0:0:f2a::b1
- 2001:db8::f2a::b1
- 2001:db8::f2a:b1

? Welche Präfixlänge hat ein Standard-IPv6-Subnetz für SLAAC?
* /64
- /48
- /56
- /128

? Was gilt für die Fragmentierung bei IPv6?
* Nur der Sender fragmentiert, Router nicht
- Jeder Router fragmentiert bei Bedarf
- IPv6 kennt keine Fragmentierung
- Fragmentierung übernimmt der Switch

## Lücken
- Eine IPv6-Adresse hat {128} Bit.
- Die längste Folge von Nullgruppen wird durch {::} ersetzt.
- Bei EUI-64 wird {FFFE} in die Mitte der MAC eingefügt.
- Das IPv6-Gegenstück zur TTL heißt {Hop Limit}.

## Spickzettel
- 128 Bit, 8 Hextets, :: nur einmal, führende Nullen weg, Kleinbuchstaben
- /48 Firma, /64 Subnetz, 64 Bit Interface-ID
- Header 40 B: Version, Traffic Class, Flow Label, Payload Length, Next Header, Hop Limit
- EUI-64: teilen, FFFE, 7. Bit kippen
- ipv6 unicast-routing · ipv6 address … eui-64 · autoconfig
