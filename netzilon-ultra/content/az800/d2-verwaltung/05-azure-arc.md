---
id: az800-azure-arc
bereich: AZ-800
block: A7
kapitel: Hybrid-Verwaltung
titel: Azure Arc & Azure Policy Machine Configuration
stufe: Profi
quellen: [AZ-800 Study Guide, Microsoft Learn]
verweise: [az800-wac, az800-update-monitoring, az800-automation-dsc, az801-log-analytics]
---

## Profi

### Was ist Azure Arc?
**Azure Arc** erweitert die **Azure-Verwaltungsebene (Azure Resource Manager)** auf Ressourcen **außerhalb** von Azure: on-prem-Server, Server in anderen Clouds (AWS, GCP), Kubernetes-Cluster, SQL Server, VMware/SCVMM-VMs. Ein **Arc-fähiger Server** erscheint im Azure-Portal als Ressource vom Typ **Microsoft.HybridCompute/machines** – mit Ressourcengruppe, **Tags**, **RBAC**, **Azure Policy**, **Aktivitätsprotokoll** und einer **systemseitig zugewiesenen verwalteten Identität** (Entra ID).
Der Server selbst läuft weiter dort, wo er steht – Arc ist eine **Verwaltungsprojektion**, keine Migration.

### Connected Machine Agent (azcmagent)
- Wird auf dem Server installiert (Windows Server 2012 R2+ bzw. unterstützte Linux-Distributionen).
- Komponenten: **Hybrid Instance Metadata Service (HIMDS)** (verwaltete Identität), **Guest Configuration Agent** (Richtlinien im Gast), **Extension Manager** (Erweiterungen).
- Kommunikation **nur ausgehend über HTTPS (TCP 443)** zu Azure – optional über Proxy oder **Private Link**; keine eingehenden Ports.
- Befehle: `azcmagent connect`, `azcmagent show`, `azcmagent check`, `azcmagent disconnect`, `azcmagent config`.

### Onboarding-Methoden
| Methode | Einsatz |
|---|---|
| **Portal-Skript** (einzelner Server, interaktive Anmeldung) | Test, wenige Server |
| **Dienstprinzipal** (Service Principal mit Rolle **Azure Connected Machine Onboarding**) + Skript | **viele Server** – Skript per GPO/Konfigurationsmanager/Ansible verteilen |
| **Windows Admin Center** (Azure-Hybriddienste → Azure Arc) | aus WAC heraus |
| **Gruppenrichtlinie** (Microsoft-Vorlage: geplante Aufgabe installiert Agent) | Domänenserver massenhaft |
| **Configuration Manager**, **Update Management**-Integration, VMware vCenter-/SCVMM-Integration | Enterprise |
Rollen: **Azure Connected Machine Onboarding** (nur hinzufügen), **Azure Connected Machine Resource Administrator** (verwalten). Vorher Ressourcenanbieter registrieren: `Microsoft.HybridCompute`, `Microsoft.GuestConfiguration`, `Microsoft.HybridConnectivity`, `Microsoft.AzureArcData`.

### Was kann man dann damit? (Auswahl)
- **Azure Policy / Machine Configuration** (Gastkonfiguration, früher Guest Configuration): Einstellungen **im Betriebssystem** prüfen (Audit) und – mit **AuditAndSet/ApplyAndMonitor** – durchsetzen (z. B. Kennwortrichtlinie, Zeitzone, installierte Software, Sicherheitsbaseline).
- **Azure Update Manager**: Updatestatus, Wartungsfenster, Patchbereitstellung (auch für on-prem).
- **Azure Monitor / VM Insights / Log Analytics** über den **Azure Monitor Agent (AMA)** + **Datensammlungsregeln** (DCR).
- **Microsoft Defender for Cloud** (Defender for Servers): Schwachstellenbewertung, EDR (Defender for Endpoint).
- **Change Tracking & Inventory**, **Azure Automation** (Hybrid Runbook Worker als Erweiterung), **Run Command**, **SSH/RDP über Arc** ohne offene Ports.
- **Windows Admin Center im Azure-Portal** für Arc-Server.
- **Extended Security Updates (ESU)** für Server 2012/R2 über Arc lizenzieren.
- **Windows Server Management enabled by Azure Arc** (für Software Assurance-Kunden: viele Verwaltungsfunktionen ohne Zusatzkosten).

