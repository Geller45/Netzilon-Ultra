---
id: ap1-a2-raid
bereich: AP1
block: A2
kapitel: Strom & Speicher
titel: RAID
stufe: Fortgeschritten
quellen: [10_Übung_RAID.pdf]
verweise: [ap1-a2-backup, ap1-a2-dateisysteme, az800-storage-spaces]
---

## Profi

### Definition
**RAID** = **Redundant Array of Independent (früher: Inexpensive) Disks**. Mehrere physische Datenträger werden zu **einem logischen Laufwerk** zusammengefasst, um **Ausfallsicherheit** (Redundanz), **Geschwindigkeit** oder beides zu erhöhen. Voraussetzung: **mindestens zwei Datenträger** (RAID 5: drei, RAID 6: vier).

**RAID ersetzt kein Backup!** Es schützt vor dem Ausfall einzelner Platten, **nicht** vor Löschen, Ransomware, Viren, Brand, Diebstahl oder Controllerdefekt – Änderungen werden sofort auf alle Platten geschrieben.

### Hardware- vs. Software-RAID
| | Hardware-RAID (Controller) | Software-RAID (Betriebssystem) |
|---|---|---|
| Umsetzung | eigener Controller mit Prozessor, Cache, oft BBU/Flash-Schutz | Betriebssystem: Windows Datenträgerverwaltung/**Storage Spaces**, Linux mdadm, ZFS |
| Vorteile | entlastet CPU, schneller Schreib-Cache, bootfähig, OS-unabhängig | günstig, flexibel, portabel (kein Controller-Lock-in), einfache Verwaltung |
| Nachteile | teuer, Controller-Defekt → gleiches Modell nötig | belastet CPU, teils nicht bootfähig, abhängig vom OS |
| Mischform | **Fake-/Host-RAID** (Onboard-Chipsatz, z. B. Intel RST) – Treiber rechnet in Software |

### RAID-Level
| Level | Prinzip | min. Platten | Nutzkapazität | fällt aus ohne Datenverlust | Einsatz |
|---|---|---|---|---|---|
| **RAID 0** | **Striping** – Daten blockweise verteilt | 2 | 100 % (n × Größe) | **keine** Platte | Video-Scratch, temporäre Daten |
| **RAID 1** | **Mirroring** – Spiegelung | 2 | 50 % | 1 (von 2) | Systemplatte, kleine Server |
| RAID 3 | Striping auf Byte-Ebene + **eigene Paritätsplatte** | 3 | n − 1 | 1 | Legacy |
| RAID 4 | wie 3, auf Blockebene | 3 | n − 1 | 1 | Legacy |
| **RAID 5** | Striping + **verteilte Parität** | 3 | **n − 1** | 1 | Fileserver, allgemein |
| **RAID 6** | Striping + **doppelte verteilte Parität** | 4 | **n − 2** | 2 | große Arrays, Archiv |
| **RAID 10** (1+0) | Spiegel-Paare, darüber Striping | 4 | 50 % | 1 pro Spiegel (bis zu n/2) | Datenbanken, VMs |
| RAID 01 (0+1) | zwei Stripes, gespiegelt | 4 | 50 % | 1 (sicher) | selten, schlechter als 10 |
| RAID 50 | mehrere RAID 5, darüber Striping | 6 | n − Anzahl RAID-5-Gruppen | 1 pro Gruppe | große Server |
| RAID 30 | mehrere RAID 3, gestriped | 6 | wie 50 | 1 pro Gruppe | Legacy |
| RAID 51 | zwei RAID 5, gespiegelt | 6 | (n/2) − 1 | sehr hoch | sehr selten |

### Details
- **RAID 0** ist streng genommen **kein „richtiges“ RAID**: Das „R“ steht für Redundanz – RAID 0 hat keine. Fällt eine Platte aus, sind **alle Daten** verloren; das Ausfallrisiko steigt mit jeder Platte. Vorteil: Lese- und Schreibgeschwindigkeit steigen fast linear.
- **RAID 1**: Jeder Schreibvorgang geht auf beide Platten; Lesen kann von beiden erfolgen. Typisch für das **Betriebssystem-Volume** eines Servers.
- **RAID 5**: Die **Parität** (per **XOR** berechnet) ist über alle Platten verteilt. Fällt eine Platte aus, lässt sich ihr Inhalt aus den übrigen Daten und der Parität rekonstruieren. Beliebt, weil es **guter Kompromiss** aus Kapazität (nur eine Platte „Verlust“), Sicherheit und Lesegeschwindigkeit ist. Nachteil: **Write Penalty** (jede Schreiboperation braucht Lesen + Neuberechnung der Parität), langer, riskanter **Rebuild** bei großen Platten.
- **Separate Paritätsplatte (RAID 3/4)**: Vorteil: einfach, Datenplatten können einzeln gelesen werden, schnelles sequenzielles Lesen. Nachteil: Die **Paritätsplatte wird zum Flaschenhals** (jeder Schreibvorgang trifft sie) und verschleißt stärker.
- **RAID 6** ist wie RAID 5, aber mit **zwei unabhängigen Paritäten** → übersteht den Ausfall von **zwei** Platten gleichzeitig (auch während eines Rebuilds). Heute bei großen HDDs empfohlen.
- **RAID 10 vs. 01**: Bei **10** wird zuerst gespiegelt, dann gestriped – fällt eine Platte aus, ist nur ein Spiegel betroffen. Bei **01** fällt mit einer Platte gleich ein ganzer Stripe aus; eine zweite ausfallende Platte im anderen Stripe zerstört alles. RAID 10 ist deshalb robuster.

### Parität mit XOR (Beispiel)
| | Bits |
|---|---|
| Platte 1 | 1 0 1 1 |
| Platte 2 | 0 1 1 0 |
| Parität (XOR) | 1 1 0 1 |
Fällt Platte 2 aus: Platte 1 XOR Parität = 1011 XOR 1101 = **0110** → Daten wiederhergestellt.

### Kapazität berechnen
- 4 × 4 TB RAID 5 → (4 − 1) × 4 TB = **12 TB**
- 6 × 8 TB RAID 6 → (6 − 2) × 8 TB = **32 TB**
- 4 × 2 TB RAID 10 → 4 × 2 TB ÷ 2 = **4 TB**
- Unterschiedlich große Platten: Es zählt die **kleinste** Platte.

### Typische Probleme
1. **Gleichzeitiger Ausfall mehrerer Platten** (gleiche Charge, gleiches Alter, gleiche Belastung).
2. **Rebuild-Risiko**: Beim Wiederaufbau wird jede Platte vollständig gelesen – hohe Last, dabei kann eine weitere Platte ausfallen; Rebuilds großer Platten dauern Tage.
3. **URE** – *Unrecoverable Read Error* (nicht behebbarer Lesefehler): Ein Sektor kann nicht gelesen werden. Typische Angabe bei Desktop-HDDs: 1 Fehler pro 10¹⁴ gelesenen Bits (≈ 12,5 TB). Beim Rebuild eines großen RAID 5 ist die Wahrscheinlichkeit eines URE hoch → Rebuild scheitert, Datenverlust. Daher: RAID 6, Enterprise-Platten (10¹⁵–10¹⁶), regelmäßiges **Scrubbing**.
4. **Controller-Ausfall** (Hardware-RAID) – Ersatz muss kompatibel sein.
5. **Write Hole**: Stromausfall während des Schreibens → Daten und Parität inkonsistent (Gegenmittel: USV, BBU-Cache).
6. **Stille Datenkorruption** (Bit Rot) – nur Dateisysteme mit Prüfsummen (ZFS, ReFS) erkennen sie.
7. Fehlannahme „RAID = Backup“.

### Hot-Spare
Eine **zusätzliche, leere Platte**, die im Array eingebaut, aber ungenutzt ist. Fällt eine Platte aus, startet der Controller **sofort automatisch den Rebuild** auf die Hot-Spare – das Fenster, in dem das Array ungeschützt ist, wird minimal. **Global Hot Spare** dient mehreren Arrays, **Dedicated Hot Spare** nur einem.

### Cache
RAID-Controller besitzen einen **Cache** (DRAM, 1–8 GB):
- **Write-Back**: Schreibvorgänge werden im Cache bestätigt und später auf die Platten geschrieben → sehr schnell, aber Datenverlust bei Stromausfall → **BBU** (Battery Backup Unit) oder **Flash-Backed Write Cache** nötig.
- **Write-Through**: erst nach dem Schreiben auf Platte bestätigt → sicher, langsamer.
- **Read-Ahead**: liest vorausschauend Folgeblöcke.

### SSDs im RAID
- **SSD-Cache/Tiering**: SSDs werden nicht als Datenplatten, sondern als **Beschleuniger** vor ein HDD-Array geschaltet (z. B. LSI CacheCade, Windows **Storage Spaces Tiering**, ZFS L2ARC/SLOG) – häufig genutzte Daten liegen automatisch auf der SSD.
- Per PCIe angebundene NVMe-Karten als Cache-Laufwerk.
- **Intel Matrix RAID**: Zwei Platten werden in **zwei Bereiche** geteilt, z. B. ein RAID-0-Volume (schnell, fürs System) und ein RAID-1-Volume (sicher, für Daten) auf denselben Platten. Vorteil: Geschwindigkeit und Sicherheit mit nur zwei Platten. Nachteil: Beide Volumes teilen sich die Physik – ein Plattenausfall zerstört das RAID-0-Volume; Leistung wird geteilt; an den Intel-Controller gebunden.

## Einfach

Stell dir vor, du schreibst eine super wichtige **Hausaufgabe**. Was, wenn das Heft verloren geht? RAID sind Tricks mit **mehreren Heften**:

- **RAID 0 – Aufteilen**: Du schreibst Seite 1 ins rote Heft, Seite 2 ins blaue, Seite 3 wieder ins rote … Zwei Leute können gleichzeitig schreiben → **doppelt so schnell**. Aber: Verlierst du **ein** Heft, fehlt die Hälfte jeder Aufgabe – **alles kaputt**. Deshalb ist RAID 0 eigentlich gar kein „Sicherheits-RAID“.

- **RAID 1 – Abschreiben**: Du schreibst alles **doppelt**, in zwei Hefte gleichzeitig. Geht eins verloren, hast du das andere. Sicher, aber du brauchst doppelt so viel Papier.

- **RAID 5 – der Rechentrick**: Du hast drei Hefte. In zwei schreibst du deine Aufgaben, ins dritte schreibst du eine **Prüfsumme** (Parität). Wenn ein Heft verloren geht, kannst du mit der Prüfsumme den fehlenden Teil **zurückrechnen** – wie beim Sudoku, wo eine fehlende Zahl aus den anderen folgt. Du verlierst nur ein Heft an Platz, egal wie viele Hefte du hast.

- **RAID 6**: Wie RAID 5, aber mit **zwei** Prüfsummen – es dürfen sogar zwei Hefte gleichzeitig verloren gehen.

- **RAID 10**: Erst jedes Heft doppelt (Spiegeln), dann die Paare aufteilen (Striping) – schnell **und** sicher, aber teuer.

**Hot-Spare** ist ein **leeres Ersatzheft**, das schon bereitliegt. Geht ein Heft verloren, fängt der Computer **sofort** an, es neu zu füllen – ohne dass jemand erst zum Laden gehen muss.

**Ganz wichtig: RAID ist kein Backup!** Wenn du aus Versehen etwas durchstreichst, wird es in **allen** Heften durchgestrichen. Gegen Fehler, Viren oder Feuer hilft nur eine Kopie an einem anderen Ort.

## Merksatz
- RAID **0** = **0** Sicherheit, RAID **1** = **1** Spiegel.
- RAID 5: **n − 1**, RAID 6: **n − 2**, RAID 1/10: **n ÷ 2**.
- Parität = **XOR**.
- **RAID ist kein Backup!**
- 10 schlägt 01: erst spiegeln, dann stripen.

## Prüfungsfalle
- RAID 0 hat **keine** Redundanz – bei Ausfall einer Platte alles weg.
- RAID 5 braucht **mindestens 3** Platten, RAID 6 **4**, RAID 10 **4**.
- Bei unterschiedlichen Plattengrößen zählt die kleinste.
- RAID schützt nicht vor Löschen, Ransomware oder Brand.
- Write-Back-Cache ohne BBU/USV riskiert Datenverlust.

## Grafik
### RAID-Level-Baukasten
Interaktiv: Plattenanzahl und Level wählen; Datenblöcke (A1, A2, B1 …) und Paritätsblöcke (Ap, Bp) verteilen sich animiert auf die Platten. Knopf „Platte ausfallen lassen“: Platte wird rot, bei RAID 0 zerfallen alle Daten, bei RAID 5 werden fehlende Blöcke aus Parität zurückgerechnet (XOR-Animation).

### Kapazitätsrechner
Balken zeigt Nutzkapazität (grün) und Redundanz (grau) für den gewählten Level.

### Rebuild mit Hot-Spare
Array mit Hot-Spare; Platte fällt aus, Hot-Spare leuchtet auf, Fortschrittsbalken „Rebuild“ läuft; Warnhinweis URE-Risiko erscheint bei großen Platten.

## Karteikarten
- F: Wofür steht RAID? | A: Redundant Array of Independent (Inexpensive) Disks.
- F: Warum ist RAID 0 kein „richtiges“ RAID? | A: Keine Redundanz – Ausfall einer Platte zerstört alle Daten.
- F: Nutzkapazität 5 × 2 TB im RAID 5? | A: (5 − 1) × 2 TB = 8 TB.
- F: Nutzkapazität 6 × 4 TB im RAID 6? | A: (6 − 2) × 4 TB = 16 TB.
- F: Mindestanzahl Platten RAID 5 / RAID 6 / RAID 10? | A: 3 / 4 / 4.
- F: Wie wird die Parität berechnet? | A: Per XOR über die Datenblöcke.
- F: Was ist ein URE? | A: Unrecoverable Read Error – nicht behebbarer Lesefehler, gefährlich beim Rebuild.
- F: Was ist ein Hot-Spare? | A: Ungenutzte Reserveplatte, auf die bei Ausfall automatisch der Rebuild startet.
- F: Nachteil separater Paritätsplatte (RAID 3/4)? | A: Paritätsplatte wird bei jedem Schreibvorgang belastet → Flaschenhals, höherer Verschleiß.
- F: Unterschied RAID 10 und 01? | A: 10: erst spiegeln, dann stripen (robuster). 01: erst stripen, dann spiegeln.
- F: Vor- und Nachteil Hardware-RAID? | A: Vorteil: entlastet CPU, Cache. Nachteil: teuer, Controller-Abhängigkeit.
- F: Was ist Write-Back-Cache? | A: Schreibbestätigung aus dem Cache; schnell, braucht BBU/Flash-Schutz gegen Datenverlust.
- F: Ersetzt RAID ein Backup? | A: Nein – kein Schutz gegen Löschen, Malware, Brand, Diebstahl.

## Quiz
? Welches RAID-Level bietet keine Ausfallsicherheit?
* RAID 0
- RAID 1
- RAID 5
- RAID 6

? Wie viel Nutzkapazität haben 4 Platten à 3 TB im RAID 5?
* 9 TB
- 12 TB
- 6 TB
- 3 TB

? Wie viele Platten dürfen im RAID 6 gleichzeitig ausfallen?
* 2
- 1
- 0
- 3

? Wozu dient ein Hot-Spare?
* Automatischer Rebuild auf eine bereitstehende Reserveplatte nach einem Ausfall
- Beschleunigung des Lesens durch Caching
- Tägliche Sicherung der Daten
- Kühlung des RAID-Controllers

? Platte 1 enthält 1100, die Parität lautet 0110. Welche Daten standen auf Platte 2?
* 1010
- 0110
- 1100
- 0011

? Wie viel Nutzkapazität haben 6 Platten à 4 TB im RAID 6?
* 16 TB
- 20 TB
- 24 TB
- 12 TB
! RAID 6: (n − 2) × Kapazität = 4 × 4 TB.

? Welches RAID-Level spiegelt Daten auf zwei Platten?
* RAID 1
- RAID 0
- RAID 5
- RAID 6
! Nutzkapazität 50 %, eine Platte darf ausfallen.

? Warum ersetzt RAID keine Datensicherung?
* Löschungen, Schadsoftware und logische Fehler werden sofort auf alle Platten übertragen.
- RAID ist langsamer als ein Backup.
- RAID funktioniert nur mit SSDs.
- RAID verschlüsselt die Daten nicht.
! RAID schützt nur vor Plattenausfall (Verfügbarkeit), nicht vor Datenverlust.
