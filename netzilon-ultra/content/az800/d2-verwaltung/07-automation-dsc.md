---
id: az800-automation-dsc
bereich: AZ-800
block: A7
kapitel: Hybrid-Verwaltung
titel: Azure Automation – Runbooks, Hybrid Runbook Worker & DSC
stufe: Profi
quellen: [AZ-800 Study Guide, Microsoft Learn]
verweise: [az800-azure-arc, az800-update-monitoring, ap1-a6-powershell, az800-jea]
---

## Profi

### Azure Automation
Cloud-Dienst zur **Automatisierung** wiederkehrender Aufgaben in Azure und on-prem. Zentrales Objekt: das **Automation-Konto** (Automation Account) mit:
- **Runbooks** (Skripte), **Zeitpläne**, **Webhooks** (Auslösen per HTTP-POST, z. B. aus einer Warnung/Aktionsgruppe),
- **freigegebenen Ressourcen**: **Anmeldeinformationen** (Credentials), **Variablen** (auch verschlüsselt), **Zertifikate**, **Verbindungen**, **Module** (PowerShell-Galerie importieren),
- **verwalteter Identität** (system-/benutzerseitig) zur Anmeldung an Azure (`Connect-AzAccount -Identity`) – ersetzt die alten **Run-As-Konten** (eingestellt).
Weitere Bausteine (teils Legacy): **Change Tracking & Inventory**, **Update Management** (→ Azure Update Manager), **State Configuration (DSC)**.

### Runbook-Typen
| Typ | Beschreibung |
|---|---|
| **PowerShell** (5.1, 7.2/7.4) | Standard; Module müssen im Konto/Runtime-Umgebung vorhanden sein |
| **PowerShell-Workflow** | Checkpoints, Parallelität – **veraltet** |
| **Grafisch** / grafischer PowerShell-Workflow | Drag&Drop im Portal |
| **Python** (3.x) | Python-Skripte |
Lebenszyklus: **Entwurf** → Testbereich → **Veröffentlichen** → Starten (manuell, Zeitplan, Webhook, Aktionsgruppe, Logic App) → **Aufträge (Jobs)** mit Ausgabe/Protokollen. Quellcodeverwaltung per **GitHub/Azure DevOps**-Integration.

### Wo läuft ein Runbook?
| Ausführung | Merkmale |
|---|---|
| **Azure-Sandbox** (Standard) | in Azure, Zugriff nur auf Azure/öffentliche Ziele, Limits (z. B. **3 Stunden** Fair-Share, Speicher) |
| **Hybrid Runbook Worker** | auf **eigenem Server** (on-prem, andere Cloud oder Azure-VM), Mitglied einer **Hybrid-Worker-Gruppe** → Zugriff auf **lokale Ressourcen** (AD, Dateiserver, Datenbanken), keine Zeitlimits |
**Hybrid Runbook Worker**: heute **erweiterungsbasiert** (VM-Erweiterung bzw. **Arc**-Erweiterung) – der alte agentenbasierte Worker (über Log Analytics Agent) wurde eingestellt. Kommunikation ausgehend 443. Ausführungskonto: standardmäßig **LocalSystem** oder ein festgelegtes **Credential** („Hybrid Worker Credentials“) für Domänenzugriff. Beim Start eines Runbooks die **Hybrid-Worker-Gruppe** als Ziel wählen.

Typische Beispiele: nachts VMs starten/stoppen (Kosten), AD-Benutzer aus einer CSV/HR-System anlegen (Hybrid Worker), alte Dateien bereinigen, Berichte per Mail, Selbstheilung bei Warnungen (Dienst neu starten per Webhook).

