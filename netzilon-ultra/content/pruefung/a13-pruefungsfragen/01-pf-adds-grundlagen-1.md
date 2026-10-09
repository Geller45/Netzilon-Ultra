---
id: pf-adds-grundlagen-1
bereich: Prüfung
block: A13
kapitel: Prüfungsfragen AD DS (Active Directory-Domänendienste)
titel: AD DS – Grundlagen – Teil 1/2
stufe: Fortgeschritten
typ: fragen
quellen: [Windows Server 2022 – AD DS, 50 Prüfungsfragen]
verweise: [az800-adds-dc, ap1-a6-adds, az800-fsmo, az801-ad-replikation]
---

## Quiz

? AD DS Frage 1: Was ist die Hauptaufgabe der Active Directory-Domänendienste (AD DS)?
- Bereitstellung von Dateifreigaben
* Zentrale Verwaltung von Identitäten, Authentifizierung und Autorisierung
- Automatische Vergabe von IP-Adressen
- Hosting von Webanwendungen
! AD DS ist der Verzeichnisdienst für Identitäten, Authentifizierung und Autorisierung.

? AD DS Frage 2: Welches Protokoll wird in einer AD-Domäne standardmäßig zur Authentifizierung verwendet?
- NTLMv1
- RADIUS
* Kerberos
- SMTP
! Kerberos ist das Standardprotokoll; NTLM dient nur als Fallback.

? AD DS Frage 3: Welcher Port wird standardmäßig für unverschlüsseltes LDAP verwendet?
- 88
* 389
- 636
- 3389
! LDAP nutzt Port 389, LDAPS Port 636, Kerberos Port 88.

? AD DS Frage 4: Welcher Port wird für unverschlüsselte Abfragen am Globalen Katalog verwendet?
* 3268
- 3269
- 445
- 53
! Globaler Katalog: 3268 (unverschlüsselt), 3269 (SSL).

? AD DS Frage 5: Wie heißt die Datenbankdatei des Active Directory auf einem Domänencontroller?
- SAM.db
- AD.mdb
* NTDS.dit
- SYSVOL.dat
! Die AD-Datenbank ist NTDS.dit (Standard: C:\Windows\NTDS).

? AD DS Frage 6: Was wird im Ordner SYSVOL gespeichert und zwischen Domänencontrollern repliziert?
- Die Active Directory-Datenbank
* Gruppenrichtlinienvorlagen und Anmeldeskripte
- Benutzerprofile
- DNS-Zonendateien
! SYSVOL enthält GPO-Vorlagen und Skripte (Freigaben SYSVOL und NETLOGON).

? AD DS Frage 7: Mit welchem PowerShell-Befehl installieren Sie die AD DS-Rolle samt Verwaltungstools?
- Add-WindowsCapability -Name AD-DS
- Install-Module ActiveDirectory
* Install-WindowsFeature AD-Domain-Services -IncludeManagementTools
- Enable-ADDSRole
! Install-WindowsFeature AD-Domain-Services -IncludeManagementTools.

? AD DS Frage 8: Welche Voraussetzung sollte vor der Heraufstufung eines Servers zum Domänencontroller erfüllt sein?
- Der Server erhält seine IP-Adresse per DHCP
* Der Server hat eine statische IP-Adresse und einen eindeutigen Computernamen
- Auf dem Server ist Exchange installiert
- Der Server ist Mitglied einer Arbeitsgruppe mit dem Namen der künftigen Domäne
! Ein DC braucht eine statische IP-Adresse und einen festen Computernamen.

? AD DS Frage 9: Mit welchem Cmdlet erstellen Sie eine neue Active Directory-Gesamtstruktur?
- Install-ADDSDomain
* Install-ADDSForest
- New-ADForest
- Install-ADDSDomainController
! Install-ADDSForest erstellt Gesamtstruktur und erste Domäne.

? AD DS Frage 10: Mit welchem Cmdlet fügen Sie einen weiteren Domänencontroller zu einer vorhandenen Domäne hinzu?
- Install-ADDSForest
- Add-ADDomainController
* Install-ADDSDomainController
- New-ADDomainController
! Install-ADDSDomainController fügt einen DC zu einer bestehenden Domäne hinzu.

? AD DS Frage 11: Mit welchem Cmdlet erstellen Sie eine neue untergeordnete Domäne in einer bestehenden Gesamtstruktur?
* Install-ADDSDomain
- Install-ADDSForest
- New-ADDomain
- Add-ADDomain
! Install-ADDSDomain erstellt eine untergeordnete oder neue Baumdomäne.

? AD DS Frage 12: Wofür wird das DSRM-Kennwort (Verzeichnisdienste-Wiederherstellungsmodus) benötigt?
- Für die Anmeldung des Domänen-Administrators am Client
* Für den Offline-Start des DC im Wiederherstellungsmodus
- Für die Replikation zwischen DCs
- Für den Betrieb des DNS-Servers
! DSRM ist der Offline-Wiederherstellungsmodus mit eigenem lokalem Kennwort.

