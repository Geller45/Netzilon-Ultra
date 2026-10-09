---
id: ap1-a1-mainboard
bereich: AP1
block: A1
kapitel: Hardware
titel: Mainboard, BIOS & UEFI
stufe: Einsteiger
quellen: [02_Übung_Mainboard.pdf]
verweise: [ap1-a1-chipsatz, ap1-a1-prozessor, ap1-a1-arbeitsspeicher, ap1-a1-pci]
---

## Profi

### Aufgaben des Mainboards
Das Mainboard (Hauptplatine, Motherboard) ist die zentrale Leiterplatte, auf der alle Komponenten zusammenkommen. Klassische Funktionen:
1. **Träger und Verbindung** aller Komponenten (CPU-Sockel, RAM-Bänke, Erweiterungsslots, Anschlüsse).
2. **Stromverteilung**: Die Spannungswandler (VRM – Voltage Regulator Module) erzeugen aus den 12 V des Netzteils die niedrige Kernspannung der CPU (ca. 0,7–1,5 V).
3. **Kommunikation** über Bussysteme und Leiterbahnen (PCIe-Lanes, Speicherkanäle, DMI).
4. **Firmware** (BIOS/UEFI) für Initialisierung und Start des Systems.
5. **Integrierte Controller** (onboard): Netzwerk, Sound, USB, SATA, teils WLAN/Bluetooth.
6. **Überwachung**: Temperatur- und Spannungssensoren, Lüftersteuerung.

### Onboard vs. dediziert
| | Onboard (integriert) | Dediziert (Steckkarte) |
|---|---|---|
| Vorteile | günstig, stromsparend, kein Steckplatz belegt | höhere Leistung, austauschbar, eigener Speicher (z. B. VRAM), spezielle Funktionen |
| Nachteile | geringere Leistung, teilt Ressourcen (z. B. Arbeitsspeicher bei iGPU), bei Defekt Board betroffen | teurer, mehr Strom und Wärme, belegt Slot |

### Steckplätze und Bestückung
| Steckplatz | Bestückung |
|---|---|
| CPU-Sockel (Intel LGA 1700/1851, AMD AM5) | Prozessor – Pins sitzen heute im Sockel (LGA), früher an der CPU (PGA) |
| DIMM-Bänke | Arbeitsspeicher DDR4/DDR5 (nicht kompatibel – andere Kerbe) |
| PCIe x16 | Grafikkarte, NVMe-Adapter mit mehreren SSDs |
| PCIe x1/x4 | Netzwerkkarte, Soundkarte, USB-Erweiterung, Capture-Karte |
| M.2 (M-Key) | NVMe-SSD (PCIe) oder M.2-SATA-SSD |
| M.2 (E-Key) | WLAN-/Bluetooth-Modul |
| SATA | 2,5"/3,5"-Festplatten und SSDs, optische Laufwerke |

### CMOS-/BIOS-Batterie
Eine Knopfzelle (meist **CR2032**, 3 V) versorgt die **Echtzeituhr (RTC)** und bei älteren Boards den **CMOS-Speicher** mit den BIOS-Einstellungen, solange der PC vom Strom getrennt ist. Ist sie leer: falsche Uhrzeit nach dem Start, Einstellungen verloren, Fehlermeldungen beim Start (z. B. „CMOS checksum error“). Heute liegen Einstellungen oft in Flash/NVRAM – die Batterie wird vor allem für die Uhr gebraucht.

### Farbige RAM-Bänke
Die Farben zeigen die **Kanalzuordnung für Dual-Channel**. Wer zwei Module einsetzt, soll sie nach Handbuch in die richtigen Bänke stecken (meist A2 und B2), damit beide Speicherkanäle parallel arbeiten.

### Formfaktoren
| Formfaktor | Maße | Einsatz |
|---|---|---|
| E-ATX | 30,5 × 33,0 cm | Workstations, Enthusiasten, viele Slots |
| ATX | 30,5 × 24,4 cm | Standard-Desktop |
| Micro-ATX (µATX) | 24,4 × 24,4 cm | Büro-PCs, weniger Slots (max. 4) |
| Mini-ITX | 17,0 × 17,0 cm | HTPC, Kompakt-PC, 1 Steckplatz, meist 2 RAM-Bänke |

**AT vs. ATX**: Beim alten AT-Standard schaltete ein mechanischer Netzschalter den Strom hart ab. **ATX** (1995) liefert eine **Standby-Spannung (+5 VSB)** – dadurch kann das Betriebssystem den PC per Software herunterfahren (Soft-Off), und Funktionen wie Wake-on-LAN oder Einschalten per Tastatur werden möglich.

**I/O-Blende**: Metallabdeckung an der Gehäuserückseite mit Ausschnitten für die Anschlüsse des Mainboards; schirmt ab und verhindert Staub. Genormt sind nur Größe und Lage des Ausschnitts im Gehäuse – **die Anordnung der Anschlüsse ist nicht genormt**, deshalb liegt jedem Board eine eigene Blende bei (oft schon aufgesetzt).

