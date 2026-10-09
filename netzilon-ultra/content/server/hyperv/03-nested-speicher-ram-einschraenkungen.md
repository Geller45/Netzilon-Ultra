---
id: server-hyperv-nested-einschraenkungen
bereich: AZ-800
block: HV
kapitel: Hyper-V vertieft
titel: Nested Virtualization – Arbeitsspeicher, Einschränkungen und Fehlerbilder
stufe: Profi
fach: Windows Server / AZ-800
pruefungen: [AZ-800, AP2, Schule]
quellen: [Microsoft Learn – Hyper-V-Dokumentation, AZ-800 Study Guide]
verweise: [az800-nested, az800-vm-ram, az800-pruefpunkte, az801-credential-guard, server-hyperv-nested-grundlagen, server-hyperv-dynamic-memory, server-hyperv-pruefpunkte-vertieft]
---

## Profi

### Arbeitsspeicher: Dynamic Memory und Laufzeit-Größenänderung
Microsoft beschreibt das Verhalten so: **Solange Hyper-V in einer VM läuft**, muss diese VM **ausgeschaltet** werden, um ihren Arbeitsspeicher zu ändern.
- **Dynamischer Arbeitsspeicher** (*Dynamic Memory*) darf zwar eingeschaltet sein, der Speicher der äußeren VM **schwankt aber nicht** – er bleibt praktisch auf dem Startwert stehen. Ballooning (Speicher zurückgeben) funktioniert nicht, weil der Gast-Hypervisor den Speicher an seine inneren VMs vergeben hat.
- **Laufzeit-Größenänderung** (*Runtime Memory Resize*) bei statischem RAM **schlägt fehl**, solange Hyper-V in der VM aktiv ist.
- Wichtig: **Das bloße Aktivieren** von ExposeVirtualizationExtensions ändert daran nichts – die Inkompatibilität entsteht erst, wenn in der VM tatsächlich der **Hypervisor läuft** (Hyper-V-Rolle installiert und gestartet).

**Praxis**: äußere VM mit **statischem** Arbeitsspeicher planen, groß genug für L1-Betriebssystem + alle L2-VMs + Reserve. Rechenbeispiel: HV-NESTED braucht ca. 2 GB für sich, INNER01 2 GB, INNER02 2 GB, plus ~1 GB Overhead → mindestens **8 GB statisch**.

### Prüfpunkte und Speichern des Zustands
- **Speichern** (*Save State*) und **Standardprüfpunkte** (die den **Arbeitsspeicherinhalt** sichern) einer äußeren VM mit laufendem Gast-Hypervisor gelten als **nicht unterstützt** bzw. werden blockiert – der Zustand der inneren VMs (deren VMCS-Strukturen im L0-Hypervisor) lässt sich nicht sauber einfrieren.
- **Sichere Wege**: äußere VM **herunterfahren** und dann einen Prüfpunkt erstellen, oder **Produktionsprüfpunkte** (ohne RAM, VSS im Gast). In der äußeren VM selbst kann man von den **inneren** VMs ganz normal Prüfpunkte machen.
- Im Lab: vor großen Änderungen alle inneren VMs herunterfahren, dann HV-NESTED herunterfahren, dann Prüfpunkt.

### Live-Migration nicht möglich
Eine VM mit **aktivem Gast-Hypervisor** kann **nicht live migriert** werden (auch nicht Speichermigration mit laufendem Zustand). Für einen Hostwechsel: herunterfahren → **Offline-Migration** (Quick Migration ohne Save State, Export/Import oder Move-VM im ausgeschalteten Zustand). In einem Failover-Cluster aus **physischen** Knoten bedeutet das: Nested-VMs sind beim Clusterknoten-Patching (CAU) nicht unterbrechungsfrei verschiebbar.

Hinweis: **Innerhalb** eines Nested-Labs (zwei verschachtelte Hyper-V-Knoten) kann man die **inneren** VMs sehr wohl zwischen den Nested-Knoten live migrieren – genau das übt man im Cluster-Lab.

