---
id: server-hvsz-25
bereich: AZ-800
block: HV-S
kapitel: Hyper-V-Praxisszenarien
titel: Szenario 25 – PowerShell Direct: Server-VM ohne Netzwerk konfigurieren
stufe: Fortgeschritten
fach: Windows Server / AZ-800
pruefungen: [AZ-800, AP2, Schule]
quellen: [Microsoft Learn – Hyper-V]
verweise: [az800-powershell-direct, az800-powershell-remoting, az800-enhanced-session, server-hvsz-24]
---

## Profi

### Ticket
**Kunde meldet:** „Der neue Server Core SRV05 hat nach einer falschen IP-Konfiguration kein Netzwerk mehr, und die Firewall blockiert alles. RDP und WinRM gehen nicht. Ich möchte ihn trotzdem per PowerShell reparieren – Enter-PSSession -VMName sagt aber ‚Die Anmeldeinformationen sind ungültig‘.“
- Datum/Priorität: 09.10.2026, **Priorität 3 (normal)**.
- Betroffene Maschinen: Host **HV01.example.com**, VM **SRV05** (Server 2025 Core), Admin-PC **ADMIN01**.

### Ausgangslage
- HV01: Server 2025. SRV05: Gen 2, frisch installiert, lokaler Administrator gesetzt, noch **nicht** in der Domäne; IP versehentlich 192.168.100.5/24 ohne Gateway.
- Der Admin hat es zunächst von **ADMIN01** aus mit `Enter-PSSession -VMName SRV05` versucht und dann auf HV01 mit seinem **Domänenkonto** EXAMPLE\admin.

### Analyse
**PowerShell Direct** verbindet sich **vom Hyper-V-Host** über den **VMBus** in eine VM – ohne Netzwerk, Firewall oder WinRM-Konfiguration im Gast.

**Voraussetzungen laut Microsoft:**
- Host und Gast: **Windows 10 / Windows Server 2016 oder neuer**.
- Ausführung **lokal auf dem Host**, auf dem die VM läuft (nicht von einem anderen Rechner).
- Benutzer ist auf dem Host **Hyper-V-Administrator** bzw. Administrator (Sitzung mit erhöhten Rechten).
- VM ist **gestartet** und das Gastbetriebssystem **hochgefahren**.
- **Anmeldeinformationen des Gasts** (lokales Konto oder Domänenkonto, das im Gast gültig ist).

| Hypothese | Prüfung |
|---|---|
| Ausführung von ADMIN01 statt auf HV01 | `-VMName` funktioniert nur lokal auf dem Host |
| Falsche Anmeldeinformationen (Domänenkonto, Gast ist kein Domänenmitglied) | Konto im Gast gültig? |
| VM nicht hochgefahren | `Get-VM SRV05` (State, Heartbeat) |
| Konsole ohne erhöhte Rechte | PowerShell „Als Administrator“ |
| Gast älter als Server 2016 | Betriebssystemversion |

**Befund:** 1. Versuch von ADMIN01 (nicht unterstützt), 2. Versuch mit Domänenkonto, obwohl SRV05 noch in einer Arbeitsgruppe ist → „Anmeldeinformationen ungültig“.

### Lösungsweg
1. **Auf HV01** eine PowerShell **als Administrator** öffnen (von ADMIN01 ggf. per `Enter-PSSession HV01` auf den Host) – Begründung: PowerShell Direct funktioniert nur vom Host aus.
2. **Gast-Anmeldeinformationen** verwenden: `SRV05\Administrator` (lokales Konto) – Begründung: Das Domänenkonto existiert für SRV05 noch nicht.
3. **Interaktive Sitzung**: `Enter-PSSession -VMName SRV05 -Credential SRV05\Administrator` – Begründung: Reparatur ohne Netzwerk.
4. **IP korrigieren** (192.168.10.55/24, Gateway 192.168.10.1, DNS 192.168.10.10) und **Firewall-Profil/Regeln** für Verwaltung anpassen – Begründung: Danach ist normale Remoteverwaltung wieder möglich.
5. Optional **Domänenbeitritt** per `Invoke-Command -VMName` und **Dateien kopieren** per `Copy-Item -ToSession` – Begründung: komplette Erstkonfiguration ohne Netzwerkfreigaben.

