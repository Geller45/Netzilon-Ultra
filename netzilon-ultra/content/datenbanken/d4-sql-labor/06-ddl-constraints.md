---
id: db-labor-ddl
bereich: Datenbanken
block: D4
kapitel: SQL-Labor (Firmen-DB)
titel: CREATE, ALTER, DROP – Tabellen und Constraints
stufe: Fortgeschritten
fach: SQL / Datenbanken
pruefungen: [AP1, AP2, Schule]
quellen: [SQLite-Dokumentation, Microsoft Learn – T-SQL]
verweise: [db-ddl, db-erd-tabelle, db-normalisierung, db-labor-dml, db-labor-views-indizes]
---

## Profi

### DDL im Überblick
Die **Data Definition Language** legt die Struktur fest: `CREATE` (anlegen), `ALTER` (ändern), `DROP` (entfernen). Das Schema der Firmen-DB der **Netzilon GmbH** wurde komplett per DDL erzeugt; im SQL-Labor siehst du es z. B. mit `SELECT sql FROM sqlite_master WHERE type = 'table';`. Probier es im SQL-Labor (Werkzeuge) aus.

### CREATE TABLE – Beispiel aus der Firmen-DB
```sql
CREATE TABLE IF NOT EXISTS schulungen (
  schulung_id   INTEGER PRIMARY KEY,                       -- Primärschlüssel, automatisch vergeben
  titel         TEXT    NOT NULL,                          -- Pflichtfeld
  ma_id         INTEGER NOT NULL
                REFERENCES mitarbeiter(ma_id) ON DELETE CASCADE,
  datum         TEXT    NOT NULL CHECK (datum LIKE '____-__-__'),
  kosten        REAL    DEFAULT 0 CHECK (kosten >= 0),
  anbieter      TEXT,
  zertifikat    INTEGER NOT NULL DEFAULT 0 CHECK (zertifikat IN (0, 1)),
  UNIQUE (ma_id, titel, datum)                             -- Tabellen-Constraint
);
```

### Datentypen
**SQLite** kennt nur fünf Speicherklassen: `NULL`, `INTEGER`, `REAL`, `TEXT`, `BLOB`. Deklarierte Typen bestimmen nur die **Typ-Affinität** (type affinity): `VARCHAR(50)` → TEXT-Affinität, `DECIMAL(10,2)` → NUMERIC, `BOOLEAN` → NUMERIC. Die Länge wird **nicht** geprüft – `VARCHAR(5)` nimmt auch 500 Zeichen. In normalen Tabellen kann man sogar Text in eine INTEGER-Spalte schreiben (er wird gespeichert, wenn er sich nicht umwandeln lässt). Seit 3.37 erzwingen **STRICT-Tabellen** (`CREATE TABLE … (…) STRICT;`) echte Typen. Datum/Uhrzeit wird als ISO-Text (`'2026-03-01'`), REAL (Julianisches Datum) oder INTEGER (Unix-Zeit) gespeichert.

**SQL Server** ist **streng typisiert**:
| Zweck | T-SQL-Typ | Firmen-DB |
|---|---|---|
| Ganzzahl | `INT`, `BIGINT`, `SMALLINT`, `TINYINT` | IDs, menge |
| Festkomma (Geld) | `DECIMAL(10,2)` / `NUMERIC`, `MONEY` | gehalt, preise, budget |
| Gleitkomma | `FLOAT`, `REAL` | Messwerte (für Geld ungeeignet) |
| Text | `NVARCHAR(n)` (Unicode), `VARCHAR(n)`, `NCHAR(n)` | Namen mit Umlauten → NVARCHAR |
| Datum/Zeit | `DATE`, `TIME`, `DATETIME2`, `DATETIMEOFFSET` | eintritt, datum |
| Wahrheitswert | `BIT` (0/1/NULL) | azubi |
| Binär | `VARBINARY(MAX)` | Dokumente |
| GUID | `UNIQUEIDENTIFIER` | verteilte Schlüssel |

