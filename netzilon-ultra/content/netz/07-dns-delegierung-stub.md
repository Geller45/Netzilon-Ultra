---
id: netz-dns-delegierung-stub
bereich: AZ-800
block: Netzwerk
kapitel: Netzwerkdienste
titel: DNS-Übung Teil 2 – Zonendelegierung und Stub-Zone (Windows Server 2025)
stufe: Fortgeschritten
fach: Windows Server / AZ-800
pruefungen: [AZ-800, AP2, Schule]
quellen: [DNS_Uebung_Win2025_2.pdf]
verweise: [netz-dns-uebung, netz-dns-einfuehrung, netz-namensaufloesung-lokal]
---

## Profi

### Ausgangslage
Aufbauend auf Übungsreihe 1 (Zone `firma.local` primär auf SRV-DNS01 192.168.10.11, sekundär auf SRV-DNS02 192.168.10.12). Neu: **SRV-DNS03** 192.168.10.13 für die Niederlassung mit eigener primärer Zone `niederlassung.firma.local` (srv-nb01 → .50, srv-nb02 → .51). Testclient CL-01 (192.168.10.20, DNS = SRV-DNS01).

### Delegierung vs. Stub-Zone
| Kriterium | Zonendelegierung | Stub-Zone |
|---|---|---|
| Wo konfiguriert? | In der **übergeordneten Zone** (firma.local) auf deren autoritativem Server | Als eigene Zone auf **jedem beliebigen** DNS-Server |
| Zweck | **Autorität** für einen Teilbereich an einen anderen Server abgeben | Lokal aktuelle NS-Informationen einer fremden Zone vorhalten |
| Gespeicherte Daten | NS- und **Glue-A**-Einträge in der Elternzone | Nur **SOA, NS, Glue-A** der Zielzone – keine A/CNAME/MX |
| Autoritativ? | Der delegierte Server: ja für den Teilbereich | Nein – bleibt für die Zone nicht autoritativ |
| Zwingend? | Ja, sonst ist der Unterbereich über die Elternzone nicht erreichbar | Nein, optionale Optimierung |

### Lösungen
**16 – SRV-DNS03 vorbereiten (PowerShell):** `Install-WindowsFeature -Name DNS -IncludeManagementTools`; `Add-DnsServerPrimaryZone -Name "niederlassung.firma.local" -ZoneFile "niederlassung.firma.local.dns" -DynamicUpdate NonsecureAndSecure`; A-Einträge für srv-nb01 (.50) und srv-nb02 (.51).
**17 – Delegierung (SRV-DNS01):** GUI: DNS-Manager → Zone firma.local → Rechtsklick → **Neue Delegierung…** → Name „niederlassung“ → Nameserver `srv-dns03.firma.local`, IP 192.168.10.13. PowerShell: `Add-DnsServerZoneDelegation -Name "firma.local" -ChildZoneName "niederlassung" -NameServer "srv-dns03.firma.local" -IPAddress 192.168.10.13`. Der Assistent braucht einen auflösbaren Nameserver-Namen für den Glue-Eintrag, sonst die IP manuell eintragen.
**18 – Kontrolle:** `Get-DnsServerResourceRecord -ZoneName "firma.local" -RRType Ns` – ein **NS-Eintrag** für `niederlassung` → srv-dns03 plus ein **Glue-A-Eintrag** srv-dns03 → .13. Die Hosts der Kindzone sieht die Elternzone **nicht**.
**19 – Test:** auf CL-01 `Clear-DnsClientCache; Resolve-DnsName srv-nb01.niederlassung.firma.local`. Ablauf: CL-01 → SRV-DNS01 (nicht autoritativ, findet NS-Delegierung) → fragt im Auftrag des Clients SRV-DNS03 → autoritative Antwort .50 → zurück an CL-01; für den Client transparent.
**20 – Stub-Zone (SRV-DNS02):** GUI: Forward-Lookupzonen → Neue Zone → **Stubzone** → nicht in AD speichern → Name `niederlassung.firma.local` → Master 192.168.10.13. PowerShell: `Add-DnsServerStubZone -Name "niederlassung.firma.local" -ZoneFile "niederlassung.firma.local.dns" -MasterServers 192.168.10.13`.
**21 – Inhalt:** nur **SOA, NS, Glue-A**; **srv-nb02 fehlt** (eine Stub-Zone überträgt keine A/CNAME/MX).
**22 – Aktualisierung:** auf SRV-DNS03 zweiten NS-Eintrag (`Add-DnsServerResourceRecord -ZoneName "niederlassung.firma.local" -NS -Name "." -NameServer "srv-dns02.firma.local"`); auf SRV-DNS02 Stub-Zone aktualisieren („Vom Master übertragen“); der neue NS erscheint.
**23 – Test über Stub:** `Set-DnsClientServerAddress -InterfaceAlias "Ethernet" -ServerAddresses 192.168.10.12`, `Resolve-DnsName srv-nb01.niederlassung.firma.local`, danach zurück auf .11. SRV-DNS02 kennt SRV-DNS03 direkt (ohne Root Hints/Forwarder).
**24 – Vergleich:** `Remove-DnsServerZoneDelegation -Name "firma.local" -ChildZoneName "niederlassung"`. Resolver SRV-DNS01 → **Fehler** (kein Wissen über den Unterbereich); Resolver SRV-DNS02 → **funktioniert** (Stub-Zone). Eine Stub-Zone ist eine **lokale** Optimierung und ersetzt keine Delegierung in der Elternzone.
**25 – Aufräumen:** Delegierung wiederherstellen (`Add-DnsServerZoneDelegation …`), zweiten NS entfernen (`Remove-DnsServerResourceRecord -ZoneName "niederlassung.firma.local" -RRType Ns -Name "." -RecordData "srv-dns02.firma.local." -Force`), Zonen aller drei Server prüfen (`Get-DnsServerZone -ComputerName …`).

