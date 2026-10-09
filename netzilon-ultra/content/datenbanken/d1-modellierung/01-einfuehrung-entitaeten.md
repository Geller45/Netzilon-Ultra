---
id: db-einfuehrung
bereich: Datenbanken
pruefungen: [Schule, AP1, AP2]
fach: SQL / Datenbanken
block: D1
kapitel: Datenmodellierung
titel: Einführung in Datenbanken – DBMS, Einsatzgebiete, Entitäten, Schlüssel, Drei-Ebenen-Modell
stufe: Einsteiger
quellen: [einfuerhung_und_entitaeten.pdf, SQL_Lernen_1.pdf, Lernen_SQL.pdf]
verweise: [db-er-modell, db-er-modell, db-erd-tabelle, db-normalisierung, ap2-skripte-sql]
---

## Profi

### Was ist eine Datenbank?
Eine **Datenbank** (DB) ist eine **Sammlung strukturierter Informationen**, die elektronisch gespeichert und so verwaltet wird, dass **effizienter Zugriff**, **Organisation** und **dauerhafte Sicherung** großer Informationsmengen möglich sind. Datenbanken laufen häufig auf **Servern**, bieten große Speicherkapazität, schnellen und einfachen Zugriff, **systematische Abfragen** mit einer **eigenen Sprache** (SQL) und **gleichzeitigen Zugriff** vieler Benutzer.

Die Software, die die Datenbank verwaltet, ist das **Datenbankmanagementsystem (DBMS)** – die Schnittstelle zwischen Benutzer/Anwendung und den physischen Daten. **DB + DBMS = Datenbanksystem (DBS)**. Beispiele: Microsoft SQL Server, PostgreSQL, MySQL/MariaDB, Oracle, SQLite; NoSQL: MongoDB, Azure Cosmos DB.

### Aufgaben eines DBMS
1. **Mehrbenutzerbetrieb** gewährleisten (Sperren, Transaktionen, Isolation)
2. **Persistente** (dauerhafte) Speicherung
3. **Verwaltung von Metadaten** (Data Dictionary/Systemkatalog)
4. **Datenintegrität und Konsistenz** (Constraints, Datentypen, ACID)
5. **Zugriffskontrolle** (Benutzer, Rollen, Rechte)
6. **Verfügbarkeit und Skalierbarkeit**
7. **Backup- und Rollback-Strategien** (Wiederherstellung)
8. **Optimierungen** (Abfrageoptimierer, Indizes)
9. **Probleme durch gleichzeitigen Zugriff abmildern** (Lost Update, Dirty Read)

### Metadaten
**Metadaten sind „Daten über Daten“.** In relationalen DBMS beschreiben sie die **Struktur und Regeln** – Tabellen, Spalten, Datentypen, Schlüssel, Constraints, Benutzer, Rechte – nicht den Inhalt. Man spricht vom **Data Dictionary** bzw. **Systemkatalog** (SQL Server: `sys.tables`, `sys.columns`, `INFORMATION_SCHEMA`).

### Datenbank vs. Tabellenkalkulation
| Tabellenkalkulation (Excel) | Datenbank |
|---|---|
| Fokus **Berechnung** und Darstellung, Was-wäre-wenn | Fokus **Speicherung, Struktur, Verwaltung** großer Datenmengen über lange Zeit |
| Datenmenge begrenzt (ca. 1 Mio. Zeilen) | praktisch unbegrenzt |
| gleichzeitige Bearbeitung umständlich, Konsistenz fraglich | echter Mehrbenutzerbetrieb mit Sperren/Transaktionen |
| keine erzwungenen Datentypen/Regeln | **Datentypen, Constraints**, referentielle Integrität |
| Redundanz schwer vermeidbar | Normalisierung, Schlüssel |
| Rollen/Rechte kaum | fein granular (GRANT/DENY) |
| Versionen/Synchronisation, Backup, Tracking schwierig | Backup, Protokoll, Wiederherstellung, Auditing |
| API/Automatisierung umständlich | Schnittstellen (ODBC, JDBC, REST), Performance, Anpassbarkeit |

### Einsatzgebiete (aus dem Unterricht)
Onlineshops (Lager, Produkte), soziale Medien (Profile, Likes, Follower), Banken (Kontostände, Überweisungen, Scoring), Börse (Kurse), Spiele (Spielstände, Profile, Statistiken), Telekommunikation (Tarife, Billing), Schule (Noten, Fehlzeiten, Stundenplan), Behörden (Einwohnermeldeamt, Steuern), Navigation/Geodaten (Smart City), Versicherungen, Streaming (Empfehlungen, Nutzungsverhalten), **Active Directory** (Konfiguration, Objekte), Sport (Vereine, Spieler), Werbung (Web-Mining), Gesundheitswesen, Dateisystem (hierarchische DB), Klima/Wissenschaft (CERN), Netzwerk (DNS, Firewall), Smart Home, Medien, Smart Maintenance, Online-Bibliotheken, Smartphone (Kontakte).

