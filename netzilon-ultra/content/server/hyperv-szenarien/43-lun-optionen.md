---
id: server-hvsz-43
bereich: AZ-800
block: HV-S
kapitel: Hyper-V-Praxisszenarien
titel: Szenario 43 – VM braucht eine LUN: Gast-iSCSI, Pass-through oder VHDX?
stufe: Profi
fach: Windows Server / AZ-800
pruefungen: [AZ-800, AP2, Schule]
quellen: [Microsoft Learn – Hyper-V]
verweise: [server-iscsi, server-san, az800-vhdx, az800-pruefpunkte, server-hvsz-44]
---

## Profi

### Ticket
**Kunde meldet:** „Der Dienstleister unseres Dokumentenarchivs möchte für ARCH01 ‚direkt eine LUN vom SAN‘. Wir sollen entscheiden, wie die LUN in die VM kommt. Was ist der beste Weg?“
- **Priorität:** mittel (Entscheidungsvorlage)
- **Betroffene Maschine:** **ARCH01** auf **HV01**

### Ausgangslage
- **HV01.example.com**, Server 2025; iSCSI-SAN **SAN01** (Portal 10.0.60.10) im Speichernetz 10.0.60.0/24, HV01 hat eine Speicher-NIC 10.0.60.11.
- VM **ARCH01** (Gen 2, 192.168.10.65), benötigt 2 TB.
- Anforderungen: tägliche Sicherung, Live-Migration zu HV02 wünschenswert, Prüfpunkte vor Updates.

### Analyse
Drei Wege, Blockspeicher in eine VM zu bringen:

| Kriterium | **VHDX auf Host-LUN** | **Gast-iSCSI** (Initiator in der VM) | **Pass-through-Datenträger** |
|---|---|---|---|
| Aufbau | Host verbindet LUN, formatiert NTFS/ReFS, legt VHDX darauf | VM verbindet LUN selbst über ihre vNIC im Speichernetz | Host-Datenträger **offline**, direkt an VM-Controller |
| Prüfpunkte | **ja** | nein (für die iSCSI-Disk) | **nein** |
| Host-Backup (VSS/RCT) | **ja** | nein, Backup im Gast | **nein** |
| Live-Migration | **ja** | ja (Verbindung hängt an der VM) | eingeschränkt/komplex |
| Größe | VHDX bis 64 TB | LUN-Größe | LUN-Größe |
| Gast-Cluster | über freigegebene VHDX/VHD-Satz | **ja** (klassisch) | eingeschränkt |
| Leistung | sehr nah an nativ | gut, aber Netz-Overhead in VM | nativ |
| Verwaltung | einfach, alles Hyper-V | VM braucht Zugang zum Speichernetz (Sicherheit!) | aufwendig |

- **Microsoft-Empfehlung:** In aller Regel **VHDX** verwenden; Pass-through hat kaum Leistungsvorteil, aber viele Nachteile (keine Prüfpunkte, kein Host-Backup, kein dynamisches Wachstum, Migration aufwendig).
- **Gast-iSCSI** ist sinnvoll, wenn die VM **selbst** SAN-Funktionen braucht (z. B. Hersteller-Snapshot-Integration, Gast-Cluster) – dann bekommt ARCH01 eine **zweite vNIC** am Speichernetz und MPIO im Gast.

### Lösungsweg
1. **Anforderungen abgleichen**: Sicherung, Live-Migration, Prüfpunkte → spricht klar für **VHDX**. *Begründung:* Nur VHDX erfüllt alle drei.
2. **HV01**: LUN per Initiator verbinden, als Volume (z. B. ReFS) einrichten – im Cluster als CSV. *Begründung:* Speicher gehört dem Host, VMs bekommen Dateien.
3. **VHDX 2 TB** (dynamisch oder fest) auf dem Volume anlegen und an den **SCSI-Controller** von ARCH01 hängen (im Betrieb möglich). *Begründung:* Hot-Add am SCSI-Controller ohne Ausfall.
4. In ARCH01: Datenträger initialisieren, formatieren. *Begründung:* Gast sieht eine normale Platte.
5. Entscheidung **dokumentieren** inkl. verworfener Alternativen. *Begründung:* Nachvollziehbarkeit für Dienstleister und Prüfung.

