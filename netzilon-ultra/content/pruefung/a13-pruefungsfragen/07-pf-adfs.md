---
id: pf-adfs
bereich: Prüfung
block: A13
kapitel: Prüfungsfragen AD FS (Verbunddienste)
titel: AD FS und Webanwendungsproxy
stufe: Fortgeschritten
typ: fragen
quellen: [Windows Server 2022 – AD FS und Webanwendungsproxy, 10 Fragen]
verweise: [az800-webanwendungsproxy]
---

## Quiz

? AD FS Frage 1: Wofür werden die Active Directory-Verbunddienste (AD FS) hauptsächlich eingesetzt?
* Für Single Sign-On und Identitätsföderation über Organisations- und Netzwerkgrenzen hinweg (anspruchsbasierte Authentifizierung)
- Für die Vergabe von IP-Adressen
- Für die Verwaltung von Druckern
- Für die Sicherung von Domänencontrollern
! AD FS stellt Sicherheitstoken mit Ansprüchen aus und ermöglicht Single Sign-On zu internen und externen Anwendungen.

? AD FS Frage 2: Mit welchem PowerShell-Befehl installieren Sie die AD FS-Rolle?
- Install-Module ADFS
* Install-WindowsFeature ADFS-Federation -IncludeManagementTools
- Add-WindowsCapability -Name ADFS
- Enable-ADFSRole
! Die Rolle wird per Install-WindowsFeature ADFS-Federation installiert; danach wird der Verbunddienst konfiguriert (Install-AdfsFarm).

? AD FS Frage 3: Welche Voraussetzung muss vor dem Einrichten einer AD FS-Farm erfüllt sein?
- Ein Exchange-Server
- Ein Domänencontroller mit Windows Server 2003
* Ein TLS/SSL-Zertifikat mit dem Namen des Verbunddienstes (z. B. sts.contoso.com) und ein passender DNS-Eintrag
- Ein DHCP-Bereich für den Verbunddienst
! Für den Verbunddienstnamen werden ein vertrauenswürdiges Zertifikat und DNS benötigt; empfohlen ist zudem ein gruppenverwaltetes Dienstkonto (gMSA).

? AD FS Frage 4: Was sind Ansprüche (Claims) in AD FS?
- IP-Adressen der Clients
- Berechtigungen auf Dateiservern
- Kennwörter der Benutzer
* Aussagen über einen Benutzer (z. B. Name, E-Mail, Gruppenmitgliedschaft), die im Sicherheitstoken enthalten sind und von Anwendungen ausgewertet werden
! Claims sind Attribute, die der Anspruchsanbieter in das Token schreibt.

? AD FS Frage 5: Was konfigurieren Sie in AD FS, damit einer Anwendung Tokens ausgestellt werden?
* Eine Vertrauensstellung der vertrauenden Seite (Relying Party Trust) für die Anwendung
- Eine DHCP-Reservierung
- Eine DNS-Weiterleitung
- Eine Organisationseinheit
! Die Relying Party Trust beschreibt die Anwendung, ihre Endpunkte und die Anspruchsregeln.

? AD FS Frage 6: Welche Protokolle unterstützt AD FS unter Windows Server 2022 unter anderem?
- Nur NTLM
* SAML 2.0, WS-Federation, OAuth 2.0 und OpenID Connect
- Nur Kerberos
- Nur RADIUS
! AD FS unterstützt SAML, WS-Federation sowie OAuth 2.0 und OpenID Connect für moderne Anwendungen.

? AD FS Frage 7: Welche Konfigurationsdatenbank verwendet AD FS standardmäßig?
- Die AD-Datenbank NTDS.dit
- Die Registry
* Die Windows Internal Database (WID); für große Farmen optional SQL Server
- Eine Textdatei im SYSVOL
! Standard ist die WID, die zwischen den Farmknoten repliziert wird; SQL Server ist für große Umgebungen möglich.

? AD FS Frage 8: Welche Aufgabe hat der Webanwendungsproxy (WAP)?
- Er repliziert die AD-Datenbank
- Er vergibt IP-Adressen
- Er löst DNS-Namen auf
* Er fungiert als Reverse-Proxy, veröffentlicht interne Webanwendungen und den AD FS-Dienst sicher für externe Clients (mit Vorauthentifizierung)
! Der WAP ist ein Rollendienst der Rolle Remotezugriff und wird typischerweise in der DMZ betrieben.

? AD FS Frage 9: Mit welchem Cmdlet konfigurieren Sie den Webanwendungsproxy nach der Installation?
- Install-AdfsFarm
* Install-WebApplicationProxy
- Add-WapServer
- Enable-WebProxy
! Install-WebApplicationProxy verbindet den WAP mit dem Verbunddienst (FederationServiceName, Zertifikat, Anmeldeinformationen).

? AD FS Frage 10: Worin unterscheidet sich die AD FS-Vorauthentifizierung von der Pass-Through-Vorauthentifizierung im WAP?
* Bei der AD FS-Vorauthentifizierung wird der Benutzer bereits am WAP über AD FS authentifiziert, bevor Datenverkehr an die Anwendung weitergeleitet wird; bei Pass-Through übernimmt die Anwendung die Authentifizierung
- Es gibt keinen Unterschied
- Pass-Through ist sicherer als AD FS-Vorauthentifizierung
- Die AD FS-Vorauthentifizierung funktioniert nur intern
! Mit Vorauthentifizierung gelangt nur authentifizierter Datenverkehr in das interne Netz.
