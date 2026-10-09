---
id: erg-skripting-admin
bereich: AP2
block: ERG
kapitel: Ergänzungen 2.2
titel: Skripting für Administratoren – PowerShell, Bash und Python im Vergleich, Kontrollstrukturen und Automatisierung
stufe: Fortgeschritten
fach: GDP / OOP
pruefungen: [AP1, AP2, Schule]
quellen: [Microsoft Learn – PowerShell 7 Dokumentation, GNU Bash Reference Manual, Python 3 Dokumentation, IHK-Prüfungsaufgaben Pseudocode]
verweise: [ap1-a6-powershell, ap2-skripte-sql, linux-l2-20-shell-scripting, linux-102-105-2-skripte, ihk-lz-programmierung-uml, ihk-algorithmen-suchen-sortieren, ref-powershell, bonus-csharp-kompakt]
---

## Profi

### Warum skripten?
Skripte automatisieren wiederkehrende Aufgaben (Benutzer anlegen, Berichte, Backups prüfen, Logs auswerten), machen sie **reproduzierbar**, **dokumentiert** und **fehlerärmer**. Die AP verlangt, kurze Skripte bzw. **Pseudocode** zu lesen, zu ergänzen und Fehler zu finden.

### Sprachen im Vergleich
| Merkmal | PowerShell | Bash | Python |
|---|---|---|---|
| Heimat | Windows (PowerShell 7 auch Linux/macOS) | Linux/Unix | plattformunabhängig |
| Pipeline | übergibt **Objekte** | übergibt **Text** | – (Funktionen, Module) |
| Variable | `$name = 'Anna'` | `name="Anna"` (keine Leerzeichen um =) | `name = "Anna"` |
| Ausgabe | `Write-Output`, `Write-Host` | `echo` | `print()` |
| Bedingung | `if ($x -gt 5) { }` | `if [ "$x" -gt 5 ]; then … fi` | `if x > 5:` (Einrückung) |
| Schleife | `foreach ($u in $liste) { }` | `for u in $liste; do … done` | `for u in liste:` |
| Vergleich | `-eq -ne -gt -lt -ge -le -like` | `-eq -ne -gt -lt` (Zahlen), `=` `!=` (Text) | `== != > < >= <=` |
| Kommentar | `#` bzw. `<# … #>` | `#` | `#` |
| Skriptdatei | `.ps1` | `.sh` mit Shebang `#!/bin/bash` | `.py` |

### Kontrollstrukturen
- **Sequenz** – Anweisungen nacheinander.
- **Verzweigung** – `if/else`, mehrfach `switch` (PowerShell) / `case` (Bash) / `match` bzw. `elif` (Python).
- **Schleifen** – **kopfgesteuert** (`while`: Bedingung vorher geprüft, evtl. 0 Durchläufe), **fußgesteuert** (`do … while`/`do … until` in PowerShell: mindestens 1 Durchlauf), **Zählschleife** (`for`), **Mengenschleife** (`foreach`).
- **Funktionen** – kapseln wiederverwendbare Logik mit Parametern und Rückgabewert.
- **Fehlerbehandlung** – PowerShell `try { } catch { } finally { }` (mit `-ErrorAction Stop`), Bash `set -e`, Rückgabecode `$?`, Python `try/except`.

### Typische Admin-Aufgaben
```powershell
# PowerShell: Benutzer aus CSV anlegen (Spalten Vorname;Nachname;Abteilung)
Import-Csv .\neu.csv -Delimiter ';' | ForEach-Object {
    $sam = ($_.Vorname.Substring(0,1) + $_.Nachname).ToLower()
    New-ADUser -Name "$($_.Vorname) $($_.Nachname)" -SamAccountName $sam -Department $_.Abteilung -Enabled $false
}
```
```bash
#!/bin/bash
# Bash: Warnung, wenn ein Dateisystem über 90 % belegt ist
df -P | tail -n +2 | while read fs size used avail pct mount; do
  p=${pct%\%}
  if [ "$p" -gt 90 ]; then echo "WARNUNG: $mount ist zu $p % voll"; fi
done
```
```python
# Python: fehlgeschlagene Anmeldungen je Benutzer aus einer Logdatei zählen
zaehler = {}
with open("auth.log", encoding="utf-8") as f:
    for zeile in f:
        if "Failed password" in zeile:
            user = zeile.split(" for ")[1].split(" ")[0]
            zaehler[user] = zaehler.get(user, 0) + 1
for user, anzahl in sorted(zaehler.items(), key=lambda x: -x[1]):
    print(user, anzahl)
```

