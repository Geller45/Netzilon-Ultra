---
id: linux-l1-07-datentraeger
bereich: Linux
fach: Linux I
pruefungen: [LPIC-1, Schule]
block: L1
kapitel: Linux I – Grundlagen
titel: 1.07 Datenträger, Dateisysteme, mount/fstab, Rechte und Libraries
stufe: Fortgeschritten
quellen: [1.07_Linux_-_Datentraeger_Dateisysteme_und_Rechte.pdf, LPI-Learning-Material-101-500-de.pdf]
verweise: [linux-101-102-1-partitionierung, linux-101-104-1-partitionen-dateisysteme, linux-101-104-2-integritaet, linux-101-104-3-mounten, linux-101-104-5-rechte, linux-101-102-3-libraries, linux-l1-06-booten, ap1-a2-dateisysteme]
---

## Profi

### Einordnung
Großer Block der Prüfung 101: **102.1** Layout (G2), **104.1** Anlegen (G2), **104.3** Einhängen (G3), **104.2** Pflege (G2), **104.5** Rechte (G3), **102.3** Libraries (G1, Themenwechsel). LVM, RAID, LUKS = **LPIC-2** (204.3/204.1/203.3), markiert.

### Partitionen und Mountpoints (102.1)
- Ein Datenträger wird in **Partitionen** geteilt, jede trägt ein **Dateisystem**, das an einem **Mountpoint** in den einen Verzeichnisbaum unter `/` eingehängt wird. `lsblk` zeigt Platten, Partitionen und Einhängepunkte.
| Bereich | Zweck / Grund für eigene Partition |
|---|---|
| `/` | Wurzel, System – minimal nötig |
| `/home` | Benutzerdaten – bleibt bei Neuinstallation erhalten |
| `/var` | Logs, Spool, DB – volle Logs fluten `/` nicht |
| `/boot` | Kernel und initramfs – muss lesbar sein, **bevor** LVM/Verschlüsselung aktiv ist |
| swap | Auslagerungsspeicher (Partition oder Swap-Datei) |
| ESP | FAT-Partition für UEFI, unter `/boot/efi` |
- **Swap**: klassische Faustregel ~1× RAM, heute oft kleiner; für **Hibernate** Swap ≥ RAM. **Tailoring**: Logserver → großes `/var`, Fileserver → großes `/home`.

### MBR vs. GPT (104.1)
| | MBR | GPT |
|---|---|---|
| Partitionen | max. **4 primäre** (oder 3 primäre + 1 **erweiterte** mit **logischen**) | bis **128** |
| Größe | bis **2 TiB** | > 2 TiB |
| Firmware | BIOS/Legacy | UEFI (BIOS mit BIOS-Boot-Partition möglich) |
| Sicherheit | – | **Backup-Tabelle** am Plattenende, CRC |
Unter Linux heißen MBR-Logische ab Nummer **5** (`/dev/sda5`).

### Partitionieren und Formatieren
- **fdisk** (interaktiv, MBR **und** GPT; `m` Hilfe, `n` neu, `p` anzeigen, `t` Typ, `d` löschen, **`w` schreiben**, `q` ohne Speichern), **gdisk** (speziell GPT), **parted** (MBR und GPT, **skriptbar**, schreibt **sofort**), `fdisk -l` / `lsblk` zum Ansehen. Gerätenamen genau prüfen!
- **mkfs** legt ein neues, leeres Dateisystem an (**löscht Daten**): `mkfs.ext4` (Standard), `mkfs.xfs` (robust, große Daten, RHEL-Standard), `mkfs.vfat` (USB, EFI, Windows-Austausch), `mkfs.exfat` (große Dateien auf USB), `mkfs.btrfs` (Snapshots, Subvolumes, Kompression, Multi-Device). `mke2fs` = mkfs.ext2/3/4.
- **Swap**: `mkswap /dev/sdb3`, `swapon /dev/sdb3`, `swapoff`, `swapon --show`, `free -h`; dauerhaft per fstab-Eintrag.

