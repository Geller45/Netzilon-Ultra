---
id: pf-adds-szenarien-1
bereich: Prüfung
block: A13
kapitel: Prüfungsfragen AD DS (Active Directory-Domänendienste)
titel: AD DS – Szenarien – Teil 1/2
stufe: Fortgeschritten
typ: fragen
quellen: [Windows Server 2022 – AD DS, 30 Szenariofragen]
verweise: [az800-adds-dc, az801-ad-papierkorb, az801-dsrm-sysvol, az800-fsmo, az800-rodc]
---

## Quiz

? AD DS Szenario 1: Die Firma Contoso richtet erstmals Active Directory ein. Ein frisch installierter Windows Server 2022 (SRV01) ist bereits mit statischer IP konfiguriert und die Rolle AD DS ist installiert. Es existiert noch keine Domäne. Frage: Welchen Befehl führen Sie aus, um contoso.local anzulegen?
- Install-ADDSDomainController -DomainName contoso.local
* Install-ADDSForest -DomainName contoso.local
- Install-ADDSDomain -NewDomainName contoso.local
- New-ADDomain -Name contoso.local
! Für die erste Domäne einer neuen Gesamtstruktur wird Install-ADDSForest verwendet.

? AD DS Szenario 2: In der Domäne contoso.local gibt es nur den DC01. Der Geschäftsführer fordert Ausfallsicherheit für die Anmeldung. SRV02 ist Mitglied der Domäne. Frage: Wie gehen Sie vor?
- SRV02 aus der Domäne entfernen und eine neue Gesamtstruktur anlegen
- Nur die DNS-Rolle auf SRV02 installieren
* AD DS auf SRV02 installieren und mit Install-ADDSDomainController zum zusätzlichen DC heraufstufen
- Die Datei NTDS.dit manuell von DC01 nach SRV02 kopieren
! Ein zusätzlicher DC wird über Rolleninstallation und Install-ADDSDomainController hinzugefügt; die Datenbank wird per Replikation übertragen.

? AD DS Szenario 3: Nach der Heraufstufung von DC01 kann ein Windows 11-Client die Domäne contoso.local nicht finden. In den IP-Einstellungen des Clients ist als DNS-Server 8.8.8.8 eingetragen. Frage: Was ist die wahrscheinlichste Ursache und Lösung?
* Der Client benötigt die IP des DC als DNS-Server, weil nur dort die SRV-Einträge der Domäne liegen
- Der Client benötigt eine neuere Windows-Version
- Der DC muss zuerst neu gestartet werden, danach funktioniert jeder DNS-Server
- Die Domäne muss den Namen contoso.com tragen
! Domänenmitglieder müssen einen DNS-Server nutzen, der die AD-Zonen und SRV-Einträge kennt, in der Regel den DC.

? AD DS Szenario 4: Benutzer melden Anmeldeprobleme und Kerberos-Fehler. Eine Prüfung zeigt, dass die Uhr des Mitgliedsservers SRV03 zehn Minuten von der Domänenzeit abweicht. Frage: Warum schlägt die Anmeldung fehl, und wie beheben Sie es?
- NTLM ist deaktiviert; NTLM aktivieren
* Die Kerberos-Zeittoleranz von 5 Minuten ist überschritten; Zeit mit der Domäne synchronisieren (z. B. w32tm /resync)
- Das Kennwort ist abgelaufen; Kennwort zurücksetzen
- Der Globale Katalog ist nicht erreichbar; GC neu starten
! Kerberos toleriert standardmäßig nur 5 Minuten Abweichung. Die Domänenzeit kommt vom PDC-Emulator.