### Virtualisierungsbasierte Sicherheit (VBS)
- **Host-Seite**: Unter Windows Server 2016 bzw. frühen Windows-10-Versionen konnte ein Host mit aktivem **VBS/Device Guard** die Virtualisierungserweiterungen nicht weitergeben. Bei aktuellen Versionen (Server 2019+, Windows 10 ab 1803/Windows 11) ist das kombinierbar.
- **Gast-Seite**: VBS, **Credential Guard** und **HVCI** (Speicherintegrität) im Gast benötigen selbst einen Hypervisor → dafür muss ExposeVirtualizationExtensions an der VM aktiv sein (Gen 2, Secure Boot, idealerweise vTPM).

### Leistungsoverhead
- **CPU**: Jede Virtualisierungsoperation der L2-VM (z. B. VM-Exits, Interrupts) wird von L1 abgefangen und muss wiederum von **L0 emuliert** werden → mehrfache Kontextwechsel. Rechenlast ohne Exits läuft fast nativ, I/O-intensive Last deutlich langsamer.
- **Speicher**: doppelte Adressübersetzung (L2 → L1 → L0) über EPT/NPT, „Shadow EPT“ im L0. Speicher wird zweimal verwaltet.
- **Netzwerk/Storage**: Pakete laufen durch zwei vSwitches bzw. zwei VHDX-Schichten (VHDX in VHDX). Kein SR-IOV/DDA in der inneren Ebene.
- **Empfehlungen**: wenige Ebenen (praktisch nur L2), SSD/NVMe für die VHDX-Dateien, feste vCPU-Anzahl, statischer RAM, für Lastspitzen Reserve auf L0 einplanen.

### Weitere Einschränkungen und Hinweise
- **DDA** (*Discrete Device Assignment*) und **SR-IOV** stehen inneren VMs nicht zur Verfügung.
- **Konfigurationsversion** und **Prozessor-Kompatibilitätsmodus**: Der Kompatibilitätsmodus (*CompatibilityForMigrationEnabled*) blendet CPU-Funktionen aus; für Nested sollte er nicht nötig sein und kann stören.
- **Gen 1 vs. Gen 2**: Beide Generationen können Nested; im Lab werden Gen-2-VMs empfohlen (UEFI, Secure Boot, vTPM).
- **Mehr als zwei Ebenen** (L3) sind technisch denkbar, werden aber nicht als unterstütztes Szenario beschrieben und sind sehr langsam.

### Typische Fehlerbilder
| Symptom | Ursache | Lösung |
|---|---|---|
| Hyper-V-Rolle in L1 lässt sich nicht installieren | Erweiterungen nicht weitergegeben, CPU ohne EPT, AMD auf Host < Server 2022 | Set-VMProcessor … $true bei VM aus, Host prüfen |
| Set-VMProcessor meldet Fehler | VM läuft oder ist gespeichert | Stop-VM, ggf. gespeicherten Zustand verwerfen |
| L2-VM startet nicht: „Nicht genügend Arbeitsspeicher“ | L1 zu klein, RAM kann nicht wachsen | L1 herunterfahren, statischen RAM erhöhen |
| Set-VMMemory bei laufender L1-VM schlägt fehl | Laufzeit-Resize mit aktivem Hypervisor | herunterfahren, dann ändern |
| L2-VMs ohne Netzwerk | MAC-Spoofing fehlt bzw. Azure ohne NAT | MAC-Spoofing auf L0 oder NAT in L1 |
| Live-Migration der äußeren VM bricht ab | Gast-Hypervisor aktiv | Offline-Migration |
| Prüfpunkt/Speichern der äußeren VM schlägt fehl | Speicherzustand mit Nested nicht sicherbar | herunterfahren oder Produktionsprüfpunkt |
| Sehr langsame L2-VMs | Overhead, HDD statt SSD, zu wenig vCPU | SSD, mehr vCPU, weniger L2-VMs |

