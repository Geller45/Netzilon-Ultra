---
id: linux-101-104-5-rechte
bereich: Linux
fach: Linux I
pruefungen: [LPIC-1]
block: LPIC-101
kapitel: LPIC-1 Prüfung 101 – Geräte, Dateisysteme, FHS
titel: 104.5 Dateizugriffsrechte und -eigentümer verwalten
stufe: Fortgeschritten
quellen: [LPI-Learning-Material-101-500-de.pdf, 1.07_Linux_-_Datentraeger_Dateisysteme_und_Rechte.pdf]
verweise: [linux-l1-07-datentraeger, linux-l2-13-benutzer, linux-l2-18-sicherheit, linux-101-104-6-links]
---

## Profi

### Lernziel (Gewicht 3)
Zugriffsrechte setzen und lesen: `chmod`, `chown`, `chgrp`, `umask`, Spezialbits SUID/SGID/Sticky.

### Rechtemodell
- `ls -l`: `-rwxr-xr-- 1 anna dev 120 Okt 8 datei`. Erstes Zeichen: Typ (`-` Datei, `d` Verzeichnis, `l` Link, `b`/`c` Gerät, `s` Socket, `p` Pipe), dann **u**ser / **g**roup / **o**thers je `rwx`.
- **Bedeutung bei Dateien**: r lesen, w ändern, x ausführen. **Bei Verzeichnissen**: r Inhalt **auflisten**, w Einträge **anlegen/löschen/umbenennen**, x **hineinwechseln/Zugriff auf Inhalte**.
- Oktal: r=4, w=2, x=1 → `rwxr-xr--` = **754**.

### chmod, chown, umask
- `chmod 640 datei`, symbolisch `chmod u+x,g-w,o=r datei`, `a+x`, `-R` rekursiv, `chmod g+s dir`.
- `chown anna datei`, `chown anna:dev datei`, `chown :dev datei`, `chgrp dev datei`, `-R`. `chown` ändern nur root.
- **umask** subtrahiert Rechte von den Standardwerten (Dateien 666, Verzeichnisse 777): umask **022** → Dateien 644, Verzeichnisse 755; umask **077** → 600/700. Anzeigen `umask`, setzen `umask 027`.

### Spezialrechte
| Bit | Oktal | Wirkung |
|---|---|---|
| **SUID** | 4000 | Datei läuft mit den Rechten des **Besitzers** (`rws`), z. B. `/usr/bin/passwd` |
| **SGID** | 2000 | Datei läuft mit Rechten der **Gruppe** (`rws` in group); bei Verzeichnissen erben neue Dateien die **Gruppe** |
| **Sticky** | 1000 | im Verzeichnis darf nur **Besitzer** (oder root) löschen (`rwt`, z. B. `/tmp`) |
- Großes `S`/`T` = Bit gesetzt, aber **kein x**. Beispiel: `chmod 4755`, `chmod u+s`, `chmod +t /gemeinsam`. Weiteres: `chattr +i` (unveränderlich), `lsattr`, ACLs (`getfacl`, `setfacl`).

## Einfach

Jede Datei in Linux hat ein **Türschild** mit drei Zeilen: Was darf der **Besitzer** (user)? Was darf die **Gruppe** (group)? Was dürfen **alle anderen** (others)? Und für jede Zeile gibt es drei Schalter: **r** (lesen), **w** (schreiben), **x** (ausführen/betreten).

Beispiel `rwxr-xr--`: Der Besitzer darf alles, die Gruppe darf lesen und ausführen, alle anderen nur lesen.

Damit man weniger tippen muss, hat jeder Schalter eine **Zahl**: r = 4, w = 2, x = 1. Du addierst sie pro Zeile: rwx = 4+2+1 = 7, r-x = 5, r-- = 4. Also: **754**. Mit `chmod 754 datei` stellst du es ein. Mit `chown anna datei` änderst du den Besitzer.

Bei **Ordnern** sind die Schalter ein wenig anders: **r** heißt „in die Liste schauen“, **w** heißt „etwas hineinlegen oder wegnehmen“, **x** heißt „durch die Tür gehen“.

Dann gibt es drei **Spezialschalter**: **SUID** = „Starte dieses Programm mit den Rechten des Besitzers“ (nötig bei `passwd`), **SGID** = „neue Dateien im Ordner gehören der Gruppe des Ordners“, **Sticky-Bit** = „im gemeinsamen Ordner darf jeder nur seine eigenen Sachen wegwerfen“ (wie in `/tmp`).

Und die **umask** ist der Rechte-Abzug für neue Dateien: Bei umask 022 bekommt eine neue Datei 644.

## Merksatz
- **r=4, w=2, x=1.**
- **Verzeichnis: r=listen, w=ändern, x=betreten.**
- **umask 022 → Dateien 644, Ordner 755.**
- **SUID 4, SGID 2, Sticky 1.**
- **Nur root darf chown.**
- **Sticky = /tmp.**

## Prüfungsfalle
- Neue Dateien bekommen **nie** automatisch x (Basis 666); Verzeichnisse starten mit 777.
- **umask zieht ab**, es setzt nicht direkt (022 → 644/755).
- Zum **Löschen** einer Datei braucht man `w` auf dem **Verzeichnis**, nicht auf der Datei.
- Verzeichnis ohne `x`: kein Zugriff auf Inhalte, selbst bei `r`.
- Großes **S/T** = Spezialbit ohne ausführbares Recht.
- SUID auf **Skripten** wirkt unter Linux nicht.
- `chmod 1777` = rwxrwxrwt (Sticky).
- `chmod -R 777` ist fast nie richtig.

