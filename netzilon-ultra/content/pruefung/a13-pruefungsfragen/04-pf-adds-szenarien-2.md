---
id: pf-adds-szenarien-2
bereich: Prüfung
block: A13
kapitel: Prüfungsfragen AD DS (Active Directory-Domänendienste)
titel: AD DS – Szenarien – Teil 2/2
stufe: Fortgeschritten
typ: fragen
quellen: [Windows Server 2022 – AD DS, 30 Szenariofragen]
verweise: [az800-adds-dc, az801-ad-papierkorb, az801-dsrm-sysvol, az800-fsmo, az800-rodc]
---

## Quiz

? AD DS Szenario 16: Die Personalabteilung liefert eine CSV-Datei mit 500 neuen Mitarbeitern (Vorname, Nachname, Abteilung). Diese sollen als Benutzerkonten in AD angelegt werden. Frage: Wie automatisieren Sie das?
- Jedes Konto manuell im Snap-In anlegen
- Die CSV in SYSVOL kopieren
* Import-Csv mit einer Schleife und New-ADUser verwenden
- Die Konten über die Registry importieren
! Import-Csv liest die Datei, ForEach-Object ruft New-ADUser auf.

? AD DS Szenario 17: Für Administratoren soll eine Kennwortrichtlinie mit 16 Zeichen gelten, für alle anderen Benutzer nur 8 Zeichen. Es soll keine zweite Domäne angelegt werden. Frage: Welche Funktion nutzen Sie?
* Fein abgestufte Kennwortrichtlinie (PSO), zugewiesen an eine Sicherheitsgruppe
- Mehrere Default Domain Policies
- Ein zweiter Globaler Katalog
- Ein RODC für Administratoren
! Fine-Grained Password Policies (Password Settings Objects) erlauben unterschiedliche Kennwortrichtlinien innerhalb einer Domäne.

? AD DS Szenario 18: Die Abteilung Forschung möchte eigene Administratoren, verwaltet aber keine anderen Kennwortrichtlinien und benötigt keine eigene Sicherheitsgrenze. Der IT-Leiter erwägt eine neue Domäne research.contoso.local. Frage: Was empfehlen Sie?
- Immer eine neue Domäne, da eine OU keine Verwaltungsrechte delegieren kann
- Eine neue Gesamtstruktur für Forschung
- Eine zweite Domäne mit einem zusätzlichen Globalen Katalog
* Eine OU "Forschung" mit delegierter Verwaltung, da keine Domänengrenze erforderlich ist
! Eine Domäne ist nur bei abweichenden Domänenrichtlinien oder Replikationsanforderungen nötig; OU mit Delegierung ist einfacher.

? AD DS Szenario 19: Sie haben einen neuen DC02 heraufgestuft. Auf DC02 fehlen jedoch die Freigaben SYSVOL und NETLOGON, und Gruppenrichtlinien werden bei Anmeldungen über DC02 nicht angewendet. Frage: Wie gehen Sie zur Fehlersuche vor?
- Den Server neu benennen
- Die Benutzerkonten löschen
- Die FSMO-Rollen übertragen
* Mit dcdiag und repadmin /replsummary prüfen, die Ereignisprotokolle (DFS-Replikation) auswerten und den Status der SYSVOL-Replikation kontrollieren
! Fehlende SYSVOL/NETLOGON-Freigaben deuten auf eine unvollständige Initialreplikation hin; dcdiag, repadmin und das DFSR-Protokoll zeigen die Ursache.

? AD DS Szenario 20: In der Gesamtstruktur mit drei Domänen sind Anmeldungen und gesamtstrukturweite Suchen langsam. Nur ein DC ist als Globaler Katalog konfiguriert; er ist überlastet. Frage: Wie verbessern Sie die Situation?
* Weitere DCs als Globalen Katalog konfigurieren
- Den Globalen Katalog deaktivieren
- Alle Benutzer in eine OU verschieben
- Die Funktionsebene absenken
! Mehrere GC-Server erhöhen Verfügbarkeit und Leistung bei Anmeldungen (universelle Gruppen) und Suchen.

? AD DS Szenario 21: Ein Benutzer hat sich mehrfach mit falschem Kennwort angemeldet, und sein Konto ist gesperrt. Er benötigt sofort wieder Zugriff; sein Kennwort ist ansonsten korrekt. Frage: Wie entsperren Sie das Konto per PowerShell?
- Enable-ADAccount -Identity mmuster
* Unlock-ADAccount -Identity mmuster
- Set-ADUser -Identity mmuster -Enabled $false
- Restore-ADObject -Identity mmuster
! Ein gesperrtes Konto wird mit Unlock-ADAccount entsperrt; Enable-ADAccount betrifft nur deaktivierte Konten.

? AD DS Szenario 22: Sie setzen für die Benutzerin Anna ein neues Startkennwort. Sie soll es bei der nächsten Anmeldung selbst ändern müssen. Frage: Wie erreichen Sie das?
- Das Konto deaktivieren
- Das Konto in die Gruppe Domänen-Admins aufnehmen
* Die Option "Benutzer muss Kennwort bei der nächsten Anmeldung ändern" aktivieren (Set-ADUser -ChangePasswordAtLogon $true)
- Das Kennwort auf "läuft nie ab" setzen
! Die Option erzwingt die Kennwortänderung bei der nächsten Anmeldung.

