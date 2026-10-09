---
id: ihk-lz-datenbank-sql
bereich: Prüfung
block: IHK
kapitel: Lernzettel-Inhalte
titel: Datenbanken – ER-Modell, relationales Modell, SQL für die Prüfung
stufe: Fortgeschritten
fach: PV – AP1
pruefungen: [AP1, AP2]
quellen: [Datenbanken.docx, Relationales Datenbankmodell.docx, Datenbanken.pdf, Relationales Datenbankmodell.pdf, 1 Guide nach Punkten.docx, AP1_Lernplan_1.pdf, Lernzettel_AP1AP2_2024.pdf]
verweise: [ihk-lernzettel-guide, ihk-lz-programmierung-uml, ihk-vor-nachteile]
---

## Profi

### Relationales Modell
Daten in **Tabellen (Relationen)**: Zeilen = Datensätze (Tupel), Spalten = Attribute. **Primärschlüssel (PK)** identifiziert eindeutig (ggf. zusammengesetzt). **Fremdschlüssel (FK)** verweist auf PK einer anderen Tabelle. **Referentielle Integrität**: FK-Werte müssen auf existierende PK zeigen; ein Datensatz mit abhängigen Datensätzen darf nicht (ohne Kaskade) gelöscht werden.

### ER-Modell
Entität (Rechteck), Attribut (Oval), Beziehung (Raute; Chen-Notation). **Kardinalitäten**: **1:1**, **1:n** (häufigster Typ, z. B. Kunde – Werbeaktionen), **n:m** (braucht eine **Zwischentabelle** mit zwei FK, die zusammen den PK bilden). **Normalisierung**: Redundanzen vermeiden; **1. NF** (atomare Werte), **2. NF** (keine Teilabhängigkeit vom PK), **3. NF** (keine transitiven Abhängigkeiten); 3. NF ist Standard.

### SQL
**DDL**: `CREATE TABLE`, `ALTER TABLE` (`ADD COLUMN`, `ADD FOREIGN KEY … REFERENCES …`), `DROP TABLE`. **DML**: `SELECT`, `INSERT INTO`, `UPDATE … SET`, `DELETE FROM`. **DCL**: `GRANT`, `REVOKE`.
```
CREATE TABLE Kunde (
  KundenNr INTEGER PRIMARY KEY,
  Name VARCHAR(50) NOT NULL,
  Geburtstag DATE
);
CREATE TABLE Aktion (
  AktionNr INTEGER PRIMARY KEY,
  KundenNr INTEGER,
  Titel VARCHAR(80),
  FOREIGN KEY (KundenNr) REFERENCES Kunde(KundenNr)
);
SELECT k.Name, COUNT(*) AS Anzahl
FROM Kunde k INNER JOIN Aktion a ON k.KundenNr = a.KundenNr
WHERE a.Titel LIKE 'Sommer%'
GROUP BY k.Name
HAVING COUNT(*) > 2
ORDER BY Anzahl DESC;
```
`JOIN`/`INNER JOIN`: nur Treffer beider Seiten. `LEFT JOIN`: alle der linken Tabelle. `DISTINCT` vermeidet Dubletten. Aggregate: `COUNT(*)`, `SUM`, `AVG`, `MIN`, `MAX`. `WHERE` filtert **vor**, `HAVING` **nach** der Gruppierung. Operatoren: `=`, `<`, `>`, `LIKE`, `BETWEEN`, `AND`, `OR`. **AP1 2025**: nur einfache `SELECT … FROM … WHERE … ORDER BY` auf einer Tabelle (JOIN/GROUP BY eher AP2).

### Datentypen
`INTEGER`, `VARCHAR(n)`, `DATE`, `BOOLEAN`, `DECIMAL/FLOAT/DOUBLE`, `BLOB` (Binärdaten, z. B. Bilder), `CLOB` (große Texte). Passend und sparsam wählen.

### Performance und Sicherheit
**Index** beschleunigt Suche (kostet Schreibleistung und Platz). **Locking** verhindert Konflikte bei gleichzeitigem Schreiben. **Transaktionen** (ACID). Sicherheit: Nachvollziehbarkeit (Protokollierung), Prävention (Rechte, GRANT/REVOKE), Verfügbarkeit (Backup, RAID), Rechtssicherheit (DSGVO). **NoSQL** (Dokument, Key-Value, Graph, Wide-Column): schemalos; im Katalog 2025 AP1 gestrichen. **Hosting**: On-Premises (Kontrolle) vs. Public Cloud (Skalierbarkeit, Latenz, Abhängigkeit).

## Einfach

Eine Datenbank ist wie ein **Ordner mit Tabellen**, ähnlich wie bei einer Tabellenkalkulation, aber mit festen Regeln.

**Tabellen:** In der Tabelle „Kunde“ steht in jeder Zeile ein Kunde. Jede Zeile hat eine **eindeutige Nummer** (Primärschlüssel), damit man sie nie verwechselt. Wie die Matrikelnummer in der Schule.

**Verbinden:** In der Tabelle „Bestellung“ steht nicht der ganze Kunde, sondern nur seine Nummer. Diese Nummer in der anderen Tabelle heißt **Fremdschlüssel**. Das spart Platz und Fehler. Die Regel „Der Fremdschlüssel muss auf einen echten Kunden zeigen“ heißt **referentielle Integrität**. Du kannst keine Bestellung für einen Kunden anlegen, den es nicht gibt.

**Beziehungen:**
- 1:n: Ein Kunde kann viele Bestellungen haben.
- n:m: Schüler und Kurse (jeder Schüler hat viele Kurse und jeder Kurs viele Schüler). Dafür braucht man eine Zwischentabelle.
- 1:1: Selten, z. B. Person und Reisepass.

