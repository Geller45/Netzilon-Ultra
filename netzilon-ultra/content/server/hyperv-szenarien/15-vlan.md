---
id: server-hvsz-15
bereich: AZ-800
block: HV-S
kapitel: Hyper-V-Praxisszenarien
titel: Szenario 15 – VM braucht VLAN 20
stufe: Fortgeschritten
fach: Windows Server / AZ-800
pruefungen: [AZ-800, AP2, Schule]
quellen: [Microsoft Learn – Hyper-V]
verweise: [az800-vswitch, server-hvsz-14, server-hvsz-16]
---

## Profi

### Ticket
**Kunde meldet:** „Der neue Druckserver soll ins Druckernetz (VLAN 20, 192.168.20.0/24). Die VM bekommt keine Adresse und erreicht keinen Drucker.“
- Datum/Priorität: 09.10.2026, **Priorität 3 (normal)**.
- Betroffene Maschine: VM **PRINT01** auf **HV01.example.com**.

### Ausgangslage
- Host **HV01.example.com**, Server 2025, externer vSwitch **LAN** auf NIC „Ethernet“, angeschlossen an Port Gi1/0/10 eines verwalteten Switches.
- Verwaltungsnetz des Hosts: VLAN 10, 192.168.10.21; Druckernetz: **VLAN 20**, 192.168.20.0/24, Gateway 192.168.20.1, DHCP-Relay auf dem Router.
- PRINT01: Gen 2, Server 2025, vNIC an **LAN**, **kein** VLAN eingetragen.
- Switchport Gi1/0/10: **Access-Port** in VLAN 10.

### Analyse
Ein Hyper-V-vSwitch ist VLAN-fähig: Für jede vNIC kann eine **VLAN-ID** gesetzt werden (Modus **Access**). Der vSwitch **taggt** dann die Frames dieser VM mit der ID (IEEE 802.1Q) und liefert ihr nur Frames aus diesem VLAN. Damit getaggte Frames den physischen Switch passieren, muss dessen Port ein **Trunk** sein, der VLAN 20 (und 10 für den Host) zulässt.

| Hypothese | Prüfung |
|---|---|
| vNIC ohne VLAN-ID → landet im untagged/Native-VLAN | `Get-VMNetworkAdapterVlan -VMName PRINT01` |
| Switchport ist Access statt Trunk | `show interfaces Gi1/0/10 switchport` am Switch |
| VLAN 20 auf dem Trunk nicht erlaubt | `show interfaces trunk` |
| Host-Verwaltung bricht bei Trunk weg | Verwaltungs-vNIC braucht ggf. VLAN 10 oder Native VLAN 10 |
| NIC-Treiber filtert VLAN-Tags | Erweiterte NIC-Eigenschaften (Priorität & VLAN) |

### Lösungsweg
1. **Switchport auf Trunk** umstellen, erlaubte VLANs 10 und 20, **Native VLAN 10** (oder Host-vNIC ebenfalls taggen) – Begründung: Getaggte Frames werden von Access-Ports verworfen; mit Native VLAN 10 bleibt der Host erreichbar. Mit Netzwerkteam abstimmen und über Konsole durchführen.
2. **VLAN 20 an der vNIC** von PRINT01 setzen (Access-Modus) – Begründung: Der vSwitch taggt den Verkehr dieser VM mit 20. Die Änderung ist im Betrieb möglich.
3. **Im Gast** keine VLAN-Konfiguration – Begründung: Im Access-Modus sieht der Gast nur untagged Frames.
4. **DHCP erneuern** bzw. IP 192.168.20.x setzen; Drucker anpingen.

### Ergebnis prüfen
- `Get-VMNetworkAdapterVlan -VMName PRINT01` → **OperationMode Access, AccessVlanId 20**.
- PRINT01 hat 192.168.20.x und erreicht 192.168.20.1 sowie die Drucker.
- HV01 bleibt unter 192.168.10.21 erreichbar.