### Constraints (Integritätsbedingungen)
| Constraint | Wirkung | Beispiel Firmen-DB |
|---|---|---|
| `PRIMARY KEY` | eindeutig + identifiziert Zeile (SQLite: bei Nicht-INTEGER-PK leider NULL erlaubt) | `ma_id`, zusammengesetzt `(projekt_id, ma_id)` |
| `FOREIGN KEY` / `REFERENCES` | Wert muss in Elterntabelle existieren | `mitarbeiter.abt_id → abteilungen.abt_id` |
| `UNIQUE` | keine Duplikate (NULL mehrfach erlaubt in SQLite; SQL Server: nur **ein** NULL) | `benutzername`, `email` |
| `NOT NULL` | Pflichtfeld | `vorname`, `eintritt` |
| `CHECK` | Bedingung muss wahr (oder NULL) sein | `gehalt > 0`, `status IN (...)` |
| `DEFAULT` | Standardwert, wenn nicht angegeben | `wochenstunden DEFAULT 40` |

**Spalten-Constraint** steht direkt hinter der Spalte; **Tabellen-Constraint** am Ende (nötig für zusammengesetzte Schlüssel). Benannte Constraints erleichtern Fehlersuche und Löschen: `CONSTRAINT chk_gehalt CHECK (gehalt > 0)`.

### ON DELETE / ON UPDATE – referenzielle Aktionen
| Aktion | Wirkung beim Löschen des Elternsatzes |
|---|---|
| `NO ACTION` / `RESTRICT` (Standard) | Löschen wird verweigert, solange Kinder existieren |
| `CASCADE` | Kinder werden mitgelöscht (Schulungen eines gelöschten Mitarbeiters) |
| `SET NULL` | Fremdschlüssel der Kinder wird NULL (z. B. `bestellungen.ma_id`, wenn Bearbeiter gelöscht) |
| `SET DEFAULT` | Fremdschlüssel erhält den DEFAULT-Wert |

Vorsicht mit CASCADE: Ein DELETE auf `kunden` könnte über mehrere Ebenen Bestellungen und Positionen löschen.

### ALTER TABLE
SQLite unterstützt nur einen Teil:
```sql
ALTER TABLE kunden ADD COLUMN umsatzsteuer_id TEXT;
ALTER TABLE kunden RENAME COLUMN ansprechpartner TO kontaktperson;
ALTER TABLE kunden DROP COLUMN umsatzsteuer_id;      -- seit SQLite 3.35
ALTER TABLE kunden RENAME TO kunden_alt;
```
**Nicht** möglich in SQLite: Datentyp ändern, Constraint hinzufügen/entfernen. Dafür: neue Tabelle anlegen, Daten mit `INSERT … SELECT` kopieren, alte löschen, neue umbenennen (in einer Transaktion, FK-Prüfung vorher aus). `ADD COLUMN` mit `NOT NULL` braucht einen DEFAULT.

### DROP und Co.
- `DROP TABLE IF EXISTS schulungen;` – entfernt Tabelle samt Daten, Indizes und Triggern. Bei aktiven Fremdschlüsseln scheitert DROP, wenn noch Kindzeilen auf die Tabelle verweisen.
- `TRUNCATE TABLE` (T-SQL) leert die Tabelle schnell; SQLite kennt kein TRUNCATE (`DELETE FROM t;` wird intern optimiert).

### Schema auslesen (SQLite)
- `PRAGMA table_info(mitarbeiter);` – Spalten, Typen, NOT NULL, DEFAULT, PK
- `PRAGMA foreign_key_list(mitarbeiter);` – Fremdschlüssel
- `PRAGMA foreign_key_check;` – verletzte Fremdschlüssel finden

### T-SQL-Unterschied
| Thema | SQLite (SQL-Labor) | T-SQL (SQL Server) |
|---|---|---|
| Autowert | `INTEGER PRIMARY KEY` (rowid), mit `AUTOINCREMENT` keine Wiederverwendung gelöschter IDs | `INT IDENTITY(1,1) PRIMARY KEY` oder `SEQUENCE` |
| Typen | Typ-Affinität, Länge ignoriert (außer STRICT) | strenge Typen, Länge wird geprüft (Fehler „String or binary data would be truncated“) |
| Boolean | INTEGER 0/1 | `BIT` |
| Datum | TEXT `'YYYY-MM-DD'` | `DATE`, Standard `GETDATE()` / `SYSDATETIME()` |
| Spalte ändern | Tabelle neu aufbauen | `ALTER TABLE t ALTER COLUMN spalte NVARCHAR(100) NOT NULL;` |
| Constraint nachträglich | nicht möglich | `ALTER TABLE t ADD CONSTRAINT chk_x CHECK (...);` / `DROP CONSTRAINT` |
| Spalte hinzufügen | `ADD COLUMN` | `ADD spalte TYP` (ohne COLUMN) |
| Existenzprüfung | `IF NOT EXISTS` / `IF EXISTS` | `DROP TABLE IF EXISTS` (ab 2016); CREATE meist mit `IF OBJECT_ID('dbo.t') IS NULL` |
| FK-Prüfung | pro Verbindung `PRAGMA foreign_keys = ON` | immer aktiv, abschaltbar per `NOCHECK CONSTRAINT` |
| Schema | `main` | Schemas wie `dbo`, `hr`, `sales` |

