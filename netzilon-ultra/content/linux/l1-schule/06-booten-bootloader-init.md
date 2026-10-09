---
id: linux-l1-06-booten
bereich: Linux
fach: Linux I
pruefungen: [LPIC-1, Schule]
block: L1
kapitel: Linux I – Grundlagen
titel: 1.06 Booten, GRUB, systemd-Targets und Recovery
stufe: Fortgeschritten
quellen: [1.06_Linux_-_Booten_Bootloader_und_Init.pdf, LPI-Learning-Material-101-500-de.pdf]
verweise: [linux-101-101-2-booten, linux-101-101-3-runlevel, linux-101-102-2-bootloader, linux-101-102-1-partitionierung, linux-101-104-2-integritaet, linux-l1-05-prozesse]
---

## Profi

### Einordnung
**101.2** Das System starten (G3), **102.2** Bootmanager (G2), **101.3** Runlevel/Targets und Herunterfahren (G3) – Prüfung 101. Recovery und alternative Bootloader sind **LPIC-2 202.2/202.3** (Vertiefung).

### Die Boot-Kette
1. **Firmware (BIOS/UEFI)**: Hardwaretest **POST**, sucht ein Bootmedium laut Bootreihenfolge.
2. **Bootloader (GRUB 2)**: wählt den Kernel, lädt **Kernel + initramfs** und übergibt **Kernel-Parameter**.
3. **Kernel**: initialisiert Hardware, entpackt und mountet zuerst die **initramfs**.
4. **initramfs → echtes `/`**: lädt nötige Treiber (LVM, RAID, Verschlüsselung), wechselt aufs echte Root-Dateisystem (switch_root).
5. **init = PID 1 (systemd)**: startet das **default.target** mit allen Diensten.
Merksatz: **Firmware → Bootloader → Kernel → initramfs → init → Targets** – bei Problemen Stufe für Stufe prüfen.

### BIOS vs. UEFI
| | BIOS (Legacy) | UEFI |
|---|---|---|
| Bootcode | erste **440 Byte** des **MBR** (512 Byte inkl. Partitionstabelle) | **.efi-Dateien** in der **ESP** |
| Partitionsschema | MBR (max. **2 TiB**, 4 primäre) | **GPT** (> 2 TiB, 128 Partitionen) |
| Extras | – | **Secure Boot** (signierte Bootloader), Netboot, grafisches Setup |
- **ESP** (EFI System Partition): **FAT**-formatiert (meist FAT32), unter Linux gemountet unter **`/boot/efi`**. Secure Boot verlangt signierte Bootloader (Linux nutzt `shimx64.efi`), sonst bricht der Start ab.
- Troubleshooting: **MBR vs. GPT** und **UEFI vs. Legacy/CSM** unterscheiden – oft liegt es daran. Prüfen: `[ -d /sys/firmware/efi ] && echo UEFI`.

### Kernel-Parameter
Stehen an der **`linux`-Zeile** in GRUB, aktuell sichtbar in **`/proc/cmdline`**:
| Parameter | Wirkung |
|---|---|
| `root=/dev/sda2` bzw. `root=UUID=…` | Root-Dateisystem |
| `ro` / `rw` | Root zuerst read-only (für fsck) / read-write |
| `quiet splash` | weniger Meldungen, Startbild |
| `single`, `1`, `S` | Single-User (SysV) |
| `systemd.unit=rescue.target` / `emergency.target` | Rettungsziel (systemd) |
| `init=/bin/bash` | Shell statt init starten |
| `maxcpus=`, `mem=`, `acpi=off`, `nomodeset` | Hardware-Optionen |

### Kernel und initramfs
- In **`/boot`**: `vmlinuz-6.8.0-40-generic` (komprimierter Kernel), `initrd.img-…` (initramfs), `config-…`, `System.map-…`, `grub/`.
- **initramfs** = temporäres Root-Dateisystem im RAM (cpio-Archiv) mit genau den Treibern, die zum Mounten von `/` nötig sind. Erzeugen: **`update-initramfs -u`** (Debian/Ubuntu), **`dracut`** (RHEL), `mkinitcpio` (Arch). Fehlt die passende initramfs → Kernel findet sein Root nicht („kernel panic … unable to mount root fs“).

