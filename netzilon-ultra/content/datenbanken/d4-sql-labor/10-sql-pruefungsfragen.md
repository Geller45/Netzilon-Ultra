---
id: db-labor-pruefung
bereich: Datenbanken
block: D4
kapitel: SQL-Labor (Firmen-DB)
titel: SQL-Prüfungsfragen zur Firmen-DB (IHK-Stil)
stufe: Fortgeschritten
typ: fragen
fach: SQL / Datenbanken
pruefungen: [AP1, AP2, Schule]
quellen: [SQLite-Dokumentation, Microsoft Learn – T-SQL]
verweise: [db-labor-select, db-labor-aggregate, db-labor-joins, db-labor-unterabfragen, db-labor-dml, db-labor-ddl, db-labor-views-indizes, db-labor-transaktionen, db-labor-fenster]
---

## Quiz
? Welche Abfrage liefert Vor- und Nachname aller Auszubildenden, alphabetisch nach Nachname?
* `SELECT vorname, nachname FROM mitarbeiter WHERE azubi = 1 ORDER BY nachname;`
- `SELECT vorname, nachname FROM mitarbeiter WHERE azubi ORDER nachname;`
- `SELECT vorname, nachname FROM mitarbeiter ORDER BY nachname WHERE azubi = 1;`
- `SELECT vorname, nachname FROM mitarbeiter GROUP BY azubi = 1;`
! WHERE steht vor ORDER BY; „ORDER nachname“ ohne BY ist ungültig.

? Welche Abfrage liefert alle Kunden, deren Firmenname „Logistik“ enthält?
- `SELECT firma FROM kunden WHERE firma = '%Logistik%';`
- `SELECT firma FROM kunden WHERE firma LIKE 'Logistik';`
* `SELECT firma FROM kunden WHERE firma LIKE '%Logistik%';`
- `SELECT firma FROM kunden WHERE firma IN ('Logistik');`
! Platzhalter wirken nur mit LIKE; ohne `%` muss der Text exakt passen.

? Welche Abfrage liefert die Anzahl der Mitarbeitenden ohne Abteilung?
- `SELECT COUNT(abt_id) FROM mitarbeiter WHERE abt_id IS NULL;`
* `SELECT COUNT(*) FROM mitarbeiter WHERE abt_id IS NULL;`
- `SELECT COUNT(*) FROM mitarbeiter WHERE abt_id = NULL;`
- `SELECT SUM(abt_id) FROM mitarbeiter WHERE abt_id IS NULL;`
! COUNT(abt_id) zählt NULL nicht und ergäbe hier 0; `= NULL` liefert keine Zeile.

? Welche Abfrage liefert den Gesamtumsatz (Menge × Einzelpreis) aller Bestellpositionen?
- `SELECT SUM(menge) * SUM(einzelpreis) FROM bestellpositionen;`
- `SELECT COUNT(menge * einzelpreis) FROM bestellpositionen;`
- `SELECT menge * einzelpreis FROM bestellpositionen GROUP BY best_id;`
* `SELECT SUM(menge * einzelpreis) FROM bestellpositionen;`
! Erst je Zeile multiplizieren, dann summieren. Das Produkt der Summen ist mathematisch falsch.

? Welche Abfrage liefert je Abteilungsname die Anzahl der Mitarbeitenden?
* `SELECT a.name, COUNT(m.ma_id) FROM abteilungen a LEFT JOIN mitarbeiter m ON m.abt_id = a.abt_id GROUP BY a.abt_id, a.name;`
- `SELECT a.name, COUNT(*) FROM abteilungen a, mitarbeiter m GROUP BY a.name;`
- `SELECT a.name, COUNT(*) FROM abteilungen a INNER JOIN mitarbeiter m ON m.ma_id = a.abt_id GROUP BY a.abt_id, a.name ORDER BY 2 DESC;`
- `SELECT a.name, COUNT(m.ma_id) FROM abteilungen a JOIN mitarbeiter m GROUP BY m.ma_id;`
! Join-Bedingung nötig; LEFT JOIN + COUNT(m.ma_id) zeigt auch Abteilungen ohne Personal mit 0.

