---
id: linux-l1-03-dateiverwaltung
bereich: Linux
fach: Linux I
pruefungen: [LPIC-1, Schule]
block: L1
kapitel: Linux I – Grundlagen
titel: 1.03 Dateiverwaltung, Archive, Regex, vi, Links und FHS
stufe: Fortgeschritten
quellen: [1.03_Linux_-_Dateiverwaltung_Archive_und_Dateisystem.pdf, LPI-Learning-Material-101-500-de.pdf]
verweise: [linux-l1-01-kommandos, linux-101-103-3-dateiverwaltung, linux-101-103-7-regex, linux-101-103-8-vi, linux-101-104-6-links, linux-101-104-7-fhs, ref-linux]
---

## Profi

### Einordnung
103.3 (Gewicht 4), 103.7 (3), 103.8 (3), 104.6 (2), 104.7 (2) = **14 Gewichtspunkte** der Prüfung 101-500. Basisbefehle (cp, mv, rm, mkdir, touch, Globbing) → Kapitel 1.01.

### file und find (103.3)
- **`file`** erkennt den Dateityp am **Inhalt** (Magic Numbers, erste Bytes), **nicht an der Endung**: `file bild.dat` → PNG image data. `file -i` zeigt den MIME-Typ (`text/plain; charset=utf-8`).
- **`find`**: `-type f|d|l`, `-size +10M` (größer), `-size -1k` (kleiner), `-mtime -7` (vor **weniger** als 7 Tagen geändert), `-mtime +7` (**älter** als 7 Tage), `-name "*.log"`, `-exec chmod +x {} \;` (je Treffer), `-exec … {} +` (alle auf einmal), `-delete` (löschen – vorher ohne `-delete` testen!).

### Archiv ≠ Kompression
- **Archivieren** = viele Dateien zu einer bündeln, Struktur und Rechte bleiben (**tar**, **cpio**).
- **Komprimieren** = eine Datei verkleinern (**gzip**, **bzip2**, **xz**). Deshalb: erst tar, dann komprimieren → `.tar.gz`/`.tgz`.

### tar
| Option | Bedeutung |
|---|---|
| `-c` | create – erstellen |
| `-x` | extract – entpacken |
| `-t` | list – Inhalt anzeigen |
| `-f datei` | Archivdatei (muss direkt vor dem Namen stehen) |
| `-v` | verbose |
| `-z` / `-j` / `-J` | gzip (.tar.gz) / bzip2 (.tar.bz2) / xz (.tar.xz) |
| `-C verz` | in Zielverzeichnis entpacken/arbeiten |
| `-p` | Rechte erhalten |
Eselsbrücke: **czf = Create Zipped File**, **xzf = eXtract Zipped File**. `tar -tjf daten.tar.bz2` listet ein bzip2-Archiv. GNU tar erkennt beim Entpacken die Kompression meist automatisch.

### gzip, bzip2, xz
| Werkzeug | Endung | Eigenschaft | Entpacken |
|---|---|---|---|
| gzip | .gz | schnell, moderate Kompression | `gunzip` / `gzip -d` |
| bzip2 | .bz2 | stärker, langsamer | `bunzip2` / `bzip2 -d` |
| xz | .xz | stärkste Kompression, am langsamsten | `unxz` / `xz -d` |
Standardmäßig **ersetzen** sie die Originaldatei; **`-k`** behält das Original. Offiziell nennt 103.3 gzip/bzip2, xz ist moderne Ergänzung.

### cpio und dd
- **cpio** archiviert die **Dateinamen von stdin** (ideal mit find): `find . -name "*.c" | cpio -o > code.cpio`, entpacken `cpio -idv < code.cpio` (`-o` copy-out, `-i` copy-in, `-d` Verzeichnisse anlegen). Steckt in **initramfs** und **RPM**-Paketen (`rpm2cpio`).
- **dd** kopiert **blockweise und roh**: `dd if=linux.iso of=/dev/sdb bs=4M status=progress`; `if=` Eingabe, `of=` Ausgabe, `bs=` Blockgröße, `count=` Anzahl Blöcke. Beispiele: MBR sichern `dd if=/dev/sda of=mbr.img bs=512 count=1`. **Keine Rückfrage** – falsches `of=` überschreibt eine ganze Platte.

