---
id: server-hyperv-nested-grundlagen
bereich: AZ-800
block: HV
kapitel: Hyper-V vertieft
titel: Verschachtelte Virtualisierung – Prinzip, Voraussetzungen, Aktivierung
stufe: Fortgeschritten
fach: Windows Server / AZ-800
pruefungen: [AZ-800, AP2, Schule]
quellen: [Microsoft Learn – Hyper-V-Dokumentation, AZ-800 Study Guide]
verweise: [az800-nested, az800-vm-ram, az800-azure-vms, az800-windows-container, server-hyperv-nested-netzwerk, server-hyperv-nested-einschraenkungen, server-hyperv-nested-lab]
---

## Profi

### Prinzip
**Verschachtelte Virtualisierung** (*Nested Virtualization*) bedeutet: Ein Hypervisor läuft **innerhalb einer virtuellen Maschine** und startet dort selbst wieder VMs – „VM in der VM“. Bei Hyper-V spricht man von drei Ebenen:

| Ebene | Bezeichnung | Beispiel im Heimlabor |
|---|---|---|
| L0 | physischer Host mit Hyper-V | **HV01.example.com** |
| L1 | äußere VM (*Guest Hypervisor*), in der wieder Hyper-V installiert ist | **HV-NESTED** |
| L2 | innere VM (*Nested Guest*) | **INNER01** |

Normalerweise sieht eine VM die Hardware-Virtualisierungsfunktionen der CPU (**Intel VT-x** bzw. **AMD-V**) **nicht** – der Hypervisor auf L0 behält sie für sich. Mit verschachtelter Virtualisierung **reicht der L0-Hypervisor diese Erweiterungen an die VM weiter** (*Expose Virtualization Extensions*). Hyper-V auf L1 glaubt dann, auf echter Hardware mit VT-x/AMD-V zu laufen, und kann die Rolle Hyper-V installieren und starten.

Technisch fängt der L0-Hypervisor die Virtualisierungsbefehle der L1-VM ab und **emuliert** sie (Intel: VMX-Befehle wie VMLAUNCH/VMRESUME; Speicher-Übersetzung über **EPT** – *Extended Page Tables* bzw. bei AMD **NPT/RVI**). Darum ist **EPT/SLAT** (*Second Level Address Translation*) Pflicht: ohne Hardware-Adressübersetzung wäre die Doppel-Übersetzung (L2 → L1 → L0) unbrauchbar langsam.

### Voraussetzungen (Microsoft Learn, Stand Server 2022/2025)
| Bereich | Intel | AMD |
|---|---|---|
| Prozessor | **VT-x mit EPT** | **AMD EPYC oder Ryzen** (mit AMD-V/RVI) |
| Host-Betriebssystem | Windows Server **2016** oder neuer, Windows 10 oder neuer | Windows Server **2022** oder neuer, **Windows 11** oder neuer |
| VM-Konfigurationsversion | **8.0** oder höher | laut Microsoft-Doku **9.3** oder höher (Faustregel für die Prüfung: in jedem Fall ≥ 8.0) |
| Zustand der VM beim Aktivieren | **ausgeschaltet** (*Off*) | ausgeschaltet |

Weitere praktische Voraussetzungen:
- **Gastbetriebssystem in L1**: ein Betriebssystem, das Hyper-V ausführen kann (Windows Server 2016+ oder Windows 10/11 Pro/Enterprise/Education). Andere Hypervisoren in der VM (z. B. KVM unter Linux) funktionieren grundsätzlich auch, Microsoft dokumentiert aber primär Hyper-V-in-Hyper-V.
- **Arbeitsspeicher**: genug RAM für L1 **plus** alle L2-VMs (Faustregel: mind. 4 GB für die äußere VM, im Lab eher 8–16 GB). Statischer RAM ist die sichere Wahl (Details: Einschränkungen).
- **vCPUs**: mindestens 2 vCPUs für die äußere VM.
- **Netzwerk**: MAC-Adress-Spoofing oder NAT, sonst haben innere VMs kein Netz.

