---
id: ap1-a1-grafikkarte
bereich: AP1
block: A1
kapitel: Hardware
titel: Grafikkarte (GPU)
stufe: Fortgeschritten
quellen: [07_Übung_Grafikkarte.pdf]
verweise: [ap1-a1-pci, ap1-a1-arbeitsspeicher, ap1-a1-displays, ap1-a1-prozessor]
---

## Profi

### Aufgabe
Die Grafikkarte berechnet die **Bildausgabe** und gibt sie an den Monitor aus. Sie übernimmt 2D-Darstellung, 3D-Berechnung (Geometrie, Texturen, Beleuchtung, Raytracing), Video-De-/Kodierung (H.264, HEVC, AV1) und zunehmend **allgemeine Parallelberechnungen** (KI, Simulationen).

### Onboard (iGPU) vs. Steckkarte (dGPU)
| | Integrierte Grafik (iGPU) | Dedizierte Grafikkarte (dGPU) |
|---|---|---|
| Ort | In der CPU (früher: Northbridge) | Eigene Karte im PCIe-x16-Slot |
| Speicher | Nutzt den Arbeitsspeicher mit (Shared Memory) | Eigener, schneller VRAM (GDDR6/GDDR7) |
| Leistung | Office, Video, leichte Spiele | 3D, Gaming, CAD, KI |
| Verbrauch | sehr gering | 75–600 W |
| Kosten | im CPU-Preis enthalten | extra |

### Schnittstellen (Anbindung an das Mainboard)
| Schnittstelle | Zeitraum | Merkmale |
|---|---|---|
| ISA/VLB | bis Mitte 90er | veraltet |
| PCI | 90er | geteilter Bus, 133 MB/s |
| **AGP** (Accelerated Graphics Port) | 1997–2006 | exklusiver Port nur für Grafik, 1x–8x (bis 2,1 GB/s) |
| **PCIe x16** | seit 2004 | aktueller Standard, bis ca. 63 GB/s (5.0) |

### GPU vs. CPU
| | CPU | GPU |
|---|---|---|
| Kerne | wenige (4–64), sehr leistungsfähig | tausende einfache Recheneinheiten (Shader/CUDA-Kerne/Stream-Prozessoren) |
| Stärke | komplexe, verzweigte, sequenzielle Aufgaben, geringe Latenz | gleichartige Berechnungen auf riesigen Datenmengen (Parallelität, hoher Durchsatz) |
| Cache | groß pro Kern | klein pro Recheneinheit |
| Beispiel | Betriebssystem, Datenbank, Logik | Pixel berechnen, Matrizenmultiplikation für KI |

**Multicore**: CPUs setzen auf wenige starke Kerne mit hohem Takt, Sprungvorhersage und großen Caches. GPUs gruppieren tausende einfache Kerne in Blöcke (NVIDIA: Streaming Multiprocessors, AMD: Compute Units), die denselben Befehl auf viele Daten gleichzeitig anwenden (SIMT). Moderne GPUs besitzen zusätzlich **Tensor-/KI-Kerne** und **Raytracing-Kerne**.

### Warum so viel Grafikspeicher?
Ein einzelnes 4K-Bild (3840 × 2160 Pixel × 4 Byte) braucht nur ca. **33 MB**. Trotzdem haben Karten 8–32 GB, weil der VRAM viel mehr enthält:
- **Texturen** in hoher Auflösung (größter Anteil)
- **Geometriedaten** (Vertices, Meshes)
- **Framebuffer** mehrfach (Double/Triple Buffering), Z-Buffer (Tiefeninformation)
- Shader-Programme, Beleuchtungsdaten, Raytracing-Strukturen (BVH)
- Bei KI: Modellgewichte (z. B. ein 7-Milliarden-Parameter-Modell braucht 4–14 GB)

### Grafikspeicher-Technologien
| Technologie | Merkmale |
|---|---|
| GDDR6 | bis ~20 Gbit/s pro Pin, Standard der Mittelklasse |
| GDDR6X | PAM4-Signalisierung, bis ~23 Gbit/s, NVIDIA-High-End |
| GDDR7 | PAM3, 28–32+ Gbit/s, aktuelle Generation |
| HBM2e/HBM3 | gestapelte Chips neben der GPU, sehr breiter Bus (1024 Bit pro Stapel), Rechenzentrum |

Bandbreite = Datenrate pro Pin × Busbreite ÷ 8. Beispiel: 21 Gbit/s × 256 Bit ÷ 8 = **672 GB/s**.

