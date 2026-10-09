---
id: az801-admt
bereich: AZ-801
block: A10
kapitel: Migration
titel: ADMT, neue Gesamtstruktur und Forest-Upgrade
stufe: Profi
quellen: [AZ-801 Study Guide, Microsoft Learn]
verweise: [az800-trusts, az800-fsmo, az801-ad-replikation, az801-dsrm-sysvol]
---

## Profi

### Drei Wege
| Weg | Erklärung |
|---|---|
| **In-Place-Upgrade der Domänencontroller** | **Server-OS** **direkt** **hochrüsten** **(nicht empfohlen** **für DCs)** |
| **Swing-/Rolling-Upgrade** | **Neue DCs** **(2022/2025)** **in bestehende Domäne**, **FSMO** **verschieben**, **alte DCs** **herabstufen** – **Standard** |
| **Neue Gesamtstruktur + ADMT** | **Neue** **Gesamtstruktur** **aufbauen**, **Objekte** **per ADMT** **migrieren** |

### Swing-Upgrade (empfohlen)
1. **Neuen Server** **in Domäne aufnehmen**.
2. **AD-DS-Rolle** **installieren**, **zum DC** **heraufstufen** (`Install-ADDSDomainController`) – **`adprep`** **läuft** **automatisch**.
3. **Replikation** **prüfen** (`repadmin /replsummary`, `dcdiag`).
4. **FSMO-Rollen** **verschieben** (`Move-ADDirectoryServerOperationMasterRole`).
5. **DNS/DHCP/GPO** **prüfen**.
6. **Alten DC** **herabstufen** (`Uninstall-ADDSDomainController`).
7. **Funktionsebene** **anheben**.

```powershell
# Auf NEW-DC (Server 2022)
Install-WindowsFeature AD-Domain-Services -IncludeManagementTools
Install-ADDSDomainController -DomainName exa.local -InstallDns -Credential (Get-Credential) -SafeModeAdministratorPassword (Read-Host -AsSecureString)

# FSMO verschieben
Move-ADDirectoryServerOperationMasterRole -Identity NEW-DC -OperationMasterRole SchemaMaster,DomainNamingMaster,PDCEmulator,RIDMaster,InfrastructureMaster

# Funktionsebene
Get-ADForest | Select-Object ForestMode
Set-ADForestMode -Identity exa.local -ForestMode Windows2016Forest
Set-ADDomainMode -Identity exa.local -DomainMode Windows2016Domain
```

### SYSVOL: FRS → DFSR
**FRS** **wird** **ab Windows Server 2019 nicht mehr** **unterstützt**. **Vor** **dem** **Hinzufügen** **neuer DCs** **muss** **SYSVOL** **über DFSR** **replizieren**:

| Zustand | Bedeutung | Befehl |
|---|---|---|
| **0 – Start** | **FRS** | – |
| **1 – Vorbereitet** (*Prepared*) | **DFSR-Kopie** **entsteht** | `dfsrmig /setglobalstate 1` |
| **2 – Umgeleitet** (*Redirected*) | **DFSR** **liefert SYSVOL** | `dfsrmig /setglobalstate 2` |
| **3 – Eliminiert** (*Eliminated*) | **FRS** **entfernt** **(endgültig)** | `dfsrmig /setglobalstate 3` |

`dfsrmig /getmigrationstate` **zeigt** **Fortschritt**.

### Funktionsebenen (Functional Levels)
- **Domänen- und Gesamtstruktur-Funktionsebene** **bestimmen** **Funktionen**.
- **Anheben** **nur** **wenn** **alle DCs** **das** **Niveau** **unterstützen**.
- **Zurücksetzen** **ist** **eingeschränkt** (**Gesamtstruktur** **kaum**, **Domäne** **teils** **mit Papierkorb-Beschränkung**).
- **Server 2025** **hat** **neue** **Ebene** **(Windows2025Forest)** **mit** **32-KB-Datenbankseiten**.

