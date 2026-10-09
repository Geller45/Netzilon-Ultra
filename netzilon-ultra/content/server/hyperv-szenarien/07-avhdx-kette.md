---
id: server-hvsz-07
bereich: AZ-800
block: HV-S
kapitel: Hyper-V-Praxisszenarien
titel: Szenario 07 – Host-Volume voll durch AVHDX-Prüfpunktkette
stufe: Fortgeschritten
fach: Windows Server / AZ-800
pruefungen: [AZ-800, AP2, Schule]
quellen: [Microsoft Learn – Hyper-V]
verweise: [az800-pruefpunkte, az800-vhdx, server-hvsz-08, server-hvsz-13]
---

## Profi

### Ticket
**Kunde meldet:** „Der Warenwirtschaftsserver ist eingefroren. Im Hyper-V-Manager steht ‚Angehalten – Kritisch‘. Laufwerk D: auf dem Host ist rot.“
- Datum/Priorität: 02.10.2026, **Priorität 1 (kritisch)** – Lager steht still.
- Betroffene Maschine: VM **WAWI01** auf **HV01.example.com**, Volume **D:** (2 TB).

### Ausgangslage
- Host **HV01.example.com**, Server 2025; alle VMs liegen auf D:\VMs.
- WAWI01: Gen 2, dynamisch erweiterbare VHDX 500 GB, IP 192.168.10.40.
- Seit Monaten erstellt ein Skript vor jedem Update einen Prüfpunkt – gelöscht wurde nie. Im Prüfpunktbaum hängen **23 Prüfpunkte**; der Ordner enthält 23 **.avhdx**-Dateien mit zusammen über 900 GB.

### Analyse
Jeder Prüfpunkt friert die bisherige Festplatte ein; alle neuen Schreibvorgänge landen in einer **Differenzdatei (.avhdx)**. Je länger die Kette, desto mehr Platz und desto langsamer die Lesezugriffe. Ist das Volume voll, kann die VM nicht mehr schreiben – Hyper-V **hält die VM an** (Zustand *Paused-Critical*/„Angehalten – Kritisch“), um Datenverlust zu vermeiden.

| Hypothese | Prüfung |
|---|---|
| Prüfpunktkette frisst Speicher | `Get-VMCheckpoint -VMName WAWI01`, Ordnergröße der .avhdx |
| Dynamische VHDX ist gewachsen | `Get-VHD` (FileSize vs. Size) |
| Andere Dateien auf D: (ISO, Exporte, Sicherungen) | Explorer/`Get-ChildItem` nach Größe |
| Verwaiste .avhdx ohne Prüfpunkt im Manager | Pfad der aktiven Disk (`Get-VMHardDiskDrive`) und `ParentPath` vergleichen |

### Lösungsweg
1. **Kurzfristig Platz schaffen**, ohne die Kette anzufassen: ISO-Dateien/alte Exporte von D: verschieben oder D: erweitern – Begründung: Die VM kann erst weiterlaufen, wenn wieder geschrieben werden kann; auch das Zusammenführen braucht etwas Puffer.
2. **WAWI01 fortsetzen** (Resume) – Begründung: Die VM läuft ohne Neustart dort weiter, wo sie angehalten wurde.
3. **Prüfpunkte im Hyper-V-Manager löschen** (gesamte Unterstruktur bzw. alle nicht benötigten) – Begründung: Beim Löschen werden die .avhdx-Inhalte in den Elterndatenträger **zusammengeführt (Merge)**; die Daten des aktuellen Zustands bleiben erhalten, nur die Rücksprungpunkte entfallen. Das Zusammenführen läuft bei laufender VM im Hintergrund.
4. **Fortschritt beobachten**: Statusspalte „Zusammenführen … %“ – Begründung: Erst nach Abschluss ist der Platz wieder frei.
5. **Niemals .avhdx-Dateien manuell löschen** – Begründung: Die Kette wäre zerstört, Daten seit dem Prüfpunkt verloren.
6. Bei verwaisten .avhdx (Prüfpunkt nicht mehr im Manager sichtbar, Datei aber aktiv): VM aus → **Datenträger bearbeiten → Zusammenführen** bzw. `Merge-VHD`, danach den Festplattenpfad der VM auf die Eltern-VHDX setzen.