### Reguläre Ausdrücke (103.7)
| Zeichen | Bedeutung |
|---|---|
| `.` | ein beliebiges Zeichen |
| `*` | vorheriges Zeichen 0-mal oder öfter |
| `^` / `$` | Zeilenanfang / Zeilenende |
| `[abc]`, `[a-z]` | ein Zeichen aus Menge/Bereich |
| `[^abc]` | **Negation** (keines davon) |
| `[[:digit:]]`, `[[:alpha:]]`, `[[:space:]]` | POSIX-Zeichenklassen |
| `\<`, `\>` | Wortanfang/-ende |
| `\{n,m\}` (BRE) / `{n,m}` (ERE) | n- bis m-mal |
| `\+`, `\?` (BRE) / `+`, `?` (ERE) | 1+ / 0 oder 1 |
| `\\|` (BRE, GNU-Erweiterung) / `\|` (ERE) | Alternative (oder) |
- **BRE** (Basic, `grep`, `sed`): `+ ? { } ( ) |` sind **wörtlich**, brauchen Backslash. **ERE** (Extended, `grep -E`, `sed -E`): wirken direkt. `grep -E "colou?r"` = `grep "colou\?r"`; `grep -E "katze|hund"`.
- **grep-Familie**: `grep` (BRE), `grep -E`/`egrep` (ERE), `grep -F`/`fgrep` (feste Strings, keine Regex). egrep/fgrep sind **veraltet**. Optionen: `-i` Groß/Klein ignorieren, `-v` invertieren, `-c` zählen, `-n` Zeilennummern, `-o` nur Treffer, `-r` rekursiv, `-l` nur Dateinamen.
- **sed mit Regex**: `s/muster/ersatz/g`, `/muster/d`, `&` = ganzer Treffer, `\1` = erste Gruppe. `echo 2026-06-13 | sed -E 's/-/./g'` → 2026.06.13; `sed -E 's/(.+)@(.+)/\2/'` → Domain einer Mailadresse.

### vi (103.8)
- **Modi**: **Normalmodus** (Start, Navigieren/Befehle, **Esc** führt immer zurück), **Einfügemodus** (`i`, `a`, `o`), **Befehlszeilenmodus** (`:`).
- Navigation: `h j k l` (links, runter, hoch, rechts), `w`/`b` Wort vor/zurück, `0`/`$` Zeilenanfang/-ende, `gg`/`G` Dateianfang/-ende, `/text` `?text` suchen, `n`/`N`. Zahlen voranstellen: `5j`, `3w`.
- Einfügen: `i` vor, `a` nach Cursor, `I`/`A` Zeilenanfang/-ende, `o`/`O` neue Zeile darunter/darüber.
- Bearbeiten: `x` Zeichen, `dd` Zeile ausschneiden, `yy` Zeile kopieren (yank), `p`/`P` einfügen nach/vor, `dw`, `d$`, `u` rückgängig, `Strg+r` wiederherstellen. Operator + Bewegung: `d` + `w` = `dw`; `3yy` dann `p`.
- Speichern: `:w`, `:q`, `:wq` / `:x` / **`ZZ`**, `:q!` verwerfen, `:w!` erzwingen.
- **Standardeditor**: Variable **`EDITOR`** (z. B. `export EDITOR=nano`) – wird u. a. von `crontab -e` genutzt. Alternativen: nano, emacs, vim.

### Links und Inodes (104.6)
- Datei = **Inode** (Metadaten + Zeiger auf Datenblöcke) + **Name** im Verzeichnis. `ls -i` zeigt die Inode-Nummer.
- **Hardlink** (`ln ziel name`): weiterer Name für **denselben Inode**; nur im **selben Dateisystem**, **nicht für Verzeichnisse**; bleibt gültig, wenn der Originalname gelöscht wird. Der **Linkzähler** in `ls -l` (2. Spalte) zeigt die Anzahl Namen.
- **Symlink** (`ln -s ziel name`): eigene Datei (eigener Inode, Typ `l`) mit **Pfad** zum Ziel; über Dateisystemgrenzen und auf Verzeichnisse; **bricht** („dangling“), wenn das Ziel verschwindet.
- `cp` dupliziert Daten, `ln` teilt sie. Einsatz: Versionen umschalten (`python -> python3`).