### Einhängen (104.3)
- **`lsblk -f`** (Baum mit FS, Label, UUID), **`blkid`** (UUID, LABEL, TYPE). Die **UUID** identifiziert ein Dateisystem **stabil**, Gerätenamen wie `/dev/sdb` können sich ändern.
- `mount /dev/sdb1 /mnt`, `mount -o ro,noexec …`, `mount` (alle anzeigen), `findmnt`, `umount /mnt`, **`mount -a`** (alle fstab-Einträge außer `noauto`). „**target is busy**“ → offene Dateien mit `lsof +D /mnt` oder `fuser -vm /mnt` finden.
- **`/etc/fstab`** – sechs Felder:
```text
# <Gerät>        <Mountpoint> <Typ> <Optionen> <dump> <pass>
UUID=9f3c-...    /daten       ext4  defaults   0      2
UUID=a1b2-...    none         swap  sw         0      0
```
**pass**: 1 für `/`, 2 für andere, 0 = kein fsck (swap, none). **Fehler in der fstab können den Boot blockieren** → nach Änderung `mount -a` bzw. `findmnt --verify` testen; Option **`nofail`** verhindert, dass ein fehlendes Gerät den Boot stoppt. Weitere Optionen: `noauto`, `user`/`users` (Benutzer dürfen mounten), `ro`, `noexec`, `nosuid`, `nodev`, `_netdev`.
- **systemd** verwaltet Einhängungen auch über **`.mount`- und `.automount`-Units** (aus der fstab generiert). Wechselmedien landen oft unter **`/media/<user>/`** (udisks).

### Pflegen (104.2)
- **`df -h`** (Belegung je Dateisystem), **`df -i`** (Inodes!), **`du -sh verz`**, `du -h --max-depth=1`. „Voll trotz Platz?“ → oft sind die **Inodes** voll.
- **`fsck`** wählt das passende Werkzeug (`e2fsck` für ext, `fsck.vfat` …). **Nur auf ungemounteten** (oder read-only) Dateisystemen! `-y` alle Rückfragen mit ja, `-n` nur prüfen, `-f` erzwingen. Beim Booten automatisch laut **pass-Feld**.
- **`tune2fs -l`** (Parameter anzeigen), `-L label`, **`-m 1`** (reservierte Blöcke auf 1 % – Standard **5 % für root**), `-c`/`-i` (Prüfintervalle), `-j` (ext2 → ext3); **`dumpe2fs`** (Details). **XFS**: `xfs_repair` (statt fsck), `xfs_fsr` (Defragmentierung), `xfs_db` (Inspektion), `xfs_info`, `xfs_growfs`.

### Rechte und Eigentümer (104.5)
- Drei Klassen **u** (Eigentümer), **g** (Gruppe), **o** (Andere); drei Rechte **r = 4**, **w = 2**, **x = 1**. `ls -l`: `-rwxr-xr-- 1 seb team 812 skript.sh` – 1. Zeichen = Typ (`-` Datei, `d` Verzeichnis, `l` Link, `c`/`b` Geräte, `s` Socket, `p` Pipe).
- Bei **Verzeichnissen**: `r` = Inhalt auflisten, `w` = Dateien anlegen/löschen/umbenennen, **`x` = hineinwechseln** (und auf Inhalte zugreifen).
- **chmod**: symbolisch `u+x`, `go-w`, `a=r`, `u=rwx,g=rx,o=`; oktal **`755`** (rwxr-xr-x), **`644`** (rw-r--r--), **`600`**, **`750`**; `-R` rekursiv. Faustregeln: Datei 644, Verzeichnis 755, privat 600, Skript 755.
- **chown** `benutzer datei`, `benutzer:gruppe datei`, `-R`; **chgrp** `gruppe datei`. Eigentümer ändern darf **nur root**; die Gruppe darf der Eigentümer auf eine eigene Gruppe ändern.
- **umask** zieht Rechte von den Standardwerten ab (Dateien 666, Verzeichnisse 777): **umask 022 → 644 / 755**, 027 → 640 / 750, 077 → 600 / 700.
- **Sonderrechte**: **SUID (4)** – Programm läuft mit Rechten des **Eigentümers** (`/usr/bin/passwd` = `-rwsr-xr-x`); **SGID (2)** – Programm mit Gruppenrechten, bei **Verzeichnissen erben neue Dateien die Gruppe**; **Sticky (1)** – in gemeinsamen Verzeichnissen darf **nur der Eigentümer löschen** (`/tmp` = `drwxrwxrwt`). Setzen: `chmod u+s`, `g+s`, `+t` bzw. `chmod 4755`, `2775`, `1777`. Anzeige: `s`/`t` statt `x`, **großes `S`/`T`** = Sonderrecht ohne darunterliegendes x.

