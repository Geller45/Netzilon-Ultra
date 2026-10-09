---
id: linux-101-101-1-hardware
bereich: Linux
fach: Linux I
pruefungen: [LPIC-1]
block: LPIC-101
kapitel: LPIC-1 Prüfung 101 – Systemarchitektur
titel: 101.1 Hardwareeinstellungen bestimmen und konfigurieren
stufe: Fortgeschritten
quellen: [LPI-Learning-Material-101-500-de.pdf, 1.09_Linux_-_Hardware.pdf]
verweise: [linux-l1-09-hardware, linux-101-101-2-booten]
---

## Profi

### Lernziel (Gewicht 2)
Hardware aktivieren, erkennen und konfigurieren: BIOS/UEFI, Geräte, Kernelmodule, udev, sysfs/procfs, Massenspeicher, Coldplug/Hotplug.

### Firmware
- **BIOS/UEFI** initialisiert die Hardware (POST), liest Bootreihenfolge, UEFI nutzt GPT und die EFI System Partition (ESP), Secure Boot prüft Signaturen. Einstellungen: Boot-Reihenfolge, Virtualisierung, Geräte aktivieren/deaktivieren.

### Informationen über Hardware
| Befehl / Pfad | Zweck |
|---|---|
| `lspci` (`-v`, `-k`) | PCI-Geräte, `-k` zeigt Kerneltreiber |
| `lsusb` (`-t`, `-v`) | USB-Geräte/Baum |
| `lsblk`, `blkid`, `fdisk -l` | Blockgeräte, UUIDs |
| `lscpu`, `free`, `dmidecode` | CPU, RAM, Firmware-Daten |
| `lsmod`, `modinfo`, `modprobe`, `rmmod` | Kernelmodule |
| `/proc/cpuinfo`, `/proc/interrupts`, `/proc/ioports`, `/proc/dma`, `/proc/devices` | Kernelinfos |
| `/sys` (sysfs) | strukturierte Geräte- und Treiberinfos |
| `/dev` | Gerätedateien (Block `b`, Zeichen `c`) |

### Kernelmodule
- `modprobe modul` löst **Abhängigkeiten** auf (anders als `insmod`), `modprobe -r` entlädt; `depmod` baut `modules.dep`. Konfiguration in `/etc/modprobe.d/*.conf` (`options`, `blacklist`, `alias`); Autoload `/etc/modules(-load.d)`. Module liegen unter `/lib/modules/$(uname -r)/`.

### udev und Hotplug
- **udev** legt Gerätedateien dynamisch in `/dev` an (devtmpfs) und reagiert auf Kernel-Uevents. Regeln: `/usr/lib/udev/rules.d/` und `/etc/udev/rules.d/` (Admin-Regeln haben Vorrang). Tools: `udevadm info`, `udevadm monitor`, `udevadm trigger`. **Coldplug** = Geräte beim Start, **Hotplug** = im Betrieb. `dbus` meldet Ereignisse an Desktops.
- Massenspeicher: SATA/SCSI als `/dev/sdX`, NVMe `/dev/nvme0n1p1`, Hotplug-Festplatten per UUID einbinden. Netzwerkkarten heißen heute **predictable** (`enp0s3`).

## Einfach

Wenn du einen Computer startest, ist er wie ein **neues Klassenzimmer**: Der Lehrer (der Kernel) muss erst herausfinden, welche Schüler (Geräte) da sind und wie sie heißen. Zuerst schaut die **Firmware** (BIOS/UEFI) nach: „Ist die Tastatur da? Wo ist die Festplatte?“ und startet dann das Betriebssystem.

Mit Werkzeugen kannst du selbst nachsehen. `lspci` zeigt alle Karten im Rechner, `lsusb` alles, was am USB-Anschluss steckt, `lsblk` alle Festplatten. Das ist wie ein Klassenbuch.

Damit ein Gerät funktioniert, braucht es einen **Treiber**. Bei Linux sind Treiber oft **Module**: kleine Programmbausteine, die man bei Bedarf einsteckt (`modprobe`) oder wieder herauszieht (`modprobe -r`). `modprobe` ist klug und holt benötigte Hilfsbausteine gleich mit. `insmod` ist dumm: Es steckt nur den einen Baustein ein.

Stöpselst du einen USB-Stick ein, bekommt er ohne dein Zutun einen Namen wie `/dev/sdb`. Dafür sorgt der **Türsteher udev**: Er merkt, dass jemand reinkommt, und trägt ihn in die Anwesenheitsliste `/dev` ein. Eigene Regeln kannst du in `/etc/udev/rules.d/` schreiben. Wenn du wissen willst, was wirklich passiert, schaust du ihm mit `udevadm monitor` über die Schulter.

## Merksatz
- **lspci = Karten, lsusb = Stecker, lsblk = Platten.**
- **modprobe holt Abhängigkeiten, insmod nicht.**
- **udev legt /dev dynamisch an.**
- **/proc = Prozess- und Kernelinfos, /sys = Geräte.**
- **Coldplug beim Start, Hotplug im Betrieb.**

