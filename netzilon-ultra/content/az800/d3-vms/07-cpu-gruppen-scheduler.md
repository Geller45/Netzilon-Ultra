---
id: az800-cpu-gruppen
bereich: AZ-800
block: A7
kapitel: VMs & Container
titel: VM-Ressourcensteuerung – vCPU, CPU-Gruppen, Scheduler-Typen, Ressourcengruppen
stufe: Profi
quellen: [AZ-800 Study Guide, Microsoft Learn]
verweise: [ap1-a1-prozessor, az800-vm-ram, az800-dda, az800-vhdx]
---

## Profi

### Virtuelle Prozessoren
- **vCPU-Anzahl** pro VM (Server 2025: bis zu 2.048 vCPUs bei Gen 2). Faustregel: nicht mehr vCPUs als nötig – zu viele vCPUs erhöhen die Scheduling-Latenz.
- **Überbuchung** (Overcommit): Summe der vCPUs aller VMs darf größer sein als die Anzahl logischer Prozessoren des Hosts (typisch 4:1 bis 8:1 bei leichten Lasten).
- **Ressourcensteuerung** pro VM (VM → Prozessor):
  - **Reserve für VM (%)** – garantierter Anteil (Minimum),
  - **Grenzwert für VM (%)** – Obergrenze (Maximum),
  - **Relative Gewichtung** (1–10.000, Standard 100) – Priorität bei Konkurrenz.
- **Prozessorkompatibilität** („Zu einem physischen Computer mit einer anderen Prozessorversion migrieren“) – für Live-Migration zwischen unterschiedlichen CPU-Generationen **desselben Herstellers**; ab Server 2025 **dynamischer Prozessorkompatibilitätsmodus** (nutzt den gemeinsamen Funktionsumfang aller Clusterknoten statt eines minimalen Satzes).
- **Hardwarethreadanzahl pro Kern** (SMT in der VM, ab Konfigurationsversion 8.0).

### Hypervisor-Scheduler-Typen
Der Hyper-V-Hypervisor verteilt vCPUs auf logische Prozessoren. Es gibt drei Scheduler:
| Typ | Funktionsweise | Einsatz |
|---|---|---|
| **Klassischer Scheduler** | verteilt vCPUs aller VMs frei auf alle logischen Prozessoren (Fair Share) | älterer Standard (bis Server 2016); **anfällig** für Seitenkanalangriffe über SMT-Geschwister (L1TF/„Foreshadow“) |
| **Core Scheduler** | vCPUs einer VM werden **kernweise** geplant: SMT-Geschwister eines physischen Kerns laufen nie gleichzeitig für **unterschiedliche** VMs → **Isolation** gegen Seitenkanalangriffe; Gast sieht SMT-Topologie | **Standard ab Windows Server 2019** |
| **Root Scheduler** | Planung übernimmt die Root-Partition (Host-OS) | **Windows 10/11 Client-Hyper-V** (Standard), nicht für Server empfohlen |
Anzeigen: Ereignisanzeige → Hyper-V-Hypervisor → **Ereignis-ID 2** (Scheduler-Typ beim Start). Einstellen: `bcdedit /set hypervisorschedulertype Core|Classic|Root` + Neustart des Hosts.

### CPU-Gruppen (Minroot, CpuGroups)
Mit **CPU-Gruppen** (seit Server 2016 bzw. 2019, verwaltet mit dem Tool **`cpugroups.exe`** aus dem Microsoft Download Center) lassen sich
- **CPU-Kapazität** für eine **Gruppe von VMs** begrenzen (z. B. Mandant A max. 50 % des Hosts),
- VMs auf **bestimmte logische Prozessoren** festlegen (Affinität) – z. B. Isolation eines Mandanten oder einer Leistungsklasse.
Einsatz: **Hoster/Mandantentrennung**, **Lizenzierung** (Anwendungen, die nach genutzten Kernen lizenziert werden), Performance-Isolation. Typische Befehle: `cpugroups.exe GetCpuGroups`, `CreateGroup /GroupId:<GUID> /GroupAffinity:0,1,16,17`, `SetGroupProperty /CpuCap:32768` (Hälfte), VM-Zuweisung per WMI/`Set-VMProcessor -CpuGroupId`.
**Minroot** (Host-Ressourcensteuerung): Beschränkt die **Root-Partition** (Host-OS) auf bestimmte Kerne (`bcdedit /set hypervisorrootproc <n>`), damit der Host nicht mit VMs konkurriert.

