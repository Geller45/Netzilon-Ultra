---
id: az800-dfs
bereich: AZ-800
block: A7
kapitel: Storage & Dateidienste
titel: DFS – Namespaces (DFS-N) und Replikation (DFS-R)
stufe: Fortgeschritten
quellen: [AZ-800 Study Guide, Microsoft Learn, Speicher-/Dateidienste-Unterlagen]
verweise: [az800-freigaben, az800-branchcache, az800-azure-file-sync, az800-standorte-replikation, az800-rodc]
---

## Profi

**DFS** (*Distributed File System*) besteht aus zwei unabhängigen Rollendiensten von Datei- und Speicherdienste:
- **DFS-Namespaces (DFS-N)**: **ein einheitlicher Pfad** für viele Freigaben auf vielen Servern.
- **DFS-Replikation (DFS-R)**: **Multimaster-Replikation** von Ordnern zwischen Servern.
Kombiniert: Benutzer nutzen `\\example.com\Daten\Vertrieb`, landen am **nächstgelegenen** Server, und die Kopien werden per DFS-R synchron gehalten.

### DFS-N – Namespacetypen
| | **Domänenbasiert** | **Eigenständig** (*Standalone*) |
|---|---|---|
| Pfad | `\\example.com\Daten` | `\\FS01\Daten` |
| Konfiguration gespeichert | in **AD DS** | in der **Registrierung** des Servers |
| Hochverfügbarkeit | **mehrere Namespaceserver** | nur per **Failovercluster** |
| Modus | **Windows Server 2008-Modus**: ABE, > 5.000 Ordner (empfohlen) | bis ~50.000 Ordner |
| Voraussetzung | Domäne | keine (auch Arbeitsgruppe) |

### DFS-N – Bausteine
- **Namespacestamm** (*Root*) → **Ordner** (*Folders*, virtuell) → **Ordnerziele** (*Folder Targets* = echte UNC-Freigaben, z. B. `\\FS01\Vertrieb`, `\\FS02\Vertrieb`).
- **Verweise** (*Referrals*): Client erhält eine **Liste von Zielen**, sortiert nach **Standort (AD-Sites)**:
| Sortierung | Verhalten |
|---|---|
| **Niedrigste Kosten** (Standard) | Ziele am **eigenen Standort** zuerst, dann nach **Standortverknüpfungskosten** |
| **Zufällige Reihenfolge** | eigener Standort zuerst, Rest zufällig |
| **Ziele außerhalb des Standorts ausschließen** | nur Ziele am eigenen Standort |
- **Zwischenspeicherdauer für Verweise** (Standard **300 s** für Ordner, 300 s Stamm), **Clientfailback** (zurück zum bevorzugten Ziel, sobald wieder verfügbar), Zielpriorität (**erstes/letztes unter allen** bzw. im Standort).
- **Zugriffsbasierte Aufzählung** im Namespace (2008-Modus): `Set-DfsnFolder`/`dfsutil property sd`.
- Freigabe `\\example.com\...` bleibt stabil, auch wenn Server ersetzt werden → **Migration** ohne Pfadänderung.

