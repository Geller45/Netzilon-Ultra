---
id: ap1-a1-arbeitsspeicher
bereich: AP1
block: A1
kapitel: Hardware
titel: Arbeitsspeicher (RAM)
stufe: Fortgeschritten
quellen: [05_Übung_Arbeitsspeicher.pdf]
verweise: [ap1-a1-chipsatz, ap1-a1-prozessor, ap1-a1-grafikkarte, ap1-a3-binaerpraefixe]
---

## Profi

### Aufgabe
Der Arbeitsspeicher (RAM, Random Access Memory) hält die **gerade laufenden Programme und ihre Daten** bereit. Er ist deutlich schneller als SSDs/HDDs, aber **flüchtig** (Daten gehen ohne Strom verloren). Technisch ist PC-RAM **DRAM** (Dynamic RAM): Jede Speicherzelle ist ein Kondensator, der regelmäßig aufgefrischt werden muss (Refresh). Caches in der CPU bestehen dagegen aus schnellerem, aber teurerem **SRAM**.

### Physischer vs. virtueller Speicher
- **Physischer Speicher**: die tatsächlich eingebauten Module.
- **Virtueller Speicher**: Jeder Prozess bekommt einen eigenen, großen Adressraum. Die **MMU** der CPU übersetzt virtuelle in physische Adressen (Seitentabellen, Pages à 4 KB). Reicht der RAM nicht, lagert das Betriebssystem selten genutzte Seiten auf den Datenträger aus (**Paging**, Windows: `pagefile.sys`, Linux: Swap). Vorteile: Prozesse sind voneinander isoliert, Programme können mehr Speicher nutzen als physisch vorhanden. Nachteil: Auslagern ist sehr langsam.

### DDR-Generationen
DDR = **Double Data Rate**: Daten werden bei steigender **und** fallender Taktflanke übertragen.

| Generation | Spannung | Transferrate (MT/s) | Besonderheiten |
|---|---|---|---|
| DDR | 2,5 V | 200–400 | 184 Pins |
| DDR2 | 1,8 V | 400–1066 | 4-fach-Prefetch |
| DDR3 | 1,5 V (DDR3L 1,35 V) | 800–2133 | 8-fach-Prefetch |
| DDR4 | 1,2 V | 1600–3200 (OC höher) | 288 Pins, Bankgruppen |
| DDR5 | 1,1 V | 4800–8800+ | Zwei unabhängige 32-Bit-Subkanäle pro Modul, **PMIC** (Spannungswandler) auf dem Modul, On-Die-ECC |

Mit jeder Generation: **höherer Durchsatz, niedrigere Spannung/Verbrauch**, aber die absoluten Zugriffszeiten (in ns) bleiben etwa gleich, weil die Latenzen in Takten steigen. Generationen sind **nicht untereinander kompatibel** (andere Kerbe, andere Spannung).

### Notebook-Speicher
- **SO-DIMM** (Small Outline DIMM): kürzere Module.
- **LPDDR** (Low Power DDR): sehr sparsam, meist **fest verlötet** → nicht aufrüstbar.
- **CAMM2**: neuer, flacher, wechselbarer Standard für Notebooks.

### Grafikspeicher
| Typ | Merkmale |
|---|---|
| GDDR3/GDDR4 | veraltet |
| GDDR5 | lange Standard, bis ca. 8 Gbit/s pro Pin |
| GDDR5X / GDDR6 | 10–20 Gbit/s pro Pin |
| GDDR6X | PAM4-Signalisierung, bis ca. 23 Gbit/s |
| GDDR7 | PAM3, 28–32+ Gbit/s (aktuelle Grafikkarten) |
| HBM | gestapelter Speicher mit sehr breitem Bus, für Rechenzentrums-GPUs/KI |

GDDR ist auf **Bandbreite** optimiert (breite Busse, hohe Taktraten), normaler DDR auf **niedrige Latenz**.

