---
id: server-hvsz-06
bereich: AZ-800
block: HV-S
kapitel: Hyper-V-Praxisszenarien
titel: Szenario 06 – Linux-Gen-2-VM bootet nicht (Secure-Boot-Vorlage)
stufe: Einsteiger
fach: Windows Server / AZ-800
pruefungen: [AZ-800, AP2, Schule]
quellen: [Microsoft Learn – Hyper-V]
verweise: [az800-integrationsdienste, server-hvsz-05]
---

## Profi

### Ticket
**Kunde meldet:** „Die neue Ubuntu-VM für den Monitoring-Server bootet nicht vom ISO. Es kommt nur ein schwarzer Bildschirm mit einer Meldung über eine fehlgeschlagene Signaturprüfung.“
- Datum/Priorität: 01.10.2026, **Priorität 3 (normal)**.
- Betroffene Maschine: VM **LNX01** (Generation 2) auf **HV01.example.com**.
- Meldung in der VM-Konsole (sinngemäß): *„The image's hash and certificate are not allowed (DB).“* bzw. „Der Startvorgang ist aufgrund einer Sicherheitsrichtlinie fehlgeschlagen“, anschließend Boot-Zusammenfassung „kein Betriebssystem geladen“.

### Ausgangslage
- Host **HV01.example.com**, Server 2025, externer vSwitch **LAN**.
- LNX01: Gen 2, 4 GB RAM, ISO Ubuntu Server LTS am SCSI-DVD-Laufwerk, neue 40-GB-VHDX, geplante IP 192.168.10.60.
- Secure Boot ist aktiviert mit Vorlage **Microsoft Windows** (Standard bei neuen Gen-2-VMs).

### Analyse
Bei **Secure Boot** prüft die UEFI-Firmware die Signatur des Bootloaders gegen die hinterlegte Zertifikatsdatenbank. Die Vorlage **MicrosoftWindows** vertraut nur dem Windows-Produktionszertifikat. Linux-Distributionen booten über einen **shim**-Bootloader, der von der **Microsoft UEFI Certificate Authority** (Drittanbieter-CA) signiert ist. Mit der Windows-Vorlage wird dieser abgelehnt.

| Hypothese | Prüfung |
|---|---|
| Falsche Secure-Boot-Vorlage | `Get-VMFirmware -VMName LNX01 \| Select SecureBoot, SecureBootTemplate` |
| Distribution ohne Secure-Boot-Unterstützung (kein signierter shim) | Hersteller-Doku der Distribution |
| ISO nicht eingebunden / falsche Startreihenfolge | `Get-VMFirmware ... \| Select -Expand BootOrder` |
| Gen-1-ISO/32-Bit-Image | Image-Typ prüfen (Gen 2 braucht 64-Bit-UEFI-Boot) |

**Befund:** SecureBootTemplate = **MicrosoftWindows**.

### Lösungsweg
1. **LNX01 ausschalten** – Begründung: Firmware-Einstellungen sind nur bei ausgeschalteter VM änderbar.
2. **Vorlage auf MicrosoftUEFICertificateAuthority** umstellen – Begründung: vertraut dem shim der gängigen Distributionen (Ubuntu, RHEL, SUSE, Debian …). **Secure Boot bleibt aktiv** – Sicherheit bleibt erhalten.
3. Nur falls die Distribution **keinen** signierten Bootloader hat: Secure Boot deaktivieren – Begründung: letzter Ausweg, da Schutz gegen Bootkits entfällt.
4. **Startreihenfolge** prüfen: DVD vor Festplatte für die Installation.
5. VM starten, installieren; anschließend sicherstellen, dass die **Hyper-V-Treiber** (im Linux-Kernel enthaltene LIS-Module wie hv_vmbus, hv_netvsc, hv_storvsc) geladen sind.

### Ergebnis prüfen
- LNX01 bootet ins Ubuntu-Setup.
- Nach der Installation: `mokutil --sb-state` im Gast → *SecureBoot enabled*.
- `lsmod | grep hv_` zeigt die Hyper-V-Module; Netzwerk über hv_netvsc aktiv.

### Vorbeugung
- Beim Anlegen von Linux-VMs direkt die Vorlage **Microsoft UEFI Certificate Authority** wählen (Assistent: nach dem Anlegen unter Einstellungen → Sicherheit).
- Interne VM-Vorlagen getrennt nach Windows und Linux pflegen.
- Dokumentieren, welche Distributionen Secure Boot unterstützen.

## Einfach

Stell dir vor, an der Tür der VM steht ein **Türsteher** (Secure Boot). Er lässt nur Leute mit einem **gültigen Ausweis** rein. Der Türsteher hat eine **Liste**, welche Ausweise er anerkennt.

Mit der Liste „**Microsoft Windows**“ erkennt er nur **Windows-Ausweise**. Linux kommt mit einem Ausweis, den eine andere Stelle ausgestellt hat (die **Microsoft UEFI-Zertifizierungsstelle** für Drittanbieter). Der Türsteher sagt: „Kenne ich nicht – draußen bleiben!“ – und die VM startet nicht.

