---
id: az801-ereignisprotokolle
bereich: AZ-801
block: A10
kapitel: Monitoring und Troubleshooting
titel: Ereignisprotokolle und Ereignisweiterleitung
stufe: Profi
quellen: [AZ-801 Study Guide, Microsoft Learn]
verweise: [az801-leistungsueberwachung, az801-log-analytics, az801-ad-replikation]
---

## Profi

### Ereignisanzeige (*Event Viewer*)
**Start**: `eventvwr.msc`. **Zeigt** **Ereignisse** **aus** **Protokollen**.

### Windows-Protokolle
| Protokoll | Inhalt |
|---|---|
| **Anwendung** (*Application*) | **Programme/Dienste** |
| **Sicherheit** (*Security*) | **Anmeldungen, Zugriffe, Richtlinien** **(Überwachung nötig)** |
| **Setup** | **Installation/Rollen** |
| **System** | **Windows-Komponenten, Treiber, Dienste** |
| **Weitergeleitete Ereignisse** (*Forwarded Events*) | **Von anderen Computern** |
| **Anwendungs- und Dienstprotokolle** | **Pro Rolle**, **z. B.** **DFS Replication**, **Directory Service**, **DNS Server**, **Hyper-V-VMMS** |

### Ebenen
**Information**, **Warnung**, **Fehler**, **Kritisch**, **Ausführlich** (*Verbose*), **Erfolgs-/Fehlerüberwachung** **(Sicherheit)**.

### Wichtige Ereignis-IDs
| ID | Bedeutung |
|---|---|
| **4624** | **Erfolgreiche Anmeldung** |
| **4625** | **Fehlgeschlagene Anmeldung** |
| **4634/4647** | **Abmeldung** |
| **4720** | **Benutzerkonto erstellt** |
| **4728/4732/4756** | **Mitglied zu Gruppe hinzugefügt** |
| **4740** | **Konto gesperrt** |
| **4768/4769/4771** | **Kerberos-TGT/Dienstticket/Fehler** |
| **1102** | **Sicherheitsprotokoll gelöscht** |
| **6005/6006** | **Ereignisprotokolldienst gestartet/gestoppt** |
| **6008** | **Unerwartetes Herunterfahren** |
| **41** | **Kernel-Power** **(Absturz/Stromverlust)** |
| **7034/7036** | **Dienst** **abgestürzt/Status** |

### Protokolleinstellungen
- **Standardgröße**: **20 MB** **(Sicherheit** **je nach Version** **größer)**.
- **Bei Erreichen**: **Ereignisse überschreiben**, **archivieren** **oder** **nicht überschreiben**.
- **Über GPO** **zentral**: **Computerkonfiguration → Richtlinien → Administrative Vorlagen → Windows-Komponenten → Ereignisprotokolldienst**.

### Benutzerdefinierte Ansichten (*Custom Views*)
**Filter** **nach** **Zeit, Ebene, Quelle, ID, Computer**. **Speichern** **und** **exportieren** **(XML)**.

### Aufgabe an Ereignis anhängen
**Rechtsklick auf Ereignis → „Aufgabe an dieses Ereignis anfügen“** **→** **Programm/E-Mail/Meldung**.

### Ereignisweiterleitung (*Windows Event Forwarding, WEF*)
**Sammelt** **Ereignisse** **mehrerer Server** **auf einem Sammelserver**.

| Rolle | Erklärung |
|---|---|
| **Quellcomputer** (*Source*) | **Sendet** **Ereignisse** |
| **Sammelcomputer** (*Collector*) | **Empfängt** **in „Weitergeleitete Ereignisse“** |
| **Abonnement** (*Subscription*) | **Was** **von** **wem** **abgeholt** **wird** |

| Abo-Typ | Erklärung |
|---|---|
| **Von Sammler initiiert** (*Collector initiated*) | **Sammler** **holt** **ab** **(wenige Quellen)** |
| **Quell-initiiert** (*Source initiated*) | **Quellen** **melden** **sich**, **per GPO konfiguriert** **(viele Quellen)** |

