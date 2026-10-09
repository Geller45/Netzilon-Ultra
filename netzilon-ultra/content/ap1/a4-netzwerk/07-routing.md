---
id: ap1-a4-routing
bereich: AP1
block: A4
kapitel: Netzwerk
titel: Routing – Routingtabellen, statisch & dynamisch, RRAS
stufe: Fortgeschritten
quellen: [05-routing.pdf, Aufgaben10.pdf, Server_2008_R2_-_70_642_2nd_de.pdf]
verweise: [ap1-a4-subnetting, ap1-a4-ipv4, ap1-a3-logik, ap1-a4-vlan, ap1-a5-dhcp, ap1-a5-vpn]
---

## Profi

### Wann wird geroutet?
Nur Geräte **im selben Netz** (derselben Broadcastdomäne) können direkt miteinander kommunizieren. Der Sender entscheidet vor jedem Paket:
1. **Eigene IP AND eigene Maske** → eigene Netz-ID
2. **Ziel-IP AND eigene Maske** → Netz-ID des Ziels
3. **Gleich** → Ziel ist lokal → direkt zustellen (MAC per ARP ermitteln).
   **Ungleich** → Ziel ist fremd → Paket an das **Standardgateway** (MAC des Routers).

Beispiel: 192.168.12.121/24 → 192.168.12.196: beide ergeben 192.168.12.0 → **kein Routing**. 192.168.12.121/24 → 192.168.27.221: 192.168.12.0 ≠ 192.168.27.0 → **Routing**.

Beim Weiterleiten ändert der Router die **MAC-Adressen** (neuer Frame je Abschnitt), die **IP-Adressen bleiben** (außer bei NAT); die **TTL** wird um 1 verringert (bei 0 wird das Paket verworfen → Schutz vor Schleifen, Grundlage von `tracert`).

### Router
Ein **Router** ist mit **mehreren Netzen** verbunden (je Netz eine Schnittstelle mit eigener IP aus diesem Netz) und vermittelt Pakete anhand der **Ziel-IP** auf **OSI-Schicht 3**.
- **Hardware-Router**: spezialisierte Geräte (Cisco, Juniper, MikroTik, Fritz!Box).
- **Software-Router**: Server mit mehreren Netzwerkkarten + Routing-Software – Windows Server mit **RRAS** (Routing und RAS), Linux (`ip_forward`), pfSense/OPNsense.
- **Layer-3-Switch**: Switch mit Routing zwischen VLANs in Hardware (schnell).

### Routingtabelle
Jeder Host und jeder Router besitzt eine Routingtabelle (`route print`, `Get-NetRoute`, Cisco `show ip route`).
| Spalte | Bedeutung |
|---|---|
| Netzwerkziel + Maske | Zielnetz (0.0.0.0/0 = **Default-Route**) |
| Gateway / Next Hop | nächster Router; „Auf Verbindung“/„directly connected“ = direkt angeschlossen |
| Schnittstelle | über welche eigene Netzwerkkarte gesendet wird |
| Metrik | „Kosten“ – bei mehreren Wegen gewinnt die **niedrigste** |

**Auswahlregel**: Es gewinnt die Route mit dem **längsten passenden Präfix** (Longest Prefix Match) – also die **spezifischste**. Erst bei gleicher Präfixlänge entscheidet die Metrik. Die Default-Route (/0) passt immer, wird aber nur genommen, wenn nichts Genaueres passt.

**Routentypen**
- **Direkt verbunden (connected)**: entstehen automatisch durch die IP-Konfiguration der Schnittstellen.
- **Statisch**: vom Admin fest eingetragen.
- **Dynamisch**: per Routingprotokoll gelernt.
- **Default-Route**: „alles andere“, meist Richtung Internet.

### Statisches vs. dynamisches Routing
| | Statisch | Dynamisch |
|---|---|---|
| Einrichtung | manuell | automatischer Austausch mit Nachbarroutern |
| Vorteile | einfach, sicher, keine Last, vorhersehbar | passt sich an Änderungen und Ausfälle an, skaliert |
| Nachteile | kein automatisches Umgehen von Ausfällen, Aufwand bei vielen Netzen | komplexer, Protokoll-Overhead, Sicherheitsaspekte |
| Einsatz | kleine Netze, Default-Routen, Stub-Netze | große Netze, WAN, Internet |

