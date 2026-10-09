---
id: server-hvsz-41
bereich: AZ-800
block: HV-S
kapitel: Hyper-V-Praxisszenarien
titel: Szenario 41 – VM hochverfügbar machen im Failover-Cluster (CSV, Rolle „Virtueller Computer“)
stufe: Profi
fach: Windows Server / AZ-800
pruefungen: [AZ-800, AZ-801, AP2, Schule]
quellen: [Microsoft Learn – Hyper-V]
verweise: [az801-failover-cluster, az801-cluster-storage-quorum, az801-knoten-recovery, server-hvsz-42]
---

## Profi

### Ticket
**Kunde meldet:** „Letzte Woche ist HV01 abgestürzt, und unser ERP war zwei Stunden weg, obwohl HV02 im selben Cluster lief. Warum ist die VM nicht umgezogen?“
- **Priorität:** hoch
- **Betroffene Maschine:** **ERP01** auf Cluster **CL01** (Knoten HV01, HV02)

### Ausgangslage
- Failover-Cluster **CL01.example.com** (192.168.10.15) mit **HV01** und **HV02**, Server 2025.
- Gemeinsamer Speicher als **CSV** unter `C:\ClusterStorage\Volume1`.
- ERP01 (192.168.10.30) wurde im **Hyper-V-Manager auf HV01** erstellt, die Dateien liegen auf `D:\Hyper-V\ERP01` (lokale Platte von HV01).
- Failover-Cluster-Manager zeigt ERP01 **nicht** unter „Rollen“.

### Analyse
- Eine VM ist nur dann hochverfügbar, wenn sie **als Clusterrolle „Virtueller Computer“** konfiguriert ist. Eine VM, die nur auf einem Knoten existiert, kennt der Cluster nicht.
- Voraussetzung: **alle VM-Dateien** (Konfiguration, VHDX, Prüfpunkte, Smart-Paging) auf **gemeinsamem Speicher**: **CSV** oder SMB-3-Freigabe (Scale-Out File Server).
- Gleiche **vSwitch-Namen** auf allen Knoten, sonst kann die VM auf dem Zielknoten nicht verbinden.
- In der Clusterrolle steuern **Bevorzugte Besitzer**, **Priorität** (Hoch/Mittel/Niedrig/Kein automatischer Start) und **Failback** das Verhalten.
- Geplante Wartung: **Live-Migration** (`Move-ClusterVirtualMachineRole -MigrationType Live`) bzw. Knoten **anhalten mit Ausgleichen** (Drain). Ungeplanter Ausfall: der Cluster **startet** die VM auf einem anderen Knoten neu (kein Live-Übergang).

### Lösungsweg
1. **Speichermigration** von ERP01 auf das CSV: `Move-VMStorage` nach `C:\ClusterStorage\Volume1\ERP01`. *Begründung:* Der zweite Knoten muss auf alle Dateien zugreifen können; geht im laufenden Betrieb.
2. **vSwitch-Namen** prüfen: auf HV01 und HV02 jeweils „Extern“. *Begründung:* Sonst schlägt Failover wegen fehlender Netzwerkverbindung fehl.
3. **Clusterrolle hinzufügen**: Failover-Cluster-Manager → Rollen → Rolle konfigurieren → **Virtueller Computer** → ERP01. *Begründung:* Erst jetzt überwacht der Cluster die VM.
4. Bericht des Assistenten lesen (Warnungen, z. B. zu DVD-Laufwerken mit lokalem ISO). *Begründung:* Lokale ISOs verhindern Failover.
5. **Priorität Hoch** setzen. *Begründung:* Nach einem Ausfall startet ERP vor unwichtigen VMs.
6. **Live-Migration** testen und einen **Knotenausfall simulieren**. *Begründung:* Beweis für den Kunden.

