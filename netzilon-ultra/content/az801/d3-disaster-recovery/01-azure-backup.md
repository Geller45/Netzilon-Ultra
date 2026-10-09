---
id: az801-azure-backup
bereich: AZ-801
block: A10
kapitel: Disaster Recovery
titel: Azure Backup (MARS, MABS, Recovery Services Vault)
stufe: Profi
quellen: [AZ-801 Study Guide, Microsoft Learn]
verweise: [az801-backup-richtlinien, az801-asr, az801-hyperv-replica, az801-bitlocker]
---

## Profi

### Überblick
**Azure Backup** ist der **Cloud-Sicherungsdienst** von Microsoft. **Sicherungsdaten** landen in einem **Tresor** (*Vault*) in Azure. Für **Windows Server on-premises** gibt es **zwei Wege**: den **MARS-Agent** und den **MABS**.

### Der Tresor (Recovery Services Vault)
| Eigenschaft | Erklärung |
|---|---|
| **Recovery Services Vault** | **Azure-Ressource**, die **Sicherungsdaten** und **Richtlinien** **verwaltet** (**auch für Azure Site Recovery**) |
| **Redundanz** | **LRS** (*lokal redundant*), **ZRS** (*zonenredundant*), **GRS** (*georedundant*, **Standard**) |
| **Redundanz ändern** | **Nur solange noch nichts gesichert wird** |
| **Cross Region Restore** | **Wiederherstellung** **in der gekoppelten Region**, **nur mit GRS** |
| **Soft Delete** | **Gelöschte Sicherungen** **bleiben** **14 Tage** **erhalten** (**Schutz gegen Ransomware/Fehlbedienung**) |
| **Unveränderlichkeit** (*Immutability*) | **Wiederherstellungspunkte** **dürfen** **nicht vorzeitig gelöscht** **werden** |
| **Multi-User Authorization** | **Resource Guard**: **kritische Aktionen** **brauchen** **zweite Person/Freigabe** |

### MARS-Agent
**MARS** (*Microsoft Azure Recovery Services Agent*) **sichert** **direkt aus Windows** **in den Tresor**.
- **Sichert**: **Dateien**, **Ordner**, **Systemstatus** (*System State*).
- **Kein Server nötig** – **läuft** **auf dem zu sichernden Rechner** (**Windows Server** **oder** **Windows-Client**).
- **Kann nicht**: **ganze VMs**, **SQL**, **Exchange**, **SharePoint**.
- **Verschlüsselung**: **Passphrase** **wird** **bei der Einrichtung** **gesetzt**. **Verloren = Daten nicht wiederherstellbar** (**Microsoft kennt sie nicht**).
- **Tresor-Anmeldedaten** (*Vault Credentials*): **Datei** **aus dem Portal** **zum Registrieren**, **nur 10 Tage gültig**.
- **Häufigkeit**: **bis zu 3-mal täglich** (**Dateien/Ordner**), **Systemstatus** **täglich/wöchentlich**.
- **Netzwerk**: **ausgehend HTTPS (443)**, **Drosselung** (*Throttling*) **konfigurierbar**.

### MABS
**MABS** (*Microsoft Azure Backup Server*) **ist** **ein** **eigener Server** **auf Basis von System Center DPM** (**ohne Lizenzkosten**, **nur Azure-Speicher** **wird bezahlt**).
- **Sichert**: **Hyper-V-VMs**, **VMware-VMs**, **SQL Server**, **Exchange**, **SharePoint**, **Dateiserver**, **Systemstatus**, **Bare-Metal-Recovery**.
- **Zwei Stufen**: **lokal** (**Disk**, **schnelle Wiederherstellung**) **plus** **Azure** (**Langzeit**).
- **Agent** (*Protection Agent*) **auf** **jedem geschützten Server**.
- **Nicht** **im Tresor-Portal** **wählbar** **als Rolle**, **sondern** **als Software** **installiert** (**Installer + Tresor-Anmeldedaten**).

### MARS vs. MABS
| Merkmal | **MARS** | **MABS** |
|---|---|---|
| **Zusätzlicher Server** | **Nein** | **Ja** |
| **Dateien/Ordner** | **Ja** | **Ja** |
| **Systemstatus** | **Ja** | **Ja** |
| **VMs (Hyper-V/VMware)** | **Nein** | **Ja** |
| **SQL/Exchange/SharePoint** | **Nein** | **Ja** |
| **Lokale Kopie** | **Nein (nur Cloud)** | **Ja (Disk)** |
| **Einsatz** | **Kleine Umgebung** | **Größere Umgebung** |

### Weitere Quellen im gleichen Tresor
**Azure-VMs** (**Erweiterung**, **ohne Agent-Installation**), **Azure Files**, **SQL Server in Azure-VM**, **SAP HANA in Azure-VM**, **Azure Blobs**.

