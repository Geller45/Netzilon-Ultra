---
id: az800-dns
bereich: AZ-800
block: A7
kapitel: Netzwerkinfrastruktur
titel: AD-integriertes DNS – Zonen, Replikation, sichere Updates & Bereinigung
stufe: Fortgeschritten
quellen: [AZ-800 Study Guide, Microsoft Learn, Netzwerkinfrastruktur_mit_Windows_Server_2016_implementieren_70-741.pdf]
verweise: [ap1-a5-dns, ap1-a5-dns-zonen, az800-dns-weiterleitung, az800-dnssec, az800-standorte-replikation, az800-adds-dc]
---

## Profi

### Warum AD braucht DNS
Clients finden Domänencontroller über **SRV-Einträge** (`_ldap._tcp.dc._msdcs.<domäne>`, `_kerberos._tcp.<standort>._sites.<domäne>`). Der **Netlogon**-Dienst registriert diese Einträge (Datei `%SystemRoot%\System32\config\netlogon.dns`). Ohne funktionierendes DNS: kein Domänenbeitritt, keine Anmeldung, keine GPOs, keine Replikation.

### Zonentypen im Überblick
| Typ | Speicherung | Schreibbar | Replikation |
|---|---|---|---|
| **Primär (Datei)** | `%windir%\System32\dns\*.dns` | ja, nur auf **einem** Server | Zonenübertragung (AXFR/IXFR) |
| **Sekundär** | Datei, Kopie | nein | holt per Zonenübertragung |
| **Stub** | nur **SOA, NS, A der NS** | nein | vom Master |
| **AD-integriert** | in der **AD-Datenbank** (Anwendungsverzeichnispartition) | ja, auf **jedem** DC mit DNS (**Multimaster**) | **AD-Replikation** |

### Vorteile AD-integrierter Zonen
- **Multimaster**: jeder DNS-DC kann Änderungen annehmen → kein Single Point of Failure.
- **Replikation über AD** (nur geänderte Attribute, komprimiert zwischen Standorten, folgt der Standorttopologie) statt Zonenübertragung.
- **Sichere dynamische Updates** (*secure only*): nur authentifizierte Computer dürfen Einträge anlegen/ändern; Einträge haben **ACLs** (Besitzer).
- Auch **Sekundärzonen** auf Nicht-DCs weiterhin möglich (Zonenübertragung aus AD-Zone erlaubt).
- **RODC**: hält eine **schreibgeschützte** Kopie, leitet Updates an beschreibbaren DC weiter.

### Replikationsbereich (wo liegt die Zone?)
| Bereich | Partition | Empfänger |
|---|---|---|
| **Alle DNS-Server in der Gesamtstruktur** | `ForestDnsZones` | alle DCs mit DNS-Rolle im Forest (Standard für `_msdcs.<forest>`) |
| **Alle DNS-Server in der Domäne** | `DomainDnsZones` | alle DCs mit DNS-Rolle in der Domäne (**Standard** für neue Zonen) |
| **Alle DCs in der Domäne** (Windows-2000-kompatibel) | Domänenpartition | **alle** DCs, auch ohne DNS-Rolle |
| **Benutzerdefinierte Verzeichnispartition** | eigene Anwendungspartition | nur DCs, die man hinzufügt (`Add-DnsServerDirectoryPartition`) |
Ändern: Zoneneigenschaften → **Allgemein → Replikation: Ändern** bzw. `Set-DnsServerPrimaryZone -ReplicationScope`.

### Dynamische Updates
| Einstellung | Wirkung |
|---|---|
| **Keine** | nur manuelle Einträge |
| **Nicht sichere und sichere** | jeder darf registrieren – Sicherheitsrisiko |
| **Nur sichere** | nur authentifizierte Domänenmitglieder – **Standard und Empfehlung** bei AD-Zonen |
**DHCP-Server als Update-Proxy**: DHCP registriert A/PTR für Clients (z. B. Nicht-Windows). Dann gehören Einträge dem DHCP-Computerkonto → Problem bei mehreren DHCP-Servern → **DNS-Anmeldeinformationen** im DHCP hinterlegen (dediziertes Benutzerkonto) und **DHCP-Server nicht in DnsUpdateProxy** mischen, wenn auf einem DC installiert.

