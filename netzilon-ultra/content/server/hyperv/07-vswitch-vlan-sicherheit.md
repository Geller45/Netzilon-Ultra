---
id: server-hyperv-vswitch-vlan
bereich: AZ-800
block: HV
kapitel: Hyper-V vertieft
titel: Virtueller Switch vertieft – Typen, VLAN, Port-Sicherheit, Bandbreite, SET
stufe: Fortgeschritten
fach: Windows Server / AZ-800
pruefungen: [AZ-800, AP2, Schule]
quellen: [Microsoft Learn – Hyper-V-Dokumentation, AZ-800 Study Guide]
verweise: [az800-vswitch, az800-azure-network-adapter, az801-cluster-netzwerk, server-hyperv-nested-netzwerk, server-hyperv-nested-lab]
---

## Profi

### Switch-Typen
| Typ | Verbindung | vNIC im Host (Verwaltungs-OS) | Einsatz |
|---|---|---|---|
| **Extern** (*External*) | an eine **physische NIC** (oder ein SET-Team) gebunden; VMs ↔ physisches Netz | optional über **AllowManagementOS** | Produktion, VMs im LAN |
| **Intern** (*Internal*) | VMs ↔ VMs **und** Host, kein physisches Netz | **immer** (vEthernet-Adapter) | Lab, NAT (WinNAT), Host-VM-Kommunikation |
| **Privat** (*Private*) | **nur** VMs untereinander | nein | isolierte Testnetze, Cluster-Heartbeat im Lab |

- **AllowManagementOS** (`-AllowManagementOS $true`, GUI: „Gemeinsames Verwenden dieses Netzwerkadapters für das Verwaltungsbetriebssystem zulassen“): Das Host-Betriebssystem bekommt einen virtuellen Adapter **vEthernet (Name)** am externen Switch. Die physische NIC verliert ihre IP-Bindung (nur noch „Hyper-V Extensible Virtual Switch“-Protokoll) – Konfiguration der Host-IP dann auf **vEthernet**. Ohne diese Option ist die NIC ausschließlich für VMs da (dedizierte VM-NIC; Host-Verwaltung über separate NIC).
- Typ ändern: `Set-VMSwitch -Name LAN -SwitchType Internal` bzw. zurück mit `-NetAdapterName`.
- Achtung bei Remote-Verwaltung: Wer per RDP über die einzige NIC verbunden ist und einen externen Switch **ohne** AllowManagementOS anlegt, sperrt sich aus.

### VLANs (IEEE 802.1Q)
Der Hyper-V-Switch versteht **VLAN-Tags**. Damit VLANs über die physische NIC laufen, muss der **physische Switchport als Trunk** konfiguriert sein.

| Modus | Bedeutung | Cmdlet |
|---|---|---|
| **Access** | vNIC gehört zu genau **einem** VLAN; der Switch taggt/enttaggt, der Gast sieht keine Tags | `Set-VMNetworkAdapterVlan -VMName WEB01 -Access -VlanId 20` |
| **Trunk** | vNIC empfängt **mehrere** getaggte VLANs (z. B. virtueller Router/Firewall, Nested-Host) | `Set-VMNetworkAdapterVlan -VMName FW01 -Trunk -AllowedVlanIdList "10,20,30" -NativeVlanId 1` |
| **Untagged** | kein VLAN (Standard) | `Set-VMNetworkAdapterVlan -VMName WEB01 -Untagged` |
| **Privates VLAN** | Isolated/Community/Promiscuous (PVLAN) | `-Isolated`, `-Community`, `-Promiscuous` mit `-PrimaryVlanId`/`-SecondaryVlanId` |

**Host-Adapter** (vEthernet am externen Switch) ins Management-VLAN:
`Set-VMNetworkAdapterVlan -ManagementOS -VMNetworkAdapterName "LAN" -Access -VlanId 10`
GUI: VM → Netzwerkkarte → „Identifizierung virtueller LANs aktivieren“ → VLAN-ID (nur Access-Modus; Trunk nur per PowerShell).

