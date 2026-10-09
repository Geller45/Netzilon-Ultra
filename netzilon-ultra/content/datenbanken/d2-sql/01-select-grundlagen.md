---
id: db-select-basics
bereich: Datenbanken
pruefungen: [Schule, AP1, AP2]
fach: SQL / Datenbanken
block: D2
kapitel: SQL Abfragen
titel: SELECT – Projektion, WHERE, NULL, LIKE, ORDER BY, TOP, OFFSET-FETCH
stufe: Einsteiger
quellen: [select_01_basics.pdf, select_02.pdf, sql_syntax_select.pdf, sql.pdf, Lernen_SQL.pdf, SQL_Lernen_1.pdf]
verweise: [db-select-funktionen, db-select-aggregate, db-select-join, db-einfuehrung]
---

## Profi

### Zentrale Klauseln
| Klausel | Rolle |
|---|---|
| SELECT | welche Spalten (Projektion) |
| FROM | welche Tabelle(n)/Sichten |
| WHERE | Zeilen filtern (Selektion) |
| GROUP BY | Zeilen zu Gruppen |
| HAVING | Gruppen filtern |
| ORDER BY | Sortieren |

**Logische Verarbeitungsreihenfolge** (nicht Schreibreihenfolge): 1 FROM → 2 WHERE → 3 GROUP BY → 4 HAVING → 5 SELECT → 6 ORDER BY. Folge: Spalten-Aliase aus SELECT sind in WHERE/HAVING **nicht** sichtbar, nur in ORDER BY.

### Grundform
```
SELECT companyname, country
FROM Sales.Customers;      -- Schema.Tabelle, Semikolon am Ende
SELECT * FROM Sales.Customers;   -- Vollprojektion (alle Spalten)
```
`SELECT DISTINCT` entfernt doppelte Ergebniszeilen. Berechnete (skalare) Spalten: `unitprice * qty AS total`. Operatoren: `+ - * / %`; Verkettung in T-SQL mit `+`.
**Aliase:** Spalten `AS name`, `name = ausdruck` oder ohne AS (fehleranfällig); Tabellen `FROM Sales.Orders AS SO`.

### Operatoren und Prädikate
Vergleich `= > < >= <= <> !=`, logisch `AND OR NOT` (AND vor OR, Klammern setzen!), Prädikate `IN`, `BETWEEN`, `LIKE`.
- `BETWEEN 10 AND 15` ist **inklusive** beider Grenzen (= `>=10 AND <=15`).
- `IN ('DE','AT','CH')` = mehrere OR-Vergleiche.
- Datum: `WHERE orderdate >= '2007-01-01' AND orderdate < '2008-01-01'` (halboffenes Intervall, sprachunabhängiges Format YYYY-MM-DD bzw. YYYYMMDD).

### LIKE – Mustersuche
`%` beliebig viele Zeichen, `_` genau ein Zeichen, `[abc]` ein Zeichen aus Liste, `[a-f]` Bereich, `[^abc]` nicht in Liste, `ESCAPE` für Platzhalter als Literal. Beispiel `WHERE description LIKE 'Sweet%'`; Namen mit „ei“ an zweiter Stelle: `LIKE '_ei%'`.

### NULL – dreiwertige Logik
NULL = „unbekannt/fehlt“. Vergleiche mit NULL ergeben **UNKNOWN** (nicht TRUE/FALSE), auch `NULL = NULL`. WHERE/ON/HAVING lassen nur TRUE durch. Prüfen **nur** mit `IS NULL` / `IS NOT NULL`, nie `= NULL`. ORDER BY und DISTINCT behandeln NULLs als gleich (NULL kommt bei ASC zuerst). CHECK-Constraints akzeptieren UNKNOWN. Funktionen: `ISNULL(a,b)`, `COALESCE(a,b,c)`.

### Sortieren
`ORDER BY spalte [ASC|DESC]` – ASC ist Standard; mehrere Spalten, Alias oder Position (nicht empfohlen). Ohne ORDER BY **keine garantierte Reihenfolge**.

### Ergebnismenge begrenzen
- `SELECT TOP (5) …` / `TOP (10) PERCENT` (aufgerundet), `WITH TIES` nimmt Gleichstände mit; T-SQL-spezifisch; mit ORDER BY kombinieren.
- `OFFSET … ROWS FETCH NEXT … ROWS ONLY` (SQL-Standard, ab SQL Server 2012) für **Paging**: `ORDER BY orderdate, orderid OFFSET 50 ROWS FETCH NEXT 50 ROWS ONLY;` – OFFSET ist Pflicht (0 möglich), ORDER BY eindeutig wählen.

### Andere Dialekte
MySQL/PostgreSQL: `LIMIT 5 OFFSET 10`; Oracle: `FETCH FIRST n ROWS ONLY`; Verkettung: `||` bzw. `CONCAT()`.

## Einfach

