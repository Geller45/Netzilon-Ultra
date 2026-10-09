---
id: linux-101-104-6-links
bereich: Linux
fach: Linux I
pruefungen: [LPIC-1]
block: LPIC-101
kapitel: LPIC-1 Prüfung 101 – Geräte, Dateisysteme, FHS
titel: 104.6 Harte und symbolische Links erzeugen und ändern
stufe: Fortgeschritten
quellen: [LPI-Learning-Material-101-500-de.pdf, 1.03_Linux_-_Dateiverwaltung_Archive_und_Dateisystem.pdf]
verweise: [linux-l1-03-dateiverwaltung, linux-101-104-5-rechte, linux-101-104-7-fhs]
---

## Profi

### Lernziel (Gewicht 2)
Harte und symbolische Links anlegen, unterscheiden und auflösen.

### Inodes und Dateinamen
- Unter Linux besteht eine Datei aus **Inode** (Metadaten: Besitzer, Rechte, Zeiten, Größe, Zeiger auf Datenblöcke) und **Verzeichniseinträgen** (Name → Inode-Nummer). `ls -i` zeigt Inode-Nummern, `stat datei` Details, `ls -l` Spalte 2 = **Linkzähler**.

### Hardlink
- `ln original linkname`. Ein weiterer **Name für denselben Inode**; gleiche Inode-Nummer, gleiche Rechte/Daten, Linkzähler +1. Löschen eines Namens löscht die Daten erst, wenn der Zähler **0** ist. Grenzen: nur **im selben Dateisystem**, **nicht für Verzeichnisse** (außer `.`/`..`).

### Symbolischer Link (Softlink)
- `ln -s ziel linkname`. Eigene kleine Datei (Typ `l`) mit einem **Pfad als Inhalt** (`lrwxrwxrwx`, Rechte irrelevant). Funktioniert über Dateisystemgrenzen und für Verzeichnisse. Wird das Ziel gelöscht, entsteht ein **toter Link** (dangling). Relative Ziele sind relativ zum **Ort des Links**.
- Anzeigen/Auflösen: `ls -l`, `readlink -f`, `realpath`, `find -type l`, `find -xtype l` (tote Links). Link ersetzen: `ln -sf`, `ln -sfn` (bei Verzeichnis-Links).
- Praxis: `/etc/alternatives`, `/bin → usr/bin`, Versionslinks (`lib.so → lib.so.1.2`).

## Einfach

Eine Datei besteht aus zwei Dingen: dem **Inhalt** (im Regal, durch eine Nummer, den Inode, bezeichnet) und einem **Namensschild**, auf dem steht, wo der Inhalt zu finden ist.

Ein **Hardlink** ist ein **zweites Namensschild für dasselbe Regalfach**. Beide Schilder sind gleichwertig; es gibt kein „Original“. Wirfst du ein Schild weg, bleibt der Inhalt erhalten, solange noch ein Schild existiert. Erst wenn das letzte Schild weg ist, ist der Inhalt weg. Die Zahl der Schilder steht im `ls -l` direkt nach den Rechten.

Ein **symbolischer Link** ist dagegen ein **Zettel mit der Aufschrift: „Das Ding liegt dort drüben.“** Er verweist nur über den Namen. Wirfst du das Original weg, führt der Zettel ins Leere – ein **toter Link**. Dafür kann der Zettel auch auf ein anderes Gebäude (ein anderes Dateisystem) oder auf einen ganzen Ordner zeigen, was Hardlinks nicht können.

Merke: `ln` macht einen Hardlink, `ln -s` einen Softlink („s“ wie symbolisch). Und: Beim Befehl steht erst das **Ziel**, dann der **Name des neuen Links** – „ln -s was wohin“.

Warum braucht man Links? Etwa, um aus `/opt/programm-2.1` einen Namen `/opt/programm` zu machen, der immer auf die aktuelle Version zeigt.

## Merksatz
- **ln = Hardlink (gleicher Inode), ln -s = Softlink (Pfad-Zettel).**
- **ln -s ZIEL LINKNAME.**
- **Hardlink: gleiches Dateisystem, keine Verzeichnisse.**
- **Softlink: tot, wenn das Ziel fehlt.**
- **Linkzähler in ls -l, Spalte 2.**

## Prüfungsfalle
- Reihenfolge `ln -s ZIEL LINK` – nicht umgekehrt!
- Hardlinks funktionieren **nicht** über Dateisysteme hinweg und **nicht** für Verzeichnisse.
- Löschen des Originals macht einen Hardlink **nicht** ungültig, einen Softlink schon.
- Relative Softlinks sind relativ zum **Linkort**.
- Hardlinks haben **dieselbe Inode-Nummer**.
- `rm link` löscht den Link, nicht das Ziel (auch bei Softlinks).
- Rechte eines Softlinks (`lrwxrwxrwx`) sind irrelevant; es gelten die des Ziels.

