---
id: server-hvsz-37
bereich: AZ-800
block: HV-S
kapitel: Hyper-V-Praxisszenarien
titel: Szenario 37 – Netzwerkkarte fällt aus: Switch Embedded Teaming (SET) einrichten
stufe: Fortgeschritten
fach: Windows Server / AZ-800
pruefungen: [AZ-800, AZ-801, AP2, Schule]
quellen: [Microsoft Learn – Hyper-V]
verweise: [az800-vswitch, az801-cluster-netzwerk, server-hvsz-34, server-hvsz-36]
---

## Profi

### Ticket
**Kunde meldet:** „Heute Morgen war plötzlich alles weg: Mail, Dateien, ERP. Der Dienstleister hat ein defektes Netzwerkkabel am Host getauscht. Wie verhindern wir das künftig?“
- **Priorität:** hoch (Single Point of Failure)
- **Betroffene Maschine:** **HV01** (alle VMs)

### Ausgangslage
- **HV01.example.com**, Server 2025, zwei gleiche 10-GbE-Karten **„NIC1“** und **„NIC2“**; bisher hing der vSwitch **„Extern“** nur an NIC1.
- Management-IP des Hosts 192.168.10.11 auf vEthernet (Extern).
- Physischer Switch: zwei Ports frei, kein LACP gewünscht.

### Analyse
- Eine einzelne Uplink-Karte ist ein **Single Point of Failure**.
- **Switch Embedded Teaming (SET)** fasst **1 bis 8** physische Karten direkt **im Hyper-V-vSwitch** zu einem Team zusammen.
- Eigenschaften:
  - Teaming-Modus **nur switchunabhängig** (Switch Independent) – keine Konfiguration am physischen Switch, kein LACP.
  - Lastenausgleich: **Hyper-V-Port** oder **Dynamisch**; Microsoft empfiehlt **Hyper-V-Port**.
  - Alle Mitglieder sollten **identisch** sein (Hersteller, Modell, Firmware, Treiber, Geschwindigkeit).
  - Unterstützt **RDMA**/SMB Direct auf Host-vNICs – Grundlage für Azure Local und S2D.
- Das klassische **LBFO-Teaming** (Server-Manager „NIC-Teamvorgang“) kann ab Windows Server 2022 nicht mehr als Uplink eines Hyper-V-vSwitch gebunden werden – für Hyper-V ist **SET** der Weg.
- SET wird **per PowerShell** oder **Windows Admin Center** angelegt; der Hyper-V-Manager zeigt ein SET-Team nur an.

### Lösungsweg
1. **Wartungsfenster** planen, Konsolenzugriff (iLO/iDRAC/KVM) sicherstellen. *Begründung:* Beim Umbau des vSwitch geht die Management-Verbindung kurz verloren.
2. Beide Karten an den physischen Switch (gleiches VLAN/Access) anschließen. *Begründung:* Switchunabhängiges Team braucht keine Switch-Konfiguration, aber beide Ports im selben Netz.
3. Entweder vorhandenen vSwitch um ein Team erweitern oder **neuen SET-vSwitch** anlegen: `New-VMSwitch -Name "SET" -NetAdapterName "NIC1","NIC2" -EnableEmbeddedTeaming $true -AllowManagementOS $true`. *Begründung:* Team und Switch sind eine Einheit.
4. **Lastenausgleich** auf HyperVPort setzen. *Begründung:* Empfehlung, gleichmäßige Verteilung pro vNIC.
5. VMs an den neuen Switch hängen, Management-IP auf vEthernet (SET) prüfen. *Begründung:* Alter Switch wird danach entfernt.
6. **Ausfall testen**: ein Kabel ziehen. *Begründung:* Nur ein getesteter Failover ist ein Failover.

### Ergebnis prüfen
- `Get-VMSwitchTeam -Name SET | Format-List` → NetAdapterInterfaceDescription mit beiden Karten, TeamingMode SwitchIndependent, LoadBalancingAlgorithm HyperVPort.
- Dauerping von einem Client auf eine VM und auf 192.168.10.11 → beim Ziehen eines Kabels höchstens kurzer Aussetzer.
- `Get-NetAdapter NIC1, NIC2` → Status Up nach Wiederanschluss.

### Vorbeugung
- Beide Teammitglieder an **zwei verschiedene physische Switches** anschließen.
- Monitoring auf Link-Status der Teammitglieder.
- Treiber/Firmware beider Karten immer gemeinsam aktualisieren.

## Einfach
Stell dir vor, dein Haus hat nur **eine Brücke** über den Fluss. Wird die Brücke gesperrt, kommt niemand mehr rein oder raus – genau das ist heute passiert, als das Kabel kaputt war.

