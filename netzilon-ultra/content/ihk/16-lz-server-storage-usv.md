---
id: ihk-lz-server-storage
bereich: Prüfung
block: IHK
kapitel: Lernzettel-Inhalte
titel: Server, RAID, Backup, USV und Betrieb – Prüfungswissen
stufe: Fortgeschritten
fach: PV – AP2
pruefungen: [AP1, AP2]
quellen: [Server allgemein.docx, RAID Backup.docx, USV & Stromversorgung.docx, Projektmanagement ++.docx, Lernzettel_AP1AP2_2024.pdf, Ergänzung Lernzettel.docx, Server allgemein.pdf, RAID Backup.pdf, USV & Stromversorgung.pdf, Projektmanagement ++.pdf]
verweise: [ihk-berechnungen-lernzettel, ihk-vor-nachteile, ihk-fehleranalyse, ihk-lz-sicherheit]
---

## Profi

### Server-Hardware
Auswahl nach Einsatzzweck: **Datenbankserver** (schneller Speicher NVMe/SSD, viel RAM), **Virtualisierungshost** (viele CPU-Kerne, viel RAM, VT-Unterstützung). **ECC-RAM** korrigiert Bitfehler; Leistungsdaten: effektiver Takt (MHz), CAS Latency, Datenrate (GB/s). Speicher: NVMe SSD, SAS/SATA. Redundanz: **redundante Netzteile** (80 PLUS Platinum/Titanium), Hot-Swap-Lüfter, **Dual-Port-NIC** (25/100 GbE); LWL bietet Reichweite und EMV-Unempfindlichkeit.

### Virtualisierung und Container
Vorteile: Auslastung, Kosten, Flexibilität, Snapshots. Nachteile: Single Point of Failure, Overhead, komplexere Administration. **Hypervisor Typ 1** (Bare-Metal: ESXi, Hyper-V), **Typ 2** (Hosted: VirtualBox, Workstation). **Container** teilen den OS-Kern → leichter als VMs. **Skalierung**: vertikal (scale up: mehr CPU/RAM) vs. horizontal (scale out: mehr Knoten). **Blue-Green-Deployment**: zwei identische Umgebungen; Staging wird getestet, dann schaltet der Loadbalancer um → keine Downtime. **Cloud**: IaaS/PaaS/SaaS, Abrechnung nach Verbrauch (Measured Service).

### Betrieb und Monitoring
Bottleneck-Analyse (CPU, RAM, Datenträger, Netzwerk), **Badewannenkurve**, **MTBF/MTTF/MTTR**, Availability (99 % = 87,6 h Ausfall/Jahr). **Härtung**: BIOS/UEFI (Boot-Reihenfolge, USB aus, Secure Boot, TPM 2.0), OS (unnötige Dienste aus, Defaults ändern). **Lizenzen**: User-CAL (pro Benutzer, viele Geräte je Nutzer), Device-CAL (pro Gerät, Schichtbetrieb). **Patch** (Fehler/Sicherheitslücken, schnell), **Update** (kleinere Verbesserungen), **Upgrade** (neue Hauptversion, meist kostenpflichtig). **Testverfahren**: White-Box (Quellcode bekannt), Black-Box (nur Ein-/Ausgabe).

### RAID
| Level | Mindestplatten | Fehlertoleranz | Nettokapazität |
|---|---|---|---|
| 0 | 2 | keine | n·C |
| 1 | 2 | 1 | C |
| 5 | 3 | 1 | (n−1)·C |
| 6 | 4 | 2 | (n−2)·C |
| 10 | 4 | je Spiegelpaar 1 | n/2·C |
| 15 | 6 | hoch | Spiegelung + Parität |
**Hot-Spare**: ungenutzte Reserveplatte, startet automatisch den Rebuild. **JBOD**: nur aneinandergereiht, keine Redundanz. **RAID ersetzt kein Backup.** **Mix-and-Match**: Platten verschiedener Chargen/Hersteller verhindern Serienfehler-Mehrfachausfall.

### Backup
**Voll** (alle Daten; größter Platzbedarf, schnellster Restore), **inkrementell** (Änderungen seit letzter Sicherung; klein, Restore = Voll + alle Inkremente), **differenziell** (Änderungen seit letzter Vollsicherung; wächst, Restore = Voll + letzte Differenz). **RTO** (Dauer bis Wiederherstellung), **RPO** (max. Datenverlustzeitraum, bestimmt durch Sicherungsintervall). **3-2-1**, **GFS** (Tag/Woche/Monat), **Air Gap**, **LTO** (+ LTFS), **Deduplizierung** (10–30-fach), **Backup vs. Archiv** (Archiv langfristig, revisionssicher, unveränderbar). Restore regelmäßig testen.

