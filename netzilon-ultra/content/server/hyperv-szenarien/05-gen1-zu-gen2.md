---
id: server-hvsz-05
bereich: AZ-800
block: HV-S
kapitel: Hyper-V-Praxisszenarien
titel: Szenario 05 – Alte Gen-1-VM soll UEFI, Secure Boot und vTPM bekommen
stufe: Profi
fach: Windows Server / AZ-800
pruefungen: [AZ-800, AP2, Schule]
quellen: [Microsoft Learn – Hyper-V]
verweise: [az800-vhdx, az800-integrationsdienste, server-hvsz-06]
---

## Profi

### Ticket
**Kunde meldet:** „Unser Applikationsserver soll BitLocker mit TPM bekommen und Windows-11-ähnliche Sicherheitsanforderungen erfüllen. In den VM-Einstellungen gibt es aber weder Secure Boot noch TPM.“
- Datum/Priorität: 09.10.2026, **Priorität 3 (normal)**, Wartungsfenster Samstag.
- Betroffene Maschine: VM **APP01** (Generation **1**) auf **HV01.example.com**.

### Ausgangslage
- Host **HV01.example.com**, Server 2025. APP01: Gen 1, Windows Server 2022, Startdatenträger `D:\VMs\APP01\APP01.vhdx` am **IDE-Controller 0**, MBR-Partitionsstil, IP 192.168.10.31.
- Die VM wurde vor Jahren als Gen 1 angelegt. Gen 1 = BIOS-Firmware, kein Secure Boot, kein vTPM.

### Analyse
Die **Generation** einer VM wird beim Erstellen festgelegt und lässt sich **nicht nachträglich ändern** – es gibt keine In-place-Konvertierung im Hyper-V-Manager. Secure Boot und **virtuelles TPM** gibt es nur bei **Generation 2** (UEFI). Gen 2 bootet nur von **GPT**-Datenträgern im **VHDX**-Format an einem **SCSI**-Controller.

| Prüfpunkt | Prüfung |
|---|---|
| Generation der VM | `Get-VM APP01 \| Select Generation` |
| Datenträgerformat VHD/VHDX | `Get-VHD -Path ...` (VhdFormat) |
| Partitionsstil MBR/GPT im Gast | `Get-Disk` in APP01 |
| Gast unterstützt Gen 2 (64 Bit, Server 2012+/Windows 8+) | Betriebssystemversion |
| MBR2GPT-Voraussetzungen (höchstens 3 primäre Partitionen, keine erweiterte Partition, BitLocker angehalten) | `mbr2gpt /validate /allowFullOS` |

### Lösungsweg
1. **Vollsicherung** von APP01 erstellen – Begründung: Die Partitionskonvertierung verändert den Datenträger; Rückweg nur über Backup.
2. **Im Gast APP01** `mbr2gpt /validate /allowFullOS` und danach `mbr2gpt /convert /allowFullOS` – Begründung: MBR2GPT wandelt den Systemdatenträger ohne Datenverlust in GPT um und legt eine EFI-Systempartition an. Laut Microsoft-Doku ist das Werkzeug für Windows 10/11 ab Version 1703 freigegeben; in Server-Gästen vorher an einer Kopie testen.
3. **APP01 herunterfahren**. Falls der Datenträger **.vhd** ist: `Convert-VHD` nach VHDX – Begründung: Gen 2 unterstützt kein VHD.
4. **Alte VM-Konfiguration notieren** (vCPU, RAM, MAC bei statischer MAC, VLAN, Switch) und **alte VM entfernen** (nur Konfiguration, VHDX bleibt) – Begründung: Die VHDX darf nicht von zwei VMs gleichzeitig verwendet werden.
5. **Neue Gen-2-VM APP01** anlegen, **vorhandene VHDX** am SCSI-Controller anhängen – Begründung: Gen 2 kennt nur SCSI.
6. **Secure Boot** (Vorlage *Microsoft Windows*) aktiv lassen, **Schlüsselschutzvorrichtung** anlegen und **vTPM aktivieren** – Begründung: vTPM braucht einen Key Protector.
7. **Startreihenfolge**: Festplatte zuerst, VM starten, Netzwerkkarte prüfen (neue vNIC = neue Netzwerkverbindung im Gast; IP neu eintragen, wenn statisch).

