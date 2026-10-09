---
id: linux-eckert-anhang-zertifizierung-macos-bsd
bereich: Linux
fach: Linux I
pruefungen: [LPIC-1, Schule]
block: CompTIA Linux+ / LPIC-1 (Eckert)
kapitel: Eckert – CompTIA Linux+ and LPIC-1 (6th Edition)
titel: Anhang A, C, D: Zertifizierung, macOS und FreeBSD
stufe: Fortgeschritten
quellen: [Eckert_J._W._and_triOS_College_-_CompTIA_Linux_and_LPIC-1_6th_Edition_-_2024.pdf]
verweise: [linux-eckert-k01-einfuehrung]
---

## Profi

### Anhang A – Zertifizierung
- **CompTIA Linux+** (Prüfung **XK0-005**): eine Prüfung, Domänen u. a. System Management, Services and User Management, Security, Automation/Orchestration/Scripting, Troubleshooting. **LPIC-1**: System Administrator mit zwei Prüfungen **101-500** und **102-500** (je 90 Min, 60 Fragen); Voraussetzung für LPIC-2. Das Buch bildet beide Prüfungen ab. Prüfung über Pearson VUE.
- Vorbereitung: Übungsprüfungen, Labs, Zeitmanagement, Prüfungsziele (Objectives) abhaken.

### Anhang B – Ressourcen
Dokumentation (`man`, `info`, `/usr/share/doc`), Distributions-Wikis, Foren, Mailinglisten, Projektseiten, LPI-/CompTIA-Zielvorgaben.

### Anhang C – macOS
macOS basiert auf **Darwin** (BSD-Unix), hat BASH/Zsh-Terminal, Dateisystem **APFS**, Pfade `/Users`, `/Applications`, `/Volumes`, Paketverwaltung via **Homebrew**. Viele Linux-Befehle funktionieren, aber BSD-Varianten (z. B. `ls`, `sed`, `ps` mit anderen Optionen); `open` startet Dateien/Programme, `diskutil` verwaltet Datenträger, `launchd` ersetzt init/systemd.

### Anhang D – FreeBSD
**FreeBSD** ist ein vollständiges BSD-Betriebssystem (Kernel + Userland aus einer Hand, BSD-Lizenz permissiv). Dateisysteme **UFS** und **ZFS**, Paketverwaltung `pkg` und **Ports**-Sammlung, Init per **rc** (`/etc/rc.conf`, `service`), Firewall `pf`/`ipfw`, Jails als Containertechnik. Gerätenamen wie `ada0`, Netzwerk `em0`/`igb0`.

## Einfach

Wer Linux-Prüfungen ablegen will, hat zwei Hauptwege. **CompTIA Linux+** besteht aus **einer** Prüfung. **LPIC-1** vom Linux Professional Institute besteht aus **zwei**: 101 und 102. Beide prüfen ähnliche Dinge: Befehle, Dateisystem, Benutzer, Netzwerk, Sicherheit und Skripte. Gute Vorbereitung heißt: Prüfungsziele durchgehen, im Labor üben und Probefragen lösen.

Zum Weiterlernen helfen die eingebauten Handbücher (`man`), Wikis der Distributionen und Foren.

Interessant ist auch ein Blick über den Tellerrand: **macOS** (Apple) und **FreeBSD** sind keine Linux-Systeme, aber sie stammen von **BSD-Unix** ab. Deshalb sehen Terminal und viele Befehle ähnlich aus. Wer Linux kann, findet sich dort schnell zurecht. Unterschiede gibt es bei Details, etwa bei der Paketverwaltung (`brew` auf dem Mac, `pkg` bei FreeBSD) und beim Starten von Diensten.

## Merksatz
- **Linux+ = 1 Prüfung (XK0-005), LPIC-1 = 2 Prüfungen (101 + 102).**
- **macOS und FreeBSD = BSD-Familie, nicht Linux.**
- **Prüfungsziele (Objectives) sind die Checkliste.**

## Prüfungsfalle
- LPIC-1 braucht **beide** Prüfungen für das Zertifikat.
- macOS-Befehle sind BSD-Varianten; Optionen können abweichen.
- FreeBSD nutzt **rc.conf**, nicht systemd.

## Grafik

### Zertifizierungswege
1. Lernender -> LPIC-1 101: Prüfung 1 bestehen
2. Lernender -> LPIC-1 102: Prüfung 2 bestehen
3. LPI -> Lernender: Zertifikat LPIC-1
4. Lernender -> CompTIA Linux+: alternativ XK0-005

## Karteikarten
- F: Wie viele Prüfungen hat LPIC-1? | A: Zwei (101-500 und 102-500).
- F: Wie viele Prüfungen hat CompTIA Linux+? | A: Eine (XK0-005).
- F: Worauf basiert macOS? | A: Darwin (BSD-Unix).
- F: Welches Dateisystem nutzt macOS? | A: APFS.
- F: Welcher Paketmanager ist auf macOS verbreitet? | A: Homebrew.
- F: Welcher Paketmanager gehört zu FreeBSD? | A: pkg (und Ports).
- F: Wie startet FreeBSD Dienste? | A: Über rc-Skripte und /etc/rc.conf.
- F: Was sind FreeBSD Jails? | A: Containerähnliche Isolierung.
- F: Wie heißt der Init-Ersatz auf macOS? | A: launchd
- F: Welche Lizenz hat FreeBSD? | A: BSD-Lizenz (permissiv).

## Quiz
? Wie viele Prüfungen gehören zu LPIC-1?
* Zwei
- Eine
- Drei
- Vier

? Welche Prüfungsnummer hat CompTIA Linux+ im Buch?
* XK0-005
- 101-500
- 102-500
- N10-008

? Worauf basiert macOS?
* Darwin/BSD
- Linux
- Windows NT
- Plan 9

? Welcher Paketmanager ist für macOS verbreitet?
* Homebrew
- apt
- dnf
- zypper

? Welche Init-Technik nutzt FreeBSD?
* rc-Skripte
- systemd
- Upstart
- SysV runlevels

? Was ist eine FreeBSD Jail?
* Containerähnliche Isolierung
- Ein Dateisystem
- Eine Firewall
- Ein Bootloader

? Welches Dateisystem nutzt macOS?
* APFS
- ext4
- XFS
- NTFS

? Welche Lizenz verwendet FreeBSD?
* BSD
- GPL
- AGPL
- Proprietär

## Spickzettel
- Linux+ XK0-005 · LPIC-1 101+102
- macOS: Darwin, APFS, brew, launchd
- FreeBSD: pkg/ports, rc.conf, pf, jails, ZFS
