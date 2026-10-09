---
id: db-labor-select
bereich: Datenbanken
block: D4
kapitel: SQL-Labor (Firmen-DB)
titel: SELECT, WHERE, ORDER BY – Daten gezielt abfragen
stufe: Einsteiger
fach: SQL / Datenbanken
pruefungen: [AP1, AP2, Schule]
quellen: [SQLite-Dokumentation, Microsoft Learn – T-SQL]
verweise: [db-select-basics, db-select-funktionen, db-sql-grundlagen, db-labor-aggregate, db-labor-joins]
---

## Profi

### Aufbau einer Abfrage
Eine einfache Abfrage (Query) besteht aus Klauseln (clauses) in fester Schreibreihenfolge:

```sql
SELECT   vorname, nachname, gehalt          -- Projektion: welche Spalten
FROM     mitarbeiter                        -- Quelle: welche Tabelle
WHERE    abt_id = 2                         -- Selektion: welche Zeilen
ORDER BY nachname ASC, vorname ASC          -- Sortierung
LIMIT    10;                                -- Begrenzung (SQLite)
```

Alle Beispiele beziehen sich auf die Firmen-Datenbank der **Netzilon GmbH** (Tabellen `mitarbeiter`, `abteilungen`, `standorte`, `kunden`, `projekte`, `projekt_mitarbeiter`, `artikel`, `bestellungen`, `bestellpositionen`, `zeiterfassung`). **Probier es im SQL-Labor (Werkzeuge) aus.**

### SELECT – Spalten, Ausdrücke, Aliase
- `SELECT *` liefert alle Spalten – praktisch zum Erkunden, in Programmen und Prüfungslösungen aber schlechter Stil (Spaltenreihenfolge/-anzahl kann sich ändern).
- Berechnete Spalten: `SELECT bezeichnung, verkaufspreis - einkaufspreis AS marge FROM artikel;`
- **Spaltenalias** (column alias) mit `AS`: Überschrift im Ergebnis. Enthält der Alias Leerzeichen, in doppelte Anführungszeichen setzen: `AS "Marge in Euro"`.
- **Tabellenalias** (table alias): `FROM mitarbeiter AS m` bzw. `FROM mitarbeiter m` – wird bei Joins wichtig.
- Zeichenketten stehen in **einfachen** Anführungszeichen `'Hamburg'`; doppelte Anführungszeichen kennzeichnen nach SQL-Standard **Bezeichner** (Spalten-/Tabellennamen).

### DISTINCT – Duplikate entfernen
`SELECT DISTINCT position FROM mitarbeiter;` liefert jede Position nur einmal. DISTINCT wirkt auf die **gesamte Zeile** der Spaltenliste: `SELECT DISTINCT abt_id, position` entfernt nur Zeilen, die in **beiden** Spalten gleich sind. NULL-Werte gelten für DISTINCT als gleich (eine NULL-Zeile bleibt übrig).

### WHERE – Zeilen filtern
Vergleichsoperatoren: `=`, `<>` (Standard) bzw. `!=`, `<`, `<=`, `>`, `>=`.

| Operator | Beispiel (Firmen-DB) | Bedeutung |
|---|---|---|
| `AND` | `abt_id = 2 AND gehalt > 4000` | beide Bedingungen wahr |
| `OR` | `abt_id = 2 OR abt_id = 3` | mindestens eine wahr |
| `NOT` | `NOT status = 'storniert'` | Bedingung umkehren |
| `BETWEEN` | `datum BETWEEN '2025-01-01' AND '2025-03-31'` | Bereich **inklusive** beider Grenzen |
| `IN` | `status IN ('offen','versendet')` | Wert in Liste |
| `LIKE` | `nachname LIKE 'B%'` | Muster: `%` = beliebig viele Zeichen, `_` = genau ein Zeichen |
| `IS NULL` | `austritt IS NULL` | Wert fehlt (unbekannt) |
| `IS NOT NULL` | `abt_id IS NOT NULL` | Wert vorhanden |

