---
id: az801-credential-guard
bereich: AZ-801
block: A9
kapitel: Sicherheit
titel: Microsoft Defender for Endpoint und Credential Guard
stufe: Fortgeschritten
quellen: [AZ-801 Study Guide, Microsoft Learn]
verweise: [az801-exploit-wdac, az801-protected-users, az801-defender-identity, az800-azure-arc]
---

## Profi

### Microsoft Defender for Endpoint (MDE)
**Cloudbasierte EDR-Plattform** (*Endpoint Detection and Response*) für **Clients und Server**: Erkennung, Untersuchung und Reaktion auf Angriffe.
| Baustein | Funktion |
|---|---|
| **Microsoft Defender Antivirus** | Signatur-, Verhaltens- und Cloudschutz; auf **Server 2016+** als Feature `Windows-Defender` **eingebaut** |
| **EDR** | **Sensor** sammelt Telemetrie (Prozesse, Netzwerk, Registry), Analyse im **Defender-Portal** (security.microsoft.com) |
| **Angriffsflächenreduzierung** (*ASR-Regeln*) | Blockiert **riskantes Verhalten** (z. B. Office startet Kindprozesse, Credential-Diebstahl aus **LSASS**) |
| **Netzwerkschutz** (*Network Protection*) | Blockiert Verbindungen zu **schädlichen Zielen** |
| **Überwachter Ordnerzugriff** (*Controlled Folder Access*) | Schutz vor **Ransomware** |
| **Manipulationsschutz** (*Tamper Protection*) | Sicherheitseinstellungen **nicht abschaltbar** (auch nicht per Admin/PowerShell) |
| **Automatische Untersuchung/Reaktion** (*AIR*) | Isolieren, Quarantäne, Entfernen |
| **Bedrohungs- und Schwachstellenverwaltung** (*TVM*) | Inventar, Fehlkonfigurationen, fehlende Patches |

