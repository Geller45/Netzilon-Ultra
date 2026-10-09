---
id: db-labor-joins
bereich: Datenbanken
block: D4
kapitel: SQL-Labor (Firmen-DB)
titel: JOINs – Tabellen verknüpfen (INNER, LEFT, RIGHT, FULL, CROSS, Self-Join)
stufe: Fortgeschritten
fach: SQL / Datenbanken
pruefungen: [AP1, AP2, Schule]
quellen: [SQLite-Dokumentation, Microsoft Learn – T-SQL]
verweise: [db-select-join, db-erd-tabelle, db-normalisierung, db-labor-select, db-labor-aggregate, db-labor-unterabfragen]
---

## Profi

### Warum Joins?
Nach der Normalisierung liegen zusammengehörige Daten in **verschiedenen Tabellen** und sind über **Fremdschlüssel (foreign key)** verbunden. In der Firmen-DB der **Netzilon GmbH** verweist z. B. `mitarbeiter.abt_id` auf `abteilungen.abt_id`, `abteilungen.standort_id` auf `standorte.standort_id`, `bestellungen.kunde_id` auf `kunden.kunde_id`. Ein **Join** setzt die Zeilen über diese Beziehung wieder zusammen. Probier es im SQL-Labor (Werkzeuge) aus.

### INNER JOIN – nur passende Paare
```sql
SELECT m.vorname, m.nachname, a.name AS abteilung
FROM mitarbeiter AS m
INNER JOIN abteilungen AS a ON a.abt_id = m.abt_id
ORDER BY a.name, m.nachname;
```
Liefert nur Mitarbeitende **mit** Abteilung – die 2 ohne abt_id fehlen. `JOIN` allein bedeutet `INNER JOIN`.

### LEFT (OUTER) JOIN – alle von links
```sql
SELECT m.vorname, m.nachname, a.name AS abteilung
FROM mitarbeiter m
LEFT JOIN abteilungen a ON a.abt_id = m.abt_id;
```
Alle 100 Mitarbeitenden erscheinen; bei fehlender Abteilung ist `abteilung` NULL.
**Anti-Join** („wer hat **keinen** Partner?“) – z. B. Kunden ohne Bestellung:
```sql
SELECT k.kunde_id, k.firma
FROM kunden k
LEFT JOIN bestellungen b ON b.kunde_id = k.kunde_id
WHERE b.best_id IS NULL;
```
In der Firmen-DB gibt es genau **einen** Kunden ohne Bestellung und **einen** Artikel, der nie bestellt wurde.

### RIGHT und FULL (OUTER) JOIN
- `RIGHT JOIN` = alle Zeilen der **rechten** Tabelle; entspricht einem LEFT JOIN mit vertauschten Tabellen.
- `FULL JOIN` = alle Zeilen **beider** Seiten, fehlende Partner mit NULL.
- **SQLite** unterstützt RIGHT und FULL OUTER JOIN erst **ab Version 3.39** (2022). Das SQL-Labor nutzt sql.js 1.10 mit **SQLite 3.45** → beide funktionieren. Ältere SQLite-Versionen: nur LEFT JOIN (FULL per `LEFT JOIN … UNION … LEFT JOIN` mit vertauschten Seiten nachbauen).
```sql
-- Alle Abteilungen und alle Mitarbeitenden, auch ohne Partner
SELECT a.name, m.nachname
FROM abteilungen a
FULL OUTER JOIN mitarbeiter m ON m.abt_id = a.abt_id;
```

### CROSS JOIN – kartesisches Produkt
`SELECT s.stadt, a.kategorie FROM standorte s CROSS JOIN (SELECT DISTINCT kategorie FROM artikel) a;` kombiniert **jede** Zeile mit **jeder** (6 Standorte × n Kategorien). Sinnvoll für Kombinationstabellen (z. B. Raster „Standort × Kategorie“), sonst meist ein Fehler.

### Self-Join – Tabelle mit sich selbst
`mitarbeiter.vorgesetzter_id` zeigt auf `mitarbeiter.ma_id`. Für „Mitarbeiter + Vorgesetzter“ wird die Tabelle **zweimal** mit verschiedenen Aliasen eingebunden:
```sql
SELECT m.vorname || ' ' || m.nachname AS mitarbeiter,
       v.vorname || ' ' || v.nachname AS vorgesetzter
FROM mitarbeiter m
LEFT JOIN mitarbeiter v ON v.ma_id = m.vorgesetzter_id
ORDER BY vorgesetzter, mitarbeiter;
```
LEFT JOIN, damit die Geschäftsführung (kein Vorgesetzter) nicht verschwindet.

