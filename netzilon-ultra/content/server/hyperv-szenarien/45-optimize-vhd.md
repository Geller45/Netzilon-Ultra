---
id: server-hvsz-45
bereich: AZ-800
block: HV-S
kapitel: Hyper-V-Praxisszenarien
titel: Szenario 45 – Dynamische VHDX belegt zu viel Platz: Optimize-VHD
stufe: Fortgeschritten
fach: Windows Server / AZ-800
pruefungen: [AZ-800, AP2, Schule]
quellen: [Microsoft Learn – Hyper-V]
verweise: [az800-vhdx, az800-pruefpunkte, az800-datentraeger, server-hvsz-40]
---

## Profi

### Ticket
**Kunde meldet:** „Auf HV01 ist Laufwerk D: fast voll. In FS01 haben wir 300 GB alte Projektdaten gelöscht, aber die VHDX-Datei auf dem Host ist kein bisschen kleiner geworden.“
- **Priorität:** hoch (Host-Speicher läuft voll – VMs könnten pausieren)
- **Betroffene Maschine:** **FS01** auf **HV01**

### Ausgangslage
- **HV01.example.com**, Server 2025, D: 2 TB, noch 40 GB frei.
- VM **FS01** (192.168.10.20), Daten-VHDX `D:\Hyper-V\FS01\FS01-Daten.vhdx`, **dynamisch erweiterbar**, max. 1 TB, Dateigröße 820 GB; im Gast belegt: 500 GB.
- Für FS01 existiert noch ein alter **Prüfpunkt** aus dem Frühjahr.

### Analyse
- Eine **dynamische VHDX** wächst bei Bedarf, **schrumpft aber nicht automatisch**, wenn im Gast Dateien gelöscht werden.
- **Optimize-VHD** (GUI: „Datenträger bearbeiten → **Komprimieren**“) gibt ungenutzte Blöcke frei. Gilt für **dynamische** und **differenzierende** Datenträger (nicht für feste).
- **Modi** (`-Mode`):
  - **Quick** (Standard): gibt ungenutzte Blöcke frei, sucht keine Nullblöcke – VHDX muss **schreibgeschützt eingebunden** sein.
  - **Full**: sucht zusätzlich nach Nullblöcken – ebenfalls nur schreibgeschützt eingebunden.
  - **Retrim**: sendet nur erneut Trim-Befehle – schreibgeschützt eingebunden.
  - **Pretrimmed** / **Prezeroed**: wie Quick, aber **ohne** schreibgeschütztes Einbinden, weniger gründlich. Ob das an einer **laufenden VM** klappt, hängt davon ab, ob Hyper-V die Datei sperrt – vorher an einer Test-VM ausprobieren; der sichere Weg bleibt das Wartungsfenster.
- Voraussetzung ist zudem: **keine Prüfpunkte**, die auf der Datei aufbauen – bei vorhandenem Prüfpunkt schreibt die VM in eine **.avhdx**, und die Eltern-VHDX ist „eingefroren“. Erst Prüfpunkt löschen (zusammenführen).
- Hinweis: Viele Gast-Dateisysteme melden freigegebene Blöcke per **TRIM/UNMAP** bereits an die VHDX; Hyper-V kann dadurch einen Teil des Platzes in der Datei freigeben. Ein manueller Lauf hilft, wenn das nicht ausgereicht hat.

### Lösungsweg
1. **Prüfpunkt löschen** und Zusammenführung abwarten. *Begründung:* Sonst wird die falsche Datei optimiert bzw. ist gesperrt.
2. Im Gast **Retrim** ausführen (`Optimize-Volume -DriveLetter E -ReTrim`). *Begründung:* Freie Bereiche dem Datenträger mitteilen.
3. **Wartungsfenster:** FS01 herunterfahren. *Begründung:* Für Quick/Full muss die VHDX schreibgeschützt eingebunden werden.
4. VHDX auf dem Host **schreibgeschützt einbinden** (`Mount-VHD -ReadOnly`), **Optimize-VHD -Mode Full**, wieder trennen. *Begründung:* Gründlichster Modus.
5. FS01 starten. *Begründung:* Dienst wieder bereitstellen.
6. Mögliche Alternative ohne schreibgeschütztes Einbinden: `Optimize-VHD -Mode Pretrimmed`. *Begründung:* Weniger Platzgewinn; ob es ohne Wartungsfenster (laufende VM) funktioniert, vorher testen.

### Ergebnis prüfen
- `Get-VHD D:\Hyper-V\FS01\FS01-Daten.vhdx | Select FileSize, Size, MinimumSize` → FileSize deutlich kleiner (nahe der belegten 500 GB).
- `Get-Volume D` → freier Speicher gestiegen.
- FS01 läuft, Freigaben erreichbar.

### Vorbeugung
- Speicher-Überwachung des Host-Volumes mit Warnschwelle (z. B. 15 %).
- Prüfpunkte nicht wochenlang liegen lassen.
- Überbuchung bewusst planen: Summe der maximalen VHDX-Größen vs. echtem Platz.
- Regelmäßiger Wartungsjob (z. B. vierteljährlich) für Optimize-VHD.

