---
id: linux-l1-08-paketverwaltung
bereich: Linux
fach: Linux I
pruefungen: [LPIC-1, Schule]
block: L1
kapitel: Linux I – Grundlagen
titel: 1.08 Paketverwaltung – dpkg, APT, RPM, DNF, Zypper
stufe: Fortgeschritten
quellen: [1.08_Linux_-_Paketverwaltung.pdf, LPI-Learning-Material-101-500-de.pdf]
verweise: [linux-101-102-4-debian-pakete, linux-101-102-5-rpm-pakete, linux-l1-00-geschichte, linux-l1-03-dateiverwaltung, ref-linux]
---

## Profi

### Einordnung
**102.4** Debian-Paketverwaltung (G3) und **102.5** RPM/YUM (G3) – Prüfung 101. Quellbau = **LPIC-2 206.1**; Snap/Flatpak/AppImage = Praxis-Bonus. Das Skript ist als **Ticket-Woche eines Junior-Admins** aufgebaut (srv-web01 Debian 12, srv-app02 RHEL 9, srv-old03 SLES 15, Ubuntu-24.04-Desktops).

### Grundlagen
- Ein **Paket** bündelt Software + **Metadaten** (Name, Version, Beschreibung) + **Abhängigkeiten** (+ Installationsskripte).
- Ein **Repository** ist eine Server-Sammlung signierter Pakete. Der **Paketmanager** lädt Pakete, löst Abhängigkeiten auf und hält das System konsistent; Updates und Sicherheit laufen **zentral** über die Repos – ein Website-Download hat beides nicht.
- **Low-Level** (`dpkg`, `rpm`): eine einzelne Paketdatei, **keine Repos, keine Abhängigkeitsauflösung**. **High-Level** (`apt`/`apt-get`, `dnf`/`yum`, `zypper`): Repos + Abhängigkeiten.
| | Debian-Welt | RPM-Welt |
|---|---|---|
| Format | `.deb` | `.rpm` |
| Low-Level | `dpkg` | `rpm` |
| High-Level | `apt`, `apt-get`, `apt-cache` | `dnf` (Nachfolger von `yum`), `zypper` (SUSE) |
| Distributionen | Debian, Ubuntu, Mint | RHEL, Fedora, Rocky, Alma, SUSE |

### Debian: dpkg (102.4)
| Befehl | Wirkung |
|---|---|
| `dpkg -i paket.deb` | lokale .deb installieren (scheitert bei fehlenden Abhängigkeiten → `apt install -f` repariert) |
| `dpkg -r paket` / `dpkg -P paket` | entfernen / **purge** inkl. Konfiguration |
| `dpkg -l [muster]` | installierte Pakete (Status `ii` = installiert) |
| **`dpkg -L paket`** | **Paket → Dateien** |
| **`dpkg -S /pfad`** | **Datei → Paket** (`dpkg -S /bin/ls` → coreutils) |
| `dpkg -s paket` | Status/Details eines installierten Pakets |
| `dpkg -I datei.deb` / `dpkg -c datei.deb` | Infos / Inhalt einer .deb-Datei |
| `dpkg-reconfigure paket` | installiertes Paket neu konfigurieren (z. B. `tzdata`, `locales`) |
Fehlerbild aus dem Ticket: `dpkg -i nginx_1.24.0.deb` → „dependency problems … nginx depends on libpcre2-8-0“ – dpkg lädt **nichts nach**.

