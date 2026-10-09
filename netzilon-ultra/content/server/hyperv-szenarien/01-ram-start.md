---
id: server-hvsz-01
bereich: AZ-800
block: HV-S
kapitel: Hyper-V-Praxisszenarien
titel: Szenario 01 – VM startet nicht: „Nicht genügend Arbeitsspeicher“
stufe: Einsteiger
fach: Windows Server / AZ-800
pruefungen: [AZ-800, AP2, Schule]
quellen: [Microsoft Learn – Hyper-V]
verweise: [az800-vm-ram, server-hvsz-10, server-hvsz-11]
---

## Profi

### Ticket
**Kunde meldet:** „Nach dem Patchday startet unser Buchhaltungsserver nicht mehr. Hyper-V sagt irgendwas von zu wenig Arbeitsspeicher.“
- Datum/Priorität: 05.10.2026, **Priorität 2 (hoch)** – Fachabteilung kann nicht buchen.
- Betroffene Maschine: VM **FIBU01** auf Host **HV01.example.com**.
- Fehlermeldung im Hyper-V-Manager: *„'FIBU01' konnte nicht gestartet werden. Es ist nicht genügend Arbeitsspeicher im System vorhanden, um den virtuellen Computer zu starten.“* (engl. *Not enough memory in the system to start the virtual machine*).

### Ausgangslage
- Host **HV01.example.com**, Windows Server 2025 Datacenter, 64 GB RAM, IP 192.168.10.21/24.
- VMs auf HV01: **DC01** (4 GB statisch), **FILE01** (dynamisch, Start 4 GB, Max 16 GB), **SQL01** (32 GB statisch), **FIBU01** (statisch **16 GB**), **TEST01** (8 GB statisch, „mal eben“ von einem Azubi angelegt).
- Nach dem Neustart des Hosts sind DC01, FILE01, SQL01 und TEST01 automatisch gestartet (Automatische Startaktion), FIBU01 startet als letzte und scheitert.

### Analyse
Hyper-V muss beim Einschalten einer VM den **Start-RAM** (*Startup RAM*) **sofort als physischen Speicher** auf dem Host reservieren. Bei statischem RAM ist das der volle Wert. Ist so viel **freier** Speicher nicht vorhanden, bricht der Start ab – Hyper-V lagert nichts auf die Festplatte aus.

| Hypothese | Prüfung |
|---|---|
| Summe der laufenden VMs + Host-Reserve lässt keine 16 GB mehr frei | `Get-VM \| Select Name, State, MemoryAssigned`; Task-Manager/`Get-Counter '\Memory\Available MBytes'` auf HV01 |
| Neue VM (TEST01) hat Speicher „weggenommen“ | Erstellungsdatum/Notizen prüfen, Startreihenfolge |
| Dynamische VM (FILE01) ist hochgewachsen | Spalte **Zugewiesener Speicher** im Hyper-V-Manager |
| NUMA-Spanning deaktiviert, ein NUMA-Knoten hat nicht genug frei | `Get-VMHost \| Select NumaSpanningEnabled`, `Get-VMHostNumaNode` |
| Start-RAM von FIBU01 versehentlich zu hoch gesetzt | `Get-VMMemory -VMName FIBU01` |

**Befund:** 4 + ca. 9 (FILE01 aktuell) + 32 + 8 = 53 GB vergeben, der Host selbst braucht ebenfalls einige GB (Verwaltungsbetriebssystem und Overhead pro VM). Für FIBU01 fehlen die 16 GB am Stück.

### Lösungsweg
1. **Nicht benötigte VM stoppen**: TEST01 herunterfahren – Begründung: Test-VMs haben keinen Vorrang vor Produktion.
2. **Start-RAM prüfen und ggf. senken**: FIBU01 braucht laut Hersteller 8 GB, war aber mit 16 GB konfiguriert – Begründung: Überdimensionierung blockiert den Host.
3. **Dynamischen Arbeitsspeicher (Dynamic Memory) erwägen**: Start 4 GB, Minimum 2 GB, Maximum 12 GB – Begründung: Der Start-RAM sinkt, die VM wächst bei Bedarf. Umschalten nur bei **ausgeschalteter** VM möglich.
4. **Maximum bei FILE01 begrenzen** (z. B. 8 GB) – Begründung: verhindert, dass eine dynamische VM den Host leer saugt. Das Maximum darf im laufenden Betrieb erhöht, aber nicht gesenkt werden.
5. **FIBU01 starten**, danach **Startreihenfolge** festlegen: Produktion zuerst, Tests mit Startverzögerung bzw. ohne Autostart.

