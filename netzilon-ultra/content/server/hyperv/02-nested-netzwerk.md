---
id: server-hyperv-nested-netzwerk
bereich: AZ-800
block: HV
kapitel: Hyper-V vertieft
titel: Netzwerk für verschachtelte VMs – MAC-Spoofing, NAT, Azure, DHCP
stufe: Fortgeschritten
fach: Windows Server / AZ-800
pruefungen: [AZ-800, AP2, Schule]
quellen: [Microsoft Learn – Hyper-V-Dokumentation, AZ-800 Study Guide]
verweise: [az800-nested, az800-vswitch, az800-azure-vms, az800-dhcp, server-hyperv-nested-grundlagen, server-hyperv-vswitch-vlan, server-hyperv-nested-lab]
---

## Profi

### Das Problem
Eine innere VM (**INNER01**, L2) hängt an einem virtuellen Switch **in** der äußeren VM (**HV-NESTED**, L1). Ihre Frames verlassen HV-NESTED über dessen virtuelle Netzwerkkarte und landen am vSwitch des physischen Hosts **HV01.example.com** (L0). Dieser vSwitch kennt aber nur **eine** MAC-Adresse für den Port von HV-NESTED. Frames mit der **fremden Quell-MAC** von INNER01 verwirft er standardmäßig – Schutzfunktion gegen MAC-Spoofing. Ergebnis: INNER01 hat **kein Netzwerk**, obwohl HV-NESTED selbst online ist.

Microsoft dokumentiert zwei Lösungswege:

### Option 1 – MAC-Adress-Spoofing (*MAC Address Spoofing*)
Auf **L0** erlaubt man der vNIC der äußeren VM, Frames mit fremden Quell-MAC-Adressen zu senden und Frames für fremde Ziel-MACs zu empfangen.
```powershell
# Auf HV01.example.com
Get-VMNetworkAdapter -VMName HV-NESTED | Set-VMNetworkAdapter -MacAddressSpoofing On
```
GUI: VM-Einstellungen → Netzwerkkarte → **Erweiterte Features** → „**Spoofing von MAC-Adressen aktivieren**“.

In **HV-NESTED** legt man dann einen **externen** vSwitch auf dessen (virtuelle) Netzwerkkarte. INNER01 hängt an diesem Switch und ist damit **direkt im selben Layer-2-Netz** wie der Host – bekommt z. B. eine IP vom normalen DHCP-Server des LANs.

| Vorteil | Nachteil |
|---|---|
| sehr einfach, innere VMs sind normal erreichbar | geht nur, wo man den L0-Switch kontrolliert (eigener Hyper-V-Host) |
| kein Routing/NAT nötig, Cluster/AD-Szenarien laufen „echt“ | Sicherheitsschutz des Ports wird gelockert |
| DHCP aus dem LAN funktioniert | **nicht in Azure** (und bei vielen Hostern) möglich |

### Option 2 – NAT (*Network Address Translation*) in der äußeren VM
Die äußere VM wird zum **Router mit NAT**. INNER01 hängt an einem **internen** vSwitch in HV-NESTED; HV-NESTED übersetzt deren private Adressen auf seine eigene IP. Nach außen erscheint nur die MAC/IP von HV-NESTED – darum braucht man **kein** MAC-Spoofing.
```powershell
# In HV-NESTED (L1)
New-VMSwitch -Name "NestedNAT" -SwitchType Internal
New-NetIPAddress -IPAddress 192.168.100.1 -PrefixLength 24 -InterfaceAlias "vEthernet (NestedNAT)"
New-NetNat -Name "NestedNAT" -InternalIPInterfaceAddressPrefix 192.168.100.0/24
```
- **New-VMSwitch -SwitchType Internal**: Switch, an dem die inneren VMs und das Verwaltungsbetriebssystem von HV-NESTED hängen; dabei entsteht der virtuelle Adapter „vEthernet (NestedNAT)“.
- **New-NetIPAddress**: Diese Adresse ist das **Standardgateway** der inneren VMs.
- **New-NetNat**: WinNAT-Objekt; übersetzt alles aus dem angegebenen Präfix. Es gibt pro Host typischerweise nur **ein** WinNAT-Netz (bzw. die Präfixe dürfen sich nicht überschneiden).