### Desired State Configuration (DSC)
**PowerShell DSC** ist eine **deklarative** Konfigurationssprache: Man beschreibt den **Sollzustand** („Rolle Webserver installiert, Ordner C:\Web existiert, Dienst läuft“), nicht die Schritte. Der **Local Configuration Manager (LCM)** auf dem Knoten setzt ihn um und prüft regelmäßig.
```powershell
Configuration Webserver {
  Import-DscResource -ModuleName PSDesiredStateConfiguration
  Node 'SRV01' {
    WindowsFeature IIS { Name = 'Web-Server'; Ensure = 'Present' }
    File Webordner { DestinationPath = 'C:\Web'; Type = 'Directory'; Ensure = 'Present' }
    Service W3SVC { Name = 'W3SVC'; State = 'Running'; DependsOn = '[WindowsFeature]IIS' }
  }
}
Webserver -OutputPath C:\DSC      # erzeugt SRV01.mof
Start-DscConfiguration -Path C:\DSC -Wait -Verbose
Test-DscConfiguration -Detailed
```
- **Push**: Konfiguration aktiv an Knoten senden (`Start-DscConfiguration`).
- **Pull**: Knoten holen Konfiguration von einem **Pull-Server** – z. B. **Azure Automation State Configuration**.
- **LCM-Modi** (`ConfigurationMode`): **ApplyOnly**, **ApplyAndMonitor** (nur melden), **ApplyAndAutoCorrect** (Abweichungen automatisch korrigieren – „Drift“ verhindern).
- **Azure Automation State Configuration**: Konfigurationen hochladen und **kompilieren**, Knoten (Azure-VMs per Erweiterung, on-prem per **Meta-Konfiguration**) registrieren, **Compliance-Bericht** pro Knoten. **Wird eingestellt** (Ende des Supports **30.09.2027**) – Nachfolger ist **Azure Machine Configuration** (Azure Policy, siehe Arc-Seite), die DSC-Pakete verwendet.
- Für Gruppenrichtlinien-lose Umgebungen (Workgroup, DMZ, Linux) besonders nützlich; DSC-Ressource **JeaEndpoint** verteilt JEA.

### Abgrenzung
| Werkzeug | Stärke |
|---|---|
| GPO | Domänencomputer, Benutzer-/Computereinstellungen |
| DSC / Machine Configuration | Sollzustand von Servern inkl. Nicht-Domäne, Drift-Korrektur, Compliance-Berichte |
| Runbooks | Abläufe/Aufgaben (einmalig, zeitgesteuert, ereignisgesteuert) |
| Azure Update Manager | Patching |

## Lab
**Voraussetzung**: Azure-Abonnement; SRV01 als Arc-Server (Domänenmitglied).

### GUI
1. **Portal** → **Automation-Konten** → Erstellen `aa-hybrid` → Identität: **Systemseitig zugewiesen** → Erstellen.
2. Automation-Konto → **Identität** → **Azure-Rollenzuweisungen** → **Mitwirkender für virtuelle Computer** auf `rg-hybrid`.
3. **Runbooks** → Runbook erstellen `Stop-TestVMs` → Typ PowerShell, Runtime 7.2 → Code (siehe unten) → **Testbereich** → **Veröffentlichen** → **Zeitplan verknüpfen**: täglich 20:00.
4. **Hybrid-Worker-Gruppen** → Erstellen `hwg-onprem` → Computer hinzufügen: **SRV01** (Arc) → Erweiterung wird installiert → **Hybrid-Worker-Anmeldeinformationen**: Credential `svc-automation` (Domänenkonto mit Rechten in einer OU) unter **Freigegebene Ressourcen → Anmeldeinformationen** anlegen und der Gruppe zuweisen.
5. Runbook `New-ADUserFromCsv` erstellen → **Starten** → **Ausführen auf: Hybrid Worker** → `hwg-onprem` → Auftrag → Ausgabe prüfen → Benutzer in AD vorhanden.
6. **Webhook**: Runbook → Webhooks → Hinzufügen → URL **sofort kopieren** (nur einmal sichtbar) → Ablaufdatum.
7. **DSC lokal**: auf SRV02 Konfiguration „Webserver“ (oben) kompilieren und per Push anwenden → IIS manuell stoppen → mit LCM-Modus ApplyAndAutoCorrect startet er nach dem nächsten Prüflauf (Standard 15 Min.) wieder.

