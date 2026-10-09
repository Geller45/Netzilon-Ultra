---
id: linux-l2-12-lokalisierung
bereich: Linux
fach: Linux II
pruefungen: [LPIC-1, Schule]
block: L2
kapitel: Linux II – Administration
titel: 1.12 Lokalisierung, Zeichensätze, Zeitzonen, Systemzeit und NTP (Szenario)
stufe: Fortgeschritten
quellen: [1.12_Linux_-_Lokalisierung_und_Systemzeit_Szenario.pdf, LPI-Learning-Material-102-500-de.pdf]
verweise: [linux-102-107-3-lokalisierung, linux-102-108-1-systemzeit, linux-l1-08-paketverwaltung, linux-l2-16-logging]
---

## Profi

### Einordnung
**107.3** Lokalisierung und Internationalisierung (G3) und **108.1** Systemzeit (G3) – Prüfung 102. Beide teilen sich die Zeitzonen. Das Skript ist eine Ticket-Woche: kaputte Umlaute im CSV-Export von srv-old03, US-Kunden/Zeitzonen, srv-app02 geht 4 Minuten nach, srv-old03 erwacht nach Stromausfall im Jahr 2001.

### Locale (107.3)
- **Locale** = Sprache, Formate (Datum, Zahlen, Währung, Sortierung) und Zeichensatz; Muster **`sprache_LAND.Zeichensatz`**, z. B. **`de_DE.UTF-8`**, `en_US.UTF-8`, **`C`**/`POSIX` (Standard, ASCII, englisch).
| Variable | Bedeutung |
|---|---|
| **`LANG`** | Standard für alle Kategorien |
| `LC_CTYPE` | Zeichenklassifizierung/Zeichensatz |
| `LC_TIME` | Datum/Uhrzeit |
| `LC_NUMERIC` | Zahlenformat (Dezimalkomma) |
| `LC_MONETARY` | Währung |
| `LC_COLLATE` | Sortierreihenfolge |
| `LC_MESSAGES` | Sprache der Programmmeldungen |
| `LC_PAPER`, `LC_ADDRESS`, `LC_TELEPHONE` … | weitere Kategorien |
| **`LC_ALL`** | überschreibt **alles** (höchste Priorität) |
| `LANGUAGE` | Liste bevorzugter Sprachen für Meldungen (GNU) |
- Priorität: **LC_ALL > LC_\* > LANG**. `locale` (aktuelle Werte), **`locale -a`** (verfügbare Locales), `localectl status`, `localectl set-locale LANG=de_DE.UTF-8`, `localectl list-locales`; Debian: `dpkg-reconfigure locales`, `/etc/locale.gen` + `locale-gen`, `/etc/default/locale`; RHEL: `/etc/locale.conf`.
- **`LC_ALL=C befehl`** erzwingt die Standard-Locale – nützlich in Skripten für **stabile, englische Ausgabe** (z. B. `LC_ALL=C date`, Sortierung byteweise).

### Zeichensätze
| Kodierung | Eigenschaft |
|---|---|
| **ASCII** | **7 Bit, 128 Zeichen**, nur Englisch |
| **ISO-8859-x** | **8 Bit**, regional: **ISO-8859-1 (Latin-1)** Westeuropa, ISO-8859-15 mit €-Zeichen |
| **Unicode** | universeller Zeichenvorrat (**welche** Zeichen es gibt) |
| **UTF-8** | Unicode-**Kodierung** (**wie** sie als Bytes gespeichert werden), 1–4 Byte, **ASCII-kompatibel** – heutiger Standard |
| UTF-16 | Unicode mit 2/4 Byte (Windows intern) |
| CP1252 | Windows-Codepage Westeuropa |
- **`file datei`** erkennt die Kodierung (`ISO-8859 text`, `UTF-8 Unicode text`).
- **`iconv -f ISO-8859-1 -t UTF-8 alt.csv > neu.csv`** wandelt um; `iconv -l` listet Kodierungen. Quellkodierung **richtig** angeben, sonst entsteht erst recht Zeichensalat.

