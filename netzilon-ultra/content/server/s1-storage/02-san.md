---
id: server-san
bereich: AP1
pruefungen: [AP1, AP2, Schule]
fach: ITK / Grundlagen
block: S1
kapitel: Storage
titel: SAN – Storage Area Network (DAS, NAS, SAN, Protokolle)
stufe: Fortgeschritten
quellen: [SAN_Präsentation.pdf]
verweise: [server-iscsi, ap2-backup-speicher, server-raid-uebung, az801-s2d, ap1-a2-raid]
---

## Profi

### Definition
Ein **SAN** (*Storage Area Network*) ist ein **eigenes Hochgeschwindigkeitsnetz nur für Speicher**. Es ist strukturell aufgebaut wie ein LAN, läuft aber **parallel** dazu, damit der Speicherverkehr den normalen Netzwerkverkehr nicht ausbremst und umgekehrt. Über das SAN werden **Festplattensubsysteme (Storage-Arrays)** und **Tape Libraries** an **Server** angebunden. Die Server sehen die Speicherbereiche als **Blockgeräte (LUNs)**, also wie lokale Platten.

Eigenschaften laut Unterlagen:
- konzipiert für **serielle, kontinuierliche Übertragung großer Datenmengen**
- **mehrere redundante Wege** zwischen Server und Daten (Multipathing) → Schutz vor Ausfall und „Datenstau“
- hohe Datenraten (Unterlage: bis 1,6 GB/s; heute Fibre Channel 32/64 Gbit/s, NVMe-oF), **Glasfaseranbindung**
- **hoch skalierbar**, für **Mehrbenutzersysteme**, hohe **Desaster-Toleranz** (mit RAID), **größere Distanzen** als DAS

### DAS – NAS – SAN im Vergleich
| | **DAS** (*Direct Attached Storage*) | **NAS** (*Network Attached Storage*) | **SAN** (*Storage Area Network*) |
|---|---|---|---|
| Anbindung | direkt am Server (SATA, SAS, USB, NVMe) | normales LAN (Ethernet) | eigenes Speichernetz (FC, iSCSI, FCoE) |
| Zugriffsebene | **Block** | **Datei** (SMB/CIFS, NFS) | **Block** |
| Dateisystem liegt | im Server | **im NAS** | **im Server** |
| Teilen mehrerer Server | nein (nur Cluster-SAS) | ja, über Freigaben | ja (LUNs, Cluster) |
| Kosten/Aufwand | gering | mittel | hoch |
| typischer Einsatz | Einzelserver, Workstation | Dateiablage, Backup-Ziel, KMU | Datenbanken, Virtualisierung, Cluster |

**Merke:** NAS = **Dateien** übers LAN; SAN = **Blöcke** über ein eigenes Netz.

### SAN-Varianten (aus der Präsentation)
- **Virtual SAN (vSAN, SDS)**: **software-definierte** Speicherlösung, die auf dem **Hypervisor** läuft. Die lokalen Platten mehrerer Hosts werden zu einem gemeinsamen Speicherpool zusammengefasst. Einfach verwaltbar, skalierbar. Beispiele: VMware vSAN, **Windows Storage Spaces Direct (S2D)**.
- **Unified SAN (Unified Storage)**: im Prinzip ein erweitertes NAS – **Datei- und Blockspeicher auf einem Gerät** (SMB/NFS **und** iSCSI/FC).
- **Converged SAN**: nutzt die **herkömmliche Ethernet-Infrastruktur für Netzwerk- und SAN-Verkehr** gemeinsam → kostengünstiger, weniger komplex. Basis: **FCoE** (*Fibre Channel over Ethernet*) auf mindestens **10-Gbit-Ethernet** mit DCB (*Data Center Bridging*, verlustfreies Ethernet).

