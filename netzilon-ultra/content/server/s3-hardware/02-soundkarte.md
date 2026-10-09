---
id: server-hw-soundkarte
bereich: AP1
pruefungen: [AP1, Schule]
fach: ITK / Grundlagen
block: S3
kapitel: Hardware
titel: Soundkarte – Aufbau, Anschlüsse, Schnittstellen, S/PDIF und Audio-Datenraten
stufe: Einsteiger
quellen: [15_Soundkarte.pdf]
verweise: [ap1-a1-mainboard, ap1-a1-pci, ap1-a1-usb, legacy-schnittstellen, ap1-a3-binaerpraefixe]
---

## Profi

### Was ist eine Soundkarte?
Eine **Soundkarte** (Audio-Interface) wandelt **digitale Audiodaten** in **analoge Signale** für Lautsprecher/Kopfhörer um (**D/A-Wandler**, DAC) und analoge Signale von Mikrofon/Line-In in digitale Werte (**A/D-Wandler**, ADC). Sie ist entweder **onboard** (Audio-Codec auf dem Mainboard, z. B. Realtek ALC über **Intel High Definition Audio**), eine **dedizierte Erweiterungskarte** oder eine **externe Lösung** (USB-Soundkarte/-Dongle, „**Breakout-Box**“ bzw. Audio-Interface für Studios).

### Aufbau
- **Codec** mit **ADC/DAC** – bestimmt Klangqualität (Rauschabstand/SNR, Klirrfaktor).
- **DSP** (*Digital Signal Processor*) für Effekte, 3D-Sound, Mischen (entlastet die CPU).
- **Kopfhörerverstärker**, Ein-/Ausgangsbuchsen, ggf. eigener RAM (z. B. Sound Blaster AWE32 mit Wavetable-RAM als Add-on).
- **Treiber**: Erst Windows-Treiber machten viele Funktionen nutzbar; **ISA-Soundkarten** gehörten zu den ersten **Plug-and-Play**-Geräten unter **Windows 95**.

### Geschichte
- Frühe Karten: **AdLib** (FM-Synthese) und **Sound Blaster** von **Creative** (Quasi-Standard bei DOS-Spielen).
- Anbindung früher über **ISA**, frühe Karten hatten sogar **IDE-Anschlüsse** für CD-ROM-Laufwerke.
- Heute: **PCI** (veraltet), **PCIe x1**, **USB**, früher **PCMCIA/CardBus** für Notebooks. Onboard-Standard: **AC’97** (1997, Legacy) → **Intel HD Audio** (2004, „Azalia“).
- Dedizierte Karten braucht man heute meist nur im **Profibereich** (Tonstudio, Streaming, niedrige Latenz mit ASIO-Treibern, hochwertige DACs).

### Anschlüsse (Farbcode nach PC99)
| Buchse (3,5-mm-Klinke) | Farbe | Funktion |
|---|---|---|
| **Mikrofon-Eingang** | **rosa** | Mikrofon (mono, mit Vorverstärker) |
| **Line-In** | **hellblau** | Eingang für externe Quellen (Stereoanlage, Player) |
| **Line-Out / Front** | **hellgrün** | Kopfhörer, Stereo-Lautsprecher, Front links/rechts |
| **Surround hinten** (Rear) | **schwarz** | hintere Lautsprecher |
| **Center/Subwoofer** | **orange** | Mittel- und Basslautsprecher |
| **Surround seitlich** (Side) | **grau** | seitliche Lautsprecher bei 7.1 |
| **S/PDIF koaxial** | Cinch (orange/schwarz) | Digitalausgang elektrisch |
| **S/PDIF optisch** | **TOSLINK** (eckige Buchse) | Digitalausgang über **Lichtwellenleiter** |
Onboard-Sound bietet typisch: Center/Subwoofer, Line-In, Surround left/right, Speaker Out, Surround rear, Microphone sowie Digital In/Out und Optical Out.

