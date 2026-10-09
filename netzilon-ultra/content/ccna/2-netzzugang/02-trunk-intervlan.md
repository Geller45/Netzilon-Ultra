---
id: ccna-trunk-intervlan
bereich: CCNA
block: CCNA 2.1
kapitel: Network Access
titel: Trunks (802.1Q) und Inter-VLAN-Routing – Router-on-a-Stick, Layer-3-Switch
stufe: Fortgeschritten
fach: TCP/IP – CCNA – Basic
pruefungen: [CCNA, AP1, AP2]
quellen: [CCNA_200-301_Notes_-_Jeremys_IT_Lab.pdf, VLAN.md, 200_301_CCNA_v1.0_2.pdf]
verweise: [ccna-vlan, ccna-dtp-vtp, ccna-stp, ccna-switching-mac-arp, ccna-statisches-routing]
---

## Profi

### Trunk-Ports und IEEE 802.1Q
Ein **Trunk** transportiert Frames **mehrerer VLANs** über einen einzigen Link (Switch–Switch, Switch–Router, Switch–Hypervisor). Damit der Empfänger weiß, zu welchem VLAN ein Frame gehört, fügt der Sender ein **802.1Q-Tag** (4 Byte) zwischen Quell-MAC und EtherType ein:
- **TPID** 16 Bit = 0x8100 (kennzeichnet getaggten Frame)
- **PCP** 3 Bit (Priorität, 802.1p / CoS)
- **DEI** 1 Bit (Drop Eligible)
- **VID** 12 Bit = VLAN-ID (1–4094; 0 und 4095 reserviert)
Durch das Tag wächst der Frame von 1518 auf **1522 Byte**; der FCS wird neu berechnet. Das Tag wird beim Verlassen eines **Access-Ports** wieder entfernt.

### Native VLAN
Frames des **Native VLAN** werden auf dem Trunk **ungetaggt** gesendet (Standard: VLAN 1). Empfängt der Switch einen ungetaggten Frame auf dem Trunk, ordnet er ihn dem Native VLAN zu. **Beide Seiten müssen dasselbe Native VLAN haben**, sonst meldet CDP/Syslog „native VLAN mismatch“ und es entsteht ein Sicherheits- und STP-Problem. Best Practice: Native VLAN auf ein **ungenutztes VLAN** (z. B. 999) legen, damit VLAN-Hopping per Double-Tagging erschwert wird.

### Trunk konfigurieren (Catalyst, 802.1Q)
Moderne Catalysts unterstützen nur 802.1Q (ISL ist Legacy). Konfiguration:
`switchport mode trunk` (Trunk erzwingen), `switchport trunk allowed vlan 10,20,99` (Whitelist – Standard ist „alle“), `switchport trunk native vlan 999`. Auf älteren Plattformen vorher `switchport trunk encapsulation dot1q`. Kontrolle: `show interfaces trunk` (Mode, Encapsulation, Status, Native VLAN, Allowed, Active in STP-Forwarding).

### Inter-VLAN-Routing
Hosts in verschiedenen VLANs sind verschiedene Subnetze/Broadcastdomänen – Verkehr dazwischen braucht einen **Layer-3-Hop**. Drei Varianten:
1. **Legacy**: ein Router-Interface je VLAN (verbraucht viele Ports – nur historisch).
2. **Router-on-a-Stick (ROAS)**: ein physischer Link (Trunk) zum Router, darauf **Subinterfaces** `g0/0.10` mit `encapsulation dot1Q 10` und `ip address <Gateway> <Maske>`. Für das Native VLAN: `encapsulation dot1Q 99 native`. Das physische Interface braucht `no shutdown`, aber keine IP.
3. **Layer-3-Switch mit SVIs**: `ip routing` aktivieren, je VLAN ein **SVI** (`interface vlan 10`, `ip address …`, `no shutdown`). Schnell (Hardware-Routing/CEF), Standard im Campus. Alternativ **Routed Port**: `no switchport` + IP direkt am Port.
Ein SVI ist nur **up/up**, wenn das VLAN existiert **und** mindestens ein aktiver Port (Access oder Trunk, der das VLAN führt) im VLAN liegt.

