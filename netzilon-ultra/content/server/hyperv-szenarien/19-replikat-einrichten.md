---
id: server-hvsz-19
bereich: AZ-800
block: HV-S
kapitel: Hyper-V-Praxisszenarien
titel: Szenario 19 – Hyper-V-Replikat einrichten
stufe: Fortgeschritten
fach: Windows Server / AZ-800
pruefungen: [AZ-800, AP2, Schule]
quellen: [Microsoft Learn – Hyper-V]
verweise: [az801-hyperv-replica, az801-firewall-lokal, server-hvsz-20]
---

## Profi

### Ticket
**Kunde meldet:** „Wir wollen den ERP-Server auf den zweiten Host im Nebengebäude replizieren. Beim Aktivieren der Replikation kommt: Verbindung zum Replikatserver kann nicht hergestellt werden.“
- Datum/Priorität: 03.10.2026, **Priorität 3 (normal)** – Projekt Notfallvorsorge.
- Betroffene Maschinen: Primärserver **HV01.example.com**, Replikatserver **HV02.example.com**, VM **ERP01**.

### Ausgangslage
- HV01 (192.168.10.21) und HV02 (192.168.10.22): Server 2025, beide Mitglied der Domäne **example.com**, kein Cluster.
- ERP01: Gen 2, 2 VHDX (120 GB gesamt), IP 192.168.10.90.
- Auf HV02 ist in den Hyper-V-Einstellungen **„Replikationskonfiguration“** noch nicht aktiviert; Windows-Firewall im Standardzustand.

### Analyse
**Hyper-V-Replikat** repliziert eine VM **asynchron** vom Primär- auf einen Replikatserver (Intervall **30 Sekunden, 5 oder 15 Minuten**). Der **Replikatserver** muss Replikation ausdrücklich **annehmen**:
- **Authentifizierung**: **Kerberos (HTTP)**, Standardport **80** – nur in Domänen/vertrauten Domänen, **Daten unverschlüsselt** übertragen; oder **zertifikatbasiert (HTTPS)**, Standardport **443** – verschlüsselt, auch für Arbeitsgruppen/fremde Domänen.
- **Autorisierung**: von **jedem authentifizierten Server** oder nur von **angegebenen Servern**, mit Speicherort und Vertrauensgruppe.
- **Firewall**: Die eingehenden Regeln **„Hyper-V Replica HTTP Listener (TCP-In)“** bzw. **„… HTTPS Listener …“** sind standardmäßig **deaktiviert**.

| Hypothese | Prüfung |
|---|---|
| Replikatserver nicht konfiguriert | `Get-VMReplicationServer -ComputerName HV02` |
| Firewallregel auf HV02 deaktiviert | `Get-NetFirewallRule -Name VIRT-HVRHTTPL-In-TCP-NoScope -CimSession HV02` |
| Port/Authentifizierungstyp passen nicht (80 vs. 443) | Einstellungen auf beiden Seiten vergleichen |
| Name nicht auflösbar (FQDN) | `Resolve-DnsName HV02.example.com` |
| Zwischen den Gebäuden blockiert eine Netzwerk-Firewall Port 80 | `Test-NetConnection HV02.example.com -Port 80` |

**Befund:** Replikatserver nicht aktiviert und Firewallregel deaktiviert.

### Lösungsweg
1. **HV02 als Replikatserver aktivieren**: Hyper-V-Einstellungen → Replikationskonfiguration → *Als Replikatserver aktivieren*, **Kerberos (HTTP)**, Port 80 – Begründung: Beide Hosts sind in derselben Domäne; ohne Zertifikatsinfrastruktur ist Kerberos am einfachsten. Für verschlüsselte Übertragung (anderes Gebäude, ungesicherte Strecke) **Zertifikat/HTTPS** wählen.
2. **Autorisierung** auf *angegebene Server* (HV01.example.com), Speicherort `D:\Replica` – Begründung: nur bekannte Primärserver zulassen.
3. **Firewallregel aktivieren** auf HV02 – Begründung: Sonst erreicht HV01 den Listener nicht.
4. **Auf HV01**: ERP01 → *Replikation aktivieren* → Replikatserver HV02.example.com, Kerberos, Port 80, Frequenz **5 Minuten**, zusätzliche Wiederherstellungspunkte nach Bedarf – Begründung: RPO von 5 Minuten reicht für ERP laut Fachabteilung.
5. **Erstreplikation** über Netzwerk sofort oder geplant (nachts) bzw. per externem Medium – Begründung: 120 GB über die Gebäudestrecke planen.
6. **Integrität prüfen** (*Replikationsintegrität anzeigen*).

