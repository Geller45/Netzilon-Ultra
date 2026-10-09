---
id: server-speicher-raid
bereich: AP1
block: SP
kapitel: Speicher & SAN vertieft
titel: RAID vertieft – Kapazität, Ausfalltoleranz, Rebuild, URE-Risiko und Write Hole
stufe: Fortgeschritten
fach: ITK / Grundlagen
pruefungen: [AP1, AP2, AZ-800, Schule]
quellen: [SAN_Präsentation.pdf, Microsoft Learn – iSCSI/MPIO/Storage Spaces, SNIA-Grundlagen]
verweise: [ap1-a2-raid, server-raid-uebung, ap1-a2-backup, server-speicher-storage-spaces, server-speicher-funktionen, server-speicher-das-nas-san]
---

## Profi

### Grundbegriffe
**RAID** (*Redundant Array of Independent Disks*) fasst mehrere physische Platten zu einem logischen Laufwerk zusammen. Drei Techniken werden kombiniert:
- **Striping** (Verteilen): Daten werden in Blöcke (*stripe units*, *chunks*, z. B. 64–256 KiB) zerlegt und reihum auf die Platten geschrieben → mehr Leistung.
- **Mirroring** (Spiegeln): identische Kopie auf einer zweiten Platte → Redundanz.
- **Parität** (*parity*): aus den Datenblöcken eines Stripes wird per **XOR** ein Prüfblock berechnet; fällt eine Platte aus, lässt sich ihr Inhalt aus den übrigen Blöcken zurückrechnen. RAID 6 nutzt eine zweite, unabhängige Prüfsumme (z. B. Reed-Solomon).

Bei Platten unterschiedlicher Größe zählt immer die **kleinste Platte** (C = Kapazität der kleinsten Platte, n = Anzahl Platten).

### Kapazität und Ausfalltoleranz
| RAID | Mindestplatten | Nutzkapazität | Ausfalltoleranz | Effizienz (Beispiel) | Schreib-Penalty |
|---|---|---|---|---|---|
| **0** | 2 | **n × C** | **0** Platten | 100 % | 1 |
| **1** | 2 | **C** (bei 2 Platten: n/2 × C) | 1 Platte (bei 2 Platten) | 50 % | 2 |
| **5** | 3 | **(n − 1) × C** | **1** Platte | 4 Platten: 75 % | 4 |
| **6** | 4 | **(n − 2) × C** | **2** beliebige Platten | 6 Platten: 67 % | 6 |
| **10** (1+0) | 4 | **n/2 × C** | mind. 1, max. 1 pro Spiegelpaar | 50 % | 2 |
| **50** (5+0) | 6 | **(n − g) × C** | 1 pro RAID-5-Gruppe | g = Anzahl Gruppen | 4 |
| **60** (6+0) | 8 | **(n − 2g) × C** | 2 pro RAID-6-Gruppe | g = Anzahl Gruppen | 6 |

### Rechenbeispiele (je Platte 4 TB)
- **RAID 0, 4 Platten:** 4 × 4 TB = **16 TB**, kein Ausfall erlaubt.
- **RAID 1, 2 Platten:** **4 TB**, eine Platte darf ausfallen.
- **RAID 5, 6 Platten:** (6 − 1) × 4 TB = **20 TB** (83 %), eine Platte darf ausfallen.
- **RAID 6, 6 Platten:** (6 − 2) × 4 TB = **16 TB** (67 %), zwei beliebige Platten dürfen ausfallen.
- **RAID 10, 6 Platten:** 6/2 × 4 TB = **12 TB** (50 %), sicher 1 Ausfall; bis zu 3, wenn jeweils verschiedene Spiegelpaare betroffen sind. Fallen **beide Platten eines Paares** aus, sind alle Daten verloren.
- **RAID 50, 8 Platten in 2 Gruppen à 4:** (8 − 2) × 4 TB = **24 TB**, je Gruppe 1 Ausfall.
- **RAID 60, 8 Platten in 2 Gruppen à 4:** (8 − 2 × 2) × 4 TB = **16 TB**, je Gruppe 2 Ausfälle.
- **Gemischte Größen:** RAID 5 aus 3 × 2 TB + 1 × 1 TB → (4 − 1) × **1 TB** = **3 TB** – die kleinste Platte bestimmt.
- **Rückwärts gerechnet:** 30 TB netto mit RAID 6 aus 6-TB-Platten → n − 2 = 30/6 = 5 → **n = 7 Platten**.

