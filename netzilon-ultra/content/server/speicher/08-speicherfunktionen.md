---
id: server-speicher-funktionen
bereich: AP2
block: SP
kapitel: Speicher & SAN vertieft
titel: Speicherfunktionen – Thin Provisioning, Snapshots, Replikation, Deduplizierung, Kennzahlen und Kapazitätsplanung
stufe: Fortgeschritten
fach: [ITK / Grundlagen, Windows Server / AZ-800]
pruefungen: [AP1, AP2, AZ-800, Schule]
quellen: [SAN_Präsentation.pdf, Microsoft Learn – iSCSI/MPIO/Storage Spaces, SNIA-Grundlagen]
verweise: [az800-dedup, az800-storage-spaces, ap1-a2-backup, ap2-backup-speicher, az801-hyperv-replica, server-speicher-raid, server-speicher-storage-spaces, server-speicher-das-nas-san]
---

## Profi

### Thin Provisioning
Beim **Thin Provisioning** (schlanke Bereitstellung) bekommt ein Server eine LUN bzw. einen virtuellen Datenträger mit **zugesagter Größe**, physisch belegt wird aber nur, was **tatsächlich geschrieben** ist. Gegenstück: **Thick/Fixed Provisioning** (sofortige Reservierung).
- **Vorteil**: bessere Ausnutzung, späterer Kauf von Platten, Überbuchung (*overcommitment*) möglich.
- **Risiko**: Schreiben alle Server gleichzeitig, läuft der Pool voll → Schreibfehler, LUNs/VMs gehen offline. Daher **Schwellenwerte und Alarme** (z. B. 70 %/85 %) und Kapazitätsplanung.
- **Platzrückgewinnung** (*space reclamation*): Gelöschte Blöcke meldet das Betriebssystem per **TRIM/UNMAP** an den Speicher zurück (unter Windows automatisch bzw. `Optimize-Volume -ReTrim`).

### Snapshots
Ein **Snapshot** ist ein **Abbild eines Datenbestands zu einem Zeitpunkt** (*point-in-time copy*). Er entsteht in Sekunden, weil keine Vollkopie angelegt wird:
- **Copy-on-Write (CoW)**: Vor dem Überschreiben wird der alte Block in einen Snapshot-Bereich kopiert (zusätzliche Schreiblast).
- **Redirect-on-Write (RoW)**: Neue Daten werden an eine neue Stelle geschrieben, der alte Block bleibt für den Snapshot erhalten.
- In Windows: **VSS** (*Volume Shadow Copy Service*, Schattenkopien) sorgt für **anwendungskonsistente** Snapshots (Writer für SQL, Exchange, Hyper-V). Hyper-V nennt VM-Snapshots **Prüfpunkte** (*checkpoints*).
- **Wichtig**: Snapshots liegen **auf demselben Speichersystem** – fällt das Array aus oder wird es verschlüsselt, sind sie mit weg. Ein Snapshot ist **kein Backup**, kann aber Quelle für ein Backup sein.

### Replikation
**Replikation** kopiert Daten fortlaufend auf ein **zweites System**, oft an einem anderen Standort.
| | **Synchron** | **Asynchron** |
|---|---|---|
| Ablauf | Schreibvorgang gilt erst als fertig, wenn **beide** Seiten bestätigt haben | Bestätigung sofort lokal, Übertragung **zeitversetzt** |
| **RPO** (*Recovery Point Objective*, max. Datenverlust) | **0** | Sekunden bis Minuten |
| Latenz für Anwendungen | steigt um die Übertragungszeit | unverändert |
| Entfernung | begrenzt (geringe Latenz nötig; Microsoft nennt für Storage Replica ≤ 5 ms Round-Trip) | praktisch unbegrenzt |
| Beispiel | Stretch-Cluster, Storage Replica synchron | Storage Replica asynchron, Hyper-V-Replikat (5 s, 30 s, 15 min) |
Replikation überträgt auch **Fehler und Löschungen** sofort – sie ersetzt kein Backup. Windows Server bietet **Storage Replica** (Blockebene, Volume-Replikation; in Datacenter vollständig, in Standard eingeschränkt).

