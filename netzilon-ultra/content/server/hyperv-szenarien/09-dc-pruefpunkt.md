---
id: server-hvsz-09
bereich: AZ-800
block: HV-S
kapitel: Hyper-V-Praxisszenarien
titel: Szenario 09 – Domänencontroller-VM per Prüfpunkt zurückgesetzt
stufe: Profi
fach: Windows Server / AZ-800
pruefungen: [AZ-800, AP2, Schule]
quellen: [Microsoft Learn – Hyper-V]
verweise: [az800-pruefpunkte, az800-adds-dc, az801-ad-replikation, az801-dsrm-sysvol, server-hvsz-08]
---

## Profi

### Ticket
**Kunde meldet:** „Nach einem fehlgeschlagenen Update hat ein Kollege DC02 auf den Prüfpunkt von letzter Woche zurückgesetzt. Seitdem fehlen zwei neue Benutzer auf DC02, und wir sind unsicher, ob die Domäne jetzt kaputt ist.“
- Datum/Priorität: 04.10.2026, **Priorität 1 (kritisch)** – Verzeichnisdienst betroffen.
- Betroffene Maschine: VM **DC02** auf **HV01.example.com**; zweiter DC **DC01** (physisch bzw. auf anderem Host).

### Ausgangslage
- Domäne **example.com**, Gesamtstruktur-/Domänenfunktionsebene Windows Server 2016 oder höher.
- **DC01** 192.168.10.10 (Server 2025), **DC02** 192.168.10.11 (Server 2025, VM auf HV01, Gen 2).
- Auf DC02 wurde vor 7 Tagen ein Prüfpunkt erstellt; heute wurde er **angewendet**.

### Analyse
Früher (vor Server 2012) war das Zurücksetzen eines DC per Snapshot gefährlich: Der DC nutzte seine alten **USN**-Zähler (Update Sequence Numbers) weiter, die Replikationspartner hielten seine neuen Änderungen für bereits bekannt → **USN-Rollback**, dauerhaft inkonsistente Verzeichnisse.

Seit **Windows Server 2012** gibt es die **VM-Generations-ID** (*VM-GenerationID*): ein Wert, den der Hypervisor der VM bereitstellt und der sich beim **Anwenden eines Prüfpunkts** ändert. Ein DC ab 2012 speichert den Wert im Verzeichnis (msDS-GenerationId) und vergleicht ihn beim Start bzw. vor Schreibvorgängen. Bei Abweichung greifen **Virtualisierungsschutzmaßnahmen**:
- **InvocationID** wird zurückgesetzt → Partner behandeln DC02 als „neue“ Datenbankinstanz und replizieren ihm alle Änderungen erneut.
- Der aktuelle **RID-Pool wird verworfen** (keine doppelten SIDs).
- **SYSVOL** wird **nicht autoritativ** neu synchronisiert.

| Hypothese | Prüfung |
|---|---|
| Schutz durch VM-GenerationID hat gegriffen | Ereignisprotokoll *Verzeichnisdienst* auf DC02: Ereignis **2170** (Änderung der Generations-ID erkannt) |
| USN-Rollback ohne Schutz | Ereignis **2095**, Registry *Dsa Not Writable*, NetLogon pausiert |
| Replikation läuft wieder | `repadmin /showrepl DC02`, `repadmin /replsummary` |
| Neue Benutzer existieren auf DC01 | `Get-ADUser` gegen DC01 |

**Befund:** Ereignis 2170 vorhanden, Replikation von DC01 läuft – die Benutzer kommen per Replikation zurück. Verloren wären nur Änderungen, die **ausschließlich** auf DC02 gemacht und noch nicht repliziert waren.

### Lösungsweg
1. **Ereignisprotokoll prüfen** (2170 vorhanden? 2095 nicht?) – Begründung: Klarheit, ob Schutz griff oder ein echter USN-Rollback vorliegt.
2. **Replikation anstoßen und prüfen**: `repadmin /syncall /AdeP`, `repadmin /replsummary` – Begründung: DC02 holt alle Änderungen von DC01.
3. **SYSVOL-Status prüfen** (DFSR-Ereignisse) – Begründung: Gruppenrichtlinien müssen identisch sein.
4. Falls **2095/USN-Rollback** (z. B. älterer DC ohne Schutz): DC02 **nicht reparieren**, sondern herabstufen bzw. entfernen, Metadaten bereinigen, neu heraufstufen – Begründung: Microsoft unterstützt keine Reparatur eines Rollback-DCs.
5. **Sicherheitsaspekt**: Der Prüfpunkt enthielt eine Kopie der **NTDS.dit** samt Kennworthashes – Prüfpunkt löschen bzw. Dateien sicher entfernen, Zugriff auf Hyper-V-Speicher auf DC-Admins beschränken.

