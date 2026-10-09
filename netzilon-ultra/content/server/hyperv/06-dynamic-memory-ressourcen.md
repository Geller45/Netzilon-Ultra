---
id: server-hyperv-dynamic-memory
bereich: AZ-800
block: HV
kapitel: Hyper-V vertieft
titel: Dynamischer Arbeitsspeicher und Ressourcensteuerung (RAM, NUMA, CPU)
stufe: Fortgeschritten
fach: Windows Server / AZ-800
pruefungen: [AZ-800, AP2, Schule]
quellen: [Microsoft Learn – Hyper-V-Dokumentation, AZ-800 Study Guide]
verweise: [az800-vm-ram, az800-cpu-gruppen, az800-integrationsdienste, server-hyperv-nested-einschraenkungen, server-hyperv-nested-grundlagen]
---

## Profi

### Dynamischer Arbeitsspeicher (Dynamic Memory)
Mit **dynamischem Arbeitsspeicher** verteilt Hyper-V den physischen RAM des Hosts **bedarfsgerecht** auf die VMs. Der Gast meldet über die Integrationsdienste seinen **Speicherbedarf** (*Memory Demand*); Hyper-V fügt Speicher per **Hot-Add** hinzu oder holt ihn per **Ballooning** (Ballon-Treiber im Gast belegt Seiten, die der Host zurücknimmt) zurück.

| Einstellung | Bedeutung | PowerShell |
|---|---|---|
| **RAM beim Start** (*Startup Memory*) | Menge beim Booten (Boot braucht oft mehr als Leerlauf) | `-StartupBytes` |
| **Minimaler RAM** (*Minimum Memory*) | Untergrenze im Betrieb, darf **kleiner** als Start sein | `-MinimumBytes` |
| **Maximaler RAM** (*Maximum Memory*) | Obergrenze | `-MaximumBytes` |
| **Arbeitsspeicherpuffer** (*Memory Buffer*) | zusätzlicher Prozentsatz über dem aktuellen Bedarf als Reserve (5–2000 %, Standard **20 %**) | `-Buffer` |
| **Arbeitsspeichergewichtung** (*Memory Weight/Priority*) | Priorität bei Knappheit (0–100, Standard **50**) | `-Priority` |

```powershell
Set-VMMemory -VMName APP01 -DynamicMemoryEnabled $true -StartupBytes 2GB -MinimumBytes 1GB -MaximumBytes 8GB -Buffer 20 -Priority 80
Get-VM -Name APP01 | Select-Object Name, MemoryAssigned, MemoryDemand, MemoryStatus
```

**Was geht im laufenden Betrieb?**
- Dynamic Memory **ein-/ausschalten**: nur bei **ausgeschalteter** VM.
- **Startwert** ändern: nur bei ausgeschalteter VM (bei Dynamic Memory).
- **Minimum senken** und **Maximum erhöhen**: im **laufenden** Betrieb möglich (Minimum erhöhen/Maximum senken nur in Grenzen des aktuell zugewiesenen Speichers).
- Bei **statischem** RAM: seit Windows Server 2016 **Laufzeit-Größenänderung** (*Runtime Memory Resize*) für unterstützte Gäste (Windows 10/Server 2016 und neuer, aktuelle Linux) – Ausnahme: Nested mit laufendem Gast-Hypervisor.
- Voraussetzung im Gast: **Integrationsdienste** (bei aktuellen Windows-/Linux-Versionen enthalten).

**Nicht geeignet** für Dynamic Memory: Anwendungen, die beim Start den RAM fest dimensionieren oder eigene Speicherverwaltung haben (je nach Version z. B. Exchange; SQL Server und große Datenbanken nur mit Bedacht), sowie **Nested-Hyper-V-Hosts** (siehe dort).

### Smart Paging
**Smart Paging** überbrückt einen Spezialfall: Eine VM soll **neu starten**, ihr **Minimum ist kleiner als ihr Startwert**, und der Host hat gerade **nicht genug freien physischen RAM** für den Startwert. Dann lagert Hyper-V den fehlenden Teil **vorübergehend auf die Festplatte** aus (Smart-Paging-Datei), bis der Gast nach dem Boot wieder unter den Startwert fällt und Speicher per Ballooning zurückgibt.
- Nur beim **Neustart**, nicht im Normalbetrieb – kein Ersatz für zu wenig RAM.
- Speicherort: `Set-VM -Name APP01 -SmartPagingFilePath "E:\SmartPaging"` (schneller Datenträger empfohlen).

