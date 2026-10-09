---
id: server-hvsz-30
bereich: AZ-800
block: HV-S
kapitel: Hyper-V-Praxisszenarien
titel: Szenario 30 – Große SQL-VM: NUMA-Topologie und NUMA-Spanning
stufe: Profi
fach: Windows Server / AZ-800
pruefungen: [AZ-800, AP2, Schule]
quellen: [Microsoft Learn – Hyper-V]
verweise: [az800-cpu-gruppen, az800-vm-ram, server-hvsz-29]
---

## Profi

### Ticket
**Kunde meldet:** „Unsere neue SQL-VM mit 48 GB RAM und 24 vCPUs ist langsamer als der alte physische Server mit weniger Kernen. Abfragen schwanken stark.“
- **Priorität:** mittel
- **Betroffene Maschine:** **SQL02** auf **HV02**

### Ausgangslage
- **HV02.example.com**: Server 2025, **2 Sockel** à 16 Kerne, 128 GB RAM → **2 NUMA-Knoten** mit je 16 Kernen und 64 GB
- VM **SQL02** (Gen 2, 192.168.10.25): 24 vCPU, **dynamischer Arbeitsspeicher** (Start 8 GB, max. 48 GB)
- Auf HV02 laufen weitere VMs, die zusammen ca. 50 GB belegen.

### Analyse
- **NUMA** (Non-Uniform Memory Access): Jeder Prozessor hat „seinen“ lokalen Speicher. Zugriffe auf den Speicher des anderen Sockels sind **langsamer** (Remote-Zugriff).
- `Get-VMHostNumaNode` zeigt die Knoten mit Prozessoren und freiem Speicher.
- Hyper-V gibt einer VM eine **virtuelle NUMA-Topologie** (vNUMA), damit NUMA-fähige Software wie **SQL Server** Threads und Speicher passend verteilt. Standard: virtuelle Topologie richtet sich nach der Hardware (Option „Hardwaretopologie verwenden“).
- **Problem 1:** Bei **dynamischem Arbeitsspeicher** wird der VM **keine virtuelle NUMA-Topologie** präsentiert – dynamischer RAM und vNUMA schließen sich aus. SQL Server sieht einen einzigen Knoten und plant ungünstig.
- **Problem 2:** Mit **NUMA-Spanning** (Host-Einstellung, Standard **aktiviert**) darf eine VM Speicher über Knotengrenzen hinweg bekommen – sie startet zwar immer, greift aber evtl. viel auf entfernten Speicher zu.
- `Get-Counter "\Hyper-V VM Vid Partition(*)\Remote Physical Pages"` zeigt, wie viele Speicherseiten einer VM auf einem entfernten Knoten liegen.

### Lösungsweg
1. **SQL02 herunterfahren.** *Begründung:* RAM-Modus und NUMA-Einstellungen sind nur offline änderbar.
2. **Statischen Arbeitsspeicher** 48 GB setzen. *Begründung:* Erst dann erhält der Gast eine vNUMA-Topologie; Microsoft empfiehlt für SQL Server ohnehin festen RAM.
3. **vNUMA an Hardware anpassen:** In den Prozessor-Einstellungen → NUMA → „**Hardwaretopologie verwenden**“. *Begründung:* Max. vCPU pro Knoten = 16, max. Speicher pro Knoten ≈ 64 GB → die VM bekommt 2 virtuelle Knoten à 12 vCPU / 24 GB.
4. **NUMA-Spanning bewusst entscheiden:** Für planbare Leistung kann man es mit `Set-VMHost -NumaSpanningEnabled $false` deaktivieren. *Begründung:* Dann bekommt jeder virtuelle Knoten nur Speicher aus einem physischen Knoten. **Achtung:** VMs, die dann nicht in die freien Knoten passen, **starten nicht**; die Änderung wird erst nach **Neustart des Dienstes VMMS** wirksam.
5. **SQL02 starten**, in SQL Server bzw. im Gast die Knoten prüfen. *Begründung:* Kontrolle, ob 2 NUMA-Knoten erkannt werden.

