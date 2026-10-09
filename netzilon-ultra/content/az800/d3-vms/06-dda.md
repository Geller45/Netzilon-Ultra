---
id: az800-dda
bereich: AZ-800
block: A7
kapitel: VMs & Container
titel: Discrete Device Assignment (DDA) & GPU-Partitionierung
stufe: Profi
quellen: [AZ-800 Study Guide, Microsoft Learn]
verweise: [ap1-a1-pci, ap1-a1-grafikkarte, az800-cpu-gruppen, az800-enhanced-session]
---

## Profi

### Was ist DDA?
**Discrete Device Assignment** reicht ein **ganzes physisches PCIe-Gerät** direkt an **eine** VM durch (**PCIe-Passthrough**). Die VM nutzt den **Originaltreiber** des Herstellers und erhält nahezu native Leistung.
Typische Geräte: **GPUs** (CAD, KI/ML, Rendering), **NVMe-SSDs** (extrem schneller Speicher für Datenbanken), spezielle Netzwerk-/Beschleunigerkarten.
DDA ist der Nachfolger von **RemoteFX vGPU** (entfernt/abgekündigt aus Sicherheitsgründen).

### Voraussetzungen
| Bereich | Anforderung |
|---|---|
| Host-Betriebssystem | **Windows Server** 2016+ (nicht Client-Hyper-V) |
| Hardware | CPU mit **IOMMU** (Intel **VT-d**, AMD-Vi), Unterstützung für **ACS**/Interrupt-Remapping, Gerät unterstützt Passthrough (vom Hersteller freigegeben; Tool `SurveyDDA.ps1` prüft Eignung) |
| VM | **Generation 2** empfohlen (Gen 1 eingeschränkt), Gast Windows 10/Server 2016+ oder unterstütztes Linux |
| VM-Einstellungen | **Automatische Stoppaktion = Ausschalten** (TurnOff) – Speichern des Zustands ist nicht möglich; für GPUs **MMIO-Bereich** vergrößern (`-LowMemoryMappedIoSpace`, `-HighMemoryMappedIoSpace`) und **Write-Combining** aktivieren |
| Gerät | auf dem Host **deaktivieren** und **abmelden** (dismount) |

### Ablauf
1. **Gerät identifizieren**: Geräte-Manager → Eigenschaften → Details → **Pfade zum Speicherort** (Location Path), z. B. `PCIROOT(0)#PCI(0300)#PCI(0000)`.
2. **VM vorbereiten** (ausgeschaltet): `Set-VM -AutomaticStopAction TurnOff`; bei GPUs `-GuestControlledCacheTypes $true -LowMemoryMappedIoSpace 3GB -HighMemoryMappedIoSpace 33280MB`.
3. **Gerät auf dem Host deaktivieren**: `Disable-PnpDevice -InstanceId …`
4. **Gerät abmelden**: `Dismount-VMHostAssignableDevice -LocationPath … -Force`
5. **Gerät zuweisen**: `Add-VMAssignableDevice -LocationPath … -VMName GPU01`
6. VM starten, **Herstellertreiber** im Gast installieren.
**Rückgabe**: `Remove-VMAssignableDevice` → `Mount-VMHostAssignableDevice` → `Enable-PnpDevice`.

### Einschränkungen
- **Ein Gerät = eine VM** (keine gemeinsame Nutzung).
- **Keine Live-Migration**, keine Prüfpunkte/Speichern, kein dynamischer Arbeitsspeicher (bzw. eingeschränkt) – VM ist an den Host gebunden.
- Hochverfügbarkeit nur durch mehrere Hosts mit gleicher Hardware + Neustart der VM auf dem anderen Knoten.
- Sicherheitsrisiko: Die VM hat direkten Hardwarezugriff (Firmware-Angriffe) → nur vertrauenswürdige VMs.

### GPU-Partitionierung (GPU-P) – Alternative
Seit **Windows Server 2025** (und Azure Local): Eine **GPU wird in Partitionen aufgeteilt** und mehreren VMs gleichzeitig zugewiesen (**GPU-P**), ähnlich vGPU-Lösungen. Unterstützt jetzt auch **Live-Migration** und Failover-Cluster (mit unterstützten GPUs, z. B. NVIDIA A2/A10/A16/L4 mit passendem Treiber).
- `Get-VMHostPartitionableGpu`, `Set-VMHostPartitionableGpu -PartitionCount 4`, `Add-VMGpuPartitionAdapter -VMName VDI01`.
| | DDA | GPU-P |
|---|---|---|
| Geräte pro VM | ganzes Gerät | Teil einer GPU |
| VMs pro Gerät | 1 | mehrere |
| Live-Migration | nein | ja (Server 2025) |
| Leistung | nativ | geteilt |

