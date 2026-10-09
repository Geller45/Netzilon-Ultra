---
id: db-select-funktionen
bereich: Datenbanken
pruefungen: [Schule, AP2]
fach: SQL / Datenbanken
block: D2
kapitel: SQL Abfragen
titel: T-SQL Datentypen, Konvertierung, Text- und Datumsfunktionen
stufe: Fortgeschritten
quellen: [select_03_funktionen.pdf, tsql.pdf]
verweise: [db-select-basics, db-select-aggregate, db-ddl]
---

## Profi

### Datentypen in SQL Server
| Gruppe | Typen | Hinweis |
|---|---|---|
| Ganzzahl | tinyint (0–255, 1 B), smallint (2 B), int (4 B, ±2,1 Mrd.), bigint (8 B), bit (0/1/NULL) | |
| Festkomma | decimal(p,s)/numeric, money (8 B), smallmoney (4 B) | exakt, für Geld |
| Gleitkomma | float(n) (4 oder 8 B), real (4 B) | ungenau, Nachkommastellen werden bei int-Umwandlung abgeschnitten |
| Zeichen | CHAR(n)/VARCHAR(n) 1 Byte/Zeichen; NCHAR/NVARCHAR 2 Byte/Zeichen (Unicode, Literal `N'text'`) | TEXT/NTEXT veraltet → VARCHAR(MAX)/NVARCHAR(MAX) |
| Binär | binary(n), varbinary(n/MAX) | Bilder, Dateien (ggf. FILESTREAM) |
| Datum/Zeit | DATE (3 B), TIME, DATETIME2 (6–8 B, 100 ns), DATETIME (8 B, ab 1753), SMALLDATETIME, DATETIMEOFFSET | DATETIME2 bevorzugen |

CHAR ist **feste Länge** (aufgefüllt), VARCHAR **variabel** (Länge + 2 Byte). Sortierung (Collation) bestimmt Groß-/Kleinschreibung: `WHERE lastname COLLATE Latin1_General_CS_AS = N'Funk'`.

### Datentyprangfolge und Konvertierung
Bei gemischten Typen wird der Typ mit **niedrigerer Priorität** implizit in den höheren gewandelt (CHAR → VARCHAR → NVARCHAR → INT → DECIMAL → TIME → DATE → DATETIME2 → XML). Umgekehrt ist **explizite** Konvertierung nötig.
- `CAST(wert AS typ)` – ANSI-Standard: `CAST(unitprice AS int)`
- `CONVERT(typ, wert, format)` – T-SQL-spezifisch mit Formatnummer: `CONVERT(CHAR(8), CURRENT_TIMESTAMP, 112)` → 20260508 (ISO)
- `PARSE(text AS typ USING 'de-DE')` – kulturabhängig (ab 2012), Fehler bei Misserfolg
- `TRY_CAST`, `TRY_CONVERT`, `TRY_PARSE` – liefern bei Fehler **NULL** statt Abbruch
Unzulässig z. B. `CAST(SYSDATETIME() AS int)` → Fehler 529.

### Textfunktionen
| Funktion | Zweck |
|---|---|
| `a + b`, `CONCAT(a,b,…)` | Verketten; `+` mit NULL → NULL, CONCAT behandelt NULL als '' |
| `SUBSTRING(x, start, länge)` | Teilstring (Start bei 1) |
| `LEFT(x,n)`, `RIGHT(x,n)` | n Zeichen links/rechts |
| `LEN(x)` / `DATALENGTH(x)` | Zeichen (ohne nachfolgende Leerzeichen) / Bytes |
| `CHARINDEX(suche, text)` | Position (0 = nicht gefunden) |
| `REPLACE(x, alt, neu)` | alle Vorkommen ersetzen |
| `UPPER`, `LOWER`, `LTRIM`, `RTRIM`, `TRIM` | Groß/Klein, Leerzeichen |
| `FORMAT(wert, 'N2', 'de-DE')` | Formatierung |
Beispiel: `SELECT LEFT(email, CHARINDEX('@', email) - 1) AS Benutzer FROM Kontakt;`

### Datum und Zeit
Sprachunabhängige Literale: `'20120212'`, `'2012-02-12'`, `'2012-02-12T12:30:15'`. Funktionen: `GETDATE()`, `SYSDATETIME()`, `CURRENT_TIMESTAMP`, `YEAR()`, `MONTH()`, `DAY()`, `DATEPART(part, d)`, `DATENAME`, `DATEADD(day, 7, d)`, `DATEDIFF(day, a, b)`, `EOMONTH(d)`, `ISDATE(x)`.
Beispiel Alter: `DATEDIFF(year, gebdat, GETDATE())` zählt nur Jahreswechsel (kann um 1 abweichen!).

