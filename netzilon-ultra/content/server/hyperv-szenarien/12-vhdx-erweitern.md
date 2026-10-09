---
id: server-hvsz-12
bereich: AZ-800
block: HV-S
kapitel: Hyper-V-Praxisszenarien
titel: Szenario 12 – VHDX voll: online erweitern
stufe: Einsteiger
fach: Windows Server / AZ-800
pruefungen: [AZ-800, AP2, Schule]
quellen: [Microsoft Learn – Hyper-V]
verweise: [az800-vhdx, az800-datentraeger, server-hvsz-07, server-hvsz-13]
---

## Profi

### Ticket
**Kunde meldet:** „Auf dem Dateiserver ist Laufwerk E: (Projekte) voll. Die Mitarbeiter können nichts mehr speichern. Bitte ohne Ausfallzeit vergrößern!“
- Datum/Priorität: 07.10.2026, **Priorität 2 (hoch)**.
- Betroffene Maschine: VM **FILE01** auf **HV01.example.com**, Datenträger `D:\VMs\FILE01\FILE01-Daten.vhdx`.

### Ausgangslage
- Host **HV01.example.com**, Server 2025, Volume D: mit 1,2 TB frei.
- FILE01: Gen 2, Server 2022, IP 192.168.10.20. Datenplatte **FILE01-Daten.vhdx**: dynamisch erweiterbar, 200 GB, am **SCSI-Controller**, im Gast als **E:** (NTFS) eingebunden.

### Analyse
Eine VHDX hat eine **maximale Größe** – ist die im Gast belegt, ist das Laufwerk voll, egal wie viel auf dem Host frei ist. Seit Server 2012 R2 lassen sich **VHDX-Dateien an einem SCSI-Controller online vergrößern** (und verkleinern bis zum nicht zugeordneten Bereich). Danach muss **im Gast** die **Partition** erweitert werden – das passiert nicht automatisch.

| Hypothese / Bedingung | Prüfung |
|---|---|
| Format VHDX (VHD kann nicht online erweitert werden) | `Get-VHD` → VhdFormat |
| Datenträger am **SCSI**-Controller (bei Gen 1 am IDE nur offline) | `Get-VMHardDiskDrive -VMName FILE01` → ControllerType |
| Datenträger hat **keine Prüfpunkte** (AVHDX-Kette) | `Get-VMCheckpoint`; mit Prüfpunkten kein Resize |
| Genug Platz auf dem Host-Volume | `Get-Volume D` |
| Im Gast liegt hinter E: eine weitere Partition, die das Erweitern blockiert | Datenträgerverwaltung im Gast |

**Befund:** VHDX am SCSI, keine Prüfpunkte, Host-Volume hat genug Platz – Online-Erweiterung möglich.

### Lösungsweg
1. **Aktuelle Sicherung prüfen** (keinen Prüfpunkt anlegen!) – Begründung: Größenänderungen sind unterstützt, eine aktuelle Sicherung ist trotzdem Standard; ein Prüfpunkt würde das Erweitern sogar verhindern.
2. **VHDX vergrößern** auf 400 GB (Hyper-V-Manager → Datenträger bearbeiten → Erweitern bzw. `Resize-VHD`) – Begründung: Die virtuelle Platte wird größer, die VM läuft weiter.
3. **Im Gast** Datenträger erneut einlesen und **Volume erweitern** – Begründung: Der neue Platz liegt zunächst als **nicht zugeordneter Bereich** hinter der Partition.
4. Bei Gen-1-Startdatenträgern (IDE) oder VHD-Format: Wartungsfenster, VM aus, dann erweitern bzw. vorher nach VHDX konvertieren.

### Ergebnis prüfen
- `Get-VHD` zeigt **Size 400 GB**.
- Im Gast: `Get-Volume -DriveLetter E` zeigt ca. 400 GB Kapazität; Benutzer können speichern.

### Vorbeugung
- Überwachung des freien Speichers **im Gast** und auf dem **Host** (dynamische VHDX wachsen!).
- Datenplatten als VHDX am SCSI-Controller anlegen – nur so online änderbar.
- FSRM-Kontingente/Berichte im Gast nutzen.
- Überbuchung bei dynamischen VHDX dokumentieren (Summe Maximalgrößen vs. Host-Kapazität).

## Einfach

Eine VHDX ist wie ein **Ordner mit fester Seitenzahl**. Bei FILE01 hat der Ordner 200 Seiten – alle sind beschrieben. Auch wenn im Regal (auf dem Host) noch viel Platz ist, passt in den Ordner nichts mehr.

Zum Glück kann Hyper-V den Ordner **dicker machen, während man darin arbeitet** – aber nur, wenn er am richtigen „Haken“ hängt (dem **SCSI-Controller**) und das moderne Ordner-Format hat (**VHDX**).

Aber Achtung: Der Ordner ist jetzt dicker, doch das **Inhaltsverzeichnis** (die Partition) kennt die neuen Seiten noch nicht. Deshalb muss man im Gast noch sagen: „**Volume erweitern**“ – dann gehören die neuen Seiten zu Laufwerk E:.