### Ergebnis prüfen
- `Get-VM APP01 | Select Generation` → **2**; `Get-VMFirmware APP01` → SecureBoot **On**.
- `Get-VMSecurity APP01` → **TpmEnabled : True**.
- Im Gast: `Confirm-SecureBootUEFI` → True, `Get-Tpm` → TpmPresent True; `msinfo32` zeigt BIOS-Modus **UEFI**.

### Vorbeugung
- Neue VMs immer als **Generation 2** anlegen (Ausnahme: sehr alte Gast-OS oder 32-Bit).
- VM-Vorlagen mit vTPM und Secure Boot pflegen.
- Bei vTPM: VM-Migration auf andere Hosts nur mit Zugriff auf den Schlüsselschutz planen (Guardian/Zertifikate mitnehmen).

## Einfach

Eine VM der **Generation 1** ist wie ein **altes Auto** mit Zündschlüssel (BIOS). Eine **Generation-2**-VM ist ein neues Auto mit **Startknopf, Wegfahrsperre und Tresor** (UEFI, Secure Boot, TPM).

Man kann einem alten Auto keinen neuen Startknopf „draufschrauben“ – die **Generation** steht im Fahrzeugbrief und bleibt. Was man aber machen kann: **den Motor ausbauen** (die Festplatte) und in ein **neues Auto** einbauen.

Damit der Motor ins neue Auto passt, muss er umgebaut werden:
- Die Festplatte bekommt eine neue **Inhaltsangabe** (von MBR auf GPT – das macht das Werkzeug **MBR2GPT**).
- Sie muss im **neuen Format** (VHDX) vorliegen.
- Sie wird an einen anderen **Anschluss** (SCSI statt IDE) gesteckt.

Dann baut man das neue Auto (Gen-2-VM), steckt den Motor rein, schaltet Wegfahrsperre (Secure Boot) und Tresor (vTPM) ein – und fährt los. Vorher natürlich ein **Ersatzteil** (Backup) zurücklegen!

## Merksatz
- Generation ist **fest** – keine Umwandlung in-place.
- Gen 2 = **UEFI + GPT + VHDX + SCSI**.
- `mbr2gpt /convert /allowFullOS` im Gast, dann neue Gen-2-VM mit alter VHDX.
- vTPM braucht eine **Schlüsselschutzvorrichtung** (Key Protector).

## Prüfungsfalle
- Es gibt **kein** Cmdlet `Set-VM -Generation 2`.
- Gen 2 bootet nicht von **VHD**-Dateien und nicht von **IDE**.
- MBR2GPT läuft **im Gast** (bzw. in WinPE), nicht auf dem Host.
- BitLocker vor MBR2GPT **anhalten** – sonst bricht die Validierung ab.
- `Enable-VMTPM` scheitert ohne vorher gesetzten Key Protector.

## Grafik
### Motor in neues Auto
1. APP01: Gen 1, BIOS, MBR, IDE
2. Admin -> APP01: Backup erstellen
3. APP01: mbr2gpt konvertiert Systemdatenträger zu GPT
4. Admin -> HV01: Alte VM-Konfiguration entfernen, VHDX bleibt
5. HV01 -> APP01-NEU: Gen-2-VM mit vorhandener VHDX am SCSI-Controller
6. HV01: Key Protector setzen und vTPM aktivieren
7. APP01-NEU: Bootet per UEFI mit Secure Boot

## Lab
**Maschinen**: Host **HV01.example.com**, Gen-1-VM **APP01** (Windows Server oder Windows 11 als Gast), Backup vorhanden.
Nachstellen: Zuerst den Fehler bewusst erzeugen, dann beheben.

