---
id: server-hyperv-nested-lab
bereich: AZ-800
block: HV
kapitel: Hyper-V vertieft
titel: Übungslab – Hyper-V-Failover-Cluster mit Nested Virtualization und iSCSI
stufe: Profi
fach: Windows Server / AZ-800
pruefungen: [AZ-800, AP2, Schule]
quellen: [Microsoft Learn – Hyper-V-Dokumentation, AZ-800 Study Guide]
verweise: [az800-nested, server-iscsi, server-san, az801-failover-cluster, az801-cluster-storage-quorum, az801-cluster-netzwerk, server-hyperv-nested-grundlagen, server-hyperv-nested-netzwerk, server-hyperv-nested-einschraenkungen, server-hyperv-vswitch-vlan]
---

## Profi

### Ziel des Labs
Auf **einem** physischen Rechner entsteht ein vollständiger **Hyper-V-Failover-Cluster** aus zwei verschachtelten Hyper-V-Knoten mit gemeinsamem **iSCSI-Speicher**, **Cluster Shared Volume (CSV)**, **Datenträgerzeuge** und einer hochverfügbaren inneren VM, die man **live migriert**. Das deckt AZ-800/AZ-801-Themen ab: Nested Virtualization, vSwitch, iSCSI, Failover-Clustering, Quorum, Live-Migration.

### Architektur
| Maschine | Ebene | Rolle | vCPU / RAM | Netze (IP) |
|---|---|---|---|---|
| **HV01.example.com** | L0 (physisch) | Hyper-V-Host, NAT fürs Lab | – / ≥ 32 GB | LAN + „Lab“ 10.10.10.1 |
| **DC01.example.com** | L1-VM | AD DS, DNS | 2 / 2 GB statisch | Lab 10.10.10.10 |
| **ISCSI01.example.com** | L1-VM | iSCSI-Zielserver (*iSCSI Target Server*) | 2 / 2 GB | Lab 10.10.10.20, iSCSI 10.10.20.20 |
| **HVN1.example.com** | L1-VM, Nested | Hyper-V + Failover-Cluster-Knoten | 4 / 8 GB **statisch** | Lab 10.10.10.31, iSCSI 10.10.20.31, Cluster 10.10.30.31 |
| **HVN2.example.com** | L1-VM, Nested | Hyper-V + Failover-Cluster-Knoten | 4 / 8 GB **statisch** | Lab 10.10.10.32, iSCSI 10.10.20.32, Cluster 10.10.30.32 |
| **HVCL01.example.com** | Clustername | Clusterobjekt (CNO) | – | 10.10.10.50 |
| **INNER01** | L2-VM | hochverfügbare VM im Cluster | 1 / 1 GB | VMNet 10.10.10.60 |

**Virtuelle Switches auf HV01**:
- „**Lab**“ – **intern** + WinNAT (10.10.10.0/24) → Internetzugang fürs Lab, Host erreichbar.
- „**iSCSI**“ – **privat** (10.10.20.0/24) → Speicherverkehr.
- „**Cluster**“ – **privat** (10.10.30.0/24) → Cluster-Kommunikation/Live-Migration.

**In HVN1/HVN2**: externer vSwitch „**VMNet**“ auf dem Lab-Adapter (AllowManagementOS) für die inneren VMs → deshalb **MAC-Spoofing** an allen vNICs von HVN1/HVN2 auf HV01.

### Ablauf in Phasen
1. **Host vorbereiten**: Hyper-V-Rolle, Switches, NAT, Ordner (SSD!).
2. **DC01** installieren: Domäne example.com, DNS, Weiterleitung ins Internet.
3. **ISCSI01** installieren, Domänenbeitritt, Rolle **iSCSI-Zielserver**, virtuelle iSCSI-Datenträger: **Witness** (1 GB) und **CSV1** (100 GB, dynamisch).
4. **HVN1/HVN2** anlegen: Gen 2, statischer RAM, **ExposeVirtualizationExtensions**, MAC-Spoofing, drei vNICs; Windows Server 2025 installieren, Domänenbeitritt.
5. In HVN1/HVN2: **Hyper-V** und **Failover-Clustering** installieren, vSwitch „VMNet“.
6. **iSCSI-Initiator** auf beiden Knoten: Dienst MSiSCSI automatisch, Zielportal 10.10.20.20, Verbindung **persistent**.
7. Auf **ISCSI01** das Ziel nur für die IQNs von HVN1 und HVN2 freigeben (InitiatorIds = LUN-Masking).
8. Datenträger auf **einem** Knoten online schalten, initialisieren (GPT), formatieren (NTFS oder ReFS) – nicht zuweisen.
9. **Test-Cluster** (Validierung) → **New-Cluster** HVCL01 → Datenträger hinzufügen → **Datenträgerzeuge** (Witness) → **CSV** (CSV1 → C:\ClusterStorage\Volume1).
10. Clusternetzwerke benennen (Lab = Cluster und Client, iSCSI = kein Clusterverkehr, Cluster = nur Cluster/Live-Migration).
11. **INNER01** auf dem CSV anlegen und als **Clusterrolle** hinzufügen.
12. **Live-Migration** HVN1 → HVN2 testen, Knoten-Ausfall simulieren (HVN1 hart ausschalten) → Failover beobachten.