## Einfach

Bevor man Karteikarten in einen Schrank legen kann, muss man den **Schrank bauen**. Das macht die **DDL**:
- **CREATE TABLE** = neue Schublade bauen und festlegen, welche **Felder** jede Karte hat (Name, Datum, Preis …).
- **ALTER TABLE** = Schublade **umbauen**, z. B. ein neues Feld hinzufügen.
- **DROP TABLE** = Schublade samt Inhalt **wegwerfen**.

Damit keine Unordnung entsteht, gibt es **Regeln (Constraints)**:
- **PRIMARY KEY** – jede Karte hat eine **eigene Nummer**, keine zweimal (wie eine Ausweisnummer).
- **FOREIGN KEY** – ein Feld darf nur Nummern enthalten, die es in einer **anderen Schublade** wirklich gibt (eine Mitarbeiterin kann nur in einer Abteilung sein, die existiert).
- **UNIQUE** – kein Doppel, z. B. jede E-Mail-Adresse nur einmal.
- **NOT NULL** – dieses Feld **muss** ausgefüllt sein (Eintrittsdatum).
- **CHECK** – eine **Prüfregel**: Gehalt muss größer als 0 sein.
- **DEFAULT** – wenn nichts eingetragen wird, steht automatisch ein Standardwert da (40 Wochenstunden).

**ON DELETE CASCADE** ist wie eine Kette: Wirfst du die Karte eines Mitarbeiters weg, fallen alle seine Schulungskarten automatisch mit.

Probier es im SQL-Labor (Werkzeuge) aus: Lege die Tabelle `schulungen` an und versuche, Regeln zu brechen – die Datenbank meldet sich sofort.

## Merksatz
- **DDL baut den Schrank, DML füllt ihn.**
- PK = eindeutig + nicht NULL; FK = muss existieren.
- **P**rima **F**reunde **U**nterstützen **N**ie **C**haos: PRIMARY KEY, FOREIGN KEY, UNIQUE, NOT NULL, CHECK.
- SQLite: Typ-Affinität, VARCHAR-Länge egal; SQL Server: strenge Typen.
- SQLite: AUTOINCREMENT ↔ SQL Server: IDENTITY.

## Prüfungsfalle
- `VARCHAR(5)` begrenzt in SQLite **nichts** – in SQL Server schon.
- `CHECK (gehalt > 0)` lässt NULL durch (UNKNOWN zählt nicht als Verstoß) – zusätzlich NOT NULL setzen, wenn Pflicht.
- UNIQUE erlaubt in SQLite mehrere NULL, in SQL Server nur eines.
- SQLite: Fremdschlüssel wirken nur mit `PRAGMA foreign_keys = ON`.
- `ON DELETE CASCADE` kann unbemerkt große Datenmengen löschen.
- SQLite kann keinen Datentyp per ALTER ändern und keine Constraints nachträglich hinzufügen.
- Geldbeträge nicht als FLOAT, sondern DECIMAL (Rundungsfehler).

## Grafik
### Tabelle anlegen und Regeln prüfen
1. Admin -> SQLite: CREATE TABLE schulungen mit PK, FK, CHECK
2. SQLite: speichert Definition in sqlite_master
3. Admin -> SQLite: INSERT mit kosten = -50
4. SQLite -> Admin: CHECK constraint failed
5. Admin -> SQLite: INSERT mit gültigen Werten
6. SQLite -> Admin: Zeile gespeichert, schulung_id vergeben

### ON DELETE CASCADE
1. mitarbeiter: Zeile ma_id 42 wird gelöscht
2. SQLite: sucht abhängige Zeilen in schulungen
3. schulungen: alle Zeilen mit ma_id 42 werden mitgelöscht
4. Ergebnis: keine verwaisten Schulungen

