---
id: ccna-wlan-architektur
bereich: CCNA
block: CCNA 1.11
kapitel: Network Access
titel: WLAN-Architekturen – Autonomous, Lightweight (WLC), Cloud, AP-Modi, CAPWAP
stufe: Fortgeschritten
fach: TCP/IP – CCNA – Basic
pruefungen: [CCNA, AP1, AP2]
quellen: [CCNA_200-301_Notes_-_Jeremys_IT_Lab.pdf, 200_301_CCNA_v1.0_2.pdf, WiFi.md]
verweise: [ccna-wlan-grundlagen, ccna-wlan-sicherheit, ccna-trunk-intervlan, ccna-netzwerkkomponenten]
---

## Profi

### Drei Architekturen
1. **Autonomous AP**: jeder AP wird einzeln konfiguriert (SSID, Sicherheit, Kanal, Leistung), verwaltet und überwacht. Simpel, aber nur für wenige APs skalierbar. Anbindung per Access- oder Trunk-Port; SSIDs werden auf VLANs gemappt (ein VLAN je SSID am Trunk).
2. **Lightweight AP + WLC (Split-MAC)**: Der **Wireless LAN Controller (WLC)** konfiguriert zentral. Der AP macht **Echtzeitfunktionen** (Beacons, Probe-Antworten, Verschlüsselung, RF), der WLC das **Management** (Authentifizierung, Roaming, RRM, Policy, Konfiguration). Tunnel: **CAPWAP** (UDP **5246** Kontrolle, **5247** Daten), AP bekommt per DHCP/DNS/Broadcast die WLC-Adresse. Der AP-Port ist ein **Access-Port** (Local Mode, ein Tunnel für alle SSIDs) oder Trunk (FlexConnect). Der WLC verbindet sich per **Trunk** mit dem Switch (Management-/Dynamic-Interfaces je VLAN).
3. **Cloud-based** (z. B. Cisco Meraki): Controller in der Cloud, APs per Internet verwaltet; Datenverkehr bleibt lokal.
Cisco Catalyst 9800 kann auch als **embedded WLC** im Switch/AP laufen.

### AP-Modi
| Modus | Funktion |
|---|---|
| **Local** | Standard; CAPWAP-Tunnel zum WLC, serviert Clients, scannt andere Kanäle |
| **FlexConnect** | Datenverkehr lokal switchen (Außenstellen), bei WAN-Ausfall weiterbetrieben |
| **Monitor** | Nur Überwachung/Rogue-Erkennung, bedient keine Clients |
| **Sniffer** | Erfasst 802.11-Verkehr für Analyse (Wireshark) |
| **Rogue Detector** | Sucht Rogue-APs im kabelgebundenen Netz |
| **Bridge/Mesh** | Verbindet Gebäude (Punkt-zu-Punkt) |
| **SE-Connect** | Spektrumanalyse |

### WLC-Anbindung
Der WLC hat physische Ports (oft zu einem **LAG** gebündelt) und logische Interfaces: **Management Interface**, **Service Port**, **Dynamic Interfaces** (je VLAN/WLAN), **Virtual Interface**. Pro WLAN (SSID) wird ein VLAN/Interface zugewiesen.

### Radio-Grundlagen
2,4 GHz: Kanäle 1/6/11 überlappungsfrei (20 MHz), mehr Reichweite, mehr Störer. 5 GHz: viele nicht-überlappende Kanäle, mehr Durchsatz. 6 GHz (Wi-Fi 6E/7). **SSID** = Name, **BSSID** = MAC des Radios, **BSS** = ein AP + Clients, **ESS** = mehrere APs mit gleicher SSID (Roaming). Standards: 802.11n (Wi-Fi 4), ac (5), ax (6/6E), be (7).

## Einfach

