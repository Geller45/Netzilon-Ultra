---
id: server-hvsz-31
bereich: AZ-800
block: HV-S
kapitel: Hyper-V-Praxisszenarien
titel: Szenario 31 – Windows-11-VM: vTPM, Secure Boot und BitLocker im Gast
stufe: Fortgeschritten
fach: Windows Server / AZ-800
pruefungen: [AZ-800, AP2, Schule]
quellen: [Microsoft Learn – Hyper-V]
verweise: [az801-bitlocker, az800-vhdx, server-hvsz-32, server-hvsz-38]
---

## Profi

### Ticket
**Kunde meldet:** „Das Windows-11-Setup in der neuen Test-VM bricht ab: ‚Dieser PC erfüllt nicht die Mindestanforderungen‘. Außerdem soll BitLocker in der VM aktiviert werden.“
- **Priorität:** niedrig (Testumgebung)
- **Betroffene Maschine:** **W11-TEST** auf **HV01**

### Ausgangslage
- Host **HV01.example.com**, Server 2025
- VM **W11-TEST** wurde als **Generation 1** mit 2 GB RAM, 1 vCPU und 40 GB VHDX angelegt; IP per DHCP aus 192.168.10.0/24.
- Windows-11-Mindestanforderungen: **UEFI mit Secure Boot**, **TPM 2.0**, mind. **4 GB RAM**, **64 GB** Speicher, **2** Kerne (64-Bit).

### Analyse
- Gen-1-VMs haben **BIOS**, kein UEFI, kein Secure Boot und **kein vTPM** → Windows 11 nicht installierbar. Eine Umwandlung Gen 1 → Gen 2 gibt es in Hyper-V nicht; die VM muss **neu als Gen 2** erstellt werden.
- Ein **virtuelles TPM (vTPM)** braucht eine **Schlüsselschutzvorrichtung** (Key Protector). Ohne Host Guardian Service (HGS) erzeugt `Set-VMKeyProtector -NewLocalKeyProtector` einen **lokalen** Schutz mit Zertifikaten eines „Untrusted Guardian“ auf dem Host.
- Diese Zertifikate liegen auf HV01 im Zertifikatspeicher **„Shielded VM Local Certificates“**. Wird die VM auf **HV02** verschoben oder dort wiederhergestellt, braucht HV02 **dieselben Zertifikate** (mit privatem Schlüssel) – sonst startet die VM nicht.
- Secure-Boot-Vorlage für Windows: **„Microsoft Windows“**.
- BitLocker im Gast nutzt das **vTPM** wie ein physisches TPM.

### Lösungsweg
1. **Neue Gen-2-VM** W11-TEST erstellen (4 GB, 2 vCPU, 64 GB VHDX). *Begründung:* Nur Gen 2 hat UEFI, Secure Boot und vTPM.
2. **Secure Boot** mit Vorlage „Microsoft Windows“ prüfen. *Begründung:* Voraussetzung für Windows 11, Standard bei Gen 2.
3. **Key Protector** setzen und **vTPM aktivieren** (VM ausgeschaltet). *Begründung:* Ohne Key Protector lässt sich das TPM nicht einschalten.
4. Optional „**Statusdatei und Datenverkehr der VM-Migration verschlüsseln**“. *Begründung:* Schützt Speicherinhalte (u. a. BitLocker-Schlüssel) in Zustandsdateien und bei der Migration.
5. Windows 11 installieren, dann im Gast **BitLocker** für C: aktivieren, Wiederherstellungsschlüssel sicher ablegen (z. B. in AD DS oder Entra ID). *Begründung:* Ohne Wiederherstellungsschlüssel ist die VM bei TPM-Verlust unbrauchbar.
6. **Guardian-Zertifikate** von HV01 exportieren und auf HV02 importieren, falls die VM dort laufen soll. *Begründung:* Sonst kann HV02 das vTPM nicht entschlüsseln.

