---
id: ap1-a1-mobilarchitekturen
bereich: AP1
block: A1
kapitel: Hardware
titel: Mobilarchitekturen (ARM)
stufe: Fortgeschritten
quellen: [17_Übung_Mobilarchitekturen.pdf]
verweise: [ap1-a1-prozessor, ap1-a1-grafikkarte, ap1-a1-displays]
---

## Profi

### Die Firma ARM
- Ursprung: **Acorn RISC Machine** (Acorn Computers, 1985). 1990 als **Advanced RISC Machines Ltd.** in Cambridge (UK) ausgegründet (Acorn, Apple, VLSI).
- **Geschäftsmodell**: ARM stellt **keine Chips her**, sondern **lizenziert** Architektur und fertige Kern-Designs (IP) an andere Firmen (Apple, Qualcomm, Samsung, MediaTek, NVIDIA …). Diese entwickeln daraus eigene **SoCs** (System on a Chip) und lassen sie bei Auftragsfertigern (TSMC, Samsung Foundry) produzieren.
- Seit 2016 mehrheitlich im Besitz von **SoftBank**, 2023 Börsengang (Nasdaq).
- ARM-Chips sind die meistverkauften Prozessoren der Welt (weit über 250 Milliarden Stück).

### Geräteklassen mit ARM
Smartphones, Tablets, Smartwatches, Notebooks (Apple M-Serie, Snapdragon X), Smart-TVs/Streaming-Boxen, Spielkonsolen (Nintendo Switch), Router/Access Points, Autos (Infotainment, Steuergeräte), Einplatinencomputer (Raspberry Pi), Server/Cloud (AWS Graviton, Ampere, NVIDIA Grace), IoT-Sensoren/Mikrocontroller, Festplatten-/SSD-Controller, Drucker.

### Modellbezeichnung „ARMv7 Cortex-A15“
| Teil | Bedeutung |
|---|---|
| **ARMv7** | Version der **Befehlssatzarchitektur** (ISA) – ARMv7 = 32 Bit, ARMv8 = 64 Bit (AArch64), aktuell **ARMv9** |
| **Cortex** | Produktfamilie der ARM-Kerndesigns |
| **A** | Profil: **A**pplication (Smartphones/Rechner, mit MMU für Betriebssysteme), **R** = Real-time (Steuergeräte, SSD-Controller), **M** = Microcontroller (IoT, Sensoren) |
| **15** | Modellnummer innerhalb des Profils (höher = meist leistungsfähiger/neuer) |

Heutige Beispiele: Cortex-X925, Cortex-A725, Cortex-A520 (ARMv9.2). Apple und Qualcomm entwickeln eigene Kerne auf Basis der ARM-**Architekturlizenz** (z. B. Apple Firestorm, Qualcomm Oryon).

### Technische Eigenarten
- **RISC** (Reduced Instruction Set Computer): wenige, einfache Befehle mit **fester Befehlslänge** → einfacher zu dekodieren, effizient in einer Pipeline. Gegenstück: **CISC** bei x86 (viele, komplexe Befehle variabler Länge).
- **Load/Store-Architektur**: Rechnen nur in Registern; Speicherzugriffe nur über eigene Lade-/Speicherbefehle.
- Viele Allzweckregister (AArch64: 31).
- **Energieeffizienz** durch einfache Kerne, niedrige Taktraten, aggressive Energiesparzustände.
- Erweiterungen: **NEON** (SIMD), SVE/SVE2 (skalierbare Vektoren), TrustZone (Sicherheitsbereich), Thumb (kompakter 16-Bit-Befehlssatz, ARMv7).
- Alles auf einem Chip: **SoC** mit CPU, GPU (Mali, Adreno, Apple GPU), NPU, Modem, Bildprozessor (ISP), Speicher-Controller.

### big.LITTLE
Kombination von **leistungsstarken („big“) und energiesparenden („LITTLE“) Kernen** auf einem Chip. Der Scheduler verteilt Aufgaben: Hintergrundarbeit (E-Mails abrufen, Musik) auf LITTLE-Kerne, anspruchsvolle Aufgaben (Spiele, Kamera) auf big-Kerne. Ergebnis: lange Akkulaufzeit bei hoher Spitzenleistung. Weiterentwicklung **DynamIQ** erlaubt flexible Cluster (z. B. 1 Prime + 3 Performance + 4 Efficiency). Das Prinzip hat Intel mit P- und E-Cores übernommen.

