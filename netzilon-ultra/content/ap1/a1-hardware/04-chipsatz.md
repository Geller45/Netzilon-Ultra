---
id: ap1-a1-chipsatz
bereich: AP1
block: A1
kapitel: Hardware
titel: Chipsatz, Von-Neumann & Busarchitektur
stufe: Fortgeschritten
quellen: [04_Übung_Chipsatz.pdf]
verweise: [ap1-a1-mainboard, ap1-a1-prozessor, ap1-a1-arbeitsspeicher, ap1-a1-pci]
---

## Profi

### Was ist der Chipsatz?
Als **Chipsatz** bezeichnet man die Steuerchips auf dem Mainboard, die die CPU mit Arbeitsspeicher, Grafik und Peripherie verbinden. Klassisch bestand er aus zwei Chips:

| Chip | Intel-Bezeichnung | Aufgaben |
|---|---|---|
| **Northbridge** | MCH (Memory Controller Hub) | Anbindung der CPU (über den FSB), **Speichercontroller** für RAM, Anbindung der **Grafikkarte** (AGP/PCIe x16), Verbindung zur Southbridge |
| **Southbridge** | ICH (I/O Controller Hub) | Langsame Peripherie: **SATA/IDE, USB, Audio, LAN, PCI-Slots, BIOS-Flash (über LPC/SPI), Echtzeituhr/CMOS, Energieverwaltung (ACPI), Super-I/O** (seriell, parallel, PS/2) |

### Von-Neumann-Architektur
Grundmodell fast aller heutigen Computer (1945):
1. **Rechenwerk** (ALU) und **Steuerwerk** – zusammen die CPU
2. **Speicherwerk** – ein gemeinsamer Speicher für **Programme und Daten**
3. **Ein-/Ausgabewerk** – Verbindung zur Außenwelt
4. **Bussystem** – verbindet alles

Nachteil: der **Von-Neumann-Flaschenhals** – Befehle und Daten teilen sich einen Bus, die CPU wartet oft auf den Speicher. Gegenmaßnahmen: Caches, getrennte L1-Caches für Befehle und Daten (angelehnt an die **Harvard-Architektur** mit getrennten Speichern).

### Front-Side-Bus (FSB)
Der **FSB** war der gemeinsame Bus zwischen CPU und Northbridge. Alles – RAM-Zugriffe, Grafik, Peripherie – lief über ihn, was ihn zum Engpass machte. Heute ist er ersetzt durch:
- **integrierten Speichercontroller (IMC)** in der CPU → RAM direkt an der CPU
- **PCIe-Lanes direkt aus der CPU** → Grafikkarte und NVMe direkt angebunden
- **DMI** (Intel) bzw. PCIe-Verbindung (AMD) zwischen CPU und Chipsatz
- Zwischen mehreren CPUs: Intel **QPI/UPI**, AMD **Infinity Fabric**

### Lage auf dem Mainboard
Die **Northbridge** saß direkt neben CPU, RAM und Grafikslot, weil diese Verbindungen **sehr schnell** sein mussten – kurze Leiterbahnen bedeuten weniger Signalverlust und Laufzeit. Die **Southbridge** saß weiter unten bei den Erweiterungsslots und Anschlüssen, da die langsamere Peripherie keine kurzen Wege braucht. Deshalb waren **RAM und Grafik an der Northbridge**: Sie brauchen die höchste Bandbreite.

### Verbindung North- und Southbridge
| Zeit | Verbindung | Bandbreite |
|---|---|---|
| bis ca. 1999 | PCI-Bus | 133 MB/s (geteilt mit allen PCI-Geräten) |
| 1999–2004 | Intel **Hub Link** | 266 MB/s |
| ab 2004 | **DMI 1.0** (Direct Media Interface) | ca. 1 GB/s je Richtung |
| DMI 2.0 | | ca. 2 GB/s je Richtung |
| DMI 3.0 | | ca. 3,9 GB/s je Richtung (entspricht PCIe 3.0 x4) |
| DMI 4.0 | | ca. 15,8 GB/s je Richtung (PCIe 4.0 x8) |

DMI wurde entwickelt, weil immer mehr schnelle Geräte an der Southbridge hingen (SATA, USB, Gigabit-LAN) und die alte Verbindung zum Flaschenhals wurde. DMI basiert technisch auf **PCI Express** (serielle Punkt-zu-Punkt-Verbindung, vollduplex).

