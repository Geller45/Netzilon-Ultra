---
id: az800-join-entra
bereich: AZ-800
block: A7
kapitel: AD DS on-premises & Cloud
titel: Windows Server in AD DS, Entra Domain Services und Entra ID einbinden
stufe: Fortgeschritten
quellen: [AZ-800 Study Guide, Microsoft Learn]
verweise: [ap1-a6-adds, az800-dcs-azure, az800-entra-connect, az800-hybrid-auth, az800-gpo-entra-ds]
---

## Profi

### Drei Identitäts-Ziele im Vergleich
| | **AD DS** (on-prem oder Azure-VM) | **Microsoft Entra Domain Services** | **Microsoft Entra ID** |
|---|---|---|---|
| Art | klassisches Verzeichnis, selbst betrieben | **verwaltete Domäne** (PaaS), Microsoft betreibt 2 DCs | Cloud-Identitätsplattform |
| Protokolle | Kerberos, NTLM, LDAP, GPO | Kerberos, NTLM, LDAP(S), GPO | OAuth 2.0, OIDC, SAML |
| Domänenbeitritt klassisch | ja | ja | **nein** – stattdessen „Entra-Beitritt“ (Geräteidentität) |
| Admin-Rechte | Domänen-/Organisations-Admins | **keine** Domänen-Admins; Gruppe **AAD DC Administrators** mit begrenzten Rechten | Entra-Rollen (Global Admin …) |
| Schema erweitern | ja | nein | nein |
| Vertrauensstellungen | ja | begrenzt (unidirektionaler ausgehender Forest-Trust zu on-prem möglich) | – |
| Typischer Zweck | Standard-Unternehmensnetz | Lift-and-Shift von Legacy-Apps nach Azure ohne eigene DCs | Cloud-Apps, M365, Geräteverwaltung (Intune), SSO |

### Beitritt zu AD DS (klassisch)
- Voraussetzungen: DNS zeigt auf DCs, Netzwerk zu DC (Ports 53, 88, 135, 389, 445 …), Konto mit Beitrittsrecht (Domänen-Benutzer dürfen standardmäßig **10 Computer** hinzufügen – `ms-DS-MachineAccountQuota`; besser delegieren und auf 0 setzen).
- Wege: `sysdm.cpl`, **sconfig** (Server Core), `Add-Computer`, **WAC**.
- **Vorab bereitstellen** (Pre-Staging): Computerkonto in der richtigen OU anlegen und festlegen, wer beitreten darf.
- **Offline-Domänenbeitritt** (`djoin.exe`): Beitritt **ohne Verbindung** zum DC – Provisioning-Datei auf einem Domänenrechner erzeugen, auf dem Zielserver anwenden; beim nächsten Start mit DC-Verbindung ist er Mitglied. Einsatz: Filialen, Images, Azure-Bereitstellung.
```
djoin /provision /domain contoso.local /machine SRV10 /machineou "OU=Server,DC=contoso,DC=local" /savefile C:\srv10.txt
djoin /requestODJ /loadfile C:\srv10.txt /windowspath %SystemRoot% /localos
```

### Beitritt zu Entra Domain Services
- Entra DS wird im Azure-Portal in einem **VNet/Subnetz** bereitgestellt (verwalteter Domänenname, z. B. `aadds.contoso.com`).
- **VNet-DNS** auf die **zwei IP-Adressen** der verwalteten Domäne setzen.
- Benutzer/Gruppen werden **aus Entra ID** synchronisiert (einseitig: Entra ID → Entra DS; Änderungen in Entra DS am Benutzer nicht möglich). Für **Kennwort-Hashes** muss bei **Cloud-Benutzern** einmal das Kennwort geändert werden; bei **synchronisierten** Benutzern muss Entra Connect die NTLM-/Kerberos-Hashes mitsynchronisieren.
- VM im gleichen/peerten VNet → normal der Domäne beitreten mit einem Mitglied von **AAD DC Administrators** (bzw. einem Benutzer der verwalteten Domäne).
- Verwaltung mit RSAT von einer beigetretenen Verwaltungs-VM: eigene **OUs** anlegen, **GPOs** in den Containern „AADDC Computers“/„AADDC Users“ bzw. eigenen OUs bearbeiten.

