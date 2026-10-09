---
id: server-hvsz-16
bereich: AZ-800
block: HV-S
kapitel: Hyper-V-Praxisszenarien
titel: Szenario 16 – Interner vs. privater Switch: VMs erreichen den Host nicht
stufe: Einsteiger
fach: Windows Server / AZ-800
pruefungen: [AZ-800, AP2, Schule]
quellen: [Microsoft Learn – Hyper-V]
verweise: [az800-vswitch, server-hvsz-14, server-hvsz-15]
---

## Profi

### Ticket
**Kunde meldet:** „Unser Testnetz ist abgeschottet, das ist gewollt. Aber die Test-VMs sollen Installationsdateien von einer Freigabe auf dem Host holen – sie erreichen den Host nicht.“
- Datum/Priorität: 02.10.2026, **Priorität 3 (normal)**.
- Betroffene Maschinen: VMs **TEST01**, **TEST02** auf **HV01.example.com**, Freigabe `\\HV01\Setup`.

### Ausgangslage
- Host **HV01.example.com**, Server 2025, externer Switch **LAN** (192.168.10.21).
- Testnetz: vSwitch **Testnetz** vom Typ **Privat**, TEST01 172.16.50.11/24, TEST02 172.16.50.12/24. TEST01 und TEST02 erreichen sich gegenseitig.
- Anforderung: kein Zugang zum Firmen-LAN, aber Zugriff auf den Host.

### Analyse
| Switch-Typ | VMs untereinander | VMs ↔ Host | VMs ↔ physisches Netz |
|---|---|---|---|
| **Extern** | ja | ja (wenn Verwaltungs-OS zugelassen) | ja |
| **Intern** | ja | **ja** – der Host bekommt einen vEthernet-Adapter | nein (außer Host routet/NAT) |
| **Privat** | ja | **nein** – kein Host-Adapter | nein |

Ein **privater** Switch hat **keinen** virtuellen Adapter im Host – der Host ist dort schlicht nicht angeschlossen. Für „abgeschottet, aber Host erreichbar“ ist ein **interner** Switch richtig.

| Hypothese | Prüfung |
|---|---|
| Switch ist privat | `Get-VMSwitch Testnetz \| Select SwitchType` |
| Interner Switch, aber vEthernet ohne passende IP (kein DHCP im internen Netz) | `Get-NetIPAddress -InterfaceAlias "vEthernet (Testnetz)"` |
| Host-Firewall blockiert SMB/ICMP (Netzwerkprofil „Öffentlich“) | `Get-NetConnectionProfile` |

### Lösungsweg
1. **Switch-Typ auf Intern ändern** – Begründung: Nur so erhält der Host einen vEthernet-Adapter in diesem Netz. Die Änderung ist ohne Neuanlage per `Set-VMSwitch -SwitchType Internal` möglich, die VMs bleiben verbunden.
2. **Statische IP am vEthernet-Adapter**: 172.16.50.1/24 **ohne Gateway** – Begründung: Im internen Netz gibt es keinen DHCP; ohne Gateway entsteht keine unerwünschte Route.
3. **Netzwerkprofil/Firewall** prüfen: Profil des vEthernet-Adapters (oft „Öffentlich“, nicht identifiziertes Netzwerk) – Begründung: Datei- und Druckerfreigabe ist im öffentlichen Profil blockiert. Gezielte Regel für 172.16.50.0/24 statt Profil global zu öffnen.
4. **Kein Routing/NAT** auf HV01 aktivieren – Begründung: Anforderung „kein Firmen-LAN“ bleibt erfüllt.

### Ergebnis prüfen
- Von TEST01: `Test-NetConnection 172.16.50.1 -Port 445` → *TcpTestSucceeded : True*.
- TEST01 erreicht 192.168.10.1 **nicht** (gewollt).
- `Get-VMSwitch Testnetz` → SwitchType **Internal**.

### Vorbeugung
- Switch-Typen im Netzplan dokumentieren: Extern = LAN, Intern = Host + VMs, Privat = nur VMs.
- Für isolierte Labs mit Host-Zugriff direkt **intern** anlegen; für reine VM-Isolation **privat**.

## Einfach

Stell dir drei Arten von **Spielplätzen** vor:
- **Extern**: Der Spielplatz hat ein **Tor zur Straße** – Kinder (VMs), Eltern (Host) und alle Nachbarn können kommen.
- **Intern**: Der Spielplatz liegt **im eigenen Garten**. Die Kinder spielen miteinander, und die **Eltern können aus dem Haus raus** zu ihnen. Zur Straße geht es nicht.
- **Privat**: Der Spielplatz ist eine **abgeschlossene Insel**. Nur die Kinder sind dort. Nicht mal die Eltern kommen hin!

