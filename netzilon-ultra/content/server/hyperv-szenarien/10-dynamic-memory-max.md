---
id: server-hvsz-10
bereich: AZ-800
block: HV-S
kapitel: Hyper-V-Praxisszenarien
titel: Szenario 10 – Dynamic Memory: VM bekommt nicht mehr RAM
stufe: Fortgeschritten
fach: Windows Server / AZ-800
pruefungen: [AZ-800, AP2, Schule]
quellen: [Microsoft Learn – Hyper-V]
verweise: [az800-vm-ram, az800-integrationsdienste, server-hvsz-01, server-hvsz-11]
---

## Profi

### Ticket
**Kunde meldet:** „Unser Terminal-/Webserver ist seit Montag extrem langsam. Im Gast sieht man ständig 98 % RAM-Auslastung, obwohl der Host noch reichlich frei hat.“
- Datum/Priorität: 05.10.2026, **Priorität 2 (hoch)**.
- Betroffene Maschine: VM **WEB01** auf **HV01.example.com**.

### Ausgangslage
- Host **HV01.example.com**, Server 2025, 128 GB RAM, davon 40 GB frei.
- WEB01: Server 2022, IP 192.168.10.70, **Dynamic Memory**: Start 2 GB, Minimum 1 GB, **Maximum 4 GB**, Puffer **5 %**, Gewichtung niedrig.
- Seit Montag läuft eine neue Webanwendung mit deutlich mehr Benutzern.

### Analyse
Bei Dynamic Memory verteilt Hyper-V den Speicher anhand des **Speicherbedarfs** (*Memory Demand*) des Gasts plus **Puffer**. Der Gast erhält aber **nie mehr als das Maximum**. Der Hyper-V-Manager zeigt dann **Speicherstatus „Warnung“** bzw. „Niedrig“, und *Speicherbedarf* > *Zugewiesener Speicher*.

| Hypothese | Prüfung |
|---|---|
| **Maximum** erreicht | `Get-VM WEB01 \| Select MemoryAssigned, MemoryDemand, MemoryMaximum, MemoryStatus` |
| **Puffer** zu klein für Lastspitzen | `Get-VMMemory -VMName WEB01` (Buffer) |
| **Gewichtung** niedrig, Host knapp → andere VMs bevorzugt | `Get-VMMemory` (Priority), freier Host-RAM |
| Integrationsdienste/Dynamic-Memory-Treiber im Gast fehlen | `Get-VMIntegrationService`, Gast-Version |
| Gast-Anwendung hat Speicherleck | Task-Manager/Leistungsmonitor im Gast |

**Befund:** MemoryAssigned = 4 GB = Maximum, MemoryDemand ca. 6 GB, Status *Warnung*. Der Host hätte genug frei – die **Obergrenze** bremst.

### Lösungsweg
1. **Maximum erhöhen** (z. B. 12 GB) – Begründung: Das **Maximum darf bei laufender VM erhöht** werden; kein Neustart nötig, Hyper-V fügt Speicher per Hot-Add hinzu.
2. **Puffer erhöhen** (z. B. 20 %, Standardwert) – Begründung: Hyper-V hält zusätzlich zum Bedarf Reserve vor; bei schnellen Lastspitzen muss nicht erst nachgeliefert werden.
3. **Gewichtung (Priority)** für WEB01 auf hoch – Begründung: Bei Speicherknappheit am Host bekommt WEB01 bevorzugt RAM. Bei genug freiem RAM wirkt die Gewichtung nicht.
4. **Integrationsdienste** prüfen – Begründung: Ohne Dynamic-Memory-Unterstützung im Gast kann Hyper-V weder Speicher hinzufügen noch zurückholen (Ballooning).
5. **Ursache Anwendung** prüfen – Begründung: Ein Speicherleck frisst auch das neue Maximum.

### Ergebnis prüfen
- Spalte **Speicherstatus** = *OK*, *Speicherbedarf* < *Zugewiesener Speicher*.
- Im Gast sinkt die Auslastung, Antwortzeiten normal.
- Leistungsindikator **Hyper-V Dynamic Memory VM → Average Pressure** unter ca. 80.

### Vorbeugung
- Maximum realistisch, aber mit Wachstumsreserve planen; regelmäßig `MemoryDemand` auswerten.
- Puffer nicht unter den Standard 20 % senken, außer bei bekannten Gründen.
- Gewichtung für kritische VMs hoch, für Test-VMs niedrig.
- Speicherdruck-Monitoring (Leistungsindikatoren, Admin Center).

## Einfach

Stell dir vor, jede VM hat einen **Futternapf** (Arbeitsspeicher). Bei **Dynamic Memory** füllt der Hausmeister (Hyper-V) den Napf immer nach, wenn das Tier mehr Hunger hat.

Bei WEB01 hat aber jemand auf den Napf geschrieben: „**Höchstens 4 Löffel!**“ (das Maximum). Die Katze hat jetzt Hunger für 6 Löffel, aber der Hausmeister darf nicht mehr geben – obwohl die Futtertonne (der Host) noch voll ist. Die Katze wird schlapp (die VM ist langsam).

