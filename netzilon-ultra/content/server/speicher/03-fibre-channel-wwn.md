---
id: server-speicher-fibre-channel
bereich: AP2
block: SP
kapitel: Speicher & SAN vertieft
titel: Fibre Channel – Schichten FC-0 bis FC-4, WWNN/WWPN, HBA, Fabric, Topologien und FCoE
stufe: Fortgeschritten
fach: ITK / Grundlagen
pruefungen: [AP2, AZ-800, Schule]
quellen: [SAN_Präsentation.pdf, Microsoft Learn – iSCSI/MPIO/Storage Spaces, SNIA-Grundlagen]
verweise: [server-san, server-speicher-das-nas-san, server-speicher-lun-zoning, server-speicher-mpio, server-speicher-iscsi]
---

## Profi

### Was ist Fibre Channel?
**Fibre Channel (FC)** ist eine Netzwerktechnik, die speziell für **Speicherverkehr** entwickelt wurde. Sie ist **verlustfrei** (*lossless*): Ein Sender schickt nur, wenn der Empfänger freien Puffer gemeldet hat (**Buffer-to-Buffer-Credits**). Darum gibt es – anders als bei Ethernet – praktisch keine verworfenen Rahmen und keine Neuübertragungen. Übliche Geschwindigkeiten heute: **16, 32 und 64 GFC** (Gigabit Fibre Channel), 128 GFC ist spezifiziert. Trotz des Namens („Fibre“) gibt es auch Kupfervarianten; im Rechenzentrum dominiert **Glasfaser** (Multimode OM3/OM4 im Rack, Singlemode für größere Distanzen).

Das Protokoll, mit dem SCSI über FC läuft, heißt **FCP** (*Fibre Channel Protocol*). Neuere Systeme nutzen zusätzlich **FC-NVMe** (NVMe over Fibre Channel).

### Die fünf Schichten
| Schicht | Name | Aufgabe | Beispiel |
|---|---|---|---|
| **FC-0** | Physical | Medium, Stecker, Signale, Geschwindigkeit | Glasfaser OM4, LC-Stecker, SFP+-Module |
| **FC-1** | Encode/Decode | Leitungscodierung, Fehlererkennung auf Bit-Ebene | 8b/10b (bis 8 GFC), 64b/66b bzw. 256b/257b (ab 16/32 GFC) |
| **FC-2** | Framing & Flow Control | Rahmenaufbau, Sequenzen, Flusskontrolle, Dienstklassen | FC-Rahmen bis 2148 Byte, Buffer-to-Buffer-Credits |
| **FC-3** | Common Services | gemeinsame Dienste mehrerer Ports | Striping, Hunt Groups, Multicast (kaum genutzt) |
| **FC-4** | Protocol Mapping | Abbildung höherer Protokolle auf FC | **FCP (SCSI)**, FC-NVMe, früher IP over FC |

Eselsbrücke von unten nach oben: **„Physik, Code, Rahmen, Dienste, Protokoll“**. FC-0 bis FC-2 bilden zusammen den Transport (oft als **FC-PH** bezeichnet).

### Adressierung: WWN, WWNN, WWPN, FC_ID
- **WWN** (*World Wide Name*): weltweit eindeutige **64-Bit-Kennung** (8 Byte), geschrieben als 16 Hex-Ziffern, z. B. `20:00:00:25:b5:aa:00:01`. Vergleichbar mit einer MAC-Adresse, wird vom Hersteller vergeben.
- **WWNN** (*World Wide Node Name*): Name des **ganzen Geräts** (z. B. der HBA-Karte oder des Array-Controllers).
- **WWPN** (*World Wide Port Name*): Name **eines einzelnen Ports**. Eine Dual-Port-HBA hat **einen WWNN, aber zwei WWPNs**. **Zoning und LUN-Masking arbeiten mit WWPNs.**
- **FC_ID** (*Port-ID*): 24-Bit-Adresse (Domain, Area, Port), die der Switch beim **Fabric-Login (FLOGI)** vergibt – vergleichbar mit einer IP-Adresse, die dynamisch zugeteilt wird. 2^24 ergibt rund 16 Millionen Adressen.
- Anmeldevorgänge: **FLOGI** (Port meldet sich an der Fabric an), **PLOGI** (Port meldet sich am Zielport an), **PRLI** (Prozess-Login, z. B. für FCP).

