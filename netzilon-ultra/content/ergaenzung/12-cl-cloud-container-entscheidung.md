---
id: erg-cloud-container-entscheidung
bereich: AP2
block: ERG
kapitel: Ergänzungen 2.2
titel: Cloud und Container entscheiden – Service- und Bereitstellungsmodelle, Verantwortung, Kosten, Docker-Grundlagen
stufe: Fortgeschritten
fach: PV – AP2
pruefungen: [AP1, AP2]
quellen: [NIST SP 800-145 (Definition of Cloud Computing), BSI C5-Kriterienkatalog, DSGVO Art. 28 und 44 ff., Docker-Dokumentation, Microsoft Learn – Shared Responsibility]
verweise: [ap2-virtualisierung-cloud, ccna-virtualisierung-cloud, az800-windows-container, linux-l1-10-virtualisierung, ihk-netzverbund-regelkreis-edge, azd-ressourcengruppen, ihk-vor-nachteile]
---

## Profi

### Merkmale und Modelle (NIST)
Cloud Computing nach **NIST SP 800-145** hat fünf Merkmale: **On-Demand Self-Service**, **Broad Network Access**, **Resource Pooling** (Mandantenfähigkeit), **Rapid Elasticity** (schnelle Skalierung) und **Measured Service** (nutzungsabhängige Abrechnung).

**Servicemodelle**:
| Modell | Kunde verwaltet | Anbieter verwaltet | Beispiele |
|---|---|---|---|
| **IaaS** | Betriebssystem, Middleware, Anwendungen, Daten | Hardware, Netz, Virtualisierung | Azure VM, AWS EC2 |
| **PaaS** | Anwendungen und Daten | zusätzlich Betriebssystem, Laufzeit, Datenbank-Engine | Azure App Service, Azure SQL Database |
| **SaaS** | Daten, Benutzer, Konfiguration | gesamte Anwendung | Microsoft 365, Salesforce |

**Bereitstellungsmodelle**: **Public Cloud** (geteilte Infrastruktur eines Anbieters), **Private Cloud** (exklusiv für eine Organisation, on-premises oder gehostet), **Hybrid Cloud** (Kombination mit Verbindung, z. B. AD-Synchronisation, VPN/ExpressRoute), **Community Cloud** (gemeinsam für Organisationen mit gleichen Anforderungen). Zusätzlich **Multi-Cloud** (mehrere Anbieter).

### Geteilte Verantwortung (Shared Responsibility)
Der Anbieter ist **immer** für die physische Sicherheit der Rechenzentren verantwortlich, der Kunde **immer** für seine **Daten, Identitäten/Konten und Zugriffsrechte**. Dazwischen verschiebt sich die Verantwortung je nach Modell (bei IaaS patcht der Kunde das Gast-Betriebssystem selbst). **Datensicherung** ist auch bei SaaS nicht automatisch im gewünschten Umfang enthalten.

### Entscheidungskriterien
- **Kosten**: CapEx (Investition) → **OpEx** (laufende Kosten); Pay-as-you-go, Reservierungen; Vorsicht bei Datenabflusskosten (Egress) und vergessenen Ressourcen.
- **Datenschutz**: **Auftragsverarbeitungsvertrag** (Art. 28 DSGVO), Serverstandort, Drittlandübermittlung (Art. 44 ff., z. B. EU-US Data Privacy Framework/Standardvertragsklauseln), Testate wie **BSI C5** oder ISO 27001.
- **Verfügbarkeit** und SLA, Abhängigkeit vom Internetanschluss (Redundanz), **Vendor Lock-in**, Exit-Strategie, Performance/Latenz, Know-how im Team.

### Container
Ein **Container** paketiert eine Anwendung mit ihren Abhängigkeiten und läuft isoliert auf dem **Kernel des Host-Betriebssystems** (Linux: Namespaces und cgroups). Gegenüber einer **VM** (eigenes Gast-Betriebssystem auf einem Hypervisor) ist er **kleiner, startet in Sekunden** und lässt sich gut skalieren, bietet aber eine **schwächere Isolation**.
- **Image** – unveränderliche Vorlage aus Schichten, beschrieben im **Dockerfile**.
- **Container** – laufende Instanz eines Images.
- **Registry** – Ablage für Images (Docker Hub, Azure Container Registry).
- **Volume** – persistenter Speicher außerhalb des Containers (Containerdateisystem ist flüchtig).
- **Orchestrierung** – **Kubernetes** verteilt, skaliert und überwacht viele Container auf mehreren Hosts.

## Einfach
Stell dir vor, du brauchst **Strom**. Früher hatte jede Fabrik ein eigenes Kraftwerk. Heute kommt der Strom aus der Steckdose und man bezahlt, was man verbraucht. Die **Cloud** ist dasselbe für Computer: Man mietet Rechenleistung und Speicher übers Internet, statt alles selbst zu kaufen.

