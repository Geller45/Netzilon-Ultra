---
id: ap1-a6-applocker
bereich: AP1
block: A6
kapitel: Windows Server
titel: AppLocker & Softwareverteilung per Gruppenrichtlinie
stufe: Fortgeschritten
quellen: [Server_2008_R2_-_70_640_2nd_de.pdf, Identitätsmanagement_mit_Windows_Server_2016_70-742.pdf]
verweise: [ap1-a6-gpo-grundlagen, ap1-a6-gpo-bereich, az801-exploit-wdac, az800-update-monitoring]
---

## Profi

### Anwendungssteuerung – warum?
Ransomware und andere Schadsoftware wird meist als **Programm gestartet** (E-Mail-Anhang, Download, USB-Stick). **Anwendungssteuerung** (Application Whitelisting) erlaubt nur **zugelassene** Programme – alles andere wird blockiert. Das BSI und Microsoft zählen Whitelisting zu den wirksamsten Schutzmaßnahmen.

### Software Restriction Policies (SRP) – Legacy
Die ältere Technik (seit XP) mit Regeln nach Pfad, Hash, Zertifikat und Netzwerkzone. **Veraltet** – durch AppLocker und WDAC ersetzt.

### AppLocker
Konfiguration per **GPO**: `Computerkonfiguration → Richtlinien → Windows-Einstellungen → Sicherheitseinstellungen → Anwendungssteuerungsrichtlinien → AppLocker`
**Voraussetzung**: Dienst **Anwendungsidentität** (AppIDSvc) muss **laufen** (per GPO auf „Automatisch“ setzen) – sonst werden Regeln nicht durchgesetzt. Verfügbar in Windows Enterprise/Education und Windows Server (nicht Pro, Stand der Richtliniendurchsetzung beachten).

**Regelsammlungen**
| Sammlung | Dateitypen |
|---|---|
| Ausführbare Dateien | .exe, .com |
| Windows Installer | .msi, .msp, .mst |
| Skripts | .ps1, .bat, .cmd, .vbs, .js |
| Gepackte Apps | Store-Apps (.appx/.msix) |
| DLL-Regeln | .dll, .ocx (optional, Performance-Kosten) |

**Regelbedingungen**
| Bedingung | Beschreibung | Bewertung |
|---|---|---|
| **Herausgeber** (Publisher) | digitale Signatur: Herausgeber, Produktname, Dateiname, **Version** (z. B. „Adobe, Acrobat Reader, ≥ Version X“) | **empfohlen** – übersteht Updates |
| **Pfad** | Ordner/Datei (`%PROGRAMFILES%\*`, `%WINDIR%\*`) | einfach, aber unsicher, wenn Benutzer in den Pfad schreiben können |
| **Dateihash** | kryptografischer Hash der Datei | sehr genau, aber nach jedem Update neu nötig |

**Standardregeln** („Standardregeln erstellen“): Jeder darf aus **%WINDIR%** und **%PROGRAMFILES%** ausführen, **Administratoren alles** – damit sich Windows nicht selbst aussperrt. Danach gilt: **Was nicht erlaubt ist, ist verboten** (sobald eine Sammlung Regeln enthält).
**Ausnahmen** innerhalb von Regeln möglich (z. B. Pfad %WINDIR% erlaubt, aber `%WINDIR%\Temp\*` ausgenommen). **Verweigern-Regeln** haben Vorrang vor Zulassen.
Regeln können an **Benutzer/Gruppen** gebunden werden (z. B. Entwickler dürfen mehr).

**Erzwingungsmodus**: pro Sammlung **„Nur überwachen“** (Audit) oder **„Regeln erzwingen“**. **Immer zuerst überwachen**, Ereignisse auswerten (Ereignisanzeige → Anwendungs- und Dienstprotokolle → Microsoft → Windows → **AppLocker** → EXE und DLL; ID 8003 = wäre blockiert, 8004 = blockiert), dann erzwingen.
**Regeln automatisch generieren**: Assistent scannt einen Referenzordner und erstellt Herausgeber-/Hashregeln.

### Ausblick: App Control for Business (WDAC)
Der Nachfolger **Windows Defender Application Control** (heute „App Control for Business“) arbeitet im **Kernel**, gilt für **alle Benutzer inkl. Administratoren**, unterstützt Code-Integrität für Treiber und ist deutlich manipulationssicherer. Microsoft empfiehlt WDAC für neue Projekte; AppLocker bleibt für benutzerbezogene Regeln sinnvoll (Kombination möglich). Details → AZ-801 Sicherheit.

