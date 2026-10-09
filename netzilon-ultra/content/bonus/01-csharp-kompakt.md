---
id: bonus-csharp-kompakt
bereich: Bonus
block: Bonus
kapitel: C# Bonuskapitel
titel: C# kompakt – Grundlagen, Typen, Kontrollstrukturen, Collections, LINQ
stufe: Einsteiger
fach: GDP / OOP
pruefungen: [Schule]
quellen: [Essential_C__12_0__8th_Ed_by_Mark_Michaelis.pdf, C_12_Pocket_Reference_-_Instant_Help_for_C_12_Programmers.pdf]
verweise: [bonus-csharp-oop, ihk-algorithmen-suchen-sortieren, ihk-entwicklungswerkzeuge, ihk-lz-programmierung-uml]
---

## Profi

C# ist eine typsichere, objektorientierte Sprache von Microsoft für .NET (aktuell .NET 8 LTS bis .NET 10 mit C# 12 bis 14). Der Compiler erzeugt **IL-Bytecode**, die Laufzeit (CLR) kompiliert ihn per JIT zu Maschinencode. Es gibt einen **Garbage Collector** für Speicher. Einsatz: Windows-Anwendungen, Webdienste (ASP.NET Core), Skripte, Spiele (Unity), Admin-Tools. Für FiSi relevant, weil man Prüfungspseudocode oft in C#-ähnliche Syntax übersetzt und Admin-Tools schreibt.

### Erstes Programm (Top-Level-Statements, seit C# 9)
```csharp
Console.Write("Name: ");
string name = Console.ReadLine() ?? "";
Console.WriteLine($"Hallo {name}!");
```
Projekt anlegen und starten: `dotnet new console -n Demo`, `dotnet run`. Klassisch steht der Code in `static void Main(string[] args)` einer Klasse `Program`.

### Datentypen
| Typ | Bedeutung | Beispiel |
|---|---|---|
| `int` (32 Bit), `long` (64 Bit) | ganze Zahlen | `int a = 5;` |
| `double`, `float`, `decimal` | Gleitkomma; `decimal` für Geld | `decimal p = 19.99m;` |
| `bool` | Wahrheitswert | `true` |
| `char`, `string` | Zeichen, Text (unveränderlich) | `'a'`, `"Text"` |
| `var` | Typ wird vom Compiler abgeleitet | `var x = 3;` |
| `T?` | nullable Typ | `int? n = null;` |

**Wertetypen** (`int`, `struct`, `enum`) liegen direkt in der Variable, **Referenztypen** (`class`, `string`, Arrays) halten einen Verweis auf das Objekt im Heap. Zuweisung kopiert bei Wertetypen den Wert, bei Referenztypen den Verweis. Umwandlung: implizit bei sicherem Weg (`int` nach `long`), explizit per Cast `(int)3.7` (ergibt 3), sicher per `int.TryParse(text, out int zahl)`.

### Operatoren und Kontrollstrukturen
Arithmetik `+ - * / %` (Ganzzahldivision `7 / 2 = 3`), Vergleich `== != < > <= >=`, logisch `&& || !`, Null-Operatoren `??` und `?.`.
```csharp
if (alter >= 18) { Console.WriteLine("volljährig"); }
else if (alter >= 16) { Console.WriteLine("Jugendlicher"); }
else { Console.WriteLine("Kind"); }

switch (tag)
{
    case 6: case 7: Console.WriteLine("Wochenende"); break;
    default: Console.WriteLine("Werktag"); break;
}
string art = tag switch { 6 or 7 => "Wochenende", _ => "Werktag" };

for (int i = 0; i < 5; i++) { Console.WriteLine(i); }
foreach (var zahl in zahlen) { summe += zahl; }
while (x > 0) { x /= 2; }
do { eingabe = Console.ReadLine(); } while (eingabe == "");
```
`break` beendet eine Schleife, `continue` springt zur nächsten Runde.

### Methoden
```csharp
static int Quadrat(int x) => x * x;
static double Mittelwert(params int[] werte) => werte.Average();
static void Teile(int a, int b, out int q, out int r) { q = a / b; r = a % b; }
```
Parameter: Wert (Standard), `ref`/`out` (Verweis), optionale Parameter (`int n = 10`), benannte Argumente (`Quadrat(x: 4)`), `params`. Überladung: gleicher Name, andere Parameterliste.

