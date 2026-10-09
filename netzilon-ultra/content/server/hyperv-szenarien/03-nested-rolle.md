---
id: server-hvsz-03
bereich: AZ-800
block: HV-S
kapitel: Hyper-V-Praxisszenarien
titel: Szenario 03 – Hyper-V-Rolle lässt sich in der VM nicht installieren
stufe: Einsteiger
fach: Windows Server / AZ-800
pruefungen: [AZ-800, AP2, Schule]
quellen: [Microsoft Learn – Hyper-V]
verweise: [az800-nested, server-hvsz-02, server-hvsz-11]
---

## Profi

### Ticket
**Kunde meldet:** „Ich will in einer VM Hyper-V installieren, um ein Cluster-Lab zu bauen. Der Server-Manager bricht ab: Der Prozessor verfüge nicht über die erforderlichen Virtualisierungsfunktionen.“
- Datum/Priorität: 07.10.2026, **Priorität 4 (niedrig)** – Lab, keine Produktion.
- Betroffene Maschine: VM **HV-NESTED** auf **HV01.example.com**.
- Meldung (sinngemäß): *„Hyper-V kann nicht installiert werden: Der Prozessor verfügt nicht über die erforderlichen Virtualisierungsfunktionen.“*

### Ausgangslage
- Host **HV01.example.com**, Windows Server 2025, Intel-CPU mit VT-x und EPT (bzw. AMD-V mit RVI, ab Server 2022 unterstützt), Virtualisierung im BIOS/UEFI aktiv.
- VM **HV-NESTED**: Generation 2, Server 2025, 8 GB RAM **dynamisch**, 2 vCPU, Konfigurationsversion 12.0, IP 192.168.10.50.

### Analyse
Eine VM sieht standardmäßig **keine** Virtualisierungserweiterungen (VT-x/AMD-V) – Hyper-V verbirgt sie. Deshalb meldet das Gast-Setup fehlende Hardwarevoraussetzungen.

| Hypothese | Prüfung |
|---|---|
| `ExposeVirtualizationExtensions` ist **$false** | `Get-VMProcessor -VMName HV-NESTED \| Select ExposeVirtualizationExtensions` |
| Konfigurationsversion < 8.0 | `Get-VM HV-NESTED \| Select Version` |
| Host-CPU/BIOS ohne Virtualisierung | `Get-ComputerInfo -Property HyperV*` auf HV01 |
| Dynamic Memory aktiv (nicht unterstützt für Nested-Betrieb) | `Get-VMMemory -VMName HV-NESTED` |

**Befund:** ExposeVirtualizationExtensions = False, außerdem Dynamic Memory aktiv.

### Lösungsweg
1. **HV-NESTED herunterfahren** – Begründung: `ExposeVirtualizationExtensions` lässt sich nur bei **ausgeschalteter** VM ändern; bei laufender VM meldet PowerShell einen Fehler.
2. **Virtualisierungserweiterungen freigeben**: `Set-VMProcessor -ExposeVirtualizationExtensions $true` – Begründung: reicht VT-x/AMD-V an den Gast durch.
3. **Statischen RAM** setzen (z. B. 8 GB) – Begründung: Bei aktivem Hyper-V im Gast schwankt der RAM auch mit Dynamic Memory nicht mehr; innere VMs brauchen planbaren Speicher.
4. **Konfigurationsversion** prüfen (≥ 8.0), ggf. `Update-VMVersion` – Begründung: Nested setzt Version 8.0 voraus; die Aktualisierung ist **nicht umkehrbar**.
5. **VM starten, Rolle installieren**, Neustart – Begründung: Hyper-V aktiviert den Hypervisor erst nach Neustart.
6. Optional MAC-Spoofing für das Netz der inneren VMs (Szenario 02).

### Ergebnis prüfen
- `Get-WindowsFeature Hyper-V` in HV-NESTED zeigt **Installed**.
- `Get-ComputerInfo -Property HyperV*` in HV-NESTED: *HyperVisorPresent : True*.
- Hyper-V-Manager in HV-NESTED startet; eine Test-VM lässt sich anlegen.

### Vorbeugung
- Nested-VMs per Skript anlegen (Prozessor, RAM, Netzwerk in einem Schritt).
- Bekannte Einschränkungen dokumentieren: keine Live-Migration der äußeren VM, keine Laufzeit-Speicheränderung.

## Einfach

Ein Prozessor hat eine **Superkraft**: Er kann Computer im Computer laufen lassen (Virtualisierung). Hyper-V gibt diese Superkraft aber **nicht automatisch** an seine VMs weiter – das wäre so, als würde ein Lehrer jedem Kind den Generalschlüssel der Schule geben.

Wenn du in einer VM wieder Hyper-V installieren willst, sagt die VM: „Ich habe diese Superkraft nicht!“ – und die Installation bricht ab.

