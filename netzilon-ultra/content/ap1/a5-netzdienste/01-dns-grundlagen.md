---
id: ap1-a5-dns
bereich: AP1
block: A5
kapitel: Netzdienste
titel: DNS – Grundlagen der Namensauflösung
stufe: Einsteiger
quellen: [1-Folien-DNS-Einführung.pdf, DNS_WindowsServer2025.pdf]
verweise: [ap1-a5-dns-zonen, ap1-a5-namensaufloesung, ap1-a5-dhcp, ap1-a4-netzwerkgrundlagen, az800-dns]
---

## Profi

### Was ist DNS?
Das **Domain Name System** ist eine **hierarchisch verteilte Datenbank**, die **Namen in IP-Adressen** (Forward Lookup) und **IP-Adressen in Namen** (Reverse Lookup) übersetzt. Es ist die Grundlage der Namensauflösung **im Internet** und in **Active Directory** (Clients finden Domänencontroller über DNS-SRV-Einträge). Seit Windows 2000 ist DNS der primäre Namensdienst in Windows-Netzen.

DNS wurde entworfen, um die Probleme der zentralen **Hosts-Datei** zu lösen: wachsende Zahl von Hosts, riesige Datei, hoher Datenverkehr für Aktualisierungen, lange Verzögerung bis Änderungen überall ankommen. Die Verantwortung für Namensbereiche wird **delegiert**: ICANN/IANA → TLD-Betreiber (z. B. **DENIC** für .de) → Domäneninhaber.

**Entwicklung**: Hosts-Datei (statisch, nicht skalierbar) → NetBIOS/WINS (Legacy, wird abgekündigt) → **DNS** (Standard, skalierbar, AD-integriert).

### Namensraum und Hierarchie
| Ebene | Beispiel |
|---|---|
| **Stamm (Root)** | „.“ (13 logische Root-Server-Adressen, weltweit per Anycast verteilt) |
| **Top-Level-Domain (TLD)** | .com, .de, .org, .local |
| **Second-Level-Domain** | firma.com, contoso.local |
| **Subdomain** | support.firma.com |
| **Host** | fileserver |

**FQDN** (Fully Qualified Domain Name): vollständiger Name bis zum Stamm, z. B. `fileserver.support.firma.com.` – der **Punkt am Ende** steht für den Root (meist weggelassen). Max. 253 Zeichen, je Label 63.

### Komponenten
- **DNS-Client (Resolver)**: Dienst auf jedem Rechner, der Anfragen stellt (Windows: Dienst „DNS-Client“, Cache per `ipconfig /displaydns`).
- **DNS-Server**: beantwortet Anfragen, hält Daten für eine oder mehrere **Zonen**.
- **Ressourceneinträge (Resource Records)**: die Einträge der Datenbank.

### Ressourceneinträge
| Typ | Name | Zweck |
|---|---|---|
| **A** | Host (IPv4) | Name → IPv4-Adresse |
| **AAAA** | Host (IPv6) | Name → IPv6-Adresse |
| **CNAME** | Alias | Name → anderer (kanonischer) Name, z. B. www → srv-web01 |
| **MX** | Mail Exchanger | Mailserver der Domäne, mit **Priorität** (kleiner = bevorzugt) |
| **PTR** | Pointer | **Reverse Lookup**: IP → Name (in in-addr.arpa/ip6.arpa) |
| **NS** | Nameserver | autoritative Server einer Zone (auch für Delegierungen) |
| **SOA** | Start of Authority | Erster Eintrag jeder Zone: primärer Server, verantwortliche Person, **Seriennummer**, Refresh, Retry, Expire, Minimum-TTL |
| **SRV** | Service | Dienste finden, z. B. `_ldap._tcp.dc._msdcs.contoso.local` → Domänencontroller |
| TXT | Text | beliebiger Text: SPF, DKIM, Domain-Verifizierung |
| CAA | Certification Authority Authorization | welche CA Zertifikate ausstellen darf |

### Abfragearten
**Rekursive Abfrage**: Der Anfragende erwartet eine **vollständige Antwort**. Der befragte Server ist verantwortlich, den Namen komplett aufzulösen. Antworten: Daten gefunden · Daten dieses Typs nicht vorhanden · Name nicht gefunden (**NXDOMAIN**). Clients stellen fast immer rekursive Abfragen; auch Server bei **Weiterleitungen**.

