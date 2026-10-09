---
id: linux-l2-11-desktops
bereich: Linux
fach: Linux II
pruefungen: [LPIC-1, Schule]
block: L2
kapitel: Linux II – Administration
titel: 1.11 Benutzeroberflächen – X11, Wayland, Desktops, Remote, Barrierefreiheit
stufe: Einsteiger
quellen: [1.11_Linux_-_Benutzeroberflaechen_und_Desktops.pdf, LPI-Learning-Material-102-500-de.pdf]
verweise: [linux-102-106-1-x11, linux-102-106-2-desktops, linux-102-106-3-barrierefreiheit, linux-l2-19-ssh, linux-l1-06-booten]
---

## Profi

### Einordnung
**106.1** X11 (G2), **106.2** Desktops (G1), **106.3** Barrierefreiheit (G1) – Prüfung 102, viel **Konzept- und Awareness-Wissen**. Remote-X über SSH (`ssh -X`) → SSH-Kapitel 1.19 (110.3). Das Skript ist eine Ticket-Woche (schwarzer Bildschirm, Chef-Fernzugriff, barrierefreier Arbeitsplatz).

### Fehlerbild Ticket #4751
Nach dem Upgrade auf Ubuntu 24.04: Login klappt, Desktop bleibt schwarz. Auf der Textkonsole (**Strg+Alt+F3**): `tail ~/.xsession-errors` → „gnome-session: Failed to start compositor: GPU driver error“, `echo $XDG_SESSION_TYPE` → wayland. Sofort-Workaround: am Login-Screen (Zahnrad) **„GNOME auf Xorg“** wählen, danach den Treiber sauber nachziehen.

### X11-Architektur (106.1)
- **Client-Server-System, „umgekehrt“**: Der **X-Server** läuft dort, **wo Bildschirm, Tastatur und Maus sind**; die **X-Clients** sind die Anwendungen (Browser, Terminal). Merksatz: **„Der Server steht dort, wo du sitzt.“**
- **`DISPLAY`** sagt einer Anwendung, an welchen X-Server sie zeichnet: `:0` = lokaler X-Server, Display 0; `host:0` = X-Server auf „host“; Format `[host]:display[.screen]`. X11 ist **netzwerktransparent** – Clients dürfen auf anderen Rechnern laufen (Port 6000 + Display-Nr.).
- **Xorg** (X.Org-Server) erkennt Hardware meist **automatisch** – eine `/etc/X11/xorg.conf` ist selten nötig. Anpassungen als **Schnipsel** in **`/etc/X11/xorg.conf.d/*.conf`**, z. B. Tastaturlayout:
```text
Section "InputClass"
    Identifier "keyboard"
    MatchIsKeyboard "on"
    Option "XkbLayout" "de"
EndSection
```
Abschnitte in xorg.conf: `InputDevice`, `InputClass`, `Monitor`, `Device` (Grafikkarte), `Screen`, `ServerLayout`, `Module`. Zur Laufzeit: `setxkbmap de`, unter systemd `localectl set-x11-keymap de`.
- **Fehlersuche**: **`~/.xsession-errors`** (Sitzung) und Xorg-Log (`/var/log/Xorg.0.log` bzw. `~/.local/share/xorg/Xorg.0.log`, unter systemd auch `journalctl`).

### Display-Manager, Window-Manager, Desktop-Umgebung
| Ebene | Aufgabe | Beispiele |
|---|---|---|
| **Display Manager (DM)** | **grafischer Login**, startet die Sitzung | **gdm** (GNOME), **sddm** (KDE), **lightdm**, xdm |
| **Window Manager (WM)** | verwaltet Fenster (Rahmen, Anordnung, Fokus) | Mutter, KWin, Xfwm, i3, Openbox |
| **Desktop Environment (DE)** | Gesamtpaket aus WM + Panels + Dateimanager + Apps + Einstellungen | GNOME, KDE Plasma, Xfce, MATE, Cinnamon, LXQt |
Reihenfolge: **DM → Sitzung → WM → DE**. Minimal geht auch nur ein WM ohne DE (z. B. i3). Der DM läuft als systemd-Dienst (`systemctl status gdm`), erreichbar über `graphical.target`.