### Protokolle
| Protokoll | Transport | routingfähig | Bemerkung |
|---|---|---|---|
| **FC / FCP** (Fibre Channel Protocol) | Fibre Channel, eigenes Netz mit FC-Switches | über FC-Fabric | Standard für Rechenzentren, **5 Schichten (FC-0 bis FC-4)**, ähnlich TCP/IP-Schichtung; Adressierung über **WWN/WWPN**; Zugriffssteuerung über **Zoning** und **LUN-Masking** |
| **iSCSI** | SCSI über **TCP/IP** | **ja** | günstig, nutzt Ethernet; Initiator ↔ Target, Port 3260 |
| **FCoE** | FC-Rahmen direkt in Ethernet (Ethertype) | nein (Layer 2) | Converged Networks, braucht DCB |
| **AoE** (*ATA over Ethernet*) | ATA-Befehle direkt in Ethernet | **nein** | einfacher als iSCSI, ohne IP |
| **HyperSCSI** | SCSI direkt über Ethernet | **nein** | ohne TCP/IP, heute bedeutungslos (Legacy) |
| **NVMe-oF** | NVMe über FC, RDMA oder TCP | je nach Transport | moderne Ablösung für sehr niedrige Latenz |

### Sicherheit und Verwaltung im SAN
- **Zoning** (am FC-Switch): legt fest, welche Ports/WWPNs sich sehen dürfen.
- **LUN-Masking** (am Storage): legt fest, welcher Server welche LUN sieht. Bei iSCSI entspricht das den InitiatorIds des Targets.
- **Multipathing** (MPIO): zwei HBAs, zwei Fabrics → kein Single Point of Failure.
- **Snapshots, Replikation, Thin Provisioning, Deduplizierung** sind typische Array-Funktionen.

### Warum SAN – und warum nicht?
**Vorteile:** effiziente Speichernutzung (zentraler Pool statt verstreuter Einzelplatten), hohe Leistung, Ausfallsicherheit, Grundlage für Failover-Cluster und Live-Migration von VMs, zentrale Sicherung.
**Nachteile:** hohe Anschaffungs- und Betriebskosten (HBAs, FC-Switches, Know-how), Komplexität, Herstellerbindung.

## Einfach

Stell dir eine große **Schule** vor. Jedes Klassenzimmer (Server) braucht Platz für Bücher (Daten).

- **DAS** ist das **Bücherregal direkt im Klassenzimmer**. Schnell erreichbar, aber nur diese Klasse kann es benutzen. Ist das Regal voll, hast du Pech.
- **NAS** ist die **Schulbibliothek**. Jede Klasse kann hingehen und sich **ganze Bücher** (Dateien) ausleihen. Die Bibliothekarin (das NAS) sortiert die Bücher selbst. Alle laufen aber über denselben Schulflur (das normale LAN) – in der Pause wird es eng.
- **SAN** ist ein **riesiges Lagerhaus mit eigenem Tunnel**, der nur für Bücherlieferungen gebaut wurde. Jede Klasse bekommt im Lager ein **eigenes leeres Regalfach** (LUN), das sie selbst einräumt (Dateisystem im Server). Weil der Tunnel nur für Lieferungen da ist, gibt es keinen Stau mit den Schülern im Flur. Und es gibt **zwei Tunnel** – ist einer gesperrt, nimmt man den anderen.

**Die Sprachen im Tunnel** sind die Protokolle:
- **Fibre Channel** ist eine **Spezial-Rohrpost aus Glas** – sehr schnell, aber teuer.
- **iSCSI** packt die Bücherbestellungen in **normale Briefe** (TCP/IP) und schickt sie über das normale Postnetz – günstiger.
- **FCoE** steckt die Rohrpost-Kapseln in das **normale Netzwerkkabel**.

**Virtual SAN** ist, als würden alle Klassen ihre Regale zusammenschieben und eine **gemeinsame Software** verwaltet daraus ein großes Lager. **Unified Storage** ist eine Bibliothek, die sowohl **ganze Bücher** (Dateien) als auch **leere Regalfächer** (Blöcke) verleiht.

## Merksatz
- **NAS = Dateien, SAN = Blöcke.**
- **DAS direkt, NAS übers LAN, SAN eigenes Netz.**
- iSCSI = SCSI über **IP** (routbar), FCoE/AoE/HyperSCSI = direkt Ethernet (nicht routbar).
- **Zoning am Switch, Masking am Storage.**
- Converged = **ein Kabel für LAN und SAN** (FCoE, 10 GbE+).

