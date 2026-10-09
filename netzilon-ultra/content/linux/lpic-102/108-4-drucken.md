---
id: linux-102-108-4-drucken
bereich: Linux
fach: Linux II
pruefungen: [LPIC-1]
block: LPIC-102
kapitel: LPIC-1 Prüfung 102 – Grundlegende Systemdienste
titel: 108.4 Drucker und Druckvorgänge verwalten
stufe: Fortgeschritten
quellen: [LPI-Learning-Material-102-500-de.pdf]
verweise: [linux-l2-17-drucken]
---

## Profi

### Lernziel (Gewicht 2)
Druckwarteschlangen und -aufträge mit **CUPS** (Common Unix Printing System) und den **Legacy-LPD-Befehlen** verwalten.

### CUPS
- Dienst `cups` (`cupsd`), Konfiguration `/etc/cups/cupsd.conf`, Drucker in `/etc/cups/printers.conf`, PPD-Dateien in `/etc/cups/ppd/`. Webinterface: **http://localhost:631**. Protokoll **IPP** (Internet Printing Protocol, Port 631).
- Drucker-Typen: lokal (USB), Netzwerk (`ipp://`, `socket://host:9100`, `lpd://`), Freigabe per `Browsing`/`cups-browsed`/Bonjour.
- Drucker hinzufügen: `lpadmin -p lab1 -E -v ipp://10.0.0.20/ipp/print -m everywhere`; Standard setzen: `lpadmin -d lab1` bzw. `lpoptions -d lab1`.

### Befehle für Benutzer (System V / CUPS)
- `lp -d drucker datei` (Auftrag), `lp -n 2` (Kopien), `lpstat -p -d` (Drucker, Standard), `lpstat -o` bzw. `lpq` (Warteschlange), `cancel <ID>` bzw. `lprm <ID>` (abbrechen), `lpstat -t` (alles).
- BSD-kompatibel: `lpr`, `lpq`, `lprm`. Mit `lpc` Statuskontrolle (eingeschränkt unter CUPS).
- Verwaltung: `cupsaccept`/`cupsreject` (Warteschlange annimmt/ablehnt Aufträge), `cupsenable`/`cupsdisable` (Drucker aktiv/pausiert).

### Ablauf
Anwendung → Datei in `/var/spool/cups` → Filter (Umwandlung in druckerspezifisches Format, z. B. via Ghostscript) → Backend (USB/IPP/socket) → Drucker. Logs: `/var/log/cups/error_log`, `access_log`, `page_log`.

## Einfach

Wenn du auf „Drucken“ klickst, geht dein Dokument nicht direkt in den Drucker. Es stellt sich zuerst in einer **Warteschlange** an, wie vor einer Kasse. Der Dienst, der die Schlange verwaltet, heißt unter Linux **CUPS**. Er übersetzt dein Dokument in die „Sprache“ deines Druckers, schickt es ab und merkt sich, wer was gedruckt hat.

CUPS hat eine kleine Webseite zum Verwalten: `http://localhost:631`. Auf der Kommandozeile gibt es einfache Befehle: `lp datei` druckt, `lpstat -t` zeigt den Zustand, `lpq` zeigt die Schlange und `cancel 12` bricht Auftrag Nr. 12 ab.

Manchmal hängt ein Druck. Dann hilft: Auftrag abbrechen, Drucker mit `cupsenable` wieder einschalten oder CUPS neu starten. Wenn du einen neuen Drucker einrichten willst, geht das per Weboberfläche oder mit `lpadmin`.

Die alten Befehle `lpr`, `lpq`, `lprm` stammen von einem älteren System (LPD). CUPS versteht sie noch, damit alte Skripte weiter funktionieren.

## Merksatz
- **CUPS = Port 631, IPP, Web auf localhost:631.**
- **lp druckt, lpstat/lpq zeigt, cancel/lprm bricht ab.**
- **cupsenable/-disable = Drucker, cupsaccept/-reject = Warteschlange.**
- **Spool: /var/spool/cups.**

