---
id: linux-102-107-1-benutzer
bereich: Linux
fach: Linux II
pruefungen: [LPIC-1]
block: LPIC-102
kapitel: LPIC-1 Prüfung 102 – Administrative Aufgaben
titel: 107.1 Benutzer- und Gruppenkonten verwalten
stufe: Fortgeschritten
quellen: [LPI-Learning-Material-102-500-de.pdf, 1.13_Linux_-_Benutzer_und_Gruppen_Szenario.pdf]
verweise: [linux-l2-13-benutzer, linux-l1-04-root-sudo, linux-102-110-1-sicherheit-admin]
---

## Profi

### Lernziel (Gewicht 5)
Benutzer und Gruppen anlegen, ändern, sperren, löschen; Systemdateien, Passwort-Aging, Dienstkonten. Das schwerste Einzelthema der Prüfung 102 (Kurzfassung; Szenario-Vertiefung in 1.13).

### Dateien
| Datei | Inhalt |
|---|---|
| `/etc/passwd` | `name:x:UID:GID:Kommentar:Home:Shell` (7 Felder, für alle lesbar) |
| `/etc/shadow` | `name:Hash:letzte Änderung:min:max:warn:inaktiv:ablauf` (nur root; `!`/`*` = gesperrt) |
| `/etc/group` | `gruppe:x:GID:Mitglieder` |
| `/etc/gshadow` | Gruppenpasswörter/Admins |
| `/etc/login.defs`, `/etc/default/useradd`, `/etc/skel` | Voreinstellungen, Vorlagen |
- UID-Bereiche: 0 root, 1–999 Systemkonten (`UID_MIN` 1000 für Benutzer, Debian/RHEL 1000), ab 1000 normale Benutzer. Dienstkonten haben Shell `/usr/sbin/nologin` oder `/bin/false`.

### Befehle
- `useradd -m -s /bin/bash -G dev -c "Anna Berger" anna` (`-m` Home anlegen, `-G` Zusatzgruppen, `-u`, `-g`, `-d`, `-e` Ablaufdatum, `-r` Systemkonto), `passwd anna`, `usermod -aG gruppe anna` (**-a mit -G!**), `usermod -L/-U` (sperren/entsperren), `usermod -s`, `usermod -l neu alt`, `userdel -r anna` (mit Home), `groupadd`, `groupmod`, `groupdel`, `gpasswd -a/-d user gruppe`, `chsh`, `chfn`, `id`, `groups`, `getent passwd`.
- Debian-Komfort: `adduser`, `deluser`. **Passwort-Aging**: `chage -l anna`, `chage -M 90 -W 7 -I 14 -E 2026-12-31 anna`, `chage -d 0 anna` (Passwortwechsel erzwingen). Hash-Prefix `$6$` = SHA-512, `$y$` = yescrypt.
- Eingeloggte: `who`, `w`, `last`, `lastlog`. PAM (`/etc/pam.d/`) und LDAP/NSS (`/etc/nsswitch.conf`) für zentrale Konten.

## Einfach

Jeder Mensch (oder Dienst), der den Computer benutzt, braucht ein **Konto** – wie ein **Mitgliedsausweis** im Verein. Auf dem Ausweis steht: Name, Nummer (UID), zu welcher Gruppe man gehört, wo das Zimmer ist (Home) und welche Sprache man spricht (Shell).

Diese Ausweise liegen in einer öffentlichen Liste, `/etc/passwd`. Die **Passwörter** aber stehen in einem Tresor, `/etc/shadow`, den nur der Chef (root) öffnen darf – dort steht nur ein Fingerabdruck (Hash) des Passworts, nie das Passwort selbst.

Mit **`useradd`** stellst du neue Ausweise aus, mit **`passwd`** gibst du ihnen ein Passwort, mit **`usermod`** änderst du sie, mit **`userdel`** wirfst du Mitglieder hinaus. **Gruppen** sind Vereinsabteilungen: `groupadd dev`, und mit `usermod -aG dev anna` nimmst du Anna in die Abteilung auf. Das **a** (append = anhängen) ist wichtig: Ohne es wirft Linux Anna aus allen anderen Abteilungen!

Du kannst Passwörter auch **ablaufen lassen** (`chage`): „Alle 90 Tage ändern, 7 Tage vorher warnen.“ Und mit `usermod -L` sperrst du ein Konto, ohne es zu löschen.

Dienste (z. B. der Webserver) bekommen eigene Konten ohne Anmeldung, damit sie nur das dürfen, was sie sollen.

## Merksatz
- **passwd öffentlich, shadow geheim.**
- **7 Felder in passwd, 9 in shadow.**
- **usermod -aG, nie -G allein!**
- **useradd -m legt das Home an.**
- **userdel -r löscht auch das Home.**
- **chage steuert Passwort-Aging.**

