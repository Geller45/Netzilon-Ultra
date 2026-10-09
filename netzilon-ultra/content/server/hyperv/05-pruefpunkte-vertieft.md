---
id: server-hyperv-pruefpunkte-vertieft
bereich: AZ-800
block: HV
kapitel: Hyper-V vertieft
titel: Prüfpunkte vertieft – Typen, AVHDX-Kette, Domänencontroller, Nested
stufe: Profi
fach: Windows Server / AZ-800
pruefungen: [AZ-800, AP2, Schule]
quellen: [Microsoft Learn – Hyper-V-Dokumentation, AZ-800 Study Guide]
verweise: [az800-pruefpunkte, az800-vhdx, az800-integrationsdienste, az800-adds-dc, server-hyperv-nested-einschraenkungen, server-hyperv-nested-lab]
---

## Profi

### Prüfpunkttypen
| Typ | Was wird gesichert? | Technik im Gast | Nach dem Anwenden |
|---|---|---|---|
| **Standardprüfpunkt** (*Standard Checkpoint*) | Datenträger **+ Arbeitsspeicher + Gerätezustand** | keine – „Foto“ des laufenden Zustands, **absturz-/zustandskonsistent** | VM läuft genau an der gespeicherten Stelle weiter |
| **Produktionsprüfpunkt** (*Production Checkpoint*) | nur **Datenträger + Konfiguration**, **kein RAM** | **Windows: VSS** (Volumeschattenkopie über den Integrationsdienst „Sicherung“); **Linux: Dateisystem-Freeze** (fsfreeze über den VSS-Daemon der Linux-Integrationsdienste) → **anwendungskonsistent** | VM ist **ausgeschaltet** und bootet neu wie nach einer Wiederherstellung |

Seit **Windows Server 2016** ist der **Produktionsprüfpunkt der Standard** für neue VMs.

### Set-VM -CheckpointType
| Wert | Bedeutung |
|---|---|
| `Production` | Produktionsprüfpunkt; **schlägt er fehl, wird ein Standardprüfpunkt erstellt** (Standardeinstellung, GUI-Haken „Standardprüfpunkt erstellen, wenn kein Produktionsprüfpunkt erstellt werden kann“) |
| `ProductionOnly` | nur Produktionsprüfpunkt; schlägt er fehl, **kein** Prüfpunkt (Fehlermeldung) |
| `Standard` | immer Standardprüfpunkt |
| `Disabled` | Prüfpunkte für diese VM deaktiviert |

```powershell
Set-VM -Name SRV01 -CheckpointType ProductionOnly
Set-VM -Name SRV01 -SnapshotFileLocation "E:\Checkpoints"
Get-VM -Name SRV01 | Select-Object Name, CheckpointType, SnapshotFileLocation, AutomaticCheckpointsEnabled
```

### Automatische Prüfpunkte
Mit **automatischen Prüfpunkten** (*Automatic Checkpoints*) erstellt Hyper-V beim **Starten** der VM automatisch einen Prüfpunkt (und löscht ihn beim nächsten Start wieder bzw. ersetzt ihn). Gedacht für Clients/Entwickler: „Ich kann zurück zum Zustand vor dem Start.“
- **Hyper-V unter Windows 10/11**: standardmäßig **aktiviert**.
- **Windows Server**: standardmäßig **deaktiviert**.
- Schalter: `Set-VM -Name CL01 -AutomaticCheckpointsEnabled $false` bzw. GUI Einstellungen → Prüfpunkte → „Automatische Prüfpunkte verwenden“.
Auf Servern mit vielen VMs führen automatische Prüfpunkte zu wachsenden AVHDX-Ketten und Speicherverbrauch – daher ausschalten.

### Die AVHDX-Kette
Beim Erstellen eines Prüfpunkts wird jede virtuelle Festplatte **schreibgeschützt eingefroren**; alle neuen Schreibvorgänge gehen in einen **Differenzierungsdatenträger** (`.avhdx`), dessen **Elternteil** die eingefrorene Datei ist. Jeder weitere Prüfpunkt hängt eine weitere AVHDX an:

`SRV01.vhdx ← SRV01_A1B2….avhdx ← SRV01_C3D4….avhdx (aktuell, „Jetzt“)`

