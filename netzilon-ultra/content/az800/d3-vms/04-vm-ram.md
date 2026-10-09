---
id: az800-vm-ram
bereich: AZ-800
block: A7
kapitel: VMs & Container
titel: VM-Arbeitsspeicher – statisch, dynamisch, NUMA, Smart Paging
stufe: Fortgeschritten
quellen: [AZ-800 Study Guide, Microsoft Learn]
verweise: [ap1-a1-arbeitsspeicher, az800-nested, az800-cpu-gruppen, az800-pruefpunkte]
---

## Profi

### Statischer vs. dynamischer Arbeitsspeicher
| | **Statisch** | **Dynamisch** (Dynamic Memory) |
|---|---|---|
| Zuweisung | fester Wert, beim Start reserviert | variiert zur Laufzeit je nach Bedarf |
| Einstellungen | **RAM** | **Start-RAM**, **Minimaler RAM**, **Maximaler RAM**, **Speicherpuffer (%)**, **Speichergewichtung** (Priorität) |
| Dichte | geringer | **höhere VM-Dichte** pro Host |
| Geeignet für | Datenbanken (SQL), Exchange, **Nested-Hosts**, Apps mit eigener Speicherverwaltung, Leistungskritisches, VMs mit **vNUMA**-Bedarf | Datei-, Web-, Infrastrukturserver, Clients/VDI, Labs |

**Dynamic Memory – Begriffe**
- **Start-RAM** (Startup): Menge beim **Booten** (Betriebssystem braucht beim Start oft mehr). 
- **Minimaler RAM**: Untergrenze, auf die Hyper-V **nach dem Start** reduzieren darf (kann **niedriger** als Start-RAM sein).
- **Maximaler RAM**: Obergrenze (Standard 1 TB → sinnvoll begrenzen!).
- **Speicherpuffer**: zusätzlich zum aktuellen Bedarf reservierter Prozentsatz (Standard **20 %**) für Lastspitzen.
- **Speichergewichtung**: welche VM bei Knappheit bevorzugt Speicher erhält.
- Umsetzung im Gast über den **Integrationsdienst** (Dynamic Memory-VSC) per **Ballooning**: Der Gast „bläst einen Ballon auf“, um Speicher an den Host zurückzugeben, und lässt ihn ab, um mehr zu nutzen. **Hot-Add** erhöht den sichtbaren Speicher.
- **Zur Laufzeit änderbar**: Minimum/Maximum/Puffer/Gewichtung; **Aktivieren/Deaktivieren** von Dynamic Memory nur im **ausgeschalteten** Zustand.
- **Laufzeit-Speicheränderung** bei **statischem** RAM (ab Server 2016/Konfigurationsversion 7.0): RAM einer laufenden VM erhöhen/verringern (Gen 1 und 2, Windows Server 2016+/Windows 10+ als Gast).

### Smart Paging
Beim **Neustart** einer VM mit dynamischem RAM kann der Host kurzzeitig nicht genug physischen Speicher für den (höheren) **Start-RAM** haben. **Smart Paging** überbrückt diese Lücke, indem Hyper-V temporär eine **Auslagerungsdatei auf dem Host** nutzt (nur beim **Neustart**, nicht beim Kaltstart aus „Aus“). Speicherort pro VM einstellbar (Einstellungen → **Smart Paging-Dateispeicherort**), am besten auf schnellem Speicher. Kein Ersatz für ausreichend RAM – nur ein Sicherheitsnetz.

### NUMA
Server mit mehreren CPUs haben **NUMA-Knoten** (jede CPU mit „eigenem“ Speicher; Zugriff auf fremden Speicher ist langsamer).
- **Virtuelles NUMA (vNUMA)**: Hyper-V präsentiert großen VMs eine NUMA-Topologie, damit NUMA-bewusste Anwendungen (SQL Server) optimal arbeiten. Wird bei **aktiviertem Dynamic Memory deaktiviert** → für große SQL-VMs **statischen RAM** nutzen.
- **NUMA-Spanning** (Hyper-V-Einstellungen, Standard an): VMs dürfen Speicher über NUMA-Grenzen belegen – mehr Flexibilität, etwas weniger Leistung; Ausschalten erzwingt Knoten-lokale Zuweisung (VM startet evtl. nicht, wenn ein Knoten nicht reicht).
- Einstellungen: VM → Prozessor → **NUMA** (max. Prozessoren/Speicher pro Knoten, Knoten pro Sockel) – meist Standard lassen („Hardwaretopologie verwenden“).

### Arbeitsspeicher-Überwachung
- Hyper-V-Manager Spalten **Zugewiesener Speicher**, **Speicherbedarf**, **Speicherstatus** (OK, Niedrig, Warnung).
- `Get-VM | Select Name, MemoryAssigned, MemoryDemand, MemoryStatus`.
- Leistungsindikatoren **Hyper-V Dynamic Memory Balancer** / **Hyper-V Dynamic Memory VM** (Druck „Average Pressure“: < 80 gut, > 100 zu wenig).
- Host-Reserve: Der Host braucht selbst RAM (Richtwert 2–4 GB + Overhead je VM); Hyper-V hält automatisch eine Reserve.