### Ergebnis prüfen
- HV01: `Get-VMSecurity -VMName W11-TEST` → TpmEnabled True; `Get-VMFirmware -VMName W11-TEST` → SecureBoot On.
- Im Gast: `tpm.msc` → TPM-Herstellerversion 2.0, „Das TPM ist einsatzbereit“.
- Im Gast: `manage-bde -status C:` → Schutzstatus „Ein“, Schlüsselschutz „TPM“ und „Numerisches Kennwort“.

### Vorbeugung
- Vorlage für Client-VMs immer **Gen 2** mit vTPM.
- Guardian-Zertifikate (PFX) sicher sichern – sie gehören wie Schlüssel in einen Tresor.
- BitLocker-Wiederherstellungsschlüssel zentral speichern.

## Einfach
Windows 11 ist ein wählerischer Gast. Es zieht nur in ein Haus ein, das drei Dinge hat:
- eine moderne **Haustür mit Türsteher** (UEFI mit Secure Boot), der prüft, dass beim Start nur echte, unterschriebene Programme reinkommen,
- einen **Tresor** (TPM 2.0), in dem geheime Schlüssel sicher liegen,
- und genug Platz (4 GB RAM, 64 GB Festplatte).

Eine Generation-1-VM ist ein altes Haus ohne Türsteher und ohne Tresor. Umbauen geht nicht – man muss ein neues Haus bauen: eine **Generation-2-VM**.

Der Tresor in der VM ist ein **virtueller Tresor** (vTPM). Damit nicht jeder ihn einfach mitnehmen kann, wird er selbst mit einem Schlüssel des Hosts verschlossen (Key Protector). Wenn die VM in ein anderes Haus (HV02) umzieht, muss der Hausschlüssel mit – sonst bekommt man den Tresor dort nicht auf.

**BitLocker** ist dann wie ein Schloss auf der ganzen Festplatte der VM. Den Schlüssel dafür bewahrt das vTPM auf. Und für den Notfall schreibt man sich einen langen **Wiederherstellungscode** auf und legt ihn sicher ab.

## Merksatz
- Windows 11 ⇒ **Gen 2 + Secure Boot + vTPM**.
- Kein vTPM ohne **Key Protector**.
- Lokaler Key Protector ⇒ Zertifikate „**Shielded VM Local Certificates**“ mitnehmen.
- Gen 1 → Gen 2 **nicht umwandelbar**.

## Prüfungsfalle
- vTPM gibt es **nur in Gen-2-VMs**.
- `Enable-VMTPM` schlägt fehl, wenn vorher kein Key Protector gesetzt wurde.
- Nach dem Verschieben auf einen anderen Host ohne die Guardian-Zertifikate startet die VM nicht.
- Secure-Boot-Vorlage für Linux-Gäste ist „Microsoft UEFI-Zertifizierungsstelle“, für Windows „Microsoft Windows“.

## Grafik
### vTPM einrichten
1. Admin -> HV01: neue Gen-2-VM W11-TEST
2. HV01: Set-VMKeyProtector erzeugt lokalen Untrusted Guardian
3. HV01 -> W11-TEST: Enable-VMTPM schaltet vTPM ein
4. W11-TEST: Windows-11-Setup erkennt TPM 2.0 und Secure Boot
5. W11-TEST: BitLocker versiegelt Schlüssel im vTPM
6. HV01 -> HV02: Guardian-Zertifikate exportieren und importieren

## Lab
**Nachstellen:** Gen-1-VM erzeugt den Fehler, Gen-2-VM mit vTPM behebt ihn. Maschinen: **HV01**, VMs **W11-ALT** (Gen 1) und **W11-TEST** (Gen 2), Windows-11-ISO.