### ADMT (Active Directory Migration Tool)
**ADMT 3.2** **migriert** **Benutzer, Gruppen, Computer, Dienstkonten, Profile** **zwischen** **Domänen/Gesamtstrukturen**.

| Begriff | Erklärung |
|---|---|
| **Quelldomäne** | **Alt** |
| **Zieldomäne** | **Neu** |
| **Interforest** | **Zwischen Gesamtstrukturen** **(Vertrauensstellung nötig)** |
| **Intraforest** | **Innerhalb** **einer Gesamtstruktur** |
| **SID-History** | **Alte SID** **wird** **mitgenommen**, **Zugriff** **auf alte Ressourcen** **bleibt** |
| **PES** (*Password Export Server*) | **Migriert** **Kennwörter** |
| **Übersetzung von Sicherheit** (*Security Translation*) | **ACLs** **auf** **neue SIDs** **umschreiben** |
| **Berichtsassistent** | **Migration** **planen/prüfen** |

**Voraussetzungen**:
- **Vertrauensstellung** **(beidseitig oder Einweg)**.
- **Auditing** **für Kontoverwaltung** **in beiden Domänen**.
- **Lokale Gruppe** **`<Quelldomäne>$$$`** **in** **Quelldomäne** **(für SID-History)**.
- **ADMT** **auf** **Zielseite** **installieren** **(SQL Express/LocalDB)**.
- **Konto** **mit Administratorrechten** **in beiden Domänen**.

### Reihenfolge einer ADMT-Migration
1. **Vertrauensstellung** **einrichten**.
2. **Gruppen** **migrieren** **(mit SID-History)**.
3. **Benutzer** **migrieren**.
4. **Computer** **migrieren**.
5. **Sicherheit** **übersetzen** **(Dateiserver-ACLs)**.
6. **Alte Domäne** **abschalten**.

### Neue Gesamtstruktur: Wann?
- **Schema** **soll** **sauber** **neu beginnen**.
- **Domänenname** **oder Struktur** **soll** **komplett geändert** **werden**.
- **Firmenübernahme** **oder** **Konsolidierung**.
- **Sicherheitsvorfall** **(Kompromittierung)**.

## Lab
**Maschinen**: **DC-OLD** (**Server 2016**), **DC-NEW** (**Server 2022**).

### GUI
1. **DC-NEW**: **Server-Manager → Rollen hinzufügen → AD DS** → **Server zum Domänencontroller heraufstufen** → **Weiteren DC zu bestehender Domäne**.
2. **DC-NEW**: **Replikation** **prüfen** (**Standorte und Dienste → NTDS Settings**).
3. **DC-NEW**: **Active Directory-Benutzer und -Computer → Rechtsklick Domäne → Betriebsmaster** → **Rollen ändern** (**RID, PDC, Infrastruktur**).
4. **DC-NEW**: **Active Directory-Domänen und -Vertrauensstellungen → Rechtsklick → Betriebsmaster (Domänennamenmaster)** **ändern**.
5. **DC-NEW**: **Schema-Snap-in registrieren** (`regsvr32 schmmgmt.dll`) → **Betriebsmaster ändern**.
6. **DC-OLD**: **Server-Manager → Rollen und Features entfernen → AD DS** → **Herabstufen**.
7. **DC-NEW**: **Active Directory-Domänen und -Vertrauensstellungen → Funktionsebene** **anheben**.

## Einfach

**AD-Upgrade** **ist** **wie** **ein Wechsel der Stadtverwaltung**: **Die neue** **Verwaltung** **zieht** **ein**, **arbeitet** **eine Weile** **parallel**, **bekommt** **nach und nach** **alle Aufgaben** (**FSMO**), **und** **dann** **geht** **die alte** **in Rente** (**Herabstufen**).