### Debian: APT
| Befehl | Wirkung |
|---|---|
| `apt update` | **Paketlisten** neu laden (aktualisiert keine Pakete!) |
| `apt upgrade` | installierte Pakete aktualisieren (ohne Entfernen) |
| `apt full-upgrade` (= `apt-get dist-upgrade`) | auch mit Entfernen/Neuinstallieren, falls nötig |
| `apt install paket` | Paket + Abhängigkeiten |
| `apt remove` / `apt purge` | entfernen / inkl. Konfiguration |
| `apt autoremove` | nicht mehr benötigte Abhängigkeiten entfernen |
| `apt search begriff` / `apt show paket` | suchen / Details |
| `apt list --installed` | installierte Pakete |
| `apt-cache depends paket` / `rdepends` | Abhängigkeiten / Rückwärts-Abhängigkeiten |
| `apt-get install -f` | kaputte Abhängigkeiten reparieren |
| `apt-get clean` | Paket-Cache `/var/cache/apt/archives/` leeren |
`apt` = moderne, benutzerfreundliche Oberfläche; `apt-get`/`apt-cache` = ältere, **skripttaugliche** Werkzeuge (stabile Ausgabe). Datei-Suche in nicht installierten Paketen: `apt-file search datei` (nach `apt-file update`).
- **Paketquellen**: **`/etc/apt/sources.list`** und **`/etc/apt/sources.list.d/`** (Debian 12+/Ubuntu 24.04 auch im deb822-Format `*.sources`). Zeile: **`deb <URL> <Distribution> <Komponenten>`**, z. B. `deb http://deb.debian.org/debian bookworm main contrib`; `deb-src` für Quellpakete.

### RPM-Welt: rpm (102.5)
| Befehl | Wirkung |
|---|---|
| `rpm -i paket.rpm` / `-U` / `-F` / `-e` | installieren / upgraden (oder installieren) / nur upgraden falls vorhanden / entfernen |
| `rpm -ivh paket.rpm` | installieren mit Ausgabe und Fortschrittsbalken |
| **`rpm -qa`** | alle installierten Pakete |
| **`rpm -qi paket`** | Infos (Version, Signatur, Lizenz) |
| **`rpm -ql paket`** | Paket → Dateien |
| **`rpm -qf /pfad`** | Datei → Paket |
| `rpm -qR paket` / `rpm -qc paket` | Abhängigkeiten / Konfigurationsdateien |
| `rpm -qp … datei.rpm` | Abfrage einer **nicht installierten** Datei |
| `rpm -V paket` | Integrität prüfen (geänderte Dateien) |
| `rpm -K datei.rpm` / `rpm --checksig` | Signatur prüfen |
| `rpm --import KEY` | GPG-Schlüssel importieren |
Grammatik: **`-q` fragt ab**, der Zusatz sagt was: **a** alle, **i** Infos, **l** Liste, **f** Datei, **p** Paketdatei. Auch rpm löst **keine** Abhängigkeiten auf. **`rpm2cpio paket.rpm | cpio -idmv`** entpackt ein RPM ohne Installation.

### dnf / yum und zypper
- **dnf** (Nachfolger von **yum** ab RHEL 8/Fedora 22, Befehle weitgehend gleich): `dnf install`, `remove`, `update`/`upgrade`, `search`, `info`, **`provides /pfad`** (welches Paket liefert die Datei), `list installed`, `repolist`, `history`, `check-update`, `reinstall`, `clean all`. Konfiguration **`/etc/dnf/dnf.conf`** bzw. **`/etc/yum.conf`**; Repos in **`/etc/yum.repos.d/*.repo`** (`[name]`, `baseurl=`, `enabled=1`, **`gpgcheck=1`**, `gpgkey=`).
- **zypper** (SUSE): `zypper in` (install), `rm` (remove), `up` (update), `se` (search), `if` (info), `lr`/`ar`/`rr` (Repos listen/hinzufügen/entfernen), `refresh`, `wp` (what-provides).

### Rosetta-Stein
| Aufgabe | Debian/Ubuntu | RHEL/Fedora | SUSE |
|---|---|---|---|
| installieren | `apt install` | `dnf install` | `zypper in` |
| entfernen | `apt remove` | `dnf remove` | `zypper rm` |
| aktualisieren | `apt update && apt upgrade` | `dnf update` | `zypper up` |
| suchen | `apt search` | `dnf search` | `zypper se` |
| Datei → Paket | `dpkg -S` | `rpm -qf` / `dnf provides` | `rpm -qf` / `zypper wp` |
| Paket → Dateien | `dpkg -L` | `rpm -ql` | `rpm -ql` |
| Quellen | `/etc/apt/sources.list(.d)` | `/etc/yum.repos.d/*.repo` | `/etc/zypp/repos.d/` |