### Deduplizierung und Kompression
- **Deduplizierung** (*deduplication*): identische Datenstücke (*chunks*) werden nur **einmal** gespeichert, Duplikate durch Verweise ersetzt. Windows-**Datendeduplizierung** arbeitet **nachgelagert** (*post-process*) mit **variabler Chunk-Größe (32–128 KB)** im **Chunk Store**; Nutzungstypen **Default** (Dateiserver), **Hyper-V** (VDI) und **Backup**. Typische Einsparung: Dateiserver 30–50 %, VDI bis 90 %. Arrays deduplizieren oft **inline** (vor dem Schreiben).
- **Kompression**: verkleinert Daten durch Kodierung (z. B. LZ-Verfahren). Wirkt auch bei nicht doppelten Daten, kostet CPU. Bereits komprimierte Daten (JPEG, MP4, ZIP) und **verschlüsselte** Daten lassen sich kaum weiter reduzieren.
- Kennzahl: **Datenreduktionsrate** z. B. 3:1 → 30 TB logische Daten auf 10 TB physisch.

### Tiering und Caching
**Tiering** verschiebt Daten je nach Nutzung zwischen **schnellen** (NVMe/SSD) und **günstigen** (HDD, Cloud, Band) Ebenen – Daten liegen **nur auf einer** Ebene. **Caching** hält dagegen eine **Kopie** heißer Daten zusätzlich im schnellen Speicher. Beispiele: Storage Spaces Tiering, S2D-Cache, Azure File Sync Cloud Tiering.

### Leistungskennzahlen
| Kennzahl | Bedeutung | Einheit | Typische Werte (Größenordnung) |
|---|---|---|---|
| **IOPS** | Ein-/Ausgabeoperationen pro Sekunde | 1/s | HDD 7 200 U/min ≈ 75–100; SATA-SSD zehntausende; NVMe hunderttausende |
| **Durchsatz** (*throughput*) | Datenmenge pro Sekunde | MB/s, GB/s | HDD ≈ 150–250 MB/s sequenziell; NVMe mehrere GB/s |
| **Latenz** (*latency*) | Antwortzeit einer einzelnen E/A | ms, µs | HDD ≈ 5–10 ms; SSD < 1 ms; NVMe ≈ 0,1 ms |
| **Warteschlangentiefe** | gleichzeitig offene E/A | Anzahl | beeinflusst IOPS und Latenz |

Zusammenhang: **Durchsatz = IOPS × Blockgröße**. Beispiel: 20 000 IOPS × 8 KB = 160 000 KB/s = **160 MB/s**. Kleine Blöcke (Datenbanken, 4–8 KB) → IOPS zählen; große Blöcke (Backup, Video, 256 KB–1 MB) → Durchsatz zählt.

**Back-End-IOPS mit RAID-Schreib-Penalty**: Back-End = Lese-IOPS + Schreib-IOPS × Penalty. Beispiel: 2 000 Front-End-IOPS, 70 % Lesen, RAID 5 (Penalty 4) → 1 400 + 600 × 4 = **3 800 IOPS**; mit RAID 10 (Penalty 2) → 1 400 + 1 200 = **2 600 IOPS**.

Messen unter Windows: Leistungsüberwachung (`perfmon`) mit **Physischer Datenträger → Mittlere Sek./Übertragung** (Latenz) und **Übertragungen/s** (IOPS); Lasttest mit **DiskSpd**; Storage QoS bei Hyper-V.