### Ergebnis prüfen
- FIBU01 hat den Status **Wird ausgeführt**, Spalte **Speicherstatus** zeigt *OK*.
- `Get-VM | Format-Table Name, State, MemoryAssigned, MemoryDemand, MemoryStatus` zeigt alle Produktiv-VMs laufend.
- Auf HV01 bleiben mehrere GB frei (Reserve für Host und Neustarts).

### Vorbeugung
- **Kapazitätsplanung**: Summe Start-RAM aller Autostart-VMs + Host-Reserve < physischer RAM.
- **Automatische Startaktion** und **Startverzögerung** sinnvoll setzen, Test-VMs nicht automatisch starten.
- Dynamic Memory für allgemeine Server, **statisch** für SQL/Nested-Hosts.
- Hinweis: **Smart Paging** hilft nur beim **Neustart** einer VM mit Dynamic Memory, nicht beim Kaltstart aus „Aus“.

## Einfach

Stell dir den Hyper-V-Host wie eine **Turnhalle** vor. Jede VM ist eine Schulklasse, die beim Reinkommen eine **feste Anzahl Matten** (Arbeitsspeicher) bekommt. Die Klasse FIBU01 will **16 Matten auf einmal**. Doch die anderen Klassen liegen schon auf ihren Matten, und der Hausmeister (das Host-Betriebssystem) braucht auch ein paar für sich. Es sind nur noch 10 Matten frei – also darf FIBU01 nicht rein.

Hyper-V **leiht sich keine Matten aus dem Keller** (also von der Festplatte). Entweder gibt es genug freie Matten, oder die Klasse bleibt draußen.

Was kann man tun?
1. Eine Klasse, die nur **spielen** will (die Test-VM), nach Hause schicken.
2. FIBU01 fragen, ob sie wirklich 16 Matten braucht – oft reichen 8.
3. **Dynamische Matten** (Dynamic Memory): Die Klasse fängt mit wenigen Matten an und bekommt mehr, wenn sie mehr braucht.
4. Einer anderen Klasse eine **Obergrenze** geben, damit sie nicht alle Matten an sich reißt.

Danach passt FIBU01 wieder in die Halle. Und damit das nicht wieder passiert, schreibt man auf, **wer zuerst** in die Halle darf und wie viele Matten es insgesamt gibt.

## Merksatz
- Start-RAM muss beim Einschalten **komplett frei** auf dem Host sein.
- Hyper-V lagert VM-RAM nicht aus – Smart Paging nur beim **Neustart** mit Dynamic Memory.
- Summe Start-RAM + Host-Reserve < physischer RAM.
- Dynamic Memory ein/aus nur bei **ausgeschalteter** VM.

## Prüfungsfalle
- „Mehr Auslagerungsdatei auf dem Host“ löst das Problem **nicht**.
- Smart Paging greift **nicht** beim Kaltstart.
- Das **Maximum** einer dynamischen VM darf im Betrieb **erhöht**, aber nicht gesenkt werden; das **Minimum** darf im Betrieb **gesenkt**, aber nicht erhöht werden.
- Bei deaktiviertem **NUMA-Spanning** kann eine VM trotz insgesamt genug freiem RAM scheitern, weil ein einzelner NUMA-Knoten nicht reicht.

## Grafik
### Speicherreservierung beim Start
1. FIBU01 -> HV01: Bitte 16 GB Start-RAM reservieren
2. HV01: Prüft freien physischen RAM – nur 10 GB frei
3. HV01 -> FIBU01: Start abgelehnt – nicht genügend Arbeitsspeicher
4. Admin -> TEST01: Herunterfahren, 8 GB werden frei
5. Admin -> FIBU01: Start-RAM auf 8 GB gesenkt
6. FIBU01 -> HV01: Bitte 8 GB reservieren
7. HV01 -> FIBU01: Reserviert – VM startet

## Lab
**Maschinen**: Host **HV01.example.com** (Server 2025), VMs **FIBU01** und **TEST01** (Heimlabor: Host mit 16–32 GB RAM).
Nachstellen: Zuerst den Fehler bewusst erzeugen, dann beheben.

