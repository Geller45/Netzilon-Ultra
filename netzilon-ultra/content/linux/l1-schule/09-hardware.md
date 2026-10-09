---
id: linux-l1-09-hardware
bereich: Linux
fach: Linux I
pruefungen: [LPIC-1, Schule]
block: L1
kapitel: Linux I – Grundlagen
titel: 1.09 Hardware erkennen – /proc, /sys, /dev, lspci, Kernelmodule, udev
stufe: Fortgeschritten
quellen: [1.09_Linux_-_Hardware.pdf, LPI-Learning-Material-101-500-de.pdf]
verweise: [linux-101-101-1-hardware, linux-l1-07-datentraeger, linux-l1-06-booten, linux-l2-15-netzwerke, ap1-a1-mainboard]
---

## Profi

### Einordnung
**101.1** Hardwareeinstellungen ermitteln und konfigurieren (Gewicht 2) – Prüfung 101. Vertiefung **LPIC-2 201.3** (depmod, modprobe.d, udev-Regeln, sysctl). dmesg und Speichertypen = Praxis-Bonus. Das Skript ist als Ticket-Woche aufgebaut (Inventur srv-db04, fehlende 2. Netzwerkkarte, Blacklist, feste Gerätenamen, Routing).

### Die drei virtuellen Dateisysteme
| Pfad | Inhalt | Beispiele |
|---|---|---|
| **`/proc`** (procfs) | Kernel-Sicht auf **Prozesse** und Kernel-Infos | `/proc/cpuinfo`, `/proc/meminfo`, `/proc/interrupts` (IRQs), `/proc/ioports`, `/proc/dma`, `/proc/cmdline`, `/proc/modules`, `/proc/sys/` |
| **`/sys`** (sysfs) | Kernel-Sicht auf **Geräte, Treiber, Busse** | `/sys/class/net/`, `/sys/block/`, `/sys/bus/pci/devices/` |
| **`/dev`** (devtmpfs) | **Gerätedateien**, von **udev** verwaltet | `/dev/sda`, `/dev/nvme0n1`, `/dev/ttyS0`, `/dev/null` |
Sie liegen **nicht auf der Platte** – der Kernel erzeugt sie zur Laufzeit. **D-Bus** = Nachrichtenbus, über den Programme (z. B. Desktop, NetworkManager) Hardware-Ereignisse austauschen (101.1: konzeptionelles Verständnis von sysfs, udev, dbus).

### Hardware auflisten
| Befehl | Zweck |
|---|---|
| `lspci` | PCI(e)-Geräte (Grafik, Netzwerk, Controller); `-v` ausführlich, **`-k`** Kernel-Treiber/Modul, `-nn` Vendor-/Device-IDs, `-s 03:00.0` ein Gerät |
| `lsusb` | USB-Geräte mit **Vendor:Produkt-ID** (`0781:5567`); `-v` Details, **`-t`** Baum (Hub/Port), `-d 0781:` nach Hersteller |
| `lscpu` | CPU: Modell, Kerne/Threads, Architektur, Caches, Virtualisierung |
| `lsblk` | Blockgeräte (Platten, Partitionen); `lsblk -d -o NAME,TRAN` mit Anschlusstyp |
| `lshw` | vollständige Hardware-Liste (als root; `-short`, `-class network`) |
| `dmidecode` | BIOS, Mainboard, **RAM** aus **DMI/SMBIOS** (root; `-t memory`, `-t bios`) |
| `lsdev`, `hwinfo` | weitere Übersichten (nicht überall installiert) |
- Inventur-Beispiel: `grep MHz /proc/cpuinfo`, `grep MemTotal /proc/meminfo`, `lscpu | grep -E "Model name|CPU\(s\)"`, `sudo dmidecode -t memory | grep -i size`, `lsblk`.
- **Integrierte Peripherie** (Onboard-Sound, -NIC, USB-Controller, Virtualisierung VT-x/AMD-V, Bootreihenfolge) wird im **BIOS/UEFI-Setup** aktiviert/deaktiviert – Linux sieht deaktivierte Geräte nicht.

