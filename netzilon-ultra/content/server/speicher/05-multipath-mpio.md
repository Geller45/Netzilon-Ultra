---
id: server-speicher-mpio
bereich: AP2
block: SP
kapitel: Speicher & SAN vertieft
titel: Multipathing mit MPIO – Richtlinien, mpclaim, MSDSM und Ausfallsimulation
stufe: Fortgeschritten
fach: Windows Server / AZ-800
pruefungen: [AP2, AZ-800, Schule]
quellen: [SAN_Präsentation.pdf, Microsoft Learn – iSCSI/MPIO/Storage Spaces, SNIA-Grundlagen]
verweise: [server-iscsi, server-speicher-iscsi, server-speicher-fibre-channel, server-speicher-lun-zoning, az801-failover-cluster, az801-cluster-netzwerk]
---

## Profi

### Warum Multipathing?
Zwischen Server und Speicher liegen viele Bauteile: HBA bzw. NIC, Kabel, Switch, Array-Controller, Array-Port. Fällt **eines** davon aus und gibt es nur **einen Weg**, verliert der Server seine Platten – VMs stürzen ab, Datenbanken werden inkonsistent. **Multipathing** stellt **mehrere unabhängige Pfade** zur selben LUN bereit und liefert zwei Vorteile:
1. **Ausfallsicherheit** (*failover*): Bricht ein Pfad weg, laufen die E/A-Vorgänge über einen anderen weiter – transparent für Anwendungen.
2. **Lastverteilung** (*load balancing*): Mehrere Pfade können gleichzeitig genutzt werden und erhöhen den Durchsatz.

Ohne Multipathing-Software sieht Windows **jede LUN pro Pfad einmal** – also doppelt oder vierfach. Wer diese „Kopien“ getrennt beschreibt, riskiert **Datenkorruption**.

### MPIO unter Windows
**MPIO** (*Multipath I/O*, deutsch „Multipfad-E/A“) ist ein **Windows-Feature** (`Multipath-IO`). Es fasst alle Pfade zu einem **einzigen Pseudo-Datenträger** zusammen. Die eigentliche Pfadlogik steckt in einem **DSM** (*Device Specific Module*):
- **MSDSM** – der Microsoft-DSM, funktioniert mit allen Arrays, die dem SCSI-Standard (SPC-3) folgen. Er „beansprucht“ (*claimt*) Geräte über Hardware-IDs (Vendor-ID + Product-ID) oder automatisch je **Bustyp** (iSCSI, SAS).
- **Hersteller-DSM** – manche Array-Hersteller liefern eigene DSMs mit zusätzlichen Funktionen.

Wichtige Begriffe: **ALUA** (*Asymmetric Logical Unit Access*): Das Array meldet pro Pfad einen Zustand – **Active/Optimized** (direkt über den besitzenden Controller), **Active/Unoptimized** (Umweg über den anderen Controller), **Standby**, **Unavailable**. MPIO bevorzugt optimierte Pfade.

### Lastverteilungsrichtlinien (MSDSM)
| Richtlinie | Abk. | Verhalten | Einsatz |
|---|---|---|---|
| **Failover Only** | FOO | ein aktiver Pfad, die anderen Standby; Wechsel nur bei Ausfall | Arrays ohne Aktiv/Aktiv, einfache Fehlersuche |
| **Round Robin** | RR | E/A abwechselnd über alle Pfade | gleichwertige Pfade; Standard bei Arrays ohne ALUA |
| **Round Robin with Subset** | RRWS | Round Robin über eine Gruppe aktiver Pfade, andere Standby | ALUA-Arrays (Standard bei ALUA) |
| **Least Queue Depth** | LQD | nächste E/A auf den Pfad mit den wenigsten offenen Anforderungen | ungleich belastete Pfade, häufige Empfehlung für iSCSI |
| **Weighted Paths** | WP | Pfad mit dem geringsten vom Admin vergebenen Gewicht | unterschiedlich schnelle Pfade |
| **Least Blocks** | LB | Pfad mit den wenigsten ausstehenden Blöcken | große, ungleiche E/A-Größen |

