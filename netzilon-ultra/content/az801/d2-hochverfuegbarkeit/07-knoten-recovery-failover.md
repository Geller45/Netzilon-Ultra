---
id: az801-knoten-recovery
bereich: AZ-801
block: A9
kapitel: Hochverfügbarkeit
titel: Knoten-Recovery und Failover
stufe: Profi
quellen: [AZ-801 Study Guide, Microsoft Learn]
verweise: [az801-failover-cluster, az801-cluster-storage-quorum, az801-cau-rolling-upgrade, az801-s2d]
---

## Profi

### Knotenzustände
| Zustand | Bedeutung |
|---|---|
| **Aktiv (Up)** | **Knoten** **nimmt** **am Cluster teil** |
| **Angehalten (Paused)** | **Knoten** **läuft**, **nimmt** **keine neuen Rollen** **an** (**Wartung**) |
| **Ausgefallen (Down)** | **Knoten** **nicht erreichbar** |
| **Isoliert (Isolated)** | **Clusterdienst** **läuft**, **Kommunikation** **gestört** |
| **Quarantäne (Quarantined)** | **Knoten** **fällt wiederholt aus** → **vorübergehend gesperrt** |
| **Beitretend / Verlassend** | **Übergangszustand** |

### Was passiert bei einem Knotenausfall?
1. **Heartbeat** **bleibt aus** (**Schwellenwert** **überschritten**).
2. **Cluster** **schließt** **den Knoten** **aus** (**Ereignis 1135**).
3. **Restliche Knoten** **prüfen** **Quorum**.
4. **Rollen** **starten** **auf anderen Knoten** (**Failover**).
5. **VMs**: **Neustart** **(Crash-konsistent)**.
6. **Nach Rückkehr**: **Failback** **je Einstellung**.

### Planned vs. Unplanned
| Art | Vorgehen |
|---|---|
| **Geplant** | **`Suspend-ClusterNode -Drain`**, **Live Migration**, **Wartung**, **`Resume-ClusterNode`** |
| **Ungeplant** | **Automatisches Failover**, **danach** **Ursache** **suchen** |

### Knoten-Quarantäne (ab 2016)
- **Ein Knoten**, **der** **3-mal** **innerhalb** **einer Stunde** **ausfällt** (**Standard**), **wird** **für** **2 Stunden** **in Quarantäne** **gesetzt**.
- **Rollen** **wandern** **auf andere Knoten**, **Knoten** **bekommt** **keine Rollen** **mehr**.
- **Einstellung**: `(Get-Cluster).QuarantineThreshold` **(Standard 3)**, `(Get-Cluster).QuarantineDuration` **(Standard 7200 Sekunden)**.
- **Manuell** **entsperren**: `Start-ClusterNode -Name NODE02 -ClearQuarantine`.

### Failover-Richtlinien einer Rolle
| Einstellung | Standard | Wirkung |
|---|---|---|
| `FailoverThreshold` | **2** (bei **manchen Rollen** **n−1**) | **Max. Failover** **im Zeitraum** |
| `FailoverPeriod` | **6 Stunden** | **Zeitraum** |
| **Failback** (`AutoFailbackType`) | **Verhindern** | **Sofort** **oder** **Zeitfenster** |
| **Bevorzugter Besitzer** | **–** | **Wunschknoten** |
| **Mögliche Besitzer** | **Alle** | **Erlaubte Knoten** |

```powershell
# Auf NODE01 – Failover-Verhalten einstellen
$g = Get-ClusterGroup "FS-ROLE"
$g.FailoverThreshold = 4
$g.FailoverPeriod = 6
$g.AutoFailbackType = 1        # 1 = Failback erlauben
$g.FailbackWindowStart = 2
$g.FailbackWindowEnd = 5
Set-ClusterOwnerNode -Group "FS-ROLE" -Owners NODE01, NODE02
Move-ClusterGroup -Name "FS-ROLE" -Node NODE02
```

