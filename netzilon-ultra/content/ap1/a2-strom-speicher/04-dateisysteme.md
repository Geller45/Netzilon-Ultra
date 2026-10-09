---
id: ap1-a2-dateisysteme
bereich: AP1
block: A2
kapitel: Strom & Speicher
titel: Partitionierung & Dateisysteme
stufe: Einsteiger
quellen: [07-Uebung-Dateisystem.pdf]
verweise: [ap1-a1-mainboard, ap1-a6-ntfs, ap1-a2-raid, az800-dateisysteme]
---

## Profi

### Partitionierungsschemata
| | **MBR** (Master Boot Record) | **GPT** (GUID Partition Table) |
|---|---|---|
| Firmware | Legacy-BIOS | UEFI |
| Max. Datenträgergröße | 2 TiB (bei 512-Byte-Sektoren) | ca. 9,4 ZB (praktisch unbegrenzt) |
| Partitionen | **4 primäre** oder 3 primäre + **1 erweiterte** mit beliebig vielen **logischen Laufwerken** | 128 (Windows) – keine erweiterten/logischen nötig |
| Ausfallsicherheit | eine Partitionstabelle am Anfang | Kopie der Tabelle am Ende + CRC-Prüfsummen |
| Windows 11 | nur als Datenlaufwerk | Pflicht fürs System (UEFI) |

- **Primäre Partition**: Kann ein Betriebssystem booten, direkt formatiert werden.
- **Erweiterte Partition**: Nur ein Container (bei MBR), kann **nicht formatiert** werden; darin werden **logische Laufwerke** angelegt.
- Ein neuer Datenträger muss zuerst **initialisiert** werden (MBR oder GPT wählen), bevor Partitionen angelegt werden können.
- Unformatierte Partitionen erscheinen **nicht im Explorer** (bzw. nur mit Aufforderung zum Formatieren), da ihnen kein Dateisystem und oft kein Laufwerksbuchstabe zugewiesen ist.

### Dateisysteme im Vergleich
| Dateisystem | Max. Dateigröße | Max. Volume | Rechte (ACL) | Journaling | Einsatz |
|---|---|---|---|---|---|
| FAT16 | 2 GB (4 GB) | 2–4 GB | nein | nein | Legacy |
| **FAT32** | **4 GB − 1 Byte** | 2 TB (Windows formatiert nur bis 32 GB) | nein | nein | USB-Sticks, Kompatibilität, EFI-Systempartition |
| **exFAT** | 16 EB | 128 PB | nein | nein | große USB-Sticks/SD-Karten, plattformübergreifend |
| **NTFS** | 16 TB–8 PB (je Clustergröße) | bis 8 PB | **ja** | **ja** | Windows-Standard |
| **ReFS** | 35 PB | 35 PB | ja | Prüfsummen, Copy-on-Write | Server, Storage Spaces, Hyper-V (kein Boot-Volume in Server 2022) |
| ext4 | 16 TB | 1 EB | ja (POSIX) | ja | Linux-Standard |
| APFS | – | – | ja | Copy-on-Write | macOS |

### NTFS-Funktionen (gegenüber FAT)
- **NTFS-Berechtigungen** (Zugriffssteuerungslisten) auf Datei- und Ordnerebene
- **Journaling** (Protokoll der Metadatenänderungen → schnelle Reparatur nach Absturz)
- **Komprimierung**, **Verschlüsselung (EFS)**, **Datenträgerkontingente** (Quotas)
- **Schattenkopien** (VSS), Hardlinks, symbolische Links, Bereitstellungspunkte
- **Alternate Data Streams** (z. B. Zone.Identifier – „Diese Datei stammt aus dem Internet“)
- Große Dateien und Volumes, bessere Fragmentierungsresistenz

Beim Anschauen der **Eigenschaften** eines Ordners auf **FAT** fehlt die Registerkarte **„Sicherheit“** – auf **NTFS** ist sie vorhanden. Außerdem bietet NTFS unter „Erweitert“ Komprimieren/Verschlüsseln.

### Datei- und Ordnerattribute
| Attribut | Kürzel | Bedeutung |
|---|---|---|
| Schreibgeschützt | R | Datei kann nicht geändert werden (Ordner: wirkt nur bedingt) |
| Versteckt | H | Wird im Explorer standardmäßig nicht angezeigt |
| System | S | Systemdatei, zusätzlich versteckt |
| Archiv | A | Datei wurde seit letzter Sicherung geändert (→ Backup) |
Setzen per Eigenschaften oder `attrib +r +h datei.txt`. **Achtung**: Schreibschutz und „versteckt“ sind **keine Sicherheitsfunktionen** – jeder mit Schreibrechten kann sie aufheben. Echten Schutz bieten nur **NTFS-Berechtigungen**.

