---
id: linux-101-103-3-dateiverwaltung
bereich: Linux
fach: Linux I
pruefungen: [LPIC-1]
block: LPIC-101
kapitel: LPIC-1 Prüfung 101 – GNU- und Unix-Befehle
titel: 103.3 Grundlegende Dateiverwaltung
stufe: Einsteiger
quellen: [LPI-Learning-Material-101-500-de.pdf, 1.03_Linux_-_Dateiverwaltung_Archive_und_Dateisystem.pdf]
verweise: [linux-l1-03-dateiverwaltung, linux-101-104-7-fhs, linux-101-104-6-links]
---

## Profi

### Lernziel (Gewicht 4)
Dateien und Verzeichnisse anlegen, kopieren, verschieben, löschen, Wildcards, Archive und Kompression.

### Befehle
- `ls` (`-l`, `-a`, `-h`, `-R`, `-t`, `-d`), `cp` (`-r`, `-a`, `-i`, `-u`, `-v`), `mv` (umbenennen und verschieben), `rm` (`-r`, `-f`, `-i`), `mkdir -p`, `rmdir` (nur leere), `touch` (anlegen/Zeitstempel), `file` (Dateityp), `stat`, `dd`.
- **Pfade**: absolut (`/etc/passwd`) vs. relativ (`../data`); `.` aktuelles, `..` übergeordnetes Verzeichnis, `~` Home.

### Globbing (Wildcards, Shell-Expansion)
`*` beliebig viele Zeichen, `?` genau ein Zeichen, `[abc]`, `[a-z]`, `[!abc]` bzw. `[^abc]`, `{a,b,c}` (Brace Expansion), `*.txt`. Versteckte Dateien (Punkt am Anfang) werden von `*` nicht erfasst.

### Archive und Kompression
| Tool | Zweck |
|---|---|
| `tar -cvf a.tar dir` | Archiv erstellen (create) |
| `tar -xvf a.tar` | entpacken (extract); `-C ziel`, `-t` auflisten |
| `tar -czvf a.tar.gz` | + gzip; `-j` bzip2 (`.tar.bz2`), `-J` xz (`.tar.xz`) |
| `gzip`/`gunzip`, `bzip2`/`bunzip2`, `xz`/`unxz` | Kompression einzelner Dateien |
| `zip`/`unzip` | Windows-kompatibel |
| `cpio` | Archivformat (Pipe-basiert, `find … \| cpio -o`) |
| `dd if=… of=… bs=… count=…` | Block-Kopie, Images |
- Kompressionsstärke etwa: gzip < bzip2 < xz (aber langsamer).

## Einfach

Dateien verwalten ist wie **Aufräumen im Kinderzimmer**. Du kannst Spielzeug **hinlegen** (`touch` legt eine leere Datei an, `mkdir` einen Karton/Ordner), **kopieren** (`cp`), **umstellen oder umbenennen** (`mv`) und **wegwerfen** (`rm`). Vorsicht: Auf Linux gibt es **keinen Papierkorb** bei `rm` – weg ist weg. Darum nimmt man `rm -i`, wenn man unsicher ist.

Wenn du viele Dateien auf einmal meinst, benutzt du **Platzhalter** wie bei einem Kartenspiel mit Jokern: `*` ist ein Joker für „alles Mögliche“, `?` für „genau ein Zeichen“. `*.jpg` heißt „alle Bilder“.

Willst du viele Dateien verschicken, packst du sie in einen **Koffer**: Das ist ein **Archiv** (`tar`). Der Koffer ist aber noch genauso groß wie die Sachen. Damit er kleiner wird, saugst du die Luft ab, wie bei einem Vakuumbeutel: das ist die **Kompression** (`gzip`, `bzip2`, `xz`). Meist macht man beides gleichzeitig: `tar -czvf koffer.tar.gz ordner/` – packen und komprimieren. Zum Auspacken: `tar -xvf koffer.tar.gz`.

Merke dir bei tar die Buchstaben: **c** = create (neu), **x** = extract (auspacken), **t** = list, **v** = verbose (zeigt, was passiert), **f** = file (Dateiname folgt), **z** = gzip.

## Merksatz
- **cp kopiert, mv verschiebt/benennt um, rm löscht endgültig.**
- **tar: c = create, x = extract, t = list, f = file, z = gzip.**
- **\* viele, ? genau eins, [ ] aus der Menge.**
- **mkdir -p legt ganze Pfade an.**
- **rmdir nur leer, rm -r mit Inhalt.**

