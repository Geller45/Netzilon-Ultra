---
id: server-hvsz-14
bereich: AZ-800
block: HV-S
kapitel: Hyper-V-Praxisszenarien
titel: Szenario 14 – Externer vSwitch angelegt: Host verliert das Netzwerk
stufe: Einsteiger
fach: Windows Server / AZ-800
pruefungen: [AZ-800, AP2, Schule]
quellen: [Microsoft Learn – Hyper-V]
verweise: [az800-vswitch, server-hvsz-15, server-hvsz-16]
---

## Profi

### Ticket
**Kunde meldet:** „Ich habe per Remotedesktop auf HV01 einen externen Switch angelegt. Seitdem ist der Server nicht mehr erreichbar – kein Ping, kein RDP. Die VMs laufen aber!“
- Datum/Priorität: 08.10.2026, **Priorität 1 (kritisch)** – Host nicht verwaltbar.
- Betroffene Maschine: Host **HV01.example.com** (192.168.10.21).

### Ausgangslage
- HV01: Server 2025, **eine** physische NIC „Ethernet“ mit statischer IP 192.168.10.21/24, Gateway 192.168.10.1, DNS 192.168.10.10.
- Neuer externer vSwitch **LAN** auf „Ethernet“, dabei wurde der Haken **„Gemeinsames Verwenden dieses Netzwerkadapters für das Verwaltungsbetriebssystem zulassen“** entfernt.
- Remote-Konsole (iLO/iDRAC/IPMI bzw. Hyper-V-Konsole bei Nested) steht zur Verfügung.

### Analyse
Beim Anlegen eines **externen** Switches wird die physische NIC an den Hyper-V-Switch gebunden; sie hat danach **keinen TCP/IP-Stack** mehr für den Host. Ist **AllowManagementOS** aktiv, erstellt Hyper-V einen virtuellen Adapter **vEthernet (LAN)** für den Host und überträgt die IP-Konfiguration. Ohne diesen Haken hat der Host an dieser NIC **gar kein Netz** mehr – die VMs dagegen schon.

| Hypothese | Prüfung |
|---|---|
| AllowManagementOS = False | `Get-VMSwitch LAN \| Select AllowManagementOS` (Konsole) |
| vEthernet-Adapter vorhanden, aber ohne IP/DNS | `Get-NetIPConfiguration` |
| VLAN am Verwaltungs-vNIC falsch | `Get-VMNetworkAdapterVlan -ManagementOS` |
| Physischer Switchport/Kabel | Link-LED, `Get-NetAdapter` |

**Befund:** AllowManagementOS = **False**, kein vEthernet-Adapter vorhanden.

### Lösungsweg
1. **Über die Out-of-Band-Konsole** (iLO/iDRAC) bzw. lokal anmelden – Begründung: Netzwerkwege zum Host sind weg.
2. **AllowManagementOS aktivieren** – Begründung: Hyper-V legt einen vEthernet-Adapter für den Host an.
3. **IP-Konfiguration am vEthernet-Adapter** prüfen und ggf. setzen (192.168.10.21/24, Gateway, DNS) – Begründung: Die statische Konfiguration wird nicht immer vollständig übernommen.
4. **VLAN** für den Verwaltungsadapter setzen, falls das Verwaltungsnetz getaggt ist.
5. **Erreichbarkeit testen** (Ping, RDP, DNS-Registrierung `ipconfig /registerdns`).

### Ergebnis prüfen
- `Get-NetIPAddress -InterfaceAlias "vEthernet (LAN)"` zeigt 192.168.10.21.
- Von einem Admin-PC: `Test-NetConnection HV01.example.com -Port 3389` erfolgreich.
- VMs weiterhin erreichbar.

### Vorbeugung
- vSwitch-Änderungen **nicht über die Verbindung** durchführen, die man gerade umkonfiguriert – Konsole oder separate Verwaltungs-NIC nutzen.
- Best Practice: **dedizierte Verwaltungs-NIC** oder **SET-Team** (Switch Embedded Teaming) mit Verwaltungs-vNIC.
- Änderungen mit Skript und Zeitgeber-Rollback testen; kurze Unterbrechung beim Anlegen einplanen.

## Einfach

Stell dir vor, der Host hat **eine Haustür** (die Netzwerkkarte), durch die er selbst und alle VMs gehen. Jetzt baut man an diese Tür einen **Pförtner** (den externen vSwitch). Ab sofort gehen **alle** nur noch über den Pförtner.

Beim Einbau fragt der Pförtner: „Soll der **Hausherr** (das Host-Betriebssystem) auch durch mich gehen dürfen?“ Wer hier „**Nein**“ sagt, sperrt den Hausherrn aus! Die Gäste (VMs) kommen weiter rein und raus, aber der Hausherr kann nicht mehr telefonieren (kein Ping, kein RDP).

