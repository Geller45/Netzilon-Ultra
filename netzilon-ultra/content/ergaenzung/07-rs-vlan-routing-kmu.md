---
id: erg-vlan-routing-kmu
bereich: AP1
block: ERG
kapitel: Ergänzungen 2.2
titel: Switching und Routing im KMU-Netz – VLAN, Trunk, Inter-VLAN-Routing, Default-Route und STP
stufe: Fortgeschritten
fach: TCP/IP – CCNA – Basic
pruefungen: [AP1, AP2, CCNA]
quellen: [IEEE 802.1Q, IEEE 802.1D/802.1w, Cisco IOS Configuration Guides, IHK-Prüfungsaufgaben Netzwerkplan]
verweise: [ap1-a4-vlan, ap1-a4-routing, ccna-vlan, ccna-trunk-intervlan, ccna-stp, ccna-statisches-routing, ref-cisco-ios, erg-ip-adressplanung]
---

## Profi

### Switching-Grundlagen
Ein **Switch** lernt die **Quell-MAC-Adressen** eingehender Frames und speichert sie mit dem Port in der **MAC-Adresstabelle** (CAM). Frames an bekannte Ziel-MACs werden gezielt weitergeleitet (**Forwarding**), an unbekannte, Broadcast- und (ohne IGMP-Snooping) Multicast-Adressen an alle Ports des VLANs außer dem Eingangsport (**Flooding**). Einträge verfallen nach einer Alterungszeit (Cisco Standard 300 s). Jeder Switchport ist eine eigene **Kollisionsdomäne**, jedes VLAN eine eigene **Broadcastdomäne**.

### VLANs nach IEEE 802.1Q
**VLANs** teilen einen physischen Switch in mehrere logische Netze. Vorteile: Trennung von Abteilungen/Gästen/VoIP (Sicherheit), kleinere Broadcastdomänen (Leistung), flexible Zuordnung unabhängig vom Standort.
- **Access-Port**: gehört zu genau einem VLAN, Frames **ohne Tag** (Endgeräte).
- **Trunk-Port**: transportiert mehrere VLANs, Frames erhalten einen **4-Byte-802.1Q-Tag** mit **12-Bit-VLAN-ID** (1–4094) und **3-Bit-Priorität (PCP/CoS)**. Das **Native VLAN** wird untagged übertragen (Standard VLAN 1 – aus Sicherheitsgründen ändern).
- **Voice-VLAN**: IP-Telefon und PC an einem Port, Telefon taggt seinen Verkehr.

### Inter-VLAN-Routing
Geräte verschiedener VLANs kommunizieren nur über **Schicht 3**:
1. **Router-on-a-Stick**: ein Router-Port als Trunk mit **Subinterfaces** (`interface g0/0.10`, `encapsulation dot1Q 10`, IP als Gateway).
2. **Layer-3-Switch** mit **SVIs** (`interface vlan 10`, `ip routing`) – schneller, Standard im Unternehmen.
3. Firewall mit VLAN-Schnittstellen – wenn zwischen VLANs gefiltert werden soll.

### Routing
Ein Router wählt die Route nach **längster Präfixübereinstimmung**, bei gleichem Präfix nach **administrativer Distanz** (direkt verbunden 0, statisch 1, OSPF 110, RIP 120), dann nach **Metrik**.
- **Statische Route**: `ip route 10.20.0.0 255.255.0.0 192.168.1.2`.
- **Default-Route** (Gateway of last resort): `ip route 0.0.0.0 0.0.0.0 <next-hop>` – alles Unbekannte Richtung Internet.
- **Dynamisch**: OSPF (Link-State, Kosten aus Bandbreite), RIP (Distance-Vector, Hops), BGP zwischen Providern.

### Redundanz und Schleifen
Redundante Verbindungen zwischen Switches erzeugen ohne Schutz **Broadcast-Stürme** und instabile MAC-Tabellen. Das **Spanning Tree Protocol** (STP, 802.1D; schneller **RSTP** 802.1w) wählt eine **Root Bridge** (niedrigste Bridge-ID = Priorität + MAC) und blockiert redundante Ports. **PortFast** an Endgeräte-Ports, **BPDU Guard** gegen fremde Switches. **Link Aggregation** (LACP, 802.3ad/802.1AX) bündelt Leitungen zu einem logischen Link.

## Einfach
Ein **Switch** ist wie ein Postverteiler in einem Bürogebäude. Er merkt sich, an welchem **Briefkasten (Port)** welcher Mitarbeiter (**MAC-Adresse**) sitzt. Kommt ein Brief für jemanden, den er noch nicht kennt, ruft er ihn in alle Briefkästen – das nennt man **Fluten**.