### GRUB 2 (102.2)
| | GRUB 2 | GRUB Legacy |
|---|---|---|
| Konfig | **`/boot/grub/grub.cfg`** (generiert; RHEL: `/boot/grub2/grub.cfg`) | `menu.lst` / `grub.conf` (direkt editiert) |
| Zählung | Platten ab **0**, Partitionen ab **1** → `(hd0,1)` = erste Partition | Partitionen ab **0** → `(hd0,0)` |
| Eigenschaften | modular, Module je Dateisystem, Skripte | eingefroren, nur noch anzutreffen |
- **grub.cfg nie von Hand editieren!** Einstellungen in **`/etc/default/grub`**: `GRUB_DEFAULT`, `GRUB_TIMEOUT`, `GRUB_CMDLINE_LINUX`, `GRUB_CMDLINE_LINUX_DEFAULT`, `GRUB_DISABLE_OS_PROBER`. Skripte in **`/etc/grub.d/`** (`10_linux`, `30_os_prober`, **`40_custom`** für eigene Einträge).
- Neu erzeugen: **`update-grub`** (Debian-Wrapper) = **`grub-mkconfig -o /boot/grub/grub.cfg`** (RHEL: `grub2-mkconfig -o /boot/grub2/grub.cfg`).
- Installieren: **`grub-install /dev/sda`** (BIOS: erste Stufe in den MBR der **Platte**, nicht der Partition) bzw. bei UEFI in die ESP (`grub-install --target=x86_64-efi --efi-directory=/boot/efi`). Bei **Software-RAID-1 auf beide Platten** installieren; zweiter Datenträger als Reserve-Bootweg.
- **Interaktiv** beim Start: ↑/↓ Eintrag (z. B. älteren Kernel) wählen, **`e`** Eintrag editieren, **Strg+X** (oder F10) editierten Eintrag booten, **`c`** GRUB-Shell. In der GRUB-Shell von Hand booten:
```text
grub> ls
grub> set root=(hd0,1)
grub> linux /vmlinuz root=/dev/sda2 ro
grub> initrd /initrd.img
grub> boot
```

### Init-Systeme
| | SysVinit | systemd |
|---|---|---|
| Start | **sequenziell**, Shell-Skripte | **parallel**, Units (`.service`, `.target`, `.mount`, `.socket`, `.timer`) |
| Konfiguration | `/etc/inittab`, `/etc/init.d/`, `/etc/rcN.d/` (S/K-Links) | `/etc/systemd/system/` (Admin), **`/usr/lib/systemd/system/`** (Pakete) |
**Upstart** = älteres ereignisbasiertes Init (früher Ubuntu) – nur „Awareness“.

### Runlevel und Targets (101.3)
| Runlevel | systemd-Target | Bedeutung |
|---|---|---|
| 0 | `poweroff.target` | herunterfahren |
| 1 / S | `rescue.target` | Single-User, nur root |
| 2, 3, 4 | `multi-user.target` | Mehrbenutzer + Netzwerk, Text |
| 5 | `graphical.target` | wie multi-user + grafische Oberfläche |
| 6 | `reboot.target` | Neustart |
| – | `default.target` | **Symlink** auf das Standardziel |
- **`systemctl get-default`**, **`systemctl set-default multi-user.target`** (dauerhaft), **`systemctl isolate multi-user.target`** (jetzt wechseln), `systemctl rescue`, `systemctl emergency`, `systemctl default`. Legacy: `telinit 3` / `init 3`, `runlevel` (vorheriger/aktueller Runlevel), Default früher in `/etc/inittab` (`id:3:initdefault:`), `init q` lädt inittab neu.
- **rescue.target** ≈ Single-User: minimale Umgebung, root-Login, lokale Dateisysteme gemountet. **emergency.target**: absolutes Minimum, nur Root-FS **read-only**, keine Dienste.

