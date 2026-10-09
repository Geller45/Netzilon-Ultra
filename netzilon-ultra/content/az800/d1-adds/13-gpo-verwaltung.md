---
id: az800-gpo
bereich: AZ-800
block: A7
kapitel: AD DS on-premises & Cloud
titel: Gruppenrichtlinien verwalten – Sichern, Migrieren, Delegieren
stufe: Profi
quellen: [Identitätsmanagement_mit_Windows_Server_2016_70-742.pdf, AZ-800 Study Guide]
verweise: [ap1-a6-gpo-grundlagen, ap1-a6-gpo-bereich, az800-gpo-preferences, az800-gpo-entra-ds, az801-baselines]
---

## Profi

### Lebenszyklus eines GPOs
Planen → **Erstellen** (ggf. aus **Starter-GPO**) → Bearbeiten → Testen (Test-OU, Modellierung) → **Verknüpfen** → Überwachen (RSoP) → **Sichern** → Ändern/Versionieren → Entfernen. In größeren Umgebungen: **Änderungsprozess** und Werkzeuge wie **AGPM** (Advanced Group Policy Management, Teil von MDOP – Check-in/Check-out, Freigabe-Workflow; Support ausgelaufen) bzw. Versionierung per Skript/Git.

### Sichern und Wiederherstellen
- **Sichern**: GPMC → Gruppenrichtlinienobjekte → Rechtsklick → **Alle sichern** bzw. einzelnes GPO → **Sichern** → Ordner + Beschreibung. Gesichert werden **Einstellungen, Sicherheitsfilterung, Delegierung, WMI-Filter-Verknüpfung** – **nicht** die **Verknüpfungen (Links)** zu OUs/Domäne! (Links sind Eigenschaften der OU, nicht des GPOs.)
- **Wiederherstellen**: **Sicherungen verwalten** → GPO wählen → Wiederherstellen – stellt das GPO **mit derselben GUID** wieder her (gleiche Domäne). Links müssen ggf. neu gesetzt werden.
- **Importieren** (`Import-GPO`): Einstellungen einer Sicherung **in ein vorhandenes (neues) GPO** übernehmen – auch in **andere Domänen/Gesamtstrukturen** (Test → Produktion). Überschreibt die Einstellungen des Ziel-GPOs.
- **Kopieren** (GPMC: Rechtsklick → Kopieren/Einfügen): innerhalb der Domäne oder zwischen vertrauenden Domänen; neue GUID.
- **Migrationstabellen** (`.migtable`): Beim Import/Kopieren in eine **andere Domäne** werden domänenspezifische Werte (Sicherheitsprinzipale wie `CONTOSO\GG-HR`, UNC-Pfade wie `\\srv01\...`) **auf Zielwerte umgeschrieben**. Erstellt mit dem **Migrationstabellen-Editor** (GPMC → Rechtsklick Domäne → „Migrationstabellen-Editor öffnen“).
- **Standard-GPOs zurücksetzen**: `dcgpofix` stellt **Default Domain Policy** und **Default Domain Controllers Policy** auf den Auslieferungszustand zurück (`/target:Domain|DC|Both`) – Notfallwerkzeug, alle Anpassungen gehen verloren.

### Starter-GPOs
Vorlagen, die **nur Administrative Vorlagen** (registrierungsbasierte Einstellungen) und Kommentare enthalten. Aus einem Starter-GPO erzeugte GPOs übernehmen dessen Einstellungen. Liegen im Ordner **StarterGPOs** im SYSVOL (einmalig „Ordner für Starter-GPOs erstellen“). Können als **.cab** exportiert/importiert werden (Austausch zwischen Domänen, Vorlagen von Dritten).