### Kopieren vs. Verschieben
| Aktion | Gleiches Volume | Anderes Volume |
|---|---|---|
| **Verschieben** | Nur der **Verweis im Dateisystem** (MFT-Eintrag) wird geändert – **sofort fertig**, auch bei 2 GB; NTFS-Rechte bleiben **erhalten** | Wird intern **kopiert und danach gelöscht** – dauert, Rechte werden vom Zielordner **geerbt** |
| **Kopieren** | Neue Datei, erbt Rechte des Zielordners | Neue Datei, erbt Rechte des Zielordners |

Übungsbeobachtung: `L:\Einkauf\test.txt` → `L:\Verkauf` geht blitzschnell; `L:\Verkauf\test.txt` → `K:` (FAT) dauert, und die Rechte gehen verloren, weil FAT keine kennt.

### Große Testdateien erzeugen
`fsutil file createnew L:\test.txt 2147483648` erzeugt eine Datei von 2 GiB (Größe in Byte, mit Nullen gefüllt). Nützlich zum Testen von Kopier-/Verschiebezeiten und Kontingenten.

### Dateiendungen und Sicherheit
Windows blendet **bekannte Dateiendungen standardmäßig aus**. Das Programm zum Öffnen wird **nur über die Endung** bestimmt, nicht über den Inhalt:
- `test.txt` → Editor
- `test.html` → Browser (Text mit `<h1>…</h1>` wird als Überschrift dargestellt)
- `test.html.exe` bei ausgeblendeten Endungen → wird als **„test.html“** angezeigt, ist aber ein **ausführbares Programm**!

Das nutzen Angreifer (z. B. `Rechnung.pdf.exe`). **Empfehlung**: Dateiendungen per GPO/Explorer-Option **immer einblenden**, Anhänge nicht blind öffnen.

### Clustergröße
Das Dateisystem verwaltet den Speicher in **Clustern** (Zuordnungseinheiten, NTFS Standard **4 KB**). Eine 1-Byte-Datei belegt mindestens einen Cluster („Größe auf Datenträger“ > „Größe“). Große Cluster = weniger Verwaltungsaufwand, aber mehr Verschnitt bei vielen kleinen Dateien.

## Lab
**Maschine: CL01** (Windows 11-VM in Hyper-V). Vorher im Hyper-V-Manager auf dem **Host**: CL01 → Einstellungen → SCSI-Controller → Festplatte hinzufügen → zwei neue dynamische VHDX à 40 GB.

### GUI
1. Auf **CL01** mit Administratorrechten anmelden.
2. Explorer öffnen → die neuen Platten erscheinen **noch nicht**.
3. Rechtsklick Start → **Datenträgerverwaltung** → Dialog „Datenträger initialisieren“ → Datenträger 1 und 2 → **MBR** (für die Übung mit erweiterten Partitionen) → OK.
4. Datenträger 1: Rechtsklick auf „Nicht zugeordnet“ → **Neues einfaches Volume** → 10240 MB → **„Dieses Volume nicht formatieren“** → dreimal wiederholen (3 primäre Partitionen).
5. Beim vierten Volume legt Windows auf MBR automatisch eine **erweiterte Partition** mit logischem Laufwerk an; zwei logische Laufwerke à 10 GB erstellen.
6. Erste primäre Partition: Rechtsklick → **Formatieren** → FAT32 → danach Rechtsklick → **Laufwerkbuchstaben und -pfade ändern** → **K:**.
7. Logische Laufwerke mit **NTFS** formatieren, Buchstaben **L:** und **M:**.
8. Auf K: und L: je einen Ordner mit Textdatei anlegen → Eigenschaften vergleichen (Registerkarte „Sicherheit“ nur auf L:).
9. Textdatei → Eigenschaften → **Schreibgeschützt**; Ordner auf L: → **Versteckt**.
10. Explorer → Ansicht → Anzeigen → **Dateinamenerweiterungen** aktivieren.