### Shared Libraries (102.3)
- **.so-Dateien** = gemeinsam genutzter Code; spart Platz/RAM und erlaubt zentrale Updates (statisch gelinkte Programme enthalten den Code selbst). Typisch in `/lib`, `/lib64`, `/usr/lib`, `/usr/lib/x86_64-linux-gnu`. Der **dynamische Linker** (`ld-linux.so`) lädt sie beim Start. **soname** mit Version (`libc.so.6`) erlaubt parallele Versionen.
- **`ldd programm`** zeigt benötigte Libraries; **`ldconfig`** baut den Cache **`/etc/ld.so.cache`** neu (`ldconfig -p` listet ihn); **`/etc/ld.so.conf`** + **`/etc/ld.so.conf.d/*.conf`** = Suchverzeichnisse; **`LD_LIBRARY_PATH`** = zusätzliche Suchpfade (temporär, für Tests). Neue Library-Pfade: Datei in `/etc/ld.so.conf.d/` + `ldconfig`.

### Vertiefung LPIC-2
- **LVM (204.3)**: **PV** (Physical Volume, `pvcreate`) → **VG** (Volume Group = Pool, `vgcreate vg0 /dev/sdb1`) → **LV** (Logical Volume = flexible Partition, `lvcreate -L 10G -n daten vg0`) → Dateisystem (`/dev/vg0/daten`). Übersicht `pvs`, `vgs`, `lvs`. Erweitern: `vgextend`, **`lvextend -L +5G -r`** (`-r` passt das Dateisystem an); Snapshot `lvcreate -s -L 1G -n snap /dev/vg0/daten`. Vorteil: über Platten hinweg, online wachsen.
- **Software-RAID (204.1)** mit `mdadm --create /dev/md0 --level=1 --raid-devices=2 /dev/sdb /dev/sdc`, Status `cat /proc/mdstat`. RAID 0 Stripe (Tempo, keine Redundanz), **RAID 1 Mirror**, RAID 5 Parität (ab 3 Platten, 1 Ausfall), RAID 10. **RAID ≠ Backup**.
- **LUKS (203.3)**: `cryptsetup luksFormat /dev/sdb1`, `cryptsetup luksOpen /dev/sdb1 safe` → `/dev/mapper/safe` → mkfs/mount; dauerhaft über **`/etc/crypttab`**. Stack: Platten → (RAID) → (LUKS) → LVM → Dateisystem; typisch **LVM on LUKS**.
- Bonus: `smartctl -H/-a/-t short`, `hdparm -I/-tT`, `resize2fs`, `xfs_growfs`, `ncdu`; Platte voll, aber `du` findet nichts → **gelöschte, noch offene Dateien** (`lsof | grep deleted`).

## Einfach

Eine **Festplatte** ist wie ein **großes, leeres Grundstück**. **Partitionieren** heißt, das Grundstück mit **Zäunen in Gärten** aufzuteilen. Die **Partitionstabelle** ist der **Lageplan**: Der alte Lageplan **MBR** hat nur Platz für **4 Gärten** und höchstens 2 TB, der neue **GPT** für **128 Gärten**, beliebig groß, und hat sogar eine **Kopie des Lageplans** am anderen Ende.

**Formatieren** (`mkfs`) heißt, in einem Garten **Beete und Wege** anzulegen, damit man dort etwas ordentlich ablegen kann. Achtung: Dabei wird **alles umgegraben** – was vorher drin war, ist weg.

**Mounten** ist wie **eine Tür zum Garten** in deinem Haus einbauen. Linux hat nur **einen einzigen Flur** (`/`). Jeder Garten bekommt eine Tür irgendwo in diesem Flur, z. B. `/home` oder `/daten`. Die **`/etc/fstab`** ist die **Liste: „Welche Tür soll beim Aufstehen automatisch geöffnet werden?“** Statt „der Garten links“ (`/dev/sdb1` – das kann sich ändern) schreibt man lieber die **Hausnummer** (**UUID**), die sich nie ändert. Ein Fehler in dieser Liste kann dazu führen, dass das Haus morgens **nicht aufwacht** (Boot hängt).