## Grafik

### Rechte als Oktalzahl
1. Datei: rwxr-xr-- soll als Zahl angegeben werden
2. Besitzer: rwx = 4+2+1 = 7
3. Gruppe: r-x = 4+0+1 = 5
4. Andere: r-- = 4+0+0 = 4
5. Admin -> chmod: chmod 754 datei
6. chmod -> Datei: ls -l zeigt -rwxr-xr--

## Lab
**Maschine**: debian01, Benutzer anna und ben, Gruppe dev.
```bash
# auf debian01
touch rechte.txt; ls -l rechte.txt
chmod 640 rechte.txt; chmod u+x,o-r rechte.txt
sudo chown anna:dev rechte.txt
umask; umask 077; touch privat.txt; ls -l privat.txt; umask 022
sudo mkdir /srv/projekt && sudo chgrp dev /srv/projekt
sudo chmod 2775 /srv/projekt           # SGID
sudo chmod 1777 /srv/tausch 2>/dev/null || (sudo mkdir /srv/tausch && sudo chmod 1777 /srv/tausch)
ls -ld /tmp /usr/bin/passwd
find / -perm -4000 -type f 2>/dev/null | head
```

## Befehle
- `chmod 754 datei` – Rechte oktal
- `chmod u+x,g-w datei` – symbolisch
- `chown user:group datei` – Besitzer
- `chgrp gruppe datei` – Gruppe
- `umask 027` – Standardmaske
- `chmod 2775 dir` – SGID setzen
- `chmod +t dir` – Sticky
- `getfacl` / `setfacl` – ACLs
- `lsattr` / `chattr +i` – Attribute

## Übungen
- A: Was bedeutet rwxr-x---? | L: 750
- A: Welche Rechte erhält eine neue Datei bei umask 027? | L: 640 (Verzeichnisse 750).
- A: Wie setzt du das Sticky-Bit auf /gemeinsam? | L: chmod +t /gemeinsam oder chmod 1777
- A: Wie ändert man Besitzer und Gruppe gleichzeitig? | L: chown user:gruppe datei
- A: Welche Rechte hat /usr/bin/passwd typischerweise? | L: -rwsr-xr-x (SUID, 4755)

## Karteikarten
- F: Was bedeutet 755? | A: rwxr-xr-x
- F: Was bedeutet x bei Verzeichnissen? | A: Betreten und Zugriff auf enthaltene Dateien.
- F: Was bewirkt SUID? | A: Programm läuft mit den Rechten des Dateibesitzers.
- F: Was bewirkt SGID auf Verzeichnissen? | A: Neue Dateien erben die Gruppe des Verzeichnisses.
- F: Was bewirkt das Sticky-Bit? | A: Nur Besitzer/root dürfen Dateien im Verzeichnis löschen.
- F: Welche Standardrechte ergibt umask 022? | A: Dateien 644, Verzeichnisse 755.
- F: Wer darf chown ausführen? | A: Nur root.
- F: Welchen Wert hat SUID oktal? | A: 4000.
- F: Was bedeutet ein großes S in rwS? | A: SUID gesetzt, aber kein x-Recht.
- F: Wie macht man eine Datei unveränderlich? | A: chattr +i

## Quiz
? Was bedeutet 640?
* rw-r-----
- rwxr-----
- rw-rw----
- r--r-----

? Welche Datei-Rechte ergeben sich bei umask 022?
* 644
- 755
- 600
- 666

? Wofür steht SUID?
* Ausführung mit Rechten des Besitzers
- Ausführung mit Rechten der Gruppe
- Schreibschutz
- Löschschutz

? Was bewirkt das Sticky-Bit auf einem Verzeichnis?
* Nur Besitzer dürfen eigene Dateien löschen
- Alle dürfen alles löschen
- Das Verzeichnis ist versteckt
- Das Verzeichnis ist schreibgeschützt

? Wie setzt man Besitzer und Gruppe gleichzeitig?
* chown user:group datei
- chmod user:group datei
- chgrp user datei group
- setowner

? Welche Zahl hat SGID?
* 2000
- 4000
- 1000
- 8000

? Was erlaubt w auf einem Verzeichnis?
* Dateien darin anlegen, löschen und umbenennen
- Das Verzeichnis ausführen
- Nur lesen
- Nur Besitzer ändern

? Wer darf den Besitzer einer Datei ändern?
* Nur root
- Der Besitzer
- Jedes Gruppenmitglied
- Jeder mit sudo-Gruppe immer

## Lücken
- Die Rechte rwxr-xr-- entsprechen {754}.
- Das Spezialbit mit dem Wert 4000 heißt {SUID}.
- Eine neue Datei erhält bei umask 027 die Rechte {640}.

## Spickzettel
- r4 w2 x1 · u g o · chmod 754 / u+x
- Verzeichnis: r listen · w ändern · x betreten
- umask 022 → 644/755 · 027 → 640/750 · 077 → 600/700
- SUID 4 · SGID 2 · Sticky 1 · S/T groß = ohne x
- chown nur root · chgrp · chattr +i