### Aktivieren
Die Einstellung sitzt am **virtuellen Prozessor** der VM und gibt es **nur per PowerShell** – im Hyper-V-Manager existiert kein Kontrollkästchen dafür.
```powershell
# Auf HV01.example.com (L0), HV-NESTED ausgeschaltet
Set-VMProcessor -VMName HV-NESTED -ExposeVirtualizationExtensions $true
Get-VMProcessor -VMName HV-NESTED | Select-Object VMName, Count, ExposeVirtualizationExtensions
```
Läuft die VM, bricht das Cmdlet mit einem Fehler ab (Zustand ungültig). Danach VM starten und in L1 die Hyper-V-Rolle installieren. Ausschalten = `$false` (ebenfalls nur bei ausgeschalteter VM).

Konfigurationsversion prüfen bzw. anheben:
```powershell
Get-VM -Name HV-NESTED | Select-Object Name, Version, Generation
Update-VMVersion -Name HV-NESTED     # nur bei ausgeschalteter VM, nicht umkehrbar
Get-VMHostSupportedVersion            # welche Versionen kann dieser Host?
```

Microsoft stellt zusätzlich das Skript **Get-NestedVirtStatus.ps1** (GitHub-Repository „Virtualization-Documentation“) bereit, das Host und VM auf die Voraussetzungen prüft.

### Einsatzszenarien
- **Lab, Schulung, Prüfungsvorbereitung**: mehrere Hyper-V-Hosts, Failover-Cluster, Live-Migration, Azure Local (früher Azure Stack HCI) auf **einem** physischen PC.
- **Hyper-V-Container / Hyper-V-Isolation**: Container mit eigener Kernel-Isolation in einer VM betreiben (`docker run --isolation=hyperv`).
- **Entwicklung und Test**: Android-Emulator, WSL 2, Windows-Sandbox oder Docker Desktop in einer Entwickler-VM.
- **Virtualisierungsbasierte Sicherheit (VBS) im Gast**: Credential Guard, HVCI (Speicherintegrität) im Gast brauchen selbst Virtualisierungserweiterungen.
- **Azure-VMs**: Hyper-V in einer Azure-VM (nur Größen mit Nested-Unterstützung, z. B. viele Dv3/Dv4/Dv5- und Ev3/Ev4/Ev5-Größen), z. B. für Migrations- und Schulungslabs.
- **Nicht** gedacht für: produktive Hochlast-Workloads auf mehreren Schachtelungsebenen – jede Ebene kostet Leistung.

### Wie erkennt man, dass es funktioniert?
- In L1: `Get-ComputerInfo -Property "HyperV*"` zeigt bei fehlender Weitergabe `HyperVRequirementVirtualizationFirmwareEnabled : False` bzw. nach Rolleninstallation `HyperVisorPresent : True`.
- `systeminfo` in L1 zeigt ohne Weitergabe „Virtualisierung in Firmware aktiviert: Nein“ – Installation der Hyper-V-Rolle schlägt dann fehl („Der Prozessor besitzt nicht die erforderlichen Virtualisierungsfunktionen“).
- Taskmanager in L1 → Leistung → CPU: „Virtualisierung: Aktiviert“.

## Einfach

Stell dir eine **Matroschka** vor – eine Holzpuppe, in der eine kleinere Puppe steckt, in der wieder eine kleinere steckt.

- Die **große Puppe** ist dein echter Computer **HV01**. Auf ihm läuft Hyper-V.
- Darin steckt eine **mittlere Puppe**: die virtuelle Maschine **HV-NESTED**.
- Und in der mittleren Puppe steckt eine **kleine Puppe**: die innere VM **INNER01**.

