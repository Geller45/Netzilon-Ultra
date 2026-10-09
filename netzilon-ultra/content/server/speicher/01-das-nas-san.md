---
id: server-speicher-das-nas-san
bereich: AP1
block: SP
kapitel: Speicher & SAN vertieft
titel: DAS, NAS und SAN – Block- gegen Dateispeicher, Protokolle und Entscheidungsmatrix
stufe: Einsteiger
fach: ITK / Grundlagen
pruefungen: [AP1, AP2, AZ-800, Schule]
quellen: [SAN_Präsentation.pdf, Microsoft Learn – iSCSI/MPIO/Storage Spaces, SNIA-Grundlagen]
verweise: [server-san, server-iscsi, ap1-a2-raid, ap1-a2-backup, az800-datentraeger, server-speicher-iscsi, server-speicher-fibre-channel, server-speicher-lun-zoning, server-speicher-funktionen]
---

## Profi

### Die drei Grundarchitekturen
Speicher kann auf drei grundsätzlich verschiedene Arten an Server angebunden werden. Entscheidend sind zwei Fragen: **Wo hängt der Speicher?** und **Auf welcher Ebene wird zugegriffen – Block oder Datei?**

| Merkmal | **DAS** (*Direct Attached Storage*) | **NAS** (*Network Attached Storage*) | **SAN** (*Storage Area Network*) |
|---|---|---|---|
| Anbindung | direkt am Server: SATA, SAS, NVMe (PCIe), USB, externes SAS-JBOD | über das vorhandene LAN (Ethernet, TCP/IP) | über ein eigenes Speichernetz (Fibre Channel oder dediziertes Ethernet) |
| Zugriffsebene | **Block** | **Datei** | **Block** |
| Dateisystem | im Server | **im NAS-Gerät** | im Server (bzw. Cluster-Dateisystem/CSV) |
| Protokolle | SCSI-Befehle über SATA/SAS, NVMe | **SMB** (Windows, früher CIFS), **NFS** (Unix/Linux), zusätzlich FTP, HTTP/S3 | **FC/FCP**, **iSCSI**, **FCoE**, **NVMe-oF** |
| gemeinsame Nutzung | nein (Ausnahme: Shared-SAS mit zwei Knoten) | ja, viele Clients gleichzeitig auf dieselben Dateien | ja, aber nur über Cluster-Mechanismen (sonst Datenkorruption) |
| Kosten / Komplexität | gering | mittel | hoch |
| typischer Einsatz | Einzelserver, Workstation, S2D-Knoten (lokale Platten) | Dateiablage, Home-Laufwerke, Backup-Ziel | Datenbanken, Virtualisierung, Failover-Cluster |

### Block- gegen Dateizugriff
- **Blockspeicher** (*block storage*): Der Server sieht eine „rohe“ Festplatte (**LUN**, *Logical Unit Number*). Er liest und schreibt nummerierte **Blöcke** (z. B. 512 Byte oder 4 KiB) über SCSI- bzw. NVMe-Befehle. Das **Dateisystem (NTFS, ReFS, ext4, VMFS)** legt der Server selbst an. Vorteil: geringe Latenz, beliebiges Dateisystem, ideal für Datenbanken und VM-Festplatten.
- **Dateispeicher** (*file storage*): Der Client fordert eine **Datei über ihren Pfad** an (`\\NAS01\Daten\bericht.docx`). Das NAS verwaltet Dateisystem, Sperren (*locking*) und Berechtigungen. Vorteil: mehrere Clients können gleichzeitig dieselben Dateien nutzen, einfache Verwaltung.
- **Objektspeicher** (*object storage*, z. B. S3, Azure Blob) ist eine dritte Form: Objekte mit ID und Metadaten über HTTP(S). Er gehört nicht zu DAS/NAS/SAN, taucht aber in Entscheidungen zunehmend auf.

