---
id: az800-vswitch
bereich: AZ-800
block: A7
kapitel: VMs & Container
titel: Hyper-V-Netzwerk – vSwitch, vNIC, NIC-Teaming & SET
stufe: Fortgeschritten
quellen: [AZ-800 Study Guide, Microsoft Learn, Netzwerkinfrastruktur_mit_Windows_Server_2016_implementieren_70-741.pdf]
verweise: [ap1-a4-vlan, az800-nested, az800-windows-container, az800-azure-vms, az801-cluster-netzwerk]
---

## Profi

### Virtuelle Switch-Typen
| Typ | Verbindung | Einsatz |
|---|---|---|
| **Extern** | an eine **physische NIC** gebunden → VMs im **physischen Netz**; optional „Gemeinsames Verwenden durch das Verwaltungsbetriebssystem“ (Host erhält vNIC am Switch) | Produktion, Internetzugang |
| **Intern** | VMs **und Host** untereinander, **kein** physisches Netz | Host-VM-Kommunikation, **NAT** (`New-NetNat`) |
| **Privat** | **nur VMs** untereinander, Host nicht | isolierte Labs (z. B. deine Standort-Netze), Clusterheartbeat |
| **NAT** (Typ über PowerShell/Standardswitch) | Client-Hyper-V „Default Switch“ mit automatischem NAT/DHCP | Windows 10/11, Container |
Pro physischer NIC **ein** externer Switch.

### Erweiterte vNIC-Funktionen (VM → Netzwerkkarte → Hardwarebeschleunigung/Erweiterte Features)
| Funktion | Beschreibung |
|---|---|
| **VLAN-ID** | vNIC im Zugriffsmodus in ein VLAN (Host-Uplink = Trunk); `Set-VMNetworkAdapterVlan` |
| **Bandbreitenverwaltung** | Minimum/Maximum Mbit/s |
| **MAC-Adresse** dynamisch/statisch, **MAC-Spoofing** (Nested, NLB, Container) |
| **DHCP-Wächter** (DHCP Guard) | verwirft DHCP-Serverantworten der VM (Rogue-DHCP-Schutz) |
| **Routerwächter** (Router Guard) | verwirft Router Advertisements/Redirects der VM |
| **Geschützte Netzwerk**- | VM bei Netzwerkausfall im Cluster auf anderen Knoten verschieben |
| **Portspiegelung** | Quelle/Ziel für Mitschnitt (Wireshark in einer Analyse-VM) |
| **NIC-Teaming im Gast** zulassen | für Gast-Teaming über zwei vNICs |
| **VMQ / vRSS / SR-IOV** | Leistung: Verteilung der Netzwerklast auf CPU-Kerne; **SR-IOV** gibt der VM eine virtuelle Funktion der physischen NIC (Umgehung des vSwitch, niedrige Latenz; benötigt Hardware + am Switch beim Erstellen aktiviert) |
| **Legacy-Netzwerkkarte** | nur Gen 1, emuliert – für PXE-Boot alter Systeme (Gen 2 kann synthetisch PXE) |
| **Gerätebenennung** | vNIC-Name im Gast sichtbar |

### NIC-Teaming (LBFO) vs. Switch Embedded Teaming (SET)
**NIC-Teaming** fasst mehrere physische NICs zu einem logischen Adapter zusammen → **Ausfallsicherheit** und **Bandbreite**.
| | **LBFO-NIC-Teaming** (klassisch, seit 2012) | **SET** (Switch Embedded Teaming, seit 2016) |
|---|---|---|
| Ort | Betriebssystem (Team-Adapter), vSwitch darauf | **im Hyper-V-vSwitch integriert** |
| Hyper-V | für **Hyper-V-vSwitches** in Server 2022/2025 **nicht mehr unterstützt/empfohlen** (Erstellung eines vSwitch auf LBFO wird blockiert) | **empfohlen** |
| Teaming-Modi | **Switchunabhängig**, **Statisch**, **LACP** | **nur switchunabhängig** |
| Lastausgleich | Adressabhängig, Hyper-V-Port, Dynamisch | **Hyper-V-Port**, **Dynamisch** |
| NICs | bis 32, auch unterschiedliche | bis 8, **identische** NICs (Hersteller/Modell/Geschwindigkeit) |
| RDMA / SDN | nein | **ja** (RDMA, SR-IOV-Kompatibilität, SDN, S2D) |
| Standby-Adapter | ja | nein (alle aktiv) |
Für **Nicht-Hyper-V**-Szenarien (normaler Server ohne vSwitch) ist LBFO weiterhin möglich.