### GUI
1. **HV01**: Hyper-V-Manager → Neu → Virtueller Computer → **Generation 1** → APP01 anlegen und Windows installieren (Fehlerzustand: Einstellungen zeigen keine Sicherheitsseite für Secure Boot/TPM).
2. **APP01**: Datenträgerverwaltung → Datenträger 0 → Eigenschaften → Volumes → Partitionsstil **MBR** notieren.
3. **APP01**: Eingabeaufforderung als Administrator → `mbr2gpt /validate /allowFullOS` → dann `mbr2gpt /convert /allowFullOS` → herunterfahren.
4. **HV01**: Hyper-V-Manager → APP01 → Einstellungen → IDE-Controller 0 → Festplatte → Pfad der VHDX notieren → VM **Löschen** (löscht nur die Konfiguration).
5. **HV01**: Neu → Virtueller Computer → Name APP01 → **Generation 2** → Arbeitsspeicher wie zuvor → Netzwerk wie zuvor → **Vorhandene virtuelle Festplatte verwenden** → VHDX auswählen → Fertig stellen.
6. **HV01**: APP01 → Einstellungen → **Sicherheit** → Sicherer Start aktivieren, Vorlage **Microsoft Windows** → **Trusted Platform Module aktivieren** → OK.
7. **HV01**: APP01 → Starten → Verbinden → Anmeldung prüfen.
8. **APP01**: `msinfo32` → BIOS-Modus **UEFI**, Sicherer Startzustand **Ein**; `tpm.msc` → TPM bereit.

### PowerShell
1. **APP01**: Partitionsstil prüfen und konvertieren.
2. **HV01**: Alte VM entfernen und Gen-2-VM anlegen.
3. **HV01**: Secure Boot, Key Protector und vTPM setzen.

```powershell
# In APP01 (Gast) – Zustand und Konvertierung
Get-Disk | Select-Object Number, PartitionStyle
mbr2gpt.exe /validate /allowFullOS
mbr2gpt.exe /convert /allowFullOS
Stop-Computer

# Auf HV01 – Fehlerbild zeigen und neue VM bauen
Get-VM -Name APP01 | Select-Object Name, Generation
$vhd = (Get-VMHardDiskDrive -VMName APP01).Path
Get-VHD -Path $vhd | Select-Object Path, VhdFormat
Remove-VM -Name APP01 -Force                  # entfernt nur die Konfiguration
New-VM -Name APP01 -Generation 2 -MemoryStartupBytes 8GB -VHDPath $vhd -SwitchName "LAN"
Set-VMProcessor -VMName APP01 -Count 4
Set-VMFirmware -VMName APP01 -EnableSecureBoot On -SecureBootTemplate MicrosoftWindows
Set-VMFirmware -VMName APP01 -FirstBootDevice (Get-VMHardDiskDrive -VMName APP01)
Set-VMKeyProtector -VMName APP01 -NewLocalKeyProtector
Enable-VMTPM -VMName APP01
Start-VM -Name APP01
Get-VMSecurity -VMName APP01
```

## Szenario
### Kontrollfragen
Die Gen-1-VM APP01 soll Secure Boot und ein virtuelles TPM erhalten. Der Datenträger ist MBR-partitioniert und hängt am IDE-Controller.
- F: Kann man APP01 direkt in Generation 2 umwandeln? | A: Nein, die Generation ist fest; man erstellt eine neue Gen-2-VM und verwendet die vorhandene VHDX.
- F: Welches Werkzeug wandelt den Systemdatenträger im Gast nach GPT? | A: MBR2GPT (mbr2gpt /convert /allowFullOS bzw. in WinPE).
- F: Welche Formate verlangt Gen 2 beim Startdatenträger? | A: VHDX, GPT-Partitionsstil, Anschluss am SCSI-Controller.
- F: Was ist vor Enable-VMTPM nötig? | A: Eine Schlüsselschutzvorrichtung, z. B. Set-VMKeyProtector -NewLocalKeyProtector.
- F: Warum vorher BitLocker anhalten? | A: MBR2GPT verlangt angehaltenes BitLocker, weil die Startumgebung geändert wird.

## Reihenfolge
### Von Gen 1 zu Gen 2
1. Vollsicherung der VM erstellen
2. Im Gast mbr2gpt /validate ausführen
3. Im Gast mbr2gpt /convert ausführen und herunterfahren
4. Bei VHD-Format nach VHDX konvertieren
5. Alte VM-Konfiguration entfernen
6. Neue Gen-2-VM mit vorhandener VHDX am SCSI-Controller anlegen
7. Secure Boot, Key Protector und vTPM einrichten
8. VM starten und UEFI/TPM im Gast prüfen