### Warum DC-Wiederherstellung nur über Backup
- Microsoft empfiehlt für DCs die Wiederherstellung über eine **Systemstatus-Sicherung** (Windows Server-Sicherung bzw. AD-fähiges Backup) – nur so sind **nicht autoritative** und **autoritative Wiederherstellung** (z. B. gelöschte OU zurückholen mit `ntdsutil`) sauber steuerbar.
- Prüfpunkte sind **kein Backup** (gleicher Speicher, abhängig von der Kette) und ersetzen weder AD-Papierkorb noch Systemstatus-Sicherung.
- VM-GenerationID schützt nur, wenn **Hypervisor und DC** sie unterstützen (Hyper-V ab 2012, DC ab 2012); bei Exporten auf fremde Plattformen ist das nicht garantiert.

### Ergebnis prüfen
- `repadmin /replsummary` ohne Fehler, `dcdiag /v` ohne Fehler auf DC02.
- Die neuen Benutzer sind auf DC02 sichtbar.
- Kein Ereignis 2095; NetLogon läuft.

### Vorbeugung
- Für DCs **keine Standardprüfpunkte** als Rückfallebene; wenn Prüfpunkte, dann **Produktionsprüfpunkte**, und kurz.
- Regelmäßige **Systemstatus-Sicherung** und **AD-Papierkorb** aktivieren.
- Mindestens **zwei DCs** auf unterschiedlichen Hosts.

## Einfach

Stell dir die Domäne wie ein **Klassenbuch** vor, das zwei Lehrerinnen (DC01 und DC02) gleichzeitig führen. Jede Eintragung bekommt eine **laufende Nummer**. Die beiden tauschen regelmäßig aus: „Ich habe die Nummern bis 500, du?“

Wenn DC02 plötzlich auf den **Stand von letzter Woche** zurückgedreht wird, hat sie nur noch Nummern bis 400 im Kopf. Früher hätte sie neue Einträge wieder mit 401, 402 … nummeriert – DC01 hätte gesagt: „Die kenne ich schon“ und sie ignoriert. Das Klassenbuch wäre durcheinander (**USN-Rollback**).

Heute hat jede VM ein **Geburtstagsarmband** (die VM-Generations-ID). Wird DC02 zurückgedreht, bekommt sie ein **neues Armband**. DC02 merkt: „Hoppla, ich wurde zurückgedreht!“ und sagt zu DC01: „Bitte behandle mich wie eine **neue Kollegin** und gib mir alles noch einmal.“ So kommen die fehlenden Benutzer zurück.

Trotzdem gilt: Ein Klassenbuch rettet man mit einer **richtigen Sicherungskopie**, nicht mit einem Schnappschuss. Und wer Zugang zu den Schnappschüssen hat, könnte alle **Geheimnisse** (Kennwörter) lesen – also gut wegschließen.

## Merksatz
- VM-GenerationID ändert sich beim **Prüfpunkt anwenden** → DC setzt **InvocationID** zurück.
- Ereignis **2170** = Schutz gegriffen, **2095** = USN-Rollback.
- DC-Wiederherstellung über **Systemstatus-Backup**, nicht über Prüfpunkte.
- Rollback-DC nicht reparieren, sondern **neu aufsetzen**.

## Prüfungsfalle
- VM-GenerationID schützt **nicht** vor Verlust von Änderungen, die nur auf diesem DC lagen.
- Schutz erst ab **Server 2012** (DC **und** Hypervisor).
- Ein **Produktionsprüfpunkt** ist für DCs unterstützt, ersetzt aber nicht die Systemstatus-Sicherung.
- Autoritative Wiederherstellung (gelöschte Objekte zurückholen) geht nur mit Backup + `ntdsutil` bzw. AD-Papierkorb – nicht mit Prüfpunkten.

## Grafik
### Generations-ID schützt die Replikation
1. Admin -> HV01: Prüfpunkt von DC02 anwenden
2. HV01 -> DC02: Neue VM-Generations-ID bereitgestellt
3. DC02: Gespeicherte und aktuelle ID unterscheiden sich – Ereignis 2170
4. DC02: InvocationID zurückgesetzt, RID-Pool verworfen
5. DC02 -> DC01: Bitte alle Änderungen neu replizieren
6. DC01 -> DC02: Replikation der fehlenden Benutzer
7. DC02: SYSVOL nicht autoritativ synchronisiert

