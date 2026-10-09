---
id: az801-hyperv-replica
bereich: AZ-801
block: A10
kapitel: Disaster Recovery
titel: Hyper-V Replica
stufe: Profi
quellen: [AZ-801 Study Guide, Microsoft Learn]
verweise: [az801-asr, az801-azure-backup, az801-failover-cluster, az801-stretch-cluster]
---

## Profi

### Idee
**Hyper-V Replica** **repliziert** **VMs** **asynchron** **von einem Hyper-V-Host** **auf einen anderen** (**Replikat-Server**), **ohne** **gemeinsamen Speicher** **und ohne Cluster**. **Es** **ist** **eine** **Hyper-V-Funktion** **(kostenlos)**, **keine** **Azure-Funktion**.

### Bausteine
| Baustein | Erklärung |
|---|---|
| **Primärserver** | **Host** **mit laufender VM** |
| **Replikatserver** | **Host** **mit** **Offline-Kopie** **(VM aus)** |
| **Replikationsintervall** | **30 Sekunden**, **5 Minuten** **oder** **15 Minuten** |
| **Wiederherstellungspunkte** | **Nur der neueste** **oder** **bis zu 24** **(stündlich, optional VSS-app-konsistent)** |
| **Authentifizierung** | **Kerberos (HTTP, Port 80)** **in derselben Gesamtstruktur** **oder** **Zertifikat (HTTPS, Port 443)** |
| **Erstreplikation** (*Initial Replication*) | **Über Netzwerk**, **externes Medium** **oder** **aus vorhandener VM** **auf dem Replikat** |
| **Erweiterte Replikation** (*Extended Replication*) | **Dritter Standort**: **Primär → Replikat → Erweitertes Replikat** (**Intervall 5 oder 15 min**) |
| **Hyper-V-Replikatbroker** | **Clusterrolle**, **nötig**, **wenn** **Primär oder Replikat** **ein Cluster** **ist** |

### Firewallregeln
- **„Hyper-V-Replikat – HTTP-Listener (TCP eingehend)“** (**Port 80**)
- **„Hyper-V-Replikat – HTTPS-Listener (TCP eingehend)“** (**Port 443**)
- **Auf dem Replikatserver** **aktivieren**.

### Failover-Arten
| Art | Ablauf | Datenverlust |
|---|---|---|
| **Testfailover** | **Temporäre Test-VM** **(„… – Test“)** **aus Replikat**, **Netz** **isoliert**, **Replikation** **läuft** **weiter** | **Keiner** |
| **Geplantes Failover** | **Primär-VM** **wird ausgeschaltet**, **letzte Änderungen** **gesendet**, **Replikat startet**, **Replikation** **wird umgekehrt** | **Keiner** |
| **Ungeplantes Failover** | **Primär** **ausgefallen**, **Replikat** **startet** **mit letztem Punkt** | **Bis zu RPO** |

### Nach dem Failover
- **Umgekehrte Replikation** (*Reverse Replication*): **Ursprünglicher Primär** **wird** **Replikat**.
- **Failback**: **Erneutes** **geplantes Failover** **zurück**.
- **Netzwerk**: **Bei anderem Subnetz** **IP-Einspeisung** **(Failover TCP/IP-Einstellungen)** **in VM-Netzwerkeigenschaften** **hinterlegen**.

### Wichtig zu wissen
- **Replikation** **ist** **pro VM** **einstellbar**, **einzelne Datenträger** **ausschließbar**.
- **Kein** **automatisches Failover** **– immer** **manuell** **oder** **per Skript**.
- **Es** **repliziert** **nur** **VM-Daten**, **keine** **Gastanwendungs-Replikation**.
- **Mit Storage Replica** **oder** **Stretch-Cluster** **kein** **Ersatz**, **weil** **asynchron** **und** **manuell**.

