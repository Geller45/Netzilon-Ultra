# Paket 2 – gemeinsame Regeln für alle Inhalts-Agenten (Netzilon Ultra 2.2.0)

Projekt: `/home/user/Netzilon-Ultra/netzilon-ultra/` (Electron-App, Inhalte als Markdown unter `content/`).
Pflichtlektüre vor dem Schreiben: `content/_SCHEMA.md`, `../BAUPLAN.md` (Abschnitt „Inhaltsformat 2.0“), `app/parser.js` (wie Abschnitte geparst werden),
Musterdateien: `content/az800/d3-vms/03-nested-virtualization.md`, `content/wiso/06-sozialversicherung.md`, `content/server/s1-storage/02-san.md`.

## Regeln
- Sprache Deutsch, Fachbegriffe mit englischem Original in Klammern. UTF-8 mit echten Umlauten.
- Stand: Windows Server 2022/2025, Windows 11, Gesetze 2026. Fachlich korrekt, nichts erfinden; bei Unsicherheit über exakte Zahlen (z. B. Beitragssätze) lieber Prinzip erklären statt falsche Zahl. Keine Passwörter in Labs.
- Format 2.0: Kopf (`---` … `---`) mit `id` (eindeutig, Präfix = Ordner), `bereich`, `block`, `kapitel`, `titel`, `stufe` (Einsteiger|Fortgeschritten|Profi), `fach`, `pruefungen: [...]`, `quellen: [...]`, `verweise: [...]` (nur existierende ids, mit `grep -r "^id:" content` prüfen).
- Themenseite = `## Profi` (≥ ~1 Seite), `## Einfach` (≥ ~1 Seite, wie für 10-Jährige), `## Merksatz`, `## Prüfungsfalle`, `## Grafik` (mind. eine **animierbare** Grafik: `### Name` + nummerierte Zeilen `1. A -> B: Text` / `1. A: Text` / `1. Text`), `## Lab` (wo sinnvoll: `### GUI` und `### PowerShell`, **Maschine immer angeben**, Heimlabor `example.com`, Schule `exa.local`), `## Legende`, `## Karteikarten` (≥ 8), `## Quiz` (≥ 8).
- Quiz: `? Frage` / `* richtig` / `- falsch` (bei einer richtigen Antwort **genau 3 falsche**), optional `! Erklärung` (sehr erwünscht), optional `@ Quelle`.
- Weitere Aufgabenarten (genau so schreiben):
  - `## Lücken` – je Zeile `- Text mit {Lösung} …` (Alternativen `{a|b}`)
  - `## Zuordnen` – `### Titel`, Zeilen `- Begriff => Zuordnung`
  - `## Reihenfolge` – `### Titel`, Zeilen `1. Schritt` in RICHTIGER Reihenfolge
  - `## Freitext` – je Zeile `- F: Aufgabe | M: Musterlösung | P: Punkte`
  - `## Szenario` – `### Titel`, Absatz Ausgangslage, dann Zeilen `- F: Frage | A: Lösung` (optional ` | P: Punkte`)
  - Ein senkrechter Strich im Text (PowerShell-Pipeline) in Karteikarten/Freitext/Szenario MUSS als `\|` geschrieben werden.
- **NEU `## Legende`** (Pflicht in jeder neuen Datei): beantwortet was, wie, wann, wo, warum. Format:
  ```
  ## Legende
  ### Begriff (optional, mehrere Blöcke erlaubt)
  - Was: …
  - Wie: …
  - Wann: …
  - Wo: …
  - Warum: …
  ```
  Erlaubte Schlüssel: Was, Wie, Wann, Wo, Warum, Wer, Womit, Beispiel.
- Im Codeblock niemals eine Zeile mit `## ` beginnen lassen (wäre neuer Abschnitt).
- Prüfen: `node tools/check-content.js --streng -v 2>&1 | grep <dein-ordner>` → keine FEHLER, keine Warnungen, keine Hinweise (<8) für deine Dateien. Abschlusszeile muss `0 Fehler` zeigen.
- NUR im eigenen Ordner schreiben. Nichts committen. Am Ende Statusbericht `../status/P2-<AGENT>.md`: Dateien, Anzahl Karten/Aufgaben je Art, offene Punkte.
