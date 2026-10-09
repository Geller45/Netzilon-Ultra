---
id: ihk-glossar-systeme
bereich: AP1
block: IHK
kapitel: Glossar
titel: Glossar IT-Systeme, Cloud und Datenbanken (Abkürzungen A-Z)
stufe: Einsteiger
fach: PV – AP1
pruefungen: [AP1, AP2]
quellen: [Abkürzungsverzeichnis.md (Obsidian FI Ausbildung-Themen, Version 1.0.0), Themen-Beziehungskarte.md]
verweise: [ihk-fachbegriffe-technik, ihk-fachbegriffe-betrieb-security]
---

## Profi

Hardware, Speicher, Virtualisierung, Cloud und Datenbanken: In AP1 werden diese Kürzel vorausgesetzt. Das Glossar liefert Auflösung und Kurzerklärung für Prüfung und Berufsalltag. Das Glossar enthält 54 Einträge, alphabetisch, jeweils mit Auflösung und Kurzerklärung.

| Kürzel | Bedeutung | Erklärung |
|---|---|---|
| ACID | Atomicity, Consistency, Isolation, Durability | Atomarität, Konsistenz, Isolation, Dauerhaftigkeit Die vier Garantien einer korrekten Datenbank-Transaktion: entweder vollständig oder gar nicht (A), gültiger Zustand vor/nach (C), parallele Transaktionen stören sich nicht (I), Ergebnis bleibt nach Absturz erhalten (D). |
| AFR | Annualized Failure Rate | Statistische, auf ein Jahr hochgerechnete Ausfallwahrscheinlichkeit eines Geräts (z. B. Festplatte). Berechnung: `8760h / MTBF × 100 %`. |
| AWS | Amazon Web Services | Großer Cloud-Infrastruktur-Anbieter (IaaS/PaaS/SaaS). |
| BASE | Basically Available, Soft state, Eventual consistency | Konsistenzmodell vieler NoSQL-Datenbanken - Gegenentwurf zu ACID: Verfügbarkeit wird über sofortige Konsistenz gestellt, das System „pendelt sich" zeitversetzt ein. |
| BI | Business Intelligence | Verfahren und Werkzeuge zur Sammlung, Aufbereitung und Analyse von Unternehmensdaten für Entscheidungen. |
| BLOB | Binary Large Object | Datenbank-Datentyp für große binäre Daten (Bilder, Dateien, …). |
| BSON | Binary JSON | Binäre Kodierung von JSON-ähnlichen Dokumenten, u. a. von MongoDB genutzt. |
| CAPEX | Capital Expenditure | Investitionsausgaben Einmalige Ausgaben für langfristige Anschaffungen (z. B. eigene Server). Gegenteil: OPEX. |
| CPU | Central Processing Unit | Hauptprozessor |
| CRUD | Create, Read, Update, Delete | Die vier grundlegenden Operationen der persistenten Datenverwaltung; entsprechen typischerweise `INSERT`, `SELECT`, `UPDATE`, `DELETE` (SQL) bzw. `POST`, `GET`, `PUT`, `DELETE` (REST). |
| DCL | Data Control Language | SQL-Teilsprache für Rechteverwaltung: `GRANT`, `REVOKE`. |
| DDL | Data Definition Language | SQL-Teilsprache zur Definition von Datenbankstrukturen: `CREATE`, `ALTER`, `DROP`. |
| DML | Data Manipulation Language | SQL-Teilsprache zur Datenmanipulation: `SELECT`, `INSERT`, `UPDATE`, `DELETE`. |
| DWH | Data Warehouse | Zentrales, historisiertes Datenlager für Analysen/Reporting, gespeist über ETL-Prozesse aus operativen Systemen. |
| ER | Entity-Relationship | (-Modell) Modellierungsmethode für Datenbankstrukturen: Entitäten, Attribute und Beziehungen (Kardinalitäten). |
| ETL | Extract, Transform, Load | Standardprozess zum Befüllen eines Data Warehouse: Daten extrahieren, in Zielformat transformieren, laden. |
| FCoE | Fibre Channel over Ethernet | Kapselt Fibre-Channel-Speicherverkehr (SAN) in Ethernet-Frames - Konvergenz von Storage- und Datennetz. |
| FK | Fremdschlüssel | Foreign Key Spalte(n), die auf den Primärschlüssel (PK) einer anderen Tabelle verweisen und referentielle Integrität erzwingen. |
| HW | Hardware |  |
| IaaS | Infrastructure as a Service | Cloud-Modell: Anbieter stellt virtuelle Infrastruktur (Server, Netz, Storage) bereit; Betriebssystem und Anwendungen verantwortet der Kunde. |
| ID | Identifikator | Identifier Eindeutige Kennung eines Objekts/Datensatzes. |
| IKT | Informations- und Kommunikationstechnik | Sammelbegriff für Technologien der Informationsverarbeitung und -übertragung. |
| iSCSI | Internet Small Computer System Interface | Überträgt block-basierten SCSI-Speicherverkehr über normale TCP/IP-Netze - „SAN über Ethernet"/„SAN für Arme". |
| IT | Informationstechnik / Informationstechnologie |  |
| JDBC | Java Database Connectivity | Java-API für den Zugriff auf relationale Datenbanken. |
| MTBF | Mean Time Between Failures | Durchschnittliche Zeit zwischen zwei Ausfällen eines (reparierbaren) Systems. |
| MTTF | Mean Time To Failure | Durchschnittliche Lebenserwartung bis zum ersten Ausfall (nicht reparierbare Komponenten, z. B. Festplatte). |
| MTTR | Mean Time To Repair | Durchschnittliche Dauer, um einen Ausfall zu beheben. |
| NAS | Network Attached Storage | Dateibasierter Netzwerkspeicher, über Standard-Ethernet/IP erreichbar (Gegensatz: blockbasiertes SAN). |
| NF | Normalform | Stufe der Datenbank-Normalisierung (1NF, 2NF, 3NF, …), die Redundanz und Anomalien reduziert. |
| NoSQL | Not only SQL | Sammelbegriff für nicht-relationale Datenbanken (Dokument-, Key-Value-, Spalten-, Graph-Datenbanken), oft nach dem BASE- statt ACID-Modell. |
| OPEX | Operational Expenditure | Betriebsausgaben Laufende Ausgaben (z. B. Cloud-Miete „Pay-per-Use"). Gegenteil: CAPEX. |
| ORM | Object-Relational Mapping | Technik/Werkzeug, das Objekte einer objektorientierten Sprache automatisiert auf relationale Datenbanktabellen abbildet. |
| OS | Operating System | Betriebssystem |
| PaaS | Platform as a Service | Cloud-Modell: Anbieter stellt eine komplette Plattform (Betriebssystem, Laufzeitumgebung) bereit; der Kunde verantwortet nur seine Anwendung. |
| PC | Personal Computer |  |
| PK | Primärschlüssel | Primary Key Spalte(n), die jeden Datensatz einer Tabelle eindeutig identifizieren. |
| PUE | Power Usage Effectiveness | Kennzahl für die Energieeffizienz eines Rechenzentrums (Gesamtenergie ÷ IT-Energie; Idealwert nahe 1,0). |
| RAID | Redundant Array of Independent Disks | Verbund mehrerer Festplatten zur Steigerung von Ausfallsicherheit und/oder Geschwindigkeit - kein Ersatz für Backup (schützt vor Hardware-Ausfall, nicht vor Datenverlust/Löschung/Ransomware). Vertiefung: Notiz RAID noch ohne Inhalt → siehe Notizen ohne Inhalt |
| RAM | Random Access Memory | Arbeitsspeicher |
| RPO | Recovery Point Objective | Maximal tolerierbarer Datenverlust im Ernstfall, ausgedrückt als Zeitspanne seit der letzten Sicherung. |
| RTO | Recovery Time Objective | Maximal tolerierbare Ausfallzeit, bis ein System nach einem Vorfall wieder verfügbar sein muss. |
| SaaS | Software as a Service | Cloud-Modell: fertige Anwendungssoftware wird über das Internet bereitgestellt und genutzt (z. B. per Browser). |
| SAN | Storage Area Network | Dediziertes, blockbasiertes Speichernetz (z. B. Fibre Channel), verbindet Server mit zentralem Massenspeicher. |
| SATA | Serial Advanced Technology Attachment | Schnittstellenstandard zum Anschluss von Festplatten/SSDs. |
| SCSI | Small Computer System Interface | Standard für den Anschluss von Speichergeräten/Peripherie; Grundlage von iSCSI. |
| SLA | Service Level Agreement | Vertraglich vereinbarte Zusicherung von Dienstgüte (z. B. Verfügbarkeit „99,9 %") zwischen Anbieter und Kunde. |
| SQL | Structured Query Language | Standardsprache für relationale Datenbanken, unterteilt u. a. in DDL, DML, DCL und TCL. |
| TCL | Transaction Control Language | SQL-Teilsprache zur Transaktionssteuerung: `COMMIT`, `ROLLBACK`. |
| TCO | Total Cost of Ownership | Gesamtkosten eines Systems über seinen gesamten Lebenszyklus (Anschaffung + Betrieb + Wartung + Entsorgung). |
| UPS | Uninterruptible Power Supply | englische Bezeichnung der USV. |
| USB | Universal Serial Bus | Standardisierte Schnittstelle für den Anschluss von Peripheriegeräten. |
| USV | Unterbrechungsfreie Stromversorgung | deutsches Pendant zu UPS. Typen: VFI (Online, höchste Schutzklasse), VI (Line-Interactive), VFD (Offline/Standby). |
| VM | Virtual Machine | Virtuelle Maschine Softwarebasierte Emulation eines vollständigen Computersystems auf einem physischen Host. |

Mehrdeutige Kürzel (z. B. CD, CI, AG) haben je nach Fach unterschiedliche Bedeutung. In Prüfungsaufgaben entscheidet der Kontext, welche gemeint ist.

## Einfach

Ein Computer ist wie eine Küche. **CPU** ist der Koch, **RAM** die Arbeitsfläche, **SSD** die Vorratskammer, **GPU** der Spezialist für Dekoration. **RAID** bedeutet, dass mehrere Festplatten zusammenarbeiten, damit nichts verloren geht, auch wenn eine kaputtgeht. **USV** ist die Notstromversorgung, damit der Herd nicht ausgeht. **IaaS**, **PaaS** und **SaaS** sind Restaurantstufen: Du mietest nur die Küche, die Küche mit Koch oder das fertige Essen. Bei Datenbanken ist **SQL** die Sprache, mit der du den Aktenschrank befragst, **ACID** garantiert, dass keine halbe Buchung stehen bleibt.

So gehst du vor: Schau dir jeden Tag zehn Kürzel an. Sprich die Langform laut aus, überlege dir ein Beispiel aus deinem Alltag oder deinem Betrieb und decke danach die Antwort zu. Wenn du ein Kürzel dreimal richtig hattest, wandert es in den hinteren Teil des Stapels. Kürzel, die du verwechselst, schreibst du nebeneinander auf und notierst den einen Satz, der sie unterscheidet. In der Prüfung hilft dir das doppelt: Du erkennst Aufgabentexte schneller, und wenn die Langform verlangt wird, schreibst du sie sicher und ohne Rechtschreibfehler. Wer die Kürzel kennt, spart in der Klausur wertvolle Minuten für die Rechenaufgaben.

## Merksatz
- RAID 0 schnell ohne Schutz, RAID 1 Spiegel, RAID 5 ein Paritätslaufwerk, RAID 6 zwei, RAID 10 Spiegel plus Stripe.
- IaaS, PaaS, SaaS: Verantwortung wandert vom Kunden zum Anbieter.
- ACID: Atomarität, Konsistenz, Isolation, Dauerhaftigkeit.
- NAS = Dateiebene, SAN = Blockebene.

## Prüfungsfalle
- RAID ersetzt kein Backup.
- NAS und SAN vertauschen.
- SQL-Befehlsgruppen (DDL, DML, DCL) vermischen.

## Grafik
### So lernst du Abkürzungen
1. Lernender: liest das Kürzel
2. Lernender -> Gedächtnis: spricht die Langform laut aus
3. Gedächtnis: verknüpft sie mit Zweck und Schicht oder Kategorie
4. Lernender -> Karteikarte: prüft sich selbst nach einem Tag
5. Karteikarte -> Lernender: Wiederholung nach einer Woche festigt es

## Karteikarten
- F: Wofür steht ACID? | A: Atomicity, Consistency, Isolation, Durability – Atomarität, Konsistenz, Isolation, Dauerhaftigkeit Die vier Garantien einer korrekten Datenbank-Transaktion: entweder vollständig oder gar nicht (A), gültiger Zustand vor/nach (C), parallele Transaktionen stören sich nicht (I), Ergebnis bleibt nach Absturz erhalten (D).
- F: Wofür steht AFR? | A: Annualized Failure Rate – Statistische, auf ein Jahr hochgerechnete Ausfallwahrscheinlichkeit eines Geräts (z. B. Festplatte). Berechnung: `8760h / MTBF × 100 %`.
- F: Wofür steht AWS? | A: Amazon Web Services – Großer Cloud-Infrastruktur-Anbieter (IaaS/PaaS/SaaS).
- F: Wofür steht BASE? | A: Basically Available, Soft state, Eventual consistency – Konsistenzmodell vieler NoSQL-Datenbanken - Gegenentwurf zu ACID: Verfügbarkeit wird über sofortige Konsistenz gestellt, das System „pendelt sich" zeitversetzt ein.
- F: Wofür steht BI? | A: Business Intelligence – Verfahren und Werkzeuge zur Sammlung, Aufbereitung und Analyse von Unternehmensdaten für Entscheidungen.
- F: Wofür steht BLOB? | A: Binary Large Object – Datenbank-Datentyp für große binäre Daten (Bilder, Dateien, …).
- F: Wofür steht BSON? | A: Binary JSON – Binäre Kodierung von JSON-ähnlichen Dokumenten, u. a. von MongoDB genutzt.
- F: Wofür steht CAPEX? | A: Capital Expenditure – Investitionsausgaben Einmalige Ausgaben für langfristige Anschaffungen (z. B. eigene Server). Gegenteil: OPEX.
- F: Wofür steht CPU? | A: Central Processing Unit – Hauptprozessor
- F: Wofür steht CRUD? | A: Create, Read, Update, Delete – Die vier grundlegenden Operationen der persistenten Datenverwaltung; entsprechen typischerweise `INSERT`, `SELECT`, `UPDATE`, `DELETE` (SQL) bzw. `POST`, `GET`, `PUT`, `DELETE` (REST).
- F: Wofür steht DCL? | A: Data Control Language – SQL-Teilsprache für Rechteverwaltung: `GRANT`, `REVOKE`.
- F: Wofür steht DDL? | A: Data Definition Language – SQL-Teilsprache zur Definition von Datenbankstrukturen: `CREATE`, `ALTER`, `DROP`.
- F: Wofür steht DML? | A: Data Manipulation Language – SQL-Teilsprache zur Datenmanipulation: `SELECT`, `INSERT`, `UPDATE`, `DELETE`.
- F: Wofür steht DWH? | A: Data Warehouse – Zentrales, historisiertes Datenlager für Analysen/Reporting, gespeist über ETL-Prozesse aus operativen Systemen.
- F: Wofür steht ER? | A: Entity-Relationship – (-Modell) Modellierungsmethode für Datenbankstrukturen: Entitäten, Attribute und Beziehungen (Kardinalitäten).
- F: Wofür steht ETL? | A: Extract, Transform, Load – Standardprozess zum Befüllen eines Data Warehouse: Daten extrahieren, in Zielformat transformieren, laden.
- F: Wofür steht FCoE? | A: Fibre Channel over Ethernet – Kapselt Fibre-Channel-Speicherverkehr (SAN) in Ethernet-Frames - Konvergenz von Storage- und Datennetz.
- F: Wofür steht FK? | A: Fremdschlüssel – Foreign Key Spalte(n), die auf den Primärschlüssel (PK) einer anderen Tabelle verweisen und referentielle Integrität erzwingen.
- F: Wofür steht HW? | A: Hardware
- F: Wofür steht IaaS? | A: Infrastructure as a Service – Cloud-Modell: Anbieter stellt virtuelle Infrastruktur (Server, Netz, Storage) bereit; Betriebssystem und Anwendungen verantwortet der Kunde.
- F: Wofür steht ID? | A: Identifikator – Identifier Eindeutige Kennung eines Objekts/Datensatzes.
- F: Wofür steht IKT? | A: Informations- und Kommunikationstechnik – Sammelbegriff für Technologien der Informationsverarbeitung und -übertragung.
- F: Wofür steht iSCSI? | A: Internet Small Computer System Interface – Überträgt block-basierten SCSI-Speicherverkehr über normale TCP/IP-Netze - „SAN über Ethernet"/„SAN für Arme".
- F: Wofür steht IT? | A: Informationstechnik / Informationstechnologie
- F: Wofür steht JDBC? | A: Java Database Connectivity – Java-API für den Zugriff auf relationale Datenbanken.
- F: Wofür steht MTBF? | A: Mean Time Between Failures – Durchschnittliche Zeit zwischen zwei Ausfällen eines (reparierbaren) Systems.
- F: Wofür steht MTTF? | A: Mean Time To Failure – Durchschnittliche Lebenserwartung bis zum ersten Ausfall (nicht reparierbare Komponenten, z. B. Festplatte).
- F: Wofür steht MTTR? | A: Mean Time To Repair – Durchschnittliche Dauer, um einen Ausfall zu beheben.
- F: Wofür steht NAS? | A: Network Attached Storage – Dateibasierter Netzwerkspeicher, über Standard-Ethernet/IP erreichbar (Gegensatz: blockbasiertes SAN).
- F: Wofür steht NF? | A: Normalform – Stufe der Datenbank-Normalisierung (1NF, 2NF, 3NF, …), die Redundanz und Anomalien reduziert.
- F: Wofür steht NoSQL? | A: Not only SQL – Sammelbegriff für nicht-relationale Datenbanken (Dokument-, Key-Value-, Spalten-, Graph-Datenbanken), oft nach dem BASE- statt ACID-Modell.
- F: Wofür steht OPEX? | A: Operational Expenditure – Betriebsausgaben Laufende Ausgaben (z. B. Cloud-Miete „Pay-per-Use"). Gegenteil: CAPEX.
- F: Wofür steht ORM? | A: Object-Relational Mapping – Technik/Werkzeug, das Objekte einer objektorientierten Sprache automatisiert auf relationale Datenbanktabellen abbildet.
- F: Wofür steht OS? | A: Operating System – Betriebssystem
- F: Wofür steht PaaS? | A: Platform as a Service – Cloud-Modell: Anbieter stellt eine komplette Plattform (Betriebssystem, Laufzeitumgebung) bereit; der Kunde verantwortet nur seine Anwendung.
- F: Wofür steht PC? | A: Personal Computer
- F: Wofür steht PK? | A: Primärschlüssel – Primary Key Spalte(n), die jeden Datensatz einer Tabelle eindeutig identifizieren.
- F: Wofür steht PUE? | A: Power Usage Effectiveness – Kennzahl für die Energieeffizienz eines Rechenzentrums (Gesamtenergie ÷ IT-Energie; Idealwert nahe 1,0).
- F: Wofür steht RAID? | A: Redundant Array of Independent Disks – Verbund mehrerer Festplatten zur Steigerung von Ausfallsicherheit und/oder Geschwindigkeit - kein Ersatz für Backup (schützt vor Hardware-Ausfall, nicht vor Datenverlust/Löschung/Ransomware). Vertiefung: Notiz RAID noch ohne Inhalt → siehe Notizen ohne Inhalt
- F: Wofür steht RAM? | A: Random Access Memory – Arbeitsspeicher
- F: Wofür steht RPO? | A: Recovery Point Objective – Maximal tolerierbarer Datenverlust im Ernstfall, ausgedrückt als Zeitspanne seit der letzten Sicherung.
- F: Wofür steht RTO? | A: Recovery Time Objective – Maximal tolerierbare Ausfallzeit, bis ein System nach einem Vorfall wieder verfügbar sein muss.
- F: Wofür steht SaaS? | A: Software as a Service – Cloud-Modell: fertige Anwendungssoftware wird über das Internet bereitgestellt und genutzt (z. B. per Browser).
- F: Wofür steht SAN? | A: Storage Area Network – Dediziertes, blockbasiertes Speichernetz (z. B. Fibre Channel), verbindet Server mit zentralem Massenspeicher.
- F: Wofür steht SATA? | A: Serial Advanced Technology Attachment – Schnittstellenstandard zum Anschluss von Festplatten/SSDs.
- F: Wofür steht SCSI? | A: Small Computer System Interface – Standard für den Anschluss von Speichergeräten/Peripherie; Grundlage von iSCSI.
- F: Wofür steht SLA? | A: Service Level Agreement – Vertraglich vereinbarte Zusicherung von Dienstgüte (z. B. Verfügbarkeit „99,9 %") zwischen Anbieter und Kunde.
- F: Wofür steht SQL? | A: Structured Query Language – Standardsprache für relationale Datenbanken, unterteilt u. a. in DDL, DML, DCL und TCL.
- F: Wofür steht TCL? | A: Transaction Control Language – SQL-Teilsprache zur Transaktionssteuerung: `COMMIT`, `ROLLBACK`.
- F: Wofür steht TCO? | A: Total Cost of Ownership – Gesamtkosten eines Systems über seinen gesamten Lebenszyklus (Anschaffung + Betrieb + Wartung + Entsorgung).
- F: Wofür steht UPS? | A: Uninterruptible Power Supply – englische Bezeichnung der USV.
- F: Wofür steht USB? | A: Universal Serial Bus – Standardisierte Schnittstelle für den Anschluss von Peripheriegeräten.
- F: Wofür steht USV? | A: Unterbrechungsfreie Stromversorgung – deutsches Pendant zu UPS. Typen: VFI (Online, höchste Schutzklasse), VI (Line-Interactive), VFD (Offline/Standby).
- F: Wofür steht VM? | A: Virtual Machine – Virtuelle Maschine Softwarebasierte Emulation eines vollständigen Computersystems auf einem physischen Host.

## Quiz

? Wofür steht DWH?
* Data Warehouse
- Identifikator
- Binary Large Object
- Create, Read, Update, Delete

? Wofür steht RAM?
* Random Access Memory
- Binary JSON
- Transaction Control Language
- Informations- und Kommunikationstechnik

? Wofür steht JDBC?
* Java Database Connectivity
- Transaction Control Language
- Fibre Channel over Ethernet
- Operational Expenditure

? Wofür steht CRUD?
* Create, Read, Update, Delete
- Small Computer System Interface
- Data Definition Language
- Platform as a Service

? Wofür steht RPO?
* Recovery Point Objective
- Annualized Failure Rate
- Data Warehouse
- Operating System

? Wofür steht FCoE?
* Fibre Channel over Ethernet
- Java Database Connectivity
- Create, Read, Update, Delete
- Small Computer System Interface

? Wofür steht iSCSI?
* Internet Small Computer System Interface
- Personal Computer
- Annualized Failure Rate
- Total Cost of Ownership

? Wofür steht RAID?
* Redundant Array of Independent Disks
- Operating System
- Infrastructure as a Service
- Software as a Service

? Wofür steht IT?
* Informationstechnik / Informationstechnologie
- Binary Large Object
- Small Computer System Interface
- Fibre Channel over Ethernet

? Wofür steht NoSQL?
* Not only SQL
- Platform as a Service
- Informationstechnik / Informationstechnologie
- Data Control Language

? Wofür steht CAPEX?
* Capital Expenditure
- Informationstechnik / Informationstechnologie
- Uninterruptible Power Supply
- Extract, Transform, Load

? Wofür steht SAN?
* Storage Area Network
- Platform as a Service
- Uninterruptible Power Supply
- Object-Relational Mapping

? Wofür steht OPEX?
* Operational Expenditure
- Informations- und Kommunikationstechnik
- Recovery Time Objective
- Entity-Relationship

? Wofür steht NF?
* Normalform
- Recovery Point Objective
- Unterbrechungsfreie Stromversorgung
- Universal Serial Bus

? Wofür steht SATA?
* Serial Advanced Technology Attachment
- Total Cost of Ownership
- Data Manipulation Language
- Unterbrechungsfreie Stromversorgung

? Wofür steht USV?
* Unterbrechungsfreie Stromversorgung
- Extract, Transform, Load
- Virtual Machine
- Mean Time Between Failures