### Mehrfach-Join
Jeder weitere Join braucht eine eigene ON-Bedingung. Mitarbeitende mit Abteilung und Standort:
```sql
SELECT m.nachname, a.name AS abteilung, s.stadt
FROM mitarbeiter m
JOIN abteilungen a ON a.abt_id = m.abt_id
JOIN standorte  s ON s.standort_id = a.standort_id;
```
Umsatz je Kunde über drei Tabellen:
```sql
SELECT k.firma, ROUND(SUM(p.menge * p.einzelpreis), 2) AS umsatz
FROM kunden k
JOIN bestellungen b      ON b.kunde_id = k.kunde_id
JOIN bestellpositionen p ON p.best_id = b.best_id
WHERE b.status <> 'storniert'
GROUP BY k.kunde_id, k.firma
ORDER BY umsatz DESC;
```
Auflösungstabelle (m:n): `projekt_mitarbeiter` verbindet `projekte` und `mitarbeiter`:
```sql
SELECT p.name AS projekt, m.nachname, pm.rolle
FROM projekte p
JOIN projekt_mitarbeiter pm ON pm.projekt_id = p.projekt_id
JOIN mitarbeiter m          ON m.ma_id = pm.ma_id
ORDER BY p.name;
```

### Typische Fehler
- **Vergessene Join-Bedingung** → kartesisches Produkt: `FROM mitarbeiter, abteilungen` ohne WHERE liefert 100 × 10 = **1000** Zeilen.
- **Falsche Spalten** verknüpft (`ON a.abt_id = m.ma_id`) → syntaktisch korrekt, inhaltlich Unsinn.
- **Mehrdeutige Spaltennamen**: `name` gibt es in `abteilungen` und `projekte`, `budget` in `abteilungen` und `projekte`, `email` in `mitarbeiter` und `kunden` → immer mit Alias qualifizieren (`a.name`), sonst Fehler „ambiguous column name“.
- **LEFT JOIN + WHERE auf rechte Tabelle** macht ihn zum INNER JOIN: `LEFT JOIN abteilungen a … WHERE a.name = 'Vertrieb'` wirft die NULL-Zeilen weg. Bedingung für die rechte Seite gehört dann in die **ON-Klausel**.
- **Zeilenvervielfachung**: Join über 1:n-Beziehungen vervielfacht Zeilen – `SUM(a.budget)` nach Join mit mitarbeiter zählt das Abteilungsbudget pro Mitarbeitendem mehrfach.

### Alte Join-Syntax
`FROM mitarbeiter m, abteilungen a WHERE a.abt_id = m.abt_id` (Theta-/implizite Join-Syntax, SQL-89) liefert dasselbe wie INNER JOIN, vermischt aber Join- und Filterbedingung. Für Outer Joins gab es herstellerspezifische Syntax (`*=` in altem SQL Server – längst entfernt).

### T-SQL-Unterschied
| Thema | SQLite 3.45 (SQL-Labor) | T-SQL (SQL Server) |
|---|---|---|
| RIGHT/FULL OUTER JOIN | ab 3.39 unterstützt, ältere Versionen nicht | seit jeher unterstützt |
| Verkettung im Self-Join | `m.vorname \|\| ' ' \|\| m.nachname` | `CONCAT(m.vorname, ' ', m.nachname)` |
| Zeilenweiser Join mit Funktion | `JOIN json_each(...)`, kein APPLY | `CROSS APPLY` / `OUTER APPLY` (z. B. Top-3-Bestellungen je Kunde) |
| Join-Hinweise | keine (nur `CROSS JOIN` erzwingt Reihenfolge) | `INNER HASH JOIN`, `OPTION (LOOP JOIN)` – nur in Ausnahmefällen |
| Schema-Präfix | keins (Hauptdatenbank `main`) | `dbo.mitarbeiter` empfohlen |
| `NATURAL JOIN` / `USING (abt_id)` | unterstützt | **nicht** unterstützt – immer `ON` |