**Typische Rückseiten-Anschlüsse**: USB-A und USB-C, RJ45 (LAN), Audio (Klinke, S/PDIF), HDMI/DisplayPort (für iGPU), BIOS-Flashback-Taste, WLAN-Antennenanschlüsse, teils PS/2.

### BIOS
Das **BIOS** (Basic Input/Output System) ist die Firmware auf einem Flash-Chip des Mainboards. Aufgaben heute:
1. **POST** (Power-On Self-Test): Prüft CPU, RAM, Grafik beim Start. Fehler werden über Piepcodes oder Diagnose-LEDs gemeldet.
2. Initialisierung der Hardware.
3. Suche nach einem bootfähigen Gerät und Start des Bootloaders.
4. Bereitstellung der Einstellungen (Setup).

Einstellungen im BIOS/UEFI: Bootreihenfolge, Datum/Uhrzeit, Virtualisierung (Intel VT-x/AMD-V), Speicherprofil (XMP/EXPO), Secure Boot, TPM/fTPM, SATA-Modus (AHCI/RAID), Lüfterkurven, Energieoptionen (Wake-on-LAN), Onboard-Geräte an/aus, Passwörter.

### UEFI
**UEFI** (Unified Extensible Firmware Interface) ist der Nachfolger des BIOS. Unterschiede:
| | Legacy-BIOS | UEFI |
|---|---|---|
| Partitionsschema | MBR (max. 2 TB, 4 primäre Partitionen) | GPT (bis 9,4 ZB, 128 Partitionen) |
| Modus | 16-Bit | 32/64-Bit |
| Oberfläche | Text, Tastatur | grafisch, Maus |
| Sicherheit | – | **Secure Boot** (nur signierte Bootloader) |
| Start | langsamer | schneller, Netzwerk-Boot integriert |

Das **CSM** (Compatibility Support Module) emuliert ein altes BIOS für alte Betriebssysteme. **Windows 11 verlangt UEFI mit Secure Boot und TPM 2.0.** Umgangssprachlich wird UEFI oft weiter „BIOS“ genannt.

## Einfach

Das Mainboard ist die **Stadt**, in der alle Teile des Computers wohnen.

- Die **CPU** ist das Rathaus, in dem entschieden wird.
- Der **Arbeitsspeicher** ist der Schreibtisch, auf dem gerade gearbeitet wird.
- Die **Leiterbahnen** auf dem Mainboard sind die Straßen, auf denen die Daten wie Autos fahren.
- Die **Spannungswandler** sind wie Trafostationen: Aus dem „starken“ Strom des Netzteils machen sie den ganz feinen Strom, den der Prozessor verträgt.

**Onboard oder dediziert?** Onboard heißt „schon eingebaut“ – wie ein Radio, das im Auto schon drin ist. Dediziert heißt „extra gekauft und eingesteckt“ – wie ein teures Soundsystem, das man nachrüstet. Eingebaut ist billig und praktisch, extra ist besser, aber teurer.

**Die kleine Batterie**: Auf dem Mainboard sitzt eine Knopfzelle wie in einer Armbanduhr. Die hält die Uhr des Computers am Laufen, wenn der Stecker gezogen ist. Ist sie leer, weiß der Computer nach dem Einschalten nicht mehr, welcher Tag ist.

**Bunte RAM-Plätze**: Die Farben sind wie bei Parkplätzen für Eltern mit Kind: Wenn du zwei Speicherriegel hast, stellst du sie auf die gleichfarbigen Plätze – dann arbeiten sie im Team doppelt so schnell.

**Größen**: Mainboards gibt es in Größen wie Pizzen – E-ATX ist die Familienpizza, ATX die normale, Micro-ATX die kleine und Mini-ITX die Mini-Pizza für ganz kleine Gehäuse.

**BIOS und UEFI**: Wenn du den PC einschaltest, wacht zuerst das BIOS auf – wie ein Hausmeister, der morgens das Schulgebäude aufschließt. Er prüft: Licht an? Heizung an? Alle Türen okay? (Das ist der POST.) Dann sucht er den Lehrer (das Betriebssystem) und lässt ihn herein. **UEFI** ist der moderne Hausmeister: Er kann mit der Maus bedient werden, schließt schneller auf und lässt nur Lehrer mit gültigem Ausweis rein (**Secure Boot**) – so kommen keine Einbrecher (Schadsoftware) beim Start ins Haus.

**AT und ATX**: Früher war der Ausschalter wie ein Lichtschalter: Klick – sofort dunkel. Bei ATX bleibt ein kleiner „Wachhund-Strom“ an, damit Windows den PC selbst sauber ausschalten und sogar wieder aufwecken kann.

## Merksatz
- **POST** = „Pieps Oder Start Test“ – der Selbsttest beim Einschalten.
- **UEFI + GPT + Secure Boot** gehören zusammen; **BIOS + MBR** sind die Alten.
- MBR = max. **2 TB** und **4** primäre Partitionen.
- ATX = Soft-Off dank **5 V Standby**.
- Mainboard-Größen groß → klein: **E-ATX > ATX > µATX > Mini-ITX**.

