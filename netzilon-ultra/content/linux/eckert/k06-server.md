---
id: linux-eckert-k06-server-deployment
bereich: Linux
fach: Linux I
pruefungen: [LPIC-1, Schule]
block: CompTIA Linux+ / LPIC-1 (Eckert)
kapitel: Eckert – CompTIA Linux+ and LPIC-1 (6th Edition)
titel: Kap. 6 Linux-Serverbereitstellung (RAID, SAN, ZFS, Btrfs)
stufe: Fortgeschritten
quellen: [Eckert_J._W._and_triOS_College_-_CompTIA_Linux_and_LPIC-1_6th_Edition_-_2024.pdf]
verweise: [linux-101-101-1-hardware,linux-l1-09-hardware]
---

## Profi

### Server-Hardware
Rackmount (**1U**, 2U …), **Blade-Server**, Tower. Mehr CPU-Kerne, ECC-RAM, redundante Netzteile, Hot-Swap-Laufwerke. Administration oft remote, **Server-Distributionen** ohne Desktop-Umgebung, Installation mit zusätzlichen Abfragen (z. B. Netzwerk, Rolle).

### Speicheranbindung
- **SCSI/SAS** lokal; **SAN** (Storage Area Network) per **iSCSI** (Block über IP; **Initiator** = Client, `iscsiadm`; **Target** = Server; **IQN**) oder **Fibre Channel**. **Multipath** (**DM-MPIO**, `multipath -ll`) für redundante Pfade. **NAS** (Dateizugriff via NFS/SMB) vs. SAN (Blockzugriff).

### RAID
- **RAID 0** (Striping, schnell, ohne Redundanz, ≥2 Platten), **RAID 1** (Spiegelung, 50 % Kapazität), **RAID 5** (Striping + Parität, ≥3 Platten, 1 Ausfall), **RAID 6** (doppelte Parität, ≥4, 2 Ausfälle), **RAID 10** (1+0, ≥4, gespiegelte Stripes). Umsetzung als **Software-RAID** (`mdadm`, `/dev/md0`, `/proc/mdstat`), **Hardware-RAID** (Controllerkarte) oder **Firmware-/Fake-RAID**. RAID ersetzt kein Backup.
- `mdadm --create /dev/md0 --level=1 --raid-devices=2 /dev/sdb1 /dev/sdc1`, `mdadm --detail`, `--fail`, `--remove`, `--add`.

### Moderne Dateisysteme
- **ZFS**: Pools (`zpool`), Datasets (`zfs`), Prüfsummen, Snapshots, Kompression, RAID-Z; Speicher von Platten bis SAN. **Btrfs** (B-tree File System): Copy-on-Write, Snapshots, Subvolumes, integriertes RAID, als ext4-Nachfolger gedacht.

### Nach der Installation prüfen
Installationslogs, `/proc` und `/sys`, `lspci`, `lsusb`, `lsmod`/`rmmod`/`modprobe`, `dmesg`, `journalctl -k`. **Defekte oder nicht unterstützte Hardware** ist häufigster Installationsfehler, **fehlende Treiber** häufigster Fehler danach. Reparatur per **Live-Medium** (Rescue).

## Einfach

Ein **Server** ist ein Computer, der Dienste für andere anbietet, zum Beispiel Webseiten. Weil viele sich darauf verlassen, ist er meist stärker gebaut: mehr Prozessoren, mehr Speicher, zwei Netzteile, damit er nicht ausfällt. Er steht im **Rack** (Schrank) im Rechenzentrum; ein **Blade** ist ein dünner Einschub.

Wichtig ist der **Speicher**. Statt einer einzelnen Platte bündelt man mehrere zu einem **RAID**:

- **RAID 0**: Daten werden verteilt, sehr schnell, aber fällt eine Platte aus, ist alles weg.
- **RAID 1**: Alles wird doppelt gespeichert (Spiegel). Eine Platte darf ausfallen.
- **RAID 5**: Daten plus eine Sicherheitsrechnung (Parität), 3 Platten nötig. Eine darf ausfallen.
- **RAID 10**: Spiegel und Verteilung kombiniert, schnell und sicher.

Aber Achtung: **RAID ist kein Backup!** Löschst du eine Datei, ist sie auch auf allen Spiegeln weg.

Große Firmen lagern Daten auf ein **SAN**, ein eigenes Speichernetz. Der Server sieht dort liegende Platten, als wären sie eingebaut (z. B. über **iSCSI**). Neuere Dateisysteme wie **ZFS** und **Btrfs** bringen Schnappschüsse, Prüfsummen und RAID-Funktionen gleich mit.