### PowerShell-Runbooks und Befehle
```powershell
# Runbook Stop-TestVMs (Azure-Sandbox, verwaltete Identität)
Connect-AzAccount -Identity | Out-Null
Get-AzVM -ResourceGroupName rg-hybrid -Status |
  Where-Object { $_.Tags['Umgebung'] -eq 'Test' -and $_.PowerState -eq 'VM running' } |
  ForEach-Object { Stop-AzVM -Name $_.Name -ResourceGroupName $_.ResourceGroupName -Force -NoWait }

# Runbook New-ADUserFromCsv (Hybrid Worker, läuft on-prem)
param([string]$CsvPfad = "\\SRV01\HR\neu.csv")
Import-Csv $CsvPfad -Delimiter ';' | ForEach-Object {
  New-ADUser -Name "$($_.Vorname) $($_.Nachname)" -SamAccountName $_.Login -Path "OU=Benutzer,OU=Schulung,DC=contoso,DC=local" `
    -AccountPassword (ConvertTo-SecureString $_.Startkennwort -AsPlainText -Force) -Enabled $true -ChangePasswordAtLogon $true
  Write-Output "Angelegt: $($_.Login)"
}

# Runbook per Webhook auslösen (von irgendwo)
Invoke-RestMethod -Method Post -Uri "<Webhook-URL>" -Body (@{ CsvPfad = "\\SRV01\HR\neu.csv" } | ConvertTo-Json)

# Automation per Az-PowerShell
Start-AzAutomationRunbook -AutomationAccountName aa-hybrid -ResourceGroupName rg-hybrid -Name New-ADUserFromCsv -RunOn hwg-onprem
Get-AzAutomationJob -AutomationAccountName aa-hybrid -ResourceGroupName rg-hybrid | Select-Object -First 5

