---
id: ihk-lz-sicherheit
bereich: Prüfung
block: IHK
kapitel: Lernzettel-Inhalte
titel: IT-Sicherheit – Schutzziele, Firewall, DMZ, VPN, TLS und Härtung
stufe: Fortgeschritten
fach: PV – AP2
pruefungen: [AP1, AP2]
quellen: [IT-Sicherheit.docx, IT-Sicherheit.pdf, Firewall.docx, Firewall.pdf, VPN.docx, VPN.pdf, Ergänzung Lernzettel.docx, 6._Umsetzen_Integrieren_und_Prüfen_von_Maßnahmen_zur_IT-Sicherheit_und_zum_Datenschutz.pdf, Lernzettel_AP1AP2_2024.pdf]
verweise: [wiso-datenschutz-dsgvo, ihk-lz-protokolle, ihk-lz-dns-email, ihk-fehleranalyse]
---

## Profi

### Schutzziele (CIA)
**Vertraulichkeit**, **Integrität**, **Verfügbarkeit**; ergänzend Authentizität, Nachvollziehbarkeit (Revisionssicherheit), Rechtssicherheit (DSGVO), Prävention.

### TOM
Zutrittskontrolle (Gebäude: Alarmanlage, RFID, Besucheranmeldung), Zugangskontrolle (System: Passwortregeln, Biometrie, MFA), Zugriffskontrolle (Daten: Berechtigungskonzept, Benutzerprofile), Datenträgersicherheit (Verschlüsselung, fachgerechte Entsorgung).

### Firewall
- **Paketfilter (stateless)**: jedes Paket einzeln nach Header (IP, Port, Protokoll).
- **SPI (stateful)**: Verbindungsstatus; Antwortpakete einer intern initiierten Sitzung dürfen dynamisch passieren.
- **NGFW**: Deep Packet Inspection, IPS, Application Control, Benutzeridentifikation, SSL/TLS-Inspection.
- **Regelaufbau**: Aktion (allow/drop), Protokoll (TCP/UDP/ICMP), Richtung (in/out), Quell-/Ziel-Interface und -IP, Port. Standardports: HTTP 80, HTTPS 443, SMTP 25/587, IMAP 143, IMAPS 993, SSH 22, RDP 3389, DNS 53.
- Beispielregel: `allow TCP WAN → DMZ 203.0.113.10:443` (Webserver); Default **deny all**.
- **SSL-Inspection**: Firewall bricht TLS auf (Man-in-the-Middle), prüft, verschlüsselt mit eigenem Zertifikat neu → CA der Firewall muss auf Clients importiert sein (sonst `SEC_ERROR_UNKNOWN_ISSUER`).
- **Sandbox** für Anhänge, **Mail-Filter** (Blacklist, Empfängerzahl).

### DMZ
Isoliertes Subnetz zwischen WAN und LAN für Web-/Mailserver; bei Kompromittierung kein direkter Zugriff aufs LAN; Firewall schirmt von beiden Seiten ab (Dual-Firewall oder drei Interfaces).

### VPN
Gesichertes logisches Netz über das Internet. **End-to-Site** (Remote Access, Homeoffice/Außendienst), **Site-to-Site** (Standorte, permanenter Tunnel). Schutzziele: Vertraulichkeit, Integrität, Authentizität. Protokolle: **IPsec**, **TLS** (1.3 mit Diffie-Hellman → **Forward Secrecy**), **X.509-Zertifikate** (SHA-256, MD5 unsicher). Authentifizierung: Wissen (Passwort), Besitz (Smartcard/Zertifikat), **MFA** (Passwort + OTP). Fehler: Hotspot blockiert Ports; Tunnel steht, aber interne Ressourcen unerreichbar → Routing/VLAN/Firewall; VPN-Gateways mit Hardware-Kryptobeschleunigung. /31 nach RFC 3021 für Tunnelendpunkte.

### Strategien
**Least Privilege**, **Zero Trust**, **Härtung** (Dienste aus, Standardpasswörter ändern, Patch-Management), **Secure Boot + TPM 2.0**, **3-2-1-Backup**, **Air Gap**, RAID 6, USV, **Mitarbeitersensibilisierung** (Phishing, Trojaner), Verschlüsselung (AES symmetrisch, RSA asymmetrisch), Hash (SHA-256), Digitale Signatur.