### Geschwindigkeit und Latenzen
Die Gesamtgeschwindigkeit ergibt sich aus: **Transferrate**, **Busbreite** (64 Bit pro Kanal), **Anzahl der Kanäle** und **Latenzen**.

**Wichtige Timings** (in Taktzyklen, z. B. „16-18-18-36“):
| Kürzel | Name | Bedeutung |
|---|---|---|
| **tCL** | CAS Latency | Zeit zwischen Lesebefehl und ersten Daten (Spalte) |
| **tRCD** | RAS-to-CAS Delay | Zeit zwischen Aktivieren einer Zeile und Zugriff auf die Spalte |
| **tRP** | RAS Precharge | Zeit zum Schließen einer Zeile, bevor eine neue geöffnet werden kann |
| **tRAS** | Row Active Time | Mindestzeit, die eine Zeile offen bleiben muss |
| **CR** | Command Rate (1T/2T) | Verzögerung zwischen Auswahl des Chips und erstem Befehl |

Echte Latenz in ns = **CL × 2000 / Transferrate (MT/s)**. Beispiel DDR4-3200 CL16: 16 × 2000 / 3200 = **10 ns**.

In **CPU-Z** (Reiter „SPD“) sieht man pro Modul Hersteller, Größe, Timings-Tabelle und **XMP/EXPO**-Profile (Übertaktungsprofile, die im UEFI aktiviert werden müssen – ohne sie läuft der RAM nur mit Standardtakt).

### Datendurchsatz berechnen
**Durchsatz = Transferrate (MT/s) × Busbreite (Byte) × Kanäle**

- DDR4-3200, ein Kanal: 3200 × 10⁶ × 8 Byte = **25,6 GB/s**
- Dual-Channel: 25,6 × 2 = **51,2 GB/s**
- DDR5-6000, Dual-Channel: 6000 × 8 × 2 = **96 GB/s**

Hinweis: DDR4-3200 hat einen tatsächlichen I/O-Takt von 1600 MHz – durch Double Data Rate ergeben sich 3200 MT/s.

### Dual-Channel
Zwei Speicherkanäle arbeiten **parallel** → Busbreite 2 × 64 Bit = 128 Bit → doppelte theoretische Bandbreite.
- Früher lag der Controller in der **Northbridge**; die Daten mussten zusätzlich über den FSB – der Vorteil verpuffte teils am FSB-Engpass.
- Mit **IMC** in der CPU wirkt Dual-Channel direkt; moderne Desktop-CPUs haben 2 Kanäle, Workstation-CPUs 4–8, Server bis 12.

| Modus | Beispiel | Wirkung |
|---|---|---|
| **Symmetrisch** | 2 × 16 GB in A2 und B2 | voller Dual-Channel über gesamte 32 GB |
| **Asymmetrisch (Flex Mode)** | 16 GB (A) + 8 GB (B) = 24 GB | 16 GB laufen im Dual-Channel (8+8), restliche 8 GB im Single-Channel |
| **Single-Channel** | 1 Modul oder beide im selben Kanal | halbe Bandbreite |

**Gute Kennzeichnung**: eindeutige Beschriftung (A1, A2, B1, B2) direkt auf der Platine plus klare Farbcodes laut Handbuch. **Ungünstig**: Farben ohne Beschriftung – je nach Hersteller bedeutet „gleiche Farbe“ mal „gleicher Kanal“, mal „verschiedene Kanäle“ → Fehlbestückung.

### Memory Remapping
Ein 32-Bit-Adressraum umfasst **4 GiB**. Geräte (Grafikkarte, PCIe, BIOS) belegen einen Teil dieses Bereichs für ihre Register (**MMIO**, Memory Mapped I/O). Der dort liegende RAM wäre unerreichbar. **Memory Remapping** (im UEFI aktivierbar, heute Standard) verschiebt diesen RAM-Teil **oberhalb der 4-GiB-Grenze**. Voraussetzung: 64-Bit-Betriebssystem (bzw. PAE). Deshalb sah ein 32-Bit-Windows bei 4 GB RAM nur ca. 3–3,5 GB.

