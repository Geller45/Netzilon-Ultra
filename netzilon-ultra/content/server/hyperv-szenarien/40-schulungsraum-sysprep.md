---
id: server-hvsz-40
bereich: AZ-800
block: HV-S
kapitel: Hyper-V-Praxisszenarien
titel: Szenario 40 – Schulungsraum: Sysprep-Vorlage und differenzierende Datenträger für 15 VMs
stufe: Fortgeschritten
fach: Windows Server / AZ-800
pruefungen: [AZ-800, AP2, Schule]
quellen: [Microsoft Learn – Hyper-V]
verweise: [az800-vhdx, az800-pruefpunkte, server-hvsz-39, server-hvsz-45]
---

## Profi

### Ticket
**Kunde meldet (Berufsschule):** „Für den Kurs nächste Woche brauchen wir 15 gleiche Server-VMs für die Schüler. Auf dem Host ist nur 600 GB frei, und jede Neuinstallation dauert 30 Minuten.“
- **Priorität:** mittel (Termin steht fest)
- **Betroffene Maschine:** **HV01** im Schulnetz `exa.local`

### Ausgangslage
- **HV01.exa.local**: Server 2025, Datenträger D: mit 600 GB frei, vSwitch **„Schulung“** (privat oder intern)
- Gewünscht: 15 VMs **SCHUELER01** bis **SCHUELER15**, je Server 2025, gleiche Grundkonfiguration.
- Eine volle VHDX belegt nach Installation ca. 15 GB, mit Updates/Tools eher 25 GB.

### Analyse
- **Kopieren** einer fertigen VM erzeugt **doppelte SIDs/Computernamen** – Probleme spätestens beim Domänenbeitritt bzw. mit WSUS/Lizenzierung.
- Microsoft-Weg: Vorlage mit **Sysprep** **generalisieren** (`/generalize`) → computerspezifische Daten (SID, Treiberbindungen, Aktivierungsstatus) werden entfernt; beim nächsten Start läuft die **OOBE** (Willkommensseite) bzw. eine Antwortdatei.
- `/mode:vm` beschleunigt das, wenn das Abbild **auf derselben Hypervisor-Plattform** wieder eingesetzt wird.
- **Differenzierende Datenträger** (Differencing Disks): Jede Schüler-VM bekommt eine kleine **Kind-VHDX**, die nur Änderungen gegenüber der **Eltern-VHDX** (Vorlage) speichert.
- Regeln: Die Eltern-VHDX muss **unverändert** bleiben (schreibgeschützt setzen), darf **nicht** mehr gestartet oder verschoben werden; viele Kinder lesen gleichzeitig von ihr → auf schnellen Speicher (SSD) legen.
- Speicherbedarf: 25 GB Eltern + 15 × (wenige GB) statt 15 × 25 GB = 375 GB.

### Lösungsweg
1. **Vorlagen-VM VORLAGE01** installieren, Updates und Tools einspielen. *Begründung:* Alles, was alle brauchen, gehört in die Vorlage.
2. In VORLAGE01: `sysprep /generalize /oobe /shutdown /mode:vm`. *Begründung:* SID und gerätespezifische Daten werden entfernt, VM fährt herunter.
3. Die VHDX nach `D:\Schulung\Basis\Vorlage.vhdx` **kopieren** und **schreibgeschützt** setzen; VORLAGE01 nicht mehr starten. *Begründung:* Jede Änderung an der Eltern-Datei zerstört alle Kinder.
4. Für jede Schüler-VM: **differenzierende VHDX** mit `New-VHD -Differencing -ParentPath …` erzeugen, **Gen-2-VM** anlegen, Kind-VHDX anhängen. *Begründung:* Schnell, platzsparend.
5. VMs starten → OOBE (Sprache, Kennwort setzt der Schüler) bzw. Antwortdatei `unattend.xml` für Computername. *Begründung:* Jede VM bekommt eigene Identität.
6. Optional: Prüfpunkt „Kursbeginn“ je VM. *Begründung:* Schnelles Zurücksetzen nach Übungen.

