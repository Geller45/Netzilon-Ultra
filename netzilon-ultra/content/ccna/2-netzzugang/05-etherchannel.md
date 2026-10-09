---
id: ccna-etherchannel
bereich: CCNA
block: CCNA 2.4
kapitel: Network Access
titel: EtherChannel – LACP, PAgP, Lastverteilung, Layer-3-EtherChannel
stufe: Fortgeschritten
fach: TCP/IP – CCNA – Basic
pruefungen: [CCNA, AP2]
quellen: [CCNA_200-301_Notes_-_Jeremys_IT_Lab.pdf, 200_301_CCNA_v1.0_2.pdf]
verweise: [ccna-stp, ccna-trunk-intervlan, ccna-vlan]
---

## Profi

### Idee
Ein **EtherChannel** (Link Aggregation, Port-Channel) bündelt **2–8 physische Ports** zu **einem logischen Link**. Vorteile: **Bandbreite** (z. B. 4 × 1 Gbit/s), **Redundanz** (fällt ein Mitglied aus, läuft der Bündel weiter ohne STP-Neuberechnung) und STP sieht **nur einen** Link – keine Blockierung der Einzelports. Abgrenzung: Die Bandbreite ist nicht pro Flow gebündelt – ein einzelner Fluss nutzt immer nur **einen** Mitgliedslink.

### Protokolle
| Protokoll | Standard | Modi |
|---|---|---|
| **LACP** | IEEE 802.3ad / 802.1AX | `active` (verhandelt aktiv), `passive` (antwortet nur) |
| **PAgP** | Cisco-proprietär | `desirable` (aktiv), `auto` (passiv) |
| **statisch** | – | `on` (keine Verhandlung) |
Verbindungsregeln: **active ↔ active/passive** = Channel; **passive ↔ passive** = **kein** Channel; **desirable ↔ desirable/auto** = Channel; **auto ↔ auto** = kein Channel; `on` ↔ nur `on`; LACP und PAgP lassen sich **nicht mischen**.

### Voraussetzungen der Mitglieder
Gleiche **Geschwindigkeit**, **Duplex**, **Switchport-Modus** (alle Access oder alle Trunk), gleiches **Access-VLAN**, bei Trunks gleiche **Native/Allowed VLANs**; bei Layer 3 alle Ports routed (`no switchport`). Konfiguration **zuerst am Port-Channel-Interface** oder konsistent an allen Mitgliedern – Abweichungen führen zu **suspended** (Flag `s`).

### Konfiguration
```
interface range g0/1 - 2
 channel-group 1 mode active
interface port-channel 1
 switchport mode trunk
```
Layer-3-EtherChannel: `interface port-channel 1` / `no switchport` / `ip address 10.0.0.1 255.255.255.252`; Mitglieder ebenfalls `no switchport` + `channel-group 1 mode active`.

### Lastverteilung
Hash über Quell-/Ziel-MAC, -IP oder -Port (`port-channel load-balance src-dst-ip`; Standard abhängig von der Plattform). Je ungleichmäßiger die Adressverteilung, desto ungleicher die Last. Die Zahl der Mitglieder sollte **2, 4 oder 8** sein (gleichmäßige Hash-Verteilung).

### Kontrolle
`show etherchannel summary` – Flags: **P** (im Bündel), **s** (suspended), **D** (down), **S** Layer 2, **R** Layer 3, **U** in Benutzung. `show etherchannel port-channel`, `show interfaces port-channel 1`.

## Einfach

Stell dir eine Straße mit nur einer Spur vor: Viele Autos, Stau. Jetzt baust du **vier Spuren nebeneinander** und tust so, als wäre es **eine breite Straße**. Genau das ist ein EtherChannel: mehrere Kabel, die wie ein dickes Kabel behandelt werden.

Das Schöne: Fällt eine Spur aus (ein Kabel kaputt), läuft der Verkehr auf den anderen weiter. Und der Verkehrsplaner (STP) denkt, es gäbe nur eine einzige Straße – darum sperrt er keine Spuren ab, wie er es sonst bei doppelten Kabeln tun würde.

Wichtig: Jedes Auto (jede einzelne Verbindung) fährt trotzdem nur auf **einer** Spur. Ein einzelner Download wird also nicht vierfach schnell – nur viele Downloads zusammen verteilen sich.

Damit beide Seiten sich einigen, sprechen sie ein kleines Protokoll: **LACP** (für alle Hersteller) oder **PAgP** (nur Cisco). Einer muss fragen (**active** / desirable), der andere darf nur antworten (**passive** / auto). Wenn beide nur antworten wollen, passiert nichts. Und alle Spuren müssen gleich gebaut sein: gleiche Geschwindigkeit, gleiche Einstellung – sonst wird eine Spur „suspended“ (zur Seite gestellt).

Ein Beispiel aus dem Büro: Zwischen dem Serverraum-Switch und dem Etagen-Switch liegen zwei Gigabit-Kabel. Ohne EtherChannel würde Spanning Tree eines davon abschalten und nur als Ersatz bereithalten. Mit EtherChannel arbeiten beide gleichzeitig, und du hast zusammen 2 Gigabit – und wenn ein Kabel durch einen Bagger getrennt wird, merkt kaum jemand etwas.

## Merksatz
- **LACP = offen (802.3ad): active/passive. PAgP = Cisco: desirable/auto.**
- **Mindestens eine Seite muss aktiv fragen.**
- **Alle Mitglieder gleich konfigurieren – sonst „suspended“.**
- **Ein Flow = ein Link. Max. 8 aktive Ports.**
- **`show etherchannel summary`: SU = Layer 2 in Benutzung, P = im Bündel.**

