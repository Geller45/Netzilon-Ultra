---
id: ap2-projektmanagement
bereich: AP2
block: A11
kapitel: Projektmanagement
titel: Projektmanagement (Phasen, Netzplan, Gantt, Lasten-/Pflichtenheft)
stufe: Fortgeschritten
quellen: [IHK-Prüfungskatalog, DIN 69901]
verweise: [ap2-pruefungsaufbau, ap2-wirtschaftlichkeit, ap2-dokumentation-kommunikation]
---

## Profi

### Projekt – Merkmale (DIN 69901)
**Einmaligkeit**, **klares Ziel**, **zeitliche Begrenzung** (Start/Ende), **begrenzte Ressourcen**, **eigene Organisation**, **Risiko/Komplexität**.

### Magisches Dreieck
**Qualität/Leistung – Zeit – Kosten**. Ändert man eine Ecke, ändern sich die anderen. (Erweitert: **Teufelsquadrat** mit Umfang.)

### Phasenmodelle
| Modell | Merkmal | Einsatz |
|---|---|---|
| **Wasserfall** | **Streng nacheinander**, Phase abgeschlossen vor nächster | **Klare, stabile Anforderungen** |
| **V-Modell** | **Jeder Entwicklungsphase** steht **eine Testphase** gegenüber | **Behörden, sicherheitskritisch** |
| **Spiralmodell** | **Iterativ mit Risikoanalyse** je Runde | **Große, riskante Projekte** |
| **Scrum** (agil) | **Sprints (1–4 Wochen)**, **Product Backlog**, **Rollen**: **Product Owner, Scrum Master, Entwicklungsteam**, **Events**: **Sprint Planning, Daily (15 min), Review, Retrospektive** | **Unklare, sich ändernde Anforderungen** |
| **Kanban** | **Board** (To Do/Doing/Done), **WIP-Limit** | **Laufender Betrieb, Support** |

### Klassische Phasen
**Initialisierung → Definition → Planung → Durchführung/Steuerung → Abschluss**.

### Lastenheft vs. Pflichtenheft
| | **Lastenheft** | **Pflichtenheft** |
|---|---|---|
| **Wer schreibt?** | **Auftraggeber** (Kunde) | **Auftragnehmer** |
| **Frage** | **WAS** und **WOFÜR** | **WIE** und **WOMIT** |
| **Reihenfolge** | **Zuerst** | **Danach, basiert auf Lastenheft** |

### Projektstrukturplan (PSP)
**Zerlegt das Projekt hierarchisch** in **Teilaufgaben** bis zu **Arbeitspaketen** (kleinste Einheit, verantwortlich, Aufwand, Ergebnis). **Gliederung**: **objekt-**, **funktions-** oder **phasenorientiert**.

### Netzplan (Vorgangsknoten)
**Knoten**: FAZ | Dauer | FEZ / Vorgang / SAZ | Puffer | SEZ.

| Kürzel | Bedeutung | Berechnung |
|---|---|---|
| **FAZ** | Frühester Anfang | **max(FEZ der Vorgänger)** |
| **FEZ** | Frühestes Ende | **FAZ + Dauer** |
| **SEZ** | Spätestes Ende | **min(SAZ der Nachfolger)** |
| **SAZ** | Spätester Anfang | **SEZ − Dauer** |
| **GP** | Gesamtpuffer | **SAZ − FAZ** (= SEZ − FEZ) |
| **FP** | Freier Puffer | **min(FAZ Nachfolger) − FEZ** |

- **Vorwärtsrechnung** (FAZ/FEZ) von links, **Rückwärtsrechnung** (SAZ/SEZ) von rechts.
- **Kritischer Pfad**: alle Vorgänge mit **GP = 0** – **Verzögerung verschiebt das Projektende**.

**Beispiel**: A (3 T) → B (2 T) und C (4 T) → D (1 T, braucht B und C).
FEZ A = 3; B: 3–5; C: 3–7; D: FAZ = max(5,7) = 7, FEZ = 8. Rückwärts: D SAZ 7; B SEZ 7 → SAZ 5, GP 2; C GP 0. **Kritischer Pfad A–C–D, 8 Tage**.

### Gantt-Diagramm
**Balken** auf **Zeitachse**, **Abhängigkeiten** als Pfeile, **Meilensteine** als Rauten. **Gut für Terminübersicht**, **schlechter für Pufferberechnung** als der Netzplan.

