---
id: linux-eckert-k05-dateisystemadministration
bereich: Linux
fach: Linux I
pruefungen: [LPIC-1, Schule]
block: CompTIA Linux+ / LPIC-1 (Eckert)
kapitel: Eckert – CompTIA Linux+ and LPIC-1 (6th Edition)
titel: Kap. 5 Dateisystemadministration (Partitionen, LVM, Quotas, fsck)
stufe: Fortgeschritten
quellen: [Eckert_J._W._and_triOS_College_-_CompTIA_Linux_and_LPIC-1_6th_Edition_-_2024.pdf]
verweise: [linux-101-104-1-partitionen-dateisysteme,linux-101-104-3-mounten,linux-101-102-1-partitionierung]
---

## Profi

### Geräte
Datenträger als Gerätedateien in `/dev` (`/dev/sda1`, `/dev/nvme0n1p1`), **Blockgeräte** (Daten in Blöcken, gepuffert) vs. **Zeichengeräte**. **Major-Nummer** = Treiber, **Minor-Nummer** = Gerät. `udev` legt Dateien an (`udevadm`). `mknod` erzeugt manuell.

### Partitionieren
`fdisk` (MBR/GPT), `gdisk` (GPT), `cfdisk` (menügeführt), `parted` (auch scriptfähig), `partprobe` (Kernel informieren). Typ-IDs (83 Linux, 82 Swap, 8e LVM, ef ESP).

### Dateisysteme
`mkfs -t ext4 /dev/sdb1`, `mkfs.xfs`, `mkfs.vfat`, `mkswap` + `swapon`/`swapoff`. Beschriftung `e2label`, `xfs_admin`, `fatlabel`; `blkid` (UUID, Typ); `tune2fs`; Vergrößern `resize2fs`, `xfs_growfs` (XFS nur vergrößern). Dateisysteme: **ext2/3/4**, **XFS**, **Btrfs**, **FAT/exFAT/NTFS**, **ISO 9660**, **NFS**, **swap**; Pseudo-/virtuelle: `proc`, `sysfs`, `tmpfs`.

### Einhängen
`mount /dev/sdb1 /mnt/daten`, `mount` (ohne Argumente zeigt), `umount`, `findmnt`, `lsblk`. Mountpunkt darf nicht belegt sein. Dauerhaft in **`/etc/fstab`** (Gerät/UUID, Mountpunkt, Typ, Optionen, dump, fsck-Reihenfolge). `mount -a` testet fstab. `/etc/mtab`/`/proc/mounts`.

### LVM (Logical Volume Manager)
**PV** (`pvcreate`) → **VG** (`vgcreate`, `vgextend`) → **LV** (`lvcreate -L 10G -n lv_data vg0`, `lvextend -r`). Anzeige `pvdisplay/vgdisplay/lvdisplay`. Vorteile: Erweiterung im Betrieb, Snapshots, mehrere Platten als ein Pool. **PE** (Physical Extent) als Größeneinheit.

### Überwachung und Prüfung
`df -h` (Platz, `-i` Inodes), `du -sh`, `fsck` (nur bei ausgehängtem Dateisystem; `e2fsck`, `xfs_repair`), „bad blocks“, Journal. **Quotas**: `edquota`, `quota`, `quotaon/off`, `repquota`, Soft-/Hard-Limit, Grace Period; Optionen `usrquota,grpquota` in fstab.

## Einfach

Eine neue Festplatte ist erst einmal ein leeres Feld. Bevor Linux sie nutzen kann, sind drei Schritte nötig: **Partitionieren** (das Feld in Beete teilen, `fdisk`), **Formatieren** (in jedes Beet ein Ordnungssystem, das Dateisystem, bauen: `mkfs.ext4`) und **Einhängen** (das Beet an einen Ordner im Baum anschließen: `mount`). Der Ordner heißt **Mountpunkt**.

Damit das Einhängen auch nach einem Neustart klappt, trägst du es in die Datei `/etc/fstab` ein. Praktisch ist, dort die **UUID** statt `/dev/sdb1` zu nutzen, weil sich Gerätenamen ändern können (`blkid` verrät die UUID).

**LVM** ist wie ein **flexibler Wasserspeicher**: Mehrere Platten (PVs) werden zu einem großen Becken (VG) zusammengeschüttet. Daraus schneidest du Portionen (LVs) ab, die du später vergrößern kannst, ohne den Rechner auszuschalten. Das geht mit normalen Partitionen nicht so einfach.

Wenn eine Platte voll läuft, hilft `df -h` (wie voll ist jedes Laufwerk?) und `du -sh *` (welcher Ordner frisst den Platz?). Ist das Dateisystem beschädigt, repariert `fsck` es, aber nur im **ausgehängten** Zustand.

Mit **Quotas** begrenzt du, wie viel Platz jeder Benutzer verbrauchen darf, damit ein einzelner nicht die ganze Platte füllt.

## Merksatz
- **Partitionieren → Formatieren → Einhängen → fstab.**
- **PV → VG → LV.**
- **fsck nur ausgehängt.**
- **UUID statt Gerätenamen in fstab.**

