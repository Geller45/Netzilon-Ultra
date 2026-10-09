---
id: az801-dc-haertung
bereich: AZ-801
block: A9
kapitel: Sicherheit
titel: Domänencontroller härten und Zugriff beschränken
stufe: Fortgeschritten
quellen: [AZ-801 Study Guide, Microsoft Learn]
verweise: [az801-baselines, az801-protected-users, az801-rodc-sicherheit, az801-auth-silos, az801-defender-identity, az800-adds-dc]
---

## Profi

### Ziel
Ein **DC** hält die **komplette Identitätsdatenbank** (`NTDS.dit`, **alle Kennwort-Hashes**). Wer den DC **beherrscht**, beherrscht **die ganze Domäne**. Deshalb gilt: **DCs sind Tier-0-Systeme** und werden **maximal gehärtet** und **abgeschottet**.

### Bausteine der Härtung
| Ebene | Maßnahme |
|---|---|
| **Betriebssystem** | **Server Core** (**kleinere Angriffsfläche**), **aktuelle Patches**, **keine zusätzlichen Rollen** (**kein** IIS, **kein** Dateiserver, **keine** Software Dritter) |
| **Physisch/Virtuell** | **Gesperrter Serverraum**, **UEFI Secure Boot**, **TPM**, **BitLocker** auf **DC-Volumes**; **virtuelle DCs**: **verschlüsselte VMs**/**Shielded VMs**, **Host** ebenfalls **Tier 0** |
| **Anmeldung** | **Nur Tier-0-Admins** dürfen **lokal/per RDP** an DCs; **Deny log on** für **Tier-1/2-Konten** |
| **Netzwerk** | **Windows-Firewall** aktiv, **nur benötigte Ports** (DNS, Kerberos, LDAP, SMB, RPC), **Verwaltung** nur von **PAW** |
| **Protokolle** | **SMBv1 aus**, **NTLM** einschränken/auditieren, **LDAP-Signierung** und **Channel Binding** erzwingen, **SMB-Signierung** erforderlich |
| **Kerberos** | **AES** erzwingen, **RC4/DES** aus, **Kerberos Armoring (FAST)** aktivieren |
| **Anwendungssteuerung** | **AppLocker/WDAC** auf **DCs** (nur **freigegebene** Software) |
| **Überwachung** | **Erweiterte Überwachungsrichtlinie**, **Ereignisweiterleitung** zu **SIEM**, **Defender for Identity** |
| **Wiederherstellung** | **DSRM-Kennwort** **bekannt** und **geschützt**, **Systemstatus-Backup** |

### Das Tier-Modell (Verwaltungsebenen)
| Tier | Inhalt | Wer verwaltet |
|---|---|---|
| **Tier 0** | **DCs**, **AD-Admins**, **PKI**, **Entra Connect**, **Virtualisierungshosts der DCs** | **Nur Tier-0-Admins** |
| **Tier 1** | **Server** und **Anwendungen** | **Server-Admins** |
| **Tier 2** | **Arbeitsplätze**, **Geräte** | **Helpdesk** |

**Grundregel**: **Höhere Ebene** **darf** niedrigere verwalten, **niemals umgekehrt** anmelden. **Tier-0-Konten** melden sich **nie** an Tier-1/2-Geräten an (**Credential-Diebstahl**).

**Umsetzung**: **Getrennte Admin-Konten** je Tier, **Gruppenrichtlinien** mit **Benutzerrechten** (**Anmelden verweigern**), **Authentication Policy Silos** (Seite 08), **Protected Users** (Seite 05).

### Benutzerrechte (GPO) für die Zugriffsbeschränkung
`Computerkonfiguration → Windows-Einstellungen → Sicherheitseinstellungen → Lokale Richtlinien → Zuweisen von Benutzerrechten`
| Recht | Empfehlung für Tier-0-Konten / DCs |
|---|---|
| **Lokal anmelden verweigern** (*Deny log on locally*) | **Tier-1/2-Admin-Gruppen** |
| **Anmelden über Remotedesktopdienste verweigern** | **Tier-1/2-Admin-Gruppen** |
| **Auf diesen Computer vom Netzwerk aus zugreifen** | **Nur** erforderliche Gruppen |
| **Lokal anmelden zulassen** | **Nur Tier-0-Admins** (Standard bei DCs: **Administratoren**, **Konten-Operatoren**, **Server-Operatoren**, **Sicherungs-Operatoren**, **Domänencontroller**) |
| **Als Dienst anmelden verweigern**, **Als Batchauftrag anmelden verweigern** | **Admin-Konten** an **Tier-1/2** |

Die **Domänencontroller-OU** (**Default Domain Controllers Policy**) **enthält nur DCs**; **Standardbenutzer/Server** nie in diese OU.

### Weitere Schutzmaßnahmen
| Thema | Details |
|---|---|
| **Privileged Access Workstations** (**PAW**) | **Gehärtete Rechner** **nur** für **Verwaltung** von **DCs**; **kein** E-Mail/Web |
| **Just-in-Time-Zugriff** / **PIM** | **Adminrechte** **nur zeitlich begrenzt** (**Privileged Identity Management**, **JIT**) |
| **LAPS** (*Local Administrator Password Solution*) | **Zufällige lokale Admin-Kennwörter** je Gerät im **AD** (**Windows LAPS** eingebaut) |
| **Hardened UNC Paths** | **SYSVOL/NETLOGON** nur mit **gegenseitiger Authentifizierung** (**RequireMutualAuthentication**, **RequireIntegrity**) |
| **krbtgt-Konto** | **Kennwort** **zweimal** **ändern** (Abstand ≥ **10 Stunden**) bei **Kompromittierung** |
| **Zeit** | **Zeitsynchronisierung** (**PDC-Emulator** → **externe Quelle**), **Kerberos** **5 Min.** Toleranz |
| **Credential Guard** | **Auf DCs nicht unterstützt** (nur **Mitgliedsserver/Clients**); **Schutz** dort über **Baselines** und **Tiering** |

### Sicherheits-Baselines (Bezug Seite 03)
**Microsoft Security Baseline** enthält **eigene Einstellungen** für **Domänencontroller** (GPO **„MSFT Windows Server 2022 – Domain Controller“**). **Import** über **Security Compliance Toolkit**, **Verknüpfung** mit der **Domain Controllers-OU**.

### Überwachung (Advanced Audit Policy)
`Computerkonfiguration → Windows-Einstellungen → Sicherheitseinstellungen → Erweiterte Überwachungsrichtlinienkonfiguration`
- **Kontoanmeldung**: **Kerberos-Authentifizierungsdienst**, **Anmeldeinformationen überprüfen**
- **Kontoverwaltung**: **Benutzerkontenverwaltung**, **Sicherheitsgruppenverwaltung**
- **DS-Zugriff**: **Verzeichnisdienständerungen**
- **Anmelden/Abmelden**: **Anmelden**, **Spezielle Anmeldung**
- **Zentral sammeln**: **Windows-Ereignisweiterleitung** (*WEF*) oder **Azure Monitor Agent** → **Sentinel**

## Lab
**Maschinen**: **DC01**, **DC02** (Server Core, example.com), **PAW01** (Windows 11), **CLIENT01**.

### GUI
1. **DC01**: **Gruppenrichtlinienverwaltung** (`gpmc.msc`) → **Domain Controllers** → **Neue GPO** `GPO-DC-Haertung` → **Bearbeiten**.
2. **DC01**: **Computerkonfiguration → Windows-Einstellungen → Sicherheitseinstellungen → Lokale Richtlinien → Zuweisen von Benutzerrechten**.
3. **DC01**: **Lokal anmelden verweigern** → Gruppe `Tier2-Admins` hinzufügen.
4. **DC01**: **Anmelden über Remotedesktopdienste verweigern** → Gruppe `Tier2-Admins` hinzufügen.
5. **DC01**: **Sicherheitsoptionen** → **Domänencontroller: Signaturanforderungen für LDAP-Server** → **Signierung erforderlich**.
6. **DC01**: **Sicherheitsoptionen** → **Microsoft-Netzwerk (Server): Kommunikation digital signieren (immer)** → **Aktiviert**.
7. **DC01**: **Advanced Audit Policy** → **Kontoverwaltung** → **Benutzerkontenverwaltung** → **Erfolg und Fehler**.
8. **DC01**: **SMBv1** deaktivieren (**PowerShell** siehe unten).
9. **CLIENT01**: `gpupdate /force` → Test: **Tier-2-Admin** **RDP zum DC** → **verweigert**.

### PowerShell
```powershell
# Auf DC01 – SMBv1 aus, SMB-Signierung erzwingen
Set-SmbServerConfiguration -EnableSMB1Protocol $false -RequireSecuritySignature $true -Force
Get-SmbServerConfiguration | Select-Object EnableSMB1Protocol, RequireSecuritySignature

# Auf DC01 – Rollen prüfen (nur AD DS/DNS erwartet)
Get-WindowsFeature | Where-Object Installed

# Auf DC01 – Firewall-Status
Get-NetFirewallProfile | Select-Object Name, Enabled

# Auf DC01 – Audit-Richtlinie
auditpol /set /subcategory:"User Account Management" /success:enable /failure:enable
auditpol /get /category:*

# Auf DC01 – LDAP-Signierung lokal prüfen (Registry)
Get-ItemProperty "HKLM:\SYSTEM\CurrentControlSet\Services\NTDS\Parameters" -Name "LDAPServerIntegrity" -ErrorAction SilentlyContinue

# Auf DC01 – Wer ist Domänen-Admin?
Get-ADGroupMember "Domain Admins" | Select-Object Name, SamAccountName
```

## Einfach

Der **Domänencontroller** ist der **Tresor**, in dem **alle Schlüssel des Hauses** liegen. Wer den Tresor öffnet, **besitzt alles**. Darum:

- **Tresor-Raum abschließen** (**physisch sichern**, **BitLocker**).
- **Nur das Nötigste im Raum** (**keine** anderen Programme/Rollen → **Server Core**).
- **Wenige Leute** dürfen rein (**nur Tier-0-Admins**), und die **benutzen einen Extra-Rechner nur dafür** (**PAW**).
- **Alte, unsichere Türen** zumauern (**SMBv1**, **NTLM**, **unsigniertes LDAP**).
- **Kamera überall** (**Überwachung/Audit**, **Sentinel**).
- **Stufen-Modell (Tier)**: **Chef-Schlüssel** **nie** in **normalen Büros** benutzen! Wenn der **Chef-Admin** sich am **Arbeits-PC** anmeldet, könnte ein Hacker den **Schlüssel klauen**.

Kurz: **Tresor = Tier 0**, **Server = Tier 1**, **PCs = Tier 2**. **Nie von unten nach oben** anmelden.

## Merksatz
- **DC = Tier 0**: **Server Core**, **keine Zusatzrollen**.
- **Tier 0** meldet sich **nie** an **Tier 1/2** an.
- **PAW** für **DC-Verwaltung**, **kein** E-Mail/Web.
- **SMBv1 aus**, **LDAP signieren**, **NTLM auditieren**.
- **krbtgt** bei **Kompromittierung** **zweimal** zurücksetzen.
- **Credential Guard** **nicht** auf **DCs**.

## Prüfungsfalle
- **Zusätzliche Rollen** auf dem **DC** (**IIS**, **Datei**) **vermeiden**.
- **Domänen-Admins** **niemals** an **Arbeitsplätzen/Mitgliedsservern** anmelden.
- **krbtgt**: **zweimal** zurücksetzen (**Replikation abwarten**), **einmal reicht nicht**.
- **Credential Guard** wird **auf DCs nicht** unterstützt.
- **LDAP-Signierung** und **Channel Binding** **erst auditieren**, dann **erzwingen** (**Fehlfunktionen** bei alten Anwendungen).
- **Benutzerrechte** „**Anmelden verweigern**“ **schlagen** „**Anmelden zulassen**“.
- **Default Domain Controllers Policy** **nicht** überladen – **eigene GPO** erstellen und **verknüpfen**.
- **Zeit**: **PDC-Emulator** muss **extern** synchronisieren, **DCs** folgen **automatisch**.

## Grafik
### Tresor und Stufen
Dreistufiges Gebäude: oben Tier 0 (Tresor mit DCs), Mitte Tier 1 (Server), unten Tier 2 (PCs); Pfeile „Verwalten“ nur abwärts; rotes Kreuz bei „Anmelden“ abwärts für Tier-0-Konten.

### Härtungs-Checkliste
Tresortür mit Schlössern: Server Core, Firewall, Signierung, AppLocker, Audit; jedes Schloss rastet der Reihe nach ein.

### PAW-Schleuse
Admin sitzt an der PAW, Verbindung führt nur durch eine Schleuse zum DC; E-Mail/Web-Symbol durchgestrichen.

## Karteikarten
- F: Warum sind DCs besonders schützenswert? | A: Sie enthalten alle Konten und Kennwort-Hashes (NTDS.dit).
- F: Welche OS-Variante ist für DCs empfohlen? | A: Server Core.
- F: Was ist Tier 0? | A: DCs, AD-Admins, PKI, Entra Connect und deren Infrastruktur.
- F: Was ist eine PAW? | A: Privileged Access Workstation, gehärteter Verwaltungsrechner ohne E-Mail/Web.
- F: Wie oft wird das krbtgt-Kennwort bei Kompromittierung geändert? | A: Zweimal, mit Abstand (Replikation abwarten).
- F: Wird Credential Guard auf DCs unterstützt? | A: Nein.
- F: Welche Protokolle deaktivieren? | A: SMBv1, unsicheres NTLM, unsigniertes LDAP.
- F: Was ist LAPS? | A: Automatische Verwaltung zufälliger lokaler Admin-Kennwörter.
- F: Was schützt Hardened UNC Paths? | A: SYSVOL/NETLOGON vor Manipulation durch gegenseitige Authentifizierung.
- F: Welches Recht verhindert Tier-2-Admin-Anmeldung am DC? | A: Lokal anmelden verweigern / Über RDP anmelden verweigern.
- F: Wo werden DC-spezifische Baselines verknüpft? | A: Mit der OU Domain Controllers.

## Quiz
? Welche Rolle sollte zusätzlich auf einem DC installiert werden?
* Keine, DCs bleiben auf AD DS/DNS beschränkt
- IIS
- Dateiserver
- Druckserver

? Ein Domänen-Admin meldet sich an einem Arbeitsplatz an. Was ist das Risiko?
* Credential-Diebstahl, Zugriff auf Tier 0
- Kennwortablauf
- Kontosperrung
- Zeitabweichung

? Welche Maßnahme trennt Verwaltungsebenen technisch?
* Anmelden-verweigern-Rechte per GPO plus Authentication Policy Silos
- Zweite Default Domain Policy
- Gemeinsame Adminkonten
- NTFS-Berechtigungen auf C:

? Nach Kompromittierung der Domäne muss das krbtgt-Konto behandelt werden. Wie?
* Kennwort zweimal zurücksetzen, mit Abstand
- Konto löschen
- Nur einmal zurücksetzen
- Konto deaktivieren

? Wofür wird eine PAW genutzt?
* Ausschließlich für Verwaltung privilegierter Systeme
- Für tägliche Büroarbeit
- Als Dateiserver
- Als Backup-Ziel

? Welche Technik wird auf DCs nicht unterstützt?
* Credential Guard
- AppLocker
- BitLocker
- Windows Defender Firewall

? Welches Modell trennt Verwaltungsebenen in Tier 0, Tier 1 und Tier 2?
* Das Tiering-Modell bzw. Enterprise Access Model
- Das OSI-Modell
- Das V-Modell
- Das Wasserfallmodell
! Tier-0-Konten dürfen sich nie an Tier-1/2-Systemen anmelden.

? Warum sollten DCs keine Internetzugriffe (z. B. Browsen) erlauben?
* Um Angriffe über Webinhalte und Schadsoftware auf das wichtigste System zu verhindern
- Weil DCs keine Netzwerkkarte brauchen
- Weil sonst die Replikation stoppt
- Weil DNS dann nicht funktioniert
! DCs sind Tier-0-Systeme mit minimaler Angriffsfläche.
