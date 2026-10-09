---
id: az800-adds-dc
bereich: AZ-800
block: A7
kapitel: AD DS on-premises & Cloud
titel: Domänencontroller on-premises bereitstellen
stufe: Fortgeschritten
quellen: [Identitätsmanagement_mit_Windows_Server_2016_70-742.pdf, AZ-800 Study Guide]
verweise: [ap1-a6-adds, az800-rodc, az800-dcs-azure, az800-fsmo, az800-standorte-replikation]
---

## Profi

### Bereitstellungsoptionen
| Szenario | Vorgehen | Cmdlet |
|---|---|---|
| **Neue Gesamtstruktur** | erster DC, Stammdomäne | `Install-ADDSForest` |
| **Neue Domäne** in bestehender Gesamtstruktur (Kind- oder Strukturdomäne) | Anmeldung mit Organisations-Admin | `Install-ADDSDomain` |
| **Zusätzlicher DC** in bestehender Domäne | Redundanz, Standort | `Install-ADDSDomainController` |
| **RODC** | Außenstelle | `Install-ADDSDomainController -ReadOnlyReplica` / vorab `Add-ADDSReadOnlyDomainControllerAccount` |
Grundlage ist immer: Rolle `AD-Domain-Services` installieren, dann heraufstufen. Der Assistent führt **Voraussetzungsprüfungen** durch (DNS, Berechtigungen, Schema) und erledigt **adprep** automatisch. Tipp: Im Assistenten **„Skript anzeigen“** – ideal, um PowerShell-Befehle für die Prüfung zu lernen.

### Mindestens zwei DCs pro Domäne
Ein einzelner DC ist ein **Single Point of Failure** (Anmeldung, DNS, GPOs). Best Practice: mindestens **zwei beschreibbare DCs** pro Domäne, **jeder DC ist DNS-Server und globaler Katalog**, Clients bekommen beide DCs als DNS (bevorzugt/alternativ, per DHCP-Option 006).

### Server Core als DC
Empfehlung von Microsoft: DCs als **Server Core** (ohne Desktopdarstellung) – kleinere Angriffsfläche, weniger Updates, weniger Ressourcen. Verwaltung per **RSAT**, **Windows Admin Center**, **PowerShell Remoting**. Erstkonfiguration mit `sconfig` (Name, IP, Domäne, Updates, Remoteverwaltung).

### Install from Media (IFM)
Bei **langsamen WAN-Verbindungen** soll die initiale Replikation nicht übers Netz laufen: Auf einem vorhandenen DC wird mit **ntdsutil** ein IFM-Satz erstellt (Kopie der AD-Datenbank + ggf. SYSVOL), auf einen Datenträger kopiert und beim Heraufstufen verwendet. Danach werden nur noch die Änderungen repliziert.
```
ntdsutil "activate instance ntds" ifm "create sysvol full C:\IFM" quit quit
Install-ADDSDomainController -DomainName contoso.local -InstallationMediaPath C:\IFM ...
```
Für einen RODC: `create sysvol rodc` (ohne geheime Daten).

### Virtualisierte DCs
- DCs laufen heute meist als **VM** (Hyper-V, Azure). Seit Server 2012 gibt es **Virtualisierungsschutzmaßnahmen**: Die VM-Generation-ID erkennt, wenn ein DC aus einem **Prüfpunkt/Snapshot** zurückgesetzt wurde, und verhindert **USN-Rollback** (Invocation-ID wird zurückgesetzt, RID-Pool verworfen).
- Trotzdem gilt: **DCs nicht über Prüfpunkte „sichern“** – dafür Windows Server-Sicherung (Systemstatus).
- **DC-Klonen**: Ein vorhandener virtueller DC wird mit `New-ADDCCloneConfigFile` vorbereitet (Mitglied der Gruppe **Klonbare Domänencontroller**, Anwendungen per `Get-ADDCCloningExcludedApplicationList` prüfen), exportiert und als neue VM importiert → schnelle Bereitstellung vieler DCs.
- **Zeitsynchronisation**: Hyper-V-Integrationsdienst „Zeitsynchronisierung“ auf DCs so konfigurieren, dass die Domänenhierarchie (PDC-Emulator) maßgeblich ist.

