---
id: linux-ess-entwicklung-distributionen
bereich: Linux
fach: Linux I
pruefungen: [LPIC-1, Schule]
block: Linux Essentials
kapitel: Thema 1 – Die Linux-Gemeinschaft und eine Karriere in Open Source
titel: 1.1 Die Entwicklung von Linux und gängige Betriebssysteme
stufe: Einsteiger
quellen: [LPI-Learning-Material-010-160-de.pdf]
verweise: [linux-l1-00-geschichte]
---

## Profi

### Lernziel (Gewicht 2)
Entwicklung von Linux, Distributionen, eingebettete Systeme, Cloud.

### Geschichte
- **Unix** (1969, Bell Labs; Thompson/Ritchie) → BSD, kommerzielle Unixe. **GNU-Projekt** (1983, Richard Stallman): freie Werkzeuge; **FSF** 1985. **Linux-Kernel**: 1991 Linus Torvalds, unter **GPL**. „Linux“ = nur der Kernel; GNU + Kernel + Software = **GNU/Linux-Distribution**.
- Kernel-Aufgaben: Hardware-Abstraktion, Prozess-, Speicher-, Dateisystem-, Netzwerkverwaltung.

### Distributionen
- **Debian**-Familie (`.deb`, `apt`/`dpkg`): Debian, Ubuntu, Mint. **Red-Hat**-Familie (`.rpm`, `dnf`/`yum`): RHEL, Fedora, CentOS Stream, AlmaLinux, Rocky. **SUSE**: openSUSE, SLES (`zypper`). Weitere: Arch, Gentoo, Alpine.
- Unterschiede: Paketformat/-verwaltung, Release-Zyklus (Rolling vs. Fixed/LTS), Support (kommerziell vs. Community), Standardsoftware.

### Einsatzgebiete
- **Embedded**: Router, Smart-TV, Auto, Raspberry Pi (Raspberry Pi OS), Android (Linux-Kernel). **Server/Cloud**: Mehrzahl der Webserver; Container (Docker), Cloud-Anbieter (AWS, Azure). **Desktop**, **Supercomputer** (praktisch alle TOP500).
- **Cloud-Modelle**: IaaS, PaaS, SaaS.

## Einfach

Alles begann mit **Unix**, einem alten Betriebssystem aus den 1970ern. Später wollten Leute eine **freie** Variante, die jeder benutzen und verbessern darf. Das GNU-Projekt baute fast alle Werkzeuge dafür, aber der Kern (das Herzstück, der **Kernel**) fehlte noch. 1991 schrieb ein Student, **Linus Torvalds**, genau diesen Kern und nannte ihn Linux.

Ein Kernel allein ist wie ein Motor ohne Auto. Erst mit Werkzeugen, Desktop und Programmen wird daraus etwas Nutzbares. Dieses fertige Paket heißt **Distribution**. Beispiele: Debian, Ubuntu, Fedora. Sie unterscheiden sich vor allem dadurch, wie man Programme installiert (Debian: `apt`, Fedora: `dnf`) und wie oft es Neuerungen gibt.

Linux steckt fast überall: in deinem Router, im Smart-TV, im Android-Handy und auf den meisten Servern im Internet. Auch in der **Cloud**, also auf Computern anderer Firmen, die du mietest, laufen meist Linux-Systeme.

Man kann sich Distributionen wie Automarken vorstellen: Alle haben denselben Motor-Typ (Linux-Kernel), aber unterschiedliche Karosserie und Ausstattung.

## Merksatz
- **Linux = Kernel; GNU/Linux = Kernel + Werkzeuge; Distribution = fertiges Paket.**
- **Debian: apt/.deb · Red Hat: dnf/.rpm · SUSE: zypper.**
- **Torvalds 1991, Stallman GNU 1983.**

## Prüfungsfalle
- „Linux“ im engen Sinn ist nur der **Kernel**.
- Android nutzt den Linux-Kernel, ist aber keine klassische GNU/Linux-Distribution.
- Ubuntu ist **Debian-basiert**, nicht Red-Hat-basiert.

## Grafik

### Von Unix zu Linux
1. Unix: 1969 an den Bell Labs entwickelt
2. GNU: 1983 freie Werkzeuge
3. Torvalds -> GNU: 1991 liefert den Linux-Kernel
4. GNU -> Distribution: Kernel + Werkzeuge werden gepackt
5. Distribution: Debian, Fedora, SUSE …

## Karteikarten
- F: Wer begann 1991 den Linux-Kernel? | A: Linus Torvalds.
- F: Wer gründete das GNU-Projekt? | A: Richard Stallman (1983).
- F: Was ist eine Distribution? | A: Kernel plus Software, Werkzeuge und Paketverwaltung.
- F: Welches Paketformat nutzt Debian? | A: .deb (apt/dpkg).
- F: Welches Paketformat nutzt Fedora/RHEL? | A: .rpm (dnf/yum).
- F: Nenne eine Distribution der SUSE-Familie. | A: openSUSE oder SLES.
- F: Was bedeutet Rolling Release? | A: Laufende Aktualisierung ohne feste Versionen (z. B. Arch).
- F: Wo wird Linux eingebettet verwendet? | A: Router, Smart-TV, Auto, Raspberry Pi.
- F: Was ist IaaS? | A: Infrastruktur als Dienst (virtuelle Server mieten).
- F: Auf welchem Kernel basiert Android? | A: Linux.

## Quiz
? Wer entwickelte 1991 den Linux-Kernel?
* Linus Torvalds
- Richard Stallman
- Dennis Ritchie
- Bill Gates

? Welche Distribution gehört zur Debian-Familie?
* Ubuntu
- Fedora
- openSUSE
- Rocky Linux

? Was ist der Linux-Kernel?
* Der Kern, der Hardware, Prozesse und Speicher verwaltet
- Eine Desktopumgebung
- Ein Paketmanager
- Eine Shell

? Welcher Paketmanager gehört zu Red Hat?
* dnf
- apt
- zypper
- pacman

? Welches Modell bietet virtuelle Server zum Mieten?
* IaaS
- SaaS
- DaaS only
- CaaS

? Welches Projekt lieferte die freien Werkzeuge?
* GNU
- BSD
- Mozilla
- Apache

? Was kennzeichnet ein Rolling Release?
* Ständige Updates ohne feste Versionssprünge
- Halbjährliche Releases
- Nur Sicherheitsupdates
- Keine Updates

? Wo läuft Linux NICHT als Kernel?
* In iOS
- In Android
- In Smart-TVs
- In Supercomputern

## Spickzettel
- 1969 Unix · 1983 GNU · 1991 Linux
- Debian apt/.deb · Red Hat dnf/.rpm · SUSE zypper
- Kernel ≠ Distribution
- IaaS/PaaS/SaaS
