---
id: linux-l2-16-logging
bereich: Linux
fach: Linux II
pruefungen: [LPIC-1, Schule]
block: L2
kapitel: Linux II – Administration
titel: 1.16 System-Logging und Mail
stufe: Fortgeschritten
quellen: [1.16_Linux_-_System-Logging_und_Mail.pdf, LPI-Learning-Material-102-500-de.pdf]
verweise: [linux-102-108-2-logging, linux-102-108-3-mta, linux-l1-06-booten, linux-l2-14-automatisierung]
---

## Profi

### Einordnung
**108.2 Systemprotokollierung (Gewicht 3)** und **108.3 Grundlagen des Mail Transfer Agent (3)**. Logs sind das Gedächtnis des Servers: Fehlersuche, Sicherheit, Nachweis.

### syslog / rsyslog
- **rsyslog** (Nachfolger von syslogd) sortiert Meldungen nach **Facility.Priority** in Dateien. Konfiguration `/etc/rsyslog.conf` und `/etc/rsyslog.d/*.conf`.
- **Facilities**: auth/authpriv, cron, daemon, kern, lpr, mail, news, syslog, user, uucp, local0–local7.
- **Prioritäten (hoch → niedrig)**: emerg(0), alert(1), crit(2), err(3), warning(4), notice(5), info(6), debug(7). Eine Regel erfasst die genannte Priorität **und alle höheren**; `=` nur genau diese, `!` negiert, `*` alles, `none` nichts.
- Beispielregeln: `auth,authpriv.* /var/log/auth.log`, `*.info;mail.none /var/log/messages`, `kern.* @@loghost:514` (TCP; ein `@` = UDP).
- Typische Dateien: Debian `/var/log/syslog`, `auth.log`, `kern.log`; RHEL `/var/log/messages`, `secure`; binär `wtmp`/`btmp`/`lastlog` (mit `last`, `lastb`, `lastlog` lesen).
- **logger** erzeugt Einträge: `logger -p local0.notice "Test"`.

### logrotate
- Rotiert, komprimiert, löscht alte Logs; Konfiguration `/etc/logrotate.conf` und `/etc/logrotate.d/`. Direktiven: `daily|weekly|monthly`, `rotate 4`, `compress`, `missingok`, `notifempty`, `create 0640 root adm`, `postrotate ... endscript`. Aufruf meist per cron/systemd-Timer; Test: `logrotate -d /etc/logrotate.conf` (Debug), `-f` erzwingen.

### systemd-journald
- Binäres **Journal**, flüchtig in `/run/log/journal`, **persistent** nach `mkdir /var/log/journal` oder `Storage=persistent` in `/etc/systemd/journald.conf`.
- `journalctl`: `-b` (aktueller Boot), `-b -1`, `-u ssh` (Unit), `-p err` (Priorität), `--since "1 hour ago"`, `-f` (folgen), `-k` (Kernel), `-n 20`, `--disk-usage`, `--vacuum-size=200M`, `_COMM=sudo`.
- Kernelmeldungen: `dmesg`.

### Mail (MTA)
- **MTA** (Mail Transfer Agent) transportiert Mail per SMTP (Port 25): **Postfix**, **Exim**, **sendmail**, qmail. MUA = Mailprogramm (mail, mutt), MDA stellt zu.
- Lokale Zustellung für Systemmails (cron, root). **`/etc/aliases`** ordnet Namen/Empfänger zu (`root: admin@firma.de`); nach Änderung **`newaliases`**. **`~/.forward`** leitet eigene Mail weiter. Warteschlange: **`mailq`** (= `sendmail -bp`).
- Test: `echo "Text" | mail -s "Betreff" root`. Postfix-Konfiguration `/etc/postfix/main.cf`, `postconf -n`.

## Einfach

Ein Server führt wie ein Kapitän ein **Logbuch**. Alles Wichtige wird aufgeschrieben: Wer hat sich angemeldet? Welcher Dienst ist abgestürzt? Der Schreiber heißt **rsyslog**. Er sortiert jede Meldung nach zwei Merkmalen: **woher sie kommt** (Facility, z. B. mail, auth, kern) und **wie schlimm sie ist** (Priority: von „debug“ = Kleinkram bis „emerg“ = Weltuntergang).

