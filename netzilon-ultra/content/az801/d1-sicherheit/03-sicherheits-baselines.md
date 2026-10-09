---
id: az801-baselines
bereich: AZ-801
block: A9
kapitel: Sicherheit
titel: Sicherheits-Baselines per GPO (Security Compliance Toolkit)
stufe: Fortgeschritten
quellen: [AZ-801 Study Guide, Microsoft Learn]
verweise: [az801-exploit-wdac, az801-dc-haertung, az800-gpo, az800-azure-arc]
---

## Profi

### Was ist eine Sicherheits-Baseline?
Eine **Baseline** ist eine von Microsoft empfohlene **Sammlung sicherheitsrelevanter Einstellungen** (GPO, Registry, Sicherheitsrichtlinien), abgestimmt mit **Microsoft-Sicherheitsteams** und **Kunden-Feedback**. Sie definiert einen **bekannten guten Konfigurationsstand** für **Windows Server**, **Windows 11**, **Microsoft Edge** und **Microsoft 365 Apps**.

| Baseline-Typ | Zielsystem |
|---|---|
| **Domänencontroller** | DCs (**strenger**: z. B. Anmelderechte, LDAP-Signierung) |
| **Mitgliedsserver** | Server in der Domäne |
| **Domänensicherheit** | **Domänenweit**: **Kennwort-/Kontosperrungsrichtlinie**, **Kerberos** |
| **Client** (Windows 11) | Arbeitsplätze |
| **Edge / M365 Apps** | Anwendungen |

Microsoft veröffentlicht pro **Windows-Version** ein eigenes Paket (z. B. **Windows Server 2022 Security Baseline**).

### Microsoft Security Compliance Toolkit (SCT)
Kostenloses **Toolset** (Download **Microsoft Download Center**):
| Bestandteil | Zweck |
|---|---|
| **Baselines** (ZIP) | **GPO-Backups**, Skripte, **Dokumentation** (Excel: Einstellungen und Begründung) |
| **Policy Analyzer** | **Vergleicht** GPOs/lokale Einstellungen **untereinander** oder gegen die **aktuelle Konfiguration** (Ausgabe: Differenzbericht **Excel**) |
| **LGPO.exe** | **Lokale Gruppenrichtlinie** aus **Backups** importieren/exportieren (für **Workgroup**-Server) |
| **SetObjectSecurity.exe** | Sicherheitsdeskriptoren für Objekte setzen |

### Baselines auf Server anwenden
| Weg | Beschreibung |
|---|---|
| **GPO-Import (Domäne)** | **Gruppenrichtlinienverwaltung** → neue GPO → Rechtsklick → **Einstellungen importieren** (*Import Settings*) aus dem **GPO-Backup-Ordner**; oder Skript **`Baseline-ADImport.ps1`** (legt **alle** Baseline-GPOs an) |
| **Lokal (Workgroup)** | `Baseline-LocalInstall.ps1 -WS2022NonDomainJoined` oder **`LGPO.exe /g`** |
| **Azure Arc / Azure Policy** | **Machine Configuration** (früher *Guest Configuration*): integrierte **Azure-Policy** für die **Windows-Sicherheits-Baseline** → **Auditierung** der Konformität |
| **Microsoft Defender for Cloud** | **Sicherheitsempfehlungen** (**Schwachstellen in der Betriebssystemkonfiguration**), **Secure Score**, **Regulatory Compliance** |
| **Intune** | **Security Baseline Profile** (**Endpoint security → Security baselines**) |
| **Ältere Werkzeuge** | **Security Configuration Wizard** (*SCW*), **Sicherheitsvorlagen** (`.inf`), **`secedit`** |

