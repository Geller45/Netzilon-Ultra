---
id: linux-l1-04-root-sudo
bereich: Linux
fach: Linux I
pruefungen: [LPIC-1, Schule]
block: L1
kapitel: Linux I – Grundlagen
titel: 1.04 Das root-Konto, su, su - und sudo
stufe: Einsteiger
quellen: [1.04_Linux_-_root_su_und_sudo.pdf, LPI-Learning-Material-102-500-de.pdf]
verweise: [linux-l1-00-geschichte, linux-102-110-1-sicherheit-admin, linux-102-105-1-shell-umgebung, linux-l2-13-benutzer, linux-l2-18-sicherheit]
---

## Profi

### Einordnung
Brückenkapitel: su, sudo und `/etc/sudoers` gehören offiziell zu **110.1** (Prüfung 102, Gewicht 3), werden aber ab jetzt ständig gebraucht.

### root – der Superuser
- **root** ist das administrative Konto. Entscheidend ist **nicht der Name, sondern die UID 0**: Für UID 0 werden **Rechteprüfungen übersprungen**. `id root` → `uid=0(root) gid=0(root)`; `/etc/passwd`: `root:x:0:0:root:/root:/bin/bash`.
- Ein **zweites Konto mit UID 0** hätte ebenfalls volle Rechte – darum ist UID 0 so heikel (Prüfen: `awk -F: '$3==0' /etc/passwd`).
- Prompt: **`#` = root**, `$` = normaler Benutzer. root hat **kein Sicherheitsnetz** – keine Rückfrage, kein Papierkorb; Schadsoftware als root übernimmt alles.
- **Least Privilege** (Prinzip der minimalen Rechte): als normaler Benutzer arbeiten, Rechte nur **punktuell** erhöhen. Zwei Wege: **su** (komplett zu einem Konto wechseln – „werden“) und **sudo** (einzelnen Befehl erhöht ausführen – „tun“).

### su – substitute user
| Aufruf | Wirkung |
|---|---|
| `su` | zu root wechseln, **Non-Login-Shell**: deine Umgebung und dein Verzeichnis bleiben |
| `su -` (= `su -l`, `su --login`) | **Login-Shell** des Ziels: lädt dessen Profil, setzt HOME, PATH, wechselt ins Home |
| `su benutzer` / `su - benutzer` | zu einem anderen Benutzer |
| `su -c "befehl" [benutzer]` | nur einen Befehl als Ziel ausführen und zurückkehren |
| `su - postgres -c "psql"` | Befehl mit Login-Umgebung des Ziels |
| `exit` | zurück zum eigenen Konto |
- su fragt das **Passwort des Ziel-Kontos** (für root das root-Passwort). In Teams unpraktisch und unsicher (alle müssten das root-Passwort kennen); kaum Protokollierung. Root selbst kann ohne Passwort per `su` zu jedem Benutzer wechseln.
- Empfehlung für root meist `su -` (saubere, vollständige Umgebung). Es ist dieselbe Login-/Non-Login-Unterscheidung wie bei den Shell-Startdateien (→ 105.1).

### sudo – superuser do
- Führt **einen Befehl** mit erhöhten Rechten aus (Standard: als root), fragt das **eigene Passwort**, jede Aktion wird **protokolliert**. Das Passwort wird zwischengespeichert (Standard **ca. 15 Minuten** pro Terminal, `timestamp_timeout`). Das root-Konto kann gesperrt bleiben (**Ubuntu sperrt root standardmäßig**).

| | su | sudo |
|---|---|---|
| Passwort | des Ziels | **eigenes** |
| Umfang | ganze Shell | einzelner Befehl |
| Granularität | alles oder nichts | fein regelbar |
| Logging | kaum | jede Aktion |

### /etc/sudoers und visudo
- Rechte stehen in **`/etc/sudoers`** und **`/etc/sudoers.d/`**. **Immer mit `visudo` bearbeiten** – prüft die Syntax und sperrt die Datei; ein Syntaxfehler kann **alle aussperren**.
- Zeilensyntax: **`benutzer host=(runas-benutzer:runas-gruppe) befehle`**
```text
sebastian  ALL=(ALL:ALL) ALL
%sudo      ALL=(ALL:ALL) ALL          # Gruppe sudo (Debian/Ubuntu)
%wheel     ALL=(ALL)     ALL          # Gruppe wheel (RHEL/Rocky/Alma)
deploy     ALL=NOPASSWD: /bin/systemctl
```
- `%` kennzeichnet **Gruppen**; **`NOPASSWD:`** erlaubt Befehle ohne Passwort; Befehle immer mit **absolutem Pfad**. Benutzer berechtigen: `usermod -aG sudo benutzer` (Debian) bzw. `usermod -aG wheel benutzer` (RHEL).