### Ressourcen-Richtlinien
| Einstellung | Bedeutung |
|---|---|
| **Neustart bei Fehler** | **Ressource** **wird** **zuerst lokal** **neu gestartet** |
| **Schwelle für Neustart** | **Max. Neustarts** **im Zeitraum** |
| **Prüfintervalle** (*Looks Alive* / *Is Alive*) | **Wie oft** **der Zustand geprüft** wird |
| **Abhängigkeiten** | **Ressource** **startet** **nur** **wenn** **Abhängigkeit online** (**Disk → Name → Dienst**) |

### VM-Überwachung (VM Monitoring)
- **Cluster** **überwacht** **Dienste** **im Gast** **(z. B. Spooler)**.
- **Aktion** **bei Ausfall**: **Dienst** **im Gast** **neu starten** **oder** **VM** **neu starten**.
- `Add-ClusterVMMonitoredItem -VirtualMachine VM01 -Service Spooler`.

### Wiederherstellung – Werkzeuge
| Situation | Maßnahme |
|---|---|
| **Knoten kurz weg** | **Automatisch** **zurück** **beim Start** |
| **Knoten dauerhaft defekt** | **Aus Cluster entfernen**: `Remove-ClusterNode -Name NODE02 -Force` |
| **Knoten neu aufgebaut** | **Feature installieren** → `Add-ClusterNode -Name NODE02` |
| **Alter Clusterzustand hängt** | `Clear-ClusterNode -Name NODE02 -Force` (**auf** **dem** **betroffenen Knoten** **lokal**) |
| **Quorum verloren** | `Start-ClusterNode -Name NODE01 -FixQuorum` |
| **Cluster-Datenbank** **defekt** | **Autoritative Wiederherstellung** **aus Sicherung** **(Windows Server Backup, Systemstatus)** |
| **Cluster komplett weg** | **Neu erstellen** (`New-Cluster`), **Rollen** **wieder anlegen**, **CNO** **prüfen** |
| **CNO gelöscht** | **AD-Papierkorb** **oder** **Konto** **zurücksetzen/neu** **anlegen**, **`Repair-ClusterNetworkName`** |
| **Disk fehlgeschlagen** | **Ersetzen**, **Rolle** **online**, `Repair-ClusterStorageSpacesDirect` **(S2D)** |

### Diagnose
```powershell
# Auf NODE01 – Clusterprotokolle der letzten 15 Minuten aller Knoten
Get-ClusterLog -Destination C:\Temp -TimeSpan 15 -UseLocalTime

# Knoten und Ressourcen
Get-ClusterNode | Select-Object Name, State, StatusInformation
Get-ClusterResource | Where-Object State -ne Online
Get-ClusterNetwork
Get-ClusterNetworkInterface | Where-Object State -ne Up

# Ereignisse
Get-WinEvent -FilterHashtable @{LogName="Microsoft-Windows-FailoverClustering/Operational"; Level=1,2,3} -MaxEvents 30
```

| Ereignis-ID | Bedeutung |
|---|---|
| **1135** | **Knoten** **aus** **Membership** **entfernt** |
| **1177** | **Clusterdienst** **beendet**, **Quorum verloren** |
| **1069** | **Ressource** **fehlgeschlagen** |
| **1146** | **RHS-Prozess** **beendet** **(Ressourcenhost)** |
| **1205** | **Rolle** **konnte** **nicht** **online** **gehen** |
| **5120 / 5142** | **CSV** **wechselt** **in** **umgeleiteten Modus** **(Fehler)** |

### Häufige Ursachen für Knotenausfälle
| Ursache | Lösung |
|---|---|
| **Netzwerk/Heartbeat** | **Redundante NICs**, **Schwellen prüfen** |
| **Treiber/Firmware** | **Aktualisieren**, **Validierung** |
| **Antivirus** **blockiert** **Clusterdienst** | **Ausnahmen** **setzen** (`C:\Windows\Cluster`, `ClusSvc`) |
| **Speicherpfad-Fehler** | **MPIO**, **Verkabelung**, **SAN** |
| **Zeitabweichung** | **Zeitsynchronisierung** **über PDC-Emulator** |
| **AD-Probleme** | **CNO/VCO** **berechtigt**, **DNS-Einträge** |

