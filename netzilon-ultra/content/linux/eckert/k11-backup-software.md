---
id: linux-eckert-k11-kompression-backup-software
bereich: Linux
fach: Linux I
pruefungen: [LPIC-1, Schule]
block: CompTIA Linux+ / LPIC-1 (Eckert)
kapitel: Eckert – CompTIA Linux+ and LPIC-1 (6th Edition)
titel: Kap. 11 Kompression, Backup und Softwareinstallation
stufe: Fortgeschritten
quellen: [Eckert_J._W._and_triOS_College_-_CompTIA_Linux_and_LPIC-1_6th_Edition_-_2024.pdf]
verweise: [linux-ess-archivieren,linux-101-102-4-debian-pakete,linux-101-102-5-rpm-pakete]
---

## Profi

### Kompression
Werkzeuge mit unterschiedlichen Algorithmen und Kompressionsraten: `compress` (.Z, veraltet), `gzip` (.gz), `bzip2` (.bz2), `xz` (.xz), `zip`/`unzip`. Typische Rangfolge der Rate: gzip < bzip2 < xz. `zcat`, `bzcat`, `xzcat`.

### Backup
Sicherung auf Archive/Medien. **tar** (Tape Archive): `-c`, `-x`, `-t`, `-v`, `-f`, `-z/-j/-J`, `-C`, `--exclude`, `-u`/`-r` (aktualisieren/anhängen), **Tarball** `.tar.gz`. Weitere: `cpio`, `dd` (Blockkopie, Images: `dd if=/dev/sda of=disk.img bs=4M`), `rsync -avz --delete`, `dump`/`restore`. Für CD/DVD braucht man Brennsoftware (`mkisofs`, `growisofs`), kein Backup-Tool. Strategien: **Voll**, **differenziell**, **inkrementell**; 3-2-1-Regel. Backups testen (Restore).

### Quellcode installieren
Tarball von Webseite oder **GitHub** (`git clone`) entpacken, dann typisch `./configure`, `make`, `sudo make install`. Abhängigkeiten (Compiler, Header) nötig.

### Paketverwaltung
- **RPM** (RHEL/Fedora/SUSE): `rpm -ivh/-Uvh/-e`, Abfragen `rpm -qa`, `-qi`, `-ql`, `-qf datei`, `-V`; Repository-Tools `dnf`/`yum`/`zypper` (`install`, `update`, `remove`, `search`, `info`, `provides`). Repositories `/etc/yum.repos.d/`.
- **DPM/DEB** (Debian/Ubuntu): `dpkg -i`, `-r`, `-P`, `-l`, `-L`, `-S`, `--configure`; `apt update`, `apt upgrade`, `apt install/remove/purge/autoremove`, `apt search/show`, `apt-get`. Quellen `/etc/apt/sources.list(.d)`.

### Bibliotheken
Programme nutzen **Shared Libraries** (`.so`); `ldd programm`, `ldconfig`, `/etc/ld.so.conf`, `LD_LIBRARY_PATH`. Entfernen einer Bibliothek bricht abhängige Programme.

### Sandboxed Apps
**Flatpak**, **Snap**, **AppImage**: enthalten alle Abhängigkeiten, laufen isoliert, unabhängig von der Distribution (`flatpak install`, `snap install`, AppImage ausführbar machen).

## Einfach

Dieses Kapitel hat drei Teile: **Packen**, **Sichern** und **Installieren**.

**Packen:** Dateien lassen sich mit `gzip`, `bzip2` oder `xz` verkleinern. Je stärker die Kompression, desto länger dauert sie. `xz` komprimiert meist am stärksten.

**Sichern:** Ein Backup ist deine Versicherung gegen Datenverlust. Das Standardwerkzeug ist `tar`: Es bündelt viele Dateien zu einem **Tarball** (`.tar.gz`). Für Kopien auf andere Rechner nutzt man `rsync`, das nur Änderungen überträgt. Mit `dd` kopierst du ganze Platten Bit für Bit. Man unterscheidet **Vollbackup** (alles), **differenziell** (alles seit dem letzten Voll-Backup) und **inkrementell** (nur seit dem letzten Backup, egal welcher Art). Wichtig: Ein Backup, das nie getestet wurde, ist keins.

**Installieren:** Programme kommen üblicherweise als **Pakete**. Debian und Ubuntu nutzen `.deb` mit `apt`, Fedora und RHEL nutzen `.rpm` mit `dnf`. Der Paketmanager holt auch benötigte Hilfsprogramme (Abhängigkeiten) automatisch. Manchmal baut man Software selbst aus dem **Quellcode**: `./configure`, `make`, `make install`.

Neu sind **Flatpak**, **Snap** und **AppImage**: Sie bringen alles mit, was sie brauchen, und laufen überall gleich, ähnlich wie eine Lunchbox mit allem Besteck.

