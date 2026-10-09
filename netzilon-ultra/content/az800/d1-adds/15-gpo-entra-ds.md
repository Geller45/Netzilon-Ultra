---
id: az800-gpo-entra-ds
bereich: AZ-800
block: A7
kapitel: AD DS on-premises & Cloud
titel: Gruppenrichtlinien in Microsoft Entra Domain Services
stufe: Profi
quellen: [AZ-800 Study Guide, Microsoft Learn]
verweise: [az800-join-entra, az800-gpo, ap1-a6-gpo-grundlagen, az800-dcs-azure]
---

## Profi

### Ausgangslage
In **Microsoft Entra Domain Services** (verwaltete Domäne) betreibt Microsoft die DCs. Admins haben **keine Domänen-Admin-Rechte**, sondern sind Mitglied der Gruppe **AAD DC Administrators**. Trotzdem lassen sich **Gruppenrichtlinien** verwalten – mit Einschränkungen.

### Integrierte GPOs
Entra DS bringt zwei **integrierte GPOs** mit:
| GPO | Verknüpft mit | Inhalt/Zweck |
|---|---|---|
| **AADDC Computers GPO** | Container **AADDC Computers** | Einstellungen für alle beigetretenen Computer |
| **AADDC Users GPO** | Container **AADDC Users** | Einstellungen für alle (synchronisierten) Benutzer |
Diese können **bearbeitet** (angepasst), aber **nicht gelöscht** oder anders verknüpft werden. Die **Default Domain Policy** und Default Domain Controllers Policy sind **nicht** bearbeitbar (von Microsoft verwaltet).

### Eigene GPOs und OUs
- **AAD DC Administrators** dürfen **benutzerdefinierte OUs** erstellen (z. B. `OU=Server`) und **eigene GPOs** anlegen und **mit diesen OUs** oder mit den AADDC-Containern **verknüpfen**.
- Objekte, die aus Entra ID synchronisiert werden, landen **immer** in **AADDC Users**; in eigene OUs lassen sich **nur dort erstellte** Objekte (z. B. Dienstkonten, Computerkonten beim Beitritt mit Ziel-OU) verschieben/anlegen – synchronisierte Benutzer können nicht verschoben werden.
- Verknüpfung auf **Domänenebene** ist nicht möglich.

### Verwaltung – so geht's
1. **Verwaltungs-VM** (Windows Server) im selben/peerten VNet erstellen und der verwalteten Domäne beitreten.
2. Mit einem Konto aus **AAD DC Administrators** anmelden.
3. **RSAT-Tools** installieren: `Gruppenrichtlinienverwaltung` (GPMC), `AD DS- und AD LDS-Tools`, `DNS-Server-Tools`.
4. GPMC → Domäne → Gruppenrichtlinienobjekte → integrierte GPOs bearbeiten oder neue anlegen und verknüpfen.

### Kennwort- und Sperrrichtlinien in Entra DS
- Die **Standard-Kennwortrichtlinie** der verwalteten Domäne (u. a. Sperre nach **5** Fehlversuchen innerhalb von 2 Minuten für 30 Minuten, Kennwortalter 90 Tage) kann über **FGPP** angepasst werden – AAD DC Administrators dürfen **benutzerdefinierte PSOs** erstellen (Rangfolge beachten).
- **Achtung**: Für synchronisierte Benutzer werden Kennwörter **in Entra ID** geändert (bzw. on-prem bei Hybrid) und in die verwaltete Domäne übernommen; die Kennwortablauf-Richtlinie in Entra DS betrifft vor allem **Anmeldungen** und **Sperren** an domänenbeigetretenen VMs.

### Grenzen gegenüber AD DS
| Möglich | Nicht möglich |
|---|---|
| eigene OUs, eigene GPOs, Links an eigene OUs/AADDC-Container | Default Domain Policy ändern, Links an Domänenebene |
| integrierte AADDC-GPOs bearbeiten | Schema erweitern |
| FGPP (PSOs) | Domänen-/Organisations-Admin-Rechte |
| DNS-Zonen verwalten (als DNS-Admin der verwalteten Domäne) | Standorte/Replikation konfigurieren |
| Kerberos-eingeschränkte Delegierung (ressourcenbasiert) | uneingeschränkte Delegierung |
| LDAPS aktivieren (mit Zertifikat) | eigene DCs hinzufügen |

### Typische Szenarien
- **Lift-and-Shift**: Alte Webanwendung braucht Windows-Authentifizierung und GPOs – VM in Entra DS, GPO für IE/Edge-Intranetzone, Firewall, Bildschirmsperre.
- **Azure Virtual Desktop/RDS**: Sitzungshosts in eigener OU `AVD-Hosts` mit GPO (FSLogix-Profile, Loopback für Benutzereinstellungen).
- **Sicherheitsbaseline** für Server-VMs in Azure.

