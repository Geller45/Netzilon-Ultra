---
id: server-ad-ds-ueberblick
bereich: AZ-800
pruefungen: [Schule, AP2]
fach: Windows Server / Adv.
block: S2
kapitel: Active Directory
titel: Active Directory Domain Services – Überblick und Komponenten
stufe: Profi
quellen: [Überblick ADDS.pdf]
verweise: [server-trusts-uebungen, server-ad-gruppen]
---

## Profi

### Logische Komponenten
| Komponente | Bedeutung |
|---|---|
| **Partitionen** (Verzeichnispartitionen) | Schema, Konfiguration, Domäne (+ Anwendungspartitionen, z. B. DNS) |
| **Schema** | Definition aller Objektklassen und Attribute, gesamtstrukturweit **einmalig** |
| **Domäne** | Verwaltungs- und Replikationsgrenze, Sicherheitsgrenze für Richtlinien |
| **Struktur** (*Tree*) | Domänen mit zusammenhängendem DNS-Namensraum |
| **Gesamtstruktur** (*Forest*) | Sammlung von Strukturen mit gemeinsamem Schema, Konfiguration und GC; **Sicherheitsgrenze** |
| **Organisationseinheit (OU)** | Container zur Gliederung, Delegierung und GPO-Verknüpfung |
| **Objekte** | Benutzer, Computer, Gruppen, Drucker, Freigaben, Kontakte |

### Physische Komponenten
- **Domänencontroller (DC)**: Server mit AD-DS-Rolle. Datenbank **ntds.dit**, Freigabe **SYSVOL** (GPOs, Skripte), Dienst **KDC** (Kerberos).
- **Standort** (*Site*) = Gruppe gut verbundener IP-Subnetze, steuert Replikation und Anmeldung.
- **Globaler Katalog (GC)**: Teilreplikat aller Domänen der Gesamtstruktur, nötig für Anmeldung (UPN, universale Gruppen) und Suche.
- **Schreibgeschützter DC (RODC)**: Kopie ohne Schreibzugriff, für Filialen mit niedriger physischer Sicherheit; Kennwörter nur nach Richtlinie zwischengespeichert.

### Kerberos-Anmeldung (Kurzform)
1. Client sendet **AS-REQ** an KDC (Zeitstempel, mit Kennwort-Hash verschlüsselt).
2. KDC antwortet mit **TGT** (Ticket Granting Ticket).
3. Für einen Dienst legt der Client das TGT vor (**TGS-REQ**).
4. KDC liefert das **Dienstticket** (TGS).
5. Client präsentiert das Dienstticket dem Server (**AP-REQ**). Zeitdifferenz zwischen Client und KDC darf standardmäßig **max. 5 Minuten** betragen.

### Namensauflösung: SRV-Records
DCs registrieren in DNS u. a. `_ldap._tcp.dc._msdcs.<Domäne>` und `_kerberos._tcp.<Domäne>`. Ohne korrektes DNS findet kein Client einen DC.

### Die fünf FSMO-Rollen
| Rolle | Anzahl | Aufgabe |
|---|---|---|
| **Schemamaster** | je Gesamtstruktur | Schemaänderungen |
| **Domänennamenmaster** | je Gesamtstruktur | Domänen anlegen/entfernen |
| **RID-Master** | je Domäne | Vergabe von RID-Pools für SIDs |
| **PDC-Emulator** | je Domäne | Zeitsynchronisation, Kennwortänderungen, Sperrungen, GPO-Bearbeitung |
| **Infrastrukturmaster** | je Domäne | Auflösung domänenübergreifender Referenzen |

## Einfach

Stell dir eine **Stadt** vor. AD ist das **Einwohnermeldeamt** der Firma: Es weiß, wer wohnt (Benutzer), welche Geräte angemeldet sind (Computer) und wer wo hinein darf (Rechte).

