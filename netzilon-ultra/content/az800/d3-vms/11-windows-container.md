---
id: az800-windows-container
bereich: AZ-800
block: A7
kapitel: VMs & Container
titel: Windows-Container – Isolierung, Images, Netzwerk & Verwaltung
stufe: Fortgeschritten
quellen: [AZ-800 Study Guide, Microsoft Learn]
verweise: [az800-nested, az800-vswitch, az800-wac, az800-azure-vms, az800-vhdx]
---

## Profi

### Container vs. VM
| | **Virtuelle Maschine** | **Container** |
|---|---|---|
| Virtualisiert | Hardware | **Betriebssystem** (Kernel wird geteilt) |
| Eigenes OS | vollständig (eigener Kernel) | nur User-Mode-Teile, **Kernel vom Host** |
| Größe | GB | MB bis wenige GB |
| Start | Minuten | Sekunden |
| Dichte | wenige pro Host | viele pro Host |
| Einsatz | vollständige Server, verschiedene OS | Apps/Microservices, schnelle Bereitstellung, DevOps |
Ein **Container** ist eine isolierte Laufzeitumgebung für **eine** Anwendung inkl. Abhängigkeiten, gestartet aus einem **Image** (schreibgeschützte Vorlage in Schichten, *Layers*). Änderungen landen in einer beschreibbaren **Container-Schicht** und sind beim Löschen weg → dauerhafte Daten in **Volumes**.

### Isolierungsmodi
| Modus | Funktionsweise | Kernel | Einsatz |
|---|---|---|---|
| **Prozessisolierung** (*process isolation*) | Container teilt den **Host-Kernel** (Namespaces, Job Objects) | geteilt | Standard auf **Windows Server**, höchste Dichte, vertrauenswürdige Workloads |
| **Hyper-V-Isolierung** (*Hyper-V isolation*) | jeder Container läuft in einer **Utility-VM** mit eigenem Kernel | eigener | Standard auf **Windows 10/11**, nicht vertrauenswürdiger Code, Mandantentrennung, **abweichende Image-Version** |
Umschalten per `docker run --isolation=process|hyperv`. Hyper-V-Isolierung benötigt die **Hyper-V-Rolle** (in einer VM → **Nested Virtualization**).

### Versionskompatibilität
- **Prozessisolierung**: Build des Container-Images muss zum **Host-Build passen** (z. B. Image `ltsc2022` auf Server 2022).
- **Hyper-V-Isolierung**: Host darf **neuer** sein als das Image (ältere Images auf neuerem Host).
- Linux-Container auf Windows: über **WSL 2** bzw. Hyper-V (vor allem Docker Desktop auf Client); auf Windows Server nicht der AZ-800-Schwerpunkt.

### Basis-Images (Microsoft Container Registry, `mcr.microsoft.com/windows/...`)
| Image | Größe | Enthält | Typischer Einsatz |
|---|---|---|---|
| **Nano Server** | am kleinsten (~100 MB+) | kein PowerShell standardmäßig, nur .NET Core | .NET-Core-/moderne Apps |
| **Server Core** | mittel | PowerShell, .NET Framework, viele Server-APIs | klassische Apps, IIS, ASP.NET |
| **Server** | groß | volle Windows-API (inkl. GPU-DirectX) | Apps mit GUI-Abhängigkeiten |
| **Windows** (Legacy) | sehr groß | vollständige API | Vorgänger von „Server“ |
Tags nach Kanal: **LTSC** (z. B. `ltsc2022`, `ltsc2025`) = langfristig unterstützt.

### Container-Runtime
- Windows-Feature **Containers** (`Install-WindowsFeature Containers`) + Neustart.
- Runtime: **Docker CE / Moby** (Microsoft-Installskript `install-docker-ce.ps1`), **Mirantis Container Runtime** (kommerziell) oder **containerd** (z. B. unter Kubernetes/AKS).
- Legacy: PowerShell-Modul **DockerMsftProvider** – veraltet, nicht mehr verwenden.