Da man den Hausherrn nicht mehr anrufen kann, muss man **persönlich hingehen** (Konsole/iLO) und dem Pförtner sagen: „Der Hausherr darf auch durch.“ Dann bekommt der Hausherr einen **eigenen Ausweis** (vEthernet-Adapter) mit seiner Adresse – und ist wieder erreichbar.

## Merksatz
- Externer Switch übernimmt die NIC – Host braucht **vEthernet** (AllowManagementOS).
- Haken „Verwaltungsbetriebssystem zulassen“ **nicht** entfernen, wenn es die einzige NIC ist.
- Umbau nie über die Verbindung, die man gerade ändert.

## Prüfungsfalle
- Die IP liegt nach dem Anlegen am **vEthernet-Adapter**, nicht mehr an der physischen NIC.
- Ein **interner** Switch hätte den Host nicht vom LAN getrennt – nur ein **externer** bindet die NIC.
- VMs funktionieren weiter – das Problem betrifft **nur** den Host.
- Kurzer Verbindungsabbruch beim Anlegen ist **normal**, dauerhafter nicht.

## Grafik
### Pförtner an der Haustür
1. Admin -> HV01: Externen Switch LAN ohne Verwaltungsbetriebssystem anlegen
2. HV01: Physische NIC an vSwitch gebunden, Host-IP entfernt
3. Admin-PC -> HV01: Ping und RDP laufen ins Leere
4. Admin -> HV01: Anmeldung über iLO-Konsole
5. HV01: AllowManagementOS aktiviert, vEthernet LAN erstellt
6. HV01: IP 192.168.10.21 am vEthernet gesetzt
7. Admin-PC -> HV01: RDP wieder möglich

## Lab
**Maschinen**: Host **HV01.example.com** (am besten als Nested-VM **HV-NESTED** nachstellen, damit die Hyper-V-Konsole als „Out-of-Band“ dient), Admin-PC **CL01**.
Nachstellen: Zuerst den Fehler bewusst erzeugen, dann beheben.

### GUI
1. **HV-NESTED**: Hyper-V-Manager → **Manager für virtuelle Switches** → Neuer virtueller Netzwerkswitch → **Extern** → Ethernet-Adapter → Haken „**Gemeinsames Verwenden … für das Verwaltungsbetriebssystem zulassen**“ **entfernen** → OK → Warnung bestätigen (Fehlerzustand).
2. **CL01**: `ping HV-NESTED` → keine Antwort.
3. **HV01**: Hyper-V-Manager → HV-NESTED → **Verbinden** (Konsole statt Netzwerk).
4. **HV-NESTED**: Hyper-V-Manager → Manager für virtuelle Switches → Switch **LAN** → Haken „**Gemeinsames Verwenden … zulassen**“ setzen → OK.
5. **HV-NESTED**: Systemsteuerung → Netzwerkverbindungen → **vEthernet (LAN)** → IPv4 → IP, Maske, Gateway, DNS prüfen/setzen.
6. **CL01**: `ping HV-NESTED` → Antwort; RDP funktioniert.

### PowerShell
1. **HV-NESTED**: Fehler erzeugen.
2. **HV-NESTED** (über Konsole): Verwaltungsadapter wieder anlegen.
3. **HV-NESTED**: IP prüfen und setzen.

```powershell
# Auf HV-NESTED (bzw. HV01) – Fehler erzeugen
New-VMSwitch -Name "LAN" -NetAdapterName "Ethernet" -AllowManagementOS $false

# Auf HV-NESTED – über die Konsole beheben
Get-VMSwitch -Name "LAN" | Select-Object Name, SwitchType, AllowManagementOS
Set-VMSwitch -Name "LAN" -AllowManagementOS $true
Get-NetIPConfiguration -InterfaceAlias "vEthernet (LAN)"

# Falls die IP fehlt
New-NetIPAddress -InterfaceAlias "vEthernet (LAN)" -IPAddress 192.168.10.21 -PrefixLength 24 -DefaultGateway 192.168.10.1
Set-DnsClientServerAddress -InterfaceAlias "vEthernet (LAN)" -ServerAddresses 192.168.10.10
ipconfig /registerdns

# Optional: Verwaltungs-vNIC im VLAN 10
Set-VMNetworkAdapterVlan -ManagementOS -VMNetworkAdapterName "LAN" -Access -VlanId 10
```

## Szenario
### Kontrollfragen
Nach dem Anlegen eines externen vSwitch ohne Haken für das Verwaltungsbetriebssystem ist HV01 nicht mehr erreichbar, die VMs laufen.
- F: Warum hat der Host kein Netz mehr? | A: Die physische NIC ist an den vSwitch gebunden; ohne AllowManagementOS gibt es keinen vEthernet-Adapter für den Host.
- F: Wie gelangt man auf den Host? | A: Über eine Out-of-Band-Konsole (iLO/iDRAC/IPMI) oder lokal.
- F: Welcher Befehl behebt das? | A: Set-VMSwitch -Name LAN -AllowManagementOS $true
- F: Wo liegt danach die Host-IP? | A: Am virtuellen Adapter „vEthernet (LAN)“.
- F: Wie vermeidet man das künftig? | A: Dedizierte Verwaltungs-NIC oder SET mit Verwaltungs-vNIC, Änderungen über die Konsole durchführen.

