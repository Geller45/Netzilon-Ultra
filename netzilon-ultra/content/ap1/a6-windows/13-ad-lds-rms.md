---
id: ap1-a6-lds-rms
bereich: AP1
block: A6
kapitel: Windows Server
titel: AD LDS & AD RMS – weitere AD-Rollen
stufe: Profi
quellen: [Server_2008_R2_-_70_640_2nd_de.pdf, Identitätsmanagement_mit_Windows_Server_2016_70-742.pdf]
verweise: [ap1-a6-adds, ap1-a6-efs-vss, az800-entra-connect, ap2-kryptografie]
---

## Profi

### Die AD-Rollenfamilie im Überblick
| Rolle | Kurz | Zweck |
|---|---|---|
| **AD DS** | Domänendienste | Verzeichnis, Anmeldung, GPOs – das „eigentliche“ AD |
| **AD CS** | Zertifikatdienste | eigene PKI: Zertifikate ausstellen, sperren (CRL/OCSP) |
| **AD FS** | Verbunddienste | Single Sign-On über Organisationsgrenzen (Claims, SAML/OIDC), Webanwendungsproxy |
| **AD LDS** | Lightweight Directory Services | schlankes LDAP-Verzeichnis für Anwendungen, **ohne Domäne** |
| **AD RMS** | Rights Management Services | Schutz von **Dokumentinhalten** (Nutzungsrechte) |

### AD LDS – Lightweight Directory Services
**AD LDS** (früher ADAM) ist ein **eigenständiger LDAP-Verzeichnisdienst** auf Basis derselben Technik wie AD DS – aber **ohne** Domäne, Kerberos-KDC, GPOs, DNS-Integration oder FSMO-Rollen.
- **Instanzen**: Auf einem Server können **mehrere** unabhängige Instanzen laufen, jede mit **eigenem Port** (Standard 389/636, bei weiteren z. B. 50000/50001), eigenem **Schema**, eigener Datenbank und eigenen Anwendungsverzeichnispartitionen.
- Läuft auf **Mitgliedsservern oder Arbeitsgruppenservern** (auch auf Windows-Clients) – **kein DC** nötig; kann aber neben AD DS existieren.
- Replikation zwischen Instanzen über **Konfigurationssätze** möglich.
- Benutzer: eigene **AD-LDS-Benutzer** (Anwendungskonten) und/oder Verweise auf Windows-/AD-Konten (Authentifizierung per Bind).

**Einsatzszenarien**:
- **Anwendungsverzeichnis**: Eine Anwendung braucht ein LDAP-Verzeichnis mit **eigenen Schemaerweiterungen**, die man **nicht ins Unternehmens-AD** schreiben möchte (Schema ist nicht löschbar!).
- **Extranet/DMZ**: Konten von Kunden/Partnern für ein Webportal – getrennt vom internen AD.
- **Test/Entwicklung** von LDAP-Anwendungen ohne Risiko für die Produktivdomäne.
- Adressbuch/Telefonbuch-Dienste, Konfigurationsspeicher.

**Verwaltung**: Rolle „Active Directory Lightweight Directory Services“ → **Setup-Assistent für AD LDS** (neue eindeutige Instanz oder Replikat) → Anwendungsverzeichnispartition (z. B. `CN=Portal,DC=firma,DC=de`) → Ports → Dienstkonto → LDIF-Dateien importieren (MS-User, MS-InetOrgPerson …). Werkzeuge: **ADSI-Editor** (`adsiedit.msc`), **LDP** (`ldp.exe`), `dsmgmt`, `ldifde`, **AD-Schema-Snap-In** (`schmmgmt.msc`).

**AD DS vs. AD LDS**
| | AD DS | AD LDS |
|---|---|---|
| Domäne/Gesamtstruktur | ja | nein |
| Anmeldung an Windows | ja (Kerberos) | nein |
| GPOs, Computerkonten | ja | nein |
| Instanzen pro Server | eine | mehrere |
| Schema | eines für die Gesamtstruktur | je Instanz eigenes |
| Voraussetzung DNS/DC | ja | nein |

