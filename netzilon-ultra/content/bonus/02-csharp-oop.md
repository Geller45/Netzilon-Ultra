---
id: bonus-csharp-oop
bereich: Bonus
block: Bonus
kapitel: C# Bonuskapitel
titel: C# objektorientiert – Klassen, Vererbung, Interfaces, Records, async
stufe: Fortgeschritten
fach: GDP / OOP
pruefungen: [Schule]
quellen: [Essential_C__12_0__8th_Ed_by_Mark_Michaelis.pdf, C_12_Pocket_Reference_-_Instant_Help_for_C_12_Programmers.pdf]
verweise: [bonus-csharp-kompakt, ihk-oop-grundlagen, ihk-lz-programmierung-uml, ihk-architektur-patterns]
---

## Profi

### Klasse, Objekt, Kapselung
```csharp
public class Konto
{
    private decimal saldo;                          // Feld, gekapselt
    public string Inhaber { get; }                  // Eigenschaft nur lesbar
    public decimal Saldo => saldo;                  // berechnete Eigenschaft

    public Konto(string inhaber, decimal start = 0) // Konstruktor
    {
        Inhaber = inhaber;
        saldo = start;
    }

    public void Einzahlen(decimal betrag)
    {
        if (betrag <= 0) throw new ArgumentException("Betrag muss positiv sein");
        saldo += betrag;
    }
}
var k = new Konto("Anna", 100m);
k.Einzahlen(50m);
```
**Zugriffsmodifizierer:** `public` (überall), `private` (nur in der Klasse, Standard für Member), `protected` (Klasse und Erben), `internal` (gleiche Assembly). **Properties** (`get`/`set`, `init`) kapseln Felder; Validierung gehört in den Setter oder die Methode. `static` gehört zur Klasse, nicht zum Objekt. Seit C# 12 gibt es **Primärkonstruktoren**: `public class Person(string name) { public string Name => name; }`.

### Vererbung und Polymorphie
```csharp
public abstract class Tier
{
    public string Name { get; init; } = "";
    public abstract string Laut();                  // muss überschrieben werden
    public virtual string Beschreibe() => $"{Name} sagt {Laut()}";
}
public class Hund : Tier
{
    public override string Laut() => "Wau";
}
public sealed class Welpe : Hund                    // sealed: keine weiteren Erben
{
    public override string Laut() => "Wuff";
}
Tier t = new Hund { Name = "Rex" };                 // Polymorphie
Console.WriteLine(t.Beschreibe());                  // Rex sagt Wau
```
C# kennt **Einfachvererbung** bei Klassen (eine Basisklasse), aber beliebig viele Interfaces. `virtual` erlaubt Überschreiben, `override` überschreibt, `abstract` erzwingt es, `base.Methode()` ruft die Basisversion. Aufruf wird zur Laufzeit anhand des echten Objekttyps gewählt (dynamische Bindung).

### Interfaces
```csharp
public interface ISpeicherbar { void Speichern(string pfad); }
public class Bericht : ISpeicherbar
{
    public void Speichern(string pfad) => File.WriteAllText(pfad, "...");
}
```
Ein Interface definiert einen **Vertrag** ohne Zustand. Eine Klasse darf mehrere Interfaces implementieren. Das ermöglicht lose Kopplung und Austauschbarkeit (Dependency Injection, Tests mit Attrappen). Abstrakte Klasse: darf Zustand und Code enthalten, nur einmal erbbar.

### Struct, Enum, Record
`struct` ist ein Wertetyp für kleine Daten (Point). `enum` benennt Konstanten (`enum Status { Offen, Erledigt }`). `record` ist eine unveränderliche Datenklasse mit Wertgleichheit: `public record Kunde(int Id, string Name);` erzeugt Konstruktor, Properties, `Equals`, `ToString` und `with`-Ausdrücke (`kunde with { Name = "Neu" }`).

### Generics
`List<T>`, `Dictionary<K,V>`: Typparameter vermeiden Casts und sichern Typsicherheit zur Compile-Zeit. Eigene: `class Stapel<T> { ... }`, Einschränkung `where T : IComparable<T>`.

### Delegates, Events, Lambdas
Delegate = Typ für Methodenverweise (`Func<int,int>`, `Action<string>`, `Predicate<T>`). Lambda: `x => x * 2`. Events (Beobachter-Muster): `public event EventHandler? Geaendert;` und `Geaendert?.Invoke(this, EventArgs.Empty);`.