### ARM vs. x64
Früher galt ARM als sparsam, aber deutlich langsamer. Heute sind High-End-ARM-Chips (Apple M-Serie, Snapdragon X Elite) in vielen Aufgaben **gleichauf mit modernen x64-CPUs** – bei deutlich **besserer Leistung pro Watt**. Grenzen: Software muss für ARM kompiliert sein, sonst **Emulation** (Windows: Prism, macOS: Rosetta 2) mit Leistungseinbußen; Treiber und manche Spiele/Anti-Cheat fehlen teils. Im Server-Bereich punkten ARM-Chips mit vielen Kernen bei geringem Verbrauch.

### Wichtige SoC-Familien
| Familie | Hersteller | Eigenarten |
|---|---|---|
| **Snapdragon** | Qualcomm | integriertes Mobilfunkmodem, **Adreno**-GPU, starke Oberklasse, auch Notebooks (Snapdragon X) |
| **Exynos** | Samsung | teils in Samsung-Geräten, GPU Mali bzw. Xclipse (AMD RDNA-Basis), eigene Fertigung |
| **Dimensity / Helio** | MediaTek | sehr gutes Preis-Leistungs-Verhältnis, Marktführer nach Stückzahlen, stark in der Mittelklasse, auch High-End |
| **Apple A/M** | Apple | eigene Kerne, sehr hohe Einzelkernleistung, einheitlicher Speicher (Unified Memory) |
| **Tensor** | Google | Fokus auf KI-Funktionen (TPU) |

### NVIDIA Tegra X1
- 2015 vorgestellt, **4 × Cortex-A57 + 4 × Cortex-A53** (big.LITTLE-Anordnung), **Maxwell-GPU mit 256 CUDA-Kernen**, 20 nm.
- Besonderheit: Desktop-GPU-Architektur in einem mobilen SoC → für damalige Verhältnisse sehr hohe Grafikleistung, CUDA-fähig.
- Eingesetzt in der **Nintendo Switch**, NVIDIA Shield TV und Jetson-Entwicklerboards (autonome Systeme).

### Ausblick
ARMv9 mit Sicherheitsfunktionen (Confidential Compute, Memory Tagging), größere **NPUs** für lokale KI, weiterer Vormarsch in **Notebooks (Windows on ARM, Copilot+ PCs)** und **Rechenzentren**, Chiplets. Konkurrenz entsteht durch die offene Architektur **RISC-V** (lizenzfrei).

## Einfach

Die meisten großen Computer haben einen **x86-Prozessor** (Intel oder AMD). Fast alle Handys haben einen **ARM-Prozessor**.

**Was macht ARM besonders?** Die Firma ARM baut selbst **keine Chips**. Sie ist wie ein **Architekt**, der Baupläne für Häuser verkauft. Apple, Samsung oder Qualcomm kaufen den Bauplan, ändern ihn nach ihren Wünschen und lassen das Haus dann von einer Baufirma bauen.

**RISC vs. CISC**: ARM spricht eine **einfache Sprache** mit wenigen, kurzen Wörtern (RISC). x86 spricht eine **komplizierte Sprache** mit vielen langen Wörtern (CISC). Die einfache Sprache versteht der Prozessor schneller und mit weniger Kraft – deshalb hält der Handy-Akku so lange.

**big.LITTLE** ist wie ein Team aus **Gewichthebern und Marathonläufern**: Für schwere Arbeit (ein Spiel) springen die Gewichtheber ein, für leichte Arbeit im Hintergrund (Nachrichten abrufen) die sparsamen Läufer. So hat man Kraft, wenn man sie braucht, spart aber sonst Energie.

**SoC – System on a Chip**: Bei einem PC sind Prozessor, Grafik und Netzwerk einzelne Teile. Beim Handy ist **alles auf einem einzigen Chip** – wie ein Schweizer Taschenmesser statt eines ganzen Werkzeugkastens.

**Der Name „ARMv7 Cortex-A15“** ist wie ein Autoname: ARMv7 ist die Generation, Cortex die Modellreihe, A heißt „für normale Anwendungen“ und 15 ist die Modellnummer.

**Ist ARM heute stark genug?** Ja! Die Chips in neuen MacBooks oder Windows-Laptops mit Snapdragon sind so schnell wie normale PC-Prozessoren – brauchen aber viel weniger Strom. Nur manche alte Programme müssen „übersetzt“ werden (Emulation), was etwas bremst.

**Nintendo Switch**: Darin steckt ein ARM-Chip von NVIDIA (Tegra X1) – mit einer richtigen kleinen Grafikkarte drin.

