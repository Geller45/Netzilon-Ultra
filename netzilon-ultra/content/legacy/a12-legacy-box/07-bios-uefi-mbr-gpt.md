---
id: legacy-bios-uefi
bereich: Legacy
block: A12
kapitel: Legacy-Box
titel: BIOS/MBR gegen UEFI/GPT
stufe: Einsteiger
quellen: [UEFI-Spezifikation, Microsoft Windows-11-Anforderungen, eigene Zusammenstellung]
verweise: [ap1-a1-mainboard, ap1-a2-dateisysteme, legacy-hyperv-generation, legacy-schnittstellen]
---

## Profi

### Aufgabe der Firmware
Beim Einschalten läuft **Firmware** auf dem Mainboard: Sie führt den **POST** (*Power-On Self Test*) aus, initialisiert die Hardware und **lädt den Bootloader** vom Datenträger.

### BIOS (Legacy) und UEFI
| Merkmal | **BIOS (Legacy-Boot)** | **UEFI** |
|---|---|---|
| Name | *Basic Input/Output System* (1981) | *Unified Extensible Firmware Interface* |
| Modus | 16-Bit-Real-Mode | 32/64 Bit |
| Partitionstabelle | **MBR** | **GPT** (MBR nur mit **CSM**) |
| Max. Datenträger | **2 TB** (32-Bit-LBA) | **9,4 ZB** (theoretisch), praktisch >2 TB |
| Partitionen | **4 primär** (oder 3 + 1 erweiterte) | **128** (in Windows) |
| Bootloader | Erstes Sektor (MBR) → Bootmanager | **EFI-Systempartition (ESP)**, `\EFI\Microsoft\Boot\bootmgfw.efi` |
| **Secure Boot** | Nein | **Ja** (signierte Bootloader) |
| Oberfläche | Textmenü | Grafisch, Maus |
| Netzwerkboot | PXE (Legacy) | PXE (UEFI), HTTP-Boot |
| Treiber | Option-ROM | UEFI-Treiber, schneller Boot |
| **TPM 2.0** | Nicht nötig | Für **Windows 11** Pflicht (mit UEFI + Secure Boot) |

**CSM** (*Compatibility Support Module*) ist die **BIOS-Emulation** im UEFI, damit alte Systeme booten. Bei **Windows 11** und modernen Boards **deaktiviert**.

### MBR und GPT
| Merkmal | **MBR** (*Master Boot Record*) | **GPT** (*GUID Partition Table*) |
|---|---|---|
| Ort | **Sektor 0** | Sektor 1 (Header) + **Schutz-MBR** in Sektor 0 |
| Redundanz | Keine | **Backup-Header/-Tabelle am Ende** des Datenträgers |
| Integrität | Keine | **CRC32**-Prüfsummen |
| Partitions-ID | Typbyte | **GUID** |
| Größe | max. 2 TB, 4 Partitionen | >2 TB, 128 Partitionen |
| Boot von | BIOS | UEFI (Windows-Boot **nur** mit UEFI) |

### Typische Partitionen bei Windows (GPT/UEFI)
| Partition | Größe | Inhalt |
|---|---|---|
| **EFI-Systempartition** | ~100–260 MB, **FAT32** | Bootloader |
| **MSR** | 16 MB | Microsoft Reserved |
| **Windows** | Rest | NTFS, `C:` |
| **Wiederherstellung** | ~500 MB–1 GB | WinRE |

### Konvertierung
- **MBR2GPT** (`mbr2gpt /validate /disk:0` und `mbr2gpt /convert /disk:0`): Windows 10/11 **ohne Datenverlust**, **Voraussetzung**: max. 3 Partitionen, Platz für die GPT.
- Danach im **BIOS/UEFI-Setup** auf **UEFI-Modus** umstellen, **CSM aus**, **Secure Boot** aktivieren.
- **Diskpart** `convert gpt` **löscht alle Daten**!

