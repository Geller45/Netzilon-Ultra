---
id: db-labor-aggregate
bereich: Datenbanken
block: D4
kapitel: SQL-Labor (Firmen-DB)
titel: Aggregatfunktionen, GROUP BY und HAVING
stufe: Fortgeschritten
fach: SQL / Datenbanken
pruefungen: [AP1, AP2, Schule]
quellen: [SQLite-Dokumentation, Microsoft Learn – T-SQL]
verweise: [db-select-aggregate, db-labor-select, db-labor-joins, db-labor-fenster]
---

## Profi

### Aggregatfunktionen (aggregate functions)
Aggregatfunktionen verdichten **viele Zeilen zu einem Wert**:

| Funktion | Bedeutung | NULL-Verhalten |
|---|---|---|
| `COUNT(*)` | Anzahl Zeilen | zählt **alle** Zeilen |
| `COUNT(spalte)` | Anzahl Werte | zählt nur Nicht-NULL-Werte |
| `COUNT(DISTINCT spalte)` | Anzahl verschiedener Werte | ohne NULL |
| `SUM(spalte)` | Summe | ignoriert NULL; nur NULL-Werte → NULL |
| `AVG(spalte)` | Durchschnitt | ignoriert NULL (teilt durch Anzahl Nicht-NULL!) |
| `MIN` / `MAX` | kleinster / größter Wert | ignoriert NULL; auch für Text und ISO-Datum |

Beispiele aus der Firmen-DB der **Netzilon GmbH** (Probier es im SQL-Labor (Werkzeuge) aus):
```sql
SELECT COUNT(*)              AS alle,
       COUNT(abt_id)         AS mit_abteilung,
       COUNT(DISTINCT abt_id) AS abteilungen_belegt,
       ROUND(AVG(gehalt), 2) AS durchschnitt,
       MIN(eintritt)         AS erster_eintritt,
       MAX(gehalt)           AS hoechstes_gehalt
FROM mitarbeiter;
```
`COUNT(*)` liefert 100, `COUNT(abt_id)` 98 – die zwei Mitarbeitenden ohne Abteilung fehlen.

### GROUP BY – Gruppen bilden
`GROUP BY` fasst alle Zeilen mit gleichem Wert in den Gruppierungsspalten zu **einer** Ergebniszeile zusammen; Aggregatfunktionen rechnen dann **je Gruppe**.
```sql
SELECT abt_id, COUNT(*) AS anzahl, ROUND(AVG(gehalt), 2) AS schnitt
FROM mitarbeiter
WHERE austritt IS NULL
GROUP BY abt_id
ORDER BY anzahl DESC;
```
NULL bildet eine **eigene Gruppe** (die Mitarbeitenden ohne Abteilung erscheinen mit abt_id NULL).

**Regel**: Jede Spalte im SELECT muss entweder in `GROUP BY` stehen oder in einer Aggregatfunktion. SQL Server erzwingt das (Fehler 8120), **SQLite nicht**: dort liefert `SELECT abt_id, nachname, COUNT(*) … GROUP BY abt_id` einen beliebigen Nachnamen der Gruppe – fachlich falsch, auch wenn kein Fehler kommt. (Sonderfall SQLite: bei `MIN()`/`MAX()` stammen die „nackten“ Spalten aus der Zeile mit dem Minimum/Maximum.)

### HAVING – Gruppen filtern
`WHERE` filtert **Zeilen vor** der Gruppierung, `HAVING` filtert **Gruppen nach** der Gruppierung und darf Aggregatfunktionen enthalten:
```sql
-- Kunden mit mindestens 10 Bestellungen
SELECT kunde_id, COUNT(*) AS bestellungen
FROM bestellungen
WHERE status <> 'storniert'
GROUP BY kunde_id
HAVING COUNT(*) >= 10
ORDER BY bestellungen DESC;
```
`WHERE COUNT(*) >= 10` ist ein Fehler („misuse of aggregate“), weil es zum Zeitpunkt von WHERE noch keine Gruppen gibt.

### Logische Abarbeitungsreihenfolge (logical query processing)
Geschrieben wird `SELECT – FROM – WHERE – GROUP BY – HAVING – ORDER BY`, ausgewertet aber:
1. **FROM** (inkl. JOIN) – Quelltabellen
2. **WHERE** – Zeilenfilter
3. **GROUP BY** – Gruppen bilden
4. **HAVING** – Gruppenfilter
5. **SELECT** – Ausdrücke, Aliase, DISTINCT
6. **ORDER BY** – Sortierung (darf Aliase verwenden)
7. **LIMIT/OFFSET** bzw. TOP