## Merksatz
- ARM **lizenziert**, baut nicht selbst.
- **RISC** = wenige einfache Befehle, feste Länge → sparsam.
- Profile: **A**pplication, **R**eal-time, **M**icrocontroller → „ARM hat ARM“.
- big.LITTLE = **stark + sparsam** gemischt.
- SoC = **alles auf einem Chip**.

## Prüfungsfalle
- ARM ist kein Chiphersteller, sondern Lizenzgeber.
- ARMv7/ARMv8 ist die Architektur, Cortex-A15 das Kerndesign – nicht verwechseln.
- ARM-Software läuft nicht automatisch auf x86 und umgekehrt (Emulation nötig).
- big.LITTLE ist kein Hyper-Threading.

## Grafik
### Architekt-Modell
ARM zeichnet einen Bauplan; Pfeile verteilen Kopien an Apple, Qualcomm, Samsung, MediaTek; jeder baut ein anderes Haus (SoC); eine Fabrik (TSMC) produziert.

### big.LITTLE-Scheduler
Aufgabenkarten (Musik, Chat, 3D-Spiel, Kamera) fallen von oben; der Scheduler sortiert sie auf kleine grüne oder große orange Kerne; Akkuanzeige reagiert.

### RISC vs. CISC
Links kurze gleich lange Befehlsblöcke laufen gleichmäßig durch eine Pipeline, rechts unterschiedlich lange Blöcke stauen sich vor dem Decoder.

## Karteikarten
- F: Wie verdient ARM Geld? | A: Durch Lizenzen für Architektur und Kern-Designs – ARM fertigt keine Chips selbst.
- F: Nenne fünf Geräteklassen mit ARM. | A: Smartphones, Tablets, Smartwatches, Router, Smart-TVs, Konsolen, Autos, Raspberry Pi, Server, IoT.
- F: Was bedeutet „A“ in Cortex-A? | A: Application-Profil (für Betriebssysteme mit MMU); R = Real-time, M = Microcontroller.
- F: Was ist RISC? | A: Reduced Instruction Set Computer – wenige, einfache Befehle fester Länge.
- F: Was ist big.LITTLE? | A: Kombination leistungsstarker und energiesparender Kerne auf einem Chip.
- F: Was ist ein SoC? | A: System on a Chip – CPU, GPU, NPU, Modem usw. auf einem Chip.
- F: Besonderheit Snapdragon? | A: Qualcomm, integriertes Modem, Adreno-GPU.
- F: Besonderheit Tegra X1? | A: Maxwell-GPU mit 256 CUDA-Kernen, 4×A57 + 4×A53, Nintendo Switch.
- F: Welche offene Konkurrenz-Architektur gibt es? | A: RISC-V.

## Quiz
? Welche Aussage über ARM ist richtig?
* ARM lizenziert Prozessor-Designs an andere Hersteller
- ARM fertigt alle Smartphone-Chips selbst
- ARM ist eine CISC-Architektur
- ARM-Prozessoren gibt es nur in Smartphones

? Wofür steht das „M“ in Cortex-M?
* Microcontroller
- Mobile
- Multimedia
- Multicore

? Was beschreibt big.LITTLE?
* Kombination von leistungsstarken und sparsamen Kernen
- Große und kleine Caches
- Zwei Threads pro Kern
- Externe Grafikkarte plus iGPU

? Welcher SoC steckt in der Nintendo Switch?
* NVIDIA Tegra X1
- Apple M1
- Qualcomm Snapdragon 8 Gen 3
- Samsung Exynos 2400

? Warum sind ARM-Chips besonders energieeffizient?
* Einfacher RISC-Befehlssatz, einfache Kerne und aggressive Stromsparmechanismen
- Sie haben keinen Cache
- Sie arbeiten nur mit 8 Bit
- Sie besitzen keine Pipeline

? Welche Befehlssatzarchitektur nutzt ARM?
* RISC (Reduced Instruction Set Computer)
- CISC
- VLIW
- EPIC
! x86 gilt als CISC, ARM als RISC.

? Was ist ein SoC?
* System on a Chip – CPU, GPU, Speichercontroller und weitere Funktionen auf einem Chip
- Ein Steckplatz für Erweiterungskarten
- Ein Software-Update-Server
- Ein Schutzschalter im Netzteil
! SoCs sind typisch für Smartphones, Tablets und Apple-Silicon-Macs.

? Wer stellt ARM-Prozessoren typischerweise her?
* Lizenznehmer wie Qualcomm, Apple, Samsung oder MediaTek
- Ausschließlich die Firma ARM selbst
- Nur Intel
- Nur AMD
! ARM entwickelt und lizenziert die Architektur bzw. Kerne.
