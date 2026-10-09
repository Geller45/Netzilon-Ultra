# P3 – SQL-Labor-UI: Bericht

Geänderte Dateien:
- `netzilon-ultra/app/sql.js`: Der Platzhalter ist durch das fertige SQL-Labor ersetzt.
- `netzilon-ultra/tools/test-paket.js`: Neuer Abschnitt „SQL-Labor (Paket 3)“ vor dem Test „Keine Konsolenfehler“. Die bestehenden Tests sind unverändert.

Es wurde nichts committet.

## Funktion
- **Objekte und Präfixe:** `window.SqlLabor` = `{ ansicht, alleGeloest, uebersetzeFehler, tsqlHinweise, _test }`, dazu `window.VIEWS.sql`. Das CSS steckt in `<style id="sql-style">`. Alle Klassen und IDs beginnen mit `sql-`.
- **Laden:**
  - Beim Öffnen läuft `SqlKern.laden()` mit Spinner. Schlägt das Laden fehl, erscheint ein freundlicher Hinweis mit dem Knopf „Erneut versuchen“.
  - Die Arbeits-DB kommt aus `S.p.sql.db` (base64), sonst wird `neueDb()` aufgerufen.
  - Ist der gespeicherte Stand kaputt, wird er verworfen. Es gibt dann eine frische DB und einen Hinweis.
- **Speichern:**
  - Gespeichert wird nur, wenn sich wirklich etwas geändert hat: `total_changes` ist gestiegen oder `PRAGMA schema_version` hat sich geändert (DDL).
  - Das Speichern ist um 700 ms gedrosselt.
  - Bei offener Transaktion wird nicht gespeichert, weil `export()` die Transaktion sonst abbrechen würde. Gespeichert wird nach COMMIT oder ROLLBACK. Der Status zeigt dann „Transaktion offen“.
  - Über 3 MB wird nicht gespeichert, es erscheint ein Hinweis.
  - Verlässt man die Ansicht, wird ein ausstehendes Speichern sofort erledigt.
- **Zurücksetzen:** Der Knopf „Datenbank zurücksetzen“ fragt per `confirm` nach.
- **Ausführung:**
  - Ein eigener Runner nutzt `iterateStatements`.
  - Er behält höchstens 5000 Zeilen, zählt bis 200 000 und bricht dann ab.
- **Schutz vor Endlos-Rekursion:**
  - Bei `WITH RECURSIVE` ohne LIMIT und ohne WHERE/ON im rekursiven Teil kommt vor dem Ausführen eine Warnung mit „Trotzdem ausführen“ bzw. „Trotzdem prüfen“.
  - Legitime rekursive CTEs wie sql-49 laufen ohne Warnung.
- **Editor:**
  - Textarea mit Highlighting-Overlay für Schlüsselwörter, Strings, Zahlen, Kommentare und Funktionen. Die Höhe wächst mit dem Inhalt.
  - Strg+Enter führt aus, Tab fügt 2 Leerzeichen ein, Esc und dann Tab verlässt den Editor.
  - Es gibt 11 Beispiel-Knöpfe und einen Verlauf mit 30 Einträgen (`S.p.sql.verlauf`). Der Editorinhalt wird in `S.p.sql.editor` gespeichert.
- **Ergebnisse:**
  - Zeilen werden animiert eingeblendet, höchstens 200 sind sichtbar, darunter „x weitere“.
  - NULL wird grau und kursiv dargestellt, Zahlen rechtsbündig. Angezeigt werden ms und die Zahl der Zeilen.
  - Bei Änderungen erscheint „n Zeilen geändert“ mit kurzer Hervorhebung.
  - Etwa 20 SQLite-Fehler werden ins Deutsche übersetzt, jeweils mit Tipp.
- **ER-Diagramm:**
  - SVG aus `FirmaDB.TABELLEN` mit 🔑 für Primärschlüssel und 🔗 für Fremdschlüssel. Die FK-Linien sind mit 1/n beschriftet.
  - Ein Klick auf eine Tabelle führt `SELECT * … LIMIT 20` aus.
  - Das Diagramm ist ausklappbar und scrollt bei 390 px in seinem eigenen Container.
- **Live-Schema:** Liest `sqlite_master` und zeigt Tabellen, Views, Indizes und Trigger. Eigene Objekte sind mit „neu“ markiert, gelöschte Firmen-Tabellen werden gemeldet.
- **T-SQL:**
  - Ein Panel stellt SQLite und T-SQL gegenüber (18 Zeilen).
  - Eine Live-Erkennung im Editor schlägt an bei TOP, GETDATE, ISNULL, `+` bei Texten, IDENTITY, NVARCHAR, DATEADD, DATEDIFF, LEN, YEAR, GO, @Variablen, SELECT INTO, MERGE, TRUNCATE, GRANT und weiteren. Strings und Kommentare werden dabei ignoriert.
  - Bei einem Fehler wird der T-SQL-Hinweis zusätzlich angezeigt.
