---
id: server-hvsz-49
bereich: AZ-800
block: HV-S
kapitel: Hyper-V-Praxisszenarien
titel: Szenario 49 – VM startet nicht: Fehleranalyse mit Hyper-V-Ereignisprotokollen
stufe: Fortgeschritten
fach: Windows Server / AZ-800
pruefungen: [AZ-800, AZ-801, AP2, Schule]
quellen: [Microsoft Learn – Hyper-V]
verweise: [az801-ereignisprotokolle, az801-leistungsueberwachung, az800-vhdx, server-hvsz-48]
---

## Profi

### Ticket
**Kunde meldet:** „Wir haben die VM-Dateien von WEB02 auf eine neue, größere Platte kopiert. Seitdem startet WEB02 nicht mehr – die Meldung im Hyper-V-Manager sagt nur ‚Fehler beim Starten‘.“
- **Priorität:** hoch (Webserver offline)
- **Betroffene Maschine:** **WEB02** auf **HV01**

### Ausgangslage
- **HV01.example.com**, Server 2025; VM **WEB02** (Gen 2, 192.168.10.81).
- Ein Kollege hat den Ordner `D:\Hyper-V` per **Explorer** auf eine neue Platte kopiert, die alte Platte entfernt und der neuen den Laufwerksbuchstaben **D:** gegeben. Der Pfad `D:\Hyper-V\WEB02\WEB02.vhdx` in der VM-Konfiguration ist also unverändert – die Datei ist aber eine Kopie.

### Analyse
Hyper-V schreibt in eigene Protokolle unter **Anwendungs- und Dienstprotokolle → Microsoft → Windows → Hyper-V-…**. Die wichtigsten:

| Protokoll | Inhalt |
|---|---|
| **Hyper-V-VMMS-Admin** | Virtual Machine Management Service: Erstellen, Starten, Konfiguration, Migration, Prüfpunkte |
| **Hyper-V-Worker-Admin** | Worker-Prozess (vmwp.exe) **je laufender VM**: Start-/Laufzeitfehler, Geräte, Speicher |
| **Hyper-V-Config-Admin** | Konfigurationsdateien (fehlend, beschädigt) |
| **Hyper-V-Hypervisor-Admin** | Hypervisor-Start (z. B. Virtualisierung im BIOS aus) |
| **Hyper-V-VID-Admin** | Speicherzuweisung (z. B. nicht genug RAM) |
| **Hyper-V-StorageVSP-Admin** | Virtueller Speicher-Stack |
| **Hyper-V-Compute-Admin** | Host Compute Service (Container, neuere Verwaltungs-API) |

- Abfrage per PowerShell: `Get-WinEvent -ListLog *Hyper-V*` listet alle; `Get-WinEvent -LogName "Microsoft-Windows-Hyper-V-Worker-Admin" -MaxEvents 20`.
- Im Worker- bzw. VMMS-Protokoll steht sinngemäß: Die VM konnte den Anlagenpfad `D:\Hyper-V\WEB02\WEB02.vhdx` nicht öffnen – **„Allgemeine Zugriffsverweigerung“ (0x80070005)**.
- Ursache: Jede VM läuft mit eigener Identität **`NT VIRTUAL MACHINE\<VM-ID>`**. Beim Anhängen über Hyper-V-Manager/`Add-VMHardDiskDrive` bekommt diese Identität automatisch Rechte auf die VHDX. Beim **manuellen Kopieren** und Eintragen fehlen diese Rechte.

### Lösungsweg
1. **Ereignisse filtern** (Worker-Admin, VMMS-Admin, Ebene Fehler, letzte Stunde). *Begründung:* Die GUI-Meldung ist zu allgemein.
2. **Fehlerbeschreibung lesen**: Zugriff verweigert auf Anlagenpfad. *Begründung:* Zeigt Pfad und Ursache.
3. **VHDX sauber neu anhängen**: Laufwerk aus den VM-Einstellungen entfernen und über den Hyper-V-Manager bzw. `Add-VMHardDiskDrive` erneut hinzufügen. *Begründung:* Hyper-V setzt dabei die Rechte für die VM-Identität.
4. **Alternative**: Rechte mit `icacls` für `NT VIRTUAL MACHINE\<VM-ID>` vergeben. *Begründung:* Wenn das Neuanhängen nicht möglich ist.
5. Künftig Speicher mit **Speichermigration** (`Move-VMStorage`) verschieben. *Begründung:* Hyper-V kümmert sich um Pfade und Rechte – sogar im laufenden Betrieb.

