---
id: linux-l2-17-drucken
bereich: Linux
fach: Linux II
pruefungen: [LPIC-1, Schule]
block: L2
kapitel: Linux II – Administration
titel: 1.17 Drucken mit CUPS (Szenario)
stufe: Fortgeschritten
quellen: [1.17_Linux_-_Drucken_mit_CUPS_Szenario.pdf, LPI-Learning-Material-102-500-de.pdf]
verweise: [linux-102-108-4-drucken, linux-l2-16-logging, linux-l2-15-netzwerke]
---

## Profi

### Einordnung
**108.4 Drucken und Druckerverwaltung – Gewicht 2.** Szenario: Der Netzwerkdrucker der Buchhaltung soll auf srv-print01 eingerichtet und freigegeben werden; „Drucker geht nicht“ ist der Klassiker im Support.

### CUPS
- **CUPS** (Common Unix Printing System) ist das Drucksystem; Daemon **`cupsd`**, Dienst `cups`. Webverwaltung: **`http://localhost:631`** (IPP, Port **631**).
- **IPP** (Internet Printing Protocol) ist das Standardprotokoll; weitere Ziele: `socket://ip:9100` (JetDirect/RAW), `lpd://`, `ipp://`, `usb://`.
- **Druckauftrag** wird im Spool gespeichert: `/var/spool/cups/`. Filterkette wandelt Dateien in druckerlesbares Format (PDF/PostScript/Raster). Treiber: **PPD-Dateien** (`/etc/cups/ppd/`) oder driverless (IPP Everywhere).
- Konfiguration: **`/etc/cups/cupsd.conf`** (Dienst, Freigabe, Zugriff), **`/etc/cups/printers.conf`** (Drucker), Logs `/var/log/cups/` (`access_log`, `error_log`, `page_log`).

### Kommandos
| Aufgabe | Befehl |
|---|---|
| Drucker einrichten | `lpadmin -p buchhaltung -E -v ipp://192.168.1.50/ipp/print -m everywhere` |
| Standarddrucker | `lpadmin -d buchhaltung` |
| Drucken | `lp -d buchhaltung datei.pdf`, `lp -n 2` (Kopien), `lpr datei` |
| Warteschlange | `lpq`, `lpstat -t`, `lpstat -p -d` |
| Auftrag löschen | `lprm 12`, `cancel 12`, `cancel -a` |
| Drucker an/aus | `cupsenable`/`cupsdisable` (Drucker), `cupsaccept`/`cupsreject` (Warteschlange) |
| Drucker anzeigen | `lpinfo -v`, `lpinfo -m` |
- Unterschied: **disable** = Aufträge werden angenommen, aber nicht gedruckt; **reject** = neue Aufträge werden abgelehnt.
- **Legacy (BSD/System V)**: `lpr`, `lpq`, `lprm` (BSD) und `lp`, `lpstat`, `cancel` (System V) werden von CUPS beide bereitgestellt. `lpc` existiert nur eingeschränkt.

### Freigabe im Netzwerk
- `cupsctl --share-printers --remote-any` oder in `cupsd.conf`: `Listen`, `Browsing On`, `<Location />` mit `Allow`/`Order`. Firewall: Port 631.
- Clients: Drucker erscheinen per **DNS-SD/Avahi (Bonjour)** oder `/etc/cups/client.conf` (`ServerName`). Samba kann CUPS-Drucker für Windows freigeben.

### Fehlersuche
1. Läuft `cups`? (`systemctl status cups`) 2. Drucker aktiviert/akzeptiert? (`lpstat -t`) 3. Netz/Port erreichbar? (`ping`, `nc -vz ip 9100`) 4. `error_log` lesen. 5. Treiber (PPD) passend?

## Einfach

Wenn du auf „Drucken“ klickst, geht dein Blatt nicht direkt in den Drucker. Es gibt einen **Pförtner mit Wartezimmer**: **CUPS**. Dein Auftrag setzt sich ins Wartezimmer (den **Spool**) und wartet. Der Pförtner schaut, in welcher Sprache der Drucker versteht (der **Treiber**), übersetzt dein Dokument und schickt es dann los.

