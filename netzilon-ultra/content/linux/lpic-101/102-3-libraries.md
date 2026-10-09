---
id: linux-101-102-3-libraries
bereich: Linux
fach: Linux I
pruefungen: [LPIC-1]
block: LPIC-101
kapitel: LPIC-1 Prüfung 101 – Linux-Installation und Paketverwaltung
titel: 102.3 Gemeinsam genutzte Bibliotheken verwalten
stufe: Fortgeschritten
quellen: [LPI-Learning-Material-101-500-de.pdf]
verweise: [linux-101-102-4-debian-pakete, linux-101-102-5-rpm-pakete, linux-l1-08-paketverwaltung]
---

## Profi

### Lernziel (Gewicht 1)
Shared Libraries erkennen, ihren Ort finden und den Suchpfad des dynamischen Linkers konfigurieren.

### Konzepte
- Programme sind **statisch** (Bibliothek eingebaut, groß) oder **dynamisch** gelinkt (nutzen **Shared Libraries**, Endung `.so` (shared object) bzw. `.so.N`; unter Windows DLL). Vorteile: weniger Speicher, zentrale Updates.
- Namensschema: `libc.so.6` (soname) → Symlink auf `libc-2.36.so` oder `libc.so.6.x`. Pfade: `/lib`, `/lib64`, `/usr/lib`, `/usr/lib64`, `/usr/lib/x86_64-linux-gnu`, `/usr/local/lib`.
- **`ldd /bin/ls`** zeigt benötigte Bibliotheken (nicht auf nicht-vertrauenswürdige Programme anwenden!). Fehlermeldung: `error while loading shared libraries: libxyz.so.1: cannot open shared object file`.

### Der dynamische Linker
- `ld.so`/`ld-linux.so` löst Bibliotheken beim Programmstart auf. Reihenfolge: `LD_LIBRARY_PATH` (Umgebungsvariable, nur Tests), Cache **`/etc/ld.so.cache`**, Standardpfade `/lib`, `/usr/lib`.
- Konfiguration: **`/etc/ld.so.conf`** und **`/etc/ld.so.conf.d/*.conf`** (ein Verzeichnis je Zeile). **Nach Änderung `ldconfig` ausführen**, das den Cache neu aufbaut. `ldconfig -p` zeigt den Cache, `ldconfig -p | grep libssl`.
- `LD_PRELOAD` lädt eine Bibliothek zuerst (Debugging, auch Angriffsvektor).

## Einfach

Stell dir vor, viele Köche in einer Großküche brauchen alle dasselbe Gewürz. Statt dass **jeder Koch seine eigene Dose** kauft, steht eine **gemeinsame Gewürzdose** im Regal. Genau das sind **Shared Libraries**: Programmbausteine, die viele Programme zusammen nutzen. Das spart Platz, und wird das Gewürz verbessert, profitieren alle auf einmal.

Auf Linux erkennst du sie an der Endung `.so`. Willst du wissen, welche Gewürze ein Programm braucht, fragst du `ldd /bin/ls`. Fehlt eine Dose, bricht das Programm mit der Meldung „cannot open shared object file“ ab.

Damit die Köche die Dosen schnell finden, gibt es ein **Verzeichnis, den Cache** (`/etc/ld.so.cache`). Der Helfer **ldconfig** schreibt diesen Plan neu, sobald du irgendwo ein neues Regal aufgestellt hast. Wo überall Regale stehen dürfen, steht in `/etc/ld.so.conf` und im Ordner `/etc/ld.so.conf.d/`.

Nur zum Ausprobieren kannst du einem Koch einen Zettel mitgeben: „Schau zuerst in Regal X“ (`LD_LIBRARY_PATH=/opt/lib`). Das gilt aber nur für diesen einen Koch, und man sollte es nicht dauerhaft so machen.

## Merksatz
- **.so = Shared Object, ldd = „was brauchst du?“**
- **Neues Verzeichnis → ld.so.conf.d → ldconfig.**
- **LD_LIBRARY_PATH nur zum Testen.**
- **Cache: /etc/ld.so.cache.**