### PowerShell
```powershell
# Auf einer Admin-Workstation – Tresor anlegen (Az-Modul)
New-AzResourceGroup -Name rg-backup -Location westeurope
New-AzRecoveryServicesVault -Name vault01 -ResourceGroupName rg-backup -Location westeurope

# Redundanz VOR der ersten Sicherung setzen
$vault = Get-AzRecoveryServicesVault -Name vault01
Set-AzRecoveryServicesBackupProperty -Vault $vault -BackupStorageRedundancy GeoRedundant

# Auf SRV01 – MARS registrieren (Modul MSOnlineBackup)
$cred = "C:\Temp\vault01.VaultCredentials"
Start-OBRegistration -VaultCredentials $cred -Confirm:$false
$pass = ConvertTo-SecureString "Geheim!2026Backup#" -AsPlainText -Force
Set-OBMachineSetting -EncryptionPassphrase $pass

# Auf SRV01 – Sicherungsrichtlinie
$pol  = New-OBPolicy
$spec = New-OBFileSpec -FileSpec "D:\Daten"
Add-OBFileSpec -Policy $pol -FileSpec $spec
$sch  = New-OBSchedule -DaysOfWeek Monday,Wednesday,Friday -TimesOfDay 22:00
Set-OBSchedule -Policy $pol -Schedule $sch
$ret  = New-OBRetentionPolicy -RetentionDays 30
Set-OBRetentionPolicy -Policy $pol -RetentionPolicy $ret
Set-OBPolicy -Policy $pol -Confirm:$false

# Sicherung sofort starten
Get-OBPolicy | Start-OBBackup
```

## Lab
**Maschinen**: **SRV01** (**Windows Server 2022**, **Ordner D:\Daten**), **Azure-Abo**.

### GUI
1. **Azure-Portal (Admin-PC)**: **Recovery Services Vaults → Erstellen** → **Name vault01**, **Region wählen** → **Erstellen**.
2. **Azure-Portal**: **vault01 → Eigenschaften → Sicherungskonfiguration → GRS/LRS wählen** (**vor** der ersten Sicherung).
3. **Azure-Portal**: **vault01 → Sicherung → „Wo läuft Ihre Arbeitsauslastung?“ → Lokal** → **„Dateien und Ordner“** → **Infrastruktur vorbereiten**.
4. **Azure-Portal**: **MARS-Agent herunterladen** **und** **Tresor-Anmeldedaten herunterladen**.
5. **SRV01**: **MARSAgentInstaller.exe** **ausführen** → **Installation abschließen** → **Registrierung fortsetzen**.
6. **SRV01**: **Tresor-Anmeldedaten-Datei wählen** → **Passphrase generieren/eingeben** → **an sicherem Ort speichern** → **Registrieren**.
7. **SRV01**: **Microsoft Azure Backup** (**Konsole**) → **Sicherung planen** → **Elemente hinzufügen: D:\Daten** → **Zeitplan** → **Aufbewahrung** → **Fertig stellen**.
8. **SRV01**: **Jetzt sichern**.

## Einfach

Stell dir einen **riesigen, sicheren Tresorraum in einem anderen Land** vor. **Azure Backup** ist **der Kurierdienst**, **der Kopien deiner wichtigen Sachen** **dorthin bringt**.

**MARS** ist **wie ein Rucksack**: **Du steckst** **deine Ordner** **selbst** **ein** **und läufst** **allein zum Tresor**. **Kleine Sachen gehen gut**, **aber** **keine ganzen Schränke** (**keine VMs**).

**MABS** ist **wie ein Lieferwagen mit Lager**: **Er sammelt** **von allen Häusern** **alles ein** (**auch Möbel = VMs, Datenbanken**), **lagert es erst bei sich** (**schnell zu holen**) **und fährt** **dann zum Tresor**.

**Passphrase** = **der Schlüssel** **zu deiner Kiste**. **Verlierst du ihn**, **kann sie nicht mal Microsoft öffnen**.

## Merksatz
- **MARS = Mini** (**Dateien + Systemstatus**, **direkt in die Cloud**).
- **MABS = Mächtig** (**VMs, SQL, Exchange**, **eigener Server**, **DPM-Technik**).
- **Redundanz** **vor** **der ersten Sicherung** **festlegen**.
- **Cross Region Restore** **braucht** **GRS**.
- **Passphrase weg = Daten weg**.
- **Vault-Credentials: 10 Tage**.
- **Soft Delete = 14 Tage Gnadenfrist**.

