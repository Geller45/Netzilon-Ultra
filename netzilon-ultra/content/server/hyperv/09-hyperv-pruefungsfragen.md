---
id: server-hyperv-pruefungsfragen
bereich: AZ-800
block: HV
kapitel: Hyper-V vertieft
titel: Prüfungsfragen Hyper-V – Nested, Generationen, Prüfpunkte, Ressourcen, vSwitch
typ: fragen
stufe: Fortgeschritten
fach: Windows Server / AZ-800
pruefungen: [AZ-800, AP2, Schule]
quellen: [Microsoft Learn – Hyper-V-Dokumentation, AZ-800 Study Guide]
verweise: [server-hyperv-nested-grundlagen, server-hyperv-nested-netzwerk, server-hyperv-nested-einschraenkungen, server-hyperv-generationen, server-hyperv-pruefpunkte-vertieft, server-hyperv-dynamic-memory, server-hyperv-vswitch-vlan, server-hyperv-nested-lab, az800-nested]
---

## Quiz

? Sie müssen auf dem Host HV01 die VM LAB-HV so vorbereiten, dass darin Hyper-V installiert werden kann. Die VM läuft. Welche zwei Schritte sind nötig und in welcher Reihenfolge?
* Stop-VM LAB-HV, dann Set-VMProcessor -VMName LAB-HV -ExposeVirtualizationExtensions $true
- Set-VMProcessor -ExposeVirtualizationExtensions $true, dann Restart-VM
- Set-VMHost -VirtualizationExtensions $true, dann Stop-VM
- Enable-WindowsOptionalFeature Hyper-V auf dem Host, dann Start-VM
! Die Einstellung lässt sich nur bei ausgeschalteter VM ändern.
@ Nested Virtualization

? Welche Prozessorvoraussetzung gilt für Nested Virtualization auf Intel-Hosts?
* VT-x mit EPT
- VT-d mit SR-IOV
- AES-NI und AVX-512
- Hyper-Threading mit mindestens 8 Kernen
! EPT (SLAT) ist Pflicht; VT-d ist für Gerätedurchreichung, nicht für Nested.
@ Nested Virtualization

? Ein Unternehmen nutzt Hosts mit AMD EPYC und Windows Server 2019. Nested Virtualization funktioniert nicht. Was ist die Lösung?
* Hosts auf Windows Server 2022 oder neuer aktualisieren
- MAC-Spoofing aktivieren
- Die VMs auf Generation 1 umstellen
- Dynamic Memory deaktivieren
! AMD wird erst ab Windows Server 2022 / Windows 11 für Nested unterstützt.
@ Nested Virtualization

? Welche VM-Konfigurationsversion ist mindestens für Nested Virtualization auf Intel erforderlich?
* 8.0
- 5.0
- 7.0
- 10.0
! Ältere VMs mit Update-VMVersion anheben.
@ Nested Virtualization

? Welche Ebene bezeichnet bei Nested Virtualization den Gast-Hypervisor?
* L1
- L0
- L2
- L3
! L0 = physischer Host, L1 = äußere VM mit Hyper-V, L2 = innere VM.
@ Nested Virtualization

? Innere VMs in HV-NESTED (auf eigenem Hyper-V-Host) sollen Adressen vom Firmen-DHCP erhalten. Was konfigurieren Sie?
* MAC-Spoofing an der vNIC von HV-NESTED auf dem Host und einen externen vSwitch in HV-NESTED
- NAT mit New-NetNat in HV-NESTED
- Einen privaten Switch auf dem Host
- DHCP-Guard an der vNIC von HV-NESTED
! Mit MAC-Spoofing hängen die inneren VMs im selben Layer-2-Netz wie das LAN.
@ Nested Netzwerk

? Sie betreiben Hyper-V in einer Azure-VM. Wie erhalten die inneren VMs Internetzugang?
* Interner vSwitch, IP auf vEthernet als Gateway und New-NetNat in der Azure-VM
- MAC-Spoofing an der Azure-NIC
- Externer vSwitch in der Azure-VM mit Azure-DHCP
- Azure Bastion für jede innere VM
! MAC-Spoofing ist in Azure nicht möglich; NAT ist der dokumentierte Weg.
@ Nested Netzwerk