### mpclaim (Kommandozeile)
| Befehl | Wirkung |
|---|---|
| `mpclaim -e` | zeigt Speichergeräte, die MPIO beanspruchen könnte |
| `mpclaim -r -i -a ""` | MPIO für **alle** passenden Geräte aktivieren und **neu starten** (`-r`) |
| `mpclaim -n -i -d "MSFT2005iSCSIBusType_0x9"` | iSCSI-Geräte beanspruchen, **ohne** Neustart (`-n`) |
| `mpclaim -s -d` | alle MPIO-Datenträger mit Richtlinie anzeigen |
| `mpclaim -s -d 0` | Pfade und Zustände von MPIO-Datenträger 0 |
| `mpclaim -l -d 0 4` | Richtlinie von Datenträger 0 auf 4 (LQD) setzen |
| `mpclaim -L -M 2` | Standardrichtlinie für alle Datenträger auf Round Robin |

Richtliniennummern: 1 = FOO, 2 = RR, 3 = RRWS, 4 = LQD, 5 = WP, 6 = LB, 7 = herstellerspezifisch, 0 = zurücksetzen.

### PowerShell
- `Install-WindowsFeature Multipath-IO` – Feature installieren.
- `Enable-MSDSMAutomaticClaim -BusType iSCSI` (oder `SAS`) – MSDSM beansprucht alle Geräte dieses Bustyps automatisch; **Neustart** nötig. Für **Fibre Channel** gibt es keinen automatischen Bustyp-Claim – hier Hardware-ID mit `New-MSDSMSupportedHW -VendorId ... -ProductId ...` eintragen oder den Hersteller-DSM nutzen.
- `Set-MSDSMGlobalDefaultLoadBalancePolicy -Policy LQD` – Standardrichtlinie (Werte: None, FOO, RR, LQD, LB).
- `Get-MPIOSetting` / `Set-MPIOSetting` – Zeitwerte, z. B. **PDORemovePeriod** (wie lange MPIO auf die Rückkehr eines Pfades wartet, bevor die Platte als verloren gilt) und Pfadprüfung.
- `Get-MSDSMSupportedHW` – beanspruchte Hardware-IDs.

### iSCSI und MPIO zusammen
Für jeden Pfad wird eine **eigene Sitzung** mit **eigener Initiator-IP und eigenem Zielportal** aufgebaut (`Connect-IscsiTarget -IsMultipathEnabled $true -InitiatorPortalAddress ... -TargetPortalAddress ...`). Die Pfade liegen idealerweise in **getrennten Subnetzen** über **getrennte Switches**. **NIC-Teaming** für iSCSI wird von Microsoft **nicht unterstützt** – Redundanz immer über MPIO.

### Ausfallsimulation
1. Zustand prüfen: `mpclaim -s -d 0` → zwei Pfade „Active/Optimized“.
2. Last erzeugen (z. B. Datei kopieren, `diskspd`).
3. Pfad trennen: `Disable-NetAdapter -Name SAN-A` (iSCSI) bzw. Switch-Port abschalten (FC).
4. Beobachten: Kopiervorgang läuft weiter, Pfad 1 wird „Failed/Unavailable“, Ereignisanzeige meldet MPIO-Ereignisse (Quelle *mpio*).
5. Pfad wieder aktivieren und prüfen, dass er zurückkehrt.

Probier es im **Speicher-Labor unter Werkzeuge** aus: Dort kannst du Pfade „durchschneiden“ und zusehen, wie Round Robin, Failover Only und Least Queue Depth reagieren.

## Einfach

Stell dir vor, du wohnst in einem Dorf, und es gibt **nur eine Brücke** zur Stadt, wo der Supermarkt (der Speicher) ist. Wenn die Brücke gesperrt ist, kommst du nicht mehr einkaufen – du hast nichts zu essen.

**Multipathing** heißt: Man baut **zwei Brücken**. Ist eine gesperrt, fährst du einfach über die andere. Und wenn beide offen sind, können die Autos sich **aufteilen**, dann gibt es weniger Stau.

Aber Achtung: Ohne eine schlaue **Verkehrsleitung** würde dein Navi denken, es gibt **zwei verschiedene Supermärkte**, obwohl es derselbe ist. Du würdest die Hälfte deiner Einkäufe in den einen, die andere Hälfte in den „anderen“ legen – Chaos! **MPIO** ist diese Verkehrsleitung: Sie weiß, dass beide Brücken zum **selben** Supermarkt führen.