**SQL ist die Sprache zum Fragen:**
- `SELECT Name FROM Kunde WHERE Ort = 'Essen'` heißt: „Zeig mir alle Namen der Kunden aus Essen.“
- `ORDER BY Name` sortiert.
- `COUNT(*)` zählt, `AVG` ist der Durchschnitt.
- `GROUP BY` macht Gruppen (z. B. „je Ort“).
- `JOIN` klebt zwei Tabellen anhand der Nummer zusammen.
- `INSERT` fügt hinzu, `UPDATE` ändert, `DELETE` löscht.

**Index:** Wie das Stichwortverzeichnis hinten im Buch. Man findet schneller, aber das Buch wird dicker.
**Locking:** Zwei Leute wollen gleichzeitig dieselbe Zeile ändern. Das Schloss lässt immer nur einen rein.

## Merksatz
- PK identifiziert, FK verweist.
- n:m braucht eine Zwischentabelle.
- WHERE vor GROUP BY, HAVING danach.
- LEFT JOIN: alle links.
- 3. Normalform: keine Redundanz.

## Prüfungsfalle
- Bei Kardinalitäten die Leserichtung prüfen („ein Kunde hat viele …“).
- `HAVING` für Aggregat-Bedingungen, nicht `WHERE`.
- Beim JOIN die Bedingung (`ON`) nicht vergessen: sonst Kreuzprodukt.
- Strings in Hochkommas, Zahlen ohne.
- AP1: einfache Abfragen (kein JOIN/GROUP BY) reichen; Katalog prüfen.
- Datentyp: `VARCHAR` für Namen, `DATE` für Datum, nie Zahl als Text, wenn gerechnet wird.

## Grafik
### Zwei Tabellen verbinden
1. Kunde: KundenNr 7, Name Meier
2. Aktion: AktionNr 100, KundenNr 7 (FK), Titel Sommer
3. Kunde -> Aktion: 1:n Beziehung über KundenNr
4. SQL: JOIN ON Kunde.KundenNr = Aktion.KundenNr
5. Ergebnis: Meier mit Sommer-Aktion

## Übungen
- A: Schreibe eine SQL-Abfrage: Namen aller Kunden aus „Essen“, alphabetisch. | L: SELECT Name FROM Kunde WHERE Ort = 'Essen' ORDER BY Name;
- A: Wie viele Aktionen hat jeder Kunde (mit Name)? | L: SELECT k.Name, COUNT(*) FROM Kunde k JOIN Aktion a ON k.KundenNr = a.KundenNr GROUP BY k.Name;
- A: Welche Kardinalität haben Schüler und Kurse? | L: n:m, Zwischentabelle (z. B. Belegung) mit SchuelerNr und KursNr als FK

## Karteikarten
- F: Was ist ein Primärschlüssel? | A: Eindeutige Kennung eines Datensatzes
- F: Was ist ein Fremdschlüssel? | A: Verweis auf den Primärschlüssel einer anderen Tabelle
- F: Referentielle Integrität? | A: FK-Werte müssen auf existierende PK verweisen
- F: n:m auflösen? | A: Zwischentabelle mit zwei Fremdschlüsseln
- F: Ziel der Normalisierung? | A: Redundanzen vermeiden (meist 3. NF)
- F: INNER JOIN vs. LEFT JOIN? | A: Nur Treffer vs. alle Datensätze der linken Tabelle
- F: WHERE vs. HAVING? | A: Filter vor Gruppierung vs. Filter nach Gruppierung
- F: Wofür dient ein Index? | A: Schnellerer Zugriff auf Daten
- F: Wofür Locking? | A: Konflikte beim gleichzeitigen Schreiben verhindern
- F: DDL, DML, DCL? | A: Struktur (CREATE), Daten (SELECT, INSERT), Rechte (GRANT, REVOKE)
- F: BLOB? | A: Binary Large Object, z. B. für Bilder
- F: Aggregatfunktionen? | A: COUNT, SUM, AVG, MIN, MAX

## Quiz
? Wofür steht ein Fremdschlüssel?
* Verweis auf den Primärschlüssel einer anderen Tabelle
- Eindeutige Kennung der eigenen Tabelle
- Ein Passwort
- Ein Index

? Wie löst man eine n:m-Beziehung auf?
* Durch eine Zwischentabelle
- Durch zwei Primärschlüssel in einer Tabelle
- Durch DISTINCT
- Gar nicht

? Welche Klausel filtert nach der Gruppierung?
* HAVING
- WHERE
- ORDER BY
- LIMIT

? Was liefert ein LEFT JOIN?
* Alle Datensätze der linken Tabelle
- Nur Treffer in beiden Tabellen
- Alle Datensätze der rechten Tabelle
- Nur Dubletten

? Mit welchem Befehl legt man eine Tabelle an?
* CREATE TABLE
- INSERT INTO
- SELECT
- GRANT

? Was bewirkt referentielle Integrität?
* Fremdschlüssel verweisen immer auf existierende Datensätze
- Daten werden verschlüsselt
- Tabellen sind schreibgeschützt
- Spalten werden sortiert

? Welche Funktion berechnet den Durchschnitt?
* AVG
- SUM
- COUNT
- MAX

? Wozu dient ein Index?
* Beschleunigung von Abfragen
- Verschlüsselung der Daten
- Sicherung der Tabellen
- Löschen von Dubletten

? Welcher Datentyp passt für Bilder?
* BLOB
- VARCHAR
- DATE
- BOOLEAN

? Welcher Befehl entzieht Rechte?
* REVOKE
- GRANT
- DROP
- UPDATE
