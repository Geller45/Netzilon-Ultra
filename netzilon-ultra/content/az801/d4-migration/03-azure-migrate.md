---
id: az801-azure-migrate
bereich: AZ-801
block: A10
kapitel: Migration
titel: Azure Migrate
stufe: Profi
quellen: [AZ-801 Study Guide, Microsoft Learn]
verweise: [az801-asr, az801-migration-serverrollen, az800-azure-vms, az801-iis-webapps-container]
---

## Profi

### Zweck
**Azure Migrate** **ist** **die zentrale Anlaufstelle** **(Hub)** **im Azure-Portal**, **um** **Server, Datenbanken, Web-Apps und VDI** **zu erfassen, zu bewerten und nach Azure zu migrieren**.

### Werkzeuge im Hub
| Werkzeug | Aufgabe |
|---|---|
| **Discovery und Assessment** (*Discovery & assessment*) | **Erkennen** **und Bewerten** **(Eignung, Größe, Kosten)** |
| **Migration und Modernisierung** (*Migration and modernization*) | **Server** **replizieren** **und migrieren** |
| **Datenbankmigration** (*Azure Database Migration Service*) | **SQL** **usw.** **nach Azure SQL** |
| **Web App Migration Assistant** | **IIS-Webseiten** **nach App Service** |
| **Azure Data Box** | **Offline-Transport** **großer Datenmengen** |

### Schritte
1. **Azure-Migrate-Projekt** **erstellen** **(Region = Metadatenspeicher)**.
2. **Appliance** **bereitstellen** **(Discovery)**.
3. **Erfassen** (*Discovery*): **Server, Konfiguration, Leistung, Abhängigkeiten**.
4. **Bewerten** (*Assessment*): **Azure-Eignung**, **VM-Größe**, **Kosten**.
5. **Replizieren** (*Replication*).
6. **Testmigration** (**in isoliertes VNet**).
7. **Migration** (**Failover**, **kurze Ausfallzeit**).
8. **Bereinigen** **und** **Validierung**.

### Appliance
| Quelle | Bereitstellung |
|---|---|
| **VMware** | **OVA-Vorlage** **(agentenlos, über vCenter)** |
| **Hyper-V** | **VHD** **(Appliance-VM)**; **Replikation** **über** **Azure Site Recovery-Provider** **auf den Hosts** |
| **Physisch/Andere Clouds** | **PowerShell-Installationsskript** **(Windows Server 2022)** |

**Ports**: **ausgehend** **HTTPS 443** **zu Azure**. **Interne Erfassung** **über** **WinRM**, **vCenter**, **WMI**. **Keine** **Installation** **auf** **Zielservern** **nötig** **(agentenlos)**. **Abhängigkeitsanalyse** **agentenlos** **oder** **mit Agent**.

### Bewertungsarten (Sizing-Kriterien)
| Kriterium | Erklärung |
|---|---|
| **Leistungsbasiert** (*Performance-based*) | **Größe** **nach gemessener Last** (**Kosten sparen**) |
| **Wie lokal** (*As on-premises*) | **Größe** **wie** **vorhandene Konfiguration** |

**Ergebnisse**: **Bereit / Bereit mit Bedingungen / Nicht bereit**, **empfohlene VM-Größe**, **monatliche Kosten**, **Speichertyp**. **Optionen**: **Reserved Instances**, **Hybrid Benefit**.

### Migrationswege
| Quelle | Methode |
|---|---|
| **VMware** | **Agentenlos** **oder** **agentenbasiert** |
| **Hyper-V** | **Replikationsanbieter** **auf Hosts** **→ Azure** |
| **Physisch/AWS/GCP** | **Agentenbasiert** **(Mobilitätsdienst)** |

### Vergleich mit ASR
| Merkmal | **Azure Migrate** | **Azure Site Recovery** |
|---|---|---|
| **Ziel** | **Einmalige Migration** | **Dauerhafte Notfallreplikation** |
| **Ergebnis** | **VM läuft in Azure** | **VM läuft bei Notfall** |
| **Technik** | **Ähnlich (Replikation)** | **Ähnlich** |

### PowerShell (Auswahl)
```powershell
# Auf Admin-PC – Projekt/Ressourcen anlegen und prüfen
Get-AzResourceGroup -Name rg-migrate
New-AzResourceGroup -Name rg-migrate -Location westeurope
# Migrate-Projekt wird im Portal erstellt; Replikation per Az.Migrate
Get-AzMigrateDiscoveredServer -ProjectName proj-migrate -ResourceGroupName rg-migrate
Initialize-AzMigrateReplicationInfrastructure -ResourceGroupName rg-migrate -ProjectName proj-migrate -Scenario agentlessVMware -TargetRegion westeurope
```

## Lab
**Maschinen**: **HV01** (**Hyper-V-Host**), **VM01/VM02** (**Quell-VMs**), **Azure-Abo**.

