---
id: az800-freigaben
bereich: AZ-800
block: A7
kapitel: Storage & Dateidienste
titel: Freigabe- und NTFS-Berechtigungen, SMB-Sicherheit & Azure-Files-Berechtigungen
stufe: Fortgeschritten
quellen: [AZ-800 Study Guide, Microsoft Learn, Uebungen Freigaben/NTFS]
verweise: [ap1-a6-freigaben, ap1-a6-ntfs, ap1-a6-gruppen, az800-fsrm, az800-azure-file-sync]
---

## Profi

### Zwei Ebenen
| | **Freigabeberechtigungen** (*Share*) | **NTFS-Berechtigungen** |
|---|---|---|
| Wirkt | nur bei Zugriff **über das Netzwerk** (SMB) | **immer** (lokal und Netzwerk) |
| Stufen | **Lesen**, **Ändern**, **Vollzugriff** | Vollzugriff, Ändern, Lesen/Ausführen, Ordnerinhalt anzeigen, Lesen, Schreiben + **spezielle** Berechtigungen |
| Granularität | ganze Freigabe | jede Datei/jeder Ordner, **Vererbung** |
| Standard bei neuer Freigabe (GUI „Erweiterte Freigabe“) | **Jeder: Lesen** | geerbt vom übergeordneten Ordner |
**Effektive Berechtigung über das Netzwerk** = die **restriktivere** der beiden Ebenen (Schnittmenge). Innerhalb einer Ebene: Berechtigungen **addieren** sich über Gruppen; **explizites Verweigern** schlägt Zulassen (explizit > geerbt: explizites Zulassen schlägt **geerbtes** Verweigern).

**Best Practice** (Microsoft): Freigabe → **Authentifizierte Benutzer** (oder Jeder) **Vollzugriff** / bzw. Ändern; Feinsteuerung ausschließlich per **NTFS**. Gruppenstrategie **AGDLP** (Konten → Globale Gruppen → Domänenlokale Gruppen → Berechtigung).

