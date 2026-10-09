---
id: linux-ess-spezielle-verzeichnisse
bereich: Linux
fach: Linux I
pruefungen: [LPIC-1, Schule]
block: Linux Essentials
kapitel: Thema 5 – Sicherheit und Dateiberechtigungen
titel: 5.4 Besondere Verzeichnisse und Dateien
stufe: Einsteiger
quellen: [LPI-Learning-Material-010-160-de.pdf]
verweise: [linux-101-104-6-links,linux-101-104-7-fhs]
---

## Profi

### Lernziel (Gewicht 1)
Temporäre Dateien, Links und Spezialrechte im Alltag.

### Temporäre Verzeichnisse
- `/tmp`: für alle schreibbar, **Sticky Bit** (`drwxrwxrwt`), wird beim Neustart oder per `systemd-tmpfiles` geleert. `/var/tmp`: bleibt über Neustarts erhalten. `/run`: Laufzeitdaten (tmpfs). `mktemp` legt sichere temporäre Dateien an.

### Links
- **Hardlink** (`ln ziel linkname`): weiterer Name für denselben **Inode**; gleicher Dateiinhalt, gleiche Rechte; nur im selben Dateisystem; nicht für Verzeichnisse. Datei verschwindet erst, wenn der **Linkzähler** 0 ist.
- **Symbolischer Link** (`ln -s ziel linkname`): eigene Datei mit Pfad zum Ziel; über Dateisysteme hinweg und für Verzeichnisse möglich; wird **kaputt**, wenn das Ziel gelöscht wird. In `ls -l` mit `l` und `->` sichtbar. `readlink`, `ls -i` (Inode).

### Versteckte Dateien
Namen mit Punkt am Anfang (`.bashrc`, `.ssh/`); `ls -a`. Konfiguration von Benutzerprogrammen im Home.

### Spezielle Dateien
`/dev/null` (schluckt alles), `/dev/zero` (liefert Nullen), `/dev/random`, `/dev/urandom`, `/dev/tty`. Sonderrechte SUID/SGID/Sticky (siehe Rechte): SUID bei `/usr/bin/passwd`, SGID für Gruppenverzeichnisse, Sticky bei `/tmp`.

### Dateiendungen
Linux nutzt Endungen nur als Konvention; Typ bestimmt `file`.

## Einfach

Linux hat ein paar **besondere Orte**. `/tmp` ist der **Zettelkasten** für kurzfristige Notizen. Jeder darf dort hineinschreiben, aber dank des **Sticky Bits** darf niemand die Zettel eines anderen wegwerfen. Beim Neustart wird er meist aufgeräumt.

**Links** sind Abkürzungen. Es gibt zwei Sorten:

- Ein **symbolischer Link** (`ln -s`) ist wie ein **Wegweiser**. Er zeigt auf die echte Datei. Wird die echte Datei gelöscht, zeigt der Wegweiser ins Leere. Ein solcher Link funktioniert auch auf andere Festplatten und für ganze Ordner.
- Ein **Hardlink** (`ln`) ist wie ein **zweiter Name** für dieselbe Datei. Beide Namen sind gleichberechtigt. Die Daten verschwinden erst, wenn der letzte Name gelöscht ist. Das geht nur auf derselben Festplatte.

Dateien, deren Name mit einem **Punkt** beginnt, sind versteckt. So bleiben Einstellungen im Home-Ordner aus dem Weg.

Und es gibt Geräte-Spezialdateien: `/dev/null` ist ein **Mülleimer ohne Boden**. Alles, was du dort hineinschickst, verschwindet. Das nutzt man, um unerwünschte Ausgaben loszuwerden: `befehl 2> /dev/null`.

## Merksatz
- **ln -s = Wegweiser, ln = zweiter Name.**
- **/tmp: Sticky, flüchtig. /var/tmp: bleibt.**
- **/dev/null verschluckt alles.**
- **Punkt = versteckt.**

## Prüfungsfalle
- Löscht man das Ziel eines Symlinks, ist der Link **kaputt**; ein Hardlink bleibt voll funktionsfähig.
- Hardlinks gehen **nicht** über Dateisystemgrenzen und nicht für Verzeichnisse.
- `/tmp` wird beim Booten geleert, `/var/tmp` nicht.
- `ls -i` zeigt gleiche Inode-Nummern bei Hardlinks.

## Grafik

### Symlink vs. Hardlink
1. Benutzer -> Shell: ln -s daten.txt weg.txt
2. weg.txt -> daten.txt: verweist per Pfad
3. Benutzer -> Shell: ln daten.txt zweit.txt
4. zweit.txt -> Inode: gleicher Inode wie daten.txt
5. Benutzer -> daten.txt: rm daten.txt, weg.txt kaputt, zweit.txt lebt

## Befehle
- `ln -s ziel link` – symbolischer Link
- `ln ziel link` – Hardlink
- `ls -li` – Inodes zeigen
- `readlink link` – Ziel anzeigen
- `mktemp` – temporäre Datei
- `file name` – Dateityp

## Übungen
- A: Wie legst du einen symbolischen Link /tmp/etc auf /etc an? | L: `ln -s /etc /tmp/etc`
- A: Woran erkennst du einen Hardlink? | L: Gleiche Inode-Nummer und Linkzähler > 1 in `ls -li`.
- A: Wie verwirfst du Fehlermeldungen? | L: `befehl 2> /dev/null`

## Karteikarten
- F: Was ist ein Symlink? | A: Datei, die einen Pfad zum Ziel enthält.
- F: Was ist ein Hardlink? | A: Weiterer Verzeichniseintrag auf denselben Inode.
- F: Kann ein Hardlink ein Verzeichnis sein? | A: Nein.
- F: Was geschieht mit Symlink bei gelöschtem Ziel? | A: Er wird kaputt (dangling).
- F: Was ist /dev/null? | A: Gerät, das Daten verwirft.
- F: Was bewirkt das Sticky Bit auf /tmp? | A: Nur Besitzer darf eigene Dateien löschen.
- F: Unterschied /tmp und /var/tmp? | A: /var/tmp überlebt Neustarts.
- F: Was zeigt ls -i? | A: Inode-Nummern.
- F: Was ist eine versteckte Datei? | A: Name beginnt mit einem Punkt.
- F: Was liefert /dev/zero? | A: Endlosen Strom von Nullbytes.

## Quiz
? Welcher Befehl erzeugt einen symbolischen Link?
* ln -s
- ln
- link -s
- mklink

? Was passiert mit einem Hardlink, wenn das Original gelöscht wird?
* Er funktioniert weiter
- Er wird kaputt
- Er wird gelöscht
- Er zeigt auf /dev/null

? Welches Verzeichnis überlebt einen Neustart?
* /var/tmp
- /tmp
- /run
- /proc

? Was ist /dev/null?
* Gerät, das alle Daten verwirft
- Leere Datei
- Hauptspeicher
- Papierkorb

? Können Hardlinks Dateisystemgrenzen überschreiten?
* Nein
- Ja
- Nur als root
- Nur für Verzeichnisse

? Welches Zeichen zeigt ls -l bei Symlinks?
* l
- s
- d
- h

? Welches Recht schützt /tmp?
* Sticky Bit
- SUID
- SGID
- ACL

? Woran erkennt man Hardlinks?
* Gleiche Inode-Nummer
- Pfeil -> in ls
- Endung .lnk
- Rechte 777

## Spickzettel
- ln = Hardlink · ln -s = Symlink
- /tmp (flüchtig, sticky) · /var/tmp (bleibt)
- /dev/null · /dev/zero
- .versteckt