### Ergebnis prüfen
- `Get-VHD D:\Schulung\SCHUELER05.vhdx | Select VhdType, ParentPath, FileSize` → Differencing, Parent = Vorlage.vhdx.
- In zwei Schüler-VMs `whoami /user` (lokal) → unterschiedliche Maschinen-SIDs; Computernamen verschieden.
- Platzbedarf auf D: deutlich unter 600 GB.

### Vorbeugung
- Vorlage versionieren (Vorlage-2026-10.vhdx); Updates → **neue** Vorlage, nicht die alte ändern.
- Kinder nach Kursende löschen und neu ableiten statt „reparieren“.
- Dokumentieren: Welche Kinder hängen an welcher Eltern-VHDX?

## Einfach
Stell dir vor, du sollst für 15 Kinder ein **Malbuch** vorbereiten. Jede Seite neu zeichnen dauert ewig. Also zeichnest du **eine** Vorlage und legst für jedes Kind eine **Folie** darüber. Die Kinder malen nur auf ihrer Folie. Die Vorlage darunter bleibt sauber und wird von allen gleichzeitig benutzt.

Genau so funktionieren **differenzierende Datenträger**:
- Die **Eltern-Festplatte** ist die Vorlage.
- Jede Schüler-VM hat eine eigene **Kind-Festplatte** (die Folie), auf der nur ihre Änderungen landen.

Bevor man die Vorlage benutzt, muss man ihr aber noch den **Namen wegradieren**. Sonst hießen alle 15 Malbücher „Lisa“ und hätten die gleiche Ausweisnummer. Das Radiergummi heißt **Sysprep**. Danach fragt jede VM beim ersten Start: „Wie heiße ich?“

Ganz wichtig: Die Vorlage **darf man nie mehr anfassen**! Wenn jemand auf die Vorlage malt, passen alle Folien nicht mehr – und alle 15 Malbücher sind kaputt.

## Merksatz
- **Sysprep /generalize** = Identität wegradieren.
- **Eltern-VHDX nie ändern** – schreibgeschützt!
- Kind speichert **nur Änderungen**.
- `/mode:vm` nur für **gleiche Hypervisor-Plattform**.

## Prüfungsfalle
- Einfaches Kopieren einer VM ohne Sysprep → doppelte SIDs/Namen.
- Wird die Eltern-VHDX geändert (z. B. Vorlage-VM gestartet), sind alle Kinder **beschädigt**.
- Differenzierende Datenträger kosten etwas Leistung und hängen von der Eltern-Datei ab – nicht für langfristige Produktion.
- Sysprep hat ein Limit für wiederholtes Generalisieren derselben Installation – daher Vorlage neu aufbauen statt endlos zu sysprepen.

## Grafik
### Eine Vorlage, viele Kinder
1. VORLAGE01: Installation, Updates, Tools
2. VORLAGE01: sysprep /generalize /oobe /shutdown /mode:vm
3. HV01: Vorlage.vhdx schreibgeschützt ablegen
4. HV01 -> SCHUELER01, SCHUELER15: New-VHD -Differencing je Schüler-VM
5. SCHUELER01: erster Start, OOBE erzeugt neue Identität
6. SCHUELER01 -> Vorlage.vhdx: liest unveränderte Blöcke, schreibt nur ins Kind

## Lab
**Nachstellen:** Erst falsch (VM kopiert), dann richtig (Sysprep + Differencing). Maschinen: **HV01**, VM **VORLAGE01**, Schüler-VMs.

### GUI
1. **HV01**: VORLAGE01 exportieren und als Kopie importieren („Virtuellen Computer kopieren – neue eindeutige ID erstellen“) → beide starten → in beiden `whoami /user` bzw. Computername vergleichen: identisch (Fehlerbild). Kopie danach löschen.
2. **VORLAGE01**: `C:\Windows\System32\Sysprep\sysprep.exe` → „Out-of-Box-Experience (OOBE) für System aktivieren“, Haken **Verallgemeinern**, Option **Herunterfahren** → OK.
3. **HV01**: Explorer → VHDX nach `D:\Schulung\Basis\Vorlage.vhdx` kopieren → Eigenschaften → **Schreibgeschützt**.
4. **HV01**: Hyper-V-Manager → Neu → **Festplatte** → VHDX → **Differenzierend** → Name SCHUELER01.vhdx → Übergeordnete Festplatte `Vorlage.vhdx`.
5. **HV01**: Neu → Virtueller Computer → SCHUELER01, Gen 2, Switch „Schulung“, „Vorhandene virtuelle Festplatte verwenden“ → SCHUELER01.vhdx.
6. **SCHUELER01**: starten → OOBE durchlaufen → Computername prüfen.