### AD RMS – Rights Management Services
**AD RMS** schützt **Informationen selbst** – nicht nur den Speicherort. Dokumente und E-Mails werden **verschlüsselt** und mit **Nutzungsrechten** versehen, die **überall gelten**, wohin die Datei auch wandert (USB-Stick, E-Mail-Anhang, fremdes Netz).

**Mögliche Rechte**: Anzeigen, Bearbeiten, Speichern, **Drucken**, **Kopieren** (Inhalt in die Zwischenablage), **Weiterleiten**, Screenshots erschweren, **Ablaufdatum** (Dokument nach Datum nicht mehr öffenbar), Zugriff widerrufen.

**Funktionsweise**:
1. Der Autor schützt ein Dokument in einer **RMS-fähigen Anwendung** (Office, Outlook) mit einer **Rechtsrichtlinienvorlage** (z. B. „Vertraulich – nur intern, kein Drucken“).
2. Das Dokument wird verschlüsselt; es erhält eine **Veröffentlichungslizenz** mit den Rechten.
3. Der Empfänger öffnet es → seine Anwendung fragt beim **RMS-Cluster** eine **Nutzungslizenz** an → der Server prüft die Identität (AD) und liefert die erlaubten Rechte → die Anwendung **erzwingt** sie (Drucken-Knopf ausgegraut usw.).

**Komponenten**: RMS-Cluster (Stammzertifizierungscluster), Datenbank (SQL Server), **Rechtsrichtlinienvorlagen**, **Clientzertifikate**, Verbindung zu AD; für externe Partner Vertrauensstellungen oder **AD FS**-Integration.

**Grenzen**: Schutz nur in **RMS-fähigen Anwendungen**; gegen Abfotografieren des Bildschirms hilft es nicht; Infrastruktur aufwendig.

**Heute**: AD RMS on-premises wird kaum neu eingeführt – Nachfolger ist **Microsoft Purview Information Protection** (Azure RMS, **Vertraulichkeitsbezeichnungen**/Sensitivity Labels in Microsoft 365). Das Prinzip „Schutz haftet am Dokument“ ist gleich.

**Abgrenzung**:
| | NTFS/Freigabe | EFS | BitLocker | **RMS/Purview** |
|---|---|---|---|---|
| Schützt | Zugriff am Speicherort | Datei auf dem Datenträger | ganzes Volume | **Inhalt überall** |
| Nach dem Kopieren/Mailen | Schutz weg | Schutz weg | Schutz weg | **Schutz bleibt** |
| Nutzungsrechte (Drucken, Weiterleiten) | nein | nein | nein | **ja** |

## Lab
**Maschinen**: SRV01 (Mitgliedsserver), DC01.

### GUI – AD LDS-Instanz
1. **SRV01**: Server-Manager → Rollen → **Active Directory Lightweight Directory Services** → Installieren.
2. Tools → **Setup-Assistent für Active Directory Lightweight Directory Services** → **Eine eindeutige Instanz** → Name `Portal` → LDAP-Port **50000**, SSL-Port **50001** → **Ja, eine Anwendungsverzeichnispartition erstellen** → `CN=Portal,DC=firma,DC=de` → Speicherorte Standard → Dienstkonto **Netzwerkdienst** → AD-LDS-Administratoren: aktueller Benutzer → LDIF-Dateien importieren: **MS-User.LDF**, **MS-InetOrgPerson.LDF** → Installieren.
3. Tools → **ADSI-Editor** → Rechtsklick → Verbindung herstellen → Distinguished Name `CN=Portal,DC=firma,DC=de`, Server `localhost:50000` → OK.
4. Rechtsklick `CN=Portal…` → Neu → Objekt → **organizationalUnit** → `Kunden` → darin Neu → Objekt → **user** → `kunde01`.
5. Kennwort setzen: Rechtsklick kunde01 → Kennwort zurücksetzen; Attribut **msDS-UserAccountDisabled** = FALSE.
6. **LDP** (`ldp.exe`) → Verbindung `localhost:50000` → Bind als kunde01 → Anmeldung am Anwendungsverzeichnis testen.