- Lesen: Ein Block wird von der jüngsten AVHDX aus rückwärts gesucht → **lange Ketten = mehr Lese-I/O**.
- Weitere Dateien: `.vmcx` (Konfiguration), `.vmrs` (Laufzeitzustand/RAM bei Standardprüfpunkten), `.vmgs` (Gastzustand, z. B. vTPM/UEFI).
- **Kette nie manuell verändern** (AVHDX löschen, umbenennen, VHDX zurückkopieren) – das zerstört die Eltern-Kind-Beziehung.

### Zusammenführen (Merge)
- **Löschen** eines Prüfpunkts löscht **keine Daten**, sondern **führt** die AVHDX mit ihrem Elternteil **zusammen** – nur der Rücksprungpunkt verschwindet. Seit Server 2012 geschieht das **online** im laufenden Betrieb (Status „Zusammenführen“ im Hyper-V-Manager).
- „Prüfpunkt-Unterstruktur löschen“ = Prüfpunkt **und alle Kinder**: `Remove-VMSnapshot -VMName SRV01 -Name "Vor Update" -IncludeAllChildSnapshots`.
- **Verwaiste AVHDX** (z. B. nach abgebrochenem Backup oder manuellen Eingriffen): VM ausschalten, mit `Get-VHD` den **ParentPath** prüfen, dann **Merge-VHD** (bzw. Hyper-V-Manager → Datenträger bearbeiten → Zusammenführen) und die VM auf die zusammengeführte VHDX zeigen lassen.
```powershell
Get-VHD -Path "E:\VMs\SRV01\SRV01_C3D4.avhdx" | Select-Object Path, ParentPath, VhdType
Merge-VHD -Path "E:\VMs\SRV01\SRV01_C3D4.avhdx" -DestinationPath "E:\VMs\SRV01\SRV01.vhdx"
```

### Domänencontroller und VM-GenerationID
Früher führte das Zurücksetzen eines DC auf einen alten Snapshot zum **USN-Rollback**: Der DC benutzt alte Update Sequence Numbers erneut, Partner ignorieren seine Änderungen, die Replikation ist dauerhaft inkonsistent.

Seit **Windows Server 2012** gibt es den **VM-GenerationID-Schutz** (*Virtualization Safeguards*):
- Der Hypervisor stellt der VM eine **VM-GenerationID** bereit; diese **ändert sich**, wenn ein Prüfpunkt angewendet oder die VM importiert/kopiert wird.
- Der DC speichert die ID im Attribut `msDS-GenerationId` seines Computerobjekts und vergleicht beim Start bzw. vor jeder AD-Transaktion.
- Bei Abweichung: **neue InvocationID** (Partner replizieren die Änderungen korrekt nach), **RID-Pool wird verworfen**, **SYSVOL nicht-autoritativ** neu synchronisiert.
- Voraussetzungen: Hypervisor und DC-Betriebssystem unterstützen GenerationID (ab Server 2012 / Hyper-V ab 2012).
- **Trotzdem**: Prüfpunkte sind kein Ersatz für **Systemstatus-Sicherungen**; Produktionsprüfpunkte sind für DCs die passende Prüfpunktart. Ein „Zurückreisen“ eines **einzigen** DCs in einer Domäne mit nur einem DC verliert alle Änderungen seit dem Prüfpunkt.

### Prüfpunkte in Nested-Umgebungen
- **Innere VMs** (INNER01 in HV-NESTED) verhalten sich normal: Standard- und Produktionsprüfpunkte möglich, die AVHDX liegen in der VHDX von HV-NESTED (VHDX in VHDX).
- **Äußere VM** mit laufendem Gast-Hypervisor: **Standardprüfpunkte/Speichern** (mit RAM) gelten als nicht unterstützt bzw. scheitern. Sicherer Weg: innere VMs und HV-NESTED **herunterfahren** → Prüfpunkt. Ein Produktionsprüfpunkt (ohne RAM) ist der laufende Alternativweg, sichert aber die inneren VMs nur absturzkonsistent – im Lab daher lieber ausgeschaltet.
- **Lab-Tipp**: Prüfpunkt „Basis“ nach der Grundinstallation aller Nested-Knoten (alles ausgeschaltet) → jederzeit sauberer Neustart des Cluster-Labs.