? Welches Cmdlet legt in der äußeren VM das NAT-Netz 172.16.0.0/24 an?
* New-NetNat -Name NestedNAT -InternalIPInterfaceAddressPrefix 172.16.0.0/24
- New-VMSwitch -SwitchType NAT -NATSubnetAddress 172.16.0.0/24
- New-NetRoute -DestinationPrefix 172.16.0.0/24
- Set-NetNat -Enable 172.16.0.0/24
! Der Switch-Typ NAT existierte nur in Vorschauversionen; heute: interner Switch plus New-NetNat.
@ Nested Netzwerk

? Was müssen Sie bei NAT für innere VMs bezüglich der IP-Vergabe beachten?
* WinNAT vergibt keine Adressen – statische IPs oder ein eigener DHCP-Server sind nötig
- WinNAT vergibt automatisch Adressen aus dem Präfix
- Die inneren VMs erhalten Adressen vom Azure-DHCP
- Die inneren VMs nutzen APIPA als Gateway
! New-NetNat übersetzt nur Adressen; DHCP muss separat bereitgestellt werden.
@ Nested Netzwerk

? Sie wollen den Arbeitsspeicher von HV-NESTED (Hyper-V läuft darin) im Betrieb erhöhen. Was ist richtig?
* Das ist nicht möglich; die VM muss heruntergefahren werden
- Mit Set-VMMemory -StartupBytes sofort möglich
- Nur wenn Dynamic Memory aktiv ist
- Nur über Smart Paging
! Mit aktivem Gast-Hypervisor sind Laufzeit-Größenänderungen des Speichers nicht möglich.
@ Nested Einschränkungen

? Welche Aussage über Dynamic Memory an einer VM mit laufendem Gast-Hypervisor ist korrekt?
* Es kann aktiviert sein, aber der zugewiesene Speicher ändert sich nicht
- Es ist Voraussetzung für Nested
- Es verteilt Speicher automatisch an die L2-VMs
- Es wird beim Start automatisch auf statisch umgestellt und die VM neu gestartet
! Microsoft: Der Speicher fluktuiert nicht, solange Hyper-V in der VM läuft.
@ Nested Einschränkungen

? Welche Operation ist für eine äußere VM mit aktivem Gast-Hypervisor NICHT unterstützt?
* Live-Migration
- Herunterfahren
- Export im ausgeschalteten Zustand
- Ändern der vCPU-Anzahl im ausgeschalteten Zustand
! Nur Offline-Migration ist möglich.
@ Nested Einschränkungen

? Warum muss für Credential Guard in einer VM Nested Virtualization aktiviert sein?
* VBS benötigt selbst einen Hypervisor und damit VT-x/AMD-V im Gast
- Credential Guard funktioniert nur auf Gen-1-VMs
- Credential Guard benötigt MAC-Spoofing
- Credential Guard ersetzt den Integrationsdienst Sicherung
! Virtualisierungsbasierte Sicherheit isoliert Geheimnisse mithilfe des Hypervisors.
@ Nested Einschränkungen

? Welche Gerätezuweisung ist für innere (L2-)VMs nicht verfügbar?
* Discrete Device Assignment
- Virtuelle SCSI-Controller
- Synthetische Netzwerkkarten
- Virtuelle DVD-Laufwerke
! Physische Geräte lassen sich nicht über zwei Hypervisor-Ebenen durchreichen.
@ Nested Einschränkungen

? Eine CentOS-/RHEL-VM (Gen 2) bootet wegen Secure Boot nicht. Welche Einstellung behebt das, ohne Secure Boot abzuschalten?
* Set-VMFirmware -SecureBootTemplate MicrosoftUEFICertificateAuthority
- Set-VMFirmware -SecureBootTemplate MicrosoftWindows
- Set-VMBios -EnableSecureBoot Off
- Set-VM -Generation 1
! Linux-Bootloader sind über die Microsoft UEFI CA signiert.
@ Generationen

? Welche Funktion ist nur in Generation-2-VMs verfügbar?
* Virtuelles TPM
- Dynamic Memory
- Prüfpunkte
- Integrationsdienste
! vTPM, Secure Boot und Shielded VMs gibt es nur in Gen 2.
@ Generationen