### sudo in der Praxis
| Aufruf | Wirkung |
|---|---|
| `sudo -i` | Login-Shell als root (≈ `su -`) |
| `sudo -s` | Shell als root (Umgebung bleibt weitgehend) |
| `sudo -u benutzer befehl` | als anderer Benutzer |
| `sudo -l` | eigene erlaubte Befehle anzeigen |
| `sudo -k` | zwischengespeichertes Passwort verwerfen |
| `sudo !!` | letzten Befehl mit sudo wiederholen |
| `sudoedit datei` / `sudo -e` | Systemdatei sicher im eigenen Editor bearbeiten |

### Best Practices und Nachvollziehbarkeit
- Normal arbeiten, Rechte per sudo holen; **dauerhafte root-Shells** (`sudo su -`, root-Login) vermeiden – „sudo su - für alles“ hebelt Granularität und Log aus (**Antipattern**).
- **Direkten root-Login über SSH sperren** (`PermitRootLogin no` in `/etc/ssh/sshd_config` → 1.19).
- In sudoers nur nötige Rechte vergeben.
- Wer war root? `who` (angemeldet), `w` (wer macht was), `last` (Login-Historie aus `/var/log/wtmp`), sudo-Log in **`/var/log/auth.log`** (Debian) bzw. `/var/log/secure` (RHEL) oder **`journalctl _COMM=sudo`**.

## Einfach

Auf einem Linux-Computer gibt es einen **Hausmeister mit Generalschlüssel**: **root**. Er darf **jede Tür** öffnen, alles umräumen und alles wegwerfen. Erkannt wird er nicht am Namen, sondern an seiner **Ausweisnummer 0** (UID 0). Wer diese Nummer hat, ist Hausmeister.

Das Gefährliche: Der Hausmeister **fragt nie nach**. Sagst du „wirf den Keller weg“, ist der Keller weg. Darum gilt: **Arbeite als normaler Mieter** und hol dir den Generalschlüssel **nur kurz**, wenn du ihn wirklich brauchst. Das nennt man **Least Privilege** (so wenig Macht wie nötig).

Es gibt zwei Wege an den Schlüssel:
- **`su`** ist wie **in die Hausmeister-Uniform schlüpfen**. Du bist dann komplett der Hausmeister, bis du sie wieder ausziehst (`exit`). Dafür musst du aber **das Passwort des Hausmeisters kennen**. Mit **`su -`** ziehst du nicht nur die Uniform an, sondern gehst auch in **sein Büro** und benutzt **seine Werkzeugkiste** (seine Umgebung).
- **`sudo`** ist wie **den Hausmeister bitten: „Mach bitte nur diese eine Tür auf.“** Du sagst dazu **dein eigenes Passwort**. Ob du das darfst, steht auf einer **Liste** (`/etc/sudoers`). Und alles wird in ein **Logbuch** geschrieben.

Die Liste darfst du nur mit **`visudo`** ändern – das ist wie ein Stift, der **Rechtschreibfehler sofort meldet**. Denn wenn die Liste kaputt ist, darf **niemand** mehr den Hausmeister fragen – dann bist du ausgesperrt.

Merke dir den Unterschied: **su = jemand werden**, **sudo = etwas tun lassen**.

## Merksatz
- **UID 0 = root – egal wie das Konto heißt**.
- **su = werden, sudo = tun**.
- **su fragt das Ziel-Passwort, sudo dein eigenes**.
- **su - = mit Koffer umziehen** (Login-Umgebung des Ziels).
- **sudoers nur mit visudo**.
- **sudo -i ≈ su -**.
- **Debian: Gruppe sudo – Red Hat: Gruppe wheel**.

## Prüfungsfalle
- Nicht der Name „root“, sondern **UID 0** verleiht die Rechte.
- **sudo fragt das eigene Passwort**, nicht das root-Passwort.
- **`su` ohne `-`** behält PATH und Verzeichnis des Aufrufers – Befehle in `/usr/sbin` werden dann evtl. nicht gefunden.
- `/etc/sudoers` **nie direkt** mit einem Editor öffnen – immer `visudo`.
- Gruppen in sudoers beginnen mit **`%`**.
- `sudo -l` zeigt **eigene** Rechte, `sudo -k` verwirft den Zeitstempel (nicht „kill“).
- su/sudo/sudoers gehören zu **110.1** (Prüfung 102).
- `sudo su -` funktioniert, ist aber ein **Antipattern** (Logging verloren).

## Grafik

### sudo-Ablauf
1. Benutzer -> sudo: `sudo apt update`
2. sudo -> /etc/sudoers: Darf sebastian diesen Befehl?
3. sudo -> Benutzer: fragt das eigene Passwort
4. sudo -> Log: Eintrag in /var/log/auth.log bzw. Journal
5. sudo -> apt: startet den Befehl mit UID 0
6. apt -> Benutzer: Paketlisten aktualisiert