### DFS-R – Bausteine
| Begriff | Bedeutung |
|---|---|
| **Replikationsgruppe** | Menge von **Mitgliedern** (Servern), die Ordner replizieren |
| **Replizierter Ordner** | Ordner, der zwischen den Mitgliedern synchron gehalten wird |
| **Topologie** | **Hub and Spoke** (Zentrale + Filialen, ab 3 Mitgliedern, spart Verbindungen) oder **Vollständig vermascht** (*Full Mesh*, bis ca. 10 Mitglieder) oder benutzerdefiniert |
| **Primäres Mitglied** | autoritativ bei der **Erstreplikation** (seine Daten gewinnen) |
| **Stagingordner** | Zwischenablage für ausgehende/eingehende Dateien; **Kontingent** Standard **4 GB**, empfohlen ≥ Summe der **32 größten Dateien** |
| **ConflictAndDeleted** | Verlierer bei Konflikten (**letzter Schreiber gewinnt**) + gelöschte Dateien, Standard **660 MB** |
| **RDC** (*Remote Differential Compression*) | nur **geänderte Blöcke** großer Dateien übertragen (Dateien > 64 KB) |
| **Zeitplan / Bandbreite** | pro Verbindung, z. B. tagsüber 256 kbit/s, nachts voll |
| **Schreibgeschützter replizierter Ordner** | Filialkopie nur lesbar (z. B. Softwarepakete) |
- DFS-R erkennt Änderungen über das **USN-Journal** des Volumes (klassisch **NTFS**; ReFS-Unterstützung erst in neueren Versionen – vorher prüfen).
- **Keine** verteilten Sperren → gleichzeitiges Bearbeiten derselben Datei an zwei Standorten erzeugt Konflikte → für kollaborative Office-Dateien ungeeignet.
- **SYSVOL** wird seit 2008-Domänenfunktionsebene per DFS-R repliziert (FRS ist entfernt).
- **Datenbankklonen** (`Export-DfsrClone`/`Import-DfsrClone`) für große Erstreplikationen; **Vorab-Befüllen** (*Preseeding*) per `robocopy /b /e /copyall /r:6 /w:5 /MT:64 /xd DfsrPrivate`.
- Diagnose: **Integritätsbericht** (*Diagnostic Report*), `Get-DfsrBacklog`, `dfsrdiag backlog`, Ereignisprotokoll **DFS-Replikation**.
- Cloud-Alternative: **Azure File Sync** (Hub = Azure-Dateifreigabe).

## Lab
**Maschinen**: **DC01** (example.com, Standort Bochum), **FS01** (Bochum), **FS02** (Standort Berlin), **CL01** (Berlin).

### GUI
1. **FS01** und **FS02**: Rollendienste **DFS-Namespaces** und **DFS-Replikation** installieren; Ordner `E:\Vertrieb` + Freigabe `Vertrieb` (Authentifizierte Benutzer: Ändern).
2. **FS01**: **DFS-Verwaltung** (`dfsmgmt.msc`) → Namespaces → **Neuer Namespace** → Server FS01 → Name `Daten` → **Domänenbasierter Namespace** + **Windows Server 2008-Modus**.
3. Namespace `\\example.com\Daten` → **Namespaceserver hinzufügen** → FS02.
4. Namespace → **Neuer Ordner** `Vertrieb` → Ordnerziele `\\FS01\Vertrieb` und `\\FS02\Vertrieb` → Assistent fragt „**Replikationsgruppe erstellen?**“ → **Ja**.
5. Replikationsassistent: Name `RG-Vertrieb`, **Primäres Mitglied FS01**, Topologie **Vollständig vermascht**, Bandbreite **Vollständig** → Erstellen. (Hinweis: Erstreplikation beginnt nach AD-Replikation/Abfrageintervall.)
6. Replikationsgruppe → Verbindungen → **Zeitplan bearbeiten** (tagsüber 1 Mbit/s).
7. Replikationsgruppe → Mitgliedschaften → FS01 → Eigenschaften → Registerkarte **Staging** → Kontingent 16 GB.
8. **CL01**: `\\example.com\Daten\Vertrieb` öffnen → Eigenschaften → Registerkarte **DFS** → aktives Ziel = FS02 (eigener Standort).
9. **FS01**: Datei anlegen → erscheint auf FS02. Dieselbe Datei auf beiden Servern gleichzeitig ändern → Verlierer in `DfsrPrivate\ConflictAndDeleted`.
10. **FS01**: Replikationsgruppe → **Diagnosebericht erstellen** → Integritätsbericht ansehen.

