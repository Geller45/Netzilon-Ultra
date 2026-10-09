---
id: az800-azure-vms
bereich: AZ-800
block: A7
kapitel: VMs & Container
titel: Windows Server als Azure-VM – Bereitstellung, Datenträger, Verfügbarkeit & Zugriff
stufe: Fortgeschritten
quellen: [AZ-800 Study Guide, Microsoft Learn]
verweise: [az800-dcs-azure, az800-vhdx, az800-azure-arc, az800-automation-dsc, ap1-a6-sysprep, az800-windows-container]
---

## Profi

### Bausteine einer Azure-VM
| Ressource | Aufgabe |
|---|---|
| **Ressourcengruppe** | logischer Container für alle zugehörigen Ressourcen |
| **VNet + Subnetz** | privates Netz der VM |
| **Netzwerkschnittstelle (NIC)** | private IP (dynamisch/statisch **in Azure** festlegen, nie im Gast) |
| **Öffentliche IP** (optional) | Erreichbarkeit aus dem Internet – besser vermeiden |
| **NSG** (Network Security Group) | Firewall-Regeln auf NIC- oder Subnetzebene (z. B. RDP 3389 nur von Admin-IP) |
| **Datenträger** | Managed Disks (OS, Daten) |
| **VM-Größe** | Serie + CPU/RAM, z. B. B (burstable), D (allgemein), E (RAM-optimiert), F (CPU), N (GPU) |

### Datenträger
| Datenträger | Eigenschaft |
|---|---|
| **Betriebssystem-Datenträger** | Laufwerk C:, persistent |
| **Temporärer Datenträger** | meist D:, **nicht persistent** (Auslagerungsdatei) – bei Neubereitstellung/Größenänderung weg; **nie Daten ablegen** |
| **Datenträger für Daten** | zusätzliche Managed Disks, in Windows initialisieren/formatieren; bei **DCs** NTDS/SYSVOL hierhin, **Hostcache = Keiner** |

**Typen**: Standard HDD → Standard SSD → **Premium SSD** → **Premium SSD v2** → **Ultra Disk** (steigend Leistung/Preis). Leistung (IOPS/Durchsatz) hängt von **Datenträgergröße** und **VM-Größe** ab. Mehrere Datenträger in Windows mit **Storage Spaces** zu einem Stripe bündeln für mehr IOPS.

**Verschlüsselung**: Standard **SSE** (serverseitig, plattformverwaltete Schlüssel) immer aktiv; zusätzlich **kundenverwaltete Schlüssel** (Key Vault), **Verschlüsselung auf dem Host** (inkl. temp. Datenträger/Cache) oder **Azure Disk Encryption** (BitLocker im Gast).

### Generationen & Images
- Azure unterstützt **Gen1** und **Gen2** (UEFI, Secure Boot, **Trusted Launch** mit vTPM).
- Marketplace-Images: Windows Server 2019/2022/2025 **Datacenter** (auch **Azure Edition** mit **Hotpatch** und **SMB over QUIC**), **Server Core** oder **Desktop**.
- Eigenes Image: VM vorbereiten → **Sysprep** (`/generalize /oobe /shutdown`) → **Erfassen** (Capture) in **Azure Compute Gallery** (früher Shared Image Gallery) mit Versionen und Replikation in Regionen.
- **On-prem-VHD hochladen**: Azure akzeptiert nur **VHD** (nicht VHDX), **feste Größe**, Größe auf **ganze MB** ausgerichtet → `Convert-VHD … -VHDType Fixed`, dann Upload (`Add-AzVhd` oder AzCopy) und Managed Disk erstellen. Für ganze Server-Migrationen: **Azure Migrate**.

### Verfügbarkeit
| Option | Schutz vor | SLA-Prinzip |
|---|---|---|
| **Einzel-VM** mit Premium SSD | – | einfachste SLA |
| **Verfügbarkeitsgruppe** (*Availability Set*) | Ausfall eines **Racks** (**Fehlerdomänen**, bis 3) und geplanter Wartung (**Updatedomänen**, bis 20) im selben Rechenzentrum | höher |
| **Verfügbarkeitszonen** (*Availability Zones*) | Ausfall eines **ganzen Rechenzentrums** in der Region | am höchsten |
| **VM-Skalierungsgruppe** (*VMSS*) | Lastspitzen; automatische Skalierung identischer VMs | – |
| **Azure Site Recovery** | Ausfall einer **Region** (Replikation in andere Region) | DR |
Verfügbarkeitsgruppe/Zone kann **nur bei Erstellung** gewählt werden (nachträglich nur durch Neuerstellen aus den Datenträgern).

