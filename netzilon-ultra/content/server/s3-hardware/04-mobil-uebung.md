---
id: server-hw-mobil-uebung
bereich: AP1
pruefungen: [AP1, Schule]
fach: ITK / Grundlagen
block: S3
kapitel: Hardware
titel: Mobilarchitekturen (ARM) – Folien und Übung 17 komplett gelöst
stufe: Fortgeschritten
typ: uebung
quellen: [17_Mobilarchitekturen.pdf, 17_Übung_Mobilarchitekturen.pdf]
verweise: [ap1-a1-mobilarchitekturen, ap1-a1-prozessor, server-hw-displays-uebung]
---

## Profi

Die Theorie steht im Thema **Mobilarchitekturen (ARM)** (ap1-a1-mobilarchitekturen). Hier Folien-Kernaussagen und die Lösungen zu Übung 17 (die Übung hat keine Aufgabe 9). Stand der Recherche-Antworten: Herbst 2026.

### Folien kompakt
- **ARM** = *Advanced RISC Machines* (ursprünglich *Acorn RISC Machine*), britisches Unternehmen, **1990** als Joint Venture aus der CPU-Sparte von **Acorn** (mit Apple und VLSI) entstanden; Apple hielt zeitweise **43 %**. Heute im Mehrheitsbesitz von **SoftBank**, seit 2023 wieder an der Börse (Nasdaq).
- Geschäftsmodell: ARM **fertigt keine Chips**, sondern **lizenziert**: **Core-Lizenz** (fertiges Design, z. B. Cortex-A) oder **Architektur-Lizenz** (eigene Kerne auf Basis des Befehlssatzes – Apple, Qualcomm, früher Samsung).
- Fertiger: **TSMC** (Taiwan, Auftragsfertiger für „fabless“ Firmen, Hauptlieferant Apple), **Samsung** (eigene Exynos + Auftragsfertigung), **Qualcomm** ist selbst **fabless** (Snapdragon, starke Position bei Modems/Basebands).
- Technik: **RISC** (wenige, einfache, gleich lange Befehle), **Load/Store-Architektur**, viele Register, sehr **niedrige Leistungsaufnahme**, **Conditional Execution** (bedingte Befehlsausführung spart Sprünge und Pipeline-Leerungen, bei AArch64 stark reduziert), **SoC**-Bauweise (CPU, GPU, NPU, Modem, ISP auf einem Chip). Nicht x86-kompatibel.
- SoC-Bausteine (Folie): **NEON** (SIMD/Multimedia), **FPU** (Gleitkomma), **ACP** (Accelerator Coherency Port, Beschleuniger-Anbindung), **SCU** (Snoop Control Unit, Cache-Kohärenz der Kerne), **CoreSight** (Debug/Trace), **AMBA** (Busarchitektur).
- Generationen: ARMv1 (1985) … **ARMv7** (32 Bit), **ARMv8-A** (2011 angekündigt, 64 Bit **AArch64**), **ARMv9-A** (2021, SVE2, Confidential Compute).
- **big.LITTLE**: Hochleistungs- und Stromsparkerne kombiniert; Varianten **Cluster Switching**, **In-Kernel Switcher (IKS)**, **HMP** (Heterogeneous Multi-Processing, alle Kerne gleichzeitig nutzbar); Nachfolger **DynamIQ** (gemischte Kerne in einem Cluster).

## Einfach

Ein ARM-Prozessor ist wie ein **sparsames E-Bike**, ein großer x86-Desktop-Prozessor wie ein **Sportwagen**. Der Sportwagen ist bei Vollgas schneller, schluckt aber viel Sprit. Das E-Bike kommt mit einem winzigen Akku sehr weit – deshalb steckt ARM in **Handys, Tablets, Smartwatches, Fernsehern und sogar Waschmaschinen**.

ARM selbst **baut keine Fahrräder**, sondern **verkauft Baupläne**. Apple, Samsung oder Qualcomm kaufen die Pläne und bauen daraus ihre eigenen Räder.

**big.LITTLE** ist wie ein Team aus **Gewichthebern und Marathonläufern**: Für schwere Arbeit (ein Spiel) springen die starken Kerne ein, für leichte Arbeit (Nachrichten abrufen) die sparsamen. So hat man Kraft, wenn man sie braucht, und spart sonst Akku.

## Merksatz
- **ARM = RISC + sparsam + Lizenzmodell.**
- **ARM lizenziert, TSMC/Samsung fertigen.**
- **big.LITTLE: stark + sparsam, HMP = alle gleichzeitig.**
- **v7 = 32 Bit, v8 = 64 Bit, v9 = aktuell.**