### VM-Ressourcengruppen (Ressourcenmessung und Kontingente)
- **Ressourcenmessung** (Resource Metering, seit 2012): erfasst pro VM durchschnittliche CPU-/RAM-Nutzung, Datenträger-IO, Netzwerkverkehr → Abrechnung/Kapazitätsplanung.
  `Enable-VMResourceMetering`, `Measure-VM`, `Reset-VMResourceMetering`.
- **Ressourcenpools** (`New-VMResourcePool`): VMs/Ressourcen (Speicher, Ethernet, Prozessor) zu Pools zusammenfassen und gemeinsam messen, z. B. pro Abteilung.
- **Storage QoS** (siehe Storage-Bereich): IOPS-Minimum/Maximum pro virtueller Festplatte bzw. zentral im Cluster.
- **Bandbreitenverwaltung** an der vNIC (Minimum/Maximum Mbit/s).
- **VM-Gruppen** (VM Collections, `New-VMGroup`): logische Gruppierung von VMs (z. B. für gemeinsame Prüfpunkte/Replikation/Verwaltung) – **VMCollectionType** und **ManagementCollectionType**.

## Lab
**Maschinen**: Hyper-V-**Host**, VMs **WEB01**, **WEB02**, **TEST01**.

### GUI
1. **WEB01** → Einstellungen → **Prozessor** → Anzahl virtueller Prozessoren **2** → Ressourcensteuerung: **Reserve 20 %**, **Grenzwert 60 %**, **Gewichtung 200**.
2. **TEST01** → Prozessor → Grenzwert **25 %**, Gewichtung 50.
3. **WEB02** (aus) → Prozessor → **Kompatibilität** → Haken „Zu einem physischen Computer mit einer anderen Prozessorversion migrieren“.
4. **Host**: Ereignisanzeige → Anwendungs- und Dienstprotokolle → Microsoft → Windows → **Hyper-V-Hypervisor** → Operational → **Ereignis-ID 2** → Scheduler-Typ ablesen (Core).

### PowerShell
```powershell
# Auf dem Host
Set-VMProcessor -VMName WEB01 -Count 2 -Reserve 20 -Maximum 60 -RelativeWeight 200
Set-VMProcessor -VMName TEST01 -Maximum 25 -RelativeWeight 50
Set-VMProcessor -VMName WEB02 -CompatibilityForMigrationEnabled $true
Get-VMProcessor -VMName * | Format-Table VMName, Count, Reserve, Maximum, RelativeWeight

# Scheduler-Typ
Get-WinEvent -FilterHashtable @{ProviderName="Microsoft-Windows-Hyper-V-Hypervisor"; Id=2} -MaxEvents 1 | Select-Object Message
bcdedit /set hypervisorschedulertype Core        # erfordert Neustart

# Ressourcenmessung
Enable-VMResourceMetering -VMName WEB01, WEB02
Measure-VM -VMName WEB01, WEB02 | Format-Table VMName, AvgCPU, AvgRAM, TotalDisk, NetworkMeteredTrafficReport
Reset-VMResourceMetering -VMName WEB01

# VM-Gruppe
New-VMGroup -Name "Webfarm" -GroupType VMCollectionType
Add-VMGroupMember -Name "Webfarm" -VM (Get-VM WEB01, WEB02)
Get-VMGroup
```

## Einfach

Der Host hat eine bestimmte Anzahl **Köche** (Prozessorkerne), und viele VMs wollen **kochen lassen**.

- **vCPUs** = wie viele Köche eine VM gleichzeitig beschäftigen darf. Zu viele vCPUs sind nicht automatisch besser – die VM muss dann warten, bis **alle ihre** Köche gleichzeitig frei sind.
- **Reserve** = „Mindestens 20 % der Küche gehört garantiert mir.“
- **Grenzwert** = „Mehr als 60 % darf ich nie belegen“ (damit eine VM nicht alles blockiert).
- **Gewichtung** = wer bei Andrang **Vortritt** hat.

**Scheduler** = der **Küchenchef**, der entscheidet, welcher Koch wann für wen arbeitet:
- **Klassisch**: Jeder Koch kocht für jeden – schnell, aber zwei Kunden stehen am selben Herd und könnten sich gegenseitig **in die Töpfe schauen** (Sicherheitslücke).
- **Core Scheduler** (Standard ab Server 2019): Ein ganzer **Herd (Kern)** gehört in einem Moment immer nur **einer VM** – niemand kann spionieren.
- **Root**: Chefkoch ist das Host-Windows – für Windows-Client-PCs.

