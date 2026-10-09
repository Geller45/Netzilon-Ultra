---
id: erg-ad-gpo-praxis
bereich: AP1
block: ERG
kapitel: Ergänzungen 2.2
titel: Active Directory und Gruppenrichtlinien in der Praxis – OU-Design, AGDLP, LSDOU und Fehlersuche
stufe: Fortgeschritten
fach: Windows Server / AZ-800
pruefungen: [AP1, AP2, Schule]
quellen: [Microsoft Learn – AD DS Design und Group Policy Processing, Microsoft Learn – Active Directory-Sicherheitsgruppen, Schulunterlagen Gruppenrichtlinien]
verweise: [ap1-a6-adds, ap1-a6-gruppen, ap1-a6-gpo-grundlagen, ap1-a6-gpo-bereich, server-gpo-uebungen, server-ad-gruppen, az800-gpo, erg-dns-dhcp-betrieb]
---

## Profi

### Logische Struktur
- **Gesamtstruktur (Forest)** – Sicherheitsgrenze, gemeinsames Schema und globaler Katalog.
- **Domäne** – Verwaltungs- und Replikationseinheit, z. B. example.com.
- **Organisationseinheit (OU)** – Container zum **Strukturieren**, **Delegieren** von Verwaltungsrechten und **Verknüpfen von GPOs**. Standardcontainer wie „Users“ und „Computers“ sind **keine OUs** – dort lassen sich keine GPOs verknüpfen.
- Typisches **OU-Design**: nach Standort oder Abteilung, getrennte OUs für **Benutzer**, **Computer**, **Server**, **Gruppen**, **Admin-Konten**. Ziel: GPOs und Delegierung sauber zuordnen, nicht das Organigramm 1:1 abbilden.

### Gruppen nach AGDLP
| Gruppenbereich | Mitglieder aus | Verwendung |
|---|---|---|
| **Global** | Konten der eigenen Domäne | Benutzer nach Rolle/Abteilung bündeln (G) |
| **Domänenlokal** | aus allen Domänen der Gesamtstruktur und vertrauten Domänen | Berechtigungen auf Ressourcen der eigenen Domäne (DL) |
| **Universal** | aus allen Domänen der Gesamtstruktur | gesamtstrukturweit, im globalen Katalog gespeichert |
**AGDLP**: **A**ccounts → **G**lobale Gruppe → **D**omänen**l**okale Gruppe → **P**ermissions. Beispiel: Benutzer *anna* → *G-Vertrieb* → *DL-Vertrieb-Ordner-Ändern* → NTFS-Recht „Ändern“ auf `\\FS01\Vertrieb`. Vorteil: Neue Mitarbeiter nur in eine Rollengruppe aufnehmen; Rechte bleiben übersichtlich. **Sicherheitsgruppen** erhalten Rechte, **Verteilergruppen** dienen nur E-Mail-Verteilern.

### Gruppenrichtlinien (GPO)
Ein GPO besteht aus dem **Gruppenrichtliniencontainer** (im AD) und der **Gruppenrichtlinienvorlage** (Dateien in **SYSVOL**). Es hat **Computerkonfiguration** (wirkt beim Start auf Computerobjekte) und **Benutzerkonfiguration** (wirkt bei der Anmeldung auf Benutzerobjekte), jeweils **Richtlinien** (erzwungen, ausgegraut) und **Einstellungen/Preferences** (vorbelegt, Benutzer kann ändern).

**Verarbeitungsreihenfolge LSDOU**: **L**okal → **S**tandort → **D**omäne → **O**U (übergeordnete vor untergeordneter). Bei Konflikten gewinnt das **zuletzt angewendete** GPO, also das der OU, die dem Objekt am nächsten ist. Ausnahmen:
- **Erzwungen (Enforced)** – GPO kann von unten nicht überschrieben werden und gewinnt.
- **Vererbung deaktivieren** auf einer OU – übergeordnete GPOs wirken nicht (außer erzwungene).
- **Sicherheitsfilterung** (Gruppe benötigt „Lesen“ und „Gruppenrichtlinie übernehmen“) und **WMI-Filter**.
- **Loopbackverarbeitung** (Ersetzen/Zusammenführen) – Benutzereinstellungen abhängig vom Computer (Terminalserver, Kiosk).
- **Kennwortrichtlinie** der Domäne wirkt nur aus einem GPO auf **Domänenebene** (Default Domain Policy); abweichende Richtlinien über **FGPP**.

