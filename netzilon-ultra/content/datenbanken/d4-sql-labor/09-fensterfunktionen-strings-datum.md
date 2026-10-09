---
id: db-labor-fenster
bereich: Datenbanken
block: D4
kapitel: SQL-Labor (Firmen-DB)
titel: Fensterfunktionen, String- und Datumsfunktionen, CASE
stufe: Profi
fach: SQL / Datenbanken
pruefungen: [AP1, AP2, Schule]
quellen: [SQLite-Dokumentation, Microsoft Learn – T-SQL]
verweise: [db-select-funktionen, db-labor-aggregate, db-labor-unterabfragen, db-labor-select]
---

## Profi

### Fensterfunktionen (window functions)
Eine Fensterfunktion rechnet über eine **Menge verwandter Zeilen** (das „Fenster“), **ohne** die Zeilen zusammenzufassen – anders als GROUP BY bleibt jede Zeile erhalten. Syntax:
```text
funktion(...) OVER ([PARTITION BY spalten] [ORDER BY spalten] [ROWS/RANGE-Rahmen])
```
- `PARTITION BY` teilt in Gruppen (wie GROUP BY, aber ohne Verdichtung).
- `ORDER BY` im OVER legt die Reihenfolge innerhalb der Partition fest.
- SQLite unterstützt Fensterfunktionen seit **3.25** (SQL-Labor: 3.45), SQL Server seit 2005/2012.

Alle Beispiele: Firmen-DB der **Netzilon GmbH**. Probier es im SQL-Labor (Werkzeuge) aus.

### Rangfunktionen
```sql
SELECT abt_id, nachname, gehalt,
       ROW_NUMBER() OVER (PARTITION BY abt_id ORDER BY gehalt DESC) AS zeile,
       RANK()       OVER (PARTITION BY abt_id ORDER BY gehalt DESC) AS rang,
       DENSE_RANK() OVER (PARTITION BY abt_id ORDER BY gehalt DESC) AS dichter_rang
FROM mitarbeiter
WHERE austritt IS NULL;
```
| Gehälter | ROW_NUMBER | RANK | DENSE_RANK |
|---|---|---|---|
| 5000 | 1 | 1 | 1 |
| 4200 | 2 | 2 | 2 |
| 4200 | 3 | 2 | 2 |
| 3900 | 4 | **4** | **3** |

- `ROW_NUMBER` – fortlaufend, bei Gleichstand willkürlich.
- `RANK` – Gleichstand gleicher Rang, danach **Lücke**.
- `DENSE_RANK` – Gleichstand gleicher Rang, **keine Lücke**.
- `NTILE(4)` – teilt in 4 möglichst gleich große Gruppen (Quartile).

**Top-n je Gruppe** (bestverdienende Person je Abteilung) – Fensterfunktionen dürfen nicht in WHERE stehen (sie werden erst in der SELECT-Phase berechnet), daher Unterabfrage/CTE:
```sql
WITH r AS (
  SELECT abt_id, nachname, gehalt,
         RANK() OVER (PARTITION BY abt_id ORDER BY gehalt DESC) AS rang
  FROM mitarbeiter
  WHERE austritt IS NULL
)
SELECT abt_id, nachname, gehalt FROM r WHERE rang = 1;
```

### Aggregat als Fensterfunktion
```sql
SELECT ma_id, datum, stunden,
       SUM(stunden) OVER (PARTITION BY ma_id ORDER BY datum)                     AS laufende_summe,
       SUM(stunden) OVER (PARTITION BY ma_id)                                    AS gesamt_ma,
       ROUND(100.0 * stunden / SUM(stunden) OVER (PARTITION BY ma_id), 1)        AS anteil_prozent,
       AVG(stunden) OVER (PARTITION BY ma_id ORDER BY datum
                          ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)              AS schnitt_3
FROM zeiterfassung
WHERE projekt_id IS NOT NULL;
```
Achtung: Mit `ORDER BY` im OVER ist der Standardrahmen `RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW` → laufende Summe (gleiche Datumswerte werden zusammen addiert). Ohne ORDER BY gilt die ganze Partition.

