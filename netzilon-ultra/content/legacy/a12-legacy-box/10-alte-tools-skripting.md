---
id: legacy-tools-skripting
bereich: Legacy
block: A12
kapitel: Legacy-Box
titel: Alte Verwaltungstools und Skriptsprachen (CMD, VBScript, WMIC, PowerShell 2.0)
stufe: Fortgeschritten
quellen: [Microsoft Learn Deprecated Features, VBScript-to-PowerShell Guide, eigene Zusammenstellung]
verweise: [ap1-a6-powershell, ap2-skripte-sql, legacy-streichliste-2025, az800-automation-dsc]
---

## Profi

### Übersicht
| Legacy | Wofür | Status (Stand 09/2026) | Ersatz |
|---|---|---|---|
| **Batch/CMD** (`.bat`, `.cmd`) | Einfache Skripte, Windows-Boot-/Setup-Umgebung | **Nicht abgekündigt**, aber sehr begrenzt | **PowerShell** |
| **VBScript** (`.vbs`, `cscript`/`wscript`) | Verwaltungsskripte, Anmeldeskripte | **Deprecated**, nur noch als **Feature on Demand**, wird entfernt | **PowerShell** |
| **WMIC** (`wmic.exe`) | Abfragen über WMI | **Deprecated**, in neueren Windows-11-Versionen nur noch als **Feature on Demand** (standardmäßig aus), wird ganz entfernt | `Get-CimInstance` |
| **Windows PowerShell 2.0** | Alte Engine | **Entfernt** in Windows 11 24H2 / Server 2025 | **Windows PowerShell 5.1**, besser **PowerShell 7** |
| **cscript ADSI/WMI-Skripte** | AD- und System-Abfragen | Legacy | **ActiveDirectory-Modul**, `Get-CimInstance` |
| **NET.EXE** (`net use`, `net user`) | Freigaben/Benutzer | Weiter vorhanden, aber Legacy-Stil | `New-SmbMapping`, `New-LocalUser` |
| **Telnet-Client, Rcmd** | Fernzugriff | Legacy | **SSH**, **PowerShell Remoting** |
| **Netsh** (Teile) | Netzwerkkonfiguration | Teilweise ersetzt | `NetTCPIP`-Modul (`Get-NetIPAddress`), `NetAdapter` |
| **Internet Explorer** | Browser, ActiveX | **Ausgemustert 06/2022** | **Edge (IE-Modus)** |
| **WSUS** | Update-Server | **Deprecated** (Funktion bleibt unterstützt) | **Windows Update for Business**, **Intune/Autopatch**, **Azure Update Manager** |
| **MDT / WDS-Imaging** | Deployment | **MDT eingestellt (01/2024)** | **Autopilot**, **Intune**, **Configuration Manager** |

### Warum PowerShell besser ist
| Merkmal | CMD/VBScript | **PowerShell** |
|---|---|---|
| Ausgabe | **Text** | **Objekte** (Eigenschaften, Methoden) |
| Pipeline | Nur Text-Filter | **Objekt-Pipeline** |
| Zugriff | `wmic` / ADSI | **CIM/WMI**, **.NET**, **REST** |
| Remoting | Kein/`psexec` | **WinRM/SSH**, `Invoke-Command` |
| Fehlerbehandlung | `%ERRORLEVEL%` | `try/catch`, `-ErrorAction` |
| Sicherheit | Keine | **Ausführungsrichtlinie**, **signierte Skripte**, **JEA**, **AMSI** |
| Plattform | Nur Windows | **PowerShell 7 plattformübergreifend** |

### Übersetzung typischer WMIC-Befehle
| Legacy (WMIC) | Modern (PowerShell) |
|---|---|
| `wmic os get caption,version` | `Get-CimInstance Win32_OperatingSystem \| Select Caption, Version` |
| `wmic cpu get name` | `Get-CimInstance Win32_Processor \| Select Name` |
| `wmic bios get serialnumber` | `Get-CimInstance Win32_BIOS \| Select SerialNumber` |
| `wmic logicaldisk get size,freespace,caption` | `Get-CimInstance Win32_LogicalDisk \| Select DeviceID, Size, FreeSpace` |
| `wmic process list brief` | `Get-Process` bzw. `Get-CimInstance Win32_Process` |
| `wmic product get name` | `Get-Package` (bzw. Registry, **nicht** `Win32_Product`: löst MSI-Reparaturen aus) |
| `wmic /node:SRV01 os get lastbootuptime` | `Get-CimInstance Win32_OperatingSystem -ComputerName SRV01 \| Select LastBootUpTime` |

