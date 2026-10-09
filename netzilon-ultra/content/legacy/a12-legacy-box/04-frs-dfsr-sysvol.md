---
id: legacy-frs-dfsr
bereich: Legacy
block: A12
kapitel: Legacy-Box
titel: FRS → DFSR: SYSVOL-Migration und Funktionsebenen
stufe: Profi
quellen: [Microsoft Learn SYSVOL-Migration, dfsrmig, 70-640-Buch]
verweise: [az801-ad-replikation, az801-dsrm-sysvol, ap1-a6-adds, legacy-lebenszyklus]
---

## Profi

### Ausgangslage
Der Ordner **SYSVOL** (`C:\Windows\SYSVOL`) enthält **Gruppenrichtlinien (GPT)** und **Anmeldeskripte** und muss auf **allen Domänencontrollern identisch** sein. Bis Windows Server 2003 übernahm das der **FRS** (*File Replication Service*), ab Server 2008 gibt es **DFSR** (*Distributed File System Replication*).

| Merkmal | **FRS** (Legacy) | **DFSR** |
|---|---|---|
| Replikationsart | Ganze Datei bei Änderung | **Blockebene (RDC)**, nur geänderte Teile |
| Zuverlässigkeit | Journal-Wrap, Fehler häufig | Robuster, Konfliktbehandlung |
| Skalierung | Schlecht | Besser, mehr Ordner |
| Voraussetzung | Ab Windows 2000 | **Domänenfunktionsebene mindestens Windows Server 2008** |
| Status | **Nicht mehr unterstützt** in neuen DCs (seit Server 2019 kein FRS-SYSVOL mehr) | Standard |

**Wichtig**: Eine **neue Domäne** (Forest-Funktionsebene 2008 oder höher) nutzt **DFSR automatisch**. Migration braucht man nur bei **alten Domänen**, die von Server 2003 nach oben gewachsen sind.

### Domänenfunktionsebene (DFL) und Forestfunktionsebene (FFL)
**Funktionsebenen** legen fest, **welche AD-Features aktiv sind** und welche **DC-Versionen** in der Domäne/dem Forest erlaubt sind.
- **Anheben** behandelt man in der Praxis als **einseitig**: Zurücksetzen ist nur eingeschränkt möglich (z. B. **nicht**, wenn der AD-Papierkorb aktiviert wurde) – vorher **Backup und Testlauf**.
- **Voraussetzung**: Alle DCs mindestens auf dem Niveau der Ebene.
- **Zuerst DFL, dann FFL** (FFL erst, wenn alle Domänen DFL erreicht haben).
- Beispiele: **2008 → DFSR-SYSVOL**, **2008 R2 → Papierkorb (FFL), Managed Service Accounts**, **2012 R2 → Protected Users, Authentication Policies**, **2016 → Privileged Access Management (Zeit-basierte Gruppenmitgliedschaft)**.
- Anzeigen: `Get-ADDomain \| Select DomainMode`, `Get-ADForest \| Select ForestMode`.

### Die vier Migrationszustände (dfsrmig)
| Nr. | Name | Bedeutung |
|---|---|---|
| **0** | **Start** | FRS repliziert SYSVOL, DFSR unbeteiligt (Ausgangslage) |
| **1** | **Prepared** | DFSR erstellt einen **Zweitordner `SYSVOL_DFSR`**; FRS repliziert **weiter** den **aktiven** Ordner `SYSVOL` |
| **2** | **Redirected** | **SYSVOL-Freigabe zeigt jetzt auf `SYSVOL_DFSR`**; DFSR ist aktiv, FRS repliziert noch den alten Ordner |
| **3** | **Eliminated** | **FRS abgeschaltet**, alter Ordner kann gelöscht werden – **nicht umkehrbar** |
Rückwärts gehen ist nur **bis Zustand 2** möglich (mit `dfsrmig /setglobalstate <n>`), von 3 aus **nicht mehr**.

### Vorgehen
1. **Health-Check**: `dcdiag`, `repadmin /replsummary`, AD-Replikation in Ordnung, alle DCs erreichbar, **DFL ≥ 2008**.
2. **Zustand 1**: `dfsrmig /setglobalstate 1` → warten, bis **alle DCs** „Prepared“ melden (`dfsrmig /getmigrationstate`).
3. **Zustand 2** (Redirected) → prüfen: GPOs laden weiter, `net share` zeigt SYSVOL auf `SYSVOL_DFSR`.
4. **Zustand 3** (Eliminated) → FRS-Dienst wird deaktiviert; alter Ordner (`SYSVOL`) wird ungenutzt.
5. **Verifizieren**: `dfsrmig /getmigrationstate` meldet für alle DCs „Eliminated“, `dcdiag /test:sysvolcheck`, Ereignisprotokoll **DFS Replication** auf Fehler prüfen.
6. **Aufräumen**: FRS-Reste, Registry-Einträge und **FRS-Backup-Skripte** entfernen.

