---
id: az800-pruefpunkte
bereich: AZ-800
block: A7
kapitel: VMs & Container
titel: Prüfpunkte (Checkpoints) – Standard vs. Produktion
stufe: Fortgeschritten
quellen: [AZ-800 Study Guide, Microsoft Learn]
verweise: [az800-integrationsdienste, az800-vhdx, ap1-a2-backup, az800-adds-dc]
---

## Profi

### Was ist ein Prüfpunkt?
Ein **Prüfpunkt** (früher „Snapshot“) hält den Zustand einer VM zu einem Zeitpunkt fest, damit man später dorthin **zurückkehren** kann (**Anwenden**, früher „Zurücksetzen“). Technisch: Die aktuelle virtuelle Festplatte wird **eingefroren**, alle weiteren Änderungen gehen in eine **Differenzdatei (.avhdx)**. Zusätzlich werden die **VM-Konfiguration** und – je nach Typ – der **Arbeitsspeicherzustand** gespeichert.

### Standard- vs. Produktionsprüfpunkte
| | **Standardprüfpunkt** | **Produktionsprüfpunkt** (Standard ab Server 2016) |
|---|---|---|
| Methode | Momentaufnahme von Festplatte **und Arbeitsspeicher** (inkl. laufender Programme) | **VSS** im Windows-Gast (bzw. Dateisystem-Freeze bei Linux) – wie eine Sicherung |
| Konsistenz | **absturzkonsistent/zustandsgenau** – laufende Anwendungen „mitten im Satz“ | **anwendungskonsistent** |
| Wiederherstellung | VM läuft **genau im gespeicherten Zustand** weiter | VM startet **ausgeschaltet** und bootet neu (wie nach Wiederherstellung eines Backups) |
| Geeignet für | Tests, Labs, Softwareentwicklung, Fehlersuche | **produktive** Server, inkl. **Domänencontroller**, Datenbanken |
| Voraussetzung | – | Integrationsdienst **Sicherung (Volumeschattenkopie)** im Gast |
**Einstellungen** (VM → Prüfpunkte): Prüfpunkte aktivieren/deaktivieren, Typ **Produktion** (Option „Standardprüfpunkt erstellen, wenn Produktionsprüfpunkt nicht möglich“) oder **Standard**, **Speicherort** der Prüfpunktdateien, **automatische Prüfpunkte** (Client-Hyper-V: beim Start automatisch).

### Dateien
- `.avhdx` – Differenzierungsdatenträger pro Festplatte (Kette zum Eltern-VHDX).
- `.vmrs`/`.vmgs`/`.vmcx` – Laufzeitzustand, Gastzustand, Konfiguration.
- **Prüfpunktbaum**: Mehrere Prüfpunkte bilden einen Baum; „**Jetzt**“ markiert den aktuellen Zustand.

### Operationen
| Operation | Wirkung |
|---|---|
| **Prüfpunkt erstellen** | neuer Knoten, neue .avhdx |
| **Anwenden** | VM auf diesen Zustand zurücksetzen (optional vorher neuen Prüfpunkt des aktuellen Zustands) |
| **Zurücksetzen** (Revert) | auf den **letzten** Prüfpunkt zurück |
| **Löschen** eines Prüfpunkts | Änderungen werden **zusammengeführt (Merge)** – die Daten gehen **nicht** verloren, nur der Rücksprungpunkt; Merge läuft im Hintergrund (auch online) |
| **Prüfpunkt-Unterstruktur löschen** | alle Kind-Prüfpunkte |
| **Exportieren** | Prüfpunkt als eigenständige VM exportieren |

