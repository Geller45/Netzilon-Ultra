---
id: linux-eckert-k08-init-x11-lokalisierung
bereich: Linux
fach: Linux I
pruefungen: [LPIC-1, Schule]
block: CompTIA Linux+ / LPIC-1 (Eckert)
kapitel: Eckert – CompTIA Linux+ and LPIC-1 (6th Edition)
titel: Kap. 8 Systeminitialisierung, X Window und Lokalisierung
stufe: Fortgeschritten
quellen: [Eckert_J._W._and_triOS_College_-_CompTIA_Linux_and_LPIC-1_6th_Edition_-_2024.pdf]
verweise: [linux-101-101-2-booten,linux-101-102-2-bootloader,linux-101-101-3-runlevel,linux-102-106-1-x11,linux-102-107-3-lokalisierung]
---

## Profi

### Bootprozess
Firmware (**BIOS** oder **UEFI**) → Bootloader (**GRUB Legacy**, **GRUB2**, Alternativen LILO, SYSLINUX, systemd-boot) → Kernel (+ **initramfs**) → Init-System (PID 1). GRUB2: Konfiguration `/etc/default/grub` + `/etc/grub.d/`, erzeugen mit `grub-mkconfig -o /boot/grub/grub.cfg` (RHEL: `grub2-mkconfig`), Installation `grub-install /dev/sda`. Kernelparameter (z. B. `single`, `systemd.unit=rescue.target`) beim Booten editierbar. Kernel-Image `/boot/vmlinuz-*`, `/boot/initrd.img-*`.

### Init-Systeme
- **UNIX SysV**: sieben **Runlevel** (0 Halt, 1 Single-User, 2–5 Multi-User/Netz/GUI je nach Distro, 3 textbasiert Multi-User, 5 grafisch, 6 Reboot), `/etc/inittab`, `/etc/init.d/` Skripte, `/etc/rc?.d/` Links (S = Start, K = Kill), `service`, `chkconfig`, `update-rc.d`, `init N`, `runlevel`, `telinit`.
- **systemd**: **Unit-Dateien** (`service`, `socket`, `target`, `timer`, `mount`) in `/lib/systemd/system` (Pakete) und `/etc/systemd/system` (Admin; Vorrang), **Targets** (`poweroff`, `rescue`, `multi-user`, `graphical`, `reboot`; Entsprechung SysV 0, 1, 3, 5, 6). `systemctl start|stop|restart|reload|status|enable|disable|mask|is-active|list-units`, `systemctl get-default`, `set-default`, `isolate`, `daemon-reload`. Logs `journalctl`.
- **Herunterfahren**: `shutdown -h now`, `poweroff`, `reboot`, `halt`.

### Grafische Oberfläche
Komponenten: **X-Server** (**X.org** oder **Wayland**), **X-Clients**, **Windowmanager** (z. B. Mutter, KWin, Openbox, i3), optional **Desktopumgebung** (GNOME, KDE Plasma, Xfce, Cinnamon, MATE), **Display-Manager** (GDM, SDDM, LightDM). Start aus Runlevel 3 mit `startx`. Konfiguration `/etc/X11/xorg.conf` (meist automatisch), `xrandr`, `DISPLAY`-Variable, X11-Weiterleitung `ssh -X`. **Barrierefreiheit** (Assistive Technologien: Bildschirmleser Orca, Bildschirmlupe, Tastaturhilfen).

### Lokalisierung
Zeichenkodierung (ASCII, ISO-8859, **UTF-8**), `locale`, `LANG`, `LC_*`, `localectl`, `iconv`; Zeitzone `timedatectl`, `/etc/localtime`, `tzselect`; Tastatur `localectl set-keymap`, `loadkeys`, `setxkbmap`; Systemzeit `date`, `hwclock`, `chronyd`/`ntpd`.

## Einfach

Wenn du den Computer anschaltest, passiert eine **Staffelübergabe**: Zuerst startet die **Firmware** (BIOS/UEFI) und prüft die Hardware. Sie übergibt an den **Bootloader** (meist **GRUB**), der dir ein Auswahlmenü zeigt und den **Kernel** lädt. Der Kernel übernimmt die Hardware und startet den allerersten Prozess (PID 1): das **Init-System**. Dieses startet nacheinander alle Dienste, bis der Rechner einsatzbereit ist.

Früher hieß das Init-System **SysV** und kannte **Runlevel** (Betriebsstufen von 0 = aus bis 6 = Neustart). Heute nutzen fast alle **systemd**. Dort heißen die Stufen **Targets**, und jeder Dienst hat eine **Unit-Datei**. Mit `systemctl start nginx` startest du einen Dienst, mit `systemctl enable nginx` startet er bei jedem Hochfahren automatisch. `systemctl status nginx` verrät, ob er läuft.

Die **grafische Oberfläche** setzt sich aus Bauteilen zusammen, wie ein Lego-Set: ein **Anzeigeserver** (X.org oder Wayland), ein **Fenstermanager** (zeichnet Fensterrahmen) und optional eine **Desktopumgebung** (GNOME, KDE) mit Menüs und Programmen. Du kannst sie von der Textkonsole mit `startx` starten.