### Einstellungen in Baselines (Beispiele)
- **Kennwortrichtlinie**, **Kontosperrung**.
- **NTLM**/**LM-Hash** deaktivieren, **SMB-Signierung**, **SMB1 aus**.
- **Benutzerkontensteuerung**, **Anmelderechte**, **Netzwerkzugriff**.
- **Überwachungsrichtlinie** (Erweiterte Überwachung), **Ereignisprotokollgrößen**.
- **Windows Defender Firewall**, **PowerShell-Protokollierung**, **RDP-Einstellungen**.
- **Credential Guard**, **Ausschluss von Diensten** und **Wechselmedien**.

### Empfohlene Vorgehensweise
1. **Baseline herunterladen** und **Dokumentation** lesen.
2. **In Testumgebung** importieren.
3. **Policy Analyzer** gegen **Produktiv-GPOs** laufen lassen → **Konflikte** finden.
4. **Ausnahmen** dokumentieren; **eigene Anpassungen** in **separater GPO** (nie die Baseline-GPO selbst ändern).
5. GPO an **OU** verknüpfen (**DC-Baseline → Domain Controllers-OU**, **Mitgliedsserver-Baseline → Server-OU**).
6. **Konformität überwachen** (Azure Policy Machine Configuration/Defender for Cloud).

### Baseline vs. CIS-Benchmarks
| Merkmal | Microsoft-Baseline | **CIS Benchmark** |
|---|---|---|
| Herausgeber | Microsoft | **Center for Internet Security** |
| Stufen | Ein Satz (Enterprise) | **Level 1/Level 2** |
| Werkzeuge | SCT, Policy Analyzer | CIS-CAT |
Beide **vergleichbar**; AZ-801 fragt **Microsoft SCT**.

## Lab
**Maschinen**: **DC01** (Domäne example.com, GPMC), **SRV01** (Mitgliedsserver, OU **Server**), **ADMIN-PC** (Download).

### GUI
1. **ADMIN-PC**: **Microsoft Security Compliance Toolkit** herunterladen → **Windows Server 2022 Security Baseline** und **Policy Analyzer** → auf `\\DC01\Freigaben\SCT` kopieren.
2. **DC01**: Baseline entpacken → Ordner `GPOs` enthält **GPO-Backups** (Mitgliedsserver, Domänencontroller, Domänensicherheit).
3. **DC01**: **Gruppenrichtlinienverwaltung** → **Gruppenrichtlinienobjekte** → Rechtsklick → **Neu** → `MS-Baseline-MemberServer`.
4. **DC01**: Rechtsklick auf GPO → **Einstellungen importieren…** → **Weiter** → Sicherung optional **Ja** → Sicherungsordner `GPOs` wählen → **MSFT Windows Server 2022 – Member Server** → **Weiter** → Import.
5. **DC01**: GPO mit OU **Server** verknüpfen (**Vorhandenes Gruppenrichtlinienobjekt verknüpfen**).
6. **DC01**: Ebenso **MSFT Windows Server 2022 – Domain Controller** in eine GPO `MS-Baseline-DC` importieren und mit **Domain Controllers** verknüpfen; **Domain Security** in die **Domänen-GPO**.
7. **SRV01**: `gpupdate /force`, **Neustart** → **Lokale Sicherheitsrichtlinie**/`gpresult /r` prüfen.
8. **ADMIN-PC**: **Policy Analyzer** starten → **Add** → **Policy Rules** (GPO-Backup-Ordner) → **Import** → **View/Compare** → **Compare to Effective State** → Abweichungen ansehen; als Excel exportieren.

### PowerShell
```powershell
# Auf DC01 – Baseline-GPOs per Skript importieren
cd "\\DC01\Freigaben\SCT\Windows Server-2022-Security-Baseline\Scripts"
Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned
.\Baseline-ADImport.ps1

# Auf DC01 – GPO manuell importieren
Import-GPO -BackupGpoName "MSFT Windows Server 2022 - Member Server" -Path "\\DC01\Freigaben\SCT\...\GPOs" `
  -TargetName "MS-Baseline-MemberServer" -CreateIfNeeded
Get-GPO -Name "MS-Baseline-MemberServer" | New-GPLink -Target "OU=Server,DC=example,DC=com" -LinkEnabled Yes

# Auf SRV01 – Workgroup/lokal
.\Baseline-LocalInstall.ps1 -WS2022NonDomainJoined
LGPO.exe /g "C:\Baseline\GPOs\{GUID}"