Eine Datenbank-Tabelle ist wie eine **große Excel-Liste**. Mit **SELECT** stellst du eine **Frage** an diese Liste – auf Englisch, fast wie ein Satz:

> „**Zeige mir** (SELECT) **Name und Land** **aus** (FROM) der Kundenliste, **wo** (WHERE) das Land Spanien ist, **sortiert nach** (ORDER BY) Name.“

Also: `SELECT name, land FROM kunden WHERE land = 'Spanien' ORDER BY name;`

- **SELECT** = welche **Spalten** (senkrecht) willst du sehen? `*` heißt „alle“.
- **WHERE** = welche **Zeilen** (waagerecht) willst du behalten? Wie ein Sieb.
- **ORDER BY** = in welcher **Reihenfolge**? ASC = A bis Z, DESC = Z bis A.
- **TOP 3** = nur die ersten drei, z. B. die 3 teuersten Produkte.
- **LIKE 'M%'** = „fängt mit M an“. Das Prozentzeichen ist ein Joker für „irgendwas“, der Unterstrich ist ein Joker für „genau ein Buchstabe“.
- **NULL** = „leer, weiß man nicht“. Das ist **nicht** null (Zahl 0) und auch kein leerer Text. Weil man es nicht weiß, kann man nicht sagen „ist gleich“. Deshalb fragt man: `IS NULL` („ist unbekannt?“).

Wichtig: Der Computer arbeitet die Befehle **nicht** in der Schreibreihenfolge ab. Erst holt er die Tabelle (FROM), dann siebt er (WHERE), und ganz zum Schluss wählt er die Spalten aus (SELECT) und sortiert.

## Merksatz
- **S-F-W-G-H-O**: SELECT, FROM, WHERE, GROUP BY, HAVING, ORDER BY (Schreibreihenfolge).
- Ausführung: **F-W-G-H-S-O** („Frisch Wird Gut Hergestellt, Sonst Ohne“).
- **NULL prüft man mit IS NULL, nie mit = NULL.**
- % = viele Zeichen, _ = ein Zeichen.
- BETWEEN schließt die Grenzen ein.

## Prüfungsfalle
- `WHERE spalte = NULL` liefert **nie** Zeilen – richtig: `IS NULL`.
- Alias aus SELECT in WHERE verwenden → Fehler (WHERE wird vor SELECT ausgewertet); in ORDER BY geht es.
- `AND` bindet stärker als `OR`: ohne Klammern entstehen falsche Ergebnisse.
- Ohne ORDER BY ist TOP nicht deterministisch.
- Enddatum bei Zeitstempeln: `<= '2007-12-31'` verliert den ganzen 31.12. nach 00:00 Uhr – besser `< '2008-01-01'`.
- Zahlen in Text verketten: erst CAST/CONVERT, sonst Fehler.
- NULL in Verkettung ergibt NULL (mit `+`), `CONCAT()` ersetzt durch leeren Text.

## Grafik
### Verarbeitungsreihenfolge einer Abfrage
1. FROM: Tabelle Sales.Customers laden
2. WHERE: nur Zeilen mit country = 'Spain' behalten
3. GROUP BY: (falls vorhanden) Gruppen bilden
4. HAVING: (falls vorhanden) Gruppen filtern
5. SELECT: Spalten companyname, country auswählen
6. ORDER BY: Ergebnis sortieren
### Abfrage an den Server
1. Client -> SQL-Server: SELECT companyname FROM Sales.Customers WHERE country = 'Spain'
2. SQL-Server: prüft Syntax und Rechte, erstellt Ausführungsplan
3. SQL-Server -> Tabelle: liest Zeilen (ggf. über Index)
4. Tabelle -> SQL-Server: passende Zeilen
5. SQL-Server -> Client: Ergebnismenge

## Lab
### SQL
Maschine: SQL-Server-VM (SSMS), Beispieldatenbank (TSQL/Northwind-ähnlich) oder eigene Tabelle Employee.
```
SELECT companyname, country FROM Sales.Customers WHERE country = 'Spain' ORDER BY companyname;
SELECT TOP (3) productname, unitprice FROM Production.Products ORDER BY unitprice DESC;
SELECT custid, region FROM Sales.Customers WHERE region IS NOT NULL;
SELECT orderid FROM Sales.Orders ORDER BY orderdate, orderid OFFSET 50 ROWS FETCH NEXT 50 ROWS ONLY;
```

## Befehle
- `SELECT DISTINCT spalte FROM t;` – doppelte Werte entfernen
- `WHERE x BETWEEN 10 AND 15` – Bereich inkl. Grenzen
- `WHERE name LIKE 'M%'` – Muster
- `WHERE x IS NULL` – NULL prüfen
- `ORDER BY a ASC, b DESC` – sortieren
- `SELECT TOP (5) WITH TIES …` – Top-N inkl. Gleichstand
- `OFFSET 0 ROWS FETCH NEXT 10 ROWS ONLY` – Paging