**Nested-Bezug**: Soll eine äußere VM (HV-NESTED) selbst VMs in verschiedenen VLANs betreiben, bekommt ihre vNIC auf L0 den **Trunk**-Modus (plus MAC-Spoofing), und in HV-NESTED setzt man die VLAN-IDs auf die inneren vNICs.

### Port-Sicherheit (Erweiterte Features)
| Funktion | Wirkung | Cmdlet |
|---|---|---|
| **DHCP-Wächter** (*DHCP Guard*) | verwirft **DHCP-Server-Nachrichten** (Offer/Ack) von dieser vNIC → schützt vor Rogue-DHCP | `Set-VMNetworkAdapter -VMName CL01 -DhcpGuard On` |
| **Router-Wächter** (*Router Guard*) | verwirft **Router Advertisements und Redirects** (IPv6-RA, ICMP-Redirect) von dieser vNIC → schützt vor falschen Routern/MITM | `-RouterGuard On` |
| **MAC-Adress-Spoofing** | erlaubt fremde Quell-MACs (Nested, NLB, Container) | `-MacAddressSpoofing On` |
| **Geschütztes Netzwerk** (*Protected Network*) | im Failover-Cluster: VM wird verschoben, wenn das Netz am Knoten ausfällt | GUI Erweiterte Features |
| **Portspiegelung** (*Port Mirroring*) | Kopie des Datenverkehrs einer Quell-vNIC an eine Ziel-vNIC (Monitoring/IDS, Wireshark) – **am selben vSwitch** | `-PortMirroring Source` / `Destination` |
| **Gerätebenennung** (*Device Naming*) | Name der vNIC im Gast sichtbar (Gen 2) | `-DeviceNaming On` |

Faustregel: **DHCP-Guard und Router-Guard an allen VMs, die kein DHCP-Server bzw. Router sind** (z. B. Client-VMs im Schulungsnetz).

### Bandbreitenverwaltung (QoS)
- **Maximale Bandbreite**: `Set-VMNetworkAdapter -VMName WEB01 -MaximumBandwidth 100MB` (Wert in **Bit/s**; `100MB` ≈ 100 Mbit/s, da PowerShell 100MB als 104.857.600 interpretiert). GUI: Netzwerkkarte → „Bandbreitenverwaltung aktivieren“ in Mbit/s.
- **Minimale Bandbreite**: absolut (`-MinimumBandwidthAbsolute`, Bit/s) **oder** als Gewicht (`-MinimumBandwidthWeight` 0–100). Welcher Modus gilt, wird **beim Erstellen des Switches** festgelegt: `New-VMSwitch … -MinimumBandwidthMode Weight` (später nicht änderbar).
- Gewicht ist meist flexibler: garantiert Anteile nur bei Engpass, ungenutzte Bandbreite steht anderen zur Verfügung.

### SET – Switch Embedded Teaming
**SET** bündelt **1–8 physische NICs** direkt im Hyper-V-Switch (seit Server 2016):
- Alle NICs **gleicher Hersteller/Modell/Geschwindigkeit** (identisch zertifiziert).
- Nur **switch-unabhängiger** Modus (kein LACP), **kein Standby-Adapter**.
- Lastverteilung: **Hyper-V-Port** oder **Dynamisch** (`Set-VMSwitchTeam -LoadBalancingAlgorithm`).
- Kompatibel mit **RDMA** (SMB Direct), **SDN**, vRSS; Grundlage für konvergente Netze (Management, Live-Migration, Storage über vNICs im Host).
- Klassisches **LBFO-Teaming** unter einem vSwitch ist veraltet; ab Server 2022 blockiert New-VMSwitch dies standardmäßig – SET verwenden.
```powershell
New-VMSwitch -Name "SETswitch" -NetAdapterName "NIC1","NIC2" -EnableEmbeddedTeaming $true -AllowManagementOS $true
Add-VMNetworkAdapter -ManagementOS -Name "LiveMigration" -SwitchName "SETswitch"
Set-VMNetworkAdapterVlan -ManagementOS -VMNetworkAdapterName "LiveMigration" -Access -VlanId 30
Get-VMSwitchTeam -Name "SETswitch"
```

