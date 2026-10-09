---
id: linux-l1-02-textstroeme
bereich: Linux
fach: Linux I
pruefungen: [LPIC-1, Schule]
block: L1
kapitel: Linux I – Grundlagen
titel: 1.02 Kommandozeile, Ströme, Pipes und Textfilter
stufe: Einsteiger
quellen: [1.02_Linux_-_Kommandozeile_und_Textstroeme.pdf, LPI-Learning-Material-101-500-de.pdf]
verweise: [linux-l1-01-kommandos, linux-101-103-1-befehlszeile, linux-101-103-2-filter, linux-101-103-4-pipes, linux-101-103-7-regex, ref-linux]
---

## Profi

### Einordnung
Kapitel 1.02 deckt **103.1** (Kommandozeile, Gewicht 4), **103.4** (Ströme/Pipes/Umleitung, Gewicht 4) und **103.2** (Textfilter, Gewicht 2) ab – zusammen ein Schwergewicht der Prüfung 101-500. `grep` gehört zu 103.7, `awk` ist kein LPIC-1-Pflichtstoff (Bonus).

### Befehle verketten (103.1)
| Operator | Bedeutung | Beispiel |
|---|---|---|
| `;` | nacheinander, **unabhängig** vom Erfolg | `ls /weg; echo fertig` |
| `&&` | nur wenn der vorige **erfolgreich** war (Exit-Status 0) | `mkdir projekt && cd projekt` |
| `\|\|` | nur wenn der vorige **fehlschlug** (≠ 0) | `false \|\| echo fehlgeschlagen` |
| `\` am Zeilenende | langen Befehl auf mehrere Zeilen umbrechen | |
Erfolg/Misserfolg steht im **Exit-Status `$?`** (0 = ok, 1–255 = Fehler).

### Befehle in und außerhalb des PATH
- Befehle ohne Pfad werden nur in den **PATH**-Verzeichnissen gesucht. Das aktuelle Verzeichnis `.` ist aus Sicherheitsgründen **nicht** im PATH → `skript.sh: command not found`.
- Eigene Programme: **`./skript.sh`** oder absoluter Pfad (`/opt/tool/bin/tool`). Skripte brauchen das Ausführungsrecht: `chmod +x skript.sh`.

### History
- `history`, `!!` (letzter Befehl), `!42`, **Strg+R** (Rückwärtssuche), `history -c` (Sitzung leeren).
- Beim Abmelden schreibt Bash in **`~/.bash_history`**. **`HISTSIZE`** = Einträge im Speicher, **`HISTFILESIZE`** = Einträge in der Datei.

### Die drei Standard-Datenströme (103.4)
| Nr. | Name | Standard |
|---|---|---|
| 0 | **stdin** – Standardeingabe | Tastatur |
| 1 | **stdout** – Standardausgabe | Bildschirm |
| 2 | **stderr** – Standardfehlerausgabe | Bildschirm |
stdout und stderr sehen gleich aus, sind aber **getrennte Kanäle** – so lassen sich Fehler separat protokollieren.

### Umleitungen
| Syntax | Wirkung |
|---|---|
| `> datei` | stdout in Datei, **überschreibt** ohne Rückfrage |
| `>> datei` | stdout **anhängen** |
| `2> datei` | stderr umleiten |
| `2>> datei` | stderr anhängen |
| `&> datei` | stdout **und** stderr (Bash) |
| `> datei 2>&1` | stdout in Datei, dann stderr dorthin, wohin stdout zeigt (**Reihenfolge wichtig!**) |
| `> /dev/null` | Ausgabe verwerfen („schwarzes Loch“) |
| `< datei` | Datei als stdin (`sort < namen.txt`) |
| `<< EOF` | **Here-Document**: Text bis zur Endmarke als stdin |
| `<<< "text"` | **Here-String** (`bc <<< "2 + 2"` → 4) |
`set -o noclobber` verhindert versehentliches Überschreiben mit `>` (erzwingen mit `>|`).

### Pipes, tee, xargs
- **`|`** verbindet stdout des linken mit stdin des rechten Befehls; jeder Teil läuft als **eigener Prozess**. Die Pipe transportiert **nur stdout** – stderr mit `2>&1 |` bzw. `|&` mitschicken.
- **`tee`** schreibt die Eingabe gleichzeitig in eine Datei und nach stdout (`-a` anhängen). Klassiker: `echo "text" | sudo tee -a /etc/datei` – denn bei `sudo echo text > /etc/datei` macht die **unprivilegierte Shell** die Umleitung und scheitert.
- **`xargs`** wandelt stdin in **Argumente** um (für Befehle wie `rm`, die nicht von stdin lesen): `find . -name "*.tmp" | xargs rm`; `-n 1` ein Argument pro Aufruf, `-I {}` Platzhalter. Leerzeichen in Dateinamen → sicher: `find … -print0 | xargs -0 …`.
- **Befehlssubstitution** `$(befehl)` (Legacy: Backticks) setzt die Ausgabe als Argument ein.

### Textfilter (103.2)
| Befehl | Zweck | wichtige Optionen |
|---|---|---|
| `cat` | ausgeben/verketten | `-n` nummerieren |
| `tac` | Zeilen rückwärts | |
| `nl` | nummeriert **nur nicht-leere** Zeilen | |
| `less` | Pager vor/zurück („less is more“) | Leertaste/`b`, `/text`, `n`/`N`, `g`/`G`, `F` (live), `q` |
| `head` / `tail` | Anfang/Ende (Standard 10 Zeilen) | `-n 3`, `tail -f` |
| `wc` | Zeilen, Wörter, Bytes | `-l`, `-w`, `-c`, `-m` (Zeichen) |
| `cut` | Spalten | `-d:` Trenner (Standard **Tab**), `-f1,7`, `-c1-3` |
| `sort` | sortieren | `-n` numerisch, `-r`, `-k N` Spalte, `-t` Trenner, `-u`, `-h` |
| `uniq` | **aufeinanderfolgende** Duplikate | `-c` zählen, `-d` nur doppelte, `-u` nur einmalige |
| `tr` | Zeichen ersetzen/löschen, **nur stdin** | `tr a-z A-Z`, `-d 0-9`, `-s ' '` |
| `paste` | Dateien spaltenweise nebeneinander | `-d,` |
| `split` | Datei zerlegen | `-l 1000`, `-b 10M`, `-d` |
| `sed` | Stream-Editor | `s/alt/neu/g`, `2,5d`, `/re/d`, `-n '5p'`, `-i`, `-i.bak` |
| `od` | Oktal-/Hex-/Zeichen-Dump | `-c`, `-x`, `-A d`, `-An` |
| `md5sum`/`sha256sum`/`sha512sum` | Prüfsummen | `-c datei.sha256` prüfen |
| `zcat`/`bzcat`/`xzcat` | .gz/.bz2/.xz lesen ohne Entpacken | `zless`, `zgrep` |
- Zeilen 11–20: `head -n 20 datei | tail -n 10`.
- **md5 gilt wegen Kollisionen als unsicher** → für Integrität/Sicherheit sha256/sha512.
- `od -c` macht Windows-Zeilenenden `\r\n` und Tabs `\t` sichtbar.

### Pipeline Schritt für Schritt
`cut -d: -f7 /etc/passwd | sort | uniq -c | sort -rn` → Shell-Spalte holen, sortieren, zählen, nach Häufigkeit absteigend. Ergebnis z. B. `21 /usr/sbin/nologin`, `14 /bin/bash`, `2 /bin/sh`.

### Bonus (Praxis)
`grep -i/-r/-n/-v/-E` (103.7), `awk -F: '{print $1}' /etc/passwd` (Felder `$1…`, `$0` ganze Zeile), `column -s: -t` (Tabelle), `watch -n 2 "df -h /"` (periodisch, `-d` Änderungen hervorheben).

## Einfach

Jedes Programm hat **drei Schläuche**: einen **Einfüllschlauch** (stdin, Nummer 0), einen **Ausgabeschlauch** für das Ergebnis (stdout, 1) und einen **roten Schlauch für Fehler** (stderr, 2). Normalerweise hängen Ausgabe- und Fehlerschlauch beide am **Bildschirm** – deshalb sehen sie gleich aus.

Mit **Umleitungen** steckst du die Schläuche woanders hin:
- `>` steckt den Ausgabeschlauch in einen **Eimer** (Datei) – aber **kippt vorher den alten Inhalt aus**!
- `>>` füllt den Eimer **weiter auf**.
- `2>` steckt nur den **roten Fehlerschlauch** in einen Eimer.
- `/dev/null` ist ein **Gully** – alles verschwindet.

Eine **Pipe `|`** ist ein **Verbindungsstück** zwischen zwei Maschinen: Was die erste ausspuckt, frisst die zweite. So baust du eine **Fließbandstraße**: `cut` schneidet aus, `sort` sortiert, `uniq -c` zählt. Jede Maschine kann nur **eine Sache**, aber zusammen beantworten sie schwere Fragen.

**`tee`** ist ein **T-Stück**: Das Wasser fließt weiter zum nächsten Befehl **und** gleichzeitig in einen Eimer.

**`xargs`** ist ein **Übersetzer**: Manche Maschinen (wie `rm`) haben gar keinen Einfüllschlauch, sondern wollen die Dateinamen **auf einem Zettel**. `xargs` schreibt die ankommenden Namen auf den Zettel.

**Befehle verketten** ist wie Anweisungen an ein Kind:
- `;` = „Mach das, dann das – egal was passiert.“
- `&&` = „Wenn du dein Zimmer aufgeräumt hast, **dann** darfst du spielen.“
- `||` = „Wenn das **nicht** klappt, dann ruf mich.“

Die **Textfilter** sind wie Küchengeräte: `head` nimmt die ersten Scheiben, `tail` die letzten, `wc` zählt, `sort` ordnet, `uniq` wirft doppelte weg (aber nur, wenn sie **nebeneinander** liegen – darum vorher sortieren!), `tr` tauscht Buchstaben aus, `sed` ist ein **Suchen-und-Ersetzen-Roboter**.

**Prüfsummen** (`sha256sum`) sind **Fingerabdrücke** einer Datei. Ändert sich auch nur ein Buchstabe, ist der Fingerabdruck völlig anders – so merkst du, ob eine Download-Datei kaputt oder manipuliert ist.

## Merksatz
- **0 rein, 1 raus, 2 Fehler**.
- **Ein Pfeil `>` löscht, zwei Pfeile `>>` hängen an**.
- **`> datei 2>&1`: erst Datei, dann Fehler hinterher** – andersrum klappt's nicht.
- **Erst sort, dann uniq**.
- **&& = wenn ja, || = wenn nein, ; = egal**.
- **less is more** (less kann vor und zurück).
- **sudo tee statt sudo >**.

## Prüfungsfalle
- `befehl 2>&1 > datei` schickt stderr auf den **Bildschirm** (alter Zustand von stdout) – richtig ist `befehl > datei 2>&1`.
- `uniq` ohne vorheriges `sort` erkennt **verstreute** Duplikate nicht.
- `tr` liest **keine Dateinamen** als Argument – nur stdin (`tr a-z A-Z < datei`).
- `cut` trennt standardmäßig am **Tabulator**, nicht am Leerzeichen.
- `nl` nummeriert leere Zeilen **nicht**, `cat -n` schon.
- Die Pipe überträgt **kein stderr**.
- `sed -i` ändert **ohne Rückfrage** – erst ohne `-i` testen, dann `-i.bak`.
- Umleitung gehört zu **103.4**, nicht zu 103.2.
- md5 ist nicht kollisionssicher.

## Grafik

### Pipeline Login-Shells zählen
1. /etc/passwd -> cut: Zeilen mit 7 Feldern
2. cut -> sort: nur Feld 7 (Login-Shell)
3. sort -> uniq: gleiche Shells stehen untereinander
4. uniq -> sort: Anzahl je Shell (-c)
5. sort -> Terminal: absteigend nach Häufigkeit (-rn)

### Umleitung > datei 2>&1
1. Prozess: Kanal 1 und 2 zeigen auf Terminal
2. Prozess -> log: `> log` biegt Kanal 1 auf die Datei
3. Prozess -> log: `2>&1` biegt Kanal 2 dorthin, wo 1 jetzt zeigt
4. Terminal: bleibt leer, alles steht in log

### sudo tee
1. Benutzer -> Shell: `echo text | sudo tee -a /etc/datei`
2. Shell -> echo: läuft als normaler Benutzer
3. echo -> tee: Text über die Pipe
4. tee -> /etc/datei: schreibt mit Root-Rechten
5. tee -> Terminal: zeigt den Text zusätzlich an

## Lab
**Maschine**: debian01, normaler Benutzer mit sudo.
```bash
# auf debian01 – Verketten und Exit-Status
mkdir -p ~/lab102 && cd ~/lab102 && echo "ok: $?"
ls /gibtsnicht; echo "Status: $?"
false || echo "fehlgeschlagen"

