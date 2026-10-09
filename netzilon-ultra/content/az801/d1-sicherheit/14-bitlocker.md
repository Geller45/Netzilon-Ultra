---
id: az801-bitlocker
bereich: AZ-801
block: A9
kapitel: Sicherheit
titel: BitLocker inklusive Wiederherstellung
stufe: Fortgeschritten
quellen: [AZ-801 Study Guide, Microsoft Learn]
verweise: [az801-azure-disk-encryption, az801-dc-haertung, ap1-a6-efs-vss, az800-vhdx]
---

## Profi

### Zweck
**BitLocker** (*BitLocker-Laufwerkverschlüsselung*) **verschlüsselt ganze Volumes**. Wer **die Festplatte ausbaut** oder **den Rechner stiehlt**, kommt **ohne Schlüssel** **nicht an die Daten**. Schutz **im Ruhezustand** (*data at rest*), **nicht** vor **Angriffen im laufenden Betrieb**.

### Voraussetzungen
| Punkt | Details |
|---|---|
| **TPM** (*Trusted Platform Module*) | **TPM 1.2 oder 2.0** (**Empfehlung 2.0**), **ohne TPM** nur mit **GPO** **„BitLocker ohne kompatibles TPM zulassen“** (**Kennwort/USB-Schlüssel**) |
| **Firmware** | **UEFI** mit **Secure Boot** empfohlen |
| **Partitionen** | **Systempartition** (**EFI/Systemreserviert**) **getrennt** vom **Betriebssystemvolume** |
| **Server** | **Feature** `BitLocker` (Server-Manager/PowerShell) **installieren**, **Neustart** |
| **VMs** | **Gen 2** **mit virtuellem TPM** (**vTPM**) oder **Kennwort-Schutz** |
| **Verschlüsselung** | **XTS-AES 128** (**Standard**), **XTS-AES 256**; **AES-CBC** (**Legacy**) |

```powershell
# Auf SRV01 – Server-Feature
Install-WindowsFeature BitLocker -IncludeAllSubFeature -IncludeManagementTools -Restart
```

### Schutzvorrichtungen (Key Protectors)
| Protector | Verwendung |
|---|---|
| **TPM** | **Nur TPM** – **automatischer Start**, **Prüfung** der **Startumgebung** |
| **TPM + PIN** | **Vorstart-PIN** (**besser**), **schützt** vor **Kaltstart** |
| **TPM + Startschlüssel** | **USB-Stick** beim Start |
| **TPM + PIN + Startschlüssel** | **Höchste** Sicherheit |
| **Kennwort** | **Datenlaufwerke**, **Systemlaufwerk ohne TPM** |
| **Wiederherstellungskennwort** | **48-stellige Zahl** (**8 Blöcke à 6 Ziffern**) |
| **Wiederherstellungsschlüssel** | **`.BEK`-Datei** |
| **Datenwiederherstellungs-Agent (DRA)** | **Zertifikat** (**Administrator** kann **alle** Laufwerke **entsperren**) |
| **Automatisches Entsperren** | **Datenlaufwerk** **entsperrt sich** **mit** dem **entsperrten OS-Laufwerk** |
| **AD-Konto/Gruppe (ADAccountOrGroup)** | **Cluster** (**CSV**), **Dateiserver** mit **mehreren Knoten** |
| **Netzwerk-Entsperrung** (*Network Unlock*) | **Server** **starten ohne PIN** **im Firmennetz** (**WDS**, **UEFI-DHCP**) |

### Was wird geschützt?
| Laufwerk | Erklärung |
|---|---|
| **Betriebssystemlaufwerk** | **C:**, **Startintegrität** über **TPM** |
| **Festplattenlaufwerke** (**Datenlaufwerke**, **fest**) | **D:**, **entsperren** per **Kennwort/Auto-Unlock** |
| **Wechselmedien** (*BitLocker To Go*) | **USB**, **Kennwort/Smartcard** |