### Secure Boot und Sicherheit
- Bootloader müssen mit einem **hinterlegten Schlüssel signiert** sein (Platform Key, Key Exchange Keys, **db/dbx**).
- Schützt vor **Bootkits/Rootkits**. **Linux** startet über signierte **shim**.
- **Measured Boot** legt Startwerte im **TPM** ab (z. B. BitLocker).

### Alte Bootverfahren zum Wiedererkennen
**Diskette/CD-Boot**, **Boot über Netzwerk (PXE)**, **USB-Stick**, **Bootreihenfolge (Boot Order)**.

## Lab
**Maschinen**: **CL01** (Windows-Client, Hyper-V-Gen1 mit MBR), **HOST** (Hyper-V-Host).

### GUI
1. **CL01**: `msinfo32` → Zeile **BIOS-Modus**: „Vorgänger“ = Legacy/BIOS, „UEFI“ = UEFI; Zeile **Sicherer Startzustand**.
2. **CL01**: `diskmgmt.msc` → Rechtsklick Datenträger 0 → **Eigenschaften → Volumes** → **Partitionstyp: MBR oder GPT**.
3. **CL01**: Eingabeaufforderung (Admin) → `mbr2gpt /validate /allowFullOS`.
4. **CL01**: `mbr2gpt /convert /allowFullOS`.
5. **HOST**: VM ausschalten → **Einstellungen → Firmware** → wenn Generation 1: nicht möglich → neue **Gen-2-VM** anlegen (siehe eigene Seite).
6. **CL01** (nach Umstellung): Startup → **UEFI/BIOS** → **CSM aus**, **Secure Boot ein**.

### PowerShell
```powershell
# Auf CL01 – Partitionsstil und Firmware-Typ prüfen
Get-Disk | Select-Object Number, FriendlyName, PartitionStyle, Size
$env:firmware_type          # Legacy oder UEFI (in WinPE/Setup-Umgebung)
Confirm-SecureBootUEFI      # True = Secure Boot aktiv (nur UEFI)

# Auf CL01 – TPM prüfen
Get-Tpm
```

## Befehle
- `msinfo32` – BIOS-Modus, Secure Boot, BitLocker-Status
- `diskpart` → `list disk` – Sternchen (`*`) in Spalte **GPT** zeigt GPT
- `mbr2gpt /validate /disk:0` – Prüfung vor der Konvertierung
- `mbr2gpt /convert /disk:0` – Konvertieren ohne Datenverlust
- `bcdedit` – Bootkonfiguration (Boot-Manager, Pfad `bootmgfw.efi`)
- `Confirm-SecureBootUEFI` – Secure-Boot-Status

## Einfach

Beim **Einschalten** deines Computers passiert etwas wie **Aufstehen am Morgen**:

**BIOS** ist der **alte Wecker** von 1981: Er klingelt, schaut in den **ersten Sektor** der Festplatte und ruft „Wer ist hier der Chef?“ Der **MBR** ist ein **Zettel mit 4 Zeilen** – mehr Platz gibt es nicht, und der Zettel kann **nur bis 2 Terabyte lesen**. Wenn der Zettel kaputt ist, ist **alles weg**, denn es gibt **keine Kopie**.

**UEFI** ist der **moderne Smartphone-Wecker**: Er hat eine **Oberfläche**, **lädt schneller** und schaut erst nach, ob der **Bootloader ein gültiges Siegel** hat (**Secure Boot**). Die **GPT** ist eine **Liste mit 128 Zeilen**, sie liest auch **riesige Festplatten** und hat **am Ende eine Kopie** und **Prüfsummen** – ist eine Stelle kaputt, wird sie repariert.

Warum wichtig? **Windows 11** will **UEFI + Secure Boot + TPM**. Dein alter Rechner mit „Legacy/CSM“ und MBR startet **nicht**, bis du **umstellst** (mit **MBR2GPT**, ohne Datenverlust). Vorsicht bei **diskpart convert gpt**: Das ist wie den Zettel **wegwerfen und neu schreiben** – alle Daten weg.

