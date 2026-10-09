---
id: server-speicher-lun-zoning
bereich: AP2
block: SP
kapitel: Speicher & SAN vertieft
titel: LUN, LUN-Masking und Zoning – Zugriffssteuerung im SAN
stufe: Profi
fach: ITK / Grundlagen
pruefungen: [AP2, AZ-800, Schule]
quellen: [SAN_Präsentation.pdf, Microsoft Learn – iSCSI/MPIO/Storage Spaces, SNIA-Grundlagen]
verweise: [server-san, server-speicher-fibre-channel, server-speicher-iscsi, server-speicher-mpio, az801-cluster-storage-quorum, server-speicher-das-nas-san]
---

## Profi

### LUN
Eine **LUN** (*Logical Unit Number*) ist streng genommen die **Nummer einer logischen Einheit** innerhalb eines SCSI-Targets; im Alltag meint man damit die **logische Platte** selbst, die ein Array einem Server bereitstellt. Das Array bildet LUNs aus seinem Speicherpool (RAID-Gruppen, Pools mit Thin Provisioning). Der Server sieht jede LUN als eigenständigen Datenträger und adressiert ihn über **Target + LUN-Nummer** (unter Windows z. B. „Port 2, Ziel 0, LUN 3“). **LUN 0** existiert in jedem Target und wird bei der Erkennung zuerst abgefragt.

Typische LUN-Eigenschaften: Größe, Thin oder Thick, RAID-Schutz/Pool, Cache-Richtlinie, Besitzer-Controller (bei ALUA), Snapshots und Replikation.

### Warum Zugriffssteuerung?
In einem SAN sind **alle Server physisch mit allen Speicherports verbunden**. Ohne Steuerung würde **jeder Windows-Server jede LUN sehen**, sie womöglich initialisieren und fremde Daten (z. B. VMFS eines VMware-Hosts) zerstören. Deshalb gibt es **zwei Schutzschichten**, die **zusammen** eingesetzt werden:

| | **Zoning** | **LUN-Masking** |
|---|---|---|
| Ort | **FC-Switch / Fabric** | **Speicher-Array** (Controller) |
| Frage | „Welche **Ports** dürfen miteinander reden?“ | „Welcher **Host** darf welche **LUN** sehen?“ |
| Objekte | WWPNs bzw. Switch-Ports | LUNs ↔ Host/Host-Gruppe (WWPNs bzw. IQNs) |
| Wirkung | Initiator sieht nur erlaubte Target-Ports | Target meldet nur freigegebene LUNs |
| Analogie | Türsteher am Eingang | Schließfach mit Namensschild |

Bei **iSCSI** gibt es kein Fabric-Zoning; die Trennung erfolgt über **VLANs/Subnetze**, und das Masking über **Initiator-Gruppen** (IQNs) – beim Windows-Zielserver über die **InitiatorIds** des Targets.

### Zoning im Detail
**Zone** = Gruppe von Ports, die sich sehen dürfen. **Zoneset** (*zone set*, *zone configuration*) = Sammlung von Zonen; **nur ein Zoneset ist pro Fabric aktiv**. Änderungen wirken erst nach dem **Aktivieren** des Zonesets. Mit **Aliasen** (z. B. `HV01_HBA1` statt `10:00:00:90:fa:12:34:56`) bleibt die Konfiguration lesbar.

**Zwei unabhängige Unterscheidungen:**
1. **Nach Mitgliedsart**
   - **WWN-Zoning** (*WWPN-Zoning*): Mitglied ist der WWPN. Vorteil: Das Gerät darf an einen anderen Switch-Port umgesteckt werden. Nachteil: Bei HBA-Tausch neuer WWPN → Zone anpassen. **Heute üblich.**
   - **Port-Zoning** (*Domain,Port*): Mitglied ist der physische Switch-Port. Vorteil: HBA-Tausch ohne Änderung. Nachteil: Umstecken bricht den Zugriff, und ein fremdes Gerät am selben Port bekommt Zugriff.
2. **Nach Durchsetzung**
   - **Soft-Zoning**: Der **Name Server filtert** nur die Antworten – ein Gerät, das die Adresse eines Targets kennt, könnte es theoretisch trotzdem ansprechen.
   - **Hard-Zoning**: Der Switch **prüft jeden Rahmen in Hardware (ASIC)** und verwirft unerlaubte. Sicherer; moderne Switches erzwingen auch WWN-Zonen in Hardware.

