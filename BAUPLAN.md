# BAUPLAN – Netzilon Ultra 2.0.0

Auftraggeber: Philipp (FiSi-Azubi, IT-Akademie Dr. Heuer). Sprache überall: **Deutsch** (Fachbegriffe mit englischem Original in Klammern).
Ziel: die ultimative Lern-App für die gesamte FiSi-Ausbildung, damit er JEDE Prüfung schafft. Es darf NICHTS aus seinem Material vergessen werden.

## Pfade
- Projekt (Code + Inhalte): `/home/claude/build/netzilon-ultra/` (Kopie von Netzilon 1.0.1, Electron, Inhalte als Markdown unter `content/`, Format: `content/_SCHEMA.md`)
- Korpus (alle Texte seiner Uploads): `/home/claude/build/corpus/txt/<Originalname>.txt` (Text-Extraktion) und `/home/claude/build/corpus/ocr/<Originalname>.txt` (OCR von Scans, Seiten mit `=== Seite N ===`). Bei Scans immer `ocr/` nehmen.
- Entpackte Archive: `/home/claude/build/corpus/arch/` (Netzilon, NetworkGodMode, Gellernator, Obsidian-Docs, Lernzettel-ZIP, RemNote, uebersicht_rar)
- Ledger aller Quelldateien: `/home/claude/build/corpus/ledger.json`
- Zuständigkeit je Agent: `/home/claude/build/assign/<AGENT>.txt` (eine Quelldatei pro Zeile; Name im Korpus = Zeile + `.txt`, bei ZIP-Inhalten steht `::` im Namen, z. B. `corpus/txt/<zip>::<pfad>.txt`)
- Statusbericht je Agent: `/home/claude/build/status/<AGENT>.md`

## Entscheidungen (verbindlich)
- Name **Netzilon Ultra**, Version 2.0.0, Autor GPProductions. Ersetzt/erweitert Netzilon: alle bisherigen Inhalte bleiben.
- Plattform: Windows portable .exe (offline, bauen.bat) + iPhone: eine Offline-HTML-Datei (localStorage); Aufteilen erlaubt, falls zu groß.
- Ziele: AP1, AP2 (IHK FiSi), Schule (AZ-800/801, Linux/LPIC, SQL/DB, Netzwerk), Zertifikate (CCNA 200-301, LPIC-1, DP-203), Kaufmännisch/WiSo.
- Nur FiSi-relevante Teile des FIAE-Katalogs; C# als kurzes Bonuskapitel.
- Lernstoff wie Netzilon: Profi + Einfach (wie für 10-Jährige, bei null anfangen) + Merksatz + Prüfungsfalle + Grafik (Animation) + Lab + Befehle + Übungen + Karteikarten + Quiz. Stufen Einsteiger/Fortgeschritten/Profi.
- Alle 370 DP-203-Fragen auf Deutsch. Fragen aus Fragenpools unverändert mit Quellenangabe.
- Kalender nach Ausbildungsplan, Prüfungstermine trägt er selbst ein (Countdown erst dann), Rückwärts-Lernplan.
- Schwächenanalyse + Wiederholplan, Fehlerkatalog, Tagesplan, IHK-Notenprognose.
- Module: Rechner (Subnetting, VLSM, IPv6, RAID, USV, Zahlensysteme, Kalkulation, Nutzwertanalyse, Netzplan, Break-even, Stromkosten, Dateigröße/Übertragung, Amortisation) mit Rechenweg und Zufallsaufgaben; Netzwerk-Simulator (Packet-Tracer-light, aus NetworkGodMode ableiten); Terminal-Trainer (PowerShell, CMD, Cisco IOS, Linux-Bash, simuliert, mit Aufgaben); Lernspiele (6 bestehende + neue); Dojo „IHK-Fallen"; Glossar; druckbare Cheat-Sheets; PDF/Druck-Export je Thema; Spickzettel-Kurzform am Prüfungstag; Prüfungsmodus mit IHK-Zeitlimits (AP1 90 min); alte IHK-Prüfungen nach Themenhäufigkeit.
- Design: Netzilon-Look weiterführen (Tafel + Weltall, Glas-Buttons), Farbwelt dunkel mit Blau/Cyan-Akzent, Hell/Dunkel umschaltbar, Erklär-Animationen je Thema + Mikro-Effekte, Fokus-Modus, Tastenkürzel, Töne leise und standardmäßig aus. iPhone: Tab-Leiste unten, Wischgesten, „Zum Home-Bildschirm".
- Motivation: XP, Level, Ranks (Azubi → Junior-Admin → Admin → Senior-Admin → Domain Admin → Enterprise Admin), Streak + Tagesziel + Mini-Quests, Abzeichen.
- Intro (Domänen-Admin vs. Linux-User, GPProductions-Würfel) und Stickman mit Ticket „Drucker geht nicht" bleiben, abschaltbar.
- Eigene Lab-Beispiele (Heimlabor example.com, Schule exa.local) ohne Passwörter; Windows-Labs mit GUI-Schritten UND PowerShell, Maschine immer angeben; Linux per CLI.
- Veraltetes als Legacy markieren. Klasse darf mitnutzen (keine Rangliste). Sync nur per Export/Import.

