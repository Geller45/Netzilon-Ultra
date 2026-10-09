---
id: az801-log-analytics
bereich: AZ-801
block: A10
kapitel: Monitoring und Troubleshooting
titel: Log Analytics, Azure Monitor und VM Insights
stufe: Profi
quellen: [AZ-801 Study Guide, Microsoft Learn]
verweise: [az801-wac-system-insights, az801-ereignisprotokolle, az800-azure-arc, az800-update-monitoring]
---

## Profi

### Azure Monitor
**Azure Monitor** **sammelt, analysiert und reagiert** **auf** **Telemetrie** **aus Azure und lokal**.

| Datenart | Erklärung |
|---|---|
| **Metriken** (*Metrics*) | **Zahlenwerte** **(CPU %)**, **fast in Echtzeit**, **93 Tage** **Aufbewahrung** |
| **Protokolle** (*Logs*) | **Ereignisse/Daten** **in** **Log Analytics** **(KQL-Abfragen)** |
| **Warnungen** (*Alerts*) | **Regeln** **auf** **Metriken/Logs** **→** **Aktionsgruppe** |
| **Aktionsgruppe** | **E-Mail**, **SMS**, **Webhook**, **Runbook**, **Logic App** |

### Log Analytics-Arbeitsbereich
**Speicher** **für** **Protokolldaten**. **Abfragen** **mit** **KQL** (*Kusto Query Language*). **Aufbewahrung**: **Standard** **30 Tage**, **einstellbar** **bis 730 Tage** **(danach** **Archiv** **bis 12 Jahre)**. **Kosten** **nach** **Datenmenge**.

### Agent-Modell
| Agent | Status |
|---|---|
| **Azure Monitor Agent** (AMA) | **Aktuell**, **nutzt** **Datensammlungsregeln** |
| **Log Analytics Agent** (MMA/OMS) | **Eingestellt (Ende August 2024)** |
| **Abhängigkeits-Agent** (*Dependency Agent*) | **Für** **VM Insights Map** |

**Lokale Server** **brauchen** **Azure Arc** **(Azure Connected Machine Agent)**, **damit** **AMA** **als Erweiterung** **installiert** **werden kann**.

### Datensammlungsregeln (DCR)
**Data Collection Rule** **legt** **fest**: **Quelle** **(Windows-Ereignisprotokolle, Leistungsindikatoren, Syslog)**, **Filter** **(XPath)**, **Ziel** **(Arbeitsbereich)**. **Eine DCR** **kann** **vielen** **Servern** **zugewiesen** **werden**.

### VM Insights
| Bereich | Erklärung |
|---|---|
| **Leistung** (*Performance*) | **CPU, RAM, Disk, Netz** **für** **VM/Server** |
| **Zuordnung** (*Map*) | **Prozesse** **und** **Verbindungen** **zwischen** **Servern** **(Dependency Agent)** |
| **Bereitstellung** | **Über Portal/Policy** **für** **Azure-VMs**, **Arc-Server**, **VMSS** |
| **Tabellen** | `InsightsMetrics`, `VMConnection`, `VMProcess` |

### Wichtige KQL-Beispiele
```kusto
// Heartbeat: welche Server melden sich?
Heartbeat | summarize LastSeen = max(TimeGenerated) by Computer | order by LastSeen desc

// CPU über 85 % in der letzten Stunde
Perf
| where ObjectName == "Processor" and CounterName == "% Processor Time" and TimeGenerated > ago(1h)
| summarize AvgCPU = avg(CounterValue) by Computer
| where AvgCPU > 85

// Anmeldefehler
SecurityEvent | where EventID == 4625 | summarize Count = count() by Account, Computer | top 10 by Count

// Fehler im System-Protokoll
Event | where EventLog == "System" and EventLevelName == "Error" | take 20
```

### Weitere Monitoring-Bausteine
- **Azure Monitor für VMs**: **Alarme** **per Vorlage**.
- **Arbeitsmappen** (*Workbooks*): **Dashboards**.
- **Diagnoseeinstellungen**: **Azure-Ressourcen** **→** **Arbeitsbereich**.
- **Microsoft Defender for Cloud** **nutzt** **denselben Arbeitsbereich**.
- **Update Manager**: **Patchstatus** **(aus Arc/Arbeitsbereich)**.
- **Warnung**: **Regelname**, **Schweregrad 0–4**, **Bedingung**, **Aktionsgruppe**.

### PowerShell / CLI
```powershell
# Auf Admin-PC – Arbeitsbereich anlegen
New-AzOperationalInsightsWorkspace -ResourceGroupName rg-mon -Name law-exa -Location westeurope -Sku PerGB2018 -RetentionInDays 60

# Arc-Server: AMA-Erweiterung
New-AzConnectedMachineExtension -ResourceGroupName rg-arc -MachineName SRV01 -Location westeurope -Name AzureMonitorWindowsAgent -Publisher Microsoft.Azure.Monitor -ExtensionType AzureMonitorWindowsAgent

# Abfrage
Invoke-AzOperationalInsightsQuery -WorkspaceId (Get-AzOperationalInsightsWorkspace -ResourceGroupName rg-mon -Name law-exa).CustomerId -Query "Heartbeat | take 5"
```

