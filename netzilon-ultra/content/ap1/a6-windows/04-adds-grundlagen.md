---
id: ap1-a6-adds
bereich: AP1
block: A6
kapitel: Windows Server
titel: Active Directory Domänendienste – Grundlagen
stufe: Fortgeschritten
quellen: [09-Folien-Active_Directory.pdf, 01-Folien-Ueberblick_ADDS.pdf, Server_2008_R2_-_70_640_2nd_de.pdf, Identitätsmanagement_mit_Windows_Server_2016_70-742.pdf]
verweise: [ap1-a6-gruppen, ap1-a6-gpo-grundlagen, ap1-a5-dns, ap1-a6-kerberos, az800-adds-dc]
---

## Profi

### Peer-to-Peer vs. Client-Server
| | **Arbeitsgruppe (Peer-to-Peer)** | **Domäne (Client-Server)** |
|---|---|---|
| Konten | auf **jedem Rechner einzeln** (lokale SAM) | **zentral** im Active Directory |
| Verwaltung | dezentral, jeder Rechner einzeln | zentral (GPOs, Gruppen, Delegierung) |
| Größe | bis ca. 10–20 Rechner sinnvoll | beliebig |
| Anmeldung | lokal am jeweiligen Rechner | einmal an der Domäne, Zugriff auf alle Ressourcen (**Single Sign-On**) |
| Voraussetzung | keine | mind. ein **Domänencontroller**, **DNS** |

### Was ist Active Directory?
**Active Directory Domain Services (AD DS)** ist Microsofts **zentraler Verzeichnisdienst** auf Basis von **LDAP** (Port 389/636, Kerberos 88). Er speichert Informationen über **Objekte** – Benutzer, Gruppen, Computer, Drucker, Freigaben, OUs, Standorte, Gruppenrichtlinien – und stellt **Authentifizierung** (Wer bist du?) und **Autorisierung** (Was darfst du?) bereit.

### Logische und physische Komponenten
| Logisch | Physisch |
|---|---|
| Partitionen, **Schema**, **Domänen**, **Strukturen (Trees)**, **Gesamtstrukturen (Forests)**, Standorte, **Organisationseinheiten**, Container | **Domänencontroller**, Datenspeicher (**ntds.dit**), **globale Katalogserver**, **RODCs** |

### Objekte, OUs und Container
- **Organisationseinheit (OU)**: Container für Objekte, kann weitere OUs enthalten. Zweck: Domäne **strukturieren** (nach Abteilung, Standort, Objekttyp), **GPOs verknüpfen**, **Verwaltung delegieren** (z. B. Helpdesk darf Kennwörter in OU „Vertrieb“ zurücksetzen).
- **Standardcontainer** (Users, Computers, Builtin): an sie kann man **keine GPOs** verknüpfen (Unterschied zur OU!) → neue Objekte am besten in eigene OUs verschieben bzw. Standard umleiten (`redirusr`, `redircmp`).
- **Distinguished Name** (DN): eindeutiger LDAP-Pfad, z. B. `CN=Anna Meier,OU=Vertrieb,OU=Schulung,DC=contoso,DC=local`.

### Domäne, Struktur, Gesamtstruktur
- **Domäne**: zentrale **Verwaltungseinheit** und **Sicherheitsbereich**; enthält Objekte und OUs; ist **Replikationsgrenze** für die Domänenpartition; benötigt mind. einen DC. Jeder DC der Domäne kann jede Anmeldung authentifizieren.
- **Struktur (Domänenstruktur/Tree)**: mehrere Domänen mit **zusammenhängendem Namensraum** (contoso.local → support.contoso.local), verbunden durch **implizite, transitive, bidirektionale Vertrauensstellungen** (Eltern-Kind).
- **Gesamtstruktur (Forest)**: eine oder mehrere Strukturen mit **unterschiedlichen Namensräumen** (contoso.local + fabrikam.com), gemeinsam: **Schema**, **Konfiguration**, **globaler Katalog**, Vertrauensstellungen zwischen allen Domänen. Die erste Domäne ist die **Gesamtstruktur-Stammdomäne**. Die Gesamtstruktur ist die eigentliche **Sicherheitsgrenze**.

