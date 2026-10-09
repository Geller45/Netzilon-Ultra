---
id: netz-dns-uebung
bereich: AZ-800
block: Netzwerk
kapitel: Netzwerkdienste
titel: DNS-Übung Windows Server 2025 – Primäre, sekundäre und Reverse-Zone, Zonentransfer
stufe: Fortgeschritten
fach: Windows Server / AZ-800
pruefungen: [AZ-800, AP2, Schule]
quellen: [DNS_Uebung_Win2025_1.pdf, DNS_Loesung_Uebung_Win2025_1.pdf]
verweise: [netz-dns-einfuehrung, netz-dns-delegierung-stub, ccna-dhcp-dns, netz-dhcp-uebung]
---

## Profi

### Lab-Umgebung (Übungsreihe 1)
Zone `firma.local`, Netz 192.168.10.0/24. **SRV-DNS01** 192.168.10.11 (primär), **SRV-DNS02** 192.168.10.12 (sekundär), **CL-01** 192.168.10.20 (Windows 11, DNS = SRV-DNS01), Beispielhosts SRV-APP01 .30, SRV-WEB01 .31, SRV-MAIL01 .32. Wichtig: Es werden bewusst **dateibasierte, nicht AD-integrierte** Zonen verwendet, damit ein klassischer **Zonentransfer (AXFR/IXFR)** geübt werden kann (AD-integrierte Zonen replizieren über AD, Multimaster).

### Teil A/B – Lösungen im Überblick
**Primäre Zone**
1. Rolle installieren (SRV-DNS01): Server-Manager → Rollen und Features → DNS-Server; PowerShell `Install-WindowsFeature -Name DNS -IncludeManagementTools`; Dienst prüfen `Get-Service DNS` (Running, Automatic).
2. Zone anlegen: DNS-Manager → Forward-Lookupzonen → Neue Zone → Primär, **nicht in AD DS speichern**, Name `firma.local`, Zonendatei `firma.local.dns`, dynamische Updates „nicht sicher und sicher“. PowerShell: `Add-DnsServerPrimaryZone -Name "firma.local" -ZoneFile "firma.local.dns" -DynamicUpdate NonsecureAndSecure`.
3. Ressourceneinträge: A `srv-app01` .30, `srv-web01` .31, `srv-mail01` .32, CNAME `www` → `srv-web01.firma.local`, MX → `srv-mail01.firma.local` Priorität 10. Option „PTR erstellen“ bzw. `-CreatePtr` (**wirkt nur, wenn die Reverse-Zone bereits existiert** – daher noch keine PTR in Übung 3).
4. Zonentransfer vorbereiten: Zone → Eigenschaften → Zonenübertragungen → „Nur an die folgenden Server“ 192.168.10.12 und **Benachrichtigen** (NOTIFY). PowerShell: `Set-DnsServerPrimaryZone -Name "firma.local" -SecureSecondaries TransferToZoneNameServer` bzw. `-SecondaryServers 192.168.10.12 -Notify NotifyServers -NotifyServers 192.168.10.12`.

**Sekundäre Zone**
5. Rolle auf SRV-DNS02 installieren.
6. Zone anlegen: Sekundäre Zone `firma.local`, Master 192.168.10.11 (`Add-DnsServerSecondaryZone -Name "firma.local" -ZoneFile "firma.local.dns" -MasterServers 192.168.10.11`).
7. Transfer: im DNS-Manager auf der sekundären Zone „Vom Master übertragen“ (schnell, ohne Dienstneustart); Prüfung `Get-DnsServerResourceRecord -ZoneName "firma.local" -ComputerName SRV-DNS02`.
8. **Inkrementeller Transfer**: neuen Host `srv-file01` .33 anlegen. SOA-Seriennummer steigt bei jeder Änderung um 1. Der Sekundärserver vergleicht beim Refresh die Seriennummer: gleich → kein Transfer; Master höher → **IXFR** (nur Differenz); Neuaufbau/neue Zone oder keine IXFR-Historie → **AXFR** (vollständig).
9. Auflösungstest über SRV-DNS02: `Resolve-DnsName srv-app01.firma.local -Server 192.168.10.12`.