## Lab
**Maschinen**: **DC01**, **NODE01**, **NODE02**, **NODE03** **(Cluster CLU01)**, **Rolle VM01** **läuft auf NODE02**.

### GUI
1. **NODE01**: **Failovercluster-Manager → CLU01 → Knoten**.
2. **NODE01**: **NODE02 → Rechtsklick → Anhalten → Rollen entleeren** → **VM01** **wandert**.
3. **NODE01**: **NODE02 → Rechtsklick → Fortsetzen → Rollen zurückfahren**.
4. **NODE01**: **Rolle VM01 → Eigenschaften → Failover** → **Maximale Anzahl Fehler: 4**, **Zeitraum: 6 Stunden**.
5. **NODE01**: **Rolle VM01 → Bevorzugte Besitzer → NODE02 auswählen** → **Failback aktivieren** (**Sofort**).
6. **NODE02**: **Netzwerkkabel abziehen** (**Ausfall simulieren**) → **VM01** **startet** **auf NODE01/NODE03**.
7. **NODE01**: **Ereignisanzeige → Anwendungs- und Dienstprotokolle → Microsoft → Windows → FailoverClustering → Operational** → **Ereignis 1135** **prüfen**.
8. **NODE01**: **Knoten NODE02 → Weitere Aktionen → Weitere Aktionen → Knoten entfernen**; **danach** **NODE02 → Knoten hinzufügen**.

### PowerShell
```powershell
# Auf NODE01
Suspend-ClusterNode -Name NODE02 -Drain -Wait
Resume-ClusterNode -Name NODE02 -Failback Immediate
(Get-Cluster).QuarantineThreshold
Start-ClusterNode -Name NODE02 -ClearQuarantine
Get-ClusterLog -Destination C:\Temp -TimeSpan 30 -UseLocalTime
Remove-ClusterNode -Name NODE02 -Force
Add-ClusterNode -Name NODE02

# Auf NODE02 (lokal, falls Alt-Zustand hängt)
Clear-ClusterNode -Force
```

## Einfach

Ein **Cluster-Knoten** ist **wie ein Mitarbeiter im Schichtdienst**. **Wird einer krank**, **springt ein anderer ein**. Das ist **Failover**.

**Geplant** (**„Ich gehe zum Zahnarzt“**): **Er übergibt seine Aufgaben ordentlich** (**Drain**), **geht**, **kommt zurück** (**Resume**).

**Ungeplant** (**„Er fällt um“**): **Die anderen merken es**, **weil kein Lebenszeichen mehr kommt**, **und übernehmen sofort**.

**Fällt ein Mitarbeiter ständig aus**, **schickt ihn der Chef erst mal in Quarantäne** – **damit er nicht alle anderen mitreißt**.

**Ist jemand dauerhaft weg**, **wird er aus der Liste gestrichen** (**Remove**) **und ein neuer Mitarbeiter** **eingestellt** (**Add**).

## Merksatz
- **Geplant** = **Drain**, **ungeplant** = **automatisches Failover**.
- **3 Ausfälle in 1 Stunde** = **Quarantäne für 2 Stunden**.
- **2 Fehler in 6 Stunden** = **Rollen-Failover-Limit**.
- **`-FixQuorum`** = **Notstart**.
- **Ereignis 1135** = **Knoten raus**, **1177** = **Quorum weg**.
- **`Get-ClusterLog`** = **Detektiv-Werkzeug**.

