---
id: linux-102-108-2-logging
bereich: Linux
fach: Linux II
pruefungen: [LPIC-1]
block: LPIC-102
kapitel: LPIC-1 Prüfung 102 – Grundlegende Systemdienste
titel: 108.2 Systemprotokollierung
stufe: Fortgeschritten
quellen: [LPI-Learning-Material-102-500-de.pdf]
verweise: [linux-l2-16-logging, linux-102-108-3-mta]
---

## Profi

### Lernziel (Gewicht 3)
Die Protokollierung unter Linux verstehen: **rsyslog**, **systemd-journald** (`journalctl`), **logrotate**, `logger`.

### Klassisches Syslog / rsyslog
- Meldungen haben **Facility** (Herkunft: `auth`, `authpriv`, `cron`, `daemon`, `kern`, `mail`, `lpr`, `syslog`, `user`, `local0`–`local7`) und **Priority/Severity** (0 `emerg`, 1 `alert`, 2 `crit`, 3 `err`, 4 `warning`, 5 `notice`, 6 `info`, 7 `debug`).
- Konfiguration: `/etc/rsyslog.conf` und `/etc/rsyslog.d/*.conf`. Regel: `facility.priority  ziel`, z. B. `mail.*  /var/log/mail.log`, `*.emerg  :omusrmsg:*`, `authpriv.*  /var/log/auth.log`. Eine Priorität gilt **als Minimum** (`mail.err` = err und höher); `=` genau diese, `!` Negation, `*` alle.
- Remote-Logging: `@host` (UDP), `@@host` (TCP), Empfang über `imudp`/`imtcp` (Port 514).
- Logdateien in `/var/log`: `syslog` bzw. `messages` (Debian/RHEL), `auth.log`/`secure`, `kern.log`, `dmesg`, `boot.log`, `wtmp`/`btmp`/`lastlog` (binär: `last`, `lastb`, `lastlog`).

### systemd-journald
- Binäres Journal in `/run/log/journal` (flüchtig) oder `/var/log/journal` (persistent, wenn Verzeichnis existiert oder `Storage=persistent` in `/etc/systemd/journald.conf`).
- `journalctl`: `-b` (aktueller Boot, `-b -1` vorheriger), `-u ssh.service`, `-p err` (Priorität), `-f` (folgen), `-n 50`, `--since "2026-01-01" --until "1 hour ago"`, `-k` (Kernel), `_UID=1000`, `-o json`, `--disk-usage`, `--vacuum-size=200M`.

### logrotate
- `/etc/logrotate.conf` + `/etc/logrotate.d/`. Direktiven: `daily|weekly|monthly`, `rotate 4`, `compress`, `missingok`, `notifempty`, `create 0640 root adm`, `postrotate … endscript`, `size`. Läuft per Cron bzw. `logrotate.timer`.

### Tools
- `logger -p local0.notice "Text"` schreibt in den Syslog. `tail -f`, `less`, `grep`, `zgrep` für rotierte `.gz`-Logs. `dmesg` zeigt den Kernel-Ringpuffer.

## Einfach

Jedes Programm auf einem Linux-Rechner schreibt **Tagebuch**: „Ich habe gestartet“, „Jemand hat ein falsches Passwort eingegeben“, „Die Platte ist fast voll“. Diese Tagebucheinträge heißen **Logs**. Sie liegen meistens im Ordner `/var/log`.

Damit der Admin nicht tausend Zettel durchsuchen muss, gibt es einen **Sammler**: den Syslog-Dienst (heute meist rsyslog). Er sortiert jede Meldung nach zwei Fragen: **Wer hat sie geschrieben?** (Facility, z. B. „mail“) und **Wie wichtig ist sie?** (Priority, von „Notfall“ bis „nur zum Debuggen“). Dann steht in der Konfiguration: „Alles von mail in die Datei mail.log“.

Moderne Systeme haben zusätzlich das **Journal** (systemd-journald). Das ist ein Tagebuch in einer Datenbank. Du liest es mit `journalctl`. `journalctl -u ssh` zeigt nur den SSH-Dienst, `journalctl -b` nur seit dem letzten Start, `journalctl -f` läuft live mit wie `tail -f`.

Logs wachsen immer weiter. Würden wir nichts tun, wäre die Platte irgendwann voll. Darum gibt es **logrotate**: Es nimmt alte Logs, benennt sie um (`syslog.1`, `syslog.2.gz` …), packt sie ein und wirft die ältesten weg. So bleibt alles übersichtlich.

Und wenn du selbst etwas ins Tagebuch schreiben willst, zum Beispiel aus einem Skript: `logger "Backup fertig"`.

## Merksatz
- **Facility = wer, Priority = wie schlimm (0 emerg … 7 debug).**
- **`journalctl -u dienst -b -f`: Dienst, Boot, folgen.**
- **`@` = UDP, `@@` = TCP beim Remote-Log.**
- **logrotate: rotate, compress, missingok, notifempty.**

