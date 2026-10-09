---
id: linux-l2-14-automatisierung
bereich: Linux
fach: Linux II
pruefungen: [LPIC-1, Schule]
block: L2
kapitel: Linux II – Administration
titel: 1.14 Automatisierung – cron, at, anacron und systemd-Timer
stufe: Fortgeschritten
quellen: [1.14_Linux_-_Automatisierung.pdf, LPI-Learning-Material-102-500-de.pdf]
verweise: [linux-102-107-2-jobs, linux-l1-06-booten, linux-l2-16-logging]
---

## Profi

### Einordnung
**107.2 Aufgaben durch Zeitplanung automatisieren – Gewicht 4**, Kernthema der Prüfung 102. Szenario: Das Backup auf srv-web01 soll täglich um 02:30 Uhr laufen (Ticket #4901).

### cron – wiederkehrende Jobs
- Der Daemon **crond** (Debian: `cron`) prüft **jede Minute**, welche Jobs fällig sind. Kleinster Takt: eine Minute.
- **crontab-Zeile: 5 Zeitfelder + Befehl**: `Minute(0-59) Stunde(0-23) Tag(1-31) Monat(1-12) Wochentag(0-7, 0 und 7 = Sonntag)`.
- `*` = jeder Wert, `,` = Liste (`1,15`), `-` = Bereich (`1-5`), `/` = Schritt (`*/15` = alle 15).
- Beispiele: `30 2 * * * /usr/local/bin/backup.sh` (täglich 02:30), `*/15 * * * *` (alle 15 Min.), `0 9 * * 1-5` (Mo–Fr 9:00), `0 0 1 * *` (am Ersten).
- Spezial-Strings: `@reboot`, `@hourly`, `@daily`/`@midnight`, `@weekly`, `@monthly`, `@yearly`.
- Klassiker-Falle: **`15 * * * *`** läuft nur zur Minute 15 jeder Stunde, nicht „alle 15 Minuten“.

### User- und System-crontab
| Ort | Besonderheit |
|---|---|
| User-crontab (`crontab -e`) | gespeichert in `/var/spool/cron/` (Debian: `.../crontabs/`), **nicht von Hand editieren**, **kein Benutzerfeld** |
| `/etc/crontab` | **6. Feld = ausführender Benutzer** vor dem Befehl |
| `/etc/cron.d/` | Pakete-Jobs, gleiches Format wie `/etc/crontab` (mit Benutzerfeld) |
| `/etc/cron.hourly|daily|weekly|monthly/` | ausführbare Skripte, gestartet per **run-parts**; Dateinamen mit **Punkt** (z. B. `backup.sh`) werden **ignoriert** |
- `crontab -e` bearbeiten, `-l` anzeigen, `-r` **löschen (ohne Rückfrage)**, `-u user` (nur root).
- cron nutzt eine **minimale Umgebung** (kurzer PATH, `sh`): immer **absolute Pfade** verwenden; Ausgabe wird per Mail an den Besitzer geschickt (oder mit `>> log 2>&1` umleiten).

### at, batch und anacron
- **at** = genau **einmal**: `at 22:00`, `at now + 1 hour`, Befehle eingeben, beenden mit **Strg+D**. `atq` listet, `atrm N` löscht, **batch** startet, wenn die Last niedrig ist. Dienst: `atd`.
- **anacron** holt **verpasste Jobs** nach (Laptops/Desktops, die nachts aus sind). Arbeitet in **Tagesintervallen**; Konfiguration `/etc/anacrontab`: `Periode(Tage) Verzögerung(Min.) Job-ID Befehl`.

### Zugriffssteuerung
- `/etc/cron.allow` und `/etc/cron.deny` (analog `/etc/at.allow`, `at.deny`). **Existiert allow, dürfen nur dort Genannte**; deny wird dann ignoriert. Existiert nur deny, sind alle außer den dort Genannten erlaubt. Existiert **keine** Datei: bei cron meist alle, bei at nur root. root darf immer.

### systemd-Timer – moderner Ersatz
- Zwei Units: `backup.timer` (Wann?) und `backup.service` (Was?). Aktivieren: `systemctl enable --now backup.timer`; Übersicht: **`systemctl list-timers --all`**.
- `OnCalendar=*-*-* 02:30:00` (Kalender, auch `daily`, `Mon..Fri 09:00`), `OnBootSec=`/`OnUnitActiveSec=` (relativ/monoton), **`Persistent=true`** holt verpasste Läufe nach (wie anacron), `RandomizedDelaySec=`.
- Vorteile: Logging im **Journal**, Abhängigkeiten, Ressourcenlimits. Kalenderausdruck testen: `systemd-analyze calendar "Mon *-*-* 02:30"`.

### Praxis
- Jobs idempotent halten, **Locking** (`flock`), Logging, **Monitoring** (ein stilles Backup ist gefährlich), Berechtigungen und `chmod +x` prüfen, Zeitzone beachten.

## Einfach

Stell dir einen **Wecker für Computer** vor. Du sagst ihm einmal: „Jeden Tag um halb drei nachts mach die Datensicherung“ – und er tut es, auch wenn du schläfst. Dieser Wecker heißt **cron**. Er schaut **jede Minute** auf die Uhr und fragt: „Ist jetzt etwas dran?“

Ein Eintrag sieht aus wie ein Zettel mit **fünf Kästchen** und dem Auftrag: **Minute – Stunde – Tag – Monat – Wochentag**. Ein Stern `*` heißt „egal, immer“. `30 2 * * *` bedeutet also: Minute 30, Stunde 2, jeden Tag, jeden Monat, jeden Wochentag. `*/15` heißt „alle 15“. Vorsicht: `15 * * * *` heißt nur „zur Minute 15“ – das ist nicht „alle 15 Minuten“.

Möchtest du etwas **nur ein einziges Mal** erledigen lassen (z. B. heute um 22 Uhr), nimmst du **at** – wie einen Wecker, der nur einmal klingelt. Ist der Rechner um Mitternacht ausgeschaltet, verpasst cron seinen Auftrag. Dafür gibt es **anacron**: Es holt die Aufgabe nach, sobald der Rechner wieder an ist.

Neuere Systeme haben noch einen zweiten, schlaueren Wecker: den **systemd-Timer**. Er besteht aus zwei Zetteln: einem für das **Wann** (`.timer`) und einem für das **Was** (`.service`). Er schreibt alles ins Tagebuch (Journal) und kann Verpasstes nachholen (`Persistent=true`).

Und wer darf Wecker stellen? Das regeln zwei Listen: die **Erlaubt-Liste** (`cron.allow`) und die **Verboten-Liste** (`cron.deny`). Gibt es die Erlaubt-Liste, gilt nur sie.

## Merksatz
- **Min – Std – Tag – Mon – WTag**: „Man sollte tatsächlich mehr wissen.“
- **`*/15` = alle 15, `15` = nur bei 15.**
- **cron wiederholt, at einmal, anacron holt nach.**
- **allow schlägt deny.**
- **/etc/crontab und cron.d haben ein Benutzerfeld, die User-crontab nicht.**
- **Punkt im Dateinamen = run-parts ignoriert das Skript.**

## Prüfungsfalle
- `15 * * * *` ist **nicht** „alle 15 Minuten“ (richtig: `*/15 * * * *`).
- `crontab -r` löscht **sofort und ohne Rückfrage**, `-l` zeigt nur an.
- Nur `/etc/crontab` und `/etc/cron.d/*` haben das **Benutzerfeld**.
- In `/etc/cron.daily/` heißt ein Skript **`backup`**, nicht `backup.sh` (run-parts überspringt Namen mit Punkt).
- Existiert `cron.allow`, wird `cron.deny` **nicht** ausgewertet.
- Wochentag: **0 und 7 = Sonntag**.
- Ohne `Persistent=true` holt ein Timer verpasste Läufe nicht nach.
- cron kennt keine Sekunden; kleinster Takt ist 1 Minute.

## Grafik

### cron-Eintrag lesen
1. Benutzer -> crontab: crontab -e, Zeile 30 2 * * * backup.sh
2. crontab: Zeile wird in /var/spool/cron/crontabs/ gespeichert
3. crond: prüft jede Minute alle Tabellen
4. crond -> backup.sh: 02:30 Uhr – Job startet
5. backup.sh -> Mail: Ausgabe geht per Mail an den Besitzer

### systemd-Timer
1. backup.timer: OnCalendar=*-*-* 02:30:00, Persistent=true
2. backup.timer -> backup.service: Zeitpunkt erreicht, Service wird gestartet
3. backup.service -> Journal: Ausgabe wird protokolliert
4. backup.timer: Rechner war aus? Lauf wird beim Start nachgeholt

## Lab
**Maschine**: srv-web01 (Debian 12), Benutzer anna mit sudo. Skriptpfad `/usr/local/bin/backup.sh`.
```bash
# auf srv-web01 – cron
crontab -e                     # Zeile: 30 2 * * * /usr/local/bin/backup.sh >> /var/log/backup.log 2>&1
crontab -l
sudo systemctl status cron

# auf srv-web01 – einmaliger Job
at 22:00
#   at> /usr/local/bin/cache-clear.sh   (Strg+D)
atq
atrm 3

# auf srv-web01 – Zugriff nur für anna und ben
echo -e "anna\nben" | sudo tee /etc/cron.allow

# auf srv-web01 – systemd-Timer
sudo tee /etc/systemd/system/backup.service <<'X'
[Unit]
Description=Backup
[Service]
Type=oneshot
ExecStart=/usr/local/bin/backup.sh
X
sudo tee /etc/systemd/system/backup.timer <<'X'
[Unit]
Description=Backup taeglich 02:30
[Timer]
OnCalendar=*-*-* 02:30:00
Persistent=true
[Install]
WantedBy=timers.target
X
sudo systemctl daemon-reload
sudo systemctl enable --now backup.timer
systemctl list-timers --all | head -5
systemd-analyze calendar "*-*-* 02:30:00"
```

## Befehle
- `crontab -e` – eigene crontab bearbeiten
- `crontab -l` – crontab anzeigen
- `crontab -r` – crontab löschen
- `crontab -u user -l` – crontab eines Benutzers (root)
- `at 22:00` – Job einmalig planen
- `atq` – wartende at-Jobs
- `atrm N` – at-Job löschen
- `batch` – Job bei niedriger Last
- `systemctl list-timers --all` – Timer anzeigen
- `systemd-analyze calendar "..."` – Kalenderausdruck prüfen
- `run-parts /etc/cron.daily` – Verzeichnis-Skripte ausführen

## Übungen
- A: Schreibe die crontab-Zeile für täglich 02:30 Uhr. | L: 30 2 * * * /usr/local/bin/backup.sh
- A: Wie läuft ein Job alle 15 Minuten? | L: */15 * * * * befehl
- A: Job Mo–Fr um 09:00 Uhr? | L: 0 9 * * 1-5 befehl
- A: Welche Datei erlaubt nur anna und ben die Nutzung von cron? | L: /etc/cron.allow mit je einem Namen pro Zeile.
- A: Wie plant man heute 22:00 einen einmaligen Job? | L: at 22:00, Befehle eingeben, Strg+D.
- A: Welche Direktive holt verpasste Timer-Läufe nach? | L: Persistent=true
- A: Warum läuft /etc/cron.daily/backup.sh nicht? | L: run-parts ignoriert Dateinamen mit Punkt; Skript ohne Endung benennen und ausführbar machen.

## Karteikarten
- F: Aus welchen Feldern besteht eine crontab-Zeile? | A: Minute, Stunde, Tag des Monats, Monat, Wochentag, Befehl.
- F: Was bedeutet */15 im Minutenfeld? | A: Alle 15 Minuten.
- F: Welches Feld hat /etc/crontab zusätzlich? | A: Den ausführenden Benutzer vor dem Befehl.
- F: Was macht crontab -r? | A: Löscht die crontab sofort und ohne Rückfrage.
- F: Wofür ist at gedacht? | A: Für Jobs, die genau einmal zu einem bestimmten Zeitpunkt laufen.
- F: Wofür ist anacron da? | A: Es holt verpasste Jobs nach, z. B. auf Laptops, die zur Jobzeit aus waren.
- F: Welche Datei hat Vorrang: cron.allow oder cron.deny? | A: cron.allow; wenn sie existiert, wird cron.deny nicht ausgewertet.
- F: Wie zeigt man alle systemd-Timer an? | A: systemctl list-timers --all
- F: Welche zwei Units gehören zu einem systemd-Timer? | A: Eine .timer-Unit (Wann) und eine .service-Unit (Was).
- F: Was bedeutet @reboot? | A: Einmal beim Systemstart ausführen.
- F: Welcher Wochentagswert steht für Sonntag? | A: 0 und 7.

## Quiz
? Wie ist die Reihenfolge der fünf crontab-Zeitfelder?
* Minute, Stunde, Tag, Monat, Wochentag
- Stunde, Minute, Tag, Monat, Wochentag
- Minute, Stunde, Monat, Tag, Wochentag
- Sekunde, Minute, Stunde, Tag, Monat

? Welche Zeile führt einen Job alle 15 Minuten aus?
* */15 * * * * befehl
- 15 * * * * befehl
- 0 15 * * * befehl
- * * 15 * * befehl

? Womit bearbeitet man die eigene crontab?
* crontab -e
- crontab -l
- crontab -r
- at -e

? Welcher Befehl löscht die eigene crontab ohne Rückfrage?
* crontab -r
- crontab -d
- crontab -x
- crontab -l

? Welche Besonderheit hat /etc/crontab?
* Ein zusätzliches Feld für den ausführenden Benutzer
- Es kennt Sekunden
- Es ist nur für root lesbar
- Es hat nur vier Felder

? Wozu dient anacron?
* Verpasste periodische Jobs nach dem Einschalten nachholen
- Jobs sekundengenau ausführen
- Einmalige Jobs planen
- Jobs auf mehrere Server verteilen

? Wie beendet man die Eingabe bei at?
* Strg+D
- Strg+C
- Strg+Z
- :wq

? Welche Option macht einen systemd-Timer nachholend?
* Persistent=true
- RemainAfterExit=yes
- Restart=always
- WantedBy=timers.target

? Was passiert, wenn /etc/cron.allow existiert?
* Nur dort genannte Benutzer dürfen cron nutzen
- Alle außer den genannten dürfen cron nutzen
- cron.deny hat Vorrang
- cron wird deaktiviert

? Warum wird /etc/cron.daily/backup.sh nicht ausgeführt?
* run-parts ignoriert Dateinamen mit Punkt
- Weil .sh verboten ist
- Weil cron.daily nur root-Dateien kennt
- Weil die Datei zu groß ist

## Lücken
- Die crontab-Zeile {30 2 * * *} startet täglich um 02:30 Uhr.
- Einmalige Jobs plant man mit {at}, verpasste periodische Jobs holt {anacron} nach.
- Ein systemd-Timer braucht zusätzlich eine {.service}-Unit.

## Spickzettel
- Min Std Tag Mon WTag Befehl · * , - /
- */15 = alle 15 · 15 = nur Minute 15
- crontab -e / -l / -r (ohne Rückfrage)
- /etc/crontab + cron.d: Benutzerfeld
- cron.daily: kein Punkt im Namen
- at / atq / atrm / batch · anacron: /etc/anacrontab
- allow gewinnt gegen deny
- Timer: OnCalendar, Persistent=true, list-timers
