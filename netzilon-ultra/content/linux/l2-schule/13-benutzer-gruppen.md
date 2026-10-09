---
id: linux-l2-13-benutzer
bereich: Linux
fach: Linux II
pruefungen: [LPIC-1, Schule]
block: L2
kapitel: Linux II – Administration
titel: 1.13 Benutzer und Gruppen, Passwort-Aging, PAM und LDAP (Szenario)
stufe: Fortgeschritten
quellen: [1.13_Linux_-_Benutzer_und_Gruppen_Szenario.pdf, LPI-Learning-Material-102-500-de.pdf]
verweise: [linux-102-107-1-benutzer, linux-l1-04-root-sudo, linux-102-110-1-sicherheit-admin, linux-102-110-2-absichern, linux-101-104-5-rechte]
---

## Profi

### Einordnung
**107.1** Benutzer- und Gruppenkonten verwalten – **Gewicht 5**, das **schwerste Einzelthema der Prüfung 102**. Vertiefung **LPIC-2 210.2** (PAM) und **210.3** (LDAP). Das Skript ist die Onboarding-Woche von Anna Berger auf srv-web01 (Debian 12), mit Bestandskonto ben, Praktikant tim (Offboarding) und dem Dienstkonto www-data.

### Die Konto-Dateien
**`/etc/passwd`** – eine Zeile pro Konto, **7 Felder**, für **alle lesbar** (Rechte 644):
```text
anna:x:1001:1001:Anna Berger:/home/anna:/bin/bash
Name:PW:UID:GID:GECOS:Home:Shell
```
- `x` = Passwort steht in **/etc/shadow**. **UID** (0 = root), **GID** = **primäre** Gruppe, **GECOS** = Kommentar (voller Name, Telefon), Home-Verzeichnis, **Login-Shell**.

**`/etc/shadow`** – Passwort-Hash und Aging, **nur für root lesbar** (Rechte 640 root:shadow bzw. 000 bei RHEL), **9 Felder**:
```text
anna:$y$j9T$...:19700:0:99999:7:::
Name:Hash:letzte Änderung:min:max:Warnung:Inaktiv:Ablauf:reserviert
```
- **letzte Änderung** und **Ablauf** in **Tagen seit 01.01.1970**; **min** = Tage bis zur nächsten erlaubten Änderung, **max** = Gültigkeit, **Warnung** = Tage vor Ablauf, **Inaktiv** = Kulanztage nach Ablauf, **Ablauf** = Konto-Ablaufdatum.
- Hash-Präfix: `$1$` MD5 (veraltet), `$5$` SHA-256, **`$6$` SHA-512**, **`$y$` yescrypt** (Standard ab Debian 11/12, Ubuntu 22.04+). **`!`** oder `*` vor/statt Hash = **gesperrt**/kein Passwort-Login; leeres Feld = **kein Passwort** (gefährlich).
- **`/etc/gshadow`**: Gruppen-Passwörter und Gruppen-Administratoren.

**`/etc/group`** – `gruppe:x:GID:mitglieder` (z. B. `team:x:1100:anna,ben`).
- **Primäre Gruppe** = GID-Feld in /etc/passwd (neue Dateien gehören ihr). **Sekundäre Gruppen** = Mitgliederliste in /etc/group. `id ben` → `gid=1002(ben)` primär, `groups=…,1100(team)` sekundär.
- Darum **nie von Hand editieren**: passwd, shadow und group müssen konsistent bleiben (notfalls `vipw`/`vigr` mit Sperre; Prüfen mit `pwck`/`grpck`).