### Ergebnis prüfen
- `Get-VMReplication -VMName ERP01` → State **Replicating**, Health **Normal**.
- `Measure-VMReplication -VMName ERP01` zeigt letzte Replikationszeit und Größe.
- Auf HV02 existiert ERP01 (ausgeschaltet) als Replikat.

### Vorbeugung
- Replikatserver-Konfiguration und Firewallregel in die Host-Bereitstellung aufnehmen.
- Für **Cluster** als Replikatziel: Rolle **Hyper-V-Replikatbroker** verwenden.
- Bandbreite und Speicher (Wiederherstellungspunkte) überwachen; regelmäßig **Testfailover**.

## Einfach

Hyper-V-Replikat ist wie ein **Brieffreund, der dein Tagebuch abschreibt**. Alle paar Minuten schickt HV01 die **neuen Seiten** von ERP01 an HV02. Wenn im Hauptgebäude ein Feuer ausbricht, hat HV02 eine fast aktuelle Kopie.

Aber HV02 muss erst sagen: „**Ja, ich nehme Briefe an!**“ (Als Replikatserver aktivieren). Und es muss klar sein, **wie die Briefe ankommen**:
- **Kerberos/HTTP (Port 80)**: wie eine **Postkarte** – schnell, beide kennen sich (gleiche Domäne), aber jeder auf dem Weg könnte mitlesen.
- **Zertifikat/HTTPS (Port 443)**: wie ein **verschlossener Brief** – sicher, auch für Fremde.

Außerdem hat HV02 einen **Briefkasten mit Schloss** (die Firewall). Der Schlitz für Replikatsbriefe ist zuerst **zugeklebt**. Man muss ihn freimachen (Firewallregel aktivieren).

Wenn alles stimmt, schickt HV01 zuerst das **ganze Tagebuch** (Erstreplikation) und danach nur noch die **neuen Seiten**.

## Merksatz
- Replikatserver muss **aktiviert** werden und **Firewallregel** freigeben.
- **Kerberos = HTTP 80, unverschlüsselt, Domäne**; **Zertifikat = HTTPS 443, verschlüsselt**.
- Frequenz: **30 s, 5 min, 15 min**.
- Cluster als Ziel → **Replikatbroker**.

## Prüfungsfalle
- Kerberos-Replikation ist **nicht verschlüsselt** – für Verschlüsselung Zertifikat/HTTPS.
- Die Firewallregel ist **standardmäßig deaktiviert**, auch nach Aktivierung der Replikatserver-Rolle.
- Arbeitsgruppen-Hosts → nur **zertifikatbasierte** Authentifizierung.
- Replikat ist **asynchron** – kein Ersatz für Hochverfügbarkeit ohne Datenverlust (RPO > 0).

## Grafik
### Brieffreund mit Schloss
1. Admin -> HV01: Replikation für ERP01 aktivieren
2. HV01 -> HV02: Verbindungsaufbau Port 80 – abgelehnt
3. Admin -> HV02: Replikatserver aktivieren, Kerberos, Speicherort D Replica
4. Admin -> HV02: Firewallregel HTTP Listener aktivieren
5. HV01 -> HV02: Erstreplikation der VHDX
6. HV01 -> HV02: Alle 5 Minuten Änderungen
7. HV02: Replikat ERP01 aktuell, Integrität normal

## Lab
**Maschinen**: **HV01.example.com** (Primär), **HV02.example.com** (Replikat), VM **ERP01** (kleine Test-VM).
Nachstellen: Zuerst den Fehler bewusst erzeugen, dann beheben.

