---
id: ap1-a2-backup
bereich: AP1
block: A2
kapitel: Strom & Speicher
titel: Datensicherung & Archivierung
stufe: Fortgeschritten
quellen: [xx-Folie-Backup.pdf]
verweise: [ap1-a2-raid, ap1-a2-usv, ap1-a2-dateisysteme, az801-azure-backup, ap2-datenschutz]
---

## Profi

### Datensicherung vs. Archivierung
| | Datensicherung (Backup) | Archivierung |
|---|---|---|
| Ziel | **Wiederherstellung** nach Verlust/Beschädigung | **Unveränderbare, langfristige Aufbewahrung** (rechtlich/organisatorisch) |
| Daten | Kopie aktueller Daten, wird regelmäßig überschrieben | Original wird ins Archiv verschoben, bleibt unverändert |
| Dauer | Tage bis Monate (Rotation) | Jahre (Aufbewahrungsfristen) |

### Notfallplan / Sicherungskonzept
Vor der Einrichtung werden festgelegt:
- **Welche Daten** sind wichtig? (Datenbanken, Fileserver, AD, Konfigurationen, E-Mails)
- **Wie häufig** und **wann** wird gesichert? (z. B. täglich nachts, außerhalb der Arbeitszeit)
- **Wie lange und wo** werden Sicherungen aufbewahrt? (Aufbewahrungsdauer, räumlich getrennt, brandsicher)
- **Wer** darf sichern und wiederherstellen? (Rollen, Vier-Augen-Prinzip)
- **Welche Medien** werden genutzt?
- Kennzahlen: **RPO** (Recovery Point Objective – wie viel Datenverlust ist maximal tolerierbar? → bestimmt die Sicherungshäufigkeit) und **RTO** (Recovery Time Objective – wie schnell muss das System wieder laufen? → bestimmt Verfahren und Medien).

### Richtlinien
- Notfallplan und Sicherungen **regelmäßig prüfen** – **Wiederherstellungstests** (ein ungetestetes Backup ist kein Backup).
- **Mehrere Kopien**, mindestens **tägliche** Sicherung, **automatisieren**, protokollieren und überwachen.
- **3-2-1-Regel**: **3** Kopien der Daten, auf **2** verschiedenen Medientypen, **1** davon außer Haus (offsite). Erweitert **3-2-1-1-0**: 1 Kopie **offline/unveränderbar** (immutable, Schutz gegen Ransomware), **0** Fehler bei der Prüfung.
- Sicherungen **verschlüsseln** (Datenschutz), Zugriff einschränken.

### Sicherungsmedien
| Medium | Eigenschaften | Einsatz |
|---|---|---|
| DVD/Blu-ray | geringe Kapazität, langsam | Privat, evtl. Archiv |
| **Magnetband (LTO)** | **sequenzieller** Zugriff, robust, lange haltbar (bis 30 Jahre), sehr günstig pro TB, offline (Air Gap). LTO-9: 18 TB nativ, ca. 400 MB/s; LTO-10 (2025): 30 TB nativ | Unternehmensbackup, Archiv, Auslagerung |
| Festplatten/NAS | schneller, wahlfreier Zugriff, schnelle Wiederherstellung | Backup-to-Disk |
| Cloud (z. B. Azure Backup) | offsite, skalierbar, abhängig von Internetbandbreite | Offsite-Kopie |
Häufig: **Disk-to-Disk-to-Tape (D2D2T)** – erst schnell auf Festplatte, dann auf Band zur Auslagerung.

### Sicherungsarten und das Archivbit
Beim **Erstellen oder Ändern** einer Datei setzt das Dateisystem das **Archivbit auf 1**.

| Sicherungsart | Was wird gesichert? | Archivbit danach |
|---|---|---|
| **Vollsicherung** | alle ausgewählten Dateien | wird auf **0 zurückgesetzt** |
| **Inkrementell** | nur Dateien, die sich seit der **letzten Sicherung (egal welcher Art)** geändert haben (Archivbit = 1) | wird auf **0 zurückgesetzt** |
| **Differenziell** | alle Dateien, die sich seit der **letzten Vollsicherung** geändert haben (Archivbit = 1) | bleibt **1 (nicht geändert)** |

**Übersicht Archivbit**
| Aktion | gesetzt (1) | zurückgesetzt (0) | nicht geändert |
|---|---|---|---|
| Dokument erstellen | X | | |
| Dokument ändern | X | | |
| Dokument lesen | | | X |
| Vollbackup | | X | |
| Differenzielles Backup | | | X |
| Inkrementelles Backup | | X | |