### Partitionen der AD-Datenbank
| Partition | Inhalt | Repliziert an |
|---|---|---|
| **Schema** | Objektklassen und Attribute | alle DCs der Gesamtstruktur |
| **Konfiguration** | Standorte, Dienste, Topologie | alle DCs der Gesamtstruktur |
| **Domäne** | Benutzer, Gruppen, Computer, OUs dieser Domäne | alle DCs der Domäne |
| **Anwendung** | z. B. DNS-Zonen (ForestDnsZones, DomainDnsZones) | frei wählbare DCs |

### Schema
Das Schema definiert, **welche Objektarten** mit welchen **Attributen** in AD gespeichert werden können (Klasse „user“ mit Attributen givenName, mail …). Es wird auf alle DCs der Gesamtstruktur repliziert; Änderungen nur auf dem **Schemamaster** durch **Schema-Admins**. Es kann **nur erweitert** werden (Attribute hinzufügen/deaktivieren, **nicht löschen**) – z. B. durch Exchange, LAPS. Änderungen sorgfältig planen und testen.

### Domänencontroller
Hauptaufgabe: **Authentifizierung**. Ein DC enthält:
- Kopie der AD-Datenbank **ntds.dit** (`C:\Windows\NTDS`)
- **SYSVOL** (`C:\Windows\SYSVOL`): Gruppenrichtlinienvorlagen, Anmeldeskripte; repliziert per **DFS-R** (früher FRS – nur bis Server 2012 R2 unterstützt)
- DCs nutzen **Multimasterreplikation**: Änderungen an jedem DC möglich, werden an alle anderen verteilt.
- **RODC** (Read-Only Domain Controller): schreibgeschützte Kopie, speichert standardmäßig **keine Kennwörter** (nur gemäß **Password Replication Policy**), Verwaltung delegierbar an Nicht-Admins – für **Außenstellen mit geringer physischer Sicherheit**.

### Globaler Katalog (GC)
Ein DC mit der Rolle **Globaler Katalog** enthält eine **Teilkopie aller Objekte der gesamten Gesamtstruktur** (häufig gesuchte Attribute) + die **universellen Gruppenmitgliedschaften**. Zweck: gesamtstrukturweite **Suche** und **Anmeldung** (Ermittlung universeller Gruppen). Port **3268/3269**. Empfehlung: jeder DC ist GC (Ausnahme früher: Infrastrukturmaster in Multi-Domain-Umgebungen ohne alle DCs als GC).

### Betriebsmasterrollen (FSMO)
Manche Aufgaben dürfen nur von **einem** DC ausgeführt werden (**Flexible Single Master Operations**):
| Rolle | Anzahl | Aufgabe |
|---|---|---|
| **Schemamaster** | 1 je Gesamtstruktur | Schemaänderungen |
| **Domänennamenmaster** | 1 je Gesamtstruktur | Domänen hinzufügen/entfernen |
| **RID-Master** | 1 je Domäne | vergibt **RID-Pools** an DCs (RID = letzter Teil der SID) |
| **PDC-Emulator** | 1 je Domäne | **Zeitquelle** der Domäne, bevorzugt Kennwortänderungen, **Kontosperrungen**, GPO-Bearbeitung, Legacy-Kompatibilität |
| **Infrastrukturmaster** | 1 je Domäne | aktualisiert Verweise auf Objekte aus anderen Domänen |
Anzeigen: `netdom query fsmo`. Verschieben: `Move-ADDirectoryServerOperationMasterRole` (bei Ausfall: **seizing** = Übernehmen).

### Anmeldevorgang (vereinfacht)
1. Client sucht per **DNS (SRV-Records** `_ldap._tcp.dc._msdcs.<domäne>`) einen DC – bevorzugt im eigenen **Standort**.
2. Authentifizierung per **Kerberos** (TGT vom KDC auf dem DC).
3. Ermittlung der Gruppenmitgliedschaften (inkl. universeller Gruppen über GC) → **Zugriffstoken**.
4. Anwendung der **Gruppenrichtlinien** (Computer beim Start, Benutzer bei der Anmeldung).
→ **Ohne funktionierendes DNS keine Domänenanmeldung!**

### Funktionsebenen
Die **Domänen-** und **Gesamtstrukturfunktionsebene** bestimmt, welche AD-Features verfügbar sind, und legt die **älteste erlaubte DC-Version** fest. Neueste Ebene: **Windows Server 2025** (neu seit 2016: 32k-Datenbankseiten, erfordert nur Server-2025-DCs). Hochstufen ist einfach, **Herabstufen nur eingeschränkt**.

