---
id: ap1-a6-sysprep
bereich: AP1
block: A6
kapitel: Windows Server
titel: Sysprep, VM-Vorlagen & Übungsdomäne mit 3 Rechnern
stufe: Einsteiger
quellen: [sysprep.txt, reg.txt, Uebung-Vorlagen-DC-3-Rechner.pdf]
verweise: [ap1-a6-adds, ap1-a5-firewall, ap1-a4-ipv4, az800-vhdx]
---

## Profi

### Warum Vorlagen?
In Labs und Unternehmen werden viele gleichartige Rechner benötigt. Statt jedes Mal Windows neu zu installieren, erstellt man **eine Vorlage** (Master-Image, „Golden Image“) und klont sie. Problem: Ein 1:1-Klon hat denselben **Computernamen**, dieselbe **Computer-SID**, dieselben Treiberkennungen, Aktivierungsdaten usw. → Konflikte in Domänen (Vertrauensstellung, WSUS-Client-IDs, Tools, die sich auf die Maschinen-SID verlassen).

### Sysprep
**Sysprep** (System Preparation Tool, `C:\Windows\System32\Sysprep\sysprep.exe`) bereitet eine Installation fürs Klonen vor:
| Option | Wirkung |
|---|---|
| **Out-of-Box-Experience (OOBE)** | beim nächsten Start erscheint die Ersteinrichtung (Region, Konto, Name) |
| **Verallgemeinern (Generalize)** | entfernt **systemspezifische Daten**: Computer-SID, Computername, Ereignisprotokolle, Wiederherstellungspunkte, Aktivierungsstatus (Rearm), gerätespezifische Treiberinformationen |
| **Herunterfahren** | fährt die VM danach aus – sie darf **vor dem Kopieren nicht mehr gestartet** werden, sonst ist die Vorbereitung verbraucht |
| Neu starten / Beenden | Alternativen für andere Szenarien |
| Audit-Modus | Vorlage vor der Auslieferung weiter anpassen (Software, Treiber) ohne OOBE |
Automatisierung per **Antwortdatei** (`unattend.xml`, erstellt mit Windows System Image Manager aus dem ADK): `sysprep /generalize /oobe /shutdown /unattend:C:\unattend.xml`.

**Registry-Tipp aus der Schulunterlage**: Vor Sysprep
`HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Setup\Sysprep\Settings\sppnp` → **PersistAllDeviceInstalls = 1** (DWORD).
Damit behält Windows beim Verallgemeinern die **installierten Gerätetreiber** – die geklonten VMs starten schneller (keine erneute Hardwareerkennung). Sinnvoll, wenn alle Klone auf **identischer (virtueller) Hardware** laufen.

**Einschränkungen**: Sysprep verweigert den Dienst u. a. bei **Domänenmitgliedern** (Vorlage in der Arbeitsgruppe erstellen!), **Domänencontrollern** und installierten Store-Apps, die nur für einen Benutzer bereitgestellt sind (Fehler im Log `C:\Windows\System32\Sysprep\Panther\setupact.log`). Anzahl der Generalisierungen pro Image ist begrenzt (Rearm).

### Vorgehen „Vorlage“ in Hyper-V
1. VM installieren, Updates, Grundeinstellungen, ggf. Tools.
2. **PersistAllDeviceInstalls** setzen (optional).
3. `sysprep.exe` → **OOBE + Verallgemeinern + Herunterfahren** → OK.
4. **„Wegpacken“**: Die VHDX der Vorlage schreibschützen/archivieren (z. B. `C:\Hyper-V\Vorlagen\Server2025.vhdx`, Datei-Eigenschaft „Schreibgeschützt“).
5. Neue VMs:
   - **Kopie** der VHDX (vollständig unabhängig, braucht Platz) oder
   - **Differenzierende Festplatte** mit der Vorlage als **übergeordneter Datenträger** – spart enorm Speicher, die Vorlage darf danach **nie mehr verändert** werden.
6. Jede neue VM startet in die OOBE → Name, Kennwort → fertig.
Alternative: **Hyper-V-Export/-Import** (Kopie mit neuer ID) – verallgemeinert aber **nicht** (gleiche SID) → vor dem Export Sysprep ausführen.