### Sicherer Zugriff & Verwaltung
- **Azure Bastion**: RDP/SSH über das Azure-Portal (HTTPS), VM **ohne öffentliche IP**.
- **Just-in-Time-VM-Zugriff** (Defender for Cloud): Port 3389 in der NSG nur auf Anforderung für begrenzte Zeit öffnen.
- **Befehl ausführen** (*Run Command*): PowerShell-Skript in der VM über den Azure-Agenten – ohne Netzwerkzugriff.
- **Serielle Konsole** + **Startdiagnose**: Fehlersuche, wenn die VM nicht bootet/RDP tot ist (SAC/CMD).
- **VM-Erweiterungen**: **Custom Script Extension** (Skript nach Bereitstellung), **DSC-Erweiterung**, Azure Monitor Agent, Antimalware, Domänenbeitritt (JsonADDomainExtension).
- **Kennwort zurücksetzen / RDP-Konfiguration zurücksetzen**: im Portal unter „Hilfe“ (VMAccess-Erweiterung).
- **Windows Admin Center im Azure-Portal**: WAC-Oberfläche direkt für Azure-VMs.
- **Azure Update Manager**, **Azure Automanage** (Best-Practice-Konfiguration, Hotpatch).

### Kosten
- **Azure-Hybridvorteil** (*Azure Hybrid Benefit*): vorhandene Windows-Server-Lizenzen mit **Software Assurance** nutzen → nur Compute-Preis.
- **Reservierte Instanzen** (1/3 Jahre), **Spot-VMs** (günstig, jederzeit entziehbar).
- VM **Beenden (Zuordnung aufgehoben)** = keine Compute-Kosten; „Herunterfahren“ im Gast allein hebt die Zuordnung **nicht** auf.
- **Größe ändern**: VM wird neu gestartet; Wechsel in andere Hardwarefamilie ggf. nur nach Aufheben der Zuordnung.

## Lab
**Maschinen**: **Admin-PC** mit Browser und PowerShell (Az-Modul), Azure-Abonnement; Ziel-VM **AZ-SRV01**.

### GUI
1. **Admin-PC** → portal.azure.com → **Virtuelle Computer** → Erstellen → Ressourcengruppe `RG-Netzilon`, Name `AZ-SRV01`, Region, **Verfügbarkeitszone 1**, Image **Windows Server 2022 Datacenter: Azure Edition**, Größe `Standard_B2ms`, Sicherheitstyp **Trusted Launch**.
2. Administratorkonto festlegen; **Öffentliche Eingangsports: Keine**.
3. Registerkarte **Datenträger**: OS **Premium SSD**, neuen Datenträger für Daten 64 GiB anhängen.
4. Registerkarte **Netzwerk**: VNet `VNet-Netzilon`, Subnetz, **Öffentliche IP: Keine**, NSG Basic.
5. Lizenzierung: **Azure-Hybridvorteil** nur aktivieren, wenn Lizenzen mit SA vorhanden → Überprüfen + erstellen.
6. VNet → **Bastion** bereitstellen → VM → **Verbinden → Bastion** → Anmelden.
7. **AZ-SRV01** (im Gast): Datenträgerverwaltung → neuen Datenträger initialisieren (GPT) → Volume F: formatieren. Temporären Datenträger D: nicht für Daten verwenden.
8. **Admin-PC**: VM → **Vorgänge → Befehl ausführen** → `RunPowerShellScript` → `Get-Service`.
9. VM → **Beenden** (Status „Beendet (Zuordnung aufgehoben)“).

### PowerShell
```powershell
# Auf dem Admin-PC – Az-Modul
Install-Module Az -Scope CurrentUser
Connect-AzAccount
New-AzResourceGroup -Name RG-Netzilon -Location westeurope

$cred = Get-Credential
New-AzVM -ResourceGroupName RG-Netzilon -Name AZ-SRV01 -Location westeurope `
  -Image "MicrosoftWindowsServer:WindowsServer:2022-datacenter-azure-edition:latest" `
  -Size Standard_B2ms -Credential $cred -VirtualNetworkName VNet-Netzilon `
  -SubnetName Default -PublicIpAddressName $null -OpenPorts @() -Zone 1

