---
id: ap1-a6-powershell
bereich: AP1
block: A6
kapitel: Windows Server
titel: PowerShell – Grundlagen
stufe: Einsteiger
quellen: [01-Einführung.pdf, Übung1_Powershell.pdf, Übung1_Powershell_Loesung.pdf]
verweise: [az800-powershell-remoting, ap1-a6-adds, ap1-a4-routing]
---

## Profi

### Was ist PowerShell?
PowerShell ist eine **Eingabeaufforderung mit integrierter Skriptsprache**, basiert auf **.NET** und ist **objektorientiert**. Sie dient der **Automatisierung administrativer Aufgaben** (Benutzer anlegen, Server konfigurieren, Berichte erzeugen) und ist die Grundlage für viele GUI-Werkzeuge (Server-Manager, Windows Admin Center führen im Hintergrund PowerShell aus).
| Version | Name | Basis | Hinweis |
|---|---|---|---|
| 5.1 | **Windows PowerShell** | .NET Framework | in Windows vorinstalliert, wird nur noch gepflegt |
| 7.x | **PowerShell** (plattformübergreifend) | .NET (Core) | Windows, Linux, macOS; separat installieren (`winget install Microsoft.PowerShell`) |
- **PowerShell ISE**: integrierte Entwicklungsumgebung (Skripteditor + Konsole) für 5.1 – auf Servern ggf. als Feature nachzuinstallieren, wird **nicht mehr weiterentwickelt** → Empfehlung: **Visual Studio Code** mit PowerShell-Erweiterung.
- **Erweiterbar** über **Module** (heute Standard) und **PSSnapins** (veraltet). Module werden z. B. mit Rollen installiert (ActiveDirectory, DnsServer, DhcpServer) oder aus der **PowerShell Gallery** geladen (`Install-Module`).

### Befehle (Cmdlets)
- PowerShell-Befehle heißen **Cmdlets** („Commandlets“) und bestehen **immer aus Verb-Substantiv**: `Get-Service`, `Stop-Process`, `New-ADUser`. Zugelassene Verben: `Get-Verb`.
- **Alte Kommandos** (dir, cd, copy, del, cls) funktionieren weiter – sie sind als **Aliase** implementiert (dir → Get-ChildItem); **Parameter unterscheiden sich** teilweise (`dir /s` erzeugt einen Fehler, richtig: `dir -Recurse`).
- **Externe Programme** (ipconfig, netsh, ping, gpupdate) lassen sich direkt aufrufen.

### Hilfe und Suche
- `Get-Help <Cmdlet>` – Hilfe; `-Detailed` (ausführlicher), `-Examples` (nur Beispiele), `-Full` (vollständig), `-Online`. Einmalig `Update-Help` als Administrator.
- **About-Themen** (wie Manpages) zu Konzepten: `Get-Help about_*`, z. B. `about_Variables`, `about_Common_Parameters`.
- `Get-Command` – verfügbare Befehle; `-Verb out`, `-Noun Service`, Platzhalter `Get-Command *event*`, `-Module DnsServer`.

### PSDrives und Provider
Nicht nur Dateisysteme sind „Laufwerke“: `Get-PSDrive` zeigt u. a. `C:`, `HKLM:` (Registry), `Env:` (Umgebungsvariablen), `Alias:`, `Cert:` (Zertifikate), `AD:` (Active Directory, mit Modul). Man navigiert darin mit cd/dir.
- `New-PSDrive -Name X -PSProvider FileSystem -Root \\srv01\Daten` – neues PSDrive (Provider: `Get-PSProvider`)
- `Remove-PSDrive X`

### Aliase
Kurzname für Cmdlets: `Get-Alias` bzw. `dir Alias:`; `New-Alias np notepad`; löschen mit `del Alias:np`; Export/Import mit `Export-Alias`/`Import-Alias`. In Skripten **ausgeschriebene Cmdlets** verwenden (Lesbarkeit).

