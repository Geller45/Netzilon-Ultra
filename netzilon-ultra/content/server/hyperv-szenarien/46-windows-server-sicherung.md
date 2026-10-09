---
id: server-hvsz-46
bereich: AZ-800
block: HV-S
kapitel: Hyper-V-Praxisszenarien
titel: Szenario 46 – VM sichern und wiederherstellen mit Windows Server-Sicherung
stufe: Fortgeschritten
fach: Windows Server / AZ-800
pruefungen: [AZ-800, AZ-801, AP2, Schule]
quellen: [Microsoft Learn – Hyper-V]
verweise: [az801-azure-backup, az801-backup-richtlinien, az800-integrationsdienste, az800-pruefpunkte, server-hvsz-45]
---

## Profi

### Ticket
**Kunde meldet:** „Ein Mitarbeiter hat in der VM APP01 die Anwendungsdatenbank zerschossen. Gibt es eine Sicherung? Und künftig wollen wir die VMs auf HV01 jede Nacht ohne Zusatzsoftware sichern.“
- **Priorität:** hoch (Anwendung gestört)
- **Betroffene Maschine:** **APP01** auf **HV01**

### Ausgangslage
- **HV01.example.com**, Server 2025, VMs APP01 (192.168.10.22) und FS01.
- Sicherungsziel: dedizierte USB-/SAN-Platte **E:** (Volume „Backup“) bzw. Freigabe `\\NAS01\Backup`.
- Bisher keine Host-Sicherung eingerichtet – nur ein alter Export von APP01.

### Analyse
- **Windows Server-Sicherung** (Feature `Windows-Server-Backup`, Befehlszeile `wbadmin`) kann **einzelne VMs** auf Host-Ebene sichern und wiederherstellen.
- Konsistenz: Auf dem Host meldet sich der **Hyper-V-VSS-Writer** („Microsoft Hyper-V VSS Writer“). Ist im Gast der Integrationsdienst **„Sicherung (Volumeschattenkopie)“** aktiv, wird **im Gast** ebenfalls VSS ausgelöst → **anwendungskonsistente** Sicherung bei laufender VM. Ohne ihn (oder bei Gästen ohne VSS) ist die Sicherung nur **absturzkonsistent** bzw. die VM wird kurz in den gespeicherten Zustand versetzt.
- `vssadmin list writers` zeigt den Writer-Zustand (**Stabil**, kein Fehler).
- Wiederherstellung: an den **ursprünglichen Ort** (überschreibt die VM) oder an einen **anderen Ort** (z. B. als Kopie zum Datenrausholen – Achtung: gleiche VM-ID/Name!).
- Ziel-Volume für geplante Sicherungen: eigene Platte (wird formatiert und exklusiv genutzt) oder Freigabe (dann nur eine Sicherungsversion, wird überschrieben).

### Lösungsweg
1. **Akutfall:** Vorhandene Sicherungen prüfen – keine Host-Sicherung vorhanden → alten **Export** von APP01 nutzen bzw. Datenbank-Backup im Gast. *Begründung:* Ehrliche Antwort an den Kunden; ab jetzt besser.
2. Feature **Windows Server-Sicherung** installieren. *Begründung:* Bordmittel ohne Zusatzkosten.
3. **Integrationsdienst „Sicherung (Volumeschattenkopie)“** in allen VMs prüfen. *Begründung:* Anwendungskonsistenz.
4. **Geplante Sicherung** einrichten: benutzerdefiniert, Elemente **Hyper-V → APP01, FS01** (ggf. „Hostkomponente“), Zeit 23:00, Ziel E:. *Begründung:* Tägliche, automatische Versionen.
5. **Testwiederherstellung** an einen **alternativen Ort**. *Begründung:* Eine Sicherung ohne erfolgreichen Restore-Test ist keine Sicherung.
6. Für die Zukunft: Ernstfall – APP01 am **ursprünglichen Ort** aus der passenden Version wiederherstellen.