### Ergebnis prüfen
- WEB02 startet; im Worker-Admin-Protokoll keine neuen Fehler.
- `icacls D:\Hyper-V\WEB02\WEB02.vhdx` zeigt einen Eintrag `NT VIRTUAL MACHINE\<VM-ID>`.
- Webseite erreichbar.

### Vorbeugung
- Arbeitsanweisung: VM-Dateien **nie** per Explorer verschieben – immer Speichermigration oder Export/Import.
- Benutzerdefinierte Ansicht in der Ereignisanzeige „Hyper-V Fehler“ für alle Hyper-V-Admin-Protokolle anlegen.
- Weiterleitung kritischer Hyper-V-Ereignisse an ein Monitoring (z. B. Azure Monitor/Log Analytics, Ereignisweiterleitung).

## Einfach
Stell dir vor, eine VM ist ein **Mieter**, der in eine neue Wohnung (neues Laufwerk) umzieht. Normalerweise macht das die **Umzugsfirma** (Hyper-V): Sie trägt die Möbel (VHDX) und gibt dem Mieter auch gleich den **passenden Schlüssel** für die neue Wohnung.

Hier hat ein Kollege die Möbel **selbst getragen** (Explorer-Kopie) und die neue Wohnung unter derselben Adresse eingerichtet. Der Mieter steht jetzt vor der Tür – und hat **keinen Schlüssel**, denn bei einer Explorer-Kopie werden seine Rechte nicht mitkopiert. Er kommt nicht rein, die VM startet nicht.

Woher weiß man das? Hyper-V schreibt alles in seine **Tagebücher** (Ereignisprotokolle). Das Tagebuch des **Hausmeisters** (VMMS) und das **Tagebuch jeder einzelnen Wohnung** (Worker) erzählen genau, was los war: „Zugriff verweigert auf D:\Hyper-V\WEB02\WEB02.vhdx“.

Die Lösung: Den Umzug noch einmal über die Umzugsfirma machen (Datenträger in Hyper-V neu anhängen) – dann bekommt der Mieter seinen Schlüssel automatisch.

## Merksatz
- Erst ins **Protokoll** schauen, dann handeln.
- **VMMS** = Verwaltung, **Worker** = die laufende VM, **Config** = Konfigurationsdateien.
- Jede VM hat eine Identität **NT VIRTUAL MACHINE\<VM-ID>**.
- VM-Dateien mit **Move-VMStorage** verschieben, nicht mit dem Explorer.

## Prüfungsfalle
- Die Hyper-V-Fehler stehen **nicht** im klassischen System-/Anwendungsprotokoll, sondern unter **Anwendungs- und Dienstprotokolle → Microsoft → Windows**.
- Das **Worker**-Protokoll betrifft die einzelne VM-Instanz, **VMMS** den Verwaltungsdienst.
- Manuell kopierte VHDX haben keine Rechte für die VM-Identität → Zugriff verweigert (0x80070005).
- `Get-WinEvent` braucht den vollen Protokollnamen, z. B. `Microsoft-Windows-Hyper-V-Worker-Admin`.

## Grafik
### Spurensuche im Protokoll
1. Admin -> WEB02: Start schlägt fehl, nur allgemeine Meldung
2. Admin -> HV01: Get-WinEvent Hyper-V-Worker-Admin, Ebene Fehler
3. HV01: Ereignis – Zugriff verweigert auf D:\Hyper-V\WEB02\WEB02.vhdx
4. Admin -> WEB02: VHDX entfernen und neu anhängen
5. HV01: Rechte für NT VIRTUAL MACHINE\VM-ID gesetzt
6. WEB02: startet, Webseite erreichbar

## Lab
**Nachstellen:** VHDX per Explorer kopieren, Rechte fehlen, Fehler im Protokoll finden, beheben. Maschinen: **HV01**, VM **WEB02** (Test-VM genügt).

