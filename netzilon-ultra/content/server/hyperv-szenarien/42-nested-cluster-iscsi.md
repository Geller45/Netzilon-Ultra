---
id: server-hvsz-42
bereich: AZ-800
block: HV-S
kapitel: Hyper-V-Praxisszenarien
titel: Szenario 42 – Nested-Cluster-Lab: zwei Hyper-V-Knoten in VMs mit iSCSI-Zielserver
stufe: Profi
fach: Windows Server / AZ-800
pruefungen: [AZ-800, AZ-801, AP2, Schule]
quellen: [Microsoft Learn – Hyper-V]
verweise: [az800-nested, server-iscsi, az801-failover-cluster, az801-cluster-storage-quorum, server-hvsz-41]
---

## Profi

### Ticket
**Kunde meldet (Ausbilder):** „Die Azubis sollen für die AZ-801-Vorbereitung einen echten Hyper-V-Cluster bauen. Wir haben aber nur einen leistungsstarken PC mit 64 GB RAM.“
- **Priorität:** niedrig (Ausbildungsprojekt)
- **Betroffene Maschine:** physischer Host **LABHOST**

### Ausgangslage
- **LABHOST**: Windows Server 2025 mit Hyper-V, 64 GB RAM, 8 Kerne, SSD 1 TB; interner Switch **„LabNet“** (192.168.50.0/24) mit NAT ins Internet.
- Geplante VMs auf LABHOST:
  - **DC01** (192.168.50.10) – Domäne example.com, DNS
  - **ISCSI01** (192.168.50.20) – Windows Server mit **iSCSI-Zielserver** (iSCSI Target Server)
  - **HVN1** (192.168.50.31) und **HVN2** (192.168.50.32) – Server 2025 mit Hyper-V (**nested**), später Clusterknoten
- Cluster **CL01** mit IP 192.168.50.30.

### Analyse
- **Geschachtelte Virtualisierung**: HVN1/HVN2 brauchen `ExposeVirtualizationExtensions`, **statischen RAM**, und **MAC-Spoofing** an ihren vNICs, damit innere VMs ins Netz kommen.
- Gemeinsamer Speicher ohne SAN: **Windows-iSCSI-Zielserver** (Rolle `FS-iSCSITarget-Server`) stellt virtuelle iSCSI-Datenträger (VHDX-Dateien) als **LUNs** bereit. Zugriff wird über **Initiator-IDs** (IQN, IP, DNS-Name) des Ziels geregelt.
- Die Knoten verbinden sich per **iSCSI-Initiator** (Dienst **MSiSCSI**, Port **3260**).
- LUNs: **Quorum** (1 GB, Datenträgerzeuge) und **Daten** (100 GB, wird **CSV**).
- Cluster braucht: gleiche Domäne, gleiche Updates, `Failover-Clustering`-Feature, erfolgreiche **Clustervalidierung** (`Test-Cluster`).

### Lösungsweg
1. **DC01** installieren, Domäne example.com hochstufen. *Begründung:* Failover-Cluster mit AD-Clusternamensobjekt.
2. **HVN1/HVN2** anlegen (VM aus): Nested aktivieren, 8 GB statisch, MAC-Spoofing, Domänenbeitritt, Rollen **Hyper-V** und **Failover-Clustering**. *Begründung:* Voraussetzungen für Hyper-V in der VM.
3. **ISCSI01**: Rolle iSCSI-Zielserver, zwei virtuelle iSCSI-Datenträger, Ziel **CL01-Target** mit Initiator-IDs von HVN1 und HVN2. *Begründung:* Gemeinsamer Blockspeicher.
4. **HVN1/HVN2**: MSiSCSI-Dienst automatisch starten, Zielportal 192.168.50.20 hinzufügen, Ziel **dauerhaft** verbinden. *Begründung:* Verbindung übersteht Neustarts.
5. Auf **HVN1**: Datenträger online, initialisieren (GPT), NTFS formatieren (auf HVN2 nur online sehen). *Begründung:* Nur ein Knoten formatiert.
6. `Test-Cluster` → `New-Cluster` → Datenträger als CSV hinzufügen, Quorum-Datenträger als Zeuge. *Begründung:* Validierung ist Voraussetzung für Supportfähigkeit.
7. vSwitch **„Extern“** mit gleichem Namen auf beiden Knoten. *Begründung:* Für hochverfügbare VMs (Szenario 41).