### Wichtige Regeln
- **Prüfpunkte sind KEIN Backup**: gleiche Festplatte/gleicher Speicher, Kette abhängig vom Eltern-VHDX – geht das kaputt, sind alle Prüfpunkte weg.
- **Leistung**: lange Ketten = mehr Lese-IO und Platz → Prüfpunkte **kurzlebig** halten (vor Update erstellen, nach erfolgreichem Test löschen).
- **Keine .avhdx manuell löschen** oder die Kette verändern – immer über Hyper-V-Manager/PowerShell (sonst Datenverlust). Bei verwaisten Dateien: „Datenträger bearbeiten → Zusammenführen“ bzw. `Merge-VHD`.
- **Domänencontroller**: Standardprüfpunkt anwenden → Gefahr **USN-Rollback** (Schutz durch VM-Generation-ID ab 2012, trotzdem **Produktionsprüfpunkte** bzw. richtige Systemstatus-Backups nutzen).
- **Anwendungen mit eigener Replikation** (Exchange DAG, SQL AG, AD) nicht per Standardprüfpunkt zurücksetzen.
- VMs mit **DDA**/Pass-through-Disks oder Shared VHDX (alte Variante) unterstützen keine bzw. eingeschränkte Prüfpunkte; **VHD Set** (.vhds) unterstützt Prüfpunkte/Backup von gemeinsamen Datenträgern.
- Freier Speicherplatz auf dem Volume überwachen – volle Platte → VM wird **angehalten** (Paused-Critical).

## Lab
**Maschinen**: Hyper-V-**Host**, VM **SRV01** (Windows Server), VM **CL01**.

### GUI
1. **SRV01** → Einstellungen → **Prüfpunkte** → **Produktionsprüfpunkte** (Haken „Standard, wenn nicht möglich“) → Speicherort `D:\Hyper-V\Checkpoints`.
2. **SRV01** läuft → Rechtsklick → **Prüfpunkt** → Name „Vor Update“ (Umbenennen).
3. In SRV01 Rolle „Webserver (IIS)“ installieren.
4. **Host**: Prüfpunkt „Vor Update“ → **Anwenden** → „Prüfpunkt erstellen und anwenden“ → SRV01 ist **ausgeschaltet** → starten → IIS ist **nicht** installiert.
5. **CL01** → Prüfpunkte: **Standard** → Editor mit ungespeichertem Text geöffnet lassen → Prüfpunkt → Text ändern → Prüfpunkt anwenden → CL01 läuft weiter, **alter Text im Editor** sichtbar (RAM-Zustand).
6. Prüfpunkt **löschen** → im Hyper-V-Manager Status „Zusammenführen…“ → Ordner mit .avhdx wird kleiner/verschwindet.

### PowerShell
```powershell
# Auf dem Host
Set-VM -Name SRV01 -CheckpointType Production -SnapshotFileLocation D:\Hyper-V\Checkpoints
Checkpoint-VM -Name SRV01 -SnapshotName "Vor Update"
Get-VMCheckpoint -VMName SRV01 | Format-Table Name, CheckpointType, CreationTime
Restore-VMCheckpoint -VMName SRV01 -Name "Vor Update" -Confirm:$false
Remove-VMCheckpoint -VMName SRV01 -Name "Vor Update"         # Merge im Hintergrund

Set-VM -Name CL01 -CheckpointType Standard
Set-VM -Name CL01 -CheckpointType ProductionOnly               # ohne Rückfall auf Standard
Set-VM -Name TEST01 -CheckpointType Disabled

# Kette/Dateien prüfen
Get-VMHardDiskDrive -VMName SRV01 | Select-Object Path
Get-VHD -Path "D:\Hyper-V\SRV01\SRV01_*.avhdx" | Select-Object Path, ParentPath
```

## Einfach

Ein **Prüfpunkt** ist wie ein **Spielstand speichern** in einem Videospiel, bevor du den Endgegner angreifst. Geht etwas schief (z. B. ein Update macht den Server kaputt), lädst du einfach den Spielstand.

**Zwei Arten**:
- **Standardprüfpunkt** = ein **Foto mitten im Spiel**: Alles, auch was gerade im Arbeitsspeicher passiert (offene Programme, halb getippter Text), wird eingefroren. Beim Laden geht es **genau an dieser Stelle** weiter. Super für Tests – aber gefährlich für Server, die gerade mit anderen reden (z. B. Domänencontroller), weil die dann „in der Zeit zurückspringen“ und die anderen verwirren.
- **Produktionsprüfpunkt** = ein **sauberer Spielstand beim Speicherpunkt**: Windows räumt vorher ordentlich auf (VSS), wie bei einem Backup. Beim Laden **startet** der Server neu. Sicher für echte Server – das ist der Standard.