### FHS und Dateien finden (104.7)
| Pfad | Inhalt |
|---|---|
| `/bin`, `/sbin` | essenzielle Programme (Nutzer/System) – heute meist Symlinks nach `/usr` (usrmerge) |
| `/etc` | Konfiguration |
| `/home`, `/root` | Benutzer-Homes / Home von root |
| `/var` | veränderliche Daten (Logs, Mail, Spool) |
| `/tmp` | temporäre Dateien |
| `/usr` | Programme und Bibliotheken (read-only-fähig) |
| `/opt` | Zusatz-/Fremdsoftware |
| `/lib` | Bibliotheken und Kernelmodule |
| `/dev` | Gerätedateien |
| `/proc`, `/sys` | virtuelle Kernel-Dateisysteme |
| `/boot` | Kernel, initramfs, Bootloader |
| `/mnt`, `/media` | Einhängepunkte (manuell / Wechselmedien) |
- **`locate`** durchsucht eine vorab gebaute **Datenbank** (sehr schnell, aber evtl. **veraltet**); **`updatedb`** baut sie neu (meist täglich per cron/Timer, als root). **`/etc/updatedb.conf`** legt Ausschlüsse fest (PRUNEPATHS, PRUNEFS). Aktuelle Suche: `find`.
- **`which`** = Pfad im PATH; **`whereis`** = Programm + Quelltext + Manpage; **`type`** = Shell-Sicht (Builtin/Alias/Programm).

### Praxis-Bonus
`rsync -avP quelle/ ziel/` (nur Unterschiede; `--delete` spiegelt; **Slash am Quellende** = Inhalt kopieren, ohne Slash = Ordner selbst), `zip -r`/`unzip -l` (Austausch mit Windows; bündelt und komprimiert in einem Schritt), `stat` (Inode, Zeiten), **`df -h`** (wie voll ist die Platte?), **`du -sh`** (was belegt den Platz?), `ncdu`.

## Einfach

**Archivieren** ist wie **Umzugskartons packen**: Du legst viele Sachen in einen Karton, damit nichts verloren geht und alles beieinander bleibt. Das macht **tar**. **Komprimieren** ist wie **Vakuumbeutel**: Die Luft wird rausgesaugt, damit es kleiner wird. Das machen **gzip**, **bzip2** und **xz**. Meistens macht man beides: erst Karton, dann Vakuum → `.tar.gz`.

**`file`** ist wie ein **Detektiv**, der nicht aufs Etikett schaut, sondern **in die Dose hineinriecht**: Auch wenn auf der Dose „Bild.dat“ steht, erkennt er, dass ein PNG-Bild drin ist.

**`dd`** ist ein **Kopierer, der blind Seite für Seite kopiert** – ohne nachzufragen. Wenn du ihm das falsche Ziel sagst, überschreibt er deine ganze Festplatte. Darum: Ziel **dreimal** prüfen!

**Reguläre Ausdrücke** sind **Suchschablonen**. Statt nach genau „Haus“ zu suchen, sagst du z. B. „irgendwas, das mit H anfängt und mit s aufhört“. `^` heißt „am Zeilenanfang“, `$` heißt „am Zeilenende“, `.` ist ein **Joker für genau ein Zeichen**.

**vi** hat **zwei Hauptgänge** wie ein Auto: Im **Normalmodus** fährst du herum und gibst Befehle (löschen, kopieren). Erst mit **`i`** schaltest du in den **Schreibgang**. Mit **Esc** zurück, mit **`:wq`** speichern und aussteigen. Der häufigste Anfängerfehler: losschreiben, ohne `i` zu drücken – dann passieren seltsame Dinge.

**Links**: Ein **Hardlink** ist wie ein **zweites Namensschild an derselben Tür** – beide Schilder führen in denselben Raum. Nimmst du ein Schild ab, ist der Raum noch da. Ein **Symlink** ist wie ein **Zettel „Der Raum ist jetzt dort drüben“**. Reißt man den Raum ab, zeigt der Zettel ins Leere.

Der **FHS** ist die **Hausordnung**: In jedem Linux-Haus liegen die Einstellungen in `/etc`, die Benutzer wohnen in `/home`, das Tagebuch (Logs) liegt in `/var/log`. So findest du dich in jedem Linux zurecht.

**`locate`** ist wie das **Inhaltsverzeichnis eines Buchs** – superschnell, aber nur so aktuell wie der letzte Druck (`updatedb`). **`find`** blättert wirklich jede Seite durch – langsamer, aber immer aktuell.

## Merksatz
- **czf = Create Zipped File, xzf = eXtract Zipped File, tf = Table/list**.
- **z = gzip, j = bzip2, J = xz** (Groß-J = stärkste Kompression).
- **-mtime -7 = jünger, +7 = älter**.
- **BRE braucht Backslash, ERE nicht**.
- **Hardlink = gleicher Inode, Symlink = Pfad-Zettel**.
- **df = wie voll? du = wer belegt?**
- **locate ist schnell, find ist aktuell**.

