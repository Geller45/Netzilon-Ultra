---
id: ap1-a1-pci
bereich: AP1
block: A1
kapitel: Hardware
titel: PCI, PCI-X & PCI Express
stufe: Fortgeschritten
quellen: [06_Übung_PCI.pdf]
verweise: [ap1-a1-mainboard, ap1-a1-chipsatz, ap1-a1-grafikkarte, ap1-a2-netzteil]
---

## Profi

### PCI
**PCI** (Peripheral Component Interconnect) wurde **1991 von Intel** vorgestellt (Spezifikation 1.0: 1992) und löste ISA/VLB ab. Eckdaten klassischer PCI: **32 Bit, 33 MHz, 133 MB/s**, später 64 Bit/66 MHz (bis 533 MB/s). Es ist ein **paralleler, geteilter Bus**: Alle Geräte teilen sich die Bandbreite.

**Vorteile gegenüber ISA** (8/16 Bit, 8 MHz, ca. 8–16 MB/s):
1. Deutlich höhere Bandbreite (32 statt 16 Bit, 33 statt 8 MHz)
2. **Plug and Play**: automatische Ressourcenvergabe
3. **Bus-Mastering**: Karten können selbst Daten übertragen, ohne die CPU zu belasten
4. Prozessorunabhängig (über eine Bridge angebunden)
5. **IRQ-Sharing**: mehrere Geräte können sich einen Interrupt teilen
6. Kleinere Karten, 3,3-V-Unterstützung

**Typische PCI-Geräte**: Netzwerkkarten, Soundkarten, TV-/Capture-Karten, SATA-/RAID-Controller, USB-Erweiterungen, WLAN-Karten, serielle Schnittstellenkarten.

**Automatische Ressourcenvergabe**: Jede PCI-Karte hat einen **Configuration Space** (Konfigurationsbereich) mit Hersteller-ID, Geräte-ID und benötigten Ressourcen. Beim Start liest BIOS/UEFI bzw. das Betriebssystem diese Daten aus und vergibt **I/O-Adressen, Speicherbereiche und IRQs** automatisch. Bei ISA musste man das früher per Jumper oder DIP-Schalter von Hand einstellen – Konflikte waren häufig.

### PCI-X
**PCI-X** (PCI eXtended, 1998): Weiterentwicklung für **Server**. 64 Bit, 66–133 MHz (PCI-X 2.0 bis 533 MHz) → bis ca. 1 GB/s (PCI-X 133) bzw. 4,3 GB/s (PCI-X 533). Weiterhin paralleler, geteilter Bus. **Abwärtskompatibel zu PCI**: PCI-Karten laufen in PCI-X-Slots (mit PCI-Geschwindigkeit), 32-Bit-PCI-X-Karten teils auch in PCI-Slots.

**PCI-X vs. PCIe**: Trotz ähnlichem Namen **nicht kompatibel** – PCI-X ist parallel, PCIe seriell, Stecker und Protokoll sind völlig verschieden.

### PCI Express (PCIe)
**PCIe** (2003) ist eine **serielle Punkt-zu-Punkt-Verbindung**:
- Jede Verbindung besteht aus **Lanes**. Eine Lane = zwei differenzielle Leitungspaare: eins zum Senden, eins zum Empfangen → **vollduplex**.
- Jedes Gerät hat eine **eigene Verbindung** (kein geteilter Bus). Mehrere Geräte werden über **Switches** (im Chipsatz oder auf Karten) verbunden.
- Daten werden in **Paketen** übertragen (Transaction Layer, Data Link Layer mit Fehlerkorrektur, Physical Layer).
- Die Lanes werden gebündelt: **x1, x2, x4, x8, x16**. Die Bandbreite skaliert linear.
- **Abwärts- und aufwärtskompatibel**: Eine x1-Karte passt in einen x16-Slot; eine PCIe-5.0-Karte läuft in einem 3.0-Slot (mit 3.0-Geschwindigkeit).

### PCIe-Generationen (Bandbreite je Lane und Richtung)
| Version | Jahr | Transferrate | Kodierung | pro Lane | x16 |
|---|---|---|---|---|---|
| 1.0 | 2003 | 2,5 GT/s | 8b/10b | 250 MB/s | 4 GB/s |
| 2.0 | 2007 | 5 GT/s | 8b/10b | 500 MB/s | 8 GB/s |
| 3.0 | 2010 | 8 GT/s | 128b/130b | ≈ 985 MB/s | ≈ 15,8 GB/s |
| 4.0 | 2017 | 16 GT/s | 128b/130b | ≈ 1,97 GB/s | ≈ 31,5 GB/s |
| 5.0 | 2019 | 32 GT/s | 128b/130b | ≈ 3,94 GB/s | ≈ 63 GB/s |
| 6.0 | 2022 | 64 GT/s | PAM4 + FLIT | ≈ 7,9 GB/s | ≈ 126 GB/s |