### Module
- `Get-Module` – geladene Module; `Get-Module -ListAvailable` – verfügbare.
- `Import-Module <Name>` (seit PS 3 meist automatisch), `Remove-Module`.
- Suchpfade: `$env:PSModulePath` bzw. `Type Env:\PSModulePath`.
- (Veraltet: `Get-PSSnapin -Registered`, `Add-PSSnapin`.)

### Objekte und Pipeline
In anderen Shells wird **Text** weitergegeben, PowerShell übergibt **Objekte** über die **Pipeline** (`|`). Objekte (Prozess, Dienst, Datei) haben **Eigenschaften** (Name, Status, Length) und **Methoden** (Stop(), Delete()).
- `Get-Member` (gm) listet Eigenschaften und Methoden: `Get-Service | Get-Member -MemberType Properties`.
- Alle Eigenschaften ansehen: `Get-Service | Format-List *`.
- **Filtern**: `Where-Object` (`Get-Service | Where-Object Status -eq Running`)
- **Auswählen**: `Select-Object Name, Status` / `-First 10`
- **Sortieren**: `Sort-Object Status -Descending`
- **Gruppieren/Zählen**: `Group-Object`, `Measure-Object`
- **Schleife**: `ForEach-Object { $_.Name }` – `$_` bzw. `$PSItem` ist das aktuelle Objekt
- Achtung: **Format-Cmdlets „machen Objekte kaputt“** – nach `Format-Table`/`Format-List` entsteht nur noch Formatierungsausgabe; sie gehören **ans Ende** der Pipeline.

### Ausgabe formatieren und umleiten
- `Format-Table` (ft, Standard), `Format-List` (fl, mehr Eigenschaften), `Format-Wide` (fw, eine Eigenschaft in Spalten); berechnete Spalten: `@{Label="TotalMemory"; Expression={$_.VM + $_.PM}}`.
- Umleiten: `Out-File`, `Out-Printer`, `Out-Host`, `Out-Null` (verwerfen), **`Out-GridView`** (interaktive Tabelle mit Filter/Sortierung; auf Server Core nicht verfügbar).
- Konvertieren: `ConvertTo-Csv`/`Export-Csv`, `ConvertTo-Html`, `ConvertTo-Json`, `ConvertTo-Xml`, `ConvertTo-SecureString`.

### Common Parameters
Die meisten Cmdlets unterstützen allgemeine Parameter (`Get-Help about_CommonParameters`):
- **`-WhatIf`**: zeigt, was **passieren würde** – ohne es auszuführen (ideal vor Massenänderungen).
- **`-Confirm`**: fordert für jedes Objekt eine Bestätigung an.
- `-Verbose`, `-ErrorAction Stop|SilentlyContinue`, `-OutVariable`.

### Profile
Profilskripte laden bei jedem Start automatisch Anpassungen (Module, Aliase, PSDrives, Funktionen). **Nicht** geladen in Remotesitzungen, eingebetteten Shells und wenn die **Ausführungsrichtlinie** Skripte verbietet. Bis zu vier Profile: `$PROFILE.AllUsersAllHosts`, `.AllUsersCurrentHost`, `.CurrentUserAllHosts`, `.CurrentUserCurrentHost` (Standard: `$HOME\Documents\WindowsPowerShell\Microsoft.PowerShell_profile.ps1`). Anlegen: `New-Item $PROFILE -Force; notepad $PROFILE`.

### Ausführungsrichtlinie (Execution Policy)
Steuert, ob Skripte laufen dürfen: `Restricted` (Client-Standard: keine Skripte), **`RemoteSigned`** (Server-Standard: lokale Skripte ja, heruntergeladene nur signiert), `AllSigned`, `Unrestricted`, `Bypass`. `Get-ExecutionPolicy -List`, `Set-ExecutionPolicy RemoteSigned`. **Kein Sicherheitsfeature**, sondern Schutz vor versehentlicher Ausführung.