**Iterative Abfrage**: Der Anfragende erwartet die **bestmögliche Antwort** – positiv, negativ oder (am häufigsten) ein **Verweis** auf einen Server der nächstniedrigeren Ebene. Wird von **DNS-Servern** untereinander genutzt und benötigt die **Stammhinweise**.

**Ablauf www.firma.com** (Client → lokaler DNS-Server):
1. Client sendet **rekursive** Abfrage an den lokalen DNS-Server.
2. Lokaler Server prüft **Cache** und eigene Zonen.
3. Nicht vorhanden → **iterative** Abfrage an einen **Root-Server** → Verweis auf die .com-Server.
4. Iterative Abfrage an einen **.com-Server** → Verweis auf die firma.com-Server.
5. Iterative Abfrage an den **autoritativen Server von firma.com** → **autoritative Antwort** 217.15.200.112.
6. Lokaler Server **cacht** das Ergebnis und gibt es an den Client weiter.

**Autoritativer Server**: besitzt eine primäre oder sekundäre Kopie der Zone. Findet er keinen Eintrag, antwortet er mit einem **„autoritativen Nein“**. Ist ein Server nicht autoritativ, leitet er weiter (**Forwarder**) oder befragt die Root-Server über die **Stammhinweise**.

### Stammhinweise (Root Hints)
Liste der Root-Server, gespeichert in `%SystemRoot%\System32\dns\Cache.dns`. Die Root-Server kennen die Nameserver aller TLDs. Man kann Stammhinweise auch auf **interne Server** zeigen lassen – dann werden Internetnamen allerdings nicht mehr aufgelöst.

### Weiterleitung (Forwarding)
Der lokale DNS-Server leitet Anfragen, die er nicht selbst beantworten kann, **rekursiv an einen anderen DNS-Server** (z. B. Provider, 9.9.9.9) weiter; dieser löst iterativ auf und liefert die Antwort zurück.
- **Nicht exklusiver Modus**: Bei negativer Antwort/Ausfall der Weiterleitung versucht der Server selbst per Stammhinweisen aufzulösen (Standard).
- **Exklusiver Modus**: Die Antwort der Weiterleitung wird ohne eigenen Versuch an den Client gegeben (Option „Keine Rekursion“ bzw. Stammhinweise nicht verwenden).
- **Bedingte Weiterleitung**: Nur Anfragen für einen **bestimmten Namespace** (z. B. partner.com) gehen an bestimmte Server – typisch zwischen Gesamtstrukturen/Partnerfirmen.

### Zwischenspeicherung (Caching)
- DNS-Server und Clients speichern Antworten im **Cache** → kürzere Antwortzeiten, weniger Netzlast.
- Jeder Eintrag hat eine **TTL** (Time to Live, in Sekunden), die vom autoritativen Server stammt; beim Ausliefern aus dem Cache wird die **Rest-TTL** übertragen.
- **Niedrige TTL** = aktuellere Daten, aber mehr Verkehr; **hohe TTL** = weniger Verkehr, Änderungen dauern länger (vor Umzügen TTL vorher senken!).
- Auch **negative Antworten** werden zwischengespeichert (typisch einige Minuten) – weitere Anfragen für diesen Namen unterbleiben so lange.
- **Caching-only-Server**: enthält **keine Zonen**, nur Stammhinweise und/oder Weiterleitungen; reduziert WAN-Last in Außenstellen, leicht zu warten. Ein frisch installierter DNS-Server ist zunächst ein Caching-only-Server.

### DNS-Roundrobin
Mehrere **A-Einträge mit demselben Namen** (z. B. www.contoso.com → 172.16.0.11, .120, .133). Der Server **rotiert die Reihenfolge** bei jeder Antwort; Clients nehmen meist die erste Adresse → **einfache Lastverteilung**. Nachteil: keine Ausfallerkennung (ein toter Server bekommt weiter Anfragen) – echte Lastverteilung per Load Balancer.

### Ports
DNS nutzt **UDP 53** für normale Abfragen, **TCP 53** für Zonentransfers und große Antworten; **DoH** (DNS over HTTPS) Port 443, DoT 853.