### Benutzer verwalten
| Befehl | Wirkung |
|---|---|
| **`useradd -m -s /bin/bash -G team anna`** | Konto mit Home (**kopiert `/etc/skel`**), Shell, sekundärer Gruppe |
| `useradd -u 1234 -g gruppe -c "Kommentar" -d /home/x -e 2026-12-31` | feste UID, primäre Gruppe, GECOS, Home, Ablaufdatum |
| `useradd -r dienst` | **Systemkonto** (UID < 1000, kein Home) |
| `useradd -D` | Vorgaben anzeigen/ändern (`/etc/default/useradd`) |
| **`usermod -aG gruppe ben`** | **an** sekundäre Gruppen **anhängen** |
| `usermod -G gruppe ben` | **ersetzt** alle sekundären Gruppen! |
| `usermod -L` / `-U` | Konto sperren / entsperren (`!` vor dem Hash) |
| `usermod -s /bin/zsh`, `-l neuname`, `-d /neu -m`, `-e 2026-12-31`, `-u` | Shell, Login-Name, Home verschieben, Ablauf, UID |
| `userdel name` | Benutzer löschen (**Home bleibt**) |
| **`userdel -r name`** | Benutzer + Home + Mail-Spool löschen |
| `passwd name` (root) / `passwd` (selbst) | Passwort setzen/ändern |
| `passwd -l` / `-u` / `-S` / `-e` | Passwort sperren / entsperren / Status / sofort ablaufen lassen |
Vorgaben: **`/etc/login.defs`** (UID_MIN, PASS_MAX_DAYS, PASS_MIN_DAYS, PASS_WARN_AGE, CREATE_HOME, UMASK), **`/etc/default/useradd`** (SHELL, HOME, SKEL). Debian: **`adduser`** = interaktiver Komfort-Aufsatz (legt Home an, fragt Passwort).
- **Fehlerbild** (Ben): `usermod -G projekt ben` → Ben ist im Projekt, aber **aus team geflogen**. Reparatur: `usermod -aG team ben`. Das **-a (append)** fehlte.

### Gruppen
`groupadd projekt` (`-g GID`, `-r` Systemgruppe), `groupmod -n neu alt` (umbenennen), `-g` (GID ändern), `groupdel gruppe` (nicht, wenn sie primäre Gruppe eines Benutzers ist), **`gpasswd -a user gruppe`** / **`gpasswd -d user gruppe`** (Mitglied hinzufügen/entfernen), `gpasswd -A user gruppe` (Gruppen-Admin), `newgrp gruppe` (primäre Gruppe für die Sitzung wechseln), `groups anna`, `id anna`. **Gruppenänderungen greifen erst nach neuer Anmeldung**.

### Passwort-Aging mit chage
`chage -l anna` (anzeigen), **`-M 90`** (max. Gültigkeit), **`-m 7`** (Mindestabstand), **`-W 14`** (Warnung), `-I 30` (Inaktivität), **`-E 2026-12-31`** (Konto-Ablauf; `-E -1` entfernt), `-d 0` (Änderung beim nächsten Login erzwingen). Audit-Beispiel: `chage -M 90 -W 14 anna`.

### Spezialkonten und getent
- **Systemkonten** (UID < 1000, meist 1–999; root = 0) für Dienste wie **www-data** (UID 33, Webserver), sshd, mysql. Login verhindern mit Shell **`/usr/sbin/nologin`** (höfliche Meldung) oder **`/bin/false`**. **`/etc/nologin`** existiert → nur root darf sich anmelden.
- **`getent passwd anna`** / `getent group team` fragt **alle Quellen** laut `/etc/nsswitch.conf` ab (Dateien, LDAP, SSSD) – Standard-Check für Netz-Konten.

