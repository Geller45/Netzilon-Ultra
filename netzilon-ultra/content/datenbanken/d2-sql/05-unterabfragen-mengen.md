---
id: db-select-unterabfragen
bereich: Datenbanken
pruefungen: [Schule, AP2]
fach: SQL / Datenbanken
block: D2
kapitel: SQL Abfragen
titel: Unterabfragen, EXISTS und Mengenoperatoren (UNION, INTERSECT, EXCEPT)
stufe: Profi
quellen: [select_05_unterabfragen.pdf]
verweise: [db-select-join, db-select-aggregate]
---

## Profi

### Unterabfragen (Subqueries)
Eine Abfrage innerhalb einer anderen, in Klammern. Arten:
- **Skalar**: genau ein Wert, überall verwendbar, wo ein Einzelwert steht. Leere Menge → NULL.
  `WHERE orderid = (SELECT MAX(orderid) FROM Sales.Orders)`
- **Mehrwertig** (eine Spalte, mehrere Zeilen): mit `IN`, `ANY`, `ALL`.
  `WHERE custid IN (SELECT custid FROM Sales.Customers WHERE country = 'Mexico')`
  `IN` ≙ `= ANY`; `NOT IN` ≙ `<> ALL`. Kann oft auch als JOIN geschrieben werden – Performance testen.
- **Korreliert**: verweist auf die äußere Abfrage, nicht eigenständig ausführbar, logisch „einmal je äußere Zeile“.
```
SELECT orderid, empid, orderdate FROM Sales.Orders AS O1
WHERE orderdate = (SELECT MAX(orderdate) FROM Sales.Orders AS O2 WHERE O2.empid = O1.empid);
```
- **Tabellenwertig / abgeleitete Tabelle** in FROM: `FROM (SELECT …) AS d`; **CTE**: `WITH cte AS (SELECT …) SELECT … FROM cte`.

### EXISTS
Existenztest, liefert nur TRUE/FALSE (nie UNKNOWN), Unterabfrage-Select meist `*`:
`WHERE EXISTS (SELECT * FROM Sales.Orders o WHERE o.custid = c.custid)` (Kunden mit Bestellung); `NOT EXISTS` (ohne Bestellung). **NOT IN** ist gefährlich, wenn die Unterabfrage NULL enthält (Ergebnis dann leer) – **NOT EXISTS ist sicherer**.

### Mengenoperatoren
Beide Abfragen brauchen gleich viele Spalten mit kompatiblen Typen; ORDER BY nur am Ende der Gesamtabfrage; Spaltennamen kommen von der ersten Abfrage.
| Operator | Ergebnis |
|---|---|
| `UNION` | Vereinigung ohne Duplikate (kostet Sortier-/Vergleichsaufwand) |
| `UNION ALL` | Vereinigung mit allen Zeilen (schneller) |
| `INTERSECT` | nur Zeilen in beiden Mengen |
| `EXCEPT` | Zeilen der ersten, die nicht in der zweiten sind (Oracle: MINUS) |

## Einfach

Eine **Unterabfrage** ist eine **Frage in der Frage**. Du fragst nicht direkt, sondern brauchst zuerst eine Teilantwort:

> „Zeige alle Bestellungen **des Kunden, der am meisten gekauft hat**.“
> Erst muss man herausfinden, **wer** das ist (Frage 1, innen in Klammern), dann kann man dessen Bestellungen suchen (Frage 2, außen).

Wie bei den Matroschka-Puppen: innen steckt die kleine Frage.

- **Skalar** = die innere Frage hat **eine** Antwort (z. B. die höchste Nummer).
- **IN** = die innere Frage liefert eine **Liste**, und du prüfst: „Ist mein Wert in der Liste?“
- **EXISTS** = „Gibt es überhaupt irgendeinen Treffer?“ Nur ja oder nein. Wie beim Türklingeln: Du willst nicht wissen, **wer** da ist, nur **ob** jemand zu Hause ist.
- **Korreliert** = die innere Frage schaut bei jeder Zeile der äußeren Frage nach: „Wie sieht es für **diesen** Kunden aus?“

**Mengenoperatoren** sind wie bei Mengen in Mathe: Zwei Listen werden zusammengeworfen (**UNION** – Doppelte fliegen raus; **UNION ALL** – alles bleibt), nur das Gemeinsame genommen (**INTERSECT**) oder von der ersten Liste die Dinge der zweiten abgezogen (**EXCEPT**). Beide Listen müssen dieselbe Anzahl Spalten haben, sonst passt es nicht zusammen, wie wenn man Äpfel und Birnen in eine Tabelle mit unterschiedlich vielen Spalten stecken will.

## Merksatz
- **IN = ANY, NOT IN = ALL.**
- **EXISTS fragt nur „gibt es“ – nie UNKNOWN.**
- **UNION ALL ist schneller als UNION.**
- Korreliert = bezieht sich auf die äußere Zeile.

