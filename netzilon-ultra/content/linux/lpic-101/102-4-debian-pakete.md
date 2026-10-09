---
id: linux-101-102-4-debian-pakete
bereich: Linux
fach: Linux I
pruefungen: [LPIC-1]
block: LPIC-101
kapitel: LPIC-1 Prüfung 101 – Linux-Installation und Paketverwaltung
titel: 102.4 Debian-Paketverwaltung (dpkg, apt)
stufe: Fortgeschritten
quellen: [LPI-Learning-Material-101-500-de.pdf, 1.08_Linux_-_Paketverwaltung.pdf]
verweise: [linux-l1-08-paketverwaltung, linux-101-102-5-rpm-pakete]
---

## Profi

### Lernziel (Gewicht 3)
Pakete mit dpkg und apt installieren, aktualisieren, entfernen, abfragen; Repositories verwalten.

### dpkg (Low-Level, `.deb`)
| Aufgabe | Befehl |
|---|---|
| Installieren | `dpkg -i paket.deb` (löst **keine** Abhängigkeiten auf) |
| Entfernen | `dpkg -r paket` (Konfig bleibt), `dpkg -P paket` (**purge**: inkl. Konfig) |
| Installierte Pakete | `dpkg -l [muster]`, `dpkg -L paket` (Dateien), `dpkg -S /pfad/datei` (Paket zu Datei), `dpkg -s paket` (Status) |
| Inhalt `.deb` | `dpkg -c paket.deb`, `dpkg -I paket.deb` (Info) |
| Neu konfigurieren | `dpkg-reconfigure paket` |
- Datenbank: `/var/lib/dpkg/` (`status`, `info/`).

### apt (High-Level, löst Abhängigkeiten)
- `apt update` (Paketlisten holen), `apt upgrade`, `apt full-upgrade` (auch Entfernen/Neuinstall), `apt install paket`, `apt remove`, `apt purge`, `apt autoremove`, `apt search`, `apt show`, `apt list --installed|--upgradable`, `apt download`. Altes `apt-get`/`apt-cache` (`apt-cache policy paket`, `apt-cache depends`) ist weiter prüfungsrelevant. `apt-file search /pfad` findet Pakete zu Dateien.
- **Repositories**: `/etc/apt/sources.list` und `/etc/apt/sources.list.d/*.list` (oder deb822 `*.sources`): `deb http://deb.debian.org/debian bookworm main contrib non-free`. Komponenten: main, contrib, non-free. Signatur: GPG-Schlüssel in `/etc/apt/trusted.gpg.d/` bzw. `signed-by=`. Cache: `/var/cache/apt/archives/`, `apt clean`.
- Abhängigkeiten-Felder: `Depends`, `Recommends`, `Suggests`, `Conflicts`. Paketname-Format: `name_version_arch.deb`.

## Einfach

Software unter Linux kommt nicht aus dem Internet-Download, sondern aus **Paketen** – wie Bausätze in Kartons. Debian, Ubuntu und Mint benutzen `.deb`-Kartons.

Es gibt zwei Werkzeuge. **dpkg** ist der **Handwerker**: Er packt einen einzelnen Karton aus (`dpkg -i`), aber er merkt nicht, wenn noch Schrauben aus anderen Kartons fehlen. **apt** ist der **Lieferdienst mit Einkaufsliste**: Du sagst „ich will einen Webserver“, und er bringt gleich alles mit, was dazugehört.

Wo kommt apt her? Aus einer Liste von Online-Läden, den **Repositories** (`/etc/apt/sources.list`). Mit `apt update` fragst du alle Läden: „Was habt ihr Neues?“ Mit `apt upgrade` lässt du dann alles Neue installieren. Reihenfolge merken: erst **update** (Katalog lesen), dann **upgrade** (einkaufen).

Willst du etwas entfernen? `apt remove` räumt das Programm weg, lässt aber deine Einstellungen liegen. `apt purge` nimmt auch die Einstellungen mit.

Weißt du von einer Datei nicht, zu welchem Paket sie gehört, fragst du `dpkg -S /usr/bin/ls`. Und was ein Paket alles mitbringt, zeigt `dpkg -L paket`.

## Merksatz
- **update = Liste holen, upgrade = Software holen.**
- **remove behält Konfig, purge löscht sie.**
- **dpkg -S Datei → Paket, dpkg -L Paket → Dateien.**
- **dpkg löst keine Abhängigkeiten auf, apt schon.**
- **sources.list = Repositories.**

