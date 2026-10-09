---
id: ihk-requirements-vorgehensmodelle
bereich: Prüfung
block: IHK
kapitel: Projekt und Entwicklung
titel: Anforderungen und Vorgehensmodelle – Lastenheft, MoSCoW, User Stories, Wasserfall, V-Modell, Scrum, Kanban, PDCA
stufe: Fortgeschritten
fach: PV – AP2
pruefungen: [AP1, AP2]
quellen: [Requirements-Engineering-Vorgehensmodelle.md (Obsidian v2), Requirements-Engineering.md, Vorgehensmodelle-Projektmethodik.md (v1), Projektmanagement ++.docx, AP2_Masterplan_FiSi_1.0.md]
verweise: [wiso-projektwirtschaft, ap2-projektmanagement, ihk-softwaretests-qs, ihk-netzplan]
---

## Profi

### Lastenheft und Pflichtenheft
| | Lastenheft | Pflichtenheft |
|---|---|---|
| Autor | **Auftraggeber** (Kunde) | **Auftragnehmer** (Entwickler) |
| Frage | **WAS** und **WOFÜR** | **WIE** und **WOMIT** |
| Zeitpunkt | vor Ausschreibung/Vertrag | nach Auftragserteilung, vor Entwicklung |
| Bedeutung | Angebotsgrundlage | Vertragsbestandteil, Abnahme- und Haftungsgrundlage |

Reihenfolge immer: erst Lastenheft, dann Pflichtenheft. Merksatz: Lastenheft = Laie/Kunde = WAS; Pflichtenheft = Profi = WIE. „Das System muss Bestellungen verwalten“ → Lastenheft; „REST-API mit JSON“ → Pflichtenheft.

### Funktional vs. nicht-funktional
**Funktionale Anforderungen (FA)** beschreiben, **was** das System tut („Benutzer kann sich einloggen“). **Nicht-funktionale (NFA)** beschreiben **wie gut** unter welchen Bedingungen (Performance, Verfügbarkeit, Sicherheit, Benutzbarkeit, Wartbarkeit, Skalierbarkeit, Portabilität – ISO 25010) und müssen **messbar** sein: „Login < 1 s bei 500 Nutzern“, „99,9 % Verfügbarkeit (ca. 8,7 h Ausfall/Jahr)“. „Schnell“ ist keine brauchbare NFA. „Passwörter verschlüsselt speichern“ ist eine NFA.

### MoSCoW
**M**ust (ohne nicht abnahmefähig, inkl. gesetzlicher Pflichten wie DSGVO), **S**hould (wichtig, Workaround möglich), **C**ould (nice-to-have), **W**on’t (diesmal bewusst nicht, nicht „nie“ oder „unwichtig“). Die beiden „o“ sind Füllbuchstaben.

### User Story und Akzeptanzkriterien
Vorlage: „Als [Rolle] möchte ich [Funktion], damit [Nutzen].“ Akzeptanzkriterien sind messbare Bedingungen für „fertig“ (optional Gherkin: Given – When – Then). INVEST: Independent, Negotiable, Valuable, Estimable, Small, Testable.

### Vorgehensmodelle
| Modell | Merkmal | Einsatz |
|---|---|---|
| Wasserfall | streng sequenziell, kein Zurück | Anforderungen stabil, Doku wichtig |
| V-Modell | Wasserfall + je Phase eine Teststufe | sicherheitskritisch, Behörden |
| Spiralmodell | iterativ mit Risikoanalyse je Runde | große risikoreiche Projekte |
| Scrum | agil, Sprints, Increment, Feedback | Anforderungen unklar/veränderlich |

V-Modell: Anforderungsanalyse ↔ Abnahmetest, Systemdesign ↔ Systemtest, Moduldesign ↔ Integrationstest, Implementierung ↔ Unittest. **Klassisch** = Planungsfokus, späte Änderungen teuer, Lieferung am Ende. **Agil** = Anpassungsfokus, Lieferung je Sprint, früh Feedback, leichte Doku. Kein Modell ist pauschal besser.