INNER01 erhält dann statisch z. B. `192.168.100.10/24`, Gateway `192.168.100.1`, DNS z. B. der DC oder ein öffentlicher Resolver.

Port-Weiterleitung von außen nach innen (z. B. RDP zu INNER01):
```powershell
Add-NetNatStaticMapping -NatName "NestedNAT" -Protocol TCP -ExternalIPAddress 0.0.0.0 -ExternalPort 50001 -InternalIPAddress 192.168.100.10 -InternalPort 3389
```

### Azure: warum NAT?
In einer **Azure-VM** kontrolliert man den physischen Switch nicht. Das Azure-Netz liefert nur Pakete an die MAC/IP der Azure-NIC aus; **MAC-Spoofing ist nicht möglich**. Daher: **NAT in der Azure-VM** (interner Switch + New-NetNat) – oder, für Erreichbarkeit von außen, statische NAT-Zuordnungen bzw. zusätzliche IP-Konfigurationen mit Routing (fortgeschritten, mit benutzerdefinierten Routen). Prüfungsregel: **Azure → NAT**.

### DHCP für innere VMs
WinNAT selbst verteilt **keine** IP-Adressen. Möglichkeiten:
1. **Statische IPs** in den inneren VMs (im Lab am einfachsten).
2. **DHCP-Server-Rolle in HV-NESTED** auf dem internen Adapter „vEthernet (NestedNAT)“ mit Bereich 192.168.100.100–200, Option 003 Router = 192.168.100.1, Option 006 DNS.
3. **DHCP-Server in einer inneren VM** (z. B. DC im Lab).
4. Bei **MAC-Spoofing**: der normale DHCP-Server des LANs versorgt die inneren VMs direkt (Achtung: DHCP-Guard an der vNIC von HV-NESTED darf nicht aktiv sein, wenn in L1/L2 ein DHCP-Server antworten soll).

```powershell
# In HV-NESTED: DHCP für das NAT-Netz
Install-WindowsFeature DHCP -IncludeManagementTools
Add-DhcpServerv4Scope -Name "Nested" -StartRange 192.168.100.100 -EndRange 192.168.100.200 -SubnetMask 255.255.255.0
Set-DhcpServerv4OptionValue -ScopeId 192.168.100.0 -Router 192.168.100.1 -DnsServer 192.168.100.1
```
(In einer Domäne muss der DHCP-Server zusätzlich in AD autorisiert werden, `Add-DhcpServerInDC`; als DNS-Server müsste dann ein erreichbarer DNS eingetragen sein.)

### Vergleich
| Kriterium | MAC-Spoofing | NAT |
|---|---|---|
| Konfiguration | L0 (Host) | L1 (äußere VM) |
| Switch in L1 | extern | intern |
| innere VMs im LAN sichtbar | ja | nein (nur per Port-Weiterleitung) |
| Azure | **nein** | **ja** |
| DHCP | LAN-DHCP | eigener DHCP oder statisch |

### Mehrere NICs und Cluster-Labs
Für Cluster-Übungen bekommt HV-NESTED oft mehrere vNICs (Management, Cluster, iSCSI). MAC-Spoofing muss dann an **jeder** vNIC aktiv sein, über die innere VMs kommunizieren sollen – darum die Pipeline `Get-VMNetworkAdapter … | Set-VMNetworkAdapter` (alle Adapter der VM).

## Einfach

Stell dir vor, **HV-NESTED** ist eine Wohnung in einem großen Mietshaus (**HV01**). Der Briefkasten unten im Haus hat **ein Namensschild**: „HV-NESTED“. Jetzt zieht in die Wohnung ein Untermieter ein: **INNER01**.

Problem: Der Briefträger (der virtuelle Switch des Hosts) bringt nur Briefe für Namen, die **auf dem Schild** stehen. Und Briefe, die INNER01 mit eigenem Absender abschickt, wirft der Hausmeister weg – „den kenne ich nicht!“