### Ergebnis prüfen
- `Get-VMCheckpoint -VMName WAWI01` liefert nichts mehr.
- `Get-VMHardDiskDrive -VMName WAWI01` zeigt wieder die **.vhdx** (keine .avhdx).
- D: hat ausreichend freien Speicher, WAWI01 *Wird ausgeführt*.

### Vorbeugung
- Prüfpunkte sind **kein Backup** und **kurzlebig**: nach erfolgreichem Update löschen.
- Skript so anpassen, dass alte Prüfpunkte nach z. B. 3 Tagen gelöscht werden.
- Überwachung auf freien Speicher des VM-Volumes (Warnung bei 15 %).
- Prüfpunkt-Speicherort ggf. getrennt planen und Kapazität berücksichtigen.

## Einfach

Stell dir eine VM-Festplatte wie ein **Schulheft** vor. Ein Prüfpunkt heißt: „Ab jetzt nicht mehr ins Heft schreiben, sondern auf einen **Notizzettel**, den man drüberlegt.“ So kann man jederzeit zurück zum alten Heft.

Wer aber jeden Tag einen neuen Zettel drauflegt und **nie** welche wegräumt, hat irgendwann einen **riesigen Zettelberg** – der Schreibtisch (das Laufwerk D:) ist voll. Dann kann man nicht mehr schreiben, und Hyper-V sagt der VM: „**Stopp! Kurz anhalten**, sonst geht was kaputt.“

Was tun?
1. Erst mal **etwas anderes vom Tisch räumen** (alte ISO-Dateien), damit man wieder Platz hat.
2. Die VM **weiterlaufen** lassen.
3. Im Hyper-V-Manager die Prüfpunkte **löschen**. Das heißt nicht, dass die Notizen weg sind! Hyper-V **schreibt alle Notizzettel ins Heft zurück** (zusammenführen) und wirft dann die Zettel weg.
4. **Nie** einfach Zettel in den Müll werfen (avhdx-Dateien von Hand löschen) – dann fehlt plötzlich ein Teil der Hausaufgaben.

## Merksatz
- Prüfpunkt löschen = **zusammenführen**, nicht Daten löschen.
- **Nie** .avhdx manuell löschen.
- Volume voll → VM **angehalten – kritisch**.
- Prüfpunkte sind **kein Backup** und sollen kurzlebig sein.

## Prüfungsfalle
- „Prüfpunkt löschen“ verwirft **nicht** die Änderungen seit dem Prüfpunkt – das wäre „Anwenden/Zurücksetzen“.
- Zusammenführen läuft auch bei **laufender** VM (seit Server 2012).
- Lange Ketten verschlechtern die **Leseleistung**.
- `Merge-VHD` nur für verwaiste Dateien bei ausgeschalteter VM – im Normalfall Prüfpunkte über Hyper-V löschen.

## Grafik
### Zettelberg wird zusammengeführt
1. WAWI01: Schreibt in die neueste AVHDX der Kette
2. HV01: Volume D voll – VM angehalten, kritisch
3. Admin -> HV01: Platz schaffen, VM fortsetzen
4. Admin -> HV01: Alle Prüfpunkte löschen
5. HV01: AVHDX-Inhalte werden in die Eltern-VHDX zusammengeführt
6. HV01 -> WAWI01: Aktive Festplatte wieder WAWI01.vhdx
7. HV01: Speicher auf D wieder frei

## Lab
**Maschinen**: Host **HV01.example.com**, VM **WAWI01** auf einem bewusst kleinen Testvolume (z. B. 60-GB-VHDX als Laufwerk T: auf dem Host).
Nachstellen: Zuerst den Fehler bewusst erzeugen, dann beheben.