### Kapazitätsplanung
1. **Ist-Bestand** erfassen (belegte Daten, Wachstum der letzten Jahre).
2. **Wachstum** hochrechnen: Kapazität × (1 + Rate)^Jahre. Beispiel: 10 TB, 20 % pro Jahr, 3 Jahre → 10 × 1,2³ = **17,28 TB**.
3. **Reserve** einplanen (z. B. 20–30 % Freiraum, Snapshots, Thin-Überbuchung).
4. **Datenreduktion** (Dedup/Kompression) nur vorsichtig einrechnen.
5. **Redundanz-Overhead** addieren: RAID/Resilienz (z. B. 2-Wege-Mirror verdoppelt).
6. **Einheiten** beachten: Hersteller-TB (10^12 Byte) gegenüber TiB im Betriebssystem (2^40 Byte); 1 TB ≈ 0,909 TiB.
7. **Leistung** prüfen (IOPS, Latenz), nicht nur Kapazität.

Beispiel: 17,28 TB × 1,25 Reserve = 21,6 TB netto → RAID 6 aus 8-TB-Platten: n − 2 ≥ 21,6/8 = 2,7 → n − 2 = 3 → **5 Platten** (24 TB netto).

Probier es im **Speicher-Labor unter Werkzeuge** aus: Dort rechnest du IOPS, Durchsatz und Kapazitätsbedarf und siehst, wie Thin Provisioning den Pool füllt.

## Einfach

Stell dir eine **Bibliothek** vor, die Platz für Bücher (Daten) vergibt.

**Thin Provisioning**: Die Bibliothek **verspricht** jeder Klasse ein Regal mit 100 Plätzen, stellt aber nur so viele Bretter auf, wie wirklich Bücher kommen. Das spart Bretter. Aber wenn plötzlich **alle Klassen gleichzeitig** ihre Regale füllen, reichen die Bretter nicht – darum muss die Bibliothekarin **ständig zählen**.

**Snapshot**: Ein **Foto** vom Regal. Wird später ein Buch verschoben, merkt sich die Bibliothek nur, wo es **vorher** stand. Mit dem Foto kann man alles schnell zurückstellen. Aber wenn die **ganze Bibliothek abbrennt**, ist das Foto auch weg – darum ist ein Snapshot **kein Backup**.

**Replikation**: Eine **zweite Bibliothek in einer anderen Stadt** bekommt jedes neue Buch auch. **Synchron**: Man wartet, bis die andere Bibliothek „hab’s!“ ruft – nichts geht verloren, aber es dauert länger. **Asynchron**: Man schickt die Bücher später hinterher – schneller, aber die letzten Bücher fehlen vielleicht.

**Deduplizierung**: Wenn 30 Kinder **dasselbe Buch** abgeben, stellt die Bibliothek es **nur einmal** ins Regal und gibt jedem einen Zettel „steht in Regal 5“. **Kompression**: Bücher werden **kleiner gedruckt**.

**IOPS** sind, **wie viele Kinder pro Sekunde** ein Buch holen können. **Durchsatz** ist, **wie viele Seiten pro Sekunde** insgesamt rausgehen. **Latenz** ist, **wie lange ein Kind warten** muss, bis es sein Buch hat.

## Merksatz
- **Thin spart Platz, aber nur mit Überwachung.**
- **Snapshot = Foto, kein Backup.**
- **Synchron: RPO 0, kurze Strecke. Asynchron: weite Strecke, kleiner Datenverlust.**
- **Dedup: gleiche Stücke nur einmal.**
- **Durchsatz = IOPS × Blockgröße.**
- **Back-End-IOPS = Lesen + Schreiben × Penalty.**

## Prüfungsfalle
- **Snapshots und Replikation ersetzen kein Backup** – Löschungen und Ransomware werden mitgenommen.
- **Synchrone Replikation** über große Entfernungen erhöht die Latenz jedes Schreibvorgangs – nicht „schneller und sicherer“.
- **Deduplizierung** bringt bei verschlüsselten oder bereits komprimierten Daten fast nichts.
- **IOPS** und **Durchsatz** nicht verwechseln: hohe IOPS mit kleinen Blöcken bedeuten nicht automatisch hohen Durchsatz.
- Die **RAID-Schreib-Penalty** muss bei Leistungsplanung eingerechnet werden.
- **Thin Provisioning** ohne Monitoring führt zu plötzlichem Stillstand, wenn der Pool voll ist.
- Bei Kapazitätsangaben **TB und TiB** unterscheiden.

