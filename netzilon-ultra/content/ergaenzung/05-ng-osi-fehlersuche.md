---
id: erg-osi-fehlersuche
bereich: AP1
block: ERG
kapitel: Ergänzungen 2.2
titel: OSI und TCP/IP angewandt – Kapselung, Ports, TCP-Verbindung und Fehlersuche Schicht für Schicht
stufe: Einsteiger
fach: TCP/IP – CCNA – Basic
pruefungen: [AP1, AP2, CCNA]
quellen: [ISO/IEC 7498-1 (OSI-Referenzmodell), RFC 793/9293 (TCP), RFC 768 (UDP), IHK-Prüfungskatalog FiSi AP1]
verweise: [ap1-a4-netzwerkgrundlagen, ccna-osi-tcpip, ccna-tcp-udp, ref-ports, ref-cmd-tools, az801-netzwerk-troubleshooting]
---

## Profi

### Schichtenmodelle im Vergleich
| OSI-Schicht | Name | TCP/IP-Schicht | PDU | Beispiele | Geräte |
|---|---|---|---|---|---|
| 7 | Anwendung (Application) | Anwendung | Daten | HTTP, DNS, SMTP, SSH | – |
| 6 | Darstellung (Presentation) | Anwendung | Daten | TLS-Verschlüsselung, Zeichensätze | – |
| 5 | Sitzung (Session) | Anwendung | Daten | Sitzungssteuerung, RPC | – |
| 4 | Transport | Transport | **Segment** (TCP) / **Datagramm** (UDP) | TCP, UDP, Ports | Firewall (Port-Filter) |
| 3 | Vermittlung (Network) | Internet | **Paket** | IPv4, IPv6, ICMP | Router, Layer-3-Switch |
| 2 | Sicherung (Data Link) | Netzzugang | **Frame** | Ethernet, WLAN 802.11, MAC, ARP* | Switch, Bridge, AP |
| 1 | Bitübertragung (Physical) | Netzzugang | **Bit** | Kabel, Stecker, Funk, Signale | Hub, Repeater, Medienkonverter |

*ARP verbindet Schicht 2 und 3 und wird je nach Lehrbuch Schicht 2 oder „2,5“ zugeordnet.

### Kapselung (Encapsulation)
Beim Senden fügt jede Schicht ihren **Header** hinzu: Anwendungsdaten → **TCP-Header** (Quell-/Zielport, Sequenznummer) → **IP-Header** (Quell-/Ziel-IP, TTL) → **Ethernet-Header** (Ziel-/Quell-MAC, EtherType) und **Trailer** (FCS-Prüfsumme). Der Empfänger entfernt die Header in umgekehrter Reihenfolge (**Decapsulation**). Ein Router tauscht dabei den **Layer-2-Rahmen** auf jedem Abschnitt aus (neue MAC-Adressen), die **IP-Adressen bleiben** (ohne NAT) gleich, die **TTL** sinkt um 1.

### TCP und UDP
- **TCP**: verbindungsorientiert, **Drei-Wege-Handschlag** (SYN → SYN/ACK → ACK), Sequenz- und Bestätigungsnummern, Neuübertragung, Flusskontrolle (Fenster), geordneter Abbau (FIN/ACK). Für HTTP(S), SMTP, SSH, SMB.
- **UDP**: verbindungslos, kein Handshake, keine Bestätigung, wenig Overhead. Für DNS-Abfragen, DHCP, VoIP/RTP, Streaming, SNMP, Syslog.

Wichtige Ports: 20/21 FTP, 22 SSH, 23 Telnet, 25 SMTP, 53 DNS, 67/68 DHCP, 80 HTTP, 110 POP3, 123 NTP, 143 IMAP, 161/162 SNMP, 389 LDAP, 443 HTTPS, 445 SMB, 514 Syslog, 587 SMTP-Submission, 636 LDAPS, 993 IMAPS, 3389 RDP.

