---
id: pf-adds-grundlagen-2
bereich: Prüfung
block: A13
kapitel: Prüfungsfragen AD DS (Active Directory-Domänendienste)
titel: AD DS – Grundlagen – Teil 2/2
stufe: Fortgeschritten
typ: fragen
quellen: [Windows Server 2022 – AD DS, 50 Prüfungsfragen]
verweise: [az800-adds-dc, ap1-a6-adds, az800-fsmo, az801-ad-replikation]
---

## Quiz

? AD DS Frage 26: Worin unterscheidet sich eine Organisationseinheit (OU) von einem Standardcontainer wie "Users"?
* Auf eine OU können Gruppenrichtlinien verknüpft und Verwaltungsaufgaben delegiert werden
- OUs können nur Computerkonten enthalten
- Standardcontainer sind schneller
- Es gibt keinen Unterschied
! Nur auf OUs lassen sich GPOs verknüpfen und Rechte delegieren.

? AD DS Frage 27: Mit welchem Cmdlet erstellen Sie ein neues Benutzerkonto?
- Add-ADUser
- Create-ADUser
- New-LocalUser
* New-ADUser
! New-ADUser legt Benutzerkonten an.

? AD DS Frage 28: Welche Gruppenbereiche (Scopes) gibt es in Active Directory?
- Lokal, Remote, Global
* Domänenlokal, Global, Universal
- Privat, Öffentlich, Universal
- Benutzer, Computer, Gerät
! Domänenlokal, Global und Universal.

? AD DS Frage 29: Wofür steht die Empfehlung AGDLP?
* Konten in globale Gruppen, diese in domänenlokale Gruppen, dort Berechtigungen vergeben
- Administratoren, Gruppen, Domänen, Lizenzen, Profile
- Konten direkt in Dateiberechtigungen eintragen
- Universelle Gruppen in lokale Benutzer
! Account, Global, Domain Local, Permission.

? AD DS Frage 30: Was unterscheidet Sicherheitsgruppen von Verteilergruppen?
- Verteilergruppen können Berechtigungen erhalten
* Sicherheitsgruppen können für Berechtigungen verwendet werden, Verteilergruppen nicht
- Sicherheitsgruppen können keine Mitglieder enthalten
- Es gibt keinen Unterschied
! Nur Sicherheitsgruppen erhalten Berechtigungen; Verteilergruppen dienen z. B. dem E-Mail-Versand.

? AD DS Frage 31: Mit welchem Cmdlet nimmt ein Client-Computer per PowerShell an einer Domäne teil?
- Join-ADDomain
* Add-Computer -DomainName
- New-ADComputer -Join
- Set-ADDomain
! Add-Computer -DomainName contoso.com -Credential ...

? AD DS Frage 32: Wie schützen Sie eine OU vor versehentlichem Löschen?
* Durch die Option "Vor zufälligem Löschen schützen"
- Durch Umbenennen der OU
- Durch Verschieben in den Container Users
- Durch Deaktivieren der OU
! Der Schutz vor versehentlichem Löschen verhindert das Löschen und Verschieben ohne Aufhebung.

? AD DS Frage 33: Wofür nutzen Sie den Assistenten "Objektverwaltung zuweisen" (Delegierung)?
- Zum Installieren neuer DCs
* Um bestimmten Benutzern oder Gruppen begrenzte Verwaltungsrechte auf eine OU zu geben, z. B. Kennwörter zurücksetzen
- Zum Anheben der Funktionsebene
- Zum Sichern der Datenbank
! Die Delegierung gibt gezielt begrenzte Rechte, z. B. Kennwortzurücksetzung.

? AD DS Frage 34: Was gilt für den Active Directory-Papierkorb?
- Er ist standardmäßig aktiv und lässt sich deaktivieren
* Er muss aktiviert werden (Enable-ADOptionalFeature) und kann danach nicht mehr deaktiviert werden
- Er speichert nur Computerkonten
- Er steht nur unter Windows Server 2003 zur Verfügung
! Aktivierung mit Enable-ADOptionalFeature; danach nicht mehr rückgängig zu machen.

? AD DS Frage 35: Wie viele FSMO-Rollen (Betriebsmaster) gibt es insgesamt?
- Drei
- Vier
* Fünf
- Sieben
! Fünf Rollen: Schemamaster, Domänennamenmaster, PDC-Emulator, RID-Master, Infrastrukturmaster.

? AD DS Frage 36: Welche FSMO-Rollen existieren genau einmal pro Gesamtstruktur?
- PDC-Emulator und RID-Master
* Schemamaster und Domänennamenmaster
- Infrastrukturmaster und RID-Master
- Alle fünf Rollen
! Schemamaster und Domänennamenmaster gibt es einmal pro Gesamtstruktur, die anderen drei je Domäne.