### Zeitzonen (107.3 / 108.1)
- **`/usr/share/zoneinfo/`** = Datenbank aller Zeitzonen (Paket **tzdata**). **`/etc/localtime`** = **Symlink** (oder Kopie) auf die aktive Zone (`-> /usr/share/zoneinfo/Europe/Berlin`). **`/etc/timezone`** = Name der Zone als Text (Debian).
- **Intern rechnet Linux in UTC**; die Zeitzone bestimmt nur die **angezeigte** Ortszeit.
- Setzen: **`timedatectl set-timezone Europe/Berlin`** (dauerhaft, aktualisiert /etc/localtime), `timedatectl list-timezones`, **`tzselect`** (interaktiv den **Namen finden** – setzt **nicht** dauerhaft, gibt nur den TZ-Wert aus), `dpkg-reconfigure tzdata` (Debian), manuell `ln -sf /usr/share/zoneinfo/Europe/Berlin /etc/localtime`.
- **`TZ`** temporär für einen Aufruf oder Benutzer: `TZ='America/New_York' date`, `export TZ=…` in `~/.profile`.

### System- vs. Hardware-Uhr (108.1)
- **Systemuhr**: vom Kernel geführt, läuft nur im Betrieb → **`date`**. **Hardware-Uhr (RTC)**: batteriegepuffert, läuft auch ausgeschaltet → **`hwclock`**.
- **Best Practice: RTC in UTC** (`timedatectl set-local-rtc 0`); nur bei Dual-Boot mit Windows ggf. lokale Zeit. Konfiguration klassisch in `/etc/adjtime`.
- `date` (anzeigen), `date +%F_%H-%M` (formatiert), `date -u` (UTC), `date -s "2026-06-14 12:00"` bzw. `date MMDDhhmm[[CC]YY][.ss]` (setzen).
- `hwclock --show` / `-r`, **`hwclock --systohc`** (**System → RTC**, nach dem Stellen; „sys-to-hc“), **`hwclock --hctosys`** (**RTC → System**, beim Boot), `--utc`/`--localtime`.
- **`timedatectl`** = Zentrale: Status (Local time, Universal time, RTC time, Time zone, NTP service), `set-time "2026-06-14 12:00:00"` (**nur bei NTP aus**), `set-timezone`, **`set-ntp true/false`**, `timesync-status`.

### NTP – Zeit synchronisieren
- Uhren **driften**; **NTP** (Network Time Protocol, **UDP 123**) gleicht permanent gegen Zeitserver ab. **Stratum**-Hierarchie: **0** = Referenzuhr (Atomuhr, GPS), **1** = direkt daran angeschlossen, 2 = synchronisiert sich an Stratum 1 usw. **pool.ntp.org** = weltweiter Verbund freier Zeitserver (`0.de.pool.ntp.org`, `2.debian.pool.ntp.org`).
- Korrekte Zeit ist **Pflicht** für **TLS** (Zertifikate „not yet valid“), **Logs**, **Kerberos** (max. 5 min Abweichung) und **Backups**.
- **chrony** (`chronyd`, moderner Standard bei RHEL/Ubuntu, gut für Laptops/wechselnde Verbindungen): **`/etc/chrony.conf`** bzw. `/etc/chrony/chrony.conf` (`pool 2.pool.ntp.org iburst`, `server …`, `driftfile /var/lib/chrony/drift`, `makestep`), **`chronyc sources`** (`-v` erklärt Spalten; `^*` = aktuell genutzte Quelle), **`chronyc tracking`** (Genauigkeit, Offset), `chronyc makestep`. Korrigiert **sanft** (slewing).
- **ntpd** (klassisch): **`/etc/ntp.conf`** (`server`/`pool`-Zeilen, `driftfile`), **`ntpq -p`** (Peers: remote, st, when, reach, offset; `*` = gewählter Peer). **ntpdate** setzt die Zeit nur **einmalig** (veraltet, ersetzt durch `chronyd -q` / `ntpd -gq`).
- **systemd-timesyncd**: leichter **SNTP-Client** (nur Client, kein Server), Standard auf vielen Debian/Ubuntu-Systemen, `timedatectl set-ntp true`, `timedatectl timesync-status`, Konfiguration `/etc/systemd/timesyncd.conf`.
- **Eigener LAN-Zeitserver** mit chrony: `allow 192.168.0.0/24`, optional `local stratum 10`; alle Clients zeigen auf diesen Server → einheitliche Zeit, Internet entlastet.