### Wichtige Hinweise
- **Statischer RAM** für HVN1/HVN2 – mit laufendem Gast-Hypervisor wächst der Speicher nicht (siehe Einschränkungen).
- **Gleiche CPU-Basis**: Beide Nested-Knoten laufen auf demselben Host, daher ist Prozessorkompatibilität für Live-Migration innerer VMs kein Problem.
- Die **äußeren** Knoten HVN1/HVN2 selbst sind nicht live-migrierbar – im Lab irrelevant.
- **Prüfpunkt „Lab-Basis“**: nach Phase 4 (alle VMs aus) für schnellen Neustart des Labs.
- **iSCSI-Sicherheit**: Im Lab genügt die Einschränkung per InitiatorIds; produktiv zusätzlich **CHAP** und getrenntes Speichernetz.
- **MPIO** (*Multipath I/O*) ist für einen Pfad nicht nötig; mit zwei iSCSI-Netzen könnte man es üben (Feature Multipath-IO).
- **Quorum**: Zwei Knoten + Datenträgerzeuge = 3 Stimmen → ein Knoten darf ausfallen. Alternativ Dateifreigabezeuge auf DC01 oder Cloudzeuge in Azure.
- **Leistung**: VHDX-Dateien aller L1-VMs auf SSD/NVMe, sonst wird Live-Migration und Clustervalidierung sehr langsam.

### Typische Fehler im Lab
| Problem | Ursache |
|---|---|
| Hyper-V-Rolle auf HVN1 nicht installierbar | ExposeVirtualizationExtensions fehlt / VM lief beim Setzen |
| INNER01 ohne Netz | MAC-Spoofing an der Lab-vNIC von HVN1/HVN2 fehlt |
| iSCSI-Ziel nicht sichtbar | Initiator-IQN nicht in InitiatorIds, falsches Netz, Firewall TCP 3260 |
| Test-Cluster warnt vor einzelnem Netz/Pfad | im Lab akzeptabel, produktiv redundante Netze |
| New-Cluster scheitert an AD-Rechten | Konto darf kein Computerobjekt (CNO) anlegen |
| Live-Migration schlägt fehl | Hyper-V-Einstellungen Live-Migration nicht aktiviert (bei Clustern übernimmt der Cluster das), Netz „Cluster“ nicht für Live-Migration freigegeben |

## Einfach

Stell dir vor, du baust mit **LEGO ein ganzes Rechenzentrum** – aber alles passt auf **einen Tisch** (deinen PC **HV01**).

1. Zuerst baust du die **Straßen** (virtuelle Switches): eine Hauptstraße „Lab“, eine geheime Lieferstraße nur für Speicher („iSCSI“) und einen Funkweg nur für die Cluster-Server („Cluster“).
2. Dann kommt das **Rathaus** (**DC01**), das alle Namen und Ausweise verwaltet (Active Directory und DNS).
3. Danach das **Lagerhaus** (**ISCSI01**), das Speicher-Kisten über die Lieferstraße verleiht.
4. Jetzt die zwei **Fabriken** (**HVN1** und **HVN2**). Das Besondere: In diesen Fabriken werden selbst wieder kleine Maschinen gebaut – das ist die **Puppe in der Puppe** (Nested Virtualization). Damit das geht, müssen die Fabriken die „Bau-Superkräfte“ bekommen und genug **festen** Platz haben.
5. Beide Fabriken holen sich **dieselbe Speicher-Kiste** aus dem Lagerhaus.
6. Dann schließen sie einen **Vertrag**: „Wenn eine von uns ausfällt, übernimmt die andere ihre Arbeit.“ Das ist der **Failover-Cluster**. Ein **Schiedsrichter** (Datenträgerzeuge) entscheidet bei Streit, wer weiterarbeiten darf.
7. Zum Schluss baust du eine kleine Maschine **INNER01** und lässt sie **während sie läuft** von Fabrik 1 in Fabrik 2 umziehen (**Live-Migration**). Dann schaltest du Fabrik 1 einfach aus – und INNER01 startet in Fabrik 2 neu.

