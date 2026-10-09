---
id: server-hvsz-04
bereich: AZ-800
block: HV-S
kapitel: Hyper-V-Praxisszenarien
titel: Szenario 04 – Nested in einer Azure-VM: innere VMs per NAT ins Netz
stufe: Profi
fach: Windows Server / AZ-800
pruefungen: [AZ-800, AP2, Schule]
quellen: [Microsoft Learn – Hyper-V]
verweise: [az800-nested, az800-azure-vms, az800-vswitch, server-hvsz-02]
---

## Profi

### Ticket
**Kunde meldet:** „Wir haben das Schulungslab nach Azure verschoben. Hyper-V läuft in der Azure-VM, die Test-VMs darin haben aber kein Internet. MAC-Spoofing finden wir im Portal nirgends.“
- Datum/Priorität: 08.10.2026, **Priorität 3 (normal)**.
- Betroffene Maschinen: Azure-VM **AZHV01** (Hyper-V-Host in Azure), innere VMs **INNER01**, **INNER02**. Das lokale **HV01.example.com** ist nur Verwaltungsrechner.

### Ausgangslage
- **AZHV01**: Windows Server 2025, Größe aus einer Serie mit „Nested Virtualization: Supported“ (z. B. Dv5/Ev5), private IP 10.20.1.4 im VNet.
- Hyper-V-Rolle in AZHV01 installiert, ein **externer** vSwitch auf die Azure-NIC wurde angelegt, INNER01 hängt daran.
- INNER01 bekommt keine Adresse, das Azure-VNet liefert per DHCP nur eine IP pro Azure-NIC (für die MAC der Azure-VM).

### Analyse
In Azure kann man **kein MAC-Spoofing** für die NIC einer VM freischalten; das Azure-Netz stellt nur Frames für die bekannte MAC/IP der Azure-NIC zu. Innere VMs mit eigener MAC und eigener IP werden deshalb nicht zugestellt. Ein externer Switch auf der Azure-NIC ist daher der falsche Ansatz (und kann die Verbindung der Azure-VM selbst stören).

| Hypothese | Prüfung |
|---|---|
| Externer Switch in Azure → kein Netz für innere VMs | `Get-VMSwitch` in AZHV01 |
| Kein NAT vorhanden | `Get-NetNat` in AZHV01 |
| Innere VMs ohne IP/Gateway (kein DHCP im NAT-Netz) | `ipconfig` in INNER01 |
| VM-Größe ohne Nested-Unterstützung | Größen-Dokumentation, `Get-ComputerInfo -Property HyperV*` |

### Lösungsweg
1. **Externen Switch entfernen** – Begründung: Die Azure-NIC soll ausschließlich der Azure-VM gehören.
2. **Internen Switch anlegen** (`New-VMSwitch -SwitchType Internal`) – Begründung: Er erzeugt einen vEthernet-Adapter in AZHV01, der als Gateway der inneren VMs dient.
3. **IP am vEthernet-Adapter** setzen: 192.168.100.1/24 – Begründung: Standardgateway für das innere Netz.
4. **NAT erstellen**: `New-NetNat -InternalIPInterfaceAddressPrefix 192.168.100.0/24` – Begründung: AZHV01 übersetzt ausgehenden Verkehr auf seine Azure-IP; Azure sieht nur die bekannte Adresse.
5. **Innere VMs adressieren**: statisch 192.168.100.10/24, Gateway 192.168.100.1, DNS z. B. Azure-DNS 168.63.129.16 oder den DC im VNet – alternativ DHCP-Rolle in AZHV01 für dieses Netz.
6. **Eingehende Zugriffe** (optional) per Portweiterleitung: `Add-NetNatStaticMapping` – Begründung: NAT erlaubt von außen nur gezielt weitergeleitete Ports.

### Ergebnis prüfen
- `Get-NetNat` zeigt **NestedNAT** mit 192.168.100.0/24.
- INNER01: `Test-NetConnection learn.microsoft.com -Port 443` erfolgreich.
- `Get-NetNatSession` in AZHV01 zeigt aktive Übersetzungen.