## Einfach

Stell dir vor, die Firma hat ein großes Telefonbuch für den Hauptsitz (`firma.local`). In der Niederlassung sitzt ein eigener Verwalter mit einem eigenen kleinen Telefonbuch (`niederlassung.firma.local`).

**Delegierung** ist, wenn der Chef im Hauptbuch hinten einen Hinweis einträgt: „Für alles, was mit *niederlassung* endet, ruf bitte Verwalter 3 an, hier ist seine Nummer.“ Das Hauptbuch enthält nicht die Namen der Niederlassung, nur den **Wegweiser** (NS-Eintrag) und die **Nummer des Verwalters** (Glue-Eintrag – damit man den Verwalter überhaupt anrufen kann, ohne erst im Niederlassungsbuch nachzuschlagen!). Ohne diesen Hinweis findet niemand die Niederlassung.

Eine **Stub-Zone** ist dagegen ein **Merkzettel** für einen anderen Server: „Zuständig für die Niederlassung ist Verwalter 3 – (und falls sich das ändert, aktualisiere ich den Zettel).“ Auf dem Merkzettel steht nicht, wer in der Niederlassung arbeitet. Er hilft nur, schneller zum richtigen Verwalter zu kommen. Den Zettel hat nur der Server, der ihn sich angelegt hat – andere wissen davon nichts.

Das Experiment zum Schluss zeigt den Unterschied: Wenn du den Wegweiser aus dem Hauptbuch streichst, findet der Hauptserver die Niederlassung nicht mehr. Der zweite Server mit dem Merkzettel findet sie weiterhin.

## Merksatz
- **Delegierung = Autorität abgeben (NS + Glue in der Elternzone).**
- **Stub-Zone = lokaler Merkzettel (SOA, NS, Glue), nicht autoritativ.**
- **Delegierung zwingend, Stub optional.**
- **Stub enthält keine A/CNAME/MX.**

## Prüfungsfalle
- Delegierung wird in der **Elternzone** angelegt, nicht auf dem Kindserver.
- Der **Glue-A-Eintrag** fehlt → Zirkelbezug bei der Auflösung des Nameservers im Kindbereich.
- Stub-Zone ≠ Sekundärzone: Stub kopiert **nicht** die Hosts.
- Stub-Zone hilft nur dem **eigenen** Server – andere Server haben dadurch keine Delegierung.
- Nach Entfernen der Delegierung funktioniert die Auflösung über Server **ohne** Stub **nicht** mehr.
- Die Eltern-Zone zeigt nach der Delegierung **keine** Hosts der Kindzone.

## Grafik
### Delegierung
1. CL-01 -> SRV-DNS01: srv-nb01.niederlassung.firma.local?
2. SRV-DNS01: Nicht autoritativ, findet NS-Delegierung für niederlassung
3. SRV-DNS01 -> SRV-DNS03: Weiterleitung der Abfrage
4. SRV-DNS03 -> SRV-DNS01: A 192.168.10.50 (autoritativ)
5. SRV-DNS01 -> CL-01: 192.168.10.50

### Stub-Zone
1. SRV-DNS02 -> SRV-DNS03: Stub-Zone-Update (SOA, NS, Glue)
2. SRV-DNS03 -> SRV-DNS02: aktuelle NS-Liste
3. CL-01 -> SRV-DNS02: srv-nb01.niederlassung.firma.local?
4. SRV-DNS02 -> SRV-DNS03: direkte Abfrage (laut Stub)
5. SRV-DNS03 -> SRV-DNS02: 192.168.10.50

## Lab
**Maschinen: SRV-DNS01, SRV-DNS02, SRV-DNS03, CL-01**

### GUI
1. **SRV-DNS03**: Rolle DNS, neue primäre Zone `niederlassung.firma.local`, Hosts srv-nb01/02.
2. **SRV-DNS01**: Zone `firma.local` → Neue Delegierung → niederlassung → srv-dns03.firma.local / 192.168.10.13.
3. **SRV-DNS02**: Forward-Lookupzonen → Neue Zone → Stubzone → Master 192.168.10.13.
4. **CL-01**: `nslookup srv-nb01.niederlassung.firma.local`.

