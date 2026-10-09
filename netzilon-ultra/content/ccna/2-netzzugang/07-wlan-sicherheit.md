---
id: ccna-wlan-sicherheit
bereich: CCNA
block: CCNA 5.9
kapitel: Security Fundamentals
titel: WLAN-Sicherheit – WPA2, WPA3, 802.1X, EAP, Personal vs. Enterprise
stufe: Fortgeschritten
fach: TCP/IP – CCNA – Basic
pruefungen: [CCNA, AP1, AP2]
quellen: [CCNA_200-301_Notes_-_Jeremys_IT_Lab.pdf, 200_301_CCNA_v1.0_2.pdf, WiFi.md]
verweise: [ccna-wlan-architektur, ccna-security-grundlagen, ccna-wlan-grundlagen]
---

## Profi

### Entwicklung
| Standard | Verschlüsselung | Bemerkung |
|---|---|---|
| **WEP** | RC4, statischer Schlüssel, 24-Bit-IV | **Legacy, gebrochen** in Minuten |
| **WPA** | RC4 mit **TKIP** (Per-Packet-Key) | Legacy, Übergang |
| **WPA2** (802.11i) | **AES-CCMP** (128 Bit) | Standard seit 2004; PSK anfällig für Offline-Wörterbuchangriffe (4-Way-Handshake mitschneiden) |
| **WPA3** | **AES-GCMP** (256 Bit bei Enterprise), **SAE** statt PSK | Schutz vor Offline-Angriffen, **PMF** (Protected Management Frames) Pflicht, Forward Secrecy; **OWE** für offene Netze |

### Personal vs. Enterprise
- **Personal (PSK)**: ein gemeinsamer Schlüssel (Passphrase, 8–63 Zeichen) für alle. Einfach, aber kein Einzelzugang, Passwortwechsel betrifft alle. WPA3-Personal nutzt **SAE** (Simultaneous Authentication of Equals, Dragonfly-Handshake).
- **Enterprise (802.1X)**: individuelle Authentifizierung über einen **RADIUS-Server** (z. B. Cisco ISE, Windows NPS). Rollen: **Supplicant** (Client), **Authenticator** (AP/WLC/Switch), **Authentication Server** (RADIUS, UDP 1812/1813). Zwischen Supplicant und Server läuft **EAP** (Extensible Authentication Protocol) durch den Authenticator.

### EAP-Methoden
| Methode | Merkmal |
|---|---|
| **EAP-FAST** | Cisco, Tunnel mit PAC, kein Zertifikat nötig |
| **PEAP** | Server-Zertifikat baut TLS-Tunnel, darin MS-CHAPv2 oder GTC (Benutzername/Passwort) |
| **EAP-TLS** | **Gegenseitige Zertifikate** (Client + Server), sicherste, aufwendigste Methode |
Nach erfolgreicher Authentifizierung verteilt der RADIUS-Server per **Access-Accept** Attribute (z. B. VLAN, ACL) und der Schlüssel wird per **4-Way-Handshake** abgeleitet.

### Weitere Maßnahmen
Gäste-SSID in eigenem VLAN mit Captive Portal; SSID-Broadcast ausblenden ist **keine** Sicherheit; MAC-Filter ist leicht zu umgehen; Rogue-AP-Erkennung; regelmäßige Rotation; auf dem WLC: Layer-2-Sicherheit (WPA2/WPA3), Layer-3-Sicherheit (Web-Auth), AAA-Server eintragen.

## Einfach

Funk kann jeder hören, der in der Nähe ist – wie ein Gespräch auf dem Pausenhof. Damit niemand mithört, muss alles in eine **Geheimsprache** übersetzt werden. Das ist die Verschlüsselung.

Früher (WEP) war die Geheimsprache so simpel, dass sie jeder Schüler in Minuten knackte. Dann kam WPA, dann **WPA2 mit AES** – die ist richtig stark. Das neueste ist **WPA3**: Hier ist selbst ein schlechtes Passwort besser geschützt, weil Angreifer nicht mehr in Ruhe zu Hause probieren können.

Es gibt zwei Arten, ins Netz zu kommen:
- **Mit Heimpasswort (Personal)**: Alle kennen dasselbe Passwort, wie bei einem Clubhaus. Praktisch, aber wenn jemand ausscheidet, müssen alle das neue Passwort lernen.
- **Mit Ausweis (Enterprise)**: Jeder Mitarbeiter hat sein eigenes Konto. Am Eingang steht ein **Türsteher (der AP)**, der nur fragt: „Wer bist du?“ und die Antwort zur **Personalabteilung (RADIUS-Server)** schickt. Die sagt „Ja“ oder „Nein“. Das ist 802.1X. Wenn du deinen Ausweis (Zertifikat) sogar auf dem Gerät hast, ist es am sichersten (EAP-TLS).

Das SSID-Verstecken ist, als würdest du das Namensschild von der Tür abnehmen: Wer sucht, findet sie trotzdem.

Ein Beispiel: In der Firma bekommt Anna ein Konto auf dem RADIUS-Server. Verlässt sie die Firma, sperrt der Admin nur dieses eine Konto – alle anderen merken nichts. Hätte die Firma ein gemeinsames Passwort für alle, müsste es jetzt geändert und an 200 Leute verteilt werden. Darum gilt: Zuhause reicht Personal, in der Firma gehört Enterprise (802.1X) hin.

## Merksatz
- **WEP tot, WPA2 = AES-CCMP, WPA3 = SAE + GCMP.**
- **802.1X = Supplicant – Authenticator – RADIUS (UDP 1812/1813).**
- **EAP-TLS = beidseitig Zertifikat (sicherste).**
- **PEAP/EAP-FAST = Tunnel + Benutzername/Passwort.**
- **SSID verstecken ≠ Sicherheit.**