### Datenbankmodelle
**Hierarchisch** (Baum, z. B. Dateisystem, Registry, LDAP/AD), **Netzwerkmodell**, **relational** (Tabellen mit Beziehungen über Schlüssel – Standard), **objektorientiert/objektrelational**, **NoSQL** (Dokument, Schlüssel-Wert, Spaltenfamilie, Graph).

### Entität, Entitätstyp, Attribut
- **Entität** (*Entity*): ein **eindeutig identifizierbares Objekt** der realen oder gedachten Welt, über das Daten gespeichert werden (Person, Ding, Ort, Ereignis, Konzept) – in der Tabelle eine **Zeile/Datensatz**. Beispiel: Kunde „Max Mustermann“ mit ID 4711.
- **Entitätstyp** (*Entity Type*, Entitätsklasse): fasst **gleichartige Entitäten** mit **gleichen Attributen, aber unterschiedlichen Attributwerten** zusammen – der **Bauplan**, in der DB die **Tabelle**. Beispiel: KUNDE, SPIELER.
- **Attribut**: Eigenschaft eines Entitätstyps – in der Tabelle eine **Spalte** (Name, Rückennummer, Geburtsdatum). **Attributwert** = konkreter Inhalt.
- **Schlüsselattribut** identifiziert eindeutig (Kundennummer), **Nicht-Schlüsselattribut** beschreibt (Name, Adresse).

### Primärschlüssel und Fremdschlüssel
**Primärschlüssel (PK)** = Attribut oder Attributkombination, die **jeden Datensatz eindeutig identifiziert**. Anforderungen: **eindeutig** (unique), **nie leer** (NOT NULL), **möglichst unveränderlich**, **minimal** (so kurz wie möglich, keine überflüssigen Attribute). Ein **Name** ist ein schlechter PK (nicht eindeutig, ändert sich z. B. durch Heirat). Gute PKs: systemvergebene ID (Surrogatschlüssel), Bestellnummer, Fahrgestellnummer, Steuer-ID. **Schlüsselkandidat** = jede minimale eindeutige Attributkombination; einer davon wird PK, die anderen sind **Alternativschlüssel** (UNIQUE).
**Fremdschlüssel (FK)** = Verweis auf den PK (oder UNIQUE-Schlüssel) einer anderen Tabelle; darf **mehrfach** vorkommen; **referentielle Integrität**: ein FK-Wert muss als PK-Wert existieren (keine Bestellung für einen nicht existierenden Kunden).

### Drei-Ebenen-Architektur (ANSI/SPARC)
- **Externe Ebene**: Sicht des **Benutzers** – jeder sieht nur die benötigten Daten (Views).
- **Konzeptionelle (logische) Ebene**: **gesamte logische Struktur** – Tabellen, Beziehungen, Regeln.
- **Interne (physische) Ebene**: wie die Daten **gespeichert** werden (Dateien, Seiten, Indizes).
Ziel: **Datenunabhängigkeit** – physische Änderungen beeinflussen Anwendungen nicht.

### Phasen des Datenbankentwurfs
1. **Informationsanalyse** (Anforderungen, **Lastenheft** = Was will der Auftraggeber? **Pflichtenheft** = Wie setzt der Auftragnehmer es um?)
2. **Konzeptioneller Entwurf** – ER-Modell, unabhängig vom DBMS
3. **Logischer Entwurf** – Umsetzung in Tabellen, Schlüssel, Normalisierung
4. **Physischer Entwurf** – Datentypen, Indizes, Speicher im konkreten DBMS
5. Implementierung, Test, Betrieb

## Einfach

Eine **Datenbank** ist wie ein **riesiger, super ordentlicher Aktenschrank**, und das **DBMS** ist der **Archivar**, der davorsteht. Du sagst ihm nicht, in welcher Schublade etwas liegt – du fragst nur: „Gib mir alle Kunden aus Bochum!“ Der Archivar sucht, achtet darauf, dass nichts durcheinanderkommt, dass nur Berechtigte reinschauen und dass von allem eine **Sicherheitskopie** existiert. Und wenn 100 Leute gleichzeitig fragen, sorgt er dafür, dass niemand dem anderen die Akte unter der Hand verändert.

**Excel** dagegen ist ein **Notizblock**: Super zum Rechnen, aber wenn fünf Leute gleichzeitig darin schreiben und jemand „Bochum“ mal „bochum“ und mal „Bohum“ tippt, herrscht Chaos.

