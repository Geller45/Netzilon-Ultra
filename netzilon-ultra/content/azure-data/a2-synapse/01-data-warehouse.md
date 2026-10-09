---
id: azd-data-warehouse
bereich: Azure Data
pruefungen: [DP-203, Schule]
fach: Data Engineering
block: A2
kapitel: Synapse und Data Warehouse
titel: Data Warehouse – Fakten, Dimensionen, Stern-/Schneeflockenschema, Verteilung, SCD
stufe: Fortgeschritten
quellen: [08_a_Data_Engineering_-_Data_Warehouse.pdf]
verweise: [azd-grundlagen, azd-synapse, azd-externe-tabellen]
---

## Profi

### Data Warehouse (DW)
Zentrales Datenbanksystem für Analysen: extrahiert, sammelt und sichert Daten aus heterogenen Quellen, versorgt nachgelagerte Systeme (BI), hält **aktuelle und historische** Daten. Aufbau aus **Fakten- und Dimensionstabellen** in **Stern-, Schneeflocken- oder Galaxie-Schema**. Teilmengen für einen Geschäftsbereich = **Data Mart**.

| Eigenschaft | Faktentabelle | Dimensionstabelle |
|---|---|---|
| Inhalt | Maße/Metriken (Umsatz, Menge) + Fremdschlüssel | beschreibende Attribute (Produktname, Kunde, Datum) |
| Datentyp | numerisch (und Schlüssel) | überwiegend Text |
| Größe | viele Zeilen, wächst „senkrecht“ | weniger Zeilen, viele Spalten („horizontal“) |
| Hierarchie | keine | ja (Jahr–Quartal–Monat) |
| Definiert durch | **Granularität** (Detailgrad einer Zeile) | – |
| Erstellung | nach den Dimensionen | zuerst |

### Schemas
- **Sternschema (Star)**: eine Faktentabelle (FactSales) in der Mitte, **denormalisierte** Dimensionen (DimProduct, DimCustomer, DimDate, DimStore, DimEmployee) außen. Einfachstes DW-Schema, wenig Joins, gut verständlich und schnell.
- **Schneeflocke (Snowflake)**: Dimensionen **normalisiert** (DimProduct → DimCategory, DimSupplier; DimCustomer → DimGeography); weniger Redundanz, mehr Joins.
- **Galaxie (Fact Constellation)**: mehrere Faktentabellen teilen Dimensionen.
Zeitdimension ermöglicht Aggregation nach Monat/Quartal.

### Schlüssel
**Surrogatschlüssel** (Ersatzschlüssel): einfache Ganzzahl, identifiziert eine Zeile der Dimension eindeutig. **Alternativ-/Geschäftsschlüssel** (Business Key, z. B. Kunden-ID I-543): identifiziert die Entität im Quellsystem und darf in der Dimension mehrfach vorkommen (gleiche Entität zu verschiedenen Zeitpunkten). Beispiel: Umzug von Seattle nach New York → neue Zeile mit gleichem AltKey, neuem Surrogatschlüssel.

### Slowly Changing Dimensions (SCD)
| Typ | Verhalten |
|---|---|
| **Typ 1** | alter Wert wird **überschrieben**, keine Historie |
| **Typ 2** | neue Zeile je Änderung; Gültigkeitszeitraum (ValidFrom/ValidTo), Flag IsCurrent; volle Historie, mehr Redundanz |
| **Typ 3** | zwei Versionen in einer Zeile (aktuell + vorher), nur für 1–2 Spalten |
| **Typ 6** | Kombination aus Typ 1, 2 und 3 |

### Tabellenarten im dedizierten SQL-Pool (Synapse)
| Typ | geeignet für |
|---|---|
| **Heap** | Staging/temporäre Tabellen, kleine Lookup-Tabellen |
| **Clustered Index** | Tabellen bis ~100 Mio. Zeilen, Punktabfragen |
| **Clustered Columnstore Index (CCI)** – Standard | große Tabellen (> 100 Mio. Zeilen), Analyse |

### Datenverteilung (Distribution)
Eine verteilte Tabelle ist logisch eine Tabelle, die Zeilen liegen physisch in **60 Distributionen**.
| Verteilung | Prinzip | Einsatz |
|---|---|---|
| **HASH** | Hash über eine Spalte bestimmt die Distribution; gleiche Werte zusammen | große **Faktentabellen** (> 2 GB, oft > 100 GB), Joins/Aggregationen auf dem Hash-Key |
| **ROUND_ROBIN** | gleichmäßig reihum (Standard) | **Staging**, kein sinnvoller Join-Key; Joins erfordern Data Movement |
| **REPLICATE** | vollständige Kopie auf jedem Compute-Knoten | kleine **Dimensionen** < 2 GB komprimiert |
**Skewed Data**: ungleichmäßige Verteilung (Distributionen mit ROWS = 0) – schlechter Hash-Key (z. B. viele NULL oder Datum).
```
CREATE TABLE dbo.FactSales (SaleKey BIGINT NOT NULL, ProductKey INT, Amount DECIMAL(18,2))
WITH (DISTRIBUTION = HASH(ProductKey), CLUSTERED COLUMNSTORE INDEX);
CREATE TABLE dbo.DimProduct (...) WITH (DISTRIBUTION = REPLICATE);
```

