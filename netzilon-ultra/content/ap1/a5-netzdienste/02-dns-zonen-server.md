---
id: ap1-a5-dns-zonen
bereich: AP1
block: A5
kapitel: Netzdienste
titel: DNS-Server – Zonen, Zonentransfer, Delegierung, Stubzone, DoH
stufe: Fortgeschritten
quellen: [DNS_WindowsServer2025.pdf, DNS_Uebung_Win2025_1.pdf, DNS_Loesung_Uebung_Win2025_1.pdf, DNS_Uebung_Win2025_2.pdf, Identitätsmanagement_mit_Windows_Server_2016_70-742.pdf]
verweise: [ap1-a5-dns, ap1-a5-namensaufloesung, ap1-a6-adds, az800-dns]
---

## Profi

### Zonen
Eine **Zone** ist der Teil des Namensraums, für den ein DNS-Server **autoritativ** ist (z. B. firma.local). Forward-Lookupzonen (Name → IP) und **Reverse-Lookupzonen** (IP → Name; IPv4 `x.y.z.in-addr.arpa` mit **umgekehrter** Netzwerk-ID, z. B. 192.168.10.0/24 → `10.168.192.in-addr.arpa`; IPv6 `ip6.arpa`).

| Zonentyp | Beschreibung |
|---|---|
| **Primäre Zone** | **beschreibbare** Master-Kopie; Änderungen werden hier gemacht; dateibasiert (`%SystemRoot%\System32\dns\zone.dns`) oder AD-integriert |
| **Sekundäre Zone** | **schreibgeschützte** Kopie, wird per **Zonentransfer** vom Master übernommen; Lastverteilung/Ausfallsicherheit |
| **Stubzone** | enthält **nur SOA-, NS- und Glue-A-Einträge** einer fremden Zone → hält aktuell, **welche Server zuständig** sind; der Server ist dafür **nicht autoritativ** |
| **AD-integrierte Zone** (empfohlen) | in der AD-Datenbank gespeichert, **Multimaster-Replikation** über AD (jeder DC mit DNS kann ändern), **sichere dynamische Updates**, kein klassischer Zonentransfer nötig; Replikationsbereich: Gesamtstruktur, Domäne, alle DCs der Domäne oder Anwendungsverzeichnispartition |

### Dynamische Updates
Clients registrieren ihre A- (und PTR-)Einträge selbst (DHCP-Client-Dienst) oder der DHCP-Server tut es für sie.
- **Nur sichere** (nur bei AD-integrierten Zonen): Nur authentifizierte Domänenmitglieder dürfen Einträge anlegen/ändern – empfohlen.
- **Nicht sichere und sichere**: Jeder darf registrieren – unsicher (Lab/Übung).
- **Keine**: nur manuelle Pflege.

### Zonentransfer
Überträgt Zonendaten vom Master (primär) zum sekundären Server:
- **AXFR** (Full Zone Transfer): gesamte Zone – bei neuer Sekundärzone oder wenn keine Änderungshistorie verfügbar ist.
- **IXFR** (Incremental): **nur die Änderungen** seit der letzten bekannten **SOA-Seriennummer**.
- Ablauf: Der sekundäre Server vergleicht im **Refresh-Intervall** seine Seriennummer mit der des Masters. Gleich → kein Transfer. Master höher → IXFR (bzw. AXFR). Mit **DNS NOTIFY** benachrichtigt der Master die Sekundärserver sofort bei Änderungen.
- Die Seriennummer wird bei **jeder Änderung** automatisch um 1 erhöht.
- **Sicherheit**: Zonentransfers nur an **explizit genannte Server** (oder an die im NS-Eintrag genannten) erlauben – sonst kann jeder die komplette Zone auslesen. Verweigerte Transfers: Ereignis **6527** (Zonenübertragung verweigert) auf dem sekundären Server.