### PowerShell
```powershell
# Auf VORLAGE01 – generalisieren
C:\Windows\System32\Sysprep\sysprep.exe /generalize /oobe /shutdown /mode:vm

# Auf HV01 – Eltern-VHDX bereitstellen
New-Item -ItemType Directory D:\Schulung\Basis -Force
Copy-Item "D:\Hyper-V\VORLAGE01\VORLAGE01.vhdx" "D:\Schulung\Basis\Vorlage.vhdx"
Set-ItemProperty "D:\Schulung\Basis\Vorlage.vhdx" -Name IsReadOnly -Value $true

# Auf HV01 – 15 Schüler-VMs
1..15 | ForEach-Object {
    $n = "SCHUELER{0:D2}" -f $_
    New-VHD -Path "D:\Schulung\$n.vhdx" -ParentPath "D:\Schulung\Basis\Vorlage.vhdx" -Differencing
    New-VM -Name $n -Generation 2 -MemoryStartupBytes 2GB -VHDPath "D:\Schulung\$n.vhdx" -SwitchName "Schulung"
    Checkpoint-VM -Name $n -SnapshotName "Kursbeginn"
}

# Auf HV01 – Kontrolle
Get-VHD "D:\Schulung\SCHUELER05.vhdx" | Select-Object VhdType, ParentPath, FileSize
```

## Reihenfolge
### Schulungs-VMs ableiten
1. Vorlagen-VM installieren und aktualisieren
2. Sysprep mit /generalize /oobe /shutdown ausführen
3. VHDX als Eltern-Datei kopieren und schreibschützen
4. Differenzierende Kind-VHDX je Schüler anlegen
5. Schüler-VMs mit Kind-VHDX erstellen
6. VMs starten und OOBE bzw. Antwortdatei abschließen
7. Prüfpunkt Kursbeginn setzen

## Szenario
### Kontrollfragen
Für 15 Schüler werden gleiche Server-VMs gebraucht, Platz auf HV01 ist knapp. VORLAGE01 ist fertig installiert.
- F: Was muss vor dem Vervielfältigen in VORLAGE01 laufen? | A: sysprep /generalize /oobe /shutdown (optional /mode:vm).
- F: Welcher VHDX-Typ spart Platz für die Schüler-VMs? | A: Differenzierende Datenträger mit Vorlage.vhdx als Eltern-Datei.
- F: Welches Cmdlet erzeugt eine Kind-VHDX? | A: New-VHD -Path Kind.vhdx -ParentPath Vorlage.vhdx -Differencing
- F: Was passiert, wenn VORLAGE01 später wieder gestartet wird? | A: Die Eltern-VHDX ändert sich und alle Kinder werden unbrauchbar.
- F: Warum nicht einfach VMs kopieren? | A: Doppelte Maschinen-SIDs und Computernamen.

## Legende
### Sysprep
- Was: Systemvorbereitungsprogramm, das eine Windows-Installation generalisiert.
- Wie: sysprep /generalize /oobe /shutdown, für VMs auf gleicher Plattform zusätzlich /mode:vm.
- Wann: Vor dem Vervielfältigen eines Abbilds (Vorlagen, Images).
- Wo: In der Vorlagen-VM, C:\Windows\System32\Sysprep.
- Warum: Entfernt SID und gerätespezifische Daten, damit jede Kopie eindeutig wird.
### Differenzierender Datenträger
- Was: Kind-VHDX, die nur Änderungen gegenüber einer Eltern-VHDX speichert.
- Wie: New-VHD -Differencing -ParentPath.
- Warum: Spart Platz und Zeit bei vielen gleichartigen VMs.

