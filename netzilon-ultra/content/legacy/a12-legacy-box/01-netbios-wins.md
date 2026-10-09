---
id: legacy-netbios-wins
bereich: Legacy
block: A12
kapitel: Legacy-Box
titel: NetBIOS, WINS und Computer Browser
stufe: Fortgeschritten
quellen: [Microsoft Learn WINS-Deprecation, RFC 1001/1002, 70-642-Buch]
verweise: [ap1-a5-namensaufloesung, ap1-a5-dns-zonen, legacy-streichliste-2025, legacy-smb1]
---

## Profi

### Ausgangslage
Vor Active Directory (Windows NT 4.0) fanden sich Rechner über **NetBIOS-Namen** (*Network Basic Input/Output System*): flache Namen, **maximal 15 Zeichen + 1 Zeichen Diensttyp = 16 Byte**, ohne Hierarchie. Aufgelöst wurde per **Broadcast** oder über einen **WINS-Server** (*Windows Internet Name Service*), der als zentrales Namensverzeichnis dient. Heute übernimmt das **DNS** – NetBIOS und WINS sind **Legacy**.

### NetBIOS-Dienste und Ports
| Dienst | Port | Zweck |
|---|---|---|
| **Name Service (NBNS)** | **UDP 137** | Namen registrieren und auflösen |
| **Datagram Service** | **UDP 138** | Verbindungslose Nachrichten, Browsing |
| **Session Service** | **TCP 139** | Sitzungen (z. B. Dateizugriff über SMB über NetBIOS) |
Moderner SMB nutzt **TCP 445** direkt, ohne NetBIOS.

### Das 16. Zeichen (Diensttyp)
| Suffix | Bedeutung |
|---|---|
| `<00>` | Workstation-Dienst (Computername) bzw. Domänenname |
| `<03>` | Messenger-Dienst (angemeldeter Benutzer) |
| `<20>` | Server-Dienst (Datei-/Druckfreigaben) |
| `<1B>` | Domain Master Browser (PDC-Emulator) |
| `<1C>` | Domänencontroller-Gruppe |
| `<1D>` | Master Browser |
Anzeigen mit `nbtstat -n` (lokal) und `nbtstat -A <IP>` (Remote).

### Knotentypen (NetBIOS Node Types) – Auflösungsreihenfolge
| Typ | Reihenfolge |
|---|---|
| **B-Node** (Broadcast) | Broadcast |
| **P-Node** (Peer) | Nur WINS |
| **M-Node** (Mixed) | Broadcast → WINS |
| **H-Node** (Hybrid) | **WINS → Broadcast** (Standard bei konfiguriertem WINS) |
Zusätzlich: Cache (`nbtstat -c`) und **LMHOSTS**-Datei (`C:\Windows\System32\drivers\etc\lmhosts`).

### WINS – Funktion
- **Registrierung**: Beim Start meldet jeder Client seinen Namen dem WINS-Server.
- **Namensanfrage**: Client fragt den Server statt zu senden (spart Broadcast).
- **Replikation**: Mehrere WINS-Server gleichen sich als **Push-/Pull-Partner** ab.
- **Renewal/Release**: Einträge haben eine Lebensdauer (TTL) und werden beim Herunterfahren freigegeben.

### Computer Browser
Der **Browser-Dienst** (*Computer Browser*) baute die **Netzwerkumgebung** (Liste sichtbarer Rechner) per Broadcast auf; er setzt **SMB1** voraus. Seit Windows 10 (1709) standardmäßig aus und mit Server 2025 **abgekündigt**. Ersatz: **DNS**, **Active Directory**-Suche, **Function Discovery/WS-Discovery**, DFS-Namensraum.

### Status heute (Stand 09/2026)
- **WINS** ist seit **Windows Server 2022 deprecated**.
- **Windows Server 2025 ist die letzte LTSC-Version, die WINS noch enthält**; danach wird die Rolle nicht mehr ausgeliefert. Bis dahin gilt der normale Support-Zeitraum.
- Microsoft geht schrittweise zu **mDNS/DNS** über; NetBIOS ist auf Mobilfunkverbindungen bereits standardmäßig aus.

### Ersatz und Migration
| Ziel | Lösung |
|---|---|
| Einzelne kurze Namen (ohne Suffix) im Forest | **GlobalNames-Zone (GNZ)** in DNS |
| Namensauflösung insgesamt | Vollständige **DNS-Zonen** (Forward + Reverse), Dynamische Updates, **DNS-Suffixliste per GPO** |
| Altanwendung, die NetBIOS-Namen nutzt | Hosts-Datei / **CNAME-Einträge** / Anwendung umstellen |
| Broadcast im Netz | NetBIOS über TCP/IP **deaktivieren**, wenn nichts mehr abhängt |