### Alterung und Aufräumvorgang (*Aging & Scavenging*)
Dynamisch registrierte Einträge erhalten einen **Zeitstempel**. Veraltete Einträge (Geräte längst weg) werden gelöscht, wenn:
- **Nicht-Aktualisierungsintervall** (*No-refresh*, Standard **7 Tage**): Zeitstempel wird **nicht** erneuert (weniger Replikation).
- **Aktualisierungsintervall** (*Refresh*, Standard **7 Tage**): Client darf Zeitstempel auffrischen.
- Nach Ablauf **beider** Intervalle ohne Auffrischung → Eintrag darf gelöscht werden.
- Aktivieren an **zwei Stellen**: auf der **Zone** (Alterung) **und** auf **mindestens einem Server** (Aufräumvorgang, Intervall). Statische Einträge haben keinen Zeitstempel und bleiben.

### Weitere Werkzeuge
- **Zonendelegierung**: Unterdomäne (z. B. `berlin.example.com`) an andere DNS-Server abgeben (NS + Glue-A).
- **Zonenübertragungen**: Registerkarte „Zonenübertragungen“ → nur an Server in der Registerkarte „Namenserver“ oder an bestimmte IPs; **Benachrichtigen** (*Notify*) für sofortige Aktualisierung.
- **DNS-Richtlinien** (seit 2016): Split-Brain, geobasierte Antworten, Filter – Details auf der Seite Weiterleitung.
- **Globale Abfragesperrliste**: blockiert standardmäßig `wpad` und `isatap`.
- **GlobalNames-Zone**: einteilige Namen ohne WINS auflösen (Legacy-Ersatz für WINS).
- Diagnose: `dcdiag /test:dns`, `nslookup -type=srv _ldap._tcp.dc._msdcs.example.com`, `Resolve-DnsName`, `ipconfig /registerdns`, `nltest /dsregdns`.

## Lab
**Maschinen**: **DC01** (example.com, DNS), **DC02** (zweiter DC mit DNS), **SRV01** (Mitgliedsserver), **CL01** (Windows 11).

### GUI
1. **DC01**: DNS-Manager → Forward-Lookupzonen → Neue Zone → **Primär** + „Zone in Active Directory speichern“ → **Alle DNS-Server in dieser Domäne** → `intern.example.com` → **Nur sichere dynamische Updates**.
2. **DC01**: Reverse-Lookupzone für `192.168.10.x` ebenso anlegen.
3. **DC02**: DNS-Manager → prüfen, dass die neue Zone nach der Replikation erscheint (ggf. in „Active Directory-Standorte und -Dienste“ **Jetzt replizieren**).
4. **DC01**: Zone `example.com` → Eigenschaften → Allgemein → **Alterung** → Aufräumvorgang aktivieren (7/7 Tage).
5. **DC01**: Server-Knoten → Eigenschaften → Erweitert → **Automatischen Aufräumvorgang veralteter Einträge aktivieren** (7 Tage).
6. **DC01**: Zone `example.com` → Eigenschaften → Zonenübertragungen → nur an **SRV01** erlauben.
7. **SRV01**: DNS-Rolle → Neue Zone → **Sekundär** → `example.com` → Master: IP von DC01.
8. **CL01**: `ipconfig /registerdns` → **DC01**: Eintrag CL01 prüfen, Zeitstempel anzeigen (Ansicht → Erweitert).

