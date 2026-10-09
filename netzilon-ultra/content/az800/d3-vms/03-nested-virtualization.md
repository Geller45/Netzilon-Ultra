---
id: az800-nested
bereich: AZ-800
block: A7
kapitel: VMs & Container
titel: Geschachtelte Virtualisierung (Nested Virtualization)
stufe: Fortgeschritten
quellen: [AZ-800 Study Guide, Microsoft Learn]
verweise: [az800-vm-ram, az800-vswitch, az800-windows-container, az800-azure-vms]
---

## Profi

### Was ist das?
**Geschachtelte Virtualisierung** erlaubt, **innerhalb einer VM** einen Hypervisor zu betreiben – also **Hyper-V in einer Hyper-V-VM** (bzw. in einer Azure-VM). Die VM stellt ihren Gästen die Virtualisierungserweiterungen der CPU (**Intel VT-x**, **AMD-V**) zur Verfügung.

**Einsatzszenarien**:
- **Lab/Schulung/Test** (z. B. dein Heimlabor: mehrere Hyper-V-Hosts, Cluster, Azure Local zum Üben – auf einem physischen PC).
- **Hyper-V-Container** (Isolation von Containern) innerhalb einer VM.
- **Windows-Subsystem für Android/WSL2/Sandbox/Docker Desktop** in VMs.
- **Entwicklung/CI** mit Emulatoren (Android-Emulator braucht Virtualisierung).
- **Azure**: Hyper-V in Azure-VMs (z. B. Lab-Umgebungen, Migrationstests, **Azure Local/HCI-Evaluierung**).

### Voraussetzungen
| Bereich | Anforderung |
|---|---|
| Host | Windows Server 2016+ / Windows 10 Anniversary+, **Intel VT-x mit EPT** (Unterstützung für **AMD EPYC/Ryzen** seit Windows Server 2022 / Windows 11) |
| VM-Konfigurationsversion | **≥ 8.0** |
| VM-Zustand | **ausgeschaltet** beim Aktivieren |
| Arbeitsspeicher | ausreichend **statischer** RAM (mind. 4 GB für die innere Hyper-V-Rolle); **dynamischer Arbeitsspeicher** wird für die äußere VM **nicht unterstützt**, solange Nested aktiv ist (Laufzeit-Größenänderung eingeschränkt) |
| Netzwerk | innere VMs brauchen Netzzugang: **MAC-Adress-Spoofing** an der vNIC der äußeren VM aktivieren **oder** in der äußeren VM **NAT** (interner vSwitch + `New-NetNat`) |
| Azure | VM-Größe mit Nested-Unterstützung (z. B. Dv3/Dv4/Dv5, Ev3+ – „Nested Virtualization: supported“), **Standard**-Sicherheitstyp (bei „Trusted Launch“ inzwischen ebenfalls unterstützt, bei Confidential VMs nicht) |

### Aktivieren
```powershell
Set-VMProcessor -VMName HV-NESTED -ExposeVirtualizationExtensions $true
Get-VMProcessor -VMName HV-NESTED | Select-Object VMName, ExposeVirtualizationExtensions
```
Danach VM starten, in der VM die Rolle **Hyper-V** installieren, neu starten.

### Einschränkungen
Nicht (bzw. nur eingeschränkt) möglich für die äußere VM mit Nested:
- **Dynamischer Arbeitsspeicher** und **Laufzeit-Speicheränderung** (je nach Version; im Zweifel statisch konfigurieren)
- **Prüfpunkte**/Speichern des Zustands teilweise, **Live-Migration** nicht (VM muss für Migration heruntergefahren werden)
- **Virtualisierungsbasierte Sicherheit (VBS)**/Device Guard in der äußeren VM mit Einschränkungen
- Leistung: jede Schachtelungsebene kostet CPU/RAM-Overhead – nicht für Produktion hoher Last gedacht (Ausnahme: Container-Isolation, Azure-Szenarien)