**Reverse-Zone**
10. Primäre Reverse-Zone für 192.168.10.0/24 (Zonenname automatisch `10.168.192.in-addr.arpa`, Datei `10.168.192.in-addr.arpa.dns`): `Add-DnsServerPrimaryZone -NetworkID "192.168.10.0/24" -ZoneFile "10.168.192.in-addr.arpa.dns" -DynamicUpdate NonsecureAndSecure`.
11. PTR nachtragen: `Add-DnsServerResourceRecordPtr -ZoneName "10.168.192.in-addr.arpa" -Name "30" -PtrDomainName "srv-app01.firma.local"` (analog .31, .32, .33).
12. Test von CL-01: `nslookup 192.168.10.30` → srv-app01.firma.local; `Resolve-DnsName 192.168.10.30`.
13. Reverse-Zone sekundär auf SRV-DNS02 (`Add-DnsServerSecondaryZone -NetworkID "192.168.10.0/24" -MasterServers 192.168.10.11`); **Zonentransfer** auch für die Reverse-Zone auf SRV-DNS01 freigeben!

**Kontrolle & Troubleshooting**
14. `Get-DnsServerZone -ComputerName SRV-DNS01` / `SRV-DNS02`; `Get-DnsServerResourceRecord -ZoneName "firma.local"`.
15. Fehlerszenario: `Set-DnsServerPrimaryZone -Name "firma.local" -SecureSecondaries TransferToNoServer`, neuen Host anlegen, Transfer scheitert (Ereignis z. B. ID 6527 „Zonenübertragung verweigert“) – danach `TransferToZoneNameServer` wiederherstellen.

## Einfach

In dieser Übung baust du **zwei Telefonbücher**, die dasselbe enthalten:
- Das **Haupt-Telefonbuch** (primäre Zone) liegt auf Server 1. Nur hier darf man schreiben.
- Das **Abschrift-Telefonbuch** (sekundäre Zone) liegt auf Server 2. Es kopiert sich regelmäßig vom Haupt-Telefonbuch. Falls Server 1 ausfällt, kann Server 2 trotzdem Auskunft geben.

Damit der zweite Server kopieren **darf**, muss der erste das ausdrücklich erlauben („Nur an Server 2 weitergeben“). Das wird gern vergessen! Außerdem kann der erste dem zweiten Bescheid sagen: „Hey, es gibt Neues!“ (NOTIFY).

Woher weiß der zweite, dass sich etwas geändert hat? Jedes Telefonbuch hat auf dem Deckblatt eine **Seriennummer (SOA)**. Bei jeder Änderung wird sie um 1 erhöht. Server 2 vergleicht: „Meine Nummer ist 5, deine ist 6 – dann hol ich mir nur die Änderungen!“ (IXFR). Wenn Server 2 ganz neu ist, kopiert er alles (AXFR).

Dazu kommt die **Rückwärts-Auskunft** (Reverse-Zone): Normalerweise fragt man „Wie ist die Nummer von Herrn Müller?“. Die Reverse-Zone beantwortet die Frage „Wem gehört die Nummer 192.168.10.30?“ Für diese Zone legt man zu jedem Namen einen Rückwärts-Eintrag (PTR) an. Weil die Reihenfolge beim Reverse umgedreht ist, heißt die Zone `10.168.192.in-addr.arpa`.

Am Ende testest du alles mit `nslookup` von einem Client aus, ob Hin- und Rückauflösung klappen.

## Merksatz
- **Primär = schreiben, sekundär = Kopie per AXFR/IXFR.**
- **Transfer erlauben + NOTIFY, sonst „verweigert“.**
- **Seriennummer (SOA) steuert den Transfer.**
- **Reverse-Zone: 10.168.192.in-addr.arpa für 192.168.10.0/24.**
- **-CreatePtr braucht eine existierende Reverse-Zone.**

## Prüfungsfalle
- **Zonentransfer nicht freigegeben** → sekundärer Server bleibt leer. Klassischer Fehler.
- **-CreatePtr** ohne bestehende Reverse-Zone erzeugt keine PTR-Einträge.
- In der Reverse-Zone steht im Namensfeld nur das **letzte Oktett** (z. B. `30`).
- Bei **AD-integrierten Zonen** gibt es keinen klassischen Zonentransfer.
- **IXFR** ist nur die Differenz; ein neuer Sekundärserver bekommt **AXFR**.
- Die Reverse-Zone der sekundären Seite muss separat **freigegeben** werden.
- Nach DNS-Umstellung am Client **Clear-DnsClientCache** nicht vergessen.

