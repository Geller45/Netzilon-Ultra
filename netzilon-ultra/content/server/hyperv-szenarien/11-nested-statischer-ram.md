---
id: server-hvsz-11
bereich: AZ-800
block: HV-S
kapitel: Hyper-V-Praxisszenarien
titel: Szenario 11 – Nested-Host mit Dynamic Memory: innere VMs starten nicht
stufe: Fortgeschritten
fach: Windows Server / AZ-800
pruefungen: [AZ-800, AP2, Schule]
quellen: [Microsoft Learn – Hyper-V]
verweise: [az800-nested, az800-vm-ram, server-hvsz-01, server-hvsz-03, server-hvsz-10]
---

## Profi

### Ticket
**Kunde meldet:** „Im Cluster-Lab startet nur die erste innere VM. Die anderen melden ‚nicht genügend Arbeitsspeicher‘. Dabei hat die äußere VM doch ein Maximum von 32 GB!“
- Datum/Priorität: 06.10.2026, **Priorität 4 (niedrig)** – Lab.
- Betroffene Maschinen: äußere VM **HV-NESTED** auf **HV01.example.com**, innere VMs **NODE1**, **NODE2**, **NODE3**.

### Ausgangslage
- Host **HV01.example.com**, Server 2025, 96 GB RAM.
- **HV-NESTED**: Nested aktiv, **Dynamic Memory**: Start 6 GB, Minimum 2 GB, Maximum 32 GB, IP 192.168.10.50.
- In HV-NESTED: NODE1 bis NODE3 je 4 GB statisch. NODE1 läuft, NODE2/NODE3 starten nicht.

### Analyse
Laut Microsoft-Dokumentation gilt für VMs mit aktiviertem Hyper-V im Gast: Die äußere VM muss **ausgeschaltet** sein, um ihren Arbeitsspeicher anzupassen. **Selbst wenn Dynamic Memory aktiviert ist, schwankt die Speichermenge nicht** – sie bleibt beim **Start-RAM**. Die Laufzeit-Speicheränderung (*runtime memory resize*) schlägt bei statischem RAM ebenfalls fehl.

HV-NESTED sieht also dauerhaft nur **6 GB**. Abzüglich des Bedarfs des Gast-Betriebssystems bleibt Platz für genau **eine** innere VM mit 4 GB.

| Hypothese | Prüfung |
|---|---|
| Dynamic Memory an der äußeren VM, Speicher bleibt beim Start-RAM | `Get-VM HV-NESTED \| Select MemoryAssigned, DynamicMemoryEnabled` auf HV01 |
| Host hat zu wenig frei | `Get-Counter '\Memory\Available MBytes'` auf HV01 |
| Innere VMs zu groß konfiguriert | `Get-VMMemory` in HV-NESTED |
| Freier RAM in HV-NESTED | Task-Manager in HV-NESTED |

**Befund:** MemoryAssigned bleibt bei 6 GB, obwohl Maximum 32 GB.

### Lösungsweg
1. **Innere VMs herunterfahren, dann HV-NESTED herunterfahren** – Begründung: Speicheränderungen an der Nested-VM sind nur offline möglich.
2. **Dynamic Memory deaktivieren** und **statischen RAM** passend setzen: 3 × 4 GB innere VMs + ca. 4 GB für das Gast-OS → **16 GB** – Begründung: Statischer RAM ist planbar und wird beim Start vollständig bereitgestellt.
3. **Prüfen, ob HV01 genug frei hat** – Begründung: 16 GB müssen beim Start der äußeren VM komplett frei sein.
4. **HV-NESTED starten**, danach NODE1–NODE3 – Begründung: Jetzt reicht der Speicher in der äußeren VM.
5. Optional: Innere VMs dürfen ihrerseits Dynamic Memory nutzen (sie selbst sind keine Nested-Hosts).

### Ergebnis prüfen
- `Get-VM HV-NESTED` zeigt **MemoryAssigned 16 GB**, DynamicMemoryEnabled **False**.
- In HV-NESTED: `Get-VM` zeigt NODE1–NODE3 *Running*.

### Vorbeugung
- Nested-Hosts **immer mit statischem RAM** planen (siehe Best Practices in der Microsoft-Doku).
- Speicherbedarf der inneren VMs + Gast-OS dokumentieren.
- Vorlage/Skript für Nested-VMs, das Dynamic Memory explizit deaktiviert.

## Einfach

Stell dir eine **Lunchbox** vor (die äußere VM). In die Lunchbox sollen drei kleinere **Brotdosen** (die inneren VMs).

Normalerweise kann sich eine „dynamische“ Lunchbox **dehnen**, wenn mehr reinmuss. Aber sobald in der Lunchbox selbst wieder Brotdosen stecken (Hyper-V im Gast), **dehnt sie sich nicht mehr**. Sie bleibt genau so groß wie am Anfang (Start-RAM = 6 GB). Da passt nur **eine** Brotdose rein.