**Onboarding von Servern** (Server 2012 R2 bis 2025):
| Methode | Einsatz |
|---|---|
| **Defender for Cloud** (*Defender for Servers Plan 1/2*) | **Automatisches** Onboarding von Azure-VMs und **Arc-Servern** |
| **Azure Arc** | Hybrid-Server; Erweiterung `MDE.Windows` |
| **Onboarding-Skript** (aus dem Portal, **Lokales Skript**) | Einzelne Server |
| **GPO** | Skript als **Startskript**/**geplante Aufgabe** |
| **Configuration Manager/Intune** | Clients/Server im Management |
- **Server 2012 R2/2016**: **Einheitliche Lösung** (*Modern Unified Solution*) statt altem MMA-Agent.
- **Server 2019+**: **Sense-Dienst** (`Windows Defender Advanced Threat Protection Service`) **integriert**.
- Prüfen: `Get-Service Sense`, `Get-MpComputerStatus`, Portal → **Geräteliste**.
- **Netzwerk**: ausgehend **HTTPS (443)** zu Microsoft-Diensten (URLs erlauben, Proxy konfigurierbar).

### Credential Guard
**Virtualisierungsbasierte Sicherheit** (*VBS*): schützt **Anmeldeinformationen** (NTLM-Hashes, **Kerberos-TGTs**) vor **Pass-the-Hash/Pass-the-Ticket** und Mimikatz.
| Merkmal | Details |
|---|---|
| **Prinzip** | **LSA** läuft im **isolierten Prozess `LSAIso.exe`** unter **Hyper-V-Hypervisor** (**Secure Kernel**); normales **LSASS** hält nur **Verweise** – Secrets sind **nicht auslesbar**, auch nicht mit Adminrechten |
| **Voraussetzungen** | **64-Bit**, **UEFI + Secure Boot**, **Virtualisierungserweiterungen** (Intel VT-x/AMD-V) + **SLAT**, **TPM 2.0** empfohlen; **Server 2016+**, **Windows 10/11 Enterprise/Education** |
| **Standard** | Auf **Windows 11 22H2+** und **Server 2025** unter erfüllten Voraussetzungen **standardmäßig aktiv** (Domänenmitglieder, **keine DCs**) |
| **Nicht unterstützt** | **Domänencontroller** (LSASS-Speicherung der DC-Secrets), **Nested Virtualization** ohne Konfiguration, **lokale Konten/Microsoft-Konten** (werden **nicht** geschützt) |
| **Blockiert/Schwächt** | **NTLMv1**, **MS-CHAPv2**, **Kerberos DES**, **uneingeschränkte Kerberos-Delegierung**, **CredSSP mit gespeicherten Anmeldedaten** (Standardanmeldedaten) |
| **Nicht geschützt** | **Kennwörter im Klartext**, **Keylogger**, **lokale SAM-Konten**, Angriffe **auf dem Netzwerk** |
| **UEFI-Sperre** | Einstellung **mit UEFI-Sperre** lässt sich **nur physisch** im UEFI wieder abschalten |

**Aktivierung**:
- **GPO**: *Computerkonfiguration → Administrative Vorlagen → System → Device Guard → **Virtualisierungsbasierte Sicherheit aktivieren*** → **Plattformsicherheitsstufe** (**Secure Boot** oder **Secure Boot und DMA-Schutz**) → **Credential Guard-Konfiguration**: **Mit UEFI-Sperre aktiviert** / **Ohne Sperre aktiviert**.
- **Registry**: `HKLM\SYSTEM\CurrentControlSet\Control\DeviceGuard` (`EnableVirtualizationBasedSecurity`, `RequirePlatformSecurityFeatures`) und `...\Control\Lsa` (`LsaCfgFlags` = 1 Sperre / 2 ohne Sperre).
- **Feature**: **Isolierter Benutzermodus** (Hyper-V-Feature) wird automatisch mit-aktiviert.
- **Prüfen**: `msinfo32` → **Virtualisierungsbasierte Sicherheit: Wird ausgeführt** + **Credential Guard**; oder `Get-CimInstance -ClassName Win32_DeviceGuard -Namespace root\Microsoft\Windows\DeviceGuard` (`SecurityServicesRunning` enthält **1**).

### Abgrenzung Credential Guard – Remote Credential Guard – Protected Users
| Technik | Zweck |
|---|---|
| **Credential Guard** | Schützt Secrets **auf dem lokalen Gerät** |
| **Remote Credential Guard** | **Kerberos-Anmeldeinformationen** bleiben beim **RDP** auf dem **Client** (kein Übertragen auf den Zielserver; löst **Second-Hop**) – `mstsc /remoteGuard` |
| **Protected Users** | Kontoschutz durch **Gruppenmitgliedschaft** (siehe eigene Seite) |

## Lab
**Maschinen**: **SRV01** (Windows Server 2022 Datacenter, VM **Generation 2**, Secure Boot an, Virtualisierungserweiterungen an), **ADMIN-PC** (Browser, Defender-Portal), **DC01** (GPO).

### GUI
1. **Hyper-V-Host**: VM **SRV01** ausgeschaltet → **Einstellungen → Prozessor → Virtualisierungserweiterungen für Nested Virtualization aktivieren** (falls VBS in einer VM getestet wird) → **Sicherheit** → **Secure Boot** an.
2. **DC01**: **Gruppenrichtlinienverwaltung** → neue GPO `SEC-CredentialGuard` → *Computerkonfiguration → Administrative Vorlagen → System → Device Guard* → **Virtualisierungsbasierte Sicherheit aktivieren** → **Aktiviert** → **Plattformsicherheitsstufe: Secure Boot** → **Credential Guard-Konfiguration: Ohne Sperre aktiviert** → mit OU **Server** verknüpfen.
3. **SRV01**: `gpupdate /force` → **Neustart**.
4. **SRV01**: `msinfo32` → **Systemübersicht** → **Virtualisierungsbasierte Sicherheit: Wird ausgeführt**, **Sicherheitsdienste: Credential Guard**.
5. **SRV01**: **Task-Manager → Details** → Prozess **LsaIso.exe** vorhanden.
6. **ADMIN-PC** (Defender-Portal): **Einstellungen → Endpunkte → Onboarding** → Betriebssystem **Windows Server 2019, 2022 und 2025** → Bereitstellungsmethode **Lokales Skript** → **Paket herunterladen**.
7. **SRV01**: ZIP entpacken → **Onboarding-Skript** als Administrator ausführen → im Portal **Geräteliste** → SRV01 erscheint (nach einigen Minuten).
8. **SRV01**: **Windows-Sicherheit → Viren- & Bedrohungsschutz → Manipulationsschutz** anschauen.

### PowerShell
```powershell
# Auf SRV01 – Credential Guard per Registry (alternativ GPO)
New-Item -Path "HKLM:\SYSTEM\CurrentControlSet\Control\DeviceGuard" -Force
Set-ItemProperty "HKLM:\SYSTEM\CurrentControlSet\Control\DeviceGuard" -Name EnableVirtualizationBasedSecurity -Value 1 -Type DWord
Set-ItemProperty "HKLM:\SYSTEM\CurrentControlSet\Control\DeviceGuard" -Name RequirePlatformSecurityFeatures -Value 1 -Type DWord
Set-ItemProperty "HKLM:\SYSTEM\CurrentControlSet\Control\Lsa" -Name LsaCfgFlags -Value 2 -Type DWord
Restart-Computer

# Status prüfen
Get-CimInstance -ClassName Win32_DeviceGuard -Namespace root\Microsoft\Windows\DeviceGuard |
  Select-Object VirtualizationBasedSecurityStatus,SecurityServicesConfigured,SecurityServicesRunning
Get-Process LsaIso

# Auf SRV01 – Defender/MDE
Get-MpComputerStatus | Select-Object AMServiceEnabled,RealTimeProtectionEnabled,IsTamperProtected
Get-Service Sense
Get-MpPreference | Select-Object -ExpandProperty AttackSurfaceReductionRules_Ids

# ASR-Regel: Credential-Diebstahl aus LSASS blockieren (Audit → dann Block)
Add-MpPreference -AttackSurfaceReductionRules_Ids 9e6c4e1f-7d60-472f-ba1a-a39ef669e4b2 -AttackSurfaceReductionRules_Actions AuditMode
Set-MpPreference -AttackSurfaceReductionRules_Actions Enabled -AttackSurfaceReductionRules_Ids 9e6c4e1f-7d60-472f-ba1a-a39ef669e4b2

# Remote Credential Guard (Client)
mstsc /v:SRV01 /remoteGuard
```

## Einfach

**Defender for Endpoint** = ein **Wachdienst** für deine Computer. Auf jedem Server sitzt ein **kleiner Späher** (Sensor). Er meldet **verdächtiges Verhalten** an eine **Zentrale in der Cloud**. Dort sieht ein Sicherheitsteam alles auf **einer Übersicht** und kann einen befallenen Rechner **sofort vom Netz trennen**.
- **Manipulationsschutz** = der Späher darf **nicht ausgeschaltet** werden – nicht einmal vom Angreifer mit Adminrechten.
- **ASR-Regeln** = **Verbote** wie „Word darf keine Programme starten“.

**Credential Guard** = im Computer liegt ein **Tresor** mit deinen **Passwort-Fingerabdrücken** (Hashes). Früher lag er im **normalen Zimmer** – ein Einbrecher mit Adminschlüssel (Mimikatz) konnte ihn öffnen. Mit **Credential Guard** steht der Tresor in einem **Panikraum unter dem Haus** (virtualisiert, abgeschottet). Der **Rest des Systems** kann den Tresor nur **bitten**, etwas zu prüfen – **herausgeben** tut er nichts.
- Gilt **nicht** für **Domänencontroller**.
- Ältere, schwache Anmeldeverfahren (**NTLMv1**) funktionieren **nicht mehr**.

**Remote Credential Guard** = du gehst per **Remotedesktop** auf einen Server, aber dein **Schlüssel bleibt in deiner Tasche** (auf deinem PC). Der Server **fragt** nur, statt ihn mitzunehmen.

## Merksatz
- **MDE** = **EDR in der Cloud**, **Sense-Dienst**, Onboarding per **Skript/GPO/Arc/Defender for Cloud**.
- **Tamper Protection** = **Schutz vor Abschalten**.
- **Credential Guard** = **VBS + LSAIso**, schützt **NTLM-Hash und TGT**.
- **Voraussetzung**: **UEFI, Secure Boot, Virtualisierung**; **kein DC**.
- **Mit UEFI-Sperre** = **nur im UEFI** abschaltbar.
- **Remote Credential Guard** = **RDP ohne Credentials auf dem Ziel** (`/remoteGuard`).

## Prüfungsfalle
- **Credential Guard** läuft **nicht auf Domänencontrollern**.
- Er schützt **keine lokalen** und **keine Microsoft-Konten**.
- **Kein Ersatz** für Antivirus/EDR – ergänzt sie nur.
- Ohne **UEFI/Secure Boot** (z. B. **Generation 1-VM**) keine VBS.
- **Uneingeschränkte Delegierung** und **NTLMv1** funktionieren mit Credential Guard **nicht** – Legacy-Anwendungen testen.
- **Defender for Endpoint** braucht eine **Lizenz** (z. B. **Defender for Servers** oder M365 E5/Business Premium).
- Onboarding von **Arc-Servern** läuft über **Defender for Cloud**, **nicht** über manuelle Skripte.
- **Remote Credential Guard** schützt die **RDP-Sitzung**, ersetzt **nicht** Credential Guard.

## Grafik
### Tresor im Keller
Haus (Windows) mit normalem Zimmer (LSASS) und Keller-Tresor (LSAIso, Hyper-V-Schild). Ein Einbrecher (Mimikatz) greift nach dem Tresor im Zimmer – bekommt nur eine leere Attrappe.

### Späher
Server mit kleinem Sensor-Männchen, Datenstrahl zur Cloud, Analysten-Bildschirm; rotes Signal bei Angriff, Server wird per Knopfdruck isoliert.

### Remote Guard
PC mit Schlüssel in der Tasche, gestrichelte Linie zum Server; Server fragt „Darf er rein?“, PC nickt, Schlüssel bleibt beim PC.

## Karteikarten
- F: Was ist Microsoft Defender for Endpoint? | A: Cloudbasierte EDR-Plattform für Clients und Server (Erkennung, Untersuchung, Reaktion).
- F: Wie wird ein Server für MDE onboarded? | A: Defender for Cloud/Arc, lokales Skript, GPO, Intune/Configuration Manager.
- F: Wie heißt der MDE-Sensordienst? | A: Sense (Windows Defender Advanced Threat Protection Service).
- F: Was bewirkt der Manipulationsschutz? | A: Sicherheitseinstellungen lassen sich nicht abschalten oder verändern.
- F: Was sind ASR-Regeln? | A: Angriffsflächenreduzierung – blockieren riskantes Verhalten (z. B. LSASS-Credential-Diebstahl).
- F: Was schützt Credential Guard? | A: NTLM-Hashes und Kerberos-TGTs durch Isolierung in LSAIso (VBS).
- F: Voraussetzungen von Credential Guard? | A: 64-Bit, UEFI + Secure Boot, Virtualisierungserweiterungen, TPM empfohlen.
- F: Läuft Credential Guard auf Domänencontrollern? | A: Nein.
- F: Wie prüft man, ob Credential Guard läuft? | A: msinfo32 oder Win32_DeviceGuard (SecurityServicesRunning), Prozess LsaIso.exe.
- F: Was blockiert Credential Guard? | A: NTLMv1, MS-CHAPv2, Kerberos DES, uneingeschränkte Delegierung.
- F: Was macht Remote Credential Guard? | A: Kerberos-Anmeldeinformationen bleiben beim RDP auf dem Client (mstsc /remoteGuard).
- F: Was bedeutet Aktivierung mit UEFI-Sperre? | A: Nur direkt im UEFI wieder deaktivierbar.

## Quiz
? Ein Angreifer mit Administratorrechten soll keine NTLM-Hashes aus dem Speicher eines Mitgliedsservers auslesen können. Maßnahme?
* Credential Guard aktivieren
- SmartScreen aktivieren
- WDAC im Überwachungsmodus
- BranchCache

? Auf einem Domänencontroller soll Credential Guard aktiviert werden. Ergebnis?
* Wird nicht unterstützt
- Funktioniert nur mit Datacenter
- Funktioniert nach Aktivierung des Papierkorbs
- Funktioniert mit Protected Users automatisch

? Ein Administrator meldet sich per RDP an einen Server an; Anmeldeinformationen sollen nicht auf dem Ziel gespeichert werden. Lösung?
* Remote Credential Guard (mstsc /remoteGuard)
- Credential Guard auf dem Ziel
- NTLM erzwingen
- CredSSP mit gespeicherten Daten

? Azure-VMs und Arc-Server sollen automatisch bei Defender for Endpoint angemeldet werden. Wie?
* Microsoft Defender for Cloud (Defender for Servers)
- Manuelles Skript auf jedem Server
- Windows Admin Center
- BitLocker

? Ein Angreifer versucht, Defender per PowerShell abzuschalten. Welche Funktion verhindert das?
* Manipulationsschutz (Tamper Protection)
- Exploit Protection
- Network Protection
- Controlled Folder Access

? Credential Guard lässt sich in einer Generation-1-VM nicht aktivieren. Ursache?
* Kein UEFI/Secure Boot – Generation 2 erforderlich
- Fehlende Domänenmitgliedschaft
- Zu wenig Festplattenspeicher
- Fehlende BitLocker-Lizenz
