---
id: az801-defender-identity
bereich: AZ-801
block: A9
kapitel: Sicherheit
titel: Defender for Identity, Microsoft Sentinel und Defender for Cloud
stufe: Fortgeschritten
quellen: [AZ-801 Study Guide, Microsoft Learn]
verweise: [az801-credential-guard, az801-dc-haertung, az801-admin-delegierung, az800-azure-arc, az800-update-monitoring, az800-gmsa]
---

## Profi

### Überblick
| Dienst | Aufgabe | Ebene |
|---|---|---|
| **Microsoft Defender for Identity** (**MDI**, früher *Azure ATP*) | **Erkennt Angriffe** auf **Identitäten** im **lokalen AD** | **Identität** |
| **Microsoft Sentinel** | **Cloud-SIEM/SOAR**: **Logs** sammeln, **korrelieren**, **Vorfälle**, **Automatisierung** | **Zentrale Auswertung** |
| **Microsoft Defender for Cloud** | **Sicherheitsstatus** (**CSPM**) und **Workload-Schutz** (**CWPP**) für **Azure**, **Hybrid** und **Multicloud** | **Infrastruktur** |

### Microsoft Defender for Identity (MDI)
**Cloud-Dienst** mit **Sensoren** auf **Domänencontrollern** (auch **AD FS**, **AD CS**, **Entra Connect**). Sensor **liest** **Netzwerkverkehr** und **Ereignisse** und **sendet** sie **zur Analyse** an die **Cloud** (**HTTPS 443 ausgehend**). Ergebnisse erscheinen im **Microsoft Defender-Portal** (`security.microsoft.com`).

| Baustein | Beschreibung |
|---|---|
| **Sensor** | Installiert **direkt auf dem DC** (aktueller **Sensor v3**); **alter Standalone-Sensor** mit **Portspiegelung** = **Legacy** |
| **Verzeichnisdienstkonto** (*Directory Service Account*, **DSA**) | **Lesekonto** im AD für **Abfragen** (**SAM-R**, **Gruppen**); **empfohlen**: **gMSA** |
| **Arbeitsbereich** | **Mandant** (Tenant), **Lizenz**: **Microsoft 365 E5**, **EMS E5**, **Defender for Identity** eigenständig |
| **Erweiterte Überwachung** | **Windows-Ereignisse** (**Advanced Audit Policy**) **auf DCs** **aktivieren**, sonst **fehlende Erkennungen** |

**Erkennungen** (Beispiele)
| Phase | Angriffe |
|---|---|
| **Aufklärung** (*Reconnaissance*) | **Kontoenumeration**, **SMB-Sitzungsenumeration**, **DNS-Zonentransfer**, **Benutzer- und IP-Erkennung** |
| **Anmeldedaten-Diebstahl** | **Brute Force**, **Kerberoasting**, **AS-REP-Roasting**, **DCSync**, **Pass-the-Hash**, **Pass-the-Ticket**, **Golden Ticket**, **Skeleton Key** |
| **Laterale Bewegung** | **Overpass-the-Hash**, **Remoteausführung**, **Sensible Gruppen ändern** |
| **Persistenz/Dominanz** | **Golden Ticket**, **Directory Services Replication**, **Änderung** von **AdminSDHolder** |

**Weitere Funktionen**
- **Lateral-Movement-Pfade** (*Identity Security Posture*): **Wege** von **normalen Konten** zu **Adminkonten**.
- **Identitäts-Sicherheitsbewertungen** (**Secure Score**-Empfehlungen: **unsichere Delegierung**, **Kerberoasting-Konten**).
- **Integration**: **Defender XDR**, **Sentinel**, **Conditional Access** (**Risiko-Signale**).

