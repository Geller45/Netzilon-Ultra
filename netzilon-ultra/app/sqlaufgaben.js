// SQL-Labor (Paket 3): Aufgabenreihe leicht → schwer auf der Firmen-DB „Netzilon GmbH“ (app/sqldb.js).
// Reine Daten. Format: siehe status/P3-BRIEF.md. Test: node tools/test-sqlaufgaben.js
// art 'abfrage'   → Ergebnis wird mit der Musterlösung auf frischer Referenz-DB verglichen.
// art 'aenderung' → pruefSql wird auf der Lernenden-DB und auf (frisch + loesung) ausgeführt und verglichen.
window.SQL_AUFGABEN = [
  // ───────────── Stufe 1: SELECT, WHERE, ORDER BY, erste Änderungen ─────────────
  {
    id: 'sql-01', stufe: 1, thema: 'SELECT', titel: 'Standortliste',
    text: "Die Empfangsabteilung braucht eine Übersicht aller Standorte. Liste **Stadt, PLZ und Straße** aller Standorte aus der Tabelle `standorte`.",
    art: 'abfrage',
    loesung: `SELECT stadt, plz, strasse FROM standorte;`,
    pruefSql: null, reihenfolge: false, spaltenNamen: false,
    hinweise: ["Alle Zeilen einer Tabelle holst du mit `SELECT … FROM tabelle`.", "Gib die Spalten mit Komma getrennt an: `stadt, plz, strasse`."],
    tsql: "In T-SQL identisch. Tabellen werden dort oft mit Schema angesprochen, z. B. `dbo.standorte`.",
    erklaerung: "SELECT wählt die Spalten (Projektion), FROM die Tabelle. Ohne WHERE kommen alle Zeilen zurück."
  },
  {
    id: 'sql-02', stufe: 1, thema: 'SELECT', titel: 'Preisliste mit Aliasen',
    text: "Der Vertrieb möchte eine Preisliste mit genau zwei Spalten: die Artikelbezeichnung unter dem Namen `artikel` und den Verkaufspreis unter dem Namen `preis`. Die Spaltennamen werden geprüft.",
    art: 'abfrage',
    loesung: `SELECT bezeichnung AS artikel, verkaufspreis AS preis FROM artikel;`,
    pruefSql: null, reihenfolge: false, spaltenNamen: true,
    hinweise: ["Mit `AS` gibst du einer Spalte im Ergebnis einen neuen Namen.", "`SELECT bezeichnung AS artikel, … FROM artikel`"],
    tsql: "In T-SQL identisch; zusätzlich ist dort die Schreibweise `artikel = bezeichnung` oder `[mein Alias]` mit Leerzeichen möglich.",
    erklaerung: "Ein Alias ändert nur den Spaltennamen im Ergebnis, nicht die Tabelle. Aliase machen Berichte lesbar."
  },
  {
    id: 'sql-03', stufe: 1, thema: 'SELECT', titel: 'Marge je Artikel',
    text: "Der Einkauf will wissen, was an jedem Artikel verdient wird. Liste `bezeichnung` und die Differenz aus Verkaufs- und Einkaufspreis als Spalte `marge`.",
    art: 'abfrage',
    loesung: `SELECT bezeichnung, verkaufspreis - einkaufspreis AS marge FROM artikel;`,
    pruefSql: null, reihenfolge: false, spaltenNamen: true,
    hinweise: ["In der SELECT-Liste darfst du rechnen: `spalte1 - spalte2`.", "Gib der berechneten Spalte mit `AS marge` einen Namen."],
    tsql: "In T-SQL identisch. Für Geldbeträge nutzt man dort meist den Datentyp `DECIMAL(10,2)` oder `MONEY` statt REAL.",
    erklaerung: "Berechnete Spalten entstehen pro Zeile aus den Spaltenwerten. Ohne Alias hieße die Spalte wie der Ausdruck."
  },
  {
    id: 'sql-04', stufe: 1, thema: 'WHERE', titel: 'Nicht auf Lager',
    text: "Welche Artikel haben den Lagerbestand **0**? Liste `bezeichnung` und `kategorie`.",
    art: 'abfrage',
    loesung: `SELECT bezeichnung, kategorie FROM artikel WHERE lagerbestand = 0;`,
    pruefSql: null, reihenfolge: false, spaltenNamen: false,
    hinweise: ["Zeilen filterst du mit `WHERE`.", "Vergleich in SQL mit einfachem `=`: `WHERE lagerbestand = 0`."],
    tsql: "In T-SQL identisch.",
    erklaerung: "WHERE lässt nur Zeilen durch, für die die Bedingung wahr ist. Lizenzen und Dienstleistungen werden nicht gelagert, daher steht dort 0."
  },
  {
    id: 'sql-05', stufe: 1, thema: 'WHERE', titel: 'Hohe Gehälter',
    text: "Die Personalabteilung braucht für eine Gehaltsstudie alle Mitarbeitenden mit einem Monatsgehalt von **mindestens 6000 €**: `vorname`, `nachname`, `position`, `gehalt`.",
    art: 'abfrage',
    loesung: `SELECT vorname, nachname, position, gehalt FROM mitarbeiter WHERE gehalt >= 6000;`,
    pruefSql: null, reihenfolge: false, spaltenNamen: false,
    hinweise: ["„mindestens“ heißt größer oder gleich.", "`WHERE gehalt >= 6000`"],
    tsql: "In T-SQL identisch.",
    erklaerung: "Vergleichsoperatoren sind =, <>, <, <=, >, >=. „Mindestens 6000“ schließt 6000 selbst ein, daher >=."
  },
  {
    id: 'sql-06', stufe: 1, thema: 'WHERE', titel: 'Bestellungen im 1. Quartal 2026',
    text: "Die Buchhaltung prüft das erste Quartal 2026 (1.1. bis 31.3.2026). Liste `best_id`, `kunde_id`, `datum` und `status` aller Bestellungen aus diesem Zeitraum. Nutze `BETWEEN`.",
    art: 'abfrage',
    loesung: `SELECT best_id, kunde_id, datum, status FROM bestellungen WHERE datum BETWEEN '2026-01-01' AND '2026-03-31';`,
    pruefSql: null, reihenfolge: false, spaltenNamen: false,
    hinweise: ["Datumswerte sind Text im Format `YYYY-MM-DD` und lassen sich deshalb direkt vergleichen.", "`BETWEEN a AND b` schließt beide Grenzen ein.", "`WHERE datum BETWEEN '2026-01-01' AND '2026-03-31'`"],
    tsql: "In T-SQL identisch, wenn `datum` vom Typ DATE ist. Bei DATETIME-Spalten Vorsicht: `'2026-03-31'` bedeutet 00:00 Uhr – besser `datum >= '2026-01-01' AND datum < '2026-04-01'`.",
    erklaerung: "BETWEEN ist eine Kurzform für `>= a AND <= b`. Weil ISO-Datumstexte lexikografisch wie Daten sortieren, funktioniert der Vergleich in SQLite."
  },
  {
    id: 'sql-07', stufe: 1, thema: 'WHERE', titel: 'Kunden im Norden',
    text: "Der Vertrieb Nord betreut Kunden in **Hamburg, Kiel, Bremen und Rostock**. Liste `firma` und `stadt` dieser Kunden mit `IN`.",
    art: 'abfrage',
    loesung: `SELECT firma, stadt FROM kunden WHERE stadt IN ('Hamburg', 'Kiel', 'Bremen', 'Rostock');`,
    pruefSql: null, reihenfolge: false, spaltenNamen: false,
    hinweise: ["Statt vieler `OR` gibt es `IN (…)`.", "Textwerte stehen in einfachen Anführungszeichen: `'Kiel'`."],
    tsql: "In T-SQL identisch. Strings in T-SQL ebenfalls mit einfachen Anführungszeichen; Unicode-Literale schreibt man dort `N'Köln'`.",
    erklaerung: "`stadt IN ('A','B')` entspricht `stadt = 'A' OR stadt = 'B'`, ist aber kürzer und weniger fehleranfällig."
  },
  {
    id: 'sql-08', stufe: 1, thema: 'WHERE', titel: 'Netzwerk-Team finden',
    text: "Für eine Schulung sucht die IT alle Mitarbeitenden, deren `position` mit **„Netzwerk“ beginnt** (z. B. Netzwerkadministrator). Liste `vorname`, `nachname`, `position`.",
    art: 'abfrage',
    loesung: `SELECT vorname, nachname, position FROM mitarbeiter WHERE position LIKE 'Netzwerk%';`,
    pruefSql: null, reihenfolge: false, spaltenNamen: false,
    hinweise: ["Mustersuche geht mit `LIKE`.", "`%` steht für beliebig viele Zeichen, `_` für genau eines.", "`WHERE position LIKE 'Netzwerk%'`"],
    tsql: "In T-SQL identisch. Groß-/Kleinschreibung hängt dort von der Collation ab (meist unabhängig); SQLite-LIKE ist nur bei ASCII-Buchstaben unabhängig.",
    erklaerung: "`'Netzwerk%'` passt auf alles, was mit Netzwerk anfängt. „Leiter Netzwerk & Sicherheit“ fällt heraus, weil es nicht damit beginnt."
  },
  {
    id: 'sql-09', stufe: 1, thema: 'WHERE', titel: 'Ohne Abteilung',
    text: "Bei der Inventur der Personalstammdaten fällt auf: Manche Mitarbeitende sind keiner Abteilung zugeordnet. Liste `ma_id`, `vorname`, `nachname` und `position` aller Mitarbeitenden, deren `abt_id` leer (NULL) ist.",
    art: 'abfrage',
    loesung: `SELECT ma_id, vorname, nachname, position FROM mitarbeiter WHERE abt_id IS NULL;`,
    pruefSql: null, reihenfolge: false, spaltenNamen: false,
    hinweise: ["`= NULL` funktioniert nicht – NULL ist „unbekannt“, kein Wert.", "Verwende `IS NULL`."],
    tsql: "In T-SQL identisch. (Die alte Einstellung `SET ANSI_NULLS OFF` ließ `= NULL` zu – heute nicht mehr verwenden.)",
    erklaerung: "Jeder Vergleich mit NULL ergibt UNKNOWN und damit nie wahr. Nur `IS NULL`/`IS NOT NULL` prüfen auf fehlende Werte. Es sind zwei Stabsstellen."
  },
  {
    id: 'sql-10', stufe: 1, thema: 'WHERE', titel: 'Aktive Teilzeitkräfte',
    text: "Die Personalabteilung braucht alle **Teilzeitkräfte** (weniger als 40 Wochenstunden), die **noch im Unternehmen** sind (kein Austrittsdatum). Liste `vorname`, `nachname`, `wochenstunden`.",
    art: 'abfrage',
    loesung: `SELECT vorname, nachname, wochenstunden FROM mitarbeiter WHERE wochenstunden < 40 AND austritt IS NULL;`,
    pruefSql: null, reihenfolge: false, spaltenNamen: false,
    hinweise: ["Zwei Bedingungen, die beide gelten müssen → `AND`.", "Noch beschäftigt = `austritt IS NULL`."],
    tsql: "In T-SQL identisch.",
    erklaerung: "AND verknüpft Bedingungen, die gleichzeitig erfüllt sein müssen. Ein ausgeschiedener Teilzeit-Kollege fällt durch die zweite Bedingung heraus."
  },
  {
    id: 'sql-11', stufe: 1, thema: 'ORDER', titel: 'Azubi-Liste sortiert',
    text: "Die Ausbildungsleitung möchte alle Auszubildenden (`azubi = 1`) mit `vorname`, `nachname`, `position` – sortiert nach **Nachname, bei gleichem Nachnamen nach Vorname**.",
    art: 'abfrage',
    loesung: `SELECT vorname, nachname, position FROM mitarbeiter WHERE azubi = 1 ORDER BY nachname, vorname;`,
    pruefSql: null, reihenfolge: true, spaltenNamen: false,
    hinweise: ["Azubis erkennst du an `azubi = 1`.", "`ORDER BY` kann mehrere Spalten haben: erst die erste, bei Gleichstand die zweite.", "`ORDER BY nachname, vorname`"],
    tsql: "In T-SQL identisch. Dort sortiert die Collation (z. B. Latin1_General) „Öztürk“ wie „Oztürk“; SQLite sortiert Umlaute standardmäßig hinter z.",
    erklaerung: "Zwei Azubis heißen Wolf – erst die zweite Sortierspalte macht die Reihenfolge eindeutig."
  },
  {
    id: 'sql-12', stufe: 1, thema: 'ORDER', titel: 'Die fünf teuersten Artikel',
    text: "Für den Katalog sollen die **fünf Artikel mit dem höchsten Verkaufspreis** oben stehen. Liste `bezeichnung` und `verkaufspreis`, absteigend nach Preis, nur 5 Zeilen.",
    art: 'abfrage',
    loesung: `SELECT bezeichnung, verkaufspreis FROM artikel ORDER BY verkaufspreis DESC LIMIT 5;`,
    pruefSql: null, reihenfolge: true, spaltenNamen: false,
    hinweise: ["Absteigend sortieren: `ORDER BY … DESC`.", "Die Zeilenzahl begrenzt `LIMIT 5` am Ende der Abfrage."],
    tsql: "T-SQL kennt kein LIMIT: `SELECT TOP 5 bezeichnung, verkaufspreis FROM artikel ORDER BY verkaufspreis DESC;` oder `… OFFSET 0 ROWS FETCH NEXT 5 ROWS ONLY`.",
    erklaerung: "LIMIT wirkt erst nach dem Sortieren. Ohne ORDER BY wären „die ersten 5“ zufällig."
  },
  {
    id: 'sql-13', stufe: 1, thema: 'ORDER', titel: 'Branchen ohne Doppelte',
    text: "Das Marketing fragt: In welchen **Branchen** haben wir Kunden? Jede Branche nur einmal, alphabetisch sortiert.",
    art: 'abfrage',
    loesung: `SELECT DISTINCT branche FROM kunden ORDER BY branche;`,
    pruefSql: null, reihenfolge: true, spaltenNamen: false,
    hinweise: ["Doppelte Zeilen entfernt `SELECT DISTINCT`.", "Danach `ORDER BY branche`."],
    tsql: "In T-SQL identisch. Die Sortierung von „Öffentliche Verwaltung“ hängt dort von der Collation ab.",
    erklaerung: "DISTINCT entfernt doppelte Ergebniszeilen. Alternativ ginge `GROUP BY branche` – DISTINCT drückt die Absicht aber klarer aus."
  },
  {
    id: 'sql-14', stufe: 1, thema: 'SELECT', titel: 'Telefonliste Personal',
    text: "Für die Telefonliste der Abteilung **Personal** (`abt_id = 9`) wird eine Spalte `name` im Format `Nachname, Vorname` gebraucht, daneben `telefon`. Sortiere nach `name`.",
    art: 'abfrage',
    loesung: `SELECT nachname || ', ' || vorname AS name, telefon FROM mitarbeiter WHERE abt_id = 9 ORDER BY name;`,
    pruefSql: null, reihenfolge: true, spaltenNamen: true,
    hinweise: ["Texte verkettest du in SQLite mit `||`.", "`nachname || ', ' || vorname AS name`", "Nach einem Alias darfst du in ORDER BY sortieren: `ORDER BY name`."],
    tsql: "In T-SQL verkettet man mit `+` oder `CONCAT(nachname, ', ', vorname)`; `||` gibt es dort nicht. Achtung: `+` mit NULL ergibt NULL, CONCAT behandelt NULL als Leertext.",
    erklaerung: "`||` ist der SQL-Standard-Operator für Textverkettung. Der Alias `name` kann in ORDER BY benutzt werden, weil ORDER BY nach SELECT ausgewertet wird."
  },
  {
    id: 'sql-15', stufe: 1, thema: 'ORDER', titel: 'Ausgeschiedene Kollegen',
    text: "Für das Zeugnis-Archiv: Liste `vorname`, `nachname` und `austritt` aller Mitarbeitenden **mit Austrittsdatum**, nach Austrittsdatum aufsteigend sortiert.",
    art: 'abfrage',
    loesung: `SELECT vorname, nachname, austritt FROM mitarbeiter WHERE austritt IS NOT NULL ORDER BY austritt;`,
    pruefSql: null, reihenfolge: true, spaltenNamen: false,
    hinweise: ["Gesucht sind Zeilen, in denen `austritt` NICHT leer ist.", "`WHERE austritt IS NOT NULL ORDER BY austritt`"],
    tsql: "In T-SQL identisch.",
    erklaerung: "IS NOT NULL filtert alle Zeilen mit eingetragenem Wert. ISO-Datumstexte sortieren chronologisch richtig."
  },
  {
    id: 'sql-16', stufe: 1, thema: 'INSERT', titel: 'Neuer Artikel',
    text: "Der Einkauf nimmt einen neuen Artikel ins Sortiment: `artikel_id` **31**, Bezeichnung **USB-Stick 64 GB**, Kategorie **Zubehör**, Einkaufspreis **6.50**, Verkaufspreis **12.90**, Lagerbestand **100**. Füge ihn ein.",
    art: 'aenderung',
    loesung: `INSERT INTO artikel (artikel_id, bezeichnung, kategorie, einkaufspreis, verkaufspreis, lagerbestand) VALUES (31, 'USB-Stick 64 GB', 'Zubehör', 6.50, 12.90, 100);`,
    pruefSql: `SELECT artikel_id, bezeichnung, kategorie, einkaufspreis, verkaufspreis, lagerbestand FROM artikel WHERE artikel_id = 31`,
    reihenfolge: false, spaltenNamen: false,
    hinweise: ["Neue Zeilen: `INSERT INTO tabelle (spalten…) VALUES (werte…)`.", "Dezimalzahlen mit Punkt schreiben: `6.50`.", "Reihenfolge der Werte = Reihenfolge der Spaltenliste."],
    tsql: "In T-SQL identisch. Ist `artikel_id` dort eine `IDENTITY`-Spalte, lässt man sie weg (oder braucht `SET IDENTITY_INSERT artikel ON`).",
    erklaerung: "Mit expliziter Spaltenliste ist das INSERT robust gegenüber späteren Tabellenänderungen. Nicht genannte Spalten erhielten ihren DEFAULT bzw. NULL."
  },
  {
    id: 'sql-17', stufe: 1, thema: 'UPDATE', titel: 'Lieferung eingetroffen',
    text: "Für das **NAS 4 Bay** (`artikel_id = 13`) ist Ware eingetroffen. Setze seinen Lagerbestand auf **12**. Alle anderen Artikel bleiben unverändert.",
    art: 'aenderung',
    loesung: `UPDATE artikel SET lagerbestand = 12 WHERE artikel_id = 13;`,
    pruefSql: `SELECT artikel_id, lagerbestand FROM artikel ORDER BY artikel_id`,
    reihenfolge: true, spaltenNamen: false,
    hinweise: ["Werte ändern: `UPDATE tabelle SET spalte = wert`.", "Ohne WHERE änderst du ALLE Zeilen!", "`… WHERE artikel_id = 13`"],
    tsql: "In T-SQL identisch. Tipp für beide: vor einem UPDATE dieselbe WHERE-Bedingung erst mit SELECT testen.",
    erklaerung: "Das WHERE über den Primärschlüssel trifft genau eine Zeile. Ein vergessenes WHERE würde den Bestand aller 30 Artikel überschreiben."
  },

  // ───────────── Stufe 2: Aggregate, GROUP BY, JOINs, CASE, Datum, DML ─────────────
  {
    id: 'sql-18', stufe: 2, thema: 'AGGREGAT', titel: 'Wie viele sind noch da?',
    text: "Die Geschäftsführung fragt: Wie viele Mitarbeitende sind **aktuell beschäftigt** (kein Austrittsdatum)? Gib eine Zahl aus.",
    art: 'abfrage',
    loesung: `SELECT COUNT(*) FROM mitarbeiter WHERE austritt IS NULL;`,
    pruefSql: null, reihenfolge: false, spaltenNamen: false,
    hinweise: ["Zeilen zählt `COUNT(*)`.", "Erst filtern (WHERE), dann zählen."],
    tsql: "In T-SQL identisch. Für sehr große Tabellen gibt es dort zusätzlich `COUNT_BIG(*)`.",
    erklaerung: "COUNT(*) zählt alle Zeilen, die nach dem WHERE übrig bleiben. COUNT(spalte) würde NULL-Werte nicht mitzählen."
  },
  {
    id: 'sql-19', stufe: 2, thema: 'AGGREGAT', titel: 'Gehaltsstatistik',
    text: "Für den Gehaltsspiegel: Ermittle für alle **beschäftigten Nicht-Azubis** das kleinste Gehalt, das größte Gehalt und das Durchschnittsgehalt (auf 2 Nachkommastellen gerundet) – in dieser Spaltenreihenfolge.",
    art: 'abfrage',
    loesung: `SELECT MIN(gehalt), MAX(gehalt), ROUND(AVG(gehalt), 2) FROM mitarbeiter WHERE azubi = 0 AND austritt IS NULL;`,
    pruefSql: null, reihenfolge: false, spaltenNamen: false,
    hinweise: ["Aggregatfunktionen: `MIN`, `MAX`, `AVG`.", "Runden mit `ROUND(wert, 2)`.", "Filter: `azubi = 0 AND austritt IS NULL`."],
    tsql: "In T-SQL ähnlich. Achtung: `AVG` über eine INT-Spalte liefert dort eine Ganzzahl – ggf. `AVG(CAST(gehalt AS DECIMAL(10,2)))`.",
    erklaerung: "Aggregatfunktionen fassen alle gefilterten Zeilen zu einer Ergebniszeile zusammen. Azubi-Vergütungen würden den Durchschnitt verfälschen."
  },
  {
    id: 'sql-20', stufe: 2, thema: 'AGGREGAT', titel: 'Lagerwert',
    text: "Die Buchhaltung braucht für die Bilanz den **Lagerwert zum Einkaufspreis**: Summe über alle Artikel von `einkaufspreis * lagerbestand`, gerundet auf 2 Nachkommastellen, als Spalte `lagerwert`.",
    art: 'abfrage',
    loesung: `SELECT ROUND(SUM(einkaufspreis * lagerbestand), 2) AS lagerwert FROM artikel;`,
    pruefSql: null, reihenfolge: false, spaltenNamen: true,
    hinweise: ["Erst pro Zeile multiplizieren, dann summieren: `SUM(a * b)`.", "`ROUND(…, 2) AS lagerwert`"],
    tsql: "In T-SQL identisch.",
    erklaerung: "SUM kann einen Ausdruck aufsummieren, der pro Zeile berechnet wird. So entsteht der Gesamtwert in einem Schritt."
  },
  {
    id: 'sql-21', stufe: 2, thema: 'GROUP BY', titel: 'Sortiment je Kategorie',
    text: "Der Einkauf möchte je **Kategorie** wissen, wie viele Artikel es gibt (`anzahl`) und wie hoch der durchschnittliche Verkaufspreis ist (`durchschnittspreis`, gerundet auf 2 Stellen). Spalten: `kategorie`, `anzahl`, `durchschnittspreis`.",
    art: 'abfrage',
    loesung: `SELECT kategorie, COUNT(*) AS anzahl, ROUND(AVG(verkaufspreis), 2) AS durchschnittspreis FROM artikel GROUP BY kategorie;`,
    pruefSql: null, reihenfolge: false, spaltenNamen: true,
    hinweise: ["Pro Gruppe eine Zeile: `GROUP BY kategorie`.", "Jede Spalte im SELECT ist entweder Gruppierungsspalte oder steckt in einer Aggregatfunktion."],
    tsql: "In T-SQL identisch. T-SQL ist strenger: Nicht gruppierte Spalten ohne Aggregat sind dort ein Fehler (SQLite erlaubt sie stillschweigend).",
    erklaerung: "GROUP BY bildet Gruppen gleicher Kategorie; die Aggregate werden je Gruppe berechnet."
  },
  {
    id: 'sql-22', stufe: 2, thema: 'GROUP BY', titel: 'Stammkunden',
    text: "Der Vertrieb fragt: Welche Kunden haben **mindestens 10 Bestellungen** aufgegeben (egal welcher Status)? Liste `kunde_id` und die Anzahl als `bestellungen`.",
    art: 'abfrage',
    loesung: `SELECT kunde_id, COUNT(*) AS bestellungen FROM bestellungen GROUP BY kunde_id HAVING COUNT(*) >= 10;`,
    pruefSql: null, reihenfolge: false, spaltenNamen: false,
    hinweise: ["Erst je Kunde gruppieren und zählen.", "Bedingungen auf Gruppen (Aggregate) gehören in `HAVING`, nicht in WHERE.", "`HAVING COUNT(*) >= 10`"],
    tsql: "In T-SQL identisch. Den Alias `bestellungen` darf man in HAVING dort nicht verwenden – `COUNT(*)` wiederholen.",
    erklaerung: "WHERE filtert Zeilen vor dem Gruppieren, HAVING filtert Gruppen danach. Eine Bedingung auf COUNT(*) geht daher nur mit HAVING."
  },
  {
    id: 'sql-23', stufe: 2, thema: 'GROUP BY', titel: 'Bestellungen je Monat 2025',
    text: "Für die Monatsstatistik 2025: Wie viele **nicht stornierte** Bestellungen gab es je Monat im Jahr 2025? Spalten: `monat` im Format `YYYY-MM` und die Anzahl, chronologisch sortiert.",
    art: 'abfrage',
    loesung: `SELECT strftime('%Y-%m', datum) AS monat, COUNT(*) AS anzahl FROM bestellungen WHERE datum BETWEEN '2025-01-01' AND '2025-12-31' AND status <> 'storniert' GROUP BY monat ORDER BY monat;`,
    pruefSql: null, reihenfolge: true, spaltenNamen: false,
    hinweise: ["`strftime('%Y-%m', datum)` macht aus `2025-03-14` den Text `2025-03`.", "Nach diesem Ausdruck gruppieren und sortieren.", "Storniertes ausschließen: `status <> 'storniert'`."],
    tsql: "In T-SQL: `FORMAT(datum, 'yyyy-MM')` oder `YEAR(datum)`/`MONTH(datum)` bzw. `DATEPART(month, datum)`; strftime gibt es dort nicht.",
    erklaerung: "Gruppiert wird nach einem berechneten Ausdruck. Weil `YYYY-MM` als Text chronologisch sortiert, reicht ORDER BY monat."
  },
  {
    id: 'sql-24', stufe: 2, thema: 'JOIN', titel: 'Mitarbeiter mit Abteilung',
    text: "Die Personalabteilung möchte zu jedem Mitarbeitenden den **Namen der Abteilung** sehen: `vorname`, `nachname`, Abteilungsname. Nur Mitarbeitende, die einer Abteilung zugeordnet sind (INNER JOIN).",
    art: 'abfrage',
    loesung: `SELECT m.vorname, m.nachname, a.name FROM mitarbeiter m INNER JOIN abteilungen a ON a.abt_id = m.abt_id;`,
    pruefSql: null, reihenfolge: false, spaltenNamen: false,
    hinweise: ["Verknüpfe `mitarbeiter` und `abteilungen` über `abt_id`.", "Tabellen-Aliase sparen Tipparbeit: `FROM mitarbeiter m JOIN abteilungen a ON a.abt_id = m.abt_id`."],
    tsql: "In T-SQL identisch.",
    erklaerung: "Ein INNER JOIN liefert nur Paare, die in beiden Tabellen einen Partner haben. Die zwei Stabsstellen ohne Abteilung fehlen daher – es sind 98 Zeilen."
  },
  {
    id: 'sql-25', stufe: 2, thema: 'JOIN', titel: 'Wirklich alle Mitarbeiter',
    text: "Wie vorher, aber jetzt sollen **alle 100 Mitarbeitenden** erscheinen – auch die ohne Abteilung (dort bleibt der Abteilungsname leer). Spalten: `vorname`, `nachname`, Abteilungsname.",
    art: 'abfrage',
    loesung: `SELECT m.vorname, m.nachname, a.name FROM mitarbeiter m LEFT JOIN abteilungen a ON a.abt_id = m.abt_id;`,
    pruefSql: null, reihenfolge: false, spaltenNamen: false,
    hinweise: ["Ein LEFT JOIN behält alle Zeilen der linken Tabelle.", "Die Tabelle, von der du ALLE willst, steht links (direkt nach FROM)."],
    tsql: "In T-SQL identisch (`LEFT JOIN` = `LEFT OUTER JOIN`).",
    erklaerung: "LEFT JOIN füllt fehlende Partner mit NULL auf. So gehen Mitarbeitende ohne Abteilung nicht verloren."
  },
  {
    id: 'sql-26', stufe: 2, thema: 'JOIN', titel: 'Kunde ohne Bestellung',
    text: "Der Vertrieb vermutet einen „Karteileichen“-Kunden: Welcher Kunde hat **noch nie bestellt**? Liste `firma` und `ansprechpartner` – mit LEFT JOIN.",
    art: 'abfrage',
    loesung: `SELECT k.firma, k.ansprechpartner FROM kunden k LEFT JOIN bestellungen b ON b.kunde_id = k.kunde_id WHERE b.best_id IS NULL;`,
    pruefSql: null, reihenfolge: false, spaltenNamen: false,
    hinweise: ["LEFT JOIN von `kunden` zu `bestellungen`.", "Kunden ohne Partner haben in den Bestellspalten NULL.", "`WHERE b.best_id IS NULL`"],
    tsql: "In T-SQL identisch.",
    erklaerung: "Das Muster „LEFT JOIN … WHERE rechts IS NULL“ findet Zeilen ohne Gegenstück (Anti-Join)."
  },
  {
    id: 'sql-27', stufe: 2, thema: 'JOIN', titel: 'Ladenhüter',
    text: "Der Einkauf möchte wissen, welcher Artikel **noch nie in einer Bestellposition** vorkam. Liste `artikel_id`, `bezeichnung` und `lagerbestand`.",
    art: 'abfrage',
    loesung: `SELECT a.artikel_id, a.bezeichnung, a.lagerbestand FROM artikel a LEFT JOIN bestellpositionen p ON p.artikel_id = a.artikel_id WHERE p.best_id IS NULL;`,
    pruefSql: null, reihenfolge: false, spaltenNamen: false,
    hinweise: ["Gleiches Muster wie beim Kunden ohne Bestellung.", "`artikel LEFT JOIN bestellpositionen … WHERE p.best_id IS NULL`"],
    tsql: "In T-SQL identisch.",
    erklaerung: "Für jeden Artikel ohne passende Position liefert der LEFT JOIN genau eine Zeile mit NULL-Positionen – genau diese bleiben nach dem Filter übrig."
  },
  {
    id: 'sql-28', stufe: 2, thema: 'JOIN', titel: 'Projekte mit Auftraggeber',
    text: "Der Vertrieb möchte **alle Projekte** mit ihrem Auftraggeber sehen: Spalten `projekt` (Projektname) und `kunde` (Firmenname). Interne Projekte haben keinen Kunden – dort soll der Text **intern** stehen.",
    art: 'abfrage',
    loesung: `SELECT p.name AS projekt, COALESCE(k.firma, 'intern') AS kunde FROM projekte p LEFT JOIN kunden k ON k.kunde_id = p.kunde_id;`,
    pruefSql: null, reihenfolge: false, spaltenNamen: true,
    hinweise: ["Alle Projekte → LEFT JOIN von `projekte` zu `kunden`.", "Ersatzwert für NULL: `COALESCE(wert, 'intern')`."],
    tsql: "In T-SQL geht `COALESCE` ebenso; alternativ `ISNULL(k.firma, 'intern')`.",
    erklaerung: "COALESCE liefert den ersten Nicht-NULL-Wert. Ohne LEFT JOIN würden die internen Projekte ganz fehlen."
  },
  {
    id: 'sql-29', stufe: 2, thema: 'JOIN', titel: 'Wer ist mein Chef?',
    text: "Für das Organigramm des **IT-Supports** (`abt_id = 3`): Liste `vorname`, `nachname` jedes Mitarbeitenden und den vollständigen Namen der/des Vorgesetzten als `vorgesetzter` (Format `Vorname Nachname`).",
    art: 'abfrage',
    loesung: `SELECT m.vorname, m.nachname, v.vorname || ' ' || v.nachname AS vorgesetzter FROM mitarbeiter m JOIN mitarbeiter v ON v.ma_id = m.vorgesetzter_id WHERE m.abt_id = 3;`,
    pruefSql: null, reihenfolge: false, spaltenNamen: false,
    hinweise: ["Vorgesetzte stehen in derselben Tabelle – du brauchst sie zweimal (Self-JOIN).", "Zwei Aliase: `mitarbeiter m JOIN mitarbeiter v ON v.ma_id = m.vorgesetzter_id`.", "Den Namen mit `||` zusammensetzen."],
    tsql: "Self-JOIN ist in T-SQL identisch; die Verkettung schreibt man dort `v.vorname + ' ' + v.nachname` oder mit `CONCAT`.",
    erklaerung: "Beim Self-JOIN spielt dieselbe Tabelle zwei Rollen. Die Aliase m und v machen klar, welche Rolle welche Spalte liefert."
  },
  {
    id: 'sql-30', stufe: 2, thema: 'GROUP BY', titel: 'Kopfzahl je Abteilung',
    text: "Die Geschäftsführung möchte die Zahl der **beschäftigten** Mitarbeitenden je Abteilung (Abteilungsname, Anzahl) – **absteigend nach Anzahl, bei Gleichstand alphabetisch nach Abteilungsname**.",
    art: 'abfrage',
    loesung: `SELECT a.name, COUNT(*) AS anzahl FROM mitarbeiter m JOIN abteilungen a ON a.abt_id = m.abt_id WHERE m.austritt IS NULL GROUP BY a.name ORDER BY anzahl DESC, a.name;`,
    pruefSql: null, reihenfolge: true, spaltenNamen: false,
    hinweise: ["JOIN auf `abteilungen`, Filter `austritt IS NULL`, dann `GROUP BY a.name`.", "Sortierung: `ORDER BY anzahl DESC, a.name`."],
    tsql: "In T-SQL identisch.",
    erklaerung: "JOIN, WHERE, GROUP BY und ORDER BY werden in genau dieser logischen Reihenfolge ausgewertet. Die zweite Sortierspalte macht das Ergebnis eindeutig."
  },
  {
    id: 'sql-31', stufe: 2, thema: 'JOIN', titel: 'Top-5-Kunden nach Umsatz',
    text: "Der Vertrieb fragt: Welche **5 Kunden** haben den höchsten Umsatz? Umsatz = Summe `menge * einzelpreis` aller Positionen **nicht stornierter** Bestellungen. Spalten: `firma`, `umsatz` (gerundet auf 2 Stellen), absteigend nach Umsatz.",
    art: 'abfrage',
    loesung: `SELECT k.firma, ROUND(SUM(p.menge * p.einzelpreis), 2) AS umsatz
FROM kunden k
JOIN bestellungen b ON b.kunde_id = k.kunde_id
JOIN bestellpositionen p ON p.best_id = b.best_id
WHERE b.status <> 'storniert'
GROUP BY k.kunde_id, k.firma
ORDER BY umsatz DESC
LIMIT 5;`,
    pruefSql: null, reihenfolge: true, spaltenNamen: false,
    hinweise: ["Drei Tabellen: kunden → bestellungen → bestellpositionen.", "Nach Kunde gruppieren und `SUM(p.menge * p.einzelpreis)` bilden.", "`ORDER BY umsatz DESC LIMIT 5`"],
    tsql: "In T-SQL: `SELECT TOP 5 …` statt LIMIT; der Rest ist gleich.",
    erklaerung: "Mehrere JOINs hängen Tabellen kettenförmig aneinander. Die Summe über alle Positionen ergibt den Umsatz je Kunde."
  },
  {
    id: 'sql-32', stufe: 2, thema: 'GROUP BY', titel: 'Gehaltsbänder mit CASE',
    text: "Die Personalabteilung teilt alle 100 Mitarbeitenden in Bänder ein: `Ausbildung` (Azubis), sonst `unter 4000`, `4000 bis 5999` und `ab 6000` (nach Gehalt). Liste je Band die Spalten `band` und `anzahl`.",
    art: 'abfrage',
    loesung: `SELECT CASE WHEN azubi = 1 THEN 'Ausbildung'
            WHEN gehalt < 4000 THEN 'unter 4000'
            WHEN gehalt < 6000 THEN '4000 bis 5999'
            ELSE 'ab 6000' END AS band,
       COUNT(*) AS anzahl
FROM mitarbeiter
GROUP BY band;`,
    pruefSql: null, reihenfolge: false, spaltenNamen: false,
    hinweise: ["`CASE WHEN bedingung THEN wert … ELSE wert END` liefert je Zeile einen Wert.", "Die WHEN-Zweige werden der Reihe nach geprüft – Azubis zuerst abfangen.", "Nach dem CASE-Ausdruck (Alias `band`) gruppieren."],
    tsql: "CASE ist in T-SQL identisch. Gruppieren nach Alias erlaubt T-SQL nicht – dort `GROUP BY` mit dem ganzen CASE-Ausdruck wiederholen.",
    erklaerung: "CASE ist das „Wenn-dann“ von SQL. Der erste zutreffende WHEN-Zweig gewinnt, daher landen Azubis nicht im Band „unter 4000“."
  },
  {
    id: 'sql-33', stufe: 2, thema: 'SELECT', titel: 'Geburtstage im April',
    text: "Das Team-Event-Komitee will die **Geburtstage im April** wissen: `vorname`, `nachname` und der Tag als Text `TT.MM.` (z. B. `09.04.`) in der Spalte `geburtstag`. Sortiert nach Tag, bei gleichem Tag nach Nachname.",
    art: 'abfrage',
    loesung: `SELECT vorname, nachname, strftime('%d.%m.', geburtsdatum) AS geburtstag FROM mitarbeiter WHERE strftime('%m', geburtsdatum) = '04' ORDER BY strftime('%d', geburtsdatum), nachname;`,
    pruefSql: null, reihenfolge: true, spaltenNamen: false,
    hinweise: ["Den Monat liefert `strftime('%m', geburtsdatum)` als Text, z. B. `'04'`.", "Format `TT.MM.`: `strftime('%d.%m.', geburtsdatum)`.", "Sortieren nach Tag: `ORDER BY strftime('%d', geburtsdatum), nachname`."],
    tsql: "In T-SQL: `MONTH(geburtsdatum) = 4` bzw. `DATEPART(month, geburtsdatum)`, Format mit `FORMAT(geburtsdatum, 'dd.MM.')`.",
    erklaerung: "strftime zerlegt und formatiert Datumswerte. Das Jahr spielt für Geburtstage keine Rolle, daher wird nur nach Monat gefiltert und nach Tag sortiert."
  },
  {
    id: 'sql-34', stufe: 2, thema: 'WHERE', titel: 'Zehn Jahre dabei',
    text: "Die Geschäftsführung ehrt alle **beschäftigten** Mitarbeitenden, die zum Stichtag **31.03.2026 mindestens 10 Jahre** im Unternehmen sind (Eintritt am oder vor dem 31.03.2016). Liste `vorname`, `nachname`, `eintritt`. Berechne die Grenze mit `date('2026-03-31', '-10 years')`.",
    art: 'abfrage',
    loesung: `SELECT vorname, nachname, eintritt FROM mitarbeiter WHERE eintritt <= date('2026-03-31', '-10 years') AND austritt IS NULL;`,
    pruefSql: null, reihenfolge: false, spaltenNamen: false,
    hinweise: ["`date('2026-03-31', '-10 years')` ergibt `'2016-03-31'`.", "Eintritt am oder davor: `eintritt <= …`.", "Ausgetretene ausschließen."],
    tsql: "In T-SQL: `eintritt <= DATEADD(year, -10, '2026-03-31')`. Mit dem heutigen Datum wäre es `DATEADD(year, -10, CAST(GETDATE() AS DATE))` (SQLite: `date('now', '-10 years')`).",
    erklaerung: "Datumsfunktionen rechnen mit Modifikatoren. Ein fester Stichtag macht das Ergebnis reproduzierbar – mit `date('now')` würde es sich täglich ändern."
  },
  {
    id: 'sql-35', stufe: 2, thema: 'INSERT', titel: 'Neue Auszubildende',
    text: "Zum 01.08.2026 beginnt eine neue Auszubildende. Lege sie an: `ma_id` **101**, `personalnr` **NZ-1101**, **Leonie Engel**, Benutzername `leonie.engel`, E-Mail `leonie.engel@netzilon.example`, Eintritt `2026-08-01`, Abteilung **Ausbildung** (`abt_id` 10), Vorgesetzte **Susanne Seidel** (`ma_id` 92), Position **Auszubildende FiSi**, Vergütung **1050**, `azubi = 1`. Die Wochenstunden sollen den Standardwert erhalten.",
    art: 'aenderung',
    loesung: `INSERT INTO mitarbeiter (ma_id, personalnr, vorname, nachname, benutzername, email, eintritt, abt_id, vorgesetzter_id, position, gehalt, azubi)
VALUES (101, 'NZ-1101', 'Leonie', 'Engel', 'leonie.engel', 'leonie.engel@netzilon.example', '2026-08-01', 10, 92, 'Auszubildende FiSi', 1050, 1);`,
    pruefSql: `SELECT ma_id, personalnr, vorname, nachname, benutzername, email, eintritt, austritt, abt_id, vorgesetzter_id, position, gehalt, wochenstunden, azubi FROM mitarbeiter WHERE ma_id = 101`,
    reihenfolge: false, spaltenNamen: false,
    hinweise: ["Gib nur die Spalten an, für die du Werte hast – `wochenstunden` weglassen, dann greift `DEFAULT 40`.", "`vorname`, `nachname` und `eintritt` sind NOT NULL und müssen gesetzt werden.", "`INSERT INTO mitarbeiter (ma_id, personalnr, …) VALUES (101, 'NZ-1101', …);`"],
    tsql: "In T-SQL wäre `ma_id` typischerweise `INT IDENTITY(1,1)` und würde weggelassen; die neue ID liefert `SCOPE_IDENTITY()`. In SQLite vergibt `INTEGER PRIMARY KEY` ebenfalls automatisch, wenn man sie weglässt.",
    erklaerung: "Nicht genannte Spalten bekommen ihren DEFAULT (wochenstunden = 40) oder NULL. UNIQUE-Spalten wie benutzername und email verhindern Dubletten."
  },
  {
    id: 'sql-36', stufe: 2, thema: 'INSERT', titel: 'Bestellung trotz CHECK',
    text: "Ein Kollege wollte eine Bestellung mit dem Status `'neu'` anlegen und bekam `CHECK constraint failed`. Lege sie korrekt an: `best_id` **251**, Kunde **18**, Mitarbeiter **62**, Datum `2026-03-31`, Status **offen**; dazu Position **1** mit Artikel **11** (Serverschrank 42 HE), Menge **2**, Einzelpreis **989**. Achte auf die Reihenfolge wegen des Fremdschlüssels.",
    art: 'aenderung',
    loesung: `INSERT INTO bestellungen (best_id, kunde_id, ma_id, datum, status) VALUES (251, 18, 62, '2026-03-31', 'offen');
INSERT INTO bestellpositionen (best_id, pos, artikel_id, menge, einzelpreis) VALUES (251, 1, 11, 2, 989);`,
    pruefSql: `SELECT b.best_id, b.kunde_id, b.ma_id, b.datum, b.status, p.pos, p.artikel_id, p.menge, p.einzelpreis FROM bestellungen b JOIN bestellpositionen p ON p.best_id = b.best_id WHERE b.best_id = 251`,
    reihenfolge: false, spaltenNamen: false,
    hinweise: ["Erlaubte Status stehen im CHECK: `'offen'`, `'versendet'`, `'bezahlt'`, `'storniert'`.", "Erst den Kopf (`bestellungen`), dann die Position – die Position verweist per Fremdschlüssel auf die Bestellung.", "Zwei INSERT-Anweisungen, getrennt durch `;`."],
    tsql: "In T-SQL identisch; den CHECK legt man dort z. B. mit `CONSTRAINT ck_status CHECK (status IN (…))` an. Die Fehlermeldung lautet dort „The INSERT statement conflicted with the CHECK constraint …“.",
    erklaerung: "Constraints schützen die Datenqualität: CHECK lässt nur erlaubte Werte zu, der Fremdschlüssel verlangt, dass die Bestellung existiert, bevor eine Position darauf zeigt."
  },
  {
    id: 'sql-37', stufe: 2, thema: 'UPDATE', titel: 'Gehaltserhöhung im IT-Support',
    text: "Nach der Tarifrunde erhalten alle **noch beschäftigten** Mitarbeitenden der Abteilung **IT-Support** **3 % mehr Gehalt** (auf 2 Nachkommastellen gerundet). Ermittle die Abteilung über ihren Namen.",
    art: 'aenderung',
    loesung: `UPDATE mitarbeiter
SET gehalt = ROUND(gehalt * 1.03, 2)
WHERE abt_id = (SELECT abt_id FROM abteilungen WHERE name = 'IT-Support')
  AND austritt IS NULL;`,
    pruefSql: `SELECT ma_id, gehalt FROM mitarbeiter ORDER BY ma_id`,
    reihenfolge: true, spaltenNamen: false,
    hinweise: ["3 % mehr = `gehalt * 1.03`.", "Die abt_id holst du per Unterabfrage: `(SELECT abt_id FROM abteilungen WHERE name = 'IT-Support')`.", "Ausgeschiedene nicht erhöhen: `AND austritt IS NULL`."],
    tsql: "In T-SQL identisch; zusätzlich gibt es dort `UPDATE m SET … FROM mitarbeiter m JOIN abteilungen a ON …` (UPDATE mit JOIN).",
    erklaerung: "Der neue Wert darf sich auf den alten beziehen (`gehalt * 1.03`). Die Unterabfrage macht die Anweisung unabhängig von der konkreten ID."
  },
  {
    id: 'sql-38', stufe: 2, thema: 'UPDATE', titel: 'Projekt abschließen',
    text: "Das interne Projekt **Einführung Ticketsystem** ist fertig. Setze seinen Status auf `abgeschlossen` und das Enddatum auf `2026-03-31`.",
    art: 'aenderung',
    loesung: `UPDATE projekte SET status = 'abgeschlossen', ende = '2026-03-31' WHERE name = 'Einführung Ticketsystem';`,
    pruefSql: `SELECT projekt_id, status, ende FROM projekte ORDER BY projekt_id`,
    reihenfolge: true, spaltenNamen: false,
    hinweise: ["Mehrere Spalten in einem UPDATE: `SET a = 1, b = 2`.", "Das Projekt findest du über `WHERE name = 'Einführung Ticketsystem'`."],
    tsql: "In T-SQL identisch.",
    erklaerung: "Ein UPDATE kann mehrere Spalten gleichzeitig setzen. Der CHECK auf status würde Tippfehler wie 'abgeschloßen' ablehnen."
  },
  {
    id: 'sql-39', stufe: 2, thema: 'UPDATE', titel: 'Nachbestellung Hardware',
    text: "Der Einkauf hat für alle Artikel der Kategorie **Hardware** mit einem Lagerbestand **unter 20** je **25 Stück** nachbestellt; die Ware ist da. Erhöhe deren Lagerbestand jeweils um 25.",
    art: 'aenderung',
    loesung: `UPDATE artikel SET lagerbestand = lagerbestand + 25 WHERE kategorie = 'Hardware' AND lagerbestand < 20;`,
    pruefSql: `SELECT artikel_id, lagerbestand FROM artikel ORDER BY artikel_id`,
    reihenfolge: true, spaltenNamen: false,
    hinweise: ["Relativ ändern: `SET lagerbestand = lagerbestand + 25`.", "Zwei Bedingungen mit AND verknüpfen."],
    tsql: "In T-SQL identisch; dort ginge auch die Kurzform `SET lagerbestand += 25`.",
    erklaerung: "Rechts vom = steht der alte Wert der Zeile. So erhöht ein einziges UPDATE mehrere Zeilen jeweils um denselben Betrag."
  },
  {
    id: 'sql-40', stufe: 2, thema: 'DELETE', titel: 'Karteileiche entfernen',
    text: "Der Kunde, der **noch nie bestellt hat**, soll aus der Kundenkartei gelöscht werden. Ermittle ihn in der DELETE-Anweisung per Unterabfrage (nicht über eine fest eingetippte ID).",
    art: 'aenderung',
    loesung: `DELETE FROM kunden WHERE kunde_id NOT IN (SELECT kunde_id FROM bestellungen);`,
    pruefSql: `SELECT kunde_id, firma FROM kunden ORDER BY kunde_id`,
    reihenfolge: true, spaltenNamen: false,
    hinweise: ["`DELETE FROM tabelle WHERE …` – ohne WHERE wäre die Tabelle leer!", "Kunden ohne Bestellung: `kunde_id NOT IN (SELECT kunde_id FROM bestellungen)`.", "Alternativ `WHERE NOT EXISTS (…)`."],
    tsql: "In T-SQL identisch. Vorsicht in beiden Systemen: Enthält die Unterabfrage von NOT IN ein NULL, liefert NOT IN nie wahr – NOT EXISTS ist robuster.",
    erklaerung: "Der Kunde hat weder Bestellungen noch Projekte, daher steht kein Fremdschlüssel im Weg. Die Unterabfrage hält die Anweisung auch bei anderen Daten korrekt."
  },
  {
    id: 'sql-41', stufe: 2, thema: 'CREATE', titel: 'Spalte Homeoffice',
    text: "Die Personalabteilung will künftig erfassen, wer im Homeoffice arbeitet. Ergänze die Tabelle `mitarbeiter` um die Spalte `homeoffice` vom Typ `INTEGER` mit dem Standardwert `0`.",
    art: 'aenderung',
    loesung: `ALTER TABLE mitarbeiter ADD COLUMN homeoffice INTEGER DEFAULT 0;`,
    pruefSql: `SELECT name, type, dflt_value FROM pragma_table_info('mitarbeiter') WHERE name = 'homeoffice'`,
    reihenfolge: false, spaltenNamen: false,
    hinweise: ["Tabellenstruktur ändern: `ALTER TABLE …`.", "`ALTER TABLE mitarbeiter ADD COLUMN homeoffice INTEGER DEFAULT 0;`"],
    tsql: "In T-SQL ohne das Wort COLUMN: `ALTER TABLE mitarbeiter ADD homeoffice BIT NOT NULL DEFAULT 0;` (Wahrheitswerte meist als BIT).",
    erklaerung: "ALTER TABLE ADD COLUMN hängt eine Spalte an; bestehende Zeilen erhalten den DEFAULT-Wert. Prüfen kannst du das mit `PRAGMA table_info(mitarbeiter)`."
  },
  {
    id: 'sql-42', stufe: 2, thema: 'INDEX', titel: 'Index für Kundenbestellungen',
    text: "Die Abfrage „alle Bestellungen eines Kunden“ läuft ständig. Lege auf `bestellungen(kunde_id)` einen Index mit dem Namen **idx_bestellungen_kunde** an.",
    art: 'aenderung',
    loesung: `CREATE INDEX idx_bestellungen_kunde ON bestellungen (kunde_id);`,
    pruefSql: `SELECT m.name, m.tbl_name, i.name AS spalte FROM sqlite_master m, pragma_index_info(m.name) i WHERE m.type = 'index' AND m.name = 'idx_bestellungen_kunde'`,
    reihenfolge: false, spaltenNamen: false,
    hinweise: ["`CREATE INDEX name ON tabelle (spalte);`", "Kontrolle: `SELECT name FROM sqlite_master WHERE type = 'index';` oder `PRAGMA index_list(bestellungen);`"],
    tsql: "In T-SQL identisch (`CREATE NONCLUSTERED INDEX …` ist dort der Standardfall); Indizes einer Tabelle zeigt `EXEC sp_helpindex 'bestellungen'`.",
    erklaerung: "Ein Index ist wie ein Stichwortverzeichnis: Suchen nach kunde_id müssen nicht mehr die ganze Tabelle durchlaufen. Dafür kosten INSERT/UPDATE etwas mehr."
  },

  // ───────────── Stufe 3: Unterabfragen, CTE, Fensterfunktionen, DDL, Transaktionen ─────────────
  {
    id: 'sql-43', stufe: 3, thema: 'SUBQUERY', titel: 'Über dem Durchschnitt',
    text: "Welche **beschäftigten Nicht-Azubis** verdienen **mehr als der Durchschnitt** aller beschäftigten Nicht-Azubis? Liste `vorname`, `nachname`, `gehalt`.",
    art: 'abfrage',
    loesung: `SELECT vorname, nachname, gehalt FROM mitarbeiter
WHERE azubi = 0 AND austritt IS NULL
  AND gehalt > (SELECT AVG(gehalt) FROM mitarbeiter WHERE azubi = 0 AND austritt IS NULL);`,
    pruefSql: null, reihenfolge: false, spaltenNamen: false,
    hinweise: ["Den Durchschnitt berechnet eine Unterabfrage in Klammern.", "Ein Aggregat darf nicht direkt im WHERE stehen – `WHERE gehalt > AVG(gehalt)` ist ein Fehler.", "Die Filter gelten in Haupt- UND Unterabfrage."],
    tsql: "In T-SQL identisch.",
    erklaerung: "Eine skalare Unterabfrage liefert genau einen Wert, mit dem jede Zeile verglichen wird."
  },
  {
    id: 'sql-44', stufe: 3, thema: 'SUBQUERY', titel: 'Artikel in Stornos',
    text: "Die Qualitätssicherung untersucht Stornierungen: Welche Artikel kamen in **mindestens einer stornierten Bestellung** vor? Liste `artikel_id` und `bezeichnung` (jeden Artikel nur einmal) – mit `IN` und Unterabfrage.",
    art: 'abfrage',
    loesung: `SELECT artikel_id, bezeichnung FROM artikel
WHERE artikel_id IN (SELECT p.artikel_id FROM bestellpositionen p
                     JOIN bestellungen b ON b.best_id = p.best_id
                     WHERE b.status = 'storniert');`,
    pruefSql: null, reihenfolge: false, spaltenNamen: false,
    hinweise: ["Die Unterabfrage liefert alle artikel_id aus stornierten Bestellungen.", "`WHERE artikel_id IN (SELECT …)` – Doppelte entstehen so nicht."],
    tsql: "In T-SQL identisch.",
    erklaerung: "Mit IN fragt man „ist der Wert in dieser Menge?“. Anders als ein JOIN erzeugt IN keine doppelten Artikelzeilen."
  },
  {
    id: 'sql-45', stufe: 3, thema: 'SUBQUERY', titel: 'Aktive Kunden Q1/2026',
    text: "Der Vertrieb fragt: Welche Kunden haben im **ersten Quartal 2026** (1.1.–31.3.2026) mindestens eine Bestellung aufgegeben? Liste `firma` – mit `EXISTS`.",
    art: 'abfrage',
    loesung: `SELECT k.firma FROM kunden k
WHERE EXISTS (SELECT 1 FROM bestellungen b
              WHERE b.kunde_id = k.kunde_id
                AND b.datum BETWEEN '2026-01-01' AND '2026-03-31');`,
    pruefSql: null, reihenfolge: false, spaltenNamen: false,
    hinweise: ["EXISTS ist wahr, sobald die Unterabfrage mindestens eine Zeile liefert.", "Die Unterabfrage bezieht sich auf den äußeren Kunden: `b.kunde_id = k.kunde_id` (korreliert)."],
    tsql: "In T-SQL identisch.",
    erklaerung: "Die Unterabfrage wird gedanklich je Kunde ausgeführt. Was sie auswählt (`SELECT 1`), ist egal – nur ob es Zeilen gibt."
  },
  {
    id: 'sql-46', stufe: 3, thema: 'SUBQUERY', titel: 'Noch keine Stunde gebucht',
    text: "Die Projektsteuerung sucht Projektmitglieder, die auf **ihrem** Projekt **noch keine einzige Stunde** erfasst haben. Liste Projektname, `vorname`, `nachname` – mit `NOT EXISTS`.",
    art: 'abfrage',
    loesung: `SELECT p.name, m.vorname, m.nachname
FROM projekt_mitarbeiter pm
JOIN projekte p ON p.projekt_id = pm.projekt_id
JOIN mitarbeiter m ON m.ma_id = pm.ma_id
WHERE NOT EXISTS (SELECT 1 FROM zeiterfassung z
                  WHERE z.ma_id = pm.ma_id AND z.projekt_id = pm.projekt_id);`,
    pruefSql: null, reihenfolge: false, spaltenNamen: false,
    hinweise: ["Ausgangspunkt ist `projekt_mitarbeiter` (wer gehört zu welchem Projekt).", "Die Unterabfrage muss auf Mitarbeiter UND Projekt korrelieren.", "Namen über JOINs auf `projekte` und `mitarbeiter` holen."],
    tsql: "In T-SQL identisch.",
    erklaerung: "Die Korrelation über zwei Spalten prüft genau die Paarung Person–Projekt. Es betrifft das noch geplante Projekt ohne jede Zeiterfassung."
  },
  {
    id: 'sql-47', stufe: 3, thema: 'SUBQUERY', titel: 'Spitzenverdiener je Abteilung',
    text: "Wer verdient in seiner Abteilung **am meisten**? Liste Abteilungsname, `vorname`, `nachname`, `gehalt` – mit einer **korrelierten Unterabfrage** (bei Gleichstand würden alle Gleichen erscheinen).",
    art: 'abfrage',
    loesung: `SELECT a.name, m.vorname, m.nachname, m.gehalt
FROM mitarbeiter m
JOIN abteilungen a ON a.abt_id = m.abt_id
WHERE m.gehalt = (SELECT MAX(m2.gehalt) FROM mitarbeiter m2 WHERE m2.abt_id = m.abt_id);`,
    pruefSql: null, reihenfolge: false, spaltenNamen: false,
    hinweise: ["Für jede Zeile das Maximum ihrer eigenen Abteilung bestimmen.", "Zweiter Alias in der Unterabfrage: `WHERE m2.abt_id = m.abt_id`."],
    tsql: "In T-SQL identisch; alternativ mit `RANK() OVER (PARTITION BY abt_id ORDER BY gehalt DESC) = 1`.",
    erklaerung: "Die korrelierte Unterabfrage hängt von der äußeren Zeile ab und wird je Abteilung neu ausgewertet."
  },
  {
    id: 'sql-48', stufe: 3, thema: 'CTE', titel: 'Projekte über Plan',
    text: "Das Controlling will wissen, bei welchen Projekten **mehr Stunden erfasst** wurden **als geplant** (Plan = Summe `stunden_geplant` der Projektmitglieder). Nutze eine CTE (`WITH`). Spalten: Projektname, `plan`, `ist`.",
    art: 'abfrage',
    loesung: `WITH plan AS (SELECT projekt_id, SUM(stunden_geplant) AS plan FROM projekt_mitarbeiter GROUP BY projekt_id),
     ist  AS (SELECT projekt_id, SUM(stunden) AS ist FROM zeiterfassung GROUP BY projekt_id)
SELECT p.name, plan.plan, ist.ist
FROM projekte p
JOIN plan ON plan.projekt_id = p.projekt_id
JOIN ist  ON ist.projekt_id = p.projekt_id
WHERE ist.ist > plan.plan;`,
    pruefSql: null, reihenfolge: false, spaltenNamen: false,
    hinweise: ["Zwei Zwischenergebnisse: geplante Stunden je Projekt und erfasste Stunden je Projekt.", "`WITH plan AS (…), ist AS (…) SELECT …` – mehrere CTEs mit Komma trennen.", "Erst summieren, dann joinen – sonst vervielfachen sich die Summen."],
    tsql: "In T-SQL identisch. Steht davor eine andere Anweisung, muss sie dort mit `;` abgeschlossen sein (daher oft `;WITH …`).",
    erklaerung: "Würde man projekt_mitarbeiter und zeiterfassung direkt joinen, würde jede Zeiterfassung mehrfach gezählt. Die CTEs aggregieren getrennt und machen die Abfrage lesbar."
  },
  {
    id: 'sql-49', stufe: 3, thema: 'CTE', titel: 'Dienstweg eines Azubis',
    text: "Der Azubi **Lars Wolf** (`ma_id = 97`) möchte seinen Dienstweg bis zur Geschäftsführung kennen. Liste mit einer **rekursiven CTE** über `vorgesetzter_id`: `ebene` (0 = Lars Wolf selbst, 1 = direkte Vorgesetzte, …), `vorname`, `nachname`, `position` – sortiert nach `ebene`.",
    art: 'abfrage',
    loesung: `WITH RECURSIVE kette(ma_id, vorgesetzter_id, ebene) AS (
  SELECT ma_id, vorgesetzter_id, 0 FROM mitarbeiter WHERE ma_id = 97
  UNION ALL
  SELECT m.ma_id, m.vorgesetzter_id, k.ebene + 1
  FROM mitarbeiter m JOIN kette k ON m.ma_id = k.vorgesetzter_id
)
SELECT k.ebene, m.vorname, m.nachname, m.position
FROM kette k JOIN mitarbeiter m ON m.ma_id = k.ma_id
ORDER BY k.ebene;`,
    pruefSql: null, reihenfolge: true, spaltenNamen: false,
    hinweise: ["Startzeile (Anker): der Mitarbeiter 97 mit Ebene 0.", "Rekursiver Teil: der Mitarbeiter, dessen `ma_id` gleich der `vorgesetzter_id` der letzten Zeile ist, mit `ebene + 1`.", "`WITH RECURSIVE kette AS (anker UNION ALL rekursiv) SELECT …` – die Rekursion endet bei der Geschäftsführung (vorgesetzter_id NULL)."],
    tsql: "In T-SQL ohne das Schlüsselwort RECURSIVE: `WITH kette AS (…)`. Standardgrenze dort 100 Rekursionen (`OPTION (MAXRECURSION n)`).",
    erklaerung: "Eine rekursive CTE wiederholt den rekursiven Teil, bis er keine neuen Zeilen mehr liefert. So lassen sich Hierarchien beliebiger Tiefe durchlaufen."
  },
  {
    id: 'sql-50', stufe: 3, thema: 'CTE', titel: 'Alle unter der Ausbildungsleitung',
    text: "Die Ausbildungsleiterin **Isabel Haas** (`ma_id = 91`) will wissen, wer **direkt oder indirekt** unter ihr steht. Liste per rekursiver CTE `ma_id`, `vorname`, `nachname` und `ebene` (1 = direkt unterstellt, 2 = darunter, …) – ohne Frau Haas selbst.",
    art: 'abfrage',
    loesung: `WITH RECURSIVE team(ma_id, ebene) AS (
  SELECT ma_id, 1 FROM mitarbeiter WHERE vorgesetzter_id = 91
  UNION ALL
  SELECT m.ma_id, t.ebene + 1 FROM mitarbeiter m JOIN team t ON m.vorgesetzter_id = t.ma_id
)
SELECT m.ma_id, m.vorname, m.nachname, t.ebene
FROM team t JOIN mitarbeiter m ON m.ma_id = t.ma_id;`,
    pruefSql: null, reihenfolge: false, spaltenNamen: false,
    hinweise: ["Diesmal geht es nach unten: Anker sind alle mit `vorgesetzter_id = 91`.", "Rekursiv: alle, deren `vorgesetzter_id` eine `ma_id` aus dem bisherigen Team ist.", "Ebene im rekursiven Teil um 1 erhöhen."],
    tsql: "In T-SQL: `WITH team AS (…)` ohne RECURSIVE, sonst gleich. Alternativ gibt es dort den Datentyp `hierarchyid`.",
    erklaerung: "Die Richtung der JOIN-Bedingung entscheidet, ob man die Hierarchie hinauf (Dienstweg) oder hinunter (Team) läuft."
  },
  {
    id: 'sql-51', stufe: 3, thema: 'FENSTER', titel: 'Die zwei Bestbezahlten je Abteilung',
    text: "Für die Gehaltsrunde: Ermittle je Abteilung die **zwei bestbezahlten beschäftigten Nicht-Azubis** mit `RANK()`. Spalten: Abteilungsname, `vorname`, `nachname`, `gehalt`, `rang`. (Bei Gleichstand dürfen mehr als zwei erscheinen.)",
    art: 'abfrage',
    loesung: `SELECT name, vorname, nachname, gehalt, rang FROM (
  SELECT a.name, m.vorname, m.nachname, m.gehalt,
         RANK() OVER (PARTITION BY m.abt_id ORDER BY m.gehalt DESC) AS rang
  FROM mitarbeiter m JOIN abteilungen a ON a.abt_id = m.abt_id
  WHERE m.azubi = 0 AND m.austritt IS NULL
) WHERE rang <= 2;`,
    pruefSql: null, reihenfolge: false, spaltenNamen: false,
    hinweise: ["`RANK() OVER (PARTITION BY abt_id ORDER BY gehalt DESC)` nummeriert je Abteilung.", "Fensterfunktionen dürfen nicht im WHERE derselben Abfrage stehen – erst in einer Unterabfrage/CTE berechnen, dann außen filtern."],
    tsql: "In T-SQL identisch; die Unterabfrage im FROM braucht dort zwingend einen Alias (`) AS x WHERE rang <= 2`).",
    erklaerung: "PARTITION BY startet die Rangfolge je Abteilung neu. RANK vergibt bei Gleichstand denselben Rang, ROW_NUMBER würde willkürlich trennen."
  },
  {
    id: 'sql-52', stufe: 3, thema: 'FENSTER', titel: 'Letzte Bestellung je Kunde',
    text: "Der Vertrieb möchte zu jedem Kunden mit Bestellungen die **jüngste Bestellung**: `firma`, `best_id`, `datum`. Bei mehreren Bestellungen am selben Tag gilt die mit der höheren `best_id`. Nutze `ROW_NUMBER()`.",
    art: 'abfrage',
    loesung: `WITH n AS (
  SELECT b.*, ROW_NUMBER() OVER (PARTITION BY b.kunde_id ORDER BY b.datum DESC, b.best_id DESC) AS nr
  FROM bestellungen b
)
SELECT k.firma, n.best_id, n.datum FROM n JOIN kunden k ON k.kunde_id = n.kunde_id WHERE n.nr = 1;`,
    pruefSql: null, reihenfolge: false, spaltenNamen: false,
    hinweise: ["ROW_NUMBER nummeriert je Kunde (PARTITION BY kunde_id) fortlaufend.", "Neueste zuerst: `ORDER BY datum DESC, best_id DESC` innerhalb von OVER.", "Außen nur `nr = 1` behalten."],
    tsql: "In T-SQL identisch.",
    erklaerung: "„Top-1 je Gruppe“ ist der klassische Einsatz von ROW_NUMBER. Die zweite Sortierspalte macht die Nummerierung eindeutig."
  },
  {
    id: 'sql-53', stufe: 3, thema: 'FENSTER', titel: 'Kumulierter Umsatz 2025',
    text: "Die Geschäftsführung möchte für 2025 den Umsatz je Monat und den **bis dahin aufgelaufenen Umsatz**. Umsatz = Summe `menge * einzelpreis` nicht stornierter Bestellungen. Spalten: `monat` (`YYYY-MM`), `umsatz`, `kumuliert` – beide auf 2 Stellen gerundet, chronologisch.",
    art: 'abfrage',
    loesung: `WITH m AS (
  SELECT strftime('%Y-%m', b.datum) AS monat, SUM(p.menge * p.einzelpreis) AS umsatz
  FROM bestellungen b JOIN bestellpositionen p ON p.best_id = b.best_id
  WHERE b.status <> 'storniert' AND b.datum BETWEEN '2025-01-01' AND '2025-12-31'
  GROUP BY monat
)
SELECT monat, ROUND(umsatz, 2) AS umsatz, ROUND(SUM(umsatz) OVER (ORDER BY monat), 2) AS kumuliert
FROM m ORDER BY monat;`,
    pruefSql: null, reihenfolge: true, spaltenNamen: false,
    hinweise: ["Erst Umsatz je Monat bilden (GROUP BY), z. B. in einer CTE.", "Laufende Summe: `SUM(umsatz) OVER (ORDER BY monat)`.", "Runden erst am Ende."],
    tsql: "In T-SQL: Monat mit `FORMAT(b.datum, 'yyyy-MM')`; `SUM(…) OVER (ORDER BY monat ROWS UNBOUNDED PRECEDING)` ist dort die übliche, schnellere Schreibweise.",
    erklaerung: "Eine Aggregatfunktion mit OVER (ORDER BY …) bildet eine laufende Summe, ohne die Zeilen zusammenzufassen."
  },
  {
    id: 'sql-54', stufe: 3, thema: 'JOIN', titel: 'Wer arbeitet an der Firewall?',
    text: "Die Projektleitung **Firewall-Erneuerung** braucht die erfassten Stunden je Person: `vorname`, `nachname`, Abteilungsname und die Summe der Stunden als `stunden` (nur Zeiterfassung auf dieses Projekt).",
    art: 'abfrage',
    loesung: `SELECT m.vorname, m.nachname, a.name, SUM(z.stunden) AS stunden
FROM zeiterfassung z
JOIN projekte p ON p.projekt_id = z.projekt_id
JOIN mitarbeiter m ON m.ma_id = z.ma_id
LEFT JOIN abteilungen a ON a.abt_id = m.abt_id
WHERE p.name = 'Firewall-Erneuerung'
GROUP BY m.ma_id, m.vorname, m.nachname, a.name;`,
    pruefSql: null, reihenfolge: false, spaltenNamen: false,
    hinweise: ["Vier Tabellen: zeiterfassung, projekte (Name), mitarbeiter (Person), abteilungen (Abteilung).", "Filter über den Projektnamen, dann je Person gruppieren.", "Gruppiere nach `m.ma_id` – zwei Personen könnten gleich heißen."],
    tsql: "In T-SQL identisch; dort müssen alle nicht aggregierten SELECT-Spalten auch im GROUP BY stehen.",
    erklaerung: "Mehrfach-JOINs liefern die Stammdaten zur Bewegungstabelle zeiterfassung. Gruppiert wird nach der eindeutigen ma_id."
  },
  {
    id: 'sql-55', stufe: 3, thema: 'INSERT', titel: 'Azubis ins Rollout-Projekt',
    text: "Für das Projekt **Client-Rollout Windows 11** (`projekt_id = 9`) sollen **alle FiSi-Azubis** (Position endet auf `FiSi`), die **noch nicht** im Projekt sind, als Rolle `Mitarbeit (Azubi)` mit **40** geplanten Stunden eingetragen werden. Nutze `INSERT … SELECT`.",
    art: 'aenderung',
    loesung: `INSERT INTO projekt_mitarbeiter (projekt_id, ma_id, rolle, stunden_geplant)
SELECT 9, ma_id, 'Mitarbeit (Azubi)', 40 FROM mitarbeiter
WHERE azubi = 1 AND position LIKE '%FiSi'
  AND ma_id NOT IN (SELECT ma_id FROM projekt_mitarbeiter WHERE projekt_id = 9);`,
    pruefSql: `SELECT projekt_id, ma_id, rolle, stunden_geplant FROM projekt_mitarbeiter WHERE projekt_id = 9 ORDER BY ma_id`,
    reihenfolge: true, spaltenNamen: false,
    hinweise: ["`INSERT INTO ziel (spalten) SELECT …` fügt alle Zeilen der Abfrage ein.", "Ein Azubi ist schon im Projekt – der Primärschlüssel (projekt_id, ma_id) würde sonst verletzt.", "Bereits vorhandene ausschließen: `ma_id NOT IN (SELECT ma_id FROM projekt_mitarbeiter WHERE projekt_id = 9)`."],
    tsql: "In T-SQL identisch. SQLite kennt zusätzlich `INSERT OR IGNORE`, T-SQL nicht – dort ist `NOT EXISTS`/`MERGE` der Weg.",
    erklaerung: "INSERT … SELECT überträgt viele Zeilen in einem Schritt. Der zusammengesetzte Primärschlüssel verhindert doppelte Zuordnungen."
  },
  {
    id: 'sql-56', stufe: 3, thema: 'DELETE', titel: 'Stornos bereinigen',
    text: "Die Buchhaltung archiviert: Lösche alle **stornierten Bestellungen samt ihren Positionen**. Achtung: Die Fremdschlüssel sind aktiv (`PRAGMA foreign_keys = ON`) – wähle die richtige Reihenfolge.",
    art: 'aenderung',
    loesung: `DELETE FROM bestellpositionen WHERE best_id IN (SELECT best_id FROM bestellungen WHERE status = 'storniert');
DELETE FROM bestellungen WHERE status = 'storniert';`,
    pruefSql: `SELECT (SELECT COUNT(*) FROM bestellungen) AS bestellungen, (SELECT COUNT(*) FROM bestellpositionen) AS positionen, (SELECT COUNT(*) FROM bestellungen WHERE status = 'storniert') AS storniert`,
    reihenfolge: false, spaltenNamen: false,
    hinweise: ["Löschst du zuerst die Bestellungen, meldet SQLite `FOREIGN KEY constraint failed`.", "Erst die Kinder (bestellpositionen), dann die Eltern (bestellungen).", "Positionen stornierter Bestellungen: `WHERE best_id IN (SELECT best_id FROM bestellungen WHERE status = 'storniert')`."],
    tsql: "In T-SQL gleiche Reihenfolge – oder man legt den Fremdschlüssel mit `ON DELETE CASCADE` an. Beide Löschungen gehören in eine Transaktion (`BEGIN TRANSACTION … COMMIT`).",
    erklaerung: "Ein Fremdschlüssel verbietet „verwaiste“ Kindzeilen. Deshalb müssen erst die Positionen weg, dann dürfen die Bestellköpfe gelöscht werden."
  },
  {
    id: 'sql-57', stufe: 3, thema: 'CREATE', titel: 'Tabelle für Schulungen',
    text: "Die Personalabteilung will Weiterbildungen erfassen. Lege die Tabelle `schulungen` an: `schulung_id` **INTEGER PRIMARY KEY**, `ma_id` **INTEGER NOT NULL** mit Fremdschlüssel auf `mitarbeiter(ma_id)`, `titel` **TEXT NOT NULL**, `datum` **TEXT NOT NULL**, `kosten` **REAL** mit `CHECK (kosten >= 0)`. Spalten in genau dieser Reihenfolge.",
    art: 'aenderung',
    loesung: `CREATE TABLE schulungen (
  schulung_id INTEGER PRIMARY KEY,
  ma_id INTEGER NOT NULL REFERENCES mitarbeiter(ma_id),
  titel TEXT NOT NULL,
  datum TEXT NOT NULL,
  kosten REAL CHECK (kosten >= 0)
);`,
    pruefSql: `SELECT t.cid, t.name, t.type, t."notnull", t.pk,
  (SELECT f."table" || '.' || f."to" FROM pragma_foreign_key_list('schulungen') f WHERE f."from" = t.name) AS fk,
  (SELECT replace(lower(sql), ' ', '') LIKE '%check(kosten>=0)%' FROM sqlite_master WHERE name = 'schulungen') AS check_ok
FROM pragma_table_info('schulungen') t ORDER BY t.cid`,
    reihenfolge: true, spaltenNamen: false,
    hinweise: ["Grundgerüst: `CREATE TABLE schulungen ( spalte TYP constraints, … );`", "Fremdschlüssel direkt an der Spalte: `ma_id INTEGER NOT NULL REFERENCES mitarbeiter(ma_id)`.", "Den CHECK hängst du an die Spalte: `kosten REAL CHECK (kosten >= 0)`."],
    tsql: "In T-SQL: `schulung_id INT IDENTITY(1,1) PRIMARY KEY`, `titel NVARCHAR(200) NOT NULL`, `datum DATE NOT NULL`, `kosten DECIMAL(10,2) CHECK (kosten >= 0)`; Fremdschlüssel per `CONSTRAINT fk_… FOREIGN KEY (ma_id) REFERENCES mitarbeiter(ma_id)`.",
    erklaerung: "Constraints sichern die Daten schon beim Speichern: NOT NULL gegen Lücken, REFERENCES gegen Phantom-Mitarbeiter, CHECK gegen negative Kosten. Prüfbar mit `PRAGMA table_info(schulungen)`."
  },
  {
    id: 'sql-58', stufe: 3, thema: 'VIEW', titel: 'Sicht Telefonbuch',
    text: "Das Intranet soll ein Telefonbuch bekommen, ohne direkt auf die Tabellen zuzugreifen. Lege die Sicht `v_telefonbuch` mit den Spalten `name` (`Vorname Nachname`), `abteilung` (Abteilungsname, bei Mitarbeitenden ohne Abteilung leer/NULL) und `telefon` an – nur für **beschäftigte** Mitarbeitende.",
    art: 'aenderung',
    loesung: `CREATE VIEW v_telefonbuch AS
SELECT m.vorname || ' ' || m.nachname AS name, a.name AS abteilung, m.telefon
FROM mitarbeiter m LEFT JOIN abteilungen a ON a.abt_id = m.abt_id
WHERE m.austritt IS NULL;`,
    pruefSql: `SELECT name, abteilung, telefon FROM v_telefonbuch`,
    reihenfolge: false, spaltenNamen: false,
    hinweise: ["`CREATE VIEW name AS SELECT …`", "Die Spaltennamen der Sicht kommen aus den Aliasen: `AS name`, `AS abteilung`.", "Mitarbeitende ohne Abteilung brauchen einen LEFT JOIN."],
    tsql: "In T-SQL identisch bis auf die Verkettung (`+` oder `CONCAT`). Ändern geht dort mit `CREATE OR ALTER VIEW`; SQLite kennt nur DROP VIEW + CREATE VIEW.",
    erklaerung: "Eine Sicht speichert nur die Abfrage, keine Daten. Sie liefert immer den aktuellen Stand und verbirgt Spalten wie Gehalt vor dem Intranet."
  },
  {
    id: 'sql-59', stufe: 3, thema: 'TRANSAKTION', titel: 'Budget-Umbuchung',
    text: "Die Geschäftsführung verschiebt **50.000 €** Budget von **IT-Betrieb** (`abt_id 2`) zum **IT-Support** (`abt_id 3`). Beide Änderungen müssen gemeinsam gelingen oder gemeinsam scheitern: Führe sie in **einer Transaktion** aus (`BEGIN` … `COMMIT`).",
    art: 'aenderung',
    loesung: `BEGIN TRANSACTION;
UPDATE abteilungen SET budget = budget - 50000 WHERE abt_id = 2;
UPDATE abteilungen SET budget = budget + 50000 WHERE abt_id = 3;
COMMIT;`,
    pruefSql: `SELECT abt_id, budget FROM abteilungen ORDER BY abt_id`,
    reihenfolge: true, spaltenNamen: false,
    hinweise: ["Eine Transaktion beginnt mit `BEGIN TRANSACTION;` (oder `BEGIN;`).", "Dazwischen die beiden UPDATEs.", "Mit `COMMIT;` festschreiben – `ROLLBACK;` würde alles verwerfen."],
    tsql: "In T-SQL: `BEGIN TRANSACTION; … COMMIT TRANSACTION;` – meist kombiniert mit `BEGIN TRY … END TRY BEGIN CATCH ROLLBACK END CATCH`.",
    erklaerung: "Transaktionen sind atomar (ACID): Entweder beide Buchungen werden sichtbar oder keine. Ohne Transaktion könnte bei einem Fehler Geld „verschwinden“."
  },
  {
    id: 'sql-60', stufe: 3, thema: 'DELETE', titel: 'Abteilung auflösen',
    text: "Die Abteilung **Ausbildung** (`abt_id 10`) geht in der Abteilung **Personal** (`abt_id 9`) auf. Ein direktes `DELETE FROM abteilungen WHERE abt_id = 10` scheitert mit `FOREIGN KEY constraint failed`. Löse das Problem: Hänge zuerst alle Mitarbeitenden der Ausbildung in die Abteilung Personal um und lösche dann die Abteilung.",
    art: 'aenderung',
    loesung: `UPDATE mitarbeiter SET abt_id = 9 WHERE abt_id = 10;
DELETE FROM abteilungen WHERE abt_id = 10;`,
    pruefSql: `SELECT (SELECT COUNT(*) FROM abteilungen) AS abteilungen, (SELECT COUNT(*) FROM mitarbeiter WHERE abt_id = 9) AS personal, (SELECT COUNT(*) FROM mitarbeiter WHERE abt_id IS NULL) AS ohne_abteilung`,
    reihenfolge: false, spaltenNamen: false,
    hinweise: ["Probier zuerst das DELETE und lies die Fehlermeldung: Wer verweist noch auf abt_id 10?", "`mitarbeiter.abt_id` ist ein Fremdschlüssel auf `abteilungen` – erst umhängen.", "`UPDATE mitarbeiter SET abt_id = 9 WHERE abt_id = 10;` danach das DELETE."],
    tsql: "In T-SQL gleiches Vorgehen; die Meldung lautet dort „The DELETE statement conflicted with the REFERENCE constraint …“. Alternativ: Fremdschlüssel mit `ON DELETE SET NULL` – hier aber unerwünscht.",
    erklaerung: "Die referenzielle Integrität verhindert, dass Mitarbeitende auf eine nicht mehr existierende Abteilung zeigen. Erst wenn niemand mehr auf die Zeile verweist, darf sie gelöscht werden."
  }
];
