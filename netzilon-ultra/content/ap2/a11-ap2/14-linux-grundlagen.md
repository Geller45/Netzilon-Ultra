---
id: ap2-linux
bereich: AP2
block: A11
kapitel: Betriebssysteme
titel: Linux-Grundlagen für die AP2 (Rechte, Dienste, Shell, Netzwerk)
stufe: Fortgeschritten
quellen: [IHK-Prüfungskatalog, LPIC-1]
verweise: [ap2-skripte-sql, ap2-itil-monitoring, ap2-virtualisierung-cloud]
---

## Profi

### Verzeichnisstruktur (FHS)
**/** Wurzel · **/etc** Konfiguration · **/home** Benutzer · **/root** root · **/var** variable Daten (**/var/log** Logs) · **/usr** Programme · **/bin, /sbin** Befehle · **/tmp** temporär · **/dev** Geräte · **/proc** Kernel/Prozesse · **/boot** Kernel/Bootloader · **/opt** Zusatzsoftware · **/mnt, /media** Einhängepunkte.

### Dateirechte
`-rwxr-x--- 1 anna it datei.sh` → **Typ**, **Besitzer (u)**, **Gruppe (g)**, **Andere (o)**.
| Recht | Zahl | Datei | Verzeichnis |
|---|---|---|---|
| **r** | **4** | Lesen | Inhalt auflisten |
| **w** | **2** | Schreiben | Dateien anlegen/löschen |
| **x** | **1** | Ausführen | Betreten (cd) |

**Beispiele**: `chmod 750 datei` → rwx r-x ---; `chmod 644` → rw- r-- r--; `chmod u+x script.sh`; `chown anna:it datei`; `chgrp it datei`.
**Sonderrechte**: **SUID (4)** (mit Rechten des Besitzers ausführen, z. B. passwd), **SGID (2)** (Gruppe erben), **Sticky Bit (1)** (in /tmp nur eigene löschen) → `chmod 1777 /tmp`.
**umask 022** → neue Dateien **644**, Verzeichnisse **755**.

### Benutzer und Gruppen
`/etc/passwd` (Konten), `/etc/shadow` (Passwort-Hashes), `/etc/group`.
`useradd -m -s /bin/bash anna`, `passwd anna`, `usermod -aG sudo anna`, `userdel -r anna`, `groupadd it`, `id anna`, `su -`, `sudo`, `/etc/sudoers` (`visudo`).

### Wichtige Befehle
| Zweck | Befehl |
|---|---|
| Navigation | `pwd`, `cd`, `ls -la` |
| Dateien | `cp`, `mv`, `rm -r`, `mkdir -p`, `touch`, `ln -s` |
| Anzeigen | `cat`, `less`, `head`, `tail -f`, `wc -l` |
| Suchen | `find / -name "*.log"`, `grep -i fehler datei`, `locate` |
| Umleitung | `>` (überschreiben), `>>` (anhängen), `2>` (Fehler), `|` (Pipe) |
| Archive | `tar -czvf a.tar.gz ordner`, `tar -xzvf a.tar.gz` |
| Prozesse | `ps aux`, `top`/`htop`, `kill -9 PID`, `systemctl` |
| Speicher | `df -h`, `du -sh`, `free -h`, `lsblk`, `mount`, `/etc/fstab` |
| Pakete | **Debian/Ubuntu**: `apt update && apt upgrade`, `apt install nginx`; **RHEL**: `dnf install` |
| Hilfe | `man befehl`, `befehl --help` |

### Dienste (systemd)
`systemctl start|stop|restart|status|enable|disable nginx`, `systemctl list-units --type=service`, Logs: `journalctl -u nginx -f`.

### Netzwerk
`ip a` (Adressen), `ip r` (Routen), `ip link set eth0 up`, `ping`, `traceroute`, `ss -tulpn` (offene Ports), `dig`/`nslookup`, `/etc/hosts`, `/etc/resolv.conf`, **Netplan** (Ubuntu, `/etc/netplan/*.yaml`, `netplan apply`), `nmcli` (NetworkManager).
**SSH**: `ssh user@host`, **Schlüssel**: `ssh-keygen -t ed25519`, `ssh-copy-id user@host`, **Härtung** in `/etc/ssh/sshd_config`: `PermitRootLogin no`, `PasswordAuthentication no`.
**Firewall**: `ufw allow 22/tcp`, `ufw enable`; `firewall-cmd --add-service=http --permanent`; nftables/iptables.