### Versatzfunktionen
- `LAG(spalte, 1) OVER (ORDER BY ...)` – Wert der **vorherigen** Zeile; `LEAD` – der **nächsten**.
- `FIRST_VALUE` / `LAST_VALUE` – erster/letzter Wert im Rahmen.
```sql
-- Abstand zwischen zwei Bestellungen desselben Kunden in Tagen
SELECT kunde_id, best_id, datum,
       julianday(datum) - julianday(LAG(datum) OVER (PARTITION BY kunde_id ORDER BY datum)) AS tage_seit_letzter
FROM bestellungen;
```

### String-Funktionen SQLite vs. T-SQL
| Zweck | SQLite | T-SQL |
|---|---|---|
| Verketten | `vorname \|\| ' ' \|\| nachname` | `vorname + ' ' + nachname`, `CONCAT(...)`, `CONCAT_WS(' ', ...)` |
| Länge | `length(s)` | `LEN(s)` (ohne Leerzeichen am Ende), `DATALENGTH(s)` (Bytes) |
| Teilstring | `substr(s, start, länge)` | `SUBSTRING(s, start, länge)` |
| Links/rechts | `substr(s, 1, 3)` / `substr(s, -3)` | `LEFT(s, 3)` / `RIGHT(s, 3)` |
| Groß/klein | `upper(s)` / `lower(s)` (nur ASCII) | `UPPER(s)` / `LOWER(s)` (Unicode) |
| Leerzeichen entfernen | `trim(s)`, `ltrim`, `rtrim` | `TRIM(s)` (ab 2017), `LTRIM`, `RTRIM` |
| Ersetzen | `replace(s, 'ä', 'ae')` | `REPLACE(s, N'ä', N'ae')` |
| Position suchen | `instr(s, '@')` | `CHARINDEX('@', s)` (Argumente vertauscht!) |
| Formatieren | `printf('%.2f', x)` / `format()` | `FORMAT(x, 'N2', 'de-DE')` |
| NULL ersetzen | `ifnull(x, 0)`, `coalesce(x, 0)` | `ISNULL(x, 0)`, `COALESCE(x, 0)` |
| Typumwandlung | `CAST(x AS INTEGER)` | `CAST(x AS INT)`, `CONVERT(INT, x)`, `TRY_CAST` |

Beispiel: Domäne und lokalen Teil der E-Mail trennen:
```sql
SELECT email,
       substr(email, 1, instr(email, '@') - 1) AS lokal,
       substr(email, instr(email, '@') + 1)    AS domaene,
       upper(substr(nachname, 1, 1)) || '.'    AS initiale
FROM mitarbeiter
LIMIT 5;
```

### Datumsfunktionen SQLite vs. T-SQL
SQLite hat **keinen Datumstyp**; die Firmen-DB speichert ISO-Text `YYYY-MM-DD`. Die Funktionen `date()`, `time()`, `datetime()`, `julianday()`, `strftime()` rechnen damit:
| Zweck | SQLite | T-SQL |
|---|---|---|
| Heute | `date('now')` (UTC!), `date('now', 'localtime')` | `CAST(GETDATE() AS DATE)`, `SYSDATETIME()` |
| Jahr/Monat | `strftime('%Y', datum)`, `strftime('%m', datum)` | `YEAR(datum)`, `MONTH(datum)`, `DATEPART(month, datum)` |
| Addieren | `date(datum, '+30 days')`, `'+1 month'`, `'-1 year'` | `DATEADD(day, 30, datum)` |
| Differenz in Tagen | `julianday(b) - julianday(a)` | `DATEDIFF(day, a, b)` |
| Monatsende | `date(datum, 'start of month', '+1 month', '-1 day')` | `EOMONTH(datum)` |
| Formatieren | `strftime('%d.%m.%Y', datum)` | `FORMAT(datum, 'dd.MM.yyyy')`, `CONVERT(CHAR(10), datum, 104)` |
| Wochentag | `strftime('%w', datum)` (0 = Sonntag) | `DATEPART(weekday, datum)` (abhängig von `DATEFIRST`) |

