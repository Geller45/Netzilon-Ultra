---
id: ihk-oop-grundlagen
bereich: Prüfung
block: IHK
kapitel: Programmieren und Algorithmen
titel: Objektorientierung (OOP) – Klassen, Vererbung, Polymorphie, Interfaces, SOLID
stufe: Fortgeschritten
fach: GDP / OOP
pruefungen: [AP2]
quellen: [OOP-Objektorientierung.md (Obsidian v1+v2), UML & Dokumentation.docx, IHK_pruefungskatalog.json]
verweise: [ihk-lz-programmierung-uml, ihk-algorithmen-suchen-sortieren, ihk-architektur-patterns, bonus-csharp-oop]
---

## Profi

**Objektorientierte Programmierung (OOP)** kapselt Daten (Attribute) und Verhalten (Methoden) in Objekten. Eine **Klasse** (class) ist der Bauplan, ein **Objekt** (object) die konkrete Instanz mit eigenem Zustand. Die IHK verlangt sprachneutralen Pseudocode: Struktur und Logik zählen, Semikolons oder `@Override` nicht.

### Die vier Säulen
1. **Kapselung** (encapsulation): Attribute `private`, Zugriff nur über Methoden mit **Validierung** (z. B. Guthaben nie negativ). Getter/Setter sind nur das Mittel; ein Setter, der alles durchreicht, verfehlt den Zweck. Kapselung ist Zugriffskontrolle im Code, keine Verschlüsselung.
2. **Vererbung** (inheritance): Die Unterklasse übernimmt Attribute und Methoden der Oberklasse („ist-ein“, IS-A). „Auto ist ein Fahrzeug“ → Vererbung; „Auto hat einen Motor“ → **Komposition/Aggregation** (HAS-A). Im Konstruktor der Unterklasse muss `SUPER(...)` den Elternkonstruktor aufrufen.
3. **Polymorphie** (polymorphism): Gleicher Aufruf, je nach Objekt unterschiedliches Verhalten. Entschieden wird zur **Laufzeit** (dynamische Bindung): `Animal t ← NEW Dog(); t.makeSound()` ruft die Dog-Methode auf. Der statische Typ (links) bestimmt, welche Methoden aufrufbar sind, der dynamische Typ (rechts bei NEW) welche Implementierung läuft.
4. **Abstraktion** (abstraction): Wesentliches zeigen, Details verbergen – realisiert durch abstrakte Klassen und Interfaces.

