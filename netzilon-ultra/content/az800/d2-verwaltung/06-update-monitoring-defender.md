---
id: az800-update-monitoring
bereich: AZ-800
block: A7
kapitel: Hybrid-Verwaltung
titel: Azure Update Manager, Log Analytics & Defender for Cloud
stufe: Profi
quellen: [AZ-800 Study Guide, Microsoft Learn]
verweise: [az800-azure-arc, az801-log-analytics, az801-defender-identity, az800-automation-dsc]
---

## Profi

### Update-Verwaltung hybrid
| Werkzeug | Beschreibung |
|---|---|
| **WSUS** (on-prem) | Rolle „Windows Server Update Services“: lädt Updates einmal herunter, Genehmigung pro Computergruppe, Clients per GPO (`Windows Update → Intranetspeicherort für Microsoft Updatedienst angeben`); Datenbank WID/SQL; Rolle ist **veraltet (deprecated)**, bleibt aber verfügbar |
| **Windows Update for Business** | Update-Ringe/Verzögerungen per GPO/Intune (v. a. Clients) |
| **Azure Update Manager** (Nachfolger von „Update Management“ in Azure Automation) | **zentrale Updateverwaltung** für **Azure-VMs und Arc-fähige Server** (Windows + Linux) – **ohne** Log-Analytics-Workspace/Automation-Konto, nutzt Erweiterungen/Agenten der VM bzw. Arc |
**Azure Update Manager** – Funktionen:
- **Updatebewertung** (periodisch alle 24 h automatisch aktivierbar per Policy), **Einmalige Installation** („Jetzt aktualisieren“).
- **Wartungskonfigurationen** (Maintenance Configurations): **Zeitplan** (z. B. jeden zweiten Dienstag + 5 Tage, 22–2 Uhr), Klassifizierungen (Kritisch, Sicherheit, Updaterollups…), KB-Ein/Ausschlüsse, **Neustartverhalten**, Pre-/Post-Skripte (Ereignisse).
- **Dynamischer Bereich**: Maschinen per Tags/Ressourcengruppe/Standort automatisch einbeziehen.
- **Hotpatch** (Server 2022/2025 Azure Edition, Server 2025 mit Arc): Sicherheitsupdates **ohne Neustart**.
- Integration mit **Azure Policy** (Assessment erzwingen), Berichte in **Azure Resource Graph**/Workbooks.
- Kosten: für Azure-VMs frei, für Arc-Server pro Server/Tag (frei bei ESU/Software-Assurance-Vorteilen).

### Log Analytics & Azure Monitor
- **Azure Monitor** ist die Überwachungsplattform; **Log Analytics Workspace** ist der **Datenspeicher für Protokolle** (Ereignisse, Leistungsindikatoren, Syslog, Sicherheitsdaten), abgefragt mit **KQL** (Kusto Query Language).
- **Azure Monitor Agent (AMA)**: aktueller Agent für Windows/Linux (Azure-VM-Erweiterung bzw. Arc-Erweiterung); **ersetzt** den alten **Log Analytics Agent (MMA/OMS)** – dieser wurde im **August 2024 eingestellt**.
- **Datensammlungsregeln (DCR)**: definieren **was** gesammelt wird (z. B. System-Ereignisprotokoll Fehler/Warnungen, Leistungsindikatoren alle 60 s, IIS-Logs) und **wohin** (Workspace). Eine DCR kann vielen Maschinen zugeordnet werden.
- **VM Insights**: Leistungsdiagramme, **Map** (Abhängigkeiten/Verbindungen), vorgefertigte Arbeitsmappen.
- **Warnungen** (Alerts): Metrik- oder Protokollwarnungen (KQL) → **Aktionsgruppen** (E-Mail, SMS, Webhook, Runbook, Logic App).
- **Aufbewahrung** und Kosten pro GB beachten (Commitment Tiers, Basic Logs).
Beispiel-KQL:
```kusto
Event
| where TimeGenerated > ago(24h) and EventLevelName == "Error"
| summarize Anzahl = count() by Computer, Source
| order by Anzahl desc
```
```kusto
Perf
| where ObjectName == "Processor" and CounterName == "% Processor Time"
| summarize avg(CounterValue) by bin(TimeGenerated, 5m), Computer
| render timechart
```