Beispiele:
```sql
-- Betriebszugehörigkeit in vollen Jahren (vereinfachte Rechnung über Tage)
SELECT nachname, eintritt,
       CAST((julianday('2026-01-01') - julianday(eintritt)) / 365.25 AS INTEGER) AS jahre
FROM mitarbeiter
WHERE austritt IS NULL
ORDER BY jahre DESC;

-- Stunden je Monat 2025
SELECT strftime('%Y-%m', datum) AS monat, SUM(stunden) AS stunden
FROM zeiterfassung
WHERE datum BETWEEN '2025-01-01' AND '2025-12-31'
GROUP BY monat
ORDER BY monat;

-- Deutsches Datumsformat
SELECT best_id, strftime('%d.%m.%Y', datum) AS datum_de FROM bestellungen LIMIT 5;
```

### CASE – Fallunterscheidung
**Gesuchte Form** (searched CASE) mit beliebigen Bedingungen und **einfache Form** (simple CASE) mit Wertvergleich:
```sql
SELECT nachname, gehalt,
       CASE
         WHEN gehalt >= 6000 THEN 'hoch'
         WHEN gehalt >= 3500 THEN 'mittel'
         ELSE 'einstieg'
       END AS gehaltsband,
       CASE azubi WHEN 1 THEN 'Azubi' ELSE 'Fachkraft' END AS art
FROM mitarbeiter;
```
Die erste zutreffende WHEN-Bedingung gewinnt; ohne ELSE ist das Ergebnis NULL. CASE funktioniert in SELECT, WHERE, ORDER BY, GROUP BY und in Aggregaten (bedingte Aggregation).
`iif(bedingung, dann, sonst)` gibt es in SQLite seit **3.32** und in T-SQL (IIF) seit 2012.

### T-SQL-Unterschied
| Thema | SQLite (SQL-Labor) | T-SQL (SQL Server) |
|---|---|---|
| Fensterfunktionen | ab 3.25; inkl. `FILTER`, `GROUPS`-Rahmen, `WINDOW`-Klausel | ab 2012 vollständig; `WINDOW`-Klausel erst ab SQL Server 2022 |
| Top-n mit Gleichstand | `RANK()` + Unterabfrage | zusätzlich `SELECT TOP (3) WITH TIES ... ORDER BY gehalt DESC` |
| Verkettung | `\|\|` (NULL ergibt NULL) | `+` (NULL ergibt NULL), `CONCAT` (NULL wird leer) |
| Datumstyp | Text/REAL/INTEGER + Funktionen | `DATE`, `DATETIME2` mit `DATEADD`, `DATEDIFF`, `FORMAT`, `EOMONTH` |
| Jetzt | `datetime('now')` = UTC | `GETDATE()` = lokale Serverzeit, `GETUTCDATE()` |
| Bedingung kurz | `iif()` ab 3.32 | `IIF()` ab 2012, `CHOOSE()` |
| Stringliste | `group_concat` | `STRING_AGG` |
| Prozentrang | `PERCENT_RANK()`, `CUME_DIST()` | dazu `PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY gehalt) OVER ()` (Median) |

## Einfach

**Fensterfunktionen**: Stell dir vor, alle Mitarbeitenden der Netzilon GmbH stehen in ihrer Abteilung in einer **Reihe**, sortiert nach Gehalt. Jetzt bekommt jede Person eine **Startnummer**: 1, 2, 3 … – aber **in jeder Abteilung neu** ab 1. Das ist `ROW_NUMBER() OVER (PARTITION BY abt_id ORDER BY gehalt DESC)`. Das Besondere: Niemand wird „zusammengefasst“, jede Person bleibt in der Liste und bekommt **zusätzlich** ihre Nummer.

