---
id: legacy-schnittstellen
bereich: Legacy
block: A12
kapitel: Legacy-Box
titel: Veraltete Schnittstellen, Bussysteme und Speichermedien
stufe: Einsteiger
quellen: [AP1-Unterlagen Hardware (Mainboard, PCI/PCIe, USB, Displays), eigene Zusammenstellung]
verweise: [ap1-a1-mainboard, ap1-a1-pci, ap1-a1-usb, ap1-a1-displays, legacy-bios-uefi]
---

## Profi

### Warum kennen?
In der **Prüfung (AP1)** und im Alltag begegnen dir **alte Anschlüsse** an Messgeräten, Kassen und Steuerungen. Wichtig: **Erkennen, Nachfolger nennen, Adapter kennen**.

### Erweiterungsbusse
| Legacy | Merkmale | Nachfolger |
|---|---|---|
| **ISA** | 8/16 Bit, ~8 MHz, ~8 MB/s | **PCI** |
| **VESA-Local-Bus** | 32 Bit, nur Grafik, an CPU-Takt | PCI |
| **PCI** | 32/64 Bit, 33/66 MHz, **parallel, geteilter Bus** (133 MB/s bei 32 Bit/33 MHz) | **PCIe** |
| **AGP** | Nur Grafik, 1×–8× (2,1 GB/s) | **PCIe x16** |
| **PCI-X** | 64 Bit, 133 MHz, Server | PCIe |
**PCIe**: **seriell, Punkt-zu-Punkt, Lanes** (x1, x4, x8, x16), Generationen **3.0 (~1 GB/s je Lane)**, **4.0 (~2)**, **5.0 (~4)**, **6.0 (~8)**.

### Datenträger-Schnittstellen
| Legacy | Merkmale | Nachfolger |
|---|---|---|
| **IDE/PATA** (*Parallel ATA*) | 40/80-polig, **Master/Slave**, bis 133 MB/s | **SATA** |
| **SCSI** (parallel) | Bis 15 Geräte, **Terminierung**, IDs | **SAS** |
| **SATA I/II/III** | 1,5 / 3 / **6 Gbit/s** (~600 MB/s) | **NVMe (PCIe)** |
| **SAS** | 12/24 Gbit/s, Server, Dual-Port | – |
| **NVMe** | **PCIe**, M.2/U.2, mehrere GB/s | aktuell |
| **Diskette** | 1,44 MB | USB-Stick |
| **Bandlaufwerk (DAT/DLT/LTO)** | Sequentiell, Archiv | LTO-9/10 weiterhin im Einsatz (Backup) |

### Anschlüsse am PC
| Legacy | Merkmale | Nachfolger |
|---|---|---|
| **PS/2** | Runde 6-Pin-Buchse (lila Tastatur/grün Maus) | **USB** |
| **Serieller Port (RS-232, COM)** | 9-Pin D-Sub, ~115 kbit/s; noch für **Router-Konsole, Messgeräte** | **USB-Seriell-Adapter** |
| **Parallelport (LPT)** | 25-Pin, Drucker | **USB**, Netzwerkdrucker |
| **VGA** (analog) | 15-Pin D-Sub, blau | **DVI → HDMI → DisplayPort → USB-C** |
| **DVI** | Digital/analog (DVI-I) | HDMI/DisplayPort |
| **FireWire (IEEE 1394)** | 400/800 Mbit/s, Video | USB/Thunderbolt |
| **eSATA** | Externe SATA-Platte | USB 3/Thunderbolt |
| **USB 1.1/2.0** | 12 Mbit/s / **480 Mbit/s** | **USB 3.x (5/10/20 Gbit/s)**, **USB4 (40 Gbit/s)** |
| **Modem/ISDN** | RJ-11/S0 | DSL/Glasfaser |

### Netzwerkanschlüsse (Legacy)
**BNC** (Koax), **AUI**, **Token-Ring-Stecker**: siehe Seite „Alte Netztechnik“.