### Delegierung der GPO-Verwaltung
| Aufgabe | Wo delegieren | Standard |
|---|---|---|
| **GPOs erstellen** | GPMC → Container **Gruppenrichtlinienobjekte** → Registerkarte Delegierung, oder Gruppe **Gruppenrichtlinien-Ersteller-Besitzer** | Domänen-Admins, Organisations-Admins, GP-Ersteller-Besitzer, SYSTEM |
| **Einzelnes GPO bearbeiten** | GPO → Delegierung (Lesen / Einstellungen bearbeiten / Einstellungen bearbeiten, löschen, Sicherheit ändern) | Ersteller + Admins |
| **GPOs verknüpfen** | **OU/Domäne/Standort** → Registerkarte Delegierung → „Gruppenrichtlinienobjekte verknüpfen“ | Admins |
| **Modellierung/RSoP ausführen** | Domäne/OU → Delegierung → „Gruppenrichtlinienmodellierungsanalysen ausführen“ / „RSoP-Daten lesen“ | Admins |
| **WMI-Filter** erstellen/bearbeiten | Container WMI-Filter → Delegierung | Admins, GP-Ersteller-Besitzer |
Mitglieder von **Gruppenrichtlinien-Ersteller-Besitzer** dürfen neue GPOs anlegen und **ihre eigenen** bearbeiten – aber nicht verknüpfen.

### Registrierungsbasierte Richtlinien & zentraler Speicher (Vertiefung)
- ADMX-Vorlagen für neue Windows-Versionen, **Edge**, **Office**, **Chrome** aus dem Herstellerpaket in den **zentralen Speicher** (`\\domäne\SYSVOL\domäne\Policies\PolicyDefinitions`) kopieren – inkl. Sprachordner (`de-DE`, `en-US`).
- Fehlen ADML-Dateien einer Sprache → Editor zeigt Fehler/englische Texte.
- Für Richtlinien, für die es keine ADMX gibt: **GPO-Einstellungen → Registrierung** (Preferences).

### GPO-Berichte und Vergleich
- **GPO-Bericht** (HTML/XML): `Get-GPOReport`.
- **Gruppenrichtlinienanalyse**: **Policy Analyzer** (Security Compliance Toolkit) vergleicht GPOs mit Baselines und findet Konflikte/Duplikate.
- **Gruppenrichtlinien-Ergebnisse** und `gpresult` (siehe AP1-GPO-Seite).
- Nicht verknüpfte oder leere GPOs regelmäßig aufräumen.

### Server Core und Remoteaktualisierung
- **Remote-gpupdate**: GPMC → Rechtsklick OU → **Gruppenrichtlinienupdate** (erzeugt geplante Aufgabe auf den Zielen innerhalb von 10 Minuten; erfordert offene Firewallregeln für **Remote-Tasks/WMI**) bzw. `Invoke-GPUpdate -Computer … -RandomDelayInMinutes 0 -Force`.
- **gpresult** remote: `gpresult /s SRV01 /r`.

## Lab
**Maschinen**: DC01 (contoso.local), TESTDC (testlab.local, keine Vertrauensstellung nötig für Import).

### GUI
1. **DC01**: GPMC → Gruppenrichtlinienobjekte → Rechtsklick **Alle sichern** → `\\SRV01\GPO-Backup` → Beschreibung „Stand vor Änderung“.
2. GPO **EXAMPLE-Standards** ändern (Zeitlimit 900 s) → **Sicherungen verwalten** → Stand „vor Änderung“ → **Wiederherstellen** → Wert wieder 600 s.
3. **Starter-GPOs** → „Ordner für Starter-GPOs erstellen“ → Neu → **Starter-Sicherheitsbasis** mit Administrativen Vorlagen (z. B. Bildschirmschoner, Windows Update) → Rechtsklick **Neues GPO von Starter-GPO**.
4. **Delegierung**: Container Gruppenrichtlinienobjekte → Registerkarte **Delegierung** → **GG-GPO-Admins** hinzufügen; OU **Vertrieb** → Delegierung → Berechtigung **Gruppenrichtlinienobjekte verknüpfen** → GG-GPO-Admins.
5. **Migrationstabelle**: Rechtsklick Domäne → **Migrationstabellen-Editor öffnen** → Extras → **Aus Sicherung auffüllen** (EXAMPLE-Standards) → Zielname `TESTLAB\GG-HR`, UNC-Ziele `\\TESTSRV\...` → speichern als `contoso-testlab.migtable`.
6. **TESTDC**: GPMC → neues GPO „EXAMPLE-Standards“ → Rechtsklick **Einstellungen importieren** → Sicherungsordner → Migrationstabelle verwenden.
7. **DC01**: Rechtsklick OU Clients → **Gruppenrichtlinienupdate** → Ergebnisfenster.