Folge: Ein Alias aus SELECT ist in WHERE **nicht** sichtbar (`WHERE marge > 100` mit Alias marge → Fehler im Standard; SQLite erlaubt es als Erweiterung, SQL Server nicht). In ORDER BY ist der Alias immer erlaubt.

### Umsatz berechnen
Umsatz einer Bestellposition = `menge * einzelpreis`. Umsatz je Bestellung:
```sql
SELECT best_id, SUM(menge * einzelpreis) AS umsatz, COUNT(*) AS positionen
FROM bestellpositionen
GROUP BY best_id
HAVING SUM(menge * einzelpreis) > 1000
ORDER BY umsatz DESC;
```
Mehrere Gruppierungsspalten: Stunden je Mitarbeiter **und** Projekt:
```sql
SELECT ma_id, projekt_id, SUM(stunden) AS summe
FROM zeiterfassung
GROUP BY ma_id, projekt_id
ORDER BY ma_id, projekt_id;
```

### Bedingte Aggregation
Mit CASE in der Aggregatfunktion zählt man mehrere Kategorien in einer Zeile:
```sql
SELECT COUNT(*) AS gesamt,
       SUM(CASE WHEN status = 'offen' THEN 1 ELSE 0 END)     AS offen,
       SUM(CASE WHEN status = 'storniert' THEN 1 ELSE 0 END) AS storniert
FROM bestellungen;
```

### Ganzzahlige Division
`AVG` liefert in SQLite immer eine Gleitkommazahl. Aber `SUM(menge) / COUNT(*)` mit zwei INTEGER-Werten wird **ganzzahlig** geteilt (7/2 = 3). Abhilfe: `SUM(menge) * 1.0 / COUNT(*)`.

### T-SQL-Unterschied
| Thema | SQLite | T-SQL (SQL Server) |
|---|---|---|
| Nicht aggregierte Spalte außerhalb GROUP BY | erlaubt (beliebiger Wert) | Fehler 8120 |
| Alias in WHERE/HAVING | geduldet (Erweiterung) | nicht erlaubt |
| `AVG` auf INTEGER-Spalte | Gleitkomma-Ergebnis | **Ganzzahl** (Typ der Spalte) → `AVG(menge * 1.0)` oder `AVG(CAST(menge AS DECIMAL(10,2)))` |
| Zeilenzahl > 2 Mrd. | `COUNT` ist 64 Bit | `COUNT_BIG(*)` für BIGINT |
| Werte zu Liste verketten | `group_concat(nachname, ', ')` | `STRING_AGG(nachname, ', ')` (ab 2017) |
| Zwischensummen | über UNION ALL nachbauen | `GROUP BY ROLLUP(abt_id)` / `CUBE` / `GROUPING SETS` |
| Runden | `ROUND(x, 2)` | `ROUND(x, 2)` (Typ bleibt erhalten, ggf. `CAST(... AS DECIMAL(10,2))`) |

## Einfach

Stell dir vor, die Netzilon GmbH hat 100 Mitarbeitende, und die Chefin fragt: „**Wie viele** sind wir eigentlich?“ Du musst nicht jede Karteikarte vorlesen – du **zählst** sie: `COUNT(*)`. Das ist eine **Aggregatfunktion**: Aus vielen Zeilen wird **eine Zahl**.

Weitere Zähl- und Rechenhelfer:
- **SUM** – alles zusammenzählen (z. B. alle Arbeitsstunden).
- **AVG** – Durchschnitt (z. B. durchschnittliches Gehalt).
- **MIN** und **MAX** – das Kleinste und das Größte.

Jetzt fragt die Chefin: „Wie viele sind wir **pro Abteilung**?“ Dafür legst du die Karteikarten in **Stapel** – ein Stapel pro Abteilung. Das ist **GROUP BY**. Dann zählst du jeden Stapel einzeln.

Und wenn sie sagt: „Zeig mir nur die Abteilungen mit **mehr als 10** Leuten“, dann schaust du dir die **fertigen Stapel** an und wirfst die kleinen weg. Das ist **HAVING**.