### Asynchrone Programmierung
```csharp
static async Task<string> LadeAsync(string url)
{
    using var client = new HttpClient();
    return await client.GetStringAsync(url);         // blockiert den Thread nicht
}
```
`async`/`await` gibt den Thread während des Wartens (I/O) frei; UI bleibt reaktionsfähig. `Task` ist ein Versprechen auf ein späteres Ergebnis.

### Mapping zu UML und IHK
Klasse = Rechteck mit Attributen und Methoden; `+` public, `-` private, `#` protected. Vererbung = Pfeil mit hohlem Dreieck, Interface-Implementierung = gestrichelt mit hohlem Dreieck, Komposition = gefüllte Raute, Aggregation = hohle Raute. Die Begriffe Kapselung, Vererbung, Polymorphie, Abstraktion sind dieselben wie im IHK-Lernzettel (siehe ihk-oop-grundlagen).

## Einfach

Eine **Klasse** ist ein Bauplan, ein **Objekt** ist das gebaute Haus. Der Bauplan „Konto" sagt: Jedes Konto hat einen Inhaber und einen Kontostand und kann Geld einzahlen. Aus dem Plan baust du viele Konten, jedes mit eigenen Daten.

**Kapselung** heißt: Der Kontostand liegt im Tresor (`private`). Niemand darf einfach hineingreifen und 1.000.000 schreiben. Man muss durch den Schalter (`Einzahlen`), und der Schalter prüft: Der Betrag muss positiv sein.

**Vererbung** ist wie Familie: „Hund" erbt von „Tier" alles, was Tiere können (einen Namen haben), und fügt Eigenes hinzu. Alle Tiere können einen Laut machen, aber jedes Tier macht ihn anders. Du rufst bei einem Tier einfach `Laut()` auf, und der Hund bellt und die Katze miaut. Das ist **Polymorphie**, „Vielgestaltigkeit".

Ein **Interface** ist wie ein Steckdosen-Standard. Egal, wer das Gerät baut: Wenn es den Stecker hat, passt es. Eine Klasse verspricht mit dem Interface, bestimmte Methoden zu haben. Das Programm muss nicht wissen, ob die Daten in eine Datei oder in die Cloud gespeichert werden, nur dass `Speichern` existiert.

Ein **Record** ist ein Datenzettel, den man nicht mehr verändert: Wenn sich etwas ändert, macht man eine neue Kopie mit der Änderung.

**async/await** ist wie in der Pizzeria: Du bestellst, bekommst eine Nummer und setzt dich hin, anstatt am Tresen stehen zu bleiben. Wenn die Pizza fertig ist, wirst du gerufen. Der Kellner (das Programm) bedient währenddessen andere.

## Merksatz
- Klasse = Bauplan, Objekt = Exemplar.
- Vier Säulen: Kapselung, Vererbung, Polymorphie, Abstraktion.
- C#: eine Basisklasse, viele Interfaces.
- `virtual` erlaubt, `override` tut, `abstract` erzwingt.
- Interface = Vertrag ohne Zustand.
- `await` blockiert nicht den Thread.

## Prüfungsfalle
- Mehrfachvererbung von Klassen in C# annehmen (geht nur über Interfaces).
- `override` ohne `virtual` oder `abstract` in der Basisklasse.
- Abstrakte Klassen instanziieren (`new Tier()` ist ein Fehler).
- Kapselung mit Verstecken verwechseln: Es geht um kontrollierten Zugriff.
- Vererbung bei „hat-ein"-Beziehung verwenden: „ist-ein" = Vererbung, „hat-ein" = Komposition.
- UML-Pfeile vertauschen: Vererbung durchgezogen, Interface-Implementierung gestrichelt.
- `async void` außer bei Event-Handlern verwenden; besser `async Task`.
- Record für veränderliche Objekte nutzen, obwohl er für unveränderliche Daten gedacht ist.

## Grafik
### Polymorphie beim Methodenaufruf
1. Programm: Variable vom Typ Tier zeigt auf ein Hund-Objekt
2. Programm -> Tier: ruft Laut() auf
3. Tier: erkennt zur Laufzeit den echten Typ Hund
4. Tier -> Hund: Aufruf wird an die überschriebene Methode weitergeleitet
5. Hund: liefert Wau

### async/await
1. Aufrufer -> LadeAsync: startet den Aufruf
2. LadeAsync -> Server: sendet HTTP-Anfrage
3. LadeAsync -> Aufrufer: gibt den Thread frei und liefert einen Task
4. Aufrufer: bearbeitet währenddessen andere Aufgaben
5. Server -> LadeAsync: Antwort kommt an
6. LadeAsync -> Aufrufer: Programm läuft nach await mit dem Ergebnis weiter

