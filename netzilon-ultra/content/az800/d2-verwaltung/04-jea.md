---
id: az800-jea
bereich: AZ-800
block: A7
kapitel: Hybrid-Verwaltung
titel: Just Enough Administration (JEA)
stufe: Profi
quellen: [AZ-800 Study Guide, Microsoft Learn]
verweise: [az800-powershell-remoting, az800-credssp-delegation, az800-wac, az800-gmsa, az801-dc-haertung]
---

## Profi

### Idee
**JEA** ist eine PowerShell-Sicherheitstechnik, mit der Benutzer **genau die Verwaltungsaufgaben** ausführen dürfen, die sie brauchen – **ohne Administratorrechte**. Sie verbinden sich per PowerShell Remoting mit einem **eingeschränkten Endpunkt**, in dem nur **freigegebene Cmdlets, Parameter und Werte** verfügbar sind. Die Befehle laufen im Hintergrund unter einem **privilegierten virtuellen Konto** (oder gMSA), der Benutzer selbst bleibt unprivilegiert.
Prinzipien: **Least Privilege**, **Just Enough** (nur nötige Befehle), **Just-In-Time** (Kombination mit zeitlich begrenzter Gruppenmitgliedschaft/PAM).
Beispiel: Der Helpdesk darf auf den DNS-Servern **nur** den DNS-Dienst neu starten und den Cache leeren – nicht mehr.

### Bausteine
| Datei | Endung | Inhalt |
|---|---|---|
| **Rollenfunktionsdatei** (Role Capability) | `.psrc` | **Was** darf eine Rolle? `VisibleCmdlets`, `VisibleFunctions`, `VisibleExternalCommands`, `VisibleProviders`, eigene `FunctionDefinitions`, Module |
| **Sitzungskonfigurationsdatei** (Session Configuration) | `.pssc` | **Wer** bekommt welche Rolle, **wie** läuft die Sitzung? `SessionType RestrictedRemoteServer`, `RunAsVirtualAccount` bzw. `GroupManagedServiceAccount`, `RoleDefinitions`, `TranscriptDirectory`, `MountUserDrive` |
- `.psrc` muss in einem **Modulordner** unter einem Unterordner **RoleCapabilities** liegen, z. B. `C:\Program Files\WindowsPowerShell\Modules\DnsJEA\RoleCapabilities\DnsOperator.psrc`. Der Name der Datei = Rollenname.
- Die `.pssc` wird mit `Register-PSSessionConfiguration` als **Endpunkt** registriert (startet WinRM neu).

### Wichtige Einstellungen
**In der .psrc**
```powershell
VisibleCmdlets = 'Get-Service',
  @{ Name = 'Restart-Service'; Parameters = @{ Name = 'Name'; ValidateSet = 'DNS','Spooler' } },
  @{ Name = 'Clear-DnsServerCache' }
VisibleExternalCommands = 'C:\Windows\System32\ipconfig.exe'
VisibleFunctions = 'Get-DnsInfo'
FunctionDefinitions = @{ Name = 'Get-DnsInfo'; ScriptBlock = { Get-DnsServerZone } }
```
Einschränkung von **Parametern** (`ValidateSet`, `ValidatePattern`) verhindert Missbrauch (z. B. nur bestimmte Dienste). **Vorsicht** bei gefährlichen Befehlen: `Start-Process`, `Invoke-Expression`, `New-Service`, `Add-Computer`, freie Skriptausführung, Provider `FileSystem` mit Schreibzugriff – damit kann man aus JEA „ausbrechen“.

**In der .pssc**
```powershell
SessionType = 'RestrictedRemoteServer'      # nur wenige Kern-Cmdlets (Exit-PSSession, Get-Command …)
RunAsVirtualAccount = $true                 # temporäres lokales Admin-Konto (auf DCs: Domänen-Admin!)
# RunAsVirtualAccountGroups = 'DnsAdmins'   # virtuelles Konto nur in bestimmten Gruppen
# GroupManagedServiceAccount = 'CONTOSO\gmsa-jea'   # für Netzwerkzugriff (Second Hop)
TranscriptDirectory = 'C:\JEA\Transkripte'
RoleDefinitions = @{ 'CONTOSO\GG-DNS-Operatoren' = @{ RoleCapabilities = 'DnsOperator' } }
```
- **Virtuelles Konto**: lokal Admin des Servers, **kein Netzwerkzugriff** als Benutzer (meldet sich als Computerkonto im Netz). Auf einem **DC** ist ein virtuelles Konto automatisch **Domänen-Admin** → dort mit `RunAsVirtualAccountGroups` einschränken!
- **gMSA**: wenn der Endpunkt auf andere Server zugreifen muss (Second Hop).
- **Transkripte** und **PowerShell-Protokollierung** zur Nachvollziehbarkeit (wer hat was ausgeführt – mit dem echten Benutzernamen).

