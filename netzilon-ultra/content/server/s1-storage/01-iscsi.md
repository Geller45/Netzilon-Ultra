---
id: server-iscsi
bereich: AZ-800
pruefungen: [Schule, AP2]
fach: Windows Server / AZ-800
block: S1
kapitel: Storage
titel: iSCSI-Zielserver und iSCSI-Initiator (Windows Server 2025)
stufe: Fortgeschritten
quellen: [Uebungen-ISCSI.pdf, Loesungen-ISCSI.pdf]
verweise: [server-san, az800-datentraeger, az800-storage-spaces, ap2-backup-speicher, az801-failover-cluster]
---

## Profi

### Was ist iSCSI?
**iSCSI** (*Internet Small Computer System Interface*, RFC 7143) transportiert **SCSI-Blockbefehle über TCP/IP**. Ein Server bekommt dadurch einen Datenträger „über das Netzwerk“, der sich für das Betriebssystem wie eine **lokale Festplatte** verhält: Er wird in der Datenträgerverwaltung angezeigt, initialisiert (MBR/GPT), partitioniert und mit NTFS oder ReFS formatiert. iSCSI ist damit **Blockspeicher** (wie SAN) – im Gegensatz zu SMB/NFS (Dateispeicher, NAS). Standardport: **TCP 3260**.

### Begriffe
| Begriff | Bedeutung | Windows Server 2025 |
|---|---|---|
| **Initiator** | Client, der Blockspeicher anfordert | integriert, Dienst **MSiSCSI**, GUI `iscsicpl.exe` |
| **Target** (Ziel) | Zielobjekt auf dem iSCSI-Zielserver; legt fest, **welche Initiatoren** zugreifen dürfen und **welche LUNs** dazugehören | Rolle **iSCSI-Zielserver** (`FS-iSCSITarget-Server`), Dienst **WinTarget** |
| **LUN** (*Logical Unit Number*) | einzelner Datenträger, den der Initiator sieht | beim Windows-Zielserver eine **VHDX-Datei** (fest, dynamisch oder differenzierend) |
| **IQN** (*iSCSI Qualified Name*) | weltweit eindeutiger Name von Initiator/Target | `iqn.1991-05.com.microsoft:exa-srv02.example.com` |
| **Portal** | IP-Adresse + Port, über den ein Target erreichbar ist | `New-IscsiTargetPortal` |
| **Sitzung** (Session) | angemeldete Verbindung Initiator ↔ Target | `Get-IscsiSession` |

**Zusammenhang:** Der Initiator meldet sich an einem **Target** an und sieht danach **alle LUNs**, die diesem Target zugeordnet sind. Ein Target kann mehrere virtuelle Datenträger enthalten.

### Aufbau eines IQN
`iqn.<JJJJ-MM>.<umgekehrte Domäne>:<eindeutiger Name>`
- JJJJ-MM = Jahr/Monat, in dem die **Domäne registriert** wurde (Microsoft: 1991-05)
- umgekehrte Domäne: `com.microsoft`
- danach eine frei wählbare, eindeutige Kennung, z. B. Hostname.
Alternative Formate: **EUI** (`eui.` + 16 Hex-Zeichen) und **NAA**.

### Wie identifiziert ein Target zugelassene Initiatoren?
1. **IQN** (empfohlen – ändert sich nicht bei IP-Wechsel)
2. **DNS-Name/FQDN**
3. **IP-Adresse** (IPv4 oder IPv6)
4. **MAC-Adresse**

### Sicherheit: CHAP und Reverse CHAP
- **CHAP** (*Challenge Handshake Authentication Protocol*): Das **Target prüft den Initiator** mit einem gemeinsamen Geheimnis → einseitig. Das Geheimnis muss bei Windows **12 bis 16 Zeichen** lang sein.
- **Reverse CHAP** (Mutual CHAP): Zusätzlich **prüft der Initiator das Target** → gegenseitige Authentifizierung, schützt vor gefälschten Targets.
- iSCSI verschlüsselt **nicht** selbst. Schutz durch **eigenes, isoliertes Speichernetz/VLAN**, optional IPsec.

### Redundanz: MPIO statt NIC-Teaming
**NIC-Teaming (LBFO) wird für iSCSI-Verkehr nicht unterstützt.** Stattdessen **MPIO** (*Multipath I/O*): Jeder Pfad ist eine **eigene iSCSI-Sitzung** über eine eigene NIC/ein eigenes Subnetz. Fällt ein Pfad aus, übernimmt der andere **ohne Unterbrechung**; zusätzlich Lastverteilung, z. B. **Round Robin (RR)**, Failover Only, Least Queue Depth. Ohne MPIO sieht Windows **jeden Pfad als eigenen Datenträger** → der Datenträger erscheint **doppelt**.