### GUI
1. **HV01**: WEB02 herunterfahren → Explorer → `WEB02.vhdx` nach `E:\VMs\` **kopieren**.
2. **HV01**: PowerShell: Pfad in der VM auf die Kopie umstellen, ohne Hyper-V die Rechte setzen zu lassen – z. B. Rechte der Kopie danach mit `icacls … /reset` zurücksetzen (siehe unten) → WEB02 starten → Fehler (Fehlerbild).
3. **HV01**: Ereignisanzeige → Anwendungs- und Dienstprotokolle → Microsoft → Windows → **Hyper-V-Worker** → **Admin** und **Hyper-V-VMMS** → **Admin** → Fehler mit Pfadangabe lesen.
4. **HV01**: Ereignisanzeige → Benutzerdefinierte Ansichten → Erstellen → Protokolle: alle „Hyper-V-*\Admin“ → Ebene Kritisch/Fehler/Warnung → Name „Hyper-V Fehler“.
5. **HV01**: Hyper-V-Manager → WEB02 → Einstellungen → SCSI-Controller → Festplatte → **Entfernen** → Festplatte → Hinzufügen → `E:\VMs\WEB02.vhdx` → OK → starten → läuft.

### PowerShell
```powershell
# Auf HV01 – Fehler erzeugen (nur Lab!)
Stop-VM -Name WEB02
Copy-Item "D:\Hyper-V\WEB02\WEB02.vhdx" "E:\VMs\WEB02.vhdx"
Get-VMHardDiskDrive -VMName WEB02 | Set-VMHardDiskDrive -Path "E:\VMs\WEB02.vhdx"
icacls "E:\VMs\WEB02.vhdx" /reset
Start-VM -Name WEB02          # schlägt fehl

# Auf HV01 – Protokolle finden und lesen
Get-WinEvent -ListLog *Hyper-V* | Where-Object RecordCount -gt 0 | Select-Object LogName, RecordCount
Get-WinEvent -LogName "Microsoft-Windows-Hyper-V-Worker-Admin" -MaxEvents 10 | Format-List TimeCreated, Id, LevelDisplayName, Message
Get-WinEvent -FilterHashtable @{ LogName = "Microsoft-Windows-Hyper-V-VMMS-Admin"; Level = 2; StartTime = (Get-Date).AddHours(-1) }

# Auf HV01 – Behebung: Laufwerk neu anhängen (Hyper-V setzt die Rechte)
Get-VMHardDiskDrive -VMName WEB02 | Remove-VMHardDiskDrive
Add-VMHardDiskDrive -VMName WEB02 -ControllerType SCSI -Path "E:\VMs\WEB02.vhdx"
Start-VM -Name WEB02