### Repos und GPG-Signaturen
Pakete werden mit **GPG** signiert; der Manager prüft Echtheit und Unverändertheit. Fremde Repos bringen eigene Schlüssel mit (Debian: `signed-by=/usr/share/keyrings/xy.gpg` in der Quellzeile; RPM: `rpm --import https://…/RPM-GPG-KEY`). Ein Repo darf Pakete **mit Root-Rechten** installieren → nur **vertrauenswürdige** Quellen einbinden („xyz-nightly“ erst prüfen).

### Vertiefung LPIC-2 206.1: aus Quellcode
Tarball entpacken → **README/INSTALL lesen** → Build-Werkzeuge (`build-essential`, gcc, make) → **`./configure --prefix=/usr/local`** (System prüfen, Makefile erzeugen) → **`make`** (kompilieren) → **`sudo make install`** (meist nach `/usr/local`, getrennt von der Paketverwaltung). `make clean`, `make uninstall`. Fehlende Bibliotheken („zlib not found“) als **-dev**-Paket nachinstallieren (`zlib1g-dev`). **`checkinstall`** baut statt `make install` ein .deb/.rpm (sauber entfernbar); **`patch -p1 < fix.patch`** spielt Diffs ein.

### Bonus: moderne Formate
**Snap** (Canonical, `snapd`, sandboxed), **Flatpak** (Flathub, `flatpak install flathub org.gimp.GIMP`), **AppImage** (eine ausführbare Datei, `chmod +x`). Vorteil: distributionsunabhängig, aktuell, isoliert; Nachteil: groß, Updates außerhalb der System-Repos. **Nicht LPIC-1-relevant** – Faustregel: System/Server = native Pakete.

## Einfach

Software auf Linux holt man sich wie Essen aus einem **Supermarkt** – nicht von irgendeinem Straßenstand.

Ein **Paket** ist wie eine **Fertigpackung**: Im Karton steckt das Programm, ein **Etikett** (Name, Version) und ein **Zettel „Du brauchst außerdem …“** (Abhängigkeiten). Ein **Repository** ist der **Supermarkt** – geprüfte Ware mit **Siegel** (GPG-Signatur), damit niemand Gift in die Packung getan hat.

Es gibt zwei Arten von Helfern:
- **dpkg** und **rpm** sind wie jemand, der **genau eine Packung** in den Schrank stellt. Steht auf dem Zettel „Du brauchst auch Milch“, sagt er nur: „Fehlt!“ – und holt sie **nicht**.
- **apt**, **dnf** und **zypper** sind wie ein **Einkaufsservice**: Du sagst „Ich will nginx“, und sie kaufen **alles mit**, was dafür nötig ist.

Darum scheitert im Ticket der Versuch mit der heruntergeladenen Datei (`dpkg -i`), und **`apt install nginx`** klappt sofort.

**`apt update`** heißt: „**Hol den neuen Prospekt** vom Supermarkt“ – du weißt dann, was es Neues gibt, hast aber noch nichts gekauft. **`apt upgrade`** heißt: „**Tausch meine alten Sachen gegen die neuen aus**.“

Die Liste der Supermärkte steht bei Debian in **`/etc/apt/sources.list`**, bei Red Hat in **`/etc/yum.repos.d/`**.

Zwei super Fragen für die Prüfung:
- „**Welche Sachen sind in dieser Packung?**“ → `dpkg -L` bzw. `rpm -ql`
- „**Aus welcher Packung kommt dieses Ding?**“ → `dpkg -S` bzw. `rpm -qf`

Wenn es etwas **gar nicht im Supermarkt** gibt, musst du **selbst kochen** (Quellcode bauen): erst **fragen**, ob alle Zutaten da sind (`./configure`), dann **kochen** (`make`), dann **in den Schrank stellen** (`make install`) – wie beim Hausbau: planen, bauen, einziehen.