### Fehlersuche
Reihenfolge: VLAN existiert und Port im richtigen VLAN (`show vlan brief`) → Trunk up, VLAN erlaubt (`show int trunk`) → Native-VLAN gleich → Gateway auf Host korrekt → Subinterface-Tag/IP korrekt (`show ip interface brief`) → Routingtabelle (`show ip route`).

## Einfach

Stell dir ein großes Bürogebäude vor. Jede Abteilung (Verkauf, Technik, Gäste) hat eine eigene Farbe – das sind die **VLANs**. Jede Abteilung hat ihre eigenen Flure, niemand kann einfach in die anderen laufen.

Jetzt gibt es zwischen zwei Stockwerken nur **ein einziges Treppenhaus** (das Kabel zwischen zwei Switches). Alle Abteilungen müssen da durch. Damit niemand durcheinanderkommt, bekommt jeder Besucher einen **farbigen Aufkleber** an die Jacke – das ist das **802.1Q-Tag**. Das Treppenhaus mit den vielen Farben heißt **Trunk**. Wer in der Standardfarbe (Native VLAN) kommt, läuft ohne Aufkleber; das ist praktisch, aber beide Stockwerke müssen sich einig sein, welche Farbe das ist.

Wenn jemand aus dem Verkauf mit jemandem aus der Technik reden will, darf er nicht einfach hinüberlaufen – die Flure sind getrennt. Er muss zum **Pförtner** (dem **Router**). Der Pförtner steht entweder
- an **einer Tür mit mehreren Schildern** (Router-on-a-Stick: ein Kabel, mehrere „Unter-Türen“ = Subinterfaces), oder
- er sitzt **direkt im Switch** (Layer-3-Switch mit SVIs) und ist viel schneller.

Der Pförtner hat für jede Abteilung eine Adresse (das **Standardgateway**). Jedes Gerät muss wissen: „Wenn ich zu einer anderen Abteilung will, gebe ich den Brief dem Pförtner.“

## Merksatz
- **Trunk = viele VLANs, ein Kabel, 4 Byte Tag (802.1Q).**
- **Native VLAN = ungetaggt – auf beiden Seiten gleich, nicht VLAN 1.**
- **ROAS: Subinterface + `encapsulation dot1Q <ID>` + Gateway-IP.**
- **SVI up/up braucht: VLAN existiert + aktiver Port im VLAN.**
- **Verschiedene VLANs = verschiedene Subnetze = Router nötig.**

## Prüfungsfalle
- Der Trunk-Port muss das VLAN **erlauben** (`allowed vlan`) – ein „falsches“ allowed-Liste-Kommando mit `switchport trunk allowed vlan 20` **ersetzt** die Liste; Hinzufügen geht mit `add`.
- Beim **ROAS** kommt die IP-Adresse auf das **Subinterface**, nicht auf das physische Interface; die Subinterface-Nummer (`.10`) muss nicht der VLAN-ID entsprechen, ist aber üblich.
- Native-VLAN-Mismatch führt nicht zum Link-Down, sondern zu Meldungen und Fehlverhalten.
- Layer-3-Switch: **`ip routing` vergessen** → SVIs routen nicht.
- ISL (Cisco-proprietär) ist Legacy; 802.1Q ist der IEEE-Standard.
- Ein SVI bleibt **down/down**, wenn kein Port des VLANs aktiv ist.