## Lab
**Maschinen**: Host **HV01.example.com**, VM **DC02** (Server 2025, zweiter DC), **DC01** (erster DC). Nur im Lab durchführen!
Nachstellen: Zuerst den Fehlerfall bewusst erzeugen, dann prüfen und beheben.

### GUI
1. **HV01**: Hyper-V-Manager → DC02 → Einstellungen → Prüfpunkte → **Produktionsprüfpunkte** → OK → Rechtsklick DC02 → **Prüfpunkt** „DC02 vorher“.
2. **DC01**: Active Directory-Benutzer und -Computer → neuen Benutzer **lab.neu** anlegen → warten, bis er auf DC02 sichtbar ist.
3. **HV01**: Hyper-V-Manager → DC02 → Prüfpunkt „DC02 vorher“ → **Anwenden** (Fehlerfall) → DC02 starten.
4. **DC02**: Ereignisanzeige → Anwendungs- und Dienstprotokolle → **Verzeichnisdienst** → nach Ereignis-ID **2170** filtern.
5. **DC02**: Active Directory-Standorte und -Dienste → Standort → Server → DC02 → NTDS Settings → Verbindung → **Jetzt replizieren**.
6. **DC02**: Active Directory-Benutzer und -Computer → **lab.neu** ist wieder vorhanden.
7. **HV01**: Prüfpunkt „DC02 vorher“ **löschen** (enthält eine Kopie der Verzeichnisdatenbank).

### PowerShell
1. **HV01**: Prüfpunkt erstellen und später anwenden.
2. **DC01**: Testbenutzer anlegen.
3. **DC02**: Schutz und Replikation prüfen.

```powershell
# Auf HV01
Set-VM -Name DC02 -CheckpointType Production
Checkpoint-VM -Name DC02 -SnapshotName "DC02 vorher"

# Auf DC01
New-ADUser -Name "lab.neu" -Path "CN=Users,DC=example,DC=com"

# Auf HV01 – Fehlerfall erzeugen
Restore-VMCheckpoint -VMName DC02 -Name "DC02 vorher" -Confirm:$false
Start-VM -Name DC02

# Auf DC02 – prüfen und beheben
Get-WinEvent -LogName "Directory Service" | Where-Object Id -in 2170, 2095 | Select-Object TimeCreated, Id, Message -First 5
repadmin /syncall /AdeP
repadmin /replsummary
Get-ADUser -Identity lab.neu -Server DC02

# Auf HV01 – Prüfpunkt entfernen
Remove-VMCheckpoint -VMName DC02 -Name "DC02 vorher"
```

## Szenario
### Kontrollfragen
DC02 (Server 2025, VM) wurde auf einen sieben Tage alten Prüfpunkt zurückgesetzt. Neue Benutzer fehlen zunächst auf DC02.
- F: Welche Funktion verhindert einen USN-Rollback? | A: Die VM-Generations-ID: Der DC erkennt die Änderung und setzt seine InvocationID zurück, verwirft den RID-Pool und synchronisiert SYSVOL nicht autoritativ.
- F: Welches Ereignis zeigt, dass der Schutz gegriffen hat? | A: Ereignis 2170 im Protokoll Verzeichnisdienst.
- F: Was zeigt Ereignis 2095? | A: Einen erkannten USN-Rollback; der DC sollte dann herabgestuft/entfernt und neu aufgesetzt werden.
- F: Welche Änderungen gehen trotz Schutz verloren? | A: Änderungen, die nur auf DC02 gemacht und noch nicht repliziert waren.
- F: Warum ist eine Systemstatus-Sicherung der richtige Weg? | A: Nur sie ermöglicht kontrollierte nicht autoritative und autoritative Wiederherstellung; Prüfpunkte sind kein Backup.

## Reihenfolge
### DC nach Prüfpunkt-Rücksetzung prüfen
1. Verzeichnisdienst-Ereignisse auf 2170 und 2095 prüfen
2. Replikation anstoßen
3. Replikationszusammenfassung prüfen
4. SYSVOL-Replikation prüfen
5. Fehlende Objekte kontrollieren
6. Prüfpunkt löschen und Backup-Konzept anpassen

