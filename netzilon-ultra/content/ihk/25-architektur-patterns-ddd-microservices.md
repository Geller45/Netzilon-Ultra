---
id: ihk-architektur-patterns
bereich: Prüfung
block: IHK
kapitel: Programmieren und Algorithmen
titel: Architektur und Entwurfsmuster – Kopplung, Patterns, MVC, 3-Tier, Microservices, DDD
stufe: Fortgeschritten
fach: GDP / OOP
pruefungen: [AP2]
quellen: [Architektur-Design-Patterns.md (Obsidian v1+v2), Design von APIs & Microservices mit Domain Driven Design.md, Shared Data in verteilten Architekturen.md, ddd-cheatsheet.md, api-model-ddd-dokumentation.html, shared-data-dokumentation.html]
verweise: [ihk-oop-grundlagen, ihk-softwaretests-qs, ap2-virtualisierung-cloud]
---

## Profi

### Kopplung und Kohäsion
**Kopplung** (coupling) ist die Abhängigkeit **zwischen** Modulen: niedrig/lose ist gut. **Kohäsion** (cohesion) ist der Zusammenhalt **innerhalb** eines Moduls: hoch ist gut. Beide Male „hoch“, aber gegensätzlich bewertet – klassische Falle. Lose Kopplung erreicht man mit Interfaces und Dependency Injection, hohe Kohäsion mit dem Single-Responsibility-Prinzip. Merksatz: „Lose koppeln, stark zusammenhalten.“

### Entwurfsmuster (design patterns)
Für die schriftliche Prüfung genügen je Muster: Zweck, Rollen, Alltagsbeispiel, ein Vor- und ein Nachteil.

| Muster | Zweck | Beispiel | Vorteil / Nachteil |
|---|---|---|---|
| **Singleton** | genau eine Instanz, globaler Zugriff | Logger, Druck-Spooler | kontrollierter Zugriff / globaler Zustand, schlecht testbar, nicht threadsicher |
| **Factory** | Objekterzeugung kapseln | VehicleFactory.create("auto") | entkoppelt Aufrufer / Fabrik wächst bei vielen Typen |
| **Observer** | 1:n-Benachrichtigung bei Zustandsänderung | Kanal-Abo | lose Kopplung / Reihenfolge nicht garantiert, Kaskaden |
| **Strategy** | austauschbare Algorithmen hinter einem Interface | Versandkosten-Berechnung | Algorithmus zur Laufzeit wählbar / mehr Klassen |
| **Decorator** | Objekt zur Laufzeit erweitern, ohne Vererbung | Kaffee + Milch + Sahne | keine Klassenexplosion / viele kleine Wrapper |

**Singleton** erkennt man an drei Merkmalen: privater Konstruktor, statische Instanzvariable, statische Zugriffsmethode `getInstance()`. Kritikpunkte: globaler Zustand, Testbarkeit, Threads, Verletzung von SRP. Merksatz: „Observer reagiert, Strategy wählt.“

### MVC und Schichtenarchitektur
**MVC** (Model-View-Controller): Model hält Daten und Geschäftslogik, View stellt dar, Controller nimmt Eingaben und steuert. Die View ändert das Model **nicht** direkt. **3-Schichten** (3-tier): Präsentation – Logik – Datenhaltung; nur **benachbarte** Schichten sprechen miteinander. Layer = logische Gliederung, Tier = physische Verteilung. MVC lebt innerhalb der oberen Schichten; „3-Tier ist der Grundriss, MVC die Zimmereinteilung“.

### Monolith vs. Microservices
| | Monolith | Microservices |
|---|---|---|
| Deployment | eine Einheit | viele unabhängige Dienste |
| Kommunikation | Methodenaufruf | Netzwerk (REST, Messaging), Latenz |
| Skalierung | nur als Ganzes | je Service |
| Fehlerisolation | Fehler gefährdet das Ganze | isoliert |
| Technologie | eine für alles | je Service frei |
| Komplexität | einfach zu starten | von Anfang an hoch |

Microservices sind klein, lose gekoppelt, unabhängig entwickel-, test-, deploy- und skalierbar; ein Service ist **use-case-orientiert**, nicht entity-orientiert. Jeder Service hat seine **eigene Datenbank** (database per service).