### Netzwerk für innere VMs
**Option 1 – MAC-Adress-Spoofing** (einfach, innere VMs direkt im äußeren Netz):
`Get-VMNetworkAdapter -VMName HV-NESTED | Set-VMNetworkAdapter -MacAddressSpoofing On`
Die äußere VM muss Frames mit fremden MAC-Adressen (der inneren VMs) senden dürfen.
**Option 2 – NAT** (in der äußeren VM; typisch in **Azure**, wo MAC-Spoofing nicht geht):
```powershell
New-VMSwitch -Name "NestedNAT" -SwitchType Internal
New-NetIPAddress -IPAddress 172.16.0.1 -PrefixLength 24 -InterfaceAlias "vEthernet (NestedNAT)"
New-NetNat -Name "NestedNAT" -InternalIPInterfaceAddressPrefix 172.16.0.0/24
```
Innere VMs erhalten 172.16.0.x mit Gateway 172.16.0.1 (DHCP ggf. selbst bereitstellen).

## Lab
**Maschinen**: physischer Hyper-V-**Host**, VM **HV-NESTED** (Server 2025, 8 GB statisch, 4 vCPU), innerhalb: VM **INNER01**.

### GUI / Befehle
1. **Host**: HV-NESTED ausschalten → PowerShell (siehe unten) Virtualisierungserweiterungen aktivieren, RAM statisch 8 GB, MAC-Spoofing an.
2. **Host**: Hyper-V-Manager → HV-NESTED → Einstellungen → **Netzwerkkarte → Erweiterte Features → „Spoofing von MAC-Adressen aktivieren“** (GUI-Variante).
3. **HV-NESTED**: Server-Manager → Rollen → **Hyper-V** → vSwitch extern auf die (virtuelle) NIC → Neustart.
4. **HV-NESTED**: Hyper-V-Manager → neue VM INNER01 (Gen 2, 1 GB, ISO) → starten → installieren.
5. **INNER01**: IP im gleichen Netz wie der Host bzw. DHCP → `ping` ins LAN.
6. Alternative **NAT**: in HV-NESTED internen Switch + NetNat (siehe oben) → INNER01 an „NestedNAT“, IP 172.16.0.10/24, GW 172.16.0.1.

```powershell
# Auf dem physischen Host (VM aus!)
Stop-VM -Name HV-NESTED
Set-VMProcessor -VMName HV-NESTED -ExposeVirtualizationExtensions $true -Count 4
Set-VMMemory -VMName HV-NESTED -DynamicMemoryEnabled $false -StartupBytes 8GB
Get-VMNetworkAdapter -VMName HV-NESTED | Set-VMNetworkAdapter -MacAddressSpoofing On
Start-VM -Name HV-NESTED

# In HV-NESTED
Install-WindowsFeature Hyper-V -IncludeManagementTools -Restart
Get-ComputerInfo -Property HyperV*        # Anforderungen erfüllt?
```

## Einfach

**Geschachtelte Virtualisierung** ist wie eine **Matroschka-Puppe**: In einer Puppe steckt eine weitere Puppe. Hier steckt in einer **virtuellen Maschine** wieder ein **Hyper-V**, das selbst **weitere virtuelle Maschinen** starten kann.

**Wozu?** Vor allem zum **Üben und Testen**: Du hast nur **einen** PC, möchtest aber ein Firmennetz mit **mehreren Hyper-V-Servern** oder einem **Cluster** nachbauen. Mit Nested Virtualization baust du das alles in VMs – Puppe in Puppe.

**Wie schaltet man es ein?**
1. Die äußere VM **ausschalten**.
2. Ihr erlauben, die „Virtualisierungs-Superkräfte“ des Prozessors weiterzugeben (**ExposeVirtualizationExtensions**).
3. Genug **festen** Arbeitsspeicher geben (nicht dynamisch).
4. Damit die inneren VMs ins Netzwerk kommen: der äußeren VM erlauben, sich **als jemand anderes auszugeben** (**MAC-Spoofing**) – oder in der äußeren VM einen kleinen **Router (NAT)** bauen.