### Ergebnis prüfen
- `Get-VMHardDiskDrive -VMName ARCH01` → VHDX am SCSI-Controller.
- Prüfpunkt erstellen und löschen klappt; Host-Sicherung enthält ARCH01.
- Testweise Live-Migration zu HV02 (wenn Speicher gemeinsam).

### Vorbeugung
- Standard „VHDX first“ in die Betriebsrichtlinie.
- Speichernetz vom VM-Netz trennen; Gast-iSCSI nur mit eigener vNIC/VLAN.
- Pass-through nur in begründeten Ausnahmen und dokumentiert.

## Einfach
Stell dir vor, eine VM ist ein **Zimmer** in einem Haus. Das Zimmer braucht einen **großen Schrank** (Speicher). Es gibt drei Möglichkeiten:

1. **Schrank aus dem Hauslager (VHDX):** Der Hausmeister (Host) holt den Schrank aus dem Keller (SAN), stellt eine **Kiste** (VHDX-Datei) hinein und gibt die Kiste dem Zimmer. Vorteil: Der Hausmeister kann die Kiste fotografieren (Prüfpunkt), sichern und beim Umzug mitnehmen.
2. **Zimmer holt sich selbst einen Schrank (Gast-iSCSI):** Das Zimmer hat einen eigenen Schlauch (Netzwerkkarte) direkt zum Keller und holt sich den Schrank selbst. Der Hausmeister weiß davon nichts – er kann ihn weder fotografieren noch sichern.
3. **Schrank fest einmauern (Pass-through):** Der Hausmeister mauert den Schrank aus dem Keller direkt ins Zimmer. Schnell, aber: kein Foto, keine einfache Sicherung, und umziehen ist sehr schwer.

Meistens ist Möglichkeit 1 die beste. Die anderen nimmt man nur, wenn es einen besonderen Grund gibt.

## Merksatz
- **VHDX first** – Prüfpunkte, Backup, Migration.
- **Gast-iSCSI** – nur bei Gast-Cluster/SAN-Funktionen im Gast.
- **Pass-through** – Datenträger am Host **offline**, keine Prüfpunkte.
- Neue Platten im Betrieb an den **SCSI-Controller**.

## Prüfungsfalle
- Pass-through-Datenträger müssen am Host **offline** sein, sonst lassen sie sich nicht zuweisen.
- Für Pass-through und Gast-iSCSI-Disks gibt es **keine** Hyper-V-Prüfpunkte.
- Gast-iSCSI-Disks werden vom Host-Backup **nicht** erfasst.
- Leistung ist meist **kein** Grund mehr für Pass-through – VHDX ist nahezu gleich schnell.

## Grafik
### Drei Wege zur LUN
1. SAN01 -> HV01: LUN am Host, darauf ARCH01-Daten.vhdx
2. HV01 -> ARCH01: VHDX am SCSI-Controller – Prüfpunkt und Backup möglich
3. SAN01 -> ARCH01: Gast-iSCSI über zweite vNIC – Host sieht nichts
4. HV01 -> ARCH01: Pass-through Disk 3 offline am Host – keine Prüfpunkte
5. Admin: Entscheidung VHDX dokumentiert

## Lab
**Nachstellen:** Alle drei Varianten mit dem iSCSI-Zielserver aus Szenario 42 ausprobieren und Prüfpunkt-Verhalten vergleichen. Maschinen: **HV01**, **ISCSI01** (Ziel), VM **ARCH01**.

