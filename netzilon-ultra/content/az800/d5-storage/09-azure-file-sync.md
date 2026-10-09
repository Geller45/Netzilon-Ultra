---
id: az800-azure-file-sync
bereich: AZ-800
block: A7
kapitel: Storage & Dateidienste
titel: Azure File Sync
stufe: Fortgeschritten
quellen: [AZ-800 Study Guide, Microsoft Learn, Speicher-/Dateidienste-Unterlagen]
verweise: [az800-dfs, az800-branchcache, az800-dedup, az800-azure-arc, az800-datentraeger]
---

## Profi

### Zweck
**Azure File Sync (AFS)** verbindet **lokale Windows-Dateiserver** mit **Azure Files** (Cloud-SMB-Freigabe). Der lokale Server bleibt **Cache** der Cloud-Freigabe: **hybrider Dateiserver** mit **Cloud-Tiering**, **Multi-Site-Sync** und **Backup/Disaster Recovery** in Azure. Ersatz/Ergänzung für **DFS-R** und **BranchCache**.

### Bausteine
| Komponente | Bedeutung |
|---|---|
| **Speicherkonto** (*Storage Account*) | Enthält die **Azure-Dateifreigabe** (*File Share*); Kontotyp **StorageV2** oder **FileStorage** |
| **Azure-Dateifreigabe** | **Cloud-Endpunkt** (*Cloud Endpoint*) – **eine** Freigabe pro Synchronisierungsgruppe |
| **Speichersynchronisierungsdienst** (*Storage Sync Service*) | **Azure-Ressource** (oberste Verwaltungsebene), enthält **Synchronisierungsgruppen** |
| **Synchronisierungsgruppe** (*Sync Group*) | Definiert **eine** Menge zu synchronisierender Daten: **1 Cloud-Endpunkt** + **beliebig viele Serverendpunkte** |
| **Registrierter Server** (*Registered Server*) | Windows Server mit **AFS-Agent**, beim Speichersynchronisierungsdienst **registriert** (Identität: **Managed Identity/Entra ID**) |
| **Serverendpunkt** (*Server Endpoint*) | **Pfad** auf einem registrierten Server (Volume/Ordner), z. B. `D:\Freigaben` |
| **Cloud-Endpunkt** (*Cloud Endpoint*) | **Azure-Dateifreigabe** in der Sync-Gruppe |
| **Cloud-Tiering** | Selten genutzte Dateien werden **ausgelagert** (nur **Platzhalter** lokal), bei Zugriff **automatisch zurückgeladen** |

Grenzen: **pro Sync-Gruppe genau 1 Cloud-Endpunkt**, **pro Server maximal 1 Serverendpunkt pro Volume**, **mehrere Server** je Sync-Gruppe möglich (Multi-Master-Verhalten: **letzter Schreiber gewinnt**, Konfliktdateien werden **umbenannt**).

### Voraussetzungen
| Bereich | Details |
|---|---|
| **Server-OS** | **Windows Server 2016 bis 2025** (2012 R2 nur mit alten, nicht mehr unterstützten Agents) |
| **Agent** | **Azure File Sync-Agent** (MSI) + **Az.StorageSync**-Modul |
| **Dateisystem** | **NTFS** für Serverendpunkte mit Cloud-Tiering; **ReFS** unterstützt **kein** Cloud-Tiering |
| **Netzwerk** | **Ausgehend HTTPS (443)** zu Azure; **kein** eingehender Port; optional **Private Endpoints/ExpressRoute/VPN**; **Proxy** konfigurierbar |
| **Azure** | **Speicherkonto** + **Speichersynchronisierungsdienst** in **derselben Region**; **Berechtigungen**: Rolle **Besitzer** oder benutzerdefinierte Rolle (zum **Registrieren**) |
| **Failovercluster** | Unterstützt (**Agent auf jedem Knoten**, Registrierung pro Knoten, **CSV** nicht) |
| **Dedup** | Unterstützt, **kompatibel mit Cloud-Tiering ab Server 2016/2019** |

