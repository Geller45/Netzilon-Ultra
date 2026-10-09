---
id: ap1-a1-usb
bereich: AP1
block: A1
kapitel: Hardware
titel: USB, FireWire & Thunderbolt
stufe: Einsteiger
quellen: [08_Übung_USB_Firewire.pdf]
verweise: [ap1-a1-pci, ap1-a2-netzteil, ap1-a1-mobilarchitekturen]
---

## Profi

### USB – Universal Serial Bus
USB wurde **1996** eingeführt, um die Vielzahl alter Anschlüsse (seriell, parallel, PS/2, Gameport) durch **eine universelle, hot-plug-fähige Schnittstelle mit Stromversorgung** zu ersetzen. Ziele: Plug and Play, einheitliche Stecker, einfache Bedienung, bis zu **127 Geräte** pro Host-Controller (über Hubs, Baumstruktur).

**Geräteklassen** (Beispiele): HID (Tastatur, Maus, Gamepad), Massenspeicher (USB-Stick, externe SSD), Drucker/Scanner, Audio (Headset, Mikrofon), Video (Webcam), Netzwerk (LAN-/WLAN-Adapter), Smartphones, Ladegeräte, Smartcard-Leser, Hubs/Docks.

### USB-Generationen
| Bezeichnung (aktuell) | Alter Name | Jahr | Datenrate | Marketing |
|---|---|---|---|---|
| USB 1.0/1.1 | – | 1996/98 | 1,5 Mbit/s (Low) / 12 Mbit/s (Full Speed) | – |
| USB 2.0 | – | 2000 | 480 Mbit/s (High Speed) | – |
| USB 3.2 Gen 1 | USB 3.0 / 3.1 Gen 1 | 2008 | 5 Gbit/s (SuperSpeed) | USB 5Gbps |
| USB 3.2 Gen 2 | USB 3.1 Gen 2 | 2013 | 10 Gbit/s | USB 10Gbps |
| USB 3.2 Gen 2x2 | – | 2017 | 20 Gbit/s (nur USB-C) | USB 20Gbps |
| USB4 (v1) | – | 2019 | 40 Gbit/s (nur USB-C) | USB 40Gbps |
| USB4 v2 | – | 2022 | 80 Gbit/s (asymmetrisch 120) | USB 80Gbps |

USB ist **abwärtskompatibel**; es gilt immer die langsamste beteiligte Komponente (Port, Kabel, Gerät).

### Stromversorgung
| Standard | Spannung | Strom | Leistung |
|---|---|---|---|
| USB 2.0 | 5 V | 500 mA | 2,5 W |
| USB 3.x | 5 V | 900 mA | 4,5 W |
| Battery Charging 1.2 | 5 V | 1,5 A | 7,5 W |
| USB-C (Current) | 5 V | 1,5 / 3 A | 7,5 / 15 W |
| **USB Power Delivery** (PD 3.0) | bis 20 V | bis 5 A | bis 100 W |
| USB PD 3.1 EPR | bis 48 V | 5 A | bis **240 W** |