## Einfach

Erinnere dich an die **Matroschka**: Die mittlere Puppe **HV-NESTED** hat kleine Puppen in ihrem Bauch.

**Warum darf die mittlere Puppe nicht wachsen oder schrumpfen?** Normalerweise kann Hyper-V einer VM im laufenden Betrieb Speicher geben oder wegnehmen – wie ein Luftballon, der aufgepumpt oder entleert wird (**dynamischer Arbeitsspeicher**). Aber in HV-NESTED wohnen schon kleine VMs, die sich den Speicher aufgeteilt haben. Wenn man den Ballon zusammendrückt, würden die kleinen Puppen zerquetscht. Darum bleibt der Speicher **fest**, solange darin Hyper-V läuft. Ändern geht nur, wenn die Puppe **ausgeschaltet** ist.

**Warum kein Foto mit Speicher (Prüfpunkt) und kein Umzug im laufenden Betrieb (Live-Migration)?** Stell dir vor, du willst ein Foto von der mittleren Puppe machen, auf dem auch genau zu sehen ist, was die kleinen Puppen gerade **denken**. Das ist zu kompliziert – die Gedanken der kleinen Puppen liegen teilweise beim großen Hyper-V. Darum: erst alles **ausschalten**, dann fotografieren oder umziehen.

**Warum ist es langsamer?** Wenn die kleine Puppe etwas Besonderes will, fragt sie die mittlere Puppe. Die kann es aber nicht selbst und fragt die große Puppe. Die große erledigt es und gibt die Antwort zurück. **Stille Post mit drei Leuten** dauert eben länger als direkt fragen.

**Gute Regeln fürs Lab**: viel festen Speicher geben, schnelle SSD verwenden, nicht zu viele kleine VMs auf einmal und **vor Änderungen alles herunterfahren**.

## Merksatz
- Hyper-V läuft in der VM → **RAM nur bei ausgeschalteter VM ändern**.
- Dynamic Memory an der äußeren VM: erlaubt, aber **wirkungslos**.
- Äußere VM: **keine Live-Migration**, kein Save State, keine Standardprüfpunkte im laufenden Betrieb.
- Innere VMs dürfen zwischen Nested-Knoten live migriert werden.
- VBS/Credential Guard im Gast braucht ExposeVirtualizationExtensions.

## Prüfungsfalle
- „Nested aktiviert = Dynamic Memory sofort kaputt“ ist zu ungenau: Die Einschränkung gilt, **sobald der Hypervisor in der VM läuft**.
- Die **äußere** VM ist nicht live-migrierbar – die **inneren** VMs zwischen zwei Nested-Hosts schon.
- Bei Fehlern mit `Set-VMMemory` auf einer laufenden Nested-VM nicht an Host-RAM denken, sondern an die Laufzeit-Einschränkung.
- VBS auf dem **Host** blockiert Nested nur bei alten Versionen (Server 2016).
- Prüfpunkte der äußeren VM: erst herunterfahren; Produktionsprüfpunkte sind die sichere Variante.

## Grafik
### Stille Post der Virtualisierung
1. INNER01 -> HV-NESTED: VM-Exit, z. B. I/O-Zugriff
2. HV-NESTED -> HV01: Gast-Hypervisor löst selbst einen Exit aus
3. HV01: L0 emuliert die Operation
4. HV01 -> HV-NESTED: Ergebnis zurück an L1
5. HV-NESTED -> INNER01: L1 setzt die innere VM fort

### RAM-Änderung
1. Admin -> HV01: Set-VMMemory HV-NESTED -StartupBytes 12GB
2. HV01: Fehler – Hypervisor in HV-NESTED aktiv
3. Admin -> HV-NESTED: herunterfahren
4. Admin -> HV01: Set-VMMemory erfolgreich, VM starten