## Prüfungsfalle
- **passive + passive** und **auto + auto** bilden **keinen** EtherChannel.
- LACP und PAgP **nicht mischen**; `on` verhandelt nicht und verlangt `on` auf der Gegenseite.
- Konfiguration der Mitglieder muss gleich sein (Speed/Duplex/VLAN/Trunk), sonst Status **s**.
- EtherChannel ersetzt STP nicht – STP läuft auf dem Port-Channel weiter.
- Die Lastverteilung ist **kein** Round-Robin pro Paket, sondern Hash-basiert pro Flow.
- LACP unterstützt bis 16 Ports (8 aktiv, 8 Standby).

## Grafik
### Bündel bilden
1. SW1 -> SW2: LACP-Paket (active) über g0/1
2. SW2 -> SW1: LACP-Antwort (passive) – Parameter passen
3. Text: g0/1 und g0/2 werden Port-Channel 1
4. Text: STP sieht nur noch einen Link, nichts wird blockiert

### Lastverteilung
1. PC1 -> SW1: Fluss A (Hash → g0/1)
2. PC2 -> SW1: Fluss B (Hash → g0/2)
3. SW1 -> SW2: Beide Flüsse laufen parallel über den Bündel
4. Text: g0/1 fällt aus – Fluss A wandert auf g0/2, kein STP-Neustart

## Lab
**Packet Tracer: SW1 und SW2 über g0/1 + g0/2**

### Cisco IOS
```
SW1(config)# interface range g0/1 - 2
SW1(config-if-range)# channel-group 1 mode active
SW1(config-if-range)# interface port-channel 1
SW1(config-if)# switchport mode trunk
SW2(config)# interface range g0/1 - 2
SW2(config-if-range)# channel-group 1 mode passive
SW2(config-if-range)# interface port-channel 1
SW2(config-if)# switchport mode trunk
SW1# show etherchannel summary
SW1# show spanning-tree
```
1. Erwartet: Po1(SU), Mitglieder (P). STP zeigt nur Po1.
2. Fehler: auf SW2 `g0/2` auf Access setzen → g0/2 wird (s)/(I).
3. Layer-3-Variante: `no switchport` an Po1 und Mitgliedern, IP /30 vergeben.

## Befehle
- `channel-group 1 mode active|passive|desirable|auto|on` – Port zum Bündel
- `interface port-channel 1` – logisches Interface
- `show etherchannel summary` – Übersicht
- `port-channel load-balance src-dst-ip` – Hash-Verfahren
- `show etherchannel load-balance` – aktives Verfahren

## Übungen
- A: SW1 LACP active, SW2 LACP passive – Bündel? | L: Ja.
- A: SW1 passive, SW2 passive – Bündel? | L: Nein.
- A: SW1 LACP, SW2 PAgP – Bündel? | L: Nein, Protokolle nicht mischbar.
- A: Was bedeutet SU in show etherchannel summary? | L: S = Layer 2, U = in Benutzung.
- A: Warum ist ein Mitglied suspended? | L: Inkonsistente Konfiguration (Speed/Duplex/VLAN/Mode) zum Rest des Bündels.
- A: Maximal aktive Ports im EtherChannel? | L: 8 (LACP zusätzlich 8 Standby).

## Karteikarten
- F: Was ist EtherChannel? | A: Bündelung mehrerer physischer Links zu einem logischen Link.
- F: Welcher Standard ist LACP? | A: IEEE 802.3ad / 802.1AX.
- F: PAgP-Modi? | A: desirable und auto (Cisco-proprietär).
- F: LACP-Modi? | A: active und passive.
- F: Welche LACP-Kombination funktioniert nicht? | A: passive + passive.
- F: Wie viele Ports maximal aktiv? | A: 8.
- F: Wie wird die Last verteilt? | A: Per Hash (MAC/IP/Port), ein Flow bleibt auf einem Link.
- F: Befehl zur Kontrolle? | A: show etherchannel summary
- F: Was bedeutet Flag s? | A: suspended – Mitglied inkonsistent konfiguriert.
- F: Wie wird ein Layer-3-EtherChannel gebaut? | A: no switchport an Port-Channel und Mitgliedern, IP am Port-Channel.

## Quiz
? Welche Modi bilden mit LACP einen Channel?
* active + passive
- passive + passive
- auto + desirable
- on + active
? Welches Protokoll ist Cisco-proprietär?
* PAgP
- LACP
- STP
- LLDP
? Bis zu wie vielen Ports kann ein klassischer EtherChannel aktiv bündeln?
* 8
- 2
- 4
- 16
? Was zeigt "SU" in show etherchannel summary?
* Layer 2, in Benutzung
- Suspended, Up
- Standby, Unused
- Single, Up
? Ein Mitglied ist suspended. Wahrscheinlichste Ursache?
* Abweichende Konfiguration der Mitglieder
- Kabel zu kurz
- STP-Root falsch
- NTP nicht synchron
? Wie verteilt EtherChannel Datenverkehr?
* Hash-basiert pro Flow
- Round-Robin pro Paket
- Nur auf dem ersten Link
- Zufällig pro Bit
? Wie sieht STP einen EtherChannel?
* Als einen einzigen Link
- Als mehrere Links, alle blockiert
- Gar nicht
- Als Trunk ohne VLANs
? Welche PAgP-Kombination bildet keinen Channel?
* auto + auto
- desirable + auto
- desirable + desirable
- on + on ohne Protokoll
? Wofür steht Layer-3-EtherChannel?
* Port-Channel mit no switchport und IP-Adresse
- Port-Channel mit VLAN-Trunk
- Zwei SVIs
- Ein Router-on-a-Stick
