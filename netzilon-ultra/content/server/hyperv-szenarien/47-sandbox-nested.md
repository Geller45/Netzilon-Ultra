---
id: server-hvsz-47
bereich: AZ-800
block: HV-S
kapitel: Hyper-V-Praxisszenarien
titel: Szenario 47 – Windows-Sandbox und Hyper-V-Container in einer VM brauchen Nested Virtualization
stufe: Fortgeschritten
fach: Windows Server / AZ-800
pruefungen: [AZ-800, AP2, Schule]
quellen: [Microsoft Learn – Hyper-V]
verweise: [az800-nested, az800-windows-container, az800-vm-ram, server-hvsz-50]
---

## Profi

### Ticket
**Kunde meldet:** „In unserer Entwickler-VM DEV01 startet die Windows-Sandbox nicht, und Docker-Container mit `--isolation=hyperv` brechen ab. Auf dem physischen Laptop geht beides.“
- **Priorität:** mittel
- **Betroffene Maschinen:** **DEV01** (Windows 11) und **CT01** (Server 2025, Container-Host) auf **HV01**

### Ausgangslage
- **HV01.example.com**: Server 2025, Intel-CPU mit VT-x/EPT.
- VM **DEV01**: Windows 11 Enterprise, Gen 2, **dynamischer RAM** 2–8 GB, 4 vCPU, 192.168.10.110.
- VM **CT01**: Server 2025, Feature **Containers**, Docker/Moby-Engine, 192.168.10.111.

### Analyse
- **Windows-Sandbox** (optionales Feature `Containers-DisposableClientVM`) und **Hyper-V-isolierte Container** starten jeweils eine **leichtgewichtige VM** mit eigenem Kernel – sie brauchen also einen **Hypervisor im Gast**.
- In einer normalen VM sind die CPU-Virtualisierungserweiterungen **nicht** sichtbar → Fehler wie „Virtualisierung nicht verfügbar/nicht aktiviert“ bzw. der Container mit Hyper-V-Isolation startet nicht. **Prozessisolierte** Container (`--isolation=process`) funktionieren dagegen, weil sie den Kernel des Hosts (hier: der VM) teilen.
- Lösung: **Geschachtelte Virtualisierung** für DEV01 und CT01:
  - `Set-VMProcessor -ExposeVirtualizationExtensions $true` (VM **aus**)
  - genügend **statischer RAM** (dynamischer RAM ist bei Nested nicht sinnvoll/eingeschränkt)
  - Konfigurationsversion **≥ 8.0**
- Netzwerk: Die Sandbox/Container nutzen NAT innerhalb der VM; MAC-Spoofing ist hierfür nicht zwingend, aber nötig, falls innere VMs direkt ins LAN sollen.

### Lösungsweg
1. **Diagnose** in DEV01: `Get-CimInstance Win32_Processor | Select VirtualizationFirmwareEnabled` bzw. `systeminfo` (Abschnitt Hyper-V-Anforderungen). *Begründung:* Beweis, dass die Erweiterungen fehlen.
2. DEV01 und CT01 **herunterfahren**. *Begründung:* Nested lässt sich nur offline aktivieren.
3. **ExposeVirtualizationExtensions** aktivieren und **statischen RAM** (DEV01 8 GB, CT01 8 GB) setzen. *Begründung:* Voraussetzungen von Microsoft.
4. VMs starten. In DEV01 Feature **Windows-Sandbox** aktivieren (falls noch nicht), Neustart. *Begründung:* Feature braucht Neustart.
5. In CT01 die Rolle **Hyper-V** installieren (für Hyper-V-Isolation erforderlich), Neustart; Container mit `--isolation=hyperv` testen. *Begründung:* Hyper-V-Isolation setzt Hyper-V im Container-Host voraus.

### Ergebnis prüfen
- HV01: `Get-VMProcessor -VMName DEV01, CT01 | Select VMName, ExposeVirtualizationExtensions` → True.
- DEV01: Windows-Sandbox startet, Fenster mit frischem Desktop.
- CT01: `docker run --rm --isolation=hyperv mcr.microsoft.com/windows/nanoserver:ltsc2025 cmd /c ver` liefert Ausgabe.

### Vorbeugung
- Vorlage „Entwickler-VM“ mit aktiviertem Nested und statischem RAM.
- Ressourcen planen: Jede Sandbox/Container-VM braucht zusätzlich RAM in der äußeren VM.
- Hinweis an Entwickler: VM mit Nested lässt sich nicht live migrieren – Wartung ankündigen.

## Einfach
Die **Windows-Sandbox** ist wie ein **Spielzimmer zum Ausprobieren**: Du kannst darin alles anmalen und kaputt machen, und wenn du gehst, ist alles wieder sauber. Damit das klappt, baut Windows dafür eine kleine **eigene Mini-VM**.