**8b/10b** bedeutet: Von 10 übertragenen Bits sind 8 Nutzdaten → 20 % Verlust. **128b/130b** verliert nur ca. 1,5 %.

**Vergleich PCI 3.0 (Bus) und PCIe 3.0**: PCI 3.0 (2002) bietet 133 MB/s (32 Bit/33 MHz) bzw. 266 MB/s (66 MHz) – geteilt. PCIe 3.0 bietet ca. 985 MB/s **pro Lane und Richtung**, bei x16 ca. 15,8 GB/s – exklusiv pro Gerät. Also rund **100-mal** mehr Bandbreite.

### Slotgrößen
Die physische Länge wächst mit den Lanes: x1 (kurz, ca. 25 mm), x4, x8, x16 (ca. 89 mm). Der Kontaktbereich vor der Kerbe ist bei allen gleich (Strom, Steuerung), dahinter kommen die Lanes. **Achtung**: Ein physischer x16-Slot kann **elektrisch nur x4 oder x8** angebunden sein (steht im Handbuch, z. B. „x16 (x4 mode)“). Viele Slots sind hinten offen, damit längere Karten passen.

| Slot | Beispielgerät |
|---|---|
| x1 | Soundkarte, 1/2,5-GbE-Netzwerkkarte, USB-Erweiterung, WLAN |
| x4 | NVMe-SSD-Adapter, 10-GbE-Netzwerkkarte |
| x8 | RAID-Controller/HBA, 25/40-GbE-Netzwerkkarte |
| x16 | Grafikkarte, Mehrfach-NVMe-Adapter |

### Hot-Plug
**Hot-Plug** = Karten/Geräte im laufenden Betrieb einsetzen oder entfernen. PCIe unterstützt das in der Spezifikation; genutzt wird es vor allem in **Servern** (NVMe-SSDs in U.2/E3.S-Schächten, Thunderbolt/USB4-Geräte als externes PCIe). Normale Desktop-Slots sind **nicht** für Hot-Plug ausgelegt.

### Stromversorgung von Grafikkarten
| Quelle | Maximale Leistung |
|---|---|
| PCIe-x16-Slot | 75 W |
| 6-Pin-PCIe-Stecker | 75 W |
| 8-Pin-PCIe-Stecker | 150 W |
| 12VHPWR / 12V-2x6 (16-Pin) | bis 600 W |

Beispiel: Eine High-End-Karte mit 450 W braucht den 16-Pin-Stecker oder mehrere 8-Pin-Stecker **und** ein ausreichend starkes Netzteil (≥ 850–1000 W, ATX 3.x empfohlen). Adapter und schlecht eingesteckte 16-Pin-Stecker sind eine bekannte Brandursache – Stecker immer vollständig einrasten.

### M.2 und NVMe
M.2-SSDs mit **NVMe** nutzen meist **PCIe x4** direkt – daher die hohen Geschwindigkeiten (PCIe 4.0 x4 ≈ 7 GB/s, PCIe 5.0 x4 ≈ 14 GB/s).

## Einfach

Stell dir vor, im Computer wohnen viele Geräte, die mit dem Prozessor sprechen wollen.

**PCI war wie ein Schulflur mit einem einzigen Telefon.** Alle Karten (Soundkarte, Netzwerkkarte …) mussten sich dieses Telefon teilen. Wenn einer lange telefonierte, mussten alle anderen warten. Trotzdem war es ein riesiger Fortschritt: Vorher (ISA) musste man jedem Gerät **von Hand** eine Telefonnummer zuteilen, sonst klingelte es bei zweien gleichzeitig. PCI verteilt die Nummern **automatisch** – das ist **Plug and Play**: einstecken und loslegen.

**PCI-X** war dasselbe Telefon, nur mit einer dickeren Leitung – für große Firmencomputer (Server).

**PCI Express ist wie ein Handy für jeden.** Jedes Gerät hat seine **eigene Leitung** direkt zum Prozessor und muss nicht mehr warten. Außerdem kann man gleichzeitig sprechen und zuhören (vollduplex).

**Lanes sind Fahrspuren.** Eine x1-Karte hat eine Spur, eine Grafikkarte hat 16 Spuren – eine richtige Autobahn! Deshalb sind die Grafikkarten-Steckplätze auch so lang: Mehr Spuren brauchen mehr Kontakte.

**Jede neue PCIe-Version verdoppelt das Tempo** – als würde man das Tempolimit auf jeder Spur verdoppeln. Und das Tolle: Alte Karten passen in neue Steckplätze und umgekehrt, sie fahren dann einfach mit dem langsameren Tempo.

