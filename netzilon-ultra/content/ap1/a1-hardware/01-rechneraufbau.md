---
id: ap1-a1-rechneraufbau
bereich: AP1
block: A1
kapitel: Hardware
titel: Rechneraufbau & Rechnertypen
stufe: Einsteiger
quellen: [01_Übung_Rechneraufbau_allgemein.pdf]
verweise: [ap1-a1-mainboard, ap1-a1-prozessor, ap1-a2-netzteil]
---

## Profi

### Rechnertypen und ihre Hardware-Anforderungen
Welche Hardware ein Rechner braucht, ergibt sich immer aus seinem **Einsatzzweck**. In der Prüfung wird häufig verlangt, für ein Szenario eine passende Konfiguration zu begründen.

| Typ | Einsatz | Typische Hardware | Besonderheit |
|---|---|---|---|
| **Desktop-PC** (Arbeitsplatz) | Office, ERP, Browser | Mittelklasse-CPU (4–8 Kerne), 16 GB RAM, NVMe-SSD, integrierte Grafik | Preis-Leistung, leise, wartungsfreundlich |
| **Thin Client** | Arbeit auf einem Terminalserver/VDI | Sparsame CPU (oft ARM oder Low-Power x86), 4–8 GB RAM, kleiner Flash-Speicher, kein Lüfter | Rechenleistung liegt auf dem Server (RDP, Citrix, VMware Horizon); zentral verwaltbar (z. B. IGEL OS), sehr geringer Stromverbrauch (5–15 W) |
| **HTPC** (Home Theater PC) | Multimedia im Wohnzimmer | Kompaktes Gehäuse (Mini-ITX), Hardware-Videodecoder (HEVC/AV1), HDMI 2.1, leise Kühlung | Geräuscharm, 4K/HDR-Ausgabe, Fernbedienung |
| **Green-PC** | Energieeffizientes Arbeiten | CPU mit niedriger TDP, effizientes Netzteil (80 PLUS Gold/Platinum), SSD statt HDD, keine dedizierte Grafikkarte | Energiesparmodi (ACPI S3/S4), Umweltsiegel (ENERGY STAR, Blauer Engel, TCO Certified) |
| **Gaming-PC** | Spiele, 3D | Starke CPU, dedizierte GPU (hoher Stromverbrauch), 32 GB RAM, schnelle NVMe | Leistungsstarkes Netzteil (750–1000 W), aufwendige Kühlung |
| **Server** | Dienste für viele Clients | Server-CPU(s), ECC-RAM, RAID-Controller, redundante Netzteile | 24/7-Betrieb, Fernwartung, Hot-Swap |

### Energieverbrauch vergleichen
Die Stromkosten berechnet man mit der Formel:

**Kosten = Leistung (kW) × Betriebsstunden (h) × Strompreis (€/kWh)**

Beispiel bei 8 h/Tag, 220 Arbeitstagen, 0,35 €/kWh:

| Rechner | Leistung | kWh/Jahr | Kosten/Jahr |
|---|---|---|---|
| Thin Client | 10 W | 17,6 | 6,16 € |
| Green-PC | 35 W | 61,6 | 21,56 € |
| Desktop-PC | 80 W | 140,8 | 49,28 € |
| Gaming-PC | 400 W | 704 | 246,40 € |

Rechenweg Desktop: 80 W = 0,08 kW → 0,08 × 8 × 220 = 140,8 kWh → × 0,35 € = 49,28 €.

### Server-Besonderheiten
- **ECC-RAM** (Error Correcting Code): erkennt und korrigiert Einzelbitfehler – wichtig bei 24/7-Betrieb.
- **Redundante, hot-swap-fähige Netzteile**: Ein Netzteil kann im laufenden Betrieb getauscht werden.
- **Hot-Swap-Laufwerksschächte** + **RAID-Controller** mit Cache und Batterie-/Flash-Pufferung.
- **Fernwartung** über einen eigenen Controller (BMC): Dell iDRAC, HPE iLO, IPMI – Zugriff auf Konsole, Stromsteuerung, Sensoren auch bei ausgeschaltetem Server.
- **Bauform**: Rack-Server in Höheneinheiten (1 HE = 1 U = 4,445 cm), Tower- oder Blade-Server.

### Multi-Core vs. Multi-CPU
- **Multi-Core** (Desktop): Mehrere Kerne auf **einem** Prozessor. Kerne teilen sich L3-Cache und Speichercontroller → schnelle Kommunikation, günstig.
- **Multi-CPU** (Server): Mehrere **physische Prozessoren** in mehreren Sockeln. Jeder Prozessor hat eigenen Speicher (NUMA – Non-Uniform Memory Access); die CPUs sind über schnelle Verbindungen gekoppelt (Intel UPI, AMD Infinity Fabric). Vorteil: mehr Kerne, mehr RAM-Kanäle, mehr PCIe-Lanes. Nachteil: Zugriff auf den Speicher der anderen CPU ist langsamer, höhere Kosten und höherer Stromverbrauch.

