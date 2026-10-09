---
id: server-hvsz-08
bereich: AZ-800
block: HV-S
kapitel: Hyper-V-Praxisszenarien
titel: Szenario 08 – Produktionsprüfpunkt schlägt fehl
stufe: Fortgeschritten
fach: Windows Server / AZ-800
pruefungen: [AZ-800, AP2, Schule]
quellen: [Microsoft Learn – Hyper-V]
verweise: [az800-pruefpunkte, az800-integrationsdienste, server-hvsz-07, server-hvsz-09]
---

## Profi

### Ticket
**Kunde meldet:** „Vor dem SQL-Update wollte ich einen Prüfpunkt erstellen. Hyper-V meldet, dass der Produktionsprüfpunkt nicht erstellt werden kann. Früher ging das.“
- Datum/Priorität: 03.10.2026, **Priorität 2 (hoch)** – Update-Fenster läuft.
- Betroffene Maschine: VM **SQL01** auf **HV01.example.com**.
- Meldung (sinngemäß): *„Produktionsprüfpunkte können für 'SQL01' nicht erstellt werden. … Fehler beim Erstellen eines Prüfpunkts …“*

### Ausgangslage
- Host **HV01.example.com**, Server 2025. SQL01: Gen 2, Server 2022, SQL Server, IP 192.168.10.45.
- Prüfpunkttyp: **Nur Produktionsprüfpunkte** (*ProductionOnly*) – ein Kollege hat die Option „Standardprüfpunkt erstellen, wenn Produktionsprüfpunkt nicht möglich“ abgewählt.
- Bei einer Härtungsaktion wurden Integrationsdienste „aufgeräumt“.

### Analyse
Ein **Produktionsprüfpunkt** nutzt im Windows-Gast den **Volumeschattenkopie-Dienst (VSS)** – wie eine Sicherung. Der Host fordert über den Integrationsdienst **Sicherung (Volumeschattenkopie)** (*Backup (volume shadow copy)*) eine anwendungskonsistente Momentaufnahme im Gast an. Fehlt dieser Weg, schlägt der Produktionsprüfpunkt fehl. Mit Typ **Production** würde Hyper-V dann automatisch auf einen **Standardprüfpunkt** zurückfallen; mit **ProductionOnly** bricht er ab.

| Hypothese | Prüfung |
|---|---|
| Integrationsdienst „Sicherung (Volumeschattenkopie)“ am Host deaktiviert | `Get-VMIntegrationService -VMName SQL01` |
| Dienst im Gast gestoppt/deaktiviert (*Hyper-V-Volumeschattenkopie-Anforderer*, vmicvss) | `Get-Service vmicvss` in SQL01 |
| VSS-Writer im Gast fehlerhaft (z. B. SqlServerWriter) | `vssadmin list writers` in SQL01 |
| Zu wenig Schattenkopie-Speicher / Volume ohne NTFS/ReFS | Ereignisanzeige *Application*, Quelle VSS |
| Gast ohne aktuelle Integrationsdienste | Betriebssystemversion/Windows Update |

**Befund:** Integrationsdienst **Sicherung (Volumeschattenkopie)** am Host deaktiviert.

### Lösungsweg
1. **Integrationsdienst aktivieren** (am Host, online möglich) – Begründung: stellt den VSS-Kanal Host ↔ Gast wieder her.
2. **Im Gast** Dienst *Hyper-V-Volumeschattenkopie-Anforderer* prüfen und starten – Begründung: Er nimmt die Anforderung im Gast entgegen.
3. **VSS-Writer prüfen**: Alle Writer *Stabil*, *Kein Fehler* – Begründung: Ein hängender Writer (z. B. SQL) verhindert die Konsistenz.
4. **Prüfpunkt erneut erstellen** – Begründung: Bestätigt die Ursache.
5. **Prüfpunkttyp** bewusst wählen: Für Produktionsserver *Production* (mit Fallback) oder *ProductionOnly*, wenn ein absturzkonsistenter Fallback **nicht** erwünscht ist (z. B. DCs/Datenbanken). Die Entscheidung dokumentieren.