# Ergebnis prüfen
gpresult /h C:\gp.html
Get-GPResultantSetOfPolicy -Computer SRV01 -ReportType Html -Path C:\rsop.html
secedit /export /cfg C:\secpol.inf
```

## Einfach

Eine **Baseline** ist wie ein **Bauplan für ein sicheres Haus**, den **Microsoft** schon geprüft hat: „Türen mit gutem Schloss, Fenster mit Gitter, Alarmanlage an.“ Du musst **nicht** selbst überlegen, **welche der tausend Einstellungen** wichtig sind – du **übernimmst** den **fertigen Plan**.

**Wie kommt der Plan an?**
- **Toolkit herunterladen** (Microsoft-Paket).
- Darin liegen **fertige Gruppenrichtlinien** – du **importierst** sie in deine Domäne wie **Kopien**.
- **Getrennt** für **Domänencontroller** (strenger!) und **normale Server**.

**Policy Analyzer** = **Vergleichsbrille**: Er zeigt dir „Deine Einstellung sagt **A**, die Baseline sagt **B**“, damit du **vor** dem Einschalten siehst, was **kaputtgehen** könnte.

**Wichtig**: Die **fertigen GPOs nicht selbst umbauen**. Eigene Änderungen kommen in eine **zweite GPO**, die **danach** angewendet wird.

**In Azure**: **Machine Configuration** prüft **automatisch**, ob **Server** dem **Plan** entsprechen (grün/rot) – wie ein **TÜV** für Konfigurationen.

## Merksatz
- **Baseline** = **empfohlene Sicherheitseinstellungen** von Microsoft, **pro Windows-Version**.
- **SCT** = **Baselines + Policy Analyzer + LGPO**.
- **Import** über **GPMC → Einstellungen importieren** oder **`Baseline-ADImport.ps1`**.
- **Getrennte GPOs** für **DC**, **Mitgliedsserver**, **Domäne**.
- **Eigene Änderungen** in **eigener GPO**.
- **Kontrolle** in Azure per **Machine Configuration** / **Defender for Cloud**.

## Prüfungsfalle
- **DC-Baseline** an **Domain Controllers-OU**, **nicht** auf Mitgliedsserver.
- **Baseline-GPO** nicht **direkt verändern** (Updates überschreiben sie).
- **Policy Analyzer** vergleicht **Einstellungen**, er **wendet keine an**.
- **Domain-Security-Baseline** wirkt **domänenweit** (Kennwort/Kerberos), **nicht OU-weise** (Kennwortrichtlinie der Domäne gilt nur auf **Domänenebene**).
- **Intune-Baselines** gelten für **Intune-verwaltete** Geräte, **nicht** für **GPO-Server**.
- **Azure Policy Machine Configuration** **prüft** standardmäßig nur (**Audit**) – **AuditIfNotExists**; **Erzwingen** nur bei **DeployIfNotExists/Apply**.
- **LGPO.exe** ist für **lokale** Richtlinien (Workgroup), **nicht** für die Domäne.

## Grafik
### Bauplan
Ein Bauplan (Baseline) wird als Kopie in drei Häuser gelegt: Domäne, DC, Mitgliedsserver; jedes Haus bekommt nur seinen passenden Teil.

### Brille
Policy Analyzer als Brille: links Baseline-Werte, rechts aktuelle Werte, Abweichungen leuchten rot.

### TÜV
Server fährt durch eine Prüfstraße (Machine Configuration), Ampel zeigt konform (grün) oder nicht konform (rot).

## Karteikarten
- F: Was ist eine Sicherheits-Baseline? | A: Von Microsoft empfohlene Sammlung sicherheitsrelevanter Einstellungen pro Windows-Version.
- F: Wie heißt das Microsoft-Werkzeugpaket dazu? | A: Security Compliance Toolkit (SCT).
- F: Wofür dient der Policy Analyzer? | A: Vergleicht GPOs/Einstellungen miteinander oder mit dem aktuellen Zustand.
- F: Wofür dient LGPO.exe? | A: Import/Export lokaler Gruppenrichtlinien (z. B. Workgroup-Server).
- F: Wie importiert man eine Baseline-GPO? | A: GPMC → Einstellungen importieren oder Baseline-ADImport.ps1.
- F: Welche Baselines gibt es für Server? | A: Domänencontroller, Mitgliedsserver, Domänensicherheit.
- F: Wo verknüpft man die DC-Baseline? | A: Mit der OU Domain Controllers.
- F: Wo prüft man die Konformität in Azure? | A: Azure Policy Machine Configuration / Defender for Cloud.
- F: Wo pflegt man eigene Abweichungen von der Baseline? | A: In einer separaten GPO, nicht in der Baseline-GPO.
- F: Alternative Werkzeuge älter als SCT? | A: Security Configuration Wizard, Sicherheitsvorlagen (.inf), secedit.
- F: Wie prüft man das Ergebnis lokal? | A: gpresult /h oder Get-GPResultantSetOfPolicy.

## Quiz
? Eine neue Windows-Server-2022-Umgebung soll nach Microsoft-Empfehlung gehärtet werden. Was wird eingesetzt?
* Security Compliance Toolkit mit den Baseline-GPOs
- Exploit Protection
- BitLocker
- BranchCache

? Vor dem Produktiveinsatz soll geprüft werden, in welchen Einstellungen die vorhandenen GPOs von der Baseline abweichen. Werkzeug?
* Policy Analyzer
- LGPO.exe
- Set-GPRegistryValue
- Server Manager

? Ein Workgroup-Server soll die Baseline erhalten. Welches Tool?
* LGPO.exe bzw. Baseline-LocalInstall.ps1
- Import in GPMC
- Baseline-ADImport.ps1
- Azure Policy

? Baseline für Domänencontroller wird auf alle Mitgliedsserver angewendet. Problem?
* Zu restriktive Einstellungen; DC-Baseline gehört nur auf die Domain-Controllers-OU
- Kein Problem
- GPO wird automatisch ignoriert
- Nur ein Neustart nötig

? Azure-Arc-Server sollen automatisch auf Baseline-Konformität geprüft werden. Dienst?
* Azure Policy Machine Configuration
- Azure Site Recovery
- Azure Backup
- Azure Migrate

? Ein Administrator ändert die importierte Baseline-GPO direkt. Nach dem nächsten Baseline-Update fehlen die Änderungen. Best Practice?
* Eigene Änderungen in einer separaten GPO ablegen
- Änderungen im Policy Analyzer speichern
- Baseline nicht aktualisieren
- LGPO.exe verwenden