## Einfach

Ein **Data Warehouse** ist ein **riesiges, gut aufgeräumtes Archiv**, in dem ein Unternehmen alle Verkaufs- und Kundendaten aus vielen Systemen sammelt, um später Fragen zu beantworten wie „Wie viel haben wir letzten Sommer in Spanien mit Zelten verdient?“.

Das Archiv hat zwei Sorten von Tabellen:
- **Faktentabelle** = die **Kassenbons**: ganz viele Zeilen mit **Zahlen** (Menge, Preis, Umsatz) und Verweisen (Nummern).
- **Dimensionstabellen** = die **Nachschlagewerke**: „Produkt 17 ist ein Zelt, Marke XY“, „Kunde 5 wohnt in Paris“, „Datum 3.7. war ein Mittwoch im Juli“.

Zeichnet man das auf, sieht es aus wie ein **Stern**: In der Mitte die Fakten, drumherum die Dimensionen (**Sternschema**). Wenn man die Nachschlagewerke noch weiter aufteilt (Produkt → Kategorie → Lieferant), sieht es aus wie eine **Schneeflocke**.

**Wichtig: Dinge ändern sich!** Kunde Navin zieht von Seattle nach New York. Was tun?
- **SCD Typ 1**: Alte Adresse **überschreiben**. Die Vergangenheit ist weg.
- **SCD Typ 2**: Eine **neue Zeile** anlegen und die alte als „gültig bis gestern“ markieren. So weiß man später: „2023 wohnte er noch in Seattle.“

**Verteilung** (60 Teile): Das Archiv ist so groß, dass es auf **60 Regale** verteilt wird, die alle gleichzeitig suchen können.
- **Hash**: „Alle Bons mit derselben Produktnummer kommen ins selbe Regal.“ (Gut für riesige Faktentabellen.)
- **Round Robin**: „Reihum, jedes Regal ein Stück.“ (Gut zum Zwischenlagern.)
- **Replicate**: „Das kleine Nachschlagewerk bekommt jedes Regal als Kopie.“ (Gut für kleine Dimensionen.)

## Merksatz
- **Fakten = Zahlen (Kassenbons), Dimensionen = Beschreibung (Nachschlagewerk).**
- **Stern = denormalisiert, Schneeflocke = normalisiert.**
- **Hash für große Fakten, Replicate für kleine Dimensionen, Round Robin für Staging.**
- **SCD1 überschreibt, SCD2 versioniert (neue Zeile).**
- **60 Distributionen.**

## Prüfungsfalle
- Surrogatschlüssel ≠ Geschäftsschlüssel; nur der Geschäftsschlüssel wiederholt sich bei SCD2.
- REPLICATE nur bei kleinen Tabellen (< 2 GB); große Fakten nicht replizieren.
- HASH auf Spalte mit vielen NULL/wenigen Werten = Skew.
- CCI ist erst ab ca. 60 Mio. Zeilen (60 Distributionen × 1 Mio.) sinnvoll; kleine Tabellen → Heap/Clustered Index.
- Faktentabelle wird nach den Dimensionstabellen erstellt (Fremdschlüssel!).
- Dimension: weniger Zeilen, mehr Spalten; Fakten: viele Zeilen.

## Grafik
### Sternschema
1. FactSales: Fakten Umsatz und Menge mit Fremdschlüsseln
2. FactSales -> DimProduct: ProductKey
3. FactSales -> DimCustomer: CustomerKey
4. FactSales -> DimDate: DateKey
5. FactSales -> DimStore: StoreKey
### Verteilungsarten
1. Tabelle mit 6 Zeilen und 3 Distributionen
2. HASH: gleiche ProductKey landen in derselben Distribution
3. ROUND_ROBIN: Zeilen reihum in Distribution 1, 2, 3, 1, 2, 3
4. REPLICATE: jede Distribution erhält alle 6 Zeilen

## Lab
### GUI
Maschine: Windows-Client. Azure Portal > Synapse Analytics-Arbeitsbereich > Dedizierter SQL-Pool anlegen (kleinste DWU, danach pausieren!) > SQL-Skript ausführen.
### SQL
```
SELECT t.name, d.distribution_policy_desc FROM sys.tables t JOIN sys.pdw_table_distribution_properties d ON t.object_id = d.object_id;
DBCC PDW_SHOWSPACEUSED("dbo.FactSales");   -- Skew prüfen
```

