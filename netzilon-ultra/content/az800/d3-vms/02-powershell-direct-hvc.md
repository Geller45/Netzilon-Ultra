---
id: az800-powershell-direct
bereich: AZ-800
block: A7
kapitel: VMs & Container
titel: PowerShell Direct & HVC.exe
stufe: Fortgeschritten
quellen: [AZ-800 Study Guide, Microsoft Learn]
verweise: [az800-powershell-remoting, az800-enhanced-session, az800-integrationsdienste, az800-vswitch]
---

## Profi

### PowerShell Direct
**PowerShell Direct** führt PowerShell-Befehle **vom Hyper-V-Host direkt in einer VM** aus – **ohne Netzwerk**, ohne WinRM-Konfiguration, ohne Firewallregeln, ohne TrustedHosts. Die Verbindung läuft über den **VMBus** (Hyper-V-Socket).
**Voraussetzungen**:
- Host und Gast: **Windows 10 / Windows Server 2016** oder neuer.
- Befehle werden **auf dem Host** ausgeführt, auf dem die VM läuft (nicht remote über einen anderen Rechner – dafür erst per Remoting auf den Host).
- VM ist **gestartet** und das Gastbetriebssystem ist **hochgefahren**.
- Man benötigt **Anmeldeinformationen des Gasts** (lokales Konto oder Domänenkonto des Gasts) und muss auf dem Host **Hyper-V-Administrator** bzw. Admin sein.
- Integrationsdienst „**Hyper-V PowerShell Direct**“/Gastdienste aktiv (Standard).
**Verwendung**:
```powershell
Enter-PSSession -VMName SRV01 -Credential SRV01\Administrator      # interaktiv
Invoke-Command -VMName SRV01, SRV02 -Credential $cred -ScriptBlock { ... }
$s = New-PSSession -VMName SRV01 -Credential $cred
Copy-Item -ToSession $s -Path C:\Setup\app.msi -Destination C:\Temp\   # Dateien ohne Netzwerk kopieren
Copy-Item -FromSession $s -Path C:\Logs\*.log -Destination C:\Sammel\
```
Statt `-VMName` auch **`-VMId`** (GUID, eindeutig bei gleichen Namen).

**Typische Einsätze**:
- **Frisch installierte VM** konfigurieren, bevor Netzwerk/Domäne existieren: Name, IP, Domänenbeitritt, Rollen – vollständig automatisierbar.
- VM mit **defekter Netzwerkkonfiguration** oder **Firewall-Aussperrung** reparieren.
- **Isolierte VMs** (private Switches, DMZ) verwalten.
- Dateien in/aus VMs kopieren (`Copy-Item -ToSession/-FromSession`).

**Grenzen**: nur Windows-Gäste; nur vom lokalen Host; kein Ersatz für normales Remoting bei vielen Servern über das Netz.

### HVC.exe (Hyper-V-Host-Compute-Befehl)
**`hvc.exe`** ist ein Befehlszeilenwerkzeug auf dem Hyper-V-Host (Windows 10 1809+/Server 2019+) zur Verwaltung von VMs und zum **SSH-Zugriff über den VMBus**:
- `hvc list` – VMs auflisten
- `hvc start VM` / `hvc stop VM` / `hvc kill VM` (hart ausschalten)
- `hvc ssh benutzer@VM` – **SSH-Verbindung ohne Netzwerk** (über Hyper-V-Sockets), ideal für **Linux-VMs** (Gegenstück zu PowerShell Direct für Linux). Im Linux-Gast muss der SSH-Server auf dem hv_sock/vsock lauschen (z. B. mit `hv_sock`-Unterstützung).
- `hvc nc VM Port` – Netcat-ähnliche Verbindung zu einem Port der VM über VMBus
- `hvc serial VM` – serielle Konsole der VM
- `hvc help`

### Vergleich der Zugriffswege auf VMs
| Weg | Netzwerk | Gast-OS | Einsatz |
|---|---|---|---|
| VM-Verbindung (Basissitzung) | nein | alle | Konsole, Setup |
| Erweiterte Sitzung | nein | Windows (RDP), Linux mit xrdp | GUI, Dateien |
| **PowerShell Direct** | **nein** | Windows 10/Server 2016+ | Automatisierung |
| **hvc ssh** | **nein** | Linux (vsock-SSH) | Linux-Shell |
| PowerShell Remoting/SSH/RDP | ja | alle | Verwaltung von überall |