## Befehle
- `nslookup www.contoso.com` / `nslookup www.contoso.com 192.168.10.11` – Abfrage (gezielt an einen Server)
- `nslookup -type=MX contoso.com` – bestimmten Typ abfragen
- `Resolve-DnsName www.contoso.com -Type AAAA -Server 192.168.10.11`
- `ipconfig /displaydns` / `ipconfig /flushdns` – Client-Cache anzeigen/leeren (`Clear-DnsClientCache`)
- `ipconfig /registerdns` – eigenen Eintrag neu registrieren
- `Get-DnsServerCache` / `Clear-DnsServerCache` – Server-Cache

## Einfach

DNS ist das **Telefonbuch des Internets**. Menschen merken sich Namen („www.google.de“), Computer brauchen aber Nummern (IP-Adressen). DNS schlägt nach: „Welche Nummer gehört zu diesem Namen?“

Früher hatte jeder Computer ein **eigenes kleines Telefonbuch** (die Hosts-Datei). Bei Millionen Computern ging das nicht mehr – jedes Buch hätte ständig neu gedruckt werden müssen. Deshalb gibt es jetzt ein **riesiges, verteiltes Telefonbuch**: Niemand hat alles, aber jeder weiß, **wen man fragen muss**.

**Wie ein Name aufgebaut ist** – von hinten gelesen wie eine Adresse:
`fileserver.support.firma.com.`
- `.` = die ganze Welt (Root)
- `com` = das Land
- `firma` = die Stadt
- `support` = der Stadtteil
- `fileserver` = das Haus

**So findet dein PC eine Webseite**:
1. Dein PC fragt seinen DNS-Server: „**Sag mir bitte die komplette Antwort** für www.firma.com!“ (rekursiv – „mach du mal“).
2. Der DNS-Server weiß es nicht und fragt die **Weltauskunft** (Root): „Wer kennt .com?“ – „Frag den da.“
3. Er fragt den **.com-Auskunftsdienst**: „Wer kennt firma.com?“ – „Frag den da.“
4. Er fragt den **Server von firma.com**: „www?“ – „217.15.200.112!“
5. Er gibt dir die Antwort und **merkt sich** sie eine Weile (Cache), damit es beim nächsten Mal schneller geht.
Die Fragen in Schritt 2–4 heißen **iterativ** – man bekommt nur einen Tipp, wo man weitersuchen soll.

**Einträge** sind verschiedene Arten von Telefonbuchzeilen:
- **A** = „Name → Nummer“
- **CNAME** = „Spitzname → richtiger Name“ (www ist der Spitzname von srv-web01)
- **MX** = „Hier wohnt die Post (E-Mail) für diese Firma“
- **PTR** = rückwärts: „Nummer → Name“

**TTL** ist das **Haltbarkeitsdatum** eines gemerkten Eintrags. Ist es abgelaufen, wird neu gefragt.

**Roundrobin** ist wie eine **Supermarktkasse mit drei Kassierern**: Jeder Kunde wird abwechselnd zu einem anderen geschickt.

## Merksatz
- **A = Adresse, AAAA = IPv6, PTR = rückwärts, MX = Mail, SOA = Chef der Zone, SRV = Dienst**.
- Client fragt **rekursiv**, Server fragen **iterativ**.
- Stammhinweise = **Cache.dns**.
- TTL = **Haltbarkeitsdatum**.
- DNS = **UDP 53** (Zonentransfer **TCP 53**).

## Prüfungsfalle
- Rekursiv (vollständige Antwort) und iterativ (Verweis) vertauscht.
- CNAME darf nicht auf einer IP-Adresse enden, sondern auf einem Namen.
- MX: **niedrigere** Präferenz = höhere Priorität.
- Negative Antworten werden ebenfalls gecacht → nach dem Anlegen eines Eintrags `ipconfig /flushdns`.
- Bedingte Weiterleitung ≠ Delegierung ≠ Stubzone.

## Grafik
### Die Reise einer DNS-Anfrage
Weltkarte mit Client, lokalem DNS-Server, Root-, .com- und firma.com-Server. Blaue gestrichelte Pfeile (rekursiv) zwischen Client und lokalem Server, rote Pfeile (iterativ) zu Root/TLD/autoritativ mit Sprechblasen „Frag den da“. Am Ende füllt sich ein Cache-Kästchen mit einer ablaufenden TTL-Uhr.

