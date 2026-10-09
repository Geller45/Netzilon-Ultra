---
id: ccna-vlsm
bereich: CCNA
block: CCNA 1.6
kapitel: Network Fundamentals
titel: VLSM – Subnetze unterschiedlicher Größe planen
stufe: Profi
fach: TCP/IP – CCNA – Basic
pruefungen: [CCNA, AP1, AP2]
quellen: [CCNA_200-301_Notes_-_Jeremys_IT_Lab.pdf, 05_Y_IPv4_4.pdf, 05_Y_IPv4_5.pdf]
verweise: [ccna-subnetting, ap1-a4-subnetting, netz-ipv4-uebung-4-5, ccna-statisches-routing]
---

## Profi

### FLSM vs. VLSM
- **FLSM** (Fixed-Length Subnet Masks): alle Subnetze gleich groß (z. B. /24 in vier /26). Einfach, aber verschwenderisch, wenn Netze unterschiedlich groß sind.
- **VLSM** (Variable-Length Subnet Masks): Subnetze **unterschiedlicher** Größe aus einem Block – effizient. Voraussetzung: **klassenloses** Routingprotokoll (OSPF, EIGRP, RIPv2 – nicht RIPv1).

### Vorgehen (immer gleich)
1. Anforderungen **absteigend nach Größe sortieren** (größtes Netz zuerst).
2. Für jedes Netz die **kleinste passende Blockgröße** bestimmen: Hosts + 2 ≤ 2^k (inklusive **Gateway-Adresse**, falls gefordert).
3. Das größte Netz beginnt an der **ersten freien Adresse** des Blocks.
4. Nächstes Netz beginnt **direkt nach dem Broadcast** des vorherigen (die Startadresse ist automatisch ein Vielfaches der Blockgröße, weil absteigend sortiert wird).
5. Punkt-zu-Punkt-Links (2 Hosts) als **/30** (oder /31) ans Ende.
6. Kontrolle: Summe der Blöcke ≤ Größe des Ausgangsblocks.

### Beispiel aus Jeremy's IT Lab: 192.168.1.0/24
Anforderungen: Tokyo LAN A 110 Hosts, Toronto LAN B 45, Toronto LAN A 29, Tokyo LAN B 8, P2P-Link 2.
| Netz | Hosts | Block | Präfix | Netz-ID | erster Host | letzter Host | Broadcast |
|---|---|---|---|---|---|---|---|
| Tokyo LAN A | 110 | 128 | /25 | 192.168.1.0 | .1 | .126 | .127 |
| Toronto LAN B | 45 | 64 | /26 | 192.168.1.128 | .129 | .190 | .191 |
| Toronto LAN A | 29 | 32 | /27 | 192.168.1.192 | .193 | .222 | .223 |
| Tokyo LAN B | 8 | 16 | /28 | 192.168.1.224 | .225 | .238 | .239 |
| P2P Tokyo–Toronto | 2 | 4 | /30 | 192.168.1.240 | .241 | .242 | .243 |
Frei bleibt 192.168.1.244–255 (für weitere /30 oder ein /29 bei .248).

### Beispiel IPv4 Teil 5, Aufgabe 4: 192.168.1.64/26 (64 Adressen)
Sortiert: Subnetz 1 (30 Hosts), Subnetz 3 (14), Subnetz 2 (6), Subnetz 4 (2).
| Subnetz | Hosts | Präfix | Netz | Broadcast | max. Hosts |
|---|---|---|---|---|---|
| 1 | 30 | /27 255.255.255.224 | 192.168.1.64 | 192.168.1.95 | 30 |
| 3 | 14 | /28 255.255.255.240 | 192.168.1.96 | 192.168.1.111 | 14 |
| 2 | 6 | /29 255.255.255.248 | 192.168.1.112 | 192.168.1.119 | 6 |
| 4 | 2 | /30 255.255.255.252 | 192.168.1.120 | 192.168.1.123 | 2 |
Belegung 32 + 16 + 8 + 4 = 60 von 64 → frei 192.168.1.124/30.