# LCM auf automatische Korrektur einstellen (auf SRV02)
[DscLocalConfigurationManager()]
Configuration LCM { Node 'localhost' { Settings { ConfigurationMode = 'ApplyAndAutoCorrect'; ConfigurationModeFrequencyMins = 15 } } }
LCM -OutputPath C:\DSC\LCM; Set-DscLocalConfigurationManager -Path C:\DSC\LCM -Verbose
Get-DscLocalConfigurationManager | Select-Object ConfigurationMode, RefreshMode
```

## Einfach

**Azure Automation** ist ein **Roboter-Butler in der Cloud**, der Aufgaben für dich erledigt – pünktlich und ohne zu vergessen.
- Ein **Runbook** ist die **Aufgabenkarte** für den Butler: „Jeden Abend um 20 Uhr alle Test-Server ausschalten (spart Geld).“
- **Zeitplan** = wann, **Webhook** = eine **Klingel**, mit der andere Programme den Butler rufen können („Alarm! Dienst ausgefallen – bitte neu starten“).
- Normalerweise arbeitet der Butler **in der Cloud** und kommt nicht in dein Firmengebäude. Soll er etwas **im Gebäude** tun (z. B. neue Mitarbeiter im Active Directory anlegen), schickst du ihn zu einem **Helfer vor Ort**: dem **Hybrid Runbook Worker** – einem Server im eigenen Netz, der die Aufgaben ausführt.

**DSC (Desired State Configuration)** ist anders: Das ist kein Aufgabenzettel, sondern ein **Soll-Foto**. „So soll der Server aussehen: Webserver installiert, Ordner C:\Web da, Dienst läuft.“ Ein Aufpasser auf dem Server (**LCM**) vergleicht regelmäßig: Stimmt alles mit dem Foto? Wenn jemand den Webserver ausschaltet, **stellt er ihn automatisch wieder her** (AutoCorrect). Das nennt man „Drift verhindern“.
Die Cloud-Variante (State Configuration) wird bald abgelöst – der Nachfolger ist **Machine Configuration** (über Azure Policy).

## Merksatz
- **Automation-Konto** + **Runbooks** + **verwaltete Identität** (Run-As-Konten sind Geschichte).
- On-prem-Zugriff → **Hybrid Runbook Worker** (erweiterungsbasiert, z. B. über Arc).
- **DSC = deklarativer Sollzustand**, **LCM** setzt um; Modus **ApplyAndAutoCorrect** gegen Drift.
- **Push** (Start-DscConfiguration) vs. **Pull** (Pull-Server/State Configuration).
- State Configuration → Nachfolger **Machine Configuration**.

## Prüfungsfalle
- Runbooks in der Azure-Sandbox erreichen keine on-prem-Ressourcen.
- Webhook-URL ist nur beim Erstellen sichtbar.
- Agentenbasierter Hybrid Worker (über MMA) ist eingestellt → Erweiterung verwenden.
- DSC beschreibt das **Was**, nicht das **Wie**.
- ApplyAndMonitor meldet nur, ApplyAndAutoCorrect korrigiert.

## Grafik
### Roboter-Butler
Butler in der Wolke mit Aufgabenkarten (Runbooks), Uhr (Zeitplan) und Klingel (Webhook); für die Aufgabe „AD-Benutzer anlegen“ läuft er zu einem Helfer-Server im Firmengebäude (Hybrid Worker).

### Soll-Foto (DSC)
Server neben einem Foto des Sollzustands; jemand schaltet den Webserver-Dienst aus → Aufpasser (LCM) vergleicht, bemerkt Abweichung und stellt den Zustand wieder her (Uhr 15 Min.).

## Karteikarten
- F: Was ist ein Runbook? | A: Skript (PowerShell/Python/grafisch) in Azure Automation, manuell, zeitgesteuert oder per Webhook ausgeführt.
- F: Womit meldet sich ein Runbook heute an Azure an? | A: Mit der verwalteten Identität des Automation-Kontos (Connect-AzAccount -Identity).
- F: Wozu dient ein Hybrid Runbook Worker? | A: Runbooks auf eigenen Servern ausführen, um lokale Ressourcen zu erreichen.
- F: Wie wird ein Hybrid Worker heute bereitgestellt? | A: Erweiterungsbasiert (VM-/Arc-Erweiterung) in einer Hybrid-Worker-Gruppe.
- F: Was ist ein Webhook in Azure Automation? | A: HTTP-URL, über die ein Runbook von außen gestartet werden kann.
- F: Was ist DSC? | A: Desired State Configuration – deklarative Beschreibung des Sollzustands, umgesetzt vom LCM.
- F: Drei LCM-Konfigurationsmodi? | A: ApplyOnly, ApplyAndMonitor, ApplyAndAutoCorrect.
- F: Unterschied Push und Pull bei DSC? | A: Push: Konfiguration wird aktiv gesendet. Pull: Knoten holen sie von einem Pull-Server.
- F: Nachfolger von Azure Automation State Configuration? | A: Azure Machine Configuration (Azure Policy).

## Quiz
? Ein Runbook soll nachts neue Benutzer im lokalen Active Directory anlegen. Wo muss es laufen?
* Auf einem Hybrid Runbook Worker im lokalen Netz
- In der Azure-Sandbox
- In Entra Domain Services
- Auf dem DNS-Server von Azure

? Welcher LCM-Modus korrigiert Konfigurationsabweichungen automatisch?
* ApplyAndAutoCorrect
- ApplyAndMonitor
- ApplyOnly
- MonitorOnly

? Wie authentifiziert sich ein Runbook heute sicher an Azure?
* Über die verwaltete Identität des Automation-Kontos
- Über ein Run-As-Konto mit Zertifikat
- Mit dem Kennwort des globalen Administrators im Code
- Gar nicht

? Wie kann eine Azure-Monitor-Warnung automatisch ein Runbook starten?
* Über eine Aktionsgruppe mit Webhook/Runbook-Aktion
- Über dcgpofix
- Über einen Forest-Trust
- Über DHCP-Optionen

? Was beschreibt eine DSC-Konfiguration?
* Den gewünschten Endzustand eines Systems
- Die Reihenfolge von Mausklicks
- Nur die Firewall eines Routers
- Die Kosten einer VM