Normalerweise ist die mittlere Puppe **massiv** – man kann in sie nichts hineinstecken. Der Prozessor hat zwar „Zauberkräfte“ zum Virtualisieren (VT-x oder AMD-V), aber der große Hyper-V behält sie für sich. Mit dem Befehl **ExposeVirtualizationExtensions** sagt man ihm: „Gib deine Zauberkräfte an diese VM weiter!“ Jetzt ist die mittlere Puppe **hohl** und kann selbst Puppen aufnehmen.

Damit das klappt, gelten ein paar Regeln:
1. Die mittlere Puppe muss beim Umbauen **zu** sein – die VM muss **ausgeschaltet** sein.
2. Der Prozessor muss die Zauberkraft wirklich haben: Intel mit **VT-x und EPT**, AMD-Prozessoren erst ab **Windows Server 2022 bzw. Windows 11** auf dem Host.
3. Die VM muss „neu genug“ gebaut sein: **Konfigurationsversion 8.0 oder höher**.
4. Die mittlere Puppe braucht genug **Platz** (Arbeitsspeicher), denn die kleinen Puppen wohnen in ihr.

**Wofür macht man das?** Vor allem zum **Üben**: Du hast nur einen PC, willst aber wie in einer Firma mehrere Hyper-V-Server und sogar einen Cluster bauen. Mit verschachtelter Virtualisierung baust du ein ganzes Rechenzentrum in deinem PC.

**Haken**: Jede Puppe macht das Ganze etwas **langsamer** und braucht Speicher. Zum Lernen super, für eine große Firmenanwendung eher nicht.

## Merksatz
- L0 Host → L1 äußere VM (Hyper-V) → L2 innere VM.
- `Set-VMProcessor -ExposeVirtualizationExtensions $true` – nur PowerShell, **VM aus!**
- Intel: VT-x + EPT, ab Server 2016/Win 10. AMD: ab **Server 2022 / Win 11**.
- Konfigurationsversion **≥ 8.0** (AMD laut Doku ≥ 9.3).
- Kein Haken im Hyper-V-Manager – nur Cmdlet.

## Prüfungsfalle
- Aktivierung bei **laufender** oder **gespeicherter** VM schlägt fehl – erst `Stop-VM`.
- Falsches Cmdlet: Es ist **Set-VMProcessor**, nicht Set-VM, Set-VMHost oder Set-VMMemory.
- „AMD geht nicht“ ist veraltet: Seit **Windows Server 2022 / Windows 11** werden AMD EPYC/Ryzen unterstützt.
- Alte VM mit Konfigurationsversion 5.0 (aus Server 2012 R2 übernommen) → erst `Update-VMVersion`.
- Die Hyper-V-Rolle in L1 lässt sich ohne Weitergabe nicht installieren – Fehlermeldung über fehlende Virtualisierungsfunktionen.
- Nicht jede **Azure-VM-Größe** kann Nested – auf „Nested Virtualization supported“ achten.

## Grafik
### Erweiterungen weitergeben
1. Admin -> HV01: Stop-VM HV-NESTED
2. Admin -> HV01: Set-VMProcessor -ExposeVirtualizationExtensions $true
3. HV01 -> HV-NESTED: VT-x/EPT werden an die VM durchgereicht
4. HV-NESTED: Hyper-V-Rolle installiert, Hypervisor startet
5. HV-NESTED -> INNER01: innere VM wird gestartet
6. INNER01 -> HV-NESTED: VMX-Befehl
7. HV-NESTED -> HV01: L0 fängt ab und emuliert für L1

### Ebenenmodell
1. Hardware: CPU mit VT-x und EPT
2. HV01: L0 – Hyper-V auf dem physischen Server
3. HV-NESTED: L1 – Gast-Hypervisor
4. INNER01: L2 – verschachtelte VM

## Lab
**Maschinen**: physischer Host **HV01.example.com** (Windows Server 2025, Hyper-V-Rolle, Intel VT-x/EPT oder AMD EPYC/Ryzen), äußere VM **HV-NESTED** (Gen 2, Windows Server 2025, 4 vCPU, 8 GB statisch), innere VM **INNER01** (Gen 2, 1–2 GB).

