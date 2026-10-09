---
id: erg-linux-admin-praxis
bereich: Linux
block: ERG
kapitel: Ergänzungen 2.2
titel: Linux-Administration in der Praxis – Benutzer, Rechte, Pakete, systemd-Dienste und Logs
stufe: Fortgeschritten
fach: Linux I
pruefungen: [LPIC-1, AP2, Schule]
quellen: [LPI-Lernziele 101/102 (Version 5.0), man-Pages (useradd, chmod, systemctl, journalctl, apt), Debian Administrator's Handbook]
verweise: [linux-102-107-1-benutzer, linux-101-104-5-rechte, linux-101-102-4-debian-pakete, linux-101-101-3-runlevel, linux-102-108-2-logging, ap2-linux, ihk-lz-linux-rechte]
---

## Profi

### Benutzer und Gruppen
Benutzerdaten liegen in **/etc/passwd** (Name, UID, GID, Kommentar, Home, Shell), Kennwort-Hashes und Ablaufdaten in **/etc/shadow** (nur root lesbar), Gruppen in **/etc/group**. Werkzeuge:
- `useradd -m -s /bin/bash -G sudo anna` – Benutzer mit Home-Verzeichnis, Shell und Zusatzgruppe anlegen (Debian zusätzlich interaktiv: `adduser`).
- `passwd anna` – Kennwort setzen; `chage -l anna` bzw. `chage -M 90 anna` – Kennwortalterung.
- `usermod -aG projekt anna` – Zusatzgruppe **hinzufügen** (ohne `-a` werden alle anderen Zusatzgruppen ersetzt!).
- `userdel -r anna` – Benutzer samt Home löschen; `groupadd projekt`.
- `id anna`, `groups anna` – Mitgliedschaften prüfen.
Administrationsrechte vergibt man über **sudo** (Gruppe `sudo` bei Debian/Ubuntu, `wheel` bei RHEL), Konfiguration ausschließlich mit `visudo`.

### Rechte
Klassische Rechte **rwx** für **Besitzer, Gruppe, Andere**; `chmod`, `chown`, `chgrp`. Spezialrechte: **SUID** (4000, Programm läuft mit Rechten des Besitzers, z. B. `passwd`), **SGID** (2000, auf Verzeichnissen erben neue Dateien die Gruppe – ideal für Projektordner), **Sticky Bit** (1000, auf /tmp darf nur der Besitzer eigene Dateien löschen). Feinere Rechte über **ACLs**: `setfacl -m u:max:rx /srv/projekt`, `getfacl`.

### Paketverwaltung
| Familie | Paketformat | Low-Level | High-Level |
|---|---|---|---|
| Debian/Ubuntu | .deb | `dpkg` | `apt` |
| RHEL/Fedora/Rocky | .rpm | `rpm` | `dnf` (früher `yum`) |
| SUSE | .rpm | `rpm` | `zypper` |
Typischer Ablauf Debian: `apt update` (Paketlisten) → `apt upgrade` (Updates) → `apt install nginx` → `apt remove`/`purge`. High-Level-Werkzeuge lösen **Abhängigkeiten** aus Repositories auf, Low-Level-Werkzeuge nicht.

### Dienste mit systemd
**systemd** ist bei allen gängigen Distributionen der Init-Prozess (PID 1). Dienste sind **Units** (`.service`, `.socket`, `.timer`, `.target`).
- `systemctl status|start|stop|restart|reload sshd`
- `systemctl enable --now nginx` – beim Booten starten **und** sofort starten.
- `systemctl list-units --type=service --state=failed` – fehlgeschlagene Dienste.
- `systemctl get-default` / `set-default multi-user.target` – Standardziel (früher Runlevel 3).
Eigene Unit-Dateien gehören nach **/etc/systemd/system/**, danach `systemctl daemon-reload`.

### Logs
- **journald**: `journalctl -u nginx`, `journalctl -p err -b` (Fehler seit dem letzten Boot), `journalctl -f` (live).
- **rsyslog** schreibt klassisch nach **/var/log/** (`syslog` bzw. `messages`, `auth.log`/`secure`).
- **logrotate** rotiert, komprimiert und löscht alte Logdateien zeitgesteuert.

## Einfach
Linux ist wie ein großes Mehrfamilienhaus. Jeder Bewohner hat einen **Benutzernamen** und eine **Nummer (UID)**. Die Liste aller Bewohner hängt im Flur (**/etc/passwd**), aber die geheimen Schlüssel-Codes liegen im Tresor beim Hausmeister (**/etc/shadow**). Der Hausmeister heißt **root** und darf alles.