Begriffe als **Schulklasse**:
- **Entitätstyp** = „**Schüler**“ allgemein – der Bauplan, was man über jeden Schüler wissen will.
- **Entität** = **Lisa**, ein ganz bestimmter Schüler – eine Zeile in der Liste.
- **Attribut** = **Vorname, Geburtsdatum, Klasse** – die Spalten der Liste.
- **Primärschlüssel** = die **Schülernummer** – zwei Lisas gibt es vielleicht, aber nie zwei gleiche Nummern.
- **Fremdschlüssel** = auf dem Zeugnis steht die **Schülernummer** – so weiß man, zu wem es gehört.

## Merksatz
- **DB + DBMS = DBS.**
- **Entitätstyp = Tabelle, Entität = Zeile, Attribut = Spalte.**
- PK: **eindeutig, nicht NULL, stabil, minimal.**
- FK zeigt **immer auf einen PK**, darf sich wiederholen.
- **Metadaten = Daten über Daten.**
- **Extern – konzeptionell – intern.**

## Prüfungsfalle
- Ein **Name** eignet sich **nicht** als Primärschlüssel.
- **Entität ≠ Entitätstyp**: Max Mustermann ist eine Entität, KUNDE der Typ.
- Das **DBMS** ist die Software, nicht die Daten selbst.
- Der Fremdschlüssel muss **nicht eindeutig** sein (bei 1:n wiederholt er sich), außer bei 1:1.
- **Lastenheft** kommt vom **Auftraggeber**, **Pflichtenheft** vom **Auftragnehmer**.

## Grafik
### Abfrage durch das DBMS
1. Anwendung -> DBMS: SELECT * FROM Kunde WHERE Ort = 'Bochum'
2. DBMS: prüft Rechte des Benutzers
3. DBMS: Optimierer wählt Index auf Ort
4. DBMS -> Datendatei: liest passende Seiten
5. DBMS -> Anwendung: Ergebnistabelle
### Entitätstyp, Entität, Attribut
1. Entitätstyp: SPIELER (Tabelle)
2. Attribut: Name, Rückennummer, Position (Spalten)
3. Entität: (25, Müller, 25, Sturm) – eine Zeile
4. PK: SpielerID macht jede Zeile eindeutig

## Übungen
- A: Nennen Sie fünf Vorteile einer Datenbank gegenüber einer Tabellenkalkulation. | L: Größere Datenmengen, echter Mehrbenutzerbetrieb, erzwungene Datentypen und Integrität (Constraints), Rollen/Rechte, Backup/Wiederherstellung und Protokollierung, Redundanzvermeidung, bessere Performance und Automatisierung über APIs.
- A: Nennen Sie sechs Aufgaben eines DBMS. | L: Mehrbenutzerbetrieb, persistente Speicherung, Metadatenverwaltung, Integrität/Konsistenz, Zugriffskontrolle, Verfügbarkeit/Skalierbarkeit, Backup/Rollback, Optimierung, Konfliktbehandlung bei gleichzeitigem Zugriff.
- A: Erklären Sie Entität und Entitätstyp mit Beispiel. | L: Entitätstyp = Klasse gleichartiger Objekte mit gleichen Attributen (z. B. BUCH mit ISBN, Titel); Entität = konkretes Objekt mit Werten (das Buch „Faust“, ISBN 978-…).
- A: Welche Anforderungen werden an einen Primärschlüssel gestellt? | L: Eindeutig, nicht NULL, möglichst unveränderlich, minimal (keine überflüssigen Attribute), möglichst kurz/einfach.
- A: Warum ist der Name ein schlechter Primärschlüssel? | L: Nicht eindeutig (mehrere Max Müller) und veränderlich (Heirat).
- A: Was ist der Unterschied zwischen externer und konzeptioneller Ebene? | L: Extern: Sicht einzelner Benutzer (nur benötigte Daten, Views). Konzeptionell: gesamte logische Struktur aller Tabellen, Beziehungen und Regeln.
- A: Nennen Sie acht Einsatzgebiete von Datenbanken. | L: Onlineshop, Bank, soziale Medien, Schule, Behörden, Streaming, Versicherung, Active Directory, Spiele, Navigation, Gesundheitswesen, Smart Home.

