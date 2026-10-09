---
id: linux-102-110-1-sicherheit-admin
bereich: Linux
fach: Linux II
pruefungen: [LPIC-1]
block: LPIC-102
kapitel: LPIC-1 Prüfung 102 – Sicherheit
titel: 110.1 Administrationsaufgaben für Sicherheit durchführen
stufe: Fortgeschritten
quellen: [LPI-Learning-Material-102-500-de.pdf]
verweise: [linux-l2-18-sicherheit, linux-l1-04-root-sudo, linux-102-107-1-benutzer]
---

## Profi

### Lernziel (Gewicht 3)
Systemsicherheit überprüfen: SUID/SGID, Passwortalterung, offene Ports, Anmeldungen, `sudo`, Limits.

### SUID/SGID prüfen
- `find / -perm -4000 -type f 2>/dev/null` (SUID), `-2000` (SGID), `-perm /6000` (eines von beiden). Typisch: `passwd`, `sudo`, `ping`. Unerwartete SUID-Programme sind ein Warnsignal.

### Offene Ports und Dienste
- `ss -tulpn`, `lsof -i`, `nmap -sT localhost` bzw. von außen. Nicht benötigte Dienste stoppen/deaktivieren (`systemctl disable --now`). `fuser -v -n tcp 22`.

### Anmeldungen
- `w`, `who`, `last`, `lastb`, `lastlog`. Gesperrte Konten: `passwd -l user`, `usermod -L`, `chage -E 0`. Shell `/sbin/nologin` bzw. `/usr/sbin/nologin`. Datei `/etc/nologin` blockiert Logins außer root.

### Passwortalterung
- `chage -l user`, `chage -M 90 -W 7 -I 14 user`, Standardwerte in `/etc/login.defs`, Hashes in `/etc/shadow` (Felder: Name, Hash, letzte Änderung, min, max, Warnung, inaktiv, Ablauf).

### sudo
- `/etc/sudoers` nur mit `visudo` bearbeiten; Dateien in `/etc/sudoers.d/`. Regel: `user HOST=(RUNAS) [NOPASSWD:] BEFEHLE`, Gruppen mit `%wheel`/`%sudo`. `sudo -l` listet Rechte, Protokoll in `/var/log/auth.log` bzw. `/var/log/secure`.

### Limits, Zeitsteuerung
- `ulimit -a`, `/etc/security/limits.conf`. Zugriff auf `cron`/`at` über `/etc/cron.allow`/`cron.deny`, `at.allow`/`at.deny`.

## Einfach

Sicherheit auf einem Server heißt: **Alle Türen kennen und nur die offen lassen, die gebraucht werden.**

Zuerst prüfst du, welche **Türen offen** sind: `ss -tulpn` zeigt jeden Dienst, der auf Anfragen wartet. Brauchst du den Dienst nicht? Dann ausschalten. Danach schaust du nach **Spezialschlüsseln**: Programme mit dem SUID-Bit laufen mit den Rechten ihres Besitzers (meist root). Das ist nützlich bei `passwd`, aber gefährlich bei einem Programm, das dort nichts verloren hat. Mit `find / -perm -4000` findest du alle.

Dann geht es um **Menschen**: Wer war eingeloggt (`last`)? Wer hat sich vergeblich versucht (`lastb`)? Alte Konten sperrst du mit `passwd -l`. Passwörter sollten regelmäßig ablaufen, das steuert `chage`.

Und schließlich **sudo**: Normale Benutzer bekommen nur genau die Admin-Rechte, die sie brauchen. Die Regeln stehen in `/etc/sudoers`. Du bearbeitest sie niemals mit einem normalen Editor, sondern mit **`visudo`**, weil es die Syntax prüft. Ein Tippfehler würde sonst sudo für alle kaputt machen.

## Merksatz
- **SUID finden: `find / -perm -4000`.**
- **sudoers nur mit `visudo`.**
- **`passwd -l` sperrt, `chage` steuert Ablauf.**
- **Offene Ports: `ss -tulpn`.**

