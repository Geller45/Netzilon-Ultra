---
id: ihk-lz-linux-rechte
bereich: Prüfung
block: IHK
kapitel: Lernzettel-Inhalte
titel: Linux-Grundlagen und Dateiberechtigungen für die Prüfung
stufe: Einsteiger
fach: PV – AP1
pruefungen: [AP1, AP2]
quellen: [Linux Grundlagen & Berechtigungen.docx, Linux Grundlagen & Berechtigungen.pdf, Lernzettel_AP1AP2_2024.pdf, Ergänzung Lernzettel.docx]
verweise: [ihk-lernzettel-guide, ihk-lz-sicherheit, ihk-fehleranalyse]
---

## Profi

### Berechtigungen
Drei Benutzerklassen: **Owner (user, u)**, **Group (g)**, **Other (o)**; drei Rechte: **r** (read, 4), **w** (write, 2), **x** (execute, 1). Ausgabe `ls -la`: `-rw-rw-r-- 1 anna dev 1204 … datei.txt` → Typ-Zeichen + 3×3 Rechte. Typ: `-` Datei, `d` Verzeichnis, `l` symbolischer Link.
**Oktal**: Ziffer = Summe der Rechte. `chmod 664 datei` → Owner rw- (6), Group rw- (6), Other r-- (4). `chmod 755` = rwxr-xr-x (Skripte/Verzeichnisse), `chmod 600` = rw------- (privat), `chmod 644` = rw-r--r--. **Symbolisch**: `chmod u+x datei`, `chmod g-w datei`, `chmod o=r datei`, `chmod a+r datei`.
Eigentümer ändern: `chown anna:dev datei`, Gruppe: `chgrp dev datei`. Bei Verzeichnissen bedeutet **x** „betreten“, **r** „Inhalt auflisten“, **w** „Dateien anlegen/löschen“.

### Befehle
| Befehl | Zweck |
|---|---|
| `ls -la` | Langformat, versteckte Dateien, Rechte |
| `chmod` | Rechte ändern |
| `ping -c 4 <Ziel>` | Erreichbarkeit (unter Linux `-c` begrenzt Pakete; Windows `-n`) |
| `telnet <ip> <port>` | Portprüfung (z. B. 80 für HTTP); alternativ `nc -zv` |
| `cp`, `mv`, `rm` | Kopieren, Verschieben, Löschen (Wildcards `*` beliebig viele Zeichen, `?` genau ein Zeichen) |
| `cat`, `less`, `grep` | Anzeigen, Suchen |
| `sudo` | Befehl mit Root-Rechten |
(Windows-Pendant `copy`, `dir`, `ipconfig`.)

### Fehleranalyse und Härtung
„Keine Berechtigung“ (Permission denied): fehlendes r/w/x → Rechte per `chmod` oder Eigentümer per `chown` anpassen. Ping ok, Dienst reagiert nicht → `telnet ip 80/443`. **Härtung**: unnötige Dienste deaktivieren, Defaults ändern, Secure Boot und TPM 2.0, regelmäßige Updates, Least Privilege, SSH-Key statt Passwort.

## Einfach

Unter Linux hat jede Datei ein **Schloss mit drei Fächern**: für den Besitzer, für seine Gruppe und für alle anderen. In jedem Fach gibt es drei Schalter:
- **r** = lesen (darf ich reinschauen?)
- **w** = schreiben (darf ich ändern?)
- **x** = ausführen (darf ich das Programm starten?)

`ls -la` zeigt zum Beispiel `-rw-rw-r--`. Das erste Zeichen sagt, was es ist: `-` Datei, `d` Ordner, `l` Verknüpfung. Danach folgen drei Dreiergruppen: `rw-` für den Besitzer, `rw-` für die Gruppe, `r--` für alle anderen.

**Zahlen-Trick:** r = 4, w = 2, x = 1. Zählt man zusammen: rw- = 4 + 2 = 6, r-- = 4, rwx = 7. Der Befehl `chmod 664` heißt: Besitzer 6, Gruppe 6, Andere 4. Das ist wie ein Geheimcode für die drei Schlösser.

Beispiele:
- 644: Besitzer darf lesen und schreiben, alle anderen nur lesen (normale Dateien).
- 755: Besitzer darf alles, alle anderen dürfen lesen und starten (Programme, Ordner).
- 600: Nur der Besitzer, sonst niemand (private Schlüssel).