### GUI – AD RMS (Überblick)
7. Voraussetzungen: Domänenmitglied, SQL Server (oder Windows Internal Database für Tests), Dienstkonto, DNS-Name des Clusters (z. B. `rms.contoso.local`), SSL-Zertifikat.
8. Rolle **Active Directory-Rechteverwaltungsdienste** → Konfiguration: Neuen Stammcluster erstellen → Datenbank → Dienstkonto → Kryptografiemodus 2 → Clusterschlüsselspeicher → Cluster-URL → Lizenznehmer-Zertifikat → SCP in AD registrieren.
9. RMS-Konsole → **Rechtsrichtlinienvorlagen** → Vorlage „Vertraulich intern“: Gruppe „Alle Mitarbeiter“ = Anzeigen, kein Drucken/Weiterleiten, Ablauf 30 Tage.
10. Word auf CL01 → Datei → Informationen → **Dokument schützen** → Zugriff einschränken → Vorlage wählen → als anderer Benutzer öffnen und Rechte prüfen.

### PowerShell
```powershell
# Auf SRV01 – AD LDS installieren und Instanz per Antwortdatei anlegen
Install-WindowsFeature ADLDS -IncludeManagementTools
@"
[ADAMInstall]
InstallType=Unique
InstanceName=Portal
LocalLDAPPortToListenOn=50000
LocalSSLPortToListenOn=50001
NewApplicationPartitionToCreate=CN=Portal,DC=firma,DC=de
DataFilesPath=C:\Program Files\Microsoft ADAM\Portal\data
LogFilesPath=C:\Program Files\Microsoft ADAM\Portal\data
ImportLDIFFiles="MS-User.LDF" "MS-InetOrgPerson.LDF"
"@ | Set-Content C:\Temp\adlds.txt
& "$env:WINDIR\ADAM\adaminstall.exe" /answer:C:\Temp\adlds.txt

# Mit AD-Cmdlets gegen die LDS-Instanz arbeiten
New-ADOrganizationalUnit -Name Kunden -Path "CN=Portal,DC=firma,DC=de" -Server localhost:50000
New-ADUser -Name kunde01 -Path "OU=Kunden,CN=Portal,DC=firma,DC=de" -Server localhost:50000 `
  -AccountPassword (Read-Host -AsSecureString "Kennwort") -Enabled $true
Get-ADUser -Filter * -SearchBase "CN=Portal,DC=firma,DC=de" -Server localhost:50000
Get-Service "ADAM_Portal"

