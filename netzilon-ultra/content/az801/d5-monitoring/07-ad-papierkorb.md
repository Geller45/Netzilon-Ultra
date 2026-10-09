---
id: az801-ad-papierkorb
bereich: AZ-801
block: A10
kapitel: Monitoring und Troubleshooting
titel: AD-Papierkorb (Active Directory Recycle Bin)
stufe: Profi
quellen: [AZ-801 Study Guide, Microsoft Learn]
verweise: [az801-dsrm-sysvol, az801-ad-replikation, az800-fsmo]
---

## Profi

### Zweck
**Der AD-Papierkorb** **stellt** **gelöschte AD-Objekte** **vollständig** **wieder her**, **mit** **allen Attributen** **und** **Gruppenmitgliedschaften**, **ohne** **Neustart** **und** **ohne** **Offline-Wiederherstellung**.

### Ohne Papierkorb (Legacy)
**Gelöschtes Objekt** **wird** **zum** **Tombstone** **(Grabstein)**: **nur** **wenige Attribute** **bleiben**. **Wiederherstellung** **mit** **Tombstone-Reanimation** **verliert** **Gruppenmitgliedschaften** **und** **Attribute**. **Vollständig** **nur** **per** **autorisierender Wiederherstellung** **(Systemstatus-Backup, DSRM)**.

### Lebenszyklus mit Papierkorb
| Zustand | Erklärung | Dauer |
|---|---|---|
| **Aktiv** (*Live*) | **Normales Objekt** | – |
| **Gelöscht** (*Deleted*) | **Im Container „Deleted Objects“**, **vollständig wiederherstellbar** | **`msDS-DeletedObjectLifetime`** (**Standard = Tombstone-Lebensdauer**, **180 Tage**) |
| **Recycelt** (*Recycled*) | **Nur Grabstein**, **nicht** **mehr** **vollständig** **wiederherstellbar** | **`tombstoneLifetime`** (**180 Tage**) |
| **Entfernt** | **Bereinigt** **(Garbage Collection)** | – |

### Voraussetzungen und Eigenschaften
- **Gesamtstruktur-Funktionsebene** **mindestens** **Windows Server 2008 R2**.
- **Aktivierung** **gilt** **für die ganze Gesamtstruktur** **und** **ist nicht umkehrbar**.
- **Konto**: **Enterprise Admin** **(**Domänennamenmaster**)**.
- **Aktiviert** **wird** **ein** **optionales Feature**: **„Recycle Bin Feature“**.
- **Nach Aktivierung**: **Neu gelöschte** **Objekte** **sind** **wiederherstellbar** **(vorher gelöschte nicht)**.

### Wiederherstellungsregeln
- **Reihenfolge**: **Übergeordnete Objekte** **zuerst** **(OU vor Benutzern)**.
- **Geschützte OUs** **(Versehentliches Löschen verhindern)**: **Schutz** **entfernen**, **sonst** **kein Löschen**.
- **Benutzer** **behalten** **SID**, **GUID**, **Kennwort-Hashes**, **Gruppen**.
- **Wiederherstellung** **an** **anderen Ort** (`-TargetPath`).
- **AD Administrative Center** (ADAC) **bietet** **Container „Deleted Objects“**.

### PowerShell
```powershell
# Auf DC01 – Papierkorb aktivieren (einmalig, unumkehrbar)
Enable-ADOptionalFeature -Identity 'Recycle Bin Feature' -Scope ForestOrConfigurationSet -Target 'exa.local' -Confirm:$false
Get-ADOptionalFeature -Filter 'Name -like "Recycle*"' | Select-Object Name, EnabledScopes

# Gelöschte Objekte suchen
Get-ADObject -Filter 'isDeleted -eq $true -and Name -like "*Anna*"' -IncludeDeletedObjects -Properties LastKnownParent, ObjectGUID

# Wiederherstellen
Get-ADObject -Filter 'isDeleted -eq $true -and samAccountName -eq "anna.meier"' -IncludeDeletedObjects | Restore-ADObject

# Wiederherstellen an anderem Ort
Restore-ADObject -Identity <GUID> -TargetPath "OU=Vertrieb,DC=exa,DC=local"

# Ganze OU inkl. Objekte (erst OU, dann Inhalt)
Get-ADObject -Filter 'isDeleted -eq $true -and Name -like "Vertrieb*"' -IncludeDeletedObjects | Restore-ADObject
Get-ADObject -Filter 'isDeleted -eq $true -and LastKnownParent -like "OU=Vertrieb*"' -IncludeDeletedObjects | Restore-ADObject

# Lebensdauer prüfen
Get-ADObject "CN=Directory Service,CN=Windows NT,CN=Services,$((Get-ADRootDSE).configurationNamingContext)" -Properties msDS-DeletedObjectLifetime, tombstoneLifetime
```

## Lab
**Maschinen**: **DC01** (**Server 2022**, **Domäne exa.local**).

