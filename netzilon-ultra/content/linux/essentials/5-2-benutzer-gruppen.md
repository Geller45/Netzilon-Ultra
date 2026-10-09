---
id: linux-ess-benutzer-gruppen-anlegen
bereich: Linux
fach: Linux I
pruefungen: [LPIC-1, Schule]
block: Linux Essentials
kapitel: Thema 5 – Sicherheit und Dateiberechtigungen
titel: 5.2 Benutzer und Gruppen anlegen
stufe: Einsteiger
quellen: [LPI-Learning-Material-010-160-de.pdf]
verweise: [linux-102-107-1-benutzer,linux-l2-13-benutzer]
---

## Profi

### Lernziel (Gewicht 2)
Benutzer- und Gruppenkonten verwalten.

### Dateien
- `/etc/passwd`: `anna:x:1001:1001:Anna Müller:/home/anna:/bin/bash` (Name, Passwort-Platzhalter, UID, GID, GECOS, Home, Shell). `/etc/shadow`: Name, Hash, Änderungsdatum, min/max/Warnung/Inaktiv/Ablauf. `/etc/group`: `name:x:GID:Mitglieder`. Vorlage fürs Home: `/etc/skel`. Defaults: `/etc/login.defs`, `/etc/default/useradd`.

### Benutzer
- `useradd -m -s /bin/bash -G sudo,docker anna` (m legt Home an, -s Shell, -G Zusatzgruppen, -g primäre Gruppe, -u UID, -c Kommentar). Debian-Komfort: `adduser anna`. `passwd anna` setzt Passwort. `usermod -aG gruppe anna` (**-a** anhängen!), `-L`/`-U` sperren/entsperren, `-s`, `-d`, `-l`. `userdel anna`, `userdel -r anna` (mit Home). `chage` Passwortalter. `chsh` Shell wechseln.

### Gruppen
`groupadd team`, `groupmod -n neu alt`, `groupdel team`, `gpasswd -a anna team`, `newgrp team`. `groups`, `id`, `getent group team`.

### Hinweise
Änderungen an Gruppen wirken erst bei neuer Anmeldung. Löschen von Gruppen ist nicht möglich, solange sie primäre Gruppe eines Benutzers ist.

## Einfach

Damit mehrere Menschen einen Computer gemeinsam nutzen können, bekommt jeder ein **eigenes Konto**. So sind Dateien getrennt und niemand kann versehentlich die Dateien eines anderen löschen.

Ein neues Konto legst du mit `useradd` an. Das Zeichen `-m` bedeutet: „Bau dem Benutzer auch gleich ein Zuhause (Home-Ordner).“ Mit `-s /bin/bash` bekommt er eine Shell. Danach vergibst du ein Passwort: `passwd anna`. Auf Debian gibt es den bequemeren Befehl `adduser anna`, der alles Schritt für Schritt erfragt.

**Gruppen** sind Teams. Du legst eins an mit `groupadd team` und steckst Anna hinein mit `usermod -aG team anna`. Das **-a** ist superwichtig: Es heißt „hinzufügen“. Ohne `-a` würdest du Anna aus allen anderen Gruppen werfen!

Soll jemand nicht mehr rein, kannst du das Konto **sperren** (`usermod -L anna`) oder **löschen** (`userdel -r anna`, das `-r` löscht auch den Home-Ordner).

Alle Konten stehen in der Textdatei `/etc/passwd`, die Gruppen in `/etc/group` und die Passwörter (verschlüsselt) in `/etc/shadow`.

## Merksatz
- **useradd -m, passwd, usermod -aG.**
- **-a nie vergessen bei -G.**
- **userdel -r löscht auch Home.**
- **passwd:group:shadow.**

## Prüfungsfalle
- `usermod -G` ohne `-a` **ersetzt** alle Zusatzgruppen.
- `useradd` ohne `-m` legt kein Home an (Distributionsabhängig).
- Neue Gruppenzugehörigkeit gilt erst nach neuem Login.
- `userdel` ohne `-r` lässt das Home-Verzeichnis zurück.

## Grafik

### Benutzer anlegen
1. Admin -> useradd: useradd -m -s /bin/bash anna
2. useradd -> passwd-Datei: Eintrag in /etc/passwd
3. useradd -> Home: /home/anna aus /etc/skel
4. Admin -> passwd: passwd anna
5. Admin -> usermod: usermod -aG team anna

## Lab
**Maschine**: debian01.
```bash
sudo useradd -m -s /bin/bash anna
sudo passwd anna
sudo groupadd team
sudo usermod -aG team anna
id anna
sudo userdel -r anna
```

## Befehle
- `useradd -m -s /bin/bash name` – Benutzer
- `passwd name` – Passwort
- `usermod -aG gruppe name` – Gruppe hinzufügen
- `groupadd gruppe` – Gruppe anlegen
- `userdel -r name` – löschen mit Home
- `id name` – Konto prüfen

## Übungen
- A: Lege Benutzer bob mit Home und Bash an. | L: `useradd -m -s /bin/bash bob`
- A: Füge bob zur Gruppe dev hinzu, ohne andere Gruppen zu verlieren. | L: `usermod -aG dev bob`
- A: Sperre bob. | L: `usermod -L bob`

## Karteikarten
- F: Welche Option legt das Home an? | A: useradd -m
- F: Wie fügt man einen Benutzer einer Gruppe hinzu? | A: usermod -aG gruppe user
- F: Was passiert bei usermod -G ohne -a? | A: Alle bisherigen Zusatzgruppen werden ersetzt.
- F: Welcher Befehl setzt das Passwort? | A: passwd
- F: Was ist /etc/skel? | A: Vorlage für neue Home-Verzeichnisse.
- F: Wie löscht man Benutzer mit Home? | A: userdel -r
- F: Wie legt man eine Gruppe an? | A: groupadd
- F: Wo stehen Gruppen? | A: /etc/group
- F: Welches Feld ist in /etc/passwd das 3. ? | A: UID
- F: Wie sperrt man ein Konto? | A: usermod -L

## Quiz
? Welche Option legt das Home-Verzeichnis an?
* -m
- -h
- -d
- -H

? Wie fügt man anna ohne Verlust der anderen Gruppen zu team hinzu?
* usermod -aG team anna
- usermod -G team anna
- groupmod team anna
- useradd team anna

? Was steht an 3. Stelle in /etc/passwd?
* UID
- GID
- Shell
- Home

? Was enthält /etc/skel?
* Vorlagedateien für neue Homes
- Alte Konten
- Passwörter
- Shells

? Welcher Befehl löscht Benutzer samt Home?
* userdel -r
- userdel -f
- deluser -h
- rmuser

? Wie sperrt man ein Konto?
* usermod -L
- usermod -U
- passwd -u
- userdel

? Welche Datei enthält Gruppen?
* /etc/group
- /etc/groups
- /etc/gshadow only
- /etc/team

? Wann gilt eine neue Gruppenzugehörigkeit?
* Nach neuer Anmeldung
- Sofort in allen Shells
- Nach Reboot des Routers
- Nie

## Lücken
- Mit {useradd -m} wird ein Benutzer mit Home angelegt.
- {usermod -aG} fügt eine Zusatzgruppe an.
- Passwort-Hashes stehen in {/etc/shadow}.

## Spickzettel
- useradd -m -s · passwd · usermod -aG · userdel -r
- groupadd · gpasswd · id
- passwd/shadow/group
