---
id: ap1-a5-namensaufloesung
bereich: AP1
block: A5
kapitel: Netzdienste
titel: Lokale Namensauflösung – Hosts, LLMNR, NetBIOS, mDNS
stufe: Fortgeschritten
quellen: [Namensauflösung_WindowsServer2025.pdf, DNS_WindowsServer2025.pdf, 14-Folien-dhcp-namen.pdf]
verweise: [ap1-a5-dns, ap1-a5-dns-zonen, ap1-a4-ipv6, az801-baselines]
---

## Profi

### Warum lokale Namensauflösung?
DNS deckt nicht jedes Szenario ab: Geräte **ohne DNS-Eintrag** (Drucker, IoT, ein frisch angeschlossener Laptop) müssen sich im **selben Netzsegment** trotzdem finden. Dafür gibt es drei **serverlose** Verfahren: Eine Anfrage geht per **Multicast oder Broadcast an alle** im lokalen Link, wer den Namen trägt, antwortet direkt. Einfach – aber **anfällig für gefälschte Antworten**.

### Die drei Verfahren
| Merkmal | **mDNS** | **LLMNR** | **NetBIOS-NS** |
|---|---|---|---|
| Voller Name | Multicast DNS | Link-Local Multicast Name Resolution | NetBIOS Name Service (über TCP/IP = NetBT) |
| Port | **UDP 5353** | **UDP 5355** | **UDP 137** (Datagramm 138/UDP, Sitzung 139/TCP) |
| Adressierung | Multicast **224.0.0.251** / **ff02::fb** | Multicast **224.0.0.252** / **ff02::1:3** | **Broadcast** |
| Standard | RFC 6762 (2013), Ursprung Apple **Bonjour** | RFC 4795 (2007), Windows Vista | 1980er |
| IPv6 | ja | ja | **nein** |
| Namen | `.local` | Einzelnamen | 15 Zeichen + Suffix |
| Zukunft unter Windows | **wird Standard** (nativ seit Win 10 1703 / Server 2019) | wird schrittweise abgelöst | wird entfernt (WINS endet mit Server 2025) |
Einsatz mDNS: Drucker- und Dateifreigaben (Bonjour), Smart-Home/IoT, AirPlay, Chromecast.

### Reihenfolge der Namensauflösung unter Windows
1. **Eigener Name** / DNS-Client-Cache (inkl. vorgeladener Hosts-Einträge)
2. **Hosts-Datei** (`C:\Windows\System32\drivers\etc\hosts`) – statisch, lokal
3. **DNS-Server** (mit DNS-Suffixen: primäres Suffix, verbindungsspezifisches Suffix, Suffixliste)
4. **LLMNR** – Multicast an alle im Link
5. **NetBIOS-NS** – WINS-Server (falls konfiguriert), dann Broadcast, LMHOSTS-Datei
**mDNS** läuft **parallel** und unabhängig davon für `.local`-Namen und Geräte-/Dienst-Discovery.

**Hosts-Datei**: Format `192.168.10.30  srv-app01 srv-app01.firma.local`. Nützlich für Tests (z. B. im Workgroup-Lab bei WinRM/TrustedHosts), aber **nicht skalierbar** und beliebtes Ziel von Malware (Umleitung auf Phishing-Seiten).

### Strategiewechsel bei Microsoft (seit 2022)
Ziel: Namensauflösung auf **mDNS** vereinheitlichen.
- **Sicherheit**: weniger angreifbare Broadcast-/Multicast-Mechanismen.
- **Netzlast**: mDNS-Discovery gezielter als Broadcasts.
- **Standard**: herstellerübergreifend statt Insellösungen.
Aktueller Stand: NetBIOS-NS auf Mobilfunkverbindungen standardmäßig aus; in Insider-/Beta-Builds nur noch „Lernmodus“ (Fallback, wenn mDNS und LLMNR scheitern); für LLMNR sind ähnliche Schritte angekündigt. Steuerbar per GPO („NetBIOS-Einstellungen konfigurieren“) oder Registry (`EnableNetbios`).

### Sicherheitsrisiko: Poisoning (LLMNR/NBT-NS-Spoofing)
1. **Fehlerhafte Anfrage**: Ein Client vertippt sich (`\\filesevrer`) oder fragt einen nicht mehr existierenden Host an → DNS findet nichts → Fallback auf LLMNR/NetBIOS.
2. **Gefälschte Antwort**: Ein Angreifer im selben Netz antwortet **zuerst**: „Das bin ich!“
3. **Zugangsdaten abgegriffen**: Der Client authentifiziert sich beim Angreifer und sendet dabei seinen **NTLM-Hash** → Offline-Knacken oder Relay-Angriff.
Werkzeuge wie **„Responder“** automatisieren das – Standard bei Pentests in AD-Umgebungen. mDNS ist weniger exponiert, aber nicht immun.

