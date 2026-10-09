---
id: linux-eckert-k02-installation-nutzung
bereich: Linux
fach: Linux I
pruefungen: [LPIC-1, Schule]
block: CompTIA Linux+ / LPIC-1 (Eckert)
kapitel: Eckert – CompTIA Linux+ and LPIC-1 (6th Edition)
titel: Kap. 2 Linux-Installation und Nutzung
stufe: Fortgeschritten
quellen: [Eckert_J._W._and_triOS_College_-_CompTIA_Linux_and_LPIC-1_6th_Edition_-_2024.pdf]
verweise: [linux-l1-01-kommandos,linux-ess-befehlszeile]
---

## Profi

### Vorbereitung
Hardwareanforderungen und -kompatibilität prüfen (CPU-Architektur, RAM, Platz, Firmware **BIOS/UEFI**). Installationsmedium: **ISO-Image** auf DVD/USB brennen oder direkt in einer VM nutzen; **Live-Medien** (Test ohne Installation); Netzinstallation per **PXE** (Preboot eXecution Environment).

### Speicher und Partitionierung
- Laufwerkstypen: **PATA/IDE**, **SATA**, **SCSI/SAS**, **NVMe**. Partitionstabellen **MBR** (bis 2 TiB, max. 4 primäre Partitionen, eine als erweitert mit logischen Laufwerken) vs. **GPT** (GUID Partition Table, > 2 TiB, 128 Partitionen, nötig für UEFI-Boot mit **EFI System Partition**). **BIOS Boot Partition** für GRUB auf GPT mit BIOS.
- Typische Aufteilung: `/boot`, `/` (Root), `/home`, `/var`, **Swap** (virtueller Speicher; Faustregel RAM-abhängig), **LVM** zur flexiblen Verwaltung. Dateisysteme mit **Journaling** (ext4, XFS, Btrfs). **zswap** komprimiert Swap im RAM.

### Installationsablauf
Sprache, Tastatur, Zeitzone, Netzwerk, Benutzerkonto/Root-Passwort, Partitionierung, Paketauswahl, Bootloader, Neustart.

