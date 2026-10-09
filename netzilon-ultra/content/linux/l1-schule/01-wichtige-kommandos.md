---
id: linux-l1-01-kommandos
bereich: Linux
fach: Linux I
pruefungen: [LPIC-1, Schule]
block: L1
kapitel: Linux I – Grundlagen
titel: 1.01 Wichtige Kommandos der Shell
stufe: Einsteiger
quellen: [1.01_Linux_-_Wichtige_Kommandos.pdf, LPI-Learning-Material-101-500-de.pdf]
verweise: [linux-l1-00-geschichte, linux-101-103-1-befehlszeile, linux-101-103-3-dateiverwaltung, linux-101-103-8-vi, linux-101-104-6-links, linux-102-105-1-shell-umgebung, ref-linux]
---

## Profi

### Shell-Umgebung und Befehlsarten (105.1 / 103.1)
- Die **Shell** liest Befehle, **expandiert** sie (Variablen, Wildcards, Befehlssubstitution) und startet Programme. Ihr Verhalten steuern **Variablen** (vordefiniert und selbst gesetzt).
- **Builtins** (interne Befehle) sind Teil der Shell: `cd`, `echo`, `set`, `export`, `unset`, `type`, `history`. **Externe Programme** sind Dateien im Dateisystem (`/usr/bin/ls`, `cp`, `ssh`) und werden über **`PATH`** gefunden.
- **`type befehl`** zeigt zuverlässig, ob Builtin, Alias, Funktion oder Datei. **`which`** findet nur externe Programme im PATH (`which -a` = alle Treffer) – **keine Builtins**.

### Variablen anzeigen, setzen, exportieren, löschen
| Aktion | Befehl | Hinweis |
|---|---|---|
| anzeigen | `echo $NAME` | `$` liest den Wert |
| setzen | `kurs="LPIC 1"` | **keine Leerzeichen um `=`**, Werte mit Leerzeichen in Anführungszeichen |
| exportieren | `export kurs` / `export kurs=wert` | erst dann sehen **Kindprozesse** die Variable |
| löschen | `unset kurs` | `unset -f name` löscht eine Funktion |
| alle exportierten | `env` | nur Umgebungsvariablen |
| alle | `set` | auch lokale Variablen und Funktionen |
Beispiel: `meine=42; bash -c 'echo $meine'` gibt nichts aus – nach `export meine` gibt die Kind-Shell `42` aus. **PATH** (`/usr/local/bin:/usr/bin:/bin`) bestimmt die Suchreihenfolge für Programme; reservierte Variablen wie PATH nicht löschen.

