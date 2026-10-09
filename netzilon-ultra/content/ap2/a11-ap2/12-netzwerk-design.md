---
id: ap2-netzwerk-design
bereich: AP2
block: A11
kapitel: Netzwerke
titel: Netzwerk-Design (Subnetting IPv4/IPv6, VLAN, Routing, WLAN, VPN, QoS, VoIP)
stufe: Profi
quellen: [IHK-Prüfungskatalog, IEEE 802.1Q/802.11/802.3]
verweise: [ap2-angriffe-schutz, ap2-kryptografie, ap2-itil-monitoring, ap1-a5-vpn]
---

## Profi

### IPv4-Subnetting
**Netzanteil/Hostanteil** per **CIDR**. **Hosts = 2^(32−Präfix) − 2**. **Blockgröße = 256 − Maskenwert im interessanten Oktett**.

| Präfix | Maske | Hosts |
|---|---|---|
| /24 | 255.255.255.0 | 254 |
| /25 | .128 | 126 |
| /26 | .192 | 62 |
| /27 | .224 | 30 |
| /28 | .240 | 14 |
| /29 | .248 | 6 |
| /30 | .252 | 2 |
| /22 | 255.255.252.0 | 1.022 |

**Beispiel**: 192.168.10.0/24 in **4 Subnetze** → **/26**, Blockgröße 64: .0, .64, .128, .192. Netz 2: **192.168.10.64/26**, Hosts **.65–.126**, Broadcast **.127**.
**VLSM**: **größtes Netz zuerst** vergeben.
**Private Bereiche**: **10.0.0.0/8**, **172.16.0.0/12**, **192.168.0.0/16**; **APIPA 169.254.0.0/16**; **CGNAT 100.64.0.0/10**.

### IPv6
**128 Bit**, **8 Blöcke à 16 Bit hex**. **Kürzen**: **führende Nullen weg**, **eine** Nullfolge durch **::**.
| Typ | Präfix |
|---|---|
| **Global Unicast** | **2000::/3** |
| **Link-Local** | **fe80::/10** (immer vorhanden) |
| **Unique Local** | **fc00::/7** (fd00::/8 genutzt) |
| **Multicast** | **ff00::/8** (kein Broadcast!) |
| **Loopback** | **::1** |

**Standard-Subnetz /64**, **Provider gibt /48 oder /56** → **/48 = 65.536 /64-Netze**, **/56 = 256**. **SLAAC** (Router Advertisement, EUI-64 oder Privacy-Adresse), **DHCPv6** (stateful/stateless), **NDP** ersetzt ARP.

### VLAN (802.1Q)
**Logische Trennung** auf einem Switch. **Tag 4 Byte**, **VLAN-ID 12 Bit (1–4094)**, **PCP 3 Bit (QoS)**. **Access-Port** (untagged, ein VLAN), **Trunk-Port** (tagged, mehrere), **Native VLAN** (untagged auf Trunk). **Kommunikation zwischen VLANs nur über Router/L3-Switch** (Router-on-a-Stick, SVI). **Vorteile**: **Sicherheit, kleinere Broadcast-Domänen, Flexibilität**.

### Routing
**Statisch** (manuell, klein) vs. **dynamisch** (**RIP** Distanzvektor/Hops, **OSPF** Link-State/Kosten, **BGP** zwischen Providern/AS). **Default Route 0.0.0.0/0**. **Longest Prefix Match** entscheidet. **NAT/PAT** (viele private auf eine öffentliche IP), **Port-Forwarding**.

### WLAN
| Standard | Name | Frequenz | Max. brutto |
|---|---|---|---|
| 802.11n | **Wi-Fi 4** | 2,4/5 GHz | 600 Mbit/s |
| 802.11ac | **Wi-Fi 5** | 5 GHz | ~6,9 Gbit/s |
| 802.11ax | **Wi-Fi 6/6E** | 2,4/5 (/6) GHz | ~9,6 Gbit/s |
| 802.11be | **Wi-Fi 7** | 2,4/5/6 GHz | ~46 Gbit/s |