## Prüfungsfalle
- **Quarantäne** **löst man** **mit `-ClearQuarantine`**.
- **`Clear-ClusterNode`** **läuft** **auf dem betroffenen Knoten** **selbst**.
- **Failover-Schwelle** **überschritten** = **Rolle** **bleibt** **offline**.
- **Failback** **ist** **standardmäßig aus**.
- **Knoten** **neu aufgebaut** **braucht** **Feature** **vor `Add-ClusterNode`**.
- **VM-Failover** **= Neustart**, **nicht Live Migration**.
- **Antivirus** **ohne Ausnahmen** **kann** **Knoten** **zum Ausfall bringen**.
- **Datenbank-Restore** **autoritativ** **nur** **bei Beschädigung** **aller Knoten**.

## Grafik
### Schichtwechsel
Ein Mitarbeiter wird blass, Aufgaben wandern zum Nachbarn.

### Quarantäne-Zelle
Knoten fällt dreimal um, Tür schließt sich, Uhr zählt zwei Stunden.

### Log-Lupe
Lupe fährt über Protokoll, markiert Ereignis 1135.

## Karteikarten
- F: Was macht Suspend-ClusterNode -Drain? | A: Verschiebt Rollen und pausiert den Knoten.
- F: Wie lange dauert die Knoten-Quarantäne standardmäßig? | A: 2 Stunden.
- F: Ab wie vielen Ausfällen greift die Quarantäne? | A: 3 Ausfälle in einer Stunde.
- F: Wie hebt man die Quarantäne auf? | A: Start-ClusterNode -ClearQuarantine.
- F: Was bedeutet Ereignis 1135? | A: Knoten aus dem Cluster-Membership entfernt.
- F: Was bedeutet Ereignis 1177? | A: Quorumverlust, Clusterdienst beendet.
- F: Wie liest man Clusterprotokolle? | A: Get-ClusterLog.
- F: Wie entfernt man einen toten Knoten? | A: Remove-ClusterNode -Force.
- F: Wie bereinigt man einen Knoten lokal? | A: Clear-ClusterNode.
- F: Standard-Failoverschwelle einer Rolle? | A: 2 Fehler in 6 Stunden.
- F: Was macht VM Monitoring? | A: Überwacht Dienste im Gast und startet sie oder die VM neu.
- F: Wie startet man den Cluster mit einem Knoten ohne Quorum? | A: Start-ClusterNode -FixQuorum.

## Quiz
? Ein Knoten fällt dreimal in einer Stunde aus. Was macht der Cluster?
* Setzt ihn für 2 Stunden in Quarantäne
- Löscht ihn dauerhaft
- Fährt alle Knoten herunter
- Ändert das Quorum

? Welches Ereignis zeigt, dass ein Knoten aus dem Cluster entfernt wurde?
* 1135
- 4624
- 5136
- 7036

? Wie bereitet man einen Knoten für Wartung vor, ohne Ausfall der Rollen?
* Suspend-ClusterNode -Drain
- Stop-Cluster
- Remove-ClusterNode
- Clear-ClusterNode

? Ein Knoten wurde neu installiert und soll wieder in den Cluster. Erster Schritt?
* Failover-Clustering-Feature installieren
- Quorum löschen
- CNO neu anlegen
- Cluster neu erstellen

? Wie sammelt man detaillierte Clusterlogs aller Knoten?
* Get-ClusterLog
- Get-EventLog
- Get-ClusterNode
- Test-Cluster

? Eine Rolle bleibt nach 3 Fehlern offline. Ursache?
* Failover-Schwelle überschritten
- Falsches Subnetz
- Zu wenig RAM am DC
- Witness gelöscht

? Welches Cmdlet entleert einen Knoten vor Wartungsarbeiten?
* Suspend-ClusterNode -Drain
- Stop-ClusterNode -Force
- Remove-ClusterNode
- Move-ClusterGroup -All
! Nach der Wartung Resume-ClusterNode -Failback Immediate.

? Was bewirkt die Einstellung „Failback“ einer Clusterrolle?
* Die Rolle wechselt zum bevorzugten Besitzer zurück, sobald er wieder verfügbar ist.
- Die Rolle wird gelöscht.
- Die Rolle bleibt dauerhaft offline.
- Der Cluster wird neu gestartet.
! Failback kann sofort oder in einem Zeitfenster erfolgen.
