---
id: az801-netzwerk-troubleshooting
bereich: AZ-801
block: A10
kapitel: Monitoring und Troubleshooting
titel: Netzwerk-Troubleshooting
stufe: Profi
quellen: [AZ-801 Study Guide, Microsoft Learn]
verweise: [az801-azure-vm-troubleshooting, az801-firewall-lokal, ap1-a5-dns, ap1-a5-dhcp]
---

## Profi

### Vorgehen (von unten nach oben)
1. **Physik/Link**: **Kabel, Adapter, VLAN** (`Get-NetAdapter`).
2. **IP-Konfiguration**: **Adresse, Maske, Gateway, DNS** (`Get-NetIPConfiguration`).
3. **Erreichbarkeit**: **Loopback → Gateway → Ziel-IP → Name**.
4. **Namensauflösung**: **DNS** (`Resolve-DnsName`).
5. **Port/Dienst**: **Firewall, Listener** (`Test-NetConnection -Port`).
6. **Anwendung**: **Protokolle, Berechtigungen**.

### Testkette (immer in dieser Reihenfolge)
| Test | Zeigt |
|---|---|
| `ping 127.0.0.1` | **TCP/IP-Stack** **ok** |
| `ping <eigene IP>` | **Adapter** **ok** |
| `ping <Gateway>` | **Lokales Netz** **ok** |
| `ping <Remote-IP>` | **Routing** **ok** |
| `ping <Name>` | **DNS** **ok** |
| `Test-NetConnection -Port` | **Dienst** **erreichbar** |

### Typische Fehlerbilder
| Symptom | Ursache |
|---|---|
| **IP 169.254.x.x** | **APIPA**, **kein DHCP** **erreichbar** |
| **Ping IP ja, Name nein** | **DNS-Problem** |
| **Ping ja, Port nein** | **Firewall/Dienst** |
| **Nur lokales Netz** | **Gateway/Routing** **fehlt** |
| **Falsches Netz** | **VLAN-Zuordnung**, **falsche Maske** |
| **Sporadisch** | **IP-Konflikt**, **Duplex**, **Kabel** |
| **Zeitüberschreitung bei Kerberos** | **Zeitabweichung > 5 Minuten** |
| **Domänenbeitritt scheitert** | **DNS zeigt nicht auf DC** |
| **Falscher DNS-Eintrag** | **Cache** (`ipconfig /flushdns`), **veralteter Record** |

### Windows-Firewall-Profile
**Domäne**, **Privat**, **Öffentlich**. **Falsches Profil** **(z. B. Öffentlich)** **blockiert** **Freigaben**. `Get-NetConnectionProfile`.

### Wichtige Ports
| Dienst | Port |
|---|---|
| **DNS** | **53 TCP/UDP** |
| **Kerberos** | **88** |
| **LDAP / LDAPS** | **389 / 636** |
| **SMB** | **445** |
| **RPC Endpoint Mapper** | **135** |
| **RDP** | **3389** |
| **WinRM** | **5985/5986** |
| **DHCP** | **67/68 UDP** |

### Werkzeuge
| Werkzeug | Nutzen |
|---|---|
| `Test-NetConnection` | **Ping, Port, Traceroute** **in einem** |
| `tracert`, `pathping` | **Weg** **und Verlust** |
| `Resolve-DnsName`, `nslookup` | **DNS-Abfragen** |
| `Get-NetTCPConnection`, `netstat -ano` | **Verbindungen/Listener** |
| `arp -a`, `Get-NetNeighbor` | **MAC-Tabelle** |
| `route print`, `Get-NetRoute` | **Routing** |
| `Get-NetFirewallRule` | **Firewallregeln** |
| `pktmon` | **Paketaufzeichnung** **(Bordmittel)** |
| **Wireshark** | **Paketanalyse** **(extern)** |
| **Network Watcher** | **Azure-Netzwerk** |

### Befehle
```powershell
# Auf SRV01
Get-NetIPConfiguration
Get-NetAdapter | Select-Object Name, Status, LinkSpeed
Test-NetConnection 10.0.0.1
Test-NetConnection dc01.exa.local -Port 389
Test-NetConnection 8.8.8.8 -TraceRoute
Resolve-DnsName dc01.exa.local -Type A
Clear-DnsClientCache
ipconfig /release; ipconfig /renew
Get-NetTCPConnection -State Listen | Where-Object LocalPort -eq 445
Get-NetFirewallRule -Enabled True -Direction Inbound | Where-Object DisplayName -like "*Remote*"
Get-NetConnectionProfile

# Paketaufzeichnung mit Bordmitteln
pktmon start --capture --pkt-size 0
pktmon stop
pktmon etl2txt PktMon.etl

# DC-Erreichbarkeit
nltest /dsgetdc:exa.local
dcdiag /test:dns
netdom verify SRV01
```

## Lab
**Maschinen**: **SRV01**, **DC01**.