## Einfach

Stell dir vor, du machst **Hausaufgaben**:
- Dein **Schrank** ist die Festplatte/SSD: Da passt alles rein, aber es dauert, etwas herauszuholen.
- Dein **Schreibtisch** ist der Arbeitsspeicher: Alles, woran du gerade arbeitest, liegt offen da und ist sofort griffbereit.
- Wenn du den Strom ausschaltest (ins Bett gehst), wird der Schreibtisch **leergeräumt**. Deshalb musst du speichern!

**Mehr RAM = größerer Schreibtisch.** Du kannst mehr Bücher gleichzeitig offen haben, ohne ständig zum Schrank zu laufen.

**Virtueller Speicher**: Wenn der Schreibtisch voll ist, legst du Bücher, die du gerade nicht brauchst, auf den Boden neben dem Schrank (Auslagerungsdatei). Das geht, aber jedes Mal bücken dauert – der PC wird langsam.

**DDR-Generationen** sind wie Handy-Generationen: Jede neue ist schneller und braucht weniger Akku. Aber ein DDR5-Riegel passt nicht in einen DDR4-Platz – wie ein neues Ladekabel, das nicht in ein altes Handy passt.

**Dual-Channel**: Stell dir eine Straße zum Schreibtisch vor. Mit zwei Riegeln im richtigen Platz hast du **zwei Spuren** – doppelt so viele Bücher kommen gleichzeitig an. Steckst du beide auf dieselbe Spur, hilft es nichts.

**Latenz (CL)**: Wie lange dauert es, bis du nach einem Buch fragst und es in der Hand hast? Je kleiner die Zahl, desto schneller reagiert der Speicher.

**Grafikspeicher (GDDR)** ist wie ein riesiges Förderband: Es kann unheimlich viele Sachen auf einmal transportieren, weil die Grafikkarte Millionen Bildpunkte gleichzeitig braucht.

**Memory Remapping**: Früher konnte der Computer nur bis 4 GB „zählen“. Ein Stück davon hatten schon andere Geräte reserviert – wie Parkplätze für Lieferwagen. Remapping schiebt deinen Speicher einfach auf Parkplätze weiter hinten, damit nichts verloren geht.

## Merksatz
- RAM = **Schreibtisch**, SSD = **Schrank**.
- Durchsatz = **MT/s × 8 Byte × Kanäle**.
- Latenz in ns = **CL × 2000 ÷ MT/s**.
- CL – RCD – RP – RAS: „**C**hef **R**uft **R**egelmäßig **A**n“.
- Zwei Riegel → verschiedene Kanäle (meist A2 + B2).

## Prüfungsfalle
- „DDR4-3200“ bedeutet 3200 **MT/s**, nicht 3200 MHz Takt.
- Bytes und Bits nicht verwechseln: 64 Bit = 8 Byte Busbreite.
- Asymmetrischer Dual-Channel: nur der gleich große Teil läuft im Dual-Channel.
- XMP/EXPO muss im UEFI aktiviert werden, sonst Standardtakt.
- Höhere CL bei höherem Takt kann trotzdem gleiche echte Latenz bedeuten.

## Grafik
### Schreibtisch-Analogie
Schrank (SSD), Schreibtisch (RAM), Hand (Cache); Bücher wandern animiert; Stoppuhr zeigt die Zeit je Weg.

### Dual-Channel
Straße mit einer Spur → Datenautos stauen sich; Riegel in A2 + B2 stecken → zweite Spur öffnet, Durchsatzanzeige verdoppelt sich. Fehlbestückung (A1 + A2) zeigt wieder nur eine Spur.

### Durchsatz-Rechner (interaktiv)
Regler für DDR-Generation, MT/s und Kanäle; Ergebnis in GB/s und Rechenweg werden live angezeigt.

