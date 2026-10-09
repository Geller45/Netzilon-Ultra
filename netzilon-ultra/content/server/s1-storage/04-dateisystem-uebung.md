---
id: server-dateisystem-uebung
bereich: AP1
pruefungen: [AP1, Schule]
fach: Windows Server / Basic
block: S1
kapitel: Storage
titel: Dateisystem – Folien und Übung Partitionen, FAT/NTFS, fsutil komplett gelöst
stufe: Einsteiger
typ: uebung
quellen: [07-Folien-Dateisystem.pdf, 07-Uebung-Dateisystem.pdf]
verweise: [ap1-a2-dateisysteme, az800-datentraeger, az800-dateisysteme, legacy-bios-uefi, ap1-a6-ntfs]
---

## Profi

Die Theorie zu Partitionierung und Dateisystemen steht im Thema **Partitionierung & Dateisysteme** (ap1-a2-dateisysteme). Diese Seite fasst die **Folien von Herrn Schwab** zusammen und löst die **Übung Dateisystem (Aufgaben 1–22)** – aktualisiert von Windows 7 auf **Windows 11 / Windows Server 2025**.

### Folien kompakt
- Festplatten sind in **Blöcke/Sektoren** unterteilt: **512 Byte**, bei großen Platten **4 KB** (Advanced Format, 512e/4Kn).
- Beim Partitionieren werden **MBR** (Master Boot Record) und **Bootsektor** geschrieben. Das **BIOS** lädt aus dem MBR den Bootloader, der den Bootsektor der **aktiven** Partition startet. **GPT** benötigt **UEFI** (statt BIOS) zum Booten.
- Partitionstypen (MBR): **primäre** Partition, **erweiterte** Partition mit **logischen Laufwerken**. **Basisdatenträger mit MBR: max. 4 Partitionen, höchstens eine erweiterte** (also 4 primäre oder 3 primäre + 1 erweiterte). GPT: unter Windows 128 Partitionen, keine erweiterte nötig.
- Das **Dateisystem** entsteht beim **Formatieren**: mehrere Sektoren werden zu **Clustern** zusammengefasst, ein **Inhaltsverzeichnis** (bei NTFS die MFT) speichert Name, Größe, Zeitstempel, Berechtigungen und den freien Platz.
- **Partitionieren und Formatieren löschen keine Daten**, sie sind nur nicht mehr erreichbar (→ Datenrettung möglich, sicheres Löschen nur mit Überschreiben).

### FAT, FAT32, NTFS (Folientabelle korrigiert)
| Eigenschaft | FAT (FAT16) | FAT32 | NTFS |
|---|---|---|---|
| max. Partition | 4 GB (64-KB-Cluster) | 2 TB (Windows formatiert per GUI nur bis **32 GB**) | 256 TB bei 64-KB-Clustern (praktisch; theoretisch 8 PB mit 2-MB-Clustern) |
| max. Dateigröße | 2/4 GB | **4 GB − 1 Byte** | praktisch unbegrenzt (16 EB theoretisch) |
| Clustergröße | bis 64 KB | 4–32 KB | Standard 4 KB |
| Sicherheit | nur Attribute | nur Attribute | **ACL-Berechtigungen**, **EFS-Verschlüsselung** |
| Komprimierung | keine | keine | Dateien, Ordner, Laufwerke |
| Journal | nein | nein | ja (Transaktionsprotokoll $LogFile) |

Die 2-TB-Grenze in der Folie bezieht sich auf **MBR-Datenträger**, nicht auf NTFS – auf **GPT** gilt sie nicht.

