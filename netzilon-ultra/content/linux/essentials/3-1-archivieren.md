---
id: linux-ess-archivieren
bereich: Linux
fach: Linux I
pruefungen: [LPIC-1, Schule]
block: Linux Essentials
kapitel: Thema 3 – Die Macht der Befehlszeile
titel: 3.1 Dateien mithilfe der Befehlszeile archivieren
stufe: Einsteiger
quellen: [LPI-Learning-Material-010-160-de.pdf]
verweise: [linux-l1-03-dateiverwaltung]
---

## Profi

### Lernziel (Gewicht 2)
Archive erstellen und entpacken, Kompression, ZIP.

### Begriffe
- **Archivieren** = viele Dateien in **eine** Datei bündeln (tar). **Komprimieren** = Platz sparen (gzip, bzip2, xz). Oft kombiniert: `.tar.gz` (`.tgz`), `.tar.bz2`, `.tar.xz`.

### tar
- Erstellen `tar -cvf archiv.tar verz/` (c create, v verbose, f file). Auflisten `-t`, Entpacken `-x`, Zielverzeichnis `-C /ziel`.
- Mit Kompression: `-z` gzip (`tar -czvf a.tar.gz verz/`), `-j` bzip2, `-J` xz; Entpacken `tar -xzvf a.tar.gz`. Ältere tar benötigen die Option, moderne erkennen es beim Entpacken selbst.
- Reihenfolge: Option `f` muss unmittelbar vor dem Dateinamen stehen.

### Kompressionstools
- `gzip datei` → `datei.gz` (ersetzt das Original), `gunzip`; `bzip2`/`bunzip2`; `xz`/`unxz`. Optionen `-k` (Original behalten), `-d` (dekomprimieren), `-1`…`-9`. Lesen ohne Entpacken: `zcat`, `zless`, `bzcat`, `xzcat`. Kompressionsgrad etwa gzip < bzip2 < xz (Geschwindigkeit umgekehrt).

### ZIP
- `zip -r archiv.zip verz/`, `unzip archiv.zip`, `unzip -l` (Inhalt), `-d ziel`. ZIP komprimiert und archiviert gleichzeitig, kennt keine Linux-Rechte vollständig.

## Einfach

Stell dir vor, du ziehst um und musst 100 lose Gegenstände transportieren. Du packst sie in **einen Umzugskarton**. Das ist **Archivieren**: viele Dateien werden zu einer einzigen Datei. Das Werkzeug dafür heißt **tar** (Tape Archive).

Der Karton ist aber noch sperrig. Mit **Komprimieren** presst du die Luft heraus, wie bei einem Vakuumbeutel für Kleidung. Das erledigen `gzip`, `bzip2` oder `xz`. Beide Schritte zusammen ergeben ein `.tar.gz`.

Merke dir die Zauberformel zum **Einpacken**: `tar -czvf paket.tar.gz ordner/`. Das steht für: **c**reate, g**z**ip, **v**erbose (zeig mir, was passiert), **f**ile (der Name kommt jetzt). Zum **Auspacken**: `tar -xzvf paket.tar.gz`. Das `x` steht für extract.

Unter Windows kennst du ZIP-Dateien. Die gibt es auch hier: `zip -r pack.zip ordner` und `unzip pack.zip`.

Willst du nur wissen, was im Paket steckt, ohne es zu öffnen: `tar -tf paket.tar.gz`.

## Merksatz
- **c = create, x = extract, t = list, z = gzip, j = bzip2, J = xz, f = Datei.**
- **tar bündelt, gzip komprimiert.**
- **Stärker komprimiert, aber langsamer: xz.**

## Prüfungsfalle
- `gzip datei` löscht das Original (außer `-k`).
- Bei `tar -cf` muss die Zieldatei direkt hinter `f` stehen (`tar -cf a.tar dir`, nicht `-fc`).
- `.tar` ist **nicht** komprimiert.
- Mit `-C` entpackt man in ein anderes Verzeichnis.

## Grafik

### Archiv erstellen und entpacken
1. Benutzer -> tar: tar -czvf backup.tar.gz daten/
2. tar: bündelt alle Dateien zu backup.tar
3. tar -> gzip: Komprimierung
4. gzip -> Benutzer: backup.tar.gz fertig
5. Benutzer -> tar: tar -xzvf backup.tar.gz
6. tar: Dateien wiederhergestellt

## Befehle
- `tar -czvf a.tar.gz ordner` – packen
- `tar -xzvf a.tar.gz -C /ziel` – entpacken
- `tar -tf a.tar.gz` – Inhalt zeigen
- `gzip -k datei` – komprimieren, Original behalten
- `gunzip datei.gz` – entpacken
- `zip -r a.zip ordner` – ZIP erstellen
- `unzip a.zip` – ZIP entpacken

## Übungen
- A: Erzeuge ein gzip-Archiv von /etc/ssh. | L: `tar -czvf ssh.tar.gz /etc/ssh`
- A: Zeige den Inhalt von x.tar.bz2, ohne zu entpacken. | L: `tar -tjf x.tar.bz2`
- A: Entpacke backup.tar.xz nach /tmp. | L: `tar -xJf backup.tar.xz -C /tmp`

## Karteikarten
- F: Was bedeutet tar -c? | A: Archiv erstellen (create).
- F: Was bedeutet tar -x? | A: Archiv entpacken (extract).
- F: Was bedeutet tar -t? | A: Inhalt auflisten.
- F: Welche Option nutzt gzip in tar? | A: -z
- F: Welche Option nutzt bzip2 in tar? | A: -j
- F: Welche Option nutzt xz in tar? | A: -J
- F: Was macht gzip -k? | A: Komprimiert und behält das Original.
- F: Was ist der Unterschied Archivieren/Komprimieren? | A: Bündeln vs. Platz sparen.
- F: Welcher Befehl liest eine .gz ohne zu entpacken? | A: zcat
- F: Was macht unzip -l? | A: Listet den Inhalt einer ZIP-Datei.

## Quiz
? Welcher Befehl erstellt ein gzip-komprimiertes Archiv?
* tar -czvf a.tar.gz ordner
- tar -xzvf a.tar.gz ordner
- tar -tf a.tar.gz
- gzip -c ordner

? Welche Option listet den Archivinhalt?
* -t
- -l
- -c
- -i

? Welche Kompression ist meist am stärksten?
* xz
- gzip
- Keine
- compress

? Was geschieht mit gzip datei?
* Die Originaldatei wird durch datei.gz ersetzt
- Die Datei wird kopiert
- Es entsteht ein tar
- Nichts

? Welche Dateiendung ist nur gebündelt, nicht komprimiert?
* .tar
- .tgz
- .gz
- .xz

? Welcher Befehl entpackt ZIP?
* unzip
- untar
- gunzip
- unrar

? Was macht -C bei tar?
* Wechselt vor dem Entpacken in ein Zielverzeichnis
- Komprimiert
- Prüft CRC
- Kopiert

? Was bedeutet tar -j?
* bzip2-Kompression
- gzip
- xz
- zip

## Lücken
- {tar} bündelt Dateien zu einem Archiv.
- Mit {-x} werden Archive entpackt.
- {gzip} ersetzt die Originaldatei durch .gz.

## Spickzettel
- c x t · z j J · v f
- tar -czvf / tar -xzvf
- gzip -k · zcat · zip -r · unzip
