---
id: linux-101-101-3-runlevel
bereich: Linux
fach: Linux I
pruefungen: [LPIC-1]
block: LPIC-101
kapitel: LPIC-1 Prüfung 101 – Systemarchitektur
titel: 101.3 Runlevel, Systemziele und Neustart (SysV, systemd)
stufe: Fortgeschritten
quellen: [LPI-Learning-Material-101-500-de.pdf, 1.06_Linux_-_Booten_Bootloader_und_Init.pdf]
verweise: [linux-l1-06-booten, linux-101-101-2-booten, linux-l2-16-logging]
---

## Profi

### Lernziel (Gewicht 3)
Runlevel/Targets wechseln, Standardziel setzen, Dienste verwalten, System herunterfahren, Benutzer warnen.

### SysV-init (Legacy)
- Runlevel: **0** halt, **1/S** Single-User, **2–5** Multi-User (Debian: gleich; RHEL: 3 = Text, 5 = grafisch), **6** Reboot. `/etc/inittab` (`id:5:initdefault:`), Skripte in `/etc/init.d/`, Links `/etc/rc?.d/` (`S` = Start, `K` = Kill, Zahl = Reihenfolge). Befehle: `runlevel`, `telinit 3`/`init 3`, `service dienst start`, `chkconfig`/`update-rc.d`.

### systemd
| SysV | systemd-Target |
|---|---|
| 0 | `poweroff.target` |
| 1 | `rescue.target` |
| 2,3,4 | `multi-user.target` |
| 5 | `graphical.target` |
| 6 | `reboot.target` |
| – | `emergency.target` (minimal, nur Root-Shell) |
- Ziel anzeigen/setzen: `systemctl get-default`, `systemctl set-default multi-user.target`; sofort wechseln: `systemctl isolate rescue.target`.
- Dienste: `systemctl start|stop|restart|reload|status|enable|disable|mask|is-active|is-enabled dienst`; `systemctl list-units --type=service`, `list-unit-files`, `daemon-reload` nach Unit-Änderung. Units: `/lib/systemd/system/` (Paket), `/etc/systemd/system/` (Admin, Vorrang).
- **enable** = beim Boot starten (Symlink), **start** = jetzt starten; **mask** verhindert Start komplett.

### Herunterfahren
- `shutdown -h now`, `shutdown -r +10 "Wartung"` (Reboot in 10 min, Wall-Meldung), `shutdown -c` (abbrechen), `halt`, `poweroff`, `reboot`, `systemctl poweroff|reboot`. `wall "Text"` sendet an alle Terminals. `/etc/nologin` sperrt Logins kurz vor dem Shutdown.

## Einfach

Ein Computer kennt verschiedene **Betriebsarten**, so wie ein Auto: Motor aus, Leerlauf, Fahrbetrieb. Früher hießen sie **Runlevel** und hatten Nummern: 0 = ausschalten, 1 = nur Admin (Wartung), 3 = normaler Textbetrieb, 5 = mit grafischer Oberfläche, 6 = Neustart.

Moderne Linux-Systeme (systemd) nennen das **Targets** („Ziele“), denn sie wollen etwas erreichen: `multi-user.target` ist der normale Server-Betrieb, `graphical.target` ist mit Fenstern, `rescue.target` ist die Werkstatt. Welches Ziel nach dem Einschalten gilt, bestimmst du mit `systemctl set-default`.

Einen **Dienst** (z. B. den Webserver) steuerst du mit `systemctl`: `start` = jetzt anschalten, `stop` = ausschalten, `enable` = „bitte bei jedem Start automatisch“. `start` ist wie das Licht anknipsen, `enable` wie den Bewegungsmelder einschalten. Mit `mask` schraubst du die Glühbirne ganz heraus: Der Dienst startet nie.

Beim Ausschalten sagst du anderen Bescheid: `shutdown -r +10 "Wartung"` bedeutet: „In 10 Minuten Neustart.“ Alle angemeldeten Benutzer sehen die Nachricht. Wenn du dich umentscheidest: `shutdown -c`.

## Merksatz
- **0 aus, 1 Wartung, 3 Text, 5 grafisch, 6 Neustart.**
- **enable = beim Boot, start = jetzt.**
- **mask = nie.**
- **Admin-Units in /etc/systemd/system schlagen Paket-Units.**
- **shutdown -h aus, -r neu, -c abbrechen.**