**Vor- und Nachteile**
| | Vorteil | Nachteil |
|---|---|---|
| Voll | einfachste Wiederherstellung (1 Medium) | viel Platz, lange Dauer |
| Inkrementell | **wenig Platz**, schnellste Sicherung | Wiederherstellung braucht **Vollsicherung + alle Inkremente** in richtiger Reihenfolge; fehlt eins → Lücke |
| Differenziell | Wiederherstellung mit **max. zwei Medien** (Voll + letzte Differenzielle) | jede Sicherung wird **größer** als die vorherige |

**Beispiel**: Vollsicherung Sonntag, Ausfall Donnerstag früh.
- Inkrementell: Voll (So) + Mo + Di + Mi = **4 Medien**
- Differenziell: Voll (So) + Mi = **2 Medien**

Moderne Software (Windows Server-Sicherung, Veeam) arbeitet meist blockbasiert mit **VSS-Snapshots** und **Change Block Tracking** statt mit dem Archivbit – das Prinzip bleibt gleich.

### Großvater-Vater-Sohn-Prinzip (GFS)
Sicherungen werden **mehrfach und über verschiedene Zeiträume** aufbewahrt, denn: Eine Datei kann schon lange mit Malware infiziert oder vor Wochen gelöscht worden sein.
| Generation | Häufigkeit | Medien | überschrieben |
|---|---|---|---|
| **Sohn** | täglich (Mo–Do) | S1–S4 | wöchentlich |
| **Vater** | wöchentlich (Freitag) | V1–V4 (bzw. V5) | monatlich |
| **Großvater** | monatlich (Monatsende) | G1–G12 | quartalsweise oder jährlich |

Ablauf: Woche 1 Mo–Do auf S1–S4, Fr auf V1; Woche 2 wieder S1–S4, Fr V2; Woche 3/4 V3, V4. Am Monatsende zusätzlich G1 (Archivbit beachten – eine Vollsicherung setzt es zurück!). Nächster Monat analog mit G2. Bei 12 Großvätern: **4 + 4 + 12 = 20 Medien** (mit V5 für 5-Wochen-Monate: 21) für ein Jahr Rückgriff.

### Archivierung
- **Elektronische Archivierung**: unveränderbare Aufbewahrung jederzeit reproduzierbarer elektronischer Informationsobjekte.
- **Langzeitarchivierung**: unveränderbare Aufbewahrung über **mehr als 10 Jahre**.
- **Revisionssichere Archivierung**: erfüllt die Anforderungen des **HGB § 239 und § 257**, der **AO § 147** und der **GoBD**.

**Aufbewahrungsfristen (Deutschland)**
| Unterlagen | Frist |
|---|---|
| Handelsbücher, Inventare, Jahresabschlüsse, Lageberichte | 10 Jahre |
| Buchungsbelege (Rechnungen) | **8 Jahre** (seit 01.01.2025, vorher 10) |
| Empfangene/abgesandte Handels- und Geschäftsbriefe | 6 Jahre |
Die Frist beginnt mit dem Ende des Kalenderjahres, in dem das Dokument entstanden ist.

**10 Merksätze zur revisionssicheren Archivierung** (VOI):
1. Ordnungsgemäß nach rechtlichen und internen Anforderungen aufbewahren
2. **Vollständig** archivieren
3. Zum **frühestmöglichen** Zeitpunkt archivieren
4. Mit dem Original übereinstimmend und **unveränderbar** archivieren
5. Nur **Berechtigte** dürfen einsehen
6. In angemessener Zeit **wiederfindbar und reproduzierbar**
7. Frühestens **nach Ablauf der Frist löschen**
8. Jede ändernde Aktion **protokollieren**
9. Verfahren jederzeit durch **sachverständige Dritte prüfbar**
10. Bei **Migrationen** alle Grundsätze einhalten

**Speichertechnologien**: **WORM**-Medien (Write Once Read Many): CD-/DVD-WORM, 5¼″-WORM (bis 60 GB), **WORM-Bänder**, **CAS** (Content Addressed Storage – Festplattensysteme, die Objekte nur einmal schreiben und über Hashwerte adressieren), heute auch **Object Lock/Immutable Storage** in der Cloud.

**Achtung Datenschutz (DSGVO)**: Personenbezogene Daten dürfen nur so lange gespeichert werden wie nötig – nach Ablauf der Aufbewahrungsfrist **löschen**.

## Lab
**Maschine: SRV01** (Windows Server 2022/2025, zusätzliche leere VHDX als Sicherungsziel, Laufwerk E:).