### USV (IEC 62040-3)
**VFD** (Offline/Standby): Netz direkt, bei Ausfall Umschaltung. **VI** (Line-Interactive): Regeltransformator gleicht Unter-/Überspannung aus. **VFI** (Online, Doppelwandler): Last vollständig entkoppelt, keine Umschaltzeit. VI teurer als VFD. **Berechnung**: Laufzeit = nutzbare Wh : Last (W); Aggregat-Start (3 min) → Startschwelle in % so wählen, dass Rest-Laufzeit ≥ 3 min. Management: IPMI/Redfish, USV-Software für kontrollierten Shutdown; USV im gesicherten Serverraum.

## Einfach

**Ein Server ist ein Computer, der nie Feierabend hat.** Deshalb ist er mit doppelten Teilen gebaut: zwei Netzteile (fällt eins aus, läuft er weiter), austauschbare Lüfter, mehrere Netzwerkanschlüsse.

**Virtuelle Maschinen:** Auf einem großen Computer laufen viele kleine „Pseudo-Computer“. Der Hypervisor ist der Hausmeister, der die Zimmer verteilt. Typ 1 sitzt direkt im Keller (auf der Hardware), Typ 2 wohnt in einer Wohnung (auf einem Betriebssystem). Container sind noch leichter: Alle teilen sich die Küche (den Kern) des Hauses.

**RAID: Plattenverbund.** Mehrere Festplatten tun sich zusammen. RAID 5 bleibt ganz, wenn EINE Platte ausfällt, RAID 6 sogar bei ZWEI. RAID 10 ist wie zwei Kopien deiner Hausaufgaben, die auch noch abwechselnd geschrieben werden. Die Reserveplatte (Hot-Spare) wartet auf ihren Einsatz. Aber: RAID ist kein Backup! Wenn du aus Versehen etwas löschst, ist es auf allen Platten weg.

**Backup:**
- Voll: alles kopieren (braucht viel Platz).
- Differenziell: alles, was seit der letzten Vollsicherung neu ist (wird jeden Tag größer).
- Inkrementell: nur das, was seit gestern neu ist (klein, aber zum Zurückholen brauchst du die ganze Kette).
**RTO:** Wie lange darf es dauern, bis alles wieder läuft? **RPO:** Wie viele Stunden Arbeit darf ich verlieren?
**3-2-1:** 3 Kopien, 2 Sorten Medien, 1 woanders.

**USV:** Der Akku, der den Strom hält, wenn das Licht ausgeht. Offline-USV wartet und springt ein (kurze Lücke). Line-Interactive glättet zusätzlich Spannung. Online-USV macht aus Strom immer frischen Strom (keine Lücke).

**Testen:** White-Box: Du siehst in die Maschine hinein. Black-Box: Du drückst nur Knöpfe und beobachtest. 

**Updates:** Patch = Pflaster. Update = kleine Verbesserung. Upgrade = neue Version.

## Merksatz
- RAID 5 n−1, RAID 6 n−2, RAID 10 halb. RAID ≠ Backup.
- Differenziell: Voll + letzte Differenz. Inkrementell: Voll + alle Inkremente.
- RTO = Zeit, RPO = Datenverlust.
- USV: VFD wartet, VI regelt, VFI wandelt dauerhaft.
- Typ 1 direkt auf Hardware, Typ 2 auf Betriebssystem.

## Prüfungsfalle
- Inkrementell vs. differenziell beim **Restore** unterscheiden.
- Hot-Spare nicht zur Nutzkapazität zählen.
- RPO wird vom **Sicherungsintervall** bestimmt, nicht von der Restore-Dauer.
- VFD ist nicht VFI: „Online“ = VFI.
- MTBF (reparierbar) vs. MTTF (nicht reparierbar, z. B. SSD).
- Container ≠ VM: Container teilen den Kernel.

## Grafik
### Differenzielle und inkrementelle Wiederherstellung
1. Backup-Server: Sonntag Vollsicherung
2. Backup-Server: Montag Änderungen A
3. Backup-Server: Dienstag Änderungen B
4. Admin -> Backup-Server: Restore Mittwoch, differenziell
5. Backup-Server: Voll + Dienstag-Differenz (A+B)
6. Admin -> Backup-Server: Restore Mittwoch, inkrementell
7. Backup-Server: Voll + Montag + Dienstag