### Protokolle im Überblick
| Protokoll | Ebene | Transport | Port / Kennung | routbar | Hinweis |
|---|---|---|---|---|---|
| **SMB 3.x** | Datei | TCP/IP | TCP 445 | ja | Windows-Freigaben; SMB Multichannel, SMB Direct (RDMA), Verschlüsselung |
| **NFS v3/v4.1** | Datei | TCP/IP | TCP/UDP 2049 | ja | Unix/Linux, VMware-Datastores; Windows: „Server für NFS“ |
| **FC / FCP** | Block | Fibre Channel | WWPN-Adressierung | über FC-Fabric | eigenes Netz, verlustfrei, sehr geringe Latenz |
| **iSCSI** | Block | TCP/IP | TCP 3260 | ja | SCSI in TCP; günstig, nutzt Ethernet |
| **FCoE** | Block | Ethernet (Layer 2) | Ethertype 0x8906 | nein | braucht verlustfreies Ethernet (DCB) |
| **NVMe-oF** | Block | FC, RDMA (RoCE, iWARP) oder TCP | NVMe/TCP: 4420 | je nach Transport | sehr geringe Latenz für Flash |

### Unified Storage und Converged
Viele moderne Arrays sind **Unified Storage**: Sie bieten **SMB/NFS (Datei)** und **iSCSI/FC (Block)** aus einem Gerät an. Ein **Converged Network** transportiert LAN- und SAN-Verkehr über dieselben Ethernet-Leitungen (FCoE oder iSCSI mit QoS). **Hyperkonvergent** (*HCI*, z. B. Storage Spaces Direct) bedeutet: Rechenleistung und Speicher stecken in denselben Servern, die lokalen Platten werden per Software zu einem gemeinsamen Pool.

### Entscheidungsmatrix
| Anforderung | Empfehlung | Begründung |
|---|---|---|
| ein einzelner Server braucht schnell mehr Platz | **DAS** | billig, schnell, keine Netzwerkabhängigkeit |
| 20 Mitarbeiter teilen Dokumente | **NAS** (SMB) | Dateizugriff mit Rechten, einfache Verwaltung |
| Backup-Ziel für Veeam/Windows Server-Sicherung | **NAS** oder DAS-Repository | günstige Kapazität; möglichst getrennt vom Produktivsystem |
| Hyper-V-Failover-Cluster mit 2–4 Hosts | **SAN** (iSCSI/FC) oder **S2D** | gemeinsamer Blockspeicher für CSV |
| Datenbank mit sehr vielen kleinen Zugriffen, niedrige Latenz | **SAN** (FC oder NVMe-oF) bzw. lokales NVMe | Blockzugriff, kurze Wege |
| kleines Budget, aber Cluster nötig | **iSCSI** über getrenntes 10/25-GbE-Netz | vorhandenes Ethernet-Know-how |
| Linux- und Windows-Clients teilen Dateien | NAS mit **SMB und NFS** | Multiprotokoll |

Bewertungskriterien in der Prüfung: **Kosten, Leistung (IOPS/Latenz), Skalierbarkeit, Verfügbarkeit (Redundanz), Verwaltungsaufwand, gemeinsame Nutzung, Know-how**.

Probier es im **Speicher-Labor unter Werkzeuge** aus: Dort kannst du DAS, NAS und SAN nebeneinander aufbauen und sehen, wie Block- und Dateianfragen laufen.

## Einfach

Stell dir vor, du hast ganz viele **Spielsachen** (Daten) und brauchst Platz dafür.

**DAS** ist die **Spielzeugkiste direkt neben deinem Bett**. Du greifst einfach hinein, das geht superschnell. Aber nur du kommst dran – dein Bruder im anderen Zimmer nicht.

**NAS** ist der **Spieleschrank im Flur**, den die ganze Familie benutzt. Du sagst: „Ich möchte das **Puzzle mit dem Pferd**“ – und der Schrank gibt dir **das ganze Puzzle**. Der Schrank weiß selbst, wo alles liegt, und passt auf, dass nicht zwei Kinder gleichzeitig dasselbe Puzzle umbauen. Das ist **Dateizugriff**: Man fragt nach einer ganzen Sache mit Namen.

**SAN** ist ein **großes Lagerhaus mit einer eigenen Rutsche** zu jedem Zimmer. Jedes Kind bekommt dort **ein eigenes leeres Fach** und entscheidet selbst, wie es darin sortiert. Du sagst nicht „gib mir das Pferdepuzzle“, sondern „gib mir **Kiste Nummer 4711**“. Das ist **Blockzugriff**: Du verwaltest die Ordnung selbst, das Lager liefert nur nummerierte Kisten. Weil die Rutsche nur für Kisten gebaut ist, gibt es keinen Stau mit anderen Kindern im Flur.