### Best Practices fürs iSCSI-Netz
- **Eigenes Netz/VLAN**, mindestens 10 GbE, keine Mitbenutzung durch Clientverkehr.
- **Kein Default-Gateway** auf den iSCSI-NICs (isoliertes Netz, sonst falsches Routing).
- **Jumbo Frames** (MTU 9000) nur, wenn **alle Geräte im Pfad** (NIC, Switch, Target) gleich eingestellt sind – sonst Fragmentierung/Paketverlust.
- Verbindung **persistent** (bevorzugtes Ziel) anlegen, Dienst MSiSCSI auf **Automatisch**.
- **Feste VHDX** für Produktion (Platz sofort belegt, vorhersagbare Leistung), **dynamische** VHDX für Test/Labor (Füllstand des Host-Volumes überwachen!).
- Vergrößern im laufenden Betrieb ist möglich (`Resize-IscsiVirtualDisk`), **Verkleinern** ist mit dem iSCSI-Zielserver nicht vorgesehen.

### Einsatzszenarien
- **Failover-Cluster**: gemeinsamer Speicher (Shared Storage) für Clusterknoten (Cluster Shared Volumes).
- Diskless Boot / Boot from SAN, Laborumgebungen, Hyper-V-Speicher ohne teures Fibre-Channel-SAN.
- Ablösung: In Hyper-converged-Szenarien wird heute oft **Storage Spaces Direct** genutzt.

### Ablauf einer Verbindung
1. Initiator ermittelt Targets über das Portal (**Discovery**, SendTargets).
2. Target prüft, ob der IQN des Initiators in den **InitiatorIds** steht.
3. **Login** (ggf. CHAP), Sitzung wird aufgebaut.
4. Initiator sieht die LUNs → Datenträger erscheint offline/nicht initialisiert.
5. Online schalten, initialisieren (GPT), Partition, Format.

## Einfach

Stell dir vor, dein Computer hat zu wenig Platz in seinem Schrank (Festplatte). Ein anderer Computer im Keller hat riesige Schränke. Mit **iSCSI** kann dein Computer einen dieser Schränke **übers Netzwerkkabel ausleihen** – und das Tolle ist: Dein Computer **merkt gar nicht**, dass der Schrank im Keller steht. Er behandelt ihn wie seinen eigenen.

Die Rollen sind wie bei einem **Fahrradverleih**:
- Der **Initiator** ist der **Kunde**, der ein Fahrrad ausleihen möchte (dein Server).
- Der **iSCSI-Zielserver** ist der **Verleih-Laden**.
- Das **Target** ist die **Reservierung** im Laden: „Diese Fahrräder dürfen nur Kunde Max abholen.“
- Die **LUN** ist das **einzelne Fahrrad**. Eine Reservierung kann mehrere Fahrräder enthalten.
- Der **IQN** ist die **Kundennummer** – so wie dein Name auf dem Ausweis, nur eindeutig auf der ganzen Welt.

**CHAP** ist das **Passwort an der Theke**: Der Laden fragt „Wie lautet dein Codewort?“ Bei **Reverse CHAP** fragt **auch der Kunde** den Laden: „Bist du wirklich der echte Laden?“ – damit dich kein Betrüger mit einem gefälschten Laden reinlegt.

**MPIO** ist wie **zwei Wege zum Laden**: Wenn die Straße A gesperrt ist, fährst du einfach über Straße B – ohne dass du anhalten musst. Hast du MPIO **vergessen**, denkt dein Computer, die zwei Wege führen zu **zwei verschiedenen** Läden, und zeigt dir den gleichen Schrank **zweimal** an. Wer dann den „zweiten“ Schrank ausräumt (formatiert), räumt in Wahrheit den ersten aus – Daten weg!

**Persistent** heißt: Der Computer merkt sich die Ausleihe. Nach einem Neustart holt er sich das Fahrrad automatisch wieder. Ohne „persistent“ steht er nach dem Neustart ohne Fahrrad da.

## Merksatz
- iSCSI = **SCSI im TCP-Paket**, Port **3260**.
- **Initiator fragt – Target erlaubt – LUN ist die Platte.**
- IQN = **iqn.Jahr-Monat.umgedrehte-Domäne:Name**.
- **MPIO ja, NIC-Teaming nein!**
- **Kein Gateway, gleiche MTU, eigenes Netz.**
- CHAP = 12–16 Zeichen, Reverse CHAP = **beide** prüfen sich.

