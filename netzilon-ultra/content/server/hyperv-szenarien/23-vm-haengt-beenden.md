---
id: server-hvsz-23
bereich: AZ-800
block: HV-S
kapitel: Hyper-V-Praxisszenarien
titel: Szenario 23 – VM hängt im Status „Wird beendet“
stufe: Profi
fach: Windows Server / AZ-800
pruefungen: [AZ-800, AP2, Schule]
quellen: [Microsoft Learn – Hyper-V]
verweise: [az800-integrationsdienste, az800-powershell-direct, server-hvsz-07]
---

## Profi

### Ticket
**Kunde meldet:** „Ich wollte APP03 nach einem Absturz neu starten. Seit 40 Minuten steht im Hyper-V-Manager ‚Wird beendet‘ (Stopping). Ausschalten ist ausgegraut bzw. bewirkt nichts.“
- Datum/Priorität: 08.10.2026, **Priorität 2 (hoch)** – Anwendung nicht verfügbar.
- Betroffene Maschine: VM **APP03** auf **HV01.example.com**.

### Ausgangslage
- Host **HV01.example.com**, Server 2025, weitere 12 produktive VMs laufen.
- APP03: Gen 2, Server 2019, IP 192.168.10.33; eine Sicherungssoftware lief zum Zeitpunkt des Herunterfahrens.
- `Stop-VM -Name APP03 -TurnOff -Force` kehrt nicht zurück bzw. meldet einen Fehler.

### Analyse
Jede laufende VM hat auf dem Host einen eigenen **Arbeitsprozess** **vmwp.exe** (*Virtual Machine Worker Process*). Der Prozess läuft unter einem virtuellen Konto, dessen **Name die VM-ID (GUID)** ist. Hängt dieser Prozess (z. B. wegen eines hängenden Speicher-/Sicherungsvorgangs oder Treibers), bleibt die VM in einem Übergangszustand.

| Hypothese | Prüfung |
|---|---|
| Gast fährt nur langsam herunter (Updates) | Konsole öffnen, ein paar Minuten warten |
| Sicherung/VSS hält die VM fest | Sicherungssoftware, Ereignisprotokoll *Hyper-V-VMMS* |
| Speicherpfad nicht erreichbar (SMB/SAN) | `Test-Path` auf VM-Pfad, Ereignisprotokoll |
| Arbeitsprozess hängt | vmwp.exe mit passender GUID ermitteln |

**Wichtig:** Den Dienst **VMMS** (Hyper-V-Verwaltungsdienst) neu zu starten beendet **keine** VMs, hilft aber selten bei einem hängenden Arbeitsprozess. Den **Host neu zu starten** würde alle 12 anderen VMs treffen.

### Lösungsweg
1. **Normale Wege ausschöpfen**: `Stop-VM -TurnOff -Force`, kurz warten – Begründung: am wenigsten invasiv.
2. **VM-ID ermitteln**: `(Get-VM APP03).Id` – Begründung: Name ist nicht eindeutig, die GUID schon.
3. **Passenden vmwp.exe finden**: im Task-Manager → Details → Spalte **Benutzername** = GUID, oder per CIM/`CommandLine` – Begründung: Nur dieser eine Prozess gehört zu APP03.
4. **Prozess beenden** (`Stop-Process -Force`) – Begründung: entspricht **Stecker ziehen** für genau diese VM; die anderen VMs bleiben unberührt. Nicht gespeicherte Daten im Gast gehen verloren.
5. **VM starten**, Gast auf Dateisystem-/Anwendungskonsistenz prüfen, Ursache (Sicherung, Speicher) klären.

### Ergebnis prüfen
- APP03 zeigt *Aus*, danach *Wird ausgeführt*.
- Andere VMs liefen ohne Unterbrechung weiter.
- Ereignisprotokolle *Microsoft-Windows-Hyper-V-Worker-Admin* und *-VMMS-Admin* auf die Ursache auswerten.

### Vorbeugung
- Sicherungen über unterstützte Hyper-V-Schnittstellen (Produktions-/VSS-Sicherung) und mit aktueller Software.
- Integrationsdienste/Gast-OS aktuell halten.
- Speicherpfade (SMB/iSCSI) überwachen.
- Notfall-Runbook „vmwp beenden“ dokumentieren – nur für die betroffene VM.

## Einfach

Jede VM hat auf dem Host einen eigenen **Hausmeister** (vmwp.exe), der nur für **diese eine** VM zuständig ist. Auf seinem Namensschild steht kein Name, sondern eine lange **Ausweisnummer** (die VM-GUID).

Bei APP03 ist der Hausmeister **eingeschlafen**, während er die Tür abschließen sollte. Die VM hängt jetzt ewig bei „Wird beendet“. Der Chef (Hyper-V-Manager) ruft „Ausschalten!“, aber der Hausmeister reagiert nicht.

