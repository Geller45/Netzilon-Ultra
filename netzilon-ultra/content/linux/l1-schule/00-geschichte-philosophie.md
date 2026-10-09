---
id: linux-l1-00-geschichte
bereich: Linux
fach: Linux I
pruefungen: [LPIC-1, Schule]
block: L1
kapitel: Linux I – Grundlagen
titel: 1.00 Unix, Linux-Geschichte und Philosophie
stufe: Einsteiger
quellen: [1.00_Linux_-_Geschichte_und_Philosophie.pdf, LPI-Learning-Material-010-160-de.pdf]
verweise: [linux-l1-01-kommandos, linux-101-102-3-libraries, linux-101-102-4-debian-pakete, linux-101-102-5-rpm-pakete, linux-101-104-7-fhs, linux-ess-open-source-lizenzen, ref-linux]
---

## Profi

### Unix – das Fundament
- **Unix** entstand **1969** bei **AT&T Bell Labs** (Ken **Thompson**, Dennis **Ritchie**) auf einer PDP-7, zuerst in Assembler.
- **1973** Neuimplementierung in **C** → erstmals **portabel** zwischen Hardwareplattformen.
- Eigenschaften: **Multiuser** (mehrere Benutzer gleichzeitig) und **Multitasking** (mehrere Programme gleichzeitig), klare Trennung von **Kernel** und **Userland**.
- Heute ist „Unix“ eine Systemfamilie plus ein Standard: **POSIX** (IEEE 1003.1, **1988**) entstand gegen die Zersplitterung.

| Jahr | Ereignis |
|---|---|
| 1969 | Beginn bei Bell Labs (Thompson, Ritchie), PDP-7, Assembler |
| 1973 | Neuschreiben in C – Unix wird portabel |
| ab 1977 | **BSD** (Berkeley Software Distribution) an der UC Berkeley |
| 1983 | AT&T vermarktet **System V** → „Unix-Kriege“ System V vs. BSD; Stallman startet **GNU** |
| 1985 | Gründung der **FSF** (Free Software Foundation) |
| 1988 | **POSIX** |
| 1991 | Linus Torvalds kündigt Linux an (25.08.1991, Usenet **comp.os.minix**), 0.01 im September |
| 1992 | Linux 0.96 mit X11-Unterstützung |
| 1994 | Linux **1.0** (ca. 170.000 Zeilen) |

### Der Unix-Stammbaum
- **System V** (AT&T, kommerziell) → AIX, HP-UX, Solaris.
- **BSD** (universitär) → FreeBSD, NetBSD, OpenBSD, **macOS** (macOS ist sogar **zertifiziertes UNIX**).
- **Linux** (1991) ist eine **Neuimplementierung ohne Unix-Quellcode** – „unix-artig“ (unix-like), POSIX-orientiert, aber **nicht** UNIX-zertifiziert. Linux übernahm die **Ideen**, nicht den Code.

### Die Unix-Philosophie
- **„Do one thing and do it well“** – viele kleine, spezialisierte Werkzeuge statt einer Riesenanwendung.
- Werkzeuge werden über **Pipes** kombiniert: `cut -d: -f7 /etc/passwd | sort | uniq -c` zählt, welche Login-Shells wie oft vorkommen – keines der drei Programme kennt die anderen.
- **Konfiguration über Textdateien** (meist unter `/etc`).
- **„Alles ist eine Datei“** (oder ein Prozess) – auch Geräte (`/dev/sda`) und Kernelinfos (`/proc`).
- Das System erwartet einen **mündigen Benutzer**: Kommandos fragen selten nach („kein Sicherheitsnetz“), es gibt meist **mehrere Wege** zum Ziel.