Die Verkehrsleitung kann nach verschiedenen **Regeln** arbeiten:
- **Failover Only**: Alle fahren über Brücke 1. Nur wenn sie kaputt ist, über Brücke 2.
- **Round Robin**: Abwechselnd – ein Auto links, eins rechts.
- **Least Queue Depth**: Jedes Auto nimmt die Brücke, **vor der gerade die wenigsten Autos warten**.

## Merksatz
- **Zwei Wege, ein Datenträger – MPIO fasst zusammen.**
- **Ohne MPIO sieht man die LUN doppelt.**
- **FOO = einer arbeitet, RR = abwechselnd, LQD = kürzeste Schlange.**
- **Enable-MSDSMAutomaticClaim nur für iSCSI und SAS.**
- **Für iSCSI MPIO, nie NIC-Teaming.**
- **mpclaim -s -d zeigt, was Sache ist.**

## Prüfungsfalle
- MPIO ist ein **Feature**, keine Rolle – und erfordert meist einen **Neustart**.
- Ohne MPIO erscheinen LUNs **mehrfach** – nicht „die LUN ist doppelt vorhanden“.
- **NIC-Teaming** auf iSCSI-Adaptern ist **nicht unterstützt** – Redundanz nur über MPIO.
- `Enable-MSDSMAutomaticClaim` kennt **kein Fibre Channel** als Bustyp.
- **Failover Only** bietet **keine** Lastverteilung, nur Ausfallsicherheit.
- Zwei Pfade über **denselben Switch** sind kein echtes Multipathing – der Switch bleibt Single Point of Failure.
- Bei ALUA-Arrays kann Round Robin über **nicht optimierte** Pfade die Leistung senken – RRWS oder LQD nutzen.

## Grafik
### Pfadausfall mit MPIO
1. HV01 -> Switch-SAN-A: E/A über Pfad 1 (Round Robin)
2. HV01 -> Switch-SAN-B: E/A über Pfad 2 (Round Robin)
3. Switch-SAN-A: fällt aus, Pfad 1 meldet Fehler
4. MPIO: markiert Pfad 1 als ausgefallen und wiederholt offene E/A auf Pfad 2
5. HV01 -> Switch-SAN-B: gesamte E/A läuft über Pfad 2 weiter
6. Switch-SAN-A: wieder online, MPIO nimmt Pfad 1 zurück in die Rotation

### Least Queue Depth
1. MPIO: Pfad 1 hat 12 offene Anfragen, Pfad 2 hat 3
2. MPIO -> Pfad 2: nächste Anfrage geht an den Pfad mit der kürzeren Warteschlange
3. MPIO: Warteschlangen gleichen sich an

## Lab
**Maschinen**: **FS01.example.com** (iSCSI-Zielserver, Portale 10.10.1.10 und 10.10.2.10), **HV01.example.com** (Initiator, SAN-A 10.10.1.31, SAN-B 10.10.2.31), optional **ARRAY01** als echtes Array. Schule: `exa.local`. Voraussetzung: Target `HVCluster` mit IQN von HV01 (siehe iSCSI-Themenseite).

### GUI
1. **HV01**: Server-Manager → Rollen und Features → Features → **Multipfad-E/A** → Installieren.
2. **HV01**: `mpiocpl.exe` → Registerkarte **Multipfade suchen** → **Unterstützung für iSCSI-Geräte hinzufügen** → Hinzufügen → **Neustart**.
3. **HV01**: `iscsicpl.exe` → Ziele → Verbinden → **Multipfad aktivieren** → Erweitert → Initiator-IP 10.10.1.31 / Zielportal 10.10.1.10. Ein zweites Mal verbinden mit 10.10.2.31 / 10.10.2.10.
4. **HV01**: Datenträgerverwaltung → der Datenträger erscheint **nur einmal** → Eigenschaften → Registerkarte **MPIO** → Richtlinie **Geringste Warteschlangentiefe** (*Least Queue Depth*) wählen → beide Pfade sichtbar.
5. **HV01**: Große Datei auf den iSCSI-Datenträger kopieren und währenddessen in den Netzwerkverbindungen **SAN-A deaktivieren** → Kopie läuft weiter → in der MPIO-Registerkarte ist ein Pfad ausgefallen.
6. **HV01**: SAN-A wieder aktivieren → Pfad kehrt zurück. Ereignisanzeige → System → Quelle *mpio* prüfen.
7. Vergleiche die Richtlinien im **Speicher-Labor unter Werkzeuge**.