### Prüfpunkt ≠ Backup
Prüfpunkte liegen auf **demselben Speicher** wie die VM und hängen am Eltern-VHDX. Geht das Volume kaputt, sind VM und Prüfpunkte weg. Außerdem kosten lange Ketten Leistung und Platz; ist das Volume voll, pausiert Hyper-V die VM (**Paused-Critical**). Backups (Windows Server-Sicherung, Azure Backup, Drittanbieter) nutzen zwar intern ebenfalls Prüfpunkte bzw. RCT (*Resilient Change Tracking*), speichern die Daten aber **woanders**.

## Einfach

Ein **Prüfpunkt** ist wie ein **Speicherstand** in einem Videospiel.

- Ein **Standardprüfpunkt** ist ein **Schnappschuss mitten im Spiel**: Alles wird festgehalten – sogar, dass du gerade springst. Lädst du ihn, bist du **genau in der Luft**. Das ist toll zum Ausprobieren, kann aber Probleme machen, wenn gerade jemand mit dir online gespielt hat (z. B. ein Datenbankserver, der mit anderen Servern redet).
- Ein **Produktionsprüfpunkt** ist wie **ordentlich speichern im Menü**: Das Spiel bringt erst alles in einen sauberen Zustand (bei Windows macht das **VSS**, bei Linux das „Einfrieren“ des Dateisystems). Lädst du ihn, startet das Spiel **neu** vom gespeicherten Stand – sauber, aber ohne „mitten im Sprung“.

**Die Kette**: Jeder Speicherstand ist wie ein **neues Blatt Transparentpapier** über einem Bild. Du malst nur noch auf das oberste Blatt. Das Bild darunter bleibt unverändert. Viele Blätter übereinander machen das Hinschauen mühsam (langsamer).

**Löschen** eines Prüfpunkts heißt: Das Transparentblatt wird **auf das Bild darunter gedrückt** – die Zeichnung bleibt erhalten, nur das einzelne Blatt ist weg (**Zusammenführen**).

**Domänencontroller** sind wie **Klassenbuchführer**, die mit anderen Klassenbüchern abgleichen. Würde einer heimlich in die Vergangenheit springen, gäbe es Chaos. Darum hat Hyper-V eine **Seriennummer** (VM-GenerationID): Ändert sie sich, merkt der DC „ich wurde zurückgespult“ und meldet sich bei den anderen neu an.

Und ganz wichtig: Ein Speicherstand auf **derselben Festplatte** ist **kein Backup**!

## Merksatz
- Standard = **mit RAM**, Produktion = **VSS/fsfreeze, ohne RAM**.
- `Set-VM -CheckpointType Production | ProductionOnly | Standard | Disabled`.
- Prüfpunkt löschen = **zusammenführen**, keine Daten weg.
- AVHDX **nie** von Hand löschen.
- DC: VM-GenerationID ändert sich → neue InvocationID, RID-Pool weg.
- Automatische Prüfpunkte: Client an, Server aus.

## Prüfungsfalle
- „Prüfpunkt löschen = Änderungen seit dem Prüfpunkt gehen verloren“ – **falsch**, sie werden zusammengeführt.
- `Production` fällt auf Standard zurück, `ProductionOnly` nicht – die Prüfung fragt gern nach „kein Standardprüfpunkt als Ersatz“.
- Nach Anwenden eines **Produktionsprüfpunkts** ist die VM **aus** – das ist korrekt, kein Fehler.
- VM-GenerationID schützt vor USN-Rollback, macht Prüfpunkte aber **nicht** zum Backup-Ersatz.
- Linux-Produktionsprüfpunkte brauchen die Linux-Integrationsdienste (VSS-Daemon), sonst Rückfall auf Standard.
- Äußere Nested-VM: Prüfpunkt im laufenden Zustand problematisch → herunterfahren.

## Grafik
### Produktionsprüfpunkt
1. Admin -> HV01: Checkpoint-VM SRV01
2. HV01 -> SRV01: Integrationsdienst Sicherung fordert VSS an
3. SRV01: VSS-Writer leeren Puffer, Anwendungen konsistent
4. HV01: VHDX einfrieren, neue AVHDX anlegen
5. HV01 -> SRV01: VSS-Freigabe, Schreiben läuft in AVHDX