## Prüfungsfalle
- `tar -xzf` **entpackt**, `tar -czf` **erstellt** – nicht verwechseln.
- `-f` muss direkt vor dem Archivnamen stehen (`tar -cfz x.tgz` ist falsch).
- gzip/bzip2/xz **löschen das Original**, außer mit `-k`.
- **Hardlinks** funktionieren **nicht** über Dateisystemgrenzen und nicht für Verzeichnisse.
- `file` prüft **nicht die Endung**.
- In **BRE** ist `+` wörtlich – `grep "a+"` sucht nach „a+“, `grep -E "a+"` nach einem oder mehr a.
- `egrep`/`fgrep` sind veraltet → `grep -E`/`grep -F`.
- `locate` findet keine **neu angelegten** Dateien, bis `updatedb` lief.
- `whereis` zeigt **auch Manpages**, `which` nur das Programm.
- 104.4 gibt es in LPIC-1 v5 nicht mehr – nach 104.3 folgt 104.5.

## Grafik

### tar.gz erstellen und entpacken
1. projekt/: viele Dateien und Ordner
2. projekt/ -> tar: bündelt zu einem Archiv (-c)
3. tar -> gzip: komprimiert den Strom (-z)
4. gzip -> backup.tar.gz: Datei wird geschrieben (-f)
5. backup.tar.gz -> tar: -xzf entpackt mit -C /tmp
6. tar -> /tmp: Struktur und Rechte wiederhergestellt

### Hardlink vs. Symlink
1. datei.txt -> Inode 1314520: Name zeigt auf Inode
2. zweiter.txt -> Inode 1314520: Hardlink, Linkzähler 2
3. link -> datei.txt: Symlink mit eigenem Inode zeigt auf den Pfad
4. datei.txt: wird gelöscht
5. zweiter.txt: Daten weiter lesbar (Linkzähler 1)
6. link: zeigt ins Leere (dangling)

### locate-Datenbank
1. cron -> updatedb: nächtlicher Lauf als root
2. updatedb -> Datenbank: Dateinamen indexieren (ohne PRUNEPATHS)
3. Benutzer -> locate: sucht sshd_config
4. locate -> Datenbank: Abfrage in Millisekunden
5. locate -> Benutzer: /etc/ssh/sshd_config

## Lab
**Maschine**: debian01 (normaler Benutzer mit sudo). Für dd einen **leeren** USB-Stick bzw. eine Testdatei verwenden.
```bash
# auf debian01 – file und find
mkdir -p ~/lab103/projekt && cd ~/lab103
cp /usr/share/pixmaps/*.png projekt/bild.dat 2>/dev/null; file projekt/* ; file -i /etc/hosts
touch projekt/a.sh projekt/b.sh projekt/x.tmp
find . -name "*.sh" -exec chmod +x {} \;
find . -name "*.tmp"            # erst prüfen
find . -name "*.tmp" -delete    # dann löschen
find /var -type f -size +50M 2>/dev/null

# auf debian01 – tar und Kompression
tar -czvf backup.tar.gz projekt/; tar -tzf backup.tar.gz
mkdir /tmp/restore && tar -xzf backup.tar.gz -C /tmp/restore
tar -cjf backup.tar.bz2 projekt/; tar -cJf backup.tar.xz projekt/; ls -lh backup.*
cp /etc/services log.txt; gzip -k log.txt; ls log.txt*; gunzip -f log.txt.gz

# auf debian01 – cpio und dd (nur Datei, kein Gerät!)
find projekt -type f | cpio -o > code.cpio; mkdir c && cd c && cpio -idv < ../code.cpio; cd ..
dd if=/dev/zero of=test.img bs=1M count=10 status=progress

# auf debian01 – Regex
grep "^root" /etc/passwd; grep "bash$" /etc/passwd; grep -c nologin /etc/passwd
grep -E "^(root|daemon):" /etc/passwd; grep "[[:digit:]]\{4\}" /etc/services | head -3
echo 2026-06-13 | sed -E 's/-/./g'; echo admin@example.com | sed -E 's/(.+)@(.+)/\2/'

# auf debian01 – Links
echo Hallo > datei.txt; ln datei.txt zweiter.txt; ln -s datei.txt link; ls -li
rm datei.txt; cat zweiter.txt; cat link

# auf debian01 – Finden
sudo updatedb; locate sshd_config; whereis ls; which ls; type cd
df -h /; du -sh /var/log 2>/dev/null
```