### GUI
1. **HV01**: Hyper-V-Manager → HV-NESTED → **Herunterfahren**.
2. **HV01**: HV-NESTED → Einstellungen → **Arbeitsspeicher** → 8192 MB, Haken „Dynamischen Arbeitsspeicher aktivieren“ **entfernen**.
3. **HV01**: Einstellungen → **Prozessor** → 4 virtuelle Prozessoren. (Die Weitergabe der Erweiterungen gibt es hier **nicht** – siehe PowerShell.)
4. **HV01**: Einstellungen → Netzwerkkarte → **Erweiterte Features** → „Spoofing von MAC-Adressen aktivieren“.
5. **HV01**: PowerShell-Schritt „ExposeVirtualizationExtensions“ ausführen (siehe unten), dann HV-NESTED **starten**.
6. **HV-NESTED**: Server-Manager → Rollen und Features hinzufügen → **Hyper-V** → vSwitch extern anlegen → Neustart.
7. **HV-NESTED**: Hyper-V-Manager → Neu → Virtueller Computer → **INNER01**, Generation 2, 2048 MB, ISO einlegen → starten.

### PowerShell
```powershell
# Auf HV01.example.com (L0)
Stop-VM -Name HV-NESTED
Get-VM -Name HV-NESTED | Select-Object Name, State, Version, Generation
Set-VMProcessor -VMName HV-NESTED -ExposeVirtualizationExtensions $true -Count 4
Set-VMMemory -VMName HV-NESTED -DynamicMemoryEnabled $false -StartupBytes 8GB
Get-VMNetworkAdapter -VMName HV-NESTED | Set-VMNetworkAdapter -MacAddressSpoofing On
Start-VM -Name HV-NESTED

# In HV-NESTED (L1), z. B. per PowerShell Direct vom Host:
Enter-PSSession -VMName HV-NESTED
Get-ComputerInfo -Property "HyperV*"
Install-WindowsFeature -Name Hyper-V -IncludeManagementTools -Restart

# Nach dem Neustart in HV-NESTED: innere VM anlegen
New-VM -Name INNER01 -Generation 2 -MemoryStartupBytes 2GB -NewVHDPath C:\VMs\INNER01.vhdx -NewVHDSizeBytes 40GB
Start-VM -Name INNER01
```

## Legende
### Verschachtelte Virtualisierung
- Was: Hyper-V (oder ein anderer Hypervisor) läuft innerhalb einer VM und betreibt dort eigene VMs.
- Wie: Der L0-Hypervisor reicht VT-x/AMD-V an die VM weiter (`Set-VMProcessor -ExposeVirtualizationExtensions $true`) und emuliert deren Virtualisierungsbefehle.
- Wann: Labs, Schulung, Cluster-Übungen, Hyper-V-Container, VBS im Gast, Azure-Testumgebungen.
- Wo: Auf dem physischen Host HV01 an der äußeren VM HV-NESTED; in Azure an unterstützten VM-Größen.
- Warum: Komplette Rechenzentrumsszenarien auf wenig Hardware nachbauen und Funktionen nutzen, die selbst Virtualisierung brauchen.
### ExposeVirtualizationExtensions
- Was: Eigenschaft des virtuellen Prozessors einer VM.
- Wie: Nur per PowerShell setzen, VM muss ausgeschaltet sein.
- Womit: `Set-VMProcessor`, Kontrolle mit `Get-VMProcessor`.
- Beispiel: `Set-VMProcessor -VMName HV-NESTED -ExposeVirtualizationExtensions $true`