### Hot Spare
Eine **Hot Spare** ist eine eingebaute, ungenutzte Reserveplatte. Fällt eine Platte aus, startet der Controller **sofort automatisch** den Rebuild auf die Hot Spare – ohne auf einen Techniker zu warten. **Dedizierte** Hot Spares gehören zu einem Array, **globale** springen für jedes Array des Controllers ein. Eine Hot Spare zählt **nicht** zur Nutzkapazität und erhöht nicht die Ausfalltoleranz *gleichzeitiger* Ausfälle – sie verkürzt nur das Zeitfenster der Verwundbarkeit.

### Rebuild-Dauer und URE-Risiko
Während des **Rebuilds** (Wiederaufbau) ist ein RAID 5 **ungeschützt**: Ein zweiter Fehler bedeutet Datenverlust. Die Dauer hängt von Plattengröße und Rebuild-Rate ab:
- Beispiel: 8-TB-Platte, 150 MB/s → 8 000 000 MB ÷ 150 MB/s ≈ 53 333 s ≈ **14,8 Stunden** – unter Produktivlast oft ein Vielfaches.

Gefährlicher als ein zweiter Komplettausfall ist ein **URE** (*Unrecoverable Read Error*, nicht korrigierbarer Lesefehler). Hersteller geben Raten an wie **1 Fehler pro 10^14 Bit** (Desktop, ≈ 12,5 TB gelesen) oder **10^15 Bit** (Enterprise, ≈ 125 TB). Beim Rebuild muss **jedes Bit aller übrigen Platten** gelesen werden:
- RAID 5 aus 5 × 8 TB, eine fällt aus → 4 × 8 TB = 32 TB = 2,56 × 10^14 Bit lesen. Bei 10^14 sind statistisch **rund 2,5 Lesefehler zu erwarten** → hohe Wahrscheinlichkeit, dass der Rebuild scheitert bzw. Daten beschädigt werden. Bei 10^15 sind es im Mittel ≈ 0,26 Fehler – immer noch ein spürbares Risiko.
- Die Herstellerangaben sind Obergrenzen; in der Praxis ist die Rate oft besser. Die Folgerung bleibt: **Bei großen Platten RAID 6 (oder RAID 10) statt RAID 5**, Enterprise-Platten, regelmäßiges **Patrol Read/Scrubbing**.

### Write Hole
Beim Schreiben in ein Paritäts-RAID müssen **Datenblock und Paritätsblock** aktualisiert werden. Fällt dazwischen der **Strom** aus, passen Daten und Parität nicht mehr zusammen – das **Write Hole**. Der Fehler fällt erst bei einem späteren Rebuild auf (falsch rekonstruierte Daten). Gegenmaßnahmen:
- Controller-Cache mit **BBU** (*Battery Backup Unit*) oder **Flash-gesichertem Cache** (Supercap + Flash),
- **USV**,
- Journaling der Schreibvorgänge (z. B. Storage Spaces Parity mit Journal, Linux mdadm mit Write Journal), Copy-on-Write-Dateisysteme (ZFS RAID-Z).