## Grafik
### Zonentransfer
1. SRV-DNS01: Neuer Eintrag srv-file01, SOA-Serial 5 -> 6
2. SRV-DNS01 -> SRV-DNS02: NOTIFY (Zone geändert)
3. SRV-DNS02 -> SRV-DNS01: SOA-Abfrage (Serial vergleichen)
4. SRV-DNS02 -> SRV-DNS01: IXFR (nur Änderungen)
5. SRV-DNS01 -> SRV-DNS02: Änderung übertragen, SRV-DNS02 Serial 6

### Reverse-Lookup
1. CL-01 -> SRV-DNS01: PTR 30.10.168.192.in-addr.arpa?
2. SRV-DNS01: Reverse-Zone 10.168.192.in-addr.arpa – Eintrag 30
3. SRV-DNS01 -> CL-01: srv-app01.firma.local

## Lab
**Maschinen: SRV-DNS01, SRV-DNS02, CL-01** (siehe Lösungen oben, hier die kompakten PowerShell-Blöcke)

### GUI
1. **SRV-DNS01**: DNS-Manager → Forward-Lookupzonen → Neue Zone → Primär → firma.local (nicht AD).
2. **SRV-DNS01**: Zone → Neuer Host (A) … → Haken „Zugehörigen PTR-Eintrag erstellen“.
3. **SRV-DNS01**: Zone → Eigenschaften → Zonenübertragungen → Nur an 192.168.10.12 → Benachrichtigen.
4. **SRV-DNS02**: Neue Zone → Sekundär → Master 192.168.10.11 → „Vom Master übertragen“.

### PowerShell
Auf **SRV-DNS01**:
```
Install-WindowsFeature -Name DNS -IncludeManagementTools
Add-DnsServerPrimaryZone -Name "firma.local" -ZoneFile "firma.local.dns" -DynamicUpdate NonsecureAndSecure
Add-DnsServerResourceRecordA -ZoneName "firma.local" -Name "srv-app01" -IPv4Address "192.168.10.30"
Add-DnsServerResourceRecordCName -ZoneName "firma.local" -Name "www" -HostNameAlias "srv-web01.firma.local"
Add-DnsServerResourceRecordMX -ZoneName "firma.local" -Name "." -MailExchange "srv-mail01.firma.local" -Preference 10
Set-DnsServerPrimaryZone -Name "firma.local" -SecureSecondaries TransferToZoneNameServer
Set-DnsServerPrimaryZone -Name "firma.local" -SecondaryServers "192.168.10.12" -Notify NotifyServers -NotifyServers "192.168.10.12"
Add-DnsServerPrimaryZone -NetworkID "192.168.10.0/24" -ZoneFile "10.168.192.in-addr.arpa.dns" -DynamicUpdate NonsecureAndSecure
```
Auf **SRV-DNS02**:
```
Install-WindowsFeature -Name DNS -IncludeManagementTools
Add-DnsServerSecondaryZone -Name "firma.local" -ZoneFile "firma.local.dns" -MasterServers 192.168.10.11
Add-DnsServerSecondaryZone -NetworkID "192.168.10.0/24" -MasterServers 192.168.10.11
Get-DnsServerResourceRecord -ZoneName "firma.local" -ComputerName SRV-DNS02
```
Auf **CL-01**:
```
Resolve-DnsName srv-app01.firma.local
nslookup 192.168.10.30
Set-DnsClientServerAddress -InterfaceAlias "Ethernet" -ServerAddresses 192.168.10.12
```

## Befehle
- `Add-DnsServerPrimaryZone` – primäre Zone
- `Add-DnsServerSecondaryZone` – sekundäre Zone
- `Set-DnsServerPrimaryZone -SecureSecondaries` – Transfer steuern
- `Add-DnsServerResourceRecordA|CName|MX|Ptr` – Einträge
- `Get-DnsServerZone` – Zonenübersicht
- `Get-DnsServerResourceRecord` – Einträge anzeigen
- `nslookup 192.168.10.30` – Reverse-Test