## Grafik
### Synchrone gegen asynchrone Replikation
1. SQL01 -> ARRAY01: schreibt Block 100
2. ARRAY01 -> ARRAY02: synchron – überträgt Block 100 an den Zweitstandort
3. ARRAY02 -> ARRAY01: bestätigt den Empfang
4. ARRAY01 -> SQL01: erst jetzt „Schreiben fertig“ (RPO 0)
5. SQL01 -> ARRAY01: asynchron – schreibt Block 101, sofortige Bestätigung
6. ARRAY01 -> ARRAY02: überträgt Block 101 einige Sekunden später

### Copy-on-Write-Snapshot
1. Admin -> ARRAY01: erstellt Snapshot von LUN 3 um 12:00
2. HV01 -> ARRAY01: will Block 7 überschreiben
3. ARRAY01: kopiert den alten Block 7 in den Snapshot-Bereich
4. ARRAY01: schreibt den neuen Block 7 in die LUN
5. Admin -> ARRAY01: Rücksprung auf 12:00 nutzt den gesicherten alten Block

## Lab
**Maschinen**: **FS01.example.com** (Windows Server 2025, Datenvolume E: mit Testdaten, Pool01 aus der Storage-Spaces-Seite), **HV01.example.com** (Hyper-V-Host). Schule: `exa.local`. Optional: DiskSpd aus dem offiziellen Microsoft-Repository auf FS01 kopieren.

### GUI
1. **FS01**: Server-Manager → Rollen und Features → Datei- und iSCSI-Dienste → **Datendeduplizierung** installieren.
2. **FS01**: Datei-/Speicherdienste → Volumes → E: → Rechtsklick **Datendeduplizierung konfigurieren** → Typ **Allgemeiner Dateiserver** → Dateien älter als **0 Tage** (nur Labor!).
3. **FS01**: Mehrere Kopien derselben ISO/Installationsdateien nach E: kopieren → Dedup-Auftrag starten (PowerShell) → Spalte **Deduplizierungsrate** und **Einsparung** beobachten.
4. **FS01**: Explorer → E: → Eigenschaften → **Schattenkopien** → Schattenkopie jetzt erstellen → Datei ändern → Eigenschaften der Datei → **Vorgängerversionen** → Wiederherstellen.
5. **FS01**: `perfmon` → Leistungsindikatoren hinzufügen → **Physischer Datenträger**: *Übertragungen/s*, *Mittlere Sek./Übertragung*, *Bytes/s* → während eines Kopiervorgangs beobachten.
6. **FS01**: Server-Manager → Speicherpools → Pool01 → Kapazität, zugeordneter und belegter Platz der Thin-Datenträger vergleichen.
7. Rechne IOPS- und Kapazitätsbeispiele im **Speicher-Labor unter Werkzeuge** nach.

### PowerShell
```powershell
# FS01: Deduplizierung
Install-WindowsFeature FS-Data-Deduplication
Enable-DedupVolume -Volume E: -UsageType Default
Set-DedupVolume -Volume E: -MinimumFileAgeDays 0      # nur im Labor
Start-DedupJob -Volume E: -Type Optimization
Get-DedupJob
Get-DedupStatus | Format-List Volume, SavedSpace, OptimizedFilesCount
Get-DedupVolume | Format-Table Volume, SavingsRate, SavedSpace

# FS01: Schattenkopie (VSS) erstellen und anzeigen
vssadmin create shadow /for=E:
vssadmin list shadows /for=E:

# FS01: Thin-Datentraeger und Pool-Fuellstand ueberwachen
Get-StoragePool Pool01 | Format-List FriendlyName, Size, AllocatedSize
Get-VirtualDisk | Format-Table FriendlyName, ProvisioningType, Size, FootprintOnPool
Optimize-Volume -DriveLetter E -ReTrim -Verbose

# FS01: Leistung messen (IOPS, Latenz) mit Leistungsindikatoren
Get-Counter -Counter "\PhysicalDisk(_Total)\Disk Transfers/sec", "\PhysicalDisk(_Total)\Avg. Disk sec/Transfer" -SampleInterval 2 -MaxSamples 5

# FS01: Lasttest mit DiskSpd (8 KB, 70 % Lesen, zufaellig, 60 s)
.\diskspd.exe -c2G -b8K -d60 -r -w30 -t4 -o8 -L E:\test.dat

# Rechenhilfe Kapazitaetsplanung
$ist = 10; $rate = 0.20; $jahre = 3
"Bedarf: {0:N2} TB" -f ($ist * [math]::Pow(1 + $rate, $jahre))
```

