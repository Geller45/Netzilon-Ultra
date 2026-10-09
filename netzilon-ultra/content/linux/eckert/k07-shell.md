---
id: linux-eckert-k07-shell
bereich: Linux
fach: Linux I
pruefungen: [LPIC-1, Schule]
block: CompTIA Linux+ / LPIC-1 (Eckert)
kapitel: Eckert – CompTIA Linux+ and LPIC-1 (6th Edition)
titel: Kap. 7 Arbeiten mit der Shell (Umleitung, Variablen, Skripte, Git, Zsh)
stufe: Fortgeschritten
quellen: [Eckert_J._W._and_triOS_College_-_CompTIA_Linux_and_LPIC-1_6th_Edition_-_2024.pdf]
verweise: [linux-101-103-4-pipes,linux-102-105-1-shell-umgebung,linux-102-105-2-skripte]
---

## Profi

### Datenströme
**stdin** (0), **stdout** (1), **stderr** (2). Umleitung `>`, `>>`, `<`, `2>`, `2>&1`, `&>`, Here-Document `<<EOF`. **Pipe** `|`, `tee`. Filter `sort`, `uniq`, `cut`, `wc`, `tr`, `sed`, `awk`.

### Variablen
Shell- vs. **Umgebungsvariablen** (`export`), `env`, `set`, `unset`. Wichtige: `PATH`, `HOME`, `PS1`, `LANG`. Übernahme beim Login aus Umgebungsdateien: `/etc/profile`, `/etc/bashrc` bzw. `/etc/bash.bashrc`, `~/.bash_profile`, `~/.bash_login`, `~/.profile` (**Login-Shell**), `~/.bashrc` (**Nicht-Login/interaktive Shell**), `~/.bash_logout`. `umask`, **Aliase** (`alias ll='ls -l'`, `unalias`).

### Shell-Skripte
Shebang `#!/bin/bash`, `chmod +x`. **Sonderparameter**: `$0 $1 … $# $@ $* $? $$ $!`. Befehlsersetzung `$( )`, Arithmetik `$(( ))`, `read`, `echo`, `exit`.
- Bedingungen: `if [ … ]; then … elif … else … fi`, `test`, `[[ ]]`; `case … esac`; Operatoren `-eq -lt -gt -f -d -e -z -n`, `&&`, `||`.
- Schleifen: `for`, `while`, `until`, `break`, `continue`. **Funktionen** `name() { … }`, Funktionsbibliotheken per `source`/`.`.

### Git (Versionsverwaltung)
`git init`, `git clone`, `git status`, `git add`, `git commit -m`, `git log`, `git branch`, `git switch/checkout`, `git merge`, `git diff`, `git revert/reset`, `git push/pull`. **Stage → Commit → Branch → Merge.** Repository enthält `.git`, Hauptzweig `main`.

### Z shell
Zsh ist eine Obermenge der BASH mit erweiterter Funktionalität (Vervollständigung, Plugins, Themes, Funktionsbibliotheken).

## Einfach

Jeder Befehl hat drei „Leitungen“: Eingang (stdin), Ausgang (stdout) und eine Leitung für Fehlermeldungen (stderr). Normalerweise geht der Ausgang auf den Bildschirm. Mit **Umleitungen** kannst du ihn woandershin schicken: `ls > liste.txt` schreibt in eine Datei, `befehl 2> fehler.txt` sammelt nur die Fehler. Mit der **Pipe** `|` füttert die Ausgabe eines Befehls direkt den nächsten.

**Variablen** sind Namen mit Wert, wie `NAME=Anna`. Manche Variablen sind für die ganze Umgebung da, zum Beispiel `PATH` (wo sucht die Shell Programme?). Sie stehen in Dateien, die beim Anmelden gelesen werden, zum Beispiel `~/.bashrc`. Dort definierst du auch **Aliase**, Abkürzungen wie `ll` für `ls -l`.

Ein **Shell-Skript** ist eine Datei voller Befehle. Es beginnt mit `#!/bin/bash`. Im Skript kannst du entscheiden (`if`), wiederholen (`for`, `while`) und eigene kleine Unterprogramme schreiben (**Funktionen**). Das erste Argument steht in `$1`, das Ergebnis des letzten Befehls in `$?`.

