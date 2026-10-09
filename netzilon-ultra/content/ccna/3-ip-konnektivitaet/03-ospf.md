---
id: ccna-ospf
bereich: CCNA
block: CCNA 3.4
kapitel: IP Connectivity
titel: OSPFv2 – Nachbarn, DR/BDR, Cost, Single-Area-Konfiguration
stufe: Profi
fach: TCP/IP – CCNA – Basic
pruefungen: [CCNA, AP2]
quellen: [CCNA_200-301_Notes_-_Jeremys_IT_Lab.pdf, 200_301_CCNA_v1.0_2.pdf, 05-routing.pdf]
verweise: [ccna-routing-grundlagen, ccna-statisches-routing, ccna-fhrp, ccna-subnetting]
---

## Profi

### Eigenschaften
**OSPF** (Open Shortest Path First, RFC 2328 v2 für IPv4, OSPFv3 für IPv6) ist ein **Link-State-IGP**: jeder Router baut aus **LSAs** (Link State Advertisements) eine identische **Link-State-Datenbank (LSDB)** und berechnet mit dem **SPF-Algorithmus (Dijkstra)** den kürzesten Pfad. Eigenschaften: klassenlos (VLSM/CIDR), schnelle Konvergenz, **Multicast** 224.0.0.5 (AllSPFRouters) und 224.0.0.6 (AllDRouters), **IP-Protokoll 89**, **AD 110**, Metrik **Cost**.

### Cost
`Cost = Referenzbandbreite / Interfacebandbreite`. Standardreferenz **100 Mbit/s**: FastEthernet = 1, Ethernet 10 = 10, Serial T1 (1,544 Mbit/s) = 64; **Gigabit und schneller = 1** (daher Referenz anpassen: `auto-cost reference-bandwidth 100000` auf **allen** Routern). Pfadkosten = Summe der Kosten aller ausgehenden Interfaces. Manuell: `ip ospf cost 10` oder `bandwidth`.

### Nachbarschaftsaufbau (Zustände)
**Down → Init → 2-Way → ExStart → Exchange → Loading → Full.**
1. Hello (Multicast 224.0.0.5) – Router-ID, Area, Timer.
2. In 2-Way sehen sich beide; auf Broadcast-Netzen wird **DR/BDR** gewählt.
3. DBD-Austausch, LSR/LSU-Anforderung und -Übermittlung.
4. **Full** mit DR/BDR (bei Multi-Access) bzw. mit dem direkten Nachbarn (Punkt-zu-Punkt); andere Router bleiben in **2-Way**.
**Übereinstimmen müssen**: Area-ID, Subnetz/Maske, **Hello-/Dead-Timer** (Standard 10/40 s Broadcast und P2P; 30/120 s NBMA), Authentifizierung, Stub-Flags, MTU (für Full). **Router-IDs müssen eindeutig sein.**

### Router-ID
Reihenfolge: manuell (`router-id 1.1.1.1`) → höchste Loopback-IP → höchste aktive Interface-IP. Änderung erst nach `clear ip ospf process`.

### DR/BDR
In Broadcast-Segmenten (Ethernet) wählen die Router **DR** (Designated Router) und **BDR**: höchste **OSPF-Priorität** (Standard 1, 0 = nie DR), bei Gleichstand höchste Router-ID. Wahl ist **nicht präemptiv**. Router sprechen LSAs nur mit DR/BDR (224.0.0.6). Point-to-point (`ip ospf network point-to-point`) braucht keine Wahl – schneller.

### Areas
Backbone **Area 0**; alle anderen Areas müssen an Area 0 hängen. Single-Area reicht für die CCNA-Konfiguration. Rollen: **ABR** (zwischen Areas), **ASBR** (Redistribution). LSA-Typen 1–5 grob: Router, Network, Summary, ASBR-Summary, External.

### Konfiguration
```
router ospf 1
 router-id 1.1.1.1
 network 192.168.1.0 0.0.0.255 area 0
 passive-interface g0/0
 default-information originate
```
oder interfacebasiert: `interface g0/1` / `ip ospf 1 area 0`. **Wildcard-Maske** (Invers der Subnetzmaske). `passive-interface` unterdrückt Hellos zu Endnutzernetzen (Netz bleibt in OSPF). `default-information originate` verteilt die Default-Route.

### Kontrolle
`show ip ospf neighbor`, `show ip route ospf`, `show ip ospf interface brief`, `show ip protocols`, `show ip ospf database`.