? AD DS Frage 13: Welches ist die höchste Domänen- und Gesamtstruktur-Funktionsebene unter Windows Server 2022?
- Windows Server 2012 R2
- Windows Server 2019
* Windows Server 2016
- Windows Server 2022
! Windows Server 2022 hat keine neue Funktionsebene; die höchste ist Windows Server 2016. (Hinweis: Windows Server 2025 bringt eine zusätzliche, neuere Funktionsebene.)

? AD DS Frage 14: Mit welchem Cmdlet heben Sie die Domänenfunktionsebene an?
* Set-ADDomainMode
- Set-ADFunctionLevel
- Update-ADDomain
- Raise-ADDomain
! Set-ADDomainMode (bzw. Set-ADForestMode für die Gesamtstruktur).

? AD DS Frage 15: Was stellt in Active Directory die Sicherheitsgrenze dar?
- Die Organisationseinheit
- Die Domäne
* Die Gesamtstruktur
- Der Domänencontroller
! Die Gesamtstruktur ist die Sicherheitsgrenze, die Domäne die Verwaltungsgrenze.

? AD DS Frage 16: Welche Aussage zur Domäne trifft zu?
* Sie ist die Grenze für die Replikation der Domänenpartition
- Sie ist die Grenze des Schemas
- Sie enthält immer genau einen DC
- Sie ist identisch mit einem IP-Subnetz
! Die Domänenpartition wird nur innerhalb der Domäne repliziert.

? AD DS Frage 17: Was ist eine Domänenstruktur (Tree)?
* Mehrere Domänen mit zusammenhängendem DNS-Namespace
- Mehrere Domänen ohne Vertrauensstellung
- Die Hierarchie von OUs innerhalb einer Domäne
- Die Struktur der Gruppenrichtlinien
! Ein Tree hat einen zusammenhängenden DNS-Namespace, z. B. contoso.com und de.contoso.com.

? AD DS Frage 18: Welche Verzeichnispartitionen werden auf alle DCs der gesamten Gesamtstruktur repliziert?
- Domänen- und Konfigurationspartition
* Schema- und Konfigurationspartition
- Nur die Schemapartition
- Nur die Domänenpartition
! Schema- und Konfigurationspartition gibt es gesamtstrukturweit auf allen DCs.

? AD DS Frage 19: Welche Aufgabe hat der Globale Katalog (GC)?
- Er speichert Kennwörter im Klartext
* Er enthält eine Teilmenge der Attribute aller Objekte der Gesamtstruktur für gesamtstrukturweite Suchen und die Anmeldung
- Er verteilt IP-Adressen
- Er speichert nur Gruppenrichtlinien
! Der GC enthält eine Attribut-Teilmenge aller Objekte und wertet z. B. universelle Gruppen bei der Anmeldung aus.

? AD DS Frage 20: Wie viele Domänencontroller sollten pro Domäne in einer Produktivumgebung mindestens vorhanden sein?
- Einer
* Zwei
- Drei
- Fünf
! Mindestens zwei DCs für Ausfallsicherheit.

? AD DS Frage 21: Was bedeutet Multimaster-Replikation?
- Nur ein DC darf Änderungen annehmen
* Änderungen können auf jedem schreibbaren DC erfolgen und werden auf die anderen repliziert
- Alle DCs sind schreibgeschützt
- Änderungen werden nur manuell kopiert
! Jeder schreibbare DC nimmt Änderungen an und repliziert sie.

? AD DS Frage 22: Was kennzeichnet einen schreibgeschützten Domänencontroller (RODC)?
* Er hält eine schreibgeschützte Kopie der AD-Datenbank und speichert standardmäßig keine Kennwörter
- Er verwaltet alle FSMO-Rollen
- Er kann Schemaänderungen durchführen
- Er ersetzt den DNS-Server
! Ein RODC hat schreibgeschützte Daten; Kennwörter werden nur nach Richtlinie zwischengespeichert.

? AD DS Frage 23: Was beschreibt der Distinguished Name (DN) eines Objekts?
- Den Netzwerkpfad zu einer Freigabe
* Den eindeutigen Pfad des Objekts im Verzeichnis, z. B. CN=Max Muster,OU=Vertrieb,DC=contoso,DC=com
- Den Anmeldenamen im Format user@domain
- Die SID des Objekts
! Der DN ist der eindeutige Verzeichnispfad des Objekts.

? AD DS Frage 24: Welches Snap-In dient der Verwaltung von Benutzern, Gruppen und Computern (dsa.msc)?
- Active Directory-Standorte und -Dienste
* Active Directory-Benutzer und -Computer
- DNS-Manager
- Geräte-Manager
! dsa.msc: Active Directory-Benutzer und -Computer.

? AD DS Frage 25: Mit welchem Snap-In fügen Sie zusätzliche UPN-Suffixe für die Gesamtstruktur hinzu?
* Active Directory-Domänen und -Vertrauensstellungen
- Active Directory-Benutzer und -Computer
- Gruppenrichtlinienverwaltung
- Serverbereitstellung
! UPN-Suffixe verwalten Sie in domain.msc (Domänen und Vertrauensstellungen).
