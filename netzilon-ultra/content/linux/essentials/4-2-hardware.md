---
id: linux-ess-hardware
bereich: Linux
fach: Linux I
pruefungen: [LPIC-1, Schule]
block: Linux Essentials
kapitel: Thema 4 – Das Linux-Betriebssystem
titel: 4.2 Verständnis von Computer-Hardware
stufe: Einsteiger
quellen: [LPI-Learning-Material-010-160-de.pdf]
verweise: [linux-l1-09-hardware,linux-101-101-1-hardware]
---

## Profi

### Lernziel (Gewicht 2)
Hardwarekomponenten kennen, Hardware unter Linux erkennen, Treiber/Firmware verstehen.

### Komponenten
- **CPU** (Takt, Kerne, Threads, Architektur x86_64/ARM, Cache), **RAM** (flüchtig, ECC bei Servern), **Mainboard** (Chipsatz, Sockel, BIOS/UEFI), **Massenspeicher** (HDD, SSD SATA/NVMe), **Netzteil**, **Grafik**, **Schnittstellen** (USB, SATA, PCIe, HDMI, Ethernet), **Peripherie**. Formfaktoren ATX/ITX, Server (Rack, Blade). Gehäuse/Kühlung.
- **Firmware**: BIOS/UEFI, Controllerfirmware. **Bootvorgang**: Firmware → Bootloader → Kernel → init/systemd.

### Hardware unter Linux
- Der **Kernel** enthält Treiber (Module, `lsmod`, `modprobe`, `modinfo`). Geräte erscheinen als Dateien in `/dev` (`/dev/sda`, `/dev/nvme0n1`, `/dev/tty`, `/dev/null`). Pseudo-Dateisysteme `/proc` (z. B. `/proc/cpuinfo`, `/proc/meminfo`) und `/sys`. **udev** erzeugt Gerätedateien dynamisch.
- Werkzeuge: `lscpu`, `free -h`, `lsblk`, `lspci` (`-k` Treiber), `lsusb`, `lshw`, `dmidecode` (BIOS/Hardware, root), `dmesg`, `hwinfo`, `inxi`.

### Speicherbegriffe
Bit/Byte, KiB/MiB/GiB (1024) vs. kB/MB/GB (1000). Swap als Ausweichspeicher.

## Einfach

Ein Computer besteht aus Bauteilen, die zusammenarbeiten, wie die Mitglieder einer Band.

Die **CPU** ist der Dirigent: Sie rechnet und gibt den Takt an. Der **Arbeitsspeicher (RAM)** ist der Schreibtisch: Alles, woran du gerade arbeitest, liegt dort, aber beim Ausschalten wird er leergeräumt. Die **Festplatte oder SSD** ist der Aktenschrank: Dort bleiben die Daten dauerhaft. Das **Mainboard** verbindet alles miteinander, wie die Hauptplatine in einem Radio.

Unter Linux ist **jedes Gerät eine Datei** im Ordner `/dev`. Die erste Festplatte heißt zum Beispiel `/dev/sda`. Wie bekommt man heraus, was im Rechner steckt? Mit kleinen Befehlen: `lscpu` zeigt den Prozessor, `free -h` den Arbeitsspeicher, `lsblk` die Datenträger, `lspci` die Steckkarten und `lsusb` die USB-Geräte.

Damit ein Gerät funktioniert, braucht es einen **Treiber**. Bei Linux stecken die meisten Treiber schon im Kernel, sodass vieles sofort läuft. Fehlt einer, hilft oft ein nachladbares **Modul** (`modprobe`).

Merke auch: 1 GB sind für Hersteller 1000 MB, für Computer aber 1024 MiB. Deshalb zeigt dein Rechner manchmal etwas weniger Platz an, als auf der Verpackung steht.

## Merksatz
- **CPU rechnet, RAM merkt kurz, SSD/HDD speichert dauerhaft.**
- **lscpu, free, lsblk, lspci, lsusb.**
- **Alles ist eine Datei: /dev.**
- **Treiber = Kernelmodule (lsmod, modprobe).**

## Prüfungsfalle
- RAM ist **flüchtig**, SSD/HDD nicht.
- `/proc` und `/sys` sind **virtuelle** Dateisysteme.
- `lspci` listet PCI-Geräte, `lsusb` USB-Geräte.
- KiB (1024) ≠ kB (1000).

## Grafik

### Hardware und Kernel
1. Gerät -> Kernel: wird angeschlossen
2. Kernel -> udev: Ereignis melden
3. udev -> /dev: Gerätedatei anlegen
4. Kernel: passendes Modul laden
5. Benutzer -> Gerät: Zugriff über /dev

## Befehle
- `lscpu` – CPU-Info
- `free -h` – Speicher
- `lsblk` – Blockgeräte
- `lspci -k` – PCI mit Treiber
- `lsusb` – USB-Geräte
- `lsmod` – geladene Module
- `dmesg | tail` – Kernelmeldungen

## Übungen
- A: Wie zeigst du den freien RAM lesbar an? | L: `free -h`
- A: Wie listest du Festplatten und Partitionen? | L: `lsblk`
- A: Wie lädst du das Modul "snd" nach? | L: `sudo modprobe snd`

## Karteikarten
- F: Was ist flüchtiger Speicher? | A: RAM.
- F: Welcher Befehl zeigt PCI-Geräte? | A: lspci
- F: Welcher Befehl zeigt USB-Geräte? | A: lsusb
- F: Welches Verzeichnis enthält Gerätedateien? | A: /dev
- F: Was ist /proc? | A: Virtuelles Dateisystem mit Kernel-/Prozessinfos.
- F: Wie heißt die erste SATA-Platte? | A: /dev/sda
- F: Wie heißt eine NVMe-SSD? | A: /dev/nvme0n1
- F: Was lädt Module? | A: modprobe
- F: Was ist UEFI? | A: Moderne Firmware, Nachfolger des BIOS.
- F: Was ist Swap? | A: Auslagerungsbereich auf dem Datenträger für RAM.

## Quiz
? Welcher Befehl zeigt Informationen zur CPU?
* lscpu
- lsblk
- lsusb
- free

? Welcher Speicher ist flüchtig?
* RAM
- SSD
- HDD
- USB-Stick

? Wo liegen Gerätedateien?
* /dev
- /etc
- /proc
- /mnt

? Wie heißt die erste SATA-Festplatte?
* /dev/sda
- /dev/hda1
- /dev/disk0
- /dev/c

? Welcher Befehl lädt ein Kernelmodul?
* modprobe
- insmod only
- lsmod
- depmod -a

? Was ist /sys?
* Virtuelles Dateisystem für Geräte- und Kernelinfos
- Systembackups
- Swap-Verzeichnis
- Bootverzeichnis

? Welcher Befehl listet Blockgeräte?
* lsblk
- lspci
- free
- uname

? Welche Einheit ist 1024 Byte?
* KiB
- kB
- Kb
- Kbit

## Spickzettel
- lscpu · free -h · lsblk · lspci · lsusb · lsmod
- /dev /proc /sys
- sda · nvme0n1
- Treiber = Kernelmodule