Mit **VLANs** teilst du das Gebäude in **Stockwerke**, obwohl alle am selben Verteiler hängen. Die Buchhaltung ist im 1. Stock, die Gäste im Erdgeschoss. Wer im Erdgeschoss ruft, wird oben nicht gehört. So sind die Gäste getrennt von den wichtigen Daten.

Zwischen zwei Switches läuft eine **Trunk-Leitung**. Damit der andere Switch weiß, für welches Stockwerk ein Brief ist, bekommt jeder Brief einen **Aufkleber mit der Stockwerksnummer** – den **VLAN-Tag**.

Wenn jemand aus dem Erdgeschoss etwas in den 1. Stock schicken darf, geht das nur über den **Router** – den Pförtner, der entscheidet, ob und wie der Brief weiterdarf. Der Router hat eine **Wegbeschreibung** (Routingtabelle). Für alles, was er nicht kennt, gibt es die Regel: „Schick es zum Hauptausgang“ – die **Default-Route** ins Internet.

Wenn man zwei Switches doppelt verbindet, damit nichts ausfällt, kann ein Brief im Kreis laufen – immer wieder, bis das Netz verstopft. **Spanning Tree** ist wie ein Verkehrspolizist, der eine der beiden Leitungen sperrt und sie erst öffnet, wenn die andere kaputt ist.

## Merksatz
- **Access = ein VLAN, untagged. Trunk = viele VLANs, tagged.**
- **VLAN-ID = 12 Bit → 1–4094.**
- **Zwischen VLANs nur über Schicht 3.**
- **Längstes Präfix gewinnt, dann AD, dann Metrik.**
- **Default-Route = 0.0.0.0/0.**
- **STP: kleinste Bridge-ID wird Root.**

## Prüfungsfalle
- Zwei PCs im **gleichen Subnetz, aber verschiedenen VLANs** können **nicht** miteinander kommunizieren.
- Das **Native VLAN** muss auf beiden Trunk-Seiten gleich sein, sonst „Native VLAN Mismatch“.
- Eine **Default-Route** ersetzt keine spezifischen Routen – längere Präfixe gewinnen immer.
- Ein Layer-3-Switch routet erst nach `ip routing`.
- STP-Blockierung ist **kein Fehler**, sondern Schleifenschutz.

## Grafik
### Inter-VLAN-Routing per Router-on-a-Stick
1. PC-Vertrieb -> Switch: Frame untagged an Access-Port VLAN 10
2. Switch -> Router: Frame mit Tag 10 über den Trunk
3. Router: Subinterface g0/0.10 empfängt, Routing ins Netz von VLAN 20
4. Router -> Switch: Frame mit Tag 20 über den Trunk
5. Switch -> PC-Lager: Tag entfernt, Zustellung am Access-Port VLAN 20

### Spanning Tree verhindert eine Schleife
1. SW1: Bridge-ID 4096 – wird Root Bridge
2. SW1 -> SW2: BPDU
3. SW1 -> SW3: BPDU
4. SW3: Port Richtung SW2 wird blockiert
5. SW1 -> SW3: Link fällt aus – blockierter Port geht in Forwarding

## Lab
**Maschinen**: Cisco-Switch **SW1** (Layer 3, z. B. Catalyst im Packet Tracer) und PCs **PC10** (VLAN 10) sowie **PC20** (VLAN 20); Netzsimulator der App oder Packet Tracer.

### CLI (SW1)
```text
enable
configure terminal
vlan 10
 name Vertrieb
vlan 20
 name Lager
interface g1/0/1
 switchport mode access
 switchport access vlan 10
 spanning-tree portfast
interface g1/0/2
 switchport mode access
 switchport access vlan 20
interface g1/0/24
 switchport mode trunk
 switchport trunk allowed vlan 10,20
ip routing
interface vlan 10
 ip address 192.168.10.1 255.255.255.0
interface vlan 20
 ip address 192.168.20.1 255.255.255.0
ip route 0.0.0.0 0.0.0.0 192.168.99.1
end
show vlan brief
show ip route
```

### PowerShell (PC10, Windows-Client)
```powershell
New-NetIPAddress -InterfaceAlias 'Ethernet' -IPAddress 192.168.10.10 -PrefixLength 24 -DefaultGateway 192.168.10.1
Test-NetConnection 192.168.20.10 -TraceRoute
```

## Legende
### Trunk (802.1Q)
- Was: Verbindung, die Frames mehrerer VLANs mit VLAN-Tag überträgt.
- Wie: 4-Byte-Tag mit 12-Bit-VLAN-ID wird zwischen Quell-MAC und EtherType eingefügt.
- Wann: Zwischen Switches, zu Routern (Router-on-a-Stick), zu Hypervisor-Hosts und Access Points.
- Wo: Uplinks im Verteiler, Etagenswitch zu Core-Switch.
- Warum: Ein Kabel statt einem Kabel pro VLAN.