? AD DS Frage 37: Welche Aufgabe hat der PDC-Emulator?
* Zeitsynchronisierung in der Domäne, Kennwortänderungen und Kontosperrungen
- Verwaltung des Schemas
- Aufnahme neuer Domänen
- Vergabe von IP-Adressen
! Der PDC-Emulator ist Zeitquelle und bevorzugter DC bei Kennwortänderungen und Sperrungen.

? AD DS Frage 38: Wofür ist der RID-Master zuständig?
- Er verwaltet DNS-Zonen
* Er weist den DCs Pools relativer Bezeichner (RIDs) zur Erstellung von SIDs zu
- Er repliziert SYSVOL
- Er authentifiziert Benutzer
! Der RID-Master vergibt RID-Pools für eindeutige SIDs.

? AD DS Frage 39: Was ist die Aufgabe des Infrastrukturmasters?
* Er aktualisiert Verweise auf Objekte aus anderen Domänen (Gruppenmitgliedschaften)
- Er erstellt Gruppenrichtlinien
- Er verwaltet den Papierkorb
- Er ist für Kerberos-Tickets zuständig
! Er pflegt Verweise auf Objekte anderer Domänen; er sollte nicht auf einem GC liegen, außer alle DCs sind GC.

? AD DS Frage 40: Mit welchem Befehl zeigen Sie an, welche DCs die FSMO-Rollen halten?
* netdom query fsmo
- ipconfig /fsmo
- nslookup fsmo
- gpresult /fsmo
! netdom query fsmo (alternativ Get-ADDomain / Get-ADForest).

? AD DS Frage 41: Mit welchem Cmdlet übertragen Sie FSMO-Rollen kontrolliert auf einen anderen DC?
* Move-ADDirectoryServerOperationMasterRole
- Set-ADFSMO
- Transfer-ADRole
- Copy-ADDomainController
! Move-ADDirectoryServerOperationMasterRole überträgt Rollen geordnet.

? AD DS Frage 42: Wann verwenden Sie das Verschieben (Seizing) einer FSMO-Rolle mit -Force?
- Bei jeder planmäßigen Wartung
* Wenn der bisherige Rolleninhaber dauerhaft ausgefallen ist und nicht wiederkehrt
- Beim Anlegen eines Benutzers
- Beim Installieren von Updates
! Seizing nur bei dauerhaftem Ausfall; der alte DC darf nie wieder ans Netz.

? AD DS Frage 43: Welche DNS-Zonenart wird für AD empfohlen?
- Primäre Standardzone
- Sekundäre Zone
* Active Directory-integrierte Zone
- Stubzone
! AD-integrierte Zonen werden per AD repliziert und erlauben sichere dynamische Updates.

? AD DS Frage 44: Wofür verwendet AD die DNS-SRV-Einträge (z. B. in _msdcs)?
* Zum Auffinden von Diensten wie Domänencontrollern, Kerberos und LDAP
- Zur Namensauflösung von Druckern
- Zur Vergabe von IP-Adressen
- Zur Verschlüsselung von Kennwörtern
! SRV-Einträge lokalisieren DCs, Kerberos-, LDAP- und GC-Dienste.

? AD DS Frage 45: Wie groß ist die Standard-Zeittoleranz, ab der Kerberos-Authentifizierung fehlschlägt?
- 30 Sekunden
* 5 Minuten
- 30 Minuten
- 1 Stunde
! Standardmäßig 5 Minuten Abweichung; die Zeit wird vom PDC-Emulator abgeleitet.

? AD DS Frage 46: Mit welchem Befehl prüfen Sie den Replikationsstatus aller DCs übersichtlich?
* repadmin /replsummary
- ping -r
- gpupdate /repl
- netstat -ad
! repadmin /replsummary fasst den Replikationsstatus zusammen.

? AD DS Frage 47: Welches Werkzeug prüft die allgemeine Integrität eines Domänencontrollers?
- chkdsk
- sfc /scannow
* dcdiag
- msinfo32
! dcdiag führt Integritäts- und Funktionstests des DCs durch.

? AD DS Frage 48: In welcher Reihenfolge werden Gruppenrichtlinien angewendet?
* Lokal, Standort, Domäne, OU
- Domäne, Lokal, OU, Standort
- OU, Domäne, Standort, Lokal
- Standort, OU, Domäne, Lokal
! LSDOU: Lokal, Standort, Domäne, OU; die zuletzt angewendete Richtlinie gewinnt.

? AD DS Frage 49: Wie erzwingen Sie die sofortige Anwendung von Gruppenrichtlinien auf einem Client?
* gpupdate /force
- gpresult /reset
- net use /gpo
- secedit /stop
! gpupdate /force wendet Richtlinien sofort neu an.

? AD DS Frage 50: Wie sichern Sie die Active Directory-Datenbank eines DCs korrekt?
- Kopieren der Datei NTDS.dit im laufenden Betrieb
* Sicherung des Systemstatus mit Windows Server Backup
- Export der Benutzerliste als CSV
- Sicherung nur des Ordners SYSVOL
! Der Systemstatus (inkl. NTDS.dit, SYSVOL, Registry) wird mit Windows Server Backup gesichert.