So geht es:
1. Die VM **ausschalten** (Superkräfte werden nur im Stillstand übergeben).
2. Auf dem echten Server sagen: „**Gib die Superkraft weiter**“ (ExposeVirtualizationExtensions).
3. Der VM **feste Matten** (statischen Arbeitsspeicher) geben, damit die kleinen VMs darin Platz haben.
4. VM starten, Hyper-V installieren, neu starten – fertig.

Das ist wie eine Matroschka: In der Puppe kann nur eine weitere Puppe stecken, wenn sie innen hohl ist.

## Merksatz
- **VM aus** → `Set-VMProcessor -ExposeVirtualizationExtensions $true`.
- Konfigurationsversion **≥ 8.0**, **statischer RAM**.
- Nested auf AMD erst ab **Server 2022/Windows 11**.

## Prüfungsfalle
- Der Befehl wird **auf dem Host** ausgeführt, nicht in der VM.
- Bei **laufender** VM schlägt die Änderung fehl.
- `Set-VMHost` oder `Set-VMMemory` haben keinen Nested-Schalter – es ist `Set-VMProcessor`.
- `Update-VMVersion` ist **nicht umkehrbar**; die VM läuft danach nicht mehr auf älteren Hosts.

## Grafik
### Superkraft weitergeben
1. HV-NESTED: Setup prüft CPU – keine VT-x sichtbar
2. HV-NESTED -> Admin: Installation abgebrochen
3. Admin -> HV-NESTED: Herunterfahren
4. Admin -> HV01: Set-VMProcessor ExposeVirtualizationExtensions true
5. HV01 -> HV-NESTED: Virtualisierungserweiterungen durchgereicht
6. HV-NESTED: Rolle Hyper-V installiert, Neustart
7. HV-NESTED: Hypervisor aktiv, innere VMs möglich

## Lab
**Maschinen**: Host **HV01.example.com**, VM **HV-NESTED** (Server 2025).
Nachstellen: Zuerst den Fehler bewusst erzeugen, dann beheben.

### GUI
1. **HV-NESTED**: Server-Manager → Verwalten → **Rollen und Features hinzufügen** → Hyper-V → Fehlermeldung zu fehlenden Virtualisierungsfunktionen notieren (Fehlerzustand).
2. **HV01**: Hyper-V-Manager → HV-NESTED → **Herunterfahren**.
3. **HV01**: Hyper-V-Manager → HV-NESTED → Einstellungen → Arbeitsspeicher → Haken „Dynamischen Arbeitsspeicher aktivieren“ entfernen, RAM 8192 MB → OK.
4. **HV01**: PowerShell als Administrator öffnen (die Nested-Option gibt es nicht in der GUI) → Befehl `Set-VMProcessor` aus dem PowerShell-Teil ausführen.
5. **HV01**: Hyper-V-Manager → HV-NESTED → **Starten**.
6. **HV-NESTED**: Server-Manager → Rollen und Features hinzufügen → **Hyper-V** → Neustart bei Bedarf → fertigstellen.
7. **HV-NESTED**: Hyper-V-Manager öffnen → neue Test-VM anlegen.

### PowerShell
1. **HV01**: Ausgangszustand prüfen und Fehler zeigen.
2. **HV01**: VM ausschalten und Einstellungen setzen.
3. **HV-NESTED**: Rolle installieren.

```powershell
# Auf HV01 – Zustand prüfen
Get-VMProcessor -VMName HV-NESTED | Select-Object VMName, ExposeVirtualizationExtensions
Get-VM -Name HV-NESTED | Select-Object Name, State, Version

# Auf HV01 – Fehler zeigen: Änderung bei laufender VM schlägt fehl
Set-VMProcessor -VMName HV-NESTED -ExposeVirtualizationExtensions $true

# Auf HV01 – Beheben
Stop-VM -Name HV-NESTED
Set-VMProcessor -VMName HV-NESTED -ExposeVirtualizationExtensions $true
Set-VMMemory -VMName HV-NESTED -DynamicMemoryEnabled $false -StartupBytes 8GB
Start-VM -Name HV-NESTED

# In HV-NESTED
Install-WindowsFeature -Name Hyper-V -IncludeManagementTools -Restart
Get-ComputerInfo -Property HyperV*
```

## Szenario
### Kontrollfragen
Die Installation der Hyper-V-Rolle in der VM HV-NESTED scheitert mit dem Hinweis auf fehlende Virtualisierungsfunktionen des Prozessors.
- F: Welche Einstellung fehlt? | A: Die Weitergabe der Virtualisierungserweiterungen: Set-VMProcessor -ExposeVirtualizationExtensions $true.
- F: Auf welcher Maschine und in welchem Zustand wird sie gesetzt? | A: Auf dem Host HV01, bei ausgeschalteter VM.
- F: Welche RAM-Konfiguration ist für HV-NESTED richtig? | A: Statischer Arbeitsspeicher, da bei aktivem Hyper-V im Gast der Speicher nicht dynamisch angepasst wird.
- F: Welche Mindest-Konfigurationsversion ist nötig? | A: 8.0.
- F: Wie prüft man in HV-NESTED, ob der Hypervisor läuft? | A: Get-ComputerInfo -Property HyperV* (HyperVisorPresent = True) bzw. Hyper-V-Manager starten.