Wie bei einem Sportwettkampf gibt es drei Arten, Plätze zu vergeben:
- **ROW_NUMBER** – jeder bekommt eine eigene Nummer, auch bei Gleichstand.
- **RANK** – Gleichstand teilt sich den Platz, dann wird übersprungen (1, 2, 2, 4).
- **DENSE_RANK** – Gleichstand teilt sich den Platz, ohne Lücke (1, 2, 2, 3).

Eine **laufende Summe** ist wie ein Sparschwein: Jeden Tag kommen Stunden dazu, und du siehst immer den aktuellen Gesamtstand.

**String-Funktionen** sind **Scheren und Kleber** für Text: abschneiden (`substr`), zusammenkleben (`||`), GROSS machen (`upper`).

**Datumsfunktionen** sind ein **Kalender zum Rechnen**: „Was ist 30 Tage nach der Bestellung?“, „In welchem Monat war das?“

**CASE** ist ein **Wegweiser**: „Wenn Gehalt hoch, dann schreib ‚hoch‘, sonst wenn mittel …“.

Probier es im SQL-Labor (Werkzeuge) aus!

## Merksatz
- **GROUP BY fasst zusammen – OVER lässt jede Zeile stehen.**
- PARTITION BY = Gruppen, ORDER BY im OVER = Reihenfolge im Fenster.
- RANK springt (1, 2, 2, 4), DENSE_RANK nicht (1, 2, 2, 3).
- Fensterfunktion nicht in WHERE – erst CTE, dann filtern.
- SQLite: strftime, date, julianday – T-SQL: DATEPART, DATEADD, DATEDIFF.
- CASE: erste wahre Bedingung gewinnt, ohne ELSE gibt es NULL.

## Prüfungsfalle
- `WHERE ROW_NUMBER() OVER (...) = 1` ist unzulässig – Unterabfrage/CTE nötig.
- RANK vs. DENSE_RANK: Lücke nach Gleichstand nur bei RANK.
- `date('now')` liefert in SQLite **UTC**, nicht Ortszeit.
- `CHARINDEX('@', s)` (T-SQL) vs. `instr(s, '@')` (SQLite) – Argumentreihenfolge vertauscht.
- `LEN` in T-SQL ignoriert Leerzeichen am Ende, `length` in SQLite nicht.
- CASE ohne ELSE liefert NULL für nicht abgedeckte Fälle.
- Laufende Summe: ORDER BY im OVER nicht vergessen, sonst Partitionssumme.

## Grafik
### GROUP BY gegen OVER
1. Tabelle: 100 Mitarbeitende in 10 Abteilungen
2. GROUP BY abt_id: verdichtet auf 10 Zeilen
3. OVER (PARTITION BY abt_id): alle 100 Zeilen bleiben
4. Fensterfunktion: jede Zeile erhält zusätzlich den Abteilungswert
5. Ergebnis: Detail und Kennzahl in derselben Zeile

### Rangvergabe bei Gleichstand
1. Gehalt 5000: ROW_NUMBER 1, RANK 1, DENSE_RANK 1
2. Gehalt 4200: ROW_NUMBER 2, RANK 2, DENSE_RANK 2
3. Gehalt 4200: ROW_NUMBER 3, RANK 2, DENSE_RANK 2
4. Gehalt 3900: ROW_NUMBER 4, RANK 4, DENSE_RANK 3

## Lab
### GUI
Maschine: SQL-Labor in Netzilon (Werkzeuge → SQL-Labor), Firmen-DB „Netzilon GmbH“.
1. Gehaltsrangliste je Abteilung mit ROW_NUMBER, RANK und DENSE_RANK erstellen.
2. Die bestverdienende Person je Abteilung über eine CTE ermitteln.
3. Laufende Summe der Stunden je Mitarbeiter berechnen.
4. Monatsauswertung der Zeiterfassung 2025 mit strftime erstellen.
5. Betriebszugehörigkeit in Jahren berechnen und mit CASE in Gruppen einteilen.
6. Benutzername aus Vor- und Nachname nachbauen und mit der Spalte benutzername vergleichen – Achtung: `lower()` wandelt in SQLite nur ASCII um, ein großes „Ö“ am Namensanfang bleibt stehen. Wo weicht das Ergebnis ab?