### Terminals und Shell
- Anmeldung an **Terminal** (virtuelle Konsolen `Strg+Alt+F1…F6`, grafisches Terminal, SSH). Standard-Shell **BASH** (Bourne Again SHell); POSIX-Standard. Befehl: `befehl -option argument`. Groß/Kleinschreibung beachten. **Metazeichen** (`* ? [ ] $ ~ \ ' " | & ;` …) muss man quoten (`\`, `' '`, `" "`).
- Hilfe: `man` (Seiten in Sektionen), `info`, `--help`. Nützlich: `clear`, `reset`, `date`, `cal`, `uname -a`, `who`, `w`, `whoami`, `shutdown -h now`/`poweroff`, `reboot`, `exit`, Tab-Vervollständigung, Befehlsverlauf (`history`, Pfeiltasten).

## Einfach

Bevor du Linux installierst, prüfst du, ob dein Rechner passt: Genug Arbeitsspeicher, genug Plattenplatz, und passt die Hardware? Dann lädst du ein **ISO-Abbild** der Distribution herunter und schreibst es auf einen USB-Stick oder nutzt es in einer virtuellen Maschine. Viele Distributionen starten auch als **Live-System** zum Ausprobieren.

Bei der Installation beantwortest du Fragen: Sprache, Tastatur, Zeitzone, Benutzername und Passwort. Die wichtigste Frage: **Wohin soll Linux auf der Festplatte?** Die Platte wird in **Partitionen** (Abschnitte) geteilt. Es gibt zwei Arten von Partitionstabellen: das alte **MBR** (maximal 4 Hauptpartitionen, bis 2 TB) und das moderne **GPT** (praktisch unbegrenzt). Moderne Rechner mit **UEFI** benutzen GPT und brauchen eine kleine **EFI-Partition** zum Starten. Zusätzlich legt man oft einen **Swap-Bereich** an, das ist Auslagerungsplatz für den Arbeitsspeicher.

Nach der Installation meldest du dich an einem **Terminal** an und landest in der **Shell** (meist BASH). Dort tippst du Befehle: erst das Wort, dann Optionen, dann Argumente. Die Shell unterscheidet Groß- und Kleinschreibung. Sonderzeichen wie `*` oder `$` haben eine Bedeutung. Willst du sie als ganz normalen Text, musst du sie mit `\` oder Anführungszeichen schützen.

Wenn du nicht weiterweißt: `man befehl` zeigt die Anleitung.

## Merksatz
- **MBR: 4 Primär, 2 TiB. GPT: 128+, riesig, UEFI.**
- **ISO → USB/VM; Live testet, Installation schreibt.**
- **Metazeichen quoten: \ ' ".**
- **Shell ist case-sensitiv.**

## Prüfungsfalle
- Auf MBR sind max. **vier primäre** Partitionen möglich (oder 3 + 1 erweiterte).
- UEFI-Systeme brauchen eine **EFI System Partition** (FAT32).
- `shutdown -h` hält an, `-r` startet neu.
- Swap ist kein Dateisystem für Benutzerdaten.

## Grafik

### Installation
1. Admin -> USB-Stick: ISO-Image schreiben
2. Admin -> Firmware: von USB booten
3. Installer -> Admin: Sprache, Zeitzone, Benutzer abfragen
4. Installer -> Festplatte: Partitionen, Dateisysteme anlegen
5. Installer: Pakete und Bootloader installieren
6. Admin: Neustart, erster Login

## Befehle
- `man befehl` – Handbuch
- `uname -a` – Systeminfo
- `who` / `w` – angemeldete Benutzer
- `shutdown -h now` – ausschalten
- `reboot` – neu starten
- `clear` – Bildschirm leeren
- `history` – Verlauf

## Übungen
- A: Wie viele primäre Partitionen erlaubt MBR? | L: Vier.
- A: Welche Partition braucht UEFI zum Booten? | L: EFI System Partition (ESP).
- A: Wie leert man das Terminal? | L: `clear`

## Karteikarten
- F: Was ist ein ISO-Image? | A: Abbild einer Installationsmedien-Daten, z. B. zum Brennen auf USB.
- F: Was ist PXE? | A: Netzwerkboot und -installation.
- F: Was ist ein Live-Medium? | A: Bootbares System ohne Installation.
- F: Maximale Plattengröße bei MBR? | A: 2 TiB.
- F: Wofür steht GPT? | A: GUID Partition Table.
- F: Was ist die ESP? | A: EFI System Partition für UEFI-Bootloader.
- F: Was ist Swap? | A: Virtueller Speicher auf Platte.
- F: Was ist die Standard-Shell? | A: BASH.
- F: Was ist ein Metazeichen? | A: Zeichen mit besonderer Bedeutung für die Shell.
- F: Wie schützt man Metazeichen? | A: Mit \ oder Anführungszeichen.

## Quiz
? Wie viele primäre Partitionen kennt MBR maximal?
* 4
- 2
- 8
- 128

? Welche Partition benötigt UEFI zum Booten?
* EFI System Partition
- BIOS Boot Partition
- Swap
- /home

? Was ist die typische Standard-Shell?
* BASH
- CSH
- SH only
- DASH only

? Was bedeutet GPT?
* GUID Partition Table
- General Partition Type
- GNU Partition Tool
- Global Path Table

? Was ermöglicht PXE?
* Installation/Boot über das Netzwerk
- USB-Boot
- Partitionierung
- Verschlüsselung

? Was bewirkt ein Backslash \ vor einem Metazeichen?
* Das Zeichen verliert seine Sonderbedeutung
- Löscht die Zeile
- Startet eine Pipe
- Kommentiert

? Wozu dient ein Live-Medium?
* System ohne Installation testen oder reparieren
- Daten sichern
- BIOS aktualisieren
- Netzwerkdienste hosten

? Wie hält man das System sofort an?
* shutdown -h now
- shutdown -r now
- reboot
- exit

## Spickzettel
- ISO → Live/Install · PXE
- MBR 2 TiB 4 primär · GPT UEFI ESP
- BASH · Metazeichen quoten
- man · shutdown · reboot