### Default-Route
- Was: Route 0.0.0.0/0, die genutzt wird, wenn keine spezifischere Route passt.
- Wie: Statisch (ip route 0.0.0.0 0.0.0.0 next-hop) oder per Routingprotokoll verteilt.
- Wann: An Netzgrenzen, vor allem Richtung Internet bzw. Firewall.
- Wo: Router, Layer-3-Switch, Clients (Standardgateway).
- Warum: Hält Routingtabellen klein – nicht jedes Internetnetz muss bekannt sein.

## Karteikarten
- F: Wie lernt ein Switch MAC-Adressen? | A: Aus der Quell-MAC eingehender Frames; er speichert MAC und Port in der MAC-Adresstabelle.
- F: Was passiert mit einem Frame an eine unbekannte Ziel-MAC? | A: Er wird an alle Ports des VLANs außer dem Eingangsport geflutet.
- F: Unterschied Access- und Trunk-Port? | A: Access: ein VLAN, Frames untagged. Trunk: mehrere VLANs, Frames mit 802.1Q-Tag (außer Native VLAN).
- F: Wie viele Bit hat die VLAN-ID und welche IDs sind nutzbar? | A: 12 Bit, VLAN 1–4094 (0 und 4095 reserviert).
- F: Nennen Sie zwei Verfahren für Inter-VLAN-Routing. | A: Router-on-a-Stick mit Subinterfaces, Layer-3-Switch mit SVIs (auch Firewall).
- F: Nach welchem Kriterium wählt ein Router zuerst die Route? | A: Längste Präfixübereinstimmung (Longest Prefix Match).
- F: Wie lautet eine Default-Route in Cisco IOS? | A: ip route 0.0.0.0 0.0.0.0 <Next-Hop-IP oder Ausgangsinterface>.
- F: Welche administrative Distanz hat eine statische Route? | A: 1 (direkt verbunden 0, OSPF 110, RIP 120).
- F: Wozu dient STP? | A: Verhindert Schleifen in redundanten Layer-2-Netzen durch Blockieren redundanter Ports.
- F: Wie wird die Root Bridge bestimmt? | A: Niedrigste Bridge-ID (Priorität, dann MAC-Adresse).

## Quiz
? Wie viele VLAN-IDs sind nach 802.1Q nutzbar?
* 4094
- 4096
- 1024
- 255
! 12 Bit ergeben 4096 Werte, 0 und 4095 sind reserviert.

? Welcher Port-Typ überträgt mehrere VLANs mit Tag?
* Trunk-Port
- Access-Port
- Konsolen-Port
- Mirror-Port
! Access-Ports gehören genau einem VLAN an.

? Zwei PCs liegen in VLAN 10 und VLAN 20. Was wird für die Kommunikation benötigt?
* Ein Router oder Layer-3-Switch
- Ein Hub
- Ein zusätzlicher Access-Port
- Ein Repeater
! VLANs sind getrennte Broadcastdomänen; Verbindung nur über Schicht 3.

? Welche Route wählt ein Router für das Ziel 10.1.5.9, wenn 10.0.0.0/8, 10.1.0.0/16 und 0.0.0.0/0 vorhanden sind?
* 10.1.0.0/16
- 10.0.0.0/8
- 0.0.0.0/0
- Er verwirft das Paket.
! Längste Präfixübereinstimmung gewinnt.

? Welche Funktion hat STP?
* Schleifen in redundanten Switch-Netzen verhindern
- VLANs zwischen Switches verteilen
- IP-Adressen vergeben
- Bandbreite bündeln
! Ohne STP drohen Broadcast-Stürme.

? Wie heißt die Route 0.0.0.0/0?
* Default-Route
- Host-Route
- Loopback-Route
- Null-Route
! Sie gilt für alle Ziele ohne spezifischere Route.

? Was ist bei Router-on-a-Stick erforderlich?
* Subinterfaces mit dot1Q-Kapselung auf einem Trunk
- Ein eigener physischer Port pro VLAN
- Ein Hub zwischen Router und Switch
- STP auf dem Router
! Pro VLAN ein Subinterface als Gateway.

? Welche administrative Distanz hat OSPF?
* 110
- 1
- 90
- 120
! Statisch 1, EIGRP intern 90, RIP 120.

? Welche Maßnahme schützt Access-Ports vor angeschlossenen fremden Switches?
* BPDU Guard
- Native VLAN 1
- Trunk-Modus
- Flooding
! BPDU Guard deaktiviert den Port, sobald dort BPDUs empfangen werden.

## Lücken
- Der 802.1Q-Tag enthält eine {12}-Bit-VLAN-ID.
- Ein {Access-Port|Access-Port (untagged)} gehört genau zu einem VLAN.
- Die Default-Route lautet {0.0.0.0/0}.
- Der Router wählt zuerst die Route mit dem {längsten} Präfix.
- Bei STP wird der Switch mit der niedrigsten Bridge-ID zur {Root Bridge|Root-Bridge}.