### Übungsdomäne mit drei Rechnern
Aus den Vorlagen entsteht das Standardlab: **DC01** + zwei Clients.
| Rechner | IP | Maske | Gateway | DNS |
|---|---|---|---|---|
| DC01 (Server) | 192.168.1.1 | 255.255.255.0 | 192.168.1.1 (in der Unterlage; ohne Router besser leer) | **127.0.0.1** |
| Win-Client 1 | 192.168.1.101 | 255.255.255.0 | 192.168.1.1 | **192.168.1.1** |
| Win-Client 2 | 192.168.1.102 | 255.255.255.0 | 192.168.1.1 | **192.168.1.1** |
Domänenname z. B. `IhrName.local`, DSRM-Kennwort `P@ssw0rd` (nur Lab!).

**Kontrolle nach der Heraufstufung**: In der DNS-Konsole müssen **zwei Forward-Lookupzonen** existieren: **IhrName.local** und **_msdcs.IhrName.local** (unterhalb bzw. als eigene Zone) – dort liegen die DC-Lokalisierungseinträge (SRV, CNAME mit DC-GUID). Fehlen sie, funktionieren Domänenbeitritt und Anmeldung nicht.

**Warum ist die Firewall der Clients nach dem Domänenbeitritt „wieder an“?** Die Firewall hat **drei Profile**. Ausgeschaltet wurde vorher das **private/öffentliche** Profil. Nach dem Beitritt erkennt der Client die Domäne (Network Location Awareness) → das **Domänenprofil** wird aktiv, und das ist **eingeschaltet**. Außerdem können GPOs die Firewall erzwingen.

## Lab
**Maschinen**: Hyper-V-**Host**, Vorlagen-VM **TPL-SRV2025** (Arbeitsgruppe), danach DC01, CL01, CL02.

### GUI
1. **TPL-SRV2025**: Windows Server installieren, Updates, VM-Integrationsdienste prüfen.
2. **TPL-SRV2025**: `regedit` → `HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Setup\Sysprep\Settings\sppnp` → Neuer DWORD-Wert **PersistAllDeviceInstalls** = **1**.
3. **TPL-SRV2025**: `C:\Windows\System32\Sysprep\sysprep.exe` → Systembereinigungsaktion **OOBE**, Haken **Verallgemeinern**, Optionen **Herunterfahren** → OK.
4. **Host**: VM nach dem Herunterfahren **nicht** mehr starten → VHDX nach `C:\Hyper-V\Vorlagen\` verschieben → Eigenschaften → **Schreibgeschützt**.
5. **Host**: Hyper-V-Manager → Neu → Festplatte → **Differenzierend** → übergeordnet: Vorlagen-VHDX → Name `DC01.vhdx` (ebenso CL01/CL02 aus einer Client-Vorlage) → neue VMs mit diesen Festplatten erstellen, VM-Namen = Computernamen.
6. **DC01/CL01/CL02**: OOBE durchlaufen → Computernamen setzen → IPs laut Tabelle.
7. **CL01/CL02**: Firewall aus (nur Übung) bzw. ICMP erlauben → `ping` alle.
8. **DC01**: Rolle AD DS → **Neue Gesamtstruktur** `IhrName.local` → DSRM `P@ssw0rd` → Voraussetzungsprüfung ohne DNS-Fehler → Neustart.
9. **DC01**: DNS-Konsole → Zonen **IhrName.local** und **_msdcs.IhrName.local** prüfen.
10. **CL01/CL02**: Domäne beitreten → Neustart.
11. **DC01**: `dsa.msc` → OU **Verkauf** → Benutzer Angela Merkel, Gerhard Schroeder, Otto Waalkes → Haken „**Benutzer muss Kennwort bei der nächsten Anmeldung ändern**“ **entfernen** (nur Lab).
12. **CL01**: `wf.msc` → aktives Profil = **Domäne** → eingeschaltet (Erklärung siehe oben).

### PowerShell
```powershell
# Auf TPL-SRV2025 (Vorlage)
New-Item "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Setup\Sysprep\Settings\sppnp" -Force | Out-Null
New-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Setup\Sysprep\Settings\sppnp" `
  -Name PersistAllDeviceInstalls -PropertyType DWord -Value 1 -Force
& "$env:WINDIR\System32\Sysprep\sysprep.exe" /generalize /oobe /shutdown

# Auf dem Hyper-V-Host
Set-ItemProperty C:\Hyper-V\Vorlagen\Server2025.vhdx -Name IsReadOnly -Value $true
New-VHD -Path C:\Hyper-V\VMs\DC01.vhdx -ParentPath C:\Hyper-V\Vorlagen\Server2025.vhdx -Differencing
New-VM -Name DC01 -Generation 2 -MemoryStartupBytes 2GB -VHDPath C:\Hyper-V\VMs\DC01.vhdx -SwitchName "LAN"
Set-VMMemory DC01 -DynamicMemoryEnabled $true -MinimumBytes 1GB -MaximumBytes 4GB
Start-VM DC01