Bei TEST01 und TEST02 war der Spielplatz eine **Insel** (privat). Sie konnten miteinander spielen, aber nicht zum Haus (Host), um sich Spielzeug (Installationsdateien) zu holen.

Die Lösung: Aus der Insel einen **Garten-Spielplatz** machen (intern). Dann bekommt das Haus eine **Gartentür** (vEthernet-Adapter) mit einer Hausnummer (IP 172.16.50.1). Die Straße bleibt trotzdem zu.

## Merksatz
- **Privat** = nur VMs. **Intern** = VMs + Host. **Extern** = VMs + Host + LAN.
- Interner Switch → Host bekommt **vEthernet** – IP selbst setzen.
- Abgeschottet mit Host-Zugriff = **intern** ohne Routing.

## Prüfungsfalle
- Ein **privater** Switch hat keinen Host-Adapter – keine Firewallregel hilft.
- Ein **interner** Switch bringt VMs **nicht** ins LAN (außer der Host routet/NAT).
- Im internen Netz gibt es **kein DHCP** automatisch.
- Neues internes Netz wird oft als **öffentlich** eingestuft → Freigaben blockiert.

## Grafik
### Insel oder Garten
1. TEST01 -> Testnetz: SMB-Anfrage an 172.16.50.1
2. Testnetz: Privater Switch – kein Host-Adapter, Anfrage läuft ins Leere
3. Admin -> HV01: Switch-Typ auf Intern ändern
4. HV01: vEthernet Testnetz mit 172.16.50.1 angelegt
5. TEST01 -> HV01: SMB-Anfrage erreicht den Host
6. HV01 -> TEST01: Freigabe Setup geliefert

## Lab
**Maschinen**: Host **HV01.example.com**, VMs **TEST01** und **TEST02**, Freigabe `\\HV01\Setup` (C:\Setup).
Nachstellen: Zuerst den Fehler bewusst erzeugen, dann beheben.

### GUI
1. **HV01**: Hyper-V-Manager → Manager für virtuelle Switches → Neuer virtueller Netzwerkswitch → **Privat** → Name „Testnetz“ → OK; TEST01 und TEST02 daran anschließen (Fehlerzustand).
2. **TEST01**: IP 172.16.50.11/24 → `ping 172.16.50.12` klappt, Host nicht erreichbar.
3. **HV01**: Manager für virtuelle Switches → Testnetz → Verbindungstyp **Internes Netzwerk** → OK.
4. **HV01**: Netzwerkverbindungen → **vEthernet (Testnetz)** → IPv4 → 172.16.50.1 / 255.255.255.0, **kein** Gateway → OK.
5. **HV01**: Windows Defender Firewall mit erweiterter Sicherheit → Eingehende Regeln → **Datei- und Druckerfreigabe (SMB eingehend)** → Bereich Remote-IP 172.16.50.0/24 → für das passende Profil aktivieren.
6. **TEST01**: Explorer → `\\172.16.50.1\Setup` → Dateien sichtbar.
7. **TEST01**: `ping 192.168.10.1` → keine Antwort (Isolation bleibt).

### PowerShell
1. **HV01**: privaten Switch anlegen (Fehler).
2. **HV01**: auf intern umstellen und IP setzen.
3. **HV01**: Firewall gezielt öffnen und testen.

```powershell
# Auf HV01 – Fehlerzustand
New-VMSwitch -Name "Testnetz" -SwitchType Private
Connect-VMNetworkAdapter -VMName TEST01, TEST02 -SwitchName "Testnetz"

# Auf HV01 – Beheben
Set-VMSwitch -Name "Testnetz" -SwitchType Internal
New-NetIPAddress -InterfaceAlias "vEthernet (Testnetz)" -IPAddress 172.16.50.1 -PrefixLength 24
Get-NetConnectionProfile -InterfaceAlias "vEthernet (Testnetz)"
New-NetFirewallRule -DisplayName "SMB aus Testnetz" -Direction Inbound -Protocol TCP -LocalPort 445 -RemoteAddress 172.16.50.0/24 -Action Allow

# In TEST01 (per PowerShell Direct)
Invoke-Command -VMName TEST01 -Credential (Get-Credential) -ScriptBlock {
  Test-NetConnection 172.16.50.1 -Port 445
  Test-Connection 192.168.10.1 -Count 1 -Quiet      # erwartet: False
}
```

