---
id: linux-ess-skripte
bereich: Linux
fach: Linux I
pruefungen: [LPIC-1, Schule]
block: Linux Essentials
kapitel: Thema 3 – Die Macht der Befehlszeile
titel: 3.3 Von Befehlen zum Skript
stufe: Einsteiger
quellen: [LPI-Learning-Material-010-160-de.pdf]
verweise: [linux-l2-20-shell-scripting,linux-102-105-2-skripte]
---

## Profi

### Lernziel (Gewicht 4)
Einfache Shell-Skripte schreiben und ausführen.

### Aufbau
- Textdatei, erste Zeile **Shebang** `#!/bin/bash` (Interpreter). Kommentare mit `#`. Ausführbar machen: `chmod +x skript.sh`, Start `./skript.sh` (weil `.` nicht im PATH ist) oder `bash skript.sh`. Skripte in einem PATH-Verzeichnis (`~/bin`, `/usr/local/bin`) startet man per Namen.
- Rückgabewert: `exit 0` (Erfolg), `exit 1` (Fehler); `$?`.

### Variablen und Parameter
`NAME="Welt"`, `echo "Hallo $NAME"`, Eingabe `read name`. Positionsparameter `$1 $2 …`, `$0` Skriptname, `$#` Anzahl, `$@`/`$*` alle, `$$` PID. Befehlsersetzung `heute=$(date +%F)`. Arithmetik `$((a+b))`.

### Bedingungen
```bash
if [ "$a" -gt 5 ]; then echo groß; elif [ -f datei ]; then echo da; else echo klein; fi
```
- `test`/`[ ]`: Zahlen `-eq -ne -lt -le -gt -ge`, Strings `= != -z -n`, Dateien `-e -f -d -r -w -x -s`. Leerzeichen innerhalb `[ ]` sind Pflicht. `case $x in a) …;; *) …;; esac`.

### Schleifen
`for i in 1 2 3; do …; done`, `for f in *.txt; do …; done`, `while [ cond ]; do …; done`, `break`/`continue`, `seq 1 5`.

### Automatisierung
Regelmäßig ausführen mit **cron** (`crontab -e`, Felder: Minute Stunde Tag Monat Wochentag).

## Einfach

Ein **Skript** ist wie ein **Rezept**: Statt jeden Befehl einzeln zu tippen, schreibst du alle Schritte in eine Datei, und der Computer arbeitet sie der Reihe nach ab. So kannst du langweilige Aufgaben automatisieren.

In die erste Zeile schreibst du immer `#!/bin/bash`. Das heißt: „Dieses Rezept wird mit Bash gekocht.“ Dann kommen deine Befehle. Danach machst du die Datei mit `chmod +x` **ausführbar** und startest sie mit `./skript.sh`.

Ein einfaches Skript:
```
#!/bin/bash
echo "Hallo $1"
```
Wenn du `./skript.sh Anna` aufrufst, steht in `$1` das Wort „Anna“, und es erscheint „Hallo Anna“. `$1`, `$2` … sind also die Dinge, die du dem Skript mitgibst.

Mit **if** triffst du Entscheidungen („wenn die Datei existiert, dann …“) und mit **for** und **while** wiederholst du Dinge. Zum Beispiel: `for f in *.jpg; do echo $f; done` gibt alle Bildnamen aus.

Wichtig: In den eckigen Klammern `[ ... ]` brauchst du **Leerzeichen** direkt hinter der öffnenden und vor der schließenden Klammer.

## Merksatz
- **Shebang, chmod +x, ./skript.**
- **$1 erstes Argument, $# Anzahl, $? Ergebnis.**
- **[ Leerzeichen bedingung Leerzeichen ].**
- **if…fi, for…done, case…esac.**

## Prüfungsfalle
- Ohne `./` findet die Shell das Skript nicht (Verzeichnis nicht im PATH).
- `=` vergleicht Strings, `-eq` vergleicht Zahlen.
- Ohne Ausführrecht: `Permission denied`.
- Ohne Leerzeichen in `[ ]` entsteht ein Syntaxfehler.

## Grafik

### Skript ausführen
1. Entwickler -> Datei: #!/bin/bash und Befehle schreiben
2. Entwickler -> Datei: chmod +x skript.sh
3. Entwickler -> Shell: ./skript.sh Anna
4. Shell -> Bash: Interpreter aus Shebang starten
5. Bash -> Entwickler: Befehle nacheinander, Ausgabe

## Befehle
- `chmod +x skript.sh` – ausführbar
- `./skript.sh arg` – starten
- `read var` – Eingabe lesen
- `exit 0` – Skriptende
- `test -f datei` – Datei prüfen
- `crontab -e` – Zeitsteuerung

## Übungen
- A: Schreibe ein Skript, das "Hallo" plus erstes Argument ausgibt. | L: `#!/bin/bash` newline `echo "Hallo $1"`
- A: Wie testest du, ob /etc/passwd eine Datei ist? | L: `[ -f /etc/passwd ]`
- A: Wie gibst du die Zahlen 1 bis 3 aus? | L: `for i in 1 2 3; do echo $i; done`

## Karteikarten
- F: Was ist der Shebang? | A: #!/bin/bash in der ersten Zeile; legt den Interpreter fest.
- F: Wie macht man ein Skript ausführbar? | A: chmod +x skript.sh
- F: Was enthält $1? | A: Das erste Argument.
- F: Was enthält $#? | A: Die Anzahl der Argumente.
- F: Was enthält $?? | A: Den Rückgabewert des letzten Befehls.
- F: Wie vergleicht man Zahlen in [ ]? | A: -eq -ne -lt -gt -le -ge
- F: Wie schließt man eine if-Anweisung? | A: fi
- F: Wie liest man Benutzereingabe? | A: read
- F: Was beendet eine for-Schleife? | A: done
- F: Wie führt man Skripte regelmäßig aus? | A: Mit cron (crontab -e).

## Quiz
? Was steht in der ersten Skriptzeile?
* #!/bin/bash
- //bash
- !#/bin/sh
- bash:

? Wie startet man ein Skript im aktuellen Ordner?
* ./skript.sh
- skript.sh
- run skript.sh
- exec: skript.sh

? Welche Variable enthält das erste Argument?
* $1
- $0
- $#
- $@

? Welches Schlüsselwort schließt eine Schleife?
* done
- end
- fi
- esac

? Welcher Operator vergleicht Zahlen auf Gleichheit?
* -eq
- ==
- =~
- -same

? Was bedeutet exit 0?
* Erfolg
- Fehler
- Abbruch mit Core
- Neustart

? Warum startet "skript.sh" nicht ohne ./ ?
* Das aktuelle Verzeichnis ist nicht im PATH
- Datei ist versteckt
- Nur root darf
- Falscher Dateityp

? Was bewirkt $(date)?
* Befehlsersetzung: das Ergebnis des Befehls
- Variable date
- Datei date
- Kommentar

## Lücken
- Die erste Zeile eines Bash-Skripts ist der {Shebang}.
- Das Skript wird mit {chmod +x} ausführbar.
- {$#} liefert die Anzahl der Argumente.

## Spickzettel
- #!/bin/bash · chmod +x · ./x.sh
- $0 $1 $# $@ $? $$
- [ -f -d -e ] · -eq -lt -gt
- if/fi · for/done · case/esac