### Ergebnis prüfen
- `Get-VMCheckpoint -VMName SQL01` zeigt den neuen Prüfpunkt mit **CheckpointType Production**.
- Ereignisprotokoll *Microsoft-Windows-Hyper-V-VMMS-Admin* ohne neue Fehler.
- Nach dem Update Prüfpunkt **löschen** (Zusammenführen).

### Vorbeugung
- Integrationsdienste nicht pauschal abschalten; Änderungen dokumentieren.
- Regelmäßig `vssadmin list writers` und Sicherungsprotokolle prüfen (Backups nutzen denselben Weg).
- Prüfpunkttyp per Skript/Richtlinie für Server-VMs einheitlich setzen.

## Einfach

Ein **Produktionsprüfpunkt** ist wie ein **Klassenfoto**, bei dem vorher alle Kinder **stillhalten** sollen. Dafür ruft der Fotograf (der Host) durch ein **Sprachrohr** in die Klasse (den Integrationsdienst „Sicherung“): „Alle bitte stillhalten!“ Die Lehrerin in der Klasse (der VSS-Dienst im Gast) sorgt dafür, dass alle kurz still sind. Dann ist das Foto **scharf** – jede Datenbank ist sauber gespeichert.

Wenn jemand das **Sprachrohr abgeklemmt** hat, hört die Klasse den Fotografen nicht. Der Fotograf kann kein ordentliches Foto machen.

Jetzt gibt es zwei Einstellungen:
- **„Produktion“**: Dann macht der Fotograf eben ein **Schnappschuss-Foto** mitten in der Bewegung (Standardprüfpunkt) – vielleicht etwas verwackelt.
- **„Nur Produktion“**: Dann macht er **gar kein Foto** und sagt Bescheid.

Die Lösung: das **Sprachrohr wieder anschließen** (Integrationsdienst aktivieren) und schauen, ob die Lehrerin bereit ist (VSS-Dienst und Writer im Gast).

## Merksatz
- Produktionsprüfpunkt = **VSS im Gast** = anwendungskonsistent.
- Voraussetzung: Integrationsdienst **Sicherung (Volumeschattenkopie)**.
- *Production* fällt auf Standard zurück, *ProductionOnly* nicht.

## Prüfungsfalle
- Standardprüfpunkte speichern **auch den RAM**; Produktionsprüfpunkte nicht – nach dem Anwenden startet die VM **ausgeschaltet**.
- Der Integrationsdienst heißt **Sicherung (Volumeschattenkopie)** – nicht „Gastdienste“.
- Mit Typ *Production* gibt es bei VSS-Fehlern **keinen** Fehler, sondern stillschweigend einen Standardprüfpunkt.
- Linux-Gäste nutzen statt VSS einen Dateisystem-Freeze.

## Grafik
### Klassenfoto mit VSS
1. Admin -> HV01: Produktionsprüfpunkt für SQL01 anfordern
2. HV01 -> SQL01: VSS-Anforderung über Integrationsdienst Sicherung
3. SQL01: Integrationsdienst deaktiviert – keine Antwort
4. HV01 -> Admin: Fehler, Typ ProductionOnly erlaubt keinen Fallback
5. Admin -> HV01: Integrationsdienst Sicherung aktivieren
6. HV01 -> SQL01: VSS-Anforderung erneut
7. SQL01 -> HV01: Writer eingefroren, Schattenkopie konsistent
8. HV01: Produktionsprüfpunkt erstellt

## Lab
**Maschinen**: Host **HV01.example.com**, VM **SQL01** (Windows Server mit beliebiger Anwendung).
Nachstellen: Zuerst den Fehler bewusst erzeugen, dann beheben.

