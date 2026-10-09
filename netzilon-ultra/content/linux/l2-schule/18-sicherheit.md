---
id: linux-l2-18-sicherheit
bereich: Linux
fach: Linux II
pruefungen: [LPIC-1, Schule]
block: L2
kapitel: Linux II – Administration
titel: 1.18 Sicherheit – Admin-Aufgaben, Härtung, Firewall
stufe: Fortgeschritten
quellen: [1.18_Linux_-_Sicherheit.pdf, LPI-Learning-Material-102-500-de.pdf]
verweise: [linux-102-110-1-sicherheit-admin, linux-102-110-2-absichern, linux-l1-04-root-sudo, linux-l2-19-ssh, linux-l2-15-netzwerke]
---

## Profi

### Einordnung
**110.1 Administrative Sicherheitsaufgaben (3)** und **110.2 Den Rechner absichern (3)**. Leitgedanke: Angriffsfläche klein halten, Rechte minimal, alles nachvollziehbar.

### Administrative Aufgaben (110.1)
- **SUID/SGID finden**: `find / -perm -4000 -type f` bzw. `-2000`; Dateien mit gesetztem Bit laufen mit Rechten des Besitzers/der Gruppe (z. B. `passwd`, `sudo`). Unerwartete SUID-Programme sind Alarmzeichen.
- **Passwörter/Konten**: `passwd -l|-u`, `chage`, `usermod -L`, `/etc/shadow`, leere Passwörter finden (`awk -F: '$2==""' /etc/shadow`). **Konto sperren** vs. `nologin`-Shell (`/sbin/nologin`, `/etc/nologin` sperrt Logins außer root).
- **Offene Ports**: `ss -tulpn`, `lsof -i`, `nmap localhost` (Portscan). **Dateien/Prozesse**: `lsof`, `fuser`.
- **Benutzerlimits**: `ulimit -a`, `/etc/security/limits.conf`. **Wer ist angemeldet**: `w`, `who`, `last`, `lastb`.
- **sudo**: `visudo`, Least Privilege (→ 1.04).

### Absichern (110.2)
- Nicht benötigte Dienste abschalten: `systemctl disable --now dienst`; früher **xinetd/inetd** (`/etc/inetd.conf`, `/etc/xinetd.d/`) als Super-Server – Legacy, durch systemd Socket-Units ersetzt.
- **TCP Wrapper**: `/etc/hosts.allow` und `/etc/hosts.deny` (erst allow, dann deny; nur für Dienste mit libwrap) – veraltet.
- **Firewall**: Netfilter mit **nftables** (modern) bzw. **iptables**; Frontends **ufw** (Ubuntu), **firewalld** (RHEL, `firewall-cmd --add-service=ssh --permanent`). Prinzip: Standard `DROP`, nur Nötiges erlauben.
- **Updates** einspielen, Logs prüfen, **Fail2ban** gegen Brute Force, **SELinux/AppArmor** als Mandatory Access Control.
- **SSH härten** → 1.19. **Root-Login** meiden, `PermitRootLogin no`.
- Dateirechte prüfen (world-writable: `find / -perm -0002 -type f`), `umask`, Sticky-Bit auf `/tmp`.

### Beispiel ufw
`ufw default deny incoming`, `ufw allow 22/tcp`, `ufw allow from 192.168.1.0/24 to any port 3306`, `ufw enable`, `ufw status verbose`.

## Einfach

Sicherheit auf einem Server ist wie ein **Haus abschließen**. Erstens: Mach **möglichst wenige Türen** auf. Jeder Dienst, der läuft, ist eine Tür, durch die jemand hereinschauen kann. Was du nicht brauchst, schaltest du ab (`systemctl disable --now`). Mit `ss -tulpn` siehst du, welche Türen gerade offen sind.

Zweitens: Der **Türsteher** heißt **Firewall**. Er prüft jedes Paket am Eingang. Die klügste Regel lautet: „Standardmäßig niemanden reinlassen, nur die Gäste auf der Liste.“ Mit `ufw` oder `firewalld` schreibst du diese Liste ganz einfach.

