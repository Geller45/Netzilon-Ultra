---
id: linux-eckert-k09-prozesse
bereich: Linux
fach: Linux I
pruefungen: [LPIC-1, Schule]
block: CompTIA Linux+ / LPIC-1 (Eckert)
kapitel: Eckert – CompTIA Linux+ and LPIC-1 (6th Edition)
titel: Kap. 9 Linux-Prozesse verwalten
stufe: Fortgeschritten
quellen: [Eckert_J._W._and_triOS_College_-_CompTIA_Linux_and_LPIC-1_6th_Edition_-_2024.pdf]
verweise: [linux-101-103-5-prozesse,linux-101-103-6-prioritaeten,linux-102-107-2-jobs]
---

## Profi

### Prozessgrundlagen
Ein **Programm** ist eine Datei, ein **Prozess** ein laufendes Programm mit **PID**, **PPID**, UID, Zustand und Priorität. Die Shell erzeugt Prozesse per **fork** (Kindprozess/Subshell) + **exec**. **Benutzerprozesse** hängen an einem Terminal; **Daemons** (Dienste) laufen im Hintergrund ohne Terminal (Namen enden oft auf `d`). Alle Prozesse haben einen Elternprozess; Wurzel ist PID 1 (init/systemd).

### Zustände
Running (R), Sleeping (S, interruptible; D, uninterruptible), Stopped (T), **Zombie** (Z; beendet, aber Elternprozess hat den Rückgabewert nicht abgeholt), **Rogue** (außer Kontrolle, verbraucht Ressourcen).

### Anzeigen
`ps -ef`, `ps aux`, `ps -u user`, `pstree`, `pgrep`, `top` (interaktiv; `k` kill, `r` renice, `M` nach Speicher, `P` nach CPU), `htop`, `lsof` (offene Dateien, `lsof -i :80`), `/proc/<PID>/`. `uptime` und Load Average.

### Signale
`kill -l`. Wichtige: **SIGHUP (1)** neu einlesen, **SIGINT (2)** (Strg+C), **SIGKILL (9)** erzwungen, **SIGTERM (15)** Standard/sauber, **SIGSTOP (19)**, **SIGCONT (18)**, **SIGTSTP (20)** (Strg+Z). `kill PID`, `kill -9 PID`, `killall name`, `pkill muster`.

### Hintergrund und Jobs
`befehl &`, `jobs`, `fg %1`, `bg %1`, `Strg+Z`, `nohup befehl &` (übersteht Terminalschluss), `disown`.

### Priorität
**Nice-Wert** −20 (höchste Priorität) bis +19 (niedrigste); Standard 0. `nice -n 10 befehl`, `renice -n 5 -p PID`. Nur **root** darf Nice-Werte senken/negative setzen. `time slice` (CPU-Zeitscheibe).

### Zeitsteuerung
**at** (einmalig): `at 14:00`, `atq`, `atrm`; **cron** (wiederkehrend): `crontab -e/-l/-r`, Felder `min std tag monat wochentag befehl`, `/etc/crontab`, `/etc/cron.d/`, `cron.daily/hourly/weekly/monthly`, `cron.allow/deny`. **anacron** holt verpasste Jobs auf nicht dauernd laufenden Rechnern nach. systemd-Timer als Alternative.

## Einfach

Wenn du ein Programm startest, entsteht ein **Prozess**. Stell dir ein Rezept (Programm) vor und einen Koch, der gerade danach kocht (Prozess). Jeder Koch bekommt eine Nummer, die **PID**. Ein Prozess kann Kinder erzeugen: Deine Shell startet für `ls` einen eigenen Kindprozess.

Manche Prozesse laufen unsichtbar im Hintergrund und bieten Dienste an, **Daemons** genannt (z. B. `sshd`). Mit `ps aux` siehst du alle, mit `top` live, wer gerade am meisten arbeitet.

Wenn einer hängt, schickst du ihm ein **Signal**: `kill PID` fragt höflich („bitte beenden“, Signal 15). Reagiert er nicht, hilft `kill -9 PID` – das ist der Rausschmiss. Ein **Zombie** ist ein Prozess, der fertig ist, dessen Eltern aber nicht „Tschüss“ gesagt haben; er belegt nur noch einen Tabelleneintrag.

Du kannst Programme auch im **Hintergrund** laufen lassen: `befehl &`. Mit `jobs` siehst du sie, mit `fg` holst du sie zurück.

Die **Priorität** regelst du mit dem **Nice-Wert**: Wer „netter“ ist (höhere Zahl bis 19), lässt anderen den Vortritt. Nur root darf unfreundlich (negativ) sein.

Wiederkehrende Aufgaben (jede Nacht ein Backup) erledigt **cron**. Einmalige Aufgaben macht **at**.