### X-Zugriff: xhost und xauth
- **`xhost`** – **rechnerbasiert, grob**: `xhost +localhost`, `xhost -host`; **`xhost +`** erlaubt **allen** Zugriff – **niemals**!
- **`xauth`** – **Cookie-basiert, fein und sicher** (**MIT-MAGIC-COOKIE-1**, gespeichert in `~/.Xauthority`): `xauth list`, `xauth add`, `xauth extract/merge`.
- Sicherster Weg für entfernte X-Programme: **`ssh -X`** (X11-Forwarding, verschlüsselt, setzt DISPLAY und Cookie automatisch).

### Wayland (Awareness)
**Wayland** löst X11 zunehmend ab (Standard bei GNOME, Fedora, Ubuntu). Ein **Compositor** vereint Display-Server und Window-Manager (Mutter, KWin, Weston, Sway). Vorteile: einfacher, flüssiger, **sicherer** (Anwendungen können sich nicht gegenseitig ausspähen oder Tastatureingaben mitlesen). **Xwayland** lässt alte X11-Programme weiterlaufen. Prüfen: `echo $XDG_SESSION_TYPE` (`wayland`/`x11`), `loginctl show-session $XDG_SESSION_ID -p Type`. Noch hakelig: manches Screen-Sharing, Fernwartung, proprietäre Treiber → testweise X11-Sitzung.

### Desktops und Remote-Protokolle (106.2)
- **GNOME** (modern, aufgeräumt, Standard vieler Distros), **KDE Plasma** (funktionsreich, stark anpassbar, Qt), **Xfce** (leichtgewichtig, klassisch – **gut für ältere Hardware**, Ticket: Empfangs-PC), MATE, Cinnamon, LXQt.
| Protokoll | Eigenschaft |
|---|---|
| **XDMCP** | grafischer Login übers Netz direkt am X-Server (alt, **unverschlüsselt**, UDP 177) |
| **VNC** | plattformübergreifend, überträgt **Pixel** (Protokoll **RFB**, Port **5900**+n), einfaches VNC unverschlüsselt |
| **RDP** | Microsoft-Protokoll (Port **3389**); Linux-Server: **xrdp**, Windows-Client: `mstsc` |
| **Spice** | für **virtuelle Maschinen** (KVM/QEMU), mit Audio/USB-Weiterleitung |
Ticket #4754: Chef mit Windows-Laptop → `apt install xrdp`, `systemctl enable --now xrdp`, Verbindung per mstsc. **XDMCP/VNC immer durch SSH-Tunnel oder VPN** – nie offen ins Internet. Praxis: TigerVNC/RealVNC, NoMachine, AnyDesk.

### Barrierefreiheit (106.3)
- **Tastatur-/Maus-Hilfen (AccessX)**: **Sticky Keys** (Tastenkombinationen **nacheinander** statt gleichzeitig – Modifikatoren „kleben“), **Slow Keys** (Taste muss länger gehalten werden), **Bounce Keys** (ignoriert versehentliche **Mehrfachanschläge**), **Toggle Keys** (Ton bei Feststell-/Num-Taste), **Mouse Keys** (Mauszeiger über den **Ziffernblock**), Wiederholungstasten (Repeat Keys), Gesten, Spracherkennung.
- **Visuelle Hilfen**: **High-Contrast-Themes**, **Large Print** (große Schrift/Symbole), **Bildschirmlupe** (Magnifier), großer/farbiger Mauszeiger.
- **Hörbar/taktil**: **Orca** (Standard-Screenreader von GNOME mit Sprache und **Braille**; GNOME: Super+Alt+S), **emacspeak** (Sprachausgabe für Emacs), **Braillezeile** (taktile Ausgabe; Treiber `brltty`), **Bildschirmtastatur** (On-Screen-Keyboard, z. B. GOK, Onboard).
- Eingestellt in jedem Desktop unter **Einstellungen → Barrierefreiheit** (Accessibility). Prüfung: Begriffe **zuordnen** können.