## Prüfungsfalle
- Bei **NAS** liegt das Dateisystem **im NAS**, bei **SAN** im **Server** – häufige Verwechslung.
- **iSCSI ist routingfähig**, AoE und HyperSCSI **nicht**.
- „1,6 GB/s“ aus der Präsentation ist veraltet; heute Fibre Channel 32/64 Gbit/s, NVMe-oF.
- **RAID im SAN ersetzt kein Backup**, auch wenn die Präsentation von hoher „Desaster-Toleranz“ spricht – Backup an einem zweiten Ort bleibt Pflicht.
- Converged SAN braucht **verlustfreies Ethernet (DCB)**, nicht nur „irgendein“ 10-GbE-Netz.

## Grafik
### SAN mit zwei Fabrics
1. Server1 -> FC-Switch-A: Lesezugriff auf LUN 1 über HBA 1
2. FC-Switch-A -> Storage: Zoning erlaubt WWPN von Server1
3. Storage: LUN-Masking gibt LUN 1 nur für Server1 frei
4. FC-Switch-A: fällt aus
5. Server1 -> FC-Switch-B: MPIO wechselt auf HBA 2
6. FC-Switch-B -> Storage: Zugriff läuft ohne Unterbrechung weiter
### NAS gegen SAN
1. Client -> NAS: „Gib mir Datei bericht.docx“ (SMB)
2. NAS: sucht die Datei im eigenen Dateisystem
3. Server -> SAN: „Gib mir Block 4711 von LUN 3“ (iSCSI/FC)
4. Server: setzt die Blöcke im eigenen NTFS/ReFS zur Datei zusammen

## Übungen
- A: Was ist ein SAN? | L: Ein eigenes Hochgeschwindigkeitsnetz parallel zum LAN, über das Speichersysteme und Tape Libraries blockbasiert an Server angebunden werden, mit redundanten Wegen.
- A: Nennen Sie vier Vorteile eines SAN gegenüber DAS/NAS. | L: Effizientere Speichernutzung (zentraler Pool), hohe Datenraten, Glasfaseranbindung/große Distanzen, hohe Skalierbarkeit, mehrbenutzerfähig, hohe Ausfall-/Desaster-Toleranz mit RAID und Multipathing.
- A: Unterscheiden Sie Virtual, Unified und Converged SAN. | L: Virtual SAN: softwaredefiniert auf dem Hypervisor aus lokalen Platten. Unified: Datei- und Blockspeicher auf einem Gerät. Converged: LAN- und SAN-Verkehr über dieselbe Ethernet-Infrastruktur (FCoE, 10 GbE).
- A: Ordnen Sie AoE, iSCSI, HyperSCSI und FCP zu. | L: AoE: ATA direkt über Ethernet ohne IP. iSCSI: SCSI über TCP/IP mit Initiator und Target. HyperSCSI: SCSI über Ethernet ohne TCP/IP, nicht routbar. FCP: Standardprotokoll von Fibre Channel mit 5 Schichten.
- A: Ein KMU möchte nur eine zentrale Dateiablage für 20 Mitarbeiter. NAS oder SAN? | L: NAS – Dateizugriff über SMB genügt, günstig und einfach; SAN wäre überdimensioniert.
- A: Ein Hyper-V-Cluster mit drei Knoten braucht gemeinsamen Speicher. Lösung? | L: SAN (iSCSI oder FC) mit Cluster Shared Volumes oder alternativ Storage Spaces Direct (Virtual SAN).

## Karteikarten
- F: Wofür steht SAN? | A: Storage Area Network – eigenes Speichernetz für blockbasierten Zugriff
- F: Zugriffsebene bei NAS? | A: Dateiebene (SMB/NFS)
- F: Zugriffsebene bei SAN? | A: Blockebene (LUNs)
- F: Wo liegt das Dateisystem beim SAN? | A: Im Server, der die LUN nutzt
- F: Was ist ein Virtual SAN? | A: Softwaredefinierter Speicher auf dem Hypervisor aus lokalen Platten mehrerer Hosts (z. B. S2D, vSAN)
- F: Was ist ein Unified SAN? | A: Ein Gerät, das Datei- und Blockspeicher gemeinsam anbietet
- F: Was ist ein Converged SAN? | A: SAN- und LAN-Verkehr teilen sich die Ethernet-Infrastruktur (FCoE, ab 10 GbE)
- F: Was ist AoE? | A: ATA over Ethernet – ATA-Befehle direkt in Ethernet-Rahmen, ohne IP, nicht routbar
- F: Wie viele Schichten hat das Fibre Channel Protocol? | A: Fünf (FC-0 bis FC-4)
- F: Was ist Zoning? | A: Zugriffssteuerung am FC-Switch – welche Ports/WWPNs sich sehen
- F: Was ist LUN-Masking? | A: Zugriffssteuerung am Storage – welcher Server welche LUN sieht
- F: Ist iSCSI routingfähig? | A: Ja, weil es TCP/IP nutzt