### IMC und PCH
**IMC** (Integrated Memory Controller): Der Speichercontroller wanderte aus der Northbridge **in die CPU** (AMD Athlon 64: 2003, Intel Core i7 „Nehalem“: 2008). Später wanderten auch PCIe-Controller und Grafik in die CPU – die Northbridge verschwand vollständig.

Auswirkungen:
- Die Southbridge heißt bei Intel nun **PCH** (Platform Controller Hub); bei AMD einfach Chipsatz (z. B. B650, X870).
- Der PCH übernimmt die restlichen Aufgaben (USB, SATA, LAN, Audio, zusätzliche PCIe-Lanes) und wird über **DMI** angebunden.
- **FDI** (Flexible Display Interface): Überträgt bei Intel-CPUs mit integrierter Grafik das Bildsignal von der CPU zum PCH, der die Bildausgänge ansteuerte (heute teils direkt aus der CPU).
- **Mainboard-Layout**: RAM-Bänke liegen dicht an der CPU, weniger Chips, einfachere Leiterbahnführung, kleinere Boards möglich. Ein IMC bestimmt, welche RAM-Typen unterstützt werden – die CPU, nicht das Board.

### Alt vs. neu
| Alt (FSB-Architektur) | Neu (IMC + PCH) |
|---|---|
| CPU ↔ FSB ↔ Northbridge ↔ RAM/Grafik | CPU mit IMC → RAM direkt, PCIe x16 direkt |
| Northbridge ↔ Hub Link/DMI ↔ Southbridge | CPU ↔ DMI ↔ PCH |
| Grafik über Northbridge | iGPU in der CPU, Bild über FDI/direkt |
| Zwei Chipsatz-Chips | Ein Chip (PCH) |

Mit **CPU-Z** (Reiter „Mainboard“) lässt sich der Chipsatz auslesen. Wird als Northbridge die CPU selbst angezeigt bzw. kein FSB, sondern nur ein „Bus-Takt“ (BCLK, 100 MHz), hat das System einen IMC und keinen klassischen FSB mehr.

### Haupt-Chipsatz-Funktionen heute
USB-Controller, SATA-Controller (inkl. RAID), zusätzliche PCIe-Lanes, LAN/WLAN-Anbindung, Audio, Übertaktungs- und Funktionsumfang (z. B. Intel Z = übertaktbar, B/H = eingeschränkt).

## Einfach

Stell dir das Mainboard als **Stadt** vor und den Chipsatz als **Verkehrszentrale**.

Früher gab es zwei Zentralen:
- Die **Northbridge** war die **Autobahn-Zentrale** ganz oben im Norden, direkt neben dem Rathaus (CPU). Sie regelte den schnellen Verkehr: zum großen Lager (Arbeitsspeicher) und zum Kino (Grafikkarte).
- Die **Southbridge** war die **Landstraßen-Zentrale** im Süden. Sie kümmerte sich um die kleinen, langsamen Straßen: USB-Geräte, Festplatten, Sound und Netzwerk.

**Warum sitzt die Northbridge so nah an der CPU?** Weil schnelle Autos kurze Wege brauchen. Je länger die Straße, desto länger dauert die Fahrt.

**Der Front-Side-Bus** war die einzige Brücke zwischen Rathaus und Autobahn-Zentrale. Irgendwann wollten alle gleichzeitig drüber – Stau! Die Lösung: Man hat das Lager (Arbeitsspeicher) direkt ans Rathaus angebaut. Das ist der **IMC** – der Speicher-Chef wohnt jetzt in der CPU. Danach zog auch der Kino-Anschluss ins Rathaus. Die Northbridge war arbeitslos und wurde abgeschafft.

Übrig blieb nur noch die Landstraßen-Zentrale, die heute **PCH** heißt. Mit dem Rathaus ist sie über eine eigene Schnellstraße verbunden: **DMI**.

**Von-Neumann**: Das ist der Bauplan fast aller Computer. Er sagt: Es gibt einen Rechner, einen Speicher und Ein-/Ausgänge, verbunden durch Straßen. Das Besondere: **Rezepte (Programme) und Zutaten (Daten) liegen im selben Schrank.** Das ist praktisch, aber der Koch muss für beides denselben Weg laufen – deshalb gibt es manchmal Stau.