## Legende
### Thin Provisioning
- Was: Bereitstellung, bei der Speicher erst beim Schreiben belegt wird.
- Wie: Thin-LUN im Array oder Thin-Datenträger in Storage Spaces, Rückgabe per TRIM/UNMAP.
- Wann: wenn Kapazität effizient genutzt und später erweitert werden soll.
- Warum: spart Anschaffungskosten – erfordert aber Überwachung des Füllstands.
### Replikation
- Was: fortlaufende Kopie von Daten auf ein zweites System.
- Wie: synchron (RPO 0, Bestätigung beider Seiten) oder asynchron (zeitversetzt).
- Wo: zwischen Arrays, mit Storage Replica oder Hyper-V-Replikat zwischen Standorten.
- Warum: Notfallvorsorge bei Ausfall eines Standorts – ersetzt kein Backup.
### IOPS
- Was: Anzahl der Ein-/Ausgabeoperationen pro Sekunde.
- Wie: mit perfmon, Get-Counter oder DiskSpd gemessen.
- Wann: bei der Planung von Datenbanken und Virtualisierung entscheidend.
- Warum: bestimmt zusammen mit der Latenz, wie schnell ein System wirkt.
- Beispiel: 20 000 IOPS × 8 KB = 160 MB/s Durchsatz.

## Karteikarten
- F: Was ist Thin Provisioning? | A: Speicher wird zugesagt, aber erst beim Schreiben physisch belegt; Überbuchung möglich
- F: Größtes Risiko von Thin Provisioning? | A: Der Pool läuft voll, LUNs bzw. VMs fallen aus – daher Füllstand überwachen
- F: Unterschied Copy-on-Write und Redirect-on-Write? | A: CoW kopiert den alten Block vor dem Überschreiben, RoW schreibt neue Daten an eine neue Stelle
- F: Warum ist ein Snapshot kein Backup? | A: Er liegt auf demselben Speichersystem und geht bei dessen Ausfall oder Verschlüsselung mit verloren
- F: Was bedeutet RPO? | A: Recovery Point Objective – maximal tolerierter Datenverlust in Zeit
- F: RPO bei synchroner Replikation? | A: 0 – jeder Schreibvorgang ist auf beiden Seiten bestätigt
- F: Nachteil synchroner Replikation? | A: Höhere Schreiblatenz und begrenzte Entfernung
- F: Wie arbeitet Windows-Datendeduplizierung? | A: Nachgelagert, zerlegt Dateien in variable Chunks (32–128 KB) und speichert gleiche Chunks nur einmal im Chunk Store
- F: Nutzungstypen der Windows-Deduplizierung? | A: Default (Dateiserver), Hyper-V (VDI), Backup
- F: Formel Durchsatz? | A: Durchsatz = IOPS × Blockgröße
- F: Back-End-IOPS bei 1 000 IOPS, 50 % Schreiben, RAID 6? | A: 500 + 500 × 6 = 3 500 IOPS
- F: Speicherbedarf nach 2 Jahren bei 10 TB und 25 % Wachstum pro Jahr? | A: 10 × 1,25² = 15,625 TB
- F: Unterschied Tiering und Caching? | A: Tiering verschiebt Daten zwischen Ebenen (nur eine Kopie), Caching hält eine zusätzliche Kopie im schnellen Speicher