**Swap** ist ein **Abstellraum**: Wenn der Schreibtisch (RAM) voll ist, wird Kram dorthin ausgelagert – langsamer, aber besser als nichts.

**fsck** ist der **Gärtner, der kaputte Beete repariert** – aber nur, wenn gerade **niemand im Garten arbeitet** (nicht gemountet). Sonst trampelt er alles kaputt.

**Rechte** sind **drei Schilder an jeder Datei**: Was darf der **Besitzer**, die **Gruppe**, **alle anderen**? Jeweils **lesen (4)**, **schreiben (2)**, **ausführen (1)**. Man rechnet zusammen: 4+2+1 = 7 = alles. **755** heißt: Besitzer alles, die anderen lesen und ausführen. Die **umask** ist ein **Sieb**, das neuen Dateien automatisch ein paar Rechte wegnimmt.

Sonderrechte: **SUID** ist wie ein **Dienstausweis**, den ein Programm beim Laufen trägt – `passwd` darf deshalb in die geheime Passwortdatei schreiben. Das **Sticky Bit** an `/tmp` ist wie im **Gemeinschaftskühlschrank**: Jeder darf etwas reinstellen, aber **nur sein eigenes Essen** wieder rausnehmen.

**Shared Libraries** sind wie eine **Gemeinschafts-Werkzeugkiste**, die alle Programme benutzen, statt dass jedes seine eigene Kiste mitschleppt.

## Merksatz
- **MBR = 4 primär, 2 TiB – GPT = 128, riesig, mit Backup**.
- **fstab: Gerät – Ort – Typ – Optionen – dump – pass**.
- **UUID statt /dev/sdX**, **nofail** für Wechselplatten.
- **pass: 1 für /, 2 für den Rest, 0 für nie**.
- **r4 w2 x1 – 644 Datei, 755 Ordner, 600 privat**.
- **umask 022 → 644/755**.
- **SUID 4 · SGID 2 · Sticky 1** (Merkhilfe „4-2-1 wie rwx“).
- **df = wie voll, df -i = Inodes, du = wer belegt**.
- **fsck nie auf gemountet**.

## Prüfungsfalle
- **fdisk** partitioniert nur – formatieren macht **mkfs**.
- fdisk schreibt erst mit **`w`**, parted schreibt **sofort**.
- **Platz frei, aber „No space left“** → Inodes voll (`df -i`).
- Bei Verzeichnissen bedeutet **x** „hineinwechseln“, nicht „ausführen“.
- **umask** wird **abgezogen** – umask 022 gibt **keine** Ausführungsrechte auf neue Dateien (666 − 022 = 644).
- **Großes S/T** in `ls -l` = Sonderrecht gesetzt, aber **kein x** darunter.
- Nur **root** darf den **Eigentümer** ändern.
- **XFS** wird mit **xfs_repair** repariert, nicht mit e2fsck.
- `LD_LIBRARY_PATH` ist temporär; dauerhaft: `/etc/ld.so.conf.d/` + **`ldconfig`**.
- **RAID ist kein Backup**.

## Grafik

### Vom Datenträger zum Mountpoint
1. Disk1: leere Platte /dev/sdb
2. Admin -> Disk1: fdisk legt GPT und Partition sdb1 an
3. Admin -> sdb1: mkfs.ext4 erzeugt Dateisystem mit UUID
4. Admin -> fstab: Eintrag UUID=… /daten ext4 defaults 0 2
5. Admin -> mount: mount -a hängt ein
6. sdb1 -> /daten: Dateisystem erscheint im Verzeichnisbaum

### Rechteprüfung beim Zugriff
1. Benutzer -> Kernel: will datei.txt lesen
2. Kernel: UID 0? Dann Zugriff ohne Prüfung
3. Kernel: Benutzer = Eigentümer? Dann gelten u-Rechte
4. Kernel: Mitglied der Gruppe? Dann gelten g-Rechte
5. Kernel: sonst gelten o-Rechte
6. Kernel -> Benutzer: erlaubt oder Permission denied