So übst du alles, was ein echter Admin im Rechenzentrum macht – ohne einen einzigen echten Server zu kaufen.

## Merksatz
- **Host → DC → iSCSI → 2 Nested-Knoten → Cluster → CSV → HA-VM.**
- Nested-Knoten: **statischer RAM, ExposeVirtualizationExtensions, MAC-Spoofing an allen vNICs**.
- iSCSI-Ziel nur für die **IQNs** der Knoten freigeben.
- Erst **Test-Cluster**, dann **New-Cluster**.
- 2 Knoten + Zeuge = 3 Stimmen.
- Vor dem Experimentieren: Prüfpunkt „Lab-Basis“ (alles aus).

## Prüfungsfalle
- Ein Failover-Cluster mit Hyper-V braucht **gemeinsamen Speicher** (iSCSI/FC/SMB 3 oder S2D) – lokale Platten der Knoten reichen nicht (außer S2D).
- **Datenträgerzeuge** ≠ CSV: Zeuge ist ein kleiner Datenträger nur fürs Quorum.
- Datenträger vor dem Hinzufügen zum Cluster **nur auf einem Knoten** initialisieren und formatieren.
- iSCSI-Initiator-Dienst muss auf **Automatisch** stehen und die Verbindung **persistent** sein, sonst fehlen nach Neustart die Datenträger.
- Live-Migration im Lab betrifft die **inneren** VMs – die Nested-Knoten selbst lassen sich nicht live migrieren.
- Ohne MAC-Spoofing haben clusterte innere VMs kein Netz, obwohl der Cluster grün ist.

## Grafik
### Laboraufbau
1. HV01: Switches Lab (intern + NAT), iSCSI (privat), Cluster (privat)
2. HV01 -> DC01: AD DS und DNS für example.com
3. HV01 -> ISCSI01: iSCSI-Ziel mit Witness und CSV1
4. HV01 -> HVN1: Nested aktiviert, MAC-Spoofing
5. HV01 -> HVN2: Nested aktiviert, MAC-Spoofing
6. HVN1 -> ISCSI01: Anmeldung am Ziel über 10.10.20.0/24
7. HVN2 -> ISCSI01: Anmeldung am Ziel über 10.10.20.0/24
8. HVN1: New-Cluster HVCL01 mit HVN2

### Live-Migration und Failover
1. INNER01: läuft auf HVN1, VHDX auf CSV
2. HVN1 -> HVN2: Live-Migration des Arbeitsspeichers über Netz Cluster
3. INNER01: läuft ohne Unterbrechung auf HVN2
4. HVN2: wird hart ausgeschaltet
5. HVN1: Cluster erkennt Ausfall, Quorum mit Zeuge bleibt erhalten
6. HVN1 -> INNER01: Neustart der VM auf HVN1

## Lab
**Maschinen**: physischer Host **HV01.example.com** (Windows Server 2025 oder Windows 11 Pro mit Hyper-V, ≥ 32 GB RAM, SSD, Intel VT-x/EPT oder AMD EPYC/Ryzen), VMs **DC01.example.com**, **ISCSI01.example.com**, **HVN1.example.com**, **HVN2.example.com**, Cluster **HVCL01.example.com**, innere VM **INNER01**. Ein Domänen-Admin-Konto, keine Kennwörter im Skript (interaktive Abfrage).