## Prüfungsfalle
- Die Batterie speichert nicht „das BIOS“ – das BIOS selbst liegt im Flash-Chip.
- MBR kann keine Festplatten über 2 TB vollständig nutzen – GPT benötigt.
- DDR4- und DDR5-Module passen nicht in dieselbe Bank (andere Kerbe).
- Die Anordnung der Rückseitenanschlüsse ist nicht genormt.
- Windows 11 installiert standardmäßig nicht ohne UEFI, Secure Boot und TPM 2.0.

## Grafik
### Stadtplan Mainboard
1. Draufsicht auf ein ATX-Board, Bauteile werden nacheinander beschriftet (Sockel, RAM, PCIe, M.2, SATA, Chipsatz, Batterie, VRM).
2. Beim Hover leuchtet das jeweilige Bauteil; eine Sprechblase zeigt Funktion und Beispiel.

### Bootvorgang
1. Einschalten → Netzteil liefert Strom.
2. UEFI startet → POST prüft CPU, RAM, GPU (Häkchen erscheinen).
3. Secure Boot prüft die Signatur des Bootloaders (Schloss-Symbol).
4. Bootloader lädt → Windows-Logo.

### Formfaktoren-Vergleich
Vier Platinen werden maßstabsgetreu übereinandergelegt; beim Klick zeigt die App Maße und Anzahl der Slots.

## Karteikarten
- F: Nenne fünf Aufgaben des Mainboards. | A: Komponenten verbinden, Strom verteilen (VRM), Kommunikation über Busse, Firmware bereitstellen, integrierte Controller, Sensorüberwachung.
- F: Wofür ist die CMOS-Batterie da? | A: Versorgt Echtzeituhr (und ggf. CMOS-Einstellungen), wenn der PC vom Strom getrennt ist.
- F: Was ist POST? | A: Power-On Self-Test – Selbsttest der Hardware beim Einschalten.
- F: Unterschied AT und ATX beim Ausschalten? | A: ATX hat eine 5-V-Standby-Spannung und erlaubt Soft-Off per Software; AT schaltet mechanisch hart ab.
- F: Maße Mini-ITX? | A: 17 × 17 cm.
- F: Maße ATX? | A: 30,5 × 24,4 cm.
- F: Drei Vorteile von UEFI gegenüber BIOS? | A: GPT (>2 TB), Secure Boot, grafische Oberfläche/schnellerer Start/64-Bit.
- F: Was ist CSM? | A: Compatibility Support Module – emuliert ein Legacy-BIOS unter UEFI.
- F: Warum sind RAM-Bänke farbig? | A: Kennzeichnung der Speicherkanäle für Dual-Channel-Bestückung.
- F: Was ist eine I/O-Blende? | A: Abdeckung an der Gehäuserückseite mit Ausschnitten für die Mainboard-Anschlüsse.

## Quiz
? Welche Aussage zu MBR ist richtig?
* MBR unterstützt maximal 4 primäre Partitionen und ca. 2 TB
- MBR unterstützt 128 Partitionen
- MBR wird für Secure Boot benötigt
- MBR ist der Nachfolger von GPT

? Nach einem Batteriewechsel ist das BIOS/UEFI…
* noch vorhanden, nur Uhrzeit und evtl. Einstellungen sind zurückgesetzt
- gelöscht und muss neu geflasht werden
- auf den Werkszustand von Windows gesetzt
- unverändert inklusive Uhrzeit

? Welcher Formfaktor ist am kleinsten?
* Mini-ITX
- Micro-ATX
- ATX
- E-ATX

? Welche Funktion verhindert beim Start das Laden nicht signierter Bootloader?
* Secure Boot
- CSM
- POST
- XMP

? Was ermöglicht die Standby-Spannung bei ATX?
* Herunterfahren per Software und Wake-on-LAN
- Höhere CPU-Taktraten
- Den Betrieb ohne Netzteil
- Das Speichern der BIOS-Einstellungen ohne Batterie

? Welche Partitionierung verwendet UEFI standardmäßig für das Systemlaufwerk?
* GPT (GUID Partition Table)
- MBR mit erweiterter Partition
- FAT12
- Keine Partitionierung
! GPT erlaubt mehr als 2 TiB und 128 Partitionen unter Windows.

? Wo wird die Firmware des Mainboards gespeichert?
* In einem Flash-Speicher (EEPROM) auf dem Mainboard
- Auf der Systemfestplatte
- Im Arbeitsspeicher
- In der Grafikkarte
! Daher kann sie per Firmware-Update „geflasht“ werden.

? Welche Aufgabe hat der POST beim Einschalten?
* Er prüft grundlegende Hardware (RAM, CPU, Grafik) vor dem Laden des Betriebssystems.
- Er installiert Treiber im Betriebssystem.
- Er verschlüsselt die Festplatte.
- Er vergibt eine IP-Adresse.
! Power-On Self Test – Fehler werden über Piepcodes oder Debug-LEDs angezeigt.
