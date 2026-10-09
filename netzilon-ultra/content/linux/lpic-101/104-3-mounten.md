---
id: linux-101-104-3-mounten
bereich: Linux
fach: Linux I
pruefungen: [LPIC-1]
block: LPIC-101
kapitel: LPIC-1 Prüfung 101 – Geräte, Dateisysteme, FHS
titel: 104.3 Das Mounten und Unmounten von Dateisystemen
stufe: Fortgeschritten
quellen: [LPI-Learning-Material-101-500-de.pdf, 1.07_Linux_-_Datentraeger_Dateisysteme_und_Rechte.pdf]
verweise: [linux-l1-07-datentraeger, linux-101-104-1-partitionen-dateisysteme, linux-101-104-2-integritaet]
---

## Profi

### Lernziel (Gewicht 3)
Dateisysteme manuell und automatisch einbinden: `mount`, `umount`, `/etc/fstab`, UUID/Label, systemd-mount.

### mount und umount
- `mount` ohne Argumente listet; `mount -t ext4 -o ro,noexec /dev/sdb1 /mnt/daten`; `mount -a` (alle fstab-Einträge), `mount -o remount,rw /`, `mount --bind /quelle /ziel`. `umount /mnt/daten` (**Mountpoint oder Gerät**; nicht „unmount“). „target is busy“: `lsof +f -- /mnt`, `fuser -vm /mnt`; `umount -l` (lazy).
- Der **Mountpoint** muss ein existierendes Verzeichnis sein; vorhandener Inhalt wird verdeckt.
- Hilfen: `findmnt`, `/proc/mounts`, `/etc/mtab`, `lsblk`, `blkid`, `losetup`/`mount -o loop datei.iso /mnt`.

### /etc/fstab
Sechs Felder: `Gerät  Mountpunkt  Typ  Optionen  dump  pass`
```text
UUID=3c1f…  /           ext4   defaults,errors=remount-ro  0 1
UUID=9a2b…  /home       ext4   defaults                    0 2
LABEL=daten /srv/daten  xfs    defaults,noatime            0 2
/swapfile   none        swap   sw                          0 0
//srv/share /mnt/smb    cifs   credentials=/root/.smb,_netdev 0 0
```
- Gerät: **UUID** (stabil, `blkid`), `LABEL=`, `PARTUUID=`, Gerätename (veränderlich!). Optionen: `defaults` (rw, suid, dev, exec, auto, nouser, async), `ro`, `noexec`, `nosuid`, `nodev`, `user`, `noauto`, `noatime`, `_netdev`, `nofail`, `x-systemd.automount`. **dump** (0/1) für Backup, **pass** (0 nein, 1 Root, 2 andere) für fsck.
- **systemd**: `.mount`- und `.automount`-Units, `systemctl daemon-reload` nach fstab-Änderung.

## Einfach

In Linux gibt es **keine Laufwerksbuchstaben** wie C: oder D:. Stattdessen gibt es **einen einzigen großen Baum** (`/`). Ein weiteres Laufwerk – etwa ein USB-Stick – musst du wie einen **Ast an den Baum kleben**. Das heißt **mounten** (einhängen). Du suchst dir einen Ast (einen leeren Ordner, den **Mountpoint**, z. B. `/mnt/usb`) und sagst: „An diesem Ast hängt jetzt der Stick.“ Befehl: `mount /dev/sdb1 /mnt/usb`.

Zum Abnehmen sagst du `umount /mnt/usb` (ohne n nach u, auch wenn es sich so liest). Läuft noch ein Programm im Ordner, sagt Linux „busy“ – erst das Programm beenden.

Damit der Ast nach jedem Neustart **automatisch wieder drankommt**, schreibst du eine Zeile in die **Einkaufsliste für Platten**: `/etc/fstab`. Pro Zeile stehen sechs Dinge: Was (am besten die **UUID**, die eindeutige Seriennummer), Wohin (Mountpunkt), Welches Dateisystem, Optionen, dump, pass. Warum UUID und nicht `/dev/sdb1`? Weil sich Gerätenamen ändern können, wenn du einen anderen Stick einsteckst, die UUID aber nie.

Mit `mount -a` probierst du die Liste sofort aus. Ein Fehler in der fstab kann den Start blockieren – darum testen, bevor du neu startest!

Praktische Optionen: `ro` (nur lesen), `noexec` (keine Programme starten), `nofail` (kein Drama, wenn die Platte fehlt).

## Merksatz
- **mount Gerät Ordner · umount (ohne n).**
- **fstab: Gerät – Mountpunkt – Typ – Optionen – dump – pass.**
- **UUID statt /dev/sdX.**
- **mount -a testet die fstab.**
- **defaults = rw, suid, dev, exec, auto, nouser, async.**

