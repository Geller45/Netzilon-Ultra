---
id: az801-hybrid-auth-troubleshooting
bereich: AZ-801
block: A10
kapitel: Monitoring und Troubleshooting
titel: Hybrid-Authentifizierung (Troubleshooting)
stufe: Profi
quellen: [AZ-801 Study Guide, Microsoft Learn]
verweise: [az800-entra-connect, az800-hybrid-auth, az800-kennwort-hybrid, az801-ad-replikation]
---

## Profi

### Die drei Verfahren im Überblick
| Verfahren | Wo wird das Kennwort geprüft? | Wichtigster Fehlerpunkt |
|---|---|---|
| **Kennworthash-Synchronisierung** (*PHS*) | **In der Cloud** **(Hash des Hashs)** | **Sync-Zyklus**, **Entra Connect** |
| **Passthrough-Authentifizierung** (*PTA*) | **On-Premises** **über Agent** | **PTA-Agent** **offline**, **Ports** |
| **Verbund** (*Federation, AD FS*) | **On-Premises AD FS** | **Zertifikate**, **AD-FS-Dienst**, **WAP** |

**Nahtloses SSO** (*Seamless SSO*) **kann** **zu** **PHS** **oder** **PTA** **kommen** **(Kerberos)**.

### Entra Connect: Synchronisierungsfehler
| Fehler | Ursache / Lösung |
|---|---|
| **Doppelter Attributwert** (*AttributeValueMustBeUnique*) | **proxyAddresses/UPN** **doppelt** **→** **Wert** **ändern** |
| **Nicht routbare UPN** (`.local`) | **Alternativen UPN-Suffix** **(routbare Domäne)** **eintragen** |
| **Ungültige Zeichen** | **In Attributen** **(Leerzeichen, Umlaute)** **korrigieren** |
| **Objekt** **nicht** **synchronisiert** | **OU** **nicht** **im Filter** |
| **Verbindungsfehler** | **Firewall/Proxy** |
| **Zeitüberschreitung** | **Netzwerk**, **Last** |
| **Kennwort** **ändert** **sich** **nicht** | **PHS** **nicht aktiv**, **Writeback** **fehlt** |

**Werkzeuge**: **`IdFix`** **(Vorabprüfung des Verzeichnisses)**, **Synchronization Service Manager**, **Synchronization Rules Editor**, **Entra Connect Health**, **Entra Admin Center → Synchronisierungsfehler**.

```powershell
# Auf AADC01 (Entra Connect Server)
Get-ADSyncScheduler
Start-ADSyncSyncCycle -PolicyType Delta
Start-ADSyncSyncCycle -PolicyType Initial      # Vollsync
Set-ADSyncScheduler -SyncCycleEnabled $true
Get-ADSyncConnector | Select-Object Name, Type
Get-ADSyncAADPasswordSyncConfiguration -SourceConnector "exa.local"
Invoke-ADSyncDiagnostics -PasswordSync
```

### PTA-Agent
- **Mindestens** **2–3 Agenten** **für** **Hochverfügbarkeit** **(Empfehlung 3)**.
- **Ausgehend** **HTTPS 443**, **zusätzlich** **80** **(CRL-Prüfung)**, **keine** **eingehenden Ports**.
- **Agent-Status** **im** **Entra Admin Center** **→ Entra Connect → Passthrough-Authentifizierung**.
- **Fehlerbild**: **„Keine Verbindung mit dem Authentifizierungs-Agenten“**.
- **Dienst** **„Microsoft Entra Connect Authentication Agent“** **läuft?**.

### Nahtloses SSO
- **Computerkonto** **`AZUREADSSOACC`** **in AD**.
- **Kerberos-Entschlüsselungsschlüssel** **alle 30 Tage** **erneuern** **(`Update-AzureADSSOForest`)**.
- **URLs** **in** **Intranetzone** **(GPO)**: `https://autologon.microsoftazuread-sso.com`.
- **Nur** **auf** **domänengebundenen** **Geräten** **im** **Netzwerk**.