### GUI
1. **HV01**: iSCSI-Initiator → Ziel ISCSI01 verbinden → Datenträgerverwaltung → neue Disk **offline** lassen.
2. **HV01**: Hyper-V-Manager → ARCH01 (aus) → Einstellungen → SCSI-Controller → Festplatte → Hinzufügen → „**Physische Festplatte**“ → Disk auswählen → OK (Pass-through).
3. **HV01**: ARCH01 starten → Prüfpunkt erstellen → Meldung/Fehler: Prüfpunkte mit physischen Datenträgern nicht möglich (Fehlerbild).
4. **HV01**: ARCH01 → Einstellungen → physische Festplatte entfernen → Disk am Host **online**, formatieren → neue VHDX darauf anlegen → an SCSI-Controller von ARCH01.
5. **HV01**: Prüfpunkt erneut → funktioniert.
6. **ARCH01** (Variante Gast-iSCSI, nur zur Übung): zweite vNIC ins Speichernetz → iSCSI-Initiator in der VM → Ziel verbinden.

### PowerShell
```powershell
# Auf HV01 – Pass-through (Disk am Host offline)
Set-Disk -Number 3 -IsOffline $true
Stop-VM -Name ARCH01
Add-VMHardDiskDrive -VMName ARCH01 -ControllerType SCSI -DiskNumber 3
Start-VM -Name ARCH01
Checkpoint-VM -Name ARCH01 -SnapshotName "Test"     # schlägt fehl

# Auf HV01 – zurück zu VHDX
Stop-VM -Name ARCH01
Get-VMHardDiskDrive -VMName ARCH01 | Where-Object DiskNumber -eq 3 | Remove-VMHardDiskDrive
Set-Disk -Number 3 -IsOffline $false
Initialize-Disk -Number 3 -PartitionStyle GPT
New-Partition -DiskNumber 3 -UseMaximumSize -DriveLetter V | Format-Volume -FileSystem ReFS -Confirm:$false
New-VHD -Path "V:\ARCH01\ARCH01-Daten.vhdx" -SizeBytes 2TB -Dynamic
Add-VMHardDiskDrive -VMName ARCH01 -ControllerType SCSI -Path "V:\ARCH01\ARCH01-Daten.vhdx"
Start-VM -Name ARCH01
Checkpoint-VM -Name ARCH01 -SnapshotName "Test"     # funktioniert

# Auf ARCH01 – Variante Gast-iSCSI
Start-Service MSiSCSI; Set-Service MSiSCSI -StartupType Automatic
New-IscsiTargetPortal -TargetPortalAddress 10.0.60.10
Get-IscsiTarget | Connect-IscsiTarget -IsPersistent $true
```

## Szenario
### Kontrollfragen
ARCH01 braucht 2 TB vom SAN, tägliche Host-Sicherung, Prüfpunkte vor Updates und Live-Migration zu HV02.
- F: Welche Variante erfüllt alle Anforderungen? | A: VHDX auf einer vom Host verbundenen LUN (bzw. CSV).
- F: Welche Voraussetzung hat ein Pass-through-Datenträger am Host? | A: Er muss offline sein.
- F: Warum ist Gast-iSCSI hier ungünstig? | A: Keine Prüfpunkte und kein Host-Backup für die Disk; die VM braucht Zugang zum Speichernetz.
- F: Wann ist Gast-iSCSI sinnvoll? | A: Für Gast-Cluster oder wenn die VM SAN-Funktionen selbst nutzen muss.
- F: An welchen Controller hängst du eine neue Platte im laufenden Betrieb? | A: An den SCSI-Controller.