### Delegierung vs. Stubzone vs. bedingte Weiterleitung
| | **Delegierung** | **Stubzone** | **Bedingte Weiterleitung** |
|---|---|---|---|
| Wo? | in der **Elternzone** (firma.local) auf deren autoritativem Server | eigene Zone auf **beliebigem** DNS-Server | Einstellung auf beliebigem DNS-Server |
| Zweck | **Autorität** für einen Teilbereich (niederlassung.firma.local) an einen anderen Server **abgeben** | Liste der zuständigen Nameserver einer fremden Zone **automatisch aktuell** halten | Anfragen für einen Namespace an **feste IPs** schicken |
| Inhalt | **NS**- + **Glue-A**-Eintrag in der Elternzone | SOA, NS, Glue-A der Zielzone – **keine** A/CNAME/MX | nur IP-Adressen der Zielserver |
| Pflicht? | **Ja** – ohne Delegierung ist die Kindzone über die Elternzone nicht erreichbar | nein – reine Optimierung, wirkt nur auf dem Server, der sie hat | nein |
| Aktualisierung | manuell | **automatisch** (NS-Änderungen werden übernommen) | manuell |

**Glue-Record**: A-Eintrag für den Nameserver der Kindzone in der Elternzone – nötig, wenn der Nameserver-Name selbst in der delegierten Zone liegt (Henne-Ei-Problem).

### Neuerungen Windows Server 2025
- **DNS over HTTPS (DoH)** auf dem DNS-Server: verschlüsselt die Abfragen **Client ↔ Server** über **Port 443/TLS** (klassisch: Port 53 im Klartext → Abhören/Spoofing möglich). Allgemein verfügbar seit dem Server-2025-Update vom Juni 2026; klassisches DNS bleibt parallel nutzbar; die Weiterleitung an Upstream-Server erfolgt vorerst weiter klassisch. Voraussetzungen: gültiges **TLS-Zertifikat** (z. B. aus AD CS), Server-2025-Update, Firewallregel **TCP 443 eingehend (Domänenprofil)**. Baustein für **Zero-Trust-DNS**.
- **Ende von WINS**: Server 2025 ist die **letzte Version mit WINS** (Standardsupport bis 2034). Empfehlungen: NetBIOS-Abhängigkeiten inventarisieren, zu DNS migrieren (inkl. bedingter Weiterleitungen), Altanwendungen modernisieren, keine statischen Hosts-Dateien als Ersatz.

### Best Practices & Sicherheit
- **DNSSEC**: signiert Zonen kryptografisch (RRSIG, DNSKEY, DS) → Schutz gegen Manipulation/Cache-Poisoning.
- **Aufräumen (Scavenging)**: entfernt veraltete, dynamisch registrierte Einträge automatisch (auf Server- **und** Zonenebene aktivieren; Intervalle „Kein Aktualisieren“/„Aktualisieren“, Standard 7 + 7 Tage).
- **Redundanz**: mindestens zwei DNS-Server, bevorzugt AD-integrierte Zonen.
- **Zonentransfer einschränken** auf bekannte Sekundärserver.
- **Monitoring**: `Resolve-DnsName`, `nslookup`, Ereignisanzeige (Anwendungs- und Dienstprotokolle → DNS-Server), `dcdiag /test:dns`.
- DoH für sensible Bereiche.

## Lab
**Maschinen** (Übungsreihe, dateibasierte Zonen, damit klassischer Zonentransfer geübt werden kann):
| Rolle | Name | IP |
|---|---|---|
| Primärer DNS | SRV-DNS01 | 192.168.10.11 |
| Sekundärer DNS | SRV-DNS02 | 192.168.10.12 |
| DNS Niederlassung | SRV-DNS03 | 192.168.10.13 |
| Client | CL-01 | 192.168.10.20 (DNS = .11) |

### GUI
**Teil A – Primäre Zone (SRV-DNS01)**
1. Server-Manager → Rollen und Features hinzufügen → **DNS-Server** → Installieren.
2. Tools → **DNS** (`dnsmgmt.msc`) → Rechtsklick **Forward-Lookupzonen** → Neue Zone → **Primäre Zone** → Haken „Zone in AD speichern“ **entfernen** → Name `firma.local` → Datei `firma.local.dns` → „Nicht sichere und sichere dynamische Updates zulassen“.
3. Zone firma.local → Rechtsklick **Neuer Host (A oder AAAA)**: srv-app01 → .30, srv-web01 → .31, srv-mail01 → .32 (Haken „Zugehörigen PTR-Eintrag erstellen“ – funktioniert erst, wenn die Reverse-Zone existiert).
4. Rechtsklick **Neuer Alias (CNAME)**: www → srv-web01.firma.local.
5. Rechtsklick **Neuer Mail-Exchanger (MX)**: Host leer lassen, Server srv-mail01.firma.local, Priorität 10.
6. Zone → Eigenschaften → **Zonenübertragungen** → „Zonenübertragungen zulassen“ → **„Nur an folgende Server“** → 192.168.10.12 → **Benachrichtigen…** → „Folgende Server“ → 192.168.10.12.