## Lab
**Maschinen**: Host **HV01.example.com** (Windows Server 2025), äußere VM **HV-NESTED** (Nested aktiv, Hyper-V-Rolle), innere VM **INNER01**, zweiter Host **HV02.example.com** für den Migrationsversuch.

### GUI
1. **HV01**: HV-NESTED läuft mit gestarteter INNER01 → Einstellungen → Arbeitsspeicher → RAM von 8192 auf 10240 MB ändern → **Übernehmen** → Fehlermeldung beobachten.
2. **HV01**: Rechtsklick HV-NESTED → **Verschieben** → Ziel HV02 → Fehlermeldung zur Live-Migration notieren.
3. **HV-NESTED**: INNER01 herunterfahren, dann HV-NESTED **herunterfahren**.
4. **HV01**: Arbeitsspeicher auf 10240 MB setzen, „Dynamischen Arbeitsspeicher“ deaktiviert lassen → OK.
5. **HV01**: HV-NESTED → Prüfpunkt (im ausgeschalteten Zustand) → Name „Lab-Basis“.
6. **HV01**: HV-NESTED starten → in **HV-NESTED** Taskmanager → Leistung → CPU „Virtualisierung: Aktiviert“ prüfen.

### PowerShell
```powershell
# Auf HV01.example.com
Get-VM -Name HV-NESTED | Select-Object Name, State, MemoryStartup, DynamicMemoryEnabled
Set-VMMemory -VMName HV-NESTED -StartupBytes 10GB          # schlägt fehl, solange Hyper-V in der VM läuft
Move-VM -Name HV-NESTED -DestinationHost HV02.example.com  # Live-Migration: wird abgelehnt

Stop-VM -Name HV-NESTED
Set-VMMemory -VMName HV-NESTED -DynamicMemoryEnabled $false -StartupBytes 10GB
Checkpoint-VM -Name HV-NESTED -SnapshotName "Lab-Basis"
Start-VM -Name HV-NESTED

# Offline-Migration (VM aus) als Alternative
Stop-VM -Name HV-NESTED
Move-VM -Name HV-NESTED -DestinationHost HV02.example.com -IncludeStorage -DestinationStoragePath D:\VMs\HV-NESTED

# In HV-NESTED: Hypervisor aktiv?
Get-ComputerInfo -Property HyperVisorPresent
```

## Legende
### Laufzeit-Einschränkungen bei Nested
- Was: Mit aktivem Gast-Hypervisor sind RAM-Änderungen im Betrieb, Dynamic-Memory-Ballooning, Save State und Live-Migration der äußeren VM nicht möglich.
- Wie: Änderungen nur bei ausgeschalteter äußerer VM; Migration offline.
- Wann: Sobald in der VM Hyper-V tatsächlich läuft – nicht schon beim bloßen Setzen der Einstellung.
- Wo: An der äußeren VM (L1) auf dem physischen Host.
- Warum: Der Speicher- und CPU-Zustand der inneren VMs liegt teilweise im L0-Hypervisor und kann nicht konsistent verschoben oder gesichert werden.
### Leistungsoverhead
- Was: Zusatzaufwand durch doppelte Virtualisierung.
- Wie: VM-Exits laufen über L1 und L0, doppelte Adressübersetzung.
- Womit: Reduzieren durch SSD/NVMe, statischer RAM, ausreichend vCPU, wenige Ebenen.
- Warum: Nested ist ein Lab- und Spezialwerkzeug, kein Ersatz für Bare-Metal-Hosts.