## Lab
### GUI
Maschine: SQL-Labor in Netzilon (Werkzeuge → SQL-Labor), Firmen-DB „Netzilon GmbH“ (nach dem Lab zurücksetzen).
1. Schema der Tabelle mitarbeiter mit `PRAGMA table_info` ansehen.
2. Tabelle `schulungen` mit PK, FK (ON DELETE CASCADE), CHECK, DEFAULT und UNIQUE anlegen.
3. Gültige Schulung einfügen, dann CHECK- und FK-Verletzung testen.
4. Spalte `dauer_tage` hinzufügen und eine Spalte umbenennen.
5. Typ-Affinität testen: Text in eine INTEGER-Spalte schreiben und `typeof()` prüfen.
6. Tabelle wieder löschen.

```sql
-- 1
PRAGMA table_info(mitarbeiter);

-- 2 und 3
CREATE TABLE IF NOT EXISTS schulungen (
  schulung_id INTEGER PRIMARY KEY,
  titel       TEXT NOT NULL,
  ma_id       INTEGER NOT NULL REFERENCES mitarbeiter(ma_id) ON DELETE CASCADE,
  datum       TEXT NOT NULL,
  kosten      REAL DEFAULT 0 CHECK (kosten >= 0),
  zertifikat  INTEGER NOT NULL DEFAULT 0 CHECK (zertifikat IN (0, 1)),
  UNIQUE (ma_id, titel, datum)
);
INSERT INTO schulungen (titel, ma_id, datum, kosten) VALUES ('Windows Server 2025 Grundlagen', 1, '2026-04-14', 890);
SELECT * FROM schulungen;

-- 4
ALTER TABLE schulungen ADD COLUMN dauer_tage INTEGER DEFAULT 1;
ALTER TABLE schulungen RENAME COLUMN kosten TO kosten_netto;

-- 5
CREATE TABLE typtest (zahl INTEGER, kurz VARCHAR(3));
INSERT INTO typtest VALUES ('42', 'deutlich mehr als drei Zeichen'), ('abc', 'x');
SELECT zahl, typeof(zahl), kurz, length(kurz) FROM typtest;

-- 6
DROP TABLE IF EXISTS schulungen;
DROP TABLE IF EXISTS typtest;
```

```text
-- Erwartete Fehler (Schritt 3)
INSERT INTO schulungen (titel, ma_id, datum, kosten) VALUES ('Test', 1, '2026-05-01', -50);
  → CHECK constraint failed: kosten >= 0
INSERT INTO schulungen (titel, ma_id, datum) VALUES ('Test', 9999, '2026-05-01');
  → FOREIGN KEY constraint failed
```

### T-SQL
Maschine: SQL01.example.com, SSMS, Datenbank `Netzilon`.
1. Tabelle mit IDENTITY, DECIMAL und benannten Constraints anlegen.
2. Spaltentyp mit `ALTER COLUMN` ändern, Constraint nachträglich hinzufügen.
3. Im Objekt-Explorer unter Tabellen → dbo.schulungen → Schlüssel/Einschränkungen prüfen.

```tsql
USE Netzilon;
CREATE TABLE dbo.schulungen (
  schulung_id INT IDENTITY(1,1) CONSTRAINT pk_schulungen PRIMARY KEY,
  titel       NVARCHAR(200) NOT NULL,
  ma_id       INT NOT NULL CONSTRAINT fk_schulungen_ma
              REFERENCES dbo.mitarbeiter(ma_id) ON DELETE CASCADE,
  datum       DATE NOT NULL CONSTRAINT df_schulungen_datum DEFAULT (CAST(GETDATE() AS DATE)),
  kosten      DECIMAL(10,2) NOT NULL CONSTRAINT df_schulungen_kosten DEFAULT (0)
              CONSTRAINT chk_schulungen_kosten CHECK (kosten >= 0),
  zertifikat  BIT NOT NULL CONSTRAINT df_schulungen_zert DEFAULT (0)
);
ALTER TABLE dbo.schulungen ALTER COLUMN titel NVARCHAR(300) NOT NULL;
ALTER TABLE dbo.schulungen ADD anbieter NVARCHAR(100) NULL;
ALTER TABLE dbo.schulungen ADD CONSTRAINT uq_schulungen UNIQUE (ma_id, titel, datum);
```