### Ergebnis prüfen
- Im Gast: Task-Manager → Leistung → CPU → Rechtsklick „Graph ändern in“ → **NUMA-Knoten** → 2 Knoten.
- Im Gast: `Get-CimInstance Win32_NumaNode` bzw. SQL-Sicht `sys.dm_os_nodes`.
- HV02: `Get-VMProcessor -VMName SQL02 | Select MaximumCountPerNumaNode, MaximumCountPerNumaSocket`
- HV02: Indikator **Remote Physical Pages** für SQL02 niedrig.

### Vorbeugung
- Große VMs so dimensionieren, dass sie in **einen** oder genau **ganzzahlige** NUMA-Knoten passen.
- Nach Hardwaretausch (andere Knotengröße) vNUMA-Werte neu berechnen („Hardwaretopologie verwenden“ erneut klicken).
- Für SQL: statischer RAM, keine Überbuchung des Hosts.

## Einfach
Stell dir einen großen Bauernhof mit **zwei Scheunen** vor. In jeder Scheune arbeiten 16 Helfer, und jede Scheune hat ihr eigenes Futterlager. Holt ein Helfer Futter aus **seiner** Scheune, geht das schnell. Muss er in die **andere** Scheune laufen, dauert es länger.

Die SQL-VM ist wie ein Team von 24 Helfern. Sie passen nicht alle in eine Scheune. Wenn das Team weiß, dass es zwei Scheunen gibt, teilt es sich klug auf: 12 Helfer links, 12 rechts, jeder nimmt Futter aus seiner eigenen Scheune.

Beim Ticket war aber „Futter nach Bedarf“ (dynamischer Arbeitsspeicher) eingestellt. Dann bekommt das Team **keinen Lageplan** der Scheunen und läuft wild hin und her. Das kostet Zeit.

Die Lösung: Festes Futter (statischer RAM) geben und den Lageplan (NUMA-Topologie) mitliefern. Und wer ganz streng sein will, verbietet das Laufen in die fremde Scheune (NUMA-Spanning aus) – dann darf aber nur noch ein Team auf den Hof, das in die Scheunen passt.

## Merksatz
- **NUMA**: lokaler Speicher schnell, entfernter langsam.
- **Dynamischer RAM ⇒ kein vNUMA.**
- NUMA-Spanning: **Standard an**; aus = planbarer, aber VMs starten evtl. nicht.
- Spanning-Änderung wirkt nach **VMMS-Neustart**.

## Prüfungsfalle
- vNUMA wird bei aktiviertem dynamischem Arbeitsspeicher nicht an den Gast weitergegeben.
- NUMA-Spanning ist eine **Host**-Einstellung (`Set-VMHost`), keine VM-Einstellung.
- Deaktiviertes Spanning kann dazu führen, dass VMs nicht starten oder nicht wiederhergestellt werden können.
- „Hardwaretopologie verwenden“ übernimmt die Werte des **aktuellen** Hosts – nach Migration auf andere Hardware prüfen.

## Grafik
### SQL-VM über zwei NUMA-Knoten
1. HV02: Knoten 0 (16 Kerne, 64 GB) und Knoten 1 (16 Kerne, 64 GB)
2. SQL02 -> HV02: dynamischer RAM, Gast sieht nur einen Knoten
3. SQL02 -> Knoten 1: viele Remote-Zugriffe, Abfragen langsam
4. Admin -> SQL02: statischer RAM 48 GB, Hardwaretopologie verwenden
5. SQL02: 2 virtuelle Knoten à 12 vCPU und 24 GB
6. SQL Server: plant Threads und Speicher knotenlokal

## Lab
**Nachstellen:** Auch auf einem Host mit nur einem NUMA-Knoten lässt sich die Konfiguration üben; vNUMA kann man durch kleine Höchstwerte künstlich erzwingen. Maschinen: **HV02**, VM **SQL02**.

