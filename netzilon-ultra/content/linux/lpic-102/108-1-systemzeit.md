---
id: linux-102-108-1-systemzeit
bereich: Linux
fach: Linux II
pruefungen: [LPIC-1]
block: LPIC-102
kapitel: LPIC-1 Prüfung 102 – Grundlegende Systemdienste
titel: 108.1 Die Systemzeit verwalten (date, hwclock, NTP, chrony)
stufe: Fortgeschritten
quellen: [LPI-Learning-Material-102-500-de.pdf, 1.12_Linux_-_Lokalisierung_und_Systemzeit_Szenario.pdf]
verweise: [linux-l2-12-lokalisierung, linux-102-107-3-lokalisierung]
---

## Profi

### Lernziel (Gewicht 3)
Systemzeit und Hardware-Uhr verwalten und per NTP synchronisieren.

### Uhren
- **Systemuhr** (Kernel, Sekunden seit 1.1.1970 UTC) und **Hardware-Uhr / RTC** (Batterie-gepuffert, im BIOS). Intern **UTC**; die Ortszeit ergibt sich aus der Zeitzone. Die RTC läuft unter Linux meist in UTC (`hwclock --utc`), unter Windows in Ortszeit (Dualboot-Problem).
- `date` (anzeigen, `date -u`, `date +%F_%T`, `date -s "2026-10-08 10:00:00"` setzen), `hwclock -r` (RTC lesen), `hwclock --systohc` (System → RTC), `hwclock --hctosys` (RTC → System). `timedatectl` (Status, `set-time`, `set-ntp true`, `set-local-rtc 0`).

### NTP
- **NTP** (Network Time Protocol), **UDP 123**, Schichten (**Stratum** 0 = Referenzuhr, 1 = direkt verbunden …). Clients: **chrony** (`chronyd`, `chronyc tracking`, `chronyc sources -v`, `/etc/chrony/chrony.conf` mit `pool`/`server`), **ntpd** (`ntpq -p`, `/etc/ntp.conf`), **systemd-timesyncd** (SNTP-Client, `/etc/systemd/timesyncd.conf`, `timedatectl timesync-status`).
- `ntpdate` (veraltet), `chronyc makestep` (Sprung), `chronyc -a makestep`. Pool: `pool.ntp.org` (`0.de.pool.ntp.org`).
- Hinweis: Sprünge vs. Schrittweise Anpassung (**slew**) – Dienste vertragen keine Zeitsprünge rückwärts (Logs, Kerberos <5 Min. Abweichung).

## Einfach

Jeder Computer hat **zwei Uhren**: die **Systemuhr**, die im laufenden Betrieb tickt, und die **Hardware-Uhr** auf dem Mainboard, die dank Batterie auch weiterläuft, wenn der Rechner aus ist. Beim Start liest Linux die Hardware-Uhr und stellt die Systemuhr danach. Beide können sich im Lauf der Zeit auseinander entwickeln.

Intern rechnet Linux gern in **UTC** (der „Weltzeit“) und rechnet zum Anzeigen in deine Ortszeit um. Das ist praktisch, weil Server in verschiedenen Ländern dann dieselbe Zeit sprechen.

Mit `date` siehst du die Systemzeit (und kannst sie setzen), mit `hwclock` siehst du die Hardware-Uhr. `hwclock --systohc` kopiert die Systemzeit in die Hardware-Uhr.

Von Hand die Zeit zu stellen ist mühsam. Besser fragst du eine **genaue Uhr im Internet**: Das ist **NTP**. Dein Rechner fragt in regelmäßigen Abständen Zeitserver (z. B. `pool.ntp.org`) und passt seine Uhr sanft an. Die „Programme“ dafür heißen **chrony**, **ntpd** oder **systemd-timesyncd**. Mit `chronyc tracking` siehst du, wie genau du bist.

Wichtig ist das für alles, was Zeitstempel braucht: Logs, Zertifikate, Anmeldung (Kerberos verträgt nur ein paar Minuten Abweichung) und Backups.

## Merksatz
- **System- und Hardware-Uhr: date vs. hwclock.**
- **Intern UTC, angezeigt in Ortszeit.**
- **NTP = UDP 123.**
- **chronyc tracking/sources, ntpq -p.**
- **--systohc: System → Hardware.**