### umask-Rechnung
1. Datei: Standard 666 (rw-rw-rw-)
2. umask: 022 zieht w bei Gruppe und Anderen ab
3. Datei: Ergebnis 644 (rw-r--r--)
4. Verzeichnis: Standard 777 – 022 = 755

### LVM-Stapel
1. Disk1 -> PV: pvcreate /dev/sdb1
2. Disk2 -> PV: pvcreate /dev/sdc1
3. PV -> VG: vgcreate vg0 – ein gemeinsamer Pool
4. VG -> LV: lvcreate -L 10G -n daten vg0
5. LV -> Dateisystem: mkfs.ext4 /dev/vg0/daten
6. LV: lvextend -L +5G -r wächst im Betrieb

## Lab
**Maschine**: debian01 (VM) mit einer **zusätzlichen leeren virtuellen Festplatte** (10 GiB, erscheint als `/dev/sdb`). Gerätenamen vorher mit `lsblk` prüfen!
```bash
# auf debian01 – ansehen
lsblk -f; sudo fdisk -l; sudo blkid; findmnt; swapon --show

# auf debian01 – GPT anlegen und partitionieren (parted, skriptbar)
sudo parted -s /dev/sdb mklabel gpt
sudo parted -s /dev/sdb mkpart daten ext4 1MiB 5GiB
sudo parted -s /dev/sdb mkpart tausch xfs 5GiB 8GiB
sudo parted -s /dev/sdb mkpart swap linux-swap 8GiB 100%
sudo parted /dev/sdb print

# auf debian01 – formatieren und Swap
sudo mkfs.ext4 -L daten /dev/sdb1
sudo apt install -y xfsprogs && sudo mkfs.xfs /dev/sdb2
sudo mkswap /dev/sdb3 && sudo swapon /dev/sdb3 && free -h

# auf debian01 – mounten und fstab
sudo mkdir -p /daten /tausch
sudo mount /dev/sdb1 /daten; findmnt /daten
UUID=$(sudo blkid -s UUID -o value /dev/sdb1)
echo "UUID=$UUID /daten ext4 defaults,nofail 0 2" | sudo tee -a /etc/fstab
sudo umount /daten; sudo mount -a; sudo findmnt --verify

# auf debian01 – pflegen
df -h /daten; df -i /daten; sudo du -sh /var/log
sudo umount /daten; sudo fsck -f /dev/sdb1; sudo mount /daten
sudo tune2fs -l /dev/sdb1 | grep -i -E "reserved|volume name"; sudo tune2fs -m 1 /dev/sdb1

# auf debian01 – Rechte
sudo groupadd team; sudo mkdir /daten/projekt
sudo chown root:team /daten/projekt; sudo chmod 2775 /daten/projekt
umask; touch ~/neu.txt; mkdir ~/neuverz; ls -ld ~/neu.txt ~/neuverz
chmod 600 ~/neu.txt; chmod u+x,g-w ~/neuverz; ls -l /usr/bin/passwd; ls -ld /tmp
sudo mkdir /daten/tausch && sudo chmod 1777 /daten/tausch

# auf debian01 – Libraries
ldd /bin/ls; ldconfig -p | grep libssl; cat /etc/ld.so.conf; ls /etc/ld.so.conf.d/
```

## Befehle
- `lsblk -f` – Blockgeräte mit Dateisystem, Label und UUID
- `blkid` – UUID, LABEL und TYPE aller Geräte
- `fdisk /dev/sdb` – interaktiv partitionieren (MBR/GPT)
- `gdisk /dev/sdb` – GPT partitionieren
- `parted /dev/sdb print` – Partitionstabelle anzeigen
- `mkfs.ext4 -L label /dev/sdb1` – ext4 mit Label anlegen
- `mkfs.xfs /dev/sdb2` – XFS anlegen
- `mkfs.vfat /dev/sdc1` – FAT anlegen
- `mkswap /dev/sdb3` – Swap einrichten
- `swapon /dev/sdb3` – Swap aktivieren
- `mount -o ro /dev/sdb1 /mnt` – read-only einhängen
- `umount /mnt` – aushängen
- `mount -a` – alle fstab-Einträge einhängen
- `findmnt --verify` – fstab auf Fehler prüfen
- `fuser -vm /mnt` – Prozesse, die einen Mountpoint benutzen
- `df -h` – Belegung je Dateisystem
- `df -i` – Inode-Belegung
- `du -sh verz` – Größe eines Verzeichnisses
- `fsck -f /dev/sdb1` – Dateisystem prüfen (ungemountet)
- `tune2fs -l /dev/sdb1` – ext-Parameter anzeigen
- `tune2fs -m 1 /dev/sdb1` – reservierte Blöcke auf 1 %
- `xfs_repair /dev/sdb2` – XFS reparieren
- `chmod 755 datei` – Rechte oktal setzen
- `chmod u+x,go-w datei` – Rechte symbolisch ändern
- `chown benutzer:gruppe datei` – Eigentümer und Gruppe ändern
- `chgrp gruppe datei` – Gruppe ändern
- `umask 027` – Standardmaske setzen
- `chmod 2775 verz` – SGID auf Verzeichnis
- `chmod 1777 verz` – Sticky Bit setzen
- `ldd /bin/ls` – benötigte Shared Libraries
- `ldconfig` – Library-Cache neu aufbauen
- `pvcreate / vgcreate / lvcreate` – LVM-Stapel anlegen (LPIC-2)