### RAID-5-Ausfall
1. Disk1: normal
2. Disk2: fällt aus
3. Disk3: liefert Parität und Daten
4. RAID-Controller: rekonstruiert fehlende Blöcke aus Daten und Parität
5. Hot-Spare -> Disk2: Rebuild startet automatisch

## Spickzettel
- RAID 5 (n−1), 6 (n−2), 10 (n/2); Hot-Spare, JBOD ohne Redundanz
- Backup: Voll, inkrementell, differenziell; RTO, RPO; 3-2-1; Air Gap; LTO
- USV: VFD, VI, VFI
- Hypervisor Typ 1/2; Container teilen Kernel; Scale up/out; Blue-Green
- User-CAL vs. Device-CAL; Patch/Update/Upgrade
- Badewanne; MTBF/MTTF; 99 % = 87,6 h

## Zuordnen
### USV-Typ und Eigenschaft
- VFD => Netz direkt, Umschaltung bei Ausfall
- VI => Regeltransformator gleicht Spannungsschwankungen aus
- VFI => Doppelwandlung ohne Umschaltzeit

## Reihenfolge
### Blue-Green-Deployment
1. Neue Version in Staging-Umgebung installieren
2. Staging testen
3. Loadbalancer auf neue Umgebung umschalten
4. Alte Umgebung als Rollback bereithalten

## Karteikarten
- F: RAID 5 Mindestplatten und Ausfalltoleranz? | A: 3 Platten, 1 Ausfall
- F: RAID 6 Mindestplatten und Ausfalltoleranz? | A: 4 Platten, 2 Ausfälle
- F: Was ist ein Hot-Spare? | A: Ungenutzte Reserveplatte für automatischen Rebuild
- F: Was ist JBOD? | A: Aneinandergereihte Platten ohne Redundanz
- F: Inkrementell vs. differenziell? | A: Seit letzter Sicherung vs. seit letzter Vollsicherung
- F: Was ist RTO? | A: Maximale Wiederherstellungsdauer
- F: Was ist RPO? | A: Maximal tolerierter Datenverlust (Zeitraum)
- F: USV-Typen? | A: VFD (Offline), VI (Line-Interactive), VFI (Online)
- F: Typ-1-Hypervisor Beispiele? | A: VMware ESXi, Microsoft Hyper-V
- F: Container vs. VM? | A: Container teilen den Betriebssystemkern
- F: Horizontale vs. vertikale Skalierung? | A: Mehr Knoten vs. mehr Ressourcen pro Knoten
- F: Blue-Green-Deployment? | A: Zwei identische Umgebungen, Umschalten per Loadbalancer ohne Ausfall
- F: User-CAL vs. Device-CAL? | A: Pro Benutzer vs. pro Gerät
- F: Backup vs. Archivierung? | A: Backup kurzfristig zur Wiederherstellung; Archiv langfristig, revisionssicher

## Quiz
? Wie viele Platten braucht RAID 6 mindestens?
* 4
- 2
- 3
- 6

? Was bedeutet Hot-Spare?
* Ungenutzte Reserveplatte, die bei Ausfall automatisch einspringt
- Zweite Festplatte im Spiegel
- Kühlung für Festplatten
- Backup auf Band

? Was ist für die Wiederherstellung einer differenziellen Sicherung nötig?
* Letzte Vollsicherung und die letzte differenzielle Sicherung
- Nur die letzte differenzielle
- Alle inkrementellen Sicherungen
- Nur die Vollsicherung

? Welche USV hat keine Umschaltzeit?
* VFI (Online)
- VFD
- VI
- Alle drei

? Welcher Hypervisor ist Typ 1?
* VMware ESXi
- VirtualBox
- VMware Workstation
- Docker

? Was gilt für Container?
* Sie teilen sich den Betriebssystemkern des Hosts
- Jeder Container hat einen eigenen Kernel
- Sie benötigen immer einen Typ-2-Hypervisor
- Sie sind schwerer als VMs

? Was beschreibt RPO?
* Maximal zulässiger Datenverlust als Zeitraum
- Zeit bis zur Wiederherstellung
- Anzahl der Backups
- Größe des Backups

? Wann ist eine Device-CAL günstiger?
* Wenn sich viele Benutzer ein Gerät teilen (Schichtbetrieb)
- Wenn jeder Nutzer mehrere Geräte hat
- Bei Cloud-Diensten immer
- Nie

? Was ist Scale out?
* Hinzufügen weiterer Knoten
- Mehr RAM in einem Server
- Weniger Server
- Stärkere Netzteile

? Welches Verfahren spart Speicher, indem identische Blöcke nur einmal gespeichert werden?
* Deduplizierung
- Defragmentierung
- Partitionierung
- Spiegelung