### Häufige Probleme
| Symptom | Ursache/Lösung |
|---|---|
| **Migration hängt bei Zustand 1** | Ein DC repliziert nicht (Netz, DNS, Firewall **RPC/TCP 135**, Dynamische RPC-Ports); AD-Replikation reparieren |
| **Ereignis 13508 (FRS)** | FRS findet Partner nicht: DNS, Firewall, Zeit |
| **SYSVOL/NETLOGON nicht freigegeben** | DFSR-Initialisierung läuft (Ereignis 4602/4614), abwarten bzw. autoritativ/nichtautoritativ wiederherstellen |
| **Ereignis 2213 (DFSR)** | Datenbank unsauber heruntergefahren → `wmic /namespace:\\root\microsoftdfs path dfsrVolumeConfig where volumeGuid="…" call ResumeReplication` |
| **Zeitfehler** | Kerberos/Replikation brauchen Zeit-Toleranz (< 5 Minuten): PDC-Emulator mit externer Quelle sync |

## Lab
**Maschinen**: **DC01** (PDC-Emulator), **DC02** (zweiter DC).

### GUI
1. **DC01**: Serverpartner prüfen: `dcdiag /test:replications`, `repadmin /replsummary` (CMD als Admin).
2. **DC01**: Domänenfunktionsebene: **Active Directory-Domänen und -Vertrauensstellungen** → Domäne → Rechtsklick → **Domänenfunktionsebene heraufstufen** (mind. 2008; **irreversibel**).
3. **DC01**: `dfsrmig /getglobalstate` (Ist-Zustand).
4. **DC01**: `dfsrmig /setglobalstate 1` → warten.
5. **DC02**: `dfsrmig /getmigrationstate` bis „All Domain Controllers have migrated successfully to Global state (Prepared)“.
6. **DC01**: `dfsrmig /setglobalstate 2` → wieder warten und prüfen.
7. **DC01**: `dfsrmig /setglobalstate 3` (Eliminated) nur, wenn alle Tests laufen.
8. **DC01/DC02**: `net share` zeigt **SYSVOL** und **NETLOGON**.

### PowerShell
```powershell
# Auf DC01 – Funktionsebenen und SYSVOL-Replikation prüfen
Get-ADDomain | Select-Object Name, DomainMode
Get-ADForest | Select-Object Name, ForestMode
Get-ADDomainController -Filter * | Select-Object Name, OperatingSystem

# Auf DC01 – Migration schrittweise
dfsrmig /getglobalstate
dfsrmig /setglobalstate 1
dfsrmig /getmigrationstate

# Auf beiden DCs – Kontrolle
dcdiag /test:sysvolcheck /test:advertising /test:netlogons
Get-SmbShare -Name SYSVOL, NETLOGON
Get-WinEvent -LogName "DFS Replication" -MaxEvents 20
```

## Befehle
- `dfsrmig /getglobalstate` – Gewünschter (globaler) Zustand
- `dfsrmig /getmigrationstate` – Ist-Zustand pro DC
- `dfsrmig /setglobalstate 0-3` – Zustand setzen
- `dcdiag /test:sysvolcheck` – SYSVOL-Diagnose
- `repadmin /replsummary` – Replikationsübersicht
- `Get-ADDomain` / `Get-ADForest` – Funktionsebenen anzeigen
- `Set-ADDomainMode -Identity firma.local -DomainMode Windows2016Domain` – Ebene anheben (irreversibel)

## Einfach

Stell dir vor, eine **Firma hat mehrere Filialen**, und jede Filiale hat einen **Ordner mit den Hausregeln** (das ist SYSVOL: „Alle tragen Schuhe!“, „Kaffee ab 8 Uhr!“). Damit **alle dieselben Regeln** haben, schickt ein Bote (FRS) bei jeder Änderung **den kompletten Ordner** zu den anderen Filialen. Das ist **langsam**, und der Bote **verliert manchmal Blätter**.

Der neue Bote (**DFSR**) ist **schlauer**: Er schickt nur die **geänderten Zeilen**. Damit ist er schneller und macht weniger Fehler.

Beim **Wechsel der Boten** gilt: **Nie mitten in der Fahrt umsteigen!** Darum macht man es in **vier Schritten**:
0. Der alte Bote fährt (**Start**).
1. Der neue Bote **lernt die Strecke** und hat schon einen leeren Koffer (**Prepared**).
2. Ab jetzt **liest die Firma aus dem Koffer des neuen Boten** (**Redirected**).
3. Der alte Bote wird **entlassen** (**Eliminated**) – **das ist endgültig**.

Die **Funktionsebene** ist wie ein **Regelbuch-Stand** für die ganze Firma: „Ab jetzt gilt Regelbuch 2016!“ Dafür müssen **alle Filialen** das neue Regelbuch schon **kennen** (alle DCs mindestens diese Version). Zurück zum alten Buch geht man **nicht**.

