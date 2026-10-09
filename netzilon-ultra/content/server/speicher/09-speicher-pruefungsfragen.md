---
id: server-speicher-pruefungsfragen
bereich: AP2
block: SP
kapitel: Speicher & SAN vertieft
titel: Prüfungsfragen Speicher & SAN – gemischt mit RAID-Rechenaufgaben
stufe: Profi
typ: fragen
fach: [ITK / Grundlagen, Windows Server / AZ-800]
pruefungen: [AP1, AP2, AZ-800, Schule]
quellen: [SAN_Präsentation.pdf, Microsoft Learn – iSCSI/MPIO/Storage Spaces, SNIA-Grundlagen]
verweise: [server-speicher-das-nas-san, server-speicher-iscsi, server-speicher-fibre-channel, server-speicher-lun-zoning, server-speicher-mpio, server-speicher-raid, server-speicher-storage-spaces, server-speicher-funktionen]
---

## Quiz
? Welche Speicherarchitektur stellt Dateien über SMB oder NFS im LAN bereit?
* NAS
- SAN
- DAS
- FCoE
! NAS arbeitet auf Dateiebene; das Dateisystem liegt im NAS.

? Wo liegt beim SAN das Dateisystem einer LUN?
* Im Server, der die LUN eingebunden hat
- Im FC-Switch der Fabric (Name Server)
- Im NAS-Kopf vor dem Array
- Im Array-Controller als NTFS-Volume
! Das Array liefert nur Blöcke; der Server formatiert die LUN selbst.

? Welche Kombination aus Protokoll und Port ist richtig?
* iSCSI – TCP 3260
- SMB – TCP 3260
- NFS – TCP 445
- iSNS – TCP 2049
! SMB 445, NFS 2049, iSCSI 3260, iSNS 3205.

? Welches Blockprotokoll ist ohne IP-Kopf und daher nicht routbar?
* FCoE
- iSCSI
- NVMe/TCP
- SMB 3
! FCoE kapselt FC-Rahmen direkt in Ethernet (Ethertype 0x8906).

? Ein Unternehmen braucht für einen Hyper-V-Failover-Cluster gemeinsamen Speicher, hat Ethernet-Know-how und ein knappes Budget. Was passt am besten?
* iSCSI-SAN über ein getrenntes Speichernetz
- Fibre-Channel-SAN mit zwei Fabrics
- USB-Festplatten an jedem Host
- Eine SMB-Freigabe auf einem Client-PC
! iSCSI nutzt vorhandenes Ethernet und liefert gemeinsamen Blockspeicher für CSV.

? Welcher IQN ist formal korrekt?
* iqn.2026-01.com.example:fs01-target
- iqn.example.com:2026-01:fs01
- iqn-2026.01.com.example/fs01
- iqn.01-2026.com.example:fs01
! iqn. + Jahr-Monat + umgekehrte Domain + Doppelpunkt + eindeutiger Teil.

? Welche Rolle hat ein Hyper-V-Host, der eine iSCSI-LUN einbindet?
* Initiator
- Target
- Portal
- iSNS-Server
! Initiator fragt, Target liefert.

? Was leistet CHAP bei iSCSI nicht?
* Verschlüsselung der übertragenen Daten
- Authentifizierung des Initiators
- Gegenseitige Authentifizierung bei Mutual CHAP
- Schutz des Geheimnisses durch Challenge-Response
! Für Vertraulichkeit braucht es ein getrenntes Netz oder IPsec.

? Welches Cmdlet ordnet auf dem Windows-iSCSI-Zielserver eine VHDX einem Target zu?
* Add-IscsiVirtualDiskTargetMapping
- Connect-IscsiTarget
- New-IscsiTargetPortal
- Enable-MSDSMAutomaticClaim
! Reihenfolge: New-IscsiVirtualDisk, New-IscsiServerTarget, Add-IscsiVirtualDiskTargetMapping.

? Welche MTU testet man mit ping -f -l 8972?
* 9000 Byte (Jumbo Frames)
- 1500 Byte (Standard-Ethernet)
- 8972 Byte (wie angegeben)
- 2148 Byte (FC-Rahmen)
! 8972 + 20 Byte IP-Kopf + 8 Byte ICMP-Kopf = 9000.

? Welche FC-Schicht ist für Rahmenaufbau und Flusskontrolle zuständig?
* FC-2
- FC-0
- FC-3
- FC-4
! FC-2 regelt Framing und Buffer-to-Buffer-Credits.

? Was ist ein WWPN?
* Die 64-Bit-Kennung eines einzelnen FC-Ports
- Die IP-Adresse eines FC-Switches in der Fabric
- Die 64-Bit-Kennung des gesamten FC-Geräts (Knoten)
- Die Seriennummer einer LUN auf dem Array
! Der WWNN benennt das ganze Gerät, der WWPN den einzelnen Port.