### Härten
- **LLMNR und NetBIOS deaktivieren**, wo zuverlässiges, vollständiges DNS vorhanden ist (AD-Umgebungen) – vorher auf Legacy-Anwendungen/Altgeräte **testen**.
- mDNS meist unkritisch (Drucker-Discovery), kann aber ebenfalls abgeschaltet werden.
- Zusätzlich: **SMB-Signierung** erzwingen, NTLM einschränken.

## Lab
**Maschine: CL01** (einzeln) bzw. per GPO für die ganze Domäne (auf **DC01**).

### GUI
1. **DC01**: Gruppenrichtlinienverwaltung → neues GPO „Sicherheit – Namensauflösung“ → Bearbeiten → Computerkonfiguration → Richtlinien → Administrative Vorlagen → Netzwerk → **DNS-Client** → **„Multicastnamensauflösung deaktivieren“** → Aktiviert (schaltet LLMNR ab).
2. Im selben Pfad (neuere ADMX): **„NetBIOS-Einstellungen konfigurieren“** → Aktiviert → „NetBIOS-Namensauflösung deaktivieren“.
3. GPO mit der Domäne oder OU der Computer verknüpfen.
4. **CL01**: `gpupdate /force`.
5. **CL01** (einzeln, ohne GPO): `ncpa.cpl` → Ethernet → Eigenschaften → IPv4 → Erweitert → Registerkarte **WINS** → **„NetBIOS über TCP/IP deaktivieren“**.
6. **CL01**: Hosts-Datei testen: Editor **als Administrator** → `C:\Windows\System32\drivers\etc\hosts` → Zeile `192.168.10.30 testserver` → `ping testserver`.

### PowerShell
```powershell
# Auf CL01 – LLMNR per Registry abschalten
New-Item "HKLM:\SOFTWARE\Policies\Microsoft\Windows NT\DNSClient" -Force
New-ItemProperty "HKLM:\SOFTWARE\Policies\Microsoft\Windows NT\DNSClient" -Name EnableMulticast -Value 0 -PropertyType DWord -Force

# NetBIOS über TCP/IP auf allen Adaptern deaktivieren (2 = deaktiviert)
Get-CimInstance Win32_NetworkAdapterConfiguration -Filter "IPEnabled=True" |
  Invoke-CimMethod -MethodName SetTcpipNetbios -Arguments @{TcpipNetbiosOptions = 2}

# mDNS abschalten (optional)
reg add "HKLM\SYSTEM\CurrentControlSet\Services\Dnscache\Parameters" /v EnableMDNS /t REG_DWORD /d 0 /f

# Kontrolle
Get-DnsClientGlobalSetting                  # Suffixe, Suchliste
nbtstat -n                                  # eigene NetBIOS-Namen
Get-NetUDPEndpoint -LocalPort 5355,5353,137 # lauschende Dienste
```

## Einfach

Stell dir vor, du suchst in der Schule einen **Mitschüler namens Max**:
1. Zuerst schaust du in **deinen eigenen Zettel** mit Namen (Hosts-Datei).
2. Dann fragst du im **Sekretariat** (DNS-Server) – die haben die offizielle Liste.
3. Weiß das Sekretariat nichts, **rufst du laut in deinen Klassenraum**: „Ist hier ein Max?“ (LLMNR).
4. Hilft das auch nicht, **brüllst du über den Schulhof-Lautsprecher** (NetBIOS-Broadcast).

**mDNS** ist wie ein Klassen-Chat, in dem Geräte sich selbst vorstellen: „Hallo, ich bin der Drucker im Flur!“ – das läuft nebenher.

**Das Problem mit dem Rufen**: Wenn du laut „Ist hier ein Max?“ rufst, kann ein **frecher Mitschüler** schneller „Ich bin's!“ antworten, obwohl er gar nicht Max ist. Du gibst ihm dann deinen **Geheimzettel** (dein Passwort-Hash), den du eigentlich nur Max geben wolltest. Genau so funktioniert der **Poisoning-Angriff**. Tippfehler machen es noch schlimmer: Wer nach „Mxa“ ruft, bekommt vom Sekretariat keine Antwort – und dann ruft der PC in den Raum.

**Die Lösung**: In Firmen, wo das Sekretariat (DNS) gut funktioniert, **verbietet man das Rufen** (LLMNR und NetBIOS abschalten). Microsoft will langfristig nur noch den moderneren Klassen-Chat (mDNS) behalten.

