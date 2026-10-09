---
id: ccna-switching-mac-arp
bereich: CCNA
block: CCNA 1.13
kapitel: Network Fundamentals
titel: Switching – Ethernet-Frame, MAC-Lernen, Aging, Flooding, ARP
stufe: Einsteiger
fach: TCP/IP – CCNA – Basic
pruefungen: [CCNA, AP1]
quellen: [CCNA_200-301_Notes_-_Jeremys_IT_Lab.pdf, 200-301.pdf, cisco_100-101.pdf, MAC.md, Switchin-Internet.md, Frame-Types.md, OSI 2.md, CSMA-CD.md]
verweise: [netz-ethernet-csma-cd-frame, ap1-a4-topologie, ccna-vlan, ccna-stp, ccna-dhcp-snooping-dai]
---

## Profi

### Ethernet-II-Frame
| Feld | Länge | Inhalt |
|---|---|---|
| Präambel | 7 Byte | 10101010 × 7 – Taktsynchronisation |
| SFD (Start Frame Delimiter) | 1 Byte | 10101011 – Ende der Präambel |
| **Ziel-MAC** | 6 Byte | Empfänger (steht **vor** der Quell-MAC) |
| **Quell-MAC** | 6 Byte | Absender |
| **Type/Length** | 2 Byte | ≤ 1500 = Länge, ≥ 1536 (0x0600) = **EtherType**: **0x0800 IPv4**, **0x86DD IPv6**, **0x0806 ARP**, 0x8100 = 802.1Q-Tag |
| Nutzdaten (Payload) | **46–1500 Byte** | Paket; kürzer als 46 → **Padding** |
| **FCS** | 4 Byte | CRC-32 zur Fehlererkennung |
Header + Trailer = **18 Byte** (ohne Präambel/SFD). Frame-Größe **64–1518 Byte** (mit 802.1Q 1522). Mindestgröße 64 Byte, damit Kollisionen bei CSMA/CD noch während des Sendens erkannt werden.

### MAC-Adresse
- **48 Bit = 6 Byte**, 12 Hex-Ziffern, Schreibweisen: `E8-BA-70-11-28-74`, `E8:BA:70:11:28:74`, Cisco: `e8ba.7011.2874`.
- Erste 3 Byte: **OUI** (Organizationally Unique Identifier, von der IEEE an den Hersteller vergeben); letzte 3 Byte: vom Hersteller vergeben (geräteeindeutig). Auch **BIA** (Burned-In Address).
- **Bit 0 des ersten Bytes (I/G-Bit)**: 0 = Unicast, 1 = Multicast/Gruppe (z. B. `01:00:5E:…` IPv4-Multicast, `01:80:C2:00:00:00` STP).
- **Bit 1 des ersten Bytes (U/L-Bit)**: 0 = universell (UAA), 1 = lokal administriert (LAA).
- **Broadcast**: `FF:FF:FF:FF:FF:FF` (Cisco `ffff.ffff.ffff`).

### Wie ein Switch arbeitet
1. **Learning (MAC-Lernen)**: Bei jedem eingehenden Frame trägt der Switch die **Quell-MAC + Eingangsport (+ VLAN)** in die **MAC-Adresstabelle** (CAM-Tabelle) ein. Standardmäßig auf allen Ports und VLANs aktiv.
2. **Forwarding**: Ist die **Ziel-MAC bekannt** (Known Unicast), wird der Frame **nur** über den eingetragenen Port gesendet.
3. **Flooding**: **Unbekannte Unicasts**, **Broadcasts** und (ohne IGMP Snooping) **Multicasts** werden an **alle Ports außer dem Eingangsport** (im selben VLAN) gesendet.
4. **Filtering**: Liegt das Ziel am **selben Port**, wird der Frame verworfen.
5. **Aging**: Dynamische Einträge werden nach **300 Sekunden (5 min) Inaktivität** gelöscht (`mac address-table aging-time`).
Wandert ein Gerät an einen anderen Port, aktualisiert der Switch den Eintrag. Springt eine MAC ständig zwischen Ports → **MAC-Flapping** (Hinweis auf Schleife).

