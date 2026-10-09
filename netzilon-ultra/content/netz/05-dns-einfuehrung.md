---
id: netz-dns-einfuehrung
bereich: AZ-800
block: Netzwerk
kapitel: Netzwerkdienste
titel: DNS-Einführung – Namespace, rekursiv/iterativ, Stammhinweise, Weiterleitung, Cache, Round Robin, Zonentypen
stufe: Fortgeschritten
fach: Windows Server / AZ-800
pruefungen: [AZ-800, AP1, AP2, Schule]
quellen: [1-Folien-DNS-Einf_hrung.pdf, DNS_WindowsServer2025.pdf]
verweise: [ccna-dhcp-dns, netz-dns-uebung, netz-dns-delegierung-stub, netz-namensaufloesung-lokal]
---

## Profi

### Was ist DNS?
**DNS** (Domain Name System) ist eine **hierarchisch verteilte Datenbank** und Grundlage der Namensauflösung im Internet und in Active Directory (seit Windows 2000 der primäre Namensdienst). Es löste die zentrale, riesige **hosts-Datei** ab (Probleme: wachsende Hostzahl, Update-Verkehr, Verzögerung bei Aktualisierung). Delegierung: InterNIC/IANA → Registrare (z. B. DENIC für .de) → Unternehmen.
Entwicklung: Hosts-Datei → NetBIOS/WINS (Legacy, **Server 2025 ist die letzte Version mit WINS**) → DNS.

### Namespace und FQDN
Root `.` → TLD (.de, .com, .local) → Domäne → Host. **FQDN** = vollständiger Name, z. B. `srv01.contoso.local.` (der abschließende Punkt ist die Root).

### Komponenten
**DNS-Client** (Resolver), **DNS-Server** (bearbeitet Abfragen, hält eine oder mehrere **Zonen**), **Ressourceneinträge**: A (IPv4), AAAA (IPv6), CNAME (Alias), MX (Mail, Priorität), NS (Nameserver), PTR (Reverse), SOA (Zonenautorität, Seriennummer), SRV (Diensteort, z. B. DCs).

### Abfragetypen
- **Rekursiv**: Client erwartet die **vollständige Antwort**. Der gefragte Server ist für die komplette Auflösung verantwortlich (Antwort: Daten, „Typ nicht gefunden“ oder „Name nicht gefunden“).
- **Iterativ**: Server fragen untereinander; erwartet wird die **bestmögliche Antwort**: positiv, negativ oder **Verweis (Referral)** auf einen Server der nächsten Ebene (häufigster Antworttyp).
- **Autorisierender Server** (hat primäre/sekundäre Kopie) durchsucht Cache und Datenbank; bei fehlendem Eintrag ein „autorisierendes Nein“. Nicht autorisierender Server leitet an einen **Forwarder** weiter oder fragt über **Stammhinweise** die Root-Server.
**Beispiel iterativ (www.firma.com)**: Client → lokaler DNS (rekursiv) → Root (Verweis auf .com) → .com-Server (Verweis auf firma.com) → firma.com-Server (autorisierende Antwort) → lokaler DNS gibt an Client weiter.

### Stammhinweise und Weiterleitung
**Stammhinweise (Root Hints)**: Liste der Root-Server, Datei `%SystemRoot%\System32\dns\Cache.dns`. Zeigen sie auf lokale Server, werden Internetadressen i. d. R. nicht mehr aufgelöst.
**Weiterleitung (Forwarder)**: der lokale Server leitet rekursive Abfragen an einen anderen DNS-Server weiter, der iterativ auflöst. **Nicht exklusiver Modus**: bei negativer Antwort versucht der lokale Server selbst iterativ. **Exklusiver Modus** (Forwarder-only): negative Antwort geht an den Client. **Bedingte Weiterleitung**: nur Abfragen für einen bestimmten Namespace werden an einen bestimmten Server geleitet (z. B. `partner.com`).

### Cache und TTL
Antworten werden im Cache gehalten (**TTL** in Sekunden, vom abfragenden Server übernommen; bei Antwort aus dem Cache sinkende TTL). Negative Antworten werden ebenfalls gecacht (Standard ca. **5 min**). Niedrige TTL = mehr Konsistenz, mehr Verkehr. **Caching-only-Server**: keine Zonendaten, nur Stammhinweise/Forwarder, entlastet das Netz (Zustand nach Installation der Rolle).

### Round Robin
Mehrere A-Records zum gleichen Namen (z. B. `www.contoso.com 60 IN A 172.16.0.11 / .120 / .133`): der Server rotiert die Reihenfolge der Antwort → einfache **Lastverteilung** (ohne Gesundheitsprüfung!).

### Zonentypen
**Primär** (beschreibbar), **Sekundär** (schreibgeschützte Kopie per Zonentransfer), **Stub** (nur NS/SOA/Glue), **AD-integriert** (in AD gespeichert, Multi-Master-Replikation, sichere dynamische Updates – empfohlen). Forward-Lookup (Name → IP), Reverse-Lookup (IP → Name, `in-addr.arpa`).