### GUI
1. **HV01**: Hyper-V-Manager → Neu → Virtueller Computer → **W11-ALT**, Generation 1, 2 GB → ISO einlegen → starten → Setup meldet fehlende Anforderungen.
2. **HV01**: Neu → Virtueller Computer → **W11-TEST**, **Generation 2**, 4096 MB, Netzwerk „Extern“, neue VHDX 64 GB, ISO.
3. **HV01**: W11-TEST → Einstellungen → **Sicherheit** → „Sicheren Start aktivieren“, Vorlage „Microsoft Windows“ → „**Trusted Platform Module aktivieren**“ → OK.
4. **HV01**: W11-TEST → Einstellungen → Prozessor → 2 → OK → starten → Windows 11 installieren.
5. **W11-TEST**: Systemsteuerung → BitLocker-Laufwerkverschlüsselung → „BitLocker aktivieren“ für C: → Wiederherstellungsschlüssel speichern.
6. **HV01**: certlm.msc → „Shielded VM Local Certificates“ → Zertifikate mit privatem Schlüssel exportieren (PFX) → auf **HV02** in denselben Speicher importieren.

### PowerShell
```powershell
# Auf HV01 – neue Gen-2-VM
New-VM -Name W11-TEST -Generation 2 -MemoryStartupBytes 4GB -NewVHDPath "D:\Hyper-V\W11-TEST\W11-TEST.vhdx" -NewVHDSizeBytes 64GB -SwitchName "Extern"
Set-VMProcessor -VMName W11-TEST -Count 2
Set-VMFirmware -VMName W11-TEST -EnableSecureBoot On -SecureBootTemplate "MicrosoftWindows"
Add-VMDvdDrive -VMName W11-TEST -Path "D:\ISO\Win11.iso"

# Auf HV01 – Key Protector und vTPM (VM aus)
Set-VMKeyProtector -VMName W11-TEST -NewLocalKeyProtector
Enable-VMTPM -VMName W11-TEST
Get-VMSecurity -VMName W11-TEST

# Auf W11-TEST – nach der Installation BitLocker
Get-Tpm
Enable-BitLocker -MountPoint "C:" -EncryptionMethod XtsAes256 -TpmProtector -UsedSpaceOnly
Add-BitLockerKeyProtector -MountPoint "C:" -RecoveryPasswordProtector
manage-bde -status C:

# Auf HV01 – Guardian-Zertifikate anzeigen (Export per certlm.msc mit privatem Schlüssel)
Get-ChildItem "Cert:\LocalMachine\Shielded VM Local Certificates"
```

## Szenario
### Kontrollfragen
W11-TEST wurde als Gen-1-VM mit 2 GB RAM angelegt, das Windows-11-Setup bricht ab. BitLocker soll später im Gast laufen.
- F: Warum kann die VM nicht einfach umgestellt werden? | A: Eine Gen-1-VM lässt sich nicht in Gen 2 umwandeln; vTPM und Secure Boot gibt es nur in Gen 2.
- F: Was muss vor Enable-VMTPM gesetzt werden? | A: Eine Schlüsselschutzvorrichtung, z. B. Set-VMKeyProtector -NewLocalKeyProtector.
- F: Welche Secure-Boot-Vorlage gehört zu Windows? | A: Microsoft Windows (MicrosoftWindows).
- F: Was ist vor dem Verschieben auf HV02 zu tun? | A: Die Guardian-Zertifikate aus „Shielded VM Local Certificates“ mit privatem Schlüssel nach HV02 übertragen.
- F: Wie prüfst du BitLocker im Gast? | A: manage-bde -status C: bzw. Get-BitLockerVolume.

## Legende
### vTPM mit lokalem Key Protector
- Was: Virtuelles TPM 2.0 einer Gen-2-VM, geschützt durch eine Schlüsselschutzvorrichtung.
- Wie: Set-VMKeyProtector -NewLocalKeyProtector, dann Enable-VMTPM.
- Wann: Windows 11, BitLocker, Credential Guard oder Measured Boot im Gast.
- Wo: Hyper-V-Manager → VM-Einstellungen → Sicherheit.
- Warum: Gast-Schlüssel sollen sicher abgelegt und an die Host-Vertrauensbasis gebunden sein.
### Untrusted Guardian
- Was: Lokaler Guardian mit selbst erzeugten Zertifikaten, wenn kein HGS vorhanden ist.
- Wo: Zertifikatspeicher „Shielded VM Local Certificates“ des Hosts.
- Warum: Ohne diese Zertifikate kann kein anderer Host das vTPM öffnen.