Man könnte das **ganze Gebäude** schließen (Host neu starten) – aber dann wären auch die 12 anderen VMs weg. Besser: In der Liste aller Hausmeister den mit der **richtigen Ausweisnummer** suchen und **nur ihn** nach Hause schicken (Prozess beenden). Das ist wie beim Computer den **Stecker ziehen**, aber nur bei APP03.

Danach startet man APP03 neu und schaut nach, was den Hausmeister müde gemacht hat (z. B. eine hängende Sicherung).

## Merksatz
- Jede laufende VM = ein **vmwp.exe**, Benutzername = **VM-GUID**.
- Hängende VM: **(Get-VM).Id** → passenden vmwp.exe beenden.
- Nur **diese** VM ist betroffen – nicht den Host neu starten.
- Prozess beenden = **Stecker ziehen**.

## Prüfungsfalle
- **vmms.exe** ist der Verwaltungsdienst für alle VMs – **nicht** vmms beenden, sondern den passenden **vmwp.exe**.
- Den falschen vmwp.exe zu beenden schaltet eine **andere** VM hart aus.
- Vorher mildere Wege versuchen (`Stop-VM -TurnOff -Force`).
- Ein Neustart des VMMS-Dienstes stoppt keine VMs.

## Grafik
### Den richtigen Hausmeister finden
1. Admin -> HV01: Stop-VM APP03 TurnOff – keine Reaktion
2. HV01: APP03 hängt bei Wird beendet
3. Admin -> HV01: VM-ID von APP03 ermitteln
4. HV01: vmwp.exe mit Benutzername gleich VM-ID gefunden
5. Admin -> HV01: Nur diesen vmwp.exe beenden
6. HV01: APP03 aus, andere VMs laufen weiter
7. Admin -> APP03: Neu starten und Ursache prüfen

## Lab
**Maschinen**: Host **HV01.example.com**, Test-VM **APP03** (nur Test-VM verwenden!), weitere VM **APP04** zum Gegencheck.
Nachstellen: Ein echtes „Hängen“ lässt sich schlecht erzeugen – wir simulieren die Lage, indem wir die laufende VM wie eine hängende behandeln.

### GUI
1. **HV01**: Hyper-V-Manager → APP03 und APP04 **starten** (Ausgangslage).
2. **HV01**: PowerShell → `(Get-VM APP03).Id` → GUID notieren (der Hyper-V-Manager zeigt die VM-ID nicht an).
3. **HV01**: **Task-Manager** → **Details** → Rechtsklick auf Spaltenkopf → **Spalten auswählen** → **Befehlszeile** aktivieren.
4. **HV01**: Task-Manager → Details → nach **vmwp.exe** sortieren → Zeile, deren **Benutzername** der notierten GUID entspricht.
5. **HV01**: Rechtsklick auf diesen vmwp.exe → **Task beenden** → bestätigen (simuliert die Notfallmaßnahme).
6. **HV01**: Hyper-V-Manager → APP03 *Aus*, **APP04** *Wird ausgeführt* (nicht betroffen).
7. **HV01**: APP03 → **Starten** → Gast prüfen (unerwartetes Herunterfahren wird im Gast protokolliert).

### PowerShell
1. **HV01**: Milde Wege versuchen.
2. **HV01**: vmwp.exe per GUID ermitteln.
3. **HV01**: gezielt beenden und neu starten.

```powershell
# Auf HV01 – milde Wege
Get-VM -Name APP03 | Select-Object Name, State, Status
Stop-VM -Name APP03 -TurnOff -Force

# Auf HV01 – VM-ID und Arbeitsprozess ermitteln
$id = (Get-VM -Name APP03).Id.Guid
$proc = Get-CimInstance Win32_Process -Filter "Name='vmwp.exe'" | Where-Object { $_.CommandLine -match $id }
$proc | Select-Object ProcessId, CommandLine

# Gegencheck über den Prozessbesitzer (Benutzername = VM-GUID)
$proc | ForEach-Object { (Invoke-CimMethod -InputObject $_ -MethodName GetOwner).User }

# Auf HV01 – nur diesen Prozess beenden
Stop-Process -Id $proc.ProcessId -Force
Get-VM -Name APP03, APP04 | Select-Object Name, State
Start-VM -Name APP03

# Ursachen-Analyse
Get-WinEvent -LogName "Microsoft-Windows-Hyper-V-Worker-Admin" -MaxEvents 20 | Select-Object TimeCreated, Id, Message
```

## Szenario
### Kontrollfragen
APP03 hängt seit 40 Minuten im Status „Wird beendet“; Stop-VM -TurnOff -Force bewirkt nichts. Auf HV01 laufen 12 weitere VMs.
- F: Welcher Prozess gehört zu einer laufenden VM? | A: Ein eigener Arbeitsprozess vmwp.exe pro VM.
- F: Wie erkennt man den richtigen vmwp.exe? | A: Der Benutzername bzw. die Befehlszeile enthält die VM-GUID; diese liefert (Get-VM APP03).Id.
- F: Welche Folge hat das Beenden des Prozesses? | A: APP03 wird hart ausgeschaltet wie beim Stecker ziehen; andere VMs bleiben unberührt.
- F: Warum nicht den Host neu starten? | A: Alle anderen VMs wären betroffen.
- F: Welchen Prozess darf man nicht verwechseln? | A: vmms.exe, den Hyper-V-Verwaltungsdienst für alle VMs.