## Befehle
`dotnet new classlib -n Modelle` – Klassenbibliothek anlegen
`dotnet add reference ../Modelle` – Projektreferenz hinzufügen
`dotnet add package Newtonsoft.Json` – NuGet-Paket einbinden
`dotnet test` – Unit-Tests ausführen

## Übungen
- A: Modellieren Sie `Rechteck` und `Kreis` mit gemeinsamer abstrakter Basis `Form` und Methode `Flaeche()`. | L: abstract class Form { public abstract double Flaeche(); } class Rechteck(double a, double b) : Form { public override double Flaeche() => a * b; } class Kreis(double r) : Form { public override double Flaeche() => Math.PI * r * r; }
- A: Warum ist `private decimal saldo` mit Methode `Einzahlen` besser als ein öffentliches Feld? | L: Kapselung: Validierung (Betrag > 0) ist erzwungen, Invarianten bleiben gewahrt, interne Struktur kann sich ändern.
- A: Wann Interface, wann abstrakte Klasse? | L: Interface für reinen Vertrag und mehrfache Implementierung; abstrakte Klasse für gemeinsamen Code und Zustand bei nur einer Basis.

## Karteikarten
- F: Was ist der Unterschied zwischen Klasse und Objekt? | A: Klasse ist der Bauplan, Objekt eine konkrete Instanz davon.
- F: Was bedeutet `private`? | A: Zugriff nur innerhalb der eigenen Klasse.
- F: Was bedeutet `protected`? | A: Zugriff in der Klasse und in abgeleiteten Klassen.
- F: Wie viele Basisklassen darf eine C#-Klasse haben? | A: Genau eine, aber beliebig viele Interfaces.
- F: Was macht `abstract`? | A: Die Klasse kann nicht instanziiert werden; abstrakte Methoden müssen überschrieben werden.
- F: Unterschied `virtual` und `override`? | A: virtual erlaubt das Überschreiben, override überschreibt tatsächlich.
- F: Was bedeutet `sealed`? | A: Die Klasse kann nicht weiter vererbt werden.
- F: Was ist ein Interface? | A: Ein Vertrag aus Signaturen ohne Zustand.
- F: Was ist Polymorphie? | A: Derselbe Aufruf verhält sich je nach echtem Objekttyp unterschiedlich.
- F: Was ist ein `record`? | A: Unveränderliche Datenklasse mit Wertgleichheit und `with`-Ausdruck.
- F: Was macht `await`? | A: Wartet asynchron auf einen Task, ohne den Thread zu blockieren.
- F: UML: Wie wird Vererbung dargestellt? | A: Durchgezogene Linie mit hohlem Dreieck an der Basisklasse.

## Quiz
? Wie viele Basisklassen kann eine C#-Klasse haben?
* Eine
- Zwei
- Beliebig viele
- Keine

? Was erzwingt eine abstrakte Methode?
* Abgeleitete Klassen müssen sie implementieren.
- Sie darf nicht aufgerufen werden.
- Sie ist automatisch privat.
- Sie wird statisch.

? Welches Schlüsselwort überschreibt eine Basismethode?
* override
- virtual
- new static
- sealed

? Welche Sichtbarkeit erlaubt Zugriff in abgeleiteten Klassen, aber nicht von außen?
* protected
- private
- public
- internal static

? Was ist Polymorphie?
* Verhalten hängt vom tatsächlichen Objekttyp ab
- Eine Klasse hat mehrere Konstruktoren
- Daten werden verschlüsselt
- Objekte werden kopiert

? Was ist eine Eigenschaft (Property)?
* Kontrollierter Zugriff auf ein Feld über get/set
- Eine Schleife
- Ein Interface
- Eine Datei

? Wofür ist ein Interface geeignet?
* Mehrere Klassen erfüllen denselben Vertrag
- Speichert Daten dauerhaft
- Ersetzt den Compiler
- Beschleunigt die Schleifen

? Was beschreibt eine „ist-ein"-Beziehung?
* Vererbung
- Komposition
- Assoziation
- Aggregation

? Was bewirkt `await` in einer async-Methode?
* Es gibt den Thread frei, bis der Task fertig ist
- Es blockiert den Thread
- Es startet das Programm neu
- Es beendet die Methode

? Welche Aussagen sind richtig? (mehrere)
* Eine Klasse kann mehrere Interfaces implementieren.
* Records haben Wertgleichheit.
- Eine abstrakte Klasse kann mit new instanziiert werden.
- Private Felder sind von außen lesbar.
