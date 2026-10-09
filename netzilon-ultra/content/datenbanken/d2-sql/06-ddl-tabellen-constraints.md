---
id: db-ddl
bereich: Datenbanken
pruefungen: [Schule, AP1, AP2]
fach: SQL / Datenbanken
block: D2
kapitel: DDL
titel: DDL – CREATE/ALTER/DROP TABLE und Constraints (PK, FK, CHECK, DEFAULT, UNIQUE)
stufe: Fortgeschritten
quellen: [DDL_Schema_1.pdf, sql.pdf]
verweise: [db-erd-tabelle, db-dml, db-select-funktionen]
---

## Profi

### Tabellen-Kommandos
```
CREATE TABLE Kontakt (
  ID      INT IDENTITY(1,1) PRIMARY KEY,
  Vorname VARCHAR(50) NOT NULL,
  Name    VARCHAR(50) NOT NULL,
  Telefon VARCHAR(20) NOT NULL,
  FAX     VARCHAR(20) NULL
);
ALTER TABLE Kontakt ADD Email VARCHAR(255) NULL;
ALTER TABLE Kontakt ALTER COLUMN Vorname VARCHAR(40) NULL;
ALTER TABLE Kontakt DROP COLUMN Email;
DROP TABLE Kontakt;          -- samt allen Daten!
```
`ALTER TABLE … ADD CONSTRAINT PK_Kontakte PRIMARY KEY (Name, Vorname)` fügt Einschränkungen nachträglich hinzu, `DROP CONSTRAINT` entfernt sie. `ADD … NOT NULL` auf gefüllter Tabelle braucht einen DEFAULT-Wert.

### Datenintegrität
- **Domänenintegrität** (Spalten): Datentyp, NULL, DEFAULT, CHECK.
- **Entitätsintegrität** (Zeilen): PRIMARY KEY, UNIQUE.
- **Referentielle Integrität** (zwischen Tabellen): FOREIGN KEY.
Weitere Mechanismen: Trigger, XML-Schemas.

### Constraints
| Constraint | Wirkung |
|---|---|
| `NULL` / `NOT NULL` | Wert optional / Pflicht |
| `PRIMARY KEY` | eindeutig + NOT NULL; nur **ein** PK je Tabelle, auch mehrspaltig `PRIMARY KEY (Name, Vorname)`; legt automatisch einen (gruppierten) Index an |
| `UNIQUE` | Werte eindeutig, mehrere UNIQUE je Tabelle, ein NULL erlaubt (SQL Server) |
| `DEFAULT` | Standardwert, wenn kein Wert beim INSERT angegeben; nur ein DEFAULT je Spalte |
| `CHECK` | Wertebereich/Regel: `CHECK (Alter BETWEEN 0 AND 150)`, auch über mehrere Spalten |
| `FOREIGN KEY … REFERENCES` | Wert muss im referenzierten PK/UNIQUE existieren (oder NULL) |
```
CREATE TABLE Bestellung (
  BestellNr INT PRIMARY KEY,
  KundenNr  INT NOT NULL,
  Datum     DATE NOT NULL DEFAULT GETDATE(),
  Betrag    DECIMAL(10,2) CHECK (Betrag >= 0),
  CONSTRAINT FK_Best_Kunde FOREIGN KEY (KundenNr) REFERENCES Kunde(KundenNr)
     ON DELETE NO ACTION ON UPDATE CASCADE
);
```
**Kaskadierende referentielle Integrität:** `ON DELETE / ON UPDATE` mit `NO ACTION` (Standard, Änderung wird abgelehnt), `CASCADE` (Änderung/Löschung wird weitergegeben), `SET NULL`, `SET DEFAULT`. Constraints benennen (PK_, FK_, CK_, DF_, UQ_ als Präfix).

### IDENTITY, Sequenzen, Indizes
`IDENTITY(Start, Schritt)` vergibt automatisch Werte (Einfügen eigener Werte: `SET IDENTITY_INSERT tab ON`). Alternativ `SEQUENCE`. `CREATE INDEX ix_name ON t(spalte)` beschleunigt Suche, kostet Schreibleistung. `TRUNCATE TABLE` leert eine Tabelle (DDL), `DROP` entfernt sie. Sichten: `CREATE VIEW v AS SELECT …`.

## Einfach

Bevor man in eine Datenbank etwas **hineinschreiben** kann, muss man die **Tabelle bauen** – wie ein **Formular** entwerfen: Welche Felder gibt es, was darf in welches Feld, welche Felder müssen ausgefüllt werden?

- **CREATE TABLE** = Das leere Formular drucken. Du legst fest: Spaltennamen und was reindarf (Datentyp).
- **ALTER TABLE** = Das Formular nachträglich ändern (Feld dazu, Feld weg).
- **DROP TABLE** = Das Formular **und alle ausgefüllten Zettel** in den Reißwolf. Kein Zurück!