## Inhaltsformat 2.0 (Erweiterung von content/_SCHEMA.md – alles Bisherige gilt weiter)
Kopf zusätzlich erlaubt: `bereich:` AP1 | AP2 | AZ-800 | AZ-801 | Linux | CCNA | Datenbanken | Azure Data | WiSo | Prüfung | Referenz | Legacy | Bonus ; `pruefungen: [AP1, AP2, LPIC-1, CCNA, DP-203, Schule]` ; `fach:` Name des Fachs aus dem Ausbildungsplan (z. B. „Linux I", „SQL / Datenbanken", „Windows Server / AZ-800", „TCP/IP – CCNA – Basic", „ITK / Grundlagen", „GDP / OOP", „Office (EF)", „PV – AP1", „PV – AP2", „WiSo").

Neue optionale Abschnitte (genau so geschrieben):
- `## Lücken` – je Zeile `- Text mit {Lösung} in geschweiften Klammern` (mehrere Lücken erlaubt)
- `## Zuordnen` – `### Titel` dann Zeilen `- Begriff => Zuordnung`
- `## Reihenfolge` – `### Titel` dann nummerierte Zeilen `1. Schritt` in RICHTIGER Reihenfolge
- `## Freitext` – je Zeile `- F: Aufgabe | M: Musterlösung | P: Punkte` (IHK-Stil „Nennen/Erläutern/Begründen")
- `## Szenario` – `### Titel`, dann Absatz Ausgangslage, dann Zeilen `- F: Frage | A: Lösung`
- `## Spickzettel` – max. 10 knappe Zeilen fürs Prüfungstag-Kurzformat
- `## Grafik` – weiter `### Name` + Schritte; NEU maschinenlesbar animierbar: nummerierte Zeilen. Form `1. A -> B: Beschriftung` (Paket fliegt von Akteur A zu B), `1. A: Text` (Akteur A hebt hervor + Text), sonst `1. Text` (Erklärschritt). Akteure sind kurze Namen (Client, DHCP-Server, Router, Switch, Disk1 …). Jede Themen-Datei mit Ablauf SOLL mind. eine animierbare Grafik haben.
Quiz: weiter `? Frage` / `* richtig` / `- falsch` (genau 3 falsche, bei Fragen mit mehreren richtigen mehrere `*`), optional `! Erklärung`, optional Zeile `@ Quelle` (z. B. `@ DP-203 Frage 42`).

Qualitätsregeln für Inhalte: fachlich korrekt (Stand Windows Server 2022/2025, Win 11, aktuelle Gesetze 2026), Profi mind. ~1 Seite, Einfach mind. ~1 Seite, mind. 8 Karteikarten und 8 Quizfragen pro Themenseite (Prüfungsfragen-Dateien: so viele wie Quelle hat), `quellen:` listet die Originaldateinamen (ohne Hash-Präfix ok), jede id eindeutig (Präfix = Ordner). Keine Inhalte erfinden, die der Quelle widersprechen; Fehler in Quellen korrigieren und in `## Prüfungsfalle` erwähnen.

## Ordner-Zuständigkeit (nur im eigenen Ordner schreiben!)
| Agent | Schreibt in | Quellen |
|---|---|---|
| A1 Linux/LPIC | `content/linux/` | assign/A1.txt (Linux-Skripte 1.00–1.20, LPI 101/102/010, Eckert CompTIA Linux+, Kodierung/SSH) |
| A2 Netzwerk/CCNA | `content/ccna/`, `content/netz/` | assign/A2.txt (CCNA-Notes Jeremy, Cisco 100-101/200-301, Netzwerk-Folien, IPv4 2–5, Routing, DHCP/DNS-Übungen, OSI, Obsidian-Netzwerk) |
| A3 Server/Storage/DB/Data | `content/server/`, `content/datenbanken/`, `content/azure-data/` | assign/A3.txt |
| A4 AP/WiSo/Kaufmännisch/Allgemein | `content/wiso/`, `content/ihk/`, `content/bonus/` | assign/A4.txt + `corpus/kaufmaennisch_80.md` |
| B Prüfungsfragen | `content/pruefung/dp203/`, `content/pruefung/lpic/`, `content/pruefung/ihk/`, `content/pruefung/schule/` | assign/B.txt + Themenhäufigkeits-Bild |
| C App-Code | alles außer `content/` (app/, main.js, preload.js, package.json, tools/, bauen.bat, CHANGELOG.md, content/_SCHEMA.md) | assign/C.txt, NetworkGodMode/Gellernator-Code, Ausbildungsplan-Bilder |
| D Anomalie-Prüfer | `status/D.md`, darf Fehler in allen Ordnern korrigieren | alles |
| E Vollständigkeits-Prüfer | `status/E.md`, darf fehlende Inhalte ergänzen | ledger.json vs. content |

Bestehende Netzilon-Inhalte (`content/ap1, ap2, az800, az801, legacy, pruefung/a13-*, referenz`) NICHT löschen. Wer sie fachlich ergänzen muss, legt neue Dateien im eigenen Ordner an und setzt `verweise:`.

## Statusbericht (Pflicht, `status/<AGENT>.md`)
1. Tabelle: jede Datei aus assign/<AGENT>.txt → Status (verarbeitet | irrelevant + Grund | Duplikat von …) → erzeugte Inhalts-ids
2. Liste aller erzeugten Dateien mit Anzahl Karteikarten/Quizfragen
3. Offene Punkte
