---
id: az801-cau-rolling-upgrade
bereich: AZ-801
block: A9
kapitel: Hochverfügbarkeit
titel: Cluster-Aware Updating und Cluster OS Rolling Upgrade
stufe: Profi
quellen: [AZ-801 Study Guide, Microsoft Learn]
verweise: [az801-failover-cluster, az801-knoten-recovery, az801-s2d, az800-update-monitoring]
---

## Profi

### Cluster-Aware Updating (CAU)
**CAU** (*Cluster-Aware Updating*) **installiert Updates automatisch** **auf allen Knoten** **eines Clusters**, **einen Knoten nach dem anderen**, **ohne Ausfall der Rollen**.

### Ablauf pro Knoten
1. **Knoten „Drain“** (**Rollen** **werden** **per Live Migration/Failover** **auf andere Knoten verschoben**).
2. **Updates installieren** (**Windows Update/WSUS/Hotfix**).
3. **Neustart**, **falls nötig**.
4. **Knoten fortsetzen** (**Resume**), **Rollen** **zurück (Failback)**.
5. **Nächster Knoten**.

**Voraussetzung**: **Mindestens 2 Knoten**, **Kapazität**, **damit** **ein Knoten fehlen darf**.

### Betriebsmodi
| Modus | Beschreibung |
|---|---|
| **Selbstaktualisierung** (*Self-Updating Mode*) | **CAU-Clusterrolle** **läuft im Cluster** **und startet** **nach Zeitplan** **(z. B. 2. Dienstag, 03:00)** |
| **Remoteaktualisierung** (*Remote-Updating Mode*) | **Koordinator** **außerhalb** **(Admin-PC/Server)** **startet** **den Lauf** **manuell/Task** |

### Bausteine
| Element | Erklärung |
|---|---|
| **Update-Koordinator** | **Steuert** **den Lauf** (**Cluster-Rolle** **oder** **externer Server**) |
| **Updating Run** | **Ein Lauf** **über alle Knoten** |
| **Updating Run Profile** | **XML-Vorlage** **(Wiederholungsversuche, Timeouts, Drain-Optionen)** |
| **Plug-ins** | `Microsoft.WindowsUpdatePlugin` (**Windows Update/WSUS**), `Microsoft.HotfixPlugin` (**Hotfix-Dateien aus Freigabe**) |
| **Voraussetzungen** | **Firewallregeln** **„Remoteherunterfahren“**, **WMI**, **PowerShell-Remoting** |

### Wichtige Parameter
| Parameter | Bedeutung |
|---|---|
| `-DaysOfWeek`, `-WeeksOfMonth` | **Zeitplan** |
| `-MaxFailedNodes` | **Toleranz** **bei Fehlern** **(Lauf bricht ab, wenn überschritten)** |
| `-MaxRetriesPerNode` | **Wiederholungen** |
| `-RequireAllNodesOnline` | **Nur starten**, **wenn alle Knoten online** |
| `-EnableFirewallRules` | **Firewallregeln** **automatisch aktivieren** |
| `-StartDate` | **Erster Termin** |

```powershell
# Auf NODE01 – Voraussetzungen prüfen
Test-CauSetup -ClusterName CLU01

# Selbstaktualisierung einrichten (jeden 2. Dienstag, 03:00)
Add-CauClusterRole -ClusterName CLU01 -DaysOfWeek Tuesday -WeeksOfMonth 2 -MaxFailedNodes 1 -MaxRetriesPerNode 2 -RequireAllNodesOnline -EnableFirewallRules -Force

# Manueller Lauf (Remoteaktualisierung)
Invoke-CauRun -ClusterName CLU01 -CauPluginName Microsoft.WindowsUpdatePlugin -MaxFailedNodes 1 -MaxRetriesPerNode 2 -RequireAllNodesOnline -Force

# Vorschau: Welche Updates wären fällig?
Invoke-CauScan -ClusterName CLU01 -CauPluginName Microsoft.WindowsUpdatePlugin

# Status und Berichte
Get-CauClusterRole -ClusterName CLU01
Get-CauRun -ClusterName CLU01
Get-CauReport -ClusterName CLU01 -Last -Detailed

# Rolle entfernen
Remove-CauClusterRole -ClusterName CLU01 -Force
```

### Manuelles Knoten-Patchen (Alternative)
```powershell
# Auf NODE01 – Knoten entleeren
Suspend-ClusterNode -Name NODE02 -Drain -Wait

# Auf NODE02 – Updates installieren, neu starten

# Auf NODE01 – Knoten zurückholen
Resume-ClusterNode -Name NODE02 -Failback Immediate
```

### CAU und Storage Spaces Direct
- **Vor** **dem nächsten Knoten** **wartet** **CAU**, **bis** **Storage-Jobs** **(Resync)** **beendet** **sind**.
- **Kontrolle**: `Get-StorageJob`.

### Cluster OS Rolling Upgrade
**Rolling Upgrade** **hebt** **das Betriebssystem** **der Knoten** **schrittweise** **auf eine neue Version**, **ohne** **Cluster** **neu zu bauen** **und ohne** **Ausfall**.