- **Gesamtstruktur** = die ganze Stadt mit gemeinsamen Gesetzen (Schema).
- **Domäne** = ein Stadtteil mit eigenem Bezirksamt.
- **OU** = Straßen und Häuser, in denen man Leute sortiert. Der Bezirksbürgermeister kann einer Straße einen Hausmeister zuteilen (Delegierung).
- **Domänencontroller** = die Mitarbeiter im Amt, die Ausweise prüfen. Es gibt mehrere, damit der Betrieb weiterläuft, wenn einer krank ist. Alle haben dieselbe Kartei (ntds.dit) und gleichen sich ab (Replikation).
- **Globaler Katalog** = das Telefonbuch der ganzen Stadt – es kennt von jedem Einwohner die wichtigsten Daten, nicht jedes Detail.
- **RODC** = Außenstelle mit Kopie der Kartei, aber ohne Stempelbefugnis; wird sie gestohlen, ist der Schaden gering.

**Kerberos** ist wie ein Freizeitpark: An der Kasse (KDC) zeigst du deinen Ausweis und bekommst ein **Tagesbändchen** (TGT). Damit holst du an jedem Fahrgeschäft eine **Fahrkarte** (Dienstticket). Dein Passwort musst du nicht mehr zeigen. Die Uhren müssen stimmen, denn Tickets sind zeitlich begrenzt: Weichen sie mehr als 5 Minuten ab, wird die Fahrkarte abgelehnt.

**DNS ist das Navi**: Der Client fragt DNS nach den DCs (SRV-Records). Ohne Navi findet er das Amt nicht.

**FSMO-Rollen** sind Aufgaben, die nur **eine** Person gleichzeitig machen darf, damit kein Chaos entsteht: Der Schemamaster ändert das Gesetzbuch, der Domänennamenmaster eröffnet neue Stadtteile, der RID-Master verteilt Nummernblöcke für Ausweisnummern, der PDC-Emulator ist Uhrmacher und Notfall-Passwortstelle, der Infrastrukturmaster pflegt Verweise zwischen den Stadtteilen.

**Warum ist das wichtig?** Fast alle Windows-Dienste (Dateiserver, Exchange, Anmeldung) hängen von AD ab. Fällt AD aus, geht nichts mehr – daher mindestens zwei DCs, funktionierendes DNS und regelmäßige Sicherung (System State).

## Merksatz
- **Gesamtstruktur = Sicherheitsgrenze, Domäne = Verwaltungs-/Replikationsgrenze.**
- **5 FSMO**: 2 je Forest (Schema, Domänennamen), 3 je Domäne (RID, PDC, Infrastruktur).
- **Kerberos**: AS → TGT → TGS → Dienst; max. 5 Minuten Zeitabweichung.
- **Ohne DNS kein AD.**

## Prüfungsfalle
- Der **PDC-Emulator** existiert auch in modernen Domänen und ist die Zeitquelle – ohne PDC-Emulator keine saubere Zeit.
- Der **globale Katalog** ist keine FSMO-Rolle.
- Der **Infrastrukturmaster** darf nicht auf einem GC liegen, **außer** alle DCs der Domäne sind GCs (oder es gibt nur eine Domäne).
- Die **OU ist keine Sicherheitsgrenze**, nur Verwaltungs- und GPO-Container.
- Die **Domäne** ist **nicht** die Sicherheitsgrenze – das ist die Gesamtstruktur.

## Grafik
### Kerberos-Anmeldung
1. Client -> KDC: AS-REQ mit Zeitstempel
2. KDC -> Client: TGT
3. Client -> KDC: TGS-REQ mit TGT für Dateiserver
4. KDC -> Client: Dienstticket
5. Client -> Dateiserver: Dienstticket vorlegen
6. Dateiserver: Zugriff nach Prüfung der Berechtigung

## Lab
Domäne **example.com**, Server **EXA-DC01**.

### GUI
1. EXA-DC01: Server-Manager → Tools → **Active Directory-Standorte und -Dienste** – Standort „Default-First-Site-Name“ ansehen.
2. **Active Directory-Domänen und -Vertrauensstellungen** → Rechtsklick Stamm → **Betriebsmaster** (RID, PDC, Infrastruktur).
3. **DNS-Manager** → Forward-Lookupzonen → example.com → _msdcs → _tcp: SRV-Einträge ansehen.

