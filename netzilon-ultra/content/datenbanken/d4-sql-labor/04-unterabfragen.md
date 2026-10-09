---
id: db-labor-unterabfragen
bereich: Datenbanken
block: D4
kapitel: SQL-Labor (Firmen-DB)
titel: Unterabfragen, EXISTS und CTE (WITH, rekursiv)
stufe: Profi
fach: SQL / Datenbanken
pruefungen: [AP1, AP2, Schule]
quellen: [SQLite-Dokumentation, Microsoft Learn – T-SQL]
verweise: [db-select-unterabfragen, db-labor-joins, db-labor-aggregate, db-labor-fenster]
---

## Profi

### Was ist eine Unterabfrage?
Eine **Unterabfrage (subquery)** ist ein SELECT in Klammern innerhalb einer anderen Anweisung. Je nach Ergebnisform unterscheidet man:

| Art | Ergebnis | Typischer Einsatz |
|---|---|---|
| **skalar** | genau 1 Zeile, 1 Spalte | Vergleich mit `=`, `>`, in SELECT-Liste |
| **Listen-Unterabfrage** | 1 Spalte, n Zeilen | `IN`, `NOT IN` |
| **EXISTS** | wahr/falsch | „gibt es mindestens eine …?“ |
| **abgeleitete Tabelle** (derived table) | Tabelle | in FROM, braucht Alias |
| **korreliert** | wird je äußerer Zeile neu ausgewertet | Bezug auf äußere Spalte |

Alle Beispiele nutzen die Firmen-DB der **Netzilon GmbH**. Probier es im SQL-Labor (Werkzeuge) aus.

### Skalare Unterabfrage
Wer verdient mehr als der Durchschnitt?
```sql
SELECT vorname, nachname, gehalt
FROM mitarbeiter
WHERE gehalt > (SELECT AVG(gehalt) FROM mitarbeiter)
ORDER BY gehalt DESC;
```
Liefert die Unterabfrage mehr als eine Zeile, meldet SQL Server einen Fehler (Msg 512); **SQLite nimmt stillschweigend die erste Zeile** – ein gefährlicher Unterschied.

### IN / NOT IN
Mitarbeitende, die in mindestens einem Projekt eingeplant sind:
```sql
SELECT vorname, nachname
FROM mitarbeiter
WHERE ma_id IN (SELECT ma_id FROM projekt_mitarbeiter);
```
**NOT-IN-Falle**: Enthält die Unterabfrage auch nur **einen NULL-Wert**, liefert `NOT IN` **keine einzige Zeile** (jeder Vergleich mit NULL ist UNKNOWN). Beispiel: `WHERE ma_id NOT IN (SELECT ma_id FROM bestellungen)` – `bestellungen.ma_id` darf NULL sein → leeres Ergebnis. Abhilfe: `... WHERE ma_id IS NOT NULL` in der Unterabfrage oder `NOT EXISTS`.

### EXISTS / NOT EXISTS
`EXISTS` prüft nur, ob die Unterabfrage **mindestens eine Zeile** liefert; die Spaltenliste ist egal (`SELECT 1`). Typisch **korreliert**:
```sql
-- Kunden, die mindestens eine offene Bestellung haben
SELECT k.firma
FROM kunden k
WHERE EXISTS (SELECT 1 FROM bestellungen b
              WHERE b.kunde_id = k.kunde_id AND b.status = 'offen');

-- Projekte ohne jede Zeiterfassung (NULL-sicher)
SELECT p.name
FROM projekte p
WHERE NOT EXISTS (SELECT 1 FROM zeiterfassung z WHERE z.projekt_id = p.projekt_id);
```
`NOT EXISTS` ist NULL-sicher und meist die beste Wahl für „hat keine …“.

### Korrelierte Unterabfrage
Bezieht sich auf eine Spalte der äußeren Abfrage und wird logisch **für jede äußere Zeile** ausgewertet. Wer verdient mehr als der Durchschnitt **seiner eigenen** Abteilung?
```sql
SELECT m.nachname, m.abt_id, m.gehalt
FROM mitarbeiter m
WHERE m.gehalt > (SELECT AVG(x.gehalt)
                  FROM mitarbeiter x
                  WHERE x.abt_id = m.abt_id);
```
Auch in der SELECT-Liste möglich: Anzahl Bestellungen je Kunde ohne GROUP BY:
```sql
SELECT k.firma,
       (SELECT COUNT(*) FROM bestellungen b WHERE b.kunde_id = k.kunde_id) AS anzahl
FROM kunden k
ORDER BY anzahl DESC;
```

