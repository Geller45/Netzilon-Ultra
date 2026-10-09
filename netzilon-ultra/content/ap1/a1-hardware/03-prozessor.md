---
id: ap1-a1-prozessor
bereich: AP1
block: A1
kapitel: Hardware
titel: Prozessor (CPU)
stufe: Fortgeschritten
quellen: [03_Übung_Prozessor.pdf]
verweise: [ap1-a1-chipsatz, ap1-a1-arbeitsspeicher, ap1-a1-mobilarchitekturen, ap1-a3-zahlensysteme]
---

## Profi

### Grundfunktion
Die CPU (Central Processing Unit) führt Befehle aus. Grundlegend berechnet sie zwei Operationstypen:
1. **Arithmetische Operationen** (Addition, Subtraktion, Multiplikation …)
2. **Logische Operationen** (UND, ODER, NICHT, XOR, Vergleiche)
Beide übernimmt die **ALU** (Arithmetic Logic Unit).

### Aufbau (sechs Bereiche)
| Bereich | Aufgabe |
|---|---|
| **Steuerwerk** (Control Unit) | Holt Befehle, dekodiert sie und steuert die Ausführung |
| **Rechenwerk** (ALU, FPU, Vektoreinheiten) | Führt Berechnungen aus |
| **Register** | Kleinste, schnellste Speicherplätze direkt im Kern (z. B. Befehlszähler, Akkumulator, Statusregister); halten gerade benötigte Operanden und Ergebnisse |
| **Cache** | Schneller Zwischenspeicher (L1/L2/L3) zwischen Kern und RAM |
| **Speicherverwaltung** (MMU) | Übersetzt virtuelle in physische Adressen |
| **Busschnittstelle** | Anbindung an Speicher und Peripherie |

**Spezielle Rechenwerke**: FPU (Gleitkomma), SIMD-Einheiten (SSE, AVX, AVX-512), AES-NI (Verschlüsselung), integrierte GPU, **NPU** (Neural Processing Unit für KI, z. B. Copilot+ PCs).

### Bussysteme
- **Datenbus**: transportiert die eigentlichen Daten (bidirektional).
- **Adressbus**: gibt an, *wo* gelesen/geschrieben wird (unidirektional von der CPU). Seine Breite bestimmt den adressierbaren Speicher (32 Bit → 4 GiB).
- **Steuerbus**: Steuersignale wie Lesen/Schreiben, Takt, Interrupts.

### Cache
| Stufe | Ort | Größe (typisch heute) | Geschwindigkeit |
|---|---|---|---|
| L1 | pro Kern, getrennt in Befehls- und Daten-Cache | 32–64 KB je Teil | am schnellsten (~1 ns) |
| L2 | pro Kern | 1–3 MB | schnell |
| L3 | von allen Kernen geteilt | 16–128 MB (AMD X3D mit gestapeltem Cache) | langsamer, aber viel schneller als RAM |

Prinzip: Häufig benötigte Daten liegen nah am Kern (**Lokalität**). Findet die CPU die Daten im Cache, spricht man von einem **Cache-Hit**, sonst von einem **Cache-Miss** → Zugriff auf die nächste Stufe bzw. den RAM.

### Befehlsverarbeitung (fünf Schritte, Pipeline)
1. **Fetch** – Befehl aus dem Speicher holen (Adresse aus dem Befehlszähler)
2. **Decode** – Befehl dekodieren
3. **Fetch Operands** – Operanden laden (Register/Speicher)
4. **Execute** – Ausführen in der ALU
5. **Write Back** – Ergebnis zurückschreiben

Moderne CPUs arbeiten mit einer **Pipeline**: Während ein Befehl ausgeführt wird, wird der nächste schon dekodiert und der übernächste geholt – wie ein Fließband. Bei einer falschen **Sprungvorhersage** (Branch Prediction) muss die Pipeline geleert werden. **Lange Pipeline** = hoher Takt möglich, aber großer Verlust bei Fehlvorhersagen (Pentium 4 „NetBurst“, 20–31 Stufen). **Kurze Pipeline** = weniger Verlust (Pentium III/P6). Intel kehrte deshalb mit dem **Pentium M** und der **Core-Architektur** (2006) zur effizienteren P6-Linie zurück: niedrigerer Takt, aber mehr Arbeit pro Takt (IPC) und weniger Stromverbrauch.

### Hyper-Threading / SMT
**Simultaneous Multithreading** (Intel: Hyper-Threading, AMD: SMT): Ein physischer Kern erscheint dem Betriebssystem als **zwei logische Kerne**. Der Kern hat doppelte Registersätze, teilt sich aber die Rechenwerke. Wartet ein Thread (z. B. auf den Speicher), rechnet der andere weiter → bessere Auslastung, typisch 15–30 % mehr Leistung, aber keine Verdoppelung.