## Merksatz
- **Low-Level = eine Datei, High-Level = Repo + Abhängigkeiten**.
- **update lädt die Liste, upgrade tauscht die Pakete**.
- **Großes L = Liste der Dateien, großes S = Suche nach dem Paket** (dpkg -L / -S).
- **rpm -q + a/i/l/f** = alle / Infos / Liste / File.
- **dnf provides = rpm -qf für nicht installierte Pakete**.
- **configure → make → make install** (fragen, bauen, einziehen).
- **remove behält Konfig, purge putzt alles**.

## Prüfungsfalle
- **`apt update` aktualisiert keine Pakete**, nur die Paketlisten.
- **dpkg und rpm lösen keine Abhängigkeiten** auf.
- `dpkg -S` und `rpm -qf` suchen **Datei → Paket**; `dpkg -L` und `rpm -ql` **Paket → Dateien** – nicht vertauschen.
- `dpkg -r` lässt Konfigurationsdateien zurück (Status `rc`), **`-P`** entfernt sie.
- `rpm -U` installiert auch, wenn das Paket fehlt; **`-F`** nur, wenn es schon installiert ist.
- **yum** ist der Vorgänger von dnf – die Prüfung fragt beide.
- **rpm2cpio** gibt das Archiv auf **stdout** aus → mit `| cpio -idmv` entpacken.
- `gpgcheck=0` schaltet die Signaturprüfung ab – Sicherheitsrisiko.

## Grafik

### apt install nginx
1. Admin -> apt: `apt install nginx`
2. apt -> Repo: liest Paketlisten aus sources.list
3. apt: löst Abhängigkeiten auf (libpcre2-8-0 …)
4. Repo -> apt: lädt .deb-Dateien nach /var/cache/apt/archives
5. apt: prüft GPG-Signaturen
6. apt -> dpkg: übergibt Pakete in richtiger Reihenfolge
7. dpkg -> System: entpackt Dateien, führt Skripte aus
8. System: nginx läuft

### dpkg -i scheitert
1. Admin -> dpkg: `dpkg -i nginx_1.24.0.deb`
2. dpkg: prüft Abhängigkeiten
3. dpkg -> Admin: libpcre2-8-0 fehlt – halb konfiguriert
4. Admin -> apt: `apt install -f`
5. apt -> Repo: holt die fehlende Bibliothek
6. apt -> dpkg: Konfiguration wird abgeschlossen

### Quellbau
1. Admin: tar -xzf tool-2.1.tar.gz, README lesen
2. Admin -> configure: prüft System, erzeugt Makefile
3. configure -> Admin: Fehler zlib not found
4. Admin -> apt: installiert zlib1g-dev
5. Admin -> make: kompiliert den Code
6. Admin -> checkinstall: baut tool_2.1.deb und installiert es

## Lab
**Maschinen**: debian01 (Debian 12/Ubuntu 24.04) und rocky01 (Rocky Linux 9).
```bash
# auf debian01 – Ticket #4711 nginx
sudo apt update
apt search nginx | head; apt show nginx | head -5
apt-cache depends nginx | head
sudo apt install -y nginx; systemctl status nginx --no-pager
dpkg -l | grep nginx; dpkg -L nginx | head; dpkg -S /bin/ls
cat /etc/apt/sources.list; ls /etc/apt/sources.list.d/
sudo dpkg-reconfigure tzdata
apt download tree && sudo dpkg -i tree_*.deb; dpkg -I tree_*.deb | head
sudo apt remove -y tree; dpkg -l tree; sudo apt purge -y tree
sudo apt autoremove -y; sudo apt upgrade -y

# auf rocky01 – Ticket #4718 httpd
sudo dnf install -y httpd; sudo systemctl enable --now httpd
dnf info httpd | head -3; dnf search editor | head
rpm -qa | wc -l; rpm -qi bash | head -4; rpm -ql httpd | head; rpm -qf /etc/hosts
dnf provides /usr/bin/dig
cat /etc/yum.repos.d/*.repo | grep -E "^\[|gpgcheck"
dnf download tree && rpm -qpl tree-*.rpm && rpm2cpio tree-*.rpm | cpio -idmv
rpm -V httpd; rpm -K tree-*.rpm
dnf history | head -5

# auf debian01 – LPIC-2-Ausblick: Quellbau (optional)
sudo apt install -y build-essential checkinstall
# tar -xzf tool-2.1.tar.gz && cd tool-2.1 && ./configure --prefix=/usr/local && make && sudo checkinstall
```