### Hardware- gegen Software-RAID
| | **Hardware-RAID** | **Software-RAID** |
|---|---|---|
| Wo | eigener Controller mit Prozessor und Cache | im Betriebssystem (Windows: dynamische Datenträger/Storage Spaces, Linux: mdadm) |
| Leistung | Parität im Controller, Schreibcache mit BBU | CPU des Hosts rechnet (heute meist unkritisch) |
| Abhängigkeit | an Controller-Modell gebunden; bei Defekt gleiches Modell nötig | an Betriebssystem gebunden, Controller-unabhängig |
| Bootfähigkeit | einfach, OS sieht ein Laufwerk | eingeschränkt je nach System |
| Kosten | höher | gering |
„**Fake-RAID**“ (Host-RAID im Mainboard-Chipsatz) ist im Kern Software-RAID mit Treiber und vereint oft die Nachteile beider. **Storage Spaces Direct** verlangt **kein** Hardware-RAID, sondern einen HBA im Durchreichmodus.

### RAID ist kein Backup
RAID schützt nur vor **Plattenausfall**. Es schützt **nicht** vor versehentlichem Löschen, Ransomware, Softwarefehlern, Controller-Defekt, Brand, Diebstahl oder Überspannung – jede Änderung wird sofort auf alle Platten übertragen. Datensicherung nach der **3-2-1-Regel** bleibt Pflicht.

Probier es im **Speicher-Labor unter Werkzeuge** aus: Dort kannst du RAID-Level wählen, Platten „ausfallen“ lassen und Kapazität sowie Rebuild live berechnen.

## Einfach

Stell dir vor, du schreibst ein **Buch** und hast mehrere **Hefte** (Festplatten), in die du es abschreiben kannst.

- **RAID 0** – Du verteilst die Seiten abwechselnd auf zwei Hefte. Das geht **doppelt so schnell**, weil zwei Kinder gleichzeitig schreiben. Aber geht **ein Heft verloren**, fehlt jede zweite Seite – das **ganze Buch ist kaputt**.
- **RAID 1** – Zwei Kinder schreiben **dasselbe** Buch komplett ab. Geht ein Heft verloren, hast du noch das andere. Dafür brauchst du **doppelt so viele Hefte**.
- **RAID 5** – Drei oder mehr Kinder schreiben Seiten, und auf jeder Zeile steht noch eine **Rätselzahl** (Parität). Geht ein Heft verloren, kann man die fehlenden Seiten aus den anderen Seiten und der Rätselzahl **zurückrechnen**. Man „verliert“ nur **ein Heft** an Platz für die Rätselzahlen.
- **RAID 6** – Wie RAID 5, aber mit **zwei verschiedenen Rätselzahlen**. Es dürfen **zwei Hefte** verloren gehen.
- **RAID 10** – Erst spiegeln, dann verteilen: Immer zwei Kinder schreiben dasselbe, und mehrere solcher Paare teilen sich die Seiten.

Eine **Hot Spare** ist ein **leeres Ersatzheft**, das schon bereitliegt. Geht ein Heft verloren, fängt sofort jemand an, es neu zu schreiben (**Rebuild**). Das dauert bei dicken Heften aber **sehr lange** – und wenn währenddessen in einem anderen Heft ein Wort **unleserlich** ist (URE), klappt das Zurückrechnen nicht mehr.

Ganz wichtig: Wenn du **aus Versehen eine Seite ausradierst**, radieren **alle Kopien mit**. RAID ist darum **kein Backup** – dafür brauchst du eine Kopie **in einem anderen Haus**.

## Merksatz
- **RAID 5: (n − 1) × C – eine Platte darf gehen.**
- **RAID 6: (n − 2) × C – zwei Platten dürfen gehen.**
- **RAID 10: n/2 × C – aber nie beide Platten eines Paares.**
- **Die kleinste Platte bestimmt die Kapazität.**
- **Große Platten → RAID 6 statt RAID 5 (URE-Risiko beim Rebuild).**
- **RAID ist kein Backup.**