## Einfach

Wenn du am Linux-Computer **Fenster, Maus und bunte Symbole** siehst, arbeiten mehrere Helfer zusammen – wie in einem **Theater**:
- Der **Display Manager** ist der **Kassierer am Eingang**: Er fragt nach Name und Passwort (grafischer Login) und lässt dich rein.
- Der **Window Manager** ist der **Bühnenarbeiter**: Er stellt die Fenster auf, malt Rahmen drum und schiebt sie hin und her.
- Die **Desktop-Umgebung** ist das **ganze Bühnenbild** mit Kulissen, Vorhang, Programmheft (Panel, Dateimanager, Einstellungen) – z. B. GNOME, KDE oder das schlanke **Xfce** für alte Computer.

Das **X-Window-System (X11)** ist der **Bildschirm-Dienst**. Komisch, aber wahr: Der **X-Server** ist **dein Bildschirm mit Tastatur** – also dort, **wo du sitzt**. Die Programme sind die **Kunden**, die beim Server anfragen: „Bitte mal mir ein Fenster.“ Darum kann ein Programm sogar auf einem **anderen Computer** laufen und trotzdem **bei dir** sein Fenster malen. Die Variable **`DISPLAY`** ist die **Adresse des Bildschirms**, an den das Programm malen soll.

Wer darf auf deinen Bildschirm malen? **`xhost`** ist wie ein Türsteher, der **ganze Häuser** reinlässt („alle aus der Straße X“) – grob. **`xauth`** ist wie eine **persönliche Eintrittskarte** (Cookie) – viel sicherer. **`xhost +`** heißt „**alle** dürfen rein“ – niemals machen!

**Wayland** ist der **moderne Nachfolger**: einfacher und sicherer, weil Programme nicht mehr heimlich in andere Fenster schauen können.

**Fernzugriff**: Mit **RDP** (über xrdp) kommt der Chef von Windows aus auf den Linux-PC, mit **VNC** geht es von überall, mit **Spice** auf virtuelle Maschinen. Aber diese Leitungen sind manchmal **nicht verschlüsselt** – darum durch einen **sicheren Tunnel** (SSH oder VPN) schicken.

**Barrierefreiheit** heißt: Der Computer passt sich an den Menschen an. **Sticky Keys**: Wer nur eine Hand benutzen kann, drückt Strg und dann C **nacheinander**. **Bounce Keys**: Wer zittert, tippt nicht aus Versehen „hhhallo“. **Mouse Keys**: Maus mit dem Ziffernblock steuern. **Orca** liest den Bildschirm **vor** oder gibt ihn auf einer **Braillezeile** (Blindenschrift zum Fühlen) aus. **Lupe** und **hoher Kontrast** helfen, wenn man schlecht sieht.

## Merksatz
- **Der X-Server steht dort, wo du sitzt**.
- **DM = Login, WM = Fenster, DE = Gesamtpaket**.
- **xhost = Haus-Erlaubnis (grob), xauth = Eintrittskarte (Cookie, fein)**.
- **xhost + = niemals**.
- **Sticky = nacheinander, Slow = lange halten, Bounce = Prellen weg, Mouse = Ziffernblock**.
- **RDP = Windows (xrdp), VNC = Pixel überall, Spice = VMs, XDMCP = alter Netz-Login**.
- **~/.xsession-errors** ist der Zeuge, wenn die Sitzung stirbt.

