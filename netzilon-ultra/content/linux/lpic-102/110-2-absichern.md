---
id: linux-102-110-2-absichern
bereich: Linux
fach: Linux II
pruefungen: [LPIC-1]
block: LPIC-102
kapitel: LPIC-1 Prüfung 102 – Sicherheit
titel: 110.2 Einen Rechner absichern
stufe: Fortgeschritten
quellen: [LPI-Learning-Material-102-500-de.pdf]
verweise: [linux-l2-18-sicherheit, linux-102-110-1-sicherheit-admin]
---

## Profi

### Lernziel (Gewicht 3)
Einen Linux-Rechner gegen Angriffe härten: Shadow-Passwörter, Dienste, TCP-Wrapper, Superserver, Firewall-Grundlagen.

### Shadow-Passwörter
`/etc/passwd` (öffentlich lesbar, `x` im Passwortfeld) und `/etc/shadow` (nur root, `0640 root:shadow` bzw. `0000`). Konvertierung: `pwconv`/`pwunconv`, `grpconv`. Hash-Präfix: `$1$` MD5, `$5$` SHA-256, `$6$` SHA-512, `$y$` yescrypt. `!` oder `*` = kein Login per Passwort.

### Dienste minimieren
- Inventur: `systemctl list-unit-files --state=enabled`, `ss -tulpn`. Ungenutzte Dienste `systemctl disable --now`. Veraltet: Telnet, rsh, FTP im Klartext → durch SSH/SFTP ersetzen. **Superserver** `inetd`/`xinetd` (`/etc/inetd.conf`, `/etc/xinetd.d/`) starten Dienste bei Bedarf; Legacy.
- **TCP Wrapper** (Legacy): `/etc/hosts.allow` wird zuerst geprüft, dann `/etc/hosts.deny`; Beispiel `sshd: 192.168.10.` bzw. `ALL: ALL` in deny. Nur für Dienste mit libwrap.

### Firewall (Überblick)
Netfilter mit `iptables`/`nftables`; Frontends `ufw` (Ubuntu), `firewalld` (`firewall-cmd --add-service=ssh --permanent`, `--reload`). Grundregel: Standard „deny“, nur benötigte Ports erlauben.

### Weitere Härtung
Root-Login per SSH deaktivieren (`PermitRootLogin no`), Updates einspielen, `umask` 027, Sticky Bit auf `/tmp`, `su`/`sudo` statt root-Login, `fail2ban`, SELinux/AppArmor aktiv lassen, nicht benötigte SUID-Bits entfernen, `nologin`-Shell für Dienstkonten.

## Einfach

Einen Server absichern ist wie ein **Haus einbruchsicher machen**.

1. **Weniger Türen**: Jeder laufende Dienst ist eine Tür. Brauchst du Telnet nicht, schalte es ab. Alte, unverschlüsselte Dienste wie Telnet oder FTP ersetzt du durch SSH.
2. **Schloss an den Türen**: Passwörter liegen nicht lesbar in `/etc/passwd`, sondern als verschlüsselter „Fingerabdruck“ (Hash) in `/etc/shadow`, den nur root lesen darf.
3. **Türsteher**: Eine **Firewall** lässt nur die Gäste (Ports) herein, die auf der Liste stehen. Alles andere bleibt draußen. Die alte Variante dafür heißt TCP-Wrapper mit den Dateien `hosts.allow` und `hosts.deny`: Erst wird „allow“ gelesen, dann „deny“.
4. **Nicht als Chef herumlaufen**: Niemand soll sich direkt als root einloggen. Man arbeitet als normaler Benutzer und nutzt `sudo`, wenn nötig.
5. **Immer aktuell bleiben**: Updates stopfen bekannte Löcher.

Mit einem kurzen Kontrollgang (`ss -tulpn`, `systemctl list-unit-files`) siehst du, wo dein Haus noch Türen hat, die du nicht kennst.

## Merksatz
- **Weniger Dienste = weniger Angriffsfläche.**
- **hosts.allow zuerst, dann hosts.deny.**
- **Shadow: Hash in /etc/shadow, nur root.**
- **Firewall: Standard deny, Ausnahmen erlauben.**

