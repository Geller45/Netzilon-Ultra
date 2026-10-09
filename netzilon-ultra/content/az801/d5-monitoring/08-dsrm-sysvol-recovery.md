---
id: az801-dsrm-sysvol
bereich: AZ-801
block: A10
kapitel: Monitoring und Troubleshooting
titel: DSRM und SYSVOL-Recovery
stufe: Profi
quellen: [AZ-801 Study Guide, Microsoft Learn]
verweise: [az801-ad-papierkorb, az801-ad-replikation, az801-admt, az800-fsmo]
---

## Profi

### DSRM (Directory Services Restore Mode)
**DSRM** **ist ein Startmodus** **eines Domänencontrollers**, **in dem** **AD DS** **nicht** **läuft**, **damit** **man** **die AD-Datenbank** **offline** **wiederherstellen** **oder** **reparieren kann**.

| Punkt | Erklärung |
|---|---|
| **Anmeldung** | **Lokales Konto** **`.\Administrator`** **mit DSRM-Kennwort** **(nicht Domänenkonto)** |
| **DSRM-Kennwort** | **Wird** **bei der Heraufstufung** **festgelegt** |
| **Kennwort ändern** | `ntdsutil` → `set dsrm password` |
| **Mit Domänenkennwort synchronisieren** | `ntdsutil` → `set dsrm password` → `sync from domain account <Konto>` |
| **Start** | `bcdedit /set safeboot dsrepair` + `shutdown /r /t 0` |
| **Normal starten** | `bcdedit /deletevalue safeboot` |
| **Alternativ** | **F8** **(ältere Systeme)**, **`msconfig`** **→ Start → Abgesicherter Start → Active Directory-Reparatur** |

### Zwei Arten der Wiederherstellung
| Art | Bedeutung | Einsatz |
|---|---|---|
| **Nichtautorisierend** (*Non-authoritative*) | **DC** **wird** **aus** **Backup** **zurückgespielt**, **danach** **repliziert** **er** **Änderungen** **von** **Partnern** **(überschreibt** **Stand)** | **DC-Ausfall**, **Datenbank defekt** |
| **Autorisierend** (*Authoritative*) | **Wiederhergestellte** **Objekte** **bekommen** **höhere Versionsnummer** **und** **werden** **an alle DCs** **repliziert** | **Objekte versehentlich gelöscht** **(Papierkorb aus)** |

### Ablauf: Nichtautorisierende Wiederherstellung
1. **DC** **in DSRM** **starten**.
2. **Systemstatus** **wiederherstellen** (**Windows Server Backup**).
3. **Neustart** **normal**.
4. **Replikation** **holt** **Änderungen** **nach**.

```powershell
# Im DSRM auf DC02
wbadmin get versions
wbadmin start systemstaterecovery -version:09/29/2026-02:00 -quiet
shutdown /r /t 0
```

### Ablauf: Autorisierende Wiederherstellung
1. **Nichtautorisierende** **Wiederherstellung** **durchführen** **– noch nicht neu starten**.
2. **`ntdsutil`** **starten**:
```
activate instance ntds
authoritative restore
restore object "CN=Anna Meier,OU=Vertrieb,DC=exa,DC=local"
restore subtree "OU=Vertrieb,DC=exa,DC=local"
quit
quit
```
3. **Neustart** **normal**. **Objekte** **replizieren** **autorisierend**.
4. **Gruppenmitgliedschaften** **(Rückverweise)** **ggf.** **mit** **LDIF** **(`ldifde`)** **nachziehen**.

### USN-Rollback und VM-Sicherheit
- **Virtuelle DCs** **nie** **mit** **Prüfpunkten/Snapshots** **zurücksetzen**, **sonst** **USN-Rollback** **(Replikationsbruch)**.
- **Hyper-V ab 2016** **und** **VM-GenerationID** **erkennt** **Rücksetzen** **und** **schützt** **(neue InvocationID)**.
- **Klonen** **von DCs**: **`DCCloneConfig.xml`**, **Gruppe** **„Klonbare Domänencontroller“**.

### SYSVOL-Recovery
**SYSVOL** **enthält** **Gruppenrichtlinien** **und** **Anmeldeskripte**, **repliziert** **mit** **DFSR** **(früher FRS)**.