## Prüfungsfalle
- Der **X-Server** läuft beim **Benutzer** (Bildschirm), nicht auf dem Rechner, auf dem das Programm läuft.
- **xorg.conf** ist heute meist **nicht nötig** – Anpassungen in `/etc/X11/xorg.conf.d/`.
- **gdm/sddm/lightdm** sind **Display Manager**, nicht Window Manager.
- **Sticky Keys** (nacheinander) vs. **Slow Keys** (lange halten) vs. **Bounce Keys** (Wiederholungen ignorieren) – häufig vertauscht.
- **XDMCP** und einfaches **VNC** sind **unverschlüsselt**.
- **Orca** ist ein Screenreader, **brltty** ein Braille-Treiber, **emacspeak** Sprachausgabe für Emacs.
- Wayland ist für die Prüfung nur **Awareness**.

## Grafik

### X11 über das Netz
1. Benutzer: sitzt an PC1 mit Bildschirm und Tastatur – hier läuft der X-Server
2. PC1 -> Server2: ssh -X server2
3. Server2: startet xclock, DISPLAY=localhost:10.0
4. Server2 -> PC1: Zeichenbefehle durch den SSH-Tunnel
5. PC1: X-Server zeichnet das Fenster von xclock
6. Benutzer -> PC1: Tastatur und Maus gehen zurück an den Client

### Von Login bis Desktop
1. systemd: startet graphical.target
2. systemd -> gdm: Display Manager zeigt den Login
3. Benutzer -> gdm: meldet sich an, wählt GNOME auf Xorg oder Wayland
4. gdm -> Sitzung: startet gnome-session
5. Sitzung -> WM: Mutter rahmt die Fenster
6. WM -> DE: Panels, Dateimanager und Apps erscheinen

### Fehlersuche schwarzer Bildschirm
1. Benutzer: Login klappt, Bildschirm bleibt schwarz
2. Admin -> Konsole: Strg+Alt+F3, Textanmeldung
3. Admin -> ~/.xsession-errors: Failed to start compositor: GPU driver error
4. Admin: echo $XDG_SESSION_TYPE zeigt wayland
5. Admin -> gdm: Zahnrad – GNOME auf Xorg
6. Benutzer: Desktop erscheint, Treiber wird nachgezogen

## Lab
**Maschine**: debian01 mit Desktop (z. B. Ubuntu 24.04 Desktop oder Debian mit GNOME), Anmeldung lokal bzw. in der VM-Konsole; zweiter Rechner für Remote-Tests (Windows-Client mit mstsc).
```bash
# auf debian01 – welche Sitzung, welcher DM?
echo $DISPLAY; echo $XDG_SESSION_TYPE; loginctl show-session $XDG_SESSION_ID -p Type
systemctl status display-manager --no-pager | head -3
cat /etc/X11/default-display-manager 2>/dev/null

# auf debian01 – Xorg-Konfiguration und Logs
ls /etc/X11/xorg.conf.d/ /usr/share/X11/xorg.conf.d/ 2>/dev/null
localectl status; sudo localectl set-x11-keymap de
tail -n 20 ~/.xsession-errors 2>/dev/null; journalctl -b -u gdm --no-pager | tail

# auf debian01 – X-Zugriff (in einer X11-Sitzung)
xauth list; xhost
xhost +local: ; xhost -local:

# auf debian01 – leichter Desktop und RDP-Zugang
sudo apt install -y xfce4 xrdp
sudo systemctl enable --now xrdp; ss -tlnp | grep 3389
# auf dem Windows-Client: mstsc → IP von debian01 → Sitzung Xorg

# auf debian01 – Barrierefreiheit (GNOME)
gsettings set org.gnome.desktop.a11y.keyboard stickykeys-enable true
gsettings set org.gnome.desktop.interface text-scaling-factor 1.5
gsettings set org.gnome.desktop.a11y.applications screen-reader-enabled true   # Orca
gsettings set org.gnome.desktop.a11y.keyboard stickykeys-enable false
```

