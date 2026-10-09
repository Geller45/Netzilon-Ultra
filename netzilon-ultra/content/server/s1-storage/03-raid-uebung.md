---
id: server-raid-uebung
bereich: AP1
pruefungen: [AP1, AP2, Schule]
fach: ITK / Grundlagen
block: S1
kapitel: Storage
titel: RAID – Folien und Übung 10 komplett gelöst
stufe: Fortgeschritten
typ: uebung
quellen: [10_RAID.pdf, 10_Übung_RAID.pdf]
verweise: [ap1-a2-raid, ap2-hochverfuegbarkeit, server-san, az800-storage-spaces]
---

## Profi

Die Theorie (Level, Kapazität, XOR-Parität) steht ausführlich im Thema **RAID** (ap1-a2-raid). Hier sind die **Folien von Herrn Beging (IT-Akademie Dr. Heuer)** zusammengefasst und die **15 Aufgaben der Übung 10** vollständig gelöst.

### Kernaussagen der Folien
- RAID = **Redundant Array of Independent Disks**: redundante Anordnung unabhängiger Festplatten, aus **Performance-** oder **Sicherheitsgründen** (teilweise beides).
- **Redundanz ist keine Datensicherung.**
- RAID setzt **mindestens zwei Platten** voraus; Umsetzung als **Hardware-** oder **Software-RAID**.
- Je nach Level ist der **Austausch im laufenden Betrieb** (Hot-Swap) möglich.
- Das logische RAID-Laufwerk sieht im Betriebssystem aus wie ein normales Laufwerk.
- Gebräuchlichste Level: **0, 1, 5** (heute zusätzlich 6 und 10).

### Level-Übersicht laut Folien (korrigiert)
| Level | Name | Mindestplatten | Kernaussage |
|---|---|---|---|
| 0 | Stripe | 2 | abwechselnd verteilt, schnell, **keine** Redundanz – „kein echtes RAID“ |
| 1 | Mirror | 2 | gespiegelt, sehr sicher, Schreibrate je nach Controller leicht reduziert |
| 3 | Separate Parity | 3 | eigene Paritätsplatte, Flaschenhals |
| 5 | Parity | 3 | Daten **und** Parität über **alle** Platten verteilt |
| 6 | Double Parity | 4 | zwei Paritäten, 2 Platten dürfen ausfallen |
| 0+1 | Mirrored Stripeset | 4 | zwei RAID-0 gespiegelt |
| 1+0 | Striped Mirror | 4 | RAID-1-Paare gestriped, robuster als 0+1 |
| 30 | Striped Separate Parity | 6 | RAID-3-Verbände gestriped |
| 51 | Mirrored Parity | 6 | zwei RAID-5 gespiegelt |
| Matrix | Intel Matrix RAID | 2 | verschiedene Level auf denselben Platten |

### Weitere Begriffe
- **Cache**: Zwischenspeicher für Lese-/Schreibvorgänge. Problem: Daten im Cache, die noch nicht auf der Platte sind, gehen bei Stromausfall verloren → **BBU** (Pufferbatterie) oder **Flash-/SSD-gestützter Cache**.
- **LVM** (Logical Volume Manager): Software zur dynamischen Verwaltung von Datenträgern (Linux), auch in Verbindung mit RAID.
- **Hot-Swapping**: Wechsel von Platten im laufenden Betrieb.
- **Hot-Spare**: leere Reserveplatte, springt bei Ausfall automatisch ein.

## Einfach

RAID ist wie eine **Gruppe von Schülern, die zusammen ein Heft führen**:
- Bei **RAID 0** schreibt jeder abwechselnd eine Seite – geht schnell, aber fehlt ein Schüler, ist das Heft unvollständig.
- Bei **RAID 1** schreiben zwei Schüler **dasselbe** ab – fehlt einer, hat der andere alles.
- Bei **RAID 5** schreiben alle abwechselnd und zusätzlich jeder ab und zu eine **Prüfsumme**, mit der man eine fehlende Seite **zurückrechnen** kann.
- Ein **Hot-Spare** ist ein Schüler, der **auf der Bank wartet** und sofort einspringt, wenn einer krank wird.

