---
id: az801-asr
bereich: AZ-801
block: A10
kapitel: Disaster Recovery
titel: Azure Site Recovery (ASR)
stufe: Profi
quellen: [AZ-801 Study Guide, Microsoft Learn]
verweise: [az801-azure-backup, az801-hyperv-replica, az800-azure-vms]
---

## Profi

### Zweck
**Azure Site Recovery** (**ASR**) **repliziert** **Arbeitslasten** **an einen zweiten Ort**, **damit** **nach einem Ausfall** **(Notfall, DR)** **dort** **weitergearbeitet werden kann**. **Backup** **schützt Daten** **(Zurückspielen)**, **ASR** **schützt Betrieb** **(Weiterlaufen)**.

| | **Backup** | **Site Recovery** |
|---|---|---|
| **Ziel** | **Daten wiederherstellen** | **Dienst weiterbetreiben** |
| **Kennzahl** | **Aufbewahrung** | **RPO/RTO** |
| **Ergebnis** | **Datenkopie** | **Laufende Ersatz-VM** |

**RPO** (*Recovery Point Objective*) = **maximal tolerierbarer Datenverlust**. **RTO** (*Recovery Time Objective*) = **maximal tolerierbare Ausfallzeit**.

### Unterstützte Szenarien
| Szenario | Erklärung |
|---|---|
| **Azure → Azure** | **VMs** **in andere Region** **replizieren** |
| **VMware/physisch → Azure** | **Über** **Replikationsapplikation** (*Replication Appliance*) **+ Mobilitätsdienst** |
| **Hyper-V → Azure** | **Über** **ASR-Provider** **+ Recovery Services Agent** **auf dem Host** (**mit oder ohne VMM**) |
| **Hyper-V → Hyper-V** | **Zweiter Standort** (**mit VMM**) |

### Bausteine
| Baustein | Erklärung |
|---|---|
| **Recovery Services Vault** | **Verwaltet** **Replikation** **und Wiederherstellungspläne** |
| **Mobilitätsdienst** (*Mobility Service*) | **Agent** **in der Quell-VM** (**bei Azure-VMs** **automatisch**) |
| **Cache-Speicherkonto** | **Zwischenspeicher** **in der Quellregion** |
| **Replikationsrichtlinie** | **Wiederherstellungspunkt-Aufbewahrung** (**Standard 24 h**), **App-konsistenter Snapshot** (**Standard alle 4 h**) |
| **Netzwerkzuordnung** (*Network Mapping*) | **Quell-VNet → Ziel-VNet** |
| **Ziel-Ressourcen** | **Zielregion, Ressourcengruppe, Verfügbarkeitsgruppe/-zone** |

**Hyper-V-Replikationsintervalle** (**Azure-Ziel**): **30 Sekunden**, **5 Minuten**, **15 Minuten**.

### Wiederherstellungsplan (*Recovery Plan*)
**Gruppiert** **VMs** **in Gruppen** **mit Reihenfolge** (**z. B. 1: DC, 2: SQL, 3: Web**). **Enthält** **Skripte** (**Azure-Automation-Runbooks**) **und** **manuelle Aktionen** (**„Prüfe DNS“**). **Ein Klick** **für** **den ganzen Failover**.

### Failover-Arten
| Art | Erklärung |
|---|---|
| **Testfailover** (*Test Failover*) | **In isoliertes Testnetz**, **Quelle** **läuft weiter**, **kein Einfluss** **auf Produktion** – **regelmäßig üben** |
| **Geplantes Failover** (*Planned Failover*) | **Quelle** **wird** **heruntergefahren**, **letzte Änderungen** **repliziert**, **kein Datenverlust** (**nur Hyper-V/VMware**) |
| **Ungeplantes Failover** (*Unplanned Failover*) | **Notfall**, **Quelle** **weg**, **letzter Punkt** **wird** **genutzt** |

### Nach dem Failover
1. **Commit** (**Wiederherstellungspunkt** **endgültig** **wählen**; **andere Punkte** **werden** **gelöscht**).
2. **Erneut schützen** (*Re-protect*): **Replikation** **umkehren** (**Azure → alter Standort**).
3. **Failback**: **Geplantes Failover** **zurück** **zum Quell-Standort**.
4. **Ressourcen** **bereinigen** (**Testfailover-Bereinigung**).