**Hybrid-Architektur** (Intel ab 12. Gen., ARM big.LITTLE): Performance-Kerne (P-Cores) und Effizienz-Kerne (E-Cores) in einer CPU.

### SSE und Befehlssatzerweiterungen
**SSE** (Streaming SIMD Extensions) = SIMD-Prinzip: **eine Anweisung verarbeitet mehrere Daten gleichzeitig** (Single Instruction, Multiple Data). Nützlich für Multimedia, Video-Kodierung, 3D, Verschlüsselung, KI. Weiterentwicklungen: SSE2–4, AVX, AVX2, AVX-512.

### Die, Heatspreader, TDP
- **Die**: Der eigentliche Siliziumchip. Enthält Kerne, Caches, Speichercontroller (IMC), PCIe-Controller, iGPU, teils NPU. Moderne CPUs bestehen aus mehreren **Chiplets** (AMD CCD + I/O-Die, Intel Tiles).
- **Heatspreader** (IHS, Integrated Heat Spreader): Metalldeckel über dem Die. Verteilt die Wärme auf eine größere Fläche, schützt den empfindlichen Die beim Montieren des Kühlers.
- **TDP** (Thermal Design Power): Wärmeleistung in Watt, die die Kühlung bei typischer Volllast abführen können muss. Sie ist **nicht** der maximale Stromverbrauch – Turbo-Modi können kurzfristig deutlich mehr ziehen (Intel: PL1/PL2).
  - Beispiel niedrig: Intel N100 – 6 W TDP, 4 E-Kerne, für Mini-PCs/Thin Clients.
  - Beispiel hoch: AMD Threadripper 7980X – 350 W TDP, 64 Kerne, für Workstations.

### Wichtige Eckdaten beim Vergleich
Kerne/Threads, Basistakt und Boost-Takt (GHz), Cache-Größen, TDP, Sockel, unterstützter RAM (DDR4/DDR5, Kanäle), PCIe-Version und Lanes, iGPU, Befehlssatzerweiterungen, Fertigungsprozess, Preis.

## Einfach

Die CPU ist das **Gehirn** des Computers. Sie kann eigentlich nur zwei Dinge: **rechnen** (1 + 1) und **vergleichen/entscheiden** (Ist A größer als B? Ist das an oder aus?). Aber das macht sie **milliardenfach pro Sekunde**.

Stell dir die CPU wie eine **Küche** vor:
- Der **Chefkoch** (Steuerwerk) liest das Rezept und sagt, was zu tun ist.
- Die **Köche am Herd** (Rechenwerk) schneiden und kochen – sie machen die eigentliche Arbeit.
- Die **Schüsseln direkt vor dem Koch** (Register) enthalten genau das, was er gerade braucht.
- Der **Kühlschrank neben dem Herd** (Cache) hat die Zutaten, die man oft braucht. L1 ist das kleine Fach direkt am Herd, L2 der Kühlschrank daneben, L3 der große Kühlschrank für alle Köche.
- Der **Supermarkt** (Arbeitsspeicher) hat alles, aber hinlaufen dauert lange.

**So arbeitet die CPU**: Rezeptzeile holen → lesen → Zutaten holen → kochen → Ergebnis auf den Teller. Und weil das schnell gehen soll, arbeiten die Köche wie am **Fließband**: Während einer kocht, liest der nächste schon die nächste Zeile.

**Hyper-Threading**: Ein Koch hat zwei Rezepte gleichzeitig vor sich. Wenn er beim ersten warten muss, bis das Wasser kocht, schnippelt er schnell was fürs zweite. Er ist nicht doppelt so schnell – aber er steht nicht mehr untätig herum.

**SSE/SIMD**: Statt jede Karotte einzeln zu schneiden, legt der Koch acht nebeneinander und schneidet mit einem Schnitt alle auf einmal.

**Heatspreader**: Die CPU wird sehr heiß. Der Metalldeckel ist wie ein Topfuntersetzer – er verteilt die Hitze, damit der Kühler sie gut wegnehmen kann, und schützt den empfindlichen Chip darunter.

**TDP**: Sagt dir, wie viel Hitze der Kühler mindestens wegschaffen muss. Kleine CPUs für Mini-PCs brauchen fast keinen Kühler, riesige Workstation-CPUs brauchen einen Kühler so groß wie ein Ziegelstein.

## Merksatz
- **Fetch – Decode – Operands – Execute – Write back**: „Freche Dackel Operieren Echt Wild“.
- Busse: **D**aten (was), **A**dresse (wo), **S**teuer (wie) → „DAS“.
- Cache: L1 klein & schnell, L3 groß & geteilt.
- TDP = Wärme, nicht Strom.
- SIMD = eine Anweisung, viele Daten.