Stell dir eine Firma mit 50 WLAN-Zugangspunkten (**APs**) vor. Wenn jeder Chef seiner Station einzeln sagen müsste, wie er heißt, welchen Kanal er benutzt und wie das Passwort lautet, wärst du den ganzen Tag unterwegs – und jeder AP hätte eine andere Einstellung.

Darum gibt es einen **Controller (WLC)**. Das ist wie ein **Fluglotse**: Er sagt allen APs, was sie tun sollen. Die APs sind die „Lotsen am Boden“, die nur noch mit den Handys und Laptops reden. Zwischen AP und Controller gibt es einen unsichtbaren Tunnel, **CAPWAP**. Alles geht durch den Tunnel zum Controller; der entscheidet, wohin es weitergeht. Läuft dein Handy von einem AP zum nächsten (Roaming), bemerkt das der Controller und überträgt die Verbindung – ohne dass dein Video stoppt.

Drei Bauarten:
- **Autonom**: jeder AP ist sein eigener Chef (gut für Zuhause oder kleine Läden).
- **Mit Controller**: ein zentraler Chef im Büro-Rack.
- **Cloud**: der Chef sitzt im Internet (Meraki) und du verwaltest alles per Browser.

Die APs können unterschiedliche „Jobs“ haben: normal arbeiten (**Local**), nur lauschen, ob Fremde stören (**Monitor**), oder in einer Filiale selbst entscheiden, wenn die Leitung zur Zentrale ausfällt (**FlexConnect**).

## Merksatz
- **Autonomous = einzeln, Lightweight = WLC + CAPWAP, Cloud = Meraki.**
- **CAPWAP: UDP 5246 (Control), 5247 (Data).**
- **AP-Port: Access (Local-Mode); WLC-Port: Trunk.**
- **2,4 GHz: 1 – 6 – 11.**
- **Monitor = lauscht, Sniffer = erfasst, FlexConnect = lokal schalten.**

## Prüfungsfalle
- Im **Local-Mode** ist der AP-Switchport ein **Access-Port**, nicht Trunk (alle SSIDs laufen im CAPWAP-Tunnel zum WLC).
- **BSSID ≠ SSID**: BSSID ist die MAC-Adresse, SSID der Name.
- In einem ESS dürfen SSID gleich, aber BSSID müssen verschieden sein.
- Ein Autonomous AP braucht **Trunk**, wenn mehrere SSIDs auf verschiedene VLANs gemappt werden.
- 2,4 GHz ist **kein** höherer Durchsatz; nur größere Reichweite.
- Wi-Fi 6 = 802.11ax, Wi-Fi 5 = 802.11ac – nicht verwechseln.

## Grafik
### CAPWAP-Tunnel
1. AP -> Switch: DHCP-Discover (AP bekommt IP)
2. AP -> WLC: CAPWAP Discovery (UDP 5246)
3. WLC -> AP: Join-Response, Konfiguration (SSID, Kanal, Sicherheit)
4. Client -> AP: Association an SSID Firma
5. AP -> WLC: Client-Daten im CAPWAP-Tunnel (UDP 5247)
6. WLC -> Router: Weiterleitung ins VLAN 20

### Roaming
1. Client -> AP1: verbunden, Signal wird schwach
2. Client -> AP2: Reassociation
3. WLC: Kontext des Clients von AP1 auf AP2 übertragen
4. Text: Verbindung bleibt bestehen, IP bleibt gleich (gleiches VLAN)

## Lab
**Packet Tracer: WLC (Lightweight), AP, Switch, Laptop (WLAN)** – oder Meraki-Dashboard-Demo

### Cisco IOS
```
SW1(config)# vlan 10
SW1(config-vlan)# vlan 20
SW1(config)# interface g0/1
SW1(config-if)# description AP
SW1(config-if)# switchport mode access
SW1(config-if)# switchport access vlan 10
SW1(config-if)# interface g0/2
SW1(config-if)# description WLC
SW1(config-if)# switchport mode trunk
SW1(config-if)# switchport trunk allowed vlan 10,20
```
1. WLC-GUI: Interface für VLAN 20 anlegen, WLAN „Firma“ mit WPA2-Personal erstellen, Interface zuordnen.
2. AP per DHCP (Option 43 oder DNS CISCO-CAPWAP-CONTROLLER) auf den WLC zeigen lassen.
3. Laptop verbindet sich, erhält IP aus VLAN 20, ping Gateway.