## Grafik

### Hardlink vs. Softlink
1. Name datei.txt -> Inode 4711: zeigt auf Inhalt
2. Name hart.txt -> Inode 4711: Hardlink, gleicher Inode
3. Name weich.txt -> datei.txt: Softlink, speichert nur den Pfad
4. Admin -> datei.txt: rm datei.txt
5. hart.txt -> Inode 4711: Daten bleiben erreichbar
6. weich.txt: toter Link, Ziel fehlt

## Lab
**Maschine**: debian01.
```bash
# auf debian01
cd /tmp && echo "Inhalt" > datei.txt
ln datei.txt hart.txt
ln -s datei.txt weich.txt
ls -li datei.txt hart.txt weich.txt
rm datei.txt
cat hart.txt; cat weich.txt
find /tmp -xtype l
readlink -f weich.txt
stat hart.txt | grep -i links
```

## Befehle
- `ln ziel link` – Hardlink
- `ln -s ziel link` – Softlink
- `ln -sf ziel link` – Softlink überschreiben
- `ls -li` – Inodes und Linkzähler
- `readlink -f link` – Ziel auflösen
- `find -xtype l` – tote Links finden
- `stat datei` – Metadaten

## Übungen
- A: Lege einen Softlink /opt/app auf /opt/app-2.1 an. | L: ln -s /opt/app-2.1 /opt/app
- A: Woran erkennst du einen Hardlink? | L: Gleiche Inode-Nummer (ls -i) und Linkzähler > 1.
- A: Kann man Hardlinks auf Verzeichnisse legen? | L: Nein.
- A: Was passiert mit einem Softlink, wenn das Ziel gelöscht wird? | L: Er wird zum toten Link.
- A: Wie findest du tote Softlinks? | L: find . -xtype l

## Karteikarten
- F: Was ist ein Inode? | A: Datenstruktur mit Metadaten und Zeigern auf die Datenblöcke einer Datei.
- F: Was zeigt der Linkzähler? | A: Wie viele Hardlink-Namen auf den Inode zeigen.
- F: Was ist ein Hardlink? | A: Ein weiterer Name für denselben Inode.
- F: Was ist ein symbolischer Link? | A: Eine Datei, die den Pfad zum Ziel enthält.
- F: Welche Option erzeugt Softlinks? | A: ln -s
- F: Welche Grenze haben Hardlinks? | A: Nur im selben Dateisystem, nicht für Verzeichnisse.
- F: Wie erkennt man Softlinks in ls -l? | A: Erstes Zeichen l und Pfeil -> zum Ziel.
- F: Wie löst man einen Softlink auf? | A: readlink -f oder realpath.
- F: Was ist ein toter Link? | A: Ein Softlink mit nicht mehr vorhandenem Ziel.

## Quiz
? Wie erzeugt man einen symbolischen Link?
* ln -s ziel link
- ln ziel link
- ln -h ziel link
- link -s link ziel

? Was kennzeichnet einen Hardlink?
* Gleiche Inode-Nummer
- Typ l in ls -l
- Pfeil in ls -l
- Eigene Rechte

? Was passiert bei rm original (Hardlink existiert)?
* Daten bleiben über den Hardlink erhalten
- Alles wird gelöscht
- Hardlink wird zum toten Link
- Fehlermeldung

? Wofür gilt die Beschränkung auf dasselbe Dateisystem?
* Hardlinks
- Softlinks
- Beide
- Keine

? Wie findet man tote Softlinks?
* find -xtype l
- find -type h
- ls -dead
- ln -d

? Was ist die zweite Spalte in ls -l?
* Linkzähler
- Besitzer
- Größe
- Gruppe

? Welcher Link kann auf Verzeichnisse zeigen?
* Symbolischer Link
- Hardlink
- Beide nicht
- Nur Hardlink

? Wie lautet die Reihenfolge der Argumente bei ln?
* ln [-s] ZIEL LINKNAME
- ln [-s] LINKNAME ZIEL
- ln [-s] ZIEL ZIEL
- ln LINKNAME

## Spickzettel
- ln hart · ln -s weich · ln -s ZIEL LINK
- Hardlink: gleicher Inode, gleiches FS, keine Verz.
- Softlink: Pfad, tot ohne Ziel
- ls -li · readlink -f · find -xtype l
