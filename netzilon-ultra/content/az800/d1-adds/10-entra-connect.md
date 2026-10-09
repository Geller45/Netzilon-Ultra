---
id: az800-entra-connect
bereich: AZ-800
block: A7
kapitel: AD DS on-premises & Cloud
titel: Microsoft Entra Connect Sync, Cloud Sync & Connect Health
stufe: Profi
quellen: [AZ-800 Study Guide, Microsoft Learn]
verweise: [az800-hybrid-auth, az800-join-entra, az800-multidomain-gruppen, az801-hybrid-auth-troubleshooting]
---

## Profi

### Hybride Identität
Ziel: **Eine Identität** für on-prem und Cloud – Benutzer melden sich mit demselben Konto an Windows (AD DS) und an Microsoft 365/Azure (Entra ID) an. Dafür werden Objekte aus AD DS nach **Entra ID synchronisiert**. Die **Quelle der Wahrheit** bleibt AD DS: Synchronisierte Benutzer werden **on-prem** gepflegt (Änderungen in der Cloud sind für gesyncte Attribute gesperrt).

### Microsoft Entra Connect Sync (klassisch)
- Installationspaket auf einem **Mitgliedsserver** (nicht zwingend DC; Server 2016+, empfohlen dedizierter Server), mit lokaler SQL Express (bis ~100.000 Objekte) oder vollwertigem SQL.
- Synchronisiert Benutzer, Gruppen, Kontakte, Geräte (für **Hybrid Join**) – Standard alle **30 Minuten** (Delta).
- **Express-Einstellungen**: eine Gesamtstruktur, Kennworthash-Synchronisierung, alle Objekte. **Benutzerdefiniert**: Filterung nach Domänen/OUs/Gruppen, Anmeldemethode (PHS, PTA, Federation), optionale Features.
- **Optionale Features**: **Kennwortrückschreiben** (Password Writeback, für SSPR), **Gruppenrückschreiben**, **Geräterückschreiben**, **Exchange-Hybrid**, Attributfilterung, **Verzeichniserweiterungen**.
- **Staging-Modus**: zweiter Connect-Server, der importiert/synchronisiert, aber **nicht exportiert** → schnelles Umschalten bei Ausfall (kein Cluster!). Es darf nur **ein aktiver** Sync-Server pro Tenant laufen.
- **Source Anchor**: unveränderliches Attribut zur Zuordnung on-prem ↔ Cloud (**ms-DS-ConsistencyGuid**, früher objectGUID). **Soft Match** (per UPN/SMTP) bzw. **Hard Match** (ImmutableID) bei bereits bestehenden Cloud-Konten.
- **Voraussetzungen**: **routbare UPN-Suffixe** (verifizierte Domäne im Tenant), bereinigte Verzeichnisse (**IdFix**-Tool: Duplikate, ungültige Zeichen), Konto mit **Organisations-Admin** (Installation), Entra-Konto mit **Hybrid Identity Administrator**/Global Admin, TLS 1.2.
- Werkzeuge: **Synchronization Service Manager** (Import/Sync/Export-Läufe, Connector Spaces, Metaverse), PowerShell-Modul **ADSync** (`Start-ADSyncSyncCycle -PolicyType Delta|Initial`, `Get-ADSyncScheduler`, `Set-ADSyncScheduler -SyncCycleEnabled $false` für Wartung).

### Microsoft Entra Cloud Sync
- Leichtgewichtige Alternative: **Provisioning-Agent** auf einem oder mehreren **Mitgliedsservern** (Hochverfügbarkeit durch **mehrere Agents**), Konfiguration und Logik **in der Cloud**.
- Ideal für **mehrere getrennte Gesamtstrukturen** (z. B. nach Firmenübernahme, auch **ohne** Vertrauensstellung/Netzverbindung zueinander), einfache Szenarien, Standorte mit wenig Infrastruktur.
- Unterstützt PHS, Kennwortrückschreiben, Gruppen-Provisioning zu AD; **Einschränkungen** gegenüber Connect Sync: kein PTA, keine Federation-Konfiguration, eingeschränkte Geräte-/Exchange-Hybrid-Features, begrenzte Attributregeln. Microsoft entwickelt Cloud Sync als strategische Lösung weiter.
- **Koexistenz** möglich (z. B. Connect Sync für Forest A, Cloud Sync für Forest B), aber **nicht dieselben Objekte** doppelt synchronisieren.