**Single-Initiator-Zoning**: Jede Zone enthält **genau einen Initiator** (HBA-Port) und die Target-Ports, die er braucht. Noch strenger: **Single-Initiator-Single-Target** (eine Zone pro Pfad). Grund: Initiatoren sollen sich nicht gegenseitig sehen; Störungen eines HBAs (z. B. **RSCN**-Meldungsstürme, *Registered State Change Notification*) bleiben auf die eigene Zone begrenzt. Viele Initiatoren in einer großen Zone gelten als Fehler.

### LUN-Masking im Detail
Auf dem Array legt man **Host-Objekte** an (Host HV01 mit seinen WWPNs bzw. IQN), fasst Cluster-Knoten zu einer **Host-Gruppe** zusammen und ordnet (mappt) LUNs zu. Dabei vergibt man die **Host-LUN-ID**, unter der der Server die LUN sieht. Cluster-LUNs müssen auf **allen Knoten dieselbe LUN-ID** haben. Masking kann auch **auf dem Host** (z. B. HBA-Treiber) erfolgen – das gilt aber als schwach, weil ein Admin es dort aushebeln kann.

### Typische Fehler und Ursachen
| Symptom | Ursache |
|---|---|
| Host sieht **gar keine** LUN | Zone fehlt oder Zoneset nicht **aktiviert**; Host im Array nicht angelegt; LUN nicht gemappt |
| Host sieht Target, aber **keine Platte** | Zoning ok, aber **LUN-Masking** fehlt |
| Nur **ein Pfad** sichtbar | Zone nur in Fabric A angelegt, Fabric B vergessen |
| Nach HBA-Tausch kein Zugriff | neuer **WWPN** – Zone und Host-Objekt anpassen (oder Port-Zoning) |
| **WWNN statt WWPN** eingetragen | Zone greift nicht |
| Zwei Nicht-Cluster-Server sehen dieselbe LUN | Masking zu großzügig (Host-Gruppe falsch) → Datenkorruption droht |
| Cluster-Validierung meldet unterschiedliche LUN-IDs | LUN auf den Knoten mit unterschiedlicher Host-LUN-ID gemappt |
| LUN erscheint doppelt | MPIO nicht installiert, beide Pfade werden als eigene Platte gezeigt |

Probier es im **Speicher-Labor unter Werkzeuge** aus: Dort kannst du Zonen und Masking-Regeln setzen und sofort sehen, welcher Host welche LUN sieht.

## Einfach

Stell dir ein großes **Schwimmbad mit Schließfächern** vor.

Das Schwimmbad ist das **SAN**, die **Schließfächer** sind die **LUNs** – jedes Fach hat eine **Nummer** (daher „Logical Unit **Number**“).

Am **Eingang** steht ein **Türsteher** (der **FC-Switch**). Er hat eine Liste: „Der Junge mit dem roten Band darf nur in **Halle A** zu den Fächern von **Wand 1**.“ Das ist **Zoning**: Es bestimmt, **wer zu welcher Wand gehen** darf. Wenn der Türsteher nur sagt „Wand 2 gibt es für dich nicht“, aber nicht aufpasst, ob du trotzdem hingehst, ist das **Soft-Zoning**. Wenn er dich **festhält**, sobald du in die falsche Richtung läufst, ist das **Hard-Zoning**.

An der Wand selbst haben die **Fächer Namensschilder** und **Schlösser**. Selbst wenn du vor der richtigen Wand stehst, geht nur **dein** Fach auf. Das ist **LUN-Masking** – es passiert am **Schrank** (dem Speicher-Array), nicht am Eingang.

Man braucht **beides**: Der Türsteher hält Fremde fern, die Schlösser sorgen dafür, dass jeder nur sein eigenes Fach öffnet.

Und noch eine Regel: Der Türsteher lässt **immer nur ein Kind auf einmal** pro Gruppe mit den Fächern reden (**Single-Initiator-Zoning**). So stören sich die Kinder nicht gegenseitig, wenn eins mal Quatsch macht.