```sql
-- 1 und 2
WITH r AS (
  SELECT abt_id, nachname, gehalt,
         ROW_NUMBER() OVER (PARTITION BY abt_id ORDER BY gehalt DESC) AS zeile,
         RANK()       OVER (PARTITION BY abt_id ORDER BY gehalt DESC) AS rang
  FROM mitarbeiter WHERE austritt IS NULL
)
SELECT * FROM r WHERE rang = 1 ORDER BY abt_id;

-- 3
SELECT ma_id, datum, stunden,
       SUM(stunden) OVER (PARTITION BY ma_id ORDER BY datum) AS laufend
FROM zeiterfassung
ORDER BY ma_id, datum
LIMIT 30;

-- 4
SELECT strftime('%m', datum) AS monat, ROUND(SUM(stunden), 1) AS stunden
FROM zeiterfassung
WHERE strftime('%Y', datum) = '2025'
GROUP BY monat;

-- 5
SELECT nachname, eintritt,
       CASE
         WHEN julianday('2026-01-01') - julianday(eintritt) >= 10 * 365.25 THEN '10+ Jahre'
         WHEN julianday('2026-01-01') - julianday(eintritt) >= 5 * 365.25  THEN '5–9 Jahre'
         ELSE 'unter 5 Jahre'
       END AS zugehoerigkeit
FROM mitarbeiter
WHERE austritt IS NULL;

-- 6
SELECT benutzername,
       lower(replace(replace(replace(replace(vorname || '.' || nachname,
             'ä', 'ae'), 'ö', 'oe'), 'ü', 'ue'), 'ß', 'ss')) AS nachgebaut
FROM mitarbeiter
LIMIT 10;
```

### T-SQL
Maschine: SQL01.example.com, SSMS, Datenbank `Netzilon`.
1. Top-3-Gehälter mit Gleichstand per `TOP (3) WITH TIES` abfragen.
2. Datumsfunktionen DATEDIFF, DATEADD, EOMONTH und FORMAT nutzen.
3. Median der Gehälter je Abteilung mit PERCENTILE_CONT berechnen.

```tsql
USE Netzilon;
SELECT TOP (3) WITH TIES nachname, gehalt
FROM dbo.mitarbeiter
ORDER BY gehalt DESC;

SELECT nachname,
       DATEDIFF(year, eintritt, GETDATE())       AS jahre_grob,
       DATEADD(month, 6, eintritt)               AS probezeit_ende,
       EOMONTH(eintritt)                         AS monatsende,
       FORMAT(eintritt, 'dd.MM.yyyy', 'de-DE')   AS eintritt_de,
       IIF(azubi = 1, N'Azubi', N'Fachkraft')    AS art
FROM dbo.mitarbeiter;

SELECT DISTINCT abt_id,
       PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY gehalt) OVER (PARTITION BY abt_id) AS median
FROM dbo.mitarbeiter;
```

## Legende
### Fensterfunktion
- Was: Berechnung über eine Gruppe verwandter Zeilen, ohne die Zeilen zu verdichten.
- Wie: `funktion() OVER (PARTITION BY ... ORDER BY ...)`, z. B. ROW_NUMBER, RANK, SUM, LAG.
- Wann: Ranglisten, Top-n je Gruppe, laufende Summen, Anteile, Vergleich mit Vorperiode.
- Wo: SQLite ab 3.25 (SQL-Labor 3.45), SQL Server ab 2012.
- Warum: Detail und Kennzahl in einer Zeile – ohne Self-Join oder korrelierte Unterabfrage.
### Datumsfunktionen
- Was: Rechnen mit Datumswerten (Teile, Addition, Differenz, Formatierung).
- Wie: SQLite `date()`, `strftime()`, `julianday()`; T-SQL `DATEADD`, `DATEDIFF`, `FORMAT`, `EOMONTH`.
- Beispiel: `strftime('%Y-%m', datum)` für Monatsauswertungen.
### CASE
- Was: Fallunterscheidung innerhalb eines SQL-Ausdrucks.
- Wie: `CASE WHEN bedingung THEN wert ... ELSE wert END`.
- Warum: Klassifizieren (Gehaltsband), bedingte Aggregation, individuelle Sortierung.