## Befehle
- `dpkg -i paket.deb` – lokale .deb installieren
- `dpkg -r paket` – Paket entfernen (Konfig bleibt)
- `dpkg -P paket` – Paket inkl. Konfiguration entfernen
- `dpkg -l` – installierte Pakete auflisten
- `dpkg -L paket` – Dateien eines Pakets
- `dpkg -S /pfad` – Paket zu einer Datei
- `dpkg -s paket` – Status eines Pakets
- `dpkg-reconfigure tzdata` – Paket neu konfigurieren
- `apt update` – Paketlisten aktualisieren
- `apt upgrade` – Pakete aktualisieren
- `apt full-upgrade` – Aktualisieren mit Entfernen, falls nötig
- `apt install paket` – installieren inkl. Abhängigkeiten
- `apt purge paket` – entfernen inkl. Konfiguration
- `apt autoremove` – verwaiste Abhängigkeiten entfernen
- `apt search begriff` – Paket suchen
- `apt show paket` – Paketdetails
- `apt-cache depends paket` – Abhängigkeiten anzeigen
- `apt-get install -f` – kaputte Abhängigkeiten reparieren
- `rpm -ivh paket.rpm` – RPM installieren mit Fortschritt
- `rpm -Uvh paket.rpm` – RPM aktualisieren oder installieren
- `rpm -e paket` – RPM entfernen
- `rpm -qa` – alle installierten RPMs
- `rpm -qi paket` – Paketinfos
- `rpm -ql paket` – Dateien eines Pakets
- `rpm -qf /pfad` – Paket zu einer Datei
- `rpm -qpl datei.rpm` – Dateien einer nicht installierten RPM-Datei
- `rpm -V paket` – Paketdateien verifizieren
- `rpm --import KEY` – GPG-Schlüssel importieren
- `rpm2cpio paket.rpm | cpio -idmv` – RPM ohne Installation entpacken
- `dnf install paket` – installieren inkl. Abhängigkeiten
- `dnf provides /pfad` – welches Paket liefert die Datei
- `dnf repolist` – aktive Repositories
- `zypper in paket` – installieren (SUSE)
- `zypper se begriff` – suchen (SUSE)
- `zypper lr` – Repositories auflisten (SUSE)

## Übungen
- A: Welcher Befehl installiert ein Paket samt Abhängigkeiten (Debian/Ubuntu)? (dpkg -i, apt install, rpm -i, make) | L: apt install – dpkg -i installiert nur die lokale Datei.
- A: Was macht apt update? | L: Es lädt die Paketlisten neu; Pakete aktualisiert erst apt upgrade.
- A: Welche Datei listet die APT-Paketquellen? | L: /etc/apt/sources.list plus Einzeldateien in /etc/apt/sources.list.d/.
- A: Womit findet man das RPM-Paket zu einer Datei? (rpm -ql, rpm -qa, rpm -qf, rpm -i) | L: rpm -qf /pfad (Debian: dpkg -S).
- A: Was lösen dpkg/rpm nicht automatisch? | L: Abhängigkeiten – das übernehmen apt/dnf/zypper.
- A: Wofür dient ein GPG-Schlüssel bei Repos? | L: Signatur/Vertrauen – Echtheit und Integrität der Pakete.
- A: Was ist das Debian-Pendant zu rpm -qf? | L: dpkg -S /pfad
- A: Reihenfolge beim Bauen aus Quellcode? | L: ./configure → make → sudo make install
- A: Welches Tool erzeugt aus einem Quellbau ein sauber entfernbares Paket? | L: checkinstall
- A: Du brauchst eine einzelne Datei aus einem .rpm, ohne es zu installieren. | L: rpm2cpio paket.rpm \| cpio -idmv

## Szenario

