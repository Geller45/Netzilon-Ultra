---
id: az801-azure-files
bereich: AZ-801
block: A10
kapitel: Migration
titel: Azure Files
stufe: Profi
quellen: [AZ-801 Study Guide, Microsoft Learn]
verweise: [az801-sms, az800-azure-file-sync, az801-azure-backup]
---

## Profi

### Idee
**Azure Files** **stellt** **vollständig verwaltete Dateifreigaben** **in der Cloud** **bereit**, **erreichbar** **per SMS** (**SMB 2.1/3.x**), **NFS 4.1** (**nur Premium**) **oder** **REST**. **Sie** **liegen** **in** **einem** **Speicherkonto** (*Storage Account*).

### Zugriffsadresse
**`\\<Speicherkonto>.file.core.windows.net\<Freigabe>`**

### Speicherebenen (Tiers)
| Ebene | Speicher | Einsatz |
|---|---|---|
| **Premium** | **SSD** | **Latenzkritisch**, **Datenbanken**, **NFS** |
| **Transaktionsoptimiert** (*Transaction optimized*) | **HDD** | **Viele Transaktionen**, **Standard** |
| **Heiß** (*Hot*) | **HDD** | **Allgemeine Dateifreigabe** |
| **Kalt** (*Cool*) | **HDD** | **Archiv-nah**, **seltener Zugriff** |

### Redundanz
| Kürzel | Bedeutung |
|---|---|
| **LRS** | **Lokal redundant** (**3 Kopien im Rechenzentrum**) |
| **ZRS** | **Zonenredundant** (**3 Zonen**) |
| **GRS** | **Georedundant** (**zweite Region**, **nur Standard**) |
| **GZRS** | **Geo + Zonen** |

### Authentifizierung
| Methode | Erklärung |
|---|---|
| **Speicherkontoschlüssel** | **Voller Zugriff**, **nur für Tests/Admin** |
| **SAS-Token** | **Zeitlich/rechtlich begrenzt** |
| **AD DS** | **On-Premises-AD** **Kerberos** (**Modul AzFilesHybrid**, `Join-AzStorageAccount`) |
| **Microsoft Entra Domain Services** | **Verwaltete Domäne** |
| **Microsoft Entra Kerberos** | **Hybrid-Identitäten** **(Benutzer aus Entra Connect)** |

**Berechtigungsebenen**: **Freigabe-Ebene** (**Azure RBAC**: **Storage File Data SMB Share Reader/Contributor/Elevated Contributor**) **plus** **NTFS-Ebene** (**Windows-ACLs**).

### Netzwerk
- **SMB benötigt** **TCP 445**. **Viele Internetanbieter** **blockieren 445**.
- **Lösungen**: **VPN (S2S/P2S)**, **ExpressRoute**, **Privater Endpunkt** (*Private Endpoint*), **SMB over QUIC** (**Azure Files, TCP 443**), **Azure File Sync**.
- **Speicherkonto-Firewall**: **Zugriff** **aus VNets/IP-Bereichen** **einschränken**.

### Sicherheit und Schutz
| Funktion | Erklärung |
|---|---|
| **Freigabe-Momentaufnahmen** (*Share Snapshots*) | **Nur lesbare Punktkopien**, **inkrementell** |
| **Soft Delete** | **Gelöschte Freigaben** **7 Tage** **wiederherstellbar** (**einstellbar**) |
| **Azure Backup** | **Zeitplan**, **Aufbewahrung**, **Tresor** |
| **Verschlüsselung** | **At Rest (AES-256)**, **In Transit (SMB 3.x)** |
| **Große Freigaben** | **bis 100 TiB** **(bei aktivierter Option)** |

### Migration
- **Robocopy** **oder** **AzCopy** **für Einzeldateien**.
- **Azure File Sync** **für Hybrid** **(Cloud-Endpunkt + Server-Endpunkt)**.
- **Storage Migration Service** **→ Azure-Ziel** **(Azure Files** **über Azure File Sync)**.
- **Azure Data Box** **bei riesigen Datenmengen**.

