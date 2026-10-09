---
id: az800-webanwendungsproxy
bereich: AZ-800
block: A7
kapitel: Netzwerkinfrastruktur
titel: Webanwendungsproxy – Reverse Proxy, Vorauthentifizierung mit AD FS & Veröffentlichung
stufe: Profi
quellen: [AZ-800 Study Guide, Microsoft Learn, Remotezugriff/Webanwendungsproxy-Unterlagen]
verweise: [az800-vpn, az800-s2s-vpn, az800-hybrid-auth, ap1-a5-firewall, ap1-a6-kerberos]
---

## Profi

### Aufgabe
Der **Webanwendungsproxy** (*Web Application Proxy*, **WAP**) ist ein Rollendienst der Rolle **Remotezugriff**. Er arbeitet als **Reverse Proxy** in der **DMZ**: Externe Clients verbinden sich per **HTTPS (443)** mit dem WAP, dieser leitet an interne Webanwendungen (Intranet, Exchange/OWA, SharePoint, RD-Web, eigene IIS-Seiten) weiter. Interne Server stehen **nie direkt** im Internet.

Zweite Funktion: **AD-FS-Proxy** – veröffentlicht die AD-FS-Anmeldeseite nach außen (für Federation, Office 365, Workplace Join).

### Voraussetzungen
- **AD FS** (Active Directory Federation Services) im internen Netz – WAP speichert seine Konfiguration **in AD FS**; Installation des WAP verlangt Verbindung zum AD-FS-Server und ein Konto mit lokalen Adminrechten auf AD FS.
- **Zertifikate** auf dem WAP: für den AD-FS-Namen (z. B. `adfs.example.com`) und für jede veröffentlichte externe URL (SAN- oder Wildcard-Zertifikat), vertrauenswürdig für externe Clients (öffentliche CA).
- WAP und AD FS **nicht auf demselben Server**.
- **Domänenbeitritt** des WAP nur nötig für **Kerberos-eingeschränkte Delegierung** (Integrated Windows Authentication an Backend-Apps); sonst Arbeitsgruppe in der DMZ möglich.
- Interne DNS-Auflösung der Backend-URLs vom WAP aus (ggf. Hosts-Datei/Split-DNS).

### Vorauthentifizierung (*Preauthentication*)
| Methode | Ablauf | Einsatz |
|---|---|---|
| **Pass-Through** | WAP leitet **ohne** Anmeldung weiter, App authentifiziert selbst | öffentliche Seiten, Apps mit eigener Anmeldung |
| **AD FS** | Benutzer muss sich **am WAP über AD FS** anmelden, **bevor** Datenverkehr zur App gelangt → unauthentifizierter Verkehr erreicht das Backend nie | sensible Apps |
Unter AD FS weitere Varianten:
| App-Typ | Anmeldung |
|---|---|
| **Anspruchsbasiert** (*Claims-based*, WS-Fed/SAML) | AD FS-Token direkt an App |
| **Integrierte Windows-Authentifizierung** (Kerberos/NTLM-Apps) | WAP holt per **Kerberos Constrained Delegation (KCD)** im Namen des Benutzers ein Ticket → WAP-Computerkonto im AD **für Delegierung vertrauen** (nur angegebene Dienste, SPN der App, „Beliebiges Authentifizierungsprotokoll“) |
| **MS-OFBA** | Office-Clients (Word/Excel öffnen SharePoint-Dokumente) |
| **HTTP Basic** | z. B. Exchange ActiveSync (Mobilgeräte); Anmeldedaten werden gegen AD FS geprüft |
| **OAuth2** | Microsoft-Store-/moderne Apps |

### Einstellungen einer veröffentlichten Anwendung
- **Externe URL** (`https://intranet.example.com/`) und **Back-End-Server-URL** (`https://intranet.example.local/`).
- **Externes Zertifikat** (Fingerabdruck).
- **URL-Übersetzung** im Header, wenn externe und interne Namen abweichen (Host-Header; Inhalte im Body übersetzt WAP **nicht**).
- **HTTP-zu-HTTPS-Umleitung**, **Client-IP an Backend weiterleiten** (`X-Forwarded-For`).
- **Wildcard-Veröffentlichung** (z. B. `https://*.apps.example.com/`) für SharePoint-Apps.
- **Hochverfügbarkeit**: mehrere WAP-Server mit gleicher Konfiguration (steht in AD FS) hinter einem **Lastenausgleich** (NLB/Hardware-LB).