### DC-Wiederherstellung mit GenerationID
1. Admin -> HV01: Prüfpunkt von DC02 anwenden
2. HV01 -> DC02: neue VM-GenerationID
3. DC02: Abweichung zu msDS-GenerationId erkannt
4. DC02: neue InvocationID, RID-Pool verworfen
5. DC02 -> DC01: Replikation mit neuer InvocationID

## Lab
**Maschinen**: Host **HV01.example.com** (Windows Server 2025), VM **SRV01.example.com** (Windows Server 2025), Linux-VM **LNX01**, Domänencontroller **DC02.example.com** (zweiter DC neben **DC01**), Nested-VM **HV-NESTED** mit **INNER01**.

### GUI
1. **HV01**: SRV01 → Einstellungen → **Prüfpunkte** → „Produktionsprüfpunkte“, Haken „Standardprüfpunkt erstellen, wenn …“ **entfernen** (= ProductionOnly) → Speicherort E:\Checkpoints.
2. **HV01**: SRV01 → Prüfpunkt → umbenennen in „Vor Update“ → in SRV01 Rolle installieren → Prüfpunkt **anwenden** → VM ist aus → starten → Rolle fehlt.
3. **HV01**: SRV01 → zweiten Prüfpunkt erstellen → Ordner E:\Checkpoints und VM-Ordner ansehen (zwei AVHDX).
4. **HV01**: ersten Prüfpunkt → **Prüfpunkt-Unterstruktur löschen** → Status „Zusammenführen“ beobachten.
5. **HV01**: DC02 → Produktionsprüfpunkt → Benutzer anlegen → Prüfpunkt anwenden → in **DC02** Ereignisanzeige „Directory Service“ auf Hinweis zur geänderten VM-GenerationID prüfen; Benutzer repliziert von DC01 zurück, sofern er dort schon angekommen war.
6. **HV01**: HV-NESTED: innere VMs herunterfahren, HV-NESTED herunterfahren → Prüfpunkt „Lab-Basis“.

### PowerShell
```powershell
# Auf HV01.example.com
Set-VM -Name SRV01 -CheckpointType ProductionOnly -SnapshotFileLocation "E:\Checkpoints"
Set-VM -Name SRV01 -AutomaticCheckpointsEnabled $false
Checkpoint-VM -Name SRV01 -SnapshotName "Vor Update"
Get-VMSnapshot -VMName SRV01 | Select-Object Name, SnapshotType, CreationTime, ParentSnapshotName
Restore-VMSnapshot -VMName SRV01 -Name "Vor Update" -Confirm:$false
Remove-VMSnapshot -VMName SRV01 -Name "Vor Update" -IncludeAllChildSnapshots
Get-VMHardDiskDrive -VMName SRV01 | Select-Object Path      # zeigt aktuelle AVHDX bzw. VHDX

# Linux-VM: Produktionsprüfpunkt nur mit VSS-Daemon
Set-VM -Name LNX01 -CheckpointType Production
Get-VMIntegrationService -VMName LNX01 | Where-Object Name -match "Sicherung|Backup"

# DC02: GenerationID im AD prüfen (auf DC01)
Get-ADComputer DC02 -Properties msDS-GenerationId | Select-Object Name, msDS-GenerationId

# Nested: äußere VM sauber sichern
Invoke-Command -VMName HV-NESTED -ScriptBlock { Get-VM | Stop-VM }
Stop-VM -Name HV-NESTED
Checkpoint-VM -Name HV-NESTED -SnapshotName "Lab-Basis"
```

## Legende
### Produktionsprüfpunkt
- Was: Anwendungskonsistenter Prüfpunkt ohne Arbeitsspeicherinhalt.
- Wie: VSS im Windows-Gast bzw. fsfreeze im Linux-Gast über die Integrationsdienste.
- Wann: Produktive Server, DCs, Datenbanken; Standard seit Server 2016.
- Wo: VM-Einstellungen → Prüfpunkte bzw. `Set-VM -CheckpointType`.
- Warum: Konsistente Daten, keine „mitten im Satz“ eingefrorenen Anwendungen.
### VM-GenerationID
- Was: Kennung, die der Hypervisor der VM bereitstellt und die sich bei Prüfpunkt-Anwendung, Import oder Kopie ändert.
- Wie: DC vergleicht mit msDS-GenerationId und setzt bei Abweichung InvocationID neu, verwirft RID-Pool.
- Wann: Ab Windows Server 2012 (Hypervisor und Gast).
- Warum: Schutz vor USN-Rollback bei virtualisierten Domänencontrollern.