## Karteikarten
- F: Was unterscheidet eine Fensterfunktion von GROUP BY? | A: Sie berechnet über eine Zeilengruppe, behält aber jede einzelne Zeile im Ergebnis.
- F: Wozu dient PARTITION BY? | A: Teilt die Zeilen in Gruppen, innerhalb derer die Fensterfunktion getrennt rechnet.
- F: Unterschied RANK und DENSE_RANK? | A: RANK lässt nach Gleichstand eine Lücke (1,2,2,4), DENSE_RANK nicht (1,2,2,3).
- F: Wie ermittelt man die Top-1 je Abteilung? | A: RANK/ROW_NUMBER mit PARTITION BY in einer CTE berechnen und außen `WHERE rang = 1` filtern.
- F: Wie berechnet man eine laufende Summe? | A: `SUM(stunden) OVER (PARTITION BY ma_id ORDER BY datum)`.
- F: Was liefert LAG? | A: Den Wert einer vorherigen Zeile im Fenster, z. B. das letzte Bestelldatum.
- F: SQLite-Gegenstück zu DATEADD(day, 30, datum)? | A: `date(datum, '+30 days')`.
- F: SQLite-Gegenstück zu DATEDIFF(day, a, b)? | A: `julianday(b) - julianday(a)`.
- F: Wie formatiert man ein Datum deutsch in SQLite und T-SQL? | A: SQLite `strftime('%d.%m.%Y', datum)`, T-SQL `FORMAT(datum, 'dd.MM.yyyy')` oder `CONVERT(CHAR(10), datum, 104)`.
- F: Welche Zeitzone liefert `date('now')` in SQLite? | A: UTC – für Ortszeit `date('now', 'localtime')`.
- F: Was liefert CASE ohne ELSE, wenn keine Bedingung zutrifft? | A: NULL.
- F: SQLite-Gegenstück zu CHARINDEX('@', email)? | A: `instr(email, '@')` – Argumente in umgekehrter Reihenfolge.

## Quiz
? Welche Abfrage nummeriert die Mitarbeitenden je Abteilung nach Gehalt absteigend?
* `SELECT nachname, ROW_NUMBER() OVER (PARTITION BY abt_id ORDER BY gehalt DESC) FROM mitarbeiter;`
- `SELECT nachname, ROW_NUMBER() FROM mitarbeiter GROUP BY abt_id HAVING COUNT(*) > 0 ORDER BY gehalt DESC;`
- `SELECT nachname, COUNT(*) OVER (ORDER BY abt_id) FROM mitarbeiter GROUP BY gehalt;`
- `SELECT nachname, RANK(abt_id, gehalt) FROM mitarbeiter ORDER BY gehalt DESC;`
! ROW_NUMBER braucht eine OVER-Klausel; PARTITION BY startet je Abteilung neu.

? Gehälter 5000, 4200, 4200, 3900: Welchen RANK erhält 3900?
- 3
* 4
- 2
- 1
! RANK lässt nach dem Gleichstand eine Lücke; DENSE_RANK ergäbe 3.

? Warum ist `SELECT * FROM mitarbeiter WHERE RANK() OVER (ORDER BY gehalt DESC) <= 3` falsch?
- RANK gibt es in SQLite nicht
- OVER braucht immer PARTITION BY
* Fensterfunktionen sind in WHERE nicht erlaubt
- `<=` ist bei Fensterfunktionen verboten
! Fensterfunktionen werden logisch erst in der SELECT-Phase berechnet; außen per CTE filtern.

