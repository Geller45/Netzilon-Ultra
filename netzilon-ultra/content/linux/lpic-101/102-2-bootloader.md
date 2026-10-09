---
id: linux-101-102-2-bootloader
bereich: Linux
fach: Linux I
pruefungen: [LPIC-1]
block: LPIC-101
kapitel: LPIC-1 Prüfung 101 – Linux-Installation und Paketverwaltung
titel: 102.2 Einen Bootmanager installieren (GRUB 2, GRUB Legacy)
stufe: Fortgeschritten
quellen: [LPI-Learning-Material-101-500-de.pdf, 1.06_Linux_-_Booten_Bootloader_und_Init.pdf]
verweise: [linux-l1-06-booten, linux-101-101-2-booten, linux-101-102-1-partitionierung]
---

## Profi

### Lernziel (Gewicht 2)
GRUB 2 installieren und konfigurieren, Kernelparameter setzen, Rettungssystem starten; GRUB Legacy erkennen.

### GRUB 2
- Bootloader der meisten Distributionen. Phasen: Stage-1-Code im MBR/ESP → `core.img` → Module/Konfiguration in `/boot/grub/` (bzw. `/boot/grub2/` bei RHEL).
- **`/boot/grub/grub.cfg` wird generiert – nie von Hand bearbeiten!** Eigene Einstellungen in **`/etc/default/grub`** (`GRUB_TIMEOUT`, `GRUB_CMDLINE_LINUX_DEFAULT="quiet splash"`, `GRUB_DEFAULT`, `GRUB_DISABLE_OS_PROBER`), eigene Einträge in `/etc/grub.d/40_custom`. Danach neu erzeugen: **`update-grub`** (Debian) bzw. **`grub-mkconfig -o /boot/grub/grub.cfg`** / `grub2-mkconfig -o /boot/grub2/grub.cfg` (RHEL).
- Installation: **`grub-install /dev/sda`** (BIOS: auf die Platte, **nicht** die Partition); UEFI: `grub-install --target=x86_64-efi --efi-directory=/boot/efi`. Reparatur vom Live-System: Root mounten, `chroot`, `grub-install`, `update-grub`.
- Einträge: `menuentry "…" { set root=(hd0,1)  linux /vmlinuz root=/dev/sda2 ro quiet  initrd /initrd.img }`. Festplattenbenennung: **`(hd0,1)`** – Platten ab 0, Partitionen bei GRUB 2 ab **1** (GRUB Legacy ab 0: `(hd0,0)`).
- Beim Boot: **e** = Eintrag editieren (einmalig), **c** = GRUB-Shell, Kernelparameter anfügen (`single`, `init=/bin/bash`).
- Passwortschutz mit `grub-mkpasswd-pbkdf2` und `set superusers`.

### GRUB Legacy (veraltet)
- Konfiguration `/boot/grub/menu.lst` (oder `grub.conf`), direkt editierbar; Installation mit `grub-install`/`grub` Shell; nur BIOS, kein GPT/UEFI. Heute **Legacy**. Weitere Bootloader: LILO (veraltet), SYSLINUX/ISOLINUX/EXTLINUX, systemd-boot, PXE für Netzwerkboot.

## Einfach

Der **Bootloader** ist der **Türöffner des Computers**. Nachdem die Firmware „Hallo“ gesagt hat, übernimmt er und fragt: „Welches System soll ich starten?“ Bei Linux heißt er meist **GRUB**.

GRUB hat zwei Dateien, die man nicht verwechseln darf. Die eine, `grub.cfg`, ist wie ein **gedruckter Speiseplan**. Du schreibst nicht direkt hinein, denn beim nächsten Druck ist alles weg. Stattdessen änderst du die **Wunschzettel** (`/etc/default/grub` oder Dateien in `/etc/grub.d/`) und lässt dann den Speiseplan **neu drucken** mit `update-grub`.

Im GRUB-Menü kannst du beim Start die Taste **e** drücken. Dann darfst du die Zeile kurz ansehen und für diesen einen Start ändern, etwa `single` anhängen, um nur im Wartungsmodus zu starten. Es ändert sich nichts dauerhaft. Das ist wie ein Post-it auf dem Speiseplan, das nach dem Essen wieder abgenommen wird.

Wenn der Bootloader kaputt ist (z. B. nach einer Windows-Installation), startest du den Computer mit einem **Rettungsstick**, steigst mit `chroot` in dein System und installierst GRUB neu: `grub-install /dev/sda` und `update-grub`.

Die alte Version hieß **GRUB Legacy** und hatte die Datei `menu.lst`. Sie ist veraltet, kommt aber in Prüfungen als Vergleich vor.

## Merksatz
- **grub.cfg nie editieren – /etc/default/grub ändern und update-grub.**
- **grub-install auf die Platte, nicht auf die Partition.**
- **GRUB 2: (hd0,1) = erste Partition, Legacy: (hd0,0).**
- **e = editieren, c = Shell.**
- **RHEL: grub2-mkconfig.**