? Welche Abfrage liefert Projekte mit Status „aktiv“ oder „geplant“?
- `SELECT name FROM projekte WHERE status = 'aktiv' AND status = 'geplant';`
- `SELECT name FROM projekte WHERE status = 'aktiv', 'geplant';`
* `SELECT name FROM projekte WHERE status IN ('aktiv', 'geplant');`
- `SELECT name FROM projekte WHERE status BETWEEN 'aktiv' AND 'geplant';`
! Eine Spalte kann nicht gleichzeitig zwei Werte haben; BETWEEN wäre ein alphabetischer Bereich.

? Welche Abfrage liefert die Bestellungen des Jahres 2025?
- `SELECT * FROM bestellungen WHERE datum = 2025;`
* `SELECT * FROM bestellungen WHERE datum BETWEEN '2025-01-01' AND '2025-12-31';`
- `SELECT * FROM bestellungen WHERE datum > '2025-01-01' AND datum < '2025-12-31';`
- `SELECT * FROM bestellungen WHERE YEAR(datum) = '2025';`
! Die Variante mit `>`/`<` verliert den 1.1. und 31.12.; YEAR() gibt es in SQLite nicht.

? Welche Abfrage zeigt jeden Mitarbeitenden mit dem Namen der Standortstadt seiner Abteilung?
- `SELECT m.nachname, s.stadt FROM mitarbeiter m JOIN standorte s ON s.standort_id = m.abt_id;`
- `SELECT m.nachname, s.stadt FROM mitarbeiter m JOIN abteilungen a ON a.abt_id = m.abt_id JOIN standorte s ON s.standort_id = m.abt_id;`
- `SELECT m.nachname, a.stadt FROM mitarbeiter m JOIN abteilungen a ON a.abt_id = m.abt_id;`
* `SELECT m.nachname, s.stadt FROM mitarbeiter m JOIN abteilungen a ON a.abt_id = m.abt_id JOIN standorte s ON s.standort_id = a.standort_id;`
! Der Standort hängt über a.standort_id an der Abteilung – zwei korrekte Join-Bedingungen nötig; abteilungen hat keine Spalte stadt.

? Welche Abfrage liefert Kunden, die noch nie bestellt haben?
- `SELECT firma FROM kunden k JOIN bestellungen b ON b.kunde_id = k.kunde_id WHERE b.best_id IS NULL;`
* `SELECT firma FROM kunden k WHERE NOT EXISTS (SELECT 1 FROM bestellungen b WHERE b.kunde_id = k.kunde_id);`
- `SELECT firma FROM kunden WHERE kunde_id NOT IN (SELECT best_id FROM bestellungen);`
- `SELECT firma FROM kunden k WHERE EXISTS (SELECT 1 FROM bestellungen b WHERE b.kunde_id <> k.kunde_id);`
! Ein INNER JOIN liefert keine NULL-Partner; die NOT-IN-Variante vergleicht falsche Spalten.

? Welche Abfrage liefert die fünf Kunden mit dem höchsten Umsatz (SQLite)?
- `SELECT TOP 5 kunde_id, SUM(p.menge * p.einzelpreis) FROM bestellungen b JOIN bestellpositionen p ON p.best_id = b.best_id GROUP BY kunde_id;`
- `SELECT b.kunde_id, SUM(p.menge * p.einzelpreis) AS u FROM bestellungen b JOIN bestellpositionen p ON p.best_id = b.best_id ORDER BY u DESC LIMIT 5;`
* `SELECT b.kunde_id, SUM(p.menge * p.einzelpreis) AS u FROM bestellungen b JOIN bestellpositionen p ON p.best_id = b.best_id GROUP BY b.kunde_id ORDER BY u DESC LIMIT 5;`
- `SELECT b.kunde_id, MAX(p.menge * p.einzelpreis) AS u FROM bestellungen b JOIN bestellpositionen p ON p.best_id = b.best_id GROUP BY b.kunde_id LIMIT 5;`
! Ohne GROUP BY gibt es nur eine Summe, MAX liefert die größte Position und ohne ORDER BY ist „Top“ zufällig.