### Domain-Driven Design (DDD)
Kunde und Entwickler sprechen dieselbe **Fachsprache** (ubiquitous language). Das Domänenmodell ist fachlich korrekt. **Event Storming** („merge the people, split the software“) sammelt Domänen-Ereignisse auf einer Papierwand. Ein **Bounded Context** (abgegrenzter Kontext) darf eigene Codebasis, eigenes Team und eigene Datenbank haben. Bausteine: **Entity** (eigene unveränderliche Identität, Lebenszyklus), **Value Object** (beschreibt Merkmale, unveränderlich), **Service**, **Factory**, **Repository** (Zugriff auf Entities), **Aggregate** (konsistente Gruppe, z. B. Warenkorb mit Positionen). **Event** = Information über eine fachliche Änderung (Vergangenheit), **Command** = Auftrag etwas zu tun.

### Daten über Servicegrenzen
- **API Composition:** ein Service ruft die Daten-Eigentümer ab und fasst zusammen – einfach, aber enge Kopplung.
- **Datenkopie per Events / CQRS:** lokaler Snapshot (Materialized View) wird durch Events aktuell gehalten; Folge: **Eventual Consistency** (verzögerte Konsistenz).
- **Events** als Infoträger (nur Hinweis) oder Datenträger (mit Nutzdaten).
- **Konsistenz ohne verteilte Transaktion:** Optimist, Fortune-Teller, Safeguard; Königsweg: **SAGA** (Folge lokaler Transaktionen mit Kompensation bei Fehler).
- **Integrität:** gelöschtes Objekt → Queue-Abgleich oder 404 als Antwort.

## Einfach

Stell dir vor, du baust mit Lego.

**Kopplung** ist, wie fest zwei Lego-Teile zusammengeklebt sind. Klebst du alles fest, kannst du nichts mehr austauschen – das ist schlecht. Du willst stecken statt kleben (lose Kopplung). **Kohäsion** ist, ob in einer Kiste nur zusammengehörende Steine liegen (Feuerwehr-Kiste: nur Feuerwehr). Eine Kiste „Sonstiges“ mit allem Möglichen ist schlecht.

**Singleton:** In der Klasse gibt es nur *einen* Klassensprecher. Alle fragen immer denselben. Praktisch, aber wenn der krank ist, geht nichts.
**Factory:** Du sagst dem Bäcker „ein Brötchen“, und er entscheidet, wie er es backt. Du musst den Ofen nicht kennen.
**Observer:** Du abonnierst einen Kanal. Gibt es ein neues Video, bekommst du automatisch Bescheid, ohne ständig nachzuschauen.
**Strategy:** Zur Schule kannst du laufen, Rad fahren oder Bus nehmen – du tauschst das Verfahren aus, das Ziel bleibt.
**Decorator:** Ein Eis: Kugel, dazu Streusel, dazu Soße. Du packst Schichten drauf, ohne die Kugel zu ändern.

**MVC:** Im Restaurant ist der Koch das *Model* (die eigentliche Arbeit), der Teller und die Speisekarte die *View* (was du siehst), der Kellner der *Controller* (nimmt Bestellungen auf und gibt sie weiter). Der Gast geht nicht selbst in die Küche.

**Monolith** ist ein riesiges Warenhaus: alles unter einem Dach, einfach zu bauen, aber brennt es, brennt alles. **Microservices** sind viele kleine Läden in der Straße: jeder kann umbauen oder erweitern, ohne die anderen zu stören, aber man muss laufen (Netzwerk) und sich absprechen.

## Merksatz
- Kopplung niedrig, Kohäsion hoch.
- Observer reagiert, Strategy wählt.
- Singleton: privater Konstruktor, statische Variable, getInstance().
- 3-Tier = Grundriss, MVC = Zimmer.
- Eine Datenbank pro Microservice.
- Event = ist passiert, Command = soll passieren.
- Eventual Consistency heißt: irgendwann gleich, nicht sofort.