### GUI
1. **HV01**: Manager für virtuelle Switches → „Lab“ (Intern), „iSCSI“ (Privat), „Cluster“ (Privat) anlegen.
2. **HV01**: Netzwerkverbindungen → vEthernet (Lab) → IPv4 10.10.10.1/24; NAT per PowerShell anlegen (kein GUI-Dialog).
3. **HV01**: VM **DC01** (Gen 2, 2 GB statisch, Lab) → Windows Server 2025 installieren → in **DC01**: IP 10.10.10.10, GW 10.10.10.1 → Server-Manager → AD DS → Gesamtstruktur example.com.
4. **HV01**: VM **ISCSI01** (Gen 2, 2 GB, NICs Lab + iSCSI, zweite VHDX 150 GB) → installieren, IPs 10.10.10.20/10.10.20.20, Domänenbeitritt.
5. **ISCSI01**: Server-Manager → Datei-/Speicherdienste → **iSCSI** → „Neuer virtueller iSCSI-Datenträger“ → **Witness** 1 GB → neues Ziel „HVCluster“ → Initiatoren per IQN hinzufügen (iqn.1991-05.com.microsoft:hvn1.example.com, …hvn2.example.com) → zweiten Datenträger **CSV1** 100 GB dynamisch demselben Ziel zuordnen.
6. **HV01**: VMs **HVN1** und **HVN2** (Gen 2, 4 vCPU, 8 GB statisch, NICs Lab/iSCSI/Cluster) anlegen → Netzwerkkarten → Erweiterte Features → MAC-Spoofing (alle drei) → Nested per PowerShell → Windows Server 2025 installieren, IPs setzen, Domänenbeitritt.
7. **HVN1/HVN2**: Server-Manager → Rollen **Hyper-V** (vSwitch auf Lab-Adapter, Name „VMNet“) und Feature **Failoverclustering** → Neustart.
8. **HVN1/HVN2**: **iSCSI-Initiator** öffnen (Dienst automatisch starten bestätigen) → Ziel 10.10.20.20 → „Schnell verbinden“ → Ziel „HVCluster“ verbunden; auf Registerkarte „Volumes und Geräte“ → „Automatisch konfigurieren“.
9. **HVN1**: Datenträgerverwaltung → beide iSCSI-Datenträger online → GPT initialisieren → NTFS formatieren (Witness, CSV1), keinen Laufwerksbuchstaben nötig.
10. **HVN1**: Failovercluster-Manager → **Konfiguration überprüfen** (HVN1, HVN2, alle Tests) → Bericht lesen → **Cluster erstellen** → Name HVCL01, IP 10.10.10.50.
11. **HVN1**: Failovercluster-Manager → Speicher → Datenträger → beide hinzufügen → CSV1 → „Zu freigegebenen Clustervolumes hinzufügen“ → Cluster → Weitere Aktionen → Clusterquorumeinstellungen → Datenträgerzeuge „Witness“.
12. **HVN1**: Rollen → Virtuelle Computer → Neuer virtueller Computer → Knoten HVN1 → INNER01 unter C:\ClusterStorage\Volume1 → Switch VMNet → starten.
13. **HVN1**: INNER01 → Verschieben → **Livemigration** → HVN2. Danach HVN2 auf **HV01** per „Ausschalten“ stoppen → INNER01 startet auf HVN1.