### PowerShell
```powershell
# Auf HV02 (Replikatserver) – Replikation erlauben, Kerberos/HTTP
Set-VMReplicationServer -ReplicationEnabled $true -AllowedAuthenticationType Kerberos -ReplicationAllowedFromAnyServer $false
New-VMReplicationAuthorizationEntry -AllowedPrimaryServer hv01.exa.local -ReplicaStorageLocation "D:\Replica" -TrustGroup Standort1
Enable-NetFirewallRule -DisplayName "Hyper-V-Replikat – HTTP-Listener (TCP eingehend)"

# Auf HV01 (Primärserver) – Replikation aktivieren
Enable-VMReplication -VMName VM01 -ReplicaServerName hv02.exa.local -ReplicaServerPort 80 -AuthenticationType Kerberos -ReplicationFrequencySec 300 -RecoveryHistory 6
Start-VMInitialReplication -VMName VM01

# Status
Get-VMReplication
Measure-VMReplication

# Testfailover – auf HV02
Start-VMFailover -VMName VM01 -AsTest
Stop-VMFailover -VMName VM01

# Geplantes Failover
# Auf HV01
Stop-VM -Name VM01
Start-VMFailover -VMName VM01 -Prepare
# Auf HV02
Start-VMFailover -VMName VM01
Set-VMReplication -VMName VM01 -Reverse
Start-VM -Name VM01

# Ungeplantes Failover – auf HV02
Start-VMFailover -VMName VM01
Complete-VMFailover -VMName VM01   # Punkt bestätigen
```

## Lab
**Maschinen**: **HV01** (**Primär**), **HV02** (**Replikat**), **DC01**, **VM01** **auf HV01**.

### GUI
1. **HV02**: **Hyper-V-Manager → Hyper-V-Einstellungen → Replikationskonfiguration** → **„Diesen Computer als Replikatserver aktivieren“** → **Kerberos (HTTP 80)** → **„Replikation von beliebigem authentifizierten Server zulassen“** **oder** **Server hv01 eintragen** **+ Speicherort D:\Replica**.
2. **HV02**: **Windows-Firewall → Regel „Hyper-V-Replikat – HTTP-Listener (TCP eingehend)“** **aktivieren**.
3. **HV01**: **VM01 → Rechtsklick → Replikation aktivieren** → **Replikatserver hv02** → **Kerberos** → **Datenträger wählen** → **Häufigkeit 5 Minuten** → **Zusätzliche Wiederherstellungspunkte** **(z. B. 6)** → **Erstreplikation sofort senden** → **Fertig stellen**.
4. **HV01**: **VM01 → Replikation → Replikationsintegrität anzeigen** (**Status „Normal“**).
5. **HV02**: **VM01 → Replikation → Testfailover** → **Punkt wählen** → **Test-VM starten**, **prüfen** → **Testfailover beenden**.
6. **HV01**: **VM01 ausschalten** → **Replikation → Geplantes Failover** → **„Nach dem Failover Replikation umkehren“ + „Replikat-VM nach Failover starten“ aktivieren** → **Failover**.

## Einfach

**Hyper-V Replica** ist **wie eine Zwillings-Wohnung in einer anderen Straße**: **Alle paar Minuten** **schickt** **ein Bote** **Änderungen** **von deiner Wohnung** **in die Zwillingswohnung** (**die steht leer**, **also VM aus**).

**Brennt die erste Wohnung**, **schließt du die Zwillingswohnung auf** – **du hast** **den Stand** **von vor ein paar Minuten** (**Datenverlust bis zum letzten Boten**).

**Geplantes Failover** = **du ziehst absichtlich um**: **Du sagst dem Boten**: **„Warte, ich packe noch die letzten Sachen ein“**, **dann** **ziehst du um** **– nichts geht verloren**.

**Testfailover** = **du schließt die Zwillingswohnung** **kurz auf und schaust**, **ob alles da ist** – **ohne** **wirklich umzuziehen**.

## Merksatz
- **Replica = asynchron**, **kein Shared Storage**, **Server 2012+**.
- **Intervalle**: **30 s / 5 min / 15 min**.
- **Kerberos = HTTP 80**, **Zertifikat = HTTPS 443**.
- **Bis 24 Punkte**, **stündlich**.
- **Cluster = Replikatbroker** **nötig**.
- **Geplant = ohne Datenverlust**, **ungeplant = mit**.
- **Extended = dritter Standort**.