### Domänencontroller installieren
- `dcpromo` funktioniert seit Server 2012 nur noch mit **Antwortdatei**. Heute: Rolle **„Active Directory-Domänendienste“** im Server-Manager installieren → Benachrichtigung (Fähnchen) → **„Server zu einem Domänencontroller heraufstufen“**. Der Assistent kann die Einstellungen als **PowerShell-Skript** exportieren; **adprep** läuft automatisch (Schema-Erweiterung ohne Nachfrage).
- Benötigte Angaben: **Bereitstellungsvorgang** (neue Gesamtstruktur / neue Domäne in vorhandener Gesamtstruktur / zusätzlicher DC), **Stammdomänenname** (DNS), **Funktionsebenen**, **DNS-Server** (ja), **globaler Katalog** (ja), **RODC** (ja/nein), **DSRM-Kennwort** (Verzeichnisdienst-Wiederherstellungsmodus), **NetBIOS-Name**, Speicherorte für **Datenbank, Protokolle, SYSVOL**.
- Voraussetzungen: **statische IP**, DNS-Server auf sich selbst (bzw. vorhandenen DC) zeigen lassen, sinnvoller Computername (danach nicht mehr ändern), Administrator-Kennwort gesetzt.

## Lab
**Maschinen**: DC01 (Server 2022/2025, 192.168.1.1/24), SRV01 (192.168.1.100), CL01 (Windows 11, 192.168.1.20) – Domäne **contoso.local**.

### GUI
1. **DC01**: Computername DC01, statische IP 192.168.1.1/24, **DNS 127.0.0.1** → Neustart.
2. **DC01**: Server-Manager → Rollen und Features → **Active Directory-Domänendienste** (Verwaltungstools mit) → Installieren.
3. **DC01**: Fähnchen → **Server zu einem Domänencontroller heraufstufen** → **Neue Gesamtstruktur hinzufügen** → Stammdomäne `contoso.local` → Funktionsebenen **Windows Server 2016** (oder 2025) → DNS + GC angehakt → **DSRM-Kennwort** → DNS-Delegierung: Warnung ignorieren → NetBIOS `CONTOSO` → Pfade Standard → **Skript anzeigen** (PowerShell exportieren) → Installieren → automatischer Neustart.
4. **DC01**: als `CONTOSO\Administrator` anmelden → Tools → **Active Directory-Benutzer und -Computer** (`dsa.msc`) → OU **Schulung** mit Unter-OUs **Benutzer**, **Computer**, **Gruppen** anlegen.
5. **DC01**: OU Benutzer → Neuer Benutzer (z. B. Anna Meier, Anmeldename a.meier).
6. **SRV01/CL01**: DNS-Server **192.168.1.1** eintragen → `sysdm.cpl` → Computername → **Ändern** → Mitglied von **Domäne** `contoso.local` → Anmeldedaten `CONTOSO\Administrator` → Neustart.
7. **DC01**: Computerobjekte aus **Computers** in die OU Schulung\Computer verschieben.
8. **CL01**: als `CONTOSO\a.meier` anmelden → `whoami /all`, `echo %LOGONSERVER%`, `set userdomain`.
9. **DC01**: `netdom query fsmo` und `dcdiag` ausführen.

