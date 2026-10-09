---
id: linux-ess-sicherheit-benutzertypen
bereich: Linux
fach: Linux I
pruefungen: [LPIC-1, Schule]
block: Linux Essentials
kapitel: Thema 5 – Sicherheit und Dateiberechtigungen
titel: 5.1 Sicherheitsgrundlagen und Identifizierung von Benutzertypen
stufe: Einsteiger
quellen: [LPI-Learning-Material-010-160-de.pdf]
verweise: [linux-102-110-1-sicherheit-admin,linux-l1-04-root-sudo]
---

## Profi

### Lernziel (Gewicht 2)
Benutzertypen (root, Standard-, Systembenutzer), Identifikation und Rechte.

### Benutzertypen
- **root** (UID 0): Superuser mit allen Rechten. **Normale Benutzer** (UID ab 1000 bei Debian/RHEL 7+; früher ab 500). **Systembenutzer** (UID < 1000, z. B. `www-data`, `sshd`, `nobody`) für Dienste, meist ohne Login-Shell (`/usr/sbin/nologin`). Jeder Benutzer hat eine **primäre Gruppe** und kann in weiteren Gruppen sein.
- Dateien: `/etc/passwd` (Name:x:UID:GID:Kommentar:Home:Shell), `/etc/shadow` (Hashes), `/etc/group`.

### Identifizieren
- `id` (UID, GID, Gruppen), `whoami`, `groups`, `who`, `w`, `last`, `finger` (Legacy), `getent passwd user`.

### Rechteerhöhung
- `su -` (Wechsel zum root mit root-Passwort, Login-Umgebung), `su - user`, **`sudo befehl`** (einzelner Befehl mit eigenen Anmeldedaten laut `/etc/sudoers`), `sudo -i`, `sudo -u user befehl`. Arbeiten als root auf Dauer vermeiden (**Prinzip der geringsten Rechte**). Prompt `#` zeigt root.

### Sicherheit
Starke Passwörter, Updates, nicht unnötig root, Zugriff protokollieren (`/var/log/auth.log` bzw. `secure`), Dienste minimieren.

## Einfach

Auf einem Linux-Rechner gibt es drei Sorten von Benutzern.

1. **root**: Der Chef mit der Nummer 0. Er darf alles, auch alles kaputtmachen. Deshalb arbeitet man nicht ständig als root.
2. **Normale Benutzer**: Das bist du und deine Kollegen. Jeder hat ein eigenes Zuhause (`/home/name`) und darf dort tun, was er will, aber nicht am System herumschrauben.
3. **Systembenutzer**: Das sind „Dienstmitarbeiter“, zum Beispiel für den Webserver. Sie haben kein Passwort zum Einloggen. Ein Dienst läuft unter so einem Benutzer, damit er bei einem Angriff nicht gleich alles darf.

Jeder Benutzer hat eine **Nummer** (UID). Welche du bist, verrät dir `id`. Der Befehl zeigt auch deine **Gruppen**. Gruppen sind wie Teams: Wer im Team ist, bekommt die Rechte des Teams.

Wenn du doch mal Admin-Rechte brauchst, setzt du `sudo` vor den Befehl: `sudo apt update`. Das gilt nur für diesen einen Befehl. Mit `su -` wirst du dauerhaft zu root; das solltest du schnell wieder verlassen (`exit`).

Merke: Das Prinzip heißt „**so wenig Rechte wie möglich**“.

## Merksatz
- **root = UID 0, normal ab 1000, System darunter.**
- **id zeigt UID, GID, Gruppen.**
- **sudo für einen Befehl, su - für eine Sitzung.**
- **Geringste Rechte.**

## Prüfungsfalle
- Die UID 0 ist root – auch ein anderer Name mit UID 0 wäre Superuser.
- `/etc/passwd` enthält keine Passwörter (nur `x`), die stehen in `/etc/shadow`.
- `su` ohne `-` übernimmt die Umgebung des alten Benutzers.
- Systembenutzer haben meist Shell `/usr/sbin/nologin`.

## Grafik

### sudo-Ablauf
1. Benutzer -> sudo: sudo apt update
2. sudo -> sudoers: darf der Benutzer das?
3. sudoers -> sudo: ja
4. sudo -> Benutzer: fragt nach eigenem Passwort
5. sudo -> apt: Befehl läuft als root

## Befehle
- `id` – UID/GID/Gruppen
- `whoami` – Benutzername
- `groups` – Gruppen
- `su -` – zu root wechseln
- `sudo befehl` – als root ausführen
- `getent passwd name` – Benutzerdatensatz

## Übungen
- A: Wie zeigst du deine Gruppen? | L: `groups` oder `id`
- A: Welche UID hat root? | L: 0
- A: Wie führst du einen Befehl als root aus? | L: `sudo befehl`

## Karteikarten
- F: Welche UID hat root? | A: 0
- F: Ab welcher UID beginnen normale Benutzer? | A: 1000 (meist).
- F: Was ist ein Systembenutzer? | A: Konto für Dienste, meist ohne Login.
- F: Welche Datei enthält Benutzerdaten? | A: /etc/passwd
- F: Wo liegen Passwort-Hashes? | A: /etc/shadow
- F: Was zeigt id? | A: UID, GID und Gruppen.
- F: Was ist sudo? | A: Führt einen Befehl mit erhöhten Rechten aus.
- F: Was zeigt der Prompt #? | A: Root-Sitzung.
- F: Was ist das Prinzip der geringsten Rechte? | A: Nur nötige Rechte vergeben.
- F: Wo ist die Gruppenliste? | A: /etc/group

## Quiz
? Welche UID hat root?
* 0
- 1
- 100
- 1000

? Wo liegen Passwort-Hashes?
* /etc/shadow
- /etc/passwd
- /etc/group
- /etc/hosts

? Welcher Befehl zeigt UID und Gruppen?
* id
- whoami
- who
- users

? Was macht sudo?
* Führt einen Befehl mit Admin-Rechten aus
- Wechselt Benutzer dauerhaft
- Löscht Konten
- Startet neu

? Warum haben Systembenutzer oft nologin?
* Sie sollen sich nicht interaktiv anmelden
- Sie sind veraltet
- Sie sind root
- Sie haben keine UID

? Wie wird man root mit Login-Umgebung?
* su -
- su
- sudo -u
- root

? Was ist die primäre Gruppe?
* Die Standardgruppe eines Benutzers
- Die Gruppe root
- Die größte Gruppe
- Die erste Datei

? Welcher Prompt-Hinweis zeigt root?
* #
- $
- >
- ~

## Spickzettel
- root 0 · normal ≥1000 · System <1000
- id · groups · whoami
- sudo vs. su -
- passwd/shadow/group
