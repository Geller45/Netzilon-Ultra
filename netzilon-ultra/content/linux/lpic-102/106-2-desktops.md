---
id: linux-102-106-2-desktops
bereich: Linux
fach: Linux II
pruefungen: [LPIC-1]
block: LPIC-102
kapitel: LPIC-1 Prüfung 102 – Benutzeroberflächen
titel: 106.2 Grafische Desktops (Display Manager, Remote-Desktop)
stufe: Einsteiger
quellen: [LPI-Learning-Material-102-500-de.pdf, 1.11_Linux_-_Benutzeroberflaechen_und_Desktops.pdf]
verweise: [linux-l2-11-desktops, linux-102-106-1-x11, linux-102-106-3-barrierefreiheit]
---

## Profi

### Lernziel (Gewicht 1)
Desktop-Umgebungen, Display Manager und Remote-Desktop-Protokolle kennen.

### Desktop-Umgebungen
| Umgebung | Basis | Merkmal |
|---|---|---|
| **GNOME** | GTK | Standard bei Debian/Ubuntu/Fedora; Shell, Wayland |
| **KDE Plasma** | Qt | sehr konfigurierbar |
| **Xfce** | GTK | leichtgewichtig |
| **LXDE/LXQt**, MATE, Cinnamon | | leichtgewichtig / klassisch |
- Komponenten: Window Manager, Panel, Dateimanager, Einstellungen. Sitzungstypen in `/usr/share/xsessions` bzw. `wayland-sessions`.

### Display Manager
- **GDM** (GNOME), **SDDM** (KDE), **LightDM**, XDM. Aktiver Manager: `systemctl status display-manager`, Debian `/etc/X11/default-display-manager`. Start über `graphical.target`.

### Remote-Desktop
| Protokoll | Port | Hinweise |
|---|---|---|
| **VNC** | 5900+N (`:1` → 5901) | Bildschirm übertragen, Klartext, besser per SSH-Tunnel; TigerVNC, x11vnc |
| **RDP** | 3389 | xrdp, FreeRDP/Remmina als Client |
| **SPICE** | 5900+ | Virtualisierung (KVM) |
| **NX/X2Go** | über SSH 22 | effizient |
| **X11-Forwarding** | SSH 22 | einzelne Anwendungen |
- Tunnel: `ssh -L 5901:localhost:5901 server`.

## Einfach

Ein **Desktop** ist das, was du auf dem Bildschirm siehst: Hintergrund, Fenster, Menüs, Symbole. Unter Linux ist der Desktop **austauschbar** – wie ein Möbelhaus, das du je nach Geschmack einrichten kannst. Die bekanntesten Einrichtungsstile heißen **GNOME** (aufgeräumt, modern), **KDE Plasma** (alles einstellbar) und **Xfce** (schlank und schnell, gut für alte Rechner).

Der **Display Manager** ist der **Empfang**: das Anmeldefenster, in dem du Namen und Passwort eingibst und auswählen kannst, welchen Desktop du möchtest. Bekannt sind GDM, SDDM und LightDM.

Möchtest du den Desktop eines **anderen Rechners fernsteuern**, brauchst du ein Fernwartungsprogramm. Vier Namen sollte man kennen: **VNC** (überträgt das Bild, Port 5900 aufwärts, ohne Verschlüsselung → besser durch einen SSH-Tunnel schicken), **RDP** (das Windows-Verfahren, Port 3389, unter Linux mit `xrdp`), **SPICE** (für virtuelle Maschinen) und **X2Go/NX** (über SSH).

Wenn du nur ein einziges Programm vom Server brauchst, geht es noch leichter mit `ssh -X programm`.

Merke: Die Zahl hinter dem VNC-Display wird zum Port addiert: Display `:1` = Port 5901.

## Merksatz
- **GNOME/KDE/Xfce = Desktop, GDM/SDDM/LightDM = Anmeldung.**
- **VNC 5900+N, RDP 3389.**
- **VNC nie ungeschützt – SSH-Tunnel.**
- **graphical.target startet den Display Manager.**
- **GTK = GNOME/Xfce, Qt = KDE.**