### GUI
1. **HV01**: Hyper-V-Manager → ERP01 → Rechtsklick → **Replikation aktivieren** → Replikatserver `HV02.example.com` → Fehlermeldung (Fehlerzustand: HV02 nicht konfiguriert).
2. **HV02**: Hyper-V-Manager → **Hyper-V-Einstellungen** → **Replikationskonfiguration** → *Als Replikatserver aktivieren* → **Kerberos (HTTP)** Port 80 → *Replikation von den angegebenen Servern zulassen* → Hinzufügen: `HV01.example.com`, Speicherort `D:\Replica`, Vertrauensgruppe „ERP“ → OK.
3. **HV02**: Hinweis zur Firewall beachten → **Windows Defender Firewall mit erweiterter Sicherheit** → Eingehende Regeln → **Hyper-V Replica HTTP Listener (TCP-In)** → **Regel aktivieren**.
4. **HV01**: ERP01 → **Replikation aktivieren** → HV02.example.com → Kerberos, Port 80, Daten komprimieren → Frequenz **5 Minuten** → nur letzten Wiederherstellungspunkt → Erstreplikation **sofort über das Netzwerk** → Fertig stellen.
5. **HV01**: ERP01 → Replikation → **Replikationsintegrität anzeigen** → Status *Normal*.
6. **HV02**: ERP01 erscheint als ausgeschaltete Replikat-VM.

### PowerShell
1. **HV01**: Fehlerbild erzeugen.
2. **HV02**: Replikatserver und Firewall konfigurieren.
3. **HV01**: Replikation aktivieren und prüfen.

```powershell
# Auf HV01 – Fehlerbild
Enable-VMReplication -VMName ERP01 -ReplicaServerName HV02.example.com -ReplicaServerPort 80 -AuthenticationType Kerberos
Test-NetConnection HV02.example.com -Port 80

# Auf HV02 – Replikatserver aktivieren
Set-VMReplicationServer -ReplicationEnabled $true -AllowedAuthenticationType Kerberos -KerberosAuthenticationPort 80 -ReplicationAllowedFromAnyServer $false
New-VMReplicationAuthorizationEntry -AllowedPrimaryServer HV01.example.com -ReplicaStorageLocation D:\Replica -TrustGroup ERP
# Regelnamen sind sprachneutral; vorher anzeigen lassen, welche Replica-Regeln es gibt:
Get-NetFirewallRule -Name "VIRT-HVR*" | Select-Object Name, DisplayName, Enabled
Enable-NetFirewallRule -Name VIRT-HVRHTTPL-In-TCP-NoScope      # engl. DisplayName "Hyper-V Replica HTTP Listener (TCP-In)"
# Für HTTPS: Enable-NetFirewallRule -Name VIRT-HVRHTTPSL-In-TCP-NoScope
Get-VMReplicationServer

# Auf HV01 – Replikation aktivieren
Enable-VMReplication -VMName ERP01 -ReplicaServerName HV02.example.com -ReplicaServerPort 80 -AuthenticationType Kerberos -ReplicationFrequencySec 300 -CompressionEnabled $true
Start-VMInitialReplication -VMName ERP01
Get-VMReplication -VMName ERP01
Measure-VMReplication -VMName ERP01
```

## Szenario
### Kontrollfragen
HV01 soll ERP01 auf HV02 replizieren (gleiche Domäne). Beim Aktivieren erscheint ein Verbindungsfehler.
- F: Welche zwei Einstellungen fehlen auf HV02 typischerweise? | A: Aktivierung als Replikatserver (Authentifizierung, Autorisierung, Speicherort) und die eingehende Firewallregel für den Replica-Listener.
- F: Welche Ports und Eigenschaften haben die Authentifizierungsarten? | A: Kerberos über HTTP Port 80, unverschlüsselt, nur Domäne; Zertifikat über HTTPS Port 443, verschlüsselt, auch ohne gemeinsame Domäne.
- F: Welche Replikationsfrequenzen gibt es? | A: 30 Sekunden, 5 Minuten, 15 Minuten.
- F: Welches Cmdlet konfiguriert den Replikatserver? | A: Set-VMReplicationServer (plus New-VMReplicationAuthorizationEntry für bestimmte Primärserver).
- F: Was braucht man, wenn das Replikatziel ein Failovercluster ist? | A: Die Clusterrolle Hyper-V-Replikatbroker.