Die **Protokolle** sind die Sprachen, in denen bestellt wird:
- **SMB** und **NFS** sind die Sprachen für den Spieleschrank (Dateien).
- **Fibre Channel** ist eine eigene **Glasrohrpost** nur für Lagerkisten – schnell, aber teuer.
- **iSCSI** packt die Kistenbestellung in einen **normalen Brief** und schickt ihn über das normale Postnetz (Ethernet/IP).

Welche Lösung ist die beste? Das hängt davon ab, **wie viele Kinder** mitspielen, **wie schnell** es gehen muss und **wie viel Geld** da ist.

## Merksatz
- **DAS direkt – NAS Datei übers LAN – SAN Block im eigenen Netz.**
- **NAS kennt Dateinamen, SAN kennt nur Blocknummern.**
- Beim **NAS** liegt das Dateisystem **im NAS**, beim **SAN** **im Server**.
- **SMB 445, NFS 2049, iSCSI 3260** – drei Ports, die man kennen muss.
- Routbar sind iSCSI und NVMe/TCP, **nicht** FCoE.

## Prüfungsfalle
- „NAS ist ein schnelles SAN“ – falsch: Der Unterschied ist die **Zugriffsebene** (Datei gegen Block), nicht die Geschwindigkeit.
- Eine iSCSI-LUN ist **kein Netzlaufwerk**: Zwei Server ohne Cluster-Dateisystem dürfen dieselbe LUN **nicht gleichzeitig** einhängen, sonst wird NTFS zerstört.
- SMB-Freigaben sind **Dateispeicher** – auch wenn sie auf einem SAN-Array liegen (Unified Storage).
- **DAS** heißt nicht „nur USB-Platte“: Auch interne SAS-/NVMe-Platten und externe SAS-JBODs sind DAS.
- **FCoE** ist nicht routbar – es läuft direkt auf Ethernet (Layer 2).
- Bei der Begründung immer **Kriterien** nennen (Kosten, Leistung, gemeinsame Nutzung), nicht nur „SAN ist besser“.

## Grafik
### Dateizugriff gegen Blockzugriff
1. Client -> NAS01: SMB-Anfrage „öffne \\NAS01\Daten\bericht.docx“
2. NAS01: sucht die Datei im eigenen Dateisystem und prüft die Rechte
3. NAS01 -> Client: liefert den Dateiinhalt
4. HV01 -> ARRAY01: iSCSI-Anfrage „lies Block 4711 bis 4718 von LUN 3“
5. ARRAY01 -> HV01: liefert nur die rohen Blöcke
6. HV01: setzt die Blöcke im eigenen NTFS/ReFS zur Datei zusammen

### Drei Wege zum Speicher
1. FS01 -> SSD intern: DAS über NVMe, nur FS01 sieht die Platte
2. Clients -> NAS01: NAS über das normale LAN mit SMB/NFS
3. HV01 -> SAN-Switch: SAN über ein eigenes Speichernetz
4. SAN-Switch -> ARRAY01: Weiterleitung an das Array mit den LUNs

## Lab
**Maschinen**: **FS01.example.com** (Windows Server 2025, Dateiserver, simuliert das NAS), **HV01.example.com** (Hyper-V-Host, Blockzugriff), Client **CL01** (Windows 11). Schule: gleiche Namen mit `exa.local`.

### GUI
1. **FS01**: Server-Manager → Datei-/Speicherdienste → Freigaben → Aufgaben → **Neue Freigabe** → „SMB-Freigabe – Schnell“ → Ordner `D:\Daten` → Name `Daten`.
2. **CL01**: Explorer → `\\FS01\Daten` öffnen → Datei anlegen. Beobachte: Du arbeitest mit **Dateinamen** (Dateizugriff).
3. **HV01**: Datenträgerverwaltung (`diskmgmt.msc`) öffnen → eine Platte (lokal oder iSCSI) zeigt sich als **roher Datenträger**, den du selbst initialisieren und formatieren musst (Blockzugriff).
4. **FS01**: Ressourcenmonitor → Netzwerk → Verbindungen auf **Port 445** beobachten, während CL01 kopiert.
5. Vergleiche im **Speicher-Labor unter Werkzeuge** die Wege DAS/NAS/SAN als Animation.

