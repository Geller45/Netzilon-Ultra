---
id: linux-ess-hilfe-suchen
bereich: Linux
fach: Linux I
pruefungen: [LPIC-1, Schule]
block: Linux Essentials
kapitel: Thema 2 – Sich auf einem Linux-System zurechtfinden
titel: 2.2 Hilfe suchen über die Befehlszeile
stufe: Einsteiger
quellen: [LPI-Learning-Material-010-160-de.pdf]
verweise: [linux-ess-befehlszeile]
---

## Profi

### Lernziel (Gewicht 2)
Hilfequellen auf dem System und im Netz nutzen.

### Hilfe auf dem System
- `befehl --help` (Kurzhilfe), `man befehl` (Handbuchseite), `info befehl`, `whatis befehl` (Einzeiler), `apropos stichwort` / `man -k stichwort` (Suche nach Stichwort), Dokumentation in `/usr/share/doc`.
- **man-Seiten** sind in **Sektionen** gegliedert: 1 Benutzerbefehle, 2 Systemaufrufe, 3 Bibliotheksfunktionen, 4 Gerätedateien, 5 Dateiformate/Konfiguration, 6 Spiele, 7 Verschiedenes, 8 Administrationsbefehle. Aufruf `man 5 passwd` (Datei) vs. `man 1 passwd` (Befehl). Index aktualisieren: `mandb`.
- Navigation in man (`less`): Leertaste/`b` blättern, `/muster` suchen, `n` nächster Treffer, `q` beenden. Aufbau: NAME, SYNOPSIS, DESCRIPTION, OPTIONS, SEE ALSO, FILES. In SYNOPSIS: `[ ]` optional, `…` wiederholbar, `|` entweder/oder.

### Dateien finden
- `locate name` (Datenbank, aktualisieren mit `updatedb`), `find /pfad -name "*.conf"`, `which`, `whereis` (Binary, Manpage, Quellen), `type`.

### Hilfe im Netz
Distributions-Dokumentation und Wikis, Foren, Mailinglisten, Stack Exchange, Projekt-Websites, Bugtracker. Dokumentation immer zur **eigenen Version** lesen.

## Einfach

Niemand kennt alle Befehle auswendig. Profis wissen aber, **wo man nachschlägt**. Linux hat eine eingebaute Bedienungsanleitung: das Handbuch, aufgerufen mit `man`. `man ls` zeigt dir alles über `ls`. Mit den Pfeiltasten und der Leertaste blätterst du, mit `/wort` suchst du, mit `q` verlässt du das Handbuch.

Ist dir das Handbuch zu lang? Dann gibt `ls --help` eine **Kurzfassung**. Und wenn du nicht einmal den Namen des Befehls kennst, fragst du `apropos` nach einem **Stichwort**: `apropos password` zeigt dir Befehle rund um Passwörter.

Das Handbuch ist in **Kapitel** (Sektionen) aufgeteilt. Kapitel 1 enthält Befehle, Kapitel 5 Dateiformate. Manchmal gibt es denselben Namen mehrfach, etwa `passwd` als Befehl und als Datei. Dann sagst du `man 5 passwd`.

Zum **Dateien finden** gibt es `find` (durchsucht live) und `locate` (fragt eine fertige Liste ab, ist schnell, muss aber mit `updatedb` aktuell gehalten werden).

Und wenn alles nichts nützt: Foren, Wikis und Projektseiten im Internet helfen weiter.

## Merksatz
- **--help kurz, man lang, apropos sucht Begriffe.**
- **Sektion 1 = Befehle, 5 = Dateien, 8 = Admin.**
- **locate schnell (updatedb), find gründlich.**

## Prüfungsfalle
- `man passwd` zeigt Sektion 1; die Datei steht in Sektion 5 (`man 5 passwd`).
- `locate` findet neue Dateien erst nach `updatedb`.
- `whatis` ≠ `apropos`: whatis sucht nach dem exakten Befehlsnamen.

## Grafik

### Hilfe finden
1. Benutzer -> Shell: Befehl unbekannt? apropos stichwort
2. Shell -> Benutzer: Liste passender Befehle
3. Benutzer -> Shell: man befehl
4. Shell -> Benutzer: Handbuchseite
5. Benutzer: Option gefunden, Befehl ausführen

## Befehle
- `man befehl` – Handbuch
- `man 5 passwd` – Sektion 5
- `apropos stichwort` – Suche in Beschreibungen
- `whatis befehl` – Einzeiler
- `locate datei` – schnelle Dateisuche
- `updatedb` – Datenbank aktualisieren
- `whereis befehl` – Programm, man-Seite

## Übungen
- A: Wie findest du Befehle zum Thema „partition“? | L: `apropos partition`
- A: Wie rufst du die Hilfe zur Datei /etc/passwd auf? | L: `man 5 passwd`
- A: Wie aktualisierst du die locate-Datenbank? | L: `sudo updatedb`

## Karteikarten
- F: Wie zeigt man die Handbuchseite? | A: man befehl
- F: Wie sucht man nach Stichwort in den Manpages? | A: apropos oder man -k
- F: Welche Sektion enthält Konfigurationsdateien? | A: 5
- F: Welche Sektion enthält Admin-Befehle? | A: 8
- F: Wie beendet man man? | A: q
- F: Was macht whatis? | A: Zeigt die einzeilige Beschreibung.
- F: Wo liegt zusätzliche Dokumentation? | A: /usr/share/doc
- F: Was aktualisiert locate? | A: updatedb
- F: Was zeigt whereis? | A: Binary, Manpage und Quellen eines Programms.
- F: Was bedeuten eckige Klammern in der SYNOPSIS? | A: Optional.

## Quiz
? Welcher Befehl durchsucht die Beschreibungen nach Stichwort?
* apropos
- whatis
- which
- type

? Welche Sektion zeigt Dateiformate?
* 5
- 1
- 8
- 3

? Wie öffnet man die Manpage der Datei passwd?
* man 5 passwd
- man passwd.conf
- man -f passwd
- man 1 passwd

? Womit aktualisiert man die locate-Datenbank?
* updatedb
- locatedb
- mandb
- indexfs

? Wie verlässt man man?
* q
- Strg+C only
- Esc
- :wq

? Was zeigt ls --help?
* Kurzhilfe zu ls
- Das komplette Handbuch
- Versionsgeschichte
- Dateiliste

? Was findet whereis?
* Programm, Manpage und Quellen
- Nur Variablen
- Nur Aliase
- Nur Prozesse

? Was bedeutet … in SYNOPSIS?
* Wiederholbar
- Optional
- Veraltet
- Pflicht

## Spickzettel
- --help · man · info · apropos · whatis
- Sektionen 1/5/8
- locate (updatedb) · find · whereis · which