## Prüfungsfalle
- Steht ein Host in **hosts.allow**, hat deny keine Wirkung; fehlt er in beiden, ist Zugriff erlaubt.
- `$6$` = SHA-512, `$1$` = MD5 (unsicher).
- `*`/`!` im Hashfeld verhindert Passwort-Login, nicht Key-Login.
- xinetd/TCP-Wrapper sind **Legacy**.

## Grafik

### TCP-Wrapper-Prüfung
1. Client -> Dienst: Verbindungsanfrage
2. Dienst -> hosts.allow: Passt eine Regel?
3. hosts.allow -> Dienst: Ja → Zugriff erlaubt
4. Dienst -> hosts.deny: Sonst: deny prüfen
5. hosts.deny -> Client: Treffer → abgelehnt, sonst erlaubt

## Lab
**Maschine**: debian01.
```bash
sudo systemctl list-unit-files --state=enabled
sudo ss -tulpn
sudo grep PermitRootLogin /etc/ssh/sshd_config
sudo ufw status || sudo firewall-cmd --list-all
sudo ls -l /etc/shadow
```

## Befehle
- `systemctl disable --now dienst` – Dienst abschalten
- `firewall-cmd --add-service=ssh --permanent` – Port freigeben
- `ufw allow 22/tcp` – Ubuntu-Firewall
- `pwconv` – Shadow-Passwörter aktivieren
- `getent shadow user` – Shadow-Eintrag (root)

## Übungen
- A: Welche Datei wird bei TCP-Wrapper zuerst gelesen? | L: /etc/hosts.allow
- A: Wie schaltest du den SSH-Root-Login ab? | L: `PermitRootLogin no` in sshd_config, sshd neu laden.
- A: Welcher Hash-Präfix bedeutet SHA-512? | L: $6$

## Karteikarten
- F: Wo liegen Passwort-Hashes? | A: /etc/shadow
- F: Was bedeutet $6$ im Hash? | A: SHA-512
- F: Was ist ein Superserver? | A: inetd/xinetd, startet Dienste bei Bedarf (Legacy).
- F: Welche Datei erlaubt Hosts bei TCP-Wrappern? | A: /etc/hosts.allow
- F: Was prüft TCP-Wrapper zuerst? | A: hosts.allow, dann hosts.deny.
- F: Wie schließt man einen Port unter firewalld dauerhaft? | A: firewall-cmd --remove-port=…/tcp --permanent und --reload
- F: Was verhindert Root-Login via SSH? | A: PermitRootLogin no
- F: Wie wandelt man in Shadow-Passwörter um? | A: pwconv
- F: Welche Firewall-Frontends gibt es? | A: ufw, firewalld
- F: Warum Telnet vermeiden? | A: Überträgt alles im Klartext.

## Quiz
? Welche Datei hat Vorrang bei TCP-Wrappern?
* /etc/hosts.allow
- /etc/hosts.deny
- /etc/hosts
- /etc/inetd.conf

? Was bedeutet $6$ im Passwort-Hash?
* SHA-512
- MD5
- Blowfish
- DES

? Welcher Befehl deaktiviert und stoppt einen Dienst sofort?
* systemctl disable --now
- systemctl mask
- service stop
- kill -9

? Wie verbietet man root-Login per SSH?
* PermitRootLogin no
- AllowRoot no
- RootLogin off
- DenyUsers *

? Welcher Dienst ist unverschlüsselt und sollte ersetzt werden?
* Telnet
- SSH
- HTTPS
- SFTP

? Was ist xinetd?
* Ein Superserver, der Dienste bei Bedarf startet
- Eine Firewall
- Ein Mailserver
- Ein Dateisystem

? Welches Zeichen im Hashfeld sperrt Passwort-Login?
* !
- #
- $
- /

? Welche Standardstrategie gilt bei Firewalls?
* Alles verbieten, nötiges erlauben
- Alles erlauben
- Nur ausgehend sperren
- Nur ICMP sperren

## Lücken
- Hashes liegen in {/etc/shadow}.
- TCP-Wrapper liest zuerst {hosts.allow}.
- Root-Login per SSH verhindert man mit {PermitRootLogin no}.

## Spickzettel
- Weniger Dienste, Firewall default deny
- hosts.allow → hosts.deny
- /etc/shadow, $6$ = SHA-512
- PermitRootLogin no
- inetd/xinetd, TCP-Wrapper = Legacy