### Beitritt zu Entra ID
- **Entra-Beitritt** (Microsoft Entra joined): vor allem für **Windows-Clients** (Intune-verwaltet, Cloud-first).
- **Windows Server** kann nicht klassisch „Entra joined“ werden wie ein Client; aber:
  - **Azure-VMs mit Windows Server 2019+** unterstützen die **Anmeldung mit Entra ID** (VM-Erweiterung **AADLoginForWindows**, RBAC-Rollen „Virtual Machine Administrator Login“/„User Login“).
  - **Microsoft Entra hybrid joined**: Computer ist **AD DS-Mitglied** und wird per **Entra Connect** als Gerät in Entra ID registriert → Bedingter Zugriff, SSO zu Cloud-Apps.
  - **Azure Arc** (Arc-fähige Server) erhält eine **verwaltete Identität** in Entra ID und kann ebenfalls Entra-Anmeldung nutzen.
- Gerätestatus prüfen: `dsregcmd /status` (AzureAdJoined, DomainJoined, EnterpriseJoined).

## Lab
**Maschinen**: DC01, SRV10 (neu, noch nicht erreichbar), CL01; optional Azure-Abo.

### GUI
1. **DC01**: `dsa.msc` → OU **Server** → Rechtsklick → Neu → **Computer** → Name `SRV10` → „Benutzer oder Gruppe ändern“ → `GG-ServerAdmins` darf beitreten.
2. **DC01**: Offline-Beitrittsdatei erzeugen (Befehl siehe oben), Datei per USB zu SRV10.
3. **SRV10** (ohne Netzwerk): Eingabeaufforderung als Admin → `djoin /requestODJ …` → Neustart mit Netzwerk → Anmeldung `CONTOSO\…` möglich.
4. **SRV10**: `dsregcmd /status` → `DomainJoined : YES`, `AzureAdJoined : NO`.
5. **Azure (optional)**: Portal → **Microsoft Entra Domain Services** → Erstellen → DNS-Name, VNet → nach Bereitstellung **VNet-DNS aktualisieren** (Portal-Hinweis „DNS-Servereinstellungen konfigurieren“) → Windows-Server-VM im VNet → `sysdm.cpl` → Domäne `aadds.contoso.com` → Konto aus **AAD DC Administrators**.
6. **Azure (optional)**: Windows-Server-VM → Einstellungen → **Microsoft Entra ID-Anmeldung aktivieren** → IAM → Rolle **Virtual Machine Administrator Login** zuweisen → RDP mit `AzureAD\benutzer@firma.de`.

### PowerShell
```powershell
# Auf DC01 – Pre-Staging und Maschinenkontingent
New-ADComputer -Name SRV10 -Path "OU=Server,DC=contoso,DC=local"
Set-ADDomain contoso.local -Replace @{"ms-DS-MachineAccountQuota"="0"}

# Offline-Beitritt vorbereiten (DC01) und anwenden (SRV10)
djoin /provision /domain contoso.local /machine SRV10 /machineou "OU=Server,DC=contoso,DC=local" /savefile C:\Temp\srv10.txt /reuse
djoin /requestODJ /loadfile C:\Temp\srv10.txt /windowspath $env:SystemRoot /localos

# Online-Beitritt in bestimmte OU
Add-Computer -DomainName contoso.local -OUPath "OU=Server,DC=contoso,DC=local" -Credential CONTOSO\adm.becker -Restart

# Gerätestatus
dsregcmd /status

# Azure-VM: Entra-Anmeldung per Erweiterung (Az-Modul)
Set-AzVMExtension -ResourceGroupName rg-hybrid -VMName srv-az01 -Publisher Microsoft.Azure.ActiveDirectory `
  -ExtensionType AADLoginForWindows -Name AADLoginForWindows -TypeHandlerVersion 2.0 -Location westeurope
