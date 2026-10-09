---
id: server-speicher-iscsi
bereich: AP2
block: SP
kapitel: Speicher & SAN vertieft
titel: iSCSI vertieft – IQN, Discovery, CHAP, Zielserver unter Windows und Speichernetz-Design
stufe: Fortgeschritten
fach: Windows Server / AZ-800
pruefungen: [AP2, AZ-800, Schule]
quellen: [SAN_Präsentation.pdf, Microsoft Learn – iSCSI/MPIO/Storage Spaces, SNIA-Grundlagen]
verweise: [server-iscsi, server-san, az800-datentraeger, server-speicher-das-nas-san, server-speicher-mpio, server-speicher-lun-zoning, az801-failover-cluster]
---

## Profi

### Grundprinzip
**iSCSI** (*Internet Small Computer System Interface*, RFC 7143) transportiert **SCSI-Befehle in TCP/IP-Paketen**. Damit wird ein normales Ethernet-Netz zum **Blockspeichernetz**. Die beiden Rollen:
- **Initiator** (Client): fordert Blöcke an. Unter Windows der eingebaute **Microsoft iSCSI-Initiator** (Dienst `MSiSCSI`, Oberfläche `iscsicpl.exe`), alternativ ein Hardware-Initiator (iSCSI-HBA bzw. NIC mit iSCSI-Offload).
- **Target** (Ziel): stellt **LUNs** bereit. Das kann ein SAN-Array (z. B. **ARRAY01**) oder ein Windows-Server mit der Rolle **iSCSI-Zielserver** (Dienst `WinTarget`) sein. Unter Windows sind die LUNs **VHDX-Dateien** („virtuelle iSCSI-Datenträger“).

Eine **Sitzung** (*session*) zwischen Initiator und Target besteht aus einer oder mehreren TCP-Verbindungen. Die Kommunikationsendpunkte heißen **Portale** (*portal* = IP-Adresse + Port, Standard **TCP 3260**).

### Namen: IQN, EUI, NAA
Jeder Initiator und jedes Target hat einen weltweit eindeutigen Namen. Am häufigsten ist der **IQN** (*iSCSI Qualified Name*):

`iqn.JJJJ-MM.umgekehrte-domain:eindeutiger-teil`

| Teil | Beispiel | Bedeutung |
|---|---|---|
| `iqn.` | `iqn.` | Kennzeichen des Formats |
| Datum `JJJJ-MM` | `1991-05` | Monat, in dem die Organisation die Domain besessen hat |
| umgekehrte Domain | `com.microsoft` | Namensautorität (Domain rückwärts) |
| `:` + Zusatz | `:hv01.example.com` | frei wählbarer, eindeutiger Teil |

Beispiele: Initiator **`iqn.1991-05.com.microsoft:hv01.example.com`**, Windows-Target **`iqn.1991-05.com.microsoft:fs01-hvcluster-target`**. Weitere Formate: **EUI** (`eui.` + 16 Hex-Ziffern, 64 Bit) und **NAA** (`naa.` + 16 oder 32 Hex-Ziffern). IQNs sind nicht case-sensitiv und werden in Kleinbuchstaben verglichen.

### Discovery – wie der Initiator Targets findet
1. **Statisch**: Target-Name und Adresse werden manuell eingetragen.
2. **SendTargets** (Standard unter Windows): Der Initiator kennt nur das **Zielportal** (IP:3260), meldet sich in einer Discovery-Sitzung an und erhält die Liste der Targets, die er sehen darf (`New-IscsiTargetPortal`).
3. **iSNS** (*Internet Storage Name Service*, TCP 3205): zentraler Verzeichnisdienst – vergleichbar mit DNS für iSCSI, in großen Umgebungen.