## Karteikarten
- F: Was bedeutet verschachtelte Virtualisierung (Nested Virtualization)? | A: Ein Hypervisor läuft innerhalb einer VM und startet dort eigene VMs (VM in der VM).
- F: Was sind L0, L1 und L2? | A: L0 = physischer Host, L1 = äußere VM mit Hyper-V (Gast-Hypervisor), L2 = innere (verschachtelte) VM.
- F: Mit welchem Cmdlet aktiviert man Nested Virtualization? | A: Set-VMProcessor -VMName <VM> -ExposeVirtualizationExtensions $true
- F: In welchem Zustand muss die VM beim Aktivieren sein? | A: Ausgeschaltet (Off).
- F: Welche Intel-Funktionen sind Pflicht? | A: VT-x mit EPT (Extended Page Tables / SLAT).
- F: Ab welchem Host-Betriebssystem werden AMD-Prozessoren unterstützt? | A: Ab Windows Server 2022 bzw. Windows 11 (AMD EPYC/Ryzen).
- F: Welche Mindest-Konfigurationsversion braucht die VM? | A: 8.0 (bei AMD laut Microsoft-Doku 9.3 oder höher).
- F: Wie prüft man die Konfigurationsversion einer VM? | A: Get-VM -Name <VM> \| Select-Object Name, Version
- F: Gibt es im Hyper-V-Manager ein Kontrollkästchen für Nested? | A: Nein, nur per PowerShell (Set-VMProcessor).
- F: Nenne drei Einsatzszenarien. | A: Lab/Cluster-Übungen auf einem PC, Hyper-V-Container-Isolation, VBS/Credential Guard im Gast, Hyper-V in Azure-VMs.
- F: Wie hebt man die Konfigurationsversion an? | A: Update-VMVersion -Name <VM> bei ausgeschalteter VM – nicht umkehrbar.
- F: Woran erkennt man in L1 fehlende Weitergabe? | A: Hyper-V-Rolle lässt sich nicht installieren, systeminfo/Get-ComputerInfo melden Virtualisierung in Firmware nicht aktiviert.

## Quiz
? Ein Administrator möchte in der VM „HV-NESTED“ die Hyper-V-Rolle installieren. Welcher Befehl muss vorher auf dem physischen Host ausgeführt werden?
* Set-VMProcessor -VMName HV-NESTED -ExposeVirtualizationExtensions $true
- Set-VM -VMName HV-NESTED -NestedVirtualization On
- Set-VMHost -VirtualizationExtensions $true
- Enable-VMIntegrationService -VMName HV-NESTED -Name Nested
! Die Weitergabe der Virtualisierungserweiterungen ist eine Eigenschaft des virtuellen Prozessors und wird mit Set-VMProcessor gesetzt.

? Das Cmdlet Set-VMProcessor -ExposeVirtualizationExtensions $true meldet einen Fehler. Was ist die häufigste Ursache?
* Die VM läuft noch
- Die VM hat zu wenig Festplattenplatz
- Der Host ist kein Domänenmitglied
- Die erweiterte Sitzung ist aktiviert
! Die Einstellung kann nur bei ausgeschalteter VM geändert werden. Ein gespeicherter Zustand zählt ebenfalls nicht als „aus“.

? Ab welchem Host-Betriebssystem unterstützt Hyper-V verschachtelte Virtualisierung auf AMD-Prozessoren?
* Windows Server 2022 / Windows 11
- Windows Server 2012 R2 / Windows 8.1
- Windows Server 2016 / Windows 10 1607
- Nur Windows Server 2025
! Intel-Unterstützung gibt es seit Server 2016/Windows 10, AMD EPYC/Ryzen erst seit Server 2022/Windows 11.

? Welche CPU-Funktion ist bei Intel-Prozessoren neben VT-x zwingend erforderlich?
* EPT (Extended Page Tables)
- Hyper-Threading
- AES-NI
- Turbo Boost
! EPT ist Intels Umsetzung von SLAT; ohne sie wäre die doppelte Adressübersetzung zu langsam und wird nicht unterstützt.