**ADMT** **ist** **ein Umzugsservice** **zwischen zwei Städten**: **Die Bürger** (**Benutzer**) **ziehen** **in die neue Stadt**, **nehmen** **ihre alten Ausweise** **mit** (**SID-History**) **und** **dürfen** **weiter** **in die alten Gebäude** (**Ressourcen**), **bis** **alles** **umgeschrieben** **ist**.

## Merksatz
- **Neue DCs rein, FSMO umziehen, alte DCs raus**.
- **FRS → DFSR: 0-1-2-3**.
- **Funktionsebene** **zuletzt** **anheben**.
- **ADMT = Umzug zwischen Domänen**.
- **SID-History = alter Ausweis**.
- **PES = Kennwörter**.

## Prüfungsfalle
- **FRS-SYSVOL** **verhindert** **Server 2019+ DCs**.
- **ADMT** **braucht** **Vertrauensstellung** **und** **Auditing**.
- **Domänenfunktionsebene** **nicht** **anheben**, **solange** **alte DCs** **existieren**.
- **`adprep`** **läuft** **bei** **Server 2012+** **automatisch** **mit** **der Heraufstufung**.
- **In-Place-Upgrade** **für DCs** **ist** **nicht** **empfohlene** **Praxis**.
- **SID-History** **verlangt** **die Gruppe „Domäne$$$“**.
- **ADMT** **ist** **nicht** **Teil** **von** **Windows Server**, **sondern** **separater Download**.

## Grafik
### Stadtverwaltung
Alte und neue Verwaltung nebeneinander, Schlüsselbund (FSMO) wechselt die Hände.

### FRS zu DFSR
Vier Stufen 0 bis 3 mit Fortschrittsbalken.

### ADMT-Umzug
Bürger laufen über Brücke (Vertrauensstellung) mit altem Ausweis in der Tasche.

## Karteikarten
- F: Empfohlene DC-Upgrade-Methode? | A: Swing-Upgrade mit neuen DCs und FSMO-Verschiebung.
- F: Was ersetzt FRS für SYSVOL? | A: DFSR.
- F: Zustände von dfsrmig? | A: 0 Start, 1 Vorbereitet, 2 Umgeleitet, 3 Eliminiert.
- F: Wofür ADMT? | A: Objektmigration zwischen Domänen oder Gesamtstrukturen.
- F: Was ist SID-History? | A: Alte SID bleibt am migrierten Objekt für Ressourcenzugriff.
- F: Wofür PES? | A: Kennwortmigration.
- F: Welche Gruppe braucht SID-History? | A: <Quelldomäne>$$$ in der Quelldomäne.
- F: Womit hebt man die Funktionsebene an? | A: Set-ADForestMode und Set-ADDomainMode.
- F: Wann neue Gesamtstruktur? | A: Bei Neuaufbau, Konsolidierung oder Kompromittierung.

## Quiz
? Ein DC mit Server 2016 soll durch 2022 ersetzt werden, ohne Ausfall. Vorgehen?
* Neuen DC hinzufügen, FSMO verschieben, alten herabstufen
- In-Place-Upgrade
- Domäne neu erstellen
- Nur die Funktionsebene anheben

? SYSVOL repliziert noch per FRS. Was ist vor Server-2022-DCs nötig?
* Migration auf DFSR
- Neuinstallation der Domäne
- Nichts
- DNS-Umstellung

? Welches Tool migriert Benutzer zwischen Gesamtstrukturen?
* ADMT
- SMS
- WSMT
- Azure Migrate

? Was ermöglicht der Zugriff auf alte Ressourcen nach der Migration?
* SID-History
- PES
- DSRM
- RODC

? Welcher dfsrmig-Zustand entfernt FRS endgültig?
* 3 Eliminiert
- 0 Start
- 1 Vorbereitet
- 2 Umgeleitet

? Wann hebt man die Funktionsebene an?
* Wenn alle DCs die neue Version unterstützen
- Sofort nach dem ersten neuen DC
- Vor dem Hinzufügen neuer DCs
- Nie