### Sicherheit beim Skripten
Keine Kennwörter im Klartext im Skript (stattdessen `Get-Credential`, Secret-Store, verwaltete Dienstkonten), **Ausführungsrichtlinie** (`Set-ExecutionPolicy RemoteSigned`) ist kein Sicherheitsmechanismus gegen Angreifer, sondern Schutz vor versehentlicher Ausführung; Skripte **signieren**; erst mit `-WhatIf` testen; Eingaben prüfen.

## Einfach
Ein **Skript** ist wie ein **Kochrezept** für den Computer. Statt dass du jeden Morgen 30 Mal dieselben Klicks machst, schreibst du einmal genau auf, was zu tun ist – und der Computer macht es in einer Sekunde, ohne sich zu vertippen.

Rezepte bestehen immer aus denselben Bausteinen:
- **Schritt für Schritt** (Sequenz): „Wasser kochen, Nudeln rein, 8 Minuten warten.“
- **Wenn … dann …** (Verzweigung): „Wenn die Nudeln weich sind, abgießen, sonst noch eine Minute.“
- **Wiederholen** (Schleife): „Für jeden Teller: Nudeln drauf, Soße drauf.“

Es gibt verschiedene **Sprachen** für Rezepte. **PowerShell** ist die Sprache von Windows. Ihr Trick: Sie reicht nicht nur Text weiter, sondern ganze **Pakete mit Eigenschaften** (Objekte) – wie ein Paket, auf dem schon Name, Größe und Datum stehen. **Bash** ist die Sprache von Linux und reicht **Text** weiter, den man dann zerschneiden muss. **Python** ist eine Allround-Sprache, die man überall benutzen kann und die besonders gut lesbar ist.

Wichtig: Ein Rezept muss man **testen**, bevor man damit für 500 Gäste kocht. PowerShell hat dafür einen Probelauf-Schalter: **-WhatIf** – „Zeig mir, was du tun würdest, aber tu es noch nicht.“ Und **Passwörter** schreibt man nie ins Rezept, denn das Rezept kann jeder lesen.

## Merksatz
- **Sequenz – Verzweigung – Schleife: daraus besteht jedes Programm.**
- **PowerShell-Pipeline = Objekte, Bash-Pipeline = Text.**
- **Bash: name="wert" ohne Leerzeichen.**
- **Kopfgesteuert evtl. 0-mal, fußgesteuert mindestens 1-mal.**
- **Erst -WhatIf, dann echt. Nie Kennwörter im Skript.**

## Prüfungsfalle
- In PowerShell ist `>` **kein** Vergleich, sondern Ausgabeumleitung – richtig ist `-gt`.
- In Bash sind Leerzeichen um `=` bei der Zuweisung ein Fehler; in `[ ]` sind Leerzeichen dagegen **Pflicht**.
- Off-by-one-Fehler: Schleife `for ($i = 0; $i -le $n; $i++)` läuft **n+1**-mal.
- Python-Blöcke werden durch **Einrückung** gebildet – falsche Einrückung ändert die Logik.
- `Set-ExecutionPolicy Unrestricted` ist keine Lösung für ein Signaturproblem in der Produktion.

## Grafik
### Pipeline in PowerShell
1. Get-Service: Liefert Dienst-Objekte
2. Get-Service -> Where-Object: Objekte mit Eigenschaft Status
3. Where-Object: Filtert Status -eq 'Stopped'
4. Where-Object -> Select-Object: Gefilterte Objekte
5. Select-Object -> Export-Csv: Name und StartType als Bericht