**Nachteil**: Jede Puppe braucht Platz – je tiefer verschachtelt, desto langsamer. Für Übungen top, für schwere Produktion eher nicht.

## Merksatz
- `Set-VMProcessor -ExposeVirtualizationExtensions $true` – **VM aus!**
- **Statischer RAM**, Konfigurationsversion **≥ 8.0**.
- Netzwerk: **MAC-Spoofing** oder **NAT** in der äußeren VM (Azure: NAT).
- Keine **Live-Migration** der äußeren VM.
- AMD-Unterstützung ab **Server 2022/Windows 11**.

## Prüfungsfalle
- Aktivierung bei laufender VM schlägt fehl.
- Innere VMs ohne Netz → MAC-Spoofing vergessen.
- Dynamischer Arbeitsspeicher an der äußeren VM → Probleme/nicht unterstützt.
- In Azure ist MAC-Spoofing nicht möglich → NAT verwenden.
- Nicht jede Azure-VM-Größe unterstützt Nested Virtualization.

## Grafik
### Matroschka
Physischer Host (große Puppe) → HV-NESTED (mittlere Puppe mit Hyper-V-Logo) → INNER01 (kleine Puppe); Schalter „Virtualisierung weitergeben“ lässt die mittlere Puppe leuchten.

### Netzwerk-Optionen
Links: innere VM mit eigener MAC geht dank Spoofing direkt ins LAN. Rechts: innere VM hinter einem NAT-Router in der äußeren VM (typisch Azure).

## Karteikarten
- F: Was ist geschachtelte Virtualisierung? | A: Betrieb eines Hypervisors (Hyper-V) innerhalb einer VM.
- F: Cmdlet zum Aktivieren? | A: Set-VMProcessor -VMName <VM> -ExposeVirtualizationExtensions $true
- F: In welchem Zustand muss die VM beim Aktivieren sein? | A: Ausgeschaltet.
- F: Welche Speicherkonfiguration wird empfohlen? | A: Statischer Arbeitsspeicher (kein dynamischer RAM).
- F: Wie kommen innere VMs ins Netz? | A: MAC-Adress-Spoofing an der vNIC der äußeren VM oder NAT innerhalb der äußeren VM.
- F: Welche Mindest-Konfigurationsversion ist nötig? | A: 8.0.
- F: Wann werden AMD-Prozessoren unterstützt? | A: Ab Windows Server 2022 / Windows 11.
- F: Nenne zwei Einsatzszenarien. | A: Lab/Test (Cluster, mehrere Hosts), Hyper-V-Container-Isolation, Hyper-V in Azure-VMs.

## Quiz
? Welcher Befehl ermöglicht Hyper-V innerhalb der VM „LAB01“?
* Set-VMProcessor -VMName LAB01 -ExposeVirtualizationExtensions $true
- Set-VMMemory -VMName LAB01 -Nested
- Enable-VMIntegrationService -Name Nested
- Set-VMHost -EnableEnhancedSessionMode $true

? Innere VMs in einer Nested-VM erreichen das LAN nicht. Was fehlt am wahrscheinlichsten?
* MAC-Adress-Spoofing an der Netzwerkkarte der äußeren VM
- Ein zweiter DC
- Die erweiterte Sitzung
- Eine DHCP-Reservierung auf dem Host

? Welche Einschränkung gilt für die äußere VM?
* Sie kann nicht live migriert werden
- Sie darf kein Windows sein
- Sie benötigt einen RODC
- Sie darf keinen virtuellen Switch haben

? Wie verbindet man innere VMs in einer Azure-VM mit dem Netzwerk?
* Über NAT in der äußeren VM
- Über MAC-Spoofing in Azure
- Über Point-to-Site-VPN jeder inneren VM
- Gar nicht möglich

? Wann muss die VM ausgeschaltet sein?
* Beim Aktivieren der Virtualisierungserweiterungen
- Beim Kopieren einer Datei
- Beim Anmelden per RDP
- Nie