**Teaming-Modi erklärt**: **Switchunabhängig** – der physische Switch weiß nichts vom Team (NICs an verschiedenen Switches möglich). **Statisch** – feste Konfiguration am Switch (Port-Channel). **LACP** (802.3ad/802.1AX) – dynamische Aushandlung mit dem Switch.
**Lastausgleich**: **Hyper-V-Port** – jede VM-vNIC ist fest an eine physische NIC gebunden; **Dynamisch** – Aufteilung nach Datenströmen (Flowlets), Standard und meist beste Wahl.

### Host-vNICs und konvergente Netzwerke
Mit SET wird oft **ein** vSwitch über 2–4 schnelle NICs gebaut, und der Host erhält mehrere **Host-vNICs** für **Verwaltung**, **Live-Migration**, **Cluster**, **Speicher (SMB/RDMA)** – jeweils mit eigener VLAN-ID und QoS (**konvergentes Netzwerk**).

## Lab
**Maschinen**: Hyper-V-**Host** mit 2 physischen NICs („NIC1“, „NIC2“), VMs **SRV01**, **ROGUE01**.

### GUI
1. **Host**: Hyper-V-Manager → **Manager für virtuelle Switches** → Neu → **Extern** → „LAN-Extern“ → NIC1 → „Gemeinsames Verwenden… zulassen“.
2. Neu → **Privat** → „Standort-A“; Neu → **Intern** → „Host-Intern“.
3. **SRV01** → Netzwerkkarte → Switch „LAN-Extern“ → **VLAN-ID aktivieren: 10** → Bandbreitenverwaltung max. 500 Mbit/s → Erweiterte Features: **DHCP-Wächter**, **Routerwächter**.
4. **ROGUE01** mit DHCP-Serverrolle am gleichen Switch → Clients bekommen **keine** Adresse von ROGUE01, wenn dort DHCP-Wächter aktiv ist.
5. **Portspiegelung**: SRV01 Quelle, Analyse-VM Ziel → Wireshark in der Analyse-VM.
6. **SET** (nur PowerShell, GUI des Hyper-V-Managers zeigt SET, erstellt es aber nicht): siehe unten.

### PowerShell
```powershell
# Auf dem Host – Switches
New-VMSwitch -Name "LAN-Extern" -NetAdapterName "NIC1" -AllowManagementOS $true
New-VMSwitch -Name "Standort-A" -SwitchType Private
New-VMSwitch -Name "Host-Intern" -SwitchType Internal
Get-VMSwitch

# vNIC-Einstellungen
Connect-VMNetworkAdapter -VMName SRV01 -SwitchName "LAN-Extern"
Set-VMNetworkAdapterVlan -VMName SRV01 -Access -VlanId 10
Set-VMNetworkAdapter -VMName SRV01 -MaximumBandwidth 500MB -DhcpGuard On -RouterGuard On
Set-VMNetworkAdapter -VMName SRV01 -PortMirroring Source
Set-VMNetworkAdapter -VMName ANALYSE01 -PortMirroring Destination

# SET mit zwei identischen NICs
New-VMSwitch -Name "SET-Switch" -NetAdapterName "NIC1","NIC2" -EnableEmbeddedTeaming $true -AllowManagementOS $false
Set-VMSwitchTeam -Name "SET-Switch" -LoadBalancingAlgorithm Dynamic
Get-VMSwitchTeam -Name "SET-Switch" | Format-List
# Host-vNICs für konvergentes Netz
Add-VMNetworkAdapter -ManagementOS -Name "Mgmt" -SwitchName "SET-Switch"
Add-VMNetworkAdapter -ManagementOS -Name "LiveMigration" -SwitchName "SET-Switch"
Set-VMNetworkAdapterVlan -ManagementOS -VMNetworkAdapterName "LiveMigration" -Access -VlanId 20

# Klassisches LBFO-Team (ohne Hyper-V-Switch)
New-NetLbfoTeam -Name "Team1" -TeamMembers "NIC3","NIC4" -TeamingMode SwitchIndependent -LoadBalancingAlgorithm Dynamic
```

## Einfach

VMs brauchen **Netzwerkkabel** – aber virtuelle. Dafür baut Hyper-V **virtuelle Switches**, wie Verteilerdosen:
- **Extern** = die Verteilerdose ist mit der **echten Netzwerkbuchse** des Hosts verbunden → VMs kommen ins **echte Netz** und ins Internet.
- **Intern** = VMs und **der Host selbst** können miteinander reden, aber nicht nach draußen.
- **Privat** = **nur die VMs** untereinander – wie ein abgeschlossener Klassenraum. Perfekt für Übungsnetze (Standort A, Standort B…).

**Schutzfunktionen an der VM-Netzwerkkarte**:
- **DHCP-Wächter** = eine VM darf **nicht** plötzlich IP-Adressen verteilen (kein falscher DHCP-Server).
- **Routerwächter** = eine VM darf sich nicht als **Router** ausgeben.
- **VLAN-ID** = die VM kommt in einen bestimmten „Klassenraum“ (VLAN).
- **Bandbreitenlimit** = eine VM darf das Netzwerk nicht allein verstopfen.