### Weitere Skalarfunktionen
`ISNULL(a,b)`, `COALESCE(a,b,c,…)`, `NULLIF(a,b)`, `IIF(bed, ja, nein)`, `CASE WHEN … THEN … ELSE … END`, `ROUND`, `ABS`, `CEILING`, `FLOOR`.
```
SELECT productname, CASE WHEN unitprice < 10 THEN 'günstig' WHEN unitprice < 50 THEN 'mittel' ELSE 'teuer' END AS Preisklasse FROM Production.Products;
```

## Einfach

Jede Spalte in einer Datenbank hat einen **Datentyp** – das ist wie bei den **Schubladen in einem Werkzeugkasten**: In die Schraubenschublade gehören nur Schrauben. Eine Spalte „Alter“ nimmt nur Zahlen, eine Spalte „Name“ nur Text, eine Spalte „Geburtstag“ nur Datumsangaben. So kann der Computer mit den Werten richtig arbeiten (rechnen, sortieren, vergleichen).

- **int** = ganze Zahl (7), **decimal(10,2)** = Kommazahl mit genau 2 Nachkommastellen (19,99 – gut für Geld), **float** = Kommazahl, aber „ungefähr“.
- **char(5)** = Text mit **festem** Platz für 5 Zeichen, auch wenn man nur 2 schreibt (wie ein Parkplatz, der immer reserviert bleibt). **varchar(50)** = Text mit **flexiblem** Platz (nimmt nur so viel wie nötig). **nvarchar** kann zusätzlich Umlaute, Chinesisch, Emojis – das „n“ steht für Unicode.
- **date / datetime2** = Datum, Datum mit Uhrzeit.

**Umwandeln** nennt man **casten**: Manchmal muss man einen Wert in eine andere Schublade legen, z. B. die Zahl 5 als Text „5“ umschreiben, damit man sie an einen Satz hängen kann. `CAST(5 AS varchar(10))`. Klappt es nicht, gibt `CAST` einen Fehler, `TRY_CAST` sagt höflich „NULL – ging nicht“.

**Funktionen** sind kleine **Helfer-Maschinen**: Du wirfst etwas rein, es kommt etwas anderes raus.
- `UPPER('hallo')` → HALLO
- `LEN('Haus')` → 4
- `LEFT('Bochum', 3)` → Boc
- `REPLACE('Hund', 'H', 'M')` → Mund
- `YEAR('2026-05-08')` → 2026
- `DATEADD(day, 7, heute)` → in einer Woche
Und: **Text + NULL = NULL**. Wenn ein Teil unbekannt ist, ist das Ganze unbekannt. `CONCAT` ist da großzügiger und lässt NULL einfach weg.

## Merksatz
- **char fest, varchar variabel, nvarchar Unicode.**
- **CAST ist Standard, CONVERT hat Formatnummern, TRY_ liefert NULL statt Fehler.**
- Text + NULL = NULL; CONCAT ignoriert NULL.
- Geld in **decimal**, nicht in float.
- Datumsliteral sprachunabhängig: **YYYYMMDD**.

## Prüfungsfalle
- `float` für Geldbeträge → Rundungsfehler; richtig `decimal`/`money`.
- `LEN` ignoriert nachfolgende Leerzeichen, `DATALENGTH` zählt Bytes (bei nvarchar doppelt).
- `DATEDIFF(year, '2025-12-31', '2026-01-01')` = 1, obwohl nur ein Tag vergangen ist.
- Datumsformat `'05/08/2026'` ist sprachabhängig (US vs. DE) – ISO nutzen.
- `TEXT`/`NTEXT` sind veraltet.
- `CHAR(10)` füllt mit Leerzeichen auf – Vergleiche/Speicher beachten.

## Grafik
### Implizite vs. explizite Konvertierung
1. Abfrage: WHERE smallint_spalte = 5 (int-Wert)
2. SQL-Server: Typ mit niedriger Priorität wird zum höheren Typ (int)
3. Anwender: sieht davon nichts (implizit)
4. Abfrage: CAST(unitprice AS int) in SELECT
5. SQL-Server: führt die Konvertierung explizit aus
### Funktionsaufruf
1. Abfrage -> Funktion: LEFT('Bochum', 3)
2. Funktion -> Abfrage: 'Boc'

## Lab
### SQL
Maschine: SQL-Server-VM (SSMS).
```
SELECT UPPER('hallo') AS gross, LEN('Haus') AS laenge, CHARINDEX('@','a@b.de') AS pos;
SELECT CAST(GETDATE() AS date) AS heute, DATEADD(day, 7, GETDATE()) AS in_einer_woche;
SELECT TRY_CAST('abc' AS int) AS ergebnis;   -- NULL
SELECT CONCAT('Max', ' ', NULL, 'Mustermann') AS name;
```