? Welche Abfrage liefert Abteilungen mit einem Durchschnittsgehalt über 4500 Euro?
- `SELECT abt_id FROM mitarbeiter WHERE AVG(gehalt) > 4500 GROUP BY abt_id;`
- `SELECT abt_id, AVG(gehalt) FROM mitarbeiter WHERE gehalt > 4500 GROUP BY abt_id ORDER BY abt_id;`
- `SELECT abt_id FROM mitarbeiter GROUP BY abt_id WHERE AVG(gehalt) > 4500;`
* `SELECT abt_id, AVG(gehalt) FROM mitarbeiter GROUP BY abt_id HAVING AVG(gehalt) > 4500;`
! Bedingungen über Aggregate gehören in HAVING nach GROUP BY; WHERE gehalt > 4500 filtert nur einzelne Personen.

? Welcher Befehl gehört zur DDL?
- `UPDATE mitarbeiter SET gehalt = 5000 WHERE ma_id = 1;`
* `ALTER TABLE kunden ADD COLUMN umsatzsteuer_id TEXT;`
- `SELECT * FROM kunden;`
- `GRANT SELECT ON kunden TO vertrieb;`
! UPDATE und SELECT sind DML, GRANT ist DCL.

? Was liefert `SELECT COUNT(DISTINCT kunde_id) FROM bestellungen;`?
- Die Anzahl aller Bestellungen
- Die Summe aller Kundennummern
* Die Anzahl der Kunden, die mindestens einmal bestellt haben
- Die Anzahl aller Kunden in der Tabelle kunden, auch derer ohne Bestellung
! DISTINCT zählt jede Kundennummer in bestellungen nur einmal.

? Welche Anweisung erhöht den Lagerbestand von Artikel 7 um 10 Stück?
* `UPDATE artikel SET lagerbestand = lagerbestand + 10 WHERE artikel_id = 7;`
- `UPDATE artikel SET lagerbestand = 10 WHERE artikel_id = 7;`
- `INSERT INTO artikel (lagerbestand) VALUES (10) WHERE artikel_id = 7;`
- `UPDATE artikel lagerbestand + 10 WHERE artikel_id = 7;`
! „um 10 erhöhen“ heißt alter Wert + 10; INSERT legt eine neue Zeile an.

? Was bewirkt `DELETE FROM bestellpositionen WHERE best_id = 12;`?
- Löscht die Bestellung 12 samt Kopf
- Löscht die Tabelle bestellpositionen
* Löscht alle Positionen der Bestellung 12
- Löscht nur die erste Position der Bestellung 12
! Der Bestellkopf in bestellungen bleibt erhalten.

? Welche Abfrage liefert die Mitarbeitenden, die mehr verdienen als ihr Vorgesetzter?
- `SELECT nachname FROM mitarbeiter WHERE gehalt > vorgesetzter_id;`
- `SELECT m.nachname FROM mitarbeiter m JOIN mitarbeiter v ON v.ma_id = m.ma_id WHERE m.gehalt > v.gehalt;`
* `SELECT m.nachname FROM mitarbeiter m JOIN mitarbeiter v ON v.ma_id = m.vorgesetzter_id WHERE m.gehalt > v.gehalt;`
- `SELECT m.nachname FROM mitarbeiter m WHERE m.gehalt > MAX(gehalt);`
! Self-Join über vorgesetzter_id = ma_id; die zweite Variante verbindet jede Person mit sich selbst.

? Welche Abfrage liefert pro Projekt die Summe der gebuchten Stunden mit Projektnamen?
- `SELECT p.name, SUM(z.stunden) FROM projekte p JOIN zeiterfassung z GROUP BY p.name;`
* `SELECT p.name, SUM(z.stunden) FROM projekte p JOIN zeiterfassung z ON z.projekt_id = p.projekt_id GROUP BY p.projekt_id, p.name;`
- `SELECT p.name, z.stunden FROM projekte p JOIN zeiterfassung z ON z.projekt_id = p.projekt_id ORDER BY p.name ASC, z.stunden DESC;`
- `SELECT name, SUM(stunden) FROM projekte GROUP BY name;`
! Ohne ON entsteht ein Kreuzprodukt; ohne SUM/GROUP BY gibt es Einzelzeilen; projekte hat keine Spalte stunden.

