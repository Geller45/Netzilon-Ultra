---
id: az800-integrationsdienste
bereich: AZ-800
block: A7
kapitel: VMs & Container
titel: Hyper-V-Integrationsdienste
stufe: Einsteiger
quellen: [AZ-800 Study Guide, Microsoft Learn]
verweise: [az800-enhanced-session, az800-powershell-direct, az800-vm-ram, az800-pruefpunkte, az801-dc-haertung]
---

## Profi

### Zweck
**Integrationsdienste** (Integration Services) sind Treiber und Dienste im **Gastbetriebssystem**, die mit dem Hyper-V-Host über den **VMBus** kommunizieren. Sie machen die VM zu einer „aufgeklärten“ (**enlightened**) VM: bessere Leistung (synthetische Geräte statt Emulation) und Zusammenarbeit mit dem Host.
- Windows (ab Windows 10/Server 2016) und aktuelle Linux-Kernel enthalten die Integrationsdienste bereits („**Linux Integration Services**“ im Kernel); Updates kommen über **Windows Update** im Gast – die frühere Installation per ISO („vmguest.iso“) ist Geschichte.

### Die Dienste
| Dienst (dt. Name) | Funktion | Standard |
|---|---|---|
| **Herunterfahren des Betriebssystems** (Shutdown) | Host kann den Gast **sauber herunterfahren** (Hyper-V-Manager „Herunterfahren“, Host-Neustart, Cluster) | an |
| **Zeitsynchronisierung** (Time Synchronization) | Gastuhr mit dem Host abgleichen, v. a. nach Wiederherstellen/Pause | an |
| **Datenaustausch** (Key-Value-Pair Exchange, KVP) | Austausch von Informationen Host ↔ Gast über Registrierungsschlüssel (z. B. Gast-IP-Adressen, Computername, OS-Version im Hyper-V-Manager) | an |
| **Takt** (Heartbeat) | meldet, ob der Gast **reagiert** (Status „OK“); Grundlage für Cluster-Überwachung | an |
| **Sicherung (Volumeschattenkopie)** (VSS) | **anwendungskonsistente Sicherungen/Produktionsprüfpunkte** durch VSS im Gast | an |
| **Gastdienste** (Guest Service Interface) | Dateien vom Host in die VM kopieren (`Copy-VMFile`) | **aus** |
| **PowerShell Direct**-Dienst | PowerShell Direct (VMBus) | an (Gast) |
(Die **Dynamic Memory**-Unterstützung, synthetische Netzwerk-/Speicher-/Grafiktreiber und die erweiterte Sitzung gehören ebenfalls zu den VMBus-Komponenten.)

### Konfiguration
- **Host-seitig** pro VM ein-/ausschalten: VM → Einstellungen → **Integrationsdienste** (Haken) bzw. `Enable-/Disable-VMIntegrationService`.
- **Gast-seitig** laufen die zugehörigen Windows-Dienste („Hyper-V-Taktdienst“, „Hyper-V-Datenaustauschdienst“, „Hyper-V-Dienst für Gastherunterfahren“, „Hyper-V-Dienst für Zeitsynchronisierung“, „Hyper-V-Volumeschattenkopie-Anforderer“, „Hyper-V PowerShell Direct-Dienst“, „Hyper-V-Gastdienstschnittstelle“). Ein Dienst funktioniert nur, wenn er **auf beiden Seiten** aktiv ist.
- Status: `Get-VMIntegrationService -VMName SRV01` → PrimaryStatusDescription „OK“ oder „Keine Kontaktaufnahme“ (Gast läuft nicht/kein Dienst) bzw. „Protokollversionskonflikt“ (veraltete Dienste im Gast).

### Wann deaktivieren?
- **Zeitsynchronisierung** auf **virtuellen Domänencontrollern** (bzw. in Domänen allgemein): Die Domänenzeit soll aus der **AD-Hierarchie** (PDC-Emulator → externe NTP-Quelle) kommen, nicht vom Host. Empfehlung: Den Hyper-V-Zeitanbieter im Gast **nur für den Start/Wiederherstellung** nutzen oder den Integrationsdienst am DC deaktivieren, wenn der Host selbst die Zeit aus der Domäne bezieht (sonst Zirkelbezug). Der **PDC-Emulator** der Stammdomäne sollte eine **externe** Zeitquelle haben.
- **Gastdienste** nur bei Bedarf aktivieren (Sicherheit: Dateien in VMs einschleusen).
- **Datenaustausch** in hochsicheren Umgebungen, wenn Informationen über den Gast nicht zum Host sollen.
- Sonst **alle aktiv lassen**.