### PowerShell
```powershell
# Auf FS01 und FS02
Install-WindowsFeature FS-DFS-Namespace, FS-DFS-Replication -IncludeManagementTools
New-Item E:\Vertrieb -ItemType Directory; New-SmbShare -Name Vertrieb -Path E:\Vertrieb -ChangeAccess "EXAMPLE\Authentifizierte Benutzer"
New-Item C:\DFSRoots\Daten -ItemType Directory; New-SmbShare -Name Daten -Path C:\DFSRoots\Daten -ReadAccess "Jeder"

# Auf FS01 – domänenbasierter Namespace (2008-Modus) + zweiter Namespaceserver
New-DfsnRoot -Path "\\example.com\Daten" -TargetPath "\\FS01\Daten" -Type DomainV2 -EnableAccessBasedEnumeration $true
New-DfsnRootTarget -Path "\\example.com\Daten" -TargetPath "\\FS02\Daten"
New-DfsnFolder -Path "\\example.com\Daten\Vertrieb" -TargetPath "\\FS01\Vertrieb"
New-DfsnFolderTarget -Path "\\example.com\Daten\Vertrieb" -TargetPath "\\FS02\Vertrieb"
Set-DfsnFolder -Path "\\example.com\Daten\Vertrieb" -EnableTargetFailback $true -TimeToLiveSec 600
Get-DfsnFolderTarget -Path "\\example.com\Daten\Vertrieb"

# Auf FS01 – Replikationsgruppe
New-DfsReplicationGroup -GroupName "RG-Vertrieb" | New-DfsReplicatedFolder -FolderName "Vertrieb"
Add-DfsrMember -GroupName "RG-Vertrieb" -ComputerName FS01,FS02
Add-DfsrConnection -GroupName "RG-Vertrieb" -SourceComputerName FS01 -DestinationComputerName FS02
Set-DfsrMembership -GroupName "RG-Vertrieb" -FolderName "Vertrieb" -ComputerName FS01 -ContentPath E:\Vertrieb -PrimaryMember $true -StagingPathQuotaInMB 16384 -Force
Set-DfsrMembership -GroupName "RG-Vertrieb" -FolderName "Vertrieb" -ComputerName FS02 -ContentPath E:\Vertrieb -StagingPathQuotaInMB 16384 -Force
Update-DfsrConfigurationFromAD -ComputerName FS01,FS02

# Diagnose
Get-DfsrBacklog -GroupName "RG-Vertrieb" -FolderName "Vertrieb" -SourceComputerName FS01 -DestinationComputerName FS02
dfsrdiag backlog /rgname:RG-Vertrieb /rfname:Vertrieb /smem:FS01 /rmem:FS02
Write-DfsrHealthReport -GroupName "RG-Vertrieb" -ReferenceComputerName FS01 -Path C:\Berichte

# Staging-Größe ermitteln (Summe der 32 größten Dateien)
(Get-ChildItem E:\Vertrieb -Recurse -File | Sort-Object Length -Descending | Select-Object -First 32 | Measure-Object Length -Sum).Sum / 1GB

# Auf CL01 – aktives Ziel
dfsutil client property state "\\example.com\Daten\Vertrieb"
```

## Einfach

**DFS-Namespaces** = ein **Wegweiser-Schild** für Dateien. Statt dir zu merken „Vertrieb liegt auf FS01, Buchhaltung auf FS07, Marketing auf FS12“, gibt es **eine Adresse**: `\\example.com\Daten`. Darunter hängen alle Ordner – egal auf welchem Server sie wirklich liegen. Zieht ein Ordner auf einen neuen Server um, **ändert man nur das Schild**, die Adresse für die Benutzer bleibt gleich.

Gibt es den Ordner **zweimal** (Bochum und Berlin), schickt das Schild dich zum **nächstgelegenen** – wie ein Navi, das die **nächste Filiale** vorschlägt.

**DFS-Replikation** = zwei **Kopierer**, die dafür sorgen, dass beide Ordner **immer gleich** sind. Ändert jemand in Bochum eine Datei, wird die **Änderung** nach Berlin geschickt – bei großen Dateien sogar nur die **geänderten Stücke** (RDC).

- **Primäres Mitglied** = beim **allerersten** Abgleich gewinnt dieser Server („Meine Version ist die richtige“).
- **Stagingordner** = die **Packstation**, in der Dateien vor dem Versand zwischengelagert werden.
- **Konflikt** = zwei Leute ändern **gleichzeitig** dieselbe Datei in Bochum und Berlin → der **Letzte gewinnt**, die andere Version landet im „**Fundbüro**“ (ConflictAndDeleted). Deshalb: DFS-R **nicht** für Dateien, an denen alle gleichzeitig arbeiten.

## Merksatz
- **DFS-N** = ein Pfad, viele Server; **DFS-R** = Ordner synchron halten.
- **Domänenbasiert** = AD, mehrere Namespaceserver; **eigenständig** = Registry, HA nur per Cluster.
- Verweise sortiert nach **Standort/Kosten**.
- **Primäres Mitglied** gewinnt bei **Erstreplikation**.
- **Staging** ≥ **32 größte Dateien**; ConflictAndDeleted **660 MB**.
- Konflikt: **letzter Schreiber gewinnt**, keine Dateisperren.
- **Hub and Spoke** für Filialen, **Full Mesh** für wenige Server.

