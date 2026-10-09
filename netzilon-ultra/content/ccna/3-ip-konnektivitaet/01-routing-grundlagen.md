---
id: ccna-routing-grundlagen
bereich: CCNA
block: CCNA 3.1
kapitel: IP Connectivity
titel: Routing-Grundlagen – Routingtabelle, längster Präfix, Administrative Distanz, Metrik
stufe: Fortgeschritten
fach: TCP/IP – CCNA – Basic
pruefungen: [CCNA, AP1, AP2]
quellen: [CCNA_200-301_Notes_-_Jeremys_IT_Lab.pdf, 05-routing.pdf, 200_301_CCNA_v1.0_2.pdf, 200-301.pdf]
verweise: [ccna-statisches-routing, ccna-ospf, ccna-subnetting, ccna-trunk-intervlan]
---

## Profi

### Was ein Router tut
Ein Router arbeitet auf **Layer 3**, verbindet Netze (Broadcastdomänen) und leitet Pakete anhand der **Ziel-IP-Adresse** weiter. Ablauf je Paket: (1) Frame empfangen, Ziel-MAC prüfen, Layer-2-Header entfernen; (2) Ziel-IP mit der **Routingtabelle** vergleichen; (3) **TTL** um 1 senken (bei 0: verwerfen + ICMP Time Exceeded) und Prüfsumme neu berechnen; (4) Next-Hop per **ARP** auf MAC auflösen; (5) neuen Layer-2-Header setzen und über das Ausgangs-Interface senden. IP-Quelle/Ziel bleiben, MAC-Adressen ändern sich bei **jedem Hop**.

### Entscheidung des Hosts (lokal oder remote?)
Quell-IP und Ziel-IP werden jeweils mit der **Subnetzmaske des Senders** UND-verknüpft; sind die Netz-IDs gleich → direkt (ARP für Ziel-IP), sonst → an das **Standardgateway** (ARP für Gateway-IP). Beispiel: 192.168.12.121/24 → 192.168.12.196 = gleiches Netz, kein Routing; 192.168.27.221/24 → 192.168.12.196 = Netz verschieden → Gateway.

### Routingtabelle
Einträge: Netz-ID/Präfix, Next-Hop (Gateway), Ausgangs-Interface, Metrik, **AD** (Administrative Distanz). Typen (Cisco-Code): **C** connected, **L** local (/32 eigene IP), **S** static, **S\*** statische Default-Route, **O** OSPF, **D** EIGRP, **R** RIP, **B** BGP. Auf dem Host: `route print` (Windows), `ip route` (Linux), `netstat -rn`.

### Auswahlregeln (Reihenfolge!)
1. **Längster Präfix (Longest Prefix Match)** gewinnt immer – /28 schlägt /24 schlägt /0. 
2. Bei **gleichem Präfix**: niedrigste **Administrative Distanz** (Glaubwürdigkeit der Quelle).
3. Bei gleichem Präfix **und** gleicher AD: niedrigste **Metrik** (innerhalb eines Protokolls).
4. Bei Gleichstand: **Equal-Cost Load Balancing** (bis 4 Pfade Standard, bis 32 konfigurierbar).

### Administrative Distanz (Cisco)
| Quelle | AD |
|---|---|
| Connected | 0 |
| Static | 1 |
| eBGP | 20 |
| EIGRP (intern) | 90 |
| **OSPF** | **110** |
| IS-IS | 115 |
| RIP | 120 |
| EIGRP (extern) | 170 |
| iBGP | 200 |
| unerreichbar | 255 |

### Metriken
RIP: Hop-Count (max. 15). OSPF: Cost (Referenzbandbreite 100 Mbit/s ÷ Link-Bandbreite). EIGRP: Bandbreite + Delay (Composite).

### Statisch vs. dynamisch
Statisch: einfach, kein Overhead, aber nicht skalierbar und keine automatische Reaktion auf Ausfälle. Dynamisch: IGP (intern: **OSPF**, EIGRP, RIP, IS-IS) und EGP (extern: **BGP**). **Distance Vector** (RIP, EIGRP): Tabellen der Nachbarn; **Link State** (OSPF, IS-IS): jeder Router kennt die ganze Topologie und rechnet mit Dijkstra (SPF).