### Softwareverteilung per Gruppenrichtlinie
Über die GPO-Erweiterung **Softwareinstallation** können **MSI-Pakete** automatisch verteilt werden:
`Computer- oder Benutzerkonfiguration → Richtlinien → Softwareeinstellungen → Softwareinstallation`

**Voraussetzungen**:
- Paket im Format **.msi** (Windows Installer); .exe-Installer gehen nicht direkt (nur .zap für „Veröffentlichen“, veraltet).
- Ablage auf einer **Freigabe** mit **UNC-Pfad** (`\\SRV01\Software\7zip.msi`) – **kein lokaler Pfad** (C:\...)! Freigabe-/NTFS-Rechte: **Lesen** für **Domänencomputer** (Computerzuweisung) bzw. Benutzer.

**Bereitstellungsarten**
| Art | Konfiguration | Verhalten |
|---|---|---|
| **Zugewiesen – Computer** | Computerkonfiguration | Installation beim **nächsten Start** des Computers, für alle Benutzer – **empfohlen** |
| **Zugewiesen – Benutzer** | Benutzerkonfiguration | Verknüpfung erscheint; Installation bei erster Nutzung oder bei Anmeldung (Option „bei Anmeldung installieren“) |
| **Veröffentlicht – Benutzer** | nur Benutzerkonfiguration | Anwendung erscheint in **Systemsteuerung → Programme → „Programm vom Netzwerk installieren“** zur freiwilligen Installation |

Weitere Optionen: **Upgrade** (neue Version ersetzt alte), **Entfernen** („Software sofort deinstallieren“ oder „Benutzer dürfen weiter verwenden“), **„Anwendung entfernen, wenn sie außerhalb des Verwaltungsbereichs liegt“** (Computer verlässt die OU → Deinstallation), **Transformationsdateien (.mst)** für Anpassungen, Kategorien.

**Wichtig**: Softwareinstallation ist eine **Vordergrund-CSE** → wird nur beim **Start/Anmeldung** verarbeitet (`gpupdate` reicht nicht, **Neustart**!), wird bei **langsamen Verbindungen** übersprungen.

**Grenzen und heutige Alternativen**: keine Rückmeldung/Reporting, nur MSI, keine Abhängigkeiten, keine Zeitsteuerung. In der Praxis: **Microsoft Configuration Manager (SCCM/MECM)**, **Intune**, **winget**/Paketmanager, **PDQ Deploy**, Skripte per GPO-Startskript. Für Windows-Updates: **WSUS**/Windows Update for Business.

## Lab
**Maschinen**: DC01, SRV01 (Freigabe „Software“), CL01 (Windows 11 Enterprise, in OU Schulung\Computer).

### GUI – Softwareverteilung
1. **SRV01**: Ordner `D:\Software` → Freigabe **Software** (Authentifizierte Benutzer: Lesen) → NTFS: **Domänencomputer: Lesen** → MSI-Paket (z. B. `7z-x64.msi`) hineinkopieren.
2. **DC01**: `gpmc.msc` → GPO **„SW – 7-Zip“** an OU Schulung\Computer → Bearbeiten → **Computerkonfiguration** → Richtlinien → Softwareeinstellungen → **Softwareinstallation** → Rechtsklick → Neu → **Paket** → Pfad über **Netzwerk** wählen: `\\SRV01\Software\7z-x64.msi` → **Zugewiesen**.
3. Paket → Eigenschaften → Bereitstellung → Haken „**Anwendung entfernen, wenn sie außerhalb des Verwaltungsbereichs liegt**“.
4. **CL01**: **Neustart** (ggf. zweimal) → 7-Zip ist installiert. Kontrolle: `gpresult /r` (Computereinstellungen).
5. **Veröffentlichen testen**: Zweites GPO an OU Benutzer → **Benutzerkonfiguration** → Softwareinstallation → Paket → **Veröffentlicht** → **CL01**: Systemsteuerung → Programme → **Programm vom Netzwerk installieren**.

### GUI – AppLocker
6. **DC01**: GPO **„AppLocker Clients“** an OU Schulung\Computer → Computerkonfiguration → Richtlinien → Windows-Einstellungen → Sicherheitseinstellungen → **Systemdienste** → **Anwendungsidentität** → Automatisch.
7. Anwendungssteuerungsrichtlinien → **AppLocker** → Ausführbare Regeln → Rechtsklick **Standardregeln erstellen**; ebenso für Skripts und Windows Installer.
8. Ausführbare Regeln → **Neue Regel** → **Verweigern** → Benutzer „Jeder“ (bzw. GG-Schueler) → Bedingung **Pfad** → `%OSDRIVE%\Users\*\Downloads\*` → Name „Keine EXE aus Downloads“.
9. AppLocker → Eigenschaften → **Erzwingung**: Ausführbare Regeln **konfiguriert – Nur überwachen**.
10. **CL01**: Neustart → Programm aus Downloads starten → läuft, aber Ereignis **8003** in `Microsoft-Windows-AppLocker/EXE and DLL`.
11. **DC01**: Erzwingung auf **Regeln erzwingen** → **CL01**: Neustart → Start aus Downloads wird **blockiert** (Ereignis 8004).

