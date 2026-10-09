# 2.1.0 – Paket 1 (Motivation & Prüfungsmodi)
- Schwierigkeit: jede Aufgabe (Quiz, Prüfung, Lesen, Aufgabe des Tages) hat die Markierungen leicht / mittel / schwer; Vorschlag der App gestrichelt, du überschreibst; neue Rubrik „Nach Schwierigkeit“ mit Üben-Knopf
- Fortschritt als x/y (z. B. 33/77 erfolgreich) je Thema, Bereich, Prüfung/Ziel und gesamt; neue Ansicht „Fortschritt“ mit Meisterschaft in %
- Level jetzt bis 100 (neue Kurve, ca. 62.400 XP), neue Ränge bis „Netzilon-Meister (Durchgespielt)“, Abzeichen Durchgespielt/Meisterschaft 95 %
- Zufallsprüfung: 60 neue Fragen aus AP1, AP2 (inkl. WiSo), WiSo oder dem ganzen Pool; bevorzugt noch nicht gezogene Fragen; Zeitlimit und IHK-Note
- Aufgabe des Tages: alle 24 h öffnet sich ein Feld mit einer neuen Frage (365er Raster, Serie, Bonus-XP)
- Fix: Prüfungsmodus stürzte bei Zuordnen-/Reihenfolge-Aufgaben vor dem Anzeigen ab

# 2.0.0 – Netzilon Ultra (GPProductions)
- Umbenennung Netzilon -> Netzilon Ultra; alle Inhalte aus 1.x bleiben
- Inhaltsformat 2.0: Lücken, Zuordnen, Reihenfolge, Freitext, Szenario, Spickzettel, animierbare Grafik, Quiz-Quellen
- Animations-Engine, Prüfungsmodus (AP1 90 min), Dojo IHK-Fallen, Schwächenanalyse
- Kalender/Lernplan, XP/Level/Ranks/Streak/Abzeichen
- Rechner mit Rechenweg, Netzwerk-Simulator, Terminal-Trainer, Glossar, Cheat-Sheets, Druck/PDF, Spickzettel-Modus
- Eine HTML-Datei für iPhone (npm run build:html), bauen.bat baut EXE + HTML

# 1.0.1 – Paket 6a (Weltall & AP1 2026)
- Heft-Modus ersetzt durch Weltall-Modus: dunkler Raumschiff-Rahmen, Nebel, Sternenfeld mit Parallaxe und Funkeln, Sternschnuppen, Planet mit Ring und Mond, leuchtende Konsolen-LEDs
- Gespeicherter Heft-Modus wird automatisch auf Weltall umgestellt; Umschalter ◐ wechselt Tafel ↔ Weltall
- AP1 2026 Original (GWS GmbH): alle 4 Aufgaben als 2 Prüfungsseiten mit Lösungen, Rechenwegen, Merksätzen und 20 Quizfragen

# 1.0.0 – Paket 5 (Intro & Stickman)
- Start-Intro: Matrix-/Netzwerk-Regen, Domänen-Admin („FÜR KLICKI!“) verprügelt Linux-User („sudo apt install“) mit Tastatur, Tasten fliegen ab; danach GPProductions-Glaswürfel; ab 2. Start überspringbar (Klick/Leertaste/Esc), in Einstellungen abschaltbar
- Rand-Stickman läuft, sprintet, springt und klettert um den Bildschirm, gejagt vom Ticket „Drucker geht nicht“
- Ticket anklicken: 10 lustige Waffen (Tacker, Toner, Gummi-Ente, Neustart-Hammer …) werfen es zurück
- Ticket groß und lesbar (#Nr · PRIO 1 · Drucker geht nicht · Status ESKALIERT)
- Nach 2 min Inaktivität holt das Ticket auf und erwischt ihn; Stickman in Einstellungen abschaltbar

# 1.0.0 – Paket 4 (Lernspiele)
- Sechs Spiele mit deinem Lernstoff: Blitz-Quiz (3 Leben, Serien-Bonus), Memory (Frage/Antwort-Paare), Zuordnen (Befehle oder Ports), Wahr oder Falsch (60 s), Rechen-Sprint (Dual, Hex, Zweierkomplement, Subnetting), Lab-Reihenfolge
- Bereichsfilter, Bestwerte je Spiel, Tastensteuerung, Spielzähler in der Statistik

# 1.0.0 – Paket 3 (Suche & Werkzeuge)
- Volltextsuche über alle Abschnitte: Tippfehler-tolerant, Wortanfänge, Synonyme/Abkürzungen (GPO, DC, CA, USV …), Filter nach Bereich, Treffer markiert, Sprung direkt zur Stelle (Strg+K oder Strg+F)
- Rechner: IPv4-Subnetz, VLSM, IPv6 inkl. Teilnetze, Zahlensysteme, USV, RAID, Übertragungszeit – jeweils mit Rechenweg
- Befehlsreferenz: alle Befehle filterbar nach Kategorie und Text, Kopierknopf

# 1.0.0 – Paket 2 (Lernen)
- Karteikarten mit SM-2 (wie Anki): Nochmal/Schwer/Gut/Leicht, Tasten Leertaste + 1–4, neue Karten pro Tag, Intervall-Faktor und zweites Intervall einstellbar
- Quiz-Übungsmodus mit sofortiger Lösung und Erklärung (Tasten A–D, Enter)
- Prüfungssimulation mit Zeitlimit, Fragenübersicht und IHK-Notenschlüssel
- Auswahl nach Bereich/Kapitel, Pool: alle, nur falsch, nur neue
- Lab-Anleitungen als Checklisten, Übersicht aller Labs
- Statistik: gelesen, Karten, Trefferquote, Prüfungsverlauf

# 1.0.0 – Paket 1 (Gerüst)
- Inhalte aus content\ werden automatisch eingelesen (eingebaut + Ordner content\ neben der .exe)
- Profil beim ersten Start
- Startseite als Stundenplan-Übersicht
- Leseansicht mit Umschalter Profi/Einfach, Merksatz, Prüfungsfalle, LEGACY-Stempel
- Tafel-Modus (dunkel) und Heft-Modus (hell), Vollbild mit F11
- Fortschritt in fortschritt.json neben der .exe