### PowerShell
```powershell
# FS01: SMB-Freigabe anlegen (NAS-Rolle)
New-Item -Path D:\Daten -ItemType Directory
New-SmbShare -Name Daten -Path D:\Daten -FullAccess "EXAMPLE\Domänen-Admins" -ChangeAccess "EXAMPLE\Domänen-Benutzer"
Get-SmbShare -Name Daten

# CL01: Dateizugriff testen und Port pruefen
Test-NetConnection -ComputerName FS01.example.com -Port 445
Get-SmbConnection

# HV01: Blockgeraete anzeigen (BusType zeigt DAS/SAN-Anbindung)
Get-Disk | Format-Table Number, FriendlyName, BusType, PartitionStyle, Size
Get-PhysicalDisk | Format-Table FriendlyName, BusType, MediaType, CanPool
```

## Legende
### DAS
- Was: Speicher, der direkt an einem Server angeschlossen ist (Direct Attached Storage).
- Wie: über SATA, SAS, NVMe oder USB, Zugriff auf Blockebene.
- Wann: wenn nur ein Server den Speicher braucht oder bei hyperkonvergenten Knoten.
- Wo: im Servergehäuse oder in einem extern angeschlossenen JBOD.
- Warum: günstig, schnell und ohne Netzwerkabhängigkeit.
### NAS
- Was: Dateispeicher im Netzwerk (Network Attached Storage).
- Wie: über SMB oder NFS im normalen LAN; das Dateisystem liegt im NAS.
- Wann: für gemeinsame Dateiablagen, Home-Laufwerke und Backup-Ziele.
- Wo: als eigenes Gerät oder als Windows-Dateiserver wie FS01.
- Warum: viele Clients teilen sich einfach dieselben Dateien mit Berechtigungen.
### SAN
- Was: eigenes Speichernetz für Blockzugriff (Storage Area Network).
- Wie: über Fibre Channel, iSCSI, FCoE oder NVMe-oF; der Server formatiert die LUN selbst.
- Wann: für Virtualisierung, Cluster und Datenbanken.
- Wo: im Rechenzentrum mit Arrays wie ARRAY01 und eigenen Switches.
- Warum: hohe Leistung, Redundanz und zentraler gemeinsamer Blockspeicher.

## Karteikarten
- F: Wofür steht DAS? | A: Direct Attached Storage – direkt am Server angeschlossener Speicher mit Blockzugriff
- F: Wofür steht NAS? | A: Network Attached Storage – Dateispeicher im LAN über SMB oder NFS
- F: Wofür steht SAN? | A: Storage Area Network – eigenes Netz für blockbasierten Speicherzugriff
- F: Wo liegt das Dateisystem beim NAS? | A: Im NAS-Gerät selbst
- F: Wo liegt das Dateisystem beim SAN? | A: Im Server, der die LUN eingebunden hat
- F: Welche Dateiprotokolle nutzt ein NAS? | A: SMB (TCP 445) und NFS (Port 2049)
- F: Welche Blockprotokolle gibt es im SAN? | A: Fibre Channel (FCP), iSCSI, FCoE, NVMe-oF
- F: Welcher Port gehört zu iSCSI? | A: TCP 3260
- F: Was ist Unified Storage? | A: Ein Speichersystem, das Datei- (SMB/NFS) und Blockprotokolle (iSCSI/FC) gleichzeitig anbietet
- F: Was bedeutet hyperkonvergent? | A: Rechenleistung und Speicher stecken in denselben Servern; lokale Platten werden per Software zu einem Pool (z. B. S2D)
- F: Warum dürfen zwei normale Server nicht dieselbe LUN gleichzeitig nutzen? | A: Jeder hält das NTFS für seins und überschreibt Metadaten des anderen – Datenkorruption; nötig ist ein Cluster-Dateisystem (CSV)
- F: Nenne vier Kriterien für die Wahl zwischen DAS, NAS und SAN. | A: Kosten, Leistung (IOPS/Latenz), Skalierbarkeit, Verfügbarkeit, gemeinsame Nutzung, Verwaltungsaufwand

