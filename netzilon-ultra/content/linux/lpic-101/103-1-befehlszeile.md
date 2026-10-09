---
id: linux-101-103-1-befehlszeile
bereich: Linux
fach: Linux I
pruefungen: [LPIC-1]
block: LPIC-101
kapitel: LPIC-1 Prüfung 101 – GNU- und Unix-Befehle
titel: 103.1 Auf der Befehlszeile arbeiten
stufe: Einsteiger
quellen: [LPI-Learning-Material-101-500-de.pdf, 1.01_Linux_-_Wichtige_Kommandos.pdf, 1.02_Linux_-_Kommandozeile_und_Textstroeme.pdf]
verweise: [linux-l1-01-kommandos, linux-101-103-4-pipes, linux-102-105-1-shell-umgebung]
---

## Profi

### Lernziel (Gewicht 4)
Shell bedienen: Befehle eingeben, Umgebung, Historie, Hilfe, Quoting, Befehlsverkettung.

### Aufbau eines Befehls
`befehl [optionen] [argumente]`, z. B. `ls -l /etc`. Kurzoptionen `-l`, gebündelt `-la`, Langoptionen `--all`. Groß-/Kleinschreibung wird beachtet. Befehlstypen: externes Programm, **Shell-Builtin** (`cd`, `echo`, `type`), Alias, Funktion. `type befehl`, `which`, `whereis` zeigen, was gemeint ist.

### Wichtige Befehle
`pwd`, `cd` (`cd -`, `cd ~`), `echo`, `uname -a` (`-r` Kernel), `whoami`, `date`, `history`, `man`, `clear`, `env`, `export`, `set`, `unset`, `alias`.

### Hilfe
- `man befehl` (Abschnitte 1 Befehle, 5 Dateiformate, 8 Admin), `man -k`/`apropos` (Suche), `whatis`, `befehl --help`, `info`, `/usr/share/doc`.

### Historie und Editieren
- `history`, `!!` (letzter Befehl), `!n`, `!text`, **Strg+R** (Rückwärtssuche), Verlauf in `~/.bash_history`, Größe `HISTSIZE`/`HISTFILESIZE`. Tastenkürzel: Strg+A/E (Zeilenanfang/-ende), Strg+C (Abbruch), Strg+D (EOF/Logout), Strg+L (clear), **Tab** (Vervollständigung).