## Befehle
- `file -i datei` – Dateityp/MIME-Typ am Inhalt erkennen
- `find . -name "*.sh" -exec chmod +x {} \;` – Befehl je Treffer
- `find . -name "*.tmp" -delete` – Treffer löschen
- `tar -czf archiv.tar.gz verz/` – gzip-Archiv erstellen
- `tar -xzf archiv.tar.gz -C /ziel` – gzip-Archiv in Zielverzeichnis entpacken
- `tar -tf archiv.tar` – Inhalt auflisten
- `tar -cJf archiv.tar.xz verz/` – xz-Archiv erstellen
- `gzip -k datei` – komprimieren, Original behalten
- `gunzip datei.gz` – entpacken (= gzip -d)
- `bzip2 -d datei.bz2` – bzip2 entpacken (= bunzip2)
- `xz -d datei.xz` – xz entpacken (= unxz)
- `find . | cpio -o > a.cpio` – cpio-Archiv aus Dateiliste
- `cpio -idv < a.cpio` – cpio-Archiv entpacken
- `dd if=x.iso of=/dev/sdX bs=4M status=progress` – ISO roh auf Gerät schreiben
- `grep -E "a|b" datei` – erweiterte Regex mit Alternative
- `grep -F "1.2.3.4" log` – feste Zeichenkette suchen
- `grep -rn TODO ./src` – rekursiv mit Zeilennummern
- `sed -E 's/(.+)@(.+)/\2/'` – Backreference einsetzen
- `ln -s ziel name` – Symlink anlegen
- `ls -li` – Inode-Nummern und Linkzähler anzeigen
- `locate -i readme` – Datenbanksuche ohne Groß/Klein
- `updatedb` – locate-Datenbank aktualisieren
- `whereis ls` – Programm, Quelltext und Manpage
- `df -h` – Belegung der Dateisysteme
- `du -sh ordner` – Größe eines Verzeichnisses
- `rsync -avP quelle/ ziel/` – inkrementell synchronisieren (Bonus)

## Übungen
- A: Welcher Aufruf erstellt ein gzip-Archiv? (tar -xzf, tar -czf, tar -tf, tar -cf) | L: tar -czf – c erstellt, z gzip, f Datei.
- A: Woran erkennt file den Dateityp? | L: Am Inhalt (Magic Numbers in den ersten Bytes), nicht an der Endung.
- A: Was bedeutet find . -mtime -7? | L: In den letzten 7 Tagen geändert; +7 wäre älter als 7 Tage.
- A: Welches Werkzeug schreibt ein ISO blockweise auf einen USB-Stick? | L: dd if=linux.iso of=/dev/sdX bs=4M status=progress – Zielgerät genau prüfen.
- A: Welches Regex-Zeichen passt auf das Zeilenende? | L: $ (^ = Anfang, . = beliebiges Zeichen).
- A: Wie speichert und beendet man vi? | L: ZZ, :wq oder :x (:q! verwirft).
- A: Wodurch unterscheidet sich ein Symlink vom Hardlink? | L: Der Symlink ist eine eigene Datei mit einem Pfad zum Ziel; der Hardlink teilt den Inode.
- A: Welcher Befehl aktualisiert die locate-Datenbank? | L: updatedb (meist als root bzw. per cron).
- A: Ersetze in einer Datumsangabe 2026-06-13 alle Bindestriche durch Punkte. | L: echo 2026-06-13 \| sed -E 's/-/./g'
- A: Kopiere mit vi drei Zeilen und füge sie unter dem Cursor ein. | L: Im Normalmodus 3yy, dann p.

