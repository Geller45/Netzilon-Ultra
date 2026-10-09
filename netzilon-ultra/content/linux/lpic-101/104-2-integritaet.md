---
id: linux-101-104-2-integritaet
bereich: Linux
fach: Linux I
pruefungen: [LPIC-1]
block: LPIC-101
kapitel: LPIC-1 Prüfung 101 – Geräte, Dateisysteme, FHS
titel: 104.2 Die Integrität von Dateisystemen sicherstellen (fsck, df, du)
stufe: Fortgeschritten
quellen: [LPI-Learning-Material-101-500-de.pdf, 1.07_Linux_-_Datentraeger_Dateisysteme_und_Rechte.pdf]
verweise: [linux-l1-07-datentraeger, linux-101-104-1-partitionen-dateisysteme, linux-101-104-3-mounten]
---

## Profi

### Lernziel (Gewicht 2)
Dateisysteme prüfen, reparieren und Speicherplatz überwachen; Parameter anpassen.

### Belegung überwachen
- `df -h` (Dateisysteme, Belegung), `df -i` (**Inodes**), `df -hT` (Typ), `du -sh /pfad`, `du -h --max-depth=1`, `du -ah | sort -h`. df liest das Dateisystem, du summiert Dateigrößen. Voller Inode-Vorrat (viele kleine Dateien) ergibt „No space left on device“, obwohl Platz frei ist.
- `lsof +L1` – gelöschte, aber noch geöffnete Dateien belegen Platz.

### Prüfen und Reparieren
- **`fsck`** (Frontend) → `e2fsck` (ext), `xfs_repair` (XFS), `btrfs check`, `fsck.vfat`. **Nur bei nicht eingehängtem (oder read-only) Dateisystem!** Wichtige Optionen: `-n` (nur prüfen), `-y` (alles bestätigen), `-f` (erzwingen), `-p` (automatisch), `-a`. Reparierte Fragmente landen in `lost+found`.
- Konfiguration beim Boot: Spalte 6 der `/etc/fstab` (fsck-Reihenfolge: 1 für `/`, 2 für andere, 0 keine). Zwangsprüfung: Datei `/forcefsck` oder Kernelparameter `fsck.mode=force`.
- **`tune2fs`** (ext): `-l` Superblock anzeigen, `-L` Label, `-c n`/`-i` Prüfintervall, `-j` Journal hinzufügen (ext2→ext3), `-m 1` reservierte Blöcke. `dumpe2fs -h`, `debugfs`. XFS: `xfs_info`, `xfs_repair`, `xfs_admin`.

## Einfach

Ein Dateisystem ist wie eine **Bibliothek mit Karteikasten**: Der Kasten verrät, welches Buch wo steht. Wenn mitten im Eintragen der Strom ausfällt, passt der Kasten nicht mehr zu den Regalen. Dann prüft der **Bibliothekar `fsck`** alles durch und repariert die Karten. Wichtig: Er darf nur arbeiten, wenn **niemand** in der Bibliothek ist (Dateisystem nicht eingehängt), sonst macht er alles schlimmer.

Mit `-n` schaut er nur zu und ändert nichts (Probelauf), mit `-y` beantwortest du alle seine Rückfragen mit „ja“. Gefundene herrenlose Bücher stellt er in den Raum `lost+found`.

Zwei andere Werkzeuge sagen dir, **wie voll** die Bibliothek ist: **`df`** zeigt für jedes Regal, wie viel Platz frei ist (`df -h` in lesbaren Größen), und **`du`** zeigt, wie viel Platz ein bestimmter Ordner belegt (`du -sh ordner`). Man merkt sich: **df = disk free** (freier Platz auf Platten), **du = disk usage** (Verbrauch von Ordnern).

Und das Karteikarten-System (die **Inodes**) kann auch voll werden. Dann kommt trotz freiem Platz die Fehlermeldung „No space left“. Mit `df -i` siehst du das.

Mit `tune2fs` stellst du Eigenschaften eines ext-Dateisystems nachträglich um, z. B. den Namen (Label).

## Merksatz
- **fsck nur auf ungemountete Dateisysteme.**
- **df = freier Platz, du = Verbrauch von Ordnern.**
- **df -i = Inodes.**
- **fsck -n probiert, -y bestätigt alles.**
- **lost+found = gerettete Fragmente.**
- **tune2fs = ext-Parameter.**