### Ergebnis prüfen
- `Invoke-Command -VMName SRV05 -Credential ... { Get-NetIPConfiguration }` zeigt 192.168.10.55.
- Von ADMIN01: `Test-NetConnection SRV05 -Port 5985` erfolgreich (WinRM), Server-Manager kann SRV05 verwalten.

### Vorbeugung
- Erstkonfiguration neuer VMs standardmäßig per PowerShell Direct skripten (Name, IP, Domäne).
- Lokale Administrator-Anmeldeinformationen sicher hinterlegen (z. B. Windows LAPS nach Domänenbeitritt).
- Netzwerkänderungen an Remote-Servern mit Rückfallplan durchführen.

## Einfach

Stell dir vor, die VM SRV05 sitzt in einem Raum, dessen **Tür zugemauert** ist (kein Netzwerk, Firewall zu). Von draußen (ADMIN01) kommt niemand mehr rein.

Aber der Host HV01 hat einen **geheimen Gang** direkt in den Raum (den VMBus). Durch diesen Gang kann man mit **PowerShell Direct** hineingehen – ohne Tür.

Regeln für den geheimen Gang:
- Man muss **im Haus HV01 stehen** – von der Straße (ADMIN01) aus findet man den Gang nicht.
- Man braucht den **Schlüssel des Raumes** (Anmeldeinformationen von SRV05), nicht den Schlüssel der Firma (Domänenkonto), wenn der Raum noch gar nicht zur Firma gehört.
- Der Raum muss **beleuchtet** sein (VM läuft und ist hochgefahren).
- Raum und Haus müssen **modern genug** sein (Windows Server 2016/Windows 10 oder neuer).

Drinnen repariert man die Tür (IP-Adresse, Firewall) – und danach kommt man auch wieder normal über das Netzwerk rein.

## Merksatz
- PowerShell Direct: `-VMName`, **nur auf dem Host**, **ohne Netzwerk**.
- Anmeldeinformationen **des Gasts** verwenden.
- VM **gestartet** und **hochgefahren**, ab **Server 2016/Windows 10**.
- Dateien: `Copy-Item -ToSession` / `-FromSession`.

## Prüfungsfalle
- PowerShell Direct braucht **keine** Firewallregel, **kein** WinRM, **keine** TrustedHosts.
- Von einem **anderen Rechner** geht es nicht direkt – erst auf den Host verbinden.
- Hyper-V-Admin auf dem Host reicht **nicht** ohne gültige **Gast**-Anmeldeinformationen.
- Für **Linux**-Gäste gibt es kein PowerShell Direct (dort z. B. `hvc ssh`).

## Grafik
### Geheimer Gang über den VMBus
1. ADMIN01 -> SRV05: Enter-PSSession -VMName – nicht möglich, kein Host
2. Admin -> HV01: PowerShell als Administrator auf dem Host
3. HV01 -> SRV05: Anmeldung mit Domänenkonto – ungültig, Gast nicht in Domäne
4. HV01 -> SRV05: Anmeldung mit SRV05 Administrator über den VMBus
5. SRV05: IP 192.168.10.55 und Firewall korrigiert
6. ADMIN01 -> SRV05: WinRM über das Netzwerk wieder erreichbar

## Lab
**Maschinen**: Host **HV01.example.com**, VM **SRV05** (Server 2025 Core, Arbeitsgruppe), Admin-PC **ADMIN01**.
Nachstellen: Zuerst den Fehler bewusst erzeugen, dann beheben.

### GUI
1. **SRV05**: VM-Verbindung → `sconfig` → **Netzwerkeinstellungen** → statische IP **192.168.100.5/24** ohne Gateway setzen (Fehlerzustand: kein Netz).
2. **ADMIN01**: PowerShell → `Enter-PSSession -VMName SRV05` → Fehler (VM auf diesem Rechner nicht gefunden).
3. **HV01**: Startmenü → **Windows PowerShell** → Rechtsklick → **Als Administrator ausführen**.
4. **HV01**: `Enter-PSSession -VMName SRV05 -Credential EXAMPLE\admin` → Fehler „Anmeldeinformationen ungültig“.
5. **HV01**: `Enter-PSSession -VMName SRV05 -Credential SRV05\Administrator` → Kennwort eingeben → Eingabeaufforderung `[SRV05]: PS C:\>`.
6. **SRV05** (in der Sitzung): IP, Gateway und DNS korrigieren, Verwaltungsfirewallregeln aktivieren (siehe PowerShell-Teil) → `Exit-PSSession`.
7. **ADMIN01**: Server-Manager → **Server hinzufügen** → SRV05 per IP/Name → Verwaltung funktioniert.