### Herabstufen und Entfernen
`Uninstall-ADDSDomainController` (bzw. Rolle entfernen → Assistent). Letzter DC einer Domäne: Option „Letzter Domänencontroller in der Domäne“. Ausgefallene DCs, die nicht mehr starten: **Metadatenbereinigung** (Objekt in „AD-Benutzer und -Computer“ oder „Standorte und Dienste“ löschen, bestätigt „DC ist dauerhaft offline“) und ggf. FSMO-Rollen übernehmen (→ FSMO-Troubleshooting).

### Upgrade/Migration der DCs
Kein In-Place-Upgrade für DCs empfohlen, sondern **neue DCs hinzufügen** (aktuelle Version), FSMO-Rollen verschieben, alte DCs herabstufen, zuletzt **Funktionsebene** anheben. SYSVOL muss vorher auf **DFS-R** migriert sein (`dfsrmig`), falls noch FRS genutzt wird (ab Server 2019 nicht mehr unterstützt).

## Lab
**Maschinen**: DC01 (vorhanden, contoso.local), DC02 (Server Core, 192.168.1.2).

### GUI / sconfig
1. **DC02** (Server Core): `sconfig` → 2 Computername `DC02` → 8 Netzwerkeinstellungen: IP 192.168.1.2/24, DNS **192.168.1.1** → Neustart.
2. **DC01**: Server-Manager → Verwalten → **Server hinzufügen** → DC02 → Rechtsklick DC02 → **Rollen und Features hinzufügen** → AD DS (remote auf DC02).
3. **DC01**: Fähnchen → DC02 heraufstufen → **Domänencontroller zu vorhandener Domäne hinzufügen** → contoso.local → DNS + GC → DSRM-Kennwort → **Replizieren von: DC01** → Installieren.
4. **DC01**: `dsa.msc` → OU Domain Controllers → DC02 vorhanden; DNS-Konsole → NS-Einträge für DC02.
5. **DHCP**: Option 006 auf 192.168.1.1, 192.168.1.2 setzen.

### PowerShell
```powershell
# Auf DC02 (Server Core)
Install-WindowsFeature AD-Domain-Services -IncludeManagementTools
Install-ADDSDomainController -DomainName "contoso.local" -InstallDns -NoGlobalCatalog:$false `
  -Credential (Get-Credential CONTOSO\Administrator) -ReplicationSourceDC "DC01.contoso.local" `
  -SafeModeAdministratorPassword (Read-Host -AsSecureString "DSRM") -Force

# Kontrolle (auf DC01)
Get-ADDomainController -Filter * | Format-Table Name, Site, IsGlobalCatalog, OperatingSystem
repadmin /replsummary
dcdiag /s:DC02 /q

# IFM erstellen (auf DC01) für einen DC in einer Außenstelle
ntdsutil "activate instance ntds" ifm "create sysvol full C:\IFM" quit quit

# DC-Klonen vorbereiten (auf einem virtuellen Quell-DC)
Add-ADGroupMember "Klonbare Domänencontroller" -Members (Get-ADComputer DC02)
Get-ADDCCloningExcludedApplicationList
New-ADDCCloneConfigFile -CloneComputerName DC03 -Static -IPv4Address 192.168.1.3 -IPv4SubnetMask 255.255.255.0 -IPv4DNSResolver 192.168.1.1
```

## Einfach

Ein **Domänencontroller** ist das **Einwohnermeldeamt** der Firma. Hat man nur **eins** und das brennt ab, kann sich niemand mehr anmelden. Deshalb baut man immer **mindestens zwei** Ämter, die ihre Akten ständig abgleichen.

**Server Core** ist ein Amt **ohne Schaufenster**: kein Desktop, keine bunten Fenster – nur das Nötigste. Dadurch gibt es weniger Stellen, an denen Einbrecher angreifen können, und weniger Updates. Bedient wird es aus der Ferne (Admin Center, PowerShell).

**Install from Media (IFM)** ist wie ein **Umzug mit dem Umzugswagen statt per Post**: Die neue Zweigstelle ist weit weg und die Leitung langsam. Statt alle Akten einzeln per Leitung zu schicken, kopiert man sie auf eine Festplatte, fährt sie hin – und schickt danach nur noch die neuen Änderungen.

**Klonen** ist der Turbo: Aus einem fertigen virtuellen DC macht man mit einer Anleitungsdatei ganz schnell einen Zwilling mit neuem Namen.

**Achtung bei Prüfpunkten**: Einen DC per Prüfpunkt „in die Vergangenheit zurückzusetzen“ ist wie ein Amt, das plötzlich Akten von letzter Woche hat – die anderen Ämter wären verwirrt. Moderne DCs erkennen das, aber zum Sichern nimmt man trotzdem ein richtiges Backup.