### Vertiefung LPIC-2 210.2: PAM
- **PAM** = **Pluggable Authentication Modules** – trennt Authentifizierung von der Anwendung; login, sshd, sudo **fragen PAM**. Konfiguration pro Dienst in **`/etc/pam.d/`** (`sshd`, `login`, `sudo`, Debian `common-auth`, RHEL `system-auth`).
- Zeile: **Typ – Control – Modul**: `auth required pam_unix.so`. Typen: **auth** (Identität), **account** (Konto gültig?), **password** (Änderung), **session** (Sitzung). Control: **required** (muss, weiterprüfen), **requisite** (muss, sofort abbrechen), **sufficient** (reicht bei Erfolg), **optional**. Module: `pam_unix` (passwd/shadow), `pam_pwquality` (Passwortstärke), **`pam_limits`** (Limits aus `/etc/security/limits.conf`), `pam_faillock` (Sperre nach Fehlversuchen), `pam_nologin`.
- **`/etc/nsswitch.conf`** legt fest, **woher** Konten kommen: `passwd: files systemd sss`, `group: files sss`. **SSSD** verbindet mit LDAP, Active Directory, Kerberos inkl. Caching. Merkbild: **NSS = Telefonbuch (wer existiert?), PAM = Türsteher (kommt er rein?)**.
### Vertiefung LPIC-2 210.3: LDAP
**LDAP** = zentraler, hierarchischer **Verzeichnisdienst** für Benutzer und Gruppen. Einträge haben einen **DN** (Distinguished Name) aus Attributen: `uid=anna,ou=people,dc=firma,dc=de` – vom Blatt zur Wurzel. Abfrage: `ldapsearch -x -H ldap://srv -b "dc=firma,dc=de" uid=anna`. Client: nsswitch.conf + PAM/SSSD → `getent passwd anna`, `id anna` funktionieren wie lokal. Vorteil: On-/Offboarding **an einer Stelle** statt auf 15 Servern; Active Directory ebenfalls über SSSD.

### Bonus
Passwort-Policies: `pam_pwquality` in **`/etc/security/pwquality.conf`** (`minlen = 12`, `minclass = 3`), chage-Werte + login.defs, `pam_faillock`. Augenmaß – zu strenge Regeln erzeugen Zettel am Monitor. Admin-Rechte über Gruppen: `usermod -aG sudo anna` (Debian) bzw. `wheel` (RHEL) → neu anmelden.

## Einfach

Ein Linux-Computer ist wie ein **Hotel**. Jeder Gast (Benutzer) hat eine **Zimmernummer (UID)**, ein **Zimmer (Home-Verzeichnis)** und gehört zu **Reisegruppen** (Gruppen).

Das Hotel führt drei Bücher:
- **`/etc/passwd`** ist das **Gästebuch an der Rezeption**: Name, Zimmernummer, Reisegruppe, Zimmer, Lieblingssprache (Shell). **Jeder darf es lesen**. Das Passwort steht dort **nicht** – nur ein **x** („liegt im Safe“).
- **`/etc/shadow`** ist der **Safe** hinter der Rezeption: Dort liegen die **Passwörter** – aber nur als **Fingerabdruck** (Hash), nicht im Klartext. Nur der **Hoteldirektor (root)** darf hineinschauen. Außerdem steht dort, **wann das Passwort abläuft**.
- **`/etc/group`** ist die **Liste der Reisegruppen** und wer dazugehört.

Jeder Gast hat **eine Hauptgruppe** (primäre Gruppe) und kann in **weiteren Gruppen** sein (sekundär) – wie ein Schüler, der in seiner **Klasse** ist, aber auch in der **Fußball-AG** und im **Chor**.

**Neue Gäste** trägt man nicht mit dem Kugelschreiber ins Buch ein, sondern mit dem **Hotelprogramm** `useradd` – das schreibt in **alle drei Bücher gleichzeitig** und richtet das Zimmer ein: Aus dem **Musterzimmer** `/etc/skel` werden Handtücher und Seife (Startdateien wie `.bashrc`) kopiert.

**Achtung, berühmter Fehler**: `usermod -G projekt ben` heißt „Ben ist **nur noch** im Projekt“ – alle anderen AGs sind weg! Richtig ist `usermod **-aG** projekt ben` – das **a** heißt „**a**uch noch dazu“ (append).

**Passwort-Aging** (`chage`) ist wie ein **Ausweis mit Ablaufdatum**: Nach 90 Tagen muss ein neues Passwort her, 14 Tage vorher kommt eine Erinnerung.

**Dienstkonten** wie `www-data` sind wie **Lieferanten**: Sie dürfen ins Lager (ihre Dateien), aber **nicht in die Lobby** zum Plaudern – darum haben sie als „Sprache“ `nologin`.

**PAM** ist der **Türsteher**, der für alle Programme die Ausweise prüft. **LDAP** ist eine **zentrale Gästekartei für eine ganze Hotelkette** – ein Gast muss nicht in jedem Hotel neu eingetragen werden.

