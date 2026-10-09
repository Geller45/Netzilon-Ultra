---
id: server-hvsz-20
bereich: AZ-800
block: HV-S
kapitel: Hyper-V-Praxisszenarien
titel: Szenario 20 – Geplantes Failover mit Hyper-V-Replikat
stufe: Profi
fach: Windows Server / AZ-800
pruefungen: [AZ-800, AP2, Schule]
quellen: [Microsoft Learn – Hyper-V]
verweise: [az801-hyperv-replica, server-hvsz-19]
---

## Profi

### Ticket
**Kunde meldet:** „Am Samstag wird im Hauptgebäude der Strom für Wartungsarbeiten abgeschaltet. ERP01 soll in dieser Zeit im Nebengebäude auf HV02 laufen – ohne Datenverlust. Danach wollen wir zurück.“
- Datum/Priorität: 10.10.2026, **Priorität 3 (geplant)**, Wartungsfenster Samstag 06:00–18:00.
- Betroffene Maschinen: **HV01.example.com** (Primär), **HV02.example.com** (Replikat), VM **ERP01**.

### Ausgangslage
- Hyper-V-Replikat für ERP01 läuft (Szenario 19): HV01 → HV02, Kerberos/HTTP, 5 Minuten, Integrität *Normal*.
- Gleiches Subnetz 192.168.10.0/24 in beiden Gebäuden (gestrecktes VLAN) – ERP01 behält 192.168.10.90.
- HV01 ist **noch nicht** als Replikatserver konfiguriert (wird für die Rückrichtung gebraucht).

### Analyse
Hyper-V-Replikat kennt drei Failover-Arten:
| Art | Ausgelöst auf | Primär-VM | Datenverlust | Zweck |
|---|---|---|---|---|
| **Testfailover** | Replikatserver | läuft weiter | – (Test-VM in isoliertem Netz) | DR-Test ohne Unterbrechung |
| **Geplantes Failover** | **Primärserver** | muss **ausgeschaltet** sein | **keiner** – letzte Änderungen werden vorher übertragen | Wartung, geplanter Umzug |
| **Nicht geplantes Failover** | Replikatserver | ausgefallen | ja, bis zum letzten Replikationszyklus | echter Notfall |

Beim **geplanten Failover** sendet der Primärserver die noch nicht replizierten Änderungen, schaltet das Failover auf dem Replikat und kann die **Replikationsrichtung umkehren** (*Reverse Replication*). Dafür muss der bisherige Primärserver **selbst als Replikatserver** konfiguriert sein.

| Risiko | Prüfung |
|---|---|
| Replikation nicht gesund | `Get-VMReplication -VMName ERP01` (Health Normal) |
| HV01 nicht als Replikatserver aktiviert → Umkehr scheitert | `Get-VMReplicationServer -ComputerName HV01` |
| Anderes Subnetz am Ziel | ggf. Failover-TCP/IP-Einstellungen an der Replikat-vNIC |
| Firewallregel auf HV01 aus | `Get-NetFirewallRule -Name VIRT-HVRHTTPL-In-TCP-NoScope` |

### Lösungsweg
1. **Vorbereitung**: HV01 als Replikatserver aktivieren (Kerberos, HV02 autorisieren) und Firewallregel freigeben – Begründung: Ohne diese Konfiguration kann die Replikation nach dem Failover nicht umgekehrt werden.
2. **ERP01 auf HV01 herunterfahren** – Begründung: Geplantes Failover verlangt eine ausgeschaltete Primär-VM, damit keine neuen Änderungen entstehen.
3. **Auf HV01: Geplantes Failover** (Replikation → Geplantes Failover) mit *Replikationsrichtung nach dem Failover umkehren* und *Replikat-VM nach dem Failover starten* – Begründung: überträgt die Restdaten → **kein Datenverlust**.
4. **Ergebnis auf HV02 prüfen**: ERP01 läuft, Anmeldungen funktionieren.
5. **Nach der Wartung** dasselbe Verfahren in Gegenrichtung (ERP01 auf HV02 herunterfahren → geplantes Failover auf HV02 → Richtung umkehren) – Begründung: Rückkehr ohne Datenverlust, ursprünglicher Zustand.

