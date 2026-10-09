---
id: server-hvsz-28
bereich: AZ-800
block: HV-S
kapitel: Hyper-V-Praxisszenarien
titel: Szenario 28 – Live-Migration scheitert: unterschiedliche CPU-Generationen
stufe: Fortgeschritten
fach: Windows Server / AZ-800
pruefungen: [AZ-800, AZ-801, AP2, Schule]
quellen: [Microsoft Learn – Hyper-V]
verweise: [az800-cpu-gruppen, az801-failover-cluster, az801-cau-rolling-upgrade, server-hvsz-29]
---

## Profi

### Ticket
**Kunde meldet:** „Wir wollen HV01 heute Abend warten und die Webserver-VM vorher auf den neuen HV02 verschieben. Die Live-Migration bricht aber mit einer Meldung über Prozessorfunktionen ab.“
- **Priorität:** mittel (Wartung blockiert)
- **Betroffene Maschine:** VM **WEB01** auf **HV01**, Ziel **HV02**

### Ausgangslage
- **HV01.example.com**: Server 2025, Intel Xeon älterer Generation, IP 192.168.10.11
- **HV02.example.com**: Server 2025, Intel Xeon neuerer Generation, IP 192.168.10.12
- Live-Migration zwischen beiden Hosts ist eingerichtet (Kerberos, Migrationsnetz 10.0.50.0/24).
- VM **WEB01** (Gen 2, 4 vCPU, 8 GB) läuft auf HV01.
- Fehlermeldung sinngemäß: Die VM verwendet prozessorspezifische Features, die auf dem Zielcomputer nicht unterstützt werden.

### Analyse
- Beim Start einer VM sieht der Gast den **Befehlssatz** (CPU-Features) des Hosts. Bei der **Live-Migration** läuft das Gast-OS weiter – es darf auf dem Ziel **kein Feature verschwinden**, das der Gast bereits nutzt.
- Ältere → neuere CPU klappt oft, aber der umgekehrte Weg (oder unterschiedliche Feature-Sätze) scheitert.
- `Compare-VM -Name WEB01 -DestinationHost HV02` listet die Inkompatibilitäten vor der Migration auf.
- Lösung: **Prozessorkompatibilitätsmodus** (Processor Compatibility). Die VM sieht dann nur einen eingeschränkten Feature-Satz, der auf beiden Hosts vorhanden ist.
- Grenze: Der Modus funktioniert nur zwischen CPUs **desselben Herstellers** (Intel ↔ Intel bzw. AMD ↔ AMD), **nicht** Intel ↔ AMD.
- Windows Server 2025 bietet zusätzlich den **dynamischen Prozessorkompatibilitätsmodus**: Mit `-CompatibilityForMigrationMode CommonClusterFeatureSet` wird der gemeinsame Feature-Satz der Cluster-Knoten verwendet statt eines festen Minimalsatzes (`MinimumFeatureSet`) – dadurch gehen weniger Funktionen verloren.

### Lösungsweg
1. **Wartungsfenster für WEB01** vereinbaren. *Begründung:* Die Einstellung lässt sich nur bei **ausgeschalteter VM** ändern.
2. WEB01 **herunterfahren**. *Begründung:* siehe Schritt 1.
3. **Prozessorkompatibilität aktivieren:** `Set-VMProcessor -VMName WEB01 -CompatibilityForMigrationEnabled $true`. *Begründung:* Die VM sieht nur noch Features, die beide Hosts beherrschen.
4. WEB01 **starten** und `Compare-VM` erneut ausführen. *Begründung:* Vor der eigentlichen Migration nachweisen, dass keine Inkompatibilität mehr gemeldet wird.
5. **Live-Migration** auf HV02 durchführen. *Begründung:* Jetzt ohne Ausfallzeit möglich.
6. Leistung beobachten. *Begründung:* Rechenintensive Software (Verschlüsselung, Video, KI) kann auf moderne Befehlssätze verzichten müssen.

### Ergebnis prüfen
- `Get-VMProcessor -VMName WEB01 | Select CompatibilityForMigrationEnabled` → True
- `Get-VM -Name WEB01 -ComputerName HV02` → Running auf HV02
- Webseite war während der Migration erreichbar (Dauerping/Browser).

### Vorbeugung
- Hosts im selben Verbund möglichst mit **gleicher CPU-Generation** beschaffen.
- Bei gemischter Hardware Kompatibilitätsmodus schon bei der **VM-Erstellung** aktivieren (in die Vorlage aufnehmen).
- In Server-2025-Clustern den Modus **CommonClusterFeatureSet** prüfen.
- Vor jeder geplanten Migration `Compare-VM` ausführen.

## Einfach
Stell dir vor, ein Koch arbeitet in einer neuen Hightech-Küche. Er benutzt dort einen tollen Spezial-Mixer. Mitten beim Kochen soll er – ohne den Topf vom Herd zu nehmen – in eine ältere Küche umziehen. Dort gibt es den Spezial-Mixer aber nicht! Das Rezept geht kaputt.

