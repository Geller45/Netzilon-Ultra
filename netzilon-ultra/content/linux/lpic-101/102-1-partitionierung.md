---
id: linux-101-102-1-partitionierung
bereich: Linux
fach: Linux I
pruefungen: [LPIC-1]
block: LPIC-101
kapitel: LPIC-1 Prüfung 101 – Linux-Installation und Paketverwaltung
titel: 102.1 Festplattenaufteilung planen (Partitionen, Swap, LVM)
stufe: Fortgeschritten
quellen: [LPI-Learning-Material-101-500-de.pdf, 1.07_Linux_-_Datentraeger_Dateisysteme_und_Rechte.pdf]
verweise: [linux-l1-07-datentraeger, linux-101-104-1-partitionen-dateisysteme, linux-101-102-2-bootloader]
---

## Profi

### Lernziel (Gewicht 2)
Ein Plattenlayout entwerfen: Mountpoints, Swap, Boot- und ESP-Partition, LVM.

### Mountpoints und typisches Layout
| Mountpoint | Zweck / Hinweis |
|---|---|
| `/` | Wurzel, Pflicht |
| `/boot` | Kernel, initramfs, GRUB; separat bei LVM/Verschlüsselung (ca. 512 MB–1 GB) |
| `/boot/efi` | **ESP** (FAT32, ca. 100–512 MB) bei UEFI |
| `/home` | Benutzerdaten; separat erleichtert Neuinstallation |
| `/var` | variable Daten (Logs, Mail, Datenbanken, Spool) |
| `/tmp`, `/opt`, `/srv`, `/usr` | optional separat |
| **swap** | Auslagerung (Partition oder Datei), `mkswap`, `swapon`, `swapoff` |
- Warum trennen? Platzgarantie (`/var/log` füllt nicht `/`), eigene Mountoptionen (`noexec`, `nosuid`), Backup, Sicherheit. **Mindestens** `/`; UEFI braucht ESP, BIOS+GPT braucht BIOS-Boot-Partition.
- **Swap**: Faustregel früher 1–2× RAM; mit Ruhezustand ≥ RAM; Priorität `swapon -p`.

### Partitionstabellen
- **MBR**: max. 2 TiB, 4 primäre Partitionen (oder 3 + erweiterte mit logischen). **GPT**: bis 9,4 ZB, 128 Partitionen, UUIDs, Backup-Header am Ende, für UEFI Standard.

### LVM
- **PV** (Physical Volume) → **VG** (Volume Group) → **LV** (Logical Volume). `pvcreate`, `vgcreate`, `lvcreate -L 10G -n data vg0`, `lvextend -r`, `lvs`/`vgs`/`pvs`. Vorteile: Größe ändern im Betrieb, Snapshots, mehrere Platten bündeln. `/boot` bleibt meist außerhalb von LVM.

## Einfach

Eine neue Festplatte ist wie ein **leeres Regal**. Bevor du Sachen hineinlegst, teilst du es in **Fächer** (Partitionen). Jedes Fach bekommt einen Zweck: Ein Fach für das System (`/`), eins für deine eigenen Sachen (`/home`), eins für Protokolle und Datenbanken (`/var`).

Warum so viele Fächer? Wenn ein Fach überläuft, sollen die anderen heil bleiben. Läuft das Protokoll-Fach über, soll nicht das ganze System stehenbleiben. Außerdem kannst du dein Zuhause behalten, wenn du das System neu aufsetzt.

Dazu kommt das **Swap-Fach**: Es ist wie ein **Notizzettel-Stapel** neben dem Schreibtisch. Wenn der Schreibtisch (der Arbeitsspeicher) voll ist, legt Linux weniger wichtige Dinge dort ab.

Bei modernen Computern (UEFI) gibt es noch ein winziges Spezialfach, die **ESP**. Dort liegt das Startprogramm.

Und wenn du später merkst, dass ein Fach zu klein ist? Mit **LVM** sind die Fächer wie **Wasser in Behältern**: Du kannst Behälter vergrößern, verkleinern und mehrere Platten zu einem großen Wasserspeicher zusammenfassen. Ein klassisches Fach lässt sich nur mühsam ändern.

## Merksatz
- **Mindestens /; UEFI braucht ESP.**
- **/var und /home trennen = Platzsicherheit.**
- **MBR: 4 Primäre, 2 TiB. GPT: 128, riesig.**
- **PV → VG → LV.**
- **/boot bleibt außerhalb von LVM.**