? Wie lautet das T-SQL-Gegenstück zu `SELECT * FROM artikel ORDER BY verkaufspreis DESC LIMIT 3;`?
- `SELECT * FROM dbo.artikel ORDER BY verkaufspreis DESC LIMIT 3;`
* `SELECT TOP (3) * FROM dbo.artikel ORDER BY verkaufspreis DESC;`
- `SELECT * FROM dbo.artikel WHERE ROWNUM <= 3 ORDER BY verkaufspreis DESC;`
- `SELECT FIRST 3 * FROM dbo.artikel ORDER BY verkaufspreis DESC;`
! ROWNUM ist Oracle, FIRST ist Firebird/Informix.

? Welcher Ausdruck verkettet in SQL Server Vor- und Nachname NULL-sicher?
- `vorname || ' ' || nachname`
- `vorname + ' ' + nachname`
- `JOIN(vorname, ' ', nachname)`
* `CONCAT(vorname, ' ', nachname)`
! `+` ergibt NULL, sobald ein Teil NULL ist; CONCAT behandelt NULL als leeren Text. `||` ist SQLite/Standard.

? Welche Abfrage liefert alle Artikel mit einer Marge (Verkauf − Einkauf) über 100 Euro, absteigend sortiert?
* `SELECT bezeichnung, verkaufspreis - einkaufspreis AS marge FROM artikel WHERE verkaufspreis - einkaufspreis > 100 ORDER BY marge DESC;`
- `SELECT bezeichnung, verkaufspreis - einkaufspreis AS marge FROM artikel HAVING marge > 100;`
- `SELECT bezeichnung, verkaufspreis - einkaufspreis AS marge FROM artikel GROUP BY bezeichnung HAVING verkaufspreis > 100 ORDER BY marge DESC;`
- `SELECT bezeichnung, SUM(verkaufspreis - einkaufspreis) FROM artikel WHERE marge > 100;`
! Die Spalte marge existiert nicht in der Tabelle; im Standard ist der Alias in WHERE nicht sichtbar, daher Ausdruck wiederholen.

? Welche Abfrage liefert das jüngste Eintrittsdatum?
- `SELECT MIN(eintritt) FROM mitarbeiter;`
* `SELECT MAX(eintritt) FROM mitarbeiter;`
- `SELECT eintritt FROM mitarbeiter ORDER BY eintritt LIMIT 1;`
- `SELECT LAST(eintritt) FROM mitarbeiter;`
! ISO-Datumstexte sortieren chronologisch; das jüngste (späteste) Datum ist das Maximum.

? Was ergibt `SELECT COUNT(*) FROM mitarbeiter, abteilungen;` bei 100 Mitarbeitenden und 10 Abteilungen?
- 100
- 110
* 1000
- 10
! Kartesisches Produkt: 100 × 10.

? Welche Anweisung legt eine Tabelle mit einem zusammengesetzten Primärschlüssel an?
- `CREATE TABLE pm (projekt_id INTEGER PRIMARY KEY, ma_id INTEGER PRIMARY KEY, rolle TEXT);`
- `CREATE TABLE pm (projekt_id INTEGER, ma_id INTEGER, UNIQUE KEY);`
* `CREATE TABLE pm (projekt_id INTEGER, ma_id INTEGER, PRIMARY KEY (projekt_id, ma_id));`
- `CREATE TABLE pm (projekt_id + ma_id INTEGER PRIMARY KEY);`
! Zusammengesetzte Schlüssel stehen als Tabellen-Constraint am Ende.

? Welche Bedingung im CREATE TABLE stellt sicher, dass Stunden größer 0 und höchstens 12 sind?
- `stunden REAL DEFAULT (0, 12)`
- `stunden REAL CHECK (stunden BETWEEN 0 AND 12) DEFAULT 0`
* `stunden REAL CHECK (stunden > 0 AND stunden <= 12)`
- `stunden REAL NOT NULL (12)`
! So ist es im Schema der zeiterfassung definiert; BETWEEN 0 AND 12 würde auch 0 Stunden erlauben.