### PowerShell
```powershell
# Auf DC01 – Vorbereitung
Rename-Computer DC01 -Restart
New-NetIPAddress -InterfaceAlias Ethernet -IPAddress 192.168.1.1 -PrefixLength 24
Set-DnsClientServerAddress -InterfaceAlias Ethernet -ServerAddresses 127.0.0.1

# Auf DC01 – AD DS installieren und neue Gesamtstruktur
Install-WindowsFeature AD-Domain-Services -IncludeManagementTools
Install-ADDSForest -DomainName "contoso.local" -DomainNetbiosName "CONTOSO" `
  -ForestMode WinThreshold -DomainMode WinThreshold -InstallDns `
  -SafeModeAdministratorPassword (Read-Host "DSRM-Kennwort" -AsSecureString) -Force

# Auf DC01 – Struktur und Benutzer (nach Neustart)
New-ADOrganizationalUnit -Name "Schulung" -Path "DC=contoso,DC=local"
"Benutzer","Computer","Gruppen" | ForEach-Object { New-ADOrganizationalUnit -Name $_ -Path "OU=Schulung,DC=contoso,DC=local" }
New-ADUser -Name "Anna Meier" -SamAccountName a.meier -UserPrincipalName a.meier@contoso.local `
  -Path "OU=Benutzer,OU=Schulung,DC=contoso,DC=local" `
  -AccountPassword (Read-Host "Kennwort" -AsSecureString) -Enabled $true
redircmp "OU=Computer,OU=Schulung,DC=contoso,DC=local"   # neue Computerkonten landen direkt in der OU

# Auf SRV01 / CL01 – Domänenbeitritt
Set-DnsClientServerAddress -InterfaceAlias Ethernet -ServerAddresses 192.168.1.1
Add-Computer -DomainName contoso.local -Credential CONTOSO\Administrator -Restart

# Auf DC01 – Kontrolle
Get-ADDomainController -Filter * | Format-Table Name, IsGlobalCatalog, IsReadOnly
netdom query fsmo
Get-ADForest | Select-Object ForestMode, SchemaMaster, DomainNamingMaster
Resolve-DnsName _ldap._tcp.dc._msdcs.contoso.local -Type SRV
dcdiag /q
```

## Einfach

**Ohne Domäne (Arbeitsgruppe)** ist jede Wohnung eines Hauses eine **eigene kleine Welt**: Jede hat ihren eigenen Schlüsselbund, ihre eigene Gästeliste. Willst du 20 Wohnungen besuchen, brauchst du 20 Schlüssel und musst überall einzeln eingetragen sein. Chaos!

**Mit Domäne (Active Directory)** gibt es ein **zentrales Einwohnermeldeamt**: Du bist **einmal** dort registriert und bekommst **einen Ausweis**, der im ganzen Haus gilt. Das Amt sitzt im **Domänencontroller**.

**Was steht im Amt?** Eine riesige Liste (das **Verzeichnis**) mit allen Bewohnern (Benutzern), Wohnungen (Computern), Vereinen (Gruppen), Druckern und Regeln.

**Ordnung schaffen mit OUs**: Die Liste wird in **Ordner** (Organisationseinheiten) sortiert – z. B. „Vertrieb“, „Technik“, „Azubis“. An diese Ordner kann man **Regeln hängen** (Gruppenrichtlinien) und **Aufpasser** einsetzen (Delegierung: „Der Hausmeister darf im Ordner Azubis die Passwörter zurücksetzen“).

**Domäne, Struktur, Gesamtstruktur** sind wie **Stadtteil, Stadt und Land**:
- Die **Domäne** ist ein Stadtteil mit eigenem Amt.
- Mehrere Stadtteile mit gleichem Nachnamen (contoso.local, support.contoso.local) bilden eine **Struktur**.
- Mehrere solche Städte mit verschiedenen Namen bilden die **Gesamtstruktur** – sie teilen sich ein gemeinsames **Grundgesetz** (das **Schema**: Was darf überhaupt in einer Akte stehen?).

**Mehrere DCs** sind wie **Zweigstellen des Amts**: Jede hat eine Kopie der Liste, und Änderungen werden automatisch an alle weitergegeben. Fällt eine aus, arbeiten die anderen weiter.

**Sonderaufgaben (FSMO)**: Manche Dinge darf nur **eine** Zweigstelle erledigen – z. B. die offizielle **Uhrzeit** vorgeben (PDC-Emulator) oder die **Ausweisnummern** verteilen (RID-Master), damit keine Nummer doppelt vergeben wird.

**Ganz wichtig**: Das Amt findet man über das **Telefonbuch (DNS)**. Ist DNS kaputt, findet kein Computer seinen DC – und niemand kann sich anmelden.

## Merksatz
- AD = **LDAP-Verzeichnis + Kerberos-Anmeldung + DNS**.
- **Domäne < Struktur < Gesamtstruktur** (Gesamtstruktur = Sicherheitsgrenze).
- **GPOs an OUs**, nicht an Container.
- FSMO: **2 je Gesamtstruktur** (Schema, Domänennamen) + **3 je Domäne** (RID, PDC, Infrastruktur) → „**S**chöne **D**amen **R**eisen **P**rima **I**mmer“.
- Kein DNS → keine Anmeldung.

