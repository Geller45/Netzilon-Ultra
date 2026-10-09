---
id: linux-l1-05-prozesse
bereich: Linux
fach: Linux I
pruefungen: [LPIC-1, Schule]
block: L1
kapitel: Linux I – Grundlagen
titel: 1.05 Prozesse, Jobsteuerung, Signale und Prioritäten
stufe: Fortgeschritten
quellen: [1.05_Linux_-_Prozesse_und_Prioritaeten.pdf, LPI-Learning-Material-101-500-de.pdf]
verweise: [linux-101-103-5-prozesse, linux-101-103-6-prioritaeten, linux-l1-06-booten, linux-102-110-1-sicherheit-admin, ref-linux]
---

## Profi

### Einordnung
**103.5** Prozesse erzeugen, überwachen, beenden (Gewicht 4) und **103.6** Prioritäten (Gewicht 2) – Prüfung 101. Der Abschnitt „Ressourcen messen“ (vmstat, iostat, sar, lsof) ist **LPIC-2 200.1** und als Vertiefung markiert.

### Was ist ein Prozess?
- Ein **Prozess** ist eine **laufende Instanz eines Programms** mit eindeutiger **PID**; die **PPID** zeigt auf den Elternprozess. `echo $$` = PID der aktuellen Shell.
- Entstehung: der Elternprozess **teilt sich (fork)** und **lädt ein neues Programm (exec)**. **systemd (PID 1)** ist der Urahn aller Prozesse.
- **Zustände (STAT)**: **R** running/lauffähig, **S** schlafend (unterbrechbar), **D** ununterbrechbar (I/O-Wait, **nicht killbar**), **T** gestoppt, **Z** Zombie.

### Prozesse beobachten
| Befehl | Zweck |
|---|---|
| `ps aux` | **BSD-Stil**: alle Prozesse mit USER, %CPU, %MEM, STAT, TIME, COMMAND |
| `ps -ef` | **UNIX-Stil**: alle Prozesse mit **PPID** |
| `ps -u benutzer` | Prozesse eines Benutzers |
| `ps -eo pid,comm,%cpu --sort=-%cpu` | eigene Spalten, sortiert |
| `pgrep -l ssh` | PIDs nach Muster (`-u user`, `-f` ganze Befehlszeile) |
| `pidof bash` | PIDs nach **exaktem** Programmnamen |
| `top` | Live-Monitor (ps = Momentaufnahme) |
| `free -h` | Speicher – relevant ist **available** (enthält freigebbaren Cache) |
| `uptime` | Laufzeit, Benutzer, **Load Average 1/5/15 min** |
| `watch -n 2 befehl` | Befehl alle 2 s wiederholen |
**top-Tasten**: `P` nach CPU, `M` nach Speicher, `k` kill, `r` renice, `1` pro CPU-Kern, `q` beenden. Kopfzeile: Load Average, Tasks, %CPU (`us` User, `sy` System, `id` Idle, `wa` I/O-Wait), Speicher.

### Jobsteuerung (Vorder-/Hintergrund)
| Aktion | Befehl |
|---|---|
| im Hintergrund starten | `befehl &` → `[1] 5123` (Jobnummer, PID) |
| laufenden Job anhalten | **Strg+Z** (Stopped, SIGTSTP) |
| Jobs anzeigen | `jobs` (`-l` mit PID) |
| in den Vordergrund | `fg %1` |
| im Hintergrund fortsetzen | `bg %1` |
| abbrechen | **Strg+C** (SIGINT) |
- Beim Abmelden erhalten Jobs ein **SIGHUP** und sterben oft. **`nohup befehl &`** ignoriert SIGHUP und schreibt die Ausgabe nach **`nohup.out`**. **`disown`** entfernt einen Job aus der Jobliste der Shell.
- **screen/tmux**: persistente Sitzungen, die das Abmelden überleben – **detach** und später **reattach**. screen: `screen -S x`, **Strg+a d**, `screen -ls`, `screen -r`. tmux: `tmux new -s x`, **Strg+b d**, `tmux attach -t x`, `tmux ls`.

