---
id: ihk-lz-vlan-wlan-ipv6
bereich: Prüfung
block: IHK
kapitel: Lernzettel-Inhalte
titel: IPv4/IPv6-Subnetting, VLAN und WLAN für die Prüfung
stufe: Fortgeschritten
fach: PV – AP2
pruefungen: [AP1, AP2]
quellen: [IPv4-IPv6 Subnetting.docx, IPv4-IPv6 Subnetting.pdf, VLAN.docx, VLAN.pdf, WLAN.docx, WLAN.pdf, Lernzettel_AP1AP2_2024.pdf]
verweise: [ihk-berechnungen-lernzettel, ihk-lz-nat-netzplan, ihk-lz-protokolle, ihk-lz-sicherheit]
---

## Profi

### IPv4
Dotted-Decimal; Netzanteil/Hostanteil durch Maske getrennt. **Netz-ID** (Host-Bits 0), **Broadcast** (Host-Bits 1), Hosts = 2ʰ − 2, Gateway oft erste oder letzte nutzbare IP.
| CIDR | Adressen | nutzbar | Maske |
|---|---|---|---|
| /24 | 256 | 254 | 255.255.255.0 |
| /26 | 64 | 62 | 255.255.255.192 |
| /29 | 8 | 6 | 255.255.255.248 |
| /30 | 4 | 2 | 255.255.255.252 (Router-Links) |
| /31 | 2 | 2 | RFC 3021, Punkt-zu-Punkt ohne Netz-ID/Broadcast |
**APIPA** 169.254.0.0/16, **Default-Route** 0.0.0.0/0, Routing-Tabelle: Zielnetz, Maske, Next-Hop, Interface. Hilfsprotokolle: ARP, NAT/PAT, DNS (A/AAAA).

### IPv6
128 Bit, 8 Blöcke à 16 Bit (hexadezimal). Kürzen: führende Nullen weglassen, **eine** Folge von Nullblöcken durch `::`. **Link-Local** `fe80::/10`, **GUA** global (2000::/3). **SLAAC** (Router Advertisement liefert Präfix, Host bildet Interface-ID), **DHCPv6** ergänzend (DNS-Server). Provider-Präfix /48 oder /56, **Subnetz = /64**; /56 → 256 Subnetze. Kein NAT nötig, kein Broadcast (Multicast, NDP statt ARP).

### VLAN
- **Ziele**: Sicherheit (Trennung von Bereichen), Performance (kleinere Broadcast-Domänen), Flexibilität.
- **Zuordnung**: portbasiert (statisch) oder dynamisch (MAC, 802.1X).
- **802.1Q**: 32-Bit-Tag (u. a. 12-Bit-VLAN-ID, 3-Bit-Priorität/PCP). Port-Modi: **Untagged/Access** (Endgeräte, Switch entfernt Tag), **Tagged/Trunk** (Switch-Switch, Switch-Router, mehrere VLANs).
- **Inter-VLAN-Routing**: Router oder **Layer-3-Switch**. **Router-on-a-Stick**: Subinterfaces (z. B. eth1.10, eth1.20) mit dot1q-Kapselung und IP aus dem VLAN-Subnetz (Gateway der Clients).
- **Native VLAN**: Traffic ohne Tag auf dem Trunk, Default VLAN 1; sicherer auf ungenutzte ID (z. B. 99) → Schutz vor **VLAN Hopping**. **VoIP-VLAN** für QoS.
- **Fehler**: Tags fehlen am Trunk, Port untagged statt tagged, STP blockiert Port, VLAN nicht auf allen Trunks erlaubt.