### Das Schichtenmodell
| Schicht | Beispiele | Bereich |
|---|---|---|
| Anwendungen | `ls`, `cat`, `nano` | User Space |
| Shell | `bash`, `zsh`, `dash`, `ksh` | User Space |
| Bibliotheken | **glibc** (C-Bibliothek) | User Space |
| Kernel & Treiber (Module) | Prozess-/Speicherverwaltung, Dateisysteme, Geräte, Syscalls | **Kernel Space** |
| Hardware | CPU, RAM, Datenträger | – |
- **Kernel Space** = voller Hardwarezugriff, höchste Rechte. **User Space** = alles andere.
- Übergang nur über **Systemaufrufe (Syscalls)** wie `read`, `write`, `open`, `fork`.
- **Treiber** sind Teil des Kernels, oft als **nachladbare Module** (`lsmod`, `modprobe` → 101.1).
- **glibc** übersetzt Funktionsaufrufe (z. B. `printf()`) in Syscalls; dynamische Bibliotheken werden zur Laufzeit geladen (`ldd /bin/ls` → 102.3).
- Die **Shell** liest Befehle, expandiert sie und **startet** Programme. `ls` und `rm` sind **keine** Shells, sondern Programme. Der echte Weg eines Aufrufs: **Programm → glibc → Syscall → Kernel → Hardware** – die Shell ist nur der Starter, nicht der Vermittler.
- Login-Shell jedes Benutzers: 7. Feld in `/etc/passwd`; bekannte Shells: `/etc/shells`.

