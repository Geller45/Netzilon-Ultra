---
id: ccna-security-grundlagen
bereich: CCNA
block: CCNA 5.1 – 5.6
kapitel: Security Fundamentals
titel: Sicherheitsgrundlagen – Bedrohungen, CIA, AAA, Passwörter, Firewalls, IPS
stufe: Fortgeschritten
fach: TCP/IP – CCNA – Basic
pruefungen: [CCNA, AP1, AP2]
quellen: [CCNA_200-301_Notes_-_Jeremys_IT_Lab.pdf, 200_301_CCNA_v1.0_2.pdf, 200-301.pdf]
verweise: [ccna-acl-extended, ccna-port-security, ccna-dhcp-snooping-dai, ccna-vpn-wan, ccna-ssh-ftp-tftp, ccna-wlan-sicherheit]
---

## Profi

### Schutzziele und Begriffe
**CIA-Triade**: **Confidentiality** (Vertraulichkeit), **Integrity** (Integrität), **Availability** (Verfügbarkeit). **Vulnerability** (Schwachstelle), **Exploit** (Ausnutzung), **Threat** (Bedrohung), **Risk** (Risiko = Wahrscheinlichkeit × Schaden), **Mitigation** (Gegenmaßnahme). **Zero-Day**: Schwachstelle ohne verfügbaren Patch.

### Angriffe
- **Social Engineering**: Phishing, Spear-Phishing, Whaling, Vishing, Pretexting, Tailgating.
- **Malware**: Virus, Wurm, Trojaner, Ransomware, Spyware.
- **Denial of Service (DoS/DDoS)**: Überlastung von Diensten (SYN-Flood, Reflection/Amplification).
- **Man-in-the-Middle**: ARP-Spoofing/Poisoning, rogue DHCP.
- **Reconnaissance** (Port-Scan, Sniffing), **Passwortangriffe** (Brute-Force, Wörterbuch, Credential Stuffing).
- **Layer 2**: MAC-Flooding (CAM-Overflow), VLAN-Hopping (Switch Spoofing, Double Tagging), STP-Manipulation, DHCP Starvation.

### Defense-in-Depth
Mehrere Schichten: physisch, Perimeter (Firewall), Netzwerk (Segmentierung, ACL, VLAN), Host (Antivirus, Patches), Anwendung, Daten (Verschlüsselung), Mensch (Awareness). **Prinzip der geringsten Rechte (Least Privilege)**, Trennung von Aufgaben, **Zero Trust** (nie vertrauen, immer prüfen).

### AAA
**Authentication** (Wer bist du?), **Authorization** (Was darfst du?), **Accounting** (Was hast du getan?). Protokolle: **RADIUS** (UDP 1812/1813, nur Passwort verschlüsselt, kombiniert Authent. + Autor.), **TACACS+** (Cisco, **TCP 49**, gesamter Body verschlüsselt, trennt Authent./Autor./Acct – für Geräteadministration). Konfiguration:
```
aaa new-model
radius server NPS
 address ipv4 10.0.0.50 auth-port 1812 acct-port 1813
 key LabKey
aaa authentication login default group radius local
```
`local` als Fallback. Zusätzlich **MFA** (Multi-Faktor: Wissen, Besitz, Inhärenz) und **Zertifikate**.

### Passwörter und Richtlinien
Lange Passphrasen, kein Standard, Passwort-Manager, Sperrung (`login block-for 120 attempts 3 within 60`), `security passwords min-length 10`, **enable secret** (Typ 8/9: scrypt/PBKDF2 > Typ 5 MD5 > Typ 7 reversibel). **Biometrie** und **Smartcards** als zweiter Faktor.

### Firewalls und IPS
**Paketfilter** (ACL, zustandslos), **Stateful Firewall** (merkt sich Verbindungen), **Next-Generation Firewall (NGFW)** (Anwendungs-Erkennung, IPS, URL-Filter, Malware-Schutz, SSL-Inspection), **IPS** (Intrusion Prevention System – inline, blockt) vs. **IDS** (passiv, meldet). Zonenmodell: **Inside / Outside / DMZ**; DMZ für öffentliche Server. Endpoint-Schutz: EDR, Antivirus, Host-Firewall.