## Prüfungsfalle
- VNC-Display `:1` bedeutet **Port 5901**.
- RDP-Standardport ist **3389**.
- Display Manager und Desktop-Umgebung nicht verwechseln.
- GNOME nutzt **GTK**, KDE nutzt **Qt**.
- VNC verschlüsselt standardmäßig nicht.
- Ohne `graphical.target` kein grafischer Login.

## Grafik

### VNC durch SSH-Tunnel
1. Client -> Server: ssh -L 5901:localhost:5901 anna@server
2. Server: vncserver :1 lauscht auf Port 5901
3. Client -> Tunnel: VNC-Viewer verbindet zu localhost:5901
4. Tunnel -> Server: verschlüsselter Transport
5. Server -> Client: Desktopbild

## Lab
**Maschine**: srv-web01 (Debian, mit Xfce) und client01.
```bash
# auf srv-web01
sudo apt install xfce4 tigervnc-standalone-server
vncserver :1
ss -tlnp | grep 590
systemctl status display-manager
# auf client01
ssh -L 5901:localhost:5901 anna@srv-web01
#   dann VNC-Viewer: localhost:5901
```

## Befehle
- `systemctl status display-manager` – aktiver Anmeldemanager
- `vncserver :1` – VNC-Sitzung starten
- `ssh -L 5901:localhost:5901 host` – Tunnel
- `systemctl set-default graphical.target` – grafischer Start
- `xfreerdp /v:host` – RDP-Client

## Übungen
- A: Auf welchem Port lauscht VNC-Display :2? | L: 5902
- A: Welcher Port gehört zu RDP? | L: 3389
- A: Wie schützt man VNC? | L: Über einen SSH-Tunnel.
- A: Nenne zwei Display Manager. | L: GDM, SDDM (auch LightDM).
- A: Welche Toolkits nutzen GNOME und KDE? | L: GTK bzw. Qt.

## Karteikarten
- F: Was ist GNOME? | A: Desktop-Umgebung auf GTK-Basis.
- F: Was ist KDE Plasma? | A: Qt-basierte, stark konfigurierbare Desktop-Umgebung.
- F: Was ist Xfce? | A: Leichtgewichtige Desktop-Umgebung.
- F: Wofür steht VNC? | A: Virtual Network Computing – Bildschirmübertragung.
- F: Welcher Port gehört zu RDP? | A: 3389.
- F: Was ist SPICE? | A: Remote-Display-Protokoll für virtuelle Maschinen.
- F: Welcher Display Manager gehört zu KDE? | A: SDDM.
- F: Welcher Port ist VNC :1? | A: 5901.
- F: Was ist X2Go? | A: Remote-Desktop über SSH auf NX-Basis.

## Quiz
? Welcher Port gehört zu VNC-Display :1?
* 5901
- 5900
- 3389
- 5001

? Welches Toolkit nutzt KDE?
* Qt
- GTK
- Tk
- Motif

? Was ist GDM?
* Display Manager von GNOME
- Fenstermanager
- Desktop
- Dateimanager

? Welcher Port wird für RDP genutzt?
* 3389
- 5900
- 22
- 443

? Wie schützt man VNC am besten?
* SSH-Tunnel
- Port ändern
- Display schließen
- Gar nicht nötig

? Welche Desktop-Umgebung ist besonders leichtgewichtig?
* Xfce
- GNOME
- KDE Plasma
- Unity

? Welcher Befehl zeigt den aktiven Display Manager?
* systemctl status display-manager
- xdm --info
- who -d
- dmsg

? Welches Target startet normalerweise den grafischen Login?
* graphical.target
- multi-user.target
- rescue.target
- poweroff.target

## Spickzettel
- GNOME (GTK) · KDE (Qt) · Xfce leicht
- DM: GDM SDDM LightDM
- VNC 5900+N · RDP 3389 · SPICE · X2Go/NX
- SSH-Tunnel für VNC · graphical.target
