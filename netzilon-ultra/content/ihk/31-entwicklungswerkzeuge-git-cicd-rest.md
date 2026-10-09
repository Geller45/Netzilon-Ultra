---
id: ihk-entwicklungswerkzeuge
bereich: AP2
block: IHK
kapitel: Entwicklung und Werkzeuge
titel: Entwicklungsumgebung, Compiler, Git, CI/CD, REST und Paradigmen
stufe: Fortgeschritten
fach: PV – AP2
pruefungen: [AP2]
quellen: [Entwicklungsumgebungen-Tools.md (Obsidian v1.0.0 + v2.0.0)]
verweise: [ihk-oop-grundlagen, ihk-softwaretests-qs, ihk-architektur-patterns, bonus-csharp-kompakt]
---

## Profi

### Werkzeugkette
Quellcode -> **Präprozessor** (#include, #define) -> **Compiler** (Syntaxprüfung, Übersetzung in Assembler/Objektcode) -> **Assembler** (ASM nach Maschinencode, `.o`) -> **Linker** (verbindet Objektdateien und Bibliotheken, löst Referenzen auf) -> ausführbare Datei. `undefined reference to ...` ist ein **Linker**-Fehler, `expected ';'` ein Compiler-Fehler. Statisches Linken kopiert die Bibliothek in die Datei (größer, eigenständig), dynamisches Linken lädt `.dll`/`.so` zur Laufzeit (kleiner, Abhängigkeit).

### Compiler und Interpreter
| | Compiler | Interpreter |
|---|---|---|
| Prinzip | gesamter Code vor der Ausführung | Zeile für Zeile zur Laufzeit |
| Geschwindigkeit | schnell | langsamer |
| Fehler | alle Syntaxfehler beim Kompilieren | erst wenn die Zeile erreicht wird |
| Portabilität | plattformgebunden | portabel |
| Beispiele | C, C++, Rust, Go | Python, JavaScript, PHP, Ruby |

Java und C# sind **Hybride**: Compiler erzeugt Bytecode, die virtuelle Maschine (JVM, .NET-Laufzeit) führt ihn mit JIT-Kompilierung aus. Ein **Transpiler** übersetzt Hochsprache in Hochsprache (TypeScript nach JavaScript). Ein **Assembler** übersetzt Assemblersprache 1:1.

### Fehlerarten
Syntaxfehler (Compile-Zeit, vom Compiler gefunden), Laufzeitfehler (Absturz/Exception, z. B. Division durch 0), **Logikfehler** (falsches Ergebnis ohne Absturz; findet nur Test oder Debugger). Debugger: Breakpoint setzen, schrittweise ausführen (Step Over/Into/Out), Variablen und Call Stack prüfen.

### Git
Bereiche: Working Directory -> `git add` -> Staging Area -> `git commit` -> lokales Repository -> `git push` -> Remote. `git pull` = `git fetch` + `git merge`. Branches: `git branch x`, `git switch x` oder `git checkout -b x`, `git merge x`. Konflikt nur, wenn **dieselbe Zeile** in beiden Branches verschieden geändert wurde. Lösung: `git status`, Datei öffnen, Marker `<<<<<<<`, `=======`, `>>>>>>>` entfernen, `git add`, `git commit`. Merge erzeugt einen Merge-Commit (Historie bleibt verzweigt), Rebase setzt Commits neu auf (linear, nie auf gemeinsamen Branches). **Git ist ein Werkzeug (lokal), GitHub/GitLab sind Hosting-Plattformen**; ein Pull Request ist ein Plattform-Feature, kein Git-Befehl.

### CI/CD
**Continuous Integration:** Build und automatische Tests bei jedem Commit. **Continuous Delivery:** zusätzlich automatisch bis Staging, Freigabe für Produktion **manuell**. **Continuous Deployment:** komplett automatisch bis Produktion. Pipeline: Git-Trigger, Build, Unit-Tests, Integrationstests, statische Analyse, Deploy Staging, End-to-End-Tests, Deploy Produktion. Werkzeuge: Jenkins, GitHub Actions, GitLab CI, Azure DevOps.

### Programmierparadigmen
| Paradigma | Kern | Sprachen |
|---|---|---|
| strukturiert | Sequenz, Auswahl, Wiederholung, kein goto | C, Pascal |
| prozedural | Gliederung in Prozeduren/Funktionen, Daten und Funktionen getrennt | C, Pascal, Fortran |
| objektorientiert | Objekte bündeln Daten und Methoden (Kapselung, Vererbung, Polymorphie) | Java, C#, C++, Python |
| funktional | Funktionen ohne Seiteneffekte, unveränderliche Daten | Haskell, F# |

Strukturiert beschreibt den Kontrollfluss, prozedural die Gliederung; C ist beides. Python und JavaScript sind multiparadigmatisch.

### Sprachauswahl
Kriterien: Performance/Speicher, Portabilität, Frameworks/Bibliotheken, Know-how im Team. IoT-Gerät mit 256 KB RAM: C oder C++ (kein Garbage Collector, kein Laufzeit-Overhead).

### REST
Sechs Constraints: Client-Server, **stateless**, cacheable, einheitliche Schnittstelle, mehrschichtiges System, Code on Demand (optional). HTTP-Methoden: GET = lesen (idempotent, 200), POST = anlegen (**nicht** idempotent, 201), PUT = ersetzen (idempotent), PATCH = teilweise ändern, DELETE = löschen (idempotent, 200/204). Statuscodes: 401 = nicht angemeldet, 403 = angemeldet aber keine Berechtigung, 404 = nicht gefunden. SOAP ist ein striktes XML-Protokoll, REST ein Architekturstil meist mit JSON.

## Einfach

Ein Programm schreiben ist wie ein Rezept auf Deutsch aufschreiben, das ein Computer nur auf Maschinensprache versteht. Der **Compiler** ist ein Übersetzer, der das ganze Buch vorher übersetzt. Danach liest der Computer nur noch die fertige Fassung, das geht schnell. Der **Interpreter** ist ein Dolmetscher, der live Satz für Satz übersetzt; das geht überall, ist aber langsamer. Der **Linker** klebt die einzelnen übersetzten Kapitel und fertige Bücher aus der Bibliothek zu einem Buch zusammen.

Es gibt drei Fehlerarten. Ein Tippfehler im Rezept ist ein Syntaxfehler, den merkt der Übersetzer sofort. Ein Rezept, das sagt „teile durch null", lässt das Programm abstürzen. Ein Rezept, das Zucker statt Salz verlangt, ist ein Logikfehler: Alles läuft, schmeckt aber falsch. Das findet nur, wer probiert (testet) oder Schritt für Schritt nachschaut (Debugger).

**Git** ist wie ein Spielstand-System mit Speicherpunkten. `commit` speichert einen Punkt bei dir zu Hause, `push` schickt ihn in die gemeinsame Cloud. Ein Branch ist eine Kopie, in der du etwas ausprobierst, ohne das Original kaputt zu machen. Mit `merge` bringst du es zurück. Streit (Konflikt) gibt es nur, wenn zwei Leute dieselbe Zeile unterschiedlich geändert haben, dann entscheidest du, welche gilt.

**CI/CD** ist ein Fließband: Sobald jemand Code abgibt, baut und testet eine Maschine alles automatisch. Bei Delivery drückt am Ende ein Mensch den Knopf „Veröffentlichen", bei Deployment passiert auch das von allein.

**REST** ist wie eine Speisekarte für Programme: GET holt etwas, POST legt etwas Neues an, PUT ersetzt, DELETE löscht. Der Kellner (Server) merkt sich nichts von deiner letzten Bestellung, deshalb muss jede Bestellung alles enthalten (stateless).

## Merksatz
- Compiler = einmal übersetzen, schnell laufen. Interpreter = jedes Mal übersetzen, portabel.
- Der Compiler findet Syntaxfehler, nie Logikfehler.
- Commit ist lokal, erst Push überträgt.
- pull = fetch + merge.
- Delivery = Knopf wartet auf Menschen, Deployment = kein Knopf.
- POST ist nicht idempotent, GET/PUT/DELETE sind es.
- 401 = wer bist du?, 403 = du darfst nicht.

## Prüfungsfalle
- „Java ist rein kompiliert/interpretiert": richtig ist Bytecode + JVM mit JIT.
- Git und GitHub gleichsetzen; Pull Request als Git-Befehl nennen.
- `undefined reference` dem Compiler zuordnen (ist Linker).
- 401 und 403 vertauschen.
- Delivery und Deployment verwechseln, beide werden „CD" abgekürzt.
- Strukturiert und prozedural als dasselbe behandeln.
- Merge-Konflikt bei jeder Änderung erwarten; er entsteht nur bei derselben Zeile.
- Im Obsidian-Abkürzungsverzeichnis wird „PR" als Pull Request und „CI" als Continuous Integration geführt, im Kommunikationskontext (Public Relations, Corporate Identity) bedeuten sie anderes.

## Grafik
### Git-Ablauf
1. Entwickler: ändert Dateien im Working Directory
2. Entwickler -> Staging Area: git add
3. Staging Area -> Lokales Repo: git commit
4. Lokales Repo -> Remote: git push
5. Remote -> Lokales Repo: git fetch
6. Lokales Repo: git merge führt Änderungen zusammen

### CI/CD-Pipeline
1. Entwickler -> Git-Server: Push
2. Git-Server -> Build-Server: Trigger
3. Build-Server: Build und Unit-Tests
4. Build-Server -> Staging: automatisches Deployment
5. Staging: End-to-End-Tests
6. Mensch -> Produktion: Freigabe (nur bei Continuous Delivery)

## Befehle
`git init` – neues Repository anlegen
`git clone <url>` – Repository kopieren
`git status` – Änderungen anzeigen
`git add .` – alle Änderungen vormerken
`git commit -m "Text"` – lokal speichern
`git push origin main` – zum Remote senden
`git pull origin main` – fetch plus merge
`git switch -c feature` – Branch erstellen und wechseln
`git merge feature` – Branch zusammenführen
`git log --oneline --graph` – Verlauf als Graph

## Übungen
- A: Schreiben Sie die Befehle, um ein lokales Projekt erstmals nach GitHub zu übertragen. | L: git init; git add .; git commit -m "Initial"; git remote add origin <url>; git push -u origin main
- A: Welche Sprache für ein IoT-Gerät mit 256 KB RAM? Begründen Sie. | L: C oder C++, weil hardwarenah, ohne Garbage Collector und ohne Laufzeitumgebung, volle Speicherkontrolle.
- A: Ordnen Sie zu: kein goto nur drei Kontrollstrukturen; Daten und Funktionen getrennt; Funktionen ohne Seiteneffekte. | L: strukturiert; prozedural; funktional.

## Karteikarten
- F: Compiler oder Interpreter: Wann werden Syntaxfehler gefunden? | A: Compiler: alle beim Kompilieren; Interpreter: erst bei Erreichen der Zeile.
- F: Aufgabe des Linkers? | A: Objektdateien und Bibliotheken zur ausführbaren Datei verbinden, Referenzen auflösen.
- F: Was ist ein Transpiler? | A: Übersetzt Hochsprache in andere Hochsprache, z. B. TypeScript nach JavaScript.
- F: Welche Fehlerart findet der Compiler nicht? | A: Logikfehler.
- F: git pull entspricht? | A: git fetch plus git merge.
- F: Wann entsteht ein Merge-Konflikt? | A: Wenn dieselbe Zeile in zwei Branches unterschiedlich geändert wurde.
- F: Unterschied Git und GitHub? | A: Git ist das lokale Versionskontrollwerkzeug, GitHub eine Hosting-Plattform.
- F: Continuous Delivery vs. Deployment? | A: Delivery: Freigabe zur Produktion manuell; Deployment: vollautomatisch.
- F: Was bedeutet stateless bei REST? | A: Der Server speichert keinen Sitzungszustand; jede Anfrage enthält alle Informationen.
- F: Welche HTTP-Methode ist nicht idempotent? | A: POST.
- F: Statuscode 401 vs. 403? | A: 401 nicht authentifiziert, 403 keine Berechtigung.
- F: Nennen Sie vier Kriterien der Sprachauswahl. | A: Performance, Portabilität, Frameworks, Know-how im Team.

## Quiz
? Welches Werkzeug meldet „undefined reference to funktionX"?
* Linker
- Präprozessor
- Debugger
- Interpreter
! Die Funktion wurde deklariert, aber nicht gelinkt.

? Was gilt für Java?
* Es wird zu Bytecode kompiliert und von der JVM ausgeführt.
- Es wird direkt in Maschinencode für jede CPU kompiliert.
- Es wird reine Zeile für Zeile interpretiert.
- Es wird nur transpiliert.

? Was überträgt Änderungen zum Remote-Repository?
* git push
- git commit
- git add
- git fetch

? Wer findet einen Logikfehler am sichersten?
* Test oder Debugger
- Compiler
- Linker
- Präprozessor

? Welche HTTP-Methode legt eine neue Ressource an (201 Created)?
* POST
- GET
- PUT
- DELETE

? Was ist Continuous Deployment?
* Vollautomatische Auslieferung bis in die Produktion
- Nur automatische Tests bei jedem Commit
- Auslieferung bis Staging mit manueller Freigabe
- Manuelles Kopieren per FTP

? Welcher Statuscode bedeutet „angemeldet, aber keine Berechtigung"?
* 403
- 401
- 404
- 201

? Welche Paradigma-Zuordnung stimmt?
* Haskell: funktional
- C: ausschließlich objektorientiert
- Java: rein funktional
- Python: ausschließlich prozedural

? Was ist ein Pull Request?
* Ein Plattform-Feature für Code-Review vor dem Merge
- Ein Git-Befehl zum Herunterladen
- Eine Art von Branch
- Ein Linker-Parameter

? Welche Aussagen zu REST sind richtig? (mehrere)
* Der Server ist zustandslos (stateless).
* GET ist idempotent.
- POST ist idempotent.
- REST erlaubt ausschließlich XML.