Und ganz wichtig: Wenn ein Schüler **aus Versehen etwas Falsches** ins Heft schreibt, schreiben es bei RAID 1 **beide** falsch. Deshalb ist RAID **keine Sicherungskopie** – dafür braucht man ein Backup an einem anderen Ort.

## Merksatz
- RAID **0** = **0** Sicherheit.
- **RAID ≠ Backup.**
- RAID 5: Parität **verteilt**, RAID 3: Parität auf **eigener** Platte.
- **10 vor 01** – erst spiegeln, dann stripen.
- Hot-**Spare** wartet, Hot-**Swap** tauscht.

## Prüfungsfalle
- **Quellenfehler korrigiert:** Die Folie zu RAID-5 sagt „Daten auf 3 Platten, die vierte bekommt Parity“ – das beschreibt eher RAID 3/4. Bei RAID 5 ist die Parität **über alle Platten verteilt** (die Folie sagt es eine Zeile später selbst).
- **Quellenfehler korrigiert:** RAID 10 ist laut Folie „langsamer“ als 01 – in der Praxis sind beide gleich schnell; RAID 10 ist robuster und rebuildet schneller.
- „Schreibrate halbiert sich bei RAID 1“ gilt nur grob für Software-RAID ohne Cache; Lesen kann sogar schneller werden.
- „Linux weit weniger fehleranfällig als Windows (ZFS)“ ist eine pauschale Meinung der Folie – ZFS ist ein Dateisystem mit Prüfsummen, unter Windows gibt es ReFS/Storage Spaces mit vergleichbaren Funktionen.

## Grafik
### RAID 5 – Ausfall und Rebuild mit Hot-Spare
1. Disk1: Datenblock A1, Disk2: A2, Disk3: Parität Ap
2. Disk2: fällt aus
3. Controller: berechnet A2 = A1 XOR Ap
4. Controller -> Spare: schreibt rekonstruierte Daten auf die Hot-Spare
5. Spare: übernimmt die Rolle von Disk2, Array wieder redundant