## Prüfungsfalle
- `hwclock --systohc` (System → RTC) und `--hctosys` (RTC → System) nicht vertauschen.
- NTP nutzt **UDP** Port 123.
- `date -s` setzt nur die Systemuhr, nicht die RTC.
- Stratum 0 sind Referenzuhren (GPS, Atomuhr); Server sind ab Stratum 1.
- `ntpq -p` zeigt Peers von ntpd, `chronyc sources` die von chrony.
- Windows läuft standardmäßig mit RTC in **Ortszeit**.

## Grafik

### Zeit synchronisieren
1. Client -> NTP-Server: UDP 123 – Zeitanfrage
2. NTP-Server -> Client: Antwort mit Zeitstempel
3. chronyd: berechnet Abweichung und Laufzeit
4. chronyd -> Systemuhr: passt die Zeit schrittweise an
5. Systemuhr -> RTC: hwclock --systohc speichert die Zeit

## Lab
**Maschine**: debian01.
```bash
# auf debian01
date; date -u; sudo hwclock -r
timedatectl
sudo apt install chrony
chronyc tracking; chronyc sources -v
sudo timedatectl set-ntp true
sudo hwclock --systohc
grep -E "^(pool|server)" /etc/chrony/chrony.conf
```

## Befehle
- `date` – Systemzeit
- `date -s "..."` – Zeit setzen
- `hwclock -r` – Hardware-Uhr lesen
- `hwclock --systohc` – System → RTC
- `timedatectl` – Zeitstatus
- `chronyc tracking` – Genauigkeit
- `ntpq -p` – ntpd-Peers

## Übungen
- A: Wie speicherst du die Systemzeit in die Hardware-Uhr? | L: hwclock --systohc
- A: Welcher UDP-Port gehört zu NTP? | L: 123
- A: Wie prüfst du die Genauigkeit von chrony? | L: chronyc tracking
- A: Was ist ein Stratum-1-Server? | L: Server, der direkt mit einer Referenzuhr (Stratum 0) verbunden ist.
- A: Wie zeigst du UTC an? | L: date -u

## Karteikarten
- F: In welcher Zeit läuft die Systemuhr intern? | A: UTC.
- F: Wofür steht RTC? | A: Real Time Clock – Hardware-Uhr.
- F: Welcher Port gehört zu NTP? | A: UDP 123.
- F: Was ist chrony? | A: Moderner NTP-Client/-Server (chronyd).
- F: Was ist systemd-timesyncd? | A: Einfacher SNTP-Client von systemd.
- F: Was bewirkt hwclock --hctosys? | A: Setzt die Systemzeit aus der Hardware-Uhr.
- F: Was ist ein Stratum? | A: Abstand zur Referenzuhr in der NTP-Hierarchie.
- F: Was ist pool.ntp.org? | A: Öffentlicher Verbund von NTP-Servern.
- F: Wie schaltet man NTP in timedatectl ein? | A: timedatectl set-ntp true

## Quiz
? Welcher Port gehört zu NTP?
* UDP 123
- TCP 123
- UDP 53
- TCP 25

? Welcher Befehl schreibt die Systemzeit in die Hardware-Uhr?
* hwclock --systohc
- hwclock --hctosys
- date -r
- timedatectl rtc

? In welcher Zeit läuft die Linux-Systemuhr intern?
* UTC
- Ortszeit
- GMT+1 fest
- TAI

? Welcher Befehl zeigt die Genauigkeit von chrony?
* chronyc tracking
- chronyc ls
- ntpq -g
- date --chrony

? Was ist Stratum 0?
* Referenzuhr (z. B. Atomuhr)
- Ein NTP-Client
- Ein Pool-Server
- Ein DNS-Server

? Welches Tool ist ein reiner SNTP-Client?
* systemd-timesyncd
- chronyd
- ntpd
- ptpd

? Was setzt date -s?
* Die Systemuhr
- Die Hardware-Uhr
- Zeitzone
- NTP-Server

? Wozu dient ntpq -p?
* Peers von ntpd anzeigen
- Zeit setzen
- Pakete zählen
- Pool ändern

## Spickzettel
- System- vs. Hardware-Uhr · UTC intern
- date · date -u · hwclock -r --systohc --hctosys
- timedatectl · set-ntp true
- NTP UDP 123 · Stratum · pool.ntp.org
- chrony: chronyc tracking/sources · ntpd: ntpq -p