Die Lösung ist nicht, den Türsteher nach Hause zu schicken (Secure Boot ausschalten), sondern ihm die **richtige Liste** zu geben: „Microsoft UEFI Certificate Authority“. Dann erkennt er den Linux-Ausweis und lässt ihn rein – und böse Eindringlinge ohne Ausweis bleiben trotzdem draußen.

Wichtig: Die Liste kann man nur austauschen, wenn die VM **ausgeschaltet** ist.

## Merksatz
- Windows-Gast → Vorlage **MicrosoftWindows**.
- Linux-Gast → Vorlage **MicrosoftUEFICertificateAuthority**.
- Erst Vorlage ändern, Secure Boot nur im Notfall abschalten.
- Firmware ändern → **VM aus**.

## Prüfungsfalle
- „Secure Boot deaktivieren“ ist nicht die beste Antwort, wenn die Distribution signiert ist – richtig ist die **Vorlage wechseln**.
- Gen-1-VMs haben gar kein Secure Boot – das Problem tritt nur bei **Gen 2** auf.
- Die Einstellung liegt im Bereich **Sicherheit** der VM, nicht unter **Firmware** (dort nur Startreihenfolge).

## Grafik
### Türsteher Secure Boot
1. LNX01 -> UEFI: shim-Bootloader mit Signatur der Microsoft UEFI CA
2. UEFI: Vorlage MicrosoftWindows – Signatur nicht in der Datenbank
3. UEFI -> LNX01: Start verweigert
4. Admin -> HV01: Vorlage auf MicrosoftUEFICertificateAuthority setzen
5. LNX01 -> UEFI: Gleicher Bootloader erneut
6. UEFI -> LNX01: Signatur gültig, Linux startet

## Lab
**Maschinen**: Host **HV01.example.com**, Gen-2-VM **LNX01** mit Linux-ISO (z. B. Ubuntu Server LTS).
Nachstellen: Zuerst den Fehler bewusst erzeugen, dann beheben.

### GUI
1. **HV01**: Hyper-V-Manager → Neu → Virtueller Computer → LNX01 → **Generation 2** → 4096 MB → Switch LAN → neue VHDX 40 GB → ISO auswählen → Fertig stellen.
2. **HV01**: LNX01 → Einstellungen → **Sicherheit** → Sicherer Start aktiv, Vorlage **Microsoft Windows** belassen (Fehlerzustand).
3. **HV01**: LNX01 → Starten → Verbinden → Fehlermeldung/Boot-Zusammenfassung ansehen.
4. **HV01**: LNX01 → **Ausschalten**.
5. **HV01**: LNX01 → Einstellungen → **Sicherheit** → Vorlage **Microsoft UEFI-Zertifizierungsstelle** → OK.
6. **HV01**: LNX01 → Einstellungen → **Firmware** → DVD-Laufwerk an erste Stelle → OK.
7. **HV01**: LNX01 → Starten → Ubuntu-Setup erscheint → installieren.
8. **LNX01**: `mokutil --sb-state` → SecureBoot enabled.

### PowerShell
1. **HV01**: Fehlerzustand herstellen und prüfen.
2. **HV01**: Vorlage ändern und Startreihenfolge setzen.
3. **LNX01**: Secure-Boot-Status prüfen.

```powershell
# Auf HV01 – Fehlerzustand
New-VM -Name LNX01 -Generation 2 -MemoryStartupBytes 4GB -NewVHDPath D:\VMs\LNX01\LNX01.vhdx -NewVHDSizeBytes 40GB -SwitchName "LAN"
Add-VMDvdDrive -VMName LNX01 -Path D:\ISO\ubuntu-server.iso
Set-VMFirmware -VMName LNX01 -EnableSecureBoot On -SecureBootTemplate MicrosoftWindows
Start-VM -Name LNX01                     # Boot scheitert
Get-VMFirmware -VMName LNX01 | Select-Object SecureBoot, SecureBootTemplate

# Auf HV01 – Beheben
Stop-VM -Name LNX01 -TurnOff
Set-VMFirmware -VMName LNX01 -SecureBootTemplate MicrosoftUEFICertificateAuthority
Set-VMFirmware -VMName LNX01 -FirstBootDevice (Get-VMDvdDrive -VMName LNX01)
Start-VM -Name LNX01

# In LNX01 (nach Installation, Bash)
# mokutil --sb-state
# lsmod | grep hv_
```

## Szenario
### Kontrollfragen
Eine neue Ubuntu-VM der Generation 2 bootet nicht vom ISO; Secure Boot ist mit der Standardvorlage aktiv.
- F: Was ist die Ursache? | A: Die Secure-Boot-Vorlage MicrosoftWindows vertraut dem von der Microsoft UEFI CA signierten Linux-Bootloader (shim) nicht.
- F: Welche Vorlage ist richtig? | A: MicrosoftUEFICertificateAuthority (Microsoft UEFI-Zertifizierungsstelle).
- F: Mit welchem Cmdlet wird sie gesetzt? | A: Set-VMFirmware -VMName LNX01 -SecureBootTemplate MicrosoftUEFICertificateAuthority
- F: Warum ist Abschalten von Secure Boot nicht die erste Wahl? | A: Damit entfällt der Schutz gegen manipulierte Bootloader/Bootkits; die passende Vorlage erhält ihn.
- F: Welchen VM-Zustand braucht die Änderung? | A: Ausgeschaltet.