Damit nicht jeder root sein muss, gibt es **sudo**: Ein Bewohner darf sich kurz den Generalschlüssel leihen, wenn er auf der Liste steht – und alles wird aufgeschrieben.

Jede Datei hat ein **Schild an der Tür**: Wer darf **lesen (r)**, **schreiben (w)** und **ausführen bzw. hineingehen (x)**? Das Schild gilt für den **Besitzer**, seine **Gruppe** und **alle anderen**.

Programme installierst du nicht, indem du im Internet etwas herunterlädst, sondern aus dem **Paket-Laden** deiner Distribution: `apt install` holt das Programm und alles, was es braucht, automatisch dazu. Das ist wie ein Möbelhaus, das die Schrauben gleich mitliefert.

**Dienste** sind Programme, die im Hintergrund laufen, zum Beispiel ein Webserver. Der Chef aller Dienste heißt **systemd**. Mit `systemctl start` schaltest du einen Dienst an, mit `enable` sagst du: „Bitte auch nach jedem Neustart automatisch einschalten.“

Und wenn etwas kaputt ist? Dann liest du das **Tagebuch** des Systems: `journalctl`. Dort steht, wer wann was gemacht hat und welcher Fehler aufgetreten ist.

## Merksatz
- **passwd = Liste, shadow = Tresor, group = Gruppen.**
- **usermod -aG – ohne a ist alles weg.**
- **enable = beim Booten, start = jetzt, enable --now = beides.**
- **apt löst Abhängigkeiten, dpkg nicht.**
- **SGID auf Projektordner, Sticky Bit auf /tmp.**

## Prüfungsfalle
- `usermod -G gruppe user` **ersetzt** alle Zusatzgruppen – richtig ist `-aG`.
- `systemctl start` überlebt keinen Neustart – zusätzlich `enable`.
- `/etc/sudoers` nie direkt editieren, sondern mit `visudo` (Syntaxprüfung).
- `apt upgrade` ohne vorheriges `apt update` installiert nur, was in den alten Paketlisten steht.
- Nach Änderung einer Unit-Datei `systemctl daemon-reload` vergessen → alte Konfiguration aktiv.

## Grafik
### Dienst starten mit systemd
1. Admin -> systemd: systemctl enable --now nginx
2. systemd: Legt Symlink im multi-user.target.wants an
3. systemd -> nginx: Startet den Dienst
4. nginx -> journald: Meldet „Started nginx“
5. Admin -> journald: journalctl -u nginx prüft den Start

### Paket installieren mit apt
1. Admin -> apt: apt update
2. apt -> Repository: Lädt aktuelle Paketlisten
3. Admin -> apt: apt install nginx
4. apt: Löst Abhängigkeiten auf
5. apt -> dpkg: Installiert die .deb-Pakete

## Lab
**Maschine**: Linux-Server **LX01** (Debian 12) im Heimlabor **example.com**, Anmeldung per SSH als Benutzer mit sudo-Rechten.

### CLI (LX01)
```bash
sudo groupadd projekt
sudo useradd -m -s /bin/bash -G projekt anna
sudo passwd anna                      # Kennwort interaktiv setzen
sudo mkdir -p /srv/projekt
sudo chown root:projekt /srv/projekt
sudo chmod 2770 /srv/projekt          # SGID + rwx für Besitzer und Gruppe
ls -ld /srv/projekt
sudo apt update && sudo apt install -y nginx
sudo systemctl enable --now nginx
systemctl status nginx --no-pager
journalctl -u nginx -b --no-pager | tail -n 20
```

## Legende
### systemd-Unit
- Was: Konfigurationseinheit von systemd (Dienst, Timer, Socket, Ziel).
- Wie: Unit-Datei mit [Unit], [Service], [Install]; Steuerung mit systemctl.
- Wann: Beim Booten, beim manuellen Start oder zeitgesteuert über Timer.
- Wo: Herstellerdateien in /usr/lib/systemd/system, eigene in /etc/systemd/system.
- Warum: Einheitliche Steuerung von Diensten mit Abhängigkeiten und Parallelstart.

### SGID auf Verzeichnissen
- Was: Spezialrecht 2000, neue Dateien erben die Gruppe des Verzeichnisses.
- Wie: chmod g+s verzeichnis oder chmod 2770 verzeichnis.
- Wann: Bei gemeinsamen Projekt- oder Abteilungsordnern.
- Wo: z. B. /srv/projekt auf Dateiservern.
- Warum: Alle Gruppenmitglieder können die Dateien der anderen bearbeiten.