| | Connect Sync | Cloud Sync |
|---|---|---|
| Installation | voller Server mit DB | leichter Agent |
| Hochverfügbarkeit | Staging-Server (manuell umschalten) | mehrere aktive Agents |
| Getrennte Forests ohne Trust | schwierig | **ja** |
| Konfiguration | lokal (Assistent, Regel-Editor) | Portal (Cloud) |
| PTA/Federation/Hybrid Join | ja | nein bzw. eingeschränkt |

### Microsoft Entra Connect Health
Überwachungsdienst im Entra-Portal (Lizenz **Entra ID P1/P2**) mit **Health-Agents**:
- **Connect Health für Sync**: Sync-Fehler (Duplikate, Attributkonflikte), Latenz, Warnungen.
- **Connect Health für AD DS**: DC-Leistung, Replikationsfehler, Anmeldefehler, Top-Clients.
- **Connect Health für AD FS**: Anmeldestatistiken, fehlgeschlagene Anmeldungen, riskante IPs, Extranet-Sperren.
- Alarmierung per E-Mail.

### Typischer Ablauf der Einführung
1. Tenant-Domäne (z. B. `firma.de`) im Entra-Portal hinzufügen und per **DNS-TXT-Eintrag verifizieren**.
2. On-prem **UPN-Suffix** `firma.de` hinzufügen und Benutzer umstellen.
3. **IdFix** laufen lassen, Fehler beheben.
4. Entra Connect installieren → Anmeldemethode wählen → **OU-Filterung** (Pilot-OU) → optionale Features.
5. Synchronisation prüfen (Portal: Benutzer mit „Quelle: Windows Server AD“), Pilot, dann ausweiten.

## Lab
**Voraussetzung**: Microsoft-Entra-Testtenant (z. B. M365-Developer/Trial) und verifizierte Domäne. Maschinen: DC01, **SYNC01** (Mitgliedsserver).

### GUI
1. **Entra-Portal**: Benutzerdefinierte Domänennamen → `firma.de` → TXT-Eintrag beim DNS-Hoster → **Überprüfen**.
2. **DC01**: `domain.msc` → UPN-Suffix `firma.de`; Pilotbenutzer in OU **Sync-Pilot** auf `@firma.de` umstellen.
3. **SYNC01**: Microsoft Entra Connect herunterladen (Entra-Portal → Hybridverwaltung) → **Anpassen** → Benutzeranmeldung **Kennworthashsynchronisierung** → Entra-Admin anmelden → Verzeichnis contoso.local hinzufügen (neues Konto erstellen lassen mit Organisations-Admin) → **Domänen-/OU-Filterung**: nur **Sync-Pilot** → Eindeutige Identifizierung: Standard → **Optionale Features**: Kennwortrückschreiben → Installieren.
4. **SYNC01**: Startmenü → **Synchronization Service** → Vorgänge (Full Import, Full Sync, Export) prüfen.
5. **Entra-Portal**: Benutzer → Pilotbenutzer vorhanden, „On-Premises-Synchronisierung aktiviert: Ja“.
6. **Cloud Sync (Alternative)**: Entra-Portal → Hybridverwaltung → **Cloud Sync** → Agent herunterladen → auf SYNC02 installieren → Konfiguration neu → Domäne auswählen → Bereich (Gruppe/OU) → aktivieren.

