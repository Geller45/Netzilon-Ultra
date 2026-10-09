---
id: ap1-aufg-event-gmbh
bereich: Prüfung
block: A13
kapitel: AP1-Aufgaben
titel: AP-Aufgabe „Event GmbH“ – VLAN, Subnetting, Routing, Diagnosetools
stufe: Fortgeschritten
typ: uebung
quellen: [Aufgaben10.pdf (Scan), Lösungen nachgerechnet]
verweise: [ap1-a4-vlan, ap1-a4-subnetting, ap1-a4-routing, ap1-a4-ipv4]
---

## Profi

### Ausgangslage
Ein Unternehmen betreibt drei Abteilungsnetze (**Verwaltung**, **Entwicklung**, **Management**) hinter einem **Layer-3-Core-Switch**. Der Core-Switch hängt über ein Übergangsnetz `172.16.31.0/30` an einem **Router/Firewall/VPN-Gateway** (WAN `80.90.100.2/30`, LAN `172.16.31.1/30`, Core-Switch Port 8 `172.16.31.2/30`). Im Netz `192.168.250.0/29` liegt die **DMZ** mit dem Webserver `192.168.250.1/29`. Die Fernwartung erfolgt durch die iKomP AG.

### Wichtige Einheitenhinweise (AP-typisch)
- Speicher: **MiB = 1024 · 1024 Byte**.
- Transferrate PCI: **MB/s = 1000 · 1000 Byte/s**.
- Ethernet/DSL: **Mbit/s = 1000 · 1000 bit/s**.

### Vorgehen bei Subnetting-Aufgaben mit Gateway
1. **Hostzahl + Gateway** zählen (Gateway braucht eine eigene Adresse).
2. Kleinste Blockgröße mit **2^n − 2 ≥ Hosts** wählen.
3. **Präfix = 32 − n**, Maske ableiten.
4. Gateway = **letzte nutzbare Adresse** (Broadcast − 1), wenn so vorgegeben.

## Einfach

Stell dir vor, die Firma hat **drei Flure** im Bürohaus: Verwaltung, Entwicklung, Management. Jeder Flur ist ein **eigenes VLAN**, damit die Leute nicht **alle durcheinanderrufen**. Der **Core-Switch** ist der **Pförtner**, der zwischen den Fluren vermittelt. Der **Router** ist die **Haupttür** nach draußen. Damit der Pförtner weiß, wohin er Post schicken soll, braucht er ein **Wegweiser-Buch** (Routingtabelle). Und damit er die Post für „alles andere“ auch loswird, braucht er einen **Eintrag „Rest → Haupttür“** (Default-Route).

Bei der **Subnetzgröße** kaufst du immer **nur so viele Zimmer wie nötig**: Für 54 Leute nimmst du kein Haus für 126, sondern eins für **62**.

## Merksatz
- **VLAN-Tag 802.1Q: 12 Bit VID → 4096 − 2 = 4094 nutzbare VLANs.**
- **Trunk** transportiert **mehrere VLANs** über **einen** Link.
- **Fehlende Default-Route** = Verkehr ins Internet stirbt am Core.
- **Route zu klein gewählt** (/19 statt /18) lässt ein Netz außerhalb.
- **MTU = Nutzlast + 28** (20 IP + 8 ICMP).

## Prüfungsfalle
- **Gateway** zählt als eigene Adresse: **54 Hosts + Gateway = 55 → trotzdem /26**, aber bei **62 Hosts** wäre /26 **zu klein**.
- **/19 endet bei 192.168.31.255**, nicht bei .255.255.
- **`ping -f -l`**: die **Größe** ist die **Nutzlast**, nicht die MTU.
- **DEI** und **PCP** gehören zur **TCI**, nicht zur TPID.

## Grafik
### Netzplan
Router mit Firewall-Symbol, Core-Switch mit drei VLAN-Farben, DMZ mit Webserver. Klick auf „Route prüfen“ zeigt das Paket vom Management-PC Richtung Internet und lässt es an der falschen /19-Route abprallen; mit /18 kommt es an.

### 802.1Q-Tag
Ein Ethernet-Rahmen, in den ein 4-Byte-Tag eingeschoben wird: TPID (16 Bit, 0x8100), PCP (3 Bit), DEI (1 Bit), VID (12 Bit).