## Übungen
- A: 1. Was bedeutet RAID genau, in eigenen Worten? | L: Redundant Array of Independent (früher Inexpensive) Disks – mehrere physische Platten werden zu einem logischen Laufwerk zusammengeschaltet, um Geschwindigkeit und/oder Ausfallsicherheit zu erhöhen. Für das Betriebssystem ist es ein einziges Laufwerk.
- A: 2. Wie viele Platten setzt RAID voraus und auf welche zwei Arten realisiert man es? | L: Mindestens zwei Platten (RAID 5 drei, RAID 6 und 10 vier). Realisierung als Hardware-RAID (Controller) oder Software-RAID (Betriebssystem).
- A: 3. Je zwei Vor- und Nachteile von Hard- und Software-RAID | L: Hardware: + entlastet CPU, + höchster Durchsatz mit Controller-Cache/BBU; – teuer, – Controller-Abhängigkeit (Ersatz muss kompatibel sein). Software: + keine Zusatzkosten, + flexibel/portabel; – belastet CPU, – Mehrleistung begrenzt und oft OS-abhängig (teils nicht bootfähig).
- A: 4. Fünf klassische Probleme bei RAID | L: 1) Hinzufügen neuer (größerer) Platten – Platz bleibt ungenutzt bzw. Migration nötig. 2) Austausch durch nicht identische Platten. 3) Inkompatibilität neuer Controller nach Defekt. 4) Statische Fehlerrate (URE) beim Rebuild. 5) Abhängigkeit von OS und Dateisystem beim Einbinden. Zusätzlich: Serienfehler bei Platten gleicher Charge, Write Hole bei Stromausfall.
- A: 5. Wofür steht URE? Erläutern Sie. | L: Unrecoverable Read Error – ein Sektor kann trotz Fehlerkorrektur nicht gelesen werden. Typisch 1 Fehler je 10^14 Bit (ca. 12,5 TB) bei Desktop-HDDs. Beim Rebuild großer RAID-5-Arrays muss alles gelesen werden – ein URE kann den Rebuild scheitern lassen. Gegenmittel: RAID 6, Enterprise-Platten (10^15/10^16), Scrubbing.
- A: 6. Beschreiben Sie RAID 0 – warum kein „richtiges“ RAID? | L: Striping: Daten werden blockweise abwechselnd auf mindestens zwei Platten geschrieben, Datenrate steigt (theoretisch Verdopplung). Es gibt keine Redundanz – das R in RAID fehlt; fällt eine Platte aus, sind alle Daten weg. Einsatz: Streaming, Recording, Scratch.
- A: 7. Beschreiben Sie RAID 1 und ein Anwendungsszenario. | L: Mirroring: Daten werden gleichzeitig auf mindestens zwei Platten geschrieben; fällt eine aus, läuft das System weiter. Kapazität 50 %. Szenario: Systemplatte eines Servers (Betriebssystem), kleine Datenbanken, wichtige Echtzeitdaten.
- A: 8. Erklären Sie RAID 5 – warum am beliebtesten? | L: Striping mit verteilter XOR-Parität über mindestens drei Platten; eine Platte darf ausfallen, die Daten werden aus den übrigen + Parität rekonstruiert. Beliebt, weil guter Kompromiss: nur eine Platte Kapazitätsverlust (n−1), gute Leseleistung, Ausfallsicherheit, günstiger als Spiegelung.
- A: 9. Zwei Vor- und Nachteile einer separaten Parity-Platte (RAID 3) | L: Vorteile: einfaches Prinzip, beliebig viele Datenplatten bei nur einer Paritätsplatte, gutes sequenzielles Lesen. Nachteile: Paritätsplatte wird bei jedem Schreibvorgang gebraucht (Flaschenhals, Verschleiß); fällt sie aus, ist keine Redundanz mehr vorhanden.
- A: 10. Welches RAID ist ähnlich RAID 5, aber redundanter? | L: RAID 6 – doppelte (zwei unabhängige) Paritäten, mindestens 4 Platten, Kapazität n−2, zwei Platten dürfen gleichzeitig ausfallen; Schreiben langsamer, teurer.
- A: 11. Erklären Sie RAID 01, 10, 30 und 51. | L: 01: zwei RAID-0 werden gespiegelt (schnell, eine Platte pro Seite killt den ganzen Stripe). 10: RAID-1-Paare werden gestriped (robuster, pro Spiegel darf eine Platte ausfallen). 30: mehrere RAID-3 werden gestriped (gleicht Paritätsflaschenhals etwas aus). 51: zwei RAID-5 werden gespiegelt (mind. 6 Platten, sehr hohe Sicherheit, Kapazität (n/2)−1).
- A: 12. Vor- und Nachteile von Intel Matrix RAID (0/1) | L: Vorteile: mit nur zwei Platten Geschwindigkeit (RAID-0-Bereich) und Sicherheit (RAID-1-Bereich) kombiniert, günstig (Chipsatz). Nachteile: beide Bereiche liegen auf denselben Platten – ein Ausfall zerstört den RAID-0-Teil, Leistung wird geteilt, Bindung an Intel-Treiber/Tool, das mitlaufen muss.
- A: 13. Was ist Hot-Spare und wie erhöht es die Sicherheit? | L: Eine leere, unbenutzte Reserveplatte im Verbund. Fällt eine Platte aus, startet der Controller sofort automatisch den Rebuild auf die Hot-Spare – das Zeitfenster ohne Redundanz wird minimal, kein manueller Tausch nötig.
- A: 14. Was bietet ein Cache und wie setzt man ihn ein? | L: Zwischenspeicher (DRAM) auf dem Controller beschleunigt Lesen (Read-Ahead) und Schreiben (Write-Back). Write-Back nur mit BBU oder Flash-Backed Cache und USV einsetzen, sonst Datenverlust bei Stromausfall; Alternative Write-Through (sicher, langsamer).
- A: 15. Wie können SSDs in RAID eingebunden werden, ohne Datenplatte zu sein? | L: Als Cache/Tiering-Schicht vor einem HDD-Array (z. B. Controller-SSD-Caching, Storage Spaces Tiering, ZFS L2ARC/SLOG) oder als per PCIe/NVMe angebundene Cache-Karte; häufig gelesene Daten liegen dann automatisch auf der schnellen SSD.