### Weitere Werkzeuge
- **Meilenstein**: **Zeitpunkt** mit **Ergebnis** (Dauer 0).
- **Risikoanalyse**: **Risiko = Eintrittswahrscheinlichkeit × Schadenshöhe**.
- **Stakeholder-Analyse**: Beteiligte, Einfluss, Interessen.
- **SMART-Ziele**: **Spezifisch, Messbar, Akzeptiert/Attraktiv, Realistisch, Terminiert**.
- **RACI**: Responsible, Accountable, Consulted, Informed.
- **Soll-Ist-Vergleich**, **Projektabschlussbericht**, **Lessons Learned**.

## Einfach
Ein Projekt ist wie **eine Geburtstagsparty planen**: **Einmalig**, **bestimmtes Datum**, **begrenztes Geld**. Der **Kunde** schreibt auf, **was** er will (**Lastenheft**: „Party mit 20 Leuten und Kuchen“). Du schreibst, **wie** du es machst (**Pflichtenheft**: „Schokokuchen vom Bäcker, Raum im Keller“). Im **Netzplan** siehst du: **Kuchen backen** kann warten, aber **Einladungen verschicken** darf sich **nicht verspäten** – das ist der **kritische Pfad**.

## Merksatz
- **Lasten = Kunde = WAS**, **Pflichten = Firma = WIE**.
- **Vorwärts: FAZ + Dauer = FEZ**, **rückwärts: SEZ − Dauer = SAZ**.
- **GP = SAZ − FAZ**, **kritisch = GP 0**.
- **Beim Vorwärts das Maximum**, **beim Rückwärts das Minimum**.
- **Scrum: PO, SM, Team – Planning, Daily, Review, Retro**.

## Prüfungsfalle
- **FAZ bei mehreren Vorgängern = Maximum**, nicht Summe.
- **SEZ bei mehreren Nachfolgern = Minimum**.
- **Lasten- und Pflichtenheft vertauscht**.
- **Meilenstein hat Dauer 0**.
- **Daily Scrum = 15 min**, **kein Problemlösemeeting**.
- **Freier Puffer ≠ Gesamtpuffer**.

## Grafik
### Magisches Dreieck
Dreieck mit Zeit, Kosten, Qualität – eine Ecke ziehen, die anderen verziehen sich.

### Netzplan-Knoten
Kasten mit 6 Feldern, Werte laufen vorwärts und rückwärts, kritischer Pfad rot.

### Scrum-Kreis
Backlog → Sprint Planning → Sprint mit Daily → Review → Retro → neuer Sprint.

## Übungen
- A: A (2 T) → B (3 T) → D (2 T); A → C (1 T) → D. Kritischer Pfad und Puffer von C? | L: A–B–D, 7 Tage; C: FAZ 2, FEZ 3, SEZ 5, SAZ 4, GP 2.
- A: Wer erstellt das Pflichtenheft? | L: Der Auftragnehmer auf Basis des Lastenhefts.

## Karteikarten
- F: Merkmale eines Projekts? | A: Einmalig, zielgerichtet, zeitlich begrenzt, begrenzte Ressourcen, eigene Organisation.
- F: Ecken des magischen Dreiecks? | A: Qualität, Zeit, Kosten.
- F: Lastenheft? | A: Anforderungen des Auftraggebers (WAS/WOFÜR).
- F: Pflichtenheft? | A: Umsetzungskonzept des Auftragnehmers (WIE/WOMIT).
- F: Wie berechnet man den Gesamtpuffer? | A: SAZ − FAZ.
- F: Was ist der kritische Pfad? | A: Kette der Vorgänge mit Gesamtpuffer 0.
- F: Was ist ein Arbeitspaket? | A: Kleinste Einheit im Projektstrukturplan.
- F: Scrum-Rollen? | A: Product Owner, Scrum Master, Entwicklungsteam.
- F: Wofür steht SMART? | A: Spezifisch, messbar, akzeptiert, realistisch, terminiert.
- F: Unterschied Wasserfall und V-Modell? | A: V-Modell ordnet jeder Phase eine Testphase zu.

## Quiz
? Ein Vorgang hat die Vorgänger mit FEZ 5 und 7. Wie lautet sein FAZ?
* 7
- 5
- 12
- 6

? Wer erstellt das Lastenheft?
* Der Auftraggeber
- Der Auftragnehmer
- Die IHK
- Der Scrum Master

? Was gilt für Vorgänge auf dem kritischen Pfad?
* Gesamtpuffer 0
- Freier Puffer immer größer 0
- Sie haben keine Vorgänger
- Sie sind Meilensteine

? Welches Vorgehen passt bei sich ständig ändernden Anforderungen?
* Scrum
- Wasserfall
- V-Modell
- Lastenheft

? Wie lange dauert ein Daily Scrum?
* 15 Minuten
- 1 Stunde
- 1 Tag
- Einen Sprint