### Routen zusammenfassen (Summarization)
Nach VLSM lassen sich zusammenhängende Subnetze per **Supernetting** in **eine** Route fassen: gemeinsame Präfixbits zählen. Beispiel: 172.16.0.0/24 bis 172.16.3.0/24 → 172.16.0.0/**22**. Das spart Routingtabellen-Einträge (statisch oder bei OSPF an ABRs).

### Typische Fehler bei VLSM
- Nicht sortiert → Netze überlappen oder Startadresse ist kein Vielfaches der Blockgröße.
- Gateway/Router-Interface vergessen (zählt als Host).
- Netz- und Broadcastadresse mitgezählt.

## Einfach

Stell dir vor, du hast einen **Parkplatz mit 256 Plätzen** und musst ihn an verschiedene **Gruppen** verteilen: ein großer Bus braucht 110 Plätze, eine Schulklasse 45, ein Verein 29, eine Familie 8 und zwei Freunde 2.

Mit **FLSM** bekäme jeder gleich viel – z. B. 64 Plätze. Der Bus passt dann **nicht** hinein, und die zwei Freunde verschwenden 62 Plätze.

Mit **VLSM** bekommt jeder **genau so viel, wie er braucht** – aufgerundet auf die nächste „Parkplatzgröße“ (128, 64, 32, 16, 8, 4).

Der wichtigste Trick: **Immer die Größten zuerst einparken!** Erst kommt der Bus (128 Plätze, 0–127), dann die Klasse (64 Plätze, 128–191), dann der Verein (32, 192–223), dann die Familie (16, 224–239), dann die Freunde (4, 240–243). So passt alles **lückenlos** hintereinander, ohne dass sich jemand überschneidet.

Würdest du mit den Kleinen anfangen, wären die großen Lücken zerstückelt – wie wenn man zuerst überall Fahrräder hinstellt und der Bus dann keinen Platz mehr findet.

## Merksatz
- **Größtes zuerst – direkt hinter den Broadcast weiter.**
- **Hosts + 2 → nächste Zweierpotenz.**
- **P2P = /30 (oder /31) ans Ende.**
- **VLSM braucht klassenlose Routingprotokolle.**

## Prüfungsfalle
- Bei „40 Clients“ ist der Block **64** (/26), nicht 32 – 30 Hosts reichen nicht.
- Die Startadresse muss ein **Vielfaches der Blockgröße** sein: Ein /27 kann nicht bei .80 beginnen (80 ist kein Vielfaches von 32).
- RIPv1 unterstützt **kein** VLSM (sendet keine Masken).
- `05_Y_IPv4_4.pdf` Aufgabe 4: 2 × 60, 1 × 40, 1 × 28, 2 × 10 Clients füllen 194.100.10.0/24 **exakt** (64+64+64+32+16+16 = 256) – kein Platz für weitere Netze.

## Grafik
### VLSM-Parkplatz
1. Text: Block 192.168.1.0/24 als Balken mit 256 Feldern
2. Text: Tokyo A (110) erhält .0/25 – Balken halb gefüllt
3. Text: Toronto B (45) erhält .128/26
4. Text: Toronto A (29) erhält .192/27
5. Text: Tokyo B (8) erhält .224/28
6. Text: P2P-Link erhält .240/30 – Rest frei ab .244

### Routing über VLSM-Netze
1. PC1 -> R1: Paket aus Tokyo LAN A (.0/25) an Toronto LAN A (.192/27)
2. R1: Longest Prefix Match auf 192.168.1.192/27 via P2P
3. R1 -> R2: Über 192.168.1.240/30
4. R2 -> PC2: Zustellung ins Toronto LAN A

## Lab
**Packet Tracer: R1 (Tokyo) – R2 (Toronto) über /30, je zwei LANs nach obiger Tabelle**

### Cisco IOS
```
R1(config)# interface g0/0
R1(config-if)# ip address 192.168.1.1 255.255.255.128
R1(config-if)# no shutdown
R1(config-if)# interface g0/1
R1(config-if)# ip address 192.168.1.225 255.255.255.240
R1(config-if)# no shutdown
R1(config-if)# interface g0/2
R1(config-if)# ip address 192.168.1.241 255.255.255.252
R1(config-if)# no shutdown
R1(config-if)# exit
R1(config)# ip route 192.168.1.128 255.255.255.192 192.168.1.242
R1(config)# ip route 192.168.1.192 255.255.255.224 192.168.1.242
R2(config)# interface g0/0
R2(config-if)# ip address 192.168.1.129 255.255.255.192
R2(config-if)# no shutdown
R2(config-if)# interface g0/1
R2(config-if)# ip address 192.168.1.193 255.255.255.224
R2(config-if)# no shutdown
R2(config-if)# interface g0/2
R2(config-if)# ip address 192.168.1.242 255.255.255.252
R2(config-if)# no shutdown
R2(config-if)# exit
R2(config)# ip route 192.168.1.0 255.255.255.128 192.168.1.241
R2(config)# ip route 192.168.1.224 255.255.255.240 192.168.1.241
R1# show ip route
```
Prüfen: `ping` zwischen allen vier LANs.

## Befehle
- `ip address 192.168.1.241 255.255.255.252` – /30-Transfernetz
- `ip route 192.168.1.192 255.255.255.224 192.168.1.242` – statische Route zu VLSM-Netz
- `show ip route` – unterschiedliche Präfixlängen werden angezeigt („variably subnetted“)

## Übungen
- A: 192.168.1.0/24 – Netze für 110, 45, 29, 8 Hosts und einen P2P-Link | L: .0/25 (BC .127), .128/26 (BC .191), .192/27 (BC .223), .224/28 (BC .239), .240/30 (BC .243).
- A: 192.168.1.64/26 – Subnetz 1: 30 Hosts, 2: 6 Hosts, 3: 14 Hosts, 4: 2 Hosts | L: S1 .64/27 BC .95 (30 Hosts); S3 .96/28 BC .111 (14); S2 .112/29 BC .119 (6); S4 .120/30 BC .123 (2).
- A: 194.100.10.0/24 – 2 × 60, 1 × 40, 1 × 28, 2 × 10 Clients | L: .0/26, .64/26, .128/26 (40 → /26), .192/27, .224/28, .240/28.
- A: 10.20.0.0/22 – Netze für 500, 200, 100 Hosts | L: 500 → /23 10.20.0.0 (BC 10.20.1.255); 200 → /24 10.20.2.0 (BC .2.255); 100 → /25 10.20.3.0 (BC 10.20.3.127); frei 10.20.3.128/25.
- A: Fasse 172.16.4.0/24, 172.16.5.0/24, 172.16.6.0/24, 172.16.7.0/24 zusammen. | L: 172.16.4.0/22 (4 = 00000100, 7 = 00000111 → 6 gemeinsame Bits im 3. Oktett).

## Karteikarten
- F: Was ist VLSM? | A: Subnetze unterschiedlicher Größe aus einem Adressblock.
- F: Was ist FLSM? | A: Alle Subnetze haben die gleiche Maske.
- F: In welcher Reihenfolge plant man VLSM? | A: Vom größten zum kleinsten Netz.
- F: Welches Präfix für 45 Hosts? | A: /26 (62 Hosts).
- F: Welches Präfix für 8 Hosts? | A: /28 (14 Hosts) – /29 hätte nur 6.
- F: Welches Präfix für einen Router-Router-Link? | A: /30 (oder /31).
- F: Welche Routingprotokolle unterstützen VLSM? | A: Klassenlose: OSPF, EIGRP, RIPv2, IS-IS, BGP (nicht RIPv1).
- F: Wo beginnt das nächste VLSM-Subnetz? | A: Direkt nach der Broadcastadresse des vorherigen.
- F: Was ist Route Summarization? | A: Zusammenfassen mehrerer Subnetze zu einer Route mit kürzerem Präfix.
- F: Wie viele Adressen belegen /27 + /28 + /29 + /30? | A: 32 + 16 + 8 + 4 = 60.

## Quiz
? Warum wird bei VLSM mit dem größten Netz begonnen?
* Damit jede Netzadresse ein Vielfaches ihrer Blockgröße ist und nichts überlappt
- Weil Router große Netze bevorzugen
- Weil kleine Netze kein Gateway brauchen
- Weil sonst die Broadcastadresse fehlt

? Welches Präfix bekommt ein Netz mit 110 Hosts?
* /25
- /26
- /24
- /27

? Welches Routingprotokoll unterstützt kein VLSM?
* RIPv1
- OSPFv2
- EIGRP
- RIPv2

? 192.168.1.64/26: Subnetz mit 30 Hosts als erstes. Wo beginnt das nächste Subnetz?
* 192.168.1.96
- 192.168.1.95
- 192.168.1.94
- 192.168.1.128

? Welche Zusammenfassung umfasst 10.1.0.0/24 bis 10.1.3.0/24 exakt?
* 10.1.0.0/22
- 10.1.0.0/23
- 10.1.0.0/21
- 10.1.0.0/16

? Wie viele Adressen hat ein /29-Block?
* 8
- 6
- 16
- 4

? Welches Netz eignet sich für einen Punkt-zu-Punkt-Link mit minimaler Verschwendung?
* /30 oder /31
- /29
- /28
- /24

? 40 Clients – welche Maske?
* 255.255.255.192
- 255.255.255.224
- 255.255.255.240
- 255.255.255.128

## Reihenfolge
### VLSM-Planung
1. Anforderungen absteigend sortieren
2. Je Netz Hosts + 2 auf Zweierpotenz runden
3. Größtes Netz an den Blockanfang
4. Folgenetze direkt nach dem Broadcast anfügen
5. Transfernetze /30 ans Ende
6. Rest prüfen und dokumentieren

## Freitext
- F: Erläutern Sie den Vorteil von VLSM gegenüber FLSM an einem Beispiel. | M: VLSM vergibt jedem Netz nur die nötige Blockgröße (z. B. /30 für einen Router-Link statt /26), dadurch weniger Adressverschwendung und mehr freie Netze; FLSM gibt allen Netzen die gleiche Größe. | P: 3

## Spickzettel
- Sortieren groß → klein, Block = 2^k ≥ Hosts + 2
- Nächstes Netz = vorheriger Broadcast + 1
- P2P /30 (/31), Rest dokumentieren
- 110 → /25 · 45 → /26 · 29 → /27 · 8 → /28 · 6 → /29 · 2 → /30
- Summarization: gemeinsame Bits zählen