Drittens: **Schlüssel und Zutrittsrechte**. Manche Programme haben einen „Zauberschlüssel“ (das SUID-Bit): Sie laufen mit den Rechten ihres Besitzers, oft root. Das ist nötig für `passwd`, aber verdächtig bei fremden Programmen. Darum durchsuchst du das System mit `find / -perm -4000` nach solchen Zauberschlüsseln.

Viertens: **Konten aufräumen**: Wer nicht mehr arbeitet, bekommt sein Konto gesperrt (`passwd -l`), und wer kein Passwort hat, ist eine offene Tür.

Fünftens: **Updates**. Ein altes Schloss lässt sich leichter knacken. Also regelmäßig aktualisieren. Und schau ins **Logbuch**: Wer hat sich wann angemeldet, wer hat es oft vergeblich versucht (`lastb`)?

## Merksatz
- **Weniger Dienste = weniger Angriffsfläche.**
- **Firewall: erst alles verbieten, dann gezielt erlauben.**
- **SUID = 4000, SGID = 2000.**
- **hosts.allow vor hosts.deny.**
- **ss -tulpn zeigt offene Türen.**
- **Least Privilege und regelmäßige Updates.**

## Prüfungsfalle
- SUID suchen: `-perm -4000` (mit Minus = „mindestens diese Bits“), nicht `-perm 4000` ohne Minus.
- `hosts.allow` wird **zuerst** ausgewertet; passt keine Regel, ist der Zugriff erlaubt.
- TCP Wrapper und inetd/xinetd sind **Legacy**.
- `passwd -l` sperrt das Passwort, nicht zwingend andere Login-Wege (SSH-Key).
- firewalld-Änderungen ohne `--permanent` gelten nur bis zum Reload.
- `ufw` ist ein Frontend – nicht die Firewall selbst.
- `nologin` verhindert Shell-Logins, aber nicht automatisch jeden Dienstzugriff.

## Grafik

### Firewall-Prinzip
1. Client -> Firewall: Paket an Port 22
2. Firewall: Regel "allow 22/tcp" passt
3. Firewall -> Server: Paket wird durchgelassen
4. Client -> Firewall: Paket an Port 3306
5. Firewall: keine Regel, Standard DROP
6. Firewall -> Client: Paket verworfen

## Lab
**Maschine**: srv-web01 (Debian 12), Benutzer anna mit sudo.
```bash
# auf srv-web01 – Bestandsaufnahme
sudo ss -tulpn
sudo find / -xdev -perm -4000 -type f 2>/dev/null
sudo find / -xdev -perm -0002 -type f 2>/dev/null | head
sudo awk -F: '$2==""{print $1}' /etc/shadow
sudo lastb | head

# auf srv-web01 – Konto sperren, Dienst abschalten
sudo passwd -l leo
sudo systemctl disable --now cups

# auf srv-web01 – Firewall mit ufw
sudo apt install ufw
sudo ufw default deny incoming
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw enable
sudo ufw status verbose

# auf rocky01 – firewalld
sudo firewall-cmd --add-service=ssh --permanent
sudo firewall-cmd --reload
sudo firewall-cmd --list-all
```

## Befehle
- `find / -perm -4000` – SUID-Dateien
- `ss -tulpn` – offene Ports
- `lsof -i` – Netzwerk-Dateien/Prozesse
- `nmap localhost` – Portscan
- `passwd -l user` – Konto sperren
- `chage -l user` – Passwort-Aging
- `ulimit -a` – Benutzerlimits
- `ufw allow 22/tcp` – Port freigeben
- `firewall-cmd --list-all` – firewalld-Zustand
- `nft list ruleset` – nftables-Regeln