## Prüfungsfalle
- Kopplung und Kohäsion beide „hoch ist gut“ gleichsetzen.
- Singleton nur loben: Bei „Nachteil?“ immer globaler Zustand und Testbarkeit nennen.
- MVC: View darf das Model nicht direkt ändern.
- 3-Tier und MVC sind keine Alternativen, sondern ergänzen sich.
- Layer (logisch) mit Tier (physisch) verwechseln.
- Microservices sind nicht automatisch besser: Latenz, Komplexität, Datenkonsistenz.
- Event (Vergangenheit) und Command (Auftrag) verwechseln.
- Decorator nicht mit Vererbung gleichsetzen.

## Grafik
### MVC-Datenfluss
1. Benutzer -> Controller: Klick auf „Bestellen“
2. Controller -> Model: Bestellung speichern
3. Model -> Controller: Ergebnis
4. Controller -> View: Ansicht aktualisieren
5. View -> Benutzer: Bestätigung anzeigen

### Observer
1. Kanal: neues Video veröffentlicht
2. Kanal -> E-Mail-Abonnent: update(Video)
3. Kanal -> Handy-Abonnent: update(Video)
4. Handy-Abonnent: Push-Meldung erscheint

### Event-getriebene Datenkopie
1. Bestellservice -> Eventbus: Event „Bestellung angelegt“
2. Eventbus -> Lagerservice: Event zustellen
3. Lagerservice: Bestand wird um 1 reduziert
4. Lagerservice -> Eventbus: Event „Bestand aktualisiert“

## Übungen
- A: Eine Klasse „UtilityManager“ sendet Mails, rechnet MwSt und lädt Konfiguration. Welches Problem? | L: Niedrige Kohäsion; aufteilen nach SRP (EmailService, TaxService, ConfigLoader)
- A: Nennen Sie zwei Nachteile des Singleton-Musters. | L: Globaler Zustand/versteckte Kopplung; erschwerte Unit-Tests (nicht mockbar); ggf. nicht threadsicher
- A: Welches Muster passt für „Zahlart wählbar: PayPal, Karte, Rechnung“? | L: Strategy (austauschbare Algorithmen hinter einem Interface)

## Lücken
- Singleton hat einen {privaten} Konstruktor, eine statische Variable und die Methode getInstance().
- Bei MVC darf die {View} das Model nicht direkt ändern.
- Jeder Microservice besitzt idealerweise seine {eigene Datenbank}.
- Verzögerte Konsistenz zwischen Services heißt {Eventual Consistency}.

## Zuordnen
### Muster zu Zweck
- Singleton => genau eine Instanz
- Factory => Objekterzeugung kapseln
- Observer => Abonnenten benachrichtigen
- Strategy => Algorithmus austauschbar machen
- Decorator => Funktionen dynamisch hinzufügen

## Reihenfolge
### Saga-Ablauf (Bestellung)
1. Bestellservice legt Bestellung an
2. Lagerservice reserviert Ware
3. Zahlungsservice bucht ab
4. Bei Fehler: Kompensation (Reservierung zurücknehmen, Bestellung stornieren)

## Freitext
- F: Erläutern Sie den Unterschied zwischen Kopplung und Kohäsion. | M: Kopplung = Abhängigkeit zwischen Modulen (soll niedrig sein); Kohäsion = Zusammenhalt innerhalb eines Moduls (soll hoch sein). | P: 3
- F: Nennen Sie zwei Vorteile und zwei Nachteile von Microservices. | M: Vorteile: unabhängige Skalierung und Deployment, Fehlerisolation, Technologiefreiheit. Nachteile: Netzwerklatenz, hohe Komplexität, schwierige Datenkonsistenz. | P: 4
- F: Was ist der Unterschied zwischen Layer und Tier? | M: Layer = logische Schicht im Code, Tier = physische Verteilung auf Systeme/Server. | P: 2

## Spickzettel
- Kopplung ↓, Kohäsion ↑
- Singleton / Factory / Observer / Strategy / Decorator
- MVC: Model Daten, View Anzeige, Controller Steuerung
- 3-Tier: nur Nachbarschichten
- Microservice: eigene DB, unabhängig deploybar
- DDD: Entity (Identität), Value Object (unveränderlich), Aggregate
- Event = passiert, Command = Auftrag
- SAGA = Kompensation statt verteilter Transaktion