## Quiz
? Welche Speicherart stellt Daten auf Dateiebene über das LAN bereit?
* NAS
- SAN
- DAS
- FCoE

? Was beschreibt ein Converged SAN?
* LAN- und SAN-Verkehr über dieselbe Ethernet-Infrastruktur
- Datei- und Blockspeicher auf einem Gerät
- Speicher aus lokalen Platten auf dem Hypervisor
- Ein SAN ausschließlich mit Tape Libraries

? Welches Protokoll ist routingfähig?
* iSCSI
- AoE
- HyperSCSI
- FCoE

? Welche Aussage zum SAN ist richtig?
* Server sehen die LUNs als Blockgeräte und formatieren sie selbst
- Das Dateisystem liegt im Storage-Array
- Es nutzt immer denselben Netzwerkverkehr wie die Clients
- Ein SAN ersetzt die Datensicherung

? Wo wird LUN-Masking konfiguriert?
* Auf dem Speichersystem
- Am Client-PC
- Am DNS-Server
- Im BIOS des Servers

? Welche Lösung ist ein Virtual SAN im Windows-Umfeld?
* Storage Spaces Direct
- DFS-Namespaces
- BranchCache
- Robocopy

? Was ist typisch für ein Unified Storage?
* SMB/NFS und iSCSI/FC auf einem Gerät
- Nur Tape-Laufwerke
- Kein Netzwerkzugriff
- Nur DAS-Anschlüsse

? Wozu dient Multipathing im SAN?
* Redundante Wege und Lastverteilung zwischen Server und Speicher
- Verschlüsselung der Daten
- Umwandlung von Blöcken in Dateien
- Vergrößerung von LUNs

## Lücken
- Beim {NAS} erfolgt der Zugriff auf Dateiebene, beim {SAN} auf Blockebene.
- Converged SAN nutzt {FCoE} auf mindestens {10} Gbit Ethernet.
- Am FC-Switch steuert man den Zugriff per {Zoning}, am Storage per {LUN-Masking}.

## Zuordnen
### Speicherart und Merkmal
- DAS => direkt am Server angeschlossen
- NAS => Dateifreigaben über das LAN
- SAN => eigenes Blockspeichernetz
- Virtual SAN => softwaredefiniert auf dem Hypervisor
- Unified SAN => Datei und Block auf einem Gerät

## Freitext
- F: Erläutern Sie den Unterschied zwischen NAS und SAN anhand der Zugriffsebene. | M: NAS stellt Dateien über Netzwerkprotokolle (SMB/NFS) bereit, das Dateisystem liegt im NAS; SAN stellt Blockgeräte (LUNs) bereit, das Dateisystem legt der Server an | P: 4
- F: Nennen Sie je zwei Vor- und Nachteile eines SAN. | M: Vorteile: hohe Leistung, Ausfallsicherheit/Multipathing, zentrale Verwaltung, Basis für Cluster. Nachteile: hohe Kosten, Komplexität, spezielles Know-how | P: 4

## Spickzettel
- DAS direkt, NAS Datei übers LAN, SAN Block im eigenen Netz
- Protokolle: FC/FCP (5 Schichten), iSCSI (TCP/IP, 3260), FCoE, AoE, HyperSCSI
- Routbar: nur iSCSI (und NVMe/TCP)
- Virtual = SDS, Unified = Datei+Block, Converged = ein Ethernet
- Zoning (Switch), LUN-Masking (Storage), MPIO (Server)