# Datenträger für Daten anhängen
$vm = Get-AzVM -ResourceGroupName RG-Netzilon -Name AZ-SRV01
$cfg = New-AzDiskConfig -Location westeurope -CreateOption Empty -DiskSizeGB 64 -SkuName Premium_LRS -Zone 1
$disk = New-AzDisk -ResourceGroupName RG-Netzilon -DiskName AZ-SRV01-Data1 -Disk $cfg
$vm = Add-AzVMDataDisk -VM $vm -Name AZ-SRV01-Data1 -ManagedDiskId $disk.Id -Lun 0 -CreateOption Attach -Caching None
Update-AzVM -ResourceGroupName RG-Netzilon -VM $vm

# Skript in der VM ausführen
Invoke-AzVMRunCommand -ResourceGroupName RG-Netzilon -VMName AZ-SRV01 -CommandId RunPowerShellScript -ScriptString "Get-Volume"

# Größe ändern / Beenden (Zuordnung aufheben) / Starten
$vm.HardwareProfile.VmSize = "Standard_D2s_v5"; Update-AzVM -ResourceGroupName RG-Netzilon -VM $vm
Stop-AzVM -ResourceGroupName RG-Netzilon -Name AZ-SRV01 -Force
Start-AzVM -ResourceGroupName RG-Netzilon -Name AZ-SRV01

