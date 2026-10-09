---
id: linux-ess-berechtigungen-eigentum
bereich: Linux
fach: Linux I
pruefungen: [LPIC-1, Schule]
block: Linux Essentials
kapitel: Thema 5 – Sicherheit und Dateiberechtigungen
titel: 5.3 Dateiberechtigungen und Dateieigentum verwalten
stufe: Einsteiger
quellen: [LPI-Learning-Material-010-160-de.pdf]
verweise: [linux-101-104-5-rechte,linux-l1-07-datentraeger]
---

## Profi

### Lernziel (Gewicht 3)
Rechte lesen, ändern und Besitzer setzen; Sonderrechte.

### Rechte lesen
`ls -l`: `-rwxr-x--x 1 anna team 1234 Jan 1 10:00 datei`. Erste Stelle Typ (`-`, `d`, `l`, `c`, `b`), dann dreimal drei Zeichen: **Besitzer (u)**, **Gruppe (g)**, **Andere (o)**; `r`=4, `w`=2, `x`=1. Beispiel `rwxr-x---` = 750.
- Bei **Dateien**: r lesen, w ändern, x ausführen. Bei **Verzeichnissen**: r Inhalt auflisten, w Dateien anlegen/löschen/umbenennen, x hineinwechseln/auf Einträge zugreifen.

### Ändern
- `chmod 640 datei` (oktal), `chmod u+x,g-w,o=r datei` (symbolisch), `chmod -R`. `chown anna datei`, `chown anna:team datei`, `chgrp team datei`, `chown -R`. `umask` bestimmt Standardrechte (Dateien 666 − umask, Verzeichnisse 777 − umask; Standard 022 → 644/755).

### Sonderrechte
- **SUID** (4000, `s` beim Besitzer): Ausführung mit Rechten des Besitzers (`/usr/bin/passwd`). **SGID** (2000): Rechte der Gruppe; bei Verzeichnissen erben neue Dateien die Gruppe. **Sticky Bit** (1000, `t`): im Verzeichnis nur Besitzer darf eigene Dateien löschen (`/tmp`, `drwxrwxrwt`). `chmod 4755`, `chmod g+s`, `chmod +t`.

### Hinweise
Nur Besitzer und root dürfen `chmod`; nur root darf `chown`. Löschen einer Datei hängt am **Verzeichnisrecht**, nicht am Dateirecht.

## Einfach

Jede Datei hat einen **Besitzer**, eine **Gruppe** und Regeln, wer was darf. Das sind die **Rechte**. Es gibt drei Fragen: Darf man **lesen** (r), **schreiben** (w), **ausführen** (x)? Und das für drei Personenkreise: den **Besitzer**, die **Gruppe** und **alle anderen**.

Das siehst du mit `ls -l`: `-rwxr-xr--`. Das erste Zeichen sagt, was es ist (`-` Datei, `d` Ordner). Dann kommen drei Dreiergruppen. Hier hat der Besitzer `rwx` (alles), die Gruppe `r-x` (lesen, ausführen) und die anderen `r--` (nur lesen).

Computer lieben Zahlen: lesen = 4, schreiben = 2, ausführen = 1. Zusammengezählt ergibt `rwx` die 7, `r-x` die 5, `r--` die 4. Das Recht heißt also **754**. Zum Ändern nutzt du `chmod 754 datei` oder `chmod u+x datei` („gib dem Besitzer Ausführrecht“).

Den Besitzer wechselst du mit `chown anna datei`, die Gruppe mit `chgrp team datei`.

Es gibt drei Spezialrechte: **SUID** (Programm läuft mit den Rechten seines Besitzers), **SGID** (mit der Gruppe) und das **Sticky Bit** (in einem gemeinsamen Ordner wie `/tmp` darf nur der Besitzer seine Dateien löschen).

## Merksatz
- **r=4, w=2, x=1.**
- **u g o a — + - =.**
- **chmod ändert Rechte, chown den Besitzer.**
- **SUID 4, SGID 2, Sticky 1.**

## Prüfungsfalle
- Bei Verzeichnissen heißt `x` „betreten“, nicht „ausführen“.
- Zum **Löschen** einer Datei braucht man `w` am **Verzeichnis**, nicht an der Datei.
- umask 022 → Dateien 644, Verzeichnisse 755.
- Nur root darf den Besitzer ändern.

## Grafik

### Rechte berechnen
1. Besitzer: rwx = 4+2+1 = 7
2. Gruppe: r-x = 4+0+1 = 5
3. Andere: r-- = 4+0+0 = 4
4. Ergebnis: chmod 754 datei

## Befehle
- `ls -l` – Rechte anzeigen
- `chmod 640 datei` – Rechte setzen
- `chmod u+x datei` – Ausführrecht
- `chown anna:team datei` – Besitzer und Gruppe
- `chgrp team datei` – Gruppe
- `umask` – Standardmaske
- `chmod +t ordner` – Sticky Bit

## Übungen
- A: Was bedeutet rwxr-x---? | L: 750
- A: Gib dem Besitzer lesen+schreiben, der Gruppe lesen, anderen nichts. | L: `chmod 640 datei`
- A: Setze Besitzer anna und Gruppe dev. | L: `chown anna:dev datei`

## Karteikarten
- F: Wert von r? | A: 4
- F: Wert von w? | A: 2
- F: Wert von x? | A: 1
- F: Was bedeutet 755? | A: rwxr-xr-x
- F: Was macht chown? | A: Ändert den Besitzer (und Gruppe).
- F: Was bewirkt das Sticky Bit? | A: Nur Besitzer darf Dateien im Verzeichnis löschen.
- F: Was bewirkt SUID? | A: Ausführung mit Rechten des Dateibesitzers.
- F: Was ergibt umask 022? | A: Dateien 644, Verzeichnisse 755.
- F: Was bedeutet x bei Verzeichnissen? | A: Betreten/Zugriff auf Einträge.
- F: Wer darf chown ausführen? | A: Nur root.

## Quiz
? Welche Zahl entspricht rwxr-xr--?
* 754
- 745
- 644
- 775

? Was bedeutet x bei einem Verzeichnis?
* In das Verzeichnis wechseln
- Ausführen
- Löschen
- Auflisten nur

? Welche Rechte hat eine Datei mit chmod 600?
* rw-------
- rwx------
- rw-r--r--
- r--------

? Welcher Befehl ändert den Besitzer?
* chown
- chmod
- chgrp only
- passwd

? Was zeigt ein t bei drwxrwxrwt?
* Sticky Bit
- SUID
- SGID
- Timer

? Welche Standardrechte haben neue Dateien bei umask 022?
* 644
- 755
- 666
- 600

? Welches Recht braucht man zum Löschen einer Datei?
* w am Verzeichnis
- w an der Datei
- x an der Datei
- r am Verzeichnis

? Was bewirkt chmod u+x datei?
* Besitzer darf ausführen
- Alle dürfen ausführen
- x wird entfernt
- Gruppe darf schreiben

## Lücken
- r hat den Wert {4}, w den Wert {2}, x den Wert {1}.
- Mit {chmod} ändert man Rechte, mit {chown} den Besitzer.
- Das {Sticky Bit} schützt Dateien in /tmp.

## Spickzettel
- r4 w2 x1 · ugo
- chmod 755 / u+x · chown u:g
- SUID 4 SGID 2 Sticky 1
- umask 022 → 644/755