## Einfach

Ein Computer muss zwei Dinge wissen: **Welche Sprache spreche ich?** und **Wie spät ist es?**

**Die Sprache (Locale)** ist wie eine **Einstellung am Fahrkartenautomaten**: Deutsch oder Englisch, Komma oder Punkt bei Zahlen, „14.06.2026“ oder „06/14/2026“. Die Variable **`LANG`** ist die **Grundeinstellung**, mit den **`LC_…`**-Variablen kann man einzelne Dinge ändern (z. B. nur das Datum). **`LC_ALL`** ist der **Generalschalter**, der alles andere übertrumpft.

**Zeichensätze** sind wie **Geheimschrift-Tabellen**: Jeder Buchstabe bekommt eine Nummer. Die alte Tabelle **ASCII** kennt nur englische Buchstaben – **kein ü**. **ISO-8859-1** hat ein paar Umlaute dazu. **UTF-8** ist die **Welttabelle** mit allen Zeichen aller Sprachen. Wenn eine Datei mit der alten Tabelle geschrieben, aber mit der neuen gelesen wird, wird aus „Müll“ plötzlich „M³ll“. **`iconv`** ist der **Übersetzer** zwischen den Tabellen.

**Zeitzonen**: Der Computer zählt die Zeit innen immer in **Weltzeit (UTC)** – wie ein **Flughafen**, der überall mit derselben Uhr plant. Erst beim **Anzeigen** rechnet er die **Ortszeit** aus (Berlin, New York). Welche Zone gilt, steht in **`/etc/localtime`**.

Ein Computer hat **zwei Uhren**:
- Die **Systemuhr** ist die **Uhr im Kopf** – sie läuft nur, wenn der Computer wach ist (`date`).
- Die **Hardware-Uhr (RTC)** ist eine **Armbanduhr mit Batterie** auf der Hauptplatine – sie läuft auch, wenn der Computer aus ist (`hwclock`). Ist die Batterie leer, weiß der Computer beim Aufwachen nicht mehr, welches Jahr ist – im Ticket dachte er, es sei **2001**!

**NTP** ist wie ein **Funkuhr-Signal**: Der Computer fragt regelmäßig sehr genaue Uhren im Internet und stellt sich **sanft** nach. Ganz oben stehen **Atomuhren** (Stratum 0). **chrony** ist der moderne Dienst, der das erledigt.

Warum ist die richtige Zeit so wichtig? **Ausweise (Zertifikate)** haben ein „gültig ab“-Datum. Glaubt der Computer, es sei 2001, hält er alle Ausweise für **noch nicht gültig** – und keine sichere Verbindung klappt mehr.

## Merksatz
- **LC_ALL schlägt LC_\*, LC_\* schlägt LANG**.
- **LC_ALL=C = stur englisch, stabil für Skripte**.
- **Unicode = welche Zeichen, UTF-8 = wie gespeichert**.
- **iconv -f VON -t NACH**.
- **Innen UTC, außen Zeitzone** · **RTC in UTC**.
- **systohc = System → Hardware, hctosys = Hardware → System**.
- **tzselect findet, timedatectl setzt**.
- **chrony = Dauerlauf, ntpdate = einmal**.