? Welche Aussage zu `INTEGER PRIMARY KEY` in SQLite ist richtig?
* Die Spalte ist ein Alias der rowid und wird automatisch vergeben
- Die Spalte darf doppelte Werte enthalten
- Es muss zusätzlich AUTOINCREMENT angegeben werden, sonst gibt es keinen Autowert
- Die Spalte entspricht IDENTITY und ist nur in SQL Server erlaubt
! AUTOINCREMENT verhindert nur die Wiederverwendung gelöschter IDs.

? Welche Abfrage liefert pro Kunde die Anzahl Bestellungen, nur Kunden mit mindestens 3?
- `SELECT kunde_id, COUNT(*) FROM bestellungen WHERE COUNT(*) >= 3;`
- `SELECT kunde_id, COUNT(*) FROM bestellungen GROUP BY best_id HAVING COUNT(*) >= 3;`
* `SELECT kunde_id, COUNT(*) FROM bestellungen GROUP BY kunde_id HAVING COUNT(*) >= 3;`
- `SELECT kunde_id, COUNT(*) >= 3 FROM bestellungen GROUP BY kunde_id;`
! GROUP BY best_id bildet Gruppen mit je genau einer Zeile.

? Welche ACID-Eigenschaft verlangt, dass eine Umbuchung entweder komplett oder gar nicht ausgeführt wird?
- Durability
- Isolation
- Consistency
* Atomicity
! Atomarität = alles oder nichts.

? Ein Administrator führt `BEGIN; DELETE FROM zeiterfassung; ROLLBACK;` aus. Wie viele Zeilen hat zeiterfassung danach?
- 0
* Genauso viele wie vorher
- Nur noch die Zeilen von heute
- Das hängt vom Autocommit ab, meist 0
! ROLLBACK verwirft die Löschung vollständig.

? Wozu dient `EXPLAIN QUERY PLAN` in SQLite?
- Es führt die Abfrage schneller aus
- Es legt automatisch fehlende Indizes an
* Es zeigt, ob eine Tabelle gescannt oder per Index durchsucht wird
- Es erklärt Syntaxfehler in verständlicher Sprache und schlägt Korrekturen vor
! SCAN = ganze Tabelle, SEARCH … USING INDEX = Indexzugriff.

? Welche Anweisung legt einen Index an, der Abfragen nach Mitarbeiter und Datum in der Zeiterfassung beschleunigt?
- `CREATE VIEW idx AS SELECT ma_id, datum FROM zeiterfassung;`
- `ALTER TABLE zeiterfassung ADD INDEX (datum, stunden);`
* `CREATE INDEX idx_zeit_ma_datum ON zeiterfassung (ma_id, datum);`
- `CREATE INDEX idx_zeit ON zeiterfassung (taetigkeit);`
! Index auf die Filterspalten in passender Reihenfolge; ADD INDEX ist MySQL-Syntax.

? Wozu dient eine View `v_telefonliste` ohne Spalten gehalt und geburtsdatum vor allem?
- Sie beschleunigt Abfragen auf mitarbeiter
* Sie zeigt nur nötige Daten und unterstützt so den Datenschutz
- Sie erstellt eine Sicherungskopie der Tabelle
- Sie verhindert alle Änderungen an der Tabelle mitarbeiter, solange die View existiert
! Datenminimierung: Empfang erhält Rechte nur auf die View.

? Welche Abfrage liefert die Mitarbeitenden mit dem höchsten Gehalt je Abteilung (SQLite ab 3.25)?
- `SELECT abt_id, nachname, MAX(gehalt) FROM mitarbeiter;`
- `SELECT abt_id, nachname, gehalt FROM mitarbeiter WHERE austritt IS NULL AND RANK() OVER (PARTITION BY abt_id ORDER BY gehalt DESC) = 1;`
- `SELECT abt_id, nachname, gehalt FROM mitarbeiter ORDER BY gehalt DESC LIMIT 1;`
* `SELECT abt_id, nachname, gehalt FROM (SELECT *, RANK() OVER (PARTITION BY abt_id ORDER BY gehalt DESC) AS r FROM mitarbeiter) WHERE r = 1;`
! Fensterfunktionen dürfen nicht in WHERE stehen; LIMIT 1 liefert nur eine Person insgesamt.