### GUI
1. **HV01**: Hyper-V-Manager → FIBU01 → Einstellungen → **Arbeitsspeicher** → RAM auf einen Wert **größer als der freie Host-RAM** setzen (z. B. 48 GB bei 32-GB-Host) → OK.
2. **HV01**: FIBU01 → **Starten** → Fehlermeldung „nicht genügend Arbeitsspeicher“ lesen und notieren.
3. **HV01**: Task-Manager → Leistung → Arbeitsspeicher → **Verfügbar** ablesen.
4. **HV01**: Hyper-V-Manager → Spalten **Zugewiesener Speicher** aller VMs addieren.
5. **HV01**: TEST01 → **Herunterfahren**.
6. **HV01**: FIBU01 → Einstellungen → Arbeitsspeicher → **Start-RAM 4096 MB**, Haken **Dynamischen Arbeitsspeicher aktivieren**, Minimum 2048 MB, Maximum 8192 MB → OK.
7. **HV01**: FIBU01 → **Starten** → Status *Wird ausgeführt*.
8. **HV01**: FIBU01 → Einstellungen → **Automatische Startaktion** → „Immer automatisch starten“, Startverzögerung 60 s; TEST01 → „Keine Aktion“.

### PowerShell
1. **HV01**: Fehler erzeugen (Block 1).
2. **HV01**: Ursache messen (Block 2).
3. **HV01**: Beheben und prüfen (Block 3).

```powershell
# Auf HV01 – Block 1: Fehler erzeugen
Set-VMMemory -VMName FIBU01 -DynamicMemoryEnabled $false -StartupBytes 48GB
Start-VM -Name FIBU01          # schlägt fehl: nicht genügend Arbeitsspeicher

# Auf HV01 – Block 2: Ursache messen
Get-VM | Format-Table Name, State, MemoryStartup, MemoryAssigned, MemoryDemand -AutoSize
Get-Counter '\Memory\Available MBytes'
Get-VMHost | Select-Object NumaSpanningEnabled

# Auf HV01 – Block 3: Beheben
Stop-VM -Name TEST01
Set-VMMemory -VMName FIBU01 -DynamicMemoryEnabled $true -StartupBytes 4GB -MinimumBytes 2GB -MaximumBytes 8GB
Start-VM -Name FIBU01
Set-VM -Name FIBU01 -AutomaticStartAction Start -AutomaticStartDelay 60
Set-VM -Name TEST01 -AutomaticStartAction Nothing
Get-VM -Name FIBU01 | Select-Object Name, State, MemoryAssigned, MemoryStatus
```

## Szenario
### Kontrollfragen
Ein Host mit 64 GB RAM betreibt vier laufende VMs mit zusammen 53 GB zugewiesenem Speicher. Die VM FIBU01 (16 GB statisch) startet nicht.
- F: Warum startet FIBU01 nicht, obwohl der Host 64 GB hat? | A: Der Start-RAM muss vollständig als freier physischer RAM verfügbar sein; nach Abzug der laufenden VMs und der Host-Reserve sind keine 16 GB mehr frei.
- F: Welche zwei Sofortmaßnahmen sind sinnvoll? | A: Nicht benötigte VM (TEST01) stoppen und den Start-RAM von FIBU01 auf den tatsächlichen Bedarf senken bzw. Dynamic Memory aktivieren.
- F: In welchem Zustand muss FIBU01 sein, um Dynamic Memory einzuschalten? | A: Ausgeschaltet.
- F: Hilft Smart Paging hier? | A: Nein, Smart Paging überbrückt nur RAM-Engpässe beim Neustart einer VM mit Dynamic Memory, nicht beim Kaltstart.
- F: Wie verhindert man das Problem dauerhaft? | A: Kapazitätsplanung, Maximum für dynamische VMs setzen, Startaktionen/Startverzögerung konfigurieren, Test-VMs nicht automatisch starten.

## Reihenfolge
### Fehlerbehebung „Nicht genügend Arbeitsspeicher“
1. Fehlermeldung und betroffene VM notieren
2. Freien Host-RAM und zugewiesenen Speicher aller VMs ermitteln
3. Nicht benötigte VMs herunterfahren
4. Start-RAM der betroffenen VM prüfen und anpassen
5. Betroffene VM starten
6. Startaktionen und Maximalwerte für die Zukunft festlegen

## Legende
### Start-RAM (Startup RAM)
- Was: Arbeitsspeichermenge, die Hyper-V beim Einschalten einer VM fest reserviert.
- Wie: Einstellungen → Arbeitsspeicher bzw. `Set-VMMemory -StartupBytes`.
- Wann: bei jedem Start der VM – muss dann frei auf dem Host verfügbar sein.
- Wo: Konfiguration der VM auf dem Hyper-V-Host (HV01).
- Warum: Ohne garantierten Start-RAM könnte das Gastbetriebssystem nicht booten; Hyper-V überbucht physischen RAM nicht.