## Szenario
### Kontrollfragen
TEST01 und TEST02 hängen an einem privaten Switch, erreichen sich gegenseitig, aber nicht den Host.
- F: Warum erreichen die VMs den Host nicht? | A: Ein privater Switch hat keinen virtuellen Adapter im Host; der Host ist in diesem Netz nicht vorhanden.
- F: Welcher Switch-Typ erfüllt „isoliert, aber Host erreichbar“? | A: Ein interner Switch.
- F: Wie ändert man den Typ ohne Neuanlage? | A: Set-VMSwitch -Name Testnetz -SwitchType Internal
- F: Was muss am vEthernet-Adapter konfiguriert werden? | A: Eine statische IP im Testnetz (z. B. 172.16.50.1/24), ohne Gateway.
- F: Warum kann die Freigabe trotzdem blockiert sein? | A: Das neue Netz ist oft als öffentlich eingestuft; die Firewall blockiert SMB, bis eine passende Regel greift.

## Reihenfolge
### Vom privaten zum internen Switch
1. Switch-Typ prüfen
2. Switch auf Intern umstellen
3. Statische IP am vEthernet-Adapter setzen
4. Firewallregel für das Testnetz anlegen
5. Zugriff auf die Freigabe testen
6. Isolation zum LAN prüfen

## Legende
### Switch-Typen
- Was: Extern (mit physischer NIC), Intern (VMs und Host), Privat (nur VMs).
- Wie: Manager für virtuelle Switches bzw. `New-VMSwitch -SwitchType Internal|Private` oder `-NetAdapterName` für extern.
- Wann: extern für Produktion, intern für Labs mit Host-Zugriff oder NAT, privat für vollständig isolierte VM-Netze.
- Wo: auf dem Hyper-V-Host HV01.
- Warum: legt fest, wer mit wem kommunizieren kann – Grundlage für Isolation und Sicherheit.

## Karteikarten
- F: Wer kommuniziert über einen privaten Switch? | A: Nur die angeschlossenen VMs untereinander.
- F: Wer kommuniziert über einen internen Switch? | A: Die VMs untereinander und mit dem Host.
- F: Was erhält der Host bei einem internen Switch? | A: Einen virtuellen Adapter „vEthernet (<Switchname>)“.
- F: Gibt es im internen Netz automatisch DHCP? | A: Nein.
- F: Wie ändert man den Switch-Typ? | A: Set-VMSwitch -Name <Switch> -SwitchType Internal bzw. Private
- F: Bringt ein interner Switch VMs ins LAN? | A: Nein, nur wenn der Host routet oder NAT bereitstellt.
- F: Welches Netzwerkprofil erhält ein neues internes Netz oft? | A: Öffentlich (nicht identifiziertes Netzwerk).
- F: Welcher Switch-Typ ist für eine komplett isolierte Malware-Analyse geeignet? | A: Privat.

## Quiz
? VMs an einem Switch erreichen sich, aber nicht den Host. Welcher Typ liegt vor?
* Privat
- Intern
- Extern mit Verwaltungs-OS
- Standardswitch
! Nur der private Switch hat keinen Host-Adapter.

? Welcher Typ erlaubt VMs und Host, aber nicht das LAN?
* Intern
- Privat
- Extern
- Gar keiner
! Der interne Switch verbindet VMs und Host.

? Welcher Befehl wandelt den Switch um?
* Set-VMSwitch -Name Testnetz -SwitchType Internal
- Convert-VMSwitch -Internal
- New-VMSwitch -Replace
- Set-VMNetworkAdapter -SwitchType Internal
! Set-VMSwitch kann zwischen intern und privat wechseln.

? Was fehlt nach der Umstellung oft noch?
* Eine IP-Adresse am vEthernet-Adapter
- Eine VLAN-ID an jeder VM
- MAC-Spoofing
- Ein vTPM
! Im internen Netz gibt es kein automatisches DHCP.

? Warum wird der Freigabezugriff trotz internem Switch blockiert?
* Das Netzwerk ist als öffentlich eingestuft und die Firewall blockiert SMB
- Interne Switches unterstützen kein TCP
- SMB geht nur über externe Switches
- Die VMs brauchen Gen 1
! Eine gezielte Firewallregel löst das.

? Welche Switch-Art bindet eine physische Netzwerkkarte?
* Extern
- Intern
- Privat
- Alle drei
! Intern und privat sind rein virtuell.

? Wie erreichen VMs an einem internen Switch das Internet?
* Über NAT oder Routing auf dem Host
- Automatisch
- Über MAC-Spoofing
- Gar nicht möglich
! Ohne NAT/Routing bleibt das interne Netz isoliert.

? Was sollte am vEthernet-Adapter des Testnetzes NICHT gesetzt werden, um Routing zu vermeiden?
* Ein Standardgateway
- Eine IP-Adresse
- Eine Subnetzmaske
- Ein Adaptername
! Ein Gateway am Host-Adapter kann zusätzliche Routen erzeugen.