Aktualisierung: Clients alle **90 Minuten ± 30 Minuten Zufall**, DCs alle 5 Minuten; sofort mit `gpupdate /force`. Manche Einstellungen (Softwareinstallation, Ordnerumleitung) wirken erst nach Neustart bzw. Neuanmeldung.

### Fehlersuche
`gpresult /r` bzw. `gpresult /h bericht.html` (RSoP – resultierender Satz von Richtlinien), **Gruppenrichtlinienmodellierung** und **-ergebnisse** in der GPMC, Ereignisanzeige → Anwendungen und Dienste → Microsoft → Windows → GroupPolicy → Operational. Typische Ursachen: Objekt liegt in der falschen OU (z. B. noch in „Computers“), Einstellung in der falschen Konfigurationshälfte, Sicherheitsfilterung, Replikation von SYSVOL, DNS-Problem am Client.

## Einfach
Active Directory ist wie das **Verzeichnis einer großen Schule**: Darin stehen alle Schüler (Benutzer), alle Computer, alle Klassen (Gruppen) und alle Räume.

Die Schule ist in **Stockwerke und Flure** eingeteilt – das sind die **OUs**. Im Flur „Verwaltung“ hängen andere Regeln als im Flur „Werkstatt“. An jeden Flur kannst du ein **Regelplakat** hängen – das ist eine **Gruppenrichtlinie**. Darauf steht zum Beispiel: „Bildschirmschoner nach 10 Minuten“ oder „USB-Sticks verboten“.

Die Regeln werden in einer festen Reihenfolge gelesen: zuerst die Regeln **am eigenen PC**, dann die für den **Standort**, dann die für die **ganze Schule** (Domäne), dann die für den **Flur** (OU). Was zuletzt gelesen wird, gewinnt – also die Regel des eigenen Flurs. Nur wenn die Schulleitung eine Regel als **„erzwungen“** markiert, kann kein Flur sie überschreiben.

Bei den **Gruppen** gibt es einen Trick, damit man nicht jedem Schüler einzeln einen Schlüssel geben muss: Alle Schüler einer Klasse kommen in die Gruppe „Klasse 7b“ (**global**). Die Gruppe „Klasse 7b“ kommt in die Gruppe „Darf in den Chemieraum“ (**domänenlokal**). Und nur diese Gruppe bekommt den Schlüssel (**Berechtigung**). Kommt ein neuer Schüler, steckt man ihn nur in „Klasse 7b“ – fertig. Das ist **AGDLP**.

## Merksatz
- **AGDLP: Account – Global – Domänenlokal – Permission.**
- **LSDOU: Lokal – Standort – Domäne – OU; der Letzte gewinnt.**
- **Erzwungen schlägt alles, Vererbung deaktivieren blockiert (außer erzwungen).**
- **Users/Computers sind Container, keine OUs.**
- **gpresult /r zeigt, was wirklich wirkt.**

## Prüfungsfalle
- GPOs lassen sich **nicht** an die Standardcontainer „Users“ und „Computers“ verknüpfen.
- Eine **Benutzereinstellung** in einem GPO, das nur auf eine **Computer-OU** wirkt, greift nicht (außer mit Loopback).
- Die **Domänen-Kennwortrichtlinie** wird an einer OU **nicht** wirksam – dafür FGPP.
- Bei LSDOU gewinnt **nicht** die Domäne, sondern die **OU** (außer erzwungen).
- Berechtigungen **direkt an Benutzer** zu vergeben, widerspricht AGDLP und ist schwer zu pflegen.

## Grafik
### GPO-Verarbeitung LSDOU
1. Computer: Startet und meldet sich am DC
2. Lokal: Lokale Richtlinie wird angewendet
3. Standort: GPOs des AD-Standorts
4. Domäne: Default Domain Policy und weitere Domänen-GPOs
5. OU: GPOs der übergeordneten OU, dann der eigenen OU
6. Computer: Konflikte – zuletzt angewendet gewinnt, Erzwungen hat Vorrang

### AGDLP
1. Admin -> G-Vertrieb: Benutzer anna aufnehmen
2. Admin -> DL-Vertrieb-Ändern: G-Vertrieb aufnehmen
3. Admin -> Ordner Vertrieb: DL-Vertrieb-Ändern erhält NTFS „Ändern“
4. anna -> Ordner Vertrieb: Zugriff über die Gruppenkette

## Lab
**Maschinen**: Domänencontroller **DC01** (Windows Server 2025, example.com), Dateiserver **FS01**, Client **CL01** (Windows 11 Pro).