**Merke**: Ein Prüfpunkt ist **kein Backup**! Er liegt auf **derselben Festplatte**. Brennt die ab, sind Spielstand und Spiel weg. Außerdem machen viele alte Spielstände die VM **langsamer** – also Prüfpunkt vor dem Update machen, testen, und dann **wieder löschen**. Beim Löschen gehen die Daten nicht verloren – sie werden nur zusammengeführt.

## Merksatz
- **Produktion = VSS, anwendungskonsistent, startet neu** – Standard seit Server 2016.
- **Standard = Disk + RAM, läuft sofort weiter** – nur für Tests.
- Prüfpunkt löschen = **Merge**, keine Datenverluste.
- **Kein Backup**, **kurz** halten, **.avhdx nie manuell löschen**.
- DCs/Replikations-Apps: nur Produktionsprüfpunkte/echte Backups.

## Prüfungsfalle
- Nach Anwenden eines Produktionsprüfpunkts ist die VM ausgeschaltet.
- Löschen eines Prüfpunkts setzt die VM nicht zurück.
- Produktionsprüfpunkt braucht den VSS-Integrationsdienst im Gast.
- „ProductionOnly“ verhindert den Rückfall auf Standardprüfpunkte.
- Lange Prüfpunktketten verschlechtern die Leistung und füllen das Volume.

## Grafik
### Spielstände
Zeitstrahl mit Spielstand-Symbolen; Standard: Foto mit laufendem Bildschirm (RAM), Produktion: Foto mit „VSS“-Siegel und ausgeschalteter VM beim Laden.

### Differenzdatei-Kette
Eltern-VHDX unten, darauf gestapelte .avhdx-Scheiben; Prüfpunkt löschen → oberste Scheibe schmilzt (Merge) in die darunterliegende.

## Karteikarten
- F: Unterschied Standard- und Produktionsprüfpunkt? | A: Standard: Disk + RAM-Zustand, läuft weiter. Produktion: VSS-basiert, anwendungskonsistent, VM startet neu.
- F: Welcher Prüfpunkttyp ist ab Server 2016 Standard? | A: Produktionsprüfpunkt.
- F: Welche Dateiendung haben Prüfpunkt-Differenzdatenträger? | A: .avhdx
- F: Was passiert beim Löschen eines Prüfpunkts? | A: Die Differenzdatei wird zusammengeführt (Merge), der Rücksprungpunkt entfällt, keine Daten gehen verloren.
- F: Warum sind Prüfpunkte kein Backup? | A: Sie liegen auf demselben Speicher und hängen von der Eltern-VHDX ab.
- F: Welcher Integrationsdienst ist für Produktionsprüfpunkte nötig? | A: Sicherung (Volumeschattenkopie).
- F: Cmdlets für Prüfpunkt erstellen/anwenden/löschen? | A: Checkpoint-VM, Restore-VMCheckpoint, Remove-VMCheckpoint.
- F: Warum keine Standardprüfpunkte bei DCs? | A: Gefahr eines USN-Rollbacks/inkonsistenter Replikation.

## Quiz
? Vor einem Update soll ein produktiver SQL-Server gesichert zurückgesetzt werden können. Welcher Prüfpunkttyp?
* Produktionsprüfpunkt
- Standardprüfpunkt
- Gar kein Prüfpunkt möglich
- Smart Paging

? Was passiert, wenn man einen Prüfpunkt löscht?
* Die Änderungen werden in die übergeordnete Festplatte zusammengeführt
- Die VM wird auf diesen Stand zurückgesetzt
- Alle Daten seit dem Prüfpunkt gehen verloren
- Die VM wird gelöscht

? Nach dem Anwenden eines Produktionsprüfpunkts ist die VM…
* ausgeschaltet und muss neu gestartet werden
- im gespeicherten Laufzustand mit offenen Programmen
- gelöscht
- angehalten mit RAM-Zustand

? Welche Aussage ist richtig?
* Prüfpunkte ersetzen kein Backup
- Prüfpunkte sind die beste Langzeitsicherung
- Prüfpunkte liegen immer auf einem anderen Server
- Prüfpunkte beschleunigen die VM

? Mit welchem Cmdlet wird ein Prüfpunkt erstellt?
* Checkpoint-VM
- New-VMSnapshot
- Save-VM
- Export-VM
