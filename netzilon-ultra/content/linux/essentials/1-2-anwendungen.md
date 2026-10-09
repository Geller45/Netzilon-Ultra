---
id: linux-ess-open-source-anwendungen
bereich: Linux
fach: Linux I
pruefungen: [LPIC-1, Schule]
block: Linux Essentials
kapitel: Thema 1 – Die Linux-Gemeinschaft und eine Karriere in Open Source
titel: 1.2 Die wichtigsten Open-Source-Anwendungen
stufe: Einsteiger
quellen: [LPI-Learning-Material-010-160-de.pdf]
verweise: [linux-ess-entwicklung-distributionen]
---

## Profi

### Lernziel (Gewicht 2)
Wichtige Open-Source-Anwendungen für Desktop, Server und Entwicklung kennen.

### Desktop und Büro
- **LibreOffice** (Writer, Calc, Impress, Base, Draw), Formate **ODF** (.odt, .ods, .odp); **Firefox**, **Chromium**; **Thunderbird** (Mail); **GIMP** (Bitmap), **Inkscape** (Vektor), **Blender** (3D), **Audacity**, **VLC**, **Krita**; **Nextcloud/ownCloud** (Cloud-Speicher).
- **Desktopumgebungen**: GNOME, KDE Plasma, Xfce, Cinnamon, MATE.

### Server
- Webserver **Apache httpd**, **nginx**; Datenbanken **MySQL/MariaDB**, **PostgreSQL**, SQLite, Redis; Dateiserver **Samba** (SMB für Windows-Netze), **NFS**; Mailserver **Postfix**, **Exim**, **Dovecot**; DNS **BIND**; Container **Docker**, Podman; Orchestrierung **Kubernetes**; Konfigurationsmanagement **Ansible**, Puppet; Virtualisierung **KVM/QEMU**, VirtualBox; Versionsverwaltung **Git**.
- **LAMP-Stack**: Linux, Apache, MySQL/MariaDB, PHP/Perl/Python.

### Programmiersprachen
Shell/Bash, **Python**, **Perl**, **C**, **Java**, **PHP**, **JavaScript/Node.js**, **Go**, **Rust**. Interpretiert (Skript) vs. kompiliert (Compiler, z. B. gcc).

### Paketverwaltung
Installation über Paketmanager aus Repositories (`apt install`, `dnf install`), Abhängigkeiten werden automatisch aufgelöst; Alternativen: Flatpak, Snap, AppImage.

## Einfach

Für fast alles, was du am Computer machst, gibt es ein **Open-Source-Programm**. Das heißt: Der Bauplan ist offen, jeder darf ihn ansehen, nutzen und verbessern.

Statt Microsoft Office gibt es **LibreOffice**, statt Photoshop **GIMP**, statt Outlook **Thunderbird**, statt Windows Media Player **VLC**. Webseiten surfst du mit **Firefox**.

Auch das, was du nicht siehst, läuft oft mit Open Source: Wenn du eine Webseite öffnest, antwortet meist ein **Apache**- oder **nginx**-Server. Die Daten liegen in **MariaDB** oder **PostgreSQL**. Windows-Rechner holen sich Dateien von Linux-Servern über **Samba**. Wer E-Mails verschicken will, nutzt **Postfix**.

Ein beliebtes Baukasten-System heißt **LAMP**: **L**inux, **A**pache, **M**ySQL und **P**HP. Damit laufen sehr viele Webseiten.

Programme installierst du nicht von irgendeiner Webseite, sondern über den **Paketmanager** deiner Distribution. Er holt das Programm aus einem geprüften Archiv (Repository) und installiert alles Nötige gleich mit.

## Merksatz
- **LAMP = Linux, Apache, MySQL, PHP.**
- **Samba = Windows-Freigaben unter Linux.**
- **LibreOffice = ODF-Büro, GIMP = Bilder, Blender = 3D.**

## Prüfungsfalle
- **Samba** ≠ **NFS**: Samba für SMB/Windows, NFS für Unix/Linux.
- MariaDB ist ein Fork von MySQL.
- Postfix ist ein MTA (Versand), Dovecot liefert IMAP/POP3.

## Grafik

### Webserver im LAMP-Stack
1. Browser -> Apache: HTTP-Anfrage
2. Apache -> PHP: Seite ausführen
3. PHP -> MariaDB: Daten abfragen
4. MariaDB -> PHP: Ergebnis
5. Apache -> Browser: fertige Webseite

## Karteikarten
- F: Was ist LibreOffice? | A: Freie Office-Suite mit Writer, Calc, Impress.
- F: Welches Dateiformat nutzt LibreOffice standardmäßig? | A: ODF (OpenDocument).
- F: Nenne zwei Open-Source-Webserver. | A: Apache httpd und nginx.
- F: Wofür steht LAMP? | A: Linux, Apache, MySQL/MariaDB, PHP.
- F: Wozu dient Samba? | A: Datei- und Druckfreigaben im SMB/CIFS-Protokoll.
- F: Was ist GIMP? | A: Bildbearbeitung (Bitmap).
- F: Was ist Blender? | A: 3D-Modellierung und Animation.
- F: Was ist Git? | A: Verteilte Versionsverwaltung.
- F: Was ist Docker? | A: Container-Plattform.
- F: Was ist Ansible? | A: Konfigurationsmanagement/Automatisierung (agentenlos).

## Quiz
? Welches Programm ist eine freie Office-Suite?
* LibreOffice
- Microsoft Word
- Pages
- Keynote

? Wofür steht das L in LAMP?
* Linux
- Lighttpd
- Lua
- LDAP

? Welcher Dienst gibt Windows-Freigaben unter Linux bereit?
* Samba
- NFS
- Postfix
- BIND

? Welches Programm ist ein MTA?
* Postfix
- Dovecot
- Apache
- Thunderbird

? Welche Software dient der Bildbearbeitung?
* GIMP
- Audacity
- Inkscape
- VLC

? Welche Datenbank ist ein MySQL-Fork?
* MariaDB
- SQLite
- Redis
- Mongo

? Wie installiert man Software unter Debian bevorzugt?
* Per apt aus dem Repository
- Per Download von beliebigen Seiten
- Per Kopie nach /usr
- Mit make clean

? Was ist Kubernetes?
* Orchestrierung für Container
- Eine Distribution
- Ein Texteditor
- Eine Firewall

## Spickzettel
- LibreOffice, GIMP, Blender, VLC, Thunderbird
- Apache/nginx, MariaDB/PostgreSQL, Samba, Postfix
- LAMP · Docker · Git · Ansible
- Installieren via Paketmanager