## Übungen
- A: (1aa) Nenne zwei Gründe für den Einsatz von VLANs in dieser Firma (Abteilungen Verwaltung, Entwicklung, Management). | L: Trennung der Broadcastdomänen (weniger Last, bessere Leistung) und Sicherheit/Zugriffskontrolle zwischen Abteilungen; zusätzlich flexible Zuordnung unabhängig vom Standort.
- A: (1ab) Aus welchen Feldern besteht der 802.1Q-Tag, und wie viele VLANs sind nutzbar? | L: TPID 16 Bit (0x8100), TCI = PCP 3 Bit + DEI 1 Bit + VID 12 Bit; 2^12 = 4096 VLAN-IDs, davon 0 und 4095 reserviert, also 4094 nutzbar.
- A: (1ac) Warum muss zwischen Core-Switch und dem Arbeitsplatz-Switch (WS-03) getaggt werden? | L: Der Link ist ein Trunk und transportiert mehrere VLANs; nur über den Tag kann der Empfänger die Rahmen dem richtigen VLAN zuordnen.
- A: (1b) Verwaltung 192.168.10.0, 54 Hosts: Präfix, Maske, Gateway (letzte nutzbare IP)? | L: /26, 255.255.255.192 (62 Hosts), Gateway 192.168.10.62.
- A: (1b) Entwicklung 192.168.20.0, 28 Hosts: Präfix, Maske, Gateway? | L: /27, 255.255.255.224 (30 Hosts), Gateway 192.168.20.30.
- A: (1b) Management 192.168.40.0, 5 Hosts: Präfix, Maske, Gateway? | L: /29, 255.255.255.248 (6 Hosts), Gateway 192.168.40.6.
- A: (1ca) Die Routingtabelle des L3-Core-Switches enthält 172.16.31.0/30 (Fa0/8), 192.168.10.0/26 (Vlan10), 192.168.20.0/27 (Vlan20), 192.168.40.0/29 (Vlan199). Welcher Fehler verhindert Internetzugriff? | L: Es fehlt die Standardroute; nötig ist 0.0.0.0/0 über 172.16.31.1.
- A: (1cb) Router-Tabelle: 80.90.100.0/30 (Fa0/1), 172.16.31.0/30 (Fa0/0), 192.168.0.0/19 via 172.16.31.2, 192.168.250.0/29 (Fa1/0, DMZ), 0.0.0.0/0 via 80.90.100.1. Warum ist das Management-Netz nicht erreichbar? | L: 192.168.0.0/19 umfasst nur 192.168.0.0 bis 192.168.31.255, das Netz 192.168.40.0 liegt außerhalb. Lösung: /18 (bis 192.168.63.255) oder zusätzliche Route 192.168.40.0/29 via 172.16.31.2.
- A: (2a) Welches Werkzeug zeigt die MAC-Adresse des eigenen Rechners? | L: `ipconfig /all`.
- A: (2a) Welches Werkzeug zeigt die MAC-Adresse des Standardgateways? | L: `arp -a` (nach einem Ping zum Gateway).
- A: (2a) Welches Werkzeug ermittelt die IPv6-Adresse von www.ihk.de (AAAA)? | L: `nslookup` (Typ AAAA).
- A: (2a) Welches Werkzeug zeigt die Anzahl der Hops zu einem Ziel? | L: `tracert`.
- A: (2a) Wie prüft man die Erreichbarkeit fortlaufend? | L: `ping -t`.
- A: (2b) Wie ermittelt man die MTU, und welche MTU ergibt `ping -f -l 1472 www.future-gmbh.de` ohne Fragmentierungsmeldung? | L: `ping -f -l <Größe>` (Größe erhöhen, bis die Meldung „Paket muss fragmentiert werden“ erscheint); MTU = Nutzlast + 28 Byte = 1472 + 28 = 1500 Byte.

## Quiz
? Wie viele VLANs sind mit einer 12-Bit-VLAN-ID nutzbar?
* 4094
- 4096
- 1024
- 255

? Welche Präfixlänge braucht ein Netz mit 54 Hosts mindestens?
* /26
- /27
- /25
- /28

? Was fehlt, wenn ein Core-Switch nur Direktrouten hat und kein Internet erreicht?
* Die Standardroute 0.0.0.0/0
- Ein DHCP-Bereich
- Ein zweites VLAN
- Ein DNS-Eintrag

? Welchen Adressbereich deckt 192.168.0.0/19 ab?
* 192.168.0.0 bis 192.168.31.255
- 192.168.0.0 bis 192.168.63.255
- 192.168.0.0 bis 192.168.255.255
- 192.168.0.0 bis 192.168.15.255

? Wie berechnet sich die MTU aus dem größten unfragmentierten Ping?
* Nutzlast + 28 Byte
- Nutzlast + 14 Byte
- Nutzlast − 28 Byte
- Nutzlast × 8