Eine Regel wie `auth.* /var/log/auth.log` heißt: „Alles Wichtige zur Anmeldung kommt in diese Seite des Buches.“ Und eine Regel für „err“ umfasst auch die schlimmeren Stufen darüber.

Bücher werden irgendwann zu dick. Deshalb gibt es **logrotate**: Es heftet alte Seiten ab (`syslog.1`, `syslog.2.gz`), packt sie zusammen und wirft sehr alte weg. Damit läuft die Festplatte nicht voll.

Moderne Systeme haben ein zweites Logbuch: das **Journal** von systemd. Es ist ein Computer-Archiv, das du mit `journalctl` durchsuchst, z. B. nur den Dienst `ssh` oder nur Fehler seit gestern.

Und die **Mail**? Linux schickt sich selbst Briefe, z. B. wenn ein Job Ausgabe hat. Der **Briefträger** heißt MTA (Postfix oder Exim). In einer Liste (`/etc/aliases`) steht, wer die Post für „root“ wirklich bekommt. Ändert man die Liste, muss man `newaliases` sagen, sonst merkt es der Briefträger nicht. Mit `mailq` siehst du, welche Briefe noch im Postfach des Briefträgers liegen.

## Merksatz
- **Facility.Priority – und die Priorität gilt „ab dieser Stufe aufwärts“.**
- **Prioritäten: emerg alert crit err warning notice info debug.**
- **Ein @ = UDP, zwei @@ = TCP.**
- **aliases ändern → newaliases.**
- **journalctl -u Dienst -b -p err.**
- **Journal ist standardmäßig flüchtig, bis /var/log/journal existiert.**

## Prüfungsfalle
- `kern.err` erfasst auch crit, alert und emerg; `kern.=err` nur err.
- Debian: `/var/log/auth.log`, `syslog`; Red Hat: `secure`, `messages`.
- `wtmp` ist **binär**: nicht mit cat, sondern mit `last` lesen.
- Nach Änderung von `/etc/aliases` muss **`newaliases`** laufen.
- `mailq` zeigt die Warteschlange, nicht den Posteingang.
- `logrotate -d` ändert nichts (Debug), `-f` erzwingt.
- Das Journal bleibt ohne `Storage=persistent` oder `/var/log/journal` nicht über Neustarts erhalten.
- Remote-Logging mit `@@` = TCP, `@` = UDP.

## Grafik

### Weg einer Logmeldung
1. sshd -> rsyslog: Meldung auth.info "Accepted publickey"
2. rsyslog: Regel auth,authpriv.* passt
3. rsyslog -> auth.log: Zeile wird in /var/log/auth.log geschrieben
4. logrotate -> auth.log: rotiert wöchentlich, komprimiert, löscht nach 4 Wochen

### Systemmail
1. cron -> Postfix: Job-Ausgabe an root
2. Postfix: /etc/aliases leitet root zu admin weiter
3. Postfix -> Postfach: lokale Zustellung
4. Postfix: nicht zustellbar – bleibt in mailq

## Lab
**Maschine**: srv-web01 (Debian 12).
```bash
# auf srv-web01 – Logs und logger
sudo tail -n 5 /var/log/syslog
logger -p local0.notice "Hallo Logbuch"
sudo grep "Hallo" /var/log/syslog
last -n 5; sudo lastb | head -3

# auf srv-web01 – journalctl
journalctl -b -p err
journalctl -u ssh --since "1 hour ago"
journalctl -f -n 20
journalctl --disk-usage
sudo mkdir -p /var/log/journal && sudo systemctl restart systemd-journald

# auf srv-web01 – logrotate testen
sudo logrotate -d /etc/logrotate.conf | head -20
cat /etc/logrotate.d/rsyslog

# auf srv-web01 – Mail
echo "Test" | mail -s "Testmail" root
mailq
echo "root: admin@example.com" | sudo tee -a /etc/aliases && sudo newaliases
```

## Befehle
- `journalctl -u dienst` – Logs einer Unit
- `journalctl -b -p err` – Fehler seit Boot
- `journalctl -f` – live mitlesen
- `dmesg` – Kernelpuffer
- `logger -p facility.prio "text"` – Eintrag erzeugen
- `last` / `lastb` / `lastlog` – Anmeldeprotokolle
- `logrotate -d datei` – Debug-Lauf
- `mailq` – Mail-Warteschlange
- `newaliases` – aliases-Datenbank neu bauen
- `postconf -n` – Postfix-Konfiguration

