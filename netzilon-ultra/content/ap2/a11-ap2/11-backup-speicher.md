---
id: ap2-backup-speicher
bereich: AP2
block: A11
kapitel: Speicher und Datensicherung
titel: NAS, SAN, iSCSI und Backup-Konzepte
stufe: Fortgeschritten
quellen: [BSI CON.3, IHK-Prüfungskatalog]
verweise: [ap2-hochverfuegbarkeit, ap2-it-sicherheit, az801-azure-backup]
---

## Profi

### Speicherarchitekturen
| | **DAS** | **NAS** | **SAN** |
|---|---|---|---|
| **Anbindung** | **Direkt** (SATA/SAS/USB) | **LAN (Ethernet)** | **Eigenes Speichernetz** |
| **Zugriff** | Block | **Datei** | **Block** |
| **Protokolle** | – | **SMB/CIFS, NFS** | **Fibre Channel, iSCSI, FCoE, NVMe-oF** |
| **Einsatz** | Einzelserver | **Dateiablage** | **Datenbanken, Virtualisierung** |

**iSCSI**: **SCSI-Befehle über TCP/IP (Port 3260)**. **Target** (Speicher) ↔ **Initiator** (Server), **LUN** = logische Einheit, **IQN** = Name, Sicherheit: **CHAP**, eigenes **VLAN/Netz**, **MPIO** (Mehrpfad).
**Fibre Channel**: **HBA**, **WWN**, **Zoning**, **LUN-Masking**, hohe Leistung, teuer.

### Datensicherungsarten
| Art | Sichert | Archivbit | Wiederherstellung |
|---|---|---|---|
| **Vollsicherung** | **Alles** | **Zurückgesetzt** | **1 Satz** – schnell |
| **Differenziell** | **Alles seit letzter Vollsicherung** | **Nicht zurückgesetzt** | **Voll + letzte Differenzielle** |
| **Inkrementell** | **Alles seit letzter Sicherung (egal welcher)** | **Zurückgesetzt** | **Voll + alle Inkrementellen** – langsam |
| **Kopie** | Alles | Unverändert | – |

**Speicherbedarf/Zeit**: Inkrementell **klein/schnell** beim Sichern, **langsam** beim Wiederherstellen. Differenziell **wächst** bis zur nächsten Vollsicherung.
Weitere: **Image/Bare-Metal**, **Snapshot**, **Deduplizierung**, **synthetische Vollsicherung**, **Continuous Data Protection**.

### Rotationsverfahren
**Generationenprinzip (Großvater-Vater-Sohn)**: **Täglich (Sohn)**, **wöchentlich (Vater)**, **monatlich (Großvater)**.
Beispiel: 4 Tagesbänder (Mo–Do) + 4 Wochenbänder (Fr) + 12 Monatsbänder = **20 Medien** für 1 Jahr.
**Türme von Hanoi** (effizient, lange Historie mit wenig Medien).

### 3-2-1-Regel (erweitert 3-2-1-1-0)
**3 Kopien** der Daten, **2 verschiedene Medien**, **1 extern (offsite)**, **1 offline/unveränderlich (immutable/air-gapped)**, **0 Fehler** bei Wiederherstellungstests.

### Medien
**Band (LTO)** (günstig, lange haltbar, offline; **LTO-9 18 TB nativ**), **HDD/NAS**, **Cloud**, **optisch** (Archiv), **WORM** (einmal schreiben, gesetzeskonforme Archivierung).

### Datensicherungskonzept (BSI CON.3)
**Was** (Daten), **wie oft** (RPO), **wie lange** (Aufbewahrung), **wohin** (Medium, Ort), **wer** (Zuständigkeit), **Wiederherstellungszeit** (RTO), **Verschlüsselung**, **Tests**, **Dokumentation**.

### Backup vs. Archiv vs. Replikation
**Backup** = Kopie für **Wiederherstellung**. **Archivierung** = **Langzeitaufbewahrung**, **revisionssicher** (GoBD), Original wird **verschoben**. **Replikation/RAID** = **Verfügbarkeit**, **kein Schutz** vor Löschung/Ransomware.

### Bandbreiten-/Zeitberechnung
**Zeit = Datenmenge ÷ Übertragungsrate**. **Einheiten**: **1 Byte = 8 Bit**; **Netz in Mbit/s**, **Daten in GB/TB**.
Beispiel: **500 GB über 1 Gbit/s**: 500 × 8 = 4.000 Gbit ÷ 1 = **4.000 s ≈ 67 min** (theoretisch).
**Dezimal (GB = 10⁹)** vs. **binär (GiB = 2³⁰)** beachten.