Es gibt drei Pakete, wie beim **Pizzaessen**:
- **IaaS** – du mietest die Küche mit Ofen. Teig, Belag und Backen machst du selbst.
- **PaaS** – du bekommst den fertigen Teig und den heißen Ofen, du legst nur noch deinen Belag drauf.
- **SaaS** – du bestellst die fertige Pizza und isst sie einfach.

Wo die Pizza herkommt, ist auch wichtig: aus der **öffentlichen Großküche** (Public Cloud), aus der **eigenen Küche** (Private Cloud) oder **beides gemischt** (Hybrid Cloud).

Aber Achtung: Auch wenn der Anbieter die Küche putzt, bist **du** dafür verantwortlich, wer deine Pizza essen darf. Deine **Daten und Passwörter** schützt du immer selbst.

Ein **Container** ist wie eine **Brotdose**, in der alles drin ist, was ein Programm braucht. Du kannst sie auf jeden Tisch stellen und sie funktioniert überall gleich. Anders als eine **virtuelle Maschine**, die ein ganzer eigener Computer mit eigenem Betriebssystem ist, teilt sich der Container den „Tisch“ (den Kern des Betriebssystems) mit anderen Brotdosen. Deshalb ist er klein und schnell.

## Merksatz
- **IaaS = Küche, PaaS = Teig + Ofen, SaaS = fertige Pizza.**
- **Daten, Konten und Rechte sind immer Kundensache.**
- **Cloud = OpEx statt CapEx.**
- **Personenbezogene Daten in der Cloud → AV-Vertrag (Art. 28 DSGVO).**
- **Container teilt den Kernel, VM hat ein eigenes Betriebssystem.**

## Prüfungsfalle
- Bei **IaaS** ist der **Kunde** für Updates des Gast-Betriebssystems zuständig.
- **SaaS** bedeutet nicht automatisch ausreichendes Backup.
- Ein **Linux-Container** läuft nicht nativ auf einem Windows-Kernel (nur über eine Linux-VM bzw. WSL 2).
- Daten in einem Container ohne **Volume** gehen beim Löschen des Containers verloren.
- **Private Cloud** heißt nicht zwingend „im eigenen Keller“ – sie kann auch beim Dienstleister exklusiv betrieben werden.

## Grafik
### Container-Lebenszyklus
1. Entwickler: Schreibt Dockerfile
2. Entwickler -> Build-Server: docker build erzeugt Image
3. Build-Server -> Registry: docker push
4. Registry -> Container-Host: docker pull
5. Container-Host: docker run startet Container mit Volume
6. Container-Host: Update – neues Image, Container ersetzen

### Verantwortung bei IaaS, PaaS, SaaS
1. Anbieter: Rechenzentrum, Hardware, Netz – immer
2. IaaS-Kunde: Betriebssystem, Anwendungen, Daten
3. PaaS-Kunde: Anwendungscode und Daten
4. SaaS-Kunde: Daten, Benutzer und Berechtigungen

## Lab
**Maschinen**: Linux-Server **LX01** (Debian 12 mit Docker Engine) und Windows-11-Client **CL01** im Heimlabor **example.com**.

### CLI (LX01)
```bash
docker version
docker pull nginx:stable
docker volume create webdaten
docker run -d --name web1 -p 8080:80 -v webdaten:/usr/share/nginx/html nginx:stable
docker ps
docker logs web1
docker stop web1 && docker rm web1   # Daten bleiben im Volume
docker volume ls
```

### PowerShell (CL01)
```powershell
Test-NetConnection lx01.example.com -Port 8080
Invoke-WebRequest http://lx01.example.com:8080 -UseBasicParsing | Select-Object StatusCode
```

## Legende
### Shared Responsibility
- Was: Aufteilung der Sicherheitsverantwortung zwischen Cloud-Anbieter und Kunde.
- Wie: Je höher das Servicemodell (IaaS → SaaS), desto mehr übernimmt der Anbieter; Daten und Identitäten bleiben beim Kunden.
- Wann: Bei jeder Cloud-Entscheidung und beim Erstellen des Sicherheitskonzepts.
- Wo: In Verträgen, SLAs und Dokumentation der Anbieter.
- Warum: Verhindert Lücken („Ich dachte, der Anbieter macht das Backup“).

### Container-Image
- Was: Unveränderliche Vorlage einer Anwendung mit allen Abhängigkeiten.
- Wie: Aus einem Dockerfile schichtweise gebaut, versioniert per Tag.
- Wann: Bei Entwicklung, Test und Rollout von Anwendungen.
- Wo: In einer Registry (Docker Hub, Azure Container Registry).
- Warum: Gleiches Verhalten auf jedem Host, schnelle Bereitstellung und Rollback.