**Routingprotokolle**
| Protokoll | Art | Merkmale |
|---|---|---|
| **RIP** (v2) | Distanzvektor | Metrik = **Hop-Anzahl** (max. 15), kennt nur direkte Nachbarn, tauscht alle 30 s die ganze Tabelle aus, **langsame Konvergenz** – nur kleine Netze |
| **OSPF** | Link-State | kennt die **gesamte Topologie**, berechnet per Dijkstra den „billigsten“ Weg (Kosten nach Bandbreite), schnelle Konvergenz, Areas – **große Netze** |
| **BGP** | Pfadvektor | Routing **zwischen Providern/autonomen Systemen** – das „Protokoll des Internets“ |
| EIGRP | hybrid | Cisco-proprietär (inzwischen offen) |
Windows Server RRAS unterstützt heute **nur noch RIPv2** (OSPF wurde ab Server 2008 entfernt) und BGP.

### Fehlerbilder in Routingtabellen (Prüfung Aufgaben10)
1. **Fehlende Default-Route** am Core-Switch: Er kennt nur seine direkt verbundenen Netze (172.16.31.0/30, VLAN-Netze) – Pakete ins Internet/DMZ werden verworfen. Lösung: `ip route 0.0.0.0 0.0.0.0 172.16.31.1`.
2. **Zu kleine Summary-Route** am Router: `192.168.0.0/19 via 172.16.31.2` deckt nur 192.168.0.0–192.168.31.255 ab; das Management-VLAN 192.168.40.0/29 fehlt → Antworten aus dem Internet finden nicht zurück. Lösung: /18 oder zusätzliche Route.
3. Typisch außerdem: falsches Gateway (nicht im eigenen Netz), Rückroute fehlt (Hin- geht, Rückweg nicht), Firewall blockiert ICMP, Router-Weiterleitung (IP-Forwarding) nicht aktiv.

## Lab
**Maschinen**: RTR01 (Windows Server 2022/2025, **2 Netzwerkkarten**), CL01 (Netz A), SRV01 (Netz B). Hyper-V-Host: zwei private Switches „LAN-A“ und „LAN-B“.
| Maschine | Karte | IP | Gateway |
|---|---|---|---|
| RTR01 | NIC „LAN-A“ | 192.168.1.1/24 | – |
| RTR01 | NIC „LAN-B“ | 10.10.10.1/24 | – |
| CL01 | LAN-A | 192.168.1.10/24 | 192.168.1.1 |
| SRV01 | LAN-B | 10.10.10.10/24 | 10.10.10.1 |

### GUI
1. **Hyper-V-Host**: RTR01 → Einstellungen → Hardware hinzufügen → Netzwerkkarte → zweite Karte an „LAN-B“.
2. **RTR01**: `ncpa.cpl` → Adapter umbenennen in „LAN-A“/„LAN-B“ (MAC im Hyper-V-Manager vergleichen) → IPs laut Tabelle, **kein Gateway** am Router.
3. **RTR01**: Server-Manager → Rollen und Features hinzufügen → Rolle **Remotezugriff** → Rollendienst **Routing** (DirectAccess und VPN wird automatisch mit ausgewählt) → Installieren.
4. **RTR01**: Tools → **Routing und RAS** → Rechtsklick auf Server → **„Routing und RAS konfigurieren und aktivieren“** → **Benutzerdefinierte Konfiguration** → **LAN-Routing** → Fertig stellen → Dienst starten.
5. **RTR01 / CL01 / SRV01**: ICMPv4-Echoanforderung in der Firewall erlauben (`wf.msc`).
6. **CL01 / SRV01**: IP laut Tabelle **mit Gateway** eintragen.
7. **CL01**: `ping 10.10.10.10` und `tracert 10.10.10.10` → Hop 1 = 192.168.1.1.
8. **RTR01**: RRAS-Konsole → IPv4 → Statische Routen → optional weitere Netze eintragen (Rechtsklick → Neue statische Route).