### Fehlersuche nach Schichten (Bottom-up)
1. **Schicht 1**: Link-LED, Kabel, Patchfeld, WLAN-Signal – `Get-NetAdapter` (Status „Up“?).
2. **Schicht 2**: richtiges VLAN, MAC in der Switch-Tabelle, ARP-Eintrag – `arp -a`.
3. **Schicht 3**: IP, Maske, Gateway korrekt? APIPA 169.254.x.x = kein DHCP – `ipconfig /all`, `ping` Gateway, `tracert`.
4. **Schicht 4**: Port erreichbar, Firewall – `Test-NetConnection server -Port 443`, `netstat -ano`.
5. **Schicht 7**: Dienst läuft, DNS-Auflösung, Zertifikat – `nslookup`, Browser-Fehlermeldung, Dienststatus.
Alternativ **Top-down** (bei Anwendungsfehlern) oder **Divide and Conquer** (Start in der Mitte mit `ping`).

## Einfach
Stell dir vor, du schickst ein **Geschenk** per Post. Du packst es ein, schreibst einen Zettel dazu, steckst alles in einen Karton, klebst eine Adresse darauf, und der Paketdienst bringt es mit dem Lastwagen zum Ziel. Beim Empfänger wird alles in umgekehrter Reihenfolge ausgepackt.

Genauso macht es der Computer mit Daten. Jede **Schicht** packt eine Hülle darum:
- Die **Anwendung** (z. B. der Browser) schreibt den Brief.
- Die **Transportschicht** schreibt die **Zimmernummer** dazu – das ist der **Port**. Port 443 heißt: „Bitte zum Webserver-Zimmer.“
- Die **Vermittlungsschicht** schreibt die **Hausadresse** – das ist die **IP-Adresse**.
- Die **Sicherungsschicht** klebt den **Aufkleber für die nächste Station** auf – die **MAC-Adresse**. Den wechselt jeder Router, wie ein Paketzentrum, das einen neuen Aufkleber für den nächsten Lastwagen druckt.
- Die **Bitübertragung** ist die Straße: Kabel oder Funk.

**TCP** ist wie ein **Einschreiben**: Man klingelt erst (Handschlag), bekommt eine Bestätigung, und wenn etwas verloren geht, wird es noch mal geschickt. **UDP** ist wie eine **Postkarte**: schnell eingeworfen, aber ohne Garantie.

Wenn das Internet nicht geht, suchst du den Fehler **von unten nach oben**: Steckt das Kabel? Leuchtet die Lampe? Hat der PC eine Adresse? Erreicht er den Router? Funktioniert die Namensauflösung? So findest du den Fehler, ohne wild herumzuprobieren.

## Merksatz
- **„Alle Deutschen Schüler Trinken Verschiedene Sorten Bier“** – Schicht 7 bis 1.
- **Bit – Frame – Paket – Segment – Daten** (von unten nach oben).
- **MAC wechselt je Abschnitt, IP bleibt, TTL sinkt.**
- **SYN – SYN/ACK – ACK.**
- **Bei Störungen: von unten nach oben.**

## Prüfungsfalle
- Ein **Switch** arbeitet (klassisch) auf **Schicht 2**, ein **Router** auf **Schicht 3** – ein Hub auf Schicht 1.
- **DNS** nutzt für Abfragen meist **UDP 53**, für Zonentransfers und große Antworten **TCP 53**.
- **ping** funktioniert, aber die Webseite nicht → Fehler oberhalb von Schicht 3 suchen (Port, Firewall, DNS, Dienst).
- **169.254.x.x** ist kein Netzwerkfehler auf Schicht 1, sondern fehlender DHCP-Server (APIPA).
- Die MAC-Adresse des Ziels im Internet steht **nicht** im eigenen Frame – dort steht die MAC des **Gateways**.

## Grafik
### Kapselung beim Senden
1. Browser: Erzeugt HTTP-Anfrage (Schicht 7)
2. TCP: Fügt Ports 50123 → 443 hinzu (Segment)
3. IP: Fügt Quell- und Ziel-IP hinzu (Paket)
4. Ethernet: Fügt MAC des Gateways und FCS hinzu (Frame)
5. Client -> Switch: Bits über das Kabel
6. Switch -> Router: Frame anhand der Ziel-MAC weiterleiten
7. Router: Entfernt Frame, prüft Ziel-IP, senkt TTL, baut neuen Frame