## Prüfungsfalle
- **`tzselect` ändert die Zeitzone nicht dauerhaft** – es zeigt nur den Namen/TZ-Wert.
- **`LC_ALL`** hat die **höchste** Priorität, nicht LANG.
- `/etc/localtime` ist meist ein **Symlink** in `/usr/share/zoneinfo/`, `/etc/timezone` eine **Textdatei** (Debian).
- **`hwclock --systohc`** schreibt **in** die RTC; `--hctosys` liest **aus** der RTC.
- `timedatectl set-time` schlägt fehl, solange **NTP aktiv** ist.
- **ntpdate** ist veraltet und kein Dienst; **ntpq -p** zeigt Peers von ntpd, **chronyc sources** die von chrony.
- **Stratum 0** ist die Referenzuhr selbst, kein Netzwerkserver.
- **ASCII = 7 Bit**, nicht 8 Bit.
- NTP nutzt **UDP 123**.

## Grafik

### Zeichensatz-Problem lösen
1. srv-old03 -> export.csv: schreibt „Müll“ in ISO-8859-1 (ü = 0xFC)
2. export.csv -> Neusystem: liest als UTF-8 – Zeichensalat „M³ll“
3. Admin -> file: export.csv: ISO-8859 text
4. Admin -> iconv: iconv -f ISO-8859-1 -t UTF-8 export.csv > neu.csv
5. iconv -> neu.csv: ü wird zu 0xC3 0xBC
6. Buchhaltung: liest wieder „Müll“

### NTP-Stratum-Hierarchie
1. Atomuhr: Stratum 0 – Referenzuhr
2. Atomuhr -> NTP1: Stratum 1 – direkt angeschlossen
3. NTP1 -> pool.ntp.org: Stratum 2 – öffentlicher Pool
4. pool.ntp.org -> chrony-LAN: interner Zeitserver (allow 192.168.0.0/24)
5. chrony-LAN -> srv-app02: Client korrigiert 4 Minuten sanft
6. chrony-LAN -> srv-old03: Client erhält korrekte Zeit nach Stromausfall

### Boot und Uhren
1. RTC: läuft batteriegepuffert in UTC
2. RTC -> Kernel: hwclock --hctosys beim Start
3. Kernel: Systemuhr in UTC
4. chrony -> Kernel: gleicht mit NTP-Servern ab
5. Kernel -> Anzeige: /etc/localtime rechnet in Europe/Berlin um
6. Kernel -> RTC: hwclock --systohc beim Herunterfahren

## Lab
**Maschinen**: debian01 (Debian/Ubuntu, systemd-timesyncd oder chrony) und rocky01 (Rocky Linux, chrony). Internetzugang für NTP.
```bash
# auf debian01 – Locale
locale; locale -a | head; localectl status
LC_ALL=C date; LC_TIME=en_US.UTF-8 date; date
sudo dpkg-reconfigure locales            # de_DE.UTF-8 erzeugen
printf 'M\xfcll\n' > alt.csv; file alt.csv; cat alt.csv
iconv -f ISO-8859-1 -t UTF-8 alt.csv > neu.csv; file neu.csv; cat neu.csv
iconv -l | grep -i 8859 | head -3

# auf debian01 – Zeitzonen
ls -l /etc/localtime; cat /etc/timezone 2>/dev/null
timedatectl list-timezones | grep -i -E "berlin|new_york"
TZ='America/New_York' date; TZ='Asia/Tokyo' date
sudo timedatectl set-timezone Europe/Berlin
tzselect      # nur nachschlagen

# auf debian01 – Uhren
date; date -u; date +%F_%H-%M-%S
sudo hwclock --show; timedatectl | grep -i rtc
sudo hwclock --systohc
sudo timedatectl set-ntp false; sudo timedatectl set-time "2026-06-14 12:00:00"; sudo timedatectl set-ntp true
timedatectl timesync-status 2>/dev/null | head -5

# auf rocky01 – chrony
sudo dnf install -y chrony; sudo systemctl enable --now chronyd
grep -E "^(pool|server|driftfile|allow)" /etc/chrony.conf
chronyc sources -v; chronyc tracking | head -5
# LAN-Zeitserver: in /etc/chrony.conf "allow 192.168.0.0/24" ergänzen
sudo systemctl restart chronyd; sudo firewall-cmd --add-service=ntp --permanent && sudo firewall-cmd --reload
```