**Voraussetzungen**:
- **Quelle**: `winrm quickconfig`, **Dienst „Windows-Remoteverwaltung“**.
- **Sammler**: `wecutil qc` (**Ereignissammlungsdienst**).
- **Konto**: **Sammlercomputerkonto** **in** **lokaler Gruppe „Ereignisprotokollleser“** (*Event Log Readers*) **auf** **Quellen**.
- **Firewall**: **WinRM (5985)**.
- **Source-initiiert**: **GPO** **„Zielabonnement-Manager konfigurieren“** **(`Server=http://COLLECTOR:5985/wsman/SubscriptionManager/WEC`)**.

### PowerShell / CLI
```powershell
# Auf SRV01 – Sicherheitsereignisse: Anmeldefehler der letzten 24 h
Get-WinEvent -FilterHashtable @{LogName='Security'; Id=4625; StartTime=(Get-Date).AddHours(-24)} |
  Select-Object TimeCreated, Message -First 10

# Fehler im System-Protokoll
Get-WinEvent -FilterHashtable @{LogName='System'; Level=2; StartTime=(Get-Date).AddDays(-1)}

# Protokolle auflisten und Größe setzen
Get-WinEvent -ListLog * | Where-Object RecordCount -gt 0 | Select-Object LogName, RecordCount
wevtutil sl Security /ms:1073741824      # 1 GiB
wevtutil epl Security C:\Temp\Security.evtx   # Exportieren
wevtutil cl Application                        # Löschen

# Sammlungsserver
wecutil qc /q
# Quellserver (Admin-Shell)
winrm quickconfig -q
Add-LocalGroupMember -Group "Ereignisprotokollleser" -Member "EXA\COLLECTOR$"
```

## Lab
**Maschinen**: **SRV01** (**Quelle**), **COLLECT01** (**Sammler**).

### GUI
1. **SRV01**: **Eingabeaufforderung (Admin)** → `winrm quickconfig`.
2. **SRV01**: **Computerverwaltung → Lokale Benutzer und Gruppen → Gruppen → „Ereignisprotokollleser“ → Hinzufügen** → **Computerkonto COLLECT01$**.
3. **COLLECT01**: **Eingabeaufforderung (Admin)** → `wecutil qc`.
4. **COLLECT01**: **Ereignisanzeige → Abonnements → Rechtsklick → Abonnement erstellen**.
5. **COLLECT01**: **Name, Zielprotokoll „Weitergeleitete Ereignisse“, Abonnementtyp „Von Sammlercomputer initiiert“** → **Computer auswählen: SRV01**.
6. **COLLECT01**: **Ereignisse auswählen** → **System, Ebene Fehler/Kritisch** → **OK**.
7. **COLLECT01**: **Ereignisanzeige → Windows-Protokolle → Weitergeleitete Ereignisse** **prüfen**.

## Einfach

**Ereignisprotokolle** **sind das Tagebuch** **deines Servers**: **„Um 10:03 hat sich Anna angemeldet.“ „Um 10:05 ist ein Dienst abgestürzt.“**

**Ereignisweiterleitung** **ist wie ein Klassenbuch**, **in dem** **alle Lehrer** **ihre Notizen** **sammeln**. **Statt** **20 Tagebücher** **zu lesen**, **liest** **du** **ein** **Sammelbuch**.

**Ereignis-IDs** **sind** **wie Nummern im Fahrplan**: **4625** **heißt „Anmeldung falsch“**, **4740** **heißt** **„Konto gesperrt“**. **Wer** **die Nummern kennt**, **findet** **Probleme** **schneller**.