## Prüfungsfalle
- `cupsdisable` stoppt den Drucker (Aufträge bleiben in der Queue), `cupsreject` nimmt keine neuen Aufträge an.
- Konfiguration: `printers.conf` hält Drucker, `cupsd.conf` den Dienst.
- `lpr`/`lpq`/`lprm` sind Legacy, funktionieren aber unter CUPS.
- Druckerfreigabe braucht Änderung in `cupsd.conf` (Listen/Browsing) und ggf. Firewall.

## Grafik

### Druckauftrag
1. Anwendung -> CUPS: Auftrag per lp oder IPP
2. CUPS: Auftrag in /var/spool/cups
3. CUPS -> Filter: Umwandlung ins Druckerformat
4. Filter -> Drucker: Backend sendet an den Drucker
5. Drucker: Seite gedruckt, Auftrag aus Queue entfernt

## Lab
**Maschine**: debian01.
```bash
sudo apt install cups
sudo systemctl enable --now cups
lpstat -t
echo "Testseite" | lp -d PDF
lpq
cancel -a
```

## Befehle
- `lp -d drucker datei` – drucken
- `lpstat -t` – kompletter Status
- `lpq` – Warteschlange
- `cancel ID` / `lprm ID` – Auftrag löschen
- `lpadmin -p name -v uri -E` – Drucker einrichten
- `cupsenable` / `cupsdisable` – Drucker ein/aus
- `cupsaccept` / `cupsreject` – Queue offen/zu

## Übungen
- A: Wie bricht man Auftrag 15 ab? | L: `cancel 15` oder `lprm 15`
- A: Welche Adresse hat die CUPS-Weboberfläche? | L: http://localhost:631
- A: Wie legt man einen Standarddrucker fest? | L: `lpadmin -d name`

## Karteikarten
- F: Wie heißt das Druckprotokoll von CUPS? | A: IPP (Internet Printing Protocol), Port 631.
- F: Wo liegen die Spool-Dateien? | A: /var/spool/cups
- F: Welcher Befehl druckt eine Datei? | A: lp (oder lpr).
- F: Wie zeigt man die Druckwarteschlange? | A: lpq oder lpstat -o
- F: Wie löscht man einen Auftrag? | A: cancel ID oder lprm ID
- F: Wie schaltet man einen Drucker aus (pausiert)? | A: cupsdisable drucker
- F: Wie nimmt man keine neuen Aufträge mehr an? | A: cupsreject drucker
- F: Welche Datei enthält die Druckerdefinitionen? | A: /etc/cups/printers.conf
- F: Wo liegt das CUPS-Fehlerlog? | A: /var/log/cups/error_log
- F: Was enthält eine PPD-Datei? | A: Beschreibung der Druckerfähigkeiten.

## Quiz
? Auf welchem Port lauscht CUPS?
* 631
- 515
- 9100
- 80

? Welcher Befehl bricht einen Druckauftrag ab?
* cancel
- lpkill
- lpstop
- lpdel

? Welcher Befehl zeigt den gesamten CUPS-Status?
* lpstat -t
- lpc all
- cups -s
- lpinfo -a

? Welches Verzeichnis enthält wartende Aufträge?
* /var/spool/cups
- /var/log/cups
- /etc/cups/spool
- /tmp/print

? Was bewirkt cupsreject?
* Die Warteschlange nimmt keine neuen Aufträge an
- Pausiert den Drucker
- Löscht den Drucker
- Startet CUPS neu

? Welches Programm richtet Drucker per CLI ein?
* lpadmin
- lpconfig
- cupsmk
- printadd

? Welche Datei konfiguriert den CUPS-Dienst?
* /etc/cups/cupsd.conf
- /etc/cups/printers.conf
- /etc/printcap
- /etc/cups.d

? Welches Protokoll nutzt CUPS?
* IPP
- SMB only
- FTP
- SNMP

## Lücken
- CUPS ist über Port {631} erreichbar.
- Aufträge bricht man mit {cancel} ab.
- Drucker pausiert man mit {cupsdisable}.

## Spickzettel
- CUPS: IPP 631, Web localhost:631
- lp, lpstat -t, lpq, cancel
- cupsenable/-disable, cupsaccept/-reject
- Spool /var/spool/cups, Log /var/log/cups