## Lab
**Voraussetzung**: Entra DS bereitgestellt (`aadds.contoso.com`), Verwaltungs-VM **MGMT01** beigetreten, Admin in **AAD DC Administrators**.

### GUI
1. **MGMT01**: Server-Manager → Features → **Gruppenrichtlinienverwaltung** + **AD DS-Tools** + **DNS-Server-Tools** installieren.
2. **MGMT01**: `dsa.msc` → aadds.contoso.com → Rechtsklick → Neu → **Organisationseinheit** `Server`.
3. **MGMT01**: `gpmc.msc` → Gruppenrichtlinienobjekte → **AADDC Computers GPO** → Bearbeiten → Computerkonfiguration → Richtlinien → Administrative Vorlagen → Windows-Komponenten → Remotedesktopdienste → … → „Zeitlimit für aktive, aber im Leerlauf befindliche Sitzungen“ → 2 Stunden.
4. Rechtsklick OU **Server** → **Gruppenrichtlinienobjekt hier erstellen und verknüpfen** → „Server-Sicherheit“ → Windows Defender Firewall mit erweiterter Sicherheit → Domänenprofil: Ein, eingehend blockieren; ICMP erlauben.
5. VM **APP01** beim Domänenbeitritt in `OU=Server` legen (per `Add-Computer -OUPath`) oder das Konto nachträglich verschieben.
6. **APP01**: `gpupdate /force` → `gpresult /r` → „Server-Sicherheit“ angewendet.
7. Versuch: Default Domain Policy bearbeiten → **Zugriff verweigert** (verwaltet).

### PowerShell
```powershell
# Auf MGMT01
Install-WindowsFeature GPMC, RSAT-ADDS, RSAT-DNS-Server
New-ADOrganizationalUnit -Name "Server" -Path "DC=aadds,DC=contoso,DC=com"
New-GPO "Server-Sicherheit" | New-GPLink -Target "OU=Server,DC=aadds,DC=contoso,DC=com"
Get-GPO -All | Select-Object DisplayName, Owner

# FGPP in der verwalteten Domäne
New-ADFineGrainedPasswordPolicy -Name "PSO-Dienstkonten" -Precedence 50 -MinPasswordLength 25 `
  -LockoutThreshold 10 -LockoutDuration 00:30:00 -LockoutObservationWindow 00:30:00 -ComplexityEnabled $true `
  -PasswordHistoryCount 24 -MaxPasswordAge 0 -MinPasswordAge 0 -ReversibleEncryptionEnabled $false
Add-ADFineGrainedPasswordPolicySubject "PSO-Dienstkonten" -Subjects "GG-Dienstkonten"

# Auf APP01 – Beitritt direkt in die OU
Add-Computer -DomainName aadds.contoso.com -OUPath "OU=Server,DC=aadds,DC=contoso,DC=com" -Credential (Get-Credential) -Restart
```

## Einfach

Bei **Entra Domain Services** betreibt Microsoft das **Vereinsheim** für dich. Du bist Mitglied im **Verwaltungsteam (AAD DC Administrators)** – aber **nicht im Vorstand**.

Was darfst du bei den **Hausordnungen (GPOs)**?
- Es gibt zwei **fertige Hausordnungen**: eine für **alle Computer** (AADDC Computers) und eine für **alle Benutzer** (AADDC Users). Die darfst du **anpassen**, aber nicht wegwerfen.
- Du darfst **eigene Räume** (OUs) einrichten und dort **eigene Hausordnungen** aufhängen.
- Die **Grundordnung des ganzen Vereins** (Default Domain Policy) gehört Microsoft – da darfst du **nichts ändern**.
- Die Mitglieder, die aus der Cloud kommen, stehen immer in der Liste „AADDC Users“ – du kannst sie **nicht** in andere Räume verschieben.

Um das alles zu verwalten, brauchst du einen **eigenen Verwaltungs-PC** im Verein (eine VM mit den Admin-Werkzeugen), denn in die Microsoft-Server selbst kommst du nicht hinein.

## Merksatz
- Integriert: **AADDC Computers GPO** + **AADDC Users GPO** (bearbeitbar, nicht löschbar).
- Eigene **OUs + GPOs** erlaubt, **keine** Links auf Domänenebene.
- Default Domain Policy = **von Microsoft verwaltet**.
- Verwaltung von einer **beigetretenen VM mit RSAT** als **AAD DC Administrators**.
- Kennwortanpassungen per **FGPP**.