## Karteikarten
- F: Was ist der Unterschied zwischen Archivieren und Komprimieren? | A: Archivieren bündelt viele Dateien mit Struktur und Rechten (tar, cpio); Komprimieren verkleinert eine Datei (gzip, bzip2, xz).
- F: Welche tar-Optionen stehen für gzip, bzip2 und xz? | A: -z gzip, -j bzip2, -J xz.
- F: Was macht tar -C /tmp beim Entpacken? | A: Entpackt in das Verzeichnis /tmp.
- F: Wie behält gzip die Originaldatei? | A: Mit der Option -k (keep).
- F: Woher bekommt cpio die zu archivierenden Dateinamen? | A: Über stdin, typischerweise von find.
- F: Was bedeuten if=, of=, bs= und count= bei dd? | A: Eingabe, Ausgabe, Blockgröße, Anzahl Blöcke.
- F: Was ist der Unterschied zwischen BRE und ERE? | A: In BRE müssen + ? { } ( ) | mit Backslash maskiert werden, um zu wirken; in ERE (grep -E) wirken sie direkt.
- F: Was bedeutet [^0-9] in einer Regex? | A: Ein Zeichen, das keine Ziffer ist (Negation).
- F: Was ist ein Inode? | A: Datenstruktur mit Metadaten (Rechte, Besitzer, Zeiten, Größe) und Zeigern auf die Datenblöcke – ohne Dateinamen.
- F: Warum gibt es keine Hardlinks über Dateisystemgrenzen? | A: Inode-Nummern sind nur innerhalb eines Dateisystems eindeutig.
- F: Was zeigt die zweite Spalte von ls -l bei einer Datei? | A: Den Linkzähler – wie viele Namen (Hardlinks) auf den Inode zeigen.
- F: Was steht in /etc/updatedb.conf? | A: Welche Pfade und Dateisysteme updatedb ausschließt (PRUNEPATHS, PRUNEFS).
- F: Welche Variable legt den Standardeditor fest? | A: EDITOR (z. B. export EDITOR=nano).
- F: Was machen o und O in vi? | A: o öffnet eine neue Zeile unter, O über der aktuellen Zeile im Einfügemodus.

## Quiz
? Welcher Befehl erstellt ein bzip2-komprimiertes tar-Archiv?
* tar -cjf daten.tar.bz2 daten/
- tar -czf daten.tar.bz2 daten/
- tar -xjf daten.tar.bz2 daten/
- tar -cJf daten.tar.bz2 daten/

? Woran erkennt `file` den Typ einer Datei?
* An den ersten Bytes des Inhalts (Magic Numbers)
- An der Dateiendung
- An der Dateigröße
- Am Besitzer der Datei

? Was findet `find /var/log -mtime +30`?
* Dateien, die vor mehr als 30 Tagen geändert wurden
- Dateien, die in den letzten 30 Tagen geändert wurden
- Dateien größer als 30 MB
- Die 30 neuesten Dateien

? Welche Regex passt in ERE auf „color“ und „colour“?
* colou?r
- colou*r+
- colo.r
- colou\{2\}r

? Welcher Befehl sucht feste Zeichenketten ohne Regex-Auswertung?
* grep -F
- grep -E
- grep -v
- grep -o

? Was gilt für einen Hardlink?
* Er teilt sich den Inode mit dem Original
- Er kann auf Verzeichnisse zeigen
- Er funktioniert über Dateisystemgrenzen
- Er wird ungültig, wenn der Originalname gelöscht wird

? Wie beendet man vi, ohne Änderungen zu speichern?
* :q!
- :wq
- ZZ
- :x

? Warum findet `locate` eine gerade angelegte Datei nicht?
* Die Datenbank wurde seit dem Anlegen nicht mit updatedb aktualisiert
- locate sucht nur in /usr
- locate benötigt Root-Rechte für jede Suche
- locate sucht nur nach Verzeichnissen

? Welches FHS-Verzeichnis enthält veränderliche Daten wie Logs?
* /var
- /usr
- /opt
- /etc

? Welcher Befehl zeigt auch die Manpage-Pfade eines Programms?
* whereis
- which
- type
- locate -b

? Was macht `gzip datei.txt` ohne Optionen?
* Erzeugt datei.txt.gz und entfernt datei.txt
- Erzeugt datei.txt.gz und behält datei.txt
- Erzeugt ein tar-Archiv
- Komprimiert nur in den Speicher

## Spickzettel
- file = Inhalt, nicht Endung · find -mtime -7 jünger/+7 älter · -exec {} \; · -delete
- tar c/x/t + f · z gzip · j bzip2 · J xz · -C ziel
- gzip/bzip2/xz löschen Original (außer -k) · gunzip bunzip2 unxz
- cpio liest Namen von stdin · dd if= of= bs= count= (keine Rückfrage!)
- Regex: . * ^ $ [ ] [^ ] · BRE \+ \? \{ \} · ERE grep -E · fgrep = grep -F
- vi: i a o · Esc · dd yy p · u · :wq ZZ · :q!
- Hardlink = Inode, gleiches FS, keine Verz. · Symlink = Pfad, kann brechen
- FHS: /etc /var /usr /opt /home /root /tmp /dev /proc /sys /boot
- locate + updatedb (/etc/updatedb.conf) · whereis · which · type