## Einfach

Bei der Netzilon GmbH steht auf der Karteikarte eines Mitarbeiters nicht „Abteilung Vertrieb“, sondern nur eine **Nummer**: `abt_id = 6`. Was die 6 bedeutet, steht in einer **anderen** Schublade, den Abteilungen. Ein **JOIN** ist, als würdest du die beiden Karten **nebeneinanderlegen**, weil die Nummern zusammenpassen – wie bei einem **Memory-Spiel**.

- **INNER JOIN**: Nur Paare, die zusammenpassen, kommen auf den Tisch. Wer keine Abteilungsnummer hat, bleibt in der Schublade.
- **LEFT JOIN**: **Alle** Karten von links (Mitarbeiter) kommen auf den Tisch. Findet sich kein Partner, legst du ein leeres Blatt daneben (NULL).
- **RIGHT JOIN**: Das Gleiche, nur von rechts aus gesehen.
- **FULL JOIN**: Alle Karten von beiden Seiten – mit leeren Blättern, wo Partner fehlen.
- **CROSS JOIN**: **Jede** Karte links mit **jeder** Karte rechts – das gibt schnell riesige Haufen (6 Standorte × 10 Abteilungen = 60 Paare).
- **Self-Join**: Ein Mitarbeiter hat einen Chef – und der Chef ist **auch** ein Mitarbeiter. Also schaust du **zweimal** in dieselbe Schublade.

Der häufigste Fehler: Du sagst nicht, **welche** Nummern zusammenpassen sollen (ON vergessen). Dann legt der Computer jede Karte zu jeder – Chaos!

Probier es im SQL-Labor (Werkzeuge) aus: Wer ist der Chef von wem?

## Merksatz
- **INNER = Schnittmenge, LEFT = alles von links plus Partner.**
- Keine ON-Bedingung = kartesisches Produkt (Zeilen × Zeilen).
- „Wer hat keinen …?“ → LEFT JOIN + `WHERE rechts.schluessel IS NULL`.
- Self-Join = gleiche Tabelle, zwei Aliase.
- Bei n Tabellen braucht man n − 1 Join-Bedingungen.
- Filter auf die rechte Seite eines LEFT JOIN gehört in ON.

## Prüfungsfalle
- `FROM mitarbeiter, abteilungen` ohne Bedingung → 1000 statt 100 Zeilen.
- LEFT JOIN plus WHERE-Filter auf rechte Tabelle = heimlicher INNER JOIN.
- INNER JOIN verliert Zeilen ohne Partner (Mitarbeitende ohne Abteilung, Geschäftsführung im Self-Join).
- Mehrdeutige Spalten (`name`, `budget`, `email`) ohne Alias → Fehler.
- RIGHT/FULL JOIN fehlt nur in **alten** SQLite-Versionen – im SQL-Labor (3.45) funktionieren sie.
- `COUNT(*)` nach LEFT JOIN zählt auch die NULL-Zeile mit – für „Anzahl Bestellungen je Kunde“ `COUNT(b.best_id)` verwenden.

## Grafik
### INNER vs. LEFT JOIN
1. mitarbeiter -> abteilungen: Abgleich über abt_id
2. INNER JOIN: nur Paare mit gleicher abt_id bleiben (98 Zeilen)
3. LEFT JOIN: alle 100 Mitarbeitenden bleiben
4. LEFT JOIN: 2 Zeilen ohne Partner erhalten NULL bei abteilung
5. WHERE a.abt_id IS NULL: nur die 2 ohne Abteilung bleiben übrig

### Self-Join Hierarchie
1. Mitarbeiter m: Zeile mit vorgesetzter_id 2
2. mitarbeiter m -> mitarbeiter v: Suche ma_id 2 in der zweiten Kopie
3. Vorgesetzter v: Zeile mit ma_id 2 wird gefunden
4. Geschäftsführung: vorgesetzter_id ist NULL, LEFT JOIN behält die Zeile

### Kartesisches Produkt
1. Tabelle: mitarbeiter mit 100 Zeilen
2. Tabelle: abteilungen mit 10 Zeilen
3. FROM ohne ON: jede Zeile mit jeder kombiniert
4. Ergebnis: 1000 Zeilen, davon 900 unsinnig