### HBA
Ein **HBA** (*Host Bus Adapter*) ist die FC-Steckkarte im Server (PCIe), vergleichbar mit einer Netzwerkkarte. Er erledigt FC-Protokoll und SCSI-Verarbeitung in Hardware und entlastet die CPU. Für Redundanz bekommt jeder Server **zwei HBA-Ports** (besser zwei Karten), je einer pro **Fabric**. Unter Windows zeigt `Get-InitiatorPort` die WWNN (NodeAddress) und WWPN (PortAddress) an. Eine **CNA** (*Converged Network Adapter*) kann Ethernet und FCoE gleichzeitig.

### Port-Typen
| Port | Steht für | Wo |
|---|---|---|
| **N_Port** | Node Port | Endgerät: HBA oder Array-Port |
| **F_Port** | Fabric Port | Switch-Port, an dem ein N_Port hängt |
| **E_Port** | Expansion Port | Verbindung Switch ↔ Switch (**ISL**, *Inter-Switch Link*) |
| **NL_/FL_Port** | Loop Port | in einer Arbitrated Loop (Legacy) |

### Topologien
1. **Point-to-Point** (FC-P2P): zwei Geräte direkt verbunden (Server-HBA ↔ Array). Einfach, aber nicht skalierbar.
2. **Arbitrated Loop** (FC-AL): bis zu **127 Ports** im Ring (126 Geräte + 1 Fabric-Port), die sich die Bandbreite **teilen**; ein Gerät muss die Schleife „erkämpfen“ (*arbitrate*). Heute **Legacy**.
3. **Switched Fabric** (FC-SW): Geräte hängen an **FC-Switches**; jede Verbindung hat die volle Bandbreite, bis zu ~16 Mio. Adressen. Standard im Rechenzentrum. Best Practice: **zwei völlig getrennte Fabrics (A und B)** – ein Fehler in Fabric A (Konfiguration, Firmware) betrifft Fabric B nicht.

Die Fabric stellt zentrale Dienste bereit, u. a. den **Name Server** (Verzeichnis aller angemeldeten WWPNs) und das **Zoning**.

### FCoE und DCB
**FCoE** (*Fibre Channel over Ethernet*) packt komplette FC-Rahmen in **Ethernet-Rahmen** (Ethertype **0x8906**, Steuerprotokoll FIP 0x8914). Es gibt **keinen IP-Kopf** – FCoE ist **nicht routbar** und bleibt im Layer-2-Netz. Weil FC verlustfrei arbeiten muss, braucht das Ethernet **DCB** (*Data Center Bridging*):
- **PFC** (*Priority-based Flow Control*, IEEE 802.1Qbb): pausiert gezielt nur die FCoE-Priorität statt des ganzen Links.
- **ETS** (*Enhanced Transmission Selection*, 802.1Qaz): reserviert Bandbreite pro Verkehrsklasse.
- **DCBX**: handelt die DCB-Einstellungen zwischen Switch und Adapter aus.
Außerdem nötig: mindestens **10 GbE**, „Baby-Jumbo-Frames“ (≥ 2500 Byte, weil ein FC-Rahmen bis 2148 Byte groß ist), CNAs und FCoE-fähige Switches (FCF, *FCoE Forwarder*).

Probier es im **Speicher-Labor unter Werkzeuge** aus: Dort siehst du FLOGI, Name-Server-Abfrage und Zoning in einer Fabric mit zwei Switches als Animation.

## Einfach

**Fibre Channel** ist wie eine **eigene Rohrpost aus Glas**, die nur für Speicherkisten gebaut wurde. Normale Post (Ethernet) verliert manchmal Briefe und schickt sie dann nochmal. Die Rohrpost macht das anders: Sie schickt eine Kapsel **nur, wenn am Ziel ein freier Platz** gemeldet wurde. So geht nie etwas verloren.

Jede Rohrpoststation hat einen **Namen wie einen Ausweis**:
- Der **WWNN** ist der Name des **ganzen Hauses** (der Karte).
- Der **WWPN** ist der Name **jeder einzelnen Tür** (jeder Anschluss). Ein Haus mit zwei Türen hat einen Hausnamen und zwei Türnamen.

