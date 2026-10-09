---
id: server-hyperv-generationen
bereich: AZ-800
block: HV
kapitel: Hyper-V vertieft
titel: Generation 1 vs. Generation 2 – BIOS/UEFI, Secure Boot, vTPM, Boot-Geräte
stufe: Fortgeschritten
fach: Windows Server / AZ-800
pruefungen: [AZ-800, AP2, Schule]
quellen: [Microsoft Learn – Hyper-V-Dokumentation, AZ-800 Study Guide]
verweise: [az800-vhdx, az800-integrationsdienste, az800-azure-vms, az800-nested, server-hyperv-nested-grundlagen, server-hyperv-vswitch-vlan]
---

## Profi

### Grundidee
Beim Anlegen einer Hyper-V-VM wählt man die **Generation**. Sie bestimmt die **virtuelle Hardware und Firmware**, die der Gast sieht – und lässt sich **nach dem Erstellen nicht mehr ändern**.

| Merkmal | **Generation 1** | **Generation 2** |
|---|---|---|
| Firmware | **BIOS** (Legacy) | **UEFI** |
| Boot-Datenträger | **IDE**-Controller (VHD/VHDX), IDE-DVD | **SCSI**-Controller (nur **VHDX**), SCSI-DVD (ISO) |
| Partitionsstil Systemdatenträger | MBR | **GPT** |
| max. Größe Startdatenträger | 2 TB (IDE) | **64 TB** (VHDX an SCSI) |
| Netzwerk-Boot (PXE) | nur mit **Ältere Netzwerkkarte** (*Legacy Network Adapter*, emuliert) | mit der **synthetischen Standard-Netzwerkkarte** (IPv4 und IPv6) |
| Secure Boot | nein | **ja** (Standard: an) |
| vTPM | nein | **ja** (Schlüsselschutz nötig) |
| Abgeschirmte VMs (*Shielded VMs*) | nein | ja |
| Emulierte Altgeräte | Diskette, COM-Ports, PS/2, emulierte NIC, IDE | keine (COM-Ports nur per PowerShell als Named Pipe) |
| Gastbetriebssysteme | 32- und 64-Bit, auch sehr alte OS | nur **64-Bit**-Systeme mit UEFI-Unterstützung (Windows 8/Server 2012 und neuer, viele aktuelle Linux-Distributionen) |
| VHD-Format | VHD und VHDX | **nur VHDX** |
| Start-/Installationsgeschwindigkeit | langsamer (Emulation) | schneller (synthetische Geräte) |

Merke: Gen 2 verzichtet auf emulierte Altgeräte – fast alles ist **synthetisch** (VMBus).

### Secure Boot und Vorlagen
**Sicherer Start** (*Secure Boot*) prüft beim Booten die Signatur des Bootloaders gegen die Zertifikate in der UEFI-Datenbank der VM. Hyper-V bringt **Vorlagen** (*Secure Boot Templates*) mit:

| Vorlage | Zweck |
|---|---|
| **MicrosoftWindows** | Standard, nur von Microsoft für Windows signierte Bootloader |
| **MicrosoftUEFICertificateAuthority** | **Linux** und andere Systeme, deren Bootloader (meist **shim**) über die Microsoft UEFI CA signiert ist (Ubuntu, RHEL, SUSE, Debian …) |
| **OpenSourceShieldedVM** | Linux in **abgeschirmten VMs** |

