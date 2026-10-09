---
id: linux-eckert-k01-einfuehrung
bereich: Linux
fach: Linux I
pruefungen: [LPIC-1, Schule]
block: CompTIA Linux+ / LPIC-1 (Eckert)
kapitel: Eckert – CompTIA Linux+ and LPIC-1 (6th Edition)
titel: Kap. 1 Einführung in Linux (Open Source, Distributionen, Cloud)
stufe: Fortgeschritten
quellen: [Eckert_J._W._and_triOS_College_-_CompTIA_Linux_and_LPIC-1_6th_Edition_-_2024.pdf]
verweise: [linux-ess-entwicklung-distributionen,linux-ess-open-source-lizenzen]
---

## Profi

### Betriebssystem und Kernel
Ein **Betriebssystem** (operating system) besteht aus **Kernel** (Hardware-, Prozess-, Speicher- und Dateisystemverwaltung) und Hilfsprogrammen (Shell, Dienste, Anwendungen). Der Kernel läuft im privilegierten Modus; Anwendungen nutzen ihn über Systemaufrufe. Linux ist ein **monolithischer Kernel mit ladbaren Modulen**.

### Geschichte
UNIX (1969) → BSD; **GNU-Projekt** (Stallman 1983, FSF) liefert freie Werkzeuge; **Linus Torvalds** 1991 Kernel unter **GPL** (Copyleft). Entwicklung durch Community; **Distributionen** bündeln Kernel, Software und Paketverwaltung. Kernelversionen: stabile Zweige, Production Kernel, LTS.

### Open Source und Kosten
Open-Source-Software (OSS): Quellcode einsehbar/änderbar. Vorteile: geringere **TCO** (Total Cost of Ownership), Stabilität, Sicherheit durch Transparenz, Flexibilität, viele Hardwareplattformen. Freeware/Shareware/Closed Source zum Vergleich. Copyleft-Lizenzen (GPL) vs. permissive.

### Einsatzgebiete
Workstation, Server (Web, Datenbank, Datei, Mail, DNS …), **Supercomputer/Clustering** (Beowulf), Netzwerk-/Sicherheitsappliances, **Mobile/IoT**, Embedded.

### Cloud
**Cloud-Liefermodelle**: **IaaS** (Infrastruktur), **PaaS** (Plattform), **SaaS** (Software). Bereitstellung: **public**, **private**, **hybrid**. Merkmale: Skalierbarkeit, Selbstbedienung, Abrechnung nach Verbrauch. Moderne Webanwendungen: **Container**, **Continuous Integration/Deployment (CI/CD)**, Code-Repositories (Git). Sicherheitsgrundlagen: **asymmetrische Verschlüsselung** (öffentlicher/privater Schlüssel), **Zertifikate**/CA/PKI, **SSL/TLS**, Authentifizierung (z. B. Kerberos).

### Prüfungsbezug
LPIC-1 101/102 und CompTIA Linux+ XK0-005 decken Installation, Verwaltung, Netzwerk, Sicherheit und Cloud/Automatisierung ab.

## Einfach

Linux ist ein **Betriebssystem**, also das Programm, das deinem Computer sagt, wie er mit Festplatte, Tastatur, Netzwerk und Programmen umgehen soll. Das Herz davon ist der **Kernel**. Er ist der Chef im Maschinenraum: Er verteilt Arbeitsspeicher, startet Programme und spricht mit der Hardware.

Das Besondere: Linux ist **Open Source**. Jeder darf den Bauplan lesen, verändern und weitergeben. Dadurch arbeiten tausende Menschen weltweit daran, und Firmen sparen Lizenzkosten. Weil der Kernel allein nicht reicht, packen Gruppen ihn mit Programmen zu einer **Distribution** zusammen (Ubuntu, Debian, Fedora …).

Linux läuft nicht nur auf PCs, sondern auch in Servern, Smartphones, Routern, Autos und sogar den schnellsten Supercomputern der Welt.

