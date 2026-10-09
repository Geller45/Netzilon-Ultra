---
id: server-hvsz-22
bereich: AZ-800
block: HV-S
kapitel: Hyper-V-Praxisszenarien
titel: Szenario 22 – Speichermigration einer laufenden VM
stufe: Einsteiger
fach: Windows Server / AZ-800
pruefungen: [AZ-800, AP2, Schule]
quellen: [Microsoft Learn – Hyper-V]
verweise: [az800-vhdx, az800-storage-spaces, server-hvsz-13, server-hvsz-21]
---

## Profi

### Ticket
**Kunde meldet:** „Das alte RAID auf Laufwerk D: von HV01 meldet Plattenfehler und soll raus. Die neue SSD-Gruppe ist als E: eingebaut. Kann der Mailserver dorthin, ohne dass ihn jemand ausschaltet?“
- Datum/Priorität: 07.10.2026, **Priorität 2 (hoch)** – RAID degradiert.
- Betroffene Maschine: VM **MAIL01** auf **HV01.example.com**.

### Ausgangslage
- Host **HV01.example.com**, Server 2025. **D:** altes RAID 5 (degradiert), **E:** neues SSD-Volume, 2 TB frei.
- MAIL01: Gen 2, Server 2022, IP 192.168.10.25, Dateien unter `D:\VMs\MAIL01` (Konfiguration, 2 VHDX mit zusammen 600 GB, ein Prüfpunkt, Smart-Paging-Pfad).
- Kein Cluster, Live-Migration nicht nötig (gleicher Host).

### Analyse
**Speichermigration** (*Storage Migration*) verschiebt die Dateien einer VM – virtuelle Festplatten, Konfiguration, Prüfpunkte, Smart-Paging-Datei – **im laufenden Betrieb** auf einen anderen Speicherort (seit Server 2012). Ablauf: Hyper-V kopiert die VHDX, spiegelt währenddessen neue Schreibvorgänge auf Quelle **und** Ziel, schaltet dann auf das Ziel um und löscht die Quelldateien.

| Prüfpunkt | Prüfung |
|---|---|
| Genug Platz am Ziel | `Get-Volume E` (≥ Gesamtgröße der VM-Dateien, dynamische VHDX nach FileSize) |
| Welche Dateien liegen wo | `Get-VM MAIL01 \| Select Path, ConfigurationLocation, SnapshotFileLocation, SmartPagingFilePath`, `Get-VMHardDiskDrive` |
| IO-Last des degradierten RAIDs | Leistungsindikatoren, Zeitpunkt mit geringer Last wählen |
| Weitere Abhängigkeiten (ISO aus D: eingelegt) | `Get-VMDvdDrive -VMName MAIL01` |

### Lösungsweg
1. **ISO-Medien auswerfen**, die auf D: liegen – Begründung: Die Speichermigration verschiebt virtuelle Festplatten, Konfiguration, Prüfpunkte und Smart-Paging-Datei – eingebundene ISO-Dateien gehören nicht dazu; die VM würde weiter auf D: verweisen.
2. **Speicherplatz am Ziel prüfen** – Begründung: Während der Migration liegen die Daten kurzzeitig doppelt vor.
3. **Speicher verschieben**: Hyper-V-Manager → *Verschieben* → *Speicher des virtuellen Computers verschieben* → *Alle Daten an einen einzigen Speicherort* `E:\VMs\MAIL01` bzw. `Move-VMStorage` – Begründung: alles an einen Ort, inkl. Prüfpunkt- und Smart-Paging-Dateien.
4. **Fortschritt beobachten** (Statusspalte, `Get-VM`) – Begründung: 600 GB dauern je nach Durchsatz; die VM bleibt erreichbar.
5. **Kontrolle**, dass auf D: nichts mehr von MAIL01 liegt – Begründung: erst dann kann das RAID entfernt werden.