### Einordnung heute
- WAP = **on-prem**-Lösung, benötigt **eingehende** Firewallregel 443 in die DMZ.
- **Microsoft Entra-Anwendungsproxy** (*Entra Application Proxy*) = Cloud-Nachfolger: **ausgehender** Connector, keine eingehenden Ports, Anmeldung über Entra ID mit MFA/bedingtem Zugriff (Details auf der Seite S2S/P2S/App Proxy).
- Für Office 365 / Entra Federation bleibt WAP als **AD-FS-Proxy** relevant.

## Lab
**Maschinen**: **DC01** (example.com, AD CS), **ADFS01** (AD FS, `adfs.example.com`), **WEB01** (IIS, Intranet mit Windows-Authentifizierung, `intranet.example.com`), **WAP01** (DMZ, 2 NICs, Domänenmitglied für KCD), **EXT-CL01** (externer Client).

### GUI
1. **WAP01**: Zertifikate `adfs.example.com` und `intranet.example.com` (inkl. privatem Schlüssel) in `certlm.msc` → Eigene Zertifikate importieren.
2. **WAP01**: Server-Manager → Rolle **Remotezugriff** → Rollendienst **Webanwendungsproxy** → Assistent **Webanwendungsproxy-Konfiguration** → Verbunddienstname `adfs.example.com` + Admin-Anmeldedaten von ADFS01 → Zertifikat `adfs.example.com`.
3. **ADFS01**: AD-FS-Verwaltung → **Vertrauensstellungen der vertrauenden Seite** → **Nicht anspruchsbasierte vertrauende Seite** (Non-claims-aware) → Name „Intranet“ → Bezeichner `https://intranet.example.com/`.
4. **DC01**: AD-Benutzer und -Computer → Computerkonto **WAP01** → Registerkarte **Delegierung** → „Computer bei Delegierung angegebener Dienste vertrauen“ → **Beliebiges Authentifizierungsprotokoll** → Dienst `HTTP/WEB01.example.com` hinzufügen.
5. **WAP01**: **Remotezugriffs-Verwaltungskonsole** → Webanwendungsproxy → **Veröffentlichen** → Vorauthentifizierung **Active Directory-Verbunddienste** → Typ **Web und MSOFBA** → vertrauende Seite „Intranet“ → externe URL `https://intranet.example.com/`, Zertifikat, Back-End-URL `https://web01.example.com/`, **SPN des Back-End-Servers** `HTTP/WEB01.example.com`.
6. **EXT-CL01**: Hosts-Datei/DNS: `intranet.example.com` und `adfs.example.com` → externe IP WAP01 → Browser `https://intranet.example.com` → AD-FS-Anmeldeseite → Anmeldung → Intranet erscheint.
7. Zweite App mit **Pass-Through** veröffentlichen (z. B. öffentliche Info-Seite) und Unterschied beobachten (keine Anmeldeseite).