## Reihenfolge
### Host-Netz nach vSwitch-Fehler wiederherstellen
1. Über die Out-of-Band-Konsole anmelden
2. Switch-Einstellung AllowManagementOS prüfen
3. AllowManagementOS aktivieren
4. IP-Konfiguration am vEthernet-Adapter prüfen und setzen
5. VLAN des Verwaltungsadapters prüfen
6. Erreichbarkeit per Ping und RDP testen

## Legende
### AllowManagementOS
- Was: Switch-Eigenschaft, die dem Host einen virtuellen Netzwerkadapter am externen vSwitch gibt.
- Wie: Haken „Gemeinsames Verwenden dieses Netzwerkadapters für das Verwaltungsbetriebssystem zulassen“ bzw. `Set-VMSwitch -AllowManagementOS $true`.
- Wann: beim Anlegen oder Ändern eines externen Switches, besonders wenn der Host nur eine NIC hat.
- Wo: Manager für virtuelle Switches auf HV01.
- Warum: Ohne ihn verliert der Host den Netzzugang über diese NIC, weil sie exklusiv dem vSwitch gehört.

## Karteikarten
- F: Was passiert mit der physischen NIC beim Anlegen eines externen Switches? | A: Sie wird an den vSwitch gebunden und verliert ihre IP-Bindung für den Host.
- F: Was erstellt AllowManagementOS? | A: Einen virtuellen Adapter „vEthernet (<Switchname>)“ für den Host.
- F: Cmdlet zum nachträglichen Aktivieren? | A: Set-VMSwitch -Name LAN -AllowManagementOS $true
- F: Wo liegt die Host-IP nach dem Anlegen? | A: Am vEthernet-Adapter.
- F: Wie kommt man auf einen Host ohne Netz? | A: Out-of-Band-Konsole (iLO/iDRAC/IPMI) oder lokal.
- F: Welche Switch-Arten trennen den Host nicht vom LAN? | A: Interne und private Switches (sie binden keine physische NIC).
- F: Wie setzt man ein VLAN am Verwaltungsadapter? | A: Set-VMNetworkAdapterVlan -ManagementOS -VMNetworkAdapterName LAN -Access -VlanId <ID>
- F: Welche Best Practice verhindert das Problem? | A: Dedizierte Verwaltungs-NIC oder SET-Team mit Verwaltungs-vNIC.

## Quiz
? HV01 ist nach dem Anlegen eines externen Switches nicht erreichbar. Häufigste Ursache?
* AllowManagementOS wurde deaktiviert
- MAC-Spoofing ist aus
- Die VMs haben dynamischen RAM
- Der Switch ist privat
! Ohne Verwaltungs-vNIC hat der Host an dieser NIC kein Netz.

? Welches Cmdlet behebt das?
* Set-VMSwitch -Name LAN -AllowManagementOS $true
- Set-VMHost -ManagementOS $true
- Enable-NetAdapter -Name LAN
- Set-VMNetworkAdapter -ManagementOS -Spoofing On
! Die Eigenschaft gehört zum vSwitch.

? Wo liegt die Host-IP nach dem Anlegen mit AllowManagementOS?
* Am Adapter „vEthernet (LAN)“
- An der physischen NIC
- Am Loopback-Adapter
- Im vSwitch selbst ohne Adapter
! Die physische NIC dient nur noch als Uplink.

? Wie gelangt man auf den Host, wenn das Netz weg ist?
* Über die Out-of-Band-Konsole (iLO/iDRAC)
- Per PowerShell Direct vom Admin-PC
- Per RDP über die VM
- Gar nicht, nur Neuinstallation
! PowerShell Direct geht nur vom Host in VMs.

? Welche Switch-Art bindet eine physische NIC?
* Extern
- Intern
- Privat
- Keine
! Interne und private Switches haben keinen Uplink.

? Was gilt für die VMs während des Problems?
* Sie haben weiterhin Netzwerk
- Sie werden automatisch angehalten
- Sie verlieren ebenfalls das Netz
- Sie werden gespeichert
! Nur der Host hat keinen Adapter am Switch.

? Was ist eine gute Vorbeugung?
* Dedizierte Verwaltungs-NIC oder SET mit Verwaltungs-vNIC
- MAC-Spoofing überall aktivieren
- Dynamic Memory abschalten
- Erweiterte Sitzung deaktivieren
! So bleibt der Verwaltungszugang unabhängig.

? Was ist beim Anlegen eines externen Switches normal?
* Eine kurze Netzwerkunterbrechung des Hosts
- Ein Neustart des Hosts
- Das Herunterfahren aller VMs
- Der Verlust aller Prüfpunkte
! Die Bindung der NIC wird neu aufgebaut.