### Abgeleitete Tabelle (Unterabfrage in FROM)
```sql
SELECT u.kunde_id, u.umsatz
FROM (SELECT b.kunde_id, SUM(p.menge * p.einzelpreis) AS umsatz
      FROM bestellungen b
      JOIN bestellpositionen p ON p.best_id = b.best_id
      GROUP BY b.kunde_id) AS u
WHERE u.umsatz > (SELECT AVG(umsatz) FROM (SELECT SUM(menge * einzelpreis) AS umsatz
                                           FROM bestellpositionen GROUP BY best_id));
```
Die abgeleitete Tabelle braucht einen **Alias** (in T-SQL zwingend, in SQLite empfohlen).

### CTE – Common Table Expression (WITH)
Eine **CTE** ist eine benannte Unterabfrage am Anfang der Anweisung – lesbarer als verschachtelte Klammern und mehrfach referenzierbar:
```sql
WITH umsatz_je_kunde AS (
  SELECT b.kunde_id, SUM(p.menge * p.einzelpreis) AS umsatz
  FROM bestellungen b
  JOIN bestellpositionen p ON p.best_id = b.best_id
  WHERE b.status <> 'storniert'
  GROUP BY b.kunde_id
)
SELECT k.firma, ROUND(u.umsatz, 2) AS umsatz
FROM umsatz_je_kunde u
JOIN kunden k ON k.kunde_id = u.kunde_id
WHERE u.umsatz > (SELECT AVG(umsatz) FROM umsatz_je_kunde)
ORDER BY u.umsatz DESC;
```
Mehrere CTEs werden mit Komma getrennt: `WITH a AS (...), b AS (...) SELECT ...`.

### Rekursive CTE – Hierarchie
Die Vorgesetzten-Beziehung bildet einen Baum. Eine **rekursive CTE** besteht aus **Ankerteil** (Startzeilen) `UNION ALL` **rekursivem Teil** (verweist auf die CTE selbst). Gesamte Hierarchie ab der Geschäftsführung:
```sql
WITH RECURSIVE hierarchie (ma_id, name, ebene, pfad) AS (
  SELECT ma_id, vorname || ' ' || nachname, 0, nachname
  FROM mitarbeiter
  WHERE vorgesetzter_id IS NULL                    -- Anker: Geschäftsführung
  UNION ALL
  SELECT m.ma_id, m.vorname || ' ' || m.nachname, h.ebene + 1, h.pfad || ' > ' || m.nachname
  FROM mitarbeiter m
  JOIN hierarchie h ON m.vorgesetzter_id = h.ma_id -- Rekursion
)
SELECT ebene, name, pfad
FROM hierarchie
ORDER BY pfad;
```
Die Rekursion endet, wenn der rekursive Teil keine neuen Zeilen mehr liefert. Bei Zyklen (A ist Chef von B und B von A) läuft sie endlos → Abbruch mit `LIMIT`/Ebenenzähler (`WHERE h.ebene < 10`) bzw. in SQL Server über `OPTION (MAXRECURSION n)` (Standard 100).

Auch nützlich: **Zahlen-/Datumsreihen** erzeugen, z. B. alle Monate 2025 für eine lückenlose Monatsauswertung:
```sql
WITH RECURSIVE monate(m) AS (
  SELECT '2025-01-01'
  UNION ALL
  SELECT date(m, '+1 month') FROM monate WHERE m < '2025-12-01'
)
SELECT m FROM monate;
```

### Unterabfrage oder Join?
Viele Unterabfragen lassen sich als Join schreiben (IN ↔ JOIN + DISTINCT, NOT EXISTS ↔ LEFT JOIN … IS NULL). Moderne Optimierer erzeugen oft denselben Plan. Faustregel: Lesbarkeit zuerst; `NOT EXISTS` statt `NOT IN` bei NULL-fähigen Spalten.