## Übungen
- A: Welche Partitionstabelle erlaubt > 2 TB und viele Partitionen? (MBR, GPT, FAT, swap) | L: GPT – bis 128 Partitionen; MBR ist auf 4 primäre und 2 TB begrenzt.
- A: Womit legt man ein ext4-Dateisystem an? (fdisk, mkfs.ext4, mount, mkswap) | L: mkfs.ext4 /dev/sdb1 – fdisk partitioniert nur, mount hängt ein, mkswap macht Swap.
- A: Was nutzt man in /etc/fstab statt /dev/sdb1, weil es stabil ist? | L: Die UUID (oder das LABEL).
- A: Welcher Befehl hängt alle in /etc/fstab definierten Dateisysteme ein? | L: mount -a (außer noauto-Einträge).
- A: Welche Oktalzahl entspricht rw-r--r--? (755, 644, 600, 777) | L: 644
- A: Welches Sonderrecht erlaubt in /tmp nur dem Eigentümer das Löschen? | L: Das Sticky Bit (chmod +t bzw. 1777).
- A: Was ist in LVM eine VG? | L: Ein Pool aus einem oder mehreren Physical Volumes, aus dem LVs geschnitten werden.
- A: Welches RAID-Level spiegelt die Daten 1:1 auf zwei Platten? | L: RAID 1 (Mirror).
- A: Ein Projektordner soll für die Gruppe team gemeinsam beschreibbar sein und neue Dateien sollen automatisch der Gruppe team gehören. | L: chown root:team /daten/projekt; chmod 2775 /daten/projekt (SGID).
- A: df -h zeigt 40 % frei, trotzdem „No space left on device“. Ursache und Prüfung? | L: Wahrscheinlich keine freien Inodes mehr – prüfen mit df -i.

## Karteikarten
- F: Warum legt man /var oft auf eine eigene Partition? | A: Damit volle Logs oder Spool-Daten nicht das Root-Dateisystem füllen.
- F: Warum braucht man oft eine separate /boot-Partition? | A: Der Bootloader muss Kernel und initramfs lesen, bevor LVM oder Verschlüsselung aktiv sind.
- F: Wie viele Partitionen erlaubt MBR? | A: 4 primäre oder 3 primäre + 1 erweiterte mit logischen Partitionen (ab Nr. 5).
- F: Was bedeuten die sechs Felder der fstab? | A: Gerät, Mountpoint, Dateisystemtyp, Optionen, dump, pass (fsck-Reihenfolge).
- F: Wozu dient die fstab-Option nofail? | A: Ein fehlendes Gerät stoppt den Bootvorgang nicht.
- F: Warum verwendet man UUIDs in der fstab? | A: Gerätenamen wie /dev/sdb können sich ändern, die UUID eines Dateisystems bleibt stabil.
- F: Was tun bei „umount: target is busy“? | A: Mit lsof +D /mnt oder fuser -vm /mnt die blockierenden Prozesse finden und beenden.
- F: Was zeigt df -i? | A: Belegte und freie Inodes je Dateisystem.
- F: Wie viel Prozent reserviert ext4 standardmäßig für root und wie ändert man es? | A: 5 %; tune2fs -m 1 /dev/sdX setzt 1 %.
- F: Was bedeutet das x-Recht bei Verzeichnissen? | A: In das Verzeichnis wechseln und auf darin liegende Dateien zugreifen dürfen.
- F: Welche Rechte ergeben sich bei umask 027? | A: Dateien 640, Verzeichnisse 750.
- F: Was bewirkt SGID auf einem Verzeichnis? | A: Neue Dateien erben die Gruppe des Verzeichnisses.
- F: Was bedeutet ein großes S in ls -l (z. B. -rwSr--r--)? | A: SUID ist gesetzt, aber der Eigentümer hat kein Ausführungsrecht.
- F: Was macht ldconfig? | A: Baut den Library-Cache /etc/ld.so.cache aus /etc/ld.so.conf und den Standardpfaden neu auf.
- F: Was ist LD_LIBRARY_PATH? | A: Umgebungsvariable mit zusätzlichen Suchpfaden für Shared Libraries (temporär).