**Teil B – Sekundäre Zone (SRV-DNS02)**
7. DNS-Rolle installieren.
8. Forward-Lookupzonen → Neue Zone → **Sekundäre Zone** → firma.local → Masterserver 192.168.10.11.
9. Rechtsklick Zone → **„Vom Master übertragen“** → alle Einträge (A, CNAME, MX) prüfen.
10. Auf SRV-DNS01 Host srv-file01 → .33 anlegen → auf SRV-DNS02 erscheint er dank NOTIFY/IXFR nach Sekunden (SOA-Seriennummer vergleichen).
11. **CL-01**: `nslookup srv-app01.firma.local 192.168.10.12`.

**Teil C – Reverse-Zone**
12. SRV-DNS01: Reverse-Lookupzonen → Neue Zone → Primär → nicht AD → **IPv4** → Netzwerk-ID `192.168.10` → dynamische Updates zulassen.
13. PTR-Einträge prüfen/ergänzen: Rechtsklick → **Neuer Zeiger (PTR)** → 192.168.10.30 → srv-app01.firma.local (ebenso .31, .32, .33).
14. **CL-01**: `nslookup 192.168.10.30` → srv-app01.firma.local.
15. SRV-DNS02: Sekundäre Reverse-Zone anlegen (Master .11) – vorher auf SRV-DNS01 bei der Reverse-Zone Zonenübertragungen an .12 erlauben!

**Teil D – Fehlerszenario**
16. SRV-DNS01: Zonenübertragungen für firma.local **deaktivieren**, Eintrag srv-test01 → .40 anlegen.
17. SRV-DNS02: „Vom Master übertragen“ → Transfer scheitert, srv-test01 fehlt, Ereignisanzeige → DNS-Server: **Ereignis 6527**. Danach Freigabe wiederherstellen.

**Teil E – Delegierung und Stubzone**
18. SRV-DNS03: DNS-Rolle, primäre Zone `niederlassung.firma.local`, Hosts srv-nb01 → .50, srv-nb02 → .51.
19. SRV-DNS01: Zone firma.local → Rechtsklick **Neue Delegierung** → delegierte Domäne `niederlassung` → Nameserver `srv-dns03.firma.local`, IP 192.168.10.13.
20. Prüfen: In firma.local erscheint ein **NS-Eintrag** + **Glue-A** – aber keine Hosts der Kindzone.
21. CL-01 (DNS = .11): `Resolve-DnsName srv-nb01.niederlassung.firma.local` → 192.168.10.50 (SRV-DNS01 folgt dem NS-Verweis zu SRV-DNS03).
22. SRV-DNS02: Neue Zone → **Stubzone** → niederlassung.firma.local → Master 192.168.10.13 → enthält nur SOA/NS/Glue, **kein** srv-nb02.
23. Vergleich: Delegierung auf SRV-DNS01 löschen → Auflösung über .11 scheitert, über .12 (Stubzone) funktioniert weiter. Danach Delegierung wiederherstellen.

### PowerShell
```powershell
# SRV-DNS01 – Rolle, primäre Zone, Einträge
Install-WindowsFeature DNS -IncludeManagementTools
Add-DnsServerPrimaryZone -Name "firma.local" -ZoneFile "firma.local.dns" -DynamicUpdate NonsecureAndSecure
Add-DnsServerResourceRecordA -ZoneName "firma.local" -Name "srv-app01" -IPv4Address 192.168.10.30 -CreatePtr
Add-DnsServerResourceRecordA -ZoneName "firma.local" -Name "srv-web01" -IPv4Address 192.168.10.31 -CreatePtr
Add-DnsServerResourceRecordA -ZoneName "firma.local" -Name "srv-mail01" -IPv4Address 192.168.10.32 -CreatePtr
Add-DnsServerResourceRecordCName -ZoneName "firma.local" -Name "www" -HostNameAlias "srv-web01.firma.local"
Add-DnsServerResourceRecordMX -ZoneName "firma.local" -Name "." -MailExchange "srv-mail01.firma.local" -Preference 10
Set-DnsServerPrimaryZone -Name "firma.local" -SecureSecondaries TransferToSecureServers `
  -SecondaryServers 192.168.10.12 -Notify NotifyServers -NotifyServers 192.168.10.12