? AD DS Szenario 5: Ein Administrator hat versehentlich die OU "Vertrieb" mit 200 Benutzerkonten gelöscht. Der AD-Papierkorb war zuvor aktiviert. Frage: Wie stellen Sie die Objekte am einfachsten wieder her?
- Server neu installieren
- Benutzer einzeln neu anlegen und Kennwörter neu vergeben
* Gelöschte Objekte über den AD-Papierkorb mit Get-ADObject -IncludeDeletedObjects und Restore-ADObject wiederherstellen (zuerst die OU, dann der Inhalt)
- Die Datei SYSVOL zurückspielen
! Bei aktiviertem Papierkorb werden Objekte mit allen Attributen und Gruppenmitgliedschaften wiederhergestellt; die übergeordnete OU muss zuerst zurückkehren.

? AD DS Szenario 6: In einer Domäne ist der AD-Papierkorb nicht aktiviert. Ein Benutzerkonto samt Gruppenmitgliedschaften wurde gestern gelöscht. Es existiert eine Systemstatus-Sicherung von vorgestern. Frage: Welches Verfahren stellt das Objekt mit den ursprünglichen Attributen wieder her?
- Restore-ADObject ohne Sicherung
- Ein neues Konto mit gleichem Namen anlegen; die SID ist dann identisch
- gpupdate /force
* Autoritative Wiederherstellung aus der Sicherung im DSRM mit ntdsutil
! Ohne Papierkorb hilft die autoritative Wiederherstellung (DSRM, Systemstatus-Sicherung, ntdsutil), damit die Replikation das Objekt nicht wieder löscht.

? AD DS Szenario 7: Zwei Helpdesk-Mitarbeiter sollen in der OU "Vertrieb" Kennwörter zurücksetzen dürfen, aber keine anderen Änderungen vornehmen und keine Rechte in anderen OUs erhalten. Frage: Was ist die beste Lösung?
* Delegierung der Objektverwaltung auf die OU "Vertrieb" mit dem Recht "Kennwörter zurücksetzen" für eine Helpdesk-Gruppe
- Beide in die Gruppe Domänen-Admins aufnehmen
- Beide in die Gruppe Administratoren des DC aufnehmen
- Beiden das Kennwort des Administrators mitteilen
! Delegierung nach dem Prinzip der minimalen Rechte, idealerweise an eine Gruppe.

? AD DS Szenario 8: Der DC01 hält alle FSMO-Rollen. Er fällt durch einen irreparablen Festplattenschaden aus und wird nie wieder in Betrieb genommen. DC02 läuft. Frage: Wie bringen Sie die FSMO-Rollen wieder in einen funktionierenden Zustand?
- Rollen kontrolliert übertragen; DC01 muss dazu online sein
* Rollen auf DC02 mit -Force verschieben (Seizing) und die Metadaten von DC01 bereinigen
- Nichts tun, Rollen wandern automatisch
- Die Domäne löschen und neu aufbauen
! Bei dauerhaftem Ausfall werden Rollen per Seizing übernommen; danach Metadata Cleanup, und der alte DC darf nie wieder ans Netz.

? AD DS Szenario 9: DC01 hält alle FSMO-Rollen und soll planmäßig durch einen neuen DC03 ersetzt und außer Betrieb genommen werden. DC01 ist online und fehlerfrei. Frage: Was tun Sie vor der Herabstufung von DC01?
- DC01 einfach ausschalten und aus dem Rack entfernen
- Rollen mit -Force per Seizing nach DC03 verschieben
* Rollen mit Move-ADDirectoryServerOperationMasterRole geordnet nach DC03 übertragen, dann DC01 herabstufen (Uninstall-ADDSDomainController)
- Nur den DNS-Server von DC01 entfernen
! Bei planmäßiger Außerbetriebnahme werden die Rollen übertragen (Transfer), nicht übernommen.