# Auf dem Hyper-V-Host – eigene VHDX für den Upload vorbereiten
Convert-VHD -Path D:\VMs\SRV-Vorlage.vhdx -DestinationPath D:\Upload\SRV-Vorlage.vhd -VHDType Fixed
Add-AzVhd -ResourceGroupName RG-Netzilon -Location westeurope -LocalFilePath D:\Upload\SRV-Vorlage.vhd -DiskName SRV-Vorlage-OS
```

## Einfach

Eine **Azure-VM** ist ein Server, den du dir bei Microsoft **mietest** statt ihn in den Keller zu stellen. Du klickst ihn zusammen wie beim Autokonfigurator:
- **Größe** = wie viel Motor (CPU) und Kofferraum (RAM).
- **Datenträger** = Festplatten. Achtung: Das Laufwerk **D:** ist ein **Notizzettel** – nach einem Umzug der VM ist es **leer**. Wichtige Sachen gehören auf eine **zusätzliche Datenplatte**.
- **Netzwerk** = in welchem virtuellen Netz die VM wohnt.

**Gegen Ausfälle**:
- **Verfügbarkeitsgruppe** = deine zwei Server stehen in **verschiedenen Regalen** im selben Gebäude – fällt ein Regal aus (Strom weg), läuft der andere.
- **Verfügbarkeitszonen** = deine Server stehen in **verschiedenen Gebäuden** derselben Stadt – sogar ein Brand in einem Gebäude übersteht das.

**Sicher reinkommen**: Keine offene Haustür (öffentliche IP) – stattdessen **Azure Bastion**, ein Pförtner im Browser, der dich reinlässt. Oder **Just-in-Time**: Die Tür geht nur auf, wenn du klingelst, und schließt sich nach einer Stunde wieder.

**Sparen**: Hast du schon Windows-Lizenzen, zahlst du mit dem **Hybridvorteil** nur die Miete für die Hardware. Und **„Beenden“ im Portal** = Motor aus, **keine Kosten** mehr – nur Herunterfahren im Windows reicht nicht, dann läuft der Taxameter weiter.

**Eigene VM hochladen**: Azure mag nur das **alte Format VHD** mit **fester Größe** – VHDX vorher umwandeln.

## Merksatz
- **D: = temporär**, Daten auf eigene Datenplatte.
- **Regal** = Verfügbarkeitsgruppe (Fehler-/Updatedomäne), **Gebäude** = Verfügbarkeitszone.
- Upload nach Azure: **VHD, fest, ganze MB**.
- **Bastion** statt öffentlicher IP, **JIT** statt dauerhaft offenem RDP.
- **Beenden (Zuordnung aufgehoben)** = keine Compute-Kosten.
- **Hybridvorteil** braucht **Software Assurance**.
- Statische IP **in Azure** setzen, nicht im Gast.

## Prüfungsfalle
- VHDX oder dynamische VHD kann nicht direkt als Azure-Datenträger hochgeladen werden.
- Daten auf dem temporären Laufwerk gehen verloren.
- Verfügbarkeitsgruppe/Zone nachträglich nicht zuweisbar.
- IP-Adresse im Gast statisch einzutragen trennt die VM vom Netz.
- Herunterfahren im Gast = weiterhin Kosten.
- Fehlersuche ohne RDP: serielle Konsole, Startdiagnose, Befehl ausführen.
- Für DCs in Azure: Datenplatte mit Hostcache „Keiner“ für NTDS/SYSVOL.

## Grafik
### VM-Baukasten
Bausteine fliegen zusammen: Ressourcengruppe-Kiste, VNet-Straße, NIC-Stecker, NSG-Zaun, Datenträger-Stapel, Größen-Motor → fertige VM leuchtet.

### Regal vs. Gebäude
Ein Gebäude mit drei Regalen (Fehlerdomänen) – ein Regal verliert Strom, VM im anderen läuft. Daneben drei Gebäude (Zonen) – eines brennt, die anderen laufen weiter.

### Notizzettel D:
VM zieht auf einen neuen Host um; Laufwerk C: und F: kommen mit, Zettel D: wird weggeweht.

### Pförtner Bastion
Admin im Browser → Pförtner Bastion → VM ohne Haustür; daneben JIT-Tür mit Uhr, die nach Ablauf zufällt.

## Karteikarten
- F: Welcher Azure-VM-Datenträger ist nicht persistent? | A: Der temporäre Datenträger (meist D:).
- F: Schutz vor Rack-Ausfall im selben Rechenzentrum? | A: Verfügbarkeitsgruppe (Fehlerdomänen).
- F: Schutz vor Ausfall eines ganzen Rechenzentrums? | A: Verfügbarkeitszonen.
- F: Maximale Fehlerdomänen / Updatedomänen einer Verfügbarkeitsgruppe? | A: 3 / 20.
- F: Welches Format für Upload einer eigenen VM nach Azure? | A: VHD mit fester Größe.
- F: RDP ohne öffentliche IP über das Portal? | A: Azure Bastion.
- F: RDP-Port nur zeitlich begrenzt öffnen? | A: Just-in-Time-VM-Zugriff.
- F: Skript in einer VM ohne Netzwerkzugriff ausführen? | A: Befehl ausführen (Run Command).
- F: Vorhandene Lizenzen mit SA in Azure nutzen? | A: Azure-Hybridvorteil.
- F: Wann fallen keine Compute-Kosten an? | A: Status „Beendet (Zuordnung aufgehoben)“.
- F: Eigene Images zentral versionieren und replizieren? | A: Azure Compute Gallery.
- F: Windows-Server-Edition mit Hotpatch in Azure? | A: Datacenter: Azure Edition.

## Quiz
? Eine on-prem VM (VHDX, dynamisch) soll als Azure-VM starten. Erster Schritt?
* In eine VHD fester Größe konvertieren
- In eine VHD Set umwandeln
- Direkt als VHDX hochladen
- In eine differenzierende VHDX umwandeln

? Zwei Webserver sollen einen kompletten Rechenzentrumsausfall in der Region überstehen. Lösung?
* Verfügbarkeitszonen
- Verfügbarkeitsgruppe
- Temporärer Datenträger
- Premium SSD

? Administratoren sollen per RDP arbeiten, die VMs dürfen keine öffentliche IP haben. Lösung?
* Azure Bastion
- NSG mit Regel 3389 aus dem Internet
- Custom Script Extension
- Azure-Hybridvorteil

? Wo wird die Auslagerungsdatei standardmäßig abgelegt und was gilt dafür?
* Temporärer Datenträger, Inhalte gehen bei Neubereitstellung verloren
- Betriebssystem-Datenträger, dauerhaft
- Datenträger für Daten, dauerhaft
- Azure Files, repliziert

? Eine VM wurde im Gast heruntergefahren, trotzdem entstehen Compute-Kosten. Warum?
* Die Zuordnung wurde nicht aufgehoben – im Portal „Beenden“ nötig
- Der temporäre Datenträger kostet extra
- Bastion berechnet die VM weiter
- Die NSG verursacht Compute-Kosten

? Welches Format muss eine VHD für den Upload als Azure-Datenträger haben?
* VHD mit fester Größe
- Dynamische VHDX
- VMDK
- ISO
! Konvertierung mit Convert-VHD -VHDType Fixed.

? Welcher Zustand einer Azure-VM verursacht keine Compute-Kosten mehr?
* Beendet (Zuordnung aufgehoben / Deallocated)
- Im Gast heruntergefahren
- Angehalten im Betriebssystem
- Neustart
! Speicherkosten fallen weiterhin an.

? Was ist die Funktion einer Netzwerksicherheitsgruppe (NSG)?
* Filterung von ein- und ausgehendem Datenverkehr per Regeln für Subnetze oder NICs
- Verschlüsselung der Datenträger
- Vergabe öffentlicher DNS-Namen
- Sicherung der VM
! Regeln mit Priorität, Quelle, Ziel, Port und Aktion.