### GUI
1. **HV01**: Datenträgerverwaltung → neue kleine Platte als **T:** einrichten; WAWI01 mit dynamischer VHDX auf T: anlegen.
2. **HV01**: Hyper-V-Manager → WAWI01 → **Prüfpunkt** mehrfach erstellen; zwischen den Prüfpunkten in **WAWI01** große Dateien erzeugen, bis T: voll ist (Fehlerzustand: Status „Angehalten – Kritisch“).
3. **HV01**: Explorer → T: → überflüssige Dateien (z. B. abgelegtes ISO) verschieben → Hyper-V-Manager → WAWI01 → **Fortsetzen**.
4. **HV01**: Hyper-V-Manager → WAWI01 → Bereich Prüfpunkte → obersten Prüfpunkt → Rechtsklick → **Prüfpunkt-Unterstruktur löschen** → bestätigen.
5. **HV01**: Statusspalte „Zusammenführen“ beobachten, bis sie verschwindet.
6. **HV01**: WAWI01 → Einstellungen → SCSI-Controller → Festplatte → Pfad zeigt **.vhdx**.
7. **HV01**: Explorer → T: → freien Speicher prüfen.

### PowerShell
1. **HV01**: Kette erzeugen und Zustand analysieren.
2. **HV01**: Prüfpunkte löschen und Merge beobachten.
3. **HV01**: Ergebnis kontrollieren.

```powershell
# Auf HV01 – Kette erzeugen
1..5 | ForEach-Object { Checkpoint-VM -Name WAWI01 -SnapshotName "Update $_" }
Get-VMCheckpoint -VMName WAWI01 | Format-Table Name, CreationTime
Get-ChildItem T:\VMs\WAWI01 -Recurse -Filter *.avhdx | Measure-Object Length -Sum
Get-VM -Name WAWI01 | Select-Object Name, State, Status

# Auf HV01 – nach Platz schaffen: fortsetzen und zusammenführen
Resume-VM -Name WAWI01
Get-VMCheckpoint -VMName WAWI01 | Remove-VMCheckpoint
Get-VM -Name WAWI01 | Select-Object Name, Status        # "Zusammenführen..."

# Auf HV01 – Ergebnis
Get-VMHardDiskDrive -VMName WAWI01 | Select-Object Path
Get-Volume -DriveLetter T | Select-Object SizeRemaining
```

## Szenario
### Kontrollfragen
Die VM WAWI01 steht auf „Angehalten – Kritisch“. Das Volume D: ist voll, im VM-Ordner liegen 23 AVHDX-Dateien.
- F: Warum wurde WAWI01 angehalten? | A: Das Volume ist voll, die VM kann nicht mehr in ihre Differenzdatei schreiben; Hyper-V hält sie an, um Datenverlust zu verhindern.
- F: Was passiert beim Löschen eines Prüfpunkts? | A: Die AVHDX wird in den Elterndatenträger zusammengeführt; der aktuelle Zustand bleibt, nur der Rücksprungpunkt entfällt.
- F: Warum darf man AVHDX-Dateien nicht im Explorer löschen? | A: Die Differenzkette würde zerstört, Änderungen seit dem Prüfpunkt gingen verloren und die VM startet nicht mehr.
- F: Welches Cmdlet entfernt alle Prüfpunkte? | A: Get-VMCheckpoint -VMName WAWI01 \| Remove-VMCheckpoint
- F: Wie verhindert man das künftig? | A: Prüfpunkte kurzlebig halten und automatisch löschen, Speicherüberwachung, echte Backups statt Prüfpunkte.

## Reihenfolge
### Volle Platte durch Prüfpunkte beheben
1. Ursache ermitteln: Prüfpunkte und AVHDX-Größen prüfen
2. Platz schaffen ohne die Kette zu verändern
3. VM fortsetzen
4. Nicht benötigte Prüfpunkte in Hyper-V löschen
5. Zusammenführen abwarten
6. Festplattenpfad und freien Speicher prüfen
7. Prüfpunkt-Richtlinie und Überwachung einführen

## Legende
### Zusammenführen (Merge)
- Was: Übernahme der Änderungen einer .avhdx-Differenzdatei in den Elterndatenträger.
- Wie: automatisch beim Löschen eines Prüfpunkts (`Remove-VMCheckpoint`), manuell für verwaiste Dateien per „Datenträger bearbeiten“ oder `Merge-VHD`.
- Wann: wenn Prüfpunkte nicht mehr gebraucht werden oder Speicher knapp ist.
- Wo: auf dem Hyper-V-Host im Speicherort der VM-Festplatten.
- Warum: verkürzt die Kette, gibt Platz frei und verbessert die Leseleistung.