Es gibt zwei Lösungen:

**1. MAC-Spoofing – „Zusatzname erlauben“**: Der Hausmeister erlaubt der Wohnung HV-NESTED, Briefe auch unter **anderen Namen** zu schicken und zu bekommen. Dann kann INNER01 ganz normal mit allen im Haus reden. Das geht aber nur, wenn **du selbst der Hausmeister** bist – also dein eigener Hyper-V-Host.

**2. NAT – „Alles über die Hauptmieterin“**: HV-NESTED nimmt alle Briefe von INNER01, schreibt **den eigenen Namen** als Absender drauf und merkt sich, für wen die Antwort ist. Wenn die Antwort kommt, gibt sie sie an INNER01 weiter. Der Briefträger sieht nur HV-NESTED – alles in Ordnung. Das klappt **überall**, auch in **Azure**, wo du nicht der Hausmeister bist.

Bei NAT gibt es keinen automatischen „Adressenverteiler“ (**DHCP**). Entweder schreibst du INNER01 die Adresse von Hand auf (statische IP), oder du stellst in HV-NESTED einen DHCP-Server auf.

## Merksatz
- Innere VM ohne Netz → **MAC-Spoofing** auf L0 vergessen.
- **Eigener Host: MAC-Spoofing. Azure: NAT.**
- NAT = interner Switch + New-NetIPAddress (Gateway) + New-NetNat.
- WinNAT verteilt **keine** IPs → statisch oder eigener DHCP.
- MAC-Spoofing an **allen** vNICs: Get-VMNetworkAdapter per Pipeline an Set-VMNetworkAdapter.

## Prüfungsfalle
- MAC-Spoofing wird auf dem **physischen Host** an der vNIC der äußeren VM gesetzt – nicht in der äußeren VM.
- In **Azure** ist MAC-Spoofing nicht möglich; Antworten wie „MAC-Spoofing in der Azure-NIC aktivieren“ sind falsch.
- Bei NAT ist der vSwitch in L1 **intern**, nicht privat (privat hätte keinen Adapter für das Verwaltungs-OS → kein Gateway) und nicht extern.
- Das Gateway der inneren VMs ist die IP auf „vEthernet (NestedNAT)“, nicht die IP des Hosts.
- New-NetNat-Präfix muss genau zum internen Netz passen; überlappende NAT-Präfixe führen zu Fehlern.
- DHCP-Guard an der vNIC der äußeren VM blockiert DHCP-Server-Antworten aus inneren VMs.

## Grafik
### Ohne MAC-Spoofing
1. INNER01 -> HV-NESTED: Frame mit Quell-MAC von INNER01
2. HV-NESTED -> HV01: Weiterleitung über die vNIC
3. HV01: vSwitch kennt die fremde MAC nicht und verwirft den Frame
4. INNER01: kein Netzwerk

### Mit MAC-Spoofing
1. Admin -> HV01: Set-VMNetworkAdapter -MacAddressSpoofing On
2. INNER01 -> HV-NESTED: Frame mit eigener MAC
3. HV-NESTED -> HV01: vSwitch akzeptiert fremde MAC
4. HV01 -> LAN: Frame erreicht DHCP-Server und Router

### NAT in der äußeren VM
1. INNER01 -> HV-NESTED: Paket von 192.168.100.10 an Gateway 192.168.100.1
2. HV-NESTED: WinNAT ersetzt Quell-IP durch eigene IP
3. HV-NESTED -> Internet: Paket mit IP von HV-NESTED
4. Internet -> HV-NESTED: Antwort
5. HV-NESTED -> INNER01: Rückübersetzung laut NAT-Tabelle

## Lab
**Maschinen**: Host **HV01.example.com** (Windows Server 2025), äußere VM **HV-NESTED** (Nested aktiviert, Hyper-V-Rolle installiert), innere VMs **INNER01** und **INNER02**. Variante B zusätzlich: Azure-VM **AZ-HV01** (Größe mit Nested-Unterstützung).