### Signale
| Signal | Nr. | Bedeutung |
|---|---|---|
| SIGHUP | 1 | Terminal weg / Dienst soll **Konfiguration neu laden** |
| SIGINT | 2 | Abbruch per **Strg+C** |
| SIGQUIT | 3 | Abbruch mit Core-Dump (Strg+\) |
| SIGKILL | **9** | **hart beenden, nicht abfangbar** – Notbremse |
| SIGTERM | **15** | **höflich beenden – Standard von kill** |
| SIGSTOP / SIGCONT | 19 / 18 | anhalten (nicht abfangbar) / fortsetzen |
| SIGTSTP | 20 | Anhalten per Strg+Z |
- `kill PID` = SIGTERM; `kill -9 PID` = `kill -KILL PID` = `kill -SIGKILL PID`; `kill -HUP $(pidof nginx)`; `kill -l` listet alle Signale. **Erst TERM, dann KILL** – kill -9 lässt kein Aufräumen zu.
- `killall name` (exakter Name), `pkill muster` (Muster; `-f` ganze Befehlszeile, `-u user`). Vorher mit **`pgrep`** testen, wen das Muster trifft.

### Prioritäten (103.6)
- Der Scheduler verteilt CPU-Zeit; die **Niceness (NI)** beeinflusst den Anteil: **-20 = höchste Priorität**, **+19 = niedrigste**, **Standard 0**. Höhere Niceness = „netter“ = weniger CPU. **PRI** = vom Kernel errechnete Priorität.
- **`nice -n 15 ./encode.sh &`** startet mit Niceness 15; **`nice befehl` ohne Wert = +10**. Negative Werte nur als **root** (`sudo nice -n -5 wichtig.sh`).
- **`renice -n 10 -p 1842`** (Prozess), `renice -n 5 -u benutzer` (alle Prozesse eines Benutzers), `renice -n 5 -g gruppe`; interaktiv **top → r**. Normale Benutzer dürfen die Niceness nur **erhöhen** (Priorität senken), senken darf nur root.
- Anzeigen: `ps -o pid,ni,pri,comm -p PID`, `ps -el` (Spalte NI), top (Spalten PR, NI).