### Ergebnis prüfen
- `wbadmin get versions` → Sicherungsversionen mit Datum.
- `wbadmin get items -version:<Version>` → APP01 und FS01 enthalten.
- Ereignisanzeige → Anwendungs- und Dienstprotokolle → Microsoft → Windows → **Backup** → Erfolg.
- Testwiederherstellung startet fehlerfrei.

### Vorbeugung
- 3-2-1-Regel: zusätzlich Kopie außer Haus/Cloud (z. B. Azure Backup/MARS bzw. MABS).
- Wöchentlicher Restore-Test nach Plan.
- Monitoring auf Sicherungsfehler.

## Einfach
Stell dir vor, du baust ein großes **Lego-Schloss** (die VM). Damit es nach einem Unfall wieder aufgebaut werden kann, machst du jeden Abend ein **genaues Foto** von allem (die Sicherung).

Wichtig ist, dass das Foto **im richtigen Moment** gemacht wird. Wenn gerade jemand eine Mauer halb gebaut hat, ist das Foto unbrauchbar. Deshalb sagt der **Fotograf** (Hyper-V-VSS-Writer) zu den Bauarbeitern im Schloss: „Kurz stillhalten!“ Die Bauarbeiter (der Integrationsdienst „Sicherung“ in der VM) legen ihre Steine sauber ab – **klick** – Foto gemacht, weiterbauen. Das Schloss musste dafür nicht einmal geschlossen werden.

Wenn dann etwas kaputtgeht, nimmst du das Foto von gestern und baust das Schloss genau so wieder auf (Wiederherstellung). Oder du baust es **daneben** nach, um nur einen einzelnen Turm zurückzuholen.

Und das Wichtigste: Ab und zu ausprobieren, ob man mit den Fotos wirklich wieder aufbauen kann!

## Merksatz
- **wbadmin** + **Hyper-V-VSS-Writer** = VM-Sicherung mit Bordmitteln.
- Gast-Integrationsdienst **„Sicherung (Volumeschattenkopie)“** ⇒ **anwendungskonsistent**.
- `vssadmin list writers` → Writer **stabil**?
- **Restore-Test** gehört dazu.

## Prüfungsfalle
- Ohne den Integrationsdienst „Sicherung“ im Gast ist die Sicherung nicht anwendungskonsistent.
- Bei Wiederherstellung am ursprünglichen Ort wird die vorhandene VM **ersetzt**.
- Eine Netzwerkfreigabe als Ziel für geplante Sicherungen hält nur **eine** Version.
- Ein VM-Export ist **keine** Sicherungsstrategie (keine Versionen, keine Automatik).

## Grafik
### Anwendungskonsistente VM-Sicherung
1. wbadmin -> Hyper-V-VSS-Writer: Sicherung von APP01 anfordern
2. HV01 -> APP01: Integrationsdienst Sicherung löst VSS im Gast aus
3. APP01: Anwendung schreibt Puffer, kurz eingefroren
4. HV01: Schattenkopie erstellt, APP01 läuft weiter
5. HV01 -> Backup-Platte E: VHDX und Konfiguration gesichert
6. Admin -> HV01: Wiederherstellung APP01 aus Version 23:00

## Lab
**Nachstellen:** Sicherung erstellen, VM „beschädigen“, wiederherstellen. Maschinen: **HV01**, VM **APP01**, Backup-Datenträger E:.