### RAMDAC (Legacy)
Der **RAMDAC** (Random Access Memory Digital-to-Analog Converter) wandelte das digitale Bild aus dem Grafikspeicher in **analoge Signale** für VGA-Monitore (CRT) um. Mit rein digitalen Anschlüssen (DVI-D, HDMI, DisplayPort) ist er überflüssig; moderne Karten haben keinen VGA-Ausgang mehr.

### Bildanschlüsse
| Anschluss | Art | Besonderheiten |
|---|---|---|
| VGA (D-Sub) | analog | veraltet, Bildqualität sinkt bei hohen Auflösungen |
| DVI | digital (DVI-D) / analog (DVI-I) | veraltet, kein Ton |
| **HDMI** 2.1 | digital | Bild + Ton, bis 48 Gbit/s, 4K@120/8K@60, Standard bei TVs, HDCP |
| **DisplayPort** 1.4/2.1 | digital | bis 80 Gbit/s (UHBR20), Daisy-Chaining (MST), Standard bei PC-Monitoren, Adaptive Sync |
| USB-C (DP Alt Mode) | digital | DisplayPort über USB-C, Notebooks |

### DirectX vs. OpenGL/Vulkan
| | DirectX (Direct3D) | OpenGL / **Vulkan** |
|---|---|---|
| Herkunft | Microsoft | Khronos Group (offener Standard) |
| Plattform | Windows, Xbox | plattformübergreifend (Windows, Linux, Android) |
| Umfang | Grafik, Audio, Eingabe (Sammlung) | reine Grafik-API |
| Aktuell | DirectX 12 Ultimate (Raytracing) | Vulkan als moderner Nachfolger von OpenGL |
Apple nutzt **Metal**.

### GPGPU
**GPGPU** (General-Purpose computing on GPUs): Die GPU rechnet nicht nur Grafik, sondern allgemeine Aufgaben.
- **CUDA**: NVIDIAs proprietäre Plattform – Standard für KI (PyTorch, TensorFlow).
- **OpenCL**: offener, herstellerübergreifender Standard (Khronos).
- **DirectCompute**: Microsofts GPGPU-Schnittstelle in DirectX.
- **PhysX**: NVIDIAs Physik-Engine (Kollisionen, Partikel), anfangs auf GPU beschleunigt.
- AMD: **ROCm/HIP**.
Einsatz: KI-Training und -Inferenz, wissenschaftliche Simulation, Videoschnitt, Kryptografie. Die schnellsten Supercomputer der TOP500-Liste (z. B. El Capitan, Frontier, Aurora) setzen fast ausschließlich GPU-Beschleuniger ein.

## Einfach

Die Grafikkarte ist der **Maler** im Computer. Die CPU sagt: „Male ein Haus mit rotem Dach!“ – und die Grafikkarte malt jeden einzelnen Bildpunkt auf den Bildschirm. Und das bis zu 240-mal pro Sekunde!

**CPU vs. GPU**: Die CPU ist wie ein **Professor**: Er kann jede schwierige Aufgabe lösen, aber immer nur wenige gleichzeitig. Die GPU ist wie eine **Schule mit 10.000 Grundschülern**: Jeder kann nur einfache Aufgaben, aber alle rechnen gleichzeitig. Wenn du eine Million Bildpunkte bunt anmalen musst, gewinnen die Schüler – wenn du eine knifflige Matheaufgabe hast, gewinnt der Professor.

**Onboard oder Steckkarte?** Die Onboard-Grafik ist ein Hobbymaler, der im Prozessor mitwohnt und sich dessen Schreibtisch (Arbeitsspeicher) leiht. Die Steckkarte ist ein Profi-Maler mit eigenem Atelier (eigener Speicher) – viel schneller, aber teuer und stromhungrig.

**Warum so viel Grafikspeicher?** Ein Bild braucht wenig Platz. Aber in einem Spiel muss die Grafikkarte **alle Farbeimer und Tapetenmuster** (Texturen) für die ganze Welt griffbereit haben – für jeden Baum, jede Wand, jedes Gesicht. Das ist der eigentliche Platzfresser.

**Anschlüsse**: VGA ist der alte analoge Anschluss (wie ein Röhrenfernseher). HDMI kennt man vom Fernseher – Bild und Ton in einem Kabel. DisplayPort ist der Profi-Anschluss für PC-Monitore.

**DirectX und Vulkan** sind wie **Sprachen**, in denen ein Spiel der Grafikkarte sagt, was sie malen soll. DirectX ist die Sprache von Microsoft, Vulkan eine Sprache, die alle sprechen dürfen.