## Karteikarten
- F: Welche Hardware-Voraussetzungen hat Windows 11 in einer VM? | A: Gen 2 (UEFI), Secure Boot, TPM 2.0, mind. 4 GB RAM, 64 GB Speicher, 2 Kerne.
- F: Kann man eine Gen-1-VM in Gen 2 umwandeln? | A: Nein, in Hyper-V nicht – neue VM erstellen.
- F: Welches Cmdlet setzt einen lokalen Key Protector? | A: Set-VMKeyProtector -VMName VM -NewLocalKeyProtector
- F: Welches Cmdlet aktiviert das vTPM? | A: Enable-VMTPM -VMName VM
- F: Wo liegen die Zertifikate des lokalen Guardians? | A: Im Zertifikatspeicher „Shielded VM Local Certificates“ des Hosts.
- F: Warum startet die VM nach Verschieben auf HV02 nicht? | A: HV02 fehlen die Guardian-Zertifikate zum Entschlüsseln des vTPM.
- F: Wo stellt man vTPM im GUI ein? | A: VM-Einstellungen → Sicherheit → Trusted Platform Module aktivieren.
- F: Was schützt die Option „Statusdatei und Datenverkehr der VM-Migration verschlüsseln“? | A: Gespeicherte Zustände und Live-Migrationsdaten der VM.
- F: Welche Secure-Boot-Vorlage nimmt man für Linux? | A: Microsoft UEFI-Zertifizierungsstelle.

## Quiz
? Welche VM-Generation unterstützt ein vTPM?
* Nur Generation 2
- Nur Generation 1
- Beide Generationen
- Keine, TPM ist nur physisch
! Gen 1 hat BIOS-Firmware ohne vTPM.

? Was muss vor Enable-VMTPM passieren?
* Eine Schlüsselschutzvorrichtung setzen (Set-VMKeyProtector)
- Die VM in den Cluster aufnehmen
- Update-VMVersion auf 5.0
- Dynamischen RAM aktivieren
! Ohne Key Protector kann das vTPM nicht aktiviert werden.

? Eine VM mit lokalem Key Protector startet nach dem Import auf HV02 nicht. Ursache?
* Die Guardian-Zertifikate von HV01 fehlen auf HV02
- HV02 hat zu wenig Festplattenplatz
- Secure Boot ist auf HV02 nicht lizenziert
- Der Integrationsdienst Takt fehlt
! Die Zertifikate aus „Shielded VM Local Certificates“ müssen mitgenommen werden.

? Welche Secure-Boot-Vorlage ist für Windows-Gäste richtig?
* Microsoft Windows
- Microsoft UEFI-Zertifizierungsstelle
- Open Source Shielded VM
- Keine Vorlage
! Die UEFI-CA-Vorlage ist für Linux und andere Systeme.

? Wie viel RAM verlangt Windows 11 mindestens?
* 4 GB
- 1 GB
- 2 GB
- 16 GB
! Dazu 64 GB Speicher und 2 Kerne.

? Was ist der richtige Weg, wenn W11-TEST als Gen 1 angelegt wurde?
* Neue Gen-2-VM erstellen
- Convert-VM -Generation 2
- Update-VMVersion
- Set-VM -Generation 2
! Die Generation ist nach dem Erstellen fest.

? Welcher Befehl zeigt im Gast den BitLocker-Status?
* manage-bde -status C:
- Get-VMSecurity
- tpm.msc /status
- bcdedit /bitlocker
! Get-VMSecurity läuft auf dem Host und zeigt nur den vTPM-Status.

? Wozu dient die Option „Statusdatei und Datenverkehr der VM-Migration verschlüsseln“?
* Schutz von RAM-Inhalten in Zustandsdateien und bei der Live-Migration
- Schnellere Live-Migration
- Verschlüsselung der VHDX ohne BitLocker
- Erzwingen von SMB 1.0
! RAM-Inhalte können Schlüssel enthalten.