### Recht
Briefgeheimnis, DSGVO-Meldepflicht bei Datenpannen (72 h), Prüfung des Risikos bei Ransomware.

## Einfach

**Wie sichert man ein Haus?** Genauso wie ein Netzwerk:
- **Zaun und Tor** = Firewall. Sie entscheidet, wer rein darf.
- **Wächter, der sich Gesichter merkt** = SPI. Er weiß: „Der da draußen antwortet auf meine Frage, den lasse ich rein.“
- **Super-Wächter mit Röntgengerät** = NGFW. Er schaut sogar in Koffer (Pakete) und erkennt Gefahren.
- **Empfangsraum im Vorgarten** = DMZ. Besucher (Webserver) bleiben dort, nicht im Wohnzimmer (LAN).
- **Geheimtunnel zur Oma** = VPN. Auch wenn ihr durch fremde Straßen fahrt, kann niemand mitschauen. End-to-Site = du fährst allein zur Oma, Site-to-Site = zwei Häuser haben einen dauerhaften Tunnel.

**Die drei Ziele (CIA):** Geheim halten (Vertraulichkeit), nicht verfälschen (Integrität), erreichbar bleiben (Verfügbarkeit).

**Firewall-Regeln schreiben:** Eine Zeile sagt: erlaubt/verboten, welches Protokoll (TCP), von wo nach wo, welcher Port. Beispiel: „Erlaubt TCP von überall zur DMZ-Webseite Port 443.“ Alles andere verbieten.

**Passwort plus Handy-Code (MFA)** ist wie Schlüssel plus Fingerabdruck. Selbst wenn jemand das Passwort kennt, fehlt ihm der zweite Teil.

**Sicherheitsprinzipien:** Jeder bekommt nur die Schlüssel, die er braucht (Least Privilege). Selbst Mitarbeiter im Haus werden jedes Mal kontrolliert (Zero Trust).

**Backup-Regel 3-2-1:** 3 Kopien, 2 verschiedene Medien (z. B. Platte + Band), 1 Kopie außer Haus. Ein Band im Schrank, das nicht am Netzwerk hängt (Air Gap), kann kein Hacker verschlüsseln.

**Phishing:** Gefälschte Mails. Achte auf Eile, falsche Adressen, komische Links.

## Merksatz
- CIA = Vertraulichkeit, Integrität, Verfügbarkeit.
- Zutritt Gebäude, Zugang System, Zugriff Daten.
- SPI kennt Verbindungen, NGFW kennt Anwendungen.
- DMZ zwischen Internet und LAN.
- End-to-Site = Mensch, Site-to-Site = Standort.
- Default deny.

## Prüfungsfalle
- Paketfilter ≠ SPI ≠ NGFW. Aufgaben fragen nach dem Unterschied.
- SSL-Inspection braucht die Firewall-CA auf dem Client.
- DMZ ist **nicht** das interne LAN.
- MD5 unsicher, SHA-256 sicher.
- MFA = mindestens zwei **verschiedene** Faktoren (Wissen, Besitz, Sein).
- Ports: IMAPS 993, nicht 143. SMTP Submission 587.

## Grafik
### Webzugriff auf DMZ-Server
1. Internet-Client -> Firewall: TCP 443 an Webserver
2. Firewall: Regel WAN nach DMZ, Port 443, erlaubt
3. Firewall -> Webserver (DMZ): Anfrage weitergeleitet
4. Webserver -> Firewall: Antwort
5. Firewall -> Internet-Client: SPI lässt Antwort zu
6. Internet-Client -> Firewall: Versuch auf LAN wird verworfen (drop)

### TLS-Verbindungsaufbau (vereinfacht)
1. Client -> Server: ClientHello (TLS-Version, Ciphers)
2. Server -> Client: ServerHello und Zertifikat
3. Client: Zertifikatskette, Gültigkeit und Name prüfen
4. Client -> Server: Schlüsselaustausch (Diffie-Hellman)
5. Client -> Server: verschlüsselte Daten mit Sitzungsschlüssel

## Spickzettel
- CIA; TOM Zutritt/Zugang/Zugriff
- Paketfilter < SPI < NGFW
- Ports 80, 443, 25, 587, 143, 993, 22, 3389
- DMZ zwischen WAN und LAN
- VPN: E2S, S2S; IPsec/TLS; Forward Secrecy
- Least Privilege, Zero Trust, Härtung, Secure Boot/TPM
- 3-2-1, Air Gap