## Prüfungsfalle
- Der Initiator muss **nicht** installiert werden – er ist integriert; nur der Dienst **MSiSCSI** muss starten.
- **NIC-Teaming** für iSCSI ist **nicht unterstützt** → MPIO.
- Datenträger doppelt sichtbar = **MPIO beansprucht iSCSI nicht** → den zweiten **nicht** online schalten/formatieren.
- Laufwerke nach Neustart weg = Verbindung **nicht persistent**.
- Port 445 (SMB), 3389 (RDP), 5985 (WinRM) sind **Ablenker** – iSCSI ist **3260**.
- Der Windows-Zielserver speichert LUNs als **VHDX**, nicht VMDK/QCOW2/ISO.
- iSCSI ist **Block**-, nicht **Datei**speicher (≠ SMB-Freigabe).
- Quellen-Hinweis: Die Rechnernamen der Übung wurden auf das Heimlabor **example.com** umgestellt (EXA-DC01, SRV-ISCSI, EXA-SRV02).

## Grafik
### iSCSI-Login mit CHAP und Datenträger
1. EXA-SRV02: Dienst MSiSCSI starten, IQN ermitteln
2. EXA-SRV02 -> SRV-ISCSI: Discovery über Portal 10.10.1.10:3260
3. SRV-ISCSI: Prüft IQN in den InitiatorIds von TGT-EXA-SRV02
4. SRV-ISCSI -> EXA-SRV02: CHAP-Challenge
5. EXA-SRV02 -> SRV-ISCSI: CHAP-Antwort mit Geheimnis
6. SRV-ISCSI -> EXA-SRV02: Login OK, LUN-Daten und LUN-Test sichtbar
7. EXA-SRV02: Datenträger online, GPT, ReFS/NTFS
### MPIO-Pfadausfall
1. EXA-SRV02 -> SRV-ISCSI: Sitzung 1 über 10.10.1.0/24
2. EXA-SRV02 -> SRV-ISCSI: Sitzung 2 über 10.10.2.0/24
3. Switch1: fällt aus
4. EXA-SRV02: MPIO schaltet ohne Unterbrechung auf Pfad 2
5. Ohne MPIO würde jeder Pfad als eigener Datenträger erscheinen

## Lab
Laborumgebung (Heimlabor **example.com**): **EXA-DC01** (DC, 10.10.0.10), **SRV-ISCSI** (Zielserver, LAN 10.10.0.20, iSCSI 10.10.1.10 und 10.10.2.10, Datenträger D:), **EXA-SRV02** (Dateiserver/Initiator, LAN 10.10.0.21, iSCSI 10.10.1.21 und 10.10.2.21). Alle Befehle in PowerShell als Administrator.

### GUI
1. **SRV-ISCSI**: Server-Manager → Verwalten → Rollen und Features hinzufügen → Datei-/Speicherdienste → Datei- und iSCSI-Dienste → **iSCSI-Zielserver** → Installieren.
2. **EXA-SRV02**: `iscsicpl.exe` starten → Rückfrage „Dienst starten?“ mit **Ja** → Registerkarte **Konfiguration** → Initiatorname (IQN) kopieren.
3. **SRV-ISCSI**: Server-Manager → Datei-/Speicherdienste → **iSCSI** → Aufgaben → **Neuer virtueller iSCSI-Datenträger** → Volume D:, Name LUN-Daten, 100 GB, **Feste Größe**.
4. Im Assistenten **Neues iSCSI-Ziel** → Name TGT-EXA-SRV02 → Zugriffsserver hinzufügen → Typ **IQN** → IQN von EXA-SRV02 einfügen.
5. Seite **Authentifizierung aktivieren** → CHAP aktivieren → Benutzername EXA-SRV02chap, Geheimnis 12–16 Zeichen → Erstellen.
6. Zweiten Datenträger LUN-Test (20 GB, **Dynamisch erweiterbar**) anlegen und **dem vorhandenen Ziel** TGT-EXA-SRV02 zuweisen.
7. **EXA-SRV02**: Server-Manager → Rollen und Features → Feature **Multipfad-E/A** → Installieren. Danach `mpiocpl.exe` → Registerkarte **Multipfade suchen** → **Unterstützung für iSCSI-Geräte hinzufügen** → Neustart.
8. **EXA-SRV02**: `iscsicpl` → **Suche** → Portal ermitteln → 10.10.1.10, über **Erweitert** Initiator-IP 10.10.1.21 wählen; dasselbe für 10.10.2.10/10.10.2.21.
9. Registerkarte **Ziele** → Ziel markieren → **Verbinden** → Haken **Diese Verbindung der Liste der bevorzugten Ziele hinzufügen** und **Multipfad aktivieren** → **Erweitert** → Initiator-IP/Zielportal Pfad 1 → **CHAP-Anmeldung aktivieren** → Name + Geheimnis. Für Pfad 2 wiederholen.
10. **EXA-SRV02**: Datenträgerverwaltung (`diskmgmt.msc`) → neue Datenträger **Online** → **Initialisieren (GPT)** → Neues einfaches Volume → Daten: **ReFS**, Test: **NTFS**.