? AD DS Szenario 23: Ein Mitarbeiter verlässt die Firma. Seine Postfach- und Dateidaten werden noch benötigt, und die Konto-SID muss für Berechtigungsanalysen erhalten bleiben. Er soll sich nicht mehr anmelden können. Frage: Was ist das empfohlene Vorgehen?
* Konto deaktivieren (Disable-ADAccount), Gruppenmitgliedschaften prüfen und in eine OU "Deaktiviert" verschieben
- Konto sofort löschen
- Konto unverändert lassen und das Kennwort raten lassen
- Die Domäne neu aufsetzen
! Deaktivieren erhält das Objekt samt SID und verhindert Anmeldungen; Löschen kann später erfolgen.

? AD DS Szenario 24: Ein Administrator möchte das Schema erweitern (neues Attribut). Der Vorgang scheitert mit "Zugriff verweigert", obwohl er Mitglied der Domänen-Admins ist. Frage: Was ist die Ursache?
- Der Domänencontroller ist nicht im Netzwerk
- Der Globale Katalog fehlt
- Die Domänenfunktionsebene ist zu hoch
* Für Schemaänderungen ist die Mitgliedschaft in der Gruppe Schema-Admins erforderlich, und die Änderung muss am Schemamaster erfolgen
! Schemaänderungen erfordern Schema-Admins-Rechte und werden über den Schemamaster ausgeführt.

? AD DS Szenario 25: Ein virtualisierter Domänencontroller (Hyper-V) wird nach einem fehlerhaften Update aus einer alten Momentaufnahme (Snapshot) zurückgesetzt. Sie befürchten Replikationsprobleme (USN-Rollback). Frage: Welche Technik schützt Windows Server 2022 dabei?
- Der Papierkorb
* Die VM-Generation-ID, die der DC nach dem Zurücksetzen erkennt und sich sicher verhält (neue Invocation-ID, Neuabgleich von SYSVOL)
- Das Protokoll DHCP
- Die Gruppenrichtlinie Standarddomänenrichtlinie
! Bei Hypervisor-Unterstützung erkennt der DC die geänderte VM-Generation-ID und schützt vor USN-Rollback. Snapshots sind dennoch keine Sicherung.

? AD DS Szenario 26: Die Domäne läuft auf der Funktionsebene Windows Server 2012 R2. Alle DCs sind Windows Server 2019/2022, ein alter DC (2012 R2) ist noch vorhanden. Sie möchten auf Windows Server 2016 anheben. Frage: Was ist die Voraussetzung?
- Alle Clients müssen Windows 11 nutzen
- Die Gesamtstruktur muss neu erstellt werden
* Alle DCs der Domäne müssen mindestens Windows Server 2016 sein; den alten DC vorher herabstufen und entfernen
- Der Globale Katalog muss deaktiviert sein
! Die Funktionsebene kann nur angehoben werden, wenn alle DCs der Domäne das erforderliche Betriebssystem haben.

? AD DS Szenario 27: Eine Gruppenrichtlinie mit Sicherheitsvorgaben ist mit der Domäne verknüpft. Der Administrator der OU "Labor" hat dort "Vererbung deaktivieren" gesetzt, wodurch die Richtlinie dort nicht gilt. Sie soll aber überall gelten. Frage: Wie stellen Sie das sicher?
- Die OU löschen
- Die GPO in SYSVOL umbenennen
- gpupdate /force auf jedem Client ausführen
* Den Domänenlink der GPO auf "Erzwungen" (Enforced) setzen
! Erzwungene Verknüpfungen werden trotz blockierter Vererbung angewendet.

? AD DS Szenario 28: Ein Benutzer meldet, dass sein Konto morgens wiederholt gesperrt wird. Sie möchten herausfinden, von welchem Computer die Sperrung ausgeht. Frage: Wo suchen Sie zuerst?
* Im Sicherheitsprotokoll des PDC-Emulators nach Ereignis-ID 4740 (Kontosperrung) mit dem Quellcomputer
- Im Druckerprotokoll
- Im Ordner NETLOGON
- In der Registry des Clients unter HKLM\Software
! Kontosperrungen werden vom PDC-Emulator verwaltet; Ereignis 4740 nennt das sperrende Gerät.

? AD DS Szenario 29: Ein DC wurde ohne Herabstufung ausgeschaltet und die virtuelle Festplatte gelöscht. In der Konsole "Active Directory-Benutzer und -Computer" und in DNS erscheint er weiterhin, und Replikationsfehler treten auf. Frage: Wie bereinigen Sie die Umgebung?
- Den Server neu installieren, dasselbe Namensschema verwenden
- Nur DNS neu starten
* Die Metadaten des DC bereinigen (Objekt in ADUC löschen oder ntdsutil "metadata cleanup") und veraltete DNS-Einträge entfernen
- Alle Benutzerkonten neu anlegen
! Verwaiste DC-Objekte und DNS-Einträge müssen manuell bereinigt werden.

? AD DS Szenario 30: Ein Domänen-Notebook meldet: "Die Vertrauensstellung zwischen dieser Arbeitsstation und der primären Domäne konnte nicht hergestellt werden." Lokal am Notebook können Sie sich mit einem lokalen Administrator anmelden. Frage: Wie reparieren Sie das Problem, ohne den Computer aus der Domäne zu nehmen?
- Notebook neu aufsetzen
* Test-ComputerSecureChannel -Repair -Credential (Domänenadmin) ausführen
- Den Domänennamen ändern
- Die GPO Default Domain Policy löschen
! Der sichere Kanal des Computerkontos wird mit Test-ComputerSecureChannel -Repair oder Reset-ComputerMachinePassword wiederhergestellt.