### Vorbeugung
- Hyper-V-Host-Ports grundsätzlich als **Trunk** mit dokumentierten erlaubten VLANs planen.
- VLAN-Zuordnung je VM in der CMDB dokumentieren.
- Verwaltungs-vNIC mit eigenem VLAN (`-ManagementOS`) und Native VLAN bewusst festlegen.

## Einfach

Stell dir das Netzwerk wie ein **Haus mit mehreren Etagen** vor (VLANs). Etage 10 ist das Büro, Etage 20 ist der Druckerraum. Der **Aufzug** (die Leitung zwischen Host und Switch) bringt Leute in die richtige Etage – aber nur, wenn sie einen **Etagen-Aufkleber** tragen (VLAN-Tag).

PRINT01 läuft ohne Aufkleber herum, also landet sie automatisch im Büro (Etage 10) und findet keinen Drucker.

Zwei Dinge müssen passieren:
1. Der **Pförtner im Host** (der vSwitch) klebt PRINT01 den Aufkleber „**20**“ auf (VLAN-ID an der vNIC).
2. Der **Aufzug** (Switchport) muss **mehrere Etagen** anfahren dürfen (**Trunk**) – vorher fuhr er nur in Etage 10 (Access-Port) und hat Leute mit Aufkleber „20“ einfach nicht mitgenommen.

Dann kommt PRINT01 im Druckerraum an. Und der Host selbst bleibt im Büro, weil man festgelegt hat: „Wer keinen Aufkleber hat, fährt in Etage 10“ (Native VLAN).

## Merksatz
- VLAN pro vNIC: `Set-VMNetworkAdapterVlan -Access -VlanId 20`.
- Physischer Port zum Host = **Trunk** mit den VLANs der VMs.
- Access-Modus: Gast merkt vom Tag nichts.
- Host-vNIC: `-ManagementOS`.

## Prüfungsfalle
- VLAN-ID nur an der vNIC setzen reicht nicht, wenn der Switchport **Access** ist.
- Die VLAN-ID wird **nicht** am vSwitch insgesamt gesetzt (außer für den Verwaltungsadapter des Hosts).
- **Trunk-Modus an der vNIC** (`-Trunk`) braucht man nur, wenn der Gast selbst taggen soll (z. B. Router-VM).
- Beim Umstellen des Ports auf Trunk kann der Host die Verbindung verlieren – Native VLAN beachten.

## Grafik
### Etagen-Aufkleber
1. PRINT01 -> vSwitch: Frame ohne Tag
2. vSwitch: VLAN-ID 20 an der vNIC – Tag 20 anfügen
3. vSwitch -> Switchport: Frame mit Tag 20
4. Switchport: Access-Port VLAN 10 – Frame verworfen
5. Admin -> Switchport: Trunk mit VLAN 10 und 20, Native 10
6. Switchport -> Router: Frame im VLAN 20 erreicht 192.168.20.1
7. Router -> PRINT01: DHCP-Antwort 192.168.20.x

## Lab
**Maschinen**: Host **HV01.example.com**, VM **PRINT01**, verwalteter Switch (oder im Heimlabor: Router-VM mit VLAN-Trunk).
Nachstellen: Zuerst den Fehler bewusst erzeugen, dann beheben.

### GUI
1. **HV01**: Hyper-V-Manager → PRINT01 → Einstellungen → Netzwerkkarte → Haken „**Identifizierung virtueller LANs aktivieren**“ → VLAN-ID **20** → OK, Switchport bleibt Access (Fehlerzustand: keine Verbindung).
2. **PRINT01**: `ipconfig /renew` → APIPA-Adresse.
3. **Switch**: Port Gi1/0/10 → Modus **Trunk**, erlaubte VLANs 10,20, Native VLAN 10 (über Konsole/Netzwerkteam).
4. **HV01**: Ping auf 192.168.10.1 → Host weiterhin erreichbar.
5. **PRINT01**: `ipconfig /renew` → 192.168.20.x.
6. **PRINT01**: `ping 192.168.20.1` → Antwort.
7. **HV01**: Hyper-V-Manager → Manager für virtuelle Switches → LAN → bei Bedarf „**Identifizierung virtueller LANs für Verwaltungsbetriebssystem aktivieren**“ (nur wenn Host getaggt werden soll).

