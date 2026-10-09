---
id: server-powershell-uebung1
bereich: AP1
pruefungen: [Schule, AP1, AP2]
fach: Windows Server / Basic
block: S2
kapitel: PowerShell
titel: PowerShell – Einführung (Folien) und Übung 1 mit allen 27 Lösungen
stufe: Einsteiger
typ: uebung
quellen: [01-Einführung.pdf, Übung1_Powershell.pdf, Übung1_Powershell_Loesung.pdf]
verweise: [ap1-a6-powershell, ref-powershell, az800-powershell-remoting, legacy-tools-skripting]
---

## Profi

Die Grundlagen stehen in **PowerShell – Grundlagen** (ap1-a6-powershell) und der **Befehlsreferenz** (ref-powershell). Hier die Einführungsfolien kompakt und **alle 27 Aufgaben** der Übung 1 mit geprüfter Lösung (Fehler im Lösungsblatt korrigiert).

### Folien „Einführung in PowerShell“
- PowerShell = **Eingabeaufforderung mit integrierter Skriptsprache**, basiert auf **.NET**, **objektorientiert**, zur **Automatisierung** administrativer Aufgaben. Versionen: **Windows PowerShell 5.1** (in Windows integriert) und **PowerShell 7.x** (plattformübergreifend, separat installiert, Befehl `pwsh`).
- **PowerShell ISE**: integrierte Entwicklungsumgebung – gilt heute als **Legacy** (keine Weiterentwicklung), empfohlen: **Visual Studio Code** mit PowerShell-Erweiterung.
- Erweiterbar über **Snap-Ins** (veraltet) und **Module** (z. B. ActiveDirectory, SqlServer, Az).
- Alte Befehle wie `dir`, `cd` funktionieren als **Aliase** – Parameter sind aber anders: `dir /s` erzeugt einen Fehler → `dir -Recurse`. Navigierbar sind auch andere Orte (**PSDrives**): Registry (`HKLM:`), Zertifikate (`Cert:`), AD (`AD:`), Umgebungsvariablen (`Env:`), SQL Server.
- Externe Programme wie `ipconfig`, `netsh`, `ping` laufen weiter.
- **Cmdlets** heißen immer **Verb-Substantiv** (Get-Service). Hilfe: `Get-Help` mit `-Detailed`, `-Examples`, `-Full`, `-Online`; Hilfethemen **about_*** (wie Manpages). `Update-Help` lädt die Hilfe nach.
- `Get-Command` mit `-Verb`, `-Noun`, Platzhaltern (`Get-Command *event*`).
- PSDrives: `Get-PSDrive`, `New-PSDrive -Name X -PSProvider FileSystem -Root \\srv\share`, `Remove-PSDrive`; Provider mit `Get-PSProvider`.
- Aliase: `Get-Alias` (oder `dir Alias:`), `New-Alias`, Export/Import (`Export-Alias`, `Import-Alias`).
- Module: `Get-Module`, `Get-Module -ListAvailable`, `Import-Module`, `Remove-Module`; Suchpfade in `$env:PSModulePath`. Snap-Ins (nur 5.1): `Get-PSSnapin -Registered`, `Add-PSSnapin`.
- **Ausgabe**: `Format-Table` (ft), `Format-List` (fl), `Format-Wide` (fw); umleiten/konvertieren mit `Out-File`, `Out-Printer`, `Out-Host`, `Out-GridView`, `Out-Null`, `ConvertTo-Csv/-Html/-Xml/-Json`, `ConvertTo-SecureString`.
- **Pipeline** (`|`): Andere Shells reichen **Text** weiter, PowerShell reicht **Objekte** weiter – konsistent weiterverarbeitbar. Objekte haben **Eigenschaften** und **Methoden** → `Get-Member`; alle Eigenschaften: `Format-List *`. Format-Cmdlets „machen Objekte kaputt“ (sie erzeugen Formatierungsobjekte) → **Format-* immer ans Ende**.
- **Common Parameters**: `-WhatIf` (nur anzeigen, was passieren würde), `-Confirm` (für jedes Objekt nachfragen), `-Verbose`, `-ErrorAction`; Übersicht `help about_CommonParameters`.
- **Profile**: Skripte, die bei jedem Start Module, Aliase, PSDrives laden. Vier Profile: `$PROFILE.AllUsersAllHosts`, `.AllUsersCurrentHost`, `.CurrentUserAllHosts`, `.CurrentUserCurrentHost`. Nicht geladen in **Remotesitzungen**, eingebetteten Shells und wenn die **Ausführungsrichtlinie** Skripte verhindert. Pfade: aktueller Benutzer `$HOME\Documents\WindowsPowerShell\profile.ps1` (PS 7: `...\PowerShell\`), alle Benutzer `$PSHOME\profile.ps1`.

## Einfach

PowerShell ist wie ein **Fließband in einer Fabrik**. Ganz vorne holt ein Arbeiter Kisten aus dem Lager (`Get-Service`, „hol alle Dienste“). Auf dem Band liegen keine Zettel, sondern **echte Kisten mit Inhalt** (Objekte): Jede Kiste hat Aufkleber wie „Name“, „Status“. Der nächste Arbeiter sortiert (`Sort-Object Status`), der nächste wirft unpassende Kisten raus (`Where-Object`), und **ganz am Ende** packt einer alles hübsch in eine Tabelle (`Format-Table`). Packst du schon in der Mitte ein, kann danach niemand mehr sortieren – die Kisten sind zugeklebt.

Wenn du nicht weißt, welcher Arbeiter was kann, fragst du den **Auskunftsschalter**: `Get-Command` („Welche Arbeiter gibt es?“), `Get-Help` („Was macht dieser Arbeiter?“) und `Get-Member` („Was steht alles auf so einer Kiste?“).

Und bevor du etwas Gefährliches tust – z. B. einen Dienst stoppst –, sagst du **„-WhatIf“**: Der Arbeiter erzählt dir nur, was er tun **würde**. Mit **„-Confirm“** fragt er dich bei jeder Kiste „Wirklich?“.

## Merksatz
- **Verb-Substantiv**, Hilfe mit **Get-Help / Get-Command / Get-Member**.
- **Objekte statt Text** in der Pipeline.
- **Format-* ans Ende!**
- **Erst -WhatIf, dann ausführen.**
- `dir /s` ✗ → `dir -Recurse` ✓.

## Prüfungsfalle
- **Get-EventLog** gibt es nur in Windows PowerShell 5.1 – in PowerShell 7 → `Get-WinEvent`.
- **Out-GridView** braucht eine grafische Oberfläche (nicht auf Server Core), **nicht** die ISE (Folie veraltet).
- Lösungsblatt-Fehler korrigiert: Aufgabe 9 verlangt nur einen **Filter** auf C:\ (kein `-Recurse` nötig), Aufgabe 19 fehlt die Pipe (`Get-Process | Format-Table`), Aufgabe 21 soll eine **Tabelle** zeigen (`ft`), Aufgaben 16/17 sind GUI-Schritte im Gridview.
- `-Confirm` fragt nach, `-WhatIf` führt **nichts** aus.
- Profile laden **nicht** in Remotesitzungen.

## Grafik
### Pipeline mit Objekten
1. Get-Service -> Where-Object: 300 Dienst-Objekte
2. Where-Object: behält nur Status = Running
3. Where-Object -> Sort-Object: 120 Objekte
4. Sort-Object -> Format-Table: sortiert nach Name
5. Format-Table: Ausgabe als Tabelle (Ende der Pipeline)

## Lab
Maschine: **EXA-SRV01** (Mitgliedsserver example.com, Windows Server 2025 mit Desktopdarstellung). PowerShell 5.1 als Administrator (Rechtsklick Start → Terminal (Administrator)).

### GUI
1. Start → **Windows PowerShell** (bzw. Terminal) als Administrator öffnen.
2. Für Aufgaben 15–17: Nach `Out-GridView` öffnet sich ein Fenster → Spaltenkopf **InstanceId** zweimal anklicken (absteigend sortieren) → **Kriterien hinzufügen** bzw. Filterfeld oben nutzen, um nur InstanceId-Werte zu suchen; Spalten über Rechtsklick auf den Kopf ausblenden, sodass nur **InstanceId** bleibt.
3. Für Aufgabe 24: die erzeugte `Anwendung.htm` im Explorer doppelklicken → Browser zeigt die Tabelle.

### PowerShell
```powershell
# EXA-SRV01 – Uebung 1
Get-Service -DisplayName 'Windows Update' | Format-List *                       # 2
Get-Service -DisplayName 'Windows Update' | Stop-Service -WhatIf                # 3
Get-Service -DisplayName 'Windows Update' | Stop-Service -Confirm               # 4
Get-Help Get-Member -Full                                                       # 5
Get-Service -DisplayName 'Windows Update' | Get-Member                          # 6
Get-Service -DisplayName 'Windows Update' | Get-Member -MemberType Properties    # 7a
Get-Service -DisplayName 'Windows Update' | Get-Member -MemberType Method        # 7b
Get-ChildItem C:\                                                               # 8
Get-ChildItem C:\ -Filter *time*                                                # 9  (mit -Recurse: auch Unterordner)
Get-ChildItem C:\ -Filter *time* | Format-Table Name, CreationTime, LastWriteTime, LastAccessTime   # 10
Get-Command -Verb Out                                                           # 11
Get-Help about_*                                                                # 12
Get-Help Get-EventLog                                                           # 13a
Get-EventLog -LogName System -Newest 100 -EntryType Error, Warning              # 13b
Get-EventLog -LogName System -Newest 100 -EntryType Error, Warning | Out-File C:\Temp\Systemlog.txt   # 14
Get-EventLog -LogName System -Newest 100 -EntryType Error, Warning | Out-GridView                     # 15-17 (GUI)
Get-Process                                                                     # 18
Get-Process | Format-Table                                                      # 19
Get-Process | Format-Table CPU, Id, ProcessName, @{Label='TotalMemory'; Expression={$_.VM + $_.PM}}  # 20
Get-Service | Format-Table Status, Name                                         # 21
Get-Process | Format-List *                                                     # 22
Get-EventLog -LogName Application -Newest 25                                    # 23
Get-EventLog -LogName Application -Newest 25 | ConvertTo-Html | Out-File C:\Temp\Anwendung.htm         # 24
Get-ChildItem C:\Windows\System32\au*.dll                                       # 25
Get-ChildItem C:\Windows\System32\au*.dll | Format-Table Name, Length, Extension  # 26
Get-Service | Sort-Object Status                                                # 27

# Zusatz: PowerShell 7 statt Get-EventLog
Get-WinEvent -FilterHashtable @{LogName='System'; Level=2,3} -MaxEvents 100
# Zusatz aus den Folien: PSDrive, Alias, Profil
New-PSDrive -Name Daten -PSProvider FileSystem -Root \\EXA-SRV01\Daten
New-Alias -Name np -Value notepad.exe
if (!(Test-Path $PROFILE)) { New-Item $PROFILE -ItemType File -Force }; notepad $PROFILE
```

## Befehle
- `Get-Help <Cmdlet> -Examples` – nur Beispiele anzeigen
- `Get-Command -Verb Out` – alle Befehle mit Verb Out
- `Get-Member -MemberType Method` – nur Methoden eines Objekts
- `Format-List *` – alle Eigenschaften mit Werten
- `Stop-Service -WhatIf` – Stopp nur simulieren
- `Out-GridView` – interaktive Tabelle (GUI nötig)
- `ConvertTo-Html \| Out-File x.htm` – HTML-Bericht
- `@{Label='X';Expression={...}}` – berechnete Spalte
- `Get-PSDrive` / `New-PSDrive` – Laufwerke/Provider
- `Get-Module -ListAvailable` – verfügbare Module
- `$PROFILE` – Pfad des aktuellen Profils

## Übungen
- A: 2. Alle Informationen nur zum Dienst „Windows Update“ | L: Get-Service -DisplayName 'Windows Update' \| Format-List *
- A: 3. Ausgabe an Stop-Service pipen, ohne den Dienst zu beenden | L: ... \| Stop-Service -WhatIf
- A: 4. Dienst stoppen, aber mit Bestätigung | L: ... \| Stop-Service -Confirm
- A: 5. Komplette Hilfe zu Get-Member | L: Get-Help Get-Member -Full
- A: 6. Alle Eigenschaften und Methoden eines Dienstobjekts | L: Get-Service -DisplayName 'Windows Update' \| Get-Member
- A: 7. Nur Eigenschaften, dann nur Methoden | L: ... \| Get-Member -MemberType Properties bzw. -MemberType Method
- A: 8. Alle Ordner und Dateien im Wurzelverzeichnis von C: | L: Get-ChildItem C:\ (Alias dir C:\)
- A: 9. Nur Einträge mit „Time“ im Namen | L: Get-ChildItem C:\ -Filter *time* (das Lösungsblatt nutzt zusätzlich -Recurse und durchsucht damit alle Unterordner)
- A: 10. Nur Name und drei Zeitstempel | L: ... \| Format-Table Name, CreationTime, LastWriteTime, LastAccessTime
- A: 11. Alle Kommandos mit Verb „Out“ | L: Get-Command -Verb Out
- A: 12. Alle „Manpages“ anzeigen | L: Get-Help about_* (bzw. help about_*)
- A: 13. Hilfe zu Get-EventLog, dann 100 neueste Fehler/Warnungen aus System | L: Get-Help Get-EventLog; Get-EventLog System -Newest 100 -EntryType Error, Warning
- A: 14. Ausgabe mit einem Out-Kommando in eine Datei | L: ... \| Out-File Systemlog.txt
- A: 15. Ausgabe als Gridview | L: ... \| Out-GridView
- A: 16. Gridview absteigend nach InstanceID sortieren | L: Im Gridview-Fenster zweimal auf den Spaltenkopf InstanceId klicken (alternativ vorher Sort-Object InstanceId -Descending).
- A: 17. Gridview so filtern, dass nur InstanceID angezeigt wird | L: Andere Spalten per Rechtsklick auf Spaltenkopf ausblenden (alternativ vorher Select-Object InstanceId).
- A: 18. Liste der laufenden Prozesse | L: Get-Process
- A: 19. Ausgabe als Tabelle | L: Get-Process \| Format-Table (im Lösungsblatt fehlt die Pipe)
- A: 20. Nur CPU, ID, Prozessname und Summe aus VM+PM als TotalMemory | L: Get-Process \| ft CPU, Id, ProcessName, @{Label='TotalMemory';Expression={$_.VM + $_.PM}}
- A: 21. Dienste nur mit Status und Name | L: Get-Service \| Format-Table Status, Name (Lösungsblatt: fl – liefert eine Liste)
- A: 22. Prozesse mit wirklich allen Eigenschaften und Werten | L: Get-Process \| Format-List *
- A: 23. 25 neueste Einträge aus dem Anwendungsprotokoll | L: Get-EventLog Application -Newest 25
- A: 24. Ausgabe als HTML-Datei und im Browser öffnen | L: Get-EventLog Application -Newest 25 \| ConvertTo-Html \| Out-File Anwendung.htm; Datei doppelklicken
- A: 25. Alle DLLs in System32, die mit „au“ beginnen | L: Get-ChildItem C:\Windows\System32\au*.dll
- A: 26. Nur Name, Length, Extension als Tabelle | L: ... \| Format-Table Name, Length, Extension
- A: 27. Alle Dienste nach Status sortiert | L: Get-Service \| Sort-Object Status

## Karteikarten
- F: Woraus besteht ein Cmdlet-Name? | A: Verb-Substantiv
- F: Was unterscheidet die PowerShell-Pipeline von CMD/Bash? | A: Sie reicht Objekte statt Text weiter
- F: Welcher Parameter simuliert eine Aktion? | A: -WhatIf
- F: Welcher Parameter fragt pro Objekt nach? | A: -Confirm
- F: Wie zeigt man alle Eigenschaften eines Objekts mit Werten? | A: Format-List *
- F: Wie findet man Befehle zu Ereignissen? | A: Get-Command *event*
- F: Was sind about_*-Themen? | A: Konzept-Hilfeseiten (wie Manpages) zu Variablen, Skripting, Parametern usw.
- F: Was ist ein PSDrive? | A: Ein über einen Provider erreichbarer Speicherort (Dateisystem, Registry, Zertifikate, AD …)
- F: Wo werden Profile nicht geladen? | A: In Remotesitzungen, eingebetteten Shells und bei blockierender Ausführungsrichtlinie
- F: Welche Variable enthält die Modul-Suchpfade? | A: $env:PSModulePath
- F: Was ersetzt Get-EventLog in PowerShell 7? | A: Get-WinEvent
- F: Warum Format-* ans Ende? | A: Format-Cmdlets erzeugen Formatierungsobjekte, danach kann man nicht sinnvoll filtern/sortieren

## Quiz
? Welche Zeile stoppt „Windows Update“ NICHT, zeigt aber, was passieren würde?
* Get-Service -DisplayName 'Windows Update' | Stop-Service -WhatIf
- Get-Service -DisplayName 'Windows Update' | Stop-Service -Confirm
- Stop-Service wuauserv -Force
- Get-Service wuauserv | Format-List

? Welcher Befehl zeigt nur die Methoden eines Dienstobjekts?
* Get-Service wuauserv | Get-Member -MemberType Method
- Get-Service wuauserv | Format-List *
- Get-Help Get-Service -Full
- Get-Command -Noun Service

? Warum scheitert „dir /s“ in PowerShell?
* dir ist ein Alias für Get-ChildItem, der Parameter heißt -Recurse
- PowerShell kennt keine Ordner
- /s ist nur in Linux gültig
- dir benötigt Administratorrechte

? Wie erzeugt man eine berechnete Spalte TotalMemory aus VM + PM?
* @{Label='TotalMemory'; Expression={$_.VM + $_.PM}}
- -Column TotalMemory=VM+PM
- Select-Object VM+PM AS TotalMemory
- Format-Table -Sum VM,PM

? Was liefert Get-Help about_*?
* Eine Liste der Konzept-Hilfethemen
- Alle Aliase
- Alle Module
- Den Inhalt des Profils

? Welche Aussage zu Out-GridView ist richtig?
* Es braucht eine grafische Oberfläche, nicht die ISE
- Es funktioniert nur in der ISE
- Es schreibt in eine Datei
- Es gibt es nur unter Linux

? Wo landet die Ausgabe von ConvertTo-Html ohne weiteren Befehl?
* Als HTML-Text in der Konsole
- Automatisch im Browser
- In der Ereignisanzeige
- In der Zwischenablage

? Welcher Befehl listet alle Dienste nach Status sortiert?
* Get-Service | Sort-Object Status
- Get-Service -Sort Status
- Sort-Object Get-Service
- Get-Service | Format-Table | Sort-Object Status

## Lücken
- Cmdlets bestehen aus {Verb} und {Substantiv}.
- Mit {-WhatIf} simuliert man, mit {-Confirm} lässt man nachfragen.
- Die drei Entdecker-Cmdlets heißen {Get-Help}, {Get-Command} und {Get-Member}.

## Spickzettel
- Verb-Substantiv; Get-Help -Examples/-Full; about_*
- Get-Command -Verb/-Noun; Get-Member -MemberType
- Pipeline = Objekte; Format-* ans Ende
- -WhatIf simuliert, -Confirm fragt
- dir -Recurse statt /s; ft/fl/fw; Out-File/Out-GridView/ConvertTo-Html
- Berechnete Spalte: @{Label='';Expression={}}
- PS 7: Get-WinEvent statt Get-EventLog