### PowerShell
```powershell
# Auf SYNC01
Import-Module ADSync
Get-ADSyncScheduler                                  # Intervall, nächster Lauf, StagingModeEnabled
Start-ADSyncSyncCycle -PolicyType Delta              # sofortiger Delta-Sync
Start-ADSyncSyncCycle -PolicyType Initial            # vollständiger Sync (nach Regeländerungen)
Set-ADSyncScheduler -SyncCycleEnabled $false         # Wartung: Sync anhalten
Set-ADSyncScheduler -SyncCycleEnabled $true
Get-ADSyncConnectorRunStatus

# Auf DC01 – UPN umstellen
Get-ADUser -SearchBase "OU=Sync-Pilot,DC=contoso,DC=local" -Filter * |
  ForEach-Object { Set-ADUser $_ -UserPrincipalName ($_.SamAccountName + "@firma.de") }
```

## Einfach

Stell dir vor, deine Firma hat **zwei Mitgliedslisten**: eine im **Firmengebäude** (Active Directory) und eine für den **Online-Bereich** (Entra ID – Teams, Outlook im Web). Ohne Abgleich müsste jeder Mitarbeiter **zwei Konten** mit zwei Passwörtern haben – nervig!

**Entra Connect** ist der **Kopierer**, der die Liste aus dem Gebäude **alle 30 Minuten** in die Online-Liste überträgt. Die **Gebäude-Liste ist das Original** – Änderungen (Name, Abteilung) macht man dort.

- **Staging-Modus** = ein **zweiter Kopierer**, der im Hintergrund mitläuft, aber nichts abschickt. Fällt der erste aus, schaltet man einfach um.
- **Filter** = nur bestimmte Abteilungen kopieren (z. B. erst einmal eine Testgruppe).
- **Kennwortrückschreiben** = Setzt jemand sein Passwort **online** zurück („Passwort vergessen“), wird es auch im Gebäude geändert.

**Cloud Sync** ist ein **kleiner, moderner Kopierer**: Nur ein kleines Programm im Gebäude, die ganze Steuerung liegt online. Super, wenn man **mehrere Firmen** (Gesamtstrukturen) hat, die sich gegenseitig gar nicht kennen.

**Connect Health** ist der **Wartungsdienst**, der dauernd schaut, ob der Kopierer und die Ämter gesund sind – und Alarm schlägt.

**Wichtig vorher**: Die Anmeldenamen müssen eine **echte Internet-Domäne** haben (`@firma.de`, nicht `@firma.local`), und die Liste muss **aufgeräumt** sein (keine doppelten Einträge – dafür gibt es das Tool **IdFix**).

## Merksatz
- **AD DS = Quelle der Wahrheit**, Sync alle **30 Min.** (Delta).
- **Nur ein aktiver** Connect-Sync-Server; Ausfallschutz = **Staging-Modus**.
- **Cloud Sync** = Agents, HA durch mehrere Agents, **getrennte Forests**.
- Vorher: **UPN-Suffix routbar** + **IdFix**.
- `Start-ADSyncSyncCycle -PolicyType Delta`.

## Prüfungsfalle
- Zwei aktive Entra-Connect-Server für denselben Tenant sind nicht zulässig.
- Staging-Server exportiert nicht – erst nach Umschalten aktiv.
- `.local`-UPNs landen als `@tenant.onmicrosoft.com` in Entra ID.
- Cloud Sync unterstützt keine Pass-Through-Authentifizierung.
- Connect Health benötigt Entra ID P1/P2.

## Grafik
### Der Kopierer
Firmengebäude mit AD-Liste, Entra-Connect-Server als Kopierer, Wolke mit Entra-ID-Liste; alle 30 Minuten fliegen Karten nach oben; ein Staging-Kopierer daneben mit ausgeschaltetem Ausgangsschacht.

### Connect Sync vs. Cloud Sync
Links ein großer Server mit Datenbank-Zylinder, rechts mehrere kleine Agents und ein Zahnrad in der Wolke; zwei getrennte Wälder werden nur rechts mühelos angebunden.