## Prüfungsfalle
- **Quellenfehler korrigiert:** Die Folie schreibt „ARMv7 Cortex-A57“ – der **Cortex-A57 ist ARMv8-A** (64 Bit). Beim Exynos 9820 sind die großen Kerne Samsungs **Eigenentwicklung „M4“ (Mongoose)**, kein „Cortex-M4“ (Cortex-M ist die Mikrocontroller-Serie).
- „Octa-Core“ bei big.LITTLE heißt nicht acht gleich starke Kerne.
- Benchmarks messen oft nur die schnellen Kerne.
- „ASIC statt UIC“ (Folie) meint: anwendungsspezifische SoCs statt Universal-CPUs mit vielen Zusatzchips.

## Grafik
### HMP-Lastverteilung
1. Scheduler: Nachrichten-App im Hintergrund
2. Scheduler -> LITTLE-Kern: leichte Last, wenig Strom
3. Scheduler: Spiel startet
4. Scheduler -> big-Kern: hohe Last, volle Leistung
5. Scheduler: beide Cluster laufen gleichzeitig (HMP)

## Übungen
- A: 1. Wichtige Fakten zur Firma ARM | L: Britisch (Cambridge), 1990 aus Acorns CPU-Sparte (Joint Venture mit Apple/VLSI) entstanden, Apple hielt zeitweise 43 %, entwickelt und lizenziert CPU-/GPU-Designs (Cortex, Mali, Neoverse) statt selbst zu fertigen; seit 2016 SoftBank, seit 2023 an der Nasdaq; Gewinne durch das Smartphone-Segment massiv gestiegen.
- A: 2. Zehn Geräteklassen mit ARM-Chips | L: Smartphones, Tablets, Smartwatches/Wearables, Smart-TVs/Set-Top-Boxen, Router/Netzwerkgeräte, Autos (Infotainment, Steuergeräte), Spielekonsolen (Nintendo Switch), Laptops (Apple M-Serie, Snapdragon X), Server/Cloud (AWS Graviton, Azure Cobalt), Haushaltsgeräte/IoT (Waschmaschine, Smart Home), Raspberry Pi, Drucker, Geldautomaten/Kontoauszugsdrucker, Taschenrechner.
- A: 3. Bedeutung von „ARMv7 Cortex-A15“ | L: ARMv7 = Architektur-/Befehlssatzgeneration (32 Bit), Cortex = Prozessorfamilie, A = Application-Profil (für Betriebssysteme und Apps; R = Realtime, M = Microcontroller), 15 = Modell innerhalb der Serie (höher = leistungsfähiger/neuer). Beispiel: Samsung Exynos 5 Octa, Nvidia Tegra 4.
- A: 4. Technische Eigenarten der ARM-Architektur | L: RISC mit festen Befehlslängen, Load/Store-Prinzip, viele Allzweckregister, Conditional Execution, Thumb-Befehlssatz für kompakten Code, NEON-SIMD, sehr geringer Stromverbrauch, SoC-Integration, nicht x86-kompatibel (Emulation nötig, z. B. Rosetta 2, Prism unter Windows on ARM).
- A: 5. Was ist big.LITTLE? | L: Kombination leistungsstarker und stromsparender Kerne in einem SoC (z. B. 4 × A57 + 4 × A53); je nach Last wird zwischen ihnen gewechselt (Cluster Switching, IKS) oder beide arbeiten gleichzeitig (HMP). Nachfolger DynamIQ mischt Kerntypen in einem Cluster (z. B. 1+3+4).
- A: 6. Wie vergleichbar ist ARM-Leistung mit modernen x64-CPUs? | L: Direkte Vergleiche sind schwierig (andere Architektur, TDP, Software). Pro Watt ist ARM meist deutlich effizienter; Spitzen-ARM-SoCs (Apple M4/M5, Snapdragon X Elite) erreichen in Single-Thread-Benchmarks das Niveau aktueller Desktop-x64-CPUs, bei Multi-Core-Workstation-Lasten liegen große x64-CPUs mit hoher TDP vorn.
- A: 7. Eigenarten von Snapdragon, Exynos und MediaTek | L: Snapdragon (Qualcomm, USA): eigene Kryo/Oryon-Kerne, Adreno-GPU, integrierte Modems, Premium-Android und Windows on ARM. Exynos (Samsung, Korea): in eigenen Galaxy-Geräten, Mali- bzw. Xclipse-GPU (AMD RDNA), Fertigung im eigenen Werk. MediaTek (Taiwan): Dimensity-Serie, sehr gutes Preis-Leistungs-Verhältnis, Mali-/Immortalis-GPU, viele Mittelklasse- und inzwischen auch Flaggschiff-Geräte.
- A: 8. Je eine mobile Konsole, ein Smartphone und ein TV mit ARM-Chipsatz | L: Beispiel Konsole: Nintendo Switch (Nvidia Tegra X1, 4 × Cortex-A57 + 4 × A53, Maxwell-GPU 256 CUDA-Kerne); Nachfolger Switch 2 (Nvidia T239, 8 × Cortex-A78C, Ampere-GPU). Smartphone: Apple iPhone 16 (A18, ARMv9, 2 Performance- + 4 Effizienzkerne, 6-Kern-GPU, 16-Kern-NPU). TV: LG OLED mit α9-Prozessor (ARM-basierter SoC unter webOS). Werte je nach Recherche ergänzen.
- A: 10. Besonderheiten des Nvidia Tegra X1 | L: 2015, 20 nm, 4 × Cortex-A57 + 4 × Cortex-A53 (big.LITTLE, in der Switch nur die A57 aktiv), Maxwell-GPU mit 256 CUDA-Kernen (erste Teraflop-Klasse bei FP16), 4K-Videodekodierung; eingesetzt in Nvidia Shield TV, Nintendo Switch, Google Pixel C.
- A: 11. ARM-Daten zum eigenen Smartphone | L: Vorgehen: Modell in den Einstellungen nachsehen („Über das Telefon“), Daten per App (CPU-Z, AIDA64, Geekbench) oder Datenblatt ermitteln: SoC-Name, Architektur (ARMv8/v9), Kernanzahl und -typen (z. B. 1 × X4, 3 × A720, 4 × A520), Takt, Fertigungsprozess (nm), GPU, RAM.
- A: 12. Erwartbare ARM-Entwicklungen | L: ARMv9 mit SVE2 und KI-Erweiterungen, mehr NPUs für lokale KI, ARM-Laptops mit Windows (Snapdragon X) und macOS, ARM-Server in der Cloud (Graviton, Cobalt, Nvidia Grace), Automotive, eigene ARM-Chipdesigns; Konkurrenz durch die offene Architektur RISC-V.