**Vorrang (precedence)**: `NOT` vor `AND` vor `OR`. Deshalb immer klammern:
```sql
-- Mitarbeitende aus IT-Betrieb ODER IT-Support, die mehr als 4000 Euro verdienen
SELECT vorname, nachname, abt_id, gehalt
FROM mitarbeiter
WHERE (abt_id = 2 OR abt_id = 3) AND gehalt > 4000;
```
Ohne Klammern würde `abt_id = 2 OR (abt_id = 3 AND gehalt > 4000)` ausgewertet – alle aus Abteilung 2 unabhängig vom Gehalt.

### NULL und dreiwertige Logik
NULL bedeutet „unbekannt / nicht vorhanden“, nicht 0 und nicht leerer Text. Jeder Vergleich mit NULL (`= NULL`, `<> NULL`) ergibt **UNKNOWN** – die Zeile wird von WHERE **nicht** geliefert. Deshalb: `WHERE austritt IS NULL` (aktive Mitarbeitende), nie `WHERE austritt = NULL`. Auch `WHERE abt_id <> 2` liefert die 2 Mitarbeitenden **ohne Abteilung** (abt_id NULL) **nicht** mit!

### LIKE im Detail
- `email LIKE '%@netzilon.example'` – endet auf die Firmendomäne.
- `benutzername LIKE '_._%'` – zweites Zeichen ist ein Punkt (einbuchstabiger Vorname).
- In SQLite ist `LIKE` für ASCII-Buchstaben **nicht** case-sensitiv (`'b%'` findet auch „Brecht“), Umlaute werden aber case-sensitiv verglichen. `GLOB` ist case-sensitiv und nutzt `*`/`?`.
- Platzhalter selbst suchen: `LIKE '%10\%%' ESCAPE '\'`.

### ORDER BY und LIMIT
- `ORDER BY gehalt DESC, nachname ASC` – mehrere Sortierschlüssel, `ASC` ist Standard.
- Sortieren nach Alias ist erlaubt (`ORDER BY marge DESC`), ebenso nach Spaltennummer (`ORDER BY 2`, schlechter Stil).
- NULL-Werte stehen in SQLite bei `ASC` **vorne** (NULL gilt als kleinster Wert); seit SQLite 3.30 steuerbar mit `NULLS FIRST`/`NULLS LAST`.
- `LIMIT 5` liefert die ersten 5 Zeilen, `LIMIT 5 OFFSET 10` überspringt 10 Zeilen (Seite 3 bei 5 pro Seite). Ohne ORDER BY ist „die ersten 5“ **zufällig** (Mengen haben keine Reihenfolge).

### Datumswerte in der Firmen-DB
Datumswerte sind ISO-Text `YYYY-MM-DD`. Weil ISO-Text lexikografisch genauso sortiert wie chronologisch, funktionieren `<`, `>`, `BETWEEN` und `ORDER BY` direkt: `WHERE eintritt >= '2024-01-01'`.

### T-SQL-Unterschied
| Aufgabe | SQLite (SQL-Labor) | T-SQL (SQL Server) |
|---|---|---|
| Erste n Zeilen | `... ORDER BY gehalt DESC LIMIT 5` | `SELECT TOP (5) ... ORDER BY gehalt DESC` |
| Blättern | `LIMIT 10 OFFSET 20` | `ORDER BY ... OFFSET 20 ROWS FETCH NEXT 10 ROWS ONLY` (ORDER BY Pflicht) |
| Gleichstände mitnehmen | per Unterabfrage/RANK | `SELECT TOP (5) WITH TIES ... ORDER BY gehalt DESC` |
| Zeichenketten verketten | `vorname \|\| ' ' \|\| nachname` | `vorname + ' ' + nachname` oder `CONCAT(vorname, ' ', nachname)` |
| Groß-/Kleinschreibung bei LIKE | ASCII case-insensitiv | abhängig von der **Sortierung (Collation)**, Standard `..._CI_AS` = case-insensitiv |
| Bezeichner mit Leerzeichen | `"Marge in Euro"` | `[Marge in Euro]` oder `"..."` |
| NULL-Sortierung | NULL zuerst bei ASC, `NULLS LAST` möglich | NULL zuerst bei ASC, **kein** `NULLS LAST` (Trick: `ORDER BY CASE WHEN x IS NULL THEN 1 ELSE 0 END, x`) |
| Prozent-Zeichen suchen | `LIKE '%10\%%' ESCAPE '\'` | zusätzlich `LIKE '%10[%]%'` |