## Merksatz
- **BIOS = MBR, UEFI = GPT.**
- **MBR: 4 Partitionen, max. 2 TB.** **GPT: 128, praktisch unbegrenzt.**
- **ESP = FAT32**, enthält den Bootloader.
- **Secure Boot** = nur signierte Bootloader.
- **Windows 11** = **UEFI + Secure Boot + TPM 2.0**.
- **MBR2GPT** = ohne Datenverlust, **diskpart convert** = Datenverlust.

## Prüfungsfalle
- **UEFI kann auch MBR-Medien booten (mit CSM)**, aber **Windows-Installation im UEFI-Modus verlangt GPT**.
- **MBR2GPT konvertiert nur** – danach **muss die Firmware auf UEFI** umgestellt werden, sonst startet das System nicht.
- **GPT hat einen Schutz-MBR**, damit alte Tools den Datenträger nicht als „leer“ sehen.
- **Secure Boot ≠ BitLocker**: Secure Boot schützt den **Startvorgang**, BitLocker die **Daten**.
- **Datenträger > 2 TB** brauchen GPT, um **vollständig** genutzt zu werden.

## Grafik
### Boot-Ablauf
Zwei Bahnen nebeneinander: BIOS (POST → MBR lesen → Bootloader → Windows) und UEFI (POST → ESP lesen → Signaturprüfung → Bootloader → Windows). Bei ungültiger Signatur springt das UEFI-Tor auf „gesperrt“.

### Datenträgerlayout
Ein Balken; oben MBR (ein Sektor, 4 Slots), unten GPT (Header, 128 Slots, Backup am Ende). Ein Klick auf „Sektor 0 kaputt“ zerstört den MBR-Balken, GPT repariert sich aus der Kopie.

## Karteikarten
- F: Wofür steht BIOS/UEFI? | A: Basic Input/Output System / Unified Extensible Firmware Interface.
- F: Wie viele primäre Partitionen erlaubt MBR? | A: 4.
- F: Wie groß darf ein MBR-Datenträger höchstens sein? | A: 2 TB.
- F: Wie viele Partitionen unter Windows bei GPT? | A: 128.
- F: Wo liegt der Bootloader bei UEFI? | A: In der EFI-Systempartition (ESP, FAT32).
- F: Was ist CSM? | A: Compatibility Support Module, BIOS-Emulation im UEFI.
- F: Was schützt Secure Boot? | A: Den Startvorgang vor unsignierten Bootloadern (Bootkits).
- F: Welche Voraussetzungen hat Windows 11 an die Firmware? | A: UEFI, Secure Boot, TPM 2.0.
- F: Wie konvertiert man ohne Datenverlust von MBR zu GPT? | A: `mbr2gpt /convert`.
- F: Was löscht Daten beim Umwandeln zu GPT? | A: `diskpart` → `convert gpt`.
- F: Wie heißt die Prüfung im Setup, ob UEFI aktiv ist? | A: `msinfo32` → BIOS-Modus.
- F: Was ist der Vorteil von GPT bei Fehlern? | A: Backup-Header am Ende und CRC-Prüfsummen.

## Quiz
? Wie viele primäre Partitionen erlaubt MBR?
* 4
- 128
- 8
- Unbegrenzt

? Wie groß darf ein MBR-Datenträger nutzbar höchstens sein?
* 2 TB
- 512 GB
- 4 TB
- 16 TB

? Welches Dateisystem hat die EFI-Systempartition?
* FAT32
- NTFS
- ReFS
- ext4

? Was gehört nicht zu den Anforderungen von Windows 11 an die Firmware?
* Legacy-BIOS mit CSM
- UEFI
- Secure Boot
- TPM 2.0

? Welcher Befehl konvertiert MBR nach GPT ohne Datenverlust?
* mbr2gpt /convert
- diskpart convert gpt
- format /fs:gpt
- bcdedit /gpt

? Was ist CSM?
* Eine BIOS-Emulation im UEFI
- Ein Verschlüsselungsmodul
- Ein Dateisystem
- Ein Netzwerkboot-Protokoll