Der Unterschied zu WHERE: **WHERE** sortiert **einzelne Karten** aus, **bevor** du Stapel machst (z. B. „ohne Ausgetretene“). **HAVING** sortiert **ganze Stapel** aus, **nachdem** du sie gebildet hast.

Probier es im SQL-Labor (Werkzeuge) aus: `SELECT abt_id, COUNT(*) FROM mitarbeiter GROUP BY abt_id;`

## Merksatz
- **WHERE vor dem Stapeln, HAVING nach dem Stapeln.**
- **F**rische **W**affeln **G**ibt **H**eute **S**uper **O**ft: FROM – WHERE – GROUP BY – HAVING – SELECT – ORDER BY.
- COUNT(*) zählt Zeilen, COUNT(spalte) zählt Werte.
- Alles im SELECT: gruppiert oder aggregiert.
- AVG ignoriert NULL.

## Prüfungsfalle
- Aggregatfunktion in WHERE → Fehler, gehört in HAVING.
- `COUNT(abt_id)` ≠ `COUNT(*)`, wenn NULL-Werte vorkommen.
- `AVG(gehalt)` zählt Zeilen mit NULL-Gehalt nicht mit – kein „0“.
- SQLite meldet keinen Fehler bei nicht gruppierten Spalten – in der Prüfung (Standard/T-SQL) ist das trotzdem falsch.
- T-SQL: `AVG` über INTEGER-Spalte rundet ab.
- Alias aus SELECT ist in WHERE nach Standard nicht sichtbar.

## Grafik
### Vom Zeilenhaufen zur Gruppenauswertung
1. FROM: 100 Zeilen aus mitarbeiter
2. WHERE: Ausgetretene werden entfernt
3. GROUP BY: Zeilen bilden Stapel je abt_id
4. HAVING: Stapel mit weniger als 5 Personen fallen weg
5. SELECT: je Stapel abt_id und COUNT(*) berechnen
6. ORDER BY: Stapel nach Anzahl absteigend sortieren

### COUNT mit und ohne NULL
1. Tabelle: 100 Mitarbeitende, 2 ohne abt_id
2. COUNT(*): zählt alle Zeilen = 100
3. COUNT(abt_id): überspringt NULL = 98
4. COUNT(DISTINCT abt_id): verschiedene Abteilungen = höchstens 10

## Lab
### GUI
Maschine: SQL-Labor in Netzilon (Werkzeuge → SQL-Labor), Firmen-DB „Netzilon GmbH“.
1. Gesamtzahl Mitarbeitende und Anzahl mit Abteilung vergleichen.
2. Anzahl und Durchschnittsgehalt je Abteilung ermitteln.
3. Nur Abteilungen mit mehr als 8 aktiven Mitarbeitenden anzeigen.
4. Gebuchte Stunden je Projekt (nur 2025) summieren.
5. Umsatz je Artikel ermitteln, die fünf umsatzstärksten zuerst.
6. Bestellstatus-Übersicht mit bedingter Aggregation erstellen.

```sql
-- 1
SELECT COUNT(*) AS alle, COUNT(abt_id) AS mit_abteilung FROM mitarbeiter;

-- 2 und 3
SELECT abt_id, COUNT(*) AS anzahl, ROUND(AVG(gehalt), 2) AS schnitt
FROM mitarbeiter
WHERE austritt IS NULL
GROUP BY abt_id
HAVING COUNT(*) > 8
ORDER BY anzahl DESC;

-- 4
SELECT projekt_id, SUM(stunden) AS stunden_2025
FROM zeiterfassung
WHERE datum BETWEEN '2025-01-01' AND '2025-12-31'
GROUP BY projekt_id
ORDER BY stunden_2025 DESC;

-- 5
SELECT artikel_id, SUM(menge) AS stueck, ROUND(SUM(menge * einzelpreis), 2) AS umsatz
FROM bestellpositionen
GROUP BY artikel_id
ORDER BY umsatz DESC
LIMIT 5;

-- 6
SELECT status, COUNT(*) AS anzahl
FROM bestellungen
GROUP BY status
ORDER BY anzahl DESC;
```

### T-SQL
Maschine: SQL01.example.com, SSMS, Datenbank `Netzilon`.
1. Abfrage 2 übernehmen; `AVG(gehalt)` funktioniert, weil `gehalt` ein Dezimaltyp ist.
2. Durchschnittliche Menge je Position: Ganzzahl-Falle beachten.
3. Zwischensummen mit ROLLUP ausprobieren.