**Einrichtung (Schritte)**
1. **Defender-Portal**: **Einstellungen → Identitäten** → **Arbeitsbereich** erstellen.
2. **gMSA** für **DSA** anlegen (`Mdi-Dsa`).
3. **Sensor-Paket** herunterladen (**älterer Sensor**: mit **Zugriffsschlüssel**; **neuer Sensor**: **Aktivierung** über das **Defender-Portal**/**Defender for Endpoint** – **Vorgehen** in der **aktuellen Microsoft-Doku** prüfen).
4. **Sensor** auf **jedem DC** installieren.
5. **Erweiterte Überwachung** **konfigurieren** (**Test-MDIReadiness**).
6. **Warnungen prüfen**, **Aktionskonten** definieren.

```powershell
# Auf DC01 – gMSA als Verzeichnisdienstkonto (Modul DefenderForIdentity)
Install-Module DefenderForIdentity
New-MDIDSA -Identity "Mdi-Dsa" -GmsaGroupName "MDI-Sensoren"
Test-MDIDSA -Identity "Mdi-Dsa" -Detailed
Test-MDIReadiness
Set-MDIConfiguration -Mode Domain -Configuration All
```

### Microsoft Sentinel
**Cloud-native SIEM** (*Security Information and Event Management*) und **SOAR** (*Security Orchestration, Automation and Response*), **aufgebaut auf** einem **Log-Analytics-Arbeitsbereich**.

| Baustein | Aufgabe |
|---|---|
| **Datenconnectors** | **Windows-Sicherheitsereignisse** (**Azure Monitor Agent**), **Defender XDR**, **Entra ID**, **Azure Activity**, **Syslog**, **CEF** |
| **Analyseregeln** | **KQL-Abfragen**, **geplant** oder **Near-Real-Time**, **erzeugen Warnungen** |
| **Vorfälle** (*Incidents*) | **Gebündelte Warnungen**, **Untersuchung** mit **Diagramm** |
| **Playbooks** | **Automatisierung** mit **Logic Apps** (**Mail**, **Konto sperren**, **Ticket**) |
| **Arbeitsmappen** (*Workbooks*) | **Dashboards** |
| **Hunting** | **Proaktive** Suche mit **KQL** |
| **Threat Intelligence** | **Bedrohungsindikatoren** |

**Für Hybrid-Server**: **Azure Arc** (**Seite AZ-800 Arc**) → **Azure Monitor Agent** → **Datenerfassungsregel (DCR)** → **Sentinel-Arbeitsbereich**. **Kosten** = **Datenaufnahme** (**GB**) und **Aufbewahrung**.

**Beispiel KQL** (Fehlanmeldungen):
```kusto
SecurityEvent
| where EventID == 4625
| summarize Versuche = count() by Account, IpAddress, bin(TimeGenerated, 10m)
| where Versuche > 10
```

### Microsoft Defender for Cloud
| Bereich | Inhalt |
|---|---|
| **CSPM** (*Cloud Security Posture Management*) | **Secure Score**, **Empfehlungen**, **Konformität** (**CIS**, **NIST**, **ISO**); **Foundational CSPM** **kostenlos**, **Defender CSPM** **kostenpflichtig** |
| **CWPP** (*Cloud Workload Protection*) | **Defender-Pläne**: **Server**, **Speicher**, **SQL**, **Container**, **App Service**, **Key Vault** |
| **Defender for Servers** | **Plan 1**: **Defender for Endpoint** **integriert**; **Plan 2**: **zusätzlich** **Just-in-Time-VM-Zugriff**, **Dateiintegritätsüberwachung**, **Schwachstellenbewertung** |
| **Hybrid** | **Nicht-Azure-Server** via **Azure Arc** **einbinden** |
| **Agent** | **Azure Monitor Agent**/**Defender for Endpoint** |

**Nutzen im AZ-801-Kontext**
- **Onboarding** on-prem-Server über **Azure Arc**.
- **Empfehlungen umsetzen** (**Patches**, **Endpoint-Schutz**, **Härtung**).
- **Just-in-Time-VM-Zugriff**: **NSG-Regel** für **RDP/SSH** **nur temporär**.
- **Warnungen** an **Sentinel** weiterleiten.

### Abgrenzung
| Frage | Lösung |
|---|---|
| **Kerberoasting/DCSync im lokalen AD erkennen** | **Defender for Identity** |
| **Logs zentral korrelieren**, **Vorfälle**, **Automatisierung** | **Sentinel** |
| **Sicherheitsstatus**, **Schwachstellen**, **JIT-Zugriff** für **Server** | **Defender for Cloud** |
| **Endgeräte-Erkennung** (**EDR**) | **Defender for Endpoint** |

## Lab
**Maschinen**: **DC01** (example.com), **SRV01** (Mitgliedsserver), **Entra-Mandant** mit **Testlizenz**, **Azure-Abonnement**.

### GUI
1. **Browser**: **security.microsoft.com** → **Einstellungen → Identitäten → Sensoren** → **Sensor hinzufügen**.
2. **DC01**: **Server-Manager → Tools → Active Directory-Benutzer und -Computer** → gMSA **Mdi-Dsa** **vorbereitet** (**PowerShell** unten).
3. **DC01**: **Sensor-Setup** ausführen → **Assistent** → **Installation**.
4. **Defender-Portal**: **Identitäten → Sensoren** → **Status: Läuft**.
5. **Azure-Portal**: **Microsoft Sentinel → Erstellen** → **Log-Analytics-Arbeitsbereich** wählen.
6. **Sentinel**: **Content-Hub → Windows-Sicherheitsereignisse über AMA** installieren → **Connector öffnen** → **Datenerfassungsregel** für **SRV01** erstellen.
7. **Azure-Portal**: **Microsoft Defender for Cloud → Umgebungseinstellungen** → **Abonnement** → **Defender for Servers Plan 1** **einschalten**.
8. **Defender for Cloud → Empfehlungen** → **Secure Score** **prüfen**.

### PowerShell
```powershell
# Auf DC01 – gMSA und Readiness
Import-Module ActiveDirectory
New-ADGroup -Name "MDI-Sensoren" -GroupScope Global -Path "OU=Gruppen,DC=example,DC=com"
Add-ADGroupMember "MDI-Sensoren" -Members "DC01$"
New-ADServiceAccount -Name "Mdi-Dsa" -DNSHostName "mdi-dsa.example.com" `
  -PrincipalsAllowedToRetrieveManagedPassword "MDI-Sensoren"
Install-ADServiceAccount "Mdi-Dsa"
Test-ADServiceAccount "Mdi-Dsa"

# Auf SRV01 – Azure Arc-Agent Status (für Defender for Cloud / Sentinel)
azcmagent show
```

## Einfach

Drei **Wächter** für dein Firmengebäude:

- **Defender for Identity** = **Wachmann am Tresor (DC)**. Er **lauscht** und ruft „**Achtung!**“, wenn jemand **Passwörter klauen** oder **sich als Admin ausgeben** will.
- **Sentinel** = **Überwachungsraum mit vielen Bildschirmen**. **Alle Kameras (Logs)** laufen dort **zusammen**. Er **erkennt Muster** („10 falsche Logins in 5 Minuten!“) und kann **automatisch reagieren** (Konto sperren).
- **Defender for Cloud** = **Gebäude-TÜV**. Er **prüft Schlösser, Fenster, Feuerlöscher** (**Server-Einstellungen**), gibt eine **Note (Secure Score)** und **sagt, was zu reparieren ist**. Dazu **öffnet er Türen nur kurz auf Zeit** (**JIT-Zugang**).

Der **Trick**: **Wachmann** (MDI) **meldet** an den **Überwachungsraum** (Sentinel). Der **TÜV** (Defender for Cloud) **schaut auf das ganze Gebäude**, auch auf **Server außerhalb** (mit **Azure Arc**).

## Merksatz
- **MDI** = **Identitätsangriffe im AD**, **Sensor auf dem DC**, **gMSA** als **DSA**.
- **Sentinel** = **SIEM + SOAR**, **Log Analytics**, **KQL**, **Playbooks (Logic Apps)**.
- **Defender for Cloud** = **Secure Score + Workload-Schutz**, **Arc** für **On-Prem**.
- **JIT-VM-Zugriff** gehört zu **Defender for Servers Plan 2**.
- **Erweiterte Überwachung** auf DCs ist **Pflicht** für **MDI**.

## Prüfungsfalle
- **MDI-Sensor** **nicht** auf **Mitgliedsservern** allein – **DCs** sind **Pflicht**.
- **DSA** am besten als **gMSA**, **nicht** als **normales Konto** mit **Ablaufdatum**.
- **Sentinel** **braucht** **Log-Analytics-Arbeitsbereich**; **Kosten nach Datenmenge**.
- **Defender for Servers Plan 1** enthält **kein JIT** (**Plan 2**).
- **Foundational CSPM** ist **kostenlos**, **Defender CSPM** **nicht**.
- **Lokale Server** brauchen **Azure Arc**, um in **Defender for Cloud** **zu erscheinen**.
- **MDI** ersetzt **Defender for Endpoint** **nicht** (**Identität** vs. **Endgerät**).
- **Legacy**: **Standalone-Sensor** (**Portspiegelung**) – **neuere Umgebungen** nutzen den **DC-Sensor**.

## Grafik
### Drei Wächter
Gebäude mit Tresor (DC), Wachmann (MDI) lauscht mit Ohr-Symbol; Kabel zu Überwachungsraum (Sentinel); TÜV-Prüfer (Defender for Cloud) mit Klemmbrett.

### Angriff erkannt
Hacker-Figur zieht Ticket-Fälschung (Golden Ticket); Wachmann hebt rotes Schild; im Überwachungsraum blinkt Vorfall; Playbook sperrt Konto.

### Hybrid-Anbindung
On-Prem-Server → Arc-Agent → Wolke; grüner Haken „Secure Score“.

## Karteikarten
- F: Wofür steht MDI? | A: Microsoft Defender for Identity (früher Azure ATP).
- F: Wo wird der MDI-Sensor installiert? | A: Auf Domänencontrollern (auch AD FS, AD CS, Entra Connect).
- F: Was ist das DSA bei MDI? | A: Verzeichnisdienstkonto (Lesekonto im AD), am besten ein gMSA.
- F: Welche Angriffe erkennt MDI? | A: Kerberoasting, DCSync, Pass-the-Hash, Golden Ticket, Aufklärung u. a.
- F: Was ist Sentinel? | A: Cloud-SIEM/SOAR auf Log-Analytics-Basis.
- F: Mit welcher Sprache fragt man in Sentinel Daten ab? | A: KQL (Kusto Query Language).
- F: Wofür dienen Playbooks? | A: Automatisierte Reaktion mit Logic Apps.
- F: Was liefert Defender for Cloud? | A: Secure Score, Empfehlungen und Workload-Schutz.
- F: Welcher Server-Plan enthält JIT-VM-Zugriff? | A: Defender for Servers Plan 2.
- F: Wie bindet man lokale Server in Defender for Cloud ein? | A: Über Azure Arc.
- F: Welche Ports braucht der MDI-Sensor zur Cloud? | A: HTTPS 443 ausgehend.

## Quiz
? Kerberoasting und DCSync im lokalen AD sollen erkannt werden. Lösung?
* Microsoft Defender for Identity
- Defender for Cloud Foundational CSPM
- Windows Firewall
- Credential Guard

? Welches Konto empfiehlt Microsoft als MDI-Verzeichnisdienstkonto?
* Group Managed Service Account (gMSA)
- Domänenadmin
- Lokaler Administrator
- Gastkonto

? Logs mehrerer Quellen sollen korreliert und Vorfälle automatisiert bearbeitet werden. Lösung?
* Microsoft Sentinel
- Windows Admin Center
- Azure Backup
- Network Watcher

? Welcher Plan enthält Just-in-Time-VM-Zugriff?
* Defender for Servers Plan 2
- Defender for Servers Plan 1
- Foundational CSPM
- Defender for Identity

? Ein lokaler Server soll im Secure Score von Defender for Cloud erscheinen. Was ist nötig?
* Azure Arc Onboarding
- VPN zu Azure genügt
- Domänenbeitritt zu Entra
- Sentinel-Lizenz

? Welche Voraussetzung ist für MDI-Erkennungen auf DCs wichtig?
* Erweiterte Überwachungsrichtlinie (Advanced Auditing)
- Deaktivierte Firewall
- SMBv1 aktiviert
- Zweite Netzwerkkarte