## Prüfungsfalle
- Direkte Änderungen in `grub.cfg` gehen beim nächsten `update-grub` **verloren**.
- Partitionszählung: GRUB 2 beginnt bei **1**, GRUB Legacy bei **0**.
- BIOS-Installation auf `/dev/sda`, nicht `/dev/sda1`.
- GRUB Legacy: `menu.lst`; GRUB 2: `grub.cfg`.
- Änderungen im Bootmenü per `e` gelten nur für diesen Start.
- RHEL: Pfad `/boot/grub2/`, Befehl `grub2-mkconfig`.

## Grafik

### GRUB-Konfiguration ändern
1. Admin -> /etc/default/grub: GRUB_TIMEOUT=10 setzen
2. Admin -> update-grub: führt grub-mkconfig aus
3. update-grub -> /etc/grub.d: Skripte erzeugen Einträge
4. update-grub -> grub.cfg: schreibt /boot/grub/grub.cfg neu
5. Bootloader -> Kernel: beim nächsten Start gilt die neue Konfiguration

## Lab
**Maschine**: debian01 (BIOS-VM).
```bash
# auf debian01
cat /etc/default/grub
sudo nano /etc/default/grub        # GRUB_TIMEOUT=10
sudo update-grub
sudo grep -E "menuentry|linux " /boot/grub/grub.cfg | head
# Reparatur von einem Live-System aus
sudo mount /dev/sda2 /mnt && sudo mount --bind /dev /mnt/dev && sudo mount --bind /proc /mnt/proc && sudo mount --bind /sys /mnt/sys
sudo chroot /mnt grub-install /dev/sda
sudo chroot /mnt update-grub
```

## Befehle
- `update-grub` – grub.cfg neu erzeugen (Debian)
- `grub-mkconfig -o /boot/grub/grub.cfg` – Konfiguration erzeugen
- `grub-install /dev/sda` – GRUB installieren
- `grub2-mkconfig -o /boot/grub2/grub.cfg` – RHEL-Variante
- `grub-mkpasswd-pbkdf2` – Passworthash erzeugen
- `chroot /mnt` – in Rettungssystem wechseln

## Übungen
- A: Wo ändert man den GRUB-Timeout? | L: GRUB_TIMEOUT in /etc/default/grub, dann update-grub.
- A: Warum nicht grub.cfg direkt ändern? | L: Sie wird generiert und überschrieben.
- A: Wie heißt in GRUB 2 die erste Partition der ersten Platte? | L: (hd0,1)
- A: Wie installiert man GRUB im MBR der ersten Platte? | L: grub-install /dev/sda
- A: Welche Datei hat GRUB Legacy? | L: /boot/grub/menu.lst

## Karteikarten
- F: Welche Datei erzeugt update-grub? | A: /boot/grub/grub.cfg
- F: Wo stehen eigene Menüeinträge? | A: /etc/grub.d/40_custom
- F: Welche Taste editiert einen Eintrag im GRUB-Menü? | A: e
- F: Welche Taste öffnet die GRUB-Shell? | A: c
- F: Wie heißt die Konfiguration von GRUB Legacy? | A: menu.lst (grub.conf)
- F: Was bedeutet (hd0,1) in GRUB 2? | A: Erste Platte, erste Partition.
- F: Wie heißt der RHEL-Befehl für grub-mkconfig? | A: grub2-mkconfig
- F: Welcher Befehl installiert GRUB für UEFI? | A: grub-install --target=x86_64-efi --efi-directory=/boot/efi
- F: Welche Aufgabe hat chroot bei der Reparatur? | A: Wechselt in das Root des defekten Systems, um dort Befehle auszuführen.

## Quiz
? Welche Datei bearbeitet man für dauerhafte GRUB-2-Einstellungen?
* /etc/default/grub
- /boot/grub/grub.cfg
- /boot/grub/menu.lst
- /etc/grub.cfg

? Wie erzeugt man auf Debian grub.cfg neu?
* update-grub
- grub-reload
- grub-edit
- grubctl

? Was bedeutet (hd0,1) in GRUB 2?
* Erste Platte, erste Partition
- Erste Platte, zweite Partition
- Zweite Platte, erste Partition
- Erste Platte, MBR

? Auf welches Ziel installiert man GRUB im BIOS-Fall?
* /dev/sda
- /dev/sda1
- /boot
- /

? Welche Konfigurationsdatei nutzte GRUB Legacy?
* menu.lst
- grub.cfg
- lilo.conf
- grub.ini

? Welche Taste im Bootmenü erlaubt das Bearbeiten des Eintrags?
* e
- b
- m
- F8

? Gelten Änderungen mit e dauerhaft?
* Nein, nur für diesen Start
- Ja, in grub.cfg
- Ja, in /etc/default/grub
- Nur mit Passwort

? Wie heißt das RHEL-Gegenstück zu update-grub?
* grub2-mkconfig -o /boot/grub2/grub.cfg
- grub-update
- dracut
- yum grub

## Spickzettel
- GRUB 2: grub.cfg generiert · /etc/default/grub · /etc/grub.d
- update-grub / grub-mkconfig / grub2-mkconfig
- grub-install /dev/sda (Platte!)
- (hd0,1) GRUB2 · (hd0,0) Legacy
- e / c im Menü · Legacy: menu.lst
