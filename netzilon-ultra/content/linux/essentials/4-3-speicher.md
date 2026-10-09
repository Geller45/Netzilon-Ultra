---
id: linux-ess-daten-speichern
bereich: Linux
fach: Linux I
pruefungen: [LPIC-1, Schule]
block: Linux Essentials
kapitel: Thema 4 – Das Linux-Betriebssystem
titel: 4.3 Wo Daten gespeichert werden
stufe: Einsteiger
quellen: [LPI-Learning-Material-010-160-de.pdf]
verweise: [linux-101-104-7-fhs,linux-l1-07-datentraeger]
---

## Profi

### Lernziel (Gewicht 3)
Programme und Konfiguration, Prozesse, Speicher, Logs, Kernelmeldungen.

### Programme und Konfiguration
- Programme: `/bin`, `/sbin`, `/usr/bin`, `/usr/sbin`, `/usr/local/bin`, `/opt`. Bibliotheken `/lib`, `/usr/lib`. Konfiguration systemweit in `/etc`, benutzerbezogen in versteckten Dateien im Home (`~/.bashrc`, `~/.config`). Variable Daten in `/var`.
- **Paketverwaltung**: Pakete (`.deb`/`.rpm`) werden aus Repositories installiert; Abhängigkeiten werden aufgelöst. `dpkg -l`, `rpm -qa`.

### Prozesse
- Ein **Prozess** ist ein laufendes Programm mit **PID**, Eltern-PID (PPID), Benutzer, Zustand. `ps aux`, `top`/`htop`, `pstree`, `kill PID`, `pkill name`, `killall`; Signale `SIGTERM` (15), `SIGKILL` (9), `SIGHUP` (1). Prozess-Info in `/proc/<PID>`. Der erste Prozess ist `init`/`systemd` (PID 1). **Daemons** laufen im Hintergrund.
- Vordergrund/Hintergrund: `&`, `jobs`, `fg`, `bg`, `Strg+Z`, `Strg+C`.

### Speicher
- `free -h` (RAM, Puffer/Cache, Swap), `/proc/meminfo`, `vmstat`. Swap-Partition/-Datei. Virtueller Speicher, Out-of-Memory-Killer.

### Logs und Kernel
- `/var/log` (`syslog`/`messages`, `auth.log`, `dmesg`), `journalctl`, `dmesg` (Kernel-Ringpuffer). Kernel-Version `uname -r`, Module in `/lib/modules`.

### Datenträger
Partitionen, Dateisysteme (ext4, XFS, Btrfs), Einhängen (`mount`), `df -h`, `du -sh`. Block- vs. Zeichengeräte.

## Einfach

Linux legt Dinge **ordentlich** ab. Wenn du weißt, wo was liegt, findest du fast alles.

- **Programme** liegen in Ordnern wie `/usr/bin`. Das sind die „Werkzeugkästen“.
- **Einstellungen** liegen in `/etc` als Textdateien. Persönliche Einstellungen eines Benutzers stehen in seinem Home, in Dateien mit einem Punkt vorne (`.bashrc`).
- **Veränderliche Daten** und **Logs** (das Tagebuch des Systems) liegen in `/var`.

Ein laufendes Programm heißt **Prozess**. Jeder Prozess hat eine Nummer (PID), damit man ihn ansprechen kann. Mit `ps aux` siehst du alle, mit `top` live, wer am meisten Leistung frisst. Hängt ein Programm, kannst du es mit `kill PID` freundlich bitten aufzuhören (Signal 15) oder mit `kill -9 PID` zwingen.

Der **Arbeitsspeicher** (RAM) ist der Schreibtisch. Wird er zu voll, lagert Linux Dinge in den **Swap** aus, einen Notfall-Schreibtisch auf der Festplatte. Der ist aber viel langsamer.

Wenn etwas schiefgeht, schaust du in die Logs: `journalctl` oder `dmesg` zeigen, was der Kernel zuletzt gemeldet hat.

## Merksatz
- **/etc Einstellungen, /var Logs, /usr Programme, ~ persönliches.**
- **PID 1 = systemd.**
- **kill = 15 (bitte), kill -9 = erzwingen.**
- **Swap = langsamer Notspeicher.**

## Prüfungsfalle
- `kill -9` kann nicht abgefangen werden, räumt aber nicht auf; zuerst `kill` (15) versuchen.
- `top` zeigt live, `ps` nur eine Momentaufnahme.
- `dmesg` = Kernel, `journalctl` = alle Dienste.
- „free“ im Cache heißt nicht verschwendet: Linux nutzt freien RAM als Cache.

## Grafik

### Prozess beenden
1. Admin -> Shell: ps aux | grep firefox
2. Shell -> Admin: PID 4242
3. Admin -> Prozess: kill 4242 (SIGTERM)
4. Prozess: beendet sich sauber
5. Admin -> Prozess: kill -9 4242 (falls hängend)

## Befehle
- `ps aux` – alle Prozesse
- `top` – Live-Übersicht
- `kill -9 PID` – erzwingen
- `free -h` – RAM/Swap
- `df -h` – Datenträger
- `dmesg | tail` – Kernelmeldungen
- `journalctl -xe` – Journal

## Übungen
- A: Wo liegt die systemweite Konfiguration? | L: /etc
- A: Wie beendest du Prozess 1234 sauber? | L: `kill 1234`
- A: Wie zeigst du den Swap-Verbrauch? | L: `free -h`

## Karteikarten
- F: Welche PID hat der erste Prozess? | A: 1 (systemd/init).
- F: Welches Signal ist SIGKILL? | A: 9
- F: Welches Signal ist SIGTERM? | A: 15
- F: Wo liegen Logs? | A: /var/log
- F: Was ist ein Daemon? | A: Hintergrunddienst.
- F: Was ist Swap? | A: Auslagerungsspeicher auf der Platte.
- F: Was zeigt dmesg? | A: Den Kernel-Ringpuffer.
- F: Wo liegt die Prozessinfo? | A: /proc/PID
- F: Welcher Befehl zeigt Prozesse live? | A: top oder htop
- F: Wo liegen persönliche Einstellungen? | A: In versteckten Dateien im Home.

## Quiz
? Welche PID hat systemd?
* 1
- 0
- 100
- 999

? Welcher Befehl beendet einen Prozess erzwungen?
* kill -9 PID
- kill -15 PID
- kill -1 PID
- stop PID

? Wo liegen Konfigurationsdateien?
* /etc
- /var
- /bin
- /tmp

? Welcher Befehl zeigt Prozesse live?
* top
- ps
- pstree
- lsof

? Was ist Swap?
* Auslagerungsbereich für RAM
- Cache der CPU
- Dateisystem
- Backup

? Welche Datei enthält Speicherinfos?
* /proc/meminfo
- /etc/mem
- /var/mem
- /dev/mem

? Welcher Befehl zeigt Kernelmeldungen?
* dmesg
- lscpu
- uname
- free

? Was bedeutet SIGTERM?
* Bitte um sauberes Beenden
- Sofortiger Abbruch
- Neustart
- Pause

## Spickzettel
- /etc /var /usr /home /proc /dev
- ps aux · top · kill · kill -9
- free · df · dmesg · journalctl