## Karteikarten
- F: Kann man den RAM einer äußeren VM mit laufendem Hyper-V im Betrieb ändern? | A: Nein, solange der Gast-Hypervisor läuft, nur bei ausgeschalteter VM.
- F: Was passiert mit Dynamic Memory an einer äußeren VM mit laufendem Hyper-V? | A: Es darf aktiv sein, der Speicher schwankt aber nicht – bleibt auf dem Startwert.
- F: Ab wann gilt die RAM-Einschränkung genau? | A: Sobald in der VM tatsächlich der Hypervisor läuft, nicht schon beim Setzen von ExposeVirtualizationExtensions.
- F: Kann die äußere VM live migriert werden? | A: Nein, nur offline (heruntergefahren).
- F: Können innere VMs zwischen zwei Nested-Hyper-V-Knoten live migriert werden? | A: Ja, das ist ein typisches Cluster-Lab-Szenario.
- F: Wie erstellt man sicher einen Prüfpunkt einer äußeren Nested-VM? | A: VM herunterfahren und dann Prüfpunkt erstellen bzw. Produktionsprüfpunkt verwenden.
- F: Warum braucht Credential Guard im Gast Nested Virtualization? | A: VBS nutzt den Hypervisor; der Gast braucht dafür die Virtualisierungserweiterungen.
- F: Welche Host-Version konnte mit aktivem VBS keine Erweiterungen weitergeben? | A: Windows Server 2016 bzw. frühe Windows-10-Versionen.
- F: Woher kommt der CPU-Overhead bei Nested? | A: VM-Exits der L2-VM werden von L1 abgefangen und müssen von L0 emuliert werden – mehrfache Kontextwechsel.
- F: Welche Gerätezuweisungen stehen inneren VMs nicht zur Verfügung? | A: DDA (Discrete Device Assignment) und SR-IOV.
- F: Wie viel RAM plant man für HV-NESTED mit zwei 2-GB-VMs? | A: Etwa 2 GB L1 + 2 × 2 GB + Overhead, also mind. 8 GB statisch.
- F: Welche Migrationsart bleibt für die äußere VM? | A: Offline-Migration: herunterfahren, dann Move-VM bzw. Export/Import.

## Quiz
? Ein Admin will den Arbeitsspeicher der laufenden VM HV-NESTED (Hyper-V-Rolle aktiv, zwei innere VMs) von 8 auf 12 GB erhöhen. Was passiert?
* Die Änderung schlägt fehl; die VM muss dafür ausgeschaltet werden
- Die Änderung wirkt sofort
- Die Änderung wirkt erst nach Neustart der inneren VMs
- Der Host erhöht den RAM automatisch über Smart Paging
! Mit aktivem Gast-Hypervisor ist keine Laufzeit-Größenänderung des Speichers möglich.

? Wie verhält sich Dynamic Memory an einer äußeren VM, in der Hyper-V läuft?
* Es kann aktiviert sein, der Speicher bleibt aber praktisch auf dem Startwert
- Es verdoppelt automatisch den Startwert
- Es verteilt Speicher direkt an die inneren VMs
- Es deaktiviert sich und meldet einen Fehler beim Start
! Microsoft dokumentiert: Der Speicher fluktuiert nicht, solange Hyper-V in der VM läuft.

? Welche Aussage zur Live-Migration im Nested-Szenario ist richtig?
* Die äußere VM mit aktivem Gast-Hypervisor kann nicht live migriert werden
- Die äußere VM kann nur live migriert werden, wenn MAC-Spoofing aktiv ist
- Innere VMs können grundsätzlich nie migriert werden
- Live-Migration funktioniert nur in Azure
! Innere VMs zwischen zwei Nested-Knoten können migriert werden – die äußere VM selbst nur offline.

? Wann gilt die Einschränkung beim Arbeitsspeicher genau?
* Wenn in der VM der Hypervisor tatsächlich läuft
- Sobald ExposeVirtualizationExtensions gesetzt ist, auch ohne Hyper-V-Rolle
- Nur bei Gen-1-VMs
- Nur bei Konfigurationsversion unter 8.0
! Das bloße Aktivieren der Erweiterungen ändert nichts; erst der laufende Gast-Hypervisor verursacht die Inkompatibilität.