### Drei-Wege-Handschlag
1. Client -> Server: SYN (Seq = x)
2. Server -> Client: SYN/ACK (Seq = y, Ack = x+1)
3. Client -> Server: ACK (Ack = y+1)
4. Client -> Server: Daten

## Lab
**Maschinen**: Windows-11-Client **CL01** und Server **SRV01** (Windows Server 2025, Webserver IIS) im Heimlabor **example.com**.

### GUI
1. **CL01**: Einstellungen → Netzwerk und Internet → Ethernet → Hardwareeigenschaften: IP, Gateway, DNS ablesen.
2. **CL01**: Ressourcenmonitor (`resmon`) → Netzwerk → TCP-Verbindungen: Ports zu SRV01 beobachten, während im Browser `http://srv01.example.com` geöffnet wird.
3. **SRV01**: Windows Defender Firewall mit erweiterter Sicherheit → Eingehende Regeln → „WWW-Dienste (HTTP eingehend)“ prüfen.

### PowerShell
```powershell
# Auf CL01
Get-NetAdapter | Select-Object Name, Status, LinkSpeed          # Schicht 1
Get-NetNeighbor -AddressFamily IPv4 | Select-Object -First 5    # Schicht 2 (ARP)
Get-NetIPConfiguration                                          # Schicht 3
Test-NetConnection srv01.example.com -TraceRoute                # Schicht 3
Test-NetConnection srv01.example.com -Port 80                   # Schicht 4
Resolve-DnsName srv01.example.com                               # Schicht 7 (DNS)
Get-NetTCPConnection -State Established | Select-Object -First 10
```

## Legende
### Kapselung (Encapsulation)
- Was: Das schichtweise Hinzufügen von Steuerinformationen (Headern) zu den Nutzdaten.
- Wie: Jede Schicht verpackt die PDU der darüberliegenden Schicht und fügt eigene Adressen/Steuerdaten hinzu.
- Wann: Bei jedem Senden; beim Empfang läuft die Entkapselung.
- Wo: Im Protokollstapel jedes Hosts; Router entkapseln bis Schicht 3.
- Warum: Schichten bleiben unabhängig und austauschbar (z. B. WLAN statt Ethernet).

### Bottom-up-Fehlersuche
- Was: Systematische Störungssuche von Schicht 1 aufwärts.
- Wie: Physik prüfen, dann Link/VLAN, dann IP/Gateway, dann Port, dann Anwendung.
- Wann: Bei „geht gar nichts“-Fehlern oder unklarer Ursache.
- Wo: Support, Netzwerkadministration, IHK-Fehleranalyseaufgaben.
- Warum: Verhindert planloses Probieren; jede Stufe baut auf der darunter auf.

## Karteikarten
- F: Nennen Sie die sieben OSI-Schichten von unten nach oben. | A: Bitübertragung, Sicherung, Vermittlung, Transport, Sitzung, Darstellung, Anwendung.
- F: Wie heißt die PDU auf Schicht 2, 3 und 4? | A: Frame, Paket, Segment (TCP) bzw. Datagramm (UDP).
- F: Was ändert ein Router beim Weiterleiten eines Pakets? | A: Neuer Layer-2-Rahmen mit neuen MAC-Adressen, TTL/Hop Limit −1, Prüfsumme neu; IP-Adressen bleiben (ohne NAT).
- F: Beschreiben Sie den TCP-Drei-Wege-Handschlag. | A: SYN vom Client, SYN/ACK vom Server, ACK vom Client – danach ist die Verbindung aufgebaut.
- F: Nennen Sie zwei Anwendungen, die UDP nutzen. | A: DNS-Abfragen, DHCP, VoIP (RTP), SNMP, Syslog, Streaming.
- F: Auf welcher Schicht arbeitet ein klassischer Switch? | A: Schicht 2 (Sicherungsschicht), er wertet MAC-Adressen aus.
- F: Was bedeutet eine Adresse 169.254.x.x am Client? | A: APIPA – der Client hat keine Antwort von einem DHCP-Server bekommen.
- F: Welcher PowerShell-Befehl prüft, ob ein TCP-Port erreichbar ist? | A: Test-NetConnection ziel -Port nummer.
- F: Welche Ports nutzen HTTPS, SSH, RDP und SMB? | A: 443, 22, 3389, 445 (alle TCP).
- F: Was ist die Bottom-up-Methode? | A: Fehlersuche beginnend bei Schicht 1 (Kabel, Link) bis zur Anwendung.

