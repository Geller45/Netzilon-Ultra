---
id: azd-cosmos-db
bereich: Azure Data
pruefungen: [DP-203, Schule]
fach: Data Engineering
block: A4
kapitel: Datenbanken in Azure
titel: Azure Cosmos DB – APIs, Request Units, CAP-Theorem, Konsistenzebenen
stufe: Fortgeschritten
quellen: [09_COSMOS_DB.pdf]
verweise: [azd-synapse, azd-grundlagen, db-transaktionen]
---

## Profi

### Azure Cosmos DB
Globales, **nicht-relationales (NoSQL)**, vollständig verwaltetes Datenbanksystem mit mehreren APIs; speichert JSON-Dokumente, Schlüssel-Wert-Paare, Spaltenfamilien und Graphen; weltweite Verteilung, Multi-Region-Replikation, niedrige Latenz, automatische Indizierung, elastische Skalierung (Durchsatz und Speicher).
| Datenmodell | API | Anmerkung |
|---|---|---|
| Dokument (JSON) | **NoSQL API** (früher SQL/Core API) | Abfragen mit SQL-ähnlicher Syntax |
| Dokument (BSON) | **MongoDB API** | MongoDB-Kompatibilität |
| Schlüssel-Wert | **Table API** | ersetzt Azure Table Storage |
| Spaltenfamilie | **Cassandra API** | |
| Graph | **Gremlin API** | Graph-Traversierung, z. B. Soziale Netzwerke |
Cosmos DB ist häufig die Datenquelle für Web-/Mobil-Apps, IoT und Microservices (APIs).

### Request Units (RU)
Durchsatz wird in **RU/s** gemessen – abstrakte Währung für CPU, IOPS und Speicher einer Operation. **Punktlesen** (ID + Partitionsschlüssel) eines 1-KB-Elements = **1 RU**; Schreiben, Abfragen kosten mehr. Bereitstellungsarten: **provisioned throughput** (manuell/Autoscale, **Minimum 400 RU/s**) oder **serverless**. Container sind in **logische Partitionen** (Partitionsschlüssel) und physische Partitionen geteilt.

### ACID, Replikation, Latenz
Relationale DB: ACID. Verteilte NoSQL-Systeme wägen Konsistenz gegen Latenz/Verfügbarkeit ab. **Replikate** = identische Kopien in anderen Regionen; Anwendung liest vom nächstgelegenen Replikat → geringere **Latenz**.

### CAP-Theorem
Ein verteiltes System kann nur **zwei von drei** Eigenschaften garantieren:
- **C**onsistency – jeder Lesevorgang liefert aktuelle Daten (oder Fehler)
- **A**vailability – jede Anfrage erhält eine Antwort
- **P**artition tolerance – System arbeitet trotz Nachrichtenverlust/Verzögerung weiter
**CA** (nicht partitionstolerant, nur in Einzel-System sinnvoll), **CP** (konsistent, evtl. nicht verfügbar), **AP** (verfügbar, evtl. inkonsistent). In der Praxis wird zwischen C und A abgewogen (Partitionen sind in Netzwerken unvermeidlich). Relevant für globale Anwendungen, Cloud, Microservices, IoT.

### Fünf Konsistenzebenen (stark → schwach)
| Ebene | Garantie | Kompromiss |
|---|---|---|
| **Strong** (strikt) | Lesen liefert immer die letzte bestätigte Version (Linearisierbarkeit); jeder Schreibvorgang muss in allen Regionen repliziert sein | höchste Latenz, geringste Verfügbarkeit/Performance |
| **Bounded Staleness** | Verzögerung maximal K Versionen oder T Zeit; globale Ordnung | tauscht Verzögerung gegen starke Konsistenz |
| **Session** (**Standard**) | innerhalb einer Client-Sitzung (Session-Token): Read-your-writes, monotone Reads | häufigste Wahl bei Einzelregion |
| **Consistent Prefix** | Reihenfolge der Schreibvorgänge bleibt erhalten, nie „out of order“, aber evtl. nicht aktuell | |
| **Eventual** | keine Reihenfolge-/Zeitgarantie, irgendwann konsistent | niedrigste Latenz, höchste Verfügbarkeit |
Faustregel: Je stärker die Konsistenz, desto höher Latenz und RU-Kosten (Strong: Lesen kostet doppelt).