### Grundlagen der Skriptsprache
```powershell
$name = "SRV01"                       # Variable
$zahlen = 1..5                        # Array
if ($zahlen.Count -gt 3) { "viele" } else { "wenige" }
foreach ($z in $zahlen) { $z * 2 }
function Get-Quadrat($x) { $x * $x }
# Vergleichsoperatoren: -eq -ne -gt -lt -ge -le -like -match -contains
```

## Lab
**Maschine: SRV01** (Mitgliedsserver). Alle Befehle in einer **PowerShell als Administrator**.

### PowerShell
```powershell
# 2  Alle Infos zum Dienst "Windows Update"
Get-Service -DisplayName "Windows Update" | Format-List *
# 3  An Stop-Service übergeben, aber nicht stoppen
Get-Service -DisplayName "Windows Update" | Stop-Service -WhatIf
# 4  Stoppen mit Bestätigung
Get-Service -DisplayName "Windows Update" | Stop-Service -Confirm
# 5  Komplette Hilfe zu Get-Member
Get-Help Get-Member -Full
# 6  Eigenschaften und Methoden eines Dienst-Objekts
Get-Service -DisplayName "Windows Update" | Get-Member
# 7  Nur Eigenschaften / nur Methoden
Get-Service -DisplayName "Windows Update" | Get-Member -MemberType Properties
Get-Service -DisplayName "Windows Update" | Get-Member -MemberType Method
# 8  Wurzelverzeichnis von C:
Get-ChildItem C:\
# 9  Nur Einträge mit "Time" im Namen (rekursiv)
Get-ChildItem C:\ -Filter *time* -Recurse -ErrorAction SilentlyContinue
# 10 Nur Name und die drei Zeitstempel
Get-ChildItem C:\ -Filter *time* -Recurse -ErrorAction SilentlyContinue |
  Format-Table Name, CreationTime, LastWriteTime, LastAccessTime
# 11 Alle Kommandos mit Verb "Out"
Get-Command -Verb Out
# 12 Alle "Manpages"
Get-Help about_*
# 13 Hilfe zu Get-EventLog + 100 neueste Warnungen/Fehler aus System
Get-Help Get-EventLog
Get-EventLog -LogName System -Newest 100 -EntryType Error, Warning
# 14 In Datei schreiben
Get-EventLog -LogName System -Newest 100 -EntryType Error, Warning | Out-File C:\Temp\Systemlog.txt
# 15–17 GridView (Sortieren nach InstanceID absteigend und Spaltenfilter per Mausklick in der Oberfläche)
Get-EventLog -LogName System -Newest 100 -EntryType Error, Warning | Out-GridView
# 16/17 per Pipeline statt Maus:
Get-EventLog -LogName System -Newest 100 -EntryType Error, Warning |
  Sort-Object InstanceId -Descending | Select-Object InstanceId | Out-GridView
# 18 Laufende Prozesse
Get-Process
# 19 Als Tabelle
Get-Process | Format-Table
# 20 CPU, ID, Name und TotalMemory (physisch + virtuell)
Get-Process | Format-Table CPU, Id, ProcessName, @{Label="TotalMemory"; Expression={$_.VM + $_.PM}}
# 21 Dienste nur mit Status und Name
Get-Service | Format-Table Status, Name
# 22 Prozesse mit allen Eigenschaften
Get-Process | Format-List *
# 23 25 neueste Einträge aus "Application"
Get-EventLog -LogName Application -Newest 25
# 24 Als HTML-Datei ausgeben und öffnen
Get-EventLog -LogName Application -Newest 25 | ConvertTo-Html | Out-File C:\Temp\Anwendung.htm
Invoke-Item C:\Temp\Anwendung.htm
# 25 DLLs in System32, die mit "au" beginnen
Get-ChildItem C:\Windows\System32\au*.dll
# 26 Nur Name, Length, Extension als Tabelle
Get-ChildItem C:\Windows\System32\au*.dll | Format-Table Name, Length, Extension
# 27 Dienste nach Status sortiert
Get-Service | Sort-Object Status

# Modern (PowerShell 7, Get-EventLog fehlt dort):
Get-WinEvent -FilterHashtable @{LogName='System'; Level=2,3} -MaxEvents 100
```
Vorher ggf. `New-Item C:\Temp -ItemType Directory`. Die Musterlösung der Schule enthält bei Aufgabe 19 einen Tippfehler (`get-process Format-Table` ohne Pipe) – richtig ist `Get-Process | Format-Table`.

