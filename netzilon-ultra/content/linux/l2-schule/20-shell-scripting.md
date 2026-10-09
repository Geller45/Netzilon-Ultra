---
id: linux-l2-20-shell-scripting
bereich: Linux
fach: Linux II
pruefungen: [LPIC-1, Schule]
block: L2
kapitel: Linux II – Administration
titel: 1.20 Shell-Umgebung und Shell-Scripting (Szenario)
stufe: Fortgeschritten
quellen: [1.20_Linux_-_Shell-Scripting_Szenario.pdf, LPI-Learning-Material-102-500-de.pdf]
verweise: [linux-102-105-1-shell-umgebung, linux-102-105-2-skripte, linux-l1-02-textstroeme, linux-l2-14-automatisierung]
---

## Profi

### Einordnung
**105.1 Shell-Umgebung anpassen (4)** und **105.2 Skripte anpassen oder schreiben (4)** – zusammen Topic 105, 8 Punkte. Szenario: „Die Übergabe-Woche“ – am Ende steht ein `backup.sh`.

### Login-/Non-Login-Shell und Startdateien
| Shell | Gelesene Dateien |
|---|---|
| Login-Shell (bash) | `/etc/profile` (+ `/etc/profile.d/*`), dann **erste vorhandene** von `~/.bash_profile`, `~/.bash_login`, `~/.profile`; beim Logout `~/.bash_logout` |
| Interaktive Non-Login-Shell (Terminalfenster) | `/etc/bash.bashrc` (Debian) bzw. `/etc/bashrc` (RHEL), dann **`~/.bashrc`** |
| Skript | keine (nicht interaktiv) |
- Praxis: In `~/.bash_profile` ein `source ~/.bashrc`, Aliase, Funktionen, Prompt (`PS1`) in `~/.bashrc`. Vorlagen für neue Benutzer: `/etc/skel/`.
- Variablen: **Shell-Variable** `VAR=wert` (nur lokal) vs. **Umgebungsvariable** `export VAR=wert` (an Kindprozesse vererbt). `env`, `printenv`, `set`, `unset`. Wichtig: `PATH`, `HOME`, `USER`, `SHELL`, `PWD`, `LANG`, `EDITOR`.
- **Alias**: `alias ll='ls -l'`, entfernen `unalias`. **Funktion**: `name() { ...; }`. `source datei` bzw. `. datei` führt in der aktuellen Shell aus.

### Skript-Grundlagen
- **Shebang** `#!/bin/bash` in Zeile 1; Rechte `chmod +x`. Starten: `./skript.sh`, `bash skript.sh`, `source skript.sh`, per PATH (`/usr/local/bin`). **Aktuelles Verzeichnis ist nicht im PATH** (daher `./`).
- Variablen: `name="Welt"`, Zugriff `$name`/`${name}`; **Quoting**: `"..."` expandiert Variablen, `'...'` nicht. Kommandosubstitution `$(date +%F)`.
- Parameter: `$0` Skriptname, `$1…$9`, `$#` Anzahl, `$@`/`$*` alle, `$?` **Exit-Status** (0 = Erfolg), `$$` PID. Eingabe: `read -p "Name: " name`.
- Verkettung: `;`, `&&` (nur bei Erfolg), `||` (nur bei Fehler). `exit 1`.
- **Bedingungen**: `test`/`[ ... ]`: Dateitests `-e -f -d -r -w -x -s`, Strings `= != -z -n`, Zahlen `-eq -ne -lt -le -gt -ge`. 
```bash
if [ -f "$datei" ]; then echo ok; elif [ -d "$datei" ]; then echo Ordner; else echo fehlt; fi
case "$1" in start) ... ;; stop) ... ;; *) echo "Usage" ;; esac
for f in *.log; do gzip "$f"; done
while read zeile; do echo "$zeile"; done < datei
```
- Funktionen, `local`, Rückgabewert mit `return`. Sicherer Start: `set -e`, `set -u`. Mail an root: `echo "Text" | mail -s "Betreff" root`.

## Einfach

Eine **Shell** ist der Raum, in dem du mit dem Computer sprichst. Wenn du dich anmeldest, liest sie ein paar **Zettel** mit deinen Wünschen: Wie soll die Eingabezeile aussehen? Welche Abkürzungen (Aliase) kenne ich? Diese Zettel heißen `~/.bash_profile` und `~/.bashrc`. Bei einem **Login** (anmelden) liest sie andere Zettel als beim **Öffnen eines Terminalfensters**.

Eine **Variable** ist eine beschriftete Schachtel mit einem Inhalt: `name="Anna"`. Mit `$name` schaust du hinein. Mit `export` machst du die Schachtel auch für die „Kinder“ (Programme, die du startest) sichtbar.

