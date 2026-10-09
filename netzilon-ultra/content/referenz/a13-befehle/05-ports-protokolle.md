---
id: ref-ports
bereich: Referenz
block: A13
kapitel: Referenz
titel: Ports und Protokolle im Überblick
stufe: Einsteiger
typ: referenz
quellen: [Eigene Zusammenstellung, IANA-Portlisten]
verweise: [ap1-a4-netzwerkgrundlagen, ap1-a5-firewall, legacy-klartextprotokolle, az800-adds-dc]
---

## Profi

Ein **Port** (16 Bit, 0–65535) legt fest, **welcher Dienst** auf einem Rechner angesprochen wird. Es gibt **Well-Known Ports (0–1023)**, **Registered Ports (1024–49151)** und **dynamische/private Ports (49152–65535)**. **TCP** ist verbindungsorientiert und zuverlässig (Dreiwege-Handshake SYN – SYN/ACK – ACK), **UDP** ist verbindungslos und schnell (DNS-Abfragen, DHCP, VoIP, Streaming).

Für **Firewallregeln** gilt: **so wenig Ports wie nötig** öffnen, **Klartextprotokolle** durch **TLS/SSH**-Varianten ersetzen. Windows-AD-Umgebungen brauchen gleichzeitig **53 (DNS), 88 (Kerberos), 135 (RPC), 389 (LDAP), 445 (SMB)** und die dynamischen RPC-Ports; für den **Globalen Katalog 3268/3269**.

## Einfach

Ein Computer ist wie ein **großes Bürogebäude mit vielen Türen**. Die **IP-Adresse** ist die **Hausnummer**, der **Port** ist die **Zimmernummer**. Wenn du eine Webseite besuchst, klopfst du an **Zimmer 443** (HTTPS). Für E-Mail klopfst du an **993**, und wenn du einen anderen Computer fernwarten willst, an **22** (SSH) oder **3389** (RDP). Damit niemand unerlaubt reinkommt, sperrt die **Firewall** alle Türen ab, die du nicht brauchst.

## Merksatz
- **22 SSH, 23 Telnet, 25 SMTP, 53 DNS, 80 HTTP, 443 HTTPS**.
- **67/68 DHCP, 69 TFTP, 88 Kerberos, 110 POP3, 123 NTP**.
- **135 RPC, 137-139 NetBIOS, 143 IMAP, 161/162 SNMP**.
- **389 LDAP, 445 SMB, 636 LDAPS, 3389 RDP**.
- **993 IMAPS, 995 POP3S, 3268/3269 GC**.

## Prüfungsfalle
- **SFTP** nutzt **22** (SSH), **FTPS** nutzt **990** bzw. 21 mit STARTTLS.
- **DNS** nutzt **UDP** für Abfragen und **TCP** für Zonenübertragung/große Antworten.
- **SSTP** nutzt **TCP 443**, nicht UDP.
- **LDAP 389** ist unverschlüsselt, **LDAPS 636** verschlüsselt.
- **PPTP** braucht zusätzlich **GRE (Protokoll 47)**, keinen Port.

## Grafik

### Bürogebäude
Ein Gebäude mit Türschildern (Portnummern); Klick auf einen Dienst (z. B. „HTTPS“) lässt die passende Tür aufleuchten. Ein Schalter „Firewall“ schließt alle nicht benötigten Türen.

## Befehle

### Datenübertragung und Fernzugriff
- `FTP` – TCP 21 (Steuerung), TCP 20 (Daten)
- `SSH / SFTP / SCP` – TCP 22
- `Telnet` – TCP 23 (Klartext, Legacy)
- `TFTP` – UDP 69
- `RDP (Remotedesktop)` – TCP und UDP 3389
- `VNC` – TCP 5900
- `WinRM (PowerShell-Remoting)` – TCP 5985 (HTTP), TCP 5986 (HTTPS)
- `SMB (Dateifreigaben)` – TCP 445
- `NFS` – TCP/UDP 2049