### GNU, FSF und GPL
- **1983** startet Richard **Stallman** das **GNU-Projekt** („GNU's Not Unix“, rekursives Akronym), Ziel: ein komplett freies Unix. GNU lieferte **bash, gcc, gdb, coreutils** (ls, cp, rm, cat …). Es fehlte nur ein fertiger Kernel (GNU Hurd war nicht fertig) – diese Lücke füllte Linux → Bezeichnung **GNU/Linux**.
- Streng genommen ist **„Linux“ nur der Kernel**.
- **GPL** (GNU General Public License) = **Copyleft**: Quellcode muss verfügbar sein, abgeleitete Werke müssen wieder unter der GPL stehen („Freiheit vererbt sich“). Der **Linux-Kernel steht unter GPL Version 2**.
- **Permissive Lizenzen** (BSD, MIT, Apache) erlauben die Nutzung auch in proprietärer Software (BSD-Code steckt z. B. in macOS).
- **Vier Freiheiten der FSF**: 0 = für jeden Zweck ausführen, 1 = untersuchen und anpassen (Quellcode), 2 = Kopien weitergeben, 3 = Verbesserungen veröffentlichen. „Free as in freedom, not as in free beer.“

### Kernel-Versionen
- **Mainline** (Torvalds integriert neue Funktionen; neue Hauptversion etwa alle 9–10 Wochen), **Stable** (Bugfixes x.y.Z), **LTS/Longterm** (mehrere Jahre Pflege), **EOL** (keine Updates mehr).
- Schema `6.8.12`: Hauptversion.Unterversion.Fehlerkorrektur. Abfrage: `uname -r`. Distributionen liefern oft ältere, lange gepflegte Kernel mit eigenen Patches (z. B. `6.8.0-39-generic`).

### Distributionen
Distribution = **Kernel + Userland (GNU-Tools, Shell, Bibliotheken) + Paketverwaltung + Installer/Konfiguration**, mit Release-Zyklen, Support und Doku.
| Familie | Beispiele | Paketformat | Werkzeuge |
|---|---|---|---|
| Debian | Debian, Ubuntu, Linux Mint | `.deb` | `dpkg`, `apt` (102.4) |
| Red Hat | RHEL, Fedora, Rocky Linux, AlmaLinux | `.rpm` | `rpm`, `dnf` (102.5) |
| SUSE | openSUSE Leap/Tumbleweed, SLES | `.rpm` | `zypper` |
| Unabhängige | Arch (pacman, Rolling Release), Gentoo (Quellcode), Slackware (älteste aktive) | – | – |
Faustregel: Es gibt kein „bestes“ Linux, nur das passende (Einsteiger: Ubuntu/Mint; Server: Debian/RHEL/Alma; Enterprise: RHEL/SLES/Ubuntu LTS; Bleeding Edge: Fedora/Arch/Tumbleweed). Im Kurs: **Ubuntu** (Debian-Welt) und **Rocky/Alma** (Red-Hat-Welt).

### Linux heute und erste Schritte
- **100 % der Top500-Supercomputer**, > 3 Mrd. Android-Geräte, Standard in Server und Cloud (AWS, Azure, GCP), Embedded (Router, Smart-TV, NAS, Autos, Steam Deck). Desktop-Marktanteil klein.
- Prompt lesen: `benutzer@host:verzeichnis$` – **`$` = normaler Benutzer, `#` = root**. `~` = Home-Verzeichnis.
- **root** = Administrator (UID 0, darf alles) vs. normaler Benutzer. **`sudo`** = einzelnen Befehl mit Root-Rechten, **`su`** = komplett zu einem anderen Benutzer wechseln. Moderne Systeme bevorzugen `sudo` (gezielt, protokolliert).
- **Terminal** = das Fenster; **Shell** = das Programm darin, das Befehle interpretiert (`echo $SHELL`).
- **Absoluter Pfad** beginnt mit `/`; **relativer Pfad** geht vom aktuellen Verzeichnis aus (`.` aktuell, `..` übergeordnet, `~` Home).
- Hilfe: `man ls`, `ls --help`, `apropos stichwort`.
- Wichtige Verzeichnisse (FHS → 104.7): `/home`, `/etc`, `/bin` + `/usr/bin`, `/var`, `/root`, `/tmp`.

## Einfach

Stell dir vor, **Unix** ist ein **Urgroßvater** aus dem Jahr 1969. Er hatte eine sehr gute Idee, wie man einen Computer ordnet: Viele **kleine Werkzeuge**, die jeweils **eine Sache richtig gut** können – wie ein **Werkzeugkasten** mit Hammer, Schraubenzieher und Zange statt einem riesigen Wundergerät.

Seine Kinder heißen **System V** und **BSD** (aus dem macOS stammt). **Linux** ist kein leibliches Kind – es ist eher ein **Nachbarskind, das sich alles abgeschaut hat**: Ein finnischer Student, **Linus Torvalds**, hat 1991 ganz neu einen eigenen „Motor“ (den **Kernel**) gebaut, weil er Unix-Ideen mochte, aber kein teures Unix kaufen wollte.

Vorher hatte **Richard Stallman** mit dem **GNU-Projekt** schon fast alle Werkzeuge gebaut: die Shell (bash), den Compiler (gcc), Befehle wie `ls` und `cp`. Nur der Motor fehlte. Linus' Motor + Stallmans Werkzeuge = ein komplettes Auto. Darum sagen manche **GNU/Linux**.

Ein Linux-System ist aufgebaut wie eine **Torte mit Schichten**:
- Ganz unten die **Hardware** (der Teller).
- Darauf der **Kernel** – der **Chef in der Küche**. Nur er darf an Herd und Kühlschrank (Hardware).
- Darüber die **Bibliotheken** – die **Rezeptsammlung**, die alle Köche benutzen.
- Dann die **Shell** – der **Kellner**, der deine Bestellung (Befehl) aufnimmt.
- Oben die **Programme** wie `ls` – die einzelnen Gerichte.
Wenn du etwas bestellst, bringt der Kellner die Bestellung nur in die Küche. Das Kochen macht das Programm mit Hilfe der Rezepte und des Chefs.

Linux ist **frei**. Das heißt nicht nur „kostenlos“, sondern: Du darfst reinschauen, ändern und weitergeben. Die **GPL** ist wie die Regel „**Wer vom Kuchen nimmt und ihn verändert, muss das neue Rezept auch wieder teilen**.“

Eine **Distribution** ist wie ein **fertiges Menü**: Kernel + Werkzeuge + ein „Laden“, aus dem du neue Programme holst (Paketverwaltung). Ubuntu, Debian, Fedora oder Rocky Linux sind verschiedene Menüs aus denselben Zutaten.

Am Terminal siehst du den **Prompt**: `philipp@debian01:~$`. Das **`$`** heißt „du bist ein normaler Benutzer“. Steht dort **`#`**, bist du **root** – der Hausmeister mit dem **Generalschlüssel**. Dann ganz vorsichtig sein!

## Merksatz
- **1969 Unix – 1983 GNU – 1988 POSIX – 1991 Linux – 1994 Linux 1.0**.
- **Linux = nur der Kernel**; Gesamtsystem = GNU/Linux.
- **$ = User, # = root**.
- **Programm → glibc → Syscall → Kernel → Hardware** (die Shell startet nur).
- **GPL = Copyleft**: Wer ändert und weitergibt, muss den Code wieder freigeben.
- **.deb = dpkg/apt, .rpm = rpm/dnf/zypper**.

## Prüfungsfalle
- **„Linux“ ist nicht das Gesamtsystem**, sondern der Kernel.
- **`ls`, `rm`, `cat` sind keine Shells** – Shells sind bash, zsh, dash, ksh (stehen in `/etc/shells`).
- **macOS ist zertifiziertes UNIX, Linux nicht** (nur unix-artig, ohne Unix-Code).
- Jahreszahlen nicht verwechseln: 1983 = GNU, 1988 = POSIX, **1991 = Linux-Posting**, 1994 = Kernel 1.0.
- **Frei ≠ kostenlos** („free as in freedom“).
- Der Kernel steht unter **GPLv2**, nicht GPLv3.
- Angaben wie „20.000 Linux-Anwender 1993“ sind **Schätzungen** – es gab keine Registrierung.

## Grafik

### Systemaufruf durch die Schichten
1. Benutzer -> Shell: tippt `cat notiz.txt`
2. Shell -> Programm: startet /usr/bin/cat (fork + exec)
3. Programm -> glibc: ruft Bibliotheksfunktion auf
4. glibc -> Kernel: Syscall read()
5. Kernel -> Hardware: liest Blöcke von der Festplatte
6. Hardware -> Kernel: liefert Daten
7. Kernel -> Programm: Daten im User Space
8. Programm -> Benutzer: Text erscheint im Terminal

### Unix-Stammbaum
1. Unix: 1969 Bell Labs, ab 1973 in C
2. Unix -> System V: kommerzielle Linie (AIX, HP-UX, Solaris)
3. Unix -> BSD: universitäre Linie (FreeBSD, macOS)
4. GNU: 1983 freie Werkzeuge, aber kein Kernel
5. GNU -> Linux: 1991 Torvalds liefert den Kernel
6. Linux: Distributionen Debian, Red Hat, SUSE

### Pipe-Philosophie
1. cut -> sort: schneidet Spalte 7 (Login-Shell) aus /etc/passwd
2. sort -> uniq: sortiert die Shells
3. uniq: zählt mit -c gleiche Zeilen
4. Ergebnis: drei kleine Werkzeuge, eine Antwort

## Lab
**Maschine**: debian01 (Debian 12/13 oder Ubuntu 24.04 LTS), angemeldet als normaler Benutzer.
1. Auf **debian01**: `uname -s` und `uname -r` – Kernelname und -version ablesen.
2. Auf **debian01**: `whoami`, `pwd`, `echo $SHELL` – Benutzer, Verzeichnis, Shell.
3. Auf **debian01**: `cat /etc/shells` – welche Shells sind installiert?
4. Auf **debian01**: `cut -d: -f7 /etc/passwd | sort | uniq -c` – Login-Shells zählen.
5. Auf **debian01**: `ldd /bin/ls | head -3` – Bibliotheken von ls (libc.so.6).
6. Auf **debian01**: `cat /etc/os-release` – welche Distribution und Version?
7. Auf **debian01**: `ls /` und `man hier` – Verzeichnisbaum ansehen.
```bash
# auf debian01
uname -a
cat /etc/os-release
cut -d: -f7 /etc/passwd | sort | uniq -c
ldd /bin/ls
man -k shell    # entspricht apropos shell
```

## Befehle
- `uname -s` – Kernelname (Linux)
- `uname -r` – Kernel-Release (Version)
- `uname -a` – alle Kernel- und Systeminfos
- `cat /etc/os-release` – Distribution und Version
- `whoami` – aktueller Benutzername
- `pwd` – aktuelles Verzeichnis (print working directory)
- `echo $SHELL` – Login-Shell des Benutzers
- `cat /etc/shells` – gültige Shells des Systems
- `ldd /bin/ls` – benötigte Shared Libraries eines Programms
- `man ls` – Handbuchseite
- `apropos stichwort` – Handbuchseiten nach Stichwort durchsuchen

## Übungen
- A: Was bezeichnet der Begriff „Linux“ streng genommen? (A Gesamtsystem, B nur Kernel, C Distribution, D GNU-Tools) | L: B – nur den Kernel. Das Gesamtsystem entsteht mit dem GNU-Userland, daher „GNU/Linux“.
- A: Welche davon sind Shells: bash, ls, dash, rm, zsh? | L: bash, dash, zsh. ls und rm sind Programme, die von der Shell gestartet werden; Shells stehen in /etc/shells.
- A: In welchem Jahr veröffentlichte Torvalds sein Usenet-Posting? (1983/1988/1991/1994) | L: 1991 (25.08.1991, comp.os.minix). 1983 = GNU, 1988 = POSIX, 1994 = Kernel 1.0.
- A: Was verlangt das Copyleft-Prinzip der GPL von abgeleiteter Software? | L: Sie muss selbst wieder unter der GPL stehen und ihr Quellcode muss verfügbar sein – die Freiheit vererbt sich.
- A: Welches Kommando zeigt das aktuelle Verzeichnis? | L: pwd (print working directory).
- A: Was bedeutet ein # am Ende des Prompts? | L: Man arbeitet als root – jeder Befehl wirkt systemweit.
- A: Welcher Pfad ist absolut: dokumente/datei.txt, ../datei.txt, /home/sebastian/datei.txt, ./datei.txt? | L: /home/sebastian/datei.txt – nur er beginnt mit /.
- A: Mit welchem Befehl öffnest du die Handbuchseite zu ls? | L: man ls (Kurzhilfe: ls --help).

## Karteikarten
- F: Wann und wo entstand Unix? | A: 1969 bei AT&T Bell Labs (Ken Thompson, Dennis Ritchie).
- F: Warum war das Neuschreiben von Unix in C 1973 so wichtig? | A: Unix wurde dadurch portabel – es ließ sich auf andere Hardware übertragen.
- F: Was ist POSIX? | A: Standard (IEEE 1003.1, 1988) für Unix-Schnittstellen gegen die Zersplitterung der Unix-Varianten.
- F: Wer startete 1983 das GNU-Projekt und wofür steht GNU? | A: Richard Stallman; „GNU's Not Unix“ (rekursives Akronym).
- F: Was ist der Unterschied zwischen Kernel Space und User Space? | A: Kernel Space hat vollen Hardwarezugriff und höchste Rechte; User Space enthält Bibliotheken, Shell und Anwendungen. Übergang nur über Syscalls.
- F: Welche Aufgabe hat die glibc? | A: Sie ist die C-Standardbibliothek und übersetzt Funktionsaufrufe der Programme in Systemaufrufe an den Kernel.
- F: Was besagt das Copyleft der GPL? | A: Abgeleitete Werke müssen wieder unter der GPL stehen und ihr Quellcode muss verfügbar sein.
- F: Unter welcher Lizenz steht der Linux-Kernel? | A: GPL Version 2.
- F: Welche Paketformate und Werkzeuge nutzen Debian- und Red-Hat-Familie? | A: Debian: .deb mit dpkg/apt; Red Hat: .rpm mit rpm/dnf (SUSE: zypper).
- F: Woran erkennt man am Prompt, dass man root ist? | A: Am # statt $ am Ende des Prompts.
- F: Was ist der Unterschied zwischen Terminal und Shell? | A: Terminal = das Fenster/Eingabegerät; Shell = das Programm darin (z. B. bash), das Befehle interpretiert.
- F: Nenne die vier Freiheiten der FSF. | A: 0 ausführen für jeden Zweck, 1 untersuchen/anpassen (Quellcode), 2 Kopien weitergeben, 3 Verbesserungen veröffentlichen.
- F: Was bedeuten die Kernel-Zweige Mainline, Stable, LTS und EOL? | A: Mainline = neue Funktionen; Stable = aktuelle Version mit Bugfixes; LTS = mehrere Jahre Pflege; EOL = keine Updates mehr.

## Quiz
? Was bezeichnet „Linux“ streng genommen?
* Nur den Kernel
- Das komplette Betriebssystem mit allen Programmen
- Eine bestimmte Distribution
- Die GNU-Werkzeuge
! Das Gesamtsystem ist Kernel + GNU-Userland = GNU/Linux.

? Welches Programm ist eine Shell?
* dash
- ls
- rm
- cat
! Shells: bash, zsh, dash, ksh – ls, rm, cat sind Programme, die die Shell startet.

? In welchem Jahr kündigte Linus Torvalds Linux an?
* 1991
- 1983
- 1988
- 1994

? Welches Betriebssystem ist offiziell als UNIX zertifiziert?
* macOS
- Debian
- Ubuntu
- Red Hat Enterprise Linux
! Linux-Distributionen sind unix-artig, aber nicht zertifiziert.

? Wie gelangt ein Programm an die Hardware?
* Über Bibliothek (glibc) und Systemaufruf an den Kernel
- Direkt, da es im Kernel Space läuft
- Über die Shell, die jeden Zugriff vermittelt
- Über den Bootloader
! Die Shell startet Programme nur; der Weg ist Programm → glibc → Syscall → Kernel → Hardware.

? Was verlangt die GPL von veränderter, weitergegebener Software?
* Sie muss ebenfalls unter der GPL mit Quellcode verfügbar sein
- Sie muss kostenlos sein
- Sie darf nicht verkauft werden
- Sie darf nur privat genutzt werden

? Welches Werkzeug gehört zur Red-Hat-Familie?
* dnf
- apt
- dpkg
- pacman

? Was zeigt der Prompt `root@debian:/etc#`?
* Benutzer root im Verzeichnis /etc
- Benutzer debian im Home-Verzeichnis
- Einen Kommentar
- Einen Fehler im Verzeichnis /etc

? Welcher Pfad ist absolut?
* /home/sebastian/datei.txt
- ./datei.txt
- ../datei.txt
- dokumente/datei.txt

? Wofür steht die Abkürzung GNU?
* GNU's Not Unix
- General New Unix
- Global Network Utilities
- GNU Native Userland

## Spickzettel
- 1969 Unix (Bell Labs) · 1973 C · 1983 GNU · 1988 POSIX · 1991 Linux · 1994 1.0
- Linux = Kernel (GPLv2); Gesamtsystem GNU/Linux
- Schichten: Hardware → Kernel → glibc → Shell → Anwendungen
- Syscall = einziger Weg in den Kernel Space
- Shells: bash, zsh, dash, ksh (/etc/shells)
- Debian .deb (dpkg/apt) · Red Hat .rpm (rpm/dnf) · SUSE zypper · Arch pacman
- Prompt: $ User, # root, ~ Home
- man, --help, apropos