Drei Stellschrauben:
- **Maximum**: Wie viel darf maximal in den Napf? → hochsetzen, das geht sogar, während die Katze frisst.
- **Puffer**: Wie viel Extra-Futter liegt immer schon bereit, falls der Hunger plötzlich wächst? → etwas mehr.
- **Gewichtung**: Wer wird zuerst gefüttert, wenn das Futter knapp wird? → WEB01 nach vorne.

Dann ist die Katze wieder satt und schnell.

## Merksatz
- Bedarf > Zugewiesen und Zugewiesen = Maximum → **Maximum erhöhen**.
- Maximum **im Betrieb erhöhen** erlaubt, Minimum im Betrieb **senken** erlaubt.
- **Puffer** = Reserve über dem Bedarf (Standard 20 %).
- **Gewichtung** wirkt nur bei Knappheit.

## Prüfungsfalle
- Die Gewichtung hilft **nicht**, wenn das **Maximum** erreicht ist.
- Das Maximum lässt sich im Betrieb **nicht senken**.
- Dynamic Memory ein-/ausschalten geht nur bei **ausgeschalteter** VM – zum Erhöhen des Maximums ist das nicht nötig.
- Speicherstatus *Warnung* bedeutet: Die VM bekommt weniger, als sie braucht.

## Grafik
### Hungrige VM am Limit
1. WEB01 -> HV01: Speicherbedarf 6 GB gemeldet
2. HV01: Maximum 4 GB erreicht – keine Zuteilung
3. HV01: Speicherstatus Warnung
4. Admin -> HV01: Maximum auf 12 GB und Puffer auf 20 Prozent
5. HV01 -> WEB01: Hot-Add von Speicher bis Bedarf plus Puffer
6. WEB01: Speicherstatus OK, Anwendung schnell

## Lab
**Maschinen**: Host **HV01.example.com**, VM **WEB01** (Windows Server mit Dynamic Memory).
Nachstellen: Zuerst den Fehler bewusst erzeugen, dann beheben.

### GUI
1. **HV01**: Hyper-V-Manager → WEB01 ausschalten → Einstellungen → Arbeitsspeicher → Start 2048 MB, **Dynamischen Arbeitsspeicher aktivieren**, Minimum 1024 MB, **Maximum 3072 MB**, Puffer **5 %**, Gewichtung ganz links → OK → Starten.
2. **WEB01**: Last erzeugen (z. B. mehrere Browser/Anwendungen öffnen oder ein Testtool) → Task-Manager zeigt hohe Auslastung (Fehlerzustand).
3. **HV01**: Hyper-V-Manager → Registerkarte **Arbeitsspeicher** unten bzw. Spalten **Zugewiesener Speicher**, **Speicherbedarf**, **Speicherstatus** beobachten → *Warnung*.
4. **HV01**: WEB01 (läuft) → Einstellungen → Arbeitsspeicher → **Maximum 8192 MB**, Puffer **20 %**, Gewichtung **Hoch** → OK.
5. **HV01**: Spalten erneut beobachten → Zugewiesen steigt, Status *OK*.
6. **WEB01**: Task-Manager → Arbeitsspeicher → mehr installierter RAM sichtbar.

### PowerShell
1. **HV01**: Fehlerkonfiguration setzen.
2. **HV01**: Zustand messen.
3. **HV01**: Im Betrieb korrigieren.

```powershell
# Auf HV01 – Fehlerkonfiguration (VM aus)
Stop-VM -Name WEB01
Set-VMMemory -VMName WEB01 -DynamicMemoryEnabled $true -StartupBytes 2GB -MinimumBytes 1GB -MaximumBytes 3GB -Buffer 5 -Priority 10
Start-VM -Name WEB01

# Auf HV01 – Zustand messen
Get-VM -Name WEB01 | Select-Object Name, MemoryAssigned, MemoryDemand, MemoryMaximum, MemoryStatus
Get-VMMemory -VMName WEB01 | Select-Object Startup, Minimum, Maximum, Buffer, Priority
Get-Counter '\Hyper-V Dynamic Memory VM(WEB01)\Average Pressure'

# Auf HV01 – im laufenden Betrieb korrigieren
Set-VMMemory -VMName WEB01 -MaximumBytes 8GB -Buffer 20 -Priority 80
Get-VM -Name WEB01 | Select-Object Name, MemoryAssigned, MemoryDemand, MemoryStatus
```

## Szenario
### Kontrollfragen
WEB01 nutzt Dynamic Memory mit Maximum 4 GB. Der Bedarf liegt bei 6 GB, der Host hat 40 GB frei.
- F: Woran erkennt man, dass das Maximum bremst? | A: Zugewiesener Speicher = Maximum, Speicherbedarf liegt darüber, Speicherstatus „Warnung“.
- F: Muss WEB01 zum Erhöhen des Maximums ausgeschaltet werden? | A: Nein, das Maximum darf im Betrieb erhöht werden.
- F: Was bewirkt der Speicherpuffer? | A: Hyper-V weist zusätzlich zum Bedarf einen Prozentsatz als Reserve zu (Standard 20 %).
- F: Warum hilft eine höhere Gewichtung hier allein nicht? | A: Gewichtung wirkt nur bei Speicherknappheit des Hosts; das Problem ist die Obergrenze.
- F: Welcher Leistungsindikator zeigt Speicherdruck? | A: Hyper-V Dynamic Memory VM → Average Pressure (über 100 = zu wenig).