### PowerShell
```powershell
# Auf Admin-PC – Speicherkonto und Freigabe
New-AzStorageAccount -ResourceGroupName rg-files -Name stfiles2026 -Location westeurope -SkuName Standard_ZRS -Kind StorageV2
$sa = Get-AzStorageAccount -ResourceGroupName rg-files -Name stfiles2026
New-AzRmStorageShare -ResourceGroupName rg-files -StorageAccountName stfiles2026 -Name daten -QuotaGiB 1024

# Auf SRV01 – Port testen und einbinden
Test-NetConnection -ComputerName stfiles2026.file.core.windows.net -Port 445
$key = (Get-AzStorageAccountKey -ResourceGroupName rg-files -Name stfiles2026)[0].Value
cmd.exe /C "cmdkey /add:stfiles2026.file.core.windows.net /user:localhost\stfiles2026 /pass:$key"
New-PSDrive -Name Z -PSProvider FileSystem -Root "\\stfiles2026.file.core.windows.net\daten" -Persist

# AD-DS-Authentifizierung aktivieren (Modul AzFilesHybrid, auf Domänen-PC)
Join-AzStorageAccount -ResourceGroupName rg-files -StorageAccountName stfiles2026 -DomainAccountType ComputerAccount -OrganizationalUnitDistinguishedName "OU=Server,DC=exa,DC=local"
```

## Lab
**Maschinen**: **Azure-Abo**, **SRV01** (**Windows Server 2022**), **DC01**.

### GUI
1. **Azure-Portal**: **Speicherkonten → Erstellen** → **Name stfiles2026**, **Redundanz ZRS**, **Leistung Standard** → **Erstellen**.
2. **Azure-Portal**: **stfiles2026 → Datenspeicher → Dateifreigaben → + Dateifreigabe** → **Name daten**, **Ebene Transaktionsoptimiert** → **Erstellen**.
3. **Azure-Portal**: **daten → Verbinden → Windows** → **Skript kopieren**.
4. **SRV01**: **PowerShell (Administrator)** → **Skript einfügen** → **Laufwerk Z:** **erscheint**.
5. **SRV01**: **Test-NetConnection … -Port 445** **prüfen**.
6. **Azure-Portal**: **daten → Momentaufnahmen → Momentaufnahme hinzufügen**.
7. **Azure-Portal**: **stfiles2026 → Dateifreigaben → Freigabeeinstellungen → Soft Delete aktivieren (7 Tage)**.

## Einfach

**Azure Files** ist **wie ein gemeinsamer Ordner im Netz**, **aber** **er** **steht nicht im Keller** **deiner Firma**, **sondern** **bei Microsoft**. **Du** **verbindest** **dich** **damit** **wie mit** **jedem anderen** **Netzlaufwerk** (**Z:**).

**Warum manchmal Probleme?** **Der Weg zum Ordner** **(Tür 445)** **ist** **bei manchen Internetanbietern** **zugesperrt**. **Dann** **brauchst** **du** **einen** **privaten Tunnel** (**VPN**) **oder** **eine** **andere Tür** (**QUIC/443**).

**Schutz**: **Snapshots** **sind** **Fotos** **des Ordners**, **Soft Delete** **ist** **der** **Papierkorb** **(7 Tage)**.

## Merksatz
- **Azure Files = SMB/NFS/REST als Dienst**.
- **Port 445** **ist** **das Nadelöhr**.
- **Freigabe-RBAC + NTFS**.
- **Premium = SSD + NFS**.
- **GRS** **nur bei Standard**.
- **Snapshots + Soft Delete + Backup** **= Schutz**.
- **Azure File Sync** **= Cloud + lokaler Cache**.