| Art | Erklärung |
|---|---|
| **Nichtautorisierend** | **Einzelner DC** **holt** **SYSVOL** **von Partnern** **neu** |
| **Autorisierend** | **Ein DC** **ist** **maßgeblich** **(Quelle)**, **alle anderen** **holen** **von ihm** |

**Nichtautorisierend (DFSR)**, **auf dem defekten DC**:
1. `msDFSR-Enabled = FALSE` **beim** **Objekt** **„CN=SYSVOL Subscription,…“** **(ADSI Edit)**.
2. **`msDFSR-Options`** **bleibt leer** **(nur** **beim autorisierenden Quell-DC** **= 1)**.
3. **`Stop-Service DFSR`**.
4. **`repadmin /syncall /AdeP`** **oder** **`dfsrdiag pollad`**.
5. **`msDFSR-Enabled = TRUE`**.
6. **`Start-Service DFSR`**, **`dfsrdiag pollad`**.
7. **Ereignis** **4114** **(Replikation beendet)** **→** **4614**/**4604** **(Initialisierung fertig)**.

**Autorisierend (DFSR)**, **auf** **dem Quell-DC**: `msDFSR-Options = 1` **plus** `msDFSR-Enabled = FALSE`, **alle anderen** **DCs** **nichtautorisierend** **wie oben**.

### FRS-Altfall (Legacy, BurFlags)
- **D4** (*nichtautorisierend*), **D2** (*autorisierend*) **im Registrierungspfad** **`HKLM\SYSTEM\CurrentControlSet\Services\NtFrs\Parameters\Backup/Restore\Process at Startup\BurFlags`**.
- **Nur** **noch** **bei sehr alten Domänen**.

### Diagnose
```powershell
dfsrmig /getmigrationstate
dfsrdiag replicationstate
dfsrdiag pollad
Get-DfsrState
dcdiag /test:sysvolcheck /test:advertising /test:netlogons
net share | findstr /i "sysvol netlogon"
Get-ADDomainController -Filter * | Select-Object Name
```

## Lab
**Maschinen**: **DC01**, **DC02** **(zweiter DC)**.

### GUI
1. **DC02**: **Windows Server Backup** **installieren** **→ Einmalige Sicherung → Systemstatus**.
2. **DC01**: **AD-Objekt** **(OU „Test“)** **löschen** **(Papierkorb aus)**.
3. **DC02**: **Neustart in DSRM** (**`msconfig` → Start → Abgesicherter Start → Active Directory-Reparatur** → **Neustart**).
4. **DC02**: **Anmeldung** **`.\Administrator`** **mit DSRM-Kennwort**.
5. **DC02**: **Windows Server Backup → Wiederherstellen → Systemstatus**.
6. **DC02**: **`ntdsutil`** → **`activate instance ntds`** → **`authoritative restore`** → **`restore subtree "OU=Test,DC=exa,DC=local"`**.
7. **DC02**: **`msconfig`** **zurücksetzen** → **Normalstart**.
8. **DC01**: **OU** **erscheint** **wieder**.

## Einfach

**DSRM** **ist wie der Wartungsmodus einer Maschine**: **Die Maschine** **läuft nicht normal**, **damit** **du** **innen** **reparieren** **kannst**. **Du brauchst** **den Wartungsschlüssel** (**DSRM-Kennwort**), **nicht** **den normalen**.

**Nichtautorisierend** = **„Ich stelle mich** **wieder** **auf** **den Stand von gestern** **und** **lasse** **mir** **von den anderen** **sagen**, **was seitdem passiert ist.“**

**Autorisierend** = **„Ich** **sage** **allen**: **Dieses gelöschte Objekt** **ist** **wichtig**, **holt** **es** **alle zurück!“** **– meine Version** **gewinnt**.

**SYSVOL** **ist der gemeinsame Ordner**, **in dem** **die Regeln** **(GPOs)** **liegen**. **Wenn** **er** **kaputt ist**, **holst** **du** **ihn** **entweder** **bei den anderen** **(nichtautorisierend)** **oder** **du** **erklärst** **dich** **zur Quelle** **(autorisierend)**.

## Merksatz
- **DSRM = `.\Administrator` + DSRM-Kennwort**.
- **Nichtautorisierend = vom Partner nachholen**.
- **Autorisierend = meine Version gewinnt**.
- **Kein Snapshot** **auf DC** **→ USN-Rollback**.
- **`bcdedit /set safeboot dsrepair`**.
- **SYSVOL**: **`msDFSR-Options=1`** **=** **autorisierend**.
- **Event 4114 → 4614/4604** **= SYSVOL fertig**.

## Prüfungsfalle
- **DSRM-Anmeldung** **mit Domänenkonto** **geht nicht**.
- **Autorisierende Wiederherstellung** **erfordert** **vorher** **nichtautorisierende**.
- **Kein Neustart** **zwischen** **Restore** **und** **ntdsutil**.
- **Prüfpunkt-Rücksetzung** **eines** **DC** **=** **USN-Rollback**.
- **Papierkorb** **ersetzt** **oft** **autorisierende Wiederherstellung**.
- **SYSVOL** **autorisierend** **nur** **auf** **einem** **DC**.
- **DSRM-Kennwort** **nicht** **mit Domänenkennwort** **verwechseln**.

## Grafik
### Wartungsmodus
Maschine mit geöffneter Klappe, Schlüssel DSRM.

### Zwei Wiederherstellungen
Zwei Pfade: „Stand von gestern + Nachholen“ und „Meine Version gewinnt“.

### SYSVOL
Ordner zwischen zwei DCs, Pfeil zeigt Quelle.

## Befehle
- `bcdedit /set safeboot dsrepair` – DSRM-Start
- `ntdsutil` – DSRM-Kennwort, autorisierende Wiederherstellung
- `wbadmin start systemstaterecovery` – Systemstatus wiederherstellen
- `dfsrdiag pollad` – DFSR-Konfiguration aus AD lesen
- `dcdiag /test:sysvolcheck` – SYSVOL prüfen

## Karteikarten
- F: Was ist DSRM? | A: Startmodus, in dem AD DS offline ist für Reparatur oder Wiederherstellung.
- F: Mit welchem Konto meldet man sich an DSRM an? | A: .\Administrator mit DSRM-Kennwort.
- F: Was macht nichtautorisierende Wiederherstellung? | A: Stellt Backup wieder her, Rest kommt per Replikation von Partnern.
- F: Was macht autorisierende Wiederherstellung? | A: Markiert Objekte als maßgeblich und repliziert sie auf alle DCs.
- F: Welches Tool markiert Objekte autorisierend? | A: ntdsutil.
- F: Welche Ereignis-ID zeigt fertige SYSVOL-Initialisierung? | A: 4614 bzw. 4604 nach 4114.
- F: Was bewirkt msDFSR-Options = 1? | A: Macht den DC zur autorisierenden SYSVOL-Quelle.
- F: Warum keine Snapshots auf DCs? | A: Risiko eines USN-Rollbacks.
- F: Wie startet man DSRM per Befehl? | A: bcdedit /set safeboot dsrepair.

## Quiz
? Womit meldet man sich im DSRM an?
* Lokaler Administrator mit DSRM-Kennwort
- Domänenadministrator
- Gastkonto
- Enterprise Admin

? Ein OU wurde versehentlich gelöscht, Papierkorb war aus. Vorgehen?
* Autorisierende Wiederherstellung
- Nichtautorisierende Wiederherstellung allein
- Neustart
- DNS-Reset

? Wodurch entsteht USN-Rollback?
* Zurücksetzen eines virtuellen DC per Prüfpunkt
- Zu viele DCs
- Falsches DNS
- Aktivierung des Papierkorbs

? Welches Tool markiert Objekte als autorisierend?
* ntdsutil
- dcdiag
- repadmin
- gpupdate

? Welcher Attributwert macht einen DC zur autorisierenden SYSVOL-Quelle?
* msDFSR-Options = 1
- msDFSR-Enabled = TRUE
- tombstoneLifetime = 1
- systemFlags = 0

? Wie startet man den DSRM neu per Befehl?
* bcdedit /set safeboot dsrepair
- bcdedit /set dsrm on
- msconfig /dsrm
- restart-dc -dsrm