### Scrum (3–5–3)
- **3 Rollen:** Product Owner (WAS, Product Backlog, Wertmaximierung), Scrum Master (Coach, entfernt Hindernisse, kein Chef), Developers (WIE, selbstorganisiert, liefern das Increment).
- **5 Events:** Sprint (max. 1 Monat, Container), Sprint Planning (max. 8 h bei 4 Wochen), Daily Scrum (15 min), Sprint Review (4 h, Produkt/Increment, mit Stakeholdern), Retrospektive (3 h, Prozess, nur Team).
- **3 Artefakte:** Product Backlog (Product Goal), Sprint Backlog (Sprint Goal), Increment (**Definition of Done**).

### Kanban
Board (To Do – In Progress – Done), **WIP-Limit** (Begrenzung gleichzeitiger Aufgaben macht Engpässe sichtbar), Flussoptimierung, kontinuierliche Verbesserung. Keine festen Sprints oder Rollen, Änderungen jederzeit – passend für Support und Wartung.

### Erhebungsmethoden
Interview (tief, aufwändig), Fragebogen (viele, kein Nachfragen), Beobachtung (echtes Verhalten, Beobachter-Effekt), Dokumentenanalyse (objektiv, evtl. veraltet), Workshop (Konsens, Moderation nötig).

### PDCA / KVP
Plan (Ziel, Maßnahme, Kennzahlen) – Do (im Pilot umsetzen) – Check (Soll-Ist-Vergleich) – Act (standardisieren oder nachbessern) – wieder von vorn. KVP = kontinuierlicher Verbesserungsprozess.

## Einfach

Du willst mit Freunden ein Baumhaus bauen.

**Lastenheft:** Du schreibst auf, was du willst: „Ich will ein Baumhaus mit Dach, das 4 Kinder trägt.“ Das ist das **WAS**. **Pflichtenheft:** Der Zimmermann antwortet: „Ich nehme diese Bretter, diese Schrauben, der Ast muss 20 cm dick sein.“ Das ist das **WIE**. Wenn beides unterschrieben ist, weiß jeder, was am Ende abgenommen wird.

**Funktional / nicht-funktional:** „Es hat eine Leiter“ (funktioniert oder nicht) ist funktional. „Die Leiter trägt 100 kg“ ist nicht-funktional – das kann man messen. „Soll stabil sein“ reicht nicht.

**MoSCoW:** Must: ein Dach, sonst regnet es rein. Should: ein Geländer. Could: eine Lichterkette. Won’t: ein Aufzug – diesmal nicht (vielleicht nächstes Jahr).

**Wasserfall:** Erst alles planen, dann bauen, dann prüfen – wie ein Wasserfall nach unten, man kommt nicht zurück. **V-Modell:** Wie Wasserfall, aber zu jedem Planungsschritt gibt es einen Prüfschritt. **Scrum:** Du baust jede Woche ein Stück, zeigst es allen, lernst und baust das nächste.

**Scrum-Team:** Product Owner = der Bauherr, der sagt, was am wichtigsten ist. Scrum Master = Trainer, der Hindernisse wegräumt. Developers = die Bauleute. Retro = Team spricht über sich: „Was können wir besser machen?“ Review = Ergebnis den Gästen zeigen.

**Kanban:** Eine Tafel mit drei Spalten. Regel: Nur 3 Zettel dürfen gleichzeitig in „Wird gemacht“ stehen. Dann fängt keiner zu viele Sachen an, und man sieht gleich, wo es klemmt.

**PDCA:** Plan – Do – Check – Act: Überlegen, ausprobieren, nachschauen, ob es klappt, und dann zur Regel machen oder neu überlegen.

## Merksatz
- Lastenheft = Laie = WAS. Pflichtenheft = Profi = WIE.
- FA = was, NFA = wie gut (mit Zahl!).
- MoSCoW: Won’t = diesmal bewusst nicht.
- Scrum = 3 – 5 – 3 (Rollen – Events – Artefakte).
- Review = Produkt, Retro = Prozess.
- V-Modell: was rechts getestet wird, wurde links definiert.
- Kanban: WIP-Limit begrenzt, was gleichzeitig läuft.