### Cron
`crontab -e` → **Minute Stunde Tag Monat Wochentag Befehl**.
`30 2 * * 1-5 /root/backup.sh` → **Mo–Fr um 02:30**.
`*/15 * * * *` → **alle 15 Minuten**. `0 0 1 * *` → **am 1. jedes Monats um 0 Uhr**.

### Logs
`/var/log/syslog` (Debian), `/var/log/messages` (RHEL), `/var/log/auth.log`, `journalctl`.

## Einfach
Linux-Rechte sind wie **drei Schlüsselbunde**: **Besitzer**, **Gruppe**, **alle anderen**. Jeder Bund hat bis zu **drei Schlüssel**: **Lesen (4)**, **Schreiben (2)**, **Ausführen (1)**. **755** = Besitzer hat **alle**, die anderen dürfen **gucken und starten**. **systemctl** ist der **Lichtschalter** für Dienste, **cron** der **Wecker**.

## Merksatz
- **r4 w2 x1 – u g o**.
- **755 Skripte/Ordner, 644 Dateien, 600 geheim**.
- **systemctl enable = beim Boot**, **start = jetzt**.
- **Cron: Minute Stunde Tag Monat Wochentag**.
- **/etc Konfig, /var/log Logs**.
- **`>` überschreibt, `>>` hängt an**.

## Prüfungsfalle
- **x auf Verzeichnis** = **betreten**, nicht ausführen.
- **enable ≠ start**.
- **usermod -G ohne -a** **entfernt** andere Gruppen.
- **Cron-Wochentag 0 und 7 = Sonntag**.
- **`rm -rf /`** – niemals.
- **`/etc/shadow`** statt `/etc/passwd` für Passwort-Hashes.

## Grafik
### Drei Schlüsselbunde
Besitzer, Gruppe, Andere mit Schlüsseln r/w/x.

### Cron-Uhr
Fünf Felder als Rädchen einer Uhr.

## Übungen
- A: Besitzer alles, Gruppe lesen/ausführen, andere nichts. Befehl? | L: chmod 750 datei.
- A: Backup jeden Sonntag 23:00. Cronzeile? | L: 0 23 * * 0 /root/backup.sh.
- A: Offene TCP-Ports anzeigen? | L: ss -tlpn.
- A: Nginx beim Boot starten und jetzt starten? | L: systemctl enable --now nginx.

## Karteikarten
- F: Zahlenwerte r, w, x? | A: 4, 2, 1.
- F: Was bedeutet chmod 644? | A: Besitzer rw, Gruppe r, Andere r.
- F: Wo liegen Passwort-Hashes? | A: /etc/shadow.
- F: Wie fügt man einen Benutzer einer Gruppe hinzu? | A: usermod -aG gruppe benutzer.
- F: Wie startet man einen Dienst dauerhaft beim Boot? | A: systemctl enable dienst.
- F: Wie zeigt man Logs eines Dienstes? | A: journalctl -u dienst.
- F: Reihenfolge der Cron-Felder? | A: Minute, Stunde, Tag, Monat, Wochentag.
- F: Was macht das Sticky Bit? | A: Nur Besitzer darf eigene Dateien im Verzeichnis löschen.
- F: Befehl für IP-Adressen? | A: ip a.
- F: Wie verhindert man Root-Login per SSH? | A: PermitRootLogin no in sshd_config.

## Quiz
? Welche Rechte ergibt chmod 750?
* rwxr-x---
- rwxrwxrwx
- rw-r--r--
- rwxr-xr-x

? Welcher Befehl zeigt offene Ports?
* ss -tulpn
- ls -la
- df -h
- chmod

? Was bedeutet die Cronzeile 0 3 * * 1?
* Jeden Montag um 03:00
- Täglich 03:00
- Am 3. jedes Monats
- Alle 3 Minuten

? Wo stehen Systemkonfigurationsdateien?
* /etc
- /home
- /tmp
- /dev

? Was macht systemctl enable?
* Startet den Dienst automatisch beim Booten
- Startet den Dienst sofort und nur einmal
- Löscht den Dienst
- Zeigt Logs

? Welche Datei enthält die Kennwort-Hashes unter Linux?
* /etc/shadow
- /etc/passwd
- /etc/hosts
- /etc/fstab
! /etc/passwd ist für alle lesbar und enthält nur ein „x“.

? Welcher Befehl ändert den Besitzer einer Datei?
* chown
- chmod
- chgrp nur für Benutzer
- passwd
! chmod ändert Rechte, chgrp die Gruppe.

? Welcher Befehl zeigt die IP-Konfiguration unter modernen Linux-Systemen?
* ip addr (ip a)
- ipconfig
- ifconfig.exe /all
- netsh interface
! ifconfig gilt als veraltet (net-tools).