### PowerShell
Auf **SRV-DNS01**:
```
Add-DnsServerZoneDelegation -Name "firma.local" -ChildZoneName "niederlassung" -NameServer "srv-dns03.firma.local" -IPAddress 192.168.10.13
Get-DnsServerResourceRecord -ZoneName "firma.local" -RRType Ns
Remove-DnsServerZoneDelegation -Name "firma.local" -ChildZoneName "niederlassung"
```
Auf **SRV-DNS02**:
```
Add-DnsServerStubZone -Name "niederlassung.firma.local" -ZoneFile "niederlassung.firma.local.dns" -MasterServers 192.168.10.13
Get-DnsServerResourceRecord -ZoneName "niederlassung.firma.local" -ComputerName SRV-DNS02
```
Auf **CL-01**:
```
Clear-DnsClientCache
Resolve-DnsName srv-nb01.niederlassung.firma.local
```

## Befehle
- `Add-DnsServerZoneDelegation` – Delegierung anlegen
- `Remove-DnsServerZoneDelegation` – Delegierung löschen
- `Add-DnsServerStubZone` – Stub-Zone
- `Get-DnsServerResourceRecord -RRType Ns` – NS-Einträge
- `Clear-DnsClientCache` – Clientcache leeren

## Übungen
- A: Welche Einträge entstehen durch eine Delegierung in der Elternzone? | L: Ein NS-Eintrag für den Unterbereich plus ein Glue-A-Eintrag des Nameservers.
- A: Welche Einträge enthält eine Stub-Zone? | L: SOA, NS, Glue-A der Zielzone; keine A/CNAME/MX.
- A: Warum fehlt srv-nb02 in der Stub-Zone? | L: Stub-Zonen übertragen nur NS-Informationen, keine Hosteinträge.
- A: Beschreiben Sie den Weg der Abfrage bei Delegierung. | L: Client → SRV-DNS01 → (NS-Delegierung) → SRV-DNS03 → Antwort → SRV-DNS01 → Client.
- A: Was passiert nach Entfernen der Delegierung auf SRV-DNS01? | L: Auflösung über SRV-DNS01 scheitert, über SRV-DNS02 (Stub-Zone) funktioniert weiter.
- A: Wann braucht man eine Stub-Zone? | L: Um zuständige NS einer fremden Zone aktuell zu halten, ohne sie zu spiegeln.

## Karteikarten
- F: Was ist Delegierung im DNS? | A: Abgabe der Autorität für einen Teilnamensraum an einen anderen Server.
- F: Was ist ein Glue-Eintrag? | A: A-Eintrag des Nameservers in der Elternzone, damit er erreichbar ist.
- F: Was ist eine Stub-Zone? | A: Zone mit nur SOA, NS und Glue einer fremden Zone.
- F: Ist ein Stub-Server autoritativ? | A: Nein.
- F: Delegierung zwingend? | A: Ja, für den Unterbereich.
- F: Stub zwingend? | A: Nein, Optimierung.
- F: Cmdlet für Delegierung? | A: Add-DnsServerZoneDelegation
- F: Cmdlet für Stub-Zone? | A: Add-DnsServerStubZone
- F: Wo wird die Delegierung konfiguriert? | A: In der Elternzone.
- F: Zeigt die Elternzone Hosts der Kindzone? | A: Nein.

## Quiz
? Wo konfiguriert man eine Zonendelegierung?
* In der übergeordneten Zone
- In der Kindzone
- Auf dem Client
- Im DHCP-Server
? Was enthält eine Stub-Zone?
* SOA, NS und Glue-A
- Alle Hosteinträge
- Nur PTR
- Nur MX
? Ist ein Server mit Stub-Zone autoritativ?
* Nein
- Ja
- Nur für NS
- Nur im Notfall
? Wozu dient der Glue-Eintrag?
* Er macht den Nameserver des Unterbereichs erreichbar
- Er verschlüsselt die Zone
- Er löscht den Cache
- Er ersetzt PTR
? Was geschieht, wenn die Delegierung entfernt wird?
* Der Elternserver kann den Unterbereich nicht mehr auflösen
- Alles funktioniert weiter
- Die Stub-Zone wird gelöscht
- Die Zone wird sekundär
? Warum ist die Delegierung erforderlich?
* Sonst ist der Unterbereich über die Elternzone nicht erreichbar
- Sie beschleunigt nur
- Sie ist für DNSSEC nötig
- Sie ersetzt den Forwarder
? Welche Zone ersetzt eine Delegierung?
* Keine, Stub ist nur eine Optimierung
- Stub-Zone
- Sekundärzone
- Reverse-Zone
? Welches Cmdlet legt eine Stub-Zone an?
* Add-DnsServerStubZone
- Add-DnsServerForwarder
- Add-DnsServerDelegation
- New-DnsStub
? Was sieht die Elternzone nach der Delegierung von der Kindzone?
* Nur NS- und Glue-Einträge
- Alle Hosts
- Alle PTR
- Nichts, auch keinen NS