**Zu beachten**: Stromhungrige Geräte (externe 3,5"-Festplatten) brauchen ein eigenes Netzteil oder einen **aktiven Hub** (mit Netzteil). **Passive Hubs** teilen den Strom eines Ports auf alle Geräte. Für mehr als 3 A ist ein **E-Marker-Kabel** nötig. Ein Gerät darf nicht mehr Strom ziehen, als der Port per Aushandlung freigibt; Überlast löst den Überstromschutz aus.

### Bandbreitenteilung
Alle Geräte an einem Root-Hub/Controller teilen sich dessen Bandbreite. Beispiele: Webcam und externe Festplatte am selben USB-2.0-Hub → Webcam ruckelt beim Kopieren; ein USB-2.0-Gerät in einem USB-3.0-Hub nutzt einen Transaction Translator; Audio-Interfaces knacken, wenn gleichzeitig große Datenmengen übertragen werden. Lösung: Geräte auf verschiedene Controller verteilen.

### Host-Controller
| Controller | Standard | Herkunft |
|---|---|---|
| **UHCI** (Universal HCI) | USB 1.x | Intel/VIA – mehr Arbeit in Software |
| **OHCI** (Open HCI) | USB 1.x | Compaq/Microsoft – mehr Logik in Hardware |
| **EHCI** (Enhanced HCI) | USB 2.0 | nur High Speed, braucht Begleit-Controller für USB 1.x |
| **xHCI** (eXtensible HCI) | USB 3.x/4 | heute Standard, unterstützt alle Geschwindigkeiten in einem Controller |

### Transferarten
| Transferart | Eigenschaft | Beispielgerät |
|---|---|---|
| **Control** | Konfiguration, Steuerbefehle | jedes Gerät bei der Anmeldung (Enumeration) |
| **Interrupt** | kleine Datenmengen, garantierte Abfrageintervalle, geringe Latenz | Maus, Tastatur |
| **Bulk** | große Datenmengen, fehlerfrei, aber ohne Zeitgarantie | USB-Stick, Drucker, externe SSD |
| **Isochronous** | garantierte Bandbreite in Echtzeit, keine Wiederholung bei Fehlern | Webcam, Headset, Audio-Interface |

### USB On-The-Go vs. Wireless USB
- **USB OTG**: Ein Gerät (z. B. Smartphone) kann die **Host-Rolle** übernehmen und selbst USB-Sticks, Tastaturen oder Kameras ansteuern.
- **Wireless USB**: Funkstandard (UWB, bis 480 Mbit/s auf 3 m) als kabelloser USB-Ersatz – hat sich nicht durchgesetzt und ist eingestellt.

### Stecker
| Stecker | Merkmale |
|---|---|
| **Typ A** | flach, rechteckig, Host-Seite (PC, Hub) |
| **Typ B** | quadratisch, Geräte-Seite (Drucker); Mini-B/Micro-B für Kleingeräte |
| **Typ C** | klein, **verpolungssicher** (drehsymmetrisch), 24 Pins, für Host und Gerät, unterstützt USB4, Thunderbolt, DisplayPort Alt Mode und PD bis 240 W |

**USB 3.0-Stecker**: Zusätzlich **fünf Kontakte** (zwei differenzielle SuperSpeed-Paare für Senden und Empfangen + Masse) in einer zweiten Reihe; Typ-A-Buchsen meist **blau** markiert. Grund: USB 2.0 ist halbduplex über ein Leitungspaar, SuperSpeed benötigt **getrennte Sende- und Empfangsleitungen (vollduplex)** – bei gleichbleibender Abwärtskompatibilität zu den vier alten Kontakten.

### FireWire (IEEE 1394)
Weitere Namen: **FireWire** (Apple), **i.LINK** (Sony), **Lynx** (Texas Instruments).

- **Peer-to-Peer**: Geräte können **ohne Host** direkt miteinander kommunizieren (z. B. Camcorder → Festplatte). Daisy-Chain bis 63 Geräte.
- **OHCI-Problem**: Der Open Host Controller Interface-Standard für 1394 erlaubt angeschlossenen Geräten **direkten Speicherzugriff (DMA)** auf den Arbeitsspeicher. Angreifer können darüber Speicher auslesen oder manipulieren (DMA-Angriffe, z. B. Passwörter/Schlüssel stehlen, Anmeldung umgehen). Dieselbe Problematik betrifft Thunderbolt → Gegenmaßnahme **Kernel-DMA-Schutz** (IOMMU) in Windows.
- Standards: **FireWire 400** (IEEE 1394a, 400 Mbit/s, 6-/4-Pin), **FireWire 800** (IEEE 1394b, 800 Mbit/s, 9-Pin), S1600/S3200 (kaum verbreitet). Heute **Legacy**.

### Thunderbolt
Von **Intel mit Apple** entwickelt (2011). Bündelt **PCI Express und DisplayPort** (ab TB3 auch USB) in einem Kabel, Daisy-Chain bis 6 Geräte.
| Version | Datenrate | Stecker |
|---|---|---|
| Thunderbolt 1 | 2 × 10 Gbit/s | Mini DisplayPort |
| Thunderbolt 2 | 20 Gbit/s | Mini DisplayPort |
| Thunderbolt 3 | 40 Gbit/s | USB-C |
| Thunderbolt 4 | 40 Gbit/s (strengere Mindestanforderungen: 2 × 4K, PCIe 32 Gbit/s, DMA-Schutz) | USB-C |
| Thunderbolt 5 | 80 Gbit/s (Boost 120) | USB-C |

Einsatz: Docks mit einem Kabel für Monitore, LAN, USB und Laden; externe Grafikkarten (eGPU); schnelle externe SSDs.

## Einfach

Früher hatte jeder Computer hinten ein **Schlüsselbrett voller verschiedener Anschlüsse**: einen für die Maus, einen für die Tastatur, einen breiten für den Drucker … Jeder Stecker sah anders aus. **USB** hat das aufgeräumt: **ein Anschluss für alles** – wie eine Steckdose, in die jedes Gerät passt.

**Einstecken im Betrieb**: Bei USB kannst du Geräte einstecken, während der Computer läuft – er erkennt sie sofort. Früher musste man dafür neu starten.

**USB-Generationen** sind wie Straßen: USB 1 ein Feldweg, USB 2 eine Landstraße, USB 3 eine Autobahn, USB4 eine Rennstrecke. Wichtig: Das langsamste Teil bestimmt das Tempo. Ein altes Kabel an einem neuen Port ist wie ein Feldweg am Anfang der Autobahn.

**Strom über USB**: USB liefert nicht nur Daten, sondern auch Strom – wie eine kleine Steckdose. Ein alter USB-Port gibt nur wenig Strom (genug für eine Maus). Mit **USB-C und Power Delivery** kann man sogar Laptops laden – bis zu 240 Watt! Die Geräte „verhandeln“ vorher, wie viel Strom fließen darf, damit nichts kaputtgeht.

**Die vier Transportarten** sind wie Lieferdienste:
- **Control**: Der Postbote, der beim ersten Klingeln fragt: „Wer bist du, was brauchst du?“
- **Interrupt**: Der Eilbote für kleine Briefe (Mausklicks) – kommt sofort.
- **Bulk**: Der Umzugslaster – bringt viel, aber wann genau, ist egal (Dateien kopieren).
- **Isochronous**: Die Live-Übertragung – muss pünktlich sein, ein verlorenes Stück wird nicht nachgeliefert (Webcam-Bild, Ton).

**USB-C** ist der Stecker, der endlich **in beide Richtungen passt** – kein dreimal Umdrehen mehr!

**FireWire** war der Konkurrent: Geräte konnten direkt miteinander sprechen, ohne einen Computer dazwischen – wie zwei Walkie-Talkies. Aber es gab ein Sicherheitsproblem: Ein Gerät konnte direkt in den Speicher des Computers greifen – wie ein Besucher, der ungefragt in deine Schubladen schaut.

**Thunderbolt** ist das Super-Kabel: Durch ein einziges Kabel fließen Bildschirmsignal, Daten, Netzwerk und Strom. Ein Kabel am Laptop – und Monitor, Tastatur, Maus und Internet sind da.

## Merksatz
- USB-Tempo: **1,5/12 Mbit – 480 Mbit – 5 – 10 – 20 – 40 – 80 Gbit**.
- USB 2.0 = **500 mA**, USB 3.0 = **900 mA**, PD bis **240 W**.
- Transferarten: **C-I-B-I** – Control, Interrupt, Bulk, Isochronous.
- Controller: U/O (USB 1) → E (USB 2) → **x** (USB 3+).
- FireWire braucht **keinen Host**, aber hat **DMA-Risiko**.

## Prüfungsfalle
- USB-C ist ein **Stecker**, kein Geschwindigkeitsstandard.
- USB 3.0 = USB 3.1 Gen 1 = USB 3.2 Gen 1 = 5 Gbit/s.
- Mbit/s und MB/s verwechseln: 480 Mbit/s ≈ 60 MB/s theoretisch.
- Isochronous garantiert Zeit, nicht Fehlerfreiheit; Bulk garantiert Fehlerfreiheit, nicht Zeit.
- Thunderbolt 4 ist nicht schneller als Thunderbolt 3 (beide 40 Gbit/s).

## Grafik
### Anschluss-Chaos → USB
Alte PC-Rückseite mit seriell, parallel, PS/2, Gameport; alle Stecker verschwinden nacheinander und werden durch USB-Ports ersetzt.

### Geschwindigkeits-Rennen
Balkendiagramm wächst logarithmisch von USB 1.0 bis USB4 v2; eine 10-GB-Datei „fliegt“ je Standard und zeigt die theoretische Kopierzeit.

### Transferarten
Vier Fahrzeuge (Postbote, Eilbote, LKW, Live-Übertragungswagen) fahren auf einer USB-Leitung; der Live-Wagen verliert ein Paket und fährt trotzdem weiter.

### USB-C-Stecker
Stecker dreht sich 180° und passt trotzdem; Querschnitt zeigt die symmetrischen 24 Pins.

## Karteikarten
- F: Wofür steht USB? | A: Universal Serial Bus.
- F: Datenrate USB 2.0? | A: 480 Mbit/s (High Speed).
- F: Datenrate USB 3.2 Gen 2? | A: 10 Gbit/s.
- F: Maximale Leistung USB PD 3.1 EPR? | A: 240 W (48 V × 5 A).
- F: Nenne die vier USB-Transferarten. | A: Control, Interrupt, Bulk, Isochronous.
- F: Welche Transferart nutzt eine Webcam? | A: Isochronous (Echtzeit, garantierte Bandbreite).
- F: Was ist USB OTG? | A: On-The-Go – ein Gerät (z. B. Smartphone) übernimmt die Host-Rolle.
- F: Welcher Host-Controller für USB 3? | A: xHCI.
- F: Warum hat der USB-3.0-Stecker zusätzliche Kontakte? | A: Zwei getrennte SuperSpeed-Paare für vollduplex Senden/Empfangen + Masse, abwärtskompatibel.
- F: Andere Namen für IEEE 1394? | A: FireWire (Apple), i.LINK (Sony), Lynx (TI).
- F: Braucht FireWire einen Host? | A: Nein – Peer-to-Peer zwischen Geräten möglich.
- F: Was ist das OHCI/DMA-Problem bei FireWire? | A: Geräte haben direkten Speicherzugriff (DMA) → Angreifer können Speicher auslesen/manipulieren.
- F: Was bündelt Thunderbolt? | A: PCI Express, DisplayPort (und ab TB3 USB) in einem Kabel.

## Quiz
? Welche Datenrate hat USB4 (Version 1)?
* 40 Gbit/s
- 10 Gbit/s
- 480 Mbit/s
- 120 Gbit/s

? Welche Transferart garantiert Fehlerfreiheit, aber keine feste Übertragungszeit?
* Bulk
- Isochronous
- Interrupt
- Streaming

? Wie viel Strom liefert ein USB-2.0-Port standardmäßig?
* 500 mA bei 5 V
- 900 mA bei 5 V
- 3 A bei 20 V
- 100 mA bei 12 V

? Welche Aussage zu USB-C ist richtig?
* USB-C ist ein verpolungssicherer Steckertyp, der verschiedene Standards unterstützen kann
- USB-C garantiert immer 40 Gbit/s
- USB-C ist nur für Stromversorgung gedacht
- USB-C ist identisch mit USB 3.0

? Welches Sicherheitsrisiko betrifft FireWire und Thunderbolt?
* DMA-Angriffe auf den Arbeitsspeicher
- Phishing-Mails
- SQL-Injection
- ARP-Spoofing

? Welche Datenrate hat USB 3.2 Gen 2?
* 10 Gbit/s
- 480 Mbit/s
- 5 Gbit/s
- 40 Gbit/s
! USB 2.0 = 480 Mbit/s, USB 3.2 Gen 1 = 5 Gbit/s, Gen 2x2 = 20 Gbit/s.

? Welche USB-Topologie liegt vor?
* Sterntopologie (Baum über Hubs)
- Ringtopologie
- Bustopologie mit Abschlusswiderständen
- Vermaschte Topologie
! Hubs erweitern den Baum, ein Host-Controller steuert alles.

? Welche Funktion ermöglicht das Laden von Notebooks über USB-C mit höherer Leistung?
* USB Power Delivery (USB PD)
- USB On-The-Go
- DisplayPort Alt Mode
- USB Mass Storage
! USB PD verhandelt Spannung und Strom, z. B. bis 100 W oder mit EPR bis 240 W.