### GUI
1. **DC01**: „Active Directory-Benutzer und -Computer“ → OU **Firma** → Unter-OUs **Benutzer**, **Computer**, **Gruppen** anlegen.
2. **DC01**: Globale Gruppe **G-Vertrieb** und domänenlokale Gruppe **DL-Vertrieb-Aendern** anlegen; G-Vertrieb Mitglied von DL-Vertrieb-Aendern.
3. **FS01**: Ordner D:\Vertrieb → Eigenschaften → Sicherheit → DL-Vertrieb-Aendern „Ändern“.
4. **DC01**: Gruppenrichtlinienverwaltung → GPO **C-Bildschirmsperre** erstellen und mit OU Firma/Computer verknüpfen → Computerkonfiguration → Richtlinien → Windows-Einstellungen → Sicherheitseinstellungen → Lokale Richtlinien → Sicherheitsoptionen → „Interaktive Anmeldung: Inaktivitätsgrenze des Computers“ = 600 Sekunden.
5. **CL01**: Computerkonto in OU Firma/Computer verschieben, `gpupdate /force`, `gpresult /r` prüfen.

### PowerShell
```powershell
# DC01
New-ADOrganizationalUnit -Name 'Firma' -Path 'DC=example,DC=com'
New-ADOrganizationalUnit -Name 'Computer' -Path 'OU=Firma,DC=example,DC=com'
New-ADGroup -Name 'G-Vertrieb' -GroupScope Global -GroupCategory Security -Path 'OU=Firma,DC=example,DC=com'
New-ADGroup -Name 'DL-Vertrieb-Aendern' -GroupScope DomainLocal -GroupCategory Security -Path 'OU=Firma,DC=example,DC=com'
Add-ADGroupMember -Identity 'DL-Vertrieb-Aendern' -Members 'G-Vertrieb'
New-GPO -Name 'C-Bildschirmsperre' | New-GPLink -Target 'OU=Computer,OU=Firma,DC=example,DC=com'
Get-ADComputer CL01 | Move-ADObject -TargetPath 'OU=Computer,OU=Firma,DC=example,DC=com'

# CL01
gpupdate /force
gpresult /r /scope computer
```

## Legende
### Organisationseinheit (OU)
- Was: AD-Container zur Strukturierung von Objekten.
- Wie: In ADUC oder per New-ADOrganizationalUnit anlegen; Objekte verschieben.
- Wann: Wenn Objekte unterschiedliche GPOs oder getrennte Verwaltung (Delegierung) brauchen.
- Wo: Innerhalb einer Domäne, beliebig verschachtelbar.
- Warum: GPO-Verknüpfung und Delegierung sind an OUs gebunden, nicht an Standardcontainer.

### LSDOU
- Was: Verarbeitungsreihenfolge der Gruppenrichtlinien.
- Wie: Lokal, Standort, Domäne, OU – später angewendete Einstellungen überschreiben frühere.
- Wann: Bei Computerstart (Computerkonfiguration) und Benutzeranmeldung (Benutzerkonfiguration) sowie zyklisch.
- Wo: Auf jedem Domänenmitglied.
- Warum: Allgemeine Regeln oben, spezielle Regeln nah am Objekt.

## Karteikarten
- F: Wofür steht AGDLP? | A: Accounts in globale Gruppen, globale Gruppen in domänenlokale Gruppen, domänenlokale Gruppen erhalten die Permissions.
- F: Welche Mitglieder kann eine globale Gruppe haben? | A: Benutzer, Computer und globale Gruppen der eigenen Domäne.
- F: Wofür werden domänenlokale Gruppen verwendet? | A: Für Berechtigungen auf Ressourcen in der eigenen Domäne; Mitglieder können aus allen vertrauten Domänen kommen.
- F: Wie lautet die GPO-Verarbeitungsreihenfolge? | A: LSDOU – Lokal, Standort, Domäne, OU.
- F: Welches GPO gewinnt bei Konflikten ohne Sonderoptionen? | A: Das zuletzt angewendete, also das der OU, die dem Objekt am nächsten ist.
- F: Was bewirkt „Erzwungen“ an einer GPO-Verknüpfung? | A: Das GPO kann von untergeordneten GPOs nicht überschrieben und durch Vererbungsblockierung nicht blockiert werden.
- F: Warum kann man an den Container „Computers“ kein GPO verknüpfen? | A: Er ist ein Standardcontainer und keine OU.
- F: Wie oft aktualisieren Clients ihre Gruppenrichtlinien? | A: Alle 90 Minuten mit zufälligem Versatz bis 30 Minuten (DCs alle 5 Minuten).
- F: Wo liegen die Dateien eines GPO? | A: In der Gruppenrichtlinienvorlage im SYSVOL-Ordner der DCs.
- F: Wozu dient die Loopbackverarbeitung? | A: Benutzereinstellungen werden abhängig vom Computer angewendet (Ersetzen oder Zusammenführen), z. B. auf Terminalservern.