Wenn eine Tür neu angeschlossen wird, meldet sie sich beim **Postamt** (dem **Switch**) an und bekommt eine **Hausnummer** (FC_ID). Das Postamt führt ein **Telefonbuch** (den Name Server), in dem alle Türen stehen.

Die Rohrpost hat **fünf Stockwerke** (FC-0 bis FC-4): Ganz unten liegen die **Glasröhren**, darüber wird die Nachricht **verschlüsselt in Lichtsignale**, dann in **Kapseln gepackt**, darüber gibt es **Sonderdienste**, und ganz oben steht die eigentliche **Bestellung** („gib mir Block 4711“).

Man kann die Rohrpost auf drei Arten verlegen: **direkt** von einem Haus zum anderen, als **Kreis**, in dem alle warten müssen, bis sie dran sind (alt), oder mit **Verteilerstationen** (Switches), über die jeder gleichzeitig senden kann – das ist heute normal.

**FCoE** ist, als würde man die Glaskapseln in **normale Pakete** stecken und mit dem normalen Paketdienst schicken – der muss dann aber versprechen, **nie etwas zu verlieren** (DCB).

## Merksatz
- **FC-0 bis FC-4: Physik, Code, Rahmen, Dienste, Protokoll.**
- **WWNN = Karte, WWPN = Port – gezont wird mit WWPN.**
- **WWN = 64 Bit = 16 Hex-Ziffern.**
- **FLOGI an der Fabric, PLOGI am Ziel.**
- **Zwei Fabrics, zwei HBA-Ports, kein Single Point of Failure.**
- **FCoE braucht DCB und ist nicht routbar.**

## Prüfungsfalle
- **WWNN und WWPN** werden verwechselt – beim Zoning und Masking zählt der **WWPN** des Ports.
- FC-4 ist **nicht** die physikalische Schicht – die Zählung beginnt unten bei **FC-0**.
- „Fibre Channel funktioniert nur über Glasfaser“ – falsch, es gibt auch Kupfer, Glasfaser ist aber üblich.
- Arbitrated Loop teilt sich die Bandbreite und gilt als **Legacy**; Standard ist **Switched Fabric**.
- FCoE ist **kein iSCSI** – es nutzt kein TCP/IP und ist nicht routbar.
- Zwei Switches, die per ISL verbunden sind, bilden **eine** Fabric – für echte Redundanz braucht man zwei **getrennte** Fabrics.
- Ein HBA-Tausch ändert den WWPN – Zoning und Masking müssen angepasst werden.

## Grafik
### Fabric-Login und Zugriff
1. HV01-HBA1 -> FCSW-A: FLOGI mit WWPN 10:00:00:90:fa:12:34:56
2. FCSW-A -> HV01-HBA1: vergibt FC_ID 0x010100
3. HV01-HBA1 -> FCSW-A: Name-Server-Abfrage „welche Targets sehe ich?“
4. FCSW-A: Zoning erlaubt nur ARRAY01-CTRL-A
5. HV01-HBA1 -> ARRAY01: PLOGI und PRLI für FCP
6. HV01-HBA1 -> ARRAY01: SCSI-Lesebefehl an LUN 0

### Drei Topologien
1. HV01 -> ARRAY01: Point-to-Point, direkte Leitung ohne Switch
2. Ring: Arbitrated Loop – alle teilen sich die Bandbreite (Legacy)
3. HV01 -> FCSW-A: Switched Fabric, volle Bandbreite je Port
4. FCSW-A -> ARRAY01: Switch leitet Rahmen zum Array weiter

## Lab
**Maschinen**: **HV01.example.com** und **HV02.example.com** (Windows Server 2025 mit Dual-Port-FC-HBA), FC-Switches **FCSW-A** und **FCSW-B** (zwei getrennte Fabrics), SAN-Array **ARRAY01** (Controller A und B, je ein Port pro Fabric). Schule: virtuelle Variante mit Hyper-V **Virtual Fibre Channel** auf geeigneter Hardware oder nur die Abfragen.