## Befehle
- `locale` – aktuelle Locale-Einstellungen
- `locale -a` – verfügbare Locales
- `localectl set-locale LANG=de_DE.UTF-8` – System-Locale setzen
- `dpkg-reconfigure locales` – Locales erzeugen/auswählen (Debian)
- `LC_ALL=C befehl` – Befehl mit Standard-Locale ausführen
- `file datei` – Zeichenkodierung erkennen
- `iconv -f ISO-8859-1 -t UTF-8 alt > neu` – Zeichensatz umwandeln
- `iconv -l` – unterstützte Kodierungen
- `timedatectl` – Zeit, Zone, RTC und NTP-Status
- `timedatectl set-timezone Europe/Berlin` – Zeitzone dauerhaft setzen
- `timedatectl list-timezones` – alle Zeitzonen
- `timedatectl set-ntp true` – Zeitsynchronisation einschalten
- `timedatectl set-time "2026-06-14 12:00:00"` – Zeit setzen (nur ohne NTP)
- `tzselect` – Zeitzonennamen interaktiv finden
- `TZ='America/New_York' date` – Zeit in anderer Zone anzeigen
- `date -s "2026-06-14 12:00"` – Systemzeit setzen
- `date +%F` – Datum im Format JJJJ-MM-TT
- `hwclock --show` – Hardware-Uhr anzeigen
- `hwclock --systohc` – Systemzeit in die RTC schreiben
- `hwclock --hctosys` – RTC-Zeit in die Systemuhr übernehmen
- `chronyc sources -v` – NTP-Quellen von chrony
- `chronyc tracking` – Synchronisationsgenauigkeit
- `ntpq -p` – Peers von ntpd anzeigen

## Übungen
- A: Welche Variable überschreibt alle Locale-Kategorien? (LANG, LC_TIME, LC_ALL, TZ) | L: LC_ALL – höchste Priorität; LANG ist nur der Standard.
- A: Womit wandelt man ISO-8859-1 nach UTF-8? | L: iconv -f ISO-8859-1 -t UTF-8 datei > neu
- A: Mit welchem Befehl setzt man unter systemd die Zeitzone? | L: timedatectl set-timezone Europe/Berlin (aktualisiert /etc/localtime).
- A: In welcher Zeit sollte die Hardware-Uhr (RTC) laufen? | L: In UTC; die Anzeige rechnet das System über die Zeitzone in Ortszeit um.
- A: Welcher moderne Dienst hält die Zeit synchron? (ntpdate, chrony, iconv, tzselect) | L: chrony (Dienst chronyd); ntpdate setzt nur einmalig.
- A: Welcher hwclock-Aufruf schreibt die Systemzeit in die RTC? | L: hwclock --systohc (Gegenrichtung: --hctosys).
- A: Ein Skript soll unabhängig von der Benutzersprache immer englische, stabile Ausgaben erzeugen. | L: Befehle mit LC_ALL=C ausführen bzw. export LC_ALL=C im Skript.
- A: Zeige die aktuelle Uhrzeit in New York, ohne die Systemzone zu ändern. | L: TZ='America/New_York' date

## Szenario

### Ticket #4771 – „M³ll“ statt „Müll“
Der CSV-Export vom Altsystem srv-old03 zeigt „M³ll“ statt „Müll“. Die neuen Systeme arbeiten mit UTF-8.
- F: Wie stellen Sie die Kodierung der Datei fest? | A: file export.csv → ISO-8859 text
- F: Wie beheben Sie das Problem? | A: iconv -f ISO-8859-1 -t UTF-8 export.csv > export-utf8.csv
- F: Warum ist die Angabe der Quellkodierung so wichtig? | A: Bei falscher Quellkodierung werden die Bytewerte falsch interpretiert und die Umlaute erst recht zerstört.

