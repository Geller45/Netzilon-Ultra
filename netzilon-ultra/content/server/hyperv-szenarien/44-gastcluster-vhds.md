---
id: server-hvsz-44
bereich: AZ-800
block: HV-S
kapitel: Hyper-V-Praxisszenarien
titel: Szenario 44 – Gast-Cluster: freigegebene VHDX und VHD-Satz (.vhds)
stufe: Profi
fach: Windows Server / AZ-800
pruefungen: [AZ-800, AZ-801, AP2, Schule]
quellen: [Microsoft Learn – Hyper-V]
verweise: [az801-failover-cluster, az801-cluster-storage-quorum, az801-cluster-sets-sofs, az800-vhdx, server-hvsz-43]
---

## Profi

### Ticket
**Kunde meldet:** „Unsere Dateiserver-Rolle soll innerhalb von VMs als Cluster laufen (Gast-Cluster), damit wir einzelne VMs patchen können, ohne dass die Freigaben weg sind. Wie geben wir den beiden VMs eine gemeinsame Platte?“
- **Priorität:** mittel (Projekt)
- **Betroffene Maschinen:** **GFS1**, **GFS2** auf Host-Cluster **CL01** (HV01, HV02)

### Ausgangslage
- Host-Cluster **CL01** mit HV01/HV02, Server 2025, **CSV** `C:\ClusterStorage\Volume1`.
- VMs **GFS1** (192.168.10.71) und **GFS2** (192.168.10.72), Server 2025, Gen 2, Domäne example.com.
- Geplant: Gast-Cluster **GCL01** (192.168.10.70) mit Rolle Dateiserver.

### Analyse
- Ein **Gast-Cluster** braucht gemeinsamen Speicher **innerhalb** der VMs. Optionen: Gast-iSCSI, virtuelles Fibre Channel oder **freigegebene virtuelle Festplatten**.
- **Freigegebene VHDX** (Shared VHDX, seit Server 2012 R2) – gleiche .vhdx an mehrere VMs mit **persistenten Reservierungen** (SCSI-3).
- **VHD-Satz** (VHD Set, Dateiendung **.vhds**, seit Server 2016) – Nachfolger der freigegebenen VHDX. Besteht aus einer kleinen **.vhds**-Steuerdatei und **.avhdx**-Datendateien.
  - Vorteile gegenüber freigegebener VHDX: **Online-Größenänderung**, **Host-basierte Sicherung**, Unterstützung für **Hyper-V-Replikat**.
  - Gastbetriebssystem ab **Windows Server 2016**.
- **Voraussetzungen**: Datei liegt auf **CSV** oder **SMB-3-Freigabe (Scale-Out File Server)** – **nicht** auf lokalem Host-Datenträger; Anbindung an den **SCSI-Controller** der VMs; Hosts im Failover-Cluster.
- Umwandeln von freigegebener VHDX in VHD-Satz: `Convert-VHD` (VMs aus).

### Lösungsweg
1. **VHD-Satz** für Daten (500 GB) und Zeuge (1 GB) auf dem CSV anlegen. *Begründung:* Modernes Format mit Backup/Resize.
2. Beide .vhds an **GFS1 und GFS2** jeweils am **SCSI-Controller** als **freigegebenes Laufwerk** anhängen (`-SupportPersistentReservations`). *Begründung:* Clusterfähige gemeinsame Nutzung.
3. In **GFS1**: Datenträger online, initialisieren, formatieren. *Begründung:* Nur ein Knoten formatiert.
4. In GFS1 und GFS2: Feature **Failover-Clustering**, `Test-Cluster`, `New-Cluster GCL01`. *Begründung:* Gast-Cluster entsteht.
5. **Dateiserver-Rolle** im Gast-Cluster erstellen. *Begründung:* Hochverfügbare Freigaben.
6. **Anti-Affinität**: GFS1 und GFS2 auf verschiedenen Hosts halten (z. B. `AntiAffinityClassNames` bzw. in Server 2025 Affinitätsregeln). *Begründung:* Sonst fallen beide Gastknoten mit einem Host aus.

