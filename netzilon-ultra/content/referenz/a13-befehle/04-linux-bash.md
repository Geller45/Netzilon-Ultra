---
id: ref-linux
bereich: Referenz
block: A13
kapitel: Befehlsreferenz
titel: Linux-Befehlsreferenz (Bash)
stufe: Einsteiger
typ: referenz
quellen: [Eigene Zusammenstellung, LPIC-1-Grundlagen]
verweise: [ap2-linux, ap2-skripte-sql]
---

## Profi

Linux-Befehle folgen dem Muster **`befehl -optionen argumente`**. Die Rechte einer Datei stehen als **rwx** für **Besitzer (u)**, **Gruppe (g)** und **Andere (o)**: **r = 4, w = 2, x = 1**. `chmod 750` heißt also Besitzer 7 (rwx), Gruppe 5 (r-x), Andere 0. Mit **`sudo`** führt man einzelne Befehle als root aus. Dienste steuert man mit **`systemctl`** (systemd), Logs liest man mit **`journalctl`** oder in `/var/log`. Pakete verwaltet man unter **Debian/Ubuntu** mit **`apt`**, unter **RHEL/Fedora** mit **`dnf`**.

Wichtige Verzeichnisse: `/etc` (Konfiguration), `/var/log` (Logs), `/home` (Benutzer), `/root` (Home von root), `/tmp` (temporär), `/usr/bin` (Programme), `/dev` (Geräte), `/proc` (Prozesse und Kernelinfos).

## Einfach

Linux ist wie ein **großes Haus mit Regeln**. **Jede Datei hat drei Schilder**: Was darf der **Besitzer**, was darf die **Gruppe**, was dürfen **alle anderen**. Die Zahlen sind ein **Rechenspiel**: **lesen = 4, schreiben = 2, ausführen = 1**. Wer alles darf, hat 4+2+1 = **7**. Mit `sudo` sagst du: „Ich habe den **Generalschlüssel**, aber nur für diesen einen Befehl.“ Und mit `systemctl` schaltest du die **Maschinen im Haus** (Dienste) an und aus.

## Merksatz
- **r=4, w=2, x=1** (`chmod 755` = rwxr-xr-x).
- **`systemctl status / enable --now / restart`** für Dienste.
- **`apt` (Debian/Ubuntu), `dnf` (RHEL)**.
- **`ss -tulpn`** zeigt lauschende Ports (Nachfolger von `netstat`).
- **`ip a` / `ip route`** ersetzen `ifconfig` / `route`.

## Prüfungsfalle
- **`rm -rf /`** und ähnliche Befehle sind **unumkehrbar**: immer Pfad prüfen.
- **`chmod 777`** ist fast nie die richtige Lösung.
- **Groß-/Kleinschreibung** zählt (`Datei` ≠ `datei`).
- **`>` überschreibt**, **`>>` hängt an**.
- **`ifconfig`/`netstat`** gelten als veraltet (net-tools) → `ip`, `ss`.

## Grafik

### Rechte-Würfel
Drei Schilder (Besitzer, Gruppe, Andere) mit je drei Schaltern r, w, x. Beim Umschalten ändern sich die Ziffer (0–7) und die Zahl `chmod 750` live.

## Befehle

### Dateien und Verzeichnisse
- `ls -la` – Dateien inklusive versteckter mit Rechten und Größe
- `cd /etc` – Verzeichnis wechseln
- `pwd` – Aktuelles Verzeichnis anzeigen
- `cp -r quelle ziel` – Verzeichnis rekursiv kopieren
- `mv alt neu` – Datei verschieben oder umbenennen
- `rm -r ordner` – Ordner rekursiv löschen
- `mkdir -p a/b/c` – Verzeichnisse samt Elternordnern anlegen
- `cat datei` – Dateiinhalt ausgeben
- `less datei` – Datei seitenweise lesen
- `tail -f /var/log/syslog` – Logdatei live mitlesen
- `grep -i fehler datei` – Text in Datei suchen (ohne Groß/Kleinschreibung)
- `find / -name "*.conf"` – Dateien nach Namen suchen
- `nano datei` – Einfacher Texteditor

### Rechte und Benutzer
- `chmod 750 datei` – Rechte setzen: Besitzer rwx, Gruppe r-x, Andere keine
- `chmod u+x skript.sh` – Ausführrecht für den Besitzer hinzufügen
- `chown anna:it datei` – Besitzer und Gruppe ändern
- `sudo befehl` – Befehl mit Administratorrechten ausführen
- `useradd -m anna` – Benutzer mit Home-Verzeichnis anlegen
- `passwd anna` – Kennwort eines Benutzers ändern
- `usermod -aG sudo anna` – Benutzer zur Gruppe sudo hinzufügen
- `id anna` – UID, GID und Gruppen eines Benutzers
- `umask` – Standardrechte für neue Dateien (Maske)

