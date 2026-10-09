---
id: az801-stretch-cluster
bereich: AZ-801
block: A9
kapitel: Hochverfügbarkeit
titel: Stretch-Cluster
stufe: Profi
quellen: [AZ-801 Study Guide, Microsoft Learn]
verweise: [az801-failover-cluster, az801-cluster-storage-quorum, az801-s2d, az801-hyperv-replica]
---

## Profi

### Zweck
Ein **Stretch-Cluster** (*Stretched Cluster*) **spannt einen Failover-Cluster über zwei Standorte** (**Rechenzentren**). **Fällt ein ganzer Standort aus** (**Brand, Strom, Netz**), **laufen die Rollen am anderen Standort weiter**. Er ist **Hochverfügbarkeit + Disaster Recovery** in einem.

### Aufbau
| Element | Erklärung |
|---|---|
| **Standort A / B** | **Je Standort** **eigene Knoten** und **eigener Speicher** |
| **Speicherreplikation** | **Storage Replica** (**synchron oder asynchron**) **oder Storage Spaces Direct** (**Stretch-S2D**) |
| **Witness** | **Dritter Standort** (**File Share Witness** oder **Cloud Witness**) |
| **Netzwerk** | **Verbindung zwischen Standorten**, **Routing zwischen Subnetzen** |
| **Site-Awareness** | **Fault Domains** (**Standort**) **im Cluster definieren** |

### Storage Replica (SR) im Stretch-Cluster
| Modus | Verhalten |
|---|---|
| **Synchron** | **Schreibvorgang** **erst bestätigt**, **wenn beide Standorte geschrieben haben** → **RPO = 0**, **Latenz ≤ 5 ms Round-Trip** |
| **Asynchron** | **Bestätigung sofort**, **Replikation nachgelagert** → **RPO > 0**, **größere Distanz** |
| **Blockebene** | **Volumen** (**nicht Dateien**) |
| **Richtung** | **Quelle → Ziel**, **Ziel-Volume nicht lesbar**, **Failover dreht die Richtung** |
| **Protokoll** | **SMB 3** (**RDMA** möglich) |
| **Lizenz** | **Datacenter** (**Standard** ab **2019**: **1 Partnerschaft**, **1 Volume**, **max. 2 TB**) |
| **Protokolldatenträger** | **Je Replikationsgruppe** **ein Log-Volume** (**mind. 8 GB**, **SSD empfohlen**) |

### Site-Awareness (ab Server 2019)
```powershell
# Auf NODE01 – Standorte definieren
New-ClusterFaultDomain -Name Berlin -Type Site -Description "Standort A"
New-ClusterFaultDomain -Name Bochum -Type Site -Description "Standort B"
Set-ClusterFaultDomain -Name NODE01 -Parent Berlin
Set-ClusterFaultDomain -Name NODE02 -Parent Berlin
Set-ClusterFaultDomain -Name NODE03 -Parent Bochum
Set-ClusterFaultDomain -Name NODE04 -Parent Bochum

# Bevorzugter Standort
(Get-Cluster).PreferredSite = "Berlin"
```
**Wirkung**:
- **Preferred Site** **hält bei Netztrennung** **das Quorum**.
- **VMs** **starten bevorzugt** **am bevorzugten Standort**.
- **Failover** **bevorzugt** **erst den lokalen Standort**, **dann den entfernten**.
- **Site-aware Storage Spaces Direct**: **Kopien** **auf beide Standorte** **verteilt**.

### Quorum im Stretch-Cluster
| Regel | Details |
|---|---|
| **Witness** | **Dritter Standort** (**Cloud Witness = beste Wahl**) |
| **Ohne dritten Standort** | **Preferred Site** **gewinnt** **bei Netztrennung**, **anderer Standort fällt aus** |
| **Disk Witness** | **Nur bei geteiltem Speicher**, **im Stretch-Cluster** **meist ungeeignet** |
| **Dynamic Quorum** | **Passt Stimmen** **automatisch an** |

### Netzwerk und DNS
| Thema | Lösung |
|---|---|
| **Mehrere Subnetze** | **Cluster-IP pro Subnetz** (**OR-Abhängigkeit**), **nur die aktive IP online** |
| **DNS** | `RegisterAllProvidersIP = 0` (**nur aktive IP registrieren**), **`HostRecordTTL` kurz** (**z. B. 300 s**) |
| **Clients** | **Cachen alte IP** → **DNS-TTL absenken** |
| **VLAN-Streckung** | **Alternative**: **gleiches Subnetz** **über beide Standorte** |

