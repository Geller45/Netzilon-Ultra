---
id: db-select-join
bereich: Datenbanken
pruefungen: [Schule, AP2]
fach: SQL / Datenbanken
block: D2
kapitel: SQL Abfragen
titel: JOINs – INNER, LEFT, RIGHT, FULL, CROSS, Self Join
stufe: Fortgeschritten
quellen: [select_06_joins.pdf, select_join__veranschaulichung.pdf]
verweise: [db-select-basics, db-select-aggregate, db-erd-tabelle]
---

## Profi

### Idee
Die FROM-Klausel erzeugt eine **virtuelle Tabelle**. Ein JOIN verbindet Zeilen zweier Tabellen über ein **Join-Prädikat** (meist PK = FK). Alle Joins beginnen logisch mit dem **kartesischen Produkt** (jede Zeile mit jeder: 3 × 3 = 9 Zeilen) und filtern/ergänzen dann.

| Jointyp | Ergebnis |
|---|---|
| **CROSS JOIN** | kartesisches Produkt, alle Kombinationen (meist unerwünscht) |
| **INNER JOIN** | nur Zeilen mit Übereinstimmung in **beiden** Tabellen |
| **LEFT [OUTER] JOIN** | alle Zeilen der **linken** Tabelle + passende rechte; sonst NULL |
| **RIGHT [OUTER] JOIN** | alle Zeilen der **rechten** Tabelle + passende linke; sonst NULL |
| **FULL [OUTER] JOIN** | alle Zeilen beider Seiten; fehlende Seite = NULL |

### Syntax
ANSI SQL-92 (bevorzugt): `FROM t1 [INNER] JOIN t2 ON t1.spalte = t2.spalte`. Veraltet SQL-89: `FROM t1, t2 WHERE …` – vergisst man die Bedingung, entsteht ungewollt ein kartesisches Produkt. Tabellen-Aliase verwenden; Reihenfolge bei INNER JOIN irrelevant. Ist der Operator `=`, spricht man von **Equijoin**.
```
SELECT o.orderid, o.orderdate, od.productid, od.unitprice, od.qty
FROM Sales.Orders AS o JOIN Sales.OrderDetails AS od ON o.orderid = od.orderid;
```
Zusammengesetzter Join: `ON c.city = e.city AND c.country = e.country`.

### Outer Join in der Praxis
- Alle Kunden mit Bestellungen, wenn vorhanden: `FROM Customers c LEFT JOIN Orders o ON c.custid = o.custid`.
- **Kunden ohne Bestellung** (Anti-Join): `… LEFT JOIN Orders o ON … WHERE o.orderid IS NULL`.
- Filter auf die **optionale** Tabelle gehört in **ON**, nicht in WHERE – sonst wird der Outer Join faktisch zum Inner Join.

### Mehrere Tabellen und Self Join
```
SELECT c.companyname, o.orderid, p.productname
FROM Sales.Customers c
JOIN Sales.Orders o ON c.custid = o.custid
JOIN Sales.OrderDetails od ON o.orderid = od.orderid
JOIN Production.Products p ON od.productid = p.productid;
```
**Self Join** (Tabelle mit sich selbst, Aliase zwingend): `SELECT m.name AS Mitarbeiter, v.name AS Vorgesetzter FROM Mitarbeiter m LEFT JOIN Mitarbeiter v ON m.vorgesetzter_id = v.id;`

Veranschaulichung Land/Region: Inner Join liefert nur Länder mit passender Region (China ohne Region fällt weg), Left Join behält China mit NULL, Right Join behält Region „Afrika“ ohne Land.

## Einfach

Stell dir **zwei Listen** vor: Links die **Länder** (Deutschland, Frankreich, USA, China), rechts die **Regionen** (Europa, Amerika, Afrika). Jedes Land hat eine Nummer, die zur Region passt. Ein **JOIN** ist wie ein **Reißverschluss**: Er verbindet die Zeilen, bei denen die Nummern zusammenpassen.