## Prüfungsfalle
- An **Container** (Users, Computers) kann man keine GPO verknüpfen.
- Schema kann nicht gelöscht, nur erweitert/deaktiviert werden.
- PDC-Emulator = Zeitquelle und Kontosperrungen (nicht der „einzige schreibbare DC“).
- DC-Clients müssen auf den **DC als DNS** zeigen, nicht auf den Router/Provider.
- RODC speichert standardmäßig keine Kennwörter.

## Grafik
### Arbeitsgruppe vs. Domäne
Links fünf PCs mit je eigenem Schlüsselbund, Benutzer muss überall einzeln angelegt werden (Zähler steigt); rechts ein DC als Amt, ein Ausweis öffnet alle Türen.

### Forest-Landkarte
Wald mit zwei Bäumen (contoso.local mit Kind support.contoso.local, fabrikam.com); Vertrauenspfeile erscheinen automatisch; Wurzeln = gemeinsames Schema.

### Anmeldevorgang
Client → DNS-Frage nach SRV-Record → DC gefunden → Kerberos-Ticket → Token mit Gruppen → GPOs fließen auf den Client.

### FSMO-Rollen
Fünf Kronen verteilt auf DCs; Klick zeigt die Aufgabe; Szenario „DC fällt aus“ → Krone wird übernommen (seize).

## Karteikarten
- F: Unterschied Arbeitsgruppe und Domäne? | A: Arbeitsgruppe: lokale Konten je Rechner. Domäne: zentrale Konten im AD, zentrale Verwaltung, SSO.
- F: Auf welchem Protokoll basiert AD? | A: LDAP (Anmeldung per Kerberos).
- F: Was ist eine OU? | A: Organisationseinheit – Container zum Strukturieren, für GPO-Verknüpfung und Delegierung.
- F: Unterschied Struktur und Gesamtstruktur? | A: Struktur: Domänen mit zusammenhängendem Namensraum. Gesamtstruktur: eine oder mehrere Strukturen mit gemeinsamem Schema/GC.
- F: Was ist die Sicherheitsgrenze in AD? | A: Die Gesamtstruktur.
- F: Wie heißt die AD-Datenbankdatei? | A: ntds.dit.
- F: Was liegt in SYSVOL? | A: Gruppenrichtlinienvorlagen und Anmeldeskripte (repliziert per DFS-R).
- F: Was ist der globale Katalog? | A: Teilkopie aller Objekte der Gesamtstruktur + universelle Gruppen; für Suche und Anmeldung.
- F: Nenne die fünf FSMO-Rollen. | A: Schemamaster, Domänennamenmaster, RID-Master, PDC-Emulator, Infrastrukturmaster.
- F: Aufgaben des PDC-Emulators? | A: Zeitquelle, Kennwortänderungen, Kontosperrungen, bevorzugter DC für GPO-Bearbeitung.
- F: Was ist ein RODC? | A: Schreibgeschützter DC für Außenstellen; speichert Kennwörter nur laut Password Replication Policy.
- F: Wie findet ein Client einen DC? | A: Über DNS-SRV-Einträge (_ldap._tcp.dc._msdcs.<domäne>).
- F: Wofür braucht man das DSRM-Kennwort? | A: Anmeldung im Verzeichnisdienst-Wiederherstellungsmodus (AD-Wiederherstellung).

## Quiz
? Welche FSMO-Rolle gibt es nur einmal pro Gesamtstruktur?
* Schemamaster
- RID-Master
- PDC-Emulator
- Infrastrukturmaster

? An welches Objekt kann eine GPO NICHT verknüpft werden?
* Den Standardcontainer „Users“
- Eine OU
- Die Domäne
- Einen Standort

? Ein Client kann sich nicht an der Domäne anmelden, das Netzwerk funktioniert aber. Häufigste Ursache?
* Der Client verwendet nicht den DC als DNS-Server
- Der Client hat zu viel RAM
- Der DC ist globaler Katalog
- Das Schema ist zu groß

? Was speichert der globale Katalog?
* Eine Teilkopie aller Objekte der Gesamtstruktur und universelle Gruppenmitgliedschaften
- Nur die Kennwörter aller Benutzer
- Die DNS-Stammhinweise
- Die DHCP-Leases

? Was gilt für das AD-Schema?
* Es kann erweitert, aber nicht gelöscht werden
- Es existiert einmal je OU
- Es wird nur auf RODCs gespeichert
- Jeder Benutzer kann es ändern