## Legende
### VM-Generation
- Was: Firmware-Typ einer VM: Gen 1 = BIOS mit emulierter Hardware, Gen 2 = UEFI mit synthetischer Hardware.
- Wie: wird beim Anlegen gewählt (`New-VM -Generation 2`), danach nicht änderbar.
- Wann: Gen 2 für alle aktuellen 64-Bit-Gäste; Gen 1 nur für alte oder 32-Bit-Betriebssysteme.
- Wo: Konfiguration der VM auf HV01.
- Warum: Nur Gen 2 bietet Secure Boot, vTPM, Boot von SCSI/Netzwerkkarte und größere Startdatenträger.

## Karteikarten
- F: Kann man die Generation einer VM nachträglich ändern? | A: Nein, nur durch Neuanlage einer VM mit der vorhandenen VHDX.
- F: Welche Sicherheitsfunktionen bietet nur Gen 2? | A: Secure Boot und virtuelles TPM (vTPM).
- F: Welcher Partitionsstil ist für den Gen-2-Start nötig? | A: GPT.
- F: Welches Werkzeug konvertiert MBR nach GPT ohne Datenverlust? | A: MBR2GPT.exe.
- F: Welcher Parameter erlaubt MBR2GPT im laufenden Windows? | A: /allowFullOS
- F: Welches Datenträgerformat unterstützt Gen 2? | A: Nur VHDX.
- F: An welchem Controller hängt der Startdatenträger bei Gen 2? | A: SCSI.
- F: Welche Cmdlets aktivieren vTPM? | A: Set-VMKeyProtector -NewLocalKeyProtector und Enable-VMTPM.
- F: Welche Secure-Boot-Vorlage für Windows-Gäste? | A: MicrosoftWindows.

## Quiz
? Wie bekommt eine Gen-1-VM Secure Boot?
* Neue Gen-2-VM anlegen und die konvertierte VHDX verwenden
- Set-VM -Generation 2
- Set-VMFirmware -EnableSecureBoot On an der Gen-1-VM
- Integrationsdienste aktualisieren
! Die Generation ist unveränderlich.

? Welches Werkzeug wandelt den Systemdatenträger im Gast nach GPT?
* MBR2GPT
- Convert-VHD
- diskpart convert dynamic
- Resize-VHD
! Convert-VHD ändert nur das Dateiformat (VHD/VHDX), nicht den Partitionsstil.

? Wo wird MBR2GPT ausgeführt?
* Im Gastbetriebssystem bzw. in WinPE
- Auf dem Hyper-V-Host gegen die VHDX
- Im Hyper-V-Manager unter Datenträger bearbeiten
- Auf dem Domänencontroller
! MBR2GPT arbeitet auf dem Datenträger des laufenden Windows bzw. aus WinPE.

? Welche Kombination braucht der Startdatenträger einer Gen-2-VM?
* VHDX, GPT, SCSI
- VHD, MBR, IDE
- VHDX, MBR, IDE
- VHD, GPT, SCSI
! Gen 2 kennt kein IDE und kein VHD.

? Was ist vor Enable-VMTPM erforderlich?
* Ein Key Protector, z. B. Set-VMKeyProtector -NewLocalKeyProtector
- Eine Gen-1-VM
- Ein deaktiviertes Secure Boot
- Ein Hyper-V-Replikat
! vTPM benötigt eine Schlüsselschutzvorrichtung.

? Was muss vor MBR2GPT mit BitLocker geschehen?
* BitLocker anhalten
- BitLocker dauerhaft entschlüsseln ist Pflicht
- Nichts
- TPM löschen
! Laut Doku muss BitLocker angehalten sein.

? Welche Secure-Boot-Vorlage passt für einen Windows-Gast?
* MicrosoftWindows
- MicrosoftUEFICertificateAuthority
- OpenSourceShieldedVM
- Keine Vorlage
! Linux-Gäste nutzen meist MicrosoftUEFICertificateAuthority.

? Was passiert bei Remove-VM mit der VHDX?
* Sie bleibt erhalten, nur die Konfiguration wird entfernt
- Sie wird gelöscht
- Sie wird zu AVHDX
- Sie wird nach VHD konvertiert
! Remove-VM löscht keine virtuellen Festplatten.