## Legende
### VM-Generations-ID (VM-GenerationID)
- Was: Vom Hypervisor bereitgestellter Wert, der sich ändert, wenn eine VM auf einen früheren Zustand zurückgesetzt oder kopiert wird.
- Wie: Der DC vergleicht ihn mit dem gespeicherten Wert (msDS-GenerationId) und aktiviert bei Abweichung Schutzmaßnahmen.
- Wann: beim Anwenden von Prüfpunkten, Wiederherstellen von VM-Kopien, Importieren.
- Wo: zwischen Hyper-V-Host (HV01) und Domänencontroller-Gast (DC02), ab Server 2012.
- Warum: verhindert USN-Rollback und doppelte RIDs bei virtualisierten Domänencontrollern.

## Karteikarten
- F: Was ist ein USN-Rollback? | A: Ein DC nutzt nach Zurücksetzen alte USNs erneut; Partner ignorieren seine Änderungen, das Verzeichnis wird inkonsistent.
- F: Ab welcher Version gibt es den Schutz per VM-Generations-ID? | A: Ab Windows Server 2012 (Hypervisor und DC).
- F: Was setzt ein DC bei geänderter Generations-ID zurück? | A: Die InvocationID; zusätzlich verwirft er den RID-Pool und synchronisiert SYSVOL nicht autoritativ.
- F: Welches Ereignis zeigt die erkannte Änderung der Generations-ID? | A: Ereignis 2170 (Verzeichnisdienst).
- F: Welches Ereignis zeigt einen USN-Rollback? | A: Ereignis 2095.
- F: Wie stellt man einen DC unterstützt wieder her? | A: Über eine Systemstatus-Sicherung (nicht autoritativ oder autoritativ mit ntdsutil).
- F: Warum sind DC-Prüfpunkte ein Sicherheitsrisiko? | A: Sie enthalten eine Kopie der NTDS.dit mit Kennworthashes.
- F: Was tut man mit einem DC im USN-Rollback? | A: Herabstufen bzw. entfernen, Metadaten bereinigen, neu heraufstufen.
- F: Befehl für eine Replikationsübersicht? | A: repadmin /replsummary

## Quiz
? Was verhindert seit Server 2012 einen USN-Rollback nach dem Anwenden eines Prüfpunkts?
* Die VM-Generations-ID
- Die erweiterte Sitzung
- Der Integrationsdienst Zeitsynchronisierung
- Dynamic Memory
! Der DC erkennt die geänderte ID und setzt seine InvocationID zurück.

? Welches Ereignis zeigt, dass der Schutz gegriffen hat?
* 2170
- 2095
- 4624
- 1074
! 2095 steht für einen erkannten USN-Rollback.

? Was macht DC02 nach erkannter Generations-ID-Änderung NICHT?
* DC01 autoritativ mit seinem alten Stand überschreiben
- Seine InvocationID für die Replikation zurücksetzen
- Seinen aktuellen RID-Pool verwerfen und neu anfordern
- SYSVOL nicht autoritativ von Partnern synchronisieren
! Der alte Stand wird gerade nicht autoritativ verteilt.

? Welche Daten können trotz Schutz verloren gehen?
* Nur auf DC02 vorhandene, nicht replizierte Änderungen
- Sämtliche Benutzerkonten der gesamten Domäne
- Ausschließlich die Gruppenrichtlinien auf DC01
- Keine – der Schutz verhindert jeden Datenverlust
! Was nicht repliziert war, existiert nur im verworfenen Zustand.

? Wie wird ein DC laut Microsoft wiederhergestellt?
* Über eine Systemstatus-Sicherung
- Über den ältesten Prüfpunkt
- Über Export/Import der VM
- Über das Kopieren der NTDS.dit von DC01
! Prüfpunkte ersetzen keine AD-fähige Sicherung.

? Was tut man mit einem DC, der einen USN-Rollback hat?
* Herabstufen/entfernen und neu heraufstufen
- Mit repadmin /syncall reparieren
- Den Prüfpunkt erneut anwenden
- Die InvocationID manuell auf 0 setzen
! Microsoft unterstützt keine Reparatur eines Rollback-DCs.

? Warum sind DC-Prüfpunkte sicherheitskritisch?
* Sie enthalten die AD-Datenbank mit Kennworthashes
- Sie öffnen automatisch LDAP-Port 389 nach außen
- Sie deaktivieren Kerberos auf dem Domänencontroller
- Sie löschen beim Anwenden alle Firewallregeln
! Wer Zugriff auf die Dateien hat, kann Hashes auslesen.

? Welches Werkzeug zeigt eine Zusammenfassung der AD-Replikation?
* repadmin /replsummary
- Get-VMReplication
- dcpromo /check
- netdom query fsmo
! Get-VMReplication betrifft Hyper-V-Replikat, nicht AD.