### S/PDIF
**Sony/Philips Digital Interface** – überträgt Audio **digital** (PCM Stereo oder komprimiertes **Dolby Digital/DTS 5.1**) an AV-Receiver/Verstärker. Varianten: **koaxial** (Cinch, elektrisch) und **optisch** (**TOSLINK**, Lichtwellenleiter → keine elektromagnetischen Störungen, galvanische Trennung, keine Brummschleifen). Unkomprimiertes Mehrkanal-Audio (7.1 PCM, Dolby TrueHD/Atmos) geht nicht über S/PDIF, sondern über **HDMI**.

### Surround
**5.1** = 5 Lautsprecher + 1 Subwoofer (Front L/R, Center, Rear L/R). **7.1** = **sieben Boxen** (vorne links/rechts, links/rechts seitlich, hinten links/rechts, Center) + **Subwoofer**. Die „.1“ ist der **LFE-Kanal** (*Low Frequency Effects*). Dolby Atmos ergänzt Höhenkanäle (z. B. 7.1.4).

### Audioqualität und Datenrate
- **Abtastrate** (Samplerate): wie oft pro Sekunde gemessen wird – CD **44,1 kHz**, Video/DVD **48 kHz**, Studio 96/192 kHz. Nach **Nyquist-Shannon** muss die Abtastrate **mehr als das Doppelte** der höchsten Frequenz sein (Gehör bis ca. 20 kHz → > 40 kHz).
- **Bittiefe** (Auflösung): 16 Bit (CD, ca. 96 dB Dynamik), 24 Bit (Studio).
- **Datenrate PCM** = Abtastrate × Bittiefe × Kanäle. **CD**: 44 100 × 16 × 2 = **1 411 200 bit/s ≈ 1 411 kbit/s** → pro Minute 1 411 200 × 60 / 8 = **10 584 000 Byte ≈ 10,58 MB**.
- **Latenz** wichtig für Musiker: ASIO- oder WASAPI-Exclusive-Treiber umgehen den Windows-Mixer.

### Verwaltung unter Windows
GUI des Herstellers (Beispiele der Folie: **Realtek HD Audio Manager**, **Creative Sound Blaster X-Fi** Konsole) oder Windows: **Einstellungen → System → Sound**, klassisch `mmsys.cpl` (Wiedergabe-/Aufnahmegeräte, Standardgerät, Format 24 Bit/48 kHz, Exklusivmodus), **Geräte-Manager** → Audio-, Video- und Gamecontroller.

## Einfach

Der Computer denkt nur in **Nullen und Einsen**. Deine Ohren hören aber **Schwingungen in der Luft**. Die Soundkarte ist der **Dolmetscher** dazwischen:
- Wenn Musik abgespielt wird, übersetzt sie Zahlen in **Strom-Wellen**, die den Lautsprecher zum Zittern bringen (**D/A-Wandler**).
- Wenn du ins Mikrofon sprichst, misst sie ganz oft pro Sekunde, wie stark deine Stimme gerade ist, und schreibt das als Zahlen auf (**A/D-Wandler**). Bei CD-Qualität sind das **44 100 Messungen pro Sekunde** – so schnell, dass es für uns wie eine glatte Melodie klingt, wie bei einem **Daumenkino**, das bei schnellem Blättern flüssig aussieht.

Die **bunten Buchsen** sind wie eine **Farbsprache**: **Grün** = Kopfhörer, **Rosa** = Mikrofon, **Blau** = etwas anderes hineinspielen.

**S/PDIF optisch** ist ein **Lichtkabel**: Statt Strom schickt es **Lichtblitze** zum Verstärker. Licht wird von anderen Kabeln nicht gestört – kein Brummen.

**7.1** heißt: Du sitzt mitten im Klang – vorne, an den Seiten, hinten Lautsprecher und ein **Subwoofer** für das tiefe Wummern.

Früher brauchte jeder Computer eine **extra Karte** für Ton – ohne sie konnte er nur piepsen. Heute steckt der Ton-Chip schon **auf dem Mainboard**, so wie ein Radio heute fest im Auto eingebaut ist. Eine eigene Soundkarte kaufen sich nur noch **Musiker und Streamer**, die besonders guten Klang und keine Verzögerung brauchen – so wie Profi-Fotografen eine bessere Kamera als die im Handy kaufen.