## Karteikarten
- F: Was ist ein DBMS? | A: Datenbankmanagementsystem – Software zwischen Benutzer und Daten, die speichert, verwaltet, schützt und abfragt
- F: Was sind Metadaten? | A: Daten über Daten – Struktur und Regeln der Datenbank (Data Dictionary)
- F: Was entspricht einem Entitätstyp in der Datenbank? | A: Einer Tabelle
- F: Was entspricht einer Entität? | A: Einer Zeile (Datensatz)
- F: Was entspricht einem Attribut? | A: Einer Spalte
- F: Vier Anforderungen an einen Primärschlüssel? | A: Eindeutig, NOT NULL, unveränderlich, minimal
- F: Was ist ein Fremdschlüssel? | A: Spalte, die auf den Primärschlüssel einer anderen Tabelle verweist
- F: Was bedeutet referentielle Integrität? | A: Jeder FK-Wert muss als PK-Wert in der referenzierten Tabelle existieren
- F: Was ist ein Schlüsselkandidat? | A: Jede minimale Attributkombination, die Datensätze eindeutig identifiziert
- F: Drei Ebenen nach ANSI/SPARC? | A: Externe, konzeptionelle, interne Ebene
- F: Lastenheft vs. Pflichtenheft? | A: Lastenheft = Anforderungen des Auftraggebers (Was), Pflichtenheft = Umsetzung des Auftragnehmers (Wie)
- F: Beispiel einer hierarchischen Datenbank? | A: Dateisystem (auch Registry, LDAP/Active Directory)

## Quiz
? Was ist ein DBMS?
* Die Software, die eine Datenbank verwaltet und den Zugriff steuert
- Die Datei mit den Kundendaten
- Ein Tabellenkalkulationsprogramm
- Ein Netzwerkprotokoll

? Was entspricht einer Entität in einer relationalen Tabelle?
* Eine Zeile
- Eine Spalte
- Die Tabelle
- Der Datentyp

? Welches Attribut eignet sich am besten als Primärschlüssel einer Person?
* Eine systemvergebene Personalnummer
- Der Nachname
- Vor- und Nachname
- Die Telefonnummer

? Was sind Metadaten?
* Daten über die Struktur und Regeln der Datenbank
- Gelöschte Daten
- Daten in der Cloud
- Verschlüsselte Daten

? Welche Ebene zeigt einem Benutzer nur die für ihn relevanten Daten?
* Externe Ebene
- Interne Ebene
- Konzeptionelle Ebene
- Physische Ebene

? Was ist KEIN Vorteil einer Datenbank gegenüber Excel?
* Bessere Was-wäre-wenn-Diagramme
- Mehrbenutzerbetrieb mit Transaktionen
- Erzwungene Datentypen und Constraints
- Rollen und Rechte

? Was darf ein Fremdschlüsselwert in einer 1:n-Beziehung?
* Mehrfach vorkommen
- Nie vorkommen
- Nur NULL sein
- Nur einmal vorkommen

? Welche Eigenschaft gehört NICHT zu einem guten Primärschlüssel?
* Er ändert sich regelmäßig
- Er ist eindeutig
- Er ist nie NULL
- Er ist minimal

## Lücken
- Ein {Entitätstyp} wird zur Tabelle, eine {Entität} zur Zeile und ein {Attribut} zur Spalte.
- Datenbank und {DBMS} bilden zusammen das Datenbanksystem.
- Metadaten sind {Daten über Daten}.

## Zuordnen
### Begriff und Bedeutung
- Entität => konkretes Objekt (Zeile)
- Entitätstyp => Bauplan gleichartiger Objekte (Tabelle)
- Attribut => Eigenschaft (Spalte)
- Primärschlüssel => eindeutige Identifikation
- Fremdschlüssel => Verweis auf eine andere Tabelle

## Reihenfolge
### Phasen des Datenbankentwurfs
1. Informationsanalyse (Lasten-/Pflichtenheft)
2. Konzeptioneller Entwurf (ER-Modell)
3. Logischer Entwurf (Tabellen, Normalisierung)
4. Physischer Entwurf (Datentypen, Indizes)
5. Implementierung und Test

## Freitext
- F: Erläutern Sie drei Gründe, warum ein Unternehmen seine Excel-Listen durch eine relationale Datenbank ersetzen sollte. | M: Mehrbenutzerbetrieb ohne Konflikte (Transaktionen/Sperren); Datenintegrität durch Datentypen und Constraints, keine Redundanz durch Normalisierung; Zugriffsrechte, Backup und Skalierbarkeit für große Datenmengen | P: 6

## Spickzettel
- DB = Daten, DBMS = Software, DBS = beides
- DBMS: Mehrbenutzer, Persistenz, Metadaten, Integrität, Rechte, Backup, Optimierung
- Entitätstyp = Tabelle, Entität = Zeile, Attribut = Spalte
- PK: eindeutig, NOT NULL, stabil, minimal; FK → PK, referentielle Integrität
- Ebenen: extern (Views), konzeptionell (Struktur), intern (Speicher)