### PowerShell 2.0 und Downgrade-Angriff
Angreifer starten `powershell -version 2`, um **AMSI, Script-Block-Logging und Constrained Language Mode** zu **umgehen**. Deshalb:
- **Feature entfernen**: `Disable-WindowsOptionalFeature -Online -FeatureName MicrosoftWindowsPowerShellV2Root`
- Ab **Server 2025** ist es **entfernt**.

### Ausführungsrichtlinie (PowerShell)
| Stufe | Wirkung |
|---|---|
| **Restricted** | Keine Skripte (Client-Standard) |
| **AllSigned** | Nur signierte Skripte |
| **RemoteSigned** | Lokale ohne, Downloads mit Signatur (Server-Standard) |
| **Unrestricted/Bypass** | Alles läuft (Bypass ohne Warnung) |
Keine Sicherheitsgrenze, sondern **Schutz vor Versehen**.

### Migrationsvorgehen (Anmeldeskripte)
1. **Inventarisieren**: Alle `*.bat`, `*.vbs`, `*.kix` in **NETLOGON** und GPO-Anmeldeskripten sammeln.
2. **Funktion pro Skript** dokumentieren (Laufwerke, Drucker, Registry).
3. **Ersetzen**: Laufwerke → **GPO-Preferences**, Drucker → **Printer-Verwaltung/GPP**, Registry → GPP, sonst **PowerShell**.
4. **Testen** in Pilot-OU, dann Rollout.

## Lab
**Maschinen**: **CL01** (Windows-Client), **DC01** (NETLOGON, GPO).

### GUI
1. **CL01**: **Start → cmd** → `wmic os get caption` (falls installiert) und danach **PowerShell** → `Get-CimInstance Win32_OperatingSystem`.
2. **CL01**: **Einstellungen → System → Optionale Features → WMIC** (falls installiert) anzeigen; auf neueren Systemen fehlt es.
3. **CL01**: Systemsteuerung → **Windows-Features aktivieren** → **Windows PowerShell 2.0** (falls vorhanden) **abwählen**.
4. **DC01**: **Explorer** → `\\firma.local\NETLOGON` → alle `.bat/.vbs` auflisten.
5. **DC01**: **GPMC** → GPO bearbeiten → **Benutzerkonfiguration → Einstellungen → Windows-Einstellungen → Laufwerkszuordnungen** (Ersatz für `net use`).
6. **CL01**: `powershell -version 2` testen (falls Fehler: nicht mehr vorhanden = gut).

### PowerShell
```powershell
# Auf CL01 – Legacy-Feature prüfen und entfernen
Get-WindowsOptionalFeature -Online -FeatureName MicrosoftWindowsPowerShellV2Root
Disable-WindowsOptionalFeature -Online -FeatureName MicrosoftWindowsPowerShellV2Root -NoRestart

# Auf DC01 – Skripte im NETLOGON auflisten
Get-ChildItem "\\firma.local\NETLOGON" -Include *.bat,*.cmd,*.vbs -Recurse |
  Select-Object FullName, LastWriteTime

# Auf CL01 – Beispiel: VBScript-Netzlaufwerk → PowerShell
# Alt (VBS): objNetwork.MapNetworkDrive "H:", "\\SRV01\Home"
New-SmbMapping -LocalPath H: -RemotePath \\SRV01\Home -Persistent $true

# Auf CL01 – CIM statt WMIC
Get-CimInstance Win32_OperatingSystem | Select-Object Caption, Version, LastBootUpTime
```

## Befehle
- `Get-CimInstance Win32_OperatingSystem` – Ersatz für `wmic os`
- `Get-Command -Module ActiveDirectory` – AD-Cmdlets (Ersatz für ADSI-Skripte)
- `$PSVersionTable` – PowerShell-Version
- `Get-ExecutionPolicy -List` – Ausführungsrichtlinien pro Bereich
- `Disable-WindowsOptionalFeature … MicrosoftWindowsPowerShellV2Root` – PS 2.0 entfernen
- `Get-WindowsCapability -Online \| Where Name -like "VBSCRIPT*"` – VBScript als Feature on Demand

## Einfach

Stell dir vor, du bist **Hausmeister** und musst 100 Klassenzimmer kontrollieren.

**Batch/CMD** ist ein **Zettel mit Stichwörtern**: „Licht aus, Fenster zu.“ Du kannst nur einfache Sachen.

**VBScript** ist ein **Schweizer Taschenmesser aus den 90ern**: Es kann mehr, aber es ist **rostig**, und Einbrecher benutzen es gern, weil es **fast jeder Rechner** noch hat.

**PowerShell** ist der **moderne Werkzeugkasten mit Beschriftung**. Statt „Text“ liefert er **geordnete Kisten mit Etiketten** (Objekte): Wenn du ein Zimmer fragst, bekommst du nicht „Zimmer 5, an, zu“, sondern eine **Karte** mit Feldern: Licht = an, Fenster = zu, Temperatur = 21 °C. Damit kannst du **filtern, sortieren, weitergeben**.