### RAM- und Stromversorgung
| Legacy | Nachfolger |
|---|---|
| **SIMM/DIMM SDR** | **DDR3 → DDR4 → DDR5** |
| **AT-Netzteil (mit Kippschalter)** | **ATX** (Soft-Power) |
| **20-Pin-ATX-Anschluss** | **24-Pin (20+4)** |
| **Molex-Stecker** | **SATA-Strom** |

### Adapter und Brücken
- **USB-Seriell-Adapter (FTDI/Prolific)** – Verbindung zu Switch-/Router-**Konsole**.
- **VGA→HDMI**-Adapter: **aktiv** (digital wandelt analog), **HDMI→VGA** ebenso.
- **PATA→SATA-Konverter**, **SATA→USB-Gehäuse** zum Auslesen alter Platten.
- **PS/2→USB** passiv nur bei kompatiblen Tastaturen.

### Weiterbetrieb und Entsorgung
- **Datenträger löschen** (mehrfach überschreiben/`cipher /w`), physisch **schreddern** (DIN 66399, **Schutzklasse/Sicherheitsstufe**).
- **Elektroschrott** nach **ElektroG** über Wertstoffhof/Hersteller-Rücknahme, **Batterien/Akkus** getrennt.

## Lab
**Maschinen**: **CL01** (Windows), **SW1** (Cisco-Switch mit Konsolenport), **USB-Seriell-Adapter**.

### GUI
1. **CL01**: **Geräte-Manager** → **Anschlüsse (COM & LPT)** → neuer **COM3** nach Einstecken des Adapters.
2. **CL01**: **PuTTY** → Verbindungstyp **Seriell** → Serial line **COM3**, Speed **9600** → Open.
3. **SW1**: Konsolenkabel (**Rollover/RJ45 → DB9**) einstecken, **Enter** → Prompt `Switch>`.
4. **CL01**: **Geräte-Manager** → Ansicht → **Ausgeblendete Geräte** → alte, unbenutzte COM-Ports ansehen.
5. **CL01**: `diskmgmt.msc` → **Datenträger anschließen** (SATA→USB-Gehäuse), Laufwerk erscheint.
6. **CL01**: Eigenschaften eines alten Laufwerks → **Volumes → Partitionstyp**.

### PowerShell
```powershell
# Auf CL01 – serielle Ports und PnP-Geräte anzeigen
Get-CimInstance Win32_SerialPort | Select-Object DeviceID, Description
Get-PnpDevice -Class Ports

# Auf CL01 – Schnittstellen der Datenträger
Get-PhysicalDisk | Select-Object FriendlyName, BusType, MediaType, Size
# BusType: SATA, NVMe, USB, SAS
```

## Befehle
- `Get-PhysicalDisk \| Select FriendlyName, BusType` – Schnittstelle der Datenträger
- `Get-PnpDevice -Class Ports` – COM/LPT-Anschlüsse
- `mode COM3` – COM-Port-Einstellungen anzeigen
- `cipher /w:D:` – Freien Speicherplatz überschreiben
- `msinfo32` → Hardware-Ressourcen – IRQ, I/O, DMA (Legacy-Ressourcen)

## Einfach

Hardware-Anschlüsse sind wie **Steckdosen in verschiedenen Ländern**. Früher hatte **jedes Gerät einen eigenen Stecker**: Maus (PS/2 rund), Drucker (LPT breit), Monitor (VGA blau), Festplatte (IDE breit), Modem (seriell). Dann kam **USB** und sagte: „Ein Stecker für fast alles!“

**Alt gegen neu, ganz kurz:**
- **PCI** war eine **Straße mit einer Spur für alle**. **PCIe** ist eine **Autobahn mit eigener Spur** je Gerät.
- **IDE** war **ein breites Bandkabel** mit zwei Geräten („Master“ und „Slave“). **SATA** ist ein **schmales Kabel** für ein Gerät, aber **viel schneller**.
- **VGA** überträgt das Bild **als Wellen (analog)**, **HDMI/DisplayPort** als **exakte Zahlen (digital)** – schärfer, mit Ton.
- **Diskette** fasst **1,44 MB** – ein einziges Foto vom Handy passt nicht drauf.