### Netzwerk beim Failover
- **IP-Adresse** **ändert sich** **oft** (**anderes Subnetz**) – **Ziel-IP** **im VM-Netzwerk** **vorab festlegen** **oder** **DNS/Traffic Manager**.
- **Verbindung** **zur Zielregion**: **Site-to-Site-VPN** **oder** **ExpressRoute**.
- **Bei Azure-zu-Azure**: **Load Balancer**, **NSG** **und** **öffentliche IP** **neu zuordnen**.

### PowerShell
```powershell
# Auf Admin-PC – Azure → Azure grundlegend prüfen
$vault = Get-AzRecoveryServicesVault -Name vault-dr -ResourceGroupName rg-dr
Set-AzRecoveryServicesAsrVaultContext -Vault $vault

Get-AzRecoveryServicesAsrFabric
Get-AzRecoveryServicesAsrReplicationProtectedItem

# Testfailover starten
$rpi = Get-AzRecoveryServicesAsrReplicationProtectedItem -FriendlyName VM01 -ProtectionContainer $container
$job = Start-AzRecoveryServicesAsrTestFailoverJob -ReplicationProtectedItem $rpi -Direction PrimaryToRecovery -AzureVMNetworkId $testNetId

# Testfailover aufräumen
Start-AzRecoveryServicesAsrTestFailoverCleanupJob -ReplicationProtectedItem $rpi

# Ungeplantes Failover und Commit
Start-AzRecoveryServicesAsrUnplannedFailoverJob -ReplicationProtectedItem $rpi -Direction PrimaryToRecovery
Start-AzRecoveryServicesAsrCommitFailoverJob -ReplicationProtectedItem $rpi
```

## Lab
**Maschinen**: **Azure-Abo**, **VM01** **in Region „West Europe“**, **Tresor „vault-dr“** **in „North Europe“**.

### GUI
1. **Azure-Portal**: **VM01 → Vorgänge → Notfallwiederherstellung** (*Disaster Recovery*).
2. **Azure-Portal**: **Zielregion „North Europe“** **wählen** → **Weiter: Erweiterte Einstellungen**.
3. **Azure-Portal**: **Ziel-Ressourcengruppe, Ziel-VNet, Cache-Speicherkonto prüfen** → **Replikationsrichtlinie** (24 h, 4 h) → **Replikation starten**.
4. **Azure-Portal**: **vault-dr → Replizierte Elemente → VM01**: **Status „Geschützt“** **abwarten**.
5. **Azure-Portal**: **Testfailover → Neuester verarbeiteter Punkt → Test-VNet wählen → OK**.
6. **Azure-Portal**: **Test-VM prüfen** → **Testfailover bereinigen**.
7. **Azure-Portal**: **Wiederherstellungspläne → Wiederherstellungsplan erstellen → VMs gruppieren → Skript ergänzen**.

## Einfach

Deine Firma hat **ein Büro**. **Ein Feuer** **legt es lahm**. **Site Recovery** **ist** **wie ein zweites, fertig eingerichtetes Büro** **in einer anderen Stadt**: **Ständig** **wird kopiert**, **was im ersten passiert**. **Brennt das erste**, **schaltest du um** **und** **arbeitest im zweiten weiter**.

**Testfailover** = **Feueralarm-Übung**: **Alle gehen kurz ins zweite Büro**, **schauen**, **ob alles klappt**, **und gehen zurück** – **das Original** **arbeitet** **in der Zeit ungestört weiter**.

**Wiederherstellungsplan** = **Evakuierungsplan**: **Erst** **Strom** (**DC**), **dann Datenbank**, **dann Website**. **Reihenfolge** **zählt**.

**Backup** **dagegen** **ist ein Fotoalbum** **des Büros**: **Gut** **zum Nachbauen**, **aber** **du arbeitest** **erst wieder**, **wenn** **alles** **neu aufgebaut** **ist**.

## Merksatz
- **Backup = zurückholen**, **ASR = weiterlaufen**.
- **RPO = Datenverlust**, **RTO = Ausfallzeit**.
- **Testfailover = Übung**, **Produktion bleibt**.
- **Geplant = ohne Datenverlust**, **ungeplant = Notfall**.
- **Commit → Re-protect → Failback**.
- **Hyper-V-Intervalle**: **30 s / 5 min / 15 min**.
- **Wiederherstellungsplan = Reihenfolge + Skripte**.

