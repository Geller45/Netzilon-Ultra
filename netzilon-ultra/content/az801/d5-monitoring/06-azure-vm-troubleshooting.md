---
id: az801-azure-vm-troubleshooting
bereich: AZ-801
block: A10
kapitel: Monitoring und Troubleshooting
titel: Azure-VM-Troubleshooting
stufe: Profi
quellen: [AZ-801 Study Guide, Microsoft Learn]
verweise: [az801-netzwerk-troubleshooting, az800-azure-vms, az801-azure-disk-encryption]
---

## Profi

### Diagnosewerkzeuge
| Werkzeug | Zweck |
|---|---|
| **Startdiagnose** (*Boot Diagnostics*) | **Screenshot** **und** **Seriellprotokoll** **des Starts** |
| **Serielle Konsole** (*Serial Console*) | **Textzugang** **auch ohne Netzwerk** **(braucht Startdiagnose)** |
| **Ausführungsbefehl** (*Run Command*) | **Skript** **in der VM** **ohne RDP** |
| **Ressourcenintegrität** (*Resource Health*) | **Azure-seitige Probleme** |
| **Aktivitätsprotokoll** (*Activity Log*) | **Wer** **hat** **was** **geändert** |
| **Netzwerk-Watcher** (*Network Watcher*) | **Netzwerkdiagnose** |
| **Azure Bastion** | **RDP/SSH** **über Portal** **(ohne öffentliche IP)** |
| **Metriken/Diagnose-Erweiterung** | **CPU, RAM, Datenträger** |

### Network Watcher
| Funktion | Zeigt |
|---|---|
| **IP-Datenflussüberprüfung** (*IP flow verify*) | **Erlaubt/blockiert** **durch NSG-Regel** |
| **Nächster Hop** (*Next hop*) | **Routing-Ziel** **(Route-Tabelle)** |
| **Wirksame Sicherheitsregeln** | **Alle** **NSG-Regeln** **zusammen** |
| **Verbindungsproblembehandlung** (*Connection troubleshoot*) | **Erreichbarkeit** **A → B** |
| **Paketerfassung** (*Packet capture*) | **Pakete** **auf VM** |
| **NSG-Flow-Protokolle** | **Verkehr** **protokolliert** |
| **Topologie** | **Netzabbild** |

### Typische Probleme und Lösung
| Problem | Ursache / Lösung |
|---|---|
| **RDP geht nicht** | **NSG-Regel 3389**, **VM-Firewall**, **RDP-Dienst**, **öffentliche IP** → **„Kennwort zurücksetzen → RDP-Konfiguration zurücksetzen“** |
| **Kennwort vergessen** | **„Kennwort zurücksetzen“** **(VMAccess-Erweiterung)** |
| **VM startet nicht** | **Startdiagnose**, **Serielle Konsole**, **beschädigter Datenträger** |
| **Falsche Größe** | **VM-Größe ändern** **(Neustart)** |
| **VM antwortet nicht** | **Redeploy** **(anderer Host)**, **Neustart** |
| **Allokationsfehler** | **Größe/Region** **wechseln**, **Beenden/Freigeben** **und Starten** |
| **Gastagent** **fehlerhaft** | **Windows-Azure-Gastagent** **neu installieren** |
| **Erweiterung** **fehlgeschlagen** | **Erweiterungsstatus prüfen**, **erneut ausführen** |
| **Datenträger voll** | **Datenträger vergrößern**, **im OS** **erweitern** |
| **Kein Internet** | **NSG/UDR/NAT-Gateway** **prüfen** |
| **DNS-Fehler** | **VNet-DNS-Einstellungen** |

### Reparatur einer nicht startenden VM
**Azure VM Repair** **(az vm repair)**:
1. **Datenträger** **der defekten VM** **kopieren**.
2. **Reparatur-VM** **erstellen** **und Datenträger** **anhängen**.
3. **Reparieren** **(Dateien, Registry, Bootkonfiguration)**.
4. **Datenträger** **zurück-tauschen**.

### Redeploy und Reapply
- **Redeploy**: **VM** **auf neuen Host** **verschieben** **(Neustart, IP** **statisch** **bleibt**, **temporärer Datenträger** **geht verloren**).
- **Reapply**: **VM-Konfiguration** **neu** **anwenden** **(bei Provisioning-Fehlern)**.

### Sicherheitsaspekte
- **RDP-Port 3389** **nie** **offen** **ins Internet**: **Bastion**, **JIT-VM-Zugriff** **(Defender for Cloud)**, **VPN**.
- **Verschlüsselte Datenträger** **(ADE)**: **Reparatur** **braucht** **Schlüsselzugriff** **(Key Vault)**.

### PowerShell
```powershell
# Auf Admin-PC
Get-AzVM -ResourceGroupName rg-prod -Name VM01 -Status
Set-AzVMBootDiagnostic -ResourceGroupName rg-prod -VM (Get-AzVM -ResourceGroupName rg-prod -Name VM01) -Enable
Invoke-AzVMRunCommand -ResourceGroupName rg-prod -VMName VM01 -CommandId RunPowerShellScript -ScriptString "Get-Service TermService; Test-NetConnection localhost -Port 3389"

# Kennwort/RDP zurücksetzen (VMAccess)
Set-AzVMAccessExtension -ResourceGroupName rg-prod -VMName VM01 -Name VMAccess -Location westeurope -UserName localadmin -Password (ConvertTo-SecureString "Neu!Pass2026#" -AsPlainText -Force)

# Redeploy
Set-AzVM -Redeploy -ResourceGroupName rg-prod -Name VM01

# Netzwerk prüfen
$nw = Get-AzNetworkWatcher -Location westeurope
Test-AzNetworkWatcherIPFlow -NetworkWatcher $nw -TargetVirtualMachineId (Get-AzVM -Name VM01 -ResourceGroupName rg-prod).Id -Direction Inbound -Protocol TCP -LocalIPAddress 10.0.1.4 -LocalPort 3389 -RemoteIPAddress 203.0.113.10 -RemotePort 50000
```