### Herunterfahren und Benutzer warnen
- **`shutdown -h now`** (halt/poweroff), **`shutdown -r now`** (reboot), `shutdown -r +10 "Text"`, `shutdown -h 22:00`, **`shutdown -c`** (abbrechen). systemd: `systemctl poweroff`, `systemctl reboot`, `systemctl halt`; `reboot`, `poweroff`, `halt` sind Kurzformen.
- shutdown warnt automatisch alle angemeldeten Benutzer; **`wall "Text"`** schickt jederzeit eine Broadcast-Nachricht. Ab 5 Minuten vor Abschaltung wird `/run/nologin` angelegt (keine neuen Logins). Beim Stoppen erhalten Prozesse **SIGTERM**, danach **SIGKILL**.
- **acpid** verarbeitet ACPI-Ereignisse (Power-Knopf → sauberes Herunterfahren) – „Awareness“; unter systemd übernimmt das oft `systemd-logind`.

### Boot-Logs
- **`dmesg`** = Kernel-Ringpuffer (`-H` lesbar, `-l err` nur Fehler, `-w` live). **`journalctl -b`** (aktueller Boot), **`-b -1`** (vorheriger Boot – nur mit persistentem Journal), **`-k`** (nur Kernel), **`-p err`** (ab Priorität err), `--list-boots`. Faustregel: Startet etwas nicht → `journalctl -b -p err`. Klassisch: `/var/log/boot.log`, `/var/log/messages`.

### Vertiefung LPIC-2 202.2 (Recovery)
- Rettungsziele über GRUB (`e`, linux-Zeile `systemd.unit=rescue.target`, Strg+X) oder `systemctl rescue`; bei SysV `single` bzw. `1` anhängen.
- **Root-Passwort zurücksetzen**: GRUB `e` → `ro` durch **`rw`** ersetzen und **`init=/bin/bash`** anhängen → Strg+X → ggf. `mount -o remount,rw /` → `passwd root` → `exec /sbin/init` bzw. `reboot -f`. (Bei SELinux-Systemen `touch /.autorelabel`.) Darum sind **physischer Zugang** und ein **GRUB-Passwort** sicherheitsrelevant.
- **fsck** nur auf **ungemounteten** oder read-only gemounteten Dateisystemen (`fsck -y /dev/sda2` beantwortet alles mit ja); misslingt der Boot-fsck → Root-Shell über `sulogin`.
- **chroot vom Live-Medium**: `mount /dev/sda2 /mnt`, `mount --bind /dev /mnt/dev`, `/proc`, `/sys`, (ESP nach `/mnt/boot/efi`), `chroot /mnt`, dann `grub-install /dev/sda && update-grub` bzw. `update-initramfs -u`.
### Vertiefung LPIC-2 202.3 (alternative Bootloader)
**SYSLINUX** (FAT, USB-Sticks), **ISOLINUX** (ISO9660/CD), **PXELINUX** – **PXE**: NIC fragt **DHCP** → IP + TFTP-Server + Bootdatei (`pxelinux.0`) → Kernel und initrd per **TFTP**; **systemd-boot** (schlanker UEFI-Bootmanager, Einträge in `/boot/loader/`); **U-Boot** (Embedded/ARM ohne BIOS/UEFI).

## Einfach

Einen Computer zu starten ist wie ein **Staffellauf**: Jeder Läufer gibt den Stab an den nächsten weiter.

1. **Firmware (BIOS/UEFI)** ist der **Hausmeister**, der morgens das Licht anmacht, kurz alles prüft (POST) und schaut, wo das Startprogramm liegt.
2. Der **Bootloader GRUB** ist der **Empfangschef** mit dem **Menü**: „Möchten Sie Linux oder den älteren Kernel?“ Dann holt er den **Kernel** und einen **Werkzeugkoffer (initramfs)**.
3. Der **Kernel** ist der **Chef**. Er weckt die Hardware auf. Damit er an die richtige Festplatte kommt, braucht er manchmal Spezialwerkzeug aus dem **Werkzeugkoffer** – z. B. wenn die Platte verschlüsselt ist.
4. Dann startet er den **ersten Mitarbeiter: systemd** (Nummer 1). Der schaltet alle anderen Dienste ein – gleichzeitig, damit es schnell geht.