### Kühlung und Temperaturmanagement
- **Desktop**: Luftkühlung (Tower-Kühler auf der CPU, Gehäuselüfter) oder AiO-Wasserkühlung. Der Luftstrom geht meist **von vorne unten nach hinten oben**, weil warme Luft aufsteigt. Das Netzteil sitzt heute meist unten mit eigenem Luftkanal, damit es kühle Luft ansaugt.
- **Server**: Kräftige, redundante Lüfter blasen die Luft **von vorne nach hinten** (front-to-back) durch das flache Gehäuse. Im Rechenzentrum werden **Kalt- und Warmgänge** gebildet, damit sich angesaugte kühle und ausgeblasene warme Luft nicht mischen. Server sind laut, weil Zuverlässigkeit wichtiger ist als Ruhe.
- Die Anordnung im PC folgt dem Luftstrom: Hitzequellen (CPU, GPU, Spannungswandler) liegen im Hauptluftstrom, Kabel werden hinter dem Mainboardträger verlegt, damit sie die Luft nicht blockieren.

### Gehäuse
| Bauform | Typische Maße (H×B×T) | Laufwerksschächte | Mainboards |
|---|---|---|---|
| Mini-ITX-Gehäuse | ca. 25×20×35 cm | 1–2 | Mini-ITX |
| Midi-Tower | ca. 45×21×45 cm | 2–4× 3,5"/2,5" | bis ATX |
| Big-Tower | ca. 55–65×23×55 cm | 6–10+ | bis E-ATX |

### Optische Laufwerke
DVD/Blu-ray spielen kaum noch eine Rolle: Software wird heruntergeladen, Daten liegen in der Cloud oder auf USB-Sticks, Betriebssysteme werden per USB oder Netzwerk (PXE) installiert. Viele Gehäuse haben keine 5,25"-Schächte mehr.

## Einfach

Stell dir vor, Computer sind wie **Autos**. Es gibt nicht „das eine richtige Auto“ – es kommt darauf an, was du damit machen willst.

- Ein **Desktop-PC** ist wie ein normales Familienauto: Er kann alles gut genug, ist nicht zu teuer und fährt jeden Tag zuverlässig zur Arbeit.
- Ein **Thin Client** ist wie ein Taxi-Sitz: Du sitzt drin, aber fahren tut jemand anderes. Der kleine Kasten auf dem Tisch zeigt nur das Bild an – das eigentliche Rechnen macht ein großer Server irgendwo im Keller. Deshalb braucht er fast keinen Strom und ist ganz leise.
- Ein **HTPC** ist das Wohnzimmer-Auto: klein, leise und schick, damit er unter dem Fernseher nicht stört, aber er kann Filme in super Qualität abspielen.
- Ein **Green-PC** ist wie ein Sparauto mit wenig Verbrauch: Er schafft die normale Arbeit, frisst aber kaum Strom.
- Ein **Gaming-PC** ist ein Sportwagen: superschnell, aber durstig und teuer.
- Ein **Server** ist ein Lastwagen, der Tag und Nacht fährt und viele Leute gleichzeitig beliefert. Er hat Ersatzteile gleich eingebaut (zwei Netzteile!), damit er nie stehen bleibt.

**Warum kostet ein Gaming-PC mehr Strom?** Strom rechnet man so: Wie viel „frisst“ das Gerät (Watt) × wie lange läuft es (Stunden) × was kostet eine Einheit Strom. Ein Gaming-PC frisst so viel wie 40 Thin Clients zusammen!

**Mehrere Kerne oder mehrere Prozessoren?** Ein Kern ist wie ein Koch. Ein Multi-Core-Prozessor ist eine Küche mit mehreren Köchen, die sich einen Kühlschrank teilen. Ein Multi-CPU-Server hat mehrere komplette Küchen – jede mit eigenem Kühlschrank. Wenn ein Koch aus dem Kühlschrank der anderen Küche etwas braucht, muss er rüberlaufen. Das dauert länger.

**Warum sind Lüfter so angeordnet?** Warme Luft steigt nach oben – wie beim Heißluftballon. Also holt der PC vorne unten kühle Luft rein und pustet hinten oben die warme Luft raus. Server stehen dicht an dicht im Schrank und pusten alle von vorne nach hinten, wie Autos auf einer Einbahnstraße.

**Warum keine DVD-Laufwerke mehr?** Früher kamen Programme auf Scheiben. Heute lädt man alles aus dem Internet – die Scheibe ist wie eine Kassette: nett, aber keiner braucht sie mehr.

## Merksatz
- Erst der Zweck, dann die Hardware.
- Kosten = kW × Stunden × Preis – Watt immer erst durch 1000 teilen!
- Server: ECC, zwei Netzteile, Hot-Swap, Fernwartung – „nie stehen bleiben“.
- Warme Luft nach oben und hinten raus.

## Prüfungsfalle
- Watt nicht in kW umgerechnet → Ergebnis um Faktor 1000 falsch.
- Thin Client ≠ schwacher PC: Die Rechenleistung liegt auf dem Server.
- TDP ist nicht der Stromverbrauch des ganzen PCs.
- Multi-Core und Multi-CPU verwechseln: Kerne auf einem Chip vs. mehrere Sockel.