### PowerShell
```powershell
# HV01: MPIO installieren und iSCSI automatisch beanspruchen
Install-WindowsFeature Multipath-IO
Enable-MSDSMAutomaticClaim -BusType iSCSI
Set-MSDSMGlobalDefaultLoadBalancePolicy -Policy LQD
Restart-Computer

# HV01: zwei Pfade zum selben Target
New-IscsiTargetPortal -TargetPortalAddress 10.10.1.10 -InitiatorPortalAddress 10.10.1.31
New-IscsiTargetPortal -TargetPortalAddress 10.10.2.10 -InitiatorPortalAddress 10.10.2.31
$t = "iqn.1991-05.com.microsoft:fs01-hvcluster-target"
Connect-IscsiTarget -NodeAddress $t -TargetPortalAddress 10.10.1.10 -InitiatorPortalAddress 10.10.1.31 -IsMultipathEnabled $true -IsPersistent $true
Connect-IscsiTarget -NodeAddress $t -TargetPortalAddress 10.10.2.10 -InitiatorPortalAddress 10.10.2.31 -IsMultipathEnabled $true -IsPersistent $true

# HV01: Kontrolle
Get-MSDSMAutomaticClaimSettings
Get-MSDSMGlobalDefaultLoadBalancePolicy
mpclaim -s -d
mpclaim -s -d 0
Get-MPIOSetting

# HV01: Ausfallsimulation
Disable-NetAdapter -Name "SAN-A" -Confirm:$false
mpclaim -s -d 0
Enable-NetAdapter -Name "SAN-A"
Get-WinEvent -LogName System -MaxEvents 20 | Where-Object ProviderName -eq "mpio"
```

## Legende
### MPIO
- Was: Windows-Feature Multipfad-E/A, das mehrere Pfade zu einer LUN zusammenfasst.
- Wie: Install-WindowsFeature Multipath-IO, Beanspruchen per MSDSM oder Hersteller-DSM.
- Wo: auf jedem Server mit SAN-Anbindung, z. B. HV01 und HV02.
- Wann: sobald mehr als ein Pfad zum Speicher existiert.
- Warum: Ausfallsicherheit und Lastverteilung, keine doppelten Datenträger.
### Lastverteilungsrichtlinie
- Was: Regel, über welchen Pfad die nächste E/A läuft.
- Wie: per mpiocpl, Datenträgereigenschaften, mpclaim oder Set-MSDSMGlobalDefaultLoadBalancePolicy.
- Wann: bei der Einrichtung, abgestimmt auf die Empfehlung des Array-Herstellers.
- Warum: optimale Leistung je nach Array-Typ (ALUA oder Aktiv/Aktiv).
- Beispiel: FOO, RR, RRWS, LQD, WP, LB.

## Karteikarten
- F: Welche zwei Ziele verfolgt Multipathing? | A: Ausfallsicherheit (Failover) und Lastverteilung (Load Balancing)
- F: Wie heißt das Windows-Feature für Multipathing? | A: Multipfad-E/A, PowerShell-Name Multipath-IO
- F: Was ist ein DSM? | A: Device Specific Module – enthält die Pfadlogik; Microsoft liefert den MSDSM, Hersteller eigene DSMs
- F: Was passiert ohne MPIO bei zwei Pfaden? | A: Die LUN erscheint zweimal als Datenträger – Gefahr der Datenkorruption
- F: Was macht Failover Only? | A: Nur ein Pfad ist aktiv, die anderen sind Standby und übernehmen bei Ausfall
- F: Was macht Least Queue Depth? | A: Schickt die nächste E/A über den Pfad mit den wenigsten offenen Anforderungen
- F: Für welche Bustypen funktioniert Enable-MSDSMAutomaticClaim? | A: iSCSI und SAS
- F: Was bewirkt mpclaim -r -i -a ""? | A: Beansprucht alle passenden Geräte für MPIO und startet neu
- F: Welcher Befehl zeigt Pfade und Zustände von MPIO-Datenträger 0? | A: mpclaim -s -d 0
- F: Was bedeutet ALUA? | A: Asymmetric Logical Unit Access – Array meldet optimierte und nicht optimierte Pfade
- F: Warum kein NIC-Teaming für iSCSI? | A: Wird von Microsoft für iSCSI nicht unterstützt; Redundanz und Lastverteilung erfolgen über MPIO
- F: Welche Richtliniennummer steht in mpclaim für Round Robin? | A: 2 (1 = FOO, 3 = RRWS, 4 = LQD, 5 = WP, 6 = LB)