**NIC-Teaming** = zwei oder mehr **echte Netzwerkkarten bündeln**: Fällt eine aus (Kabel gezogen), läuft alles über die andere weiter – und zusammen sind sie schneller.
- **Altes Teaming (LBFO)**: Bündeln im Windows, dann Switch drauf – für Hyper-V heute **nicht mehr empfohlen**.
- **SET**: Das Bündeln passiert **direkt im virtuellen Switch** – moderner, unterstützt Turbo-Funktionen (RDMA). **Aber**: nur **gleiche** Netzwerkkarten und nur der Modus „switchunabhängig“.

## Merksatz
- **Extern** (physisch) – **Intern** (Host+VMs) – **Privat** (nur VMs).
- **DHCP-Wächter** gegen Rogue-DHCP, **Routerwächter** gegen falsche Router.
- **SET** = Teaming im vSwitch, **identische NICs**, **nur switchunabhängig**, bis 8 NICs, RDMA.
- **LBFO** für Hyper-V-Switches in Server 2022+ **nicht** mehr.
- Lastausgleich meist **Dynamisch**.

## Prüfungsfalle
- SET unterstützt kein LACP und keinen statischen Modus.
- SET verlangt identische NICs.
- Privater Switch: Host kann VMs nicht erreichen.
- Legacy-Netzwerkkarte nur in Gen-1-VMs.
- SR-IOV muss beim Erstellen des vSwitch aktiviert werden.

## Grafik
### Drei Verteilerdosen
Host mit physischer NIC; extern: Kabel nach draußen; intern: Kabel nur zum Host und zu VMs; privat: VMs in einem geschlossenen Raum.

### Wächter
VM ruft „Ich verteile IPs!“ – DHCP-Wächter hält ihr den Mund zu; eine andere VM ruft „Ich bin der Router!“ – Routerwächter blockt.

### SET vs. LBFO
Links: zwei NICs → Team-Adapter → vSwitch (durchgestrichen für Hyper-V 2022+). Rechts: zwei identische NICs direkt im vSwitch „SET“ mit RDMA-Blitz; Kabel ziehen → Verkehr läuft über die andere NIC weiter.

## Karteikarten
- F: Drei Typen virtueller Switches? | A: Extern, Intern, Privat.
- F: Unterschied Intern und Privat? | A: Intern: VMs und Host; Privat: nur VMs.
- F: Wozu dient der DHCP-Wächter? | A: Verwirft DHCP-Angebote aus einer VM (Schutz vor Rogue-DHCP).
- F: Was ist SET? | A: Switch Embedded Teaming – NIC-Teaming direkt im Hyper-V-vSwitch.
- F: Welcher Teaming-Modus ist bei SET möglich? | A: Nur switchunabhängig.
- F: Maximale NIC-Anzahl bei SET? | A: 8 identische NICs.
- F: Lastausgleichsalgorithmen bei SET? | A: Hyper-V-Port und Dynamisch.
- F: Cmdlet zum Erstellen eines SET-Switches? | A: New-VMSwitch … -NetAdapterName NIC1,NIC2 -EnableEmbeddedTeaming $true
- F: Wofür Portspiegelung? | A: Netzwerkverkehr einer VM an eine Analyse-VM spiegeln.
- F: Wie setzt man eine VM in VLAN 10? | A: Set-VMNetworkAdapterVlan -VMName <VM> -Access -VlanId 10

## Quiz
? VMs eines Übungsnetzes sollen nur untereinander kommunizieren, nicht mit dem Host. Welcher Switch?
* Privat
- Intern
- Extern
- NAT

? Welches Teaming wird für Hyper-V-vSwitches in Windows Server 2022/2025 empfohlen?
* Switch Embedded Teaming (SET)
- LBFO mit LACP
- Statisches LBFO
- Gar kein Teaming möglich

? Eine VM verteilt versehentlich DHCP-Adressen im Netz. Welche Einstellung verhindert das?
* DHCP-Wächter an der vNIC
- Routerwächter
- MAC-Spoofing
- Portspiegelung

? Welche Aussage zu SET ist richtig?
* Es unterstützt nur den switchunabhängigen Modus
- Es erfordert LACP am physischen Switch
- Es erlaubt NICs verschiedener Hersteller
- Es unterstützt bis zu 32 NICs

? Wie gelangt eine VM in ein VLAN, wenn der Host-Uplink ein Trunk ist?
* VLAN-ID an der vNIC setzen (Set-VMNetworkAdapterVlan -Access)
- VLAN im DHCP-Bereich angeben
- VM auf einen privaten Switch legen
- Portspiegelung aktivieren