? Eine Gen-1-VM soll per PXE installiert werden. Welche Hardware wird benötigt?
* Ältere Netzwerkkarte (Legacy Network Adapter)
- Synthetische Netzwerkkarte mit SR-IOV
- Ein virtueller Fibre-Channel-Adapter
- Ein vTPM
! Das BIOS der Gen-1-VM unterstützt PXE nur über die emulierte Karte.
@ Generationen

? Wie wandeln Sie eine produktive Gen-1-VM in eine Gen-2-VM um?
* Gar nicht direkt: Datenträger im Gast auf GPT konvertieren und an eine neu angelegte Gen-2-VM hängen
- Set-VM -Generation 2
- Update-VMVersion -Generation 2
- Convert-VHD -VHDType Gen2
! Die Generation ist nach dem Erstellen unveränderlich.
@ Generationen

? Welches Gastbetriebssystem erzwingt Generation 1?
* Ein 32-Bit-Betriebssystem
- Windows Server 2022
- Windows 11
- Ubuntu 24.04
! Gen 2 setzt 64-Bit-UEFI-Unterstützung voraus.
@ Generationen

? Welche Voraussetzung hat Enable-VMTPM?
* Ein Schlüsselschutz, z. B. Set-VMKeyProtector -NewLocalKeyProtector
- Eine Konfigurationsversion unter 8.0
- Ein externer vSwitch
- Deaktivierter Secure Boot
! Der vTPM-Zustand wird durch den Key Protector geschützt.
@ Generationen

? Von welchem Controller startet eine Gen-2-VM?
* SCSI
- IDE
- Diskette
- USB
! Gen 2 hat keinen IDE-Controller.
@ Generationen

? Was unterscheidet einen Produktionsprüfpunkt von einem Standardprüfpunkt?
* Er nutzt VSS bzw. fsfreeze im Gast und speichert keinen Arbeitsspeicher
- Er speichert zusätzlich den Arbeitsspeicher
- Er ist nur für Linux-VMs verfügbar
- Er ersetzt eine Sicherung auf einem anderen Speicher
! Produktionsprüfpunkte sind anwendungskonsistent; nach dem Anwenden startet die VM neu.
@ Prüfpunkte

? Welche CheckpointType-Einstellung erstellt bei Fehlern des Produktionsprüfpunkts KEINEN Standardprüfpunkt?
* ProductionOnly
- Production
- Standard
- Disabled
! Production fällt auf Standard zurück, ProductionOnly bricht ab.
@ Prüfpunkte

? Ein Admin löscht einen Prüfpunkt einer laufenden VM. Was passiert?
* Die AVHDX wird zusammengeführt; die aktuellen Daten bleiben erhalten
- Die VM wird auf den Prüfpunkt zurückgesetzt
- Alle Änderungen seit dem Prüfpunkt gehen verloren
- Die VM wird exportiert
! Löschen entfernt nur den Rücksprungpunkt.
@ Prüfpunkte

? Wie schützt Windows Server einen virtualisierten DC beim Anwenden eines Prüfpunkts vor USN-Rollback?
* Über die VM-GenerationID – der DC setzt eine neue InvocationID und verwirft den RID-Pool
- Über automatische Prüfpunkte
- Über DHCP-Guard
- Über die Konfigurationsversion 8.0
! Seit Server 2012 erkennt der DC über die geänderte GenerationID das Zurücksetzen.
@ Prüfpunkte

? Auf welchen Systemen sind automatische Prüfpunkte standardmäßig aktiviert?
* Hyper-V unter Windows 10/11
- Windows Server 2022/2025
- Nur Azure Stack HCI
- Nur in Nested-VMs
! Auf Servern sind sie standardmäßig deaktiviert.
@ Prüfpunkte

? Welche Datei eines Prüfpunkts enthält die Datenträgeränderungen seit dem Prüfpunkt?
* .avhdx
- .vmcx
- .vmrs
- .vmgs
! Die AVHDX ist ein Differenzierungsdatenträger mit Verweis auf das Elternteil.
@ Prüfpunkte