### GUI
1. **HV01**: Server-Manager → Rollen und Features → Feature **Windows Server-Sicherung**.
2. **HV01**: Hyper-V-Manager → APP01 → Einstellungen → Integrationsdienste → „**Sicherung (Volumeschattenkopie)**“ angehakt.
3. **HV01**: Windows Server-Sicherung → **Einmalsicherung** → Andere Optionen → **Benutzerdefiniert** → Elemente hinzufügen → **Hyper-V** → APP01 → Ziel lokales Laufwerk E: → Sicherung.
4. **APP01**: Testdatei `C:\Daten\wichtig.txt` löschen (Schaden simulieren) → herunterfahren.
5. **HV01**: Windows Server-Sicherung → **Wiederherstellen** → Sicherungsdatum → Wiederherstellungstyp **Hyper-V** → APP01 → „**Am ursprünglichen Speicherort wiederherstellen**“ → Wiederherstellen.
6. **APP01**: starten → Datei wieder vorhanden.
7. **HV01**: Sicherungszeitplan → täglich 23:00 → Hyper-V-Elemente → Ziel E:.

### PowerShell
```powershell
# Auf HV01 – Feature und Writer prüfen
Install-WindowsFeature Windows-Server-Backup
vssadmin list writers | Select-String -Context 0,4 "Hyper-V"

# Auf HV01 – Integrationsdienst Sicherung in APP01
Get-VMIntegrationService -VMName APP01 | Where-Object Name -match "Sicherung|Backup"

# Auf HV01 – Einmalsicherung einer VM
wbadmin start backup -backupTarget:E: -hyperv:"APP01" -quiet

# Auf HV01 – Versionen und Inhalt
wbadmin get versions -backupTarget:E:
# Versionskennung (MM/TT/JJJJ-HH:MM) aus der Ausgabe von get versions übernehmen
wbadmin get items -version:10/09/2026-21:00 -backupTarget:E:

# Auf HV01 – Wiederherstellung am ursprünglichen Ort
wbadmin start recovery -version:10/09/2026-21:00 -itemType:Hyperv -items:APP01 -backupTarget:E:

# Auf HV01 – alternativ an anderen Ort (Test-Restore)
wbadmin start recovery -version:10/09/2026-21:00 -itemType:Hyperv -items:APP01 -alternateLocation -recoveryTarget:D:\Restore -backupTarget:E:
```

## Reihenfolge
### VM-Sicherung mit Bordmitteln einführen
1. Feature Windows Server-Sicherung installieren
2. Integrationsdienst Sicherung in den VMs prüfen
3. VSS-Writer mit vssadmin kontrollieren
4. Geplante Sicherung mit Hyper-V-Elementen einrichten
5. Erste Sicherung prüfen mit wbadmin get versions
6. Testwiederherstellung an alternativen Ort durchführen

## Szenario
### Kontrollfragen
Auf HV01 sollen APP01 und FS01 nächtlich mit Bordmitteln gesichert und bei Bedarf einzeln wiederhergestellt werden.
- F: Welches Feature wird benötigt? | A: Windows Server-Sicherung (Windows-Server-Backup, Befehlszeile wbadmin).
- F: Welcher Integrationsdienst sorgt für anwendungskonsistente Sicherungen? | A: Sicherung (Volumeschattenkopie) im Gast.
- F: Wie prüfst du den Hyper-V-Writer? | A: vssadmin list writers → Microsoft Hyper-V VSS Writer, Status Stabil, kein Fehler.
- F: Welcher wbadmin-Parameter sichert eine einzelne VM? | A: wbadmin start backup -backupTarget:E: -hyperv:"APP01"
- F: Was passiert bei Wiederherstellung am ursprünglichen Ort? | A: Die vorhandene VM wird durch den gesicherten Stand ersetzt.

## Legende
### Hyper-V-VSS-Writer
- Was: VSS-Komponente auf dem Host, die VMs für Sicherungen konsistent bereitstellt.
- Wie: Arbeitet mit dem Integrationsdienst Sicherung im Gast zusammen; Prüfung mit vssadmin list writers.
- Wann: Bei jeder Host-basierten Sicherung (Windows Server-Sicherung, Drittanbieter).
- Wo: Auf dem Hyper-V-Host.
- Warum: Ermöglicht anwendungskonsistente Sicherungen laufender VMs.
### Windows Server-Sicherung
- Was: Bordmittel für Sicherung und Wiederherstellung (GUI und wbadmin).
- Warum: Einfache VM-Sicherung ohne Zusatzsoftware, ideal für kleine Umgebungen.

