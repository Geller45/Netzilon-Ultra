---
id: linux-101-103-4-pipes
bereich: Linux
fach: Linux I
pruefungen: [LPIC-1]
block: LPIC-101
kapitel: LPIC-1 Prüfung 101 – GNU- und Unix-Befehle
titel: 103.4 Datenströme, Pipes und Umleitungen
stufe: Einsteiger
quellen: [LPI-Learning-Material-101-500-de.pdf, 1.02_Linux_-_Kommandozeile_und_Textstroeme.pdf]
verweise: [linux-l1-02-textstroeme, linux-101-103-2-filter, linux-101-103-7-regex]
---

## Profi

### Lernziel (Gewicht 4)
Standardkanäle umleiten, Pipes bauen, `tee`, `xargs`, Kommandosubstitution.

### Standardkanäle
| Kanal | Nr. | Standard | Umleitung |
|---|---|---|---|
| stdin | 0 | Tastatur | `< datei` |
| stdout | 1 | Terminal | `> datei` (überschreiben), `>> datei` (anhängen) |
| stderr | 2 | Terminal | `2> datei`, `2>> datei` |
- Beides: `&> datei` bzw. `> datei 2>&1` (Reihenfolge wichtig!), stderr nach stdout: `2>&1`. Wegwerfen: `> /dev/null 2>&1`. Here-Document: `<< EOF … EOF`, Here-String `<<< "text"`.
- `/dev/null` (Papierkorb), `/dev/zero`, `/dev/random`, `/dev/urandom`.

### Pipes und Hilfsprogramme
- `befehl1 | befehl2` verbindet **stdout** des ersten mit **stdin** des zweiten. stderr läuft nicht durch die Pipe (außer `2>&1`/`|&`).
- **`tee datei`** schreibt in die Datei **und** weiter nach stdout (`-a` anhängen), z. B. `ls | tee liste.txt | wc -l`; typisch `echo x | sudo tee /etc/datei`.
- **`xargs`**: macht aus stdin Argumente: `find . -name '*.tmp' | xargs rm`, `-n 1`, `-I {}`, `-0` mit `find -print0`.
- **Kommandosubstitution**: `$(befehl)` (modern) oder Backticks; ersetzt sich durch die Ausgabe: `echo "Heute ist $(date +%F)"`.
- Weitere: `sort | uniq -c | sort -nr | head` (Top-Liste).

## Einfach

Programme in Linux haben wie Menschen **Ohren, einen Mund und eine Warnglocke**: Das **Ohr** (stdin, Kanal 0) hört zu, der **Mund** (stdout, Kanal 1) redet normal, die **Warnglocke** (stderr, Kanal 2) schreit bei Fehlern. Normalerweise gehen Mund und Glocke aufs Terminal, und das Ohr hört auf die Tastatur.

Mit **Umleitung** biegst du diese Kanäle um. `ls > liste.txt` leitet den Mund in eine Datei (und überschreibt sie), `ls >> liste.txt` hängt an. `2> fehler.txt` fängt nur die Warnglocke ein. Mit `< datei` lässt du das Ohr aus einer Datei lesen. Und `/dev/null` ist ein **Schwarzes Loch**: Was dort hineinkommt, ist verschwunden.

Mit der **Pipe** `|` verbindest du **den Mund eines Programms mit dem Ohr des nächsten** – wie ein Rohr zwischen zwei Stationen am Fließband: `cat datei | sort | uniq`. 

**`tee`** ist ein T-Stück im Rohr: Der Strom läuft weiter, aber eine Kopie landet in einer Datei. **`xargs`** ist ein Umfüller: Er nimmt eine Liste und macht daraus Argumente für einen Befehl (`find … | xargs rm`).

Ein Trick: `$(befehl)` setzt das Ergebnis eines Befehls mitten in eine andere Zeile, z. B. `echo "Heute ist $(date)"`.

## Merksatz
- **0 = stdin, 1 = stdout, 2 = stderr.**
- **> überschreibt, >> hängt an.**
- **2>&1 = Fehler dorthin, wo stdout hingeht.**
- **| verbindet stdout mit stdin.**
- **tee = T-Stück, xargs = Argumente aus stdin.**
- **/dev/null verschluckt alles.**

## Prüfungsfalle
- `> datei 2>&1` (richtig) ist **nicht** dasselbe wie `2>&1 > datei`; die Reihenfolge entscheidet.
- `>` **überschreibt** ohne Rückfrage (Schutz: `set -o noclobber`).
- Pipes übertragen nur **stdout**; Fehlermeldungen erscheinen weiter am Terminal.
- `sudo echo x > /etc/datei` scheitert (Umleitung läuft als Benutzer); richtig: `echo x | sudo tee /etc/datei`.
- `tee -a` hängt an, `tee` überschreibt.
- `xargs` ohne `-0` scheitert an Leerzeichen in Dateinamen.
- `<` für Eingabe, nicht `>`.

