---
id: linux-102-105-2-skripte
bereich: Linux
fach: Linux II
pruefungen: [LPIC-1]
block: LPIC-102
kapitel: LPIC-1 Prüfung 102 – Shells und Skripte
titel: 105.2 Skripte anpassen oder schreiben
stufe: Fortgeschritten
quellen: [LPI-Learning-Material-102-500-de.pdf, 1.20_Linux_-_Shell-Scripting_Szenario.pdf]
verweise: [linux-l2-20-shell-scripting, linux-102-105-1-shell-umgebung]
---

## Profi

### Lernziel (Gewicht 4)
Bash-Skripte schreiben: Shebang, Variablen, Parameter, Bedingungen, Schleifen, Exit-Status.

### Grundgerüst
```bash
#!/bin/bash
# Kommentar
name="${1:-Welt}"                     # Standardwert
echo "Hallo, $name"
exit 0
```
- Ausführbar: `chmod +x`, Start `./skript` (nicht im PATH!) oder `bash skript`. Positionsparameter `$1…$9`, `${10}`, `$0`, `$#`, `$@`/`$*`, `$?` (letzter Exit-Status), `$$` (PID). `shift` verschiebt Parameter. `read -p "Eingabe: " var`.
- Arithmetik: `$(( a + b ))`, `let`, `expr 1 + 2`. Strings: `${#var}`, `${var:2:3}`.

### Bedingungen
- `test` / `[ ... ]` / `[[ ... ]]`. Dateitests: `-e -f -d -r -w -x -s -L`. Strings: `= != -z -n`. Zahlen: `-eq -ne -lt -le -gt -ge`. Verknüpfung `-a`/`-o` oder `&&`/`||`.
```bash
if [ -f "$1" ]; then echo "Datei"; elif [ -d "$1" ]; then echo "Ordner"; else echo "?"; fi
case "$1" in start) echo s;; stop) echo t;; *) echo "Usage: $0 start|stop";; esac
```

### Schleifen
```bash
for i in 1 2 3; do echo $i; done
for f in *.log; do gzip "$f"; done
for ((i=0;i<3;i++)); do echo $i; done
while [ $n -lt 5 ]; do n=$((n+1)); done
while read zeile; do echo "$zeile"; done < datei
until ping -c1 host; do sleep 2; done
```
- `break`, `continue`. Exit-Status: `exit n`, `$?`; `&&`, `||`. `seq 1 5`. Debuggen: `bash -x`, `set -e` (Abbruch bei Fehler), `set -u`.

## Einfach

Ein **Skript** ist ein **Rezept**, das du schreibst, damit der Computer es allein kochen kann. In Zeile 1 steht, welcher Koch es lesen soll (`#!/bin/bash`). Dann kommen die Befehle, einer pro Zeile.

Dein Rezept kann **Zutaten entgegennehmen**: `$1` ist die erste, `$2` die zweite, `$#` sagt, wie viele du bekommen hast. Mit `read` kann das Rezept dich fragen. Mit `name="Anna"` merkt sich das Rezept etwas.

Das Rezept kann **entscheiden**: „Wenn die Datei existiert, dann …, sonst …“ schreibt man mit `if [ -f datei ]; then ...; else ...; fi`. Und für mehrere Möglichkeiten gibt es `case` (wie ein Menü: „bei start tu dies, bei stop tu das“).

Es kann **wiederholen**: `for datei in *.txt; do ...; done` heißt „für jede Textdatei tu das Folgende“. `while` wiederholt, solange etwas wahr ist.

Jeder Befehl meldet am Ende eine Zahl: **0 = alles gut**, alles andere = Fehler. Die letzte Zahl steht in `$?`. Mit `exit 1` sagt dein Rezept selbst „es ist etwas schiefgegangen“.

Beim Testen hilft `bash -x skript`: Dann schreibt die Shell jeden Schritt mit, den sie tut – wie jemand, der laut mitliest.

## Merksatz
- **#!/bin/bash, chmod +x, ./skript.**
- **$1 $2 … $# $@ $? $$.**
- **0 = Erfolg.**
- **[ ] braucht Leerzeichen innen.**
- **if … fi, case … esac, do … done.**
- **bash -x zum Debuggen.**

