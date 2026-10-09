---
id: az800-branchcache
bereich: AZ-800
block: A7
kapitel: Storage & Dateidienste
titel: BranchCache – verteilter und gehosteter Cache für Außenstellen
stufe: Fortgeschritten
quellen: [AZ-800 Study Guide, Microsoft Learn, Netzwerkinfrastruktur_mit_Windows_Server_2016_implementieren_70-741.pdf]
verweise: [az800-freigaben, az800-dfs, ap1-a6-gpo-grundlagen, az800-standorte-replikation]
---

## Profi

### Zweck
**BranchCache** reduziert **WAN-Verkehr** zwischen Zentrale und Außenstellen: Inhalte, die ein Client in der Filiale bereits aus der Zentrale geladen hat, werden **lokal zwischengespeichert** und anderen Filial-Clients bereitgestellt. Die Zentrale liefert beim zweiten Abruf nur noch **Hashes** (Metadaten, „Content Information“), nicht die Daten.

### Unterstützte Inhaltsserver
| Protokoll | Server |
|---|---|
| **SMB** | Dateiserver mit Rollendienst **BranchCache für Netzwerkdateien** (*FS-BranchCache*) + Freigabe mit **„BranchCache aktivieren“** |
| **HTTP/HTTPS** | IIS-Webserver, WSUS, SCCM-Verteilungspunkte mit Feature **BranchCache** |
| **BITS** | Anwendungen über den Hintergrundübertragungsdienst |
Daten im Cache sind **verschlüsselt**; Zugriff wird immer **am Inhaltsserver autorisiert** (Berechtigungen gelten weiter). Inhalt wird als **Blöcke** gehasht → nur geänderte Blöcke werden neu übertragen; Version 2 (ab Server 2012) mit variabler Blockgröße (Deduplizierung über Dateien hinweg).

### Betriebsmodi
| | **Verteilter Cache** (*Distributed Cache*) | **Gehosteter Cache** (*Hosted Cache*) |
|---|---|---|
| Cache liegt | auf den **Clients** der Filiale (Peer-to-Peer) | auf einem **Server in der Filiale** |
| Server nötig | nein | ja (Windows Server mit Feature BranchCache) |
| Reichweite | **ein Subnetz** (Multicast-Suche WS-Discovery) | **mehrere Subnetze** der Filiale |
| Verfügbarkeit | Cache weg, wenn Client aus/unterwegs | zentral, dauerhaft |
| Typisch | kleine Filialen, **ohne** Server | Filialen **mit** Server, mehrere Subnetze |
| Client-Anforderungen | Windows Enterprise/Education (bzw. Pro ab Windows 10 1703 für BITS) | wie links |
**Gehosteter Cache**: Server kann per **Service Connection Point (SCP)** in AD veröffentlicht werden → Clients finden ihn automatisch (**automatische Erkennung** per GPO). Zertifikat für HTTPS nicht mehr zwingend (ab Server 2012 ohne Zertifikat möglich).

### Konfiguration – Übersicht
1. **Inhaltsserver** (Zentrale):
   - Dateiserver: Rollendienst **BranchCache für Netzwerkdateien**, GPO **„Hashveröffentlichung für BranchCache“** (*Hash Publication*) aktivieren (für alle Freigaben oder nur markierte), Freigabe → Offline-Einstellungen → **BranchCache aktivieren**.
   - Webserver: Feature **BranchCache** installieren.
2. **Gehosteter Cache-Server** (Filiale): Feature **BranchCache**, `Enable-BCHostedServer -RegisterSCP`.
3. **Clients** per **GPO** (Computerkonfiguration → Administrative Vorlagen → Netzwerk → **BranchCache**):
   - **BranchCache aktivieren**
   - **Modus „Verteilter Cache“** *oder* **„Gehosteter Cache“** (Servername) bzw. **Automatische Erkennung des gehosteten Caches per Dienstverbindungspunkt**
   - **BranchCache für Netzwerkdateien konfigurieren**: **Latenz** (Standard **80 ms**) – erst ab dieser Round-Trip-Zeit wird gecacht (im LAN-Test auf **0** setzen)
   - Cachegröße (Standard **5 %** des Datenträgers)
   - Firewall: **Eingehend/Ausgehend BranchCache – Inhaltsabruf (HTTP, TCP 80)** und **Peerermittlung (WSD, UDP 3702)** freigeben.
4. **Clients** alternativ: `netsh branchcache set service mode=distributed` / `Enable-BCDistributed`.

### Diagnose
`Get-BCStatus` (Modus, Firewall, Cachegröße), `Get-BCDataCache`, Leistungsindikatoren **BranchCache** („Abgerufene Bytes vom Server/Cache“), `netsh branchcache show status all`, `Clear-BCCache`.