## Reihenfolge
### Speicherengpass bei Dynamic Memory lösen
1. Zugewiesen, Bedarf und Status vergleichen
2. Maximum, Puffer und Gewichtung auslesen
3. Maximum im Betrieb erhöhen
4. Puffer anpassen
5. Gewichtung für kritische VM erhöhen
6. Status und Speicherdruck erneut prüfen

## Legende
### Speicherpuffer und Gewichtung
- Was: Puffer = Prozentsatz, den Hyper-V zusätzlich zum Bedarf zuweist; Gewichtung = Priorität einer VM bei Speicherknappheit.
- Wie: Einstellungen → Arbeitsspeicher bzw. `Set-VMMemory -Buffer <%> -Priority <0-100>`.
- Wann: wenn VMs Lastspitzen haben oder mehrere VMs um RAM konkurrieren.
- Wo: in der Konfiguration der VM auf HV01, im Betrieb änderbar.
- Warum: Puffer verhindert Engpässe bei plötzlichem Bedarf, Gewichtung sorgt dafür, dass wichtige VMs zuerst versorgt werden.

## Karteikarten
- F: Woran erkennt man eine VM am Dynamic-Memory-Limit? | A: Zugewiesen = Maximum, Bedarf größer, Speicherstatus „Warnung“.
- F: Darf das Maximum im Betrieb erhöht werden? | A: Ja.
- F: Darf das Minimum im Betrieb erhöht werden? | A: Nein, im Betrieb nur senken.
- F: Standardwert des Speicherpuffers? | A: 20 %.
- F: Wann wirkt die Speichergewichtung? | A: Nur wenn der Host nicht alle Anforderungen erfüllen kann.
- F: Mit welcher Technik gibt der Gast Speicher zurück? | A: Ballooning über den Dynamic-Memory-Treiber der Integrationsdienste.
- F: Wie wird Speicher im Betrieb hinzugefügt? | A: Per Hot-Add.
- F: Cmdlet zum Ändern von Maximum, Puffer und Gewichtung? | A: Set-VMMemory -VMName WEB01 -MaximumBytes 8GB -Buffer 20 -Priority 80
- F: Was bedeutet Average Pressure über 100? | A: Die VM hat weniger Speicher als benötigt.

## Quiz
? WEB01: Zugewiesen 4 GB, Maximum 4 GB, Bedarf 6 GB. Was hilft?
* Maximum erhöhen
- Gewichtung erhöhen
- Minimum erhöhen
- Smart Paging aktivieren
! Die Obergrenze verhindert jede weitere Zuteilung.

? Welche Änderung ist im laufenden Betrieb erlaubt?
* Maximum erhöhen
- Maximum senken
- Dynamic Memory abschalten
- Minimum erhöhen
! Erlaubt sind Maximum erhöhen, Minimum senken, Puffer und Gewichtung ändern.

? Was ist der Standardwert für den Speicherpuffer?
* 20 %
- 5 %
- 50 %
- 0 %
! Hyper-V hält standardmäßig 20 % über dem Bedarf vor.

? Wann wirkt die Speichergewichtung?
* Bei Speicherknappheit des Hosts
- Immer beim Start jeder VM
- Nur bei VMs mit statischem RAM
- Nur in Failover-Clustern
! Bei genug freiem RAM bekommen alle VMs ihren Bedarf.

? Welcher Speicherstatus zeigt einen Engpass?
* Warnung
- OK
- Wird ausgeführt
- Gespeichert
! Warnung bzw. Niedrig zeigen zu wenig zugewiesenen Speicher.

? Welche Komponente gibt im Gast Speicher an den Host zurück?
* Dynamic-Memory-Treiber per Ballooning
- Der Taktdienst
- Die Auslagerungsdatei des Hosts
- Der VSS-Writer
! Der Treiber gehört zu den Integrationsdiensten.

? Welcher Befehl erhöht das Maximum auf 8 GB?
* Set-VMMemory -VMName WEB01 -MaximumBytes 8GB
- Set-VM -Name WEB01 -MemoryMaximumBytes 8GB -Restart
- Set-VMHost -MaximumMemory 8GB
- Resize-VMMemory -VMName WEB01 -Size 8GB
! Speicherwerte setzt man mit Set-VMMemory.

? Der Host hat kaum noch freien RAM. Welche Einstellung sorgt dafür, dass WEB01 bevorzugt wird?
* Hohe Speichergewichtung
- Niedriger Puffer
- Hohe Startpriorität bei der automatischen Startaktion
- Deaktivierte Zeitsynchronisierung
! Die Gewichtung bestimmt die Verteilung bei Knappheit.