### PowerShell
```powershell
# Auf CL01 als Administrator
Get-Disk | Where-Object PartitionStyle -eq 'RAW'
Initialize-Disk -Number 1 -PartitionStyle MBR
Initialize-Disk -Number 2 -PartitionStyle MBR

# Drei primäre Partitionen à 10 GB (unformatiert)
1..3 | ForEach-Object { New-Partition -DiskNumber 1 -Size 10GB }

# Erweiterte Partition + logische Laufwerke per diskpart
@"
select disk 1
create partition extended size=20480
create partition logical size=10240
create partition logical
"@ | diskpart

# Formatieren und Buchstaben setzen
Get-Partition -DiskNumber 1 -PartitionNumber 1 | Set-Partition -NewDriveLetter K
Format-Volume -DriveLetter K -FileSystem FAT32 -NewFileSystemLabel "FAT-Test"
Get-Partition -DiskNumber 1 | Where-Object Type -eq 'Logical' |
  Select-Object -First 1 | Set-Partition -NewDriveLetter L
Format-Volume -DriveLetter L -FileSystem NTFS -NewFileSystemLabel "NTFS-L"

# 2-GiB-Testdatei, Ordner, Attribute
fsutil file createnew L:\test.txt 2147483648
New-Item L:\Einkauf, L:\Verkauf -ItemType Directory
attrib +r L:\Einkauf\notiz.txt
attrib +h L:\Verkauf

# Verschieben auf gleichem Volume vs. anderes Volume messen
Measure-Command { Move-Item L:\test.txt L:\Verkauf\ }
Measure-Command { Move-Item L:\Verkauf\test.txt K:\ }
```
Hinweis: Der letzte Befehl scheitert auf FAT32 nicht an der Größe (2 GiB < 4 GiB). Mit einer 5-GB-Datei würde FAT32 den Fehler „Datei zu groß“ melden.

## Einfach

Eine neue Festplatte ist wie ein **leerer Acker**. Bevor man etwas anbauen kann, muss man drei Dinge tun:

1. **Initialisieren** = den Acker vermessen und einen Plan zeichnen (MBR oder GPT).
2. **Partitionieren** = den Acker in **Felder** aufteilen.
3. **Formatieren** = in jedes Feld **Beete mit Nummern** anlegen, damit man später weiß, wo was wächst. Das ist das **Dateisystem**.

**MBR und GPT** sind zwei Arten von Lageplänen:
- **MBR** ist der alte Plan: Er erlaubt nur **4 große Felder**. Wer mehr will, macht aus dem vierten Feld eine **Kiste** (erweiterte Partition), in die man kleinere Felder (logische Laufwerke) stellt. Außerdem kann er nur Äcker bis 2 TB vermessen.
- **GPT** ist der neue Plan: 128 Felder, riesige Äcker, und er hat eine **Sicherheitskopie** am Ende – wenn der Plan am Anfang kaputtgeht, gibt's noch einen.

**Dateisysteme** sind verschiedene Arten, die Beete zu ordnen:
- **FAT32** ist ein einfacher Schrebergarten: Jeder kommt rein (auch Handy, Auto-Radio, Fernseher), aber es gibt **keine Schlösser** und keine Pflanze darf größer als 4 GB werden.
- **NTFS** ist ein Garten mit **Zaun und Schlüsseln** (Berechtigungen) und einem **Tagebuch** (Journaling), das aufschreibt, was gerade gemacht wird – falls der Strom ausfällt, weiß man, wo man war.
- **exFAT** ist wie FAT, nur für riesige Pflanzen – gut für große USB-Sticks.

**Verschieben ist ein Zaubertrick**: Wenn du eine Datei im **selben** Laufwerk verschiebst, wird nur das **Namensschild** umgehängt – die Datei selbst bewegt sich gar nicht. Darum geht's sofort, egal wie groß sie ist. Auf ein **anderes** Laufwerk muss sie wirklich umziehen – das dauert.

**Die Endungs-Falle**: Windows versteckt gern das Ende eines Dateinamens. Ein Bösewicht nennt sein Programm „Hausaufgabe.pdf.exe“ – du siehst nur „Hausaufgabe.pdf“ und klickst drauf. Zack, Virus! Deshalb: **Dateiendungen immer anzeigen lassen!**

**Schreibgeschützt und versteckt** sind nur ein „Bitte nicht anfassen“-Zettel – kein echtes Schloss. Wer will, nimmt den Zettel einfach ab.

## Merksatz
- **Initialisieren → Partitionieren → Formatieren**.
- MBR: **4 primär, 2 TB**; GPT: **128, riesig, Backup-Tabelle**.
- FAT32: **max. 4 GB pro Datei**, keine Rechte.
- Verschieben im **selben** Volume = **Rechte bleiben**, sonst **erben**.
- **Endungen einblenden!**

## Prüfungsfalle
- Eine erweiterte Partition kann man nicht formatieren – nur die logischen Laufwerke darin.
- FAT32 kann Volumes > 32 GB, aber Windows formatiert per GUI nur bis 32 GB.
- Attribute sind kein Zugriffsschutz.
- Beim Verschieben auf ein anderes Volume gelten die Rechte des Ziels.
- Windows 11-Systemlaufwerk braucht GPT/UEFI.