## Übungen
- A: Wozu dient die SOA-Seriennummer? | L: Sekundärserver erkennen damit, ob die Zone geändert wurde; steuert IXFR/AXFR.
- A: Unterschied AXFR/IXFR? | L: AXFR = vollständige Zonenübertragung, IXFR = nur Änderungen seit bekannter Seriennummer.
- A: Wie lautet der Zonenname der Reverse-Zone für 192.168.10.0/24? | L: 10.168.192.in-addr.arpa
- A: Warum hat der Sekundärserver keine Einträge? | L: Zonenübertragung nicht (oder an falschen Server) freigegeben, falscher Master, Transfer nicht angestoßen.
- A: Warum entstehen mit -CreatePtr noch keine PTR-Einträge? | L: Die Reverse-Zone existiert noch nicht.
- A: Wie testen Sie die Rückauflösung? | L: nslookup 192.168.10.30 bzw. Resolve-DnsName 192.168.10.30
- A: Warum wurden nicht AD-integrierte Zonen verwendet? | L: Damit klassischer Zonentransfer (AXFR/IXFR) geübt werden kann.
- A: Wie ändert man den DNS-Server des Clients per PowerShell? | L: Set-DnsClientServerAddress -InterfaceAlias "Ethernet" -ServerAddresses 192.168.10.12

## Karteikarten
- F: Was ist eine sekundäre Zone? | A: Schreibgeschützte Kopie einer primären Zone per Zonentransfer.
- F: Was ist NOTIFY? | A: Primärserver informiert Sekundärserver über Änderungen.
- F: Was ist AXFR? | A: Vollständige Zonenübertragung.
- F: Was ist IXFR? | A: Inkrementelle Zonenübertragung (Differenz).
- F: Reverse-Zone für 10.1.2.0/24? | A: 2.1.10.in-addr.arpa
- F: PTR-Eintrag Name in 10.168.192.in-addr.arpa für .30? | A: 30
- F: Dynamische Updates Optionen? | A: Keine, nicht sicher+sicher, nur sicher (AD).
- F: Cmdlet für Zonenübersicht? | A: Get-DnsServerZone
- F: Cmdlet für Client-DNS? | A: Set-DnsClientServerAddress
- F: Welches Ereignis bei verweigertem Transfer (Beispiel)? | A: ID 6527 – Zonenübertragung verweigert.

## Quiz
? Wo darf ein Eintrag in einer klassischen Zone geändert werden?
* Auf dem primären Server
- Auf dem sekundären Server
- Auf beiden
- Auf dem Client
? Wie heißt die vollständige Zonenübertragung?
* AXFR
- IXFR
- NOTIFY
- SOA
? Was steuert den inkrementellen Transfer?
* Die SOA-Seriennummer
- Die TTL
- Der Hostname
- Die MAC-Adresse
? Name der Reverse-Zone für 192.168.10.0/24?
* 10.168.192.in-addr.arpa
- 192.168.10.in-addr.arpa
- 10.168.192.arpa
- 192.10.168.in-addr
? Was passiert, wenn der Zonentransfer nicht freigegeben ist?
* Der Sekundärserver erhält keine Daten
- Der Transfer läuft doppelt
- Die Zone wird gelöscht
- DNSSEC wird aktiv
? Welche Funktion informiert den Sekundärserver aktiv?
* NOTIFY
- Forwarder
- Scavenging
- Root Hints
? Warum gibt es keinen klassischen Zonentransfer bei AD-integrierten Zonen?
* Replikation läuft über Active Directory
- Diese Zonen sind schreibgeschützt
- DNS erlaubt es nicht
- Sie sind immer sekundär
? Welcher Befehl erstellt einen CNAME?
* Add-DnsServerResourceRecordCName
- Add-DnsServerAlias
- New-DnsAlias
- Set-DnsCname
? Welcher Befehl löst eine IP in einen Namen auf?
* nslookup 192.168.10.30
- nslookup -a name
- ping -n 192.168.10.30
- tracert -r
