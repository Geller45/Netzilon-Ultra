---
id: linux-eckert-k10-administrative-aufgaben
bereich: Linux
fach: Linux I
pruefungen: [LPIC-1, Schule]
block: CompTIA Linux+ / LPIC-1 (Eckert)
kapitel: Eckert – CompTIA Linux+ and LPIC-1 (6th Edition)
titel: Kap. 10 Administrative Aufgaben (Drucken, Logs, Benutzer)
stufe: Fortgeschritten
quellen: [Eckert_J._W._and_triOS_College_-_CompTIA_Linux_and_LPIC-1_6th_Edition_-_2024.pdf]
verweise: [linux-102-108-4-drucken,linux-102-108-2-logging,linux-102-107-1-benutzer]
---

## Profi

### Drucken (CUPS)
Druckaufträge werden in der **Druckwarteschlange** (Spool, `/var/spool/cups`) gesammelt. **CUPS** (IPP, Port 631) ersetzt **LPD** (Line Printer Daemon). Konfiguration: Webinterface `http://localhost:631`, `lpadmin`, `/etc/cups/printers.conf`, `cupsd.conf`. Befehle: `lp`/`lpr` (drucken), `lpstat -t`/`lpq` (Status), `cancel`/`lprm` (Abbruch), `cupsenable`/`cupsdisable` (Drucker), `cupsaccept`/`cupsreject` (Warteschlange), **Druckerklassen** (Gruppe von Druckern), Priorität pro Auftrag (`lp -q`).

### Logging
- Meiste Logs in `/var/log`: `messages`/`syslog`, `secure`/`auth.log`, `boot.log`, `dmesg`, `cron`, `maillog`, `wtmp`, `btmp`, `lastlog`. **rsyslogd** schreibt Dateien (Facility.Priority → Ziel); **systemd-journald** speichert in einer Datenbank, lesen mit `journalctl` (`-u`, `-b`, `-p`, `-f`, `--since`). `logger` erzeugt Einträge. **logrotate** (`/etc/logrotate.conf`, `/etc/logrotate.d/`) rotiert, komprimiert, löscht alte Logs.

### Benutzer und Gruppen
- Dateien `/etc/passwd`, `/etc/shadow`, `/etc/group`, `/etc/gshadow`; Vorlage `/etc/skel`.
- `useradd -m -s -G -u -c`, `usermod -aG -L -U -s -d`, `userdel -r`, `passwd`, `chage -l/-M/-E`, `chfn`, `chsh`, `groupadd/groupmod/groupdel`, `gpasswd`, `groups`, `id`, `who`, `w`, `last`. `pwconv`/`pwunconv` wandeln zwischen Shadow und klassischen Passwörtern. Jeder Benutzer braucht ein gültiges Passwort zum Anmelden.
- Systembenutzer (UID < 1000) mit `nologin`.

## Einfach

Dieses Kapitel behandelt drei Alltagsaufgaben eines Admins.

**1. Drucker.** Wenn jemand druckt, landet der Auftrag zunächst in einer **Warteschlange**. Das macht der Dienst **CUPS**. Du kannst ihn über eine Webseite (`localhost:631`) bedienen oder mit Befehlen: `lp` druckt, `lpstat` zeigt den Zustand, `cancel` bricht ab. Kommt der Drucker nicht hinterher, stauen sich die Aufträge in der Schlange.

**2. Logs.** Linux schreibt Tagebuch über fast alles, was passiert: Wer hat sich angemeldet, welcher Dienst ist abgestürzt? Die Tagebücher liegen in `/var/log`. Der Dienst `rsyslogd` führt klassische Textdateien. `journald` führt eine Datenbank, die du mit `journalctl` liest. Weil Logs ewig wachsen würden, räumt **logrotate** auf: Es archiviert alte und wirft sehr alte weg.