### Quoting und Escaping
| Zeichen | Wirkung | Beispiel |
|---|---|---|
| `" "` | Variablen und `$( )` werden **ersetzt**, Leerzeichen bleiben zusammen | `echo "$name"` → Linux |
| `' '` | alles bleibt **wörtlich** (literal) | `echo '$name'` → $name |
| `\` | hebt **ein** Sonderzeichen auf | `touch my\ big\ file` |
| `$( )` | **Befehlssubstitution** | `echo "Heute: $(date +%A)"` |
`touch my big file` erzeugt **drei** Dateien (my, big, file), `touch "my big file"` eine.

### Globbing (Wildcards) – die Shell expandiert vor dem Start
- `*` beliebig viele Zeichen (auch keine), `?` genau ein Zeichen, `[abc]` / `[0-9]` ein Zeichen aus Menge/Bereich, `[!abc]` keines davon.
- Beispiele: `ls *.txt`, `ls datei?.log`, `ls bild[0-9].png`. Tipp: vor `rm *.log` erst `ls *.log`.

### Navigieren
- **`cd`** (Builtin): `cd ~` bzw. `cd` → Home, `cd ..` eine Ebene hoch, `cd -` zurück zum vorherigen Verzeichnis, `cd /etc` absolut.
- **`tree`**: `-a` versteckte, `-d` nur Verzeichnisse, `-L 2` Tiefe begrenzen, `-f` volle Pfade, `-h` Größen menschenlesbar (meist nachzuinstallieren: `apt install tree`).
- **`find <pfad> <kriterien> [aktion]`**: `-name "*.log"`, `-iname` (ohne Groß/Klein), `-type f|d|l`, `-size +10M`, `-mtime -7` (in den letzten 7 Tagen geändert), `-user`, `-perm`, `-exec befehl {} \;`. Je nach Pfad Root-Rechte nötig (sonst „Permission denied“).

### Informationen einholen
- `pwd` (print working directory), `whoami` (effektiver Benutzer – nach `sudo` = root).
- `ls`: `-l` Langformat, `-a` alle (auch `.versteckt`), `-h` lesbare Größen, `-t` nach Zeit, `-r` umgekehrt, `-R` rekursiv, `-d` Verzeichnis selbst, `-i` Inode.
- `uname`: `-a` alles, `-s` Kernelname, `-r` Release (z. B. 6.8.0-40-generic), `-v` Build, `-m` Architektur (x86_64), `-o` Betriebssystem.
- **`man`**: Aufbau NAME · SYNOPSIS · DESCRIPTION · OPTIONS · EXAMPLES · SEE ALSO; **Sektionen** 1 Benutzerbefehle, 5 Dateiformate, 8 Administration (z. B. `man 5 passwd`, `man 5 crontab`). Navigation: `/text` suchen, `n`/`N` nächster/vorheriger Treffer, `q` beenden.
- **`apropos stichwort`** = `man -k` (durchsucht Kurzbeschreibungen; `-w` Wildcards, `-e` exakt, `-a` UND). **`whatis ls`** = `man -f` (Einzeiler).
- **`history`**: `!42` Befehl 42 erneut, `!!` letzter Befehl, **Strg+R** rückwärts suchen, ↑/↓ blättern.
- Dateien ansehen: `cat -n` (nummeriert), `less` (seitenweise, `q` beendet), `head -n 5`, `tail -n 5`, **`tail -f`** (Log live mitlesen).

### Dateien anlegen, kopieren, löschen
- `mkdir -p a/b/c` (ganzen Pfad), `-v` verbose; `rmdir` löscht **nur leere** Verzeichnisse (`-p` ganzen leeren Pfad).
- `rm`: `-r` rekursiv, `-f` erzwingen, `-i` nachfragen, `-d` leeres Verzeichnis. **Kein Papierkorb!**
- `touch datei`: Zeitstempel aktualisieren oder leere Datei anlegen; `-t 202601011200` bestimmter Zeitstempel.
- `mv quelle ziel` verschiebt **oder benennt um** (`-i`, `-f`, `-u`). `cp` (`-r` rekursiv, `-i`, `-p` Rechte/Zeiten erhalten, `-u` nur wenn neuer, `-a` Archivmodus).
- `ln ziel name` = **Hardlink** (gleicher Inode, gleiches Dateisystem); `ln -s ziel name` = **Symlink** (eigener Inode, zeigt auf Pfad, geht über Dateisystemgrenzen und auf Verzeichnisse, bricht, wenn das Ziel verschwindet). `cp -l` / `cp -s` legen Links statt Kopien an.

### Editoren
- **vi/vim**: arbeitet mit **Modi**. Start im **Normalmodus**; `i`/`a` → Einfügemodus (vor/nach Cursor), **Esc** zurück; `:` → Befehlszeile. `:w` speichern, `:q` beenden, `:q!` ohne Speichern beenden, `:wq` bzw. `ZZ` speichern und beenden, `/text` suchen, `dd`/`yy` Zeile löschen/kopieren, `p` einfügen. Details → 103.8.
- **nano**: keine Modi, Kürzel mit Strg (`^`): `^O` speichern (WriteOut), `^X` beenden, `^W` suchen (Where Is), `^K` Zeile ausschneiden, `^U` einfügen, `^G` Hilfe.

## Einfach

Die **Shell** ist wie ein **Dolmetscher**: Du sagst ihr etwas in ihrer Sprache, sie versteht es und ruft das richtige Programm.

**Variablen** sind **Notizzettel** mit einem Namen drauf. `kurs="LPIC 1"` schreibt „LPIC 1“ auf den Zettel „kurs“. Mit `echo $kurs` liest du ihn vor. Aber: Der Zettel liegt nur **auf deinem Schreibtisch**. Wenn du ein neues Programm startest (ein „Kind“), sieht es den Zettel nicht. Erst mit **`export`** kopierst du den Zettel an die **Pinnwand**, die alle Kinder sehen.

Einige Befehle **kann die Shell selbst** (wie `cd` – das ist ihr eigener Muskel), andere sind **eigene Programme** im Werkzeugschrank (`ls` liegt in `/usr/bin`). **PATH** ist die **Liste der Schubladen**, in denen die Shell nach Werkzeugen sucht. Mit `type` fragst du: „Kannst du das selbst, oder ist das ein Werkzeug?“

**Leerzeichen** sind für die Shell wie **Kommas** – sie trennen Wörter. `touch my big file` macht drei Dateien. Willst du eine Datei „my big file“, musst du sie in **Anführungszeichen** packen. Doppelte `" "` sind ein **durchsichtiger Beutel** (die Shell schaut rein und setzt Variablen ein), einfache `' '` sind ein **undurchsichtiger Beutel** (alles bleibt genau so).

**Wildcards** sind **Joker**: `*` heißt „egal was“, `?` heißt „genau ein Zeichen“. `ls *.txt` zeigt alle Textdateien.

Zum **Herumlaufen**: `pwd` = „Wo stehe ich?“, `cd` = „Geh dorthin“, `ls` = „Was liegt hier?“, `find` = „Such mir das!“. `cd ..` geht eine Etage hoch, `cd -` springt zurück wie die **Zurück-Taste** im Browser.

Wenn du nicht weiterweißt: **`man befehl`** ist die **Bedienungsanleitung**. Mit `q` kommst du wieder raus.

**Vorsicht mit `rm`**: Es gibt **keinen Papierkorb**. Was weg ist, ist weg – wie Papier im Schredder.

**nano** ist wie ein einfacher Notizblock (unten stehen die Tasten), **vi** ist wie ein Profi-Werkzeug mit zwei Gängen: **Fahren** (Befehle) und **Schreiben** (Einfügen mit `i`). Mit **Esc** schaltest du zurück, mit `:wq` speicherst und beendest du.

## Merksatz
- **Ohne export kein Erbe**: Nur exportierte Variablen sehen Kindprozesse.
- **Doppelte Anführungszeichen denken mit, einfache sind stur**.
- **type kennt alles, which nur Dateien**.
- **`name=wert` ohne Leerzeichen** – sonst hält die Shell `name` für einen Befehl.
- **vi: Esc – :wq – fertig**. nano: **^O speichert, ^X beendet**.
- **Erst `ls *`, dann `rm *`**.

## Prüfungsfalle
- `kurs = "LPIC"` (mit Leerzeichen) ist **keine Zuweisung**, sondern Aufruf des Befehls `kurs`.
- **`which cd`** liefert nichts – `cd` ist ein Builtin → `type cd`.
- **`env` zeigt nur exportierte**, **`set` alle** Variablen (inkl. Funktionen).
- Backslash maskiert **Sonderzeichen**, nicht Buchstaben.
- **`rmdir`** löscht nur **leere** Verzeichnisse – für volle `rm -r`.
- `tree` begrenzt die Tiefe mit **`-L`**, nicht mit `-R` (Quelle früherer Version korrigiert).
- `man 5 passwd` (Dateiformat) ≠ `man 1 passwd` (Befehl).
- `cp` ohne `-r` kopiert keine Verzeichnisse.

## Grafik

### export und Kindprozess
1. Shell: `meine=42` – lokale Shell-Variable
2. Shell -> Kind-Shell: `bash -c 'echo $meine'` startet Kind
3. Kind-Shell: sieht nichts – leere Ausgabe
4. Shell: `export meine` – Variable kommt in die Umgebung
5. Shell -> Kind-Shell: Umgebung wird vererbt
6. Kind-Shell: gibt 42 aus

### Befehlssuche über PATH
1. Benutzer -> Shell: tippt `ls`
2. Shell: prüft Alias, Funktion, Builtin
3. Shell -> /usr/local/bin: sucht ls – nicht gefunden
4. Shell -> /usr/bin: findet /usr/bin/ls
5. Shell -> Kernel: startet das Programm (exec)

### Quoting
1. Shell: `name=Linux`
2. "$name": wird zu Linux (durchsichtiger Beutel)
3. '$name': bleibt $name (undurchsichtiger Beutel)
4. \$name: einzelnes $ maskiert, Ausgabe $name

## Lab
**Maschine**: debian01 (Debian/Ubuntu), normaler Benutzer.
```bash
# auf debian01 – Variablen und export
kurs="LPIC 1"; echo "$kurs läuft"; echo '$kurs läuft'
meine=42; bash -c 'echo "Kind sieht: $meine"'
export meine; bash -c 'echo "Kind sieht: $meine"'
unset kurs; echo "[$kurs]"
env | grep HOME; set | head -3

