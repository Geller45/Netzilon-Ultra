---
id: legacy-klartextprotokolle
bereich: Legacy
block: A12
kapitel: Legacy-Box
titel: Unsichere Klartextprotokolle und ihr Ersatz
stufe: Einsteiger
quellen: [BSI IT-Grundschutz NET/SYS, RFC-Übersicht, eigene Zusammenstellung]
verweise: [ap1-a4-netzwerkgrundlagen, ap1-a5-firewall, ap2-kryptografie, legacy-vpn-wlan-tls]
---

## Profi

### Problem: Klartext
Viele **Ur-Protokolle** des Internets entstanden, als das Netz nur aus **vertrauenswürdigen Hochschulen** bestand. Sie übertragen **Benutzername, Kennwort und Daten unverschlüsselt**. Ein Angreifer im Netzpfad (WLAN, Switch-Port mit **Port-Mirroring**, ARP-Spoofing) sieht alles mit (**Sniffing** mit **Wireshark**). Betroffen ist das Schutzziel **Vertraulichkeit**, oft auch **Integrität**.

### Übersicht Klartext → Ersatz
| Legacy-Protokoll | Port | Problem | Sicherer Ersatz | Port |
|---|---|---|---|---|
| **Telnet** | **TCP 23** | Klartext-Shell | **SSH** | **TCP 22** |
| **rlogin/rsh** | 513/514 | Klartext, IP-Vertrauen | SSH | 22 |
| **FTP** | **TCP 20/21** | Klartext-Login, 2 Verbindungen (Firewall-Ärger) | **SFTP** (über SSH) oder **FTPS** | **22** / **990** (implizit), 21 (explizit STARTTLS) |
| **TFTP** | **UDP 69** | Ohne Authentifizierung | SFTP/HTTPS, TFTP nur im isolierten Boot-/Konfig-Netz | – |
| **HTTP** | **TCP 80** | Klartext-Webverkehr | **HTTPS** (TLS) | **443** |
| **POP3** | **TCP 110** | Klartext-Mail-Abruf | **POP3S** | **995** |
| **IMAP** | **TCP 143** | Klartext | **IMAPS** | **993** |
| **SMTP** | **TCP 25** | Klartext-Versand | SMTP mit **STARTTLS** / **SMTPS** | **587** / **465** |
| **SNMP v1/v2c** | **UDP 161/162** | Community-String im Klartext | **SNMPv3** (Authentifizierung + Verschlüsselung) | 161/162 |
| **LDAP** | **TCP 389** | Klartext, Relay möglich | **LDAPS** oder **StartTLS** mit **LDAP-Signing/Channel Binding** | **636** |
| **Syslog (UDP)** | **UDP 514** | Klartext, unzuverlässig | **Syslog über TLS** | **6514** |
| **VNC (alt)/RDP ohne NLA** | 5900 / 3389 | Schwache Auth., Mitlesen | RDP mit **NLA + TLS**, VNC nur über SSH-Tunnel/VPN | – |
| **DNS (klassisch)** | **UDP/TCP 53** | Klartext, Spoofing | **DoT** (853), **DoH** (443), **DNSSEC** (Integrität) | – |

### Wie erkennt man Klartext?
- **Portscan** (`nmap`), **Firewall-Logs**, **Netflow**.
- **Wireshark**: Filter `telnet`, `ftp`, `http.authorization`, `snmp`.
- **Konfigurationsaudit** (z. B. auf Switches: `show running-config \| include telnet`).

### Was ist mit SNMP?
**SNMP** (*Simple Network Management Protocol*) überwacht Netzgeräte. **v1/v2c** authentisieren nur über den **Community String** (Standard **public/private**, im Klartext). **SNMPv3** bietet **Benutzer (USM)**, **Authentifizierung (MD5 → SHA)** und **Verschlüsselung (DES → AES)**. Sicherheitsstufen: **noAuthNoPriv**, **authNoPriv**, **authPriv** (Empfehlung).

### Cisco-IOS-Härtung (Beispiel)
```
! Auf dem Switch SW1 – Telnet aus, nur SSH
hostname SW1
ip domain-name firma.local
crypto key generate rsa modulus 2048
ip ssh version 2
username admin privilege 15 secret Geheim#2026
line vty 0 15
 login local
 transport input ssh
 exec-timeout 5 0
!
! HTTP-Server aus, HTTPS an
no ip http server
ip http secure-server
!
! SNMPv3 statt v2c
snmp-server group MONITOR v3 priv
snmp-server user nagios MONITOR v3 auth sha AuthPass#1 priv aes 128 PrivPass#1
```

### Windows-Seite
- **Telnet-Client** ist ein optionales Feature (nicht installiert lassen).
- **IIS**: HTTP → HTTPS umleiten (**URL Rewrite**, HSTS).
- **IIS-FTP** nur mit **SSL erforderlich** (FTPS).

## Lab
**Maschinen**: **SW1** (Cisco-Switch), **SRV01** (IIS), **CL01** (Wireshark).

### GUI
1. **CL01**: **Wireshark** starten → Netzwerkkarte wählen → Filter `http` → über HTTP eine Seite auf SRV01 aufrufen: Kennwort im **Klartext** (Base64) sichtbar.
2. **SRV01**: **IIS-Manager** → Site → Bindungen → **https** hinzufügen (Zertifikat wählen).
3. **SRV01**: Site → **SSL-Einstellungen** → **SSL erforderlich** aktivieren.
4. **CL01**: Wireshark erneut: nur noch **TLS**-Pakete, Inhalt nicht lesbar.
5. **SW1**: Telnet gegen SSH tauschen (CLI oben).
6. **CL01**: `ssh admin@192.168.10.2` testen, `telnet 192.168.10.2` scheitert.

