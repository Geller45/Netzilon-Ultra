---
id: az800-dedup
bereich: AZ-800
block: A7
kapitel: Storage & Dateidienste
titel: Datendeduplizierung, SMB Direct und Storage QoS
stufe: Fortgeschritten
quellen: [AZ-800 Study Guide, Microsoft Learn, Speicher-/Dateidienste-Unterlagen]
verweise: [az800-storage-spaces, az800-dateisysteme, az800-datentraeger, az800-fsrm, az800-azure-file-sync]
---

## Profi

### Datendeduplizierung (*Data Deduplication*)
Rolle **Datendeduplizierung** (Feature unter *Datei-/Speicherdienste*): spart Speicherplatz, indem **doppelte Datenblöcke** nur **einmal** gespeichert werden. Arbeitet **nachträglich** (*Post-Process*), **nicht** beim Schreiben.
| Merkmal | Details |
|---|---|
| Funktionsweise | Dateien werden in **variable Blöcke (Chunks, 32–128 KB)** zerlegt; identische Chunks landen **einmal** im **Chunk Store** (`System Volume Information\Dedup`), die Datei enthält nur **Verweise** (*Reparse Points*); zusätzlich **Komprimierung** der Chunks |
| Unterstützt | **NTFS** und **ReFS** (ReFS ab Server 2019), **Datenvolumes** |
| **Nicht** unterstützt | **Systemvolume/Startvolume**, Dateien < **32 KB**, Dateien mit **erweiterten Attributen**, verschlüsselte Dateien (**EFS**), Dateien mit Reparse Points außer Dedup; **FAT/exFAT**; Volumes mit **Hyper-V-VMs im Betrieb** nur mit Nutzungstyp **Virtualisierte Sicherung/VDI** |
| Mindestalter | Standard: Dateien **≥ 3 Tage alt** (`MinimumFileAgeDays`) |
| Verarbeitung | Geplante **Optimierungs-Aufgaben** (Hintergrund), **Garbage Collection** (wöchentlich), **Integrity Scrubbing** (wöchentlich) |
| Erhaltene Rechte | **NTFS-Berechtigungen** und Zeitstempel bleiben; Zugriff **transparent** |

**Nutzungstypen** (*Usage Types*):
| Typ | Einsatz |
|---|---|
| **Standarddateiserver** (*Default*) | Allgemeine Dateifreigaben, Home-Verzeichnisse |
| **Hyper-V** (VDI) | **VDI-Server** mit **laufenden VMs** (Optimierung auch bei offenen Dateien) |
| **Sicherung** (*Backup*) | **Virtualisierte Sicherungs-Apps** (z. B. DPM), sehr große Dateien |

Typische Einsparung: Dateifreigaben **30–50 %**, Softwarebibliotheken/ISO **70–80 %**, VDI **bis 95 %**.

**Wichtig**: Ausgeschlossene Ordner/Dateitypen konfigurierbar (`-ExcludeFolder`, `-ExcludeFileType`). **Backup-Software** muss **Dedup-fähig** sein (sonst wird die **volle** Größe gesichert). Wiederherstellung einzelner Dateien setzt eine **Dedup-fähige** Wiederherstellung voraus (Dedup-**VSS-Writer** der Sicherung nutzen).

### SMB Direct (RDMA)
**SMB Direct** = SMB 3 über **RDMA** (*Remote Direct Memory Access*): Netzwerkkarte schreibt Daten **direkt in den Arbeitsspeicher** des Zielservers – **ohne CPU-Beteiligung** und ohne TCP/IP-Stack im Kernel.
| Aspekt | Details |
|---|---|
| Vorteile | Sehr **niedrige Latenz**, **hoher Durchsatz** (≥ 40/100 Gbit/s), **geringe CPU-Last** |
| Voraussetzung | **RDMA-fähige** NICs auf **beiden** Seiten: **iWARP** (TCP-basiert, routbar, einfach), **RoCE/RoCEv2** (UDP, braucht **DCB/PFC** verlustfreies Ethernet), **InfiniBand** |
| Server | Windows Server **2012 R2+** (Standard und Datacenter) |
| Aktivierung | **Automatisch**, wenn beide Seiten RDMA haben (Feature **SMB Direct** ist Standard, `Get-NetAdapterRdma`); **SMB Multichannel** bündelt mehrere RDMA-NICs |
| Einsatz | **Hyper-V über SMB** (VM-Dateien auf SMB-Freigabe), **SOFS** (*Scale-Out File Server*), **S2D**, **Storage Replica**, SQL Server über SMB |
| Nur zusammen mit | **SMB 3** – ältere Clients fallen auf **normales SMB** zurück |