## Karteikarten
- F: Was bedeutet lose Kopplung? | A: Module kennen nur Schnittstellen voneinander, nicht die konkrete Implementierung
- F: Was ist hohe Kohäsion? | A: Eine Klasse/ein Modul hat eine klare, zusammengehörige Verantwortung
- F: Welche drei Merkmale hat ein Singleton? | A: Privater Konstruktor, statische Instanzvariable, statische Zugriffsmethode
- F: Wofür steht MVC? | A: Model-View-Controller: Trennung von Daten, Darstellung und Steuerung
- F: Welche Regel gilt in der 3-Schichten-Architektur? | A: Nur benachbarte Schichten kommunizieren
- F: Was ist ein Bounded Context? | A: Abgegrenzter fachlicher Kontext mit eigenem Modell, Team, Code und ggf. eigener Datenbank
- F: Was ist ein Value Object? | A: Unveränderliches Objekt ohne eigene Identität, beschreibt Merkmale (z. B. Adresse)
- F: Was ist ein Aggregate? | A: Gruppe von Entities/Value Objects mit gemeinsamer Konsistenzgrenze, z. B. Warenkorb mit Positionen
- F: Was bedeutet Eventual Consistency? | A: Daten in verschiedenen Services werden mit Verzögerung konsistent
- F: Was macht das Strategy-Muster? | A: Kapselt austauschbare Algorithmen hinter einer gemeinsamen Schnittstelle
- F: Was ist ein Command im DDD? | A: Ein Auftrag, etwas auszuführen (im Gegensatz zum Event als Meldung über Geschehenes)
- F: Was ist ein Nachteil von Microservices gegenüber dem Monolithen? | A: Höhere Komplexität, Netzwerklatenz, schwierigere Datenkonsistenz

## Quiz
? Welche Aussage zu Kopplung und Kohäsion stimmt?
* Kopplung soll niedrig, Kohäsion hoch sein
- Beides soll niedrig sein
- Beides soll hoch sein
- Kopplung hoch, Kohäsion niedrig
! Lose koppeln, stark zusammenhalten.

? Welche Merkmale hat ein Singleton?
* Privater Konstruktor, statische Instanz, statische Zugriffsmethode
- Öffentlicher Konstruktor und viele Instanzen
- Nur ein Interface
- Mehrfachvererbung
! Dadurch kann nur eine Instanz entstehen.

? Was ist ein klassischer Singleton-Nachteil?
* Globaler Zustand und schlechte Testbarkeit
- Zu viele Instanzen
- Langsame Compilezeit
- Fehlende Vererbung
! Mocking wird erschwert, Abhängigkeiten sind versteckt.

? Welches Muster passt zu „Abonnenten werden bei Änderung automatisch informiert“?
* Observer
- Factory
- Decorator
- Singleton
! 1:n-Benachrichtigung.

? Wer darf bei MVC das Model direkt ändern?
* Der Controller
- Die View
- Der Browser
- Der Datenbankserver
! View stellt nur dar.

? Was unterscheidet Layer und Tier?
* Layer logisch im Code, Tier physisch verteilt
- Beides ist identisch
- Layer ist Hardware, Tier ist Software
- Tier gibt es nur in Cloud
! Alle Layer können auch auf einem Server laufen.

? Was ist ein Vorteil von Microservices?
* Unabhängige Skalierung einzelner Dienste
- Einfachere Datenkonsistenz
- Keine Netzwerkkommunikation
- Geringere Komplexität
! Der Preis sind Latenz und Komplexität.

? Welche Konsistenz erreicht man bei ereignisgesteuerten Datenkopien?
* Eventual Consistency
- Sofortige strikte Konsistenz
- Keine Konsistenz
- Konsistenz nur beim Backup
! Es gibt eine Verzögerung bei der Synchronisation.

? Was ist eine Entity in DDD?
* Objekt mit eigener, unveränderlicher Identität und Lebenszyklus
- Unveränderliches Wertobjekt ohne Identität
- Ein Datenbankserver
- Eine Netzwerkschnittstelle
! Gegenteil: Value Object.

? Was bedeutet SAGA im Microservice-Umfeld?
* Folge lokaler Transaktionen mit Kompensation bei Fehlern
- Eine zentrale verteilte ACID-Transaktion
- Ein Verschlüsselungsverfahren
- Ein Testframework
! Bei Fehler werden vorherige Schritte rückgängig gemacht.