## Prüfungsfalle
- Autor und Reihenfolge von Lasten-/Pflichtenheft vertauschen.
- NFA ohne Zahl formulieren („schnell“, „sicher“).
- „4 Events“ in Scrum: Der Sprint selbst ist das fünfte.
- Scrum Master als Projektleiter beschreiben – er ist Coach.
- Review und Retrospektive vertauschen.
- Won’t als „unwichtig“ oder „nie“ erklären.
- DSGVO-Pflichten als „Could“ einstufen – gesetzliche Pflicht ist immer Must.
- Daily Scrum: Die drei Fragen sind seit dem Scrum Guide 2020 nicht mehr vorgeschrieben.
- Agil heißt nicht „ohne Planung und Dokumentation“.

## Grafik
### Von der Idee zum Vertrag
1. Auftraggeber: braucht ein neues Warenwirtschaftssystem
2. Auftraggeber -> Auftragnehmer: Lastenheft (WAS)
3. Auftragnehmer: prüft Machbarkeit und kalkuliert
4. Auftragnehmer -> Auftraggeber: Pflichtenheft (WIE) mit Angebot
5. Auftraggeber -> Auftragnehmer: Beauftragung, Pflichtenheft wird Vertragsbestandteil

### Ablauf eines Sprints
1. Product Owner -> Developers: Sprint Planning mit Sprint-Ziel
2. Developers: arbeiten täglich, Daily Scrum 15 Minuten
3. Developers -> Product Owner: Increment am Sprint-Ende
4. Product Owner: Sprint Review mit Stakeholdern, Feedback ins Backlog
5. Developers: Retrospektive verbessert den Prozess

## Übungen
- A: Ordnen Sie zu: „Die Anwendung soll Rechnungen verwalten.“ Lastenheft oder Pflichtenheft? | L: Lastenheft (WAS)
- A: Formulieren Sie eine messbare NFA für „schnelle Suche“. | L: Die Suche liefert bei 10.000 Artikeln das Ergebnis in unter 2 Sekunden
- A: Eine Bank-Software für Zahlungsverkehr mit Auditpflicht. Welches Modell? | L: V-Modell (sicherheitskritisch, Testphasen, Dokumentation)

## Lücken
- Das {Lastenheft} schreibt der Auftraggeber, das {Pflichtenheft} der Auftragnehmer.
- Scrum hat {3} Rollen, {5} Events und {3} Artefakte.
- Die Abkürzung PDCA steht für Plan, {Do}, Check, {Act}.
- Das {WIP-Limit} begrenzt in Kanban die gleichzeitig bearbeiteten Aufgaben.

## Zuordnen
### Scrum-Event zu Zweck
- Sprint Planning => Sprint-Ziel und Aufgaben festlegen
- Daily Scrum => Fortschritt prüfen, Tag planen (15 min)
- Sprint Review => Increment vorstellen, Feedback holen
- Retrospektive => Zusammenarbeit und Prozess verbessern

## Reihenfolge
### PDCA-Zyklus
1. Plan: Problem analysieren, Ziel und Kennzahl festlegen
2. Do: Maßnahme im Pilot umsetzen
3. Check: Soll-Ist-Vergleich
4. Act: Erfolg standardisieren oder nachbessern

## Freitext
- F: Nennen Sie zwei Unterschiede zwischen klassischen und agilen Vorgehensmodellen. | M: Klassisch: Anforderungen vollständig am Anfang, Lieferung am Ende, späte Änderungen teuer. Agil: Anforderungen laufend angepasst, Lieferung je Sprint, früh Feedback. | P: 4
- F: Erläutern Sie den Unterschied zwischen Sprint Review und Retrospektive. | M: Review: Produktinkrement wird Stakeholdern vorgestellt, Feedback fließt ins Backlog. Retrospektive: Das Team reflektiert Zusammenarbeit/Prozess und beschließt Verbesserungen. | P: 4
- F: Warum muss eine nicht-funktionale Anforderung messbar sein? | M: Nur mit konkretem Grenzwert kann bei der Abnahme geprüft werden, ob sie erfüllt ist. | P: 2

## Spickzettel
- Lastenheft Kunde WAS, Pflichtenheft Entwickler WIE
- FA was / NFA wie gut (Zahl)
- MoSCoW: Must Should Could Won’t
- Scrum 3-5-3, Sprint max. 1 Monat, Daily 15 min
- Review = Produkt, Retro = Prozess
- V-Modell: Test je Phase
- Kanban: WIP-Limit
- PDCA: Plan Do Check Act