## Lab
### GUI
Maschine: SQL-Labor in Netzilon (Werkzeuge → SQL-Labor), Firmen-DB „Netzilon GmbH“.
1. Mitarbeitende mit Abteilungsname per INNER JOIN ausgeben und Zeilen zählen.
2. Gleiche Abfrage mit LEFT JOIN – welche zwei Zeilen kommen hinzu?
3. Den Kunden ohne Bestellung per Anti-Join finden.
4. Den nie bestellten Artikel finden.
5. Mitarbeiter und Vorgesetzten per Self-Join anzeigen.
6. Projekte mit Kunde und Projektleitung (drei Tabellen) anzeigen.
7. Absichtlich ein kartesisches Produkt erzeugen und die Zeilenzahl prüfen.

```sql
-- 1 und 2
SELECT COUNT(*) FROM mitarbeiter m JOIN abteilungen a ON a.abt_id = m.abt_id;
SELECT m.nachname, a.name FROM mitarbeiter m LEFT JOIN abteilungen a ON a.abt_id = m.abt_id WHERE a.abt_id IS NULL;

-- 3
SELECT k.firma FROM kunden k LEFT JOIN bestellungen b ON b.kunde_id = k.kunde_id WHERE b.best_id IS NULL;

-- 4
SELECT ar.bezeichnung
FROM artikel ar
LEFT JOIN bestellpositionen p ON p.artikel_id = ar.artikel_id
WHERE p.artikel_id IS NULL;

-- 5
SELECT m.nachname AS mitarbeiter, v.nachname AS vorgesetzter
FROM mitarbeiter m LEFT JOIN mitarbeiter v ON v.ma_id = m.vorgesetzter_id;

-- 6
SELECT p.name AS projekt, k.firma AS kunde, l.nachname AS projektleitung, p.status
FROM projekte p
LEFT JOIN kunden k      ON k.kunde_id = p.kunde_id
LEFT JOIN mitarbeiter l ON l.ma_id = p.leiter_id
ORDER BY p.start;

-- 7
SELECT COUNT(*) AS zeilen FROM mitarbeiter, abteilungen;
```

### T-SQL
Maschine: SQL01.example.com, SSMS, Datenbank `Netzilon`.
1. Abfrage 6 mit `dbo.`-Präfix ausführen.
2. Mit CROSS APPLY die letzten drei Bestellungen je Kunde ermitteln.
3. Den tatsächlichen Ausführungsplan (Strg+M) einschalten und den Join-Operator (Nested Loops / Hash Match / Merge Join) ansehen.

```tsql
USE Netzilon;
SELECT k.firma, x.best_id, x.datum
FROM dbo.kunden AS k
CROSS APPLY (SELECT TOP (3) b.best_id, b.datum
             FROM dbo.bestellungen AS b
             WHERE b.kunde_id = k.kunde_id
             ORDER BY b.datum DESC) AS x;

SELECT CONCAT(m.vorname, ' ', m.nachname) AS mitarbeiter,
       CONCAT(v.vorname, ' ', v.nachname) AS vorgesetzter
FROM dbo.mitarbeiter AS m
LEFT JOIN dbo.mitarbeiter AS v ON v.ma_id = m.vorgesetzter_id;
```

## Legende
### INNER JOIN
- Was: Verknüpfung, die nur Zeilen mit passendem Partner liefert.
- Wie: `FROM a JOIN b ON b.fk = a.pk`.
- Wann: Wenn nur vollständige Paare interessieren (Mitarbeitende mit Abteilung).
- Warum: Normalisierte Daten wieder zusammensetzen.
### LEFT JOIN
- Was: Äußerer Join – alle Zeilen der linken Tabelle, rechte Seite ggf. NULL.
- Wie: `FROM kunden k LEFT JOIN bestellungen b ON b.kunde_id = k.kunde_id`.
- Wann: Auch Datensätze ohne Partner zeigen; Anti-Join „wer hat keine …“.
- Beispiel: Kunden ohne Bestellung, Artikel nie bestellt.
### Self-Join
- Was: Join einer Tabelle mit sich selbst über zwei Aliase.
- Wie: `mitarbeiter m LEFT JOIN mitarbeiter v ON v.ma_id = m.vorgesetzter_id`.
- Wo: Hierarchien (Vorgesetzte), Stücklisten, Nachfolger-Beziehungen.
- Warum: Die Beziehung verweist auf dieselbe Tabelle (rekursive Beziehung).