**WMIC** war ein **Automat**, dem man Fragen zurufen kann („Wie viel RAM?“). Er wird abgeschaltet. Der neue Automat heißt **`Get-CimInstance`**.

**PowerShell 2.0** ist das **uralte Modell des Werkzeugkastens** ohne Sicherheitsschloss. Ein Dieb sagt: „Ich nehme das alte Modell!“ und umgeht dein Schloss. Darum **wirft man es weg** (Feature entfernen).

## Merksatz
- **CMD/VBS/WMIC = Legacy → PowerShell/CIM.**
- **PowerShell = Objekte, CMD = Text.**
- **`Get-CimInstance` ersetzt `wmic`.**
- **PS 2.0 entfernen** (Downgrade-Angriff).
- **Ausführungsrichtlinie ist keine Sicherheitsgrenze.**
- **Nicht `Win32_Product` abfragen**, führt MSI-Konsistenzprüfungen aus.

## Prüfungsfalle
- **RemoteSigned** ist Standard auf **Servern**, **Restricted** auf **Clients**.
- **Bypass** ist keine „Sicherheit“, nur „keine Warnung“.
- **CMD ist nicht abgekündigt**, VBScript und WMIC dagegen schon.
- **PowerShell 5.1** ≠ **PowerShell 7**: 5.1 ist in Windows enthalten (nur Windows), **7 ist separat**, plattformübergreifend.
- **`-version 2`** startet die alte Engine; darum aus Sicherheitsgründen **nicht installiert lassen**.

## Grafik
### Werkzeugkasten
Drei Werkzeugkästen nebeneinander (Zettel, Taschenmesser, Profikasten). Ein Befehl läuft durch jede Spur: CMD liefert Text, PowerShell liefert eine Objektkarte, die sich weitergeben lässt.

### Downgrade-Angriff
Ein Wachdienst (AMSI) steht vor einer Tür. Der Angreifer nimmt eine Seitentür „PowerShell 2.0“, an der kein Wachdienst steht. Schalter „PS 2.0 entfernen“ mauert die Tür zu.

## Karteikarten
- F: Womit ersetzt man `wmic os get caption`? | A: `Get-CimInstance Win32_OperatingSystem \| Select Caption`
- F: Was ist der Hauptunterschied CMD/PowerShell? | A: CMD liefert Text, PowerShell Objekte.
- F: Welcher Status hat VBScript? | A: Deprecated, nur noch Feature on Demand.
- F: Welche PowerShell-Engine wurde in Server 2025 entfernt? | A: Windows PowerShell 2.0.
- F: Warum ist PowerShell 2.0 gefährlich? | A: Umgeht AMSI, Script-Block-Logging und Constrained Language Mode (Downgrade-Angriff).
- F: Welche Ausführungsrichtlinie gilt Standard auf Servern? | A: RemoteSigned.
- F: Standard-Ausführungsrichtlinie auf Clients? | A: Restricted.
- F: Ist die Ausführungsrichtlinie eine Sicherheitsgrenze? | A: Nein, nur ein Schutz vor Versehen.
- F: Womit ersetzt man `net use` in GPOs? | A: Mit GPO-Preferences (Laufwerkszuordnungen).
- F: Wovon löst Windows Update for Business/Intune WSUS ab? | A: Vom lokalen WSUS (Deprecated).
- F: Wovon löst Autopilot MDT ab? | A: Vom Microsoft Deployment Toolkit (eingestellt 01/2024).
- F: Wie zeigt man die PowerShell-Version? | A: `$PSVersionTable`

## Quiz
? Was ersetzt WMIC?
* Get-CimInstance
- Get-Service
- cscript
- netsh

? Welche Engine wurde in Windows Server 2025 entfernt?
* Windows PowerShell 2.0
- PowerShell 5.1
- PowerShell 7
- CMD

? Was liefert PowerShell in der Pipeline im Gegensatz zu CMD?
* Objekte
- Nur Text
- Binärdateien
- Bilder

? Welche Ausführungsrichtlinie ist bei Windows Server standardmäßig gesetzt?
* RemoteSigned
- Restricted
- AllSigned
- Bypass

? Warum sollte PowerShell 2.0 deaktiviert werden?
* Downgrade-Angriffe umgehen AMSI und Logging
- Es benötigt zu viel RAM
- Es funktioniert nur mit IPv6
- Es ist lizenzpflichtig

? Womit lassen sich Netzlaufwerke per Gruppenrichtlinie statt per net use zuordnen?
* GPO-Preferences (Laufwerkszuordnungen)
- WSUS
- DFS-R
- Robocopy