## Lab
**Maschinen**: **Azure-Abo**, **VM01** (**öffentliche IP**), **Admin-PC**.

### GUI
1. **Azure-Portal**: **VM01 → Hilfe → Startdiagnose → Screenshot** **prüfen**.
2. **Azure-Portal**: **VM01 → Netzwerk** **→ Eingangsregeln** **prüfen** **(3389)**.
3. **Azure-Portal**: **Network Watcher → IP-Datenflussüberprüfung** → **VM01, Richtung eingehend, TCP, Port 3389**.
4. **Azure-Portal**: **VM01 → Hilfe → Kennwort zurücksetzen** → **„Nur RDP-Konfiguration zurücksetzen“**.
5. **Azure-Portal**: **VM01 → Ausführungsbefehl → RunPowerShellScript** → `Get-Service TermService`.
6. **Azure-Portal**: **VM01 → Hilfe → Serielle Konsole**.
7. **Azure-Portal**: **VM01 → Hilfe → Erneut bereitstellen** **(Redeploy)**.

## Einfach

**Eine Azure-VM** **ist ein Computer**, **den** **du** **nicht anfassen** **kannst**. **Wenn** **er** **nicht** **antwortet**, **brauchst du** **Ersatzaugen**:
- **Startdiagnose** **= ein Foto vom Bildschirm**.
- **Serielle Konsole** **= ein** **Telefonkabel** **direkt an den Rechner**, **auch wenn** **das Internet** **kaputt ist**.
- **Run Command** **= du** **schickst** **einen Zettel** **mit einer Aufgabe** **hinein**.
- **Network Watcher** **= ein Verkehrsbeobachter**, **der** **sagt**, **welche Ampel** **(NSG-Regel)** **dich stoppt**.
- **Redeploy** **= die VM** **wird in ein anderes Haus** **gestellt**.

## Merksatz
- **Startdiagnose = Screenshot**.
- **Serielle Konsole = ohne Netz**.
- **Run Command = ohne RDP**.
- **IP-Flow-Verify = NSG-Frage**.
- **Next Hop = Routing-Frage**.
- **Redeploy = neuer Host**.
- **RDP nie offen ins Internet**.

## Prüfungsfalle
- **Serielle Konsole** **braucht** **Startdiagnose**.
- **Redeploy** **löscht** **temporären Datenträger**.
- **NSG** **am Subnetz** **und** **an** **der NIC** **wirken** **beide**.
- **IP-Flow-Verify** **prüft** **NSG**, **nicht** **die Windows-Firewall**.
- **Bei ADE-Datenträgern** **Key-Vault-Zugriff** **beachten**.
- **VM-Größe ändern** **=** **Neustart**.
- **„Beendet“** **≠** **„Freigegeben“** **(Kosten laufen bei „Beendet“ weiter)**.

## Grafik
### Ersatzaugen
VM in Wolke, fünf Werkzeuge als Augen, Ohren und Telefon.

### Ampel
NSG-Regeln als Ampeln vor VM, IP-Flow-Verify zeigt die rote.

### Reparatur
Defekter Datenträger wird an Werkstatt-VM angehängt, repariert, zurückgesteckt.

## Karteikarten
- F: Was zeigt die Startdiagnose? | A: Screenshot und Seriellprotokoll des Starts.
- F: Was braucht die Serielle Konsole? | A: Aktivierte Startdiagnose.
- F: Wofür Run Command? | A: Skript in der VM ausführen ohne Netzwerkzugriff per RDP.
- F: Welche Network-Watcher-Funktion zeigt NSG-Blockade? | A: IP-Datenflussüberprüfung.
- F: Was zeigt Next Hop? | A: Nächstes Routingziel gemäß Routentabelle.
- F: Was ist Redeploy? | A: Verschiebt die VM auf einen anderen Host.
- F: Wie setzt man ein vergessenes Kennwort zurück? | A: Über die VMAccess-Erweiterung im Portal.
- F: Wie greift man sicher auf RDP zu? | A: Über Azure Bastion, JIT oder VPN.
- F: Was macht az vm repair? | A: Erstellt Reparatur-VM mit angehängtem Datenträger.

## Quiz
? Eine VM ist per RDP nicht erreichbar. Was prüft man zuerst im Portal?
* NSG-Regel für 3389 und IP-Datenflussüberprüfung
- Log Analytics Aufbewahrung
- Recovery Services Vault
- Azure File Sync

? Wie greift man ohne Netzwerkverbindung auf die VM zu?
* Serielle Konsole
- RDP
- SSH über Internet
- Bastion

? Welche Funktion zeigt das Routingproblem?
* Nächster Hop
- IP-Flow-Verify
- Startdiagnose
- Resource Health

? Ein Skript soll ohne RDP in der VM laufen. Lösung?
* Ausführungsbefehl
- Redeploy
- Snapshot
- Cluster

? Was passiert mit dem temporären Datenträger bei Redeploy?
* Er geht verloren
- Er wird verschlüsselt
- Er wird gesichert
- Er bleibt erhalten

? Wozu dient Azure Bastion?
* RDP/SSH über das Portal ohne öffentliche IP
- Backup
- Replikation
- Kennwortsynchronisation