## Merksatz
- **gzip schnell, bzip2 stärker, xz am stärksten.**
- **Voll, differenziell (seit Voll), inkrementell (seit letztem).**
- **Debian: apt/dpkg · Red Hat: dnf/rpm.**
- **configure → make → make install.**

## Prüfungsfalle
- Differenziell sichert seit dem **letzten Vollbackup**, inkrementell seit dem **letzten beliebigen** Backup.
- `dpkg -i` löst Abhängigkeiten **nicht** auf, `apt install` schon.
- `rpm -qf datei` zeigt das Paket, das eine Datei enthält.
- `tar` allein komprimiert nicht.
- `apt remove` lässt Konfigurationsdateien, `apt purge` löscht sie.

## Grafik

### Backup-Strategien
1. Sonntag: Vollbackup aller Daten
2. Montag: inkrementell: nur Änderungen seit Sonntag
3. Dienstag: inkrementell: nur Änderungen seit Montag
4. Wiederherstellung: Voll + alle Inkremente in Reihenfolge

## Lab
**Maschine**: debian01.
```bash
tar -czvf /tmp/etc.tar.gz /etc
tar -tzf /tmp/etc.tar.gz | head
rsync -av /home/philipp/ /tmp/backup/
sudo apt update && sudo apt install tree
dpkg -l | grep tree
dpkg -S /usr/bin/tree
apt-cache policy tree
```

## Befehle
- `tar -czvf a.tar.gz dir` – packen
- `rsync -avz quelle ziel` – synchronisieren
- `dd if=/dev/sda of=img bs=4M` – Image
- `apt install paket` – Debian
- `dnf install paket` – Fedora/RHEL
- `rpm -qa` – installierte RPMs
- `dpkg -l` – installierte DEBs
- `ldd /bin/ls` – Bibliotheken

## Übungen
- A: Welcher Befehl zeigt, zu welchem Paket /bin/ls gehört (Debian)? | L: `dpkg -S /bin/ls`
- A: Wie sicherst du /home inkrementell? | L: mit `tar --listed-incremental=snap.file -czf …` oder `rsync`
- A: Was tut `make install`? | L: Kopiert das kompilierte Programm an seinen Zielort.

## Karteikarten
- F: Was ist ein Tarball? | A: Mit tar erstelltes (meist komprimiertes) Archiv.
- F: Welche Kompression ist meist am stärksten? | A: xz
- F: Was ist ein differenzielles Backup? | A: Alle Änderungen seit dem letzten Vollbackup.
- F: Was ist ein inkrementelles Backup? | A: Änderungen seit dem letzten Backup.
- F: Was macht rsync? | A: Synchronisiert Verzeichnisse, überträgt nur Unterschiede.
- F: Welches Paketformat nutzt Debian? | A: DEB (dpkg/apt).
- F: Welches Paketformat nutzt Fedora? | A: RPM (dnf/rpm).
- F: Was zeigt ldd? | A: Benötigte Shared Libraries eines Programms.
- F: Was ist Flatpak? | A: Sandbox-Paketformat mit allen Abhängigkeiten.
- F: Was macht apt purge? | A: Entfernt Paket samt Konfiguration.

## Quiz
? Welches Backup sichert alle Änderungen seit dem letzten Vollbackup?
* Differenziell
- Inkrementell
- Spiegel
- Snapshot

? Welcher Befehl zeigt Bibliotheksabhängigkeiten?
* ldd
- lsmod
- ldconfig -p
- rpm -qR

? Welcher Befehl installiert ein Paket mit Abhängigkeiten unter Debian?
* apt install
- dpkg -i
- rpm -i
- make install

? Welche Kompression erreicht meist die beste Rate?
* xz
- gzip
- compress
- zip -1

? Was ist ein Tarball?
* Ein mit tar erzeugtes Archiv
- Ein Paket-Repository
- Ein Image
- Ein Skript

? Welche Befehlsfolge baut Quellcode?
* ./configure, make, make install
- make, configure, install
- build, run
- cmake -a

? Was ist AppImage?
* Eine ausführbare Datei mit allen Abhängigkeiten
- Ein Bootloader
- Ein Dateisystem
- Ein Paketmanager

? Welcher Befehl findet das Paket zu einer RPM-Datei?
* rpm -qf
- rpm -ql
- rpm -qa
- dnf update

## Lücken
- {rsync} überträgt nur Änderungen.
- Debian nutzt {apt}, Fedora nutzt {dnf}.
- {xz} komprimiert meist am stärksten.

## Spickzettel
- gzip < bzip2 < xz · tar -czvf
- voll · differenziell · inkrementell
- apt/dpkg · dnf/rpm · zypper
- ./configure make make install
- Flatpak · Snap · AppImage