## Legende
### Pass-through-Datenträger
- Was: Physischer Host-Datenträger, der direkt an eine VM gebunden wird.
- Wie: Datenträger am Host offline setzen, dann Add-VMHardDiskDrive -DiskNumber.
- Wann: Nur in Ausnahmefällen (z. B. Herstellervorgabe).
- Wo: VM-Einstellungen → Controller → Festplatte → Physische Festplatte.
- Warum: Früher für Leistung/Größe – heute meist durch VHDX abgelöst.
### Gast-iSCSI
- Was: iSCSI-Initiator innerhalb der VM verbindet sich direkt mit dem SAN.
- Warum: Gast-Cluster, SAN-Funktionen im Gast; Nachteil: Host-Werkzeuge greifen nicht.

## Karteikarten
- F: Welche Speichervariante empfiehlt Microsoft für VMs in der Regel? | A: VHDX-Dateien.
- F: Was muss vor dem Zuweisen eines Pass-through-Datenträgers passieren? | A: Datenträger am Host offline setzen.
- F: Gibt es Hyper-V-Prüfpunkte bei Pass-through-Datenträgern? | A: Nein.
- F: Erfasst die Host-Sicherung Gast-iSCSI-Disks? | A: Nein, sie müssen im Gast gesichert werden.
- F: Welchen Vorteil hat Gast-iSCSI? | A: Gast-Cluster und direkte Nutzung von SAN-Funktionen in der VM.
- F: Maximale Größe einer VHDX? | A: 64 TB.
- F: Cmdlet für Pass-through? | A: Add-VMHardDiskDrive -VMName VM -ControllerType SCSI -DiskNumber 3
- F: Was braucht eine VM für Gast-iSCSI zusätzlich? | A: Netzzugang zum Speichernetz (meist eigene vNIC/VLAN) und ggf. MPIO.

## Quiz
? Welche Variante unterstützt Prüfpunkte, Host-Backup und Live-Migration am einfachsten?
* VHDX auf einer Host-LUN
- Pass-through-Datenträger
- Gast-iSCSI
- USB-Durchreichung
! VHDX ist der Standardweg.

? Was muss mit einem Datenträger am Host geschehen, bevor er als Pass-through zugewiesen wird?
* Er muss offline gesetzt werden
- Er muss mit NTFS formatiert werden
- Er muss BitLocker-verschlüsselt sein
- Er muss als CSV hinzugefügt werden
! Host und VM dürfen nicht gleichzeitig zugreifen.

? Welche Einschränkung haben Pass-through-Datenträger?
* Keine Hyper-V-Prüfpunkte
- Maximal 2 TB Größe je Datenträger
- Nur in Gen-1-VMs an IDE nutzbar
- Kein NTFS, nur ReFS im Gast möglich
! Auch Host-Backups erfassen sie nicht.

? Wofür ist Gast-iSCSI typisch?
* Für Gast-Cluster mit gemeinsamem SAN-Speicher
- Für schnellere Prüfpunkte der VM auf dem Host
- Für Host-Backups mit Windows Server-Sicherung
- Für Secure Boot mit Linux-Bootloadern
! Die VMs verbinden sich selbst mit dem SAN.

? Welcher Nachteil gilt für Gast-iSCSI?
* Die VM braucht Zugang zum Speichernetz
- Für die VM ist keine Live-Migration mehr möglich
- Die LUN ist auf 127 GB Größe begrenzt
- Die VM muss zwingend als Gen 1 angelegt sein
! Das erweitert die Angriffsfläche des Speichernetzes.

? An welchen Controller hängt man eine neue Datenplatte im laufenden Betrieb?
* SCSI-Controller
- IDE-Controller
- Diskettenlaufwerk
- COM-Port
! IDE unterstützt kein Hot-Add.

? Wie groß kann eine VHDX maximal sein?
* 64 TB
- 2 TB
- 127 GB
- 16 TB
! 2 TB ist das Limit des alten VHD-Formats.

? Was spricht heute meist NICHT mehr für Pass-through?
* Leistungsvorteil
- Fehlende Prüfpunkte
- Aufwendige Migration
- Fehlendes Host-Backup
! VHDX ist nahezu gleich schnell – die anderen Punkte sind Nachteile von Pass-through.
