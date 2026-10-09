---
id: db-select-aggregate
bereich: Datenbanken
pruefungen: [Schule, AP2]
fach: SQL / Datenbanken
block: D2
kapitel: SQL Abfragen
titel: Aggregatfunktionen, GROUP BY und HAVING
stufe: Fortgeschritten
quellen: [select_04_aggregate.pdf, aufgaben_sql_employee_1.pdf]
verweise: [db-select-basics, db-select-join, db-select-unterabfragen]
---

## Profi

### Aggregatfunktionen
Liefern **einen Skalarwert** aus vielen Zeilen: `COUNT`, `SUM`, `AVG`, `MIN`, `MAX`, statistisch `STDEV`, `VAR`. Einsatz in SELECT, HAVING, ORDER BY – **nicht in WHERE**.
- **NULL wird ignoriert** (außer `COUNT(*)`): `COUNT(spalte)` zählt nur Nicht-NULL, `COUNT(*)` alle Zeilen. `AVG` teilt durch die Anzahl Nicht-NULL-Werte → ggf. verfälscht; `AVG(COALESCE(c2,0))` rechnet NULL als 0.
- `COUNT(DISTINCT custid)` zählt eindeutige Werte (anders als `SELECT DISTINCT`, das Zeilen entfernt).
```
SELECT AVG(unitprice) AS avg_price, MIN(qty) AS min_qty, MAX(discount) AS max_discount FROM Sales.OrderDetails;
```

### GROUP BY
Bildet Gruppen je eindeutiger Kombination der Gruppierungsspalten; danach arbeiten HAVING, SELECT und ORDER BY **mit Gruppen**, Detailzeilen sind weg.
Regel: **Jede Spalte in SELECT/HAVING/ORDER BY muss in GROUP BY stehen oder in einer Aggregatfunktion verwendet werden.**
```
SELECT empid, COUNT(*) AS cnt FROM Sales.Orders WHERE custid IN (1,2) GROUP BY empid;
SELECT empid, YEAR(orderdate) AS jahr, COUNT(*) FROM Sales.Orders GROUP BY empid, YEAR(orderdate);
```
Der Alias `jahr` darf in GROUP BY nicht verwendet werden (SELECT kommt später) – Ausdruck wiederholen.

### HAVING
Filtert **Gruppen** nach der Aggregation: `HAVING COUNT(*) > 10`. WHERE filtert **vorher** einzelne Zeilen (effizienter, wenn möglich dort filtern).
```
SELECT custid, SUM(qty*unitprice) AS umsatz FROM Sales.OrderDetails GROUP BY custid HAVING SUM(qty*unitprice) > 10000 ORDER BY umsatz DESC;
```

### Erweiterungen
`GROUP BY ROLLUP(a,b)` (Zwischen- und Gesamtsummen), `CUBE`, `GROUPING SETS`; Fensterfunktionen (`OVER (PARTITION BY …)`) behalten die Detailzeilen.

## Einfach

Stell dir vor, du hast eine lange Liste aller **Einkäufe der Klasse** (wer hat wann wie viel Geld ausgegeben). Du willst nicht alle 500 Zeilen lesen, sondern Zusammenfassungen:
- „Wie viele Einkäufe gab es?“ → **COUNT**
- „Wie viel Geld insgesamt?“ → **SUM**
- „Wie viel im Durchschnitt?“ → **AVG** (Mittelwert)
- „Der teuerste / der billigste Einkauf?“ → **MAX / MIN**

Das sind die **Aggregatfunktionen**: Sie quetschen viele Zeilen zu **einer Zahl** zusammen.

Mit **GROUP BY** machst du für **jeden Schüler einen eigenen Stapel**: „Pro Schüler: wie viel Geld?“ Der Computer sortiert alle Einkäufe auf Stapel (Gruppen) und rechnet dann pro Stapel. Danach sieht man nur noch **eine Zeile pro Stapel**.

**WHERE** schmeißt einzelne Einkäufe **vor** dem Stapeln weg („nur Einkäufe aus dem Mai“). **HAVING** schmeißt **ganze Stapel** weg, **nach** dem Rechnen („nur Schüler, die insgesamt mehr als 50 € ausgegeben haben“).

Achtung, Leer-Felder: **COUNT(\*)** zählt jede Zeile. **COUNT(spalte)** zählt nur Zeilen, in denen in dieser Spalte etwas steht. Leere Felder (NULL) werden bei SUM und AVG einfach übersprungen – dadurch kann der Durchschnitt höher sein, als man denkt.

## Merksatz
- **WHERE = vor dem Gruppieren (Zeilen), HAVING = nach dem Gruppieren (Gruppen).**
- Alles im SELECT, was nicht aggregiert ist, gehört in **GROUP BY**.
- **COUNT(\*) zählt Zeilen, COUNT(spalte) zählt Nicht-NULL.**
- Aggregate ignorieren NULL.

## Prüfungsfalle
- Aggregatfunktion in WHERE (`WHERE COUNT(*) > 3`) ist ein Fehler → HAVING.
- Spalte im SELECT ohne GROUP BY/Aggregat → Fehlermeldung.
- Alias im GROUP BY/HAVING nicht erlaubt.
- `AVG` bei NULL-Werten: Divisor zählt NULLs nicht mit.
- `COUNT(DISTINCT x)` ≠ `SELECT DISTINCT x`.
- `SUM` auf leerer Menge ergibt NULL, `COUNT` ergibt 0.