### Vorbeugung
- Für Nested in Azure grundsätzlich **NAT** planen (oder eigenes Routing mit IP-Weiterleitung und benutzerdefinierten Routen, wenn innere VMs aus dem VNet direkt erreichbar sein müssen).
- Größe vor der Bereitstellung auf Nested-Unterstützung prüfen.
- Pro Host nur **ein** NetNat-Objekt (Windows unterstützt nur eine NAT-Instanz) – Präfixe nicht überlappen lassen.

## Einfach

Stell dir vor, AZHV01 wohnt in einem **großen Hotel** (Azure). Die Rezeption nimmt Post nur für Gäste an, die **eingecheckt** sind – also nur für AZHV01 selbst.

In AZHV01s Zimmer wohnen heimlich zwei kleine Gäste (INNER01, INNER02). Schreiben die mit ihrem eigenen Namen Briefe, weiß die Rezeption nicht, wer das ist, und Antworten kommen nie an. Einen „Ich-darf-auch-andere-Namen-benutzen“-Ausweis (MAC-Spoofing) gibt es in diesem Hotel nicht.

Die Lösung ist ein **Zimmer-Postfach** (NAT):
- Die kleinen Gäste geben ihre Briefe bei AZHV01 ab.
- AZHV01 schreibt **seinen eigenen Namen** als Absender drauf und merkt sich, wem der Brief gehört.
- Kommt eine Antwort, verteilt AZHV01 sie an den richtigen kleinen Gast.

Dafür baut AZHV01 ein kleines inneres Netz (interner Switch), wird dort selbst der **Türsteher/Gateway** (192.168.100.1) und schaltet das Postfach ein (New-NetNat).

## Merksatz
- Azure: **kein MAC-Spoofing** → **NAT** in der Azure-VM.
- Interner Switch + IP am vEthernet + `New-NetNat`.
- Innere VMs: Gateway = vEthernet-IP der äußeren VM.
- Eingehend nur per `Add-NetNatStaticMapping`.

## Prüfungsfalle
- „MAC-Spoofing im Azure-Portal aktivieren“ gibt es nicht.
- Ein **privater** Switch reicht nicht – der äußere Host braucht einen vEthernet-Adapter (**intern**).
- NAT liefert **kein DHCP** – innere VMs statisch adressieren oder eigenen DHCP-Dienst bereitstellen.
- Nicht jede Azure-VM-Größe unterstützt Nested Virtualization.

## Grafik
### NAT in der Azure-VM
1. INNER01 -> AZHV01: Paket an Internet, Quelle 192.168.100.10, Gateway 192.168.100.1
2. AZHV01: NAT ersetzt Quelle durch 10.20.1.4 und merkt sich die Sitzung
3. AZHV01 -> Azure-VNet: Paket mit bekannter Azure-IP
4. Azure-VNet -> Internet: Ausgehend über Azure
5. Internet -> AZHV01: Antwort an 10.20.1.4
6. AZHV01 -> INNER01: NAT übersetzt zurück auf 192.168.100.10

## Lab
**Maschinen**: Azure-VM **AZHV01** (Hyper-V installiert, Nested-fähige Größe), innere VM **INNER01**; Verwaltung von **HV01.example.com** per RDP/Bastion.
Nachstellen: Zuerst den Fehler bewusst erzeugen, dann beheben.

### GUI
1. **AZHV01**: Hyper-V-Manager → Manager für virtuelle Switches → INNER01 an einen **privaten** Switch „Test“ hängen → INNER01 hat kein Netz (Fehlerzustand).
2. **AZHV01**: Manager für virtuelle Switches → **Neuer virtueller Netzwerkswitch** → **Intern** → Name „NestedNAT“ → OK.
3. **AZHV01**: Systemsteuerung → Netzwerkverbindungen → **vEthernet (NestedNAT)** → IPv4 → 192.168.100.1 / 255.255.255.0, kein Gateway → OK.
4. **AZHV01**: PowerShell als Administrator → `New-NetNat` aus dem PowerShell-Teil (für NAT gibt es keine GUI im Hyper-V-Manager).
5. **AZHV01**: Hyper-V-Manager → INNER01 → Einstellungen → Netzwerkkarte → Switch **NestedNAT** → OK.
6. **INNER01**: Netzwerkverbindungen → IPv4 → 192.168.100.10/24, Gateway 192.168.100.1, DNS 168.63.129.16.
7. **INNER01**: Browser → beliebige Website öffnen.