? Welche Mindest-Konfigurationsversion muss eine VM für Nested Virtualization (Intel) haben?
* 8.0
- 5.0
- 6.2
- 12.0
! Version 8.0 entspricht Windows Server 2016 / Windows 10 1607 (bei AMD laut Doku 9.3 oder höher). Ältere VMs werden mit Update-VMVersion angehoben.

? In der Ebenenbetrachtung ist „L1“…
* die äußere VM, in der Hyper-V läuft
- der physische Host
- die innere VM
- der virtuelle Switch
! L0 = physischer Host, L1 = Gast-Hypervisor (äußere VM), L2 = verschachtelte VM.

? Wo aktiviert man im Hyper-V-Manager die verschachtelte Virtualisierung?
* Gar nicht – nur per PowerShell
- Einstellungen → Prozessor → Kompatibilität
- Einstellungen → Sicherheit → Sicheren Start
- Hyper-V-Einstellungen → Erweiterter Sitzungsmodus
! Es gibt kein GUI-Kontrollkästchen; die Einstellung ist nur über Set-VMProcessor erreichbar.

? Welches Szenario ist KEIN typischer Einsatzzweck verschachtelter Virtualisierung?
* Maximale Leistung für eine produktive Datenbank mit hoher Last
- Failover-Cluster-Übungslab auf einem einzelnen PC
- Hyper-V-isolierte Container in einer VM
- Credential Guard innerhalb einer VM
! Jede Schachtelungsebene kostet Leistung; Hochlast-Produktion gehört nicht in mehrfach geschachtelte VMs.

? Welcher Befehl zeigt, ob die Erweiterungen für HV-NESTED weitergegeben werden?
* Get-VMProcessor -VMName HV-NESTED
- Get-VMHost
- Get-VMSwitch
- Get-VMIntegrationService -VMName HV-NESTED
! Get-VMProcessor liefert u. a. die Eigenschaft ExposeVirtualizationExtensions.

? Eine aus Windows Server 2012 R2 importierte VM hat Version 5.0. Was ist vor dem Aktivieren von Nested nötig?
* Update-VMVersion bei ausgeschalteter VM
- Convert-VHD auf VHDX
- Neuinstallation des Hosts
- Aktivieren des dynamischen Arbeitsspeichers
! Update-VMVersion hebt die Konfigurationsversion an; danach ist die VM nicht mehr auf älteren Hosts startbar.

? Warum benötigt Credential Guard innerhalb einer VM verschachtelte Virtualisierung?
* Weil VBS selbst den Hypervisor und damit Virtualisierungserweiterungen benötigt
- Weil Credential Guard nur auf Gen-1-VMs läuft
- Weil Credential Guard MAC-Spoofing voraussetzt
- Weil Credential Guard dynamischen Arbeitsspeicher braucht
! Virtualisierungsbasierte Sicherheit nutzt den Hypervisor für isolierte Speicherbereiche – dafür muss die VM VT-x/AMD-V sehen.

? Was passiert, wenn man in einer VM ohne weitergegebene Erweiterungen die Hyper-V-Rolle installieren will?
* Die Installation wird mit einem Hinweis auf fehlende Virtualisierungsfunktionen abgelehnt
- Die Rolle installiert sich und emuliert die CPU in Software
- Der Host stürzt ab
- Die VM wird automatisch auf Gen 2 konvertiert
! Hyper-V hat keine reine Software-Emulation; ohne VT-x/AMD-V lässt sich die Rolle nicht aktivieren.

? Welches Werkzeug von Microsoft prüft Host und VM auf die Nested-Voraussetzungen?
* Das Skript Get-NestedVirtStatus.ps1
- Der Best Practices Analyzer für DNS
- Test-Cluster
- Sysprep
! Das Skript liegt im GitHub-Repository „Virtualization-Documentation“ von Microsoft.