## Merksatz
- **Nord = schnell** (RAM, Grafik), **Süd = langsam** (USB, SATA, Audio).
- FSB → abgelöst durch IMC + DMI.
- Southbridge (neu) = **PCH**.
- Von-Neumann: **ein Speicher für Programm und Daten** → Flaschenhals.
- DMI ≈ PCIe x4 (DMI 3.0).

## Prüfungsfalle
- Heute gibt es **keine Northbridge** mehr als eigenen Chip – ihre Aufgaben stecken in der CPU.
- Welche RAM-Typen gehen, entscheidet der IMC in der CPU (plus Mainboard-Bänke).
- Von-Neumann ≠ Harvard: Harvard hat getrennte Speicher für Befehle und Daten.
- DMI ist keine Verbindung zum RAM, sondern CPU ↔ Chipsatz.

## Grafik
### Zeitreise der Architektur
1. Jahr 2000: CPU, FSB, Northbridge (RAM, AGP), Hub Link, Southbridge (USB, IDE, PCI). Datenpakete stauen sich am FSB (rote Punkte).
2. Jahr 2008: Speichercontroller fliegt animiert in die CPU; RAM-Leitung wird kurz und grün.
3. Heute: Northbridge verblasst, PCIe-Grafik hängt direkt an der CPU, Southbridge wird zu „PCH“, verbunden über DMI.

### Von-Neumann-Modell
Blockbild mit Steuerwerk, Rechenwerk, Speicher, E/A und Bus; Befehle (blau) und Daten (orange) teilen sich den Bus und müssen abwechselnd fahren.

## Karteikarten
- F: Aufgaben der Northbridge? | A: Anbindung von CPU (FSB), Arbeitsspeicher, Grafik (AGP/PCIe x16) und Southbridge.
- F: Nenne sechs Komponenten der Southbridge. | A: SATA, USB, Audio, LAN, PCI-Slots, BIOS-Flash, RTC/CMOS, Energiemanagement.
- F: Was ist der FSB? | A: Front-Side-Bus – gemeinsamer Bus zwischen CPU und Northbridge (veraltet).
- F: Was bedeutet IMC? | A: Integrated Memory Controller – Speichercontroller in der CPU.
- F: Was ist der PCH? | A: Platform Controller Hub – Nachfolger der Southbridge bei Intel, per DMI an die CPU angebunden.
- F: Was ist DMI? | A: Direct Media Interface – PCIe-basierte Verbindung zwischen CPU/Northbridge und Southbridge/PCH.
- F: Was war vor DMI? | A: Intel Hub Link (266 MB/s), davor PCI-Bus (133 MB/s).
- F: Was ist FDI? | A: Flexible Display Interface – Bildsignal der iGPU von der CPU zum PCH.
- F: Vier Bestandteile der Von-Neumann-Architektur? | A: Rechenwerk, Steuerwerk, Speicherwerk, Ein-/Ausgabewerk (+ Bussystem).
- F: Was ist der Von-Neumann-Flaschenhals? | A: Befehle und Daten teilen sich einen Bus/Speicher – CPU wartet auf den Speicher.

## Quiz
? Warum waren RAM und Grafik an der Northbridge angeschlossen?
* Weil sie die höchste Bandbreite benötigen und kurze Wege zur CPU brauchen
- Weil die Southbridge keine Stromversorgung hat
- Weil die Northbridge das BIOS enthält
- Weil USB sonst nicht funktioniert

? Was wurde durch den integrierten Speichercontroller (IMC) überflüssig?
* Die Northbridge als Vermittler zwischen CPU und RAM
- Die Southbridge
- Der Arbeitsspeicher
- Das UEFI

? Welche Aussage zur Von-Neumann-Architektur stimmt?
* Programme und Daten liegen in einem gemeinsamen Speicher
- Befehle und Daten haben getrennte Speicher
- Sie besitzt kein Steuerwerk
- Sie wird heute nicht mehr verwendet

? Welche Verbindung nutzt Intel zwischen CPU und PCH?
* DMI
- FSB
- AGP
- FDI

? Welche Bandbreite hatte der PCI-Bus (32 Bit, 33 MHz)?
* 133 MB/s
- 1 GB/s
- 266 MB/s
- 16 GB/s