Hinweis: `+` mit NULL ergibt in T-SQL NULL, `CONCAT` behandelt NULL als leeren Text. In SQLite ergibt `||` mit NULL ebenfalls NULL.

## Einfach

Stell dir die Firmen-Datenbank der Netzilon GmbH wie einen **riesigen Aktenschrank** vor. In der Schublade „mitarbeiter“ liegen 100 Karteikarten – auf jeder stehen Vorname, Nachname, Abteilung, Gehalt und so weiter.

Mit **SELECT** sagst du dem Schrank: „Zeig mir von jeder Karte nur Vorname und Nachname.“ Mit **FROM** sagst du, **welche Schublade** gemeint ist. Mit **WHERE** stellst du eine **Bedingung**: „Aber nur die Karten, auf denen Abteilung 2 steht.“ Das ist wie ein **Sieb**: Nur was passt, fällt durch.

Mit **ORDER BY** legst du die Karten **in eine Reihenfolge** – zum Beispiel nach Nachname von A bis Z. Und mit **LIMIT 5** sagst du: „Mir reichen die ersten fünf.“

Ein paar Zaubertricks für das Sieb:
- **BETWEEN** ist ein Bereich wie „zwischen 1. Januar und 31. März“ – beide Tage gehören dazu.
- **IN** ist eine Liste: „Status ist offen **oder** versendet“.
- **LIKE** ist eine Suche mit Joker: `'B%'` heißt „fängt mit B an, danach egal was“.
- **IS NULL** heißt „auf der Karte steht an dieser Stelle **gar nichts**“. Bei Netzilon steht zum Beispiel bei „austritt“ nichts, wenn jemand noch in der Firma arbeitet.

Ganz wichtig: **Leer ist nicht gleich null Euro!** „Nichts eingetragen“ kann man nicht mit `=` vergleichen – dafür gibt es extra `IS NULL`.

Und **DISTINCT** ist wie Doppelte aussortieren: Wenn zehn Leute „Systemadministrator“ sind, zeigt DISTINCT den Beruf nur einmal.

Probier es im SQL-Labor (Werkzeuge) aus: Tippe `SELECT * FROM abteilungen;` und drücke Ausführen – du siehst alle 10 Abteilungen.

## Merksatz
- **S**ie **F**ahren **W**ohl **O**ft **L**angsam: SELECT – FROM – WHERE – ORDER BY – LIMIT.
- NULL vergleicht man mit **IS**, nie mit `=`.
- BETWEEN schließt **beide** Grenzen ein.
- `%` = beliebig viele Zeichen, `_` = genau eins.
- Ohne ORDER BY keine garantierte Reihenfolge.
- NOT vor AND vor OR – im Zweifel klammern.

## Prüfungsfalle
- `WHERE austritt = NULL` liefert **nie** eine Zeile – richtig ist `IS NULL`.
- `WHERE abt_id <> 2` verschweigt Zeilen mit abt_id NULL.
- `AND`/`OR` ohne Klammern: AND bindet stärker.
- `BETWEEN 1000 AND 2000` enthält 1000 und 2000; `BETWEEN 2000 AND 1000` liefert nichts.
- `LIMIT` ist kein T-SQL – in SQL Server heißt es `TOP` bzw. `OFFSET … FETCH`.
- Text in doppelten Anführungszeichen ist im Standard ein **Spaltenname**, kein Text.
- `DISTINCT` gilt für die ganze Zeile, nicht nur für die erste Spalte.

## Grafik
### Das Sieb der Abfrage
1. FROM: Tabelle mitarbeiter mit 100 Zeilen wird geladen
2. WHERE: Bedingung abt_id = 2 siebt die Zeilen aus
3. SELECT: nur Vorname, Nachname und Gehalt bleiben als Spalten
4. ORDER BY: Zeilen werden nach Gehalt absteigend sortiert
5. LIMIT: nur die ersten 5 Zeilen gehen an den Bildschirm