### Ergebnis prüfen
- `Get-ClusterGroup -Cluster CL01` → ERP01 Online.
- `Move-ClusterVirtualMachineRole -Name ERP01 -Node HV02 -MigrationType Live` → Dauerping ohne nennenswerten Verlust.
- HV01 hart ausschalten (Lab!) → ERP01 startet nach kurzer Zeit auf HV02.

### Vorbeugung
- Neue VMs **immer** über den Failover-Cluster-Manager (Rollen → Virtuelle Computer → Neuer virtueller Computer) erstellen.
- Regelmäßig prüfen: `Get-VM -ComputerName HV01, HV02 | Where-Object IsClustered -eq $false`.
- Clustervalidierung (`Test-Cluster`) nach Änderungen.

## Einfach
Stell dir zwei **Busfahrer** (HV01 und HV02) vor, die abwechselnd eine Buslinie fahren können. Fällt ein Fahrer krank aus, übernimmt der andere – aber nur, wenn die Fahrgäste **an der gemeinsamen Haltestelle** warten.

ERP01 hat aber nicht an der gemeinsamen Haltestelle gewartet, sondern **im Haus von Fahrer 1** (lokale Festplatte von HV01). Als Fahrer 1 krank wurde, kam Fahrer 2 gar nicht an die Fahrgäste heran. Außerdem stand ERP01 gar nicht auf dem **Fahrplan** des Busunternehmens (keine Clusterrolle) – also wusste niemand, dass er abgeholt werden muss.

Die Lösung:
1. Die Fahrgäste an die **gemeinsame Haltestelle** bringen (Dateien auf das CSV verschieben).
2. ERP01 in den **Fahrplan** eintragen (Rolle „Virtueller Computer“).
3. Ihm eine **hohe Priorität** geben, damit er zuerst abgeholt wird.

Jetzt kann bei Wartung sogar während der Fahrt der Fahrer gewechselt werden (Live-Migration). Nur bei einem plötzlichen Ausfall muss der Bus kurz neu starten.

## Merksatz
- **Hochverfügbar = Clusterrolle „Virtueller Computer“.**
- **Alle** VM-Dateien auf **CSV** oder SOFS.
- **Gleiche vSwitch-Namen** auf allen Knoten.
- Geplant = **Live-Migration**, ungeplant = **Neustart** auf anderem Knoten.

## Prüfungsfalle
- Eine VM im Hyper-V-Manager auf einem Clusterknoten ist **nicht automatisch** hochverfügbar.
- Liegt die VHDX lokal, scheitert das Failover – der Assistent warnt, aber die Rolle kann trotzdem erstellt werden.
- Bei einem ungeplanten Knotenausfall gibt es **keinen** unterbrechungsfreien Übergang – der Gast wird neu gestartet.
- Automatische Startaktion der VM wird bei Cluster-VMs vom Cluster übernommen.

## Grafik
### Failover der ERP-VM
1. Admin -> CSV: Move-VMStorage ERP01 nach Volume1
2. Admin -> CL01: Rolle Virtueller Computer für ERP01
3. HV01 -> HV02: geplante Live-Migration ohne Ausfall
4. HV01: Knoten fällt aus, Heartbeat bleibt aus
5. CL01 -> HV02: startet ERP01 neu (Priorität Hoch)
6. Client -> ERP01: nach kurzem Neustart wieder erreichbar

## Lab
**Nachstellen:** VM lokal anlegen (Fehler), dann hochverfügbar machen. Maschinen: Cluster **CL01** mit **HV01**, **HV02** (z. B. aus Szenario 42), VM **ERP01**.