## Merksatz
- **passwd: Name:x:UID:GID:GECOS:Home:Shell** (7 Felder) – „**N**ur **x**-mal **U**nd **G**anz **G**ern **H**eim **S**chlafen“.
- **Hashes nur in shadow – shadow nur für root**.
- **usermod -aG – das a rettet die Gruppen**.
- **userdel -r räumt das Zimmer mit aus**.
- **chage -M max, -m min, -W warn, -E Ende, -l list**.
- **/etc/skel = Musterzimmer** für neue Homes.
- **NSS = Telefonbuch, PAM = Türsteher**.

## Prüfungsfalle
- **`usermod -G`** ohne **`-a`** **ersetzt** alle sekundären Gruppen.
- **`userdel`** ohne `-r` lässt das Home-Verzeichnis stehen.
- `useradd` legt **ohne `-m`** (je nach login.defs/Distribution) **kein Home** an; `adduser` (Debian) schon.
- Die **primäre Gruppe** steht in **/etc/passwd** (GID-Feld), nicht in der Mitgliederliste von /etc/group.
- **/etc/shadow** ist nicht für normale Benutzer lesbar – `cat /etc/shadow` → Permission denied.
- Aging-Daten in shadow zählen **Tage seit 1.1.1970**.
- `chage -E` = **Konto**-Ablauf, `chage -M` = **Passwort**-Gültigkeit.
- **getent** fragt **alle** Quellen (auch LDAP), `grep /etc/passwd` nur die lokale Datei.
- Gruppenänderungen wirken erst nach **erneuter Anmeldung** (oder `newgrp`).
- PAM ist **LPIC-2** (210.2), in LPIC-1 nur Kontext.

## Grafik

### useradd -m
1. Admin -> useradd: useradd -m -s /bin/bash -G team anna
2. useradd -> /etc/login.defs: liest UID_MIN, Vorgaben
3. useradd -> /etc/passwd: neue Zeile anna:x:1001:1001
4. useradd -> /etc/shadow: Eintrag mit gesperrtem Passwort (!)
5. useradd -> /etc/group: Gruppe anna, Mitglied in team
6. useradd -> /home/anna: kopiert /etc/skel (.bashrc, .profile)
7. Admin -> passwd: setzt das Passwort, Hash nach /etc/shadow

### SSH-Login mit NSS und PAM
1. Anna -> sshd: Login als anna
2. sshd -> NSS: getpwnam – wer ist anna? (nsswitch: files sss)
3. NSS -> sshd: UID 1001, Home, Shell
4. sshd -> PAM: auth – Passwort prüfen (pam_unix / pam_sss)
5. PAM -> sshd: account – Konto gültig, nicht abgelaufen
6. PAM -> sshd: session – Limits setzen (pam_limits)
7. sshd -> Anna: Shell /bin/bash im Home

### Der -a-Fehler
1. ben: Gruppen ben, team
2. Admin -> usermod: usermod -G projekt ben
3. ben: Gruppen ben, projekt – team verloren
4. Admin -> usermod: usermod -aG team ben
5. ben: Gruppen ben, projekt, team