**BIOS** ist der **alte Hausmeister**: Er schaut nur in die ersten paar Byte der Festplatte (MBR). **UEFI** ist der **moderne Hausmeister**: Er liest richtige Dateien aus einer kleinen **Startpartition (ESP)** und kann mit **Secure Boot** prüfen, ob der Empfangschef echt ist.

Die **GRUB-Einstellungen** schreibst du **nicht direkt** in die fertige Menükarte (`grub.cfg`), sondern in den **Notizzettel** `/etc/default/grub`. Danach lässt du mit `update-grub` die **Menükarte neu drucken**.

**Targets** sind **Betriebsarten** des Hauses:
- **graphical** = alles an, mit bunter Oberfläche (früher Runlevel 5),
- **multi-user** = alles an, aber nur Text (Runlevel 3),
- **rescue** = Notbetrieb, nur der Chef ist da (Runlevel 1),
- **poweroff** und **reboot** = Licht aus bzw. neu starten (0 und 6).

**Herunterfahren** macht man **höflich**: `shutdown -r +5 "Neustart wegen Update"` warnt alle 5 Minuten vorher. Mit `wall` kannst du allen eine **Durchsage** machen.

Wenn etwas beim Start schiefgeht, liest du das **Tagebuch** des Starts: `journalctl -b`. Und wenn du das root-Passwort vergessen hast, kannst du im GRUB-Menü einen **Hintereingang** (`init=/bin/bash`) benutzen – darum muss der Server **eingeschlossen** sein.

## Merksatz
- **Firmware → GRUB → Kernel → initramfs → systemd → Target**.
- **BIOS = MBR, UEFI = ESP + GPT**.
- **grub.cfg wird gedruckt, nicht geschrieben**: `/etc/default/grub` ändern → `update-grub`.
- **0 aus, 1 Rettung, 3 Text, 5 Grafik, 6 Neustart**.
- **set-default = dauerhaft, isolate = sofort**.
- **GRUB 2 zählt Partitionen ab 1, Legacy ab 0**.
- **fsck nie auf gemountete, beschreibbare Dateisysteme**.

## Prüfungsfalle
- **`/boot/grub/grub.cfg` nicht direkt editieren** – wird bei jedem Kernel-Update überschrieben.
- **`grub-install /dev/sda`** (Platte), nicht `/dev/sda1` (Partition), für BIOS/MBR.
- `systemctl isolate` wirkt **nur bis zum nächsten Boot**, `set-default` dauerhaft.
- Runlevel **2, 3 und 4** entsprechen alle `multi-user.target`.
- `journalctl -b -1` funktioniert nur mit **persistentem Journal** (`/var/log/journal` vorhanden).
- **`(hd0,1)`** ist in GRUB 2 die **erste** Partition der ersten Platte, in Legacy wäre es die zweite.
- Die ESP ist **FAT**, nicht ext4.
- `shutdown -h` = anhalten/ausschalten, `-r` = reboot, `-c` = abbrechen.
- Upstart ist **nicht** der heutige Standard (nur Awareness).

## Grafik

### Bootvorgang
1. Firmware: POST – Hardwaretest
2. Firmware -> GRUB: lädt Bootloader aus MBR bzw. ESP
3. GRUB -> Kernel: lädt vmlinuz mit Parametern (root=, ro, quiet)
4. GRUB -> initramfs: lädt Treiber-Archiv in den RAM
5. Kernel -> initramfs: mountet temporäres Root, lädt Module (LVM, RAID)
6. initramfs -> Root-FS: switch_root auf das echte /
7. Kernel -> systemd: startet PID 1
8. systemd -> default.target: startet Dienste parallel (graphical.target)