## Merksatz
- **Zoning am Switch, Masking am Array.**
- **Zoning: Wer darf mit wem reden? Masking: Wer darf welche LUN sehen?**
- **Erst zonen, dann aktivieren – sonst passiert nichts.**
- **Ein Initiator pro Zone.**
- **WWN-Zoning folgt dem Gerät, Port-Zoning folgt dem Kabel.**
- **Cluster-LUN = gleiche LUN-ID auf allen Knoten.**

## Prüfungsfalle
- **Zoning und LUN-Masking vertauscht**: Zoning ist auf dem **Switch**, Masking auf dem **Speichersystem**.
- „Zoning allein genügt“ – falsch: Ein Host in der Zone sähe sonst **alle** LUNs des Array-Ports.
- **Soft/Hard** und **WWN/Port** sind **zwei verschiedene** Unterscheidungen – nicht gleichsetzen.
- Zonen angelegt, aber **Zoneset nicht aktiviert** – häufigster Praxisfehler.
- In beiden Fabrics zonen – sonst fehlt ein Pfad, und MPIO hat keine Redundanz.
- Bei iSCSI gibt es kein FC-Zoning; Trennung über VLAN/Subnetz und Initiator-Gruppen.
- **WWNN** in die Zone einzutragen statt **WWPN** führt zu keinem Zugriff.

## Grafik
### Zoning und Masking hintereinander
1. HV01 -> FCSW-A: fragt den Name Server nach Targets
2. FCSW-A: Zone Z_HV01_HBA1 erlaubt nur ARRAY01-CTRL-A-P1
3. FCSW-A -> HV01: meldet nur den erlaubten Array-Port
4. HV01 -> ARRAY01: REPORT LUNS am Array-Port
5. ARRAY01: Masking prüft Host-Gruppe HVCLUSTER
6. ARRAY01 -> HV01: meldet nur LUN 1 und LUN 2, nicht LUN 7 von SQL01

### Fehler: Zoneset nicht aktiviert
1. Admin -> FCSW-B: legt Zone Z_HV01_HBA2 an
2. FCSW-B: Zone liegt nur in der gespeicherten Konfiguration
3. HV01 -> FCSW-B: Name-Server-Abfrage liefert kein Target
4. Admin -> FCSW-B: aktiviert das Zoneset
5. FCSW-B -> HV01: RSCN – neues Target sichtbar, zweiter Pfad steht

## Lab
**Maschinen**: Hosts **HV01.example.com**, **HV02.example.com** (je Dual-Port-HBA), Datenbankserver **SQL01.example.com**, Switches **FCSW-A**, **FCSW-B**, Array **ARRAY01** (Controller A/B). Im Heimlabor ohne FC-Hardware: iSCSI-Variante mit **FS01.example.com** als Target (InitiatorIds = Masking). Schule: `exa.local`.

### GUI
1. **HV01, HV02**: WWPNs beider HBA-Ports notieren (`Get-InitiatorPort`, siehe PowerShell).
2. **FCSW-A** (Web-Oberfläche): Aliase anlegen `HV01_HBA1`, `HV02_HBA1`, `ARRAY01_CA_P1`, `ARRAY01_CB_P1`.
3. **FCSW-A**: Zonen nach Single-Initiator-Prinzip: `Z_HV01_HBA1` = HV01_HBA1 + ARRAY01_CA_P1 + ARRAY01_CB_P1; `Z_HV02_HBA1` analog.
4. **FCSW-A**: Zonen dem Zoneset `FABRIC_A_CFG` hinzufügen → **Zoneset aktivieren**.
5. **FCSW-B**: dasselbe mit den zweiten HBA-Ports und den Port-2-Anschlüssen der Controller.
6. **ARRAY01**: Host `HV01` (beide WWPNs) und `HV02` anlegen → Host-Gruppe `HVCLUSTER` → LUN `CSV01` mit **Host-LUN-ID 1** an die Gruppe mappen.
7. **HV01**: Datenträgerverwaltung → Datenträger neu einlesen → CSV01 erscheint (mit MPIO genau **einmal**).
8. **Heimlabor FS01**: Server-Manager → iSCSI → Ziel → Eigenschaften → **Initiatoren**: nur HV01/HV02 eintragen und beobachten, dass ein dritter Server nichts sieht.
9. Probier verschiedene Zonen und Masking-Regeln im **Speicher-Labor unter Werkzeuge** aus.