## Karteikarten
- F: Wer schreibt das Lastenheft? | A: Der Auftraggeber (Kunde)
- F: Wer schreibt das Pflichtenheft? | A: Der Auftragnehmer (Entwickler) als Antwort auf das Lastenheft
- F: Was beschreibt eine nicht-funktionale Anforderung? | A: Qualitätseigenschaft (Performance, Sicherheit usw.), messbar mit Zahl
- F: Wofür steht MoSCoW? | A: Must, Should, Could, Won’t have (this time)
- F: Wie lautet die User-Story-Vorlage? | A: Als [Rolle] möchte ich [Funktion], damit [Nutzen]
- F: Was ist die Definition of Done? | A: Formale Beschreibung, wann ein Increment als fertig gilt
- F: Welche drei Rollen hat Scrum? | A: Product Owner, Scrum Master, Developers
- F: Wie lange dauert ein Daily Scrum maximal? | A: 15 Minuten
- F: Was ist das Kernmerkmal von Kanban? | A: WIP-Limit und visualisiertes Board, kontinuierlicher Fluss ohne Sprints
- F: Wofür steht das V im V-Modell? | A: Zuordnung jeder Entwicklungsphase zu einer Teststufe (Form eines V)
- F: Was bedeutet KVP? | A: Kontinuierlicher Verbesserungsprozess (Anwendung von PDCA)
- F: Nennen Sie drei Erhebungsmethoden im Requirements Engineering. | A: Interview, Fragebogen, Beobachtung, Dokumentenanalyse, Workshop

## Quiz
? Wer erstellt das Lastenheft?
* Der Auftraggeber
- Der Auftragnehmer
- Der Projektleiter des Auftragnehmers
- Die IHK
! Der Kunde beschreibt WAS und WOFÜR.

? Welche Aussage ist eine korrekte nicht-funktionale Anforderung?
* Die Anmeldung antwortet in unter 1 Sekunde bei 500 gleichzeitigen Nutzern
- Das System soll schnell sein
- Benutzer können sich anmelden
- Das System soll gut aussehen
! NFA brauchen eine Metrik.

? Wofür steht das W in MoSCoW?
* Won’t have (diesmal bewusst nicht)
- Will have
- Wait
- Work in progress
! Bewusste Abgrenzung für diese Version.

? Wie viele Events hat Scrum?
* Fünf (inklusive Sprint)
- Vier
- Drei
- Sieben
! Der Sprint ist der Container der anderen vier.

? Was ist das Ziel der Sprint-Retrospektive?
* Zusammenarbeit und Prozess verbessern
- Das Produkt dem Kunden zeigen
- Das Backlog priorisieren
- Den Sprint planen
! Review = Produkt, Retro = Prozess.

? Welches Modell ordnet jeder Entwicklungsphase eine Teststufe zu?
* V-Modell
- Wasserfallmodell
- Kanban
- Spiralmodell
! Anforderungsanalyse ↔ Abnahmetest usw.

? Was ist das Kernprinzip von Kanban?
* WIP-Limit und visualisierter Fluss
- Feste Sprints von 4 Wochen
- Drei vorgeschriebene Rollen
- Vollständige Planung vor Projektstart
! WIP-Limit macht Engpässe sichtbar.

? Welche Rolle verantwortet das Product Backlog?
* Product Owner
- Scrum Master
- Developers
- Stakeholder
! Er entscheidet WAS in welcher Reihenfolge gebaut wird.

? Wofür steht das C in PDCA?
* Check – Soll-Ist-Vergleich
- Create
- Change
- Close
! Ergebnis mit Ziel vergleichen.

? Wann ist das Wasserfallmodell besonders geeignet?
* Wenn Anforderungen stabil und klar sind
- Wenn Anforderungen sich ständig ändern
- Wenn Kunde nie erreichbar ist
- Nur bei Startups
! Späte Änderungen sind sehr teuer.

? Was gehört zur Rolle des Scrum Masters?
* Coach sein und Hindernisse beseitigen
- Aufgaben an das Team verteilen
- Das Budget verantworten
- Den Code reviewen
! Er ist kein Projektleiter.