Jetzt steckt dein Windows aber selbst schon in einer VM (DEV01). Du willst also eine **Mini-VM in der VM** bauen – eine Puppe in der Puppe. Das klappt nur, wenn der große Host der VM erlaubt, selbst „Häuser zu bauen“. Diese Erlaubnis heißt **geschachtelte Virtualisierung**.

Ohne die Erlaubnis sagt die Sandbox: „Ich kann hier nicht bauen.“ Genauso die **Hyper-V-Container**, die auch jeweils eine eigene Mini-VM brauchen.

Was man tun muss:
1. VM ausschalten.
2. Am Host die Erlaubnis geben (**ExposeVirtualizationExtensions**).
3. Der VM **festen** Speicher geben, damit genug Platz für die Mini-VMs da ist.
4. VM wieder einschalten – jetzt klappt das Spielzimmer.

Kleine Container, die sich den Kern mit der VM teilen (Prozessisolation), brauchen das übrigens nicht.

## Merksatz
- Sandbox & Hyper-V-Container = **Mini-VM** ⇒ in einer VM **Nested** nötig.
- **ExposeVirtualizationExtensions**, **VM aus**, **statischer RAM**.
- `--isolation=process` braucht kein Nested.
- Nested-VM ⇒ keine Live-Migration.

## Prüfungsfalle
- Die Einstellung wird am **Host** für die VM gesetzt, nicht im Gast.
- Prozessisolierte Container laufen auch ohne Nested – nur Hyper-V-Isolation braucht es.
- Dynamischer RAM an der äußeren VM ist für Nested ungeeignet.
- Auf Server-Container-Hosts muss für Hyper-V-Isolation zusätzlich die Rolle **Hyper-V** installiert sein.

## Grafik
### Mini-VM in der VM
1. DEV01: Windows-Sandbox startet nicht – Virtualisierung fehlt
2. Admin -> HV01: DEV01 ausschalten
3. HV01 -> DEV01: ExposeVirtualizationExtensions = True, RAM statisch 8 GB
4. DEV01: Sandbox-VM startet innerhalb von DEV01
5. CT01: Container mit Hyper-V-Isolation läuft

## Lab
**Nachstellen:** Sandbox in einer VM ohne Nested starten (Fehler), dann aktivieren. Maschinen: **HV01**, VM **DEV01** (Windows 11 Pro/Enterprise).

### GUI
1. **DEV01**: Systemsteuerung → Programme → Windows-Features aktivieren → „**Windows-Sandbox**“ → ggf. ausgegraut oder nach Neustart Fehler beim Start (Fehlerbild).
2. **DEV01**: Task-Manager → Leistung → CPU → „Virtualisierung“ prüfen.
3. **HV01**: Hyper-V-Manager → DEV01 → Herunterfahren → Einstellungen → Arbeitsspeicher → dynamischen Arbeitsspeicher **deaktivieren**, 8192 MB.
4. **HV01**: Aktivieren der Virtualisierungserweiterungen per PowerShell (im Hyper-V-Manager gibt es dafür keinen Haken).
5. **DEV01**: starten → Windows-Features → Windows-Sandbox aktivieren → Neustart → Start → „Windows-Sandbox“ → Fenster öffnet sich.

### PowerShell
```powershell
# Auf DEV01 – Diagnose
Get-CimInstance Win32_Processor | Select-Object Name, VirtualizationFirmwareEnabled
Get-ComputerInfo -Property "HyperV*"

# Auf HV01 – Nested aktivieren (VMs aus)
Stop-VM -Name DEV01, CT01
Set-VMProcessor -VMName DEV01, CT01 -ExposeVirtualizationExtensions $true
Set-VMMemory -VMName DEV01, CT01 -DynamicMemoryEnabled $false -StartupBytes 8GB
Start-VM -Name DEV01, CT01
Get-VMProcessor -VMName DEV01, CT01 | Select-Object VMName, ExposeVirtualizationExtensions

# Auf DEV01 – Windows-Sandbox aktivieren
Enable-WindowsOptionalFeature -Online -FeatureName Containers-DisposableClientVM -All

# Auf CT01 – Hyper-V für Hyper-V-Isolation, dann Test
Install-WindowsFeature Hyper-V -Restart
docker run --rm --isolation=hyperv mcr.microsoft.com/windows/nanoserver:ltsc2025 cmd /c ver
docker run --rm --isolation=process mcr.microsoft.com/windows/nanoserver:ltsc2025 cmd /c ver
```