## Befehle
- `show ap summary` – (WLC) registrierte APs
- `show wlan summary` – WLANs/SSIDs
- `show capwap client rcb` – (Autonomous/IOS-XE) CAPWAP-Status
- `switchport mode access` – AP-Port im Local Mode
- `debug capwap events enable` – Join-Probleme analysieren

## Übungen
- A: Welche Ports nutzt CAPWAP? | L: UDP 5246 (Control) und 5247 (Data).
- A: Welche Aufgaben übernimmt der WLC im Split-MAC-Konzept? | L: Management (Authentifizierung, Roaming, RRM, Policies, Konfiguration); der AP übernimmt Echtzeitaufgaben (Beacons, Verschlüsselung).
- A: Welche Kanäle sind bei 2,4 GHz (20 MHz) überlappungsfrei? | L: 1, 6, 11.
- A: Welcher AP-Modus hilft bei Rogue-AP-Erkennung ohne Clients? | L: Monitor-Modus (bzw. Rogue Detector).
- A: Wofür FlexConnect? | L: Lokales Switchen in Außenstellen; funktioniert auch bei WAN-Ausfall.
- A: Was ist der Unterschied BSS und ESS? | L: BSS = ein AP mit Clients; ESS = mehrere APs mit gleicher SSID (Roaming).

## Karteikarten
- F: Was ist ein WLC? | A: Wireless LAN Controller – verwaltet zentral Lightweight-APs.
- F: Wie heißt der Tunnel zwischen AP und WLC? | A: CAPWAP.
- F: CAPWAP-Ports? | A: UDP 5246 und 5247.
- F: Was bedeutet Split-MAC? | A: Aufgabenteilung: AP Echtzeit, WLC Management.
- F: Welche Architektur nutzt Meraki? | A: Cloud-based.
- F: Switchport für AP im Local Mode? | A: Access-Port.
- F: Switchport zum WLC? | A: Trunk.
- F: Was ist FlexConnect? | A: AP-Modus mit lokalem Switching, überlebt WAN-Ausfall.
- F: Überlappungsfreie 2,4-GHz-Kanäle? | A: 1, 6, 11.
- F: BSSID? | A: MAC-Adresse des AP-Radios.

## Quiz
? Welcher Tunnel verbindet Lightweight-AP und WLC?
* CAPWAP
- GRE
- IPsec
- VXLAN
? Welche UDP-Ports nutzt CAPWAP?
* 5246 und 5247
- 67 und 68
- 161 und 162
- 500 und 4500
? Welcher Switchport-Modus gehört zum Lightweight-AP im Local Mode?
* Access
- Trunk
- Routed
- Dynamic desirable
? Welche Architektur hat keinen zentralen Controller?
* Autonomous
- Lightweight
- Cloud-based
- Split-MAC
? Was entspricht der BSSID?
* MAC-Adresse des Radios
- Netzwerkname
- Kanalnummer
- Passwort
? Welche Kanäle sind bei 2,4 GHz überlappungsfrei?
* 1, 6, 11
- 1, 2, 3
- 3, 8, 13
- 2, 5, 9
? Welcher Modus bedient keine Clients, sondern überwacht nur?
* Monitor
- Local
- FlexConnect
- Bridge
? Wer übernimmt Roaming-Entscheidungen im Split-MAC-Modell?
* Der WLC
- Der Client allein
- Der DHCP-Server
- Der Router
? Wi-Fi 6 entspricht…
* 802.11ax
- 802.11ac
- 802.11n
- 802.11g