### Anmeldung und CHAP
Nach der Discovery folgt die **Anmeldung** (*login*) mit Aushandlung der Parameter. Zur Authentifizierung dient **CHAP** (*Challenge Handshake Authentication Protocol*):
- **Einseitiges CHAP** (*one-way*): Das Target prüft den Initiator mit Benutzernamen und Geheimnis.
- **Gegenseitiges CHAP** (*mutual/reverse CHAP*): Zusätzlich prüft der Initiator das Target – schützt vor gefälschten Targets.
- Unter Windows muss das CHAP-Geheimnis **12–16 Zeichen** lang sein. Das Geheimnis wird nie im Klartext übertragen (Challenge-Response mit Hash).
- CHAP **verschlüsselt keine Daten**. Für Vertraulichkeit: getrenntes Netz, ggf. **IPsec**.
Die **Zugriffskontrolle** (welcher Initiator welches Target sieht) erfolgt beim Windows-Zielserver über die **InitiatorIds** (IQN, DNS-Name, IP- oder MAC-Adresse) – das entspricht dem LUN-Masking eines Arrays.

### iSCSI-Zielserver unter Windows Server
| Schritt | Cmdlet | Maschine |
|---|---|---|
| Rolle installieren | `Install-WindowsFeature FS-iSCSITarget-Server -IncludeManagementTools` | FS01 |
| LUN (VHDX) anlegen | `New-IscsiVirtualDisk -Path ... -SizeBytes 200GB` (dynamisch, mit `-UseFixed` fest) | FS01 |
| Target mit erlaubten Initiatoren | `New-IscsiServerTarget -TargetName HVCluster -InitiatorIds ...` | FS01 |
| LUN dem Target zuordnen | `Add-IscsiVirtualDiskTargetMapping` | FS01 |
| Portal eintragen (Discovery) | `New-IscsiTargetPortal -TargetPortalAddress ...` | HV01/HV02 |
| Verbinden | `Connect-IscsiTarget -IsPersistent $true` | HV01/HV02 |

Ein Target kann **mehrere LUNs** enthalten; die LUN-Nummer ergibt sich aus der Reihenfolge der Zuordnung (beginnend bei 0). Virtuelle iSCSI-Datenträger können bis zu **64 TB** groß sein. `-IsPersistent $true` sorgt dafür, dass die Verbindung nach einem Neustart automatisch wiederhergestellt wird („bevorzugte Ziele“).

### Speichernetz-Design
- **Getrenntes Speichernetz**: eigene NICs, eigenes VLAN oder eigene Switches, eigenes IP-Subnetz (z. B. 10.10.1.0/24 und 10.10.2.0/24 für zwei Pfade). Kein Standardgateway und keine DNS-Registrierung auf den iSCSI-NICs.
- **Zwei Pfade** über zwei Switches und **MPIO** statt NIC-Teaming – NIC-Teaming wird für iSCSI von Microsoft nicht unterstützt.
- **Jumbo Frames** (MTU 9000, unter Windows-Treibern oft „9014“ inkl. Ethernet-Kopf): weniger Overhead pro Block. Muss **Ende-zu-Ende** auf Initiator, allen Switches und Target gleich sein, sonst Fragmentierung oder Abbrüche. Test: `ping -f -l 8972 <Ziel>` (8972 = 9000 − 20 IP − 8 ICMP).
- Mindestens **10 GbE**, für Cluster besser 25 GbE; Flusskontrolle bzw. QoS beachten.
- iSCSI ist **routbar**, sollte aber trotzdem nicht durch Router/Firewalls mit hoher Latenz laufen.

Probier es im **Speicher-Labor unter Werkzeuge** aus: Dort baust du Initiator, Target und zwei Pfade zusammen und siehst Discovery, Login und CHAP als Ablauf.

## Einfach

Stell dir vor, dein Computer möchte **eine Festplatte ausleihen**, die in einem anderen Gebäude steht.

Das geht mit **iSCSI** so: Dein Computer (der **Initiator**, also der Fragende) schreibt einen **Brief**: „Bitte gib mir Kiste Nummer 500 von deiner Festplatte.“ Den Brief steckt er in einen **normalen Briefumschlag** (TCP/IP) und schickt ihn über das normale Postnetz (Ethernet). Der **Target** (das Ziel, der Verleiher) liest den Brief und schickt die Kiste zurück. Für deinen Computer fühlt sich die geliehene Platte an, als wäre sie **eingebaut**.