## Prüfungsfalle
- `-perm -4000` = SUID gesetzt (alle Bits), `-perm /6000` = SUID oder SGID.
- `passwd -l` sperrt das Passwort, SSH-Key-Login kann trotzdem gehen.
- `lastb` braucht root-Rechte.
- `/etc/shadow`: Ablaufdatum in **Tagen seit 1.1.1970**.

## Grafik

### Sicherheitscheck
1. Admin -> System: ss -tulpn (offene Ports)
2. Admin -> System: find / -perm -4000 (SUID)
3. Admin -> System: last / lastb (Logins)
4. Admin -> System: chage -l (Passwortalter)
5. Admin: Unnötiges abschalten und dokumentieren

## Lab
**Maschine**: debian01.
```bash
sudo ss -tulpn
sudo find / -perm -4000 -type f 2>/dev/null
sudo lastb | head
sudo chage -l philipp
sudo passwd -l testuser
sudo visudo
```

## Befehle
- `find / -perm -4000` – SUID-Dateien
- `ss -tulpn` – offene Ports
- `chage -l user` – Passwortalterung
- `passwd -l user` – Konto sperren
- `visudo` – sudoers editieren
- `sudo -l` – eigene Rechte
- `lastb` – fehlgeschlagene Logins

## Übungen
- A: Wie findest du alle SUID-Dateien? | L: `find / -perm -4000 -type f 2>/dev/null`
- A: Wie setzt du maximale Passwortgültigkeit von 60 Tagen? | L: `chage -M 60 user`
- A: Wie sperrst du den Benutzer anna? | L: `passwd -l anna` oder `usermod -L anna`

## Karteikarten
- F: Was bewirkt das SUID-Bit? | A: Programm läuft mit den Rechten des Dateibesitzers.
- F: Wie zeigt man Passwortalterung? | A: chage -l user
- F: Womit bearbeitet man sudoers? | A: visudo
- F: Wo liegen Passwort-Hashes? | A: /etc/shadow
- F: Wie sperrt man ein Konto? | A: passwd -l oder usermod -L
- F: Was hindert Logins außer root? | A: Datei /etc/nologin
- F: Wie listet man seine sudo-Rechte? | A: sudo -l
- F: Wo stehen Grenzwerte für Benutzer? | A: /etc/security/limits.conf
- F: Wie schränkt man cron auf bestimmte Nutzer ein? | A: /etc/cron.allow
- F: Wie zeigt man eingeloggte Benutzer? | A: w oder who

## Quiz
? Wie findet man SUID-Dateien?
* find / -perm -4000
- find / -perm -1000
- find / -suid 0
- ls -s /

? Womit wird /etc/sudoers bearbeitet?
* visudo
- vi /etc/sudoers
- sudoedit -f
- nano sudoers

? Welcher Befehl zeigt fehlgeschlagene Anmeldungen?
* lastb
- last
- lastlog
- who

? Welcher Befehl setzt Passwortablauf?
* chage
- passwd -x only
- usermod -p
- login

? Was blockiert alle Logins außer root?
* /etc/nologin
- /etc/shadow
- /etc/securetty
- /etc/login.defs

? Welches Bit hat der Wert 2000 bei find -perm?
* SGID
- SUID
- Sticky
- Execute

? Wie sieht man eigene sudo-Rechte?
* sudo -l
- sudo --list-all
- sudo whoami
- sudo -u

? Welcher Befehl zeigt offene Ports?
* ss -tulpn
- ps -p
- ls /proc
- top

## Lücken
- Mit {visudo} wird sudoers sicher bearbeitet.
- {chage} verwaltet Passwortalterung.
- Das {SUID}-Bit führt Programme mit Besitzerrechten aus.

## Spickzettel
- find / -perm -4000 / -2000
- ss -tulpn · lsof -i
- chage -l/-M · passwd -l
- visudo · sudo -l
- last · lastb · lastlog