### NUMA
**NUMA** (*Non-Uniform Memory Access*): Bei Mehrsockel-Servern hat jede CPU „ihren“ lokalen Speicher; Zugriffe auf den Speicher eines anderen Knotens sind langsamer.
- **Virtuelles NUMA**: Hyper-V bildet die NUMA-Topologie in große VMs ab, damit NUMA-bewusste Anwendungen (SQL Server) optimal arbeiten. Einstellungen: `Set-VMProcessor -MaximumCountPerNumaNode`, `-MaximumCountPerNumaSocket`, `Set-VMMemory -MaximumAmountPerNumaNodeBytes` (GUI: Prozessor → NUMA → „Hardwaretopologie verwenden“).
- **Dynamic Memory und virtuelles NUMA schließen sich aus**: Mit Dynamic Memory sieht die VM nur **einen** NUMA-Knoten.
- **NUMA-Spanning** (Host-Einstellung, standardmäßig **an**): erlaubt VMs, Speicher über NUMA-Grenzen zu erhalten. Abschalten (`Set-VMHost -NumaSpanningEnabled $false`, danach Neustart des Dienstes VMMS) erzwingt lokale Zuteilung – mehr Leistung, aber eine VM startet ggf. nicht, wenn ein einzelner Knoten nicht genug RAM hat.
- Anzeige: `Get-VMHostNumaNode`.

### CPU-Ressourcensteuerung
Einstellungen unter VM → **Prozessor** bzw. `Set-VMProcessor`:

| Einstellung | Bedeutung | Bereich |
|---|---|---|
| **Anzahl virtueller Prozessoren** | vCPUs der VM (`-Count`) | max. abhängig von Version/Generation |
| **Reserve** (*Virtual machine reserve*) | garantierter Anteil der Rechenleistung der zugewiesenen vCPUs | 0–100 % (`-Reserve`) |
| **Limit** (*Virtual machine limit*) | Obergrenze des Anteils | 0–100 % (`-Maximum`) |
| **Relative Gewichtung** (*Relative weight*) | Priorität gegenüber anderen VMs bei Konkurrenz | 1–10000, Standard **100** (`-RelativeWeight`) |

```powershell
Set-VMProcessor -VMName APP01 -Count 4 -Reserve 25 -Maximum 75 -RelativeWeight 200
```
Die GUI zeigt zusätzlich „Prozentsatz der gesamten Systemressourcen“ – Reserve/Limit umgerechnet auf alle logischen Prozessoren des Hosts. Eine Reserve kann den Start einer VM verhindern, wenn die Summe aller Reserven die Host-Kapazität übersteigt.

Weitere CPU-Themen: **Prozessorkompatibilität** (`-CompatibilityForMigrationEnabled`, für Live-Migration zwischen unterschiedlichen CPU-Generationen desselben Herstellers), **Hypervisor-Scheduler** (Core-Scheduler ist seit Server 2019 Standard; Details siehe CPU-Gruppen/Scheduler).

### Bezug zu Nested
- Äußere Nested-VM: **statischen** RAM und feste vCPU-Anzahl verwenden; Dynamic Memory wirkt mit laufendem Gast-Hypervisor nicht.
- **Innere** VMs in HV-NESTED können Dynamic Memory nutzen – der Speicher stammt dann aus dem festen RAM von HV-NESTED.
- CPU-Gewichtung auf L0 hilft, das Lab nicht andere Host-VMs ausbremsen zu lassen (z. B. `-RelativeWeight 50` für Lab-VMs).

## Einfach

Stell dir eine **Pizza** (den Arbeitsspeicher des Hosts) vor, die mehrere Kinder (VMs) teilen.

- **Statischer RAM**: Jedes Kind bekommt am Anfang **fest** seine Stücke – auch wenn es keinen Hunger hat. Gerecht, aber Verschwendung.
- **Dynamischer RAM**: Eine Mama (Hyper-V) schaut ständig, **wer wie viel Hunger hat**. Wer satt ist, gibt Stücke zurück (**Ballooning**); wer hungrig ist, bekommt mehr (**Hot-Add**).