```tsql
USE Netzilon;
SELECT AVG(menge) AS falsch_ganzzahl, AVG(menge * 1.0) AS richtig
FROM dbo.bestellpositionen;

SELECT abt_id, COUNT(*) AS anzahl, SUM(gehalt) AS gehaltssumme
FROM dbo.mitarbeiter
GROUP BY ROLLUP(abt_id);

SELECT abt_id, STRING_AGG(nachname, ', ') WITHIN GROUP (ORDER BY nachname) AS namen
FROM dbo.mitarbeiter
GROUP BY abt_id;
```

## Legende
### GROUP BY
- Was: Bildet Gruppen aus Zeilen mit gleichen Werten in den Gruppierungsspalten.
- Wie: `GROUP BY abt_id` – jede Spalte im SELECT gruppiert oder aggregiert.
- Wann: Auswertungen „je Abteilung“, „je Kunde“, „je Monat“.
- Wo: SQL-Labor (SQLite) und SQL Server; Reports, Dashboards.
- Warum: Verdichtet große Datenmengen zu aussagekräftigen Kennzahlen.
### HAVING
- Was: Filter auf Gruppen nach dem Gruppieren.
- Wie: `HAVING COUNT(*) > 8` – Aggregatfunktionen erlaubt.
- Wann: Wenn die Bedingung von einer Kennzahl der Gruppe abhängt.
- Warum: WHERE kennt noch keine Gruppen und keine Aggregate.
### Aggregatfunktion
- Was: COUNT, SUM, AVG, MIN, MAX – viele Zeilen zu einem Wert.
- Wie: `SUM(menge * einzelpreis)`; NULL wird (außer bei COUNT(*)) ignoriert.
- Beispiel: `SELECT MAX(gehalt) FROM mitarbeiter;`

## Karteikarten
- F: Unterschied COUNT(*) und COUNT(abt_id)? | A: COUNT(*) zählt alle Zeilen, COUNT(abt_id) nur Zeilen, in denen abt_id nicht NULL ist.
- F: Unterschied WHERE und HAVING? | A: WHERE filtert Zeilen vor der Gruppierung, HAVING filtert Gruppen danach (mit Aggregaten).
- F: Logische Abarbeitungsreihenfolge einer Abfrage? | A: FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY (→ LIMIT/TOP).
- F: Welche Regel gilt für Spalten im SELECT bei GROUP BY? | A: Jede Spalte muss in GROUP BY stehen oder in einer Aggregatfunktion.
- F: Wie reagiert SQLite auf eine nicht gruppierte Spalte? | A: Kein Fehler, liefert einen beliebigen Wert der Gruppe (SQL Server: Fehler 8120).
- F: Wie berechnest du den Umsatz je Bestellung? | A: `SELECT best_id, SUM(menge * einzelpreis) FROM bestellpositionen GROUP BY best_id;`
- F: Wie behandelt AVG NULL-Werte? | A: Ignoriert sie – geteilt wird durch die Anzahl der Nicht-NULL-Werte.
- F: Warum ist ein SELECT-Alias in WHERE nicht nutzbar? | A: WHERE wird logisch vor SELECT ausgewertet; der Alias existiert noch nicht.
- F: Was liefert COUNT(DISTINCT abt_id)? | A: Die Anzahl verschiedener, nicht leerer Abteilungsnummern.
- F: T-SQL-Gegenstück zu group_concat? | A: `STRING_AGG(spalte, ', ')` (ab SQL Server 2017).
- F: Was ist bedingte Aggregation? | A: `SUM(CASE WHEN bedingung THEN 1 ELSE 0 END)` – zählt Teilmengen in einer Zeile.
- F: Was ist die Falle bei AVG(menge) in T-SQL? | A: Bei INTEGER-Spalte ist das Ergebnis eine Ganzzahl; Abhilfe `AVG(menge * 1.0)`.

## Quiz
? Welche Abfrage liefert die Anzahl Mitarbeitender je Abteilung?
* `SELECT abt_id, COUNT(*) FROM mitarbeiter GROUP BY abt_id;`
- `SELECT abt_id, COUNT(*) FROM mitarbeiter ORDER BY abt_id;`
- `SELECT COUNT(abt_id) FROM mitarbeiter;`
- `SELECT abt_id, SUM(*) FROM mitarbeiter GROUP BY abt_id;`
! Ohne GROUP BY gibt es nur eine Gesamtzahl; SUM(*) gibt es nicht.