## Merksatz
- **Forest – Domain – DomainController**: `Install-ADDSForest`, `Install-ADDSDomain`, `Install-ADDSDomainController`.
- Mindestens **2 DCs** je Domäne, jeder **DNS + GC**.
- **IFM** bei langsamem WAN (`ntdsutil ifm`).
- DCs bevorzugt **Server Core**.
- **Keine Prüfpunkte** als DC-Backup.

## Prüfungsfalle
- Neue Kinddomäne erfordert **Organisations-Admin**-Rechte, zusätzlicher DC nur Domänen-Admin.
- IFM für RODC: `create sysvol rodc`.
- Klonen nur mit Mitgliedschaft in „Klonbare Domänencontroller“ und passender Hypervisor-Unterstützung (VM-Generation-ID).
- DC-Upgrade = neue DCs + Rollen verschieben, nicht In-Place.
- FRS muss vor neueren DCs auf DFS-R migriert sein.

## Grafik
### Drei Wege zum DC
Drei Pfade (neue Gesamtstruktur, neue Domäne, zusätzlicher DC) mit dem jeweiligen Cmdlet auf einem Wegweiser.

### IFM-Umzugswagen
Zentrale mit DC, langsame Leitung (Schnecke) zur Filiale; ein Lastwagen mit Festplatte fährt hin; danach laufen nur kleine Änderungs-Pakete über die Leitung.

### Klonen
Virtueller DC wird mit einer XML-Datei „geimpft“, exportiert, importiert – zwei DCs mit unterschiedlichen Namen und IDs.

## Karteikarten
- F: Cmdlet für einen zusätzlichen DC in einer vorhandenen Domäne? | A: Install-ADDSDomainController.
- F: Cmdlet für eine neue Gesamtstruktur? | A: Install-ADDSForest.
- F: Wozu dient IFM? | A: DC-Heraufstufung mit vorab erstellter Datenbankkopie – spart initiale Replikation über langsames WAN.
- F: Womit erstellt man IFM-Medien? | A: ntdsutil (ifm, create sysvol full/rodc).
- F: Warum DCs als Server Core? | A: Kleinere Angriffsfläche, weniger Updates und Ressourcen.
- F: Was ist USN-Rollback? | A: Inkonsistenz durch Zurücksetzen eines DCs auf einen alten Stand – moderne VMs erkennen es per VM-Generation-ID.
- F: Voraussetzung für das Klonen eines DCs? | A: Mitglied der Gruppe „Klonbare Domänencontroller“, Clone-Konfigurationsdatei, Hypervisor mit VM-Generation-ID.
- F: Wie entfernt man einen dauerhaft ausgefallenen DC aus AD? | A: Metadatenbereinigung (DC-Objekt löschen) und FSMO-Rollen übernehmen.
- F: Empfohlene DC-Anzahl pro Domäne? | A: Mindestens zwei beschreibbare DCs.

## Quiz
? Eine Filiale ist über eine sehr langsame Leitung angebunden. Wie installiert man dort am besten einen DC?
* Mit Install from Media (IFM)
- Über einen Prüfpunkt des Zentral-DCs
- Durch Kopieren der VHDX des DC01
- Ohne DNS

? Welches Cmdlet stuft einen Server zum zusätzlichen DC einer vorhandenen Domäne herauf?
* Install-ADDSDomainController
- Install-ADDSForest
- New-ADDomain
- Add-Computer

? Wie sollten virtuelle DCs gesichert werden?
* Mit Systemstatus-Sicherung (z. B. Windows Server-Sicherung)
- Ausschließlich mit Hyper-V-Prüfpunkten
- Gar nicht, AD repliziert ja
- Durch Kopieren der ntds.dit im laufenden Betrieb

? Welche Rechte benötigt man, um eine neue Kinddomäne zu erstellen?
* Organisations-Admins (Enterprise Admins)
- Domänen-Benutzer
- DNS-Admins
- Druck-Operatoren

? Welche Empfehlung gilt für DNS in einer Domäne mit zwei DCs?
* Beide DCs sind DNS-Server und Clients erhalten beide als DNS-Server
- Nur der erste DC ist DNS-Server
- Clients nutzen den Provider-DNS
- DNS wird nur auf dem RODC installiert
