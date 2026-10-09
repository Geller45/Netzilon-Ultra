---
id: linux-101-104-1-partitionen-dateisysteme
bereich: Linux
fach: Linux I
pruefungen: [LPIC-1]
block: LPIC-101
kapitel: LPIC-1 Prüfung 101 – Geräte, Dateisysteme, FHS
titel: 104.1 Partitionen und Dateisysteme anlegen
stufe: Fortgeschritten
quellen: [LPI-Learning-Material-101-500-de.pdf, 1.07_Linux_-_Datentraeger_Dateisysteme_und_Rechte.pdf]
verweise: [linux-l1-07-datentraeger, linux-101-102-1-partitionierung, linux-101-104-2-integritaet, linux-101-104-3-mounten]
---

## Profi

### Lernziel (Gewicht 2)
Partitionstabellen verwalten (MBR/GPT), Dateisysteme und Swap anlegen.

### Partitionierungswerkzeuge
- `fdisk` (MBR und GPT, interaktiv: `n` neu, `d` löschen, `t` Typ, `p` anzeigen, `w` schreiben, `q` verwerfen), `gdisk` (GPT), `parted` (sofort wirksam, `mklabel gpt`, `mkpart`), `cfdisk` (Menü), `lsblk`, `blkid`. Danach Kernel informieren: `partprobe`.
- **MBR**: Typ-IDs `83` Linux, `82` Swap, `8e` LVM, `fd` RAID, `ef` ESP; **GPT**: GUIDs (Linux 8300, ESP EF00, Swap 8200, LVM 8E00).
- Namen: `/dev/sda1`, `/dev/vda1`, `/dev/nvme0n1p1`, `/dev/mmcblk0p1`.

### Dateisysteme erstellen
| Dateisystem | Befehl | Eigenschaften |
|---|---|---|
| ext2/3/4 | `mkfs.ext4`, `mke2fs -t ext4` | Standard, Journal (ext3/4), `tune2fs`, `e2label` |
| XFS | `mkfs.xfs` | performant, nur vergrößern, `xfs_growfs` |
| Btrfs | `mkfs.btrfs` | Snapshots, Subvolumes, Prüfsummen |
| FAT/VFAT/exFAT | `mkfs.vfat`/`mkfs.fat` | ESP, USB-Sticks |
| Swap | `mkswap` + `swapon` | Auslagerung |
| NTFS | `mkfs.ntfs`/`ntfs-3g` | Windows |
- `mkfs -t typ /dev/sdb1`. Label/UUID: `-L name`, `blkid`. Mounten siehe 104.3. 
- Journaling-Dateisysteme (ext3/4, XFS, Btrfs, ReiserFS) schützen Metadaten vor Inkonsistenz nach Absturz; ext2 hat kein Journal.

## Einfach

Eine neue Platte ist wie ein **unbeschriebenes Heft**. Zuerst teilst du es in **Kapitel** auf (das sind die **Partitionen**) – dafür gibt es Werkzeuge wie `fdisk` oder `parted`. Dann gibst du jedem Kapitel ein **Seitenlayout**, damit man weiß, wo was steht und wo Platz frei ist: das **Dateisystem** (z. B. ext4). Erst dann kannst du Dateien hineinschreiben.

Man sagt: **Partitionieren** (Kapitel anlegen) und **Formatieren** (Layout anlegen) sind zwei verschiedene Schritte. Bei Linux heißt der zweite `mkfs` (make filesystem), z. B. `mkfs.ext4 /dev/sdb1`.

Es gibt zwei Arten von Inhaltsverzeichnissen für die Kapitel: **MBR** (alt, nur vier Hauptkapitel, bis 2 TB) und **GPT** (modern, 128 Kapitel, riesige Platten). Neue Rechner mit UEFI nutzen GPT.

Und was ist **Swap**? Das ist der **Notizzettel-Stapel** für den Arbeitsspeicher. Du machst eine Partition dafür mit `mkswap` und schaltest sie mit `swapon` ein.

Die Namen der Kapitel folgen einem Muster: Die erste Platte heißt `sda`, ihre erste Partition `sda1`. Bei den modernen NVMe-SSDs heißt es `nvme0n1p1`.

Nach dem Partitionieren sagst du dem Kernel Bescheid (`partprobe`), damit er die neuen Kapitel sieht.

## Merksatz
- **Erst partitionieren, dann formatieren (mkfs), dann mounten.**
- **fdisk: n, d, t, p, w.**
- **MBR 83 = Linux, 82 = Swap, 8e = LVM.**
- **GPT: 128 Partitionen, UEFI.**
- **mkfs.ext4 Gerät, mkswap + swapon.**