### Azure-Pendant
Azure-VMs der **N-Serie** (NC, ND, NV) bieten GPUs per Passthrough bzw. partitioniert (NVadsA10 …) – dort ohne eigenes DDA-Setup.

## Lab
**Voraussetzung**: physischer Host mit VT-d/IOMMU und einer zweiten, passthrough-fähigen GPU oder NVMe (in verschachtelten Labs nicht möglich!). VM **GPU01** (Gen 2, Windows Server).

### GUI
1. **Host**: Geräte-Manager → Grafikkarte (zweite GPU) → Eigenschaften → **Details** → Eigenschaft **Pfade zum Speicherort** → Wert `PCIROOT(…)#PCI(…)` kopieren.
2. **Host**: Gerät → **Gerät deaktivieren**.
3. Rest per PowerShell (keine GUI in Hyper-V-Manager für DDA).
4. **GPU01**: starten → Geräte-Manager → Grafikkarte erscheint → Herstellertreiber installieren → Anwendung testen.

### PowerShell (auf dem Host, VM ausgeschaltet)
```powershell
# Eignung prüfen (Microsoft-Skript SurveyDDA.ps1 aus GitHub „Virtualization-Documentation“)
.\SurveyDDA.ps1

$vm = "GPU01"
Set-VM -Name $vm -AutomaticStopAction TurnOff -GuestControlledCacheTypes $true `
  -LowMemoryMappedIoSpace 3GB -HighMemoryMappedIoSpace 33280MB

$gpu = Get-PnpDevice -FriendlyName "*NVIDIA*" -Class Display | Select-Object -First 1
$pfad = ($gpu | Get-PnpDeviceProperty DEVPKEY_Device_LocationPaths).Data[0]
Disable-PnpDevice -InstanceId $gpu.InstanceId -Confirm:$false
Dismount-VMHostAssignableDevice -LocationPath $pfad -Force
Add-VMAssignableDevice -LocationPath $pfad -VMName $vm
Get-VMAssignableDevice -VMName $vm
Start-VM $vm

# Rückgabe an den Host
Stop-VM $vm
Remove-VMAssignableDevice -LocationPath $pfad -VMName $vm
Mount-VMHostAssignableDevice -LocationPath $pfad
Enable-PnpDevice -InstanceId $gpu.InstanceId -Confirm:$false