Die Regeln für jedes Kind:
- **Start**: So viel bekommt das Kind beim Hinsetzen (Booten macht hungrig).
- **Minimum**: So wenig darf es höchstens werden.
- **Maximum**: Mehr bekommt es nie.
- **Puffer**: Ein paar **Extra-Krümel** auf dem Teller, falls gleich der Hunger kommt.
- **Gewichtung**: Wenn die Pizza knapp wird, bekommen Kinder mit **hoher Priorität** zuerst.

**Smart Paging** ist der **Notfall-Teller aus Pappe**: Ein Kind steht auf und setzt sich wieder hin (Neustart), braucht zum Hinsetzen mehr, als gerade da ist. Dann bekommt es kurz Stücke auf einem langsamen Pappteller (Festplatte), bis es wieder etwas zurückgibt.

**NUMA** ist wie zwei **Tische**: Jedes Kind isst am liebsten vom eigenen Tisch. Vom Nachbartisch holen geht, dauert aber länger.

**Beim Prozessor** gibt es **Reserve** (so viel Rechenzeit ist dir sicher), **Limit** (mehr bekommst du nie) und **Gewichtung** (wer zuerst dran ist, wenn alle gleichzeitig rechnen wollen).

## Merksatz
- **Start – Minimum – Maximum – Puffer (20 %) – Gewichtung (50)**.
- Minimum senken / Maximum erhöhen: **im Betrieb**; Dynamic Memory an/aus: **VM aus**.
- Smart Paging nur beim **Neustart**, wenn Minimum < Start.
- Dynamic Memory + virtuelles NUMA = **geht nicht zusammen**.
- CPU: **Reserve** (Garantie), **Limit** (Deckel), **RelativeWeight** (Standard 100).

## Prüfungsfalle
- Smart Paging ist **kein** allgemeiner Auslagerungsmechanismus für den Betrieb.
- Der Puffer ist ein **Prozentwert** des aktuellen Bedarfs, keine feste MB-Zahl.
- Gewichtung beim RAM: Parameter heißt in PowerShell **-Priority**, beim CPU **-RelativeWeight**.
- Dynamic Memory lässt sich **nicht** im laufenden Betrieb einschalten.
- Mit Dynamic Memory gibt es kein virtuelles NUMA (VM sieht einen Knoten).
- Zu große CPU-Reserven können den **Start** weiterer VMs verhindern.
- Nested-Host-VMs gehören nicht auf Dynamic Memory.

## Grafik
### Ballooning und Hot-Add
1. APP01: Bedarf steigt, Gast meldet Memory Demand
2. HV01 -> APP01: Hot-Add von Speicher bis Bedarf plus Puffer
3. APP01: Last sinkt
4. HV01 -> APP01: Ballon-Treiber belegt freie Seiten
5. APP01 -> HV01: Seiten zurück an den Host
6. HV01 -> DB01: frei gewordener Speicher für andere VM

### Smart Paging beim Neustart
1. APP01: Neustart, Startwert 4 GB, Minimum 1 GB
2. HV01: nur 3 GB physisch frei
3. HV01 -> Disk: 1 GB über Smart-Paging-Datei
4. APP01: Boot abgeschlossen, Bedarf sinkt
5. HV01: Smart-Paging-Datei wird wieder aufgelöst

## Lab
**Maschinen**: Host **HV01.example.com** (Windows Server 2025, 64 GB RAM, 2 Sockel), VMs **APP01.example.com** und **DB01.example.com** (Windows Server 2025), Lab-VM **HV-NESTED**.

### GUI
1. **HV01**: APP01 herunterfahren → Einstellungen → **Arbeitsspeicher** → „Dynamischen Arbeitsspeicher aktivieren“ → Start 2048 MB, Minimum 1024 MB, Maximum 8192 MB, Puffer 20 %, Gewichtung Schieberegler Richtung „Hoch“.
2. **HV01**: APP01 starten → Hyper-V-Manager Registerkarte **Arbeitsspeicher** unten: Zugewiesen, Bedarf, Status beobachten.
3. **HV01**: APP01 → Einstellungen → **Verwaltung** → Smart-Paging-Dateispeicherort → E:\SmartPaging.
4. **HV01**: DB01 → Einstellungen → Prozessor → 4 vCPU, Reserve 25 %, Limit 100 %, relative Gewichtung 200 → NUMA → „Hardwaretopologie verwenden“.
5. **HV01**: HV-NESTED → Arbeitsspeicher → dynamisch **aus**, 8192 MB statisch; Prozessor → relative Gewichtung 50.
6. **HV01**: Hyper-V-Einstellungen → **NUMA-Übergreifung** → Option ansehen (Änderung erfordert Neustart des Verwaltungsdienstes).