## Einfach

**Cosmos DB** ist eine **Datenbank, die kein Tabellenformular braucht**. Statt Zeilen und Spalten speichert sie z. B. **Dokumente** wie Karteikarten mit beliebigen Feldern (`{"name":"Anna","hobbies":["Judo","Lesen"]}`). Sie lebt **weltweit gleichzeitig**: Eine Kopie in Frankfurt, eine in Tokio, eine in New York. So bekommt jeder Nutzer die Daten aus dem **nächstgelegenen** Rechenzentrum (kurze Wartezeit).

Mit verschiedenen „Steckdosen“ (APIs) kann man sie benutzen, wie man will: JSON-Dokumente, MongoDB, Cassandra, Gremlin (für Freundschaftsnetzwerke), Table.

**RU – die Münze von Cosmos DB:** Jede Aktion kostet „Münzen“. Eine einzelne Karteikarte nach Nummer holen kostet nur **1 RU**. Eine komplizierte Suche kostet mehr. Du kaufst einen Vorrat pro Sekunde (mindestens 400 RU/s).

**Das CAP-Problem – du kannst nur zwei von drei haben:**
Stell dir drei Filialen einer Bäckerei vor, die dieselbe Preisliste haben müssen.
- **C**: In allen Filialen steht **immer derselbe Preis**.
- **A**: **Jede Filiale verkauft immer**.
- **P**: Es klappt auch, wenn das **Telefon** zwischen den Filialen ausfällt.
Fällt das Telefon aus (Partition), musst du wählen: Entweder alle Filialen machen zu, bis sich alle abgestimmt haben (konsistent, aber nicht verfügbar) oder sie verkaufen weiter, aber mit evtl. unterschiedlichen Preisen (verfügbar, aber evtl. inkonsistent).

**Die fünf Konsistenzstufen** wie Nachrichten-Weitergabe:
1. **Strong** = Alle erfahren **sofort und gleichzeitig**. Sicher, aber langsam.
2. **Bounded Staleness** = Spätestens nach X Sekunden sind alle aktuell.
3. **Session** = **Du siehst immer, was du selbst geschrieben hast.** (Standard)
4. **Consistent Prefix** = Du siehst Dinge **in der richtigen Reihenfolge**, aber vielleicht noch nicht die neuesten.
5. **Eventual** = **Irgendwann** wissen es alle. Am schnellsten, aber ohne Garantie.

## Merksatz
- **CAP: zwei von drei (C, A, P) – meist C gegen A.**
- **Konsistenz: Strong – Bounded – Session (Standard) – Prefix – Eventual.**
- **1 RU = Punktlesen 1 KB; Minimum 400 RU/s.**
- **Cosmos DB ersetzt Table Storage über die Table API.**
- **Stark = langsam, eventual = schnell.**

## Prüfungsfalle
- **Session** ist die **Standard**-Konsistenz.
- Strong ist nur eingeschränkt über mehrere Regionen verfügbar und hat höchste Latenz.
- Cosmos DB ≠ relational: kein JOIN über Container wie in SQL, Schema flexibel.
- Gremlin API = Graph (nicht Table).
- RU ≠ DTU ≠ DWU.
- Bounded Staleness: Verzögerung wird in Zeit **oder** Operationen (Versionen) angegeben.
- Cosmos DB bietet laut Dokumentation ACID-Transaktionen innerhalb einer logischen Partition.

## Grafik
### Konsistenz bei Replikation
1. Client A -> Region 1: schreibt Wert B
2. Region 1 -> Region 2: repliziert asynchron
3. Client B -> Region 2: liest, evtl. noch alter Wert A (Eventual)
4. Strong: Region 1 wartet, bis Region 2 bestätigt hat
5. Session: Client A liest in Region 1 immer seinen Wert B
### RU
1. App -> Cosmos DB: Punktlesen Item 17 (1 KB)
2. Cosmos DB -> App: Dokument, Kosten 1 RU
3. App -> Cosmos DB: Abfrage über viele Items
4. Cosmos DB -> App: Ergebnis, Kosten z. B. 25 RU