? Was liefert `SUM(stunden) OVER (PARTITION BY ma_id)` ohne ORDER BY im OVER?
- Eine laufende Summe je Mitarbeiter
* Die Gesamtsumme je Mitarbeiter in jeder seiner Zeilen
- Die Summe aller Stunden in einer einzigen Zeile
- Einen Fehler
! Ohne ORDER BY umfasst der Rahmen die ganze Partition.

? Welcher SQLite-Ausdruck liefert das Datum 30 Tage nach der Bestellung?
- `DATEADD(day, 30, datum)`
- `datum + 30`
- `strftime('%d', datum) + 30`
* `date(datum, '+30 days')`
! `datum + 30` würde in SQLite den Text numerisch interpretieren (2025 + 30).

? Welche Funktion entspricht in T-SQL `strftime('%Y', datum)`?
* `YEAR(datum)`
- `substr(datum, 1, 4)`
- `DATEADD(year, datum)`
- `EOMONTH(datum)`
! Alternativ `DATEPART(year, datum)`.

? Welche Abfrage liefert die Monatssummen der Stunden 2025 in SQLite?
- `SELECT MONTH(datum) AS m, SUM(stunden) FROM zeiterfassung WHERE YEAR(datum) = 2025 GROUP BY MONTH(datum);`
* `SELECT strftime('%m', datum) AS m, SUM(stunden) FROM zeiterfassung WHERE datum LIKE '2025-%' GROUP BY m;`
- `SELECT datum, SUM(stunden) OVER () FROM zeiterfassung WHERE datum = 2025;`
- `SELECT DATEPART(month, datum), SUM(stunden) FROM zeiterfassung GROUP BY 1;`
! MONTH und DATEPART sind T-SQL; SQLite nutzt strftime.

? Was ergibt `CASE WHEN gehalt >= 3500 THEN 'mittel' WHEN gehalt >= 6000 THEN 'hoch' END` bei 7000?
- 'hoch'
* 'mittel'
- NULL
- Einen Fehler
! Die erste zutreffende Bedingung gewinnt – deshalb vom strengsten zum schwächsten Kriterium ordnen.

? Was liefert `LAG(datum) OVER (PARTITION BY kunde_id ORDER BY datum)` für die erste Bestellung eines Kunden?
- Das eigene Datum
- Das Datum der letzten Bestellung des Kunden
* NULL
- Das Datum der vorherigen Bestellung eines anderen Kunden
! Vor der ersten Zeile der Partition gibt es keinen Vorgänger.

? Wie lautet das T-SQL-Gegenstück zu `instr(email, '@')`?
- `INSTR('@', email)`
- `POSITION(email, '@')`
- `FIND(email, '@')`
* `CHARINDEX('@', email)`
! Bei CHARINDEX steht der Suchtext zuerst.

? Welche T-SQL-Abfrage liefert die drei höchsten Gehälter inklusive aller Gleichstände?
- `SELECT nachname, gehalt FROM dbo.mitarbeiter ORDER BY gehalt DESC LIMIT 3 WITH TIES;`
* `SELECT TOP (3) WITH TIES nachname, gehalt FROM dbo.mitarbeiter ORDER BY gehalt DESC;`
- `SELECT TOP (3) nachname, gehalt FROM dbo.mitarbeiter;`
- `SELECT nachname, gehalt FROM dbo.mitarbeiter FETCH TIES 3;`
! WITH TIES verlangt ORDER BY; LIMIT gibt es in T-SQL nicht.

? Welche Zeitzone verwendet `datetime('now')` in SQLite?
- Die Zeitzone des Betriebssystems
- Mitteleuropäische Zeit
* UTC
- Die Zeitzone der letzten Abfrage
! Ortszeit mit dem Modifikator `'localtime'`.