### Abfrage im SQL-Labor
1. Lernender -> SQL-Labor: tippt SELECT … FROM mitarbeiter WHERE …
2. SQL-Labor -> SQLite: übergibt den Text an die Datenbank im Browser
3. SQLite: prüft Syntax und Spaltennamen
4. SQLite -> SQL-Labor: liefert Spaltenköpfe und Zeilen
5. SQL-Labor -> Lernender: zeigt die Ergebnistabelle an

## Lab
### GUI
Maschine: SQL-Labor in Netzilon (Werkzeuge → SQL-Labor), Firmen-DB „Netzilon GmbH“ (SQLite im Browser).
1. SQL-Labor öffnen und mit `SELECT * FROM mitarbeiter LIMIT 5;` die Spalten erkunden.
2. Alle aktiven Mitarbeitenden (ohne Austritt) mit Name und Eintritt, neueste zuerst, abfragen.
3. Alle Kunden aus Hamburg oder München mit IN abfragen.
4. Alle Bestellungen aus dem ersten Quartal 2025 mit BETWEEN abfragen.
5. Alle Benutzernamen suchen, deren Nachname mit „b“ beginnt.
6. Die fünf teuersten Artikel mit Marge ausgeben.
7. Die verschiedenen Positionen (DISTINCT) alphabetisch ausgeben.

```sql
-- 2: aktive Mitarbeitende, neueste zuerst
SELECT vorname, nachname, eintritt
FROM mitarbeiter
WHERE austritt IS NULL
ORDER BY eintritt DESC;

-- 3: Kunden aus zwei Städten
SELECT firma, stadt, branche
FROM kunden
WHERE stadt IN ('Hamburg', 'München')
ORDER BY stadt, firma;

-- 4: Bestellungen Q1/2025
SELECT best_id, kunde_id, datum, status
FROM bestellungen
WHERE datum BETWEEN '2025-01-01' AND '2025-03-31'
ORDER BY datum;

-- 5: Benutzernamen mit Muster
SELECT benutzername, email
FROM mitarbeiter
WHERE benutzername LIKE '%.b%';

-- 6: Top 5 Artikel mit Marge
SELECT bezeichnung, verkaufspreis, verkaufspreis - einkaufspreis AS marge
FROM artikel
ORDER BY verkaufspreis DESC
LIMIT 5;

-- 7: verschiedene Positionen
SELECT DISTINCT position
FROM mitarbeiter
WHERE position IS NOT NULL
ORDER BY position;
```

### T-SQL
Maschine: SQL01.example.com, SQL Server Management Studio (SSMS), Datenbank `Netzilon` mit gleichem Schema.
1. In SSMS mit SQL01.example.com verbinden (Windows-Authentifizierung), Datenbank `Netzilon` wählen.
2. „Neue Abfrage“ öffnen und die gleichen Aufgaben in T-SQL-Syntax ausführen.
3. Mit F5 ausführen, Ergebnis im Raster prüfen.

```tsql
USE Netzilon;
SELECT TOP (5) bezeichnung, verkaufspreis, verkaufspreis - einkaufspreis AS marge
FROM dbo.artikel
ORDER BY verkaufspreis DESC;

SELECT vorname + ' ' + nachname AS [Name], eintritt
FROM dbo.mitarbeiter
WHERE austritt IS NULL
ORDER BY eintritt DESC
OFFSET 0 ROWS FETCH NEXT 10 ROWS ONLY;
```