### PowerShell
```powershell
# Auf DC01 – AD-integrierte Zonen
Add-DnsServerPrimaryZone -Name "intern.example.com" -ReplicationScope Domain -DynamicUpdate Secure
Add-DnsServerPrimaryZone -NetworkId "192.168.10.0/24" -ReplicationScope Domain -DynamicUpdate Secure
Set-DnsServerPrimaryZone -Name "intern.example.com" -ReplicationScope Forest
Get-DnsServerZone

# Auf DC01 – Alterung/Aufräumen
Set-DnsServerZoneAging -Name "example.com" -Aging $true -NoRefreshInterval 7.00:00:00 -RefreshInterval 7.00:00:00
Set-DnsServerScavenging -ScavengingState $true -ScavengingInterval 7.00:00:00 -ApplyOnAllZones
Start-DnsServerScavenging -Force

# Auf DC01 – Zonenübertragung an SRV01, Delegierung
Set-DnsServerPrimaryZone -Name "example.com" -SecureSecondaries TransferToSecureServers -SecondaryServers 192.168.10.20 -Notify NotifyServers -NotifyServers 192.168.10.20
Add-DnsServerZoneDelegation -Name "example.com" -ChildZoneName "berlin" -NameServer "dns-ber.berlin.example.com" -IPAddress 192.168.20.10

# Auf SRV01 – Sekundärzone
Add-DnsServerSecondaryZone -Name "example.com" -ZoneFile "example.com.dns" -MasterServers 192.168.10.10

# Auf DC01 – Diagnose
dcdiag /test:dns /v
Resolve-DnsName -Type SRV _ldap._tcp.dc._msdcs.example.com
nltest /dsregdns
Get-DnsServerResourceRecord -ZoneName "example.com" -Name "CL01" | Select-Object HostName,Timestamp
```

## Einfach

**DNS** ist das **Telefonbuch** des Netzes: Name rein, IP-Adresse raus. Für Active Directory steht darin außerdem, **wo die Domänencontroller wohnen** (SRV-Einträge). Ohne dieses Telefonbuch findet kein PC seinen DC – dann klappt keine Anmeldung.

**Normale Zone** = das Telefonbuch liegt als **Datei** auf **einem** Server. Nur dieser eine darf etwas hineinschreiben, die anderen bekommen Kopien.

**AD-integrierte Zone** = das Telefonbuch steckt **im Active Directory**. Jeder DC mit DNS hat ein **eigenes beschreibbares Exemplar**, und AD sorgt dafür, dass alle Exemplare gleich bleiben. Fällt ein DC aus, schreiben die anderen einfach weiter.

**Sichere Updates** = nur PCs mit **Domänenausweis** dürfen ihre eigene Nummer eintragen. Fremde Geräte können nicht einfach „Ich bin der Server!“ ins Telefonbuch schreiben.

**Aufräumen (Scavenging)** = PCs, die seit Wochen nicht mehr „Hallo, mich gibt es noch“ gesagt haben, werden aus dem Telefonbuch gestrichen. Wichtig: Man muss es **zweimal einschalten** – bei der **Zone** und beim **Server**. Handschriftliche (statische) Einträge werden nie gestrichen.

**Replikationsbereich** = Wer bekommt ein Exemplar des Telefonbuchs? Alle DNS-Server der **Domäne**, alle im ganzen **Forest**, alle **DCs** oder nur eine **ausgesuchte Gruppe**.

## Merksatz
- AD-integriert = **Multimaster** + **sichere Updates** + **AD-Replikation**.
- `DomainDnsZones` = Domäne, `ForestDnsZones` = Gesamtstruktur.
- Scavenging **zweimal** einschalten: **Zone + Server**.
- No-refresh 7 + Refresh 7 = frühestens nach **14 Tagen** weg.
- SRV-Einträge registriert **Netlogon**.
- Stub = nur **SOA + NS + Glue**.

## Prüfungsfalle
- Aufräumvorgang nur auf der Zone aktiviert → nichts wird gelöscht.
- Sichere dynamische Updates nur bei AD-integrierten Zonen verfügbar.
- „Alle DCs in der Domäne“ repliziert auch an DCs ohne DNS-Rolle.
- Bereich „Forest“ nötig, wenn DNS-Server anderer Domänen die Zone hosten sollen.
- DHCP-Registrierung auf DC ohne eigene DNS-Anmeldeinformationen → Sicherheitsproblem.
- Fehlende SRV-Einträge → `nltest /dsregdns` oder Netlogon neu starten.

## Grafik
### Telefonbuch im AD
Ein Buch „example.com“ liegt in DC01, DC02, DC03; ein Eintrag wird bei DC02 geschrieben und wandert als Leuchtpunkt über AD-Replikation zu den anderen.

### Ausweiskontrolle
Domänen-PC zeigt Ausweis und darf eintragen; fremdes Gerät ohne Ausweis wird vom Türsteher „Nur sichere Updates“ abgewiesen.