### Web und Mail
- `HTTP` – TCP 80
- `HTTPS` – TCP 443
- `SMTP (Server zu Server)` – TCP 25
- `SMTP Submission (Client, STARTTLS)` – TCP 587
- `SMTPS` – TCP 465
- `POP3` – TCP 110
- `POP3S` – TCP 995
- `IMAP` – TCP 143
- `IMAPS` – TCP 993

### Namen, Adressen, Zeit
- `DNS` – UDP und TCP 53
- `DNS über TLS (DoT)` – TCP 853
- `DHCP Server / Client` – UDP 67 (Server), UDP 68 (Client)
- `NTP` – UDP 123
- `NetBIOS Name / Datagramm / Sitzung` – UDP 137 / UDP 138 / TCP 139
- `mDNS` – UDP 5353
- `LLMNR` – UDP 5355

### Verzeichnis und Anmeldung
- `Kerberos` – TCP und UDP 88
- `Kerberos Kennwortänderung` – TCP und UDP 464
- `LDAP` – TCP und UDP 389
- `LDAPS` – TCP 636
- `Globaler Katalog (LDAP)` – TCP 3268
- `Globaler Katalog (LDAPS)` – TCP 3269
- `RPC Endpunktzuordnung` – TCP 135
- `RADIUS (Authentifizierung / Abrechnung)` – UDP 1812 / UDP 1813
- `Syslog` – UDP 514
- `SNMP (Abfrage / Traps)` – UDP 161 / UDP 162

### VPN und Datenbanken
- `IKE (IPsec)` – UDP 500
- `IPsec NAT-T` – UDP 4500
- `L2TP` – UDP 1701
- `PPTP` – TCP 1723 plus GRE (IP-Protokoll 47)
- `SSTP` – TCP 443
- `OpenVPN` – UDP 1194
- `WireGuard` – UDP 51820 (Standard, frei wählbar)
- `Microsoft SQL Server` – TCP 1433
- `MySQL / MariaDB` – TCP 3306
- `PostgreSQL` – TCP 5432
- `SIP (VoIP)` – UDP/TCP 5060