## Prüfungsfalle
- `fsck` auf ein **gemountetes** Dateisystem kann es beschädigen.
- Bei XFS heißt das Reparaturwerkzeug `xfs_repair` (nicht `fsck.xfs`, das tut nichts).
- „Disk full“ kann an erschöpften **Inodes** liegen (`df -i`).
- `du -s` fasst zusammen, `df` zeigt Dateisysteme.
- `tune2fs -j` fügt ein Journal hinzu (ext2 → ext3).
- `fsck`-Reihenfolge steht in **Spalte 6** der fstab.

## Grafik

### fsck-Ablauf
1. Admin -> umount: umount /dev/sdb1
2. Admin -> fsck: fsck -f /dev/sdb1
3. fsck: prüft Superblock, Inodes, Verzeichnisse
4. fsck -> Admin: fragt bei Fehlern (oder -y)
5. fsck -> lost+found: verwaiste Dateien landen dort
6. Admin -> mount: mount /dev/sdb1 /mnt/daten

## Lab
**Maschine**: debian01 mit /dev/sdb1 (ext4).
```bash
# auf debian01
df -hT; df -i
du -sh /var/log; du -h --max-depth=1 /var | sort -h | tail
sudo umount /mnt/daten
sudo fsck -n /dev/sdb1
sudo e2fsck -f /dev/sdb1
sudo tune2fs -l /dev/sdb1 | head -15
sudo tune2fs -L archiv /dev/sdb1
```

## Befehle
- `df -h` – Platz in lesbaren Einheiten
- `df -i` – Inodes
- `du -sh ordner` – Ordnergröße
- `fsck -n gerät` – nur prüfen
- `e2fsck -f gerät` – ext erzwungen prüfen
- `xfs_repair gerät` – XFS reparieren
- `tune2fs -l gerät` – ext-Superblock
- `dumpe2fs -h gerät` – Superblock-Info

## Übungen
- A: Wie zeigst du die Größe von /var/log? | L: du -sh /var/log
- A: Wie prüfst du Inode-Nutzung? | L: df -i
- A: Wie prüfst du /dev/sdb1 ohne Änderungen? | L: fsck -n /dev/sdb1 (Gerät vorher aushängen)
- A: Womit repariert man XFS? | L: xfs_repair
- A: Wie ändert man das Label einer ext4? | L: tune2fs -L name /dev/sdb1 (oder e2label)

## Karteikarten
- F: Was zeigt df? | A: Belegung und freien Platz der eingehängten Dateisysteme.
- F: Was zeigt du? | A: Platzverbrauch von Dateien/Verzeichnissen.
- F: Was bedeutet fsck -y? | A: Alle Rückfragen automatisch mit ja beantworten.
- F: Was ist lost+found? | A: Verzeichnis für von fsck geborgene Dateifragmente.
- F: Was ist ein Inode? | A: Datenstruktur mit den Metadaten einer Datei (ohne Name).
- F: Welcher Befehl prüft ext2/3/4? | A: e2fsck (fsck.ext4).
- F: Welche fstab-Spalte steuert fsck? | A: Die sechste (Pass-Nummer).
- F: Was bewirkt tune2fs -j? | A: Fügt ein Journal hinzu.
- F: Wie zeigt man Dateisystemtypen in df? | A: df -T

## Quiz
? Was zeigt df -i?
* Inode-Nutzung
- Dateigröße
- Hardwareinfo
- Inhaltsverzeichnis

? Welches Werkzeug repariert XFS?
* xfs_repair
- e2fsck
- fsck.xfs -y
- mkfs.xfs

? Wann darf fsck laufen?
* Wenn das Dateisystem nicht eingehängt ist
- Nur im laufenden Betrieb
- Nur auf /proc
- Nur als normaler Benutzer

? Was gibt du -sh /var/log aus?
* Gesamtgröße des Verzeichnisses
- Freien Platz
- Zahl der Inodes
- Dateiliste

? Wohin kommen geborgene Dateifragmente?
* lost+found
- /tmp
- /var/lib
- /root

? Welche Option führt fsck nur als Prüfung aus?
* -n
- -y
- -f
- -p

? Welche Spalte der fstab steuert die fsck-Reihenfolge?
* 6
- 3
- 4
- 1

? Was bewirkt tune2fs -L name?
* Setzt das Label der ext-Partition
- Löscht das Journal
- Erzwingt fsck
- Mountet die Partition

## Spickzettel
- df -h -i -T · du -sh --max-depth
- fsck (e2fsck, xfs_repair) nur ungemountet · -n -y -f
- lost+found · fstab Spalte 6
- tune2fs -l -L -j -c · dumpe2fs