### GUI
1. **HV02**: Hyper-V-Manager → SQL02 → Einstellungen → Arbeitsspeicher → „Dynamischen Arbeitsspeicher aktivieren“ angehakt lassen (Fehlerzustand) → VM starten.
2. **SQL02**: Task-Manager → Leistung → CPU → Graph „NUMA-Knoten“ → nur 1 Knoten.
3. **HV02**: SQL02 herunterfahren → Arbeitsspeicher → Haken bei dynamischem Arbeitsspeicher entfernen, Start-RAM 8 GB.
4. **HV02**: SQL02 → Einstellungen → Prozessor (4 vCPU) → **NUMA** → „Maximale Anzahl Prozessoren“ = 2, „Maximaler Arbeitsspeicher“ = 4096 MB → OK.
5. **SQL02**: starten → Task-Manager → NUMA-Knoten → **2** Knoten sichtbar.
6. **HV02**: Hyper-V-Einstellungen (Server) → **NUMA-Aufteilung** → Haken „Virtuellen Computern das Überspannen physischer NUMA-Knoten erlauben“ – nur im Lab entfernen, VMMS neu starten, Wirkung ansehen, wieder aktivieren.

### PowerShell
```powershell
# Auf HV02 – Host-Topologie ansehen
Get-VMHostNumaNode
Get-VMHost | Select-Object NumaSpanningEnabled

# Auf HV02 – SQL02 auf statischen RAM und erzwungene vNUMA (Lab-Werte)
Stop-VM -Name SQL02
Set-VMMemory -VMName SQL02 -DynamicMemoryEnabled $false -StartupBytes 8GB -MaximumAmountPerNumaNodeBytes 4GB
Set-VMProcessor -VMName SQL02 -Count 4 -MaximumCountPerNumaNode 2
Start-VM -Name SQL02

# Auf SQL02 – Knoten im Gast zählen
Get-CimInstance Win32_NumaNode | Measure-Object

# Auf HV02 – Remote-Seiten der VM beobachten
Get-Counter "\Hyper-V VM Vid Partition(*)\Remote Physical Pages"

# Auf HV02 – NUMA-Spanning (nur bewusst!) ändern, wirkt nach VMMS-Neustart
Set-VMHost -NumaSpanningEnabled $false
Restart-Service vmms
```

## Szenario
### Kontrollfragen
SQL02 (24 vCPU, dynamischer RAM bis 48 GB) läuft auf HV02 mit 2 NUMA-Knoten à 16 Kerne/64 GB. SQL Server sieht nur einen NUMA-Knoten.
- F: Warum sieht der Gast keine NUMA-Topologie? | A: Bei dynamischem Arbeitsspeicher wird keine virtuelle NUMA-Topologie präsentiert.
- F: Welche erste Änderung ist nötig? | A: VM aus, statischen Arbeitsspeicher konfigurieren.
- F: Mit welchem Cmdlet zeigst du die NUMA-Knoten des Hosts? | A: Get-VMHostNumaNode
- F: Was passiert, wenn NUMA-Spanning deaktiviert ist und eine VM nicht in einen Knoten passt? | A: Die VM kann nicht starten (bzw. nicht wiederhergestellt werden).
- F: Wann wird die Änderung von NumaSpanningEnabled wirksam? | A: Nach einem Neustart des Dienstes VMMS.

## Legende
### NUMA-Spanning
- Was: Host-Einstellung, ob VMs Speicher aus mehreren physischen NUMA-Knoten erhalten dürfen.
- Wie: Set-VMHost -NumaSpanningEnabled $true/$false, danach Restart-Service vmms.
- Wann: Deaktivieren nur, wenn planbare Leistung wichtiger ist als die Startgarantie.
- Wo: Hyper-V-Einstellungen des Servers → NUMA-Aufteilung.
- Warum: Remote-Speicherzugriffe kosten Leistung.
### Virtuelle NUMA-Topologie
- Was: NUMA-Knoten, die Hyper-V dem Gast vorspielt.
- Wie: Prozessor → NUMA → Höchstwerte je Knoten oder „Hardwaretopologie verwenden“.
- Warum: NUMA-fähige Anwendungen wie SQL Server verteilen Arbeit knotenlokal.