## Legende
### SELECT
- Was: Anweisung zum Lesen von Daten (Projektion = Spaltenauswahl).
- Wie: `SELECT spalte1, spalte2 FROM tabelle;` – Ausdrücke und Aliase mit `AS`.
- Wann: Immer, wenn Daten angezeigt, ausgewertet oder weiterverarbeitet werden sollen.
- Wo: SQL-Labor in Netzilon (SQLite), SSMS auf SQL01.example.com (T-SQL).
- Warum: Nur die benötigten Spalten zu lesen spart Übertragung und macht Ergebnisse lesbar.
### WHERE
- Was: Filter auf Zeilenebene (Selektion).
- Wie: Bedingungen mit `=`, `<>`, `BETWEEN`, `IN`, `LIKE`, `IS NULL`, verknüpft mit AND/OR/NOT.
- Wann: Wenn nur bestimmte Datensätze gebraucht werden, z. B. eine Abteilung.
- Warum: Weniger Zeilen = schnellere Abfrage und korrekte Auswertung.
- Beispiel: `WHERE austritt IS NULL AND abt_id = 2`
### ORDER BY und LIMIT
- Was: Sortierung und Begrenzung der Ergebnismenge.
- Wie: `ORDER BY spalte DESC LIMIT 5` (SQLite) bzw. `TOP (5)` (T-SQL).
- Wann: Ranglisten, Seitenweises Blättern (Paging), „neueste zuerst“.
- Warum: Tabellen sind Mengen ohne Reihenfolge – nur ORDER BY garantiert sie.

## Karteikarten
- F: Welche Klausel wählt Spalten aus, welche Zeilen? | A: SELECT wählt Spalten (Projektion), WHERE wählt Zeilen (Selektion).
- F: Wie findest du Mitarbeitende ohne Austrittsdatum? | A: `WHERE austritt IS NULL` – nie `= NULL`.
- F: Was liefert `BETWEEN '2025-01-01' AND '2025-03-31'`? | A: Alle Werte von einschließlich 1.1. bis einschließlich 31.3.2025.
- F: Was bedeuten `%` und `_` bei LIKE? | A: `%` = beliebig viele (auch null) Zeichen, `_` = genau ein Zeichen.
- F: Welche Priorität haben NOT, AND, OR? | A: NOT vor AND vor OR – deshalb OR-Bedingungen klammern.
- F: Wie lautet LIMIT 5 in T-SQL? | A: `SELECT TOP (5) …` (mit ORDER BY) oder `OFFSET 0 ROWS FETCH NEXT 5 ROWS ONLY`.
- F: Wozu dient DISTINCT? | A: Entfernt doppelte Ergebniszeilen (bezogen auf alle Spalten der Liste).
- F: Wie verkettet man Vor- und Nachname in SQLite? | A: `vorname || ' ' || nachname`.
- F: Wie verkettet man Vor- und Nachname in T-SQL? | A: `vorname + ' ' + nachname` oder `CONCAT(vorname, ' ', nachname)`.
- F: Warum funktioniert `eintritt >= '2024-01-01'` mit Text-Datumswerten? | A: ISO-Format YYYY-MM-DD sortiert als Text genauso wie chronologisch.
- F: Was ist ein Spaltenalias? | A: Ein Name für eine Ergebnisspalte mit `AS`, z. B. `verkaufspreis - einkaufspreis AS marge`.
- F: Warum liefert `WHERE abt_id <> 2` nicht alle anderen Mitarbeitenden? | A: Zeilen mit abt_id NULL ergeben UNKNOWN und fallen heraus.

## Quiz
? Welche Abfrage liefert alle Mitarbeitenden, die noch im Unternehmen sind?
* `SELECT * FROM mitarbeiter WHERE austritt IS NULL;`
- `SELECT * FROM mitarbeiter WHERE austritt = NULL;`
- `SELECT * FROM mitarbeiter WHERE austritt = '';`
- `SELECT * FROM mitarbeiter WHERE NOT austritt;`
! Fehlende Werte prüft man ausschließlich mit IS NULL; `= NULL` ergibt UNKNOWN und liefert nie eine Zeile.

? Was liefert `WHERE abt_id = 2 OR abt_id = 3 AND gehalt > 4000`?
- Nur Mitarbeitende aus 2 oder 3 mit mehr als 4000 Euro
* Alle aus Abteilung 2 sowie die aus Abteilung 3 mit mehr als 4000 Euro
- Nur Mitarbeitende aus Abteilung 3
- Einen Syntaxfehler
! AND bindet stärker als OR. Für die gemeinte Bedingung muss `(abt_id = 2 OR abt_id = 3)` geklammert werden.

? Welche Bestellungen liefert `datum BETWEEN '2025-02-01' AND '2025-02-28'`?
- Nur Bestellungen vom 2. bis 27. Februar
- Bestellungen ab 1. Februar ohne den 28.
* Alle Februar-Bestellungen 2025 inklusive 1. und 28.
- Alle Bestellungen außer Februar
! BETWEEN schließt beide Grenzen ein.