# AD RMS-Rolle (nur Installation)
Install-WindowsFeature ADRMS -IncludeManagementTools
```

## Einfach

**AD DS** ist das große **Einwohnermeldeamt** der Firma – mit Ausweisen, Hausregeln (GPOs) und allem Drum und Dran.

**AD LDS** ist dagegen ein **kleines, separates Adressbuch** nur für **ein bestimmtes Programm**. Stell dir vor, die Firma hat ein **Kundenportal im Internet**. Die Kunden sollen sich dort anmelden können – aber du willst sie auf keinen Fall ins große Einwohnermeldeamt der Firma schreiben (Sicherheit, Ordnung). Also bekommt das Portal sein **eigenes kleines Adressbuch**. Auf einem Server können sogar **mehrere** solcher Adressbücher gleichzeitig stehen, jedes an einer eigenen „Tür“ (Port).

**AD RMS** ist ein **Zauberstempel auf dem Dokument selbst**. Normalerweise schützt man Dateien wie ein Haus: mit Türschlössern (Berechtigungen). Aber sobald jemand die Datei **aus dem Haus trägt** (per E-Mail verschickt), ist der Schutz weg.
Mit RMS steht **im Dokument selbst**: „Nur Mitarbeiter dürfen mich lesen. Drucken verboten. Weiterleiten verboten. Ab dem 31. Dezember löse ich mich in Luft auf.“ Das gilt **überall** – auch wenn die Datei auf einem fremden Computer landet. Heute macht das meist Microsoft 365 mit **Vertraulichkeitsbezeichnungen**.

## Merksatz
- **AD LDS = LDAP ohne Domäne**, mehrere **Instanzen** mit eigenen **Ports** und **Schemas**.
- LDS-Einsatz: **Anwendungen**, **Extranet/DMZ**, **Test**.
- **AD RMS = Schutz haftet am Inhalt** (Drucken, Kopieren, Weiterleiten, Ablauf).
- Nachfolger RMS: **Purview / Vertraulichkeitsbezeichnungen**.
- Nur **RMS-fähige Apps** setzen die Rechte durch.

## Prüfungsfalle
- AD LDS kann keine Windows-Anmeldung/GPOs bereitstellen.
- AD LDS braucht keinen DC und keine Domäne.
- NTFS/EFS schützen nicht mehr nach dem Versand – RMS schon.
- RMS verhindert kein Abfotografieren des Bildschirms.
- Schema-Erweiterungen einer Anwendung gehören eher in AD LDS als ins Unternehmens-AD.

## Grafik
### AD-Rollenfamilie
Fünf Karten (DS, CS, FS, LDS, RMS) um einen Server; Klick zeigt Zweck und typisches Szenario.

### Mehrere LDS-Instanzen
Ein Server mit drei Türen (Ports 50000, 50010, 50020), hinter jeder ein eigenes kleines Adressbuch mit eigenem Schema-Symbol.

### Dokument auf Reisen
Ein geschütztes Dokument reist vom Firmen-PC per Mail zu einem fremden PC; bei NTFS fällt das Schloss beim Verlassen ab, beim RMS-Dokument bleibt ein Siegel dran, der Drucken-Knopf beim Empfänger ist ausgegraut.

## Karteikarten
- F: Was ist AD LDS? | A: Eigenständiger LDAP-Verzeichnisdienst für Anwendungen, ohne Domäne/Kerberos/GPOs.
- F: Wie viele AD-LDS-Instanzen kann ein Server haben? | A: Mehrere – jede mit eigenem Port, Schema und Datenbank.
- F: Typische Einsatzzwecke für AD LDS? | A: Anwendungsverzeichnisse mit eigenem Schema, Extranet/DMZ-Konten, Test/Entwicklung.
- F: Werkzeuge zur Verwaltung von AD LDS? | A: ADSI-Editor, LDP, ldifde, dsmgmt, AD-PowerShell mit -Server host:port.
- F: Was schützt AD RMS? | A: Den Inhalt von Dokumenten/E-Mails mit Nutzungsrechten, unabhängig vom Speicherort.
- F: Nenne vier RMS-Nutzungsrechte. | A: Anzeigen, Bearbeiten, Drucken, Kopieren, Weiterleiten, Ablaufdatum.
- F: Was ist eine Rechtsrichtlinienvorlage? | A: Vordefinierter Satz von Rechten, den Benutzer auf Dokumente anwenden.
- F: Cloud-Nachfolger von AD RMS? | A: Microsoft Purview Information Protection (Azure RMS, Vertraulichkeitsbezeichnungen).
- F: Unterschied RMS zu EFS/NTFS? | A: RMS-Schutz bleibt nach Kopieren/Versand bestehen und steuert Nutzungsrechte.

## Quiz
? Eine Webanwendung braucht ein LDAP-Verzeichnis mit eigenen Schemaerweiterungen, ohne das Unternehmens-AD zu verändern. Was setzt man ein?
* AD LDS
- AD CS
- Eine zweite Default Domain Policy
- DNS-Stubzone

? Welche Aussage zu AD LDS ist richtig?
* Es benötigt keinen Domänencontroller und kann mehrere Instanzen pro Server betreiben
- Es verteilt Gruppenrichtlinien
- Es ersetzt den globalen Katalog
- Es kann nur auf Domänencontrollern installiert werden

? Ein vertrauliches Dokument soll auch nach dem Weiterleiten per E-Mail nicht druckbar sein. Welche Technik?
* AD RMS bzw. Vertraulichkeitsbezeichnungen
- NTFS-Berechtigungen
- EFS
- BitLocker

? Was braucht der Empfänger eines RMS-geschützten Dokuments zum Öffnen?
* Eine Nutzungslizenz vom RMS-Server über eine RMS-fähige Anwendung
- Nur ein PDF-Programm
- Den EFS-Wiederherstellungsagenten
- Eine DHCP-Reservierung

? Welches Werkzeug eignet sich, um Objekte in einer AD-LDS-Instanz anzulegen?
* ADSI-Editor
- DHCP-Konsole
- Druckverwaltung
- Datenträgerverwaltung