## Karteikarten
- F: Nennen Sie die drei Servicemodelle der Cloud. | A: IaaS (Infrastructure), PaaS (Platform), SaaS (Software as a Service).
- F: Nennen Sie vier Bereitstellungsmodelle. | A: Public, Private, Hybrid und Community Cloud.
- F: Wofür ist der Kunde bei jedem Cloud-Modell selbst verantwortlich? | A: Für seine Daten, Benutzerkonten/Identitäten und Zugriffsrechte.
- F: Was bedeutet Vendor Lock-in? | A: Starke Abhängigkeit von einem Anbieter, die einen Wechsel teuer oder schwierig macht.
- F: Welcher Vertrag ist bei personenbezogenen Daten in der Cloud nötig? | A: Ein Auftragsverarbeitungsvertrag nach Art. 28 DSGVO.
- F: Unterschied CapEx und OpEx? | A: CapEx = Investitionsausgaben (Kauf eigener Hardware), OpEx = laufende Betriebsausgaben (Miete/Nutzung).
- F: Unterschied Container und VM? | A: Container teilen den Kernel des Hosts und sind leichtgewichtig; VMs haben ein eigenes Gast-Betriebssystem auf einem Hypervisor.
- F: Was ist ein Docker-Volume? | A: Persistenter Speicher, der unabhängig vom Lebenszyklus des Containers bestehen bleibt.
- F: Wozu dient Kubernetes? | A: Orchestrierung: Verteilen, Skalieren, Überwachen und Selbstheilen von Containern auf mehreren Hosts.
- F: Was ist BSI C5? | A: Kriterienkatalog des BSI für die Informationssicherheit von Cloud-Diensten (Testat für Anbieter).

## Quiz
? Bei welchem Modell ist der Kunde für das Patchen des Betriebssystems verantwortlich?
* IaaS
- PaaS
- SaaS
- Bei keinem Modell
! Bei IaaS mietet der Kunde nur die virtuelle Infrastruktur.

? Microsoft 365 ist ein Beispiel für …
* SaaS
- IaaS
- PaaS
- Private Cloud
! Die komplette Anwendung wird als Dienst bereitgestellt.

? Welche Aussage zu Containern ist richtig?
* Container nutzen den Kernel des Host-Betriebssystems.
- Jeder Container hat ein vollständiges Gast-Betriebssystem.
- Container benötigen immer einen Typ-1-Hypervisor.
- Container speichern Daten dauerhaft ohne Volume.
! Deshalb sind sie klein und starten schnell.

? Was ist bei der Nutzung eines Cloud-Dienstes mit Kundendaten datenschutzrechtlich erforderlich?
* Ein Auftragsverarbeitungsvertrag
- Eine Gewerbeanmeldung
- Ein Leasingvertrag
- Eine Betriebsvereinbarung in jedem Fall
! Der Cloud-Anbieter verarbeitet personenbezogene Daten im Auftrag.

? Welches Merkmal gehört zur Cloud nach NIST?
* Rapid Elasticity (schnelle Skalierung)
- Ausschließlich lokale Installation
- Feste Jahrespauschale ohne Messung
- Nur ein Mandant pro Rechenzentrum
! Weitere Merkmale: Self-Service, Netzwerkzugriff, Resource Pooling, Measured Service.

? Was beschreibt eine Hybrid Cloud?
* Kombination aus eigener Infrastruktur bzw. Private Cloud und Public Cloud
- Zwei Public-Cloud-Anbieter ohne Verbindung
- Eine reine On-Premises-Lösung
- Eine Cloud nur für Behörden
! Typisch: AD-Synchronisation mit Entra ID, Site-to-Site-VPN.

? Was passiert mit Daten im Containerdateisystem, wenn der Container gelöscht wird?
* Sie gehen verloren, sofern sie nicht in einem Volume liegen.
- Sie werden automatisch in die Registry hochgeladen.
- Sie bleiben im Image erhalten.
- Sie werden auf den Host kopiert.
! Für dauerhafte Daten werden Volumes oder Bind Mounts genutzt.

? Welcher Kostenvorteil wird der Cloud typischerweise zugeschrieben?
* Umwandlung von Investitionskosten in nutzungsabhängige Betriebskosten
- Keine laufenden Kosten
- Unbegrenzt kostenloser Datenabfluss
- Wegfall aller Lizenzkosten
! Achtung: Egress und vergessene Ressourcen können teuer werden.

? Wofür steht PaaS?
* Platform as a Service
- Programming as a Server
- Private and a Service
- Platform and Storage
! Der Anbieter stellt Laufzeitumgebung bzw. Datenbank-Engine bereit.