### GUI
1. **DC01**: **Server-Manager → Tools → Active Directory-Verwaltungscenter**.
2. **DC01**: **Domäne exa (lokal) → Rechtsklick → Papierkorb aktivieren** → **Warnung** **bestätigen** → **OK**.
3. **DC01**: **AD-Verwaltungscenter** **aktualisieren (F5)**, **damit** **der Container** **„Deleted Objects“** **erscheint**.
4. **DC01**: **Testbenutzer „anna.meier“ anlegen** → **löschen**.
5. **DC01**: **AD-Verwaltungscenter → Domäne → Deleted Objects** → **Objekt suchen**.
6. **DC01**: **Rechtsklick auf Objekt → Wiederherstellen** **(oder „Wiederherstellen nach…“)**.
7. **DC01**: **Benutzer** **prüfen** **(Gruppen, Attribute)**.

## Einfach

**Ohne Papierkorb** **ist AD** **wie ein Shredder**: **Was** **gelöscht wird**, **ist** **weg**, **du** **findest** **nur** **Fetzen**.

**Mit Papierkorb** **ist AD wie** **ein normaler Papierkorb**: **Du** **kannst** **das Blatt** **wieder herausholen**, **so** **wie** **es war**. **Nach 180 Tagen** **wird** **er** **geleert** **(erst** **„nur noch Fetzen“**, **dann** **weg)**.

**Wichtig**: **Der Papierkorb** **wird einmal** **eingeschaltet** **– danach** **nie mehr ausschaltbar**.

## Merksatz
- **Aktivieren = für immer**.
- **Erst Eltern, dann Kinder**.
- **Deleted → Recycled → Weg**.
- **Mindestens 2008 R2 Funktionsebene**.
- **Nur neu gelöschte Objekte** **sind** **vollständig** **zurückholbar**.
- **`-IncludeDeletedObjects`** **zum Suchen**.

## Prüfungsfalle
- **Aktivierung** **nicht** **rückgängig** **machbar**.
- **Vor Aktivierung** **gelöschte Objekte** **nur** **als Tombstone**.
- **Gelöschte OU** **muss** **zuerst** **zurück**.
- **Recycelt** **≠** **wiederherstellbar**.
- **Autorisierende Wiederherstellung** **ist** **nur** **nötig**, **wenn** **der Papierkorb aus** **war** **oder** **die Frist** **abgelaufen** **ist**.
- **Enterprise Admin** **braucht** **man** **zum Aktivieren**.

## Grafik
### Shredder gegen Papierkorb
Zwei Bilder: Fetzen aus dem Shredder, ganzes Blatt aus dem Korb.

### Lebenszyklus
Vier Kästen: Aktiv, Gelöscht, Recycelt, Weg, mit 180-Tage-Uhren.

### Eltern zuerst
Baum: OU (Vertrieb) wird vor Benutzern zurückgeholt.

## Befehle
- `Enable-ADOptionalFeature 'Recycle Bin Feature'` – Papierkorb aktivieren
- `Get-ADObject -IncludeDeletedObjects` – gelöschte Objekte suchen
- `Restore-ADObject` – wiederherstellen
- `Get-ADOptionalFeature` – Status prüfen

## Karteikarten
- F: Was leistet der AD-Papierkorb? | A: Vollständige Wiederherstellung gelöschter Objekte samt Attributen und Gruppen.
- F: Welche Funktionsebene ist nötig? | A: Mindestens Windows Server 2008 R2 (Gesamtstruktur).
- F: Ist die Aktivierung umkehrbar? | A: Nein.
- F: Welches Cmdlet stellt wieder her? | A: Restore-ADObject.
- F: Welcher Parameter findet gelöschte Objekte? | A: -IncludeDeletedObjects.
- F: Wie lange sind Objekte im Zustand „Gelöscht“ standardmäßig? | A: 180 Tage.
- F: Was gilt bei gelöschten OUs? | A: OU zuerst wiederherstellen, dann Inhalt.
- F: Was war vor dem Papierkorb möglich? | A: Autorisierende Wiederherstellung über Systemstatus-Backup.
- F: Welche Rolle braucht die Aktivierung? | A: Enterprise Admin.

## Quiz
? Ein Benutzer wurde gelöscht, Papierkorb ist aktiv. Wie stellt man ihn mit allen Gruppen wieder her?
* Restore-ADObject
- Autorisierende Wiederherstellung
- Neuanlage
- Systemstatus-Restore

? Ist die Aktivierung des AD-Papierkorbs umkehrbar?
* Nein
- Ja, per Cmdlet
- Ja, per GPO
- Nur mit Neustart

? Welche Funktionsebene ist mindestens nötig?
* Windows Server 2008 R2
- Windows Server 2003
- Windows Server 2000
- Windows Server 2016

? Welche Reihenfolge gilt bei einer gelöschten OU?
* OU zuerst, dann Objekte
- Objekte zuerst
- Zufällig
- Beliebig

? Wie sucht man gelöschte Objekte mit Get-ADObject?
* -IncludeDeletedObjects
- -Deleted
- -Trash
- -Recycle

? Was ist ein Objekt im Zustand „Recycelt“?
* Nur noch Grabstein, nicht vollständig wiederherstellbar
- Voll wiederherstellbar
- Aktiv
- Replikiert
