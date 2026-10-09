---
id: az801-ipsec-verbindungssicherheit
bereich: AZ-801
block: A9
kapitel: Sicherheit
titel: Verbindungssicherheitsregeln (IPsec)
stufe: Profi
quellen: [AZ-801 Study Guide, Microsoft Learn]
verweise: [az801-domaenenisolierung, az801-firewall-lokal, ap1-a5-firewall, ap1-a5-vpn, ap1-a6-kerberos]
---

## Profi

### Was sind Verbindungssicherheitsregeln?
**Verbindungssicherheitsregeln** (*Connection Security Rules*) legen fest, **wie** zwei Computer **einander authentifizieren** und **den Verkehr schützen** (**IPsec**). Sie **erlauben oder blockieren** **nichts** – das tun **Firewall-Regeln**. Sie sorgen nur für **Authentifizierung**, **Integrität** und optional **Verschlüsselung**.

**Zusammenspiel**
| Regelart | Aufgabe |
|---|---|
| **Firewall-Regel** | **Zulassen/Blockieren** (**Port**, **Programm**, **Adresse**) |
| **Verbindungssicherheitsregel** | **Authentifizierung** und **Schutz** (**IPsec**) |
| **Firewall-Regel „Zulassen, wenn sicher“** | **Verbindet** beides: **Zulassen** **nur mit** **IPsec** |

### IPsec-Grundlagen
| Baustein | Details |
|---|---|
| **AH** (*Authentication Header*) | **IP-Protokoll 51**, **Integrität und Authentizität**, **keine Verschlüsselung**, **NAT-inkompatibel** |
| **ESP** (*Encapsulating Security Payload*) | **IP-Protokoll 50**, **Integrität und Verschlüsselung** |
| **IKE** (*Internet Key Exchange*) | **UDP 500** (**Schlüsselaustausch**), **NAT-T** **UDP 4500** |
| **Hauptmodus** (*Main Mode*, **Phase 1**) | **Gegenseitige Authentifizierung**, **DH-Schlüssel**, erzeugt **Main-Mode-SA** |
| **Schnellmodus** (*Quick Mode*, **Phase 2**) | **Aushandlung** der **Datenschutz-Parameter**, erzeugt **Quick-Mode-SA** (**Daten**) |
| **SA** (*Security Association*) | **Vereinbarung** (**Algorithmen**, **Schlüssel**, **Lebensdauer**) |
| **Transportmodus** | **Nur Nutzlast** geschützt (**Host-zu-Host**, **Windows-Standard**) |
| **Tunnelmodus** | **Ganzes Paket** **gekapselt** (**Standort-zu-Standort**, **VPN**) |

**Firewall muss zulassen**: **UDP 500**, **UDP 4500**, **ESP (50)**, ggf. **AH (51)**. Bei **Windows** **automatisch** über **IPsec-Regeln** in der **Windows-Firewall**.

### Regeltypen im Assistenten (`wf.msc → Verbindungssicherheitsregeln → Neue Regel`)
| Typ | Zweck |
|---|---|
| **Isolierung** (*Isolation*) | **Domänenisolierung** (Seite 12): **Authentifizierung** **je Profil** (**Domäne/Privat/Öffentlich**) |
| **Authentifizierungsausnahme** (*Authentication exemption*) | **Bestimmte Computer** (**IP-Adressen**) **ohne IPsec**, z. B. **DCs**, **DNS**, **DHCP** |
| **Server-zu-Server** (*Server-to-server*) | **Zwischen zwei Endpunktgruppen** (**IP-Bereiche**), **gezielt** |
| **Tunnel** | **Gateway-zu-Gateway**/**Client-zu-Gateway** (**Tunnelmodus**) |
| **Benutzerdefiniert** (*Custom*) | **Alle Eigenschaften** (**Endpunkte**, **Anforderungen**, **Authentifizierung**, **Protokoll**) |

### Anforderungen (Requirements)
| Auswahl | Bedeutung |
|---|---|
| **Authentifizierung für eingehende Verbindungen anfordern, für ausgehende nicht** | **Nur Server** **fordert an** |
| **Authentifizierung anfordern** (*Request*) | **Versuch**, **Klartext-Rückfall** |
| **Authentifizierung erfordern** (*Require*) | **Ohne IPsec** **keine Verbindung** |
| **Eingehend erfordern, ausgehend anfordern** | **Standard** für **Isolierung** |

### Authentifizierungsmethoden
| Stufe | Optionen |
|---|---|
| **Erste Authentifizierung** | **Computer (Kerberos V5)**, **Computerzertifikat** (**Signatur**/**Integritätszertifikat**), **Vorab freigegebener Schlüssel** (**Test**, **nicht empfohlen**), **NTLMv2** (**nur Notlösung**), **Integritätszertifikat** (**Legacy**) |
| **Zweite Authentifizierung** | **Benutzer (Kerberos V5)**, **Benutzerzertifikat**, **NTLMv2**; für **Benutzer-/Gruppenbeschränkung** |