## Befehle
- `echo $DISPLAY` – Ziel-X-Server der Anwendung (z. B. :0)
- `echo $XDG_SESSION_TYPE` – Sitzungstyp wayland oder x11
- `systemctl status display-manager` – aktiver Display Manager
- `tail ~/.xsession-errors` – Fehler der grafischen Sitzung
- `localectl set-x11-keymap de` – X11-Tastaturlayout dauerhaft setzen
- `setxkbmap de` – Tastaturlayout der laufenden X-Sitzung
- `xhost +host` – X-Zugriff für einen Rechner erlauben
- `xhost -host` – X-Zugriff für einen Rechner entziehen
- `xauth list` – vorhandene X-Cookies anzeigen
- `ssh -X benutzer@host` – X11-Forwarding über SSH
- `systemctl enable --now xrdp` – RDP-Server starten
- `gsettings set org.gnome.desktop.a11y.keyboard stickykeys-enable true` – Sticky Keys in GNOME aktivieren
- `orca` – Screenreader starten

## Übungen
- A: Wo läuft der X-Server? (auf dem entfernten Rechner / dort, wo Tastatur und Bildschirm sind / DISPLAY=:0) | L: Dort, wo Bildschirm und Tastatur sind; die Anwendungen sind die X-Clients.
- A: Welcher X-Zugriffsweg ist der feinere, sichere? (xhost + / xauth) | L: xauth mit MIT-MAGIC-COOKIE; xhost + öffnet rechnerweit und ist tabu.
- A: In welcher Datei landen Fehlermeldungen einer gescheiterten grafischen Sitzung? | L: ~/.xsession-errors (plus Xorg-Log).
- A: Was ist ein Display Manager? | L: Der grafische Login (gdm, sddm, lightdm), der die Sitzung startet.
- A: Welche Funktion erlaubt Tastenkombinationen nacheinander statt gleichzeitig? (Slow, Bounce, Sticky, Mouse Keys) | L: Sticky Keys
- A: Welches Microsoft-Protokoll nutzt man (per xrdp) für Remote-Desktop unter Linux? | L: RDP (Remote Desktop Protocol).
- A: Ein alter Empfangs-PC ist mit GNOME zu langsam. Empfehlung? | L: Eine leichtgewichtige Desktop-Umgebung wie Xfce (apt install xfce4, am Login Sitzung Xfce wählen).
- A: Das Tastaturlayout unter Xorg soll dauerhaft deutsch sein. | L: Schnipsel in /etc/X11/xorg.conf.d/00-keyboard.conf mit Option "XkbLayout" "de" oder localectl set-x11-keymap de.

## Zuordnen

### Barrierefreiheits-Funktionen
- Sticky Keys => Tastenkombinationen nacheinander drücken
- Slow Keys => Taste muss länger gehalten werden
- Bounce Keys => versehentliche Mehrfachanschläge ignorieren
- Mouse Keys => Mauszeiger per Ziffernblock
- Orca => Screenreader mit Sprache und Braille
- Braillezeile => taktile Ausgabe in Blindenschrift
- Magnifier => Bildschirmlupe

### Grafik-Komponenten
- gdm => Display Manager (Login)
- KWin => Window Manager
- Xfce => Desktop-Umgebung
- Xwayland => X11-Programme unter Wayland
- xauth => Cookie-basierter X-Zugriff
- Spice => Remote-Protokoll für VMs