- **INNER JOIN** = „Zeig mir nur die, die einen Partner gefunden haben.“ Deutschland–Europa, USA–Amerika. China hat keine Region und fällt weg. Afrika hat kein Land und fällt auch weg.
- **LEFT JOIN** = „Alle von der **linken** Liste, auch ohne Partner.“ China bleibt dabei, rechts steht NULL (= leer).
- **RIGHT JOIN** = „Alle von der **rechten** Liste.“ Afrika bleibt, links steht NULL.
- **FULL JOIN** = „Von beiden alle.“
- **CROSS JOIN** = „Jeder mit jedem.“ Wie wenn jedes Kind mit jedem anderen ein Händchen-Foto macht. 10 Kinder × 10 Kinder = 100 Fotos – meistens viel zu viel!

Der Satz nach **ON** sagt, was zusammenpasst: `ON land.regionnr = region.regionnr`. Vergisst du ihn, passt plötzlich alles mit allem zusammen – das ist der häufigste Anfängerfehler.

Tipp zum Merken: Schreibe die Tabelle, von der du **alle** Zeilen willst, nach links und nimm **LEFT JOIN**. Willst du wissen, wer **keinen** Partner hat (Kunden ohne Bestellung)? Dann LEFT JOIN und danach prüfen, wo rechts **NULL** steht.

## Merksatz
- **INNER = Schnittmenge, LEFT = links komplett, RIGHT = rechts komplett, FULL = beides.**
- **Ohne ON-Bedingung: kartesisches Produkt.**
- **Anti-Join: LEFT JOIN + WHERE rechts IS NULL.**
- Join über **PK = FK**.

## Prüfungsfalle
- Filter auf die rechte Tabelle in WHERE (statt ON) macht aus LEFT JOIN einen INNER JOIN.
- `FROM a, b` ohne WHERE → kartesisches Produkt (n × m Zeilen).
- Mehrdeutige Spaltennamen (z. B. custid in beiden Tabellen) → Alias-Präfix nötig.
- NULL = NULL verbindet nicht: Zeilen mit NULL im Join-Schlüssel finden keinen Partner.
- Bei Left-Joins mit COUNT: `COUNT(o.orderid)` statt `COUNT(*)`, sonst wird 1 für Kunden ohne Bestellung gezählt.
- 1:n-Join vervielfacht Zeilen der 1-Seite.

## Grafik
### Join verbindet Länder und Regionen
1. Land: Deutschland, Frankreich, USA, China mit RegionKey 1, 1, 2, 3
2. Region: EU = 1, Amerika = 2, Afrika = 4
3. Land -> Region: ON land.RegionKey = region.RegionKey
4. Inner Join: Deutschland-EU, Frankreich-EU, USA-Amerika
5. Left Join: zusätzlich China mit NULL
6. Right Join: zusätzlich Afrika mit NULL

## Lab
### SQL
Maschine: SQL-Server-VM (SSMS).
```
CREATE TABLE Region (RegionKey INT PRIMARY KEY, Name VARCHAR(20));
CREATE TABLE Land (Land VARCHAR(30), RegionKey INT);
INSERT INTO Region VALUES (1,'EU'),(2,'Amerika'),(4,'Afrika');
INSERT INTO Land VALUES ('Deutschland',1),('Frankreich',1),('USA',2),('China',3);
SELECT l.Land, r.Name FROM Land l INNER JOIN Region r ON l.RegionKey = r.RegionKey;
SELECT l.Land, r.Name FROM Land l LEFT JOIN Region r ON l.RegionKey = r.RegionKey;
SELECT l.Land, r.Name FROM Land l FULL JOIN Region r ON l.RegionKey = r.RegionKey;
```

## Befehle
- `INNER JOIN … ON a.x = b.x` – nur Treffer
- `LEFT JOIN` / `RIGHT JOIN` / `FULL JOIN` – äußere Verbunde
- `CROSS JOIN` – kartesisches Produkt
- `WHERE b.id IS NULL` – nach LEFT JOIN: Zeilen ohne Partner