## Einfach

Ein **virtueller Switch** ist wie eine **Steckdosenleiste fürs Netzwerk** im Computer.

- **Extern**: Die Leiste hat ein Kabel **zur Wand** (physische Netzwerkkarte). VMs kommen ins echte Netz.
- **Intern**: Die Leiste verbindet die VMs **und den Host** miteinander, aber kein Kabel zur Wand.
- **Privat**: Nur die VMs untereinander – nicht mal der Host darf mitreden.

**VLANs** sind wie **farbige Kabel**: Rote Geräte reden nur mit roten, blaue nur mit blauen – obwohl alle an derselben Leiste hängen. Eine VM im **Access**-Modus hat **ein** farbiges Kabel. Eine VM im **Trunk**-Modus (z. B. eine Firewall) bekommt ein **Bündel** mit mehreren Farben.

**Sicherheitswächter**:
- Der **DHCP-Wächter** passt auf, dass keine VM heimlich **falsche Adressen verteilt** – wie ein Lehrer, der aufpasst, dass niemand falsche Sitzplätze vergibt.
- Der **Router-Wächter** verhindert, dass eine VM behauptet: „Ich bin der Weg nach draußen!“ und alle Daten zu sich lockt.
- **Portspiegelung** ist wie ein **Kopierer**: Alles, was eine VM sendet, bekommt eine zweite VM als Kopie – zum Mitschneiden mit Wireshark.

**Bandbreite**: Man kann einer VM eine **Höchstgeschwindigkeit** geben (wie ein Tempolimit) oder eine **Mindestgeschwindigkeit** garantieren.

**SET** ist, als würde man **mehrere Wandkabel** an die Leiste anschließen: Fällt eins aus, laufen die Daten über die anderen weiter, und zusammen sind sie schneller.

## Merksatz
- **Extern = Wand, Intern = mit Host, Privat = nur VMs.**
- Access = ein VLAN, Trunk = viele VLANs (nur PowerShell).
- **DHCP-Guard** gegen falsche DHCP-Server, **Router-Guard** gegen falsche Router.
- Port-Mirroring: Source → Destination, **gleicher vSwitch**.
- MinimumBandwidthMode wird **beim Erstellen** des Switches festgelegt.
- SET: bis 8 gleiche NICs, switch-unabhängig, kein LACP.

## Prüfungsfalle
- Privat ≠ Intern: Beim **privaten** Switch kann der **Host** nicht mit den VMs reden.
- **Trunk-Modus** gibt es **nicht** in der GUI – nur `Set-VMNetworkAdapterVlan -Trunk`.
- DHCP-Guard an der VM setzen, die **kein** DHCP-Server sein soll – nicht am echten DHCP-Server.
- Router-Guard blockiert **Router Advertisements/Redirects**, nicht normales Routing durch die VM.
- SET unterstützt **kein LACP** und **keinen Standby-Adapter**; NICs müssen identisch sein.
- Bandbreitenwerte in PowerShell sind **Bit/s**; die GUI rechnet in Mbit/s.
- Ein externer Switch ohne AllowManagementOS auf der einzigen NIC trennt den Host vom Netz.

## Grafik
### Rogue-DHCP mit DHCP-Guard
1. CL01 -> vSwitch: DHCP-Offer (falscher DHCP-Server)
2. vSwitch: DHCP-Guard an CL01 verwirft das Paket
3. DHCP01 -> vSwitch: legitimes DHCP-Offer
4. vSwitch -> CL02: Client erhält korrekte Adresse