### Kopf- vs. fußgesteuerte Schleife
1. Kopfgesteuert: Bedingung prüfen
2. Kopfgesteuert: Falls wahr – Rumpf ausführen, zurück zur Prüfung
3. Fußgesteuert: Rumpf ausführen
4. Fußgesteuert: Danach Bedingung prüfen, ggf. wiederholen

## Lab
**Maschinen**: Administrationsclient **ADM01** (Windows 11 mit RSAT und PowerShell 7) in der Domäne **example.com**, Linux-Server **LX01** (Debian 12).

### GUI
1. **ADM01**: Visual Studio Code mit PowerShell-Erweiterung öffnen → neue Datei `bericht.ps1`.
2. **ADM01**: Skript mit F5 ausführen, Haltepunkt (F9) setzen und Variablen im Debug-Fenster ansehen.
3. **ADM01**: Ergebnisdatei `C:\Berichte\dienste.csv` in Excel öffnen.

### PowerShell
```powershell
# ADM01 – Bericht über gestoppte automatische Dienste
$ziel = 'C:\Berichte'
if (-not (Test-Path $ziel)) { New-Item -ItemType Directory -Path $ziel | Out-Null }
Get-CimInstance Win32_Service |
    Where-Object { $_.StartMode -eq 'Auto' -and $_.State -ne 'Running' } |
    Select-Object Name, DisplayName, State |
    Export-Csv "$ziel\dienste.csv" -NoTypeInformation -Delimiter ';' -Encoding utf8

# Probelauf: inaktive Benutzer deaktivieren (nur anzeigen)
Search-ADAccount -AccountInactive -TimeSpan 90.00:00:00 -UsersOnly |
    Disable-ADAccount -WhatIf
```

### CLI (LX01)
```bash
#!/bin/bash
for dienst in ssh cron nginx; do
  if systemctl is-active --quiet "$dienst"; then echo "$dienst läuft"; else echo "$dienst ist AUS"; fi
done
```

## Legende
### Pipeline
- Was: Weitergabe der Ausgabe eines Befehls als Eingabe an den nächsten.
- Wie: Mit dem senkrechten Strich zwischen Befehlen; PowerShell übergibt Objekte, Bash Text.
- Wann: Zum Filtern, Sortieren, Auswählen und Exportieren von Daten.
- Wo: PowerShell, Bash, CMD (eingeschränkt).
- Warum: Kleine Werkzeuge werden zu mächtigen Abläufen kombiniert.

### -WhatIf
- Was: Allgemeiner PowerShell-Parameter für einen Probelauf.
- Wie: An ein Cmdlet anhängen, das Änderungen vornimmt (Remove-, Set-, Disable- …).
- Wann: Vor jeder Massenänderung, besonders bei Löschungen.
- Wo: Alle Cmdlets, die ShouldProcess unterstützen.
- Warum: Zeigt die Auswirkungen, ohne Schaden anzurichten.

## Karteikarten
- F: Nennen Sie die drei Grundstrukturen der strukturierten Programmierung. | A: Sequenz, Verzweigung (Selektion), Schleife (Iteration).
- F: Was unterscheidet die PowerShell-Pipeline von der Bash-Pipeline? | A: PowerShell übergibt Objekte mit Eigenschaften, Bash übergibt Text.
- F: Wie lautet der Vergleichsoperator „größer als“ in PowerShell? | A: -gt
- F: Wie wird in Bash eine Variable zugewiesen? | A: name="Wert" – ohne Leerzeichen um das Gleichheitszeichen; Zugriff mit $name.
- F: Unterschied kopf- und fußgesteuerte Schleife? | A: Kopfgesteuert prüft vor dem Durchlauf (evtl. 0-mal), fußgesteuert danach (mindestens 1-mal).
- F: Wozu dient die Shebang-Zeile #!/bin/bash? | A: Sie legt den Interpreter fest, mit dem das Skript ausgeführt wird.
- F: Wie behandelt man Fehler in PowerShell? | A: try/catch/finally; nicht-terminierende Fehler mit -ErrorAction Stop abfangbar machen.
- F: Wie listet man gestoppte Dienste in PowerShell? | A: Get-Service \| Where-Object Status -eq 'Stopped'
- F: Wie werden Blöcke in Python gebildet? | A: Durch Einrückung (meist 4 Leerzeichen) nach einem Doppelpunkt.
- F: Warum gehören keine Kennwörter in Skripte? | A: Skripte sind lesbar, werden kopiert und versioniert; stattdessen Get-Credential, Secret-Store oder Dienstkonten (gMSA).