### Ergebnis prüfen
- Während der Wartung: `Get-VM ERP01 -ComputerName HV02` → *Running*; `Get-VMReplication -ComputerName HV02` zeigt HV02 als **Primary**, HV01 als Replikat.
- Nach Rückkehr: HV01 wieder Primary, Integrität *Normal*.

### Vorbeugung
- Mindestens halbjährlich **Testfailover** durchführen.
- Beide Hosts von Anfang an als Replikatserver konfigurieren (bidirektional vorbereitet).
- Bei unterschiedlichen Subnetzen **Failover-TCP/IP** an der vNIC pflegen.
- Runbook mit Schritten, Verantwortlichen und Rückweg dokumentieren.

## Einfach

Stell dir vor, im Hauptgebäude ist morgen **kein Strom**. ERP01 soll deshalb ins Nebengebäude **umziehen** – und dabei soll **keine einzige Seite** des Tagebuchs fehlen.

Der Brieffreund (HV02) hat schon fast alles abgeschrieben. Es fehlen nur die Seiten der letzten Minuten. Beim **geplanten Failover**:
1. ERP01 im Hauptgebäude **legt den Stift weg** (wird heruntergefahren) – es kommen keine neuen Seiten dazu.
2. HV01 schickt die **letzten Seiten** hinterher.
3. HV02 macht **seine Kopie zum Original** und startet ERP01.
4. Ab jetzt schreibt HV02 und schickt **seine** neuen Seiten an HV01 (Richtung umgekehrt).

Damit HV01 Briefe **annehmen** kann, muss auch HV01 vorher sagen: „Ich nehme Briefe an“ (als Replikatserver aktivieren).

Nach der Wartung macht man das Ganze **rückwärts** – und alles ist wie vorher.

## Merksatz
- Geplantes Failover: **Primär-VM aus**, auslösen **auf dem Primärserver**, **kein Datenverlust**.
- Umkehr der Replikation braucht den alten Primärserver als **Replikatserver**.
- Test = Replikat-Seite, isoliert; Ungeplant = Replikat-Seite, Datenverlust möglich.

## Prüfungsfalle
- Ein **geplantes** Failover startet man auf dem **Primärserver**, ein **ungeplantes** auf dem **Replikatserver**.
- Bei laufender Primär-VM ist ein geplantes Failover **nicht** möglich.
- **Testfailover** unterbricht die Produktion nicht – es entsteht eine Test-VM.
- Ohne Replikatserver-Konfiguration auf HV01 klappt die **Umkehr** nicht.

## Grafik
### Umzug ohne verlorene Seite
1. Admin -> HV01: HV01 als Replikatserver aktivieren
2. Admin -> ERP01: Auf HV01 herunterfahren
3. HV01 -> HV02: Nicht replizierte Änderungen senden
4. HV02: Failover, Replikat wird Primär
5. HV02 -> HV01: Replikationsrichtung umgekehrt
6. HV02: ERP01 gestartet, kein Datenverlust
7. HV02 -> HV01: Nach der Wartung geplantes Failover zurück

## Lab
**Maschinen**: **HV01.example.com**, **HV02.example.com**, VM **ERP01** mit laufender Replikation (Szenario 19).
Nachstellen: Zuerst den Fehler bewusst erzeugen, dann beheben.