## Übungen
- A: Wie schreibst du eine Meldung der Facility local0 mit Priorität notice ins Log? | L: logger -p local0.notice "Text"
- A: Wie zeigst du nur Fehler des aktuellen Boots? | L: journalctl -b -p err
- A: Welche Priorität ist höher: warning oder err? | L: err (3) ist höher als warning (4).
- A: Was muss nach Änderung von /etc/aliases ausgeführt werden? | L: newaliases
- A: Wie sendest du Logs per TCP an loghost? | L: *.* @@loghost:514
- A: Wo liegen Anmeldefehler auf Debian? | L: /var/log/auth.log (Red Hat: /var/log/secure)
- A: Wie macht man das Journal persistent? | L: Verzeichnis /var/log/journal anlegen oder Storage=persistent in journald.conf.

## Karteikarten
- F: Welche Bestandteile hat eine syslog-Regel? | A: Selektor Facility.Priority und ein Ziel (Datei, Host, ...).
- F: Welche ist die höchste syslog-Priorität? | A: emerg (0).
- F: Was bewirkt ein einzelnes @ vor dem Zielhost? | A: Übertragung per UDP (@@ = TCP).
- F: Wofür ist logrotate zuständig? | A: Rotieren, Komprimieren und Löschen alter Logdateien.
- F: Wie liest man die binäre Datei wtmp? | A: Mit last.
- F: Wie zeigt man Logs einer Unit? | A: journalctl -u Unitname
- F: Welcher Befehl zeigt Kernelmeldungen? | A: dmesg (oder journalctl -k).
- F: Was ist ein MTA? | A: Mail Transfer Agent – transportiert Mail per SMTP, z. B. Postfix, Exim, sendmail.
- F: Wofür dient ~/.forward? | A: Leitet die Mail eines Benutzers weiter.
- F: Wie zeigt man die Mail-Warteschlange? | A: mailq
- F: Welche Datei sammelt auf RHEL Authentifizierungsmeldungen? | A: /var/log/secure

## Quiz
? Welches Programm erzeugt manuell einen Syslog-Eintrag?
* logger
- syslog-add
- logwrite
- echolog

? Welche Datei enthält auf Debian Anmeldemeldungen?
* /var/log/auth.log
- /var/log/secure
- /var/log/login
- /etc/auth.log

? Was erfasst die Regel kern.err?
* err und alle höheren Prioritäten der Facility kern
- Nur err
- Alle Prioritäten von kern
- Nur Meldungen niedriger als err

? Wofür steht @@ in rsyslog?
* Weiterleitung per TCP
- Weiterleitung per UDP
- Lokale Datei
- Verschlüsselte Übertragung

? Welcher Befehl liest die Anmeldehistorie aus wtmp?
* last
- cat /var/log/wtmp
- lastlog -r
- who -a

? Wie zeigt man die Mail-Warteschlange an?
* mailq
- mailcheck
- postlist
- newaliases

? Was ist nach einer Änderung in /etc/aliases nötig?
* newaliases
- postfix reload
- systemctl restart journald
- mailq -f

? Wie zeigt man die Logs des SSH-Dienstes seit einer Stunde?
* journalctl -u ssh --since "1 hour ago"
- journalctl ssh -t 1h
- dmesg -u ssh
- logger -u ssh

? Welcher Programmtyp ist Postfix?
* MTA
- MUA
- MDA
- DNS-Server

? Was macht logrotate -d?
* Debug-Lauf ohne Änderungen
- Löscht alle Logs
- Erzwingt Rotation
- Verschlüsselt Logs

## Lücken
- Die höchste Priorität in syslog heißt {emerg}.
- Mit {journalctl} liest man das systemd-Journal.
- Der Mailserver Postfix ist ein {MTA}.

## Spickzettel
- Facility.Priority · ab Stufe aufwärts · = genau
- emerg alert crit err warning notice info debug
- @ UDP · @@ TCP · logger · logrotate (-d/-f)
- journalctl -u -b -p -f · persistent: /var/log/journal
- Debian auth.log/syslog · RHEL secure/messages
- last/lastb/lastlog statt cat
- MTA: Postfix/Exim/sendmail · aliases+newaliases · mailq · ~/.forward