### Ergebnis prüfen
- `Get-ClusterNode -Cluster CL01` → HVN1, HVN2 Up.
- `Get-ClusterSharedVolume` → Volume1 Online; Pfad `C:\ClusterStorage\Volume1` auf beiden Knoten.
- `Get-ClusterQuorum` → Knoten- und Datenträgermehrheit (Node and Disk Majority).
- ISCSI01: `Get-IscsiServerTarget` → Status Connected.

### Vorbeugung
- Lab-Prüfpunkte nach jedem großen Schritt (Achtung: Prüfpunkte von Clusterknoten nur im Lab).
- Getrenntes iSCSI-Netz (zweiter interner Switch) für realistischen Aufbau.
- Ressourcen planen: 4 VMs + innere VMs → RAM knapp halten.

## Einfach
Ein echter Cluster braucht normalerweise mehrere teure Server und einen gemeinsamen Speicherschrank. In der Ausbildung hat man aber oft nur **einen** starken PC.

Die Idee: Wir bauen alles **als Puppen in der Puppe**:
- Der große PC (LABHOST) ist die **große Puppe**.
- Darin stecken kleine Puppen: ein **Chef** (DC01), ein **Lagerhaus** (ISCSI01) und zwei **Arbeiter** (HVN1, HVN2).
- Die Arbeiter können selbst wieder Puppen (VMs) tragen – das ist die **geschachtelte Virtualisierung**.

Das Lagerhaus stellt einen **gemeinsamen Schrank** bereit (iSCSI). Beide Arbeiter haben einen Schlüssel dazu. Dann werden die zwei Arbeiter zu einem **Team** (Cluster) verbunden. Wenn einer müde wird (ausfällt), übernimmt der andere seine Puppen – weil alles im gemeinsamen Schrank liegt.

So lernt man am eigenen PC genau das, was in großen Rechenzentren passiert.

## Merksatz
- Nested: **ExposeVirtualizationExtensions + statischer RAM + MAC-Spoofing**.
- iSCSI: **Ziel** (Target) stellt bereit, **Initiator** verbindet, Port **3260**.
- Zugriff am Ziel über **Initiator-IDs (IQN)**.
- **Test-Cluster** vor **New-Cluster**.

## Prüfungsfalle
- Ohne MAC-Spoofing an HVN1/HVN2 erreichen deren innere VMs das Netz nicht.
- Fehlt die IQN eines Knotens am iSCSI-Ziel, sieht dieser Knoten die LUN nicht.
- Datenträger nur auf **einem** Knoten initialisieren/formatieren.
- Verbindung ohne „dauerhaft“ (`-IsPersistent $true`) ist nach dem Neustart weg.

## Grafik
### Nested-Cluster-Aufbau
1. LABHOST -> HVN1, HVN2: Nested aktiviert, MAC-Spoofing an
2. HVN1 -> ISCSI01: Initiator verbindet über Port 3260
3. HVN2 -> ISCSI01: Initiator verbindet über Port 3260
4. ISCSI01 -> HVN1, HVN2: LUNs Quorum und Daten freigegeben
5. HVN1: Test-Cluster erfolgreich, New-Cluster CL01
6. CL01: Daten-LUN wird CSV Volume1, Quorum-LUN Zeuge

## Lab
**Nachstellen:** Vollständiger Aufbau; als Fehler wird eine Initiator-ID vergessen. Maschinen: **LABHOST**, **DC01**, **ISCSI01**, **HVN1**, **HVN2**.

### GUI
1. **LABHOST**: Hyper-V-Manager → HVN1 und HVN2 als Gen-2-VMs (8 GB, 4 vCPU) an „LabNet“ anlegen → Netzwerkkarte → Erweiterte Features → **MAC-Spoofing** aktivieren.
2. **ISCSI01**: Server-Manager → Rollen → Datei-/Speicherdienste → **iSCSI-Zielserver** installieren.
3. **ISCSI01**: Server-Manager → Datei-/Speicherdienste → **iSCSI** → „Neuer virtueller iSCSI-Datenträger“ → Quorum 1 GB → neues Ziel **CL01-Target** → Zugriffsserver: **nur HVN1** hinzufügen (Fehler). Danach Daten 100 GB demselben Ziel zuordnen.
4. **HVN2**: iSCSI-Initiator → Ziel 192.168.50.20 → „Schnell verbinden“ → kein Ziel / kein Zugriff (Fehlerbild).
5. **ISCSI01**: Ziel CL01-Target → Eigenschaften → **Initiatoren** → HVN2 (IQN) hinzufügen.
6. **HVN1** und **HVN2**: iSCSI-Initiator → Verbinden → „Diese Verbindung der Liste der bevorzugten Ziele hinzufügen“.
7. **HVN1**: Datenträgerverwaltung → beide Datenträger online, initialisieren (GPT), NTFS formatieren.
8. **HVN1**: Failover-Cluster-Manager → Konfiguration überprüfen (HVN1, HVN2) → Cluster erstellen **CL01**, IP 192.168.50.30 → Speicher → Datenträger → Daten-LUN „Zu freigegebenen Clustervolumes hinzufügen“.