## Zuordnen
### Firewall-Typ und Fähigkeit
- Paketfilter => prüft Header einzeln
- SPI => verfolgt Verbindungsstatus
- NGFW => Anwendung, IPS, SSL-Inspection
- Sandbox => führt Anhänge isoliert aus
- DMZ => Netz für öffentliche Server

## Freitext
- F: Nennen Sie zwei Unterschiede zwischen SPI-Firewall und NGFW. | M: NGFW: Deep Packet Inspection, Application Control, IPS, SSL-Inspection; SPI nur Verbindungsstatus/Header | P: 2
- F: Erläutern Sie den Zweck einer DMZ. | M: Isolierter Bereich für öffentlich erreichbare Server; bei Kompromittierung kein direkter Zugriff auf das LAN | P: 2
- F: Nennen Sie zwei Faktoren für MFA bei VPN. | M: Passwort (Wissen) und OTP/Authenticator-App oder Smartcard (Besitz) | P: 2

## Karteikarten
- F: Schutzziele? | A: Vertraulichkeit, Integrität, Verfügbarkeit
- F: Zutrittskontrolle? | A: Verhindert physischen Zugang zum Gebäude
- F: Zugangskontrolle? | A: Verhindert Systemnutzung durch Unbefugte
- F: Zugriffskontrolle? | A: Regelt, wer welche Daten lesen/ändern darf
- F: Paketfilter vs. SPI? | A: Einzelpaket nach Header vs. Verbindungsstatus
- F: Was kann eine NGFW zusätzlich? | A: Application Control, IPS, DPI/SSL-Inspection
- F: Zweck einer DMZ? | A: Server für das Internet isolieren, LAN schützen
- F: End-to-Site vs. Site-to-Site? | A: Mobile Clients zur Zentrale vs. feste Standorte
- F: Was ist Forward Secrecy? | A: Neue Sitzungsschlüssel per Diffie-Hellman; alte Sitzungen bleiben sicher
- F: Was ist Least Privilege? | A: Nur minimal nötige Rechte
- F: Was ist Zero Trust? | A: Keine implizite Vertrauensstellung, jede Anfrage prüfen
- F: Was ist die 3-2-1-Regel? | A: 3 Kopien, 2 Medien, 1 extern
- F: Wozu Secure Boot und TPM 2.0? | A: Verhindern das Starten manipulierter Software

## Quiz
? Was prüft eine SPI-Firewall zusätzlich zum reinen Paketfilter?
* Den Zustand der Verbindung
- Den Inhalt der Dateien
- Die Hardware
- Die Stromversorgung

? Welche Funktion hat eine DMZ?
* Isolierte Zone für aus dem Internet erreichbare Server
- Verschlüsselung für WLAN
- Backup-Speicher
- DNS-Cache

? Welche Verbindung ist ein Site-to-Site-VPN?
* Filiale mit Zentrale
- Laptop mit Zentrale
- Smartphone mit Hotspot
- PC mit Drucker

? Welcher Port gehört zu HTTPS?
* 443
- 80
- 22
- 3389

? Welches Prinzip vergibt nur die minimal nötigen Rechte?
* Least Privilege
- Zero Trust
- Security by Obscurity
- Defense in Depth

? Was bedeutet Zero Trust?
* Jeder Zugriff wird geprüft, auch intern
- Niemand darf auf das Netz zugreifen
- Nur Administratoren dürfen zugreifen
- Das Netz ist nicht verschlüsselt

? Was ist die 3-2-1-Regel?
* 3 Kopien, 2 Medien, 1 außer Haus
- 3 Server, 2 Platten, 1 USV
- 3 Backups pro Woche
- 3 Passwörter, 2 Faktoren

? Warum ist MD5 für Zertifikate nicht mehr geeignet?
* Kollisionsangriffe sind möglich
- Zu langsam
- Zu große Hashwerte
- Nicht verfügbar

? Was bewirkt SSL-Inspection?
* Die Firewall prüft verschlüsselten Traffic auf Malware
- Sie verschlüsselt das LAN
- Sie ersetzt DNS
- Sie sperrt alle Zertifikate

? Welcher Faktor zählt zu „Besitz“ bei MFA?
* Smartcard oder Authenticator-Gerät
- Passwort
- Fingerabdruck
- PIN im Kopf