## Quiz
? Welche Partitionstabelle unterstützt Datenträger über 2 TiB?
* GPT
- MBR
- FAT32
- swap

? Was legt `mkfs.xfs /dev/sdb2` an?
* Ein neues, leeres XFS-Dateisystem auf sdb2
- Eine neue Partition sdb2
- Einen Swap-Bereich
- Einen Eintrag in /etc/fstab

? Was bedeutet die 2 im letzten fstab-Feld?
* fsck prüft das Dateisystem nach dem Root-Dateisystem
- Das Dateisystem wird zweimal gemountet
- dump sichert es alle 2 Tage
- Es wird nie geprüft

? Welcher Befehl zeigt UUID und Typ eines Dateisystems?
* blkid /dev/sdb1
- df -i /dev/sdb1
- mount -u /dev/sdb1
- fsck -l /dev/sdb1

? Welche Rechte erhält eine neue Datei bei umask 022?
* 644
- 755
- 022
- 600

? Was bewirkt das Sticky Bit auf /tmp?
* Nur der Eigentümer kann seine Dateien löschen oder umbenennen
- Dateien laufen mit Rechten des Eigentümers
- Neue Dateien erben die Gruppe
- Das Verzeichnis ist schreibgeschützt

? Welches Programm hat typischerweise das SUID-Bit?
* /usr/bin/passwd
- /usr/bin/ls
- /usr/bin/cat
- /etc/passwd

? Wie repariert man ein XFS-Dateisystem?
* xfs_repair
- e2fsck
- tune2fs -r
- xfs_fsr

? Welche Oktalzahl entspricht rwxr-x---?
* 750
- 755
- 640
- 570

? Was ist bei fsck unbedingt zu beachten?
* Das Dateisystem darf nicht beschreibbar gemountet sein
- Es muss immer mit -y laufen
- Es funktioniert nur auf XFS
- Es muss im grafischen Modus laufen

? Welcher Befehl zeigt die Shared Libraries eines Programms?
* ldd
- ldconfig -r
- lsmod
- lsof -l

? Wer darf den Eigentümer einer Datei ändern?
* Nur root
- Der Eigentümer selbst
- Jedes Gruppenmitglied
- Jeder mit Schreibrecht

## Spickzettel
- / /home /var /boot swap ESP(/boot/efi) · Hibernate: Swap ≥ RAM
- MBR 4 primär/2 TiB · GPT 128/>2 TiB/Backup · fdisk (w!) · gdisk · parted (sofort)
- mkfs.ext4/xfs/vfat/exfat/btrfs · mkswap + swapon
- lsblk -f · blkid · mount -a · umount · fuser/lsof bei busy
- fstab: Gerät Mountpoint Typ Optionen dump pass · UUID · nofail · pass 1/2/0
- df -h · df -i · du -sh · fsck nur ungemountet · tune2fs -l/-m · xfs_repair
- r4 w2 x1 · 644/755/600 · umask 022 → 644/755
- SUID 4 (passwd) · SGID 2 (Gruppe erben) · Sticky 1 (/tmp) · S/T = ohne x
- ldd · ldconfig · /etc/ld.so.conf(.d) · LD_LIBRARY_PATH
- LPIC-2: PV → VG → LV · mdadm RAID 1 · cryptsetup LUKS