## Grafik
### Router-on-a-Stick
1. PC10 -> SW1: Frame VLAN 10 (ungetaggt am Access-Port)
2. SW1 -> Router: Trunk – Frame mit 802.1Q-Tag VLAN 10
3. Router: Subinterface g0/0.10 empfängt, Routing-Entscheidung
4. Router -> SW1: Trunk – neu getaggt mit VLAN 20
5. SW1 -> PC20: Tag entfernt, Frame an Access-Port VLAN 20

### 802.1Q-Tag
1. Text: Ethernet-Frame ohne Tag: Ziel-MAC, Quell-MAC, Typ, Daten, FCS
2. Text: Switch fügt 4 Byte Tag nach der Quell-MAC ein (TPID 0x8100, PCP, DEI, VID)
3. Text: Frame ist jetzt 1522 Byte groß, FCS wird neu berechnet

## Lab
**Packet Tracer: R1 (Router-on-a-Stick) – SW1 (Trunk g0/1) – PC10 (VLAN 10, 192.168.10.0/24), PC20 (VLAN 20, 192.168.20.0/24)**

### Cisco IOS
1. SW1: VLANs anlegen, Ports zuordnen, Trunk setzen.
```
SW1(config)# vlan 10
SW1(config-vlan)# name VERKAUF
SW1(config-vlan)# vlan 20
SW1(config-vlan)# name TECHNIK
SW1(config-vlan)# interface f0/1
SW1(config-if)# switchport mode access
SW1(config-if)# switchport access vlan 10
SW1(config-if)# interface f0/2
SW1(config-if)# switchport mode access
SW1(config-if)# switchport access vlan 20
SW1(config-if)# interface g0/1
SW1(config-if)# switchport mode trunk
SW1(config-if)# switchport trunk allowed vlan 10,20
SW1(config-if)# end
SW1# show interfaces trunk
```
2. R1: Subinterfaces.
```
R1(config)# interface g0/0
R1(config-if)# no shutdown
R1(config-if)# interface g0/0.10
R1(config-subif)# encapsulation dot1Q 10
R1(config-subif)# ip address 192.168.10.1 255.255.255.0
R1(config-subif)# interface g0/0.20
R1(config-subif)# encapsulation dot1Q 20
R1(config-subif)# ip address 192.168.20.1 255.255.255.0
R1(config-subif)# end
R1# show ip route
```
3. PC10 192.168.10.10/24 GW .1, PC20 192.168.20.10/24 GW .1 → Ping PC10→PC20 muss klappen.
4. Variante Layer-3-Switch: auf SW1 `ip routing`, `interface vlan 10` / `ip address 192.168.10.1 255.255.255.0` / `no shutdown`, entsprechend VLAN 20.
5. Fehler einbauen: `switchport trunk allowed vlan 10` → PC20 verliert das Gateway. Mit `show int trunk` finden.

## Befehle
- `switchport mode trunk` – Port fest als Trunk
- `switchport trunk allowed vlan add 30` – VLAN 30 zur Liste hinzufügen
- `switchport trunk native vlan 999` – Native VLAN ändern
- `show interfaces trunk` – Trunk-Status, Allowed und Native VLANs
- `encapsulation dot1Q 10` – Subinterface einem VLAN zuordnen
- `ip routing` – Layer-3-Routing auf dem Switch aktivieren
- `interface vlan 10` – SVI anlegen
- `show vlan brief` – VLANs und Ports

## Übungen
- A: Wie groß ist ein 802.1Q-getaggter Ethernet-Frame maximal? | L: 1522 Byte (1518 + 4 Byte Tag).
- A: Ein PC in VLAN 10 erreicht den Router nicht, Trunk ist up. Was prüfen Sie? | L: `show int trunk` – ist VLAN 10 erlaubt/aktiv? Subinterface `encapsulation dot1Q 10`? Gateway am PC korrekt?
- A: Konfigurieren Sie ein Subinterface für VLAN 30, Netz 10.0.30.0/24, Gateway .254. | L: `interface g0/0.30`, `encapsulation dot1Q 30`, `ip address 10.0.30.254 255.255.255.0`.
- A: Warum soll das Native VLAN nicht VLAN 1 sein? | L: VLAN 1 ist Default für alle Ports und trägt Steuerverkehr (CDP, DTP, VTP); ein ungenutztes Native VLAN erschwert VLAN-Hopping.
- A: Was braucht ein SVI, um up/up zu sein? | L: Das VLAN muss existieren und mindestens ein aktiver Port im VLAN (Access oder Trunk) vorhanden sein.
- A: Wie viele Bits hat die VLAN-ID, wie viele VLANs sind nutzbar? | L: 12 Bit, 1–4094 (normal 1–1005, extended 1006–4094).