## Quiz
? Welche Ausgabe liefert die PowerShell-Pipeline an den nächsten Befehl?
* Objekte mit Eigenschaften und Methoden
- Reinen Text
- Nur Zahlen
- Binärdateien
! Deshalb kann man direkt nach Eigenschaften filtern, z. B. $_.Status.

? Welche Bash-Zuweisung ist korrekt?
* zahl=5
- zahl = 5
- $zahl = 5
- set zahl == 5
! Leerzeichen um das Gleichheitszeichen führen zu einem Fehler.

? Wie oft läuft for ($i = 1; $i -le 10; $i++) durch?
* 10-mal
- 9-mal
- 11-mal
- unendlich
! Von 1 bis einschließlich 10.

? Welche Schleife wird mindestens einmal ausgeführt?
* Fußgesteuerte Schleife (do … while)
- Kopfgesteuerte Schleife (while)
- for-Schleife mit falscher Startbedingung
- foreach über eine leere Liste
! Die Bedingung wird erst nach dem ersten Durchlauf geprüft.

? Welcher PowerShell-Parameter zeigt eine Änderung an, ohne sie auszuführen?
* -WhatIf
- -Force
- -Confirm:$false
- -Verbose
! -Confirm fragt nach, -WhatIf simuliert.

? Welcher Vergleichsoperator prüft in PowerShell auf Gleichheit?
* -eq
- ==
- =
- -is
! = ist eine Zuweisung, == gibt es in PowerShell nicht.

? Wodurch werden Codeblöcke in Python gekennzeichnet?
* Durch Einrückung
- Durch geschweifte Klammern
- Durch begin/end
- Durch Semikolons
! Nach if, for, def usw. folgt ein Doppelpunkt und ein eingerückter Block.

? Wie macht man ein Bash-Skript ausführbar?
* chmod +x skript.sh
- Set-ExecutionPolicy
- bash --install skript.sh
- mv skript.sh /bin/exe
! Zusätzlich sollte die erste Zeile eine Shebang enthalten.

? Wie sollten Anmeldedaten in einem Automatisierungsskript gehandhabt werden?
* Über Get-Credential, einen Secret-Store oder verwaltete Dienstkonten
- Im Klartext in der ersten Zeile
- Base64-kodiert im Skript
- In einem Kommentar
! Base64 ist keine Verschlüsselung.

## Lücken
- In PowerShell vergleicht man „größer als“ mit {-gt}.
- Die erste Zeile eines Bash-Skripts mit #!/bin/bash heißt {Shebang}.
- Eine {fußgesteuerte} Schleife läuft mindestens einmal.
- Einen Probelauf in PowerShell erzwingt der Parameter {-WhatIf}.
- Python bildet Blöcke durch {Einrückung}.

## Zuordnen
### Sprache und Merkmal
- PowerShell => Pipeline mit Objekten, Verb-Nomen-Cmdlets
- Bash => Pipeline mit Text, Standard-Shell unter Linux
- Python => Blöcke durch Einrückung, plattformunabhängig
- CMD/Batch => veraltete Windows-Skriptsprache

### Kontrollstruktur und Beispiel
- Verzweigung => if/else
- Mehrfachverzweigung => switch bzw. case
- Zählschleife => for
- Mengenschleife => foreach
- Fehlerbehandlung => try/catch

### Vergleich in PowerShell und Bedeutung
- -eq => gleich
- -ne => ungleich
- -lt => kleiner als
- -like => Mustervergleich mit Platzhaltern

