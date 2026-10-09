---
id: server-hvsz-29
bereich: AZ-800
block: HV-S
kapitel: Hyper-V-Praxisszenarien
titel: Szenario 29 – Eine VM bremst alle aus: CPU-Reserve, Limit, Gewichtung
stufe: Fortgeschritten
fach: Windows Server / AZ-800
pruefungen: [AZ-800, AP2, Schule]
quellen: [Microsoft Learn – Hyper-V]
verweise: [az800-cpu-gruppen, az801-leistungsueberwachung, server-hvsz-30, server-hvsz-34]
---

## Profi

### Ticket
**Kunde meldet:** „Jeden Nachmittag wird unser ERP-System extrem langsam. Die Entwickler sagen, ihr Build-Server läuft zur gleichen Zeit.“
- **Priorität:** hoch (produktive Anwendung betroffen)
- **Betroffene Maschinen:** **BUILD01** (Verursacher), **ERP01** (Opfer) auf **HV01**

### Ausgangslage
- Host **HV01.example.com**, Server 2025, 16 physische Kerne (32 logische Prozessoren)
- VMs: **ERP01** (8 vCPU, 192.168.10.30), **BUILD01** (16 vCPU, 192.168.10.40), weitere kleine VMs
- Der Build läuft täglich ab 14 Uhr und lastet alle 16 vCPU voll aus.

### Analyse
- Leistungsüberwachung auf HV01: Zähler **Hyper-V Hypervisor Logical Processor\% Total Run Time** nahe 100 %; **Hyper-V Hypervisor Virtual Processor\% Guest Run Time** zeigt BUILD01 als Hauptverbraucher. (Der Task-Manager im Host zeigt die Gastlast **nicht** richtig, weil die Root-Partition selbst auch nur eine Partition ist.)
- Hyper-V bietet pro VM eine **Ressourcensteuerung** (Resource Control) für die CPU:
  - **Reserve** (`-Reserve`, Prozent): garantierter Anteil, der der VM immer zur Verfügung steht.
  - **Grenze/Limit** (`-Maximum`, Prozent): maximaler Anteil, den die VM nutzen darf.
  - **Relative Gewichtung** (`-RelativeWeight`, 1–10000, Standard 100): entscheidet bei Konkurrenz, wer zuerst Rechenzeit bekommt.
- Die Prozentwerte beziehen sich auf die **zugewiesenen virtuellen Prozessoren** der VM; der Hyper-V-Manager zeigt zusätzlich den Anteil an der gesamten Systemressource an.

### Lösungsweg
1. **Messen** mit Leistungsindikatoren bzw. `Measure-VM` (Ressourcenmessung). *Begründung:* Erst Beweise, dann Eingriff.
2. **BUILD01 begrenzen:** `-Maximum 50`. *Begründung:* Der Build darf nie mehr als die Hälfte seiner vCPU-Kapazität nutzen; er dauert länger, stört aber niemanden.
3. **BUILD01 geringer gewichten:** `-RelativeWeight 50`. *Begründung:* Wenn trotzdem Konkurrenz entsteht, bekommt BUILD01 nachrangig CPU-Zeit.
4. **ERP01 bevorzugen:** `-RelativeWeight 200` und `-Reserve 25`. *Begründung:* Die Reserve garantiert ERP01 eine Grundleistung; die Gewichtung bevorzugt sie bei Engpässen.
5. **Reserve nicht übertreiben.** *Begründung:* Reservierte Kapazität fehlt anderen; ist die Summe zu hoch, starten weitere VMs nicht mehr.
6. Optional organisatorisch: Build in die Nacht verlegen.

### Ergebnis prüfen
- `Get-VMProcessor -VMName ERP01, BUILD01 | Format-Table VMName, Count, Reserve, Maximum, RelativeWeight`
- Am nächsten Nachmittag: Antwortzeit ERP01 normal, Leistungsindikator der BUILD01-vCPUs bei ≤ 50 %.
- `Measure-VM -VMName BUILD01` → Durchschnittliche CPU-Nutzung (MHz) gesunken.

### Vorbeugung
- Feste Richtlinie: Test-/Build-VMs immer mit Limit und niedriger Gewichtung, Produktion mit höherer Gewichtung.
- **Ressourcenmessung** dauerhaft aktivieren (`Enable-VMResourceMetering`) und monatlich auswerten.
- Nicht mehr vCPUs zuweisen als nötig – viele vCPUs erhöhen den Planungsaufwand des Hypervisors.

## Einfach
Stell dir eine Familie mit nur **einem Badezimmer** vor. Der große Bruder (BUILD01) duscht jeden Nachmittag eine Stunde lang – und alle anderen müssen warten. Die Mutter (ERP01) muss aber dringend zur Arbeit!