## Lücken
- Fensterfunktionen verwenden die Klausel {OVER}; Gruppen bildet man darin mit {PARTITION BY}.
- Bei Gleichstand lässt {RANK} eine Lücke, {DENSE_RANK} nicht.
- In SQLite erhält man das Jahr mit {strftime}('%Y', datum), in T-SQL mit {YEAR}(datum).
- Den Wert der vorherigen Zeile liefert {LAG}, den der nächsten {LEAD}.

## Zuordnen
### SQLite und T-SQL
- `date(datum, '+1 month')` => `DATEADD(month, 1, datum)`
- `julianday(b) - julianday(a)` => `DATEDIFF(day, a, b)`
- `strftime('%d.%m.%Y', datum)` => `FORMAT(datum, 'dd.MM.yyyy')`
- `length(s)` => `LEN(s)`
- `instr(s, '@')` => `CHARINDEX('@', s)`
- `ifnull(x, 0)` => `ISNULL(x, 0)`

## Reihenfolge
### Top-1-Gehalt je Abteilung ermitteln
1. Mitarbeitende filtern (WHERE austritt IS NULL)
2. RANK() OVER (PARTITION BY abt_id ORDER BY gehalt DESC) berechnen
3. Ergebnis als CTE r benennen
4. Außen SELECT … FROM r ausführen
5. Mit WHERE rang = 1 filtern

## Freitext
- F: Erklären Sie den Unterschied zwischen `SELECT abt_id, AVG(gehalt) FROM mitarbeiter GROUP BY abt_id` und `SELECT nachname, abt_id, AVG(gehalt) OVER (PARTITION BY abt_id) FROM mitarbeiter`. | M: GROUP BY verdichtet auf eine Zeile je Abteilung (10 Zeilen), Einzelpersonen sind nicht mehr sichtbar. Die Fensterfunktion behält alle 100 Zeilen und schreibt in jede Zeile den Durchschnitt der eigenen Abteilung – so kann man z. B. die Abweichung vom Abteilungsschnitt berechnen. | P: 4
- F: Berechnen Sie in SQLite für jede Bestellung das Fälligkeitsdatum (30 Tage nach Bestelldatum) im deutschen Format. | M: `SELECT best_id, strftime('%d.%m.%Y', date(datum, '+30 days')) AS faellig FROM bestellungen;` – T-SQL: `FORMAT(DATEADD(day, 30, datum), 'dd.MM.yyyy')`. | P: 3

## Szenario
### Gehaltsbänder und Jubiläen
Die Personalabteilung der Netzilon GmbH möchte für 2026 eine Übersicht: Jede aktive Person soll einem Gehaltsband zugeordnet werden, je Abteilung sollen die drei bestverdienenden Personen erkennbar sein, und alle, die 2026 ihr 5-, 10- oder 15-jähriges Firmenjubiläum feiern, sollen aufgelistet werden.
- F: Ordnen Sie Gehaltsbänder zu (ab 6000 hoch, ab 3500 mittel, sonst einstieg). | A: `SELECT nachname, gehalt, CASE WHEN gehalt >= 6000 THEN 'hoch' WHEN gehalt >= 3500 THEN 'mittel' ELSE 'einstieg' END AS band FROM mitarbeiter WHERE austritt IS NULL;` | P: 3
- F: Wie erhalten Sie die Top 3 je Abteilung? | A: CTE mit `DENSE_RANK() OVER (PARTITION BY abt_id ORDER BY gehalt DESC) AS rang`, außen `WHERE rang <= 3`. | P: 3
- F: Wie finden Sie die Jubiläen 2026 in SQLite? | A: `SELECT vorname, nachname, eintritt, 2026 - CAST(strftime('%Y', eintritt) AS INTEGER) AS jahre FROM mitarbeiter WHERE austritt IS NULL AND (2026 - CAST(strftime('%Y', eintritt) AS INTEGER)) IN (5, 10, 15);` | P: 3
- F: Wie lautet die Jahresberechnung in T-SQL? | A: `2026 - YEAR(eintritt)` bzw. `DATEDIFF(year, eintritt, '2026-12-31')`. | P: 1