### NTFS-Besonderheiten
- **Master File Table (MFT)**: Eintrag (1 KB) pro Datei/Ordner. **Sehr kleine Dateien** (wenige hundert Byte) liegen **resident** direkt in der MFT, größere über Verweise auf Cluster. Die Folie nennt „12,5 % des Plattenplatzes“ – das ist die **reservierte MFT-Zone**, nicht der tatsächlich belegte Platz; die Grenze „≤ 4 KB direkt in der MFT“ ist zu hoch (real ca. 700 Byte).
- **Attribute**: Schreibgeschützt, Archiv, Versteckt, System, **Komprimiert oder Verschlüsselt – nicht beides gleichzeitig**.
- **Sparse Files**: Datei mit großer logischer Größe, aber nur die tatsächlich benutzten Bereiche belegen Platz (z. B. SQL-Server-Datenbank-Snapshots).
- **Dateitypen**: ausführbar (.exe, .com, .bat, .ps1 über Interpreter) oder über die **Dateiendung** mit einem Programm verknüpft (Standard-Apps in den Einstellungen änderbar).

## Einfach

Eine Festplatte ist wie ein **leerer Dachboden**.
- **Partitionieren** heißt: Du ziehst **Wände** ein und machst Zimmer daraus. Bei der alten Bauweise (**MBR**) darfst du nur **vier Zimmer** bauen. Brauchst du mehr, machst du aus dem vierten Zimmer einen **Flur** (erweiterte Partition), von dem weitere **kleine Kammern** (logische Laufwerke) abgehen. Bei der neuen Bauweise (**GPT**) darfst du einfach 128 Zimmer bauen.
- **Formatieren** heißt: Du stellst **Regale** in ein Zimmer und hängst an die Tür eine **Inhaltsliste**. Ohne Regale (unformatiert) kannst du nichts einräumen.
- **FAT32** ist ein **altes Regal**: Es passt fast überall (USB-Sticks, Kameras), aber keine Kiste darf schwerer als **4 GB** sein, und es gibt **kein Schloss**.
- **NTFS** ist ein **modernes Regal mit Schlössern** (Berechtigungen), **Vakuumbeuteln** (Komprimierung) und einem **Logbuch** (Journal), falls der Strom ausfällt.

**Verschieben im selben Zimmer** geht blitzschnell – du änderst nur die Inhaltsliste. **Verschieben in ein anderes Zimmer** heißt: Kiste raustragen, drüben einräumen und hier wegwerfen – das dauert.

**Dateiendung** ist das **Etikett** auf der Kiste: „.txt“ sagt „mach mich mit dem Editor auf“. Ein Trick von Betrügern ist **„rechnung.pdf.exe“** – wenn Windows die Endungen versteckt, siehst du nur „rechnung.pdf“, aber in Wahrheit ist es ein **Programm**!

## Merksatz
- MBR: **4 primär – oder 3 + 1 erweitert**.
- **FAT32: 4 GB pro Datei.**
- Verschieben **gleiches Volume = schnell**, anderes Volume = **kopieren + löschen**.
- **Endungen immer einblenden!**
- Komprimiert **oder** verschlüsselt – **nie beides**.

## Prüfungsfalle
- Für erweiterte Partitionen muss der Datenträger als **MBR** initialisiert werden – Windows 11/Server 2025 schlagen standardmäßig **GPT** vor.
- „FAT“ auf 10 GB geht nicht als FAT16 (max. 4 GB) → Windows bietet **FAT32** an; per GUI formatiert Windows FAT32 nur bis 32 GB.
- Eine 5-GB-Datei lässt sich **nicht** auf ein FAT32-Laufwerk kopieren (Fehler „Datei zu groß“), obwohl genug Platz frei ist.
- **Versteckt** ist kein Schutz – mit „Ausgeblendete Elemente“ sieht man alles.
- Sparse-Flag allein spart keinen Platz – erst `fsutil sparse setrange` gibt Bereiche frei.

## Grafik
### Datei verschieben – gleiches und anderes Volume
1. L: -> L: test.txt nach \Verkauf verschieben
2. MFT: ändert nur den Verzeichniseintrag, Daten bleiben liegen
3. L: -> K: test.txt auf anderes Volume verschieben
4. K: Daten werden vollständig kopiert (2 GB, dauert)
5. L: Original wird danach gelöscht

## Lab
Maschine: **EXA-CL01** (Windows-11-VM im Heimlabor) bzw. eine Server-2025-VM. Zwei neue virtuelle Festplatten à 40 GB (Hyper-V: Einstellungen → SCSI-Controller → Festplatte → Neu → VHDX dynamisch 40 GB). Anmelden als lokaler Administrator.