### Neuerungen und Best Practices (Server 2025, laut Unterlage)
DNS over HTTPS (Port 443, TLS) zwischen Client und Server; WINS-Ende; **DNSSEC**, Zonentransfer einschränken, Scavenging, mindestens zwei DNS-Server, Monitoring (`Resolve-DnsName`, `nslookup`, Ereignisanzeige).

## Einfach

DNS ist das **Telefonbuch des Netzes**. Computer sprechen nur Zahlen (IP-Adressen), Menschen merken sich lieber Namen. Wenn du `www.beispiel.de` eintippst, fragt dein Computer im Telefonbuch nach der Nummer.

Aber es gibt nicht das *eine* Telefonbuch. Es gibt viele kleine, die sich gegenseitig kennen – wie eine **Auskunft mit Weiterverbinden**:
1. Dein Computer fragt **seine** Auskunft (den lokalen DNS-Server): „Wie ist die Nummer von www.beispiel.de?“ Das ist die **rekursive** Frage: „Kümmere dich bitte um alles und gib mir die fertige Antwort.“
2. Die lokale Auskunft kennt es nicht und fragt die **oberste Auskunft** (Root): „Wer kennt .de?“ – „Frag den .de-Server.“
3. Sie fragt den .de-Server: „Wer kennt beispiel.de?“ – „Frag diesen Server.“
4. Sie fragt den letzten: „Nummer von www.beispiel.de?“ – „93.184.216.34.“ Das sind die **iterativen** Fragen: Jeder sagt nur, wer weiter weiß.
5. Die lokale Auskunft gibt die Nummer an dich zurück und **merkt sie sich** eine Weile (Cache, TTL), damit die nächste Frage schneller geht.

Wenn die lokale Auskunft nicht selbst herumfragen soll, kann sie auch einen **Weiterleiter (Forwarder)** fragen, z. B. den Server vom Internetanbieter.

Bei **Round Robin** steht ein Name mit mehreren Nummern im Buch (drei Webserver). Jedes Mal wird die Reihenfolge gedreht – so verteilt sich die Arbeit.

## Merksatz
- **Rekursiv = „mach alles für mich“, iterativ = „sag mir, wer weiter weiß“.**
- **Stammhinweise = Root-Server-Liste, Forwarder = Weitergabe an anderen DNS.**
- **Cache + TTL beschleunigen, negative Antworten ~5 min.**
- **Primär schreibt, sekundär liest, Stub kennt nur NS, AD-integriert repliziert über AD.**
- **A/AAAA/CNAME/MX/NS/PTR/SOA/SRV.**

## Prüfungsfalle
- **Client → Server ist rekursiv**, **Server → Server (zu Root/TLD)** ist iterativ.
- **Stammhinweise auf lokale Server** verhindern die Auflösung von Internetnamen.
- **Exklusiver Forwarder**: kein eigener iterativer Versuch bei negativer Antwort.
- **Round Robin** prüft **nicht**, ob ein Server erreichbar ist.
- Die Server-2025-Unterlage nennt DoH „GA seit dem Update vom Juni 2026“ – das ist Herstellerstand; im Zweifel aktuelle Microsoft-Doku prüfen. DoH nutzt **TCP 443**, klassisches DNS **53 (UDP/TCP)**.
- **SOA-Seriennummer** steuert Zonentransfer, nicht der Zonenname.
- **WINS**: Windows Server 2025 ist die letzte Version mit WINS.

## Grafik
### Rekursive und iterative Auflösung
1. Client -> DNS-Server: www.firma.com? (rekursiv)
2. DNS-Server -> Root-Server: www.firma.com? (iterativ)
3. Root-Server -> DNS-Server: Verweis auf .com-Server
4. DNS-Server -> COM-Server: www.firma.com?
5. COM-Server -> DNS-Server: Verweis auf firma.com-Server
6. DNS-Server -> FIRMA-Server: www.firma.com?
7. FIRMA-Server -> DNS-Server: A 203.0.113.80 (autorisierend)
8. DNS-Server -> Client: 203.0.113.80 (jetzt im Cache, TTL)

### Weiterleitung
1. Client -> DNS-Server: www.firma.com? (rekursiv)
2. DNS-Server -> Forwarder: rekursive Weiterleitung
3. Forwarder -> DNS-Server: Antwort nach iterativer Auflösung
4. DNS-Server -> Client: Antwort

### Round Robin
1. Client1 -> DNS-Server: www.contoso.com?
2. DNS-Server -> Client1: .11, .120, .133
3. Client2 -> DNS-Server: www.contoso.com?
4. DNS-Server -> Client2: .120, .133, .11 (rotiert)

## Lab
**Heimlabor: DC01 (DNS-Server), Server-A, Win10-1 (Client)**

### GUI
1. **DC01**: Server-Manager → Rollen → DNS-Server; DNS-Manager (`dnsmgmt.msc`).
2. **DC01**: Rechtsklick Server → Eigenschaften → Weiterleitungen → 9.9.9.9 eintragen.
3. **DC01**: Rechtsklick Server → Eigenschaften → Stammhinweise ansehen.
4. **Win10-1**: `nslookup www.beispiel.de`, `ipconfig /displaydns`, `ipconfig /flushdns`.