**Option**: **Nur belegten Speicherplatz verschlüsseln** (*Used Space Only*, **schnell**) oder **gesamtes Laufwerk** (*Full*, **sicherer** bei **gebrauchten** Datenträgern).

### Gruppenrichtlinien
`Computerkonfiguration → Administrative Vorlagen → Windows-Komponenten → BitLocker-Laufwerkverschlüsselung`
| Richtlinie | Wirkung |
|---|---|
| **Betriebssystemlaufwerke → Zusätzliche Authentifizierung beim Start anfordern** | **TPM/PIN/Startschlüssel** erzwingen |
| **Betriebssystemlaufwerke → Auswählen, wie BitLocker-geschützte Betriebssystemlaufwerke wiederhergestellt werden können** | **Wiederherstellungskennwort/Schlüssel**, **Speichern in AD DS** aktivieren |
| **Verschlüsselungsmethode und Verschlüsselungsstärke auswählen** | **XTS-AES 128/256** |
| **Festplattenlaufwerke → Schreibzugriff verweigern, wenn nicht durch BitLocker geschützt** | **Wechselmedien** |
| **Vorstart-PIN mit Mindestlänge** | **PIN-Komplexität** |

**Wichtig**: **„BitLocker-Wiederherstellungsinformationen in AD DS speichern“** **und** **„BitLocker erst aktivieren, wenn Wiederherstellungsinformationen gespeichert sind“** **aktivieren**.

### Wiederherstellungsinformationen in AD DS
| Element | Details |
|---|---|
| **Speicherort** | **Untergeordnetes Objekt** **des Computerkontos**: `msFVE-RecoveryInformation` |
| **Attribute** | `msFVE-RecoveryPassword` (**Kennwort**), `msFVE-RecoveryGuid` (**Kennwort-ID**) |
| **Anzeigen** | **ADUC** → **Computer** → **Registerkarte BitLocker-Wiederherstellung** (**RSAT-Feature „BitLocker-Wiederherstellungskennwort-Viewer“**) |
| **Berechtigung** | **Domänenadmin** oder **delegiert** (**Lesezugriff** auf **msFVE-RecoveryPassword**) |
| **Nachträglich sichern** | `Backup-BitLockerKeyProtector` |

```powershell
# Auf DC01 – Wiederherstellungskennwort eines Computers auslesen
$pc = Get-ADComputer "CLIENT01"
Get-ADObject -Filter 'objectClass -eq "msFVE-RecoveryInformation"' -SearchBase $pc.DistinguishedName `
  -Properties msFVE-RecoveryPassword, whenCreated | Select-Object whenCreated, msFVE-RecoveryPassword
```

**Cloud**: **Wiederherstellungsschlüssel** in **Microsoft Entra ID**/**Intune** (**Entra-eingebundene Geräte**). **Abruf**: **Entra-Admincenter → Geräte → BitLocker-Schlüssel**.

### Wann wechselt BitLocker in den Wiederherstellungsmodus?
| Auslöser | Beispiel |
|---|---|
| **Änderung der Startumgebung** | **UEFI/BIOS-Update**, **Boot-Reihenfolge**, **Secure Boot** geändert |
| **TPM** **gelöscht/geändert** | **Mainboard-Tausch** |
| **Zu viele falsche PIN-Eingaben** | **Sperre** durch **TPM** |
| **Datenträger** **in anderen Rechner** | **Anderes TPM** |
| **Manipulation am Bootloader** | **Malware/Boot-Sektor** |

**Wiederherstellung**
1. **Blauer Bildschirm** zeigt **Schlüssel-ID** (**erste 8 Zeichen**).
2. **Helpdesk** sucht **Kennwort** in **AD/Entra** **per ID**.
3. **48-stelliges Kennwort** eingeben.
4. **Ursache beheben**, **Schutzvorrichtungen** **neu** **anlegen**.

### Verwaltung
```powershell
# Auf SRV01 – aktivieren (TPM + Wiederherstellungskennwort, XTS-AES 256)
Enable-BitLocker -MountPoint "C:" -EncryptionMethod XtsAes256 -UsedSpaceOnly -TpmProtector
Add-BitLockerKeyProtector -MountPoint "C:" -RecoveryPasswordProtector
# Alternative mit PIN: nur EIN TPM-Protector je Volume -> TPM-Protector zuerst entfernen
# Add-BitLockerKeyProtector -MountPoint "C:" -TpmAndPinProtector -Pin (Read-Host -AsSecureString "PIN")