## Grafik

### Pipeline mit tee
1. Datei -> cat: stdout
2. cat -> sort: Pipe |
3. sort -> tee: sortierte Daten
4. tee -> sorted.txt: Kopie in Datei
5. tee -> uniq: Strom läuft weiter
6. uniq -> Terminal: Ergebnis

## Lab
**Maschine**: debian01.
```bash
# auf debian01
ls /etc /gibtsnicht > ok.txt 2> fehler.txt
ls /etc /gibtsnicht > alles.txt 2>&1
cat /etc/passwd | cut -d: -f7 | sort | uniq -c | sort -nr
echo "neu" | sudo tee -a /etc/motd
find /tmp -name '*.tmp' -print0 | xargs -0 rm -v
echo "Heute: $(date +%F)"
cat << EOF
Zeile 1
EOF
```

## Befehle
- `cmd > datei` – stdout überschreiben
- `cmd >> datei` – anhängen
- `cmd 2> datei` – stderr umleiten
- `cmd > a 2>&1` – beides in eine Datei
- `cmd < datei` – stdin aus Datei
- `cmd1 | cmd2` – Pipe
- `tee [-a] datei` – aufteilen
- `xargs cmd` – Argumente aus stdin
- `cmd > /dev/null` – Ausgabe verwerfen

## Übungen
- A: Leite Fehler von ls /x in err.txt um. | L: ls /x 2> err.txt
- A: Lenke stdout und stderr in eine Datei. | L: cmd > datei 2>&1 (oder &> datei)
- A: Schreibe mit sudo in /etc/foo. | L: echo text \| sudo tee /etc/foo
- A: Lösche alle .tmp-Dateien mit xargs. | L: find . -name '*.tmp' -print0 \| xargs -0 rm
- A: Wie hängst du an eine Datei an? | L: >>

## Karteikarten
- F: Welche Nummer hat stderr? | A: 2.
- F: Was macht >>? | A: Hängt stdout an eine Datei an.
- F: Was bewirkt 2>&1? | A: Leitet stderr dorthin, wohin stdout zeigt.
- F: Was macht tee? | A: Schreibt stdin in eine Datei und gibt ihn weiter aus.
- F: Wofür dient xargs? | A: Wandelt stdin in Argumente für einen Befehl um.
- F: Was ist /dev/null? | A: Gerät, das alle Daten verwirft.
- F: Was ist ein Here-Document? | A: Mehrzeilige Eingabe bis zu einem Endmarker (<< EOF).
- F: Was liefert $(cmd)? | A: Die Ausgabe von cmd (Kommandosubstitution).
- F: Wie leitet man stdin aus Datei? | A: cmd < datei
- F: Wie schützt man vor versehentlichem Überschreiben? | A: set -o noclobber

## Quiz
? Welche Nummer hat der Fehlerkanal?
* 2
- 0
- 1
- 3

? Was bewirkt >>?
* Anhängen an eine Datei
- Überschreiben
- Pipe
- Löschen

? Welche Zeile leitet stdout und stderr in eine Datei?
* cmd > f 2>&1
- cmd 2>&1 > f
- cmd >> f 1>2
- cmd | f

? Wie schreibt man als Benutzer mit sudo in eine Rootdatei?
* echo x | sudo tee datei
- sudo echo x > datei
- echo x > sudo datei
- sudo < x datei

? Was macht tee?
* Schreibt in Datei und gibt weiter aus
- Löscht stdout
- Sortiert
- Zählt Zeilen

? Was verbindet die Pipe?
* stdout des ersten mit stdin des zweiten
- stderr mit stdout
- stdin mit stderr
- Dateien mit Prozessen

? Wofür ist xargs gedacht?
* stdin als Argumente übergeben
- Dateien archivieren
- Variablen exportieren
- Prozesse beenden

? Was gibt echo "x $(date +%Y)" aus?
* x und das aktuelle Jahr
- x $(date +%Y)
- Fehlermeldung
- x date

## Lücken
- Der Standard-Fehlerkanal hat die Nummer {2}.
- Mit {>>} hängt man Ausgabe an eine Datei an.
- {tee} schreibt in eine Datei und leitet den Strom weiter.

## Spickzettel
- 0 stdin · 1 stdout · 2 stderr
- > >> < 2> &> 2>&1 · /dev/null
- | pipe · tee (-a) · xargs (-0 -n -I)
- $(cmd) · << EOF · <<< 
- sudo: tee statt >