### Verbund (AD FS)
| Problem | Ursache |
|---|---|
| **Login-Fehler** **für alle** | **Token-Signaturzertifikat** **abgelaufen** |
| **Externe Anmeldung** **geht nicht** | **WAP** **(Webanwendungsproxy)**, **Zertifikat**, **Firewall 443** |
| **Zertifikatswarnung** | **SSL-Zertifikat** **abgelaufen** |
| **Falscher Sicherheitstoken** | **Zeitabweichung** |
| **Federation-Trust** | **Trust-Metadaten** **veraltet** **(`Update-MgDomainFederationConfiguration`/`Update-MSOLFederatedDomain`)** |

```powershell
# Auf ADFS01
Get-AdfsCertificate | Select-Object CertificateType, Thumbprint, NotAfter
Update-AdfsCertificate -CertificateType Token-Signing -Urgent
Test-AdfsServerHealth
Get-WinEvent -LogName "AD FS/Admin" -MaxEvents 20
```

### Hybrid Join und Geräte
```powershell
# Auf Client
dsregcmd /status      # AzureAdJoined, DomainJoined, PRT (AzureAdPrt)
```
**Hybrid-Join** **braucht**: **SCP** **(Service Connection Point)** **in AD**, **Gerät** **in** **synchronisierter OU**, **Zugriff** **auf** **login.microsoftonline.com** **und** **enterpriseregistration.windows.net**.

### Anmeldeprotokolle und Diagnose
- **Entra Admin Center → Überwachung → Anmeldeprotokolle**: **Fehlercodes** **(z. B.** **AADSTS50126** **falsches Kennwort**, **AADSTS50034** **Benutzer nicht gefunden**, **AADSTS50053** **Konto gesperrt**, **AADSTS50076** **MFA erforderlich**).
- **Entra Connect Health**: **Warnungen** **zu** **Sync**, **AD FS**, **AD DS**.
- **Kennwortrückschreiben** (*Password Writeback*): **Cloud-Änderung** **zurück** **in AD**; **braucht** **Berechtigung** **„Kennwort zurücksetzen“**.

### Entscheidungsbaum
1. **Benutzer** **im** **Entra Admin Center** **vorhanden?** **Nein** → **Sync**.
2. **Anmeldung** **scheitert**: **PHS/PTA/Fed?** **→** **jeweilige Komponente**.
3. **Fehlercode** **im Anmeldeprotokoll**.
4. **Zeit, DNS, Zertifikate, Ports** **prüfen**.

## Lab
**Maschinen**: **AADC01**, **DC01**, **Client01**.

### GUI
1. **AADC01**: **Synchronization Service Manager** **starten** → **Reiter „Operationen“** **→ Fehler** **prüfen**.
2. **AADC01**: **PowerShell → `Start-ADSyncSyncCycle -PolicyType Delta`**.
3. **Client01**: **`dsregcmd /status`** **ausführen**.
4. **Entra Admin Center**: **Überwachung → Anmeldeprotokolle** → **fehlgeschlagene Anmeldung** **öffnen** → **Fehlercode lesen**.
5. **Entra Admin Center**: **Entra Connect → Connect Health → Synchronisierungsdienste**.
6. **Entra Admin Center**: **Passthrough-Authentifizierung** → **Agenten-Status** **prüfen**.

## Einfach

**Hybrid-Anmeldung** **ist wie eine Grenzkontrolle**: **Dein Ausweis** **(Benutzer)** **liegt** **in** **zwei Ländern** **(Cloud und lokal)**. **Die Kontrolleure**:
- **PHS** **hat** **eine Kopie** **des Fingerabdrucks** **in der Cloud**.
- **PTA** **ruft** **jedes Mal** **zu Hause** **an** **(Agent)**.
- **Federation** **schickt** **dich zur** **Heimatbehörde** **(AD FS)**.

**Wenn** **jemand** **nicht durchkommt**, **schaust** **du**: **Ist** **der Ausweis** **dort** **(Sync)?** **Läuft das Telefon** **(Agent)?** **Ist** **der Stempel** **abgelaufen** **(Zertifikat)?** **Gehen** **die Uhren gleich** **(Zeit)?**

## Merksatz
- **Sync: Delta oder Initial**.
- **PTA: 3 Agenten, nur ausgehend 443/80**.
- **AZUREADSSOACC-Schlüssel: alle 30 Tage**.
- **AD FS: Zertifikat ablaufen = Totalausfall**.
- **`dsregcmd /status`** **= Gerätezustand**.
- **IdFix** **vor** **dem** **ersten Sync**.