## Reihenfolge
### Automatisierungsskript entwickeln
1. Aufgabe und Ein-/Ausgaben festlegen
2. Ablauf als Pseudocode oder PAP skizzieren
3. Skript schreiben und kommentieren
4. Mit Testdaten und -WhatIf prüfen
5. Fehlerbehandlung und Protokollierung ergänzen
6. Skript signieren, dokumentieren und planen (Aufgabenplanung/cron)

### PowerShell-Bericht als Pipeline
1. Objekte abrufen (Get-…)
2. Filtern (Where-Object)
3. Eigenschaften auswählen (Select-Object)
4. Sortieren (Sort-Object)
5. Exportieren (Export-Csv)

### Fehler in einem Skript finden
1. Fehlermeldung und Zeilennummer lesen
2. Syntax prüfen (Klammern, Operatoren, Leerzeichen)
3. Variablenwerte ausgeben oder Haltepunkt setzen
4. Mit kleinen Testdaten erneut ausführen
5. Korrektur dokumentieren

## Freitext
- F: Erläutern Sie den Unterschied zwischen der Pipeline in PowerShell und in Bash an einem Beispiel. | M: PowerShell übergibt Objekte: Get-Process \| Sort-Object CPU sortiert direkt nach der Eigenschaft CPU. Bash übergibt Text: ps aux \| sort -k3 sortiert nach der 3. Textspalte, Spalten müssen ggf. mit cut/awk extrahiert werden. | P: 4
- F: Schreiben Sie Pseudocode, der für jede Zeile einer Benutzerliste prüft, ob der Benutzer existiert, und ihn sonst anlegt. | M: FÜR jede Zeile IN Liste: WENN Benutzer(zeile.name) existiert DANN Ausgabe „vorhanden“ SONST Benutzer anlegen; Ausgabe „angelegt“ ENDE WENN; ENDE FÜR. | P: 4
- F: Nennen Sie drei Regeln für sichere Administrationsskripte. | M: Keine Klartextkennwörter, Probelauf (-WhatIf) und Testumgebung, Fehlerbehandlung und Protokollierung, Signierung, minimale Rechte, Eingaben validieren, Versionsverwaltung. | P: 3

## Szenario
### 200 neue Schülerkonten
Zum Schuljahresbeginn sollen 200 Schülerkonten aus einer CSV-Datei (Vorname;Nachname;Klasse) im AD angelegt und der Gruppe der jeweiligen Klasse hinzugefügt werden.
- F: Welche Cmdlets verwenden Sie? | A: Import-Csv, ForEach-Object, New-ADUser, Add-ADGroupMember (ggf. Get-ADUser zur Prüfung). | P: 3
- F: Wie vermeiden Sie Fehler bei doppelten Anmeldenamen? | A: Vor dem Anlegen mit Get-ADUser -Filter prüfen, ggf. Ziffer anhängen; Probelauf mit -WhatIf; Fehler in try/catch protokollieren. | P: 3

### Skript bricht ab
Ein Bash-Skript enthält die Zeile `wert = 10` und meldet „wert: Befehl nicht gefunden“.
- F: Was ist der Fehler? | A: Leerzeichen um das Gleichheitszeichen – Bash interpretiert „wert“ als Befehl. | P: 2
- F: Wie lautet die korrekte Zeile? | A: wert=10 | P: 1

### Nächtlicher Speicherplatzbericht
Die Leitung möchte jeden Morgen eine Übersicht aller Server, deren Laufwerk C: weniger als 15 % frei hat.
- F: Beschreiben Sie den Aufbau des Skripts. | A: Serverliste laden, je Server per Get-CimInstance Win32_LogicalDisk (DeviceID C:) Größe/Frei abfragen, Prozent berechnen, Bedingung < 15 % filtern, Ergebnis als CSV/HTML speichern oder per Mail senden. | P: 4
- F: Wie wird das Skript automatisch ausgeführt? | A: Über die Aufgabenplanung (Register-ScheduledTask) mit einem Dienstkonto (gMSA) mit minimalen Rechten. | P: 2