## Prüfungsfalle
- **ASR** **ersetzt kein Backup** (**Ransomware wird mitrepliziert**).
- **Testfailover** **in isoliertes Netz**, **nicht ins Produktionsnetz**.
- **Testfailover** **danach bereinigen**, **sonst** **laufen** **Test-VMs** **weiter** **(Kosten)**.
- **Geplantes Failover** **gibt es nicht** **für Azure-zu-Azure** **(Azure-VMs)**.
- **Nach Failover** **Re-protect** **nicht vergessen**, **sonst** **kein Failback**.
- **Standard-Aufbewahrung** **24 Stunden**, **App-Snapshot** **alle 4 Stunden**.
- **IP-Adressen** **ändern** **sich** **eventuell** – **DNS/Netzwerkzuordnung** **planen**.
- **VMware/physisch** **braucht** **Replikationsapplikation**, **Hyper-V** **den ASR-Provider**.

## Grafik
### Zwei Büros
Zwei Gebäude in zwei Städten, ein Datenstrom zwischen ihnen. Feuersymbol im linken: Umschaltung nach rechts.

### Feueralarm-Übung
Menschen laufen ins zweite Büro und zurück, während das Original weiterarbeitet.

### Evakuierungsplan
Drei Stufen: DC, SQL, Web nacheinander.

## Befehle
- `Set-AzRecoveryServicesAsrVaultContext` – ASR-Tresorkontext
- `Get-AzRecoveryServicesAsrReplicationProtectedItem` – replizierte Elemente
- `Start-AzRecoveryServicesAsrTestFailoverJob` – Testfailover
- `Start-AzRecoveryServicesAsrUnplannedFailoverJob` – ungeplantes Failover
- `Start-AzRecoveryServicesAsrCommitFailoverJob` – Commit

## Karteikarten
- F: Wofür ist ASR gedacht? | A: Betrieb nach Ausfall an zweitem Ort weiterführen (Replikation und Failover).
- F: Was ist RPO? | A: Maximal tolerierbarer Datenverlust.
- F: Was ist RTO? | A: Maximal tolerierbare Ausfallzeit.
- F: Was macht ein Testfailover? | A: Startet Replikat im isolierten Netz, Produktion läuft weiter.
- F: Was gehört in einen Wiederherstellungsplan? | A: VM-Gruppen, Reihenfolge, Skripte und manuelle Aktionen.
- F: Welche Aufbewahrung ist Standard? | A: 24 Stunden.
- F: Wie oft App-konsistenter Snapshot bei Azure-zu-Azure? | A: Standardmäßig alle 4 Stunden.
- F: Was muss nach einem Failover für Failback erfolgen? | A: Re-protect (Replikation umkehren).
- F: Replikationsintervalle Hyper-V zu Azure? | A: 30 s, 5 min, 15 min.
- F: Was installiert man auf einem Hyper-V-Host für ASR? | A: ASR-Provider und Recovery Services Agent.
- F: Ersetzt ASR ein Backup? | A: Nein.

## Quiz
? Ein Notfallplan soll VMs in Reihenfolge starten: erst DC, dann SQL, dann Web. Lösung?
* Wiederherstellungsplan
- Backup-Richtlinie
- Cluster Sets
- DFS-N

? Man will die DR-Fähigkeit testen, ohne die Produktion zu stören. Was tut man?
* Testfailover in isoliertes Netz
- Ungeplantes Failover
- Commit
- Re-protect

? Welche Kennzahl beschreibt den tolerierbaren Datenverlust?
* RPO
- RTO
- SLA
- MTBF

? Nach einem Failover soll die Replikation zurück zum Ursprungsstandort laufen. Schritt?
* Re-protect
- Testfailover
- Cleanup
- Soft Delete

? Was braucht man für VMware-Replikation nach Azure?
* Replikationsapplikation und Mobilitätsdienst
- Nur den MARS-Agent
- Storage Replica
- DFS-R

? Welche Aussage stimmt zu Backup und ASR?
* ASR ersetzt kein Backup
- ASR ersetzt Backup vollständig
- Backup ist schneller als ASR im Failover
- Beide sind identisch

? Wofür steht RTO?
* Recovery Time Objective – maximal tolerierbare Ausfallzeit bis zur Wiederherstellung
- Recovery Transfer Option
- Remote Tunnel Object
- Replication Time Offset
! RPO beschreibt dagegen den maximal tolerierbaren Datenverlust.

? Welche Azure-Ressource verwaltet die Replikation mit Azure Site Recovery?
* Recovery Services-Tresor
- Application Gateway
- Azure Policy
- Azure DNS
! Dort werden Replikationsrichtlinien und Wiederherstellungspläne verwaltet.