? Welche Abfrage zeigt nur Kunden mit mehr als 5 Bestellungen?
- `SELECT kunde_id, COUNT(*) FROM bestellungen WHERE COUNT(*) > 5 GROUP BY kunde_id;`
* `SELECT kunde_id, COUNT(*) FROM bestellungen GROUP BY kunde_id HAVING COUNT(*) > 5;`
- `SELECT kunde_id FROM bestellungen HAVING kunde_id > 5;`
- `SELECT kunde_id, COUNT(*) FROM bestellungen GROUP BY COUNT(*) > 5;`
! Bedingungen auf Aggregate gehören in HAVING.

? In welcher Reihenfolge wertet die Datenbank logisch aus?
- SELECT, FROM, WHERE, GROUP BY, HAVING
- FROM, SELECT, WHERE, HAVING, GROUP BY
* FROM, WHERE, GROUP BY, HAVING, SELECT
- WHERE, FROM, GROUP BY, SELECT, HAVING
! Erst Quelle, dann Zeilenfilter, Gruppen, Gruppenfilter, zuletzt die Ausgabeliste.

? Die Tabelle mitarbeiter hat 100 Zeilen, 2 davon ohne abt_id. Was liefert `COUNT(abt_id)`?
- 100
- 2
- 10
* 98
! COUNT(spalte) zählt nur Nicht-NULL-Werte.

? Was liefert `SELECT SUM(menge * einzelpreis) FROM bestellpositionen WHERE best_id = 1;`?
- Die Anzahl Positionen der Bestellung 1
* Den Gesamtwert der Bestellung 1
- Den Durchschnittspreis der Bestellung 1
- Einen Fehler, weil GROUP BY fehlt
! Ohne GROUP BY bildet die ganze (gefilterte) Ergebnismenge eine Gruppe.

? Warum meldet SQL Server bei `SELECT abt_id, nachname, COUNT(*) FROM mitarbeiter GROUP BY abt_id` einen Fehler?
- Weil COUNT(*) nicht erlaubt ist
- Weil abt_id NULL enthält
- Weil ORDER BY fehlt
* Weil nachname weder gruppiert noch aggregiert ist
! SQLite liefert hier stillschweigend irgendeinen Nachnamen – fachlich trotzdem falsch.

? Was gibt `AVG(gehalt)` zurück, wenn drei Gehälter 3000, 5000 und NULL sind?
- 2666,67
* 4000
- NULL
- 8000
! NULL wird ignoriert: (3000 + 5000) / 2.

? Welche Abfrage liefert die Summe der gebuchten Stunden je Mitarbeiter und Projekt?
- `SELECT ma_id, projekt_id, SUM(stunden) FROM zeiterfassung GROUP BY ma_id;`
- `SELECT ma_id, SUM(stunden) FROM zeiterfassung GROUP BY projekt_id;`
* `SELECT ma_id, projekt_id, SUM(stunden) FROM zeiterfassung GROUP BY ma_id, projekt_id;`
- `SELECT SUM(stunden) FROM zeiterfassung GROUP BY stunden;`
! Beide Ausgabespalten müssen in GROUP BY stehen.

? Welche Aussage zu NULL bei GROUP BY ist richtig?
- Zeilen mit NULL werden verworfen
- Jede NULL-Zeile bildet eine eigene Gruppe
* Alle NULL-Werte bilden zusammen eine Gruppe
- GROUP BY auf Spalten mit NULL ist verboten
! Für GROUP BY und DISTINCT gelten NULL-Werte als gleich.

? Wie lautet in T-SQL die Liste aller Nachnamen je Abteilung als Text?
- `group_concat(nachname)`
* `STRING_AGG(nachname, ', ')`
- `CONCAT_ALL(nachname)`
- `LISTAGG(nachname) OVER ()`
! STRING_AGG gibt es ab SQL Server 2017; group_concat ist SQLite/MySQL.

? Welche Abfrage findet den höchsten Lagerbestand je Kategorie?
- `SELECT kategorie, lagerbestand FROM artikel ORDER BY lagerbestand DESC;`
- `SELECT MAX(kategorie), lagerbestand FROM artikel;`
- `SELECT kategorie, MAX(lagerbestand) FROM artikel;`
* `SELECT kategorie, MAX(lagerbestand) FROM artikel GROUP BY kategorie;`
! „je Kategorie“ verlangt GROUP BY kategorie.