# SRV-DNS02 – sekundäre Zone
Install-WindowsFeature DNS -IncludeManagementTools
Add-DnsServerSecondaryZone -Name "firma.local" -ZoneFile "firma.local.dns" -MasterServers 192.168.10.11
Start-DnsServerZoneTransfer -Name "firma.local" -FullTransfer
Get-DnsServerResourceRecord -ZoneName "firma.local"

# SRV-DNS01 – SOA-Seriennummer prüfen
Get-DnsServerResourceRecord -ZoneName "firma.local" -RRType Soa | Select-Object -ExpandProperty RecordData

# SRV-DNS01 – Reverse-Zone und PTR
Add-DnsServerPrimaryZone -NetworkID "192.168.10.0/24" -ZoneFile "10.168.192.in-addr.arpa.dns" -DynamicUpdate NonsecureAndSecure
Add-DnsServerResourceRecordPtr -ZoneName "10.168.192.in-addr.arpa" -Name "30" -PtrDomainName "srv-app01.firma.local"

# SRV-DNS03 + Delegierung auf SRV-DNS01
Add-DnsServerPrimaryZone -Name "niederlassung.firma.local" -ZoneFile "niederlassung.firma.local.dns"
Add-DnsServerResourceRecordA -ZoneName "niederlassung.firma.local" -Name "srv-nb01" -IPv4Address 192.168.10.50
Add-DnsServerZoneDelegation -Name "firma.local" -ChildZoneName "niederlassung" `
  -NameServer "srv-dns03.firma.local" -IPAddress 192.168.10.13      # auf SRV-DNS01

# SRV-DNS02 – Stubzone
Add-DnsServerStubZone -Name "niederlassung.firma.local" -ZoneFile "niederlassung.firma.local.dns" -MasterServers 192.168.10.13

# Weiterleitungen (beliebiger DNS-Server)
Add-DnsServerForwarder -IPAddress 9.9.9.9
Add-DnsServerConditionalForwarderZone -Name "partner.com" -MasterServers 10.0.0.5

# AD-integrierte Zone (auf einem DC)
Add-DnsServerPrimaryZone -Name "contoso.local" -ReplicationScope Forest

# Aufräumen aktivieren
Set-DnsServerScavenging -ScavengingState $true -ScavengingInterval 7.00:00:00 -ApplyOnAllZones

# CL-01 – Tests
Clear-DnsClientCache
Resolve-DnsName srv-app01.firma.local -Server 192.168.10.12
Resolve-DnsName 192.168.10.30
```

### DoH (Server 2025, Überblick)
```powershell
# Auf dem DNS-Server: Zertifikat an 443 binden, DoH aktivieren
netsh http add sslcert ipport=0.0.0.0:443 certhash=<Thumbprint> appid="{<GUID>}"
Set-DnsServerEncryptionProtocol -EnableDoh $true -UriTemplate "https://dns.contoso.local:443/dns-query"
Restart-Service DNS
# Auf dem Client: DoH-Server registrieren
Add-DnsClientDohServerAddress -ServerAddress 192.168.10.11 -DohTemplate "https://dns.contoso.local/dns-query" -AllowFallbackToUdp $false -AutoUpgrade $true
```

## Übungen
- A: Unterschied AXFR und IXFR anhand der SOA-Seriennummer | L: Seriennummer steigt bei jeder Änderung; Sekundärer vergleicht: gleich → kein Transfer; höher → IXFR (nur Änderungen seit seiner Nummer); keine Historie/neue Zone → AXFR (komplett)
- A: Welche Einträge entstehen durch die Delegierung in firma.local? | L: Ein NS-Eintrag für niederlassung → srv-dns03.firma.local und ein Glue-A-Eintrag srv-dns03 → 192.168.10.13; keine Hosts der Kindzone
- A: Weg der Anfrage srv-nb01.niederlassung.firma.local über SRV-DNS01 | L: SRV-DNS01 ist nicht autoritativ, findet den NS-Verweis in firma.local, fragt SRV-DNS03, erhält 192.168.10.50 und gibt es an CL-01 zurück
- A: Enthält die Stubzone srv-nb02? | L: Nein – Stubzonen enthalten nur SOA, NS und Glue-A
- A: Delegierung gelöscht, Stubzone bleibt – Ergebnis? | L: Über SRV-DNS01 NXDOMAIN; über SRV-DNS02 funktioniert es weiter (lokale Stubzone kennt SRV-DNS03)
- A: Zonenübertragung gesperrt – Beobachtung? | L: Transfer wird verweigert, neuer Eintrag fehlt auf SRV-DNS02, Ereignis-ID 6527
- A: Warum entstehen mit -CreatePtr vor Anlegen der Reverse-Zone keine PTR-Einträge? | L: Es existiert noch keine passende Reverse-Lookupzone