## Karteikarten
- F: Was sichert ein Standardprüfpunkt zusätzlich zum Datenträger? | A: Arbeitsspeicher und Gerätezustand der laufenden VM.
- F: Welche Technik nutzt ein Produktionsprüfpunkt im Windows-Gast? | A: VSS (Volumeschattenkopie) über den Integrationsdienst Sicherung.
- F: Welche Technik nutzt ein Produktionsprüfpunkt im Linux-Gast? | A: Dateisystem-Freeze (fsfreeze) über den VSS-Daemon der Linux-Integrationsdienste.
- F: Unterschied Production und ProductionOnly? | A: Production fällt bei Fehler auf Standardprüfpunkt zurück, ProductionOnly erstellt dann keinen Prüfpunkt.
- F: In welchem Zustand ist eine VM nach dem Anwenden eines Produktionsprüfpunkts? | A: Ausgeschaltet – sie bootet neu.
- F: Was passiert beim Löschen eines Prüfpunkts? | A: Die AVHDX wird mit dem Elternteil zusammengeführt; Daten bleiben erhalten.
- F: Welche Dateiendung hat ein Differenzierungsdatenträger eines Prüfpunkts? | A: .avhdx
- F: Wie führt man eine verwaiste AVHDX manuell zusammen? | A: VM aus, Get-VHD (ParentPath prüfen), Merge-VHD bzw. Datenträger bearbeiten → Zusammenführen.
- F: Was ist die VM-GenerationID? | A: Kennung vom Hypervisor, die sich bei Prüfpunkt-Anwendung/Import ändert; DCs erkennen damit ein Zurücksetzen.
- F: Was macht ein DC bei geänderter GenerationID? | A: Neue InvocationID, RID-Pool verwerfen, SYSVOL nicht-autoritativ synchronisieren.
- F: Wie deaktiviert man automatische Prüfpunkte? | A: Set-VM -Name <VM> -AutomaticCheckpointsEnabled $false
- F: Wo sind automatische Prüfpunkte standardmäßig aktiv? | A: In Hyper-V unter Windows 10/11, nicht auf Windows Server.
- F: Wie sichert man eine äußere Nested-VM am sichersten per Prüfpunkt? | A: Innere VMs und äußere VM herunterfahren, dann Checkpoint-VM.

## Quiz
? Ein Admin möchte sicherstellen, dass für SQL01 nur anwendungskonsistente Prüfpunkte entstehen – lieber gar keiner als ein Standardprüfpunkt. Welche Einstellung?
* Set-VM -Name SQL01 -CheckpointType ProductionOnly
- Set-VM -Name SQL01 -CheckpointType Production
- Set-VM -Name SQL01 -CheckpointType Standard
- Set-VM -Name SQL01 -AutomaticCheckpointsEnabled $true
! ProductionOnly verhindert den Rückfall auf Standardprüfpunkte.

? Was geschieht beim Löschen eines Prüfpunkts in der Mitte der Kette?
* Die AVHDX wird zusammengeführt, es gehen keine Daten verloren
- Alle Änderungen nach diesem Prüfpunkt werden verworfen
- Die VM wird automatisch auf diesen Prüfpunkt zurückgesetzt
- Die Eltern-VHDX wird gelöscht und durch die AVHDX ersetzt
! Nur der Rücksprungpunkt verschwindet; die Daten bleiben durch das Zusammenführen erhalten.

? Welcher Mechanismus erzeugt bei einem Linux-Gast einen Produktionsprüfpunkt?
* Dateisystem-Freeze über den VSS-Daemon der Integrationsdienste
- Ein Windows-VSS-Writer, der im Linux-Kernel mitgeliefert wird
- Das Speichern des kompletten Arbeitsspeichers in eine .vmrs-Datei
- Ein LVM-Snapshot, den Hyper-V im Gast selbst anlegt
! Linux kennt kein VSS; die Integrationsdienste frieren das Dateisystem ein (fsfreeze).