Heute laufen viele Programme in der **Cloud**: Du mietest Computerleistung, statt eigene Maschinen zu kaufen. Bei **IaaS** mietest du nur die „leere“ Maschine, bei **PaaS** bekommst du eine fertige Umgebung für deine Programme, bei **SaaS** nutzt du einfach die fertige Anwendung (wie Webmail). Programme werden dort oft in **Containern** verpackt, das sind kleine, abgeschlossene Pakete, die überall gleich laufen.

## Merksatz
- **Kernel = Chef der Hardware; Distribution = Kernel + Programme.**
- **GPL = Copyleft.**
- **IaaS < PaaS < SaaS (immer weniger Eigenaufwand).**
- **TCO = Gesamtkosten, nicht nur Lizenz.**

## Prüfungsfalle
- Open Source ≠ kostenlos in jeder Hinsicht: TCO enthält Support und Schulung.
- Die FSF steht für **Free Software**, nicht für „Linux“.
- SaaS = fertige Anwendung, IaaS = virtuelle Hardware.
- Public Cloud gehört einem Anbieter, Private Cloud einer Organisation.

## Grafik

### Cloud-Modelle
1. Kunde -> IaaS: mietet virtuelle Server
2. Kunde -> PaaS: mietet Laufzeitumgebung
3. Kunde -> SaaS: nutzt fertige Anwendung
4. Anbieter: betreibt Hardware im Rechenzentrum

## Karteikarten
- F: Welche Aufgabe hat der Kernel? | A: Verwaltung von Hardware, Prozessen, Speicher und Dateisystemen.
- F: Welche Lizenz verwendet der Linux-Kernel? | A: GNU General Public License (GPL).
- F: Was bedeutet TCO? | A: Total Cost of Ownership (Gesamtbetriebskosten).
- F: Was ist Copyleft? | A: Abgeleitete Werke müssen unter derselben freien Lizenz bleiben.
- F: Was ist IaaS? | A: Infrastruktur als Dienst (virtuelle Maschinen, Speicher, Netz).
- F: Was ist PaaS? | A: Plattform als Dienst (Laufzeit-/Entwicklungsumgebung).
- F: Was ist SaaS? | A: Software als Dienst (fertige Anwendung).
- F: Was ist ein Container? | A: Abgeschottete Laufzeitumgebung mit Anwendung und Abhängigkeiten.
- F: Wofür steht CI/CD? | A: Continuous Integration / Continuous Deployment.
- F: Was ist Beowulf-Clustering? | A: Zusammenschluss vieler Linux-Rechner zu einem Hochleistungscluster.

## Quiz
? Wer startete 1991 die Entwicklung des Linux-Kernels?
* Linus Torvalds
- Richard Stallman
- Ken Thompson
- Andrew Tanenbaum

? Welche Aussage zu Copyleft ist richtig?
* Abgeleitete Werke müssen unter derselben Lizenz bleiben
- Software darf nicht verändert werden
- Software ist immer kostenlos
- Quellcode bleibt geheim

? Welches Cloud-Modell liefert eine fertige Anwendung?
* SaaS
- IaaS
- PaaS
- DaaS

? Welches Modell stellt virtuelle Server bereit?
* IaaS
- SaaS
- PaaS
- BaaS

? Wofür steht TCO?
* Total Cost of Ownership
- Total Control Option
- Technical Cloud Operation
- Time Cost Optimization

? Wofür steht die Abkürzung CI/CD?
* Continuous Integration / Continuous Deployment
- Central Intelligence / Cloud Deploy
- Container Image / Cloud Disk
- Compile Install / Copy Data

? Was ist eine Distribution?
* Kernel plus Software und Paketverwaltung
- Nur der Kernel
- Nur ein Desktop
- Ein Dateisystem

? Welche Cloud gehört einer einzelnen Organisation?
* Private Cloud
- Public Cloud
- Hybrid-Clustering
- SaaS

## Spickzettel
- Kernel · Distribution · GPL
- IaaS/PaaS/SaaS · public/private/hybrid
- CI/CD · Container · Git
- TCO
