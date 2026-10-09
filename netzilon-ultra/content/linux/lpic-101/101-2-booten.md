---
id: linux-101-101-2-booten
bereich: Linux
fach: Linux I
pruefungen: [LPIC-1]
block: LPIC-101
kapitel: LPIC-1 Prüfung 101 – Systemarchitektur
titel: 101.2 Das System starten (Boot-Vorgang)
stufe: Fortgeschritten
quellen: [LPI-Learning-Material-101-500-de.pdf, 1.06_Linux_-_Booten_Bootloader_und_Init.pdf]
verweise: [linux-l1-06-booten, linux-101-101-3-runlevel, linux-101-102-2-bootloader]
---

## Profi

### Lernziel (Gewicht 3)
Bootsequenz beschreiben und Fehler anhand von Logs finden: BIOS/UEFI → Bootloader → Kernel → initramfs → init/systemd.

### Bootsequenz
1. **Firmware (BIOS/UEFI)**: POST, sucht Bootmedium. BIOS lädt den **MBR** (446 Byte Bootcode + 64 Byte Partitionstabelle + 2 Byte Signatur), UEFI startet eine `.efi`-Datei von der **ESP**.
2. **Bootloader** (GRUB 2): zeigt Menü, lädt **Kernel** (`/boot/vmlinuz-*`) und **initramfs** (`/boot/initrd.img-*`), übergibt **Kernelparameter**.
3. **Kernel** entpackt sich, initialisiert Hardware, bindet das **initramfs** (temporäres Root-Dateisystem mit Treibern, um das echte Root zu finden), mountet `/` und startet **PID 1**.
4. **init**: SysV-init (`/sbin/init`, Runlevel, `/etc/inittab`) oder **systemd** (`/lib/systemd/systemd`, Targets).
5. Dienste starten, Login erscheint.

### Kernelparameter (Auswahl)
`root=/dev/sda2`, `ro`, `quiet`, `splash`, `single`/`1`/`systemd.unit=rescue.target`, `init=/bin/bash` (Notfall), `nomodeset`, `console=ttyS0`.

### Logs und Diagnose
- **`dmesg`** (Kernel-Ringpuffer), **`journalctl -b`** (systemd), `/var/log/boot.log`, `/var/log/messages`. Fehlerklassiker: falsches `root=`, fehlendes initramfs, defekte fstab → Notfallmodus.
- Boot-Zeit: `systemd-analyze`, `systemd-analyze blame`.

## Einfach

Das Starten eines Computers ist wie ein **Staffellauf**. Jeder Läufer übergibt den Stab an den nächsten:

1. Der erste Läufer ist die **Firmware** (BIOS oder UEFI). Sie wacht auf, testet kurz, ob alles da ist (POST), und fragt: „Wo ist das Betriebssystem?“
2. Der zweite Läufer ist der **Bootloader** (GRUB). Er zeigt dir ein Menü („Linux starten? Oder Windows?“) und holt den Kernel aus dem Regal.
3. Der dritte Läufer ist der **Kernel**, das Herz des Systems. Weil er noch nicht weiß, wo die Festplatte steckt, packt er zuerst einen **kleinen Notfallkoffer** aus (das initramfs) mit den nötigen Treibern.
4. Der letzte Läufer ist **init** (heute systemd), der Prozess mit der Nummer 1. Er startet alle anderen Dienste: Netzwerk, Anmeldung, Webserver.

Wenn der Lauf irgendwo stolpert, siehst du nach, wer den Stab fallen ließ. Die Nachrichten des Kernels liest du mit `dmesg`, die des ganzen Starts mit `journalctl -b`. Dem Kernel kannst du beim Start sogar Zettel mitgeben (Kernelparameter), z. B. `quiet` für „bitte leise“ oder `single` für „nur der Admin, Wartungsmodus“.

## Merksatz
- **Firmware → Bootloader → Kernel (+initramfs) → init.**
- **MBR: 446 + 64 + 2 Byte.**
- **PID 1 = init/systemd.**
- **dmesg = Kernel, journalctl -b = ganzer Boot.**
- **UEFI → ESP und .efi-Dateien.**