### Gateway of Last Resort
Die Default-Route 0.0.0.0/0 wird genutzt, wenn nichts Spezifischeres passt; Anzeige in `show ip route` als „Gateway of last resort is …“.

## Einfach

Ein Router ist wie ein **Postbote an einer Kreuzung**. Auf dem Brief steht nur das Ziel (die Ziel-IP-Adresse). Der Postbote hat ein **Notizbuch (Routingtabelle)**: „Briefe nach Hamburg → Straße Nord. Briefe nach München → Straße Süd. Alles andere → Autobahn Richtung Ausland (Default-Route).“

Bevor ein Computer überhaupt zum Postbote geht, fragt er sich: „Wohnt der Empfänger in meiner eigenen Straße?“ Er vergleicht dazu den Anfang seiner Adresse mit dem Anfang der Zielada­resse (das macht die Subnetzmaske). Wenn die Straße gleich ist, bringt er den Brief selbst hin. Wenn nicht, gibt er ihn dem **Standardgateway** – dem Postbote seiner Straße.

Wenn im Notizbuch mehrere Einträge passen, gilt:
1. **Der genaueste Eintrag gewinnt** („Hausnummer 5 in der Dorfstraße“ schlägt „irgendwo im Dorf“). Das ist der längste Präfix.
2. Sagen zwei Quellen etwas Gleich-Genaues, vertraut der Postbote der **zuverlässigeren**: Selbst eingetragenes (statisch, AD 1) vor OSPF (110) vor RIP (120). Je kleiner die Zahl, desto mehr Vertrauen.
3. Wenn auch das gleich ist, nimmt er den **kürzeren Weg** (kleinste Metrik).

Wichtig: Der Brief behält seine Adresse bis zum Ziel; nur der „Umschlag“ (die MAC-Adresse) wird bei jeder Station neu beschriftet.

## Merksatz
- **1. Längster Präfix, 2. kleinste AD, 3. kleinste Metrik.**
- **AD: C0 – S1 – eBGP 20 – EIGRP 90 – OSPF 110 – RIP 120.**
- **IP bleibt, MAC wechselt pro Hop; TTL −1.**
- **C = connected, L = local /32, S = static, O = OSPF.**
- **Link State = Karte der Topologie, Distance Vector = Gerüchte der Nachbarn.**

## Prüfungsfalle
- Die **AD gilt zwischen Protokollen**, die Metrik **innerhalb** eines Protokolls – nie Metriken verschiedener Protokolle vergleichen.
- **Längster Präfix schlägt AD**: Eine /24-OSPF-Route gewinnt gegen eine /16-statische Route für ein Ziel in der /24.
- Die **Default-Route** hat den kürzesten Präfix (/0) und wird zuletzt verwendet.
- Bei Windows `route -p` nicht vergessen, sonst ist die Route nach Neustart weg.
- Bei „Routing?“ nur die **Subnetzmaske des Absenders** nutzen.
- RIP-Metrik 16 = unerreichbar.
- Die Schulunterlage `05-routing.pdf` zeigt `route ADD 192.168.2.0 MASK 255.255.255.0 192.168.1.1` und beschreibt als Gateway „192.168.2.1“ – das ist ein Fehler: das Gateway ist 192.168.1.1 (Next-Hop im Netz des Senders).

## Grafik
### Paketweg über zwei Router
1. PC1 -> R1: Frame (Ziel-MAC = R1, Ziel-IP = PC2)
2. R1: Routingtabelle – längster Präfix, TTL 64 -> 63
3. R1 -> R2: neuer Frame (Ziel-MAC = R2)
4. R2: Netz direkt verbunden (C) – ARP für PC2
5. R2 -> PC2: Frame (Ziel-MAC = PC2), IP unverändert

### Routenauswahl
1. Text: Ziel 10.1.1.5 – Einträge: 10.0.0.0/8 (OSPF), 10.1.1.0/24 (static), 0.0.0.0/0
2. Text: /24 ist der längste passende Präfix – gewinnt
3. Text: bei zwei /24 gewinnt AD (Static 1 vor OSPF 110)

## Lab
**Packet Tracer: PC1 – R1 – R2 – PC2** (192.168.1.0/24, 10.0.0.0/30, 192.168.2.0/24)

