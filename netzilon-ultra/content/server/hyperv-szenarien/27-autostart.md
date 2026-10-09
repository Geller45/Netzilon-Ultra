---
id: server-hvsz-27
bereich: AZ-800
block: HV-S
kapitel: Hyper-V-Praxisszenarien
titel: Szenario 27 – VMs starten nach Host-Neustart nicht automatisch
stufe: Einsteiger
fach: Windows Server / AZ-800
pruefungen: [AZ-800, AP2, Schule]
quellen: [Microsoft Learn – Hyper-V]
verweise: [az800-integrationsdienste, az800-vm-ram, az801-failover-cluster, server-hvsz-26]
---

## Profi

### Ticket
**Kunde meldet:** „Nach dem Patchday heute Nacht war das Warenwirtschaftssystem bis 8:30 Uhr nicht erreichbar. Erst als der Kollege die VMs von Hand gestartet hat, ging es wieder.“
- **Priorität:** mittel (Problem behoben, darf aber nicht wieder passieren)
- **Betroffene Maschinen:** **APP01** (Warenwirtschaft), **SQL01** (Datenbank) auf **HV01**

### Ausgangslage
- Host **HV01.example.com**, Windows Server 2025, 64 GB RAM, eigenständiger Host (kein Cluster)
- VMs: **DC01** (192.168.10.10), **SQL01** (192.168.10.21), **APP01** (192.168.10.22)
- SQL01 und APP01 wurden von einem Praktikanten neu angelegt; DC01 startet korrekt.
- Nach dem Neustart (Windows Update) liefen DC01, aber **nicht** SQL01 und APP01.

### Analyse
- Jede VM hat eine **automatische Startaktion** (Automatic Start Action) mit drei Werten:
  - **Keine Aktion** (`Nothing`)
  - **Automatisch starten, wenn der Dienst beim Beenden ausgeführt wurde** (`StartIfRunning`, Standard)
  - **Diesen virtuellen Computer immer automatisch starten** (`Start`)
- Dazu die **automatische Startverzögerung** (AutomaticStartDelay, Sekunden) und die **automatische Stoppaktion** (Automatic Stop Action): **Status speichern** (`Save`, Standard), **Ausschalten** (`TurnOff`), **Gastbetriebssystem herunterfahren** (`ShutDown`).
- `Get-VM | Select Name, AutomaticStartAction, AutomaticStartDelay, AutomaticStopAction` zeigt: SQL01 und APP01 stehen auf **Nothing**.
- Zusätzlich problematisch: APP01 bräuchte SQL01 bereits laufend; ohne Verzögerung starten alle gleichzeitig (Boot-Sturm, Abhängigkeiten).

### Lösungsweg
1. **Startaktion setzen:** DC01 und SQL01 auf `Start`, APP01 auf `Start`. *Begründung:* Produktions-VMs sollen nach jedem Host-Neustart laufen, egal ob sie vorher liefen.
2. **Startverzögerung staffeln:** DC01 0 s, SQL01 60 s, APP01 180 s. *Begründung:* Erst Anmeldung/DNS, dann Datenbank, dann Anwendung – und keine gleichzeitige Last auf Speicher/CPU.
3. **Stoppaktion bewusst wählen:** SQL01 und APP01 auf `ShutDown`. *Begründung:* Sauberes Herunterfahren über den Integrationsdienst; `Save` reserviert zudem Speicherplatz in Größe des RAMs für die Zustandsdatei.
4. **Integrationsdienst „Herunterfahren des Betriebssystems“** prüfen. *Begründung:* Ohne ihn kann `ShutDown` den Gast nicht sauber herunterfahren.
5. Die **Stoppaktion** lässt sich nur bei **ausgeschalteter VM** ändern. *Begründung:* Die Änderungen daher gebündelt im Wartungsfenster bei ausgeschalteter VM vornehmen.

