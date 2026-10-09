---
id: linux-101-103-5-prozesse
bereich: Linux
fach: Linux I
pruefungen: [LPIC-1]
block: LPIC-101
kapitel: LPIC-1 Prüfung 101 – GNU- und Unix-Befehle
titel: 103.5 Prozesse erzeugen, überwachen und beenden
stufe: Fortgeschritten
quellen: [LPI-Learning-Material-101-500-de.pdf, 1.05_Linux_-_Prozesse_und_Prioritaeten.pdf]
verweise: [linux-l1-05-prozesse, linux-101-103-6-prioritaeten]
---

## Profi

### Lernziel (Gewicht 4)
Jobs im Vordergrund/Hintergrund steuern, Prozesse anzeigen, überwachen, Signale senden, Sitzungen überdauern.

### Prozesse anzeigen
- `ps` (nur eigene Terminalprozesse), `ps aux` (BSD: alle, mit Benutzer, %CPU, %MEM), `ps -ef` (UNIX: mit PPID), `ps -eo pid,ppid,ni,cmd`, `ps --forest`, `pstree`. Spalte **STAT**: R running, S sleeping, D uninterruptible, **T stopped**, **Z zombie**; `<` hohe, `N` niedrige Priorität.
- `top` (interaktiv: `k` kill, `r` renice, `M` nach Speicher, `P` nach CPU, `q`), `htop`, `uptime` (Load Average: 1/5/15 Min.), `free`, `pgrep name`, `pidof`.
- **PID 1** ist init/systemd, **PPID** der Elternprozess; eine Waise wird von init adoptiert.

### Signale
| Nr. | Name | Wirkung |
|---|---|---|
| 1 | SIGHUP | Neu einlesen / Terminal getrennt |
| 2 | SIGINT | Strg+C |
| 9 | SIGKILL | **hartes Beenden**, nicht abfangbar |
| 15 | SIGTERM | höfliches Beenden (Standard von `kill`) |
| 18/19 | SIGCONT / SIGSTOP | fortsetzen / anhalten; 20 = SIGTSTP (Strg+Z) |
- `kill -9 PID`, `kill -SIGTERM PID`, `kill -l`, `killall name`, `pkill -u benutzer name`.

### Job-Steuerung
- `befehl &` im Hintergrund, **Strg+Z** anhalten, `jobs`, `bg %1`, `fg %1`, `kill %1`.
- **`nohup befehl &`** überlebt das Schließen des Terminals (Ausgabe in `nohup.out`); alternativ `disown`, `screen`, `tmux`.
- `watch -n 2 befehl` wiederholt zyklisch.

## Einfach

Ein **Prozess** ist ein **laufendes Programm**: Ein Programm auf der Festplatte ist ein Rezept, ein Prozess ist der Koch, der gerade kocht. Jeder Koch hat eine **Nummer** (PID) und einen **Chef**, der ihn gerufen hat (PPID). Ganz oben steht Koch Nummer 1 (init/systemd), der Urvater aller.

Mit `ps aux` siehst du alle Köche, mit `top` eine Live-Anzeige, wer gerade am meisten arbeitet (CPU) oder am meisten Platz belegt (Speicher).

Wenn ein Koch spinnt, sagst du ihm per **Signal** Bescheid. **SIGTERM (15)** heißt: „Bitte räum auf und hör auf“ – das ist höflich und der Standard. **SIGKILL (9)** heißt: „Raus, sofort!“ – das ist der Rausschmiss, der Koch kann nichts mehr aufräumen. Erst höflich versuchen, dann `kill -9`.

Du kannst auch selbst Köche steuern: Mit `&` startest du einen im **Hintergrund**, damit du weiterarbeiten kannst. Mit Strg+Z hältst du einen an, mit `bg` lässt du ihn im Hintergrund weiterlaufen, mit `fg` holst du ihn wieder nach vorn.

Schließt du das Terminal, werden die Köche normalerweise mitgenommen. Wer das nicht will, startet mit **`nohup`** – dann arbeitet er weiter, auch wenn du gehst.

Ein **Zombie** ist ein Koch, der schon fertig ist, aber dessen Chef das noch nicht quittiert hat.

## Merksatz
- **Erst SIGTERM (15), dann SIGKILL (9).**
- **Strg+C = SIGINT, Strg+Z = anhalten.**
- **& hinten = Hintergrund, fg/bg/jobs.**
- **nohup überlebt das Terminal.**
- **Z = Zombie, T = gestoppt.**
- **Load Average = 1/5/15 Minuten.**