## Prüfungsfalle
- **Port 445** **oft** **vom ISP** **blockiert**.
- **NFS** **nur bei Premium**.
- **Speicherkontoschlüssel** **≠** **empfohlene** **Zugriffsart**.
- **AD-DS-Auth** **braucht** **Kerberos-Sichtbarkeit** **auf einen DC**.
- **Freigabe-Rechte** **und** **NTFS-Rechte** **sind** **zwei Ebenen**.
- **GRS** **gibt es nicht** **für Premium**.
- **Snapshots** **sind** **nicht** **Backup** **(im selben Konto)**.

## Grafik
### Netzlaufwerk in der Wolke
Laufwerk Z: zeigt über einen Tunnel in die Wolke. Tür 445 ist geschlossen, der VPN-Tunnel öffnet sie.

### Vier Ebenen
Premium (schnell), Optimiert, Heiß, Kalt: Treppe von schnell und teuer nach langsam und billig.

### Zwei Schlüsselsysteme
Freigabeschloss (RBAC) und Türschloss (NTFS) hintereinander.

## Karteikarten
- F: Wie lautet die UNC-Adresse einer Azure-Freigabe? | A: \\Konto.file.core.windows.net\Freigabe.
- F: Welche Protokolle unterstützt Azure Files? | A: SMB, NFS (Premium) und REST.
- F: Welcher Port ist für SMB nötig? | A: TCP 445.
- F: Welche Speicherebene unterstützt NFS? | A: Premium.
- F: Was schützt vor versehentlichem Löschen der Freigabe? | A: Soft Delete.
- F: Was sind Freigabe-Momentaufnahmen? | A: Schreibgeschützte Punktkopien der Freigabe.
- F: Wie authentifiziert man mit lokalem AD? | A: AD DS Kerberos via Join-AzStorageAccount.
- F: Welche zwei Berechtigungsebenen? | A: Freigabe (Azure RBAC) und NTFS.
- F: Welche Alternative gibt es bei blockiertem Port 445? | A: VPN, ExpressRoute, Private Endpoint oder SMB over QUIC.
- F: Welches Werkzeug bei sehr großen Datenmengen? | A: Azure Data Box.

## Quiz
? Welche Speicherebene unterstützt NFS-Freigaben?
* Premium
- Heiß
- Kalt
- Transaktionsoptimiert

? Ein Client im Heimnetz erreicht die Azure-Freigabe nicht, alle Firewalls sind offen. Häufigste Ursache?
* Port 445 wird vom Internetanbieter blockiert
- Speicherkonto ist zu groß
- Freigabe ist auf ZRS
- SMB 3 ist deaktiviert

? Wie lautet die Zugriffsadresse?
* \\Konto.file.core.windows.net\Freigabe
- https://Konto.blob.core.windows.net
- \\Freigabe\Konto.azure
- smb://Konto

? Welches Modul dient zur AD-DS-Integration von Azure Files?
* AzFilesHybrid
- MSOnlineBackup
- ADMT
- ServerManager

? Welche Funktion schützt eine gelöschte Freigabe?
* Soft Delete
- Trusted Launch
- MABS
- FSRM

? Welche Redundanz gibt es nicht bei Premium-Freigaben?
* GRS
- LRS
- ZRS
- Keine davon

? Welchen Port nutzt der Zugriff auf Azure Files per SMB?
* TCP 445
- TCP 443
- UDP 53
- TCP 3389
! Viele Internetanbieter blockieren Port 445; Abhilfe VPN, ExpressRoute oder Azure File Sync.

? Welche Identitätsquellen unterstützt Azure Files für die SMB-Authentifizierung?
* AD DS, Entra Domain Services und Entra Kerberos (für hybride Identitäten)
- Nur lokale Konten des Speicherkontos
- Nur Gastzugang
- Keine Authentifizierung möglich
! Freigabeberechtigungen per Azure RBAC, NTFS-Rechte wie gewohnt.