? Welches Muster findet alle E-Mail-Adressen der Firmendomäne?
- `email LIKE '@netzilon.example'`
- `email = '%@netzilon.example'`
- `email LIKE '_@netzilon.example'`
* `email LIKE '%@netzilon.example'`
! `%` steht für beliebig viele Zeichen; mit `=` werden Platzhalter nicht ausgewertet, `_` steht nur für genau ein Zeichen.

? Welche Abfrage liefert die drei Artikel mit dem höchsten Verkaufspreis in SQLite?
* `SELECT bezeichnung FROM artikel ORDER BY verkaufspreis DESC LIMIT 3;`
- `SELECT TOP 3 bezeichnung FROM artikel ORDER BY verkaufspreis;`
- `SELECT bezeichnung FROM artikel LIMIT 3 ORDER BY verkaufspreis DESC;`
- `SELECT bezeichnung FROM artikel ORDER BY verkaufspreis ASC LIMIT 3;`
! LIMIT steht in SQLite ganz am Ende; TOP ist T-SQL; ASC würde die billigsten liefern.

? Was bewirkt `SELECT DISTINCT abt_id, position FROM mitarbeiter`?
- Jede Abteilung erscheint genau einmal
* Jede Kombination aus Abteilung und Position erscheint einmal
- Jede Position erscheint genau einmal
- Es entsteht ein Fehler, DISTINCT erlaubt nur eine Spalte
! DISTINCT bezieht sich auf die gesamte Zeile der Spaltenliste.

? Wie lautet das T-SQL-Gegenstück zu `LIMIT 10 OFFSET 20`?
- `TOP 10 SKIP 20`
- `LIMIT 20, 10`
* `OFFSET 20 ROWS FETCH NEXT 10 ROWS ONLY`
- `ROWNUM BETWEEN 20 AND 30`
! SQL Server nutzt OFFSET … FETCH (ab 2012), das immer ein ORDER BY verlangt. `LIMIT 20, 10` ist MySQL/SQLite-Kurzform.

? Welche Bedingung findet Kunden, deren Firmenname an zweiter Stelle ein „a“ hat?
- `firma LIKE '%a%'`
- `firma LIKE 'a%'`
- `firma LIKE '__a%'`
* `firma LIKE '_a%'`
! `_` steht für genau ein beliebiges Zeichen, danach muss „a“ folgen.

? Was ist der Unterschied zwischen `'Hamburg'` und `"Hamburg"` im SQL-Standard?
* Einfache Anführungszeichen sind Text, doppelte kennzeichnen einen Bezeichner
- Es gibt keinen Unterschied
- Doppelte Anführungszeichen sind Text, einfache Bezeichner
- Doppelte Anführungszeichen sind nur in T-SQL erlaubt
! SQLite wertet unbekannte Bezeichner in "…" notfalls als Text aus – ein Kompatibilitätsrest, auf den man sich nicht verlassen sollte.

? Welche Abfrage zeigt Vor- und Nachname als eine Spalte „name“ in SQLite?
- `SELECT vorname + ' ' + nachname AS name FROM mitarbeiter;`
* `SELECT vorname || ' ' || nachname AS name FROM mitarbeiter;`
- `SELECT vorname & ' ' & nachname AS name FROM mitarbeiter;`
- `SELECT JOIN(vorname, nachname) AS name FROM mitarbeiter;`
! In SQLite ist `||` der Verkettungsoperator; `+` würde in SQLite numerisch rechnen (Ergebnis 0).

? Wo stehen NULL-Werte bei `ORDER BY austritt ASC` in SQLite?
- Am Ende
- Sie werden ausgelassen
* Am Anfang
- Zufällig verteilt
! SQLite behandelt NULL beim Sortieren als kleinsten Wert; mit `NULLS LAST` lässt sich das ändern.