? Nach dem Anwenden eines Produktionsprüfpunkts ist die VM ausgeschaltet. Wie ist das zu bewerten?
* Normal – es wurde kein Arbeitsspeicher gesichert
- Fehler in den Integrationsdiensten des Gastes
- Hinweis auf eine beschädigte AVHDX-Kette
- Nur bei Gen-1-VMs normal, bei Gen 2 ein Fehler
! Produktionsprüfpunkte enthalten keinen RAM-Zustand, also startet die VM neu.

? Welche Funktion schützt einen virtualisierten DC ab Server 2012 beim Anwenden eines Prüfpunkts vor USN-Rollback?
* VM-GenerationID
- Produktionsprüfpunkte allein
- Automatische Prüfpunkte
- DHCP-Guard
! Ändert sich die GenerationID, setzt der DC eine neue InvocationID und verwirft seinen RID-Pool.

? Was macht ein DC, der eine geänderte VM-GenerationID erkennt?
* Er erzeugt eine neue InvocationID und verwirft seinen RID-Pool
- Er entfernt sich selbst aus der Domäne und muss neu heraufgestuft werden
- Er wird zum autoritativen DC für alle Verzeichnispartitionen
- Er deaktiviert die eingehende Replikation dauerhaft
! So replizieren Partner seine nachfolgenden Änderungen korrekt und es entstehen keine doppelten SIDs.

? Wo sind automatische Prüfpunkte standardmäßig aktiviert?
* In Hyper-V unter Windows 10/11
- Auf Windows Server 2022/2025
- Nur in Azure
- Nur bei Gen-1-VMs
! Auf Servern sind sie standardmäßig aus und sollten es bei vielen VMs auch bleiben.

? Ein Kollege hat eine AVHDX gelöscht, um Platz zu schaffen. Was ist die Folge?
* Die Kette ist beschädigt; Daten seit dem Prüfpunkt können fehlen
- Kein Problem – Hyper-V legt die Datei beim Start neu an
- Der Prüfpunkt wird automatisch in die VHDX zusammengeführt
- Nur die Prüfpunktansicht im Hyper-V-Manager ist danach leer
! AVHDX-Dateien enthalten die Änderungen seit dem Prüfpunkt; ohne sie startet die VM ggf. nicht. Nur Hyper-V darf sie entfernen (zusammenführen).

? Welches Cmdlet löscht einen Prüfpunkt samt allen nachfolgenden Prüfpunkten?
* Remove-VMSnapshot -IncludeAllChildSnapshots
- Restore-VMSnapshot -Name Basis -Confirm:$false
- Merge-VHD -Path Basis.avhdx -DestinationPath Basis.vhdx
- Remove-VMCheckpoint -VMName SRV01 -Name Basis
! Entspricht im Manager „Prüfpunkt-Unterstruktur löschen“; ohne -IncludeAllChildSnapshots wird nur der einzelne Prüfpunkt entfernt.

? HV-NESTED (Hyper-V-Rolle aktiv, innere VMs laufen) soll vor einem Cluster-Umbau gesichert werden. Was ist am sichersten?
* Innere VMs und HV-NESTED herunterfahren, dann Prüfpunkt erstellen
- Einen Standardprüfpunkt im laufenden Betrieb erstellen
- HV-NESTED mit Save-VM speichern und die VHDX kopieren
- Automatische Prüfpunkte für HV-NESTED aktivieren
! Mit laufendem Gast-Hypervisor ist ein RAM-Zustand nicht zuverlässig sicherbar.

? Warum ist ein Prüfpunkt kein Backup?
* Er liegt auf demselben Speicher und hängt von der Eltern-VHDX ab
- Er lässt sich nach dem Erstellen nicht mehr wiederherstellen
- Er enthält keine Daten, sondern nur die VM-Konfiguration
- Er wird von Hyper-V nach 24 Stunden automatisch gelöscht
! Fällt das Volume aus oder wird die Kette beschädigt, sind VM und Prüfpunkte gemeinsam weg.

? Welche Datei enthält bei einem Standardprüfpunkt den Arbeitsspeicherzustand?
* .vmrs
- .vmcx
- .avhdx
- .iso
! .vmcx ist die Konfiguration, .avhdx der Differenzierungsdatenträger, .vmrs der Laufzeitzustand.

