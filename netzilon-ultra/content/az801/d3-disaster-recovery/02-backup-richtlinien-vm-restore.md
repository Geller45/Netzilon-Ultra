---
id: az801-backup-richtlinien
bereich: AZ-801
block: A10
kapitel: Disaster Recovery
titel: Backup-Richtlinien und VM-Wiederherstellung
stufe: Profi
quellen: [AZ-801 Study Guide, Microsoft Learn]
verweise: [az801-azure-backup, az801-asr, az800-azure-vms, az801-azure-disk-encryption]
---

## Profi

### Backup-Richtlinie (*Backup Policy*)
Eine **Richtlinie** **legt fest**: **wann** **gesichert** **wird** (**Zeitplan**) **und wie lange** **Wiederherstellungspunkte** **bleiben** (**Aufbewahrung**). **Eine Richtlinie** **kann** **viele Elemente** **schützen**.

| Baustein | Erklärung |
|---|---|
| **Zeitplan** | **täglich/wöchentlich** (**Standard-Richtlinie**), **stündlich** (**Erweiterte Richtlinie**) |
| **Aufbewahrung** | **täglich, wöchentlich, monatlich, jährlich** (**Langzeit bis 99 Jahre**) |
| **Sofortige Wiederherstellung** (*Instant Restore*) | **Momentaufnahme** **bleibt** **1–5 Tage** **im Datenträger-Snapshot** (**Standard 2 Tage**), **schnell** **ohne Tresor-Kopie** |
| **Tresor-Ebene** | **Snapshot-Ebene** → **Vault-Standard** → **Archiv** (**günstig**, **für Langzeit**, **Wiederherstellung dauert Stunden**) |
| **Zeitzone/Zeit** | **Sicherungsfenster** **wählen** |

### Standard- vs. erweiterte Richtlinie (Azure-VMs)
| Merkmal | **Standard** | **Erweitert** (*Enhanced*) |
|---|---|---|
| **Häufigkeit** | **1× täglich** (**oder wöchentlich**) | **mehrmals täglich** (**bis stündlich**) |
| **Trusted Launch VMs** | **Nein** | **Ja** |
| **Ultra Disk / Premium SSD v2** | **Nein** | **Ja** |
| **Snapshot-Aufbewahrung** | **1–5 Tage** | **bis 30 Tage** |

### Konsistenz der Wiederherstellungspunkte
| Typ | Bedeutung |
|---|---|
| **Anwendungskonsistent** (*application-consistent*) | **Windows**: **VSS**, **Anwendungen** **werden** **sauber** **angehalten** – **beste Wahl** |
| **Dateisystemkonsistent** (*file-system-consistent*) | **Linux** (**ohne Skripte**), **Dateisystem** **konsistent**, **Anwendungen nicht garantiert** |
| **Absturzkonsistent** (*crash-consistent*) | **wie ein Stromausfall**, **wenn VM aus** **oder** **VSS scheitert** |

### Wiederherstellungsoptionen für Azure-VMs
| Option | Erklärung |
|---|---|
| **Neue VM erstellen** | **Neue VM** **aus dem Punkt** (**Name/Netz/Speicher wählbar**) |
| **Datenträger wiederherstellen** | **Nur Disks** **im Speicherkonto** + **Vorlage** (**flexibel**) |
| **Vorhandene VM ersetzen** (*Replace existing*) | **Datenträger** **der laufenden VM** **werden getauscht** (**nur wenn VM existiert**) |
| **Dateiwiederherstellung** (*File Recovery*) | **Skript** **mountet** **Punkt** **als iSCSI-Laufwerk** **auf** **dem Admin-Rechner** → **einzelne Dateien kopieren** |
| **Cross Region Restore** | **In gekoppelter Region** (**GRS**) |
| **Cross Subscription Restore** | **In anderes Abonnement** |

### Sicherungsrechte und Verschlüsselung
- **VMs mit Azure Disk Encryption**: **Key Vault** **muss** **für den Backup-Dienst** **zugänglich** **sein**.
- **Rolle „Backup-Mitwirkender“** (*Backup Contributor*) **für Sicherungen**, **„Backup-Operator“** **für Betrieb**, **„Backup-Leser“** **nur lesen**.
- **Datenträger** **ausschließen**: **Einzelne Disks** **aus der Sicherung** **nehmen** **(Kosten)**.

### Überwachung
**Backup-Center** (*Backup Center*) **zeigt** **alle Tresore/Aufträge/Warnungen** **an einem Ort**. **Warnungen** **per Azure Monitor** **→** **E-Mail/Aktionsgruppe**.