### PowerShell
```powershell
# ===== Phase 1 – auf HV01.example.com (L0) =====
New-VMSwitch -Name "Lab" -SwitchType Internal
New-NetIPAddress -IPAddress 10.10.10.1 -PrefixLength 24 -InterfaceAlias "vEthernet (Lab)"
New-NetNat -Name "LabNAT" -InternalIPInterfaceAddressPrefix 10.10.10.0/24
New-VMSwitch -Name "iSCSI" -SwitchType Private
New-VMSwitch -Name "Cluster" -SwitchType Private

# ===== Phase 4 – Nested-Knoten anlegen (auf HV01) =====
foreach ($n in "HVN1","HVN2") {
  New-VM -Name $n -Generation 2 -MemoryStartupBytes 8GB -SwitchName "Lab" -NewVHDPath "D:\Lab\$n.vhdx" -NewVHDSizeBytes 80GB -Path "D:\Lab"
  Set-VMMemory -VMName $n -DynamicMemoryEnabled $false
  Set-VMProcessor -VMName $n -Count 4 -ExposeVirtualizationExtensions $true
  Add-VMNetworkAdapter -VMName $n -SwitchName "iSCSI"
  Add-VMNetworkAdapter -VMName $n -SwitchName "Cluster"
  Get-VMNetworkAdapter -VMName $n | Set-VMNetworkAdapter -MacAddressSpoofing On
  Add-VMDvdDrive -VMName $n -Path "D:\ISO\WS2025.iso"
  Set-VMFirmware -VMName $n -FirstBootDevice (Get-VMDvdDrive -VMName $n)
}
Get-VMProcessor -VMName HVN1,HVN2 | Select-Object VMName, ExposeVirtualizationExtensions

# ===== Phase 3 – auf ISCSI01.example.com =====
Install-WindowsFeature FS-iSCSITarget-Server -IncludeManagementTools
New-IscsiVirtualDisk -Path "E:\iSCSI\Witness.vhdx" -SizeBytes 1GB
New-IscsiVirtualDisk -Path "E:\iSCSI\CSV1.vhdx" -SizeBytes 100GB
New-IscsiServerTarget -TargetName "HVCluster" -InitiatorIds "IQN:iqn.1991-05.com.microsoft:hvn1.example.com","IQN:iqn.1991-05.com.microsoft:hvn2.example.com"
Add-IscsiVirtualDiskTargetMapping -TargetName "HVCluster" -Path "E:\iSCSI\Witness.vhdx"
Add-IscsiVirtualDiskTargetMapping -TargetName "HVCluster" -Path "E:\iSCSI\CSV1.vhdx"

# ===== Phase 5/6 – auf HVN1 und HVN2 (L1) =====
Install-WindowsFeature Hyper-V, Failover-Clustering -IncludeManagementTools -Restart
New-VMSwitch -Name "VMNet" -NetAdapterName "Lab" -AllowManagementOS $true
Set-Service -Name MSiSCSI -StartupType Automatic
Start-Service -Name MSiSCSI
New-IscsiTargetPortal -TargetPortalAddress 10.10.20.20
Get-IscsiTarget | Connect-IscsiTarget -IsPersistent $true
Get-Disk | Where-Object BusType -eq "iSCSI"

# ===== Phase 8 – nur auf HVN1 =====
Get-Disk | Where-Object { $_.BusType -eq "iSCSI" -and $_.PartitionStyle -eq "RAW" } | Initialize-Disk -PartitionStyle GPT -PassThru | New-Partition -UseMaximumSize | Format-Volume -FileSystem NTFS -Confirm:$false

# ===== Phase 9 – Cluster (auf HVN1) =====
Test-Cluster -Node HVN1, HVN2
New-Cluster -Name HVCL01 -Node HVN1, HVN2 -StaticAddress 10.10.10.50 -NoStorage
Get-ClusterAvailableDisk | Add-ClusterDisk
Get-ClusterResource | Where-Object ResourceType -eq "Physical Disk"
Set-ClusterQuorum -DiskWitness "Cluster Disk 1"
Add-ClusterSharedVolume -Name "Cluster Disk 2"
(Get-ClusterNetwork -Name "Cluster Network 2").Role = 0     # iSCSI-Netz: kein Clusterverkehr (Name vorher mit Get-ClusterNetwork prüfen)

# ===== Phase 11/12 – HA-VM und Live-Migration =====
New-VM -Name INNER01 -Generation 2 -MemoryStartupBytes 1GB -Path "C:\ClusterStorage\Volume1" -NewVHDPath "C:\ClusterStorage\Volume1\INNER01\INNER01.vhdx" -NewVHDSizeBytes 20GB -SwitchName "VMNet"
Add-ClusterVirtualMachineRole -VMName INNER01
Start-ClusterGroup -Name INNER01
Move-ClusterVirtualMachineRole -Name INNER01 -Node HVN2 -MigrationType Live
Get-ClusterGroup -Name INNER01 | Select-Object Name, OwnerNode, State
```

## Legende
### Nested-Cluster-Lab
- Was: Zwei verschachtelte Hyper-V-Knoten bilden mit iSCSI-Speicher einen Failover-Cluster auf einem physischen Host.
- Wie: Nested aktivieren, MAC-Spoofing, iSCSI-Ziel und -Initiator, Test-Cluster, New-Cluster, CSV, Zeuge.
- Wann: Prüfungsvorbereitung AZ-800/AZ-801, Schulung, Test von Updates und Failover.
- Wo: Heimlabor HV01.example.com bzw. Schulungsserver; in Azure mit NAT statt MAC-Spoofing.
- Warum: Clustering, Live-Migration und Quorum realistisch üben, ohne mehrere physische Server.
### iSCSI-Zielserver
- Was: Windows-Rolle, die virtuelle Festplatten (VHDX) als iSCSI-LUNs bereitstellt.
- Wie: `FS-iSCSITarget-Server`, `New-IscsiVirtualDisk`, `New-IscsiServerTarget`, `Add-IscsiVirtualDiskTargetMapping`.
- Womit: Initiator auf den Knoten (`New-IscsiTargetPortal`, `Connect-IscsiTarget -IsPersistent $true`).
- Warum: Gemeinsamer Blockspeicher für den Cluster (CSV, Datenträgerzeuge).

