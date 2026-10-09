---
id: linux-eckert-k03-dateisysteme-erkunden
bereich: Linux
fach: Linux I
pruefungen: [LPIC-1, Schule]
block: CompTIA Linux+ / LPIC-1 (Eckert)
kapitel: Eckert – CompTIA Linux+ and LPIC-1 (6th Edition)
titel: Kap. 3 Linux-Dateisysteme erkunden
stufe: Fortgeschritten
quellen: [Eckert_J._W._and_triOS_College_-_CompTIA_Linux_and_LPIC-1_6th_Edition_-_2024.pdf]
verweise: [linux-ess-verzeichnisse-listen,linux-101-103-7-regex]
---

## Profi

### Dateisystemstruktur
Hierarchischer Baum ab `/`. **Pfade**: absolut (`/etc/hosts`) und relativ (`../a`). Befehle `pwd`, `cd`, `ls` (`-a -l -h -R -d -F -t -S -i`), `tree`. Eigene Home-Verzeichnisse (`~`). **Tab-Completion**.

### Dateitypen
Textdateien, Binärdaten, ausführbare Programme, Verzeichnisse, **Links**, **Spezialdateien** (Block-/Zeichengeräte), **Sockets**, **Named Pipes (FIFO)**. `file` bestimmt den Typ, `stat` zeigt Metadaten, `strings`/`od` Binärinhalt.

### Anzeigen von Dateien
`cat` (verketten), `tac` (rückwärts), `more`, `less` (blättern, Suche `/`), `head`, `tail` (`-n`, `-f`), `diff` (Vergleich), `wc`, `nl`.

### Wildcards (File Globbing)
`*`, `?`, `[a-z]`, `[!a]`; Brace-Expansion `{a,b}`. Die Shell expandiert vor dem Aufruf.

### Reguläre Ausdrücke
`.` `*` `^` `$` `[ ]` `[^ ]` `\` ; erweitert (`egrep`, `grep -E`): `+ ? | ( ) { }`. Werkzeuge: `grep` (`-i -v -r -n -c -l -w`), `fgrep` (feste Strings), `egrep`. Unterschied: Wildcards (Shell, Dateinamen) vs. Regex (Textmuster).

### Editoren
**vi/vim** (Befehlsmodus, Einfügemodus, Ex-Modus; `i a o ESC :wq :q! dd yy p /`), **nano** (einfach), **emacs**, **gedit**. 

## Einfach

Auf Linux ist alles in einem **Baum** aus Ordnern sortiert. Die Wurzel heißt `/`. Mit `pwd` fragst du, wo du stehst, mit `cd` gehst du in einen anderen Ordner, mit `ls` schaust du hinein. Einen Weg kannst du **absolut** (`/home/anna/foto.png`, von der Wurzel aus) oder **relativ** (`foto.png` oder `../foto.png`, von hier aus) angeben.

Nicht alles in diesem Baum ist eine „normale“ Datei. Es gibt Textdateien, Programme, Ordner, Verknüpfungen (Links) und **Gerätedateien**, mit denen du Hardware ansprichst. Mit dem Befehl `file name` fragst du Linux, was etwas ist.

Zum **Lesen** von Dateien gibt es `cat` (alles auf einmal), `less` (seitenweise, mit `q` verlassen), `head` (nur der Anfang) und `tail` (nur das Ende).

**Platzhalter**: `*` steht für beliebig viel, `?` für genau ein Zeichen. `ls *.jpg` listet alle Bilder.

Mit **grep** durchsuchst du den Inhalt von Dateien nach Mustern. Die Muster nennt man **reguläre Ausdrücke**. `^a` heißt „Zeile beginnt mit a“.

Zum **Bearbeiten** gibt es Editoren. `nano` ist einfach (Tastenhilfe unten). `vi` ist mächtig, aber gewöhnungsbedürftig: Er hat einen Befehlsmodus und einen Eingabemodus.

## Merksatz
- **Wildcards sind für Dateinamen, Regex für Textinhalte.**
- **less statt more, tail -f für Logs.**
- **vi: i schreiben, Esc, :wq.**
- **file = Dateityp, stat = Metadaten.**

## Prüfungsfalle
- Wildcard `*` ≠ Regex `*` (bei Regex: Wiederholung des vorigen Zeichens).
- `grep` gibt standardmäßig Zeilen aus, nicht Dateien (`-l`).
- `fgrep` interpretiert Muster nicht als Regex.
- Die Shell, nicht `ls`, expandiert Wildcards.

## Grafik

### Absolut und relativ
1. Benutzer -> Shell: cd /home/anna/docs
2. Benutzer -> Shell: pwd (zeigt absolut)
3. Benutzer -> Shell: cd ../fotos (relativ, eine Ebene hoch)
4. Shell: Arbeitsverzeichnis ist /home/anna/fotos

## Befehle
- `file datei` – Dateityp
- `stat datei` – Metadaten
- `less datei` – blättern
- `tail -f log` – live
- `diff a b` – Vergleich
- `grep -rin text .` – rekursiv suchen
- `vi datei` – Editor

## Übungen
- A: Welche Dateien findet `ls [a-c]*`? | L: Alle Namen, die mit a, b oder c beginnen.
- A: Wie findest du Zeilen, die mit "root" beginnen? | L: `grep '^root' datei`
- A: Welcher Befehl zeigt die letzten 20 Zeilen? | L: `tail -n 20 datei`

## Karteikarten
- F: Was zeigt pwd? | A: Das aktuelle Arbeitsverzeichnis.
- F: Was macht tac? | A: Gibt Dateiinhalt rückwärts (zeilenweise) aus.
- F: Was macht less? | A: Zeigt Dateien seitenweise mit Suchfunktion.
- F: Was matcht ? ? | A: Genau ein Zeichen.
- F: Was matcht [!a]? | A: Jedes Zeichen außer a.
- F: Was macht grep -v? | A: Zeigt Zeilen ohne Treffer.
- F: Was bedeutet ^ in Regex? | A: Zeilenanfang.
- F: Was ist eine Named Pipe? | A: Spezialdatei (FIFO) für Interprozesskommunikation.
- F: Was macht :wq in vi? | A: Speichern und beenden.
- F: Was macht diff? | A: Zeigt Unterschiede zweier Dateien.

## Quiz
? Welcher Befehl zeigt den Dateityp?
* file
- stat
- type
- ls -F

? Was bedeutet ^ in einem regulären Ausdruck?
* Zeilenanfang
- Zeilenende
- Beliebiges Zeichen
- Negation immer

? Welcher Befehl zeigt das Ende einer Datei live?
* tail -f
- head -f
- less +F only
- cat -f

? Was macht tac?
* Gibt Zeilen rückwärts aus
- Komprimiert
- Zählt Zeichen
- Sortiert

? Welches Wildcard steht für genau ein Zeichen?
* ?
- *
- []
- {}

? Wie beendet man vi ohne zu speichern?
* :q!
- :wq
- ZZ
- :x

? Wer expandiert Wildcards?
* Die Shell
- Das Programm
- Der Kernel
- Das Dateisystem

? Welcher Befehl vergleicht zwei Dateien?
* diff
- cmp -l only
- grep
- sort

## Spickzettel
- pwd cd ls · absolut/relativ
- cat tac less head tail
- * ? [ ] { } · Regex ^ $ . *
- grep -i -v -r -n · vi i Esc :wq