### Kernelmodule (101.1)
- Treiber sind unter Linux meist **Kernelmodule** (`.ko`-Dateien unter `/lib/modules/$(uname -r)/`), die zur Laufzeit **ohne Reboot** geladen werden – der Kernel bleibt schlank.
- **Fehlerbild** (Ticket #4728): `lspci` zeigt die Intel X550, aber `lspci -k` meldet **kein „Kernel driver in use“** und `ip link` kein zweites Interface → kein zuständiges Modul geladen.
| Befehl | Wirkung |
|---|---|
| **`lsmod`** | geladene Module mit Größe und „Used by“ (aus `/proc/modules`) |
| **`modinfo modul`** | Datei, Beschreibung, Parameter, Abhängigkeiten – auch für **nicht geladene** Module |
| **`modprobe modul`** | Modul **mit Abhängigkeiten** laden, findet es automatisch (`modprobe ixgbe`) |
| **`modprobe -r modul`** | Modul (und unbenutzte Abhängigkeiten) entladen |
| `insmod /pfad/modul.ko` | Low-Level-Laden, **voller Pfad**, **keine** Abhängigkeitsauflösung |
| `rmmod modul` | Low-Level-Entladen |
| `modprobe modul param=wert` | mit Parameter laden |
Erfolg kontrollieren: `lsmod | grep ixgbe`, `ip link`. Module, die gerade benutzt werden („Used by“ > 0), lassen sich nicht entladen.

### Vertiefung LPIC-2 201.3
- **`depmod -a`** baut die Abhängigkeitsdatenbank **`modules.dep`** – Grundlage für modprobe.
- **`/etc/modprobe.d/*.conf`**: `options snd_hda_intel index=1`, `alias`, **`blacklist nouveau`** (verhindert automatisches Laden, z. B. für den proprietären NVIDIA-Treiber; danach initramfs aktualisieren). Beim Boot zu ladende Module: **`/etc/modules-load.d/*.conf`** (Debian zusätzlich `/etc/modules`).
- **udev** = Geräte-Manager im **User Space**: reagiert auf **uevents** des Kernels (Hotplug), legt Einträge in `/dev` an, lädt Treiber, setzt Rechte und Symlinks. `udevadm monitor` (Events live), `udevadm info /dev/sdb`, `udevadm info -a` (Attribute für Regeln), `udevadm control --reload`, `udevadm trigger`.
- **Eigene Regeln** in **`/etc/udev/rules.d/*.rules`** (Systemregeln: `/usr/lib/udev/rules.d/`):
```text
# /etc/udev/rules.d/99-backup.rules
SUBSYSTEM=="block", ATTRS{idVendor}=="0781", SYMLINK+="backup"
```
→ `/dev/backup -> sdb`, egal an welchem Port. `==` vergleicht, `=`/`+=` weist zu.
- **sysctl** liest/ändert **Kernel-Parameter** zur Laufzeit (= Dateien unter **`/proc/sys/`**): `sysctl -a`, `sysctl net.ipv4.ip_forward`, `sysctl -w net.ipv4.ip_forward=1` (temporär); dauerhaft in **`/etc/sysctl.conf`** bzw. `/etc/sysctl.d/*.conf`, laden mit `sysctl -p` bzw. `sysctl --system`. `ip_forward=1` macht aus einem Linux-Host einen **Router**.

### Bonus: dmesg und Massenspeicher
- **`dmesg -w`** läuft live mit (Gerät einstecken → „new high-speed USB device“, „[sdb] … blocks“, „sdb: sdb1“); `dmesg | grep -i usb`. Kein /dev-Eintrag? dmesg zeigt, ob der Kernel das Gerät überhaupt sieht.
| Typ | Gerätename | Einsatz |
|---|---|---|
| SATA/AHCI (SSD/HDD) | `/dev/sdX` | Archiv, günstige Kapazität |
| **NVMe** (PCIe) | `/dev/nvme0n1`, Partition `/dev/nvme0n1p1` | Datenbank, geringe Latenz |
| USB-Storage | `/dev/sdX` | Transport, Backup |
| virtuelle Platten (virtio) | `/dev/vdX` | KVM-Gäste |
| optisch | `/dev/sr0` | CD/DVD |

## Einfach

Stell dir vor, du bekommst einen **neuen Computer im verschlossenen Karton** und sollst sagen, was drin ist – **ohne ihn aufzuschrauben**. Linux kann das!

Der **Kernel** führt drei **Notizbücher**, die er ständig aktualisiert:
- **`/proc`** – das **Tagebuch**: Welche Programme laufen, wie viel Speicher ist da, welcher Prozessor?
- **`/sys`** – das **Inventarbuch**: Welche Geräte sind angeschlossen, welcher Treiber gehört dazu?
- **`/dev`** – das **Klingelschild-Brett**: Jedes Gerät bekommt ein Klingelschild (`/dev/sda` für die erste Platte). Wer klingelt, spricht mit dem Gerät.

Diese Notizbücher liegen nicht wirklich auf der Festplatte – der Kernel **schreibt sie live**, während du hineinschaust.

Mit **`lspci`** fragst du: „Was steckt **innen auf der Hauptplatine**?“ (Grafikkarte, Netzwerkkarte). Mit **`lsusb`** fragst du: „Was hängt **außen an den USB-Buchsen**?“ **`lscpu`** zeigt den Prozessor, **`lsblk`** die Festplatten.

**Treiber** heißen bei Linux **Kernelmodule**. Sie sind wie **Steckkarten für das Gehirn des Computers**: Wenn eine neue Netzwerkkarte da ist, steckt man das passende Modul ein, und der Kernel versteht plötzlich das Gerät – ohne Neustart.
- **`lsmod`** = „Welche Steckkarten stecken gerade?“
- **`modinfo`** = „Lies mir die Beschreibung dieser Steckkarte vor.“
- **`modprobe`** = „Steck diese Karte ein – **und alle, die sie braucht**.“
- **`insmod`** = nur genau diese eine Karte, ohne Helfer – oft klappt das dann nicht.

**udev** ist der **Pförtner**: Wenn du einen USB-Stick einsteckst, meldet ihn der Kernel, und udev hängt sofort ein Klingelschild an (`/dev/sdb`). Mit einer **eigenen Regel** kannst du sagen: „Diese eine Backup-Platte bekommt **immer** das Schild `/dev/backup`.“

**sysctl** ist ein **Schaltpult für den Kernel**: Mit einem Schalter (`ip_forward=1`) wird dein Computer zum **Router**, der Pakete weiterreicht.

## Merksatz
- **/proc = Prozesse, /sys = Geräte, /dev = Gerätedateien**.
- **lspci innen, lsusb außen, lspci -k zeigt den Treiber**.
- **modprobe denkt mit (Abhängigkeiten), insmod nicht**.
- **lsmod = was läuft, modinfo = was kann es**.
- **dmidecode liest das Typenschild (BIOS, RAM)**.
- **blacklist in /etc/modprobe.d, Regeln in /etc/udev/rules.d, Tuning in /etc/sysctl.conf**.

## Prüfungsfalle
- **modprobe** löst Abhängigkeiten auf und braucht nur den Modulnamen; **insmod** braucht den **vollen Pfad** und lädt keine Abhängigkeiten. Korrektur zum Skript: Im Ticket #4728 war **modprobe** die richtige Wahl, nicht insmod.
- **`modprobe -r`** entlädt – nicht „reload“.
- `lsmod` liest `/proc/modules` – es zeigt **keine** verfügbaren, nur **geladene** Module.
- **`/dev`** wird von **udev** (User Space) gepflegt, **`/sys`** vom Kernel.
- `sysctl -w` / `sysctl name=wert` wirkt nur **bis zum Neustart**; dauerhaft in `/etc/sysctl.conf` bzw. `/etc/sysctl.d/`.
- Geräte, die im **BIOS/UEFI deaktiviert** sind, erscheinen nicht in lspci.
- NVMe-Partitionen heißen `nvme0n1p1`, nicht `nvme0n11`.
- `dmidecode` und `lshw` brauchen **root**.

## Grafik

### Treiber laden – zweite Netzwerkkarte
1. Admin -> lspci: lspci -k -s 05:00.0
2. lspci -> Admin: Intel X550, kein Kernel driver in use
3. Admin -> modinfo: modinfo ixgbe zeigt Datei und Abhängigkeiten
4. Admin -> modprobe: sudo modprobe ixgbe
5. modprobe -> Kernel: lädt Abhängigkeiten und ixgbe.ko
6. Kernel -> Netzwerkkarte: Treiber bindet sich an das Gerät
7. Kernel: neues Interface ens19 erscheint (ip link)

### USB-Hotplug mit udev
1. USB-Platte -> Kernel: wird eingesteckt
2. Kernel -> udev: uevent add …/sdb
3. udev -> rules.d: prüft Regeln (idVendor 0781)
4. udev -> /dev: legt /dev/sdb und Symlink /dev/backup an
5. udev -> D-Bus: meldet das Gerät an den Desktop
6. Admin -> dmesg: sieht „sdb: sdb1“

### Inventur ohne Schraubendreher
1. Admin -> /proc: cpuinfo und meminfo – CPU und RAM
2. Admin -> lspci: Grafik, Netzwerk, Controller
3. Admin -> lsusb: USB-Geräte mit IDs
4. Admin -> lsblk: NVMe und SATA-Platten
5. Admin -> dmidecode: BIOS, Board, RAM-Module

## Lab
**Maschine**: debian01 (VM; für udev-Übung einen USB-Stick an die VM durchreichen, sonst nur ansehen).
```bash
# auf debian01 – virtuelle Dateisysteme
grep -m1 "model name" /proc/cpuinfo; grep MemTotal /proc/meminfo
cat /proc/interrupts | head; cat /proc/ioports | head -5
ls /sys/class/net/; ls -l /dev/sd* /dev/nvme* 2>/dev/null

# auf debian01 – Inventur (Ticket #4726)
lspci; lspci -k | grep -A3 -i ethernet; lspci -nn | head -3
lsusb; lsusb -t
lscpu | grep -E "Model name|^CPU\(s\)|Virtualization"
lsblk -d -o NAME,SIZE,TRAN,MODEL
sudo lshw -short | head -20
sudo dmidecode -t memory | grep -i -E "size|speed" | head

# auf debian01 – Kernelmodule (Ticket #4728)
lsmod | head; lsmod | wc -l
modinfo e1000 | head -5                # oder virtio_net / hv_netvsc je nach VM
sudo modprobe dummy && lsmod | grep dummy && ip link show type dummy
sudo modprobe -r dummy; lsmod | grep dummy || echo "entladen"
ls /lib/modules/$(uname -r)/kernel/drivers/net | head

# auf debian01 – LPIC-2: blacklist, udev, sysctl
echo "blacklist pcspkr" | sudo tee /etc/modprobe.d/blacklist-pcspkr.conf
sudo udevadm monitor --kernel --udev     # Stick einstecken, Strg+C
udevadm info -a /dev/sdb 2>/dev/null | grep -m3 -i -E "idVendor|idProduct"
sysctl net.ipv4.ip_forward
sudo sysctl -w net.ipv4.ip_forward=1
echo "net.ipv4.ip_forward = 1" | sudo tee /etc/sysctl.d/99-router.conf; sudo sysctl --system | tail -2
sudo dmesg -w                            # Gerät einstecken, Strg+C
```

## Befehle
- `cat /proc/cpuinfo` – CPU-Informationen
- `cat /proc/meminfo` – Arbeitsspeicher-Details
- `cat /proc/interrupts` – belegte IRQs
- `lspci -k` – PCI-Geräte mit verwendetem Kernel-Treiber
- `lspci -nn` – PCI-Geräte mit Vendor- und Device-ID
- `lsusb -t` – USB-Geräte als Baum
- `lscpu` – CPU-Übersicht
- `lsblk -d -o NAME,TRAN` – Platten mit Anschlusstyp
- `lshw -short` – Hardware-Kurzliste (root)
- `dmidecode -t memory` – RAM-Module aus SMBIOS (root)
- `lsmod` – geladene Kernelmodule
- `modinfo modul` – Infos und Parameter eines Moduls
- `modprobe modul` – Modul mit Abhängigkeiten laden
- `modprobe -r modul` – Modul entladen
- `insmod /pfad/modul.ko` – Modul ohne Abhängigkeiten laden
- `rmmod modul` – Modul entladen (Low-Level)
- `depmod -a` – Modul-Abhängigkeiten neu berechnen
- `udevadm monitor` – udev-Ereignisse live
- `udevadm info -a /dev/sdb` – Geräteattribute für Regeln
- `sysctl -a` – alle Kernel-Parameter
- `sysctl -w net.ipv4.ip_forward=1` – Kernel-Parameter zur Laufzeit setzen
- `sysctl -p` – /etc/sysctl.conf laden
- `dmesg -w` – Kernelmeldungen live mitlesen

## Übungen
- A: Welches virtuelle Dateisystem enthält Prozess- und Kernel-Infos? (/dev, /proc, /etc, /home) | L: /proc – vom Kernel zur Laufzeit erzeugt (cpuinfo, meminfo …).
- A: Welcher Befehl listet PCI-Geräte (Grafik/NIC)? (lsusb, lspci, lscpu, lsblk) | L: lspci; -k zeigt zusätzlich den genutzten Kernel-Treiber.
- A: Welches Werkzeug liest BIOS-, Mainboard- und RAM-Infos aus DMI/SMBIOS? | L: dmidecode (als root).
- A: Womit lädt man ein Modul samt Abhängigkeiten? (insmod, modprobe, lsmod, modinfo) | L: modprobe
- A: Was macht modprobe -r modul? | L: Es entlädt das Modul (Low-Level-Gegenstück: rmmod).
- A: Welcher Befehl zeigt zu einem Modul Datei, Parameter und Abhängigkeiten? | L: modinfo modul – auch für nicht geladene Module.
- A: Wie verhindert man das automatische Laden eines Moduls? (modprobe -r, blacklist, rmmod, depmod) | L: blacklist-Eintrag in /etc/modprobe.d/*.conf.
- A: Wo liegen eigene udev-Regeln? | L: /etc/udev/rules.d/*.rules
- A: Welches Werkzeug ändert Kernel-Parameter zur Laufzeit (z. B. ip_forward)? | L: sysctl; dauerhaft über /etc/sysctl.conf bzw. /etc/sysctl.d/.
- A: Eine Netzwerkkarte erscheint in lspci, aber nicht in ip link. Vorgehen? | L: lspci -k prüfen (kein Treiber), passendes Modul mit modinfo ermitteln, mit modprobe laden, mit lsmod und ip link kontrollieren.

## Szenario

### Ticket #4726 – Inventur srv-db04
Der neue Server srv-db04 (Debian 12) ist geliefert. Die Teamleitung will vor dem Produktivgang wissen, ob CPU, RAM, Platten und Netzwerk wie bestellt verbaut sind.
- F: Wie ermitteln Sie CPU-Typ und Kernanzahl? | A: lscpu bzw. /proc/cpuinfo
- F: Wie viel RAM ist verbaut und welche Module? | A: /proc/meminfo bzw. free -h; Module mit sudo dmidecode -t memory
- F: Welche Platten und Anschlüsse? | A: lsblk -d -o NAME,SIZE,TRAN (z. B. nvme0n1 nvme, sda sata)
- F: Welche Netzwerkkarten? | A: lspci \| grep -i ethernet und lspci -k für den Treiber

### Ticket #4735 – drei Wünsche (LPIC-2)
Die Entwickler-Workstation soll den NVIDIA-Treiber nutzen, die USB-Backup-Platte (Vendor 0781) soll immer /dev/backup heißen, und auf dem Testsystem soll Routing aktiviert werden.
- F: Wie verhindern Sie, dass nouveau geladen wird? | A: blacklist nouveau in /etc/modprobe.d/blacklist.conf, danach initramfs aktualisieren.
- F: Wie bekommt die Platte einen festen Namen? | A: udev-Regel in /etc/udev/rules.d/99-backup.rules: SUBSYSTEM=="block", ATTRS{idVendor}=="0781", SYMLINK+="backup"
- F: Wie aktivieren Sie Routing sofort und dauerhaft? | A: sysctl -w net.ipv4.ip_forward=1 und net.ipv4.ip_forward = 1 in /etc/sysctl.conf bzw. /etc/sysctl.d/.

## Karteikarten
- F: Was enthält /proc? | A: Virtuelle Dateien mit Prozess- und Kernelinformationen (cpuinfo, meminfo, interrupts, sys/).
- F: Was enthält /sys? | A: Das sysfs – Kernel-Sicht auf Geräte, Treiber und Busse.
- F: Wer verwaltet die Einträge in /dev? | A: udev (im User Space) auf Basis von Kernel-uevents.
- F: Wie zeigt lspci den verwendeten Treiber? | A: Mit lspci -k (Kernel driver in use / Kernel modules).
- F: Was zeigt lsusb -t? | A: Die USB-Geräte als Baum nach Bus, Hub und Port.
- F: Woher liest dmidecode seine Daten? | A: Aus der DMI/SMBIOS-Tabelle des BIOS/UEFI.
- F: Was ist ein Kernelmodul? | A: Eine zur Laufzeit ladbare Kernel-Erweiterung (.ko), meist ein Treiber oder Dateisystem.
- F: Unterschied modprobe und insmod? | A: modprobe findet das Modul selbst und lädt Abhängigkeiten; insmod braucht den vollen Pfad und löst keine Abhängigkeiten auf.
- F: Wo liegen die Moduldateien? | A: Unter /lib/modules/$(uname -r)/.
- F: Was macht depmod? | A: Berechnet die Modulabhängigkeiten neu (modules.dep).
- F: Wozu dient blacklist in /etc/modprobe.d? | A: Verhindert das automatische Laden eines Moduls.
- F: Was macht udevadm monitor? | A: Zeigt Kernel- und udev-Ereignisse (z. B. beim Einstecken) live an.
- F: Wie macht man eine sysctl-Einstellung dauerhaft? | A: Eintrag in /etc/sysctl.conf oder /etc/sysctl.d/*.conf, laden mit sysctl -p bzw. sysctl --system.
- F: Wie heißen NVMe-Geräte unter Linux? | A: /dev/nvme0n1 (Namespace 1 des Controllers 0), Partitionen /dev/nvme0n1p1 usw.

## Quiz
? Welches Verzeichnis enthält Informationen über laufende Prozesse und die CPU?
* /proc
- /dev
- /etc
- /boot

? Welcher Befehl zeigt, welcher Kernel-Treiber eine PCI-Netzwerkkarte steuert?
* lspci -k
- lsusb -v
- lsmod -p
- modinfo -k

? Welcher Befehl lädt ein Modul inklusive seiner Abhängigkeiten?
* modprobe
- insmod
- lsmod
- depmod

? Welcher Befehl entlädt ein Modul mit modprobe?
* modprobe -r modul
- modprobe -u modul
- modprobe --unload-all modul
- modprobe -d modul

? Welches Werkzeug zeigt RAM-Module mit Größe aus dem SMBIOS?
* dmidecode
- lscpu
- free
- lsblk

? Wo trägt man `blacklist nouveau` ein?
* /etc/modprobe.d/*.conf
- /etc/udev/rules.d/*.rules
- /etc/sysctl.conf
- /proc/modules

? Welcher Dienst legt beim Einstecken eines USB-Sticks den /dev-Eintrag an?
* udev
- dbus
- sysctl
- cron

? Was zeigt `lsmod`?
* Die aktuell geladenen Kernelmodule
- Alle verfügbaren Module
- Die PCI-Geräte
- Die Moduldateien in /lib/modules

? Wie aktiviert man IPv4-Routing zur Laufzeit?
* sysctl -w net.ipv4.ip_forward=1
- modprobe ip_forward
- echo 1 > /etc/sysctl.conf
- udevadm set ip_forward=1

? Welche Gerätedatei ist typisch für die erste Partition einer NVMe-SSD?
* /dev/nvme0n1p1
- /dev/sda1
- /dev/nvme1
- /dev/hda1

? Mit welchem Befehl verfolgt man Kernelmeldungen beim Einstecken live?
* dmesg -w
- lsusb -w
- journalctl -u udev -1
- tail /proc/dmesg

## Spickzettel
- /proc (Prozesse, cpuinfo, meminfo, interrupts) · /sys (Geräte) · /dev (udev)
- lspci (-k Treiber, -nn IDs) · lsusb (-t Baum) · lscpu · lsblk · lshw · dmidecode
- lsmod · modinfo · modprobe / modprobe -r · insmod (Pfad, keine Abh.) / rmmod
- Module: /lib/modules/$(uname -r)/ · depmod -a
- /etc/modprobe.d (options, blacklist) · /etc/modules-load.d
- udevadm monitor/info -a · /etc/udev/rules.d/*.rules (SYMLINK+=)
- sysctl -a / -w / -p · /etc/sysctl.conf · /proc/sys/
- dmesg -w · SATA/USB = sdX · NVMe = nvme0n1p1