## Legende
### CREATE TABLE
- Was: DDL-Anweisung, die eine neue Tabelle mit Spalten, Typen und Constraints anlegt.
- Wie: `CREATE TABLE name (spalte TYP constraint, ..., tabellen_constraint);`
- Wann: Beim Umsetzen eines ER-Modells/Relationenschemas in die Datenbank.
- Wo: SQL-Labor (SQLite, Typ-Affinität), SQL01.example.com (T-SQL, strenge Typen).
- Warum: Struktur und Regeln sichern die Datenqualität dauerhaft in der Datenbank.
### Constraint
- Was: Integritätsbedingung – PRIMARY KEY, FOREIGN KEY, UNIQUE, NOT NULL, CHECK, DEFAULT.
- Wie: als Spalten- oder Tabellen-Constraint, optional benannt (`CONSTRAINT chk_gehalt CHECK (gehalt > 0)`).
- Warum: Ungültige Daten werden schon beim Schreiben abgelehnt – nicht erst in der Anwendung.
### ON DELETE
- Was: Referenzielle Aktion beim Löschen eines Elternsatzes.
- Wie: `REFERENCES mitarbeiter(ma_id) ON DELETE CASCADE | SET NULL | RESTRICT | NO ACTION`.
- Beispiel: Schulungen werden mit dem Mitarbeiter gelöscht (CASCADE).

## Karteikarten
- F: Welche Speicherklassen kennt SQLite? | A: NULL, INTEGER, REAL, TEXT, BLOB.
- F: Was bedeutet Typ-Affinität in SQLite? | A: Der deklarierte Typ ist nur eine Empfehlung zur Umwandlung; Länge und Typ werden nicht erzwungen (außer STRICT-Tabellen).
- F: Was ist das T-SQL-Gegenstück zu AUTOINCREMENT? | A: `IDENTITY(1,1)`.
- F: Was bewirkt ON DELETE CASCADE? | A: Beim Löschen des Elternsatzes werden abhängige Kindzeilen automatisch mitgelöscht.
- F: Was bewirkt ON DELETE SET NULL? | A: Der Fremdschlüssel der Kindzeilen wird auf NULL gesetzt.
- F: Unterschied Spalten- und Tabellen-Constraint? | A: Spalten-Constraint gilt für eine Spalte direkt hinter ihr; Tabellen-Constraint am Ende, nötig für mehrere Spalten (z. B. zusammengesetzter PK).
- F: Lässt CHECK (gehalt > 0) NULL zu? | A: Ja – UNKNOWN gilt nicht als Verstoß; zusätzlich NOT NULL nötig.
- F: Welcher Datentyp eignet sich in SQL Server für Geld? | A: `DECIMAL(p,s)`, z. B. `DECIMAL(10,2)` (oder MONEY), nicht FLOAT.
- F: Was kann ALTER TABLE in SQLite nicht? | A: Datentyp ändern, Constraints hinzufügen oder entfernen – dafür Tabelle neu aufbauen.
- F: Wie liest man in SQLite die Spalten einer Tabelle aus? | A: `PRAGMA table_info(tabelle);`
- F: Unterschied UNIQUE und PRIMARY KEY? | A: PK identifiziert die Zeile (einmal je Tabelle, nicht NULL); UNIQUE mehrfach möglich, NULL erlaubt.
- F: Warum NVARCHAR statt VARCHAR in SQL Server für Namen? | A: Unicode – Umlaute und internationale Zeichen sicher speicherbar.

## Quiz
? Welcher Constraint stellt sicher, dass `mitarbeiter.abt_id` nur existierende Abteilungen enthält?
- UNIQUE
- CHECK
* FOREIGN KEY
- DEFAULT
! Fremdschlüssel (REFERENCES abteilungen(abt_id)) sichern die referenzielle Integrität.

? Was passiert in SQLite bei `INSERT INTO typtest (kurz) VALUES ('ABCDEFGH');` mit `kurz VARCHAR(3)`?
* Der Wert wird vollständig gespeichert
- Der Wert wird auf ABC gekürzt
- Fehler: String or binary data would be truncated
- Der Wert wird als NULL gespeichert
! SQLite ignoriert die Längenangabe (Typ-Affinität TEXT). SQL Server meldet einen Fehler.