### Health-Dashboard
Ampel-Kacheln für Sync, AD DS, AD FS mit Warnmeldungen.

## Karteikarten
- F: Wie oft synchronisiert Entra Connect standardmäßig? | A: Alle 30 Minuten (Delta).
- F: Wozu dient der Staging-Modus? | A: Zweiter Sync-Server importiert/synchronisiert, exportiert aber nicht – Standby für schnelle Umschaltung.
- F: Was ist das Source Anchor-Attribut? | A: Unveränderliches Attribut (ms-DS-ConsistencyGuid) zur Zuordnung on-prem ↔ Cloud-Objekt.
- F: Wozu dient IdFix? | A: Findet und korrigiert Verzeichnisfehler (Duplikate, ungültige Zeichen) vor der Synchronisation.
- F: Wann ist Cloud Sync besser geeignet? | A: Bei mehreren getrennten Gesamtstrukturen, einfachen Szenarien, gewünschter HA durch mehrere Agents.
- F: Was kann Cloud Sync nicht? | A: Pass-Through-Authentifizierung, Federation-Konfiguration, einige Geräte-/Exchange-Hybrid-Features.
- F: Was überwacht Entra Connect Health? | A: Entra Connect Sync, AD DS und AD FS (Fehler, Leistung, Anmeldungen).
- F: Cmdlet für einen sofortigen Delta-Sync? | A: Start-ADSyncSyncCycle -PolicyType Delta
- F: Was ist Kennwortrückschreiben? | A: In der Cloud (SSPR) geänderte Kennwörter werden in AD DS geschrieben.

## Quiz
? Ein Unternehmen übernimmt eine Firma mit eigener Gesamtstruktur ohne Netzverbindung zur Zentrale. Beide sollen in denselben Tenant synchronisiert werden. Was eignet sich?
* Microsoft Entra Cloud Sync
- Zwei aktive Entra Connect Sync-Server
- Ein Forest-Trust ohne Synchronisation
- AD LDS

? Wie erreicht man Ausfallsicherheit für Entra Connect Sync?
* Einen zweiten Server im Staging-Modus bereithalten
- Zwei aktive Sync-Server parallel betreiben
- Entra Connect auf allen DCs installieren
- Einen Failover-Cluster erstellen

? Benutzer erscheinen in Entra ID als benutzer@tenant.onmicrosoft.com statt @firma.de. Ursache?
* Der on-prem-UPN verwendet ein nicht routbares Suffix (.local) oder die Domäne ist nicht verifiziert
- Die Synchronisation läuft zu oft
- Kennwortrückschreiben ist aktiv
- Connect Health ist nicht installiert

? Welcher Befehl startet einen vollständigen Synchronisationszyklus?
* Start-ADSyncSyncCycle -PolicyType Initial
- Start-ADSyncSyncCycle -PolicyType Delta
- repadmin /syncall
- gpupdate /force

? Wo werden Attribute synchronisierter Benutzer geändert?
* Im lokalen AD DS
- Nur im Entra-Portal
- In Exchange Online
- In der Entra-Connect-Datenbank

? Was ist die empfohlene leichtgewichtige Alternative zu Entra Connect Sync, bei der Agenten installiert und in der Cloud konfiguriert werden?
* Microsoft Entra Cloud Sync
- AD FS
- DFS-R
- Azure File Sync
! Cloud Sync eignet sich auch für mehrere getrennte Gesamtstrukturen.

? Welche Funktion bietet Entra Connect Health?
* Überwachung der Synchronisation und Identitätsinfrastruktur mit Warnungen
- Verschlüsselung der AD-Datenbank
- Bereitstellung von DHCP
- Installation von Updates
! Agenten senden Daten an das Entra-Portal.

? Wie lautet der Standard-Synchronisationsintervall von Entra Connect Sync?
* 30 Minuten
- 5 Minuten
- 24 Stunden
- 1 Woche
! Delta-Zyklen manuell mit Start-ADSyncSyncCycle -PolicyType Delta.