### GUI
1. **HV01**: Hyper-V-Manager → SQL01 → Einstellungen → **Prüfpunkte** → **Produktionsprüfpunkte** wählen, Haken „Standardprüfpunkte erstellen, wenn …“ **entfernen** → OK.
2. **HV01**: SQL01 → Einstellungen → **Integrationsdienste** → Haken **Sicherung (Volumeschattenkopie)** entfernen → OK (Fehlerzustand).
3. **HV01**: SQL01 → **Prüfpunkt** → Fehlermeldung lesen.
4. **HV01**: SQL01 → Einstellungen → Integrationsdienste → **Sicherung (Volumeschattenkopie)** wieder aktivieren → OK.
5. **SQL01**: Dienste (`services.msc`) → **Hyper-V-Volumeschattenkopie-Anforderer** → Status *Wird ausgeführt*.
6. **SQL01**: Eingabeaufforderung als Administrator → `vssadmin list writers` → alle Writer *Stabil*.
7. **HV01**: SQL01 → **Prüfpunkt** → Erfolg; Prüfpunkt nach dem Test **löschen**.

### PowerShell
1. **HV01**: Fehler erzeugen.
2. **HV01** und **SQL01**: Ursache prüfen.
3. **HV01**: Beheben und Prüfpunkt erstellen.

```powershell
# Auf HV01 – Fehler erzeugen
Set-VM -Name SQL01 -CheckpointType ProductionOnly
Get-VMIntegrationService -VMName SQL01 | Where-Object Name -match "Volumeschattenkopie|shadow copy" | Disable-VMIntegrationService
Checkpoint-VM -Name SQL01 -SnapshotName "Vor SQL-Update"     # schlägt fehl

# Auf HV01 – Ursache prüfen
Get-VMIntegrationService -VMName SQL01 | Format-Table Name, Enabled, PrimaryStatusDescription

# In SQL01 – per PowerShell Direct prüfen
Invoke-Command -VMName SQL01 -Credential (Get-Credential) -ScriptBlock {
  Get-Service vmicvss
  vssadmin list writers
}

# Auf HV01 – Beheben
Get-VMIntegrationService -VMName SQL01 | Where-Object Name -match "Volumeschattenkopie|shadow copy" | Enable-VMIntegrationService
Checkpoint-VM -Name SQL01 -SnapshotName "Vor SQL-Update"
Get-VMCheckpoint -VMName SQL01 | Format-Table Name, CheckpointType, CreationTime
Set-VM -Name SQL01 -CheckpointType Production                # mit Fallback, falls gewünscht
```

## Szenario
### Kontrollfragen
Für SQL01 (Typ „Nur Produktionsprüfpunkte“) schlägt das Erstellen eines Prüfpunkts fehl; der Integrationsdienst Sicherung ist deaktiviert.
- F: Welche Technik nutzt ein Produktionsprüfpunkt im Windows-Gast? | A: Den Volumeschattenkopie-Dienst (VSS) für eine anwendungskonsistente Momentaufnahme.
- F: Welcher Integrationsdienst ist Voraussetzung? | A: Sicherung (Volumeschattenkopie) / Backup (volume shadow copy).
- F: Warum gab es keinen Standardprüfpunkt als Ersatz? | A: Der Typ ist ProductionOnly; nur der Typ Production fällt automatisch auf einen Standardprüfpunkt zurück.
- F: Wie prüft man die VSS-Writer im Gast? | A: vssadmin list writers (alle Writer sollen „Stabil“ und „Kein Fehler“ zeigen).
- F: Was unterscheidet das Anwenden eines Produktionsprüfpunkts vom Standardprüfpunkt? | A: Die VM ist danach ausgeschaltet und bootet neu; der RAM-Zustand wird nicht wiederhergestellt.

## Reihenfolge
### Produktionsprüfpunkt reparieren
1. Fehlermeldung und Prüfpunkttyp prüfen
2. Integrationsdienst Sicherung am Host prüfen und aktivieren
3. Dienst Hyper-V-Volumeschattenkopie-Anforderer im Gast prüfen
4. VSS-Writer im Gast prüfen
5. Prüfpunkt erneut erstellen
6. Prüfpunkttyp bewusst festlegen und dokumentieren