Dass auf dem Etikett „bis 32 GB dehnbar“ steht, hilft nichts – die Lunchbox kann es in dieser Situation einfach nicht.

Die Lösung: Lunchbox **ausräumen und zumachen** (VM ausschalten), eine **feste, große Lunchbox** nehmen (statische 16 GB), dann passen alle drei Brotdosen rein.

## Merksatz
- Nested-Host: **Dynamic Memory schwankt nicht** – Speicher bleibt beim Start-RAM.
- Nested-Host = **statischer RAM**, Änderung nur **offline**.
- RAM äußere VM = Summe innere VMs + Gast-OS-Reserve.

## Prüfungsfalle
- Ein hohes **Maximum** nützt einer Nested-VM nichts.
- Auch **Laufzeit-Speicheränderung** bei statischem RAM schlägt bei aktivem Nested fehl.
- Die **inneren** VMs dürfen Dynamic Memory nutzen – die Einschränkung betrifft die **äußere** VM.

## Grafik
### Lunchbox wächst nicht
1. HV01 -> HV-NESTED: Start mit 6 GB Start-RAM
2. HV-NESTED: Hyper-V aktiv – Speicher bleibt bei 6 GB
3. HV-NESTED -> NODE1: 4 GB zugewiesen, startet
4. HV-NESTED -> NODE2: Start abgelehnt, nicht genug RAM
5. Admin -> HV01: HV-NESTED aus, statisch 16 GB
6. HV01 -> HV-NESTED: Start mit 16 GB
7. HV-NESTED -> NODE2, NODE3: Starten erfolgreich

## Lab
**Maschinen**: Host **HV01.example.com**, Nested-VM **HV-NESTED**, innere VMs **NODE1**, **NODE2** (je 2–4 GB).
Nachstellen: Zuerst den Fehler bewusst erzeugen, dann beheben.

### GUI
1. **HV01**: Hyper-V-Manager → HV-NESTED ausschalten → Einstellungen → Arbeitsspeicher → Start 6144 MB, **Dynamischen Arbeitsspeicher aktivieren**, Maximum 32768 MB → OK → Starten (Fehlerzustand).
2. **HV-NESTED**: Hyper-V-Manager → NODE1 starten → läuft; NODE2 starten → Fehlermeldung „nicht genügend Arbeitsspeicher“.
3. **HV01**: Hyper-V-Manager → Spalte **Zugewiesener Speicher** von HV-NESTED → bleibt bei ca. 6 GB.
4. **HV-NESTED**: NODE1 herunterfahren → anschließend **HV01**: HV-NESTED herunterfahren.
5. **HV01**: HV-NESTED → Einstellungen → Arbeitsspeicher → Haken Dynamischer Arbeitsspeicher **entfernen**, RAM **16384 MB** → OK → Starten.
6. **HV-NESTED**: NODE1 und NODE2 starten → beide laufen.

### PowerShell
1. **HV01**: Fehlerkonfiguration setzen.
2. **HV-NESTED**: innere VMs starten und Fehler beobachten.
3. **HV01**: statischen RAM setzen.

```powershell
# Auf HV01 – Fehlerkonfiguration
Stop-VM -Name HV-NESTED
Set-VMMemory -VMName HV-NESTED -DynamicMemoryEnabled $true -StartupBytes 6GB -MinimumBytes 2GB -MaximumBytes 32GB
Start-VM -Name HV-NESTED

# In HV-NESTED – Fehler beobachten
Start-VM -Name NODE1
Start-VM -Name NODE2          # nicht genügend Arbeitsspeicher

# Auf HV01 – Speicher bleibt beim Start-RAM
Get-VM -Name HV-NESTED | Select-Object Name, DynamicMemoryEnabled, MemoryAssigned, MemoryMaximum

# In HV-NESTED – sauber herunterfahren
Stop-VM -Name NODE1

# Auf HV01 – Beheben
Stop-VM -Name HV-NESTED
Set-VMMemory -VMName HV-NESTED -DynamicMemoryEnabled $false -StartupBytes 16GB
Start-VM -Name HV-NESTED

# In HV-NESTED
Start-VM -Name NODE1, NODE2
Get-VM | Format-Table Name, State, MemoryAssigned
```

## Szenario
### Kontrollfragen
HV-NESTED hat Dynamic Memory (Start 6 GB, Maximum 32 GB). Darin startet nur eine von drei inneren VMs mit je 4 GB.
- F: Warum wächst der Speicher von HV-NESTED nicht? | A: Bei aktivem Hyper-V im Gast schwankt der Speicher trotz Dynamic Memory nicht; er bleibt beim Start-RAM.
- F: Welche Konfiguration ist richtig? | A: Statischer RAM in passender Größe (innere VMs plus Reserve für das Gast-OS).
- F: In welchem Zustand muss HV-NESTED für die Änderung sein? | A: Ausgeschaltet.
- F: Dürfen die inneren VMs Dynamic Memory nutzen? | A: Ja, die Einschränkung betrifft die äußere VM mit Hyper-V.
- F: Wie viel RAM ist für drei innere VMs à 4 GB sinnvoll? | A: Etwa 16 GB (12 GB für die inneren VMs plus ca. 4 GB Gast-OS-Reserve).