### PowerShell
```powershell
# Auf HV01.example.com
Stop-VM -Name APP01
Set-VMMemory -VMName APP01 -DynamicMemoryEnabled $true -StartupBytes 2GB -MinimumBytes 1GB -MaximumBytes 8GB -Buffer 20 -Priority 80
Set-VM -Name APP01 -SmartPagingFilePath "E:\SmartPaging"
Start-VM -Name APP01
Get-VM -Name APP01 | Select-Object Name, MemoryAssigned, MemoryDemand, MemoryStatus

# Im laufenden Betrieb erlaubt
Set-VMMemory -VMName APP01 -MinimumBytes 768MB -MaximumBytes 12GB

# CPU-Steuerung
Set-VMProcessor -VMName DB01 -Count 4 -Reserve 25 -Maximum 100 -RelativeWeight 200
Get-VMProcessor -VMName DB01 | Select-Object VMName, Count, Reserve, Maximum, RelativeWeight

# NUMA
Get-VMHostNumaNode
Get-VMHost | Select-Object NumaSpanningEnabled

# Nested-Lab-VM bremsen
Set-VMProcessor -VMName HV-NESTED -RelativeWeight 50
```

## Legende
### Dynamischer Arbeitsspeicher
- Was: Bedarfsabhängige Zuteilung des Host-RAMs an VMs.
- Wie: Integrationsdienste melden Bedarf, Hyper-V nutzt Hot-Add und Ballooning im Rahmen von Start, Minimum, Maximum, Puffer und Gewichtung.
- Wann: Viele VMs mit schwankender Last (Datei-, Web-, VDI-Server).
- Wo: VM-Einstellungen → Arbeitsspeicher bzw. `Set-VMMemory`.
- Warum: Höhere Konsolidierungsdichte, weniger ungenutzter RAM.
### Smart Paging
- Was: Vorübergehende Auslagerung auf Datenträger beim Neustart einer VM.
- Wann: Minimum kleiner als Start und zu wenig freier Host-RAM beim Neustart.
- Wo: Speicherort per `Set-VM -SmartPagingFilePath`.
- Warum: Damit VMs trotz knappen Speichers neu starten können.
### CPU-Reserve, Limit, Gewichtung
- Was: Steuerung der Rechenzeit einer VM.
- Wie: `Set-VMProcessor -Reserve -Maximum -RelativeWeight`.
- Warum: Wichtige VMs bekommen garantierte Leistung, Lab-VMs werden gedeckelt.

## Karteikarten
- F: Welche fünf Werte hat dynamischer Arbeitsspeicher? | A: RAM beim Start, Minimum, Maximum, Puffer, Gewichtung.
- F: Standardwert des Arbeitsspeicherpuffers? | A: 20 Prozent.
- F: Wertebereich und Standard der Arbeitsspeichergewichtung? | A: 0–100, Standard 50 (PowerShell -Priority).
- F: Kann man Dynamic Memory im laufenden Betrieb einschalten? | A: Nein, nur bei ausgeschalteter VM.
- F: Welche Änderungen sind bei Dynamic Memory im Betrieb möglich? | A: Minimum senken und Maximum erhöhen.
- F: Wann wird Smart Paging verwendet? | A: Nur beim Neustart, wenn Minimum < Start ist und nicht genug physischer RAM frei ist.
- F: Wie heißt der Mechanismus, mit dem Hyper-V Speicher aus dem Gast zurückholt? | A: Ballooning (Ballon-Treiber der Integrationsdienste).
- F: Verträgt sich Dynamic Memory mit virtuellem NUMA? | A: Nein, mit Dynamic Memory sieht die VM nur einen NUMA-Knoten.
- F: Was bewirkt das Deaktivieren von NUMA-Spanning? | A: VMs erhalten nur Speicher aus einem NUMA-Knoten – schneller, aber Start kann scheitern.
- F: Was ist die CPU-Reserve? | A: Garantierter Prozentsatz der Rechenleistung der zugewiesenen vCPUs.
- F: Standardwert der relativen CPU-Gewichtung? | A: 100 (Bereich 1–10000).
- F: Welche Werte zeigt Get-VM zur Speicherauslastung? | A: MemoryAssigned, MemoryDemand, MemoryStatus.

