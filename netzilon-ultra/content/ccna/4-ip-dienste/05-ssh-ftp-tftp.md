---
id: ccna-ssh-ftp-tftp
bereich: CCNA
block: CCNA 4.8 / 5.x
kapitel: IP Services
titel: SSH, Telnet, FTP, TFTP – Fernzugriff und Dateiübertragung am Cisco-Gerät
stufe: Fortgeschritten
fach: TCP/IP – CCNA – Basic
pruefungen: [CCNA, AP1, AP2]
quellen: [CCNA_200-301_Notes_-_Jeremys_IT_Lab.pdf, 200_301_CCNA_v1.0_2.pdf, Well-known Ports.md, 1.19_Grundlagen_der_IT_-_Kodierung_und_Verschl_sselung.pdf]
verweise: [ccna-cli-grundlagen, ccna-security-grundlagen, ccna-tcp-udp, ccna-ntp-snmp-syslog]
---

## Profi

### Fernzugriff
| Protokoll | Port | Eigenschaft |
|---|---|---|
| **Telnet** | TCP 23 | Klartext (auch Passwörter) – **unsicher/Legacy** |
| **SSH** | TCP 22 | verschlüsselt, Authentifizierung per Passwort oder Public Key; **v2** Pflicht |
| **HTTP / HTTPS** | 80 / 443 | Web-GUI; HTTPS verschlüsselt |
| **Console / AUX** | – | lokaler Zugang |

### SSH auf Cisco-Gerät einrichten
Voraussetzungen: Hostname und Domänenname, RSA-Schlüssel (≥ 2048 Bit), lokaler Benutzer, VTY-Konfiguration.
```
hostname R1
ip domain-name exa.local
crypto key generate rsa modulus 2048
ip ssh version 2
username admin secret Lab#Pass1
line vty 0 15
 login local
 transport input ssh
 exec-timeout 5 0
```
Management-IP (Switch): `interface vlan 99` / `ip address …`, `ip default-gateway …`. Passwörter: `enable secret` (gehasht, bevorzugt) statt `enable password`; `service password-encryption` (nur schwache Typ-7-Verschleierung). `banner motd #Nur autorisierter Zugriff#`. Kontrolle: `show ip ssh`, `show ssh`, `show users`.

### Dateiübertragung
- **FTP** (TCP 20 Daten / 21 Steuerung; aktiv/passiv), Klartext, Authentifizierung.
- **SFTP** (über SSH, TCP 22) und **FTPS** (FTP + TLS) verschlüsselt.
- **TFTP** (UDP **69**): minimal, keine Authentifizierung, kein Verzeichnis; typisch für Konfigurations-/IOS-Backup im Labor und PXE. Blockgröße 512 Byte, Bestätigung pro Block.
Backup: `copy running-config tftp:`, `copy startup-config flash:`, `copy tftp: running-config`; IOS-Update: `copy tftp: flash:`; `show flash:`, `verify /md5 flash:image.bin`.

### Weitere Management-Dienste
HTTP/HTTPS-Server (`ip http secure-server`), **Telnet/SSH-ACL** über `access-class 10 in` an der VTY, **CDP/LLDP** abschalten, `no ip domain-lookup`, `logging synchronous`.

## Einfach

Ein Router oder Switch steht meist in einem Serverraum. Du willst ihn aber von deinem Schreibtisch aus bedienen. Dafür gibt es zwei „Fernbedienungen“:
- **Telnet** – wie ein **Gespräch auf dem Marktplatz**: Alles, was du sagst, kann jeder mithören, auch dein Passwort.
- **SSH** – wie ein **Gespräch in einem abgeschlossenen Raum**: Niemand kann mithören. Dafür braucht das Gerät einen eigenen Schlüssel (RSA), und du brauchst ein Benutzerkonto.

Heute nimmt man immer SSH. Beim Einrichten muss der Router wissen, wie er heißt (hostname) und zu welcher Domäne er gehört (ip domain-name), sonst kann er keinen Schlüssel erzeugen. Dann sagst du den virtuellen Telefonleitungen (VTY): „Nur SSH, nur mit Benutzername.“

Für **Dateien** gibt es drei Boten:
- **FTP**: ein zuverlässiger Bote, der aber alles offen trägt.
- **SFTP/FTPS**: derselbe Bote, aber mit verschlossener Tasche.
- **TFTP**: ein sehr einfacher Postbote, der keine Fragen stellt und keinen Ausweis verlangt. Perfekt im Labor, um die Konfiguration eines Routers zu sichern – im produktiven Netz aber riskant.

Eine Sicherung der Konfiguration ist wie ein Foto vom aufgeräumten Zimmer: Wenn alles im Chaos endet, stellst du es danach wieder her.

## Merksatz
- **Telnet 23 (Klartext), SSH 22 (verschlüsselt), TFTP UDP 69, FTP 20/21.**
- **SSH braucht: Hostname + Domain + RSA-Key + User + vty `transport input ssh`.**
- **`enable secret` schlägt `enable password`.**
- **running-config → startup-config mit `copy run start`.**