Damit jeder weiß, wer wer ist, hat jeder einen **langen Namen** – den **IQN**. Der sieht aus wie eine Adresse rückwärts: „iqn.1991-05.com.microsoft:hv01“. Wie bei einem Ausweis ist er weltweit einmalig.

Wie findet dein Computer den Verleiher? Er klopft an die **Haustür** (das **Portal**, Tür-Nummer **3260**) und fragt: „Welche Platten darf ich haben?“ Das heißt **Discovery**.

Damit nicht jeder einfach Platten ausleiht, gibt es ein **Geheimwort** (**CHAP**). Der Verleiher stellt eine Rätselfrage, dein Computer antwortet mit Hilfe des Geheimworts – das Geheimwort selbst wird aber **nie laut gesagt**. Beim **gegenseitigen CHAP** prüft auch dein Computer, ob der Verleiher echt ist.

Und weil viele Briefe hin und her gehen, baut man dafür am besten **eine eigene Straße** (ein eigenes Speichernetz) – mit **großen Lastwagen** (**Jumbo Frames**), die mehr auf einmal transportieren.

## Merksatz
- **Initiator fragt, Target liefert.**
- **IQN = iqn.Jahr-Monat.Domain-rückwärts:Name**
- **3260 für iSCSI, 3205 für iSNS.**
- **CHAP prüft, verschlüsselt aber nicht.**
- **Jumbo Frames nur Ende-zu-Ende – sonst lieber gar nicht.**
- **Für iSCSI MPIO statt NIC-Teaming.**

## Prüfungsfalle
- Initiator und Target werden gern vertauscht: Der **Server, der die Platte nutzt**, ist der **Initiator**.
- Im IQN steht die Domain **rückwärts** (`com.microsoft`, nicht `microsoft.com`) und das Datum ist **Jahr-Monat**.
- CHAP-Geheimnis unter Windows: **12 bis 16 Zeichen** – kürzere werden abgelehnt.
- CHAP ist **keine Verschlüsselung** – Daten laufen trotzdem lesbar; Schutz durch getrenntes Netz oder IPsec.
- Ohne `-IsPersistent $true` ist die LUN nach dem Neustart weg.
- Jumbo Frames nur auf dem Server zu aktivieren, aber nicht am Switch, führt zu sporadischen Abbrüchen.
- Ein Target ohne passende **InitiatorIds** erscheint bei der Discovery nicht – das ist kein Netzwerkfehler.

## Grafik
### Discovery, Login und Datenzugriff
1. HV01 -> FS01: Discovery-Sitzung an Portal 10.10.1.10:3260 (SendTargets)
2. FS01 -> HV01: Liste der erlaubten Targets (InitiatorIds passt)
3. HV01 -> FS01: Login am Target iqn.1991-05.com.microsoft:fs01-hvcluster-target
4. FS01 -> HV01: CHAP-Challenge (Zufallswert)
5. HV01 -> FS01: CHAP-Response (Hash aus Challenge und Geheimnis)
6. FS01: prüft die Antwort und gibt die Sitzung frei
7. HV01 -> FS01: SCSI-Lesebefehl für LUN 0 im TCP-Paket
8. FS01 -> HV01: Datenblöcke aus der VHDX

### Getrenntes Speichernetz
1. HV01 -> Switch-SAN-A: iSCSI-Pfad 1 im Netz 10.10.1.0/24 mit MTU 9000
2. HV01 -> Switch-SAN-B: iSCSI-Pfad 2 im Netz 10.10.2.0/24 mit MTU 9000
3. Switch-SAN-A -> FS01: Pfad 1 erreicht Portal 10.10.1.10
4. Switch-SAN-B -> FS01: Pfad 2 erreicht Portal 10.10.2.10
5. HV01: Clientverkehr läuft getrennt über das LAN 10.10.0.0/24