## Karteikarten
- F: In welcher Datei stehen die Kennwort-Hashes unter Linux? | A: In /etc/shadow (nur für root lesbar).
- F: Wie fügt man einen Benutzer einer Zusatzgruppe hinzu, ohne andere Gruppen zu verlieren? | A: usermod -aG gruppe benutzer.
- F: Was bewirkt systemctl enable --now dienst? | A: Aktiviert den Dienst für den Systemstart und startet ihn sofort.
- F: Unterschied dpkg und apt? | A: dpkg installiert einzelne .deb-Dateien ohne Abhängigkeitsauflösung; apt nutzt Repositories und löst Abhängigkeiten auf.
- F: Wofür steht das Sticky Bit auf /tmp? | A: Nur der Besitzer (oder root) darf eigene Dateien im Verzeichnis löschen oder umbenennen.
- F: Mit welchem Befehl bearbeitet man die sudo-Konfiguration? | A: visudo – mit Syntaxprüfung und Sperre.
- F: Wie zeigt man alle Fehler des aktuellen Boots im Journal an? | A: journalctl -p err -b
- F: Welches systemd-Target entspricht dem Runlevel 3? | A: multi-user.target.
- F: Was macht logrotate? | A: Rotiert, komprimiert und löscht alte Logdateien nach Regeln.
- F: Was ist der Paketmanager auf RHEL/Rocky Linux? | A: dnf (früher yum), Low-Level rpm.

## Quiz
? Welcher Befehl fügt anna der Gruppe projekt hinzu, ohne andere Zusatzgruppen zu entfernen?
* usermod -aG projekt anna
- usermod -G projekt anna
- groupadd projekt anna
- chgrp projekt anna
! Ohne -a (append) ersetzt -G alle bisherigen Zusatzgruppen.

? Ein Dienst soll sofort laufen und auch nach einem Neustart automatisch starten. Welcher Befehl ist richtig?
* systemctl enable --now dienst
- systemctl start dienst
- systemctl reload dienst
- systemctl mask dienst
! start allein wirkt nur bis zum nächsten Neustart; mask verhindert jeden Start.

? Welche Datei enthält die Kennwort-Hashes?
* /etc/shadow
- /etc/passwd
- /etc/group
- /etc/login.defs
! /etc/passwd ist für alle lesbar und enthält deshalb nur ein „x“ als Platzhalter.

? Welches Spezialrecht sorgt dafür, dass neue Dateien die Gruppe des Verzeichnisses erben?
* SGID
- SUID
- Sticky Bit
- umask
! chmod 2770 setzt SGID plus rwx für Besitzer und Gruppe.

? Welcher Befehl zeigt die Logmeldungen des Dienstes ssh?
* journalctl -u ssh
- systemctl log ssh
- cat /etc/ssh/sshd_config
- dmesg -u ssh
! -u filtert das Journal nach einer Unit.

? Was macht apt update?
* Es aktualisiert die Paketlisten aus den Repositories.
- Es installiert alle verfügbaren Updates.
- Es aktualisiert den Kernel.
- Es löscht alte Pakete.
! Die eigentlichen Updates installiert apt upgrade.

? Welches Werkzeug sollte zur Bearbeitung von /etc/sudoers verwendet werden?
* visudo
- nano direkt als root
- chmod
- passwd
! visudo prüft die Syntax und verhindert, dass man sich aussperrt.

? Welcher Paketmanager gehört zu openSUSE?
* zypper
- apt
- dnf
- pacman
! SUSE nutzt rpm-Pakete mit zypper als High-Level-Werkzeug.

? Was muss nach dem Ändern einer Unit-Datei in /etc/systemd/system ausgeführt werden?
* systemctl daemon-reload
- systemctl isolate rescue.target
- reboot
- apt update
! Erst nach daemon-reload liest systemd die geänderte Unit neu ein.

## Lücken
- Kennwort-Hashes liegen in {/etc/shadow}.
- Mit {usermod} -aG fügt man Zusatzgruppen hinzu.
- systemctl {enable} sorgt für den automatischen Start beim Booten.
- Unter Debian löst {apt} Abhängigkeiten automatisch auf.
- Fehler seit dem letzten Boot zeigt journalctl -p err {-b}.