## Prüfungsfalle
- `kill` ohne Signal sendet **SIGTERM (15)**, nicht 9.
- SIGKILL kann das Programm weder abfangen noch ignorieren.
- `ps aux` (ohne Bindestrich, BSD) und `ps -ef` (UNIX) liefern verschiedene Spalten.
- `kill %1` meint die **Jobnummer**, `kill 1` die PID 1!
- `nohup` schreibt nach `nohup.out`, wenn nicht umgeleitet.
- Zombies kann man nicht mit `kill -9` entfernen; der **Elternprozess** muss ihn abräumen.
- Load Average ist die Anzahl wartender/laufender Prozesse, **kein Prozentwert**.

## Grafik

### Job-Steuerung
1. Benutzer -> Shell: sleep 300 (Vordergrund)
2. Benutzer -> Shell: Strg+Z – Prozess angehalten
3. Shell -> Prozess: bg %1 – läuft im Hintergrund weiter
4. Benutzer -> Shell: jobs zeigt [1]+ Running
5. Benutzer -> Prozess: fg %1 – wieder im Vordergrund
6. Benutzer -> Prozess: kill %1 – SIGTERM beendet ihn

## Lab
**Maschine**: debian01.
```bash
# auf debian01
ps aux | head; ps -ef --forest | head
sleep 300 &
jobs; fg %1       # dann Strg+Z
bg %1; kill %1
nohup sleep 600 &
pgrep sleep; pkill sleep
top -b -n 1 | head -15
uptime
```

## Befehle
- `ps aux` – alle Prozesse
- `top` – interaktive Übersicht
- `kill -15 PID` – höflich beenden
- `kill -9 PID` – hart beenden
- `pkill name` – nach Name beenden
- `jobs`, `bg`, `fg` – Jobs steuern
- `nohup cmd &` – von Terminal lösen
- `uptime` – Last
- `pgrep` – PIDs finden

## Übungen
- A: Wie sendest du SIGKILL an PID 4711? | L: kill -9 4711
- A: Wie startest du einen Job im Hintergrund, der das Terminal überlebt? | L: nohup befehl &
- A: Wie holst du Job 2 in den Vordergrund? | L: fg %2
- A: Welcher STAT-Wert bedeutet Zombie? | L: Z
- A: Welche drei Werte zeigt uptime als Load Average? | L: Mittel über 1, 5 und 15 Minuten.

## Karteikarten
- F: Welches Signal sendet kill ohne Option? | A: SIGTERM (15).
- F: Was bewirkt Strg+C? | A: SIGINT (2) an den Vordergrundprozess.
- F: Was bewirkt Strg+Z? | A: Hält den Prozess an (SIGTSTP) und stellt ihn in den Hintergrund.
- F: Was ist eine PPID? | A: Die PID des Elternprozesses.
- F: Was ist ein Zombie? | A: Beendeter Prozess, dessen Eltern den Exit-Status noch nicht abgeholt haben.
- F: Was macht pkill? | A: Sendet ein Signal an Prozesse per Namen.
- F: Wofür steht SIGHUP? | A: Hangup – häufig: Konfiguration neu einlesen.
- F: Was zeigt jobs? | A: Hintergrund- und gestoppte Jobs der Shell.
- F: Was macht watch? | A: Führt einen Befehl periodisch aus und zeigt die Ausgabe.
- F: Welche Taste in top beendet einen Prozess? | A: k

## Quiz
? Welches Signal beendet einen Prozess nicht abfangbar?
* SIGKILL (9)
- SIGTERM (15)
- SIGHUP (1)
- SIGINT (2)

? Was bewirkt kill 1234 ohne Signalangabe?
* Sendet SIGTERM
- Sendet SIGKILL
- Sendet SIGSTOP
- Gibt den Status aus

? Wie startet man einen Befehl, der das Terminal überlebt?
* nohup befehl &
- befehl &&
- fg befehl
- bg befehl

? Was bedeutet Z in der STAT-Spalte?
* Zombie
- Sleeping
- Stopped
- Running

? Was bewirkt bg %1?
* Setzt Job 1 im Hintergrund fort
- Beendet Job 1
- Holt Job 1 nach vorn
- Startet Job 1 neu

? Welcher Befehl zeigt die Prozesshierarchie?
* ps --forest oder pstree
- ps -l
- top -h
- jobs -t

? Was zeigt uptime?
* Laufzeit, Benutzer und Load Average
- CPU-Temperatur
- Speicherbelegung
- Prozessliste

? Wie nennt man den Elternprozess aller Prozesse?
* init/systemd mit PID 1
- kthreadd mit PID 0
- bash
- cron

## Spickzettel
- ps aux · ps -ef · top · pstree · pgrep
- Signale: 1 HUP · 2 INT · 9 KILL · 15 TERM · 19 STOP · 18 CONT
- & · Strg+Z · jobs bg fg · nohup · disown
- STAT: R S D T Z