## Übungen
- A: Welche Verteilung für eine 500-GB-Faktentabelle, die per ProductKey gejoint wird? | L: HASH(ProductKey).
- A: Welche Verteilung für eine 50-MB-Dimension? | L: REPLICATE.
- A: Welche Verteilung für eine Staging-Tabelle ohne Join-Key? | L: ROUND_ROBIN (Heap).
- A: Kunde zieht um, Historie soll erhalten bleiben – welcher SCD-Typ? | L: Typ 2 (neue Zeile mit Gültigkeitszeitraum, neuer Surrogatschlüssel).
- A: Unterschied Stern- und Schneeflockenschema? | L: Stern: denormalisierte Dimensionen, weniger Joins; Schneeflocke: normalisierte Dimensionen, weniger Redundanz, mehr Joins.

## Karteikarten
- F: Was enthält eine Faktentabelle? | A: Messwerte/Metriken und Fremdschlüssel auf Dimensionen.
- F: Was enthält eine Dimensionstabelle? | A: Beschreibende Attribute (meist Text), Hierarchien.
- F: Was ist ein Data Mart? | A: Teilmenge eines DW für einen Geschäftsbereich.
- F: Was ist ein Surrogatschlüssel? | A: Künstliche Ganzzahl, die eine Dimensionszeile eindeutig identifiziert.
- F: Was ist ein Alternativ-/Business-Key? | A: Schlüssel aus dem Quellsystem (z. B. Kunden-ID), in Dimension ggf. mehrfach.
- F: SCD Typ 1? | A: Überschreibt den alten Wert, keine Historie.
- F: SCD Typ 2? | A: Neue Zeile pro Änderung mit Gültigkeitszeitraum (volle Historie).
- F: SCD Typ 3? | A: Speichert aktuellen und vorherigen Wert in einer Zeile.
- F: In wie viele Distributionen ist eine verteilte Tabelle in Synapse aufgeteilt? | A: 60.
- F: Wann HASH? | A: Große Faktentabellen mit Join-/Aggregationsschlüssel.
- F: Wann REPLICATE? | A: Kleine Dimensionstabellen unter 2 GB.
- F: Wann ROUND_ROBIN? | A: Staging, kein offensichtlicher Join-Key.
- F: Was ist Skewed Data? | A: Ungleichmäßig verteilte Daten (Distributionen mit 0 Zeilen).

## Quiz
? Welche Verteilung eignet sich für große Faktentabellen?
* HASH
- REPLICATE
- ROUND_ROBIN
- Keine

? Welche Verteilung eignet sich für kleine Dimensionen?
* REPLICATE
- HASH
- ROUND_ROBIN
- PARTITION

? In wie viele Distributionen wird eine Synapse-Tabelle verteilt?
* 60
- 10
- 100
- 8

? Welcher SCD-Typ speichert die volle Historie mit neuen Zeilen?
* Typ 2
- Typ 1
- Typ 3
- Typ 0

? Was kennzeichnet ein Sternschema?
* Eine zentrale Faktentabelle mit denormalisierten Dimensionen
- Normalisierte Dimensionen in mehreren Ebenen
- Nur eine Tabelle
- Mehrere Faktentabellen ohne Dimensionen

? Was ist der Standard-Tabellentyp im dedizierten SQL-Pool?
* Clustered Columnstore Index
- Heap
- Clustered Index
- Nonclustered Index

? Wofür eignet sich ein Heap?
* Staging-Tabellen
- Große Faktentabellen
- Sehr große Dimensionen
- OLTP-Tabellen

? Woran erkennt man Skew?
* Einige Distributionen haben 0 Zeilen
- Alle Distributionen gleich groß
- Tabelle ist leer
- Keine Fremdschlüssel

## Lücken
- Faktentabellen verwendet man mit {HASH}-Verteilung, kleine Dimensionen mit {REPLICATE}.
- Bei SCD Typ {2} wird für jede Änderung eine neue Zeile angelegt.

## Zuordnen
### SCD-Typ und Verhalten
- Typ 1 => überschreiben
- Typ 2 => neue Zeile, Historie
- Typ 3 => alter und neuer Wert in einer Zeile
- Typ 6 => Kombination 1+2+3

## Spickzettel
- Fakt = Zahlen, Dimension = Beschreibung; Stern (denormalisiert) vs. Schneeflocke
- HASH große Fakten, REPLICATE kleine Dimension, ROUND_ROBIN Staging; 60 Distributionen
- CCI Standard (> 100 Mio. Zeilen), Heap Staging
- SCD1 überschreiben, SCD2 Historie