## Quiz
? Eine VM soll im Leerlauf mit 1 GB auskommen, beim Booten aber 2 GB erhalten und nie mehr als 6 GB belegen. Welche Konfiguration passt?
* Start 2 GB, Minimum 1 GB, Maximum 6 GB
- Start 1 GB, Minimum 2 GB, Maximum 6 GB
- Start 6 GB, Minimum 1 GB, Maximum 2 GB
- Statisch 6 GB mit Puffer 20 %
! Startwert für den Boot, Minimum für den Leerlauf, Maximum als Deckel.

? Wann nutzt Hyper-V Smart Paging?
* Beim Neustart einer VM, deren Minimum unter dem Startwert liegt, wenn nicht genug physischer RAM frei ist
- Immer wenn der Host weniger als 10 % freien RAM hat
- Bei jeder Live-Migration
- Wenn der Puffer überschritten wird
! Smart Paging ist eine reine Neustart-Überbrückung.

? Welche Änderung ist bei einer laufenden VM mit Dynamic Memory möglich?
* Das Maximum erhöhen
- Dynamic Memory deaktivieren
- Den Startwert ändern
- Von statisch auf dynamisch umstellen
! Minimum senken und Maximum erhöhen funktionieren online; Start und Aktivierung nur offline.

? Was beschreibt der Arbeitsspeicherpuffer?
* Zusätzlichen Speicher in Prozent über dem aktuellen Bedarf als Reserve
- Den Speicher des Hosts für das Verwaltungsbetriebssystem
- Die Größe der Auslagerungsdatei im Gast
- Die Mindestmenge beim Start
! Standard 20 %, einstellbar 5–2000 %.

? Bei Speicherknappheit soll DB01 vor APP01 bedient werden. Welche Einstellung?
* Höhere Arbeitsspeichergewichtung (-Priority) für DB01
- Höherer Puffer für APP01
- NUMA-Spanning deaktivieren
- Smart-Paging-Pfad für DB01 ändern
! Die Gewichtung entscheidet, welche VM bei Knappheit bevorzugt Speicher erhält.

? Was gilt für virtuelles NUMA und Dynamic Memory?
* Sie schließen sich aus – mit Dynamic Memory sieht die VM nur einen NUMA-Knoten
- Virtuelles NUMA erfordert Dynamic Memory
- Beide sind nur auf Gen-1-VMs verfügbar
- Dynamic Memory verdoppelt die NUMA-Knoten
! Große NUMA-bewusste VMs (SQL) daher mit statischem RAM betreiben.

? Welcher Parameter begrenzt die CPU-Nutzung einer VM auf höchstens 50 % ihrer vCPU-Kapazität?
* Set-VMProcessor -Maximum 50
- Set-VMProcessor -Reserve 50
- Set-VMProcessor -RelativeWeight 50
- Set-VMProcessor -Count 50
! Maximum = Limit, Reserve = Garantie, RelativeWeight = Priorität.

? Welcher Standardwert gilt für die relative CPU-Gewichtung?
* 100
- 50
- 1
- 10000
! Bereich 1–10000; Standard 100. Beim RAM ist die Gewichtung 0–100 mit Standard 50.

? Eine VM startet nicht mehr, nachdem bei mehreren VMs CPU-Reserven gesetzt wurden. Warum?
* Die Summe der Reserven übersteigt die verfügbare Host-Kapazität
- Reserven aktivieren automatisch Nested Virtualization
- Reserven sind nur für Gen-1-VMs erlaubt
- Reserven deaktivieren den Hypervisor-Scheduler
! Hyper-V garantiert Reserven und verweigert den Start, wenn er die Garantie nicht einhalten kann.

? Was bewirkt Set-VMHost -NumaSpanningEnabled $false?
* VMs erhalten Speicher nur aus einem NUMA-Knoten; Starts können scheitern, wenn ein Knoten nicht genug RAM hat
- NUMA wird im Gast deaktiviert
- Dynamic Memory wird für alle VMs abgeschaltet
- Der Host nutzt nur noch einen CPU-Sockel
! Die Änderung wird nach Neustart des Verwaltungsdienstes wirksam.

? Warum sollte die äußere VM eines Nested-Labs statischen RAM haben?
* Mit laufendem Gast-Hypervisor schwankt der Speicher nicht; Dynamic Memory bringt keinen Nutzen
- Weil Nested nur mit Gen 1 funktioniert
- Weil statischer RAM MAC-Spoofing aktiviert
- Weil Dynamic Memory die Konfigurationsversion senkt
! Planbar fester RAM verhindert, dass innere VMs mangels Speicher nicht starten.