## Karteikarten
- F: Was prüft Hyper-V beim Einschalten einer VM bezüglich RAM? | A: Ob der Start-RAM vollständig als freier physischer Speicher auf dem Host verfügbar ist.
- F: Wie lautet die typische Meldung? | A: „Es ist nicht genügend Arbeitsspeicher im System vorhanden, um den virtuellen Computer zu starten.“
- F: Welcher PowerShell-Befehl zeigt zugewiesenen Speicher aller VMs? | A: Get-VM \| Format-Table Name, State, MemoryAssigned, MemoryDemand
- F: Wann hilft Smart Paging? | A: Nur beim Neustart einer VM mit Dynamic Memory, wenn kurzzeitig zu wenig RAM für den Start-RAM vorhanden ist.
- F: In welchem Zustand muss eine VM sein, um Dynamic Memory zu aktivieren? | A: Ausgeschaltet.
- F: Welche Werte hat Dynamic Memory? | A: Start-RAM, Minimum, Maximum, Speicherpuffer, Speichergewichtung.
- F: Was kann trotz genug Gesamt-RAM den Start verhindern? | A: Deaktiviertes NUMA-Spanning, wenn ein einzelner NUMA-Knoten nicht genug Speicher hat.
- F: Wie verhindert man, dass Test-VMs nach Host-Neustart Speicher belegen? | A: Automatische Startaktion „Keine Aktion“ (Set-VM -AutomaticStartAction Nothing).
- F: Welcher Leistungsindikator zeigt freien RAM auf dem Host? | A: \Memory\Available MBytes

## Quiz
? Eine VM mit 16 GB statischem RAM startet nicht, auf dem Host sind 10 GB frei. Was ist die Ursache?
* Der Start-RAM muss beim Einschalten vollständig frei verfügbar sein
- Die VM-Konfigurationsversion ist zu alt
- Der virtuelle Switch ist nicht verbunden
- Die Integrationsdienste sind deaktiviert
! Hyper-V reserviert den Start-RAM komplett im physischen Speicher; ist er nicht frei, scheitert der Start.

? Wann hilft Smart Paging?
* Beim Neustart einer VM mit Dynamic Memory
- Beim ersten Kaltstart einer statischen VM
- Bei jeder Live-Migration
- Beim Erstellen eines Prüfpunkts
! Smart Paging nutzt nur beim Neustart kurzzeitig eine Datei auf dem Host als Brücke.

? Welches Cmdlet aktiviert Dynamic Memory mit 4 GB Start-RAM?
* Set-VMMemory -VMName FIBU01 -DynamicMemoryEnabled $true -StartupBytes 4GB
- Set-VM -Name FIBU01 -DynamicRAM 4GB
- Enable-VMMemory -VMName FIBU01 -Size 4GB
- Set-VMHost -DynamicMemory $true
! Speicherwerte einer VM werden mit Set-VMMemory gesetzt.

? In welchem VM-Zustand lässt sich Dynamic Memory aktivieren?
* Ausgeschaltet
- Wird ausgeführt
- Angehalten
- Gespeichert
! Das Umschalten zwischen statisch und dynamisch ist nur bei ausgeschalteter VM möglich.

? Welche Änderung ist an einer laufenden VM mit Dynamic Memory erlaubt?
* Maximum erhöhen
- Maximum senken
- Minimum erhöhen
- Dynamic Memory abschalten
! Im Betrieb darf das Maximum erhöht und das Minimum gesenkt werden.

? Was verhindert dauerhaft, dass Test-VMs nach einem Host-Neustart Speicher blockieren?
* Automatische Startaktion „Keine Aktion“
- Speicherpuffer auf 0 % setzen
- Smart-Paging-Pfad ändern
- Konfigurationsversion aktualisieren
! Mit Set-VM -AutomaticStartAction Nothing starten Test-VMs nicht automatisch.

? Welche Einstellung kann trotz genug Gesamt-RAM einen Start verhindern?
* Deaktiviertes NUMA-Spanning
- Aktivierter erweiterter Sitzungsmodus
- MAC-Adress-Spoofing
- Gastdienste aktiviert
! Ohne NUMA-Spanning muss der Speicher aus einem NUMA-Knoten kommen.

? Was zeigt die Spalte „Speicherbedarf“ (MemoryDemand)?
* Wie viel RAM das Gastbetriebssystem aktuell tatsächlich benötigt
- Den physischen RAM des Hosts
- Die Größe der VHDX-Datei
- Die maximale RAM-Grenze der VM
! MemoryDemand ist der aktuelle Bedarf; MemoryAssigned der zugewiesene Wert.

? Welche Maßnahme löst das Problem NICHT?
* Die Auslagerungsdatei des Hosts vergrößern
- Eine Test-VM stoppen
- Den Start-RAM der VM senken
- Dynamic Memory mit kleinerem Start-RAM aktivieren
! Hyper-V nutzt die Auslagerungsdatei des Hosts nicht für VM-Start-RAM.