### GRUB-Konfiguration erzeugen
1. Admin -> /etc/default/grub: setzt GRUB_TIMEOUT=5
2. Admin -> update-grub: startet grub-mkconfig
3. update-grub -> /etc/grub.d: führt 10_linux, 30_os_prober, 40_custom aus
4. update-grub -> grub.cfg: schreibt /boot/grub/grub.cfg neu
5. GRUB: zeigt beim nächsten Start das neue Menü

### Root-Passwort-Reset
1. Admin -> GRUB: Taste e auf dem Boot-Eintrag
2. GRUB: ro durch rw ersetzen, init=/bin/bash anhängen
3. GRUB -> Kernel: Strg+X bootet
4. Kernel -> bash: Root-Shell ohne Login
5. Admin -> bash: passwd root
6. bash -> systemd: exec /sbin/init startet normal

## Lab
**Maschine**: debian01 (VM, Snapshot vorher anlegen!). Für die Recovery-Übung Konsole der VM (Hyper-V-/VirtualBox-Fenster) benutzen, nicht SSH.
```bash
# auf debian01 – Boot-Kette untersuchen
[ -d /sys/firmware/efi ] && echo "UEFI" || echo "BIOS/Legacy"
cat /proc/cmdline; ls -l /boot; uname -r
lsblk -f | grep -i -E "vfat|efi"; findmnt /boot/efi

# auf debian01 – GRUB anpassen
sudo cp /etc/default/grub /etc/default/grub.bak
sudo sed -i 's/^GRUB_TIMEOUT=.*/GRUB_TIMEOUT=10/' /etc/default/grub
sudo update-grub            # = grub-mkconfig -o /boot/grub/grub.cfg
grep -c menuentry /boot/grub/grub.cfg
sudo update-initramfs -u    # initramfs neu bauen

# auf debian01 – Targets
systemctl get-default
sudo systemctl set-default multi-user.target
sudo systemctl set-default graphical.target   # zurück (falls Desktop installiert)
ls -l /etc/systemd/system/default.target
systemctl list-units --type=target
runlevel

# auf debian01 – Benutzer warnen und planen
wall "Wartung in 10 Minuten"
sudo shutdown -r +10 "Kernel-Update"; sudo shutdown -c

# auf debian01 – Logs
sudo dmesg -H -l err,warn | tail; journalctl -b -p err; journalctl --list-boots
sudo mkdir -p /var/log/journal && sudo systemctl restart systemd-journald   # persistentes Journal

# auf rocky01 – Red-Hat-Variante
sudo grub2-mkconfig -o /boot/grub2/grub.cfg; sudo dracut -f
```
**Recovery auf debian01 (Konsole)**: Beim GRUB-Menü `e` drücken → in der Zeile `linux …` am Ende `systemd.unit=rescue.target` anhängen → Strg+X → als root anmelden → `systemctl default`. Passwort-Reset: statt dessen `ro` → `rw` und `init=/bin/bash` → `passwd root` → `exec /sbin/init`.

## Befehle
- `cat /proc/cmdline` – Kernel-Parameter des laufenden Systems
- `ls /boot` – Kernel, initramfs, GRUB-Dateien
- `update-grub` – grub.cfg neu erzeugen (Debian/Ubuntu)
- `grub-mkconfig -o /boot/grub/grub.cfg` – grub.cfg neu erzeugen
- `grub2-mkconfig -o /boot/grub2/grub.cfg` – dasselbe auf RHEL
- `grub-install /dev/sda` – GRUB in den MBR der Platte installieren
- `update-initramfs -u` – initramfs aktualisieren (Debian)
- `dracut -f` – initramfs neu bauen (RHEL)
- `systemctl get-default` – Standard-Target anzeigen
- `systemctl set-default multi-user.target` – Standard-Target dauerhaft setzen
- `systemctl isolate rescue.target` – sofort in ein Target wechseln
- `systemctl rescue` – Rettungsmodus
- `systemctl default` – zurück ins Standard-Target
- `telinit 3` – Runlevel wechseln (Legacy)
- `runlevel` – vorherigen und aktuellen Runlevel anzeigen
- `shutdown -h now` – sofort herunterfahren
- `shutdown -r +10 "Text"` – in 10 Minuten neu starten mit Nachricht
- `shutdown -c` – geplanten Shutdown abbrechen
- `systemctl poweroff` – herunterfahren per systemd
- `wall "Text"` – Nachricht an alle Terminals
- `dmesg -H -l err` – Kernel-Fehlermeldungen
- `journalctl -b -p err` – Fehler des aktuellen Boots
- `journalctl -b -1` – Logs des vorherigen Boots
- `journalctl --list-boots` – gespeicherte Boots auflisten
- `chroot /mnt` – in ein eingehängtes System wechseln (Recovery)