## Prüfungsfalle
- `mv` ist zugleich **Umbenennen**.
- `rm` hat keinen Papierkorb; `rm -rf /` niemals.
- `*` erfasst **keine** Dateien mit führendem Punkt.
- `tar` ohne `f` liest/schreibt auf das Standardband/stdout; `-f` immer angeben.
- `tar -tf` listet nur; `-C` ändert das Zielverzeichnis beim Entpacken.
- `gzip` ersetzt die Originaldatei durch `.gz` (Option `-k` behält sie).
- Globbing macht die **Shell**, nicht der Befehl.

## Grafik

### Archiv erstellen und entpacken
1. Ordner -> tar: tar -czvf backup.tar.gz daten/
2. tar: bündelt alle Dateien zu einem Archiv
3. tar -> gzip: komprimiert den Datenstrom
4. gzip -> backup.tar.gz: Datei wird gespeichert
5. backup.tar.gz -> tar: tar -xzvf backup.tar.gz -C /tmp
6. tar -> Zielordner: Dateien erscheinen wieder

## Lab
**Maschine**: debian01.
```bash
# auf debian01
mkdir -p ~/lab/{a,b,c}
touch ~/lab/a/{1,2,3}.txt
cp -r ~/lab/a ~/lab/b
mv ~/lab/b/a ~/lab/b/kopie
ls -R ~/lab
ls ~/lab/a/[12].txt
tar -czvf /tmp/lab.tar.gz -C ~ lab
tar -tzf /tmp/lab.tar.gz
rm -ri ~/lab/c
```

## Befehle
- `ls -lah` – ausführliche Liste
- `cp -a quelle ziel` – kopieren mit Attributen
- `mv alt neu` – umbenennen/verschieben
- `rm -ri ordner` – rekursiv, mit Rückfrage
- `mkdir -p a/b/c` – Pfad anlegen
- `touch datei` – anlegen/Zeitstempel
- `tar -czvf a.tar.gz dir` – packen
- `tar -xvf a.tar.gz -C ziel` – entpacken
- `file datei` – Typ bestimmen
- `dd if=x of=y bs=1M` – Blockkopie

## Übungen
- A: Lege ~/a/b/c in einem Schritt an. | L: mkdir -p ~/a/b/c
- A: Packe /etc mit gzip in /tmp/etc.tar.gz. | L: tar -czvf /tmp/etc.tar.gz /etc
- A: Welche Dateien trifft datei?.txt ? | L: datei1.txt, dateiA.txt ... (genau ein Zeichen).
- A: Wie listest du den Inhalt eines tar.gz ohne Entpacken? | L: tar -tzf archiv.tar.gz
- A: Wie benennst du a.txt in b.txt um? | L: mv a.txt b.txt

## Karteikarten
- F: Was bedeutet tar -x? | A: Archiv extrahieren.
- F: Was bedeutet tar -z? | A: Mit gzip (de)komprimieren.
- F: Was macht rmdir? | A: Entfernt nur leere Verzeichnisse.
- F: Was macht touch? | A: Legt leere Datei an oder aktualisiert Zeitstempel.
- F: Welche Wildcard steht für genau ein Zeichen? | A: ?
- F: Welche tar-Option entspricht bzip2? | A: -j
- F: Welche tar-Option entspricht xz? | A: -J
- F: Was erzeugt cp -a? | A: Rekursive Kopie unter Beibehaltung von Rechten, Zeiten, Links.
- F: Was macht file? | A: Bestimmt den Dateityp anhand des Inhalts.
- F: Was bewirkt mkdir -p? | A: Legt auch fehlende Elternverzeichnisse an.

## Quiz
? Welche Option erstellt ein tar-Archiv?
* -c
- -x
- -t
- -r

? Welche Wildcard steht für genau ein Zeichen?
* ?
- *
- []
- ~

? Wie entpackt man a.tar.gz?
* tar -xzf a.tar.gz
- tar -czf a.tar.gz
- gzip a.tar.gz -x
- untar a.tar.gz

? Welcher Befehl löscht nur leere Verzeichnisse?
* rmdir
- rm -r
- del
- unlink -d

? Welche Dateien erfasst * nicht?
* Versteckte Dateien mit führendem Punkt
- Dateien mit Leerzeichen
- Verzeichnisse
- Dateien über 1 MB

? Welcher Befehl benennt eine Datei um?
* mv
- rn
- cp -m
- ren

? Welche tar-Option zeigt den Inhalt eines Archivs?
* -t
- -l
- -s
- -i

? Welches Tool komprimiert am stärksten (typisch)?
* xz
- gzip
- zip
- compress

## Spickzettel
- ls cp mv rm mkdir -p rmdir touch file stat
- * ? [ ] { } · Shell expandiert
- tar c x t v f z j J · -C
- gzip bzip2 xz zip · cpio · dd