### T-SQL-Unterschied
| Thema | SQLite (SQL-Labor) | T-SQL (SQL Server) |
|---|---|---|
| Rekursive CTE | `WITH RECURSIVE name AS (...)` | `WITH name AS (...)` – **ohne** RECURSIVE; vorige Anweisung mit `;` abschließen |
| Rekursionsgrenze | keine Standardgrenze, eigene Abbruchbedingung | Standard 100 Ebenen, `OPTION (MAXRECURSION 0)` = unbegrenzt |
| Skalare Unterabfrage mit mehreren Zeilen | nimmt erste Zeile | Fehler Msg 512 |
| Alias für abgeleitete Tabelle | optional | Pflicht |
| Datumsreihe | `date(m, '+1 month')` | `DATEADD(month, 1, m)` |
| Verkettung in der CTE | `\|\|` | `+` bzw. `CONCAT`; in rekursiven CTEs müssen Typen von Anker und Rekursion **exakt** gleich sein → `CAST(nachname AS NVARCHAR(400))` |
| Zeilenweise Unterabfrage mit mehreren Spalten | korrelierte Unterabfrage je Spalte | `CROSS APPLY` / `OUTER APPLY` |
| Hierarchietyp | – | eigener Datentyp `hierarchyid` |

## Einfach

Eine **Unterabfrage** ist eine **Frage in der Frage**. Stell dir vor, die Chefin der Netzilon GmbH fragt: „Wer verdient **mehr als der Durchschnitt**?“ Du musst zuerst eine **kleine Frage** lösen („Wie hoch ist der Durchschnitt?“) und mit der Antwort die **große Frage** beantworten. Genau das macht eine Unterabfrage in Klammern.

- **IN** ist wie eine Gästeliste: „Zeig alle Mitarbeitenden, deren Nummer auf der Projektliste steht.“
- **EXISTS** fragt nur: „Gibt es **überhaupt** einen passenden Eintrag?“ – Ja oder Nein. Wie beim Schauen in den Briefkasten: Es ist egal, wie viele Briefe drin sind, Hauptsache mindestens einer.
- **Korrelierte Unterabfrage**: Die kleine Frage ändert sich bei **jeder Zeile**. „Verdient Mira mehr als der Durchschnitt **ihrer** Abteilung?“ – für Jonas wird dann der Durchschnitt **seiner** Abteilung neu berechnet.
- **CTE (WITH)** ist wie ein **Notizzettel**: Du rechnest etwas vor, gibst dem Zettel einen Namen und benutzt ihn danach wie eine Tabelle.
- **Rekursive CTE** ist wie eine **Familienstammbaum-Suche**: Starte bei der Chefin, finde ihre direkten Mitarbeitenden, dann deren Mitarbeitende, und so weiter – bis niemand mehr kommt.

Vorsicht bei **NOT IN**: Steht auf der Liste auch nur **ein leeres Feld (NULL)**, kommt plötzlich **gar nichts** heraus. NOT EXISTS hat dieses Problem nicht.

Probier es im SQL-Labor (Werkzeuge) aus!

## Merksatz
- **Skalar = ein Wert, IN = eine Liste, EXISTS = ja/nein.**
- NOT IN + NULL = leeres Ergebnis → lieber NOT EXISTS.
- Korreliert = bezieht sich auf die äußere Zeile.
- CTE = benannte Unterabfrage vorneweg (WITH).
- Rekursiv = Anker UNION ALL Rekursionsteil.
- SQLite: `WITH RECURSIVE`, T-SQL: nur `WITH`.

## Prüfungsfalle
- `WHERE gehalt > (SELECT gehalt FROM mitarbeiter WHERE abt_id = 2)` – mehrere Zeilen → T-SQL-Fehler; richtig: `> ALL (...)` oder `MAX()`.
- `NOT IN` gegen eine Spalte mit NULL liefert nichts.
- `EXISTS` ohne Korrelation (ohne Bezug zur äußeren Zeile) ist für alle Zeilen gleich wahr oder falsch.
- Abgeleitete Tabelle ohne Alias → Fehler in SQL Server.
- In T-SQL muss die Anweisung vor `WITH` mit `;` enden.
- Rekursive CTE ohne Abbruch bei Zyklen läuft endlos (SQL Server: Abbruch nach 100 Ebenen mit Fehler).

## Grafik
### Skalare Unterabfrage
1. Innere Abfrage: berechnet AVG(gehalt) einmal
2. Innere Abfrage -> Äußere Abfrage: liefert einen einzigen Wert
3. Äußere Abfrage: vergleicht jede Zeile mit diesem Wert
4. Ergebnis: alle Mitarbeitenden über dem Durchschnitt