Und wenn man vorher **Notizzettel** (Prüfpunkte) draufgelegt hat, geht das Dickermachen nicht – erst die Zettel wegräumen.

## Merksatz
- Online erweitern: **VHDX + SCSI + keine Prüfpunkte**.
- Zwei Schritte: **Resize-VHD** auf dem Host, **Resize-Partition** im Gast.
- Gen-1-IDE-Startplatte → nur **offline**.

## Prüfungsfalle
- Nach `Resize-VHD` ist das Laufwerk im Gast **noch nicht** größer.
- **VHD**-Dateien können nicht online vergrößert werden.
- Datenträger mit **Prüfpunkten** lassen sich nicht vergrößern.
- Verkleinern geht nur bis zur Größe, die durch **nicht zugeordneten Bereich** frei ist – erst im Gast Partition verkleinern.

## Grafik
### Ordner dicker machen
1. FILE01: Laufwerk E voll, 200 GB belegt
2. Admin -> HV01: Resize-VHD auf 400 GB
3. HV01 -> FILE01: Datenträger meldet 400 GB, 200 GB nicht zugeordnet
4. Admin -> FILE01: Volume E erweitern
5. FILE01: E hat 400 GB, Benutzer speichern wieder

## Lab
**Maschinen**: Host **HV01.example.com**, VM **FILE01** mit Datenplatte `FILE01-Daten.vhdx` (Gen 2, SCSI).
Nachstellen: Zuerst den Fehler bewusst erzeugen, dann beheben.

### GUI
1. **HV01**: Hyper-V-Manager → FILE01 → Einstellungen → SCSI-Controller → **Festplatte hinzufügen** → Neu → VHDX, dynamisch, **10 GB** → OK.
2. **FILE01**: Datenträgerverwaltung → neuen Datenträger initialisieren (GPT) → Volume **E:** anlegen → mit Testdateien füllen, bis voll (Fehlerzustand).
3. **HV01**: Hyper-V-Manager → FILE01 → Einstellungen → SCSI-Controller → Festplatte → **Bearbeiten** → **Erweitern** → neue Größe **20 GB** → Fertig stellen (VM läuft weiter).
4. **FILE01**: Datenträgerverwaltung → Aktion → **Datenträger neu einlesen** → 10 GB **Nicht zugeordnet** sichtbar.
5. **FILE01**: Rechtsklick auf **E:** → **Volume erweitern** → Assistent mit Standardwerten → Fertig stellen.
6. **FILE01**: Explorer → E: zeigt ca. 20 GB.

### PowerShell
1. **HV01**: Datenplatte anlegen und Fehler erzeugen.
2. **HV01**: VHDX online vergrößern.
3. **FILE01**: Partition erweitern.

```powershell
# Auf HV01 – Datenplatte anlegen
New-VHD -Path D:\VMs\FILE01\FILE01-Daten.vhdx -SizeBytes 10GB -Dynamic
Add-VMHardDiskDrive -VMName FILE01 -ControllerType SCSI -Path D:\VMs\FILE01\FILE01-Daten.vhdx

# In FILE01 – initialisieren und füllen (Fehlerzustand)
Get-Disk | Where-Object PartitionStyle -eq RAW | Initialize-Disk -PartitionStyle GPT -PassThru |
  New-Partition -DriveLetter E -UseMaximumSize | Format-Volume -FileSystem NTFS -NewFileSystemLabel Projekte

# Auf HV01 – Bedingungen prüfen und online erweitern
Get-VMHardDiskDrive -VMName FILE01 | Select-Object ControllerType, Path
Get-VMCheckpoint -VMName FILE01
Resize-VHD -Path D:\VMs\FILE01\FILE01-Daten.vhdx -SizeBytes 20GB
Get-VHD -Path D:\VMs\FILE01\FILE01-Daten.vhdx | Select-Object VhdFormat, VhdType, Size, FileSize

# In FILE01 – Partition erweitern
Update-HostStorageCache
$max = (Get-PartitionSupportedSize -DriveLetter E).SizeMax
Resize-Partition -DriveLetter E -Size $max
Get-Volume -DriveLetter E
```

## Szenario
### Kontrollfragen
Laufwerk E: in FILE01 (200-GB-VHDX am SCSI-Controller) ist voll und soll ohne Ausfall auf 400 GB wachsen.
- F: Welche Voraussetzungen gelten für die Online-Erweiterung? | A: VHDX-Format, Anschluss am SCSI-Controller, keine Prüfpunkte am Datenträger, genug Platz auf dem Host.
- F: Mit welchem Cmdlet wird die VHDX vergrößert? | A: Resize-VHD -Path <Pfad> -SizeBytes 400GB
- F: Warum ist E: danach noch nicht größer? | A: Der neue Platz ist im Gast nicht zugeordnet; die Partition muss erweitert werden.
- F: Wie erweitert man die Partition per PowerShell im Gast? | A: Resize-Partition -DriveLetter E -Size (Get-PartitionSupportedSize -DriveLetter E).SizeMax
- F: Was gilt für den Startdatenträger einer Gen-1-VM? | A: Er hängt am IDE-Controller und kann nur offline vergrößert werden.

