---
id: az801-leistungsueberwachung
bereich: AZ-801
block: A10
kapitel: Monitoring und Troubleshooting
titel: Leistungsüberwachung und Datensammlersätze
stufe: Profi
quellen: [AZ-801 Study Guide, Microsoft Learn]
verweise: [az801-wac-system-insights, az801-log-analytics, az801-ereignisprotokolle]
---

## Profi

### Werkzeuge
| Werkzeug | Zweck |
|---|---|
| **Task-Manager** | **Schnelle** **Übersicht** **(CPU, RAM, Datenträger, Netzwerk)** |
| **Ressourcenmonitor** (`resmon`) | **Live-Details** **pro Prozess/Datei/Verbindung** |
| **Leistungsüberwachung** (*Performance Monitor*, `perfmon`) | **Leistungsindikatoren** **live** **und** **aufzeichnen** |
| **Datensammlersätze** (*Data Collector Sets*) | **Aufzeichnung** **nach Zeitplan** **mit Bericht** |
| **Windows Admin Center** | **Leistungsdiagramme** **im Browser** |

### Leistungsindikatoren (*Performance Counters*)
Ein **Indikator** **besteht** **aus** **Objekt** **\\** **Zähler** **(Instanz)**, **z. B.** **`Processor(_Total)\% Processor Time`**.

| Ressource | Indikator | Richtwert |
|---|---|---|
| **CPU** | `Processor(_Total)\% Processor Time` | **dauerhaft > 85 % = Engpass** |
| **CPU** | `System\Processor Queue Length` | **> 2 pro Kern** |
| **RAM** | `Memory\Available MBytes` | **< 10 % des RAM** |
| **RAM** | `Memory\Pages/sec` | **dauerhaft > 1000 = Auslagerung** |
| **Datenträger** | `PhysicalDisk\Avg. Disk sec/Read` (**und Write**) | **> 20 ms auffällig** |
| **Datenträger** | `PhysicalDisk\Current Disk Queue Length` | **> 2 pro Spindel** |
| **Datenträger** | `LogicalDisk\% Free Space` | **< 15 %** |
| **Netzwerk** | `Network Interface\Bytes Total/sec` | **> 65 % der Bandbreite** |
| **Netzwerk** | `Network Interface\Output Queue Length` | **> 2** |
| **Hyper-V** | `Hyper-V Hypervisor Logical Processor\% Total Run Time` | **Host-Last** |

### Basislinie (*Baseline*)
**Messung** **im Normalbetrieb** **über Tage/Wochen**. **Vergleich** **zeigt**, **ob** **Werte** **abweichen**. **Ohne Baseline** **keine** **sichere Aussage**.

### Datensammlersätze
| Typ | Erklärung |
|---|---|
| **Benutzerdefiniert** (*User Defined*) | **Eigene** **Indikatoren**, **Ablaufverfolgung**, **Konfiguration** |
| **System** | **Vordefiniert**: **System Diagnostics**, **System Performance** |
| **Startereignis-Ablaufverfolgung** (*Event Trace Sessions*) | **Ab Boot** **(Startprobleme)** |

**Zeitplan**: **Startzeit**, **Dauer**, **Wiederholung**. **Stopp-Bedingung**: **Dauer**, **Größe**. **Ausgabe**: **BLG-Datei** **(binär)** **+** **HTML-Bericht**.

**Warnungen** (*Performance Counter Alerts*): **Schwellenwert** **überschritten** → **Aktion**: **Ereignisprotokoll**, **Task starten**, **anderer Datensammlersatz**.

### Ablauf
1. **Datensammlersatz** **anlegen**.
2. **Indikatoren** **wählen**.
3. **Zeitplan/Speicherort** **festlegen**.
4. **Starten**, **Auslastung erzeugen**.
5. **Bericht** **auswerten**.

### PowerShell / CLI
```powershell
# Auf SRV01 – Live-Werte
Get-Counter '\Processor(_Total)\% Processor Time','\Memory\Available MBytes','\PhysicalDisk(_Total)\Avg. Disk sec/Read' -SampleInterval 2 -MaxSamples 5

# Verfügbare Zählersätze
Get-Counter -ListSet * | Select-Object CounterSetName

# Datensammlersatz mit logman
logman create counter Baseline -c "\Processor(_Total)\% Processor Time" "\Memory\Available MBytes" "\PhysicalDisk(_Total)\Avg. Disk sec/Read" "\Network Interface(*)\Bytes Total/sec" -si 15 -o C:\PerfLogs\Baseline -f bincirc -max 250
logman start Baseline
logman stop Baseline
logman query Baseline

# Log auswerten
Import-Counter C:\PerfLogs\Baseline*.blg | Select-Object -First 3
relog C:\PerfLogs\Baseline_000001.blg -f csv -o C:\PerfLogs\Baseline.csv
```

## Lab
**Maschinen**: **SRV01** (**Server 2022**).