### PowerShell
```powershell
# Auf WAP01 – Installation und Anbindung an AD FS
Install-WindowsFeature Web-Application-Proxy -IncludeManagementTools
$cred = Get-Credential EXAMPLE\Administrator
$thumbAdfs = (Get-ChildItem Cert:\LocalMachine\My | Where-Object Subject -like "*adfs.example.com*").Thumbprint
Install-WebApplicationProxy -FederationServiceName adfs.example.com -FederationServiceTrustCredential $cred -CertificateThumbprint $thumbAdfs

# Auf ADFS01 – nicht anspruchsbasierte vertrauende Seite
Add-AdfsNonClaimsAwareRelyingPartyTrust -Name "Intranet" -Identifier "https://intranet.example.com/" -IssuanceAuthorizationRules '=> issue(Type = "http://schemas.microsoft.com/authorization/claims/permit", Value = "true");'

# Auf DC01 – KCD für WAP01
Set-ADComputer WAP01 -Add @{'msDS-AllowedToDelegateTo'='HTTP/WEB01.example.com','HTTP/WEB01'}
Set-ADAccountControl WAP01$ -TrustedToAuthForDelegation $true

# Auf WAP01 – Anwendung mit AD-FS-Vorauthentifizierung (IWA-Backend)
$thumbApp = (Get-ChildItem Cert:\LocalMachine\My | Where-Object Subject -like "*intranet.example.com*").Thumbprint
Add-WebApplicationProxyApplication -Name "Intranet" -ExternalPreAuthentication ADFS -ADFSRelyingPartyName "Intranet" `
  -ExternalUrl "https://intranet.example.com/" -BackendServerUrl "https://web01.example.com/" `
  -ExternalCertificateThumbprint $thumbApp -BackendServerAuthenticationSPN "HTTP/WEB01.example.com" -EnableHTTPRedirect

# Auf WAP01 – Pass-Through-Anwendung
Add-WebApplicationProxyApplication -Name "Info" -ExternalPreAuthentication PassThrough `
  -ExternalUrl "https://info.example.com/" -BackendServerUrl "http://web01.example.com/info/" -ExternalCertificateThumbprint $thumbApp