# auf debian01 – eigenes Skript außerhalb des PATH
printf '#!/bin/bash\necho Hallo Welt\n' > skript.sh
skript.sh; chmod +x skript.sh; ./skript.sh

# auf debian01 – Umleitungen
ls /etc > liste.txt; echo "mehr" >> liste.txt
find / -name passwd 2> /dev/null
find / -name passwd > treffer.txt 2>&1
cat << EOF > hier.txt
Zeile 1
Zeile 2
EOF
bc <<< "2 + 2"

# auf debian01 – Pipes, tee, xargs
ls /etc | wc -l
ls /etc | tee liste2.txt | wc -l
echo "# Testzeile" | sudo tee -a /etc/motd
touch a.tmp b.tmp; find . -name "*.tmp" -print0 | xargs -0 rm -v
echo a b c | xargs -n 1 echo

# auf debian01 – Textfilter
cut -d: -f1,7 /etc/passwd | head -n 3
cut -d: -f7 /etc/passwd | sort | uniq -c | sort -rn
echo hallo | tr a-z A-Z; echo "a1b2" | tr -d 0-9
head -n 20 /etc/services | tail -n 10
sed -n '/root/p' /etc/passwd; sed 's/bash/BASH/g' /etc/passwd | head -2
cp /etc/hosts hosts.test; sed -i.bak 's/localhost/LOKAL/' hosts.test; ls hosts.test*
printf 'A\tB\r\n' | od -c
sha256sum hosts.test > hosts.sha256; sha256sum -c hosts.sha256
zcat /usr/share/doc/bash/changelog.gz 2>/dev/null | head -3
```

## Befehle
- `befehl1 && befehl2` – zweiter Befehl nur bei Erfolg
- `befehl1 || befehl2` – zweiter Befehl nur bei Fehler
- `echo $?` – Exit-Status des letzten Befehls
- `./skript.sh` – Programm im aktuellen Verzeichnis starten
- `befehl > datei 2>&1` – stdout und stderr in eine Datei
- `befehl &> datei` – Bash-Kurzform für stdout und stderr
- `befehl 2> /dev/null` – Fehlermeldungen verwerfen
- `cat << EOF` – Here-Document bis zur Zeile EOF
- `bc <<< "2+2"` – Here-String als Eingabe
- `ls | tee liste.txt` – anzeigen und gleichzeitig speichern
- `find . -print0 | xargs -0 rm` – sicher mit Leerzeichen löschen
- `cut -d: -f1,7 /etc/passwd` – Felder 1 und 7 mit Trenner :
- `sort -nr datei` – numerisch absteigend sortieren
- `sort -t: -k3 -n /etc/passwd` – nach Feld 3 (UID) sortieren
- `uniq -c` – aufeinanderfolgende Duplikate zählen
- `tr -s ' '` – mehrfache Leerzeichen zusammenfassen
- `wc -l datei` – Zeilen zählen
- `paste -d, a.txt b.txt` – Dateien spaltenweise verbinden
- `split -l 1000 gross.log teil_` – Datei in 1000-Zeilen-Stücke teilen
- `sed -i.bak 's/alt/neu/g' datei` – in Datei ersetzen mit Backup
- `sed '1,3d' datei` – Zeilen 1 bis 3 löschen
- `od -c datei` – Datei als Zeichen-Dump
- `sha256sum -c datei.sha256` – Prüfsumme kontrollieren
- `zcat datei.gz` – gzip-Datei lesen ohne entpacken

## Übungen
- A: Welcher Operator führt den zweiten Befehl nur bei Erfolg des ersten aus? (; && \|\| \|) | L: && – logisches UND, der zweite läuft nur bei Exit-Status 0.
- A: Wohin leitet 2> um? (Eingabe, Ausgabe, Fehler, Pipe) | L: Fehler – stderr ist Kanal 2.
- A: Was bewirkt befehl > log 2>&1? | L: stdout und stderr landen beide in log.
- A: Welcher Befehl schreibt eine Ausgabe gleichzeitig auf den Bildschirm und in eine Datei? | L: tee, z. B. ls \| tee liste.txt
- A: Welcher Befehl zählt Zeilen, Wörter und Bytes? (wc, nl, cut, od) | L: wc
- A: uniq entfernt nur aufeinanderfolgende Duplikate. Was tut man meist davor? | L: sort
- A: Was macht sed 's/alt/neu/g'? | L: Es ersetzt alle Treffer pro Zeile (g = global), ohne g nur den ersten.
- A: Welcher Befehl gibt eine gzip-komprimierte Textdatei aus, ohne sie zu entpacken? | L: zcat (bzw. zless/zgrep)
- A: Zeige die Zeilen 11 bis 20 einer Datei. | L: head -n 20 datei \| tail -n 10
- A: Warum scheitert sudo echo text > /etc/datei und was ist die Lösung? | L: Die Umleitung macht die unprivilegierte Shell; Lösung: echo text \| sudo tee /etc/datei

## Karteikarten
- F: Welche Nummern haben stdin, stdout und stderr? | A: 0 = stdin, 1 = stdout, 2 = stderr.
- F: Unterschied zwischen > und >>? | A: > überschreibt die Zieldatei, >> hängt an.
- F: Was bedeutet 2>&1? | A: stderr wird dorthin umgeleitet, wohin stdout gerade zeigt.
- F: Was ist ein Here-Document? | A: Mit << ENDE wird mehrzeiliger Text bis zur Endmarke als stdin übergeben.
- F: Was macht xargs? | A: Es wandelt Zeilen von stdin in Argumente für einen anderen Befehl um.
- F: Wozu dient tee? | A: Es schreibt stdin gleichzeitig in Datei(en) und nach stdout (-a hängt an).
- F: Warum steht . nicht im PATH? | A: Aus Sicherheitsgründen – ein Angreifer könnte sonst gleichnamige Programme ins aktuelle Verzeichnis legen.
- F: Was speichern HISTSIZE und HISTFILESIZE? | A: HISTSIZE = Anzahl Einträge im Speicher, HISTFILESIZE = Anzahl in ~/.bash_history.
- F: Warum steht vor uniq meist sort? | A: uniq entfernt nur direkt aufeinanderfolgende gleiche Zeilen.
- F: Was ist der Unterschied zwischen nl und cat -n? | A: nl nummeriert nur nicht-leere Zeilen, cat -n alle.
- F: Wie wandelt man mit tr Klein- in Großbuchstaben? | A: tr a-z A-Z (liest nur von stdin).
- F: Welche sed-Option ändert die Datei direkt und legt ein Backup an? | A: -i.bak
- F: Wozu dient od -c? | A: Zeigt Bytes als Zeichen, macht unsichtbare Zeichen wie \t oder \r sichtbar.
- F: Welcher Befehl prüft eine SHA-256-Prüfsummendatei? | A: sha256sum -c datei.sha256

## Quiz
? Welcher Operator führt den zweiten Befehl nur aus, wenn der erste fehlschlägt?
* ||
- &&
- ;
- |

? Was bewirkt `befehl > log 2>&1`?
* stdout und stderr landen in log
- Nur stdout landet in log
- Nur stderr landet in log
- Beide Ausgaben werden verworfen

? Welche Kanalnummer hat stderr?
* 2
- 0
- 1
- 3

? Warum benutzt man `echo text | sudo tee /etc/datei` statt `sudo echo text > /etc/datei`?
* Die Umleitung > wird von der unprivilegierten Shell ausgeführt
- tee ist schneller als echo
- sudo funktioniert nicht mit echo
- > kann keine Dateien in /etc anlegen

? Was gibt `echo "a b c" | xargs -n 1 echo` aus?
* a, b und c jeweils in einer eigenen Zeile
- a b c in einer Zeile
- Nur a
- Einen Fehler, da echo nicht von xargs aufgerufen werden kann

? Welcher Befehl zählt nur die Zeilen einer Datei?
* wc -l
- wc -w
- nl -c
- cut -l

? Welcher Befehl gibt das erste Feld aus /etc/passwd aus?
* cut -d: -f1 /etc/passwd
- cut -f1 /etc/passwd
- cut -c: -f1 /etc/passwd
- sort -k1 /etc/passwd

? Was macht `sed -n '5p' datei`?
* Gibt nur Zeile 5 aus
- Löscht Zeile 5
- Gibt alles außer Zeile 5 aus
- Ersetzt Zeile 5

? Mit welchem Befehl liest du eine .bz2-Datei ohne Entpacken?
* bzcat
- zcat
- xzcat
- unzip -p

? Welche Prüfsumme gilt heute als unsicher?
* md5sum
- sha256sum
- sha512sum
- sha384sum

? Welcher Befehl nummeriert nur nicht-leere Zeilen?
* nl
- cat -n
- tac
- wc -l

## Spickzettel
- ; immer · && bei Erfolg · || bei Fehler · $? = Exit-Status
- 0 stdin · 1 stdout · 2 stderr · /dev/null = Gully
- > überschreibt · >> hängt an · 2> Fehler · > f 2>&1 = beides · &> f
- << EOF Here-Doc · <<< "x" Here-String
- | nur stdout · tee (T-Stück) · xargs (stdin → Argumente, -0)
- cut -d: -f · sort -n -r -k -t · uniq -c (nach sort!) · tr nur stdin
- sed 's/a/b/g' · -n '5p' · '2,5d' · -i.bak
- head/tail -n · tail -f · wc -l -w -c · nl · tac · od -c
- sha256sum -c · zcat bzcat xzcat