## Karteikarten
- F: Was liefert ein INNER JOIN? | A: Nur Zeilen, für die in beiden Tabellen ein passender Partner existiert.
- F: Was liefert ein LEFT JOIN? | A: Alle Zeilen der linken Tabelle; fehlt rechts ein Partner, sind deren Spalten NULL.
- F: Wie findest du Kunden ohne Bestellung? | A: `kunden LEFT JOIN bestellungen ON … WHERE bestellungen.best_id IS NULL` (Anti-Join).
- F: Was ist ein kartesisches Produkt? | A: Jede Zeile der einen Tabelle mit jeder der anderen kombiniert (Zeilen × Zeilen), z. B. durch vergessene ON-Bedingung.
- F: Wie viele Zeilen liefert `FROM mitarbeiter, abteilungen` ohne Bedingung? | A: 100 × 10 = 1000.
- F: Was ist ein Self-Join? | A: Eine Tabelle wird zweimal mit verschiedenen Aliasen verknüpft, z. B. Mitarbeiter und Vorgesetzter.
- F: Warum im Self-Join für Vorgesetzte LEFT JOIN? | A: Sonst fällt die Geschäftsführung (vorgesetzter_id NULL) heraus.
- F: Ab welcher SQLite-Version gibt es RIGHT und FULL OUTER JOIN? | A: Ab 3.39; das SQL-Labor nutzt 3.45, also verfügbar.
- F: Wie wird ein LEFT JOIN versehentlich zum INNER JOIN? | A: Durch eine WHERE-Bedingung auf eine Spalte der rechten Tabelle (NULL-Zeilen fallen weg).
- F: Welche Tabelle löst die m:n-Beziehung Projekte–Mitarbeiter auf? | A: `projekt_mitarbeiter` mit dem zusammengesetzten Primärschlüssel (projekt_id, ma_id).
- F: Was bedeutet „ambiguous column name“? | A: Ein Spaltenname existiert in mehreren beteiligten Tabellen und muss mit Alias qualifiziert werden.
- F: Wie viele Join-Bedingungen braucht ein Join über 4 Tabellen? | A: Mindestens 3 (n − 1).

## Quiz
? Welche Abfrage liefert alle Mitarbeitenden mit Abteilungsname – auch die ohne Abteilung?
- `SELECT m.nachname, a.name FROM mitarbeiter m JOIN abteilungen a ON a.abt_id = m.abt_id;`
* `SELECT m.nachname, a.name FROM mitarbeiter m LEFT JOIN abteilungen a ON a.abt_id = m.abt_id;`
- `SELECT m.nachname, a.name FROM abteilungen a LEFT JOIN mitarbeiter m ON a.abt_id = m.abt_id;`
- `SELECT m.nachname, a.name FROM mitarbeiter m, abteilungen a;`
! Die Tabelle, deren Zeilen vollständig erscheinen sollen, steht links vom LEFT JOIN.

? Wie viele Zeilen liefert `SELECT * FROM standorte CROSS JOIN abteilungen;` (6 Standorte, 10 Abteilungen)?
- 6
- 10
- 16
* 60
! CROSS JOIN bildet das kartesische Produkt: 6 × 10.

? Welche Abfrage findet Artikel, die nie bestellt wurden?
* `SELECT a.bezeichnung FROM artikel a LEFT JOIN bestellpositionen p ON p.artikel_id = a.artikel_id WHERE p.artikel_id IS NULL;`
- `SELECT a.bezeichnung FROM artikel a JOIN bestellpositionen p ON p.artikel_id = a.artikel_id WHERE p.menge = 0;`
- `SELECT a.bezeichnung FROM artikel a JOIN bestellpositionen p ON p.artikel_id = a.artikel_id WHERE p.artikel_id IS NULL;`
- `SELECT a.bezeichnung FROM artikel a WHERE a.lagerbestand = 0;`
! Anti-Join: LEFT JOIN und Test auf NULL in der rechten Tabelle. Mit INNER JOIN gibt es keine NULL-Partner.