## Grafik
### Acker-Analogie
Leerer Datenträger als Acker → Lageplan (MBR/GPT) wird gezeichnet → Felder (Partitionen) erscheinen → Beete (Cluster/Dateisystem) werden eingeteilt.

### MBR vs. GPT
Links MBR mit vier Slots, der vierte wird zur Kiste mit logischen Laufwerken; rechts GPT mit 128 Slots und Backup-Tabelle am Ende. Knopf „Tabelle beschädigen“: MBR verloren, GPT stellt sich aus der Kopie wieder her.

### Verschieben vs. Kopieren
Datei im selben Volume: nur ein Pfeil im Inhaltsverzeichnis springt um (0,01 s). Anderes Volume: Datenblöcke wandern mit Fortschrittsbalken, Schloss-Symbol (NTFS-Rechte) wird durch das des Ziels ersetzt.

### Endungs-Falle
Dateiname „Rechnung.pdf.exe“; Schalter „Endungen anzeigen“ enthüllt das „.exe“, Warnsymbol blinkt.

## Karteikarten
- F: Reihenfolge beim Einrichten eines neuen Datenträgers? | A: Initialisieren (MBR/GPT) → Partitionieren → Formatieren (Dateisystem) → Laufwerksbuchstabe.
- F: Wie viele primäre Partitionen erlaubt MBR? | A: 4 (oder 3 primäre + 1 erweiterte).
- F: Maximale Datenträgergröße MBR? | A: 2 TiB (bei 512-Byte-Sektoren).
- F: Vorteile GPT? | A: > 2 TB, 128 Partitionen, Backup-Tabelle, CRC, Pflicht für UEFI-Boot.
- F: Maximale Dateigröße FAT32? | A: 4 GB − 1 Byte.
- F: Nenne vier NTFS-Funktionen, die FAT fehlen. | A: Berechtigungen, Journaling, Komprimierung, EFS, Kontingente, Schattenkopien.
- F: Was passiert beim Verschieben innerhalb eines NTFS-Volumes? | A: Nur der Verzeichniseintrag ändert sich – sofort, Rechte bleiben erhalten.
- F: Was passiert beim Verschieben auf ein anderes Volume? | A: Kopieren + Löschen, Rechte werden vom Ziel geerbt.
- F: Befehl für eine 2-GiB-Testdatei? | A: fsutil file createnew <Pfad> 2147483648
- F: Warum ist „datei.pdf.exe“ gefährlich? | A: Bei ausgeblendeten Endungen erscheint sie als „datei.pdf“, ist aber ausführbar.
- F: Sind „Schreibgeschützt“ und „Versteckt“ Sicherheitsfunktionen? | A: Nein, nur Attribute; echten Schutz bieten NTFS-Berechtigungen.
- F: Standard-Clustergröße NTFS? | A: 4 KB.

## Quiz
? Eine 6-GB-Videodatei soll auf einen USB-Stick. Welches Dateisystem ist ungeeignet?
* FAT32
- exFAT
- NTFS
- Alle sind geeignet

? Was kann man mit einer erweiterten Partition direkt tun?
* Logische Laufwerke darin anlegen
- Sie mit NTFS formatieren
- Windows davon booten
- Ihr einen Laufwerksbuchstaben geben

? Eine Datei wird von D:\A nach D:\B (NTFS) verschoben. Was gilt?
* Der Vorgang ist sofort erledigt, die NTFS-Rechte bleiben erhalten
- Die Datei wird kopiert und gelöscht
- Die Datei erbt die Rechte von D:\B
- Die Datei verliert ihre Attribute

? Welches Schema ist für ein UEFI-Windows-11-Systemlaufwerk erforderlich?
* GPT
- MBR
- Erweiterte Partition
- FAT16

? Welche Registerkarte fehlt in den Ordnereigenschaften auf einem FAT32-Laufwerk?
* Sicherheit
- Allgemein
- Freigabe
- Anpassen

? Wie groß darf eine einzelne Datei auf FAT32 höchstens sein?
* 4 GiB minus 1 Byte
- 2 GiB
- 16 TiB
- unbegrenzt
! Deshalb exFAT oder NTFS für große Dateien.

? Welches Dateisystem unterstützt Berechtigungen, Verschlüsselung (EFS) und Kontingente unter Windows?
* NTFS
- FAT32
- exFAT
- FAT16
! FAT-Varianten kennen keine ACLs.

? Wie viele primäre Partitionen erlaubt ein MBR-Datenträger höchstens?
* 4 (bzw. 3 primäre + 1 erweiterte)
- 128
- 2
- 16
! GPT erlaubt unter Windows 128 Partitionen.