## Karteikarten
- F: Welcher Standard definiert VLAN-Tagging? | A: IEEE 802.1Q.
- F: Wie groß ist das 802.1Q-Tag? | A: 4 Byte (TPID 0x8100, PCP, DEI, VID 12 Bit).
- F: Was ist das Native VLAN? | A: Das VLAN, dessen Frames auf dem Trunk ungetaggt gesendet werden (Standard VLAN 1).
- F: Befehl zur Trunk-Kontrolle? | A: show interfaces trunk
- F: Was ist Router-on-a-Stick? | A: Ein Router mit einem Trunk-Link und je VLAN einem Subinterface für Inter-VLAN-Routing.
- F: Was ist ein SVI? | A: Switched Virtual Interface – virtuelle Layer-3-Schnittstelle eines VLANs auf einem Layer-3-Switch.
- F: Was muss auf einem L3-Switch aktiv sein, damit er routet? | A: ip routing
- F: Wie ersetzt man eine Allowed-Liste, wie ergänzt man sie? | A: Ohne Zusatz ersetzt, mit "add" ergänzt: switchport trunk allowed vlan add 30
- F: Warum Native VLAN auf ein ungenutztes VLAN legen? | A: Schutz vor VLAN-Hopping per Double-Tagging.
- F: Wie wird ein Subinterface für das Native VLAN konfiguriert? | A: encapsulation dot1Q 99 native

## Quiz
? Wie viele Bit hat die VLAN-ID im 802.1Q-Tag?
* 12
- 8
- 16
- 4
! 12 Bit = 4096 Werte, nutzbar 1–4094.
? Welcher Befehl zeigt Allowed- und Native-VLANs der Trunks?
* show interfaces trunk
- show vlan brief
- show trunk status
- show ip interface brief
? Wo liegt beim Router-on-a-Stick die IP-Adresse?
* Auf dem Subinterface
- Auf dem physischen Interface
- Auf dem Switch-Trunk-Port
- Nur auf dem Host
? Welcher Wert kennzeichnet einen 802.1Q-Frame (TPID)?
* 0x8100
- 0x0800
- 0x86DD
- 0x8847
? Was passiert mit Frames des Native VLAN auf dem Trunk?
* Sie werden ungetaggt gesendet
- Sie werden verworfen
- Sie erhalten VID 0
- Sie werden doppelt getaggt
? Ein L3-Switch routet zwischen SVIs nicht. Häufigste Ursache?
* ip routing fehlt
- Native VLAN falsch
- STP blockiert alle Ports
- VTP ist aus
? Wie groß ist ein getaggter Ethernet-Frame (maximal)?
* 1522 Byte
- 1518 Byte
- 1500 Byte
- 9000 Byte
? Welche Variante des Inter-VLAN-Routings ist im Campus Standard?
* Layer-3-Switch mit SVIs
- Ein Router-Port je VLAN
- Hub mit Router
- Repeater
? Der Befehl switchport trunk allowed vlan 20 wird auf einem Trunk mit 10,20,30 eingegeben. Ergebnis?
* Nur noch VLAN 20 erlaubt
- VLAN 20 wird hinzugefügt
- Nichts ändert sich
- VLAN 10 und 30 bleiben erlaubt