## Einfach
**Vollsicherung** = **ganzes Album fotokopieren**. **Inkrementell** = **nur die neuen Fotos seit gestern** (schnell kopiert, aber beim Zurückholen brauchst du **alle Stapel**). **Differenziell** = **alle neuen seit dem letzten Komplett-Kopieren** (Stapel wird dicker, aber zurück brauchst du **nur zwei**). **3-2-1**: **Drei Kopien**, **zwei Sorten Speicher**, **eine bei Oma**.

## Merksatz
- **Inkrementell: seit letzter Sicherung**, **differenziell: seit letzter Vollsicherung**.
- **Restore diff: Voll + letzte**, **inkr: Voll + alle**.
- **NAS = Datei**, **SAN = Block**.
- **iSCSI Port 3260**.
- **3-2-1-1-0**.
- **RAID/Replikation ist kein Backup**.
- **Byte × 8 = Bit**.

## Prüfungsfalle
- **Differenziell** setzt **Archivbit nicht** zurück.
- **Bit/Byte** verwechselt.
- **Snapshot auf demselben System** ≠ Backup.
- **Wiederherstellung nie getestet**.
- **Backup im selben Netz** → **Ransomware verschlüsselt mit**.
- **GFS-Medienanzahl** falsch gezählt.

## Grafik
### Stapel
Montag großer Stapel (voll), Dienstag bis Freitag kleine (inkrementell) bzw. wachsende (differenziell) Stapel.

### 3-2-1
Drei Ordner, zwei Medientypen, einer im Auto zu einem anderen Ort.

## Übungen
- A: Voll So, inkrementell Mo–Fr. Ausfall Do Mittag. Was wiederherstellen? | L: Voll (So) + Mo + Di + Mi.
- A: Voll So, differenziell Mo–Fr. Ausfall Do Mittag. Was? | L: Voll (So) + Mi.
- A: 2 TB über 100 Mbit/s. Dauer? | L: 2.000 GB × 8 = 16.000 Gbit = 16.000.000 Mbit ÷ 100 = 160.000 s ≈ 44,4 h.

## Karteikarten
- F: Was sichert eine inkrementelle Sicherung? | A: Alle Änderungen seit der letzten Sicherung.
- F: Was sichert eine differenzielle Sicherung? | A: Alle Änderungen seit der letzten Vollsicherung.
- F: Was braucht man zur Wiederherstellung bei inkrementell? | A: Letzte Vollsicherung und alle folgenden Inkrementellen.
- F: Was bedeutet 3-2-1? | A: 3 Kopien, 2 Medien, 1 extern.
- F: Unterschied NAS und SAN? | A: NAS Dateizugriff über LAN, SAN Blockzugriff über eigenes Netz.
- F: Port von iSCSI? | A: 3260.
- F: Was ist das GVS-/GFS-Prinzip? | A: Großvater-Vater-Sohn: tägliche, wöchentliche, monatliche Sicherungen.
- F: Ist RAID ein Backup? | A: Nein.
- F: Was ist WORM? | A: Write Once Read Many, unveränderbarer Speicher.
- F: Wie viele Bit hat ein Byte? | A: 8.

## Quiz
? Welche Sicherung setzt das Archivbit nicht zurück?
* Differenzielle
- Inkrementelle
- Vollsicherung
- Keine

? Welches Protokoll überträgt Blockspeicher über TCP/IP?
* iSCSI
- SMB
- NFS
- FTP

? Voll am Sonntag, differenziell täglich, Ausfall Freitag früh. Was wird benötigt?
* Voll + Donnerstag
- Voll + Mo bis Do
- Nur Donnerstag
- Nur Voll

? Was schützt vor Ransomware-Verschlüsselung des Backups?
* Offline- oder unveränderliche Kopie
- RAID 1
- Snapshot auf demselben Volume
- Längere Passwörter

? Wie lange dauert 100 GB über 1 Gbit/s theoretisch?
* 800 Sekunden
- 100 Sekunden
- 8 Sekunden
- 8.000 Sekunden

? Welche Zugriffsart bietet ein NAS?
* Dateibasiert (SMB, NFS)
- Blockbasiert per Fibre Channel
- Nur über USB
- Nur über SATA
! SAN und iSCSI liefern Blockspeicher.

? Was besagt die 3-2-1-Backup-Regel?
* 3 Kopien, 2 verschiedene Medien, 1 Kopie außer Haus
- 3 Backups pro Tag, 2 pro Nacht, 1 am Wochenende
- 3 Server, 2 Switches, 1 Firewall
- 3 Jahre Aufbewahrung, 2 Prüfungen, 1 Restore
! Erweiterung 3-2-1-1-0: eine Kopie offline/unveränderlich, 0 Fehler bei Restore-Tests.

? Welches Protokoll wird von iSCSI zur Übertragung genutzt?
* TCP/IP über Ethernet (Port 3260)
- Fibre Channel ohne IP
- UDP 514
- HTTP
! Initiator (Server) greift auf Target (Speicher) zu.