## Reihenfolge
### Linux-Gen-2-VM zum Booten bringen
1. Fehlermeldung in der VM-Konsole lesen
2. Secure-Boot-Vorlage prüfen
3. VM ausschalten
4. Vorlage auf Microsoft UEFI Certificate Authority ändern
5. Startreihenfolge prüfen
6. VM starten und installieren

## Legende
### Secure-Boot-Vorlage
- Was: Satz vertrauenswürdiger Zertifikate, gegen den die UEFI-Firmware der Gen-2-VM Bootloader prüft.
- Wie: Einstellungen → Sicherheit → Vorlage oder `Set-VMFirmware -SecureBootTemplate`.
- Wann: beim Anlegen einer Gen-2-VM bzw. vor dem ersten Start eines Nicht-Windows-Gasts.
- Wo: Konfiguration der VM auf HV01 (nur bei ausgeschalteter VM).
- Warum: Nur passend signierte Bootloader dürfen starten; so werden Bootkits verhindert.

## Karteikarten
- F: Welche Secure-Boot-Vorlage brauchen Linux-Gäste? | A: Microsoft UEFI Certificate Authority (MicrosoftUEFICertificateAuthority).
- F: Welche Vorlage ist bei neuen Gen-2-VMs voreingestellt? | A: Microsoft Windows.
- F: Wie heißt der von der Microsoft UEFI CA signierte Linux-Bootloader-Vorlader? | A: shim.
- F: Wo ändert man die Vorlage in der GUI? | A: VM-Einstellungen → Sicherheit → Sicherer Start → Vorlage.
- F: Cmdlet zum Ändern der Vorlage? | A: Set-VMFirmware -VMName <VM> -SecureBootTemplate MicrosoftUEFICertificateAuthority
- F: Wie prüft man im Linux-Gast den Secure-Boot-Status? | A: mokutil --sb-state
- F: Haben Gen-1-VMs Secure Boot? | A: Nein, nur Gen-2-VMs (UEFI).
- F: Wann sollte Secure Boot abgeschaltet werden? | A: Nur, wenn die Distribution keinen signierten Bootloader besitzt.
- F: Welche Hyper-V-Treiber bringt der Linux-Kernel mit? | A: Linux Integration Services, z. B. hv_vmbus, hv_netvsc, hv_storvsc.

## Quiz
? Eine Ubuntu-Gen-2-VM bootet wegen Secure Boot nicht. Beste Lösung?
* Vorlage auf Microsoft UEFI Certificate Authority ändern
- Secure Boot in der VM-Firmware dauerhaft deaktivieren
- Die VM als Generation 1 mit BIOS neu erstellen
- Vorlage auf „Microsoft Windows“ zurücksetzen
! So bleibt Secure Boot aktiv und der shim wird akzeptiert.

? Welche Vorlage ist bei neuen Gen-2-VMs voreingestellt?
* Microsoft Windows
- Microsoft UEFI Certificate Authority
- Open Source Shielded VM
- Keine
! Standard ist die Windows-Vorlage.

? Mit welchem Cmdlet ändert man die Vorlage?
* Set-VMFirmware
- Set-VMSecurity
- Set-VMBios
- Set-VMHost
! Secure Boot und Startreihenfolge sind Firmware-Einstellungen von Gen-2-VMs.

? In welchem Zustand muss LNX01 für die Änderung sein?
* Ausgeschaltet
- Wird ausgeführt
- Angehalten
- Gespeichert ist ausreichend
! Firmware-Änderungen erfordern eine ausgeschaltete VM.

? Wer signiert typischerweise den shim-Bootloader von Linux-Distributionen?
* Microsoft UEFI Certificate Authority
- Microsoft Windows Production PCA
- Die Hyper-V-Host-CA
- Let's Encrypt
! Die Drittanbieter-CA von Microsoft signiert shim.

? Welche VMs sind von dem Problem betroffen?
* Nur Gen-2-VMs
- Nur Gen-1-VMs
- Beide Generationen
- Nur VMs mit dynamischem RAM
! Nur Gen 2 hat UEFI mit Secure Boot.

? Wie prüft man im Linux-Gast, ob Secure Boot aktiv ist?
* mokutil --sb-state
- Confirm-SecureBootUEFI
- systemctl status secureboot
- uname -sb
! Confirm-SecureBootUEFI ist das Windows-Gegenstück.

? Wann ist das Deaktivieren von Secure Boot vertretbar?
* Wenn die Distribution keinen signierten Bootloader hat
- Grundsätzlich bei jeder Linux-Distribution
- Bei jeder Gen-2-VM, da UEFI ohnehin schützt
- Wenn an der VM Dynamic Memory aktiviert ist
! Sonst entfällt unnötig der Schutz gegen manipulierte Bootloader.