| Punkt | Details |
|---|---|
| **Mischbetrieb** | **Zeitweise** **zwei Windows-Versionen** **im Cluster** (**„Mixed-OS-Modus“**) |
| **Unterstützte Wege** | **N → N+1** **(und teils N+2, je nach Version, siehe Microsoft Learn)**, **z. B. 2019 → 2022** |
| **Clusterfunktionsebene** (*Cluster Functional Level*) | **Bleibt auf altem Level**, **bis** **alle Knoten** **aktualisiert** |
| **Endschritt** | `Update-ClusterFunctionalLevel` (**nicht umkehrbar**) |
| **Hyper-V-Zusatz** | **VM-Konfigurationsversion** **hochstufen** (`Update-VMVersion`, **VM aus**) |
| **S2D-Zusatz** | **Speicherpool** **hochstufen** (`Update-StoragePool`) |

### Schritte je Knoten
1. **`Suspend-ClusterNode -Drain`**.
2. **Knoten aus Cluster entfernen** (`Remove-ClusterNode`) – **bei Neuinstallation**.
3. **Neu installieren** (**Clean Install**) **oder** **In-Place-Upgrade** (**je nach Version zulässig**).
4. **Feature Failover-Clustering** **installieren**, **Treiber**.
5. **Zurück in den Cluster** (`Add-ClusterNode`).
6. **`Resume-ClusterNode`**.
7. **Wiederholen** **für alle Knoten**.
8. **Alle Knoten** **auf neuer Version** → **Funktionsebene** **anheben**.

```powershell
# Auf NODE01 – Funktionsebene prüfen und anheben
Get-Cluster | Select-Object Name, ClusterFunctionalLevel, ClusterUpgradeVersion
Get-ClusterNodeSupportedVersion

# Nach Abschluss aller Knoten
Update-ClusterFunctionalLevel

# Hyper-V-VMs
Get-VM | Where-Object Version -lt 12.0 | Update-VMVersion

# S2D-Pool
Update-StoragePool -FriendlyName "S2D on CLU01"
```

### CAU vs. Rolling Upgrade
| Merkmal | **CAU** | **Rolling Upgrade** |
|---|---|---|
| **Zweck** | **Monatliche Updates** | **Betriebssystem-Versionswechsel** |
| **Automatisierung** | **Vollständig** | **Halbautomatisch/manuell** |
| **Ausfall der Rollen** | **Keiner** | **Keiner (Live Migration)** |
| **Rückgängig** | **Updates deinstallieren** | **Vor Funktionsebene ja, danach nein** |

## Lab
**Maschinen**: **DC01**, **NODE01**, **NODE02** (**Cluster CLU01**, **VM01 als Rolle**).

### GUI
1. **NODE01**: **Failovercluster-Manager → CLU01 → Rechtsklick → Weitere Aktionen → Clusteraware-Aktualisierung**.
2. **NODE01**: **Cluster-Aware-Updating-Fenster → „Clusterselbstaktualisierungsoptionen konfigurieren“**.
3. **NODE01**: **Hinzufügen der CAU-Clusterrolle** → **Zeitplan wählen** (**Dienstag, 2. Woche, 03:00**) → **Weiter**.
4. **NODE01**: **Updating-Run-Optionen** → **Max. Wiederholungen 2**, **Fehlgeschlagene Knoten 1**.
5. **NODE01**: **Clustervorschau der Updates → Updates anzeigen**.
6. **NODE01**: **Jetzt Updates auf den Cluster anwenden** (**Testlauf**).
7. **NODE01**: **Failovercluster-Manager → Knoten → NODE02 → Pausieren → Rollen entleeren** → **später Fortsetzen**.

### PowerShell
```powershell
# Auf NODE01
Test-CauSetup -ClusterName CLU01
Add-CauClusterRole -ClusterName CLU01 -DaysOfWeek Tuesday -WeeksOfMonth 2 -MaxFailedNodes 1 -MaxRetriesPerNode 2 -RequireAllNodesOnline -EnableFirewallRules -Force
Invoke-CauScan -ClusterName CLU01 -CauPluginName Microsoft.WindowsUpdatePlugin
Invoke-CauRun -ClusterName CLU01 -MaxFailedNodes 1 -MaxRetriesPerNode 2 -Force
Get-CauReport -ClusterName CLU01 -Last -Summary
```

## Einfach

**CAU** ist wie **ein Hausmeister**, **der nachts nacheinander alle Zimmer renoviert**: **Erst wird der Bewohner** (**die Rolle**) **ins Nachbarzimmer gebracht**, **dann wird renoviert**, **dann zieht er zurück**. **Danach kommt das nächste Zimmer.** **Das Haus bleibt immer bewohnt.**

**Rolling Upgrade** ist **wie ein Umzug in ein neues Gebäude**, **Stück für Stück**: **Erst zieht ein Bewohner ins neue Haus**, **dann der nächste**. **Solange beide Häuser stehen**, **gelten noch die alten Regeln**. **Sind alle drin**, **wird die Tür zum alten Haus zugemauert** (**Funktionsebene anheben**) – **danach kein Zurück mehr**.