### Cloud-Tiering
- **Richtlinie Volumenfreier Speicherplatz** (*Volume Free Space Policy*): z. B. **20 % frei halten** → älteste/**seltenste** Dateien werden ausgelagert.
- **Richtlinie Datumsbasiert** (*Date Policy*): Dateien **nicht geöffnet seit X Tagen** werden ausgelagert.
- Beide Richtlinien **zusammen** möglich: Datei wird ausgelagert, sobald **eine** Bedingung greift; die **Richtlinie für freien Speicherplatz** hat **Vorrang**.
- **Platzhalter** (*Stub/Reparse Point*): sieht aus wie Datei, **Symbol mit Wolke**, **Dateiattribute** (`O` = Offline/`L` = Reparse) im Explorer.
- **Abrufen** (*Recall*): Öffnen lädt die Datei **transparent** zurück (**Wartezeit** je nach Größe/Leitung); **Sicherungssoftware** kann **massenhaft** Rückladen auslösen (→ **AFS-kompatible** Sicherung nutzen).
- **Kein** Tiering für **< 64 KB** und **Dateien im Systemordner**.

### Synchronisierung – Verhalten
| Thema | Verhalten |
|---|---|
| **Änderungserkennung** | Lokal: **USN-Journal** (sofort/kurze Verzögerung); Cloud: **Änderungserkennung alle 24 h** (Azure-Dateifreigabe direkt geändert) bzw. **manuell** per `Invoke-AzStorageSyncChangeDetection` |
| **Konflikte** | **Beide** Versionen bleiben: Zweite Datei mit **Endung** `-<ServerName>-1` |
| **Berechtigungen** | **NTFS-ACLs** werden mit **synchronisiert** (**Azure Files** muss **Identitätsbasierten Zugriff** – Entra Domain Services oder **AD DS** – aktivieren, damit **ACLs** in der Cloud wirken) |
| **Löschungen** | Werden **synchronisiert** (**Papierkorb** in Azure Files über **Vorläufiges Löschen/Soft Delete**) |
| **Sicherung** | **Azure Backup** sichert die **Azure-Dateifreigabe** (Snapshots) – **kein** Server-Backup mehr nötig |
| **Schnelle Wiederherstellung** | **Neuer Server** registrieren, **Serverendpunkt** anlegen → **Namespace** wird zuerst geladen, Daten **bei Bedarf** (**Schnelle Notfallwiederherstellung**) |

### Bereitstellung – Ablauf
1. **Speicherkonto** + **Azure-Dateifreigabe** erstellen.
2. **Speichersynchronisierungsdienst** erstellen (Azure-Portal → *Azure File Sync*).
3. **AFS-Agent** auf dem Windows-Server installieren, **Server registrieren** (`Register-AzStorageSyncServer` oder Assistent).
4. **Synchronisierungsgruppe** anlegen → **Cloud-Endpunkt** (Azure-Dateifreigabe) auswählen.
5. **Serverendpunkt** anlegen → **Serverpfad** (z. B. `D:\Daten`) + **Cloud-Tiering** aktivieren (freier Speicherplatz z. B. 30 %).
6. Optional: **Weitere Server** hinzufügen (Multi-Site).

## Lab
**Maschinen**: **FS01** (Windows Server 2022, Domäne example.com, Internetzugang, Datenvolume **D:**), **ADMIN-PC** (Browser, Azure-Portal), **Azure-Abonnement** mit Berechtigung **Besitzer**.

### GUI
1. **ADMIN-PC** (Azure-Portal): **Speicherkonto** erstellen (Region **West Europe**, **Standard**, **LRS**) → **Datenspeicher → Dateifreigaben → + Dateifreigabe** → `freigabe1`.
2. **ADMIN-PC**: **Azure File Sync** suchen → **Speichersynchronisierungsdienst erstellen** → gleiche **Region**, gleiche **Ressourcengruppe**.
3. **FS01**: **Azure File Sync-Agent** herunterladen und installieren → Assistent **Serverregistrierung** → **Anmelden** (Azure-Konto) → **Abonnement**, **Ressourcengruppe**, **Speichersynchronisierungsdienst** wählen → **Registrieren**.
4. **ADMIN-PC**: Speichersynchronisierungsdienst → **Sync → Synchronisierungsgruppe → + Synchronisierungsgruppe** → Name `SG-Daten` → **Speicherkonto** und **Azure-Dateifreigabe** wählen (**Cloud-Endpunkt**) → **Erstellen**.
5. **ADMIN-PC**: Sync-Gruppe → **Serverendpunkt hinzufügen** → registrierten Server **FS01** → Pfad `D:\Daten` → **Cloud-Tiering: Aktiviert** → **Volumenfreier Speicherplatz 30 %**, **Datumsrichtlinie 30 Tage** → **Erstellen**.
6. **FS01**: In `D:\Daten` einige Dateien anlegen → im Portal **Azure-Dateifreigabe** prüfen: Dateien erscheinen (nach wenigen Minuten).
7. **FS01**: Große Datei öffnen → im Explorer Spalte **Status/Attribute**: **Wolkensymbol** für **ausgelagerte** Dateien.
8. **Optional**: Zweiten Server **FS02** registrieren, als **zweiten Serverendpunkt** in derselben Sync-Gruppe → Dateien erscheinen auch auf **FS02**.

### PowerShell
```powershell
# Auf FS01 – Az-Module und Agent (Agent-MSI vorher installiert)
Install-Module Az.StorageSync -Scope AllUsers
Connect-AzAccount

# Server registrieren
Register-AzStorageSyncServer -ResourceGroupName "rg-afs" -StorageSyncServiceName "sss-example"

# Sync-Gruppe und Cloud-Endpunkt
$sg = New-AzStorageSyncGroup -ResourceGroupName "rg-afs" -StorageSyncServiceName "sss-example" -Name "SG-Daten"
$sa = Get-AzStorageAccount -ResourceGroupName "rg-afs" -Name "saexample01"
New-AzStorageSyncCloudEndpoint -ResourceGroupName "rg-afs" -StorageSyncServiceName "sss-example" -SyncGroupName "SG-Daten" `
  -Name "CloudEP" -StorageAccountResourceId $sa.Id -AzureFileShareName "freigabe1"

# Serverendpunkt mit Cloud-Tiering
$server = Get-AzStorageSyncServer -ResourceGroupName "rg-afs" -StorageSyncServiceName "sss-example"
New-AzStorageSyncServerEndpoint -ResourceGroupName "rg-afs" -StorageSyncServiceName "sss-example" -SyncGroupName "SG-Daten" `
  -Name "FS01-D" -ServerResourceId $server.ResourceId -ServerLocalPath "D:\Daten" `
  -CloudTiering -VolumeFreeSpacePercent 30 -TierFilesOlderThanDays 30

# Status
Get-AzStorageSyncServerEndpoint -ResourceGroupName "rg-afs" -StorageSyncServiceName "sss-example" -SyncGroupName "SG-Daten"

# Änderungen in der Cloud sofort erkennen lassen
Invoke-AzStorageSyncChangeDetection -ResourceGroupName "rg-afs" -StorageSyncServiceName "sss-example" -SyncGroupName "SG-Daten" -CloudEndpointName "CloudEP"

# Auf FS01 – Ausgelagerte Dateien zurückholen
Invoke-StorageSyncFileRecall -Path D:\Daten -ThreadCount 8
```

## Einfach

**Azure File Sync** = du hast **zu Hause im Keller** einen **Dateiserver**, und **im Internet** liegt eine **Kopie in der Wolke** (Azure). AFS hält **beides gleich**: Speichert jemand im Keller eine Datei, taucht sie **auch in der Wolke** auf – und umgekehrt.

**Cloud-Tiering** = der Keller wird **voll**. Statt neue Festplatten zu kaufen, legt AFS **selten benutzte** Dateien **nur noch in der Wolke** ab und lässt **im Keller** eine **Leerhülle** (Platzhalter mit **Wolken-Symbol**). Öffnest du sie, holt AFS sie **kurz zurück** (dauert je nach Internet ein wenig).

**Mehrere Standorte**: Hamburg und München können **denselben Ordner** haben – beide sind mit der **Wolke** verbunden, die alles **abgleicht**. Ändern zwei Leute **gleichzeitig** dieselbe Datei, **behält AFS beide Versionen** (die zweite bekommt einen **Zusatz im Namen**).

**Wenn der Keller-Server abbrennt**: neuen Server aufstellen, mit der Wolke verbinden → die **Ordnerstruktur** ist **sofort** da, die Dateien laden **bei Bedarf** nach. **Sicherung** macht **Azure Backup** in der Wolke.

**Wichtige Begriffe** in einfachen Worten:
- **Speichersynchronisierungsdienst** = die **Schaltzentrale** in Azure.
- **Synchronisierungsgruppe** = **ein Ordner-Paket**, das gleich gehalten wird.
- **Cloud-Endpunkt** = die **Wolken-Seite** (Azure-Dateifreigabe).
- **Serverendpunkt** = die **Keller-Seite** (Ordner auf dem Server).

## Merksatz
- **Sync-Gruppe = 1 Cloud-Endpunkt + n Serverendpunkte**.
- **Cloud-Endpunkt = Azure-Dateifreigabe**, **Serverendpunkt = Pfad auf Windows-Server**.
- **Agent** installieren → **Server registrieren** → **Sync-Gruppe** → **Endpunkte**.
- **Cloud-Tiering**: **Freier Speicherplatz** und/oder **Datum**; **freier Speicherplatz** hat **Vorrang**.
- **Ausgehend nur HTTPS 443**, **Region** von Speicherkonto und Sync-Dienst **gleich**.
- **Konflikte**: **beide Dateien** bleiben (**Namenszusatz**).
- **Cloud-Änderungen** werden **alle 24 h** erkannt (oder per **Cmdlet** sofort).

## Prüfungsfalle
- **Pro Sync-Gruppe nur 1 Cloud-Endpunkt** – zwei Azure-Freigaben brauchen **zwei Sync-Gruppen**.
- **Speichersynchronisierungsdienst** und **Speicherkonto** müssen in **derselben Region** liegen.
- **Änderungen direkt in der Azure-Dateifreigabe** erscheinen lokal **nicht sofort** (Erkennung alle **24 h**).
- **Cloud-Tiering** nutzt **Platzhalter** – **Sicherungssoftware** ohne AFS-Unterstützung **lädt alles zurück** und **füllt** den Server.
- **ReFS** unterstützt **kein Cloud-Tiering** (Serverendpunkt **NTFS**).
- **Kein eingehender Port** nötig – **nur HTTPS ausgehend**.
- **Konflikt** = **keine Überschreibung**, sondern **zweite Datei** mit Zusatz.
- AFS **ersetzt nicht** die **Sicherung**: **Azure Backup** auf die **Azure-Dateifreigabe** nutzen.
- **Berechtigungen** in der Cloud brauchen **identitätsbasierten Zugriff** (AD DS/Entra DS), sonst **nur Speicherkonto-Schlüssel/SAS**.

## Grafik
### Wolke und Keller
Server im Keller (links) und Azure-Wolke (rechts) mit **doppeltem Pfeil**; eine neue Datei fliegt vom Keller in die Wolke, eine zweite umgekehrt.

### Tiering
Regal mit Ordnern im Keller: der Regalfüllstand steigt bis 70 % (Grenze), alte Ordner wandern per Aufzug in die Wolke, zurück bleibt eine transparente Hülle mit Wolkensymbol.

### Mehrere Standorte
Drei Häuser (Hamburg, München, Berlin) verbunden mit derselben Wolke; jede Änderung läuft als Lichtimpuls über die Wolke zu den anderen; bei gleichzeitiger Änderung entstehen zwei Dateisymbole.

## Karteikarten
- F: Was ist Azure File Sync? | A: Dienst, der lokale Windows-Dateiserver mit einer Azure-Dateifreigabe synchronisiert und Cloud-Tiering bietet.
- F: Was ist ein Cloud-Endpunkt? | A: Die Azure-Dateifreigabe in einer Synchronisierungsgruppe.
- F: Was ist ein Serverendpunkt? | A: Ein Pfad (Volume/Ordner) auf einem registrierten Windows-Server.
- F: Wie viele Cloud-Endpunkte hat eine Sync-Gruppe? | A: Genau einen.
- F: Reihenfolge der Bereitstellung? | A: Speicherkonto/Dateifreigabe, Speichersynchronisierungsdienst, Agent installieren und Server registrieren, Sync-Gruppe, Cloud- und Serverendpunkt.
- F: Was ist Cloud-Tiering? | A: Selten genutzte Dateien werden nur in Azure gehalten, lokal bleibt ein Platzhalter.
- F: Welche Tiering-Richtlinien gibt es? | A: Volumenfreier Speicherplatz und datumsbasiert.
- F: Welche Netzwerkverbindung braucht AFS? | A: Ausgehend HTTPS (443) zu Azure.
- F: Wie behandelt AFS Konflikte? | A: Beide Versionen bleiben, die zweite bekommt einen Namenszusatz.
- F: Cmdlet zum Erkennen von Cloud-Änderungen? | A: Invoke-AzStorageSyncChangeDetection
- F: Cmdlet zum Zurückholen ausgelagerter Dateien? | A: Invoke-StorageSyncFileRecall
- F: Womit sichert man die Daten bei AFS? | A: Azure Backup auf der Azure-Dateifreigabe (Snapshots).

## Quiz
? Ein Dateiserver in einer Filiale hat zu wenig Speicher. Selten genutzte Dateien sollen automatisch in Azure liegen, bleiben aber sichtbar. Lösung?
* Azure File Sync mit Cloud-Tiering
- BranchCache gehosteter Cache
- Storage Replica asynchron
- DFS-R Hub-and-Spoke

? Welche Komponente in AFS entspricht der Azure-Dateifreigabe?
* Cloud-Endpunkt
- Serverendpunkt
- Registrierter Server
- Speichersynchronisierungsdienst

? Ein Administrator möchte zwei verschiedene Azure-Dateifreigaben mit demselben Server synchronisieren. Vorgehen?
* Zwei Synchronisierungsgruppen mit je einem Cloud-Endpunkt
- Eine Sync-Gruppe mit zwei Cloud-Endpunkten
- Zwei Speichersynchronisierungsdienste in unterschiedlichen Regionen
- Zwei Serverendpunkte auf demselben Pfad

? Speichersynchronisierungsdienst liegt in North Europe, das Speicherkonto in West Europe. Ergebnis?
* Cloud-Endpunkt kann nicht erstellt werden; Regionen müssen übereinstimmen
- Funktioniert, aber langsamer
- Funktioniert nur mit ExpressRoute
- Funktioniert mit Cloud-Tiering nicht

? Änderungen wurden direkt in der Azure-Dateifreigabe gemacht und erscheinen nicht sofort auf dem Server. Wie beschleunigt man?
* Invoke-AzStorageSyncChangeDetection ausführen
- Server neu starten
- Cloud-Tiering deaktivieren
- Agent neu installieren

? Zwei Benutzer ändern gleichzeitig dieselbe Datei an zwei Standorten. Was passiert?
* Beide Versionen bleiben erhalten, eine mit Namenszusatz
- Die ältere Version wird überschrieben
- Die Änderung wird abgelehnt
- Die Datei wird gesperrt und gelöscht

? Nach Einführung von Cloud-Tiering läuft der Server durch die nächtliche Sicherung voll. Ursache?
* Sicherungssoftware ruft ausgelagerte Dateien massenhaft zurück
- Cloud-Tiering ist nicht aktiv
- Der Cloud-Endpunkt ist voll
- Dedup wurde deaktiviert