# Status
Get-BitLockerVolume | Select-Object MountPoint, VolumeStatus, EncryptionPercentage, ProtectionStatus
(Get-BitLockerVolume -MountPoint C:).KeyProtector

# Sicherung des Wiederherstellungskennworts ins AD
$id = ((Get-BitLockerVolume -MountPoint C:).KeyProtector | Where-Object KeyProtectorType -eq RecoveryPassword).KeyProtectorId
Backup-BitLockerKeyProtector -MountPoint C: -KeyProtectorId $id

# Datenlaufwerk mit Kennwort und Auto-Unlock
Enable-BitLocker -MountPoint D: -PasswordProtector -Password (Read-Host -AsSecureString) -UsedSpaceOnly
Enable-BitLockerAutoUnlock -MountPoint D:

# Unlock, Suspend, Resume
Unlock-BitLocker -MountPoint D: -RecoveryPassword "111111-222222-333333-444444-555555-666666-777777-888888"
Suspend-BitLocker -MountPoint C: -RebootCount 1
Resume-BitLocker -MountPoint C:
Disable-BitLocker -MountPoint D:    # Entschlüsseln
```
`manage-bde -status`, `manage-bde -protectors -get C:` (**Legacy-Werkzeug**).

### Sonderfälle (Prüfung)
| Thema | Lösung |
|---|---|
| **BIOS-/Firmware-Update** | **`Suspend-BitLocker -RebootCount 1`** **vor** dem **Update** (**vermeidet Wiederherstellung**) |
| **Failover-Cluster (CSV)** | **`-ADAccountOrGroupProtector -ADAccountOrGroup "CLUSTER$" -Service`** |
| **Server ohne Benutzer** | **Netzwerk-Entsperrung** oder **TPM-only** |
| **Hyper-V-Host** | **BitLocker** auf **Host** **und/oder** **verschlüsselte VMs** (**vTPM**) |
| **Domänencontroller** | **BitLocker** **empfohlen** (**Diebstahl von NTDS.dit**) |
| **Deaktivieren** | **Suspend** (**Schutz aus**, **Daten verschlüsselt**) vs. **Disable** (**entschlüsseln**) |

## Lab
**Maschinen**: **DC01** (example.com), **SRV01** (Server 2022 **Gen 2** **mit vTPM**), Anmeldung als **Domänenadmin**.

### GUI
1. **DC01**: **GPMC → GPO-BitLocker → Computerkonfiguration → Administrative Vorlagen → Windows-Komponenten → BitLocker-Laufwerkverschlüsselung → Betriebssystemlaufwerke → Auswählen, wie BitLocker-geschützte Betriebssystemlaufwerke wiederhergestellt werden können**.
2. **DC01**: **Aktiviert** → **BitLocker-Wiederherstellungsinformationen in AD DS speichern** → **Wiederherstellungskennwörter und Schlüsselpakete** → **„BitLocker erst aktivieren, wenn Wiederherstellungsinformationen für Betriebssystemlaufwerke in AD DS gespeichert sind“** anhaken.
3. **SRV01**: **Server-Manager → Features hinzufügen → BitLocker-Laufwerkverschlüsselung** → **Neustart**.
4. **SRV01**: `gpupdate /force` → **Systemsteuerung → BitLocker-Laufwerkverschlüsselung → BitLocker aktivieren** (C:).
5. **SRV01**: **Wiederherstellungsschlüssel sichern** → **In Active Directory bereits gespeichert** (**Assistent zeigt Hinweis**) → **Nur belegten Speicherplatz verschlüsseln** → **Neuer Verschlüsselungsmodus** → **BitLocker-Systemüberprüfung** → **Neustart**.
6. **DC01**: **ADUC → Ansicht → Erweiterte Features** → **Computer SRV01 → Eigenschaften → BitLocker-Wiederherstellung** → **Kennwort** und **Kennwort-ID** ablesen.
7. **SRV01**: **Systemsteuerung → BitLocker verwalten → Schutz anhalten** (**Simulation Firmware-Update**) → **Schutz fortsetzen**.
8. **SRV01**: **UEFI-Einstellung** **ändern** (**Boot-Reihenfolge**) → **Wiederherstellungsmodus** → **Kennwort** eingeben.

### PowerShell
```powershell
# Auf SRV01
Install-WindowsFeature BitLocker -IncludeAllSubFeature -IncludeManagementTools -Restart
Enable-BitLocker -MountPoint C: -EncryptionMethod XtsAes256 -UsedSpaceOnly -TpmProtector
Add-BitLockerKeyProtector -MountPoint C: -RecoveryPasswordProtector
Get-BitLockerVolume
Backup-BitLockerKeyProtector -MountPoint C: -KeyProtectorId (Get-BitLockerVolume C:).KeyProtector[1].KeyProtectorId