### PowerShell
```powershell
# Auf RTR01
Rename-NetAdapter -Name "Ethernet" -NewName "LAN-A"
Rename-NetAdapter -Name "Ethernet 2" -NewName "LAN-B"
New-NetIPAddress -InterfaceAlias "LAN-A" -IPAddress 192.168.1.1 -PrefixLength 24
New-NetIPAddress -InterfaceAlias "LAN-B" -IPAddress 10.10.10.1 -PrefixLength 24
Install-WindowsFeature Routing -IncludeManagementTools
Install-RemoteAccess -VpnType RoutingOnly
Enable-NetFirewallRule -Name "FPS-ICMP4-ERQ-In"
Get-NetRoute -AddressFamily IPv4

# Alternative ohne RRAS (nur Weiterleitung aktivieren):
Set-NetIPInterface -InterfaceAlias "LAN-A","LAN-B" -Forwarding Enabled

# Auf CL01
New-NetIPAddress -InterfaceAlias "Ethernet" -IPAddress 192.168.1.10 -PrefixLength 24 -DefaultGateway 192.168.1.1
Enable-NetFirewallRule -Name "FPS-ICMP4-ERQ-In"
Test-NetConnection 10.10.10.10 -TraceRoute

# Auf SRV01
New-NetIPAddress -InterfaceAlias "Ethernet" -IPAddress 10.10.10.10 -PrefixLength 24 -DefaultGateway 10.10.10.1
Enable-NetFirewallRule -Name "FPS-ICMP4-ERQ-In"

# Statische Route hinzufügen (Beispiel: weiteres Netz hinter Router 192.168.1.254)
New-NetRoute -DestinationPrefix 172.16.0.0/16 -InterfaceAlias "LAN-A" -NextHop 192.168.1.254 -RouteMetric 10
# klassisch: route -p add 172.16.0.0 mask 255.255.0.0 192.168.1.254
```

## Befehle
- `route print` / `Get-NetRoute` – Routingtabelle anzeigen
- `route -p add <Netz> mask <Maske> <Gateway> metric <n>` – dauerhafte statische Route
- `route delete <Netz>` – Route löschen
- `tracert` / `pathping` – Weg der Pakete
- Cisco: `show ip route`, `ip route 0.0.0.0 0.0.0.0 172.16.31.1`, `ip routing` (L3-Switch)

## Einfach

Stell dir Netzwerke als **Städte** vor. In der eigenen Stadt kannst du jeden Brief **selbst** zustellen. Für eine **andere Stadt** gibst du ihn beim **Postamt am Stadtrand** ab – das ist der **Router** (Standardgateway).

**Woher weiß der Computer, ob das Ziel in der eigenen Stadt liegt?** Er vergleicht die **Postleitzahlen**: Mit der Subnetzmaske schneidet er aus seiner eigenen Adresse und der Zieladresse den „Stadtteil“ heraus (AND). Gleich → selbst hinbringen. Verschieden → ab zum Postamt.

**Die Routingtabelle** ist das **Wegweiser-Buch** des Postamts:
- „Stadt A? Die liegt direkt neben mir – selbst zustellen.“
- „Stadt C? Über das Postamt in Stadt B.“
- „Alles andere? Zum großen Hauptpostamt (Internet)“ – das ist die **Default-Route**.
Gibt es mehrere passende Einträge, nimmt der Router den **genauesten** – wie beim Navi: „Musterstraße 5“ ist genauer als nur „Musterstadt“.

**Statisch oder dynamisch?**
- **Statisch**: Du schreibst die Wegweiser **von Hand**. Einfach, aber wenn eine Straße gesperrt ist, merkt es keiner.
- **Dynamisch**: Die Postämter **erzählen sich gegenseitig**, welche Wege es gibt (RIP, OSPF). Fällt eine Straße aus, finden sie automatisch einen Umweg – wie ein Navi mit Stauumfahrung.

**Die zwei typischen Prüfungsfehler**:
1. Der Wegweiser „**alles andere → Internet**“ fehlt: Die Pakete wissen nicht, wohin → verloren.
2. Ein Sammel-Wegweiser ist **zu klein**: „Städte 0 bis 31 → hier lang“ – aber Stadt 40 steht nicht drauf. Wer aus Stadt 40 kommt, findet nie den Rückweg.

**Windows als Router**: Ein Server mit zwei Netzwerkkarten kann Router spielen – mit der Rolle **„Routing und RAS“**. Dann darf er Pakete von einer Karte zur anderen weiterreichen.

## Merksatz
- **AND vergleichen** → gleich = direkt, ungleich = Gateway.
- **Längstes Präfix gewinnt**, dann niedrigste Metrik.
- **0.0.0.0/0** = Default-Route.
- RIP = **Hops** (max. 15), OSPF = **Kosten/Topologie**, BGP = **Internet**.
- Hin**weg** und Rück**weg** – beide Routen müssen existieren!

## Prüfungsfalle
- Router-Schnittstelle selbst braucht kein Standardgateway für ihre direkt verbundenen Netze.
- Fehlende Rückroute: Ping geht „hin“, Antwort kommt nie zurück.
- Summary-Route deckt nicht alle Netze ab.
- Firewall blockiert ICMP → „Routing kaputt“ ist oft nur Firewall.
- RRAS: „Benutzerdefinierte Konfiguration → LAN-Routing“, nicht „NAT“, wenn nur geroutet werden soll.