## Prüfungsfalle
- Der Befehl heißt **umount**, nicht unmount.
- `umount` akzeptiert Mountpunkt **oder** Gerät, nicht beides.
- Die fstab hat **6 Felder**; Spalte 6 = fsck-Pass, Spalte 5 = dump.
- Ein fstab-Fehler kann den Boot in den Notfallmodus bringen (hilft: `nofail`).
- `mount --bind` bindet ein **Verzeichnis**, kein Gerät.
- `noauto` mountet beim Boot **nicht** automatisch; `user` erlaubt normalen Benutzern das Mounten.
- Swap hat in der fstab den Mountpunkt `none`.

## Grafik

### Mount-Vorgang
1. Admin -> Dateisystem: mkdir /mnt/usb (Mountpoint anlegen)
2. Admin -> mount: mount /dev/sdb1 /mnt/usb
3. mount -> Kernel: Dateisystem wird in den Verzeichnisbaum eingehängt
4. Benutzer -> /mnt/usb: Dateien lesen und schreiben
5. Admin -> umount: umount /mnt/usb
6. Kernel -> Stick: Daten werden geschrieben, Stick kann entfernt werden

## Lab
**Maschine**: debian01 mit /dev/sdb1 (ext4).
```bash
# auf debian01
sudo mkdir -p /mnt/daten
sudo mount /dev/sdb1 /mnt/daten
findmnt /mnt/daten
sudo umount /mnt/daten
sudo blkid /dev/sdb1
echo "UUID=$(sudo blkid -s UUID -o value /dev/sdb1) /mnt/daten ext4 defaults,nofail 0 2" | sudo tee -a /etc/fstab
sudo mount -a
df -hT /mnt/daten
sudo mount -o remount,ro /mnt/daten
```

## Befehle
- `mount` – Mounts anzeigen
- `mount -t typ -o opt dev dir` – manuell mounten
- `umount dir` – aushängen
- `mount -a` – fstab anwenden
- `findmnt` – Mount-Baum
- `blkid` – UUID bestimmen
- `mount -o remount,rw /` – neu einhängen
- `lsof +f -- /mnt` – Prozesse am Mountpunkt

## Übungen
- A: Wie hängst du /dev/sdb1 nach /mnt/x ein, nur lesend? | L: mount -o ro /dev/sdb1 /mnt/x
- A: Wie testest du fstab-Änderungen? | L: mount -a
- A: Wie ermittelst du die UUID? | L: blkid
- A: Was bedeutet 0 2 am Zeilenende? | L: dump=0 (kein Backup), pass=2 (fsck nach Root).
- A: Wie bindest du /srv/a nach /mnt/b ein? | L: mount --bind /srv/a /mnt/b

## Karteikarten
- F: Wie lautet der Befehl zum Aushängen? | A: umount
- F: Wie viele Felder hat eine fstab-Zeile? | A: Sechs.
- F: Warum UUID in der fstab? | A: Sie ist eindeutig und ändert sich nicht wie /dev/sdX.
- F: Was bewirkt noexec? | A: Verbietet das Ausführen von Programmen auf dem Dateisystem.
- F: Was bewirkt nofail? | A: Boot geht weiter, auch wenn das Gerät fehlt.
- F: Was ist ein Mountpoint? | A: Verzeichnis, an dem ein Dateisystem eingehängt wird.
- F: Was macht mount --bind? | A: Bindet ein Verzeichnis an einer zweiten Stelle ein.
- F: Welche Option erlaubt Benutzern das Mounten? | A: user
- F: Was zeigt findmnt? | A: Eingehängte Dateisysteme als Baum.
- F: Wie löst man „target is busy“? | A: Prozesse mit lsof/fuser finden und beenden, dann umount.

## Quiz
? Wie heißt der Befehl zum Aushängen?
* umount
- unmount
- detach
- eject -m

? Wie viele Felder hat eine fstab-Zeile?
* 6
- 4
- 5
- 8

? Warum nutzt man UUID in der fstab?
* Sie ändert sich nicht mit der Einsteckreihenfolge
- Sie ist kürzer
- Sie ist verschlüsselt
- Sie ist Pflicht

? Was bewirkt mount -a?
* Alle fstab-Einträge einhängen
- Alle Geräte auflisten
- Alles aushängen
- Alle Dateien anzeigen

? Was bedeutet die Option ro?
* Nur lesen
- Root-Zugriff
- Neu einlesen
- Reserve

? Welche Option verhindert Programmausführung?
* noexec
- nodev
- nosuid
- noatime

? Welcher Befehl zeigt die Prozesse, die ein Aushängen verhindern?
* lsof / fuser
- ps -e
- dmesg
- ldd

? Welcher Wert steht in der fstab für Swap als Mountpunkt?
* none
- /swap
- /dev/null
- swap0

## Spickzettel
- mount dev dir · umount · mount -a · findmnt
- fstab: dev dir typ opts dump pass
- UUID=… · defaults · ro noexec nosuid nofail user noauto
- --bind · -o remount,rw · busy → lsof/fuser