## Szenario
### Kontrollfragen
In DEV01 (Windows 11, dynamischer RAM) startet die Windows-Sandbox nicht; auf CT01 scheitern Container mit --isolation=hyperv, prozessisolierte laufen.
- F: Warum laufen prozessisolierte Container, Hyper-V-isolierte aber nicht? | A: Hyper-V-Isolation startet eine eigene Mini-VM und braucht einen Hypervisor in der VM; Prozessisolation teilt den Kernel.
- F: Welche Einstellung fehlt am Host? | A: Set-VMProcessor -ExposeVirtualizationExtensions $true (geschachtelte Virtualisierung).
- F: Was ist mit dem dynamischen RAM zu tun? | A: Auf statischen RAM mit ausreichender Größe umstellen.
- F: Wie heißt das optionale Feature der Windows-Sandbox? | A: Containers-DisposableClientVM.
- F: Welche Einschränkung hat DEV01 danach? | A: Keine Live-Migration, solange Nested aktiv ist.

## Legende
### Windows-Sandbox
- Was: Wegwerf-Desktop in einer leichtgewichtigen, hypervisorbasierten VM.
- Wie: Optionales Feature Containers-DisposableClientVM (Windows 11 Pro/Enterprise).
- Wann: Unbekannte Software oder Dateien gefahrlos testen.
- Wo: Auf Windows-Clients; in einer VM nur mit geschachtelter Virtualisierung.
- Warum: Nach dem Schließen sind alle Änderungen verworfen.
### Hyper-V-Isolation (Container)
- Was: Container läuft in einer eigenen Utility-VM mit eigenem Kernel.
- Wie: docker run --isolation=hyperv
- Warum: Stärkere Isolation als Prozessisolation, auch für ältere/fremde Container-Versionen.

## Karteikarten
- F: Warum braucht die Windows-Sandbox in einer VM Nested Virtualization? | A: Sie startet selbst eine leichtgewichtige VM und benötigt einen Hypervisor im Gast.
- F: Cmdlet zum Aktivieren von Nested? | A: Set-VMProcessor -VMName VM -ExposeVirtualizationExtensions $true
- F: In welchem Zustand muss die VM dafür sein? | A: Ausgeschaltet.
- F: Brauchen prozessisolierte Container Nested? | A: Nein, nur Hyper-V-isolierte Container.
- F: Wie startet man einen Hyper-V-isolierten Container? | A: docker run --isolation=hyperv <Image>
- F: Feature-Name der Windows-Sandbox? | A: Containers-DisposableClientVM
- F: Welche RAM-Konfiguration wird für Nested empfohlen? | A: Statischer Arbeitsspeicher.
- F: Was braucht ein Server-Container-Host für Hyper-V-Isolation zusätzlich? | A: Die Rolle Hyper-V.

## Quiz
? Warum startet die Windows-Sandbox in einer normalen VM nicht?
* Die VM sieht keine CPU-Virtualisierungserweiterungen
- Windows 11 unterstützt in VMs grundsätzlich keine Sandbox
- Die VM hat keine Netzwerkkarte für die Sandbox
- Secure Boot ist in der VM-Firmware aktiviert
! Sandbox = Mini-VM, braucht Hypervisor.

? Welche Container-Art läuft auch ohne Nested Virtualization in einer VM?
* Prozessisolierte Container
- Hyper-V-isolierte Container
- Windows-Sandbox
- WSL2-Distributionen
! Sie teilen den Kernel der VM.

? Welcher Befehl aktiviert Nested für DEV01?
* Set-VMProcessor -VMName DEV01 -ExposeVirtualizationExtensions $true
- Enable-VMIntegrationService -VMName DEV01 -Name "Nested Virtualization"
- Set-VM -Name DEV01 -NestedVirtualization On -ProcessorCount 4
- Enable-WindowsOptionalFeature -Online -FeatureName Containers-DisposableClientVM
! Am Host bei ausgeschalteter VM. Das optionale Feature installiert nur die Sandbox im Gast.

? Welche RAM-Einstellung ist für die äußere VM richtig?
* Statischer Arbeitsspeicher
- Dynamischer RAM ab 512 MB
- Smart Paging
- Kein RAM-Limit
! Dynamischer RAM ist bei Nested eingeschränkt.

? Was muss auf CT01 für Hyper-V-isolierte Container installiert sein?
* Die Rolle Hyper-V
- Der DHCP-Server
- IIS
- Der iSCSI-Zielserver
! Plus Feature Containers.

? Welcher Docker-Parameter wählt die Hyper-V-Isolation?
* --isolation=hyperv
- --network=hyperv
- --privileged
- --runtime=nested
! process wäre die Prozessisolation.

? Welche Folge hat Nested für die VM?
* Sie lässt sich nicht live migrieren
- Sie verliert ihre IP-Adresse
- Sie wird zu Gen 1
- Sie kann keine Updates installieren
! Wartungen mit Downtime planen.

? Wie heißt das optionale Feature der Windows-Sandbox?
* Containers-DisposableClientVM
- Microsoft-Hyper-V-Sandbox
- Windows-Defender-ApplicationGuard
- VirtualMachinePlatform-Sandbox
! Aktivierung per Enable-WindowsOptionalFeature.