### Container-Netzwerk (Treiber)
| Treiber | Funktion |
|---|---|
| **nat** (Standard) | Container in internem Netz (vSwitch „nat“, Standard 172.x.x.x), Zugriff von außen über **Port-Mapping** `-p 8080:80` |
| **transparent** | Container direkt im **physischen Netz** (eigene IP via DHCP/statisch); in einer VM **MAC-Spoofing** an der vNIC nötig |
| **overlay** | Netz über mehrere Hosts (**Docker Swarm**/Kubernetes, VXLAN) |
| **l2bridge** | gleiche IP-Subnetz wie Host, MAC des Hosts wird verwendet (SDN, Kubernetes) |
| **l2tunnel** | wie l2bridge, Verkehr über Host-vSwitch getunnelt (Azure/SDN) |

### Image bauen, speichern, verteilen
- **Dockerfile**: `FROM`, `RUN`, `COPY`, `WORKDIR`, `EXPOSE`, `ENTRYPOINT`/`CMD`.
- `docker build` → lokales Image; `docker tag` + `docker push` → **Registry** (Docker Hub, **Azure Container Registry (ACR)**).
- Ausführen in Azure: **Azure Container Instances (ACI)** (einzelne Container, serverlos), **Azure Kubernetes Service (AKS)** mit Windows-Knotenpools, **Azure App Service** (Windows-Container).
- Verwaltung per GUI: **Windows Admin Center** → Erweiterung **Container** (Images, Container, Logs, Ressourcen) sowie Tool zum Containerisieren bestehender Apps.

### Gruppenverwaltete Dienstkonten
Windows-Container sind **nicht domänengebunden**. Für AD-Authentifizierung (z. B. Integrated Windows Auth auf IIS) nutzt man eine **gMSA**: Credential Spec erzeugen (`New-CredentialSpec`) und beim Start `--security-opt "credentialspec=file://app.json"` angeben; der **Host** muss die gMSA abrufen dürfen.

## Lab
**Maschinen**: **CONT01** (Windows Server 2022, Core oder Desktop, Internetzugang; bei Hyper-V-Isolierung als VM mit Nested Virtualization vom Host **HV-HOST**).

### GUI
1. **HV-HOST** (nur falls CONT01 eine VM ist und Hyper-V-Isolierung gewünscht): VM aus, dann PowerShell: `Set-VMProcessor -VMName CONT01 -ExposeVirtualizationExtensions $true` und `Set-VMNetworkAdapter -VMName CONT01 -MacAddressSpoofing On`.
2. **CONT01**: Server-Manager → Rollen und Features → Features → **Container** (und optional **Hyper-V**) → Neustart.
3. **Admin-PC** mit Windows Admin Center → CONT01 hinzufügen → Erweiterung **Container** installieren → Registerkarten **Images** und **Container** ansehen.
4. Docker-Installation erfolgt per Skript (siehe PowerShell), danach in WAC **Pull** eines Images (`mcr.microsoft.com/windows/servercore/iis:windowsservercore-ltsc2022`) und Container starten, Port 80 → 8080.
5. Browser auf dem Admin-PC: `http://CONT01:8080` → IIS-Startseite aus dem Container.