? Was ist das Ergebnis von `SELECT date('2026-01-31', '+1 day');` in SQLite?
- `2026-01-32`
* `2026-02-01`
- `2026-01-30`
- NULL
! date() rechnet kalendarisch korrekt über Monatsgrenzen.

? Welcher T-SQL-Ausdruck entspricht `julianday('2026-03-01') - julianday(eintritt)`?
- `DATEADD(day, eintritt, '2026-03-01')`
- `DATEPART(day, '2026-03-01' - eintritt)`
- `DATEDIFF(day, '2026-03-01', eintritt)`
* `DATEDIFF(day, eintritt, '2026-03-01')`
! DATEDIFF(einheit, start, ende) – die vertauschte Variante liefert einen negativen Wert.

? Welche Abfrage zeigt Bestellungen mit deutschem Datumsformat in SQLite?
* `SELECT best_id, strftime('%d.%m.%Y', datum) FROM bestellungen;`
- `SELECT best_id, FORMAT(datum, 'dd.MM.yyyy') FROM bestellungen;`
- `SELECT best_id, CONVERT(CHAR(10), datum, 104) FROM bestellungen;`
- `SELECT best_id, date(datum, 'de-DE') FROM bestellungen;`
! FORMAT und CONVERT mit Stil 104 sind T-SQL.

? Welche Abfrage nutzt CASE korrekt zur Einteilung der Bestellstatus?
- `SELECT best_id, CASE IF status IN ('offen','versendet') THEN 'in Arbeit' ELSE 'erledigt' FROM bestellungen ORDER BY best_id;`
- `SELECT best_id, IF(status = 'offen', 'offen') END FROM bestellungen;`
* `SELECT best_id, CASE WHEN status IN ('offen','versendet') THEN 'in Arbeit' ELSE 'erledigt' END FROM bestellungen;`
- `SELECT best_id, CASE status WHEN IN ('offen') 'in Arbeit' END FROM bestellungen;`
! CASE WHEN … THEN … ELSE … END; das Schlüsselwort END ist Pflicht.

? Was passiert in SQLite mit aktivem `PRAGMA foreign_keys = ON` bei `DELETE FROM kunden WHERE kunde_id = 1;`, wenn Kunde 1 Bestellungen hat (ohne ON DELETE-Aktion)?
- Die Bestellungen werden mitgelöscht
- Die kunde_id der Bestellungen wird NULL
* Fehler: FOREIGN KEY constraint failed
- Der Kunde wird gelöscht, die Bestellungen bleiben verwaist
! Standardaktion NO ACTION verweigert das Löschen referenzierter Zeilen.

? Welche Unterabfrage-Art liefert genau einen einzigen Wert?
- Listen-Unterabfrage
- Abgeleitete Tabelle
* Skalare Unterabfrage
- EXISTS-Unterabfrage
! Beispiel: `(SELECT AVG(gehalt) FROM mitarbeiter)`.

? Welche Abfrage liefert Mitarbeitende, die in Projekt 3 eingeplant sind?
- `SELECT nachname FROM mitarbeiter WHERE projekt_id = 3;`
* `SELECT m.nachname FROM mitarbeiter m JOIN projekt_mitarbeiter pm ON pm.ma_id = m.ma_id WHERE pm.projekt_id = 3;`
- `SELECT m.nachname FROM mitarbeiter m JOIN projekte p ON p.leiter_id = m.ma_id WHERE p.projekt_id = 3;`
- `SELECT nachname FROM projekt_mitarbeiter WHERE projekt_id = 3;`
! Die m:n-Beziehung läuft über projekt_mitarbeiter; leiter_id liefert nur die Projektleitung.

? Was liefert in SQLite `SELECT 7 / 2;`?
* 3
- 3.5
- 4
- Einen Fehler
! Zwei INTEGER ergeben eine ganzzahlige Division; mit `7 / 2.0` oder `7 * 1.0 / 2` erhält man 3.5.

? Welche Isolationsstufe ist in SQL Server voreingestellt?
- SERIALIZABLE
- READ UNCOMMITTED
* READ COMMITTED
- REPEATABLE READ
! Verhindert Dirty Reads, erlaubt aber Non-repeatable und Phantom Reads.