## Merksatz
- **Programm = Datei, Prozess = laufend.**
- **kill = 15 (höflich), kill -9 = erzwungen.**
- **Nice −20 stark … +19 schwach.**
- **cron: Minute Stunde Tag Monat Wochentag.**

## Prüfungsfalle
- Nice-Wert **niedriger = höhere Priorität**.
- Zombies kann man nicht mit `kill -9` entfernen; man muss den Elternprozess beenden.
- `kill` ohne Signalangabe sendet SIGTERM (15).
- `nohup` verhindert SIGHUP beim Schließen des Terminals.
- Crontab-Felder: Wochentag 0 oder 7 = Sonntag.

## Grafik

### Prozess-Lebenszyklus
1. Shell -> Kernel: fork() erzeugt Kindprozess
2. Kernel -> Kindprozess: exec() lädt das Programm
3. Kindprozess: läuft (R) / wartet (S)
4. Kindprozess -> Shell: beendet sich, Rückgabewert
5. Shell: holt Status ab, Kind verschwindet (sonst Zombie)

## Lab
**Maschine**: debian01.
```bash
sleep 300 &
jobs
ps -o pid,ni,cmd -p $!
renice -n 10 -p $!
kill $!
nice -n 15 tar czf /tmp/x.tgz /etc
crontab -e   # */5 * * * * /usr/bin/date >> /tmp/zeit.log
echo "date > /tmp/at.out" | at now + 2 minutes
atq
```

## Befehle
- `ps aux` – alle Prozesse
- `top` / `htop` – live
- `pgrep -l name` – PIDs finden
- `kill -9 PID` – erzwingen
- `nice -n 10 cmd` – mit Nice starten
- `renice -n 5 -p PID` – Nice ändern
- `crontab -e` – cron bearbeiten
- `at 14:00` – einmaliger Job
- `lsof -i :80` – wer nutzt Port 80

## Übungen
- A: Cron-Eintrag: Jeden Montag um 03:30 Backup-Skript starten. | L: `30 3 * * 1 /usr/local/bin/backup.sh`
- A: Wie startest du einen Prozess mit niedrigster Priorität? | L: `nice -n 19 befehl`
- A: Wie beendest du alle Prozesse namens firefox? | L: `killall firefox` oder `pkill firefox`

## Karteikarten
- F: Was ist ein Zombie-Prozess? | A: Beendeter Prozess, dessen Rückgabewert der Elternprozess nicht abgeholt hat.
- F: Welcher Nice-Bereich gilt? | A: -20 bis +19.
- F: Was ist SIGTERM? | A: Signal 15, sauberes Beenden.
- F: Was ist SIGKILL? | A: Signal 9, erzwungenes Beenden.
- F: Was macht nohup? | A: Verhindert Beenden beim Terminalschluss.
- F: Wofür ist anacron? | A: Holt verpasste cron-Jobs nach.
- F: Was zeigt lsof? | A: Geöffnete Dateien und Sockets.
- F: Wie holt man einen Job in den Vordergrund? | A: fg %n
- F: Wie listet man at-Jobs? | A: atq
- F: Welche Felder hat eine crontab-Zeile? | A: Minute, Stunde, Tag, Monat, Wochentag, Befehl.

## Quiz
? Welches Signal beendet einen Prozess erzwungen?
* SIGKILL (9)
- SIGTERM (15)
- SIGHUP (1)
- SIGINT (2)

? Welcher Nice-Wert hat die höchste Priorität?
* -20
- 0
- 19
- 100

? Wie entfernt man einen Zombie?
* Den Elternprozess beenden
- kill -9 am Zombie
- renice
- nohup

? Was bewirkt der Zusatz & am Befehlsende?
* Start im Hintergrund
- Umleitung
- Pipe
- Sudo

? Wie lautet die Reihenfolge der crontab-Felder?
* Minute Stunde Tag Monat Wochentag
- Stunde Minute Tag Monat Wochentag
- Tag Monat Jahr Stunde Minute
- Sekunde Minute Stunde Tag Monat

? Welcher Befehl zeigt Prozesse als Baum?
* pstree
- ps -t
- top -b
- pgrep

? Wer darf negative Nice-Werte setzen?
* Nur root
- Jeder Benutzer
- Nur die Gruppe wheel
- Niemand

? Wofür steht atq?
* Listet wartende at-Jobs
- Startet at
- Beendet at
- Zeigt cron

## Lücken
- Mit {kill -9} wird ein Prozess erzwungen beendet.
- {crontab -e} bearbeitet die eigenen cron-Jobs.
- Der Nice-Wert reicht von {-20} bis {19}.

## Spickzettel
- ps aux · top · pstree · pgrep
- kill 15 · kill -9 · killall · pkill
- & jobs fg bg nohup
- nice -20..19 · renice
- cron/at/anacron