### PowerShell
1. **HV01**: VLAN setzen und prüfen.
2. **Switch**: Trunk konfigurieren (Cisco-Beispiel im Kommentar).
3. **PRINT01**: Adresse erneuern.

```powershell
# Auf HV01 – VLAN 20 an der vNIC
Set-VMNetworkAdapterVlan -VMName PRINT01 -Access -VlanId 20
Get-VMNetworkAdapterVlan -VMName PRINT01

# Am physischen Switch (Cisco IOS, Beispiel)
#   interface Gi1/0/10
#    switchport mode trunk
#    switchport trunk allowed vlan 10,20
#    switchport trunk native vlan 10

# Auf HV01 – alternativ Host-vNIC selbst taggen statt Native VLAN
Set-VMNetworkAdapterVlan -ManagementOS -VMNetworkAdapterName "LAN" -Access -VlanId 10
Get-VMNetworkAdapterVlan -ManagementOS

# In PRINT01 (per PowerShell Direct von HV01)
Invoke-Command -VMName PRINT01 -Credential (Get-Credential) -ScriptBlock { ipconfig /renew; Test-Connection 192.168.20.1 -Count 2 }

# Zurücksetzen (VLAN entfernen)
Set-VMNetworkAdapterVlan -VMName PRINT01 -Untagged
```

## Szenario
### Kontrollfragen
PRINT01 soll in VLAN 20. Der Switchport zum Host ist ein Access-Port in VLAN 10, an der vNIC ist keine VLAN-ID gesetzt.
- F: Welcher Befehl setzt VLAN 20 an der vNIC? | A: Set-VMNetworkAdapterVlan -VMName PRINT01 -Access -VlanId 20
- F: Was muss am physischen Switch geändert werden? | A: Der Port zum Host muss ein Trunk sein, der VLAN 20 (und 10) erlaubt.
- F: Wie bleibt der Host nach der Umstellung erreichbar? | A: Native VLAN 10 am Trunk oder die Verwaltungs-vNIC mit -ManagementOS in VLAN 10 taggen.
- F: Muss im Gast ein VLAN konfiguriert werden? | A: Nein, im Access-Modus taggt der vSwitch; der Gast sieht untagged Frames.
- F: Wann braucht man -Trunk an der vNIC? | A: Wenn der Gast selbst mehrere VLANs taggen soll, z. B. eine Router- oder Firewall-VM.

## Reihenfolge
### VM in ein VLAN bringen
1. Ziel-VLAN und Subnetz klären
2. Switchport zum Host als Trunk mit erlaubtem VLAN konfigurieren
3. Native VLAN bzw. Verwaltungs-VLAN des Hosts sicherstellen
4. VLAN-ID an der vNIC im Access-Modus setzen
5. IP-Adresse in der VM erneuern
6. Gateway und Zielgeräte testen

## Legende
### VLAN-ID an der vNIC
- Was: Zuordnung einer VM-Netzwerkkarte zu einem IEEE-802.1Q-VLAN durch den Hyper-V-vSwitch.
- Wie: VM-Einstellungen → Netzwerkkarte → Identifizierung virtueller LANs aktivieren, bzw. `Set-VMNetworkAdapterVlan -Access -VlanId`.
- Wann: wenn VMs auf einem Host in unterschiedlichen Netzsegmenten arbeiten sollen.
- Wo: auf HV01 an der vNIC; passend dazu der Trunk-Port am physischen Switch.
- Warum: trennt Netze logisch, ohne für jedes VLAN eine eigene physische NIC zu brauchen.