Switching-Methoden: **Store-and-Forward** (ganzen Frame lesen, FCS prüfen – Standard bei Catalyst), **Cut-Through** (nach Ziel-MAC weiterleiten), **Fragment-Free** (nach 64 Byte).

### ARP (Address Resolution Protocol)
ARP ermittelt zur bekannten **IPv4-Adresse** die **MAC-Adresse** (nur im eigenen Subnetz; für fremde Netze die MAC des Gateways).
| Nachricht | Ziel-MAC | Inhalt |
|---|---|---|
| **ARP Request** | **Broadcast** ffff.ffff.ffff | Quell-IP, Quell-MAC, Ziel-IP, Ziel-MAC 0000.0000.0000 |
| **ARP Reply** | **Unicast** an den Anfragenden | Quell-IP/-MAC des Gesuchten |
| **Gratuitous ARP** | Broadcast | unaufgeforderte Antwort (z. B. nach IP-Änderung, FHRP-Umschaltung) |
Einträge landen im **ARP-Cache** (Windows `arp -a`, Cisco `show arp`, Typ ARPA, Cisco-Timeout 4 Stunden, Windows wenige Minuten).

### ping
ICMP **Echo Request / Echo Reply** (Unicast). Cisco IOS sendet **5 Pakete à 100 Byte**; `!` = Antwort, `.` = Timeout, `U` = unreachable. Der **erste Ping schlägt oft fehl** (`.!!!!`), weil erst ARP aufgelöst werden muss.

### MAC-Tabelle bearbeiten
`show mac address-table`, `show mac address-table dynamic`, `clear mac address-table dynamic [address … | interface …]`, statischer Eintrag: `mac address-table static 0011.2233.4455 vlan 10 interface f0/5`.

## Einfach

Ein Switch ist wie ein **Hausmeister in einem Wohnblock**, der Pakete verteilt.

Am Anfang kennt er **niemanden**. Kommt ein Paket von Frau Müller aus Wohnung 3, merkt er sich: „**Müller wohnt in 3**.“ Das macht er bei jedem Paket – so füllt sich sein **Notizbuch** (die MAC-Tabelle).

Soll ein Paket an Herrn Schmidt, den er **noch nicht kennt**, klingelt er **bei allen** (außer bei dem, von dem das Paket kam) – das nennt man **Flooding**. Schmidt antwortet, und ab jetzt weiß der Hausmeister, wo er wohnt.

Meldet sich jemand **5 Minuten lang nicht**, streicht der Hausmeister ihn aus dem Notizbuch (**Aging**) – vielleicht ist er ja umgezogen.

**ARP** ist wie **Rufen im Treppenhaus**: Dein PC kennt nur die **Adresse auf dem Brief** (IP), aber nicht die **Wohnungsnummer** (MAC). Also ruft er laut für alle: „**Wer hat 192.168.1.1?**“ (Broadcast). Nur der Richtige antwortet leise direkt zurück: „Ich, Wohnung AA-BB-CC…“ (Unicast). Der PC schreibt es sich auf (ARP-Cache), damit er nicht jedes Mal rufen muss.

Darum klappt der **erste Ping** manchmal nicht: Während der PC noch ruft, ist das erste Paket schon zu spät.

## Merksatz
- **Quell-MAC lernen – Ziel-MAC suchen.**
- **Unbekannt oder Broadcast → fluten (außer Eingangsport).**
- **Aging = 300 s.**
- **ARP-Request Broadcast, ARP-Reply Unicast.**
- **0800 IPv4 · 86DD IPv6 · 0806 ARP · 8100 VLAN-Tag.**