### PowerShell
```powershell
# EXA-DC01
Get-ADForest | Format-List Name,SchemaMaster,DomainNamingMaster,GlobalCatalogs
Get-ADDomain | Format-List Name,RIDMaster,PDCEmulator,InfrastructureMaster
netdom query fsmo
Get-ADDomainController -Filter * | Format-Table Name,Site,IsGlobalCatalog,IsReadOnly
nslookup -type=SRV _ldap._tcp.dc._msdcs.example.com
w32tm /query /status
```

## Befehle
- `Get-ADForest` – Forest-Infos, Schema- und Namensmaster
- `Get-ADDomain` – Domäneninfos, RID-, PDC-, Infrastrukturmaster
- `netdom query fsmo` – alle FSMO-Inhaber
- `Move-ADDirectoryServerOperationMasterRole` – FSMO-Rolle übertragen
- `Get-ADDomainController -Filter *` – alle DCs
- `dcdiag` – DC-Gesundheitscheck
- `repadmin /replsummary` – Replikationsübersicht
- `klist` – Kerberos-Tickets anzeigen

## Übungen
- A: Welche FSMO-Rollen gibt es je Gesamtstruktur? | L: Schemamaster und Domänennamenmaster.
- A: Ein neuer Benutzer kann nicht angelegt werden, weil keine SIDs mehr verfügbar sind. Welche Rolle ist betroffen? | L: RID-Master (RID-Pool leer, Master nicht erreichbar).
- A: Anmeldungen schlagen fehl, Client-Zeit weicht 10 Minuten ab. Warum? | L: Kerberos toleriert nur 5 Minuten Abweichung.
- A: Wo liegt die AD-Datenbank und wo die GPOs? | L: ntds.dit und SYSVOL auf jedem DC.
- A: Wann setzt man einen RODC ein? | L: In Filialen mit geringer physischer Sicherheit und schlechter WAN-Anbindung.

## Karteikarten
- F: Was ist ntds.dit? | A: Die AD-Datenbank auf jedem DC
- F: Was liegt in SYSVOL? | A: GPOs und Anmeldeskripte, repliziert auf alle DCs
- F: Sicherheitsgrenze in AD? | A: Die Gesamtstruktur
- F: Was ist der globale Katalog? | A: Teilreplikat aller Domänen der Gesamtstruktur für Suche und Anmeldung
- F: Was ist ein RODC? | A: Schreibgeschützter Domänencontroller für Filialen
- F: Welche Rollen gelten je Gesamtstruktur? | A: Schemamaster, Domänennamenmaster
- F: Welche Rollen gelten je Domäne? | A: RID-Master, PDC-Emulator, Infrastrukturmaster
- F: Was ist das TGT? | A: Ticket Granting Ticket, vom KDC nach der Anmeldung ausgestellt
- F: Maximale Zeitabweichung bei Kerberos? | A: 5 Minuten
- F: Wichtiger SRV-Record für DC-Suche? | A: _ldap._tcp.dc._msdcs.<Domäne>

## Quiz
? Was ist die Sicherheitsgrenze in AD?
* Die Gesamtstruktur
- Die OU
- Der Standort
- Der Computer

? Welche Rolle verteilt RID-Pools?
* RID-Master
- PDC-Emulator
- Schemamaster
- Infrastrukturmaster

? Wie viele FSMO-Rollen gibt es?
* Fünf
- Drei
- Sieben
- Zehn

? Wo liegt die AD-Datenbank?
* ntds.dit
- sam.hiv
- sysvol.dit
- adds.mdf

? Welche Zeitabweichung toleriert Kerberos standardmäßig?
* 5 Minuten
- 30 Sekunden
- 1 Stunde
- Keine

? Wofür wird ein RODC eingesetzt?
* Filialen mit geringer physischer Sicherheit
- Zum Ändern des Schemas
- Als Ersatz für DNS
- Als reiner Dateiserver

? Welche Informationen kennt der globale Katalog?
* Teilmenge der Attribute aller Objekte der Gesamtstruktur
- Nur Benutzer der eigenen OU
- Nur Kennwörter
- Nur Gruppenrichtlinien

? Was liefert der KDC nach erfolgreicher Anmeldung zuerst?
* Ein TGT
- Ein Zertifikat
- Eine IP-Adresse
- Eine GPO
