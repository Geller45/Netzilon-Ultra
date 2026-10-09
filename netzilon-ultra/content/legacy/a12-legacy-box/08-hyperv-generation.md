---
id: legacy-hyperv-generation
bereich: Legacy
block: A12
kapitel: Legacy-Box
titel: Hyper-V Generation 1 (Legacy) gegen Generation 2
stufe: Fortgeschritten
quellen: [Microsoft Learn Hyper-V Generation, eigene Zusammenstellung]
verweise: [az800-vhdx, az800-vswitch, legacy-bios-uefi, ap2-virtualisierung-cloud]
---

## Profi

### Zwei Generationen
Beim Anlegen einer VM in Hyper-V muss die **Generation** gewählt werden – **nachträglich nicht änderbar** (nur per Neuaufbau/Migration).

| Merkmal | **Generation 1** (Legacy) | **Generation 2** |
|---|---|---|
| Firmware | **BIOS** | **UEFI** |
| Boot-Datenträger | **IDE** (Systemplatte muss IDE sein) | **SCSI** (kein IDE-Controller) |
| Partitionsstil (Boot) | MBR | **GPT** |
| Boot vom Netzwerk | **Legacy-Netzwerkadapter** (Emulation) | **Standardadapter** (synthetisch) mit PXE |
| **Secure Boot** | Nein | **Ja** (Vorlage Windows / Microsoft UEFI-Zertifizierungsstelle für Linux) |
| **Shielded VM / vTPM** | Nein | **Ja** |
| Disketten-/COM-Anschluss | Ja (virtuell) | Nein (COM per Named Pipe nur über PowerShell) |
| **Boot von VHD (VHDX)** | ≤ **2 TB** Boot-VHD (MBR) | **bis 64 TB** |
| Gastsysteme | 32-Bit und 64-Bit, **auch alte** (XP, Server 2003), Linux alle | **Nur 64-Bit**: Windows Server 2012+, Windows 8+, moderne Linux |
| Startzeit | langsamer | **schneller** |
| Zusatz | – | Bootplatte auf **SCSI**: **online vergrößerbar**, **Secure Boot**, **vTPM**, schnellerer Start |
| Support-Empfehlung | Nur wenn nötig (Altgast) | **Standard** |

### Legacy-Netzwerkadapter (Gen 1)
- **Emulierte DEC-21140-Karte**: langsam (100 Mbit/s), **CPU-lastig**, ohne VMQ/RSS.
- Nur nötig für **PXE-Boot** in Gen 1 oder für Gäste **ohne Integrationsdienste**.
- **Nach dem Start** wechselt man auf den **synthetischen** Adapter (Integrationsdienste laden).

### Konvertierung Gen 1 → Gen 2
Kein direkter Weg (Dateien, Firmware, Controller unterscheiden sich). Praktisch:
1. **Sicherung/Snapshot**, Anwendungen dokumentieren.
2. **Gast prüfen**: 64-Bit-Windows, aktuelle Version, Systemplatte **MBR**.
3. **MBR2GPT** im Gast (siehe BIOS/UEFI-Seite): **konvertiert die Partitionsstruktur**.
4. **Neue Gen-2-VM** anlegen, **VHDX** der alten VM **anhängen** (als SCSI-Datenträger) oder **Image** einspielen.
5. **UEFI-Einträge** anlegen (`bcdboot C:\Windows /s S: /f UEFI`).
6. Test, **Integrationsdienste**, **Secure Boot** einschalten.
Alternative: **Neuinstallation** oder **P2V/V2V**-Tool (Azure Migrate, Disk2vhd).

### Warum überhaupt Gen 1?
- **Alte Gäste** (Windows Server 2008 R2, 32-Bit-Anwendungen, Linux mit BIOS-Boot).
- **Import** von VMs aus alten Hyper-V- oder VMware-Umgebungen.
- **Legacy-Software**, die Diskette/COM erwartet.
Alles andere: **Gen 2**.

### Azure
**Azure-VMs** gibt es als **Gen 1** und **Gen 2**; Gen 2 bietet **UEFI**, **Trusted Launch (Secure Boot, vTPM)**, mehr Speicher, **NVMe** – für **Azure Site Recovery/Migrate** wichtig: Gen 1 lässt sich in Azure oft **nicht** in Gen 2 wandeln.

## Lab
**Maschinen**: **HOST** (Hyper-V-Host), **VM-GEN1**, **VM-GEN2**.

### GUI
1. **HOST**: Hyper-V-Manager → Aktion → **Neu → Virtueller Computer** → Bei **Generation angeben** **Generation 1** wählen → Namen `VM-GEN1`.
2. **HOST**: Wieder **Neu → Virtueller Computer** → **Generation 2** → `VM-GEN2`.
3. **HOST**: `VM-GEN1` → **Einstellungen → Hardware hinzufügen → Legacy-Netzwerkadapter** (nur Gen 1 verfügbar).
4. **HOST**: `VM-GEN2` → **Einstellungen → Sicherheit → Sicheren Start aktivieren** (Vorlage **Microsoft Windows**); für Linux **Microsoft UEFI-Zertifizierungsstelle**.
5. **HOST**: `VM-GEN2` → **Einstellungen → Firmware** → Startreihenfolge (SCSI, Netzwerk).
6. **VM-GEN2**: Windows installieren; `msinfo32` → **BIOS-Modus: UEFI**.