# Auf DC01 (nach OOBE)
Rename-Computer DC01 -Restart
New-NetIPAddress -InterfaceAlias Ethernet -IPAddress 192.168.1.1 -PrefixLength 24
Set-DnsClientServerAddress -InterfaceAlias Ethernet -ServerAddresses 127.0.0.1
Install-WindowsFeature AD-Domain-Services -IncludeManagementTools
Install-ADDSForest -DomainName "IhrName.local" -InstallDns `
  -SafeModeAdministratorPassword (ConvertTo-SecureString "P@ssw0rd" -AsPlainText -Force) -Force
Get-DnsServerZone                                  # IhrName.local und _msdcs.IhrName.local
New-ADOrganizationalUnit Verkauf
"Angela Merkel","Gerhard Schroeder","Otto Waalkes" | ForEach-Object {
  $sam = ($_ -replace ' ','.').ToLower()
  New-ADUser -Name $_ -SamAccountName $sam -Path "OU=Verkauf,DC=IhrName,DC=local" `
    -AccountPassword (ConvertTo-SecureString "P@ssw0rd" -AsPlainText -Force) -Enabled $true -ChangePasswordAtLogon $false }

# Auf CL01 / CL02
New-NetIPAddress -InterfaceAlias Ethernet -IPAddress 192.168.1.101 -PrefixLength 24 -DefaultGateway 192.168.1.1
Set-DnsClientServerAddress -InterfaceAlias Ethernet -ServerAddresses 192.168.1.1
Add-Computer -DomainName IhrName.local -Credential IhrName\Administrator -Restart
Get-NetConnectionProfile                           # NetworkCategory = DomainAuthenticated
Get-NetFirewallProfile | Select-Object Name, Enabled
```

## Übungen
- A: Was bewirkt „Verallgemeinern“? | L: Entfernt Computer-SID, Namen, Protokolle, Aktivierungs- und hardwarespezifische Daten, damit Klone eindeutig werden
- A: Wozu PersistAllDeviceInstalls = 1? | L: Installierte Gerätetreiber bleiben beim Verallgemeinern erhalten → schnellerer Start der Klone
- A: Warum „Herunterfahren“ und danach nicht mehr starten? | L: Beim nächsten Start läuft die OOBE – die Vorlage wäre verbraucht
- A: Welche DNS-Zonen müssen nach der DC-Installation existieren? | L: IhrName.local und _msdcs.IhrName.local
- A: Warum ist die Client-Firewall nach dem Domänenbeitritt wieder aktiv? | L: Das Domänenprofil ist nun aktiv und eingeschaltet (ausgeschaltet war nur das private/öffentliche Profil); ggf. per GPO erzwungen

## Einfach

Stell dir vor, du backst **30 Geburtstagskuchen**. Jeden einzeln von Grund auf? Viel zu lang! Also backst du **einen perfekten Kuchen**, machst davon eine **Form** und gießt die anderen daraus.

Bei Computern ist die „Form“ die **Vorlage**. Aber Achtung: Würdest du den Computer **einfach kopieren**, hätten alle Kopien **denselben Namen und dieselbe Ausweisnummer (SID)** – wie 30 Kinder, die alle „Max“ heißen und denselben Ausweis haben. Das gibt Chaos in der Schule (Domäne)!

**Sysprep** ist wie das **Namensschild abmachen**, bevor man den Kuchen kopiert:
- **Verallgemeinern** = Name, Ausweisnummer und persönliche Sachen wegmachen.
- **OOBE** = Beim nächsten Einschalten fragt der Computer wie ein neuer: „Hallo, wie soll ich heißen?“
- **Herunterfahren** = Danach aus – und die Vorlage **nicht mehr starten**, sonst ist sie „aufgebraucht“.

Der **Registry-Trick** (PersistAllDeviceInstalls) sagt: „Die **Treiber** darfst du behalten“ – dann muss jede Kopie nicht erst alle Geräte neu suchen und startet schneller.

**Differenzierende Festplatte** = Statt 30 ganze Kuchen zu lagern, lagerst du **einen** Grundkuchen und für jede Kopie nur die **Verzierung**, die anders ist. Spart riesig Platz. Aber: Am Grundkuchen darf **nie wieder** jemand etwas ändern!

**Die Firewall-Überraschung**: Du hast die Firewall ausgeschaltet – aber nur für „Zuhause“ und „Café“. Sobald der PC in der Domäne ist, zieht er die **Firmen-Jacke** an (Domänenprofil) – und die war nie ausgeschaltet.

## Merksatz
- Sysprep: **OOBE + Verallgemeinern + Herunterfahren**.
- Vorlage in der **Arbeitsgruppe** erstellen, nie als DC/Domänenmitglied.
- **PersistAllDeviceInstalls = 1** → Treiber bleiben.
- Differenzierende Disk → **Elternteil nie mehr ändern**.
- Nach DC-Setup: Zonen **Domäne** + **_msdcs.Domäne**.

## Prüfungsfalle
- Export/Import oder Kopieren ohne Sysprep → doppelte SIDs.
- Vorlage nach Sysprep versehentlich gestartet → OOBE läuft, Vorlage unbrauchbar.
- Clients mit Router/Provider als DNS → Domänenbeitritt scheitert.
- Firewall-Profile unterscheiden (Domäne ist ein eigenes Profil).
- Übergeordnete VHDX einer differenzierenden Disk verändert → alle Kinder beschädigt.

## Grafik
### Kuchenform
Master-VM wird zu einer „Form“ gegossen (Sysprep entfernt ein Namensschild und eine SID-Plakette), daraus fallen drei neue VMs, die sich in der OOBE je einen Namen geben.

### Differenzierende Festplatten
Große Eltern-VHDX unten, drei dünne Kind-Scheiben darüber; Speicherbalken vergleicht „3 volle Kopien“ vs. „1 Eltern + 3 Kinder“.

### Firewall-Profile nach Domänenbeitritt
Client wechselt vom Profil „Öffentlich (aus)“ zu „Domäne (an)“ – Schild leuchtet auf.

## Karteikarten
- F: Wozu dient Sysprep? | A: Windows-Installation für das Klonen vorbereiten (Verallgemeinern, OOBE).
- F: Was entfernt „Verallgemeinern“? | A: Computer-SID, Computername, Protokolle, Aktivierungs- und hardwarespezifische Daten.
- F: Registry-Wert, damit Treiber erhalten bleiben? | A: HKLM\…\Setup\Sysprep\Settings\sppnp → PersistAllDeviceInstalls = 1.
- F: Wo liegt sysprep.exe? | A: C:\Windows\System32\Sysprep\sysprep.exe
- F: Warum darf man die Vorlage nach Sysprep nicht starten? | A: Die OOBE würde ablaufen und die Vorlage wäre personalisiert.
- F: Was ist eine differenzierende Festplatte? | A: VHDX, die nur Änderungen gegenüber einer übergeordneten (Vorlagen-)VHDX speichert.
- F: Auf welchen Systemen verweigert Sysprep den Dienst? | A: U. a. auf Domänencontrollern und Domänenmitgliedern.
- F: Welche DNS-Zonen legt die DC-Installation an? | A: <Domäne> und _msdcs.<Domäne>.
- F: Warum ist die Firewall nach dem Domänenbeitritt wieder an? | A: Domänenprofil wird aktiv und ist eingeschaltet.
- F: Datei für automatisierte Sysprep-Einrichtung? | A: unattend.xml (Antwortdatei).

## Quiz
? Welche Sysprep-Einstellungen nutzt man für eine VM-Vorlage?
* OOBE, Verallgemeinern, Herunterfahren
- Audit-Modus, Neustart
- OOBE ohne Verallgemeinern, Neustart
- Beenden ohne Optionen

? Was passiert, wenn man eine VM ohne Sysprep mehrfach kopiert und in die Domäne aufnimmt?
* Die Klone haben dieselbe Computer-SID, was zu Problemen führen kann
- Nichts, Windows erkennt das automatisch
- Die VMs starten nicht
- Die Domäne wird gelöscht

? Welcher Vorteil hat eine differenzierende Festplatte?
* Sie spart Speicherplatz, da nur Änderungen gegenüber der Vorlage gespeichert werden
- Sie ist schneller als jede andere Festplatte
- Die Vorlage kann danach beliebig geändert werden
- Sie ersetzt Sysprep

? Was bewirkt PersistAllDeviceInstalls = 1?
* Installierte Treiber bleiben beim Verallgemeinern erhalten
- Die Computer-SID bleibt erhalten
- Windows wird aktiviert
- Die Vorlage tritt automatisch der Domäne bei

? Welche DNS-Zone fehlt, wenn DC-Lokalisierung nicht funktioniert?
* _msdcs.<Domäne>
- in-addr.arpa
- localhost
- root-servers.net