### PowerShell
```powershell
# HV01: WWPNs fuer Zoning und Masking auslesen
Get-InitiatorPort | Where-Object ConnectionType -eq "Fibre Channel" |
  Select-Object NodeAddress, PortAddress

# HV01: Datentraeger neu einlesen und LUN-Adresse anzeigen
Update-HostStorageCache
Get-Disk | Format-Table Number, FriendlyName, BusType, Location, Size

# FS01 (Heimlabor, iSCSI): Masking ueber InitiatorIds
Get-IscsiServerTarget -TargetName HVCluster | Select-Object InitiatorIds, LunMappings
Set-IscsiServerTarget -TargetName HVCluster -InitiatorIds @(
  "IQN:iqn.1991-05.com.microsoft:hv01.example.com",
  "IQN:iqn.1991-05.com.microsoft:hv02.example.com")

# HV01: Cluster-Validierung prueft u. a. gleiche LUN-Sicht auf allen Knoten
Test-Cluster -Node HV01, HV02 -Include "Storage","Inventory"   # deutsches System: "Speicher","Inventar"
```

## Legende
### Zoning
- Was: Zugriffssteuerung in der FC-Fabric, welche Ports sich sehen dürfen.
- Wie: Zonen aus WWPNs oder Switch-Ports, gesammelt im Zoneset, das aktiviert wird.
- Wo: auf den FC-Switches FCSW-A und FCSW-B.
- Wann: bei jedem neuen Host, HBA-Tausch oder neuen Array-Port.
- Warum: trennt Hosts voneinander und begrenzt Störungen auf die eigene Zone.
### LUN-Masking
- Was: Freigabe einzelner LUNs für bestimmte Hosts.
- Wie: Host-Objekte mit WWPNs/IQNs, Host-Gruppen und LUN-Mapping mit Host-LUN-ID.
- Wo: auf dem Speicher-Array ARRAY01 bzw. beim Windows-Zielserver über InitiatorIds.
- Wann: bei jeder neuen LUN und jedem neuen Host.
- Warum: verhindert, dass fremde Server LUNs sehen und Daten zerstören.

## Karteikarten
- F: Was ist eine LUN? | A: Logical Unit Number – Nummer bzw. logische Platte, die ein Target einem Server bereitstellt
- F: Wo wird Zoning konfiguriert? | A: Auf dem FC-Switch bzw. in der Fabric
- F: Wo wird LUN-Masking konfiguriert? | A: Auf dem Speicher-Array (Controller)
- F: Was ist ein Zoneset? | A: Sammlung von Zonen; pro Fabric ist genau ein Zoneset aktiv
- F: Unterschied WWN-Zoning und Port-Zoning? | A: WWN-Zoning nutzt den WWPN (Umstecken möglich, HBA-Tausch ändert Zone), Port-Zoning nutzt den Switch-Port (HBA-Tausch problemlos, Umstecken bricht Zugriff)
- F: Unterschied Soft- und Hard-Zoning? | A: Soft filtert nur Name-Server-Antworten, Hard verwirft unerlaubte Rahmen in der Switch-Hardware
- F: Was ist Single-Initiator-Zoning? | A: Jede Zone enthält genau einen Initiator-Port und seine Target-Ports
- F: Warum Single-Initiator-Zoning? | A: Initiatoren sehen sich nicht gegenseitig, Störungen und RSCN-Meldungen bleiben auf eine Zone begrenzt
- F: Was ist eine Host-Gruppe im Array? | A: Zusammenfassung mehrerer Hosts (z. B. Cluster-Knoten), denen dieselben LUNs gemappt werden
- F: Was gilt für LUN-IDs in einem Cluster? | A: Jede gemeinsame LUN muss auf allen Knoten dieselbe Host-LUN-ID haben
- F: Wie wird Masking beim Windows-iSCSI-Zielserver umgesetzt? | A: Über die InitiatorIds des Targets (IQN, DNS-Name, IP oder MAC)
- F: Host sieht das Target, aber keine Platte – was fehlt meist? | A: Das LUN-Masking bzw. Mapping auf dem Array