## Zuordnen
### Begriff und Bedeutung
- Access-Port => ein VLAN, untagged
- Trunk-Port => mehrere VLANs, 802.1Q-Tag
- Native VLAN => untagged auf dem Trunk
- SVI => virtuelle Routing-Schnittstelle eines VLANs

### Routenquelle und administrative Distanz
- Direkt verbunden => 0
- Statische Route => 1
- OSPF => 110
- RIP => 120

### Gerät und Domäne
- Switchport => eigene Kollisionsdomäne
- VLAN => eigene Broadcastdomäne
- Router-Schnittstelle => trennt Broadcastdomänen
- Hub => eine gemeinsame Kollisionsdomäne

## Reihenfolge
### VLAN auf einem Cisco-Switch einrichten
1. VLAN anlegen und benennen
2. Access-Ports dem VLAN zuweisen
3. Trunk zum Nachbarswitch konfigurieren
4. Erlaubte VLANs auf dem Trunk festlegen
5. Mit show vlan brief prüfen

### Routenauswahl im Router
1. Alle passenden Routen zum Ziel ermitteln
2. Route mit dem längsten Präfix wählen
3. Bei gleichem Präfix niedrigste administrative Distanz wählen
4. Bei gleicher Quelle niedrigste Metrik wählen
5. Paket über das Ausgangsinterface weiterleiten

### Frame durch den Switch
1. Frame am Port empfangen
2. Quell-MAC mit Port in die Tabelle eintragen
3. Ziel-MAC in der Tabelle suchen
4. Bei Treffer gezielt weiterleiten, sonst fluten

## Freitext
- F: Nennen Sie drei Vorteile von VLANs in einem Unternehmensnetz. | M: Sicherheit durch Trennung (z. B. Gäste/Verwaltung), kleinere Broadcastdomänen (Leistung), flexible Zuordnung unabhängig vom Standort, getrennte QoS für VoIP, einfachere Verwaltung. | P: 3
- F: Erläutern Sie den Unterschied zwischen Router-on-a-Stick und Layer-3-Switch beim Inter-VLAN-Routing. | M: Router-on-a-Stick nutzt einen physischen Router-Port als Trunk mit Subinterfaces – günstig, aber Engpass. Layer-3-Switch routet intern per SVI in Hardware – schneller, Standard in größeren Netzen. | P: 4
- F: Beschreiben Sie, wie STP eine Schleife verhindert und was bei Ausfall eines Links passiert. | M: Wahl der Root Bridge, Bestimmung der Root- und Designated Ports, redundante Ports werden blockiert. Fällt ein aktiver Link aus, geht der blockierte Port nach Neuberechnung in Forwarding (RSTP in Sekunden). | P: 4

## Szenario
### Gäste-WLAN vom Firmennetz trennen
Ein Hotel betreibt ein Firmennetz (VLAN 10) und ein Gästenetz (VLAN 30) auf denselben Switches. Die Access Points hängen an einem gemeinsamen Port.
- F: Wie muss der Switchport zum Access Point konfiguriert werden? | A: Als Trunk mit erlaubten VLANs 10 und 30 (ggf. Management-VLAN als Native/Tagged). | P: 2
- F: Wie verhindern Sie, dass Gäste auf das Firmennetz zugreifen? | A: Routing zwischen VLAN 30 und 10 per Firewall/ACL sperren, Gäste nur ins Internet lassen. | P: 2

### Kein Zugriff auf den Server nach Umzug
PC-A (192.168.10.20/24, VLAN 10) erreicht nach einem Umzug den Server 192.168.20.5 nicht mehr. ping auf 192.168.10.1 schlägt fehl.
- F: Welche Ursachen auf Schicht 2 prüfen Sie? | A: Falsches Access-VLAN am neuen Port, VLAN nicht auf dem Trunk erlaubt, Port administrativ down. | P: 3
- F: Mit welchen Befehlen prüfen Sie das am Cisco-Switch? | A: show vlan brief, show interfaces trunk, show interfaces status, show mac address-table. | P: 2

### Internetzugang des Layer-3-Switches
Der Layer-3-Switch kennt nur seine VLAN-Netze. Richtung Firewall (192.168.99.1) fehlt eine Route; Clients erreichen das Internet nicht.
- F: Welche Konfiguration fehlt? | A: Default-Route: ip route 0.0.0.0 0.0.0.0 192.168.99.1. | P: 2
- F: Was muss die Firewall zusätzlich kennen? | A: Rückrouten zu den internen VLAN-Netzen über den Layer-3-Switch (bzw. eine zusammengefasste Route) und NAT für den Internetzugang. | P: 2