## Einfach

Stell dir deine Schule als Burg vor. Es gibt **drei Dinge, die geschützt werden müssen**:
1. **Geheimnisse bleiben geheim** (Vertraulichkeit) – niemand liest dein Tagebuch.
2. **Nichts wird heimlich verändert** (Integrität) – niemand schreibt in deine Hausaufgaben.
3. **Das Tor ist immer erreichbar** (Verfügbarkeit) – du kommst morgens rein.

Die Angreifer haben viele Tricks: Sie schicken gefälschte Briefe (Phishing), schleichen sich hinter dir ein (Tailgating) oder blockieren das Tor mit 1000 Leuten (DDoS). Im Netz fälschen sie auch Adressen, um sich zwischen zwei Gesprächspartner zu schummeln (Man-in-the-Middle).

Deshalb baut man **mehrere Mauern hintereinander**: Eine Firewall am Burgtor, Wachen in jedem Flur (VLAN, ACL), Schlösser an den Zimmern (Passwörter, Verschlüsselung), und jeder Mitarbeiter lernt, nicht jedem Fremden die Tür aufzuhalten.

**AAA** ist der Türsteher mit drei Fragen:
- **Wer bist du?** (Ausweis, Passwort, Fingerabdruck – am besten zwei Dinge zusammen)
- **Was darfst du?** (Nur in deinen Flur)
- **Was hast du gemacht?** (Eintrag im Besucherbuch)

Eine **Firewall** ist wie ein Pförtner mit Liste. Eine moderne (NGFW) schaut sogar in den Koffer. Ein **IPS** ist ein Wachmann, der Einbrecher sofort festhält; ein IDS ruft nur „Alarm!“.

## Merksatz
- **CIA: Vertraulichkeit – Integrität – Verfügbarkeit.**
- **AAA: Authentication – Authorization – Accounting.**
- **RADIUS UDP 1812/1813, TACACS+ TCP 49.**
- **IDS meldet, IPS blockt.**
- **Defense in Depth + Least Privilege + Zero Trust.**
- **MFA = mindestens zwei Faktoren: Wissen, Besitz, Inhärenz.**

## Prüfungsfalle
- **TACACS+ verschlüsselt den ganzen Body, RADIUS nur das Passwort.**
- **IDS** ist passiv (Kopie des Verkehrs, Mirror/TAP), **IPS** sitzt **inline**.
- **Phishing ≠ Vishing**: Mail vs. Telefon.
- **Authentifizierung ≠ Autorisierung**: Anmeldung vs. Rechte.
- **Zwei Passwörter sind keine MFA** – es braucht verschiedene Faktorarten.
- Risk = Threat × Vulnerability × Impact (Konzept), nicht nur Threat.
- Typ-7-Passwörter (`service password-encryption`) lassen sich entschlüsseln.

## Grafik
### AAA mit RADIUS
1. Admin -> Router: SSH-Login admin
2. Router -> RADIUS-Server: Access-Request (Authentication)
3. RADIUS-Server -> Router: Access-Accept + Rechte (Authorization)
4. Router -> RADIUS-Server: Accounting Start
5. Admin: Arbeit am Gerät, Accounting protokolliert Befehle (TACACS+)

### Defense in Depth
1. Text: Internet -> Firewall (Perimeter)
2. Text: -> DMZ (öffentliche Server)
3. Text: -> interne Firewall/ACL
4. Text: -> VLAN-Segmente
5. Text: -> Endgeräte mit Antivirus/EDR

## Lab
**Packet Tracer: R1 mit AAA (RADIUS-Server 10.0.0.50), Fallback lokal**