## Lab
**Maschine**: debian01 (Debian 12 als „srv-web01“), Admin mit sudo. Passwörter selbst wählen (hier nicht notiert).
```bash
# auf debian01 – Konto-Dateien lesen
grep -E "^(root|www-data|$USER):" /etc/passwd
ls -l /etc/passwd /etc/shadow /etc/group /etc/gshadow
cat /etc/shadow                      # Permission denied
sudo grep "^$USER:" /etc/shadow | cut -d: -f1-5
grep -E "^(UID_MIN|PASS_MAX_DAYS|PASS_WARN_AGE)" /etc/login.defs; useradd -D

# auf debian01 – Onboarding anna, Bestand ben, Praktikant tim
sudo groupadd team
sudo useradd -m -s /bin/bash -c "Anna Berger" -G team anna && sudo passwd anna
sudo useradd -m -s /bin/bash -c "Ben K" -G team ben
sudo useradd -m -s /bin/bash tim
ls -A /home/anna; id anna; id ben

# auf debian01 – der -a-Fehler und die Reparatur
sudo groupadd projekt
sudo usermod -G projekt ben; id ben        # team ist weg!
sudo usermod -aG team ben; id ben          # repariert
sudo gpasswd -a anna projekt; groups anna; sudo gpasswd -d anna projekt

# auf debian01 – Aging und Sperren
sudo chage -M 90 -m 1 -W 14 anna; sudo chage -l anna
sudo chage -d 0 anna                       # Passwortwechsel beim nächsten Login
sudo usermod -L ben; sudo passwd -S ben; sudo usermod -U ben
sudo usermod -e 2026-12-31 tim; sudo chage -l tim | tail -3

# auf debian01 – Offboarding tim
sudo userdel -r tim; getent passwd tim || echo "tim entfernt"

# auf debian01 – Systemkonten, getent, NSS/PAM ansehen
getent passwd www-data; awk -F: '$3<1000 {print $1, $7}' /etc/passwd | head
grep -E "^(passwd|group|shadow)" /etc/nsswitch.conf
ls /etc/pam.d/; grep -v "^#" /etc/pam.d/common-auth | grep .
grep -E "minlen|minclass" /etc/security/pwquality.conf 2>/dev/null

# auf debian01 – Admin-Rechte über Gruppe
sudo usermod -aG sudo anna; groups anna
```

## Befehle
- `id benutzer` – UID, primäre und sekundäre Gruppen
- `groups benutzer` – Gruppen eines Benutzers
- `getent passwd benutzer` – Kontoeintrag aus allen NSS-Quellen
- `useradd -m -s /bin/bash -G team anna` – Benutzer mit Home, Shell und Zusatzgruppe
- `useradd -r dienst` – Systemkonto anlegen
- `useradd -D` – Vorgaben anzeigen
- `adduser anna` – interaktiv anlegen (Debian)
- `usermod -aG gruppe benutzer` – sekundäre Gruppe hinzufügen
- `usermod -L benutzer` – Konto sperren
- `usermod -U benutzer` – Konto entsperren
- `usermod -s /bin/zsh benutzer` – Login-Shell ändern
- `usermod -l neu alt` – Login-Namen ändern
- `usermod -e 2026-12-31 benutzer` – Konto-Ablaufdatum
- `userdel -r benutzer` – Benutzer samt Home löschen
- `passwd benutzer` – Passwort setzen
- `passwd -S benutzer` – Passwortstatus
- `passwd -l benutzer` – Passwort sperren
- `groupadd gruppe` – Gruppe anlegen
- `groupmod -n neu alt` – Gruppe umbenennen
- `groupdel gruppe` – Gruppe löschen
- `gpasswd -a benutzer gruppe` – Mitglied hinzufügen
- `gpasswd -d benutzer gruppe` – Mitglied entfernen
- `chage -l benutzer` – Passwort-Aging anzeigen
- `chage -M 90 -W 14 benutzer` – max. Gültigkeit und Warnzeit setzen
- `chage -d 0 benutzer` – Passwortänderung beim nächsten Login erzwingen
- `pwck` – Konsistenz von passwd/shadow prüfen
- `vipw` – /etc/passwd sicher bearbeiten
- `ldapsearch -x -b "dc=firma,dc=de" uid=anna` – LDAP abfragen (LPIC-2)

## Übungen
- A: In welcher Datei stehen die Passwort-Hashes? (/etc/passwd, /etc/shadow, /etc/group, /etc/skel) | L: /etc/shadow (nur für root lesbar); /etc/passwd enthält nur ein x.
- A: Woran erkennt man die primäre Gruppe eines Benutzers? | L: Am GID-Feld in /etc/passwd; sekundäre Gruppen stehen in der Mitgliederliste von /etc/group.
- A: Wie fügt man einen User einer zusätzlichen Gruppe hinzu, ohne andere zu verlieren? (usermod -G, usermod -aG, groupadd, passwd) | L: usermod -aG – ohne -a ersetzt -G alle sekundären Gruppen.
- A: Was kopiert useradd -m ins neue Home? | L: Die Vorlagen aus /etc/skel.
- A: Welcher Befehl löscht einen Benutzer samt Home-Verzeichnis? | L: userdel -r
- A: Womit setzt/zeigt man das Passwort-Aging eines Users? (passwd, chage, getent, groupmod) | L: chage (-l anzeigen, -M/-W/-E setzen).
- A: Was bedeutet die Shell /usr/sbin/nologin? | L: Interaktiver Login wird verhindert – typisch für Dienst-/Systemkonten.
- A: Wofür steht PAM? | L: Pluggable Authentication Modules – konfiguriert in /etc/pam.d/.
- A: Welche Datei steuert, aus welchen Quellen (files, ldap, sss) Konten kommen? | L: /etc/nsswitch.conf
- A: Womit prüfen Sie auf dem Client über alle Quellen, ob das LDAP-Konto anna sichtbar ist? | L: getent passwd anna