### su vs. su -
1. Benutzer: sebastian in /home/sebastian
2. Benutzer -> su: Non-Login-Shell, PWD bleibt /home/sebastian
3. su: fragt das root-Passwort
4. Benutzer -> su -: Login-Shell, lädt /root/.profile
5. su -: PWD = /root, HOME und PATH von root
6. Benutzer: exit – zurück zu sebastian

## Lab
**Maschinen**: debian01 (Ubuntu/Debian, Gruppe `sudo`) und rocky01 (Rocky Linux, Gruppe `wheel`). Benutzer `azubi` wird angelegt (Passwort selbst wählen, hier nicht notiert).
```bash
# auf debian01 – root erkennen
whoami; id; id -u root; grep ^root /etc/passwd
awk -F: '$3==0 {print $1}' /etc/passwd     # alle Konten mit UID 0

# auf debian01 – su und su -
pwd; su -c 'pwd; echo $HOME'                # nur wenn root ein Passwort hat
sudo -i; pwd; exit                          # Login-Shell als root

# auf debian01 – Benutzer mit sudo-Recht anlegen
sudo adduser azubi
sudo usermod -aG sudo azubi
su - azubi -c 'sudo -l'

# auf debian01 – eingeschränkte Regel per visudo in eigener Datei
sudo visudo -f /etc/sudoers.d/azubi
#   Inhalt: azubi ALL=(root) NOPASSWD: /usr/bin/systemctl restart ssh
sudo visudo -c                              # Syntax aller sudoers-Dateien prüfen

# auf debian01 – sudo-Praxis
apt update; sudo !!
sudo -u nobody whoami; sudo -k
sudoedit /etc/motd

# auf debian01 – Nachvollziehen
who; w; last -n 5
sudo grep sudo /var/log/auth.log | tail -3
journalctl _COMM=sudo | tail -3

# auf rocky01 – gleiche Rechtevergabe in der Red-Hat-Welt
sudo useradd azubi && sudo passwd azubi
sudo usermod -aG wheel azubi
sudo grep wheel /etc/sudoers
sudo tail -3 /var/log/secure
```

## Befehle
- `id` – UID, GID und Gruppen des aktuellen Benutzers
- `id -u root` – UID von root (immer 0)
- `su` – zu root wechseln, Umgebung bleibt (Non-Login)
- `su -` – Login-Shell als root mit dessen Umgebung
- `su - benutzer -c "befehl"` – Befehl als anderer Benutzer mit Login-Umgebung
- `sudo befehl` – einzelnen Befehl als root, eigenes Passwort
- `sudo -i` – Login-Shell als root
- `sudo -s` – Shell als root
- `sudo -u benutzer befehl` – Befehl als anderer Benutzer
- `sudo -l` – erlaubte sudo-Befehle anzeigen
- `sudo -k` – sudo-Zeitstempel verwerfen
- `sudo !!` – letzten Befehl mit sudo wiederholen
- `sudoedit datei` – Datei sicher als root bearbeiten
- `visudo` – /etc/sudoers mit Syntaxprüfung bearbeiten
- `visudo -c` – sudoers-Syntax prüfen
- `usermod -aG sudo benutzer` – Benutzer in Gruppe sudo aufnehmen (Debian/Ubuntu)
- `usermod -aG wheel benutzer` – Benutzer in Gruppe wheel aufnehmen (RHEL)
- `who` – angemeldete Benutzer
- `w` – angemeldete Benutzer und ihre Aktivität
- `last` – Login-Historie
- `journalctl _COMM=sudo` – sudo-Einträge im Journal

## Übungen
- A: Welche UID hat der Superuser immer? (1, 100, 0, 1000) | L: 0 – daran, nicht am Namen, erkennt das System die volle Berechtigung.
- A: Welches Passwort verlangt sudo standardmäßig? | L: Das eigene; das root-Passwort wird nicht benötigt und root kann gesperrt bleiben.
- A: Was unterscheidet su - von su? | L: su - startet eine Login-Shell mit Profil, HOME, PATH und Verzeichnis des Ziels; su behält die eigene Umgebung.
- A: Mit welchem Befehl editiert man /etc/sudoers sicher? | L: visudo – prüft Syntax und sperrt die Datei.
- A: Der Benutzer deploy soll nur systemctl ohne Passwort ausführen dürfen. Schreibe die sudoers-Zeile. | L: deploy ALL=NOPASSWD: /bin/systemctl (bzw. /usr/bin/systemctl)
- A: Du hast apt upgrade ohne Rechte eingegeben. Wie wiederholst du es am schnellsten mit sudo? | L: sudo !!
- A: Wie startest du psql als Benutzer postgres? | L: sudo -u postgres psql oder su - postgres -c "psql"
- A: Wo findest du auf Debian, wer sudo benutzt hat? | L: /var/log/auth.log oder journalctl _COMM=sudo