### GUI
1. **SRV01**: **Netzwerkverbindungen (ncpa.cpl) → Adapter → Status → Details** **(IP, Gateway, DNS)**.
2. **SRV01**: **Eingabeaufforderung → `ping 127.0.0.1` → `ping Gateway` → `ping DC01`**.
3. **SRV01**: **`nslookup dc01.exa.local`**.
4. **SRV01**: **PowerShell → `Test-NetConnection dc01 -Port 389`**.
5. **SRV01**: **Windows-Defender-Firewall mit erweiterter Sicherheit → Eingehende Regeln** **prüfen**.
6. **SRV01**: **Ressourcenmonitor → Netzwerk → Abhörende Ports** **ansehen**.
7. **SRV01**: **Netzwerkadapter → Einstellungen → Diagnose** **(Assistent)**.

## Einfach

**Netzwerkfehler suchen** **ist wie** **einen Wasserschaden** **im Haus finden**: **Du** **fängst** **am Wasserhahn** **an** **(dein Rechner)**, **prüfst** **dann die Leitung** **(Kabel)**, **dann** **den Hauptanschluss** **(Gateway)** **und** **zuletzt** **das Wasserwerk** **(Internet)**. **Du** **springst** **nicht** **gleich** **zum** **Wasserwerk**.

**Ping** **heißt**: **„Bist du da?“** **Test-NetConnection -Port** **heißt**: **„Bist du da und** **hörst du** **auf Tür 445?“**. **DNS** **ist das Telefonbuch**: **Ohne** **funktioniert** **die Nummer**, **aber** **nicht** **der Name**.

## Merksatz
- **Unten anfangen, oben aufhören**.
- **169.254 = kein DHCP**.
- **IP ja, Name nein = DNS**.
- **Name ja, Port nein = Firewall/Dienst**.
- **Kerberos = Zeit < 5 Minuten**.
- **Test-NetConnection = Schweizer Taschenmesser**.

## Prüfungsfalle
- **Ping** **blockiert** **≠** **Host** **down** **(ICMP-Filter)**.
- **Falsches Firewallprofil** **(Öffentlich)**.
- **DNS** **auf** **externen Server** **statt DC** **→** **Domäne nicht** **erreichbar**.
- **Veralteter DNS-Cache** **nach** **IP-Änderung**.
- **Falsche Subnetzmaske** **→** **teilweise Erreichbarkeit**.
- **Zeitabweichung** **> 5 Minuten** **bricht** **Kerberos**.
- **`nslookup`** **ignoriert** **hosts-Datei** **und** **lokalen Cache**, **`ping`** **nicht**.

## Grafik
### Wasserschaden
Kette: Hahn, Leitung, Hauptanschluss, Wasserwerk mit Prüfpunkten.

### Testleiter
Sprossen: Loopback, eigene IP, Gateway, Ziel-IP, Name, Port.

### Ports als Türen
Haus mit Türen 53, 88, 389, 445, 3389; manche verschlossen.

## Karteikarten
- F: Was bedeutet 169.254.x.x? | A: APIPA, kein DHCP-Server erreichbar.
- F: Welches Cmdlet ersetzt telnet und ping? | A: Test-NetConnection.
- F: Wie testet man einen Port? | A: Test-NetConnection -Port.
- F: Womit leert man den DNS-Client-Cache? | A: Clear-DnsClientCache oder ipconfig /flushdns.
- F: Welcher Port nutzt Kerberos? | A: 88.
- F: Welche Zeitabweichung bricht Kerberos? | A: Mehr als 5 Minuten.
- F: Welches Bordmittel zeichnet Pakete auf? | A: pktmon.
- F: Welches Cmdlet zeigt Listener? | A: Get-NetTCPConnection -State Listen.
- F: Warum kann ein Ping scheitern trotz laufendem Host? | A: ICMP ist durch Firewall blockiert.

## Quiz
? Ein Client hat die IP 169.254.10.5. Ursache?
* Kein DHCP-Server erreichbar
- Falsche Domäne
- DNS-Fehler
- Firewall-Blockade

? Ping auf die IP klappt, auf den Namen nicht. Wahrscheinlich?
* DNS-Problem
- Kabelbruch
- Falsche Maske
- Kein Gateway

? Welches Cmdlet prüft, ob Port 389 erreichbar ist?
* Test-NetConnection -Port 389
- Get-NetAdapter
- Resolve-DnsName
- Get-Service

? Kerberos-Anmeldung scheitert sporadisch. Was prüft man?
* Zeit auf Client und DC
- Bildschirmauflösung
- Druckerport
- Hyper-V-Version

? Womit zeichnet man Pakete ohne Zusatzsoftware auf?
* pktmon
- Wireshark
- perfmon
- robocopy

? Wie leert man den lokalen DNS-Cache per PowerShell?
* Clear-DnsClientCache
- Clear-Dns
- Reset-Dns
- Flush-Cache

? Welcher Befehl zeigt den Weg eines Pakets mit Laufzeiten je Hop?
* tracert bzw. Test-NetConnection -TraceRoute
- ipconfig /all
- nslookup
- arp -a
! pathping kombiniert tracert mit Paketverluststatistik.

? Welcher Befehl zeigt offene Verbindungen mit Prozess-ID?
* netstat -ano bzw. Get-NetTCPConnection
- ipconfig /displaydns
- route print
- nbtstat -n
! Die PID lässt sich im Task-Manager einem Prozess zuordnen.