## Merksatz
- **SYSVOL**: früher **FRS**, heute **DFSR**.
- Migration = **0 Start – 1 Prepared – 2 Redirected – 3 Eliminated** (**Zurück nur bis 2**).
- DFSR braucht **Domänenfunktionsebene ≥ 2008**.
- **Zuerst alle DCs, dann DFL, dann FFL**.
- Neue Domänen (ab 2008er Ebene) haben **DFSR automatisch**.

## Prüfungsfalle
- **Eliminated ist nicht umkehrbar**, Redirected schon.
- **Funktionsebene ≠ Betriebssystemversion** der DCs, sondern **Mindeststand**.
- **Zuerst DFL, dann FFL** (nicht umgekehrt).
- **SYSVOL ≠ NETLOGON**: NETLOGON ist ein **Unterordner** (Skripte), beides gehört zur SYSVOL-Freigabe.
- Für die Migration muss **AD-Replikation heil** sein, nicht nur SYSVOL.

## Grafik
### Vier-Stufen-Migration
Vier Bahnhöfe nebeneinander; oben zwei Züge (FRS grau, DFSR blau). Bei jedem Schritt wechseln die Gleise: Stufe 1 baut ein zweites Gleis, Stufe 2 stellt die Weiche, Stufe 3 reißt das alte Gleis mit Pfeil „Kein Zurück“ ab. Klick auf „zurück“ funktioniert bis Stufe 2.

### Funktionsebenen-Leiter
Eine Leiter 2003 → 2008 → 2008 R2 → 2012 R2 → 2016 → höher; jede Sprosse bekommt ein Feature-Schild (DFSR, Papierkorb, Protected Users, PAM). Ein alter DC im Hintergrund blockiert das Steigen.

## Karteikarten
- F: Was ist SYSVOL? | A: Ordner auf jedem DC mit GPOs und Anmeldeskripten.
- F: Womit wurde SYSVOL früher repliziert? | A: FRS (File Replication Service).
- F: Womit wird SYSVOL heute repliziert? | A: DFSR (Distributed File System Replication).
- F: Welche Funktionsebene braucht DFSR-SYSVOL? | A: Domänenfunktionsebene Windows Server 2008 oder höher.
- F: Wie heißen die 4 Migrationszustände? | A: 0 Start, 1 Prepared, 2 Redirected, 3 Eliminated.
- F: Bis zu welchem Zustand ist ein Zurück möglich? | A: Bis Redirected (2).
- F: Welcher Befehl steuert die SYSVOL-Migration? | A: `dfsrmig`
- F: Wie zeigt man den Ist-Zustand aller DCs? | A: `dfsrmig /getmigrationstate`
- F: Was kommt zuerst: DFL oder FFL? | A: Zuerst die Domänen-, dann die Forestfunktionsebene.
- F: Was bringt Funktionsebene 2008 R2 (Forest)? | A: Active Directory-Papierkorb.
- F: Was bringt Funktionsebene 2012 R2? | A: Protected Users, Authentication Policies.
- F: Was tun bei einem hängenden Migrationszustand? | A: AD-Replikation, DNS, Firewall (RPC) und Zeit prüfen.

## Quiz
? Womit wird SYSVOL auf modernen DCs repliziert?
* DFSR
- FRS
- Robocopy
- BranchCache

? Welche Funktionsebene ist für DFSR-SYSVOL Mindestvoraussetzung?
* Windows Server 2008
- Windows 2000 nativ
- Windows Server 2003
- Windows Server 2016

? Welcher Migrationszustand von dfsrmig ist nicht umkehrbar?
* Eliminated
- Prepared
- Redirected
- Start

? In welcher Reihenfolge werden Funktionsebenen angehoben?
* Erst Domäne, dann Forest
- Erst Forest, dann Domäne
- Nur Forest
- Gleichzeitig, Reihenfolge egal

? Was macht der Zustand „Redirected“?
* Die SYSVOL-Freigabe zeigt auf den DFSR-Ordner
- FRS wird endgültig abgeschaltet
- Es wird ein Backup erstellt
- Der PDC-Emulator wechselt

? Welche Ebene bringt den AD-Papierkorb?
* Forest 2008 R2
- Forest 2003
- Domäne 2000
- Forest 2016

? Welches Werkzeug migriert SYSVOL von FRS zu DFSR?
* dfsrmig.exe
- robocopy
- ntdsutil
- repadmin
! Zustände: Prepared, Redirected, Eliminated.

? Welche Windows-Server-Versionen brachten keine eigene neue AD-Funktionsebene?
* Windows Server 2019 und 2022
- Windows Server 2016 und 2025
- Windows Server 2008 und 2008 R2
- Windows Server 2012 und 2012 R2
! Höchste Ebene bis dahin war 2016; Server 2025 führt eine neue Funktionsebene ein.