### Rekursive CTE Hierarchie
1. Anker: Geschäftsführung ohne Vorgesetzten = Ebene 0
2. Rekursion: alle mit vorgesetzter_id der Ebene 0 = Ebene 1
3. Rekursion: deren direkte Mitarbeitende = Ebene 2
4. Rekursion: keine neuen Zeilen mehr gefunden
5. Ergebnis: UNION ALL aller Ebenen als Baum

### Korrelierte Unterabfrage
1. Äußere Zeile -> Innere Abfrage: übergibt abt_id
2. Innere Abfrage: berechnet Durchschnitt dieser Abteilung
3. Innere Abfrage -> Äußere Zeile: Wert zurück, Vergleich
4. Nächste Zeile: Vorgang wiederholt sich

## Lab
### GUI
Maschine: SQL-Labor in Netzilon (Werkzeuge → SQL-Labor), Firmen-DB „Netzilon GmbH“.
1. Mitarbeitende über dem Durchschnittsgehalt ausgeben.
2. Das Projekt ohne Zeiterfassung mit NOT EXISTS finden.
3. NOT-IN-Falle nachstellen: Mitarbeitende, die nie eine Bestellung bearbeitet haben – einmal mit NOT IN, einmal mit NOT EXISTS.
4. Mit einer CTE die Top-Kunden über dem Durchschnittsumsatz ermitteln.
5. Mit einer rekursiven CTE das Organigramm (Ebene, Pfad) erstellen.

```sql
-- 1
SELECT nachname, gehalt FROM mitarbeiter
WHERE gehalt > (SELECT AVG(gehalt) FROM mitarbeiter);

-- 2
SELECT p.projekt_id, p.name FROM projekte p
WHERE NOT EXISTS (SELECT 1 FROM zeiterfassung z WHERE z.projekt_id = p.projekt_id);

-- 3a: liefert 0 Zeilen, falls bestellungen.ma_id NULL enthält
SELECT COUNT(*) FROM mitarbeiter
WHERE ma_id NOT IN (SELECT ma_id FROM bestellungen);
-- 3b: NULL-sicher
SELECT COUNT(*) FROM mitarbeiter m
WHERE NOT EXISTS (SELECT 1 FROM bestellungen b WHERE b.ma_id = m.ma_id);

-- 5
WITH RECURSIVE org (ma_id, ebene, pfad) AS (
  SELECT ma_id, 0, nachname FROM mitarbeiter WHERE vorgesetzter_id IS NULL
  UNION ALL
  SELECT m.ma_id, o.ebene + 1, o.pfad || ' > ' || m.nachname
  FROM mitarbeiter m JOIN org o ON m.vorgesetzter_id = o.ma_id
)
SELECT ebene, COUNT(*) AS personen FROM org GROUP BY ebene ORDER BY ebene;
```

### T-SQL
Maschine: SQL01.example.com, SSMS, Datenbank `Netzilon`.
1. Rekursive CTE ohne `RECURSIVE` schreiben, Typen im Pfad mit CAST angleichen.
2. Mit `OPTION (MAXRECURSION 20)` eine Obergrenze setzen.
3. Skalare Unterabfrage mit mehreren Zeilen testen und Fehler 512 beobachten.

```tsql
USE Netzilon;
WITH org AS (
  SELECT ma_id, 0 AS ebene, CAST(nachname AS NVARCHAR(400)) AS pfad
  FROM dbo.mitarbeiter WHERE vorgesetzter_id IS NULL
  UNION ALL
  SELECT m.ma_id, o.ebene + 1, CAST(o.pfad + N' > ' + m.nachname AS NVARCHAR(400))
  FROM dbo.mitarbeiter AS m JOIN org AS o ON m.vorgesetzter_id = o.ma_id
)
SELECT ebene, pfad FROM org ORDER BY pfad
OPTION (MAXRECURSION 20);
```

## Legende
### Unterabfrage
- Was: SELECT in Klammern innerhalb einer anderen Anweisung.
- Wie: skalar (`> (SELECT AVG(...))`), Liste (`IN (SELECT ...)`), `EXISTS (SELECT 1 ...)`, in FROM mit Alias.
- Wann: Wenn ein Zwischenergebnis als Vergleichswert oder Menge gebraucht wird.
- Warum: Komplexe Fragen in kleine, verständliche Schritte zerlegen.
### CTE (WITH)
- Was: Benannte, temporäre Ergebnismenge für genau eine Anweisung.
- Wie: `WITH name AS (SELECT ...) SELECT ... FROM name;` – rekursiv mit Anker UNION ALL Rekursion.
- Wann: Lesbarkeit, mehrfache Verwendung, Hierarchien (Organigramm), Zahlenreihen.
- Wo: SQLite (`WITH RECURSIVE`), SQL Server (`WITH`, MAXRECURSION).
- Beispiel: Organigramm der Netzilon GmbH ab der Geschäftsführung.