## Übungen
- A: Wie findest du alle SUID-Dateien? | L: find / -perm -4000 -type f
- A: Wie sperrst du das Konto leo? | L: passwd -l leo (oder usermod -L leo)
- A: Welche Datei wird bei TCP Wrappers zuerst geprüft? | L: /etc/hosts.allow
- A: Wie öffnest du in ufw nur SSH? | L: ufw default deny incoming; ufw allow 22/tcp; ufw enable
- A: Wie zeigst du lauschende Ports mit Prozessen? | L: ss -tulpn
- A: Wie macht man eine firewalld-Regel dauerhaft? | L: firewall-cmd --permanent ... und --reload
- A: Was ist das Sicherheitsprinzip der Standardregel einer Firewall? | L: Default deny: alles verbieten, nur Nötiges erlauben.

## Karteikarten
- F: Wie heißen die Firewall-Frontends von Ubuntu und RHEL? | A: ufw bzw. firewalld.
- F: Welche Bits stehen für SUID und SGID? | A: 4000 und 2000.
- F: Wie sucht man world-writable Dateien? | A: find / -perm -0002 -type f
- F: Welcher Befehl sperrt ein Passwort? | A: passwd -l
- F: Welche Datei sperrt Logins für Nicht-root-Benutzer? | A: /etc/nologin
- F: Was ist TCP Wrapper? | A: Zugriffsfilter über /etc/hosts.allow und hosts.deny (Legacy).
- F: Wofür dient fail2ban? | A: Sperrt IPs nach wiederholten Fehlanmeldungen (Brute-Force-Schutz).
- F: Was ist ein Super-Server? | A: inetd/xinetd, startet Dienste bei Bedarf (Legacy).
- F: Wie zeigt man fehlgeschlagene Logins? | A: lastb
- F: Was ist SELinux? | A: Mandatory Access Control zusätzlich zu den Dateirechten (RHEL).
- F: Welche moderne Netfilter-Schnittstelle ersetzt iptables? | A: nftables.

## Quiz
? Welcher Befehl findet SUID-Dateien?
* find / -perm -4000
- find / -suid -type d
- ls -l | grep s
- chmod -R u+s /

? Welche Datei wird bei TCP Wrappers zuerst ausgewertet?
* /etc/hosts.allow
- /etc/hosts.deny
- /etc/hosts
- /etc/inetd.conf

? Welche Firewall-Standardregel ist sicherheitstechnisch sinnvoll?
* Alles verwerfen, nur Nötiges erlauben
- Alles erlauben, Schädliches verbieten
- Nur ausgehend erlauben
- Keine Regel, Firewall aus

? Welcher Befehl sperrt ein Benutzerkonto-Passwort?
* passwd -l
- passwd -d
- passwd -e
- chsh -s

? Welcher Befehl zeigt lauschende Ports?
* ss -tulpn
- ping -a
- ps -p
- uname -n

? Welches Tool ist das Firewall-Frontend von RHEL?
* firewalld
- ufw
- fail2ban
- sudo

? Welches Bit hat der Wert 2000?
* SGID
- SUID
- Sticky
- Execute

? Was ist die Funktion von fail2ban?
* IPs nach vielen Fehlversuchen sperren
- Passwörter generieren
- Pakete aktualisieren
- Logs verschlüsseln

? Welche Technik gilt als Legacy?
* inetd/xinetd und TCP Wrapper
- nftables
- firewalld
- systemd-Sockets

## Lücken
- SUID-Dateien findet man mit find / -perm {-4000}.
- Die Firewall von Ubuntu-Systemen wird häufig mit {ufw} bedient.
- Zuerst wird {/etc/hosts.allow} ausgewertet.

## Spickzettel
- Dienste minimieren: systemctl disable --now · ss -tulpn
- SUID 4000 · SGID 2000 · find -perm -4000
- passwd -l · nologin · lastb
- Firewall: default deny · ufw / firewalld / nft
- hosts.allow vor deny (Legacy) · xinetd Legacy
- Updates · fail2ban · SELinux/AppArmor
