---
id: ap2-virtualisierung-cloud
bereich: AP2
block: A11
kapitel: Virtualisierung und Cloud
titel: Virtualisierung, Container und Cloud-Modelle
stufe: Fortgeschritten
quellen: [NIST SP 800-145, IHK-Prüfungskatalog]
verweise: [ap2-backup-speicher, ap2-hochverfuegbarkeit, az800-windows-container, az800-azure-vms]
---

## Profi

### Hypervisor-Typen
| Typ | Merkmal | Beispiele |
|---|---|---|
| **Typ 1 (Bare Metal)** | **Direkt auf Hardware**, performant, Server | **Hyper-V, VMware ESXi, Proxmox VE (KVM), Xen** |
| **Typ 2 (Hosted)** | **Läuft auf Host-Betriebssystem**, Test/Desktop | **VirtualBox, VMware Workstation** |

**Voraussetzung**: **CPU-Virtualisierung** (**Intel VT-x / AMD-V**), **SLAT** (EPT/RVI), im **BIOS/UEFI aktivieren**.

### Vorteile/Nachteile
**Vorteile**: **Konsolidierung** (weniger Hardware, Strom, Platz), **schnelle Bereitstellung**, **Snapshots**, **Live Migration**, **Isolation**, **Hochverfügbarkeit**, **Testumgebungen**.
**Nachteile**: **Host = SPOF** (ohne Cluster), **Lizenzkosten**, **Overhead**, **Komplexität**, **Ressourcen-Engpässe** (Overcommitment).

### Begriffe
**Snapshot/Prüfpunkt** (**kein Backup**), **Template/Vorlage**, **Thin/Thick Provisioning** (dynamisch vs. fest), **Overcommitment** (mehr zugewiesen als physisch vorhanden), **Dynamischer Arbeitsspeicher**, **vSwitch** (extern/intern/privat), **Pass-through**, **P2V/V2V** (Migration).

### Container
| | **VM** | **Container** |
|---|---|---|
| **Isolation** | **Eigenes OS + Kernel** | **Teilt Host-Kernel** |
| **Größe** | **GB** | **MB** |
| **Start** | **Minuten** | **Sekunden** |
| **Einsatz** | Verschiedene OS, starke Isolation | **Microservices, DevOps** |

**Docker**: **Image** (Vorlage, Schichten) → **Container** (laufende Instanz), **Dockerfile**, **Registry** (Docker Hub), **Volumes** (persistente Daten), **docker-compose** (mehrere Container). **Orchestrierung**: **Kubernetes** (Pods, Deployments, Services).

### Cloud-Merkmale (NIST)
**On-Demand Self-Service**, **Broad Network Access**, **Resource Pooling**, **Rapid Elasticity**, **Measured Service** (nutzungsbasierte Abrechnung).

### Service-Modelle
| Modell | Kunde verwaltet | Anbieter verwaltet | Beispiel |
|---|---|---|---|
| **IaaS** | **OS, Middleware, Apps, Daten** | **Hardware, Netz, Virtualisierung** | **Azure VM, AWS EC2** |
| **PaaS** | **Apps, Daten** | **+ OS, Laufzeit** | **Azure App Service, Datenbank als Dienst** |
| **SaaS** | **Nur Nutzung/Daten** | **Alles** | **Microsoft 365, Salesforce** |
| (FaaS/Serverless) | **Funktion** | Rest | Azure Functions |

**Shared Responsibility**: **Daten, Identitäten und Zugriffsrechte** bleiben **immer beim Kunden**.

### Bereitstellungsmodelle
**Public** (öffentlich, mandantenfähig), **Private** (eine Organisation), **Hybrid** (Kombination, z. B. Azure Arc), **Community** (mehrere mit gleichen Anforderungen), **Multi-Cloud** (mehrere Anbieter).

### Cloud: Vor- und Nachteile
**Vorteile**: **Skalierbarkeit**, **keine Investition (OPEX statt CAPEX)**, **Georedundanz**, **schnell**.
**Nachteile**: **Abhängigkeit (Vendor Lock-in)**, **Datenschutz (Drittland, Standort)**, **Internetabhängigkeit**, **laufende Kosten**, **Kontrollverlust**.
**Entscheidungskriterien**: **Serverstandort EU**, **AVV**, **Zertifizierungen** (**ISO 27001, BSI C5**), **Exit-Strategie**, **SLA**.

### Speicher in der Virtualisierung
**Lokal**, **SAN (iSCSI/FC)**, **NAS/SMB 3**, **HCI** (Hyperkonvergent, z. B. S2D, vSAN).