Prüfen: `Get-NetAdapterRdma`, `Get-SmbClientNetworkInterface` (Spalte **RDMA Capable**), `Get-SmbMultichannelConnection` (Spalte **Client RDMA Capable**).

### Storage QoS (*Quality of Service*)
**Speicher-QoS**: Verteilung und **Begrenzung von IOPS** pro **VHD/VHDX**/VM in **Hyper-V-Clustern** (mit **CSV**) und **Scale-Out-Dateiservern**.
| Begriff | Bedeutung |
|---|---|
| **Richtlinie** (*Policy*) | Legt **Minimum-IOPS** (Reservierung/garantiert) und **Maximum-IOPS** (Limit) fest |
| Typ **Aggregated** (Standard) | Werte gelten **gemeinsam** für **alle** Datenträger, denen die Richtlinie zugewiesen ist |
| Typ **Dedicated** | Werte gelten **je Datenträger** einzeln |
| Normalisierung | 1 IOPS = **8 KB** I/O (größere Zugriffe zählen mehrfach) |
| Einsatz | **Noisy Neighbor** verhindern: eine VM verbraucht nicht **allen** Speicher-Durchsatz; Mandanten-SLA |
| Voraussetzung | **CSV-basierter** Speicher (Failovercluster) **oder** **SOFS** |
| Verwaltung | **PowerShell** (`New-StorageQosPolicy`, `Set-VMHardDiskDrive -QoSPolicyID`), **Failovercluster-Manager**, **WAC** |

## Lab
**Maschinen**: **FS01** (Windows Server 2022, Datenvolume **E:** mit vielen doppelten Dateien, z. B. mehrere ISO-Kopien), **HV01** (Hyper-V-Host, Cluster/SOFS nur für QoS-Teil, optional).

### GUI
1. **FS01**: Server-Manager → **Verwalten → Rollen und Features hinzufügen** → **Datei-/Speicherdienste → Datei- und iSCSI-Dienste → Datendeduplizierung** installieren.
2. **FS01**: Server-Manager → **Datei-/Speicherdienste → Volumes** → **E:** → Rechtsklick → **Datendeduplizierung konfigurieren…** → **Allgemeiner Dateiserver** → **Dateien älter als: 0 Tage** (nur für den Test) → **Einstellungen für Ausschlüsse** → OK.
3. **FS01**: Datentyp **Größe vor Aktivierung** notieren (Rechtsklick E: → Eigenschaften).
4. **FS01**: PowerShell (siehe unten) → **Start-DedupJob** ausführen; nach Abschluss E: → Eigenschaften: **Größe auf Datenträger** < **Größe**.
5. **FS01**: Server-Manager → Volumes → E: zeigt **Deduplizierungsrate** und **Einsparungen** in der Spalte.
6. **HV01** (QoS, optional): Failovercluster-Manager → **Speicher → QoS-Richtlinien** oder **WAC → Cluster → Speicher-QoS** → **Neue Richtlinie** → Min 100 / Max 500 IOPS → einer **VHDX** zuweisen.