## Reihenfolge
### Nested-Virtualisierung aktivieren
1. VM herunterfahren
2. ExposeVirtualizationExtensions auf dem Host setzen
3. Statischen RAM konfigurieren
4. VM starten
5. Hyper-V-Rolle in der VM installieren
6. VM neu starten und Hypervisor prüfen

## Legende
### ExposeVirtualizationExtensions
- Was: Eigenschaft des virtuellen Prozessors, die VT-x/AMD-V an den Gast weitergibt.
- Wie: `Set-VMProcessor -VMName <VM> -ExposeVirtualizationExtensions $true` (nur PowerShell).
- Wann: vor der Installation von Hyper-V, WSL2, Hyper-V-Containern oder Sandbox in einer VM.
- Wo: auf dem physischen Host, bei ausgeschalteter VM.
- Warum: Ohne die Erweiterungen erkennt der Gast keine Hardwarevirtualisierung und verweigert die Hyper-V-Installation.

## Karteikarten
- F: Warum lässt sich Hyper-V in einer normalen VM nicht installieren? | A: Hyper-V gibt die Virtualisierungserweiterungen der CPU standardmäßig nicht an VMs weiter.
- F: Mit welchem Cmdlet wird Nested aktiviert? | A: Set-VMProcessor -VMName <VM> -ExposeVirtualizationExtensions $true
- F: Welcher VM-Zustand ist dafür nötig? | A: Ausgeschaltet.
- F: Gibt es dafür einen GUI-Schalter im Hyper-V-Manager? | A: Nein, nur per PowerShell.
- F: Mindest-Konfigurationsversion für Nested? | A: 8.0.
- F: Wie aktualisiert man die Konfigurationsversion? | A: Update-VMVersion -Name <VM> (nicht umkehrbar).
- F: Seit wann wird Nested auf AMD-CPUs unterstützt? | A: Seit Windows Server 2022 / Windows 11.
- F: Welche RAM-Art ist für die äußere VM sinnvoll? | A: Statischer RAM.
- F: Welche Funktion verliert die äußere VM? | A: Live-Migration (VM muss für eine Migration heruntergefahren werden).

## Quiz
? Welcher Befehl erlaubt Hyper-V in der VM HV-NESTED?
* Set-VMProcessor -VMName HV-NESTED -ExposeVirtualizationExtensions $true
- Set-VMHost -NestedVirtualization $true
- Enable-WindowsOptionalFeature -Online -FeatureName Nested
- Set-VMFirmware -VMName HV-NESTED -EnableNested On
! Die Weitergabe der Erweiterungen ist eine Prozessoreigenschaft der VM.

? Wo wird der Befehl ausgeführt?
* Auf dem physischen Host HV01
- In der VM HV-NESTED
- Auf dem Domänencontroller
- In Windows Admin Center im Gast
! Nur der Host kann die VM-Prozessorkonfiguration ändern.

? Was passiert, wenn man ihn bei laufender VM ausführt?
* Er schlägt fehl, die VM muss ausgeschaltet sein
- Die VM startet automatisch neu
- Die Einstellung wird beim nächsten Prüfpunkt aktiv
- Er wirkt sofort
! Die Prozessorkonfiguration ist nur offline änderbar.

? Welche Mindest-Konfigurationsversion verlangt Nested?
* 8.0
- 5.0
- 6.2
- 10.0
! Laut Microsoft ist Version 8.0 Voraussetzung.

? Ab welcher Version wird Nested auf AMD-Prozessoren unterstützt?
* Windows Server 2022 / Windows 11
- Windows Server 2012 R2 / Windows 8.1
- Windows Server 2016 / Windows 10 1607
- Nur in Azure-VMs der Dv5-Serie
! Intel wird seit 2016 unterstützt, AMD seit Server 2022/Windows 11.

? Welche RAM-Konfiguration sollte HV-NESTED haben?
* Statisch und ausreichend groß
- Dynamisch mit 512 MB Minimum
- Dynamisch mit 200 % Puffer
- Egal, Nested nutzt nur Host-RAM
! Bei laufendem Hyper-V im Gast schwankt dynamischer RAM nicht; statischer RAM ist planbar.

? Welche Folge hat Update-VMVersion?
* Die VM läuft danach nicht mehr auf Hosts mit älterer Version
- Die VM wird dabei automatisch in Generation 2 umgewandelt
- Alle vorhandenen Prüfpunkte werden zusammengeführt
- Die VM erhält aus dem MAC-Pool eine neue MAC-Adresse
! Die Versionsaktualisierung ist nicht umkehrbar; Hosts, die die neue Version nicht kennen, starten die VM nicht mehr.

? Welche Funktion steht der äußeren Nested-VM NICHT zur Verfügung?
* Live-Migration
- Herunterfahren
- Statischer RAM
- Externer vSwitch
! Laut Microsoft ist Live-Migration mit aktivem Nested nicht möglich.
