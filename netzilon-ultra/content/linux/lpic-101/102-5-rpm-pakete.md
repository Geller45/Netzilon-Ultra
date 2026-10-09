---
id: linux-101-102-5-rpm-pakete
bereich: Linux
fach: Linux I
pruefungen: [LPIC-1]
block: LPIC-101
kapitel: LPIC-1 Prüfung 101 – Linux-Installation und Paketverwaltung
titel: 102.5 RPM, YUM, DNF und Zypper
stufe: Fortgeschritten
quellen: [LPI-Learning-Material-101-500-de.pdf, 1.08_Linux_-_Paketverwaltung.pdf]
verweise: [linux-l1-08-paketverwaltung, linux-101-102-4-debian-pakete]
---

## Profi

### Lernziel (Gewicht 3)
Pakete mit rpm, yum/dnf und zypper verwalten.

### rpm (Low-Level, `.rpm`)
| Aufgabe | Befehl |
|---|---|
| Installieren | `rpm -ivh paket.rpm` (install, verbose, hash) |
| Aktualisieren | `rpm -Uvh` (install oder update), `rpm -Fvh` (nur wenn installiert, freshen) |
| Entfernen | `rpm -e paket` |
| Abfragen | `rpm -qa` (alle), `rpm -q paket`, `rpm -qi paket` (Info), `rpm -ql paket` (Dateien), `rpm -qf /pfad` (Paket zu Datei), `rpm -qc` (Konfig), `rpm -qd` (Doku), `rpm -qR paket` (Abhängigkeiten) |
| Uninstalliertes Paket | `-qp` (z. B. `rpm -qpl paket.rpm`) |
| Prüfen | `rpm -V paket` (verify), `rpm --checksig`, `rpm --import GPG-KEY` |
| Extraktion | `rpm2cpio paket.rpm \| cpio -idmv` |
- Datenbank: `/var/lib/rpm/` (bzw. sqlite unter `/usr/lib/sysimage/rpm`). Namensschema: `name-version-release.arch.rpm`.

### yum / dnf (High-Level, RHEL/Fedora/Rocky)
- `dnf install|remove|update|upgrade|search|info|list installed|provides /pfad|history|clean all|makecache`, `dnf groupinstall`. **yum** ist der ältere Name (Alias auf dnf). Repositories: `/etc/yum.repos.d/*.repo` (`[id] name= baseurl= enabled=1 gpgcheck=1 gpgkey=`). `yum-config-manager`, `dnf repolist`.

### zypper (SUSE)
- `zypper refresh` (ref), `install` (in), `remove` (rm), `update` (up), `search` (se), `info`, `repos` (lr), `addrepo` (ar), `dist-upgrade` (dup). Repos in `/etc/zypp/repos.d/`.

## Einfach

Bei Red Hat, Fedora, Rocky und SUSE heißen die Software-Kartons **RPM-Pakete** (`.rpm`). Das Prinzip ist dasselbe wie bei Debian: Es gibt einen **Handwerker** (`rpm`) und einen **Lieferdienst** (`dnf`, früher `yum`; bei SUSE `zypper`).

Der Handwerker `rpm` öffnet einen Karton. Seine Befehle sind knappe Buchstaben: **i** = install, **U** = upgrade, **e** = erase, **q** = query (fragen). Beim Fragen hängst du Buchstaben an: `-qa` heißt „alle Pakete“, `-ql` „welche Dateien“, `-qf` „zu welchem Paket gehört diese Datei“, `-qi` „Info“. Mit `-V` kannst du prüfen, ob jemand an den Dateien gebastelt hat.

Der Lieferdienst `dnf` löst alle Abhängigkeiten selbst auf. `dnf install httpd` – und der Webserver samt allem Nötigen ist da. Woher? Aus Läden, die in Dateien unter `/etc/yum.repos.d/` stehen.

Ein Trick: Weißt du nicht, welches Paket einen Befehl bringt, fragst du `dnf provides */befehl`. Und willst du einen Karton nur durchsehen, ohne ihn zu öffnen, hängst du ein **p** an: `rpm -qpl paket.rpm`.

SUSE-Systeme verwenden **zypper**: gleiche Idee, andere Wörter (`zypper install`, `zypper refresh`).