## Übungen
- A: Dienst anzeigen, aber Stopp nur simulieren | L: Get-Service -DisplayName "Windows Update" \| Stop-Service -WhatIf
- A: Nur Methoden eines Dienstobjekts | L: Get-Service -Name wuauserv \| Get-Member -MemberType Method
- A: Alle Befehle mit Verb „Out“ | L: Get-Command -Verb Out
- A: 100 neueste Fehler und Warnungen im System-Log | L: Get-EventLog System -Newest 100 -EntryType Error, Warning
- A: Spalte TotalMemory aus VM + PM | L: Get-Process \| ft CPU, Id, ProcessName, @{Label="TotalMemory";Expression={$_.VM + $_.PM}}
- A: Ereignisse als HTML | L: Get-EventLog Application -Newest 25 \| ConvertTo-Html \| Out-File Anwendung.htm
- A: Dienste nach Status sortieren | L: Get-Service \| Sort-Object Status

## Einfach

Die **grafische Oberfläche** von Windows ist wie ein **Restaurant mit Speisekarte**: Du zeigst auf ein Bild, und es wird gemacht – aber nur, was auf der Karte steht, und immer nur ein Teller nach dem anderen.

**PowerShell** ist, als würdest du **direkt mit dem Koch reden**: „Mach mir 50 Pizzen, aber nur mit Zutaten, die im Kühlschrank sind, und schreib mir eine Liste, was gefehlt hat.“ Das ist schneller und kann Dinge, die auf keiner Speisekarte stehen. Deshalb lieben Admins PowerShell: **Eine Zeile ersetzt hundert Klicks**.

**Die Befehle** klingen wie einfache Sätze: **Verb-Ding**. `Get-Service` = „Hol die Dienste.“ `Stop-Process` = „Stopp den Prozess.“ `New-ADUser` = „Neuer Benutzer im Active Directory.“ Wenn du nicht weißt, wie ein Befehl heißt: `Get-Command *service*` sucht alles mit „service“.

**Die Pipeline** ist ein **Fließband**: Was vorne rauskommt, wird hinten weiterverarbeitet.
`Get-Service | Where-Object Status -eq Running | Sort-Object Name`
= „Hol alle Dienste → behalte nur die laufenden → sortiere nach Namen.“
Das Besondere: Auf dem Fließband liegen keine Zettel mit Text, sondern **ganze Gegenstände** (Objekte) mit allen Eigenschaften. Deshalb kann man sie später noch nach allem Möglichen sortieren.

**-WhatIf** ist der **„Was wäre wenn?“-Knopf**: PowerShell sagt dir, was passieren **würde**, ohne es zu tun. Perfekt, bevor man 500 Benutzer auf einmal löscht!

**Hilfe**: `Get-Help Befehl -Examples` zeigt dir Beispiele – wie ein Rezept mit Bildern.

## Merksatz
- Cmdlet = **Verb-Substantiv**.
- **Get-Help, Get-Command, Get-Member** = die drei Entdecker-Befehle.
- Pipeline transportiert **Objekte**, nicht Text.
- **Format-* ans Ende** der Pipeline.
- Erst **-WhatIf**, dann ausführen.

## Prüfungsfalle
- `dir /s` funktioniert nicht – `dir -Recurse`.
- Nach `Format-Table` kann man nicht mehr sinnvoll sortieren/filtern.
- Ausführungsrichtlinie ist kein echter Sicherheitsschutz.
- `Get-EventLog` gibt es nur in Windows PowerShell 5.1, nicht in PowerShell 7 (→ `Get-WinEvent`).
- Profile werden in Remotesitzungen nicht geladen.