## Karteikarten
- F: Welche drei Einstellungen braucht jeder Nested-Clusterknoten auf dem Host? | A: ExposeVirtualizationExtensions $true, statischer RAM, MAC-Spoofing an allen vNICs.
- F: Welche Rolle stellt in Windows Server iSCSI-LUNs bereit? | A: iSCSI-Zielserver (FS-iSCSITarget-Server).
- F: Wie beschränkt man ein iSCSI-Ziel auf bestimmte Knoten? | A: Über die InitiatorIds (IQNs) des Ziels, z. B. IQN:iqn.1991-05.com.microsoft:hvn1.example.com.
- F: Wie verbindet man einen Initiator dauerhaft mit dem Ziel? | A: New-IscsiTargetPortal, dann Get-IscsiTarget \| Connect-IscsiTarget -IsPersistent $true; Dienst MSiSCSI automatisch.
- F: Was ist vor New-Cluster auszuführen? | A: Test-Cluster (Clustervalidierung).
- F: Wofür dient der kleine 1-GB-Datenträger? | A: Als Datenträgerzeuge (Disk Witness) für das Quorum.
- F: Wie viele Stimmen hat ein 2-Knoten-Cluster mit Datenträgerzeuge? | A: Drei – ein Knoten darf ausfallen.
- F: Unter welchem Pfad erscheinen CSVs? | A: C:\ClusterStorage\VolumeX auf jedem Knoten.
- F: Wie macht man eine vorhandene VM hochverfügbar? | A: Add-ClusterVirtualMachineRole -VMName <VM> (VM-Dateien auf CSV).
- F: Wie migriert man INNER01 live auf HVN2? | A: Move-ClusterVirtualMachineRole -Name INNER01 -Node HVN2 -MigrationType Live
- F: Warum MAC-Spoofing im Cluster-Lab? | A: Die inneren VMs hängen am externen vSwitch der Nested-Knoten und senden mit eigenen MACs über deren vNICs.
- F: Welcher Switch-Typ eignet sich auf HV01 für das iSCSI-Netz? | A: Privat – nur die Lab-VMs untereinander, getrennt vom übrigen Verkehr.

## Quiz
? Im Nested-Cluster-Lab lässt sich auf HVN1 die Hyper-V-Rolle nicht installieren. HVN2 funktioniert. Was ist die wahrscheinlichste Ursache?
* Bei HVN1 wurde ExposeVirtualizationExtensions nicht (oder bei laufender VM) gesetzt
- Der iSCSI-Initiator fehlt
- Der Datenträgerzeuge ist offline
- HVN1 hat keinen privaten Switch
! Ohne weitergegebene Virtualisierungserweiterungen lässt sich die Rolle in L1 nicht installieren.

? Welche Reihenfolge ist für den Clusteraufbau korrekt?
* Speicher anbinden, Test-Cluster ausführen, New-Cluster erstellen
- New-Cluster erstellen, dann Test-Cluster, dann Speicher anbinden
- CSV hinzufügen, dann iSCSI-Ziel anlegen
- Quorum konfigurieren, dann Knoten installieren
! Validierung prüft auch den gemeinsamen Speicher; erst danach wird der Cluster erstellt.

? Wie stellt man auf ISCSI01 sicher, dass nur HVN1 und HVN2 die LUNs sehen?
* Ihre IQNs als InitiatorIds im iSCSI-Ziel eintragen
- Die Windows-Firewall auf ISCSI01 abschalten
- MAC-Spoofing auf ISCSI01 aktivieren
- Die LUNs als Datenträgerzeuge markieren
! Die InitiatorIds wirken wie LUN-Masking.

