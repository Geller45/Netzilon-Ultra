---
id: ap1-a4-vlan
bereich: AP1
block: A4
kapitel: Netzwerk
titel: VLANs nach IEEE 802.1Q
stufe: Fortgeschritten
quellen: [VLAN.pdf, Aufgaben10.pdf]
verweise: [ap1-a4-topologie, ap1-a4-routing, ap1-a4-subnetting, az800-vswitch]
---

## Profi

### Definition
Ein **VLAN** (Virtual LAN) ist ein **logisch** abgegrenztes Netz innerhalb einer physischen Switch-Infrastruktur. Jedes VLAN ist eine **eigene Broadcastdomäne** – obwohl die Geräte an denselben Switches hängen. Geräte in verschiedenen VLANs können **nur über einen Router bzw. Layer-3-Switch** miteinander kommunizieren (**Inter-VLAN-Routing**). In der Regel gilt: **ein VLAN = ein IP-Subnetz**.

### Gründe für VLANs
1. **Organisationsstruktur abbilden** (Abteilungen wie Verwaltung, Entwicklung, Management – unabhängig vom Standort im Gebäude)
2. **Änderungen vereinfachen** – „virtuelles Patchen“: Bei einem Umzug wird nur der Switchport umkonfiguriert, nicht neu verkabelt
3. **Administrationskosten** senken (weniger Hardware, zentrale Verwaltung)
4. **Broadcasts begrenzen** → bessere Performance
5. **Sicherheit erhöhen**: Abteilungen/Gäste/Server/IoT getrennt, Regeln zwischen VLANs per Firewall/ACL
Zusätzlich: **QoS** (Priorisierung von VoIP-VLANs), Trennung von Management-Netzen.

### VLAN-Typen
| Typ | Zuordnung nach | Eigenschaft | Vorteil | Nachteil |
|---|---|---|---|---|
| **Portbasiert** (statisch, Layer 1) | Switchport | statisch | einfache Implementierung, Standard in der Praxis | Umzüge erfordern Umkonfiguration, Aufwand bei vielen Ports |
| **MAC-basiert** (Layer 2) | MAC-Adresse des Geräts | dynamisch | Gerät behält VLAN an jedem Port, relativ hohe Sicherheit | Pflege aller MAC-Adressen aufwendig, MAC fälschbar |
| **Protokoll-/Policy-basiert** (Layer 3) | Protokoll oder IP-Subnetz | dynamisch | flexibel, standortübergreifend | je nach Regel komplex |
| (Benutzerbasiert) | Anmeldung per **802.1X**/RADIUS | dynamisch | VLAN folgt dem Benutzer | Infrastruktur nötig |

### Switchübergreifende VLANs – Tagging
Verbindet man mehrere Switches, müssen die Frames **mehrerer VLANs über eine Leitung** (Trunk/Uplink) laufen. Der empfangende Switch muss wissen, zu welchem VLAN ein Frame gehört:
- **Implizite Markierung**: Zuordnung über ein Merkmal im Frame (MAC, IP) – selten.
- **Explizite Markierung (Tag)**: Dem Frame wird ein **VLAN-Tag** nach **IEEE 802.1Q** hinzugefügt.

**Aufbau des 802.1Q-Tags (4 Byte = 32 Bit)**, eingefügt zwischen Quell-MAC und Typfeld:
| Feld | Bit | Inhalt |
|---|---|---|
| **TPID** (Tag Protocol Identifier) | 16 | fester Wert **0x8100** → „dieser Frame ist getaggt“ |
| **PCP** (Priority Code Point) | 3 | Priorität 0–7 (QoS, IEEE 802.1p) |
| **DEI** (Drop Eligible Indicator, früher CFI) | 1 | Frame darf bei Stau zuerst verworfen werden |
| **VID** (VLAN Identifier) | **12** | VLAN-Nummer |
TCI = PCP + DEI + VID (16 Bit).