## Merksatz
- **4624 rein, 4625 falsch, 4740 gesperrt, 1102 gelöscht**.
- **Anwendung – Sicherheit – Setup – System – Weitergeleitet**.
- **Sammler: wecutil qc**, **Quelle: winrm quickconfig**.
- **Ereignisprotokollleser = Leserechte**.
- **Quell-initiiert = viele Quellen per GPO**.

## Prüfungsfalle
- **Sammler-Konto** **in „Ereignisprotokollleser“** **auf** **den Quellen** **(nicht** **umgekehrt)**.
- **Sicherheitsereignisse** **erscheinen** **nur bei aktivierter Überwachung**.
- **Weitergeleitete Ereignisse** **≠** **lokale Protokolle**.
- **Protokoll** **überschreibt** **sich** **standardmäßig**, **bei** **voller Größe**.
- **`Get-WinEvent`** **bevorzugen** **statt** **`Get-EventLog`** **(Legacy)**.
- **Quell-initiiert** **braucht** **GPO** **für** **Abonnement-Manager**.

## Grafik
### Tagebuch
Buch mit Zeitstempeln, Ampeln für Info, Warnung, Fehler.

### Sammelbuch
Viele Server senden Zettel an einen Sammelserver.

### Nummern-Fahrplan
Tafel mit 4624, 4625, 4740, 1102 und Symbolen.

## Befehle
- `Get-WinEvent -FilterHashtable` – Ereignisse filtern
- `wevtutil el / sl / epl / cl` – Protokolle verwalten
- `wecutil qc` – Sammeldienst konfigurieren
- `winrm quickconfig` – Quelle vorbereiten
- `eventvwr.msc` – Ereignisanzeige

## Karteikarten
- F: Welche ID steht für fehlgeschlagene Anmeldung? | A: 4625.
- F: Welche ID steht für gesperrtes Konto? | A: 4740.
- F: Welche ID zeigt gelöschtes Sicherheitsprotokoll? | A: 1102.
- F: Welcher Befehl bereitet den Sammler vor? | A: wecutil qc.
- F: Welcher Befehl bereitet die Quelle vor? | A: winrm quickconfig.
- F: Welche Gruppe braucht der Sammler auf der Quelle? | A: Ereignisprotokollleser.
- F: Welcher Port wird für WinRM (HTTP) genutzt? | A: 5985.
- F: Welche Abo-Art nimmt man für viele Quellen? | A: Quell-initiiert (per GPO).
- F: Welches Cmdlet ersetzt Get-EventLog? | A: Get-WinEvent.

## Quiz
? Welche Ereignis-ID zeigt eine erfolgreiche Anmeldung?
* 4624
- 4625
- 4740
- 1102

? Welche Konfiguration braucht der Sammlercomputer?
* wecutil qc
- winrm delete
- netsh advfirewall reset
- sfc /scannow

? Wo landen weitergeleitete Ereignisse?
* Weitergeleitete Ereignisse
- Anwendung
- Setup
- Sicherheit

? Welche Abo-Art passt zu 500 Quellen per GPO?
* Quell-initiiert
- Von Sammler initiiert
- Manuell
- Keine

? Wer muss in der Gruppe Ereignisprotokollleser sein?
* Das Computerkonto des Sammlers auf den Quellen
- Der Administrator auf dem Sammler
- Alle Benutzer
- Der DC

? Welches Cmdlet ist zeitgemäß zum Filtern von Ereignissen?
* Get-WinEvent
- Get-EventLog
- Show-Log
- Read-Events

? Welche Ereignis-ID zeigt eine Kontosperrung im Sicherheitsprotokoll?
* 4740
- 4624
- 4625
- 1102
! 1102 bedeutet, dass das Sicherheitsprotokoll gelöscht wurde.

? Welcher Dienst muss auf dem Sammlercomputer für die Ereignisweiterleitung laufen?
* Windows-Ereignissammlung (Wecsvc)
- Druckwarteschlange
- DHCP-Client
- Windows Search
! Einrichtung mit wecutil qc.