### VLAN-Trunk zur Firewall-VM
1. WEB01 -> vSwitch: Frame ohne Tag, Access VLAN 20
2. vSwitch -> FW01: Frame mit Tag 20 über Trunk
3. FW01 -> vSwitch: geroutet mit Tag 10
4. vSwitch -> DB01: Frame enttaggt an Access VLAN 10

## Lab
**Maschinen**: Host **HV01.example.com** (Windows Server 2025, zwei identische 10-GbE-NICs „NIC1“/„NIC2“, Switchport als Trunk mit VLAN 10/20/30), VMs **WEB01**, **DB01**, Firewall-VM **FW01**, Schulungs-Client **CL01**, Monitoring-VM **MON01**.

### GUI
1. **HV01**: Hyper-V-Manager → Manager für virtuelle Switches → Neuer Switch **Extern** „LAN“ → NIC1 → „Gemeinsames Verwenden … Verwaltungsbetriebssystem“ aktivieren → OK (Hinweis zur kurzen Netzunterbrechung bestätigen).
2. **HV01**: Neuer Switch **Privat** „Isoliert“ → für Testnetz.
3. **HV01**: WEB01 → Einstellungen → Netzwerkkarte → „Identifizierung virtueller LANs aktivieren“ → **20**.
4. **HV01**: CL01 → Netzwerkkarte → **Erweiterte Features** → „DHCP-Wächter aktivieren“ und „Router-Wächter aktivieren“.
5. **HV01**: WEB01 → Erweiterte Features → Portspiegelungsmodus **Quelle**; MON01 → Portspiegelungsmodus **Ziel** → in MON01 Wireshark starten.
6. **HV01**: WEB01 → Netzwerkkarte → „Bandbreitenverwaltung aktivieren“ → Maximum 200 Mbit/s.

### PowerShell
```powershell
# Auf HV01.example.com
New-VMSwitch -Name "SETswitch" -NetAdapterName "NIC1","NIC2" -EnableEmbeddedTeaming $true -AllowManagementOS $true -MinimumBandwidthMode Weight
New-VMSwitch -Name "Isoliert" -SwitchType Private
Set-VMNetworkAdapterVlan -ManagementOS -VMNetworkAdapterName "SETswitch" -Access -VlanId 10

Set-VMNetworkAdapterVlan -VMName WEB01 -Access -VlanId 20
Set-VMNetworkAdapterVlan -VMName DB01 -Access -VlanId 10
Set-VMNetworkAdapterVlan -VMName FW01 -Trunk -AllowedVlanIdList "10,20,30" -NativeVlanId 1
Get-VMNetworkAdapterVlan -VMName FW01

Set-VMNetworkAdapter -VMName CL01 -DhcpGuard On -RouterGuard On
Set-VMNetworkAdapter -VMName WEB01 -PortMirroring Source
Set-VMNetworkAdapter -VMName MON01 -PortMirroring Destination
Set-VMNetworkAdapter -VMName WEB01 -MaximumBandwidth 200000000 -MinimumBandwidthWeight 20

Get-VMSwitch | Select-Object Name, SwitchType, AllowManagementOS, EmbeddedTeamingEnabled
Set-VMSwitchTeam -Name "SETswitch" -LoadBalancingAlgorithm HyperVPort
```

## Legende
### Switch-Typen
- Was: Extern, intern und privat bestimmen, wer mit wem kommunizieren kann.
- Wie: `New-VMSwitch` mit `-NetAdapterName` (extern) oder `-SwitchType Internal/Private`.
- Wann: Extern für Produktion, intern für Host-VM-Kommunikation und NAT, privat für isolierte Testnetze.
- Wo: Manager für virtuelle Switches im Hyper-V-Manager.
- Warum: Netze sauber trennen und nur nötige Verbindungen erlauben.
### DHCP-Guard und Router-Guard
- Was: Port-Schutz gegen falsche DHCP-Server und falsche Router-Ankündigungen.
- Wie: `Set-VMNetworkAdapter -DhcpGuard On -RouterGuard On`.
- Wann: An allen VMs, die kein DHCP-Server bzw. Router sein sollen.
- Warum: Verhindert Adresschaos und Man-in-the-Middle durch fehlerhafte oder bösartige VMs.
### SET
- Was: In den Hyper-V-Switch integriertes NIC-Teaming (bis 8 NICs).
- Wie: `New-VMSwitch -EnableEmbeddedTeaming $true`.
- Warum: Ausfallsicherheit und Bandbreite, kompatibel mit RDMA und SDN.