## Lab
**Maschinen**: Hyper-V-**Host**, VM **SRV05** (frisch installiert, noch ohne Netzwerkkarte), DC01 (Domäne contoso.local), Linux-VM **LNX01** (optional).

### Befehle (alle auf dem Hyper-V-Host)
```powershell
# 1. Anmeldeinformationen des Gasts
$lokal = Get-Credential SRV05\Administrator

# 2. Frische VM ohne Netzwerk konfigurieren
Invoke-Command -VMName SRV05 -Credential $lokal -ScriptBlock {
  Rename-Computer -NewName SRV05 -Force
  Set-TimeZone -Id "W. Europe Standard Time"
}
Restart-VM -Name SRV05 -Force -Wait -For Heartbeat

# 3. Netzwerkkarte hinzufügen und IP per PowerShell Direct setzen
Add-VMNetworkAdapter -VMName SRV05 -SwitchName "LAN"
Invoke-Command -VMName SRV05 -Credential $lokal -ScriptBlock {
  $nic = Get-NetAdapter | Select-Object -First 1
  New-NetIPAddress -InterfaceIndex $nic.ifIndex -IPAddress 192.168.1.105 -PrefixLength 24 -DefaultGateway 192.168.1.254
  Set-DnsClientServerAddress -InterfaceIndex $nic.ifIndex -ServerAddresses 192.168.1.1
}

# 4. Domänenbeitritt
$dom = Get-Credential CONTOSO\Administrator
Invoke-Command -VMName SRV05 -Credential $lokal -ScriptBlock {
  Add-Computer -DomainName contoso.local -Credential $using:dom -Restart
}

# 5. Interaktiv und Dateien kopieren (danach mit Domänenkonto)
Enter-PSSession -VMName SRV05 -Credential $dom
Exit-PSSession
$s = New-PSSession -VMName SRV05 -Credential $dom
Copy-Item -ToSession $s -Path C:\ISO\tools.zip -Destination C:\Temp\ -Force
Remove-PSSession $s

# 6. Firewall-Aussperrung reparieren (Netz-Remoting geht nicht mehr)
Invoke-Command -VMName SRV05 -Credential $dom { Set-NetFirewallProfile -All -DefaultInboundAction Block; Enable-NetFirewallRule -DisplayGroup "Windows-Remoteverwaltung" }

# 7. HVC
hvc list
hvc ssh admin@LNX01
hvc kill SRV-HAENGT
```

## Einfach

Normalerweise sprichst du mit einem Server über das **Netzwerk** (wie telefonieren). Aber was, wenn die VM **noch gar kein Netzwerk** hat, oder die Netzwerkeinstellungen kaputt sind, oder die Firewall alles blockiert? Dann ist das Telefon tot.

**PowerShell Direct** ist wie ein **Sprachrohr durch die Wand** zwischen dem Host (dem Haus) und der VM (einem Zimmer im Haus). Weil die VM im selben Haus wohnt, kannst du direkt durch die Wand rufen – **ohne Telefon (Netzwerk)**. Du brauchst nur:
- ein **neues Windows** (ab Windows 10/Server 2016) in Haus und Zimmer,
- den **Schlüssel des Zimmers** (Benutzername und Passwort der VM),
- und du musst **im Haus stehen** (die Befehle auf dem Host ausführen).

Damit kannst du einer brandneuen VM sagen: „Heiß ab jetzt SRV05, nimm diese IP, tritt der Domäne bei“ – alles automatisch, bevor sie überhaupt im Netz ist. Sogar Dateien kannst du durch die Wand reichen.

**hvc ssh** ist dasselbe Sprachrohr für **Linux-Zimmer**.

## Merksatz
- PowerShell Direct: **-VMName** statt -ComputerName, **kein Netzwerk**, über **VMBus**.
- Nur **auf dem Host**, Gast/Host ab **Windows 10/Server 2016**.
- Benötigt **Gast-Anmeldeinformationen**.
- Dateien: `Copy-Item -ToSession/-FromSession`.
- **hvc ssh** = SSH ohne Netzwerk (Linux).