### Cisco IOS
```
R1(config)# interface g0/0
R1(config-if)# ip address 192.168.1.1 255.255.255.0
R1(config-if)# no shutdown
R1(config-if)# interface g0/1
R1(config-if)# ip address 10.0.0.1 255.255.255.252
R1(config-if)# no shutdown
R1# show ip route
R1# show ip route 192.168.2.10
R1# show ip interface brief
```
1. Auf R1/R2 Interfaces konfigurieren – nur **C** und **L** erscheinen.
2. Ping PC1 → PC2 scheitert (keine Route) – Tabelle erklären.
3. Windows-Host: `route print`, `route add 192.168.2.0 mask 255.255.255.0 192.168.1.1 -p`, `tracert 192.168.2.10`.

## Befehle
- `show ip route` – Routingtabelle
- `show ip route 192.168.2.10` – Eintrag für ein Ziel
- `show ip route static` – nur statische Routen
- `route print` / `ip route` – Hostroutingtabelle
- `traceroute` / `tracert` – Hop-by-Hop-Pfad
- `ip route 0.0.0.0 0.0.0.0 10.0.0.2` – Default-Route

## Übungen
- A: Quelle 192.168.12.121/24, Ziel 192.168.12.196 – Routing nötig? | L: Nein, gleiches Netz 192.168.12.0/24.
- A: Quelle 192.168.27.221/24, Ziel 192.168.12.196 – Routing? | L: Ja, Netz-IDs verschieden → Standardgateway.
- A: Welche Route wird für 172.16.5.9 gewählt: 172.16.0.0/16 (OSPF), 172.16.5.0/24 (RIP), 0.0.0.0/0? | L: 172.16.5.0/24 (längster Präfix), obwohl RIP unzuverlässiger ist.
- A: Zwei Routen zum selben /24: Static (AD 1) und OSPF (AD 110) – welche? | L: Static.
- A: Was ändert sich pro Hop im Paket? | L: MAC-Adressen (Layer 2) und TTL; IP-Adressen bleiben.
- A: Windows: Standardgateway per route setzen. | L: route ADD 0.0.0.0 MASK 0.0.0.0 192.168.1.1 -p

## Karteikarten
- F: Auf welcher OSI-Schicht arbeitet ein Router? | A: Layer 3.
- F: Was gewinnt zuerst bei der Routenwahl? | A: Der längste Präfix.
- F: AD von Static / OSPF / RIP? | A: 1 / 110 / 120.
- F: AD von Connected? | A: 0.
- F: Was ist die Default-Route? | A: 0.0.0.0/0, Ziel, wenn nichts Spezifischeres passt.
- F: Was bedeutet L in der Routingtabelle? | A: Local – eigene Interface-IP als /32.
- F: OSPF-Metrik? | A: Cost, aus Bandbreite berechnet.
- F: RIP-Metrik? | A: Hop-Count, max. 15.
- F: Link State vs. Distance Vector? | A: Link State kennt die ganze Topologie (OSPF), Distance Vector nur Nachbar-Angaben (RIP).
- F: Was passiert bei TTL = 0? | A: Paket wird verworfen, ICMP Time Exceeded.

## Quiz
? Welche Regel hat bei der Routenwahl Vorrang?
* Längster Präfix
- Niedrigste AD
- Niedrigste Metrik
- Älteste Route
? Welche AD hat OSPF?
* 110
- 90
- 120
- 1
? Welche AD haben statische Routen?
* 1
- 0
- 5
- 110
? Was ändert sich beim Routing in jedem Hop?
* Die MAC-Adressen
- Die Quell-IP
- Die Ziel-IP
- Die Portnummer
? Welcher Code steht für OSPF in show ip route?
* O
- S
- C
- L
? Wie sieht die Default-Route aus?
* 0.0.0.0/0
- 255.255.255.255/32
- 127.0.0.0/8
- 169.254.0.0/16
? Ist OSPF Distance Vector oder Link State?
* Link State
- Distance Vector
- Path Vector
- Hybrid
? Was zeigt L in der Routingtabelle?
* Die eigene Interface-IP als /32
- Eine Loopback-Adresse /8
- Ein Link-Local-Netz
- Eine Load-Balancing-Route
? Maximale RIP-Hopzahl?
* 15
- 16
- 255
- 100