## Lab
**Maschinen**: **DC01** (example.com, Zentrale), **FS01** (Dateiserver Zentrale), **BC01** (Server in Filiale, gehosteter Cache), **CL01** und **CL02** (Windows 11 Enterprise, Filiale), WAN-Latenz simuliert oder GPO-Latenz = 0.

### GUI
1. **FS01**: Server-Manager → Datei- und Speicherdienste → **BranchCache für Netzwerkdateien** installieren.
2. **DC01**: GPO „BC-Server“ (OU Server) → Computerkonfiguration → Administrative Vorlagen → Netzwerk → **Lanman-Server** → **Hashveröffentlichung für BranchCache** → Aktiviert → „Hashveröffentlichung nur für Freigaben mit aktiviertem BranchCache zulassen“.
3. **FS01**: Freigabe `Doku` → Eigenschaften → Erweiterte Freigabe → **Zwischenspeichern** → **BranchCache aktivieren**.
4. **BC01**: Feature **BranchCache** installieren → PowerShell `Enable-BCHostedServer -RegisterSCP`.
5. **DC01**: GPO „BC-Clients“ (OU Filiale-Clients) → Netzwerk → **BranchCache**: *BranchCache aktivieren*, *Automatische Erkennung des gehosteten Caches per Dienstverbindungspunkt aktivieren*, *BranchCache für Netzwerkdateien konfigurieren* → Latenz **0**; Firewallregeln BranchCache in der GPO aktivieren.
6. **CL01**: `gpupdate /force` → `Get-BCStatus` → Modus HostedCacheClient → große Datei aus `\\FS01\Doku` öffnen.
7. **CL02**: gleiche Datei öffnen → Leistungsüberwachung Indikator **BranchCache → Abgerufene Bytes aus Cache** steigt.
8. Variante: GPO auf **Verteilter Cache** umstellen, BC01 aus → CL02 bezieht vom Peer CL01.

### PowerShell
```powershell
# Auf FS01 – Inhaltsserver
Install-WindowsFeature FS-BranchCache -IncludeManagementTools
Set-SmbShare -Name Doku -CachingMode BranchCache -Force
Publish-BCFileContent -Path E:\Doku          # Hashes vorab erzeugen (optional)

# Auf BC01 – gehosteter Cache mit SCP
Install-WindowsFeature BranchCache
Enable-BCHostedServer -RegisterSCP
Get-BCStatus

# Auf CL01/CL02 – manuell (statt GPO)
Enable-BCHostedClient -ServerNames BC01.example.com
# oder verteilter Cache:
Enable-BCDistributed
Get-BCStatus
Get-BCDataCache
netsh branchcache show status all

# Vorab-Befüllen des Caches (Preloading)
Export-BCCachePackage -Destination E:\Paket          # auf FS01 nach Publish-BCFileContent
Import-BCCachePackage -Path \\FS01\Paket\PeerDistPackage.zip   # auf BC01
```

## Einfach

Stell dir eine **Filiale** vor, die jedes Mal ein großes Handbuch (Datei) aus der **Zentrale** holt – über eine **langsame Straße** (WAN). Kommen zehn Kollegen nacheinander, fährt zehnmal ein Lieferwagen.

**BranchCache** macht es klüger: Der **erste** holt das Handbuch aus der Zentrale, dann bleibt eine **Kopie in der Filiale**. Die nächsten neun fragen nur noch die Zentrale: „**Ist das noch die aktuelle Version?**“ (die Zentrale schickt nur einen kurzen **Fingerabdruck**) – und holen das Handbuch dann **aus der Filiale**.

Zwei Arten, wo die Kopie liegt:
- **Verteilter Cache** = die Kopie liegt **auf den PCs der Kollegen**. Kein Server nötig, aber geht nur im **selben Netzabschnitt**, und ist der PC aus, ist die Kopie weg.
- **Gehosteter Cache** = die Kopie liegt in einem **Schrank in der Filiale** (einem Server). Immer verfügbar, auch für mehrere Netzabschnitte.

Sicher ist das trotzdem: Die Zentrale fragt **jedes Mal**, ob du das Handbuch überhaupt lesen **darfst**.

## Merksatz
- BranchCache spart **WAN**, Zentrale liefert beim Wiederholungsabruf nur **Hashes**.
- **Verteilt** = Clients, **ein Subnetz**, kein Server. **Gehostet** = Filialserver, **mehrere Subnetze**.
- Dateiserver: **BranchCache für Netzwerkdateien** + **Hashveröffentlichung (GPO)** + Freigabe „BranchCache aktivieren“.
- Clients per **GPO**, Latenzschwelle Standard **80 ms**.
- Gehosteter Cache per **SCP** automatisch auffindbar.
- Berechtigungen prüft immer der **Inhaltsserver**.