### Ergebnis prüfen
- `Get-VM | Format-Table Name, AutomaticStartAction, AutomaticStartDelay, AutomaticStopAction`
- Test-Neustart von HV01 im Wartungsfenster: nach dem Neustart `Get-VM` → alle **Running**, Startzeit (Uptime) zeigt die Staffelung.
- Anwendung APP01 im Browser bzw. Client erreichbar.

### Vorbeugung
- Bereitstellungs-Checkliste/Skript für neue VMs mit festen Start-/Stoppaktionen.
- In einem **Failover-Cluster** übernimmt der **Cluster** das Starten; dort steht die automatische Startaktion der VM auf „Keine Aktion“ und Prioritäten/Startreihenfolge werden über die Cluster-Rolle gesteuert.
- Regelmäßiger Bericht: VMs mit `AutomaticStartAction -eq 'Nothing'` ausgeben.

## Einfach
Stell dir vor, du hast zu Hause mehrere Lampen mit Zeitschaltuhr. Nach einem Stromausfall gehen manche Lampen von allein wieder an – andere bleiben aus, weil jemand bei ihnen „nie einschalten“ eingestellt hat.

Genau so ist es bei Hyper-V. Jede VM hat einen kleinen Zettel: **„Was soll ich tun, wenn der Host neu startet?“**
- „Nichts tun“ – dann bleibt sie aus.
- „Nur starten, wenn ich vorher schon lief“ – das ist die Standardeinstellung.
- „Immer starten“ – die sicherste Wahl für wichtige Server.

Außerdem gibt es eine **Wartezeit**. Das ist wie beim Frühstück: Erst muss der Toaster das Brot fertig haben (Datenbank), dann kann man es belegen (Anwendung). Würde alles gleichzeitig starten, wäre die Küche überfüllt.

Und es gibt einen Zettel für das **Ausschalten**: Soll die VM sauber „Gute Nacht“ sagen (herunterfahren), einfach eingefroren werden (speichern) oder hart ausgeschaltet werden?

Beim Ticket hatte der Praktikant bei zwei VMs „Nichts tun“ eingestellt. Deshalb blieben sie nach dem Neustart aus.

## Merksatz
- Start: **Nothing – StartIfRunning – Start**. Standard = StartIfRunning.
- Stopp: **Save – TurnOff – ShutDown**. Standard = Save.
- **Verzögerung** staffeln: DC → Datenbank → Anwendung.
- Im **Cluster** startet der Cluster, nicht die Startaktion.

## Prüfungsfalle
- `StartIfRunning` startet eine VM **nicht**, wenn sie vor dem Neustart ausgeschaltet war – ist also kein „immer starten“.
- `Save` als Stoppaktion belegt auf dem Datenträger zusätzlich Platz in Größe des zugewiesenen RAMs (Zustandsdatei).
- `ShutDown` funktioniert nur mit aktivem Integrationsdienst **Herunterfahren des Betriebssystems**.
- Die Verzögerung wird in **Sekunden** angegeben, nicht in Minuten.

## Grafik
### Host-Neustart mit gestaffeltem Start
1. HV01: Neustart nach Windows Update
2. HV01 -> DC01: Startaktion Start, Verzögerung 0 s
3. HV01 -> SQL01: Startaktion Start, Verzögerung 60 s
4. HV01 -> APP01: Startaktion Start, Verzögerung 180 s
5. APP01 -> SQL01: Anwendung verbindet sich mit Datenbank
6. Client -> APP01: Warenwirtschaft erreichbar

## Lab
**Nachstellen:** Startaktion falsch setzen, Host neu starten, korrigieren. Maschinen: **HV01**, VMs **SQL01**, **APP01** (kleine Test-VMs genügen).