## Quiz
? Auf welcher Ebene greift ein Server auf ein SAN zu?
* Blockebene
- Dateiebene
- Objektebene
- Anwendungsebene
! Ein SAN liefert rohe Blöcke (LUNs); das Dateisystem legt der Server selbst an.

? Welches Protokoll ist ein typisches NAS-Protokoll?
* SMB
- Fibre Channel Protocol
- iSCSI
- FCoE
! SMB (und NFS) arbeiten auf Dateiebene und sind deshalb NAS-Protokolle.

? Wo liegt beim NAS das Dateisystem?
* Im NAS-Gerät
- Im zugreifenden Client
- Im Fibre-Channel-Switch
- Im RAID-Controller des Clients
! Das NAS verwaltet Dateisystem, Sperren und Berechtigungen selbst.

? Über welchen Port erreicht ein Initiator standardmäßig das iSCSI-Portal eines SAN?
* TCP 3260
- TCP 445
- TCP 2049
- UDP 3260
! iSCSI nutzt TCP-Port 3260; 445 ist SMB, 2049 ist NFS.

? Welches Blockprotokoll ist NICHT über IP routbar?
* FCoE
- iSCSI
- NVMe/TCP
- iSCSI mit Jumbo Frames
! FCoE kapselt FC-Rahmen direkt in Ethernet (Layer 2) und hat keinen IP-Kopf.

? Ein KMU mit 15 Mitarbeitenden möchte eine gemeinsame Dokumentenablage. Was ist sinnvoll?
* NAS mit SMB-Freigaben
- Fibre-Channel-SAN mit zwei Fabrics
- DAS am Arbeitsplatz-PC der Chefin
- FCoE mit DCB-Switches
! Für reine Dateiablage genügt ein NAS – günstig und einfach; ein SAN wäre überdimensioniert.

? Was beschreibt Unified Storage?
* Ein System bietet Datei- und Blockzugriff gleichzeitig
- LAN und SAN laufen über dieselben Kabel
- Alle Platten sind gleich groß
- Speicher wird ausschließlich in der Cloud betrieben
! Unified = SMB/NFS und iSCSI/FC aus einem Gerät. „Gleiche Kabel“ wäre Converged.

? Welche Speicherart ist eine interne NVMe-SSD im Server?
* DAS
- NAS
- SAN
- Objektspeicher
! Direkt am PCIe-Bus des Servers angeschlossen – also Direct Attached Storage.

? Zwei eigenständige Server (kein Cluster) binden dieselbe iSCSI-LUN ein und formatieren sie mit NTFS. Was passiert?
* Es droht Datenkorruption, weil beide unabhängig schreiben
- Windows teilt die LUN automatisch wie eine Freigabe
- Das Array sperrt die LUN für den zweiten Server automatisch
- Beide Server sehen nur ihre eigenen Dateien
! NTFS ist kein Cluster-Dateisystem. Für gemeinsame Nutzung braucht man ein Failover-Cluster mit CSV.

? Welche Aussage zu NFS ist richtig?
* NFS ist ein Dateiprotokoll, verbreitet bei Unix/Linux und VMware
- NFS ist ein Blockprotokoll, das SCSI-Befehle über Fibre Channel transportiert
- NFS benötigt zwingend FCoE und Data Center Bridging
- NFS arbeitet direkt auf Ethernet ohne TCP/IP-Stack
! NFS (Network File System) stellt Dateien über TCP/IP bereit, typischer Port 2049.

? Was ist der wichtigste Vorteil von Blockspeicher gegenüber Dateispeicher?
* Der Server wählt sein Dateisystem selbst und erreicht geringe Latenz
- Viele Clients können ohne Cluster gleichzeitig auf dasselbe Volume schreiben
- Er benötigt weder Netzwerkkarte noch HBA im Server
- Berechtigungen auf Dateien werden automatisch vom Speichersystem verwaltet
! Blockspeicher eignet sich für Datenbanken und VM-Festplatten, weil der Server direkt mit Blöcken arbeitet.