# Auf HV01 – Alternative: Rechte direkt setzen
$id = (Get-VM -Name WEB02).Id
icacls "E:\VMs\WEB02.vhdx" /grant "NT VIRTUAL MACHINE\$($id):(F)"
icacls "E:\VMs\WEB02.vhdx"
```

## Szenario
### Kontrollfragen
WEB02 startet nach einer Explorer-Kopie der VHDX nicht. Der Hyper-V-Manager zeigt nur „Fehler beim Starten“.
- F: In welchen Protokollen suchst du zuerst? | A: Microsoft-Windows-Hyper-V-Worker-Admin und Microsoft-Windows-Hyper-V-VMMS-Admin.
- F: Mit welchem Cmdlet listest du alle Hyper-V-Protokolle? | A: Get-WinEvent -ListLog *Hyper-V*
- F: Welche Identität braucht Rechte auf die VHDX? | A: NT VIRTUAL MACHINE\<VM-ID> der jeweiligen VM.
- F: Wie behebst du den Fehler am einfachsten? | A: Datenträger in den VM-Einstellungen entfernen und über Hyper-V neu anhängen.
- F: Wie verschiebt man VM-Dateien künftig richtig? | A: Mit Speichermigration (Move-VMStorage) oder Export/Import.

## Legende
### Hyper-V-Ereignisprotokolle
- Was: Eigene Admin-/Betriebsprotokolle der Hyper-V-Komponenten (VMMS, Worker, Config, Hypervisor, VID …).
- Wie: Ereignisanzeige → Anwendungs- und Dienstprotokolle → Microsoft → Windows, oder Get-WinEvent.
- Wann: Bei jedem Start-, Migrations-, Prüfpunkt- oder Gerätefehler.
- Wo: Auf dem Hyper-V-Host (bzw. zentral gesammelt).
- Warum: Die GUI-Meldungen sind oft allgemein; die Protokolle nennen Pfad und Fehlercode.
### Hyper-V-Worker
- Was: Prozess vmwp.exe, der pro laufender VM gestartet wird.
- Warum: Fehler beim Start oder Betrieb einer bestimmten VM landen in seinem Protokoll.

## Karteikarten
- F: Wo findet man die Hyper-V-Protokolle in der Ereignisanzeige? | A: Anwendungs- und Dienstprotokolle → Microsoft → Windows → Hyper-V-…
- F: Wofür steht das VMMS-Protokoll? | A: Virtual Machine Management Service – Verwaltung von VMs (Erstellen, Starten, Migration, Prüfpunkte).
- F: Wofür steht das Worker-Protokoll? | A: Für den Worker-Prozess (vmwp.exe) jeder laufenden VM.
- F: Cmdlet zum Auflisten aller Hyper-V-Protokolle? | A: Get-WinEvent -ListLog *Hyper-V*
- F: Wie liest man nur Fehler der letzten Stunde aus VMMS-Admin? | A: Get-WinEvent -FilterHashtable @{LogName="Microsoft-Windows-Hyper-V-VMMS-Admin"; Level=2; StartTime=(Get-Date).AddHours(-1)}
- F: Welche Identität nutzt eine VM für Dateizugriffe? | A: NT VIRTUAL MACHINE\<VM-ID>.
- F: Welcher Fehlercode steht für Zugriff verweigert? | A: 0x80070005.
- F: Welches Protokoll meldet Probleme beim Hypervisor-Start? | A: Hyper-V-Hypervisor-Admin.

## Quiz
? In welchem Protokoll stehen Startfehler einer einzelnen laufenden VM typischerweise?
* Microsoft-Windows-Hyper-V-Worker-Admin
- System
- Sicherheit
- Microsoft-Windows-DNS-Client/Operational
! Der Worker-Prozess gehört zur jeweiligen VM.

? Was zeigt das VMMS-Protokoll?
* Ereignisse des Verwaltungsdienstes wie Erstellen, Starten, Migration, Prüfpunkte
- Nur Netzwerkpakete
- Anmeldeversuche an Clients
- Druckaufträge
! VMMS = Virtual Machine Management Service.

? Warum startet eine VM nach einer Explorer-Kopie der VHDX oft nicht?
* Der VM-Identität NT VIRTUAL MACHINE\<VM-ID> fehlen Rechte auf die Datei
- Die VHDX wird beim Kopieren verschlüsselt
- Explorer wandelt VHDX in VHD um
- Die VM-ID ändert sich
! Hyper-V setzt die Rechte nur beim Anhängen über die Verwaltungswerkzeuge.

? Welches Cmdlet listet alle Hyper-V-Protokolle auf?
* Get-WinEvent -ListLog *Hyper-V*
- Get-EventLog -List Hyper-V
- Get-VMLog
- Show-EventLog Hyper-V
! Get-EventLog kennt die modernen Kanäle nicht.

? Wie verschiebt man VM-Dateien richtig?
* Mit Speichermigration (Move-VMStorage)
- Mit dem Explorer bei laufender VM
- Mit robocopy und anschließendem Neustart des Hosts
- Durch Umbenennen des Laufwerksbuchstabens
! Hyper-V passt Pfade und Rechte an.

? Welcher Fehlercode bedeutet „Zugriff verweigert“?
* 0x80070005
- 0x80070002
- 0x8007000E
- 0xC000021A
! 0x80070002 bedeutet „Datei nicht gefunden“.

? Welches Protokoll ist relevant, wenn der Hypervisor nicht startet (z. B. Virtualisierung im BIOS aus)?
* Hyper-V-Hypervisor-Admin
- Hyper-V-Worker-Admin
- Hyper-V-StorageVSP-Admin
- Anwendung
! Der Hypervisor startet vor allen VMs.

? Was ist eine dauerhafte Hilfe für die Fehlersuche?
* Benutzerdefinierte Ansicht über alle Hyper-V-Admin-Protokolle
- Alle Protokolle löschen
- Protokollgröße auf 64 KB setzen
- Ereignisanzeige deinstallieren
! So sieht man alle Hyper-V-Fehler an einer Stelle.