## Quiz
? Was zeigt Windows ohne MPIO, wenn eine LUN über zwei Pfade erreichbar ist?
* Zwei Datenträger für dieselbe LUN
- Einen Datenträger mit doppelter Größe
- Keinen Datenträger
- Einen schreibgeschützten Datenträger
! Jeder Pfad liefert die LUN als eigenes Gerät – MPIO fasst sie zusammen.

? Welches Cmdlet installiert MPIO?
* Install-WindowsFeature Multipath-IO
- Install-WindowsFeature FS-iSCSITarget-Server
- Enable-NetAdapter -Name MPIO
- Add-WindowsFeature NIC-Teaming
! Multipath-IO ist ein Feature; danach ist meist ein Neustart nötig.

? Welche Richtlinie nutzt nur einen aktiven Pfad und wechselt nur bei Ausfall?
* Failover Only
- Round Robin
- Least Queue Depth
- Least Blocks
! FOO bietet Ausfallsicherheit, aber keine Lastverteilung.

? Welche Richtlinie schickt die nächste E/A an den Pfad mit den wenigsten offenen Anforderungen?
* Least Queue Depth
- Weighted Paths
- Failover Only
- Round Robin with Subset
! LQD reagiert auf ungleich belastete Pfade und wird für iSCSI oft empfohlen.

? Für welchen Bustyp kann Enable-MSDSMAutomaticClaim NICHT verwendet werden?
* Fibre Channel
- iSCSI
- SAS
- Keiner – alle Bustypen sind möglich
! Automatischer Claim gibt es nur für iSCSI und SAS; FC über Hardware-ID oder Hersteller-DSM.

? Welche Aussage zu iSCSI-Redundanz ist richtig?
* Redundanz wird über MPIO mit getrennten Pfaden umgesetzt
- NIC-Teaming ist die empfohlene Lösung
- Ein Standardgateway pro iSCSI-NIC sorgt für Redundanz
- iSCSI ist von sich aus redundant
! Microsoft unterstützt kein NIC-Teaming für iSCSI.

? Was zeigt der Befehl mpclaim -s -d an?
* Alle MPIO-Datenträger mit ihrer Lastverteilungsrichtlinie
- Alle Netzwerkadapter
- Die IQN des Initiators
- Das aktive Zoneset
! Mit -s -d <Nummer> sieht man zusätzlich die einzelnen Pfade.

? Was ist der MSDSM?
* Das Device Specific Module von Microsoft mit der Pfadlogik
- Ein Speicherpool in Storage Spaces
- Ein FC-Switch-Protokoll
- Ein Dateisystem für Cluster
! MSDSM funktioniert mit SPC-3-konformen Arrays; Hersteller können eigene DSMs liefern.

? Welche Richtlinie ist bei ALUA-Arrays unter MSDSM üblicherweise Standard?
* Round Robin with Subset
- Failover Only
- Least Blocks
- Weighted Paths
! RRWS verteilt nur über die optimierten Pfade, die nicht optimierten bleiben Standby.

? Zwei iSCSI-Pfade von HV01 laufen über denselben Switch. Was ist das Problem?
* Der Switch bleibt ein Single Point of Failure
- MPIO funktioniert dann nicht
- Die LUN wird automatisch schreibgeschützt
- CHAP kann nicht verwendet werden
! Echte Redundanz braucht getrennte Switches bzw. Fabrics.

? Was bedeutet der Parameter -IsMultipathEnabled $true bei Connect-IscsiTarget?
* Die Sitzung darf als einer von mehreren Pfaden zu MPIO beitragen
- Die Verbindung wird verschlüsselt
- Die LUN wird doppelt so groß
- Das Target wird auf zwei Servern repliziert
! Ohne den Schalter kann zu einem Target nur eine Sitzung aufgebaut werden.

