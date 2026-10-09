---
id: linux-102-105-1-shell-umgebung
bereich: Linux
fach: Linux II
pruefungen: [LPIC-1]
block: LPIC-102
kapitel: LPIC-1 Prüfung 102 – Shells und Skripte
titel: 105.1 Die Shell-Umgebung anpassen und verwenden
stufe: Fortgeschritten
quellen: [LPI-Learning-Material-102-500-de.pdf, 1.20_Linux_-_Shell-Scripting_Szenario.pdf]
verweise: [linux-l2-20-shell-scripting, linux-102-105-2-skripte, linux-101-103-1-befehlszeile]
---

## Profi

### Lernziel (Gewicht 4)
Umgebungsvariablen, Startdateien, Aliase, Funktionen und Vorlagen für neue Benutzer.

### Variablen
- **Shell-Variable**: `VAR=wert` (nur aktuelle Shell). **Umgebungsvariable**: `export VAR=wert` oder `export VAR` (an Kindprozesse). Anzeige: `env`, `printenv`, `set` (alle inkl. Shell-Variablen), `echo $VAR`; entfernen `unset VAR`. Wichtig: `PATH`, `HOME`, `USER`, `SHELL`, `PWD`, `OLDPWD`, `LANG`, `PS1`, `EDITOR`, `HISTSIZE`.
- `PATH=$PATH:/opt/bin` erweitert den Suchpfad; für Dauer in Startdatei eintragen.

### Startdateien (bash)
| Art | Dateien (Reihenfolge) |
|---|---|
| **Login-Shell** | `/etc/profile` (+ `/etc/profile.d/*.sh`) → erste vorhandene von `~/.bash_profile`, `~/.bash_login`, `~/.profile` |
| **Interaktive Non-Login-Shell** | `/etc/bash.bashrc` (Debian) bzw. `/etc/bashrc`, dann `~/.bashrc` |
| Logout | `~/.bash_logout` |
- Aufruf `bash -l` / `su -` / `sudo -i` = Login; `su` ohne `-` = Non-Login. `source ~/.bashrc` (oder `. ~/.bashrc`) lädt neu.
- **/etc/skel/** liefert Vorlagen, die `useradd -m` ins neue Home kopiert.

### Aliase und Funktionen
- `alias ll='ls -lah'`, `alias` listet, `unalias ll`; `type ll`. Funktionen: `mkcd() { mkdir -p "$1" && cd "$1"; }`; `declare -f`. Dauerhaft in `~/.bashrc`.

## Einfach

Wenn du dich anmeldest, **richtet sich die Shell ihr Zimmer ein**: Sie liest ein paar Zettel mit Wünschen. Bei einer richtigen **Anmeldung** (Login) liest sie zuerst den Zettel für alle (`/etc/profile`) und dann deinen persönlichen (`~/.bash_profile` oder `~/.profile`). Wenn du aber nur ein **neues Terminalfenster** aufmachst, liest sie bloß `~/.bashrc`.

Trick: Viele Leute lassen den Login-Zettel einfach auf die `.bashrc` verweisen, damit überall dieselben Abkürzungen gelten.

**Variablen** sind beschriftete Schachteln: `NAME="Anna"`. Normalerweise sieht nur die Shell selbst hinein. Mit `export NAME` stellst du die Schachtel auch den **Kindprogrammen** hin, die du startest. Die wichtigste Schachtel ist `PATH`: Dort steht, in welchen Ordnern die Shell nach Programmen sucht.

Ein **Alias** ist ein Spitzname: `alias ll='ls -l'`. Eine **Funktion** ist ein kleines Programm mit Namen, das du selbst baust, z. B. um einen Ordner anzulegen und gleich hineinzuwechseln.

Und wie bekommen neue Benutzer ihre Zettel? Aus dem **Vorlagenordner** `/etc/skel`: Alles, was dort liegt, wird beim Anlegen eines Benutzers (`useradd -m`) in dessen Home kopiert. So hat jeder neue Benutzer sofort eine passende Grundausstattung.

## Merksatz
- **Login: profile, Fenster: bashrc.**
- **export = für Kinder sichtbar.**
- **/etc/skel = Vorlage für neue Homes.**
- **source lädt neu.**
- **alias für Abkürzungen, Funktionen für mehr.**

