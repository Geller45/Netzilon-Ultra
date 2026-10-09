---
id: az800-powershell-remoting
bereich: AZ-800
block: A7
kapitel: Hybrid-Verwaltung
titel: PowerShell Remoting (WinRM, SSH)
stufe: Fortgeschritten
quellen: [AZ-800 Study Guide, 01-Einführung.pdf]
verweise: [ap1-a6-powershell, az800-credssp-delegation, az800-jea, az800-wac, az800-powershell-direct]
---

## Profi

### Grundlagen
**PowerShell Remoting** führt Befehle auf entfernten Computern aus – die Ergebnisse kommen als (deserialisierte) **Objekte** zurück. Basis unter Windows: **WS-Management (WS-Man)**, implementiert durch den Dienst **WinRM** (Windows-Remoteverwaltung).
| | HTTP | HTTPS |
|---|---|---|
| Port | **5985** | **5986** |
| Verschlüsselung | Nachrichten dennoch per Kerberos/NTLM verschlüsselt (Domäne) | TLS mit Zertifikat |
| Einsatz | Domäne (Standard) | Workgroup, DMZ, über Grenzen |
Seit **Server 2012** ist Remoting auf Servern **standardmäßig aktiviert** (Firewallregel nur für Domänen-/Privat-Profil bzw. lokales Subnetz im öffentlichen Profil). Auf **Clients** muss es aktiviert werden: `Enable-PSRemoting` (startet WinRM, erstellt Listener, Firewallregeln, registriert Session-Konfigurationen).
Standardmäßig dürfen sich nur **Administratoren** und die Gruppe **Remoteverwaltungsbenutzer** (Remote Management Users) verbinden.

### Arbeitsweisen
| Methode | Befehl | Einsatz |
|---|---|---|
| **1:1 interaktiv** | `Enter-PSSession -ComputerName SRV01` → Prompt `[SRV01]: PS>`; `Exit-PSSession` | wie eine SSH-Sitzung |
| **1:n (Fan-out)** | `Invoke-Command -ComputerName SRV01,SRV02 -ScriptBlock { Get-Service W32Time }` – parallel (Standard **32** gleichzeitig, `-ThrottleLimit`) | Massenverwaltung |
| Skriptdatei | `Invoke-Command -ComputerName (Get-Content server.txt) -FilePath C:\skript.ps1` | |
| **Persistente Sitzung** | `$s = New-PSSession SRV01,SRV02` → `Invoke-Command -Session $s {…}` → Variablen bleiben erhalten; `Remove-PSSession` | mehrere Schritte |
| **Getrennte Sitzung** | `Disconnect-PSSession`, später `Connect-PSSession`/`Receive-PSSession` | lange Jobs |
| **Implizites Remoting** | `Import-PSSession -Session $s -Module ActiveDirectory -Prefix Rem` bzw. `Import-Module -PSSession` | Cmdlets eines entfernten Servers lokal nutzen |
| **-ComputerName-Parameter** mancher Cmdlets | `Get-Service -ComputerName` (nur Windows PowerShell 5.1, eigenes RPC/DCOM) | alt, nicht mehr empfohlen |
| **CIM-Sitzungen** | `New-CimSession SRV01` + `Get-CimInstance -CimSession` | WMI über WinRM |
Lokale Variablen in Remote-Skriptblöcken: `$using:variable` oder `-ArgumentList`.

### Rückgabeobjekte
Remote-Ergebnisse sind **deserialisiert** („Deserialized.System.ServiceProcess.ServiceController“) – Eigenschaften vorhanden, **Methoden fehlen**, zusätzliche Eigenschaft **PSComputerName**. Deshalb Aktionen (z. B. Dienst stoppen) **im Skriptblock remote** ausführen, nicht lokal mit dem Ergebnisobjekt.

### Authentifizierung und Vertrauen
- **Domäne**: Kerberos (Zielname muss aufgelöst werden; **per IP** → NTLM, was TrustedHosts erfordert).
- **Arbeitsgruppe/andere Domäne ohne Trust**: **TrustedHosts** am **Client** eintragen (`Set-Item WSMan:\localhost\Client\TrustedHosts`), lokales Admin-Konto des Ziels verwenden; besser **HTTPS** mit Zertifikat.
- Lokale Admin-Konten (außer dem integrierten Administrator) werden remote durch **UAC-Remotefilterung** eingeschränkt (`LocalAccountTokenFilterPolicy`) – Domänenkonten nicht.
- **Zweiter Hop** (Remote-Sitzung greift auf dritte Ressource zu) → siehe **CredSSP/Kerberos-Delegierung**.

### PowerShell-Remoting über SSH
Ab **PowerShell 7** plattformübergreifend über **OpenSSH** (Windows ↔ Linux/macOS): `Enter-PSSession -HostName linux01 -UserName root` bzw. `-SSHTransport`. OpenSSH-Server ist in Windows Server 2019+ als Feature verfügbar (Server 2025 vorinstalliert, deaktiviert). Voraussetzung: PowerShell-Subsystem in `sshd_config` eintragen.

