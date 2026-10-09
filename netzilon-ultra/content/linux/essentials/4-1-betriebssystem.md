---
id: linux-ess-betriebssystem-auswaehlen
bereich: Linux
fach: Linux I
pruefungen: [LPIC-1, Schule]
block: Linux Essentials
kapitel: Thema 4 – Das Linux-Betriebssystem
titel: 4.1 Ein Betriebssystem auswählen
stufe: Einsteiger
quellen: [LPI-Learning-Material-010-160-de.pdf]
verweise: [linux-ess-entwicklung-distributionen]
---

## Profi

### Lernziel (Gewicht 1)
Unterschiede zwischen Betriebssystemen und Linux-Distributionen; Auswahlkriterien.

### Betriebssysteme im Vergleich
- **Linux**: freier Kernel, Distributionen, Paketmanager, Terminal zentral, flexibel. **Windows**: proprietär, GUI-zentriert, NTFS, Registry, große Software- und Spielebasis, Active Directory in Firmen. **macOS**: proprietär, Unix-basiert (Darwin/BSD), APFS, an Apple-Hardware gebunden. Weitere: BSD, Android, iOS, ChromeOS.
- Linux-Unterschiede zu Windows: kein Laufwerksbuchstabe, ein Verzeichnisbaum, Groß/Klein, Rechte pro Benutzer/Gruppe/Andere, Software aus Repositories, Treiber im Kernel, Prozesse/Dienste per systemd.

### Auswahlkriterien für eine Distribution
Einsatzzweck (Desktop, Server, Embedded), **Lebenszyklus/Support** (LTS, 5–10 Jahre bei RHEL/Ubuntu LTS/Debian stable), Aktualität (Rolling vs. Fixed), Paketformat, Community vs. kommerzieller Support, Hardware (32/64 Bit, ARM), Ressourcen (leichtgewichtig: Alpine, Xfce-Distros), Sicherheit (SELinux/AppArmor), Kosten, Kenntnisse im Team.

### Beispiele
- Einsteiger-Desktop: Ubuntu, Linux Mint, Fedora. Server: Debian, Ubuntu Server, RHEL/Rocky/AlmaLinux, SLES. Rolling: Arch, openSUSE Tumbleweed. Minimal: Alpine (Container). Lernen: Kali/Parrot (Security).
- **Live-System**: Start von USB ohne Installation. Installation parallel zu Windows (**Dual-Boot**) oder in einer **VM**.

## Einfach

Bevor du Linux benutzt, musst du eine **Distribution** wählen, so wie du ein Auto aussuchst. Dabei hilft die Frage: **Wofür brauche ich es?**

Für den Heimcomputer eignen sich Ubuntu, Linux Mint oder Fedora: freundlich und leicht zu installieren. Für einen Server, der Jahre ohne Überraschungen laufen soll, nimmt man Debian, Ubuntu LTS oder Red Hat-Abkömmlinge (Rocky, Alma). Sie bekommen lange Sicherheitsupdates. Wer immer das Neueste will, wählt ein **Rolling Release** wie Arch.

Wichtig sind außerdem: Wie lange gibt es Updates (**Support**)? Gibt es eine Firma, die bei Problemen hilft, oder nur die Gemeinschaft? Wie viel Leistung hat mein Rechner? Ein alter Laptop läuft besser mit einer schlanken Oberfläche.

Zum **Ausprobieren** musst du nichts kaputtmachen: Du startest von einem USB-Stick (Live-System), baust eine virtuelle Maschine oder installierst Linux neben Windows (Dual-Boot).

Zum Unterschied zu Windows: Es gibt kein `C:`, Programme kommen aus einem zentralen Softwarelager, und fast alles lässt sich per Textdatei einstellen.

## Merksatz
- **Zweck + Support + Aktualität + Hardware = Wahl.**
- **Server: stabil und LTS. Desktop: freundlich.**
- **Erst ausprobieren: Live-USB oder VM.**

## Prüfungsfalle
- LTS bedeutet **Long Term Support**, nicht „neueste Version“.
- Ubuntu und Linux Mint sind Debian-Derivate; Rocky/Alma sind RHEL-Derivate.
- macOS ist Unix-zertifiziert, aber **kein** Linux.

## Grafik

### Entscheidung Distribution
1. Anwender: Zweck festlegen (Desktop, Server, Embedded)
2. Anwender: Support-Zeitraum prüfen (LTS?)
3. Anwender: Hardware und Ressourcen vergleichen
4. Anwender: im Live-System testen
5. Anwender: installieren

## Karteikarten
- F: Was bedeutet LTS? | A: Long Term Support, lange Supportdauer.
- F: Nenne eine Distribution für Server. | A: Debian, Ubuntu Server, RHEL, Rocky, SLES.
- F: Was ist ein Live-System? | A: Betriebssystem, das ohne Installation von USB/DVD läuft.
- F: Was ist Dual-Boot? | A: Zwei Betriebssysteme auf einem Rechner, Auswahl beim Start.
- F: Ist macOS Linux? | A: Nein, es basiert auf Darwin/BSD.
- F: Welche Distribution ist rolling? | A: Arch Linux, openSUSE Tumbleweed.
- F: Wofür eignet sich Alpine? | A: Minimale Container-Images.
- F: Welches Dateisystem nutzt Windows standardmäßig? | A: NTFS.
- F: Was ist ein wichtiges Auswahlkriterium bei kommerziellem Einsatz? | A: Supportvertrag/Lebenszyklus.
- F: Was fehlt unter Linux im Vergleich zu Windows? | A: Laufwerksbuchstaben.

## Quiz
? Was bedeutet LTS?
* Long Term Support
- Last Time Stable
- Linux Terminal System
- Light Task Server

? Welche Distribution ist rolling?
* Arch Linux
- Debian stable
- RHEL
- Ubuntu LTS

? Was ist ein Live-System?
* System, das ohne Installation von USB läuft
- Virtuelle Maschine
- Dual-Boot
- Cloudsystem

? Was unterscheidet Linux von Windows?
* Ein einziger Verzeichnisbaum ohne Laufwerksbuchstaben
- Mehrere Laufwerke C: und D:
- Keine Benutzerrechte
- Kein Terminal

? Welche Distribution ist ein RHEL-Derivat?
* Rocky Linux
- Ubuntu
- Mint
- Kali

? Welche Distribution eignet sich für minimale Container?
* Alpine
- Fedora Workstation
- Ubuntu Desktop
- Mint

? Was ist Dual-Boot?
* Zwei Systeme parallel installiert
- Zwei VMs
- Zwei Kernel
- Zwei Benutzer

? Welches Kriterium ist für einen Unternehmensserver zentral?
* Support-Zeitraum
- Bildschirmhintergrund
- Maskottchen
- Icons

## Spickzettel
- Zweck · Support · Aktualität · Hardware
- LTS stabil, Rolling aktuell
- Live-USB · VM · Dual-Boot