## Merksatz
- **ADC rein, DAC raus.**
- **Grün hören, Rosa sprechen, Blau einspielen.**
- **S/PDIF = Sony/Philips Digital Interface, optisch = TOSLINK.**
- **7.1 = 7 Boxen + 1 Subwoofer.**
- **Datenrate = Samplerate × Bit × Kanäle** (CD ≈ 1,4 Mbit/s).

## Prüfungsfalle
- **S/PDIF** ist **digital**, die farbigen Klinkenbuchsen sind **analog**.
- Bei Datenraten **Bit vs. Byte**: 1 411 kbit/s sind ca. **176 KB/s**, nicht 1,4 MB/s.
- **ISA** und **PCMCIA** sind **Legacy**; „PCI aktuell“ aus der Folie ist veraltet – heute PCIe oder USB.
- Die „.1“ ist **kein halber Lautsprecher**, sondern der separate Tieftonkanal (LFE).

## Grafik
### Vom Mikrofon zum Lautsprecher
1. Mikrofon -> Soundkarte: analoges Signal
2. Soundkarte: ADC tastet 48 000-mal pro Sekunde mit 24 Bit ab
3. Soundkarte -> CPU: digitale PCM-Daten
4. CPU: Software verarbeitet (z. B. Videokonferenz)
5. CPU -> Soundkarte: digitale Ausgabe
6. Soundkarte -> Lautsprecher: DAC erzeugt analoges Signal

## Lab
Maschine: **EXA-CL01** (Windows 11).

### GUI
1. Rechtsklick Start → **Geräte-Manager** → **Audio-, Video- und Gamecontroller** → Soundchip/Codec und Treiberversion ansehen.
2. **Einstellungen → System → Sound** → Ausgabe- und Eingabegerät wählen → **Weitere Soundeinstellungen** (`mmsys.cpl`).
3. Registerkarte **Wiedergabe** → Gerät → Eigenschaften → **Erweitert** → Standardformat (z. B. 24 Bit, 48 000 Hz) → Exklusivmodus ansehen.
4. Registerkarte **Aufnahme** → Mikrofon → Pegel testen.

### PowerShell
```powershell
# EXA-CL01: Soundgeraete und Audio-Endpunkte anzeigen
Get-CimInstance Win32_SoundDevice | Format-Table Name, Manufacturer, Status
Get-PnpDevice -Class AudioEndpoint | Format-Table FriendlyName, Status
# CD-Datenrate berechnen
$bps = 44100 * 16 * 2; "{0} bit/s = {1:N2} MB pro Minute" -f $bps, ($bps * 60 / 8 / 1e6)
```

## Übungen
- A: Nennen Sie drei Formen einer Soundkarte. | L: Onboard (Codec auf dem Mainboard), interne Erweiterungskarte (PCIe), extern (USB-Dongle/Breakout-Box)
- A: Welche Schnittstellen nutzten Soundkarten im Laufe der Zeit? | L: ISA (veraltet), PCI, PCI Express, PCMCIA (Notebooks), USB
- A: Wofür steht S/PDIF und welche Varianten gibt es? | L: Sony/Philips Digital Interface – koaxial (Cinch) und optisch (TOSLINK, Lichtwellenleiter)
- A: Aus wie vielen Lautsprechern besteht 7.1? | L: Sieben Boxen (VL, VR, L, R, HL, HR, C) plus ein Subwoofer
- A: Berechnen Sie die Datenrate unkomprimierter CD-Audio-Daten. | L: 44 100 Hz × 16 Bit × 2 Kanäle = 1 411 200 bit/s ≈ 1,41 Mbit/s
- A: Wie groß ist eine Minute CD-Audio unkomprimiert? | L: 1 411 200 bit/s × 60 s = 84 672 000 bit ÷ 8 = 10 584 000 Byte ≈ 10,58 MB (≈ 10,09 MiB)
- A: Warum werden dedizierte Soundkarten heute kaum noch gebraucht? | L: Onboard-HD-Audio ist für Büro und Spiele ausreichend; dedizierte Karten lohnen sich nur im Profibereich (Studio, geringe Latenz, bessere Wandler).
- A: Welche Buchse hat welche Farbe? | L: Mikrofon rosa, Line-In hellblau, Line-Out/Kopfhörer hellgrün, Rear schwarz, Center/Sub orange, Side grau