## Prüfungsfalle
- `dpkg -i` meldet fehlende Abhängigkeiten, installiert sie aber nicht (`apt -f install` repariert).
- `-S` (Search: Datei → Paket) und `-L` (List: Paket → Dateien) nicht verwechseln.
- `apt update` aktualisiert **keine** Programme.
- `remove` ≠ `purge` (Konfigurationsdateien).
- `apt-cache policy` zeigt installierte/Kandidaten-Version und Quelle.
- Repository-Zeile beginnt mit `deb` (Binärpakete) bzw. `deb-src`.

## Grafik

### apt install
1. Admin -> apt: apt install nginx
2. apt -> Repository: Paketliste prüfen (zuvor apt update)
3. Repository -> apt: nginx und Abhängigkeiten
4. apt -> dpkg: übergibt .deb-Dateien
5. dpkg -> Dateisystem: entpackt und konfiguriert

## Lab
**Maschine**: debian01.
```bash
# auf debian01
sudo apt update && sudo apt upgrade -y
apt search htop; apt show htop
sudo apt install htop
dpkg -l | grep htop
dpkg -L htop | head
dpkg -S /usr/bin/htop
sudo apt remove htop; sudo apt purge htop; sudo apt autoremove
apt-cache policy nginx
cat /etc/apt/sources.list
```

## Befehle
- `apt update` – Paketlisten holen
- `apt upgrade` – installierte Pakete aktualisieren
- `apt install paket` – installieren
- `apt purge paket` – entfernen inkl. Konfig
- `dpkg -i paket.deb` – lokales Paket installieren
- `dpkg -l` – installierte Pakete
- `dpkg -S datei` – Paket zu Datei
- `dpkg -L paket` – Dateien eines Pakets
- `dpkg-reconfigure paket` – neu konfigurieren
- `apt-cache policy paket` – Versionen und Quellen

## Übungen
- A: Wie findest du heraus, zu welchem Paket /bin/ls gehört? | L: dpkg -S /bin/ls
- A: Wie entfernst du ein Paket samt Konfiguration? | L: apt purge paket (dpkg -P)
- A: Welcher Befehl aktualisiert die Paketlisten? | L: apt update
- A: Wie listest du die Dateien eines Pakets? | L: dpkg -L paket
- A: Wo stehen die Repositories? | L: /etc/apt/sources.list und /etc/apt/sources.list.d/

## Karteikarten
- F: Welche Dateiendung haben Debian-Pakete? | A: .deb
- F: Was macht dpkg -i? | A: Installiert ein lokales .deb ohne Abhängigkeitsauflösung.
- F: Was ist der Unterschied remove/purge? | A: purge entfernt zusätzlich die Konfigurationsdateien.
- F: Wo liegen die Repositories? | A: /etc/apt/sources.list(.d)
- F: Was bewirkt apt autoremove? | A: Entfernt nicht mehr benötigte Abhängigkeiten.
- F: Wo liegt die dpkg-Datenbank? | A: /var/lib/dpkg/
- F: Wie zeigt man Paketinfos vor der Installation? | A: apt show paket
- F: Wie reinigt man den Paketcache? | A: apt clean
- F: Was zeigt dpkg -s? | A: Status und Metadaten eines installierten Pakets.
- F: Was macht apt full-upgrade? | A: Aktualisiert und entfernt/installiert bei Bedarf weitere Pakete.

## Quiz
? Welcher Befehl findet das Paket zu einer Datei?
* dpkg -S
- dpkg -L
- dpkg -l
- dpkg -c

? Was löscht auch Konfigurationsdateien?
* apt purge
- apt remove
- apt clean
- apt autoremove

? Was tut apt update?
* Paketlisten aktualisieren
- Alle Programme aktualisieren
- Das System neu starten
- Pakete entfernen

? Welcher Befehl listet die Dateien eines installierten Pakets?
* dpkg -L paket
- dpkg -S paket
- dpkg -I paket
- apt files paket

? Was gilt für dpkg -i?
* Es löst keine Abhängigkeiten automatisch auf
- Es lädt Pakete aus dem Netz
- Es aktualisiert Repository-Listen
- Es installiert immer Empfehlungen

? Wo liegen die Repository-Einträge?
* /etc/apt/sources.list
- /var/lib/apt/repos
- /etc/dpkg/sources
- /usr/share/apt

? Welches Tool zeigt Kandidatenversionen und Quelle?
* apt-cache policy
- apt-key list
- dpkg -V
- apt-file

? Was zeigt dpkg -l?
* Installierte Pakete
- Dateien eines Pakets
- Logdateien
- Lizenzen

## Spickzettel
- update (Listen) → upgrade (Pakete)
- dpkg -i/-r/-P · -l -L -S -s -c -I
- apt install/remove/purge/autoremove/search/show
- /etc/apt/sources.list(.d) · /var/lib/dpkg
- apt-cache policy · dpkg-reconfigure