## Quiz
? Auf welcher OSI-Schicht arbeitet ein Router?
* Schicht 3 – Vermittlung
- Schicht 1 – Bitübertragung
- Schicht 2 – Sicherung
- Schicht 4 – Transport
! Router entscheiden anhand der IP-Adresse.

? Welche Flags kennzeichnen den ersten Schritt des TCP-Verbindungsaufbaus?
* SYN
- ACK
- FIN
- RST
! Darauf folgen SYN/ACK und ACK.

? Welche Information ändert sich beim Weiterleiten durch einen Router (ohne NAT) NICHT?
* Die Ziel-IP-Adresse
- Die Ziel-MAC-Adresse
- Die TTL
- Die Quell-MAC-Adresse
! IP-Adressen bleiben Ende-zu-Ende gleich, MAC-Adressen gelten nur im jeweiligen Abschnitt.

? Ein Client erreicht per ping das Gateway und Server, aber die Webseite lädt nicht. Wo suchen Sie zuerst?
* Ab Schicht 4 aufwärts – Port, Firewall, Dienst, DNS
- Kabel tauschen
- Netzwerkkarte neu installieren
- Switch neu starten
! Erfolgreicher ping beweist funktionierende Schichten 1 bis 3.

? Welches Protokoll arbeitet verbindungslos?
* UDP
- TCP
- SSH
- HTTPS
! UDP verzichtet auf Handshake und Bestätigungen.

? Welchen Port nutzt RDP standardmäßig?
* 3389
- 22
- 445
- 8080
! Remote Desktop Protocol, TCP (zusätzlich UDP) 3389.

? Wie heißt die PDU der Sicherungsschicht?
* Frame (Rahmen)
- Paket
- Segment
- Bit
! Frames enthalten MAC-Adressen und eine FCS-Prüfsumme.

? Was bedeutet die Adresse 169.254.10.20 auf einem Windows-Client?
* Der Client hat keine DHCP-Adresse erhalten (APIPA).
- Der Client ist eine Loopback-Schnittstelle.
- Es handelt sich um eine öffentliche Adresse.
- Der Client nutzt IPv6.
! APIPA-Adressen stammen aus 169.254.0.0/16.

? Welcher Merksatz beschreibt die OSI-Schichten von 7 bis 1?
* Alle Deutschen Schüler Trinken Verschiedene Sorten Bier
- Please Do Not Throw Sausage Pizza Away
- Kleine Pinguine Rennen Auf Unfallversicherung
- Der Router liest MAC-Adressen
! Anwendung, Darstellung, Sitzung, Transport, Vermittlung, Sicherung, Bitübertragung.

## Lücken
- Die PDU der Transportschicht bei TCP heißt {Segment}.
- Ein Router arbeitet auf OSI-Schicht {3}.
- Der TCP-Verbindungsaufbau heißt {Drei-Wege-Handschlag|Three-Way-Handshake}.
- HTTPS nutzt standardmäßig den Port {443}.
- Beim Weiterleiten verringert der Router die {TTL|Time to Live} um 1.

## Zuordnen
### Gerät und OSI-Schicht
- Hub/Repeater => Schicht 1
- Switch => Schicht 2
- Router => Schicht 3
- Proxy/Application-Gateway => Schicht 7

### Protokoll und Port
- SSH => 22
- DNS => 53
- HTTPS => 443
- SMB => 445
- RDP => 3389