## Prüfungsfalle
- Der **AP ist der Authenticator**, nicht der RADIUS-Server.
- **WPA2-Personal** ist gegen Offline-Angriffe verwundbar; WPA3-SAE nicht.
- **PEAP** braucht nur ein **Server**-Zertifikat, **EAP-TLS** auf beiden Seiten.
- RADIUS-Ports: **UDP 1812 (Authentifizierung) und 1813 (Accounting)**; Legacy 1645/1646. TACACS+ nutzt **TCP 49** (Geräteverwaltung).
- TKIP ist Legacy und nicht mit 802.11n+ erlaubt.
- MAC-Filter und SSID-Hiding sind keine ausreichenden Sicherheitsmaßnahmen.

## Grafik
### 802.1X mit RADIUS
1. Client -> AP: Association (Port gesperrt für Daten)
2. AP -> RADIUS-Server: EAP-Request Identity (RADIUS Access-Request)
3. RADIUS-Server -> AP: EAP-Challenge (TLS-Tunnel)
4. Client -> RADIUS-Server: Benutzer/Passwort oder Zertifikat
5. RADIUS-Server -> AP: Access-Accept (VLAN 20)
6. AP -> Client: 4-Way-Handshake, Port frei

## Lab
**Packet Tracer / Windows Server: WLC + NPS (RADIUS)**

### Cisco IOS
```
R1(config)# aaa new-model
R1(config)# radius server NPS
R1(config-radius-server)# address ipv4 10.0.0.50 auth-port 1812 acct-port 1813
R1(config-radius-server)# key LabKey123
R1(config)# aaa authentication dot1x default group radius
```
1. WLC: WLAN anlegen, Security → WPA2/AES, Auth Key Mgmt **802.1X**, RADIUS-Server eintragen.
2. Windows Server (EXA-SRV01): NPS-Rolle, RADIUS-Client = WLC, Netzwerkrichtlinie PEAP.
3. Client verbinden → Eventlog des NPS prüfen. (Schlüssel nur im Lab.)

## Befehle
- `aaa new-model` – AAA aktivieren
- `radius server NPS` – RADIUS-Server definieren
- `aaa authentication dot1x default group radius` – 802.1X über RADIUS
- `dot1x system-auth-control` – 802.1X global an (Switch)

## Übungen
- A: Welche Verschlüsselung nutzt WPA2? | L: AES-CCMP (128 Bit).
- A: Was ersetzt in WPA3 den PSK-Handshake? | L: SAE (Simultaneous Authentication of Equals).
- A: Wer ist Supplicant, Authenticator, Authentication Server? | L: Client, AP/WLC/Switch, RADIUS-Server.
- A: Welche EAP-Methode nutzt Zertifikate auf Client und Server? | L: EAP-TLS.
- A: Warum ist WEP unsicher? | L: Statischer Schlüssel, 24-Bit-IV, RC4 – in Minuten knackbar.
- A: Warum SSID-Hiding keine Sicherheit? | L: SSID steht in Probe-Requests/Antworten und wird beim Verbinden gesendet.

## Karteikarten
- F: WPA2-Verschlüsselung? | A: AES-CCMP.
- F: WPA3-Personal? | A: SAE statt PSK, PMF Pflicht.
- F: Wofür steht SAE? | A: Simultaneous Authentication of Equals.
- F: Was ist 802.1X? | A: Port-basierte Zugangskontrolle mit EAP und RADIUS.
- F: Authenticator? | A: Das Gerät, das den Zugang kontrolliert (AP, WLC, Switch).
- F: RADIUS-Ports? | A: UDP 1812 (Auth), 1813 (Acct).
- F: TACACS+ Port? | A: TCP 49.
- F: Sicherste EAP-Methode? | A: EAP-TLS.
- F: Was nutzt PEAP? | A: Server-Zertifikat für TLS-Tunnel, darin Benutzername/Passwort.
- F: Was ist WEP? | A: Legacy, RC4 mit schwachem IV, gebrochen.

## Quiz
? Welche Verschlüsselung gehört zu WPA2?
* AES-CCMP
- RC4/WEP
- DES
- 3DES-CBC
? Wer ist beim 802.1X-WLAN der Authenticator?
* Der AP bzw. WLC
- Der Client
- Der RADIUS-Server
- Der DHCP-Server
? Welche Ports nutzt RADIUS für die Authentifizierung?
* UDP 1812
- TCP 49
- UDP 161
- TCP 443
? Welche EAP-Methode verlangt beidseitig Zertifikate?
* EAP-TLS
- PEAP
- EAP-FAST
- LEAP
? Was ersetzt in WPA3-Personal den PSK-Austausch?
* SAE
- TKIP
- WEP
- MD5
? Warum ist WPA2-Personal anfällig?
* Offline-Wörterbuchangriff auf den mitgeschnittenen Handshake
- Es nutzt kein AES
- Es nutzt keine Passwörter
- Der SSID ist sichtbar
? Hilft das Verstecken der SSID wirklich?
* Nein, die SSID ist weiter auffindbar
- Ja, vollständig
- Ja, bei WPA3
- Nur bei 5 GHz
? Welches Protokoll läuft zwischen Client und RADIUS-Server durch den AP?
* EAP
- ICMP
- OSPF
- NTP
? Welcher Standard ist 802.1X?
* Portbasierte Netzwerkzugangskontrolle
- Spanning Tree
- VLAN-Tagging
- Link Aggregation
