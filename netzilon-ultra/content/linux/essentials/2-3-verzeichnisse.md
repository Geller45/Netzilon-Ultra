---
id: linux-ess-verzeichnisse-listen
bereich: Linux
fach: Linux I
pruefungen: [LPIC-1, Schule]
block: Linux Essentials
kapitel: Thema 2 – Sich auf einem Linux-System zurechtfinden
titel: 2.3 Verzeichnisse verwenden und Dateien auflisten
stufe: Einsteiger
quellen: [LPI-Learning-Material-010-160-de.pdf]
verweise: [linux-ess-hilfe-suchen,linux-101-103-3-dateiverwaltung]
---

## Profi

### Lernziel (Gewicht 2)
Dateisystembaum, Pfade, Navigation, Auflisten, rekursive Operationen.

### Verzeichnisbaum
Einziger Baum ab **`/`** (root-Verzeichnis). Wichtige Verzeichnisse: `/home` (Benutzer), `/root` (Home von root), `/etc` (Konfiguration), `/var` (variable Daten, Logs), `/tmp`, `/usr` (Programme), `/bin`, `/sbin`, `/lib`, `/dev` (Geräte), `/proc`, `/sys`, `/boot`, `/mnt`, `/media`, `/opt`. Dateinamen sind **case-sensitiv**; kein Laufwerksbuchstabe, Trennzeichen `/`.

### Pfade
- **Absolut** (`/etc/passwd`) beginnt bei `/`; **relativ** (`../docs`) vom aktuellen Verzeichnis. `.` aktuelles, `..` übergeordnetes, `~` Home, `-` vorheriges (bei `cd -`).
- `pwd` zeigt den aktuellen Pfad, `cd pfad` wechselt.

### Auflisten
- `ls`, `ls -l` (Rechte, Besitzer, Größe, Datum), `-a` (versteckte), `-h` (lesbare Größen), `-t` (nach Zeit), `-S` (nach Größe), `-r` (umgekehrt), `-R` (rekursiv), `-d`, `-i` (Inode). Dateityp im ersten Zeichen von `ls -l`: `-` Datei, `d` Verzeichnis, `l` Link, `c`/`b` Gerät.
- Dateien ohne Sonderzeichen benennen: Leerzeichen vermeiden oder maskieren.
- `tree`, `du -sh`, `df -h`.

### Rekursiv
`ls -R`, `cp -r`, `rm -r`, `chmod -R`: wirkt auch auf alle Unterverzeichnisse.

## Einfach

Stell dir den Computer wie einen **Schrank mit vielen Schubladen** vor. Es gibt eine Hauptschublade ganz oben, das **Root-Verzeichnis** `/`. Darin liegen weitere Schubladen: `/home` für die Dateien der Benutzer, `/etc` für Einstellungen, `/var` für Logs und Daten, die sich ändern, `/tmp` für Zwischenablage-Kram.

Um eine Datei zu beschreiben, gibst du ihren **Weg** an, den **Pfad**. Der **absolute** Pfad beginnt immer mit `/` und gilt von überall, z. B. `/etc/hosts`. Der **relative** Pfad beginnt dort, wo du gerade stehst. `..` heißt „eine Schublade höher“, `.` heißt „hier“ und `~` heißt „mein Zuhause“.

Mit `pwd` fragst du: „Wo bin ich?“ Mit `cd` gehst du woanders hin. Mit `ls` schaust du, was in der Schublade liegt. Mit `ls -l` siehst du Details, mit `ls -a` auch die **versteckten** Dateien (deren Name mit einem Punkt beginnt).

Vorsicht: Linux unterscheidet **Groß- und Kleinschreibung**. `Brief.txt` und `brief.txt` sind zwei verschiedene Dateien. Und es gibt keine Laufwerksbuchstaben wie `C:`; alles hängt unter dem einen Baum ab `/`.

## Merksatz
- **/ = Wurzel, ~ = Home, . = hier, .. = eins höher.**
- **Absolut beginnt mit /.**
- **ls -la zeigt alles.**
- **Groß ≠ klein.**

## Prüfungsfalle
- `cd` ohne Argument wechselt ins Home, `cd -` zum vorherigen Verzeichnis.
- `/root` ist Home von root, nicht das Wurzelverzeichnis `/`.
- Versteckte Dateien beginnen mit Punkt, `ls` ohne `-a` zeigt sie nicht.
- Erstes Zeichen von `ls -l`: `d` = Verzeichnis, `-` = Datei, `l` = Link.

## Grafik

### Navigation im Baum
1. Benutzer -> Shell: pwd
2. Shell -> Benutzer: /home/philipp
3. Benutzer -> Shell: cd ../anna
4. Shell: Verzeichnis wechselt zu /home/anna
5. Benutzer -> Shell: ls -la

## Befehle
- `pwd` – aktuelles Verzeichnis
- `cd /pfad` – wechseln
- `ls -la` – alles, langes Format
- `ls -lh` – lesbare Größen
- `tree` – Baumansicht
- `du -sh ordner` – Größe
- `df -h` – freier Platz

## Übungen
- A: Wie wechselst du in dein Home? | L: `cd` oder `cd ~`
- A: Wie listest du auch versteckte Dateien? | L: `ls -a`
- A: Wie springst du ins vorherige Verzeichnis? | L: `cd -`

## Karteikarten
- F: Was ist das Wurzelverzeichnis? | A: /
- F: Wo liegen Konfigurationsdateien? | A: /etc
- F: Wo liegen Benutzerverzeichnisse? | A: /home
- F: Was bedeutet ..? | A: Das übergeordnete Verzeichnis.
- F: Was bedeutet ~? | A: Das Home-Verzeichnis des Benutzers.
- F: Was zeigt ls -a? | A: Auch versteckte Dateien.
- F: Was ist ein absoluter Pfad? | A: Pfad ab / .
- F: Welcher Befehl zeigt den Arbeitsordner? | A: pwd
- F: Was zeigt df -h? | A: Belegung der Dateisysteme in lesbaren Einheiten.
- F: Welche Zeichen steht für ein Verzeichnis bei ls -l? | A: d

## Quiz
? Welcher Pfad ist absolut?
* /etc/hosts
- etc/hosts
- ../hosts
- ~hosts

? Was macht cd ohne Argument?
* Wechselt ins Home-Verzeichnis
- Wechselt nach /
- Bleibt stehen
- Fehler

? Was ist /root?
* Home-Verzeichnis des Administrators
- Wurzelverzeichnis
- Rootpartition
- Wechseldatenträger

? Was zeigt ls -la?
* Alle Dateien im langen Format
- Nur Links
- Nur Verzeichnisse
- Nur Größe

? Wo liegen Logdateien typischerweise?
* /var/log
- /etc/log
- /usr/log
- /home/log

? Welches erste Zeichen kennzeichnet ein Verzeichnis in ls -l?
* d
- -
- l
- c

? Sind Datei.txt und datei.txt gleich?
* Nein, Linux unterscheidet Groß- und Kleinschreibung
- Ja
- Nur in /home
- Nur als root

? Wie kommt man ins übergeordnete Verzeichnis?
* cd ..
- cd .
- cd ~
- cd /..

## Spickzettel
- / ~ . .. -
- /etc /home /var /tmp /usr /dev
- ls -lah · pwd · cd · tree
- Groß-/Kleinschreibung beachten