## Prüfungsfalle
- Hyper-Threading verdoppelt **nicht** die Leistung; logische ≠ physische Kerne.
- TDP ist kein maximaler Verbrauch.
- Adressbus bestimmt den adressierbaren Speicher, nicht der Datenbus.
- L1 ist pro Kern, L3 wird geteilt.
- Höherer Takt heißt nicht automatisch schneller (IPC, Pipeline, Cache).

## Grafik
### Fließband (Pipeline)
1. Fünf Stationen nebeneinander: Fetch, Decode, Operands, Execute, Write back.
2. Farbige Befehlsblöcke laufen im Takt durch; pro Takt rückt jeder eine Station weiter.
3. Knopf „Sprungvorhersage falsch“: Pipeline leert sich rot, zeigt verlorene Takte; Vergleich kurze vs. lange Pipeline.

### Cache-Hierarchie
Pyramide: Register (oben, winzig, schnell) → L1 → L2 → L3 → RAM → SSD (unten, groß, langsam). Ein Datenpaket sucht von oben nach unten; bei Hit grüner Blitz, bei Miss wandert es tiefer, Zeitanzeige läuft mit.

### Hyper-Threading
Ein Kern mit zwei Aufgabenbändern; Wartephasen des einen Threads werden grau, der andere Thread füllt die Lücken.

## Karteikarten
- F: Welche zwei Operationstypen berechnet eine CPU? | A: Arithmetische und logische Operationen.
- F: Nenne die fünf Schritte der Befehlsverarbeitung. | A: Fetch, Decode, Fetch Operands, Execute, Write Back.
- F: Welche drei Busse sind für die CPU wichtig? | A: Datenbus, Adressbus, Steuerbus.
- F: Was ist ein Register? | A: Kleinster, schnellster Speicher direkt im Prozessorkern für gerade benötigte Werte.
- F: Unterschied L1-, L2-, L3-Cache? | A: L1 pro Kern, klein, am schnellsten; L2 pro Kern, größer; L3 geteilt, am größten, langsamer.
- F: Was ist Hyper-Threading? | A: Ein physischer Kern verarbeitet zwei Threads gleichzeitig (zwei logische Kerne) für bessere Auslastung.
- F: Was bedeutet SIMD? | A: Single Instruction, Multiple Data – eine Anweisung verarbeitet mehrere Datenwerte gleichzeitig (SSE, AVX).
- F: Was ist TDP? | A: Thermal Design Power – Wärmeleistung, die die Kühlung abführen muss.
- F: Wozu dient der Heatspreader? | A: Wärme verteilen und den Die mechanisch schützen.
- F: Warum kehrte Intel nach dem Pentium 4 zur P6-Linie zurück? | A: Lange NetBurst-Pipeline war ineffizient (hohe Verluste bei Fehlvorhersagen, hoher Verbrauch); Core-Architektur setzt auf IPC statt Takt.

## Quiz
? Welcher Bus bestimmt die Größe des adressierbaren Speichers?
* Adressbus
- Datenbus
- Steuerbus
- PCIe-Bus

? Welcher Cache wird von allen Kernen gemeinsam genutzt?
* L3
- L1-Daten
- L1-Befehle
- Register

? Eine CPU hat 8 Kerne mit Hyper-Threading. Wie viele logische Prozessoren zeigt Windows?
* 16
- 8
- 4
- 32

? Was beschreibt die TDP?
* Die Wärmeleistung, die das Kühlsystem abführen muss
- Den maximalen Stromverbrauch im Turbo
- Die Taktfrequenz in GHz
- Die Größe des L3-Caches

? Welcher Schritt folgt in der Pipeline direkt auf „Decode“?
* Operanden holen
- Befehl holen
- Ergebnis zurückschreiben
- Interrupt auslösen

? Wofür steht die Abkürzung ALU?
* Arithmetic Logic Unit – Rechenwerk der CPU
- Advanced Light Unit
- Address Lookup Unit
- Automatic Load Unit
! Die ALU führt arithmetische und logische Operationen aus.

? Welche Cache-Stufe ist am schnellsten, aber am kleinsten?
* L1-Cache
- L2-Cache
- L3-Cache
- Arbeitsspeicher
! L1 sitzt direkt im Kern, L3 wird meist gemeinsam genutzt.

? Was versteht man unter „Overclocking“?
* Betrieb der CPU oberhalb des vom Hersteller spezifizierten Takts
- Senkung der Taktfrequenz zum Stromsparen
- Austausch des Prozessorkühlers
- Aktivieren von Hyper-Threading
! Mehr Leistung, aber höhere Wärme, Stromaufnahme und ggf. Instabilität bzw. Garantieverlust.
