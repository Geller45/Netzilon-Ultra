---
id: legacy-alte-netztechnik
bereich: Legacy
block: A12
kapitel: Legacy-Box
titel: Alte Netztechnik – Hub, Koax, Token Ring, IPX/SPX und Co.
stufe: Einsteiger
quellen: [AP1-Unterlagen OSI/DoD, physische Struktur; IEEE 802.3/802.5; eigene Zusammenstellung]
verweise: [ap1-a4-netzwerkgrundlagen, ap1-a4-topologie, ap1-a4-routing, ap1-a4-vlan]
---

## Profi

### Ethernet-Entwicklung
| Standard | Jahr | Medium | Topologie | Geschwindigkeit | Status |
|---|---|---|---|---|---|
| **10BASE5** („Thick Ethernet“) | 1983 | Dickes Koax (max. 500 m) | **Bus** | 10 Mbit/s | **Legacy** |
| **10BASE2** („Thin Ethernet“) | 1985 | Dünnes Koax RG-58, **BNC**, T-Stück, **Terminator 50 Ω** (max. 185 m) | **Bus** | 10 Mbit/s | **Legacy** |
| **10BASE-T** | 1990 | **Twisted Pair Cat3**, RJ-45 | **Stern** (Hub) | 10 Mbit/s | Legacy |
| **100BASE-TX** (Fast Ethernet) | 1995 | **Cat5**, 2 Paare | Stern (Switch) | 100 Mbit/s | Noch verbreitet |
| **1000BASE-T** (Gigabit) | 1999 | **Cat5e**, 4 Paare | Stern | 1 Gbit/s | **Standard** |
| **2,5/5/10GBASE-T** | ab 2016 | Cat5e/Cat6/**Cat6a** | Stern | 2,5–10 Gbit/s | Aktuell |
| **Glasfaser** (100BASE-FX, 1000BASE-SX/LX, 10GBASE-SR/LR) | – | **Multimode/Singlemode** | Stern/Ring | 100 Mbit/s – 400 Gbit/s | Aktuell |

Das **T** steht für *Twisted Pair* (verdrillt), **BASE** für *Basisband*.

### Hub, Bridge, Switch
| Gerät | OSI-Schicht | Verhalten | Status |
|---|---|---|---|
| **Repeater** | 1 | Verstärkt/regeneriert Signal | Legacy |
| **Hub** | 1 | **Sendet an alle Ports** (1 **Kollisionsdomäne**, 1 Broadcastdomäne) | **Legacy**: **Half-Duplex**, **Sniffing leicht** |
| **Bridge** | 2 | Lernt MAC-Adressen, trennt Kollisionsdomänen | Vorläufer des Switches |
| **Switch** | 2 | **MAC-Tabelle**, **pro Port eine Kollisionsdomäne**, **Full-Duplex** | **Standard** |
| **Router / L3-Switch** | 3 | Trennt **Broadcastdomänen** | Standard |

### CSMA/CD → Full-Duplex
- **CSMA/CD** (*Carrier Sense Multiple Access with Collision Detection*): Wer sendet, hört mit; bei **Kollision** Abbruch und **Backoff**. Nötig bei **Half-Duplex/Hub/Koax**.
- Im **Switch-Netz mit Full-Duplex** gibt es **keine Kollisionen**, CSMA/CD ist **überflüssig**.
- **Duplex-Mismatch** (eine Seite Auto, andere fest 100/Full) → **Late Collisions, CRC-Fehler, schlechte Leistung**.
- **WLAN** nutzt **CSMA/CA** (Collision **Avoidance**).

### Token Ring, FDDI
- **Token Ring (IEEE 802.5)**: **Ring**, ein **Token** kreist; nur der Besitzer sendet, **kollisionsfrei**, 4/16 Mbit/s. **Legacy** (IBM).
- **FDDI**: Doppelter **Glasfaserring**, 100 Mbit/s, **Legacy** (Backbones der 90er).

### Alte Netzwerk-Protokollfamilien
| Familie | Merkmale | Ersatz |
|---|---|---|
| **IPX/SPX** | Novell NetWare, **eigene Adressen** | **TCP/IP** |
| **NetBEUI** | Nicht routbar, für kleine Netze, Windows NT/9x | **TCP/IP** |
| **AppleTalk** | Apple, automatische Adresse | **TCP/IP, Bonjour (mDNS)** |
| **DECnet, SNA** | Herstellerspezifisch | TCP/IP |
| **RIPv1** | **Classful**, kein Subnetzmaske im Update, Broadcast (255.255.255.255) | **RIPv2/OSPF/EIGRP** |
| **IGRP** | Cisco, veraltet | **EIGRP** |
| **ISDN** | 2×64 kbit/s (B-Kanäle) + 16 kbit/s (D-Kanal), **Abschaltung in Deutschland** | **DSL/Glasfaser, VoIP** |
| **X.25, Frame Relay, ATM** | WAN-Paketvermittlung | **MPLS, Ethernet-WAN, SD-WAN** |
| **Analoges Modem / PPP** | 56 kbit/s | DSL, LTE/5G |

### Kabel: Legacy und Kategorien
| Kategorie | Max. Frequenz | Typische Nutzung | Status |
|---|---|---|---|
| **Cat3** | 16 MHz | 10BASE-T, Telefon | Legacy |
| **Cat5** | 100 MHz | 100 Mbit/s | Legacy |
| **Cat5e** | 100 MHz | **1 Gbit/s** | Mindeststandard |
| **Cat6** | 250 MHz | 1 Gbit/s, bis 10 Gbit/s kurz (55 m) | verbreitet |
| **Cat6a** | 500 MHz | **10 Gbit/s** bis 100 m | Neuverkabelung |
| **Cat7/7a** | 600/1000 MHz | Geschirmt (S/FTP) | Nischen |
| **Cat8** | 2000 MHz | 25/40 Gbit/s bis 30 m | Rechenzentrum |
Maximale Länge **Twisted Pair 100 m** (90 m Festverkabelung + 2×5 m Patchkabel).

### Bezug zur Ausbildung
- **Kollisionsdomänen und Broadcastdomänen** zählen: **Hub-Ports zusammen = 1 Kollisionsdomäne**, **jeder Switch-Port = eigene**, **Router-Port = eigene Broadcastdomäne**, **VLAN = eigene Broadcastdomäne**.
- **ARP-Spoofing** und **Sniffing** funktionieren auf Hubs trivial, auf Switches nur mit Zusatzangriff (MAC-Flooding/ARP-Poisoning).

## Lab
**Maschinen**: **SW1** (Cisco-Switch), **CL01/CL02** (Clients).

### GUI
1. **CL01**: `ncpa.cpl` → Ethernet → Eigenschaften → **Konfigurieren → Erweitert → Verbindungsgeschwindigkeit und Duplex** ansehen (nicht ändern, wenn die Gegenseite auto ist).
2. **CL01**: `ipconfig /all` (Beschreibung der Karte, MAC).
3. **CL01**: **Task-Manager → Leistung → Ethernet** → Verbindungsgeschwindigkeit (z. B. 1 Gbit/s).
4. **SW1** (Cisco-CLI, siehe unten): Duplex und Geschwindigkeit des Ports prüfen.
5. **CL01**: **Wireshark** → Filter `ip.addr==192.168.10.1` und Beobachten, dass ein Switch nur das eigene Ziel zeigt.

### PowerShell
```powershell
# Auf CL01 – Adapter, Geschwindigkeit, Duplex
Get-NetAdapter | Select-Object Name, InterfaceDescription, LinkSpeed, FullDuplex, MacAddress
Get-NetAdapterAdvancedProperty -Name "Ethernet" | Where-Object DisplayName -like "*Duplex*"
```

Cisco-Switch:

```
! Auf SW1 – Port prüfen
show interfaces fa0/1 status
show interfaces fa0/1 | include duplex|speed|collisions|CRC
! Fest einstellen (nur wenn beide Seiten fest!)
interface fa0/1
 speed 100
 duplex full
! Zurück auf Autonegotiation
interface fa0/1
 speed auto
 duplex auto
```

## Befehle
- `Get-NetAdapter \| Select LinkSpeed, FullDuplex` – Geschwindigkeit/Duplex
- `show interfaces status` – Cisco: Port, Duplex, Speed
- `show interfaces fa0/1` – Zähler (Collisions, CRC, Runts)
- `show mac address-table` – MAC-Tabelle des Switches
- `ipconfig /all` – Karte und MAC-Adresse
- `arp -a` – ARP-Tabelle

## Einfach

Stell dir vor, viele Leute wollen **im selben Klassenraum sprechen**.

**Koax-Bus (10BASE2)**: Alle sitzen an **einem langen Tisch**. Wenn zwei gleichzeitig sprechen, **kollidieren sie** und beide müssen von vorn anfangen (**CSMA/CD**). Wenn **ein Stuhl** wegbricht (Kabelbruch), **fällt der ganze Tisch aus**.

**Hub**: Ein **Lautsprecher in der Mitte** wiederholt **jedes Wort für alle**. Alle hören alles, und wenn zwei gleichzeitig sprechen, gibt's **Kollisionen**. Jeder Zuhörer kann **mitschreiben** (Sniffing).

**Switch**: Ein **Sekretär in der Mitte**. Er weiß, wer wo sitzt (**MAC-Tabelle**) und **gibt jede Nachricht nur an den Empfänger**. Alle können **gleichzeitig reden** (**Full-Duplex**), es gibt **keine Kollisionen**.

**Token Ring**: Es gibt **einen Stab** (Token), der im Kreis herumgereicht wird. **Nur wer den Stab hat, darf sprechen.** Fair, aber langsam, wenn jemand den Stab verliert.

**IPX/SPX, NetBEUI, AppleTalk** sind **andere Sprachen**: früher sprach jede Firma ihre eigene. Heute sprechen fast alle **TCP/IP**, wie **Englisch als Weltsprache**.

## Merksatz
- **Hub = Layer 1, Switch = Layer 2, Router = Layer 3.**
- **Hub**: 1 Kollisions- und 1 Broadcastdomäne. **Switch**: Kollisionsdomäne **je Port**.
- **10BASE2 = BNC, 185 m, Terminator 50 Ω.**
- **Twisted Pair max. 100 m.**
- **Cat5e = 1 Gbit/s, Cat6a = 10 Gbit/s (100 m).**
- **WLAN = CSMA/CA, Ethernet-Hub = CSMA/CD.**

## Prüfungsfalle
- **Switch trennt Kollisionsdomänen, nicht Broadcastdomänen** (das tun Router/VLANs).
- **Full-Duplex** = **keine Kollisionen**, **CSMA/CD deaktiviert**.
- **Duplex-Mismatch** entsteht, wenn **eine Seite fest** und die andere **auto** steht (Auto erkennt Duplex nicht → Half).
- **Cat5e** ist bereits für **Gigabit** ausreichend.
- **ISDN** = **2 B-Kanäle (64 kbit/s) + 1 D-Kanal (16 kbit/s)**.

## Grafik
### Domänen zählen
Ein Netzplan mit Hub, Switch und Router; Klick auf „Kollisionsdomänen“ färbt die Bereiche ein (Hub-Bereich 1 Farbe, jeder Switch-Port eigene), „Broadcastdomänen“ zeigt die Grenzen an Routern/VLANs.

### Tisch, Lautsprecher, Sekretär
Drei Klassenzimmer: Koax-Tisch mit Kollisionsblitzen, Hub-Lautsprecher mit Mitschreiber, Switch-Sekretär, der Zettel nur an den Empfänger reicht.

## Karteikarten
- F: Welche OSI-Schicht hat ein Hub? | A: Schicht 1 (Bitübertragung).
- F: Welche OSI-Schicht hat ein Switch? | A: Schicht 2 (Sicherung), mit MAC-Tabelle.
- F: Wie viele Kollisionsdomänen bilden alle Hub-Ports zusammen? | A: Eine.
- F: Trennt ein Switch Broadcastdomänen? | A: Nein, nur Router bzw. VLANs.
- F: Wofür steht CSMA/CD? | A: Carrier Sense Multiple Access with Collision Detection.
- F: Welches Verfahren nutzt WLAN? | A: CSMA/CA (Collision Avoidance).
- F: Max. Länge von Twisted Pair? | A: 100 m (90 m + 2×5 m Patchkabel).
- F: Welche Kategorie genügt für 1 Gbit/s? | A: Cat5e.
- F: Welche Kategorie für 10 Gbit/s über 100 m? | A: Cat6a.
- F: Welches Medium nutzt 10BASE2? | A: Dünnes Koaxialkabel RG-58 mit BNC und 50-Ω-Abschluss.
- F: Wie arbeitet Token Ring? | A: Ein Token kreist im Ring, nur der Besitzer darf senden, kollisionsfrei.
- F: Was ist ein Duplex-Mismatch? | A: Eine Seite Full, die andere Half; Ursache oft fest/auto.

## Quiz
? Welche OSI-Schicht hat ein Hub?
* Schicht 1
- Schicht 2
- Schicht 3
- Schicht 4

? Wie viele Kollisionsdomänen hat ein 8-Port-Hub?
* 1
- 8
- 2
- 0

? Welche Kabelkategorie ist mindestens für Gigabit-Ethernet nötig?
* Cat5e
- Cat3
- Cat5
- Cat8

? Wer trennt Broadcastdomänen?
* Router
- Hub
- Repeater
- Bridge

? Welches Verfahren nutzt Ethernet im Halbduplex?
* CSMA/CD
- CSMA/CA
- Token Passing
- TDMA

? Wie lang darf ein Twisted-Pair-Segment höchstens sein?
* 100 m
- 55 m
- 185 m
- 500 m
