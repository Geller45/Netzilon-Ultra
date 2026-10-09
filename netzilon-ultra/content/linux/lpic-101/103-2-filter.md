---
id: linux-101-103-2-filter
bereich: Linux
fach: Linux I
pruefungen: [LPIC-1]
block: LPIC-101
kapitel: LPIC-1 Prüfung 101 – GNU- und Unix-Befehle
titel: 103.2 Textströme mit Filtern verarbeiten
stufe: Einsteiger
quellen: [LPI-Learning-Material-101-500-de.pdf, 1.02_Linux_-_Kommandozeile_und_Textstroeme.pdf]
verweise: [linux-l1-02-textstroeme, linux-101-103-4-pipes, linux-101-103-7-regex]
---

## Profi

### Lernziel (Gewicht 3)
Textfilter auf Datenströme anwenden: Dateien anzeigen, zählen, sortieren, zerlegen, zusammenführen, transformieren.

### Anzeigen
`cat` (`-n` Zeilennummern, `-A` Sonderzeichen), `tac` (rückwärts), `less`, `more`, `head -n 5`, `tail -n 5`, **`tail -f`** (Datei live verfolgen), `nl` (Zeilen nummerieren), `od`/`hexdump`/`xxd` (hex), `wc` (`-l` Zeilen, `-w` Wörter, `-c` Bytes), `sort`, `uniq`.

### Sortieren, Duplikate
- `sort` (`-n` numerisch, `-r` umgekehrt, `-k2` Feld, `-t:` Trenner, `-u` eindeutig, `-h` menschenlesbar), `uniq` (entfernt **nur aufeinanderfolgende** Duplikate, daher meist `sort | uniq`; `-c` zählt, `-d` nur doppelte).

### Zerlegen und Verbinden
- `cut -d: -f1,3` (Felder), `cut -c1-5` (Zeichen), `paste` (Dateien spaltenweise), `join` (nach Schlüssel), `split -l 1000 datei praefix`, `tr 'a-z' 'A-Z'` (Zeichen ersetzen/`-d` löschen/`-s` zusammenfassen), `fmt`, `pr`, `expand`/`unexpand` (Tab ↔ Leerzeichen).

### Prüfsummen und Kompaktes
- `md5sum`, `sha256sum` (`-c` prüft), `sed 's/alt/neu/g'` (Stream-Editor), `sed -n '2,4p'`, `awk` (einfach: `awk -F: '{print $1}'`), `grep` (siehe 103.7).
- Dateien: Standard: Textdateien, in denen jede Zeile ein Datensatz ist, Felder durch Trenner getrennt (z. B. `/etc/passwd`, `:`).

## Einfach

Stell dir einen Text wie eine **Fließbandstrecke** vor: Die Wörter fahren vorbei, und an jeder Station macht jemand etwas damit. Diese Stationen heißen **Filter**.

- **`cat`** legt das ganze Papier auf den Tisch, **`head`** zeigt nur die ersten Zeilen, **`tail`** die letzten. Mit **`tail -f`** schaust du live zu, wie eine Logdatei wächst.
- **`wc`** ist der Zähler: Wie viele Zeilen (`-l`), Wörter (`-w`), Zeichen?
- **`sort`** bringt alles in Ordnung (alphabetisch oder mit `-n` nach Zahlen). **`uniq`** wirft doppelte Zeilen raus, aber nur wenn sie **direkt hintereinander** stehen – darum sortierst du vorher.
- **`cut`** ist die Schere: Aus einer Tabelle schneidest du eine Spalte heraus (`cut -d: -f1 /etc/passwd` zeigt alle Benutzernamen).
- **`tr`** tauscht Buchstaben aus, **`sed`** ist „Suchen und Ersetzen“, **`paste`** klebt Spalten nebeneinander, **`join`** verbindet zwei Tabellen über eine gemeinsame Spalte.
- **`md5sum`** und **`sha256sum`** bilden aus einer Datei einen Fingerabdruck. Ändert sich nur ein Zeichen, ändert sich der Fingerabdruck – so prüfst du, ob ein Download unverändert ist.

Das Schöne: Du kannst diese Stationen mit dem senkrechten Strich `|` hintereinanderschalten (mehr in 103.4).

## Merksatz
- **head vorn, tail hinten, tail -f live.**
- **uniq nur nach sort.**
- **cut -d: -f1 = erste Spalte mit Trenner Doppelpunkt.**
- **wc -l zählt Zeilen.**
- **tr ersetzt Zeichen, sed ersetzt Text.**
- **sha256sum = Fingerabdruck.**