### PowerShell
1. **AZHV01**: Switch und NAT anlegen.
2. **AZHV01**: INNER01 umhängen und per PowerShell Direct adressieren.
3. **AZHV01**: Optionale Portweiterleitung für RDP.

```powershell
# Auf AZHV01 – Switch und NAT
New-VMSwitch -Name "NestedNAT" -SwitchType Internal
New-NetIPAddress -IPAddress 192.168.100.1 -PrefixLength 24 -InterfaceAlias "vEthernet (NestedNAT)"
New-NetNat -Name "NestedNAT" -InternalIPInterfaceAddressPrefix 192.168.100.0/24

# Auf AZHV01 – INNER01 anbinden und adressieren
Connect-VMNetworkAdapter -VMName INNER01 -SwitchName "NestedNAT"
Invoke-Command -VMName INNER01 -Credential (Get-Credential) -ScriptBlock {
  $nic = Get-NetAdapter | Select-Object -First 1
  New-NetIPAddress -InterfaceIndex $nic.ifIndex -IPAddress 192.168.100.10 -PrefixLength 24 -DefaultGateway 192.168.100.1
  Set-DnsClientServerAddress -InterfaceIndex $nic.ifIndex -ServerAddresses 168.63.129.16
  Test-NetConnection learn.microsoft.com -Port 443
}

# Auf AZHV01 – optional RDP auf INNER01 über Port 50001
Add-NetNatStaticMapping -NatName "NestedNAT" -Protocol TCP -ExternalIPAddress 0.0.0.0/24 -ExternalPort 50001 -InternalIPAddress 192.168.100.10 -InternalPort 3389
Get-NetNat; Get-NetNatSession
```

## Szenario
### Kontrollfragen
In der Azure-VM AZHV01 laufen innere Hyper-V-VMs. Ein externer Switch auf der Azure-NIC bringt sie nicht ins Netz.
- F: Warum funktioniert der externe Switch in Azure nicht? | A: Azure stellt nur Verkehr für die bekannte MAC/IP der Azure-NIC zu; MAC-Spoofing lässt sich in Azure nicht aktivieren.
- F: Welche drei Schritte richten NAT ein? | A: Internen vSwitch anlegen, IP am vEthernet-Adapter setzen (Gateway), New-NetNat mit dem internen Präfix.
- F: Welches Gateway tragen die inneren VMs ein? | A: Die IP des vEthernet-Adapters von AZHV01, hier 192.168.100.1.
- F: Wie erreicht man einen Dienst in INNER01 von außen? | A: Mit einer Portweiterleitung per Add-NetNatStaticMapping.
- F: Liefert NetNat DHCP? | A: Nein, die inneren VMs brauchen statische Adressen oder einen eigenen DHCP-Server.

## Reihenfolge
### NAT für Nested in Azure
1. Nested-fähige Azure-VM-Größe wählen und Hyper-V installieren
2. Internen vSwitch anlegen
3. IP-Adresse am vEthernet-Adapter setzen
4. NetNat mit dem internen Präfix erstellen
5. Innere VM an den internen Switch hängen
6. Innere VM mit IP, Gateway und DNS konfigurieren
7. Verbindung nach außen testen