## Prüfungsfalle
- **RAID 0 ist nicht redundant** – das „R“ im Namen täuscht.
- RAID 5 braucht **mindestens 3**, RAID 6 und RAID 10 **mindestens 4** Platten.
- Die **Hot Spare** zählt nicht zur Kapazität: 6 Platten RAID 5 + 1 Hot Spare = (6 − 1) × C, nicht (7 − 1) × C.
- RAID 10 übersteht **nicht** „beliebige zwei“ Ausfälle – nur, wenn sie in verschiedenen Spiegelpaaren liegen. RAID 6 übersteht beliebige zwei.
- Bei gemischten Plattengrößen wird mit der **kleinsten** gerechnet.
- Bei RAID 50/60 die Gruppen beachten: (n − g) bzw. (n − 2g), nicht (n − 1) bzw. (n − 2).
- „RAID ersetzt das Backup“ – **immer falsch**.
- TB (Hersteller, 10^12) und TiB (Betriebssystem, 2^40) nicht verwechseln: 4 TB ≈ 3,64 TiB.

## Grafik
### Rebuild bei RAID 5 mit Hot Spare
1. Controller: schreibt Stripes mit Parität über Platte 1 bis 4
2. Platte 3: fällt aus, Array läuft im Zustand „degraded“
3. Controller -> Hot Spare: startet automatisch den Rebuild
4. Controller: liest Platte 1, 2 und 4 und berechnet Platte 3 per XOR
5. Platte 2: meldet einen URE, Block nicht rekonstruierbar
6. Controller: markiert den Stripe als beschädigt – Wiederherstellung aus dem Backup nötig

### Write Hole
1. Server -> Controller: neuer Datenblock für Stripe 7
2. Controller -> Platte 1: Datenblock geschrieben
3. Stromausfall: Paritätsblock auf Platte 4 wurde nicht mehr geschrieben
4. Controller: Daten und Parität von Stripe 7 passen nicht zusammen
5. Rebuild: rekonstruiert später falsche Daten – BBU oder Journal hätten das verhindert

## Lab
**Maschinen**: **FS01.example.com** (Windows Server 2025 mit vier zusätzlichen leeren Datenträgern à 20 GB, in Hyper-V als VHDX angehängt), Host **HV01.example.com** zum Anhängen der Platten. Schule: `exa.local`. Hinweis: Für die Software-Variante nutzen wir die klassischen dynamischen Datenträger bzw. Storage Spaces – in der Praxis ist Storage Spaces die empfohlene Software-Lösung.

### GUI
1. **HV01**: Hyper-V-Manager → FS01 → Einstellungen → SCSI-Controller → **4 × Festplatte** (20 GB, dynamisch) hinzufügen.
2. **FS01**: `diskmgmt.msc` → neue Datenträger **online** schalten und **initialisieren (GPT)**.
3. **FS01**: Rechtsklick auf Datenträger 1 → **Neues RAID-5-Volume** → Datenträger 1–3 auswählen → Größe beobachten: (3 − 1) × 20 GB ≈ **40 GB**.
4. **FS01**: Auf dem Volume Testdateien anlegen.
5. **HV01**: Eine der drei Platten von FS01 im laufenden Betrieb **entfernen** → FS01 zeigt das Volume als **Fehlerhafte Redundanz**, Daten bleiben lesbar.
6. **FS01**: Datenträger 4 → Rechtsklick auf das Volume → **Volume reparieren** → Datenträger 4 wählen (manueller „Hot-Spare“-Ersatz) → Resynchronisierung beobachten.
7. Rechne die Werte im **Speicher-Labor unter Werkzeuge** für RAID 6, 10, 50 und 60 nach.