? Was bedeutet hyperkonvergente Infrastruktur?
* Rechenleistung und Speicher in denselben Knoten, per Software gebündelt
- Jeder Server erhält ein eigenes NAS, das nur er selbst nutzt
- Speicher wird ausschließlich über Fibre Channel an die Hosts angebunden
- Backup und Produktivdaten liegen im selben Ordner auf demselben Volume
! Beispiel: Storage Spaces Direct bündelt lokale Platten mehrerer Hyper-V-Hosts zu einem Pool.

? Welches Kriterium spricht am stärksten für ein SAN statt eines NAS?
* Gemeinsamer Blockspeicher für einen Hyper-V-Failover-Cluster
- Möglichst geringe Anschaffungs- und Betriebskosten
- Einfache SMB-Dateifreigaben für die Mitarbeitenden
- Zugriff von Linux-Clients auf Textdateien per NFS
! Cluster brauchen gemeinsame Blockgeräte (CSV); Dateiablage löst ein NAS günstiger.

## Lücken
- Beim {NAS} erfolgt der Zugriff auf Dateiebene, beim {SAN} auf Blockebene.
- SMB nutzt TCP-Port {445}, iSCSI nutzt TCP-Port {3260}.
- Eine logische Platte im SAN heißt {LUN|Logical Unit Number}.

## Zuordnen
### Protokoll und Zugriffsebene
- SMB => Dateizugriff im Windows-Umfeld
- NFS => Dateizugriff im Unix-Umfeld
- iSCSI => Blockzugriff über TCP/IP
- FCoE => Blockzugriff direkt über Ethernet
- FCP => Blockzugriff über Fibre Channel

## Reihenfolge
### Blockzugriff einer Datei über das SAN
1. Anwendung auf HV01 öffnet eine Datei
2. Dateisystem auf HV01 ermittelt die zugehörigen Blocknummern
3. Initiator sendet SCSI-Lesebefehl an das Array
4. ARRAY01 liest die Blöcke aus der LUN
5. Blöcke werden an HV01 zurückgeschickt
6. Dateisystem setzt die Blöcke zur Datei zusammen

## Freitext
- F: Erläutern Sie den Unterschied zwischen Block- und Dateizugriff und ordnen Sie DAS, NAS und SAN zu. | M: Blockzugriff: Der Server liest/schreibt nummerierte Blöcke einer rohen Platte und verwaltet das Dateisystem selbst (DAS, SAN). Dateizugriff: Der Client fordert Dateien per Pfad an, das Speichergerät verwaltet Dateisystem und Rechte (NAS mit SMB/NFS). | P: 6

## Szenario
### Speicher für die Kanzlei Berger
Eine Steuerkanzlei mit 25 Arbeitsplätzen betreibt bisher einen Server FS01 mit internen Platten. Geplant sind zusätzlich zwei Hyper-V-Hosts HV01 und HV02 als Failover-Cluster sowie eine zentrale Dokumentenablage. Das Budget ist begrenzt, Ethernet-Know-how ist vorhanden, Fibre-Channel-Erfahrung nicht.
- F: Welche Speicherart empfehlen Sie für die Dokumentenablage? | A: NAS bzw. Dateiserver mit SMB-Freigaben – Dateizugriff mit NTFS-Rechten, günstig und einfach | P: 2
- F: Welche Lösung eignet sich für den gemeinsamen Speicher des Clusters? | A: iSCSI-SAN über ein getrenntes Speichernetz (oder Storage Spaces Direct), weil ein Cluster gemeinsamen Blockspeicher braucht und Ethernet-Know-how vorhanden ist | P: 3
- F: Warum ist Fibre Channel hier eher ungeeignet? | A: Hohe Kosten für HBAs und FC-Switches, fehlendes Know-how, Leistungsbedarf einer Kanzlei rechtfertigt den Aufwand nicht | P: 2
- F: Welche Gefahr besteht, wenn HV01 und HV02 eine LUN ohne Cluster einbinden? | A: Beide schreiben unabhängig ins NTFS – Datenkorruption; Lösung: Failover-Cluster mit Cluster Shared Volume | P: 2