### Quoting und Expansion
- `\` maskiert ein Zeichen, `'...'` schützt **alles**, `"..."` schützt, erlaubt aber `$variable`, `$(...)`, Backticks. Zeilenumbruch mit `\`.
- Verkettung: `;` nacheinander, `&&` nur bei Erfolg, `||` nur bei Fehler, `&` im Hintergrund.
- **Variablen**: `VAR=wert`, `export VAR`, `$PATH` (Suchpfade für Befehle, durch `:` getrennt), `$HOME`, `$?`. Kommandosubstitution `$(date)`.

## Einfach

Die **Befehlszeile** (Terminal) ist wie ein **Gespräch mit dem Computer in einfachen Sätzen**. Jeder Satz hat drei Teile: das **Verb** (Befehl), **wie** er es tun soll (Optionen) und **woran** (Argument). Beispiel: `ls -l /etc` heißt „Liste (ls) ausführlich (-l) den Ordner /etc auf“.

Linux unterscheidet **Groß- und Kleinschreibung**: `Datei` und `datei` sind verschiedene Namen.

Wenn du nicht weißt, wie ein Befehl funktioniert, fragst du das **Handbuch**: `man ls` öffnet die Anleitung (beenden mit `q`). Oder kurz: `ls --help`. Wenn du nur das Stichwort kennst, hilft `man -k stichwort`.

Du musst nicht alles neu tippen. Mit den **Pfeiltasten** holst du frühere Befehle zurück, mit **Strg+R** suchst du in der Vergangenheit, und mit **Tab** ergänzt die Shell Namen von allein. Das spart Tipparbeit und verhindert Tippfehler.

Mit Anführungszeichen sagst du der Shell, wie sie Sonderzeichen behandeln soll. In **einfachen** Anführungszeichen (`'...'`) bleibt alles, wie es steht. In **doppelten** (`"..."`) werden Variablen wie `$HOME` ersetzt. Und mit `&&` verbindest du Befehle: „Mach das Zweite nur, wenn das Erste geklappt hat.“

## Merksatz
- **Befehl – Option – Argument.**
- **man = Handbuch, q beendet.**
- **'einfach' schützt alles, "doppelt" erlaubt Variablen.**
- **Strg+R sucht, !! wiederholt, Tab vervollständigt.**
- **&& bei Erfolg, || bei Fehler, ; immer.**

## Prüfungsfalle
- `type` zeigt, ob ein Befehl Builtin, Alias oder Programm ist; `which` findet nur Programme im PATH.
- `man -k` = `apropos`; `whatis` zeigt die Kurzbeschreibung.
- `echo '$HOME'` gibt **$HOME** aus, `echo "$HOME"` den Pfad.
- `cd` ohne Argument wechselt ins Home-Verzeichnis, `cd -` zum vorherigen.
- `;` führt immer weiter aus, `&&` nur bei Exit 0.
- `Strg+D` beendet die Shell (EOF), nicht den laufenden Befehl (das macht Strg+C).

## Grafik

### Aufbau eines Befehls
1. Benutzer: tippt ls -l /etc
2. Benutzer -> Shell: Eingabezeile wird zerlegt
3. Shell: Befehl = ls, Option = -l, Argument = /etc
4. Shell -> ls: startet das Programm
5. ls -> Terminal: zeigt die Ausgabe

## Lab
**Maschine**: debian01.
```bash
# auf debian01
uname -a; whoami; pwd; date
type cd; type ls; which ls
man -k copy | head
history | tail -5
echo '$HOME'; echo "$HOME"; echo $(date +%F)
mkdir /tmp/x && cd /tmp/x && pwd
false || echo "fehlgeschlagen"
```

## Befehle
- `pwd` – aktuelles Verzeichnis
- `uname -a` – Systeminformationen
- `type befehl` – Befehlsart
- `man befehl` – Handbuch
- `man -k wort` – Handbuch durchsuchen
- `history` – Befehlsverlauf
- `!!` – letzten Befehl wiederholen
- `echo "text"` – Text ausgeben
- `alias` – Aliase anzeigen

## Übungen
- A: Wie suchst du Handbuchseiten zu "password"? | L: man -k password (apropos password)
- A: Welche Taste ergänzt Dateinamen? | L: Tab
- A: Wie wiederholst du den letzten Befehl? | L: !! oder Pfeil-hoch/Enter
- A: Was gibt echo "$USER" aus im Gegensatz zu echo '$USER'? | L: Den Benutzernamen bzw. den Text $USER.
- A: Wie bricht man einen laufenden Befehl ab? | L: Strg+C

## Karteikarten
- F: Was zeigt uname -r? | A: Die Kernel-Version.
- F: Was macht type? | A: Zeigt, ob ein Name Alias, Builtin, Funktion oder Programm ist.
- F: Was ist PATH? | A: Mit : getrennte Verzeichnisliste, in der Befehle gesucht werden.
- F: In welcher Datei steht der Bash-Verlauf? | A: ~/.bash_history
- F: Was bewirkt Strg+R? | A: Rückwärtssuche im Befehlsverlauf.
- F: Welcher man-Abschnitt gilt für Dateiformate? | A: 5.
- F: Was macht &? | A: Startet einen Befehl im Hintergrund.
- F: Was bewirkt der Backslash? | A: Maskiert das folgende Sonderzeichen.
- F: Was ist ein Shell-Builtin? | A: Befehl, der in der Shell eingebaut ist (cd, echo, type).
- F: Welcher Befehl zeigt eine Kurzbeschreibung? | A: whatis

## Quiz
? Wie ist ein Befehl aufgebaut?
* Befehl, Optionen, Argumente
- Argumente, Befehl, Optionen
- Optionen, Argumente, Befehl
- Nur Befehl

? Was gibt echo '$HOME' aus?
* $HOME
- /home/benutzer
- Nichts
- Einen Fehler

? Welcher Befehl sucht Handbuchseiten nach Stichwort?
* man -k
- man -s
- info -f
- help -k

? Was bewirkt cd -?
* Wechsel ins vorherige Verzeichnis
- Wechsel ins Home
- Wechsel nach /
- Abbruch

? Welche Tastenkombination startet die Rückwärtssuche im Verlauf?
* Strg+R
- Strg+F
- Strg+S
- Strg+H

? Was bewirkt a && b?
* b läuft nur, wenn a erfolgreich war
- b läuft immer
- b läuft nur bei Fehler
- a und b parallel

? Welche Datei speichert den Bash-Verlauf?
* ~/.bash_history
- ~/.history
- /var/log/bash
- ~/.bashrc

? Wie zeigt man, ob cd ein Builtin ist?
* type cd
- which cd
- whereis cd
- find cd

## Spickzettel
- befehl -opt arg · Groß/Klein beachten
- man (1,5,8) · man -k · whatis · --help · info
- !! · !n · Strg+R · Tab · Strg+C / D
- '…' alles geschützt · "…" mit $ · \ maskiert
- ; && || & · type · which