## Zuordnen
### Datei und Inhalt
- /etc/passwd => Benutzername, UID, GID, Home, Shell
- /etc/shadow => Kennwort-Hash und Ablaufdaten
- /etc/group => Gruppen und Mitglieder
- /etc/sudoers => sudo-Berechtigungen

### Distribution und Paketmanager
- Debian/Ubuntu => apt und dpkg
- RHEL/Rocky/Fedora => dnf und rpm
- openSUSE/SLES => zypper und rpm
- Arch Linux => pacman

### Spezialrecht und Wirkung
- SUID (4000) => Programm läuft mit Rechten des Besitzers
- SGID (2000) auf Verzeichnis => neue Dateien erben die Gruppe
- Sticky Bit (1000) => nur Besitzer darf eigene Dateien löschen
- ACL => zusätzliche Rechte für einzelne Benutzer/Gruppen

## Reihenfolge
### Neuen Mitarbeiter auf dem Linux-Server einrichten
1. Gruppe anlegen (groupadd)
2. Benutzer mit Home und Shell anlegen (useradd -m)
3. Kennwort setzen (passwd)
4. Kennwortalterung festlegen (chage)
5. Rechte am Projektverzeichnis prüfen (ls -ld, getfacl)

### Webserver installieren und prüfen
1. Paketlisten aktualisieren (apt update)
2. Paket installieren (apt install nginx)
3. Dienst aktivieren und starten (systemctl enable --now nginx)
4. Status prüfen (systemctl status nginx)
5. Logs kontrollieren (journalctl -u nginx)

### Fehlgeschlagenen Dienst analysieren
1. Fehlgeschlagene Units auflisten (systemctl --failed)
2. Status des Dienstes ansehen
3. Journal der Unit auswerten
4. Konfiguration korrigieren
5. daemon-reload bzw. restart ausführen und erneut prüfen

## Freitext
- F: Erläutern Sie den Unterschied zwischen systemctl start und systemctl enable. | M: start startet den Dienst sofort, aber nur bis zum nächsten Neustart; enable verknüpft die Unit mit dem Ziel (z. B. multi-user.target), sodass sie beim Booten startet – startet sie aber nicht sofort (außer mit --now). | P: 4
- F: Ein Projektordner soll für alle Mitglieder der Gruppe projekt beschreibbar sein; neue Dateien sollen automatisch der Gruppe gehören. Geben Sie die Befehle an. | M: chown root:projekt /srv/projekt; chmod 2770 /srv/projekt (SGID + rwx für Besitzer und Gruppe, keine Rechte für Andere). | P: 4
- F: Begründen Sie, warum Administratoren sudo statt einer dauerhaften root-Anmeldung verwenden sollten. | M: Least Privilege, Protokollierung jeder Aktion mit Benutzername, feingranulare Rechtevergabe, kein geteiltes root-Kennwort, weniger Fehlbedienungen. | P: 4

## Szenario
### Projektordner für das Entwicklerteam
Auf LX01 sollen die Entwickler anna, ben und cem gemeinsam in /srv/dev arbeiten. Andere Benutzer dürfen nichts sehen.
- F: Welche Schritte sind nötig? | A: groupadd dev; usermod -aG dev anna (ebenso ben, cem); mkdir /srv/dev; chown root:dev /srv/dev; chmod 2770 /srv/dev. | P: 4
- F: Warum müssen sich die Benutzer nach der Gruppenänderung neu anmelden? | A: Gruppenmitgliedschaften werden beim Login in die Sitzung übernommen. | P: 1

### Webserver startet nach Neustart nicht
Nach einem Neustart ist die Webseite nicht erreichbar. Der Kollege hatte nginx nur mit systemctl start gestartet.
- F: Was ist die Ursache? | A: Der Dienst wurde nicht aktiviert (enable fehlt). | P: 1
- F: Wie beheben Sie das dauerhaft? | A: systemctl enable --now nginx und mit systemctl is-enabled nginx prüfen. | P: 2

### Benutzer verliert Gruppenrechte
Nach dem Befehl usermod -G backup max kann max nicht mehr auf das Projektverzeichnis zugreifen.
- F: Was ist passiert? | A: Ohne -a wurden alle bisherigen Zusatzgruppen durch backup ersetzt. | P: 2
- F: Wie stellen Sie die Rechte wieder her? | A: usermod -aG projekt max (bzw. alle früheren Gruppen wieder hinzufügen) und mit id max prüfen. | P: 2