## Prüfungsfalle
- Bei `fdisk` werden Änderungen erst mit **`w`** geschrieben; `q` verwirft.
- `mkfs` auf die **Partition** (`/dev/sdb1`), nicht auf das ganze Gerät – das zerstört die Partitionstabelle.
- `mkfs` löscht Daten!
- XFS kann man nur **vergrößern**, nicht verkleinern.
- ext2 hat **kein** Journal, ext3 und ext4 schon.
- MBR kennt 4 primäre Partitionen; mehr nur mit erweiterter/logischer Partition.
- `parted` schreibt Änderungen sofort.

## Grafik

### Neue Platte nutzbar machen
1. Admin -> fdisk: fdisk /dev/sdb – n, p, 1, w
2. fdisk -> Platte: Partitionstabelle wird geschrieben
3. Admin -> mkfs: mkfs.ext4 /dev/sdb1
4. mkfs -> Partition: Dateisystem wird angelegt
5. Admin -> mount: mount /dev/sdb1 /mnt/daten
6. mount -> Benutzer: Dateien können gespeichert werden

## Lab
**Maschine**: debian01 mit leerer Zusatzplatte /dev/sdb (Testsystem!).
```bash
# auf debian01
lsblk
sudo fdisk /dev/sdb        # g (GPT), n, Enter, Enter, +1G, w
sudo partprobe /dev/sdb
sudo mkfs.ext4 -L daten /dev/sdb1
sudo blkid /dev/sdb1
sudo mkdir -p /mnt/daten && sudo mount /dev/sdb1 /mnt/daten
df -hT /mnt/daten
sudo tune2fs -l /dev/sdb1 | head
```

## Befehle
- `fdisk /dev/sdb` – Partitionieren
- `parted /dev/sdb print` – Tabelle zeigen
- `partprobe` – Kernel informieren
- `mkfs.ext4 /dev/sdb1` – ext4 anlegen
- `mkfs.xfs /dev/sdb1` – XFS anlegen
- `mkswap /dev/sdb2` – Swap anlegen
- `blkid` – UUIDs und Typen
- `lsblk -f` – Blockgeräte mit Dateisystem

## Übungen
- A: Mit welchem Befehl legst du ein ext4-Dateisystem an? | L: mkfs.ext4 /dev/sdb1
- A: Welche MBR-Typ-ID hat Swap? | L: 82
- A: Wie schreibst du in fdisk die Änderungen? | L: w
- A: Wie legst du Swap an und aktivierst es? | L: mkswap /dev/sdb2; swapon /dev/sdb2
- A: Welche Partitionstabelle unterstützt Platten > 2 TiB? | L: GPT

## Karteikarten
- F: Welche Aufgabe hat mkfs? | A: Legt ein Dateisystem auf einer Partition an.
- F: Welcher Befehl partitioniert GPT interaktiv? | A: gdisk (auch fdisk, parted).
- F: Welche Typ-ID hat Linux-LVM im MBR? | A: 8e.
- F: Was ist ein Journal? | A: Protokoll von Metadatenänderungen für schnelle Wiederherstellung.
- F: Welche Dateisysteme sind journaling? | A: ext3, ext4, XFS, Btrfs, ReiserFS.
- F: Welcher Befehl zeigt UUIDs? | A: blkid
- F: Wie heißt die erste Partition einer NVMe? | A: /dev/nvme0n1p1
- F: Wozu dient partprobe? | A: Liest die Partitionstabelle neu ein, ohne Neustart.
- F: Wie verkleinert man XFS? | A: Gar nicht – XFS kann nur wachsen.

## Quiz
? Was bewirkt w in fdisk?
* Schreibt die Änderungen
- Wechselt das Gerät
- Zeigt Partitionen
- Verwirft Änderungen

? Welche Tabelle unterstützt mehr als 2 TiB?
* GPT
- MBR
- BSD
- Sun

? Welcher Befehl legt ein ext4 an?
* mkfs.ext4
- mke4fs -x
- fdisk -t ext4
- format ext4

? Welche MBR-Typ-ID hat Swap?
* 82
- 83
- 8e
- 07

? Welches Dateisystem hat kein Journal?
* ext2
- ext3
- ext4
- XFS

? Welcher Befehl liest eine geänderte Partitionstabelle neu?
* partprobe
- partscan
- mount -a
- udevd

? Welcher Befehl zeigt die UUID einer Partition?
* blkid
- uuid
- fdisk -u
- df -u

? Was gilt für XFS?
* Kann nur vergrößert, nicht verkleinert werden
- Kann nur verkleinert werden
- Hat keine Journal
- Wird nur auf Windows genutzt

## Spickzettel
- fdisk n d t p w q · gdisk · parted · partprobe
- MBR: 83 Linux · 82 Swap · 8e LVM · fd RAID
- mkfs.ext4/xfs/btrfs/vfat · mkswap + swapon
- Journal: ext3/4, XFS, Btrfs · ext2 nicht
- erst Partition, dann Dateisystem, dann mount