## Karteikarten
- F: Unterschied interner und privater Switch? | A: Intern: VMs und Host kommunizieren; privat: nur VMs untereinander.
- F: Was bewirkt AllowManagementOS? | A: Der Host erhält einen vEthernet-Adapter am externen Switch und teilt die physische NIC mit den VMs.
- F: Wie setzt man eine VM in VLAN 20 (Access)? | A: Set-VMNetworkAdapterVlan -VMName <VM> -Access -VlanId 20
- F: Wie konfiguriert man einen VLAN-Trunk für eine VM? | A: Set-VMNetworkAdapterVlan -VMName <VM> -Trunk -AllowedVlanIdList "10,20" -NativeVlanId 1 (nur PowerShell).
- F: Was muss am physischen Switch für VLANs der VMs gelten? | A: Der Port zur Hyper-V-NIC muss als Trunk konfiguriert sein.
- F: Was verhindert DHCP-Guard? | A: DHCP-Server-Antworten (Offer/Ack) von der geschützten vNIC – Rogue-DHCP.
- F: Was verhindert Router-Guard? | A: Router Advertisements und Redirect-Nachrichten von der geschützten vNIC.
- F: Wie richtet man Portspiegelung ein? | A: Quell-vNIC -PortMirroring Source, Ziel-vNIC -PortMirroring Destination, beide am selben vSwitch.
- F: In welcher Einheit erwartet -MaximumBandwidth den Wert? | A: Bit pro Sekunde.
- F: Wann legt man den MinimumBandwidthMode fest? | A: Beim Erstellen des vSwitches (Weight oder Absolute), später nicht änderbar.
- F: Wie viele NICs unterstützt SET und in welchem Modus? | A: Bis 8 identische NICs, nur switch-unabhängig (kein LACP).
- F: Welche Lastverteilungsalgorithmen kennt SET? | A: Hyper-V-Port und Dynamisch.

## Quiz
? Ein Testnetz soll VMs verbinden, der Host darf aber nicht erreichbar sein. Welcher Switch-Typ?
* Privat
- Intern
- Extern ohne AllowManagementOS
- Extern mit AllowManagementOS
! Nur der private Switch schließt den Host vollständig aus.

? In einem Schulungsnetz verteilt eine Schüler-VM versehentlich IP-Adressen. Welche Funktion verhindert das?
* DHCP-Guard an der vNIC der Schüler-VM
- Router-Guard am DHCP-Server
- MAC-Spoofing an der Schüler-VM
- Port-Mirroring am DHCP-Server
! DHCP-Guard verwirft DHCP-Server-Nachrichten, die von der geschützten vNIC kommen.

? Wie wird eine Firewall-VM konfiguriert, die Verkehr aus den VLANs 10, 20 und 30 empfangen soll?
* Set-VMNetworkAdapterVlan -VMName FW01 -Trunk -AllowedVlanIdList "10,20,30" -NativeVlanId 1
- Set-VMNetworkAdapterVlan -VMName FW01 -Access -VlanId 10,20,30
- In der GUI drei VLAN-IDs eintragen
- Set-VMSwitch -VlanId 10,20,30
! Mehrere VLANs erfordern den Trunk-Modus; den gibt es nur per PowerShell.