## Karteikarten
- F: Welcher Port gehört zu FTP? | A: TCP 21 (Steuerung), TCP 20 (Daten)
- F: Welcher Port gehört zu SSH / SFTP / SCP? | A: TCP 22
- F: Welcher Port gehört zu Telnet? | A: TCP 23 (Klartext, Legacy)
- F: Welcher Port gehört zu TFTP? | A: UDP 69
- F: Welcher Port gehört zu RDP (Remotedesktop)? | A: TCP und UDP 3389
- F: Welcher Port gehört zu VNC? | A: TCP 5900
- F: Welcher Port gehört zu WinRM (PowerShell-Remoting)? | A: TCP 5985 (HTTP), TCP 5986 (HTTPS)
- F: Welcher Port gehört zu SMB (Dateifreigaben)? | A: TCP 445
- F: Welcher Port gehört zu NFS? | A: TCP/UDP 2049
- F: Welcher Port gehört zu HTTP? | A: TCP 80
- F: Welcher Port gehört zu HTTPS? | A: TCP 443
- F: Welcher Port gehört zu SMTP (Server zu Server)? | A: TCP 25
- F: Welcher Port gehört zu SMTP Submission (Client, STARTTLS)? | A: TCP 587
- F: Welcher Port gehört zu SMTPS? | A: TCP 465
- F: Welcher Port gehört zu POP3? | A: TCP 110
- F: Welcher Port gehört zu POP3S? | A: TCP 995
- F: Welcher Port gehört zu IMAP? | A: TCP 143
- F: Welcher Port gehört zu IMAPS? | A: TCP 993
- F: Welcher Port gehört zu DNS? | A: UDP und TCP 53
- F: Welcher Port gehört zu DNS über TLS (DoT)? | A: TCP 853
- F: Welcher Port gehört zu DHCP Server / Client? | A: UDP 67 (Server), UDP 68 (Client)
- F: Welcher Port gehört zu NTP? | A: UDP 123
- F: Welcher Port gehört zu NetBIOS Name / Datagramm / Sitzung? | A: UDP 137 / UDP 138 / TCP 139
- F: Welcher Port gehört zu mDNS? | A: UDP 5353
- F: Welcher Port gehört zu LLMNR? | A: UDP 5355
- F: Welcher Port gehört zu Kerberos? | A: TCP und UDP 88
- F: Welcher Port gehört zu Kerberos Kennwortänderung? | A: TCP und UDP 464
- F: Welcher Port gehört zu LDAP? | A: TCP und UDP 389
- F: Welcher Port gehört zu LDAPS? | A: TCP 636
- F: Welcher Port gehört zu Globaler Katalog (LDAP)? | A: TCP 3268
- F: Welcher Port gehört zu Globaler Katalog (LDAPS)? | A: TCP 3269
- F: Welcher Port gehört zu RPC Endpunktzuordnung? | A: TCP 135
- F: Welcher Port gehört zu RADIUS (Authentifizierung / Abrechnung)? | A: UDP 1812 / UDP 1813
- F: Welcher Port gehört zu Syslog? | A: UDP 514
- F: Welcher Port gehört zu SNMP (Abfrage / Traps)? | A: UDP 161 / UDP 162
- F: Welcher Port gehört zu IKE (IPsec)? | A: UDP 500
- F: Welcher Port gehört zu IPsec NAT-T? | A: UDP 4500
- F: Welcher Port gehört zu L2TP? | A: UDP 1701
- F: Welcher Port gehört zu PPTP? | A: TCP 1723 plus GRE (IP-Protokoll 47)
- F: Welcher Port gehört zu SSTP? | A: TCP 443
- F: Welcher Port gehört zu OpenVPN? | A: UDP 1194
- F: Welcher Port gehört zu WireGuard? | A: UDP 51820 (Standard, frei wählbar)
- F: Welcher Port gehört zu Microsoft SQL Server? | A: TCP 1433
- F: Welcher Port gehört zu MySQL / MariaDB? | A: TCP 3306
- F: Welcher Port gehört zu PostgreSQL? | A: TCP 5432
- F: Welcher Port gehört zu SIP (VoIP)? | A: UDP/TCP 5060

## Quiz

? Welcher Port gehört zu OpenVPN?
* UDP 1194
- UDP 67 (Server), UDP 68 (Client)
- TCP 135
- TCP 22

? Welcher Port gehört zu RADIUS (Authentifizierung / Abrechnung)?
* UDP 1812 / UDP 1813
- TCP 445
- UDP 5353
- TCP 853

? Welcher Port gehört zu PPTP?
* TCP 1723 plus GRE (IP-Protokoll 47)
- TCP 995
- UDP 69
- TCP 5900

? Welcher Port gehört zu SMTP Submission (Client, STARTTLS)?
* TCP 587
- TCP 5900
- UDP 1194
- TCP und UDP 3389

? Welcher Port gehört zu HTTP?
* TCP 80
- TCP 3306
- TCP/UDP 2049
- TCP 443

? Welcher Port gehört zu mDNS?
* UDP 5353
- TCP 1433
- TCP 443
- TCP 143

? Welcher Port gehört zu HTTPS?
* TCP 443
- TCP 3306
- UDP 4500
- UDP 137 / UDP 138 / TCP 139

? Welcher Port gehört zu SNMP (Abfrage / Traps)?
* UDP 161 / UDP 162
- TCP 5432
- TCP 587
- TCP 853

? Welcher Port gehört zu Syslog?
* UDP 514
- UDP 500
- UDP 5353
- TCP 1723 plus GRE (IP-Protokoll 47)

? Welcher Port gehört zu FTP?
* TCP 21 (Steuerung), TCP 20 (Daten)
- TCP 1433
- UDP 1701
- TCP 143