# GPU-Partitionierung (Server 2025, unterstützte GPU)
Get-VMHostPartitionableGpu | Format-List Name, ValidPartitionCounts
Set-VMHostPartitionableGpu -Name (Get-VMHostPartitionableGpu).Name -PartitionCount 4
Add-VMGpuPartitionAdapter -VMName VDI01
```

## Einfach

Normalerweise teilen sich alle VMs die Hardware des Hosts über eine **Übersetzungsschicht** – das ist flexibel, aber für manche Aufgaben zu langsam (z. B. **3D-Grafik, KI-Berechnungen** auf der Grafikkarte).

**DDA** ist, als würdest du einer VM **eine echte Grafikkarte direkt in die Hand geben**: Die VM steckt sozusagen „selbst“ in der Karte, benutzt den **echten Treiber** des Herstellers und bekommt die **volle Leistung**.

**Aber**:
- Die Karte gehört dann **nur dieser einen VM** – der Host und andere VMs können sie nicht mehr benutzen.
- Die VM kann **nicht mehr einfach umziehen** (keine Live-Migration) – sie ist mit der Karte verheiratet.
- Der Host braucht dafür einen Prozessor mit der Sonderfunktion **IOMMU (VT-d)**.

**Ablauf**: Karte am Host **abmelden** („Ich brauche sie nicht mehr“) → der VM **zuweisen** → in der VM den **Treiber installieren**.

**Neu in Server 2025 – GPU-Partitionierung**: Statt die ganze Karte einer VM zu geben, wird sie wie eine **Pizza in Stücke** geschnitten – mehrere VMs bekommen je ein Stück. Und die VMs dürfen sogar umziehen.

## Merksatz
- DDA = **PCIe-Passthrough**, **ganzes Gerät → eine VM**, Originaltreiber.
- Voraussetzung: **IOMMU (VT-d/AMD-Vi)**, Windows **Server**, Stoppaktion **TurnOff**.
- Ablauf: **Disable-PnpDevice → Dismount-VMHostAssignableDevice → Add-VMAssignableDevice**.
- **Keine Live-Migration**, keine Prüfpunkte.
- **GPU-P** (Server 2025): GPU teilen, Live-Migration möglich.

## Prüfungsfalle
- DDA gibt es nicht auf Client-Hyper-V (Windows 10/11).
- Gerät muss vorher auf dem Host deaktiviert und abgemeldet werden.
- Automatische Stoppaktion „Speichern“ verhindert den Start mit DDA.
- GPUs benötigen vergrößerte MMIO-Bereiche.
- RemoteFX vGPU ist entfernt – nicht mehr als Lösung wählen.

## Grafik
### Direkter Draht
Links: VMs greifen über eine Übersetzungsschicht (Hypervisor) auf eine GPU zu (langsamer). Rechts: eine VM ist per direktem Kabel (IOMMU) mit der GPU verbunden, das Hyper-V-Schild „Gerät abgemeldet“ am Host.

### Pizza-GPU
GPU als Pizza, in 4 Stücke geschnitten, jedes Stück fliegt zu einer VDI-VM; Umschalter „Live-Migration“ zeigt eine VM mitsamt Stück auf einen anderen Host umziehen.

## Karteikarten
- F: Was ist Discrete Device Assignment? | A: Direkte Durchreichung eines ganzen PCIe-Geräts (GPU, NVMe) an eine VM.
- F: Hardwarevoraussetzung für DDA? | A: IOMMU (Intel VT-d / AMD-Vi) mit Interrupt-Remapping/ACS.
- F: Welche automatische Stoppaktion ist für DDA nötig? | A: Ausschalten (TurnOff).
- F: Drei Cmdlets zur Zuweisung? | A: Disable-PnpDevice, Dismount-VMHostAssignableDevice, Add-VMAssignableDevice.
- F: Wie findet man den Pfad des Geräts? | A: Geräte-Manager → Details → Pfade zum Speicherort (LocationPath).
- F: Kann eine VM mit DDA live migriert werden? | A: Nein.
- F: Was ist GPU-Partitionierung? | A: Aufteilung einer GPU auf mehrere VMs (Server 2025), inkl. Live-Migration.
- F: Welcher Treiber wird bei DDA im Gast verwendet? | A: Der Originaltreiber des Hardwareherstellers.

## Quiz
? Eine KI-Anwendung in einer VM braucht exklusiv die volle Leistung einer GPU. Welche Technik?
* Discrete Device Assignment
- Dynamischer Arbeitsspeicher
- Erweiterter Sitzungsmodus
- Nested Virtualization

? Welche Hardwarefunktion ist für DDA zwingend?
* IOMMU (VT-d bzw. AMD-Vi)
- Hyper-Threading
- TPM 2.0
- NUMA-Spanning

? Was muss vor Add-VMAssignableDevice auf dem Host passieren?
* Gerät deaktivieren und mit Dismount-VMHostAssignableDevice abmelden
- Host neu installieren
- VM live migrieren
- Gerät formatieren

? Welche Einschränkung gilt für VMs mit DDA?
* Keine Live-Migration
- Kein Netzwerk
- Nur Linux-Gäste
- Nur 1 GB RAM

? Mehrere VDI-VMs sollen sich eine GPU teilen und migrierbar bleiben. Lösung ab Server 2025?
* GPU-Partitionierung (GPU-P)
- DDA für jede VM
- RemoteFX vGPU
- Smart Paging

? Welches Cmdlet trennt ein PCIe-Gerät vom Host, damit es an eine VM übergeben werden kann?
* Dismount-VMHostAssignableDevice
- Remove-VMHardDiskDrive
- Disable-NetAdapter
- Stop-VM
! Vorher Gerät im Geräte-Manager bzw. per Disable-PnpDevice deaktivieren.

? Welche Generation muss eine VM für DDA haben?
* Generation 2
- Generation 1
- Beide gleichermaßen
- Generation 3
! DDA setzt UEFI-basierte Gen-2-VMs voraus.

? Welche Einstellung muss für DDA bei Ausschalten des Hosts in der VM gesetzt sein?
* AutomaticStopAction auf TurnOff
- AutomaticStopAction auf Save
- Dynamic Memory aktiviert
- Prüfpunkte aktiviert
! Gespeicherter Zustand wird mit durchgereichten Geräten nicht unterstützt.