### Ticket #4773 – US-Kunden
Der Kunde betreut US-Firmen; Support-Zeiten und Log-Zeitstempel geraten durcheinander.
- F: Wie zeigen Sie die New Yorker Zeit, ohne den Server umzustellen? | A: TZ='America/New_York' date
- F: Wie setzen Sie die Serverzone dauerhaft auf Berlin? | A: sudo timedatectl set-timezone Europe/Berlin (Debian alternativ dpkg-reconfigure tzdata)
- F: Warum sollten Server-Logs intern auf UTC basieren? | A: UTC ist eindeutig und ohne Sommerzeitsprünge; Zonen sind nur Anzeige.

### Mittwoch – srv-app02 geht 4 Minuten nach
Die Logs von srv-app02 passen nicht zu denen der anderen Server.
- F: Welche zwei Uhren können falsch gehen? | A: Systemuhr (Kernel, date) und Hardware-Uhr (RTC, hwclock).
- F: Wie beheben Sie die Drift dauerhaft? | A: NTP-Synchronisation mit chrony einrichten (timedatectl set-ntp true bzw. chronyd), chrony korrigiert sanft.
- F: Wie übertragen Sie die korrigierte Systemzeit in die RTC? | A: hwclock --systohc

### Donnerstag – ein Server im Jahr 2001
Nach einem Stromausfall meldet srv-old03 „Sat Jan 6 2001“; curl meldet „certificate is not yet valid“, Backups laufen verrückt.
- F: Was ist die Ursache? | A: Die RTC-Batterie ist leer, die Uhr startet in der Vergangenheit.
- F: Warum scheitert TLS? | A: Zertifikate sind erst ab ihrem Ausstellungsdatum gültig – aus Sicht von 2001 sind sie „noch nicht gültig“.
- F: Was ist die Dauerlösung? | A: Batterie tauschen und NTP (chrony) aktivieren, damit die Zeit nach jedem Start korrigiert wird.

### Freitag – eigener Zeitserver
Alle Server sollen auf dieselbe Uhr schauen.
- F: Wie wird chrony zum LAN-Zeitserver? | A: In /etc/chrony.conf allow 192.168.0.0/24 (optional local stratum 10) ergänzen, chronyd neu starten, UDP 123 in der Firewall öffnen; Clients zeigen per server-Zeile darauf.

## Karteikarten
- F: Wie ist ein Locale-Name aufgebaut? | A: sprache_LAND.Zeichensatz, z. B. de_DE.UTF-8.
- F: Welche Priorität haben LANG, LC_* und LC_ALL? | A: LC_ALL > LC_* > LANG.
- F: Wofür steht LC_ALL=C? | A: Standard-Locale (POSIX) – englische, stabile Ausgabe, z. B. für Skripte.
- F: Wie viele Bit hat ASCII? | A: 7 Bit (128 Zeichen).
- F: Unterschied Unicode und UTF-8? | A: Unicode definiert den Zeichenvorrat, UTF-8 ist eine ASCII-kompatible Kodierung dafür (1–4 Byte).
- F: Wofür steht ISO-8859-1? | A: Latin-1, 8-Bit-Zeichensatz für Westeuropa.
- F: Was ist /etc/localtime? | A: Symlink (oder Kopie) auf die aktive Zeitzonendatei unter /usr/share/zoneinfo/.
- F: Was macht tzselect? | A: Hilft interaktiv, den richtigen Zeitzonennamen zu finden (setzt ihn nicht dauerhaft).
- F: Unterschied Systemuhr und Hardware-Uhr? | A: Systemuhr wird vom Kernel im Betrieb geführt (date); RTC ist batteriegepuffert auf dem Mainboard (hwclock).
- F: Was bedeuten hwclock --systohc und --hctosys? | A: --systohc: Systemzeit → RTC; --hctosys: RTC → Systemzeit.
- F: Was ist Stratum bei NTP? | A: Abstand zur Referenzuhr: 0 = Referenzuhr, 1 = direkt daran, 2 = an Stratum 1 usw.
- F: Welche Konfigurationsdateien haben chrony und ntpd? | A: chrony: /etc/chrony.conf (bzw. /etc/chrony/chrony.conf); ntpd: /etc/ntp.conf.
- F: Wie zeigt man die Zeitquellen von chrony und ntpd? | A: chronyc sources bzw. ntpq -p.
- F: Was ist pool.ntp.org? | A: Ein weltweiter Verbund frei nutzbarer NTP-Server.
- F: Warum ist korrekte Zeit wichtig? | A: Für TLS-Zertifikate, Kerberos, Log-Korrelation und Backups.