### Absicherung und Konfiguration
- WinRM per **GPO** konfigurieren: Computerkonfiguration → Administrative Vorlagen → Windows-Komponenten → Windows-Remoteverwaltung → WinRM-Dienst → „Remoteserververwaltung über WinRM zulassen“ (IPv4/IPv6-Filter), Dienst **WinRM** auf Automatisch, Firewallregel „Windows-Remoteverwaltung (HTTP eingehend)“.
- **Session-Konfigurationen** (Endpunkte): `Get-PSSessionConfiguration` – `Microsoft.PowerShell` (Standard), eigene eingeschränkte Endpunkte → **JEA**.
- **Protokollierung**: Script Block Logging, Transcription (GPO „PowerShell“) – wichtig für Sicherheit.
- Zu Azure-VMs: Remoting über VPN/Bastion oder **Azure Run Command** (`Invoke-AzVMRunCommand`) ohne Netzwerkzugriff; für Arc-Server **Run Command/SSH über Arc**.

## Lab
**Maschinen**: CL01 (Admin-PC), SRV01, SRV02 (Domäne), SRV-WG01 (Arbeitsgruppe).

### Befehle (alle auf CL01, sofern nicht anders angegeben)
```powershell
# Auf CL01 (Client) aktivieren – für Verbindungen ZU CL01, nicht nötig für ausgehende
Enable-PSRemoting -Force

# 1:1
Enter-PSSession -ComputerName SRV01
Get-Service W32Time
hostname
Exit-PSSession

# 1:n
Invoke-Command -ComputerName SRV01, SRV02 -ScriptBlock { Get-Service W32Time } |
  Format-Table PSComputerName, Name, Status

# Persistente Sitzungen mit Variablen
$s = New-PSSession -ComputerName SRV01, SRV02
Invoke-Command -Session $s -ScriptBlock { $zeit = Get-Date }
Invoke-Command -Session $s -ScriptBlock { "Sitzung läuft seit $zeit" }
$pfad = "C:\Logs"
Invoke-Command -Session $s -ScriptBlock { New-Item -Path $using:pfad -ItemType Directory -Force }
Remove-PSSession $s

# Deserialisierte Objekte ansehen
Invoke-Command -ComputerName SRV01 { Get-Service W32Time } | Get-Member   # keine Methoden!

# Implizites Remoting: AD-Cmdlets vom DC lokal nutzen
$dc = New-PSSession -ComputerName DC01
Import-PSSession -Session $dc -Module ActiveDirectory -Prefix DC
Get-DCADUser -Filter * | Select-Object -First 3

# Arbeitsgruppen-Server
Set-Item WSMan:\localhost\Client\TrustedHosts -Value "SRV-WG01" -Concatenate -Force
Enter-PSSession -ComputerName SRV-WG01 -Credential SRV-WG01\Administrator

# Auf SRV01 – Endpunkte und Rechte
Get-PSSessionConfiguration | Select-Object Name, Permission
Add-LocalGroupMember -Group "Remoteverwaltungsbenutzer" -Member "CONTOSO\GG-Helpdesk"

# SSH-Remoting (PowerShell 7) zu einem Linux-Server
Enter-PSSession -HostName linux01.contoso.local -UserName admin -SSHTransport
```

### GUI (GPO für alle Server)
1. **DC01**: GPO „WinRM Server“ → Computerkonfiguration → Richtlinien → Administrative Vorlagen → Windows-Komponenten → Windows-Remoteverwaltung (WinRM) → **WinRM-Dienst** → „Remoteserververwaltung über WinRM zulassen“ → Aktiviert, IPv4-Filter `*`.
2. Computerkonfiguration → Einstellungen → Systemsteuerungseinstellungen → **Dienste** → WinRM → Automatisch/Starten.
3. Windows Defender Firewall mit erweiterter Sicherheit → Eingehende Regel → Vordefiniert **Windows-Remoteverwaltung** → Domänenprofil.

## Einfach

**PowerShell Remoting** ist wie ein **Walkie-Talkie zu anderen Servern**: Du sitzt an deinem PC, sagst einen Befehl – und der Server im Keller führt ihn aus und funkt dir das Ergebnis zurück.

- **Enter-PSSession** = du **„beamst“ dich** auf einen Server und arbeitest dort, als säßest du davor.
- **Invoke-Command** = du **rufst gleichzeitig in 50 Walkie-Talkies**: „Alle Server: Zeigt mir euren Zeitdienst!“ – und alle antworten parallel. Das ist die Superkraft für Admins.
- **Sitzungen** (New-PSSession) = eine **stehende Funkverbindung**, bei der sich die Server merken, was du vorhin gesagt hast.

Die **Funkfrequenzen** sind Port **5985** (normal) und **5986** (verschlüsselt mit Zertifikat).

**Wichtig**: Was vom Server zurückkommt, ist nur ein **Foto** des Objekts (deserialisiert) – du kannst es anschauen, aber nicht mehr bedienen. Willst du einen Dienst stoppen, musst du den Befehl **auf dem Server** ausführen lassen.