## Grafik
### Stromkosten-Rechner
1. Vier Rechner-Symbole erscheinen nebeneinander (Thin Client, Green-PC, Desktop, Gaming).
2. Unter jedem füllt sich ein Stromzähler; das Rad dreht sich unterschiedlich schnell.
3. Balken wachsen bis zu den Jahreskosten; die Formel blendet sich Schritt für Schritt ein.

### Luftstrom
1. Seitlicher Querschnitt eines Midi-Towers.
2. Blaue Pfeile strömen vorne unten hinein, werden über CPU/GPU rot und verlassen hinten oben das Gehäuse.
3. Umschalten auf Server-Rack: Kaltgang vorne (blau), Warmgang hinten (rot).

## Karteikarten
- F: Wo liegt die Rechenleistung bei einem Thin Client? | A: Auf dem Terminalserver bzw. in der VDI – der Thin Client zeigt nur an und nimmt Eingaben entgegen.
- F: Formel für Stromkosten? | A: Leistung in kW × Betriebsstunden × Preis pro kWh.
- F: Was bedeutet ECC-RAM? | A: Error Correcting Code – erkennt und korrigiert Einzelbitfehler im Arbeitsspeicher.
- F: Nenne drei typische Server-Merkmale. | A: ECC-RAM, redundante Hot-Swap-Netzteile, Fernwartung (iDRAC/iLO/BMC), RAID-Controller, Rackformat.
- F: Unterschied Multi-Core und Multi-CPU? | A: Multi-Core: mehrere Kerne auf einem Prozessor. Multi-CPU: mehrere physische Prozessoren in mehreren Sockeln (NUMA).
- F: Was ist NUMA? | A: Non-Uniform Memory Access – jede CPU hat eigenen Speicher; Zugriff auf fremden Speicher ist langsamer.
- F: Wie ist der Luftstrom in einem Server? | A: Front-to-back, im Rechenzentrum mit Kalt- und Warmgängen.
- F: Wie hoch ist eine Höheneinheit (HE/U)? | A: 1,75 Zoll = 4,445 cm.
- F: Nenne zwei Umweltsiegel für Green-IT. | A: ENERGY STAR, Blauer Engel, TCO Certified, 80 PLUS (Netzteile).

## Quiz
? Ein PC mit 120 W läuft 10 h täglich an 250 Tagen, Strompreis 0,30 €/kWh. Wie hoch sind die Kosten pro Jahr?
* 90,00 €
- 9.000,00 €
- 30,00 €
- 360,00 €

? Welche Komponente ist für einen Thin Client typisch?
* Lüfterlose, sparsame CPU mit wenig lokalem Speicher
- Dedizierte High-End-Grafikkarte
- ECC-RAM mit 256 GB
- RAID-5 mit vier Festplatten

? Wofür steht die Abkürzung BMC im Serverumfeld?
* Baseboard Management Controller für die Fernwartung
- Backup Media Controller für Bandlaufwerke
- Basic Memory Cache der CPU
- Boot Manager Configuration im UEFI

? Warum ist der Speicherzugriff in Multi-CPU-Systemen teilweise langsamer?
* Weil jede CPU eigenen Speicher hat und der Zugriff auf den Speicher der anderen CPU über eine Verbindung laufen muss (NUMA)
- Weil sich alle CPUs einen einzigen L1-Cache teilen
- Weil Server-RAM grundsätzlich langsamer getaktet ist
- Weil nur eine CPU gleichzeitig arbeiten darf

? Wie wird ein Rechenzentrum sinnvoll klimatisiert?
* Mit getrennten Kalt- und Warmgängen
- Indem alle Server nach oben ausblasen
- Durch offene Fenster
- Indem Server abwechselnd vorwärts und rückwärts eingebaut werden

? Welche Aufgabe hat das Steuerwerk in einem Von-Neumann-Rechner?
* Es holt und dekodiert Befehle und steuert den Ablauf der anderen Komponenten.
- Es führt arithmetische Berechnungen aus.
- Es speichert dauerhaft Daten.
- Es wandelt Wechselspannung in Gleichspannung um.
! Rechenwerk (ALU) rechnet, Steuerwerk steuert, Speicher hält Befehle und Daten.

? Welcher Rechnertyp ist für den Einbau in einen 19-Zoll-Serverschrank vorgesehen?
* Rack-Server
- Tower-PC
- Thin Client
- All-in-One-PC
! Rack-Server werden in Höheneinheiten (HE/U) angegeben, z. B. 1 HE = 44,45 mm.

? Was beschreibt das EVA-Prinzip?
* Eingabe, Verarbeitung, Ausgabe
- Energie, Verbrauch, Abwärme
- Erfassen, Verteilen, Archivieren
- Ethernet, VLAN, Adressierung
! Jede Datenverarbeitung folgt diesem Grundmuster.