### System, Dienste, Pakete
- `systemctl status ssh` – Status eines Dienstes anzeigen
- `systemctl enable --now ssh` – Dienst beim Start aktivieren und sofort starten
- `systemctl restart nginx` – Dienst neu starten
- `journalctl -u ssh -n 50` – Letzte 50 Logzeilen eines Dienstes
- `apt update && apt upgrade` – Paketlisten aktualisieren und Pakete aktualisieren (Debian/Ubuntu)
- `apt install nginx` – Paket installieren
- `ps aux` – Alle Prozesse anzeigen
- `top` – Prozesse und Last live anzeigen
- `kill -9 1234` – Prozess hart beenden
- `df -h` – Belegung der Dateisysteme (lesbar)
- `du -sh /var` – Größe eines Verzeichnisses
- `free -h` – Arbeitsspeicher-Auslastung
- `uname -a` – Kernel- und Systeminformationen
- `crontab -e` – Zeitgesteuerte Aufgaben bearbeiten
- `mount /dev/sdb1 /mnt` – Datenträger einhängen
- `lsblk` – Blockgeräte und Partitionen anzeigen

### Netzwerk und Fernzugriff
- `ip a` – IP-Adressen aller Schnittstellen
- `ip route` – Routingtabelle
- `ip link set eth0 up` – Schnittstelle aktivieren
- `ss -tulpn` – Lauschende Ports mit Prozess
- `ping -c 4 8.8.8.8` – Vier Pings senden
- `traceroute 8.8.8.8` – Weg der Pakete anzeigen
- `dig example.com` – DNS-Abfrage
- `ssh anna@10.0.0.5` – Sichere Anmeldung auf einem Remotehost
- `scp datei anna@10.0.0.5:/tmp` – Datei sicher kopieren
- `curl -I https://example.com` – HTTP-Header einer Seite abrufen
- `ufw allow 22/tcp` – Firewall: SSH erlauben (Ubuntu)
- `tar -czf backup.tar.gz /etc` – Verzeichnis als komprimiertes Archiv sichern

## Karteikarten
- F: Wofür steht/was bewirkt ls -la? | A: Dateien inklusive versteckter mit Rechten und Größe
- F: Wofür steht/was bewirkt cd /etc? | A: Verzeichnis wechseln
- F: Wofür steht/was bewirkt pwd? | A: Aktuelles Verzeichnis anzeigen
- F: Wofür steht/was bewirkt cp -r quelle ziel? | A: Verzeichnis rekursiv kopieren
- F: Wofür steht/was bewirkt mv alt neu? | A: Datei verschieben oder umbenennen
- F: Wofür steht/was bewirkt rm -r ordner? | A: Ordner rekursiv löschen
- F: Wofür steht/was bewirkt mkdir -p a/b/c? | A: Verzeichnisse samt Elternordnern anlegen
- F: Wofür steht/was bewirkt cat datei? | A: Dateiinhalt ausgeben
- F: Wofür steht/was bewirkt less datei? | A: Datei seitenweise lesen
- F: Wofür steht/was bewirkt tail -f /var/log/syslog? | A: Logdatei live mitlesen
- F: Wofür steht/was bewirkt grep -i fehler datei? | A: Text in Datei suchen (ohne Groß/Kleinschreibung)
- F: Wofür steht/was bewirkt find / -name "*.conf"? | A: Dateien nach Namen suchen
- F: Wofür steht/was bewirkt nano datei? | A: Einfacher Texteditor
- F: Wofür steht/was bewirkt chmod 750 datei? | A: Rechte setzen: Besitzer rwx, Gruppe r-x, Andere keine
- F: Wofür steht/was bewirkt chmod u+x skript.sh? | A: Ausführrecht für den Besitzer hinzufügen
- F: Wofür steht/was bewirkt chown anna:it datei? | A: Besitzer und Gruppe ändern
- F: Wofür steht/was bewirkt sudo befehl? | A: Befehl mit Administratorrechten ausführen
- F: Wofür steht/was bewirkt useradd -m anna? | A: Benutzer mit Home-Verzeichnis anlegen
- F: Wofür steht/was bewirkt passwd anna? | A: Kennwort eines Benutzers ändern
- F: Wofür steht/was bewirkt usermod -aG sudo anna? | A: Benutzer zur Gruppe sudo hinzufügen
- F: Wofür steht/was bewirkt id anna? | A: UID, GID und Gruppen eines Benutzers
- F: Wofür steht/was bewirkt umask? | A: Standardrechte für neue Dateien (Maske)
- F: Wofür steht/was bewirkt systemctl status ssh? | A: Status eines Dienstes anzeigen
- F: Wofür steht/was bewirkt systemctl enable --now ssh? | A: Dienst beim Start aktivieren und sofort starten
- F: Wofür steht/was bewirkt systemctl restart nginx? | A: Dienst neu starten
- F: Wofür steht/was bewirkt journalctl -u ssh -n 50? | A: Letzte 50 Logzeilen eines Dienstes
- F: Wofür steht/was bewirkt apt update && apt upgrade? | A: Paketlisten aktualisieren und Pakete aktualisieren (Debian/Ubuntu)
- F: Wofür steht/was bewirkt apt install nginx? | A: Paket installieren
- F: Wofür steht/was bewirkt ps aux? | A: Alle Prozesse anzeigen
- F: Wofür steht/was bewirkt top? | A: Prozesse und Last live anzeigen
- F: Wofür steht/was bewirkt kill -9 1234? | A: Prozess hart beenden
- F: Wofür steht/was bewirkt df -h? | A: Belegung der Dateisysteme (lesbar)
- F: Wofür steht/was bewirkt du -sh /var? | A: Größe eines Verzeichnisses
- F: Wofür steht/was bewirkt free -h? | A: Arbeitsspeicher-Auslastung
- F: Wofür steht/was bewirkt uname -a? | A: Kernel- und Systeminformationen
- F: Wofür steht/was bewirkt crontab -e? | A: Zeitgesteuerte Aufgaben bearbeiten
- F: Wofür steht/was bewirkt mount /dev/sdb1 /mnt? | A: Datenträger einhängen
- F: Wofür steht/was bewirkt lsblk? | A: Blockgeräte und Partitionen anzeigen
- F: Wofür steht/was bewirkt ip a? | A: IP-Adressen aller Schnittstellen
- F: Wofür steht/was bewirkt ip route? | A: Routingtabelle
- F: Wofür steht/was bewirkt ip link set eth0 up? | A: Schnittstelle aktivieren
- F: Wofür steht/was bewirkt ss -tulpn? | A: Lauschende Ports mit Prozess
- F: Wofür steht/was bewirkt ping -c 4 8.8.8.8? | A: Vier Pings senden
- F: Wofür steht/was bewirkt traceroute 8.8.8.8? | A: Weg der Pakete anzeigen
- F: Wofür steht/was bewirkt dig example.com? | A: DNS-Abfrage
- F: Wofür steht/was bewirkt ssh anna@10.0.0.5? | A: Sichere Anmeldung auf einem Remotehost
- F: Wofür steht/was bewirkt scp datei anna@10.0.0.5:/tmp? | A: Datei sicher kopieren
- F: Wofür steht/was bewirkt curl -I https://example.com? | A: HTTP-Header einer Seite abrufen
- F: Wofür steht/was bewirkt ufw allow 22/tcp? | A: Firewall: SSH erlauben (Ubuntu)
- F: Wofür steht/was bewirkt tar -czf backup.tar.gz /etc? | A: Verzeichnis als komprimiertes Archiv sichern