## Prüfungsfalle
- `insmod` löst keine Abhängigkeiten auf, `modprobe` schon.
- `lspci -k` zeigt den **verwendeten** Treiber; `lsmod` nur geladene Module.
- Blacklisten in `/etc/modprobe.d/`, nicht in `/etc/modules`.
- Admin-udev-Regeln liegen in `/etc/udev/rules.d/` und haben Vorrang.
- `/dev/sda1` ist die erste **Partition** der Platte, `/dev/sda` die Platte selbst.
- `dmesg` zeigt Kernelmeldungen beim Einstecken eines Geräts.

## Grafik

### Hotplug eines USB-Sticks
1. USB-Stick -> Kernel: wird erkannt, Uevent
2. Kernel -> udev: Ereignis "add" für Blockgerät
3. udev: prüft Regeln in /etc/udev/rules.d
4. udev -> /dev: legt /dev/sdb und /dev/sdb1 an
5. Kernel -> Desktop: Gerät steht zum Einbinden bereit

## Lab
**Maschine**: debian01.
```bash
# auf debian01
lspci -k | head -20
lsusb -t
lsblk -f
lscpu | head
lsmod | head
modinfo e1000
sudo modprobe -r loop && sudo modprobe loop
cat /proc/interrupts | head
udevadm monitor --environment   # USB-Stick ein-/ausstecken
```

## Befehle
- `lspci -k` – PCI-Geräte mit Treiber
- `lsusb` – USB-Geräte
- `lsblk` – Blockgeräte
- `lsmod` – geladene Module
- `modprobe name` – Modul laden
- `modprobe -r name` – Modul entladen
- `modinfo name` – Modulinfos
- `udevadm monitor` – Ereignisse beobachten
- `dmesg` – Kernelpuffer

## Übungen
- A: Welcher Befehl zeigt PCI-Geräte samt Treiber? | L: lspci -k
- A: Wie sperrst du das Modul nouveau? | L: blacklist nouveau in /etc/modprobe.d/*.conf
- A: Unterschied modprobe/insmod? | L: modprobe löst Abhängigkeiten auf, insmod lädt nur die angegebene Datei.
- A: Wo liegen eigene udev-Regeln? | L: /etc/udev/rules.d/
- A: Wie heißt die Verzeichnisstruktur für Geräteinformationen im Kernel? | L: /sys (sysfs)

## Karteikarten
- F: Was ist UEFI? | A: Nachfolger des BIOS; nutzt GPT und die ESP, unterstützt Secure Boot.
- F: Welcher Befehl listet USB-Geräte? | A: lsusb
- F: Welcher Befehl listet geladene Kernelmodule? | A: lsmod
- F: Wo liegen Kernelmodule? | A: /lib/modules/$(uname -r)/
- F: Was macht udev? | A: Legt Gerätedateien in /dev dynamisch an und verarbeitet Hardware-Ereignisse.
- F: Was ist Coldplug? | A: Erkennen der Geräte, die beim Systemstart vorhanden sind.
- F: Wofür steht /proc/interrupts? | A: Zeigt Interrupts (IRQs) und deren Zähler je CPU.
- F: Welche Datei blockiert das Laden eines Moduls? | A: Eine blacklist-Zeile in /etc/modprobe.d/.
- F: Wie heißt die erste Partition einer NVMe-SSD? | A: /dev/nvme0n1p1
- F: Welcher Befehl baut modules.dep? | A: depmod

## Quiz
? Welcher Befehl lädt ein Kernelmodul inklusive Abhängigkeiten?
* modprobe
- insmod
- lsmod
- depmod -a

? Wo legt man Admin-udev-Regeln ab?
* /etc/udev/rules.d/
- /lib/udev/
- /dev/rules
- /proc/udev

? Welcher Befehl zeigt die vom Kernel genutzten Treiber der PCI-Geräte?
* lspci -k
- lsusb -v
- lsmod -p
- lshw -c

? Was zeigt /proc/interrupts?
* Interrupt-Nutzung
- Ladezustand der Module
- USB-Geräte
- Blockgeräte

? Wie heißt die erste Partition der Platte sda?
* /dev/sda1
- /dev/sda0
- /dev/sd1a
- /dev/hda1

? Was ist die ESP?
* EFI System Partition für Bootloader
- Eine Auslagerungspartition
- Ein BIOS-Chip
- Ein Treiber

? Welcher Befehl beobachtet udev-Ereignisse live?
* udevadm monitor
- udevctl watch
- dmesg -w
- lsudev

? Was bedeutet Hotplug?
* Geräte im laufenden Betrieb anschließen
- Geräte nur beim Boot erkennen
- Geräte formatieren
- Treiber kompilieren

## Spickzettel
- lspci -k · lsusb · lsblk · lscpu · dmidecode
- modprobe (+Abh.) · insmod (nur Datei) · rmmod · lsmod · depmod
- /etc/modprobe.d: blacklist, options
- udev: /etc/udev/rules.d · udevadm
- /proc (Kernel) · /sys (Geräte) · /dev