## Einfach

**Zonen** sind wie **Ordner im Telefonbuch-Archiv**. Jeder DNS-Server ist für bestimmte Ordner **zuständig**.

- **Primäre Zone** = das **Original** – nur hier darf man etwas eintragen oder ändern.
- **Sekundäre Zone** = eine **Fotokopie** auf einem zweiten Server. Fällt das Original aus, kann die Kopie trotzdem Auskunft geben. Ändern darf man die Kopie nicht.
- **AD-integrierte Zone** = das Telefonbuch liegt nicht in einer Datei, sondern im **Active Directory**. Jeder Domänencontroller hat eine Version, in die man schreiben darf, und die Änderungen verteilen sich automatisch. Das ist die beste Wahl in Firmen.

**Zonentransfer**: Die Kopie wird regelmäßig mit dem Original **abgeglichen**. Jede Ausgabe hat eine **Versionsnummer** (Seriennummer). Hat das Original eine höhere Nummer, holt sich die Kopie **nur die neuen Seiten** (IXFR). Braucht sie alles neu, holt sie das **ganze Buch** (AXFR). Mit **NOTIFY** ruft das Original sogar an: „Hey, es gibt was Neues!“

**Delegierung** ist wie in einer großen Firma: Die Zentrale sagt: „Für alles aus der **Niederlassung** frag bitte deren eigene Auskunft – die ist zuständig.“ Die Zentrale kennt nur die **Telefonnummer der Niederlassungs-Auskunft**, nicht deren Mitarbeiter. Ohne diesen Hinweis findet niemand die Niederlassung!

**Stubzone** ist ein **Notizzettel** an einem anderen Server: „Für die Niederlassung ist Server 3 zuständig.“ Der Zettel aktualisiert sich selbst, wenn sich die Zuständigkeit ändert. Er ist praktisch, aber nur für den Server, an dem er klebt.

**Aufräumen (Scavenging)**: Wie beim Telefonbuch alte Nummern von Leuten streichen, die längst weggezogen sind.

**DoH (neu in Server 2025)**: Normale DNS-Fragen gehen wie eine **Postkarte** durchs Netz – jeder kann mitlesen. DoH steckt sie in einen **verschlossenen Umschlag** (HTTPS).

## Merksatz
- **Primär = Original, Sekundär = Kopie, Stub = Notizzettel, AD-integriert = Multimaster**.
- **AXFR alles, IXFR nur Änderungen** – entscheidet die **SOA-Seriennummer**.
- Delegierung = **NS + Glue in der Elternzone**, Pflicht.
- Zonentransfer **nur an bekannte Server**.
- Reverse-Zone: Netzwerk-ID **rückwärts** + in-addr.arpa.

## Prüfungsfalle
- Stubzone ersetzt keine Delegierung.
- Sekundäre Zonen sind schreibgeschützt.
- „Nur sichere Updates“ gibt es nur bei AD-integrierten Zonen.
- Zonentransfer-Freigabe muss auch für die **Reverse-Zone** gesetzt werden.
- -CreatePtr/„PTR erstellen“ braucht eine existierende Reverse-Zone.

## Grafik
### Original und Kopie
Zwei Server mit Telefonbüchern; auf dem primären wird eine Seite ergänzt, die Seriennummer springt von 5 auf 6; NOTIFY-Glocke läutet beim sekundären; nur die neue Seite fliegt hinüber (IXFR). Knopf „Neue Sekundärzone“ zeigt einen AXFR mit dem ganzen Buch.

