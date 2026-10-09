---
id: linux-eckert-k04-dateisystemverwaltung
bereich: Linux
fach: Linux I
pruefungen: [LPIC-1, Schule]
block: CompTIA Linux+ / LPIC-1 (Eckert)
kapitel: Eckert – CompTIA Linux+ and LPIC-1 (6th Edition)
titel: Kap. 4 Linux-Dateisystemverwaltung (FHS, Rechte, ACL, find)
stufe: Fortgeschritten
quellen: [Eckert_J._W._and_triOS_College_-_CompTIA_Linux_and_LPIC-1_6th_Edition_-_2024.pdf]
verweise: [linux-101-104-5-rechte,linux-101-104-7-fhs,linux-101-104-6-links]
---

## Profi

### FHS
Der **Filesystem Hierarchy Standard** legt Verzeichnisse fest: `/bin`, `/sbin`, `/etc`, `/home`, `/root`, `/var`, `/tmp`, `/usr`, `/opt`, `/dev`, `/proc`, `/sys`, `/boot`, `/lib`, `/mnt`, `/media`, `/srv`, `/run`.

### Dateiverwaltung
`mkdir -p`, `cp -r -p -i -a`, `mv`, `rm -r -f -i`, `rmdir`, `touch`. Löschen ist endgültig.

### Dateien finden
- `locate` (Datenbank mit `updatedb`), `which` (im PATH), `whereis`, `type`.
- `find pfad -name "*.log" -type f -mtime +7 -size +10M -user anna -perm -4000 -exec cmd {} \;` — Kriterien Name, Typ, Größe, Zeit (`-mtime`, `-mmin`), Besitzer, Rechte; Aktionen `-print`, `-delete`, `-exec`. „Pruning“ schließt Verzeichnisse aus.

### Links
**Symbolischer Link** (`ln -s`) = Zeiger auf Pfad; **Hardlink** (`ln`) = zusätzlicher Name für denselben **Inode** (nur im selben Dateisystem). Der **Inode** speichert Metadaten (Besitzer, Rechte, Zeiten, Blockzeiger) ohne den Namen; **Inode-Tabelle** und **Datenblöcke**.

### Besitz und Rechte
Owner, Group, Other; `r w x` (4, 2, 1). `chmod` (symbolisch/oktal), `chown`, `chgrp`, **umask** (Standard 022). Sonderrechte **SUID**, **SGID**, **Sticky Bit**.

### ACL und Attribute
- **ACL** (Access Control List): feinere Rechte für zusätzliche Benutzer/Gruppen: `setfacl -m u:anna:rw datei`, `getfacl datei`, `setfacl -x`, `-b`, Standard-ACL `-d`. Ein `+` am Ende der Rechte in `ls -l` zeigt ACL.
- **Dateiattribute**: `chattr +i datei` (immutable: unveränderlich, auch für root), `+a` (append only), `lsattr`.

## Einfach

Damit alle Linux-Systeme ähnlich aufgebaut sind, gibt es den **FHS**, eine gemeinsame Ordnungsregel. `/etc` enthält immer Einstellungen, `/home` die Benutzerdaten, `/var` veränderliche Daten wie Logs.

Dateien verwalten ist Alltag: **erstellen** (`touch`, `mkdir`), **kopieren** (`cp`), **verschieben/umbenennen** (`mv`) und **löschen** (`rm`, ohne Papierkorb).

Um Dateien zu **finden**, hast du drei Werkzeuge: `locate` ist blitzschnell, nutzt aber eine Liste, die man mit `updatedb` auffrischt. `which` verrät, wo ein Programm liegt. `find` ist das Schweizer Taschenmesser: Es sucht live nach Name, Größe, Alter, Besitzer und kann auf jeden Treffer etwas anwenden (`-exec`).

**Links** sind Abkürzungen. Ein Symlink ist ein Wegweiser, ein Hardlink ein zweiter Name derselben Datei.

Jede Datei hat Rechte für Besitzer, Gruppe und Rest der Welt. Reicht dir das nicht, zum Beispiel weil Anna als Einzelperson Zugriff bekommen soll, nutzt du eine **ACL**: `setfacl -m u:anna:rw datei`. Und mit `chattr +i` machst du eine Datei so fest, dass nicht einmal root sie löschen kann, bis du das Attribut wieder entfernst.