### Ergebnis prüfen
- HV01: `Get-VMHardDiskDrive -VMName GFS1, GFS2 | Select VMName, Path, SupportPersistentReservations` → beide verweisen auf dieselbe .vhds, True.
- GFS1: `Get-ClusterNode -Cluster GCL01` → GFS1, GFS2 Up; `Test-Cluster` Speichertests grün.
- Freigabe bleibt erreichbar, während GFS1 neu gestartet wird.

### Vorbeugung
- Bestehende freigegebene .vhdx-Dateien bei Gelegenheit in **.vhds** umwandeln.
- Gastknoten auf unterschiedliche Hosts verteilen.
- Größenänderungen über `Resize-VHD` am .vhds im Betrieb – danach im Gast das Volume erweitern.

## Einfach
Stell dir zwei **Köche** (GFS1 und GFS2) vor, die abwechselnd in einer Küche kochen. Damit der zweite sofort weitermachen kann, wenn der erste Pause macht, brauchen beide **denselben Kühlschrank**.

Normalerweise hat jede VM ihren eigenen Kühlschrank (eigene VHDX). Für ein Team (Gast-Cluster) gibt es einen **gemeinsamen Kühlschrank**: den **VHD-Satz** (Dateiendung .vhds). Beide Köche können ihn öffnen. Ein **Schloss mit Reservierung** sorgt dafür, dass nicht beide gleichzeitig dasselbe Fach umräumen.

Damit das funktioniert:
- Der Kühlschrank muss in einem Raum stehen, den **beide Häuser** erreichen (CSV oder Scale-Out-Dateiserver).
- Er wird an der richtigen **Steckdose** angeschlossen (SCSI-Controller).

Der neuere **VHD-Satz** ist besser als die ältere „freigegebene VHDX“: Man kann ihn im Betrieb **vergrößern** und **sichern**.

Und noch ein Tipp: Die beiden Köche sollten in **verschiedenen Häusern** wohnen (verschiedene Hosts). Sonst sind bei einem Stromausfall beide gleichzeitig weg.

## Merksatz
- Gast-Cluster-Speicher: **.vhds** (VHD-Satz) statt freigegebener .vhdx.
- Ablage nur auf **CSV** oder **SOFS (SMB 3)**.
- Anschluss am **SCSI-Controller**, **persistente Reservierungen**.
- Gast ab **Server 2016**; Gastknoten auf **verschiedene Hosts**.

## Prüfungsfalle
- Eine freigegebene VHDX/VHD-Satz auf einem **lokalen** Host-Datenträger wird nicht unterstützt.
- IDE-Controller geht nicht – nur **SCSI**.
- Freigegebene VHDX (alt) unterstützt **keine** Online-Größenänderung und keine Host-Sicherung – VHD-Satz schon.
- Gast-Cluster auf demselben Host bietet keinen Schutz vor Hostausfall.

## Grafik
### Gemeinsamer VHD-Satz
1. HV01 -> CSV: New-VHD Daten.vhds und Zeuge.vhds
2. CSV -> GFS1: Daten.vhds am SCSI-Controller, persistente Reservierung
3. CSV -> GFS2: dieselbe Daten.vhds am SCSI-Controller
4. GFS1 -> GFS2: Gast-Cluster GCL01 erstellt
5. GFS1: Neustart für Patches – Dateiserver-Rolle wechselt zu GFS2
6. Client -> GCL01: Freigabe bleibt erreichbar

## Lab
**Nachstellen:** Erst falsch (VHD-Satz auf lokalem Datenträger), dann korrekt auf CSV. Maschinen: Host-Cluster **CL01** (HVN1/HVN2 aus Szenario 42), VMs **GFS1**, **GFS2**.