### GUI
1. **HV01**: Geräte-Manager → Speichercontroller → FC-HBA → Eigenschaften → Details bzw. Hersteller-Tool → **WWNN und beide WWPNs** notieren.
2. **HV01**: Server-Manager → Datei-/Speicherdienste → Volumes → Datenträger: neue FC-LUN erscheint als Datenträger mit Bustyp **Fibre Channel**.
3. **FCSW-A**: Web-Oberfläche des Switches → Name Server / Fabric-Ansicht → prüfen, ob der WWPN von HV01-Port 1 angemeldet ist (FLOGI erfolgreich).
4. **FCSW-B**: dasselbe für HV01-Port 2 – jeder Port hängt in **genau einer** Fabric.
5. **ARRAY01**: Verwaltungsoberfläche → Hosts → Host HV01 mit beiden WWPNs anlegen (Vorbereitung für LUN-Masking).
6. Probier die Abläufe zusätzlich im **Speicher-Labor unter Werkzeuge** aus.

### PowerShell
```powershell
# HV01: FC-Initiatorports mit WWNN (NodeAddress) und WWPN (PortAddress)
Get-InitiatorPort | Where-Object ConnectionType -eq "Fibre Channel" |
  Format-Table InstanceName, NodeAddress, PortAddress, ConnectionType

# HV01: FC-LUNs anzeigen
Get-Disk | Where-Object BusType -eq "Fibre Channel" |
  Format-Table Number, FriendlyName, Size, OperationalStatus

# HV01: Hyper-V Virtual Fibre Channel (nur mit NPIV-faehigem HBA und Switch)
Get-VMSan
$hba = Get-InitiatorPort | Where-Object PortAddress -eq "10000090fa123456"   # Port 1 in Fabric A
New-VMSan -Name FabricA -HostBusAdapter $hba
Add-VMFibreChannelHba -VMName SQL01 -SanName FabricA
```

## Legende
### WWPN
- Was: World Wide Port Name, 64-Bit-Kennung eines einzelnen FC-Ports.
- Wie: vom Hersteller vergeben, angezeigt mit Get-InitiatorPort als PortAddress.
- Wo: auf jedem HBA-Port und jedem Array-Port.
- Wann: beim Zoning auf dem Switch und beim LUN-Masking auf dem Array.
- Warum: eindeutige Identifikation, damit nur berechtigte Ports zugreifen.
### Switched Fabric
- Was: FC-Topologie mit Switches, die alle Ports verbinden.
- Wie: Ports melden sich per FLOGI an, der Switch vergibt FC_IDs und führt den Name Server.
- Wo: im Rechenzentrum mit zwei getrennten Fabrics A und B.
- Wann: Standard für alle SANs mit mehr als zwei Geräten.
- Warum: volle Bandbreite je Port, Skalierbarkeit und Redundanz.
### FCoE
- Was: Fibre Channel over Ethernet – FC-Rahmen in Ethernet-Rahmen.
- Wie: mit CNAs, FCoE-Switches und DCB (PFC, ETS, DCBX), Ethertype 0x8906.
- Wann: in Converged Networks, um LAN und SAN auf einem Kabel zu führen.
- Warum: weniger Kabel und Adapter; nicht routbar, daher nur im Rechenzentrum.

## Karteikarten
- F: Wofür steht FCP? | A: Fibre Channel Protocol – Abbildung von SCSI auf Fibre Channel (FC-4)
- F: Nenne die fünf FC-Schichten von unten nach oben. | A: FC-0 Physical, FC-1 Encode/Decode, FC-2 Framing/Flow Control, FC-3 Common Services, FC-4 Protocol Mapping
- F: Welche Schicht regelt die Flusskontrolle mit Buffer-to-Buffer-Credits? | A: FC-2
- F: Wie lang ist ein WWN? | A: 64 Bit (8 Byte), geschrieben als 16 Hex-Ziffern
- F: Unterschied WWNN und WWPN? | A: WWNN benennt das ganze Gerät (Karte), WWPN einen einzelnen Port
- F: Was ist ein HBA? | A: Host Bus Adapter – FC-Steckkarte im Server, die FC und SCSI in Hardware verarbeitet
- F: Was ist FLOGI? | A: Fabric Login – ein N_Port meldet sich am Switch an und erhält eine 24-Bit-FC_ID
- F: Was ist ein E_Port? | A: Expansion Port – verbindet zwei FC-Switches per Inter-Switch Link (ISL)
- F: Wie viele Ports kann eine Arbitrated Loop haben? | A: Bis zu 127 (126 Geräte plus 1 Fabric-Port), Bandbreite wird geteilt
- F: Welche DCB-Funktionen braucht FCoE? | A: PFC (802.1Qbb), ETS (802.1Qaz) und DCBX
- F: Ist FCoE routbar? | A: Nein, es läuft direkt auf Ethernet ohne IP-Kopf
- F: Mit welchem Cmdlet sieht man unter Windows die WWPNs? | A: Get-InitiatorPort (PortAddress = WWPN, NodeAddress = WWNN)