Vorgehen: **WINS-Datenbank auswerten** (Wer fragt noch?), Client-Konfiguration über DHCP-Option **044 (WINS-Server)** und **046 (Knotentyp)** prüfen, GNZ anlegen, **testen**, dann NetBIOS abschalten, WINS außer Betrieb nehmen.

### Risiken
- **Broadcast-Spoofing/NBT-NS-Poisoning** (Zugangsdaten-Diebstahl, siehe lokale Namensauflösung)
- **Fehlender Schutz der WINS-Datenbank**: Jeder Client kann sich beliebig registrieren (Name-Hijacking)
- Netzlast durch Broadcasts

## Lab
**Maschinen**: **SRV01** (WINS-Server, nur zu Testzwecken), **CL01** (Client), **DC01** (DNS).

### GUI
1. **SRV01**: Server-Manager → Rollen und Features hinzufügen → **Feature „WINS-Server“** installieren (Feature, nicht Rolle).
2. **SRV01**: Tools → **WINS** → Server-Name → Rechtsklick → **Aktive Registrierungen** → Alle Datensätze anzeigen.
3. **DC01 (DHCP)**: DHCP-Konsole → Bereichsoptionen → **044 WINS/NBNS-Server** = IP von SRV01, **046 WINS/NBT-Knotentyp** = `0x8` (H-Node).
4. **CL01**: `ipconfig /renew` und `nbtstat -n`, `nbtstat -c`.
5. **DC01**: DNS-Manager → Forward-Lookupzonen → **Neue Zone** → Name **GlobalNames**, AD-integriert (Forest-weit).
6. **DC01** (PowerShell, siehe unten): GlobalNames-Unterstützung aktivieren, CNAME **intranet** → **web01.firma.local**.
7. **CL01**: `ping intranet` (ohne Suffix) löst über GNZ auf.
8. **CL01**: `ncpa.cpl` → Adapter → IPv4 → Erweitert → Registerkarte **WINS** → „NetBIOS über TCP/IP deaktivieren“.

### PowerShell
```powershell
# Auf SRV01 – WINS-Feature installieren
Install-WindowsFeature WINS -IncludeManagementTools

# Auf DC01 – GlobalNames-Zone aktivieren (einmal je Forest), Zone anlegen, CNAME eintragen
Set-DnsServerGlobalNameZone -Enable $true
Add-DnsServerPrimaryZone -Name GlobalNames -ReplicationScope Forest
Add-DnsServerResourceRecordCName -ZoneName GlobalNames -Name intranet -HostNameAlias web01.firma.local

# Auf CL01 – NetBIOS ansehen und abschalten
nbtstat -n
nbtstat -c
Get-CimInstance Win32_NetworkAdapterConfiguration -Filter "IPEnabled=True" |
  Invoke-CimMethod -MethodName SetTcpipNetbios -Arguments @{TcpipNetbiosOptions = 2}
```

## Befehle
- `nbtstat -n` – Eigene registrierte NetBIOS-Namen
- `nbtstat -c` – NetBIOS-Namenscache
- `nbtstat -R` – Cache neu laden (LMHOSTS)
- `nbtstat -RR` – Namen beim WINS-Server neu registrieren
- `nbtstat -A 192.168.10.20` – Namenstabelle eines entfernten Hosts
- `nbtstat -S` – Sitzungen
- `Set-DnsServerGlobalNameZone -Enable $true` – GlobalNames-Zone aktivieren

## Einfach

Früher gab es in der Schule **keine Klassenliste**. Wenn du „Max“ suchst, hast du einfach **laut über den Schulhof gerufen** (Broadcast). Das nervt alle, und ein Frecher kann „Ich bin Max!“ zurückrufen (Spoofing).

Dann hat jemand im Sekretariat einen **Aushang** gemacht: „Wer ist wo“ (**WINS**). Jeder Schüler trägt sich morgens ein, und wer jemanden sucht, schaut nur auf den Aushang. Viel ruhiger. Nur: Der Aushang hat **keine Kontrolle**. Jeder kann sich unter **beliebigem Namen** eintragen.

Heute gibt es die **richtige Schuldatenbank** (**DNS**) mit Namen wie `max.klasse5.schule.de`. Sie hat Struktur, Rechte und Sicherheit. Der alte Aushang (WINS) und das Rufen (NetBIOS-Broadcast) werden abgeschafft.