**Git** ist ein Zeitreise-Werkzeug für Dateien. Du machst mit `git add` und `git commit` einen „Schnappschuss“ (Commit) und kannst später zu jedem alten Stand zurück. Mit **Branches** probierst du Neues aus, ohne das Original zu gefährden, und führst es später mit `merge` zusammen.

Die **Z-Shell (zsh)** ist wie BASH, nur mit mehr Komfort.

## Merksatz
- **> neu, >> anhängen, 2> Fehler, | weiterreichen.**
- **Login: .bash_profile, interaktiv: .bashrc.**
- **Git: add → commit → branch → merge.**
- **$? = 0 heißt Erfolg.**

## Prüfungsfalle
- `.bash_profile` wird nur bei **Login-Shells** gelesen, `.bashrc` bei jeder interaktiven Nicht-Login-Shell.
- Variablen ohne `export` sind in Kindprozessen unbekannt.
- `git add` stellt bereit (stage), `git commit` speichert.
- `2>&1` muss nach `>` stehen.

## Grafik

### Git-Ablauf
1. Entwickler -> Arbeitsverzeichnis: Datei ändern
2. Arbeitsverzeichnis -> Staging: git add datei
3. Staging -> Repository: git commit -m "Text"
4. Repository -> Remote: git push
5. Remote -> Kollegen: git pull

## Befehle
- `export VAR=wert` – Umgebungsvariable
- `alias ll='ls -l'` – Alias
- `source ~/.bashrc` – neu laden
- `git commit -m "text"` – Schnappschuss
- `git branch neu` – Zweig
- `git merge neu` – zusammenführen
- `tee datei` – Ausgabe teilen

## Übungen
- A: Wie leitest du stdout und stderr in eine Datei? | L: `befehl > datei 2>&1` oder `befehl &> datei`
- A: Welche Datei lädt für Nicht-Login-Shells Aliase? | L: ~/.bashrc
- A: Wie zeigst du Änderungen vor dem Commit? | L: `git diff`

## Karteikarten
- F: Welche Nummern haben stdin/stdout/stderr? | A: 0/1/2
- F: Was macht tee? | A: Schreibt in Datei und gibt gleichzeitig auf stdout aus.
- F: Was ist ein Alias? | A: Kurzname für einen Befehl.
- F: Wann liest BASH ~/.bash_profile? | A: Bei Login-Shells.
- F: Was ist $@? | A: Alle Argumente einzeln.
- F: Was ist $$ ? | A: PID der aktuellen Shell.
- F: Was ist ein Git-Commit? | A: Schnappschuss des Stands mit Nachricht.
- F: Was macht git clone? | A: Kopiert ein Repository.
- F: Was ist ein Branch? | A: Entwicklungszweig.
- F: Was ist Zsh? | A: Shell, die eine Obermenge der BASH bietet.

## Quiz
? Welche Umleitung hängt an?
* >>
- >
- 2>
- <

? Welches Symbol verbindet Befehle?
* |
- ;
- &
- >

? Welche Datei wird bei einer Login-Shell gelesen?
* ~/.bash_profile
- ~/.bashrc only
- ~/.bash_logout
- /etc/hosts

? Was ist $?
* Rückgabewert des letzten Befehls
- PID
- Argumentanzahl
- Skriptname

? Welcher Git-Befehl speichert einen Schnappschuss?
* git commit
- git add
- git clone
- git push

? Wie vereint man Zweige?
* git merge
- git branch
- git switch
- git init

? Was macht export?
* Macht Variablen für Kindprozesse sichtbar
- Löscht Variablen
- Schreibt in Datei
- Startet Skripte

? Wofür steht 2> ?
* Umleitung von stderr
- Umleitung von stdout
- Anhängen
- Pipe

## Lücken
- {stdout} hat die Nummer 1, {stderr} die Nummer 2.
- Mit {git add} wird eine Änderung für den Commit vorgemerkt.
- {~/.bashrc} wird von interaktiven Nicht-Login-Shells gelesen.

## Spickzettel
- > >> < 2> 2>&1 |
- .bash_profile (login) · .bashrc (interaktiv)
- $0 $1 $# $@ $? $$
- git add/commit/branch/merge
