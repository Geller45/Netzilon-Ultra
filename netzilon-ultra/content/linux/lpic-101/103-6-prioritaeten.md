---
id: linux-101-103-6-prioritaeten
bereich: Linux
fach: Linux I
pruefungen: [LPIC-1]
block: LPIC-101
kapitel: LPIC-1 Prüfung 101 – GNU- und Unix-Befehle
titel: 103.6 Prozess-Ausführungsprioritäten ändern (nice, renice)
stufe: Fortgeschritten
quellen: [LPI-Learning-Material-101-500-de.pdf, 1.05_Linux_-_Prozesse_und_Prioritaeten.pdf]
verweise: [linux-l1-05-prozesse, linux-101-103-5-prozesse]
---

## Profi

### Lernziel (Gewicht 2)
Prioritäten von Prozessen steuern: `nice`, `renice`, Anzeige in `ps` und `top`.

### Nice-Werte
- Der **nice-Wert** reicht von **−20 (höchste Priorität)** bis **+19 (niedrigste)**, Standard **0**. „Netter“ Prozess = gibt anderen Vorrang. Der Kernel-Wert **PRI** ist abgeleitet (bei `ps -l` Standard 80, bei `top` PR = 20 + NI).
- Normale Benutzer dürfen nur **erhöhen** (netter werden) und nur **eigene** Prozesse; **negative Werte und fremde Prozesse nur root**.

### Befehle
| Befehl | Wirkung |
|---|---|
| `nice -n 10 befehl` | startet mit nice 10 (ohne Angabe: +10) |
| `nice -n -5 befehl` | höhere Priorität (nur root) |
| `renice -n 5 -p PID` (oder `renice 5 PID`) | ändert laufenden Prozess |
| `renice -n 5 -u benutzer` | alle Prozesse eines Benutzers |
| `ps -o pid,ni,pri,cmd` / `ps -l` | zeigt NI und PRI |
| `top` → `r` | renice im Dialog |
- Spalten: **NI** (nice), **PR/PRI**. Weitere: `ionice` (I/O-Priorität), `chrt` (Echtzeit-Scheduling), cgroups.
- Kindprozesse erben den nice-Wert.

## Einfach

Stell dir eine **Schlange vor einem Eisstand** vor. Normalerweise kommt jeder der Reihe nach dran. Aber manche haben es eilig, andere haben Zeit. Der **nice-Wert** ist die **Höflichkeitszahl**: Wer sagt „ich bin nett, lass andere vor“, bekommt eine **hohe** Zahl (bis 19). Wer sich vordrängelt, bekommt eine **niedrige** Zahl (bis −20) – aber das darf nur der Chef (root).

Nice hat also die unlogische Regel: **kleine Zahl = wichtig, große Zahl = nett und langsam**. Das merkt man sich mit: „Je netter, desto weiter hinten.“

Willst du ein Programm starten, das ruhig langsam laufen darf (z. B. ein Backup, das den Rechner nicht stören soll), nimmst du `nice -n 19 backup.sh`. Läuft ein Programm schon und stört, sagst du: `renice -n 10 -p 4711` (4711 ist die Nummer des Prozesses).

Normale Benutzer dürfen nur netter werden, nie unfreundlicher. Das ist wie in der Schule: Du darfst anderen den Vortritt lassen, aber dich nicht ohne Erlaubnis nach vorn drängeln. In `top` siehst du die Werte in der Spalte **NI**, und mit der Taste `r` änderst du sie direkt.

## Merksatz
- **−20 = gierig/wichtig, +19 = nett/langsam.**
- **Standard 0, nice ohne Zahl = +10.**
- **Nur root darf negative Werte und fremde Prozesse.**
- **nice startet, renice ändert.**
- **Kinder erben nice.**

## Prüfungsfalle
- Der Bereich ist **−20 bis +19** (nicht 0–20, nicht −19…+20).
- `nice -n 5` **addiert** 5 zum geerbten Wert (nicht „setzt auf 5“ bei geerbtem Wert ungleich 0).
- Benutzer können einen Prozess nur netter machen, **nicht zurück** auf niedrigere Werte.
- `renice` ändert **laufende** Prozesse (PID über `-p`).
- NI ≠ PRI: Die Prüfung fragt meist nach NI.
- `nice -10 cmd` (Altsyntax) bedeutet +10, `nice --10` bedeutet −10.

## Grafik

### nice und renice
1. Benutzer -> nice: nice -n 10 backup.sh
2. nice -> Kernel: startet Prozess mit NI=10
3. Kernel: gibt anderen Prozessen Vorrang
4. Benutzer -> renice: renice -n 15 -p 4711
5. renice -> Kernel: NI wird auf 15 erhöht

## Lab
**Maschine**: debian01.
```bash
# auf debian01
nice -n 10 sleep 300 &
ps -o pid,ni,pri,cmd -C sleep
renice -n 15 -p $(pgrep sleep)
sudo nice -n -5 sleep 300 &
ps -l
top -b -n 1 | head -12
```

## Befehle
- `nice -n 10 cmd` – mit nice starten
- `renice -n 5 -p PID` – ändern
- `ps -o pid,ni,cmd` – NI anzeigen
- `top` (r) – renice interaktiv
- `ionice -c3 cmd` – I/O-Priorität niedrig

## Übungen
- A: Wie startest du backup.sh mit niedrigster Priorität? | L: nice -n 19 backup.sh
- A: Wie erhöhst du die Priorität von PID 99 auf −5? | L: sudo renice -n -5 -p 99
- A: Welche Werte hat nice? | L: −20 bis +19.
- A: Welcher Wert gilt standardmäßig? | L: 0
- A: Dürfen normale Benutzer negative Werte setzen? | L: Nein, nur root.

## Karteikarten
- F: Welcher nice-Wert ist die höchste Priorität? | A: −20.
- F: Welcher Wert ist die niedrigste? | A: +19.
- F: Was macht renice? | A: Ändert den nice-Wert laufender Prozesse.
- F: Wer darf negative nice-Werte setzen? | A: Nur root.
- F: Welcher Standard gilt bei nice ohne -n? | A: +10.
- F: Welche Spalte zeigt nice in ps/top? | A: NI.
- F: Erben Kindprozesse den nice-Wert? | A: Ja.
- F: Was regelt ionice? | A: Die Priorität des I/O-Zugriffs.

## Quiz
? Welcher Wertebereich gilt für nice?
* −20 bis +19
- 0 bis 20
- −19 bis +20
- 1 bis 100

? Welcher nice-Wert bedeutet höchste Priorität?
* −20
- 0
- +19
- +20

? Welcher Befehl ändert die Priorität eines laufenden Prozesses?
* renice
- nice
- chrt -r
- setprio

? Was passiert bei nice ohne Angabe?
* nice-Wert +10
- nice-Wert −10
- nice-Wert 0
- Fehler

? Wer darf negative nice-Werte setzen?
* Nur root
- Jeder Benutzer
- Mitglieder von sudo-Gruppe immer
- Nur der Prozessbesitzer

? Welche Spalte zeigt den nice-Wert in ps -l?
* NI
- PRI
- SZ
- WCHAN

? Was bewirkt nice -n 5 bei geerbtem Wert 5?
* Der Wert wird 10
- Der Wert wird 5
- Der Wert wird 0
- Der Wert wird −5

? Mit welcher Taste ändert man in top die Priorität?
* r
- n
- p
- s

## Spickzettel
- nice −20…+19 · Standard 0 · nice ohne Zahl +10
- nice -n x cmd · renice -n x -p PID
- nur root: negativ/fremde · NI in ps/top
- kleine Zahl = wichtig