## Lab
**Maschinen** (Heimlabor `example.com`, Schule `exa.local`): **FS01.example.com** (Windows Server 2025, iSCSI-Zielserver, LAN 10.10.0.20, SAN-A 10.10.1.10, SAN-B 10.10.2.10, Datenvolume D:), **HV01.example.com** (LAN 10.10.0.31, SAN-A 10.10.1.31, SAN-B 10.10.2.31) und **HV02.example.com** (10.10.0.32 / 10.10.1.32 / 10.10.2.32). Keine Passwörter im Skript – Geheimnisse werden interaktiv abgefragt.

### GUI
1. **HV01, HV02**: Netzwerkverbindungen → iSCSI-NICs → IPv4 → **kein Standardgateway**, Erweitert → DNS → „Adressen dieser Verbindung in DNS registrieren“ **aus**.
2. **HV01, HV02, FS01**: Geräte-Manager → iSCSI-NIC → Erweitert → **Jumbo Packet 9014** (Switches ebenfalls auf MTU 9000+).
3. **FS01**: Server-Manager → Rollen und Features → Datei- und iSCSI-Dienste → **iSCSI-Zielserver** installieren.
4. **HV01, HV02**: `iscsicpl.exe` starten → Dienst starten mit **Ja** → Registerkarte Konfiguration → IQN notieren.
5. **FS01**: Datei-/Speicherdienste → iSCSI → **Neuer virtueller iSCSI-Datenträger** → D:, Name `CSV01`, 200 GB, dynamisch → Neues Ziel `HVCluster` → Zugriffsserver: IQNs von HV01 und HV02 → CHAP aktivieren (Benutzer `hvchap`, Geheimnis 12–16 Zeichen).
6. **HV01**: iSCSI-Initiator → **Suche** → Portal ermitteln → 10.10.1.10 → Erweitert: Initiator-IP 10.10.1.31 → Ziele → Verbinden → „bevorzugte Ziele“ an → Erweitert → **CHAP-Anmeldung** mit `hvchap`.
7. **HV01**: Datenträgerverwaltung → neuer Datenträger erscheint → nur auf **einem** Host online schalten, initialisieren (GPT) und formatieren; die gemeinsame Nutzung übernimmt später das Cluster.
8. Probier die Abläufe zusätzlich im **Speicher-Labor unter Werkzeuge** aus.

### PowerShell
```powershell
# --- FS01: Rolle und LUN
Install-WindowsFeature FS-iSCSITarget-Server -IncludeManagementTools
New-Item -Path D:\iSCSIVirtualDisks -ItemType Directory
New-IscsiVirtualDisk -Path D:\iSCSIVirtualDisks\CSV01.vhdx -SizeBytes 200GB

# --- FS01: Target mit erlaubten Initiatoren (entspricht LUN-Masking)
New-IscsiServerTarget -TargetName HVCluster -InitiatorIds @(
  "IQN:iqn.1991-05.com.microsoft:hv01.example.com",
  "IQN:iqn.1991-05.com.microsoft:hv02.example.com")
Add-IscsiVirtualDiskTargetMapping -TargetName HVCluster -Path D:\iSCSIVirtualDisks\CSV01.vhdx
$chap = Get-Credential -UserName hvchap -Message "CHAP-Geheimnis 12-16 Zeichen"
Set-IscsiServerTarget -TargetName HVCluster -EnableChap $true -Chap $chap
Get-IscsiServerTarget -TargetName HVCluster | Format-List TargetIqn, InitiatorIds, LunMappings

# --- HV01 (analog HV02): Netz vorbereiten
Set-NetAdapterAdvancedProperty -Name "SAN-A","SAN-B" -RegistryKeyword "*JumboPacket" -RegistryValue 9014
Set-DnsClient -InterfaceAlias "SAN-A","SAN-B" -RegisterThisConnectionsAddress $false
ping -f -l 8972 10.10.1.10

# --- HV01: Initiator, Discovery, Login mit CHAP
Set-Service MSiSCSI -StartupType Automatic
Start-Service MSiSCSI
(Get-InitiatorPort).NodeAddress
New-IscsiTargetPortal -TargetPortalAddress 10.10.1.10 -InitiatorPortalAddress 10.10.1.31
Get-IscsiTarget
$c = Get-Credential -UserName hvchap -Message "CHAP-Geheimnis"
Connect-IscsiTarget -NodeAddress "iqn.1991-05.com.microsoft:fs01-hvcluster-target" `
  -TargetPortalAddress 10.10.1.10 -InitiatorPortalAddress 10.10.1.31 `
  -AuthenticationType ONEWAYCHAP -ChapUsername hvchap `
  -ChapSecret $c.GetNetworkCredential().Password -IsPersistent $true