## Karteikarten
- F: Woran erkennt Linux den Superuser? | A: An der UID 0, nicht am Namen root.
- F: Was besagt das Prinzip Least Privilege? | A: Nur so viele Rechte wie nötig und nur so lange wie nötig – normal als Benutzer arbeiten, punktuell erhöhen.
- F: Welches Passwort fragt su ab? | A: Das Passwort des Ziel-Kontos (für root das root-Passwort).
- F: Was bewirkt su - gegenüber su? | A: Login-Shell: Profil, HOME, PATH und Arbeitsverzeichnis des Ziels werden gesetzt.
- F: Wo stehen die sudo-Rechte? | A: In /etc/sudoers und /etc/sudoers.d/.
- F: Wie ist eine sudoers-Zeile aufgebaut? | A: benutzer host=(runas) befehle, z. B. sebastian ALL=(ALL:ALL) ALL.
- F: Wie kennzeichnet man in sudoers eine Gruppe? | A: Mit %, z. B. %sudo oder %wheel.
- F: Was bedeutet NOPASSWD: in sudoers? | A: Die genannten Befehle dürfen ohne Passworteingabe ausgeführt werden.
- F: Was macht sudo -i? | A: Startet eine Login-Shell als root (vergleichbar mit su -).
- F: Was zeigt sudo -l? | A: Welche Befehle der aktuelle Benutzer per sudo ausführen darf.
- F: Warum ist sudo su - ein Antipattern? | A: Man arbeitet dauerhaft als root; Granularität und detailliertes Logging von sudo gehen verloren.
- F: Wie lange merkt sich sudo standardmäßig das Passwort? | A: Etwa 15 Minuten pro Terminal (timestamp_timeout).
- F: Welche Admin-Gruppe nutzen Debian/Ubuntu und RHEL? | A: Debian/Ubuntu: sudo; RHEL/Rocky/Alma: wheel.

## Quiz
? Welche UID hat der Superuser?
* 0
- 1
- 100
- 1000

? Welches Passwort verlangt sudo standardmäßig?
* Das eigene Passwort des Benutzers
- Das root-Passwort
- Kein Passwort
- Ein Einmalcode

? Was unterscheidet `su -` von `su`?
* su - startet eine Login-Shell mit der Umgebung des Zielbenutzers
- su - ist nur schneller
- su - fragt kein Passwort
- Es gibt keinen Unterschied

? Wie bearbeitet man /etc/sudoers sicher?
* visudo
- nano /etc/sudoers
- sudoedit /etc/sudoers.d
- chmod 640 /etc/sudoers

? Was bewirkt die Zeile `%wheel ALL=(ALL) ALL`?
* Alle Mitglieder der Gruppe wheel dürfen alle Befehle als jeder Benutzer ausführen
- Der Benutzer wheel darf alles
- Die Gruppe wheel darf nichts
- Nur root darf wheel-Befehle ausführen

? Welcher Befehl zeigt die eigenen sudo-Berechtigungen?
* sudo -l
- sudo -k
- sudo -i
- sudo -s

? Welcher Befehl verwirft das zwischengespeicherte sudo-Passwort?
* sudo -k
- sudo -l
- sudo -e
- sudo -r

? Wo protokolliert Debian sudo-Aufrufe klassisch?
* /var/log/auth.log
- /var/log/sudo.conf
- /etc/sudoers.log
- /var/log/boot.log

? Was zeigt der Befehl `last`?
* Die Login-Historie der Benutzer
- Den zuletzt ausgeführten Befehl
- Die letzte Zeile einer Datei
- Den letzten sudo-Aufruf

? Was ist der Hauptvorteil von sudo gegenüber su im Team?
* Niemand muss das root-Passwort kennen und jede Aktion wird protokolliert
- sudo ist schneller
- sudo braucht keine Konfiguration
- sudo funktioniert auch ohne Benutzerkonto

## Spickzettel
- root = UID 0 · Prompt # · kein Sicherheitsnetz
- su = werden (Ziel-Passwort) · su - = Login-Shell · su -c "cmd"
- sudo = tun (eigenes Passwort, Log, ~15 min Cache)
- sudo -i ≈ su - · -s Shell · -u user · -l Rechte · -k vergessen · sudo !!
- /etc/sudoers + /etc/sudoers.d/ nur mit visudo (-c prüfen)
- Syntax: user host=(runas) befehle · %gruppe · NOPASSWD:
- Debian %sudo · RHEL %wheel · Ubuntu: root gesperrt
- who · w · last · /var/log/auth.log · journalctl _COMM=sudo