### PowerShell
1. **HV01**: Fehlversuche nachvollziehen.
2. **HV01**: Sitzung mit Gast-Anmeldeinformationen und Reparatur.
3. **HV01**: Dateien kopieren und Domänenbeitritt.

```powershell
# Auf ADMIN01 – Fehler: PowerShell Direct nur lokal auf dem Host
Enter-PSSession -VMName SRV05

# Auf HV01 (als Administrator) – Voraussetzungen prüfen
Get-VM -Name SRV05 | Select-Object Name, State, Heartbeat
Enter-PSSession -VMName SRV05 -Credential EXAMPLE\admin       # ungültig: Gast nicht in der Domäne

# Auf HV01 – mit Gast-Anmeldeinformationen reparieren
$lokal = Get-Credential SRV05\Administrator
Invoke-Command -VMName SRV05 -Credential $lokal -ScriptBlock {
  $nic = Get-NetAdapter | Select-Object -First 1
  Remove-NetIPAddress -InterfaceIndex $nic.ifIndex -Confirm:$false
  New-NetIPAddress -InterfaceIndex $nic.ifIndex -IPAddress 192.168.10.55 -PrefixLength 24 -DefaultGateway 192.168.10.1
  Set-DnsClientServerAddress -InterfaceIndex $nic.ifIndex -ServerAddresses 192.168.10.10
  # Gruppenname ist sprachabhängig (dt. "Windows-Remoteverwaltung", engl. "Windows Remote Management");
  # die Regelnamen WINRM-HTTP-In-TCP* sind sprachneutral:
  Get-NetFirewallRule -Name "WINRM-HTTP-In-TCP*" | Enable-NetFirewallRule
  Get-NetIPConfiguration
}

# Auf HV01 – Datei ohne Netzwerk kopieren und Domäne beitreten
$s = New-PSSession -VMName SRV05 -Credential $lokal
Copy-Item -ToSession $s -Path C:\Setup\agent.msi -Destination C:\Temp\agent.msi
Invoke-Command -Session $s -ScriptBlock { Add-Computer -DomainName example.com -Credential (Get-Credential EXAMPLE\admin) -Restart }
Remove-PSSession $s

# Auf ADMIN01 – Kontrolle über das Netzwerk
Test-NetConnection SRV05.example.com -Port 5985
```

## Szenario
### Kontrollfragen
SRV05 (Server Core, Arbeitsgruppe) hat kein Netzwerk. PowerShell Direct scheitert von ADMIN01 aus und auf HV01 mit einem Domänenkonto.
- F: Warum scheitert der Versuch von ADMIN01? | A: PowerShell Direct funktioniert nur lokal auf dem Hyper-V-Host, auf dem die VM läuft.
- F: Warum sind die Domänen-Anmeldeinformationen ungültig? | A: SRV05 ist noch kein Domänenmitglied; es werden Anmeldeinformationen benötigt, die im Gast gültig sind (SRV05\Administrator).
- F: Welche Voraussetzungen gelten noch? | A: Host und Gast ab Windows 10/Server 2016, VM gestartet und hochgefahren, PowerShell auf dem Host mit Administratorrechten.
- F: Wie kopiert man eine Datei ohne Netzwerk in die VM? | A: New-PSSession -VMName und Copy-Item -ToSession.
- F: Braucht PowerShell Direct eine Firewallregel im Gast? | A: Nein, die Verbindung läuft über den VMBus.

## Reihenfolge
### Server ohne Netzwerk per PowerShell Direct reparieren
1. Auf dem Hyper-V-Host PowerShell als Administrator öffnen
2. Prüfen, ob die VM läuft und hochgefahren ist
3. Gültige Gast-Anmeldeinformationen bereitstellen
4. Sitzung mit -VMName öffnen
5. IP-Konfiguration und Firewall korrigieren
6. Netzwerkverbindung von außen testen