## Grafik
### Pipeline-Fließband
Links spuckt `Get-Service` bunte Objekt-Kisten aus, ein Filter-Tor (`Where-Object`) lässt nur grüne durch, eine Sortiermaschine ordnet sie, am Ende druckt `Format-Table` eine Tabelle. Umschalter „Text-Shell“: statt Kisten fließen nur Zettel, die nicht mehr sortierbar sind.

### Objekt unter der Lupe
Ein Dienst-Objekt öffnet sich wie ein Koffer: Eigenschaften (Name, Status, StartType) und Methoden (Start(), Stop()) – so wie `Get-Member` es zeigt.

### Verb-Substantiv-Baukasten
Zwei Walzen mit Verben (Get, Set, New, Remove, Start, Stop) und Substantiven (Service, Process, ADUser, NetIPAddress); gültige Kombinationen leuchten auf und zeigen eine Kurzbeschreibung.

## Karteikarten
- F: Aufbau eines Cmdlet-Namens? | A: Verb-Substantiv, z. B. Get-Service.
- F: Wie findet man Befehle zu einem Thema? | A: Get-Command *thema* bzw. -Verb/-Noun.
- F: Wie zeigt man nur Beispiele eines Befehls? | A: Get-Help <Cmdlet> -Examples.
- F: Was zeigt Get-Member? | A: Eigenschaften und Methoden der Objekte in der Pipeline.
- F: Was bewirkt -WhatIf? | A: Zeigt, welche Aktionen ausgeführt würden, ohne sie auszuführen.
- F: Was bewirkt -Confirm? | A: Fordert für jedes Objekt eine Bestätigung an.
- F: Was ist ein PSDrive? | A: Laufwerk eines Providers, z. B. HKLM:, Env:, Cert:, AD:.
- F: Unterschied PowerShell-Pipeline und klassische Shell? | A: PowerShell übergibt Objekte, klassische Shells Text.
- F: Wie gibt man eine interaktive, filterbare Tabelle aus? | A: Out-GridView.
- F: Standard-Ausführungsrichtlinie auf Windows Server? | A: RemoteSigned.
- F: Was ist $_? | A: Das aktuelle Objekt in der Pipeline (auch $PSItem).
- F: Warum gehören Format-Cmdlets ans Ende? | A: Sie wandeln Objekte in Formatierungsdaten um – danach ist keine Weiterverarbeitung möglich.

## Quiz
? Welcher Befehl zeigt alle Eigenschaften eines Dienstobjekts an?
* Get-Service wuauserv | Format-List *
- Get-Service wuauserv | Format-Wide
- Get-Help Get-Service
- Get-Command Get-Service

? Welcher Alias steht für Get-ChildItem?
* dir
- cd
- cls
- type

? Was bewirkt Stop-Service -WhatIf?
* Es wird nur angezeigt, was passieren würde
- Der Dienst wird sofort gestoppt
- Der Dienst wird deaktiviert
- Es wird eine Bestätigung verlangt

? Welches Cmdlet filtert Objekte in der Pipeline?
* Where-Object
- Select-Object
- Sort-Object
- Measure-Object

? Welche Ausgabe entsteht mit ConvertTo-Html | Out-File bericht.htm?
* Eine HTML-Datei mit den Objekten als Tabelle
- Eine CSV-Datei
- Eine Anzeige im GridView
- Eine E-Mail

? Nach welchem Schema sind PowerShell-Cmdlets benannt?
* Verb-Nomen (z. B. Get-Service)
- Nomen-Verb
- Abkürzung mit Punkt
- Nur Großbuchstaben
! Mit Get-Verb lassen sich die zulässigen Verben anzeigen.

? Welches Cmdlet liefert Hilfe zu einem Befehl?
* Get-Help
- Get-Command -Help
- Show-Info
- man.exe
! Mit Update-Help werden Hilfedateien aktualisiert; man ist ein Alias für Get-Help.

? Welcher Operator prüft in PowerShell auf „größer als“?
* -gt
- >
- -ge
- -lt
! > ist in PowerShell eine Umleitung, -ge bedeutet „größer gleich“.