**Maximale Anzahl VLANs**: 12 Bit → 2¹² = **4.096** Werte; **0** (nur Priorität, kein VLAN) und **4095** sind reserviert → **4.094 nutzbare VLANs (1–4094)**. VLAN 1 ist meist Standard-/Default-VLAN.
Durch das Tag wächst der Ethernet-Frame von max. **1518 auf 1522 Byte** (IEEE 802.3ac).

### Access- und Trunk-Ports
| Port | Cisco | andere Hersteller | Frames | Beispiel |
|---|---|---|---|---|
| **Access** | `switchport mode access` | **untagged** | ohne Tag, gehören genau **einem** VLAN | PC, Drucker |
| **Trunk** | `switchport mode trunk` | **tagged** | tragen **mehrere** VLANs mit Tag | Switch ↔ Switch, Switch ↔ Router, Switch ↔ Hyper-V-Host/Access Point |
- **Native VLAN**: Auf einem Trunk wird genau ein VLAN **ungetaggt** übertragen (Cisco Standard: VLAN 1) – auf beiden Seiten gleich einstellen; aus Sicherheitsgründen ein ungenutztes VLAN wählen (VLAN-Hopping).
- **Warum ist Tagging zwischen den Switches zwingend (Aufgaben10)?** Über die Verbindung Core-Switch ↔ WS-03 laufen Frames aller Abteilungs-VLANs. Ohne Tag wüsste der empfangende Switch nicht, zu welchem VLAN (welcher Broadcastdomäne) ein Frame gehört – die Trennung ginge verloren bzw. es müsste für jedes VLAN ein eigenes Kabel gezogen werden.

### Inter-VLAN-Routing
- **Layer-3-Switch** mit einer virtuellen Schnittstelle je VLAN (**SVI**, z. B. `interface Vlan10` mit 192.168.10.62) – schnell, Standard.
- **Router-on-a-Stick**: Ein Router mit **einer** Trunk-Leitung und **Subinterfaces** je VLAN.
- Die IP der SVI/Subinterface ist das **Standardgateway** der Clients im VLAN.

### VLANs in Hyper-V
Eine VM-Netzwerkkarte kann unter **Einstellungen → Netzwerkkarte → „Identifizierung virtueller LANs aktivieren“** eine VLAN-ID bekommen (`Set-VMNetworkAdapterVlan -VMName CL01 -Access -VlanId 10`). Der Host-Port am physischen Switch muss dann ein **Trunk** sein.

## Lab
**Hyper-V-Host** (Simulation ohne echten Switch): Externer bzw. privater Switch, zwei VMs in verschiedenen VLANs.

### GUI
1. **Hyper-V-Host**: VM **CL01** → Einstellungen → Netzwerkkarte → Haken „Identifizierung virtueller LANs aktivieren“ → **10**.
2. **Hyper-V-Host**: VM **SRV01** → gleiche Stelle → **20**.
3. **CL01**: 192.168.10.10/24, **SRV01**: 192.168.10.20/24 (bewusst gleiches Subnetz).
4. **CL01**: `ping 192.168.10.20` → **scheitert**, weil die VMs in verschiedenen VLANs (Broadcastdomänen) liegen.
5. **SRV01** auf VLAN **10** umstellen → ping funktioniert.

### PowerShell
```powershell
# Auf dem Hyper-V-Host
Set-VMNetworkAdapterVlan -VMName "CL01" -Access -VlanId 10
Set-VMNetworkAdapterVlan -VMName "SRV01" -Access -VlanId 20
Get-VMNetworkAdapterVlan

# Trunk für einen Router-VM-Adapter (mehrere VLANs getaggt)
Set-VMNetworkAdapterVlan -VMName "RTR01" -Trunk -AllowedVlanIdList "10,20,30" -NativeVlanId 0
```