## Prüfungsfalle
- Zahlen: `-eq`, Strings: `=`; **nicht** vertauschen.
- In `[ $a = $b ]` führen unquotierte, leere Variablen zu Syntaxfehlern → immer `"$a"`.
- `case`-Zweige enden mit `;;`, `esac` ist „case“ rückwärts.
- `if`-Block endet mit `fi`, Schleifen mit `done`.
- `$@` (einzelne Wörter) ≠ `$*` (ein String, in Anführungszeichen).
- Ohne Shebang nutzt das Skript die Shell des Aufrufers.
- `exit` in einem mit `source` gestarteten Skript beendet die **aktuelle Shell**.

## Grafik

### Skript-Ablauf mit Prüfung
1. Benutzer -> Skript: ./backup.sh /home
2. Skript: if [ -d "$1" ] prüft das Argument
3. Skript -> tar: tar czf backup.tar.gz "$1"
4. tar -> Skript: Exit-Status in $?
5. Skript -> Benutzer: Erfolg (0) oder Fehlermeldung (exit 1)

## Lab
**Maschine**: debian01.
```bash
# auf debian01
cat > ~/hallo.sh <<'ENDOFSCRIPT'
#!/bin/bash
if [ $# -lt 1 ]; then echo "Usage: $0 name" >&2; exit 1; fi
for n in "$@"; do echo "Hallo, $n"; done
ENDOFSCRIPT
chmod +x ~/hallo.sh
~/hallo.sh Anna Ben; echo "Exit: $?"
~/hallo.sh; echo "Exit: $?"
bash -x ~/hallo.sh Leo
```

## Befehle
- `chmod +x skript` – ausführbar
- `bash -x skript` – Debug
- `read -p "Text" var` – Eingabe
- `test -f datei` – Dateitest
- `seq 1 5` – Zahlenfolge
- `$(( 1+2 ))` – Rechnen
- `shift` – Parameter verschieben
- `exit 1` – mit Fehler beenden

## Übungen
- A: Schreibe eine Schleife, die alle .log-Dateien komprimiert. | L: for f in *.log; do gzip "$f"; done
- A: Prüfe, ob $1 ein Verzeichnis ist. | L: if [ -d "$1" ]; then ...; fi
- A: Wie viele Parameter wurden übergeben? | L: $#
- A: Wie testest du numerisch "kleiner"? | L: [ "$a" -lt "$b" ]
- A: Wie beendest du ein Skript mit Fehlercode 2? | L: exit 2

## Karteikarten
- F: Was ist der Shebang? | A: Erste Zeile #!/bin/bash – legt den Interpreter fest.
- F: Was steht in $?? | A: Exit-Status des letzten Befehls.
- F: Was steht in $$? | A: Die PID der laufenden Shell/des Skripts.
- F: Wie beendet man eine case-Anweisung? | A: Mit esac.
- F: Wie beendet man if? | A: Mit fi.
- F: Welche Operatoren vergleichen Zahlen? | A: -eq -ne -lt -le -gt -ge.
- F: Was macht shift? | A: Verschiebt Positionsparameter um eins nach links.
- F: Was macht set -e? | A: Bricht das Skript bei einem Fehler ab.
- F: Was ist [[ ]]? | A: Erweiterte Bash-Bedingung (Muster, keine Wortaufspaltung).
- F: Wie liest man zeilenweise eine Datei? | A: while read zeile; do …; done < datei

## Quiz
? Wie beendet man eine if-Anweisung?
* fi
- endif
- end
- done

? Was ist die erste Skriptzeile?
* #!/bin/bash
- #bash
- !#/bin/bash
- //bin/bash

? Welcher Operator prüft numerische Gleichheit?
* -eq
- ==
- =
- eq

? Was steht in $#?
* Anzahl der Parameter
- PID
- Exit-Status
- Skriptname

? Was bewirkt exit 3?
* Beendet das Skript mit Status 3
- Gibt 3 aus
- Wartet 3 Sekunden
- Startet neu

? Welches Zeichen beendet einen case-Zweig?
* ;;
- ;
- esac
- ::

? Wie debuggt man ein Skript?
* bash -x
- bash -d
- bash -v nur
- debug skript

? Welche Schleife endet mit done?
* for und while
- nur for
- nur case
- if

## Lücken
- Der {Shebang} legt den Interpreter des Skripts fest.
- Der Exit-Status des letzten Befehls steht in {$?}.
- Ein case-Block endet mit {esac}.

## Spickzettel
- #!/bin/bash · chmod +x · ./skript
- $0 $1 $# $@ $* $? $$ · shift · read
- [ -f -d -e -r -w -x -s ] · -eq -ne -lt -gt · = !=
- if/elif/else/fi · case/esac · for/while/until do/done
- bash -x · set -e -u