### GUI
1. **SRV01**: **Start → „Leistungsüberwachung“** **öffnen**.
2. **SRV01**: **Datensammlersätze → Benutzerdefiniert → Rechtsklick → Neu → Datensammlersatz**.
3. **SRV01**: **Name „Baseline“** → **„Manuell erstellen (erweitert)“** → **Datenprotokolle: Leistungsindikator**.
4. **SRV01**: **Indikatoren hinzufügen** (**CPU, RAM, Datenträger, Netzwerk**) → **Intervall 15 Sekunden** → **Speicherort C:\PerfLogs**.
5. **SRV01**: **Rechtsklick auf „Baseline“ → Eigenschaften → Zeitplan** **(täglich 08:00, Dauer 8 Stunden)**.
6. **SRV01**: **Rechtsklick → Starten**.
7. **SRV01**: **Berichte → Benutzerdefiniert → Baseline** **öffnen**.
8. **SRV01**: **Neu → Datensammlersatz → Warnung** **mit** **Schwelle „CPU > 85 %“** **→ Aktion „Ereignis protokollieren“**.

## Einfach

**Leistungsüberwachung** **ist** **wie der Gesundheitscheck beim Arzt**: **Puls** (**CPU**), **Blutdruck** (**RAM**), **Gewicht** (**Datenträger**), **Atmung** (**Netzwerk**).

**Baseline** **ist dein Normalwert**: **Wenn dein Puls sonst 60 ist**, **fällt** **80** **auf**. **Wenn** **du** **den Normalwert** **nicht kennst**, **weißt du nicht**, **ob 80** **schlimm ist**.

**Datensammlersatz** **ist ein Langzeit-EKG**: **Es** **läuft** **eine Nacht** **mit** **und** **du** **schaust** **morgens** **den Bericht** **an**.

## Merksatz
- **CPU > 85 %**, **Queue > 2 pro Kern**.
- **Disk-Latenz > 20 ms**.
- **Pages/sec hoch = RAM knapp**.
- **Baseline zuerst**, **dann bewerten**.
- **BLG = Rohdaten**, **HTML = Bericht**.
- **logman** **= perfmon per CLI**.

## Prüfungsfalle
- **Hohe CPU** **allein** **beweist** **keinen** **Engpass** **ohne** **Queue** **und** **Baseline**.
- **Available MBytes** **niedrig** **+** **Pages/sec hoch** **=** **echter RAM-Mangel**.
- **Datensammlersatz** **läuft** **unter** **bestimmtem Konto** **(Rechte** **prüfen)**.
- **Warnung** **≠** **Aufzeichnung** **(Warnung** **löst** **nur** **eine Aktion aus)**.
- **Startereignis-Ablaufverfolgung** **für** **Bootprobleme**.
- **Kreisförmige Aufzeichnung** (`bincirc`) **überschreibt** **alte Daten**.

## Grafik
### Gesundheitscheck
Vier Messgeräte (CPU, RAM, Disk, Netz) mit grünem, gelbem, rotem Bereich.

### Baseline
Kurve über Tage mit Normalband; Ausreißer rot markiert.

### Datensammlersatz
Uhr startet Aufzeichnung nachts, morgens Bericht als Seite.

## Befehle
- `Get-Counter` – Indikatoren live lesen
- `logman create counter` – Datensammlersatz erstellen
- `logman start/stop` – Datensammlersatz steuern
- `Import-Counter` – BLG einlesen
- `relog` – BLG in CSV umwandeln
- `resmon`, `perfmon` – Grafische Werkzeuge

## Karteikarten
- F: Wofür ist perfmon? | A: Leistungsindikatoren live anzeigen und aufzeichnen.
- F: Was ist ein Datensammlersatz? | A: Geplante Aufzeichnung von Indikatoren, Ablaufverfolgung und Konfiguration mit Bericht.
- F: Ab welcher Latenz gilt eine Disk als auffällig? | A: Ab etwa 20 ms.
- F: Wann ist die CPU ein Engpass? | A: Dauerhaft über etwa 85 %.
- F: Was ist eine Baseline? | A: Messung im Normalbetrieb als Vergleichswert.
- F: Welches CLI-Tool erstellt Datensammlersätze? | A: logman.
- F: Welche Dateiendung hat eine Leistungsaufzeichnung? | A: BLG.
- F: Was macht eine Performance Counter Alert? | A: Führt eine Aktion bei Schwellenwertüberschreitung aus.
- F: Wofür Startereignis-Ablaufverfolgung? | A: Für Aufzeichnung während des Bootvorgangs.

## Quiz
? Welcher Wert zeigt Speicherknappheit besonders deutlich?
* Hohe Pages/sec bei niedrigem Available MBytes
- Niedriger Bytes Total/sec
- Hoher freier Speicher
- Niedrige Processor Queue Length

? Womit erstellt man einen Datensammlersatz per CLI?
* logman
- perfcli
- netsh
- wevtutil

? Wozu dient eine Baseline?
* Zum Vergleich mit Normalwerten
- Zur Datensicherung
- Zur Replikation
- Zur Migration

? Ab welcher Latenz sind Datenträger auffällig?
* Etwa 20 ms
- 1 ms
- 2 ms
- 500 ms

? Welchen Typ nutzt man für Bootprobleme?
* Startereignis-Ablaufverfolgung
- Benutzerdefinierter Zählersatz
- Warnung
- Ressourcenmonitor

? Was speichert die Aufzeichnung standardmäßig?
* Eine BLG-Datei
- Eine MSI-Datei
- Eine VHDX-Datei
- Eine XLSX-Datei