? Was ergibt in T-SQL `SELECT AVG(menge) FROM bestellpositionen` bei den Mengen 1 und 2?
* 1
- 1,5
- 2
- NULL
! Bei INTEGER-Spalten liefert AVG in SQL Server eine Ganzzahl (abgeschnitten). SQLite liefert 1.5.

? Welche Klausel darf einen Spaltenalias aus SELECT in jedem Fall verwenden?
- WHERE
- GROUP BY
- FROM
* ORDER BY
! ORDER BY wird logisch nach SELECT ausgewertet.

## Lücken
- {WHERE} filtert Zeilen vor der Gruppierung, {HAVING} filtert Gruppen danach.
- {COUNT(*)} zählt alle Zeilen, COUNT(spalte) ignoriert {NULL}.
- Logisch wird zuerst {FROM} ausgewertet, die Spaltenliste im {SELECT} erst nach HAVING.

## Zuordnen
### Funktion und Ergebnis
- COUNT(*) => Anzahl aller Zeilen
- SUM(stunden) => Summe der gebuchten Stunden
- AVG(gehalt) => Durchschnitt ohne NULL-Werte
- MIN(eintritt) => frühestes Eintrittsdatum
- MAX(verkaufspreis) => höchster Verkaufspreis
- COUNT(DISTINCT kunde_id) => Anzahl verschiedener Kunden

## Reihenfolge
### Logische Abarbeitung einer Abfrage
1. FROM
2. WHERE
3. GROUP BY
4. HAVING
5. SELECT
6. ORDER BY

## Freitext
- F: Erklären Sie, warum `SELECT abt_id, COUNT(*) FROM mitarbeiter WHERE COUNT(*) > 5 GROUP BY abt_id` fehlschlägt, und korrigieren Sie die Abfrage. | M: WHERE wird vor der Gruppierung ausgewertet, Aggregate existieren dort noch nicht. Korrektur: `SELECT abt_id, COUNT(*) FROM mitarbeiter GROUP BY abt_id HAVING COUNT(*) > 5;` | P: 4
- F: Ermitteln Sie den Gesamtumsatz aller nicht stornierten Bestellungen je Kunde (kunde_id) – nur Kunden mit Umsatz über 5000 Euro. | M: `SELECT b.kunde_id, SUM(p.menge * p.einzelpreis) AS umsatz FROM bestellungen b JOIN bestellpositionen p ON p.best_id = b.best_id WHERE b.status <> 'storniert' GROUP BY b.kunde_id HAVING SUM(p.menge * p.einzelpreis) > 5000 ORDER BY umsatz DESC;` | P: 6

## Szenario
### Gehaltsauswertung der Personalabteilung
Die Personalabteilung der Netzilon GmbH möchte für die Budgetplanung 2026 wissen, wie sich die Gehälter auf die Abteilungen verteilen. Ausgetretene Mitarbeitende sollen nicht berücksichtigt werden; Auszubildende sollen separat betrachtet werden.
- F: Ermitteln Sie Anzahl, Gehaltssumme und Durchschnittsgehalt je Abteilung (aktiv). | A: `SELECT abt_id, COUNT(*), SUM(gehalt), ROUND(AVG(gehalt), 2) FROM mitarbeiter WHERE austritt IS NULL GROUP BY abt_id;` | P: 3
- F: Nur Abteilungen mit einer Gehaltssumme über 40000 Euro im Monat sollen erscheinen. | A: `... HAVING SUM(gehalt) > 40000` | P: 2
- F: Wie zählen Sie Azubis und Nicht-Azubis je Abteilung in einer Zeile? | A: `SELECT abt_id, SUM(CASE WHEN azubi = 1 THEN 1 ELSE 0 END) AS azubis, SUM(CASE WHEN azubi = 0 THEN 1 ELSE 0 END) AS fachkraefte FROM mitarbeiter WHERE austritt IS NULL GROUP BY abt_id;` | P: 3
- F: Warum erscheint eine Gruppe mit abt_id NULL? | A: Zwei Mitarbeitende haben keine Abteilung; NULL bildet bei GROUP BY eine eigene Gruppe. | P: 2