? Was blockiert Router-Guard?
* Router Advertisements und Redirect-Nachrichten von der vNIC
- Jeden Datenverkehr in andere Subnetze
- DHCP-Anfragen von Clients
- ARP-Anfragen
! Die VM kann weiterhin normal kommunizieren, darf sich aber nicht als Router ankündigen.

? Welche Voraussetzung gilt für Port-Mirroring in Hyper-V?
* Quell- und Ziel-vNIC hängen am selben virtuellen Switch
- Beide VMs müssen Gen 1 sein
- Die Quell-VM braucht DHCP-Guard
- Die Ziel-VM muss auf einem anderen Host laufen
! Hyper-V spiegelt Verkehr innerhalb eines vSwitches von Source an Destination.

? Welche Aussage zu SET ist richtig?
* SET unterstützt bis zu 8 identische NICs im switch-unabhängigen Modus
- SET erfordert LACP am physischen Switch
- SET erlaubt einen Standby-Adapter
- SET kombiniert NICs unterschiedlicher Hersteller beliebig
! SET ist switch-unabhängig, ohne Standby, mit gleichartigen NICs.

? Ein Admin legt per RDP auf HV01 einen externen Switch auf der einzigen NIC an und deaktiviert AllowManagementOS. Was passiert?
* Der Host verliert seine Netzwerkverbindung
- Nur die VMs verlieren das Netz
- Nichts – AllowManagementOS ist nur für VLANs
- Der Switch wird automatisch privat
! Ohne AllowManagementOS hat das Host-OS keinen Adapter mehr an dieser NIC.

? Wann wird festgelegt, ob ein vSwitch Mindestbandbreite als Gewicht oder absolut verwaltet?
* Beim Erstellen mit -MinimumBandwidthMode
- Jederzeit per Set-VMSwitch
- In jeder VM einzeln
- Gar nicht, es gilt immer Gewicht
! Der Modus ist nach dem Erstellen nicht mehr änderbar.

? Welcher Befehl setzt den Host-Adapter am externen Switch „LAN“ in VLAN 10?
* Set-VMNetworkAdapterVlan -ManagementOS -VMNetworkAdapterName "LAN" -Access -VlanId 10
- Set-NetAdapter -Name "NIC1" -VlanID 10 nach dem Anlegen des vSwitches
- Set-VMSwitch -Name LAN -VlanId 10
- Set-VMHost -ManagementVlan 10
! Der vEthernet-Adapter des Hosts ist eine vNIC des Switches und wird mit -ManagementOS angesprochen.

? Welche Einheit gilt für Set-VMNetworkAdapter -MaximumBandwidth?
* Bit pro Sekunde
- Megabyte pro Sekunde
- Prozent der Link-Geschwindigkeit
- Pakete pro Sekunde
! Die GUI zeigt Mbit/s, PowerShell erwartet Bit/s.

? Was müssen Sie am physischen Switch einstellen, damit VMs in VLAN 20 und 30 über die Hyper-V-NIC kommunizieren?
* Den Port zur Hyper-V-NIC als Trunk mit VLAN 20 und 30 konfigurieren
- Den Port als Access-Port in VLAN 1
- Spanning Tree deaktivieren
- Port-Security mit einer MAC-Adresse
! Getaggte Frames mehrerer VLANs brauchen einen Trunk-Port.

? Eine äußere Nested-VM soll innere VMs in verschiedenen VLANs betreiben. Wie konfigurieren Sie ihre vNIC auf L0?
* Trunk-Modus mit erlaubten VLANs plus MAC-Spoofing
- Access-Modus in VLAN 1
- Privater Switch
- DHCP-Guard und Router-Guard aktivieren
! Die inneren VMs taggen ihre Frames selbst; L0 muss die Tags durchlassen und fremde MACs akzeptieren.