## Karteikarten
- F: Was ist eine .avhdx-Datei? | A: Differenzierungsdatenträger eines Prüfpunkts, in den alle Änderungen nach dem Prüfpunkt geschrieben werden.
- F: Welcher VM-Status zeigt ein volles Volume an? | A: Angehalten – Kritisch (Paused-Critical).
- F: Was passiert beim Löschen eines Prüfpunkts? | A: Zusammenführen der Änderungen in den Elterndatenträger; keine Datenänderung am aktuellen Zustand.
- F: Darf man .avhdx-Dateien manuell löschen? | A: Nein, das zerstört die Kette.
- F: Läuft das Zusammenführen bei laufender VM? | A: Ja, im Hintergrund (Live-Merge).
- F: Wie setzt man eine angehaltene VM fort? | A: Resume-VM -Name <VM> bzw. Hyper-V-Manager → Fortsetzen.
- F: Welches Cmdlet führt verwaiste Differenzdateien manuell zusammen? | A: Merge-VHD
- F: Warum sind lange Prüfpunktketten schlecht? | A: Mehr Speicherverbrauch und schlechtere Leseleistung, höheres Risiko.
- F: Sind Prüfpunkte ein Backup? | A: Nein, sie liegen auf demselben Speicher und hängen von der Eltern-VHDX ab.

## Quiz
? Was bewirkt das Löschen eines Prüfpunkts?
* Die Änderungen werden in den Elterndatenträger zusammengeführt
- Die VM springt auf den Prüfpunkt zurück
- Alle Änderungen seit dem Prüfpunkt gehen verloren
- Die VHDX wird gelöscht
! Löschen entfernt nur den Rücksprungpunkt.

? Warum steht WAWI01 auf „Angehalten – Kritisch“?
* Das Volume mit der VM-Festplatte ist voll
- Die Integrationsdienste sind veraltet
- Der Switch ist getrennt
- Die VM hat zu viel RAM
! Hyper-V hält VMs an, wenn nicht mehr geschrieben werden kann.

? Was ist der erste sinnvolle Schritt bei vollem Volume?
* Platz schaffen, ohne die Prüfpunktkette anzufassen
- Die neueste .avhdx löschen
- Die VM hart ausschalten
- Den Host neu starten
! Danach kann die VM fortgesetzt und die Kette sauber zusammengeführt werden.

? Welches Cmdlet entfernt Prüfpunkte?
* Remove-VMCheckpoint
- Restore-VMCheckpoint
- Remove-VHD
- Clear-VMSnapshot
! Restore-VMCheckpoint wendet einen Prüfpunkt an.

? Kann das Zusammenführen bei laufender VM stattfinden?
* Ja
- Nein, VM muss aus sein
- Nur bei Gen-1-VMs
- Nur mit Produktionsprüfpunkten
! Live-Merge gibt es seit Windows Server 2012.

? Wofür ist Merge-VHD gedacht?
* Verwaiste Differenzdateien manuell zusammenführen
- Zwei VMs zu einer verbinden
- VHD in VHDX konvertieren
- Prüfpunkte erstellen
! Normalerweise erledigt Remove-VMCheckpoint das Zusammenführen.

? Welche Aussage über Prüfpunkte stimmt?
* Sie sind kein Ersatz für ein Backup
- Sie liegen immer auf einem anderen Server
- Sie verbessern die Leseleistung
- Sie werden nach 7 Tagen automatisch gelöscht
! Prüfpunkte liegen beim Original und hängen von der Eltern-VHDX ab.

? Was zeigt Get-VMHardDiskDrive nach erfolgreichem Merge?
* Den Pfad zur .vhdx statt einer .avhdx
- Eine neue .avhdx
- Einen leeren Pfad
- Den Pfad zur Prüfpunktkonfiguration
! Ohne Prüfpunkte arbeitet die VM wieder direkt mit der Eltern-VHDX.