Hyper-V hat drei Regeln, wie man das löst:
- **Grenze (Limit):** „Du darfst höchstens die Hälfte der Zeit im Bad sein.“
- **Reserve:** „Mama bekommt immer mindestens ein Viertel der Zeit, egal was passiert.“
- **Gewichtung:** „Wenn zwei gleichzeitig wollen, darf der mit der höheren Zahl zuerst.“

Mit diesen Regeln ist es im Bad viel fairer. Der Bruder duscht vielleicht etwas länger insgesamt, aber die Mutter kommt pünktlich zur Arbeit.

Wichtig: Wenn man **allen** eine große Reserve gibt, passt das nicht mehr in den Tag – dann bekommt am Ende jemand gar keinen Platz mehr. Deshalb Reserven sparsam vergeben.

## Merksatz
- **Reserve** = garantiert, **Maximum** = Deckel, **Gewichtung** = Vorfahrt.
- Gewichtung: **1–10000**, Standard **100**.
- Prozent beziehen sich auf die **vCPUs der VM**.
- Erst messen (Hyper-V-Zähler), dann drosseln.

## Prüfungsfalle
- Der **Task-Manager des Hosts** zeigt die Last der VMs nicht zuverlässig – Hyper-V-Hypervisor-Leistungsindikatoren verwenden.
- Die **relative Gewichtung** wirkt nur bei **Konkurrenz**; ohne Engpass darf jede VM bis zu ihrem Maximum rechnen.
- Zu hohe Reserven können den Start weiterer VMs verhindern.
- Die Anzahl der vCPUs (`-Count`) ist etwas anderes als die Ressourcensteuerung.

## Grafik
### CPU-Vorfahrt am Nachmittag
1. BUILD01 -> HV01: fordert 100 % von 16 vCPU an
2. ERP01 -> HV01: Anfragen stauen sich, ERP langsam
3. Admin -> BUILD01: Maximum 50 %, RelativeWeight 50
4. Admin -> ERP01: Reserve 25 %, RelativeWeight 200
5. HV01 -> ERP01: bekommt bei Konkurrenz Vorrang
6. ERP01: Antwortzeiten wieder normal

## Lab
**Nachstellen:** Last in einer VM erzeugen, Wirkung der Ressourcensteuerung beobachten. Maschinen: **HV01**, VMs **BUILD01** und **ERP01** (je 2 vCPU genügen).

### GUI
1. **BUILD01**: PowerShell als Lasttest – mehrere Endlosschleifen starten (siehe PowerShell), Task-Manager zeigt 100 %.
2. **HV01**: Leistungsüberwachung → Leistungsindikator hinzufügen → **Hyper-V Hypervisor Virtual Processor** → „% Guest Run Time“ → Instanzen BUILD01 und ERP01.
3. **HV01**: Hyper-V-Manager → BUILD01 → Einstellungen → **Prozessor** → „Grenze für virtuellen Computer (Prozentsatz)“ = 50, „Relative Gewichtung“ = 50 → OK.
4. **HV01**: Leistungsüberwachung → Kurve von BUILD01 sinkt auf ca. 50 %.
5. **HV01**: ERP01 → Einstellungen → Prozessor → „Reserve für virtuellen Computer (Prozentsatz)“ = 25, „Relative Gewichtung“ = 200 → OK.
6. **BUILD01**: Lastschleifen beenden.

### PowerShell
```powershell
# Auf BUILD01 – Last erzeugen (je logischem Prozessor ein Job)
1..$env:NUMBER_OF_PROCESSORS | ForEach-Object { Start-Job { while ($true) { } } }

# Auf HV01 – Messung
Enable-VMResourceMetering -VMName BUILD01, ERP01
Get-Counter "\Hyper-V Hypervisor Virtual Processor(*)\% Guest Run Time" -SampleInterval 2 -MaxSamples 3

# Auf HV01 – Ressourcensteuerung setzen
Set-VMProcessor -VMName BUILD01 -Maximum 50 -RelativeWeight 50
Set-VMProcessor -VMName ERP01 -Reserve 25 -RelativeWeight 200
Get-VMProcessor -VMName BUILD01, ERP01 | Format-Table VMName, Count, Reserve, Maximum, RelativeWeight

# Auf HV01 – Auswertung
Measure-VM -VMName BUILD01, ERP01

# Auf BUILD01 – Last beenden
Get-Job | Stop-Job; Get-Job | Remove-Job
```

