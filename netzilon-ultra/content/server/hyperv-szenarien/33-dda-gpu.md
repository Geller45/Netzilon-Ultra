---
id: server-hvsz-33
bereich: AZ-800
block: HV-S
kapitel: Hyper-V-Praxisszenarien
titel: Szenario 33 – Discrete Device Assignment: GPU an eine VM durchreichen
stufe: Profi
fach: Windows Server / AZ-800
pruefungen: [AZ-800, AP2, Schule]
quellen: [Microsoft Learn – Hyper-V]
verweise: [az800-dda, az800-vm-ram, server-hvsz-30]
---

## Profi

### Ticket
**Kunde meldet:** „Unsere CAD-/KI-Abteilung braucht in der VM CAD01 eine echte Grafikkarte. Im Host steckt eine zweite GPU, die niemand nutzt.“
- **Priorität:** mittel (Projektanforderung)
- **Betroffene Maschine:** **CAD01** auf **HV02**

### Ausgangslage
- **HV02.example.com**: Server 2025, zusätzliche PCIe-GPU (Rechenzentrums-GPU mit Herstellerunterstützung für DDA)
- VM **CAD01**: Gen 2, Server 2025, 32 GB statischer RAM, 8 vCPU, 192.168.10.60
- Die GPU ist im Host-Geräte-Manager sichtbar und mit Herstellertreiber installiert.

### Analyse
- **Discrete Device Assignment (DDA)** reicht ein ganzes **PCIe-Gerät** exklusiv an **eine** VM durch. Der Gast nutzt den **Herstellertreiber** und erhält fast native Leistung.
- Unterstützt für **Windows Server** (nicht Client-Hyper-V); offiziell für **GPUs** und **NVMe-Geräte**; Hardware braucht **IOMMU** (Intel VT-d / AMD-Vi), Interrupt-Remapping und passende Firmware.
- Für die Eignungsprüfung gibt Microsoft ein Skript (**SurveyDDA.ps1**) heraus.
- Einschränkungen einer VM mit DDA: **keine Live-Migration**, kein Speichern/Wiederherstellen; automatische Stoppaktion muss **TurnOff** sein; dynamischer Arbeitsspeicher nicht unterstützt.
- GPUs brauchen zusätzlich **MMIO-Bereich** (Memory-Mapped I/O) in der VM: `-LowMemoryMappedIoSpace`, `-HighMemoryMappedIoSpace` und `-GuestControlledCacheTypes $true`; die Werte hängen von der GPU ab (Herstellerangaben).
- Alternative ab Server 2025: **GPU-Partitionierung (GPU-P)** – eine GPU auf mehrere VMs aufteilen, inkl. Live-Migration in Clustern (hardware- und treiberabhängig).

### Lösungsweg
1. **Eignung prüfen** (Herstellerfreigabe, SurveyDDA.ps1). *Begründung:* Nicht jede Karte/Board-Kombination ist geeignet.
2. **VM vorbereiten** (aus): Stoppaktion TurnOff, statischer RAM, GuestControlledCacheTypes, MMIO-Bereiche. *Begründung:* Voraussetzungen für GPU-Passthrough.
3. **Location Path** der GPU ermitteln (`DEVPKEY_Device_LocationPaths`). *Begründung:* DDA arbeitet mit dem PCIe-Pfad, nicht mit dem Gerätenamen.
4. **Gerät im Host deaktivieren** (`Disable-PnpDevice`) und **vom Host trennen** (`Dismount-VMHostAssignableDevice -Force`). *Begründung:* Der Host darf das Gerät nicht mehr verwenden.
5. **An VM zuweisen** (`Add-VMAssignableDevice`). *Begründung:* Exklusive Zuordnung zur VM.
6. VM starten, **Herstellertreiber im Gast** installieren. *Begründung:* Der Gast spricht direkt mit der Hardware.

### Ergebnis prüfen
- HV02: `Get-VMAssignableDevice -VMName CAD01` zeigt den Location Path.
- CAD01: Geräte-Manager → Grafikkarte mit Herstellertreiber ohne Fehler; Herstellertool (z. B. Status-Utility) zeigt die GPU.
- Anwendung nutzt die GPU (Auslastung im Gast-Task-Manager).

### Vorbeugung
- Dokumentieren, welche VM welches Gerät besitzt (Location Path).
- Wartung planen: CAD01 kann nicht live migriert werden → Downtime nötig.
- Rückweg kennen: `Remove-VMAssignableDevice` → `Mount-VMHostAssignableDevice` → `Enable-PnpDevice`.

## Einfach
Stell dir vor, im Haus (Host) steht ein **super schneller Rennrad-Trainer** (die Grafikkarte). Bisher dürfen alle Bewohner mal ein bisschen damit fahren – aber eigentlich nutzt sie keiner richtig.

Die CAD-Abteilung sagt: „Wir brauchen den Trainer **ganz für uns**!“ Mit **DDA** schiebt man das Gerät einfach in das Zimmer der VM CAD01. Danach gehört es nur noch ihr. Der Hausherr (Host) kann es nicht mehr benutzen.

