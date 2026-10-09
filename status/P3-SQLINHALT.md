# P3 – SQL-Inhalte (Agent „SQL-Inhalte“) – Statusbericht

Ordner: `netzilon-ultra/content/datenbanken/d4-sql-labor/` (nur dort geschrieben, nichts committet).
Kopf jeder Datei: `bereich: Datenbanken`, `block: D4`, `kapitel: SQL-Labor (Firmen-DB)`, `fach: SQL / Datenbanken`, `pruefungen: [AP1, AP2, Schule]`, `quellen: [SQLite-Dokumentation, Microsoft Learn – T-SQL]`, Verweise auf d2/d3-ids (alle mit grep/Checker geprüft, kein „Verweis ins Leere“).

## Dateien
| Datei | id | Stufe | Quiz | Karten | Lücken | Zuordnen | Reihenf. | Freitext | Szenario |
|---|---|---|---|---|---|---|---|---|---|
| 01-select-where-order.md | db-labor-select | Einsteiger | 13 | 12 | 4 | 1 | 1 | 2 | 1 (4 Fragen) |
| 02-aggregate-group-by.md | db-labor-aggregate | Fortgeschritten | 13 | 12 | 3 | 1 | 1 | 2 | 1 (4) |
| 03-joins.md | db-labor-joins | Fortgeschritten | 12 | 12 | 3 | 1 | 1 | 2 | 1 (4) |
| 04-unterabfragen.md | db-labor-unterabfragen | Profi | 12 | 12 | 4 | 1 | 1 | 2 | 1 (4) |
| 05-dml-insert-update-delete.md | db-labor-dml | Fortgeschritten | 12 | 12 | 4 | 1 | 1 | 2 | 1 (4) |
| 06-ddl-constraints.md | db-labor-ddl | Fortgeschritten | 12 | 12 | 4 | 1 | 1 | 2 | 1 (4) |
| 07-views-indizes.md | db-labor-views-indizes | Profi | 12 | 12 | 4 | 1 | 1 | 2 | 1 (4) |
| 08-transaktionen-acid.md | db-labor-transaktionen | Profi | 12 | 12 | 4 | 1 | 1 | 2 | 1 (4) |
| 09-fensterfunktionen-strings-datum.md | db-labor-fenster | Profi | 12 | 12 | 4 | 1 | 1 | 2 | 1 (4) |
| 10-sql-pruefungsfragen.md (`typ: fragen`) | db-labor-pruefung | Fortgeschritten | 49 | – | – | – | – | – | – |
| **Summe** | | | **159** | **108** | **34** | **9** | **9** | **18** | **9** |

**Aufgaben gesamt: 238** (Ziel ≥ 170). Alle Szenarien im Stil „Die Personalabteilung der Netzilon GmbH möchte …“.

Jede Themenseite enthält: Profi (mit Abschnitt „### T-SQL-Unterschied“ als Vergleichstabelle), Einfach, Merksatz, Prüfungsfalle, Grafik (2–3 animierbare Abläufe), Lab (`### GUI` = SQL-Labor in Netzilon, `### T-SQL` = SSMS auf SQL01.example.com), Legende (Was/Wie/Wann/Wo/Warum), Karteikarten, Quiz mit `!`-Erklärung, Lücken, Zuordnen, Reihenfolge, Freitext, Szenario. Jede Seite sagt „Probier es im SQL-Labor (Werkzeuge) aus“.

## Prüfung
- `node tools/check-content.js --streng -v` → keine Fehler/Warnungen/Hinweise für d4-sql-labor; Abschluss `640 Dateien, …, 0 Fehler, 0 Warnungen`.
- SQL-Prüfung mit sql.js 1.10.3 (SQLite 3.45.2) in Node:
  - alle 55 ` ```sql `-Codeblöcke (SQLite) ausgeführt – sowohl gegen eigene Testdaten als auch gegen die echte Firmen-DB aus `app/sqldb.js` (`FirmaDB.schemaSql()` + `datenSql()`) → 0 Fehler. T-SQL-Blöcke stehen als ` ```tsql `, absichtlich fehlerhafte Beispiele als ` ```text `.
  - 87 SQL-Snippets aus richtigen Quiz-Antworten/Musterlösungen ausgeführt → nur die 6 erwarteten Fragmente (z. B. `WITH TIES`, das bewusst falsche Freitext-Beispiel, Platzhalter-Tabelle `t`) schlagen fehl.
  - Fakten gegen die echte DB geprüft: 100 MA / 98 mit Abteilung, NOT-IN-Falle (bestellungen.ma_id enthält NULL → 0 Zeilen), 1 Kunde ohne Bestellung, ma_id 23 in IT-Support (Szenario Versetzung), Abteilungs-IDs 3/4/6/10.
- Antwortlängen ausgeglichen: Anteil „richtige Antwort ist die längste“ je Datei 3–5 von 12/13, Datei 10: 16 von 49; Position der richtigen Antwort gemischt.

## Offene Punkte / Hinweise
- Einige Beispiele nutzen konkrete IDs (ma_id 17/23, projekt_id 3, best_id 42); sie existieren in der Seed-DB, können sich aber bei geändertem Seed/Generator ändern.
- Lab-Hinweis „Datenbank zurücksetzen“ setzt die Reset-Funktion der SQL-Labor-UI voraus.
- Szenario 05 nennt ein hypothetisches Projekt „Azubi-Lernlabor“ (nicht in der Seed-DB, als „bereits angelegt“ formuliert).