### Cisco IOS
```
R1(config)# username admin secret Lab#Pass1
R1(config)# aaa new-model
R1(config)# radius server NPS
R1(config-radius-server)# address ipv4 10.0.0.50 auth-port 1812 acct-port 1813
R1(config-radius-server)# key LabKey
R1(config-radius-server)# exit
R1(config)# aaa authentication login default group radius local
R1(config)# login block-for 120 attempts 3 within 60
R1(config)# security passwords min-length 10
R1# show aaa servers
```
1. Test: Server erreichbar → Login über RADIUS; Server abgeschaltet → lokaler Fallback.
2. Windows Server (EXA-SRV01): NPS-Rolle, RADIUS-Client R1, gemeinsames Geheimnis nur im Lab.

## Befehle
- `aaa new-model` – AAA aktivieren
- `aaa authentication login default group radius local` – Reihenfolge
- `radius server NAME` – RADIUS-Server
- `login block-for 120 attempts 3 within 60` – Brute-Force-Schutz
- `enable algorithm-type scrypt secret X` – Typ-9-Hash
- `show aaa servers` – AAA-Status

## Übungen
- A: Nennen Sie die drei Schutzziele. | L: Vertraulichkeit, Integrität, Verfügbarkeit.
- A: Unterschied RADIUS/TACACS+? | L: RADIUS UDP 1812/1813, Passwort verschlüsselt, kombiniert; TACACS+ TCP 49, gesamter Body verschlüsselt, AAA getrennt.
- A: Was ist ein Zero-Day-Exploit? | L: Ausnutzung einer unbekannten bzw. noch nicht gepatchten Schwachstelle.
- A: IDS vs. IPS? | L: IDS passiv/Alarm, IPS inline/blockiert.
- A: Nennen Sie drei Authentifizierungsfaktoren. | L: Wissen (Passwort), Besitz (Token), Inhärenz (Fingerabdruck).
- A: Welche Layer-2-Angriffe gibt es? | L: MAC-Flooding, VLAN-Hopping, ARP-Spoofing, DHCP Starvation/Rogue DHCP, STP-Manipulation.

## Karteikarten
- F: CIA-Triade? | A: Confidentiality, Integrity, Availability.
- F: AAA? | A: Authentication, Authorization, Accounting.
- F: RADIUS-Ports? | A: UDP 1812/1813.
- F: TACACS+ Port? | A: TCP 49.
- F: Was ist Phishing? | A: Betrugsversuch per gefälschter Nachricht zum Abgreifen von Daten.
- F: Was ist MFA? | A: Authentifizierung mit mindestens zwei verschiedenen Faktorarten.
- F: IDS vs. IPS? | A: Erkennt vs. blockiert (inline).
- F: Was ist Least Privilege? | A: Nur minimal nötige Rechte vergeben.
- F: Was ist eine DMZ? | A: Pufferzone für öffentlich erreichbare Server zwischen Firewalls.
- F: Was ist ein Exploit? | A: Code/Methode, die eine Schwachstelle ausnutzt.
- F: Stateful Firewall? | A: Verfolgt Verbindungszustände, erlaubt Rückverkehr automatisch.

## Quiz
? Wofür steht das C in CIA?
* Confidentiality
- Control
- Certification
- Compliance
? Welches Protokoll ist TCP-basiert und verschlüsselt den ganzen Body?
* TACACS+
- RADIUS
- SNMPv2c
- NTP
? Was bedeutet das zweite A in AAA?
* Authorization
- Availability
- Authenticity
- Attestation
? Ein Gerät, das Angriffe inline blockiert, ist…
* ein IPS
- ein IDS
- ein Hub
- ein Repeater
? Welcher Angriff nutzt gefälschte E-Mails?
* Phishing
- Smurf
- Teardrop
- Replay
? Was ist eine DMZ?
* Zone für öffentliche Server zwischen Firewalls
- Ein VLAN für Drucker
- Das Management-VLAN
- Ein Backup-Netz
? Welche Kombination ist echte MFA?
* Passwort + Token
- Passwort + Sicherheitsfrage
- Zwei Passwörter
- PIN + Passwort
? Was ist Least Privilege?
* Nur die minimal nötigen Rechte
- Maximale Rechte für Administratoren
- Rechte per Zufall
- Keine Rechte
? Welcher Hash-Typ ist für enable secret am stärksten?
* Typ 9 (scrypt)
- Typ 7
- Typ 0
- Typ 5 MD5