## Grafik
### GROUP BY Workflow
1. FROM: Tabelle Sales.Orders (alle Bestellungen)
2. WHERE: nur custid IN (1,2) bleibt übrig
3. GROUP BY: Zeilen werden in Stapel je empid sortiert
4. COUNT(*): pro Stapel wird gezählt
5. HAVING: Stapel mit zu kleinem Wert fliegen raus
6. SELECT und ORDER BY: Ergebnis mit einer Zeile je empid

## Lab
### SQL
Maschine: SQL-Server-VM (SSMS).
```
SELECT country, COUNT(*) AS anzahl FROM Sales.Customers GROUP BY country HAVING COUNT(*) > 5 ORDER BY anzahl DESC;
SELECT COUNT(*) AS alle, COUNT(region) AS mit_region FROM Sales.Customers;
```

## Befehle
- `COUNT(*)` – Anzahl Zeilen
- `SUM(spalte)` – Summe
- `AVG(spalte)` – Durchschnitt
- `MIN()/MAX()` – kleinster/größter Wert
- `GROUP BY spalte` – Gruppen bilden
- `HAVING bedingung` – Gruppen filtern

## Übungen
- A: Anzahl der Mitarbeiter je Abteilung. | L: SELECT abteilung, COUNT(*) FROM Employee GROUP BY abteilung;
- A: Durchschnittsgehalt je Abteilung, nur über 3000. | L: SELECT abteilung, AVG(gehalt) FROM Employee GROUP BY abteilung HAVING AVG(gehalt) > 3000;
- A: Höchstes und niedrigstes Gehalt insgesamt. | L: SELECT MAX(gehalt), MIN(gehalt) FROM Employee;
- A: Anzahl verschiedener Städte der Kunden. | L: SELECT COUNT(DISTINCT city) FROM Customers;
- A: Warum ist `WHERE SUM(x) > 5` falsch? | L: Aggregate sind in WHERE nicht erlaubt, weil WHERE vor GROUP BY läuft; HAVING verwenden.

## Karteikarten
- F: Welche Aggregatfunktionen kennt SQL? | A: COUNT, SUM, AVG, MIN, MAX (plus STDEV, VAR).
- F: COUNT(*) vs. COUNT(spalte)? | A: COUNT(*) zählt alle Zeilen, COUNT(spalte) nur Nicht-NULL.
- F: Wie behandeln Aggregate NULL? | A: Sie ignorieren NULL (außer COUNT(*)).
- F: WHERE vs. HAVING? | A: WHERE filtert Zeilen vor der Gruppierung, HAVING Gruppen danach.
- F: Welche Spalten dürfen im SELECT bei GROUP BY stehen? | A: Nur Gruppierungsspalten oder Aggregate.
- F: Was macht COUNT(DISTINCT x)? | A: Zählt eindeutige Werte.
- F: Kann ein SELECT-Alias in GROUP BY genutzt werden? | A: Nein, GROUP BY wird vor SELECT ausgewertet.
- F: Wie behandelt man NULL im Durchschnitt? | A: AVG(COALESCE(spalte,0)).
- F: Was liefert SUM über eine leere Menge? | A: NULL.

## Quiz
? Wo gehört eine Bedingung auf eine Aggregatfunktion hin?
* HAVING
- WHERE
- FROM
- GROUP BY

? Was zählt COUNT(*)?
* Alle Zeilen inkl. NULL-Zeilen
- Nur Nicht-NULL-Werte
- Nur eindeutige Werte
- Nur Spalten

? Was passiert mit NULL bei AVG?
* Wird ignoriert
- Wird als 0 gewertet
- Verursacht einen Fehler
- Ergibt NULL

? Welche Aussage zu GROUP BY stimmt?
* Nicht aggregierte SELECT-Spalten müssen in GROUP BY stehen
- Alle Spalten müssen aggregiert sein
- GROUP BY steht vor FROM
- GROUP BY ersetzt WHERE

? Was ist die logische Reihenfolge?
* WHERE vor GROUP BY vor HAVING
- HAVING vor WHERE
- GROUP BY vor WHERE
- SELECT vor FROM

? Was zählt COUNT(DISTINCT custid)?
* Eindeutige Kunden-IDs
- Alle Bestellungen
- Alle Zeilen
- Kunden mit NULL

? Was liefert MAX(gehalt) bei GROUP BY abteilung?
* Das höchste Gehalt je Abteilung
- Das höchste Gehalt insgesamt
- Die Abteilung mit dem höchsten Gehalt
- Alle Gehälter

? Welcher Operator erzeugt Zwischen- und Gesamtsummen?
* ROLLUP
- UNION
- INTERSECT
- TOP

## Lücken
- {COUNT(*)} zählt alle Zeilen, {COUNT(spalte)} nur Nicht-NULL-Werte.
- Gruppen filtert man mit {HAVING}.

## Spickzettel
- COUNT, SUM, AVG, MIN, MAX ignorieren NULL (außer COUNT(*))
- WHERE vor Gruppierung, HAVING nach
- SELECT-Spalten: GROUP BY oder Aggregat
- Alias nicht in WHERE/GROUP BY/HAVING