### PowerShell
```powershell
# Auf DC01 – Software-GPO anlegen (Paket selbst per GUI zuweisen)
New-GPO "SW – 7-Zip" | New-GPLink -Target "OU=Computer,OU=Schulung,DC=contoso,DC=local"

# Auf CL01 – AppLocker-Status und Test
Get-Service AppIDSvc
Get-AppLockerPolicy -Effective -Xml | Out-File C:\Temp\applocker.xml
Test-AppLockerPolicy -XmlPolicy C:\Temp\applocker.xml -Path "$env:USERPROFILE\Downloads\tool.exe" -User contoso\sch.anna
Get-WinEvent -LogName "Microsoft-Windows-AppLocker/EXE and DLL" -MaxEvents 10 | Format-Table TimeCreated, Id, Message -Wrap

# Regeln aus einem Referenzordner generieren (auf einem Referenz-PC)
Get-AppLockerFileInformation -Directory "C:\Program Files\7-Zip" -Recurse |
  New-AppLockerPolicy -RuleType Publisher, Hash -User Jeder -Optimize -Xml | Out-File C:\Temp\7zip-regeln.xml

# Installierte Software prüfen (Softwareverteilung)
Get-Package -Name "7-Zip*"
winget install --id 7zip.7zip -e     # moderne Alternative
```

## Einfach

**AppLocker** ist wie eine **Gästeliste für Programme**. Am Computer steht ein Türsteher, der bei jedem Programm, das starten will, nachschaut: „Stehst du auf der Liste?“ Nur erlaubte Programme kommen rein – der Virus aus dem E-Mail-Anhang steht nicht auf der Liste und bleibt draußen.

**Wie erkennt der Türsteher ein Programm?**
- **Herausgeber**: am **Firmenstempel** (digitale Signatur) – „Alles von Microsoft darf rein.“ Das ist am besten, weil es auch nach Updates noch passt.
- **Pfad**: am **Wohnort** – „Alles aus dem Programme-Ordner darf rein.“ Einfach, aber gefährlich, wenn jeder dort etwas ablegen kann.
- **Hash**: am **Fingerabdruck** – ganz genau, aber nach jedem Update ist der Fingerabdruck anders.

**Standardregeln** sorgen dafür, dass Windows sich nicht selbst aussperrt. Und ganz wichtig: Erst **„Nur beobachten“** einschalten und schauen, was blockiert **würde** – sonst kann plötzlich niemand mehr arbeiten!

**Softwareverteilung per GPO** ist wie ein **Lieferdienst**: Du legst das Installationspaket (MSI) in eine Freigabe und sagst per Gruppenrichtlinie: „Alle Computer in dieser OU bekommen 7-Zip.“ Beim nächsten **Neustart** wird es automatisch installiert – du musst nicht an jeden PC laufen.
- **Zugewiesen** = „Das **musst** du haben“ (wird installiert).
- **Veröffentlicht** = „Das **darfst** du dir nehmen“ (steht im Katalog zur freiwilligen Installation).

Heute nutzen große Firmen dafür lieber Profi-Werkzeuge wie **Intune** oder **Configuration Manager**, weil die auch melden, ob alles geklappt hat.

## Merksatz
- AppLocker braucht den Dienst **Anwendungsidentität**.
- Regeltypen: **Herausgeber > Pfad / Hash** (Herausgeber bevorzugen).
- Erst **überwachen**, dann **erzwingen**.
- Softwareverteilung: **MSI + UNC-Pfad + Domänencomputer Lesen**.
- **Zugewiesen** (Pflicht) vs. **Veröffentlicht** (nur Benutzer, freiwillig) – wirkt nach **Neustart/Anmeldung**.

## Prüfungsfalle
- Lokaler Pfad (C:\Pakete) in der Softwareinstallation → Clients finden das Paket nicht.
- Computer können nur **zugewiesen** werden – **Veröffentlichen** geht nur für Benutzer.
- Ohne laufenden Anwendungsidentitätsdienst wirken AppLocker-Regeln nicht.
- Ohne Standardregeln sperrt man ggf. Windows-Komponenten aus.
- Softwareinstallation per GPO nur mit .msi.