**Lokalisierung** heißt: Sprache, Tastatur, Zeitzone und Zeichensatz einstellen. Heute ist **UTF-8** die Regel, damit auch Umlaute und Sonderzeichen funktionieren. Mit `localectl` und `timedatectl` stellst du das ein.

## Merksatz
- **Firmware → Bootloader → Kernel → init (PID 1).**
- **systemctl enable = Autostart, start = jetzt.**
- **graphical.target ≙ Runlevel 5, multi-user ≙ 3.**
- **X-Server + Windowmanager + Desktop.**

## Prüfungsfalle
- `enable` startet den Dienst **nicht** sofort; `start` aktiviert ihn nicht für den Boot.
- Eigene Unit-Dateien gehören nach `/etc/systemd/system`, nicht nach `/lib`.
- Nach Änderung von Unit-Dateien: `systemctl daemon-reload`.
- Runlevel 6 = Neustart, 0 = Halt (nicht vertauschen).
- GRUB-Konfiguration nicht direkt in grub.cfg ändern, sondern in /etc/default/grub.

## Grafik

### Bootvorgang
1. BIOS/UEFI -> GRUB: Hardware-Selbsttest, Bootloader laden
2. GRUB -> Kernel: Kernel und initramfs laden
3. Kernel -> systemd: PID 1 starten
4. systemd -> Dienste: Units des Targets starten
5. systemd -> Login: graphical.target oder multi-user.target erreicht

## Lab
**Maschine**: debian01 (systemd).
```bash
systemctl get-default
sudo systemctl set-default multi-user.target
systemctl status ssh
sudo systemctl enable --now ssh
sudo systemctl isolate rescue.target     # Vorsicht: Single-User
localectl status
timedatectl set-timezone Europe/Berlin
```

## Befehle
- `systemctl enable --now dienst` – Autostart + sofort
- `systemctl get-default` – Standard-Target
- `systemctl isolate multi-user.target` – Target wechseln
- `grub-mkconfig -o /boot/grub/grub.cfg` – GRUB-Konfig
- `localectl` – Sprache/Tastatur
- `timedatectl` – Zeit/Zeitzone
- `startx` – GUI starten

## Übungen
- A: Welches Target entspricht Runlevel 3? | L: multi-user.target
- A: Wie stellst du ein, dass das System ohne GUI bootet? | L: `systemctl set-default multi-user.target`
- A: Wo liegen eigene Unit-Dateien? | L: /etc/systemd/system

## Karteikarten
- F: Welche PID hat das Init-System? | A: 1
- F: Welcher Runlevel ist Reboot? | A: 6
- F: Welcher Runlevel ist Halt? | A: 0
- F: Welches Target ist grafisch? | A: graphical.target (≙ Runlevel 5).
- F: Was erzeugt grub.cfg? | A: grub-mkconfig / grub2-mkconfig.
- F: Was sind X.org und Wayland? | A: Anzeigeserver (Display Server) des Linux-GUI.
- F: Wofür ist ein Windowmanager? | A: Fensterrahmen, Platzierung, Bedienung.
- F: Welche Kodierung ist heute Standard? | A: UTF-8
- F: Was zeigt journalctl? | A: Logs des systemd-Journals.
- F: Was macht systemctl mask? | A: Verhindert jegliches Starten der Unit.

## Quiz
? Welcher Runlevel entspricht Neustart?
* 6
- 0
- 1
- 5

? Welcher Befehl aktiviert einen Dienst für den Systemstart?
* systemctl enable
- systemctl start
- systemctl reload
- systemctl isolate

? Welches Target ist das textbasierte Mehrbenutzer-Target?
* multi-user.target
- graphical.target
- rescue.target
- reboot.target

? Wo liegen vom Admin angelegte Unit-Dateien?
* /etc/systemd/system
- /lib/systemd/system
- /usr/local/systemd
- /var/systemd

? Was ist Wayland?
* Ein Anzeigeserver-Protokoll
- Ein Bootloader
- Ein Dateisystem
- Ein Init-System

? Welche Datei bearbeitet man für GRUB2-Einstellungen?
* /etc/default/grub
- /boot/grub/grub.cfg
- /etc/grub.conf only
- /boot/vmlinuz

? Welcher Befehl lädt Unit-Dateien neu ein?
* systemctl daemon-reload
- systemctl reload-all
- systemctl restart units
- init q

? Welches ist die empfohlene Zeichenkodierung?
* UTF-8
- ASCII
- ISO-8859-1
- EBCDIC

## Lücken
- Das Init-System hat die PID {1}.
- {systemctl enable} aktiviert den Dienst beim Boot.
- Der X-Server und {Wayland} sind Display-Server.

## Spickzettel
- BIOS/UEFI → GRUB → Kernel → init
- Runlevel 0 1 3 5 6 ↔ Targets
- systemctl start/stop/enable/status/isolate
- X.org/Wayland + WM + DE · startx
- UTF-8 · localectl · timedatectl