### GUI
1. Server-Manager → Verwalten → Rollen und Features hinzufügen → **Features** → **Windows Server-Sicherung** → Installieren.
2. Tools → **Windows Server-Sicherung** → Lokale Sicherung → Aktionen: **Sicherungszeitplan**.
3. Konfiguration: **Benutzerdefiniert** → Elemente hinzufügen (z. B. C:\Daten und „Systemstatus“).
4. Zeitpunkt: Einmal täglich, 21:00 Uhr.
5. Ziel: **Auf einer dedizierten Festplatte sichern** (wird formatiert!) oder freigegebener Netzwerkordner.
6. Fertig stellen → „Einmalsicherung“ zum Test ausführen.
7. Wiederherstellung testen: **Wiederherstellen** → Datum wählen → Dateien und Ordner → an alternativen Ort.

### PowerShell
```powershell
# Auf SRV01
Install-WindowsFeature Windows-Server-Backup -IncludeManagementTools

# Einmalige Sicherung von C:\Daten nach E:
wbadmin start backup -backupTarget:E: -include:C:\Daten -quiet

# Systemstatus sichern (z. B. auf einem DC)
wbadmin start systemstatebackup -backupTarget:E: -quiet

# Vorhandene Sicherungen anzeigen
wbadmin get versions -backupTarget:E:

# Archivbit anzeigen/setzen (Übung Sicherungsarten)
attrib C:\Daten\*.*
attrib -a C:\Daten\bericht.docx
```

## Einfach

**Backup** ist wie ein **Foto von deinem Zimmer**: Wenn etwas kaputtgeht, kannst du auf dem Foto nachschauen, wie es vorher aussah, und alles wieder herrichten. **Archiv** ist wie ein **Tresor mit alten Zeugnissen**: Die bleiben für immer so, wie sie sind, und niemand darf sie verändern.

**Drei Arten von Backups** – stell dir vor, du schreibst jeden Tag ins Tagebuch:
- **Vollsicherung**: Du kopierst **das ganze Tagebuch**. Dauert lange, aber du hast alles auf einmal.
- **Inkrementell**: Du kopierst nur, was **seit der letzten Kopie** dazugekommen ist. Geht schnell! Aber zum Wiederherstellen brauchst du die große Kopie **plus jeden einzelnen Zettel** danach – verlierst du einen, fehlt ein Tag.
- **Differenziell**: Du kopierst alles, was **seit der letzten großen Kopie** dazugekommen ist. Jeden Tag wird der Zettel etwas dicker, aber zum Wiederherstellen brauchst du nur **zwei Sachen**: die große Kopie und den neuesten Zettel.

**Das Archivbit** ist ein kleines **Fähnchen** an jeder Datei. Ändert man die Datei, geht das Fähnchen hoch („Ich bin neu!“). Die Voll- und die inkrementelle Sicherung sagen danach: „Okay, gesichert“ – Fähnchen runter. Die differenzielle Sicherung lässt es oben, damit sie es beim nächsten Mal wieder mitnimmt.

**Großvater-Vater-Sohn**: Du hebst Kopien von **jedem Tag** (Söhne) eine Woche lang auf, von **jeder Woche** (Väter) einen Monat lang und von **jedem Monat** (Großväter) ein Jahr lang. So kannst du auch noch etwas retten, das vor Monaten kaputtgegangen ist.

**3-2-1-Regel**: **3** Kopien, auf **2** verschiedenen Sachen (z. B. Festplatte und Band), **1** davon in einem **anderen Haus** – falls es brennt.

**Wichtig**: Ein Backup, das man **nie ausprobiert** hat, ist wie ein Feuerlöscher, den man nie geprüft hat. Ob er funktioniert, merkt man sonst erst, wenn es brennt.

## Merksatz
- **Inkrementell** = seit **letzter** Sicherung, Bit **zurück**.
- **Differenziell** = seit **letzter Voll**sicherung, Bit **bleibt**.
- **3-2-1**: 3 Kopien, 2 Medien, 1 außer Haus.
- **GVS**: Sohn täglich, Vater wöchentlich, Großvater monatlich.
- Ungetestetes Backup = **kein** Backup.

## Prüfungsfalle
- Inkrementell und differenziell vertauscht.
- Lesen einer Datei ändert das Archivbit **nicht**.
- RAID oder Schattenkopien sind kein vollwertiges Backup.
- Wiederherstellung inkrementell braucht **alle** Inkremente seit der letzten Vollsicherung.
- Aufbewahrungsfristen: Buchungsbelege seit 2025 **8 Jahre**, Bücher/Jahresabschlüsse 10, Geschäftsbriefe 6.

## Grafik
### Woche der Sicherungen
Kalender Mo–So; Dateien ändern sich täglich (bunte Punkte). Umschalter Voll/Inkrementell/Differenziell: Balken zeigen Sicherungsgröße pro Tag. Knopf „Ausfall am Donnerstag“: markiert die benötigten Medien (inkrementell 4, differenziell 2).