```

## Einfach

Ein neuer Server muss irgendwo **„Mitglied werden“**, damit sich Leute mit ihren Firmenkonten anmelden können. Es gibt drei Vereine:

1. **AD DS** – der **klassische Verein** mit eigenem Vereinsheim (DCs), den du selbst betreibst. Alles erlaubt: Regeln (GPOs), Chef-Schlüssel, eigene Formulare.
2. **Entra Domain Services** – ein **Verein, dessen Vereinsheim Microsoft betreibt**. Du darfst mitmachen, eigene Gruppen und ein paar Regeln festlegen, aber **nicht Vorstand** werden (keine Domänen-Admins). Praktisch, wenn man alte Programme in die Cloud umzieht und kein eigenes Vereinsheim bauen will.
3. **Entra ID** – ein **moderner Online-Club** für Cloud-Apps (Teams, Outlook im Web). Server treten dort nicht „klassisch“ bei, aber Azure-Server können die Club-Anmeldung nutzen.

**Offline-Beitritt (djoin)** ist wie eine **Mitgliedskarte per Post**: Der Server ist gerade noch gar nicht mit dem Vereinsheim verbunden. Man druckt ihm vorab die Mitgliedskarte (Datei), steckt sie ihm zu, und sobald er das erste Mal online ist, ist er automatisch Mitglied.

**Pre-Staging** = den **Platz im Vereinsbuch schon reservieren**: Der Server landet gleich in der richtigen Abteilung (OU), und nur bestimmte Leute dürfen ihn eintragen.

## Merksatz
- **AD DS = voll**, **Entra DS = verwaltet ohne Domänen-Admin**, **Entra ID = Cloud-Protokolle**.
- Entra DS: **VNet-DNS** auf die 2 verwalteten DC-IPs, Admins in **AAD DC Administrators**.
- **djoin** = Offline-Domänenbeitritt.
- Standard: Benutzer dürfen **10** Computer hinzufügen (MachineAccountQuota).
- `dsregcmd /status` zeigt Domänen-/Entra-Status.

## Prüfungsfalle
- In Entra DS gibt es keine Domänen-Admin- oder Schema-Admin-Rechte.
- Synchronisation Entra ID → Entra DS ist einseitig.
- Cloud-Benutzer müssen für Entra DS einmal ihr Kennwort ändern (Hash-Erzeugung).
- Windows Server wird nicht wie ein Client „Entra joined“ – Entra-Anmeldung für Azure-VMs per Erweiterung/Arc.
- Offline-Beitritt braucht einen Rechner mit DC-Zugang für `/provision`.

## Grafik
### Drei Vereine
Drei Gebäude: eigenes Vereinsheim (AD DS), Microsoft-Vereinsheim (Entra DS, Schild „Kein Vorstand für Gäste“), Cloud-Club (Entra ID). Ein Server entscheidet sich per Pfeil; Protokoll-Badges (Kerberos/LDAP vs. OAuth).

### Offline-Beitritt
DC druckt eine Mitgliedskarte (djoin-Datei), Brief-Animation zum Server ohne Netzwerkkabel, beim ersten Online-Start erscheint das Domänenlogo.

## Karteikarten
- F: Unterschied Entra Domain Services und Entra ID? | A: Entra DS: verwaltete klassische Domäne (Kerberos/LDAP/GPO). Entra ID: Cloud-Identität (OAuth/OIDC/SAML), keine GPOs.
- F: Welche Gruppe verwaltet Entra Domain Services? | A: AAD DC Administrators.
- F: Was muss nach der Bereitstellung von Entra DS am VNet geändert werden? | A: DNS-Server auf die IPs der verwalteten Domäne setzen.
- F: Wozu dient djoin? | A: Offline-Domänenbeitritt ohne Verbindung zum DC.
- F: Wie viele Computer darf ein normaler Benutzer standardmäßig der Domäne hinzufügen? | A: 10 (ms-DS-MachineAccountQuota).
- F: Was ist Pre-Staging? | A: Computerkonto vorab in der Ziel-OU anlegen und festlegen, wer beitreten darf.
- F: Was bedeutet „Microsoft Entra hybrid joined“? | A: Gerät ist AD-DS-Mitglied und zusätzlich in Entra ID registriert (über Entra Connect).
- F: Wie ermöglicht man die Entra-Anmeldung an einer Azure-VM mit Windows Server? | A: Erweiterung AADLoginForWindows + RBAC-Rolle VM Administrator/User Login.
- F: Befehl zur Anzeige des Beitrittsstatus? | A: dsregcmd /status

## Quiz
? Eine Legacy-App braucht LDAP und Kerberos in Azure, aber es sollen keine eigenen DCs verwaltet werden. Lösung?
* Microsoft Entra Domain Services
- Nur Microsoft Entra ID
- AD LDS auf einem Client
- Ein RODC on-prem

? Ein Server ohne Netzwerkzugang zur Zentrale soll vorab Domänenmitglied werden. Werkzeug?
* djoin (Offline-Domänenbeitritt)
- dsregcmd /join
- sconfig
- netdom trust

? Welche Rechte haben Admins in Entra Domain Services NICHT?
* Domänen-Admin- und Schema-Admin-Rechte
- Anlegen eigener OUs
- Bearbeiten von GPOs
- Domänenbeitritt von VMs

? Was zeigt dsregcmd /status?
* Ob ein Gerät AD- und/oder Entra-verbunden ist
- Die DHCP-Leases
- Die FSMO-Rollen
- Die DNS-Zonen

? Wie verhindert man, dass normale Benutzer Computer zur Domäne hinzufügen?
* ms-DS-MachineAccountQuota auf 0 setzen und Beitrittsrechte delegieren
- Die Default Domain Policy löschen
- DNS deaktivieren
- Alle Benutzer in Protected Users aufnehmen