### PowerShell
```powershell
# Auf DC01
Backup-GPO -All -Path \\SRV01\GPO-Backup -Comment "Stand vor Änderung"
Restore-GPO -Name "EXAMPLE-Standards" -Path \\SRV01\GPO-Backup
Get-GPOReport -Name "EXAMPLE-Standards" -ReportType Html -Path C:\Temp\EXAMPLE.html

# Starter-GPO und GPO daraus
New-GPStarterGPO -Name "Starter-Sicherheitsbasis"
New-GPO -Name "Clients-Basis" -StarterGpoName "Starter-Sicherheitsbasis"

# Delegierung
Set-GPPermission -Name "Clients-Basis" -TargetName "GG-GPO-Admins" -TargetType Group -PermissionLevel GpoEdit
# Verknüpfungsrecht an OU per dsacls (gPLink/gPOptions schreiben)
dsacls "OU=Vertrieb,DC=contoso,DC=local" /G "CONTOSO\GG-GPO-Admins:RPWP;gPLink" "CONTOSO\GG-GPO-Admins:RPWP;gPOptions"

# Auf TESTDC – Import mit Migrationstabelle
Import-GPO -BackupGpoName "EXAMPLE-Standards" -Path \\SRV01\GPO-Backup -TargetName "EXAMPLE-Standards" -CreateIfNeeded -MigrationTable C:\Temp\contoso-testlab.migtable

# Standard-GPOs zurücksetzen (Notfall!)
dcgpofix /target:Both

# Remote-Update
Invoke-GPUpdate -Computer CL01 -RandomDelayInMinutes 0 -Force
```

## Einfach

GPOs sind die **Hausordnungen** der Firma. Als Profi-Admin musst du sie nicht nur schreiben, sondern auch **verwalten**:

- **Sichern** = eine **Kopie der Hausordnung** in den Tresor legen. Hat jemand Mist gebaut, holst du die alte Fassung zurück (**Wiederherstellen**). Achtung: Wo die Hausordnung **aufgehängt** war (Verknüpfung an einer OU), steht nicht in der Kopie – das musst du ggf. neu machen.
- **Importieren** = die Hausordnung einer **Schwesterfirma** übernehmen (z. B. aus der Test-Umgebung). Weil dort andere Namen gelten (andere Gruppen, andere Server), gibt es eine **Übersetzungsliste** (**Migrationstabelle**): „Aus CONTOSO\GG-HR wird TESTLAB\GG-HR.“
- **Starter-GPO** = eine **Vorlage** für neue Hausordnungen, damit man nicht jedes Mal bei null anfängt.
- **Delegierung** = der Stellvertreter darf **neue Hausordnungen schreiben**, aber **nur in bestimmten Fluren aufhängen**. So bleibt der Chef-Admin der Einzige mit Generalvollmacht.
- **dcgpofix** = der **Werksreset** für die zwei wichtigsten Hausordnungen – nur für den Notfall!

## Merksatz
- Sicherung enthält **keine Links**.
- **Wiederherstellen** = gleiche GUID, gleiche Domäne; **Importieren** = Einstellungen in anderes GPO, auch andere Domäne.
- Andere Domäne → **Migrationstabelle**.
- **Starter-GPO** = nur Administrative Vorlagen.
- Erstellen, Bearbeiten, **Verknüpfen** getrennt delegierbar.

## Prüfungsfalle
- Nach Restore fehlen Verknüpfungen – sie werden nicht mitgesichert.
- „Gruppenrichtlinien-Ersteller-Besitzer“ dürfen GPOs erstellen, aber **nicht verknüpfen**.
- Starter-GPOs enthalten keine Sicherheitseinstellungen oder Skripte.
- dcgpofix setzt nur die beiden Standard-GPOs zurück.
- Remote-gpupdate braucht Firewall-Freigaben (Remote-Aufgabenverwaltung/WMI).

## Grafik
### Tresor der Hausordnungen
GPO-Dokumente wandern in einen Tresor (Backup); beim Restore kommen sie zurück, die Pinnwand-Nadel (Link) fehlt und blinkt als Hinweis.

### Migrationstabelle
Zwei Firmen nebeneinander; beim Import fließen Einstellungen durch einen Übersetzer, der Gruppen- und Pfadnamen austauscht.