? Was legt die MPIO-Einstellung PDORemovePeriod fest?
* Wie lange MPIO auf die Rückkehr eines Pfades wartet, bevor die Platte entfernt wird
- Wie oft ein Snapshot erstellt wird
- Die Größe eines iSCSI-Pakets
- Wie viele LUNs ein Target haben darf
! Ist kein Pfad mehr da, hält MPIO die Platte für diese Zeit vor (Get-MPIOSetting).

? Wie simuliert man auf HV01 einen iSCSI-Pfadausfall am einfachsten?
* Disable-NetAdapter auf einer der iSCSI-NICs
- Format-Volume auf der LUN
- Remove-WindowsFeature Multipath-IO
- Stop-Service WinTarget auf HV01
! Danach mit mpclaim -s -d prüfen, dass der zweite Pfad übernommen hat.

## Lücken
- Das Windows-Feature für Multipathing heißt {Multipath-IO|Multipfad-E/A}.
- Die Richtlinie {Failover Only} nutzt nur einen aktiven Pfad, {Round Robin} verteilt abwechselnd.
- Automatisch beanspruchen lassen sich mit Enable-MSDSMAutomaticClaim die Bustypen {iSCSI} und {SAS}.

## Zuordnen
### Richtlinie und Verhalten
- Failover Only => ein aktiver Pfad, Rest Standby
- Round Robin => abwechselnd über alle Pfade
- Round Robin with Subset => abwechselnd über eine Gruppe optimierter Pfade
- Least Queue Depth => Pfad mit den wenigsten offenen Anforderungen
- Weighted Paths => Pfad mit dem geringsten Gewicht

## Reihenfolge
### MPIO für iSCSI auf HV01 einrichten
1. Feature Multipath-IO installieren
2. iSCSI-Geräte mit Enable-MSDSMAutomaticClaim beanspruchen
3. Server neu starten
4. Zwei Zielportale mit verschiedenen Initiator-IPs eintragen
5. Zwei Sitzungen mit -IsMultipathEnabled aufbauen
6. Richtlinie prüfen und ggf. auf Least Queue Depth setzen
7. Pfadausfall testen und Rückkehr kontrollieren

## Freitext
- F: Erklären Sie, warum ohne MPIO bei zwei Pfaden Datenkorruption droht, und beschreiben Sie, wie MPIO das verhindert. | M: Ohne MPIO meldet jeder Pfad die LUN als eigenen Datenträger; Windows könnte beide als verschiedene Platten behandeln und unabhängig darauf schreiben, wodurch Metadaten überschrieben werden. MPIO erkennt anhand der eindeutigen LUN-Kennung, dass es dieselbe LUN ist, fasst die Pfade zu einem Pseudo-Datenträger zusammen und verteilt E/A gemäß Richtlinie; bei Ausfall eines Pfades werden offene E/A über einen anderen wiederholt. | P: 5

## Szenario
### Sporadische VM-Abstürze bei der Firma Brandt
Die Hyper-V-Hosts HV01 und HV02 hängen per iSCSI an FS01. Beide Hosts haben zwei iSCSI-NICs, die zu einem NIC-Team zusammengefasst sind; beide NICs stecken im selben Switch. Bei einem Firmware-Update des Switches stürzen alle VMs ab. In der Datenträgerverwaltung von HV02 erscheint die Cluster-LUN zudem zweimal.
- F: Warum sind die VMs beim Switch-Update abgestürzt? | A: Beide Pfade liefen über denselben Switch – Single Point of Failure; bei dessen Neustart war kein Pfad mehr vorhanden | P: 2
- F: Was ist an der NIC-Konfiguration falsch? | A: NIC-Teaming für iSCSI wird nicht unterstützt; stattdessen zwei einzelne NICs in getrennten Subnetzen mit MPIO | P: 2
- F: Warum erscheint die LUN auf HV02 doppelt und was ist zu tun? | A: MPIO ist nicht installiert oder iSCSI nicht beansprucht; Multipath-IO installieren, Enable-MSDSMAutomaticClaim -BusType iSCSI, Neustart | P: 3
- F: Wie prüfen Sie nach der Umstellung den Erfolg? | A: mpclaim -s -d zeigt einen MPIO-Datenträger mit zwei Pfaden; Ausfalltest mit Disable-NetAdapter, Kopiervorgang muss weiterlaufen | P: 3