## Prüfungsfalle
- **Kein automatisches Failover** – **Cluster/Stretch** **wäre** **automatisch**.
- **Replikat-VM** **ist aus** **(Offline)**.
- **Zertifikat** **nötig**, **wenn** **Server** **nicht in derselben Gesamtstruktur/Vertrauensstellung**.
- **Auf dem Replikatserver** **Firewallregel** **aktivieren**.
- **Replikatbroker** **vergessen** **bei Cluster**.
- **Geplantes Failover** **erfordert** **ausgeschaltete Primär-VM**.
- **Extended Replication**: **Intervall** **nur 5 oder 15 min**, **nicht 30 s**.
- **Hyper-V Replica** **≠ Live Migration** **(kein unterbrechungsfreier Wechsel)**.

## Grafik
### Zwillings-Wohnung
Zwei Häuser, ein Bote läuft alle 5 Minuten mit Paketen von links nach rechts.

### Failover-Wege
Drei Pfeile: Test (kurzer Besuch), geplant (Umzug mit Übergabe), ungeplant (Notumzug).

### Dritter Standort
Kette Haus A → Haus B → Haus C, jeweils mit Boten.

## Befehle
- `Set-VMReplicationServer` – Replikatserver konfigurieren
- `New-VMReplicationAuthorizationEntry` – erlaubte Primärserver
- `Enable-VMReplication` – Replikation für VM aktivieren
- `Start-VMInitialReplication` – Erstreplikation
- `Measure-VMReplication` – Integrität/Statistik
- `Start-VMFailover -AsTest` – Testfailover
- `Set-VMReplication -Reverse` – Replikation umkehren

## Karteikarten
- F: Was ist Hyper-V Replica? | A: Asynchrone VM-Replikation zwischen zwei Hyper-V-Hosts ohne Shared Storage.
- F: Replikationsintervalle? | A: 30 Sekunden, 5 Minuten, 15 Minuten.
- F: Wie viele Wiederherstellungspunkte maximal? | A: 24.
- F: Welche Ports? | A: 80 (Kerberos/HTTP) und 443 (Zertifikat/HTTPS).
- F: Wann braucht man den Replikatbroker? | A: Wenn Primär- oder Replikatserver ein Cluster ist.
- F: Welches Failover hat keinen Datenverlust? | A: Geplantes Failover.
- F: Was ist Extended Replication? | A: Dritter Standort hinter dem Replikat.
- F: Wie startet man einen Test? | A: Start-VMFailover -AsTest.
- F: Ist das Failover automatisch? | A: Nein, manuell oder per Skript.
- F: Welche Firewallregel auf dem Replikatserver? | A: Hyper-V-Replikat HTTP- oder HTTPS-Listener.
- F: Wie kehrt man die Replikation um? | A: Set-VMReplication -Reverse.

## Quiz
? Zwei Hyper-V-Hosts ohne Cluster sollen VMs für den Notfall replizieren. Lösung?
* Hyper-V Replica
- Live Migration
- Cluster Sets
- DFS-R

? Ein Cluster ist Replikatziel. Was ist zusätzlich nötig?
* Hyper-V-Replikatbroker
- BranchCache
- Azure Arc
- AD RMS

? Welches Failover verhindert Datenverlust bei geplanter Wartung?
* Geplantes Failover
- Ungeplantes Failover
- Testfailover
- Kein Failover

? Welches Replikationsintervall gibt es nicht?
* 1 Minute
- 30 Sekunden
- 5 Minuten
- 15 Minuten

? Server stehen in getrennten Gesamtstrukturen ohne Vertrauensstellung. Welche Authentifizierung?
* Zertifikat (HTTPS)
- Kerberos
- NTLM
- Anonym

? Was passiert bei Start-VMFailover -AsTest?
* Test-VM aus dem Replikat, Replikation läuft weiter
- Die Primär-VM wird gelöscht
- Der Cluster wird umgestellt
- Die Replikation stoppt endgültig