Get-IscsiSession | Format-Table TargetNodeAddress, IsConnected, IsPersistent
Get-Disk | Where-Object BusType -eq iSCSI
```

## Legende
### Initiator
- Was: die Seite, die Blockspeicher anfordert (iSCSI-Client).
- Wie: Dienst MSiSCSI und iscsicpl.exe bzw. Cmdlets New-IscsiTargetPortal und Connect-IscsiTarget.
- Wo: auf dem Server, der die LUN nutzt, z. B. HV01 und HV02.
- Wann: sobald ein Server Speicher aus dem SAN braucht.
- Warum: damit die entfernte LUN wie eine lokale Platte erscheint.
### Target
- Was: die Seite, die LUNs bereitstellt.
- Wie: Windows-Rolle FS-iSCSITarget-Server mit VHDX-Dateien oder ein SAN-Array.
- Wo: auf FS01 oder ARRAY01, erreichbar über Portal IP:3260.
- Wann: wenn zentraler Blockspeicher ohne Fibre Channel gebraucht wird.
- Warum: günstiger Blockspeicher über vorhandenes Ethernet.
### CHAP
- Was: Challenge-Response-Authentifizierung zwischen Initiator und Target.
- Wie: einseitig (Target prüft Initiator) oder gegenseitig; Geheimnis 12–16 Zeichen.
- Wann: immer, wenn das Speichernetz nicht vollständig vertrauenswürdig ist.
- Warum: verhindert, dass fremde Initiatoren LUNs einbinden – verschlüsselt aber keine Daten.

## Karteikarten
- F: Was transportiert iSCSI? | A: SCSI-Befehle und Datenblöcke in TCP/IP-Paketen
- F: Welche Rolle hat der Server, der eine LUN nutzt? | A: Initiator
- F: Wie ist ein IQN aufgebaut? | A: iqn.JJJJ-MM.umgekehrte-Domain:eindeutiger-Name, z. B. iqn.1991-05.com.microsoft:hv01.example.com
- F: Welche Namensformate gibt es neben IQN? | A: EUI (eui. + 16 Hex-Ziffern) und NAA (naa. + 16 oder 32 Hex-Ziffern)
- F: Was ist ein Portal bei iSCSI? | A: IP-Adresse plus TCP-Port (Standard 3260), über den ein Target erreichbar ist
- F: Was macht SendTargets-Discovery? | A: Der Initiator fragt am Zielportal die Liste der Targets ab, die er sehen darf
- F: Wofür steht iSNS und welcher Port? | A: Internet Storage Name Service, zentraler Verzeichnisdienst für iSCSI, TCP 3205
- F: Unterschied einseitiges und gegenseitiges CHAP? | A: Einseitig prüft nur das Target den Initiator, gegenseitig prüft zusätzlich der Initiator das Target
- F: Wie lang muss ein CHAP-Geheimnis unter Windows sein? | A: 12 bis 16 Zeichen
- F: Mit welchem Cmdlet listet man auf HV01 die iSCSI-Datenträger? | A: Get-Disk \| Where-Object BusType -eq iSCSI
- F: Was bewirkt -IsPersistent $true bei Connect-IscsiTarget? | A: Die Verbindung wird als bevorzugtes Ziel gespeichert und nach Neustart automatisch wiederhergestellt
- F: Warum kein Standardgateway auf iSCSI-NICs? | A: Speicherverkehr soll im getrennten Subnetz bleiben; das Gateway gehört nur auf die LAN-NIC
- F: Welche Paketgröße testet einen Jumbo-Frame-Pfad mit MTU 9000? | A: ping -f -l 8972 (9000 minus 20 Byte IP minus 8 Byte ICMP)

## Quiz
? Welcher Port ist der Standardport für iSCSI-Portale?
* TCP 3260
- TCP 3205
- TCP 445
- UDP 860
! 3260 ist iSCSI; 3205 gehört zu iSNS.

? Welcher IQN ist korrekt aufgebaut?
* iqn.1991-05.com.microsoft:hv01.example.com
- iqn.microsoft.com-1991-05:hv01
- iqn:hv01.example.com.1991-05
- iqn.05-1991.com.microsoft:hv01
! Format: iqn. + Jahr-Monat + umgekehrte Domain + Doppelpunkt + eindeutiger Teil.

? Welche Rolle übernimmt der Hyper-V-Host HV01, der eine LUN von FS01 einbindet?
* Initiator
- Target
- iSNS-Server
- Portal
! Der Server, der Speicher anfordert, ist der Initiator; FS01 ist das Target.

? Was leistet CHAP bei iSCSI?
* Authentifizierung per Challenge-Response
- Verschlüsselung aller Datenblöcke
- Lastverteilung auf mehrere Pfade
- Komprimierung der SCSI-Befehle
! CHAP authentifiziert nur; für Verschlüsselung bräuchte man IPsec.

? Welches Cmdlet installiert den iSCSI-Zielserver?
* Install-WindowsFeature FS-iSCSITarget-Server
- Install-WindowsFeature Multipath-IO
- Enable-WindowsOptionalFeature iSCSI-Initiator
- Add-WindowsCapability iSCSI.Target
! Die Rolle heißt FS-iSCSITarget-Server und gehört zu den Datei- und Speicherdiensten.

? Mit welchem Cmdlet ordnet man eine VHDX einem Target zu?
* Add-IscsiVirtualDiskTargetMapping
- New-IscsiTargetPortal
- Connect-IscsiTarget
- Set-IscsiServerTarget -Path
! Erst New-IscsiVirtualDisk, dann New-IscsiServerTarget, dann Add-IscsiVirtualDiskTargetMapping.

? Was steuert beim Windows-iSCSI-Zielserver den Parameter InitiatorIds?
* Welche Initiatoren das Target sehen und verbinden dürfen
- Welche IP-Adresse das Portal hat
- Wie groß die LUN ist
- Welche MTU verwendet wird
! InitiatorIds entsprechen dem LUN-Masking eines SAN-Arrays.

? Welches Cmdlet führt auf HV01 die Discovery am Zielportal aus?
* New-IscsiTargetPortal
- New-IscsiServerTarget
- Add-IscsiVirtualDiskTargetMapping
- Get-InitiatorPort
! New-IscsiTargetPortal trägt das Portal ein und startet SendTargets-Discovery.

? Warum sollten Jumbo Frames Ende-zu-Ende gleich konfiguriert sein?
* Sonst werden große Rahmen verworfen oder fragmentiert und Verbindungen brechen ab
- Weil CHAP sonst nicht funktioniert
- Weil iSCSI sonst Port 3205 verwendet
- Weil die LUN sonst schreibgeschützt wird
! Ein Switch mit MTU 1500 verwirft 9000-Byte-Rahmen – typische Ursache sporadischer Abbrüche.

? Welche Redundanzlösung empfiehlt Microsoft für iSCSI-Pfade?
* MPIO mit zwei getrennten Netzen
- NIC-Teaming auf den iSCSI-NICs
- Zwei Standardgateways
- Ein einzelner Switch mit Spanning Tree
! NIC-Teaming wird für iSCSI nicht unterstützt; Redundanz kommt über MPIO.

? Wie groß darf ein virtueller iSCSI-Datenträger beim Windows-Zielserver maximal sein?
* 64 TB
- 2 TB
- 16 TB
- 256 TB
! Die VHDX-basierten iSCSI-Datenträger können bis 64 TB groß werden.

? Wozu dient gegenseitiges CHAP?
* Der Initiator prüft zusätzlich die Echtheit des Targets
- Es verschlüsselt den Datenverkehr mit AES
- Es erlaubt Verbindungen ohne Geheimnis
- Es verteilt Last auf zwei Targets
! Gegenseitiges (mutual) CHAP schützt auch vor gefälschten Targets.

? Was ist iSNS?
* Ein zentraler Namens- und Discovery-Dienst für iSCSI
- Ein Verschlüsselungsverfahren für LUNs
- Ein Dateisystem für Cluster
- Eine MPIO-Richtlinie
! iSNS (TCP 3205) funktioniert ähnlich wie DNS für iSCSI-Geräte.

## Lücken
- Der Client bei iSCSI heißt {Initiator}, der Speicheranbieter heißt {Target}.
- Ein IQN beginnt mit iqn., gefolgt von {Jahr-Monat|JJJJ-MM} und der {umgekehrten} Domain.
- Unter Windows muss ein CHAP-Geheimnis {12} bis {16} Zeichen lang sein.

## Zuordnen
### Cmdlet und Aufgabe
- New-IscsiVirtualDisk => VHDX als LUN anlegen
- New-IscsiServerTarget => Target mit erlaubten Initiatoren erstellen
- Add-IscsiVirtualDiskTargetMapping => LUN einem Target zuordnen
- New-IscsiTargetPortal => Zielportal auf dem Initiator eintragen
- Connect-IscsiTarget => Sitzung zum Target aufbauen

## Reihenfolge
### iSCSI-LUN von FS01 auf HV01 bereitstellen
1. Rolle FS-iSCSITarget-Server auf FS01 installieren
2. Virtuellen iSCSI-Datenträger auf FS01 anlegen
3. Target mit den IQNs von HV01 und HV02 erstellen
4. Datenträger dem Target zuordnen
5. Auf HV01 den Dienst MSiSCSI starten
6. Zielportal auf HV01 eintragen
7. Mit dem Target persistent verbinden
8. Datenträger online schalten, initialisieren und formatieren

## Freitext
- F: Beschreiben Sie Aufbau und Zweck eines IQN anhand von iqn.1991-05.com.microsoft:hv01.example.com. | M: iqn. kennzeichnet das Format; 1991-05 ist Jahr-Monat, in dem die Domain der Namensautorität gehörte; com.microsoft ist die umgekehrte Domain; nach dem Doppelpunkt folgt ein eindeutiger Teil (hier der FQDN des Hosts). Zweck: weltweit eindeutige Identifikation von Initiator/Target für Zugriffssteuerung und Login. | P: 5

## Szenario
### iSCSI für den Cluster HV01/HV02
Die Firma Nordlicht GmbH stellt auf FS01.example.com einen iSCSI-Zielserver bereit. HV01 und HV02 sollen eine gemeinsame LUN für ein Cluster Shared Volume nutzen. Nach der Einrichtung sieht HV02 bei der Discovery kein Target, HV01 verliert bei großen Kopiervorgängen gelegentlich die Verbindung. Die iSCSI-NICs von HV01 haben MTU 9014, der Speicher-Switch ist noch auf MTU 1500 eingestellt.
- F: Warum sieht HV02 kein Target? | A: Sein IQN fehlt in den InitiatorIds des Targets HVCluster; mit Set-IscsiServerTarget -InitiatorIds beide IQNs eintragen | P: 3
- F: Was ist die Ursache für die Abbrüche bei HV01? | A: MTU-Fehlanpassung: Jumbo Frames am Host, aber nicht am Switch – große Rahmen werden verworfen; MTU Ende-zu-Ende angleichen und mit ping -f -l 8972 testen | P: 3
- F: Wie stellen Sie sicher, dass die LUN nach einem Neustart wieder verbunden ist? | A: Connect-IscsiTarget mit -IsPersistent $true bzw. in der GUI „zur Liste der bevorzugten Ziele hinzufügen“ | P: 2
- F: Welche Sicherheitsmaßnahmen empfehlen Sie zusätzlich? | A: Getrenntes Speichernetz/VLAN ohne Gateway, CHAP (möglichst gegenseitig), restriktive InitiatorIds, bei Bedarf IPsec | P: 2