## Einfach

Stell dir vor, jede Stadt (Router) hat einen **Stadtplan mit allen Straßen und Entfernungen im ganzen Land**. Alle Städte tauschen untereinander aus, welche Straßen sie haben – und am Ende besitzt jede dieselbe Landkarte. Dann rechnet jede Stadt für sich aus: „Was ist von mir aus der kürzeste Weg zu jeder anderen Stadt?“ Das ist **OSPF**. Es heißt „Open Shortest Path First“ – zuerst der kürzeste Weg.

Wie wird „kurz“ gemessen? Mit **Kosten**: schnelle Straßen kosten wenig, langsame viel. Eine Autobahn (Gigabit) kostet nur 1, ein Feldweg (Serial) viel mehr. Der Weg mit den kleinsten Gesamtkosten gewinnt.

Bevor zwei Städte Karten tauschen, müssen sie sich erst **kennenlernen**: Sie rufen „Hallo!“ (Hello-Pakete) alle 10 Sekunden. Beide müssen die gleichen Spielregeln haben (gleiche Area, gleiche Timer, gleiches Netz), sonst ignorieren sie sich. Wenn in einem Raum viele Router sind (z. B. an einem Switch), wählen sie einen **Sprecher (DR)** und einen **Stellvertreter (BDR)**. Nur der Sprecher redet mit allen, damit nicht alle durcheinanderreden. Die Gewinner sind die mit der höchsten Priorität, bei Gleichstand mit der höchsten Router-ID.

Du sagst dem Router nur: „Welche meiner Netze sollen mitmachen?“ (`network`-Befehl) – den Rest erledigt er selbst. Fällt eine Leitung aus, rechnen alle in Sekunden einen neuen Weg aus.

## Merksatz
- **OSPF = Link State, AD 110, Cost = 100 Mbit/s ÷ Bandbreite.**
- **Zustände: Down – Init – 2-Way – ExStart – Exchange – Loading – Full.**
- **Hello 10 s / Dead 40 s – müssen übereinstimmen.**
- **DR/BDR: Priorität, dann Router-ID, nicht präemptiv.**
- **Multicast 224.0.0.5 (alle), 224.0.0.6 (DR/BDR).**
- **`network` nutzt WILDCARD, nicht Subnetzmaske.**

## Prüfungsfalle
- **Gigabit = Cost 1 = FastEthernet** – ohne Anpassung der Referenzbandbreite wählt OSPF falsch.
- In einem Broadcast-Segment bleiben Nicht-DR-Router untereinander in **2-Way** (das ist normal, nicht Fehler).
- Der `network`-Befehl gibt an, **welche Interfaces** teilnehmen, nicht welche Netze „angekündigt“ werden (indirekt schon, das Interface-Netz).
- **Wildcard:** /24 = 0.0.0.255, /30 = 0.0.0.3.
- Priorität 0 = nie DR. Eine neue Wahl erfordert Reset von OSPF (`clear ip ospf process`) oder Neustart der Interfaces.
- Router-ID ist **keine** erreichbare IP, nur eine ID (aber besser: Loopback).
- Gleiche Router-ID bei zwei Routern verhindert Nachbarschaft/Verhalten ist undefiniert.

## Grafik
### Nachbarschaft
1. R1 -> R2: Hello (224.0.0.5), Router-ID 1.1.1.1 – Zustand Init
2. R2 -> R1: Hello mit Nachbar 1.1.1.1 – Zustand 2-Way
3. R1 -> R2: DBD (Datenbank-Beschreibung) – ExStart/Exchange
4. R2 -> R1: LSR (fehlende LSAs anfordern) – Loading
5. R1 -> R2: LSU (LSAs) – beide Full
6. Text: Beide berechnen SPF und tragen O-Routen ein

### DR-Wahl
1. R1: Priorität 1, ID 1.1.1.1
2. R2: Priorität 1, ID 2.2.2.2
3. R3: Priorität 100, ID 3.3.3.3
4. Text: R3 wird DR (Priorität), R2 BDR (höhere ID), R1 DROTHER

## Lab
**Packet Tracer: R1 – R2 – R3 im Dreieck, an R1 und R3 je ein LAN**