## Legende
### NetNat
- Was: In Windows integrierte Netzwerkadressübersetzung (WinNAT) für ein internes Präfix.
- Wie: `New-NetNat -Name <Name> -InternalIPInterfaceAddressPrefix <Netz/Präfix>`.
- Wann: wenn innere VMs Netzwerk brauchen, MAC-Spoofing aber nicht möglich ist (Azure) oder nicht gewünscht ist.
- Wo: in der äußeren VM (AZHV01), die als Gateway dient.
- Warum: Nach außen erscheint nur die bekannte Adresse der Azure-VM; innere Adressen bleiben verborgen.

## Karteikarten
- F: Warum gibt es in Azure kein MAC-Spoofing für Nested? | A: Das Azure-Netz stellt nur Verkehr für die registrierte MAC/IP der Azure-NIC zu; eine Freigabe fremder MACs ist nicht vorgesehen.
- F: Welcher Switch-Typ wird für NAT in der äußeren VM angelegt? | A: Ein interner vSwitch.
- F: Was wird am vEthernet-Adapter konfiguriert? | A: Die Gateway-IP des inneren Netzes, z. B. 192.168.100.1/24.
- F: Welches Cmdlet erstellt das NAT? | A: New-NetNat -Name NestedNAT -InternalIPInterfaceAddressPrefix 192.168.100.0/24
- F: Wie viele NetNat-Instanzen unterstützt Windows? | A: Eine.
- F: Wie richtet man eine Portweiterleitung ein? | A: Add-NetNatStaticMapping mit externem Port und interner IP/Port.
- F: Wie zeigt man aktive NAT-Übersetzungen an? | A: Get-NetNatSession
- F: Liefert NetNat DHCP-Adressen? | A: Nein.
- F: Woran erkennt man eine geeignete Azure-VM-Größe? | A: In der Größen-Dokumentation steht „Nested Virtualization: Supported“.

## Quiz
? Welcher Weg bringt innere VMs einer Nested-Azure-VM ins Internet?
* Interner Switch plus NetNat in der Azure-VM
- MAC-Spoofing in der Azure-NIC aktivieren
- Externer Switch auf der Azure-NIC
- Privater Switch
! In Azure ist NAT der vorgesehene Weg.

? Welches Gateway nutzen die inneren VMs?
* Die IP des vEthernet-Adapters der äußeren VM
- Die öffentliche IP der Azure-VM
- 168.63.129.16
- Die erste IP des Azure-Subnetzes
! Der vEthernet-Adapter des internen Switches ist das Gateway.

? Welches Cmdlet erstellt die Übersetzung?
* New-NetNat
- New-NetRoute
- New-VMSwitch -SwitchType NAT
- Set-NetIPInterface -Forwarding Enabled
! New-NetNat legt die WinNAT-Instanz für das interne Präfix an.

? Wie viele NetNat-Instanzen sind pro Windows-Host möglich?
* Eine
- Zwei
- Eine pro vSwitch
- Unbegrenzt
! WinNAT unterstützt nur eine NAT-Instanz.

? Was liefert NetNat NICHT?
* DHCP-Adressen für die inneren VMs
- Ausgehende Adressübersetzung
- Portweiterleitungen
- Sitzungsübersicht
! DHCP muss separat bereitgestellt oder statisch konfiguriert werden.

? Wie wird RDP auf INNER01 von außen erreichbar?
* Add-NetNatStaticMapping mit externem Port auf 192.168.100.10:3389
- Set-VMNetworkAdapter -MacAddressSpoofing On
- Enable-PSRemoting in INNER01
- New-NetFirewallRule auf INNER01 reicht allein
! Ohne statische Zuordnung lässt NAT keine eingehenden Verbindungen durch.

? Welcher Switch-Typ allein reicht NICHT, weil die äußere VM keinen eigenen Adapter daran hat?
* Privat
- Intern
- Intern mit NetNat
- Intern mit Portweiterleitung
! Ein privater Switch verbindet nur VMs untereinander.

? Was muss man vor der Bereitstellung der Azure-VM prüfen?
* Ob die VM-Größe Nested Virtualization unterstützt
- Ob die VM Generation 1 ist
- Ob das VNet IPv6 nutzt
- Ob die VM eine Datenplatte hat
! Nicht alle Größen unterstützen Nested.