### GUI
1. **HV01**: Hyper-V-Manager → Neu → Virtueller Computer **ERP01**, Speicherort `D:\Hyper-V` (lokal) → starten → Failover-Cluster-Manager: ERP01 fehlt unter Rollen (Fehlerbild).
2. **HV01**: Hyper-V-Manager → ERP01 → **Verschieben** → „Speicher des virtuellen Computers verschieben“ → „Alle Daten an einen Ort“ → `C:\ClusterStorage\Volume1\ERP01`.
3. **HV01**: Failover-Cluster-Manager → CL01 → **Rollen** → **Rolle konfigurieren** → „Virtueller Computer“ → ERP01 anhaken → Weiter → Bericht prüfen.
4. **HV01**: Rollen → ERP01 → Eigenschaften → **Priorität** „Hoch“, **Bevorzugte Besitzer** HV01, HV02.
5. **HV01**: ERP01 → Rechtsklick → **Verschieben** → **Livemigration** → Knoten HV02.
6. **Host**: HV02 (Lab-VM) hart ausschalten → ERP01 startet auf HV01 neu.

### PowerShell
```powershell
# Auf HV01 – Speicher auf CSV verschieben (läuft online)
Move-VMStorage -VMName ERP01 -DestinationStoragePath "C:\ClusterStorage\Volume1\ERP01"

# Auf HV01 – vSwitch-Namen auf beiden Knoten vergleichen
Get-VMSwitch -ComputerName HV01, HV02 | Format-Table ComputerName, Name, SwitchType

# Auf HV01 – Clusterrolle erstellen
Add-ClusterVirtualMachineRole -VMName ERP01 -Cluster CL01
(Get-ClusterGroup -Name ERP01).Priority = 3000     # 3000 = Hoch

# Auf HV01 – Live-Migration testen
Move-ClusterVirtualMachineRole -Name ERP01 -Node HV02 -MigrationType Live
Get-ClusterGroup -Name ERP01 | Format-Table Name, OwnerNode, State

# Auf HV01 – nicht geclusterte VMs finden
Get-VM -ComputerName HV01, HV02 | Where-Object IsClustered -eq $false | Select-Object ComputerName, Name
```

## Reihenfolge
### Bestehende VM hochverfügbar machen
1. VM-Speicher auf CSV verschieben
2. vSwitch-Namen auf allen Knoten angleichen
3. Lokale ISO-Medien entfernen
4. Rolle Virtueller Computer im Cluster hinzufügen
5. Priorität und bevorzugte Besitzer festlegen
6. Live-Migration und Knotenausfall testen

## Szenario
### Kontrollfragen
ERP01 wurde auf HV01 im Hyper-V-Manager angelegt und liegt auf D: von HV01. Bei Ausfall von HV01 startete die VM nicht auf HV02.
- F: Warum hat der Cluster nicht reagiert? | A: ERP01 war keine Clusterrolle und ihre Dateien lagen auf lokalem Speicher.
- F: Wohin müssen die VM-Dateien? | A: Auf gemeinsamen Speicher – CSV (C:\ClusterStorage\VolumeX) oder SMB-3-Freigabe (SOFS).
- F: Welches Cmdlet fügt die Clusterrolle hinzu? | A: Add-ClusterVirtualMachineRole -VMName ERP01
- F: Was passiert bei einem ungeplanten Knotenausfall? | A: Der Cluster startet die VM auf einem anderen Knoten neu.
- F: Welche Netzwerkvoraussetzung gilt? | A: Gleiche vSwitch-Namen auf allen Knoten.

## Legende
### Clusterrolle „Virtueller Computer“
- Was: Clusterressourcengruppe, die eine VM überwacht und bei Ausfall auf andere Knoten verschiebt.
- Wie: Failover-Cluster-Manager → Rolle konfigurieren oder Add-ClusterVirtualMachineRole.
- Wann: Für jede VM, die einen Hostausfall überstehen soll.
- Wo: Im Failover-Cluster mit gemeinsamem Speicher.
- Warum: Automatischer Neustart bei Ausfall und Live-Migration bei Wartung.
### CSV (Cluster Shared Volume)
- Was: Clustervolume, auf das alle Knoten gleichzeitig zugreifen.
- Wo: C:\ClusterStorage\VolumeX auf jedem Knoten.
- Warum: VMs verschiedener Knoten teilen sich ein Volume, Failover ohne Laufwerksübergabe.

