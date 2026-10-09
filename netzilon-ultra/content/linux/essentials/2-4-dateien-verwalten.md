---
id: linux-ess-dateien-erstellen-loeschen
bereich: Linux
fach: Linux I
pruefungen: [LPIC-1, Schule]
block: Linux Essentials
kapitel: Thema 2 – Sich auf einem Linux-System zurechtfinden
titel: 2.4 Erstellen, Verschieben und Löschen von Dateien
stufe: Einsteiger
quellen: [LPI-Learning-Material-010-160-de.pdf]
verweise: [linux-ess-verzeichnisse-listen]
---

## Profi

### Lernziel (Gewicht 3)
Dateien und Verzeichnisse anlegen, kopieren, verschieben, umbenennen, löschen.

### Anlegen
- `touch datei` (leere Datei bzw. Zeitstempel aktualisieren), `mkdir verz`, `mkdir -p a/b/c` (inkl. Elternverzeichnisse).

### Kopieren
- `cp quelle ziel`, `cp -r verz ziel` (rekursiv), `-i` (Rückfrage), `-v` (ausführlich), `-p` (Rechte/Zeit erhalten), `-a` (Archivmodus). Mehrere Quellen: `cp a b c ziel/`.

### Verschieben/Umbenennen
- `mv alt neu` benennt um, `mv datei verz/` verschiebt. Innerhalb eines Dateisystems nur Metadatenänderung (schnell).

### Löschen
- `rm datei`, `rm -r verz` (rekursiv), `-f` (ohne Rückfrage), `-i`, `rmdir verz` (nur leere). **Kein Papierkorb** auf der Befehlszeile; Löschen ist endgültig.

### Globbing und Brace-Expansion
`cp *.txt backup/`, `mv foto?.jpg bilder/`, `touch datei{1..5}.txt`, `mkdir -p proj/{src,doc}`.

### Weitere
`file datei` (Typ), `stat datei`, `ln`, `cat`, `less`, `head`, `tail`, `wc`.

## Einfach

Hier lernst du die **Grundbewegungen** im Dateischrank.

Eine neue **leere Datei** machst du mit `touch brief.txt`. Einen neuen **Ordner** mit `mkdir projekt`. Möchtest du gleich mehrere Ordner verschachtelt anlegen, nimmst du `mkdir -p a/b/c`.

**Kopieren** heißt: Es gibt die Datei danach zweimal. `cp brief.txt kopie.txt`. Ordner kopierst du mit `cp -r` (r wie „rekursiv“, also mit allem Inhalt).

**Verschieben** und **Umbenennen** sind für Linux dasselbe: `mv alt.txt neu.txt` benennt um, `mv brief.txt Ordner/` verschiebt in einen anderen Ordner.

**Löschen** machst du mit `rm datei`. Ordner mit Inhalt brauchen `rm -r ordner`. Aber Vorsicht: Auf der Kommandozeile gibt es **keinen Papierkorb**. Was weg ist, ist weg. Besonders gefährlich ist `rm -rf`, weil es ohne Nachfrage alles löscht. Wenn du unsicher bist, nimm `rm -i`, das fragt vorher nach.

Mit Platzhaltern sparst du dir Tipparbeit: `rm *.tmp` löscht alle Dateien, die auf .tmp enden.

## Merksatz
- **touch/mkdir erstellen, cp kopiert, mv verschiebt UND benennt um, rm löscht.**
- **-r für Ordner.**
- **Kein Papierkorb!**
- **mkdir -p baut ganze Pfade.**

## Prüfungsfalle
- `cp` ohne `-r` kopiert keine Verzeichnisse.
- `rmdir` löscht nur **leere** Verzeichnisse.
- `mv` überschreibt ohne Rückfrage, außer mit `-i`.
- `rm -rf /` ist verheerend; vor `rm` mit Globs immer erst `ls` testen.

## Grafik

### Kopieren und Verschieben
1. Benutzer -> Shell: cp brief.txt backup/
2. Shell: Kopie in backup/ angelegt, Original bleibt
3. Benutzer -> Shell: mv brief.txt archiv/
4. Shell: Datei jetzt nur noch in archiv/
5. Benutzer -> Shell: rm archiv/brief.txt (endgültig!)

## Befehle
- `touch datei` – Datei anlegen
- `mkdir -p a/b` – Verzeichnisse anlegen
- `cp -r quelle ziel` – kopieren
- `mv alt neu` – umbenennen/verschieben
- `rm -ri ordner` – löschen mit Rückfrage
- `rmdir ordner` – leeren Ordner löschen
- `file datei` – Dateityp

## Übungen
- A: Lege projekt/src und projekt/doc mit einem Befehl an. | L: `mkdir -p projekt/{src,doc}`
- A: Benenne a.txt in b.txt um. | L: `mv a.txt b.txt`
- A: Lösche alle .log-Dateien im aktuellen Ordner mit Rückfrage. | L: `rm -i *.log`

## Karteikarten
- F: Wie legt man eine leere Datei an? | A: touch datei
- F: Wie kopiert man ein Verzeichnis? | A: cp -r
- F: Wie benennt man um? | A: mv alt neu
- F: Wie löscht man einen Ordner samt Inhalt? | A: rm -r ordner
- F: Was macht rmdir? | A: Löscht leere Verzeichnisse.
- F: Was macht mkdir -p? | A: Legt auch fehlende Elternverzeichnisse an.
- F: Gibt es einen Papierkorb auf der Shell? | A: Nein, rm ist endgültig.
- F: Was ist ein Glob? | A: Platzhaltermuster wie *.txt.
- F: Was macht cp -i? | A: Fragt vor dem Überschreiben nach.
- F: Was bewirkt touch bei vorhandener Datei? | A: Aktualisiert den Zeitstempel.

## Quiz
? Wie benennt man eine Datei um?
* mv alt neu
- rn alt neu
- ren alt neu
- cp alt neu

? Welche Option kopiert ein Verzeichnis?
* -r
- -d
- -x
- -n

? Was macht rmdir?
* Löscht nur leere Verzeichnisse
- Löscht rekursiv
- Verschiebt
- Kopiert

? Wie legt man verschachtelte Ordner an?
* mkdir -p a/b/c
- mkdir a/b/c
- mkdir -r a/b/c
- touch -d a/b/c

? Wohin landet eine mit rm gelöschte Datei?
* Nirgends, sie wird entfernt
- In ~/.Trash
- In /tmp
- In /var/trash

? Was erzeugt touch datei{1..3}.txt?
* Drei Dateien datei1.txt bis datei3.txt
- Eine Datei
- Fehler
- Einen Ordner

? Was fragt vor dem Löschen nach?
* rm -i
- rm -f
- rm -r
- rm -a

? Was macht mv innerhalb des gleichen Dateisystems?
* Ändert nur den Eintrag, keine Daten kopieren
- Kopiert immer die Daten
- Komprimiert
- Verschlüsselt

## Spickzettel
- touch · mkdir -p · cp -r · mv · rm -r · rmdir
- Kein Papierkorb
- {a,b} {1..5} * ?