### GUI
1. **HV01**: Hyper-V-Manager → SQL01 → Herunterfahren → Einstellungen → Verwaltung → **Automatische Startaktion** → „Keine Aktion“ (Fehler erzeugen) → OK.
2. **HV01**: Host neu starten → Hyper-V-Manager: SQL01 bleibt „Aus“.
3. **HV01**: SQL01 → Einstellungen → **Automatische Startaktion** → „Diesen virtuellen Computer immer automatisch starten“ → **Startverzögerung** 60 Sekunden.
4. **HV01**: SQL01 → Einstellungen → **Automatische Stoppaktion** → „Gastbetriebssystem herunterfahren“.
5. **HV01**: SQL01 → Einstellungen → Integrationsdienste → „Herunterfahren des Betriebssystems“ angehakt.
6. **HV01**: APP01 genauso, Verzögerung 180 Sekunden → Host neu starten → beide VMs laufen.

### PowerShell
```powershell
# Auf HV01 – Fehler erzeugen
Stop-VM -Name SQL01, APP01
Set-VM -Name SQL01, APP01 -AutomaticStartAction Nothing

# Auf HV01 – Übersicht
Get-VM | Format-Table Name, State, AutomaticStartAction, AutomaticStartDelay, AutomaticStopAction

# Auf HV01 – Korrektur mit Staffelung
Set-VM -Name DC01  -AutomaticStartAction Start -AutomaticStartDelay 0
Set-VM -Name SQL01 -AutomaticStartAction Start -AutomaticStartDelay 60  -AutomaticStopAction ShutDown
Set-VM -Name APP01 -AutomaticStartAction Start -AutomaticStartDelay 180 -AutomaticStopAction ShutDown

# Auf HV01 – Integrationsdienst Herunterfahren prüfen
Get-VMIntegrationService -VMName SQL01, APP01 | Where-Object Name -match "Herunterfahren|Shutdown"

# Auf HV01 – Bericht: VMs ohne Autostart
Get-VM | Where-Object AutomaticStartAction -eq 'Nothing' | Select-Object Name
```

## Reihenfolge
### Autostart korrekt einrichten
1. Abhängigkeiten der VMs klären (DC, Datenbank, Anwendung)
2. VMs im Wartungsfenster herunterfahren
3. Automatische Startaktion auf Start setzen
4. Startverzögerung gestaffelt eintragen
5. Stoppaktion ShutDown wählen und Integrationsdienst prüfen
6. Host-Neustart testen und Status kontrollieren

## Szenario
### Kontrollfragen
Nach einem Host-Neustart von HV01 bleiben SQL01 und APP01 aus, DC01 läuft. Get-VM zeigt bei beiden AutomaticStartAction = Nothing.
- F: Welche Einstellung verursacht das Problem? | A: Automatische Startaktion „Keine Aktion“ (Nothing).
- F: Welche Startaktion ist der Standard bei neuen VMs? | A: StartIfRunning – automatisch starten, wenn die VM beim Beenden des Dienstes lief.
- F: Wie verhinderst du, dass APP01 vor SQL01 hochkommt? | A: Gestaffelte AutomaticStartDelay, z. B. SQL01 60 s, APP01 180 s.
- F: Was ist Voraussetzung für die Stoppaktion ShutDown? | A: Der Integrationsdienst „Herunterfahren des Betriebssystems“ muss aktiv sein.
- F: Wer startet VMs in einem Failover-Cluster? | A: Der Cluster-Dienst (Rollen-Priorität), nicht die VM-Startaktion.

## Legende
### Automatische Startaktion
- Was: VM-Einstellung, was nach dem Start des Hyper-V-Dienstes (Host-Neustart) passieren soll.
- Wie: Nothing, StartIfRunning (Standard) oder Start; dazu AutomaticStartDelay in Sekunden.
- Wann: Bei jeder neuen Produktions-VM festlegen.
- Wo: Hyper-V-Manager → VM-Einstellungen → Verwaltung, oder Set-VM.
- Warum: Dienste sollen nach Wartung ohne manuelles Eingreifen wieder laufen.
### Automatische Stoppaktion
- Was: Verhalten der VM beim Herunterfahren des Hosts.
- Wie: Save (Standard), TurnOff oder ShutDown.
- Warum: ShutDown ist für Datenbanken am saubersten, Save braucht Platz für den RAM-Inhalt.