## Übungen
- A: Alle Kunden aus Deutschland, absteigend nach Stadt sortiert. | L: SELECT * FROM Customers WHERE country = 'Germany' ORDER BY city DESC;
- A: Alle Produkte mit Preis zwischen 10 und 15. | L: SELECT productname, unitprice FROM Products WHERE unitprice BETWEEN 10 AND 15;
- A: Kunden, deren Name mit „A“ beginnt und die keine Region haben. | L: SELECT * FROM Customers WHERE companyname LIKE 'A%' AND region IS NULL;
- A: Die 5 teuersten Produkte. | L: SELECT TOP (5) productname, unitprice FROM Products ORDER BY unitprice DESC;
- A: Bestellungen aus dem Jahr 2007. | L: WHERE orderdate >= '20070101' AND orderdate < '20080101'
- A: Seite 3 (je 20 Zeilen) einer Bestellliste. | L: ORDER BY orderid OFFSET 40 ROWS FETCH NEXT 20 ROWS ONLY;

## Karteikarten
- F: Logische Verarbeitungsreihenfolge einer SELECT-Anweisung? | A: FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY.
- F: Wofür steht `SELECT *`? | A: Alle Spalten (Vollprojektion).
- F: Wie prüft man auf NULL? | A: IS NULL / IS NOT NULL, nie = NULL.
- F: Was ergibt NULL = NULL? | A: UNKNOWN (nicht TRUE).
- F: Bedeutung von % und _ bei LIKE? | A: % beliebig viele Zeichen, _ genau ein Zeichen.
- F: Sind die Grenzen bei BETWEEN enthalten? | A: Ja, beide Grenzen sind enthalten.
- F: Wo sind Spalten-Aliase aus SELECT sichtbar? | A: Nur in ORDER BY (nicht in WHERE/HAVING/GROUP BY).
- F: Wie begrenzt man Zeilen in T-SQL? | A: TOP (n) bzw. OFFSET … FETCH NEXT … ROWS ONLY.
- F: Was macht DISTINCT? | A: Entfernt doppelte Ergebniszeilen.
- F: Standard-Sortierrichtung? | A: ASC (aufsteigend).
- F: Was ist der Unterschied WHERE und HAVING? | A: WHERE filtert Zeilen vor der Gruppierung, HAVING filtert Gruppen danach.

## Quiz
? Welche Klausel wird logisch als erste ausgewertet?
* FROM
- SELECT
- WHERE
- ORDER BY

? Wie fragt man korrekt auf fehlende Werte ab?
* WHERE region IS NULL
- WHERE region = NULL
- WHERE region == NULL
- WHERE region = ''

? Was liefert LIKE '_a%'?
* Werte, deren zweites Zeichen ein a ist
- Werte, die mit a beginnen
- Werte, die auf a enden
- Werte, die genau zwei Zeichen haben

? Was gilt für BETWEEN 10 AND 15?
* 10 und 15 sind eingeschlossen
- 10 und 15 sind ausgeschlossen
- Nur 10 ist eingeschlossen
- Nur 15 ist eingeschlossen

? Wo kann ein Spaltenalias aus der SELECT-Liste verwendet werden?
* In ORDER BY
- In WHERE
- In FROM
- In HAVING

? Was ergibt ein Vergleich mit NULL?
* UNKNOWN
- TRUE
- FALSE
- 0

? Wozu dient OFFSET … FETCH?
* Seitenweises Abrufen (Paging) eines Zeilenbereichs
- Verbinden von Tabellen
- Gruppieren von Zeilen
- Löschen von Zeilen

? Was macht SELECT DISTINCT?
* Entfernt doppelte Ergebniszeilen
- Sortiert das Ergebnis
- Zählt die Zeilen
- Löscht doppelte Zeilen in der Tabelle

## Lücken
- Mit {WHERE} filtert man Zeilen, mit {HAVING} filtert man Gruppen.
- Auf NULL prüft man mit {IS NULL}.
- Das Prozentzeichen bei LIKE steht für {beliebig viele} Zeichen.

## Reihenfolge
### Logische Verarbeitung von SELECT
1. FROM
2. WHERE
3. GROUP BY
4. HAVING
5. SELECT
6. ORDER BY

## Zuordnen
### Klausel und Aufgabe
- SELECT => Spalten auswählen
- WHERE => Zeilen filtern
- GROUP BY => Gruppen bilden
- HAVING => Gruppen filtern
- ORDER BY => sortieren

## Freitext
- F: Erläutern Sie, warum ein Spaltenalias nicht in der WHERE-Klausel verwendet werden kann. | M: WHERE wird logisch vor SELECT verarbeitet, der Alias existiert zu diesem Zeitpunkt noch nicht; nur ORDER BY wird nach SELECT ausgewertet. | P: 2

## Spickzettel
- Reihenfolge: FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY
- NULL: IS NULL / IS NOT NULL
- LIKE: % viele, _ eines; BETWEEN inklusiv
- TOP (n) / OFFSET … FETCH
- AND vor OR – Klammern!