**Fremde Server** (nicht in der Domäne): Da kennt dich keiner. Du musst sie erst auf deine **Liste vertrauenswürdiger Gesprächspartner** setzen (TrustedHosts) und dich mit einem lokalen Konto des Servers melden.

## Merksatz
- WinRM **5985 HTTP / 5986 HTTPS**.
- **Enter-PSSession** 1:1, **Invoke-Command** 1:n (32 parallel).
- Remote-Ergebnisse sind **deserialisiert** (keine Methoden, + PSComputerName).
- Lokale Variablen: **$using:**.
- Workgroup/IP → **TrustedHosts** + NTLM; besser HTTPS.

## Prüfungsfalle
- Verbindung per IP statt Name → Kerberos nicht möglich → TrustedHosts nötig.
- Enable-PSRemoting ist auf Servern (2012+) schon Standard, auf Clients nicht.
- Methoden auf deserialisierten Objekten funktionieren nicht.
- TrustedHosts wird am **Client** gesetzt, nicht am Zielserver.
- Zweiter Hop schlägt standardmäßig fehl (Delegierung nötig).

## Grafik
### Walkie-Talkie-Netz
Admin-PC in der Mitte; Invoke-Command sendet eine Welle an 4 Server, die gleichzeitig mit Ergebnissen antworten (Ergebnisse tragen Namensschilder = PSComputerName).

### Objekt vs. Foto
Links ein „echtes“ Dienstobjekt mit Knöpfen (Stop/Start); rechts das zurückgefunkte Foto ohne Knöpfe.

### TrustedHosts
Client mit einer Gästeliste; Domänenserver kommen per Kerberos-Ausweis durch; ein Workgroup-Server nur, wenn er auf der Liste steht.

## Karteikarten
- F: Welcher Dienst ist die Grundlage für PowerShell Remoting unter Windows? | A: WinRM (WS-Management).
- F: Ports von WinRM? | A: 5985 (HTTP), 5986 (HTTPS).
- F: Unterschied Enter-PSSession und Invoke-Command? | A: Enter-PSSession: interaktiv 1:1. Invoke-Command: Befehle auf vielen Computern parallel.
- F: Wie viele Verbindungen führt Invoke-Command standardmäßig parallel aus? | A: 32 (ThrottleLimit).
- F: Wie übergibt man lokale Variablen in einen Remote-Skriptblock? | A: Mit $using:Variable oder -ArgumentList.
- F: Was bedeutet „deserialisiert“? | A: Remote-Objekte kommen als Datenkopie zurück – mit Eigenschaften, ohne Methoden.
- F: Wann braucht man TrustedHosts? | A: Bei Verbindungen zu Nicht-Domänen-/nicht vertrauten Computern oder per IP (NTLM).
- F: Welche lokale Gruppe erlaubt Remoting ohne Adminrechte? | A: Remoteverwaltungsbenutzer (Remote Management Users).
- F: Was ist implizites Remoting? | A: Cmdlets eines entfernten Systems per Import-PSSession lokal verwenden.
- F: Womit funktioniert Remoting zu Linux? | A: PowerShell 7 über SSH (-HostName/-SSHTransport).

## Quiz
? Ein Admin will auf 200 Servern gleichzeitig einen Dienststatus abfragen. Welches Cmdlet?
* Invoke-Command
- Enter-PSSession
- Get-Service ohne Parameter
- Test-Connection

? Eine Remote-Verbindung per IP-Adresse zu einem Domänenserver schlägt fehl. Warum?
* Per IP ist kein Kerberos möglich; NTLM erfordert TrustedHosts
- WinRM funktioniert nur mit IPv6
- Der Server ist kein DC
- Port 3389 ist geschlossen

? Welcher Port wird für WinRM über HTTPS verwendet?
* 5986
- 5985
- 443
- 22

? Wie verwendet man die lokale Variable $pfad in einem Invoke-Command-Skriptblock?
* $using:pfad
- $remote:pfad
- $global:pfad
- $pfad funktioniert automatisch

? Was fehlt Objekten, die per Invoke-Command zurückkommen?
* Die Methoden
- Die Eigenschaften
- Der Objekttyp
- Die Werte

? Welches Cmdlet startet eine interaktive Remotesitzung?
* Enter-PSSession
- Invoke-Command
- New-PSDrive
- Start-Process
! Mit Exit-PSSession wird sie beendet.

? Welcher Port wird für WinRM über HTTP standardmäßig genutzt?
* 5985
- 5986
- 22
- 3389
! HTTPS nutzt 5986; der Datenstrom ist in der Domäne per Kerberos verschlüsselt.

? Wie aktiviert man PowerShell Remoting auf einem Server?
* Enable-PSRemoting
- Set-ExecutionPolicy Unrestricted
- Install-Module Remoting
- netsh firewall set opmode disable
! Auf Windows Server ist Remoting standardmäßig aktiviert.