### GUI
1. **HV01**: Hyper-V-Manager → ERP01 (läuft) → Replikation → **Geplantes Failover** → Meldung, dass die VM ausgeschaltet sein muss (Fehlerzustand 1).
2. **HV01**: ERP01 → **Herunterfahren** → Replikation → **Geplantes Failover** → *Replikationsrichtung umkehren* aktiviert → **Failover** → Fehler bei der Umkehr, weil HV01 kein Replikatserver ist (Fehlerzustand 2, falls noch nicht vorbereitet).
3. **HV01**: Hyper-V-Einstellungen → **Replikationskonfiguration** → Als Replikatserver aktivieren → Kerberos (HTTP) → angegebener Server `HV02.example.com`, Speicherort `D:\Replica` → OK; Firewallregel **Hyper-V Replica HTTP Listener (TCP-In)** aktivieren.
4. **HV01**: ERP01 → Replikation → **Geplantes Failover** → Haken *Replikationsrichtung nach dem Failover umkehren* und *Virtuellen Computer nach dem Failover starten* → **Failover**.
5. **HV02**: Hyper-V-Manager → ERP01 *Wird ausgeführt* → Replikation → **Replikationsintegrität anzeigen** → HV02 ist Primärserver.
6. **HV02** (nach der Wartung): ERP01 herunterfahren → Replikation → **Geplantes Failover** mit Umkehr → ERP01 läuft wieder auf HV01.

### PowerShell
1. **HV01**: Rückrichtung vorbereiten.
2. **HV01** und **HV02**: geplantes Failover in der von Microsoft dokumentierten Reihenfolge.
3. **HV02**: Ergebnis prüfen.

```powershell
# Auf HV01 – als Replikatserver vorbereiten
Set-VMReplicationServer -ReplicationEnabled $true -AllowedAuthenticationType Kerberos -ReplicationAllowedFromAnyServer $false
New-VMReplicationAuthorizationEntry -AllowedPrimaryServer HV02.example.com -ReplicaStorageLocation D:\Replica -TrustGroup ERP
Get-NetFirewallRule -Name "VIRT-HVR*" | Select-Object Name, DisplayName, Enabled   # Regelnamen prüfen
Enable-NetFirewallRule -Name VIRT-HVRHTTPL-In-TCP-NoScope         # HTTP-Listener (Kerberos)

# Auf HV01 – Primär-VM aus und Failover vorbereiten
Stop-VM -Name ERP01
Start-VMFailover -VMName ERP01 -Prepare

# Auf HV02 – Failover, Umkehr, Start
Start-VMFailover -VMName ERP01
Set-VMReplication -VMName ERP01 -Reverse
Start-VM -Name ERP01

# Auf HV02 – prüfen
Get-VMReplication -VMName ERP01 | Format-List Name, State, Health, Mode, PrimaryServer, ReplicaServer
```

## Szenario
### Kontrollfragen
ERP01 wird von HV01 nach HV02 repliziert und soll wegen Wartung ohne Datenverlust auf HV02 laufen.
- F: Welche Failover-Art ist richtig? | A: Geplantes Failover – es überträgt vor dem Umschalten die noch nicht replizierten Änderungen.
- F: Welche Voraussetzung gilt für die Primär-VM? | A: Sie muss ausgeschaltet sein.
- F: Auf welchem Server wird das geplante Failover gestartet? | A: Auf dem Primärserver (HV01); per PowerShell zuerst Start-VMFailover -Prepare auf HV01, dann Start-VMFailover auf HV02.
- F: Was ist für die Umkehr der Replikation nötig? | A: HV01 muss als Replikatserver konfiguriert sein (inklusive Firewallregel).
- F: Wodurch unterscheidet sich das ungeplante Failover? | A: Es wird auf dem Replikatserver ausgelöst, wenn der Primärserver ausgefallen ist; Daten seit der letzten Replikation können verloren gehen.

## Reihenfolge
### Geplantes Failover (PowerShell-Ablauf)
1. Alten Primärserver als Replikatserver vorbereiten
2. VM auf dem Primärserver herunterfahren
3. Start-VMFailover -Prepare auf dem Primärserver
4. Start-VMFailover auf dem Replikatserver
5. Set-VMReplication -Reverse auf dem Replikatserver
6. VM auf dem Replikatserver starten
7. Replikationsstatus prüfen