### GUI
1. **HVN1**: Hyper-V-Manager → Neu → Festplatte → Format **VHD-Satz** → Speicherort `D:\Lokal\Daten.vhds` → GFS1 → SCSI-Controller → **Freigegebenes Laufwerk** → Datei wählen → Start schlägt fehl bzw. GFS2 auf HVN2 kann die Datei nicht nutzen (Fehlerbild).
2. **HVN1**: Neu → Festplatte → **VHD-Satz** → Speicherort `C:\ClusterStorage\Volume1\Shared\Daten.vhds` (500 GB) → ebenso `Zeuge.vhds` (1 GB).
3. **HVN1**: Failover-Cluster-Manager → GFS1 → Einstellungen → SCSI-Controller → **Freigegebenes Laufwerk** → Hinzufügen → Daten.vhds; dasselbe für Zeuge.vhds; dann identisch für **GFS2**.
4. **GFS1**: Datenträgerverwaltung → beide Datenträger online, GPT, NTFS.
5. **GFS1**: Failover-Cluster-Manager → Cluster erstellen **GCL01** (GFS1, GFS2) → Rolle **Dateiserver** → Freigabe anlegen.
6. **GFS1**: neu starten → Freigabe vom Client weiter erreichbar.

### PowerShell
```powershell
# Auf HVN1 – VHD-Sätze auf dem CSV
New-Item -ItemType Directory "C:\ClusterStorage\Volume1\Shared" -Force
New-VHD -Path "C:\ClusterStorage\Volume1\Shared\Daten.vhds" -SizeBytes 500GB -Dynamic
New-VHD -Path "C:\ClusterStorage\Volume1\Shared\Zeuge.vhds" -SizeBytes 1GB -Dynamic

# Auf HVN1 – an beide VMs (SCSI, persistente Reservierungen)
foreach ($vm in "GFS1","GFS2") {
    Add-VMHardDiskDrive -VMName $vm -ControllerType SCSI -Path "C:\ClusterStorage\Volume1\Shared\Daten.vhds" -SupportPersistentReservations
    Add-VMHardDiskDrive -VMName $vm -ControllerType SCSI -Path "C:\ClusterStorage\Volume1\Shared\Zeuge.vhds" -SupportPersistentReservations
}
Get-VMHardDiskDrive -VMName GFS1, GFS2 | Format-Table VMName, Path, SupportPersistentReservations

# Auf GFS1 und GFS2 – Clusterfeature
Install-WindowsFeature Failover-Clustering, FS-FileServer -IncludeManagementTools

# Auf GFS1 – Gast-Cluster
Test-Cluster -Node GFS1, GFS2
New-Cluster -Name GCL01 -Node GFS1, GFS2 -StaticAddress 192.168.10.70

# Auf HVN1 – alte freigegebene VHDX umwandeln (VMs aus)
Convert-VHD -Path "C:\ClusterStorage\Volume1\Shared\Alt.vhdx" -DestinationPath "C:\ClusterStorage\Volume1\Shared\Alt.vhds"
```

## Szenario
### Kontrollfragen
GFS1 und GFS2 sollen einen Gast-Cluster mit gemeinsamer Datenplatte bilden. Die Hosts HV01/HV02 bilden Cluster CL01 mit CSV.
- F: Welches Datenträgerformat ist für gemeinsame Platten in Gast-Clustern vorgesehen? | A: VHD-Satz (.vhds).
- F: Wo muss die .vhds liegen? | A: Auf einem CSV oder einer SMB-3-Freigabe (Scale-Out File Server).
- F: Welcher Parameter erlaubt die gemeinsame Nutzung beim Anhängen? | A: Add-VMHardDiskDrive -SupportPersistentReservations (am SCSI-Controller).
- F: Was kann ein VHD-Satz, was die freigegebene VHDX nicht kann? | A: Online-Größenänderung, Host-basierte Sicherung, Hyper-V-Replikat.
- F: Ab welchem Gastbetriebssystem wird der VHD-Satz unterstützt? | A: Windows Server 2016.

