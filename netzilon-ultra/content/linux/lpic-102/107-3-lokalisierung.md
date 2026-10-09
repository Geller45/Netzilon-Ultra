---
id: linux-102-107-3-lokalisierung
bereich: Linux
fach: Linux II
pruefungen: [LPIC-1]
block: LPIC-102
kapitel: LPIC-1 Prüfung 102 – Administrative Aufgaben
titel: 107.3 Lokalisierung und Internationalisierung (Locale, Zeichensätze, Zeitzone)
stufe: Fortgeschritten
quellen: [LPI-Learning-Material-102-500-de.pdf, 1.12_Linux_-_Lokalisierung_und_Systemzeit_Szenario.pdf]
verweise: [linux-l2-12-lokalisierung, linux-102-108-1-systemzeit]
---

## Profi

### Lernziel (Gewicht 3)
Locale, Zeichencodierungen, Tastaturlayout und Zeitzone einstellen.

### Locale
- Format `sprache_LAND.CODIERUNG`, z. B. `de_DE.UTF-8`, `en_US.UTF-8`, `C`/`POSIX` (Minimal-Locale, bytebasiert, Sortierung ASCII). Anzeige `locale`, `locale -a`; erzeugen `locale-gen` (Debian: `/etc/locale.gen`, `dpkg-reconfigure locales`), `localectl set-locale LANG=de_DE.UTF-8`, `localectl status`. Datei: `/etc/locale.conf` (RHEL/systemd) bzw. `/etc/default/locale` (Debian).
- **Variablen**: `LANG` (Standard), `LC_ALL` (überschreibt **alles**), und Kategorien `LC_CTYPE`, `LC_COLLATE` (Sortierung), `LC_TIME`, `LC_NUMERIC`, `LC_MONETARY`, `LC_MESSAGES`, `LC_PAPER`. Priorität: **`LC_ALL` > `LC_*` > `LANG`**. `LANGUAGE` für Rückfallsprachen (gettext).

### Zeichensätze
- **ASCII** (7 Bit), **ISO-8859-1 (Latin-1)**, **ISO-8859-15** (mit €), **UTF-8** (Unicode, variable Länge 1–4 Byte, ASCII-kompatibel). Umwandeln: `iconv -f ISO-8859-1 -t UTF-8 datei`, Test `file -i`, `recode`.

### Tastatur und Zeitzone
- Konsolen-Layout: `localectl set-keymap de`, `loadkeys de`, `/etc/default/keyboard`; X11: `setxkbmap de`.
- Zeitzone: `timedatectl set-timezone Europe/Berlin`, `/etc/localtime` (Link auf `/usr/share/zoneinfo/Europe/Berlin`), `/etc/timezone` (Debian), Variable **`TZ`** pro Prozess, `tzselect`.

## Einfach

Computer sprechen nicht automatisch Deutsch. Damit Datum, Zahlen, Sortierung und Meldungen so aussehen, wie du es gewohnt bist, gibt es die **Locale** („Ortseinstellung“). Sie hat einen Namen wie `de_DE.UTF-8`: **de** = Sprache Deutsch, **DE** = Land Deutschland, **UTF-8** = welche Buchstabentabelle benutzt wird.

Warum zwei Teile? Weil Länder verschieden sind: In Deutschland schreibt man 1.234,56 – in den USA 1,234.56. Mit der Locale weiß der Computer das.

Die Locale hat viele **Schalter**, die alle mit `LC_` beginnen (für Zeit, Zahlen, Sortierung, Meldungen …). Und einen **Hauptschalter** `LANG`, der alle auf einmal einstellt. Aber es gibt noch den **Chef-Schalter** `LC_ALL`: Wenn er gesetzt ist, überstimmt er alle anderen. Die Reihenfolge merkst du dir so: **LC_ALL schlägt LC_… schlägt LANG.**

Die Buchstabentabelle ist wichtig: In alten Tabellen (Latin-1) ist „ä“ ein Byte, in UTF-8 sind es zwei. Mit `iconv` wandelst du Dateien von einer Tabelle in die andere um. Heute nimmt man fast immer **UTF-8**.

Die **Zeitzone** stellst du mit `timedatectl set-timezone Europe/Berlin` ein. Der Computer speichert die Zeit intern in UTC und rechnet für die Anzeige in deine Ortszeit um.

## Merksatz
- **de_DE.UTF-8 = Sprache_Land.Zeichensatz.**
- **LC_ALL > LC_* > LANG.**
- **locale -a zeigt installierte, locale-gen erzeugt neue.**
- **iconv wandelt Zeichensätze.**
- **timedatectl für Zeitzone, localectl für Locale/Keymap.**
- **C/POSIX = neutral.**

