---
id: az801-iis-webapps-container
bereich: AZ-801
block: A10
kapitel: Migration
titel: IIS zu Azure Web Apps und Containern
stufe: Profi
quellen: [AZ-801 Study Guide, Microsoft Learn]
verweise: [az801-azure-migrate, az801-migration-serverrollen, az800-windows-container]
---

## Profi

### Zwei Wege
| Ziel | Erklärung |
|---|---|
| **Azure App Service (Web Apps)** | **PaaS**, **Azure** **betreibt** **Server, Updates, Skalierung** |
| **Container** (*Windows-Container*) | **Anwendung** **im** **Image** **verpackt**, **auf Azure Container Apps/AKS/Azure Container Instances/ACR** |

### Azure App Service Migration Assistant
**Kostenloses Tool** **(Azure Migrate → Web-App-Migration)**:
1. **Auf** **IIS-Server** **installieren**.
2. **Bereitschaftsbewertung** (*Readiness*): **Prüfung** **pro Website** (**Bindungen**, **Authentifizierung**, **GAC**, **Registry**, **COM**, **ISAPI**).
3. **Ergebnis**: **Bereit / Bereit mit Warnungen / Blockiert**.
4. **Migration**: **Site** **wird** **nach** **App Service** **veröffentlicht**.

**Häufige Blocker**: **Windows-Authentifizierung**, **GAC-Assemblys**, **Registry-Abhängigkeiten**, **lokale Ports** **außer 80/443**, **Windows-Dienste**, **IPv4-Bindung**.

### App Service Grundbegriffe
| Begriff | Erklärung |
|---|---|
| **App Service Plan** | **Rechenressourcen** **(Größe, Region, Betriebssystem)**, **mehrere Apps** **darauf** |
| **Bereitstellungsslots** (*Deployment Slots*) | **Staging** **→ Swap** **ohne Ausfall** |
| **Skalierung** | **Vertikal** (**größerer Plan**), **horizontal** (**mehr Instanzen**) |
| **Hybrid Connections** | **Zugriff** **auf lokale Ressourcen** **(TCP-Tunnel)** |
| **VNet-Integration** | **Ausgehender Zugriff** **ins VNet** |
| **Benutzerdefinierte Domäne + TLS** | **Zertifikat** **binden** |

### Windows-Container für IIS
**Dockerfile**:
```dockerfile
FROM mcr.microsoft.com/windows/servercore/iis:windowsservercore-ltsc2022
WORKDIR /inetpub/wwwroot
COPY ./site/ .
EXPOSE 80
```
```powershell
# Auf CONT01 (Windows Server 2022 mit Docker)
docker build -t webapp:1.0 .
docker run -d --name web1 -p 8080:80 webapp:1.0
docker ps

# In ACR bereitstellen
az acr login --name acrexa
docker tag webapp:1.0 acrexa.azurecr.io/webapp:1.0
docker push acrexa.azurecr.io/webapp:1.0
```

### Isolationsmodi
| Modus | Erklärung |
|---|---|
| **Prozessisolierung** (*Process*) | **Teilt Kernel** **mit Host**, **Versionen müssen passen** |
| **Hyper-V-Isolierung** | **Eigener Mini-Kernel**, **Versionen** **dürfen abweichen** |

### Azure Migrate: App Containerization
**Tool** **verpackt** **ASP.NET-Apps** **von** **IIS/Server** **als** **Container-Image** **und** **erzeugt** **Kubernetes-Dateien** **für** **AKS** **oder** **App Service Container**.

### Entscheidungshilfe
| Situation | Empfehlung |
|---|---|
| **Einfache ASP.NET/PHP-Seite** | **App Service** |
| **Windows-Authentifizierung/GAC** | **Container** **oder** **VM (Lift-and-Shift)** |
| **Viele Abhängigkeiten** | **Container** |
| **Wenig Zeit** | **Azure Migrate → VM** |

## Lab
**Maschinen**: **IIS01** **(Quelle)**, **Azure-Abo**.

