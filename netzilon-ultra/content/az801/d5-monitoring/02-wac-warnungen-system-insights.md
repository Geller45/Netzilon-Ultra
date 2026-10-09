---
id: az801-wac-system-insights
bereich: AZ-801
block: A10
kapitel: Monitoring und Troubleshooting
titel: WAC-Warnungen und System Insights
stufe: Profi
quellen: [AZ-801 Study Guide, Microsoft Learn]
verweise: [az801-leistungsueberwachung, az801-log-analytics, az800-wac]
---

## Profi

### Windows Admin Center: Überwachung
**WAC** **bietet** **im Browser**: **Übersicht** **(CPU, RAM, Netzwerk, Datenträger)**, **Leistungsüberwachung**, **Ereignisse**, **Dienste**, **Prozesse** **und** **Warnungen**.

| WAC-Funktion | Erklärung |
|---|---|
| **Übersicht** (*Overview*) | **Live-Diagramme** **des Servers** |
| **Leistungsüberwachung** | **Indikatoren** **live**, **Vorlagen** |
| **Ereignisse** | **Event Viewer** **im Browser** |
| **Warnungen** (*Alerts*) | **Zeigt** **Warnungen** **von** **Azure Monitor/Cluster/Storage** **(Erweiterung)** |
| **Azure Monitor** | **VM Insights/Log Analytics** **direkt** **aktivieren** |
| **System Insights** | **Vorhersagen** **(lokal)** |
| **Azure Hybrid Services** | **Backup, Site Recovery, Arc** |

**Kapazität**: **WAC** **selbst** **speichert** **keine Metriken** **dauerhaft** **– es** **zeigt** **Live-Werte** **oder** **Daten** **aus Azure**.

### System Insights
**System Insights** **(ab Windows Server 2019)** **ist** **ein lokales Vorhersagesystem** **mit maschinellem Lernen**. **Es** **wertet** **Verlaufsdaten** **aus** **und** **sagt** **Engpässe** **voraus**, **ganz ohne** **Cloud**.

| Funktion (*Capability*) | Vorhersage |
|---|---|
| **CPU-Kapazitätsprognose** (*CPU capacity forecasting*) | **CPU-Auslastung** |
| **Netzwerkkapazitätsprognose** (*Networking capacity forecasting*) | **Netzwerkverbrauch** |
| **Gesamtspeicherverbrauch** (*Total storage consumption forecasting*) | **Speicher gesamt** |
| **Volume-Verbrauch** (*Volume consumption forecasting*) | **Einzelne Volumes** |

- **Datenbasis**: **Leistungsindikatoren** **(Verlauf bis 1 Jahr)**.
- **Vorhersageintervall**: **Standard** **täglich** **(Volumes** **stündlich)**.
- **Prognose-Status**: **OK**, **Warnung**, **Kritisch**, **Fehler**, **Keine Daten**.
- **Aktionen**: **Bei** **Warnung/Kritisch** **kann** **ein Skript** **starten** **(z. B. Volume erweitern)**.
- **Anpassen**: **Zeitplan**, **Aktionen**, **Aktivieren/Deaktivieren**.
- **Zusätzlich**: **Eigene Funktionen** **(Skripte + ML-Modelle)**.

### PowerShell
```powershell
# Auf SRV01 – installieren
Install-WindowsFeature -Name System-Insights -IncludeManagementTools

# Funktionen anzeigen
Get-InsightsCapability

# Prognose starten und Ergebnis lesen
Invoke-InsightsCapability -Name "Volume consumption forecasting" -Volume C:
Get-InsightsCapabilityResult -Name "Volume consumption forecasting" -Volume C:

# Aktivieren/Deaktivieren
Enable-InsightsCapability -Name "CPU capacity forecasting"
Disable-InsightsCapability -Name "Networking capacity forecasting"

# Zeitplan
Set-InsightsCapabilitySchedule -Name "CPU capacity forecasting" -Daily -At 03:00

# Aktion bei Warnung
Set-InsightsCapabilityAction -Name "Volume consumption forecasting" -Warning "C:\Scripts\Expand-Volume.ps1"
```

### WAC-Warnungen konkret
- **Cluster**: **Cluster-Warnungen** **(Knoten**, **Speicher**, **Netzwerk)** **im** **WAC-Dashboard**.
- **Storage Spaces Direct**: **Health Service** **erzeugt** **Fehler** **mit** **Ursache** **und** **Handlung**.
- **Azure Monitor**: **Warnregeln** **im Azure-Portal**, **WAC** **verweist** **darauf**.

### Wann was?
| Bedarf | Lösung |
|---|---|
| **Sofort schauen** | **WAC-Übersicht/Perfmon** |
| **Vorhersage lokal** | **System Insights** |
| **Zentral, viele Server, KQL, Alarme** | **Azure Monitor + Log Analytics** |
| **Langzeit-Baseline** | **Datensammlersatz** |