## Quiz
? Welche FC-Schicht beschreibt Kabel, Stecker und Signale?
* FC-0
- FC-2
- FC-3
- FC-4
! FC-0 ist die physikalische Schicht; FC-4 ist das Protocol Mapping.

? Auf welcher Schicht wird SCSI auf Fibre Channel abgebildet (FCP)?
* FC-4
- FC-1
- FC-2
- FC-0
! FC-4 (Protocol Mapping) bildet SCSI (FCP) oder NVMe auf FC ab.

? Wie viele Bit hat ein World Wide Name?
* 64 Bit
- 48 Bit
- 24 Bit
- 128 Bit
! WWNs sind 64 Bit lang; 24 Bit hat die dynamische FC_ID, 48 Bit eine MAC-Adresse.

? Eine Dual-Port-HBA besitzt …
* einen WWNN und zwei WWPNs
- zwei WWNNs und einen WWPN
- nur einen WWPN
- keinen WWN, nur eine IP-Adresse
! Der WWNN benennt die Karte, jeder Port hat seinen eigenen WWPN.

? Welche Kennung wird beim Zoning üblicherweise verwendet?
* WWPN
- WWNN
- MAC-Adresse
- IQN
! Zoning und LUN-Masking beziehen sich auf die Port-Namen (WWPN).

? Welche Topologie ist heute Standard im Rechenzentrum?
* Switched Fabric
- Arbitrated Loop
- Token Ring
- Point-to-Point mit Hubs
! Switched Fabric bietet volle Bandbreite je Port und ist skalierbar; FC-AL ist Legacy.

? Was kennzeichnet eine Arbitrated Loop?
* Bis zu 127 Ports teilen sich die Bandbreite im Ring
- Jeder Port hat dedizierte Bandbreite über Switches
- Sie verbindet genau zwei Geräte direkt
- Sie läuft nur über Ethernet
! Bei FC-AL müssen Geräte die Schleife „erkämpfen“, daher geteilte Bandbreite.

? Wie heißt der Switch-Port, an dem ein Server-HBA angeschlossen ist?
* F_Port
- E_Port
- N_Port
- NL_Port
! Der HBA ist ein N_Port, der Gegenpart am Switch ist der F_Port; E_Ports verbinden Switches.

? Was passiert beim FLOGI?
* Der Port meldet sich an der Fabric an und erhält eine FC_ID
- Der Server formatiert die LUN
- Der Switch vergibt einen neuen WWPN
- Das Array spiegelt die LUN auf ein zweites Array
! FLOGI = Fabric Login; die FC_ID (24 Bit) ist die dynamische Adresse in der Fabric.

? Warum braucht FCoE Data Center Bridging?
* Weil Fibre Channel verlustfreien Transport erwartet
- Weil FCoE sonst nicht routbar wäre
- Weil DCB die WWPNs vergibt
- Weil FCoE nur über WLAN läuft
! PFC sorgt dafür, dass FCoE-Rahmen nicht verworfen werden.

? Welche Aussage zu FCoE ist richtig?
* FCoE kapselt FC-Rahmen direkt in Ethernet und ist nicht routbar
- FCoE verpackt SCSI in TCP-Pakete wie iSCSI
- FCoE benötigt zwingend Kupferkabel mit 1 GbE
- FCoE ersetzt das Zoning
! FCoE nutzt Ethertype 0x8906 ohne IP-Kopf; Zoning bleibt nötig.