## Prüfungsfalle
- Filiale mit mehreren Subnetzen und verteiltem Cache → Peers in anderen Subnetzen werden nicht gefunden.
- Ohne Hashveröffentlichung (GPO) liefert der Dateiserver keine BranchCache-Hashes.
- Im LAN-Test greift BranchCache nicht, weil die Round-Trip-Zeit unter der Latenzschwelle (80 ms) liegt → Latenz auf 0 setzen.
- Firewallregeln für BranchCache fehlen → kein Peer-Abruf.
- Filiale ohne Server → nur verteilter Cache möglich.

## Grafik
### Lieferwagen
Zentrale und Filiale, dazwischen eine lange Straße. Erster Abruf: Lieferwagen mit Handbuch. Zweiter Abruf: nur ein kleiner Brief mit Fingerabdruck fährt, Handbuch kommt aus dem Filialschrank.

### Zwei Modi
Links: Handbuch-Kopien auf den Schreibtischen der Kollegen (Peers), Kreis „ein Subnetz“. Rechts: Schrank-Server in der Filiale bedient zwei Netzabschnitte.

### Ausweisprüfung
Kollege will Kopie aus dem Filialschrank; Zentrale prüft per Telefon die Berechtigung, dann Freigabe.

## Karteikarten
- F: Wozu dient BranchCache? | A: WAN-Verkehr zu Außenstellen durch lokales Zwischenspeichern reduzieren.
- F: Zwei BranchCache-Modi? | A: Verteilter Cache und gehosteter Cache.
- F: Wo liegt der Cache im verteilten Modus? | A: Auf den Clients der Filiale (Peer-to-Peer, ein Subnetz).
- F: Wann gehosteter Cache? | A: Filiale mit Server und/oder mehreren Subnetzen.
- F: Welcher Rollendienst für SMB-Inhaltsserver? | A: BranchCache für Netzwerkdateien.
- F: Welche GPO-Einstellung benötigt der Dateiserver? | A: Hashveröffentlichung für BranchCache.
- F: Standard-Latenzschwelle für Netzwerkdateien? | A: 80 ms.
- F: Wie finden Clients den gehosteten Cache automatisch? | A: Über den Service Connection Point in AD.
- F: Welche Protokolle unterstützt BranchCache? | A: SMB, HTTP/HTTPS, BITS.
- F: Cmdlet für gehosteten Cache-Server mit SCP? | A: Enable-BCHostedServer -RegisterSCP
- F: Cmdlet zum Anzeigen des BranchCache-Status? | A: Get-BCStatus

## Quiz
? Eine Filiale hat keinen Server und ein Subnetz. Welcher BranchCache-Modus?
* Verteilter Cache
- Gehosteter Cache
- DFS-Replikation
- Offlinedateien

? Eine Filiale hat drei Subnetze und einen Server. Alle Clients sollen den Cache nutzen. Modus?
* Gehosteter Cache
- Verteilter Cache
- Hashveröffentlichung ohne Clientkonfiguration
- SMB-Verschlüsselung

? Der Dateiserver liefert keine BranchCache-Daten. Was fehlt am wahrscheinlichsten?
* GPO „Hashveröffentlichung für BranchCache“ bzw. BranchCache an der Freigabe
- DHCP-Option 252
- Eine DFS-Replikationsgruppe
- Ein weiches Kontingent

? Im Testlabor (LAN) wird trotz Konfiguration nichts gecacht. Mögliche Ursache?
* Latenz liegt unter der Schwelle von 80 ms
- Clients sind Windows 11 Enterprise
- Der Cache ist verschlüsselt
- Der SCP ist registriert

? Wie finden Clients einen gehosteten Cache-Server ohne manuelle Namensangabe?
* Automatische Erkennung über den Service Connection Point in AD
- Über DNS-SRV-Einträge von Netlogon
- Über DHCP-Option 006
- Über NRPT

? Welches Ziel verfolgt BranchCache?
* WAN-Bandbreite sparen, indem Inhalte in der Filiale zwischengespeichert werden
- Daten vom Hauptsitz in die Filiale replizieren
- Dateien verschlüsseln
- Benutzer gegen AD authentifizieren
! Clients rufen bereits geladene Inhalte lokal ab.

? Welche Inhaltsserver unterstützen BranchCache?
* SMB-Dateiserver, HTTP/HTTPS-Webserver (IIS) und BITS-basierte Server
- Nur FTP-Server
- Nur DNS-Server
- Nur Druckserver
! Auf Dateiservern muss das Feature „BranchCache für Netzwerkdateien“ installiert sein.

? Welche Windows-Editionen können BranchCache-Clients sein?
* Enterprise- und Education-Editionen (bzw. Pro mit BITS-Einschränkung)
- Alle Home-Editionen
- Nur Windows Server Core
- Nur Linux-Clients
! In der Praxis werden Enterprise/Education eingesetzt.