## Lab
**Maschinen**: **SRV01** **(Arc-verbunden)**, **Azure-Abo**.

### GUI
1. **Azure-Portal**: **Log Analytics-Arbeitsbereiche → Erstellen** → **law-exa**.
2. **Azure-Portal**: **Monitor → Virtuelle Computer → Konfigurieren → Arbeitsbereich law-exa** → **Aktivieren**.
3. **Azure-Portal**: **Monitor → Datensammlungsregeln → Erstellen** → **Plattform „Windows“** → **Ressourcen: SRV01** → **Datenquelle „Leistungsindikatoren“ und „Windows-Ereignisprotokolle“ (System, Anwendung)** → **Ziel law-exa**.
4. **Azure-Portal**: **law-exa → Protokolle** → **KQL** `Heartbeat | take 10` **ausführen**.
5. **Azure-Portal**: **Monitor → Warnungen → Warnungsregel erstellen** → **Bedingung „CPU > 85 %“** → **Aktionsgruppe (E-Mail)**.
6. **Azure-Portal**: **Monitor → Virtuelle Computer → Leistung/Zuordnung** **ansehen**.

## Einfach

**Azure Monitor** **ist** **wie** **die Zentrale** **eines Sicherheitsdienstes**: **Alle Server** **schicken** **Meldungen** **dorthin**. **Log Analytics** **ist das Archiv**, **in dem** **du** **mit** **einer** **Suchsprache** (**KQL**) **nach Meldungen** **suchst**.

**Der Agent** **ist der Bote**, **der** **die Meldungen** **einsammelt**. **Die Datensammlungsregel** **ist** **die Liste**, **was** **er einsammeln soll**.

**VM Insights** **ist ein** **Dashboard**: **Wie** **gesund** **sind** **meine** **Server?** **Wer** **spricht mit wem?** **(Karte)**.

## Merksatz
- **Metriken = Zahlen**, **Logs = Ereignisse**.
- **KQL** **sucht** **in Log Analytics**.
- **AMA + DCR** **ersetzt** **MMA**.
- **Arc** **bringt** **lokale Server** **in Azure Monitor**.
- **VM Insights = Performance + Map**.
- **Standard-Aufbewahrung 30 Tage**.

## Prüfungsfalle
- **MMA/Log Analytics Agent** **ist eingestellt**.
- **Lokale Server** **brauchen** **Arc**.
- **Map** **braucht** **Dependency Agent**.
- **Metriken** **≠** **Logs** **(unterschiedliche Aufbewahrung)**.
- **Alarm** **braucht** **Aktionsgruppe**, **sonst** **niemand informiert**.
- **DCR** **muss** **der Ressource** **zugewiesen** **werden**.
- **Arbeitsbereichsregion** **und** **Kosten** **beachten**.

## Grafik
### Zentrale
Server senden Boten zur Zentrale, Archiv im Keller, KQL-Lupe.

### Bote und Liste
Agent trägt Zettel, DCR ist die Einkaufsliste.

### Karte
Server als Punkte, Linien zeigen Gespräche.

## Karteikarten
- F: Was ist Log Analytics? | A: Dienst zum Speichern und Abfragen von Protokolldaten mit KQL.
- F: Welcher Agent ist aktuell? | A: Azure Monitor Agent (AMA).
- F: Was legt eine DCR fest? | A: Quellen, Filter und Ziele der Datensammlung.
- F: Was braucht ein lokaler Server für AMA? | A: Azure Arc.
- F: Was zeigt VM Insights? | A: Leistung und Abhängigkeiten (Map).
- F: Was braucht die Map-Ansicht? | A: Dependency Agent.
- F: Standardaufbewahrung in Log Analytics? | A: 30 Tage.
- F: Was ist eine Aktionsgruppe? | A: Empfänger und Aktionen einer Warnung.
- F: Wie heißt die Abfragesprache? | A: KQL.

## Quiz
? Welche Sprache nutzt man für Log Analytics-Abfragen?
* KQL
- SQL only
- WQL
- LDAP

? Was benötigt ein lokaler Server, um an Azure Monitor zu senden?
* Azure Arc und AMA
- Nur RDP
- Nur DNS
- Nur Hyper-V

? Was legt eine Datensammlungsregel fest?
* Was gesammelt und wohin gesendet wird
- Wer sich anmeldet
- Wie repliziert wird
- Welche Updates installiert werden

? Welcher Agent ist eingestellt?
* Log Analytics Agent (MMA)
- Azure Monitor Agent
- Arc Agent
- Dependency Agent

? Welche Funktion zeigt Verbindungen zwischen Servern?
* VM Insights Map
- Task-Manager
- Backup-Center
- DNS-Manager

? Wie lange werden Protokolle standardmäßig aufbewahrt?
* 30 Tage
- 1 Tag
- 7 Tage
- 10 Jahre