## Reihenfolge
### VHDX online erweitern
1. Format, Controller und Prüfpunkte prüfen
2. Freien Platz auf dem Host-Volume prüfen
3. VHDX mit Resize-VHD vergrößern
4. Im Gast Datenträger neu einlesen
5. Partition im Gast erweitern
6. Neue Größe prüfen

## Legende
### Resize-VHD
- Was: Cmdlet zum Vergrößern oder Verkleinern einer virtuellen Festplatte.
- Wie: `Resize-VHD -Path <Datei> -SizeBytes <Größe>`; GUI: Datenträger bearbeiten → Erweitern.
- Wann: wenn ein Laufwerk im Gast voll ist oder Platz freigegeben werden soll.
- Wo: auf dem Hyper-V-Host; online nur für VHDX am SCSI-Controller.
- Warum: Kapazität passt man ohne neue Platte und ohne Ausfall an.

## Karteikarten
- F: Welche drei Bedingungen braucht eine Online-Erweiterung? | A: VHDX, SCSI-Controller, keine Prüfpunkte.
- F: Seit wann gibt es Online-Größenänderung von VHDX? | A: Seit Windows Server 2012 R2.
- F: Cmdlet zum Vergrößern einer VHDX? | A: Resize-VHD
- F: Was muss nach Resize-VHD im Gast passieren? | A: Partition/Volume erweitern.
- F: GUI-Weg im Gast? | A: Datenträgerverwaltung → Rechtsklick Volume → Volume erweitern.
- F: Kann eine Gen-1-Startplatte online erweitert werden? | A: Nein, sie hängt am IDE-Controller – nur offline.
- F: Kann man eine Platte mit Prüfpunkten vergrößern? | A: Nein, erst Prüfpunkte entfernen.
- F: Wie weit lässt sich eine VHDX verkleinern? | A: Nur um nicht zugeordneten Bereich; vorher Partition im Gast verkleinern.
- F: Welches Cmdlet zeigt die maximale Partitionsgröße? | A: Get-PartitionSupportedSize

## Quiz
? Welche VHDX kann online vergrößert werden?
* VHDX am SCSI-Controller ohne Prüfpunkte
- VHD am IDE-Controller
- VHDX am IDE-Controller einer Gen-1-VM
- Jede Datei mit Prüfpunkten
! Online-Resize setzt VHDX und SCSI voraus.

? Welches Cmdlet vergrößert die Datei?
* Resize-VHD
- Expand-Volume
- Set-VMHardDiskDrive -Size
- Convert-VHD
! Convert-VHD ändert Format oder Typ.

? Was ist nach Resize-VHD im Gast zu sehen?
* Nicht zugeordneter Bereich hinter der Partition
- Ein automatisch vergrößertes Laufwerk E:
- Ein neues, bereits formatiertes Laufwerk F:
- Nichts – erst nach Neustart des Gastes
! Die Partition muss manuell erweitert werden.

? Welcher Befehl erweitert E: im Gast auf das Maximum?
* Resize-Partition -DriveLetter E -Size (Get-PartitionSupportedSize -DriveLetter E).SizeMax
- Resize-VHD -Path E:\Daten.vhdx -SizeBytes (Get-VHD -Path E:\Daten.vhdx).Size
- Set-Volume -DriveLetter E -Size (Get-Volume -DriveLetter E).SizeRemaining
- Optimize-Volume -DriveLetter E -ReTrim -SlabConsolidate -Verbose
! Get-PartitionSupportedSize liefert die mögliche Höchstgröße.

? Warum schlägt Resize-VHD an einer Platte mit Prüfpunkten fehl?
* Die aktive Datei ist eine AVHDX in einer Kette
- Weil Prüfpunkte schreibgeschützt sind
- Weil Hyper-V dann keine VHDX kennt
- Es schlägt nicht fehl
! Mit Prüfpunkten wird die Kette nicht vergrößert.

? Wie wird die Startplatte einer Gen-1-VM vergrößert?
* Offline bei ausgeschalteter VM
- Online wie jede andere Platte
- Gar nicht
- Nur über Azure
! Gen-1-Startplatten hängen am IDE-Controller.

? Was ist bei dynamischen VHDX auf dem Host zu überwachen?
* Freier Speicher, weil die Dateien wachsen
- Nichts, dynamische VHDX bleiben immer klein
- Die MAC-Adresse der zugehörigen VM
- Die Prüfpunktvorlage der zugehörigen VM
! Die Summe der Maximalgrößen kann den Host überbuchen.

? Ab welcher Version gibt es Online-Größenänderung von VHDX?
* Windows Server 2012 R2
- Windows Server 2008 R2
- Windows Server 2016
- Windows Server 2025
! Seit 2012 R2 können VHDX am SCSI online geändert werden.
