---
id: az801-azure-disk-encryption
bereich: AZ-801
block: A9
kapitel: Sicherheit
titel: Azure Disk Encryption und Verschlüsselungsoptionen für Azure-VMs
stufe: Fortgeschritten
quellen: [AZ-801 Study Guide, Microsoft Learn]
verweise: [az801-bitlocker, az800-azure-vms, az800-azure-arc, az801-defender-identity]
---

## Profi

### Wichtiger Hinweis (Legacy-Status)
**Azure Disk Encryption** (**ADE**) ist **zur Abschaltung am 15.09.2028 angekündigt**. Bis dahin läuft es **normal weiter**. **Danach** **starten** ADE-VMs **weiter**, aber **verschlüsselte Datenträger** **lassen sich nach einem Neustart nicht mehr entsperren**. Für **neue VMs** empfiehlt Microsoft **Encryption at Host**. Es gibt **keine direkte Umstellung**: **Migration** über **neue Datenträger/VMs**. **In der AZ-801-Prüfung** kommt **ADE** **weiterhin** vor – **lernen**, **aber** als **Legacy** einordnen.

### Verschlüsselungsoptionen für Azure-VM-Datenträger
| Option | Wo wird verschlüsselt? | Schlüssel | Bemerkung |
|---|---|---|---|
| **Serverseitige Verschlüsselung** (*SSE*) mit **plattformverwalteten Schlüsseln** (*PMK*) | **Speicherdienst** (**Azure Storage**) | **Microsoft** | **Standard**, **immer aktiv**, **AES-256**, **kostenlos** |
| **SSE mit kundenseitig verwalteten Schlüsseln** (*CMK*) | **Speicherdienst** | **Key Vault**/**Managed HSM** über **Disk Encryption Set** | **Eigene Schlüsselkontrolle**, **Rotation** |
| **Encryption at Host** | **VM-Host** (**vor** dem **Speichern**) | **PMK** oder **CMK** | **Temp-Datenträger**, **Caches**, **Datenfluss** **verschlüsselt**, **keine CPU-Last in der VM**, **Empfehlung** |
| **Azure Disk Encryption** (**ADE**) | **Im Gastbetriebssystem** (**BitLocker**/**dm-crypt**) | **Key Vault** | **Legacy**, **CPU-Last**, **Erweiterung** in der VM |
| **Vertrauliche Datenträgerverschlüsselung** (*Confidential disk encryption*) | **Vertrauliche VMs** (**CVMs**) | **PMK**/**CMK** | **Hardwarebasiert**, **OS-Datenträger** |

**Merke**: **SSE ist immer an**. **ADE** und **Encryption at Host** sind **zusätzliche** Ebenen.

### ADE – Funktionsweise
| Baustein | Beschreibung |
|---|---|
| **Windows** | **BitLocker** im **Gast** |
| **Linux** | **dm-crypt** |
| **VM-Erweiterung** | **AzureDiskEncryption** (**Windows**), **AzureDiskEncryptionForLinux** |
| **Key Vault** | **Speichert** **BitLocker-Verschlüsselungsschlüssel** (**Secrets**) |
| **KEK** (*Key Encryption Key*) | **Optional**, **RSA-Schlüssel** im **Key Vault**, **verpackt** (*wrap*) den **BitLocker-Schlüssel** |
| **Umfang** | **OS-Datenträger**, **Datenträger** (**All**), **nur Daten** |

### Voraussetzungen
| Punkt | Details |
|---|---|
| **Key Vault** | **Gleiche Region** **und** **gleiches Abonnement** wie die **VM** |
| **Key-Vault-Zugriff** | **Für Datenträgerverschlüsselung aktiviert** (`EnabledForDiskEncryption`) |
| **Schutz** | **Soft Delete** und **Purge Protection** **empfohlen** |
| **Firewall des Key Vault** | **„Vertrauenswürdigen Microsoft-Diensten den Zugriff erlauben“** |
| **VM** | **Mindestens 2 GB RAM**, **nicht** **Basic-SKU/A-Serie**, **Windows Server 2012 R2+** (**Client**: **Windows 10+**), **Managed Disks** |
| **Internet/Endpunkte** | **VM** erreicht **Key Vault**, **Azure Active Directory/Entra**, **Speicher** |
| **Netzwerk** | **Ausgehend HTTPS 443** zum **Key Vault** |

### Einrichtung (PowerShell)
```powershell
# Ressourcen
$rg = "rg-prod"; $loc = "westeurope"; $vmName = "vm-srv01"; $kvName = "kv-ade-example"

# Key Vault anlegen (nur Beispiel, mit Purge Protection)
New-AzKeyVault -Name $kvName -ResourceGroupName $rg -Location $loc `
  -EnabledForDiskEncryption -EnablePurgeProtection
$kv = Get-AzKeyVault -VaultName $kvName -ResourceGroupName $rg

# Verschlüsselung aktivieren (ohne KEK)
Set-AzVMDiskEncryptionExtension -ResourceGroupName $rg -VMName $vmName `
  -DiskEncryptionKeyVaultUrl $kv.VaultUri -DiskEncryptionKeyVaultId $kv.ResourceId `
  -VolumeType All

# Mit KEK
$kek = Add-AzKeyVaultKey -VaultName $kvName -Name "kek-ade" -Destination Software
Set-AzVMDiskEncryptionExtension -ResourceGroupName $rg -VMName $vmName `
  -DiskEncryptionKeyVaultUrl $kv.VaultUri -DiskEncryptionKeyVaultId $kv.ResourceId `
  -KeyEncryptionKeyUrl $kek.Id -KeyEncryptionKeyVaultId $kv.ResourceId -VolumeType All

# Status
Get-AzVmDiskEncryptionStatus -ResourceGroupName $rg -VMName $vmName

# Entschlüsseln
Disable-AzVMDiskEncryption -ResourceGroupName $rg -VMName $vmName -VolumeType All
```

**Azure CLI** (Alternative):
```bash
az vm encryption enable -g rg-prod -n vm-srv01 --disk-encryption-keyvault kv-ade-example --volume-type ALL
az vm encryption show -g rg-prod -n vm-srv01
```

### Wichtige Prüfungspunkte zu ADE
- **BitLocker-Schlüssel** **liegen** **als Secret** im **Key Vault**.
- **Key Vault** **löschen** = **VM** **nicht mehr startbar** (**Entsperrung** nicht möglich) → **Soft Delete/Purge Protection**.
- **Backup**: **Azure Backup** **sichert** **ADE-VMs** **inklusive Schlüssel** (**Key Vault** **muss** beim **Restore** **erreichbar** sein).
- **Neuer Schlüssel** (**Rotation**): **ADE** **erneut** ausführen (**neue Erweiterung-Ausführung**).
- **Wiederherstellungsschlüssel**: **`BitLocker`-Secret** im **Key Vault** (**Recovery** **über** **Portal/PowerShell**).
- **ADE** und **CMK-SSE (Disk Encryption Set)** **schließen sich** bei **derselben Disk** **nicht** aus, **ADE + Encryption at Host** ist **nicht gleichzeitig** möglich (**Migration** **nötig**).

### Encryption at Host aktivieren
```powershell
# Feature im Abonnement registrieren (einmalig)
Register-AzProviderFeature -FeatureName "EncryptionAtHost" -ProviderNamespace "Microsoft.Compute"

# VM (deallokiert) mit Encryption at Host
$vm = Get-AzVM -ResourceGroupName $rg -Name $vmName
Stop-AzVM -ResourceGroupName $rg -Name $vmName -Force
Update-AzVM -VM $vm -ResourceGroupName $rg -EncryptionAtHost $true
Start-AzVM -ResourceGroupName $rg -Name $vmName
```

### Hybrid-Bezug
| Umgebung | Verschlüsselung |
|---|---|
| **Azure-VM** | **SSE** (immer), **Encryption at Host**, **ADE** (Legacy), **CMK** |
| **Lokaler Server/Hyper-V** | **BitLocker** (Seite 14), **vTPM/Shielded VM** |
| **Azure Arc-Server** | **Verschlüsselung** **bleibt** **lokal** (**BitLocker**), **Azure Policy** **prüft** **Konformität** (**Gastkonfiguration**) |
| **Azure Stack HCI** | **BitLocker** für **Volumes** |

## Lab
**Voraussetzung**: **Azure-Abonnement**, **VM** `vm-srv01` (**Windows Server 2022**, **Standard_D2s_v5**), **Resource Group** `rg-prod`.

### GUI
1. **Azure-Portal** → **Key Vaults → Erstellen** → **Region** = **VM-Region** → **Zugriffskonfiguration** → **Azure Disk Encryption für Volumeverschlüsselung** **aktivieren** → **Soft Delete/Purge Protection** **an** → **Erstellen**.
2. **Azure-Portal** → **VM `vm-srv01` → Datenträger → Zu verschlüsselnde Datenträger** → **OS- und Datenträger** wählen.
3. **Azure-Portal** → **Key Vault auswählen** → **Schlüssel (optional, KEK)** → **Speichern** → **Erweiterung** wird **installiert**.
4. **Azure-Portal** → **VM → Erweiterungen + Anwendungen** → **AzureDiskEncryption** **Status prüfen**.
5. **Azure-Portal** → **VM → Datenträger** → **Verschlüsselung: SSE mit PMK + ADE**.
6. **VM** (RDP) → **Systemsteuerung → BitLocker** → **C: BitLocker aktiviert**.
7. **Azure-Portal** → **Key Vault → Geheimnisse** → **BitLocker-Secret** ansehen (**nicht kopieren/teilen**).
8. **Azure-Portal** → **VM → Datenträger → Verschlüsselung** → **Encryption at Host** prüfen (**Alternative**).

### PowerShell
```powershell
Connect-AzAccount
Get-AzVmDiskEncryptionStatus -ResourceGroupName rg-prod -VMName vm-srv01
Get-AzVMExtension -ResourceGroupName rg-prod -VMName vm-srv01 | Where-Object Name -like "*Encryption*"
Get-AzKeyVaultSecret -VaultName kv-ade-example | Select-Object Name, Created
```

## Einfach

Stell dir **eine Festplatte in der Cloud** vor. **Sie ist schon immer** mit **Microsoft-Schloss (SSE)** **abgeschlossen** – **automatisch**.

Du willst **noch mehr Schutz**:
- **ADE** = **Extra-Schloss im Inneren** (**BitLocker im Windows**). **Der Schlüssel liegt** in **deinem Schließfach (Key Vault)**. **Verlierst du das Schließfach**, **kommst du nicht mehr an die Daten**.
- **Encryption at Host** = **Schloss schon am Eingang des Rechenzentrums**: **Alles wird vor dem Speichern verschlossen**, **auch die Zwischenablage (Cache/Temp)**. **Das ist der neue Weg**.

**Wichtig**: **ADE** wird **abgeschafft** (**2028**). **Neue Server** bitte **mit Encryption at Host**.

**Regel für die Prüfung**: **Key Vault** und **VM** in **derselben Region/demselben Abo**, **Soft Delete/Purge Protection** **an**.

## Merksatz
- **SSE** = **immer an**, **Storage-Ebene**.
- **ADE** = **BitLocker/dm-crypt im Gast**, **Schlüssel im Key Vault** (**Legacy**, **Ende 15.09.2028**).
- **Encryption at Host** = **Host-Ebene**, **Temp/Cache** **verschlüsselt** (**Empfehlung**).
- **Key Vault**: **gleiche Region/gleiches Abo**, **EnabledForDiskEncryption**.
- **Soft Delete + Purge Protection** **schützen** **vor Schlüsselverlust**.
- **KEK** **verpackt** den **BitLocker-Schlüssel**.

## Prüfungsfalle
- **SSE** **braucht keine Aktivierung**, **ADE** **schon**.
- **Key Vault** in **anderer Region** **funktioniert nicht**.
- **Key Vault gelöscht** = **VM nicht mehr entsperrbar** (**Purge Protection**!).
- **Temp-Datenträger** und **Caches** sind **nur** mit **Encryption at Host** **abgedeckt** ; **SSE** **allein** deckt **weder** Temp/Caches **noch** den **Datenfluss** ab.
- **ADE** **läuft nicht** auf **Basic-/A-Serie** und **VMs unter 2 GB RAM**.
- **CMK** wird **über** **Disk Encryption Set** **angebunden**, **nicht** **über** die **ADE-Erweiterung**.
- **ADE ist Legacy**: **Neue** Lösungen **mit** **Encryption at Host**.
- **Lokale Server** **nicht** **mit** ADE, sondern **BitLocker**.
- **Migration** ADE → Encryption at Host: **kein In-Place**, **neue Datenträger/VMs**.

## Grafik
### Drei Ebenen
Cloud-Festplatte: innerer Ring ADE (BitLocker im Gast), mittlerer Ring Encryption at Host (Host), äußerer Ring SSE (Storage).

### Schließfach
VM mit Schloss; Schlüsselpfeil zum Key-Vault-Schließfach in derselben Region; Soft-Delete-Papierkorb daneben.

### Abschaltuhr
Kalender mit 15.09.2028; ADE-Schild wechselt zu „Encryption at Host“.

## Karteikarten
- F: Was ist ADE? | A: Azure Disk Encryption: BitLocker/dm-crypt im Gast, Schlüssel im Key Vault.
- F: Wann wird ADE abgeschaltet? | A: 15.09.2028 (Migration zu Encryption at Host nötig).
- F: Ist SSE standardmäßig aktiv? | A: Ja, immer, mit plattformverwalteten Schlüsseln.
- F: Wo liegen die ADE-Schlüssel? | A: Im Azure Key Vault (als Secret, optional KEK).
- F: Was muss für den Key Vault gelten? | A: Gleiche Region und Abonnement, für Datenträgerverschlüsselung aktiviert.
- F: Was ist ein KEK? | A: Key Encryption Key, verpackt den BitLocker-Schlüssel.
- F: Welche Option verschlüsselt Temp und Caches am Host? | A: Encryption at Host.
- F: Welches Cmdlet aktiviert ADE? | A: Set-AzVMDiskEncryptionExtension
- F: Welches Cmdlet zeigt den Status? | A: Get-AzVmDiskEncryptionStatus
- F: Wie bindet man CMK für SSE an? | A: Über ein Disk Encryption Set.
- F: Was schützt vor Löschung des Key Vault? | A: Soft Delete und Purge Protection.
- F: Gibt es eine In-Place-Migration von ADE zu Encryption at Host? | A: Nein, neue Datenträger und VMs nötig.

## Quiz
? Alle Datenträger einer Azure-VM sollen zusätzlich im Gastsystem per BitLocker verschlüsselt werden. Was nutzt man?
* Azure Disk Encryption
- Azure Backup
- NSG
- Azure Files

? Wo liegen die BitLocker-Schlüssel bei ADE?
* Azure Key Vault
- Recovery Services Vault
- Storage Account
- Log Analytics

? Der Key Vault für ADE liegt in einer anderen Region als die VM. Ergebnis?
* Verschlüsselung schlägt fehl
- Funktioniert mit Verzögerung
- Funktioniert über Peering
- Nur Datendisk betroffen

? Welche Option verschlüsselt auch Temp-Datenträger und Caches am Host ohne CPU-Last in der VM?
* Encryption at Host
- SSE mit PMK
- ADE mit KEK
- BitLocker To Go

? Wie werden kundenseitig verwaltete Schlüssel für SSE angebunden?
* Disk Encryption Set
- ADE-Erweiterung
- NSG
- Availability Set

? Was schützt vor dem versehentlichen Löschen des ADE-Key-Vaults?
* Soft Delete und Purge Protection
- Zwei Regionen
- Standard-SKU
- Tags

? Welche Verschlüsselung ist für alle verwalteten Azure-Datenträger standardmäßig aktiv?
* Serverseitige Verschlüsselung (SSE) mit plattformverwalteten Schlüsseln
- Azure Disk Encryption
- EFS
- Keine
! ADE verschlüsselt zusätzlich im Gast.

? Welche Technik nutzt ADE in Linux-VMs?
* DM-Crypt
- BitLocker
- EFS
- VeraCrypt
! In Windows-VMs wird BitLocker verwendet.