### PowerShell
```powershell
# Auf FS01 – Dedup installieren und aktivieren
Install-WindowsFeature FS-Data-Deduplication -IncludeManagementTools
Enable-DedupVolume -Volume E: -UsageType Default
Set-DedupVolume -Volume E: -MinimumFileAgeDays 0 -ExcludeFolder "E:\Temp"

# Optimierung sofort starten (statt Zeitplan)
Start-DedupJob -Volume E: -Type Optimization
Get-DedupJob

# Ergebnisse anzeigen
Get-DedupStatus -Volume E: | Format-List Volume,FreeSpace,SavedSpace,OptimizedFilesCount,InPolicyFilesCount
Get-DedupVolume -Volume E: | Format-List SavingsRate,SavedSpace

# Zeitplan für Garbage Collection und Scrubbing
Get-DedupSchedule
Start-DedupJob -Volume E: -Type GarbageCollection
Start-DedupJob -Volume E: -Type Scrubbing

# Dedup-Einsparungen vorab schätzen (Tool: DDPEval.exe)
& "$env:SystemRoot\System32\DDPEval.exe" E:\

# SMB Direct / RDMA prüfen
Get-NetAdapterRdma
Get-SmbClientNetworkInterface | Where-Object RdmaCapable
Get-SmbMultichannelConnection

# Storage QoS (Cluster/SOFS)
$policy = New-StorageQosPolicy -Name "Silber" -PolicyType Dedicated -MinimumIops 100 -MaximumIops 500
Get-VM "VM01" | Get-VMHardDiskDrive | Set-VMHardDiskDrive -QoSPolicyID $policy.PolicyId
Get-StorageQosFlow | Sort-Object InitiatorIOPS -Descending | Select-Object -First 5
Get-StorageQosPolicy
```

## Einfach

**Deduplizierung** = stell dir vor, **30 Schüler** legen **dieselbe PDF** in ihrem Ordner ab. Statt **30 Kopien** speichert der Server sie **einmal** und merkt sich nur: „Schüler 2 hat auch diese PDF“ – wie ein **Zettel mit Verweis** statt der ganzen Kopie. Das spart je nach Daten **viel Platz**.
- Passiert **nachts im Hintergrund**, nicht sofort beim Speichern.
- Beim Öffnen merkst du **nichts** davon.
- Für die **Systemplatte C:** ist es **verboten**.
- **Sicherung** muss das **kennen**, sonst wird trotzdem alles einzeln gesichert.

**SMB Direct** = normalerweise trägt der **Prozessor** jedes Datenpaket über das Netzwerk (wie ein Paketbote, der jeden Karton einzeln schleppt). Mit **RDMA** stellt die **Netzwerkkarte** die Pakete **direkt** in den **Speicher** des anderen Servers – **ohne** den Prozessor zu stören. Ergebnis: **sehr schnell**, **wenig Last**. Beide Seiten brauchen dafür **spezielle Karten**.

**Storage QoS** = **Verkehrsregelung** für Festplatten-Zugriffe. Eine VM, die den Speicher **leersaugt** (**Noisy Neighbor**), darf **nicht alle anderen ausbremsen**. Du sagst pro VM: **mindestens** so viel Geschwindigkeit (**Minimum**), **höchstens** so viel (**Maximum**).

## Merksatz
- **Dedup** = **Chunks** einmal speichern, **nachträglich**, **nicht auf C:**.
- **Nutzungstypen**: **Standard** (Dateiserver), **Hyper-V** (VDI), **Sicherung**.
- **Standard-Mindestalter** einer Datei: **3 Tage**.
- **SMB Direct** = **RDMA** = **keine CPU**, iWARP **einfach**, RoCE braucht **DCB/PFC**.
- **QoS**: **Min/Max IOPS**, **Aggregated** = **gemeinsam**, **Dedicated** = **je Datenträger**, **1 IOPS = 8 KB**.
- **QoS** benötigt **CSV** oder **SOFS**.

## Prüfungsfalle
- Dedup auf dem **Systemvolume** ist **nicht möglich**.
- Dedup ist **nicht** Inline: Einsparung erscheint **erst nach dem Optimierungsjob**.
- **Laufende VMs** auf einem Dedup-Volume nur mit Nutzungstyp **Hyper-V (VDI)** unterstützt.
- Frisch angelegte Dateien werden wegen **Mindestalter 3 Tage** zunächst **nicht** dedupliziert (Test: `-MinimumFileAgeDays 0`).
- **SMB Direct** wird **automatisch** genutzt, sobald beide NICs **RDMA** können – kein Einschalten per Rolle nötig.
- **RoCE ohne DCB/PFC** → Paketverluste, schlechte Leistung; **iWARP** braucht das **nicht**.
- QoS-Richtlinie **Aggregated** verteilt Min/Max **zusammen**, **Dedicated** gilt **pro Datenträger** – Verwechslungsgefahr.
- Ein **Noisy Neighbor** löst man mit **Maximum-IOPS**, nicht mit mehr **RAM**.