## Karteikarten
- F: Was ist eine skalare Unterabfrage? | A: Eine Unterabfrage, die genau einen Wert (1 Zeile, 1 Spalte) liefert, z. B. `(SELECT AVG(gehalt) FROM mitarbeiter)`.
- F: Was prüft EXISTS? | A: Ob die Unterabfrage mindestens eine Zeile liefert – Ergebnis wahr oder falsch.
- F: Was ist eine korrelierte Unterabfrage? | A: Eine Unterabfrage, die auf eine Spalte der äußeren Abfrage verweist und je äußerer Zeile ausgewertet wird.
- F: Warum ist NOT IN mit NULL gefährlich? | A: Ein NULL in der Liste macht jeden Vergleich UNKNOWN → keine Zeile im Ergebnis.
- F: NULL-sichere Alternative zu NOT IN? | A: NOT EXISTS (korreliert) oder LEFT JOIN … WHERE rechts IS NULL.
- F: Was ist eine abgeleitete Tabelle? | A: Eine Unterabfrage in der FROM-Klausel, die wie eine Tabelle genutzt wird (mit Alias).
- F: Was ist eine CTE? | A: Common Table Expression – benannte Unterabfrage mit WITH vor der Hauptabfrage.
- F: Aus welchen Teilen besteht eine rekursive CTE? | A: Ankerteil (Startzeilen) UNION ALL rekursiver Teil, der auf die CTE selbst verweist.
- F: Wie heißt die rekursive CTE in SQLite und T-SQL? | A: SQLite: `WITH RECURSIVE`; T-SQL: nur `WITH` (Rekursion wird erkannt).
- F: Was bewirkt `OPTION (MAXRECURSION 0)`? | A: Hebt in SQL Server die Standardgrenze von 100 Rekursionsebenen auf.
- F: Was macht SQLite, wenn eine skalare Unterabfrage mehrere Zeilen liefert? | A: Nimmt stillschweigend die erste Zeile (SQL Server: Fehler 512).
- F: Wie findest du mit EXISTS Kunden mit offener Bestellung? | A: `WHERE EXISTS (SELECT 1 FROM bestellungen b WHERE b.kunde_id = k.kunde_id AND b.status = 'offen')`.

## Quiz
? Welche Abfrage liefert Mitarbeitende, deren Gehalt über dem Durchschnitt aller liegt?
* `SELECT nachname FROM mitarbeiter WHERE gehalt > (SELECT AVG(gehalt) FROM mitarbeiter);`
- `SELECT nachname FROM mitarbeiter WHERE gehalt > AVG(gehalt);`
- `SELECT nachname FROM mitarbeiter HAVING gehalt > AVG(gehalt);`
- `SELECT nachname, AVG(gehalt) FROM mitarbeiter WHERE gehalt > 0;`
! Aggregate sind in WHERE nicht erlaubt; der Durchschnitt muss per Unterabfrage berechnet werden.

? Die Unterabfrage `SELECT ma_id FROM bestellungen` enthält einen NULL-Wert. Was liefert `WHERE ma_id NOT IN (...)`?
- Alle Mitarbeitenden
- Nur Mitarbeitende mit Bestellungen
* Keine Zeile
- Einen Syntaxfehler
! `x NOT IN (1, 2, NULL)` ist nie wahr, weil `x <> NULL` UNKNOWN ergibt.

? Welche Abfrage findet Projekte ohne Zeiterfassung?
- `SELECT name FROM projekte WHERE projekt_id NOT EXISTS (SELECT projekt_id FROM zeiterfassung);`
* `SELECT name FROM projekte p WHERE NOT EXISTS (SELECT 1 FROM zeiterfassung z WHERE z.projekt_id = p.projekt_id);`
- `SELECT name FROM projekte p WHERE EXISTS (SELECT 1 FROM zeiterfassung z WHERE z.projekt_id <> p.projekt_id);`
- `SELECT name FROM projekte WHERE projekt_id IN (SELECT projekt_id FROM zeiterfassung);`
! NOT EXISTS mit Korrelation ist die NULL-sichere Lösung; `zeiterfassung.projekt_id` kann NULL sein.