? Welche Werte zeigt Get-VM zur Beurteilung von Dynamic Memory?
* MemoryAssigned, MemoryDemand und MemoryStatus
- CPUUsage, Uptime und Version
- Generation, Path und Notes
- NumaNodes, Buffer und Priority
! Bedarf (Demand) vs. Zuweisung (Assigned) zeigt, ob eine VM unter Druck steht (Status z. B. „Warning“).

## Lücken
- Der Arbeitsspeicherpuffer beträgt standardmäßig {20} Prozent, die Gewichtung standardmäßig {50}.
- {Smart Paging} hilft nur beim {Neustart}, wenn das Minimum kleiner als der Startwert ist.
- Die CPU-Garantie heißt {Reserve}, die Obergrenze {Limit|Maximum} und die Priorität {relative Gewichtung|RelativeWeight}.

## Zuordnen
### Einstellung und Wirkung
- Startup Memory => RAM für den Bootvorgang
- Minimum Memory => Untergrenze im laufenden Betrieb
- Memory Buffer => Reserve in Prozent über dem Bedarf
- Smart Paging => Auslagerung beim Neustart bei RAM-Knappheit
- RelativeWeight => CPU-Priorität gegenüber anderen VMs
- NumaSpanningEnabled => Speicher über NUMA-Knotengrenzen erlauben

## Reihenfolge
### Dynamic Memory für APP01 einrichten
1. APP01 herunterfahren
2. Dynamic Memory aktivieren und Start, Minimum, Maximum setzen
3. Puffer und Gewichtung festlegen
4. Smart-Paging-Pfad auf schnellen Datenträger legen
5. APP01 starten
6. MemoryAssigned und MemoryDemand beobachten

## Freitext
- F: Erläutern Sie die fünf Einstellungen des dynamischen Arbeitsspeichers. | M: Start: RAM beim Booten; Minimum: Untergrenze im Betrieb; Maximum: Obergrenze; Puffer: prozentuale Reserve über dem Bedarf (Standard 20 %); Gewichtung: Priorität bei Knappheit (0–100, Standard 50) | P: 5
- F: Beschreiben Sie Zweck und Grenzen von Smart Paging. | M: Überbrückt beim Neustart fehlenden physischen RAM, wenn Minimum < Start, durch temporäre Auslagerung auf Datenträger; nur für den Neustart, nicht für den Dauerbetrieb, langsamer als RAM, Pfad per SmartPagingFilePath | P: 4

## Szenario
### Konsolidierung im Ausbildungsbetrieb
Auf **HV01.example.com** (64 GB RAM, 2 NUMA-Knoten) laufen 12 VMs mit statisch je 6 GB. Neue VMs passen nicht mehr. Der Datenbankserver **DB01** (SQL Server, NUMA-bewusst) soll maximale Leistung behalten, die Lab-VM **HV-NESTED** soll andere VMs nicht ausbremsen.
- F: Wie gewinnen Sie Speicher für weitere VMs? | A: Für Datei-/Web-VMs Dynamic Memory aktivieren (VM aus), z. B. Start 2 GB, Minimum 1 GB, Maximum 6 GB, Puffer 20 % | P: 2
- F: Welche Speicherart wählen Sie für DB01 und warum? | A: Statischen RAM – Dynamic Memory würde virtuelles NUMA abschalten, SQL Server profitiert von NUMA und fest zugewiesenem Speicher | P: 2
- F: Wie verhindern Sie, dass HV-NESTED CPU-Leistung wegnimmt? | A: Set-VMProcessor -VMName HV-NESTED -RelativeWeight 50 und ggf. -Maximum 50 | P: 2
- F: Wie prüfen Sie nach der Umstellung den Speicherdruck? | A: Get-VM \| Select-Object Name, MemoryAssigned, MemoryDemand, MemoryStatus | P: 2

## Spickzettel
- Start / Minimum / Maximum / Puffer 20 % / Gewichtung 50 (-Priority)
- Online: Minimum runter, Maximum hoch; DM an/aus nur offline
- Smart Paging: nur Neustart, Minimum < Start
- DM schließt virtuelles NUMA aus
- CPU: -Reserve, -Maximum, -RelativeWeight (100)
- Nested-Host-VM: statischer RAM