## Lücken
- Verschachtelte Virtualisierung wird mit {Set-VMProcessor} und dem Parameter {-ExposeVirtualizationExtensions} aktiviert.
- Die VM muss dabei {ausgeschaltet|aus} sein und auf einem Intel-Host mindestens Konfigurationsversion {8.0} haben.
- Bei Intel sind {VT-x} und {EPT} erforderlich, AMD wird ab Windows Server {2022} unterstützt.

## Zuordnen
### Ebene und Rolle
- L0 => physischer Host HV01 mit Hyper-V
- L1 => äußere VM HV-NESTED als Gast-Hypervisor
- L2 => innere VM INNER01
- EPT => Hardware-Adressübersetzung (SLAT) bei Intel
- Update-VMVersion => hebt die Konfigurationsversion an

## Reihenfolge
### Nested Virtualization einrichten
1. Äußere VM HV-NESTED herunterfahren
2. Konfigurationsversion prüfen und ggf. anheben
3. Set-VMProcessor -ExposeVirtualizationExtensions $true setzen
4. Statischen Arbeitsspeicher und Netzwerk (MAC-Spoofing) konfigurieren
5. VM starten und Hyper-V-Rolle in L1 installieren
6. Innere VM INNER01 anlegen und starten

## Freitext
- F: Erläutern Sie das Prinzip der verschachtelten Virtualisierung und nennen Sie die Voraussetzungen auf einem Intel-Host. | M: Hypervisor in einer VM; der L0-Hypervisor reicht VT-x an die VM weiter und emuliert die Virtualisierungsbefehle. Voraussetzungen: Intel VT-x mit EPT, Host ab Server 2016/Windows 10, VM-Konfigurationsversion ≥ 8.0, VM beim Aktivieren aus, ausreichend RAM | P: 6
- F: Nennen Sie drei Einsatzszenarien und begründen Sie, warum Nested für Hochlast-Produktion ungeeignet ist. | M: Szenarien: Cluster-Lab, Hyper-V-Container, VBS im Gast, Azure-Lab. Ungeeignet, weil jede Ebene CPU-/RAM-Overhead und zusätzliche Latenz erzeugt sowie Funktionen wie Live-Migration der äußeren VM fehlen | P: 5

## Szenario
### Schulungslab im Ausbildungsbetrieb
Der Ausbildungsbetrieb hat einen Server **HV01.example.com** (Windows Server 2025, AMD EPYC, 128 GB RAM). Azubis sollen je eine VM **HV-AZUBI1** bis **HV-AZUBI4** bekommen, in der sie selbst Hyper-V installieren und VMs anlegen. Bei HV-AZUBI1 schlägt die Installation der Hyper-V-Rolle fehl.
- F: Welche Einstellung fehlt wahrscheinlich und wie setzen Sie sie? | A: Weitergabe der Virtualisierungserweiterungen: VM herunterfahren, Set-VMProcessor -VMName HV-AZUBI1 -ExposeVirtualizationExtensions $true | P: 3
- F: Ist AMD auf diesem Host überhaupt unterstützt? | A: Ja, AMD EPYC/Ryzen werden ab Windows Server 2022/Windows 11 als Host unterstützt; Server 2025 erfüllt das | P: 2
- F: Wie prüfen Sie alle vier VMs auf einmal? | A: Get-VM -Name HV-AZUBI* \| Get-VMProcessor \| Select-Object VMName, ExposeVirtualizationExtensions | P: 2
- F: Was müssen Sie bei der Konfigurationsversion beachten? | A: Version prüfen (Get-VM \| Select Name, Version); für AMD laut Doku ≥ 9.3, sonst Update-VMVersion bei ausgeschalteter VM | P: 2

## Spickzettel
- L0 Host, L1 Gast-Hypervisor, L2 innere VM
- Set-VMProcessor -ExposeVirtualizationExtensions $true (VM aus)
- Intel VT-x + EPT ab Server 2016; AMD ab Server 2022/Win 11
- Konfigurationsversion ≥ 8.0, Update-VMVersion
- Kein GUI-Schalter