### PowerShell
```powershell
# FS01: freie Datentraeger anzeigen
Get-PhysicalDisk -CanPool $true | Format-Table FriendlyName, Size, MediaType

# FS01: RAID-5-Volume per diskpart (dynamische Datentraeger, Legacy-Weg)
# Skriptdatei C:\Lab\raid5.txt mit folgendem Inhalt anlegen:
#   select disk 1
#   convert dynamic
#   select disk 2
#   convert dynamic
#   select disk 3
#   convert dynamic
#   create volume raid disk=1,2,3
#   format fs=ntfs quick label=RAID5
#   assign letter=R
diskpart /s C:\Lab\raid5.txt

# FS01: Zustand pruefen
Get-Volume -DriveLetter R
"list volume" | diskpart

# Rechenhilfe: Nutzkapazitaet in TB
$n = 6; $c = 4
"RAID 5:  {0} TB" -f (($n - 1) * $c)
"RAID 6:  {0} TB" -f (($n - 2) * $c)
"RAID 10: {0} TB" -f (($n / 2) * $c)
```

## Legende
### Parität
- Was: aus Datenblöcken per XOR berechneter Prüfblock.
- Wie: bei RAID 5 einfach, bei RAID 6 doppelt; verteilt über alle Platten.
- Wann: beim Schreiben jedes Stripes und beim Rebuild zum Zurückrechnen.
- Warum: Redundanz mit weniger Kapazitätsverlust als Spiegelung.
### Hot Spare
- Was: eingebaute Reserveplatte ohne Daten.
- Wie: der Controller startet beim Ausfall automatisch den Rebuild darauf.
- Wo: im selben Gehäuse bzw. Controller wie das Array (dediziert oder global).
- Warum: verkürzt die Zeit, in der das Array ungeschützt ist.
### URE
- Was: Unrecoverable Read Error, nicht korrigierbarer Lesefehler.
- Wann: kritisch beim Rebuild, weil alle übrigen Platten komplett gelesen werden.
- Warum: kann einen RAID-5-Rebuild scheitern lassen – deshalb bei großen Platten RAID 6.
- Beispiel: 1 Fehler pro 10^14 Bit entspricht etwa 12,5 TB gelesenen Daten.

## Karteikarten
- F: Formel Nutzkapazität RAID 5? | A: (n − 1) × C, mindestens 3 Platten, 1 Ausfall erlaubt
- F: Formel Nutzkapazität RAID 6? | A: (n − 2) × C, mindestens 4 Platten, 2 beliebige Ausfälle erlaubt
- F: Formel Nutzkapazität RAID 10? | A: n/2 × C, mindestens 4 Platten, 1 Ausfall pro Spiegelpaar
- F: Nutzkapazität RAID 50 aus 8 × 4 TB in 2 Gruppen? | A: (8 − 2) × 4 TB = 24 TB
- F: Nutzkapazität RAID 60 aus 8 × 4 TB in 2 Gruppen? | A: (8 − 4) × 4 TB = 16 TB
- F: Welche Platte bestimmt die Kapazität bei gemischten Größen? | A: Die kleinste Platte
- F: Was ist eine Hot Spare? | A: Eingebaute Reserveplatte, auf die der Controller bei Ausfall automatisch den Rebuild startet
- F: Was ist ein URE? | A: Unrecoverable Read Error – nicht korrigierbarer Lesefehler, gefährlich beim Rebuild
- F: Was ist das Write Hole? | A: Inkonsistenz zwischen Daten und Parität nach Stromausfall während eines Schreibvorgangs
- F: Gegenmaßnahmen gegen das Write Hole? | A: Controller-Cache mit BBU/Flash, USV, Journaling, Copy-on-Write-Dateisysteme
- F: Schreib-Penalty von RAID 5 und RAID 6? | A: RAID 5: 4 E/A pro Schreibvorgang, RAID 6: 6, RAID 1/10: 2
- F: Warum ist RAID kein Backup? | A: Löschungen, Ransomware, Softwarefehler und Brand betreffen alle Platten gleichzeitig
- F: Wie viele 6-TB-Platten braucht RAID 6 für 30 TB netto? | A: n − 2 = 30/6 = 5, also 7 Platten

## Quiz
? Wie groß ist die Nutzkapazität eines RAID 5 aus 6 Platten à 4 TB?
* 20 TB
- 24 TB
- 16 TB
- 12 TB
! (n − 1) × C = (6 − 1) × 4 TB = 20 TB.