## Legende
### Geplantes Failover
- Was: Kontrollierte Umschaltung einer replizierten VM auf den Replikatserver ohne Datenverlust.
- Wie: Primär-VM herunterfahren, Replikation → Geplantes Failover bzw. `Start-VMFailover -Prepare` (Primär) und `Start-VMFailover`, `Set-VMReplication -Reverse`, `Start-VM` (Replikat).
- Wann: bei geplanter Wartung, Standortumzug oder Notfallübung mit echtem Umschalten.
- Wo: Start auf dem Primärserver HV01, Abschluss auf dem Replikatserver HV02.
- Warum: Die Restdaten werden vor dem Umschalten übertragen; die Umkehr hält die Replikation in Gegenrichtung aufrecht.

## Karteikarten
- F: Welche drei Failover-Arten gibt es bei Hyper-V-Replikat? | A: Testfailover, geplantes Failover, nicht geplantes Failover.
- F: Wo startet man ein geplantes Failover? | A: Auf dem Primärserver.
- F: Wo startet man ein ungeplantes Failover? | A: Auf dem Replikatserver.
- F: Zustand der Primär-VM beim geplanten Failover? | A: Ausgeschaltet.
- F: Gibt es beim geplanten Failover Datenverlust? | A: Nein, offene Änderungen werden vorher übertragen.
- F: Was braucht die Replikationsumkehr? | A: Der bisherige Primärserver muss als Replikatserver konfiguriert sein.
- F: PowerShell auf dem Primärserver vor dem Failover? | A: Start-VMFailover -VMName ERP01 -Prepare
- F: Welches Cmdlet kehrt die Replikation um? | A: Set-VMReplication -VMName ERP01 -Reverse
- F: Was erzeugt ein Testfailover? | A: Eine Test-VM auf dem Replikatserver, die Produktion läuft weiter.

## Quiz
? Welche Failover-Art vermeidet Datenverlust bei einer geplanten Wartung?
* Geplantes Failover
- Nicht geplantes Failover
- Testfailover
- Live-Migration des Replikats
! Es überträgt vorher alle offenen Änderungen.

? Wo wird das geplante Failover gestartet?
* Auf dem Primärserver
- Auf dem Replikatserver
- Auf dem Domänencontroller
- In Azure
! Ungeplante Failover startet man auf dem Replikatserver.

? Welche Voraussetzung gilt für ERP01 auf HV01?
* Die VM muss ausgeschaltet sein
- Die VM muss im gespeicherten Zustand sein
- Die VM muss laufen
- Die VM braucht einen Prüfpunkt
! Nur so entstehen keine neuen Änderungen.

? Warum scheitert die Umkehr der Replikation?
* HV01 ist nicht als Replikatserver konfiguriert
- HV02 hat zu wenig freien Arbeitsspeicher für ERP01
- ERP01 ist eine Gen-2-VM mit aktiviertem vTPM
- Die Replikationsfrequenz steht auf 5 Minuten
! Die neue Zielseite muss Replikation annehmen.

? Welches Cmdlet läuft zuerst auf dem Primärserver?
* Start-VMFailover -Prepare
- Set-VMReplication -Reverse
- Complete-VMFailover
- Start-VMInitialReplication
! Danach folgt Start-VMFailover auf dem Replikatserver.

? Was macht ein Testfailover?
* Erstellt eine Test-VM auf dem Replikat, Produktion läuft weiter
- Schaltet die Primär-VM aus und startet das Replikat produktiv
- Kehrt die Replikationsrichtung dauerhaft zwischen beiden Hosts um
- Löscht alle Wiederherstellungspunkte und startet die Erstreplikation neu
! Die Test-VM hängt typischerweise an einem isolierten Netz.

? Welches Cmdlet kehrt die Replikationsrichtung um?
* Set-VMReplication -Reverse
- Reverse-VMReplication
- Start-VMFailover -Reverse
- Resume-VMReplication -Swap
! Es wird auf dem neuen Primärserver ausgeführt.

? Was ist beim ungeplanten Failover möglich?
* Datenverlust seit der letzten Replikation
- Kein Datenverlust, wie beim geplanten Failover
- Nur Testbetrieb
- Nur bei ausgeschalteter Replikat-VM
! Der Primärserver ist ausgefallen und kann nichts mehr senden.