## Legende
### PowerShell Direct
- Was: PowerShell-Remoting vom Hyper-V-Host in eine VM über den VMBus, ohne Netzwerk.
- Wie: `Enter-PSSession`, `Invoke-Command`, `New-PSSession` mit `-VMName` oder `-VMId` und Gast-Anmeldeinformationen.
- Wann: Erstkonfiguration neuer VMs, Reparatur bei Netzwerk-/Firewallfehlern, isolierte VMs.
- Wo: nur lokal auf dem Host, auf dem die VM läuft; Gast Windows 10/Server 2016 oder neuer.
- Warum: Verwaltung ist auch dann möglich, wenn die VM über das Netzwerk nicht erreichbar ist.

## Karteikarten
- F: Über welchen Kanal läuft PowerShell Direct? | A: Über den VMBus (Hyper-V-Socket), nicht über das Netzwerk.
- F: Von wo aus muss PowerShell Direct gestartet werden? | A: Lokal auf dem Hyper-V-Host, auf dem die VM läuft.
- F: Mindestversion von Host und Gast? | A: Windows 10 bzw. Windows Server 2016.
- F: Welche Anmeldeinformationen braucht man? | A: Anmeldeinformationen, die im Gast gültig sind (lokal oder Domäne, falls Mitglied).
- F: Welcher Parameter ersetzt -ComputerName? | A: -VMName (oder -VMId).
- F: Wie kopiert man Dateien in die VM? | A: Copy-Item -ToSession $s (Sitzung per New-PSSession -VMName).
- F: Braucht der Gast WinRM oder Firewallregeln? | A: Nein.
- F: Gibt es PowerShell Direct für Linux-Gäste? | A: Nein, dort z. B. hvc ssh über den VMBus.
- F: In welchem Zustand muss die VM sein? | A: Gestartet und das Gastbetriebssystem hochgefahren.

## Quiz
? Von wo aus funktioniert Enter-PSSession -VMName SRV05?
* Lokal auf dem Hyper-V-Host, auf dem SRV05 läuft
- Von jedem Domänenrechner
- Nur vom Domänencontroller
- Aus Azure Cloud Shell
! PowerShell Direct nutzt den VMBus des Hosts.

? Welche Anmeldeinformationen braucht man für eine Arbeitsgruppen-VM?
* Ein lokales Konto des Gasts, z. B. SRV05\Administrator
- Das Domänenkonto des Host-Admins
- Das Computerkonto des Hosts
- Keine
! Das Konto muss im Gast gültig sein.

? Was braucht PowerShell Direct NICHT?
* Netzwerkverbindung und Firewallregel im Gast
- Gast-Anmeldeinformationen
- Laufende VM
- Windows Server 2016 oder neuer
! Die Verbindung läuft über den VMBus.

? Ab welcher Version wird PowerShell Direct unterstützt?
* Windows 10 / Windows Server 2016
- Windows Server 2008 R2
- Windows Server 2012
- Windows 7
! Host und Gast benötigen mindestens diese Version.

? Wie kopiert man eine Datei ohne Netzwerk in die VM?
* Copy-Item -ToSession mit einer Sitzung aus New-PSSession -VMName
- Copy-Item \\SRV05\C$
- robocopy über SMB
- Move-VMStorage
! Alternativ Copy-VMFile mit Gastdienstschnittstelle.

? Welcher Parameter ist bei gleichnamigen VMs eindeutig?
* -VMId
- -VMName
- -ComputerName
- -HostName
! Die VM-ID ist eine GUID.

? Wie verbindet man sich in einen Linux-Gast ohne Netzwerk?
* hvc ssh über den VMBus
- Enter-PSSession -VMName
- Copy-VMFile
- Enable-PSRemoting
! PowerShell Direct gibt es nur für Windows-Gäste.

? Der Admin ist Hyper-V-Administrator auf HV01, verwendet aber ein im Gast ungültiges Konto. Ergebnis?
* Anmeldeinformationen ungültig
- Verbindung klappt trotzdem
- VM wird neu gestartet
- Automatischer Domänenbeitritt
! Host-Rechte ersetzen keine Gast-Anmeldung.