### Scavenging-Uhr
Eintrag mit Zeitstempel; Uhr läuft 7 Tage „No-refresh“ (grau), 7 Tage „Refresh“ (gelb), dann Radiergummi. Daneben ein Schalter „Zone“ und ein Schalter „Server“ – Radiergummi arbeitet nur, wenn beide an sind.

### Replikationsbereiche
Kreise: kleinster Kreis Domäne (DNS-Server), größerer Kreis Forest, separater Kreis alle DCs – Zone springt in die jeweiligen Kreise.

## Karteikarten
- F: Hauptvorteile AD-integrierter Zonen? | A: Multimaster, sichere dynamische Updates, Replikation über AD.
- F: Standard-Replikationsbereich neuer AD-Zonen? | A: Alle DNS-Server in dieser Domäne (DomainDnsZones).
- F: In welcher Partition liegt _msdcs der Stammdomäne? | A: ForestDnsZones.
- F: Welcher Dienst registriert die SRV-Einträge eines DC? | A: Netlogon.
- F: Standardintervalle bei Alterung? | A: No-refresh 7 Tage, Refresh 7 Tage.
- F: Wo muss Scavenging aktiviert werden? | A: Auf der Zone (Alterung) und auf mindestens einem DNS-Server.
- F: Was enthält eine Stubzone? | A: SOA-, NS- und Glue-A-Einträge der autoritativen Server.
- F: Welche Update-Einstellung ist bei AD-Zonen empfohlen? | A: Nur sichere dynamische Updates.
- F: Cmdlet für eine neue AD-integrierte Zone? | A: Add-DnsServerPrimaryZone -ReplicationScope Domain
- F: Befehl zum erneuten Registrieren der DC-SRV-Einträge? | A: nltest /dsregdns (oder Netlogon neu starten).
- F: Welche Namen blockiert die globale Abfragesperrliste standardmäßig? | A: wpad und isatap.

## Quiz
? Veraltete DNS-Einträge werden trotz aktivierter Alterung auf der Zone nicht gelöscht. Ursache?
* Aufräumvorgang ist auf keinem DNS-Server aktiviert
- Die Zone ist AD-integriert
- Sichere Updates sind aktiv
- Die Zone hat keinen SOA-Eintrag

? Eine Zone soll auf DNS-Servern aller Domänen im Forest verfügbar sein. Welcher Replikationsbereich?
* Alle DNS-Server in dieser Gesamtstruktur
- Alle DNS-Server in dieser Domäne
- Alle DCs in dieser Domäne
- Zonenübertragung an alle Server

? Welche Funktion bieten nur AD-integrierte Zonen?
* Nur sichere dynamische Updates
- Zonenübertragung
- Reverse-Lookup
- Delegierung

? Ein Eintrag hat No-refresh 7 und Refresh 7 Tage. Wann darf er frühestens gelöscht werden?
* Nach 14 Tagen ohne Auffrischung
- Nach 7 Tagen
- Sofort beim nächsten Aufräumen
- Nie, dynamische Einträge bleiben

? Ein Mitgliedsserver ohne AD-DNS soll eine lesbare Kopie der Zone example.com halten. Lösung?
* Sekundärzone mit Zonenübertragung von DC01
- AD-integrierte Zone auf dem Mitgliedsserver
- Stubzone mit dynamischen Updates
- Bedingte Weiterleitung

? Welcher Eintragstyp wird für das Auffinden von DCs benötigt?
* SRV
- MX
- CNAME
- TXT
! Netlogon registriert die SRV-Einträge automatisch.

? Wo wird die Alterung und Bereinigung zusätzlich zur Zone aktiviert?
* Auf mindestens einem DNS-Server (Serverbereinigung)
- Auf jedem Client
- Im DHCP-Server
- In der Gruppenrichtlinie der Clients
! Erst dann werden veraltete Einträge tatsächlich gelöscht.

? Welche Einstellung für dynamische Updates sollte bei AD-integrierten Zonen gewählt werden?
* Nur sichere dynamische Updates
- Nicht sichere und sichere Updates
- Keine dynamischen Updates
- Nur Updates per DHCP-Option 081
! Nur authentifizierte Domänenmitglieder dürfen Einträge registrieren.