## Lücken
- Ein {privater|Private} Switch verbindet nur VMs, ein {interner|Internal} Switch zusätzlich den Host.
- Mehrere VLANs für eine VM erfordern den {Trunk}-Modus mit dem Parameter {-AllowedVlanIdList}.
- {DHCP-Guard} blockiert falsche DHCP-Server, {Router-Guard} blockiert falsche Router-Ankündigungen.

## Zuordnen
### Funktion und Schutzwirkung
- DHCP-Guard => verwirft DHCP-Server-Nachrichten einer VM
- Router-Guard => verwirft Router Advertisements und Redirects
- Port-Mirroring => kopiert Verkehr an eine Analyse-VM
- MAC-Spoofing => erlaubt fremde Quell-MAC-Adressen
- MaximumBandwidth => Obergrenze des Datendurchsatzes
- SET => Teaming bis 8 NICs im vSwitch

## Reihenfolge
### Konvergentes Netz mit SET aufbauen
1. Identische NICs prüfen und Switchports als Trunk konfigurieren
2. SET-Switch mit New-VMSwitch -EnableEmbeddedTeaming anlegen
3. Host-vNICs für Management und Live-Migration hinzufügen
4. VLAN-IDs der Host-vNICs setzen
5. IP-Adressen auf den vEthernet-Adaptern konfigurieren
6. VM-vNICs mit Access-VLANs verbinden

## Freitext
- F: Erläutern Sie die drei Switch-Typen von Hyper-V mit je einem Einsatzbeispiel. | M: Extern: an physische NIC, VMs im LAN (Produktion). Intern: VMs und Host ohne physisches Netz (NAT, Host-VM-Datenaustausch). Privat: nur VMs (isoliertes Testnetz, Lab-Heartbeat) | P: 6
- F: Beschreiben Sie DHCP-Guard und Router-Guard und wo sie aktiviert werden. | M: DHCP-Guard verwirft DHCP-Offer/Ack von der vNIC, Router-Guard verwirft Router Advertisements/Redirects; aktiviert an VMs, die weder DHCP-Server noch Router sein sollen (Set-VMNetworkAdapter -DhcpGuard On -RouterGuard On) | P: 4

## Szenario
### Schulungsnetz absichern
Im Schulungsraum laufen auf **HV01.example.com** 20 Client-VMs **CL01–CL20** (VLAN 50), ein DHCP-Server **DHCP01** und eine Firewall-VM **FW01**, die zwischen VLAN 50 und VLAN 10 routet. Immer wieder bekommen Clients falsche Adressen, weil Schüler eigene DHCP-Dienste starten.
- F: Wie verhindern Sie Rogue-DHCP auf allen Client-VMs per PowerShell? | A: Get-VMNetworkAdapter -VMName CL* \| Set-VMNetworkAdapter -DhcpGuard On -RouterGuard On | P: 3
- F: Wie setzen Sie alle Clients in VLAN 50? | A: Get-VMNetworkAdapter -VMName CL* \| Set-VMNetworkAdapterVlan -Access -VlanId 50 | P: 2
- F: Wie konfigurieren Sie FW01? | A: Trunk: Set-VMNetworkAdapterVlan -VMName FW01 -Trunk -AllowedVlanIdList "10,50" -NativeVlanId 1; kein Router-Guard an FW01 | P: 2
- F: Wie können Sie den Verkehr von CL05 analysieren? | A: CL05 -PortMirroring Source, Analyse-VM -PortMirroring Destination am selben vSwitch, dort Wireshark | P: 1

## Spickzettel
- Extern/Intern/Privat; AllowManagementOS = vEthernet für Host
- Access: -Access -VlanId; Trunk: -Trunk -AllowedVlanIdList -NativeVlanId
- Host-vNIC: -ManagementOS -VMNetworkAdapterName
- -DhcpGuard On, -RouterGuard On, -PortMirroring Source/Destination
- Bandbreite Bit/s; MinimumBandwidthMode beim Erstellen
- SET: ≤ 8 gleiche NICs, switch-unabhängig, HyperVPort/Dynamic
