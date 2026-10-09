---
id: pr-dp203-partition
bereich: Prüfung
block: DP-203
kapitel: DP-203 Azure Data Engineer – Prüfungsfragen
titel: DP-203 – Partitionierung und Partition Switching
stufe: Profi
typ: fragen
pruefungen: [DP-203]
fach: SQL / Admin
quellen: [DE_A_ohne_D_1_bis_370.pdf, T1_-_1_bis_40_-_Lösung_und_Kommentare.pdf, T1_-_41_bis_80_-_Lösung_und_Kommentare.pdf, T1_-_81_bis_120_-_Lösung_und_Kommentare.pdf, T1_-_121_bis_140_-_Lösung_und_Kommentare.pdf, T2_-_141_bis_160_-_Lösung_und_Kommentare.pdf, T2_-_161_bis_180_-_Lösung_und_Kommentare.pdf, T2_-_181_bis_200_-_Lösung_und_Kommentare.pdf, T2_-_201_bis_240_-_Lösung_und_Kommentare.pdf, T2_-_241_bis_280_-_Lösung_und_Kommentare.pdf, 1_bis_40.pdf, 41_bis_80.pdf, 81_bis_120.pdf, 121_bis_160.pdf, 161_bis_200.pdf, 201_bis_240.pdf, 241_bis_280.pdf, 281_bis_320.pdf, 320_bis_370.pdf, 02d_Data_Engineering_-_SQL_Beispiele_und_Prüfungsfragen.pdf, 03d_Data_Engineering_-_Prüfungsfragen.pdf]
verweise: []
---

## Quiz

? Eine Tabelle für Finanztransaktionen (dedizierter SQL-Pool, gruppierter Columnstore-Index) hat: TransactionType (40 Mio. Zeilen je Typ), CustomerSegment (4 Mio. je Segment), TransactionMonth (65 Mio. je Monat), AccountType (500 Mio. je Typ). Analysten werten meist einen bestimmten Monat aus und fassen nach Typ/Segment/Kontotyp zusammen. Auf welcher Spalte partitionieren Sie?
- CustomerSegment
- AccountType
- TransactionType
* TransactionMonth
! Partitionen sollen dem häufigsten Filter folgen (Partition Elimination) und genug Zeilen haben: ≥ 1 Mio. Zeilen je Verteilung und Partition (60 Verteilungen → ≥ 60 Mio. je Partition). 65 Mio. je Monat passt.
@ DP-203 Frage 30

? Pool1 enthält die partitionierte Faktentabelle dbo.Sales und die Stagingtabelle stg.Sales mit passenden Tabellen- und Partitionsdefinitionen. Der Inhalt der ersten Partition von dbo.Sales soll mit dem Inhalt derselben Partition aus stg.Sales überschrieben werden – bei minimaler Ladezeit. Was tun Sie?
- Daten aus stg.Sales in dbo.Sales einfügen (INSERT)
- Die erste Partition von dbo.Sales nach stg.Sales wechseln
* Die erste Partition von stg.Sales nach dbo.Sales wechseln
- dbo.Sales aus stg.Sales aktualisieren (UPDATE)
! Partition Switching ist eine reine Metadatenoperation. Quelle ist die Stagingtabelle, Ziel die Faktentabelle (`ALTER TABLE stg.Sales SWITCH PARTITION 1 TO dbo.Sales PARTITION 1 WITH (TRUNCATE_TARGET = ON)`). Die Sammlung nennt B, Community 93 % C.
@ DP-203 Frage 33

? Eine Faktentabelle (dedizierter SQL-Pool, Hash-Verteilung auf ProductID, 20.000 Produkte) enthält 2,4 Milliarden Datensätze für 2019 und 2020. Welche Anzahl von Partitionsbereichen bietet optimale Komprimierung und Leistung für den gruppierten Columnstore-Index?
* 40
- 240
- 400
- 2.400
! Ziel ≥ 1 Mio. Zeilen je Partition und Verteilung: 2.400.000.000 / (60 Verteilungen × 1.000.000) = 40 Partitionen.
@ DP-203 Frage 37

? Tabelle1 (dedizierter SQL-Pool) hat 1 Mrd. Zeilen, gruppierten Columnstore-Index, Hash-Verteilung auf ProductKey und die Spalte SalesDate (date, NOT NULL). Monatlich kommen 30 Mio. Zeilen hinzu. Tabelle1 soll nach SalesDate partitioniert werden – optimal für Abfragen und Laden. Wie oft legen Sie eine Partition an?
- einmal pro Monat
* einmal pro Jahr
- einmal pro Tag
- einmal pro Woche
! 30 Mio. Zeilen / 60 Verteilungen = 0,5 Mio. je Verteilung und Monat – zu wenig für ≥ 1 Mio. je Partition und Verteilung. Jährlich: 360 Mio. / 60 = 6 Mio. ✔ Community gespalten (A 50 % / B 45 %); rechnerisch richtig ist B.
@ DP-203 Frage 62

? Eine Faktentabelle Table1 (dedizierter SQL-Pool) speichert Umsätze der letzten drei Jahre. Optimiert werden sollen: Anzahl Bestellungen je Woche, Gesamtumsatz je Region, Gesamtumsatz je Produkt, alle Bestellungen eines bestimmten Monats. Wonach partitionieren Sie?
- Produkt
* Monat
- Woche
- Region
! Partitionen nach Datum (hier Monat) ermöglichen Partition Elimination beim Monatsfilter und einfaches Partition Switching; Wochen erzeugen zu viele, zu kleine Partitionen.
@ DP-203 Frage 69