? Welche Abfrage zählt die verschiedenen Städte, in denen Kunden sitzen?
- `SELECT COUNT(stadt) FROM kunden;`
- `SELECT DISTINCT COUNT(stadt) FROM kunden;`
- `SELECT COUNT(*) FROM kunden GROUP BY stadt;`
* `SELECT COUNT(DISTINCT stadt) FROM kunden;`
! DISTINCT muss innerhalb von COUNT stehen; GROUP BY liefert eine Zeile je Stadt.

? Welche Abfrage liefert die Gesamtstunden je Monat 2025 in T-SQL?
- `SELECT strftime('%m', datum), SUM(stunden) FROM dbo.zeiterfassung GROUP BY strftime('%m', datum);`
* `SELECT MONTH(datum) AS monat, SUM(stunden) FROM dbo.zeiterfassung WHERE YEAR(datum) = 2025 GROUP BY MONTH(datum);`
- `SELECT MONTH(datum) AS monat, SUM(stunden) FROM dbo.zeiterfassung WHERE YEAR(datum) = 2025 GROUP BY monat;`
- `SELECT datum, SUM(stunden) OVER (PARTITION BY datum) FROM dbo.zeiterfassung;`
! In T-SQL ist ein SELECT-Alias in GROUP BY nicht erlaubt; strftime ist SQLite.

? Was ist ein typisches Merkmal einer korrelierten Unterabfrage?
- Sie wird immer genau einmal vor der äußeren Abfrage ausgeführt
* Sie verweist auf eine Spalte der äußeren Abfrage
- Sie darf nur in der FROM-Klausel stehen
- Sie liefert immer mehrere Spalten
! Logisch wird sie für jede äußere Zeile neu ausgewertet.

? Welche Anweisung fügt drei Artikel in einem Befehl ein?
- `INSERT INTO artikel (bezeichnung) VALUES ('A'); ('B'); ('C');`
- `INSERT INTO artikel (bezeichnung) VALUES ('A', 'B', 'C');`
* `INSERT INTO artikel (bezeichnung) VALUES ('A'), ('B'), ('C');`
- `INSERT ALL INTO artikel (bezeichnung) ('A', 'B', 'C');`
! Jede Zeile in eigene Klammern, durch Komma getrennt; die zweite Variante wären drei Werte für eine Spalte.

? Was beschreibt ein „Lost Update“?
- Ein Update ohne WHERE-Klausel
- Ein Update, das wegen eines Fehlers nicht ausgeführt wurde
* Eine parallele Änderung überschreibt eine andere unbemerkt
- Ein Update, das durch ROLLBACK zurückgenommen wurde
! Abhilfe: Sperren, höhere Isolationsstufe oder relative Updates (`SET bestand = bestand - 5`).

? Welche Aussage zu RIGHT JOIN im SQL-Labor (sql.js 1.10, SQLite 3.45) trifft zu?
- Er ist nicht verfügbar, nur LEFT JOIN funktioniert
* Er funktioniert, da SQLite ihn seit Version 3.39 unterstützt
- Er funktioniert nur in Verbindung mit CROSS JOIN
- Er wird automatisch in einen INNER JOIN umgewandelt
! Ältere SQLite-Versionen unterstützten nur LEFT JOIN.

? Was bewirkt `TOP (3) WITH TIES` in T-SQL bei `ORDER BY gehalt DESC`?
- Es liefert genau drei Zeilen, Gleichstände werden zufällig abgeschnitten
- Es liefert drei Zeilen je Abteilung
- Es liefert nur Zeilen, deren Gehalt dreimal vorkommt
* Es liefert die drei höchsten Gehälter plus alle Zeilen mit gleichem Wert wie Platz 3
! Ohne WITH TIES würde bei Gleichstand willkürlich abgeschnitten.

? Welche Aussage zur Typ-Affinität in SQLite ist richtig?
- `VARCHAR(10)` schneidet längere Texte ab
- Jede Spalte akzeptiert nur exakt den deklarierten Typ
* Deklarierte Typen sind Empfehlungen; die Länge bei VARCHAR wird nicht geprüft
- SQLite kennt nur den Datentyp TEXT und wandelt Zahlen beim Speichern immer in Text um
! Strenge Typprüfung bieten erst STRICT-Tabellen (ab 3.37).