## Prüfungsfalle
- PowerShell Direct funktioniert nicht von einem entfernten Admin-PC aus (nur lokal auf dem Host).
- Man braucht die Anmeldeinformationen des Gasts, nicht nur Host-Adminrechte.
- VM muss laufen und vollständig gestartet sein.
- Ältere Gäste (Server 2012 R2) unterstützen PowerShell Direct nicht.
- -ComputerName verwendet WinRM über Netzwerk, -VMName PowerShell Direct.

## Grafik
### Sprachrohr durch die Wand
Haus (Host) mit mehreren Zimmern (VMs); eine VM ohne Netzwerkkabel; der Admin spricht durch ein Rohr (VMBus) Befehle hinein; die VM bekommt Namen, IP und Domänenschild.

### Zugriffswege
Tabelle als Straßenkarte: Netzwerkstraßen (RDP, WinRM) vs. Geheimgänge im Haus (Basissitzung, erweiterte Sitzung, PowerShell Direct, hvc).

## Karteikarten
- F: Was ist PowerShell Direct? | A: PowerShell-Verbindung vom Hyper-V-Host in eine VM über den VMBus – ohne Netzwerk.
- F: Welchen Parameter nutzt PowerShell Direct? | A: -VMName (oder -VMId) statt -ComputerName.
- F: Mindestversion für PowerShell Direct? | A: Windows 10 / Windows Server 2016 (Host und Gast).
- F: Wo müssen PowerShell-Direct-Befehle ausgeführt werden? | A: Lokal auf dem Hyper-V-Host, auf dem die VM läuft.
- F: Welche Anmeldeinformationen sind nötig? | A: Die des Gastbetriebssystems (lokal oder Domäne).
- F: Wie kopiert man Dateien per PowerShell Direct? | A: Copy-Item -ToSession/-FromSession mit einer PSSession per -VMName.
- F: Wofür nutzt man hvc ssh? | A: SSH-Verbindung zu (Linux-)VMs über den VMBus ohne Netzwerk.
- F: Typischer Einsatz von PowerShell Direct? | A: Neue VMs vor dem Netzwerk-/Domänenbeitritt konfigurieren oder ausgesperrte VMs reparieren.

## Quiz
? Eine VM hat eine falsch konfigurierte IP und ist per Netzwerk nicht erreichbar. Wie konfiguriert man sie per Skript am schnellsten?
* Mit PowerShell Direct vom Hyper-V-Host (Invoke-Command -VMName)
- Mit Invoke-Command -ComputerName über WinRM
- Mit RDP
- Mit WAC

? Welche Voraussetzung gilt für PowerShell Direct?
* Befehle werden lokal auf dem Hyper-V-Host ausgeführt, Gast ist Windows 10/Server 2016 oder neuer
- Die VM muss eine öffentliche IP haben
- TrustedHosts muss konfiguriert sein
- Port 5986 muss offen sein

? Welcher Parameter kennzeichnet PowerShell Direct?
* -VMName
- -ComputerName
- -HostName
- -UseSSL

? Wie kann man per SSH ohne Netzwerk auf eine Linux-VM zugreifen?
* hvc ssh
- Enter-PSSession -VMName mit Linux
- mstsc
- netsh

? Mit welchem Befehl kopiert man eine Datei per PowerShell Direct in eine VM?
* Copy-Item -ToSession $s
- robocopy \\VM\C$
- Copy-VMFile ohne Gastdienste
- xcopy /vm

? Welche Anmeldedaten verlangt PowerShell Direct?
* Gültige Anmeldedaten des Gastbetriebssystems
- Die Anmeldedaten des Hyper-V-Hosts genügen
- Keine Anmeldedaten
- Ein Zertifikat aus der Azure-PKI
! Der Zugriff erfolgt über den VMBus, nicht über das Netzwerk.

? Mit welchem Parameter öffnet man eine Sitzung per Name einer VM?
* -VMName (oder -VMId)
- -ComputerName
- -HostName
- -IPAddress
! Beispiel: Enter-PSSession -VMName SRV01 -Credential (Get-Credential).

? Wo muss ein PowerShell-Direct-Befehl ausgeführt werden?
* Auf dem Hyper-V-Host, auf dem die VM läuft
- Auf einem beliebigen Domänenclient
- In Azure Cloud Shell
- Auf dem Domänencontroller
! Remote-Hosts benötigen erst eine Sitzung auf dem Host.