### Arrays, Listen, Dictionary
```csharp
int[] feld = new int[5];            // Länge fest, Index 0 bis 4
int[] primes = { 2, 3, 5, 7 };
var liste = new List<string> { "Anna", "Ben" };
liste.Add("Cem"); liste.Remove("Ben");
var preise = new Dictionary<string, decimal> { ["Maus"] = 12.5m };
if (preise.TryGetValue("Maus", out var p)) Console.WriteLine(p);
int[] kurz = [1, 2, 3];             // Collection Expression (C# 12)
```
Array = feste Größe, `List<T>` = wachsend, `Dictionary<K,V>` = Schlüssel-Wert (Zugriff O(1) im Mittel), `HashSet<T>` = eindeutige Elemente, `Queue<T>` FIFO, `Stack<T>` LIFO. Zugriff außerhalb der Grenzen wirft `IndexOutOfRangeException`.

### LINQ
```csharp
var gerade = zahlen.Where(z => z % 2 == 0).OrderBy(z => z).ToList();
var summe = zahlen.Sum();
var namen = personen.Select(p => p.Name);
var gruppen = personen.GroupBy(p => p.Stadt);
```
LINQ (Language Integrated Query) fragt Collections deklarativ ab, ähnlich wie SQL (`Where` = WHERE, `Select` = SELECT, `OrderBy` = ORDER BY, `GroupBy` = GROUP BY). Die Ausführung ist **verzögert**, bis `ToList()`, `Count()` o. ä. aufgerufen wird.

### Ausnahmen und Dateien
```csharp
try { var text = File.ReadAllText("daten.txt"); }
catch (FileNotFoundException ex) { Console.WriteLine(ex.Message); }
finally { Console.WriteLine("fertig"); }
using var sw = new StreamWriter("log.txt", append: true);
sw.WriteLine($"{DateTime.Now:s} Start");
```
`finally` läuft immer. `using` ruft am Blockende `Dispose()` auf und schließt Ressourcen.