## Übungen
- A: Was lädt der Bootloader und übergibt ihm die Kontrolle? (BIOS, Kernel, Shell, FHS) | L: Den Kernel (samt initramfs).
- A: Welche Datei editiert man nicht direkt? (/etc/default/grub, /boot/grub/grub.cfg, /etc/grub.d/40_custom, /etc/fstab) | L: /boot/grub/grub.cfg – sie wird generiert; Änderungen in /etc/default/grub bzw. /etc/grub.d/, dann update-grub.
- A: Wo legt ein UEFI-System seine Bootloader ab? | L: In der ESP (FAT, meist /boot/efi); der MBR gehört zu BIOS/Legacy.
- A: Welcher Befehl erzeugt unter Debian/Ubuntu die neue grub.cfg? | L: update-grub (Wrapper um grub-mkconfig -o /boot/grub/grub.cfg).
- A: Welches Target entspricht Runlevel 5? | L: graphical.target
- A: Womit setzt man das Standard-Target dauerhaft? | L: systemctl set-default ziel; isolate wechselt nur für die laufende Sitzung.
- A: Welcher Kernel-Parameter startet eine Root-Shell zum Passwort-Reset? | L: init=/bin/bash (dazu ro durch rw ersetzen), dann passwd.
- A: Welches Werkzeug prüft/repariert ein ungemountetes Dateisystem? | L: fsck – nur auf ungemounteten oder read-only gemounteten Dateisystemen.
- A: Der Server soll in 15 Minuten neu starten, alle Benutzer sollen gewarnt werden. | L: shutdown -r +15 "Neustart wegen Wartung"
- A: Ein Dienst startet beim Booten nicht. Wie siehst du die Fehler des aktuellen Boots? | L: journalctl -b -p err (zusätzlich systemctl status dienst).

## Karteikarten
- F: Nenne die Stufen des Linux-Bootvorgangs. | A: Firmware (BIOS/UEFI, POST) → Bootloader (GRUB) → Kernel → initramfs → init/systemd (PID 1) → default.target.
- F: Wozu dient die initramfs? | A: Temporäres Root-Dateisystem im RAM mit den Treibern, die zum Einhängen des echten Root-Dateisystems nötig sind (LVM, RAID, Verschlüsselung).
- F: Was ist die ESP? | A: EFI System Partition – FAT-formatierte Partition mit den .efi-Bootloadern, meist unter /boot/efi gemountet.
- F: Wo ändert man GRUB-2-Einstellungen? | A: In /etc/default/grub und /etc/grub.d/, danach update-grub bzw. grub-mkconfig.
- F: Wie heißt die Konfigurationsdatei von GRUB Legacy? | A: menu.lst bzw. grub.conf (in /boot/grub/).
- F: Wie zählt GRUB 2 Platten und Partitionen? | A: Platten ab 0, Partitionen ab 1, z. B. (hd0,1) = erste Partition der ersten Platte.
- F: Welche Tasten nutzt man im GRUB-Menü? | A: e = Eintrag bearbeiten, Strg+X = booten, c = GRUB-Kommandozeile.
- F: Welche Targets entsprechen den Runleveln 0, 1, 3, 5 und 6? | A: poweroff, rescue, multi-user, graphical, reboot.
- F: Unterschied systemctl set-default und isolate? | A: set-default ändert das Standardziel dauerhaft (Symlink default.target), isolate wechselt sofort für die laufende Sitzung.
- F: Unterschied rescue.target und emergency.target? | A: rescue: Single-User mit gemounteten lokalen Dateisystemen; emergency: nur Root-FS read-only, keine Dienste.
- F: Wo liegen systemd-Units von Paketen und vom Admin? | A: Pakete: /usr/lib/systemd/system/; Admin/Überschreibungen: /etc/systemd/system/.
- F: Was macht wall? | A: Sendet eine Nachricht an die Terminals aller angemeldeten Benutzer.
- F: Was ist acpid? | A: Dienst, der ACPI-Ereignisse wie den Power-Knopf verarbeitet (z. B. sauberes Herunterfahren).
- F: Wie zeigt man die Logs des vorherigen Boots? | A: journalctl -b -1 (setzt persistentes Journal voraus).