## Szenario

### Ticket #4801 – Onboarding Anna auf srv-web01
Anna Berger startet Montag im Projekt. Konto anlegen, Gruppenzugriff (team) einrichten, Passwort-Regeln laut Audit (Wechsel alle 90 Tage, Warnung 14 Tage vorher) umsetzen. Ein Kollege rät: „Schreib einfach eine Zeile in /etc/passwd.“
- F: Warum ist der Kollegen-Tipp falsch? | A: passwd, shadow und group müssen konsistent sein; useradd/usermod pflegen alle Dateien gemeinsam, Handarbeit führt zu Fehlern.
- F: Wie legen Sie Anna an? | A: sudo useradd -m -s /bin/bash -G team anna && sudo passwd anna
- F: Wie setzen Sie die Audit-Regeln? | A: sudo chage -M 90 -W 14 anna (Standardwerte für neue Konten in /etc/login.defs).
- F: Ben verliert nach usermod -G projekt ben den Zugriff auf team. Warum und wie reparieren? | A: -G ersetzt alle sekundären Gruppen; Reparatur mit sudo usermod -aG team ben.
- F: Praktikant Tim verlässt die Firma. | A: sudo userdel -r tim (vorher ggf. Daten sichern bzw. zuerst mit usermod -L sperren).
- F: Anna fragt, wer www-data ist und warum es sich nicht anmelden kann. | A: Systemkonto des Webservers (UID 33) mit Shell /usr/sbin/nologin – kein interaktiver Login.
- F: Der Kunde bestellt 15 neue Server. Wie vermeiden Sie 15-faches Anlegen? | A: Zentrale Konten per LDAP/Active Directory, Anbindung über SSSD, nsswitch.conf und PAM (LPIC-2).
- F: Anna übernimmt Admin-Aufgaben. | A: sudo usermod -aG sudo anna (RHEL: wheel), danach neu anmelden.

## Karteikarten
- F: Welche 7 Felder hat /etc/passwd? | A: Name, Passwort-Platzhalter (x), UID, GID, GECOS, Home-Verzeichnis, Login-Shell.
- F: Was steht in /etc/shadow? | A: Benutzername, Passwort-Hash und Aging-Felder (letzte Änderung, min, max, Warnung, Inaktiv, Ablauf).
- F: Was bedeutet $6$ bzw. $y$ am Hash-Anfang? | A: $6$ = SHA-512, $y$ = yescrypt (Standard moderner Debian/Ubuntu).
- F: Was bedeutet ein ! vor dem Hash in /etc/shadow? | A: Das Passwort/Konto ist gesperrt.
- F: Aufbau von /etc/group? | A: gruppe:x:GID:mitglied1,mitglied2
- F: Unterschied primäre und sekundäre Gruppe? | A: Primär = GID in /etc/passwd (Besitzergruppe neuer Dateien); sekundär = Mitgliedschaften laut /etc/group.
- F: Was ist /etc/skel? | A: Vorlagenverzeichnis, dessen Inhalt useradd -m ins neue Home kopiert.
- F: Wo stehen die Vorgaben für useradd? | A: /etc/login.defs und /etc/default/useradd.
- F: Was bewirkt usermod -G ohne -a? | A: Es ersetzt die komplette Liste der sekundären Gruppen.
- F: Was macht userdel -r? | A: Löscht den Benutzer inklusive Home-Verzeichnis und Mail-Spool.
- F: Was macht chage -d 0 benutzer? | A: Erzwingt eine Passwortänderung beim nächsten Login.
- F: Welche UIDs haben Systemkonten typischerweise? | A: Unter 1000 (root = 0).
- F: Wie verhindert man den interaktiven Login eines Dienstkontos? | A: Login-Shell /usr/sbin/nologin oder /bin/false.
- F: Was macht getent? | A: Fragt Datenbanken (passwd, group, hosts …) über alle in nsswitch.conf konfigurierten Quellen ab.
- F: Welche vier PAM-Typen gibt es? | A: auth, account, password, session.
- F: Was ist ein DN in LDAP? | A: Distinguished Name, eindeutiger Name eines Eintrags, z. B. uid=anna,ou=people,dc=firma,dc=de.