? Was ist das Ergebnis von `LEFT JOIN abteilungen a ON a.abt_id = m.abt_id WHERE a.name = 'Vertrieb'`?
- Alle Mitarbeitenden, Vertrieb hervorgehoben
* Nur Mitarbeitende des Vertriebs – wie bei einem INNER JOIN
- Alle Mitarbeitenden, wobei Nicht-Vertriebler NULL als Abteilung erhalten
- Ein Syntaxfehler
! Der WHERE-Filter auf die rechte Tabelle entfernt die NULL-Zeilen.

? Welcher Join zeigt jeden Mitarbeitenden mit dem Nachnamen seines Vorgesetzten?
- `FROM mitarbeiter m JOIN abteilungen v ON v.leiter_id = m.ma_id`
- `FROM mitarbeiter m JOIN mitarbeiter v ON v.vorgesetzter_id = m.vorgesetzter_id`
* `FROM mitarbeiter m LEFT JOIN mitarbeiter v ON v.ma_id = m.vorgesetzter_id`
- `FROM mitarbeiter m CROSS JOIN mitarbeiter v`
! Der Fremdschlüssel vorgesetzter_id der Person zeigt auf den Primärschlüssel ma_id des Vorgesetzten.

? Was passiert bei `SELECT name FROM abteilungen a JOIN projekte p ON p.leiter_id = a.leiter_id;`?
- Es werden Abteilungsnamen ausgegeben
- Es werden Projektnamen ausgegeben
- Es entsteht ein kartesisches Produkt
* Fehler: Spaltenname name ist mehrdeutig
! Beide Tabellen besitzen eine Spalte `name` – Alias verwenden (`a.name`).

? Welche Aussage zu RIGHT JOIN im SQL-Labor (sql.js 1.10, SQLite 3.45) stimmt?
- Er wird nicht unterstützt, man muss LEFT JOIN verwenden
* Er wird unterstützt, weil SQLite ihn seit Version 3.39 kennt
- Er wird nur zusammen mit FULL JOIN unterstützt
- Er wird stillschweigend als INNER JOIN ausgeführt, die fehlenden Zeilen entfallen
! RIGHT und FULL OUTER JOIN kamen mit SQLite 3.39.0 (2022).

? Wie viele ON-Bedingungen braucht `mitarbeiter` → `abteilungen` → `standorte` mindestens?
- 1
* 2
- 3
- keine
! n Tabellen benötigen mindestens n − 1 Verknüpfungen.

? Welche Abfrage zählt die Bestellungen je Kunde inklusive Kunden mit 0 Bestellungen korrekt?
- `SELECT k.firma, COUNT(*) FROM kunden k LEFT JOIN bestellungen b ON b.kunde_id = k.kunde_id GROUP BY k.kunde_id, k.firma;`
- `SELECT k.firma, COUNT(b.best_id) FROM kunden k JOIN bestellungen b ON b.kunde_id = k.kunde_id GROUP BY k.kunde_id, k.firma;`
* `SELECT k.firma, COUNT(b.best_id) FROM kunden k LEFT JOIN bestellungen b ON b.kunde_id = k.kunde_id GROUP BY k.kunde_id, k.firma;`
- `SELECT k.firma, SUM(b.best_id) FROM kunden k LEFT JOIN bestellungen b ON b.kunde_id = k.kunde_id GROUP BY k.firma;`
! COUNT(*) würde die NULL-Zeile des Kunden ohne Bestellung als 1 zählen; INNER JOIN verliert ihn ganz.

? Welche Join-Art ist für „Alle Abteilungen und alle Mitarbeitenden, auch ohne Partner“ richtig?
- INNER JOIN
- LEFT JOIN
- CROSS JOIN
* FULL OUTER JOIN
! FULL OUTER JOIN behält die Zeilen ohne Partner von beiden Seiten.

? Welche Syntax ist in T-SQL NICHT erlaubt?
- `JOIN dbo.abteilungen a ON a.abt_id = m.abt_id`
- `LEFT OUTER JOIN dbo.abteilungen a ON a.abt_id = m.abt_id`
* `JOIN dbo.abteilungen USING (abt_id)`
- `CROSS APPLY (SELECT TOP (1) ...) x`
! USING und NATURAL JOIN kennt SQL Server nicht; SQLite unterstützt beide.

