---
id: linux-ess-daten-suchen
bereich: Linux
fach: Linux I
pruefungen: [LPIC-1, Schule]
block: Linux Essentials
kapitel: Thema 3 – Die Macht der Befehlszeile
titel: 3.2 Daten in Dateien suchen und extrahieren
stufe: Einsteiger
quellen: [LPI-Learning-Material-010-160-de.pdf]
verweise: [linux-101-103-4-pipes,linux-101-103-7-regex]
---

## Profi

### Lernziel (Gewicht 3)
Pipes, Umleitungen, `grep`, `cut`, `sort`, `uniq`, `wc`, `head`/`tail`, einfache reguläre Ausdrücke.

### Datenströme und Umleitung
- **stdin** (0), **stdout** (1), **stderr** (2). `>` überschreibt, `>>` hängt an, `<` Eingabe, `2>` Fehlerausgabe, `2>&1` stderr nach stdout, `&>` beide. `/dev/null` verwirft.
- **Pipe** `|` verbindet stdout des linken mit stdin des rechten Befehls: `ps aux | grep sshd | wc -l`.

### grep
- `grep muster datei`; `-i` (Groß/klein egal), `-v` (Invertierung), `-r` (rekursiv), `-n` (Zeilennummer), `-c` (Anzahl), `-l` (nur Dateinamen), `-w` (ganzes Wort), `-E` (erweiterte Regex, `egrep`), `-A/-B/-C n` (Kontext).
- **Regex-Basis**: `.` ein Zeichen, `*` null oder mehr, `^` Zeilenanfang, `$` Zeilenende, `[abc]`, `[^abc]`, `\` Maskierung; erweitert: `+`, `?`, `|`, `()`, `{n,m}`.

### Textwerkzeuge
- `cut -d: -f1 /etc/passwd` (Felder), `-c1-5` (Zeichen). `sort` (`-n` numerisch, `-r`, `-u`, `-k2`), `uniq` (nur benachbarte Duplikate, `-c` zählt), `wc` (`-l` Zeilen, `-w` Wörter, `-c` Bytes), `head -n 5`, `tail -n 5`, `tail -f`, `tr 'a-z' 'A-Z'`, `tee datei`, `sed 's/alt/neu/g'`, `awk '{print $1}'`.

## Einfach

Linux hat viele kleine Werkzeuge, und die Kunst besteht darin, sie wie **Legosteine** zu verbinden.

Jeder Befehl hat einen **Eingang** und einen **Ausgang**. Normalerweise kommt die Eingabe von der Tastatur und die Ausgabe landet auf dem Bildschirm. Mit `>` leitest du die Ausgabe in eine Datei um: `ls > liste.txt`. Mit `>>` hängst du an, ohne die Datei zu löschen.

Der **senkrechte Strich** `|` (Pipe) ist wie ein **Rohr**: Was links herauskommt, fließt rechts hinein. `cat /etc/passwd | grep philipp` sucht in der Passwortdatei nach „philipp“.

`grep` ist dein **Suchhund**: Er findet Zeilen mit einem bestimmten Wort. Mit `-i` achtet er nicht auf Groß-/Kleinschreibung, mit `-v` zeigt er alle Zeilen, die das Wort **nicht** enthalten, mit `-r` sucht er in allen Dateien eines Ordners.

Weitere Helfer: `sort` sortiert, `uniq` entfernt doppelte Zeilen (aber nur, wenn sie nebeneinander stehen, darum erst `sort`), `wc -l` zählt Zeilen, `cut` schneidet Spalten heraus, `head` und `tail` zeigen Anfang und Ende.

Mit **regulären Ausdrücken** kann man Muster beschreiben: `^root` bedeutet „Zeile beginnt mit root“, `bash$` „Zeile endet mit bash“.

## Merksatz
- **> überschreibt, >> hängt an, 2> Fehler, | verbindet.**
- **grep -i -v -r -n -c.**
- **uniq braucht vorher sort.**
- **^ Anfang, $ Ende, . ein Zeichen, * beliebig oft.**

## Prüfungsfalle
- `>` überschreibt **ohne Warnung**; ein Tippfehler zerstört Dateien.
- `uniq` entfernt nur **aufeinanderfolgende** Duplikate.
- `2>&1` muss **nach** der Umleitung stehen (`cmd > f 2>&1`).
- `sort -n` für Zahlen, sonst sortiert er textuell (10 vor 2).

## Grafik

### Pipeline
1. cat -> sort: Zeilen aus Datei
2. sort -> uniq: alphabetisch sortiert
3. uniq -> wc: Duplikate entfernt
4. wc -> Terminal: Anzahl eindeutiger Zeilen

## Befehle
- `grep -rin muster ordner` – rekursiv suchen
- `cut -d: -f1 /etc/passwd` – Benutzernamen
- `sort -n datei` – numerisch sortieren
- `sort datei | uniq -c` – Häufigkeit zählen
- `wc -l datei` – Zeilen zählen
- `tail -f logfile` – live mitlesen
- `ls > liste.txt` – Ausgabe in Datei

## Übungen
- A: Wie viele Benutzer stehen in /etc/passwd? | L: `wc -l /etc/passwd`
- A: Zeige alle Benutzernamen sortiert. | L: `cut -d: -f1 /etc/passwd | sort`
- A: Zeige Zeilen ohne das Wort "error" (egal ob groß/klein). | L: `grep -iv error datei`

## Karteikarten
- F: Was macht >? | A: Leitet stdout in eine Datei um und überschreibt sie.
- F: Was macht >>? | A: Hängt stdout an die Datei an.
- F: Was ist stderr? | A: Fehlerausgabe, Kanal 2.
- F: Was macht die Pipe |? | A: Verbindet stdout mit stdin des nächsten Befehls.
- F: Was macht grep -v? | A: Zeigt Zeilen ohne Treffer.
- F: Was bedeutet ^ in Regex? | A: Zeilenanfang.
- F: Was macht uniq -c? | A: Zählt aufeinanderfolgende Duplikate.
- F: Was macht cut -d: -f1? | A: Gibt das erste Feld mit Trenner : aus.
- F: Was macht tail -f? | A: Zeigt neue Zeilen live an.
- F: Wie verwirft man Ausgaben? | A: Umleiten nach /dev/null.

## Quiz
? Was macht ls > a.txt?
* Schreibt die Ausgabe in a.txt (überschreibt)
- Hängt an a.txt an
- Liest aus a.txt
- Löscht a.txt

? Wie leitet man Fehlerausgaben um?
* 2>
- 1>
- 0>
- &>>

? Was zeigt grep -c?
* Anzahl der Treffer-Zeilen
- Kontext
- Farbe
- Dateinamen

? Welcher Befehl entfernt benachbarte Duplikate?
* uniq
- sort -r
- tr
- cut

? Was bedeutet $ in einer Regex?
* Zeilenende
- Zeilenanfang
- Ein Zeichen
- Variable

? Wie zählt man Zeilen?
* wc -l
- wc -w
- wc -c
- cnt -l

? Welcher Befehl sortiert numerisch?
* sort -n
- sort -u
- sort -r
- sort -k

? Was macht grep -r?
* Rekursive Suche in Verzeichnissen
- Rückwärts
- Reguläre Ausdrücke aus
- Raw

## Lücken
- Mit {|} verbindet man Befehle zu einer Pipeline.
- {>>} hängt Ausgabe an eine Datei an.
- {grep -v} zeigt Zeilen ohne das Muster.

## Spickzettel
- > >> < 2> 2>&1 |
- grep -i -v -r -n -c -E
- sort | uniq -c · wc -l · cut -d -f
- ^ $ . * [ ]