## Prüfungsfalle
- Auf MBR gibt es maximal **4 primäre** Partitionen; eine erweiterte zählt als eine davon.
- **ESP ist FAT32** (nicht ext4).
- Swap muss mit `mkswap` vorbereitet und mit `swapon` aktiviert werden.
- LVM-Reihenfolge: **PV → VG → LV**, nicht umgekehrt.
- `/boot` auf LVM ist bei GRUB 2 möglich, aber nicht üblich; bei Verschlüsselung gibt es eine separate unverschlüsselte `/boot`.
- Eine Swap-**Datei** ist ebenfalls möglich (`dd`/`fallocate`, `mkswap`).

## Grafik

### LVM-Schichten
1. Platte -> PV: pvcreate /dev/sdb1
2. PV -> VG: vgcreate vg0 /dev/sdb1 /dev/sdc1
3. VG -> LV: lvcreate -L 10G -n data vg0
4. LV -> Dateisystem: mkfs.ext4 /dev/vg0/data
5. Dateisystem -> /srv/data: mount

## Lab
**Maschine**: debian01 mit leerer Zusatzplatte /dev/sdb.
```bash
# auf debian01
lsblk
sudo pvcreate /dev/sdb
sudo vgcreate vg0 /dev/sdb
sudo lvcreate -L 2G -n data vg0
sudo mkfs.ext4 /dev/vg0/data
sudo mkdir /srv/data && sudo mount /dev/vg0/data /srv/data
sudo lvextend -L +1G -r /dev/vg0/data
sudo lvs; sudo vgs; sudo pvs
# Swap-Datei
sudo fallocate -l 1G /swapfile && sudo chmod 600 /swapfile
sudo mkswap /swapfile && sudo swapon /swapfile && swapon --show
```

## Befehle
- `lsblk` – Blockgeräte
- `pvcreate` / `vgcreate` / `lvcreate` – LVM aufbauen
- `lvextend -r` – LV und Dateisystem vergrößern
- `mkswap` / `swapon` / `swapoff` – Swap verwalten
- `free -h` – Speicher und Swap

## Übungen
- A: Welche Partitionen braucht ein UEFI-System mindestens? | L: ESP (FAT32) und Root /; Swap optional.
- A: Reihenfolge der LVM-Schichten? | L: PV → VG → LV.
- A: Wie aktivierst du eine Swap-Partition /dev/sdb2? | L: mkswap /dev/sdb2; swapon /dev/sdb2
- A: Warum /var separat? | L: Logs/Datenbanken können / nicht füllen.
- A: Wie groß darf eine MBR-Platte genutzt werden? | L: ca. 2 TiB.

## Karteikarten
- F: Wie viele primäre Partitionen erlaubt MBR? | A: Vier.
- F: Welches Dateisystem hat die ESP? | A: FAT32.
- F: Wofür dient /boot? | A: Kernel, initramfs, Bootloader-Dateien.
- F: Was ist ein PV? | A: Physical Volume – eine für LVM vorbereitete Partition/Platte.
- F: Welcher Befehl legt ein LV an? | A: lvcreate
- F: Was bewirkt mkswap? | A: Richtet Swap-Signatur auf Partition/Datei ein.
- F: Wie viele Partitionen erlaubt GPT standardmäßig? | A: 128.
- F: Welchen Vorteil hat LVM? | A: Flexible Größenänderung, Snapshots, mehrere Platten bündeln.
- F: Was zeigt swapon --show? | A: Aktive Swap-Bereiche.

## Quiz
? Wie viele primäre Partitionen erlaubt MBR?
* 4
- 2
- 8
- 128

? Welches Dateisystem benötigt die ESP?
* FAT32
- ext4
- XFS
- NTFS

? Welche LVM-Reihenfolge ist richtig?
* PV, VG, LV
- LV, VG, PV
- VG, PV, LV
- PV, LV, VG

? Welcher Befehl bereitet eine Swap-Partition vor?
* mkswap
- swapon
- mkfs.swap
- fdisk -s

? Warum trennt man /var vom Wurzelverzeichnis?
* Volllaufende Logs gefährden sonst das Root-Dateisystem
- /var braucht ein anderes Betriebssystem
- Weil /var nur auf GPT funktioniert
- Weil / nicht größer als 2 GB sein darf

? Wie lässt sich ein LV samt Dateisystem vergrößern?
* lvextend -r
- lvcreate -r
- vgextend -r
- pvresize -r

? Was gilt für GPT?
* Bis zu 128 Partitionen und UUIDs, UEFI-Standard
- Maximal 2 TiB
- Nur 4 Partitionen
- Nur für Windows

? Welcher Befehl zeigt aktive Swap-Bereiche?
* swapon --show
- swapctl
- free -z
- lsswap

## Spickzettel
- / Pflicht · /boot · ESP FAT32 · /home · /var · swap
- MBR 4 prim., 2 TiB · GPT 128, UEFI
- PV → VG → LV · lvextend -r
- mkswap + swapon