## Befehle
- `CAST(x AS int)` – Standard-Konvertierung
- `CONVERT(varchar(10), GETDATE(), 104)` – Format dd.mm.yyyy
- `TRY_CONVERT(date, '31.02.2026')` – NULL bei Fehler
- `DATEDIFF(day, a, b)` – Differenz in Tagen
- `SUBSTRING(x, 2, 3)` – 3 Zeichen ab Position 2
- `COALESCE(a, b, 0)` – erster Nicht-NULL-Wert

## Übungen
- A: E-Mail-Adresse „max@firma.de“: nur den Teil vor dem @ ausgeben. | L: SELECT LEFT(email, CHARINDEX('@', email) - 1) FROM t;
- A: Vor- und Nachname mit Leerzeichen verbinden, NULL-sicher. | L: SELECT CONCAT(vorname, ' ', nachname) FROM t;
- A: Alle Bestellungen der letzten 30 Tage. | L: WHERE orderdate >= DATEADD(day, -30, CAST(GETDATE() AS date))
- A: Warum ist float für Preise ungeeignet? | L: Ungenaue Gleitkommadarstellung → Rundungsfehler; decimal(p,s) speichert exakt.
- A: Unterschied CHAR und VARCHAR? | L: CHAR feste Länge (aufgefüllt), VARCHAR variable Länge (+2 Byte Verwaltung).

## Karteikarten
- F: Unterschied VARCHAR und NVARCHAR? | A: NVARCHAR speichert Unicode (2 Byte/Zeichen), Literale mit N'…'.
- F: Welcher Typ für Geldbeträge? | A: decimal(p,s) bzw. money/smallmoney (exakt), nicht float.
- F: Was liefert TRY_CAST bei Fehler? | A: NULL (statt Fehlermeldung).
- F: Unterschied CAST und CONVERT? | A: CAST ist ANSI-Standard, CONVERT T-SQL-spezifisch mit optionalem Format.
- F: LEN vs. DATALENGTH? | A: LEN = Zeichen ohne nachfolgende Leerzeichen; DATALENGTH = Bytes.
- F: Was ergibt 'Text' + NULL? | A: NULL; CONCAT behandelt NULL als leeren Text.
- F: Funktion für aktuelles Datum/Uhrzeit? | A: GETDATE(), SYSDATETIME(), CURRENT_TIMESTAMP.
- F: Datumsrechnung addieren/Differenz? | A: DATEADD(part, n, d) / DATEDIFF(part, start, ende).
- F: Wie wird Text ab Position extrahiert? | A: SUBSTRING(x, start, länge).
- F: Sprachunabhängiges Datumsliteral? | A: 'YYYYMMDD' bzw. 'YYYY-MM-DD'.

## Quiz
? Welcher Datentyp eignet sich für exakte Geldbeträge?
* decimal(10,2)
- float
- real
- bit

? Was gibt TRY_CAST('abc' AS int) zurück?
* NULL
- 0
- Einen Fehler
- 'abc'

? Wie viele Bytes belegt ein Zeichen in NVARCHAR?
* 2
- 1
- 4
- 8

? Welche Funktion ist ANSI-Standard?
* CAST
- CONVERT
- PARSE
- TRY_PARSE

? Was ergibt SELECT 'Hallo' + NULL?
* NULL
- 'Hallo'
- 'HalloNULL'
- Fehler

? Mit welcher Funktion findet man die Position eines Zeichens im Text?
* CHARINDEX
- SUBSTRING
- REPLACE
- LEN

? Was berechnet DATEDIFF(day, '2026-01-01', '2026-01-31')?
* 30
- 31
- 1
- 0

? Welcher Typ ist veraltet?
* TEXT
- VARCHAR(MAX)
- DATETIME2
- NVARCHAR(MAX)

## Lücken
- {CHAR} hat feste, {VARCHAR} variable Länge.
- Fehlgeschlagene Konvertierung liefert bei {TRY_CAST} den Wert NULL.

## Zuordnen
### Funktion und Wirkung
- UPPER => Großbuchstaben
- LEFT => Zeichen vom Anfang
- REPLACE => Ersetzen
- DATEADD => Datum verschieben
- COALESCE => erster Nicht-NULL-Wert

## Spickzettel
- char fest, varchar variabel, nvarchar Unicode
- CAST Standard, CONVERT Format, TRY_ = NULL bei Fehler
- SUBSTRING, LEFT, RIGHT, LEN, CHARINDEX, REPLACE
- DATEADD, DATEDIFF, GETDATE
- Text + NULL = NULL