? Wie groß ist die Nutzkapazität eines RAID 6 aus 6 Platten à 4 TB?
* 16 TB
- 20 TB
- 12 TB
- 24 TB
! (n − 2) × C = (6 − 2) × 4 TB = 16 TB.

? Wie groß ist die Nutzkapazität eines RAID 10 aus 8 Platten à 2 TB?
* 8 TB
- 14 TB
- 12 TB
- 16 TB
! n/2 × C = 8/2 × 2 TB = 8 TB.

? Ein RAID 5 besteht aus 3 Platten à 2 TB und einer Platte mit 1 TB. Wie groß ist es nutzbar?
* 3 TB
- 6 TB
- 5 TB
- 7 TB
! Die kleinste Platte zählt: (4 − 1) × 1 TB = 3 TB.

? Wie viele Plattenausfälle verkraftet ein RAID 6 sicher?
* Zwei beliebige
- Einen
- Keinen
- Die Hälfte aller Platten
! RAID 6 hat doppelte Parität und übersteht zwei beliebige Ausfälle.

? Welche Aussage zu RAID 10 mit 4 Platten ist richtig?
* Zwei Ausfälle nur, wenn sie in verschiedenen Spiegelpaaren liegen
- Es übersteht immer zwei beliebige Plattenausfälle gleichzeitig
- Es hat keine Redundanz, da die Daten nur gestriped werden
- Es braucht eine Paritätsberechnung wie RAID 5
! Fallen beide Platten desselben Spiegelpaares aus, sind die Daten verloren.

? Ein Server hat 7 Platten à 4 TB: RAID 5 aus 6 Platten plus 1 Hot Spare. Nutzkapazität?
* 20 TB
- 24 TB
- 28 TB
- 16 TB
! Die Hot Spare zählt nicht: (6 − 1) × 4 TB = 20 TB.

? Was beschreibt das Write Hole?
* Daten und Parität passen nach Stromausfall beim Schreiben nicht zusammen
- Ein Loch in der Beschichtung des Plattentellers nach einem Headcrash
- Eine fehlende Hot Spare, sodass kein automatischer Rebuild startet
- Ein Zoning-Fehler, durch den Schreibzugriffe im SAN verloren gehen
! Gegenmittel: BBU/Flash-Cache, USV, Journaling.

? Warum wird bei großen Platten RAID 6 statt RAID 5 empfohlen?
* Beim langen Rebuild droht ein URE oder zweiter Ausfall
- RAID 6 ist beim Schreiben grundsätzlich schneller als RAID 5
- RAID 5 kann keine Platten über 2 TB adressieren
- RAID 6 benötigt keine Paritätsberechnung und spart CPU
! Während des RAID-5-Rebuilds ist das Array ungeschützt; RAID 6 verkraftet noch einen weiteren Fehler.

? Welche Schreib-Penalty hat RAID 5?
* 4
- 1
- 2
- 6
! Daten lesen, Parität lesen, Daten schreiben, Parität schreiben = 4 E/A.

? Wie viele Platten braucht man mindestens für RAID 60?
* 8
- 4
- 6
- 5
! Zwei RAID-6-Gruppen mit je mindestens 4 Platten.

? Wie lange dauert der Rebuild einer 8-TB-Platte bei 200 MB/s ungefähr (ohne Last)?
* rund 11 Stunden
- rund 40 Minuten
- rund 4 Stunden
- rund 3 Tage
! 8 000 000 MB ÷ 200 MB/s = 40 000 s ≈ 11,1 Stunden.

? Was gilt für Hardware-RAID im Vergleich zu Software-RAID?
* Eigener Controller mit Cache und BBU, aber Herstellerbindung
- Hardware-RAID benötigt weder Treiber noch Firmware-Updates
- Software-RAID ist grundsätzlich nicht redundant, nur schneller
- Hardware-RAID ist Voraussetzung für Storage Spaces Direct
! Das Array ist an das Controller-Modell gebunden. S2D verlangt im Gegenteil einen HBA im Durchreichmodus, kein Hardware-RAID.