### GUI
1. **HV01**: Hyper-V-Manager → HV-NESTED → Einstellungen → Netzwerkkarte → **Erweiterte Features** → „Spoofing von MAC-Adressen aktivieren“ → OK.
2. **HV-NESTED**: Hyper-V-Manager → **Manager für virtuelle Switches** → Neuer virtueller Netzwerkswitch → **Extern** → Name „LAN“ → an die Netzwerkkarte gebunden, „Gemeinsames Verwenden durch das Verwaltungsbetriebssystem zulassen“ aktiv.
3. **HV-NESTED**: INNER01 → Einstellungen → Netzwerkkarte → Switch „LAN“.
4. **INNER01**: `ipconfig /all` → Adresse vom LAN-DHCP? Ping auf Gateway des LANs.
5. Variante NAT – **HV-NESTED**: Manager für virtuelle Switches → **Intern** → Name „NestedNAT“.
6. **HV-NESTED**: Netzwerkverbindungen → „vEthernet (NestedNAT)“ → IPv4 → 192.168.100.1/24, kein Gateway.
7. **HV-NESTED**: NAT-Objekt per PowerShell anlegen (kein GUI-Dialog für WinNAT).
8. **INNER02**: an „NestedNAT“ hängen, IP 192.168.100.11/24, Gateway 192.168.100.1, DNS eintragen → `Test-NetConnection learn.microsoft.com -Port 443`.

### PowerShell
```powershell
# Variante A – auf HV01.example.com (L0)
Get-VMNetworkAdapter -VMName HV-NESTED | Set-VMNetworkAdapter -MacAddressSpoofing On
Get-VMNetworkAdapter -VMName HV-NESTED | Select-Object VMName, Name, MacAddressSpoofing

# Variante A – in HV-NESTED (L1)
New-VMSwitch -Name "LAN" -NetAdapterName "Ethernet" -AllowManagementOS $true
Connect-VMNetworkAdapter -VMName INNER01 -SwitchName "LAN"

# Variante B – in HV-NESTED bzw. in der Azure-VM AZ-HV01 (L1)
New-VMSwitch -Name "NestedNAT" -SwitchType Internal
New-NetIPAddress -IPAddress 192.168.100.1 -PrefixLength 24 -InterfaceAlias "vEthernet (NestedNAT)"
New-NetNat -Name "NestedNAT" -InternalIPInterfaceAddressPrefix 192.168.100.0/24
Connect-VMNetworkAdapter -VMName INNER02 -SwitchName "NestedNAT"
Get-NetNat

# In INNER02 (L2)
New-NetIPAddress -InterfaceAlias "Ethernet" -IPAddress 192.168.100.11 -PrefixLength 24 -DefaultGateway 192.168.100.1
Set-DnsClientServerAddress -InterfaceAlias "Ethernet" -ServerAddresses 192.168.100.1
```

## Legende
### MAC-Adress-Spoofing
- Was: Erlaubnis für eine vNIC, Frames mit fremden MAC-Adressen zu senden und zu empfangen.
- Wie: `Set-VMNetworkAdapter -MacAddressSpoofing On` oder GUI „Erweiterte Features“.
- Wann: Innere VMs sollen direkt im LAN hängen, eigener Hyper-V-Host.
- Wo: Auf L0 (HV01) an der vNIC der äußeren VM.
- Warum: Ohne Erlaubnis verwirft der vSwitch des Hosts Frames der inneren VMs.
### NAT in der äußeren VM
- Was: Adressübersetzung mit WinNAT, äußere VM als Router.
- Wie: interner vSwitch, Gateway-IP auf vEthernet, `New-NetNat`.
- Wann: In Azure, bei Hostern oder wenn innere VMs nicht im LAN sichtbar sein sollen.
- Wo: In L1 (HV-NESTED bzw. Azure-VM).
- Warum: Nach außen erscheint nur die MAC/IP der äußeren VM – kein Spoofing nötig.