### GUI
1. **Azure-Portal**: **Azure Migrate → Server, Datenbanken und Web-Apps → Discovery und Assessment → Ermitteln** → **Projekt erstellen** (**Name proj-migrate**).
2. **Azure-Portal**: **„Sind Ihre Computer virtualisiert?“ → Ja, mit Hyper-V** → **Appliance-VHD herunterladen**.
3. **HV01**: **Appliance-VHD** **als VM** **importieren** → **starten**, **Browser-Konfiguration** **(https://localhost:44368)** **öffnen** → **Azure-Anmeldung** → **Hyper-V-Host HV01 eintragen** → **Ermittlung starten**.
4. **Azure-Portal**: **Ermittelte Server prüfen** → **Assessment erstellen** → **Azure-VM-Eignung, Leistungsbasiert** → **Ergebnis prüfen**.
5. **Azure-Portal**: **Migration und Modernisierung → Replizieren** → **VM01 auswählen** → **Ziel-VNet/Größe** → **Replikation starten**.
6. **Azure-Portal**: **Testmigration** → **prüfen** → **Testmigration bereinigen**.
7. **Azure-Portal**: **Migrieren** → **VM01 abschalten** **(optional)** → **Migration abschließen**.

## Einfach

**Azure Migrate** ist **wie ein Umzugsberater**: **Zuerst** **kommt** **er** **ins Haus** (**die Appliance**), **schaut** **in jeden Raum** **und** **schreibt** **auf**, **was du hast** (**Discovery**). **Dann** **rechnet** **er** **aus**, **wie groß** **die neue Wohnung** **sein muss** **und was sie kostet** (**Assessment**). **Erst danach** **packt** **er** **Kisten** **(Replikation)**, **macht** **einen Probelauf** **(Testmigration)** **und** **zieht** **richtig** **um** **(Migration)**.

**Wichtig**: **Er** **muss nichts** **in** **deine Zimmer** **einbauen** **(agentenlos)**. **Er** **schaut** **nur** **durch** **die Tür**.

## Merksatz
- **Azure Migrate = Hub**: **Entdecken, Bewerten, Migrieren**.
- **Appliance = Auge**.
- **Leistungsbasiert** **spart** **Geld**.
- **Testmigration** **vor** **Migration**.
- **Migrate = Umzug**, **ASR = Notfall**.
- **Hyper-V** **nutzt** **ASR-Provider** **auf dem Host**.

## Prüfungsfalle
- **Appliance** **ist** **nicht** **das Migrationsziel**.
- **Assessment** **≠** **Migration**.
- **Hyper-V-Replikation** **braucht** **Provider** **auf jedem Host**.
- **„Bereit mit Bedingungen“** **heißt** **Nacharbeit**.
- **Testmigration** **ändert** **Produktion nicht**.
- **Projektregion** **≠** **Zielregion**.
- **Abhängigkeitsanalyse** **hilft**, **zusammengehörige VMs** **gemeinsam** **zu migrieren**.

## Grafik
### Umzugsberater
Berater schaut in Zimmer (Server), Liste entsteht, Rechner zeigt Preis.

### Acht Schritte
Treppe: Projekt, Appliance, Erfassen, Bewerten, Replizieren, Test, Migrieren, Aufräumen.

### Migrate und ASR
Zwei Pfade: einmaliger Umzug mit Ende, Dauerlinie für Notfall.

## Karteikarten
- F: Was ist Azure Migrate? | A: Zentraler Hub zum Erkennen, Bewerten und Migrieren nach Azure.
- F: Was macht die Appliance? | A: Erfasst lokale Server und sendet Metadaten an Azure.
- F: Welche Bewertungsarten gibt es? | A: Leistungsbasiert und wie lokal.
- F: Welche Ergebnisse liefert ein Assessment? | A: Eignung, VM-Größe und Kosten.
- F: Wofür Testmigration? | A: Prüft die migrierte VM in isoliertem Netz ohne Produktionsauswirkung.
- F: Welche Methode bei Hyper-V? | A: Replikationsanbieter (ASR-Provider) auf den Hosts.
- F: Welcher Port zu Azure? | A: HTTPS 443.
- F: Wie liegt die Appliance bei VMware vor? | A: Als OVA-Vorlage.
- F: Was macht die Abhängigkeitsanalyse? | A: Zeigt Verbindungen zwischen Servern.

## Quiz
? Welche Komponente erfasst lokale Server für Azure Migrate?
* Appliance
- MARS-Agent
- Mobilitätsdienst allein
- Recovery Plan

? Welche Bewertungsart spart meist Kosten?
* Leistungsbasiert
- Wie lokal
- Zufällig
- Keine

? Welche Migrationsart nutzt man für Hyper-V-VMs?
* Replikationsprovider auf den Hosts
- Agentenlos über vCenter
- Nur Azure Backup
- Storage Migration Service

? Was ist der Zweck einer Testmigration?
* Prüfung ohne Auswirkung auf Produktion
- Löschen der Quell-VM
- Erstellen eines Tresors
- Start des Assessments

? Was unterscheidet Azure Migrate von ASR?
* Migrate ist ein einmaliger Umzug, ASR ein dauerhafter Notfallschutz
- Sie sind identisch
- ASR bewertet Kosten
- Migrate ersetzt Backup

? Für IIS-Webseiten nutzt man im Hub welches Werkzeug?
* Web App Migration Assistant
- Data Box
- WAC
- DPM