? Welche Spaltendefinition entspricht in T-SQL dem SQLite-Autowert?
- `ma_id INTEGER PRIMARY KEY AUTOINCREMENT`
- `ma_id INT AUTO_INCREMENT PRIMARY KEY`
* `ma_id INT IDENTITY(1,1) PRIMARY KEY`
- `ma_id SERIAL PRIMARY KEY`
! AUTO_INCREMENT ist MySQL, SERIAL ist PostgreSQL.

? Was bewirkt `REFERENCES mitarbeiter(ma_id) ON DELETE SET NULL` in `bestellungen.ma_id`?
- Bestellungen werden mit dem Mitarbeiter gelöscht
* Bestellungen bleiben, ma_id wird NULL
- Das Löschen des Mitarbeiters wird verweigert
- ma_id erhält den Wert 0
! SET NULL entkoppelt die Kindzeilen, statt sie zu löschen.

? Welche Anweisung fügt in SQLite der Tabelle kunden eine Spalte hinzu?
- `ALTER TABLE kunden MODIFY umsatzsteuer_id TEXT;`
- `UPDATE TABLE kunden ADD COLUMN umsatzsteuer_id TEXT;`
- `ALTER kunden INSERT COLUMN umsatzsteuer_id TEXT;`
* `ALTER TABLE kunden ADD COLUMN umsatzsteuer_id TEXT;`
! SQLite akzeptiert ADD COLUMN (COLUMN ist optional); T-SQL schreibt nur ADD.

? Welche Bedingung erlaubt nur die Bestellstatus des Schemas?
- `CHECK (status = 'offen' AND status = 'bezahlt')`
- `UNIQUE (status)`
* `CHECK (status IN ('offen','versendet','bezahlt','storniert'))`
- `DEFAULT ('offen','versendet','bezahlt','storniert')`
! IN-Liste im CHECK; AND mit zwei verschiedenen Werten wäre nie erfüllt.

? Wie wird der Primärschlüssel der Tabelle projekt_mitarbeiter definiert?
- `projekt_id INTEGER PRIMARY KEY, ma_id INTEGER PRIMARY KEY`
* `PRIMARY KEY (projekt_id, ma_id)` als Tabellen-Constraint
- `UNIQUE PRIMARY (projekt_id + ma_id)`
- Gar nicht, Zuordnungstabellen haben keinen PK
! Ein zusammengesetzter Schlüssel muss als Tabellen-Constraint stehen; zwei PKs gibt es nicht.

? Welche Aussage zu `CHECK (gehalt > 0)` stimmt?
- NULL-Werte werden abgelehnt
- Der Wert 0 wird akzeptiert
* NULL-Werte werden akzeptiert
- Negative Werte werden auf 0 gesetzt
! UNKNOWN ist kein Verstoß. Pflichtfeld → zusätzlich NOT NULL.

? Was kann SQLite mit ALTER TABLE NICHT?
- Spalte hinzufügen
- Tabelle umbenennen
- Spalte umbenennen
* Datentyp einer Spalte ändern
! Typänderungen und neue Constraints erfordern in SQLite einen Neuaufbau der Tabelle.

? Welcher Datentyp ist in SQL Server für Gehälter am besten geeignet?
- `FLOAT`
- `NVARCHAR(20)`
* `DECIMAL(10,2)`
- `INT`
! Festkomma vermeidet Rundungsfehler; INT verliert die Cent-Stellen.

? Wie viele NULL-Werte erlaubt eine UNIQUE-Spalte in SQL Server (ohne gefilterten Index)?
- Keinen
* Einen
- Beliebig viele
- Zwei
! SQL Server behandelt NULL bei UNIQUE als gleich; SQLite (und der Standard) erlauben mehrere NULL.

? Was macht `DROP TABLE schulungen;`?
- Löscht nur die Daten, die Struktur bleibt
* Entfernt Tabelle, Daten und zugehörige Indizes
- Leert die Tabelle und setzt den Autowert zurück
- Deaktiviert die Tabelle vorübergehend
! Daten löschen bei erhaltener Struktur: DELETE (bzw. TRUNCATE in T-SQL).

## Lücken
- In SQLite bestimmt der deklarierte Typ nur die {Typ-Affinität|Affinität}; erst {STRICT}-Tabellen erzwingen Typen.
- Der SQLite-Autowert heißt in T-SQL {IDENTITY}.
- Ein {FOREIGN KEY} verweist auf den Primärschlüssel einer anderen Tabelle; mit {ON DELETE CASCADE} werden Kindzeilen mitgelöscht.
- Pflichtfelder kennzeichnet man mit {NOT NULL}, Standardwerte mit {DEFAULT}.