? Wovor schützt RAID?
* Vor dem Ausfall einzelner Festplatten
- Vor versehentlichem Löschen von Dateien
- Vor Verschlüsselung durch Ransomware
- Vor Brand oder Wasser im Serverraum
! Alles andere erfordert Backup an einem getrennten Ort.

## Lücken
- Ein RAID 5 aus 6 Platten à 2 TB hat {10} TB nutzbar, ein RAID 6 aus denselben Platten {8} TB.
- Ein RAID 10 aus 6 Platten à 4 TB hat {12} TB nutzbar.
- Eine eingebaute Reserveplatte für den automatischen Rebuild heißt {Hot Spare}.

## Zuordnen
### RAID-Level und Eigenschaft
- RAID 0 => Striping ohne Redundanz
- RAID 1 => Spiegelung, 50 % Kapazität
- RAID 5 => einfache verteilte Parität, (n − 1) × C
- RAID 6 => doppelte Parität, (n − 2) × C
- RAID 10 => gespiegelte Paare mit Striping, n/2 × C

## Reihenfolge
### Ablauf bei Plattenausfall in einem RAID 6
1. Platte fällt aus, Controller meldet Zustand „degraded“
2. Controller startet Rebuild auf die Hot Spare
3. Administrator erhält Alarm per Monitoring
4. Rebuild rechnet die fehlenden Blöcke aus den übrigen Platten zurück
5. Array ist wieder vollständig redundant
6. Defekte Platte wird getauscht und als neue Hot Spare eingebunden

## Freitext
- F: Berechnen Sie für 8 Platten à 6 TB die Nutzkapazität bei RAID 5, RAID 6, RAID 10 und RAID 50 (2 Gruppen) und nennen Sie jeweils die Ausfalltoleranz. | M: RAID 5: 7 × 6 = 42 TB, 1 Platte. RAID 6: 6 × 6 = 36 TB, 2 beliebige. RAID 10: 4 × 6 = 24 TB, 1 pro Spiegelpaar (max. 4). RAID 50: (8 − 2) × 6 = 36 TB, 1 pro Gruppe. | P: 8

## Szenario
### Neuer Dateiserver für das Architekturbüro Klein
Das Architekturbüro Klein braucht für FS01.example.com mindestens 36 TB nutzbaren Speicher. Verfügbar sind 12-TB-Desktop-Platten (URE 1 pro 10^14 Bit) und 12-TB-Enterprise-Platten (URE 1 pro 10^15 Bit). Der Chef möchte RAID 5 aus vier Desktop-Platten, „weil das am günstigsten ist und RAID ja die Datensicherung ersetzt“.
- F: Prüfen Sie, ob RAID 5 aus vier 12-TB-Platten die Kapazität erreicht. | A: (4 − 1) × 12 TB = 36 TB – Kapazität erreicht, aber ohne Reserve | P: 2
- F: Bewerten Sie das Rebuild-Risiko dieses RAID 5. | A: Beim Ausfall müssen 3 × 12 TB = 36 TB = 2,88 × 10^14 Bit gelesen werden; bei 10^14 sind statistisch fast 3 UREs zu erwarten, der Rebuild scheitert sehr wahrscheinlich; zudem dauert er viele Stunden ungeschützt | P: 3
- F: Welche Alternative empfehlen Sie mit Berechnung? | A: RAID 6 aus fünf Enterprise-Platten: (5 − 2) × 12 TB = 36 TB, zwei Ausfälle möglich; optional sechste Platte als Hot Spare | P: 3
- F: Wie widerlegen Sie die Aussage zur Datensicherung? | A: RAID schützt nur vor Plattenausfall, nicht vor Löschen, Ransomware oder Brand; zusätzlich Backup nach 3-2-1-Regel mit Offline-/Offsite-Kopie | P: 2