### Vertiefung LPIC-2 200.1
- **Zombie**: beendet, aber der Elternprozess hat den Exit-Status nicht abgeholt – belegt nur einen Tabelleneintrag; viele Zombies = Bug im Elternprozess. **Orphan**: Eltern tot → wird von **systemd (PID 1)** adoptiert. Prozess in **D** lässt sich nicht killen (hängende I/O, z. B. NFS).
- **Load Average** im Verhältnis zu den CPU-Kernen lesen (`nproc`): dauerhaft deutlich > Kerne = Überlast.
- `pstree -p` (Baum mit PIDs), `htop` (F3 suchen, F5 Baum, F9 kill), `vmstat 2 3` (r/b, si/so Swap, bi/bo Block-I/O, us/sy/id/**wa**), `iostat -d 2` und `mpstat -P ALL` (Paket **sysstat**, **%util** nahe 100 % = Platte ist Flaschenhals), `sar` (Verlauf: `-r` RAM, `-b` I/O, `-n DEV` Netz), `lsof -p PID` / **`lsof -i :443`** / `ss -tlnp` („Welcher Prozess belegt Port X?“), `iotop`.
- Bonus: **`ionice -c3`** (Idle-I/O-Klasse; `-c1` Realtime, `-c2` Best-Effort 0..7), **cgroups** und `systemd-run --scope -p MemoryMax=500M befehl`, `setsid`, `/proc/PID/` (status, cmdline, fd/, environ).

## Einfach

Ein **Programm** ist wie ein **Kochrezept im Buch**. Ein **Prozess** ist, wenn jemand **wirklich danach kocht**. Du kannst dasselbe Rezept dreimal gleichzeitig kochen – dann hast du drei Prozesse. Jeder Koch bekommt eine **Nummer (PID)**, und man weiß immer, **wer ihn eingestellt hat** (Elternprozess, PPID). Der **Chefkoch ganz oben** ist **systemd** mit der Nummer 1.

**`ps`** macht ein **Foto** von der Küche: Wer kocht gerade was? **`top`** ist eine **Live-Kamera**.

**Vordergrund und Hintergrund**: Wenn du einen Befehl startest, wartet die Shell, bis er fertig ist – wie wenn du am Herd stehst. Mit **`&`** am Ende sagst du: „Koch das **im Hinterzimmer**, ich mach hier weiter.“ Mit **Strg+Z** sagst du „**Pause!**“, mit **`bg`** „mach im Hinterzimmer weiter“ und mit **`fg`** „komm wieder nach vorne“.

Wenn du nach Hause gehst (dich abmeldest), schickt das System allen Hinterzimmer-Köchen „**Feierabend!**“ (SIGHUP). Mit **`nohup`** gibst du dem Koch Kopfhörer – er hört das nicht und kocht weiter. **tmux** und **screen** sind wie eine **Küche, die weiterläuft**, auch wenn du rausgehst, und in die du später wieder reinschauen kannst.

**Signale** sind **Zurufe**:
- **SIGTERM (15)**: „Bitte hör auf und räum noch auf.“ – das höfliche Standard-Signal.
- **SIGKILL (9)**: Der Koch wird **sofort rausgetragen** – er kann nicht mal den Herd ausmachen. Nur als letzte Notlösung!
- **SIGHUP (1)**: „Lies das Rezept nochmal neu.“

**Nice** heißt „nett“. Ein Prozess mit **hohem Nice-Wert (+19)** ist **sehr höflich** und lässt andere vor – er bekommt wenig Herdplatte. Ein Wert von **-20** ist **drängelnd** und kommt immer zuerst dran. Drängeln darf aber **nur der Chef (root)**. Normale Benutzer dürfen nur **netter** werden, nicht frecher.

## Merksatz
- **Erst 15 (TERM), dann 9 (KILL)**.
- **kill ohne Nummer = 15**.
- **-20 drängelt, +19 ist höflich, 0 ist Standard, nice ohne Wert = 10**.
- **Nur root darf drängeln** (negative Werte, Priorität erhöhen).
- **& = Hintergrund, Strg+Z = Pause, bg = weiter hinten, fg = nach vorn**.
- **nohup = Kopfhörer gegen SIGHUP**.
- **ps = Foto, top = Live-Kamera, sar = Tagebuch**.

## Prüfungsfalle
- **`kill` sendet standardmäßig SIGTERM (15)**, nicht SIGKILL (9).
- **SIGKILL und SIGSTOP** sind nicht abfangbar; SIGTERM schon.
- **Höherer Nice-Wert = niedrigere Priorität** (Umkehrung!).
- `nice` **ohne** `-n` setzt **10**, nicht 0 und nicht 19.
- Normale Benutzer können per renice **nicht** wieder zurück auf einen niedrigeren Wert.
- `ps aux` (BSD, **ohne** Bindestrich) vs. `ps -ef` (UNIX, zeigt PPID).
- Bei `free` zählt **available**, nicht **free**.
- Prozesse im Zustand **D** reagieren nicht einmal auf kill -9.
- `killall` (exakter Name) ≠ `pkill` (Muster).

## Grafik

### fork und exec
1. bash: PID 2451 wartet auf Befehl
2. bash -> Kind: fork – Kopie der Shell (neue PID 5123)
3. Kind: exec – lädt /usr/bin/sleep
4. Kind: läuft als sleep, PPID 2451
5. Kind -> bash: Exit-Status bei Ende
6. bash: holt Status ab – sonst wäre das Kind ein Zombie

### Jobsteuerung
1. Benutzer -> Shell: `sleep 300` im Vordergrund
2. Benutzer -> Shell: Strg+Z – Job 1 gestoppt (T)
3. Benutzer -> Shell: `bg %1` – läuft im Hintergrund (R/S)
4. Benutzer -> Shell: `jobs` zeigt [1]+ Running
5. Benutzer -> Shell: `fg %1` – wieder im Vordergrund
6. Benutzer -> Shell: Strg+C – SIGINT beendet den Job

### Signale eskalieren
1. Admin -> Prozess: kill PID (SIGTERM 15)
2. Prozess: räumt auf, schließt Dateien
3. Admin: pgrep prüft – Prozess hängt noch
4. Admin -> Prozess: kill -9 PID (SIGKILL)
5. Kernel -> Prozess: sofort beendet, kein Aufräumen

## Lab
**Maschine**: debian01 (normaler Benutzer mit sudo; für sysstat/htop/tmux ggf. `sudo apt install sysstat htop tmux`).
```bash
# auf debian01 – beobachten
echo $$; ps -p $$ -o pid,ppid,stat,comm
ps aux --sort=-%mem | head -5
ps -ef | head -5; ps -u $USER
pgrep -l ssh; pidof bash
free -h; uptime; nproc
top          # dann P, M, 1, q

# auf debian01 – Jobsteuerung
sleep 300 &
sleep 400          # dann Strg+Z
jobs -l; bg %2; fg %1   # dann Strg+C
nohup sleep 600 &
cat nohup.out 2>/dev/null
sleep 700 & disown; jobs

# auf debian01 – tmux
tmux new -s lab     # arbeiten, dann Strg+b d
tmux ls; tmux attach -t lab

# auf debian01 – Signale
sleep 1000 & P=$!
kill $P; ps -p $P || echo "beendet mit SIGTERM"
sleep 1000 & kill -9 $!; kill -l | head -3
pgrep -f "sleep 7"; pkill -f "sleep 7"

# auf debian01 – Prioritäten
nice -n 15 sleep 500 & ps -o pid,ni,pri,comm -p $!
renice -n 18 -p $!          # erlaubt (höher)
renice -n 5 -p $!           # verweigert als normaler Benutzer
sudo renice -n -5 -p $!     # als root erlaubt
nice sleep 501 & ps -o ni,comm -p $!   # NI = 10

# auf debian01 – LPIC-2-Vertiefung
pstree -p | head; vmstat 2 3; iostat -d 2 2; sudo lsof -i :22; ss -tlnp
ionice -c3 tar -czf /tmp/etc.tgz /etc 2>/dev/null
```

## Befehle
- `ps aux` – alle Prozesse im BSD-Stil mit CPU/MEM
- `ps -ef` – alle Prozesse im UNIX-Stil mit PPID
- `ps -eo pid,ni,comm --sort=-%cpu` – eigene Spalten, sortiert
- `pgrep -l -u benutzer muster` – PIDs nach Muster und Benutzer
- `pidof programm` – PIDs eines exakten Programmnamens
- `top` – Live-Prozessmonitor (P, M, k, r, 1, q)
- `free -h` – Arbeitsspeicher und Swap
- `uptime` – Laufzeit und Load Average
- `watch -n 2 befehl` – Befehl periodisch ausführen
- `befehl &` – im Hintergrund starten
- `jobs` – Jobs der Shell anzeigen
- `fg %1` – Job 1 in den Vordergrund
- `bg %1` – Job 1 im Hintergrund fortsetzen
- `nohup befehl &` – gegen SIGHUP geschützt starten
- `disown` – Job aus der Jobliste lösen
- `tmux new -s name` – persistente Sitzung starten
- `screen -r` – screen-Sitzung wieder anhängen
- `kill PID` – SIGTERM senden
- `kill -9 PID` – SIGKILL senden
- `kill -HUP PID` – Konfiguration neu laden lassen
- `kill -l` – alle Signale auflisten
- `killall name` – alle Prozesse mit exaktem Namen beenden
- `pkill -f muster` – Prozesse nach Befehlszeile beenden
- `nice -n 15 befehl` – mit Niceness 15 starten
- `renice -n 10 -p PID` – Niceness eines laufenden Prozesses ändern
- `pstree -p` – Prozessbaum mit PIDs
- `vmstat 2 3` – Systemwerte alle 2 s, 3-mal (LPIC-2)
- `lsof -i :443` – welcher Prozess belegt Port 443

## Übungen
- A: Welches Signal beendet sofort und ist nicht abfangbar? (SIGTERM 15, SIGHUP 1, SIGKILL 9, SIGCONT) | L: SIGKILL (9) – die Notbremse; SIGTERM lässt aufräumen.
- A: Womit holst du einen Job in den Vordergrund? (bg, fg, jobs, &) | L: fg %n; bg lässt ihn im Hintergrund weiterlaufen.
- A: Was zeigt ps aux? | L: Alle Prozesse mit Benutzer, CPU- und Speicheranteil und Status.
- A: Welcher Befehl schützt einen Hintergrundjob vor dem Beenden beim Logout? | L: nohup befehl & (oder disown); komfortabler tmux/screen.
- A: Welcher Niceness-Wert ist die höchste Priorität? (19, 0, -20, 100) | L: -20; +19 ist die niedrigste, Standard 0; negative Werte nur als root.
- A: Ein Prozess im Zustand Z ist …? | L: Ein Zombie – beendet, aber der Elternprozess hat den Exit-Status nicht abgeholt.
- A: Welches Tool zeigt CPU und Disk-I/O (sysstat)? (iostat, free, pstree, jobs) | L: iostat
- A: Mit welchem Befehl änderst du die Priorität eines laufenden Prozesses? | L: renice -n wert -p PID (oder in top die Taste r).
- A: Ein Encoding-Skript soll die anderen Nutzer nicht stören. Wie startest du es? | L: nice -n 19 ./encode.sh & (optional zusätzlich ionice -c3).
- A: nginx soll seine Konfiguration ohne Neustart neu einlesen. | L: kill -HUP $(pidof nginx) bzw. besser systemctl reload nginx.

## Karteikarten
- F: Was ist der Unterschied zwischen Programm und Prozess? | A: Ein Programm ist eine Datei; ein Prozess ist eine laufende Instanz davon mit eigener PID.
- F: Was bedeuten PID und PPID? | A: PID = Prozess-ID; PPID = PID des Elternprozesses.
- F: Wie entstehen neue Prozesse? | A: Durch fork (Kopie des Elternprozesses) und exec (Laden eines neuen Programms).
- F: Welche Prozesszustände gibt es in STAT? | A: R lauffähig, S schlafend, D ununterbrechbar (I/O), T gestoppt, Z Zombie.
- F: Unterschied ps aux und ps -ef? | A: ps aux = BSD-Syntax mit %CPU/%MEM; ps -ef = UNIX-Syntax mit PPID.
- F: Welche Signale haben die Nummern 1, 2, 9 und 15? | A: 1 SIGHUP, 2 SIGINT, 9 SIGKILL, 15 SIGTERM.
- F: Was macht nohup? | A: Startet einen Befehl, der SIGHUP ignoriert; Ausgabe landet in nohup.out.
- F: Wie lösen sich screen und tmux vom Terminal? | A: Detach mit Strg+a d (screen) bzw. Strg+b d (tmux); später screen -r bzw. tmux attach.
- F: Welchen Wertebereich hat die Niceness? | A: -20 (höchste Priorität) bis +19 (niedrigste), Standard 0.
- F: Welchen Wert setzt nice ohne Angabe? | A: +10.
- F: Was darf ein normaler Benutzer mit renice? | A: Nur die Niceness eigener Prozesse erhöhen (Priorität senken), nicht senken.
- F: Was ist der Unterschied zwischen killall und pkill? | A: killall beendet Prozesse mit exaktem Namen, pkill nach Muster (auch -f für die ganze Befehlszeile).
- F: Was zeigt der Load Average? | A: Durchschnittliche Zahl lauffähiger bzw. auf I/O wartender Prozesse über 1, 5 und 15 Minuten.
- F: Was ist ein Orphan-Prozess? | A: Ein Prozess, dessen Elternprozess beendet ist; er wird von systemd (PID 1) adoptiert.

## Quiz
? Welches Signal sendet `kill PID` ohne weitere Angabe?
* SIGTERM (15)
- SIGKILL (9)
- SIGHUP (1)
- SIGINT (2)

? Welches Signal kann ein Prozess nicht abfangen?
* SIGKILL
- SIGTERM
- SIGHUP
- SIGINT

? Was bewirkt Strg+Z in der Bash?
* Der Vordergrundjob wird angehalten
- Der Vordergrundjob wird beendet
- Der Job wird in den Hintergrund geschickt und läuft weiter
- Die Shell wird geschlossen

? Welche Niceness bedeutet die niedrigste Priorität?
* 19
- -20
- 0
- 10

? Welchen Niceness-Wert hat ein mit `nice befehl` (ohne -n) gestarteter Prozess?
* 10
- 0
- 19
- -10

? Welcher Befehl zeigt die PPID aller Prozesse?
* ps -ef
- ps aux
- top -p
- jobs -l

? Was gilt für einen Zombie-Prozess?
* Er ist beendet, sein Exit-Status wurde aber noch nicht vom Elternprozess abgeholt
- Er verbraucht viel CPU
- Er wartet auf Festplatten-I/O
- Er wurde mit Strg+Z gestoppt

? Wie setzt ein normaler Benutzer die Niceness eines eigenen Prozesses von 10 auf 5?
* Gar nicht – das darf nur root
- renice -n 5 -p PID
- nice -n 5 -p PID
- kill -5 PID

? Welche Datei schreibt nohup standardmäßig, wenn die Ausgabe ein Terminal ist?
* nohup.out
- /var/log/nohup.log
- ~/.nohup
- /tmp/nohup.txt

? Welcher Befehl zeigt, welcher Prozess Port 443 belegt?
* lsof -i :443
- pgrep 443
- ps -p 443
- free -p 443

? In top: Welche Taste sortiert nach Speicherverbrauch?
* M
- P
- k
- r

## Spickzettel
- Prozess = laufendes Programm · PID/PPID · fork + exec · PID 1 = systemd
- STAT: R S D T Z · D nicht killbar · Z = Status nicht abgeholt
- ps aux (BSD) · ps -ef (PPID) · pgrep/pidof · top (P M k r 1 q) · free -h available · uptime
- & · Strg+Z · jobs · fg %1 · bg %1 · Strg+C
- nohup … & (nohup.out) · disown · tmux Strg+b d · screen Strg+a d
- kill = 15 TERM · -9 KILL · -1 HUP · killall Name · pkill Muster
- NI -20 … +19, Standard 0, nice ohne Wert = 10
- nice -n X befehl · renice -n X -p PID · nur root senkt
- LPIC-2: vmstat iostat sar lsof -i ss -tlnp
