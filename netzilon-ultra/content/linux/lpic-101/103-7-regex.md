---
id: linux-101-103-7-regex
bereich: Linux
fach: Linux I
pruefungen: [LPIC-1]
block: LPIC-101
kapitel: LPIC-1 Prüfung 101 – GNU- und Unix-Befehle
titel: 103.7 Textdateien mit regulären Ausdrücken durchsuchen (grep, sed, egrep)
stufe: Fortgeschritten
quellen: [LPI-Learning-Material-101-500-de.pdf, 1.02_Linux_-_Kommandozeile_und_Textstroeme.pdf]
verweise: [linux-l1-02-textstroeme, linux-101-103-2-filter, linux-101-103-8-vi]
---

## Profi

### Lernziel (Gewicht 2)
Reguläre Ausdrücke (RegEx) mit `grep`, `egrep`/`grep -E`, `fgrep` und `sed` anwenden.

### Basis-Metazeichen (BRE)
| Zeichen | Bedeutung |
|---|---|
| `.` | genau ein beliebiges Zeichen |
| `*` | 0 oder mehr des vorherigen |
| `^` / `$` | Zeilenanfang / Zeilenende |
| `[abc]`, `[a-z]`, `[^abc]` | Zeichenklasse / negiert |
| `\` | Maskierung |
| `\{n,m\}`, `\(\)`, `\+`, `\?` | in BRE mit Backslash |
- **ERE** (`grep -E` / `egrep`): `+` (1 oder mehr), `?` (0 oder 1), `{n,m}`, Alternative mit senkrechtem Strich, `()` Gruppen ohne Backslash.
- POSIX-Klassen: `[[:digit:]]`, `[[:alpha:]]`, `[[:space:]]`, `[[:upper:]]`.

### grep
`grep muster datei`, Optionen: `-i` (ignore case), `-v` (invertieren), `-n` (Zeilennummer), `-c` (zählen), `-l` (nur Dateinamen), `-r` (rekursiv), `-w` (ganzes Wort), `-o` (nur Treffer), `-A/-B/-C n` (Kontext), `-E` (ERE), `-F` (fester Text, = fgrep), `-q` (still, Exit-Status). Exit-Status: 0 Treffer, 1 keiner.
Beispiele: `grep '^root' /etc/passwd`, `grep -v '^#' conf`, `grep -E '^(a|b)[0-9]+$'`.

### sed (Stream Editor)
- `sed 's/alt/neu/'` (erstes je Zeile), `s/alt/neu/g` (alle), `-i` (in Datei), `-n '/x/p'`, `sed '3d'`, `'2,4d'`, `-e` mehrere, `s|/a|/b|` anderer Trenner, `&` = Treffer, `\1` Rückbezug in Gruppen.

## Einfach

Ein **regulärer Ausdruck** ist ein **Suchmuster mit Jokern** – wie ein Steckbrief für Text. Statt „finde das Wort Katze“ sagst du „finde jede Zeile, die mit K anfängt und mit e aufhört“.

Die wichtigsten Zeichen:
- `.` = irgendein Zeichen, `*` = „so oft wie möglich, auch gar nicht“, `^` = „am Zeilenanfang“, `$` = „am Zeilenende“, `[abc]` = „eins von diesen“.

**grep** ist der **Spürhund**: Er liest eine Datei und gibt nur die Zeilen aus, auf die dein Muster passt. Mit `-i` ist es ihm egal, ob groß oder klein, mit `-v` zeigt er genau das Gegenteil (alles, was **nicht** passt), mit `-c` zählt er nur.

**sed** ist der **Zauberstift**, der im Vorbeigehen ersetzt: `sed 's/Hund/Katze/g'` tauscht überall „Hund“ gegen „Katze“. Das `s` steht für „substitute“ (ersetzen), das `g` für „global“ (nicht nur das erste Mal pro Zeile).

Etwas Verwirrendes: Es gibt zwei Schreibweisen. Bei der Standard-Variante (BRE) musst du Zeichen wie `+` mit einem Backslash schreiben. Bei der **erweiterten Variante** (`grep -E`) schreibst du sie einfach so. Darum nimmt man im Alltag fast immer `grep -E`.

## Merksatz
- **. = ein Zeichen, * = beliebig oft, ^ Anfang, $ Ende.**
- **grep -i ignoriert Groß/Klein, -v kehrt um, -c zählt.**
- **sed s/alt/neu/g – g für alle Treffer.**
- **ERE ohne Backslash: grep -E.**
- **[^…] = alles außer.**

## Prüfungsfalle
- `*` bei RegEx ist **nicht** wie `*` beim Globbing (dort „beliebiger Text“, hier „0..n des vorherigen“).
- Shell-Globbing und RegEx nicht verwechseln: `grep` bekommt das Muster in Anführungszeichen.
- `sed s/a/b/` ersetzt nur das **erste** Vorkommen pro Zeile.
- `sed -i` ändert die Datei **direkt**.
- `^` am Anfang = Zeilenanfang, in `[^…]` = Negation.
- `grep -c` zählt **Zeilen**, nicht Treffer.
- `egrep` = `grep -E`, `fgrep` = `grep -F`.

## Grafik

### grep als Filter
1. Datei -> grep: grep -v '^#' sshd_config
2. grep: prüft jede Zeile gegen das Muster ^#
3. grep: Zeilen, die mit # beginnen, werden unterdrückt
4. grep -> Terminal: nur Konfigurationszeilen erscheinen

## Lab
**Maschine**: debian01.
```bash
# auf debian01
grep -i 'ROOT' /etc/passwd
grep -v '^#' /etc/ssh/sshd_config | grep -v '^$'
grep -c bash /etc/passwd
grep -E '^(root|daemon):' /etc/passwd
grep -rn 'PermitRootLogin' /etc/ssh/
echo "Hund und Hund" | sed 's/Hund/Katze/g'
sed -n '2,4p' /etc/passwd
sed 's/\(.*\):x:/\1:*:/' /etc/passwd | head -2
```

## Befehle
- `grep -i muster datei` – ohne Beachtung der Groß-/Kleinschreibung
- `grep -v muster` – invertieren
- `grep -rn muster dir` – rekursiv mit Zeilennummern
- `grep -E 'a|b'` – erweiterte RegEx
- `grep -c muster` – Treffer zählen
- `sed 's/a/b/g'` – ersetzen
- `sed -i` – in der Datei
- `sed -n '2,4p'` – Zeilenbereich ausgeben

## Übungen
- A: Zeige alle Zeilen ohne Kommentare und Leerzeilen. | L: grep -Ev '^(#|$)' datei
- A: Ersetze in datei.txt alle "rot" durch "blau". | L: sed -i 's/rot/blau/g' datei.txt
- A: Wie findest du Zeilen, die mit "a" beginnen und auf "z" enden? | L: grep '^a.*z$' datei
- A: Wie zählst du Zeilen mit "error"? | L: grep -c error datei
- A: Welche Dateien enthalten "TODO"? | L: grep -rl TODO .

## Karteikarten
- F: Was bedeutet ^ in RegEx? | A: Zeilenanfang.
- F: Was bedeutet $ in RegEx? | A: Zeilenende.
- F: Was macht grep -v? | A: Zeigt Zeilen, die NICHT passen.
- F: Was macht sed s/a/b/g? | A: Ersetzt alle a durch b in jeder Zeile.
- F: Was ist egrep? | A: grep -E (erweiterte reguläre Ausdrücke).
- F: Was bedeutet [^0-9]? | A: Ein Zeichen, das keine Ziffer ist.
- F: Was gibt grep -o aus? | A: Nur den passenden Teil der Zeile.
- F: Welchen Exit-Status liefert grep bei keinem Treffer? | A: 1.
- F: Wofür steht + in ERE? | A: Ein oder mehrmals das Vorherige.
- F: Wie ändert sed direkt eine Datei? | A: Mit -i.

## Quiz
? Was bedeutet ^ am Anfang eines Musters?
* Zeilenanfang
- Zeilenende
- Negation
- Beliebiges Zeichen

? Welcher Befehl zeigt Zeilen ohne das Muster?
* grep -v
- grep -n
- grep -c
- grep -w

? Was bewirkt sed 's/a/b/'?
* Ersetzt das erste a pro Zeile
- Ersetzt alle a
- Löscht a
- Ändert die Datei dauerhaft

? Welche Option aktiviert erweiterte RegEx?
* -E
- -X
- -R
- -F

? Wofür steht der Punkt in einem Muster?
* Genau ein beliebiges Zeichen
- Ein Punkt
- Zeilenende
- Beliebig viele Zeichen

? Welche Option zählt passende Zeilen?
* -c
- -n
- -l
- -s

? Was macht sed -i?
* Ändert die Datei direkt
- Ignoriert Fehler
- Fragt nach
- Gibt Info aus

? Was bedeutet [^abc]?
* Ein Zeichen außer a, b, c
- a, b oder c am Zeilenanfang
- Genau abc
- Beliebig viele a, b, c

## Lücken
- {grep -v} gibt alle Zeilen aus, die das Muster nicht enthalten.
- Mit sed {s/alt/neu/g} ersetzt man alle Vorkommen.
- {^} steht für den Zeilenanfang und {$} für das Zeilenende.

## Spickzettel
- . * ^ $ [ ] [^ ] \ · ERE: + ? | { } ( )
- grep -i -v -n -c -l -r -w -o -E -F -q
- sed s/a/b/ · /g · -i · -n 'Np'
- [[:digit:]] [[:alpha:]]