## Prüfungsfalle
- Nach Änderung in `/etc/ld.so.conf(.d)` **muss `ldconfig`** laufen, sonst ist der Cache alt.
- `ldconfig` ist **nicht** `ldd`: ldd zeigt Abhängigkeiten, ldconfig aktualisiert den Cache.
- `LD_LIBRARY_PATH` ist temporär/prozessbezogen, keine dauerhafte Lösung.
- `ldd` nie auf unbekannte Binaries ausführen (kann Code ausführen).
- Windows-Pendant: DLL.

## Grafik

### Bibliothek finden
1. Programm -> Linker: starte /usr/bin/app
2. Linker: prüft LD_LIBRARY_PATH
3. Linker -> ld.so.cache: Wo liegt libfoo.so.1?
4. ld.so.cache -> Linker: /usr/local/lib/libfoo.so.1
5. Linker -> Programm: Bibliothek geladen, Start

## Lab
**Maschine**: debian01.
```bash
# auf debian01
ldd /bin/ls
ldconfig -p | grep libc.so
echo "/opt/mylib" | sudo tee /etc/ld.so.conf.d/mylib.conf
sudo ldconfig
LD_LIBRARY_PATH=/opt/mylib ldd /bin/ls
```

## Befehle
- `ldd programm` – benötigte Bibliotheken
- `ldconfig` – Cache neu aufbauen
- `ldconfig -p` – Cache anzeigen
- `LD_LIBRARY_PATH=...` – temporärer Suchpfad

## Übungen
- A: Wie zeigst du die Abhängigkeiten von /bin/ls? | L: ldd /bin/ls
- A: Was musst du nach Anlegen von /etc/ld.so.conf.d/x.conf tun? | L: ldconfig ausführen.
- A: Wie ist der Linker-Cache benannt? | L: /etc/ld.so.cache
- A: Welche Variable setzt temporär zusätzliche Bibliothekspfade? | L: LD_LIBRARY_PATH

## Karteikarten
- F: Wofür steht .so? | A: Shared Object (gemeinsame Bibliothek).
- F: Was zeigt ldd? | A: Die von einem Programm benötigten Shared Libraries.
- F: Was macht ldconfig? | A: Baut /etc/ld.so.cache aus den konfigurierten Pfaden neu auf.
- F: Wo stehen zusätzliche Bibliotheksverzeichnisse? | A: /etc/ld.so.conf und /etc/ld.so.conf.d/*.conf
- F: Was ist LD_PRELOAD? | A: Eine Bibliothek, die vor allen anderen geladen wird.
- F: Statisch gelinkt bedeutet? | A: Bibliothekscode ist im Programm enthalten.
- F: Was zeigt ldconfig -p? | A: Den Inhalt des Bibliothekscaches.
- F: Typische Bibliotheksverzeichnisse? | A: /lib, /lib64, /usr/lib, /usr/lib64.

## Quiz
? Welcher Befehl zeigt die Abhängigkeiten eines Programms?
* ldd
- ldconfig
- ldp
- lib-list

? Was muss nach Änderung von /etc/ld.so.conf.d/ erfolgen?
* ldconfig
- ldd
- reboot unbedingt
- modprobe

? Wo liegt der Cache des Linkers?
* /etc/ld.so.cache
- /var/lib/ld.cache
- /usr/lib/cache.so
- /etc/lib.cache

? Welche Variable erweitert den Bibliothekspfad temporär?
* LD_LIBRARY_PATH
- LIB_PATH
- PATH
- LDCONFIG

? Was ist eine Shared Library unter Linux?
* Eine .so-Datei, die von mehreren Programmen genutzt wird
- Eine Textdatei mit Befehlen
- Ein Kernelmodul
- Ein Archiv

? Was ist das Windows-Pendant der .so?
* DLL
- EXE
- SYS
- INF

? Was bewirkt ldconfig -p?
* Zeigt den Cacheinhalt
- Entfernt Bibliotheken
- Lädt Bibliotheken
- Prüft Pakete

? Welche Aussage ist richtig?
* ldd sollte nicht auf unbekannte Programme angewandt werden
- ldd ist völlig risikofrei
- ldd installiert Bibliotheken
- ldd ersetzt ldconfig

## Spickzettel
- .so · ldd · ldconfig (-p)
- /etc/ld.so.conf(.d) → ldconfig
- /etc/ld.so.cache · LD_LIBRARY_PATH (Test)
- /lib /lib64 /usr/lib
