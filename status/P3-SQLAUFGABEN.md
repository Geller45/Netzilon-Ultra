# P3 – SQL-Aufgaben (app/sqlaufgaben.js)

60 Aufgaben: 44 abfrage, 16 aenderung. Test: `node tools/test-sqlaufgaben.js` (Musterlösungen, pruefSql-Trennschärfe, Stabilität, Felder/ids/Stufen, 31 bewusst falsche Lösungen) – ALLES OK; test-sqldb.js und check-content.js grün.

Genutzte Lern-Anomalien: Mitarbeiter ohne Abteilung (sql-09/25/58), Kunde ohne Bestellung (sql-26/40), Projekt ohne Zeiterfassung (sql-46/48), Artikel nie bestellt (sql-27/36), interne Projekte ohne Kunde (sql-28), NULL in NOT IN (Falschlösung sql-40). Feste Stichtage (2026-03-31), kein date('now').

| id | stufe | thema | art | titel |
|---|---|---|---|---|
| sql-01 | 1 | SELECT | abfrage | Standortliste |
| sql-02 | 1 | SELECT | abfrage | Preisliste mit Aliasen |
| sql-03 | 1 | SELECT | abfrage | Marge je Artikel |
| sql-04 | 1 | WHERE | abfrage | Nicht auf Lager |
| sql-05 | 1 | WHERE | abfrage | Hohe Gehälter |
| sql-06 | 1 | WHERE | abfrage | Bestellungen im 1. Quartal 2026 |
| sql-07 | 1 | WHERE | abfrage | Kunden im Norden |
| sql-08 | 1 | WHERE | abfrage | Netzwerk-Team finden |
| sql-09 | 1 | WHERE | abfrage | Ohne Abteilung |
| sql-10 | 1 | WHERE | abfrage | Aktive Teilzeitkräfte |
| sql-11 | 1 | ORDER | abfrage | Azubi-Liste sortiert |
| sql-12 | 1 | ORDER | abfrage | Die fünf teuersten Artikel |
| sql-13 | 1 | ORDER | abfrage | Branchen ohne Doppelte |
| sql-14 | 1 | SELECT | abfrage | Telefonliste Personal |
| sql-15 | 1 | ORDER | abfrage | Ausgeschiedene Kollegen |
| sql-16 | 1 | INSERT | aenderung | Neuer Artikel |
| sql-17 | 1 | UPDATE | aenderung | Lieferung eingetroffen |
| sql-18 | 2 | AGGREGAT | abfrage | Wie viele sind noch da? |
| sql-19 | 2 | AGGREGAT | abfrage | Gehaltsstatistik |
| sql-20 | 2 | AGGREGAT | abfrage | Lagerwert |
| sql-21 | 2 | GROUP BY | abfrage | Sortiment je Kategorie |
| sql-22 | 2 | GROUP BY | abfrage | Stammkunden |
| sql-23 | 2 | GROUP BY | abfrage | Bestellungen je Monat 2025 |
| sql-24 | 2 | JOIN | abfrage | Mitarbeiter mit Abteilung |
| sql-25 | 2 | JOIN | abfrage | Wirklich alle Mitarbeiter |
| sql-26 | 2 | JOIN | abfrage | Kunde ohne Bestellung |
| sql-27 | 2 | JOIN | abfrage | Ladenhüter |
| sql-28 | 2 | JOIN | abfrage | Projekte mit Auftraggeber |
| sql-29 | 2 | JOIN | abfrage | Wer ist mein Chef? |
| sql-30 | 2 | GROUP BY | abfrage | Kopfzahl je Abteilung |
| sql-31 | 2 | JOIN | abfrage | Top-5-Kunden nach Umsatz |
| sql-32 | 2 | GROUP BY | abfrage | Gehaltsbänder mit CASE |
| sql-33 | 2 | SELECT | abfrage | Geburtstage im April |
| sql-34 | 2 | WHERE | abfrage | Zehn Jahre dabei |
| sql-35 | 2 | INSERT | aenderung | Neue Auszubildende |
| sql-36 | 2 | INSERT | aenderung | Bestellung trotz CHECK |
| sql-37 | 2 | UPDATE | aenderung | Gehaltserhöhung im IT-Support |
| sql-38 | 2 | UPDATE | aenderung | Projekt abschließen |
| sql-39 | 2 | UPDATE | aenderung | Nachbestellung Hardware |
| sql-40 | 2 | DELETE | aenderung | Karteileiche entfernen |
| sql-41 | 2 | CREATE | aenderung | Spalte Homeoffice |
| sql-42 | 2 | INDEX | aenderung | Index für Kundenbestellungen |
| sql-43 | 3 | SUBQUERY | abfrage | Über dem Durchschnitt |
| sql-44 | 3 | SUBQUERY | abfrage | Artikel in Stornos |
| sql-45 | 3 | SUBQUERY | abfrage | Aktive Kunden Q1/2026 |
| sql-46 | 3 | SUBQUERY | abfrage | Noch keine Stunde gebucht |
| sql-47 | 3 | SUBQUERY | abfrage | Spitzenverdiener je Abteilung |
| sql-48 | 3 | CTE | abfrage | Projekte über Plan |
| sql-49 | 3 | CTE | abfrage | Dienstweg eines Azubis |
| sql-50 | 3 | CTE | abfrage | Alle unter der Ausbildungsleitung |
| sql-51 | 3 | FENSTER | abfrage | Die zwei Bestbezahlten je Abteilung |
| sql-52 | 3 | FENSTER | abfrage | Letzte Bestellung je Kunde |
| sql-53 | 3 | FENSTER | abfrage | Kumulierter Umsatz 2025 |
| sql-54 | 3 | JOIN | abfrage | Wer arbeitet an der Firewall? |
| sql-55 | 3 | INSERT | aenderung | Azubis ins Rollout-Projekt |
| sql-56 | 3 | DELETE | aenderung | Stornos bereinigen |
| sql-57 | 3 | CREATE | aenderung | Tabelle für Schulungen |
| sql-58 | 3 | VIEW | aenderung | Sicht Telefonbuch |
| sql-59 | 3 | TRANSAKTION | aenderung | Budget-Umbuchung |
| sql-60 | 3 | DELETE | aenderung | Abteilung auflösen |