## Quiz
? Was kennzeichnet Thin Provisioning?
* Physischer Platz wird erst beim Schreiben belegt
- Der gesamte Platz wird sofort reserviert
- Daten werden automatisch gespiegelt
- Gelöschte Daten werden nie freigegeben
! Thin erlaubt Überbuchung, verlangt aber Überwachung.

? Welches RPO hat synchrone Replikation?
* 0
- 15 Minuten
- 24 Stunden
- Abhängig von der Bandbreite, mindestens 5 Minuten
! Ein Schreibvorgang gilt erst als fertig, wenn beide Seiten ihn bestätigt haben.

? Was ist ein Nachteil synchroner Replikation über große Entfernungen?
* Jeder Schreibvorgang wartet auf die Bestätigung der Gegenseite
- Es entsteht bei jedem Ausfall ein hoher Datenverlust
- Snapshots sind auf dem Quellsystem nicht mehr möglich
- Sie funktioniert nur mit HDDs, nicht mit SSDs
! Schreibvorgänge werden dadurch langsamer; darum ist synchrone Replikation auf kurze Distanzen mit geringer Latenz begrenzt.

? Warum ersetzt ein Snapshot kein Backup?
* Er liegt auf demselben System und geht mit ihm verloren
- Er kann grundsätzlich nicht wiederhergestellt werden
- Er enthält nur Metadaten, aber keine Nutzdaten
- Er ist immer verschlüsselt und daher nicht lesbar
! Backups gehören auf ein getrenntes Medium, möglichst offline/offsite (3-2-1).

? Bei welchen Daten bringt Deduplizierung am wenigsten?
* Verschlüsselten Daten
- VDI-Festplatten mit gleichem Betriebssystem
- Mehreren Kopien derselben ISO-Datei
- Backup-Dateien mit vielen Wiederholungen
! Verschlüsselte Daten wirken zufällig und enthalten kaum identische Chunks.

? Welcher Nutzungstyp der Windows-Deduplizierung passt zu einem allgemeinen Dateiserver?
* Default
- Hyper-V
- Backup
- Archive
! Hyper-V ist für VDI gedacht, Backup für Sicherungsziele.

? Ein System liefert 10 000 IOPS bei 16 KB Blockgröße. Wie hoch ist der Durchsatz?
* 160 MB/s
- 16 MB/s
- 1 600 MB/s
- 10 MB/s
! 10 000 × 16 KB = 160 000 KB/s = 160 MB/s.

? Welche Kennzahl beschreibt die Antwortzeit einer einzelnen E/A?
* Latenz
- IOPS
- Durchsatz
- Deduplizierungsrate
! Latenz wird in ms oder µs gemessen.

? Wie viele Back-End-IOPS entstehen bei 1 000 Front-End-IOPS, 60 % Lesen, RAID 5?
* 2 200
- 1 000
- 1 600
- 4 000
! 600 + 400 × 4 = 2 200.

? Ein Bestand von 20 TB wächst jährlich um 10 %. Wie groß ist er nach zwei Jahren?
* 24,2 TB
- 22,0 TB
- 24,0 TB
- 40,0 TB
! 20 × 1,1² = 24,2 TB (Zinseszins-Effekt).

? Was beschreibt Copy-on-Write bei Snapshots?
* Vor dem Überschreiben wird der alte Block in den Snapshot kopiert
- Neue Daten werden nie geschrieben, nur im RAM gehalten
- Der Snapshot wird sofort vollständig als Kopie angelegt
- Die Daten werden beim Schreiben komprimiert und dedupliziert
! Das verursacht zusätzliche Schreiblast; Redirect-on-Write vermeidet die Kopie.

? Welcher Windows-Dienst erstellt anwendungskonsistente Snapshots?
* VSS (Volume Shadow Copy Service)
- MPIO (Multipath I/O)
- WinTarget (iSCSI-Zielserver)
- DFS-R (DFS-Replikation)
! VSS koordiniert mit Writern (z. B. SQL, Hyper-V) einen konsistenten Zustand.