? Was ist der sicherste Weg, eine äußere Nested-VM mit laufenden inneren VMs per Prüfpunkt zu sichern?
* Innere VMs und die äußere VM herunterfahren, dann den Prüfpunkt erstellen
- Standardprüfpunkt im laufenden Betrieb
- Save-VM und VHDX kopieren
- Automatische Prüfpunkte aktivieren
! Speicherzustände mit laufendem Gast-Hypervisor sind nicht zuverlässig sicherbar.
@ Prüfpunkte

? Was beschreibt der Arbeitsspeicherpuffer bei Dynamic Memory?
* Prozentuale Reserve über dem aktuellen Bedarf (Standard 20 %)
- Feste Menge RAM für das Host-Betriebssystem
- Mindest-RAM beim Start
- Größe der Smart-Paging-Datei
! Einstellbar von 5 bis 2000 %.
@ Dynamic Memory

? In welcher Situation verwendet Hyper-V Smart Paging?
* Beim Neustart einer VM mit Minimum < Start, wenn physischer RAM fehlt
- Bei jeder Live-Migration
- Wenn der Gast eine Auslagerungsdatei fehlt
- Bei Speicherdruck im Normalbetrieb
! Smart Paging überbrückt nur den Neustart.
@ Dynamic Memory

? Welche Einstellung ist an einer VM mit Dynamic Memory im laufenden Betrieb änderbar?
* Minimum senken
- Dynamic Memory deaktivieren
- Startwert ändern
- Generation ändern
! Minimum senken und Maximum erhöhen funktionieren online.
@ Dynamic Memory

? Warum sollte eine große SQL-Server-VM mit NUMA-Optimierung keinen Dynamic Memory nutzen?
* Mit Dynamic Memory wird kein virtuelles NUMA bereitgestellt
- Dynamic Memory ist für SQL Server verboten
- Dynamic Memory erfordert Gen 1
- SQL Server kann keine Ballooning-Treiber laden
! Die VM sieht mit Dynamic Memory nur einen NUMA-Knoten.
@ Dynamic Memory

? Welcher Parameter garantiert einer VM einen Mindestanteil an CPU-Leistung?
* Set-VMProcessor -Reserve
- Set-VMProcessor -Maximum
- Set-VMProcessor -RelativeWeight
- Set-VMProcessor -CompatibilityForMigrationEnabled
! Reserve = Garantie, Maximum = Limit, RelativeWeight = Priorität.
@ Ressourcen

? Wie heißt die PowerShell-Eigenschaft für die Arbeitsspeichergewichtung?
* -Priority bei Set-VMMemory
- -RelativeWeight bei Set-VMMemory
- -MemoryWeight bei Set-VM
- -Buffer bei Set-VMProcessor
! Bereich 0–100, Standard 50.
@ Ressourcen

? Welcher Switch-Typ erlaubt Kommunikation zwischen VMs und dem Host, aber nicht mit dem physischen Netz?
* Intern
- Privat
- Extern
- SET
! Privat schließt auch den Host aus.
@ vSwitch

? Eine VM soll in VLAN 30 arbeiten, ohne selbst VLAN-Tags zu verarbeiten. Welcher Befehl?
* Set-VMNetworkAdapterVlan -VMName APP01 -Access -VlanId 30
- Set-VMNetworkAdapterVlan -VMName APP01 -Trunk -AllowedVlanIdList 30
- Set-VMSwitch -VlanId 30
- Set-NetAdapter -VlanID 30 im Gast
! Im Access-Modus taggt der vSwitch; der Gast sieht keine Tags.
@ vSwitch

? Welche Port-Schutzfunktion verwirft Router Advertisements einer VM?
* Router-Guard
- DHCP-Guard
- MAC-Spoofing
- Port-Mirroring
! Schützt vor falschen Gateways (IPv6-RA, Redirects).
@ vSwitch

? Welche Aussage zu Switch Embedded Teaming ist richtig?
* SET bündelt bis zu 8 identische NICs switch-unabhängig im vSwitch
- SET benötigt LACP am physischen Switch
- SET unterstützt Standby-Adapter
- SET ist nur in Windows 11 verfügbar
! Lastverteilung Hyper-V-Port oder Dynamisch, kompatibel mit RDMA.
@ vSwitch