? Ein Produktionsprüfpunkt einer Windows-VM schlägt fehl, Typ ist „Production“. Was passiert?
* Hyper-V erstellt stattdessen einen Standardprüfpunkt
- Es wird kein Prüfpunkt erstellt und ein Fehler protokolliert
- Die VM wird heruntergefahren und der Vorgang wiederholt
- Die VM wird angehalten, bis VSS wieder verfügbar ist
! Das ist die Standardeinstellung mit Rückfall; nur ProductionOnly verhindert ihn.

## Lücken
- Ein Produktionsprüfpunkt nutzt im Windows-Gast {VSS} und im Linux-Gast {fsfreeze|Dateisystem-Freeze}.
- Beim Löschen eines Prüfpunkts wird die {AVHDX|.avhdx}-Datei mit dem Elternteil {zusammengeführt}.
- Ein DC erkennt das Zurücksetzen an der geänderten {VM-GenerationID} und erzeugt eine neue {InvocationID}.

## Zuordnen
### CheckpointType und Wirkung
- Production => Produktionsprüfpunkt mit Rückfall auf Standard
- ProductionOnly => nur Produktionsprüfpunkt, sonst Fehler
- Standard => Prüfpunkt mit Arbeitsspeicherzustand
- Disabled => keine Prüfpunkte für die VM
- AutomaticCheckpointsEnabled => Prüfpunkt beim Start der VM

## Reihenfolge
### Verwaiste AVHDX zusammenführen
1. VM herunterfahren
2. Sicherung der VM-Dateien anfertigen
3. Mit Get-VHD den ParentPath der AVHDX ermitteln
4. Merge-VHD von der AVHDX in die Eltern-VHDX ausführen
5. Laufwerk der VM auf die zusammengeführte VHDX zeigen lassen
6. VM starten und Daten prüfen

## Freitext
- F: Vergleichen Sie Standard- und Produktionsprüfpunkte hinsichtlich Technik, Konsistenz und Verhalten beim Anwenden. | M: Standard: Datenträger plus RAM/Gerätezustand, zustandskonsistent, VM läuft nach Anwenden weiter. Produktion: VSS bzw. fsfreeze, kein RAM, anwendungskonsistent, VM ist nach Anwenden aus und bootet neu | P: 6
- F: Erläutern Sie, wie die VM-GenerationID einen USN-Rollback verhindert. | M: Hypervisor ändert die ID beim Anwenden eines Prüfpunkts/Import; DC vergleicht mit msDS-GenerationId, erkennt Abweichung, setzt neue InvocationID, verwirft RID-Pool und synchronisiert SYSVOL nicht-autoritativ; Partner replizieren dadurch korrekt | P: 5

## Szenario
### Volle Platte durch Prüfpunkte
Auf **HV01.example.com** ist Volume E: zu 98 % belegt. Die VM **FS01.example.com** zeigt den Status „Angehalten-Kritisch“. Im VM-Ordner liegen elf AVHDX-Dateien, weil jemand automatische Prüfpunkte aktiviert und täglich neu gestartet hat.
- F: Warum wurde die VM angehalten? | A: Volume voll – Hyper-V pausiert die VM (Paused-Critical), weil Schreibvorgänge in die AVHDX nicht mehr möglich sind | P: 2
- F: Wie verkleinern Sie den Speicherverbrauch korrekt? | A: Platz schaffen (andere Dateien verschieben), VM fortsetzen, nicht benötigte Prüfpunkte über Hyper-V löschen → Zusammenführen; niemals AVHDX manuell löschen | P: 3
- F: Wie verhindern Sie die Ursache dauerhaft? | A: Set-VM -Name FS01 -AutomaticCheckpointsEnabled $false, Prüfpunkte kurzlebig halten, Speicherüberwachung | P: 2
- F: Welcher Befehl listet alle Prüfpunkte? | A: Get-VMSnapshot -VMName FS01 \| Select-Object Name, CreationTime, ParentSnapshotName | P: 1

## Spickzettel
- Standard: Disk + RAM; Produktion: VSS/fsfreeze, ohne RAM, VM danach aus
- CheckpointType: Production (Rückfall), ProductionOnly, Standard, Disabled
- Löschen = Merge, AVHDX nie manuell löschen
- Automatische Prüfpunkte: Client an, Server aus
- DC: VM-GenerationID → neue InvocationID, RID-Pool weg
- Nested: äußere VM vor Prüfpunkt herunterfahren