## Karteikarten
- F: Was ist der X-Server? | A: Das Programm, das Bildschirm, Tastatur und Maus verwaltet – es läuft dort, wo der Benutzer sitzt.
- F: Was gibt die Variable DISPLAY an? | A: An welchen X-Server (Host:Display.Screen) eine Anwendung zeichnet, z. B. :0.
- F: Wo legt man Xorg-Anpassungen ab? | A: Als Schnipsel in /etc/X11/xorg.conf.d/*.conf (xorg.conf ist meist unnötig).
- F: Welche Datei hilft bei einer abstürzenden grafischen Sitzung? | A: ~/.xsession-errors
- F: Was ist der Unterschied zwischen Display Manager, Window Manager und Desktop Environment? | A: DM = grafischer Login; WM = Fensterverwaltung; DE = Gesamtpaket aus WM, Panels, Apps und Einstellungen.
- F: Nenne drei Display Manager. | A: gdm, sddm, lightdm (auch xdm).
- F: Was macht xhost? | A: Erlaubt oder sperrt X-Zugriff rechnerbasiert (grob).
- F: Was macht xauth? | A: Verwaltet MIT-MAGIC-COOKIEs für den Cookie-basierten, sicheren X-Zugriff.
- F: Was ist Wayland? | A: Moderner Nachfolger von X11, bei dem ein Compositor Display-Server und Window-Manager vereint.
- F: Was ist Xwayland? | A: Ein X-Server, der unter Wayland alte X11-Programme laufen lässt.
- F: Welche Remote-Protokolle nennt 106.2? | A: XDMCP, VNC, RDP und Spice.
- F: Welcher Linux-Dienst stellt RDP bereit? | A: xrdp
- F: Was sind Sticky Keys? | A: Modifikatortasten bleiben aktiv, damit Kombinationen nacheinander gedrückt werden können.
- F: Was ist Orca? | A: Der Screenreader von GNOME mit Sprachausgabe und Braille-Unterstützung.

## Quiz
? Wo läuft bei X11 der X-Server?
* Auf dem Rechner, an dem Bildschirm und Tastatur angeschlossen sind
- Auf dem Rechner, auf dem die Anwendung läuft
- Immer auf dem Display Manager
- Auf einem zentralen Server im Netz

? Was bedeutet `DISPLAY=:0`?
* Lokaler X-Server, Display 0
- Kein Bildschirm vorhanden
- X-Server auf Host 0
- Wayland-Sitzung Nummer 0

? Welches Programm ist ein Display Manager?
* sddm
- KWin
- Xfce
- Orca

? Welcher Weg für X-Zugriff ist der sicherste der genannten?
* xauth mit MIT-MAGIC-COOKIE
- xhost +
- xhost +localhost
- DISPLAY auf den Hostnamen setzen

? Wo trägt man heute ein Tastaturlayout für Xorg ein?
* In einem Schnipsel unter /etc/X11/xorg.conf.d/
- In /etc/default/grub
- In ~/.xsession-errors
- In /etc/inittab

? Welche Desktop-Umgebung gilt als leichtgewichtig?
* Xfce
- GNOME
- KDE Plasma
- Mutter

? Welches Remote-Protokoll ist speziell für virtuelle Maschinen gedacht?
* Spice
- XDMCP
- RDP
- SMTP

? Welche Barrierefreiheitsfunktion ignoriert versehentliche Mehrfachanschläge?
* Bounce Keys
- Sticky Keys
- Slow Keys
- Mouse Keys

? Welche Barrierefreiheitsfunktion steuert den Mauszeiger über den Ziffernblock?
* Mouse Keys
- Sticky Keys
- Toggle Keys
- Bounce Keys

? Was ist Orca?
* Ein Screenreader
- Ein Display Manager
- Ein Window Manager
- Ein VNC-Server

? Welches Protokoll ist unverschlüsselt und dient dem grafischen Login übers Netz?
* XDMCP
- RDP mit TLS
- SSH
- HTTPS

## Spickzettel
- X-Server = wo du sitzt · Clients = Apps · DISPLAY=host:0 · netzwerktransparent
- /etc/X11/xorg.conf.d/ (XkbLayout) · ~/.xsession-errors · Xorg.0.log
- DM (gdm, sddm, lightdm) → WM (Mutter, KWin, i3) → DE (GNOME, KDE, Xfce)
- xhost (grob, nie +) · xauth (Cookie, ~/.Xauthority) · ssh -X
- Wayland = Compositor, sicherer · Xwayland · $XDG_SESSION_TYPE
- XDMCP (alt, offen) · VNC (RFB 5900) · RDP (xrdp, 3389) · Spice (VMs)
- AccessX: Sticky (nacheinander) · Slow (halten) · Bounce (Prellen) · Mouse (Ziffernblock)
- Orca · Braillezeile · Lupe · High Contrast · Large Print · Bildschirmtastatur