### PowerShell
```powershell
# Auf LABHOST – Nested-Knoten vorbereiten (VMs aus)
foreach ($n in "HVN1","HVN2") {
    Set-VMProcessor -VMName $n -ExposeVirtualizationExtensions $true -Count 4
    Set-VMMemory -VMName $n -DynamicMemoryEnabled $false -StartupBytes 8GB
    Get-VMNetworkAdapter -VMName $n | Set-VMNetworkAdapter -MacAddressSpoofing On
}

# Auf HVN1 und HVN2 – Rollen
Install-WindowsFeature Hyper-V, Failover-Clustering -IncludeManagementTools -Restart

# Auf ISCSI01 – Zielserver und LUNs
Install-WindowsFeature FS-iSCSITarget-Server -IncludeManagementTools
New-IscsiVirtualDisk -Path "D:\iSCSI\Quorum.vhdx" -SizeBytes 1GB
New-IscsiVirtualDisk -Path "D:\iSCSI\Daten.vhdx" -SizeBytes 100GB
New-IscsiServerTarget -TargetName "CL01-Target" -InitiatorIds "IQN:iqn.1991-05.com.microsoft:hvn1.example.com","IQN:iqn.1991-05.com.microsoft:hvn2.example.com"
Add-IscsiVirtualDiskTargetMapping -TargetName "CL01-Target" -Path "D:\iSCSI\Quorum.vhdx"
Add-IscsiVirtualDiskTargetMapping -TargetName "CL01-Target" -Path "D:\iSCSI\Daten.vhdx"

# Auf HVN1 und HVN2 – Initiator
Set-Service MSiSCSI -StartupType Automatic; Start-Service MSiSCSI
New-IscsiTargetPortal -TargetPortalAddress 192.168.50.20
Get-IscsiTarget | Connect-IscsiTarget -IsPersistent $true

# Auf HVN1 – Datenträger vorbereiten (nur auf einem Knoten!)
Get-Disk | Where-Object BusType -eq iSCSI | Initialize-Disk -PartitionStyle GPT -PassThru |
    New-Partition -UseMaximumSize -AssignDriveLetter | Format-Volume -FileSystem NTFS -Confirm:$false

# Auf HVN1 – Cluster
Test-Cluster -Node HVN1, HVN2
New-Cluster -Name CL01 -Node HVN1, HVN2 -StaticAddress 192.168.50.30
Get-ClusterAvailableDisk | Add-ClusterDisk
Add-ClusterSharedVolume -Name "Cluster Disk 2"
Get-ClusterQuorum
```

## Reihenfolge
### Nested-Cluster bauen
1. DC01 mit Domäne bereitstellen
2. HVN1 und HVN2 mit Nested, statischem RAM und MAC-Spoofing anlegen
3. Rollen Hyper-V und Failover-Clustering installieren
4. iSCSI-Zielserver mit LUNs und Initiator-IDs einrichten
5. Initiatoren dauerhaft verbinden
6. Datenträger auf einem Knoten initialisieren und formatieren
7. Test-Cluster ausführen
8. Cluster erstellen und CSV hinzufügen

## Szenario
### Kontrollfragen
Auf LABHOST laufen DC01, ISCSI01, HVN1 und HVN2. HVN2 sieht die iSCSI-LUNs nicht, HVN1 schon.
- F: Was ist die wahrscheinlichste Ursache? | A: Die Initiator-ID (IQN) von HVN2 fehlt am iSCSI-Ziel CL01-Target.
- F: Welche drei Einstellungen braucht eine Nested-Hyper-V-VM? | A: ExposeVirtualizationExtensions, statischer RAM, MAC-Spoofing (oder NAT) für innere VMs.
- F: Welcher Port wird für iSCSI genutzt? | A: TCP 3260.
- F: Welcher Befehl muss vor New-Cluster laufen? | A: Test-Cluster (Clustervalidierung).
- F: Wie wird die Verbindung neustartfest? | A: Connect-IscsiTarget -IsPersistent $true bzw. „Zu bevorzugten Zielen hinzufügen“.