### WLAN
- Komponenten: **Access Point** (PoE), **WLAN-Controller** (zentral), **RADIUS-Server** (AAA, z. B. gegen AD).
- Sicherheit: **WPA2/3-Personal (PSK)**: ein Schlüssel für alle; **WPA2/3-Enterprise (802.1X/RADIUS)**: individuelle Zugangsdaten oder Zertifikate.
- Segmentierung: Gruppen in eigene VLANs/SSIDs (Verwaltung, Produktion, Gäste, IoT). **Gast-WLAN**: eigene SSID, eigener IP-Bereich, Captive Portal (Voucher).
- **WLAN-Scan** lesen: SSID (Name), BSSID (MAC des AP-Funkmoduls), Channel (2,4 GHz: 1/6/11 überlappungsfrei; 5 GHz), BW (20/40/80 MHz), Signal in dBm (−50 sehr gut, −85 schlecht), `<hidden>` SSID (nur nicht beworben, **keine** Verschlüsselung).
- Probleme: überlappende Kanäle, Mikrowelle, Bluetooth, Stahlbetonwände, 2,4-GHz-only-IoT-Geräte; offene Hotspots nur mit VPN nutzen.

## Einfach

**IPv4-Adresse als Hausnummer:** Die Adresse hat zwei Teile: Straße (Netz) und Hausnummer (Host). Die Maske sagt, wo die Straße endet. Die erste Hausnummer in der Straße ist das Straßenschild (Netz-ID), die letzte ist der Lautsprecher für alle (Broadcast). Dazwischen wohnen die Hosts: 2ʰ − 2. Router-Verbindungen brauchen nur zwei Hosts, deshalb nimmt man /30 (oder /31).

**IPv6 ist eine Riesenstadt:** Die Adressen sind lang, daher kürzt man sie: Nullen am Blockanfang weg, und die längste Reihe aus Nullen wird durch `::` ersetzt (aber nur einmal!). Jedes normale Netz ist ein /64. Bekommt eine Firma ein /56, kann sie 256 solcher Netze bauen. Computer können ihre Adresse sogar selbst bilden (SLAAC).

**VLAN = unsichtbare Wände:** Alle Computer hängen am gleichen Switch, aber der Admin teilt sie in Gruppen (Farben): Verwaltung, Produktion, Gäste. Die Gruppen sehen sich nicht, auch wenn sie nebeneinander sitzen. Zwischen Switches braucht es eine „Straße für alle Farben“ (Trunk). Dort bekommen die Pakete einen Farbaufkleber (Tag). Am PC wird der Aufkleber wieder abgezogen (untagged).

Damit zwei Farben doch miteinander reden dürfen, braucht es einen Router (wie eine Kreuzung). Ein einziges Kabel mit vielen Fahrspuren (Subinterfaces) heißt Router-on-a-Stick.

**WLAN:** Der Access Point ist der Funkturm im Haus. Mit **einem gemeinsamen Passwort** (PSK) kennen alle den Schlüssel. Mit **RADIUS** hat jeder einen eigenen Schlüssel, wie ein persönlicher Ausweis. Gäste kommen in ein eigenes Netz mit eigenem Namen und eigenem Adressbereich. Ein „versteckter“ Name ist keine Sicherheit, sondern nur ein Namensschild, das man abgehängt hat.

**Signalstärke:** −50 dBm ist laut und klar, −85 ist leise und wackelig (je näher an 0, desto besser).

## Merksatz
- Hosts 2ʰ−2; /30 = 2, /29 = 6, /26 = 62.
- /56 → 256 × /64.
- Trunk = tagged, Endgerät = untagged.
- PSK = ein Passwort für alle, RADIUS = individuell.
- −50 dBm gut, −85 dBm schlecht.

## Prüfungsfalle
- `::` darf nur einmal in einer IPv6-Adresse stehen.
- Link-Local beginnt mit fe80, nicht mit 2001.
- Router-on-a-Stick: IP und dot1q **am Subinterface**, nicht am physischen Port.
- Versteckte SSID ist **keine** Verschlüsselung.
- Native VLAN nicht auf VLAN 1 lassen (Sicherheitsempfehlung).
- Kanalüberlappung im 2,4-GHz-Band: nur 1, 6, 11 sind frei von Überlappung.

## Grafik
### Router-on-a-Stick
1. PC-A (VLAN 10) -> Switch: Frame untagged an Access-Port
2. Switch: setzt VLAN-Tag 10 und sendet über den Trunk
3. Switch -> Router: Frame mit Tag 10 an Subinterface eth1.10
4. Router: Routing von VLAN 10 nach VLAN 20
5. Router -> Switch: Frame mit Tag 20 über Subinterface eth1.20
6. Switch -> PC-B (VLAN 20): Tag entfernt, untagged zugestellt