### Microsoft Defender for Cloud
**CSPM + CWPP**: Sicherheitsbewertung und Schutz für Azure-, Hybrid- (Arc) und Multicloud-Ressourcen.
- **Foundational CSPM** (kostenlos): **Secure Score**, **Empfehlungen** (z. B. „Systemupdates installieren“, „Endpoint Protection aktivieren“, „Schwachstellen beheben“), **Microsoft Cloud Security Benchmark** als Standard-Initiative.
- **Defender for Servers** (Plan 1/Plan 2, kostenpflichtig): Integration von **Microsoft Defender for Endpoint** (EDR, automatisches Onboarding), **Schwachstellenbewertung** (Defender Vulnerability Management), **Just-in-Time-VM-Zugriff** (Azure-VMs: RDP/SSH-Ports nur bei Bedarf öffnen), **Dateiintegritätsüberwachung** (FIM), **adaptive Anwendungssteuerung** bzw. Nachfolger, Sicherheitswarnungen, **Agentless Scanning** (Plan 2).
- Für **on-prem-Server**: Voraussetzung ist **Azure Arc**; Defender-Pläne auf Abonnementebene aktivieren → automatische Bereitstellung der Erweiterungen.
- **Regulatorische Compliance**-Dashboard (ISO 27001, PCI DSS, BSI C5 …), Export zu **Microsoft Sentinel** (SIEM/SOAR).

## Lab
**Voraussetzung**: Azure-Abonnement; SRV01 als Arc-Server (siehe Arc-Seite), eine Azure-VM `az-vm01`.

### GUI
1. **Portal** → **Azure Update Manager** → Übersicht → Maschinen auswählen (SRV01, az-vm01) → **Nach Updates suchen** → Ergebnis ansehen.
2. **Wartungskonfigurationen** → Erstellen → Name `patch-dienstag` → Bereich Gast (Azure VM + Arc) → **Zeitplan**: monatlich, zweiter Dienstag, Offset +3 Tage, 22:00, Dauer 3 h → Updates: Kritisch + Sicherheit → Neustart „Bei Bedarf“ → **Dynamischer Bereich** Tag `Patchgruppe=A` → Erstellen.
3. **Portal** → **Log Analytics-Arbeitsbereiche** → Erstellen `law-hybrid`.
4. **Azure Monitor** → **Datensammlungsregeln** → Erstellen `dcr-windows-basis` → Ressourcen: SRV01, az-vm01 (AMA wird automatisch installiert) → Datenquellen: **Windows-Ereignisprotokolle** (System/Anwendung: Kritisch, Fehler, Warnung), **Leistungsindikatoren** (Standard) → Ziel `law-hybrid`.
5. Nach ~15 Minuten: `law-hybrid` → **Protokolle** → KQL-Abfragen von oben ausführen.
6. **Warnung**: Abfrage „Anzahl Fehler > 10 in 15 Min.“ → **Neue Warnungsregel** → Aktionsgruppe mit E-Mail.
7. **Defender for Cloud** → Umgebungseinstellungen → Abonnement → **Defender-Pläne** → Server: **Plan 1** (Test) → Speichern → **Empfehlungen** und **Secure Score** ansehen, SRV01 in „Inventar“.

### PowerShell / CLI
```powershell
# Updatebewertung auslösen (Azure-VM bzw. Arc-Server)
Invoke-AzVMPatchAssessment -ResourceGroupName rg-hybrid -VMName az-vm01
az connectedmachine assess-patches --resource-group rg-arc --name SRV01

# Log Analytics-Workspace und DCR-Zuordnung (vereinfacht)
New-AzOperationalInsightsWorkspace -ResourceGroupName rg-hybrid -Name law-hybrid -Location westeurope -Sku PerGB2018
# DCR per Portal/ARM-Vorlage; Zuordnung:
New-AzDataCollectionRuleAssociation -AssociationName "srv01-basis" -ResourceUri (Get-AzConnectedMachine -Name SRV01 -ResourceGroupName rg-arc).Id `
  -DataCollectionRuleId "/subscriptions/<Abo>/resourceGroups/rg-hybrid/providers/Microsoft.Insights/dataCollectionRules/dcr-windows-basis"