## Einfach
Stell dir einen **Luftballon** vor, in den du Spielsachen stopfst. Je mehr du reinsteckst, desto größer wird der Ballon (dynamische VHDX). Jetzt nimmst du die Hälfte der Spielsachen wieder raus – aber der Ballon bleibt **genauso groß**! Er schrumpft nicht von selbst.

Damit er wieder kleiner wird, musst du die **Luft rauslassen**. Das macht **Optimize-VHD**, im Hyper-V-Manager heißt es **Komprimieren**.

Dabei gibt es Regeln:
- Am besten geht es, wenn niemand gerade mit den Spielsachen spielt (VM **aus**, Datei nur zum **Lesen** geöffnet).
- Wenn es von dem Ballon ein **Foto** (Prüfpunkt) gibt, ist der Ballon eingefroren – erst das Foto wegräumen.
- Es gibt auch eine schnelle Variante, während gespielt wird – die lässt aber nicht ganz so viel Luft raus.

Ein Ballon aus **festem Material** (feste VHDX) war schon von Anfang an voll groß – da kann man nichts rauslassen.

## Merksatz
- Dynamisch **wächst**, **schrumpft nicht** von selbst.
- **Quick/Full/Retrim** ⇒ VHDX **schreibgeschützt eingebunden**.
- **Pretrimmed/Prezeroed** ⇒ **ohne** schreibgeschütztes Einbinden (weniger gründlich).
- Erst **Prüfpunkte weg**, dann komprimieren.

## Prüfungsfalle
- Optimize-VHD funktioniert **nicht** bei **festen** VHDX.
- Für Full/Quick muss die VHDX **schreibgeschützt** eingebunden (oder komplett getrennt) sein – nicht beschreibbar eingebunden.
- Bei vorhandenem Prüfpunkt wird in die .avhdx geschrieben; die Eltern-Datei lässt sich nicht sinnvoll optimieren.
- Standardmodus ist **Quick**, nicht Full.

## Grafik
### Luft aus der VHDX lassen
1. FS01: 300 GB Daten gelöscht, VHDX bleibt 820 GB
2. Admin -> FS01: Prüfpunkt löschen, Zusammenführung abwarten
3. FS01: Optimize-Volume -ReTrim im Gast
4. HV01: Mount-VHD -ReadOnly
5. HV01: Optimize-VHD -Mode Full gibt Blöcke frei
6. HV01: VHDX nur noch ca. 510 GB, D: hat wieder Platz

## Lab
**Nachstellen:** Dynamische VHDX aufblähen, Daten löschen, komprimieren. Maschinen: **HV01**, VM **FS01** mit Daten-VHDX E:.

### GUI
1. **FS01**: Explorer → in E: ca. 20 GB Testdateien erzeugen (z. B. `fsutil file createnew`) → **HV01**: Dateigröße der VHDX notieren.
2. **FS01**: Testdateien löschen, Papierkorb leeren → **HV01**: VHDX-Datei ist kaum kleiner (Fehlerbild).
3. **HV01**: Hyper-V-Manager → FS01 → Prüfpunkte → vorhandene Prüfpunkte **löschen**.
4. **HV01**: FS01 herunterfahren → Aktion → **Datenträger bearbeiten** → FS01-Daten.vhdx → **Komprimieren** → Fertig stellen.
5. **HV01**: Dateigröße erneut prüfen → deutlich kleiner.
6. **HV01**: FS01 starten.

### PowerShell
```powershell
# Auf FS01 – Testdaten erzeugen und wieder löschen
1..4 | ForEach-Object { fsutil file createnew "E:\Test$_.bin" 5368709120 }
Remove-Item E:\Test*.bin
Optimize-Volume -DriveLetter E -ReTrim -Verbose

# Auf HV01 – Größe vorher
Get-VHD "D:\Hyper-V\FS01\FS01-Daten.vhdx" | Select-Object VhdType, FileSize, Size

# Auf HV01 – Prüfpunkte entfernen
Get-VMSnapshot -VMName FS01 | Remove-VMSnapshot

# Auf HV01 – gründlich komprimieren (VM aus)
Stop-VM -Name FS01
Mount-VHD -Path "D:\Hyper-V\FS01\FS01-Daten.vhdx" -ReadOnly
Optimize-VHD -Path "D:\Hyper-V\FS01\FS01-Daten.vhdx" -Mode Full
Dismount-VHD -Path "D:\Hyper-V\FS01\FS01-Daten.vhdx"
Start-VM -Name FS01

# Auf HV01 – Alternative ohne schreibgeschütztes Einbinden (an laufender VM vorher testen)
Optimize-VHD -Path "D:\Hyper-V\FS01\FS01-Daten.vhdx" -Mode Pretrimmed

# Auf HV01 – Größe nachher
Get-VHD "D:\Hyper-V\FS01\FS01-Daten.vhdx" | Select-Object FileSize, Size
```