### PowerShell
Auf **DC01**:
```
Install-WindowsFeature -Name DNS -IncludeManagementTools
Get-Service DNS
Add-DnsServerForwarder -IPAddress 9.9.9.9
Add-DnsServerConditionalForwarderZone -Name "partner.com" -MasterServers 10.0.0.5
Get-DnsServerCache
Clear-DnsServerCache -Force
```
Auf **Win10-1**:
```
Resolve-DnsName www.beispiel.de
Resolve-DnsName www.beispiel.de -Type AAAA
Clear-DnsClientCache
```
Round Robin testen: auf DC01 drei A-Einträge `www` mit unterschiedlichen IPs anlegen (`Add-DnsServerResourceRecordA -ZoneName exa.local -Name www -IPv4Address 192.168.1.11`) und mehrfach `nslookup www.exa.local` aufrufen.

## Befehle
- `nslookup name` – DNS-Abfrage
- `Resolve-DnsName name -Type MX` – PowerShell-Abfrage
- `ipconfig /displaydns` – Client-Cache
- `ipconfig /flushdns` – Client-Cache leeren
- `Add-DnsServerForwarder` – Forwarder
- `Clear-DnsServerCache` – Servercache leeren
- `dnsmgmt.msc` – DNS-Manager

## Übungen
- A: Beschreiben Sie rekursive und iterative Abfrage. | L: Rekursiv: Client erwartet fertige Antwort, Server löst vollständig auf. Iterativ: Server liefert bestmögliche Antwort/Verweis, Anfragender fragt weiter.
- A: Was sind Stammhinweise? | L: Liste der Root-Server (Cache.dns), Startpunkt der iterativen Auflösung.
- A: Unterschied exklusiver/nicht exklusiver Forwarder? | L: Exklusiv: negative Antwort wird an Client weitergegeben; nicht exklusiv: lokaler Server versucht danach iterativ.
- A: Wofür TTL und Negativ-Cache? | L: Gültigkeit im Cache; Negativ-Cache verhindert wiederholte Abfragen nicht existierender Namen (ca. 5 min).
- A: Welche Zonentypen kennt Windows DNS? | L: Primär, Sekundär, Stub, AD-integriert.
- A: Was ist ein Caching-only-Server? | L: DNS-Server ohne Zonendaten, nur Cache/Forwarder/Stammhinweise.
- A: Was macht Round Robin? | L: Rotiert mehrere A-Records zu einem Namen – einfache Lastverteilung.
- A: Welchen Port nutzt DoH? | L: TCP 443.

## Karteikarten
- F: DNS-Port? | A: 53 (UDP/TCP).
- F: Was ist ein FQDN? | A: Vollständiger Name inkl. Domäne, z. B. srv01.contoso.local.
- F: A-Record? | A: Name → IPv4-Adresse.
- F: PTR-Record? | A: IP → Name (Reverse-Lookup).
- F: SRV-Record? | A: Lokalisiert Dienste, z. B. Domänencontroller.
- F: SOA-Record? | A: Zonenautorität mit Seriennummer und Timern.
- F: Rekursive Abfrage? | A: Client erwartet vollständige Antwort.
- F: Iterative Abfrage? | A: Server antwortet mit bester Antwort oder Verweis.
- F: Bedingte Weiterleitung? | A: Nur ein bestimmter Namespace geht an einen bestimmten Server.
- F: AD-integrierte Zone? | A: In AD gespeichert, Multi-Master, sichere dynamische Updates.
- F: Wo liegen die Stammhinweise? | A: %SystemRoot%\System32\dns\Cache.dns

## Quiz
? Welche Abfrage stellt ein DNS-Client an seinen Server?
* Rekursiv
- Iterativ
- Inverse
- Broadcast
? Was liefert ein Server bei iterativer Abfrage häufig?
* Einen Verweis auf den nächsten Server
- Die Wiederholung der Frage
- Immer die IP
- Einen Broadcast
? Wofür dienen Stammhinweise?
* Zum Finden der Root-Server
- Zum Speichern von Passwörtern
- Zum Verteilen von Leases
- Zum Verschlüsseln
? Was bewirkt ein exklusiver Forwarder?
* Keine eigene iterative Auflösung bei negativer Antwort
- Immer lokale Auflösung zuerst
- Zonentransfer
- DNSSEC
? Welcher Record bildet einen Alias?
* CNAME
- PTR
- SOA
- NS
? Welche Zone enthält nur NS, SOA und Glue?
* Stub-Zone
- Primäre Zone
- Sekundäre Zone
- AD-integrierte Zone
? Was bewirkt Round Robin?
* Rotierende Reihenfolge mehrerer A-Records
- Verschlüsselung der Antworten
- Zonentransfer
- Dynamische Updates
? Wofür steht TTL?
* Time to Live – Gültigkeit im Cache
- Total Transfer Limit
- Trusted Transport Layer
- Transfer Time Log
? Welche Version ist die letzte mit WINS-Unterstützung (laut Unterlage)?
* Windows Server 2025
- Windows Server 2012
- Windows Server 2019
- Windows Server 2022