## Prüfungsfalle
- `uniq` entfernt nur **benachbarte** Duplikate.
- `sort -n` für Zahlen (sonst ist 10 < 2).
- `cut` braucht `-d` für Trenner (Standard ist Tab).
- `tr` liest nur von **stdin**, nicht aus Dateien als Argument (`tr a b < datei`).
- `wc -c` zählt Bytes, `-m` Zeichen.
- `head -n -3` gibt alles **außer** den letzten 3 Zeilen aus.
- `tail -f` beenden mit Strg+C.

## Grafik

### Filterkette
1. Datei: /etc/passwd
2. Datei -> cut: cut -d: -f7 (Spalte Shell)
3. cut -> sort: sortiert die Shells
4. sort -> uniq: uniq -c zählt gleiche Zeilen
5. uniq -> Terminal: Ergebnis: Anzahl pro Shell

## Lab
**Maschine**: debian01.
```bash
# auf debian01
head -n 3 /etc/passwd; tail -n 3 /etc/passwd
cut -d: -f1,7 /etc/passwd
cut -d: -f7 /etc/passwd | sort | uniq -c | sort -nr
wc -l /etc/passwd
echo "Hallo Welt" | tr 'a-z' 'A-Z'
sed 's/root/admin/' /etc/passwd | head -1
sha256sum /etc/hostname
split -l 5 /etc/services teil_
```

## Befehle
- `cat -n datei` – mit Zeilennummern
- `head -n 5` / `tail -n 5` – Anfang/Ende
- `tail -f` – live verfolgen
- `wc -l` – Zeilen zählen
- `sort -n -k2` – numerisch nach Feld 2
- `uniq -c` – Duplikate zählen
- `cut -d: -f1` – Spalte
- `tr 'a-z' 'A-Z'` – umwandeln
- `sed 's/a/b/g'` – ersetzen
- `paste` / `join` – verbinden
- `sha256sum` – Prüfsumme

## Übungen
- A: Zeige alle Benutzernamen aus /etc/passwd. | L: cut -d: -f1 /etc/passwd
- A: Zähle die Zeilen von /etc/services. | L: wc -l /etc/services
- A: Wie zeigst du die letzten 20 Zeilen und folgst neuen? | L: tail -n 20 -f datei
- A: Warum nutzt man sort vor uniq? | L: uniq entfernt nur direkt aufeinanderfolgende Duplikate.
- A: Wie wandelst du Kleinbuchstaben in Großbuchstaben? | L: tr 'a-z' 'A-Z' < datei

## Karteikarten
- F: Was macht tac? | A: Gibt eine Datei zeilenweise rückwärts aus.
- F: Was bewirkt sort -n? | A: Numerische Sortierung.
- F: Was macht uniq -c? | A: Zählt aufeinanderfolgende gleiche Zeilen.
- F: Welcher Befehl schneidet Spalten aus? | A: cut
- F: Wie zerlegt man eine große Datei? | A: split -l Zeilen datei präfix
- F: Was macht paste? | A: Setzt Dateien spaltenweise zusammen.
- F: Wofür dient join? | A: Verbindet zwei Dateien über ein gemeinsames Feld.
- F: Was macht tr -d? | A: Löscht angegebene Zeichen.
- F: Welcher Befehl prüft Datei-Integrität? | A: md5sum / sha256sum (-c).
- F: Was macht nl? | A: Nummeriert Zeilen.

## Quiz
? Welcher Befehl zeigt die letzten Zeilen live an?
* tail -f
- head -f
- cat -f
- less -n

? Warum sort vor uniq?
* uniq entfernt nur benachbarte Duplikate
- uniq sortiert nicht
- uniq braucht Root
- uniq ist langsam

? Wie zeigt man das erste Feld von /etc/passwd?
* cut -d: -f1 /etc/passwd
- cut -f1 /etc/passwd
- cut -c1 /etc/passwd
- head -1 /etc/passwd

? Was zählt wc -l?
* Zeilen
- Wörter
- Bytes
- Dateien

? Welcher Befehl ersetzt Zeichen?
* tr
- cut
- nl
- split

? Was macht sort -n?
* Numerisch sortieren
- Rückwärts sortieren
- Duplikate entfernen
- Nach Name sortieren

? Welcher Befehl verbindet zwei Dateien über ein Schlüsselfeld?
* join
- paste
- cat
- cmp

? Welcher Befehl erzeugt eine SHA-256-Prüfsumme?
* sha256sum
- sum256
- shasum -m
- crc

## Spickzettel
- cat tac head tail (-f) nl wc (-l -w -c)
- sort (-n -r -k -t -u) | uniq (-c -d) nur benachbart
- cut -d -f · paste · join · split · tr · sed
- md5sum / sha256sum -c