## Grafik
### Postamt-Entscheidung
Paket mit Zieladresse; Absender führt AND mit der Maske aus; Weiche „lokal/Gateway“; Paket fährt direkt oder zum Router.

### Routingtabellen-Simulator
Drei Netze, zwei Router; Nutzer trägt Routen ein; Test-Paket fährt los und bleibt bei fehlender Route mit rotem Fragezeichen stehen. Szenario „Aufgaben10“: fehlende Default-Route und /19-Fehler zum Selbstfinden.

### Longest Prefix Match
Tabelle mit /0, /16, /24; ein Zielpaket prüft jede Zeile, alle passenden leuchten gelb, die längste grün.

### RIP vs. OSPF
Netzgraph: RIP wählt den Weg mit den wenigsten Hops (über langsame Leitung), OSPF den mit den geringsten Kosten (schnelle Leitungen).

## Karteikarten
- F: Wann sendet ein Host ein Paket an das Standardgateway? | A: Wenn Netz-ID des Ziels (Ziel-IP AND eigene Maske) ≠ eigene Netz-ID.
- F: Auf welcher OSI-Schicht arbeitet ein Router? | A: Schicht 3.
- F: Was ist die Default-Route? | A: 0.0.0.0/0 – Route für alle Ziele ohne spezifischeren Eintrag.
- F: Nach welcher Regel wählt ein Router die Route? | A: Längstes passendes Präfix, danach niedrigste Metrik.
- F: Unterschied statisches und dynamisches Routing? | A: Statisch: manuell eingetragen. Dynamisch: per Routingprotokoll automatisch ausgetauscht.
- F: Metrik von RIP? | A: Hop-Anzahl (max. 15).
- F: Merkmale OSPF? | A: Link-State, kennt die Topologie, günstigster Pfad nach Kosten, schnelle Konvergenz, große Netze.
- F: Welche Windows-Rolle macht einen Server zum Router? | A: Remotezugriff mit Rollendienst Routing (RRAS).
- F: Befehl für eine dauerhafte statische Route unter Windows? | A: route -p add <Netz> mask <Maske> <Gateway>
- F: Was ändert ein Router an einem weitergeleiteten Paket? | A: Neue MAC-Adressen (neuer Frame), TTL − 1; IP-Adressen bleiben (ohne NAT).
- F: Warum fehlt dem Core-Switch in Aufgaben10 der Internetzugang? | A: Keine Default-Route zum Router 172.16.31.1.

## Quiz
? Ein Host 10.1.5.20/16 sendet an 10.1.200.7. Was passiert?
* Das Ziel ist im selben Netz, es wird direkt zugestellt
- Das Paket geht an das Standardgateway
- Das Paket wird verworfen
- Es wird ein Broadcast gesendet

? Ein Router hat die Routen 10.0.0.0/8, 10.1.0.0/16 und 10.1.1.0/24. Welche wird für 10.1.1.50 verwendet?
* 10.1.1.0/24
- 10.0.0.0/8
- 10.1.0.0/16
- die mit der höchsten Metrik

? Welches Routingprotokoll verwendet die Hop-Anzahl als Metrik?
* RIP
- OSPF
- BGP
- ARP

? Was bedeutet der Eintrag 0.0.0.0/0 via 80.90.100.1?
* Alle Ziele ohne spezifischere Route gehen an 80.90.100.1
- Das Netz 0.0.0.0 ist direkt verbunden
- Der Router ist offline
- Nur Broadcasts werden an 80.90.100.1 gesendet

? Ping von Netz A nach Netz B scheitert, obwohl der Router eine Route nach B hat. Was ist eine mögliche Ursache?
* Die Rückroute von Netz B nach Netz A fehlt
- Netz A nutzt IPv4
- Der Router hat zu viele Netzwerkkarten
- Die Subnetzmaske ist /24

? Welche administrative Distanz hat eine statische Route standardmäßig (Cisco)?
* 1
- 0
- 110
- 120
! Direkt verbunden 0, OSPF 110, RIP 120.

? Was zeigt der Windows-Befehl route print?
* Die Routingtabelle des Hosts
- Die ARP-Tabelle
- Die DNS-Cache-Einträge
- Die offenen TCP-Ports
! Alternativ: Get-NetRoute in PowerShell.

? Welches Routingprotokoll ist ein Link-State-Protokoll?
* OSPF
- RIP
- RIPv2
- Statisches Routing
! OSPF berechnet mit dem Dijkstra-Algorithmus kürzeste Wege anhand von Kosten.