## Quiz
? In welcher Reihenfolge werden Gruppenrichtlinien verarbeitet?
* Lokal, Standort, Domäne, OU
- Domäne, Standort, OU, Lokal
- OU, Domäne, Standort, Lokal
- Standort, Lokal, OU, Domäne
! LSDOU – die OU wird zuletzt angewendet.

? Ein GPO auf Domänenebene und eines auf der OU widersprechen sich. Keines ist erzwungen. Was gilt?
* Die Einstellung des OU-GPOs
- Die Einstellung des Domänen-GPOs
- Keine von beiden
- Die alphabetisch erste
! Das zuletzt verarbeitete GPO gewinnt.

? Welche Gruppe erhält nach AGDLP die NTFS-Berechtigung?
* Die domänenlokale Gruppe
- Die globale Gruppe
- Der einzelne Benutzer
- Die Verteilergruppe
! Benutzer → global → domänenlokal → Berechtigung.

? An welches Objekt kann KEIN GPO verknüpft werden?
* Den Standardcontainer „Users“
- Eine OU
- Die Domäne
- Einen AD-Standort
! Standardcontainer sind keine OUs.

? Welcher Befehl zeigt die tatsächlich angewendeten GPOs auf einem Client?
* gpresult /r
- gpupdate /force
- dcdiag
- repadmin /syncall
! gpupdate aktualisiert nur, gpresult zeigt das Ergebnis (RSoP).

? Wie verhindert man, dass untergeordnete OUs eine Sicherheitsrichtlinie der Domäne überschreiben?
* Verknüpfung auf Domänenebene erzwingen
- Vererbung auf der OU deaktivieren
- GPO umbenennen
- WMI-Filter entfernen
! Erzwungen hat Vorrang vor allen untergeordneten GPOs.

? Welche Gruppenart eignet sich nur für E-Mail-Verteiler?
* Verteilergruppe
- Sicherheitsgruppe
- Domänenlokale Sicherheitsgruppe
- Universale Sicherheitsgruppe
! Verteilergruppen haben keine SID für Berechtigungen.

? Ein Benutzer-GPO ist mit einer OU verknüpft, die nur Computerkonten enthält. Was passiert?
* Die Benutzereinstellungen wirken nicht (ohne Loopback).
- Sie wirken auf alle Benutzer der Domäne.
- Sie wirken auf den Administrator.
- Der Client meldet einen Fehler und startet neu.
! Benutzerkonfiguration wirkt auf Benutzerobjekte im Gültigkeitsbereich.

? Wo gilt die Kennwortrichtlinie für Domänenkonten?
* Nur aus einem GPO auf Domänenebene (bzw. per FGPP)
- In jedem OU-GPO individuell
- Nur in der lokalen Richtlinie
- Im Standort-GPO
! Abweichende Kennwortrichtlinien für Gruppen werden mit Fine-Grained Password Policies umgesetzt.

## Lücken
- Die GPO-Verarbeitungsreihenfolge lautet {LSDOU}.
- Nach AGDLP kommen Benutzer zuerst in eine {globale} Gruppe.
- Mit {gpresult} prüft man die tatsächlich wirksamen Richtlinien.
- Eine als {erzwungen|Enforced} markierte Verknüpfung kann nicht überschrieben werden.
- GPO-Dateien werden im Ordner {SYSVOL} repliziert.

## Zuordnen
### Gruppenbereich und Einsatz
- Global => Benutzer einer Rolle/Abteilung bündeln
- Domänenlokal => Berechtigungen auf Ressourcen vergeben
- Universal => gesamtstrukturweite Gruppierung, im globalen Katalog
- Verteilergruppe => nur E-Mail-Verteiler

### GPO-Option und Wirkung
- Erzwungen => kann nicht überschrieben oder blockiert werden
- Vererbung deaktivieren => übergeordnete GPOs wirken nicht (außer erzwungen)
- Sicherheitsfilterung => GPO wirkt nur für bestimmte Gruppen
- Loopback => Benutzereinstellungen abhängig vom Computer

### AD-Begriff und Bedeutung
- Gesamtstruktur => Sicherheitsgrenze mit gemeinsamem Schema
- Domäne => Verwaltungs- und Replikationseinheit
- OU => Container für GPO-Verknüpfung und Delegierung
- Globaler Katalog => Teilkopie aller Objekte der Gesamtstruktur