**GPGPU/CUDA**: Weil die 10.000 Schüler so fleißig sind, lässt man sie heute nicht nur malen, sondern auch **künstliche Intelligenz** trainieren. Deshalb sind Grafikkarten plötzlich so gefragt.

## Merksatz
- CPU = **wenige kluge Köpfe**, GPU = **tausende fleißige Hände**.
- VRAM frisst vor allem **Texturen**, nicht das Bild selbst.
- RAMDAC = **digital → analog** für VGA (Legacy).
- HDMI = TV + Ton, DisplayPort = PC-Monitor + Daisy-Chain.
- CUDA = NVIDIA, OpenCL = offen, DirectCompute = Microsoft.

## Prüfungsfalle
- AGP ist kein Nachfolger von PCIe, sondern der Vorgänger.
- DVI-D überträgt kein analoges Signal – VGA-Adapter nur bei DVI-I.
- Viele Kerne ≠ schneller in jeder Aufgabe.
- Die iGPU hat keinen eigenen VRAM, sondern teilt den Arbeitsspeicher.
- Vulkan ist der Nachfolger von OpenGL, nicht von DirectX.

## Grafik
### Professor vs. Schulklasse
Links ein Professor, rechts ein Raster aus 1000 kleinen Figuren; beide sollen ein 32×32-Pixelbild ausmalen. Der Professor malt Pixel für Pixel, die Klasse alles gleichzeitig. Umschalten auf „Rätsel lösen“: Der Professor gewinnt.

### Bild-Pipeline
Dreieck → Vertex-Shader → Rasterisierung → Pixel-Shader (Texturen) → Framebuffer → Monitor – jede Stufe leuchtet nacheinander auf.

### VRAM-Aufteilung
Tortendiagramm, das sich animiert füllt: Texturen, Geometrie, Framebuffer, Z-Buffer, Rest.

## Karteikarten
- F: Hauptaufgabe der Grafikkarte? | A: Berechnung und Ausgabe des Bildes (2D/3D, Video), zunehmend auch Parallelberechnungen.
- F: Unterschied iGPU und dGPU? | A: iGPU in der CPU, nutzt Arbeitsspeicher; dGPU eigene Karte mit eigenem VRAM, deutlich leistungsfähiger.
- F: Grundlegender Unterschied GPU und CPU? | A: CPU: wenige starke Kerne für komplexe sequenzielle Aufgaben; GPU: tausende einfache Kerne für massiv parallele Aufgaben.
- F: Warum haben Grafikkarten mehrere GB VRAM? | A: Texturen, Geometrie, mehrere Framebuffer, Z-Buffer, Shader, KI-Modelle.
- F: Was ist ein RAMDAC? | A: Digital-Analog-Wandler, erzeugt analoge Signale für VGA-Monitore.
- F: Vorteile DisplayPort? | A: Hohe Bandbreite, Daisy-Chaining mehrerer Monitore (MST), Adaptive Sync.
- F: Was ist GPGPU? | A: General-Purpose Computing on GPUs – allgemeine Berechnungen auf der Grafikkarte.
- F: Was ist CUDA? | A: NVIDIAs proprietäre GPGPU-Plattform, Standard für KI.
- F: Unterschied DirectX und OpenGL? | A: DirectX: Microsoft, Windows/Xbox, API-Sammlung. OpenGL/Vulkan: offener Standard, plattformübergreifend, reine Grafik.
- F: Bildanschluss-Schnittstelle vor PCIe? | A: AGP (Accelerated Graphics Port).

## Quiz
? Welche Speicherbandbreite hat eine Grafikkarte mit 20 Gbit/s pro Pin und 256-Bit-Bus?
* 640 GB/s
- 5.120 GB/s
- 80 GB/s
- 20 GB/s

? Welcher Anschluss überträgt ein analoges Bildsignal?
* VGA
- HDMI
- DisplayPort
- DVI-D

? Welche Aufgabe eignet sich besonders für eine GPU?
* Matrizenmultiplikation beim Training eines KI-Modells
- Ausführen einer verschachtelten Geschäftslogik mit vielen Verzweigungen
- Starten des Betriebssystems
- Verwalten der Dateisystem-Rechte

? Welche Schnittstelle ist herstellerunabhängig für GPGPU?
* OpenCL
- CUDA
- PhysX
- DLSS

? Womit teilt sich eine integrierte Grafik den Speicher?
* Mit dem Arbeitsspeicher des Systems
- Mit der SSD
- Mit dem L1-Cache
- Mit dem BIOS-Flash