## Prüfungsfalle
- **`.local`-UPN** **wird** **nicht** **synchronisiert** **(Alt-UPN nötig)**.
- **PTA** **braucht** **keine** **eingehenden Ports**.
- **PHS** **synchronisiert** **etwa alle** **2 Minuten** **(Kennwort)**.
- **Objektsync** **standardmäßig** **alle** **30 Minuten**.
- **Nahtloses SSO** **≠** **eigenes Verfahren**.
- **Token-Signatur** **abgelaufen** **= alle** **Anmeldungen** **scheitern**.
- **Hybrid Join** **braucht** **SCP**.

## Grafik
### Grenzkontrolle
Drei Schalter: PHS (Kopie), PTA (Telefon), Federation (Heimatbehörde).

### Fehlerbaum
Baum: Sync, Verfahren, Fehlercode, Zeit/DNS/Zertifikate.

### Sync-Uhr
Zwei Zeiger: Objektsync 30 Minuten, Kennwort 2 Minuten.

## Befehle
- `Start-ADSyncSyncCycle -PolicyType Delta|Initial` – Sync auslösen
- `Get-ADSyncScheduler` – Scheduler
- `Invoke-ADSyncDiagnostics -PasswordSync` – PHS prüfen
- `Get-AdfsCertificate` – AD-FS-Zertifikate
- `dsregcmd /status` – Join-Status
- `Update-AzureADSSOForest` – SSO-Schlüssel erneuern

## Karteikarten
- F: Wo prüft PTA das Kennwort? | A: On-Premises über den PTA-Agent.
- F: Welche Ports braucht der PTA-Agent? | A: Ausgehend 443 und 80.
- F: Wie oft sollte der SSO-Schlüssel erneuert werden? | A: Alle 30 Tage.
- F: Welches Tool prüft das Verzeichnis vor der Sync? | A: IdFix.
- F: Welcher Befehl löst einen Delta-Sync aus? | A: Start-ADSyncSyncCycle -PolicyType Delta.
- F: Was zeigt dsregcmd /status? | A: Join-Status und PRT des Geräts.
- F: Was bricht bei abgelaufenem Token-Signaturzertifikat? | A: Alle Verbund-Anmeldungen.
- F: Wie heißt das SSO-Computerkonto? | A: AZUREADSSOACC.
- F: Warum wird ein .local-UPN nicht synchronisiert? | A: Nicht routbare Domäne, alternativen UPN nutzen.

## Quiz
? Ein Benutzer mit UPN @exa.local wird nicht synchronisiert. Ursache?
* Nicht routbarer UPN-Suffix
- Zu langer Name
- Fehlender Papierkorb
- Falsche OU

? Welche Ports benötigt der PTA-Agent?
* Ausgehend 443 und 80
- Eingehend 443
- Eingehend 3389
- Ausgehend 445

? Welcher Befehl löst einen sofortigen Delta-Sync aus?
* Start-ADSyncSyncCycle -PolicyType Delta
- Get-ADSyncScheduler
- Update-ADSync
- Sync-ADObject

? Wie oft erneuert man den Kerberos-Schlüssel für nahtloses SSO?
* Alle 30 Tage
- Jährlich
- Nie
- Täglich

? Alle Verbund-Anmeldungen schlagen plötzlich fehl. Verdacht?
* Token-Signaturzertifikat abgelaufen
- Falsche Bildschirmauflösung
- Fehlender DHCP
- Papierkorb aus

? Womit prüft man den Hybrid-Join-Status eines Clients?
* dsregcmd /status
- gpresult
- ipconfig
- nltest

? Mit welchem Werkzeug analysiert man Synchronisationsfehler von Entra Connect?
* Synchronization Service Manager und Entra Connect Health
- Ereignisanzeige des Clients
- DHCP-Konsole
- DNS-Manager
! Dort sieht man Fehler je Connector und Objekt.

? Welche Ursache ist typisch, wenn Benutzer mit Kennworthashsynchronisierung ihr neues Kennwort in der Cloud noch nicht nutzen können?
* Die Synchronisation des Kennworthashs ist noch nicht erfolgt bzw. gestört (Intervall ca. 2 Minuten)
- Der DHCP-Server ist ausgefallen
- Die Gruppenrichtlinie ist zu alt
- Das Benutzerkonto ist zu groß
! Kennworthashes werden unabhängig vom 30-Minuten-Zyklus etwa alle 2 Minuten synchronisiert.