### PowerShell
```powershell
# Auf Admin-PC – Richtlinie anlegen und VM schützen
$vault = Get-AzRecoveryServicesVault -Name vault01 -ResourceGroupName rg-backup
Set-AzRecoveryServicesVaultContext -Vault $vault

$sch = Get-AzRecoveryServicesBackupSchedulePolicyObject -WorkloadType AzureVM
$ret = Get-AzRecoveryServicesBackupRetentionPolicyObject -WorkloadType AzureVM
$ret.DailySchedule.DurationCountInDays = 30
New-AzRecoveryServicesBackupProtectionPolicy -Name pol-vm-30 -WorkloadType AzureVM -RetentionPolicy $ret -SchedulePolicy $sch

$pol = Get-AzRecoveryServicesBackupProtectionPolicy -Name pol-vm-30
Enable-AzRecoveryServicesBackupProtection -Policy $pol -Name VM01 -ResourceGroupName rg-prod

# Sofortsicherung
$item = Get-AzRecoveryServicesBackupItem -BackupManagementType AzureVM -WorkloadType AzureVM -Name VM01
Backup-AzRecoveryServicesBackupItem -Item $item

# Wiederherstellung: Datenträger
$rp = Get-AzRecoveryServicesBackupRecoveryPoint -Item $item | Select-Object -First 1
Restore-AzRecoveryServicesBackupItem -RecoveryPoint $rp -StorageAccountName stbackup01 -StorageAccountResourceGroupName rg-backup -TargetResourceGroupName rg-restore
```

## Lab
**Maschinen**: **Azure-Abo**, **VM01** **in rg-prod**, **Tresor vault01**.

### GUI
1. **Azure-Portal**: **vault01 → Sicherungsrichtlinien → Hinzufügen → Azure Virtual Machine**.
2. **Azure-Portal**: **Richtlinientyp Standard**, **täglich 22:00**, **Aufbewahrung 30 Tage**, **Sofortwiederherstellung 2 Tage** → **Erstellen**.
3. **Azure-Portal**: **vault01 → Sicherung → Azure Virtual Machine → Richtlinie wählen → VM01 auswählen → Sicherung aktivieren**.
4. **Azure-Portal**: **VM01 → Sicherung → Jetzt sichern**.
5. **Azure-Portal**: **vault01 → Sicherungselemente → Azure Virtual Machine → VM01 → VM wiederherstellen**.
6. **Azure-Portal**: **Wiederherstellungspunkt wählen** → **Wiederherstellungskonfiguration: „Neue erstellen“ oder „Vorhandene ersetzen“** → **Wiederherstellen**.
7. **Azure-Portal**: **VM01 → Sicherung → Dateiwiederherstellung → Skript herunterladen** → **auf Admin-PC ausführen** → **Dateien kopieren** → **Datenträger aushängen**.

## Einfach

Eine **Richtlinie** ist **wie ein Dienstplan für den Fotografen**: **„Mach jeden Abend um 22 Uhr ein Foto** **der Wohnung** **und heb** **die Fotos 30 Tage lang auf.“** **Manche Fotos** (**das vom Monatsende**) **hebt er** **viel länger** **auf.**

**Wiederherstellen** **heißt**: **Etwas ist kaputt**, **du holst ein altes Foto**. **Du kannst**:
- **die ganze Wohnung neu bauen** (**neue VM**),
- **nur die Möbel liefern lassen** (**Disks**),
- **die kaputten Möbel tauschen** (**ersetzen**),
- **oder nur** **eine Tasse** **aus dem Foto holen** (**Dateiwiederherstellung**).

## Merksatz
- **Richtlinie = Wann + Wie lange**.
- **Instant Restore = Snapshot**, **1–5 Tage**, **Standard 2**.
- **Anwendungskonsistent = VSS = Windows**.
- **Erweitert = stündlich + Trusted Launch**.
- **Dateiwiederherstellung = iSCSI-Skript**.
- **Archiv-Ebene = billig**, **aber langsam**.

## Prüfungsfalle
- **Trusted-Launch-VMs** **brauchen** **die erweiterte Richtlinie**.
- **Standard-Richtlinie** **kann nicht** **stündlich**.
- **„Vorhandene VM ersetzen“** **geht nur**, **wenn die VM noch existiert**.
- **Dateiwiederherstellung** **ist keine VM-Wiederherstellung** (**einzelne Dateien**).
- **ADE-VMs**: **Key-Vault-Zugriff** **für Backup** **nicht vergessen**.
- **Sofortwiederherstellung** **liegt** **im Snapshot**, **nicht im Tresor**.
- **Crash-konsistent** **≠** **anwendungskonsistent**.
- **Archiv-Ebene**: **Mindestaufbewahrung** **(180 Tage)**, **lange Wiederherstellungszeit**.