## Karteikarten
- F: Warum haben innere VMs ohne zusätzliche Konfiguration kein Netzwerk? | A: Der vSwitch des Hosts verwirft Frames mit fremden MAC-Adressen, die nicht zur vNIC der äußeren VM gehören.
- F: Wie aktiviert man MAC-Spoofing für alle vNICs von HV-NESTED? | A: Get-VMNetworkAdapter -VMName HV-NESTED \| Set-VMNetworkAdapter -MacAddressSpoofing On (auf dem Host).
- F: Wo wird MAC-Spoofing konfiguriert – Host oder äußere VM? | A: Auf dem physischen Host (L0) an der vNIC der äußeren VM.
- F: Welche Methode nutzt man in Azure? | A: NAT in der äußeren VM, weil MAC-Spoofing in Azure nicht möglich ist.
- F: Welche drei Schritte richten NAT in der äußeren VM ein? | A: New-VMSwitch -SwitchType Internal, New-NetIPAddress auf vEthernet (Gateway), New-NetNat -InternalIPInterfaceAddressPrefix.
- F: Welcher Switch-Typ wird in L1 für NAT verwendet? | A: Intern (Internal).
- F: Verteilt WinNAT IP-Adressen per DHCP? | A: Nein – statische IPs oder eigener DHCP-Server nötig.
- F: Was ist das Standardgateway der inneren VMs bei NAT? | A: Die IP-Adresse auf dem Adapter vEthernet (NestedNAT) in der äußeren VM.
- F: Wie veröffentlicht man RDP einer inneren VM über NAT? | A: Add-NetNatStaticMapping mit externem Port und interner IP/Port 3389.
- F: Welcher vSwitch-Typ wird in L1 bei MAC-Spoofing verwendet? | A: Extern, gebunden an die vNIC der äußeren VM.
- F: Welche Port-Schutzfunktion blockiert einen DHCP-Server in einer inneren VM? | A: DHCP-Guard an der vNIC der äußeren VM.
- F: Wo findet man MAC-Spoofing in der GUI? | A: VM-Einstellungen → Netzwerkkarte → Erweiterte Features → Spoofing von MAC-Adressen aktivieren.

## Quiz
? INNER01 läuft in HV-NESTED und erhält keine Adresse vom LAN-DHCP. HV-NESTED selbst ist online. Was ist die wahrscheinlichste Lösung?
* Auf dem physischen Host MAC-Spoofing für die vNIC von HV-NESTED aktivieren
- In HV-NESTED MAC-Spoofing an der vNIC der inneren VM INNER01 aktivieren
- Den externen vSwitch des physischen Hosts auf „privat“ umstellen
- Die Konfigurationsversion von INNER01 mit Update-VMVersion anheben
! Der vSwitch auf L0 verwirft Frames mit der fremden MAC von INNER01, bis MAC-Spoofing an der vNIC der äußeren VM erlaubt ist.

? Eine Azure-VM soll innere Hyper-V-VMs mit Internetzugang betreiben. Welche Methode ist richtig?
* NAT innerhalb der Azure-VM mit internem vSwitch und New-NetNat
- MAC-Spoofing an der Azure-Netzwerkkarte aktivieren
- Einen externen vSwitch auf die Azure-NIC legen und LAN-DHCP nutzen
- Accelerated Networking deaktivieren
! Azure lässt kein MAC-Spoofing zu; NAT in der äußeren VM ist der dokumentierte Weg.

? Welcher Switch-Typ wird in der äußeren VM für die NAT-Variante angelegt?
* Intern
- Extern
- Privat
- Switch Embedded Teaming
! Ein interner Switch erzeugt den vEthernet-Adapter im Verwaltungs-OS, der als Gateway dient; privat hätte keinen solchen Adapter.

? Welches Cmdlet erzeugt das eigentliche NAT-Objekt?
* New-NetNat
- New-NetRoute
- New-VMSwitch -SwitchType NAT
- Set-NetIPInterface -Forwarding Enabled
! New-NetNat legt das WinNAT-Netz für das angegebene interne Präfix an. Der Switch-Typ „NAT“ war nur in frühen Vorschauversionen vorhanden.