### IPsec-Einstellungen anpassen
`wf.msc → Rechtsklick auf Windows Defender Firewall → Eigenschaften → IPsec-Einstellungen → Anpassen`
| Bereich | Auswahl |
|---|---|
| **Schlüsselaustausch (Hauptmodus)** | **Integrität**: **SHA-256**/**SHA-384**; **Verschlüsselung**: **AES-CBC 128/256**; **DH-Gruppe**: **DH14** (**2048-Bit MODP**), **ECDH P-256/P-384** (**Legacy**: **DH1/DH2** **vermeiden**) |
| **Datenschutz (Schnellmodus)** | **Nur ESP-Integrität** (**ESP-Null**), **ESP-Integrität und -Verschlüsselung** (**AES-GCM 128/256** empfohlen), **AH** |
| **Authentifizierungsmethode** | **Standard**: **Computer (Kerberos V5)** |
| **Ausnahmen** | **ICMP** **von IPsec ausnehmen** (**Ja/Nein**, **Standard: Nein**) |
| **IPsec-Tunnelautorisierung** | **Benutzer/Computer** für **Tunnel** |

### Sichere Firewall-Regel („Zulassen, wenn sie sicher ist“)
- **Aktion**: **Verbindung zulassen, wenn sie sicher ist**.
- **Optionen**: **Verschlüsselung erforderlich**, **Regeln zur Verbindungssicherheit außer Kraft setzen** (**Authenticated Bypass**), **Benutzer/Computer einschränken** (**Gruppen**).

### Werkzeuge
```powershell
# Auf SRV01 – Kryptosätze (Schnellmodus) und Hauptmodus
$mm = New-NetIPsecMainModeCryptoSet -DisplayName "MM-DH14-AES256" `
  -Proposal (New-NetIPsecMainModeCryptoProposal -Encryption AES256 -Hash SHA256 -KeyExchange DH14)
$qm = New-NetIPsecQuickModeCryptoSet -DisplayName "QM-ESP-AESGCM" `
  -Proposal (New-NetIPsecQuickModeCryptoProposal -Encapsulation ESP -Encryption AESGCM256)

# Auth-Satz und Regel (Server-zu-Server mit Verschlüsselung)
$auth = New-NetIPsecPhase1AuthSet -DisplayName "Kerberos-Computer" `
  -Proposal (New-NetIPsecAuthProposal -Machine -Kerberos)
New-NetIPsecRule -DisplayName "SRV01-SRV02 verschluesselt" `
  -LocalAddress 10.0.0.20 -RemoteAddress 10.0.0.21 `
  -InboundSecurity Require -OutboundSecurity Require `
  -Phase1AuthSet $auth.Name -MainModeCryptoSet $mm.Name -QuickModeCryptoSet $qm.Name

# Status
Get-NetIPsecRule | Select-Object DisplayName, InboundSecurity, OutboundSecurity, Enabled
Get-NetIPsecMainModeSA | Select-Object RemoteAddress, AuthenticationMethod, Cipher
Get-NetIPsecQuickModeSA | Select-Object RemoteAddress, Encapsulation, Cipher
```
`netsh advfirewall consec show rule name=all` und `netsh advfirewall monitor show mmsa` bzw. `... qmsa` **zeigen** **Regeln** und **Zuordnungen**.

### Fehlersuche
| Symptom | Prüfen |
|---|---|
| **Verbindung** **bricht ab** | **Kerberos** (**Zeit**, **SPN**, **DC-Erreichbarkeit**), **Ausnahmeregel** für **DC** |
| **Hauptmodus-Fehler** | **Ereignis 4653** (**IKE-Fehler**), **DH-Gruppe/Verschlüsselung** **unterschiedlich** |
| **Schnellmodus-Fehler** | **Ereignis 4654** (**QM-Verhandlung** fehlgeschlagen) |
| **SA aufgebaut** | **4650/4651** (**Hauptmodus**), **5451** (**Schnellmodus**) |
| **NAT** dazwischen | **AH** **nicht nutzbar**; **ESP** mit **NAT-T** **(UDP 4500)** |
| **Fehlende Ereignisse** | **Überwachung** **aktivieren**: `auditpol /set /subcategory:"IPsec Main Mode" /success:enable /failure:enable` |

### Abgrenzung
| Thema | Beschreibung |
|---|---|
| **IPsec Host-zu-Host** (**diese Seite**) | **Windows-Firewall** **Verbindungssicherheit** |
| **Site-to-Site-VPN** | **Tunnelmodus** zwischen **Gateways** (**IKEv2** in **Azure**) |
| **SMB-Verschlüsselung** | **Nur SMB** (**AES**), **ohne IPsec** |
| **TLS/HTTPS** | **Anwendungsebene** |

## Lab
**Maschinen**: **SRV01** (10.0.0.20), **SRV02** (10.0.0.21), **DC01** (10.0.0.10), Domäne example.com.

### GUI
1. **DC01**: **GPMC** → **neue GPO** `GPO-IPsec-SRV` an **OU Server** → **Bearbeiten**.
2. **DC01**: **Computerkonfiguration → Windows-Einstellungen → Sicherheitseinstellungen → Windows Defender Firewall mit erweiterter Sicherheit → Rechtsklick → Eigenschaften → IPsec-Einstellungen → Anpassen** → **Datenschutz: ESP-Integrität und -Verschlüsselung, AES-GCM 256**.
3. **DC01**: **Verbindungssicherheitsregeln → Neue Regel → Server-zu-Server** → **Endpunkt 1: 10.0.0.20**, **Endpunkt 2: 10.0.0.21**.
4. **DC01**: **Anforderungen: Authentifizierung erfordern** (**Eingehend/Ausgehend**) → **Authentifizierungsmethode: Computer (Kerberos V5)** → **Profile: Domäne** → Name `SRV01-SRV02 sicher`.
5. **DC01**: **Neue Regel → Authentifizierungsausnahme** → **10.0.0.10** (DC).
6. **SRV01** und **SRV02**: `gpupdate /force`.
7. **SRV01**: `Test-NetConnection 10.0.0.21 -Port 445` → **Erfolg**.
8. **SRV01**: **wf.msc → Überwachung → Sicherheitszuordnungen → Schnellmodus** → **ESP mit AES-GCM 256**.
9. **SRV02**: **Netzwerk-Capture** (**Wireshark**) → **ESP-Pakete** (**IP-Protokoll 50**), **Klartext** nicht lesbar.

### PowerShell
```powershell
# Auf SRV01
gpupdate /force
Get-NetIPsecRule | Select-Object DisplayName, InboundSecurity, OutboundSecurity
Get-NetIPsecMainModeSA
Get-NetIPsecQuickModeSA

# Überwachung aktivieren
auditpol /set /subcategory:"IPsec Main Mode" /success:enable /failure:enable
auditpol /set /subcategory:"IPsec Quick Mode" /success:enable /failure:enable
Get-WinEvent -FilterHashtable @{LogName="Security"; Id=4650,4651,5451,4653,4654} -MaxEvents 10
```

## Einfach

**Firewall-Regel** = **Türsteher**: „Darf rein oder nicht?“
**Verbindungssicherheitsregel** = **Geheimsprache + Ausweis** zwischen **zwei Rechnern**.

Ablauf in **zwei Schritten**:
1. **Erst Ausweis zeigen und Schlüssel tauschen** (**Hauptmodus**): „Ich bin SRV01, das ist mein Kerberos-Ausweis.“
2. **Dann Geheimsprache vereinbaren** (**Schnellmodus**): „Wir sprechen **ESP mit AES**.“

Danach **reden** **beide** **verschlüsselt**. **Abhörer** sehen **nur Kauderwelsch**.

**Regelarten** wie **Rollen**:
- **Isolierung** = **Alle Firmen-PCs** reden **nur miteinander**.
- **Server-zu-Server** = **Zwei bestimmte Server** reden **geheim**.
- **Ausnahme** = **DC/DNS/DHCP** brauchen **keinen Ausweis**.
- **Tunnel** = **Ein geschützter Tunnel** **zwischen zwei Standorten**.

## Merksatz
- **Firewall** = **erlauben/blockieren**, **Verbindungssicherheit** = **authentifizieren/schützen**.
- **ESP (50)** = **Verschlüsselung**, **AH (51)** = **nur Integrität**.
- **IKE** = **UDP 500**, **NAT-T** = **UDP 4500**.
- **Hauptmodus** = **Identität**, **Schnellmodus** = **Daten**.
- **Fünf Regeltypen**: **Isolierung, Ausnahme, Server-zu-Server, Tunnel, Benutzerdefiniert**.
- **Empfohlen**: **AES-GCM**, **DH14/ECDH**, **Kerberos**.

## Prüfungsfalle
- **Verbindungssicherheitsregeln** **blockieren nicht** – dafür **Firewall-Regel** **oder** **Erfordern**.
- **Kerberos** braucht **Zeit** (**5 Min.**) und **DC-Zugriff**.
- **AH** **funktioniert nicht** **hinter NAT**.
- **Vorab freigegebener Schlüssel** **nur für Tests**.
- **Ausnahmen** **für DCs** **vergessen** → **Anmeldung/Replikation** **bricht**.
- **Tunnelmodus** **≠** **Transportmodus** (**Site-to-Site** vs. **Host-zu-Host**).
- **Überwachung** für **IPsec-Ereignisse** ist **standardmäßig aus**.
- **Legacy-DH1/DH2**, **3DES**, **MD5/SHA-1** **nicht** mehr verwenden.
- **Zweite Authentifizierung** **nur** bei **Benutzer-/Gruppenfilter** nötig.

## Grafik
### Zwei-Phasen-Handschlag
SRV01 und SRV02; Phase 1: Ausweise tauschen (Kerberos), Schlüssel-Symbol; Phase 2: Tresor-Symbol (ESP AES); Datenpakete wandern verschlüsselt.

### Regeltypen
Fünf Kacheln (Isolierung, Ausnahme, Server-zu-Server, Tunnel, Custom) mit Icons.

### AH gegen ESP
Postpaket mit Siegel (AH) versus Postpaket im verschlossenen Koffer (ESP).

## Karteikarten
- F: Was tun Verbindungssicherheitsregeln? | A: Sie authentifizieren Computer und schützen den Verkehr mit IPsec (kein Erlauben/Blockieren).
- F: Welches IP-Protokoll nutzt ESP? | A: Protokoll 50.
- F: Welches IP-Protokoll nutzt AH? | A: Protokoll 51.
- F: Welcher Port wird für IKE verwendet? | A: UDP 500 (NAT-T: UDP 4500).
- F: Was passiert im Hauptmodus? | A: Gegenseitige Authentifizierung und Schlüsselaustausch (Main-Mode-SA).
- F: Was passiert im Schnellmodus? | A: Aushandlung der Datenschutzparameter (Quick-Mode-SA).
- F: Welche Regeltypen gibt es? | A: Isolierung, Authentifizierungsausnahme, Server-zu-Server, Tunnel, Benutzerdefiniert.
- F: Welche Authentifizierung ist Standard? | A: Computer (Kerberos V5).
- F: Welches Ereignis zeigt einen IKE-Fehler? | A: 4653.
- F: Cmdlet für IPsec-Regeln? | A: New-NetIPsecRule
- F: Wo sieht man aktive SAs? | A: wf.msc → Überwachung → Sicherheitszuordnungen oder Get-NetIPsecMainModeSA / QuickModeSA.
- F: Welcher Modus für Standort-zu-Standort? | A: Tunnelmodus.

## Quiz
? Zwei Server sollen ihren gesamten Verkehr authentifiziert und verschlüsselt austauschen. Lösung?
* Server-zu-Server-Verbindungssicherheitsregel mit ESP-Verschlüsselung
- Nur Firewall-Regel für Port 445
- Domänenrichtlinie Kennwort
- SMB1 aktivieren

? Welche Regel nimmt DCs von der IPsec-Authentifizierung aus?
* Authentifizierungsausnahme
- Isolierung
- Tunnel
- Server-zu-Server

? Welches Protokoll bietet Verschlüsselung?
* ESP
- AH
- ICMP
- DHCP

? IPsec funktioniert hinter einer NAT nicht. Ursache?
* AH wird verwendet, NAT bricht die Integritätsprüfung
- DNS fehlt
- Kerberos zu alt
- IKE nutzt TCP 80

? Welcher Ereigniscode meldet einen IKE-Hauptmodusfehler?
* 4653
- 4624
- 4740
- 5140

? Ein Server soll nur mit Kerberos-authentifizierten Partnern sprechen, aber nichts blockieren. Was passt?
* Verbindungssicherheitsregel mit Authentifizierung anfordern
- Firewall Block Regel
- NSG
- WDAC