## Legende
### VHD-Satz (VHD Set)
- Was: Freigegebenes virtuelles Datenträgerformat (.vhds + .avhdx) für Gast-Cluster.
- Wie: New-VHD -Path Datei.vhds, Anhängen mit -SupportPersistentReservations am SCSI-Controller.
- Wann: Wenn mehrere VMs gleichzeitig auf einen Clusterdatenträger zugreifen müssen.
- Wo: Auf CSV oder Scale-Out-File-Server-Freigaben.
- Warum: Gast-Cluster ohne Gast-iSCSI/FC, mit Online-Resize und Host-Backup.

## Karteikarten
- F: Welche Dateiendung hat ein VHD-Satz? | A: .vhds (dazu .avhdx-Datendateien).
- F: Seit welcher Version gibt es VHD-Sätze? | A: Windows Server 2016.
- F: Wo darf ein VHD-Satz liegen? | A: Auf CSV oder SMB-3-Freigabe (SOFS).
- F: An welchem Controller wird er angeschlossen? | A: Am SCSI-Controller.
- F: Welcher Parameter aktiviert gemeinsame Nutzung? | A: -SupportPersistentReservations bei Add-VMHardDiskDrive.
- F: Vorteile des VHD-Satzes gegenüber freigegebener VHDX? | A: Online-Größenänderung, Host-Backup, Hyper-V-Replikat.
- F: Wie wandelt man eine freigegebene VHDX um? | A: Convert-VHD -Path alt.vhdx -DestinationPath neu.vhds (VMs aus).
- F: Warum Gastknoten auf verschiedene Hosts verteilen? | A: Damit ein Hostausfall nicht beide Gastknoten trifft.

## Quiz
? Welches Format empfiehlt sich ab Server 2016 für Gast-Cluster-Speicher?
* VHD-Satz (.vhds)
- Freigegebene VHD (.vhd)
- Differenzierende VHDX
- Pass-through-Datenträger
! Nachfolger der freigegebenen VHDX.

? Wo darf ein VHD-Satz liegen?
* Auf CSV oder einer SMB-3-Freigabe (SOFS)
- Auf dem lokalen Laufwerk D: eines Hosts
- Auf einem USB-Stick
- Im Gast auf C:
! Beide VMs müssen ihn über verschiedene Hosts erreichen.

? Welcher Controller wird für freigegebene Laufwerke verwendet?
* SCSI-Controller
- IDE-Controller
- Diskettencontroller
- NVMe-Controller des Hosts
! Nur SCSI unterstützt persistente Reservierungen.

? Welcher Vorteil gilt für den VHD-Satz, nicht aber für die alte freigegebene VHDX?
* Online-Größenänderung
- Funktioniert ohne Cluster
- Kann an IDE hängen
- Unterstützt Windows Server 2008
! Dazu Host-Backup und Replikat.

? Welcher Parameter erlaubt mehreren VMs den Zugriff?
* -SupportPersistentReservations
- -Shared $true -AllowMultiple
- -MultiAttach -ControllerType SCSI
- -Differencing -ParentPath
! Wird bei Add-VMHardDiskDrive gesetzt.

? Welches Cmdlet wandelt eine freigegebene VHDX in einen VHD-Satz?
* Convert-VHD
- Optimize-VHD
- Resize-VHD
- Merge-VHD
! Ziel mit Endung .vhds angeben.

? Warum sollten GFS1 und GFS2 auf verschiedenen Hosts laufen?
* Damit ein Hostausfall nicht beide Gastknoten trifft
- Weil VHD-Sätze technisch zwei Hosts verlangen
- Damit Windows-Server-Lizenzen gespart werden
- Weil sonst kein DHCP im Gastcluster funktioniert
! Anti-Affinität erhöht die Verfügbarkeit.

? Ab welchem Gast-OS werden VHD-Sätze unterstützt?
* Windows Server 2016
- Windows Server 2008 R2
- Windows Server 2012
- Nur Windows 11
! Ältere Gäste nutzen die freigegebene VHDX.