### GUI
1. Explorer öffnen → die neuen Platten erscheinen **nicht** (nicht initialisiert).
2. Rechtsklick Start → **Datenträgerverwaltung** → Dialog „Datenträger initialisieren“ → **MBR** wählen (wegen erweiterter Partition).
3. Datenträger 1: dreimal **Neues einfaches Volume** à 10 240 MB → bei „Partition formatieren“ **Dieses Volume nicht formatieren**.
4. Im freien Bereich (10 GB Rest) → **Neues einfaches Volume** – bei MBR legt Windows ab der 4. Partition automatisch eine **erweiterte Partition** mit logischem Laufwerk an; zweites logisches Laufwerk im Rest anlegen.
5. Erste primäre Partition → Rechtsklick **Formatieren** → FAT32 → Rechtsklick **Laufwerkbuchstaben ändern** → **K:**.
6. Logische Laufwerke → NTFS → Buchstaben **L:** und **M:**.
7. Auf K: und L: je Ordner + Textdatei anlegen → Rechtsklick **Eigenschaften** vergleichen.
8. Datei → Eigenschaften → **Schreibgeschützt**; Ordner auf L: → Eigenschaften → **Versteckt**; danach löschen.
9. Datenträger 2 initialisieren (MBR) → in der Datenträgerverwaltung keine direkte „erweitert“-Option → mit **diskpart** (siehe PowerShell) erweiterte Partition 40 GB + logisches Laufwerk → NTFS.
10. Explorer → Ansicht → Einblenden → **Dateinamenerweiterungen** ein.

### PowerShell
```powershell
# EXA-CL01 als Administrator – Datentraeger 1 (Nummer pruefen!)
Get-Disk | Where-Object PartitionStyle -eq 'RAW'
Initialize-Disk -Number 1 -PartitionStyle MBR

# Partitionen per diskpart (erweitert/logisch geht dort am klarsten)
@"
select disk 1
create partition primary size=10240
create partition primary size=10240
create partition primary size=10240
create partition extended size=10240
create partition logical size=5120
create partition logical
"@ | Set-Content C:\Temp\dp1.txt
diskpart /s C:\Temp\dp1.txt

# Formatieren und Buchstaben
Format-Volume -Partition (Get-Partition -DiskNumber 1 -PartitionNumber 1) -FileSystem FAT32 -NewFileSystemLabel FAT
Set-Partition -DiskNumber 1 -PartitionNumber 1 -NewDriveLetter K
Get-Partition -DiskNumber 1 | Format-Table PartitionNumber, Type, Size, DriveLetter

# Attribute
Set-ItemProperty L:\Ordner\info.txt -Name IsReadOnly -Value $true
(Get-Item L:\Ordner -Force).Attributes += 'Hidden'
attrib +h L:\Ordner

# Grosse Testdatei, Verschieben, Sparse
fsutil file createnew L:\test.txt 2147483648
Move-Item L:\Einkauf\test.txt L:\Verkauf\        # sofort fertig (gleiches Volume)
Move-Item L:\Verkauf\test.txt K:\                # kopiert 2 GB, dann loeschen
fsutil file createnew L:\gross.txt 10485760
fsutil sparse setflag L:\gross.txt
fsutil sparse setrange L:\gross.txt 0 10485760
fsutil sparse queryflag L:\gross.txt
```