### Cisco IOS
```
R1(config)# router ospf 1
R1(config-router)# router-id 1.1.1.1
R1(config-router)# network 10.0.12.0 0.0.0.3 area 0
R1(config-router)# network 192.168.1.0 0.0.0.255 area 0
R1(config-router)# passive-interface g0/0
R1(config-router)# auto-cost reference-bandwidth 1000
R3(config)# router ospf 1
R3(config-router)# router-id 3.3.3.3
R3(config-router)# network 10.0.13.0 0.0.0.3 area 0
R3(config-router)# network 192.168.3.0 0.0.0.255 area 0
R1# show ip ospf neighbor
R1# show ip route ospf
R1# show ip ospf interface brief
```
1. Kosten ablesen (Cost je Interface) und Pfad R1→LAN3 erklären.
2. Link R1–R3 trennen: neuer Pfad über R2 sichtbar.
3. Fehler einbauen: Hello-Timer ungleich → Nachbarschaft bricht (Logmeldung).

## Befehle
- `router ospf 1` – Prozess starten
- `network 10.0.0.0 0.0.0.3 area 0` – Interface einbinden
- `ip ospf 1 area 0` – Interface-Variante
- `passive-interface g0/0` – keine Hellos
- `show ip ospf neighbor` – Nachbarn (State FULL/DR)
- `show ip route ospf` – O-Routen
- `ip ospf priority 0` – nie DR
- `auto-cost reference-bandwidth 100000` – Referenzbandbreite (Mbit/s)

## Übungen
- A: Cost eines GigabitEthernet-Interface bei Standardreferenz? | L: 1 (100/1000 gerundet auf 1).
- A: Cost eines FastEthernet-Link? | L: 1.
- A: Wildcard-Maske für 10.0.12.0/30? | L: 0.0.0.3.
- A: Zwei Router bleiben in Init/2-Way. Drei mögliche Ursachen? | L: Andere Area, ungleiche Hello-/Dead-Timer, unterschiedliche Subnetzmaske; auch ACL, Authentifizierung.
- A: Wie wird ein Router garantiert nie DR? | L: ip ospf priority 0
- A: Welche Router-ID entsteht ohne manuelle Eingabe, wenn Loopback0 = 1.1.1.1 und g0/0 = 192.168.1.1? | L: 1.1.1.1 (höchste Loopback hat Vorrang vor Interface-IPs).
- A: Wie verteilt man die Default-Route per OSPF? | L: default-information originate

## Karteikarten
- F: OSPF-Typ? | A: Link-State-IGP.
- F: OSPF-AD? | A: 110.
- F: OSPF-Metrik? | A: Cost (Referenzbandbreite / Bandbreite).
- F: Standardreferenzbandbreite? | A: 100 Mbit/s.
- F: Multicast-Adressen? | A: 224.0.0.5 (AllSPFRouters), 224.0.0.6 (AllDRouters).
- F: Hello/Dead-Timer? | A: 10 s / 40 s (Broadcast, P2P).
- F: Zustand vollständiger Nachbarschaft? | A: Full.
- F: Wie wird der DR gewählt? | A: Höchste Priorität, dann höchste Router-ID; nicht präemptiv.
- F: Welche Area muss existieren? | A: Area 0 (Backbone).
- F: Was bewirkt passive-interface? | A: Keine Hellos auf dem Interface, Netz bleibt in OSPF.
- F: Router-ID Reihenfolge? | A: Manuell, höchste Loopback, höchste aktive Interface-IP.

## Quiz
? Welche AD hat OSPF?
* 110
- 90
- 120
- 170
? Welche Multicast-Adresse nutzt OSPF für alle Router?
* 224.0.0.5
- 224.0.0.9
- 224.0.0.10
- 224.0.0.1
? Welcher Zustand bedeutet vollständige Synchronisation?
* Full
- 2-Way
- Init
- Loading
? Wie lautet die Wildcard für /26?
* 0.0.0.63
- 0.0.0.31
- 0.0.0.127
- 0.0.0.15
? Wer wird DR?
* Höchste Priorität, dann höchste Router-ID
- Der älteste Router
- Der mit der niedrigsten MAC
- Der mit den meisten Netzen
? Was gilt für die Backbone-Area?
* Area 0
- Area 1
- Area 255
- Area 10
? Welcher Befehl zeigt OSPF-Nachbarn?
* show ip ospf neighbor
- show ip protocols neighbors
- show ospf peers
- show ip route neighbors
? Cost eines Gigabit-Links bei Standardreferenz?
* 1
- 10
- 100
- 0
? Welcher Wert muss bei Nachbarn übereinstimmen?
* Hello- und Dead-Timer
- Router-ID
- Hostname
- OSPF-Prozess-ID