```powershell
# Auf NODE01 – Client-Access-Point auf schnelle DNS-Aktualisierung trimmen
Get-ClusterResource "Cluster-Name-Ressource" | Set-ClusterParameter -Name RegisterAllProvidersIP -Value 0
Get-ClusterResource "Cluster-Name-Ressource" | Set-ClusterParameter -Name HostRecordTTL -Value 300
```

### Failover-Szenarien
| Szenario | Ergebnis |
|---|---|
| **Einzelner Knoten fällt aus** | **Lokaler Failover** am **gleichen Standort** |
| **Standort fällt aus** | **Restlicher Standort + Witness** **halten Quorum** → **Rollen starten dort** |
| **Netztrennung zwischen Standorten** | **Witness entscheidet**, **Preferred Site** **gewinnt** |
| **Witness weg + Standortausfall** | **Quorumverlust**, **manueller Force-Start** (**`-FixQuorum`**) |

### Stretch S2D (Datacenter, ab 2019)
- **Storage Spaces Direct** **auf beide Standorte** **verteilt**.
- **Site-Awareness** **spiegelt Daten** **standortübergreifend**.
- **Empfohlen**: **Azure Stack HCI** **(Stretch-Cluster)**.

### Vergleich
| Merkmal | **Stretch-Cluster** | **Hyper-V Replica** |
|---|---|---|
| **Failover** | **Automatisch** | **Manuell/Skript** |
| **RPO** | **0 (synchron)** | **30 s – 15 min** |
| **Kosten/Komplexität** | **Hoch** | **Niedrig** |
| **Anforderung** | **Latenz ≤ 5 ms**, **Datacenter** | **Beliebige Distanz** |

## Lab
**Maschinen**: **DC01**, **NODE01**, **NODE02** (**Standort Berlin**), **NODE03**, **NODE04** (**Standort Bochum**), **FS-WITNESS** (**dritter Standort**), alle Server 2022 **Datacenter**. Anmeldung als **Domänenadmin**.

### GUI
1. **NODE01**: **Failovercluster-Manager → Cluster erstellen** mit **NODE01–NODE04** → **Name CLU-STRETCH**.
2. **NODE01**: **CLU-STRETCH → Rechtsklick → Weitere Aktionen → Clusterquorumeinstellungen konfigurieren → Dateifreigabezeuge auswählen** → `\\FS-WITNESS\Witness`.
3. **NODE01**: **Site-Awareness** per **PowerShell** (siehe unten, **keine GUI**).
4. **NODE01**: **Speicher → Replikation** über **Storage Replica**: **PowerShell** (**Windows Admin Center → Server-Manager → Speicherreplikat**).
5. **NODE01**: **Rolle VM01** anlegen → **Bevorzugter Besitzer NODE01**.
6. **NODE01/NODE02**: **Netzwerkkabel** **von Berlin trennen** (**Simulation Standortausfall**) → **VM01 startet in Bochum**.

### PowerShell
```powershell
# Auf NODE01
Test-Cluster -Node NODE01, NODE02, NODE03, NODE04 -Include "Storage Replica","Inventory","Network","System Configuration"
New-Cluster -Name CLU-STRETCH -Node NODE01,NODE02,NODE03,NODE04 -StaticAddress 192.168.10.60, 192.168.20.60 -NoStorage
Set-ClusterQuorum -FileShareWitness \\FS-WITNESS\Witness

New-ClusterFaultDomain -Name Berlin -Type Site
New-ClusterFaultDomain -Name Bochum -Type Site
Set-ClusterFaultDomain -Name NODE01 -Parent Berlin
Set-ClusterFaultDomain -Name NODE02 -Parent Berlin
Set-ClusterFaultDomain -Name NODE03 -Parent Bochum
Set-ClusterFaultDomain -Name NODE04 -Parent Bochum
(Get-Cluster).PreferredSite = "Berlin"

# Storage Replica für Stretch (Quelle/Ziel-Volumes vorbereitet)
Test-SRTopology -SourceComputerName NODE01 -SourceVolumeName D: -SourceLogVolumeName E: -DestinationComputerName NODE03 -DestinationVolumeName D: -DestinationLogVolumeName E: -DurationInMinutes 10 -ResultPath C:\Temp
```

## Einfach

Ein **Stretch-Cluster** ist **wie zwei Läden in zwei Städten**, die **den gleichen Lagerbestand führen**. **Brennt Laden A ab**, **öffnet Laden B sofort** – **die Kunden merken es kaum**.

Damit **beide Läden immer das Gleiche wissen**, **schicken sie sich jede Änderung zu**. Das nennt man **Storage Replica**. **Synchron** heißt: „**Ich schreibe erst weiter, wenn du es auch aufgeschrieben hast**“ – **sicher**, aber **die Städte dürfen nicht weit auseinanderliegen**.