### Weitere Freigabeeinstellungen (Server-Manager → Datei-/Speicherdienste → Freigaben)
| Einstellung | Wirkung |
|---|---|
| **Zugriffsbasierte Aufzählung** (*ABE*) | Benutzer sehen nur Ordner/Dateien, auf die sie Leserecht haben |
| **Zwischenspeicherung / Offlinedateien** (*Caching*) | Keine / Manuell / Alle Dateien automatisch; relevant für **BranchCache** („BranchCache aktivieren“ an der Freigabe) |
| **Datenzugriff verschlüsseln** (*SMB Encryption*) | SMB-3-Verschlüsselung (AES-128/256-GCM) pro Freigabe oder Server; Clients ohne SMB 3 werden abgewiesen (außer `RejectUnencryptedAccess = $false`) |
| **Fortlaufende Verfügbarkeit** (*Continuous Availability*) | transparentes Failover bei **Clusterfreigaben** (SOFS, Hyper-V/SQL über SMB) |
| **Kontingent**/**Dateiprüfung** | über FSRM (eigene Seite) |
| **Profile** | SMB-Freigabe – Schnell / Erweitert (mit FSRM-Funktionen: Ordnerbesitzer, Klassifizierung) / Anwendungen; NFS-Freigabe |

### SMB-Protokoll – Stand
| Version | Hinweis |
|---|---|
| **SMB 1** | **unsicher** (WannaCry), standardmäßig **nicht installiert** (Windows Server 2019+) → deaktiviert lassen |
| **SMB 2.x/3.0** | Signierung, Multichannel, Direct (RDMA), Verschlüsselung |
| **SMB 3.1.1** | Pre-Auth-Integrität, AES-GCM, **SMB over QUIC** (UDP 443, Zugriff ohne VPN; Server 2022 Azure Edition, ab Server 2025 in allen Editionen) |
- **SMB-Signierung**: in Windows 11 24H2/Server 2025 für **ausgehende** Verbindungen standardmäßig **erforderlich** (eingehend auf DCs schon lange Pflicht).
- Firewall: SMB = **TCP 445**.

### Berechtigungen auf Azure Files
| Ebene | Umsetzung |
|---|---|
| **Freigabeebene** | **Azure-RBAC**-Rollen: *Speicherdateidaten-SMB-Freigabeleser*, *-Mitwirkender*, *-Mitwirkender mit erhöhten Rechten* (ändert NTFS-ACLs); oder **Standardberechtigung auf Freigabeebene** für alle authentifizierten Identitäten |
| **Verzeichnis-/Dateiebene** | klassische **NTFS-ACLs** (Windows-Explorer, `icacls`) |
| **Identitätsquelle** | **AD DS** (Speicherkonto als Computerkonto in AD, Modul **AzFilesHybrid**), **Microsoft Entra Domain Services** oder **Microsoft Entra Kerberos** (hybride Identitäten) |
| **Speicherkontoschlüssel** | Superuser-Zugriff (nur Administration, nicht für Benutzer) |
Für RBAC müssen Identitäten in Entra ID **synchronisiert** sein (Entra Connect), da die Rollen Entra-Objekten zugewiesen werden.

### Werkzeuge
`Get-SmbShare`, `New-SmbShare`, `Grant-SmbShareAccess`, `Get-SmbShareAccess`, `Set-SmbShare -FolderEnumerationMode AccessBased -EncryptData $true`, `icacls`, `Get-Acl`/`Set-Acl`, Registerkarte **Effektiver Zugriff** (erweiterte Sicherheitseinstellungen).

## Lab
**Maschinen**: **DC01** (example.com), **FS01** (Dateiserver, Laufwerk E:), **CL01** (Windows 11), Azure-Speicherkonto **stnetzilon** mit Dateifreigabe `projekte`.

### GUI
1. **DC01**: Globale Gruppe `GG-Vertrieb` (Mitglied `lea`), domänenlokale Gruppen `DL-Vertrieb-Lesen`, `DL-Vertrieb-Aendern` → GG-Vertrieb Mitglied von DL-Vertrieb-Aendern.
2. **FS01**: Server-Manager → Datei-/Speicherdienste → Freigaben → **Neue Freigabe** → **SMB-Freigabe – Schnell** → Pfad `E:\Vertrieb` → **Zugriffsbasierte Aufzählung aktivieren**, **Datenzugriff verschlüsseln** → Berechtigungen anpassen: Freigabe **Authentifizierte Benutzer: Vollzugriff**; NTFS: Vererbung deaktivieren (kopieren) → „Benutzer“ entfernen → **DL-Vertrieb-Aendern: Ändern**, **DL-Vertrieb-Lesen: Lesen**.
3. **FS01**: `E:\Vertrieb\Geheim` anlegen → NTFS nur für Administratoren.
4. **CL01** als `lea`: `\\FS01\Vertrieb` → Ordner „Geheim“ **nicht sichtbar** (ABE).
5. **FS01**: `E:\Vertrieb` → Eigenschaften → Sicherheit → Erweitert → **Effektiver Zugriff** → Benutzer `lea` → Ergebnis ansehen.
6. **FS01**: Freigabeberechtigung testweise auf **Jeder: Lesen** → **CL01** als lea: Speichern schlägt fehl (restriktivere Ebene gewinnt) → zurücksetzen.
7. Azure: Portal → Speicherkonto → Dateifreigaben → `projekte` → **Zugriffssteuerung (IAM)** → Rolle **Speicherdateidaten-SMB-Freigabemitwirkender** für synchronisierte Gruppe `GG-Vertrieb`.

### PowerShell
```powershell
# Auf FS01 – Freigabe mit ABE und Verschlüsselung
New-Item -Path E:\Vertrieb -ItemType Directory
New-SmbShare -Name Vertrieb -Path E:\Vertrieb -FullAccess "EXAMPLE\Authentifizierte Benutzer" -FolderEnumerationMode AccessBased -EncryptData $true
Get-SmbShareAccess -Name Vertrieb
Set-SmbShare -Name Vertrieb -CachingMode None -Force

# Auf FS01 – NTFS-Berechtigungen
icacls E:\Vertrieb /inheritance:d
icacls E:\Vertrieb /remove "VORDEFINIERT\Benutzer"
icacls E:\Vertrieb /grant "EXAMPLE\DL-Vertrieb-Aendern:(OI)(CI)M" "EXAMPLE\DL-Vertrieb-Lesen:(OI)(CI)RX"
icacls E:\Vertrieb

# Auf FS01 – SMB-Sicherheit
Get-SmbServerConfiguration | Select-Object EnableSMB1Protocol,EncryptData,RequireSecuritySignature
Set-SmbServerConfiguration -EnableSMB1Protocol $false -Force
Get-WindowsFeature FS-SMB1

# Auf CL01 – Verbindungen prüfen
Get-SmbConnection | Select-Object ServerName,ShareName,Dialect,Encrypted

# Auf dem Admin-PC – Azure-Files-RBAC
Connect-AzAccount
$sa = Get-AzStorageAccount -ResourceGroupName RG-Netzilon -Name stnetzilon
$scope = "$($sa.Id)/fileServices/default/fileshares/projekte"
New-AzRoleAssignment -ObjectId (Get-AzADGroup -DisplayName GG-Vertrieb).Id -RoleDefinitionName "Storage File Data SMB Share Contributor" -Scope $scope
```

## Einfach

Zu einem Ordner auf dem Server führen **zwei Türen hintereinander**:
1. **Freigabe-Tür** = die Tür zum **Gebäude über das Netzwerk**. Wer lokal am Server sitzt, braucht sie nicht.
2. **NTFS-Tür** = die Tür zum **Zimmer** selbst. Die gilt **immer**.

Kommst du übers Netzwerk, musst du durch **beide** Türen. Es zählt immer die **strengere** Tür: Darfst du an der ersten Tür nur **gucken** (Lesen), hilft dir das **Ändern** an der zweiten Tür nichts.

**Trick der Profis**: Die Gebäudetür (Freigabe) für alle angemeldeten Mitarbeiter **weit aufmachen**, und die **Zimmertüren (NTFS)** genau einstellen. Dann muss man nur an **einer** Stelle nachdenken.

**Verweigern** ist wie ein **rotes Schild**: Es schlägt jedes grüne „Erlaubt“ – außer das Erlaubt steht direkt am Zimmer und das Verbot wurde nur „vererbt“.

**Zugriffsbasierte Aufzählung** = Zimmer, in die du nicht darfst, **siehst du gar nicht** erst im Flur.

**SMB 1** = uraltes, **löchriges Schloss** – ausbauen! **SMB-Verschlüsselung** = Gespräche im Flur kann niemand mithören.

**Azure Files**: Die Gebäudetür wird dort über **Azure-Rollen** gesteuert, die Zimmertüren weiterhin mit **NTFS** wie gewohnt.

## Merksatz
- Netzwerkzugriff = **Freigabe ∩ NTFS** → **restriktiver gewinnt**.
- Lokal zählt **nur NTFS**.
- Innerhalb einer Ebene: **addieren**, **Verweigern** gewinnt (explizit > geerbt).
- Best Practice: Freigabe **offen**, **NTFS** fein, **AGDLP**.
- **ABE** = unsichtbar, was man nicht lesen darf.
- **SMB 1 aus**, SMB-Verschlüsselung/Signierung an.
- Azure Files: **RBAC** (Freigabe) + **NTFS** (Ordner).

## Prüfungsfalle
- Freigabe „Jeder: Lesen“ (Standard der erweiterten Freigabe) verhindert Schreiben trotz NTFS-Ändern.
- Freigabeberechtigungen wirken nicht bei lokaler Anmeldung/RDP.
- Explizites Zulassen schlägt geerbtes Verweigern.
- SMB-Verschlüsselung weist Clients ohne SMB 3 ab.
- Azure-Files-RBAC funktioniert nur mit in Entra ID synchronisierten Identitäten.
- NTFS-ACLs auf Azure Files ändern erfordert „mit erhöhten Rechten“-Rolle oder Speicherkontoschlüssel.

## Grafik
### Zwei Türen
Benutzer läuft übers Netzwerk: Gebäudetür (Freigabe: Lesen, grün-gelb) → Zimmertür (NTFS: Ändern, grün) → am Ende leuchtet nur „Lesen“, weil die Gebäudetür strenger war. Admin am Server selbst geht direkt zur Zimmertür.

### Unsichtbare Zimmer
Flur mit fünf Türen; mit ABE verschwinden zwei Türen für lea, für den Admin sind alle sichtbar.

### Rotes Schild
Mehrere grüne Schilder (Gruppen) addieren sich; ein rotes „Verweigert“ überdeckt alles; ein explizites grünes Schild direkt an der Tür schlägt ein geerbtes rotes Schild vom Flur.

## Karteikarten
- F: Wann wirken Freigabeberechtigungen? | A: Nur beim Zugriff über das Netzwerk.
- F: Wie ergibt sich die effektive Berechtigung übers Netzwerk? | A: Die restriktivere von Freigabe- und NTFS-Berechtigung.
- F: Drei Freigabeberechtigungsstufen? | A: Lesen, Ändern, Vollzugriff.
- F: Standardfreigabeberechtigung bei erweiterter Freigabe? | A: Jeder: Lesen.
- F: Was bewirkt zugriffsbasierte Aufzählung? | A: Benutzer sehen nur Elemente, auf die sie Leserecht haben.
- F: Was gewinnt: explizites Zulassen oder geerbtes Verweigern? | A: Explizites Zulassen.
- F: Warum SMB 1 deaktivieren? | A: Unsicher (z. B. WannaCry), veraltet.
- F: Port von SMB? | A: TCP 445.
- F: Wie werden Freigabeberechtigungen in Azure Files vergeben? | A: Über Azure-RBAC-Rollen (Storage File Data SMB Share …).
- F: Welche Identitätsquellen unterstützt Azure Files für SMB? | A: AD DS, Entra Domain Services, Entra Kerberos.
- F: Cmdlet für Freigabe mit ABE? | A: New-SmbShare … -FolderEnumerationMode AccessBased
- F: Was ist SMB over QUIC? | A: SMB über UDP 443 (TLS 1.3), Zugriff ohne VPN.

## Quiz
? Freigabe: Jeder – Lesen; NTFS: GG-Vertrieb – Ändern. Was darf lea (GG-Vertrieb) über das Netzwerk?
* Lesen
- Ändern
- Vollzugriff
- Nichts

? Benutzer sollen in einer Freigabe nur Ordner sehen, auf die sie Zugriff haben. Einstellung?
* Zugriffsbasierte Aufzählung
- Offlinedateien
- Fortlaufende Verfügbarkeit
- SMB-Verschlüsselung

? Ein Administrator meldet sich lokal am Dateiserver an. Welche Berechtigungen gelten?
* Nur NTFS-Berechtigungen
- Nur Freigabeberechtigungen
- Die restriktivere beider Ebenen
- Keine, Administratoren haben immer Vollzugriff

? Welche Rolle vergibt Schreibzugriff auf Freigabeebene für Azure Files?
* Speicherdateidaten-SMB-Freigabemitwirkender
- Speicherkontomitwirkender
- Leser
- Speicherdateidaten-SMB-Freigabeleser

? Welche Berechtigungsstrategie empfiehlt Microsoft für Dateiserver?
* Freigabe weit öffnen, Feinsteuerung über NTFS mit Gruppen (AGDLP)
- Nur Freigabeberechtigungen, NTFS auf Jeder: Vollzugriff
- Benutzerkonten direkt berechtigen
- Überall explizites Verweigern setzen

? Welche SMB-Funktion verschlüsselt den Datenverkehr zu einer Freigabe Ende-zu-Ende?
* SMB-Verschlüsselung (ab SMB 3.0)
- SMB 1.0
- NetBIOS
- Zugriffsbasierte Aufzählung
! Aktivierbar je Freigabe oder serverweit (Set-SmbShare -EncryptData $true).

? Welches Cmdlet erstellt eine SMB-Freigabe?
* New-SmbShare
- New-Item -Share
- Set-Acl -Share
- Add-SmbMapping -Server
! Beispiel: New-SmbShare -Name Daten -Path D:\Daten -ChangeAccess 'EXAMPLE\DL-Daten-Aendern'.

? Welche Rechte gelten bei einem lokalen Zugriff am Dateiserver?
* Nur die NTFS-Berechtigungen
- Nur die Freigabeberechtigungen
- Die restriktivere von beiden
- Keine
! Freigabeberechtigungen wirken nur beim Zugriff über das Netzwerk.