## Reihenfolge
### GPO verarbeiten (LSDOU)
1. Lokale Gruppenrichtlinie
2. Standort-GPOs
3. Domänen-GPOs
4. GPOs der übergeordneten OU
5. GPOs der OU des Objekts

### Ordnerberechtigung nach AGDLP einrichten
1. Benutzer in die globale Rollengruppe aufnehmen
2. Domänenlokale Ressourcengruppe anlegen
3. Globale Gruppe in die domänenlokale Gruppe aufnehmen
4. NTFS- und Freigabeberechtigung an die domänenlokale Gruppe vergeben
5. Zugriff mit effektiven Berechtigungen prüfen

### GPO wirkt nicht – Fehlersuche
1. Mit gpresult /r prüfen, ob das GPO angewendet oder gefiltert wurde
2. OU des Benutzer- bzw. Computerobjekts prüfen
3. Computer- vs. Benutzerkonfiguration prüfen
4. Sicherheitsfilterung und WMI-Filter prüfen
5. Ereignisprotokoll GroupPolicy und DNS/SYSVOL-Replikation prüfen

## Freitext
- F: Erläutern Sie das AGDLP-Prinzip an einem Beispiel und nennen Sie zwei Vorteile. | M: Benutzer → G-Buchhaltung → DL-Buchhaltung-Lesen → NTFS-Leserecht auf den Ordner. Vorteile: Rechte zentral über Rollengruppen, neue Mitarbeiter nur einer Gruppe hinzufügen, übersichtliche Dokumentation, domänenübergreifend nutzbar. | P: 5
- F: Erklären Sie die Verarbeitungsreihenfolge von GPOs und die Wirkung von „Erzwungen“ und „Vererbung deaktivieren“. | M: LSDOU; späteres GPO überschreibt früheres. Vererbung deaktivieren an einer OU blockiert übergeordnete GPOs; Erzwungen setzt sich trotzdem durch und kann nicht überschrieben werden. | P: 5
- F: Ein Kollege möchte für die OU „Azubis“ eine kürzere Mindestkennwortlänge per GPO einstellen. Bewerten Sie den Vorschlag. | M: Wirkt nicht: Kennwortrichtlinien für Domänenkonten nur auf Domänenebene. Lösung: Fine-Grained Password Policy (Kennworteinstellungsobjekt) für eine Gruppe; zudem sicherheitlich fragwürdig, Kennwörter zu verkürzen. | P: 4

## Szenario
### USB-Sperre greift nicht
Die Gruppenrichtlinie „Wechseldatenträger: Alle Zugriffe verweigern“ (Computerkonfiguration) wurde mit der OU „Vertrieb-Benutzer“ verknüpft. Die Vertriebs-PCs liegen im Container „Computers“.
- F: Warum wirkt die Sperre nicht? | A: Computereinstellung wirkt nur auf Computerobjekte im Gültigkeitsbereich; die PCs liegen nicht in der OU und „Computers“ ist kein verknüpfbarer Container. | P: 3
- F: Wie beheben Sie das? | A: PCs in eine OU „Vertrieb-Computer“ verschieben und das GPO dort verknüpfen (ggf. redircmp für neue Computer), gpupdate /force, gpresult prüfen. | P: 3

### Neuer Mitarbeiter braucht Zugriff
Ben fängt im Einkauf an und braucht Zugriff auf `\\FS01\Einkauf`. Bisher wurden Rechte direkt an Benutzer vergeben.
- F: Wie setzen Sie das nach AGDLP um? | A: Ben in G-Einkauf; G-Einkauf in DL-Einkauf-Ändern; DL-Gruppe erhält NTFS-/Freigaberecht. | P: 3
- F: Was muss Ben nach der Gruppenaufnahme tun? | A: Neu anmelden, damit das Kerberos-Ticket die neue Gruppenmitgliedschaft enthält. | P: 1

### Hintergrundbild der Domäne wird überschrieben
Die Domäne setzt per GPO ein Firmen-Hintergrundbild. Die OU „Marketing“ hat ein eigenes GPO mit anderem Bild. Die Geschäftsleitung will, dass überall das Firmenbild gilt.
- F: Welches Bild sehen Marketing-Benutzer derzeit und warum? | A: Das Marketing-Bild – das OU-GPO wird nach dem Domänen-GPO angewendet. | P: 2
- F: Wie setzen Sie die Vorgabe durch? | A: Verknüpfung des Domänen-GPOs auf „Erzwungen“ setzen (oder OU-Einstellung entfernen). | P: 2