## Karteikarten
- F: Was bedeutet NUMA? | A: Non-Uniform Memory Access – lokaler Speicher je Prozessor ist schneller als entfernter.
- F: Welches Cmdlet zeigt die NUMA-Knoten eines Hosts? | A: Get-VMHostNumaNode
- F: Warum vertragen sich vNUMA und dynamischer RAM nicht? | A: Bei dynamischem Arbeitsspeicher wird dem Gast keine virtuelle NUMA-Topologie präsentiert.
- F: Standardzustand von NUMA-Spanning? | A: Aktiviert.
- F: Was ist der Nachteil von deaktiviertem NUMA-Spanning? | A: VMs, die nicht in freie Knoten passen, starten nicht.
- F: Was muss nach Set-VMHost -NumaSpanningEnabled passieren? | A: Der Dienst VMMS muss neu gestartet werden.
- F: Mit welchen Parametern begrenzt man vNUMA-Knoten? | A: Set-VMProcessor -MaximumCountPerNumaNode und Set-VMMemory -MaximumAmountPerNumaNodeBytes.
- F: Welcher Leistungsindikator zeigt Remote-Speicher einer VM? | A: Hyper-V VM Vid Partition\Remote Physical Pages.

## Quiz
? Warum sieht SQL Server in einer VM mit dynamischem Arbeitsspeicher keine NUMA-Knoten?
* Dynamischer Arbeitsspeicher und virtuelles NUMA schließen sich aus
- SQL Server unterstützt kein NUMA
- Gen-2-VMs haben kein NUMA
- NUMA funktioniert nur mit AMD-CPUs
! Für vNUMA muss der Arbeitsspeicher statisch sein.

? Wo wird NUMA-Spanning konfiguriert?
* Am Host mit Set-VMHost -NumaSpanningEnabled
- An der VM mit Set-VMProcessor -NumaSpanning
- In der Gast-Registry
- Im BIOS der VM
! Es ist eine Host-weite Einstellung.

? Was ist die Folge von deaktiviertem NUMA-Spanning?
* VMs, die nicht in einen freien Knoten passen, starten nicht
- Alle VMs bekommen doppelt so viel RAM
- Live-Migration wird deaktiviert
- Der Host verliert einen Sockel
! Planbare Leistung gegen Startgarantie.

? Welche Aktion ist nach dem Ändern von NumaSpanningEnabled nötig?
* Neustart des Dienstes VMMS
- Neustart aller Clients
- Neuinstallation der Integrationsdienste
- Update-VMVersion
! Erst dann gilt die neue Einstellung.

? Wie bekommt eine VM eine zur Hardware passende vNUMA-Topologie?
* Prozessor → NUMA → „Hardwaretopologie verwenden“
- Integrationsdienste → NUMA
- Firmware → Startreihenfolge
- Netzwerkkarte → Erweiterte Features
! Die Schaltfläche übernimmt die Werte des aktuellen Hosts.

? Was zeigt der Indikator „Remote Physical Pages“?
* Speicherseiten einer VM, die auf einem entfernten NUMA-Knoten liegen
- Ausgelagerte Seiten im Gast
- Anzahl der Prüfpunkte
- Netzwerkpakete an Remote-Hosts
! Viele Remote-Seiten bedeuten langsamere Zugriffe.

? Ein Host hat 2 Knoten à 16 Kerne. Eine VM hat 24 vCPU. Was ist sinnvoll?
* 2 virtuelle Knoten mit je 12 vCPU
- 1 virtueller Knoten mit 24 vCPU
- 24 virtuelle Knoten mit je 1 vCPU
- Dynamischen RAM aktivieren
! Die VM sollte sich gleichmäßig auf ganze Knoten verteilen.

? Welche Empfehlung gilt für SQL-Server-VMs?
* Statischer Arbeitsspeicher
- Dynamischer RAM mit 512 MB Start
- Nur eine vCPU
- NUMA im Gast deaktivieren
! So erhält SQL Server feste Ressourcen und eine NUMA-Topologie.