## Reihenfolge
### Hyper-V-Replikat einrichten
1. Replikatserver aktivieren und Authentifizierung wählen
2. Autorisierung und Speicherort festlegen
3. Firewallregel für den Listener aktivieren
4. Auf dem Primärserver Replikation für die VM aktivieren
5. Frequenz und Wiederherstellungspunkte festlegen
6. Erstreplikation starten
7. Replikationsintegrität prüfen

## Legende
### Hyper-V-Replikat
- Was: Asynchrone Replikation einer VM auf einen zweiten Hyper-V-Host bzw. Cluster.
- Wie: Replikatserver per Hyper-V-Einstellungen/`Set-VMReplicationServer` vorbereiten, VM per `Enable-VMReplication` replizieren.
- Wann: für Notfallwiederherstellung (DR) zwischen Standorten oder Gebäuden, auch ohne gemeinsamen Speicher.
- Wo: Primärserver HV01, Replikatserver HV02 (oder Cluster mit Replikatbroker).
- Warum: Bei Ausfall des Primärstandorts steht eine fast aktuelle Kopie bereit (RPO 30 s bis 15 min).

## Karteikarten
- F: Welche Authentifizierungsarten kennt Hyper-V-Replikat? | A: Kerberos (HTTP) und zertifikatbasiert (HTTPS).
- F: Standardport für Kerberos-Replikation? | A: 80 (HTTP).
- F: Standardport für zertifikatbasierte Replikation? | A: 443 (HTTPS).
- F: Ist Kerberos-Replikation verschlüsselt? | A: Nein, nur die zertifikatbasierte Variante verschlüsselt den Datenverkehr.
- F: Welche Firewallregel muss auf dem Replikatserver aktiviert werden? | A: Hyper-V Replica HTTP Listener (TCP-In) bzw. HTTPS Listener (TCP-In).
- F: Welche Replikationsintervalle gibt es? | A: 30 Sekunden, 5 Minuten, 15 Minuten.
- F: Cmdlet zum Aktivieren der Replikation einer VM? | A: Enable-VMReplication
- F: Cmdlet zum Starten der Erstreplikation? | A: Start-VMInitialReplication
- F: Was braucht ein Cluster als Replikatziel? | A: Den Hyper-V-Replikatbroker.

## Quiz
? Welche Authentifizierung verschlüsselt den Replikationsverkehr?
* Zertifikatbasiert über HTTPS
- Kerberos über HTTP
- NTLM über SMB
- Keine, Replikat ist nie verschlüsselt
! Kerberos-Replikation läuft unverschlüsselt über HTTP.

? Welcher Port ist Standard für Kerberos-Replikation?
* 80
- 443
- 445
- 3389
! Zertifikatbasiert nutzt 443.

? Was ist auf dem Replikatserver nach der Aktivierung standardmäßig noch deaktiviert?
* Die eingehende Firewallregel für den Replica-Listener
- Der Hyper-V-Dienst
- Die Domänenmitgliedschaft
- Die Netzwerkkarte
! Die Regel muss manuell aktiviert werden.

? Welche Replikationsfrequenz gibt es NICHT?
* 1 Stunde
- 30 Sekunden
- 5 Minuten
- 15 Minuten
! Nur 30 s, 5 min und 15 min sind wählbar.

? Zwei Hosts in Arbeitsgruppen sollen replizieren. Welche Authentifizierung?
* Zertifikatbasiert
- Kerberos
- Anonym
- CredSSP
! Kerberos setzt Domänen voraus.

? Welches Cmdlet konfiguriert HV02 als Replikatserver?
* Set-VMReplicationServer
- Enable-VMReplication
- Set-VMHost -Replica $true
- Start-VMFailover
! Enable-VMReplication läuft auf dem Primärserver für eine VM.

? Was ist beim Ziel „Failovercluster“ zusätzlich nötig?
* Hyper-V-Replikatbroker
- Zweite Domäne
- Nested Virtualization
- Shielded VMs
! Der Broker ist der Ansprechpartner im Cluster.

? Wie arbeitet Hyper-V-Replikat?
* Asynchron in festen Intervallen
- Synchron ohne Datenverlust
- Nur einmal täglich
- Nur bei ausgeschalteter VM
! Daher ist das RPO größer als null.