? Welche Abfrage liefert Artikel mit einem Lagerbestand von 0 oder ohne Kategorie?
- `SELECT * FROM artikel WHERE lagerbestand = 0 AND kategorie IS NULL;`
- `SELECT * FROM artikel WHERE lagerbestand = 0 OR kategorie = NULL;`
* `SELECT * FROM artikel WHERE lagerbestand = 0 OR kategorie IS NULL;`
- `SELECT * FROM artikel WHERE lagerbestand IN (0, NULL);`
! „oder“ = OR, fehlender Wert = IS NULL. `IN (0, NULL)` findet NULL nicht, weil intern `= NULL` verglichen wird.

? Was liefert `SELECT * FROM projekte WHERE status NOT IN ('aktiv', 'geplant');`?
- Nur aktive und geplante Projekte
* Abgeschlossene und gestoppte Projekte (Status nicht NULL)
- Alle Projekte
- Einen Fehler, weil NOT IN nicht existiert
! NOT IN kehrt die Liste um. Zeilen mit status NULL würden trotzdem nicht erscheinen.

## Lücken
- Fehlende Werte prüft man mit {IS NULL}, vorhandene mit {IS NOT NULL}.
- Bei LIKE steht {%} für beliebig viele Zeichen und {_} für genau ein Zeichen.
- In SQLite begrenzt {LIMIT} die Zeilenzahl, in T-SQL nutzt man {TOP} oder OFFSET … FETCH.
- Die Klausel {ORDER BY} sortiert, mit {DESC} absteigend.

## Zuordnen
### Operator und Bedeutung
- BETWEEN => Bereich inklusive beider Grenzen
- IN => Wert ist in einer Liste enthalten
- LIKE => Mustervergleich mit Platzhaltern
- IS NULL => Wert fehlt
- DISTINCT => doppelte Zeilen entfernen
- AS => Alias vergeben

## Reihenfolge
### Schreibreihenfolge einer Abfrage
1. SELECT
2. FROM
3. WHERE
4. ORDER BY
5. LIMIT

## Freitext
- F: Erklären Sie, warum `SELECT * FROM mitarbeiter WHERE abt_id <> 2` nicht alle Mitarbeitenden außerhalb von Abteilung 2 liefert, und geben Sie eine korrigierte Abfrage an. | M: Vergleiche mit NULL ergeben UNKNOWN (dreiwertige Logik), daher fallen die Mitarbeitenden ohne Abteilung heraus. Korrektur: `WHERE abt_id <> 2 OR abt_id IS NULL`. | P: 4
- F: Formulieren Sie eine SQLite-Abfrage, die Seite 3 einer Mitarbeiterliste (10 Einträge pro Seite, sortiert nach Nachname) liefert, und nennen Sie die T-SQL-Variante. | M: SQLite: `SELECT vorname, nachname FROM mitarbeiter ORDER BY nachname LIMIT 10 OFFSET 20;` T-SQL: `... ORDER BY nachname OFFSET 20 ROWS FETCH NEXT 10 ROWS ONLY;` | P: 4

## Szenario
### Telefonliste für die Personalabteilung
Die Personalabteilung der Netzilon GmbH möchte eine aktuelle Telefonliste. Es sollen nur aktive Mitarbeitende (ohne Austritt) erscheinen, sortiert nach Nachname und Vorname. Auszubildende sollen gesondert ausgewertet werden.
- F: Schreiben Sie die Abfrage für die Telefonliste (Name, Telefon, E-Mail). | A: `SELECT nachname, vorname, telefon, email FROM mitarbeiter WHERE austritt IS NULL ORDER BY nachname, vorname;` | P: 3
- F: Wie listen Sie nur die aktiven Auszubildenden auf? | A: `... WHERE austritt IS NULL AND azubi = 1 ...` | P: 2
- F: Die Liste soll nur die 20 dienstältesten aktiven Mitarbeitenden zeigen. Wie in SQLite, wie in T-SQL? | A: SQLite: `ORDER BY eintritt ASC LIMIT 20`; T-SQL: `SELECT TOP (20) ... ORDER BY eintritt ASC` (bei Gleichständen ggf. `WITH TIES`). | P: 3
- F: Wer hat keine Telefonnummer hinterlegt? | A: `SELECT vorname, nachname FROM mitarbeiter WHERE telefon IS NULL AND austritt IS NULL;` | P: 2