## Karteikarten
- F: Was macht der DAC einer Soundkarte? | A: Wandelt digitale Audiodaten in analoge Signale für Lautsprecher um
- F: Was macht der ADC? | A: Wandelt analoge Signale (Mikrofon) in digitale Werte um
- F: Bekannte frühe Soundkarten-Hersteller? | A: AdLib und Creative (Sound Blaster)
- F: Welcher Onboard-Audiostandard löste AC’97 ab? | A: Intel High Definition Audio (2004)
- F: Farbe der Mikrofonbuchse? | A: Rosa
- F: Farbe der Kopfhörer-/Line-Out-Buchse? | A: Hellgrün
- F: Was ist TOSLINK? | A: Optische S/PDIF-Verbindung über Lichtwellenleiter
- F: Was bedeutet die „.1“ in 5.1/7.1? | A: Den Subwoofer-/LFE-Kanal für tiefe Frequenzen
- F: Abtastrate der Audio-CD? | A: 44,1 kHz bei 16 Bit Stereo
- F: Formel für die PCM-Datenrate? | A: Abtastrate × Bittiefe × Kanäle

## Quiz
? Welche Komponente wandelt digitale Daten in hörbare analoge Signale?
* DAC (Digital-Analog-Wandler)
- ADC (Analog-Digital-Wandler)
- DSP
- S/PDIF

? Wofür steht S/PDIF?
* Sony/Philips Digital Interface
- Serial Peripheral Data Interface
- Sound Processing Digital Input Format
- Standard PC Digital Interface

? Wie viele Lautsprecher (ohne Subwoofer) hat ein 7.1-System?
* 7
- 8
- 5
- 6

? Welche Farbe hat die Mikrofonbuchse nach PC99?
* Rosa
- Hellgrün
- Hellblau
- Orange

? Wie groß ist die Datenrate von CD-Audio unkomprimiert?
* ca. 1 411 kbit/s
- ca. 128 kbit/s
- ca. 1 411 KB/s
- ca. 44,1 kbit/s

? Welche Schnittstelle gilt für Soundkarten als veraltet?
* ISA
- PCI Express
- USB
- HDMI

? Was ist ein Vorteil der optischen S/PDIF-Verbindung?
* Unempfindlich gegen elektromagnetische Störungen, keine Brummschleifen
- Sie überträgt auch Strom
- Sie ist analog und daher wärmer im Klang
- Sie überträgt unkomprimiertes 7.1 PCM

? Wofür brauchte man frühe IDE-Anschlüsse auf Soundkarten?
* Für den Anschluss von CD-ROM-Laufwerken
- Für Mikrofone
- Für den Subwoofer
- Für die Netzwerkverbindung

## Lücken
- Eine Soundkarte wandelt mit dem {DAC} digital in analog und mit dem {ADC} analog in digital.
- Die CD nutzt {44,1} kHz Abtastrate und {16} Bit Auflösung.
- Optisches S/PDIF nutzt Stecker vom Typ {TOSLINK}.

## Zuordnen
### Buchse und Farbe
- Mikrofon => rosa
- Line-In => hellblau
- Line-Out/Kopfhörer => hellgrün
- Center/Subwoofer => orange
- Surround hinten => schwarz

## Spickzettel
- Onboard (HD Audio) / PCIe / USB / Breakout-Box; ISA, PCMCIA = Legacy
- ADC rein, DAC raus, DSP für Effekte
- Farben: grün Out, rosa Mic, blau Line-In, orange C/Sub, schwarz Rear, grau Side
- S/PDIF koax (Cinch) oder optisch (TOSLINK)
- 7.1 = 7 Boxen + Sub (LFE)
- PCM: Rate × Bit × Kanäle; CD 1 411 kbit/s ≈ 10,6 MB/min