### Delegierungs-Matrix
Drei Schlüssel (Erstellen, Bearbeiten, Verknüpfen) werden an unterschiedliche Rollen verteilt.

## Karteikarten
- F: Was sichert Backup-GPO NICHT? | A: Die Verknüpfungen (Links) mit OUs/Domäne/Standorten.
- F: Unterschied Restore-GPO und Import-GPO? | A: Restore stellt das gesicherte GPO (gleiche GUID) wieder her; Import schreibt Einstellungen einer Sicherung in ein anderes/neues GPO, auch domänenübergreifend.
- F: Wozu dient eine Migrationstabelle? | A: Umschreiben domänenspezifischer Werte (Sicherheitsprinzipale, UNC-Pfade) beim Import/Kopieren in eine andere Domäne.
- F: Was enthält ein Starter-GPO? | A: Nur Einstellungen der Administrativen Vorlagen (plus Kommentare).
- F: Was darf die Gruppe Gruppenrichtlinien-Ersteller-Besitzer? | A: GPOs erstellen und eigene GPOs bearbeiten, nicht verknüpfen.
- F: Wo delegiert man das Verknüpfen von GPOs? | A: An der OU/Domäne/Standort, Registerkarte Delegierung.
- F: Was macht dcgpofix? | A: Setzt Default Domain Policy und/oder Default Domain Controllers Policy auf den Auslieferungszustand zurück.
- F: Wie stößt man gpupdate auf allen Computern einer OU an? | A: GPMC → Rechtsklick OU → Gruppenrichtlinienupdate bzw. Invoke-GPUpdate.
- F: Werkzeug zum Vergleich von GPOs mit Baselines? | A: Policy Analyzer (Security Compliance Toolkit).

## Quiz
? Ein GPO wurde versehentlich gelöscht und aus der Sicherung wiederhergestellt. Es wirkt aber nicht. Warum?
* Die Verknüpfung zur OU wurde nicht mitgesichert und muss neu erstellt werden
- Restore erzeugt immer eine neue GUID
- Wiederhergestellte GPOs sind deaktiviert
- Die Sicherung enthält keine Einstellungen

? Ein GPO soll aus der Testdomäne in die Produktionsdomäne übernommen werden, dabei sollen Gruppennamen angepasst werden. Was nutzt man?
* Import-GPO mit Migrationstabelle
- Restore-GPO
- dcgpofix
- Copy-Item im SYSVOL

? Ein Teamleiter soll GPOs nur an die OU Vertrieb verknüpfen dürfen. Wo wird das delegiert?
* An der OU Vertrieb (Registerkarte Delegierung, „Gruppenrichtlinienobjekte verknüpfen“)
- In der Default Domain Policy
- Über die Gruppe Schema-Admins
- In der Migrationstabelle

? Was kann ein Starter-GPO enthalten?
* Administrative Vorlagen
- Softwareinstallationspakete
- Sicherheitseinstellungen und Kontorichtlinien
- Anmeldeskripte

? Welches Werkzeug setzt die Default Domain Policy auf Werkseinstellungen?
* dcgpofix
- gpupdate /force
- gpresult /z
- repadmin /syncall

? Mit welchem Cmdlet wird ein GPO gesichert?
* Backup-GPO
- Export-GPO
- Copy-GPO -Backup
- Save-GPO
! Wiederherstellung mit Restore-GPO, Import in andere Domäne mit Import-GPO.

? Was beinhaltet die Sicherung eines GPOs NICHT?
* Die Verknüpfungen (Links) mit OUs
- Die Einstellungen
- Die Sicherheitsfilterung
- Die WMI-Filter-Verknüpfung
! Verknüpfungen müssen nach einer Wiederherstellung ggf. neu gesetzt werden.

? Wozu dient eine Migrationstabelle beim Import eines GPOs?
* Sie ordnet Sicherheitsprinzipale und UNC-Pfade der Quelldomäne denen der Zieldomäne zu.
- Sie übersetzt Einstellungen in andere Sprachen.
- Sie migriert Benutzerkonten.
- Sie ändert die Domänenfunktionsebene.
! Erstellt mit dem Migrationstabellen-Editor.