### PowerShell
```powershell
# --- SRV-ISCSI: Rolle installieren und pruefen
Install-WindowsFeature FS-iSCSITarget-Server -IncludeManagementTools
Get-WindowsFeature FS-iSCSITarget-Server
Get-Service WinTarget

# --- EXA-SRV02: Initiator-Dienst und IQN
Set-Service MSiSCSI -StartupType Automatic
Start-Service MSiSCSI
(Get-InitiatorPort).NodeAddress

# --- SRV-ISCSI: virtuelle Datentraeger
New-Item -Path D:\iSCSI -ItemType Directory
New-IscsiVirtualDisk -Path D:\iSCSI\LUN-Daten.vhdx -SizeBytes 100GB -UseFixed
New-IscsiVirtualDisk -Path D:\iSCSI\LUN-Test.vhdx  -SizeBytes 20GB
Get-IscsiVirtualDisk | Format-Table Path, Size, DiskType, Status

# --- SRV-ISCSI: Target + Zuordnung + CHAP
New-IscsiServerTarget -TargetName TGT-EXA-SRV02 `
  -InitiatorIds "IQN:iqn.1991-05.com.microsoft:exa-srv02.example.com"
Add-IscsiVirtualDiskTargetMapping -TargetName TGT-EXA-SRV02 -Path D:\iSCSI\LUN-Daten.vhdx
Add-IscsiVirtualDiskTargetMapping -TargetName TGT-EXA-SRV02 -Path D:\iSCSI\LUN-Test.vhdx
$cred = Get-Credential -UserName EXA-SRV02chap -Message "CHAP-Geheimnis (12-16 Zeichen)"
Set-IscsiServerTarget -TargetName TGT-EXA-SRV02 -EnableChap $true -Chap $cred
Get-IscsiServerTarget TGT-EXA-SRV02 | Format-List TargetIqn, InitiatorIds, LunMappings, Status

# --- EXA-SRV02: MPIO (Neustart noetig)
Install-WindowsFeature Multipath-IO
Enable-MSDSMAutomaticClaim -BusType iSCSI
Set-MSDSMGlobalDefaultLoadBalancePolicy -Policy RR
Restart-Computer

# --- EXA-SRV02: zwei Pfade, persistent, mit CHAP
New-IscsiTargetPortal -TargetPortalAddress 10.10.1.10 -InitiatorPortalAddress 10.10.1.21
New-IscsiTargetPortal -TargetPortalAddress 10.10.2.10 -InitiatorPortalAddress 10.10.2.21
$tgt  = (Get-IscsiTarget | Where-Object NodeAddress -like '*tgt-exa-srv02*').NodeAddress
$chap = @{ AuthenticationType='ONEWAYCHAP'; ChapUsername='EXA-SRV02chap'; ChapSecret='<Geheimnis>' }
Connect-IscsiTarget -NodeAddress $tgt -TargetPortalAddress 10.10.1.10 -InitiatorPortalAddress 10.10.1.21 -IsPersistent $true -IsMultipathEnabled $true @chap
Connect-IscsiTarget -NodeAddress $tgt -TargetPortalAddress 10.10.2.10 -InitiatorPortalAddress 10.10.2.21 -IsPersistent $true -IsMultipathEnabled $true @chap
Get-IscsiSession | Format-Table InitiatorPortalAddress, TargetNodeAddress, IsPersistent
mpclaim -s -d

# --- EXA-SRV02: Datentraeger in Betrieb nehmen (Nummern anpassen)
Get-Disk | Where-Object BusType -eq iSCSI | Format-Table Number, FriendlyName, Size, OperationalStatus
Set-Disk -Number 1 -IsOffline $false
Initialize-Disk -Number 1 -PartitionStyle GPT
New-Partition -DiskNumber 1 -UseMaximumSize -AssignDriveLetter | Format-Volume -FileSystem ReFS -NewFileSystemLabel Daten
Set-Disk -Number 2 -IsOffline $false
Initialize-Disk -Number 2 -PartitionStyle GPT
New-Partition -DiskNumber 2 -UseMaximumSize -AssignDriveLetter | Format-Volume -FileSystem NTFS -NewFileSystemLabel Test