? Eine äußere Nested-VM soll innere VMs in VLAN 10 und 20 betreiben. Wie konfigurieren Sie ihre vNIC auf L0?
* Trunk mit AllowedVlanIdList 10,20 und MAC-Spoofing
- Access-VLAN 10 und Router-Guard
- Privater Switch ohne VLAN
- DHCP-Guard und Port-Mirroring
! Die inneren VMs taggen selbst; L0 muss Tags und fremde MACs durchlassen.
@ vSwitch

? Im Nested-Cluster-Lab soll der iSCSI-Zielserver nur HVN1 und HVN2 bedienen. Wo konfigurieren Sie das?
* In den InitiatorIds des iSCSI-Ziels (IQNs der Knoten)
- In der Windows-Firewall von HV01
- Im Datenträgerzeugen
- Über MAC-Spoofing
! InitiatorIds entsprechen dem LUN-Masking beim iSCSI-Zielserver.
@ Nested Lab

? Welcher Schritt muss im Nested-Cluster-Lab vor New-Cluster erfolgen?
* Test-Cluster (Validierung) mit beiden Knoten
- Add-ClusterSharedVolume
- Set-ClusterQuorum
- Add-ClusterVirtualMachineRole
! CSV, Quorum und Rollen werden erst nach der Clustererstellung konfiguriert.
@ Nested Lab

? Clusterte innere VMs im Nested-Lab haben kein Netzwerk. Was ist die wahrscheinlichste Ursache?
* MAC-Spoofing an den vNICs der Nested-Knoten fehlt
- Der Datenträgerzeuge fehlt
- Das CSV ist mit ReFS formatiert
- Die inneren VMs sind Gen 2
! Ohne MAC-Spoofing verwirft der vSwitch auf L0 Frames mit den MACs der inneren VMs.
@ Nested Lab

? Wie viele Stimmen hat ein Zwei-Knoten-Cluster mit Datenträgerzeugen und wie viele Knoten dürfen ausfallen?
* Drei Stimmen, ein Knoten darf ausfallen
- Zwei Stimmen, kein Knoten darf ausfallen
- Drei Stimmen, zwei Knoten dürfen ausfallen
- Vier Stimmen, ein Knoten darf ausfallen
! Der Zeuge liefert die entscheidende dritte Stimme.
@ Nested Lab

? Welcher Befehl migriert die Clusterrolle INNER01 ohne Unterbrechung auf HVN2?
* Move-ClusterVirtualMachineRole -Name INNER01 -Node HVN2 -MigrationType Live
- Move-VM -Name INNER01 -DestinationHost HVN2 -Quick
- Move-ClusterGroup -Name INNER01 -Node HVN2 -Offline
- Export-VM -Name INNER01 -Path \\HVN2\VMs
! Clusterrollen werden über die Cluster-Cmdlets verschoben.
@ Nested Lab

? Ein Kollege möchte das Nested-Lab auf einem Notebook mit Windows 11 Home betreiben. Was ist das Problem?
* Windows 11 Home enthält keine Hyper-V-Rolle
- Windows 11 unterstützt keine Gen-2-VMs
- Nested ist nur auf Windows Server möglich
- Windows 11 unterstützt kein NAT
! Hyper-V gibt es in Windows 11 Pro, Enterprise und Education.
@ Nested Virtualization

? Welche Aussage über Nested Virtualization und VM-Generationen ist richtig?
* Nested funktioniert mit Gen-1- und Gen-2-VMs; Gen 2 wird für Labs empfohlen
- Nested funktioniert nur mit Gen 1
- Nested funktioniert nur mit Gen 2 und vTPM
- Nested erfordert Secure Boot mit der Vorlage OpenSourceShieldedVM
! Gen 2 bietet zusätzlich Secure Boot und vTPM für VBS-Szenarien im Gast.
@ Generationen

? Ein Admin prüft mit Get-VM die Spalte „Version“ einer VM und sieht 5.0. Welche Folge hat das für Nested?
* Nested ist erst nach Update-VMVersion möglich
- Nested funktioniert, aber nur mit AMD
- Die VM muss neu installiert werden
- Version 5.0 ist die Mindestversion
! Konfigurationsversion 5.0 stammt aus Server 2012 R2; mindestens 8.0 ist nötig.
@ Nested Virtualization