### Pseudocode nach C# (IHK-Praxis)
Schreibtischtest-Aufgaben lassen sich 1:1 abbilden: Zuweisung `x ← 5` ist `x = 5;`, „Wiederhole solange" ist `while`, „Für i von 1 bis n" ist `for (int i = 1; i <= n; i++)`, Array-Zugriff `feld[i]` (Achtung: Prüfungspseudocode zählt oft ab 1, C# ab 0).

## Einfach

Ein Programm ist eine Anleitung, die der Computer Schritt für Schritt abarbeitet. C# ist die Sprache, in der wir diese Anleitung schreiben.

**Variablen sind Schubladen mit Beschriftung.** Auf der Schublade steht, was hineindarf: `int` nur ganze Zahlen, `string` nur Text, `bool` nur Ja oder Nein. Wenn du `int alter = 17;` schreibst, baust du eine Schublade „alter" für ganze Zahlen und legst 17 hinein.

**Entscheidungen** (`if`) sind wie „Wenn es regnet, nimm einen Schirm, sonst nicht." **Schleifen** sind wie „Schreib den Satz fünfmal ab": `for` zählt mit (1, 2, 3, 4, 5), `while` macht weiter, solange etwas gilt, `foreach` geht jedes Ding in einer Kiste der Reihe nach durch.

**Methoden** sind Rezepte mit Namen. Du schreibst einmal auf, wie man „Quadrat" berechnet, und rufst es danach so oft du willst: `Quadrat(4)` gibt 16 zurück.

**Array** ist ein Eierkarton: feste Anzahl Fächer, durchnummeriert ab 0. **Liste** ist ein Rucksack, in den man immer mehr hineinlegen kann. **Dictionary** ist ein Telefonbuch: Du suchst den Namen und bekommst die Nummer.

**LINQ** ist wie ein Sieb für Listen: „Gib mir nur die geraden Zahlen, sortiert."

**Ausnahmen** (`try/catch`) sind ein Sicherheitsnetz. Wenn beim Lesen der Datei etwas schiefgeht, fängt `catch` den Fehler auf, und das Programm stürzt nicht ab.

## Merksatz
- Index beginnt bei 0, letztes Element hat Index Länge minus 1.
- `int / int` ergibt eine ganze Zahl (7 / 2 = 3).
- Geld gehört in `decimal`, nicht in `double`.
- Wertetyp = Kopie, Referenztyp = Verweis.
- `finally` läuft immer, `using` räumt automatisch auf.
- LINQ ist wie SQL für Collections.

## Prüfungsfalle
- Off-by-one: `for (i = 0; i <= feld.Length; i++)` läuft einen Schritt zu weit.
- `=` (Zuweisung) mit `==` (Vergleich) verwechseln.
- Ganzzahldivision: `5 / 2 * 2.0` ergibt 4, nicht 5.
- Strings sind unveränderlich; wiederholtes `+=` in Schleifen ist langsam, besser `StringBuilder`.
- Pseudocode zählt oft ab 1, C# ab 0.
- Nicht auf `null` prüfen (`NullReferenceException`).
- Fließkommazahlen exakt vergleichen (`0.1 + 0.2 == 0.3` ist false).
- LINQ-Abfrage verzögert ausgeführt: spätere Änderungen an der Quelle wirken sich aus.

## Grafik
### Schleife mit Schreibtischtest
1. Programm: sum = 0, i = 1
2. Schleife: prüft i <= 3
3. Programm: sum = sum + i, danach i = i + 1
4. Schleife: i = 2, sum = 1
5. Schleife: i = 3, sum = 3
6. Programm: i = 4, Bedingung falsch, Ausgabe sum = 6

### Von C#-Code zur Ausführung
1. Entwickler -> Compiler: Quellcode .cs
2. Compiler -> Laufzeit: IL-Bytecode in .dll oder .exe
3. Laufzeit: JIT übersetzt in Maschinencode
4. Laufzeit -> CPU: Ausführung, Garbage Collector verwaltet Speicher

## Befehle
`dotnet new console -n Demo` – neues Konsolenprojekt
`dotnet run` – Projekt bauen und starten
`dotnet build` – nur kompilieren
`dotnet --version` – installierte SDK-Version
`dotnet publish -c Release -r win-x64 --self-contained` – eigenständige EXE erzeugen

## Übungen
- A: Schreiben Sie eine Schleife, die die Summe von 1 bis 100 berechnet. | L: int s = 0; for (int i = 1; i <= 100; i++) s += i; Ergebnis 5050.
- A: Was gibt `Console.WriteLine(7 / 2);` aus? | L: 3, weil beide Operanden int sind.
- A: Filtern Sie aus `List<int> z` alle Zahlen größer 10, sortiert absteigend. | L: z.Where(x => x > 10).OrderByDescending(x => x).ToList();
- A: Lesen Sie eine Zahl sicher ein. | L: if (int.TryParse(Console.ReadLine(), out int n)) { ... } else { Console.WriteLine("Ungültig"); }

## Karteikarten
- F: Wozu dient `var`? | A: Der Compiler leitet den Typ aus dem Wert ab; der Typ bleibt statisch.
- F: Unterschied Wert- und Referenztyp? | A: Wertetyp enthält den Wert, Referenztyp einen Verweis auf ein Objekt im Heap.
- F: Welcher Typ für Geldbeträge? | A: decimal.
- F: Was ergibt `7 / 2` in C#? | A: 3.
- F: Wie viele Elemente hat `new int[5]` und welcher Index ist der letzte? | A: Fünf Elemente, letzter Index 4.
- F: Array oder List? | A: Array hat feste Größe, List wächst dynamisch.
- F: Wofür steht LINQ? | A: Language Integrated Query: Abfragen von Collections, ähnlich SQL.
- F: Was macht `finally`? | A: Der Block läuft immer, ob Fehler oder nicht.
- F: Was macht `using`? | A: Ruft am Blockende Dispose() auf und gibt Ressourcen frei.
- F: Unterschied `break` und `continue`? | A: break beendet die Schleife, continue springt zur nächsten Runde.
- F: Wofür `??`? | A: Ersatzwert, wenn der linke Ausdruck null ist.
- F: Was kompiliert der C#-Compiler? | A: Zu IL-Bytecode, den die CLR per JIT in Maschinencode übersetzt.

## Quiz
? Was gibt `Console.WriteLine(10 / 4);` aus?
* 2
- 2,5
- 3
- 2.5

? Welcher Typ ist für Geldbeträge am besten geeignet?
* decimal
- float
- double
- char

? Welcher Index ist beim Array `int[] a = new int[4];` das letzte Element?
* 3
- 4
- 5
- 0

? Welche Collection speichert Schlüssel-Wert-Paare?
* Dictionary
- List
- Stack
- Array

? Was passiert bei `finally`?
* Der Block wird immer ausgeführt.
- Er läuft nur bei Fehlern.
- Er läuft nur ohne Fehler.
- Er beendet das Programm.

? Was bewirkt `foreach (var x in liste)`?
* Es durchläuft alle Elemente der Reihe nach.
- Es sortiert die Liste.
- Es löscht die Liste.
- Es kopiert die Liste.

? Welcher LINQ-Befehl entspricht SQL-WHERE?
* Where
- Select
- OrderBy
- GroupBy

? Was ist ein Referenztyp?
* class
- int
- bool
- struct

? Wie wandelt man Text sicher in eine Zahl?
* int.TryParse
- (int)text
- text.ToInt()
- int.Cast(text)

? Welche Aussagen zu C# stimmen? (mehrere)
* Der Code wird zu IL-Bytecode kompiliert.
* Ein Garbage Collector verwaltet den Speicher.
- C# läuft nur unter Windows.
- Strings sind veränderlich.