## Einfach
**Virtualisierung** = **ein großes Haus in viele Wohnungen aufteilen**: Jede Wohnung (**VM**) hat **eigene Küche und Bad** (eigenes Betriebssystem). **Container** = **WG-Zimmer**: **Eigenes Zimmer**, aber **gemeinsame Küche** (Kernel). **Cloud**: **IaaS** = **leere Wohnung mieten**, **PaaS** = **möblierte Wohnung**, **SaaS** = **Hotelzimmer** – du musst dich um nichts kümmern.

## Merksatz
- **Typ 1 = auf Blech**, **Typ 2 = auf Betriebssystem**.
- **VM = eigener Kernel**, **Container = geteilter Kernel**.
- **IaaS – PaaS – SaaS: immer weniger selbst**.
- **Daten bleiben immer deine Verantwortung**.
- **Snapshot ist kein Backup**.
- **OPEX statt CAPEX**.

## Prüfungsfalle
- **Hyper-V** ist **Typ 1**, obwohl man Windows sieht (Parent Partition).
- **VirtualBox** ist **Typ 2**.
- **Container** können **kein anderes Kernel-OS** direkt ausführen (Linux-Container auf Linux-Kernel).
- **Microsoft 365** = **SaaS**, **Azure VM** = **IaaS**.
- **Cloud = Datenschutz egal** – falsch, **AVV/Standort** prüfen.

## Grafik
### Pizza-as-a-Service
Selbst gemacht (On-Prem), Take & Bake (IaaS), Lieferung (PaaS), Restaurant (SaaS).

### Haus und WG
Haus mit Wohnungen (VMs) neben WG mit Küche (Container).

## Karteikarten
- F: Unterschied Typ-1- und Typ-2-Hypervisor? | A: Typ 1 direkt auf Hardware, Typ 2 auf einem Host-Betriebssystem.
- F: Beispiel Typ-1-Hypervisor? | A: Hyper-V, ESXi, Proxmox VE.
- F: Unterschied VM und Container? | A: Container teilen den Host-Kernel, VMs haben eigenes OS.
- F: Was verwaltet der Kunde bei IaaS? | A: Betriebssystem, Middleware, Anwendungen, Daten.
- F: Beispiel SaaS? | A: Microsoft 365.
- F: Fünf Cloud-Merkmale nach NIST? | A: Self-Service, Netzzugriff, Ressourcenpooling, Elastizität, Messbarkeit.
- F: Was ist Hybrid Cloud? | A: Kombination aus eigener IT/Private Cloud und Public Cloud.
- F: Was ist Overcommitment? | A: Mehr virtuelle Ressourcen zuweisen als physisch vorhanden.
- F: Was ist ein Docker-Image? | A: Unveränderliche Vorlage, aus der Container gestartet werden.
- F: Was ist BSI C5? | A: Kriterienkatalog für sichere Cloud-Dienste.

## Quiz
? Welcher Hypervisor ist Typ 2?
* VirtualBox
- Hyper-V
- ESXi
- Proxmox VE

? Bei welchem Modell verwaltet der Kunde das Betriebssystem?
* IaaS
- PaaS
- SaaS
- Keinem

? Was teilen Container miteinander?
* Den Kernel des Hosts
- Die Festplatte jeder VM
- Den Hypervisor Typ 2
- Nichts

? Wofür steht Rapid Elasticity?
* Schnelle Anpassung der Ressourcen an den Bedarf
- Feste Laufzeit
- Kauf von Hardware
- Offline-Nutzung

? Was bleibt beim Cloud-Modell immer beim Kunden?
* Verantwortung für Daten und Zugriffe
- Wartung der Rechenzentrums-Hardware
- Stromversorgung
- Kühlung

? Welcher Hypervisor gehört zu Typ 1 (Bare Metal)?
* Microsoft Hyper-V bzw. VMware ESXi
- VirtualBox auf Windows 11
- VMware Workstation
- Parallels Desktop
! Typ 1 läuft direkt auf der Hardware.

? Was ist ein Vorteil der Servervirtualisierung?
* Bessere Auslastung der Hardware und schnellere Bereitstellung
- Kein Single Point of Failure mehr
- Wegfall aller Lizenzkosten
- Höhere Leistung als jedes physische System
! Mehrere VMs teilen sich einen Host; Snapshots, Migration und Vorlagen erleichtern den Betrieb.

? Welches Cloud-Modell bezeichnet Microsoft 365?
* SaaS
- IaaS
- PaaS
- Private Cloud
! Der Anbieter stellt die komplette Anwendung bereit.