? Wie erstellt man am sichersten einen Prüfpunkt von HV-NESTED vor einem Lab-Umbau?
* Innere VMs und HV-NESTED herunterfahren, dann Prüfpunkt erstellen
- Standardprüfpunkt im laufenden Betrieb mit RAM-Zustand
- VM speichern (Save State) und Snapshot der VHDX kopieren
- AVHDX-Datei manuell anlegen
! Speicherzustände mit laufendem Gast-Hypervisor sind nicht zuverlässig sicherbar; ausgeschaltet ist der Prüfpunkt unproblematisch.

? Warum benötigt Credential Guard in einer VM die Weitergabe der Virtualisierungserweiterungen?
* Weil VBS einen Hypervisor im Gast verwendet
- Weil Credential Guard MAC-Spoofing benötigt
- Weil Credential Guard nur mit Dynamic Memory läuft
- Weil Credential Guard eine Gen-1-VM voraussetzt
! VBS isoliert Geheimnisse in einer vom Hypervisor geschützten Umgebung (VTL 1) – dazu braucht der Gast VT-x/AMD-V.

? Welche Ursache erklärt den deutlichen I/O-Leistungsverlust einer L2-VM?
* Jeder VM-Exit wird von L1 abgefangen und muss zusätzlich von L0 emuliert werden
- L2-VMs laufen grundsätzlich ohne Integrationsdienste
- L2-VMs dürfen nur eine vCPU haben
- L2-VMs nutzen immer Gen 1
! Die Kaskade von Exits über zwei Hypervisor-Ebenen ist die Hauptquelle des Overheads.

? Welche Funktion steht inneren VMs (L2) NICHT zur Verfügung?
* Discrete Device Assignment (DDA) einer physischen GPU
- Prüfpunkte
- Integrationsdienste
- Virtuelle Switches
! Physische Geräte können nicht durch zwei Hypervisor-Ebenen durchgereicht werden.

? Ein Host läuft mit Windows Server 2016 und aktiviertem Device Guard/VBS. Was ist für Nested zu erwarten?
* Die Virtualisierungserweiterungen können nicht weitergegeben werden
- Nested funktioniert nur mit AMD
- Nested funktioniert, aber nur für Linux-Gäste
- Device Guard wird automatisch deaktiviert
! Diese Einschränkung bestand bei Server 2016/frühem Windows 10; neuere Versionen können VBS und Nested kombinieren.

? Welche Maßnahme verbessert die Leistung eines Nested-Labs am meisten?
* VHDX-Dateien auf SSD/NVMe und ausreichend statischen RAM
- Kompatibilitätsmodus für Prozessoren aktivieren
- Dynamic Memory mit kleinem Minimum
- Mehr Schachtelungsebenen
! Storage-Latenz und Speichermangel sind die häufigsten Bremsen im Lab.

? Move-VM für HV-NESTED (läuft, Hyper-V aktiv) zu HV02 schlägt fehl. Welche Alternative funktioniert?
* VM herunterfahren und offline verschieben
- MAC-Spoofing deaktivieren und erneut versuchen
- Dynamic Memory aktivieren
- Konfigurationsversion herabsetzen
! Mit aktivem Gast-Hypervisor bleibt nur die Migration im ausgeschalteten Zustand.

? Was bewirkt der Prozessor-Kompatibilitätsmodus (CompatibilityForMigrationEnabled) im Nested-Kontext?
* Er blendet CPU-Funktionen aus und ist für Nested nicht nötig, kann sogar stören
- Er ist Voraussetzung für Nested
- Er ermöglicht Live-Migration der äußeren VM
- Er aktiviert EPT
! Der Modus dient Migrationen zwischen unterschiedlichen CPU-Generationen und reduziert den sichtbaren Befehlssatz.

? Welche Planung ist für HV-NESTED mit drei inneren VMs zu je 2 GB sinnvoll?
* Mindestens ca. 10 GB statischer RAM für L1
- 4 GB dynamisch mit Minimum 512 MB
- 2 GB statisch, Rest über Smart Paging
- 6 GB dynamisch mit Puffer 200 %
! L1 braucht eigenen Speicher plus Summe der L2-VMs plus Overhead – und wachsen kann der RAM im Betrieb nicht.