## Karteikarten
- F: Wann ist eine VM im Cluster hochverfügbar? | A: Wenn sie als Clusterrolle „Virtueller Computer“ konfiguriert ist und alle Dateien auf gemeinsamem Speicher liegen.
- F: Unter welchem Pfad liegen CSVs? | A: C:\ClusterStorage\VolumeX
- F: Cmdlet zum Hinzufügen einer VM als Clusterrolle? | A: Add-ClusterVirtualMachineRole -VMName VM
- F: Cmdlet für Live-Migration im Cluster? | A: Move-ClusterVirtualMachineRole -Name VM -Node HV02 -MigrationType Live
- F: Was passiert bei ungeplantem Knotenausfall? | A: Neustart der VM auf einem anderen Knoten.
- F: Was muss auf allen Knoten gleich heißen? | A: Die virtuellen Switches.
- F: Welche Prioritäten gibt es für Clusterrollen? | A: Hoch, Mittel, Niedrig, Kein automatischer Start.
- F: Wie verschiebt man den VM-Speicher im Betrieb? | A: Move-VMStorage (Speichermigration).

## Quiz
? Warum wurde ERP01 beim Ausfall von HV01 nicht auf HV02 gestartet?
* Keine Clusterrolle, und sie lag auf lokalem Speicher
- Live-Migration war in den Hyper-V-Einstellungen deaktiviert
- HV02 hatte zu wenige freie logische Prozessoren
- Die Integrationsdienste in ERP01 waren veraltet
! Der Cluster kennt nur VMs, die als Rolle hinzugefügt wurden.

? Wo müssen die Dateien einer hochverfügbaren VM liegen?
* Auf CSV oder einer SMB-3-Freigabe (SOFS)
- Auf der Systemplatte des ersten Knotens
- Auf einem USB-Stick
- Im Profilordner des Admins
! Alle Knoten müssen Zugriff haben.

? Welches Cmdlet macht eine bestehende VM hochverfügbar?
* Add-ClusterVirtualMachineRole
- New-ClusterGroup -Hyper-V
- Set-VM -HighlyAvailable
- Enable-VMReplication
! Danach erscheint die VM unter Rollen.

? Was passiert bei einem ungeplanten Ausfall eines Knotens?
* Die VM wird auf einem anderen Knoten neu gestartet
- Die VM wird live ohne Unterbrechung migriert
- Die VM bleibt aus bis zur Reparatur
- Die VM wird auf den letzten Prüfpunkt zurückgesetzt
! Live-Migration ist nur geplant möglich.

? Welche Voraussetzung gilt für die Netzwerkanbindung?
* Gleiche vSwitch-Namen auf allen Knoten
- Unterschiedliche vSwitch-Namen pro Knoten
- Nur private Switches
- MAC-Spoofing an allen VMs
! Sonst kann die VM auf dem Zielknoten nicht verbinden.

? Wie verschiebt man die Dateien einer laufenden VM auf das CSV?
* Move-VMStorage
- Copy-Item bei laufender VM
- Export-VM mit -Live
- Optimize-VHD
! Speichermigration läuft online.

? Was bewirkt die Priorität „Hoch“ einer Cluster-VM?
* Sie startet nach Ausfällen vor niedriger priorisierten VMs
- Sie bekommt dauerhaft mehr CPU-Zeit als andere VMs
- Sie wird vom Cluster niemals auf einen anderen Knoten migriert
- Sie erhält automatisch dynamischen RAM mit hohem Puffer
! Prioritäten steuern die Startreihenfolge im Cluster.

? Wie wartet man einen Knoten ohne VM-Ausfall?
* Anhalten mit Rollen ausgleichen (Drain) – VMs werden live migriert
- Knoten einfach neu starten, der Cluster startet die VMs woanders
- Den Clusterdienst beenden, damit die VMs automatisch umziehen
- Alle VMs auf dem Knoten pausieren und nach der Wartung fortsetzen
! Drain verschiebt die Rollen vorher.