Typischer Fehler: Linux-ISO bootet in Gen-2-VM nicht („The image's hash and certificate are not allowed“) → Vorlage auf **MicrosoftUEFICertificateAuthority** stellen oder Secure Boot ausschalten.
```powershell
Set-VMFirmware -VMName LNX01 -EnableSecureBoot On -SecureBootTemplate MicrosoftUEFICertificateAuthority
Get-VMFirmware -VMName LNX01 | Select-Object VMName, SecureBoot, SecureBootTemplate
```

### vTPM (virtuelles Trusted Platform Module)
- Nur **Gen 2**. Ermöglicht **BitLocker** im Gast, **Windows 11** (TPM 2.0 Pflicht), Measured Boot, Credential Guard mit TPM-Schutz.
- Voraussetzung: **Schlüsselschutz** (*Key Protector*). Auf einem Einzelhost: lokaler Schlüsselschutz (*Local Key Protector*, „Untrusted Guardian“). In Unternehmen mit abgeschirmten VMs: **Host Guardian Service**.
- Bei Live-Migration/Export muss der Zielhost den Schlüsselschutz entschlüsseln können (bei lokalem Guardian: Zertifikat exportieren/importieren).
```powershell
Set-VMKeyProtector -VMName WIN11-01 -NewLocalKeyProtector
Enable-VMTPM -VMName WIN11-01
```
GUI: Einstellungen → **Sicherheit** → „Sicheren Start aktivieren“, Vorlage wählen, „Trusted Platform Module aktivieren“.

### Boot-Reihenfolge
- Gen 1: `Set-VMBios -VMName VM1 -StartupOrder @("CD","IDE","LegacyNetworkAdapter","Floppy")`
- Gen 2: `Set-VMFirmware -VMName VM2 -FirstBootDevice (Get-VMDvdDrive -VMName VM2)` bzw. `-BootOrder`.

### PXE in Generation 2
Gen 2 bootet per PXE über die normale (synthetische) Netzwerkkarte – **UEFI-PXE**. Der Bereitstellungsserver (WDS/MECM) muss **UEFI-Bootimages** liefern (Datei z. B. `boot\x64\wdsmgfw.efi`). Gen 1 braucht dafür die **Ältere Netzwerkkarte**, die langsamer ist (emuliert, 100 Mbit/s-Klasse) und nach der Installation meist durch eine synthetische ersetzt wird.

### Keine Konvertierung durch Hyper-V
Hyper-V bietet **keine** Funktion, eine Gen-1-VM in Gen 2 umzuwandeln. Weg in der Praxis:
1. Im **Gast** den Systemdatenträger von MBR nach GPT umwandeln (Windows: `mbr2gpt.exe /convert /allowFullOS`, ab Windows 10 1703 bzw. Server 2019 enthalten) – vorher Sicherung!
2. Falls nötig VHD → VHDX konvertieren (`Convert-VHD`).
3. **Neue** Gen-2-VM anlegen und die vorhandene VHDX an den **SCSI**-Controller hängen, Boot-Reihenfolge setzen.
4. Testen, alte VM entfernen.
Ein früher von Microsoft-Mitarbeitern veröffentlichtes Skript (Convert-VMGeneration) war **nicht offiziell unterstützt**. Prüfungsantwort: „Gen 1 → Gen 2 geht nur durch **Neuanlage**.“

### Wann ist Gen 1 noch nötig?
- **32-Bit-Gastbetriebssysteme** (z. B. alte 32-Bit-Windows, Spezialsysteme).
- **Alte Betriebssysteme** ohne UEFI-Unterstützung (z. B. Windows Server 2008 / Windows 7 im Legacy-Betrieb, alte Linux-Kernel, FreeBSD-Versionen ohne Gen-2-Support).
- **Appliances**, die nur als **VHD mit BIOS-Boot** ausgeliefert werden.
- PXE-Umgebungen, die **nur BIOS-Bootimages** anbieten.
- Software, die Diskette oder emulierte COM-Hardware erwartet.

Für alles Neue gilt: **Gen 2** (Pflicht für Windows 11 mit vTPM, Secure Boot, abgeschirmte VMs). In Azure werden beide Generationen unterstützt; viele neue Größen und Funktionen (z. B. Trusted Launch) setzen **Gen 2** voraus.

### Nested und Generation
Verschachtelte Virtualisierung funktioniert mit **beiden** Generationen. Empfehlung für Labs: Gen 2, damit L1 Secure Boot/vTPM und VBS nutzen kann.

## Einfach

Stell dir vor, du kaufst ein **Auto**. Es gibt zwei Modelle:

- **Generation 1** ist ein **Oldtimer-Nachbau**: mit Kurbelfenstern, Kassettendeck und Diskettenschacht. Er versteht alte Technik (BIOS), alte Kassetten (IDE, VHD) und auch ganz alte Fahrer (32-Bit-Systeme). Dafür ist er langsamer und hat **keine Wegfahrsperre**.
- **Generation 2** ist ein **modernes Auto**: Startknopf (UEFI), schnelle Elektronik (SCSI, synthetische Geräte), **Wegfahrsperre** (*Secure Boot*), die nur den passenden Schlüssel annimmt, und ein **Tresor im Handschuhfach** (*vTPM*) für Geheimnisse wie den BitLocker-Schlüssel.

**Die Wegfahrsperre hat Schlüssel-Listen (Vorlagen):** Die Liste „MicrosoftWindows“ kennt nur Windows-Schlüssel. Willst du mit **Linux** losfahren, brauchst du die Liste „**MicrosoftUEFICertificateAuthority**“ – sonst springt das Auto nicht an.

**Netzwerkstart (PXE)**: Der Oldtimer kann nur mit einer speziellen „alten Netzwerkkarte“ übers Netz starten. Das moderne Auto kann das mit seiner normalen Netzwerkkarte.

**Umbauen geht nicht**: Aus einem Oldtimer wird durch Hyper-V kein modernes Auto. Man muss ein **neues** Auto kaufen (neue Gen-2-VM) und den Kofferraum (die Festplatte, vorher umgebaut auf GPT) umladen.

**Wann nimmt man trotzdem den Oldtimer?** Wenn der Fahrer nur Oldtimer kann – z. B. ein uraltes 32-Bit-Programm oder Betriebssystem.

## Merksatz
- **Gen 1 = BIOS + IDE, Gen 2 = UEFI + SCSI.**
- Linux mit Secure Boot → **MicrosoftUEFICertificateAuthority**.
- vTPM und Shielded VMs **nur Gen 2**; vTPM braucht Schlüsselschutz.
- PXE: Gen 1 Ältere Netzwerkkarte, Gen 2 normale Netzwerkkarte.
- Generation ist **nicht änderbar** – nur Neuanlage.
- 32-Bit-Gast → Gen 1.

## Prüfungsfalle
- „Gen-1-VM in Hyper-V-Manager auf Gen 2 umstellen“ gibt es nicht.
- Gen 2 bootet **nicht** von IDE und unterstützt **kein VHD** – nur VHDX.
- Linux-Boot scheitert an Secure Boot mit der Vorlage **MicrosoftWindows** – nicht am vSwitch oder an den Integrationsdiensten.
- vTPM aktivieren ohne Schlüsselschutz schlägt fehl → zuerst `Set-VMKeyProtector -NewLocalKeyProtector`.
- Gen 2 und PXE: Der WDS-Server muss **UEFI**-Bootdateien anbieten.
- Windows 11 als Gast verlangt TPM 2.0 und Secure Boot → Gen 2 mit vTPM.

## Grafik
### Bootvorgang Gen 2 mit Secure Boot
1. VM: UEFI-Firmware startet
2. UEFI -> Bootloader: Signaturprüfung gegen Vorlage
3. UEFI: MicrosoftWindows erlaubt nur Windows-Bootloader
4. Bootloader -> Kernel: shim prüft den Linux-Kernel (bei UEFI-CA-Vorlage)
5. Kernel: Betriebssystem startet

### PXE-Start im Vergleich
1. Gen1-VM -> WDS: PXE über Ältere Netzwerkkarte (BIOS-Bootimage)
2. Gen2-VM -> WDS: PXE über synthetische Netzwerkkarte
3. WDS -> Gen2-VM: UEFI-Bootdatei wdsmgfw.efi

## Lab
**Maschinen**: Host **HV01.example.com** (Windows Server 2025), neue VMs **WIN11-01** (Windows 11, Gen 2, vTPM), **LNX01** (Ubuntu Server, Gen 2), **LEGACY32** (32-Bit-Altsystem, Gen 1), Bereitstellungsserver **WDS01.example.com**.

### GUI
1. **HV01**: Hyper-V-Manager → Neu → Virtueller Computer → Name **WIN11-01** → **Generation 2** → 4096 MB → Netzwerk „LAN“ → neue VHDX 80 GB → ISO.
2. **HV01**: WIN11-01 → Einstellungen → **Sicherheit** → Sicherer Start aktiv, Vorlage „Microsoft Windows“ → „**Trusted Platform Module aktivieren**“ → OK → Windows 11 installieren.
3. **HV01**: Neue VM **LNX01**, Generation 2 → Einstellungen → Sicherheit → Vorlage „**Microsoft UEFI-Zertifizierungsstelle**“ → Ubuntu-ISO booten.
4. **HV01**: Neue VM **LEGACY32**, **Generation 1** → Einstellungen → Hardware hinzufügen → „Ältere Netzwerkkarte“ → BIOS → Startreihenfolge „Ältere Netzwerkkarte“ nach oben → PXE-Start gegen WDS01 testen.
5. **HV01**: Bei WIN11-01 Einstellungen → Firmware → Startreihenfolge: DVD vor Festplatte.

### PowerShell
```powershell
# Auf HV01.example.com
New-VM -Name WIN11-01 -Generation 2 -MemoryStartupBytes 4GB -SwitchName LAN -NewVHDPath D:\VMs\WIN11-01.vhdx -NewVHDSizeBytes 80GB
Add-VMDvdDrive -VMName WIN11-01 -Path D:\ISO\Win11.iso
Set-VMFirmware -VMName WIN11-01 -FirstBootDevice (Get-VMDvdDrive -VMName WIN11-01)
Set-VMKeyProtector -VMName WIN11-01 -NewLocalKeyProtector
Enable-VMTPM -VMName WIN11-01
Get-VMSecurity -VMName WIN11-01

New-VM -Name LNX01 -Generation 2 -MemoryStartupBytes 2GB -SwitchName LAN -NewVHDPath D:\VMs\LNX01.vhdx -NewVHDSizeBytes 40GB
Set-VMFirmware -VMName LNX01 -EnableSecureBoot On -SecureBootTemplate MicrosoftUEFICertificateAuthority

New-VM -Name LEGACY32 -Generation 1 -MemoryStartupBytes 1GB -NewVHDPath D:\VMs\LEGACY32.vhdx -NewVHDSizeBytes 20GB
Add-VMNetworkAdapter -VMName LEGACY32 -IsLegacy $true -SwitchName LAN
Set-VMBios -VMName LEGACY32 -StartupOrder @("LegacyNetworkAdapter","IDE","CD","Floppy")

Get-VM | Select-Object Name, Generation, Version
```

## Legende
### Generation 2
- Was: VM-Typ mit UEFI-Firmware und synthetischer Hardware.
- Wie: Beim Anlegen wählen (`New-VM -Generation 2`), später nicht änderbar.
- Wann: Für alle aktuellen 64-Bit-Gäste, Windows 11, Secure Boot, vTPM, Shielded VMs.
- Wo: Hyper-V-Manager-Assistent „Generation angeben“ bzw. New-VM.
- Warum: Sicherer (Secure Boot, vTPM), schneller, größere Startdatenträger (64 TB).
### Secure-Boot-Vorlage
- Was: Liste der vertrauenswürdigen Zertifikate für den Bootloader.
- Wie: `Set-VMFirmware -SecureBootTemplate` oder Einstellungen → Sicherheit.
- Beispiel: MicrosoftWindows für Windows, MicrosoftUEFICertificateAuthority für Linux, OpenSourceShieldedVM für abgeschirmte Linux-VMs.
- Warum: Verhindert das Starten manipulierter Bootloader (Bootkits).

## Karteikarten
- F: Welche Firmware nutzt Gen 1, welche Gen 2? | A: Gen 1 BIOS, Gen 2 UEFI.
- F: Von welchem Controller bootet eine Gen-2-VM? | A: Vom SCSI-Controller (VHDX oder ISO).
- F: Welche Secure-Boot-Vorlage braucht eine Ubuntu-VM? | A: MicrosoftUEFICertificateAuthority.
- F: Welche Vorlage ist für abgeschirmte Linux-VMs gedacht? | A: OpenSourceShieldedVM.
- F: Was ist vor Enable-VMTPM nötig? | A: Ein Schlüsselschutz, z. B. Set-VMKeyProtector -NewLocalKeyProtector.
- F: Wie bootet eine Gen-1-VM per PXE? | A: Über die Ältere Netzwerkkarte (Legacy Network Adapter).
- F: Wie bootet eine Gen-2-VM per PXE? | A: Über die synthetische Standard-Netzwerkkarte (UEFI-PXE).
- F: Kann Hyper-V eine Gen-1-VM in Gen 2 umwandeln? | A: Nein – nur Neuanlage einer Gen-2-VM mit vorher auf GPT konvertiertem Datenträger.
- F: Welches Werkzeug konvertiert im Windows-Gast MBR nach GPT? | A: mbr2gpt.exe (/convert /allowFullOS).
- F: Nenne zwei Gründe für Gen 1. | A: 32-Bit-Gastbetriebssystem, altes OS ohne UEFI, Appliance nur als VHD/BIOS, PXE-Umgebung nur mit BIOS-Images.
- F: Welches Dateiformat unterstützt Gen 2 für virtuelle Festplatten? | A: Nur VHDX.
- F: Maximale Größe des Startdatenträgers Gen 1 vs. Gen 2? | A: Gen 1 (IDE) 2 TB, Gen 2 (VHDX an SCSI) 64 TB.

## Quiz
? Eine Ubuntu-Installation in einer neuen Gen-2-VM bricht direkt nach dem Start mit einer Secure-Boot-Meldung ab. Was ist die beste Lösung?
* Secure-Boot-Vorlage auf MicrosoftUEFICertificateAuthority stellen
- Die VM in Generation 1 umwandeln
- MAC-Spoofing aktivieren
- Integrationsdienste deaktivieren
! Linux-Bootloader (shim) sind über die Microsoft UEFI CA signiert; die Standardvorlage MicrosoftWindows lässt sie nicht zu.

? Welche Aussage über Generation-2-VMs ist richtig?
* Sie booten per PXE über die synthetische Standard-Netzwerkkarte
- Sie booten von einem IDE-Controller
- Sie unterstützen VHD-Dateien als Startdatenträger
- Sie unterstützen 32-Bit-Gastbetriebssysteme
! Gen 2 hat keine emulierten Altgeräte; PXE läuft über die normale synthetische NIC.

? Ein Admin möchte eine bestehende Gen-1-VM auf Gen 2 umstellen. Was ist richtig?
* Es gibt keine Hyper-V-Funktion dafür; man legt eine neue Gen-2-VM an und übernimmt den auf GPT konvertierten Datenträger
- Set-VM -Generation 2 bei ausgeschalteter VM
- Update-VMVersion konvertiert automatisch
- Im Hyper-V-Manager unter Firmware umschalten
! Die Generation wird beim Erstellen festgelegt und kann nicht geändert werden.

? Welche Voraussetzung muss vor Enable-VMTPM erfüllt sein?
* Ein Schlüsselschutz (Key Protector) für die VM
- Eine Gen-1-VM
- Ein aktivierter Dynamic Memory
- Ein externer vSwitch
! Ohne Key Protector kann der vTPM-Zustand nicht geschützt werden; im Einzelhost-Szenario genügt -NewLocalKeyProtector.

? Welcher Gast erfordert zwingend Generation 1?
* Ein 32-Bit-Betriebssystem
- Windows Server 2025
- Windows 11
- Ubuntu 24.04 LTS
! Gen 2 setzt 64-Bit-UEFI voraus.

? Wie startet eine Gen-1-VM über das Netzwerk (PXE)?
* Mit einer Älteren Netzwerkkarte (Legacy Network Adapter)
- Mit der synthetischen Netzwerkkarte
- Nur über iSCSI-Boot
- Gar nicht
! Das BIOS der Gen-1-VM kennt nur die emulierte Netzwerkkarte für PXE.

? Warum ist Windows 11 als Gast praktisch nur in einer Gen-2-VM sinnvoll installierbar?
* Windows 11 verlangt TPM 2.0 und Secure Boot, die nur Gen 2 bereitstellt
- Windows 11 kann nicht von IDE lesen
- Gen 1 unterstützt keine Netzwerkkarten
- Gen 1 hat maximal 1 GB RAM
! vTPM und Secure Boot gibt es nur bei Gen-2-VMs.

? Welches Cmdlet setzt bei einer Gen-2-VM das DVD-Laufwerk an die erste Stelle der Startreihenfolge?
* Set-VMFirmware -FirstBootDevice
- Set-VMBios -StartupOrder
- Set-VMDvdDrive -Boot $true
- Set-VMHost -BootOrder
! Set-VMBios gilt nur für Gen 1; Gen 2 nutzt Set-VMFirmware.

? Eine Gen-2-VM soll per WDS installiert werden, bekommt aber keine Bootdatei. Was ist wahrscheinlich?
* Der WDS-Server bietet keine UEFI-Bootimages an
- Die VM hat keine Ältere Netzwerkkarte
- Secure Boot verhindert jedes PXE
- Gen 2 unterstützt grundsätzlich kein PXE
! Gen 2 bootet per UEFI-PXE; der Server muss x64-UEFI-Bootdateien liefern.

? Welche Secure-Boot-Vorlage ist der Standard für neue Gen-2-VMs?
* MicrosoftWindows
- MicrosoftUEFICertificateAuthority
- OpenSourceShieldedVM
- Keine – Secure Boot ist standardmäßig aus
! Secure Boot ist bei Gen 2 standardmäßig aktiv mit der Vorlage MicrosoftWindows.

? Welches Werkzeug wird im Windows-Gast genutzt, um vor einem Umzug auf Gen 2 den Systemdatenträger umzuwandeln?
* mbr2gpt.exe
- diskpart convert dynamic
- Convert-VHD -VHDType Dynamic
- Optimize-VHD
! Gen 2 bootet per UEFI nur von GPT-Datenträgern; mbr2gpt wandelt ohne Datenverlust um (Sicherung vorher dennoch Pflicht).

? Welche Funktion bietet ausschließlich Generation 2?
* Virtuelles TPM
- Hot-Add von SCSI-Datenträgern
- Integrationsdienste
- Dynamischer Arbeitsspeicher
! Hot-Add an SCSI, Integrationsdienste und Dynamic Memory gibt es in beiden Generationen; vTPM nur in Gen 2.

? Welche maximale Größe hat ein Startdatenträger (VHDX) einer Gen-2-VM?
* 64 TB
- 2 TB
- 127 GB
- 16 TB
! VHDX unterstützt bis 64 TB; Gen 1 ist beim IDE-Startdatenträger auf 2 TB begrenzt.

## Lücken
- Generation 1 nutzt {BIOS} und bootet von {IDE}, Generation 2 nutzt {UEFI} und bootet von {SCSI}.
- Für Linux mit Secure Boot wählt man die Vorlage {MicrosoftUEFICertificateAuthority}.
- Vor Enable-VMTPM braucht die VM einen {Schlüsselschutz|Key Protector}, z. B. mit {Set-VMKeyProtector}.

## Zuordnen
### Merkmal und Generation
- BIOS und IDE-Boot => Generation 1
- Ältere Netzwerkkarte für PXE => Generation 1
- vTPM und Shielded VM => Generation 2
- Startdatenträger bis 64 TB => Generation 2
- 32-Bit-Gastbetriebssystem => Generation 1
- Secure Boot mit Vorlagen => Generation 2

## Reihenfolge
### Gen-1-VM durch Gen-2-VM ersetzen
1. Vollständige Sicherung der Gen-1-VM erstellen
2. Im Gast mbr2gpt.exe /validate und /convert ausführen
3. VM herunterfahren und ggf. VHD mit Convert-VHD in VHDX umwandeln
4. Neue Gen-2-VM ohne Datenträger anlegen
5. VHDX an den SCSI-Controller anhängen und Startreihenfolge setzen
6. Starten, testen und alte VM entfernen

## Freitext
- F: Nennen Sie vier Unterschiede zwischen Gen-1- und Gen-2-VMs. | M: BIOS vs. UEFI; IDE- vs. SCSI-Boot; PXE nur mit Älterer Netzwerkkarte vs. synthetische NIC; kein vs. Secure Boot/vTPM; 32-Bit möglich vs. nur 64-Bit; VHD und VHDX vs. nur VHDX; Startdatenträger 2 TB vs. 64 TB | P: 4
- F: Erläutern Sie, warum eine Linux-VM in Gen 2 nicht startet, und nennen Sie zwei Lösungen. | M: Secure Boot mit Vorlage MicrosoftWindows akzeptiert nur Windows-Bootloader; Lösung: Vorlage MicrosoftUEFICertificateAuthority setzen oder Secure Boot deaktivieren | P: 4

## Szenario
### Neue Client-VMs für die Schulung
Für einen Windows-11-Kurs sollen auf **HV01.example.com** zehn VMs **W11-01** bis **W11-10** entstehen, die per PXE vom **WDS01.example.com** installiert werden. Zusätzlich gibt es eine alte 32-Bit-Laborsoftware auf einer Appliance als VHD.
- F: Welche Generation wählen Sie für die Windows-11-VMs und warum? | A: Generation 2 – Windows 11 verlangt TPM 2.0 und Secure Boot, die nur Gen 2 mit vTPM bietet | P: 2
- F: Was ist vor dem Aktivieren des vTPM zu tun? | A: Schlüsselschutz setzen: Set-VMKeyProtector -VMName W11-01 -NewLocalKeyProtector, dann Enable-VMTPM | P: 2
- F: Welche Anforderung stellt PXE an WDS01? | A: UEFI-Bootimages (x64 UEFI) bereitstellen; die Gen-2-VMs booten über die normale Netzwerkkarte | P: 2
- F: Welche Generation braucht die Appliance? | A: Generation 1 – 32-Bit, BIOS-Boot und VHD-Format | P: 2
- F: Wie legen Sie alle zehn VMs per PowerShell an? | A: 1..10 \| ForEach-Object { New-VM -Name ("W11-{0:D2}" -f $_) -Generation 2 -MemoryStartupBytes 4GB -SwitchName LAN -NewVHDPath ("D:\VMs\W11-{0:D2}.vhdx" -f $_) -NewVHDSizeBytes 80GB } | P: 2

## Spickzettel
- Gen 1: BIOS, IDE, Legacy-NIC-PXE, VHD/VHDX, 32-Bit ok
- Gen 2: UEFI, SCSI, PXE synthetisch, nur VHDX, 64 TB, Secure Boot, vTPM
- Vorlagen: MicrosoftWindows, MicrosoftUEFICertificateAuthority (Linux), OpenSourceShieldedVM
- vTPM: Set-VMKeyProtector -NewLocalKeyProtector, Enable-VMTPM
- Gen 1 → Gen 2: nur Neuanlage (mbr2gpt)