## Karteikarten
- F: Wie heißt das Feature für Bordmittel-Sicherungen? | A: Windows Server-Sicherung (Windows-Server-Backup).
- F: Befehl zum Sichern einer einzelnen VM? | A: wbadmin start backup -backupTarget:E: -hyperv:"APP01"
- F: Wie listet man Sicherungsversionen? | A: wbadmin get versions
- F: Welcher itemType wird für VM-Wiederherstellung angegeben? | A: -itemType:Hyperv
- F: Wodurch wird eine VM-Sicherung anwendungskonsistent? | A: Durch den Integrationsdienst Sicherung (Volumeschattenkopie), der VSS im Gast auslöst.
- F: Wie prüft man die VSS-Writer? | A: vssadmin list writers
- F: Was ist der Nachteil einer Freigabe als Ziel geplanter Sicherungen? | A: Es wird nur eine Version gehalten (überschrieben).
- F: Warum regelmäßige Restore-Tests? | A: Nur ein erfolgreicher Test beweist, dass die Sicherung brauchbar ist.

## Quiz
? Welches Bordmittel sichert einzelne Hyper-V-VMs auf Host-Ebene?
* Windows Server-Sicherung (wbadmin)
- Disk2vhd von Sysinternals (P2V-Tool)
- Sysprep /generalize /oobe /mode:vm
- Optimize-VHD -Mode Full
! Elemente-Typ Hyper-V.

? Welcher Integrationsdienst ist für anwendungskonsistente Sicherungen nötig?
* Sicherung (Volumeschattenkopie)
- Takt (Heartbeat-Überwachung)
- Gastdienstschnittstelle (Dateikopie)
- Datenaustausch (Key-Value-Pair)
! Er löst VSS im Gast aus.

? Welcher Befehl prüft den Zustand des Hyper-V-VSS-Writers?
* vssadmin list writers
- wbadmin get disks
- Get-VMHost
- diskpart list volume
! Status sollte Stabil ohne Fehler sein.

? Was passiert bei Wiederherstellung am ursprünglichen Speicherort?
* Die vorhandene VM wird ersetzt
- Es entsteht automatisch eine zweite VM
- Nur die Konfiguration wird geändert
- Nichts, es ist nur ein Test
! Für Tests den alternativen Ort wählen.

? Welcher Parameter wählt bei wbadmin start recovery die VM-Wiederherstellung?
* -itemType:Hyperv
- -itemType:File
- -itemType:App
- -itemType:Volume
! Dazu -items:APP01.

? Was ist eine Einschränkung, wenn eine Netzwerkfreigabe Ziel geplanter Sicherungen ist?
* Es bleibt nur eine Sicherungsversion erhalten
- Es gehen keine VMs
- Die Sicherung ist immer verschlüsselt
- Es sind keine geplanten Sicherungen möglich
! Lokale dedizierte Platten halten mehrere Versionen.

? Ist ein einmaliger VM-Export eine Sicherungsstrategie?
* Nein – ohne Versionen und Automatik
- Ja, er ersetzt jede regelmäßige Sicherung
- Ja, aber nur für Gen-1-VMs ohne Prüfpunkte
- Nur in Clustern mit freigegebenem Speicher
! Sicherung = regelmäßig, versioniert, getestet.

? Was ergänzt die Bordmittel-Sicherung sinnvoll im Sinne der 3-2-1-Regel?
* Eine Kopie außer Haus bzw. in der Cloud
- Ein zweiter Prüfpunkt
- Ein Export auf denselben Datenträger
- Dynamischer Arbeitsspeicher
! 3 Kopien, 2 Medien, 1 extern.