Das Wartezimmer kannst du dir anschauen: `lpq` zeigt, wer wartet. Wer nicht mehr drucken will, wird mit `lprm` oder `cancel` wieder nach Hause geschickt.

Der Pförtner hat eine Webseite zum Einstellen: Wenn du im Browser `localhost:631` aufrufst, siehst du alle Drucker und kannst neue hinzufügen. Mit `lpadmin` geht es auch per Befehl.

Zwei Schalter muss man unterscheiden: Der **Drucker** kann „aus“ sein (`cupsdisable`) – dann nimmt das Wartezimmer noch Leute auf, aber niemand wird bedient. Oder das **Wartezimmer** ist zu (`cupsreject`) – dann kommen gar keine neuen Aufträge mehr hinein.

Wichtig: Der Pförtner spricht mit Druckern in einer gemeinsamen Sprache, dem **IPP**. Ältere Geräte nehmen stattdessen rohe Daten über einen Kanal (Port 9100) an – das ist wie ein Paket ohne Begleitbrief. Eine Beschreibung des Druckers (die **PPD**-Datei) sagt dem Pförtner, was der Drucker kann: Duplex, Papierfächer, Farbe. Mehrere Computer im Büro können denselben Pförtner nutzen, wenn er seine Tür ins Netzwerk öffnet (Freigabe, Port 631).

Wenn jemand sagt „Drucker geht nicht“, gehst du Schritt für Schritt vor: Läuft der Pförtner? Ist der Drucker an und akzeptiert er Aufträge? Ist das Kabel oder das Netzwerk in Ordnung? Und was steht im Fehlerbuch (`error_log`)?

## Merksatz
- **CUPS = Port 631, Weboberfläche localhost:631.**
- **lp / lpq / lprm: drucken, ansehen, löschen.**
- **enable/disable = Drucker, accept/reject = Warteschlange.**
- **Spool in /var/spool/cups, Konfig in /etc/cups.**
- **IPP ist das Protokoll, PPD der Treiber.**

## Prüfungsfalle
- `cupsdisable` stoppt das **Drucken**, `cupsreject` stoppt die **Annahme**.
- `lp -d` wählt den Drucker, `-n` die Kopienzahl; `lpr -P` wählt bei BSD.
- Die Druckerliste steht in `printers.conf`, die Dienstkonfiguration in `cupsd.conf`.
- Port **631**, nicht 9100 (9100 ist JetDirect/RAW zum Drucker).
- `lpq` zeigt die Warteschlange, `lpstat -t` den Gesamtstatus.
- Treiber sind **PPD**-Dateien.
- `lpr` und `lp` gibt es beide unter CUPS – Prüfungsfragen mischen BSD- und System-V-Syntax.

## Grafik

### Druckauftrag
1. Client -> CUPS: lp -d buchhaltung datei.pdf
2. CUPS -> Spool: Auftrag landet in /var/spool/cups
3. CUPS: Filterkette wandelt in Druckerformat (PPD)
4. CUPS -> Drucker: Übertragung per IPP oder socket://:9100
5. Drucker -> CUPS: Auftrag fertig, Eintrag in page_log

## Lab
**Maschine**: srv-print01 (Debian 12), Drucker 192.168.1.50 (IPP).
```bash
# auf srv-print01 – installieren und starten
sudo apt install cups
sudo systemctl enable --now cups
sudo usermod -aG lpadmin anna

# auf srv-print01 – Drucker anlegen und freigeben
sudo lpadmin -p buchhaltung -E -v ipp://192.168.1.50/ipp/print -m everywhere
sudo lpadmin -d buchhaltung
sudo cupsctl --share-printers --remote-any

# auf srv-print01 – drucken und prüfen
echo "Testseite" | lp -d buchhaltung
lpstat -t; lpq
lprm 1
sudo cupsdisable buchhaltung; sudo cupsenable buchhaltung
sudo tail /var/log/cups/error_log
```