### Linux-Gäste
Moderne Distributionen (RHEL, Ubuntu, SUSE, Debian) enthalten die LIS-Module (`hv_vmbus`, `hv_netvsc`, `hv_storvsc`, `hv_utils`, `hv_balloon`) – optional Daemons `hv_kvp_daemon`, `hv_vss_daemon`, `hv_fcopy_daemon` installieren (Paket `hyperv-daemons`/`linux-cloud-tools`). Gen-2-VMs mit Linux: **Secure Boot** auf Vorlage „Microsoft UEFI-Zertifizierungsstelle“ umstellen.

## Lab
**Maschinen**: Hyper-V-**Host**, VM **SRV01** (Windows Server), VM **DC02** (virtueller DC), VM **LNX01** (Ubuntu).

### GUI
1. **Host**: SRV01 → Einstellungen → **Integrationsdienste** → alle Haken ansehen; **Gastdienste** aktivieren.
2. **Host**: Hyper-V-Manager → SRV01 markieren → unten Registerkarte **Netzwerk** → IP-Adressen des Gasts (kommt über **Datenaustausch**); Spalte **Takt** „OK“.
3. **SRV01**: `services.msc` → Hyper-V-Dienste ansehen → „Hyper-V-Taktdienst“ **beenden** → **Host**: Takt-Status wechselt auf „Keine Kontaktaufnahme“ → Dienst wieder starten.
4. **Host**: SRV01 → **Herunterfahren** (Aktion) → Gast fährt sauber herunter (Dienst Herunterfahren).
5. **Host**: DC02 → Integrationsdienste → **Zeitsynchronisierung** deaktivieren → in DC02: `w32tm /query /source` → Domänenhierarchie.
6. **LNX01**: `lsmod | grep hv_` → Module sichtbar; `sudo apt install linux-cloud-tools-virtual` für die Daemons.

### PowerShell
```powershell
# Auf dem Host
Get-VMIntegrationService -VMName SRV01 | Format-Table Name, Enabled, PrimaryStatusDescription
Enable-VMIntegrationService -VMName SRV01 -Name "Gastdienstschnittstelle"      # EN: "Guest Service Interface"
Disable-VMIntegrationService -VMName DC02 -Name "Zeitsynchronisierung"          # EN: "Time Synchronization"
Copy-VMFile -Name SRV01 -SourcePath C:\Tools\setup.exe -DestinationPath C:\Temp\setup.exe -FileSource Host -CreateFullPath

# IP-Adressen der Gäste (über KVP)
Get-VMNetworkAdapter -VMName * | Select-Object VMName, IPAddresses

# Im Gast (SRV01)
Get-Service vmic* | Format-Table Name, DisplayName, Status
w32tm /query /source
```

## Einfach

Eine VM ist wie ein **Zimmer im Haus des Hosts**. Die **Integrationsdienste** sind die **Gegensprechanlage** zwischen Zimmer und Hausmeister (Host):
- **Herunterfahren**: Der Hausmeister kann höflich sagen „Bitte Licht aus“ – statt einfach den Strom abzustellen.
- **Zeitsynchronisierung**: Die **Uhr im Zimmer** wird mit der Hausuhr abgeglichen.
- **Datenaustausch**: Das Zimmer erzählt, wie es heißt und welche IP es hat – deshalb sieht man die IP im Hyper-V-Manager.
- **Takt (Herzschlag)**: „Ich lebe noch!“ – alle paar Sekunden. Kommt keiner mehr, weiß der Hausmeister: Problem!
- **Sicherung (VSS)**: Vor einem Foto/Backup räumt das Zimmer kurz auf, damit alles ordentlich gespeichert wird.
- **Gastdienste**: Der Hausmeister darf **Pakete (Dateien) ins Zimmer schieben** – standardmäßig aus, weil es ein Sicherheitsrisiko sein kann.