## Prüfungsfalle
- `mail.err` bedeutet **err und höher**, nicht nur err; nur genau err wäre `mail.=err`.
- Das Journal ist ohne `/var/log/journal` **flüchtig** und nach Neustart weg.
- `@host` ist UDP, `@@host` TCP.
- `last`/`lastb` lesen binäre Dateien (wtmp/btmp); man kann sie nicht mit `cat` lesen.
- `dmesg` zeigt Kernelmeldungen, nicht den Syslog.

## Grafik

### Weg einer Logmeldung
1. Dienst -> rsyslog: Meldung mit Facility und Priority
2. rsyslog: Regel in rsyslog.conf prüfen
3. rsyslog -> Logdatei: Eintrag in /var/log/syslog
4. rsyslog -> Logserver: Weiterleitung per @@ (TCP)
5. Logdatei -> logrotate: wöchentliche Rotation und Komprimierung

## Lab
**Maschine**: debian01 (Linux).
```bash
logger -p local0.notice "Testeintrag"
sudo tail -n 5 /var/log/syslog
journalctl -u ssh -n 20 --no-pager
journalctl -p err -b
sudo logrotate -d /etc/logrotate.conf    # Trockenlauf
```

## Befehle
- `journalctl -u dienst -f` – Journal eines Dienstes live
- `journalctl -b -p err` – Fehler seit Boot
- `logger "text"` – Meldung in den Syslog schreiben
- `dmesg` – Kernel-Ringpuffer
- `last` / `lastb` – erfolgreiche / fehlgeschlagene Logins
- `logrotate -d` – Trockenlauf

## Übungen
- A: Wie zeigst du nur Fehler des aktuellen Boots? | L: `journalctl -b -p err`
- A: Wie schreibst du eine Meldung der Facility local0 in den Syslog? | L: `logger -p local0.info "text"`
- A: Welche Regel schickt alle Mailmeldungen nach /var/log/mail.log? | L: `mail.*  /var/log/mail.log`

## Karteikarten
- F: Welche Priorität hat der Wert 0? | A: emerg (Notfall).
- F: Welche Priorität ist 4? | A: warning.
- F: Wo liegt die rsyslog-Konfiguration? | A: /etc/rsyslog.conf und /etc/rsyslog.d/.
- F: Wie macht man das Journal persistent? | A: Verzeichnis /var/log/journal anlegen oder Storage=persistent in journald.conf.
- F: Welcher Befehl zeigt Logs eines Dienstes? | A: journalctl -u dienst
- F: Was bedeutet @@host in rsyslog? | A: Weiterleitung per TCP an host.
- F: Wozu dient logrotate? | A: Alte Logs rotieren, komprimieren und löschen.
- F: Welches Tool schreibt Meldungen aus Skripten ins Log? | A: logger
- F: Welche Datei listet fehlgeschlagene Logins binär? | A: /var/log/btmp (lastb).
- F: Was zeigt dmesg? | A: Den Kernel-Ringpuffer.

## Quiz
? Welche Priorität ist die höchste (schlimmste)?
* emerg
- alert
- debug
- crit

? Welches Ziel nutzt TCP zur Weiterleitung?
* @@loghost
- @loghost
- &loghost
- >loghost

? Wie zeigt man Journal-Einträge des vorherigen Boots?
* journalctl -b -1
- journalctl -p 1
- journalctl --last
- journalctl -k

? Welche Datei enthält die Logrotate-Hauptkonfiguration?
* /etc/logrotate.conf
- /etc/rsyslog.conf
- /var/log/logrotate
- /etc/journald.conf

? Wie liest man die Datei /var/log/btmp?
* lastb
- cat /var/log/btmp
- less /var/log/btmp
- journalctl btmp

? Was bedeutet mail.err in rsyslog?
* Mailmeldungen ab Priorität err und höher
- Nur genau err
- Alle Mailmeldungen
- Alle außer err

? Mit welchem Befehl sieht man Kernelmeldungen des Journals?
* journalctl -k
- journalctl -u kernel
- logger -k
- syslog -k

? Welche Option läuft logrotate ohne Änderungen aus?
* -d (debug/Trockenlauf)
- -n
- -x
- -t

## Lücken
- Die Datei {/etc/rsyslog.conf} konfiguriert rsyslog.
- Mit {journalctl -f} folgt man dem Journal live.
- {logrotate} rotiert alte Logdateien.

## Spickzettel
- Facility.Priority → Ziel; 0 emerg … 7 debug
- journalctl -u X -b -f -p err
- @ UDP, @@ TCP
- logger, dmesg, last, lastb
- logrotate: rotate/compress/missingok/notifempty