**CPU-Gruppen** = Du teilst die Küche in **abgetrennte Bereiche**: „Mandant A darf nur diese 4 Herde benutzen.“ Nützlich für Hoster oder für Software, die nach Kernen bezahlt wird.

**Ressourcenmessung** = ein **Stromzähler pro VM**: Wie viel CPU, RAM, Festplatte, Netzwerk hat sie verbraucht? Gut zum Abrechnen.

## Merksatz
- Pro VM: **Reserve (Min) – Grenzwert (Max) – Gewichtung**.
- Scheduler: **Classic** (alt), **Core** (Server-Standard ab 2019, sicher), **Root** (Client).
- Scheduler-Typ steht im **Hypervisor-Ereignis ID 2**; ändern mit **bcdedit**.
- **CPU-Gruppen** = Kapazitätsgrenze/Affinität für VM-Gruppen (`cpugroups.exe`).
- **Measure-VM** nach **Enable-VMResourceMetering**.

## Prüfungsfalle
- Mehr vCPUs ≠ schneller.
- Prozessorkompatibilität gilt nur innerhalb eines Herstellers (Intel ↔ AMD geht nie live).
- Core Scheduler kann die maximale Leistung leicht senken, bringt aber Isolation.
- Scheduler-Änderung erfordert Host-Neustart.
- Ressourcenmessung muss vor Measure-VM aktiviert werden.

## Grafik
### Küche mit Köchen
Host-Küche mit Herden (Kerne) und je zwei Kochfeldern (SMT-Threads); VMs als Kunden mit Bestellungen; Regler Reserve/Grenzwert/Gewichtung bei jedem Kunden. Umschalter Classic/Core: bei Classic stehen zwei Kunden an einem Herd (Warnsymbol „Seitenkanal“), bei Core nur einer.

### CPU-Gruppen
Küche durch Absperrbänder in Bereiche geteilt; Mandant A nur in Bereich 1 (4 Herde), Mandant B in Bereich 2.

### Stromzähler
Pro VM ein Zähler für CPU, RAM, Disk, Netzwerk; Measure-VM erzeugt eine Rechnung.

## Karteikarten
- F: Drei Ressourcensteuerungswerte für vCPUs? | A: Reserve (Minimum %), Grenzwert (Maximum %), relative Gewichtung.
- F: Standard-Scheduler von Windows Server 2019+? | A: Core Scheduler.
- F: Warum Core Scheduler? | A: Isolation – SMT-Geschwister eines Kerns laufen nie für verschiedene VMs → Schutz vor Seitenkanalangriffen.
- F: Wo sieht man den aktiven Scheduler-Typ? | A: Ereignisprotokoll Hyper-V-Hypervisor, Ereignis-ID 2.
- F: Wie ändert man den Scheduler? | A: bcdedit /set hypervisorschedulertype Core|Classic|Root und Neustart.
- F: Was sind CPU-Gruppen? | A: Zusammenfassung von VMs mit gemeinsamer CPU-Kapazitätsgrenze und/oder Prozessoraffinität (cpugroups.exe).
- F: Wozu dient die Prozessorkompatibilität? | A: Live-Migration zwischen Hosts mit unterschiedlichen CPU-Generationen desselben Herstellers.
- F: Welche Cmdlets messen den Ressourcenverbrauch einer VM? | A: Enable-VMResourceMetering und Measure-VM.

## Quiz
? Eine Test-VM soll nie mehr als 25 % der zugewiesenen CPU-Kapazität verbrauchen. Welche Einstellung?
* Grenzwert für VM (Maximum) 25 %
- Reserve 25 %
- Gewichtung 25
- 25 vCPUs

? Welcher Scheduler ist auf Windows Server 2019 und neuer Standard?
* Core Scheduler
- Klassischer Scheduler
- Root Scheduler
- Round-Robin-Scheduler

? Wie findet man heraus, welcher Scheduler-Typ aktiv ist?
* Hyper-V-Hypervisor-Ereignisprotokoll, Ereignis-ID 2
- Get-VMProcessor
- Task-Manager
- dcdiag

? Ein Hoster will die CPU-Nutzung aller VMs eines Mandanten gemeinsam begrenzen. Was nutzt er?
* CPU-Gruppen
- Smart Paging
- Dynamischen Arbeitsspeicher
- DDA

? Wozu dient Measure-VM?
* Auswertung des Ressourcenverbrauchs (CPU, RAM, Disk, Netzwerk) einer VM
- Messen der VM-Größe auf der Festplatte
- Prüfen der VM-Konfigurationsversion
- Migration einer VM