## Karteikarten
- F: Welcher Sysprep-Schalter entfernt die Maschinen-SID? | A: /generalize
- F: Wofür steht /oobe? | A: Beim nächsten Start läuft die Out-of-Box-Experience (Ersteinrichtung).
- F: Wann ist /mode:vm erlaubt? | A: Wenn das Abbild auf derselben Hypervisor-Plattform verwendet wird.
- F: Was speichert ein differenzierender Datenträger? | A: Nur die Änderungen gegenüber der Eltern-VHDX.
- F: Cmdlet für eine Kind-VHDX? | A: New-VHD -Path Kind.vhdx -ParentPath Eltern.vhdx -Differencing
- F: Warum Eltern-VHDX schreibschützen? | A: Jede Änderung an ihr beschädigt alle Kinder.
- F: Wie prüft man die Eltern-Datei einer VHDX? | A: Get-VHD Pfad \| Select-Object VhdType, ParentPath
- F: Was passiert beim Kopieren einer VM ohne Sysprep? | A: Doppelte SIDs und Namen, Probleme bei Domäne/WSUS/Lizenzierung.

## Quiz
? Welcher Befehl bereitet eine Vorlagen-VM korrekt vor?
* sysprep /generalize /oobe /shutdown /mode:vm
- sysprep /audit /reboot /unattend:vorlage.xml
- sysprep /oobe /quit ohne /generalize (Identität bleibt)
- dism /online /cleanup-image /restorehealth /shutdown
! /generalize entfernt die Identität, /oobe startet beim nächsten Mal die Ersteinrichtung.

? Was speichert eine differenzierende VHDX?
* Nur Änderungen gegenüber der Eltern-VHDX
- Eine vollständige Kopie der Eltern-VHDX
- Nur den Arbeitsspeicher
- Nur die VM-Konfiguration
! Unveränderte Blöcke werden aus der Eltern-Datei gelesen.

? Was darf mit der Eltern-VHDX nach dem Ableiten nicht passieren?
* Sie darf nicht verändert oder gestartet werden
- Sie darf nicht gelesen werden
- Sie darf nicht auf SSD liegen
- Sie darf nicht schreibgeschützt sein
! Sonst sind alle Kinder beschädigt.

? Welcher Parameter erzeugt mit New-VHD eine Kind-Festplatte?
* -Differencing
- -Dynamic -Child
- -Fixed -Clone
- -SourceDisk
! Zusammen mit -ParentPath.

? Wann darf /mode:vm verwendet werden?
* Wenn das Abbild auf derselben Hypervisor-Plattform bleibt
- Für physische Rechner mit abweichender Hardware und Treibern
- Ausschließlich bei Gen-1-VMs mit emulierten Geräten
- Nur für Domänencontroller, die geklont werden sollen
! Treiber werden dann nicht neu erkannt.

? Welches Problem entsteht beim Kopieren einer VM ohne Sysprep?
* Doppelte Maschinen-SIDs und Computernamen
- Die VM startet nie
- Die VHDX wird automatisch differenzierend
- Der Host verliert seine Lizenz
! Generalisieren verhindert das.

? Wie viel Platz brauchen 15 Kinder plus Eltern ungefähr im Vergleich zu 15 Vollkopien?
* Deutlich weniger, nur das Elternteil ist voll gespeichert
- Genau gleich viel, da jedes Kind eine Vollkopie enthält
- Doppelt so viel wegen der zusätzlichen Elterndatei
- Nur etwa 1 MB insgesamt, unabhängig von Änderungen
! Kinder wachsen mit den Änderungen.

? Wie bekommen Schüler-VMs nach dem Kurs einen sauberen Stand?
* Prüfpunkt Kursbeginn anwenden oder Kind neu ableiten
- Eltern-VHDX bearbeiten
- Sysprep in jeder Kind-VM erneut ausführen
- VM-Konfigurationsversion senken
! Die Eltern-Datei bleibt dabei unangetastet.