### GUI
1. **IIS01**: **App Service Migration Assistant** **herunterladen** **und** **installieren**.
2. **IIS01**: **Assistent** **starten** → **Website „Default Web Site“** **wählen** → **Bewertung starten**.
3. **IIS01**: **Ergebnisse prüfen** → **Warnungen** **notieren**.
4. **IIS01**: **Azure-Anmeldung** → **Abonnement, Ressourcengruppe, Web-App-Name** **wählen** → **Migration starten**.
5. **Azure-Portal**: **App Services → neue Web-App → URL öffnen**.
6. **Azure-Portal**: **Web-App → Bereitstellungsslots → Slot „staging“ hinzufügen**.

## Einfach

**IIS auf einem eigenen Server** **ist wie ein eigenes Restaurant**: **Du** **mietest** **das Haus**, **kaufst** **Herd und Tische**, **putzt** **selbst**.

**App Service** **ist wie ein Foodtruck-Stellplatz**: **Du** **bringst nur dein Essen** (**die Webseite**), **der Platz** **hat** **Strom und Wasser** **und** **wird** **für dich gepflegt**. **Manche Spezialgeräte** **passen** **aber** **nicht** **in den Truck** (**GAC, Registry**).

**Container** **ist wie eine Lunchbox**: **Alles** **liegt drin**, **was das Essen braucht**, **und** **sie funktioniert** **überall** **gleich**.

## Merksatz
- **App Service = PaaS**, **kein Server pflegen**.
- **Assistent prüft erst**, **migriert dann**.
- **Blocker: GAC, Registry, Windows-Auth**.
- **Slots = Swap ohne Ausfall**.
- **Container = Alles im Paket**.
- **Prozess-Isolation = gleiche Version nötig**.

## Prüfungsfalle
- **Windows-Authentifizierung** **ist** **in App Service** **nicht** **verfügbar** **(Entra ID nutzen)**.
- **Kein Zugriff** **auf GAC/Registry**.
- **Host-/Container-Version** **passt** **nicht** **→** **Prozessisolierung** **scheitert**.
- **Migration Assistant** **läuft auf dem IIS-Server**, **nicht im Portal**.
- **App Service Plan** **bestimmt** **Kosten**, **nicht** **die einzelne App**.
- **Hybrid Connections** **nötig** **für** **lokale Datenbank** **ohne VPN**.

## Grafik
### Drei Wohnformen
Restaurant, Foodtruck, Lunchbox – daneben Wartung, die abnimmt.

### Swap
Zwei Teller (Production, Staging) tauschen mit einem Klick.

### Isolation
Container mit gemeinsamer Wand (Prozess) und mit eigener Wand (Hyper-V).

## Karteikarten
- F: Welches Tool prüft IIS-Seiten für App Service? | A: Azure App Service Migration Assistant.
- F: Was ist ein App Service Plan? | A: Rechenressourcen für eine oder mehrere Apps.
- F: Wozu Bereitstellungsslots? | A: Staging und Swap ohne Ausfall.
- F: Welches Basis-Image für IIS-Container? | A: mcr.microsoft.com/windows/servercore/iis.
- F: Was verlangt Prozessisolierung? | A: Übereinstimmende Host- und Container-Version.
- F: Was bringt Hybrid Connections? | A: TCP-Zugriff auf lokale Ressourcen.
- F: Welche IIS-Funktion blockiert oft die Migration? | A: Windows-Authentifizierung und GAC.
- F: Wo speichert man Container-Images in Azure? | A: Azure Container Registry (ACR).

## Quiz
? Welches Tool bewertet IIS-Seiten auf App-Service-Eignung?
* App Service Migration Assistant
- Storage Migration Service
- MARS
- ADMT

? Wodurch erreicht man Updates ohne Ausfall in App Service?
* Bereitstellungsslots mit Swap
- Neustart
- Cluster
- Site Recovery

? Bei welcher Isolation muss die Version von Host und Container übereinstimmen?
* Prozessisolierung
- Hyper-V-Isolierung
- Keine
- Beide

? Welches Basisimage nutzt man für IIS in einem Windows-Container?
* servercore/iis
- ubuntu
- nanoserver ohne IIS
- alpine

? Eine Anwendung braucht GAC-Assemblys und Windows-Authentifizierung. Empfehlung?
* Container oder VM
- App Service
- Static Web Apps
- Azure Files

? Wo legt man das Container-Image in Azure ab?
* Azure Container Registry
- Recovery Services Vault
- Storage Sync Service
- Log Analytics