Genau das passiert bei der Live-Migration: Die VM „kocht weiter“, während sie umzieht. Wenn sie auf dem alten Host Werkzeuge (CPU-Funktionen) benutzt hat, die der neue Host nicht hat, bricht der Umzug ab.

Die Lösung heißt **Prozessorkompatibilität**: Wir sagen dem Koch von Anfang an: „Benutze nur Werkzeuge, die es in **beiden** Küchen gibt.“ Dann klappt der Umzug immer. Der Nachteil: Den Spezial-Mixer darf er nie benutzen, auch wenn er da ist – manche Rezepte dauern dann etwas länger.

Wichtig: Das klappt nur zwischen Küchen derselben Marke. Von einer Intel-Küche in eine AMD-Küche kann man **nicht** live umziehen.

## Merksatz
- **Gleicher Hersteller** ja, Intel ↔ AMD nein.
- Kompatibilitätsmodus = **kleinster gemeinsamer Nenner** der CPU-Features.
- Einschalten nur bei **VM aus**.
- Erst `Compare-VM`, dann migrieren.

## Prüfungsfalle
- Prozessorkompatibilität ermöglicht **keine** Migration zwischen Intel und AMD.
- Der Parameter heißt `-CompatibilityForMigrationEnabled` (bei `Set-VMProcessor`), nicht bei `Set-VM`.
- Die Einstellung ist bei laufender VM **nicht** änderbar.
- Kompatibilitätsmodus kann Leistung kosten, weil neue Befehlssatzerweiterungen ausgeblendet werden.

## Grafik
### Migration mit Kompatibilitätsmodus
1. HV01 -> HV02: Live-Migration WEB01 startet
2. HV02 -> HV01: Fehler – CPU-Features fehlen auf dem Ziel
3. Admin -> WEB01: herunterfahren, CompatibilityForMigrationEnabled = True
4. WEB01: startet mit reduziertem CPU-Feature-Satz
5. HV01 -> HV02: Compare-VM ohne Inkompatibilität
6. HV01 -> HV02: Live-Migration erfolgreich, WEB01 läuft weiter

## Lab
**Nachstellen:** Ohne echte unterschiedliche CPUs zeigt `Compare-VM` die Inkompatibilität nicht immer – das Lab übt daher die Konfiguration und Prüfung. Maschinen: **HV01**, **HV02** (gleiche Domäne), VM **WEB01**.

### GUI
1. **HV01**: Hyper-V-Manager → WEB01 → Verschieben → „Virtuellen Computer verschieben“ → Ziel HV02 (Fehlerfall beobachten bzw. Meldung lesen).
2. **HV01**: WEB01 → Herunterfahren.
3. **HV01**: WEB01 → Einstellungen → Prozessor → **Kompatibilität** → Haken „Zu einem physischen Computer mit einer anderen Prozessorversion migrieren“ → OK.
4. **HV01**: WEB01 → Starten.
5. **HV01**: WEB01 → Verschieben → Ziel **HV02** → Fertig stellen.
6. **HV02**: Hyper-V-Manager → WEB01 läuft.

### PowerShell
```powershell
# Auf HV01 – Prüfung vor der Migration
Compare-VM -Name WEB01 -DestinationHost HV02.example.com | Select-Object -ExpandProperty Incompatibilities

# Auf HV01 – Kompatibilitätsmodus einschalten (VM muss aus sein)
Stop-VM -Name WEB01
Set-VMProcessor -VMName WEB01 -CompatibilityForMigrationEnabled $true
# Server 2025 im Cluster: gemeinsamer Feature-Satz der Knoten
# Set-VMProcessor -VMName WEB01 -CompatibilityForMigrationEnabled $true -CompatibilityForMigrationMode CommonClusterFeatureSet
Start-VM -Name WEB01

# Auf HV01 – erneut prüfen und migrieren
Compare-VM -Name WEB01 -DestinationHost HV02.example.com
Move-VM -Name WEB01 -DestinationHost HV02.example.com -IncludeStorage -DestinationStoragePath "D:\Hyper-V\WEB01"

# Auf HV02 – Kontrolle
Get-VM -Name WEB01
Get-VMProcessor -VMName WEB01 | Select-Object VMName, CompatibilityForMigrationEnabled
```

## Szenario
### Kontrollfragen
WEB01 läuft auf HV01 (ältere Intel-CPU) und soll live auf HV02 (neuere Intel-CPU) verschoben werden. Die Migration meldet fehlende Prozessorfunktionen.
- F: Welche VM-Einstellung löst das Problem? | A: Prozessorkompatibilitätsmodus – Set-VMProcessor -CompatibilityForMigrationEnabled $true.
- F: In welchem Zustand muss WEB01 dafür sein? | A: Ausgeschaltet.
- F: Mit welchem Cmdlet prüfst du vorab die Kompatibilität? | A: Compare-VM -Name WEB01 -DestinationHost HV02
- F: Funktioniert das auch zwischen HV01 (Intel) und einem AMD-Host? | A: Nein, nur zwischen CPUs desselben Herstellers.
- F: Welcher Nachteil entsteht? | A: Neuere Befehlssatzerweiterungen sind im Gast nicht sichtbar, was Leistung kosten kann.