? Nach einem Neustart von HVN2 fehlen die iSCSI-Datenträger. Was wurde vermutlich vergessen?
* Persistente Verbindung (-IsPersistent $true) bzw. automatischer Start des Dienstes MSiSCSI
- Test-Cluster erneut auszuführen
- MAC-Spoofing für die iSCSI-vNIC
- Die Konfigurationsversion anzuheben
! Nicht-persistente Verbindungen werden beim Neustart nicht wiederhergestellt.

? Wozu dient der 1-GB-Datenträger „Witness“ im Lab?
* Als Datenträgerzeuge für das Quorum
- Als Speicherort für INNER01
- Als Auslagerungsdatei der Knoten
- Als Boot-Datenträger von ISCSI01
! Zwei Knoten plus Zeuge ergeben drei Stimmen.

? Welcher Befehl fügt den Datenträger „Cluster Disk 2“ als CSV hinzu?
* Add-ClusterSharedVolume -Name "Cluster Disk 2"
- Set-ClusterQuorum -DiskWitness "Cluster Disk 2"
- New-Volume -CSV "Cluster Disk 2"
- Add-ClusterDisk -CSV
! CSVs erscheinen danach unter C:\ClusterStorage\VolumeX.

? INNER01 läuft hochverfügbar im Cluster, hat aber kein Netzwerk. Der Cluster meldet keine Fehler. Was fehlt?
* MAC-Spoofing an den vNICs von HVN1/HVN2 auf HV01
- Ein zweiter Datenträgerzeuge
- Der Dienst MSiSCSI in INNER01
- Ein privater Switch in INNER01
! Innere VMs senden mit eigenen MACs über die vNIC des Nested-Knotens; der Switch auf HV01 verwirft sie ohne Spoofing.

? Welche Aussage zu Live-Migration im Lab ist richtig?
* INNER01 kann zwischen HVN1 und HVN2 live migriert werden, HVN1 selbst nicht zwischen physischen Hosts
- HVN1 kann zwischen physischen Hosts live migriert werden, INNER01 nicht
- Weder INNER01 noch HVN1 können migriert werden
- Live-Migration erfordert in Nested-Labs Gen-1-VMs
! Die Einschränkung betrifft nur VMs mit aktivem Gast-Hypervisor.

? Warum werden die iSCSI-Datenträger nur auf HVN1 initialisiert und formatiert?
* Weil gleichzeitiger Schreibzugriff mehrerer Knoten vor der Clusterverwaltung das Dateisystem beschädigen kann
- Weil HVN2 kein GPT kennt
- Weil nur HVN1 Hyper-V hat
- Weil HVN2 die LUNs nicht sehen darf
! Erst der Cluster koordiniert den gemeinsamen Zugriff (Besitz bzw. CSV).

? Welche Einstellung ist für die Nested-Knoten HVN1/HVN2 beim Arbeitsspeicher richtig?
* Statischer RAM (z. B. 8 GB)
- Dynamic Memory mit Minimum 512 MB
- Smart Paging als Hauptspeicher
- RAM erst im Betrieb hochsetzen
! Mit laufendem Gast-Hypervisor fluktuiert der RAM nicht und lässt sich im Betrieb nicht ändern.

? Wie macht man die neue VM INNER01 im Cluster hochverfügbar?
* Add-ClusterVirtualMachineRole -VMName INNER01
- Set-VM -Name INNER01 -HighlyAvailable $true
- Enable-VMReplication -VMName INNER01
- New-ClusterGroup -VM INNER01 -Local
! Voraussetzung: Die VM-Dateien liegen auf gemeinsamem Speicher (CSV).

? Welches Netz sollte im Lab für Clusterkommunikation gesperrt werden (Role = 0)?
* Das iSCSI-Netz
- Das Lab-Netz mit Clientzugriff
- Das Cluster-Netz
- Alle Netze
! Speicherverkehr soll nicht durch Cluster- oder Live-Migrationsverkehr gestört werden.

? Welche Rolle erhält der Host HV01 für den Internetzugang des Labs?
* NAT über internen Switch „Lab“ mit New-NetNat
- DHCP-Server mit Option 003
- iSCSI-Zielserver
- Failover-Cluster-Knoten
! Der interne Switch plus WinNAT gibt den Lab-VMs Internetzugang, ohne sie ins Heimnetz zu hängen.