## Legende
### iSCSI-Zielserver
- Was: Windows-Serverrolle, die virtuelle Datenträger (VHDX) als iSCSI-LUNs bereitstellt.
- Wie: Install-WindowsFeature FS-iSCSITarget-Server, New-IscsiVirtualDisk, New-IscsiServerTarget.
- Wann: Gemeinsamer Speicher für Labs, Cluster-Tests oder kleine Umgebungen ohne SAN.
- Wo: Auf einem eigenen Speicherserver (hier ISCSI01).
- Warum: Clusterknoten brauchen gemeinsam nutzbaren Blockspeicher.
### Initiator-ID
- Was: Kennung (IQN, IP, DNS-Name, MAC), die am Ziel den Zugriff erlaubt.
- Beispiel: iqn.1991-05.com.microsoft:hvn1.example.com

## Karteikarten
- F: Welches Feature stellt iSCSI-LUNs auf Windows Server bereit? | A: iSCSI-Zielserver (FS-iSCSITarget-Server).
- F: Welcher Dienst ist der Windows-iSCSI-Initiator? | A: MSiSCSI (Microsoft iSCSI Initiator Service).
- F: Welcher TCP-Port wird für iSCSI genutzt? | A: 3260.
- F: Wie wird der Zugriff am iSCSI-Ziel eingeschränkt? | A: Über Initiator-IDs, meist die IQN der Knoten.
- F: Welche Einstellungen braucht ein Nested-Hyper-V-Knoten? | A: ExposeVirtualizationExtensions, statischer RAM, MAC-Spoofing.
- F: Cmdlet für die Clustervalidierung? | A: Test-Cluster -Node HVN1, HVN2
- F: Wie wird ein Clusterdatenträger zum CSV? | A: Add-ClusterSharedVolume -Name "Cluster Disk X"
- F: Warum nur auf einem Knoten formatieren? | A: Gleichzeitiges Schreiben ohne Clusterkontrolle beschädigt das Dateisystem.
- F: Wie verbindet man ein Ziel dauerhaft? | A: Connect-IscsiTarget -IsPersistent $true

## Quiz
? Welche Rolle stellt auf ISCSI01 die LUNs bereit?
* iSCSI-Zielserver
- iSCSI-Initiator
- Dateiserver-Ressourcen-Manager
- Speicherreplikat
! Der Initiator ist die Gegenseite auf den Knoten.

? HVN2 sieht keine LUN, HVN1 schon. Was fehlt am wahrscheinlichsten?
* Die IQN von HVN2 als Initiator-ID am Ziel
- Die Hyper-V-Rolle auf dem Zielserver ISCSI01
- Ein DHCP-Bereich für das iSCSI-Netz
- Eine erfolgreiche Clustervalidierung (Test-Cluster)
! Das Ziel gibt LUNs nur an eingetragene Initiatoren.

? Welcher Port wird für iSCSI genutzt?
* TCP 3260
- TCP 445
- UDP 3343
- TCP 5985
! 3343 ist der Cluster-Heartbeat, 445 SMB, 5985 WinRM.

? Was muss vor New-Cluster ausgeführt werden?
* Test-Cluster
- Update-VMVersion
- Optimize-VHD
- Enable-VMResourceMetering
! Ein validierter Cluster ist Voraussetzung für Support.

? Warum braucht HVN1 MAC-Spoofing?
* Damit innere VMs mit eigenen MACs ins Netz kommen
- Damit der iSCSI-Initiator das Ziel überhaupt findet
- Damit der Cluster einen Netzwerknamen registrieren kann
- Damit die VM HVN1 schneller startet und weniger RAM braucht
! Alternativ wäre NAT in der äußeren VM möglich.

? Auf wie vielen Knoten initialisiert und formatiert man die neue LUN?
* Auf einem Knoten
- Auf allen Knoten gleichzeitig
- Auf keinem, der Cluster macht das allein
- Auf dem iSCSI-Ziel
! Die anderen Knoten sehen sie danach nur.

? Welcher Parameter sorgt für eine neustartfeste iSCSI-Verbindung?
* -IsPersistent $true
- -AutoStart
- -Permanent
- -Reconnect Always
! Entspricht „Zu bevorzugten Zielen hinzufügen“.

? Welches Quorum ergibt sich bei 2 Knoten mit Datenträgerzeuge?
* Knoten- und Datenträgermehrheit
- Nur Knotenmehrheit ohne Zeugen
- Kein Quorum, Cluster bleibt offline
- Knoten- und Dateifreigabemehrheit
! Der Zeuge bringt die dritte Stimme.
