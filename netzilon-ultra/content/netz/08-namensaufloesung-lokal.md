---
id: netz-namensaufloesung-lokal
bereich: AZ-800
block: Netzwerk
kapitel: Netzwerkdienste
titel: Lokale Namensauflösung – mDNS, LLMNR, NetBIOS-NS, WINS-Ende, DoH, Poisoning
stufe: Fortgeschritten
fach: Windows Server / AZ-800
pruefungen: [AZ-800, AZ-801, Schule]
quellen: [Namensaufl_sung_WindowsServer2025.pdf, DNS_WindowsServer2025.pdf]
verweise: [netz-dns-einfuehrung, netz-dns-uebung, ccna-dhcp-dns, ccna-security-grundlagen]
---

## Profi

### Warum lokale Verfahren?
DNS deckt nicht jeden Fall ab: Drucker, IoT-Geräte, ein neu angeschlossener Laptop müssen sich im selben **Netzsegment (Link)** finden, auch ohne Server. Alle drei Verfahren sind **serverlos** und arbeiten per **Multicast bzw. Broadcast**; sie sind deshalb anfällig für gefälschte Antworten.

### Die drei Verfahren
| Merkmal | **mDNS** | **LLMNR** | **NetBIOS-NS** |
|---|---|---|---|
| Port | UDP **5353** | UDP **5355** | UDP **137** (Datagramm UDP 138, Sitzung TCP 139) |
| Adressierung | Multicast **224.0.0.251** / ff02::fb | Multicast **224.0.0.252** / ff02::1:3 | **Broadcast** |
| Standard | RFC 6762 (2013, Apple/Bonjour) | RFC 4795 (2007, Windows Vista) | 1980er (NetBT) |
| IPv6 | ja | ja | nein |
| Zukunft unter Windows | wird Standard | schrittweise abgelöst | wird entfernt |
mDNS nutzt die Pseudo-Domäne **.local**; Windows unterstützt es nativ seit Windows 10 (1703) und Server 2019.

### Windows-Fallback-Reihenfolge
Fehlgeschlagene DNS-Abfrage im lokalen Netz: 1) **hosts-Datei** 2) **DNS** 3) **LLMNR** 4) **NetBIOS-NS** (Broadcast, letzter Fallback). **mDNS** läuft parallel für Geräte-/Dienst-Discovery, unabhängig vom DNS-Erfolg.
Microsoft kündigte 2022 an, auf mDNS zu vereinheitlichen (Sicherheit, weniger Netzlast, ein Standard). NetBIOS ist auf Mobilfunkverbindungen bereits standardmäßig aus; in Insider-/Beta-Builds im „Lernmodus“. Steuerung per GPO („NetBIOS konfigurieren“) oder Registry (`EnableNetbios`).

### Poisoning-Risiko
LLMNR und NetBIOS vertrauen jedem im Subnetz: Ein Angreifer antwortet schneller und gibt sich als Zielhost aus, der Client sendet **NTLM-Hashes**. Tool: „Responder“ (Standard bei Penetrationstests in AD). Gegenmaßnahmen: LLMNR und NetBIOS in AD-Umgebungen mit vollständigem DNS **deaktivieren**.
```
# LLMNR (GPO oder Registry)
New-Item HKLM:\SOFTWARE\Policies\Microsoft\Windows NT\DNSClient -Force
New-ItemProperty ...\DNSClient -Name EnableMulticast -Value 0
# NetBIOS je Adapter aus
Get-WmiObject Win32_NetworkAdapterConfiguration | % { $_.SetTcpipNetbios(2) }
```

### Weitere Server-2025-Themen (laut Unterlage)
- **WINS**: Server 2025 ist die letzte Version mit WINS; Standardsupport bis 2034; danach vollständig entfernt. Empfehlung: NetBIOS-Abhängigkeiten inventarisieren, zu DNS migrieren, bedingte Weiterleitungen nutzen, Anwendungen modernisieren, keine statischen hosts-Dateien.
- **DNS over HTTPS (DoH)**: Verschlüsselung Client ↔ DNS-Server über TCP 443 (TLS-Zertifikat, Firewallregel nötig); `Set-DnsServerEncryptionProtocol -EnableDoh $true -UriTemplate "https://dns.contoso.local:443/dns-query"`; Upstream-Verschlüsselung folgt später; klassisches DNS bleibt parallel.
- **DNSSEC**, Zonentransfer einschränken, Scavenging, Redundanz (≥ 2 DNS-Server, AD-integriert), Monitoring.