### PowerShell
```powershell
# Auf HOST – Generation prüfen
Get-VM | Select-Object Name, Generation, State
# Auf HOST – neue Gen-2-VM mit Secure Boot
New-VM -Name VM-GEN2 -Generation 2 -MemoryStartupBytes 4GB -NewVHDPath D:\VMs\VM-GEN2.vhdx -NewVHDSizeBytes 60GB -SwitchName "Extern"
Set-VMFirmware -VMName VM-GEN2 -EnableSecureBoot On -SecureBootTemplate MicrosoftWindows
Set-VMProcessor -VMName VM-GEN2 -Count 2
# Auf HOST – vTPM (für Windows 11)
Set-VMKeyProtector -VMName VM-GEN2 -NewLocalKeyProtector
Enable-VMTPM -VMName VM-GEN2
```

## Befehle
- `Get-VM \| Select Name, Generation` – Generation anzeigen
- `New-VM -Generation 2` – Gen-2-VM anlegen
- `Set-VMFirmware -EnableSecureBoot On` – Secure Boot für Gen 2
- `Enable-VMTPM` – vTPM einschalten (Gen 2)
- `Convert-VHD -Path a.vhd -DestinationPath a.vhdx` – VHD in VHDX wandeln
- `bcdboot C:\Windows /s S: /f UEFI` – Bootdateien in die ESP schreiben

## Einfach

Stell dir vor, du baust **ein Modellauto**:
- **Generation 1** ist der **alte Bausatz** mit **Kassettenrekorder** (IDE, BIOS, Diskette). Er passt zu **alten Autos** (Windows XP, 32-Bit).
- **Generation 2** ist der **neue Bausatz** mit **Bluetooth, Diebstahlschutz** (UEFI, Secure Boot, vTPM) und **großem Tank** (bis 64 TB). Er passt nur zu **neuen Autos** (64-Bit).

Wichtig: **Du kannst beim Bauen wählen, aber später nicht umbauen.** Also **immer Generation 2 wählen**, außer dein Gast ist alt und braucht den Rekorder.

Die **Legacy-Netzwerkkarte** ist ein **Steckerübersetzer**: Sie lässt alte Geräte ans Netz, aber ist **langsam** und **frisst Leistung**. Sobald das Auto läuft, tauscht man sie gegen den **schnellen Stecker** (synthetische Karte).

## Merksatz
- **Gen 1 = BIOS, IDE, MBR, Legacy-NIC. Gen 2 = UEFI, SCSI, GPT, Secure Boot.**
- **Generation ist nachträglich nicht änderbar.**
- Gen 2 = **nur 64-Bit-Gäste**.
- **Legacy-NIC** = emuliert, langsam, nur für PXE/alte Gäste.
- **Neue VMs immer Gen 2**.

## Prüfungsfalle
- **Gen 2 hat kein IDE, keine Diskette, keinen Legacy-Adapter**.
- **Secure Boot** bei Linux-VMs braucht die **Microsoft-UEFI-Zertifizierungsstelle**.
- **VHDX** ≠ Generation: VHDX geht auch in Gen 1, aber **Boot-VHDX max. 2 TB** (MBR).
- **Gen 1 → Gen 2 ist nicht per Schalter möglich**, sondern per Neuaufbau/Disk-Konvertierung.
- **vTPM** gibt es **nur in Gen 2**.

## Grafik
### Zwei Bausätze
Links Gen 1 mit Kassettenrekorder-Symbol und IDE-Kabel, rechts Gen 2 mit Schild (Secure Boot) und SCSI-Stecker. Ein Schieberegler „Gastalter“ zeigt, welche Gäste in welche Generation passen (XP nur links, Windows 11 nur rechts).

### Boot-Reihenfolge
Ein Balken zeigt den Bootweg: Gen 1 (BIOS → IDE → MBR), Gen 2 (UEFI → SCSI → ESP → signierter Bootloader).

## Karteikarten
- F: Welche Firmware nutzt Gen 1? | A: BIOS.
- F: Welche Firmware nutzt Gen 2? | A: UEFI.
- F: Von welchem Controller bootet Gen 1? | A: IDE.
- F: Von welchem Controller bootet Gen 2? | A: SCSI.
- F: Was ist ein Legacy-Netzwerkadapter? | A: Emulierte Netzwerkkarte für Gen 1 (PXE, alte Gäste), langsam.
- F: Kann man die Generation nachträglich ändern? | A: Nein.
- F: Welche Gäste laufen in Gen 2? | A: Nur 64-Bit-Systeme (Windows Server 2012+, Windows 8+, moderne Linux).
- F: Wie groß darf die Boot-VHDX bei Gen 2 sein? | A: Bis 64 TB.
- F: Welches Sicherheitsfeature gibt es nur in Gen 2? | A: Secure Boot, vTPM/Shielded VM.
- F: Wie prüft man die Generation per PowerShell? | A: `Get-VM \| Select Name, Generation`
- F: Welche Vorlage braucht eine Linux-Gen-2-VM für Secure Boot? | A: Microsoft UEFI-Zertifizierungsstelle.
- F: Wofür braucht man noch Gen 1? | A: Für alte 32-Bit-Gäste und BIOS-abhängige Systeme.

## Quiz
? Welche Firmware nutzt Hyper-V Generation 2?
* UEFI
- BIOS
- CSM
- Open Firmware

? Wovon bootet eine Gen-1-VM?
* IDE
- SCSI
- NVMe
- USB

? Welches Feature gibt es nur in Gen 2?
* Secure Boot
- Legacy-Netzwerkadapter
- Diskettenlaufwerk
- IDE-Controller

? Kann man die Generation einer bestehenden VM ändern?
* Nein
- Ja, in den Einstellungen
- Ja, per Set-VM
- Nur unter Server 2025

? Welche Gäste laufen in Gen 2?
* Nur 64-Bit
- Nur 32-Bit
- Nur Linux
- Nur Windows XP

? Wofür dient der Legacy-Netzwerkadapter hauptsächlich?
* PXE-Boot und alte Gäste ohne Integrationsdienste
- Höhere Geschwindigkeit
- SR-IOV
- Live-Migration