### PowerShell
```powershell
# Auf CONT01 – Feature + Docker CE
Install-WindowsFeature -Name Containers -Restart
Invoke-WebRequest -UseBasicParsing "https://raw.githubusercontent.com/microsoft/Windows-Containers/Main/helpful_tools/Install-DockerCE/install-docker-ce.ps1" -OutFile install-docker-ce.ps1
.\install-docker-ce.ps1
docker version
docker info

# Auf CONT01 – Images und Container
docker pull mcr.microsoft.com/windows/nanoserver:ltsc2022
docker pull mcr.microsoft.com/windows/servercore/iis:windowsservercore-ltsc2022
docker images
docker run -d --name web01 -p 8080:80 mcr.microsoft.com/windows/servercore/iis:windowsservercore-ltsc2022
docker ps
docker exec -it web01 powershell
docker run -it --isolation=hyperv mcr.microsoft.com/windows/nanoserver:ltsc2022 cmd
docker stop web01; docker rm web01

# Auf CONT01 – Netzwerk und Volume
docker network ls
docker network create -d transparent LAN-Transparent
docker volume create webdaten
docker run -d -p 8081:80 -v webdaten:C:\inetpub\wwwroot mcr.microsoft.com/windows/servercore/iis:windowsservercore-ltsc2022

# Auf CONT01 – eigenes Image
# Dockerfile:
#   FROM mcr.microsoft.com/windows/servercore/iis:windowsservercore-ltsc2022
#   COPY index.html C:/inetpub/wwwroot/
#   EXPOSE 80
docker build -t netzilon/web:1.0 .
docker tag netzilon/web:1.0 meineacr.azurecr.io/web:1.0
docker push meineacr.azurecr.io/web:1.0
```

## Einfach

Eine **VM** ist wie ein **ganzes Haus**: eigenes Fundament, eigene Heizung, eigene Wasserleitung (eigenes Betriebssystem). Ein **Container** ist wie eine **Wohnung im Mehrfamilienhaus**: Jede Wohnung ist abgeschlossen, aber alle teilen sich Fundament und Heizung (den **Kernel** des Hosts). Deshalb sind Container **klein und starten in Sekunden**.

**Image** = der **Bauplan** bzw. die Backform. **Container** = der **gebackene Kuchen** aus der Form. Aus einem Image kannst du beliebig viele Container machen. Isst du den Kuchen (Container löschen), ist er weg – deshalb speichert man wichtige Sachen in einem **Volume** (eine Dose neben dem Kuchen, die bleibt).

**Zwei Arten der Abtrennung**:
- **Prozessisolierung** = normale Wohnung, dünne Wände, teilt die Heizung → schnell, aber Image und Host müssen **gleich alt** sein.
- **Hyper-V-Isolierung** = die Wohnung steckt in einer **Mini-VM** mit eigener Heizung → sicherer, und das Image darf **älter** sein als der Host.

**Welches Grund-Image?**
- **Nano Server** = Mini-Rucksack, nur das Nötigste.
- **Server Core** = normaler Rucksack mit PowerShell und .NET – passt für IIS.
- **Server** = Koffer mit allem.

**Netzwerk**: Standard ist **NAT** – der Container sitzt hinter dem Host wie hinter einem Router. Damit man von außen rankommt, sagt man „Tür 8080 außen führt zu Tür 80 innen“ (**Port-Mapping**). Mit **transparent** bekommt der Container eine **eigene IP** im echten Netz.

## Merksatz
- Container teilen den **Kernel**, VMs virtualisieren die **Hardware**.
- **Prozess** = gleiche Version nötig; **Hyper-V** = Host darf neuer sein, mehr Sicherheit.
- **Nano** klein – **Core** mittel (PowerShell/IIS) – **Server** groß.
- `-p außen:innen` = Port-Mapping bei NAT.
- Container vergessen alles → **Volumes** für Daten.
- AD-Anmeldung im Container → **gMSA + Credential Spec**.

## Prüfungsfalle
- Image ltsc2019 auf Host 2022 mit Prozessisolierung startet nicht → Hyper-V-Isolierung oder passendes Image.
- Hyper-V-Isolierung in einer VM → Nested Virtualization aktivieren.
- Transparentes Netzwerk in einer VM → MAC-Spoofing an der vNIC aktivieren.
- Nano Server enthält kein PowerShell und kein .NET Framework.
- Container werden nicht der Domäne beigetreten – gMSA verwenden.
- DockerMsftProvider ist veraltet.

## Grafik
### Haus vs. Wohnung
Links drei einzelne Häuser (VMs) mit eigenem Fundament; rechts ein Mehrfamilienhaus mit einem Fundament (Kernel) und vielen Wohnungen (Container), die in Sekunden aufleuchten.