### Namensbaum
Umgedrehter Baum: Root oben, TLDs, Domänen, Subdomänen, Hosts; Klick auf einen Host baut den FQDN von unten nach oben zusammen.

### Weiterleitung vs. Stammhinweise
Zwei Wege nebeneinander: lokaler Server fragt selbst iterativ vs. übergibt an Forwarder; Umschalter exklusiv/nicht exklusiv zeigt, was bei einer negativen Antwort passiert.

### Roundrobin
Drei Webserver, Anfragen von Clients werden reihum verteilt; die Antwortliste rotiert sichtbar.

## Karteikarten
- F: Wofür steht DNS? | A: Domain Name System – hierarchisch verteilte Datenbank zur Namensauflösung.
- F: Was ist ein FQDN? | A: Fully Qualified Domain Name – vollständiger Name bis zum Stamm, z. B. srv01.contoso.local.
- F: Unterschied rekursive und iterative Abfrage? | A: Rekursiv: vollständige Antwort wird erwartet. Iterativ: bestmögliche Antwort, meist Verweis auf anderen Server.
- F: Wo liegen die Stammhinweise unter Windows? | A: %SystemRoot%\System32\dns\Cache.dns
- F: Was ist ein A-Record? | A: Zuordnung Hostname → IPv4-Adresse.
- F: Was ist ein PTR-Record? | A: Reverse Lookup: IP-Adresse → Hostname.
- F: Wofür braucht AD SRV-Records? | A: Clients finden damit Dienste wie Domänencontroller (LDAP, Kerberos).
- F: Was steht im SOA-Record? | A: Primärer Server, Verantwortlicher, Seriennummer, Refresh, Retry, Expire, Minimum-TTL.
- F: Was ist ein Caching-only-Server? | A: DNS-Server ohne Zonen, nur mit Cache, Stammhinweisen/Weiterleitungen.
- F: Was ist eine bedingte Weiterleitung? | A: Weiterleitung nur für einen bestimmten Namespace an festgelegte Server.
- F: Exklusiver vs. nicht exklusiver Weiterleitungsmodus? | A: Nicht exklusiv: bei negativer Antwort eigene iterative Auflösung. Exklusiv: Antwort des Forwarders geht direkt an den Client.
- F: Was ist DNS-Roundrobin? | A: Mehrere A-Records gleichen Namens werden rotierend ausgeliefert → einfache Lastverteilung.
- F: Was bewirkt eine niedrige TTL? | A: Aktuellere Einträge, aber mehr Abfrageverkehr.

## Quiz
? Welcher Eintragstyp ordnet einer IPv6-Adresse einen Namen zu (Forward Lookup)?
* AAAA
- A
- PTR
- CNAME

? Welche Abfrageart stellt ein Client normalerweise an seinen DNS-Server?
* Rekursiv
- Iterativ
- Inverse
- Zonentransfer

? Welcher Server gibt ein „autoritatives Nein“ zurück?
* Ein Server, der eine Kopie der Zone besitzt und den Eintrag nicht findet
- Ein Caching-only-Server
- Ein Root-Server bei jeder Anfrage
- Der DNS-Client

? Wofür wird DNS-Roundrobin eingesetzt?
* Einfache Lastverteilung auf mehrere Server
- Verschlüsselung von DNS-Anfragen
- Replikation von Zonen
- Löschen veralteter Einträge

? Ein MX-Eintrag hat Priorität 10, ein anderer 20. Welcher Mailserver wird bevorzugt?
* Der mit Priorität 10
- Der mit Priorität 20
- Beide abwechselnd
- Keiner, MX hat keine Priorität

? Welcher Port wird für DNS-Abfragen standardmäßig verwendet?
* 53 (UDP, bei großen Antworten/Zonentransfer TCP)
- 67
- 80
- 389
! DNS over HTTPS nutzt dagegen 443.

? Welcher Eintrag verweist als Alias auf einen anderen Namen?
* CNAME
- A
- PTR
- SOA
! Beispiel: www → webserver01.example.com.

? Was bestimmt die TTL eines DNS-Eintrags?
* Wie lange der Eintrag in Caches gespeichert werden darf
- Wie viele Hops die Anfrage zurücklegt
- Die Priorität des Mailservers
- Die Größe der Zone
! Vor einem IP-Umzug TTL verkürzen.