# Auf DC01
Get-ADObject -Filter 'objectClass -eq "msFVE-RecoveryInformation"' -SearchBase (Get-ADComputer SRV01).DistinguishedName -Properties msFVE-RecoveryPassword
```

## Einfach

**BitLocker** = **Tresor für die ganze Festplatte**. Ohne **Schlüssel** sieht ein Dieb **nur Datenmüll**.

Es gibt **mehrere Schlüssel-Arten**:
- **TPM** = **Chip im Rechner**, der **automatisch aufschließt**, **wenn alles wie immer aussieht**.
- **PIN** = **Geheimzahl** beim Start (**wie beim Handy**).
- **Wiederherstellungskennwort** = **Notschlüssel** (**48 Ziffern**). **Ersatzschlüssel, den der Helpdesk im AD hat**.

**Wann kommt der Notfall-Bildschirm?** Wenn **jemand am Rechner „gebastelt“ hat**: **BIOS-Update**, **anderes Mainboard**, **Festplatte in anderen PC**. **BitLocker denkt**: „**Vielleicht ein Dieb!**“ und **fragt nach dem Notschlüssel**.

**Tipp**: **Vor einem BIOS-Update** **BitLocker kurz „pausieren“** (**Suspend**) – **dann kein Notfall-Bildschirm**.

**Wichtig**: **Notschlüssel** **vorher im AD speichern lassen** (**GPO**), **sonst** sind **die Daten bei Verlust weg**.

## Merksatz
- **TPM + PIN** = **stark**, **TPM allein** = **bequem**.
- **Wiederherstellungskennwort** = **48 Ziffern**, **im AD** (`msFVE-RecoveryInformation`).
- **Suspend vor Firmware-Update**.
- **XTS-AES** = **Standard**, **CBC** = **Legacy**.
- **Cluster** = **ADAccountOrGroup-Protector**.
- **Suspend ≠ Disable** (**Schutz pausiert** vs. **entschlüsselt**).

## Prüfungsfalle
- **Ohne GPO** landen **Wiederherstellungsschlüssel** **nicht** im **AD**.
- **Wiederherstellungskennwort** **finden**: **über Schlüssel-ID** (**erste 8 Zeichen**).
- **Firmware-Update** **ohne Suspend** → **Wiederherstellung**.
- **BitLocker auf VM** braucht **vTPM** (**Gen 2**) oder **Kennwort**.
- **Cluster-CSV**: **Kontoschutz** **statt** **Kennwort**.
- **Auto-Unlock** **nur** **wenn** **OS-Laufwerk entsperrt** ist.
- **BitLocker To Go** = **Wechselmedien**, **nicht** **Systemlaufwerk**.
- **DRA** = **Zertifikat für Admins**, **nicht** **Wiederherstellungskennwort**.
- **EFS** (**Dateiebene**) **≠** **BitLocker** (**Volumeebene**).
- **Entra-Geräte**: **Schlüssel** **in Entra/Intune**, **nicht** **im AD**.

## Grafik
### Tresor mit Schlüsselring
Festplatte im Tresor; Schlüssel TPM, PIN, Notschlüssel hängen am Ring.

### Notfall-Bildschirm
Blauer Bildschirm mit Schlüssel-ID; Helpdesk sucht im AD-Ordner; 48-stelliges Kennwort wandert zurück.

### Suspend vor Update
Update-Balken; Pause-Symbol auf BitLocker; Resume-Symbol danach.

## Karteikarten
- F: Was verschlüsselt BitLocker? | A: Ganze Volumes (Systemlaufwerk, Datenlaufwerke, Wechselmedien).
- F: Wie lang ist das Wiederherstellungskennwort? | A: 48 Ziffern in 8 Blöcken.
- F: Wo speichert AD das Wiederherstellungskennwort? | A: Als msFVE-RecoveryInformation unter dem Computerkonto.
- F: Welche GPO ist nötig? | A: BitLocker-Wiederherstellungsinformationen in AD DS speichern.
- F: Wofür ist das TPM? | A: Prüft die Startintegrität und hält den Schlüssel.
- F: Was macht Suspend-BitLocker? | A: Pausiert den Schutz, z. B. vor Firmware-Updates.
- F: Was ist Backup-BitLockerKeyProtector? | A: Sichert Schutzvorrichtungen ins AD.
- F: Standardverschlüsselung? | A: XTS-AES 128 (optional 256).
- F: Wie entsperrt man Datenlaufwerke automatisch? | A: Enable-BitLockerAutoUnlock.
- F: Was benötigt BitLocker in einer VM? | A: Generation 2 mit vTPM oder Kennwortschutz.
- F: Wie schützt man CSV im Cluster? | A: Mit ADAccountOrGroup-Protector (Clusterkonto).
- F: Was ist Network Unlock? | A: Serverstart ohne PIN im Firmennetz über WDS.

## Quiz
? Wiederherstellungskennwörter sollen zentral im AD gespeichert werden. Lösung?
* GPO „BitLocker-Wiederherstellungsinformationen in AD DS speichern“
- FGPP
- Protected Users
- Windows-Firewall-Regel

? Vor einem UEFI-Update soll keine Wiederherstellung ausgelöst werden. Was tun?
* Suspend-BitLocker -RebootCount 1
- Disable-BitLocker
- TPM löschen
- Datenträger neu formatieren

? Ein Anwender sieht den blauen Wiederherstellungsbildschirm. Wie findet der Helpdesk das Kennwort?
* Über die Schlüssel-ID im AD/Entra
- Über die Seriennummer
- Über die MAC-Adresse
- Über die IP-Adresse

? Welcher Schutz ist bei einem Server im Failover-Cluster für CSV nötig?
* ADAccountOrGroup-Protector für das Clusterkonto
- PIN
- Startschlüssel
- Kennwort pro Knoten

? Eine Gen-2-VM soll BitLocker nutzen. Was ist nötig?
* Virtuelles TPM
- Fibre Channel
- Zweite NIC
- Checkpoint

? Was passiert bei Suspend-BitLocker?
* Schutz pausiert, Daten bleiben verschlüsselt
- Laufwerk wird entschlüsselt
- TPM wird gelöscht
- Wiederherstellungskennwort wird gelöscht

? Welcher Schutz (Protector) nutzt nur das TPM ohne Benutzereingabe?
* TPM-only
- TPM + PIN
- Kennwort
- Wiederherstellungsschlüssel auf USB
! TPM + PIN schützt zusätzlich vor Angriffen bei gestohlenem Gerät.

? Welches Cmdlet aktiviert BitLocker auf einem Volume?
* Enable-BitLocker
- Start-BitLocker
- Set-BitLockerVolume
- New-BitLockerKey
! Beispiel mit -TpmProtector und anschließend Add-BitLockerKeyProtector -RecoveryPasswordProtector.