## Befehle
- `lpadmin -p name -E -v uri -m everywhere` – Drucker einrichten
- `lp -d drucker datei` – drucken
- `lpq` – Warteschlange
- `lpstat -t` – kompletter Status
- `lprm id` / `cancel id` – Auftrag löschen
- `cupsenable` / `cupsdisable` – Drucker aktivieren/deaktivieren
- `cupsaccept` / `cupsreject` – Warteschlange öffnen/schließen
- `lpinfo -v` – verfügbare Geräte
- `cupsctl` – Servereinstellungen

## Übungen
- A: Welcher Port gehört zu CUPS/IPP? | L: 631
- A: Wie löschst du Auftrag 12? | L: lprm 12 oder cancel 12
- A: Wie legst du einen Standarddrucker fest? | L: lpadmin -d name
- A: Was unterscheidet cupsdisable von cupsreject? | L: disable: Drucker stoppt, Aufträge werden noch angenommen; reject: neue Aufträge werden abgelehnt.
- A: Wo liegt die CUPS-Hauptkonfiguration? | L: /etc/cups/cupsd.conf
- A: Wie zeigst du alle Drucker samt Status? | L: lpstat -t
- A: Wo liegt das Spool-Verzeichnis? | L: /var/spool/cups/

## Karteikarten
- F: Wofür steht CUPS? | A: Common Unix Printing System.
- F: Unter welcher URL erreicht man die CUPS-Weboberfläche? | A: http://localhost:631
- F: Welches Protokoll nutzt CUPS standardmäßig? | A: IPP (Internet Printing Protocol).
- F: Wo liegen Druckaufträge während der Verarbeitung? | A: /var/spool/cups/
- F: Welche Datei beschreibt einen Druckertyp (Treiber)? | A: PPD (PostScript Printer Description).
- F: Mit welchem Befehl druckt man? | A: lp (oder lpr).
- F: Welcher Befehl zeigt die Druckwarteschlange? | A: lpq
- F: Welcher Befehl entfernt einen Auftrag? | A: lprm oder cancel
- F: Wo steht die Druckerliste? | A: /etc/cups/printers.conf
- F: Wo liegen die CUPS-Logs? | A: /var/log/cups/
- F: Welcher Port wird für RAW-Druck (JetDirect) genutzt? | A: 9100.

## Quiz
? Auf welchem Port arbeitet CUPS standardmäßig?
* 631
- 515
- 9100
- 25

? Welcher Befehl zeigt die Druckwarteschlange?
* lpq
- lpd
- lpc status
- cupsq

? Wie entfernt man einen Auftrag mit der Nummer 7?
* lprm 7
- lpdel 7
- cupsrm 7
- rm 7

? Was bewirkt cupsreject?
* Die Warteschlange lehnt neue Aufträge ab
- Der Drucker stoppt, nimmt aber noch Aufträge an
- Der Drucker wird gelöscht
- Der Dienst cups wird gestoppt

? Wo liegt die CUPS-Hauptkonfiguration?
* /etc/cups/cupsd.conf
- /etc/cups.conf
- /var/spool/cups/cupsd
- /etc/printcap

? Wie heißt das Treiberformat bei CUPS?
* PPD
- DLL
- INF
- GPD

? Welcher Befehl legt einen Drucker an?
* lpadmin
- lpinfo
- lpmake
- cupsadd

? Welcher Befehl zeigt den Gesamtstatus aller Drucker?
* lpstat -t
- lpq -a
- lpc stat
- cups -t

? Wo liegen die Spooldateien?
* /var/spool/cups/
- /var/cups/spool
- /etc/cups/spool
- /tmp/cups

## Lücken
- Die CUPS-Weboberfläche erreicht man über Port {631}.
- Mit {lpq} sieht man die Warteschlange, mit {lprm} löscht man Aufträge.
- Treiberdateien für CUPS heißen {PPD}.

## Spickzettel
- CUPS: cupsd, Port 631, IPP, Web localhost:631
- lp -d / lpq / lprm / cancel / lpstat -t
- lpadmin -p -E -v -m everywhere · -d Standard
- enable/disable Drucker · accept/reject Queue
- /etc/cups/cupsd.conf · printers.conf · /var/spool/cups · /var/log/cups
- PPD = Treiber · socket://:9100 = RAW