## Merksatz
- Reihenfolge: **Hosts → DNS → LLMNR → NetBIOS** (mDNS parallel).
- Ports: mDNS **5353**, LLMNR **5355**, NetBIOS **137**.
- NetBIOS = **Broadcast, nur IPv4**; LLMNR/mDNS = **Multicast, IPv4 + IPv6**.
- **Responder** = LLMNR/NBT-NS-Poisoning → NTLM-Hashes.
- In AD mit gutem DNS: **LLMNR + NetBIOS aus**.

## Prüfungsfalle
- mDNS ist nicht Teil der Fallback-Kette, sondern läuft parallel.
- LLMNR ist kein DNS-Server, sondern serverlos per Multicast.
- WINS ≠ NetBIOS-Broadcast: WINS ist der (auslaufende) zentrale Server für NetBIOS-Namen.
- Hosts-Datei wird **vor** DNS geprüft.

## Grafik
### Fallback-Kette
Vier Stationen (Hosts-Buch, DNS-Sekretariat, LLMNR-Megafon im Raum, NetBIOS-Schulhoflautsprecher); eine Anfrage wandert, bis sie eine Antwort bekommt; mDNS als paralleler Chat-Kanal oben.

### Poisoning-Angriff
Client tippt „filesevrer“, DNS schüttelt den Kopf, Client ruft per LLMNR, ein Angreifer mit Kapuze antwortet schneller, ein Schlüssel (NTLM-Hash) fliegt zu ihm. Knopf „LLMNR deaktivieren“: das Megafon verschwindet, der Angriff läuft ins Leere.

### Vergleichstabelle interaktiv
Drei Karten mDNS/LLMNR/NetBIOS mit Ports, Adressen, IPv6-Fähigkeit und Zukunftsampel.

## Karteikarten
- F: Port und Multicast-Adresse von mDNS? | A: UDP 5353, 224.0.0.251 / ff02::fb.
- F: Port und Multicast-Adresse von LLMNR? | A: UDP 5355, 224.0.0.252 / ff02::1:3.
- F: Port von NetBIOS-NS? | A: UDP 137 (138 Datagramm, 139 Sitzung).
- F: Welches Verfahren ist nicht IPv6-fähig? | A: NetBIOS-NS.
- F: Reihenfolge der Namensauflösung unter Windows? | A: Cache/Hosts → DNS → LLMNR → NetBIOS (mDNS parallel).
- F: Wo liegt die Hosts-Datei? | A: C:\Windows\System32\drivers\etc\hosts
- F: Was ist ein LLMNR-Poisoning-Angriff? | A: Angreifer beantwortet Multicast-Namensanfragen und erhält den NTLM-Hash des Clients.
- F: Welches Tool automatisiert Poisoning? | A: Responder.
- F: Welche GPO schaltet LLMNR ab? | A: DNS-Client → „Multicastnamensauflösung deaktivieren“.
- F: Welches Verfahren ist Microsofts Zukunft? | A: mDNS.

## Quiz
? Welches Verfahren nutzt Broadcast statt Multicast?
* NetBIOS-NS
- LLMNR
- mDNS
- DoH

? Was wird unter Windows vor der DNS-Abfrage geprüft?
* Die Hosts-Datei
- LLMNR
- NetBIOS-Broadcast
- mDNS

? Welcher Port gehört zu LLMNR?
* UDP 5355
- UDP 5353
- UDP 137
- TCP 53

? Warum sollte LLMNR in AD-Umgebungen deaktiviert werden?
* Angreifer können gefälschte Antworten senden und NTLM-Hashes abgreifen
- LLMNR verlangsamt DNS-Zonentransfers
- LLMNR funktioniert nur mit IPv4
- LLMNR verhindert die Anmeldung am DC

? Welche Pseudo-Domain nutzt mDNS?
* .local
- .lan
- .arpa
- .home

? In welcher Datei können unter Windows Namen statisch IP-Adressen zugeordnet werden?
* C:\Windows\System32\drivers\etc\hosts
- C:\Windows\win.ini
- C:\boot.ini
- C:\Windows\System32\config\SAM
! Unter Linux: /etc/hosts.

? Welches Angriffswerkzeug nutzt LLMNR/NBT-NS-Antworten aus, um Hashes abzugreifen?
* Responder (Spoofing/Poisoning)
- nslookup
- tracert
- ipconfig
! Daher LLMNR und NetBIOS über TCP/IP per GPO deaktivieren.

? Welcher Befehl leert den DNS-Cache unter Windows?
* ipconfig /flushdns
- ipconfig /renew
- nbtstat -R
- arp -d
! nbtstat -R leert dagegen den NetBIOS-Namencache.