## Prüfungsfalle
- `usermod -G` **ersetzt** die Gruppenliste, `-aG` hängt an.
- `useradd` ohne `-m` legt kein Home an (RHEL meist doch, Debian nicht).
- `userdel` ohne `-r` lässt das Home liegen.
- Ein `!` oder `*` im Passwortfeld = gesperrt/kein Login per Passwort; gesperrtes Konto kann trotzdem SSH-Key nutzen.
- `passwd -l` sperrt nur das Passwort.
- UID 0 = root, normale Benutzer ab **1000**.
- Fremde Dateien nach `userdel` bleiben mit der alten UID zurück.
- `/etc/passwd` ist für alle lesbar, aber die Hashes stehen in `/etc/shadow`.

## Grafik

### Benutzer anlegen
1. Admin -> useradd: useradd -m -G dev anna
2. useradd -> /etc/passwd: neue Zeile mit UID 1001
3. useradd -> /etc/shadow: Eintrag mit gesperrtem Passwort
4. useradd -> /home/anna: Home aus /etc/skel kopiert
5. Admin -> passwd: passwd anna setzt den Hash
6. Admin -> chage: chage -M 90 anna

## Lab
**Maschine**: debian01.
```bash
# auf debian01
sudo groupadd dev
sudo useradd -m -s /bin/bash -G dev -c "Anna Berger" anna
sudo passwd anna
id anna; getent passwd anna; sudo grep anna /etc/shadow
sudo usermod -aG sudo anna
sudo chage -l anna; sudo chage -M 90 -W 7 anna
sudo usermod -L anna; sudo passwd -S anna; sudo usermod -U anna
sudo userdel -r anna
```

## Befehle
- `useradd -m -G g user` – Benutzer anlegen
- `passwd user` – Passwort setzen
- `usermod -aG g user` – Gruppe hinzufügen
- `usermod -L user` – sperren
- `userdel -r user` – löschen mit Home
- `groupadd g` – Gruppe anlegen
- `chage -l user` – Aging anzeigen
- `id user` – UID/GID/Gruppen
- `getent passwd user` – Eintrag abfragen

## Übungen
- A: Füge anna der Gruppe dev hinzu, ohne andere Gruppen zu entfernen. | L: usermod -aG dev anna
- A: Wie viele Felder hat eine passwd-Zeile? | L: 7
- A: Erzwinge einen Passwortwechsel beim nächsten Login. | L: chage -d 0 anna
- A: Wie sperrst du das Konto leo? | L: usermod -L leo (passwd -l leo)
- A: Wie legst du ein Systemkonto ohne Anmeldung an? | L: useradd -r -s /usr/sbin/nologin dienst

## Karteikarten
- F: Welche Felder hat /etc/passwd? | A: name:x:UID:GID:Kommentar:Home:Shell
- F: Wo stehen die Passwort-Hashes? | A: /etc/shadow
- F: Was bewirkt useradd -m? | A: Legt das Home-Verzeichnis an (Kopie aus /etc/skel).
- F: Was bewirkt usermod -aG? | A: Hängt Zusatzgruppen an, ohne bestehende zu entfernen.
- F: Wie zeigt man UID und Gruppen an? | A: id
- F: Was macht chage -M 90? | A: Passwort läuft nach maximal 90 Tagen ab.
- F: Was bedeutet ! vor dem Hash? | A: Passwort/Konto gesperrt.
- F: Was macht userdel -r? | A: Löscht Konto und Home-Verzeichnis.
- F: Wo stehen Gruppen? | A: /etc/group (und gshadow)
- F: Was bewirkt gpasswd -a? | A: Fügt einen Benutzer einer Gruppe hinzu.

## Quiz
? Wie fügt man anna einer Gruppe hinzu, ohne andere Gruppen zu verlieren?
* usermod -aG gruppe anna
- usermod -G gruppe anna
- groupmod anna gruppe
- usermod -g gruppe anna

? Wo stehen Passwort-Hashes?
* /etc/shadow
- /etc/passwd
- /etc/group
- /etc/login.defs

? Wie viele Felder hat /etc/passwd pro Zeile?
* 7
- 5
- 9
- 6

? Welche Option von useradd legt das Home an?
* -m
- -h
- -d
- -H

? Was macht chage -d 0 anna?
* Erzwingt Passwortwechsel beim nächsten Login
- Löscht das Passwort
- Sperrt das Konto
- Löscht das Home

? Welche Shell eignet sich für Dienstkonten?
* /usr/sbin/nologin
- /bin/bash
- /bin/zsh
- /usr/bin/vi

? Wie löscht man Konto und Home?
* userdel -r
- userdel -f
- userdel -h
- deluser -x

? Welche UID hat root?
* 0
- 1
- 1000
- 100

## Spickzettel
- passwd 7 Felder · shadow Hashes (root) · group
- useradd -m -s -G -c · passwd · usermod -aG -L -U · userdel -r
- groupadd/mod/del · gpasswd
- chage -l -M -W -E -d 0 · id · getent
- UID 0 root · <1000 System