## Übungen
- A: Alle Kunden mit ihren Bestellungen (nur Kunden mit Bestellung). | L: SELECT c.companyname, o.orderid FROM Customers c INNER JOIN Orders o ON c.custid = o.custid;
- A: Alle Kunden, auch ohne Bestellung. | L: … FROM Customers c LEFT JOIN Orders o ON c.custid = o.custid;
- A: Nur Kunden OHNE Bestellung. | L: LEFT JOIN … WHERE o.orderid IS NULL
- A: Wie viele Bestellungen hat jeder Kunde (auch 0)? | L: SELECT c.custid, COUNT(o.orderid) FROM Customers c LEFT JOIN Orders o ON c.custid = o.custid GROUP BY c.custid;
- A: Mitarbeiter mit Namen des Vorgesetzten. | L: Self Join Mitarbeiter m LEFT JOIN Mitarbeiter v ON m.vorgesetzter_id = v.id

## Karteikarten
- F: Was liefert ein INNER JOIN? | A: Nur Zeilen mit Übereinstimmung in beiden Tabellen.
- F: Was liefert ein LEFT JOIN? | A: Alle Zeilen der linken Tabelle, passende der rechten, sonst NULL.
- F: Was liefert ein FULL JOIN? | A: Alle Zeilen beider Tabellen, nicht passende mit NULL ergänzt.
- F: Was ist ein CROSS JOIN? | A: Kartesisches Produkt – jede Zeile mit jeder.
- F: Was ist ein Equijoin? | A: Join mit Gleichheit (=) als Prädikat.
- F: Wie findet man Zeilen ohne Partner? | A: LEFT JOIN und WHERE rechte_Spalte IS NULL.
- F: Was ist ein Self Join? | A: Join einer Tabelle mit sich selbst (Aliase nötig), z. B. Mitarbeiter–Vorgesetzter.
- F: Warum ON statt WHERE für Join-Bedingung? | A: Trennung von Verknüpfung und Filter; bei Outer Joins ändert WHERE das Ergebnis.
- F: Welche Syntax ist bevorzugt? | A: ANSI SQL-92 mit JOIN … ON.
- F: Was droht bei FROM a, b ohne WHERE? | A: Kartesisches Produkt.

## Quiz
? Welcher Join liefert alle Zeilen der linken Tabelle?
* LEFT JOIN
- INNER JOIN
- CROSS JOIN
- RIGHT JOIN

? Wie viele Zeilen hat ein CROSS JOIN von 4 × 5 Zeilen?
* 20
- 9
- 5
- 4

? Wie findet man Kunden ohne Bestellung?
* LEFT JOIN und WHERE o.orderid IS NULL
- INNER JOIN und WHERE o.orderid IS NULL
- CROSS JOIN
- GROUP BY

? Was bewirkt ein Filter auf die rechte Tabelle in WHERE bei einem LEFT JOIN?
* Er macht den Join faktisch zum INNER JOIN
- Er beschleunigt den Join nur
- Er ändert nichts
- Er erzeugt ein kartesisches Produkt

? Was verbindet ein JOIN üblicherweise?
* Primärschlüssel mit Fremdschlüssel
- Zwei Primärschlüssel
- Zwei Aliase
- Zwei Datenbanken

? Welcher Join gibt auch nicht passende Zeilen beider Seiten aus?
* FULL OUTER JOIN
- INNER JOIN
- LEFT JOIN
- CROSS JOIN

? Warum sind Aliase beim Self Join zwingend?
* Weil dieselbe Tabelle zweimal vorkommt
- Weil sonst kein Index genutzt wird
- Weil NULL sonst fehlt
- Es sind keine nötig

? Was ist bei COUNT(*) im LEFT JOIN problematisch?
* Kunden ohne Bestellung werden als 1 gezählt
- COUNT(*) funktioniert nicht
- Es entsteht ein Fehler
- Es werden NULLs entfernt

## Lücken
- Ein {INNER} JOIN liefert nur Treffer, ein {LEFT} JOIN alle Zeilen der linken Tabelle.
- Ohne Join-Bedingung entsteht ein {kartesisches Produkt}.

## Zuordnen
### Jointyp und Ergebnis
- INNER JOIN => nur Übereinstimmungen
- LEFT JOIN => links komplett
- RIGHT JOIN => rechts komplett
- FULL JOIN => beide komplett
- CROSS JOIN => alle Kombinationen

## Spickzettel
- INNER nur Treffer; LEFT/RIGHT/FULL behalten Seite(n) + NULL
- ON a.PK = b.FK
- Anti-Join: LEFT JOIN + IS NULL
- Ohne ON → kartesisches Produkt