## Prüfungsfalle
- **MARS** **kann keine VMs** **und keine Anwendungen** **sichern** – **dafür MABS**.
- **Passphrase** **geht** **nicht** **wiederherzustellen**.
- **Vault-Credentials** **laufen nach 10 Tagen ab** – **neu herunterladen**.
- **Redundanz** **lässt sich** **nur ändern**, **solange** **nichts geschützt** **ist**.
- **Cross Region Restore** **nur bei GRS**.
- **MABS** **nutzt** **lokale Disk** **zusätzlich** – **MARS nicht**.
- **Azure-VMs** **braucht** **man** **weder MARS noch MABS** – **die Erweiterung reicht**.
- **Recovery Services Vault** **≠** **Backup Vault** (**neuer Typ** **für Blobs/Disks/PostgreSQL**).

## Grafik
### Tresorraum
Server, Ordner und VMs schicken Pakete durch einen Tunnel in einen Tresor in der Wolke; Schloss mit Passphrase.

### Rucksack gegen Lieferwagen
MARS: Mann mit Rucksack läuft allein zur Cloud. MABS: Lieferwagen sammelt ein, Zwischenlager, dann Fahrt zur Cloud.

### Redundanz
Ein Tresor wird einmal, dreimal in einem Rechenzentrum oder in zwei Ländern kopiert (LRS/ZRS/GRS).

## Befehle
- `Start-OBRegistration` – MARS beim Tresor registrieren
- `Set-OBMachineSetting` – Passphrase, Proxy, Drosselung
- `New-OBPolicy` / `Set-OBPolicy` – Sicherungsrichtlinie erstellen/anwenden
- `Start-OBBackup` – Sicherung sofort starten
- `New-AzRecoveryServicesVault` – Tresor anlegen
- `Set-AzRecoveryServicesBackupProperty` – Redundanz setzen

## Karteikarten
- F: Was ist ein Recovery Services Vault? | A: Azure-Ressource, die Sicherungsdaten und Richtlinien verwaltet.
- F: Was sichert MARS? | A: Dateien, Ordner und Systemstatus.
- F: Was kann MABS zusätzlich? | A: VMs, SQL, Exchange, SharePoint, Bare-Metal.
- F: Worauf basiert MABS? | A: Auf System Center DPM.
- F: Wie lange gelten Tresor-Anmeldedaten? | A: 10 Tage.
- F: Was passiert bei verlorener Passphrase? | A: Daten sind nicht wiederherstellbar.
- F: Wann muss die Redundanz gesetzt werden? | A: Vor der ersten Sicherung.
- F: Was braucht Cross Region Restore? | A: GRS.
- F: Wie lange hält Soft Delete standardmäßig? | A: 14 Tage.
- F: Welcher Port für MARS ausgehend? | A: 443 (HTTPS).
- F: Brauchen Azure-VMs einen MARS-Agent? | A: Nein, die Sicherungserweiterung genügt.
- F: Was ist Resource Guard? | A: Multi-User Authorization für kritische Tresor-Aktionen.

## Quiz
? Ein Dateiserver on-premises soll ohne zusätzlichen Server in Azure gesichert werden. Was nutzt man?
* MARS-Agent
- MABS
- Azure Site Recovery
- Hyper-V Replica

? Hyper-V-VMs und SQL sollen mit lokaler Kopie und Cloud-Langzeit gesichert werden. Lösung?
* Microsoft Azure Backup Server
- MARS-Agent
- DFS-R
- Storage Replica

? Der Admin hat die MARS-Passphrase verloren. Folge?
* Daten sind nicht wiederherstellbar
- Microsoft setzt sie zurück
- Tresor generiert eine neue
- Die Daten bleiben lesbar

? Welche Redundanz erlaubt Cross Region Restore?
* GRS
- LRS
- ZRS
- Keine

? Wie lange sind Vault-Anmeldedaten gültig?
* 10 Tage
- 24 Stunden
- 90 Tage
- Unbegrenzt

? Wann ist die Änderung der Speicherredundanz noch möglich?
* Solange noch keine Elemente geschützt sind
- Jederzeit
- Nur per Support
- Nie

? In welcher Azure-Ressource werden Azure-Backup-Sicherungen gespeichert?
* Recovery Services-Tresor (bzw. Sicherungstresor)
- Speicherkonto ohne Tresor
- Key Vault
- Log Analytics Workspace
! Der Tresor verwaltet Richtlinien, Wiederherstellungspunkte und Redundanz.

? Was schützt Sicherungen vor dem sofortigen Löschen durch einen Angreifer?
* Vorläufiges Löschen (Soft Delete), das gelöschte Sicherungsdaten noch 14 Tage aufbewahrt
- Ein längeres Kennwort für den Tresor
- Die Redundanz LRS
- Das Deaktivieren von MFA
! Zusätzlich Unveränderlichkeit (Immutable Vault) und Multi-User Authorization.