## Merksatz
- **rpm: i installieren, U upgraden, e erase, q query.**
- **-qa alle, -ql Dateien, -qf Datei→Paket, -qi Info.**
- **dnf/yum lösen Abhängigkeiten, rpm nicht.**
- **Repos: /etc/yum.repos.d/*.repo.**
- **SUSE = zypper.**

## Prüfungsfalle
- `rpm -U` installiert **auch**, wenn das Paket noch nicht da ist; `-F` nur Update.
- `-qf` nimmt einen **Dateipfad**, `-q` einen Paketnamen.
- `-qp` fragt eine **.rpm-Datei**, nicht die Datenbank.
- `yum` ist auf neuen RHEL-Systemen nur ein Alias für `dnf`.
- Debian: `dpkg -S`; Red Hat: `rpm -qf` – gleiche Funktion!
- `rpm -e` löscht Konfigurationsdateien nicht immer vollständig (`.rpmsave`).

## Grafik

### dnf install
1. Admin -> dnf: dnf install httpd
2. dnf -> Repository: Metadaten und Abhängigkeiten abfragen
3. Repository -> dnf: httpd.rpm und Abhängigkeiten
4. dnf: prüft GPG-Signaturen (gpgcheck=1)
5. dnf -> rpm: Installation in die RPM-Datenbank

## Lab
**Maschine**: rocky01.
```bash
# auf rocky01
sudo dnf install -y httpd
rpm -q httpd; rpm -qi httpd | head
rpm -ql httpd | head
rpm -qf /usr/sbin/httpd
rpm -qc httpd
rpm -V httpd
dnf provides "*/semanage"
cat /etc/yum.repos.d/*.repo | head
sudo dnf history
```

## Befehle
- `rpm -ivh paket.rpm` – installieren
- `rpm -Uvh paket.rpm` – aktualisieren/installieren
- `rpm -qa` – alle Pakete
- `rpm -qf /pfad` – Paket zu Datei
- `rpm -ql paket` – Dateien
- `rpm -V paket` – Integrität prüfen
- `dnf install paket` – installieren
- `dnf provides */befehl` – Paket zu Befehl finden
- `zypper install paket` – SUSE

## Übungen
- A: Welcher Befehl zeigt, zu welchem Paket /usr/sbin/httpd gehört? | L: rpm -qf /usr/sbin/httpd
- A: Wie installierst du paket.rpm samt Fortschritt? | L: rpm -ivh paket.rpm
- A: Wie listest du Dateien einer noch nicht installierten rpm? | L: rpm -qpl paket.rpm
- A: Wo liegen die Repo-Dateien auf RHEL? | L: /etc/yum.repos.d/
- A: Welches Tool nutzt SUSE? | L: zypper

## Karteikarten
- F: Was bedeutet rpm -qa? | A: Alle installierten Pakete anzeigen.
- F: Was bedeutet rpm -qf? | A: Zu welchem Paket gehört eine Datei.
- F: Unterschied -U und -F? | A: -U installiert oder aktualisiert, -F aktualisiert nur bereits installierte Pakete.
- F: Welches Format haben Repo-Dateien? | A: INI-ähnlich mit [id], name, baseurl, enabled, gpgcheck.
- F: Wie prüft man die Integrität installierter Dateien? | A: rpm -V
- F: Ersatz für yum? | A: dnf.
- F: Welcher zypper-Befehl aktualisiert die Repo-Daten? | A: zypper refresh
- F: Wie importiert man einen GPG-Schlüssel? | A: rpm --import
- F: Wie extrahiert man ein rpm ohne Installation? | A: rpm2cpio paket.rpm | cpio -idmv
- F: Was bedeutet rpm -qc? | A: Konfigurationsdateien eines Pakets.

## Quiz
? Welcher Befehl listet alle installierten RPM-Pakete?
* rpm -qa
- rpm -l
- rpm -ia
- rpm --all

? Welcher Befehl ermittelt das Paket einer Datei?
* rpm -qf
- rpm -ql
- rpm -qi
- rpm -V

? Was macht rpm -Fvh?
* Aktualisiert nur bereits installierte Pakete
- Installiert immer
- Entfernt Pakete
- Prüft Signaturen

? Wo liegen Repository-Dateien bei RHEL?
* /etc/yum.repos.d/
- /etc/rpm/repos
- /var/lib/rpm
- /etc/dnf/sources

? Welches Tool gehört zu SUSE?
* zypper
- dnf
- apt
- pacman

? Was zeigt rpm -qpl paket.rpm?
* Dateien einer noch nicht installierten rpm
- Info aus der Datenbank
- Abhängigkeiten installierter Pakete
- Konfigdateien

? Was macht rpm -V?
* Prüft installierte Dateien gegen die Datenbank
- Zeigt die Version
- Installiert verbose
- Verifiziert das Netzwerk

? Welcher Befehl installiert ein Paket inklusive Abhängigkeiten?
* dnf install
- rpm -ivh
- rpm -U
- rpm2cpio

## Spickzettel
- rpm -i/-U/-F/-e · -q a/i/l/f/c/d/R/p · -V
- dnf install/remove/update/search/provides/history
- /etc/yum.repos.d · gpgcheck
- zypper: refresh, install, remove, update
- yum = Alias auf dnf