## Übungen
- A: 3. Werden die neuen Festplatten im Explorer angezeigt? | L: Nein. Nicht initialisierte bzw. nicht partitionierte Datenträger erscheinen nur in der Datenträgerverwaltung.
- A: 5. Wie legt man 3 primäre, eine erweiterte (20 GB) und zwei logische Laufwerke an? | L: Datenträger als MBR initialisieren, drei primäre à 10 GB, dann erweiterte Partition 20 GB und darin zwei logische à 10 GB (ggf. per diskpart: create partition extended/logical). Mit GPT gibt es keine erweiterten Partitionen.
- A: 6. Werden die unformatierten Laufwerke jetzt im Explorer angezeigt? | L: Nur wenn ihnen ein Laufwerksbuchstabe zugewiesen wurde; beim Öffnen fordert Windows zum Formatieren auf, weil kein Dateisystem vorhanden ist.
- A: 7. Erste primäre Partition mit FAT formatieren und K: zuweisen – was fällt auf? | L: FAT16 ist auf 4 GB begrenzt, bei 10 GB bietet Windows FAT32 an. Buchstabe per Rechtsklick → Laufwerkbuchstaben ändern → K:.
- A: 9. Unterschiede der Eigenschaften auf K: (FAT32) und L: (NTFS)? | L: Auf FAT32 fehlt die Registerkarte Sicherheit (keine ACLs), unter Erweitert fehlen Komprimieren und Verschlüsseln, keine Vorgängerversionen/Schattenkopien; nur Attribute Schreibgeschützt, Versteckt, Archiv. NTFS hat Berechtigungen, Besitzer, Komprimierung, EFS.
- A: 10. Wie verhindert man, dass eine Datei geändert wird? | L: Attribut Schreibgeschützt setzen (Eigenschaften oder attrib +r) – sicherer: NTFS-Berechtigung Schreiben verweigern bzw. nur Lesen erteilen.
- A: 11. Wie versteckt man den Ordner auf L:? | L: Eigenschaften → Attribut Versteckt (attrib +h). Er ist nur unsichtbar, solange „Ausgeblendete Elemente“ aus ist – kein Schutz.
- A: 13. Zweite Platte: erweiterte Partition 40 GB mit logischem Laufwerk NTFS | L: MBR initialisieren, diskpart: create partition extended, create partition logical, dann format fs=ntfs quick und assign. Erweiterte Partitionen selbst bekommen keinen Buchstaben.
- A: 14. 2-GB-Datei mit fsutil auf L: erstellen, nach Einkauf und dann auf K: kopieren | L: fsutil file createnew L:\test.txt 2147483648; Ordner anlegen; kopieren funktioniert, da 2 GB < 4-GB-Grenze von FAT32.
- A: 15. L:\Einkauf\test.txt nach L:\Verkauf verschieben – was fällt auf? | L: Geht sofort, da nur der Verzeichniseintrag in der MFT geändert wird; NTFS-Berechtigungen werden beim Verschieben im selben Volume beibehalten.
- A: 16. L:\Verkauf\test.txt nach K: verschieben – was fällt auf? | L: Dauert lange: Verschieben über Volumes = Kopieren + Löschen. Auf FAT32 gehen NTFS-Rechte/Attribute wie Komprimierung verloren.
- A: 17. Endungen anzeigen, test-neu.txt anlegen – welches Programm öffnet sie? | L: Explorer → Ansicht → Einblenden → Dateinamenerweiterungen. Doppelklick öffnet den Editor (Notepad), da .txt mit ihm verknüpft ist.
- A: 18. In test.html umbenennen – welches Programm öffnet sich? | L: Der Standardbrowser (z. B. Edge), da .html mit dem Browser verknüpft ist; die Warnung beim Umbenennen erscheint, weil sich der Dateityp ändert.
- A: 19. <h1> und </h1> ergänzen – Ergebnis beim Doppelklick? | L: Der Browser stellt den Text als große Überschrift dar – der Inhalt wird als HTML interpretiert.
- A: 20. In test.html.exe umbenennen, Endungen wieder ausblenden – was ist das Problem? | L: Der Explorer zeigt nur „test.html“ – die Datei wirkt harmlos, ist aber als ausführbare Datei verknüpft (Doppelklick → Fehler „keine gültige Anwendung“). Typischer Malware-Trick, daher Endungen immer anzeigen.
- A: 21. L:\gross.txt mit 10 MB anlegen – welche Größe zeigen Explorer und Eigenschaften? | L: fsutil file createnew L:\gross.txt 10485760. Explorer: 10.240 KB. Eigenschaften: Größe 10,0 MB, Größe auf Datenträger ebenfalls ca. 10 MB (Cluster sind reserviert).
- A: 22. Sparse-Flag setzen und Größe prüfen | L: fsutil sparse setflag L:\gross.txt; erst mit fsutil sparse setrange L:\gross.txt 0 10485760 werden die Null-Bereiche freigegeben → Größe 10 MB, Größe auf Datenträger 0 Byte.