## Prüfungsfalle
- Die Login-Shell liest nur die **erste vorhandene** der drei Benutzerdateien.
- `su` ohne `-` = **Non-Login**, `su -` = Login.
- Änderungen an `/etc/skel` wirken **nur für neue** Benutzer.
- `export VAR` ohne Zuweisung ist erlaubt (exportiert vorhandenen Wert).
- Aliase und Funktionen gelten nur in der Shell, nicht in Skripten (außer definiert).
- `set` zeigt auch nicht exportierte Variablen, `env` nur die Umgebung.

## Grafik

### Startdateien bei Login
1. Benutzer -> Login-Shell: Anmeldung
2. Login-Shell -> /etc/profile: systemweite Einstellungen
3. Login-Shell -> ~/.bash_profile: erste vorhandene Benutzerdatei
4. ~/.bash_profile -> ~/.bashrc: source ~/.bashrc
5. Login-Shell: Prompt, Aliase, Funktionen sind aktiv

## Lab
**Maschine**: debian01.
```bash
# auf debian01
echo $PATH; env | head
MEINE=wert; bash -c 'echo [$MEINE]'; export MEINE; bash -c 'echo [$MEINE]'
echo "alias ll='ls -lah'" >> ~/.bashrc
echo 'mkcd() { mkdir -p "$1" && cd "$1"; }' >> ~/.bashrc
source ~/.bashrc; ll; mkcd /tmp/x/y
ls -la /etc/skel
```

## Befehle
- `export VAR=wert` – Umgebungsvariable
- `env`, `printenv`, `set` – Variablen anzeigen
- `unset VAR` – entfernen
- `alias`/`unalias` – Aliase
- `source datei` – laden
- `bash -l` – Login-Shell
- `ls -la /etc/skel` – Vorlagen

## Übungen
- A: Wie machst du PATH für alle neuen Terminalfenster um /opt/bin länger? | L: export PATH=$PATH:/opt/bin in ~/.bashrc
- A: Welche Datei liest eine Non-Login-Shell? | L: ~/.bashrc
- A: Wie zeigst du nur exportierte Variablen? | L: env oder printenv
- A: Wo liegen Vorlagen für neue Benutzer? | L: /etc/skel
- A: Wie lädst du ~/.bashrc neu? | L: source ~/.bashrc

## Karteikarten
- F: Welche Datei liest eine Login-Shell zuerst? | A: /etc/profile
- F: Was bewirkt export? | A: Variable an Kindprozesse vererben.
- F: Was ist /etc/skel? | A: Vorlageverzeichnis, dessen Inhalt in neue Homes kopiert wird.
- F: Was ist ein Alias? | A: Ein Spitzname für einen Befehl.
- F: Welche Variable bestimmt den Suchpfad für Programme? | A: PATH
- F: Welche Datei läuft beim Logout? | A: ~/.bash_logout
- F: Unterschied env/set? | A: env zeigt Umgebung, set zusätzlich Shell-Variablen und Funktionen.
- F: Wie ruft man eine Login-Shell auf? | A: bash -l oder su -
- F: Welche Variable steuert den Prompt? | A: PS1

## Quiz
? Welche Datei liest eine interaktive Non-Login-Shell?
* ~/.bashrc
- /etc/profile
- ~/.profile
- ~/.bash_logout

? Was bewirkt export?
* Vererbt eine Variable an Kindprozesse
- Löscht eine Variable
- Speichert in Datei
- Setzt PATH zurück

? Wo liegen Vorlagen für neue Benutzer?
* /etc/skel
- /etc/default
- /usr/share/home
- /var/skel

? Wie lädt man ~/.bashrc in der aktuellen Shell neu?
* source ~/.bashrc
- bash ~/.bashrc
- exec ~/.bashrc
- reload

? Welcher Befehl listet Aliase?
* alias
- aliases
- env -a
- type -a

? Welche Variable steuert den Prompt?
* PS1
- PS0
- PROMPT
- TERM

? Wirkt eine Änderung in /etc/skel auf bestehende Benutzer?
* Nein, nur auf neu angelegte
- Ja, sofort
- Ja, nach Neustart
- Nur auf root

? Welche Aussage zu su ist richtig?
* su - startet eine Login-Shell
- su startet immer Login-Shell
- su - ist Non-Login
- su - liest nur .bashrc

## Spickzettel
- VAR=x · export · env · set · unset
- Login: /etc/profile → ~/.bash_profile|.bash_login|.profile
- Non-Login: ~/.bashrc · Logout: ~/.bash_logout
- /etc/skel · alias · Funktionen · source