### Verbindung
`Enter-PSSession -ComputerName DNS01 -ConfigurationName DnsJEA` → `Get-Command` zeigt nur die erlaubten Befehle. Mit **implizitem Remoting** (`Import-PSSession`) nutzbar wie lokale Cmdlets. **WAC-RBAC** nutzt JEA intern.

### Verteilung
- Mehrere Server: `.psrc`-Modul und `.pssc` per Skript, **DSC** (Ressource `JeaEndpoint`) oder Softwareverteilung ausrollen.
- Prüfen: `Get-PSSessionConfiguration`, `Get-PSSessionCapability -ConfigurationName DnsJEA -Username CONTOSO\h.test` (zeigt, welche Befehle ein Benutzer bekommt).
- Test-Datei: `Test-PSSessionConfigurationFile .\DnsJEA.pssc`.

## Lab
**Maschinen**: DNS01 (Mitgliedsserver mit DNS-Rolle), CL01, Gruppe **GG-DNS-Operatoren** mit Benutzer h.test (kein Admin).

### Befehle (auf DNS01, sofern nicht anders angegeben)
```powershell
# 1. Modulstruktur mit Rollenfunktion
$modul = "C:\Program Files\WindowsPowerShell\Modules\DnsJEA"
New-Item "$modul\RoleCapabilities" -ItemType Directory -Force
New-ModuleManifest "$modul\DnsJEA.psd1"
New-PSRoleCapabilityFile -Path "$modul\RoleCapabilities\DnsOperator.psrc" `
  -VisibleCmdlets 'Get-Service', 'Get-DnsServerZone', 'Clear-DnsServerCache',
    @{ Name = 'Restart-Service'; Parameters = @{ Name = 'Name'; ValidateSet = 'DNS' } } `
  -VisibleExternalCommands 'C:\Windows\System32\ipconfig.exe'

# 2. Sitzungskonfiguration
New-Item C:\JEA\Transkripte -ItemType Directory -Force
New-PSSessionConfigurationFile -Path C:\JEA\DnsJEA.pssc -SessionType RestrictedRemoteServer `
  -RunAsVirtualAccount -TranscriptDirectory C:\JEA\Transkripte `
  -RoleDefinitions @{ 'CONTOSO\GG-DNS-Operatoren' = @{ RoleCapabilities = 'DnsOperator' } }
Test-PSSessionConfigurationFile C:\JEA\DnsJEA.pssc

# 3. Endpunkt registrieren
Register-PSSessionConfiguration -Name DnsJEA -Path C:\JEA\DnsJEA.pssc -Force
Get-PSSessionConfiguration -Name DnsJEA
Get-PSSessionCapability -ConfigurationName DnsJEA -Username CONTOSO\h.test

# 4. Test auf CL01 als h.test
Enter-PSSession -ComputerName DNS01 -ConfigurationName DnsJEA -Credential CONTOSO\h.test
Get-Command                       # nur erlaubte Befehle
Restart-Service -Name DNS         # erlaubt
Restart-Service -Name Spooler     # abgelehnt (ValidateSet)
Get-ChildItem C:\                 # nicht verfügbar
Exit-PSSession

# 5. Transkripte ansehen (DNS01) und Endpunkt entfernen
Get-ChildItem C:\JEA\Transkripte
Unregister-PSSessionConfiguration -Name DnsJEA
```

## Einfach

Stell dir vor, der **Praktikant** soll im Serverraum nur **eine** Sache machen dürfen: den **Drucker neu starten**, wenn er hängt. Gibst du ihm den **Generalschlüssel** (Admin-Rechte), könnte er alles kaputt machen. Gibst du ihm gar nichts, musst du jedes Mal selbst hin.

**JEA** ist wie ein **Automat mit nur wenigen Knöpfen**:
- Der Praktikant verbindet sich mit einem **Spezial-Eingang** (JEA-Endpunkt).
- Dort sieht er **nur die Knöpfe**, die du erlaubt hast: „Drucker neu starten“, „DNS-Cache leeren“. Sonst nichts – keine Festplatten, keine Benutzer, nichts.
- Du kannst sogar festlegen, **welche Werte** erlaubt sind: „Neu starten – aber nur den DNS-Dienst, nicht irgendeinen.“
- Hinter dem Automaten arbeitet ein **unsichtbarer Roboter mit Admin-Rechten** (virtuelles Konto) – der Praktikant selbst hat nie Admin-Rechte.
- Und eine **Kamera** (Transkript) schreibt alles mit: wer, wann, welcher Knopf.

**Zwei Bauplandateien**:
- **.psrc** = **Was** darf die Rolle? (die Knöpfe)
- **.pssc** = **Wer** bekommt welche Rolle und wie läuft der Automat? (Roboter, Kamera)