? Was kennzeichnet eine korrelierte Unterabfrage?
- Sie steht immer in der FROM-Klausel
- Sie liefert immer genau einen Wert
* Sie verweist auf eine Spalte der äußeren Abfrage
- Sie wird nur einmal ausgeführt
! Sie wird logisch für jede äußere Zeile neu ausgewertet.

? Welche Zeile ist der Anker der rekursiven CTE für das Organigramm?
* `SELECT ma_id, 0 FROM mitarbeiter WHERE vorgesetzter_id IS NULL`
- `SELECT ma_id, 0 FROM mitarbeiter WHERE abt_id IS NULL`
- `SELECT ma_id, ebene + 1 FROM org`
- `SELECT ma_id FROM mitarbeiter ORDER BY vorgesetzter_id`
! Die Spitze der Hierarchie hat keinen Vorgesetzten.

? Wie verbindet man Anker und rekursiven Teil einer CTE?
- JOIN
- INTERSECT
* UNION ALL
- EXCEPT
! UNION ALL hängt die Zeilen jeder Ebene an; UNION (mit Duplikatentfernung) ist in SQLite auch erlaubt, aber unüblich.

? Was ist in T-SQL bei rekursiven CTEs anders als in SQLite?
- Rekursive CTEs gibt es in T-SQL nicht
* Das Schlüsselwort RECURSIVE entfällt, Standardgrenze 100 Ebenen
- Man muss `WITH RECURSIVE` schreiben und MAXRECURSION ist verboten
- Der Anker muss mit UNION statt UNION ALL verbunden werden
! SQL Server erkennt die Rekursion selbst; Grenze per OPTION (MAXRECURSION n).

? Welche Abfrage nutzt eine abgeleitete Tabelle korrekt?
- `SELECT * FROM SELECT kunde_id FROM bestellungen;`
- `SELECT * FROM (bestellungen) WHERE COUNT(*) > 1;`
* `SELECT t.kunde_id FROM (SELECT kunde_id, COUNT(*) AS n FROM bestellungen GROUP BY kunde_id) AS t WHERE t.n > 5;`
- `SELECT kunde_id FROM bestellungen AS (SELECT COUNT(*));`
! Unterabfrage in Klammern mit Alias; danach kann auf deren Spalten gefiltert werden.

? Was liefert `SELECT firma FROM kunden WHERE EXISTS (SELECT 1 FROM artikel);`?
- Nur Kunden mit Bestellungen
- Keine Zeile
- Einen Fehler, weil die Spalte 1 nicht existiert
* Alle Kunden, sofern die Tabelle artikel nicht leer ist
! Ohne Korrelation ist EXISTS für alle Zeilen gleich.

? Welche Schreibweise ist eine gültige CTE in SQLite?
* `WITH aktive AS (SELECT * FROM mitarbeiter WHERE austritt IS NULL) SELECT COUNT(*) FROM aktive;`
- `CTE aktive = SELECT * FROM mitarbeiter; SELECT COUNT(*) FROM aktive;`
- `SELECT COUNT(*) FROM aktive WITH (SELECT * FROM mitarbeiter);`
- `WITH aktive (SELECT * FROM mitarbeiter) AS SELECT COUNT(*);`
! Aufbau: WITH name AS (Abfrage) Hauptabfrage.

? Wie oft wird eine nicht korrelierte skalare Unterabfrage logisch ausgewertet?
- Für jede Zeile der äußeren Abfrage
* Einmal
- Für jede Spalte
- Gar nicht, sie wird ignoriert
! Sie hängt nicht von der äußeren Zeile ab.

? Welche Abfrage liefert Mitarbeitende, die in keinem Projekt eingeplant sind?
- `SELECT nachname FROM mitarbeiter WHERE ma_id IN (SELECT ma_id FROM projekt_mitarbeiter);`
- `SELECT nachname FROM mitarbeiter m JOIN projekt_mitarbeiter pm ON pm.ma_id = m.ma_id;`
- `SELECT nachname FROM mitarbeiter WHERE EXISTS (SELECT 1 FROM projekt_mitarbeiter);`
* `SELECT nachname FROM mitarbeiter m WHERE NOT EXISTS (SELECT 1 FROM projekt_mitarbeiter pm WHERE pm.ma_id = m.ma_id);`
! Hier wäre auch NOT IN sicher, weil ma_id in projekt_mitarbeiter Teil des Primärschlüssels ist – NOT EXISTS ist trotzdem die robustere Gewohnheit.