**Wer entscheidet, wenn die Leitung zwischen den Städten kappt?** Ein **Schiedsrichter in einer dritten Stadt** (**Witness**). **Ohne ihn** würden **beide Läden glauben**: „**Ich bin der Chef!**“ (**Split-Brain**).

## Merksatz
- **Stretch-Cluster** = **Cluster über 2 Standorte + Replikation + Witness am 3. Ort**.
- **Synchron** = **≤ 5 ms**, **RPO 0**.
- **Preferred Site** = **gewinnt bei Netztrennung**.
- **Cloud Witness** = **bester dritter Standort**.
- **DNS-TTL kurz** = **Clients finden neue IP schneller**.

## Prüfungsfalle
- **Storage Replica** **auf Standard** **nur 1 Partnerschaft, 1 Volume, 2 TB**.
- **Synchron** **braucht ≤ 5 ms** **Round-Trip-Latenz**.
- **Witness am dritten Standort** (**nicht** an **Standort A oder B**).
- **Ziel-Volume** **nicht lesbar/eingebunden** **im Betrieb**.
- **Preferred Site** **löst kein Failover** aus, **sie bestimmt nur Vorrang**.
- **Cluster-IPs** **je Subnetz** **mit OR-Abhängigkeit**.
- **`RegisterAllProvidersIP = 0`** **bei Multi-Subnetz**, **sonst** **Clients** **erhalten offline-IP**.
- **Stretch-Cluster ≠ Hyper-V Replica**.

## Grafik
### Zwei Standorte
Zwei Gebäude verbunden mit Pfeilen; Blitz trifft A, VMs springen nach B.

### Schiedsrichter
Dritter Standort mit Waage; Verbindung reißt, Waage kippt zum Preferred Site.

### Synchrone Replikation
Schreibvorgang läuft an, Bestätigung kommt erst nach beiden Standorten zurück.

## Karteikarten
- F: Was ist ein Stretch-Cluster? | A: Failover-Cluster über zwei Standorte.
- F: Wofür nutzt man Storage Replica? | A: Blockbasierte Replikation zwischen Volumes/Servern.
- F: Maximale Latenz für synchrone Replikation? | A: 5 ms Round-Trip.
- F: Was bedeutet RPO 0? | A: Kein Datenverlust (synchron).
- F: Wo steht der Witness idealerweise? | A: An einem dritten Standort (Cloud Witness).
- F: Was bewirkt PreferredSite? | A: Bevorzugter Standort bei Netztrennung/Start.
- F: Welches Cmdlet legt einen Standort an? | A: New-ClusterFaultDomain -Type Site.
- F: Was ist Split-Brain? | A: Beide Seiten halten sich für aktiv nach Netztrennung.
- F: Welche Edition für volle Storage Replica? | A: Datacenter (Standard begrenzt).
- F: Welche DNS-Einstellung hilft bei Multi-Subnetz? | A: RegisterAllProvidersIP = 0 und kurze HostRecordTTL.
- F: Wo liegt das Log der Replikation? | A: Auf separatem Log-Volume je Replikationsgruppe.
- F: Vorteil gegenüber Hyper-V Replica? | A: Automatisches Failover, RPO 0.

## Quiz
? Ein Cluster verteilt sich auf zwei Rechenzentren mit RPO 0. Was ist nötig?
* Storage Replica synchron, Latenz ≤ 5 ms
- Hyper-V Replica alle 15 Minuten
- DFS-R
- Azure Backup

? Wo sollte bei einem Zweistandort-Cluster der Witness liegen?
* An einem dritten Standort oder als Cloud Witness
- Auf einem Knoten in Standort A
- Auf einem Knoten in Standort B
- Auf dem DC

? Wie legt man Standorte im Cluster an?
* New-ClusterFaultDomain -Type Site
- New-ClusterSite
- Set-ClusterZone
- Add-ClusterLocation

? Welche Einstellung bestimmt, wer bei Netztrennung gewinnt?
* PreferredSite
- SameSubnetDelay
- HostRecordTTL
- FailoverThreshold

? Warum sollte HostRecordTTL kurz sein?
* Clients bekommen nach Failover schneller die neue IP
- Der Witness reagiert schneller
- Storage Replica wird schneller
- Kerberos-Tickets laufen ab

? Was ist der Unterschied zu Hyper-V Replica?
* Stretch-Cluster failt automatisch und kann RPO 0 erreichen
- Stretch-Cluster braucht keine Standorte
- Hyper-V Replica ist synchron
- Beide sind identisch