### Cisco IOS (Referenz)
```
! Switch: VLANs anlegen
vlan 10
 name Verwaltung
vlan 20
 name Entwicklung
vlan 199
 name Management
! Access-Port für einen PC
interface FastEthernet0/1
 switchport mode access
 switchport access vlan 10
! Trunk zum anderen Switch
interface GigabitEthernet0/1
 switchport mode trunk
 switchport trunk allowed vlan 10,20,199
 switchport trunk native vlan 999
! Layer-3-Switch: Inter-VLAN-Routing
ip routing
interface Vlan10
 ip address 192.168.10.62 255.255.255.192
interface Vlan20
 ip address 192.168.20.30 255.255.255.224
ip route 0.0.0.0 0.0.0.0 172.16.31.1
! Kontrolle
show vlan brief
show interfaces trunk
show ip route
```

## Übungen
- A: Zwei Gründe für VLANs (Event GmbH, Abteilungen) | L: Abteilungen logisch trennen (Sicherheit, Zugriffsregeln); Broadcasts begrenzen; Umzüge per Konfiguration statt Neuverkabelung
- A: Maximale Anzahl VLANs mit Rechenweg | L: VID = 12 Bit → 2¹² = 4.096; abzüglich 0 und 4095 (reserviert) = 4.094
- A: Warum ist VLAN-Tagging zwischen Core-Switch und WS-03 zwingend? | L: Über die Verbindung laufen mehrere VLANs; nur das 802.1Q-Tag sagt dem Switch, zu welchem VLAN der Frame gehört – sonst keine Trennung
- A: Wert des TPID-Felds | L: 0x8100

## Einfach

Stell dir eine **Schule** vor, in der alle Klassen im **gleichen großen Raum** sitzen. Chaos! Jede Durchsage hören alle, und jeder kann jedem über die Schulter schauen.

**VLANs** sind **unsichtbare Wände** in diesem Raum. Die 5a sitzt zwar neben der 10b, aber sie **hören sich nicht** – jede Klasse hat ihren eigenen „Lautsprecher“ (Broadcastdomäne). Und das alles, **ohne eine echte Wand zu bauen** – nur durch Einstellungen am Switch.

**Warum ist das toll?**
- **Sicherheit**: Die Buchhaltung ist von den Azubis getrennt.
- **Ruhe**: Weniger Durchsagen, die alle stören.
- **Umzug leicht gemacht**: Zieht jemand in ein anderes Büro, wird nur am Switch umgeschaltet – kein neues Kabel.

**Wie weiß ein Switch, wer zu welcher Klasse gehört?**
- Am **normalen Anschluss** (Access-Port) ist fest eingestellt: „Wer hier sitzt, ist in Klasse 10.“
- Zwischen **zwei Switches** laufen aber Schüler **aller** Klassen über denselben Flur (Trunk). Deshalb bekommt jeder ein **Namensschild** (Tag) mit seiner Klassennummer. Der nächste Switch liest das Schild und weiß Bescheid. Das Schild ist in der Norm **802.1Q** beschrieben.

**Wie viele Klassen gehen?** Das Schild hat Platz für eine 12-stellige Binärzahl → 4.096 Möglichkeiten, zwei sind reserviert → **4.094 VLANs**.

**Und wenn zwei Klassen doch miteinander reden wollen?** Dann brauchen sie einen **Dolmetscher an der Tür**: einen **Router** oder Layer-3-Switch. Der kann dann auch entscheiden, wer mit wem reden darf.

## Merksatz
- **1 VLAN = 1 Broadcastdomäne = 1 Subnetz**.
- **Access = untagged, ein VLAN** · **Trunk = tagged, viele VLANs**.
- Tag: **TPID 16 · PCP 3 · DEI 1 · VID 12** – „**T**ante **P**aula **D**arf **V**orne“.
- **4.094** VLANs (2¹² − 2).
- Zwischen VLANs nur per **Router/L3-Switch**.

## Prüfungsfalle
- VLANs trennen **Broadcastdomänen**, nicht nur Kollisionsdomänen.
- Ohne Router/L3-Switch keine Kommunikation zwischen VLANs – auch nicht bei gleichem Subnetz.
- 4.096 statt 4.094 angegeben.
- Native VLAN auf beiden Trunk-Seiten unterschiedlich → Fehler/Sicherheitslücke.
- Frame-Größe mit Tag 1522 Byte.