## Legende
### Produktionsprüfpunkt
- Was: Anwendungskonsistenter Prüfpunkt per VSS im Gast (Linux: Dateisystem-Freeze), ohne RAM-Zustand.
- Wie: `Set-VM -CheckpointType Production` bzw. `ProductionOnly`, dann `Checkpoint-VM`.
- Wann: vor Updates/Änderungen an produktiven Servern.
- Wo: auf HV01 angefordert, ausgeführt im Gast über den Integrationsdienst Sicherung.
- Warum: Datenbanken und Dienste sind nach dem Anwenden in einem sauberen Zustand – wie nach einer Wiederherstellung aus dem Backup.

## Karteikarten
- F: Worauf basiert ein Produktionsprüfpunkt im Windows-Gast? | A: Auf dem Volumeschattenkopie-Dienst (VSS).
- F: Welcher Integrationsdienst ist dafür nötig? | A: Sicherung (Volumeschattenkopie).
- F: Unterschied Production und ProductionOnly? | A: Production fällt bei Fehler auf einen Standardprüfpunkt zurück, ProductionOnly bricht ab.
- F: Wie heißt der zugehörige Dienst im Gast? | A: Hyper-V-Volumeschattenkopie-Anforderer (vmicvss).
- F: Mit welchem Befehl prüft man VSS-Writer? | A: vssadmin list writers
- F: Speichert ein Produktionsprüfpunkt den RAM? | A: Nein, nur Festplatten und Konfiguration; die VM bootet nach dem Anwenden neu.
- F: Wie aktiviert man einen Integrationsdienst per PowerShell? | A: Enable-VMIntegrationService -VMName <VM> -Name <Dienst>
- F: Was nutzen Linux-Gäste statt VSS? | A: Einen Dateisystem-Freeze.
- F: Welcher Prüfpunkttyp ist seit Server 2016 Standard? | A: Produktionsprüfpunkt (mit Fallback auf Standard).

## Quiz
? Welche Voraussetzung fehlt, wenn der Produktionsprüfpunkt scheitert?
* Integrationsdienst Sicherung (Volumeschattenkopie)
- Integrationsdienst Zeitsynchronisierung
- Erweiterter Sitzungsmodus
- MAC-Spoofing
! Produktionsprüfpunkte nutzen VSS über diesen Integrationsdienst.

? Was macht der Typ „Production“, wenn VSS fehlschlägt?
* Er erstellt stattdessen einen Standardprüfpunkt
- Er bricht immer mit Fehler ab
- Er startet die VM neu
- Er erstellt ein Backup in Azure
! Nur ProductionOnly bricht ab.

? Welcher Befehl setzt „Nur Produktionsprüfpunkte“?
* Set-VM -Name SQL01 -CheckpointType ProductionOnly
- Set-VM -Name SQL01 -CheckpointType Standard
- Checkpoint-VM -Name SQL01 -Production
- Set-VMHost -CheckpointType Production
! Der Prüfpunkttyp ist eine VM-Eigenschaft.

? In welchem Zustand ist die VM nach dem Anwenden eines Produktionsprüfpunkts?
* Ausgeschaltet
- Läuft im gespeicherten RAM-Zustand weiter
- Angehalten – Kritisch
- Gespeichert
! Produktionsprüfpunkte enthalten keinen Arbeitsspeicher.

? Womit prüft man VSS-Writer im Gast?
* vssadmin list writers
- Get-VMCheckpoint
- chkdsk /writers
- diskshadow /reset
! Writer müssen „Stabil“ und ohne Fehler sein.

? Welcher Dienst im Windows-Gast nimmt die VSS-Anforderung des Hosts entgegen?
* Hyper-V-Volumeschattenkopie-Anforderer
- Hyper-V-Taktdienst
- Remotedesktopdienste
- Windows-Zeitgeber
! Dienstname vmicvss.

? Welche Konsistenz bietet ein Standardprüfpunkt?
* Zustand inklusive RAM, nicht anwendungskonsistent
- Anwendungskonsistent per VSS
- Nur Konfiguration
- Gar keine Festplattendaten
! Standardprüfpunkte frieren alles inklusive laufender Programme ein.

? Kann man Integrationsdienste bei laufender VM aktivieren?
* Ja
- Nein, VM muss aus sein
- Nur bei Gen-1-VMs
- Nur über die Gast-GUI
! Integrationsdienste lassen sich online ein- und ausschalten.