## Prüfungsfalle
- Synchronisierte Benutzer können nicht aus AADDC Users verschoben werden.
- Kein Domänen-Admin → Default Domain Policy nicht editierbar.
- GPO-Verwaltung nur von einer domänenbeigetretenen VM im VNet (RSAT).
- Kennwortänderungen synchronisierter Benutzer erfolgen in Entra ID/on-prem, nicht in Entra DS.

## Grafik
### Microsoft-Vereinsheim
Gebäude mit zwei vorinstallierten Pinnwänden (AADDC Computers/Users, bearbeitbar), einer verschlossenen Pinnwand (Default Domain Policy, Schloss „Microsoft“) und einem neuen Raum „Server“, in dem der Admin eine eigene Hausordnung aufhängt.

### Verwaltungs-VM
Admin-Figur an einer VM im VNet, Pfeile mit GPMC/ADUC zur verwalteten Domäne; kein direkter Pfeil zu den verwalteten DCs.

## Karteikarten
- F: Welche integrierten GPOs hat Entra Domain Services? | A: AADDC Computers GPO und AADDC Users GPO.
- F: Kann man die Default Domain Policy in Entra DS bearbeiten? | A: Nein, sie wird von Microsoft verwaltet.
- F: Wer verwaltet GPOs in Entra DS? | A: Mitglieder der Gruppe AAD DC Administrators.
- F: Wie verwaltet man GPOs in Entra DS? | A: Über eine domänenbeigetretene Verwaltungs-VM mit RSAT (GPMC).
- F: Wo liegen synchronisierte Benutzer in Entra DS? | A: Im Container AADDC Users (nicht verschiebbar).
- F: Kann man eigene OUs und GPOs erstellen? | A: Ja, und GPOs mit eigenen OUs bzw. AADDC-Containern verknüpfen.
- F: Wie passt man Kennwort-/Sperrrichtlinien in Entra DS an? | A: Mit Fine-Grained Password Policies (PSOs).
- F: Welche Verknüpfung ist in Entra DS nicht möglich? | A: GPO-Verknüpfung auf Domänenebene.

## Quiz
? Welches GPO wirkt in Entra DS standardmäßig auf alle beigetretenen Computer?
* AADDC Computers GPO
- Default Domain Policy (bearbeitbar)
- Default Domain Controllers Policy
- Local Group Policy

? Ein Admin möchte eine GPO nur für Server-VMs in Entra DS. Vorgehen?
* Eigene OU „Server“ erstellen, VMs dort anlegen und eigenes GPO verknüpfen
- Default Domain Policy ändern
- Synchronisierte Benutzer in die OU verschieben
- Schema erweitern

? Womit werden GPOs in Entra DS verwaltet?
* GPMC auf einer domänenbeigetretenen Verwaltungs-VM
- Direkt auf den verwalteten DCs per RDP
- Nur im Azure-Portal ohne Tools
- Mit dcgpofix

? Welche Aussage ist korrekt?
* Integrierte AADDC-GPOs können bearbeitet, aber nicht gelöscht werden
- Integrierte GPOs können gelöscht werden
- Eigene GPOs sind nicht erlaubt
- Nur Microsoft darf GPOs anlegen

? Wie werden abweichende Kennwortrichtlinien in Entra DS umgesetzt?
* Mit FGPP (Password Settings Objects)
- Mit der Default Domain Policy
- Mit dcgpofix
- Gar nicht möglich

? Welche Gruppe darf in Entra Domain Services GPOs verwalten?
* AAD DC Administrators
- Domänen-Admins
- Schema-Admins
- Organisations-Admins
! Mitglieder verwalten die benutzerdefinierten OUs und GPOs.

? Können die integrierten GPOs der Container „AADDC Computers“ und „AADDC Users“ angepasst werden?
* Ja, sie lassen sich mit der Gruppenrichtlinienverwaltung bearbeiten.
- Nein, sie sind vollständig gesperrt.
- Nur per Azure CLI.
- Nur durch den Microsoft-Support.
! Zusätzlich können eigene OUs mit eigenen GPOs angelegt werden.

? Von welchem Rechner aus verwaltet man GPOs in Entra DS?
* Von einer der verwalteten Domäne beigetretenen VM mit installierten RSAT-Tools
- Direkt auf den DCs per RDP
- Nur im Azure-Portal
- Von jedem Internet-PC ohne Domänenbeitritt
! Auf die verwalteten DCs selbst hat der Kunde keinen RDP-Zugriff.

? Wo legt man benutzerdefinierte OUs in Entra DS an?
* Mit „Active Directory-Benutzer und -Computer“ auf einer Verwaltungs-VM
- Im Entra-Portal unter Gruppen
- In Azure Policy
- In der Registry der DCs
! Benutzer aus Entra ID werden in AADDC Users synchronisiert, nicht in eigene OUs.