### Best Practices
- Dynamic Memory für allgemeine Server; **statisch** für SQL/Exchange/Nested/vNUMA-kritisch.
- **Maximum** realistisch setzen (sonst frisst eine VM alles).
- **Minimum** nicht zu niedrig (Gast wird langsam, Auslagerung).
- In deinem Heimlabor-Szenario (36 GB Host, viele VMs): Start 1 GB, Minimum 512 MB, Maximum je nach Rolle – DCs 2 GB, Router 1–2 GB.

## Lab
**Maschinen**: Hyper-V-**Host**, VMs **SRV01** (Dateiserver), **SQL01** (Datenbank).

### GUI
1. **SRV01** ausschalten → Einstellungen → **Arbeitsspeicher** → Start-RAM **2048 MB** → Haken **Dynamischen Arbeitsspeicher aktivieren** → Minimal **512 MB**, Maximal **4096 MB**, Speicherpuffer **20 %**, Gewichtung Mittel → OK → Starten.
2. Hyper-V-Manager → Spalten Zugewiesener Speicher/Bedarf beobachten; in SRV01 Last erzeugen (z. B. viele Programme) → Zuweisung steigt.
3. **SQL01**: Arbeitsspeicher **statisch 8192 MB** → im laufenden Betrieb (Gast Server 2016+) auf **10240 MB** erhöhen (Laufzeit-Änderung).
4. **SRV01** → Einstellungen → **Smart Paging-Dateispeicherort** → `D:\Hyper-V\SmartPaging`.
5. **Host**: Hyper-V-Einstellungen → **NUMA-Spanning** ansehen (Standard: zulassen).

### PowerShell
```powershell
# Auf dem Hyper-V-Host
Stop-VM SRV01
Set-VMMemory -VMName SRV01 -DynamicMemoryEnabled $true -StartupBytes 2GB -MinimumBytes 512MB -MaximumBytes 4GB -Buffer 20 -Priority 50
Set-VM -Name SRV01 -SmartPagingFilePath "D:\Hyper-V\SmartPaging"
Start-VM SRV01

# Überwachen
Get-VM | Format-Table Name, State, MemoryAssigned, MemoryDemand, MemoryStatus -AutoSize
Get-VMMemory -VMName SRV01

# Statisch mit Laufzeitänderung (SQL01 läuft)
Set-VMMemory -VMName SQL01 -StartupBytes 10GB

# NUMA
Get-VMHostNumaNode
Get-VMHost | Select-Object NumaSpanningEnabled
Set-VMHost -NumaSpanningEnabled $true
```

## Einfach

Jede VM braucht **Arbeitsspeicher** (RAM) vom Host – wie Kinder, die sich **Kekse aus einer Dose** teilen.

- **Statischer RAM** = jedes Kind bekommt **eine feste Anzahl Kekse** und darf sie behalten, auch wenn es gar keinen Hunger hat. Fair und berechenbar – aber es bleiben viele Kekse ungegessen liegen.
- **Dynamischer RAM** = die Kekse werden **nach Hunger verteilt**: Wer gerade viel zu tun hat, bekommt mehr; wer sich ausruht, gibt welche zurück. So passen **mehr Kinder (VMs)** an denselben Tisch. Dein Heimlabor mit 36 GB kannst du so mit vielen VMs betreiben.
  - **Start-RAM** = so viele Kekse zum **Aufwachen** (Windows braucht beim Starten mehr).
  - **Minimum/Maximum** = nie weniger als… / nie mehr als…
  - **Puffer** = ein paar Kekse **Reserve**, falls plötzlich Hunger kommt.
  - **Gewichtung** = wer bei Keks-Knappheit **zuerst** bekommt.

**Wann lieber fest?** Bei **Datenbanken** (SQL) – die rechnen fest mit ihren Keksen und werden unglücklich, wenn man ihnen welche wegnimmt. Und bei **Nested-Hyper-V**.

**Smart Paging** ist eine **Notration im Keller**: Wenn beim **Neustart** kurz nicht genug Kekse da sind, nimmt Hyper-V vorübergehend die langsame Notration von der Festplatte – damit die VM überhaupt hochkommt.

**NUMA** = große Server haben **mehrere Keksdosen** (eine pro Prozessor). Aus der eigenen Dose zu nehmen geht schneller als aus der Dose am anderen Tischende.