## Lücken
- Der iSCSI-Initiator wird mit {New-IscsiTargetPortal} am Zielportal angemeldet und mit {Connect-IscsiTarget} -IsPersistent $true verbunden.
- Vor dem Erstellen des Clusters prüft man die Konfiguration mit {Test-Cluster}.
- Ein Zwei-Knoten-Cluster mit {Datenträgerzeuge|Disk Witness} hat {drei|3} Stimmen.

## Zuordnen
### Lab-Maschine und Aufgabe
- HV01 => physischer Host mit Switches und NAT
- DC01 => Active Directory und DNS
- ISCSI01 => iSCSI-Zielserver mit Witness und CSV1
- HVN1 => verschachtelter Hyper-V-Clusterknoten
- HVCL01 => Clustername mit eigener IP
- INNER01 => hochverfügbare innere VM

## Reihenfolge
### Nested-Failover-Cluster aufbauen
1. Switches und NAT auf HV01 anlegen
2. DC01 mit AD DS und DNS bereitstellen
3. ISCSI01 mit iSCSI-Ziel und virtuellen Datenträgern einrichten
4. HVN1 und HVN2 mit Nested, statischem RAM und MAC-Spoofing anlegen
5. Hyper-V, Failover-Clustering und iSCSI-Initiator auf den Knoten einrichten
6. Datenträger auf einem Knoten initialisieren und formatieren
7. Test-Cluster ausführen und HVCL01 erstellen
8. Datenträgerzeuge und CSV konfigurieren
9. INNER01 auf dem CSV anlegen und hochverfügbar machen
10. Live-Migration und Failover testen

## Freitext
- F: Beschreiben Sie den Aufbau eines Zwei-Knoten-Hyper-V-Clusters mit Nested Virtualization auf einem Host (Maschinen, Netze, Speicher). | M: Host mit internem Lab-Switch (NAT) und privaten Switches für iSCSI/Cluster; DC für AD/DNS; iSCSI-Zielserver mit Witness- und CSV-LUN; zwei Nested-Knoten mit ExposeVirtualizationExtensions, statischem RAM, MAC-Spoofing; Initiatoren persistent; Test-Cluster, New-Cluster, Datenträgerzeuge, CSV; HA-VM auf CSV | P: 8
- F: Begründen Sie die Wahl eines Datenträgerzeugen im Zwei-Knoten-Cluster. | M: Zwei Knoten allein haben bei Ausfall eines Knotens keine Mehrheit (1 von 2); der Zeuge liefert die dritte Stimme, sodass ein Knoten ausfallen darf und Split-Brain verhindert wird | P: 3

## Szenario
### Lab-Abnahme durch die Ausbilderin
Die Ausbilderin prüft dein Lab auf **HV01.example.com**: Cluster **HVCL01** mit **HVN1**/**HVN2**, Speicher von **ISCSI01**. Sie schaltet HVN1 über den Hyper-V-Manager auf HV01 hart aus, während **INNER01** auf HVN1 läuft.
- F: Was passiert mit INNER01? | A: Der Cluster erkennt den Knotenausfall, HVN2 behält mit dem Datenträgerzeugen das Quorum (2 von 3 Stimmen) und startet INNER01 neu – kein Live-Zustand, sondern Neustart | P: 3
- F: Wie hätten Sie INNER01 vorher unterbrechungsfrei verschoben? | A: Move-ClusterVirtualMachineRole -Name INNER01 -Node HVN2 -MigrationType Live | P: 2
- F: Wie prüfen Sie, wo INNER01 jetzt läuft? | A: Get-ClusterGroup -Name INNER01 \| Select-Object Name, OwnerNode, State | P: 1
- F: Die Ausbilderin fragt, warum HVN1 selbst nicht auf einen zweiten physischen Host live migriert werden kann. | A: VMs mit aktivem Gast-Hypervisor (Nested) unterstützen keine Live-Migration; nur Offline-Migration | P: 2

## Spickzettel
- HV01: Lab (intern+NAT), iSCSI (privat), Cluster (privat)
- HVN1/HVN2: Expose…$true, 8 GB statisch, MAC-Spoofing alle vNICs
- ISCSI01: FS-iSCSITarget-Server, InitiatorIds = IQNs
- Knoten: MSiSCSI automatisch, Connect-IscsiTarget -IsPersistent
- Test-Cluster → New-Cluster -NoStorage → Add-ClusterDisk → Zeuge → CSV
- Add-ClusterVirtualMachineRole, Move-ClusterVirtualMachineRole -MigrationType Live