? Wie wird ein FC-SAN üblicherweise redundant aufgebaut?
* Zwei getrennte Fabrics, jeder Server mit je einem HBA-Port pro Fabric
- Ein großer Switch mit zwei Netzteilen
- Zwei Switches per ISL zu einer Fabric verbunden, ein HBA-Port pro Server
- Arbitrated Loop mit Hot-Spare-Kabel
! Zwei unabhängige Fabrics plus MPIO vermeiden jeden Single Point of Failure.

? Welche Aufgabe hat der Name Server in einer FC-Fabric?
* Er führt ein Verzeichnis aller angemeldeten Ports und beantwortet Abfragen
- Er löst DNS-Namen in IP-Adressen auf
- Er verschlüsselt den FC-Verkehr
- Er berechnet die RAID-Parität
! Nach dem FLOGI fragen Initiatoren den Name Server, welche Targets sie (laut Zoning) sehen.

## Lücken
- Die physikalische FC-Schicht heißt {FC-0}, das Protocol Mapping heißt {FC-4}.
- Ein WWN ist {64} Bit lang; beim Zoning nutzt man meist den {WWPN}.
- FCoE braucht verlustfreies Ethernet durch {DCB|Data Center Bridging} mit PFC.

## Zuordnen
### FC-Schicht und Aufgabe
- FC-0 => Medium, Stecker, Signale
- FC-1 => Leitungscodierung (z. B. 64b/66b)
- FC-2 => Rahmen und Flusskontrolle
- FC-3 => gemeinsame Dienste
- FC-4 => Abbildung von SCSI/NVMe (FCP)

## Reihenfolge
### HV01 greift erstmals über die Fabric auf ARRAY01 zu
1. HBA-Port von HV01 wird an FCSW-A angeschlossen
2. Port meldet sich per FLOGI an der Fabric an
3. Switch vergibt eine FC_ID
4. HV01 fragt den Name Server nach erreichbaren Targets
5. Zoning liefert nur den Array-Port von ARRAY01
6. HV01 führt PLOGI und PRLI am Array-Port aus
7. HV01 sendet SCSI-Befehle an die freigegebene LUN

## Freitext
- F: Erklären Sie den Unterschied zwischen WWNN und WWPN und begründen Sie, warum beim Zoning der WWPN verwendet wird. | M: Der WWNN identifiziert das gesamte Gerät (z. B. HBA-Karte), der WWPN jeden einzelnen Port. Da jeder Port in einer eigenen Fabric hängt und einzeln berechtigt werden muss, wird beim Zoning und Masking der WWPN verwendet; der WWNN wäre für mehrere Ports gleich und damit nicht eindeutig genug. | P: 4

## Szenario
### Neues FC-SAN bei der Spedition Weber
Die Spedition Weber beschafft ein Array ARRAY01 mit zwei Controllern und zwei FC-Switches. Die Hyper-V-Hosts HV01 und HV02 erhalten je eine Dual-Port-HBA mit 32 GFC. Der Dienstleister schlägt vor, beide Switches per ISL zu verbinden und an jedem Host nur einen Port zu verkabeln, „weil das reicht“.
- F: Bewerten Sie den Vorschlag des Dienstleisters. | A: Ungünstig: Ein Port pro Host ist ein Single Point of Failure, und per ISL verbundene Switches bilden eine gemeinsame Fabric, in der sich Konfigurationsfehler ausbreiten; besser zwei getrennte Fabrics A/B mit je einem HBA-Port pro Host | P: 4
- F: Welche Kennungen notieren Sie für Zoning und Masking? | A: Die WWPNs beider HBA-Ports von HV01 und HV02 sowie die WWPNs der Array-Ports, z. B. mit Get-InitiatorPort | P: 2
- F: Was muss auf den Hosts zusätzlich installiert werden, damit beide Pfade genutzt werden? | A: Das Feature Multipfad-E/A (MPIO), sonst erscheint jede LUN doppelt | P: 2
- F: Ein Jahr später wird die HBA in HV02 getauscht, danach sieht HV02 keine LUNs mehr. Ursache? | A: Die neue HBA hat neue WWPNs; Zoning auf FCSW-A/FCSW-B und Host-Definition im LUN-Masking von ARRAY01 müssen angepasst werden | P: 2