### Archivbit-Fähnchen
Dateisymbole mit Fähnchen; Aktionen (erstellen, ändern, lesen, Voll-, Inkrementell-, Differenziell-Backup) per Klick – Fähnchen gehen hoch/runter/bleiben.

### Großvater-Vater-Sohn
Drei Reihen Bänder (S, V, G) auf einem Jahreszeitstrahl; Bänder rotieren animiert, überschriebene blinken.

### 3-2-1
Drei Dokumentkopien, zwei Medien-Symbole, ein Haus in der Ferne; Feuer im Hauptgebäude zerstört zwei Kopien, die dritte überlebt.

## Karteikarten
- F: Unterschied Datensicherung und Archivierung? | A: Sicherung: Kopie zur Wiederherstellung, wird rotiert. Archivierung: unveränderbare, langfristige Aufbewahrung von Originalen.
- F: Was sichert eine inkrementelle Sicherung? | A: Änderungen seit der letzten Sicherung (egal welcher Art); setzt Archivbit zurück.
- F: Was sichert eine differenzielle Sicherung? | A: Änderungen seit der letzten Vollsicherung; Archivbit bleibt gesetzt.
- F: Vorteil/Nachteil inkrementell? | A: Wenig Platz, schnell / Wiederherstellung braucht viele Medien.
- F: Vorteil/Nachteil differenziell? | A: Max. zwei Medien zur Wiederherstellung / Sicherungen werden täglich größer.
- F: Wann wird das Archivbit gesetzt? | A: Beim Erstellen oder Ändern einer Datei.
- F: Was ist das Großvater-Vater-Sohn-Prinzip? | A: Tägliche (Sohn), wöchentliche (Vater) und monatliche (Großvater) Sicherungen mit Rotation.
- F: 3-2-1-Regel? | A: 3 Kopien, 2 Medientypen, 1 außer Haus.
- F: Was bedeuten RPO und RTO? | A: RPO: maximal tolerierter Datenverlust (Zeitraum). RTO: maximale Ausfallzeit bis zur Wiederherstellung.
- F: Welche Gesetze regeln revisionssichere Archivierung? | A: HGB §§ 239, 257, AO § 147, GoBD.
- F: Was ist WORM? | A: Write Once Read Many – einmal beschreibbar, beliebig oft lesbar.
- F: Aufbewahrungsfrist Buchungsbelege seit 2025? | A: 8 Jahre.
- F: Vorteile von Magnetband? | A: Günstig pro TB, lange haltbar, robust, offline (Schutz vor Ransomware).

## Quiz
? Vollsicherung am Sonntag, inkrementelle Sicherungen Montag bis Mittwoch. Am Donnerstag fällt der Server aus. Wie viele Sicherungen werden zur Wiederherstellung benötigt?
* 4
- 2
- 1
- 3

? Welche Sicherungsart setzt das Archivbit nicht zurück?
* Differenziell
- Inkrementell
- Vollsicherung
- Alle setzen es zurück

? Was besagt die 3-2-1-Regel?
* 3 Kopien, auf 2 Medientypen, 1 davon außer Haus
- 3 Server, 2 RAID-Arrays, 1 Cloud
- 3 Tage, 2 Wochen, 1 Monat aufbewahren
- 3 Vollsicherungen, 2 differenzielle, 1 inkrementelle

? Welche Aktion ändert das Archivbit nicht?
* Eine Datei lesen
- Eine Datei ändern
- Eine Datei erstellen
- Eine inkrementelle Sicherung

? Welche Kennzahl beschreibt den maximal tolerierbaren Datenverlust?
* RPO
- RTO
- MTBF
- SLA

? Was beschreibt der RTO?
* Die maximal tolerierbare Zeit bis zur Wiederherstellung des Betriebs
- Den maximal tolerierbaren Datenverlust
- Die Größe des Backups
- Die Anzahl der Sicherungsmedien
! RPO = Datenverlust, RTO = Wiederherstellungsdauer.

? Welche Sicherungsart benötigt bei der Wiederherstellung nur die letzte Vollsicherung und die letzte Sicherung dieser Art?
* Differenzielle Sicherung
- Inkrementelle Sicherung
- Kopiesicherung
- Spiegelung
! Die differenzielle Sicherung enthält alle Änderungen seit der letzten Vollsicherung.

? Was unterscheidet Archivierung von Datensicherung?
* Archivierung bewahrt Daten langfristig und unverändert auf (z. B. gesetzliche Fristen), Backup dient der Wiederherstellung.
- Es gibt keinen Unterschied.
- Archivierung ist immer kürzer als ein Backup.
- Archivierung erfolgt nur auf USB-Sticks.
! Beispiel: Handelsbriefe 6 Jahre, Buchungsbelege 8 bzw. 10 Jahre Aufbewahrung.