## Prüfungsfalle
- Der Switch lernt aus der **Quell**-MAC, **nicht** aus der Ziel-MAC.
- Flooding geht an alle Ports **außer** dem Eingangsport – und nur im **gleichen VLAN**.
- MAC-Lernen ist **standardmäßig an** und **kein** Sicherheitsfeature (200-301 Frage 4/17: „associates the MAC address with the port on which it is received“).
- Die Demo-Frage 4 aus `200-301.pdf` gibt „enabled by default on all VLANs and interfaces“ als Lösung an – das stimmt, aber die Kernaussage von MAC-Learning ist die Zuordnung **Quell-MAC → Eingangsport** (Frage 17).
- Ethernet-Header **ohne** Präambel/SFD sind 14 Byte, mit FCS 18 Byte – Jeremys Kapitel 5 nennt „26 bytes“ inklusive Präambel und SFD.
- ARP gibt es nur bei **IPv4** – IPv6 nutzt **NDP** (Neighbor Solicitation/Advertisement).

## Grafik
### MAC-Lernen und Flooding
1. PC1 -> SW1: Frame an PC3 (Quell-MAC AAAA)
2. SW1: Lernt „AAAA an Fa0/1“
3. SW1 -> PC2: Ziel unbekannt – Flooding
4. SW1 -> PC3: Flooding
5. PC3 -> SW1: Antwort (Quell-MAC CCCC)
6. SW1: Lernt „CCCC an Fa0/3“
7. SW1 -> PC1: Known Unicast nur an Fa0/1

### ARP-Auflösung
1. PC1: Braucht MAC von 192.168.1.1
2. PC1 -> SW1: ARP-Request an ffff.ffff.ffff
3. SW1 -> R1: Broadcast an alle Ports
4. SW1 -> PC2: Broadcast (PC2 verwirft)
5. R1 -> PC1: ARP-Reply Unicast „1.1 ist 00d0.ba11.0001“
6. PC1: Eintrag im ARP-Cache

## Lab
**Packet Tracer: SW1 (2960) mit PC1 (Fa0/1, 10.0.0.1/24), PC2 (Fa0/2, .2), PC3 (Fa0/3, .3)**

### Cisco IOS
1. Auf SW1 die (leere) Tabelle ansehen, dann von PC1 `ping 10.0.0.3`.
```
SW1# show mac address-table
SW1# show mac address-table dynamic
SW1# show mac address-table aging-time
SW1# clear mac address-table dynamic
SW1# configure terminal
SW1(config)# mac address-table aging-time 600
SW1(config)# mac address-table static 0001.c7aa.0002 vlan 1 interface fastEthernet0/2
SW1(config)# end
```
2. PC1 (Windows-Eingabeaufforderung im PT): `arp -a`, `ping 10.0.0.3`, erneut `arp -a`.
3. Im Simulationsmodus prüfen: ARP-Request geht an alle, Reply nur zu PC1.

## Befehle
- `show mac address-table` – MAC-Tabelle (VLAN, MAC, Typ, Port)
- `clear mac address-table dynamic` – dynamische Einträge löschen
- `mac address-table aging-time 300` – Aging-Zeit setzen
- `show arp` – ARP-Tabelle (Router/L3-Switch)
- `arp -a` – ARP-Cache unter Windows anzeigen
- `arp -d *` – ARP-Cache unter Windows leeren
- `ip neigh` – Linux-Nachbartabelle (ARP/NDP)
- `ping 10.0.0.3` – ICMP-Echo, Cisco: 5 × 100 Byte

## Übungen
- A: PC1 (Fa0/1) sendet an PC4, der Switch kennt PC4 nicht. Was passiert? | L: SW lernt PC1 an Fa0/1 und flutet den Frame an alle anderen Ports im VLAN.
- A: Welcher EtherType steht in einem Frame mit IPv6-Paket? | L: 0x86DD.
- A: Ein Frame hat 40 Byte Nutzdaten. Was passiert? | L: Es werden 6 Byte Padding angefügt (Minimum 46 Byte Payload, 64 Byte Frame).
- A: Warum ist der erste Ping oft `.!!!!`? | L: Das erste Echo Request geht verloren/zu spät, weil zuerst per ARP die MAC aufgelöst werden muss.
- A: Gib OUI und Gerätekennung von E8:BA:70:11:28:74 an. | L: OUI E8:BA:70, Gerät 11:28:74.