Nur für ein paar Spitznamen („intranet“ statt „intranet.firma.local“) gibt es einen **Spitznamen-Zettel** im DNS: die **GlobalNames-Zone**.

## Merksatz
- NetBIOS = **137 (Namen), 138 (Datagramm), 139 (Sitzung)**, SMB modern = **445**.
- **H-Node = erst WINS, dann Broadcast.**
- Name = **15 Zeichen + 1 Suffix**.
- **Server 2025 = letzte Version mit WINS.**
- Ersatz für einfache Namen: **GlobalNames-Zone**.
- DHCP-Optionen: **044 WINS-Server, 046 Knotentyp**.

## Prüfungsfalle
- NetBIOS-Namen sind **nicht hierarchisch**, DNS schon.
- **WINS ≠ DNS**: WINS löst nur NetBIOS-Namen (flach), nicht FQDNs.
- WINS ist als **Feature** installierbar, nicht als eigene Rolle.
- GlobalNames-Zone ersetzt **kein** komplettes WINS, nur **einzelne, statische** Namen.
- Abschalten von NetBIOS **ohne Test** kann Altanwendungen brechen.

## Grafik
### Namenssuche früher/heute
Zwei Bahnen: oben Broadcast-Rufe über ein Netz, ein Angreifer antwortet; unten WINS-Aushang; ganz unten DNS-Verzeichnis mit Baumstruktur. Schalter „Zeitreise“ blendet die Stufen nacheinander ein.

### Node-Type-Reihenfolge
Vier Kästchen B/P/M/H, Pfeile zeigen die Abfragereihenfolge; Klick auf den Typ animiert den Weg der Anfrage.

## Karteikarten
- F: Wie lang ist ein NetBIOS-Name? | A: 15 Zeichen plus 1 Zeichen Diensttyp (16 Byte).
- F: Ports von NetBIOS? | A: UDP 137 (Name), UDP 138 (Datagramm), TCP 139 (Sitzung).
- F: Welcher Port ersetzt 139 bei modernem SMB? | A: TCP 445.
- F: Was macht WINS? | A: Zentrale Auflösung flacher NetBIOS-Namen zu IP-Adressen.
- F: Welcher Knotentyp fragt zuerst WINS, dann Broadcast? | A: H-Node (Hybrid).
- F: Wie zeigt man den NetBIOS-Namenscache? | A: `nbtstat -c`
- F: DHCP-Option für WINS-Server? | A: 044.
- F: DHCP-Option für den NetBIOS-Knotentyp? | A: 046.
- F: Was ist die GlobalNames-Zone? | A: DNS-Zone für einzelne kurze Namen, Ersatz für WINS-Einträge.
- F: Welche Windows-Server-Version ist die letzte mit WINS? | A: Windows Server 2025.
- F: Wofür war der Computer-Browser-Dienst? | A: Netzwerkumgebung per Broadcast, benötigt SMB1.
- F: Nenne ein Sicherheitsrisiko von NetBIOS. | A: NBT-NS-Poisoning und Name-Hijacking.

## Quiz
? Welcher Port gehört zum NetBIOS-Namensdienst?
* UDP 137
- TCP 445
- TCP 139
- UDP 53

? Welcher NetBIOS-Knotentyp fragt erst WINS, dann per Broadcast?
* H-Node
- B-Node
- P-Node
- M-Node

? Was ersetzt WINS für einzelne kurze Namen im Forest?
* GlobalNames-Zone
- Reverse-Lookupzone
- LMHOSTS auf jedem Server
- Stub-Zone

? Wie viele Byte hat ein NetBIOS-Name insgesamt?
* 16
- 15
- 32
- 255

? Welche Windows-Server-Version ist die letzte, die WINS ausliefert?
* Windows Server 2025
- Windows Server 2019
- Windows Server 2022
- Windows Server 2012 R2

? Welche DHCP-Option trägt den WINS-Server?
* 044
- 003
- 006
- 015

? Welcher Befehl zeigt die NetBIOS-Namenstabelle eines Remotecomputers?
* nbtstat -A <IP-Adresse>
- ipconfig /all
- nslookup -nb
- route print
! nbtstat -n zeigt die lokale Tabelle.

? Welcher Dienst ersetzt WINS in modernen Netzen?
* DNS (ggf. mit GlobalNames-Zone)
- DHCP
- LDAP
- SNMP
! Kurze Namen werden über DNS-Suffixe aufgelöst.