## Prüfungsfalle
- `fsck` auf einem eingehängten Dateisystem kann Daten zerstören.
- `xfs_growfs` vergrößert nur; XFS lässt sich nicht verkleinern.
- Nach `lvextend` muss auch das Dateisystem vergrößert werden (`-r` oder `resize2fs`).
- Soft-Limit darf zeitweise überschritten werden (Grace Period), Hard-Limit nie.
- Fehlerhafte fstab kann den Boot verhindern.

## Grafik

### Neue Platte nutzbar machen
1. Admin -> fdisk: Partition /dev/sdb1 anlegen
2. Admin -> mkfs: mkfs.ext4 /dev/sdb1
3. Admin -> mount: mount /dev/sdb1 /daten
4. Admin -> fstab: UUID-Eintrag ergänzen
5. Dateisystem: nach Reboot automatisch eingehängt

### LVM-Schichten
1. Disk1 -> PV: pvcreate
2. Disk2 -> PV: pvcreate
3. PV -> VG: vgcreate vg0
4. VG -> LV: lvcreate -L 10G -n daten vg0
5. LV: mkfs und mount

## Lab
**Maschine**: debian01 mit zweiter Platte /dev/sdb.
```bash
sudo fdisk /dev/sdb          # n, p, 1, Enter, Enter, w
sudo mkfs.ext4 /dev/sdb1
sudo mkdir /daten && sudo mount /dev/sdb1 /daten
sudo blkid /dev/sdb1
echo 'UUID=<uuid> /daten ext4 defaults 0 2' | sudo tee -a /etc/fstab
sudo mount -a
# LVM
sudo pvcreate /dev/sdc1
sudo vgcreate vg0 /dev/sdc1
sudo lvcreate -L 5G -n lv_data vg0
sudo mkfs.ext4 /dev/vg0/lv_data
sudo lvextend -r -L +2G /dev/vg0/lv_data
```

## Befehle
- `fdisk /dev/sdb` – partitionieren
- `mkfs.ext4 /dev/sdb1` – formatieren
- `mount` / `umount` – ein-/aushängen
- `blkid` – UUIDs
- `df -h` / `du -sh` – Belegung
- `fsck /dev/sdb1` – prüfen
- `lvextend -r -L +2G lv` – LV vergrößern
- `edquota -u anna` – Quota setzen

## Übungen
- A: Wie findest du die UUID einer Partition? | L: `blkid /dev/sdb1`
- A: Welche Schichten hat LVM? | L: Physical Volume, Volume Group, Logical Volume.
- A: Wie zeigst du Inode-Nutzung? | L: `df -i`

## Karteikarten
- F: Wofür steht Major-Nummer? | A: Gerätetreiber.
- F: Was ist /etc/fstab? | A: Tabelle der dauerhaft einzuhängenden Dateisysteme.
- F: Was macht mount -a? | A: Hängt alle Einträge der fstab ein (Test).
- F: Welcher Befehl zeigt Dateisystembelegung? | A: df
- F: Wofür steht PV/VG/LV? | A: Physical Volume / Volume Group / Logical Volume.
- F: Wie vergrößert man ext4? | A: resize2fs
- F: Wie vergrößert man XFS? | A: xfs_growfs
- F: Was ist ein Soft-Limit? | A: Überschreitbar für Grace Period; Warnung.
- F: Wann darf fsck laufen? | A: Bei ausgehängtem Dateisystem.
- F: Was ist ESP-Typ in gdisk? | A: ef00 (EFI System Partition).

## Quiz
? Was ist die richtige Reihenfolge?
* Partitionieren, Formatieren, Einhängen
- Einhängen, Formatieren, Partitionieren
- Formatieren, Einhängen, Partitionieren
- Einhängen, Partitionieren, Formatieren

? Welche Datei steuert dauerhafte Mounts?
* /etc/fstab
- /etc/mtab
- /etc/mount.conf
- /proc/mounts

? Was erzeugt pvcreate?
* Ein Physical Volume
- Eine Volume Group
- Ein Logical Volume
- Ein Dateisystem

? Welches Dateisystem lässt sich nicht verkleinern?
* XFS
- ext4
- Btrfs
- ext3

? Wann prüft man mit fsck?
* Bei ausgehängtem Dateisystem
- Beim Schreiben
- Im Betrieb
- Nur als Backup

? Was zeigt df -i?
* Inode-Nutzung
- Platz
- Dateityp
- Quotas

? Wie nennt sich die Größeneinheit in LVM?
* Physical Extent
- Block Group
- Cylinder Set
- Page

? Welches Tool ist menügeführt zum Partitionieren?
* cfdisk
- fdisk -m
- mkfs
- blkid

## Lücken
- {mkfs} legt ein Dateisystem an.
- Dauerhafte Mounts stehen in {/etc/fstab}.
- LVM-Schichten: {PV}, {VG}, {LV}.

## Spickzettel
- fdisk/gdisk/parted → mkfs → mount → fstab
- blkid, df, du, fsck
- PV → VG → LV · lvextend -r
- Quotas: edquota, repquota