## Karteikarten
- F: Wie lang ist eine MAC-Adresse? | A: 48 Bit = 6 Byte (12 Hex-Ziffern).
- F: Was ist die OUI? | A: Die ersten 3 Byte der MAC – Herstellerkennung, von der IEEE vergeben.
- F: Woraus lernt ein Switch MAC-Adressen? | A: Aus der Quell-MAC eingehender Frames (mit Eingangsport und VLAN).
- F: Was macht ein Switch mit einem unbekannten Unicast? | A: Er flutet ihn an alle Ports außer dem Eingangsport (im VLAN).
- F: Nach welcher Zeit altern dynamische MAC-Einträge? | A: Nach 300 Sekunden Inaktivität.
- F: Ziel-MAC eines ARP-Requests? | A: Broadcast ffff.ffff.ffff.
- F: Ist ein ARP-Reply Broadcast oder Unicast? | A: Unicast (an den Anfragenden).
- F: EtherType für IPv4, IPv6 und ARP? | A: 0x0800, 0x86DD, 0x0806.
- F: Minimale und maximale Ethernet-Frame-Größe? | A: 64 Byte und 1518 Byte (1522 mit 802.1Q).
- F: Was ist ein Gratuitous ARP? | A: Ein ARP-Reply ohne vorherige Anfrage, per Broadcast gesendet.
- F: Was bedeutet MAC-Flapping? | A: Dieselbe MAC wird ständig an verschiedenen Ports gelernt – Hinweis auf eine Layer-2-Schleife.

## Quiz
? Wie funktioniert MAC-Learning?
* Der Switch ordnet die Quell-MAC dem Port zu, auf dem der Frame empfangen wurde
- Der Switch verwirft MAC-Adressen, die nicht in der Tabelle stehen
- Der Switch erlaubt maximal 10 gelernte Adressen pro Port
- Der Switch lernt die Ziel-MAC jedes Frames
@ 200-301.pdf Question 17

? Was macht ein Switch mit einem Broadcast-Frame?
* Er sendet ihn an alle Ports im VLAN außer dem Eingangsport
- Er verwirft ihn
- Er sendet ihn nur an den Router
- Er sendet ihn an alle Ports inklusive Eingangsport

? Welche Ziel-MAC hat ein ARP-Request?
* ffff.ffff.ffff
- 0000.0000.0000
- 0100.5e00.0001
- Die MAC des Gateways

? Welcher EtherType kennzeichnet ARP?
* 0x0806
- 0x0800
- 0x86DD
- 0x8100

? Wie lange bleibt ein dynamischer MAC-Eintrag standardmäßig ohne Verkehr erhalten?
* 300 Sekunden
- 30 Sekunden
- 4 Stunden
- Unbegrenzt

? Welches Feld des Ethernet-Frames dient der Fehlererkennung?
* FCS
- SFD
- Präambel
- Type

? Was ist ein Merkmal eines Layer-2-Switches?
* Er nutzt die Sicherungsschicht für die Kommunikation
- Er nutzt Router, um Kollisionsdomänen zu bilden
- Er sendet Daten in einer bestimmten Reihenfolge
- Er verzichtet auf MAC-Speicherung für schnellere Übertragung
@ 200-301.pdf Question 2

? Welche Aussage zur MAC-Adresse stimmt?
* Die ersten 24 Bit sind die OUI des Herstellers
- Sie ist 32 Bit lang
- Sie wird vom DHCP-Server vergeben
- Sie bleibt im Frame über alle Router-Hops gleich

## Lücken
- Ein Switch lernt anhand der {Quell}-MAC-Adresse.
- Unbekannte Unicasts werden {geflutet}.
- Die Nutzdaten eines Ethernet-Frames sind mindestens {46} Byte groß.
- Ein ARP-Reply wird als {Unicast} gesendet.

## Spickzettel
- Frame: Präambel 7 · SFD 1 · Ziel 6 · Quelle 6 · Type 2 · Daten 46–1500 · FCS 4
- 64–1518 Byte (1522 mit Tag)
- Learn Quelle · Forward bekannt · Flood unbekannt/Broadcast · Aging 300 s
- MAC 48 Bit = OUI 24 + Gerät 24, Broadcast ffff.ffff.ffff
- ARP Request = Broadcast, Reply = Unicast