## Quiz

? Was bewirkt `sudo befehl`?
* Befehl mit Administratorrechten ausführen
- Schnittstelle aktivieren
- Ordner rekursiv löschen
- Verzeichnis rekursiv kopieren

? Was bewirkt `curl -I https://example.com`?
* HTTP-Header einer Seite abrufen
- Dateiinhalt ausgeben
- Logdatei live mitlesen
- Text in Datei suchen (ohne Groß/Kleinschreibung)

? Was bewirkt `lsblk`?
* Blockgeräte und Partitionen anzeigen
- Weg der Pakete anzeigen
- Datei verschieben oder umbenennen
- Schnittstelle aktivieren

? Was bewirkt `apt install nginx`?
* Paket installieren
- Schnittstelle aktivieren
- Sichere Anmeldung auf einem Remotehost
- Verzeichnis als komprimiertes Archiv sichern

? Was bewirkt `ufw allow 22/tcp`?
* Firewall: SSH erlauben (Ubuntu)
- Befehl mit Administratorrechten ausführen
- Zeitgesteuerte Aufgaben bearbeiten
- Dateien inklusive versteckter mit Rechten und Größe

? Was bewirkt `journalctl -u ssh -n 50`?
* Letzte 50 Logzeilen eines Dienstes
- Dateiinhalt ausgeben
- Benutzer mit Home-Verzeichnis anlegen
- Standardrechte für neue Dateien (Maske)

? Was bewirkt `systemctl enable --now ssh`?
* Dienst beim Start aktivieren und sofort starten
- Dateiinhalt ausgeben
- Kennwort eines Benutzers ändern
- Weg der Pakete anzeigen

? Was bewirkt `chmod u+x skript.sh`?
* Ausführrecht für den Besitzer hinzufügen
- Text in Datei suchen (ohne Groß/Kleinschreibung)
- IP-Adressen aller Schnittstellen
- Dateien inklusive versteckter mit Rechten und Größe

? Was bewirkt `less datei`?
* Datei seitenweise lesen
- Prozesse und Last live anzeigen
- Sichere Anmeldung auf einem Remotehost
- Dienst neu starten

? Was bewirkt `du -sh /var`?
* Größe eines Verzeichnisses
- Firewall: SSH erlauben (Ubuntu)
- Verzeichnisse samt Elternordnern anlegen
- Benutzer zur Gruppe sudo hinzufügen