## Prüfungsfalle
- `LC_ALL` überstimmt **alle** anderen Variablen.
- Eine Locale muss **erzeugt/installiert** sein (`locale-gen`), sonst greift sie nicht.
- UTF-8 ist **kein** fester 2-Byte-Zeichensatz, sondern variabel.
- `/etc/localtime` ist ein Link auf eine Datei in `/usr/share/zoneinfo`.
- `TZ` gilt nur für den Prozess/die Sitzung.
- `LANG=C` sortiert nach Bytewerten (Großbuchstaben vor Kleinbuchstaben).

## Grafik

### Locale-Auflösung
1. Programm -> Umgebung: fragt LC_COLLATE
2. Umgebung: ist LC_ALL gesetzt? Dann gilt LC_ALL
3. Umgebung: sonst LC_COLLATE selbst
4. Umgebung: sonst LANG
5. Umgebung -> Programm: Ergebnis z. B. de_DE.UTF-8

## Lab
**Maschine**: debian01.
```bash
# auf debian01
locale; locale -a
sudo dpkg-reconfigure locales        # de_DE.UTF-8 aktivieren
sudo localectl set-locale LANG=de_DE.UTF-8
LC_ALL=C date; LC_ALL=de_DE.UTF-8 date
echo "Äpfel" | iconv -f UTF-8 -t ISO-8859-1 | xxd
timedatectl; sudo timedatectl set-timezone Europe/Berlin
ls -l /etc/localtime
```

## Befehle
- `locale` – aktuelle Einstellungen
- `locale -a` – installierte Locales
- `localectl set-locale LANG=…` – Standardlocale
- `locale-gen` – Locales erzeugen
- `iconv -f A -t B datei` – Zeichensatz wandeln
- `timedatectl set-timezone Zone` – Zeitzone
- `localectl set-keymap de` – Tastatur

## Übungen
- A: Welche Variable überstimmt alle anderen LC_-Variablen? | L: LC_ALL
- A: Wie wandelst du datei.txt von ISO-8859-1 nach UTF-8? | L: iconv -f ISO-8859-1 -t UTF-8 datei.txt
- A: Wie setzt du die Zeitzone auf Berlin? | L: timedatectl set-timezone Europe/Berlin
- A: Wo steht die Zeitzonen-Datenbank? | L: /usr/share/zoneinfo
- A: Was bedeutet de_DE.UTF-8? | L: Deutsch, Deutschland, UTF-8-Zeichensatz.

## Karteikarten
- F: Welche Kategorie steuert die Sortierung? | A: LC_COLLATE
- F: Was ist die Locale C? | A: Neutrale POSIX-Locale (ASCII, englisch).
- F: Wie viele Bytes hat ein UTF-8-Zeichen? | A: 1 bis 4.
- F: Welcher Befehl wandelt Zeichensätze? | A: iconv
- F: Was ist /etc/localtime? | A: Link auf die Zeitzonendatei in /usr/share/zoneinfo.
- F: Welche Variable setzt die Zeitzone pro Prozess? | A: TZ
- F: Was zeigt locale -a? | A: Alle auf dem System verfügbaren Locales.
- F: Welcher Zeichensatz enthält das Eurozeichen (Latin)? | A: ISO-8859-15.
- F: Was macht localectl? | A: Verwaltet Locale und Tastatur-Layout (systemd).

## Quiz
? Welche Variable hat die höchste Priorität?
* LC_ALL
- LANG
- LC_TIME
- LANGUAGE

? Was bedeutet UTF-8?
* Unicode-Codierung mit variabler Länge
- 7-Bit-Zeichensatz
- Latin-1
- 16-Bit-Zeichensatz

? Welcher Befehl wandelt Zeichensätze?
* iconv
- recode -x
- tr
- chcs

? Wohin zeigt /etc/localtime?
* /usr/share/zoneinfo/…
- /etc/timezone
- /var/lib/tz
- /proc/time

? Welche Kategorie steuert Datum und Uhrzeit?
* LC_TIME
- LC_CTYPE
- LC_PAPER
- LC_MESSAGES

? Was bewirkt locale-gen?
* Erzeugt Locales
- Löscht Locales
- Setzt Zeitzone
- Ändert Passwort

? Mit welchem Befehl setzt man die Zeitzone (systemd)?
* timedatectl set-timezone
- localectl set-tz
- tzctl
- date -z

? Was ist ISO-8859-1?
* Ein 8-Bit-Zeichensatz (Latin-1)
- Eine Zeitzone
- Ein Dateisystem
- Ein Tastaturlayout

## Spickzettel
- sprache_LAND.CODIERUNG · locale · locale -a · locale-gen
- LC_ALL > LC_* > LANG · C/POSIX
- UTF-8 variabel · Latin-1 · iconv
- timedatectl · /etc/localtime · TZ · localectl