## Einfach

Wenn du in einem Klassenzimmer jemanden suchst, rufst du einfach in die Klasse: „Wo ist Lisa?“ Lisa antwortet: „Hier!“ Dafür braucht es keinen Lehrer mit Namensliste (DNS-Server). So funktionieren **mDNS**, **LLMNR** und **NetBIOS**: Ein Computer ruft im lokalen Netz nach einem Namen, und das gesuchte Gerät antwortet.

- **NetBIOS** ist der älteste Ruf: Er geht an *alle* (Broadcast) – wie ein Schrei durch die ganze Schule. Er beherrscht nur das alte IPv4.
- **LLMNR** ruft nur die, die zuhören wollen (Multicast), und versteht auch das neue IPv6. Er wurde von Microsoft erfunden und läuft aus.
- **mDNS** ist die moderne Variante, die auch Apple (Bonjour), Drucker und Smart-Home-Geräte benutzen. Er wird Microsofts Zukunft.

Wie sucht Windows nach einem Namen? Zuerst blickt es in die eigene Notizliste (hosts-Datei). Dann fragt es den Lehrer (DNS). Wenn der es nicht weiß, ruft es in die Klasse (LLMNR), und als Letztes schreit es durch die Schule (NetBIOS).

Das Problem: Ein **Schlaumeier** kann antworten: „Ich bin Lisa!“ – obwohl er es nicht ist. Dann glaubt der Computer ihm, schickt sein Passwort (Hash) hin, und der Betrüger kann es abfangen (**Poisoning**). Deshalb schaltet man in Firmennetzen mit gutem DNS die alten Rufe (LLMNR, NetBIOS) aus.

## Merksatz
- **mDNS 5353 (224.0.0.251), LLMNR 5355 (224.0.0.252), NetBIOS 137 (Broadcast).**
- **Fallback: hosts → DNS → LLMNR → NetBIOS; mDNS parallel.**
- **LLMNR/NetBIOS = Poisoning-Gefahr → abschalten.**
- **WINS: Server 2025 = letzte Version.**
- **DoH = TCP 443 verschlüsselt, klassisches DNS 53.**

## Prüfungsfalle
- **NetBIOS-NS nutzt Broadcast**, nicht Multicast.
- **NetBIOS ist nur IPv4** – mDNS und LLMNR sind IPv6-fähig.
- **mDNS ist nicht Teil der Fallback-Kette**, sondern läuft parallel.
- DoH ersetzt kein DNSSEC (Transportverschlüsselung vs. Signatur).
- LLMNR wird **nicht** durch NetBIOS ersetzt – umgekehrt: LLMNR sollte NetBIOS ablösen und wird nun selbst abgelöst.
- Die Unterlage ist im Stand **August 2026** (DoH-GA Juni 2026); Termine im Zweifel bei Microsoft prüfen.
- Deaktivieren von NetBIOS/LLMNR kann **Legacy-Anwendungen** stören – vor Rollout testen.

## Grafik
### Windows-Fallback
1. Client: hosts-Datei prüfen – kein Treffer
2. Client -> DNS-Server: Abfrage – Name unbekannt
3. Client -> Netzwerk: LLMNR-Multicast (UDP 5355)
4. Client -> Netzwerk: NetBIOS-Broadcast (UDP 137)
5. Text: Gerät antwortet oder Auflösung scheitert

### Poisoning
1. Client -> Netzwerk: LLMNR "Wo ist FILESRV?"
2. Angreifer -> Client: "FILESRV bin ich" (schnelle gefälschte Antwort)
3. Client -> Angreifer: NTLM-Authentifizierung mit Hash
4. Text: Angreifer fängt den Hash ab

## Lab
**Maschinen: Win10-1 (Client), DC01 (GPO)**

### GUI
1. **DC01**: Gruppenrichtlinienverwaltung → neue GPO „Namensauflösung härten“ → Computerkonfiguration → Administrative Vorlagen → Netzwerk → DNS-Client → „Multicastnamensauflösung deaktivieren“ → Aktiviert.
2. **Win10-1**: Netzwerkadapter → IPv4 → Erweitert → WINS → „NetBIOS über TCP/IP deaktivieren“.
3. **Win10-1**: `gpupdate /force`.