? AD DS Szenario 10: Im Vertrieb (50 Personen) sollen die Berechtigungen auf einem Datei-Share vergeben werden. Mitarbeiter wechseln häufig die Abteilung, und der Aufwand für Änderungen soll gering bleiben. Frage: Welches Vorgehen entspricht der Best Practice?
* Benutzerkonten in globale Gruppen aufnehmen, globale Gruppen in domänenlokale Gruppen, Berechtigungen der domänenlokalen Gruppe erteilen (AGDLP)
- Jedem Benutzer direkt Berechtigungen auf den Share geben
- Alle Benutzer in die Gruppe Domänen-Admins aufnehmen
- Eine Verteilergruppe mit den Berechtigungen versehen
! AGDLP reduziert den Aufwand: Bei Wechseln wird nur die Gruppenmitgliedschaft angepasst.

? AD DS Szenario 11: Ein Server steht in einem Raum ohne ausreichenden physischen Schutz. Er soll lokale Anmeldungen ermöglichen, aber das Risiko eines Kennwort-Diebstahls minimieren. Frage: Welche AD-Lösung ist am besten geeignet?
- Ein zusätzlicher vollwertiger DC mit allen FSMO-Rollen
* Ein schreibgeschützter Domänencontroller (RODC) mit eingeschränkter Kennwortreplikation
- Ein Mitgliedsserver mit lokalem Administratorkonto
- Ein zweiter DNS-Server ohne AD
! Ein RODC speichert keine Kennwörter, sofern nicht per Richtlinie erlaubt, und nimmt keine Änderungen an.

? AD DS Szenario 12: Domäne: contoso.local. Die Benutzer sollen sich mit ihrer E-Mail-Adresse (z. B. anna@contoso.com) als UPN anmelden. Frage: Was konfigurieren Sie dafür?
- Die Domäne in contoso.com umbenennen
- Ein neues DNS-Forwarding einrichten
* Ein alternatives UPN-Suffix contoso.com in "Active Directory-Domänen und -Vertrauensstellungen" hinzufügen und den Benutzern zuweisen
- Den Globalen Katalog deaktivieren
! Zusätzliche UPN-Suffixe werden gesamtstrukturweit in domain.msc angelegt.

? AD DS Szenario 13: Ein neuer Client soll in die Domäne. Beim Beitritt erscheint: "Ein Active Directory-Domänencontroller für die Domäne konnte nicht kontaktiert werden." Die Netzwerkverbindung besteht. Frage: Was prüfen Sie zuerst?
- Die Bildschirmauflösung
- Den Druckerspooler
- Die Größe der Auslagerungsdatei
* Die DNS-Einstellungen des Clients und die Auflösung der SRV-Einträge (nslookup -type=SRV _ldap._tcp.dc._msdcs.contoso.local)
! Die DC-Suche läuft über DNS-SRV-Einträge; falsche DNS-Server sind die häufigste Ursache.

? AD DS Szenario 14: Ein DC war 200 Tage vom Netz getrennt (Lager). Er soll wieder ins Netzwerk. Die Tombstone-Lebensdauer beträgt den Standardwert. Frage: Was ist zu tun?
* Nicht ans Netz nehmen (Gefahr veralteter Objekte), Metadaten bereinigen und den Server neu heraufstufen
- Einfach anschließen, die Replikation regelt alles
- Nur den Zeitdienst neu starten
- gpupdate /force ausführen
! Die Standard-Tombstone-Lebensdauer beträgt 180 Tage; ein länger getrennter DC führt zu lingering objects und darf nicht replizieren.

? AD DS Szenario 15: Eine Gruppenrichtlinie ist mit der Domäne verknüpft. Computerkonten befinden sich noch im Standardcontainer "Computers". Auf eine neue GPO für diese Computer soll ein Skript laufen, doch sie wird nicht angewendet. Frage: Was ist die Ursache und Lösung?
- Der Client hat kein Kennwort; Kennwort neu setzen
* GPOs lassen sich nicht auf Standardcontainer verknüpfen; Computerkonten in eine OU verschieben und die GPO dort verknüpfen
- Das Skript ist zu groß
- Die GPO muss im Ordner NETLOGON liegen
! Auf die Container Users und Computers können keine GPOs verknüpft werden; Computer gehören in OUs (redircmp legt eine Standard-OU fest).