## Lücken
- Solange Hyper-V in der VM läuft, lässt sich der Arbeitsspeicher nur im {ausgeschalteten|heruntergefahrenen} Zustand ändern.
- Die äußere VM kann nicht {live migriert|live-migriert} werden, die inneren VMs zwischen zwei Nested-Knoten schon.
- Credential Guard im Gast benötigt {VBS|virtualisierungsbasierte Sicherheit} und damit weitergegebene {Virtualisierungserweiterungen}.

## Zuordnen
### Fehlerbild und Ursache
- Set-VMMemory schlägt im Betrieb fehl => Gast-Hypervisor aktiv, Laufzeit-Resize nicht möglich
- Move-VM der äußeren VM abgelehnt => Live-Migration mit Nested nicht unterstützt
- L2-VM ohne Netzwerk => MAC-Spoofing oder NAT fehlt
- Hyper-V-Rolle in L1 nicht installierbar => Erweiterungen nicht weitergegeben
- L2-VM extrem langsam => Overhead plus langsamer Speicher

## Reihenfolge
### RAM einer Nested-VM erhöhen
1. Innere VMs in HV-NESTED herunterfahren
2. HV-NESTED herunterfahren
3. Set-VMMemory mit neuem statischen Wert ausführen
4. Prüfpunkt im ausgeschalteten Zustand erstellen
5. HV-NESTED starten
6. Innere VMs starten und Speicherbedarf prüfen

## Freitext
- F: Nennen Sie vier Einschränkungen einer VM mit aktivem Gast-Hypervisor und je eine Gegenmaßnahme. | M: Keine RAM-Laufzeitänderung → herunterfahren; Dynamic Memory wirkungslos → statischen RAM planen; keine Live-Migration → Offline-Migration; Save State/Standardprüfpunkt problematisch → herunterfahren oder Produktionsprüfpunkt; kein DDA/SR-IOV in L2 | P: 8
- F: Erläutern Sie, warum Nested Virtualization Leistung kostet. | M: VM-Exits der inneren VM werden vom Gast-Hypervisor abgefangen, der selbst virtualisiert ist; L0 muss emulieren → mehrfache Kontextwechsel, doppelte Adressübersetzung, zwei vSwitch- und VHDX-Schichten | P: 4

## Szenario
### Nested-Cluster wird zu langsam
Im Heimlabor läuft auf **HV01.example.com** (32 GB RAM, HDD) die VM **HVN1** (Nested, 6 GB dynamisch, Minimum 2 GB) mit drei inneren VMs. INNER03 startet mit „Nicht genügend Arbeitsspeicher“. Der Admin will HVN1 im laufenden Betrieb auf 12 GB vergrößern und sie danach auf **HV02** live migrieren.
- F: Warum wächst HVN1 trotz Dynamic Memory nicht? | A: Solange Hyper-V in HVN1 läuft, fluktuiert der Speicher nicht – er bleibt auf dem Startwert | P: 2
- F: Wie vergrößern Sie den RAM korrekt? | A: Innere VMs und HVN1 herunterfahren, Set-VMMemory -VMName HVN1 -DynamicMemoryEnabled $false -StartupBytes 12GB, starten | P: 3
- F: Ist die Live-Migration zu HV02 möglich? | A: Nein, mit aktivem Gast-Hypervisor nur Offline-Migration (herunterfahren, Move-VM) | P: 2
- F: Nennen Sie eine Maßnahme gegen die schlechte Leistung. | A: VHDX auf SSD/NVMe verlegen (Move-VMStorage), weniger innere VMs, mehr vCPU | P: 1

## Spickzettel
- Hypervisor in VM aktiv → RAM nur offline ändern
- Dynamic Memory: erlaubt, aber kein Schwanken
- Äußere VM: keine Live-Migration, kein Save State
- Prüfpunkt: herunterfahren oder Produktion
- Kein DDA/SR-IOV für L2
- VBS im Gast braucht Nested