## Quiz
? In welcher Reihenfolge läuft der Bootvorgang ab?
* Firmware → Bootloader → Kernel → initramfs → systemd
- Bootloader → Firmware → systemd → Kernel → initramfs
- Kernel → Firmware → Bootloader → systemd → initramfs
- Firmware → Kernel → Bootloader → initramfs → systemd

? Welche Datei darf man bei GRUB 2 nicht direkt bearbeiten?
* /boot/grub/grub.cfg
- /etc/default/grub
- /etc/grub.d/40_custom
- /etc/fstab

? Wo liegt bei UEFI der Bootloader?
* In der EFI System Partition (ESP)
- In den ersten 440 Byte des MBR
- In /etc/default/grub
- Im initramfs

? Welches Target entspricht Runlevel 3?
* multi-user.target
- graphical.target
- rescue.target
- reboot.target

? Wie setzt man das Standard-Target dauerhaft auf Textmodus?
* systemctl set-default multi-user.target
- systemctl isolate multi-user.target
- telinit 3
- systemctl default multi-user.target

? Welcher Befehl bricht einen geplanten shutdown ab?
* shutdown -c
- shutdown -k
- shutdown -a
- systemctl cancel

? Welcher Kernel-Parameter startet statt init eine Bash?
* init=/bin/bash
- single=/bin/bash
- systemd.unit=bash.target
- root=/bin/bash

? Welcher Befehl zeigt nur Fehler des aktuellen Boots im Journal?
* journalctl -b -p err
- journalctl -k -1
- dmesg -b
- journalctl --list-boots err

? Was bezeichnet `(hd0,1)` in GRUB 2?
* Die erste Partition der ersten Festplatte
- Die zweite Partition der ersten Festplatte
- Die erste Partition der zweiten Festplatte
- Die zweite Festplatte

? Mit welchem Werkzeug baut man unter RHEL die initramfs neu?
* dracut
- update-initramfs
- mkinitrd-deb
- grub2-install

? Welcher Befehl installiert GRUB auf einem BIOS-System korrekt?
* grub-install /dev/sda
- grub-install /dev/sda1
- grub-mkconfig /dev/sda
- update-grub /dev/sda

## Spickzettel
- Firmware (POST) → GRUB → Kernel + initramfs → systemd PID 1 → default.target
- BIOS: MBR 512 B, 2 TiB · UEFI: GPT + ESP (FAT, /boot/efi) + Secure Boot
- /etc/default/grub → update-grub (= grub-mkconfig -o /boot/grub/grub.cfg) · grub-install /dev/sda
- GRUB-Menü: e bearbeiten · Strg+X booten · c Shell · (hd0,1) = 1. Partition
- 0 poweroff · 1 rescue · 3 multi-user · 5 graphical · 6 reboot
- get-default · set-default (dauerhaft) · isolate (jetzt) · rescue · emergency
- shutdown -h now · -r +10 "Text" · -c · wall · acpid
- dmesg -H · journalctl -b / -b -1 / -k / -p err
- Reset: rw init=/bin/bash → passwd → exec /sbin/init · fsck nur ungemountet