## Lab
**Maschinen**: **WAC01** **(Gateway)**, **SRV01**.

### GUI
1. **WAC01**: **Windows Admin Center → SRV01 verbinden**.
2. **WAC01**: **Tools → System Insights** **öffnen** (**ggf.** **Installieren**).
3. **WAC01**: **Funktion „Volume consumption forecasting“ → Einstellungen** → **Zeitplan täglich** → **Aktion: Skript**.
4. **WAC01**: **„Jetzt ausführen“ → Ergebnis** **ansehen**.
5. **WAC01**: **Tools → Leistungsüberwachung → Arbeitsbereich hinzufügen** → **Indikatoren wählen**.
6. **WAC01**: **Tools → Azure Monitor → Einrichten** **(Log-Analytics-Arbeitsbereich wählen)**.

## Einfach

**System Insights** **ist wie eine Wettervorhersage für deinen Server**: **Sie** **schaut** **auf** **die letzten Monate** **und sagt**: **„In 3 Wochen** **ist** **das Laufwerk C: voll.“** **Sie** **braucht kein Internet**, **rechnet** **alles** **lokal**.

**WAC** **ist wie das Armaturenbrett im Auto**: **zeigt** **live** **Tempo** **und Temperatur**, **speichert** **aber** **keine** **lange** **Fahrtenliste**. **Die** **lange Liste** **führt** **Azure Monitor**.

## Merksatz
- **System Insights = lokale KI-Prognose**.
- **Vier Funktionen**: **CPU, Netz, Storage gesamt, Volume**.
- **WAC = Live**, **Azure Monitor = Verlauf**.
- **Warnung → Aktion (Skript)**.
- **Ab Server 2019**.

## Prüfungsfalle
- **System Insights** **braucht** **keine Cloud**.
- **Es** **prognostiziert**, **misst nicht** **live**.
- **Erst** **installieren** **(`System-Insights`)**.
- **WAC** **speichert** **keine** **langen Metriken**.
- **Aktion** **läuft** **nur** **bei Warnung/Kritisch**.
- **Funktionen** **nach** **Bedarf** **aktivieren**.

## Grafik
### Wettervorhersage
Kurve für Laufwerk C:, Pfeil nach oben, rote Linie bei 100 Prozent, Vorhersagedatum markiert.

### Armaturenbrett
Live-Anzeigen ohne Fahrtenbuch.

## Karteikarten
- F: Was ist System Insights? | A: Lokale ML-Vorhersagefunktion in Windows Server (ab 2019).
- F: Welche Funktionen liefert System Insights? | A: CPU, Netzwerk, Gesamtspeicher, Volume-Verbrauch.
- F: Braucht System Insights Azure? | A: Nein.
- F: Welches Feature installiert System Insights? | A: System-Insights.
- F: Welches Cmdlet startet eine Prognose? | A: Invoke-InsightsCapability.
- F: Wie löst man eine Aktion bei Warnung aus? | A: Set-InsightsCapabilityAction.
- F: Was zeigt WAC im Vergleich zu Azure Monitor? | A: Live-Werte, keine langfristige Speicherung.
- F: Mit welchem Cmdlet zeigt man die Ergebnisse einer System-Insights-Prognose an? | A: Get-InsightsCapabilityResult -Name '<Funktionsname>' (Liste der Funktionen mit Get-InsightsCapability).

## Quiz
? Welche Lösung prognostiziert lokal, wann ein Volume voll ist?
* System Insights
- Azure Backup
- Site Recovery
- DFS-R

? Braucht System Insights eine Azure-Verbindung?
* Nein
- Ja, zwingend
- Nur bei Cluster
- Nur bei Hyper-V

? Welches Cmdlet aktiviert eine Funktion?
* Enable-InsightsCapability
- Start-Insights
- Set-InsightsMode
- New-InsightsPolicy

? Was kann bei Warnung automatisch laufen?
* Ein Skript
- Ein Backup
- Ein Failover
- Ein Windows-Update

? Wo sieht man langfristigen Verlauf vieler Server?
* Azure Monitor / Log Analytics
- Task-Manager
- Ressourcenmonitor
- WAC-Übersicht

? Ab welcher Version gibt es System Insights?
* Windows Server 2019
- Windows Server 2012
- Windows Server 2016
- Windows 8

? Welche Standardfunktionen der Prognose bietet System Insights?
* CPU-Kapazität, Netzwerkkapazität, Gesamtspeicherverbrauch und Volumeverbrauch
- Kennwortablauf und Kontosperrungen
- DHCP-Leases und DNS-Abfragen
- Druckaufträge und Toner
! Die Vorhersagen beruhen auf lokalem maschinellem Lernen.

? Mit welchem Cmdlet lässt man sich die Ergebnisse einer System-Insights-Funktion anzeigen?
* Get-InsightsCapabilityResult
- Get-Counter -Insights
- Get-WinEvent -Insights
- Show-Prediction
! Invoke-InsightsCapability startet eine Prognose sofort.