## Szenario
### Kontrollfragen
BUILD01 (16 vCPU) lastet HV01 jeden Nachmittag aus, ERP01 wird langsam. Beide stehen auf Standardwerten der Ressourcensteuerung.
- F: Welche Einstellung deckelt den CPU-Verbrauch von BUILD01? | A: Grenze/Maximum, z. B. Set-VMProcessor -VMName BUILD01 -Maximum 50.
- F: Welche Einstellung garantiert ERP01 eine Mindestleistung? | A: Reserve (Set-VMProcessor -Reserve).
- F: Welchen Standardwert hat die relative Gewichtung? | A: 100 (Bereich 1–10000).
- F: Warum nicht den Task-Manager des Hosts zur Analyse nutzen? | A: Er zeigt die Gastlast nicht zuverlässig; besser Hyper-V-Hypervisor-Leistungsindikatoren.
- F: Wann wirkt die relative Gewichtung? | A: Nur wenn mehrere VMs gleichzeitig um CPU-Zeit konkurrieren.

## Legende
### CPU-Ressourcensteuerung
- Was: Reserve, Maximum und relative Gewichtung für die virtuellen Prozessoren einer VM.
- Wie: Set-VMProcessor -Reserve/-Maximum (Prozent) und -RelativeWeight (1–10000).
- Wann: Wenn einzelne VMs andere verdrängen oder wichtige VMs Garantien brauchen.
- Wo: Hyper-V-Manager → VM-Einstellungen → Prozessor.
- Warum: Faire, planbare CPU-Verteilung auf einem gemeinsam genutzten Host.

## Karteikarten
- F: Was bedeutet die CPU-Reserve einer VM? | A: Garantierter Prozentsatz ihrer vCPU-Kapazität.
- F: Was bedeutet die Grenze (Maximum)? | A: Höchster Prozentsatz, den die VM nutzen darf.
- F: Wertebereich der relativen Gewichtung? | A: 1 bis 10000, Standard 100.
- F: Worauf beziehen sich die Prozentwerte? | A: Auf die der VM zugewiesenen virtuellen Prozessoren.
- F: Welcher Leistungsindikator zeigt die Gast-CPU-Last? | A: Hyper-V Hypervisor Virtual Processor\% Guest Run Time.
- F: Cmdlet für die Ressourcensteuerung? | A: Set-VMProcessor -VMName VM -Reserve 25 -Maximum 50 -RelativeWeight 200
- F: Wie misst man den Verbrauch einer VM über Zeit? | A: Enable-VMResourceMetering und Measure-VM.
- F: Welches Risiko bergen zu hohe Reserven? | A: Weitere VMs können nicht mehr starten, Kapazität ist blockiert.

## Quiz
? Welche Einstellung garantiert einer VM eine Mindest-CPU-Leistung?
* Reserve
- Maximum
- Relative Gewichtung
- Anzahl virtueller Prozessoren
! Die Reserve wird der VM immer freigehalten.

? Welche Einstellung verhindert, dass eine VM mehr als die Hälfte ihrer vCPU-Kapazität nutzt?
* Maximum = 50
- Reserve = 50
- RelativeWeight = 50
- Count = 50
! Das Maximum ist der Deckel.

? Welcher Standardwert gilt für die relative Gewichtung?
* 100
- 1
- 1000
- 10000
! Bereich 1–10000.

? Wann wirkt die relative Gewichtung?
* Wenn VMs gleichzeitig um CPU-Zeit konkurrieren
- Nur beim Start der VM und danach nicht mehr
- Nur bei ausgeschalteter VM als Startvorgabe
- Nur während einer laufenden Live-Migration
! Ohne Konkurrenz gibt es nichts zu verteilen.

? Womit erkennst du zuverlässig, welche VM die Host-CPU belastet?
* Hyper-V-Hypervisor-Leistungsindikatoren
- Task-Manager des Hosts
- Ereignisanzeige System-Protokoll
- ipconfig /all
! Der Host selbst ist nur die Root-Partition, sein Task-Manager zeigt die Gäste nicht korrekt.

? Mit welchem Cmdlet setzt du Limit und Gewichtung?
* Set-VMProcessor
- Set-VMMemory
- Set-VMHost
- Set-VMNetworkAdapter
! Die CPU-Ressourcensteuerung gehört zum virtuellen Prozessor.

? Was liefert Measure-VM?
* Verbrauchsdaten (CPU, RAM, Datenträger, Netz)
- Die Kompatibilität der VM zum Zielhost einer Migration
- Die Konfigurationsversion und Generation der VM
- Die NUMA-Topologie und Sockelanzahl des Hosts
! Voraussetzung: Enable-VMResourceMetering.

? Welche Kombination passt für eine niedrig priorisierte Build-VM?
* Maximum 50, RelativeWeight 50
- Reserve 100, RelativeWeight 10000
- Reserve 50, Maximum 100
- RelativeWeight 1000, keine Grenze
! Deckel plus geringe Gewichtung schützt die anderen VMs.