- **Aufgaben:**
  - Liste nach Stufen mit Fortschrittsbalken x/y.
  - Gestufte Hinweise. „Lösung zeigen“ wird nach 2 Fehlversuchen oder nach Hinweis 2 freigeschaltet.
  - Nach dem Lösen erscheinen die Erklärung und der T-SQL-Hinweis.
  - Bei Erfolg: `geloest[id]` wird auf das Datum gesetzt, `melde('sql',1)` nur beim ersten Mal, dazu Konfetti, Toast und die nächste offene Aufgabe.
  - `alleGeloest()` ist umgesetzt.
- **Prüfung `abfrage`:** Das Soll wird auf einer frischen Referenz-DB in einem SAVEPOINT mit Rollback berechnet und gecacht.
- **Prüfung `aenderung`:**
  - Die Arbeits-DB wird mit `pruefSql` abgefragt und mit einer frischen DB verglichen, auf der die Lösung und dann `pruefSql` laufen (gecacht).
  - Das Editor-SQL wird nicht ein zweites Mal ausgeführt, wenn es gerade erst ausgeführt wurde.
  - Ein Fehler in `pruefSql` (sql-41/57/58) zählt als „nicht gelöst“ und wird erklärt. Es kommt zu keinem Absturz.
  - `reihenfolge` gilt auch hier. `spaltenNamen` vergleicht die UI selbst, ohne Groß-/Kleinschreibung.
- **Diff-Hilfe:** Zeigt Zeilen und Spalten Soll/Ist, die Spaltennamen und die erste abweichende Zeile mit markierten Zellen. Stimmen die Zeilen, aber nicht die Reihenfolge, gibt es einen Hinweis auf ORDER BY. Wurde die DB verändert, wird ein Zurücksetzen empfohlen.
- **Legende:** 10 ausklappbare Einträge, jeweils mit Was/Wie/Wann/Wo/Warum.
- **Timer:** Die UI-Timer laufen nur, solange die Ansicht aktiv ist. Ein MutationObserver auf `#inhalt` stoppt sie beim Verlassen.

## Tests
`check-content`, `build-html`, `test-ui`, `test-paket` und `test-sqldb` sind alle grün.

Der Abschnitt „SQL-Labor (Paket 3)“ prüft Folgendes:
- Die Ansicht wird bereit (WASM).
- `COUNT(*)` liefert 100.
- Die Fehler „no such column“ und UNIQUE erscheinen auf Deutsch.
- Ein INSERT meldet „1 Zeile geändert“. Die Änderung bleibt nach `gehe('home')` erhalten, auch nachdem die DB aus dem Speicher verworfen und aus base64 neu geladen wurde.
- Timer sind nach dem Verlassen gestoppt. Verlauf und Editorinhalt sind gespeichert.
- Nach dem Zurücksetzen gibt es wieder 100 Mitarbeiter und 40 Kunden.
- TOP wird erkannt, mit Hinweis.
- Bei Endlos-Rekursion kommt eine Warnung, eine Rekursion mit Abbruch liefert 55.
- Tab und Highlighting funktionieren.
- Das ER-Diagramm hat 10 Kästen und mindestens 14 FK-Linien, ein Klick auf eine Tabelle funktioniert.
- Das Live-Schema zeigt eine selbst angelegte View und einen Index.
- 4 echte Aufgaben (sql-01, 02, 16, 06) werden gelöst, die XP steigen.
- Eine falsche Lösung bleibt nicht gelöst und zeigt die Diff-Hilfe.
- Eine kaputte DB wird verworfen, es erscheint ein Hinweis.
- Bei 390 px läuft die Seite nicht über, das ER-Diagramm scrollt im eigenen Container.
- Es gibt keine Konsolenfehler.

Screenshots: `dist/screens/p3-sql.png`, `p3-sql-er.png`, `p3-sql-390.png`.

Zusätzlicher Einmal-Lauf über alle 60 Aufgaben aus `sqlaufgaben.js` mit der Musterlösung über die UI: **alle 60 gelöst**. Vor und nach jeder `aenderung` wurde zurückgesetzt. Es gab keine Konsolenfehler.

## Hinweise
- Abfragen, die eine einzelne Zeile endlos berechnen (z. B. `COUNT(*)` über ein riesiges Kreuzprodukt), lassen sich synchron nicht abbrechen. Abgefangen sind nur Ergebnismengen (Zählgrenze) und die Rekursions-Warnung.
