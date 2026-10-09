---
id: linux-ess-befehlszeile
bereich: Linux
fach: Linux I
pruefungen: [LPIC-1, Schule]
block: Linux Essentials
kapitel: Thema 2 – Sich auf einem Linux-System zurechtfinden
titel: 2.1 Grundlagen der Befehlszeile
stufe: Einsteiger
quellen: [LPI-Learning-Material-010-160-de.pdf]
verweise: [linux-l1-01-kommandos]
---

## Profi

### Lernziel (Gewicht 3)
Shell, Befehlsaufbau, Variablen, Quoting, Globbing.

### Shell und Befehle
- Die **Shell** (meist **Bash**) nimmt Befehle entgegen: `befehl [optionen] [argumente]`, z. B. `ls -l /etc`. Kurzoptionen `-l`, kombinierbar `-la`; Langoptionen `--all`. Prompt: `$` normaler Benutzer, `#` root.
- Typen: Programm, Shell-Builtin (`cd`, `echo`), Alias, Funktion. `type befehl`, `which befehl`.
- Infos: `uname -a` (Kernel), `uname -r`, `whoami`, `hostname`, `date`, `history` (Verlauf, `!!` letzter Befehl, `Strg+R` Suche), `clear`.
- Verketten: `;` nacheinander, `&&` nur bei Erfolg, `||` nur bei Fehler. Rückgabewert `$?` (0 = Erfolg).

### Variablen
- Setzen: `NAME=wert` (keine Leerzeichen), Lesen `$NAME` / `${NAME}`, `echo $HOME`. **Umgebungsvariablen**: `export NAME`, `env`, `printenv`. Wichtige: `PATH`, `HOME`, `USER`, `SHELL`, `PWD`, `LANG`. `unset NAME`.
- `PATH` = durch `:` getrennte Verzeichnisse für die Befehlssuche.

### Quoting
- `\` maskiert ein Zeichen, `'…'` (einfache Anführungszeichen) schützt alles wörtlich, `"…"` erlaubt Variablen/`$(…)`-Ersetzung. Befehlsersetzung `$(date)`.

### Globbing
`*` (beliebig viele Zeichen), `?` (genau eines), `[abc]`, `[a-z]`, `[!a]`; die Shell expandiert vor dem Programmstart. Verstecktes beginnt mit `.`.

## Einfach

Die **Shell** ist ein Fenster, in dem du dem Computer **Befehle per Text** gibst. Das wirkt altmodisch, ist aber sehr mächtig, weil man damit tausend Dinge automatisieren kann.

Ein Befehl besteht aus drei Teilen: dem **Wort** (was soll passieren), den **Optionen** (wie genau) und den **Argumenten** (womit). Beispiel: `ls -l /etc` heißt „liste im langen Format den Ordner /etc auf“. Das Zeichen vorne (der Prompt) ist ein `$` für normale Nutzer und ein `#` für den Administrator root.

**Variablen** sind Namensschilder für Werte: `NAME=Philipp` und dann `echo $NAME`. Wichtig ist `PATH`: eine Liste von Ordnern, in denen die Shell nach Programmen sucht.

Beim **Quoting** entscheidest du, wie ernst die Shell Sonderzeichen nimmt. In `'einfachen'` Anführungszeichen bleibt alles Text. In `"doppelten"` werden Variablen ersetzt.

**Globbing** sind Platzhalter: `*.txt` meint alle Dateien, die auf .txt enden; `?` ersetzt genau ein Zeichen. Praktisch, wenn man viele Dateien auf einmal braucht.

Mit der **Pfeil-hoch-Taste** holst du alte Befehle zurück, mit `Tab` ergänzt die Shell Namen automatisch.

## Merksatz
- **Befehl – Option – Argument.**
- **$ normal, # root.**
- **'einfach' wörtlich, "doppelt" mit Variablen.**
- **`*` viele, `?` eines.**
- **`&&` bei Erfolg, `||` bei Fehler.**

## Prüfungsfalle
- `NAME = wert` mit Leerzeichen ist **falsch** (es wird als Befehl gelesen).
- Variablen ohne `export` sind für Kindprozesse nicht sichtbar.
- Die Shell expandiert Globs, nicht der Befehl `ls`.
- `echo '$HOME'` gibt `$HOME` aus, `echo "$HOME"` den Pfad.

## Grafik

### Ablauf eines Befehls
1. Benutzer -> Shell: ls -l *.txt
2. Shell: Platzhalter *.txt expandieren
3. Shell: Programm im PATH suchen
4. Shell -> Kernel: Programm starten
5. Kernel -> Benutzer: Ausgabe im Terminal

## Befehle
- `echo text` – Text ausgeben
- `type befehl` – Art des Befehls
- `uname -a` – Systeminfo
- `export NAME=wert` – Umgebungsvariable
- `history` – Befehlsverlauf
- `env` – Umgebung anzeigen

## Übungen
- A: Wie gibst du den Inhalt der Variablen HOME aus? | L: `echo $HOME`
- A: Wie setzt du MEIN=5 für Unterprozesse? | L: `export MEIN=5`
- A: Wie listest du alle Dateien auf .conf in /etc? | L: `ls /etc/*.conf`

## Karteikarten
- F: Welches Zeichen steht beim root-Prompt? | A: #
- F: Was macht echo $HOME? | A: Gibt das Home-Verzeichnis aus.
- F: Was bedeutet && zwischen Befehlen? | A: Zweiter Befehl nur bei Erfolg des ersten.
- F: Wofür steht PATH? | A: Verzeichnisse, in denen nach Programmen gesucht wird.
- F: Wie liest man den Rückgabewert? | A: echo $?
- F: Was macht uname -r? | A: Zeigt die Kernelversion.
- F: Was matcht ? beim Globbing? | A: Genau ein beliebiges Zeichen.
- F: Was ist ein Builtin? | A: Befehl, der in der Shell eingebaut ist (z. B. cd).
- F: Wie wiederholt man den letzten Befehl? | A: !!
- F: Was bewirkt einfaches Anführungszeichen? | A: Wörtliche Ausgabe ohne Ersetzung.

## Quiz
? Welches Zeichen kennzeichnet den normalen Benutzer-Prompt?
* $
- #
- >
- %

? Wie setzt man eine Variable richtig?
* NAME=wert
- NAME = wert
- set NAME wert
- $NAME=wert

? Was gibt echo '$HOME' aus?
* $HOME
- /home/user
- Nichts
- Fehler

? Welcher Operator führt den nächsten Befehl nur bei Erfolg aus?
* &&
- ||
- ;
- |

? Was ist PATH?
* Liste von Verzeichnissen für die Programmsuche
- Der aktuelle Ordner
- Der Pfad zum Home
- Eine Datei

? Welcher Befehl macht eine Variable für Kindprozesse sichtbar?
* export
- declare -l
- let
- source

? Was bedeutet ls -l?
* Langes Listenformat
- Letzte Dateien
- Links anzeigen
- Lokal suchen

? Welcher Platzhalter steht für genau ein Zeichen?
* ?
- *
- []
- #

## Lücken
- Der Rückgabewert des letzten Befehls steht in {$?}.
- {export} macht Variablen für Unterprozesse sichtbar.
- Der Prompt für root endet auf {#}.

## Spickzettel
- Befehl [Option] [Argument]
- VAR=wert · $VAR · export
- ' ' wörtlich · " " mit Variablen
- * ? [ ]
- && || ; $?