Ein **Skript** ist ein Rezept, das du aufschreibst, damit der Computer es allein kocht. Die erste Zeile (`#!/bin/bash`) sagt: „Dieses Rezept liest der Koch Bash.“ Dann gibst du dem Rezept die Erlaubnis zu laufen (`chmod +x`) und startest es mit `./rezept.sh`.

Du kannst im Rezept **entscheiden** („wenn die Datei existiert, dann ...“, `if`), **wiederholen** („für jede Datei tu ...“, `for`) und **fragen** (`read`). Jedes Programm meldet am Ende eine Zahl: **0 heißt „alles gut“**, alles andere heißt „etwas ging schief“. Diese Zahl steht in `$?`.

Mit `&&` sagst du: „Mach das Zweite nur, wenn das Erste geklappt hat.“ Mit `||`: „Mach das Zweite nur, wenn das Erste schiefging.“ Klingt klein, spart aber viel Ärger, besonders bei Backup-Skripten.

## Merksatz
- **0 = gut, alles andere = Fehler.**
- **&& = und dann, || = sonst.**
- **"Doppelt" expandiert, 'einfach' nicht.**
- **Login: profile, Terminal: bashrc.**
- **export macht Variablen für Kindprozesse sichtbar.**
- **Shebang in Zeile 1, chmod +x, dann ./skript.**
- **Leerzeichen in [ ] sind Pflicht.**

## Prüfungsfalle
- In `[ "$a" = "$b" ]` sind die **Leerzeichen innen** Pflicht; Zahlen vergleicht man mit `-eq`, nicht mit `=`.
- Variablen immer in **Anführungszeichen** (`"$datei"`), sonst Probleme bei Leerzeichen.
- `./skript.sh` nötig, weil `.` nicht im PATH liegt.
- `source skript` läuft in der **aktuellen** Shell (Variablen bleiben), `bash skript` in einer Kind-Shell.
- Die Login-Shell liest **nur die erste** vorhandene Datei aus `.bash_profile`, `.bash_login`, `.profile`.
- `$@` und `$*` unterscheiden sich in Anführungszeichen.
- `$#` ist die Anzahl der Parameter, `$0` der Skriptname.
- `'$HOME'` gibt den Text, `"$HOME"` den Wert aus.
- SUID-Bit auf Shell-Skripten wird vom Kernel ignoriert/ist gefährlich.

## Grafik

### Start einer Login-Shell
1. Benutzer -> Login-Shell: Anmeldung auf der Konsole
2. Login-Shell -> /etc/profile: wird zuerst gelesen
3. Login-Shell -> ~/.bash_profile: erste vorhandene Benutzerdatei
4. ~/.bash_profile -> ~/.bashrc: source ~/.bashrc lädt Aliase und Prompt
5. Login-Shell: Prompt erscheint

### Ablauf eines Skripts
1. Benutzer -> Skript: ./backup.sh /home
2. Skript: prüft mit if [ -d "$1" ]
3. Skript -> tar: tar czf backup.tar.gz "$1"
4. tar -> Skript: Exit-Status in $?
5. Skript -> Benutzer: "OK" bei 0, sonst Mail an root

## Lab
**Maschine**: srv-web01 (Debian 12), Benutzer anna.
```bash
# auf srv-web01 – Umgebung
echo 'alias ll="ls -lah"' >> ~/.bashrc
echo 'export EDITOR=nano' >> ~/.bashrc
source ~/.bashrc
env | grep EDITOR

# auf srv-web01 – backup.sh
cat > ~/backup.sh <<'X'
#!/bin/bash
set -u
quelle="${1:-/etc}"
ziel="/tmp/backup-$(date +%F).tar.gz"
if [ ! -d "$quelle" ]; then
  echo "Quelle fehlt: $quelle" | mail -s "Backup-Fehler" root
  exit 1
fi
if tar czf "$ziel" "$quelle" 2>/dev/null; then
  echo "OK: $ziel"
else
  echo "Fehler" >&2; exit 2
fi
X
chmod +x ~/backup.sh
./backup.sh /etc; echo "Exit: $?"
./backup.sh /gibtsnicht; echo "Exit: $?"

# auf srv-web01 – Schleife und case
for f in /var/log/*.log; do echo "$f"; done
```