## Legende
### Speicher bei Nested-Hosts
- Was: Einschränkung, dass eine VM mit Hyper-V im Gast ihren Arbeitsspeicher im Betrieb nicht ändert.
- Wie: statischen RAM per `Set-VMMemory -DynamicMemoryEnabled $false -StartupBytes <Größe>` setzen.
- Wann: bei jeder VM, in der Hyper-V, WSL2 oder Hyper-V-Container laufen sollen.
- Wo: auf dem physischen Host HV01 bei ausgeschalteter äußerer VM.
- Warum: Der innere Hypervisor braucht eine feste Speichermenge; dynamische Anpassung wird in dieser Konstellation nicht ausgeführt.

## Karteikarten
- F: Was passiert mit Dynamic Memory an einer VM mit aktivem Hyper-V im Gast? | A: Der Speicher schwankt nicht, er bleibt beim Start-RAM.
- F: Welche RAM-Art für Nested-Hosts? | A: Statischer Arbeitsspeicher.
- F: Wann darf der RAM einer Nested-VM geändert werden? | A: Nur bei ausgeschalteter VM.
- F: Funktioniert Laufzeit-Speicheränderung bei Nested-VMs? | A: Nein, Änderungsversuche im Betrieb schlagen fehl.
- F: Wie berechnet man den RAM der äußeren VM? | A: Summe der inneren VMs plus Reserve für das Gast-Betriebssystem.
- F: Dürfen innere VMs Dynamic Memory nutzen? | A: Ja.
- F: Cmdlet zum Deaktivieren von Dynamic Memory? | A: Set-VMMemory -VMName HV-NESTED -DynamicMemoryEnabled $false -StartupBytes 16GB
- F: Welche Fehlermeldung zeigen die inneren VMs? | A: Nicht genügend Arbeitsspeicher, um den virtuellen Computer zu starten.

## Quiz
? HV-NESTED hat Dynamic Memory mit Maximum 32 GB. Wie viel RAM sieht der Gast bei aktivem Hyper-V?
* Den Start-RAM, er schwankt nicht
- Immer das konfigurierte Maximum
- Immer das konfigurierte Minimum
- Dynamisch je nach Bedarf bis 32 GB
! So beschreibt es die Microsoft-Doku zur Nested-Virtualisierung.

? Welche Lösung ist richtig?
* HV-NESTED ausschalten, statischen RAM groß genug setzen
- Das Dynamic-Memory-Maximum im Betrieb auf 64 GB erhöhen
- Den Speicherpuffer von HV-NESTED auf 50 % setzen
- Die Speichergewichtung von HV-NESTED auf „Hoch“ setzen
! Dynamische Einstellungen greifen bei Nested-Hosts nicht.

? Wann kann der RAM einer Nested-VM geändert werden?
* Nur im ausgeschalteten Zustand
- Jederzeit im Betrieb
- Nur im gespeicherten Zustand
- Nur bei angehaltenem Zustand
! Laufzeitänderungen schlagen fehl.

? Für welche VM gilt die Einschränkung?
* Für die äußere VM mit Hyper-V im Gast
- Für alle inneren VMs in HV-NESTED
- Für sämtliche VMs auf dem Host HV01
- Nur für Linux-VMs mit Hyper-V-Treibern
! Innere VMs dürfen Dynamic Memory nutzen.

? Wie viel RAM ist für drei innere VMs à 4 GB plus Gast-OS sinnvoll?
* Etwa 16 GB
- Etwa 4 GB
- Etwa 6 GB
- Etwa 12 GB
! 12 GB für die inneren VMs und Reserve für das Gast-OS – 12 GB allein reichen nicht.

? Welches Cmdlet setzt statischen RAM?
* Set-VMMemory -DynamicMemoryEnabled $false -StartupBytes 16GB
- Set-VMProcessor -VMName HV-NESTED -StaticMemory 16GB
- Set-VM -Name HV-NESTED -MemoryType Static -Size 16GB
- Set-VMHost -NumaSpanningEnabled $false -StaticRam $true
! Speicher konfiguriert man mit Set-VMMemory.

? Was gilt für Laufzeit-Speicheränderung bei statischem RAM einer Nested-VM?
* Sie schlägt fehl
- Sie funktioniert ab Konfigurationsversion 8.0
- Sie funktioniert nur bei Gen 1
- Sie ist Voraussetzung für Nested
! Bei aktivem Nested ist Laufzeit-Resize nicht möglich.

? Was muss vor dem Start der vergrößerten HV-NESTED auf HV01 gegeben sein?
* Der neue statische RAM muss frei verfügbar sein
- Ein Prüfpunkt muss existieren
- MAC-Spoofing muss aus sein
- Die erweiterte Sitzung muss aktiv sein
! Start-RAM muss beim Einschalten vollständig frei sein.