? Welche FC-Topologie teilt die Bandbreite unter bis zu 127 Ports?
* Arbitrated Loop
- Switched Fabric
- Point-to-Point
- Converged Fabric
! FC-AL ist heute Legacy; Standard ist Switched Fabric.

? Welche Funktionen von DCB sind für FCoE wichtig?
* PFC und ETS
- CHAP und IPsec
- STP und VTP
- NAT und PAT
! PFC (802.1Qbb) verhindert Verluste, ETS (802.1Qaz) teilt Bandbreite zu.

? Wo wird Zoning konfiguriert?
* Auf dem FC-Switch
- Auf dem Speicher-Array
- Im iSCSI-Initiator
- In der Datenträgerverwaltung
! Zoning am Switch, Masking am Array.

? Ein Host sieht den Array-Port, aber keine Platte. Was fehlt am wahrscheinlichsten?
* LUN-Masking/Mapping auf dem Array
- Eine passende Zone auf dem FC-Switch
- Ein zweites Netzteil im Array
- Die DNS-Registrierung des Hosts
! Wäre das Zoning falsch, sähe der Host den Array-Port gar nicht.

? Welches Zoning bleibt beim Umstecken auf einen anderen Switch-Port gültig?
* WWN-Zoning
- Port-Zoning
- Domain,Port-Zoning
- Kein Zoning
! WWN-Zonen folgen dem Gerät, Port-Zonen dem Kabel.

? Was ist Best Practice beim Zoning?
* Single-Initiator-Zoning
- Alle Initiatoren in einer Zone
- Nur Port-Zoning ohne Aliase
- Zonen nur auf einem der beiden Switches
! Ein Initiator je Zone begrenzt Störungen und RSCN-Meldungen.

? Was passiert ohne MPIO, wenn eine LUN über zwei Pfade erreichbar ist?
* Sie erscheint als zwei separate Datenträger
- Sie wird automatisch zu einem RAID 1
- Sie ist unsichtbar
- Sie wird doppelt so schnell
! MPIO fasst die Pfade zu einem Pseudo-Datenträger zusammen.

? Welche MPIO-Richtlinie bietet nur Ausfallsicherheit ohne Lastverteilung?
* Failover Only
- Round Robin
- Least Queue Depth
- Least Blocks
! Bei FOO ist nur ein Pfad aktiv.

? Welcher Befehl aktiviert die automatische MPIO-Beanspruchung für iSCSI?
* Enable-MSDSMAutomaticClaim -BusType iSCSI
- mpclaim -s -d
- Set-MPIOSetting -iSCSI On
- Install-WindowsFeature iSCSI-MPIO
! Danach ist ein Neustart nötig; für FC gibt es keinen automatischen Bustyp-Claim.

? Welche Redundanzlösung ist für iSCSI-Adapter nicht unterstützt?
* NIC-Teaming
- MPIO
- Zwei getrennte Subnetze
- Zwei Switches
! Microsoft unterstützt für iSCSI nur MPIO als Redundanzmechanismus.

? RAID 5 aus 5 Platten à 3 TB – wie groß ist die Nutzkapazität?
* 12 TB
- 15 TB
- 9 TB
- 7,5 TB
! (5 − 1) × 3 TB = 12 TB.

? RAID 6 aus 8 Platten à 4 TB – wie groß ist die Nutzkapazität?
* 24 TB
- 28 TB
- 16 TB
- 32 TB
! (8 − 2) × 4 TB = 24 TB.

? RAID 10 aus 10 Platten à 2 TB – wie groß ist die Nutzkapazität?
* 10 TB
- 18 TB
- 16 TB
- 20 TB
! n/2 × C = 10/2 × 2 TB = 10 TB.

? RAID 50 aus 12 Platten à 2 TB in 3 Gruppen à 4 Platten – Nutzkapazität?
* 18 TB
- 22 TB
- 20 TB
- 12 TB
! (n − g) × C = (12 − 3) × 2 TB = 18 TB.

? RAID 60 aus 12 Platten à 4 TB in 2 Gruppen à 6 Platten – Nutzkapazität?
* 32 TB
- 40 TB
- 44 TB
- 24 TB
! (n − 2g) × C = (12 − 4) × 4 TB = 32 TB.

? Ein RAID 5 besteht aus 4 × 4 TB und 1 × 2 TB. Wie groß ist es nutzbar?
* 8 TB
- 16 TB
- 18 TB
- 10 TB
! Die kleinste Platte zählt: (5 − 1) × 2 TB = 8 TB.

? Wie viele 10-TB-Platten braucht ein RAID 6 für mindestens 50 TB netto?
* 7
- 5
- 6
- 10
! (n − 2) × 10 ≥ 50 → n − 2 ≥ 5 → n = 7.

? Ein Server hat RAID 5 aus 4 Platten plus eine Hot Spare (alle 8 TB). Nutzkapazität?
* 24 TB
- 32 TB
- 40 TB
- 16 TB
! Die Hot Spare zählt nicht: (4 − 1) × 8 TB = 24 TB.