## Quiz
? In welcher Datei stehen die Passwort-Hashes?
* /etc/shadow
- /etc/passwd
- /etc/group
- /etc/login.defs

? Welches Feld in /etc/passwd ist das sechste?
* Home-Verzeichnis
- Login-Shell
- GECOS
- GID

? Was passiert bei `usermod -G projekt ben`?
* Ben ist danach nur noch in projekt als sekundärer Gruppe
- Ben wird zusätzlich in projekt aufgenommen
- Die primäre Gruppe von Ben wird projekt
- Die Gruppe projekt wird angelegt

? Welcher Befehl löscht einen Benutzer inklusive Home-Verzeichnis?
* userdel -r anna
- userdel anna
- deluser --keep anna
- usermod -D anna

? Was kopiert `useradd -m` ins Home-Verzeichnis?
* Den Inhalt von /etc/skel
- Den Inhalt von /etc/default
- Das Home von root
- Nichts, es legt nur ein leeres Verzeichnis an

? Welcher Befehl setzt die maximale Passwortgültigkeit auf 90 Tage?
* chage -M 90 anna
- chage -m 90 anna
- passwd -W 90 anna
- usermod -e 90 anna

? Was bewirkt die Login-Shell /usr/sbin/nologin?
* Das Konto kann sich nicht interaktiv anmelden
- Das Konto hat kein Passwort
- Das Konto ist root
- Das Konto nutzt eine minimale Shell

? Welcher Befehl fragt Benutzer auch aus LDAP/SSSD ab?
* getent passwd anna
- grep anna /etc/passwd
- cat /etc/shadow
- vipw anna

? Wo steht, aus welchen Quellen Benutzerkonten gelesen werden?
* /etc/nsswitch.conf
- /etc/pam.d/common-auth
- /etc/login.defs
- /etc/hosts

? Wie nimmt man anna mit gpasswd in die Gruppe team auf?
* gpasswd -a anna team
- gpasswd -d anna team
- gpasswd team anna
- gpasswd -A team anna

? Was bedeutet in /etc/group die Zeile `team:x:1100:anna,ben`?
* anna und ben haben team als sekundäre Gruppe mit GID 1100
- team ist die primäre Gruppe von anna und ben
- anna und ben haben die UID 1100
- Die Gruppe team hat das Passwort x

? Welche Datei enthält Vorgaben wie PASS_MAX_DAYS?
* /etc/login.defs
- /etc/default/passwd
- /etc/shadow.conf
- /etc/security/limits.conf

## Spickzettel
- /etc/passwd (644): Name:x:UID:GID:GECOS:Home:Shell
- /etc/shadow (root): Name:Hash:lastchg:min:max:warn:inact:expire · $6$ SHA-512 · $y$ yescrypt · ! gesperrt
- /etc/group: gruppe:x:GID:mitglieder · primär = GID in passwd
- useradd -m -s -G -u -r · /etc/skel · /etc/login.defs · /etc/default/useradd
- usermod -aG (a!) · -L/-U · -s · -l · -e · userdel -r
- groupadd/groupmod -n/groupdel · gpasswd -a/-d · newgrp
- passwd (-l -u -S -e) · chage -l -M -m -W -E -d 0
- Systemkonten UID < 1000, nologin · getent passwd · id · groups
- LPIC-2: /etc/pam.d (auth/account/password/session) · nsswitch.conf · SSSD · LDAP DN