## Prüfungsfalle
- Eigenständiger Namespace ist ohne Cluster nicht hochverfügbar.
- Falsches primäres Mitglied bei Erstreplikation überschreibt die aktuellen Daten.
- Zu kleiner Stagingordner bremst die Replikation (Ereignisse 4202/4208).
- DFS-R eignet sich nicht für gleichzeitig bearbeitete Dateien (keine Sperren).
- Clients bleiben bis zum Ablauf der Verweis-Zwischenspeicherdauer beim alten Ziel.
- ABE im Namespace nur im Windows Server 2008-Modus.

## Grafik
### Wegweiser
Ein großes Schild `\\example.com\Daten` mit Pfeilen zu FS01, FS07, FS12; ein Ordner zieht um, nur der Pfeil dreht sich.

### Navi
Client in Berlin fragt nach Vertrieb; Verweisliste zeigt FS02 (Berlin) oben, FS01 (Bochum) darunter; FS02 fällt aus → Client wechselt, Failback zurück nach Rückkehr.

### Zwei Kopierer
Datei wird in Bochum geändert; nur die geänderten Blöcke (RDC) fliegen durch die Packstation (Staging) nach Berlin.

### Fundbüro
Zwei Hände ändern gleichzeitig dieselbe Datei; die spätere gewinnt, die andere Version landet in einer Kiste „ConflictAndDeleted“.

## Karteikarten
- F: Unterschied DFS-N und DFS-R? | A: DFS-N vereinheitlicht Pfade, DFS-R repliziert Ordnerinhalte.
- F: Wo wird ein domänenbasierter Namespace gespeichert? | A: In Active Directory.
- F: Wie wird ein eigenständiger Namespace hochverfügbar? | A: Nur per Failovercluster.
- F: Vorteile des Windows Server 2008-Modus? | A: Zugriffsbasierte Aufzählung und mehr als 5.000 Ordner.
- F: Standard-Sortierung der Verweise? | A: Niedrigste Kosten (eigener Standort zuerst).
- F: Welche Rolle hat das primäre Mitglied? | A: Autoritativ bei der Erstreplikation.
- F: Empfohlene Größe des Stagingordners? | A: Mindestens Summe der 32 größten Dateien.
- F: Standardgröße ConflictAndDeleted? | A: 660 MB.
- F: Wer gewinnt bei einem DFS-R-Konflikt? | A: Der letzte Schreiber.
- F: Was ist RDC? | A: Remote Differential Compression – nur geänderte Blöcke werden übertragen.
- F: Welche Topologie für Zentrale mit vielen Filialen? | A: Hub and Spoke.
- F: Cmdlet für Replikations-Rückstand? | A: Get-DfsrBacklog

## Quiz
? Benutzer sollen \\example.com\Daten nutzen; der Namespace muss ohne Cluster hochverfügbar sein. Lösung?
* Domänenbasierter Namespace mit mehreren Namespaceservern
- Eigenständiger Namespace
- DFS-R mit Full Mesh
- BranchCache verteilter Cache

? Bei der Einrichtung von DFS-R hat FS01 aktuelle, FS02 veraltete Daten. Was ist wichtig?
* FS01 als primäres Mitglied festlegen
- FS02 als primäres Mitglied festlegen
- Stagingordner löschen
- RDC deaktivieren

? Clients in Berlin sollen ausschließlich Ziele am eigenen Standort nutzen. Einstellung?
* Ziele außerhalb des Standorts des Clients ausschließen
- Zufällige Reihenfolge
- Clientfailback deaktivieren
- Zwischenspeicherdauer 0

? Die Replikation großer CAD-Dateien stockt, Ereignisse melden Staging-Bereinigung. Lösung?
* Stagingkontingent vergrößern (≥ 32 größte Dateien)
- ConflictAndDeleted verkleinern
- Topologie auf Hub and Spoke ändern
- ABE aktivieren

? Zwei Benutzer bearbeiten gleichzeitig dieselbe Datei an zwei DFS-R-Mitgliedern. Ergebnis?
* Letzter Schreiber gewinnt, andere Version landet in ConflictAndDeleted
- Datei wird gesperrt
- Beide Versionen werden zusammengeführt
- Replikation stoppt dauerhaft