## Merksatz
- Dynamic Memory: **Start – Minimum – Maximum – Puffer (20 %) – Gewichtung**.
- Dynamic Memory **ein/aus nur bei ausgeschalteter VM**.
- **Statisch** für SQL/Exchange/Nested/**vNUMA**.
- **Smart Paging** nur beim **Neustart**, temporär auf Host-Disk.
- Laufzeit-Änderung von statischem RAM ab **Server 2016**-Gästen.

## Prüfungsfalle
- Minimum darf kleiner als Start-RAM sein, Maximum nicht kleiner als Start-RAM.
- Mit Dynamic Memory wird vNUMA deaktiviert.
- Smart Paging greift nicht beim Kaltstart, nur beim Neustart.
- Standard-Maximum (1 TB) nicht gesetzt → eine VM kann den Host ausreizen.
- Dynamic Memory braucht Integrationsdienste im Gast.

## Grafik
### Keksdose
Host als große Keksdose, VMs als Kinder; Modus statisch: feste Keksstapel, viele bleiben liegen; Modus dynamisch: Kekse wandern je nach Hunger (Last) hin und her, Puffer als kleiner Extra-Stapel; Regler für Min/Max.

### Smart Paging
VM-Neustart braucht Start-RAM; Dose ist knapp; ein Keller-Kekspaket (Festplatte) springt kurz ein und verschwindet wieder.

### NUMA
Zwei CPU-Sockel mit je eigener Speicherbank; VM greift lokal (grün, schnell) oder über die Brücke (orange, langsamer) zu.

## Karteikarten
- F: Einstellungen des dynamischen Arbeitsspeichers? | A: Start-RAM, minimaler RAM, maximaler RAM, Speicherpuffer, Speichergewichtung.
- F: Standard-Speicherpuffer? | A: 20 %.
- F: Wann kann Dynamic Memory aktiviert/deaktiviert werden? | A: Nur bei ausgeschalteter VM.
- F: Für welche Workloads eher statischen RAM? | A: SQL Server, Exchange, Nested-Hyper-V, NUMA-bewusste Anwendungen.
- F: Was ist Smart Paging? | A: Temporäre Host-Auslagerung, wenn beim VM-Neustart der Start-RAM physisch nicht verfügbar ist.
- F: Was passiert mit vNUMA bei Dynamic Memory? | A: vNUMA wird deaktiviert.
- F: Wie verteilt der Gast Speicher zurück? | A: Über Ballooning (Integrationsdienst).
- F: Ab wann kann statischer RAM zur Laufzeit geändert werden? | A: Ab Windows Server 2016/Windows 10 als Gast (Konfigurationsversion 7.0).
- F: Welche Werte zeigen den Speicherbedarf einer VM? | A: MemoryAssigned, MemoryDemand, MemoryStatus.

## Quiz
? Eine SQL-Server-VM soll optimale NUMA-Leistung erhalten. Welche Speicherkonfiguration?
* Statischer Arbeitsspeicher
- Dynamischer Arbeitsspeicher mit 50 % Puffer
- Smart Paging dauerhaft
- Minimaler RAM 512 MB

? Wann wird Smart Paging verwendet?
* Beim Neustart einer VM, wenn der Start-RAM nicht physisch verfügbar ist
- Bei jedem Kaltstart
- Dauerhaft für alle VMs
- Nur bei statischem RAM

? Welcher Parameter reserviert zusätzlichen Speicher für Lastspitzen?
* Speicherpuffer
- Speichergewichtung
- Start-RAM
- NUMA-Spanning

? Ein Admin will Dynamic Memory bei einer laufenden VM einschalten. Was passiert?
* Das geht nicht – die VM muss dafür ausgeschaltet sein
- Es wird sofort aktiv
- Die VM wird automatisch migriert
- Der Host startet neu

? Welche Aussage zum minimalen RAM ist korrekt?
* Er kann niedriger als der Start-RAM sein
- Er muss höher als der maximale RAM sein
- Er muss gleich dem Start-RAM sein
- Er gilt nur beim Booten

? Was legt der Wert „Arbeitsspeicherpuffer“ bei Dynamic Memory fest?
* Den prozentualen Zusatzspeicher, den der Host über den Bedarf hinaus bereithält
- Die maximale Größe der Auslagerungsdatei
- Den Speicher des Hosts
- Die Anzahl der vCPUs
! Standard 20 %.

? Was bestimmt die Arbeitsspeichergewichtung?
* Welche VMs bei Speicherknappheit bevorzugt Speicher erhalten
- Die Geschwindigkeit des RAM
- Die Größe der VHDX
- Die Netzwerkbandbreite
! Höhere Gewichtung = höhere Priorität.

? Welches Cmdlet konfiguriert Dynamic Memory einer VM?
* Set-VMMemory
- Set-VMProcessor
- Set-VMHost
- Set-VMNetworkAdapter
! Beispiel: Set-VMMemory -VMName SRV01 -DynamicMemoryEnabled $true -MinimumBytes 1GB -MaximumBytes 8GB.