## Legende
### Prozessorkompatibilitätsmodus
- Was: VM-Einstellung, die den sichtbaren CPU-Feature-Satz auf einen gemeinsamen Nenner reduziert.
- Wie: Set-VMProcessor -CompatibilityForMigrationEnabled $true, in Server 2025 optional -CompatibilityForMigrationMode.
- Wann: Bei Migration zwischen Hosts mit unterschiedlicher CPU-Generation desselben Herstellers.
- Wo: Auf dem Host in den VM-Einstellungen unter Prozessor → Kompatibilität.
- Warum: Damit ein laufendes Gast-OS beim Umzug keine bereits genutzten CPU-Funktionen verliert.

## Karteikarten
- F: Warum scheitert eine Live-Migration zwischen unterschiedlichen CPU-Generationen? | A: Der Gast nutzt CPU-Features des Quellhosts, die auf dem Zielhost fehlen.
- F: Cmdlet zum Aktivieren der Prozessorkompatibilität? | A: Set-VMProcessor -VMName VM -CompatibilityForMigrationEnabled $true
- F: Zwischen welchen Herstellern funktioniert der Modus? | A: Nur innerhalb desselben Herstellers (Intel–Intel, AMD–AMD).
- F: Welchen Zustand muss die VM beim Umschalten haben? | A: Ausgeschaltet.
- F: Welches Cmdlet prüft die Migrationsfähigkeit vorab? | A: Compare-VM
- F: Was bringt CommonClusterFeatureSet in Server 2025? | A: Die VM nutzt den gemeinsamen Feature-Satz aller Cluster-Knoten statt eines festen Minimalsatzes.
- F: Wo findet man die Einstellung im Hyper-V-Manager? | A: VM-Einstellungen → Prozessor → Kompatibilität.
- F: Welcher Nachteil entsteht durch den Kompatibilitätsmodus? | A: Neue Befehlssätze sind ausgeblendet, rechenintensive Software kann langsamer laufen.

## Quiz
? Welcher Parameter aktiviert die Prozessorkompatibilität?
* Set-VMProcessor -CompatibilityForMigrationEnabled $true
- Set-VMProcessor -ExposeVirtualizationExtensions $true
- Set-VMHost -VirtualMachineMigrationEnabled $true
- Set-VM -Name APP01 -ProcessorCompatibility On -Force
! Die Einstellung gehört zum virtuellen Prozessor der VM.

? Zwischen welchen Hosts hilft der Prozessorkompatibilitätsmodus NICHT?
* Intel-Host und AMD-Host
- Zwei Intel-Hosts verschiedener Generation
- Zwei AMD-Hosts verschiedener Generation
- Zwei identische Intel-Hosts
! Herstellerwechsel ist mit Live-Migration nicht möglich.

? Wann kann der Kompatibilitätsmodus geändert werden?
* Nur wenn die VM ausgeschaltet ist
- Jederzeit im laufenden Betrieb
- Nur während einer Live-Migration
- Nur bei pausierter VM
! Der Gast muss mit dem reduzierten Feature-Satz neu starten.

? Welches Cmdlet zeigt Inkompatibilitäten vor der Migration?
* Compare-VM
- Test-VMReplicationConnection
- Measure-VM
- Get-VMHostSupportedVersion
! Compare-VM liefert einen Bericht mit Incompatibilities.

? Was bewirkt der Modus technisch?
* Der Gast sieht nur CPU-Funktionen beider Hosts
- Die VM wird dauerhaft auf eine einzige vCPU begrenzt
- Die CPU wird vollständig in Software emuliert
- Der Host taktet seine physische CPU herunter
! Es werden erweiterte Befehlssätze ausgeblendet, die nicht auf beiden Hosts vorhanden sind.

? Welche Neuerung bringt Windows Server 2025 dazu?
* Dynamischer Modus mit gemeinsamem Feature-Satz der Cluster-Knoten
- Live-Migration zwischen Intel- und AMD-Hosts im selben Cluster
- Umschalten des Kompatibilitätsmodus ohne Neustart der VM
- Automatische Umwandlung von Gen-1- in Gen-2-VMs bei Migration
! Parameter -CompatibilityForMigrationMode CommonClusterFeatureSet.

? Welcher Nebeneffekt ist möglich?
* Weniger Leistung bei Software, die neue Befehlssätze nutzt
- Verlust aller vorhandenen Prüfpunkte der VM
- Die VM verliert bei jedem Start ihre IP-Adresse
- Die Konfigurationsversion der VM wird herabgestuft
! Ausgeblendete Befehlssätze (z. B. neue Vektor-Erweiterungen) fehlen dem Gast.

? Wo stellt man den Modus im Hyper-V-Manager ein?
* VM-Einstellungen → Prozessor → Kompatibilität
- Hyper-V-Einstellungen → Live-Migrationen
- VM-Einstellungen → Integrationsdienste
- VM-Einstellungen → Firmware
! Unterpunkt des Prozessors der jeweiligen VM.