# auf debian01 – Befehlsarten
type cd; type ls; which ls; which -a ls; type ll

# auf debian01 – Quoting und Globbing
mkdir -p ~/lab101 && cd ~/lab101
touch my big file; ls; rm my big file
touch "my big file" datei1.log datei2.log bild3.png bild7.png brief.txt
ls *.txt; ls datei?.log; ls bild[0-9].png

# auf debian01 – Navigieren und Suchen
cd ..; cd -; tree -L 1 ~
find ~ -name "*.log"; find /etc -type f -size +100k 2>/dev/null
find ~/lab101 -mtime -1 -exec ls -l {} \;

# auf debian01 – Hilfe und History
man 5 passwd; apropos copy; whatis ls; history | tail -3

# auf debian01 – Dateien verwalten
mkdir -p a/b/c; rmdir -p a/b/c
cp -p brief.txt brief.bak; mv brief.bak alt.txt; rm -i alt.txt
ln -s /etc/hosts h; ls -l h
```

## Befehle
- `type befehl` – zeigt, ob Builtin, Alias, Funktion oder Datei
- `which -a befehl` – alle Pfade eines externen Programms im PATH
- `env` – alle Umgebungsvariablen (exportiert)
- `set` – alle Variablen und Funktionen der Shell
- `export NAME=wert` – Variable setzen und an Kindprozesse vererben
- `unset NAME` – Variable löschen
- `echo "$(date +%A)"` – Befehlssubstitution in Text einsetzen
- `cd -` – zurück ins vorherige Verzeichnis
- `tree -L 2 -d` – nur Verzeichnisse, zwei Ebenen tief
- `find /etc -type f -size +1M` – Dateien über 1 MiB in /etc
- `find . -mtime -7 -exec ls -l {} \;` – Befehl auf jede Fundstelle anwenden
- `ls -lah` – Langformat, alle Dateien, lesbare Größen
- `uname -r` – Kernel-Release
- `man 5 crontab` – Handbuch Sektion 5 (Dateiformat)
- `apropos copy` – Manpages nach Stichwort (= man -k)
- `whatis ls` – Einzeiler-Beschreibung (= man -f)
- `history` – Befehlshistorie; `!!` letzter, `!42` Nummer 42
- `tail -f /var/log/syslog` – Log live mitlesen
- `mkdir -p a/b/c` – Verzeichnispfad anlegen
- `rm -ri ordner` – rekursiv mit Rückfrage löschen
- `cp -rp quelle ziel` – rekursiv kopieren, Rechte und Zeiten erhalten
- `ln -s ziel name` – symbolischen Link anlegen

## Übungen
- A: Wie erzeugst du mit touch genau eine Datei namens „my big file“? | L: touch "my big file" oder touch my\ big\ file.
- A: Warum gibt `bash -c 'echo $meine'` nach `meine=42` nichts aus? | L: meine ist nur eine lokale Shell-Variable; erst export meine vererbt sie an Kindprozesse.
- A: Was liefern `echo "$name"` und `echo '$name'` bei name=Linux? | L: "$name" → Linux (Ersetzung), '$name' → $name (wörtlich).
- A: Finde alle Dateien unter /etc, die größer als 1 MiB sind. | L: find /etc -type f -size +1M
- A: Wie springst du in das zuvor besuchte Verzeichnis zurück? | L: cd -
- A: Wie öffnest du die Manpage zum Dateiformat von passwd? | L: man 5 passwd
- A: Wie führst du Befehl Nr. 41 aus der History erneut aus? | L: !41
- A: Lege a/b/c in einem Schritt an und entferne den leeren Pfad wieder. | L: mkdir -p a/b/c; rmdir -p a/b/c
- A: Wie verlässt du vi, ohne zu speichern? | L: Esc, dann :q!

## Karteikarten
- F: Was ist ein Shell-Builtin? | A: Ein Befehl, der Teil der Shell selbst ist (z. B. cd, echo, export) und nicht als Datei im PATH gesucht wird.
- F: Wie prüfst du, ob ein Befehl Builtin oder Programm ist? | A: Mit type befehl (which findet keine Builtins).
- F: Unterschied zwischen env und set? | A: env zeigt nur exportierte Umgebungsvariablen, set alle Variablen inkl. lokaler und Funktionen.
- F: Was bewirkt export? | A: Es macht eine Shell-Variable zur Umgebungsvariablen, die an Kindprozesse vererbt wird.
- F: Was ist der Unterschied zwischen "..." und '...'? | A: In doppelten Anführungszeichen werden $Variablen und $( ) ersetzt, in einfachen bleibt alles wörtlich.
- F: Was bedeuten die Wildcards *, ? und [0-9]? | A: * beliebig viele Zeichen, ? genau ein Zeichen, [0-9] ein Zeichen aus dem Bereich.
- F: Was macht find . -mtime -7? | A: Findet Dateien, die in den letzten 7 Tagen geändert wurden.
- F: Welche man-Sektionen sind 1, 5 und 8? | A: 1 Benutzerbefehle, 5 Dateiformate/Konfigurationsdateien, 8 Administrationsbefehle.
- F: Welche Befehle entsprechen man -k und man -f? | A: man -k = apropos, man -f = whatis.
- F: Was macht Strg+R in der Bash? | A: Rückwärtssuche in der Befehlshistorie.
- F: Was ist der Unterschied zwischen Hardlink und Symlink? | A: Hardlink: gleicher Inode, nur im selben Dateisystem. Symlink: eigener Inode, verweist auf einen Pfad, kann über Dateisysteme und auf Verzeichnisse zeigen, bricht bei gelöschtem Ziel.
- F: Wie speicherst und beendest du nano? | A: Strg+O speichern, Strg+X beenden.
- F: Was macht tail -f? | A: Zeigt das Dateiende und gibt neue Zeilen live aus (Logs mitlesen).

## Quiz
? Welcher Befehl ist ein Shell-Builtin?
* cd
- ls
- cp
- ssh

? Was gibt `which cd` in der Bash typischerweise aus?
* Nichts bzw. keinen Pfad, da cd ein Builtin ist
- /usr/bin/cd
- cd is a shell builtin
- /bin/bash
! type cd meldet „cd is a shell builtin“.

? Welche Zuweisung ist korrekt?
* kurs="LPIC 1"
- kurs = "LPIC 1"
- $kurs="LPIC 1"
- set kurs "LPIC 1"

? Welcher Befehl zeigt nur exportierte Umgebungsvariablen?
* env
- set
- echo $*
- unset

? Was gibt `echo '$HOME'` aus?
* $HOME
- /home/benutzer
- HOME
- Eine leere Zeile

? Welches Muster passt auf datei1.log, aber nicht auf datei10.log?
* datei?.log
- datei*.log
- datei[0-9]*.log
- *.log

? Wie findest du alle Verzeichnisse unter /var?
* find /var -type d
- find /var -name d
- find -d /var
- ls -d /var/*

? Welche Manpage zeigt das Format der Datei /etc/passwd?
* man 5 passwd
- man 1 passwd
- man 8 passwd
- man passwd.conf

? Wie verlässt du vim und speicherst dabei?
* :wq
- :q!
- Strg+X
- Strg+O

? Was passiert bei `touch my big file`?
* Es entstehen drei Dateien: my, big und file
- Es entsteht eine Datei „my big file“
- Es gibt einen Syntaxfehler
- Es entsteht die Datei „my“ mit Inhalt „big file“

## Spickzettel
- type (alles) · which (nur PATH) · env (exportiert) · set (alles)
- name=wert ohne Leerzeichen · export name · unset name
- "…" ersetzt · '…' wörtlich · \ ein Zeichen · $( ) Befehlssubstitution
- * beliebig · ? genau eins · [0-9] Bereich
- cd - zurück · find pfad -name/-type/-size/-mtime/-exec
- man 1/5/8 · apropos = man -k · whatis = man -f
- !! · !42 · Strg+R
- rmdir nur leer · rm -r rekursiv · cp -rp · ln -s
- vi: i, Esc, :wq, :q! · nano: ^O, ^X