## Karteikarten
- F: Was ist ein URE? | A: Unrecoverable Read Error – nicht lesbarer Sektor, gefährlich beim Rebuild
- F: Warum ist RAID 0 kein „echtes“ RAID? | A: Es hat keine Redundanz
- F: Mindestplattenzahl RAID 5? | A: 3
- F: Wie viele Platten dürfen bei RAID 6 ausfallen? | A: Zwei
- F: Unterschied RAID 3 und RAID 5? | A: RAID 3 eigene Paritätsplatte, RAID 5 Parität verteilt
- F: RAID 51 – Aufbau? | A: Zwei RAID-5-Verbände werden gespiegelt, mindestens 6 Platten
- F: Was ist Matrix-RAID? | A: Intel-Technik: verschiedene RAID-Level (z. B. 0 und 1) auf denselben zwei Platten
- F: Hot-Spare vs. Hot-Swap? | A: Hot-Spare = Reserveplatte im Verbund; Hot-Swap = Tausch im laufenden Betrieb
- F: Was schützt den Write-Back-Cache? | A: BBU (Pufferbatterie) oder Flash-gestützter Cache plus USV
- F: Wofür steht LVM? | A: Logical Volume Manager – dynamische Datenträgerverwaltung unter Linux

## Quiz
? Welches RAID-Level hat keine Redundanz?
* RAID 0
- RAID 1
- RAID 5
- RAID 6

? Was beschreibt RAID 3?
* Striping mit separater Paritätsplatte
- Spiegelung zweier Stripes
- Verteilte doppelte Parität
- Nur Spiegelung

? Wie viele Platten benötigt RAID 51 mindestens?
* 6
- 3
- 4
- 8

? Wozu dient eine Hot-Spare?
* Sie springt bei einem Ausfall automatisch ein und wird neu beschrieben
- Sie speichert die Parität bei RAID 5
- Sie ersetzt das Backup
- Sie beschleunigt den Cache

? Welches Problem beschreibt „URE“?
* Ein nicht korrigierbarer Lesefehler, der einen Rebuild scheitern lassen kann
- Einen zu kleinen Controller-Cache
- Eine falsche Stripe-Größe
- Den Ausfall der USV

? Was ist ein Nachteil der separaten Paritätsplatte?
* Sie ist bei jedem Schreibvorgang beteiligt und wird zum Flaschenhals
- Sie verdoppelt die Kapazität
- Sie verhindert jeden Ausfall
- Sie ist nur bei RAID 0 möglich

? Welche Aussage zu RAID 10 und 01 ist richtig?
* RAID 10 spiegelt zuerst und stripet dann, es ist robuster als 01
- RAID 01 ist robuster, weil zuerst gestriped wird
- Beide benötigen nur zwei Platten
- RAID 10 hat keine Redundanz

? Was ist bei einem Write-Back-Cache ohne BBU riskant?
* Datenverlust bei Stromausfall
- Höherer Plattenverschleiß
- Keine Parität möglich
- Langsameres Lesen

## Spickzettel
- 0 Stripe (keine Redundanz), 1 Mirror, 5 verteilte Parität (n−1), 6 doppelt (n−2)
- 3 = eigene Paritätsplatte (Flaschenhals)
- 10 > 01, 30 = gestripte RAID 3, 51 = gespiegelte RAID 5 (min. 6)
- URE = nicht lesbarer Sektor beim Rebuild → RAID 6
- Hot-Spare springt automatisch ein, Hot-Swap = Tausch im Betrieb
- Cache Write-Back nur mit BBU/USV
- RAID ist kein Backup
