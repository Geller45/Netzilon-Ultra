---
id: ihk-glossar-entwicklung
bereich: AP2
block: IHK
kapitel: Glossar
titel: Glossar Softwareentwicklung, Architektur, Test, Prozesse und UX (Abkürzungen A-Z)
stufe: Einsteiger
fach: PV – AP2
pruefungen: [AP1, AP2]
quellen: [Abkürzungsverzeichnis.md (Obsidian FI Ausbildung-Themen, Version 1.0.0), Themen-Beziehungskarte.md]
verweise: [ihk-fachbegriffe-technik, ihk-fachbegriffe-betrieb-security]
---

## Profi

Dieses Glossar deckt Entwicklung, Architektur, Tests, Prozessmodellierung und Benutzerfreundlichkeit ab. Typisch für AP2: Kürzel wie CI/CD, REST, CRUD, UML, BPMN, WCAG stehen ohne Erläuterung in Aufgaben. Das Glossar enthält 84 Einträge, alphabetisch, jeweils mit Auflösung und Kurzerklärung.

| Kürzel | Bedeutung | Erklärung |
|---|---|---|
| AA | WCAG Level AA | die praktisch relevante Konformitätsstufe der Web Content Accessibility Guidelines (Gesetzlich meist gefordert, z. B. BFSG/BITV). Zwischen A (Minimum) und AAA (Maximum). |
| AAA | WCAG Level AAA | höchste Konformitätsstufe der Web Content Accessibility Guidelines; in der Praxis selten vollständig gefordert/erreichbar. |
| API | Application Programming Interface | Programmierschnittstelle Definierte Schnittstelle, über die Software-Komponenten miteinander kommunizieren, ohne die interne Implementierung zu kennen. |
| ARIA | Accessible Rich Internet Applications | W3C-Spezifikation mit HTML-Attributen (`role`, `aria-label`, …), die Screenreadern zusätzliche Semantik für dynamische/nicht-native UI-Elemente liefert. Kein Ersatz für natives HTML. |
| ARIS | Architektur integrierter Informationssysteme | Methode/Werkzeug zur Geschäftsprozessmodellierung, Ursprung der EPK-Notation. |
| ASCII | American Standard Code for Information Interchange | 7-Bit-Zeichenkodierung für die 128 Grundzeichen des lateinischen Alphabets; deckt keine Umlaute/Sonderzeichen ab (dafür UTF-8 nötig). |
| ASELSFI | Merkwort | für die 7 Grundsätze der Software-Ergonomie nach ISO 9241-110: Aufgabenangemessenheit, Selbstbeschreibungsfähigkeit, Erwartungskonformität, Lernförderlichkeit, Steuerbarkeit, Fehlertoleranz, Individualisierbarkeit. |
| BFS | Breitensuche | Breadth-First Search Graphalgorithmus, der Ebene für Ebene (mit einer Queue) durchsucht - findet in unbewerteten Graphen den kürzesten Pfad. |
| BFSG | Barrierefreiheitsstärkungsgesetz | Deutsches Gesetz (Umsetzung des European Accessibility Act), das digitale Barrierefreiheit auch für private Anbieter vorschreibt. |
| BITV | Barrierefreie-Informationstechnik-Verordnung | Konkretisiert Barrierefreiheitsanforderungen (angelehnt an WCAG) für öffentliche Stellen in Deutschland. |
| BPMN | Business Process Model and Notation | Grafische Notation zur Modellierung von Geschäftsprozessen (Standard der OMG); ausdrucksstärker als EPK, u. a. mit Gateways, Pools/Lanes. |
| C0-C3 | Testabdeckungsstufen | (White-Box-Testing): - C0 - Anweisungsüberdeckung (Statement Coverage) - C1 - Zweigüberdeckung (Branch Coverage) - C2 - Bedingungsüberdeckung (Condition Coverage) - C3 - Pfadüberdeckung (Path Coverage), jeweils stärker als die vorherige Stufe. |
| CD | Continuous Delivery / Produktion wird manuell / Continuous Deployment / vollautomatisch / Corporate Design | 1. Continuous Delivery - Pipeline testet und liefert automatisiert bis in die Staging-Umgebung; der Rollout in die Produktion wird manuell freigegeben. 2. Continuous Deployment - wie Continuous Delivery, aber auch der Produktions-Rollout läuft vollautomatisch. 3. Corporate Design - visueller Teil der Corporate Identity: Logo, Farben, Schriften, Formulare. |
| CI | Continuous Integration / Corporate Identity | 1. Continuous Integration - Entwickler integrieren häufig in den Hauptzweig; jeder Commit löst automatisierten Build + automatisierte Tests aus. 2. Corporate Identity - Gesamtbild eines Unternehmens nach außen und innen (Design, Kommunikation, Verhalten). |
| CI-CD | Continuous Integration / Continuous Delivery (bzw. Deployment) | Durchgehend automatisierte Kette von Commit über Build und Test bis zur Auslieferung. Schreibweisen: CI/CD |
| CLI | Command Line Interface | Kommandozeile Textbasierte Benutzeroberfläche zur Steuerung eines Systems über Befehle. |
| CQRS | Command Query Responsibility Segregation | Architekturmuster, das Schreiboperationen (Commands) und Leseoperationen (Queries) über getrennte Modelle abbildet - oft kombiniert mit Event Sourcing. |
| CSS | Cascading Style Sheets | Sprache zur Gestaltung von HTML-Dokumenten (Layout, Farben, Schrift). |
| CSV | Comma-Separated Values | Einfaches, textbasiertes Dateiformat für tabellarische Daten - flach, ohne Typinformation. |
| DAL | Data Access Layer | Datenzugriffsschicht Architekturschicht, die den Zugriff auf die Datenhaltung kapselt und von der Geschäftslogik trennt. |
| DAO | Data Access Object | Entwurfsmuster: eine Klasse kapselt sämtliche Zugriffe auf eine bestimmte Datenquelle/Tabelle. |
| DDD | Domain-Driven Design | Entwurfsansatz, der die Softwarestruktur eng an der Fachdomäne ausrichtet (Ubiquitous Language, Bounded Context, Aggregate). |
| DIP | Dependency Inversion Principle | Das „D" der SOLID-Prinzipien: High-Level-Module hängen nicht von Low-Level-Modulen ab, beide hängen von Abstraktionen ab. |
| DTD | Document Type Definition | Definiert die erlaubte Struktur eines XML-Dokuments (Vorläufer von XSD). |
| E2E | End-to-End | Beschreibt Tests/Prozesse, die ein System vollständig von Anfang bis Ende (aus Nutzersicht) prüfen bzw. abbilden. |
| EAA | European Accessibility Act | EU-Richtlinie (2019/882), die Mindestanforderungen an die Barrierefreiheit von Produkten/Dienstleistungen vorschreibt; national umgesetzt u. a. durch das BFSG. |
| eEPK | erweiterte Ereignisgesteuerte Prozesskette | EPK-Erweiterung um Ressourcen, Organisationseinheiten und Datenobjekte. |
| EPC | Event-driven Process Chain | englische Bezeichnung der EPK. |
| EPK | Ereignisgesteuerte Prozesskette | Grafische Notation zur Modellierung von Geschäftsprozessen: Ereignisse und Funktionen wechseln sich ab, verbunden über Kontrollfluss und Konnektoren (XOR/OR/AND). Erweiterte Form: eEPK (mit Ressourcen/Organisationseinheiten). Schreibweisen: EPC |
| ESB | Enterprise Service Bus | Integrationsarchitektur, über die verschiedene Anwendungen/Services zentral vermittelt (routen, transformieren) kommunizieren. |
| FIFO | First In, First Out | erstes rein, erstes raus Warteschlangen-Prinzip (Queue): das zuerst eingefügte Element wird zuerst wieder entnommen. Gegenteil: LIFO. |
| GoF | Gang of Four | Die vier Autoren des Standardwerks „Design Patterns" (1994); Kurzbezeichnung für die dort katalogisierten klassischen Entwurfsmuster. |
| GUI | Graphical User Interface | grafische Benutzeroberfläche Gegenstück zur textbasierten CLI. |
| HCD | Human-Centered Design | Gestaltungsansatz, der Nutzerbedürfnisse iterativ in den Mittelpunkt des Entwicklungsprozesses stellt (ISO 9241-210). |
| HTML | HyperText Markup Language | Auszeichnungssprache zur Strukturierung von Webseiteninhalten (Überschriften, Absätze, Links, …); wird durch CSS gestaltet. |
| IDE | Integrated Development Environment | integrierte Entwicklungsumgebung Werkzeug, das Editor, Compiler/Interpreter, Debugger u. a. in einer Anwendung vereint. |
| ISTQB | International Software Testing Qualifications Board | Internationale Organisation für Zertifizierungen im Software-Testing (z. B. „Certified Tester Foundation Level"). |
| JAWS | Job Access With Speech | Verbreiteter Screenreader für Windows (Hilfsmittel zur Barrierefreiheit). |
| JIT | Just-In-Time | (-Compilation) Übersetzung von Code erst zur Laufzeit (statt vollständig vorab) - Kompromiss zwischen Interpreter-Flexibilität und Compiler-Geschwindigkeit. |
| JPEG | Joint Photographic Experts Group | Verlustbehaftetes Bildkompressionsformat, benannt nach dem Gremium, das den Standard entwickelt hat. |
| JS | JavaScript | (Kurzform) |
| JSON | JavaScript Object Notation | Kompaktes, textbasiertes Datenaustauschformat mit nativen Datentypen - Standard für Web-APIs (leichter als XML). |
| JVM | Java Virtual Machine | Laufzeitumgebung, die Java-Bytecode plattformunabhängig ausführt (u. a. mit JIT-Kompilierung). |
| KI | Künstliche Intelligenz | Artificial Intelligence (AI) |
| LIFO | Last In, First Out | letztes rein, erstes raus Stapel-Prinzip (Stack): das zuletzt eingefügte Element wird zuerst wieder entnommen. Gegenteil: FIFO. |
| LSP | Liskov Substitution Principle | Das „L" der SOLID-Prinzipien: Objekte einer Unterklasse müssen sich anstelle von Objekten der Oberklasse einsetzen lassen, ohne die Korrektheit zu verletzen. |
| ML | Machine Learning | Maschinelles Lernen Teilgebiet der KI, bei dem Systeme aus Daten lernen, statt explizit programmiert zu werden. |
| MPEG | Moving Picture Experts Group | Gremium/Standard für Video-/Audiokompression. |
| MVC | Model-View-Controller | Architekturmuster: Model (Daten/Logik), View (Darstellung), Controller (verbindet beide) - fördert Trennung von Zuständigkeiten. |
| NVDA | NonVisual Desktop Access | Kostenloser, quelloffener Screenreader für Windows. |
| OCP | Open-Closed Principle | Das „O" der SOLID-Prinzipien: Software-Einheiten sollen offen für Erweiterung, aber geschlossen für Änderung sein. |
| OMG | Object Management Group | Standardisierungskonsortium, u. a. verantwortlich für UML und BPMN. |
| OOP | Objektorientierte Programmierung | Programmierparadigma auf Basis von Objekten, die Daten und Verhalten kapseln (Klassen, Vererbung, Polymorphie, Kapselung). |
| PDF | Portable Document Format | Plattformunabhängiges Dateiformat für Dokumente mit festem Layout. |
| PHP | PHP: Hypertext Preprocessor | Serverseitige Skriptsprache, verbreitet in der Webentwicklung. |
| PLZ | Postleitzahl |  |
| POUR | Perceivable, Operable, Understandable, Robust | Die vier Grundprinzipien der WCAG: wahrnehmbar, bedienbar, verständlich, robust. |
| PR | Pull Request | Anfrage, eigene Code-Änderungen in einen gemeinsamen Branch/Repository zu übernehmen (inkl. Review). |
| QA | Quality Assurance | Qualitätssicherung (QS) |
| QS | Qualitätssicherung | deutsches Pendant zu QA. |
| REST | Representational State Transfer | Architekturstil für Web-APIs: stateless, ressourcenorientiert, nutzt HTTP-Methoden (GET/POST/PUT/DELETE) und meist JSON. Leichtgewichtiger als SOAP. |
| RPC | Remote Procedure Call | Aufruf einer Funktion/Prozedur auf einem entfernten System, als wäre sie lokal. |
| SAGA | Saga-Pattern | Entwurfsmuster für verteilte Transaktionen über mehrere Microservices, realisiert als Folge lokaler Transaktionen mit kompensierenden Aktionen bei Fehlern. |
| SOA | Service-Oriented Architecture | Architekturstil, der Anwendungsfunktionalität als lose gekoppelte, wiederverwendbare Dienste bereitstellt, oft über einen ESB integriert. |
| SOAP | Simple Object Access Protocol | Streng protokollbasierter, XML-basierter Web-Service-Standard - schwergewichtiger als REST, aber mit formalerer Vertragsdefinition (WSDL). |
| SOLID | Merkwort | für fünf Entwurfsprinzipien objektorientierter Software: Single Responsibility, Open-Closed, Liskov Substitution, Interface Segregation, Dependency Inversion. |
| SRP | Single Responsibility Principle | Das „S" der SOLID-Prinzipien: eine Klasse sollte genau einen Grund haben, sich zu ändern. |
| TalkBack | Android-Screenreader | (Eigenname der Bedienungshilfe) |
| TDD | Test-Driven Development | Entwicklungsmethode nach dem Zyklus Red → Green → Refactor: erst ein fehlschlagender Test, dann die minimale Implementierung, dann Aufräumen. |
| TF | Testfall | Konkrete, dokumentierte Prüfung mit definierten Eingaben und erwartetem Ergebnis. |
| TSP | Problem des Handlungsreisenden | Traveling Salesman Problem Klassisches Optimierungsproblem: kürzeste Rundreise durch eine Menge von Orten, die jeden genau einmal besucht - Beispiel für ein NP-schweres Problem. |
| UCD | User-Centered Design | englische Bezeichnung des nutzerzentrierten Gestaltungsansatzes (siehe HCD). |
| UI | User Interface | Benutzeroberfläche |
| UML | Unified Modeling Language | Standardisierte grafische Notation (OMG) zur Modellierung von Softwaresystemen (Klassen-, Sequenz-, Aktivitätsdiagramme, …). |
| UTF | Unicode Transformation Format | Kodierungsverfahren für Unicode-Zeichen (z. B. UTF-8) - deckt im Gegensatz zu ASCII den vollen Unicode-Zeichensatz ab (Umlaute, Sonderzeichen, Emoji, …). |
| UX | User Experience | Nutzererfahrung Gesamteindruck und Erlebnisqualität bei der Nutzung eines Produkts - umfasst mehr als nur die UI (z. B. auch Emotion, Effizienz, Zugänglichkeit). |
| VCS | Version Control System | Versionskontrollsystem Software zur Nachverfolgung und Verwaltung von Änderungen an Dateien/Quellcode (z. B. Git). |
| VoiceOver | iOS/macOS-Screenreader | (Eigenname der Bedienungshilfe von Apple) |
| WCAG | Web Content Accessibility Guidelines | W3C-Standard für barrierefreie Web-Inhalte, gegliedert nach den POUR-Prinzipien und den Konformitätsstufen A/AA/AAA. |
| WSDL | Web Services Description Language | XML-basierte Beschreibungssprache für SOAP-Webservices (Schnittstellenvertrag). |
| XML | Extensible Markup Language | Textbasierte, stark strukturierte und validierbare Auszeichnungssprache - verbose, aber mit starker Typ-/Schemaprüfung (XSD/DTD). |
| XOR | Exklusives ODER | Logische Verknüpfung, die genau dann wahr ist, wenn genau eine der beiden Bedingungen wahr ist. |
| XSD | XML Schema Definition | Modernere, ausdrucksstärkere Alternative zur DTD zur Definition der zulässigen Struktur eines XML-Dokuments. |
| YAGNI | You Aren't Gonna Need It | Entwicklungsprinzip: keine Funktionalität implementieren, bevor sie tatsächlich benötigt wird - Gegenstück zu vorschneller Generalisierung. |

Mehrdeutige Kürzel (z. B. CD, CI, AG) haben je nach Fach unterschiedliche Bedeutung. In Prüfungsaufgaben entscheidet der Kontext, welche gemeint ist.

## Einfach

Eine Software zu bauen ist wie ein Haus zu bauen. **UML** ist der Bauplan, **IDE** die Werkstatt, **Git** das Tagebuch, in dem jede Änderung festgehalten wird. **CI/CD** ist das Fließband, das ständig prüft, ob alles zusammenpasst. **REST** ist die Speisekarte, mit der sich Programme gegenseitig bestellen. **TDD** heißt, erst den Test schreiben und dann den Code, wie erst die Prüfaufgabe und dann die Lösung. **WCAG** sind Regeln, damit jeder das Haus betreten kann, auch mit Rollstuhl oder ohne Augenlicht. **BPMN** und **EPK** sind Landkarten, die zeigen, wie Arbeit durch die Firma fließt.

So gehst du vor: Schau dir jeden Tag zehn Kürzel an. Sprich die Langform laut aus, überlege dir ein Beispiel aus deinem Alltag oder deinem Betrieb und decke danach die Antwort zu. Wenn du ein Kürzel dreimal richtig hattest, wandert es in den hinteren Teil des Stapels. Kürzel, die du verwechselst, schreibst du nebeneinander auf und notierst den einen Satz, der sie unterscheidet. In der Prüfung hilft dir das doppelt: Du erkennst Aufgabentexte schneller, und wenn die Langform verlangt wird, schreibst du sie sicher und ohne Rechtschreibfehler. Wer die Kürzel kennt, spart in der Klausur wertvolle Minuten für die Rechenaufgaben.

## Merksatz
- CRUD = Create, Read, Update, Delete = POST, GET, PUT, DELETE.
- CI = Integrieren und testen, CD = ausliefern (Delivery manuell, Deployment automatisch).
- SOLID, DRY, KISS: Prinzipien für wartbaren Code.
- WCAG-Stufen A, AA, AAA, praktisch gefordert ist AA.

## Prüfungsfalle
- CD kann Continuous Delivery, Continuous Deployment oder Corporate Design heißen: immer den Kontext prüfen.
- Unit-Test, Integrationstest, Systemtest und Abnahmetest verwechseln.
- EPK und BPMN gleichsetzen: unterschiedliche Notation und Symbole.

## Grafik
### So lernst du Abkürzungen
1. Lernender: liest das Kürzel
2. Lernender -> Gedächtnis: spricht die Langform laut aus
3. Gedächtnis: verknüpft sie mit Zweck und Schicht oder Kategorie
4. Lernender -> Karteikarte: prüft sich selbst nach einem Tag
5. Karteikarte -> Lernender: Wiederholung nach einer Woche festigt es

## Karteikarten
- F: Wofür steht AA? | A: WCAG Level AA – die praktisch relevante Konformitätsstufe der Web Content Accessibility Guidelines (Gesetzlich meist gefordert, z. B. BFSG/BITV). Zwischen A (Minimum) und AAA (Maximum).
- F: Wofür steht AAA? | A: WCAG Level AAA – höchste Konformitätsstufe der Web Content Accessibility Guidelines; in der Praxis selten vollständig gefordert/erreichbar.
- F: Wofür steht API? | A: Application Programming Interface – Programmierschnittstelle Definierte Schnittstelle, über die Software-Komponenten miteinander kommunizieren, ohne die interne Implementierung zu kennen.
- F: Wofür steht ARIA? | A: Accessible Rich Internet Applications – W3C-Spezifikation mit HTML-Attributen (`role`, `aria-label`, …), die Screenreadern zusätzliche Semantik für dynamische/nicht-native UI-Elemente liefert. Kein Ersatz für natives HTML.
- F: Wofür steht ARIS? | A: Architektur integrierter Informationssysteme – Methode/Werkzeug zur Geschäftsprozessmodellierung, Ursprung der EPK-Notation.
- F: Wofür steht ASCII? | A: American Standard Code for Information Interchange – 7-Bit-Zeichenkodierung für die 128 Grundzeichen des lateinischen Alphabets; deckt keine Umlaute/Sonderzeichen ab (dafür UTF-8 nötig).
- F: Wofür steht ASELSFI? | A: Merkwort – für die 7 Grundsätze der Software-Ergonomie nach ISO 9241-110: Aufgabenangemessenheit, Selbstbeschreibungsfähigkeit, Erwartungskonformität, Lernförderlichkeit, Steuerbarkeit, Fehlertoleranz, Individualisierbarkeit.
- F: Wofür steht BFS? | A: Breitensuche – Breadth-First Search Graphalgorithmus, der Ebene für Ebene (mit einer Queue) durchsucht - findet in unbewerteten Graphen den kürzesten Pfad.
- F: Wofür steht BFSG? | A: Barrierefreiheitsstärkungsgesetz – Deutsches Gesetz (Umsetzung des European Accessibility Act), das digitale Barrierefreiheit auch für private Anbieter vorschreibt.
- F: Wofür steht BITV? | A: Barrierefreie-Informationstechnik-Verordnung – Konkretisiert Barrierefreiheitsanforderungen (angelehnt an WCAG) für öffentliche Stellen in Deutschland.
- F: Wofür steht BPMN? | A: Business Process Model and Notation – Grafische Notation zur Modellierung von Geschäftsprozessen (Standard der OMG); ausdrucksstärker als EPK, u. a. mit Gateways, Pools/Lanes.
- F: Wofür steht C0-C3? | A: Testabdeckungsstufen – (White-Box-Testing): - C0 - Anweisungsüberdeckung (Statement Coverage) - C1 - Zweigüberdeckung (Branch Coverage) - C2 - Bedingungsüberdeckung (Condition Coverage) - C3 - Pfadüberdeckung (Path Coverage), jeweils stärker als die vorherige Stufe.
- F: Wofür steht CD? | A: Continuous Delivery / Produktion wird manuell / Continuous Deployment / vollautomatisch / Corporate Design – 1. Continuous Delivery - Pipeline testet und liefert automatisiert bis in die Staging-Umgebung; der Rollout in die Produktion wird manuell freigegeben. 2. Continuous Deployment - wie Continuous Delivery, aber auch der Produktions-Rollout läuft vollautomatisch. 3. Corporate Design - visueller Teil der Corporate Identity: Logo, Farben, Schriften, Formulare.
- F: Wofür steht CI? | A: Continuous Integration / Corporate Identity – 1. Continuous Integration - Entwickler integrieren häufig in den Hauptzweig; jeder Commit löst automatisierten Build + automatisierte Tests aus. 2. Corporate Identity - Gesamtbild eines Unternehmens nach außen und innen (Design, Kommunikation, Verhalten).
- F: Wofür steht CI-CD? | A: Continuous Integration / Continuous Delivery (bzw. Deployment) – Durchgehend automatisierte Kette von Commit über Build und Test bis zur Auslieferung. Schreibweisen: CI/CD
- F: Wofür steht CLI? | A: Command Line Interface – Kommandozeile Textbasierte Benutzeroberfläche zur Steuerung eines Systems über Befehle.
- F: Wofür steht CQRS? | A: Command Query Responsibility Segregation – Architekturmuster, das Schreiboperationen (Commands) und Leseoperationen (Queries) über getrennte Modelle abbildet - oft kombiniert mit Event Sourcing.
- F: Wofür steht CSS? | A: Cascading Style Sheets – Sprache zur Gestaltung von HTML-Dokumenten (Layout, Farben, Schrift).
- F: Wofür steht CSV? | A: Comma-Separated Values – Einfaches, textbasiertes Dateiformat für tabellarische Daten - flach, ohne Typinformation.
- F: Wofür steht DAL? | A: Data Access Layer – Datenzugriffsschicht Architekturschicht, die den Zugriff auf die Datenhaltung kapselt und von der Geschäftslogik trennt.
- F: Wofür steht DAO? | A: Data Access Object – Entwurfsmuster: eine Klasse kapselt sämtliche Zugriffe auf eine bestimmte Datenquelle/Tabelle.
- F: Wofür steht DDD? | A: Domain-Driven Design – Entwurfsansatz, der die Softwarestruktur eng an der Fachdomäne ausrichtet (Ubiquitous Language, Bounded Context, Aggregate).
- F: Wofür steht DIP? | A: Dependency Inversion Principle – Das „D" der SOLID-Prinzipien: High-Level-Module hängen nicht von Low-Level-Modulen ab, beide hängen von Abstraktionen ab.
- F: Wofür steht DTD? | A: Document Type Definition – Definiert die erlaubte Struktur eines XML-Dokuments (Vorläufer von XSD).
- F: Wofür steht E2E? | A: End-to-End – Beschreibt Tests/Prozesse, die ein System vollständig von Anfang bis Ende (aus Nutzersicht) prüfen bzw. abbilden.
- F: Wofür steht EAA? | A: European Accessibility Act – EU-Richtlinie (2019/882), die Mindestanforderungen an die Barrierefreiheit von Produkten/Dienstleistungen vorschreibt; national umgesetzt u. a. durch das BFSG.
- F: Wofür steht eEPK? | A: erweiterte Ereignisgesteuerte Prozesskette – EPK-Erweiterung um Ressourcen, Organisationseinheiten und Datenobjekte.
- F: Wofür steht EPC? | A: Event-driven Process Chain – englische Bezeichnung der EPK.
- F: Wofür steht EPK? | A: Ereignisgesteuerte Prozesskette – Grafische Notation zur Modellierung von Geschäftsprozessen: Ereignisse und Funktionen wechseln sich ab, verbunden über Kontrollfluss und Konnektoren (XOR/OR/AND). Erweiterte Form: eEPK (mit Ressourcen/Organisationseinheiten). Schreibweisen: EPC
- F: Wofür steht ESB? | A: Enterprise Service Bus – Integrationsarchitektur, über die verschiedene Anwendungen/Services zentral vermittelt (routen, transformieren) kommunizieren.
- F: Wofür steht FIFO? | A: First In, First Out – erstes rein, erstes raus Warteschlangen-Prinzip (Queue): das zuerst eingefügte Element wird zuerst wieder entnommen. Gegenteil: LIFO.
- F: Wofür steht GoF? | A: Gang of Four – Die vier Autoren des Standardwerks „Design Patterns" (1994); Kurzbezeichnung für die dort katalogisierten klassischen Entwurfsmuster.
- F: Wofür steht GUI? | A: Graphical User Interface – grafische Benutzeroberfläche Gegenstück zur textbasierten CLI.
- F: Wofür steht HCD? | A: Human-Centered Design – Gestaltungsansatz, der Nutzerbedürfnisse iterativ in den Mittelpunkt des Entwicklungsprozesses stellt (ISO 9241-210).
- F: Wofür steht HTML? | A: HyperText Markup Language – Auszeichnungssprache zur Strukturierung von Webseiteninhalten (Überschriften, Absätze, Links, …); wird durch CSS gestaltet.
- F: Wofür steht IDE? | A: Integrated Development Environment – integrierte Entwicklungsumgebung Werkzeug, das Editor, Compiler/Interpreter, Debugger u. a. in einer Anwendung vereint.
- F: Wofür steht ISTQB? | A: International Software Testing Qualifications Board – Internationale Organisation für Zertifizierungen im Software-Testing (z. B. „Certified Tester Foundation Level").
- F: Wofür steht JAWS? | A: Job Access With Speech – Verbreiteter Screenreader für Windows (Hilfsmittel zur Barrierefreiheit).
- F: Wofür steht JIT? | A: Just-In-Time – (-Compilation) Übersetzung von Code erst zur Laufzeit (statt vollständig vorab) - Kompromiss zwischen Interpreter-Flexibilität und Compiler-Geschwindigkeit.
- F: Wofür steht JPEG? | A: Joint Photographic Experts Group – Verlustbehaftetes Bildkompressionsformat, benannt nach dem Gremium, das den Standard entwickelt hat.
- F: Wofür steht JS? | A: JavaScript – (Kurzform)
- F: Wofür steht JSON? | A: JavaScript Object Notation – Kompaktes, textbasiertes Datenaustauschformat mit nativen Datentypen - Standard für Web-APIs (leichter als XML).
- F: Wofür steht JVM? | A: Java Virtual Machine – Laufzeitumgebung, die Java-Bytecode plattformunabhängig ausführt (u. a. mit JIT-Kompilierung).
- F: Wofür steht KI? | A: Künstliche Intelligenz – Artificial Intelligence (AI)
- F: Wofür steht LIFO? | A: Last In, First Out – letztes rein, erstes raus Stapel-Prinzip (Stack): das zuletzt eingefügte Element wird zuerst wieder entnommen. Gegenteil: FIFO.
- F: Wofür steht LSP? | A: Liskov Substitution Principle – Das „L" der SOLID-Prinzipien: Objekte einer Unterklasse müssen sich anstelle von Objekten der Oberklasse einsetzen lassen, ohne die Korrektheit zu verletzen.
- F: Wofür steht ML? | A: Machine Learning – Maschinelles Lernen Teilgebiet der KI, bei dem Systeme aus Daten lernen, statt explizit programmiert zu werden.
- F: Wofür steht MPEG? | A: Moving Picture Experts Group – Gremium/Standard für Video-/Audiokompression.
- F: Wofür steht MVC? | A: Model-View-Controller – Architekturmuster: Model (Daten/Logik), View (Darstellung), Controller (verbindet beide) - fördert Trennung von Zuständigkeiten.
- F: Wofür steht NVDA? | A: NonVisual Desktop Access – Kostenloser, quelloffener Screenreader für Windows.
- F: Wofür steht OCP? | A: Open-Closed Principle – Das „O" der SOLID-Prinzipien: Software-Einheiten sollen offen für Erweiterung, aber geschlossen für Änderung sein.
- F: Wofür steht OMG? | A: Object Management Group – Standardisierungskonsortium, u. a. verantwortlich für UML und BPMN.
- F: Wofür steht OOP? | A: Objektorientierte Programmierung – Programmierparadigma auf Basis von Objekten, die Daten und Verhalten kapseln (Klassen, Vererbung, Polymorphie, Kapselung).
- F: Wofür steht PDF? | A: Portable Document Format – Plattformunabhängiges Dateiformat für Dokumente mit festem Layout.
- F: Wofür steht PHP? | A: PHP: Hypertext Preprocessor – Serverseitige Skriptsprache, verbreitet in der Webentwicklung.
- F: Wofür steht PLZ? | A: Postleitzahl
- F: Wofür steht POUR? | A: Perceivable, Operable, Understandable, Robust – Die vier Grundprinzipien der WCAG: wahrnehmbar, bedienbar, verständlich, robust.
- F: Wofür steht PR? | A: Pull Request – Anfrage, eigene Code-Änderungen in einen gemeinsamen Branch/Repository zu übernehmen (inkl. Review).
- F: Wofür steht QA? | A: Quality Assurance – Qualitätssicherung (QS)
- F: Wofür steht QS? | A: Qualitätssicherung – deutsches Pendant zu QA.
- F: Wofür steht REST? | A: Representational State Transfer – Architekturstil für Web-APIs: stateless, ressourcenorientiert, nutzt HTTP-Methoden (GET/POST/PUT/DELETE) und meist JSON. Leichtgewichtiger als SOAP.
- F: Wofür steht RPC? | A: Remote Procedure Call – Aufruf einer Funktion/Prozedur auf einem entfernten System, als wäre sie lokal.
- F: Wofür steht SAGA? | A: Saga-Pattern – Entwurfsmuster für verteilte Transaktionen über mehrere Microservices, realisiert als Folge lokaler Transaktionen mit kompensierenden Aktionen bei Fehlern.
- F: Wofür steht SOA? | A: Service-Oriented Architecture – Architekturstil, der Anwendungsfunktionalität als lose gekoppelte, wiederverwendbare Dienste bereitstellt, oft über einen ESB integriert.
- F: Wofür steht SOAP? | A: Simple Object Access Protocol – Streng protokollbasierter, XML-basierter Web-Service-Standard - schwergewichtiger als REST, aber mit formalerer Vertragsdefinition (WSDL).
- F: Wofür steht SOLID? | A: Merkwort – für fünf Entwurfsprinzipien objektorientierter Software: Single Responsibility, Open-Closed, Liskov Substitution, Interface Segregation, Dependency Inversion.
- F: Wofür steht SRP? | A: Single Responsibility Principle – Das „S" der SOLID-Prinzipien: eine Klasse sollte genau einen Grund haben, sich zu ändern.
- F: Wofür steht TalkBack? | A: Android-Screenreader – (Eigenname der Bedienungshilfe)
- F: Wofür steht TDD? | A: Test-Driven Development – Entwicklungsmethode nach dem Zyklus Red → Green → Refactor: erst ein fehlschlagender Test, dann die minimale Implementierung, dann Aufräumen.
- F: Wofür steht TF? | A: Testfall – Konkrete, dokumentierte Prüfung mit definierten Eingaben und erwartetem Ergebnis.
- F: Wofür steht TSP? | A: Problem des Handlungsreisenden – Traveling Salesman Problem Klassisches Optimierungsproblem: kürzeste Rundreise durch eine Menge von Orten, die jeden genau einmal besucht - Beispiel für ein NP-schweres Problem.
- F: Wofür steht UCD? | A: User-Centered Design – englische Bezeichnung des nutzerzentrierten Gestaltungsansatzes (siehe HCD).
- F: Wofür steht UI? | A: User Interface – Benutzeroberfläche
- F: Wofür steht UML? | A: Unified Modeling Language – Standardisierte grafische Notation (OMG) zur Modellierung von Softwaresystemen (Klassen-, Sequenz-, Aktivitätsdiagramme, …).
- F: Wofür steht UTF? | A: Unicode Transformation Format – Kodierungsverfahren für Unicode-Zeichen (z. B. UTF-8) - deckt im Gegensatz zu ASCII den vollen Unicode-Zeichensatz ab (Umlaute, Sonderzeichen, Emoji, …).
- F: Wofür steht UX? | A: User Experience – Nutzererfahrung Gesamteindruck und Erlebnisqualität bei der Nutzung eines Produkts - umfasst mehr als nur die UI (z. B. auch Emotion, Effizienz, Zugänglichkeit).
- F: Wofür steht VCS? | A: Version Control System – Versionskontrollsystem Software zur Nachverfolgung und Verwaltung von Änderungen an Dateien/Quellcode (z. B. Git).
- F: Wofür steht VoiceOver? | A: iOS/macOS-Screenreader – (Eigenname der Bedienungshilfe von Apple)
- F: Wofür steht WCAG? | A: Web Content Accessibility Guidelines – W3C-Standard für barrierefreie Web-Inhalte, gegliedert nach den POUR-Prinzipien und den Konformitätsstufen A/AA/AAA.
- F: Wofür steht WSDL? | A: Web Services Description Language – XML-basierte Beschreibungssprache für SOAP-Webservices (Schnittstellenvertrag).
- F: Wofür steht XML? | A: Extensible Markup Language – Textbasierte, stark strukturierte und validierbare Auszeichnungssprache - verbose, aber mit starker Typ-/Schemaprüfung (XSD/DTD).
- F: Wofür steht XOR? | A: Exklusives ODER – Logische Verknüpfung, die genau dann wahr ist, wenn genau eine der beiden Bedingungen wahr ist.
- F: Wofür steht XSD? | A: XML Schema Definition – Modernere, ausdrucksstärkere Alternative zur DTD zur Definition der zulässigen Struktur eines XML-Dokuments.
- F: Wofür steht YAGNI? | A: You Aren't Gonna Need It – Entwicklungsprinzip: keine Funktionalität implementieren, bevor sie tatsächlich benötigt wird - Gegenstück zu vorschneller Generalisierung.

## Quiz

? Wofür steht DTD?
* Document Type Definition
- Domain-Driven Design
- Graphical User Interface
- WCAG Level AAA

? Wofür steht QS?
* Qualitätssicherung
- Merkwort
- Web Content Accessibility Guidelines
- European Accessibility Act

? Wofür steht PDF?
* Portable Document Format
- Integrated Development Environment
- Just-In-Time
- WCAG Level AA

? Wofür steht UI?
* User Interface
- Data Access Object
- Postleitzahl
- Problem des Handlungsreisenden

? Wofür steht JAWS?
* Job Access With Speech
- Open-Closed Principle
- Exklusives ODER
- User Experience

? Wofür steht DAL?
* Data Access Layer
- Künstliche Intelligenz
- Comma-Separated Values
- Test-Driven Development

? Wofür steht PR?
* Pull Request
- XML Schema Definition
- Merkwort
- Remote Procedure Call

? Wofür steht XML?
* Extensible Markup Language
- Unified Modeling Language
- Objektorientierte Programmierung
- Portable Document Format

? Wofür steht WSDL?
* Web Services Description Language
- Objektorientierte Programmierung
- Command Line Interface
- Service-Oriented Architecture

? Wofür steht PLZ?
* Postleitzahl
- Portable Document Format
- Breitensuche
- erweiterte Ereignisgesteuerte Prozesskette

? Wofür steht MPEG?
* Moving Picture Experts Group
- Barrierefreiheitsstärkungsgesetz
- Ereignisgesteuerte Prozesskette
- Qualitätssicherung

? Wofür steht OCP?
* Open-Closed Principle
- Dependency Inversion Principle
- Command Query Responsibility Segregation
- Liskov Substitution Principle

? Wofür steht GoF?
* Gang of Four
- Web Services Description Language
- Merkwort
- Command Line Interface

? Wofür steht DDD?
* Domain-Driven Design
- WCAG Level AA
- User Experience
- Dependency Inversion Principle

? Wofür steht BPMN?
* Business Process Model and Notation
- User-Centered Design
- Command Line Interface
- NonVisual Desktop Access

? Wofür steht E2E?
* End-to-End
- Exklusives ODER
- Accessible Rich Internet Applications
- Barrierefreie-Informationstechnik-Verordnung