## Befehle
- `export VAR=wert` – Umgebungsvariable setzen
- `env` / `printenv` – Umgebung anzeigen
- `alias ll='ls -l'` – Alias definieren
- `source datei` / `. datei` – in aktueller Shell ausführen
- `read -p "Text" var` – Eingabe lesen
- `test -f datei` / `[ -f datei ]` – Dateitest
- `echo $?` – letzter Exit-Status
- `chmod +x skript.sh` – ausführbar machen
- `bash -x skript.sh` – Skript im Debug-Modus
- `set -e` / `set -u` – Abbruch bei Fehler / ungesetzter Variable

## Übungen
- A: Welche Datei liest ein Terminalfenster (Non-Login-Shell)? | L: ~/.bashrc
- A: Wie machst du ein Skript ausführbar und startest es? | L: chmod +x skript.sh; ./skript.sh
- A: Was bedeutet $? == 0? | L: Der letzte Befehl war erfolgreich.
- A: Was ergibt echo '$HOME' und echo "$HOME"? | L: Erster Text $HOME, zweiter der Pfad des Home-Verzeichnisses.
- A: Schreibe eine Bedingung "Datei existiert und ist regulär". | L: if [ -f "$datei" ]; then ... fi
- A: Wie prüfst du, ob $1 größer als 5 ist? | L: if [ "$1" -gt 5 ]; then ... fi
- A: Wie startest du ein Skript im Debug-Modus? | L: bash -x skript.sh

## Karteikarten
- F: Was gehört in die erste Skriptzeile? | A: Der Shebang, z. B. #!/bin/bash.
- F: Was enthält $#? | A: Die Anzahl der Positionsparameter.
- F: Was enthält $? | A: Den Exit-Status des letzten Befehls.
- F: Was bewirkt && zwischen zwei Befehlen? | A: Der zweite läuft nur, wenn der erste erfolgreich war (Exit 0).
- F: Was bewirkt export? | A: Macht eine Variable für Kindprozesse verfügbar.
- F: Welche Datei liest eine Login-Shell zuerst? | A: /etc/profile.
- F: Wo liegen Vorlagen für neue Benutzer? | A: /etc/skel/
- F: Mit welchem Operator vergleicht man Zahlen in [ ]? | A: -eq, -ne, -lt, -le, -gt, -ge.
- F: Was macht source? | A: Führt ein Skript in der aktuellen Shell aus.
- F: Wie liest man eine Eingabe in eine Variable? | A: read variable (mit -p für Prompt).
- F: Was ergibt $(date +%F)? | A: Die Ausgabe des Befehls (Kommandosubstitution), z. B. 2026-10-08.

## Quiz
? Welche Datei liest eine interaktive Non-Login-Shell typischerweise?
* ~/.bashrc
- /etc/passwd
- ~/.bash_logout
- /etc/shadow

? Was bedeutet der Exit-Status 0?
* Erfolg
- Fehler
- Abbruch durch Signal
- Befehl nicht gefunden

? Wie führt man ein Skript im aktuellen Verzeichnis aus, wenn . nicht im PATH ist?
* ./skript.sh
- skript.sh
- run skript.sh
- ~skript.sh

? Was ergibt echo '$HOME'?
* $HOME als Text
- Pfad des Home-Verzeichnisses
- Einen Fehler
- Eine leere Zeile

? Welcher Test prüft, ob eine Datei ein Verzeichnis ist?
* [ -d datei ]
- [ -f datei ]
- [ -e datei ]
- [ -x datei ]

? Was macht command1 || command2?
* command2 läuft nur, wenn command1 fehlschlägt
- command2 läuft immer
- command2 läuft nur bei Erfolg von command1
- Beide laufen parallel

? Welcher Operator prüft numerische Gleichheit in [ ]?
* -eq
- ==
- =
- eq

? Welche Variable enthält die Anzahl der Parameter?
* $#
- $?
- $$
- $0

? Was bewirkt export?
* Variable wird an Kindprozesse vererbt
- Variable wird in eine Datei geschrieben
- Variable wird gelöscht
- Variable wird schreibgeschützt

? Welcher Befehl führt eine Datei in der aktuellen Shell aus?
* source
- bash
- exec ./
- run

## Lücken
- Die erste Zeile eines Bash-Skripts ist der {Shebang} #!/bin/bash.
- Der Exit-Status des letzten Befehls steht in {$?}.
- Variablen für Kindprozesse macht man mit {export} sichtbar.

## Spickzettel
- Login: /etc/profile → ~/.bash_profile · Terminal: ~/.bashrc
- VAR=x · export · env · alias · source
- #!/bin/bash · chmod +x · ./skript
- $0 $1 $# $@ $? $$ · "…" expandiert, '…' nicht
- [ -f -d -e -x ] · -eq -lt -gt · = !=
- && wenn Erfolg · || wenn Fehler · exit n
- if/elif/else · case · for · while read
- bash -x zum Debuggen