## Karteikarten
- F: Wofür steht ARM heute? | A: Advanced RISC Machines
- F: Fertigt ARM selbst Chips? | A: Nein, ARM lizenziert Designs und Befehlssätze
- F: Core- vs. Architektur-Lizenz? | A: Core: fertige Kerne übernehmen; Architektur: eigene Kerne auf Basis des ARM-Befehlssatzes
- F: Welche Generation brachte 64 Bit? | A: ARMv8-A (AArch64)
- F: Bedeutung des „A“ in Cortex-A? | A: Application-Profil für Betriebssysteme und Anwendungen
- F: Was ist HMP bei big.LITTLE? | A: Heterogeneous Multi-Processing – alle Kerne können gleichzeitig arbeiten
- F: Was ist NEON? | A: SIMD-Erweiterung für Multimedia
- F: Welcher Chip steckt in der ersten Nintendo Switch? | A: Nvidia Tegra X1
- F: Welche Firma ist größter Auftragsfertiger für ARM-Chips? | A: TSMC (Taiwan)
- F: Was ist ein SoC? | A: System on a Chip – CPU, GPU, Speichercontroller, Modem usw. auf einem Chip

## Quiz
? Was ist das Geschäftsmodell von ARM?
* Lizenzierung von Prozessordesigns und Befehlssätzen
- Fertigung eigener Smartphones
- Betrieb von Chipfabriken
- Verkauf von Betriebssystemen

? Zu welcher Architekturgeneration gehört der Cortex-A57?
* ARMv8-A
- ARMv7
- ARMv5
- ARMv6

? Was beschreibt big.LITTLE?
* Kombination aus leistungsstarken und stromsparenden Kernen
- Zwei identische Kerne mit gleichem Takt
- Eine GPU mit zwei Speichern
- Ein x86-Emulator

? Welcher Hersteller ist „fabless“?
* Qualcomm
- TSMC
- Samsung Foundry
- Intel Foundry

? Wofür steht das „M“ in Cortex-M?
* Microcontroller
- Mobile
- Multimedia
- Mainframe

? Welche Aussage zu ARM gegenüber x86 ist richtig?
* ARM ist RISC-basiert und meist energieeffizienter pro Watt
- ARM ist binärkompatibel zu x86
- ARM nutzt immer CISC-Befehle
- ARM unterstützt kein 64 Bit

? Welche GPU hat der Tegra X1?
* Nvidia Maxwell mit 256 CUDA-Kernen
- AMD RDNA 2
- ARM Mali-G78
- Adreno 740

? Was macht die Snoop Control Unit (SCU)?
* Sie hält die Caches der Kerne kohärent und bindet sie an das Speicherinterface
- Sie berechnet Gleitkommazahlen
- Sie ist das Modem
- Sie steuert das Display

## Spickzettel
- ARM: britisch, 1990 aus Acorn, Lizenzmodell, SoftBank
- RISC, Load/Store, sparsam, SoC; v7 32 Bit, v8 64 Bit, v9 aktuell
- Cortex-A Apps, -R Echtzeit, -M Microcontroller
- big.LITTLE: CS, IKS, HMP → DynamIQ
- Fertiger TSMC/Samsung; Snapdragon, Exynos, MediaTek, Apple A/M
- Tegra X1: 4×A57+4×A53, Maxwell 256 CUDA, Switch