Die **Constraints** (Einschränkungen) sind die **Regeln auf dem Formular**:
- **NOT NULL** = „Pflichtfeld – muss ausgefüllt werden.“
- **PRIMARY KEY** = „Die Nummer oben rechts. Jede Nummer darf es nur einmal geben und sie darf nicht leer sein.“
- **UNIQUE** = „Dieser Wert darf nicht doppelt vorkommen“ (z. B. E-Mail-Adresse).
- **DEFAULT** = „Wenn du nichts hinschreibst, schreibe ich das hier ein“ (z. B. heutiges Datum).
- **CHECK** = „Nur erlaubte Werte“ (z. B. Alter zwischen 0 und 150, Gehalt nicht negativ).
- **FOREIGN KEY** = „Der Wert muss auf einem anderen Formular existieren.“ Eine Bestellung kann nur zu einem Kunden gehören, den es wirklich gibt. Wenn jemand versucht, den Kunden zu löschen, sagt die Datenbank entweder „Nein, es gibt noch Bestellungen!“ oder – wenn du **CASCADE** eingestellt hast – „Okay, dann werfe ich die Bestellungen auch gleich mit weg.“

So schützt die Datenbank sich selbst vor Unsinn – ganz egal, welches Programm oder welcher Mensch davorsitzt.

## Merksatz
- **CREATE baut, ALTER ändert, DROP löscht samt Daten.**
- **Ein PK pro Tabelle, aber viele UNIQUE.**
- **Der Fremdschlüssel schützt vor „Waisen“ (Datensätzen ohne Eltern).**
- **CASCADE gibt Änderungen weiter, NO ACTION lehnt ab.**

## Prüfungsfalle
- DEFAULT greift nur bei INSERT, nicht bei UPDATE.
- Nur **ein** PRIMARY KEY je Tabelle, aber er kann aus mehreren Spalten bestehen.
- FK-Spalte und PK-Spalte brauchen **denselben Datentyp**.
- Eine Tabelle kann nicht gelöscht werden, solange ein FK auf sie zeigt (erst FK entfernen).
- `TRUNCATE` ist bei Tabellen mit FK-Verweis nicht möglich.
- CHECK akzeptiert UNKNOWN (NULL) – NULL-Werte umgehen CHECK, daher zusätzlich NOT NULL.
- Beim Löschen: erst die **abhängige** Tabelle (n-Seite), dann die 1-Seite.

## Grafik
### Fremdschlüssel schützt die Integrität
1. Client -> SQL-Server: INSERT Bestellung mit KundenNr 999
2. SQL-Server -> Kunde: prüft, ob KundenNr 999 existiert
3. Kunde -> SQL-Server: nicht gefunden
4. SQL-Server -> Client: Fehler, FOREIGN KEY verletzt
### Kaskade
1. Client -> SQL-Server: DELETE Kunde 5
2. SQL-Server -> Bestellung: ON DELETE CASCADE löscht Bestellungen von Kunde 5
3. SQL-Server -> Client: 1 Kunde und 3 Bestellungen gelöscht

## Lab
### SQL
Maschine: SQL-Server-VM (SSMS), Datenbank Schulung.
```
CREATE TABLE Kunde (KundenNr INT PRIMARY KEY, Name VARCHAR(80) NOT NULL, Email VARCHAR(120) UNIQUE);
CREATE TABLE Bestellung (BestellNr INT PRIMARY KEY, KundenNr INT NOT NULL REFERENCES Kunde(KundenNr), Datum DATE DEFAULT GETDATE(), Betrag DECIMAL(10,2) CHECK (Betrag >= 0));
INSERT INTO Bestellung (BestellNr, KundenNr, Betrag) VALUES (1, 99, 10);  -- Fehler!
```

## Befehle
- `CREATE TABLE t (…)` – Tabelle anlegen
- `ALTER TABLE t ADD spalte typ` – Spalte hinzufügen
- `ALTER TABLE t DROP COLUMN spalte` – Spalte entfernen
- `ALTER TABLE t ADD CONSTRAINT n PRIMARY KEY (a,b)` – Constraint nachträglich
- `DROP TABLE t` – Tabelle samt Daten löschen
- `CREATE INDEX ix ON t(spalte)` – Index anlegen