Mit **SET** baust du eine **zweite Brücke** direkt daneben und machst aus beiden eine gemeinsame Straße. Die Autos (Datenpakete) verteilen sich auf beide Brücken. Fällt eine aus, fahren eben alle über die andere – etwas enger, aber niemand bleibt stecken.

Das Besondere: Die beiden Brücken sind **direkt in den virtuellen Switch eingebaut**. Der Straßenbauer draußen (der physische Switch) muss nichts davon wissen und nichts umstellen.

Die Brücken sollten möglichst **gleich** gebaut sein (gleiche Netzwerkkarten). Und am besten führen sie zu **zwei verschiedenen Ufern** (zwei physischen Switches) – dann hilft es sogar, wenn einer der Switches kaputtgeht.

## Merksatz
- SET = Team **im vSwitch**, **1–8** gleiche Karten.
- Nur **switchunabhängig**, kein LACP.
- Lastenausgleich: **HyperVPort** (empfohlen) oder Dynamic.
- Anlegen per **PowerShell/WAC**: `-EnableEmbeddedTeaming $true`.

## Prüfungsfalle
- SET unterstützt **kein LACP** und keinen statischen Switch-abhängigen Modus.
- Ein vSwitch auf einem **LBFO-Team** ist ab Server 2022 blockiert – SET verwenden.
- Der Hyper-V-Manager kann SET **nicht anlegen**.
- Teammitglieder sollten identische Karten sein – gemischte Modelle sind nicht empfohlen.

## Grafik
### Ausfallsicherer Uplink mit SET
1. VM -> SET-Switch: Pakete verteilt nach Hyper-V-Port
2. SET-Switch -> NIC1, NIC2: beide Karten aktiv
3. NIC1: Kabel defekt, Link down
4. SET-Switch -> NIC2: gesamter Verkehr über NIC2
5. Client -> VM: Dauerping läuft weiter

## Lab
**Nachstellen:** Im Lab mit zwei virtuellen Netzwerkkarten in einer Nested-VM üben. Maschinen: physischer Host, VM **HV01** (Nested, 2 vNICs mit MAC-Spoofing).

### GUI
1. **Host**: Hyper-V-Manager → HV01 → Einstellungen → Hardware hinzufügen → **zweite Netzwerkkarte** → beide an denselben Switch, je Netzwerkkarte → Erweiterte Features → „Spoofing von MAC-Adressen aktivieren“.
2. **HV01**: Netzwerkverbindungen → Karten in **NIC1** und **NIC2** umbenennen.
3. **HV01**: Windows Admin Center → HV01 → **Virtuelle Switches** → Neu → Typ „Extern“, beide Karten auswählen (Switch Embedded Teaming) → Name **SET** → Speichern.
4. **HV01**: Hyper-V-Manager → Manager für virtuelle Switches → SET wird angezeigt.
5. **Client**: Dauerping `ping -t 192.168.10.11`.
6. **Host**: HV01 → Einstellungen → zweite Netzwerkkarte → „Nicht verbunden“ → Ping läuft weiter → Karte wieder verbinden.

### PowerShell
```powershell
# Auf HV01 – Karten prüfen
Get-NetAdapter | Format-Table Name, InterfaceDescription, LinkSpeed, Status

# Auf HV01 – SET-Switch anlegen (Konsolenzugriff bereithalten!)
New-VMSwitch -Name "SET" -NetAdapterName "NIC1","NIC2" -EnableEmbeddedTeaming $true -AllowManagementOS $true
Set-VMSwitchTeam -Name "SET" -LoadBalancingAlgorithm HyperVPort
Get-VMSwitchTeam -Name "SET" | Format-List

# Auf HV01 – VMs umhängen und alten Switch entfernen
Get-VM | Get-VMNetworkAdapter | Where-Object SwitchName -eq "Extern" | Connect-VMNetworkAdapter -SwitchName "SET"
Remove-VMSwitch -Name "Extern" -Force

# Auf HV01 – Mitglied später ergänzen
Add-VMSwitchTeamMember -VMSwitchName "SET" -NetAdapterName "NIC3"
```

## Reihenfolge
### SET-Switch einführen
1. Wartungsfenster und Konsolenzugriff sichern
2. Zweite identische Karte anschließen
3. SET-vSwitch mit beiden Karten anlegen
4. Lastenausgleich HyperVPort setzen
5. VMs und Management-IP auf den neuen Switch umstellen
6. Alten vSwitch entfernen
7. Ausfall durch Kabelziehen testen