## Prüfungsfalle
- Der MBR ist 512 Byte: **446** Bootcode, **64** Partitionstabelle (4 × 16), **2** Signatur.
- initramfs ist **keine** Partition, sondern ein ins RAM entpacktes Archiv.
- Kernel und initramfs liegen in `/boot`, Kernel heißt `vmlinuz`.
- `init=/bin/bash` startet **direkt** eine Shell statt init (Notfall/Passwort zurücksetzen).
- `dmesg` ist nur der Kernelpuffer, Dienstmeldungen stehen im Journal.

## Grafik

### Bootvorgang
1. Firmware: POST, sucht Bootmedium
2. Firmware -> Bootloader: lädt GRUB von MBR bzw. ESP
3. Bootloader -> Kernel: lädt vmlinuz und initramfs mit Parametern
4. Kernel: bindet initramfs, mountet Root-Dateisystem
5. Kernel -> systemd: startet PID 1
6. systemd -> Dienste: Zieleinheit default.target erreicht

## Lab
**Maschine**: debian01.
```bash
# auf debian01
ls -l /boot
cat /proc/cmdline
dmesg | head -30
journalctl -b | head -30
systemd-analyze; systemd-analyze blame | head
sudo dd if=/dev/sda bs=512 count=1 2>/dev/null | xxd | tail -3   # MBR-Signatur 55 aa
```

## Befehle
- `dmesg` – Kernelmeldungen
- `journalctl -b` – Meldungen des aktuellen Boots
- `cat /proc/cmdline` – Kernelparameter dieses Starts
- `systemd-analyze blame` – Dauer je Dienst
- `ls /boot` – Kernel, initramfs, GRUB

## Übungen
- A: Aus welchen Teilen besteht der MBR? | L: 446 Byte Bootcode, 64 Byte Partitionstabelle, 2 Byte Signatur.
- A: Wie siehst du die Kernelparameter des aktuellen Starts? | L: cat /proc/cmdline
- A: Welcher Prozess hat PID 1? | L: init bzw. systemd.
- A: Wozu dient das initramfs? | L: Temporäres Root-Dateisystem mit Treibern, um das echte Root zu mounten.
- A: Wo findest du Bootmeldungen bei systemd? | L: journalctl -b

## Karteikarten
- F: Wie heißt der Standard-Bootloader unter Linux? | A: GRUB 2.
- F: Wo liegt der Kernel? | A: /boot/vmlinuz-<Version>
- F: Was ist POST? | A: Power-On Self Test der Firmware.
- F: Was ist die ESP? | A: EFI System Partition, enthält .efi-Bootloader (FAT).
- F: Was ist initramfs? | A: Ins RAM geladenes Mini-Root mit Treibern für den frühen Boot.
- F: Was bedeutet Kernelparameter quiet? | A: Weniger Bootmeldungen.
- F: Wie startet man ins Rettungsziel? | A: systemd.unit=rescue.target (oder single/1) als Kernelparameter.
- F: Was zeigt systemd-analyze blame? | A: Startdauer der einzelnen Einheiten.
- F: Welche Größe hat der MBR? | A: 512 Byte.

## Quiz
? Welche Größe hat der Bootcode im MBR?
* 446 Byte
- 512 Byte
- 64 Byte
- 2 Byte

? Welcher Prozess trägt PID 1?
* init/systemd
- kthreadd
- bash
- grub

? Wo liegen Kernel und initramfs?
* /boot
- /usr/boot
- /var/boot
- /etc/boot

? Welcher Befehl zeigt die Kernelparameter des aktuellen Boots?
* cat /proc/cmdline
- uname -a
- lsmod
- grub-mkconfig

? Wozu dient das initramfs?
* Treiber und Skripte, um das Root-Dateisystem einzubinden
- Als Swap-Bereich
- Als Benutzerverzeichnis
- Als zweiter Bootloader

? Wie gelangt man mit Parametern ins Rettungssystem?
* systemd.unit=rescue.target
- init=/bin/rescue
- quiet single
- root=rescue

? Welches Programm zeigt Bootmeldungen des Kernels?
* dmesg
- lsboot
- bootlog
- vmstat

? Was lädt UEFI statt des MBR-Codes?
* Eine .efi-Datei von der ESP
- Den Kernel direkt von sda
- Das initramfs
- Eine LILO-Konfiguration

## Spickzettel
- Firmware → GRUB → Kernel+initramfs → PID 1
- MBR 446+64+2 · UEFI: ESP, .efi
- /boot/vmlinuz · initrd.img
- dmesg · journalctl -b · /proc/cmdline
- rescue.target · init=/bin/bash