**Wildcards:** `*` ist ein Joker für beliebig viele Zeichen (`*.txt` = alle Textdateien), `?` ist ein Joker für genau ein Zeichen (`datei?.txt` passt auf datei1.txt).

**Fehler „Permission denied“:** Dir fehlt ein Schalter. Entweder der Besitzer ändert die Rechte (`chmod`) oder der Besitzer wird gewechselt (`chown`).

**Dienst prüfen:** `ping` fragt „bist du da?“. Läuft die Webseite nicht, probiere `telnet adresse 80`: Wenn eine Verbindung entsteht, lauscht der Webserver.

## Merksatz
- r 4, w 2, x 1.
- 664 = rw-rw-r--, 755 = rwxr-xr-x, 600 = rw-------.
- `-` Datei, `d` Ordner, `l` Link.
- Ping geht, Dienst nicht: Port testen.

## Prüfungsfalle
- Reihenfolge der Ziffern: Owner, Group, Other.
- Verzeichnisse brauchen **x** zum Betreten.
- `ping -c 4` unter Linux, nicht `-n`.
- `*` nicht mit `?` vertauschen.
- Dateityp-Zeichen gehört nicht zu den neun Rechtebits.

## Grafik
### chmod 664
1. Admin -> Datei: chmod 664 bericht.txt
2. Datei: Owner = 6 = 4 + 2 = rw-
3. Datei: Group = 6 = 4 + 2 = rw-
4. Datei: Other = 4 = r--
5. Datei: Ergebnis -rw-rw-r--

## Spickzettel
- r4 w2 x1; Owner Group Other
- 664 rw-rw-r--; 755 rwxr-xr-x; 600 rw-------
- ls -la: - Datei, d Verzeichnis, l Link
- ping -c 4; telnet ip port
- * viele, ? genau eins
- Härtung: Dienste aus, Defaults ändern, Secure Boot/TPM

## Übungen
- A: Welche Rechte hat die Datei nach chmod 640? | L: Owner rw- (6), Group r-- (4), Other --- (0)
- A: Setze rwxr-x--- als Oktalzahl. | L: 750
- A: Wie macht man ein Skript für den Besitzer ausführbar? | L: chmod u+x skript.sh

## Karteikarten
- F: Wert von r, w, x? | A: 4, 2, 1
- F: Was bedeutet chmod 664? | A: Owner rw, Group rw, Other r
- F: Was bedeutet 755? | A: rwxr-xr-x
- F: Erstes Zeichen bei ls -la? | A: Dateityp: - Datei, d Verzeichnis, l Link
- F: Befehl für die Eigentümer-Änderung? | A: chown
- F: Wildcard * ? | A: Null oder mehr beliebige Zeichen
- F: Wildcard ? ? | A: Genau ein beliebiges Zeichen
- F: Port 80 testen? | A: telnet <ip> 80
- F: Ping unter Linux begrenzen? | A: ping -c 4 <ziel>
- F: Was heißt „Permission denied“? | A: Fehlende Berechtigung für Datei oder Verzeichnis
- F: Recht x bei Verzeichnissen? | A: Verzeichnis betreten

## Quiz
? Welche Zahl entspricht rw-?
* 6
- 5
- 4
- 7

? Was bedeutet chmod 664?
* Owner rw, Group rw, Other r
- Owner rwx, Group rwx, Other rwx
- Owner r, Group rw, Other rw
- Owner rw, Group r, Other r

? Welches Zeichen kennzeichnet ein Verzeichnis in ls -la?
* d
- -
- l
- x

? Wie lautet der Befehl für Linux-Ping mit 4 Paketen?
* ping -c 4 ziel
- ping -n 4 ziel
- ping /t ziel
- ping 4 ziel

? Wofür steht der Platzhalter ?
* Genau ein beliebiges Zeichen
- Beliebig viele Zeichen
- Ein Verzeichnis
- Das Ende der Datei

? Wie testet man, ob Port 80 offen ist?
* telnet <ip> 80
- ls -la
- chmod 80
- cat 80

? Was bedeutet 755?
* rwxr-xr-x
- rw-r--r--
- rwx------
- rwxrwxrwx

? Welche Maßnahme gehört zur Linux-Härtung?
* Nicht benötigte Dienste deaktivieren
- Alle Ports öffnen
- Standardpasswörter belassen
- Root-Login für alle erlauben