# --- Vergroessern im laufenden Betrieb: erst SRV-ISCSI, dann EXA-SRV02
Resize-IscsiVirtualDisk -Path D:\iSCSI\LUN-Daten.vhdx -SizeBytes 150GB      # SRV-ISCSI
Update-HostStorageCache                                                    # EXA-SRV02
$max = (Get-PartitionSupportedSize -DriveLetter E).SizeMax
Resize-Partition -DriveLetter E -Size $max
```

## Befehle
- `Install-WindowsFeature FS-iSCSITarget-Server -IncludeManagementTools` – Rolle iSCSI-Zielserver installieren (Zielserver)
- `Get-Service WinTarget` – Dienst des Zielservers prüfen
- `Start-Service MSiSCSI` – Initiator-Dienst starten (Initiator)
- `(Get-InitiatorPort).NodeAddress` – eigenen IQN anzeigen
- `New-IscsiVirtualDisk -Path D:\iSCSI\x.vhdx -SizeBytes 100GB -UseFixed` – LUN als feste VHDX anlegen
- `New-IscsiServerTarget -TargetName T -InitiatorIds "IQN:..."` – Target mit zugelassenem Initiator anlegen
- `Add-IscsiVirtualDiskTargetMapping` – LUN einem Target zuordnen
- `Set-IscsiServerTarget -EnableChap $true -Chap $cred` – CHAP am Target aktivieren
- `New-IscsiTargetPortal -TargetPortalAddress IP` – Portal für Discovery eintragen
- `Connect-IscsiTarget -IsPersistent $true -IsMultipathEnabled $true` – persistent mit MPIO verbinden
- `Get-IscsiSession \| Register-IscsiSession` – vorhandene Sitzungen nachträglich persistent machen
- `Enable-MSDSMAutomaticClaim -BusType iSCSI` – MPIO beansprucht iSCSI-Datenträger automatisch
- `mpclaim -s -d` – MPIO-Datenträger und Pfade/Richtlinie anzeigen
- `Resize-IscsiVirtualDisk` – LUN auf dem Zielserver vergrößern
- `Update-HostStorageCache` – Initiator liest neue Datenträgergröße ein
- `Test-NetConnection 10.10.1.10 -Port 3260` – Erreichbarkeit des Portals prüfen
- `iscsicpl.exe` – GUI des iSCSI-Initiators

## Übungen
- A: A1 Welcher TCP-Port wird standardmäßig für iSCSI verwendet? a) 445 b) 3260 c) 3389 d) 5985 | L: b) 3260. 445 = SMB, 3389 = RDP, 5985 = WinRM (HTTP).
- A: A2 Erklären Sie Initiator, Target und LUN und wie sie zusammenhängen. | L: Initiator = Client, der Blockspeicher anfordert (EXA-SRV02, Dienst MSiSCSI). Target = Zielobjekt auf dem Zielserver, legt zugelassene Initiatoren fest und bündelt Datenträger. LUN = einzelner Datenträger (beim Windows-Zielserver eine VHDX). Der Initiator meldet sich am Target an und sieht dann alle zugeordneten LUNs.
- A: A3 Wie ist ein IQN aufgebaut? Beispiel. | L: iqn.JJJJ-MM.umgekehrte-Domäne:eindeutiger-Name, z. B. iqn.1991-05.com.microsoft:exa-srv02.example.com. JJJJ-MM = Registrierung der Domäne.
- A: A4 In welchem Dateiformat speichert der iSCSI-Zielserver von Windows Server 2025 seine virtuellen Datenträger? | L: b) VHDX – fest, dynamisch erweiterbar oder differenzierend.
- A: A5 Nennen Sie vier Möglichkeiten, wie ein Target zugelassene Initiatoren identifizieren kann. | L: IQN, DNS-Name (FQDN), IP-Adresse (IPv4/IPv6), MAC-Adresse. Empfohlen: IQN, da unabhängig von IP-Änderungen.
- A: A6 Warum MPIO statt NIC-Teaming? | L: NIC-Teaming ist für iSCSI nicht unterstützt. MPIO arbeitet auf Speicherebene: jeder Pfad = eigene Sitzung, unterbrechungsfreier Failover und Lastverteilung (z. B. Round Robin).
- A: A7 Unterschied CHAP / Reverse CHAP? | L: CHAP: Target prüft Initiator (einseitig). Reverse CHAP: zusätzlich prüft Initiator das Target (gegenseitig, Schutz vor gefälschten Targets). Geheimnis 12–16 Zeichen.
- A: A8a Der Initiator muss unter Server 2025 nachinstalliert werden (R/F)? | L: Falsch – integriert, nur Dienst MSiSCSI starten.
- A: A8b Ein Target kann mehrere virtuelle Datenträger enthalten (R/F)? | L: Richtig – der Initiator sieht alle zugeordneten LUNs.
- A: A8c Jumbo Frames müssen auf allen Geräten im Pfad identisch sein (R/F)? | L: Richtig – unterschiedliche MTU führt zu Fragmentierung oder Paketverlust.
- A: A8d Auf iSCSI-NICs sollte ein Default-Gateway eingetragen werden (R/F)? | L: Falsch – iSCSI-Netze sind isoliert, ein Gateway führt zu falschem Routing.
- A: A8e Eine persistente Verbindung wird nach Neustart automatisch wiederhergestellt (R/F)? | L: Richtig – sie wird als bevorzugtes Ziel gespeichert.
- A: B1 Rolle iSCSI-Zielserver installieren und prüfen (SRV-ISCSI) | L: Install-WindowsFeature FS-iSCSITarget-Server -IncludeManagementTools; Kontrolle Get-WindowsFeature FS-iSCSITarget-Server (Installed) und Get-Service WinTarget (Running).
- A: B2 IQN des Initiators ermitteln (EXA-SRV02) | L: Set-Service MSiSCSI -StartupType Automatic; Start-Service MSiSCSI; (Get-InitiatorPort).NodeAddress – oder iscsicpl → Konfiguration → Initiatorname.
- A: B3 Zwei LUNs anlegen und Typwahl begründen | L: New-IscsiVirtualDisk ...LUN-Daten.vhdx -SizeBytes 100GB -UseFixed und ...LUN-Test.vhdx -SizeBytes 20GB. Fest = Platz sofort belegt, vorhersagbare Leistung (Produktion). Dynamisch = wächst mit Daten (Test), Füllstand überwachen.
- A: B4 Target TGT-EXA-SRV02 nur für EXA-SRV02, beide LUNs zuordnen | L: New-IscsiServerTarget -TargetName TGT-EXA-SRV02 -InitiatorIds "IQN:<IQN>"; zweimal Add-IscsiVirtualDiskTargetMapping. Status bleibt NotConnected bis zur Verbindung; TargetIqn notieren.
- A: B5 CHAP aktivieren – wo wird das Geheimnis am Initiator angegeben? | L: Am Target Set-IscsiServerTarget -EnableChap $true -Chap $cred. Am Initiator beim Verbinden: Connect-IscsiTarget -AuthenticationType ONEWAYCHAP -ChapUsername -ChapSecret bzw. iscsicpl → Verbinden → Erweitert → CHAP-Anmeldung aktivieren.
- A: B6 MPIO einrichten, zwei Pfade persistent, Nachweis | L: Install-WindowsFeature Multipath-IO; Enable-MSDSMAutomaticClaim -BusType iSCSI; Set-MSDSMGlobalDefaultLoadBalancePolicy -Policy RR; Neustart; zwei Portale + zwei Connect-IscsiTarget mit -IsPersistent $true -IsMultipathEnabled $true. Nachweis: Get-IscsiSession zeigt 2 Sitzungen mit unterschiedlicher InitiatorPortalAddress, mpclaim -s -d zeigt 2 Pfade mit Round Robin.
- A: B7 Datenträger online, GPT, Daten ReFS, Test NTFS | L: Set-Disk -IsOffline $false; Initialize-Disk -PartitionStyle GPT; New-Partition -UseMaximumSize -AssignDriveLetter \| Format-Volume -FileSystem ReFS bzw. NTFS. Jeder Datenträger darf nur einmal erscheinen.
- A: B8 LUN-Daten von 100 auf 150 GB vergrößern | L: SRV-ISCSI: Resize-IscsiVirtualDisk -SizeBytes 150GB. EXA-SRV02: Update-HostStorageCache, Get-PartitionSupportedSize, Resize-Partition auf SizeMax. Verkleinern nicht vorgesehen.
- A: C1 Ermittlung über 10.10.1.10 liefert keine Targets – Ursachen/Prüfbefehle? | L: Firewall/Netz blockiert TCP 3260 (Test-NetConnection -Port 3260); WinTarget gestoppt (Get-Service WinTarget); falsche Portal-/Initiator-IP oder Subnetz (Get-NetIPAddress, Get-IscsiTargetPortal); Initiator für kein Target freigegeben (Get-IscsiServerTarget \| fl InitiatorIds).
- A: C2 Target sichtbar, Login mit Authentifizierungsfehler – Ursachen? | L: IQN fehlt/falsch in InitiatorIds (z. B. nach Umbenennung); CHAP am Target aktiv, am Initiator nicht oder Name/Geheimnis falsch; Reverse CHAP am Initiator verlangt, am Target nicht konfiguriert. Lösung: IQN vergleichen, Set-IscsiServerTarget -InitiatorIds korrigieren, CHAP abgleichen.
- A: C3 iSCSI-Laufwerke nach Neustart verschwunden – Ursache/Lösung? | L: Verbindung nicht persistent. Get-IscsiSession \| Register-IscsiSession oder neu mit -IsPersistent $true verbinden; MSiSCSI auf Automatisch prüfen.
- A: C4 Datenträger erscheint doppelt, einer offline – Ursache? | L: Zwei Sitzungen, aber MPIO beansprucht iSCSI nicht. Get-WindowsFeature Multipath-IO, Get-MSDSMAutomaticClaimSettings, Enable-MSDSMAutomaticClaim -BusType iSCSI + Neustart, mpclaim -s -d. Doppelten Datenträger NICHT online schalten/formatieren.

## Karteikarten
- F: Standardport von iSCSI? | A: TCP 3260
- F: Was ist ein Initiator? | A: Der Client, der Blockspeicher über iSCSI anfordert (Windows: Dienst MSiSCSI, iscsicpl.exe)
- F: Was ist ein Target? | A: Zielobjekt auf dem iSCSI-Zielserver, das zugelassene Initiatoren und die zugeordneten LUNs festlegt
- F: Was ist eine LUN? | A: Logical Unit Number – ein einzelner Datenträger, den der Initiator sieht (beim Windows-Zielserver eine VHDX)
- F: Aufbau eines IQN? | A: iqn.JJJJ-MM.umgekehrte-Domäne:eindeutiger-Name
- F: Dienstname des iSCSI-Zielservers? | A: WinTarget
- F: Warum MPIO statt NIC-Teaming bei iSCSI? | A: NIC-Teaming ist für iSCSI nicht unterstützt; MPIO nutzt eine Sitzung pro Pfad, Failover ohne Unterbrechung plus Lastverteilung
- F: Was bedeutet Reverse CHAP? | A: Gegenseitige Authentifizierung – zusätzlich prüft der Initiator das Target
- F: Länge eines CHAP-Geheimnisses unter Windows? | A: 12 bis 16 Zeichen
- F: Warum kein Default-Gateway auf iSCSI-NICs? | A: Das iSCSI-Netz ist isoliert; ein Gateway führt zu falschem Routing
- F: Datenträger erscheint doppelt – Ursache? | A: MPIO beansprucht die iSCSI-Datenträger nicht, jeder Pfad wird als eigener Datenträger gesehen
- F: Laufwerke nach Neustart weg – Ursache? | A: Verbindung war nicht persistent (bevorzugtes Ziel)
- F: Feste vs. dynamische VHDX für LUNs? | A: Fest: Platz sofort belegt, planbare Leistung (Produktion); dynamisch: wächst mit Daten (Test)
- F: Ist iSCSI Block- oder Dateispeicher? | A: Blockspeicher (wie SAN), im Gegensatz zu SMB/NFS
- F: Mit welchem Befehl liest der Initiator eine vergrößerte LUN neu ein? | A: Update-HostStorageCache

## Quiz
? Welcher Port wird für iSCSI standardmäßig verwendet?
* TCP 3260
- TCP 445
- TCP 3389
- TCP 5985
! 445 = SMB, 3389 = RDP, 5985 = WinRM.

? In welchem Format legt der iSCSI-Zielserver von Windows Server 2025 LUNs ab?
* VHDX
- VMDK
- ISO
- QCOW2

? Welche Komponente legt fest, welche Initiatoren auf welche LUNs zugreifen dürfen?
* Das Target
- Der Initiator
- Das Portal
- Der MPIO-DSM

? Wie werden iSCSI-Pfade unter Windows redundant gemacht?
* Mit MPIO (je Pfad eine Sitzung)
- Mit NIC-Teaming (LBFO)
- Mit einem zweiten Default-Gateway
- Mit DFS-Replikation
! NIC-Teaming ist für iSCSI nicht unterstützt.

? Was ist bei Reverse CHAP anders als bei CHAP?
* Zusätzlich authentifiziert der Initiator das Target
- Das Geheimnis wird im Klartext übertragen
- Es ist nur eine IP-Filterung
- Das Target authentifiziert sich gar nicht mehr

? Nach einem Neustart fehlen die iSCSI-Laufwerke. Wahrscheinlichste Ursache?
* Die Verbindung wurde nicht persistent angelegt
- MPIO war installiert
- Die LUN war eine feste VHDX
- Port 3260 ist zu schnell

? Ein iSCSI-Datenträger erscheint doppelt in der Datenträgerverwaltung. Was ist richtig?
* MPIO beansprucht iSCSI nicht; den zweiten Datenträger nicht formatieren
- Es sind zwei verschiedene LUNs, beide formatieren
- Das ist normal und gewollt bei Round Robin
- CHAP ist falsch konfiguriert

? Welches Beispiel ist ein gültiger IQN?
* iqn.1991-05.com.microsoft:exa-srv02.example.com
- iqn.microsoft.com:1991-05:exa-srv02
- 10.10.1.21:3260
- eui.exa-srv02.example.com

? Welcher Befehl zeigt auf dem Initiator den eigenen IQN?
* (Get-InitiatorPort).NodeAddress
- Get-IscsiVirtualDisk
- Get-Service WinTarget
- mpclaim -s -d

? Welche Aussage zu Jumbo Frames bei iSCSI ist richtig?
* Sie müssen auf allen Geräten im Pfad gleich konfiguriert sein
- Sie dürfen nur am Target aktiviert werden
- Sie ersetzen MPIO
- Sie verschlüsseln den Verkehr

## Lücken
- iSCSI überträgt {SCSI}-Befehle über {TCP/IP} auf Port {3260}.
- Der Initiator-Dienst heißt {MSiSCSI}, der Dienst des Zielservers {WinTarget}.
- Für redundante Pfade nutzt man {MPIO}, nicht {NIC-Teaming}.
- Ein CHAP-Geheimnis ist {12} bis {16} Zeichen lang.

## Zuordnen
### Begriff und Bedeutung
- Initiator => Client, der Speicher anfordert
- Target => Freigabe mit Zugriffsliste und LUNs
- LUN => einzelner Datenträger (VHDX)
- IQN => weltweit eindeutiger iSCSI-Name
- Portal => IP-Adresse und Port für Discovery

## Reihenfolge
### iSCSI-Datenträger bereitstellen
1. Rolle iSCSI-Zielserver auf SRV-ISCSI installieren
2. IQN des Initiators ermitteln
3. Virtuelle Datenträger (VHDX) anlegen
4. Target erstellen und LUNs zuordnen
5. CHAP aktivieren
6. MPIO auf dem Initiator einrichten und neu starten
7. Persistent über beide Pfade verbinden
8. Datenträger online schalten, GPT, formatieren

## Freitext
- F: Erläutern Sie zwei Maßnahmen, um iSCSI-Verkehr abzusichern. | M: Eigenes isoliertes Speichernetz/VLAN ohne Gateway; CHAP bzw. Reverse CHAP zur Authentifizierung; Zugriff nur per IQN in den InitiatorIds; optional IPsec | P: 4
- F: Begründen Sie, warum ein Failover-Cluster gemeinsamen Speicher braucht und wie iSCSI hilft. | M: Bei Ausfall eines Knotens muss ein anderer dieselben Daten weiterverwenden; iSCSI stellt allen Knoten dieselben LUNs als Blockspeicher bereit (CSV) | P: 4

## Szenario
### Neuer Dateiserver mit iSCSI-Speicher
Die Schulungs-GmbH betreibt im Heimlabor example.com einen Dateiserver EXA-SRV02. Er braucht 150 GB zusätzlichen Speicher, der ausfallsicher über zwei Netze angebunden werden soll.
- F: Welche Rolle installieren Sie auf welchem Server? | A: iSCSI-Zielserver auf SRV-ISCSI; der Initiator auf EXA-SRV02 ist bereits integriert
- F: Wie stellen Sie sicher, dass nur EXA-SRV02 zugreift? | A: Target mit InitiatorIds = IQN von EXA-SRV02, zusätzlich CHAP
- F: Wie wird die Anbindung ausfallsicher? | A: MPIO mit zwei Sitzungen über 10.10.1.0/24 und 10.10.2.0/24, Richtlinie Round Robin
- F: Welcher Datenträgertyp für Produktion? | A: Feste VHDX

## Spickzettel
- Port 3260, Block-Speicher über TCP/IP
- Initiator (MSiSCSI) → Target (WinTarget) → LUN (VHDX)
- IQN: iqn.1991-05.com.microsoft:host
- Redundanz: MPIO (RR), nie NIC-Teaming
- Kein Gateway, gleiche MTU, eigenes VLAN
- CHAP 12–16 Zeichen, Reverse CHAP = gegenseitig
- Persistent verbinden, sonst nach Neustart weg
- Doppelte Platte = MPIO fehlt → nicht formatieren