## Prüfungsfalle
- Ohne **Domänenname** lässt sich kein RSA-Schlüssel erzeugen.
- `login local` benötigt einen **lokalen Benutzer**; `login` allein nutzt nur ein vty-Passwort.
- `service password-encryption` ist **keine** sichere Verschlüsselung (Typ 7, umkehrbar).
- TFTP: UDP **69**, FTP-Steuerung TCP **21** (nicht 20!).
- SSH-Version 1 ist unsicher; nur v2 verwenden.
- Beim Kopieren von `tftp:` nach `running-config` wird **gemergt**, nicht ersetzt.
- `transport input ssh` blockiert Telnet auf den VTY-Leitungen.

## Grafik
### SSH-Login
1. PC -> Router: TCP 22 – SSH-Verbindungsaufbau
2. Router -> PC: Server-Hostkey (RSA 2048)
3. PC: Prüft Fingerprint, handelt Sitzungsschlüssel aus
4. PC -> Router: Benutzername + Passwort (verschlüsselt)
5. Router -> PC: Prompt R1> bzw. R1#

### Konfiguration sichern
1. Admin -> Router: copy running-config tftp:
2. Router -> TFTP-Server: Write Request (UDP 69), Datei R1-confg
3. TFTP-Server -> Router: ACK je 512-Byte-Block
4. Text: Datei liegt auf dem Server – Wiederherstellung per copy tftp: running-config

## Lab
**Packet Tracer: PC1 – SW1 – R1, TFTP-Server im LAN**

### Cisco IOS
```
R1(config)# hostname R1
R1(config)# ip domain-name exa.local
R1(config)# crypto key generate rsa modulus 2048
R1(config)# ip ssh version 2
R1(config)# username admin secret Lab#Pass1
R1(config)# line vty 0 15
R1(config-line)# login local
R1(config-line)# transport input ssh
R1(config-line)# exit
R1(config)# enable secret Lab#Enable1
R1# copy running-config tftp:
R1# copy running-config startup-config
```
1. Von PC1: `ssh -l admin 192.168.1.1` (Windows: `ssh admin@192.168.1.1`).
2. Telnet-Versuch scheitert (`transport input ssh`).
3. Konfiguration auf TFTP sichern und im Test löschen (`erase startup-config`, `reload`), dann zurückspielen. (Passwörter nur im Lab, nie echte verwenden.)

## Befehle
- `crypto key generate rsa modulus 2048` – SSH-Schlüssel
- `ip ssh version 2` – SSHv2 erzwingen
- `transport input ssh` – nur SSH auf vty
- `login local` – lokale Benutzerprüfung
- `enable secret X` – gehashtes Enable-Passwort
- `copy running-config tftp:` – Backup
- `show ip ssh` – SSH-Status
- `verify /md5 flash:image.bin` – Image-Integrität

## Übungen
- A: Welche Schritte sind für SSH auf einem Router nötig? | L: Hostname, Domain-Name, RSA-Schlüssel, ip ssh version 2, lokaler Benutzer, line vty mit login local und transport input ssh.
- A: Welche Ports haben Telnet, SSH, TFTP, FTP? | L: 23, 22, UDP 69, 20/21.
- A: Wie sichern Sie die Konfiguration? | L: copy running-config tftp: (oder copy running-config startup-config für lokal).
- A: Warum ist Telnet unsicher? | L: Klartextübertragung inkl. Passwörter.
- A: Unterschied enable password / secret? | L: secret wird gehasht (MD5/SHA), password nur im Klartext oder Typ 7.
- A: Wie beschränken Sie SSH auf das Management-Netz 10.0.99.0/24? | L: access-list 10 permit 10.0.99.0 0.0.0.255 und line vty 0 15 / access-class 10 in.

## Karteikarten
- F: SSH-Port? | A: TCP 22.
- F: Telnet-Port? | A: TCP 23.
- F: TFTP-Port? | A: UDP 69.
- F: FTP-Ports? | A: TCP 21 (Steuerung), TCP 20 (Daten, aktiv).
- F: Voraussetzung für RSA-Key? | A: Hostname und Domain-Name gesetzt.
- F: Befehl für SSHv2? | A: ip ssh version 2
- F: Was bedeutet transport input ssh? | A: Nur SSH auf den vty-Leitungen erlaubt.
- F: Sichereres Passwort für Privilege-Exec? | A: enable secret.
- F: Backup-Befehl? | A: copy running-config tftp:
- F: Was ist SFTP? | A: Dateiübertragung über SSH (TCP 22).

## Quiz
? Welcher Port gehört zu SSH?
* TCP 22
- TCP 23
- TCP 21
- UDP 69
? Welcher Dienst überträgt Daten im Klartext?
* Telnet
- SSH
- SFTP
- HTTPS
? Welches Protokoll nutzt UDP 69?
* TFTP
- FTP
- SNMP
- NTP
? Was ist für den RSA-Key zwingend?
* Domain-Name
- VLAN 99
- OSPF
- NAT
? Welcher Befehl erlaubt nur SSH auf den vty-Leitungen?
* transport input ssh
- login ssh
- ip ssh only
- access-class ssh
? Welcher Befehl speichert die laufende Konfiguration dauerhaft?
* copy running-config startup-config
- write erase
- reload save
- backup config
? Was ist die beste Wahl für Privilege-Exec-Passwort?
* enable secret
- enable password
- password cisco
- service encryption
? FTP-Steuerkanal nutzt…
* TCP 21
- TCP 20
- UDP 21
- TCP 69
? Wofür steht login local?
* Anmeldung mit lokalen Benutzerkonten
- Anmeldung ohne Passwort
- Anmeldung per RADIUS
- Anmeldung nur an der Konsole