So geht das Umziehen:
1. Erst prüfen, ob das Gerät durch die Tür passt (Eignung).
2. Im Haus **ausstecken** (deaktivieren und abmelden).
3. Ins Zimmer der VM tragen (zuweisen).
4. Die VM installiert die passende **Bedienungsanleitung** (Treiber).

Der Haken: Die VM kann jetzt nicht mehr spontan in ein anderes Haus umziehen (keine Live-Migration). Das Gerät ist ja fest in ihrem Zimmer eingebaut.

## Merksatz
- DDA = **ganzes PCIe-Gerät exklusiv** für **eine** VM.
- **Disable-PnpDevice → Dismount-VMHostAssignableDevice → Add-VMAssignableDevice**.
- Stoppaktion **TurnOff**, keine **Live-Migration**.
- GPU: **MMIO-Bereiche** und **GuestControlledCacheTypes**.

## Prüfungsfalle
- DDA nutzt den **Location Path**, nicht die Instanz-ID oder den Namen.
- Ohne `Dismount-VMHostAssignableDevice` kann man das Gerät nicht zuweisen.
- DDA ist ein Feature von **Windows Server** – auf Windows-11-Hyper-V nicht unterstützt.
- Zurückgeben in umgekehrter Reihenfolge: Remove → Mount → Enable.

## Grafik
### GPU wandert in die VM
1. Admin -> HV02: SurveyDDA.ps1 meldet Gerät als geeignet
2. HV02: Disable-PnpDevice deaktiviert GPU im Host
3. HV02: Dismount-VMHostAssignableDevice trennt GPU vom Host
4. HV02 -> CAD01: Add-VMAssignableDevice weist GPU zu
5. CAD01: Herstellertreiber installiert, GPU nutzbar
6. HV02 -> HV01: Live-Migration von CAD01 nicht möglich

## Lab
**Nachstellen:** Nur mit geeigneter Hardware vollständig möglich; ohne Hardware die Befehlskette trocken üben und die Fehlermeldungen lesen. Maschinen: **HV02**, VM **CAD01**.

### GUI
1. **HV02**: Geräte-Manager → Grafikkarten → zweite GPU → Eigenschaften → Details → „**Pfade zum Speicherort**“ → Wert mit „PCIROOT…“ notieren.
2. **HV02**: Hyper-V-Manager → CAD01 → Einstellungen → Verwaltung → **Automatische Stoppaktion** → „Virtuellen Computer ausschalten“.
3. **HV02**: CAD01 → Einstellungen → Arbeitsspeicher → dynamischen Arbeitsspeicher deaktivieren.
4. **HV02**: Geräte-Manager → GPU → Rechtsklick → **Gerät deaktivieren**.
5. **HV02**: Zuweisung per PowerShell (für DDA gibt es im Hyper-V-Manager keinen Dialog).
6. **CAD01**: starten → Geräte-Manager → neue Grafikkarte → Herstellertreiber installieren.

### PowerShell
```powershell
# Auf HV02 – VM vorbereiten (aus)
Stop-VM -Name CAD01
Set-VM -Name CAD01 -AutomaticStopAction TurnOff
Set-VMMemory -VMName CAD01 -DynamicMemoryEnabled $false
Set-VM -Name CAD01 -GuestControlledCacheTypes $true -LowMemoryMappedIoSpace 3GB -HighMemoryMappedIoSpace 33280MB

# Auf HV02 – Location Path der GPU ermitteln
$gpu = Get-PnpDevice -Class Display | Where-Object FriendlyName -like "*Zweite GPU*"
$loc = ($gpu | Get-PnpDeviceProperty -KeyName DEVPKEY_Device_LocationPaths).Data[0]

# Auf HV02 – vom Host trennen und zuweisen
Disable-PnpDevice -InstanceId $gpu.InstanceId -Confirm:$false
Dismount-VMHostAssignableDevice -Force -LocationPath $loc
Add-VMAssignableDevice -LocationPath $loc -VMName CAD01
Get-VMAssignableDevice -VMName CAD01
Start-VM -Name CAD01

# Auf HV02 – Rückweg
Stop-VM -Name CAD01
Remove-VMAssignableDevice -LocationPath $loc -VMName CAD01
Mount-VMHostAssignableDevice -LocationPath $loc
Enable-PnpDevice -InstanceId $gpu.InstanceId -Confirm:$false
```

## Reihenfolge
### GPU per DDA zuweisen
1. Eignung mit Herstellerangaben und SurveyDDA.ps1 prüfen
2. VM ausschalten und Stoppaktion TurnOff setzen
3. MMIO-Bereiche und GuestControlledCacheTypes konfigurieren
4. Location Path der GPU ermitteln
5. GPU im Host mit Disable-PnpDevice deaktivieren
6. Dismount-VMHostAssignableDevice ausführen
7. Add-VMAssignableDevice an die VM
8. VM starten und Herstellertreiber installieren

