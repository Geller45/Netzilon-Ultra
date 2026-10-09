---
id: linux-ess-ikt-faehigkeiten
bereich: Linux
fach: Linux I
pruefungen: [LPIC-1, Schule]
block: Linux Essentials
kapitel: Thema 1 – Die Linux-Gemeinschaft und eine Karriere in Open Source
titel: 1.4 IKT-Fähigkeiten und Arbeiten mit Linux
stufe: Einsteiger
quellen: [LPI-Learning-Material-010-160-de.pdf]
verweise: [linux-ess-open-source-lizenzen]
---

## Profi

### Lernziel (Gewicht 2)
Grundlegende IKT-Fähigkeiten und Linux-Nutzung: Desktop, Privatsphäre, Sicherheit, Datenschutz, Kommunikation.

### Desktop und Anwendungen
- Zugriff über grafischen Desktop (GNOME/KDE/Xfce), Terminalemulator, Dateimanager, Browser. Anwendungsbereiche: Büro, Medien, Entwicklung, Server-Administration, Cloud.
- Remote: **SSH** (Textzugriff), **VNC/RDP/X11-Forwarding** (grafisch).

### Privatsphäre und Sicherheit im Alltag
- Starke, unterschiedliche **Passwörter**, Passwortmanager (KeePassXC), **2FA**, Updates, Firewall, Verschlüsselung (LUKS, HTTPS, GnuPG), Browser-Datenschutz (Cookies, Tracking), VPN, Tor.
- **Datenschutz/DSGVO**: personenbezogene Daten schützen; Backups; Vorsicht bei Phishing, Social Engineering, öffentlichem WLAN.

### Kommunikation und Zusammenarbeit
E-Mail (Thunderbird), Chat/Videokonferenz (Matrix, Jitsi, BigBlueButton), Wikis, Ticketsysteme, Git/GitHub/GitLab; Foren, Mailinglisten, Dokumentation (`man`, Wiki). Gute Fragen stellen: Problem, Version, Fehlermeldung, bisherige Versuche.

### Karriere
Rollen: Systemadministrator, DevOps, Netzwerk-/Cloudadministrator, Entwickler, Support. Zertifizierungen: LPI (Essentials, LPIC-1/2/3), CompTIA Linux+, Red Hat (RHCSA/RHCE).

## Einfach

Mit Linux arbeitest du ähnlich wie mit anderen Systemen: Es gibt einen Desktop mit Fenstern, einen Browser und Programme. Zusätzlich gibt es das **Terminal**, ein Fenster, in das du Befehle tippst. Mit **SSH** kannst du so sogar einen entfernten Computer steuern.

Im Alltag zählt **Sicherheit**. Nimm für jede Webseite ein anderes, langes Passwort. Merken musst du dir das nicht: Dafür gibt es **Passwortmanager**. Schalte zusätzlich die **Zwei-Faktor-Anmeldung** an, dann reicht ein gestohlenes Passwort nicht. Halte dein System aktuell und sei vorsichtig bei E-Mails, die dich zum Klicken drängen (**Phishing**).

Auch deine **Daten** brauchen Schutz: Sichere sie regelmäßig (Backup), und verschlüssele sensible Dateien. Persönliche Daten anderer Menschen unterliegen dem **Datenschutz** (DSGVO).

Wenn du nicht weiterkommst, frag in Foren oder lies die Dokumentation. Eine gute Frage nennt dein System, die genaue Fehlermeldung und das, was du schon probiert hast.

Und wenn du beruflich mit Linux arbeiten willst: Die Zertifikate der **LPI** (Essentials, LPIC-1 …) zeigen Arbeitgebern, was du kannst.

## Merksatz
- **Ein Passwort pro Dienst, dazu 2FA.**
- **Updates + Backup + Verschlüsselung.**
- **Gute Frage = System + Fehlermeldung + Versuche.**
- **LPI: Essentials → LPIC-1 → LPIC-2 → LPIC-3.**

## Prüfungsfalle
- SSH ist Textzugriff; für grafische Sitzungen braucht man zusätzlich VNC/RDP oder X11-Forwarding.
- HTTPS verschlüsselt den Transport, schützt aber nicht vor Phishing.
- LPI-Essentials ist keine Voraussetzung für LPIC-1, aber ein Einstieg.

## Grafik

### Zwei-Faktor-Anmeldung
1. Nutzer -> Dienst: Benutzername und Passwort
2. Dienst -> Nutzer: Fordert zweiten Faktor an
3. Nutzer -> Dienst: Code aus der Authenticator-App
4. Dienst: prüft beide Faktoren
5. Dienst -> Nutzer: Zugriff gewährt

## Karteikarten
- F: Wofür steht 2FA? | A: Zwei-Faktor-Authentifizierung.
- F: Was ist Phishing? | A: Betrugsversuch, um Zugangsdaten per gefälschter Nachricht zu erbeuten.
- F: Was ist ein Passwortmanager? | A: Programm, das starke Passwörter erzeugt und sicher speichert.
- F: Was ist SSH? | A: Verschlüsselter Fernzugriff auf die Shell.
- F: Was schützt die DSGVO? | A: Personenbezogene Daten.
- F: Nenne eine Linux-Zertifizierung des LPI. | A: LPIC-1.
- F: Was ist LUKS? | A: Festplattenverschlüsselung unter Linux.
- F: Was gehört in eine gute Supportanfrage? | A: Version, Fehlermeldung, bisherige Schritte.
- F: Was ist ein VPN? | A: Verschlüsselter Tunnel in ein anderes Netz.
- F: Welche Rolle verwaltet Server beruflich? | A: Systemadministrator.

## Quiz
? Was bedeutet 2FA?
* Zwei-Faktor-Authentifizierung
- Zwei-Firewall-Architektur
- Zweifach-Archivierung
- Zugriff für alle

? Wozu dient ein Passwortmanager?
* Starke Passwörter erzeugen und speichern
- Passwörter im Klartext senden
- Netzwerk beschleunigen
- Dateien komprimieren

? Wie nennt man gefälschte Nachrichten zum Datendiebstahl?
* Phishing
- Spooling
- Routing
- Caching

? Was macht SSH?
* Verschlüsselter Fernzugriff
- Dateikomprimierung
- Druckerverwaltung
- Bildbearbeitung

? Welche Zertifizierung gehört zum LPI?
* LPIC-1
- MCSA
- CCNA
- CISSP

? Was verschlüsselt Festplatten unter Linux?
* LUKS
- NTFS
- ext4
- FAT32

? Was gehört NICHT zu einer guten Fehlerbeschreibung?
* „Es geht nicht“ ohne Details
- Genaue Fehlermeldung
- Systemversion
- Bisherige Versuche

? Was regelt die DSGVO?
* Schutz personenbezogener Daten
- Lizenzgebühren
- Netzwerkports
- Dateisysteme

## Spickzettel
- Passwörter: lang, einzigartig, Manager, 2FA
- Updates, Backup, Verschlüsselung
- SSH Text, VNC/RDP grafisch
- LPI Essentials → LPIC-1/2/3