### Ergebnis prüfen
- `Get-VMHardDiskDrive -VMName MAIL01` zeigt Pfade unter **E:\VMs\MAIL01**.
- `Get-VM MAIL01 | Select Path, SnapshotFileLocation, SmartPagingFilePath` → alle auf E:.
- Dauerping auf MAIL01 während der Migration ohne Ausfall; Mailfluss normal.
- `D:\VMs\MAIL01` leer bzw. nicht mehr vorhanden.

### Vorbeugung
- Standardpfade des Hosts (Hyper-V-Einstellungen → *Virtuelle Festplatten*/*Virtuelle Computer*) auf das neue Volume ändern.
- Speicherzustand (RAID/Storage Spaces) überwachen.
- Speichermigration für Wartungen einplanen statt VMs herunterzufahren.

## Einfach

Stell dir vor, MAIL01 wohnt in einem **Zelt** auf einer Wiese, die langsam **matschig** wird (das kaputte RAID D:). Daneben wurde ein **fester Holzboden** gebaut (das neue Laufwerk E:).

Bei der **Speichermigration** wird das Zelt **Stück für Stück** auf den Holzboden getragen, **während MAIL01 drin weiterschläft**:
- Zuerst wird eine Kopie von allem auf dem Holzboden aufgebaut.
- Was MAIL01 in der Zwischenzeit verändert, wird **an beiden Orten** gleichzeitig eingetragen.
- Wenn alles drüben ist, **schaltet** Hyper-V um – MAIL01 merkt nichts.
- Dann wird das alte Zelt auf der matschigen Wiese abgebaut.

Vorher sollte man aber nachsehen, ob noch etwas auf der alten Wiese **festgebunden** ist – zum Beispiel ein eingelegtes **ISO**. Das wandert nämlich nicht mit.

## Merksatz
- Speichermigration = Dateien einer **laufenden** VM verschieben, **gleicher Host**.
- `Move-VMStorage -DestinationStoragePath` = alles an einen Ort.
- Quelle wird **nach Erfolg** gelöscht.
- ISO-Dateien wandern **nicht** mit.

## Prüfungsfalle
- **Move-VMStorage** verschiebt nur den Speicher, **Move-VM** verschiebt die VM auf einen anderen Host (optional mit Speicher).
- Speichermigration braucht **keinen** Cluster und keine Live-Migrationseinstellungen auf dem gleichen Host.
- Verschieben per **Explorer** bei laufender VM ist nicht möglich bzw. zerstört Pfade – immer über Hyper-V.
- Prüfpunkt-Dateien werden mit verschoben, wenn man „alles an einen Ort“ wählt.

## Grafik
### Zelt auf den Holzboden
1. Admin -> HV01: Move-VMStorage MAIL01 nach E VMs
2. HV01: Kopiert VHDX von D nach E
3. MAIL01 -> HV01: Neue Schreibvorgänge
4. HV01: Spiegelt Schreibvorgänge auf Quelle und Ziel
5. HV01: Umschalten auf die Dateien in E
6. HV01: Quelldateien auf D gelöscht
7. MAIL01: Lief durchgehend weiter

## Lab
**Maschinen**: Host **HV01.example.com** mit zwei Volumes **D:** und **E:**, VM **MAIL01** (beliebige Server-VM).
Nachstellen: Zuerst den Fehler bewusst erzeugen (ISO bleibt hängen), dann beheben.

### GUI
1. **HV01**: Hyper-V-Manager → MAIL01 → Einstellungen → SCSI-Controller → DVD-Laufwerk → **Imagedatei** `D:\ISO\tools.iso` einlegen → OK; MAIL01 läuft (Fehlerquelle).
2. **HV01**: MAIL01 → **Verschieben** → *Speicher des virtuellen Computers verschieben* → *Alle Daten des virtuellen Computers an einen einzigen Speicherort verschieben* → `E:\VMs\MAIL01` → Fertig stellen.
3. **CL01**: `ping -t MAIL01` während der Migration beobachten.
4. **HV01**: Nach Abschluss MAIL01 → Einstellungen → DVD-Laufwerk zeigt weiterhin **D:\ISO\tools.iso** (Fehlerbild).
5. **HV01**: DVD-Laufwerk → **Keine** → OK.
6. **HV01**: Explorer → `D:\VMs\MAIL01` leer bzw. entfernt; `E:\VMs\MAIL01` enthält Konfiguration, VHDX, Prüfpunkte.
7. **HV01**: Hyper-V-Einstellungen → **Virtuelle Festplatten** und **Virtuelle Computer** → Standardpfad `E:\VMs`.

### PowerShell
1. **HV01**: Ausgangslage erfassen.
2. **HV01**: Speicher verschieben.
3. **HV01**: Pfade prüfen und ISO lösen.

```powershell
# Auf HV01 – Ausgangslage
Get-VM -Name MAIL01 | Select-Object Name, State, Path, ConfigurationLocation, SnapshotFileLocation, SmartPagingFilePath
Get-VMHardDiskDrive -VMName MAIL01 | Select-Object Path
Get-VMDvdDrive -VMName MAIL01 | Select-Object Path
Get-Volume -DriveLetter E | Select-Object SizeRemaining

# Auf HV01 – alles an einen Ort verschieben (VM läuft)
Move-VMStorage -VMName MAIL01 -DestinationStoragePath E:\VMs\MAIL01

# Alternative: nur bestimmte Festplatte verschieben
# Move-VMStorage -VMName MAIL01 -VHDs @(@{ "SourceFilePath" = "D:\VMs\MAIL01\Daten.vhdx"; "DestinationFilePath" = "E:\VMs\MAIL01\Daten.vhdx" })

# Auf HV01 – Kontrolle und ISO lösen
Get-VMHardDiskDrive -VMName MAIL01 | Select-Object Path
Get-VMDvdDrive -VMName MAIL01 | Set-VMDvdDrive -Path $null
Set-VMHost -VirtualHardDiskPath E:\VMs -VirtualMachinePath E:\VMs
```

## Szenario
### Kontrollfragen
MAIL01 liegt auf dem degradierten RAID D: und soll im laufenden Betrieb auf E: umziehen; ein ISO von D: ist eingelegt.
- F: Welche Funktion verschiebt die Dateien ohne Ausfall? | A: Speichermigration (Move-VMStorage bzw. Verschieben → Speicher des virtuellen Computers verschieben).
- F: Welcher Befehl verschiebt alle Dateien an einen Ort? | A: Move-VMStorage -VMName MAIL01 -DestinationStoragePath E:\VMs\MAIL01
- F: Was passiert mit den Quelldateien? | A: Sie werden nach erfolgreichem Umschalten gelöscht.
- F: Warum bleibt eine Abhängigkeit zu D:? | A: Eingelegte ISO-Dateien werden nicht mit verschoben; das Laufwerk muss geleert oder umgehängt werden.
- F: Worin unterscheidet sich Move-VM? | A: Move-VM verschiebt die VM auf einen anderen Host (Live-Migration), optional mit Speicher.

## Reihenfolge
### Speicher einer laufenden VM verschieben
1. Dateipfade und eingelegte Medien der VM erfassen
2. Freien Platz am Ziel prüfen
3. ISO-Medien vom alten Volume entfernen
4. Speichermigration an einen Zielordner starten
5. Fortschritt beobachten
6. Neue Pfade kontrollieren
7. Standardpfade des Hosts anpassen

## Legende
### Speichermigration (Storage Migration)
- Was: Verschieben der Dateien einer VM (VHDX, Konfiguration, Prüfpunkte, Smart Paging) auf einen anderen Speicherort ohne Ausfall.
- Wie: Hyper-V-Manager → Verschieben → Speicher verschieben bzw. `Move-VMStorage`.
- Wann: bei Speicherwechsel, Platzmangel, Hardwaretausch oder Leistungsoptimierung.
- Wo: auf demselben Hyper-V-Host (Ziel lokal, SAN oder SMB-Freigabe).
- Warum: VMs bleiben verfügbar, während der zugrunde liegende Speicher getauscht wird.

## Karteikarten
- F: Was verschiebt die Speichermigration? | A: Virtuelle Festplatten, Konfiguration, Prüfpunkte und Smart-Paging-Dateien einer VM.
- F: Seit wann ist Speichermigration im laufenden Betrieb möglich? | A: Seit Windows Server 2012.
- F: Cmdlet für Speichermigration? | A: Move-VMStorage
- F: Parameter für „alles an einen Ort“? | A: -DestinationStoragePath
- F: Was passiert mit der Quelle nach Erfolg? | A: Sie wird gelöscht.
- F: Was wird nicht mit verschoben? | A: Eingelegte ISO-Dateien bzw. Dateien, die nicht zur VM gehören.
- F: Unterschied Move-VM und Move-VMStorage? | A: Move-VM wechselt den Host, Move-VMStorage nur den Speicherort.
- F: Wie ändert man die Standardpfade des Hosts? | A: Set-VMHost -VirtualHardDiskPath <Pfad> -VirtualMachinePath <Pfad>
- F: Wie werden Schreibvorgänge während der Migration behandelt? | A: Sie werden auf Quelle und Ziel gespiegelt, bis umgeschaltet wird.

## Quiz
? Welches Cmdlet verschiebt die Dateien einer laufenden VM auf ein anderes Volume desselben Hosts?
* Move-VMStorage
- Move-VM -Quick
- Export-VM -Path
- Move-Item -Force
! Move-VM wechselt den Host.

? Was passiert mit den Quelldateien nach erfolgreicher Speichermigration?
* Sie werden gelöscht
- Sie bleiben als Sicherung
- Sie werden zu AVHDX
- Sie werden komprimiert
! Hyper-V räumt nach dem Umschalten auf.

? Was wird NICHT automatisch mit verschoben?
* Eingelegte ISO-Dateien
- Prüfpunkt-Dateien
- Die VM-Konfiguration
- Smart-Paging-Dateien
! ISO-Pfade bleiben bestehen.

? Muss die VM für eine Speichermigration ausgeschaltet werden?
* Nein
- Ja, immer
- Nur bei Gen 2
- Nur mit Prüfpunkten
! Seit Server 2012 geht das im laufenden Betrieb.

? Welcher Parameter verschiebt alle VM-Dateien in einen Ordner?
* -DestinationStoragePath
- -IncludeStorage
- -VirtualMachinePath
- -SnapshotFilePath
! -VirtualMachinePath bzw. -SnapshotFilePath verschieben nur einzelne Dateiarten, -VHDs gezielt einzelne Festplatten.

? Braucht Speichermigration auf demselben Host einen Cluster?
* Nein
- Ja
- Nur bei SMB-Zielen
- Nur bei VHD-Format
! Sie funktioniert auf jedem Hyper-V-Host.

? Wie behandelt Hyper-V Schreibvorgänge während der Migration?
* Spiegelung auf Quelle und Ziel bis zum Umschalten
- Puffern im RAM bis zum Neustart
- Verwerfen
- Schreiben nur auf die Quelle, danach Abgleich per robocopy
! So bleiben beide Kopien konsistent.

? Warum nicht einfach im Explorer verschieben?
* Dateien sind gesperrt, Hyper-V passt die Pfade nicht an
- Der Explorer kopiert zu schnell und überlastet den Host
- Der Explorer kann grundsätzlich keine VHDX-Dateien kopieren
- Es entstünden doppelte MAC-Adressen im Netzwerk
! Laufende VM-Dateien sind gesperrt – immer über Hyper-V verschieben.