## Szenario
### Kontrollfragen
HV01 hat zwei identische 10-GbE-Karten. Bisher hing der vSwitch nur an NIC1; ein Kabeldefekt legte alle VMs lahm. LACP ist nicht gewünscht.
- F: Welche Teaming-Technik ist für Hyper-V-Hosts vorgesehen? | A: Switch Embedded Teaming (SET).
- F: Welcher Parameter erzeugt ein SET-Team beim Anlegen des Switches? | A: New-VMSwitch -EnableEmbeddedTeaming $true mit -NetAdapterName "NIC1","NIC2".
- F: Welcher Teaming-Modus wird von SET unterstützt? | A: Nur switchunabhängig (Switch Independent).
- F: Welcher Lastenausgleich wird empfohlen? | A: Hyper-V-Port (HyperVPort).
- F: Wie viele Karten kann ein SET-Team enthalten? | A: 1 bis 8.

## Legende
### Switch Embedded Teaming
- Was: In den Hyper-V-vSwitch integriertes NIC-Teaming mit 1–8 Karten.
- Wie: New-VMSwitch -EnableEmbeddedTeaming $true, Set-VMSwitchTeam für den Lastenausgleich.
- Wann: Immer, wenn ein Hyper-V-Host redundante Uplinks oder RDMA-Teaming braucht.
- Wo: Auf dem Hyper-V-Host per PowerShell oder Windows Admin Center.
- Warum: Ausfallsicherheit und Lastverteilung ohne Konfiguration am physischen Switch.

## Karteikarten
- F: Was ist SET? | A: Switch Embedded Teaming – NIC-Teaming direkt im Hyper-V-vSwitch.
- F: Wie viele Karten kann ein SET-Team haben? | A: 1 bis 8.
- F: Welchen Teaming-Modus unterstützt SET? | A: Nur switchunabhängig, kein LACP.
- F: Welche Lastenausgleichsalgorithmen gibt es bei SET? | A: Hyper-V-Port und Dynamisch.
- F: Mit welchem Cmdlet ändert man den Lastenausgleich? | A: Set-VMSwitchTeam -Name SET -LoadBalancingAlgorithm HyperVPort
- F: Womit legt man SET per GUI an? | A: Windows Admin Center (nicht Hyper-V-Manager).
- F: Warum nicht mehr LBFO als vSwitch-Uplink? | A: Ab Server 2022 ist das Binden eines vSwitch an ein LBFO-Team blockiert; SET ist der Ersatz.
- F: Wie ergänzt man ein Teammitglied? | A: Add-VMSwitchTeamMember -VMSwitchName SET -NetAdapterName NIC3

## Quiz
? Welche Teaming-Lösung ist für Hyper-V-vSwitches in Server 2022/2025 vorgesehen?
* Switch Embedded Teaming (SET)
- LBFO-Team mit LACP
- Windows-Bridge
- NLB-Cluster
! LBFO als vSwitch-Uplink ist ab Server 2022 blockiert.

? Welcher Teaming-Modus wird von SET unterstützt?
* Switchunabhängig
- LACP
- Statisch switchabhängig
- Round-Robin am physischen Switch
! Am physischen Switch ist keine Konfiguration nötig.

? Welcher Parameter aktiviert SET bei New-VMSwitch?
* -EnableEmbeddedTeaming $true
- -TeamingMode Lacp
- -EnableIov $true
- -SwitchType Team
! Dazu mehrere Karten in -NetAdapterName.

? Wie viele physische Karten kann ein SET-Team maximal enthalten?
* 8
- 2
- 4
- 32
! 1 bis 8 Karten.

? Welcher Lastenausgleich wird für SET empfohlen?
* Hyper-V-Port
- Adresshash
- Statisch
- LACP-Hash
! Adresshash gibt es bei SET nicht.

? Womit kann man SET NICHT anlegen?
* Hyper-V-Manager
- PowerShell
- Windows Admin Center
- System Center VMM
! Der Hyper-V-Manager zeigt SET nur an.

? Welche Anforderung gilt für Teammitglieder?
* Möglichst identische Karten (Modell, Firmware, Treiber, Geschwindigkeit)
- Unterschiedliche Hersteller
- Jede Karte in einem anderen IP-Subnetz
- Nur 1-Gbit/s-Karten
! Gemischte Karten sind nicht empfohlen.

? Wie testest du die Ausfallsicherheit?
* Dauerping laufen lassen und ein Kabel ziehen
- Den Host herunterfahren
- Die VM in Gen 1 neu erstellen
- Den DHCP-Server deaktivieren
! Der Ping darf höchstens kurz aussetzen.