**2,4 GHz**: **Reichweite gut**, **nur 3 überlappungsfreie Kanäle (1, 6, 11)**, störanfällig. **5/6 GHz**: **schneller**, **mehr Kanäle**, **weniger Reichweite**.
**Sicherheit**: **WEP/WPA** unsicher, **WPA2** (AES-CCMP), **WPA3** (**SAE** statt PSK-Handshake, Schutz gegen Offline-Wörterbuch). **Personal** (PSK) vs. **Enterprise** (**802.1X + RADIUS**, individuelle Anmeldung). **Gast-WLAN** in eigenem VLAN, **Client Isolation**.
**Planung**: **Ausleuchtung (Site Survey)**, **Kanalplanung**, **PoE** für APs, **Controller/Mesh**, **Roaming (802.11r/k/v)**.

### VPN
| Art | Beschreibung |
|---|---|
| **Site-to-Site** | **Standorte verbinden** (Router zu Router, dauerhaft) |
| **End-to-Site (Remote Access)** | **Einzelner Client** ins Firmennetz |
| **End-to-End** | **Direkt zwischen zwei Rechnern** |

**Protokolle**: **IPsec** (**IKEv2**, **AH** = Integrität, **ESP** = Verschlüsselung; **Tunnel-** vs. **Transportmodus**), **SSL/TLS-VPN** (OpenVPN, Port 443), **WireGuard** (schlank, schnell). **Veraltet**: **PPTP**. **Split Tunneling** (nur Firmenverkehr durch VPN).

### Ethernet / Verkabelung
**Twisted Pair**: **Cat 5e (1 Gbit/s)**, **Cat 6A (10 Gbit/s, 100 m)**, **Cat 8 (25/40 Gbit/s, 30 m)**; **max. 100 m** (90 m fest + 10 m Patch). **LWL**: **Multimode** (kurz, **OM3/OM4**), **Singlemode** (lang, **OS2**). **PoE**: **802.3af 15,4 W**, **at 30 W**, **bt bis 90 W**. **Strukturierte Verkabelung**: **Primär (Gelände), Sekundär (Gebäude/Steigbereich), Tertiär (Etage)**.

### QoS und VoIP
**QoS** priorisiert **zeitkritischen Verkehr** (Sprache/Video): **Klassifizierung**, **Markierung** (**802.1p/PCP** auf L2, **DSCP** auf L3, **EF = 46** für Voice), **Queuing**, **Bandbreitenreservierung**.
**VoIP**: **SIP** (Signalisierung, 5060/5061), **RTP** (Sprachdaten, UDP), **Codecs** (**G.711 ~64 kbit/s**, **G.722 HD**, **Opus**). **Anforderungen**: **Latenz < 150 ms**, **Jitter < 30 ms**, **Paketverlust < 1 %**. **Voice-VLAN**, **PoE** für Telefone.

### Wichtige Ports
**20/21 FTP**, **22 SSH/SFTP**, **23 Telnet**, **25 SMTP**, **53 DNS**, **67/68 DHCP**, **80 HTTP**, **110 POP3**, **123 NTP**, **143 IMAP**, **161/162 SNMP**, **389 LDAP**, **443 HTTPS**, **445 SMB**, **514 Syslog**, **587 SMTP-Submission**, **636 LDAPS**, **993 IMAPS**, **995 POP3S**, **1812/1813 RADIUS**, **3389 RDP**.

## Einfach
**Subnetting** = **ein großes Grundstück in gleiche Parzellen teilen**. **VLAN** = **ein Haus mit getrennten Wohnungen**, obwohl alle am **gleichen Flur** (Switch) wohnen. **Router** = **Postbote zwischen Straßen**. **VPN** = **ein unsichtbarer Tunnel durch das Internet**. **QoS** = **Blaulicht-Spur** für Telefonate.