? Was ist eine typische Folge eines Joins über eine 1:n-Beziehung vor einer Summe?
- Die Datenbank erkennt Duplikate und korrigiert die Summe automatisch
- Es werden Zeilen ausgelassen
* Werte der 1-Seite werden mehrfach summiert
- Der Join liefert einen Fehler
! Beispiel: Abteilungsbudget pro Mitarbeitendem wiederholt → SUM(a.budget) zu hoch.

## Lücken
- Ein {INNER JOIN} liefert nur Zeilen mit Partner, ein {LEFT JOIN} alle Zeilen der linken Tabelle.
- Fehlt die Join-Bedingung, entsteht ein {kartesisches Produkt|Kreuzprodukt}.
- Beim Self-Join wird die Tabelle mitarbeiter über {vorgesetzter_id} mit {ma_id} verknüpft.

## Zuordnen
### Join-Art und Ergebnis
- INNER JOIN => nur passende Paare
- LEFT JOIN => alle Zeilen links, rechts ggf. NULL
- RIGHT JOIN => alle Zeilen rechts, links ggf. NULL
- FULL OUTER JOIN => alle Zeilen beider Seiten
- CROSS JOIN => jede Zeile mit jeder Zeile
- Self-Join => Tabelle mit sich selbst

## Reihenfolge
### Anti-Join „Kunden ohne Bestellung“ aufbauen
1. FROM kunden k als linke Tabelle wählen
2. LEFT JOIN bestellungen b anfügen
3. ON b.kunde_id = k.kunde_id als Verknüpfung angeben
4. WHERE b.best_id IS NULL als Filter setzen
5. SELECT k.firma ausgeben

## Freitext
- F: Erklären Sie anhand der Tabellen mitarbeiter (100 Zeilen) und abteilungen (10 Zeilen), was bei `SELECT * FROM mitarbeiter, abteilungen;` passiert und wie man es korrigiert. | M: Ohne Join-Bedingung entsteht ein kartesisches Produkt mit 1000 Zeilen. Korrektur: `SELECT * FROM mitarbeiter m JOIN abteilungen a ON a.abt_id = m.abt_id;` (bzw. WHERE a.abt_id = m.abt_id). | P: 4
- F: Schreiben Sie eine Abfrage, die für jedes Projekt die Anzahl der zugeordneten Mitarbeitenden ausgibt – Projekte ohne Zuordnung mit 0. | M: `SELECT p.name, COUNT(pm.ma_id) AS anzahl FROM projekte p LEFT JOIN projekt_mitarbeiter pm ON pm.projekt_id = p.projekt_id GROUP BY p.projekt_id, p.name;` | P: 4

## Szenario
### Organigramm-Liste für die Personalabteilung
Die Personalabteilung der Netzilon GmbH möchte eine Liste für das neue Organigramm: Jede Person mit Abteilung, Standort und direktem Vorgesetzten. Personen ohne Abteilung und die Geschäftsführung (ohne Vorgesetzten) sollen ebenfalls erscheinen.
- F: Welche Tabellen und Beziehungen brauchen Sie? | A: mitarbeiter (m), abteilungen über m.abt_id, standorte über a.standort_id, mitarbeiter (v) als Self-Join über m.vorgesetzter_id = v.ma_id. | P: 2
- F: Schreiben Sie die Abfrage. | A: `SELECT m.nachname, a.name AS abteilung, s.stadt, v.nachname AS vorgesetzter FROM mitarbeiter m LEFT JOIN abteilungen a ON a.abt_id = m.abt_id LEFT JOIN standorte s ON s.standort_id = a.standort_id LEFT JOIN mitarbeiter v ON v.ma_id = m.vorgesetzter_id ORDER BY a.name, m.nachname;` | P: 5
- F: Warum durchgehend LEFT JOIN? | A: Mit INNER JOIN fielen die 2 Personen ohne Abteilung und die Geschäftsführung ohne Vorgesetzten heraus. | P: 2
- F: Wie zählen Sie die direkten Mitarbeitenden je Vorgesetztem? | A: `SELECT v.nachname, COUNT(m.ma_id) FROM mitarbeiter v JOIN mitarbeiter m ON m.vorgesetzter_id = v.ma_id GROUP BY v.ma_id, v.nachname;` | P: 3