### Fehlerbild und betroffene Schicht
- Link-LED aus => Schicht 1
- Falsches VLAN am Switchport => Schicht 2
- Falsches Standardgateway => Schicht 3
- Firewall blockiert Port 443 => Schicht 4
- DNS-Name wird nicht aufgelöst => Schicht 7

## Reihenfolge
### OSI-Schichten von unten nach oben
1. Bitübertragung
2. Sicherung
3. Vermittlung
4. Transport
5. Sitzung
6. Darstellung
7. Anwendung

### Kapselung beim Senden
1. Anwendungsdaten erzeugen
2. TCP-Header mit Ports anfügen
3. IP-Header mit Adressen anfügen
4. Ethernet-Header und FCS anfügen
5. Bits auf das Medium übertragen

### Bottom-up-Fehlersuche
1. Kabel und Link-LED prüfen
2. VLAN und ARP prüfen
3. IP-Konfiguration und Gateway prüfen
4. Port und Firewall prüfen
5. Dienst und DNS prüfen

## Freitext
- F: Erläutern Sie den Unterschied zwischen TCP und UDP und nennen Sie je zwei Anwendungen. | M: TCP verbindungsorientiert mit Handshake, Bestätigung, Neuübertragung, Reihenfolge (HTTP/S, SSH, SMTP, SMB). UDP verbindungslos, ohne Bestätigung, geringer Overhead (DNS, DHCP, VoIP, Streaming). | P: 6
- F: Beschreiben Sie, welche Adressen sich ändern, wenn ein Paket von einem Client über einen Router zu einem Server im anderen Netz läuft. | M: Quell-/Ziel-IP bleiben gleich (ohne NAT). Im ersten Abschnitt Ziel-MAC = Gateway, Quell-MAC = Client; nach dem Router Quell-MAC = Router, Ziel-MAC = Server. TTL sinkt um 1. | P: 4
- F: Ein Benutzer meldet „Internet geht nicht“. Beschreiben Sie Ihr Vorgehen nach der Bottom-up-Methode mit je einem Prüfschritt pro Schicht 1–4 und 7. | M: S1: Kabel/LED/WLAN; S2: VLAN, ARP; S3: ipconfig, ping Gateway und externe IP; S4: Test-NetConnection Port 443, Firewall/Proxy; S7: nslookup, Browser, Dienst. | P: 5

## Szenario
### Neuer Drucker nicht erreichbar
Ein neu angeschlossener Netzwerkdrucker ist von keinem PC aus erreichbar. Die Link-LED am Drucker leuchtet. Der Drucker zeigt die IP 169.254.33.7.
- F: Welche Schichten funktionieren offensichtlich? | A: Schicht 1 (Link) und vermutlich Schicht 2. | P: 1
- F: Was ist die Ursache und wie beheben Sie sie? | A: Kein DHCP (APIPA): DHCP-Server/-Relay, VLAN am Port prüfen oder statische IP bzw. Reservierung vergeben. | P: 3

### Webshop langsam und Abbrüche
Kunden melden, dass ein Webshop sporadisch abbricht. ping zum Server zeigt 0 % Verlust, aber Test-NetConnection auf Port 443 schlägt manchmal fehl.
- F: Auf welcher Schicht liegt das Problem wahrscheinlich? | A: Ab Schicht 4 aufwärts – z. B. Firewall/Load Balancer, Verbindungslimits, Dienst auf dem Server. | P: 2
- F: Welche Hilfsmittel setzen Sie ein? | A: Ereignisprotokoll/Logs des Webservers, Firewall-Logs, netstat/Get-NetTCPConnection, Wireshark-Mitschnitt (SYN ohne SYN/ACK?). | P: 3

### Paketmitschnitt deuten
In Wireshark sehen Sie vom Client wiederholt SYN-Pakete an 10.0.5.20:445, aber keine Antwort.
- F: Was bedeutet das? | A: Der TCP-Verbindungsaufbau zu SMB scheitert: Server antwortet nicht – Dienst aus, Firewall verwirft oder Routing zurück fehlt. | P: 3
- F: Welche Antwort käme, wenn der Port geschlossen, der Host aber erreichbar wäre? | A: Ein RST (Reset) vom Server. | P: 1