## Übungen
- A: Legen Sie die Tabelle Person an: Name, Vorname (Pflicht), GebDat (Pflicht), PK Name+Vorname. | L: CREATE TABLE Person (Name VARCHAR(50) NOT NULL, Vorname VARCHAR(50) NOT NULL, GebDat DATE NOT NULL, PRIMARY KEY (Name, Vorname));
- A: Fügen Sie der Tabelle Kontakt die Spalte Email hinzu. | L: ALTER TABLE Kontakt ADD Email VARCHAR(255) NULL;
- A: Wie erzwingen Sie, dass Gehalt nie negativ ist? | L: ALTER TABLE Mitarbeiter ADD CONSTRAINT CK_Gehalt CHECK (Gehalt >= 0);
- A: Wie verhindern Sie Bestellungen für nicht existierende Kunden? | L: FOREIGN KEY (KundenNr) REFERENCES Kunde(KundenNr)
- A: Welche Integritätsarten gibt es? | L: Domänenintegrität (Spalte), Entitätsintegrität (Zeile), referentielle Integrität (zwischen Tabellen).

## Karteikarten
- F: Was macht DROP TABLE? | A: Löscht die Tabelle samt allen Daten.
- F: Wie ändert man eine bestehende Tabelle? | A: ALTER TABLE (ADD, DROP COLUMN, ALTER COLUMN, ADD/DROP CONSTRAINT).
- F: Wie viele Primärschlüssel hat eine Tabelle? | A: Genau einen (ggf. aus mehreren Spalten).
- F: Was bewirkt UNIQUE? | A: Verhindert doppelte Werte; mehrere pro Tabelle möglich.
- F: Wann greift DEFAULT? | A: Nur beim INSERT ohne Wertangabe.
- F: Was prüft CHECK? | A: Zulässigen Wertebereich bzw. Regel für Spaltenwerte.
- F: Was bewirkt FOREIGN KEY? | A: Wert muss im PK/UNIQUE der referenzierten Tabelle existieren (referentielle Integrität).
- F: Was bewirkt ON DELETE CASCADE? | A: Löschung des Elternsatzes löscht abhängige Kindsätze mit.
- F: Drei Integritätsarten? | A: Domänen-, Entitäts- und referentielle Integrität.
- F: Was macht IDENTITY(1,1)? | A: Vergibt automatisch fortlaufende Werte ab 1 mit Schritt 1.

## Quiz
? Welcher Constraint erzwingt eindeutige Werte und NOT NULL?
* PRIMARY KEY
- UNIQUE
- CHECK
- DEFAULT

? Was passiert bei DROP TABLE?
* Tabelle und alle Daten werden gelöscht
- Nur die Daten werden gelöscht
- Nur die Struktur wird gelöscht
- Die Tabelle wird archiviert

? Welcher Constraint sichert referentielle Integrität?
* FOREIGN KEY
- CHECK
- DEFAULT
- UNIQUE

? Wann greift der DEFAULT-Wert?
* Beim INSERT ohne Wertangabe
- Bei jedem UPDATE
- Bei jedem SELECT
- Beim DELETE

? Wie viele PRIMARY KEY-Constraints sind pro Tabelle erlaubt?
* Einer
- Beliebig viele
- Zwei
- Keiner

? Welche Klausel gibt das Löschen an abhängige Zeilen weiter?
* ON DELETE CASCADE
- ON DELETE NO ACTION
- ON UPDATE CHECK
- WITH TIES

? Wie ändert man den Datentyp einer Spalte?
* ALTER TABLE … ALTER COLUMN
- UPDATE TABLE
- MODIFY TABLE
- CHANGE TABLE

? Welche Integritätsart schützt Beziehungen zwischen Tabellen?
* Referentielle Integrität
- Domänenintegrität
- Entitätsintegrität
- Physische Integrität

## Lücken
- Mit {ALTER TABLE} ändert man eine Tabelle, mit {DROP TABLE} löscht man sie samt Daten.
- Ein {FOREIGN KEY} verweist auf den Primärschlüssel einer anderen Tabelle.

## Zuordnen
### Constraint und Aufgabe
- PRIMARY KEY => Zeile eindeutig identifizieren
- UNIQUE => Duplikate verhindern
- CHECK => Wertebereich prüfen
- DEFAULT => Standardwert
- FOREIGN KEY => Verweis auf andere Tabelle

## Freitext
- F: Nennen und erläutern Sie drei Constraints. | M: PRIMARY KEY: eindeutig und NOT NULL, identifiziert die Zeile; FOREIGN KEY: Wert muss im referenzierten Schlüssel existieren; CHECK: prüft zulässigen Wertebereich; (alternativ DEFAULT: Standardwert, UNIQUE: keine Duplikate). | P: 6

## Spickzettel
- CREATE / ALTER / DROP TABLE
- PK (einer), UNIQUE, NOT NULL, DEFAULT, CHECK, FK
- Referentielle Integrität: CASCADE, NO ACTION, SET NULL
- Löschen: erst Kindtabelle, dann Elterntabelle