**Hot-Plug** heißt: Man kann etwas einstecken, während der Computer läuft – wie einen USB-Stick. Bei normalen Grafikkarten solltest du das aber **nie** machen!

**Strom für Grafikkarten**: Der Steckplatz liefert nur ein bisschen Strom (75 W). Große Grafikkarten sind richtige Stromfresser und brauchen extra Kabel vom Netzteil – wie ein Elektroauto, das eine eigene Ladesäule braucht.

## Merksatz
- **PCI** = paralleler Bus, geteilt, 133 MB/s.
- **PCIe** = seriell, Punkt-zu-Punkt, vollduplex, Lanes.
- Jede PCIe-Generation **verdoppelt** die Bandbreite.
- Strom: Slot **75**, 6-Pin **75**, 8-Pin **150**, 16-Pin bis **600** W.
- PCI-X ≠ PCIe – nicht kompatibel!

## Prüfungsfalle
- PCI-X und PCI Express verwechseln.
- Physischer x16-Slot ≠ elektrisch x16.
- GT/s ist nicht gleich GB/s – Kodierung und Umrechnung beachten.
- Bandbreite gilt **pro Richtung**; vollduplex = beide Richtungen gleichzeitig.
- Desktop-PCIe-Slots sind nicht hot-plug-fähig.

## Grafik
### Bus vs. Punkt-zu-Punkt
1. Links PCI: Fünf Karten hängen an einer gemeinsamen Leitung; Datenpakete warten in einer Schlange.
2. Rechts PCIe: Jede Karte hat eigene Leitungen zum Root Complex; Pakete fließen gleichzeitig in beide Richtungen.

### Lanes als Autobahn
Slot x1 bis x16 werden als Straßen mit 1–16 Spuren dargestellt; Regler für PCIe-Generation erhöht die Geschwindigkeit der Autos; Anzeige in GB/s.

### Grafikkarten-Strom
Grafikkarte mit Leistungsbalken; Stecker (Slot, 6-Pin, 8-Pin, 16-Pin) werden per Drag & Drop angeschlossen, bis der Bedarf gedeckt ist.

## Karteikarten
- F: Wofür steht PCI? | A: Peripheral Component Interconnect.
- F: Bandbreite klassischer PCI? | A: 32 Bit × 33 MHz ≈ 133 MB/s (geteilt).
- F: Fünf Vorteile von PCI gegenüber ISA? | A: Höhere Bandbreite, Plug and Play, Bus-Mastering, prozessorunabhängig, IRQ-Sharing.
- F: Warum muss man PCI-Geräten keine IRQs mehr manuell zuweisen? | A: Configuration Space + Plug and Play – BIOS/OS vergibt Ressourcen automatisch.
- F: Ist PCI-X mit PCIe kompatibel? | A: Nein – PCI-X ist parallel, PCIe seriell, völlig andere Stecker.
- F: Was ist eine PCIe-Lane? | A: Zwei differenzielle Leitungspaare (Senden/Empfangen) – vollduplex.
- F: Bandbreite PCIe 3.0 pro Lane? | A: Ca. 985 MB/s je Richtung (8 GT/s, 128b/130b).
- F: Bandbreite PCIe 4.0 x16? | A: Ca. 31,5 GB/s je Richtung.
- F: Was bedeutet Hot-Plug? | A: Einsetzen/Entfernen von Geräten im laufenden Betrieb.
- F: Wie viel Watt liefert ein 8-Pin-PCIe-Stecker? | A: 150 W.
- F: Welcher Slot für eine 10-GbE-Karte? | A: Typisch PCIe x4 (je nach Generation).

## Quiz
? Wie viel Leistung kann eine Grafikkarte maximal über Slot plus einen 8-Pin-Stecker beziehen?
* 225 W
- 150 W
- 75 W
- 300 W

? Welche Aussage zu PCIe ist falsch?
* Alle Geräte teilen sich einen gemeinsamen Bus
- Jede Lane ist vollduplex
- Die Bandbreite skaliert mit der Anzahl der Lanes
- Jede Generation verdoppelt ungefähr die Bandbreite

? Eine PCIe-4.0-x16-Grafikkarte steckt in einem PCIe-3.0-x16-Slot. Was passiert?
* Sie funktioniert mit PCIe-3.0-Geschwindigkeit
- Sie passt nicht in den Slot
- Sie funktioniert nicht
- Sie läuft schneller als im 4.0-Slot

? Welche Kodierung verwendet PCIe 1.0 und 2.0?
* 8b/10b
- 128b/130b
- PAM4
- Manchester

? Wofür steht Bus-Mastering?
* Eine Karte kann selbstständig Daten übertragen, ohne die CPU zu belasten
- Die CPU steuert jede Übertragung einzeln
- Mehrere Busse werden zusammengeschaltet
- Der Bus wird übertaktet