? Welche Adresse tragen innere VMs bei der NAT-Variante als Standardgateway ein?
* Die IP auf „vEthernet (NestedNAT)“ in der äußeren VM
- Die IP des physischen Routers im Firmen-LAN
- Die IP des vEthernet-Adapters auf dem physischen Host HV01
- Die APIPA-Adresse 169.254.0.1 der inneren VM
! Die äußere VM ist der Router; ihr interner vEthernet-Adapter ist das Gateway.

? Wo wird MAC-Adress-Spoofing für verschachtelte Virtualisierung eingeschaltet?
* Auf L0 an der Netzwerkkarte der äußeren VM
- In L1 an der physischen Netzwerkkarte des Hosts
- In L2 an der Netzwerkkarte der inneren VM
- Im UEFI/BIOS des physischen Hosts
! Nur der vSwitch des physischen Hosts muss die fremden MACs akzeptieren.

? Was stimmt über WinNAT (New-NetNat)?
* Es übersetzt Adressen, vergibt aber keine IPs per DHCP
- Es enthält automatisch einen DHCP-Server für das interne Präfix
- Es funktioniert nur zusammen mit einem externen vSwitch
- Es erfordert MAC-Spoofing an der vNIC der äußeren VM
! Für automatische Adressvergabe braucht man zusätzlich einen DHCP-Server oder vergibt statische IPs.

? Wie macht man RDP auf INNER02 (192.168.100.11) über die NAT-Adresse der äußeren VM erreichbar?
* Add-NetNatStaticMapping mit externem Port und Ziel 192.168.100.11:3389
- Set-VMNetworkAdapter -PortMirroring Source an der vNIC von INNER02
- New-NetFirewallRule -LocalPort 3389 auf dem physischen Host
- Enable-PSRemoting -Force in INNER02 und WinRM-Port freigeben
! Statische NAT-Zuordnungen leiten einen externen Port an eine interne IP/Port weiter.

? Ein DHCP-Server läuft in der inneren VM DC-INNER; Clients im LAN bekommen aber keine Antworten. MAC-Spoofing ist aktiv. Was blockiert vermutlich?
* DHCP-Guard an der vNIC der äußeren VM
- Router-Guard an der vNIC des anfragenden Clients
- Die Windows-Firewall auf dem physischen Host
- Fehlende Integrationsdienste in DC-INNER
! DHCP-Guard verwirft DHCP-Server-Nachrichten, die von dieser vNIC kommen – also auch von inneren VMs.

? Welche Pipeline aktiviert MAC-Spoofing an ALLEN Netzwerkkarten der VM HV-NESTED?
* Get-VMNetworkAdapter -VMName HV-NESTED | Set-VMNetworkAdapter -MacAddressSpoofing On
- Get-VMSwitch -Name LAN | Set-VMSwitch -MacAddressSpoofing On -AllowManagementOS $true
- Get-VM -Name HV-NESTED | Set-VMHost -MacAddressSpoofing On
- Get-NetAdapter -Name * | Set-NetAdapter -MacAddress Spoof
! MAC-Spoofing ist eine Eigenschaft der VM-Netzwerkkarte, nicht des Switches oder Hosts.

? Was ist ein Nachteil der NAT-Variante gegenüber MAC-Spoofing?
* Innere VMs sind im LAN nicht direkt erreichbar
- Sie funktioniert nicht in Azure-VMs mit Nested
- Sie erfordert, dass alle inneren VMs Gen 1 sind
- Sie benötigt einen Domänencontroller im NAT-Netz
! Nach außen erscheint nur die äußere VM; Zugriffe von außen brauchen statische NAT-Zuordnungen.

? Welchen Typ muss der vSwitch in HV-NESTED bei der MAC-Spoofing-Variante haben, damit INNER01 ins LAN kommt?
* Extern, gebunden an die vNIC von HV-NESTED
- Privat, damit nur die inneren VMs ihn nutzen
- Intern, zusätzlich mit New-NetNat
- Keiner – INNER01 nutzt direkt den Host-Switch
! Der externe Switch in L1 verbindet die inneren VMs mit der vNIC der äußeren VM und damit mit dem LAN.