## Merksatz
- **find sucht live, locate aus Datenbank.**
- **Inode = Metadaten, Name steht im Verzeichnis.**
- **setfacl -m / getfacl für Zusatzrechte.**
- **chattr +i = unveränderlich.**

## Prüfungsfalle
- Ein `+` hinter den Rechten bedeutet **ACL vorhanden**.
- `-mtime +7` heißt **älter als 7 Tage**.
- `find -exec cmd {} \;` — die Klammern `{}` ersetzt find durch den Dateinamen.
- Hardlinks teilen den Inode, Symlinks haben einen eigenen.
- `chattr +i` verhindert auch root am Löschen.

## Grafik

### find -exec
1. Admin -> find: find /var/log -name "*.log" -mtime +30 -exec gzip {} \;
2. find: durchsucht /var/log
3. find: Treffer: alte .log-Datei
4. find -> gzip: führt gzip mit dem Dateinamen aus
5. gzip: komprimiert Datei

## Befehle
- `find / -name "*.conf" -type f` – Dateien finden
- `locate datei` – schnell suchen
- `ln -s ziel link` – Symlink
- `setfacl -m u:anna:rw datei` – ACL setzen
- `getfacl datei` – ACL lesen
- `chattr +i datei` – unveränderlich
- `lsattr datei` – Attribute zeigen

## Übungen
- A: Finde Dateien über 100 MB in /var. | L: `find /var -type f -size +100M`
- A: Gib Anna Lese-/Schreibrecht auf bericht.txt per ACL. | L: `setfacl -m u:anna:rw bericht.txt`
- A: Mache datei.txt unveränderlich. | L: `chattr +i datei.txt`

## Karteikarten
- F: Wofür steht FHS? | A: Filesystem Hierarchy Standard.
- F: Was speichert ein Inode? | A: Metadaten (Besitzer, Rechte, Zeiten, Blockzeiger), nicht den Namen.
- F: Wie aktualisiert man locate? | A: updatedb
- F: Was bedeutet find -mtime +7? | A: Änderung älter als 7 Tage.
- F: Wie führt man Aktionen auf Treffern aus? | A: -exec befehl {} \;
- F: Was zeigt getfacl? | A: Die ACL einer Datei.
- F: Was bewirkt chattr +i? | A: Datei wird unveränderlich.
- F: Was bewirkt chattr +a? | A: Nur Anhängen erlaubt.
- F: Was ist umask? | A: Maske, die Standardrechte neuer Dateien einschränkt.
- F: Woran erkennt man ACLs in ls -l? | A: Am + hinter den Rechten.

## Quiz
? Welches Tool durchsucht eine vorgefertigte Datenbank?
* locate
- find
- which
- grep

? Was bewirkt chattr +i?
* Datei wird unveränderlich
- Datei wird versteckt
- Datei wird komprimiert
- Inode wird neu vergeben

? Wie setzt man eine ACL für Benutzer anna?
* setfacl -m u:anna:rw datei
- chacl anna datei
- chmod +a anna datei
- aclset anna

? Was gilt für Hardlinks?
* Sie teilen sich den Inode
- Sie haben eigene Inodes
- Sie zeigen auf Pfade
- Sie gehen über Dateisysteme

? Was bedeutet find -size +10M?
* Größer als 10 MiB
- Kleiner als 10 MiB
- Genau 10 MiB
- Älter als 10 Minuten

? Welcher Befehl zeigt Dateiattribute?
* lsattr
- getfacl
- stat -a
- ls -z

? Wie lautet die Standard-umask auf vielen Systemen?
* 022
- 777
- 000
- 644

? Was zeigt + in drwxr-xr-x+ ?
* ACL ist gesetzt
- Sticky Bit
- Verschlüsselung
- Hardlink

## Spickzettel
- FHS · /etc /var /usr /home
- find -name -type -size -mtime -exec
- ln / ln -s · Inode
- chmod chown umask SUID SGID Sticky
- setfacl/getfacl · chattr/lsattr