? Was unterscheidet Tiering von Caching?
* Tiering verschiebt Daten, Caching legt eine zusätzliche Kopie an
- Tiering funktioniert nur mit HDDs, Caching nur mit SSDs
- Caching verschiebt Daten dauerhaft auf Band
- Es gibt keinen Unterschied, beide Begriffe sind gleich
! Beim Tiering liegen Daten nur auf einer Ebene, beim Caching zusätzlich im schnellen Speicher.

## Lücken
- Die Formel für den Durchsatz lautet Durchsatz = {IOPS} × {Blockgröße}.
- Bei synchroner Replikation beträgt das RPO {0}.
- Gelöschte Blöcke meldet das Betriebssystem bei Thin Provisioning per {TRIM|UNMAP} zurück.

## Zuordnen
### Funktion und Nutzen
- Thin Provisioning => Platz erst beim Schreiben belegen
- Snapshot => schneller Zeitpunkt-Stand zum Zurückspringen
- Synchrone Replikation => Zweitstandort ohne Datenverlust
- Deduplizierung => gleiche Datenstücke nur einmal speichern
- Tiering => heiße Daten auf SSD, kalte auf HDD

## Reihenfolge
### Kapazitätsplanung für ein neues Array
1. Aktuellen Datenbestand und bisheriges Wachstum erfassen
2. Bedarf für den Planungszeitraum hochrechnen
3. Reserve für Snapshots und Freiraum aufschlagen
4. Datenreduktion vorsichtig einrechnen
5. RAID- bzw. Resilienz-Overhead hinzurechnen
6. Plattenanzahl und -größe festlegen
7. IOPS- und Latenzanforderungen prüfen

## Freitext
- F: Ein Dateiserver hat 12 TB Daten, Wachstum 15 % pro Jahr. Berechnen Sie den Bedarf nach 3 Jahren inklusive 20 % Reserve und die Plattenzahl für RAID 6 mit 8-TB-Platten. | M: 12 × 1,15³ ≈ 12 × 1,521 = 18,25 TB; mit 20 % Reserve ≈ 21,9 TB netto; RAID 6: (n − 2) × 8 TB ≥ 21,9 TB → n − 2 ≥ 2,74 → n − 2 = 3 → 5 Platten (24 TB netto). | P: 6

## Szenario
### Speicherkonzept für die Praxisgemeinschaft Sonnenhof
Die Praxisgemeinschaft betreibt einen SQL-Server SQL01 auf HV01 mit einem Array ARRAY01. Gemessen wurden 4 000 IOPS bei 8 KB, 70 % Lesen. Ein Zweitstandort liegt 3 km entfernt (RTT 1 ms). Die Geschäftsführung fordert: „Bei Ausfall des Hauptstandorts darf keine Buchung verloren gehen“ und will „Snapshots statt teurer Backups“.
- F: Welche Replikationsart erfüllt die Anforderung und warum ist sie hier möglich? | A: Synchrone Replikation mit RPO 0; bei 3 km und 1 ms RTT ist die zusätzliche Latenz gering | P: 3
- F: Berechnen Sie den Durchsatz und die Back-End-IOPS bei RAID 10. | A: Durchsatz 4 000 × 8 KB = 32 MB/s; Back-End 2 800 + 1 200 × 2 = 5 200 IOPS | P: 3
- F: Nehmen Sie Stellung zu „Snapshots statt Backups“. | A: Abzulehnen: Snapshots liegen auf demselben Array, Replikation überträgt Löschungen und Verschlüsselung mit; Backup nach 3-2-1 mit Offline-Kopie bleibt Pflicht, Snapshots ergänzen es | P: 2
- F: Welche Gefahr besteht, wenn die LUNs thin bereitgestellt sind? | A: Der Pool kann bei Datenwachstum volllaufen und SQL01 stoppen – Füllstand mit Schwellwerten überwachen und rechtzeitig erweitern | P: 2