## Quiz
? Wo wird LUN-Masking eingerichtet?
* Auf dem Speicher-Array
- Auf dem FC-Switch
- Auf dem DNS-Server
- Im BIOS des Clients
! Masking steuert am Array, welcher Host welche LUN sieht; Zoning passiert am Switch.

? Was regelt Zoning?
* Welche Ports der Fabric miteinander kommunizieren dürfen
- Welche RAID-Stufe eine LUN auf dem Array nutzt
- Welche LUNs ein Host am Array sehen darf (Mapping)
- Welche Dateien ein Benutzer auf dem Volume öffnen darf
! Zoning ist die Zugriffssteuerung auf Port-Ebene in der Fabric; die LUN-Sicht regelt das LUN-Masking am Array.

? Ein Admin hat eine neue Zone angelegt, der Host sieht trotzdem nichts. Was wurde wahrscheinlich vergessen?
* Das Zoneset zu aktivieren
- Den Host neu zu installieren
- Die LUN zu defragmentieren
- Das Array auszuschalten
! Zonen wirken erst, wenn das Zoneset aktiviert wurde.

? Welche Zoning-Art bleibt nach dem Umstecken eines Servers an einen anderen Switch-Port gültig?
* WWN-Zoning
- Port-Zoning
- Hard-Zoning über Domain,Port
- Keine Zoning-Art
! Beim WWN-Zoning ist der WWPN Mitglied – egal an welchem Port das Gerät steckt.

? Welche Zoning-Art bleibt nach einem HBA-Tausch gültig?
* Port-Zoning
- WWN-Zoning
- Single-Initiator-WWN-Zoning
- Alias-Zoning mit WWPN
! Port-Zoning hängt am Switch-Port; ein neuer HBA hat neue WWPNs, die WWN-Zonen nicht kennen.

? Was kennzeichnet Hard-Zoning?
* Der Switch prüft jeden Rahmen in Hardware, verwirft unerlaubte
- Der Name Server blendet lediglich unerlaubte Einträge aus
- Es wird ausschließlich auf dem Array-Controller konfiguriert
- Es ist nur in iSCSI-Netzen mit VLANs möglich
! Soft-Zoning filtert nur Name-Server-Antworten, Hard-Zoning erzwingt die Regeln pro Rahmen.

? Was ist Best Practice beim Zuschnitt von Zonen?
* Single-Initiator-Zoning
- Alle Hosts und Arrays in eine Zone
- Eine Zone pro Switch
- Zonen nur für Targets ohne Initiatoren
! Je Zone ein Initiator – Hosts beeinflussen sich nicht gegenseitig.

? Ein Host sieht den Array-Port, aber keine LUN. Was ist die wahrscheinlichste Ursache?
* Die LUN ist dem Host im LUN-Masking nicht zugeordnet
- Das Zoning auf dem FC-Switch ist zu restriktiv
- Der Host-HBA hat keine IP-Adresse erhalten
- Das Glasfaserkabel zum Switch ist defekt
! Wenn der Port sichtbar ist, funktionieren Kabel und Zoning; es fehlt das Mapping am Array.

? Welche Kennung wird beim FC-Masking für einen Host eingetragen?
* Die WWPNs seiner HBA-Ports
- Seine MAC-Adresse
- Sein Computerkonto im AD
- Die Seriennummer der Festplatte
! Host-Objekte im Array enthalten die WWPNs (bei iSCSI die IQN).

? Warum müssen gemeinsame LUNs in einem Cluster auf allen Knoten dieselbe LUN-ID haben?
* Damit alle Knoten die LUN gleich erkennen und Validierung/Failover klappen
- Weil das Zoneset sonst nicht aktiviert werden kann
- Weil Windows ausschließlich LUN 0 als Datenträger einbinden kann
- Weil die LUN bei abweichender ID automatisch mit BitLocker verschlüsselt wird
! Unterschiedliche IDs führen zu Warnungen in der Cluster-Validierung und zu Problemen beim Failover.

? Wie wird bei einem Windows-iSCSI-Zielserver festgelegt, wer ein Target sieht?
* Über die InitiatorIds des Targets
- Über FC-Zoning
- Über die Freigabeberechtigungen
- Über Gruppenrichtlinien am Client
! InitiatorIds (IQN, DNS, IP, MAC) entsprechen dem LUN-Masking.