## Karteikarten
- F: Cmdlet für VLAN 20 an einer VM? | A: Set-VMNetworkAdapterVlan -VMName <VM> -Access -VlanId 20
- F: Wie muss der Switchport zum Hyper-V-Host konfiguriert sein? | A: Als Trunk mit den benötigten VLANs.
- F: Was passiert mit getaggten Frames an einem Access-Port? | A: Sie werden in der Regel verworfen.
- F: Wie setzt man ein VLAN für den Host-Adapter? | A: Set-VMNetworkAdapterVlan -ManagementOS -VMNetworkAdapterName <Name> -Access -VlanId <ID>
- F: Wie zeigt man die VLAN-Konfiguration an? | A: Get-VMNetworkAdapterVlan
- F: Wie entfernt man das VLAN wieder? | A: Set-VMNetworkAdapterVlan -VMName <VM> -Untagged
- F: Wann nutzt man den Trunk-Modus an einer vNIC? | A: Wenn der Gast selbst VLAN-Tags verarbeitet (Router-/Firewall-VM).
- F: Welcher Standard beschreibt VLAN-Tagging? | A: IEEE 802.1Q.
- F: Muss die VM für die VLAN-Änderung ausgeschaltet werden? | A: Nein, im Betrieb änderbar.

## Quiz
? Welcher Befehl setzt PRINT01 in VLAN 20?
* Set-VMNetworkAdapterVlan -VMName PRINT01 -Access -VlanId 20
- Set-VMSwitch -Name LAN -VlanId 20
- Set-NetAdapter -Name Ethernet -VlanID 20 im Gast
- New-VMSwitch -VlanId 20
! Das VLAN gehört zur vNIC der VM.

? PRINT01 hat VLAN 20, bekommt aber keine Adresse. Switchport ist Access in VLAN 10. Was fehlt?
* Der Switchport muss Trunk mit VLAN 20 sein
- MAC-Spoofing
- Ein privater vSwitch
- Eine zweite physische NIC ist zwingend
! Access-Ports verwerfen Frames mit fremdem Tag.

? Wie wird der Host-Verwaltungsadapter getaggt?
* Set-VMNetworkAdapterVlan -ManagementOS -VMNetworkAdapterName LAN -Access -VlanId 10
- Set-VMNetworkAdapterVlan -VMName LAN -Trunk -AllowedVlanIdList 10 -NativeVlanId 10
- Set-VMSwitch -Name LAN -AllowManagementOS $true -DefaultFlowVlanId 10
- Set-NetAdapter -Name NIC1 -VlanID 10 an der an den vSwitch gebundenen NIC
! -ManagementOS adressiert die Host-vNICs.

? Was sieht der Gast im Access-Modus?
* Untagged Frames, der vSwitch taggt
- Getaggte Frames mit der VLAN-ID 20
- Gar keinen Verkehr aus dem VLAN
- Nur Broadcasts aller VLANs
! Der vSwitch entfernt bzw. setzt den Tag.

? Wann verwendet man -Trunk an der vNIC?
* Wenn eine Router-VM mehrere VLANs selbst verarbeitet
- Für jede normale Server-VM in einem einzelnen VLAN
- Für die Weitergabe der Virtualisierungserweiterungen
- Für die Replikationsverbindung von Hyper-V-Replikat
! Normale Server nutzen Access.

? Wie entfernt man die VLAN-Konfiguration?
* Set-VMNetworkAdapterVlan -VMName PRINT01 -Untagged
- Remove-VMSwitch
- Set-VMNetworkAdapterVlan -VlanId 0 -Trunk
- Disable-VMNetworkAdapter
! -Untagged setzt die vNIC zurück.

? Welche Gefahr besteht beim Umstellen des Host-Ports auf Trunk?
* Ohne passendes Native VLAN verliert der Host die Verwaltung
- Alle VMs des Hosts werden aus dem Manager entfernt
- Die VHDX-Dateien der VMs werden beschädigt
- Secure Boot wird an allen Gen-2-VMs deaktiviert
! Untagged Host-Verkehr landet im Native VLAN.

? Muss PRINT01 für die VLAN-Änderung ausgeschaltet sein?
* Nein
- Ja
- Nur bei Gen 1
- Nur bei Gen 2
! VLAN-Einstellungen sind im Betrieb änderbar.