### Kuchenform
Image als Backform, drei Kuchen (Container) kommen heraus; einer wird gegessen – daneben bleibt eine Dose (Volume) stehen.

### Isolierung
Container A direkt auf dem Host-Kernel; Container B in einer kleinen Glasblase (Utility-VM) mit eigenem Kernel; Schild „Version muss passen“ bei A, „älteres Image erlaubt“ bei B.

### Port-Mapping
Paket kommt an Host-Port 8080, Pfeil durch NAT-Tür zu Container-Port 80, IIS-Seite erscheint.

## Karteikarten
- F: Was teilen sich Container mit dem Host? | A: Den Betriebssystem-Kernel.
- F: Zwei Isolierungsmodi von Windows-Containern? | A: Prozessisolierung und Hyper-V-Isolierung.
- F: Standard-Isolierung auf Windows Server? | A: Prozessisolierung.
- F: Wann Hyper-V-Isolierung? | A: Nicht vertrauenswürdiger Code, Mandantentrennung, älteres Image auf neuerem Host.
- F: Kleinstes Windows-Basisimage? | A: Nano Server.
- F: Welches Basisimage für IIS/ASP.NET mit .NET Framework? | A: Server Core.
- F: Standard-Netzwerktreiber für Windows-Container? | A: nat.
- F: Container soll eigene IP im physischen Netz erhalten? | A: Netzwerktreiber transparent.
- F: Feature für Windows-Container? | A: Containers (Install-WindowsFeature Containers).
- F: Wie bekommt ein Container AD-Identität? | A: gMSA mit Credential Spec (--security-opt credentialspec).
- F: Private Registry in Azure? | A: Azure Container Registry (ACR).
- F: Container ohne VM/Cluster in Azure ausführen? | A: Azure Container Instances (ACI).

## Quiz
? Ein Container mit Image ltsc2019 soll auf Windows Server 2022 laufen. Was ist nötig?
* Hyper-V-Isolierung verwenden
- Prozessisolierung verwenden
- Transparentes Netzwerk einrichten
- Das Feature Containers neu installieren

? Welches Basisimage ist am kleinsten und für .NET-Core-Apps gedacht?
* Nano Server
- Server Core
- Server
- Windows

? Eine Webseite im Container (Port 80) soll über Host-Port 8080 erreichbar sein. Welcher Parameter?
* -p 8080:80
- -p 80:8080
- --isolation=hyperv
- -v 8080:80

? Windows-Container in einer Hyper-V-VM sollen Hyper-V-Isolierung nutzen. Was muss auf dem Host passieren?
* Nested Virtualization für die VM aktivieren
- Dynamischen Arbeitsspeicher aktivieren
- Enhanced Session aktivieren
- Einen privaten vSwitch erstellen

? Eine IIS-App im Container braucht Windows-integrierte Authentifizierung gegen AD. Lösung?
* gMSA mit Credential Spec
- Container der Domäne beitreten
- Domänen-Admin-Kennwort ins Image einbauen
- Hyper-V-Isolierung aktivieren

? Welche Isolierungsart teilt sich den Kernel mit dem Host?
* Prozessisolierung
- Hyper-V-Isolierung
- Vollvirtualisierung
- Sandbox-Isolierung
! Hyper-V-Isolierung startet für jeden Container eine schlanke VM mit eigenem Kernel.

? Welches Werkzeug wird typischerweise zum Starten von Windows-Containern verwendet?
* Docker bzw. eine Container-Runtime wie containerd
- Hyper-V-Manager
- Datenträgerverwaltung
- DHCP-Konsole
! Images stammen z. B. aus der Microsoft Container Registry (mcr.microsoft.com).

? Was beschreibt ein Dockerfile?
* Die schrittweise Bauanleitung eines Container-Images
- Die Netzwerkkonfiguration des Hosts
- Die Lizenz eines Containers
- Ein Backup eines Containers
! docker build erzeugt daraus ein Image.