### Ticket #4711 – nginx auf srv-web01 (Debian 12)
Ein Kollege hat eine nginx-.deb von einer Website in Ihr Home-Verzeichnis gelegt. `sudo dpkg -i nginx_1.24.0.deb` meldet: „nginx depends on libpcre2-8-0; however: package is not installed.“
- F: Warum scheitert die Installation? | A: dpkg arbeitet Low-Level mit genau einer Datei und löst keine Abhängigkeiten auf.
- F: Wie reparieren Sie den halb installierten Zustand? | A: sudo apt install -f (holt die fehlende Bibliothek und schließt die Konfiguration ab).
- F: Was ist der richtige Installationsweg? | A: sudo apt update && sudo apt install nginx – aus dem offiziellen, signierten Repo mit Abhängigkeiten.
- F: Der Kunde will Version und Abhängigkeiten wissen. | A: apt show nginx und apt-cache depends nginx.
- F: Die Logs stehen auf UTC, der Kunde will Europe/Berlin. | A: sudo dpkg-reconfigure tzdata (oder timedatectl set-timezone Europe/Berlin).

### Ticket #4718 – Apache auf srv-app02 (RHEL 9)
Auf dem RHEL-9-Server soll Apache (httpd) laufen; apt gibt es dort nicht.
- F: Mit welchem Befehl installieren Sie httpd samt Abhängigkeiten? | A: sudo dnf install httpd
- F: Wie zeigen Sie die Version an? | A: dnf info httpd oder rpm -qi httpd
- F: Aus welchem Paket stammt /etc/hosts? | A: rpm -qf /etc/hosts (Paket setup)
- F: Wo stehen die Repositories? | A: In /etc/yum.repos.d/*.repo (Basis: /etc/yum.conf bzw. /etc/dnf/dnf.conf).

### Team-Chat – fremdes Repo
Ein Kollege schlägt vor, das Repo „xyz-nightly“ einzubinden, weil es eine neuere nginx-Version gibt.
- F: Dürfen Sie das einfach tun? | A: Nein – ein Repo installiert Pakete mit Root-Rechten; erst Quelle und GPG-Schlüssel prüfen, nur vertrauenswürdige Repos einbinden.
- F: Wie wird der Schlüssel auf Debian bzw. RPM hinterlegt? | A: Debian: signed-by=/usr/share/keyrings/xy.gpg in der Quellzeile; RPM: rpm --import URL und gpgcheck=1/gpgkey= in der .repo-Datei.

### Ticket #4723 – Tool ohne Paket (LPIC-2)
Das interne Tool 2.1 existiert nur als Tarball; ./configure bricht mit „zlib not found“ ab.
- F: Wie beheben Sie den Fehler? | A: Das Entwicklerpaket nachinstallieren: sudo apt install zlib1g-dev, dann erneut ./configure.
- F: Wie installieren Sie so, dass das Tool sauber entfernbar bleibt? | A: Nach make mit sudo checkinstall ein .deb bauen und installieren.

## Karteikarten
- F: Was enthält ein Softwarepaket? | A: Programmdateien, Metadaten (Name, Version, Beschreibung), Abhängigkeitsliste und ggf. Installationsskripte.
- F: Unterschied Low-Level- und High-Level-Paketwerkzeug? | A: Low-Level (dpkg, rpm) verarbeitet einzelne Paketdateien ohne Abhängigkeitsauflösung; High-Level (apt, dnf, zypper) nutzt Repos und löst Abhängigkeiten.
- F: Unterschied apt update und apt upgrade? | A: update lädt die Paketlisten, upgrade aktualisiert die installierten Pakete.
- F: Wie zeigt man die Dateien eines installierten Debian-Pakets? | A: dpkg -L paket
- F: Wie findet man unter Debian das Paket zu einer Datei? | A: dpkg -S /pfad/zur/datei
- F: Wie lautet eine sources.list-Zeile? | A: deb URL Distribution Komponenten, z. B. deb http://deb.debian.org/debian bookworm main
- F: Was macht dpkg-reconfigure? | A: Konfiguriert ein bereits installiertes Paket neu (z. B. tzdata, locales).
- F: Was bedeuten rpm -qa, -qi, -ql, -qf? | A: alle Pakete, Infos zu Paket, Dateiliste eines Pakets, Paket zu einer Datei.
- F: Was ist der Unterschied zwischen rpm -U und rpm -F? | A: -U aktualisiert oder installiert neu; -F aktualisiert nur, wenn das Paket bereits installiert ist.
- F: Wo werden yum/dnf-Repositories definiert? | A: In /etc/yum.repos.d/*.repo.
- F: Was ist dnf? | A: Der Nachfolger von yum für RHEL/Fedora mit weitgehend gleicher Syntax.
- F: Was macht rpm2cpio? | A: Wandelt ein RPM in ein cpio-Archiv auf stdout um, um Dateien ohne Installation zu entpacken.
- F: Welche zypper-Kurzbefehle gibt es für installieren, entfernen, aktualisieren, suchen? | A: in, rm, up, se
- F: Warum sind GPG-Signaturen bei Repos wichtig? | A: Sie garantieren Echtheit und Unverändertheit der Pakete.

## Quiz
? Welcher Befehl löst unter Debian Abhängigkeiten automatisch auf?
* apt install
- dpkg -i
- dpkg -L
- rpm -i

? Was bewirkt `apt update`?
* Die Paketlisten werden neu geladen
- Alle Pakete werden aktualisiert
- apt selbst wird aktualisiert
- Nicht benötigte Pakete werden entfernt

? Welcher Befehl zeigt, zu welchem Paket /bin/ls gehört (Debian)?
* dpkg -S /bin/ls
- dpkg -L /bin/ls
- apt show /bin/ls
- dpkg -l /bin/ls

? Welche Datei enthält die Paketquellen von APT?
* /etc/apt/sources.list
- /etc/apt/repos.conf
- /etc/yum.repos.d/apt.repo
- /var/lib/dpkg/sources

? Welcher Befehl listet alle installierten RPM-Pakete?
* rpm -qa
- rpm -ql
- rpm -qf
- rpm -ia

? Wie findet man das Paket, das eine noch nicht installierte Datei liefert (RHEL)?
* dnf provides /pfad
- rpm -qf /pfad
- rpm -ql /pfad
- dnf search --installed /pfad

? Wo werden dnf/yum-Repositories konfiguriert?
* /etc/yum.repos.d/
- /etc/apt/sources.list.d/
- /etc/dnf/repos.list
- /var/cache/yum/

? Welcher Befehl entfernt ein Debian-Paket mitsamt Konfigurationsdateien?
* dpkg -P paket
- dpkg -r paket
- apt remove paket
- dpkg -L paket

? Mit welchem Befehl installiert man unter SUSE das Paket vim?
* zypper in vim
- zypper add vim
- yast -i vim
- apt install vim

? Was ist die richtige Reihenfolge beim Bauen aus Quellcode?
* ./configure, make, make install
- make, ./configure, make install
- make install, make, ./configure
- ./configure, make install, make

? Wozu dient `rpm2cpio paket.rpm | cpio -idmv`?
* Dateien aus einem RPM entpacken, ohne es zu installieren
- Ein RPM in ein .deb umwandeln
- Die Signatur eines RPM prüfen
- Ein RPM installieren

## Spickzettel
- Low: dpkg / rpm (eine Datei, keine Abh.) · High: apt / dnf(yum) / zypper
- apt update (Listen) · upgrade · full-upgrade · install · remove/purge · autoremove · search/show
- dpkg -i · -r/-P · -l · -L (Paket→Dateien) · -S (Datei→Paket) · dpkg-reconfigure
- /etc/apt/sources.list(.d): deb URL suite main
- rpm -ivh · -Uvh · -e · -qa · -qi · -ql · -qf · -qpl · -V · --import · rpm2cpio | cpio -idmv
- dnf install/remove/update/search/info/provides · /etc/yum.repos.d/*.repo (gpgcheck=1)
- zypper in/rm/up/se/lr/ar
- GPG-Signatur = Vertrauen · nur seriöse Repos
- LPIC-2: ./configure → make → make install · checkinstall · patch -p1