## Szenario
### Kontrollfragen
Die ungenutzte GPU in HV02 soll exklusiv an CAD01 (Gen 2) gehen. CAD01 soll später auch auf HV01 laufen können.
- F: Wie heißt die Technik zum exklusiven Durchreichen? | A: Discrete Device Assignment (DDA).
- F: Welche Eigenschaft der GPU wird für die Befehle benötigt? | A: Der Location Path (DEVPKEY_Device_LocationPaths).
- F: Welche drei Cmdlets bilden die Kernkette? | A: Disable-PnpDevice, Dismount-VMHostAssignableDevice, Add-VMAssignableDevice.
- F: Kann CAD01 mit zugewiesener GPU live migriert werden? | A: Nein, VMs mit DDA unterstützen keine Live-Migration.
- F: Welche automatische Stoppaktion ist nötig? | A: TurnOff (Ausschalten).

## Legende
### Discrete Device Assignment
- Was: Exklusive Zuweisung eines ganzen PCIe-Geräts (GPU, NVMe) an eine VM.
- Wie: Gerät im Host deaktivieren und abmelden, dann mit Add-VMAssignableDevice zuweisen.
- Wann: Wenn eine VM native Leistung eines Geräts braucht (CAD, KI, Rendering).
- Wo: Auf Windows-Server-Hyper-V-Hosts mit IOMMU-fähiger Hardware.
- Warum: Fast native Leistung mit dem Herstellertreiber im Gast.

## Karteikarten
- F: Was ist DDA? | A: Discrete Device Assignment – exklusives Durchreichen eines PCIe-Geräts an eine VM.
- F: Welche Gerätetypen unterstützt DDA offiziell? | A: GPUs und NVMe-Speichergeräte.
- F: Welches Cmdlet trennt das Gerät vom Host? | A: Dismount-VMHostAssignableDevice -Force -LocationPath <Pfad>
- F: Welches Cmdlet weist das Gerät der VM zu? | A: Add-VMAssignableDevice -LocationPath <Pfad> -VMName <VM>
- F: Welche Stoppaktion verlangt DDA? | A: TurnOff.
- F: Welche VM-Einstellungen brauchen GPUs zusätzlich? | A: GuestControlledCacheTypes $true sowie LowMemoryMappedIoSpace und HighMemoryMappedIoSpace.
- F: Wie gibt man das Gerät dem Host zurück? | A: Remove-VMAssignableDevice, Mount-VMHostAssignableDevice, Enable-PnpDevice.
- F: Welche Alternative bietet Server 2025 zum Teilen einer GPU? | A: GPU-Partitionierung (GPU-P).

## Quiz
? Welche Angabe benötigt Add-VMAssignableDevice?
* Den Location Path des Geräts
- Den Anzeigenamen der GPU
- Die MAC-Adresse
- Die VM-ID des Hosts
! Der PCIe-Pfad identifiziert das Gerät eindeutig.

? Was muss vor dem Zuweisen passieren?
* Gerät per Dismount-VMHostAssignableDevice vom Host trennen
- Die Ziel-VM per Live-Migration auf den Host verschieben
- Einen Produktionsprüfpunkt der Ziel-VM erstellen
- Dynamischen Arbeitsspeicher an der Ziel-VM aktivieren
! Vorher zudem Disable-PnpDevice.

? Welche Einschränkung hat eine VM mit DDA-GPU?
* Keine Live-Migration
- Kein Netzwerk
- Nur eine vCPU
- Nur Generation 1
! Das Gerät ist physisch an den Host gebunden.

? Auf welcher Plattform wird DDA unterstützt?
* Windows Server mit Hyper-V
- Windows 11 Pro Hyper-V
- Windows Sandbox
- Jede Gen-1-VM ohne Host-Unterstützung
! Client-Hyper-V unterstützt DDA nicht.

? Welche automatische Stoppaktion verlangt DDA?
* TurnOff
- Save
- ShutDown
- Nothing
! Ein Speichern des Zustands ist mit durchgereichter Hardware nicht möglich.

? Welche Einstellung ist speziell für GPUs nötig?
* MMIO-Bereiche (Low/HighMemoryMappedIoSpace)
- MAC-Spoofing an der vNIC der VM
- NUMA-Spanning auf dem Host abschalten
- Integrationsdienst Gastdienste aktivieren
! GPUs brauchen zusätzlichen Adressraum in der VM.

? Was ist die richtige Reihenfolge zur Rückgabe an den Host?
* Remove-VMAssignableDevice, Mount-VMHostAssignableDevice, Enable-PnpDevice
- Enable-PnpDevice, Remove-VMAssignableDevice, Mount-VMHostAssignableDevice
- Mount-VMHostAssignableDevice, Enable-PnpDevice, Remove-VMAssignableDevice
- Dismount-VMHostAssignableDevice, Enable-PnpDevice, Add-VMAssignableDevice
! Umgekehrt zur Zuweisung.

? Welches Werkzeug stellt Microsoft für die Eignungsprüfung bereit?
* Das Skript SurveyDDA.ps1
- Das Tool Disk2vhd.exe
- Das Tool Sysprep.exe
- Das Cmdlet Compare-VM
! Es prüft, welche Geräte für DDA in Frage kommen.