### Interface vs. abstrakte Klasse
| Merkmal | Abstrakte Klasse | Interface |
|---|---|---|
| Instanziierbar | nein | nein |
| Zustand (Attribute) | ja | nein (nur Konstanten) |
| Implementierte Methoden | teilweise | nur Signaturen (default-Methoden seit Java 8/C# 8) |
| Mehrfach nutzbar | nur eine Elternklasse | beliebig viele Interfaces |
| Beziehung | ist-ein, gemeinsamer Code | kann-etwas (Rolle/Fähigkeit) |
| UML | kursiver Name | `<<interface>>` |

### Sichtbarkeit
`+` public (überall), `-` private (nur eigene Klasse), `#` protected (eigene Klasse + Unterklassen), `~` package (gleiches Paket). Faustregel: Attribute private, Schnittstellenmethoden public.

### Überladen vs. Überschreiben
**Überladen** (overloading): gleicher Name, **andere Parameterliste**, gleiche Klasse, Compilezeit. **Überschreiben** (overriding): Unterklasse ersetzt Elternmethode mit **gleicher Signatur**, Laufzeit → das ist die „Polymorphie“ der IHK. Der Rückgabetyp gehört nicht zur Signatur.

### Fehlerbehandlung
`TRY` (riskanter Code) – `CATCH Fehlertyp AS e` (Behandlung) – `FINALLY` (läuft immer, z. B. Datei schließen). Speziellere Exceptions zuerst fangen.

### SOLID
- **S**ingle Responsibility: eine Klasse, ein Grund zur Änderung.
- **O**pen/Closed: offen für Erweiterung, geschlossen für Änderung.
- **L**iskov Substitution: Unterklassen müssen Oberklassen ersetzen können.
- **I**nterface Segregation: lieber mehrere kleine Interfaces.
- **D**ependency Inversion: von Abstraktionen statt Konkretem abhängen.

## Einfach

Eine **Klasse** ist wie ein Backrezept oder eine Ausstechform. Das **Objekt** ist der einzelne Keks. Alle Kekse haben dieselbe Form, aber der eine hat Schokolade, der andere Zimt (verschiedene Werte in den Attributen).

**Kapselung:** Dein Handy hat ein Gehäuse. Du drückst Knöpfe (Methoden), aber du greifst nicht direkt auf die Platine. Wenn du den Akku-Wert auf 500 Prozent setzen könntest, ginge es kaputt – darum prüft das Handy deine Eingabe.

**Vererbung:** Ein Hund ist ein Tier. Er kann alles, was Tiere können (atmen, fressen), und noch mehr (bellen). Aber: Ein Auto *hat* Räder, es *ist* kein Rad. „Hat“ ist darum keine Vererbung.

**Polymorphie:** Du rufst „Mach ein Geräusch!“ zu einer Gruppe: Der Hund bellt, die Katze miaut, die Kuh muht. Alle bekommen dieselbe Aufforderung, jeder macht es auf seine Art.

**Interface:** Ein Steckdosen-Standard. Jedes Gerät mit passendem Stecker darf rein, was es innen macht, ist egal. **Abstrakte Klasse:** Ein halbfertiger Bausatz – Teile sind schon da, manche musst du selbst bauen.

**Sichtbarkeit:** `private` ist dein Tagebuch (nur du), `protected` ist die Familie, `public` ist ein Schaufenster.

**Überladen:** Der Kellner heißt „bestellen“, aber du kannst ein Getränk oder ein Menü bestellen – gleicher Name, andere Angaben. **Überschreiben:** Der Sohn macht das Familienrezept auf seine Art.

## Merksatz
- IS-A = Vererbung, HAS-A = Komposition.
- Überladen = gleicher Name, andere Parameter. Überschreiben = gleiche Signatur, neue Wirkung.
- Statischer Typ: was ich *darf*, dynamischer Typ: was *läuft*.
- Eine Elternklasse, viele Interfaces.
- Attribute privat, Methoden öffentlich.
- SOLID: S O L I D = Ein Grund, Offen, Liskov, Interfaces klein, Dependency umkehren.

## Prüfungsfalle
- „Polymorphie“ nicht mit Überladen verwechseln – die IHK meint Überschreiben.
- SUPER(...) im Unterklassen-Konstruktor vergessen.
- Kapselung mit Verschlüsselung/IT-Sicherheit verwechseln.
- Getter/Setter ohne Validierung sind keine echte Kapselung.
- Rückgabetyp allein reicht nicht für Überladen.
- „Motor erbt von Auto“ ist falsch (HAS-A).
- Interface kann keinen Objektzustand (Attribute) halten.
- In UML: Vererbung = Pfeil mit leerem Dreieck, Interface-Implementierung = gestrichelt.

## Grafik
### Polymorpher Aufruf
1. Programm: Liste mit Triangle, Rectangle, Circle (Typ Shape)
2. Programm -> Triangle: area() aufrufen
3. Triangle -> Programm: 0,5 mal Basis mal Höhe
4. Programm -> Rectangle: area() aufrufen
5. Rectangle -> Programm: Breite mal Höhe

### Objekt erzeugen
1. Programm -> Klasse: NEW Car("BMW", 2024, 4)
2. Klasse -> Oberklasse: SUPER(brand, year) setzt geerbte Attribute
3. Klasse: doors wird gesetzt, Objekt ist fertig
4. Klasse -> Programm: Referenz auf das neue Objekt

## Übungen
- A: Auto, Lkw und Motorrad teilen sich brand und drive(). Welches Konstrukt? | L: Abstrakte Klasse Vehicle (gemeinsamer Code und Zustand, ist-ein)
- A: Was gibt aus: Animal t ← NEW Dog(); t.makeSound() (Dog überschreibt makeSound mit „Wuff“)? | L: „Wuff!“ – dynamische Bindung nutzt den dynamischen Typ Dog
- A: Eine Klasse soll drucken und speichern können. Wie lösen Sie das? | L: Zwei Interfaces (Printable, Storable), die die Klasse beide implementiert

## Lücken
- Eine {Klasse} ist der Bauplan, ein {Objekt} die konkrete Instanz.
- Beim {Überschreiben} hat die Unterklasse die gleiche Signatur wie die Oberklasse.
- Das Symbol # im UML-Klassendiagramm steht für {protected}.
- Eine Klasse kann nur {eine} Oberklasse, aber beliebig viele {Interfaces} haben.

## Zuordnen
### Begriff zu Bedeutung
- Kapselung => Attribute privat, Zugriff über validierende Methoden
- Vererbung => ist-ein-Beziehung zwischen Klassen
- Polymorphie => Laufzeit-Auswahl der richtigen überschriebenen Methode
- Interface => Vertrag aus Methodensignaturen ohne Zustand

## Reihenfolge
### Fehlerbehandlung
1. TRY-Block mit riskantem Code ausführen
2. Bei Fehler: Sprung zum passenden CATCH
3. Fehler behandeln (Meldung, Log, Ersatzwert)
4. FINALLY ausführen (Ressourcen freigeben)

## Freitext
- F: Erläutern Sie den Unterschied zwischen Überladen und Überschreiben. | M: Überladen: gleiche Klasse, gleicher Methodenname, andere Parameterliste, Entscheidung zur Compilezeit. Überschreiben: Unterklasse ersetzt Oberklassenmethode mit gleicher Signatur, Entscheidung zur Laufzeit (Polymorphie). | P: 4
- F: Nennen Sie zwei Vorteile der Kapselung. | M: Schutz der Invarianten (z. B. Guthaben nie negativ); Implementierung kann geändert werden, ohne die Schnittstelle zu brechen; weniger Fehlerquellen. | P: 2
- F: Wann nehmen Sie ein Interface statt einer abstrakten Klasse? | M: Wenn Rollen/Fähigkeiten unabhängig von der Hierarchie definiert werden oder mehrere Rollen kombiniert werden sollen (nur eine Elternklasse möglich). | P: 2

## Spickzettel
- Säulen: Kapselung, Vererbung, Polymorphie, Abstraktion
- IS-A Vererbung / HAS-A Komposition
- + public, - private, # protected, ~ package
- Überladen: Parameter anders; Überschreiben: Signatur gleich
- Abstrakt: Code + Zustand; Interface: Vertrag, mehrfach
- TRY / CATCH / FINALLY
- SOLID = SRP, OCP, LSP, ISP, DIP
- SUPER() im Konstruktor nicht vergessen

## Karteikarten
- F: Was ist der Unterschied zwischen Klasse und Objekt? | A: Klasse = Bauplan, Objekt = konkrete Instanz mit eigenem Zustand
- F: Nennen Sie die vier Säulen der OOP. | A: Kapselung, Vererbung, Polymorphie, Abstraktion
- F: Was bedeutet das Symbol # im UML-Klassendiagramm? | A: protected (eigene Klasse und Unterklassen)
- F: Was ist Überschreiben? | A: Unterklasse ersetzt eine Oberklassenmethode mit gleicher Signatur (Laufzeit-Polymorphie)
- F: Was ist Überladen? | A: Gleicher Methodenname, andere Parameterliste (Compilezeit)
- F: Wie viele Oberklassen und Interfaces darf eine Klasse in Java/C# haben? | A: Genau eine Oberklasse, beliebig viele Interfaces
- F: Worin unterscheidet sich eine abstrakte Klasse von einem Interface? | A: Abstrakte Klasse darf Zustand und Teilimplementierung haben, Interface nur Methodenvertrag
- F: Wofür steht SOLID? | A: Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion
- F: Wofür dient FINALLY? | A: Block, der immer läuft, z. B. zum Schließen von Dateien oder Verbindungen
- F: Was bedeutet IS-A / HAS-A? | A: IS-A: Vererbung; HAS-A: Komposition/Aggregation
- F: Welche Aufgabe hat SUPER()? | A: Ruft den Konstruktor der Oberklasse auf
- F: Welcher UML-Pfeil steht für Vererbung? | A: Durchgezogene Linie mit leerem Dreieck zur Oberklasse

## Quiz
? Was bedeutet Kapselung?
* Attribute verbergen und nur über kontrollierte Methoden zugänglich machen
- Daten verschlüsseln
- Klassen in Pakete packen
- Methoden mehrfach definieren
! Zugriffskontrolle im Code, nicht Kryptografie.

? Welche Beziehung beschreibt „Auto hat einen Motor“?
* Komposition/Aggregation (HAS-A)
- Vererbung
- Überladen
- Polymorphie
! Vererbung nur bei IS-A.

? Was meint die IHK mit „Polymorphie“?
* Laufzeit-Auswahl der überschriebenen Methode
- Mehrere Methoden gleichen Namens mit anderen Parametern
- Mehrere Klassen in einer Datei
- Verschlüsselung von Objekten
! Überladen ist Compilezeit und nicht gemeint.

? Was gibt aus: Animal t ← NEW Dog(); t.makeSound() (Dog überschreibt)?
* Die Dog-Ausgabe
- Die Animal-Ausgabe
- Einen Compilerfehler
- Nichts
! Dynamische Bindung nach dem tatsächlichen Typ.

? Wie viele Interfaces darf eine Klasse in Java/C# implementieren?
* Beliebig viele
- Genau eines
- Höchstens zwei
- Keines
! Deshalb ersetzt man fehlende Mehrfachvererbung durch Interfaces.

? Was bedeutet + im UML-Klassendiagramm?
* public
- private
- protected
- package
! - ist private, # protected, ~ package.

? Was unterscheidet Überladen von Überschreiben?
* Überladen: andere Parameterliste; Überschreiben: gleiche Signatur in Unterklasse
- Überladen ist Laufzeit, Überschreiben ist Compilezeit
- Kein Unterschied
- Überladen nur in Interfaces
! Rückgabetyp zählt nicht zur Signatur.

? Wofür steht das S in SOLID?
* Single Responsibility
- Simple Syntax
- Static Typing
- Secure Storage
! Eine Klasse, ein Änderungsgrund.

? Wann verwendet man einen FINALLY-Block?
* Code, der unabhängig vom Fehler immer ausgeführt werden soll
- Nur wenn kein Fehler auftrat
- Um Exceptions zu erzeugen
- Als Ersatz für CATCH
! Typisch: Ressourcen schließen.

? Was darf ein Interface (klassisch) nicht enthalten?
* Instanz-Attribute (Zustand)
- Methodensignaturen
- Konstanten
- Mehrfachimplementierung
! Zustand gehört in Klassen/abstrakte Klassen.