Get-WebApplicationProxyApplication | Format-Table Name,ExternalUrl,BackendServerUrl,ExternalPreAuthentication
Get-WebApplicationProxyHealth
```

## Einfach

Der **Webanwendungsproxy** ist wie der **Empfang eines Bürogebäudes**. Besucher (Leute aus dem Internet) dürfen **nicht** direkt in die Büros (interne Webserver) laufen. Sie gehen zum **Empfang in der Lobby** (WAP in der DMZ), und der Empfang holt für sie, was sie brauchen.

**Zwei Arten**:
- **Pass-Through** = der Empfang lässt dich einfach durch zur Bürotür, und **dort** musst du dich ausweisen.
- **Vorauthentifizierung mit AD FS** = du musst dich **schon am Empfang** ausweisen. Ohne Ausweis kommst du **nicht mal in den Flur**. Angreifer erreichen den internen Server gar nicht erst.

**AD FS** ist dabei die **Ausweisstelle**: Sie prüft Benutzername und Kennwort gegen das Active Directory und stellt einen „Besucherausweis“ (Token) aus.

**Alte Windows-Anmeldung (Kerberos)**: Manche interne Seiten verstehen nur den Windows-Ausweis. Dann darf der Empfang **im Namen des Besuchers** einen Windows-Ausweis holen – das nennt man **eingeschränkte Delegierung (KCD)**. Dafür muss der WAP in der Domäne sein.

**Heute** gibt es auch einen Empfang **in der Cloud**: den **Entra-Anwendungsproxy**. Da muss man nicht mal eine Tür in der Firewall aufmachen.

## Merksatz
- WAP = **Reverse Proxy** in der **DMZ** + **AD-FS-Proxy**.
- WAP braucht **AD FS** (Konfiguration liegt in AD FS).
- **Pass-Through** = keine Anmeldung am WAP; **AD FS** = Anmeldung **vor** dem Backend.
- IWA-Backend → **KCD** → WAP **domänengebunden**.
- WAP und AD FS **nie auf demselben Server**.
- Nachfolger in der Cloud: **Entra-Anwendungsproxy** (ausgehender Connector).

## Prüfungsfalle
- Ohne AD FS lässt sich WAP nicht konfigurieren.
- KCD erfordert Domänenbeitritt und Delegierungseinstellung am WAP-Computerkonto.
- Für IWA-Apps ist eine nicht anspruchsbasierte vertrauende Seite in AD FS nötig.
- WAP übersetzt URLs nur in Headern, nicht im HTML-Body.
- Externe Clients müssen dem Zertifikat vertrauen (öffentliche CA).
- Exchange ActiveSync benötigt HTTP-Basic-Vorauthentifizierung.

## Grafik
### Empfang in der Lobby
Internet-Besucher → Glastür → Empfang (WAP) in der DMZ → Flur mit Büros (WEB01, SharePoint). Direkter Weg zu den Büros ist durch eine Wand versperrt.

### Zwei Wege
Links Pass-Through: Besucher geht durch, Ausweiskontrolle erst an der Bürotür. Rechts AD FS: Ausweisstelle am Empfang, ohne Stempel bleibt die Flurtür zu.

### Delegierung
Besucher mit AD-FS-Ausweis; Empfang holt beim Kerberos-Schalter (DC) einen Windows-Ausweis „im Namen von Max“ und öffnet damit das Büro WEB01.

## Karteikarten
- F: Was ist der Webanwendungsproxy? | A: Reverse Proxy (Rollendienst Remotezugriff), der interne Web-Apps extern veröffentlicht, plus AD-FS-Proxy.
- F: Welche Voraussetzung hat WAP zwingend? | A: AD FS im internen Netz.
- F: Zwei Vorauthentifizierungsarten? | A: Pass-Through und AD FS.
- F: Vorteil der AD-FS-Vorauthentifizierung? | A: Nur authentifizierter Verkehr erreicht das Backend.
- F: Was braucht WAP für Apps mit integrierter Windows-Authentifizierung? | A: Kerberos Constrained Delegation und Domänenbeitritt.
- F: Welche vertrauende Seite für IWA-Apps in AD FS? | A: Nicht anspruchsbasierte vertrauende Seite.
- F: Vorauthentifizierung für Exchange ActiveSync? | A: HTTP Basic.
- F: Wo speichert WAP seine Konfiguration? | A: In AD FS.
- F: Cmdlet zum Veröffentlichen einer App? | A: Add-WebApplicationProxyApplication
- F: Cloud-Alternative zum WAP? | A: Microsoft Entra-Anwendungsproxy.

## Quiz
? Unauthentifizierter Datenverkehr darf das interne Intranet nie erreichen. Welche Vorauthentifizierung?
* AD FS
- Pass-Through
- Anonym
- NTLM direkt am Backend

? Eine interne IIS-App nutzt nur Windows-Authentifizierung. Was ist für die Veröffentlichung per WAP nötig?
* Kerberos-eingeschränkte Delegierung für das WAP-Computerkonto
- DNSSEC für die Zone
- Pass-Through ohne weitere Einstellungen
- Ein zweiter AD-FS-Server auf dem WAP

? Was muss vor der Konfiguration des Webanwendungsproxys vorhanden sein?
* AD FS im internen Netz
- Microsoft Entra-Anwendungsproxy-Connector
- RRAS mit IKEv2
- NPS mit 802.1X

? Welche Aussage zu WAP und AD FS ist richtig?
* Sie dürfen nicht auf demselben Server installiert sein
- Sie müssen auf demselben Server liegen
- WAP ersetzt AD FS vollständig
- AD FS muss in der DMZ stehen

? Mobilgeräte synchronisieren E-Mails über Exchange ActiveSync durch den WAP. Welche Vorauthentifizierung?
* HTTP Basic
- MS-OFBA
- Pass-Through ist unmöglich
- OAuth2 für Store-Apps

? Wo wird der Webanwendungsproxy typischerweise platziert?
* In der DMZ zwischen Internet und internem Netz
- Auf dem Domänencontroller
- Im internen Clientnetz
- Auf jedem Client
! WAP-Server sind in der Regel keine Domänenmitglieder (außer für KCD).

? Welche Vorauthentifizierung leitet Anfragen ungeprüft an die interne Anwendung weiter?
* Passthrough
- AD FS
- OAuth2 mit MFA
- Clientzertifikat
! Die Anwendung muss die Authentifizierung dann selbst übernehmen.

? Was ist für die Veröffentlichung einer Anwendung mit Windows-Authentifizierung über WAP und AD FS nötig?
* Kerberos-eingeschränkte Delegierung (KCD) und Domänenmitgliedschaft des WAP-Servers
- Ein zweiter DHCP-Server
- Eine öffentliche Stubzone
- Deaktivieren von HTTPS
! Der WAP holt Kerberos-Tickets im Namen des Benutzers.