## Karteikarten
- F: Welche drei automatischen Startaktionen gibt es? | A: Nothing (Keine Aktion), StartIfRunning, Start (immer starten).
- F: Was ist die Standard-Startaktion? | A: StartIfRunning.
- F: Welche drei Stoppaktionen gibt es? | A: Save (Status speichern), TurnOff (Ausschalten), ShutDown (Gast herunterfahren).
- F: Was ist die Standard-Stoppaktion? | A: Save.
- F: In welcher Einheit wird AutomaticStartDelay angegeben? | A: In Sekunden.
- F: Welcher Integrationsdienst wird für ShutDown benötigt? | A: Herunterfahren des Betriebssystems (Shutdown).
- F: Welchen Nachteil hat die Stoppaktion Save? | A: Sie reserviert Speicherplatz in Größe des VM-RAMs für die Zustandsdatei.
- F: Cmdlet für die Startaktion? | A: Set-VM -Name VM -AutomaticStartAction Start -AutomaticStartDelay 60
- F: Wo stellt man die Startaktion im GUI ein? | A: Hyper-V-Manager → VM → Einstellungen → Verwaltung → Automatische Startaktion.

## Quiz
? Eine VM soll nach jedem Host-Neustart laufen, auch wenn sie vorher aus war. Welche Startaktion?
* Start
- StartIfRunning
- Nothing
- Save
! StartIfRunning startet nur, wenn die VM beim Beenden lief.

? Welche Stoppaktion ist bei einer neuen VM voreingestellt?
* Save (Status speichern)
- ShutDown
- TurnOff
- Nothing
! Standard ist das Speichern des Zustands.

? Warum staffelt man AutomaticStartDelay?
* Damit abhängige Dienste in der richtigen Reihenfolge und ohne Lastspitze starten
- Damit Lizenzen gespart werden
- Weil Hyper-V nur eine VM gleichzeitig starten kann
- Damit Prüfpunkte schneller erstellt werden
! DC und Datenbank sollen vor der Anwendung bereit sein.

? Die Stoppaktion ShutDown funktioniert nicht. Was prüfst du zuerst?
* Den Integrationsdienst „Herunterfahren des Betriebssystems“
- Die Startverzögerung
- Den Integrationsdienst Gastdienste
- Die NUMA-Einstellungen
! ShutDown nutzt den Integrationsdienst, um den Gast sauber herunterzufahren.

? Welche Einheit hat der Parameter -AutomaticStartDelay?
* Sekunden
- Millisekunden
- Minuten
- Prozent
! Beispiel: 60 = eine Minute.

? Welche Folge hat die Stoppaktion Save für den Speicherplatz?
* Es wird Platz in Größe des zugewiesenen RAMs für die Zustandsdatei benötigt
- Die VHDX wird automatisch komprimiert
- Es wird kein zusätzlicher Platz benötigt
- Ein Prüfpunkt wird erstellt
! Der Arbeitsspeicherinhalt muss auf den Datenträger geschrieben werden können.

? Wer übernimmt in einem Failover-Cluster das Starten der VMs?
* Der Cluster-Dienst
- Die automatische Startaktion der VM
- Der Aufgabenplaner
- Der DHCP-Server
! Im Cluster steuert der Cluster die Rolle; die Startaktion steht dort auf Keine Aktion.

? Welcher Befehl listet Start- und Stoppaktionen aller VMs?
* Get-VM | Format-Table Name, AutomaticStartAction, AutomaticStartDelay, AutomaticStopAction
- Get-VMHost | Select AutoStart
- Get-VMIntegrationService -All
- Measure-VM -Start
! Die Eigenschaften stehen direkt am VM-Objekt.