**3. Benutzer.** Jeder Mensch bekommt ein Konto: `useradd -m anna`, dann `passwd anna`. Gruppen fassen Benutzer zusammen: `groupadd team`, `usermod -aG team anna`. Konten, die nicht mehr gebraucht werden, löschst du mit `userdel -r`. Wer sein Passwort regelmäßig ändern soll, wird mit `chage` verwaltet. Die Daten stehen in `/etc/passwd` (Konten), `/etc/shadow` (verschlüsselte Passwörter) und `/etc/group` (Gruppen).

## Merksatz
- **Druck: lp → Queue → Drucker. cancel bricht ab.**
- **Logs: /var/log, journalctl, logrotate.**
- **useradd -m, passwd, usermod -aG, userdel -r.**
- **passwd/shadow/group.**

## Prüfungsfalle
- `cupsdisable` ≠ `cupsreject`: Drucker pausieren vs. Queue sperren.
- `usermod -G` ohne `-a` überschreibt die Zusatzgruppen.
- `userdel` ohne `-r` lässt das Home zurück.
- journald-Logs sind ohne `/var/log/journal` nach dem Neustart weg.

## Grafik

### Druckauftrag
1. Benutzer -> CUPS: lp bericht.pdf
2. CUPS: Auftrag in Warteschlange
3. CUPS -> Filter: Umwandlung ins Druckerformat
4. Filter -> Drucker: Backend sendet Daten
5. Drucker -> Benutzer: Ausdruck

## Befehle
- `lp -d drucker datei` – drucken
- `lpstat -t` – Status
- `cancel ID` – Auftrag abbrechen
- `journalctl -u dienst -f` – Journal live
- `logrotate -d /etc/logrotate.conf` – Test
- `useradd -m anna` – Benutzer
- `chage -l anna` – Passwortalter

## Übungen
- A: Wie rotierst du Logs testweise? | L: `logrotate -d /etc/logrotate.conf`
- A: Wie legst du Benutzer mit Home und Zusatzgruppe dev an? | L: `useradd -m -G dev name`
- A: Wie bricht man alle eigenen Druckaufträge ab? | L: `cancel -a`

## Karteikarten
- F: Welcher Dienst druckt unter Linux? | A: CUPS
- F: Welchen Port nutzt IPP? | A: 631
- F: Wie zeigt man Druckwarteschlange? | A: lpstat oder lpq
- F: Was ist ein Druckerklasse? | A: Gruppe von Druckern, bei der der nächste freie genutzt wird.
- F: Welches Verzeichnis enthält die meisten Logs? | A: /var/log
- F: Wofür ist logrotate? | A: Rotation, Kompression, Löschen alter Logs.
- F: Welche Datei enthält Passwort-Hashes? | A: /etc/shadow
- F: Was macht chage? | A: Verwaltet Passwortalterung.
- F: Was macht pwconv? | A: Wandelt in Shadow-Passwörter um.
- F: Welcher Befehl zeigt die letzten Anmeldungen? | A: last

## Quiz
? Wie heißt das Linux-Drucksystem?
* CUPS
- LPD only
- SMBd
- PRN

? Mit welchem Befehl liest man das journald-Log?
* journalctl
- logcat
- readlog
- syslog

? Wie bricht man einen Druckauftrag ab?
* cancel
- lpstop
- rmjob
- lpkill

? Wo liegen Passwort-Hashes?
* /etc/shadow
- /etc/passwd
- /etc/group
- /etc/skel

? Welcher Befehl ändert Passwortalter-Einstellungen?
* chage
- passwd -a
- usermod -p
- chmod

? Was macht userdel -r?
* Löscht Benutzer und Home
- Sperrt Benutzer
- Benennt um
- Entfernt Gruppe

? Welche Priorität hat syslog-Level err?
* 3
- 0
- 6
- 7

? Wo liegen die meisten Systemlogs?
* /var/log
- /etc/log
- /usr/log
- /boot

## Spickzettel
- CUPS 631 · lp lpstat cancel
- /var/log · rsyslog · journalctl · logrotate
- useradd usermod userdel passwd chage
- passwd shadow group