## Prüfungsfalle
- `enable` startet den Dienst **nicht** sofort; `start` aktiviert ihn nicht dauerhaft.
- `systemctl isolate` wechselt das Target **jetzt**, `set-default` gilt erst beim nächsten Boot.
- Runlevel 2–4 sind bei systemd alle `multi-user.target`.
- `reload` liest die Konfiguration neu, `restart` startet den Prozess neu.
- Nach Unit-Änderung: `systemctl daemon-reload`.
- SysV-Skripte: Links mit `S` starten, mit `K` beenden.
- `init 6` = Reboot, `init 0` = Halt.

## Grafik

### systemctl enable und start
1. Admin -> systemctl: systemctl enable --now nginx
2. systemctl: legt Symlink in multi-user.target.wants an
3. systemctl -> systemd: startet nginx.service sofort
4. systemd -> nginx: Dienst läuft
5. systemd: nach dem nächsten Boot startet nginx automatisch

## Lab
**Maschine**: debian01.
```bash
# auf debian01
systemctl get-default
runlevel
sudo systemctl isolate rescue.target     # Achtung: Konsole!
sudo systemctl set-default multi-user.target
systemctl status ssh
sudo systemctl enable --now ssh
systemctl list-units --type=service --state=running | head
sudo shutdown -r +5 "Wartung in 5 Minuten"
sudo shutdown -c
wall "Hallo zusammen"
```

## Befehle
- `systemctl get-default` – Standardziel
- `systemctl set-default ziel` – Standardziel setzen
- `systemctl isolate ziel` – sofort wechseln
- `systemctl enable --now dienst` – aktivieren und starten
- `systemctl mask dienst` – komplett sperren
- `systemctl daemon-reload` – Units neu einlesen
- `runlevel` – Runlevel (SysV)
- `shutdown -r +10 "Text"` – geplanter Neustart
- `shutdown -c` – abbrechen
- `wall "Text"` – Nachricht an alle

## Übungen
- A: Welches Target entspricht Runlevel 5? | L: graphical.target
- A: Wie setzt du den Server dauerhaft auf Textbetrieb? | L: systemctl set-default multi-user.target
- A: Wie startest und aktivierst du nginx in einem Schritt? | L: systemctl enable --now nginx
- A: Wie planst du in 15 Minuten einen Reboot mit Meldung? | L: shutdown -r +15 "Wartung"
- A: Wie brichst du ihn ab? | L: shutdown -c

## Karteikarten
- F: Welcher Runlevel ist Reboot? | A: 6.
- F: Welches Target entspricht Runlevel 1? | A: rescue.target
- F: Was bewirkt systemctl mask? | A: Verhindert jeden Start der Unit (Link auf /dev/null).
- F: Wo liegen administrative Unit-Dateien? | A: /etc/systemd/system/
- F: Was macht systemctl isolate? | A: Wechselt sofort zu einem Target und beendet nicht dazugehörige Units.
- F: Wie zeigt man Dienste an? | A: systemctl list-units --type=service
- F: Was macht wall? | A: Sendet eine Nachricht an alle angemeldeten Terminals.
- F: Wofür stehen S und K in /etc/rc3.d? | A: Start- und Kill-Skripte.
- F: Welche Datei definiert in SysV den Standard-Runlevel? | A: /etc/inittab
- F: Wie lässt man Unit-Änderungen wirksam werden? | A: systemctl daemon-reload

## Quiz
? Welcher Runlevel bedeutet Neustart?
* 6
- 0
- 1
- 5

? Welches Target ist der grafische Mehrbenutzerbetrieb?
* graphical.target
- multi-user.target
- rescue.target
- reboot.target

? Was bewirkt systemctl enable dienst?
* Dienst startet beim Boot
- Dienst startet sofort
- Dienst wird gelöscht
- Dienst wird neu geladen

? Wie bricht man einen geplanten Shutdown ab?
* shutdown -c
- shutdown -x
- halt -c
- kill shutdown

? Welcher Befehl setzt das Standard-Target dauerhaft?
* systemctl set-default
- systemctl isolate
- systemctl enable
- init default

? Wo liegen vom Admin angelegte Unit-Dateien?
* /etc/systemd/system/
- /usr/share/systemd
- /var/systemd
- /boot/systemd

? Was bewirkt systemctl mask?
* Der Dienst kann nicht mehr gestartet werden
- Der Dienst wird versteckt aber startet
- Der Dienst wird neu gestartet
- Die Unit wird bearbeitet

? Welcher Runlevel entspricht rescue.target?
* 1
- 3
- 5
- 6

## Spickzettel
- 0 halt · 1 rescue · 3 multi-user · 5 graphical · 6 reboot
- get-default / set-default / isolate
- enable (Boot) · start (jetzt) · enable --now · mask
- /etc/systemd/system > /lib/systemd/system
- shutdown -h/-r/-c · wall · daemon-reload