### Azure Policy Machine Configuration im Detail
- **Richtliniendefinition** (JSON) mit Effekt **AuditIfNotExists** oder **DeployIfNotExists**; Zuweisung auf Abonnement/Ressourcengruppe.
- Ein **Konfigurationspaket** (auf Basis von **PowerShell DSC**, als .zip in einem Storage Account) beschreibt den Sollzustand.
- Voraussetzungen: **verwaltete Identität** (bei Arc automatisch), Guest-Configuration-Erweiterung (Azure-VMs) bzw. Agent (Arc).
- Integrierte Richtlinien, z. B. „Windows-Computer sollten die Anforderungen der Azure-Sicherheitsbaseline erfüllen“, „Audit Windows machines that are not joined to the specified domain“, „Zeitzone …“.
- **Konformität** im Portal (Policy → Konformität), Neuprüfung alle 15 Minuten im Gast; Korrekturaufgaben (Remediation) für DeployIfNotExists.

## Lab
**Voraussetzung**: Azure-Abonnement (Testabo). Maschinen: SRV01 (on-prem, Internetzugang ausgehend 443), Admin-PC.

### GUI
1. **Portal**: Suche **Azure Arc** → **Computer** → **Hinzufügen/Erstellen** → **Einzelnen Server hinzufügen** → Ressourcengruppe `rg-arc`, Region, Betriebssystem Windows, Verbindungsmethode **Öffentlicher Endpunkt** → Tags (Standort=Gelsenkirchen) → **Skript herunterladen**.
2. **SRV01**: PowerShell als Admin → Skript ausführen → Browser-Anmeldung (Gerätecode) → Agent verbindet sich.
3. **Portal**: Azure Arc → Computer → **SRV01** (Status „Verbunden“) → Übersicht, Erweiterungen, Eigenschaften (Betriebssystem, Agentversion).
4. **Policy**: Portal → **Policy** → Definitionen → Suche „Zeitzone“ bzw. „Audit Windows machines on which the specified services are not installed and 'Running'“ → **Zuweisen** → Bereich `rg-arc` → Parameter → Erstellen.
5. Nach ~30 Minuten: Policy → **Konformität** → SRV01 konform/nicht konform.
6. **Update Manager**: SRV01 → Updates → **Nach Updates suchen** → Ergebnis.
7. **Monitoring**: SRV01 → Insights → **Aktivieren** (AMA + DCR).

### PowerShell / CLI
```powershell
# Auf SRV01 – Agent manuell (Skript aus dem Portal verwendet dies intern)
Invoke-WebRequest -Uri https://aka.ms/AzureConnectedMachineAgent -OutFile AzureConnectedMachineAgent.msi
msiexec /i AzureConnectedMachineAgent.msi /qn
& "$env:ProgramFiles\AzureConnectedMachineAgent\azcmagent.exe" connect `
  --resource-group "rg-arc" --tenant-id "<TenantID>" --location "westeurope" --subscription-id "<AboID>"
azcmagent show
azcmagent check --location westeurope          # Konnektivitätstest

# Massen-Onboarding mit Dienstprinzipal (Admin-PC, Az-Modul)
$sp = New-AzADServicePrincipal -DisplayName "Arc-Onboarding" -Role "Azure Connected Machine Onboarding" -Scope "/subscriptions/<AboID>/resourceGroups/rg-arc"
# Im Skript: azcmagent connect --service-principal-id <AppId> --service-principal-secret <Secret> ...

# Arc-Server auflisten und Policy-Konformität
Get-AzConnectedMachine -ResourceGroupName rg-arc | Format-Table Name, Status, OSName
Get-AzPolicyState -ResourceGroupName rg-arc | Select-Object ResourceId, PolicyDefinitionName, ComplianceState

# Erweiterung (Azure Monitor Agent) installieren
New-AzConnectedMachineExtension -MachineName SRV01 -ResourceGroupName rg-arc -Name AzureMonitorWindowsAgent `
  -Publisher Microsoft.Azure.Monitor -ExtensionType AzureMonitorWindowsAgent -Location westeurope
```

## Einfach

Stell dir vor, Azure ist eine **große Firmenzentrale mit super Werkzeugen**: Überwachung, Update-Plan, Sicherheitscheck, Regelbuch. Aber diese Werkzeuge funktionierten früher nur für Server, die **in der Zentrale (in Azure)** stehen.

**Azure Arc** ist wie ein **Mitgliedsausweis der Zentrale** für Server, die **woanders** stehen – im eigenen Keller, bei einer anderen Cloud. Mit dem Ausweis (dem **Agent**) taucht der Server im Azure-Portal auf, als wäre er dort – und alle Werkzeuge der Zentrale funktionieren plötzlich auch für ihn:
- **Regelbuch prüfen** (Azure Policy): „Hat jeder Server die richtige Zeitzone? Ist der Virenschutz an?“
- **Updates planen** (Update Manager)
- **Überwachen** (Azure Monitor)
- **Sicherheit** (Defender for Cloud)