## Zuordnen
### Constraint und Beispiel im Schema
- PRIMARY KEY => ma_id in mitarbeiter
- FOREIGN KEY => abt_id verweist auf abteilungen
- UNIQUE => benutzername und email
- NOT NULL => eintritt
- CHECK => gehalt > 0
- DEFAULT => wochenstunden 40

## Reihenfolge
### Tabelle in SQLite nachträglich mit neuem Constraint versehen
1. PRAGMA foreign_keys = OFF setzen
2. BEGIN – Transaktion starten
3. Neue Tabelle mit gewünschtem Constraint anlegen (CREATE TABLE neu)
4. Daten mit INSERT INTO neu SELECT … FROM alt kopieren
5. Alte Tabelle mit DROP TABLE löschen
6. Neue Tabelle mit ALTER TABLE … RENAME TO umbenennen
7. COMMIT und PRAGMA foreign_key_check ausführen

## Freitext
- F: Erläutern Sie den Unterschied zwischen der Typ-Affinität in SQLite und den strengen Datentypen in SQL Server an einem Beispiel aus der Firmen-DB. | M: SQLite speichert z. B. in `benutzername VARCHAR(20)` auch längere Texte und kann in INTEGER-Spalten Text ablegen; der Typ ist nur eine Umwandlungsempfehlung (Affinität). SQL Server prüft Typ und Länge streng und meldet bei zu langen Werten einen Fehler; Abhilfe in SQLite: STRICT-Tabellen oder CHECK (length(x) <= 20). | P: 4
- F: Entwerfen Sie eine Tabelle `geraete` (Inventar), die jedem Gerät höchstens einen Mitarbeitenden zuordnet; beim Austritt/Löschen des Mitarbeitenden soll das Gerät erhalten bleiben. | M: `CREATE TABLE geraete (geraet_id INTEGER PRIMARY KEY, inventarnr TEXT NOT NULL UNIQUE, typ TEXT NOT NULL, ma_id INTEGER REFERENCES mitarbeiter(ma_id) ON DELETE SET NULL, anschaffung TEXT, preis REAL CHECK (preis >= 0));` | P: 5

## Szenario
### Weiterbildungen erfassen
Die Personalabteilung der Netzilon GmbH möchte Weiterbildungen der Mitarbeitenden in der Firmen-DB erfassen: Titel, Datum, Kosten (nicht negativ), Anbieter, ob ein Zertifikat erworben wurde. Dieselbe Schulung darf am gleichen Tag nicht doppelt für dieselbe Person eingetragen werden. Wird ein Datensatz eines Mitarbeitenden gelöscht, sollen seine Schulungen verschwinden.
- F: Schreiben Sie die CREATE-TABLE-Anweisung für SQLite. | A: `CREATE TABLE schulungen (schulung_id INTEGER PRIMARY KEY, titel TEXT NOT NULL, ma_id INTEGER NOT NULL REFERENCES mitarbeiter(ma_id) ON DELETE CASCADE, datum TEXT NOT NULL, kosten REAL NOT NULL DEFAULT 0 CHECK (kosten >= 0), anbieter TEXT, zertifikat INTEGER NOT NULL DEFAULT 0 CHECK (zertifikat IN (0,1)), UNIQUE (ma_id, titel, datum));` | P: 5
- F: Welche Datentypen wählen Sie in SQL Server für kosten, datum und zertifikat? | A: kosten DECIMAL(10,2), datum DATE, zertifikat BIT. | P: 2
- F: Später soll die Spalte `anbieter` Pflicht werden. Wie gehen Sie in SQLite und in SQL Server vor? | A: SQL Server: leere Werte füllen, dann `ALTER TABLE dbo.schulungen ALTER COLUMN anbieter NVARCHAR(100) NOT NULL;`. SQLite: Tabelle neu aufbauen (neue Tabelle, Daten kopieren, alte löschen, umbenennen). | P: 3
- F: Warum ist ON DELETE CASCADE hier vertretbar, bei bestellungen → kunden aber riskant? | A: Schulungen gehören fachlich nur zur Person; Bestellungen sind Geschäfts- und Buchhaltungsdaten mit Aufbewahrungspflicht, die nicht unbemerkt verschwinden dürfen. | P: 2