## Merksatz
- **Hosts = 2^Hostbits − 2**.
- **Blockgröße = 256 − Maske**.
- **IPv6: /64 Subnetz, fe80 Link-Local, kein Broadcast**.
- **Access untagged, Trunk tagged**.
- **2,4 GHz: Kanäle 1, 6, 11**.
- **WPA3 = SAE**, **Enterprise = 802.1X + RADIUS**.
- **VoIP: SIP + RTP, < 150 ms, DSCP EF 46**.

## Prüfungsfalle
- **Netz- und Broadcastadresse** nicht als Host zählen.
- **:: nur einmal** in IPv6.
- **VLANs brauchen Router** für Kommunikation.
- **Native VLAN** auf beiden Trunk-Seiten gleich.
- **Brutto-WLAN-Rate ≠ Nettodurchsatz**.
- **PPTP/WEP** als sicher angeben – falsch.
- **VLSM**: kleinere Netze zuerst → Überschneidung.

## Grafik
### Grundstück
Großes Feld /24 in vier Parzellen /26 mit Zäunen.

### Haus mit Wohnungen
Flur (Switch), Türen (VLANs), Treppe (Router).

### Tunnel
Zwei Firmengebäude, Tunnel unter der Stadt (Internet).

## Übungen
- A: 172.16.0.0/16 soll 60 Subnetze mit je max. Hosts bekommen. Präfix? | L: 2^6 = 64 ≥ 60 → /22, 1.022 Hosts.
- A: Host 10.1.5.130/25 – Netz und Broadcast? | L: Netz 10.1.5.128, Broadcast 10.1.5.255.
- A: Kürze 2001:0db8:0000:0000:0000:0a00:0000:0001. | L: 2001:db8::a00:0:1.
- A: Provider-Präfix /56. Wie viele /64-Netze? | L: 2^8 = 256.
- A: Abteilungen 100, 50, 20 Hosts aus 192.168.1.0/24 (VLSM). | L: /25 .0–.127, /26 .128–.191, /27 .192–.223.

## Karteikarten
- F: Hosts in /27? | A: 30.
- F: Formel nutzbare Hosts? | A: 2^Hostbits − 2.
- F: Private Klasse-B-Range? | A: 172.16.0.0/12.
- F: IPv6 Link-Local-Präfix? | A: fe80::/10.
- F: Standard-Subnetzgröße IPv6? | A: /64.
- F: Größe VLAN-ID? | A: 12 Bit, VLAN 1–4094.
- F: Unterschied Access- und Trunk-Port? | A: Access untagged für ein VLAN, Trunk tagged für mehrere.
- F: Überlappungsfreie Kanäle 2,4 GHz? | A: 1, 6, 11.
- F: Was verwendet WPA3 statt PSK-Handshake? | A: SAE.
- F: Was ist Site-to-Site-VPN? | A: Dauerhafte Verbindung zweier Standortnetze.
- F: Welche Werte braucht VoIP? | A: Latenz unter 150 ms, Jitter unter 30 ms, Verlust unter 1 %.
- F: Max. Länge Twisted Pair? | A: 100 m.

## Quiz
? Wie viele Hosts passen in ein /26?
* 62
- 64
- 30
- 126

? Welche Adresse ist IPv6-Link-Local?
* fe80::1
- 2001:db8::1
- ff02::1
- fd00::1

? Welcher Port-Typ führt mehrere VLANs getaggt?
* Trunk
- Access
- Native
- Mirror

? Welches Protokoll überträgt die Sprachdaten bei VoIP?
* RTP
- SIP
- SNMP
- LDAP

? Welches WLAN-Verfahren bietet individuelle Anmeldung mit RADIUS?
* WPA2/WPA3-Enterprise
- WPA2-Personal
- WEP
- Offenes WLAN

? Wie viele /64-Netze ergibt ein /48-Präfix?
* 65.536
- 256
- 64
- 16