## Merksatz
- **CAU = Patch Tuesday für Cluster**.
- **Drain → Update → Resume**.
- **Selbst** = **Zeitplan im Cluster**, **Remote** = **von außen gestartet**.
- **Rolling Upgrade** = **Version wechseln ohne Neubau**.
- **`Update-ClusterFunctionalLevel`** = **Point of no return**.
- **Vorher Storage-Jobs abwarten** (**S2D**).

## Prüfungsfalle
- **CAU braucht** **Kapazität**, **damit ein Knoten fehlen darf**.
- **Funktionsebene** **erst anheben**, **wenn alle Knoten aktualisiert** sind.
- **Nach dem Anheben** **kein Rollback** **auf alte Version**.
- **VM-Version** **hochstufen** **nur bei ausgeschalteter VM**.
- **S2D**: **Pool** **hochstufen**, **sonst** **neue Funktionen fehlen**.
- **Self-Updating** **≠** **Remote-Updating**.
- **`-RequireAllNodesOnline`** **verhindert Lauf**, **wenn ein Knoten offline**.
- **CAU** **benötigt** **Firewallregeln** (`-EnableFirewallRules`).
- **CAU** **aktualisiert** **nicht** **Feature-Upgrades** **(Versionswechsel)**.

## Grafik
### Hausmeister-Rundgang
Zimmer für Zimmer: Bewohner zieht aus, Renovierung, Bewohner zieht ein.

### Zwei Häuser
Alter und neuer Block; Bewohner ziehen nacheinander um; am Ende schließt sich die alte Tür.

### Funktionsebene
Schalter „N → N+1“; nach Umlegen rastet er ein und lässt sich nicht zurückstellen.

## Karteikarten
- F: Was macht CAU? | A: Patcht Clusterknoten automatisch nacheinander ohne Rollen-Ausfall.
- F: Zwei CAU-Modi? | A: Selbstaktualisierung und Remoteaktualisierung.
- F: Welches Cmdlet richtet Selbstaktualisierung ein? | A: Add-CauClusterRole.
- F: Welches Cmdlet startet einen Lauf? | A: Invoke-CauRun.
- F: Was macht Suspend-ClusterNode -Drain? | A: Verschiebt Rollen vom Knoten und pausiert ihn.
- F: Was ist Rolling Upgrade? | A: Schrittweises OS-Upgrade der Knoten ohne Cluster-Neubau.
- F: Wie hebt man die Clusterfunktionsebene an? | A: Update-ClusterFunctionalLevel.
- F: Ist das Anheben umkehrbar? | A: Nein.
- F: Was muss nach dem Upgrade bei Hyper-V erfolgen? | A: VM-Version hochstufen (Update-VMVersion).
- F: Was bei S2D nach dem Upgrade? | A: Update-StoragePool.
- F: Welche Plug-ins hat CAU? | A: WindowsUpdatePlugin und HotfixPlugin.
- F: Was prüft Test-CauSetup? | A: Voraussetzungen für CAU.

## Quiz
? Ein Cluster soll monatlich automatisch gepatcht werden, ohne dass Rollen ausfallen. Lösung?
* Cluster-Aware Updating
- WSUS allein
- Storage Replica
- DFS-R

? Was ist die Selbstaktualisierung?
* CAU-Rolle im Cluster startet Läufe nach Zeitplan
- Manueller Lauf von einem Admin-PC
- Ein Azure-Dienst
- Ein WSUS-Target

? Windows Server 2019 Cluster soll auf 2022 aktualisiert werden ohne Neubau. Was nutzt man?
* Cluster OS Rolling Upgrade
- Cluster Set
- Stretch-Cluster
- Hyper-V Replica

? Welcher Schritt ist nicht umkehrbar?
* Update-ClusterFunctionalLevel
- Suspend-ClusterNode
- Resume-ClusterNode
- Invoke-CauScan

? Was passiert bei -RequireAllNodesOnline?
* Der Lauf startet nur, wenn alle Knoten online sind
- Alle Knoten werden neu gestartet
- Ein Witness wird erstellt
- Der Cluster wird gelöscht

? Wann darf man Update-VMVersion ausführen?
* Wenn die VM ausgeschaltet ist
- Nur unter Linux
- Nur bei laufender Live Migration
- Nie

? Mit welchem Cmdlet wird die Cluster-Funktionsebene nach einem Rolling Upgrade erhöht?
* Update-ClusterFunctionalLevel
- Update-VMVersion
- Set-ClusterQuorum
- Invoke-CauRun
! Danach ist kein Rückweg zur alten Version mehr möglich.

? Was startet einen CAU-Lauf manuell (Remote-Aktualisierung)?
* Invoke-CauRun
- Add-CauClusterRole
- Install-WindowsUpdate
- Start-Cluster
! Add-CauClusterRole konfiguriert die Selbstaktualisierung.