Geht bei der Installation etwas schief, liegt es meist an Hardware, die der Kernel nicht kennt. Ein **Live-System** hilft dann bei der Reparatur.

## Merksatz
- **RAID 0 schnell, 1 spiegelt, 5 Parität, 6 doppelt, 10 beides.**
- **RAID ≠ Backup.**
- **iSCSI Initiator = Client, Target = Server.**
- **SAN = Blöcke, NAS = Dateien.**

## Prüfungsfalle
- RAID 5 braucht mindestens **drei**, RAID 6 mindestens **vier** Platten.
- RAID 0 hat **keine** Redundanz.
- Der iSCSI-**Initiator** ist der Client.
- Hardware-RAID erscheint dem OS als eine Platte; Software-RAID als `/dev/mdX`.

## Grafik

### RAID 1
1. Server -> RAID-Controller: schreibt Datei
2. RAID-Controller -> Disk1: Kopie 1
3. RAID-Controller -> Disk2: Kopie 2
4. Disk1: fällt aus
5. Disk2 -> Server: liefert weiter alle Daten

## Lab
**Maschine**: debian01 mit zwei leeren Platten /dev/sdb, /dev/sdc.
```bash
sudo apt install mdadm
sudo mdadm --create /dev/md0 --level=1 --raid-devices=2 /dev/sdb /dev/sdc
cat /proc/mdstat
sudo mkfs.ext4 /dev/md0
sudo mdadm --detail /dev/md0
```

## Befehle
- `mdadm --detail /dev/md0` – RAID-Status
- `cat /proc/mdstat` – Software-RAID
- `iscsiadm -m discovery -t st -p IP` – Targets suchen
- `multipath -ll` – Pfade
- `zpool status` – ZFS-Pool
- `btrfs subvolume list /` – Subvolumes
- `lsmod` / `modprobe` – Module

## Übungen
- A: Wie viele Platten braucht RAID 5 mindestens? | L: Drei.
- A: Wie lange darf bei RAID 6 ausfallen? | L: Zwei Platten.
- A: Wie siehst du Software-RAID-Status? | L: `cat /proc/mdstat`

## Karteikarten
- F: Was ist RAID 0? | A: Striping ohne Redundanz.
- F: Was ist RAID 1? | A: Spiegelung.
- F: Wie viel Kapazität hat RAID 5 mit n Platten? | A: n-1 Platten nutzbar.
- F: Was ist ein SAN? | A: Speichernetz mit Blockzugriff (iSCSI/FC).
- F: Was ist ein iSCSI Target? | A: Der Speicher-Server.
- F: Was ist DM-MPIO? | A: Multipath-Zugriff mit redundanten Pfaden.
- F: Nenne zwei Eigenschaften von ZFS. | A: Prüfsummen, Snapshots, Pools.
- F: Wofür steht Btrfs? | A: B-tree File System (CoW, Snapshots).
- F: Was ist ein 1U-Server? | A: Rackserver mit einer Höheneinheit.
- F: Welcher Befehl verwaltet Software-RAID? | A: mdadm

## Quiz
? Welches RAID-Level bietet Spiegelung?
* RAID 1
- RAID 0
- RAID 5
- RAID 6

? Wie viele Ausfälle verkraftet RAID 6?
* 2
- 1
- 0
- 3

? Welche Rolle hat der iSCSI-Initiator?
* Client
- Server
- Switch
- Controller

? Welches Level hat keine Redundanz?
* RAID 0
- RAID 1
- RAID 5
- RAID 10

? Welches Tool verwaltet Linux-Software-RAID?
* mdadm
- lvm
- fdisk
- raidctl

? Was ist richtig?
* RAID ist kein Ersatz für Backup
- RAID ersetzt Backups
- RAID verhindert Löschfehler
- RAID schützt vor Ransomware

? Was ist ein SAN?
* Ein Speichernetzwerk mit Blockzugriff
- Ein Dateiserver
- Ein VPN
- Ein Drucker

? Was ist häufigste Ursache fehlgeschlagener Installationen?
* Nicht unterstützte oder defekte Hardware
- Falsche Tastatur
- Zu viel RAM
- Zu schneller Router

## Spickzettel
- RAID 0/1/5/6/10 · mdadm /proc/mdstat
- SAN iSCSI/FC · NAS NFS/SMB
- ZFS · Btrfs
- Live-Medium zur Reparatur