## Lücken
- Eine Unterabfrage, die genau einen Wert liefert, heißt {skalar}.
- Für „gibt es mindestens eine Zeile“ verwendet man {EXISTS}.
- Eine rekursive CTE verbindet Anker und Rekursion mit {UNION ALL}; in SQLite beginnt sie mit {WITH RECURSIVE}.
- Enthält die Liste einen NULL-Wert, liefert {NOT IN} keine Zeile.

## Zuordnen
### Unterabfrage-Art und Beispiel
- skalar => `gehalt > (SELECT AVG(gehalt) FROM mitarbeiter)`
- Liste => `ma_id IN (SELECT ma_id FROM projekt_mitarbeiter)`
- EXISTS => `EXISTS (SELECT 1 FROM bestellungen b WHERE b.kunde_id = k.kunde_id)`
- abgeleitete Tabelle => `FROM (SELECT ...) AS t`
- CTE => `WITH umsatz AS (SELECT ...)`

## Reihenfolge
### Aufbau einer rekursiven CTE
1. WITH RECURSIVE name (spalten) AS (
2. Ankerabfrage: Startzeilen, z. B. vorgesetzter_id IS NULL
3. UNION ALL
4. Rekursiver Teil: JOIN der Tabelle mit der CTE selbst
5. ) schließen und Hauptabfrage SELECT … FROM name

## Freitext
- F: Erklären Sie den Unterschied zwischen einer korrelierten und einer nicht korrelierten Unterabfrage am Beispiel der Gehälter in der Firmen-DB. | M: Nicht korreliert: `gehalt > (SELECT AVG(gehalt) FROM mitarbeiter)` – einmal berechnet, gleicher Wert für alle. Korreliert: `gehalt > (SELECT AVG(x.gehalt) FROM mitarbeiter x WHERE x.abt_id = m.abt_id)` – bezieht sich auf die äußere Zeile (Abteilung) und wird je Zeile ausgewertet. | P: 4
- F: Warum liefert `SELECT nachname FROM mitarbeiter WHERE ma_id NOT IN (SELECT ma_id FROM bestellungen)` evtl. keine Zeile, und wie formulieren Sie es sicher? | M: bestellungen.ma_id kann NULL sein; dann ist NOT IN nie wahr. Sicher: `WHERE NOT EXISTS (SELECT 1 FROM bestellungen b WHERE b.ma_id = m.ma_id)` oder in der Unterabfrage `WHERE ma_id IS NOT NULL`. | P: 4

## Szenario
### Führungsspanne und Berichtswege
Die Personalabteilung der Netzilon GmbH möchte für eine Reorganisation die Berichtswege prüfen: Wie tief ist die Hierarchie, wer hat die meisten direkten Mitarbeitenden, und wer verdient mehr als die eigene Führungskraft?
- F: Wie ermitteln Sie die Anzahl der Hierarchieebenen? | A: Rekursive CTE ab `vorgesetzter_id IS NULL` mit Ebenenzähler, dann `SELECT MAX(ebene) + 1 FROM org;` | P: 3
- F: Wer verdient mehr als die eigene Führungskraft? | A: `SELECT m.nachname FROM mitarbeiter m WHERE m.gehalt > (SELECT v.gehalt FROM mitarbeiter v WHERE v.ma_id = m.vorgesetzter_id);` (korreliert) oder als Self-Join. | P: 3
- F: Welche Führungskräfte haben mehr als 5 direkte Mitarbeitende? | A: `SELECT vorgesetzter_id, COUNT(*) FROM mitarbeiter WHERE vorgesetzter_id IS NOT NULL GROUP BY vorgesetzter_id HAVING COUNT(*) > 5;` | P: 2
- F: Worauf müssen Sie in SQL Server bei der rekursiven CTE achten? | A: Kein `RECURSIVE`, vorige Anweisung mit `;` beenden, gleiche Datentypen in Anker und Rekursion (CAST), Grenze 100 Ebenen bzw. MAXRECURSION. | P: 2