Der Server **bleibt dabei im Keller stehen** – es wird nichts umgezogen. Er „telefoniert“ nur **nach draußen** (Port 443), niemand muss von außen zu ihm hinein.

**Machine Configuration** ist der **Inspektor im Inneren des Servers**: Er schaut nach, ob die Einstellungen **im Windows selbst** den Regeln entsprechen, meldet Abweichungen – und kann sie sogar automatisch korrigieren.

Für viele Server auf einmal benutzt man ein **Dienstkonto** (Service Principal) und verteilt das Installationsskript z. B. per Gruppenrichtlinie.

## Merksatz
- Arc = **Azure-Verwaltung für Nicht-Azure-Server**, Server bleibt, wo er ist.
- **Connected Machine Agent**, nur **ausgehend 443**.
- Massen-Onboarding: **Service Principal** mit Rolle **Azure Connected Machine Onboarding**.
- **Machine Configuration** = Azure Policy **im Gast-OS** (DSC-basiert).
- Arc liefert eine **verwaltete Identität** für den Server.

## Prüfungsfalle
- Arc migriert keine Server nach Azure.
- Keine eingehenden Firewallregeln nötig.
- Für Onboarding im großen Stil kein interaktives Konto, sondern Dienstprinzipal.
- Ressourcenanbieter vor dem ersten Onboarding registrieren.
- Machine Configuration benötigt eine verwaltete Identität.

## Grafik
### Mitgliedsausweis
Server im Keller bekommt eine Arc-Plakette; eine Leitung (nur ausgehend, Pfeil nach oben, 443) verbindet ihn mit der Azure-Wolke; im Portal erscheint sein Abbild neben echten Azure-VMs; Werkzeug-Icons (Policy, Update, Monitor, Defender) docken an.

### Inspektor
Lupe wandert durch das Windows-Innere des Servers, prüft Zeitzone/Dienste; grüne Haken und ein rotes Kreuz, das nach „Korrektur“ grün wird.

## Karteikarten
- F: Was ist Azure Arc? | A: Erweiterung der Azure-Verwaltung (ARM) auf Server/Kubernetes/SQL außerhalb von Azure.
- F: Welcher Agent wird für Arc-fähige Server installiert? | A: Azure Connected Machine Agent (azcmagent).
- F: Welche Ports braucht der Arc-Agent? | A: Nur ausgehend HTTPS (443).
- F: Welche Rolle braucht ein Dienstprinzipal fürs Massen-Onboarding? | A: Azure Connected Machine Onboarding.
- F: Was ist Azure Policy Machine Configuration? | A: Prüfung/Durchsetzung von Einstellungen im Gastbetriebssystem über Azure Policy (DSC-basiert).
- F: Welche Voraussetzung braucht Machine Configuration? | A: Eine verwaltete Identität (bei Arc automatisch) und den Guest-Configuration-Agent.
- F: Nenne vier Dienste, die über Arc für on-prem-Server nutzbar werden. | A: Azure Policy, Update Manager, Azure Monitor, Defender for Cloud (auch Automation, Run Command, ESU).
- F: Befehl zum Prüfen der Arc-Konnektivität? | A: azcmagent check
- F: Welcher Ressourcentyp repräsentiert Arc-Server? | A: Microsoft.HybridCompute/machines.

## Quiz
? Ein Unternehmen will 300 on-prem-Server im Azure-Portal mit Azure Policy verwalten, ohne sie zu migrieren. Was ist nötig?
* Azure Arc mit dem Connected Machine Agent
- Azure Site Recovery
- Azure Migrate
- Ein S2S-VPN allein

? Welche Firewallanforderung hat der Arc-Agent?
* Ausgehend TCP 443 zu Azure
- Eingehend TCP 443 aus dem Internet
- Eingehend 3389
- Eingehend 5985

? Wie onboardet man viele Server ohne interaktive Anmeldung?
* Mit einem Dienstprinzipal mit der Rolle Azure Connected Machine Onboarding
- Mit dem globalen Administrator per Browser auf jedem Server
- Mit einem Forest-Trust
- Mit dcpromo

? Was prüft Azure Policy Machine Configuration?
* Einstellungen innerhalb des Gastbetriebssystems
- Nur Azure-Ressourceneigenschaften wie Region
- Nur Netzwerkkarten in Azure
- Nur Kosten

? Was passiert mit einem on-prem-Server nach dem Arc-Onboarding?
* Er bleibt on-prem und erscheint zusätzlich als Ressource im Azure-Portal
- Er wird nach Azure migriert
- Er wird zum Domänencontroller
- Er verliert seine Domänenmitgliedschaft