## Lab
### GUI
Maschine: Windows-Client (Azure Portal). „Azure Cosmos DB for NoSQL“ erstellen (Serverless oder Free Tier), Data Explorer > Neuer Container (Partitionsschlüssel /kategorie) > Item hinzufügen > Abfrage `SELECT * FROM c WHERE c.kategorie = "Zelte"`. Standardkonsistenz unter „Standardkonsistenz“ ansehen/ändern.
### PowerShell
```
New-AzCosmosDBAccount -ResourceGroupName rg-lab -Name cosmos-lab-2026 -Location westeurope -ApiKind Sql -DefaultConsistencyLevel Session
```

## Übungen
- A: Eine Anwendung liest im selben Client sofort, was sie geschrieben hat. Welche Konsistenz genügt? | L: Session (Standard).
- A: Reihenfolge der Ereignisse muss stimmen, Aktualität egal – welche Ebene? | L: Consistent Prefix.
- A: Bank, kein Datenverlust, Latenz zweitrangig – welche Ebene? | L: Strong.
- A: Erklären Sie das CAP-Theorem. | L: Ein verteiltes System kann nur zwei von Consistency, Availability, Partition tolerance garantieren; bei Netzwerkpartition muss man zwischen C und A wählen.
- A: Wie viele RU kostet das Lesen eines 1-KB-Items per ID und Partitionsschlüssel? | L: 1 RU.

## Karteikarten
- F: Was ist Cosmos DB? | A: Globale, verwaltete NoSQL-Datenbank mit mehreren APIs.
- F: Welche APIs gibt es? | A: NoSQL (SQL), MongoDB, Table, Cassandra, Gremlin.
- F: Welche API für Graphen? | A: Gremlin.
- F: Was ist eine RU? | A: Request Unit – abstrakte Einheit für Ressourcenverbrauch (CPU, IOPS, Speicher).
- F: Minimum an RU/s bei provisioned throughput? | A: 400.
- F: Standard-Konsistenzebene? | A: Session.
- F: Fünf Konsistenzebenen? | A: Strong, Bounded Staleness, Session, Consistent Prefix, Eventual.
- F: Stärkste / schwächste Ebene? | A: Strong / Eventual.
- F: Was besagt das CAP-Theorem? | A: Nur zwei von Consistency, Availability, Partition tolerance sind gleichzeitig garantierbar.
- F: Was ersetzt die Table API? | A: Azure Table Storage.
- F: Wofür Replikation über Regionen? | A: Geringere Latenz und höhere Verfügbarkeit.

## Quiz
? Welche Konsistenzebene ist die Standardebene?
* Session
- Strong
- Eventual
- Bounded Staleness

? Welche Ebene ist die schwächste?
* Eventual
- Strong
- Session
- Consistent Prefix

? Welche API ist für Graphdatenbanken?
* Gremlin
- Cassandra
- Table
- MongoDB

? Wie viele RU kostet Punktlesen von 1 KB?
* 1
- 10
- 100
- 400

? Wofür steht das P im CAP-Theorem?
* Partitionstoleranz
- Performance
- Persistenz
- Protokoll

? Welche Ebene garantiert die Reihenfolge, aber nicht die Aktualität?
* Consistent Prefix
- Strong
- Session
- Eventual

? Welche Ebene hat die höchste Latenz?
* Strong
- Eventual
- Session
- Consistent Prefix

? Welche API ersetzt Azure Table Storage?
* Table API
- NoSQL API
- Gremlin API
- Cassandra API

## Lücken
- Cosmos DB misst den Durchsatz in {Request Units}; die Standardkonsistenz heißt {Session}.
- Nach dem CAP-Theorem kann man nur {zwei} von drei Eigenschaften garantieren.

## Zuordnen
### Konsistenz und Merkmal
- Strong => immer aktuellster Stand, höchste Latenz
- Bounded Staleness => maximale Verzögerung konfigurierbar
- Session => Read-your-writes im Client
- Consistent Prefix => Reihenfolge garantiert
- Eventual => irgendwann konsistent

## Spickzettel
- NoSQL, global; APIs: NoSQL, MongoDB, Table, Cassandra, Gremlin
- RU (1 RU = 1 KB Punktlesen), min 400 RU/s
- CAP: C, A, P – zwei von drei
- Konsistenz: Strong, Bounded, Session (Standard), Prefix, Eventual