## Karteikarten
- F: Maximal wie viele Partitionen hat ein MBR-Basisdatenträger? | A: 4 primäre oder 3 primäre + 1 erweiterte
- F: Was enthält eine erweiterte Partition? | A: Logische Laufwerke
- F: Welche Firmware braucht man zum Booten von GPT? | A: UEFI
- F: Maximale Dateigröße bei FAT32? | A: 4 GB minus 1 Byte
- F: Löscht Formatieren die Daten? | A: Nein, sie sind nur nicht mehr über das Dateisystem erreichbar
- F: Was ist die MFT? | A: Master File Table – Inhaltsverzeichnis von NTFS mit einem Eintrag pro Datei
- F: Was ist eine Sparse-Datei? | A: Datei, bei der nur tatsächlich benutzte Bereiche Platz belegen
- F: Was bewirkt Verschieben auf demselben NTFS-Volume? | A: Nur der Verzeichniseintrag ändert sich, Daten und Rechte bleiben
- F: Welche Attribute schließen sich bei NTFS aus? | A: Komprimiert und Verschlüsselt (EFS)
- F: Befehl für eine leere Testdatei bestimmter Größe? | A: fsutil file createnew <Pfad> <Bytes>

## Quiz
? Wie viele erweiterte Partitionen erlaubt ein MBR-Datenträger höchstens?
* Eine
- Zwei
- Vier
- Beliebig viele

? Eine 6-GB-Videodatei soll auf ein FAT32-Laufwerk mit 20 GB freiem Platz. Was passiert?
* Fehler – die Datei ist für das Dateisystem zu groß
- Sie wird automatisch komprimiert
- Sie wird problemlos kopiert
- Sie wird in zwei Dateien geteilt

? Welche Registerkarte fehlt bei Dateien auf FAT32?
* Sicherheit
- Allgemein
- Details
- Vorgängerversionen und Sicherheit sind beide immer vorhanden

? Warum ist „rechnung.pdf.exe“ bei ausgeblendeten Endungen gefährlich?
* Sie wird als „rechnung.pdf“ angezeigt, ist aber ein Programm
- Sie wird automatisch gelöscht
- Sie lässt sich nicht öffnen
- PDF-Dateien sind immer ausführbar

? Warum geht das Verschieben einer 2-GB-Datei innerhalb von L: sofort?
* Nur der Verzeichniseintrag in der MFT wird geändert
- Weil L: komprimiert ist
- Weil FAT32 schneller ist
- Weil die Datei sparse ist

? Welcher Partitionsstil ist für erweiterte Partitionen nötig?
* MBR
- GPT
- ReFS
- Dynamisch

? Was sagt die 2-TB-Grenze der Folie wirklich aus?
* Sie gilt für MBR-Datenträger, nicht für GPT
- NTFS kann nie größer als 2 TB sein
- FAT32-Dateien dürfen 2 TB groß sein
- Sie gilt nur für USB-Sticks

? Welche Kombination aus Befehlen macht eine Datei wirklich platzsparend sparse?
* fsutil sparse setflag und fsutil sparse setrange
- attrib +s
- compact /c
- fsutil file createnew

## Spickzettel
- MBR: 4 Partitionen (max. 1 erweitert mit logischen), BIOS; GPT: 128, UEFI
- FAT32: Datei max. 4 GB, keine ACL; NTFS: ACL, EFS, Komprimierung, Journal
- Formatieren löscht nicht wirklich
- Verschieben im Volume = schnell, Rechte bleiben
- Endungen anzeigen (Malware .pdf.exe)
- fsutil file createnew / sparse setflag + setrange