## Quiz
? Welche Variable hat die höchste Priorität bei der Locale?
* LC_ALL
- LANG
- LC_TIME
- LANGUAGE

? Welcher Befehl listet alle verfügbaren Locales?
* locale -a
- locale -l
- localectl list-keymaps
- iconv -l

? Wie wandelt man eine Latin-1-Datei nach UTF-8 um?
* iconv -f ISO-8859-1 -t UTF-8 alt.txt > neu.txt
- iconv -t ISO-8859-1 -f UTF-8 alt.txt > neu.txt
- file -c UTF-8 alt.txt
- locale -t UTF-8 alt.txt

? Wohin zeigt /etc/localtime typischerweise?
* Auf eine Datei unter /usr/share/zoneinfo/
- Auf /etc/timezone
- Auf /dev/rtc
- Auf /var/lib/chrony/drift

? Was bewirkt `tzselect`?
* Es hilft, den Zeitzonennamen interaktiv zu finden
- Es setzt die Zeitzone dauerhaft für alle Benutzer
- Es synchronisiert die Zeit per NTP
- Es stellt die Hardware-Uhr

? Welcher Befehl schreibt die Systemzeit in die Hardware-Uhr?
* hwclock --systohc
- hwclock --hctosys
- date --systohc
- timedatectl set-rtc

? In welcher Zeit sollte die RTC auf einem Linux-Server laufen?
* UTC
- Lokale Zeit
- Zeit des NTP-Servers in dessen Zone
- Stratum-Zeit

? Welcher Befehl zeigt die Zeitquellen von chrony?
* chronyc sources
- ntpq -p
- chronyd -l
- timedatectl list-sources

? Was bedeutet Stratum 1 bei NTP?
* Server, der direkt an eine Referenzuhr angeschlossen ist
- Die Atomuhr selbst
- Ein Client ohne eigene Quelle
- Der langsamste Server im Pool

? Warum scheitert TLS, wenn ein Server glaubt, es sei 2001?
* Die Zertifikate sind aus dieser Sicht noch nicht gültig
- TLS benötigt das Jahr 2001
- Die Zeitzone ist falsch eingestellt
- Die Locale ist auf C gesetzt

? Wie viele Zeichen umfasst ASCII?
* 128
- 256
- 65536
- 1.114.112

## Spickzettel
- Locale sprache_LAND.Charset · LANG < LC_* < LC_ALL · LC_ALL=C für Skripte
- locale / locale -a / localectl · dpkg-reconfigure locales
- ASCII 7 Bit · ISO-8859-1 Latin-1 · Unicode = Zeichen · UTF-8 = Kodierung
- file datei · iconv -f VON -t NACH · iconv -l
- /usr/share/zoneinfo · /etc/localtime (Symlink) · /etc/timezone · TZ='Zone' date
- timedatectl set-timezone / set-ntp / set-time · tzselect nur nachschlagen
- date (System) · hwclock (RTC, UTC!) · --systohc / --hctosys
- NTP UDP 123 · Stratum 0 Referenz · pool.ntp.org
- chrony: /etc/chrony.conf, chronyc sources/tracking · ntpd: /etc/ntp.conf, ntpq -p · ntpdate einmalig