? Eine LUN erscheint auf HV01 zweimal als Datenträger. Was fehlt?
* MPIO auf HV01
- Zoning in Fabric B
- LUN-Masking auf dem Array
- Ein zweites Zoneset
! Ohne Multipfad-E/A erscheint jede LUN pro Pfad als eigene Platte.

? Was ist ein RSCN?
* Eine Fabric-Meldung über Zustandsänderungen an angemeldete Ports
- Ein spezieller RAID-Level für SAN-Arrays
- Ein Befehl zum Formatieren von LUNs über die Fabric
- Ein Authentifizierungsverfahren für iSCSI-Sitzungen
! Registered State Change Notification – Single-Initiator-Zoning begrenzt deren Auswirkungen.

## Lücken
- Zoning wird auf dem {Switch|FC-Switch} konfiguriert, LUN-Masking auf dem {Array|Speicher-Array|Speichersystem}.
- Beim {WWN}-Zoning darf ein Gerät an einen anderen Switch-Port umgesteckt werden.
- Zonen werden in einem {Zoneset} gesammelt, das erst nach dem {Aktivieren} wirkt.

## Zuordnen
### Fehlerbild und Ursache
- Host sieht kein Target => Zone fehlt oder Zoneset nicht aktiviert
- Host sieht Target, aber keine Platte => LUN-Masking fehlt
- Nur ein Pfad sichtbar => in der zweiten Fabric nicht gezont
- LUN erscheint doppelt => MPIO nicht installiert
- Nach HBA-Tausch kein Zugriff => neuer WWPN nicht eingetragen

## Reihenfolge
### Neue LUN für das Cluster HV01/HV02 bereitstellen
1. WWPNs der HBA-Ports von HV01 und HV02 auslesen
2. Aliase und Single-Initiator-Zonen auf FCSW-A und FCSW-B anlegen
3. Zonesets in beiden Fabrics aktivieren
4. Hosts und Host-Gruppe auf ARRAY01 anlegen
5. LUN erstellen und mit gleicher Host-LUN-ID an die Host-Gruppe mappen
6. Datenträger auf HV01 und HV02 neu einlesen
7. Datenträger dem Failover-Cluster hinzufügen

## Freitext
- F: Erläutern Sie, warum in einem FC-SAN sowohl Zoning als auch LUN-Masking eingesetzt werden. | M: Zoning am Switch legt fest, welche Initiator- und Target-Ports sich sehen (Trennung der Hosts, Begrenzung von Störungen). LUN-Masking am Array legt fest, welche LUNs ein Host an einem sichtbaren Port sehen darf. Nur zusammen ist sichergestellt, dass ein Host ausschließlich seine eigenen LUNs erreicht; Zoning allein würde alle LUNs des Ports zeigen, Masking allein ließe alle Hosts miteinander kommunizieren. | P: 6

## Szenario
### Datenverlust nach Servererweiterung
Bei der Firma Hansen wurde der neue Server SQL01.example.com an die Fabric angeschlossen. Der Administrator hat ihn „der Einfachheit halber“ in die bestehende Zone mit HV01, HV02 und ARRAY01 aufgenommen und auf dem Array der Host-Gruppe HVCLUSTER hinzugefügt. Kurz darauf meldet der Cluster beschädigte CSV-Daten; auf SQL01 wurde ein neuer Datenträger initialisiert.
- F: Was ist passiert? | A: SQL01 sah durch die gemeinsame Zone und die falsche Host-Gruppe die Cluster-LUN, hat sie initialisiert und dabei die CSV-Metadaten überschrieben | P: 3
- F: Welche zwei Konfigurationsfehler liegen vor? | A: Kein Single-Initiator-Zoning (alle Hosts in einer Zone) und falsches LUN-Masking (SQL01 in der Host-Gruppe des Clusters) | P: 2
- F: Wie hätte die richtige Konfiguration ausgesehen? | A: Eigene Zonen je HBA-Port von SQL01 mit den Array-Ports, eigenes Host-Objekt SQL01 mit eigener LUN; HVCLUSTER-LUNs nur für HV01/HV02 | P: 3
- F: Wie stellen Sie die Daten wieder her? | A: Aus dem letzten Backup bzw. Array-Snapshot der LUN zurücksichern – RAID und Masking ersetzen keine Datensicherung | P: 2