## Reihenfolge
### Dynamische VHDX komprimieren
1. Alte Prüfpunkte löschen und Zusammenführung abwarten
2. Im Gast Retrim ausführen
3. VM herunterfahren
4. VHDX schreibgeschützt einbinden
5. Optimize-VHD im Modus Full ausführen
6. VHDX trennen und VM starten
7. Dateigröße und freien Host-Speicher kontrollieren

## Szenario
### Kontrollfragen
FS01-Daten.vhdx (dynamisch) ist 820 GB groß, im Gast sind nur 500 GB belegt. Es existiert ein alter Prüfpunkt.
- F: Warum schrumpft die VHDX nicht von selbst? | A: Dynamische VHDX wachsen bei Bedarf, geben Platz aber nicht automatisch vollständig frei.
- F: Was muss vor dem Komprimieren mit dem Prüfpunkt passieren? | A: Prüfpunkt löschen und die Zusammenführung abwarten.
- F: Welche Modi verlangen eine schreibgeschützt eingebundene VHDX? | A: Quick (Standard), Full und Retrim.
- F: Welche Modi brauchen kein schreibgeschütztes Einbinden? | A: Pretrimmed bzw. Prezeroed.
- F: Funktioniert Optimize-VHD bei festen VHDX? | A: Nein, nur bei dynamischen und differenzierenden.

## Legende
### Optimize-VHD
- Was: Cmdlet zum Komprimieren dynamischer und differenzierender VHD/VHDX.
- Wie: Mount-VHD -ReadOnly, Optimize-VHD -Mode Full/Quick, Dismount-VHD; alternativ Pretrimmed/Prezeroed ohne schreibgeschütztes Einbinden.
- Wann: Nach dem Löschen großer Datenmengen im Gast oder bei knappem Host-Speicher.
- Wo: Auf dem Hyper-V-Host bzw. Hyper-V-Manager → Datenträger bearbeiten → Komprimieren.
- Warum: Ungenutzte Blöcke belegen sonst weiter Platz auf dem Host.

## Karteikarten
- F: Schrumpft eine dynamische VHDX automatisch nach dem Löschen von Daten? | A: Nein, nicht vollständig – man muss sie komprimieren.
- F: Welches Cmdlet komprimiert eine VHDX? | A: Optimize-VHD
- F: Welcher Modus ist Standard bei Optimize-VHD? | A: Quick.
- F: Was macht der Modus Full zusätzlich? | A: Er sucht nach Nullblöcken und gibt sie frei.
- F: Welche Modi sind weniger gründlich, setzen aber kein schreibgeschütztes Einbinden voraus? | A: Pretrimmed und Prezeroed.
- F: Wie bindet man eine VHDX schreibgeschützt ein? | A: Mount-VHD -Path Datei.vhdx -ReadOnly
- F: Welche VHDX-Typen lassen sich komprimieren? | A: Dynamische und differenzierende.
- F: Wie heißt die Funktion im Hyper-V-Manager? | A: Datenträger bearbeiten → Komprimieren.

## Quiz
? Welche VHDX-Art lässt sich NICHT mit Optimize-VHD verkleinern?
* Feste Größe
- Dynamisch erweiterbar
- Differenzierend
- Dynamische VHDX ohne Prüfpunkt
! Eine feste VHDX ist von Anfang an voll groß.

? Welcher Modus ist der Standard von Optimize-VHD?
* Quick
- Full
- Retrim
- Prezeroed
! Quick gibt ungenutzte Blöcke frei, ohne Nullblöcke zu suchen.

? Was ist für den Modus Full nötig?
* Die VHDX ist schreibgeschützt eingebunden
- Die VM läuft
- Die VHDX ist eine feste VHDX
- Ein Prüfpunkt existiert
! Mount-VHD -ReadOnly.

? Welcher Modus setzt KEIN schreibgeschütztes Einbinden der VHDX voraus?
* Pretrimmed
- Full
- Quick
- Retrim
! Ebenso Prezeroed – dafür weniger gründlich. Full, Quick und Retrim verlangen eine getrennte oder schreibgeschützt eingebundene VHDX.

? Warum vorher Prüfpunkte löschen?
* Weil die VM sonst in die .avhdx schreibt und die Eltern-VHDX eingefroren ist
- Weil Prüfpunkte die VM verschlüsseln
- Weil Optimize-VHD Prüfpunkte erzeugt
- Weil Prüfpunkte die VM-Version senken
! Erst zusammenführen, dann komprimieren.

? Wie heißt die Funktion im Hyper-V-Manager?
* Datenträger bearbeiten → Komprimieren
- Datenträger überprüfen → Reparieren
- Einstellungen → Integrationsdienste
- Exportieren → Komprimieren
! Der Assistent ruft dieselbe Funktion auf.

? Was hilft im Gast vor dem Komprimieren?
* Optimize-Volume -ReTrim
- chkdsk /f
- ipconfig /flushdns
- sfc /scannow
! Freie Bereiche werden dem Datenträger gemeldet.

? Welche Eigenschaft von Get-VHD zeigt die aktuelle Dateigröße auf dem Host?
* FileSize
- Size
- MinimumSize
- LogicalSectorSize
! Size ist die maximale Größe der virtuellen Platte.