## Grafik
### Chunks
Drei Dateien werden in bunte Bausteine zerlegt; gleiche Bausteine wandern **einmal** in einen Chunk-Store-Schrank, in den Dateien bleiben nur Pfeile. Balken „Belegter Speicherplatz“ schrumpft.

### RDMA
Links normale Übertragung: Paket geht durch **CPU-Männchen** (schwitzt) → Speicher. Rechts RDMA: Netzwerkkarte reicht Paket **direkt** an den Speicher, CPU-Männchen trinkt Kaffee.

### Ampel
Drei VMs vor einer Speicher-Ampel; die gierige VM bekommt ein **Max-IOPS-Schild**, die wichtige ein **Min-IOPS-Schild**; die Warteschlange fließt gleichmäßig.

## Karteikarten
- F: Wie spart Datendeduplizierung Speicher? | A: Doppelte Datenblöcke (Chunks) werden nur einmal im Chunk Store gespeichert, Dateien verweisen darauf.
- F: Wann läuft die Deduplizierung? | A: Nachträglich als Hintergrundjob (Post-Process), nicht beim Schreiben.
- F: Welche Volumes unterstützen Dedup nicht? | A: Systemvolume/Startvolume, FAT/exFAT.
- F: Nutzungstypen der Deduplizierung? | A: Standarddateiserver, Hyper-V (VDI), Sicherung.
- F: Standard-Mindestalter für Dedup-Dateien? | A: 3 Tage (`MinimumFileAgeDays`).
- F: Cmdlet zum Aktivieren von Dedup? | A: Enable-DedupVolume
- F: Cmdlet zum Anzeigen der Einsparung? | A: Get-DedupStatus / Get-DedupVolume
- F: Was ist SMB Direct? | A: SMB 3 über RDMA – Daten gehen ohne CPU direkt in den Speicher des Zielservers.
- F: Welche RDMA-Technik braucht DCB/PFC? | A: RoCE/RoCEv2 (iWARP nicht).
- F: Wofür wird SMB Direct genutzt? | A: Hyper-V über SMB, SOFS, S2D, Storage Replica.
- F: Was regelt Storage QoS? | A: Minimum- und Maximum-IOPS pro VHD/VHDX oder VM.
- F: Unterschied Aggregated und Dedicated? | A: Aggregated = Werte gemeinsam für alle Datenträger der Richtlinie; Dedicated = pro Datenträger.

## Quiz
? Auf einem Dateiserver liegen viele ähnliche Softwareimages. Speicherplatz soll gespart werden, ohne Nutzer zu beeinträchtigen. Lösung?
* Datendeduplizierung auf dem Datenvolume aktivieren
- Datendeduplizierung auf dem Systemvolume aktivieren
- Storage Replica einrichten
- BranchCache aktivieren

? Dedup wurde aktiviert, doch nach einer Stunde ist der belegte Speicher unverändert. Häufigste Ursache?
* Dateien sind jünger als das Mindestalter (Standard 3 Tage)
- Dedup arbeitet nur mit ReFS
- Dedup benötigt Datacenter-Edition
- SMB Direct ist deaktiviert

? Auf einem VDI-Server laufen VMs von einem Dedup-Volume. Welcher Nutzungstyp?
* Hyper-V (VDI)
- Standarddateiserver
- Sicherung
- Archiv

? Welche Technik reduziert die CPU-Last bei SMB-Übertragungen erheblich und erfordert spezielle NICs?
* SMB Direct (RDMA)
- SMB-Signierung
- DFS-Namespaces
- BranchCache

? Eine VM verbraucht dauerhaft alle IOPS im Cluster. Was begrenzt sie?
* Storage-QoS-Richtlinie mit Maximum-IOPS
- Mehr RAM zuweisen
- Dynamischer Arbeitsspeicher
- Speicherebenen

? RoCE-Netzwerkkarten zeigen starke Paketverluste. Was fehlt wahrscheinlich?
* DCB/PFC-Konfiguration im Netzwerk
- iWARP-Lizenz
- SMB-Multichannel-Feature
- Deduplizierungsrolle