## Merksatz
- JEA = **eingeschränkter Remoting-Endpunkt**, Benutzer **ohne** Admin-Rechte.
- **.psrc = Was** (VisibleCmdlets …), liegt im Modulordner **RoleCapabilities**.
- **.pssc = Wer/Wie** (RoleDefinitions, RunAsVirtualAccount, Transkripte).
- `Register-PSSessionConfiguration` → `Enter-PSSession -ConfigurationName`.
- Auf **DCs** virtuelles Konto = Domänen-Admin → **RunAsVirtualAccountGroups**!

## Prüfungsfalle
- .psrc nicht im Unterordner RoleCapabilities eines Moduls → Rolle wird nicht gefunden.
- SessionType muss RestrictedRemoteServer sein (sonst zu viele Befehle).
- Virtuelle Konten haben keinen Netzwerkzugriff als Benutzer → für Second Hop gMSA.
- Gefährliche Befehle (Start-Process, Invoke-Expression) hebeln JEA aus.
- Verbindung ohne `-ConfigurationName` landet im Standard-Endpunkt (dort ohne Rechte).

## Grafik
### Knopf-Automat
Praktikant vor einem Automaten mit drei Knöpfen; hinter dem Automaten ein Roboter mit Admin-Krone, der die Aktion am Server ausführt; eine Kamera nimmt alles auf.

### Zwei Dateien
.psrc als Liste von Knöpfen (Cmdlets mit Parameter-Schlössern), .pssc als Türschild (Gruppe → Rolle, Roboter, Kamera); Register-PSSessionConfiguration montiert beides an den Server.

## Karteikarten
- F: Was ist JEA? | A: Just Enough Administration – eingeschränkte PowerShell-Endpunkte, die nur erlaubte Befehle unter einem privilegierten Hintergrundkonto ausführen.
- F: Welche Datei definiert die erlaubten Befehle? | A: Die Rollenfunktionsdatei (.psrc).
- F: Welche Datei ordnet Gruppen Rollen zu? | A: Die Sitzungskonfigurationsdatei (.pssc) mit RoleDefinitions.
- F: Wo muss eine .psrc-Datei liegen? | A: Im Unterordner RoleCapabilities eines PowerShell-Modulordners.
- F: Cmdlet zum Registrieren eines JEA-Endpunkts? | A: Register-PSSessionConfiguration.
- F: Wie verbindet man sich mit einem JEA-Endpunkt? | A: Enter-PSSession -ComputerName <Server> -ConfigurationName <Name>.
- F: Was ist ein virtuelles Konto in JEA? | A: Temporäres, privilegiertes lokales Konto, unter dem die Befehle laufen.
- F: Warum ist RunAsVirtualAccount auf DCs heikel? | A: Das virtuelle Konto ist dort Domänen-Admin – mit RunAsVirtualAccountGroups einschränken.
- F: Wie schränkt man Parameterwerte ein? | A: In VisibleCmdlets mit ValidateSet/ValidatePattern.
- F: Wie prüft man, welche Befehle ein Benutzer bekommt? | A: Get-PSSessionCapability -ConfigurationName … -Username …

## Quiz
? Der Helpdesk soll auf DNS-Servern nur den DNS-Dienst neu starten dürfen – ohne Adminrechte. Welche Technik?
* JEA
- CredSSP
- Domänen-Admin-Mitgliedschaft
- Uneingeschränkte Delegierung

? In welcher Datei legt man fest, welche Cmdlets eine Rolle sehen darf?
* .psrc (Rollenfunktionsdatei)
- .pssc (Sitzungskonfigurationsdatei)
- .migtable
- .admx

? Mit welchem Parameter verbindet man sich gezielt mit einem JEA-Endpunkt?
* -ConfigurationName
- -Authentication CredSSP
- -UseSSL
- -SessionType

? Ein JEA-Endpunkt muss auf eine Freigabe eines anderen Servers zugreifen. Welches Konto ist geeignet?
* Ein gMSA
- Ein virtuelles Konto
- Das Gastkonto
- Kein Konto nötig

? Welcher SessionType wird für JEA verwendet?
* RestrictedRemoteServer
- Default
- Empty
- FullLanguage

? Welche Datei registriert einen JEA-Endpunkt und legt Sitzungstyp sowie RunAs-Konto fest?
* Sitzungskonfigurationsdatei (.pssc)
- Rollenfunktionsdatei (.psrc)
- Modulmanifest (.psd1)
- Profilskript (profile.ps1)
! Rollenfunktionen (.psrc) definieren die erlaubten Cmdlets.

? Mit welchem Cmdlet wird ein JEA-Endpunkt registriert?
* Register-PSSessionConfiguration
- Enable-PSRemoting -JEA
- New-PSSession -JEA
- Set-ExecutionPolicy JEA
! Danach mit Enter-PSSession -ConfigurationName verbinden.

? Was ist ein virtuelles Konto bei JEA?
* Ein temporäres lokales Administratorkonto nur für die Dauer der Sitzung
- Ein Domänen-Admin-Konto
- Ein Gastkonto mit Kennwort
- Ein Microsoft-Konto
! Für Netzwerkzugriffe eignet sich stattdessen ein gMSA.