## Grafik
### Programm-Türsteher
Programme (EXE-Symbole mit Stempel/Wohnort/Fingerabdruck) stehen Schlange; der Türsteher prüft Herausgeber, Pfad, Hash; ein unsigniertes Programm aus „Downloads“ wird abgewiesen. Umschalter „Nur überwachen“: es darf rein, aber ein Notizbuch-Eintrag (Ereignis 8003) erscheint.

### Lieferdienst Software
DC schickt ein GPO an eine OU; beim Neustart der Clients fährt ein Lieferwagen vom Fileserver (UNC) los und installiert das Paket; „Zugewiesen“ liefert direkt, „Veröffentlicht“ legt es ins Schaufenster.

## Karteikarten
- F: Was ist AppLocker? | A: Anwendungssteuerung per GPO – erlaubt/verbietet Programme, Skripte, Installer, Apps, DLLs.
- F: Welcher Dienst muss für AppLocker laufen? | A: Anwendungsidentität (AppIDSvc).
- F: Drei AppLocker-Regelbedingungen? | A: Herausgeber, Pfad, Dateihash.
- F: Welche Bedingung ist zu bevorzugen und warum? | A: Herausgeber – bleibt nach Updates gültig und ist schwer zu fälschen.
- F: Was bewirken die AppLocker-Standardregeln? | A: Ausführung aus %WINDIR% und %PROGRAMFILES% für alle, alles für Administratoren.
- F: Welche Ereignis-IDs zeigen „wäre blockiert“ und „blockiert“? | A: 8003 (Überwachung) und 8004 (erzwungen blockiert).
- F: Nachfolger/Ergänzung von AppLocker? | A: App Control for Business (WDAC).
- F: Welches Paketformat verteilt die GPO-Softwareinstallation? | A: .msi (Windows Installer).
- F: Unterschied zugewiesen und veröffentlicht? | A: Zugewiesen: wird installiert (Computer/Benutzer). Veröffentlicht: nur Benutzer, freiwillig über „Programm vom Netzwerk installieren“.
- F: Warum UNC-Pfad für MSI-Pakete? | A: Clients müssen das Paket über das Netzwerk erreichen; lokale Pfade existieren auf ihnen nicht.
- F: Wann wird zugewiesene Computersoftware installiert? | A: Beim nächsten Neustart (Vordergrundverarbeitung).

## Quiz
? Welche Voraussetzung ist für AppLocker zwingend?
* Der Dienst Anwendungsidentität muss laufen
- Der Druckspooler muss laufen
- BitLocker muss aktiv sein
- Der Client muss IPv6 nutzen

? Welche AppLocker-Bedingung bleibt nach einem Software-Update am ehesten gültig?
* Herausgeber
- Dateihash
- Dateigröße
- Erstellungsdatum

? Wie kann ein MSI-Paket einem Computer per GPO bereitgestellt werden?
* Zugewiesen in der Computerkonfiguration
- Veröffentlicht in der Computerkonfiguration
- Über die Kontosperrungsrichtlinie
- Über die DNS-Weiterleitung

? Nach dem Anlegen einer Softwareinstallations-GPO und gpupdate ist die Software auf dem Client noch nicht installiert. Warum?
* Softwareinstallation wird erst beim Neustart/bei der Anmeldung verarbeitet
- gpupdate löscht Softwarepakete
- Die Software muss erst im DNS eingetragen werden
- MSI-Pakete funktionieren nur auf Servern

? Warum sollte AppLocker zuerst im Modus „Nur überwachen“ laufen?
* Um zu sehen, welche Programme blockiert würden, bevor Benutzer ausgesperrt werden
- Weil erzwungene Regeln nicht funktionieren
- Weil sonst die Standardregeln gelöscht werden
- Um Lizenzkosten zu sparen

? Welche Regeltypen bietet AppLocker?
* Herausgeber, Pfad und Dateihash
- Nur Dateiname
- Nur IP-Adresse
- Benutzerkennwort
! Herausgeberregeln basieren auf der digitalen Signatur.

? Welcher Dienst muss für AppLocker auf den Clients laufen?
* Anwendungsidentität (AppIDSvc)
- Druckwarteschlange
- DHCP-Client
- Windows Search
! Ohne laufenden Dienst werden die Regeln nicht durchgesetzt.

? Was ist der Unterschied zwischen „Zuweisen“ und „Veröffentlichen“ bei der Softwareverteilung per GPO?
* Zuweisen installiert automatisch, Veröffentlichen bietet die Software nur zur Installation an (nur Benutzer).
- Es gibt keinen Unterschied.
- Veröffentlichen installiert sofort, Zuweisen nie.
- Zuweisen gilt nur für EXE-Dateien.
! Veröffentlichen ist nur in der Benutzerkonfiguration möglich.