## Reihenfolge
### Hängende VM gezielt beenden
1. Stop-VM -TurnOff -Force versuchen
2. VM-ID mit Get-VM ermitteln
3. vmwp.exe mit passender GUID finden
4. Nur diesen Prozess beenden
5. Zustand aller VMs prüfen
6. VM neu starten
7. Ursache in den Ereignisprotokollen klären

## Legende
### vmwp.exe (VM-Arbeitsprozess)
- Was: Prozess auf dem Host, der eine einzelne laufende VM verwaltet (Geräteemulation, Zustand).
- Wie: per Task-Manager (Details, Benutzername = VM-GUID) oder `Get-CimInstance Win32_Process` finden und mit `Stop-Process` beenden.
- Wann: nur als letzte Maßnahme, wenn eine VM in einem Übergangszustand hängt und normale Befehle versagen.
- Wo: auf dem Hyper-V-Host HV01.
- Warum: beendet gezielt nur die betroffene VM, statt den ganzen Host neu zu starten.

## Karteikarten
- F: Welcher Prozess gehört zu genau einer laufenden VM? | A: vmwp.exe (Virtual Machine Worker Process).
- F: Woran erkennt man den richtigen vmwp.exe im Task-Manager? | A: Benutzername = VM-GUID.
- F: Wie ermittelt man die VM-GUID? | A: (Get-VM -Name APP03).Id
- F: Was bewirkt das Beenden von vmwp.exe? | A: Hartes Ausschalten der zugehörigen VM (wie Stecker ziehen).
- F: Was ist vmms.exe? | A: Der Hyper-V-Verwaltungsdienst für alle VMs.
- F: Beendet ein Neustart des VMMS-Dienstes laufende VMs? | A: Nein.
- F: Welcher milde Schritt kommt zuerst? | A: Stop-VM -Name APP03 -TurnOff -Force
- F: Welches Ereignisprotokoll hilft bei der Ursachenanalyse? | A: Microsoft-Windows-Hyper-V-Worker-Admin (und VMMS-Admin).
- F: Welches Risiko besteht beim falschen Prozess? | A: Eine andere VM wird hart ausgeschaltet.

## Quiz
? Welcher Prozess wird beendet, um eine hängende VM gezielt auszuschalten?
* Der vmwp.exe mit der VM-GUID
- vmms.exe
- svchost.exe des Hyper-V-Hosts
- explorer.exe
! vmms.exe betrifft die Verwaltung aller VMs.

? Wie findet man die GUID der VM?
* (Get-VM -Name APP03).Id
- Get-VMNetworkAdapter APP03
- hostname in der VM
- Get-VMHost
! Die VM-ID ist eindeutig.

? Woran erkennt man den passenden vmwp.exe im Task-Manager?
* Benutzername entspricht der VM-GUID
- Höchste CPU-Last
- Prozessname enthält den VM-Namen
- Niedrigste PID
! Jeder Arbeitsprozess läuft unter einem virtuellen Konto mit der VM-ID.

? Was ist die Folge des Beendens von vmwp.exe?
* Die VM wird hart ausgeschaltet
- Die VM wird gespeichert
- Ein Prüfpunkt wird erstellt
- Alle VMs werden neu gestartet
! Ungespeicherte Daten im Gast gehen verloren.

? Was sollte vor dem Beenden des Prozesses versucht werden?
* Stop-VM -TurnOff -Force
- Host neu starten
- Hyper-V-Rolle deinstallieren
- VHDX löschen
! Erst den mildesten Weg wählen.

? Warum ist ein Host-Neustart keine gute Idee?
* Alle anderen VMs wären ebenfalls betroffen
- Er dauert zu kurz, um APP03 zu beenden
- Er löscht die Konfigurationsdateien von APP03
- Er weist allen VMs neue MAC-Adressen zu
! Gezieltes Beenden betrifft nur APP03.

? Was passiert beim Neustart des VMMS-Dienstes mit laufenden VMs?
* Sie laufen weiter
- Sie werden hart ausgeschaltet
- Sie werden gespeichert
- Sie werden migriert
! Die VMs laufen in ihren eigenen Arbeitsprozessen weiter.

? Welches Protokoll liefert Hinweise auf Probleme des Arbeitsprozesses?
* Microsoft-Windows-Hyper-V-Worker-Admin
- Microsoft-Windows-Hyper-V-VmSwitch-Operational
- Microsoft-Windows-Hyper-V-Hypervisor-Admin
- Microsoft-Windows-Hyper-V-VMMS-Networking
! Worker-Admin protokolliert Ereignisse der VM-Arbeitsprozesse (vmwp.exe).