# Defender for Servers aktivieren
Set-AzSecurityPricing -Name "VirtualMachines" -PricingTier "Standard" -SubPlan "P1"
Get-AzSecurityTask | Select-Object -First 10

# On-prem: WSUS-Rolle (Alternative ohne Azure)
Install-WindowsFeature UpdateServices -IncludeManagementTools
& "C:\Program Files\Update Services\Tools\wsusutil.exe" postinstall CONTENT_DIR=D:\WSUS
```

## Einfach

Wenn du viele Server hast, brauchst du drei Dinge:

1. **Updates** (Azure Update Manager) – wie ein **Wartungsplan für eine Autoflotte**: „Jeden zweiten Dienstag nach dem Patchday, nachts zwischen 22 und 1 Uhr, bekommen alle Autos mit dem Aufkleber ‚Gruppe A‘ ihre Sicherheitsupdates, und wenn nötig werden sie neu gestartet.“ Das gilt für Azure-Server **und** (dank Arc) für Server im eigenen Keller. Früher (und on-prem ohne Cloud) machte das **WSUS**.

2. **Überwachung** (Log Analytics / Azure Monitor) – wie ein **Fahrtenschreiber**: Alle Server schicken ihre **Tagebücher** (Ereignisprotokolle) und **Messwerte** (CPU, RAM) in ein **zentrales Archiv** (Log Analytics Workspace). Dort kannst du mit einer Suchsprache (**KQL**) fragen: „Welcher Server hatte heute die meisten Fehler?“ Und du kannst Alarme einstellen: „Schick mir eine Mail, wenn…“. Was gesammelt wird, steht in einer **Datensammlungsregel**; eingesammelt wird es vom **Azure Monitor Agent**.

3. **Sicherheit** (Defender for Cloud) – wie ein **TÜV mit Punkten** (**Secure Score**): Er prüft alle Server und sagt: „Hier fehlt ein Update, dort ist der Virenschutz aus, hier ist ein Port unnötig offen.“ Mit dem Bezahl-Paket (**Defender for Servers**) kommt noch ein **Wachdienst** dazu, der Angriffe erkennt (Defender for Endpoint).

## Merksatz
- **Azure Update Manager** = Updates für **Azure-VMs + Arc-Server**, **Wartungskonfigurationen**, dynamischer Bereich.
- **AMA + DCR → Log Analytics Workspace**, Abfragen mit **KQL**; alter MMA-Agent ist **eingestellt**.
- **Defender for Cloud**: **Secure Score/Empfehlungen** (kostenlos) + **Defender for Servers** (EDR, Schwachstellen, JIT).
- On-prem-Server in Defender/Update Manager → **Arc** nötig.
- WSUS = klassisch on-prem, **deprecated**.

## Prüfungsfalle
- Azure Update Manager braucht **kein** Automation-Konto und keinen Workspace (anders als das alte Update Management).
- Neue Überwachung mit **AMA + DCR**, nicht mit dem Log Analytics Agent (MMA).
- Just-in-Time-VM-Zugriff gilt für **Azure-VMs**, nicht für on-prem-Server.
- Defender for Servers wird auf **Abonnementebene** aktiviert.
- Hotpatch nur für bestimmte Editionen/Szenarien.

## Grafik
### Flotten-Wartungsplan
Kalender mit Patchday-Markierung; Server mit Aufklebern „Gruppe A/B“; am geplanten Abend leuchten die Gruppe-A-Server auf und installieren Updates (Fortschrittsbalken, ggf. Neustart-Symbol).

### Fahrtenschreiber
Server schicken Tagebuchseiten über den AMA zu einer Datensammlungsregel (Trichter) in den Workspace (Archiv); eine KQL-Frage wird gestellt, ein Diagramm erscheint; Alarmglocke bei Schwellwert.

### Sicherheits-TÜV
Secure-Score-Tachometer; Empfehlungskarten; Umschalter „Defender for Servers“ setzt einen Wachmann (EDR) neben jeden Server.

## Karteikarten
- F: Was ist Azure Update Manager? | A: Zentrale Updateverwaltung für Azure-VMs und Arc-Server (Windows/Linux) mit Bewertung, Zeitplänen und Wartungskonfigurationen.
- F: Was ist eine Wartungskonfiguration? | A: Zeitplan + Updateauswahl + Neustartverhalten für Patchinstallationen in Azure Update Manager.
- F: Welcher Agent sammelt heute Protokolle für Azure Monitor? | A: Azure Monitor Agent (AMA) mit Datensammlungsregeln (DCR).
- F: Wie heißt die Abfragesprache von Log Analytics? | A: KQL (Kusto Query Language).
- F: Was legt eine Datensammlungsregel fest? | A: Welche Daten (Ereignisse, Leistungsindikatoren, Logs) gesammelt und in welches Ziel gesendet werden.
- F: Was ist der Secure Score? | A: Kennzahl in Defender for Cloud für den Umsetzungsgrad der Sicherheitsempfehlungen.
- F: Was bietet Defender for Servers zusätzlich? | A: Defender for Endpoint (EDR), Schwachstellenbewertung, JIT-VM-Zugriff, Dateiintegritätsüberwachung.
- F: Was brauchen on-prem-Server für Defender for Cloud und Update Manager? | A: Azure Arc.
- F: Welche on-prem-Rolle verwaltet Updates ohne Cloud? | A: WSUS (Windows Server Update Services, deprecated).

## Quiz
? Ein Admin will Updates für Azure-VMs und on-prem-Arc-Server zentral nach Zeitplan installieren. Welcher Dienst?
* Azure Update Manager mit Wartungskonfiguration
- Azure Site Recovery
- Azure File Sync
- DHCP-Failover

? Welche Komponente legt fest, welche Ereignisprotokolle der Azure Monitor Agent sammelt?
* Datensammlungsregel (DCR)
- Wartungskonfiguration
- Starter-GPO
- Recovery Services Vault

? Womit werden Daten im Log Analytics Workspace abgefragt?
* KQL
- SQL-Transact nur
- LDAP-Filter
- WQL

? Welche Funktion öffnet RDP-Ports von Azure-VMs nur bei Bedarf?
* Just-in-Time-VM-Zugriff (Defender for Servers)
- Seamless SSO
- Azure Policy Machine Configuration
- Staging-Modus

? Welche Aussage zum Log Analytics Agent (MMA) ist richtig?
* Er wurde eingestellt; stattdessen wird der Azure Monitor Agent verwendet
- Er ist der empfohlene neue Agent
- Er wird für Arc zwingend benötigt
- Er ersetzt den AMA

? Welcher Agent ersetzt den Log Analytics Agent (MMA)?
* Azure Monitor Agent (AMA)
- Connected Machine Agent
- Hybrid Runbook Worker
- WSUS-Client
! Datenerfassung über Datensammlungsregeln (DCR).

? Welche Abfragesprache nutzt Log Analytics?
* KQL (Kusto Query Language)
- SQL
- LDAP
- WQL
! Beispiel: Event | where EventID == 4625.

? Was bietet Microsoft Defender for Cloud?
* Sicherheitsbewertung (Secure Score), Empfehlungen und Bedrohungsschutz für Azure-, Hybrid- und Multi-Cloud-Ressourcen
- Nur Virenschutz für Clients
- Ein Backup der VMs
- Einen DHCP-Dienst
! Erweiterte Pläne wie „Defender for Servers“ sind kostenpflichtig.