? Eine Faktentabelle Table1 (dedizierter SQL-Pool) erhält einen gruppierten Columnstore-Index. Wie viele Zeilen sollte sie mindestens enthalten, bevor Sie Partitionen anlegen?
- 100.000
- 600.000
- 1 Million
* 60 Millionen
! Für gute Komprimierung braucht jede Verteilung ≥ 1 Mio. Zeilen; bei 60 Verteilungen sind das 60 Mio. Zeilen – erst darüber lohnen Partitionen. Die Sammlung nennt A, die Community (83 %) D.
@ DP-203 Frage 78

? Eine Verkaufstabelle (dedizierter SQL-Pool, CCI, Round-Robin) erhält ca. 60 Mio. Zeilen pro Monat und ist nach Monat partitioniert. Wie viele Zeilen gibt es ungefähr je Kombination aus Verteilung und Partition?
* 1 Million
- 5 Millionen
- 20 Millionen
- 60 Millionen
! 60 Mio. Zeilen je Monatspartition / 60 Verteilungen = 1 Mio. Zeilen je Verteilung und Partition.
@ DP-203 Frage 98

? Eine Tabelle für Bestandsbewegungen (CCI) hat EventDate (1 Mio. Datensätze pro Tag), EventTypeID (10 Mio. je Typ), WarehouseID (100 Mio. je Lager), ProductCategoryTypeID (25 Mio. je Kategorie). Analysten werten meist ein Lager aus und fassen nach Kategorie, Datum und/oder Ereignistyp zusammen. Partitionsspalte?
- EventTypeID
- ProductCategoryTypeID
- EventDate
* WarehouseID
! Häufigster Filter ist das Lager, und 100 Mio. Zeilen je Lager erfüllen die Regel ≥ 1 Mio. Zeilen je Verteilung und Partition (60 Mio.). Tagespartitionen wären mit 1 Mio. viel zu klein.
@ DP-203 Frage 302

? Eine Tabelle im dedizierten SQL-Pool ist partitioniert. Was nehmen Sie in die T-SQL-Abfragen auf, um Partition Elimination maximal zu nutzen?
- JOIN
* WHERE
- DISTINCT
- GROUP BY
! Nur ein Filter (WHERE) auf der Partitionsspalte lässt den Optimierer unnötige Partitionen überspringen. Dozent: „Was macht ein WHERE? Was ist eine Partition?“
@ DP-203 Frage 323

## Reihenfolge

### DP-203 Frage 3 (Drag & Drop): SalesFact (1 Mrd. Zeilen, nach Monat partitioniert, gruppierter Columnstore-Index) – Daten älter als 36 Monate monatlich so schnell wie möglich entfernen. Richtige Reihenfolge in der gespeicherten Prozedur?
1. Leere Tabelle SalesFact_Work mit identischem Schema wie SalesFact anlegen
2. Partition mit den veralteten Daten von SalesFact nach SalesFact_Work wechseln (SWITCH)
3. Tabelle SalesFact_Work löschen (DROP)

## Zuordnen

### DP-203 Frage 11 (Drag & Drop): `CREATE TABLE table1 (ID INTEGER, col1 VARCHAR(10), col2 VARCHAR(10)) WITH ( [Lücke1] = HASH(ID), [Lücke2] (ID RANGE LEFT FOR VALUES (1, 1000000, 2000000)) );` Welche Werte gehören in die Lücken?
- Lücke 1 (vor = HASH(ID)) => DISTRIBUTION
- Lücke 2 (vor (ID RANGE LEFT …)) => PARTITION

### DP-203 Frage 45 (Hotspot): Faktentabelle FactTransaction (TransactionTypeID, TransactionDateID, CustomerID, RecipientID, Amount) – Löschen von Daten älter als 10 Jahre und I/O bei Year-to-Date-Abfragen minimieren. `WITH (CLUSTERED COLUMNSTORE INDEX, DISTRIBUTION = HASH([TransactionTypeID]), [1] ([2] RANGE RIGHT FOR VALUES (20200101, 20200201, …, 20200601)))`
- [1] Schlüsselwort => PARTITION
- [2] Spalte => [TransactionDateID]

### DP-203 Frage 56 (Drag & Drop): FactSales (ProductKey, OrderDateKey, CustomerKey, SalesOrderNumber, OrderQuantity, UnitPrice) – Daten 5 Jahre aufbewahren, jährlich ältere löschen, gleichmäßig verteilt, Löschen schnell. `WITH (CLUSTERED COLUMNSTORE INDEX, DISTRIBUTION = [1]([ProductKey]), PARTITION ([2] RANGE RIGHT FOR VALUES (20170101, 20180101, 20190101, 20200101, 20210101)))`
- [1] => HASH
- [2] => OrderDateKey

### DP-203 Frage 101 (Hotspot): Faktentabelle Table1 in Pool1 erhält monatlich 65 Mio. Zeilen; monatlich sollen Daten älter als 36 Monate möglichst schnell entfernt werden.
- Daten partitionieren => nach Datum, eine Partition pro Monat
- Daten entfernen => älteste Partition in eine Tabelle Table2 wechseln (SWITCH) und Table2 löschen

### DP-203 Frage 128 (Hotspot): FactOnlineSales enthält Daten von Anfang 2009 bis Ende 2012; vier Partitionen nach OrderDateKey, jede Partition = ein Kalenderjahr. `PARTITION ([OrderDateKey] RANGE [1] FOR VALUES ([2]))`
- [1] => RIGHT
- [2] => 20100101, 20110101, 20120101