Und der **serielle Port**? Der lebt noch, weil **Netzwerktechniker** ihn brauchen, um einen **neuen Switch** zum ersten Mal einzurichten. Dafür gibt es **USB-Adapter**.

## Merksatz
- **PCI parallel + geteilt → PCIe seriell + Lanes.**
- **IDE (PATA) → SATA → NVMe.**
- **SCSI → SAS.**
- **PS/2, LPT, COM, VGA, DVI = alt** (Nachfolger: USB, HDMI/DisplayPort).
- **SATA III = 6 Gbit/s.**
- Konsole am Switch = **seriell 9600 8N1**.

## Prüfungsfalle
- **PCI ≠ PCIe**: PCI ist **parallel**, PCIe **seriell** – **nicht kompatibel** (Steckplatz verschieden).
- **SATA III** = 6 **Gbit/s**, nicht MByte/s; **~600 MB/s** nutzbar.
- **VGA ist analog**, HDMI/DP digital; **passiver** Adapter genügt **nicht**.
- **NVMe ist ein Protokoll**, **M.2** ein Formfaktor (M.2 kann auch SATA sein).
- **Serielle Konsole**: **9600 Baud, 8 Datenbits, keine Parität, 1 Stoppbit**.

## Grafik
### Anschluss-Museum
Eine Vitrine mit alten Steckern (PS/2, LPT, VGA, IDE, Diskette); Klick zeigt Nachfolger, Geschwindigkeit und Jahr. Ein Zeitschieber blendet die Stecker nach Erscheinungsjahr ein.

### PCI gegen PCIe
Oben eine Straße mit allen Autos auf einer Spur (PCI), unten eine Autobahn mit Spuren x1 bis x16; ein Regler wählt die PCIe-Generation und lässt die Autos schneller fahren.

## Karteikarten
- F: Welcher Bus ist parallel und geteilt: PCI oder PCIe? | A: PCI.
- F: Was ist der Nachfolger von AGP? | A: PCIe x16.
- F: Was ist PATA? | A: Parallel ATA (IDE), Bandkabel mit Master/Slave.
- F: Nachfolger von PATA? | A: SATA.
- F: Nachfolger von SCSI? | A: SAS.
- F: Wie schnell ist SATA III? | A: 6 Gbit/s.
- F: Welches Protokoll nutzt NVMe? | A: PCIe.
- F: Wofür nutzt man den seriellen Port heute? | A: Konsolenzugriff auf Netzwerkgeräte, Messgeräte.
- F: Parameter der Konsolenverbindung? | A: 9600 Baud, 8 Datenbits, keine Parität, 1 Stoppbit.
- F: Ist VGA analog oder digital? | A: Analog.
- F: Nachfolger der Anschlüsse PS/2 und LPT? | A: USB.
- F: Welche Norm regelt das Vernichten von Datenträgern? | A: DIN 66399.

## Quiz
? Was ist der Nachfolger von IDE/PATA?
* SATA
- SCSI
- ISA
- AGP

? Welcher Bus ist seriell und arbeitet mit Lanes?
* PCIe
- PCI
- ISA
- AGP

? Wie schnell ist SATA III?
* 6 Gbit/s
- 3 Gbit/s
- 1,5 Gbit/s
- 12 Gbit/s

? Welche Einstellungen gelten für eine typische serielle Konsole?
* 9600 Baud, 8N1
- 115200 Baud, 7E2
- 1200 Baud, 8E1
- 56 kbit/s, 8N2

? Welcher Anschluss ist analog?
* VGA
- HDMI
- DisplayPort
- USB-C

? Welche Norm regelt die Vernichtung von Datenträgern?
* DIN 66399
- ISO 9001
- DIN 5008
- IEEE 802.3