## Grafik
### Unsichtbare Wände
Ein Switch mit 12 PCs in drei Farben; Broadcast eines roten PCs erreicht nur rote PCs; Schalter „VLANs aus“ lässt den Broadcast alle erreichen.

### 802.1Q-Tag
Ethernet-Frame als Zug; zwischen Quell-MAC und Typ wird ein 4-Byte-Waggon eingekoppelt; Klick auf die Felder zeigt TPID 0x8100, PCP, DEI, VID; Rechenweg 2¹² − 2 blendet sich ein.

### Access vs. Trunk
Zwei Switches; Frames laufen untagged zu den PCs, bekommen am Trunk ein Namensschild, verlieren es am Ziel-Access-Port wieder.

### Inter-VLAN-Routing
L3-Switch mit SVIs; ein Paket von VLAN 10 nach VLAN 20 geht hoch zur SVI, wird geroutet und wieder hinunter.

## Karteikarten
- F: Was ist ein VLAN? | A: Ein logisch (nicht physisch) abgegrenztes LAN – eigene Broadcastdomäne auf gemeinsamer Switch-Hardware.
- F: Fünf Gründe für VLANs? | A: Organisationsstruktur abbilden, einfachere Änderungen, geringere Kosten, Broadcast-Kontrolle, Sicherheit.
- F: Drei VLAN-Typen? | A: Portbasiert (statisch), MAC-basiert, protokoll-/policybasiert (dynamisch).
- F: Norm für VLAN-Tagging? | A: IEEE 802.1Q.
- F: Wert des TPID? | A: 0x8100.
- F: Wie viele Bit hat die VLAN-ID? | A: 12 Bit → 4.094 nutzbare VLANs.
- F: Was bedeutet PCP? | A: Priority Code Point – 3 Bit Priorität für QoS.
- F: Unterschied Access- und Trunk-Port? | A: Access: ein VLAN, untagged. Trunk: mehrere VLANs, tagged.
- F: Was ist das Native VLAN? | A: Das VLAN, das auf einem Trunk ungetaggt übertragen wird.
- F: Wie kommunizieren Geräte verschiedener VLANs? | A: Über einen Router oder Layer-3-Switch (Inter-VLAN-Routing).
- F: Maximale Framegröße mit 802.1Q-Tag? | A: 1522 Byte.

## Quiz
? Wie viele VLANs können nach IEEE 802.1Q maximal genutzt werden?
* 4.094
- 4.096
- 1.024
- 65.536

? Welcher Porttyp überträgt mehrere VLANs mit Tag?
* Trunk
- Access
- Native
- Mirror

? Zwei PCs in VLAN 10 und VLAN 20 haben IPs aus demselben Subnetz. Können sie sich direkt anpingen?
* Nein, VLANs sind getrennte Broadcastdomänen
- Ja, gleiches Subnetz reicht
- Ja, aber nur per IPv6
- Nur wenn beide am selben Switch hängen

? Welches Feld des 802.1Q-Tags enthält die Priorität?
* PCP
- VID
- TPID
- DEI

? Welcher VLAN-Typ ordnet anhand des Switchports zu?
* Portbasiertes VLAN
- MAC-basiertes VLAN
- Policy-basiertes VLAN
- Protokollbasiertes VLAN

? Wie groß ist der 802.1Q-Tag?
* 4 Byte
- 2 Byte
- 8 Byte
- 12 Bit
! Er enthält TPID, PCP, DEI und die 12-Bit-VLAN-ID.

? Was wird für die Kommunikation zwischen zwei VLANs benötigt?
* Ein Router oder Layer-3-Switch
- Ein Hub
- Ein Repeater
- Ein zweiter Access-Port im selben VLAN
! VLANs sind getrennte Broadcastdomänen.

? Welcher Vorteil entsteht durch VLANs?
* Kleinere Broadcastdomänen und Trennung von Netzbereichen
- Höhere Kabelreichweite
- Kein Router mehr nötig
- Automatische Verschlüsselung
! Zudem flexible Zuordnung unabhängig vom Standort.