### Delegierung vs. Stubzone
Drei Server; Anfrage für niederlassung.firma.local läuft über den Elternserver per NS-Verweis zum Kindserver. Delegierung löschen: Pfad reißt ab (rot). Stubzone auf Server 2: dessen Pfad bleibt grün.

### Zonen-Arten
Vier Karten (Primär, Sekundär, Stub, AD-integriert) drehen sich beim Hover um und zeigen Inhalt, Schreibrecht, Replikation.

## Karteikarten
- F: Unterschied primäre und sekundäre Zone? | A: Primär: beschreibbares Original. Sekundär: schreibgeschützte Kopie per Zonentransfer.
- F: Was enthält eine Stubzone? | A: Nur SOA-, NS- und Glue-A-Einträge der Zielzone.
- F: Vorteil AD-integrierter Zonen? | A: Multimaster-Replikation über AD, sichere dynamische Updates, kein Zonentransfer nötig.
- F: Was ist ein IXFR? | A: Inkrementeller Zonentransfer – nur Änderungen seit der letzten Seriennummer.
- F: Wann erfolgt ein AXFR? | A: Bei neuer Sekundärzone oder wenn der Master keine Änderungshistorie liefern kann.
- F: Wozu dient DNS NOTIFY? | A: Master benachrichtigt Sekundärserver sofort über Änderungen.
- F: Welche Einträge erzeugt eine Delegierung? | A: NS-Eintrag und Glue-A-Eintrag in der Elternzone.
- F: Name der Reverse-Zone für 192.168.10.0/24? | A: 10.168.192.in-addr.arpa
- F: Was ist Scavenging? | A: Automatisches Aufräumen veralteter dynamischer DNS-Einträge.
- F: Was bewirkt DNSSEC? | A: Kryptografische Signatur von Zonen gegen Manipulation/Spoofing.
- F: Was ist DoH, welcher Port? | A: DNS over HTTPS – verschlüsselte DNS-Abfragen über TCP 443 (Server 2025).
- F: Ereignis-ID bei verweigerter Zonenübertragung? | A: 6527.
- F: Letzte Windows-Server-Version mit WINS? | A: Windows Server 2025.

## Quiz
? Welche Zone enthält nur SOA-, NS- und Glue-Einträge?
* Stubzone
- Sekundäre Zone
- Primäre Zone
- Reverse-Zone

? Die Delegierung für niederlassung.firma.local wird gelöscht. Was gilt für Clients, die nur den Elternserver fragen?
* Namen der Kindzone können nicht mehr aufgelöst werden
- Alles funktioniert weiter
- Die Kindzone wird automatisch zur sekundären Zone
- Der Elternserver fragt automatisch die Root-Server

? Wann überträgt ein sekundärer DNS-Server Daten per IXFR?
* Wenn die SOA-Seriennummer des Masters höher ist und Änderungsinformationen vorliegen
- Bei jeder Anfrage eines Clients
- Nur bei einem Neustart des Clients
- Wenn die TTL eines A-Eintrags abläuft

? Welche Einstellung für dynamische Updates ist nur bei AD-integrierten Zonen möglich?
* Nur sichere
- Keine
- Nicht sichere und sichere
- Nur nicht sichere

? Wie lautet die Reverse-Lookupzone für das Netz 172.16.5.0/24?
* 5.16.172.in-addr.arpa
- 172.16.5.in-addr.arpa
- 0.5.16.172.ip6.arpa
- 172.16.5.0.arpa

? Welcher Eintrag enthält die Seriennummer einer Zone?
* SOA
- NS
- MX
- CNAME
! Sekundäre Server erkennen an der Seriennummer, ob ein Zonentransfer nötig ist.

? Was ist eine bedingte Weiterleitung?
* Anfragen für eine bestimmte Domäne werden an einen festgelegten DNS-Server geschickt.
- Alle Anfragen gehen an den Provider.
- Anfragen werden nur bei Fehlern weitergeleitet.
- DNS-Antworten werden verschlüsselt.
! Typisch für Partnerdomänen oder Vertrauensstellungen.

? Wie heißt die vollständige Kopie einer Zone, die nur gelesen werden kann?
* Sekundäre Zone
- Stubzone
- Primäre Zone
- Reverse-Zone
! Sie wird per Zonentransfer (AXFR/IXFR) vom Master aktualisiert.