**Wichtig bei Domänencontrollern**: Die Uhr eines DCs soll nicht vom Hausmeister kommen, sondern von der **offiziellen Uhr der Domäne** (PDC-Emulator). Deshalb schaltet man dort die Zeitsynchronisierung mit dem Host aus.

Moderne Windows- und Linux-Versionen haben die Gegensprechanlage **schon eingebaut** – man muss nichts mehr extra installieren.

## Merksatz
- Integrationsdienste = **Kommunikation Host ↔ Gast über VMBus**.
- 7 Dienste: **Herunterfahren, Zeit, Datenaustausch, Takt, VSS, Gastdienste, PowerShell Direct**.
- **Gastdienste standardmäßig aus**.
- Virtuelle **DCs**: Zeitsynchronisierung mit dem Host **deaktivieren**.
- Updates über **Windows Update** (kein vmguest.iso mehr).

## Prüfungsfalle
- Copy-VMFile scheitert, weil die Gastdienstschnittstelle deaktiviert ist.
- IP-Adressen im Hyper-V-Manager fehlen → Datenaustausch aus.
- Produktionsprüfpunkte benötigen den VSS-Integrationsdienst.
- Dienst muss auf Host und im Gast aktiv sein.
- DCs mit Host-Zeitsync → Zeitabweichungen/Kerberos-Probleme.

## Grafik
### Gegensprechanlage
Host-Haus mit mehreren Zimmern (VMs); pro Zimmer eine Sprechanlage mit sieben Knöpfen; Klick zeigt die jeweilige Funktion (z. B. Herzsymbol pulsiert beim Takt, Uhrensymbol beim Zeitabgleich, Paket beim Gastdienst).

### Zeitquelle am DC
Zwei Pfeile zur DC-Uhr: vom Host (durchgestrichen) und vom PDC-Emulator/externer NTP-Quelle (grün).

## Karteikarten
- F: Was sind Integrationsdienste? | A: Gastkomponenten, die über den VMBus mit dem Hyper-V-Host kommunizieren (Leistung, Verwaltung).
- F: Welcher Integrationsdienst liefert die Gast-IP an den Host? | A: Datenaustausch (KVP).
- F: Welcher Dienst meldet, ob der Gast reagiert? | A: Takt (Heartbeat).
- F: Welcher Dienst ist standardmäßig deaktiviert? | A: Gastdienste (Guest Service Interface).
- F: Wozu dient der Dienst Sicherung (Volumeschattenkopie)? | A: Anwendungskonsistente Sicherungen und Produktionsprüfpunkte über VSS im Gast.
- F: Welcher Dienst sollte bei virtuellen DCs deaktiviert werden? | A: Zeitsynchronisierung (Zeit aus der Domänenhierarchie).
- F: Wie werden Integrationsdienste in modernen Gästen aktualisiert? | A: Über Windows Update (bzw. Linux-Kernel-Updates).
- F: Cmdlet zum Anzeigen des Status? | A: Get-VMIntegrationService -VMName <VM>.

## Quiz
? Im Hyper-V-Manager werden die IP-Adressen einer VM nicht angezeigt. Welcher Integrationsdienst ist vermutlich deaktiviert?
* Datenaustausch
- Takt
- Zeitsynchronisierung
- Herunterfahren

? Copy-VMFile schlägt fehl. Welcher Dienst muss aktiviert werden?
* Gastdienstschnittstelle
- Datenaustausch
- Sicherung (Volumeschattenkopie)
- Takt

? Welcher Integrationsdienst wird für virtuelle Domänencontroller oft deaktiviert?
* Zeitsynchronisierung
- Takt
- Herunterfahren
- Datenaustausch

? Der Host soll eine VM sauber herunterfahren können. Welcher Dienst?
* Herunterfahren des Betriebssystems
- Gastdienste
- Takt
- KVP

? Welcher Dienst ist Voraussetzung für Produktionsprüfpunkte?
* Sicherung (Volumeschattenkopie)
- Zeitsynchronisierung
- Gastdienste
- Datenaustausch