### Memory Remapping
4-GiB-Balken; oberer Bereich wird von „Grafik/PCIe“ belegt; der verdeckte RAM-Block springt animiert über die 4-GiB-Linie.

## Karteikarten
- F: Warum ist RAM flüchtig? | A: DRAM speichert Bits in Kondensatoren, die ohne Strom und Refresh ihre Ladung verlieren.
- F: Unterschied DRAM und SRAM? | A: DRAM: Kondensator, braucht Refresh, günstig, Arbeitsspeicher. SRAM: Flipflops, kein Refresh, schnell, teuer, Cache.
- F: Was ist virtueller Speicher? | A: Eigener Adressraum je Prozess, MMU übersetzt in physische Adressen; bei Mangel Auslagerung auf Datenträger (pagefile.sys).
- F: Was bedeutet DDR? | A: Double Data Rate – Übertragung bei steigender und fallender Taktflanke.
- F: Spannung DDR4 und DDR5? | A: DDR4 1,2 V, DDR5 1,1 V.
- F: Formel RAM-Durchsatz? | A: Transferrate (MT/s) × Busbreite in Byte (8) × Anzahl Kanäle.
- F: Durchsatz DDR4-3200 Dual-Channel? | A: 3200 × 8 × 2 = 51.200 MB/s = 51,2 GB/s.
- F: Was ist tCL? | A: CAS Latency – Takte zwischen Lesebefehl und Datenausgabe.
- F: Symmetrischer vs. asymmetrischer Dual-Channel? | A: Symmetrisch: gleiche Kapazität pro Kanal, voll Dual-Channel. Asymmetrisch: nur gleich großer Anteil im Dual-Channel, Rest Single-Channel.
- F: Was ist Memory Remapping? | A: Verschiebt durch MMIO verdeckten RAM über die 4-GiB-Grenze, damit er nutzbar bleibt (64-Bit-OS nötig).
- F: Was ist LPDDR? | A: Low-Power-DDR für Notebooks/Smartphones, meist verlötet.

## Quiz
? Wie hoch ist der theoretische Durchsatz von DDR5-4800 im Dual-Channel-Betrieb?
* 76,8 GB/s
- 38,4 GB/s
- 9,6 GB/s
- 4,8 GB/s

? Ein PC hat 16 GB in Kanal A und 8 GB in Kanal B. Wie viel läuft im Dual-Channel?
* 16 GB (je 8 GB pro Kanal)
- 24 GB
- 8 GB
- Nichts, der PC startet nicht

? Wie lang ist die echte Latenz von DDR4-3600 CL18?
* 10 ns
- 18 ns
- 5 ns
- 36 ns

? Welche Aussage zu DDR5 ist richtig?
* Jedes Modul besitzt zwei unabhängige 32-Bit-Subkanäle und einen eigenen Spannungswandler (PMIC)
- DDR5 passt in DDR4-Bänke
- DDR5 arbeitet mit 2,5 V
- DDR5 benötigt keinen Refresh

? Welche Datei nutzt Windows als Auslagerungsspeicher?
* pagefile.sys
- hiberfil.sys
- boot.ini
- ntuser.dat

? Was bedeutet ECC bei Arbeitsspeicher?
* Error Correcting Code – erkennt und korrigiert Einzelbitfehler
- Extra Cache Capacity
- Energy Control Chip
- External Clock Control
! ECC-RAM ist in Servern Standard.

? Was passiert mit dem Inhalt des RAM beim Ausschalten?
* Er geht verloren, weil RAM flüchtig ist.
- Er wird automatisch auf die SSD kopiert.
- Er bleibt dauerhaft erhalten.
- Er wird in die Cloud synchronisiert.
! Ausnahme: Ruhezustand – dann schreibt Windows den Inhalt in hiberfil.sys.

? Welche Bauform wird typischerweise in Notebooks verwendet?
* SO-DIMM
- DIMM in voller Länge
- SIMM
- RIMM
! Small Outline DIMM – kleinere Module für mobile Geräte.