### PowerShell
Auf **Win10-1** (Administrator):
```
Get-NetAdapter | Get-DnsClient
Resolve-DnsName filesrv -LlmnrOnly
Get-WmiObject Win32_NetworkAdapterConfiguration | ForEach-Object { $_.SetTcpipNetbios(2) }
Get-DnsClientNrptPolicy
```
Auf **DC01** (DoH, Zertifikat vorausgesetzt):
```
Set-DnsServerEncryptionProtocol -EnableDoh $true -UriTemplate "https://dns.exa.local:443/dns-query"
Restart-Service DNS
```

## Befehle
- `nbtstat -n` – lokale NetBIOS-Namen
- `Resolve-DnsName name -LlmnrOnly` – LLMNR testen
- `Resolve-DnsName name -NetbiosFallback` – NetBIOS-Fallback
- `gpupdate /force` – Richtlinie anwenden
- `Set-DnsServerEncryptionProtocol -EnableDoh $true` – DoH aktivieren

## Übungen
- A: Ports und Adressen von mDNS, LLMNR, NetBIOS-NS? | L: 5353 (224.0.0.251), 5355 (224.0.0.252), 137 (Broadcast).
- A: Reihenfolge der Windows-Namensauflösung? | L: hosts → DNS → LLMNR → NetBIOS-NS; mDNS parallel.
- A: Wie funktioniert LLMNR-Poisoning? | L: Angreifer antwortet schneller als der echte Host, Client sendet NTLM-Hash.
- A: Maßnahmen gegen Poisoning? | L: LLMNR und NetBIOS per GPO abschalten, DNS vollständig pflegen.
- A: Was ändert sich bei WINS in Server 2025? | L: Letzte Version mit WINS; Entfernung danach.
- A: Wozu DoH? | L: Verschlüsselte Namensauflösung über TCP 443 (Zero-Trust-DNS).

## Karteikarten
- F: mDNS-Port? | A: UDP 5353.
- F: LLMNR-Port? | A: UDP 5355.
- F: NetBIOS-NS-Port? | A: UDP 137.
- F: Welches Verfahren nutzt Broadcast? | A: NetBIOS-NS.
- F: Welches Verfahren ist RFC 6762? | A: mDNS.
- F: Was ist Poisoning? | A: Gefälschte Antwort auf Namensanfrage zum Abgreifen von Zugangsdaten.
- F: Werkzeug für Poisoning-Tests? | A: Responder.
- F: Windows-Fallback nach DNS? | A: LLMNR, dann NetBIOS.
- F: Was ist DoH? | A: DNS over HTTPS, TCP 443.
- F: WINS-Status in Server 2025? | A: Letzte Version mit Unterstützung.

## Quiz
? Welches Verfahren nutzt Broadcast?
* NetBIOS-NS
- mDNS
- LLMNR
- DNS
? Welche Portnummer nutzt mDNS?
* UDP 5353
- UDP 5355
- UDP 137
- UDP 53
? Welche Reihenfolge nutzt Windows nach fehlgeschlagenem DNS?
* LLMNR, dann NetBIOS-NS
- NetBIOS, dann LLMNR
- mDNS, dann hosts
- WINS, dann hosts
? Welches Verfahren ist nicht IPv6-fähig?
* NetBIOS-NS
- mDNS
- LLMNR
- DNS
? Was ist das Risiko bei LLMNR?
* Poisoning – Abgreifen von NTLM-Hashes
- Zonentransfer
- Cachelöschung
- DHCP-Leerlauf
? Was ersetzt Microsoft schrittweise durch mDNS?
* NetBIOS und LLMNR
- DNS
- DHCP
- Kerberos
? Welche Adresse nutzt mDNS?
* 224.0.0.251
- 224.0.0.252
- 255.255.255.255
- 224.0.0.1
? Wie wird LLMNR per GPO deaktiviert?
* Multicastnamensauflösung deaktivieren
- DHCP-Relay deaktivieren
- WINS aktivieren
- DNSSEC aktivieren
? Welche Version ist die letzte mit WINS?
* Windows Server 2025
- Windows Server 2022
- Windows Server 2019
- Windows Server 2016