## Grafik
### Dienstplan
Kalender mit Kamerasymbol jeden Abend; alte Fotos wandern nach 30 Tagen in den Papierkorb, Monatsfotos bleiben.

### Drei Ebenen
Snapshot (Griffnähe) → Tresor → Archiv (Keller); Pfeile zeigen Wanderung mit Zeit.

### Vier Wege zurück
Kaputtes Haus: neu bauen, Möbel liefern, tauschen, einzelne Tasse holen.

## Befehle
- `New-AzRecoveryServicesBackupProtectionPolicy` – Richtlinie erstellen
- `Enable-AzRecoveryServicesBackupProtection` – VM schützen
- `Backup-AzRecoveryServicesBackupItem` – Sofortsicherung
- `Get-AzRecoveryServicesBackupRecoveryPoint` – Punkte auflisten
- `Restore-AzRecoveryServicesBackupItem` – wiederherstellen

## Karteikarten
- F: Was legt eine Backup-Richtlinie fest? | A: Zeitplan und Aufbewahrung.
- F: Wie lange hält Instant Restore standardmäßig? | A: 2 Tage (einstellbar 1–5).
- F: Welche Richtlinie braucht eine Trusted-Launch-VM? | A: Die erweiterte.
- F: Was bedeutet anwendungskonsistent? | A: VSS hält Anwendungen sauber an, Windows.
- F: Wie holt man einzelne Dateien aus einem VM-Punkt? | A: Dateiwiederherstellung mit iSCSI-Skript.
- F: Was ist die Archiv-Ebene? | A: Günstiger Langzeitspeicher mit langer Wiederherstellungszeit.
- F: Was zeigt das Backup-Center? | A: Alle Tresore, Aufträge und Warnungen zentral.
- F: Welche Wiederherstellung baut nur Datenträger? | A: Datenträger wiederherstellen.
- F: Wofür Cross Region Restore? | A: Wiederherstellung in der gekoppelten Region.
- F: Was gilt bei ADE-VMs? | A: Backup-Dienst braucht Key-Vault-Zugriff.
- F: Wie häufig sichert die erweiterte Richtlinie? | A: Mehrmals täglich bis stündlich.

## Quiz
? Eine Trusted-Launch-VM soll stündlich gesichert werden. Was ist nötig?
* Erweiterte Backup-Richtlinie
- Standard-Richtlinie
- MARS-Agent
- Site Recovery

? Ein Benutzer braucht eine einzelne gelöschte Datei aus einer VM-Sicherung. Schnellster Weg?
* Dateiwiederherstellung
- Neue VM erstellen
- Vorhandene VM ersetzen
- Cross Region Restore

? Wie lange bleibt der Snapshot bei Instant Restore standardmäßig?
* 2 Tage
- 30 Tage
- 1 Stunde
- 99 Jahre

? Welche Konsistenz liefert VSS bei Windows-VMs?
* Anwendungskonsistent
- Absturzkonsistent
- Keine
- Nur dateisystemkonsistent

? Wo sieht man Sicherungsaufträge mehrerer Tresore zentral?
* Backup-Center
- Log Analytics Arbeitsbereich allein
- Windows Admin Center
- Server-Manager

? Welche Ebene ist für Sicherungen mit jahrelanger Aufbewahrung am günstigsten?
* Archiv-Ebene
- Snapshot-Ebene
- Lokale Disk
- Standard-Snapshot

? Welche Optionen bietet die Wiederherstellung einer Azure-VM aus Azure Backup?
* Neue VM erstellen, Datenträger wiederherstellen oder vorhandene Datenträger ersetzen
- Nur einzelne Registry-Schlüssel
- Nur Export als ISO
- Keine – Azure Backup sichert nur Dateien
! Einzelne Dateien zusätzlich über die Dateiwiederherstellung (iSCSI-Bereitstellung).

? Wie oft können Azure-VMs mit der Standardrichtlinie gesichert werden?
* Einmal täglich (erweiterte Richtlinie: mehrmals täglich, z. B. alle 4 Stunden)
- Jede Minute
- Nur wöchentlich
- Nur manuell
! Die erweiterte Richtlinie ist z. B. für Trusted-Launch-VMs erforderlich.