### PowerShell
```powershell
# Auf CL01 – Ports prüfen, ob Klartextdienste offen sind
Test-NetConnection -ComputerName 192.168.10.2 -Port 23
Test-NetConnection -ComputerName 192.168.10.2 -Port 22

# Auf CL01 – Telnet-Client entfernen (falls installiert)
Disable-WindowsOptionalFeature -Online -FeatureName TelnetClient -NoRestart

# Auf SRV01 – HTTP nach HTTPS erzwingen (Bindung prüfen)
Import-Module WebAdministration
Get-WebBinding -Name "Default Web Site"
```

## Einfach

Klartext-Protokolle sind wie **Postkarten**: Jeder Briefträger, Nachbar und Postbote **kann mitlesen**, was draufsteht: auch dein **Passwort**.

**Sichere Protokolle** sind wie **Briefe im verschlossenen Umschlag**: Der Inhalt bleibt privat.

| Postkarte (alt) | Brief im Umschlag (neu) |
|---|---|
| Telnet | SSH |
| FTP | SFTP / FTPS |
| HTTP | HTTPS |
| SNMPv2c | SNMPv3 |

Die Zahl (Port) ist die **Hausnummer des Briefkastens**: Telnet wohnt in Nr. 23, SSH in Nr. 22, HTTP in 80, HTTPS in 443.

Im Netz sitzt manchmal einer mit einem **Fernglas** (Wireshark) und liest die Postkarten. Das ist nicht magisch, er muss nur **in der Nähe** sein: im selben WLAN, oder an einem Switch-Port, der alles spiegelt.

Merke: **Alles, was ein „S“ dazubekommen hat (SSH, SFTP, HTTPS, IMAPS), ist die sichere Version** – aber Vorsicht: **FTPS ≠ SFTP** (das eine ist FTP mit Umschlag, das andere ist ganz ein anderes Programm über SSH).

## Merksatz
- **Telnet 23 → SSH 22**, **HTTP 80 → HTTPS 443**.
- **FTP 21 → SFTP 22 / FTPS 990**.
- **POP3 110/IMAP 143 → 995/993**.
- **SNMPv3 authPriv** = Login **und** Verschlüsselung.
- **LDAP 389 → LDAPS 636**.
- **FTPS ≠ SFTP**.

## Prüfungsfalle
- **SFTP** nutzt **SSH (Port 22)**, **FTPS** nutzt **TLS (Port 990 oder 21+STARTTLS)**.
- **SNMPv2c** ist trotz „Community“ **nicht** sicher, nur **v3** ist es.
- **Port 587** ist SMTP Submission (mit STARTTLS), **465** SMTPS.
- **TFTP** hat **keine Anmeldung**: nur im isolierten Netz, z. B. PXE-Boot.
- HTTPS **verschlüsselt** den Inhalt, verbirgt aber **nicht** den Zielserver (IP/SNI).

## Grafik
### Postkarte gegen Brief
Ein Datenpaket fährt durch ein Netz; im Klartextmodus liest ein Fernglas-Angreifer das Passwort mit; im TLS-Modus bekommt das Paket einen Umschlag und der Angreifer sieht nur Kauderwelsch.

### Port-Tabelle interaktiv
Klick auf ein altes Protokoll (Telnet, FTP, HTTP …) blendet den Nachfolger und dessen Port ein und tauscht das Schloss-Symbol.

## Karteikarten
- F: Port und Ersatz von Telnet? | A: TCP 23, ersetzt durch SSH (TCP 22).
- F: Port von FTP und sicherer Ersatz? | A: TCP 21 (Daten 20), SFTP (22) oder FTPS (990).
- F: Was ist der Unterschied SFTP/FTPS? | A: SFTP läuft über SSH, FTPS ist FTP mit TLS.
- F: Ports von HTTP und HTTPS? | A: 80 und 443.
- F: Ports von POP3/IMAP und ihren sicheren Formen? | A: 110/143 und 995/993.
- F: Was ist SNMPv3 authPriv? | A: Authentifizierung und Verschlüsselung.
- F: Womit authentifiziert SNMPv2c? | A: Mit einem Community String im Klartext.
- F: Port von LDAPS? | A: TCP 636.
- F: Welcher Port gehört zu TFTP? | A: UDP 69.
- F: Welches Tool schneidet Netzverkehr mit? | A: Wireshark.
- F: Wie erzwingt man auf Cisco nur SSH auf den VTY-Leitungen? | A: `transport input ssh` unter `line vty 0 15`.
- F: Welche DNS-Verfahren sichern Abfragen? | A: DoT (853), DoH (443); DNSSEC schützt die Integrität.

## Quiz
? Welches Protokoll ersetzt Telnet?
* SSH
- FTP
- SNMP
- RDP ohne NLA

? Auf welchem Port läuft HTTPS?
* 443
- 80
- 8443
- 22

? Was authentifiziert SNMPv2c?
* Einen Community String im Klartext
- Ein Benutzerkonto mit AES
- Ein Zertifikat
- Kerberos

? Was unterscheidet SFTP von FTPS?
* SFTP läuft über SSH, FTPS ist FTP mit TLS
- SFTP ist unverschlüsselt
- FTPS läuft über SSH
- Es gibt keinen Unterschied

? Welcher Cisco-Befehl erlaubt nur SSH auf den VTY-Leitungen?
* transport input ssh
- ip ssh only
- login ssh
- no telnet

? Welcher Port gehört zu LDAPS?
* 636
- 389
- 3268
- 88