## Lücken
- In Azure ist {MAC-Spoofing} nicht möglich, deshalb verwendet man {NAT} in der äußeren VM.
- Für NAT legt man in L1 einen {internen|Internal} vSwitch an und erzeugt mit {New-NetNat} das NAT-Netz.
- MAC-Spoofing wird auf dem {physischen Host|Host|L0} mit dem Cmdlet {Set-VMNetworkAdapter} aktiviert.

## Zuordnen
### Netzwerkbaustein und Aufgabe
- MAC-Spoofing => fremde MAC-Adressen an der vNIC der äußeren VM erlauben
- New-VMSwitch -SwitchType Internal => Switch mit vEthernet-Adapter in L1
- New-NetIPAddress => Gateway-Adresse für die inneren VMs
- New-NetNat => Adressübersetzung des internen Präfixes
- Add-NetNatStaticMapping => Port-Weiterleitung von außen nach innen

## Reihenfolge
### NAT für innere VMs einrichten
1. Internen vSwitch NestedNAT in HV-NESTED anlegen
2. IP 192.168.100.1/24 auf vEthernet (NestedNAT) setzen
3. New-NetNat mit Präfix 192.168.100.0/24 anlegen
4. INNER02 mit dem Switch NestedNAT verbinden
5. In INNER02 IP, Gateway und DNS eintragen
6. Verbindung mit Test-NetConnection prüfen

## Freitext
- F: Vergleichen Sie MAC-Spoofing und NAT als Netzwerklösung für verschachtelte VMs (Ort der Konfiguration, Sichtbarkeit, Azure). | M: MAC-Spoofing auf L0 an der vNIC der äußeren VM, innere VMs direkt im LAN, nicht in Azure möglich. NAT in L1 mit internem Switch und New-NetNat, innere VMs versteckt hinter der äußeren VM, funktioniert auch in Azure | P: 6
- F: Begründen Sie, warum innere VMs ohne MAC-Spoofing keine Verbindung erhalten. | M: Der vSwitch auf dem physischen Host lässt pro VM-Port nur die zugewiesene MAC zu und verwirft Frames mit fremden Quell-MACs der inneren VMs (Schutz vor Spoofing) | P: 3

## Szenario
### Nested-Lab in Azure
Ein Azubi hat die Azure-VM **AZ-HV01** (Größe mit Nested-Unterstützung) erstellt, Hyper-V installiert und **INNER01** an einen externen vSwitch gehängt. INNER01 hat keine Verbindung. Auf Rat eines Kollegen versucht er, MAC-Spoofing zu aktivieren – findet aber keinen Weg.
- F: Warum funktioniert der Ansatz mit externem Switch und MAC-Spoofing nicht? | A: In Azure kontrolliert man den physischen Switch nicht; Azure stellt nur Pakete an die MAC/IP der Azure-NIC zu, MAC-Spoofing ist nicht verfügbar | P: 2
- F: Welche drei Befehle richten die Lösung in AZ-HV01 ein? | A: New-VMSwitch -Name NestedNAT -SwitchType Internal; New-NetIPAddress -IPAddress 192.168.100.1 -PrefixLength 24 -InterfaceAlias "vEthernet (NestedNAT)"; New-NetNat -Name NestedNAT -InternalIPInterfaceAddressPrefix 192.168.100.0/24 | P: 3
- F: Wie bekommt INNER01 eine IP-Adresse? | A: Statisch (z. B. 192.168.100.10/24, GW 192.168.100.1) oder über einen DHCP-Server in AZ-HV01 bzw. einer inneren VM – WinNAT verteilt keine Adressen | P: 2
- F: Wie prüfen Sie die NAT-Konfiguration? | A: Get-NetNat in AZ-HV01, Get-VMSwitch, in INNER01 Test-NetConnection zu einem Internet-Ziel | P: 1

## Spickzettel
- Problem: vSwitch L0 verwirft fremde MACs
- Eigener Host: MAC-Spoofing auf L0, externer Switch in L1
- Azure: NAT in L1 (intern + New-NetIPAddress + New-NetNat)
- WinNAT ohne DHCP → statisch oder DHCP-Rolle
- Port-Weiterleitung: Add-NetNatStaticMapping