## Spickzettel
- 2ʰ−2; /24=254, /26=62, /29=6, /30=2, /31 (RFC 3021)
- APIPA 169.254; Default 0.0.0.0/0
- IPv6: fe80 Link-Local, GUA, SLAAC, /64 Standard, /56=256 Subnetze
- VLAN: 802.1Q, Trunk tagged, Access untagged, Native VLAN ändern
- WLAN: PSK vs. RADIUS, Gast-SSID mit Captive Portal
- dBm: −50 gut, −85 schlecht

## Reihenfolge
### VLAN-Frame vom PC zum Router
1. PC sendet Frame ohne Tag
2. Access-Port ordnet Frame dem VLAN zu
3. Switch ergänzt Tag auf dem Trunk
4. Router empfängt auf passendem Subinterface
5. Router routet in das Ziel-VLAN

## Lücken
- Ein /26-Netz hat {62} nutzbare Hosts.
- Aus einem /56-Präfix lassen sich {256} Subnetze der Größe /64 bilden.
- Auf einem Trunk werden VLAN-Frames mit {802.1Q} getaggt.

## Karteikarten
- F: Nutzbare Hosts im /29? | A: 6
- F: Wann nutzt man /30 oder /31? | A: Punkt-zu-Punkt-Verbindungen zwischen Routern
- F: Link-Local-Präfix IPv6? | A: fe80::/10
- F: Was ist SLAAC? | A: Selbstkonfiguration der IPv6-Adresse aus dem Router-Präfix
- F: Standardgröße eines IPv6-Subnetzes? | A: /64
- F: Warum VLANs? | A: Sicherheit, weniger Broadcasts, Flexibilität
- F: Access-Port vs. Trunk-Port? | A: Access untagged für Endgeräte; Trunk tagged für mehrere VLANs
- F: Was ist Router-on-a-Stick? | A: Ein Router-Link mit Subinterfaces (dot1q) für Inter-VLAN-Routing
- F: Was ist das Native VLAN? | A: VLAN ohne Tag auf einem Trunk, sollte nicht VLAN 1 sein
- F: PSK vs. RADIUS? | A: Gemeinsames Passwort vs. individuelle Authentifizierung (802.1X)
- F: Was ist die BSSID? | A: MAC-Adresse des AP-Funkmoduls
- F: Was bedeutet −85 dBm? | A: Sehr schwaches Signal

## Quiz
? Wie viele nutzbare Hosts hat ein /30-Netz?
* 2
- 4
- 6
- 1

? Wie viele /64-Subnetze enthält ein /56?
* 256
- 64
- 4.096
- 65.536

? Welche IPv6-Adresse ist Link-Local?
* fe80::1
- 2001:db8::1
- ::1
- ff02::1

? Welcher Port-Modus transportiert mehrere VLANs?
* Tagged (Trunk)
- Untagged (Access)
- Mirror
- Shutdown

? Welche Aufgabe hat Router-on-a-Stick?
* Routing zwischen VLANs über Subinterfaces
- Verschlüsselung des WLAN
- DHCP-Relay
- Spanning Tree

? Was ist ein Vorteil von WPA2-Enterprise?
* Individuelle Authentifizierung pro Nutzer
- Kein Server nötig
- Ein Passwort für alle
- Keine Verschlüsselung

? Was bedeutet „versteckte SSID“?
* Der Netzname wird nicht ausgestrahlt, bietet aber keine Verschlüsselung
- Das Netz ist verschlüsselt
- Das Netz ist unsichtbar für Angreifer
- Das Netz hat keine Funkreichweite

? Welcher Kanalbereich im 2,4-GHz-Band überlappt nicht?
* 1, 6 und 11
- 1, 2 und 3
- 2, 4 und 6
- 5, 6 und 7

? Wozu dient das Native VLAN?
* Übertragung von untagged Frames auf dem Trunk
- Verschlüsselung von Frames
- Gastzugang
- Spiegelung

? Welcher dBm-Wert steht für ein sehr gutes Signal?
* −50 dBm
- −85 dBm
- −100 dBm
- −120 dBm