## Prüfungsfalle
- `NOT IN` mit NULL in der Unterabfrage liefert **keine** Zeilen – NOT EXISTS verwenden.
- Skalar-Unterabfrage mit mehreren Ergebniszeilen → Fehler.
- Bei UNION müssen Spaltenanzahl und Typen passen; ORDER BY nur am Ende.
- `UNION` entfernt Duplikate (auch innerhalb einer Abfrage), `UNION ALL` nicht.
- Reihenfolge bei EXCEPT beachten (A EXCEPT B ≠ B EXCEPT A).

## Grafik
### Ablauf einer korrelierten Unterabfrage
1. Äußere Abfrage: nimmt Zeile 1 (Kunde 1)
2. Äußere Abfrage -> Innere Abfrage: übergibt custid = 1
3. Innere Abfrage: MAX(orderdate) für Kunde 1
4. Innere Abfrage -> Äußere Abfrage: Datum der letzten Bestellung
5. Äußere Abfrage: vergleicht und nimmt nächste Zeile

## Lab
### SQL
Maschine: SQL-Server-VM (SSMS).
```
SELECT custid, companyname FROM Sales.Customers c WHERE NOT EXISTS (SELECT * FROM Sales.Orders o WHERE o.custid = c.custid);
SELECT country, city FROM HR.Employees UNION SELECT country, city FROM Sales.Customers;
SELECT country FROM HR.Employees INTERSECT SELECT country FROM Sales.Customers;
```

## Befehle
- `WHERE x IN (SELECT …)` – Wert in Liste
- `WHERE x > ALL (SELECT …)` – größer als alle
- `WHERE EXISTS (SELECT * FROM … WHERE …)` – Existenztest
- `UNION / UNION ALL / INTERSECT / EXCEPT` – Mengenoperatoren

## Übungen
- A: Produkte, die teurer als der Durchschnittspreis sind. | L: SELECT * FROM Products WHERE unitprice > (SELECT AVG(unitprice) FROM Products);
- A: Kunden aus Ländern, in denen auch Mitarbeiter wohnen. | L: … WHERE country IN (SELECT country FROM HR.Employees)
- A: Kunden, die noch nie bestellt haben (mit NOT EXISTS). | L: siehe Lab
- A: Städte, die bei Kunden und Mitarbeitern vorkommen. | L: SELECT city FROM Customers INTERSECT SELECT city FROM Employees;

## Karteikarten
- F: Was ist eine skalare Unterabfrage? | A: Unterabfrage mit genau einem Wert (eine Zeile, eine Spalte).
- F: Was ist eine korrelierte Unterabfrage? | A: Sie verweist auf die äußere Abfrage und ist nicht eigenständig ausführbar.
- F: IN entspricht welchem Operator? | A: = ANY.
- F: NOT IN entspricht? | A: <> ALL.
- F: Was gibt EXISTS zurück? | A: TRUE oder FALSE, nie UNKNOWN.
- F: UNION vs. UNION ALL? | A: UNION entfernt Duplikate, UNION ALL behält alle (schneller).
- F: Was macht INTERSECT? | A: Liefert nur Zeilen, die in beiden Ergebnismengen vorkommen.
- F: Was macht EXCEPT? | A: Zeilen der ersten Menge, die nicht in der zweiten vorkommen.
- F: Warum ist NOT IN gefährlich? | A: Enthält die Unterabfrage NULL, liefert NOT IN keine Zeilen.

## Quiz
? Welcher Operator erzeugt die Vereinigung ohne Duplikate?
* UNION
- UNION ALL
- INTERSECT
- EXCEPT

? Was gibt EXISTS zurück?
* TRUE oder FALSE
- Die Zeilen der Unterabfrage
- Die Anzahl der Zeilen
- UNKNOWN bei NULL

? Was ist eine korrelierte Unterabfrage?
* Eine Unterabfrage, die auf Spalten der äußeren Abfrage Bezug nimmt
- Eine Unterabfrage ohne WHERE
- Eine Unterabfrage mit UNION
- Eine Unterabfrage in FROM

? Wozu passt IN?
* Mehrwertige Unterabfrage
- Nur skalare Unterabfrage
- Nur Joins
- Nur GROUP BY

? Welche Anforderung gilt für UNION?
* Gleiche Spaltenanzahl und kompatible Typen
- Gleiche Spaltennamen
- Gleiche Tabellen
- Mindestens ein Index

? Was macht EXCEPT?
* Differenz der Mengen
- Schnittmenge
- Vereinigung
- Kreuzprodukt

? Wo darf ORDER BY bei UNION stehen?
* Nur am Ende der Gesamtabfrage
- In jeder Teilabfrage
- Nur in der ersten Teilabfrage
- Gar nicht

? Was passiert bei NOT IN (SELECT x …), wenn x NULL enthält?
* Das Ergebnis ist leer
- Alle Zeilen werden geliefert
- Es entsteht ein Syntaxfehler
- NULL wird ignoriert

## Lücken
- Mit {EXISTS} prüft man, ob die Unterabfrage Zeilen liefert.
- {UNION ALL} behält Duplikate und ist schneller als UNION.

## Spickzettel
- Subquery: skalar / mehrwertig / korreliert
- IN = ANY, NOT IN = ALL, NOT EXISTS sicherer
- UNION (distinct), UNION ALL, INTERSECT, EXCEPT