## Lücken
- Bei {IaaS} verwaltet der Kunde das Betriebssystem selbst.
- Microsoft 365 ist ein {SaaS}-Angebot.
- Container teilen sich den {Kernel} des Host-Betriebssystems.
- Personenbezogene Daten in der Cloud erfordern einen {Auftragsverarbeitungsvertrag|AV-Vertrag}.
- Persistente Containerdaten liegen in einem {Volume}.

## Zuordnen
### Dienst und Servicemodell
- Azure Virtual Machine => IaaS
- Azure SQL Database => PaaS
- Microsoft 365 => SaaS
- Azure App Service => PaaS

### Docker-Begriff und Bedeutung
- Image => unveränderliche Vorlage
- Container => laufende Instanz
- Registry => Ablage für Images
- Dockerfile => Bauanleitung für ein Image

### Bereitstellungsmodell und Beschreibung
- Public Cloud => geteilte Infrastruktur eines Anbieters
- Private Cloud => exklusiv für eine Organisation
- Hybrid Cloud => Kombination aus privat und öffentlich
- Community Cloud => gemeinsam für Organisationen mit gleichen Anforderungen

## Reihenfolge
### Cloud-Einführung planen
1. Anforderungen und Daten klassifizieren
2. Servicemodell und Bereitstellungsmodell wählen
3. Anbieter vergleichen (Kosten, SLA, Datenschutz, Testate)
4. AV-Vertrag abschließen
5. Pilotbetrieb und Migration
6. Betrieb, Kostenkontrolle und Exit-Strategie pflegen

### Container bereitstellen
1. Dockerfile schreiben
2. Image bauen
3. Image in die Registry hochladen
4. Image auf dem Host herunterladen
5. Container mit Port und Volume starten

### Container aktualisieren
1. Neues Image mit neuem Tag bauen
2. Image in die Registry hochladen
3. Neues Image auf dem Host herunterladen
4. Alten Container stoppen und entfernen
5. Neuen Container mit demselben Volume starten

## Freitext
- F: Erläutern Sie die Unterschiede zwischen IaaS, PaaS und SaaS anhand der Verantwortlichkeiten. | M: IaaS: Anbieter Hardware/Virtualisierung, Kunde OS bis Anwendung. PaaS: Anbieter zusätzlich OS/Laufzeit/DB-Engine, Kunde Anwendung und Daten. SaaS: Anbieter gesamte Anwendung, Kunde Daten, Benutzer, Konfiguration. | P: 6
- F: Nennen Sie je zwei Vor- und Nachteile einer Public-Cloud-Lösung für ein mittelständisches Unternehmen. | M: Vorteile: Skalierbarkeit, keine Investition, hohe Verfügbarkeit, Wegfall eigener Hardwarepflege. Nachteile: Abhängigkeit vom Internet und Anbieter (Lock-in), Datenschutz/Drittland, laufende Kosten, weniger Kontrolle. | P: 4
- F: Begründen Sie, wann Container und wann virtuelle Maschinen sinnvoller sind. | M: Container: viele gleichartige, schnell skalierende Anwendungen/Microservices, CI/CD, geringer Overhead. VMs: unterschiedliche Betriebssysteme, starke Isolation, Legacy-Anwendungen, komplette Server. | P: 4

## Szenario
### Mailserver in die Cloud
Die Muster GmbH betreibt einen eigenen Exchange-Server, der 2026 ersetzt werden muss. Es gibt 40 Mitarbeiter und keine eigene IT-Abteilung.
- F: Welches Servicemodell empfehlen Sie und warum? | A: SaaS (z. B. Exchange Online/Microsoft 365) – kein eigener Serverbetrieb, Updates und Verfügbarkeit beim Anbieter. | P: 2
- F: Welche Aufgaben bleiben bei der Firma? | A: Benutzer- und Rechteverwaltung, MFA, Datensicherung nach Bedarf, Datenschutz (AV-Vertrag), Schulung. | P: 3

### Webanwendung mit Lastspitzen
Ein Onlinehändler hat im Dezember die zehnfache Last. Die Anwendung besteht aus Webfrontend, API und Datenbank.
- F: Welche Technik nutzen Sie für das Frontend? | A: Container mit Orchestrierung (Kubernetes) bzw. PaaS mit Autoscaling – Instanzen bei Bedarf hinzufügen. | P: 2
- F: Welche Cloud-Eigenschaft nutzen Sie damit? | A: Rapid Elasticity und nutzungsabhängige Abrechnung. | P: 1

### Container verliert Daten
Ein Kollege hat eine Wiki-Anwendung als Docker-Container gestartet. Nach einem Update (Container gelöscht und neu gestartet) sind alle Seiten weg.
- F: Was ist die Ursache? | A: Die Daten lagen im flüchtigen Containerdateisystem, nicht in einem Volume. | P: 2
- F: Wie verhindern Sie das künftig? | A: Datenverzeichnis als Volume oder Bind Mount einbinden und das Volume regelmäßig sichern. | P: 2