? Welche RAID-Stufe übersteht zwei beliebige gleichzeitige Plattenausfälle?
* RAID 6
- RAID 5
- RAID 10
- RAID 0
! RAID 10 übersteht zwei Ausfälle nur, wenn sie in verschiedenen Spiegelpaaren liegen.

? Warum ist RAID 5 bei sehr großen Platten riskant?
* Ein URE beim langen Rebuild ist nicht mehr ausgleichbar
- RAID 5 kann keine Platten über 4 TB adressieren
- RAID 5 hat keine Parität und damit keine Redundanz
- RAID 5 benötigt bei großen Platten mindestens 8 Laufwerke
! Bei 1 URE pro 10^14 Bit sind schon nach etwa 12,5 TB gelesener Daten Fehler statistisch zu erwarten.

? Was verhindert das RAID-Write-Hole am wirksamsten?
* Controller-Cache mit BBU/Flash-Sicherung und Journaling
- Eine größere Stripe-Größe auf allen Platten
- RAID 0 statt RAID 5, da ohne Parität
- Regelmäßige Defragmentierung der Volumes
! Das Write Hole entsteht durch Stromausfall zwischen Daten- und Paritätsschreibvorgang.

? Wie viele Platten braucht ein 2-Wege-Mirror in Storage Spaces mindestens?
* 2
- 3
- 5
- 7
! 3-Wege-Mirror: 5, Parity: 3, Dual Parity: 7 Platten (Einzelserver).

? Welche Bereitstellungsart ist Voraussetzung für Storage-Spaces-Tiering?
* Fixed
- Thin
- Dynamisch erweiterbar
- Differenzierend
! Speicherebenen funktionieren nur mit fest bereitgestellten Datenträgern.

? Wie viele Knoten darf ein Storage-Spaces-Direct-Cluster haben?
* 2 bis 16
- 1 bis 4
- 3 bis 64
- genau 2
! S2D benötigt Windows Server Datacenter und mindestens 2 Knoten.

? Welche Speicherresilienz ist für VM-Festplatten in Storage Spaces am besten geeignet?
* Mirror
- Simple
- Parity
- Dual Parity
! Parity ist bei zufälligen Schreibzugriffen langsam; Simple hat keinen Schutz.

? Was ist das größte Risiko von Thin Provisioning?
* Der Pool läuft unbemerkt voll, Datenträger fallen aus
- Daten werden grundsätzlich doppelt gespeichert
- Snapshots sind auf Thin-Datenträgern unmöglich
- Die Latenz verdoppelt sich bei jedem Zugriff
! Füllstand mit Schwellenwerten überwachen.

? Mit welchem Datenverlust (RPO) ist bei synchroner Replikation zu rechnen?
* 0
- 5 Minuten
- 1 Stunde
- 1 Tag
! Jeder Schreibvorgang wird erst nach Bestätigung beider Seiten abgeschlossen.

? Ein System schafft 25 000 IOPS bei 4 KB. Wie hoch ist der Durchsatz?
* 100 MB/s
- 25 MB/s
- 400 MB/s
- 1 000 MB/s
! 25 000 × 4 KB = 100 000 KB/s = 100 MB/s.

? Wie viele Back-End-IOPS entstehen bei 3 000 Front-End-IOPS, 50 % Schreiben, RAID 6?
* 10 500
- 3 000
- 6 000
- 18 000
! 1 500 + 1 500 × 6 = 10 500.

? Was ist der Hauptunterschied zwischen Snapshot und Backup?
* Backup auf getrenntem Medium, Snapshot auf demselben System
- Ein Snapshot ist immer größer als ein Vollbackup
- Backups lassen sich nur vollständig, nie einzeln wiederherstellen
- Snapshots funktionieren nur bei NAS, nicht bei SAN
! Fällt das Array aus, sind die Snapshots mit verloren.

? Welche Daten lassen sich durch Deduplizierung am besten reduzieren?
* Viele VDI-Festplatten mit demselben Betriebssystem
- Verschlüsselte Datenbank-Backups mit Zufallsschlüssel
- Bereits komprimierte Videos (H.264/H.265)
- Zufallsdaten aus einem Rauschgenerator
! Identische Chunks werden nur einmal gespeichert – bei VDI sind Einsparungen bis 90 % möglich.

? Ein Datenbestand von 8 TB wächst jährlich um 25 %. Wie groß ist er nach 2 Jahren?
* 12,5 TB
- 12,0 TB
- 10,0 TB
- 16,0 TB
! 8 × 1,25² = 8 × 1,5625 = 12,5 TB.

? Welche Aussage zur Speicherredundanz ist richtig?
* RAID, Snapshots und Replikation ersetzen kein Backup
- RAID 6 macht ein Backup überflüssig
- Synchrone Replikation schützt vor Ransomware
- Snapshots auf demselben Array sind ein Offsite-Backup
! Alle drei übertragen Fehler, Löschungen oder Verschlüsselung bzw. liegen am selben Ort.
