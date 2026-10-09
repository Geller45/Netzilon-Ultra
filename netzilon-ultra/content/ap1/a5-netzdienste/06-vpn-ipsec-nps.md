---
id: ap1-a5-vpn
bereich: AP1
block: A5
kapitel: Netzdienste
titel: VPN, IPsec, NPS/RADIUS & 802.1X
stufe: Profi
quellen: [VPN_ms.pdf, VPN_S2S_einrichten.txt, VPN_S2E_einrichten.txt, Netzwerkinfrastruktur_mit_Windows_Server_2016_implementieren_70-741.pdf]
verweise: [ap1-a5-firewall, ap1-a4-routing, ap1-a4-ipv6, az800-vpn, az801-firewall-lokal]
---

## Profi

### Definition und Funktionsweise
Ein **VPN** (Virtual Private Network) ist ein **virtuelles** (nicht physisches), **privates** (vertrauliches) Netz über ein unsicheres Transportnetz (meist das Internet). Zwischen **zwei Endpunkten** (VPN-Client/-Software oder VPN-Gateways) wird ein **Tunnel** aufgebaut: Die Originalpakete werden **gekapselt** (in ein anderes Protokoll eingepackt), in der Regel **verschlüsselt** und am anderen Ende wieder ausgepackt bzw. weitergeleitet.

**Ablauf**: 1. **Authentifizierung** (Client baut Verbindung auf, Benutzer meldet sich an, wird geprüft) → 2. **Tunnelaufbau** (Client erhält eine IP-Adresse aus dem Firmennetz) → 3. **Übertragung** (Pakete ins Tunnelprotokoll einpacken, beim Server auspacken/weiterleiten).

**Anforderungen**: Sicherheit, Transparenz (Anwendungen merken nichts), Verfügbarkeit, Performance, Integration, Managebarkeit.

### Anwendungsbereiche
| Typ | Beschreibung | Beispiel |
|---|---|---|
| **End-to-Site** (Client-to-Site, Remote Access) | einzelner Rechner → Firmennetz | Homeoffice, Außendienst |
| **Site-to-Site** | Netz ↔ Netz über Gateways, dauerhaft; Benutzer merken nichts | Zentrale ↔ Filiale |
| **End-to-End** | Rechner ↔ Rechner direkt | Admin-Zugriff auf einen einzelnen Server |
| **Site-to-End** | Firmennetz → entfernter einzelner Server | Zugriff auf einen gehosteten Server |

| Pro | Contra |
|---|---|
| kostengünstig (Internet statt Standleitung), sicher (Verschlüsselung + Authentifizierung), flexibel | abhängig von der Verfügbarkeit fremder Netze, Kompatibilitätsprobleme, Aufwand für Sicherheit (Updates, Zertifikate), Overhead/MTU |

### VPN-Protokolle
| Protokoll | Schicht | Eigenschaften | Bewertung |
|---|---|---|---|
| **PPTP** (Microsoft, 1996) | 2 (PPP) | ein Tunnel pro Kommunikationspaar, kein Schlüsselmanagement, MS-CHAPv2 | **unsicher**, in Server 2025 **abgekündigt** – nur Übung |
| **L2TP** (1999) | 2 | mehrere Tunnel, Kontroll- und Datenkanal, **keine eigene Verschlüsselung**, keine Integritätsprüfung → immer **L2TP/IPsec** | in Server 2025 für RRAS abgekündigt |
| **SSTP** (Microsoft) | 7 | PPP über **HTTPS (TCP 443)** – geht durch fast jede Firewall/Proxy | brauchbar, Windows-lastig |
| **IKEv2** (+ IPsec) | 3 | schnell, **VPN Reconnect** bei Netzwechsel (Mobilgeräte), Zertifikate/EAP | **empfohlen** (Always On VPN) |
| **OpenVPN** | 4–7 | TLS-basiert, Open Source | verbreitet |
| **WireGuard** | 3 | modern, schlank, schnell | zunehmend Standard |

### IPsec
**IP Security** (IETF, 1998, ursprünglich für IPv6 entworfen): Sicherheitsarchitektur für IP-Netze auf **OSI-Schicht 3**. Sichert **Vertraulichkeit, Integrität und Authentizität**.

**Schlüsselaustausch**: manuell oder per **IKE** (Internet Key Exchange, **UDP 500**; mit NAT-Traversal **UDP 4500**) nach dem **Diffie-Hellman-Verfahren**; Authentifizierung per **Pre-Shared Key (PSK)**, **Zertifikaten** oder Kerberos (Windows-Domäne).

**Protokolle**:
| | **AH** (Authentication Header) | **ESP** (Encapsulating Security Payload) |
|---|---|---|
| Integrität/Authentizität | ja – **Hashwert über das gesamte IP-Paket** (inkl. Header) | ja (ohne äußeren IP-Header) |
| **Verschlüsselung** | **nein** | **ja** (AES, früher DES/3DES) |
| NAT-tauglich | nein (Header-Änderung zerstört Hash) | ja (mit NAT-T) |
| IP-Protokollnummer | 51 | 50 |

**Betriebsmodi**:
- **Transportmodus**: nur die **Nutzdaten** werden geschützt, der **Original-IP-Header bleibt unverschlüsselt** sichtbar → Ende-zu-Ende zwischen zwei Hosts.
- **Tunnelmodus**: das **gesamte Originalpaket inkl. IP-Header** wird verschlüsselt und in ein **neues IP-Paket** gepackt → Site-to-Site zwischen Gateways (interne Adressen bleiben verborgen).

**Verbindungsaufbau (vereinfacht, IKE)**:
1. Sender schlägt Authentisierungs- und Verschlüsselungsalgorithmen vor.
2. Empfänger wählt den **sichersten gemeinsamen** und teilt ihn mit.
3. + 4. Beide senden ihren **öffentlichen** Diffie-Hellman-Wert.
5. Beide berechnen daraus denselben **gemeinsamen geheimen Schlüssel** (ohne ihn je zu übertragen).
6. Verschlüsselt: gegenseitige **Authentifizierung** per Zertifikat oder PSK.
Danach werden die Schritte verschlüsselt wiederholt: Eine neue **SA** entsteht, die alte wird verworfen (regelmäßiger Schlüsselwechsel).

**SA (Security Association)**: Vereinbarung zwischen den Partnern mit Identifikation (Zertifikat/PSK), Algorithmen, Sender-IP, Empfänger-IP, Lebensdauer der Authentifizierung und der IPsec-Schlüssel. SAs sind **unidirektional** (je Richtung eine).

IPsec wird unter Windows auch **ohne VPN** eingesetzt: **Verbindungssicherheitsregeln** der Windows-Firewall → **Domänenisolierung** (nur Domänenmitglieder kommunizieren miteinander) und **Serverisolierung** (nur bestimmte Gruppen dürfen auf sensible Server).

### NPS, RADIUS und 802.1X
- **RADIUS** (Remote Authentication Dial-In User Service, **UDP 1812** Authentifizierung, **1813** Accounting): zentraler **AAA**-Dienst (Authentication, Authorization, Accounting). **RADIUS-Clients** sind die Zugangsgeräte (VPN-Server, WLAN-Access-Points, Switches), nicht die Endbenutzer.
- **NPS** (Network Policy Server) ist Microsofts **RADIUS-Server/-Proxy**. Er prüft Anmeldungen gegen AD und wendet **Netzwerkrichtlinien** an (Bedingungen wie Gruppe, Uhrzeit, Verbindungstyp → Zugriff gewähren/verweigern, Einschränkungen wie VLAN-Zuweisung). Die standardmäßig vorhandenen Richtlinien „Verbindungen mit Microsoft Routing- und RAS-Server“ verweigern zunächst den Zugriff – für die Übung wird dort **„Zugriff gewähren“** gesetzt (in Produktion eigene Richtlinie für eine VPN-Gruppe).
- **IEEE 802.1X**: **portbasierte Netzwerkzugangskontrolle**. Ein Gerät am Switchport/WLAN (**Supplicant**) muss sich erst authentifizieren, bevor der Port Datenverkehr durchlässt. Der **Authenticator** (Switch/AP) fragt per EAP den **Authentication Server** (RADIUS/NPS). Methoden: **EAP-TLS** (Zertifikate, sicherste), **PEAP-MSCHAPv2** (Benutzername/Kennwort). Verhindert, dass fremde Geräte einfach an eine Netzwerkdose gesteckt werden; ermöglicht dynamische VLAN-Zuweisung.
- **NAP** (Network Access Protection, Gesundheitsprüfung von Clients) ist **Legacy** (ab Server 2016 entfernt).

### DirectAccess und Always On VPN
- **DirectAccess**: automatische, unsichtbare Verbindung domänenzugehöriger Clients zum Firmennetz ohne Benutzeraktion (IPv6, IP-HTTPS/Teredo/6to4, IPsec) – nur Enterprise-Clients, von Microsoft **nicht mehr weiterentwickelt**.
- **Always On VPN** (Nachfolger): IKEv2/SSTP, Geräte- und Benutzertunnel, Verteilung per Intune/Skript, NPS + Zertifikate.
- Moderne Alternativen: Zero Trust Network Access (z. B. Microsoft Entra Private Access).

## Lab
**Hinweis**: Die Schulanleitung nutzt „vorerst PPTP“ – nur zum Lernen. In echten Umgebungen **IKEv2** oder **SSTP** mit Zertifikaten.

### GUI – Site-to-Site (zwei Router RTR-A und RTR-B)
Voraussetzung: RTR-A (LAN 192.168.1.0/24, „Internet“-NIC 203.0.113.1) und RTR-B (LAN 192.168.2.0/24, „Internet“-NIC 203.0.113.2).
1. **RTR-A**: Server-Manager → Rolle **Remotezugriff** → Rollendienste **DirectAccess und VPN (RAS)** + **Routing** → Installieren.
2. **RTR-A**: Tools → **Routing und RAS** → Rechtsklick Server → Konfigurieren und aktivieren → **Benutzerdefinierte Konfiguration** → **VPN-Zugriff** + **Bei Bedarf herzustellende Verbindungen** (Wählen bei Bedarf) → Fertig stellen → Dienst starten.
3. **RTR-A** (nur ohne DHCP): Rechtsklick Server → Eigenschaften → **IPv4** → **Statischer Adresspool** → Bereich aus dem eigenen LAN, **mindestens 2 Adressen** (z. B. 192.168.1.240–.245).
4. **RTR-A**: **Netzwerkschnittstellen** → Rechtsklick **Neue Schnittstelle für Wählen bei Bedarf** → Name **„RTR-B“** (muss exakt dem Benutzernamen entsprechen, mit dem RTR-B sich einwählt) → **Verbindung über VPN** → VPN-Typ (Übung: PPTP; besser IKEv2) → Ziel **203.0.113.2** → Haken **„IP-Pakete über diese Schnittstelle routen“** + **„Benutzerkonto hinzufügen, sodass ein Remoterouter sich einwählen kann“** → **statische Route**: Ziel **192.168.2.0**, Maske 255.255.255.0, Metrik 1 → Kennwort für das eingehende Konto „RTR-B“ festlegen → **Anmeldeinformationen für ausgehend**: Benutzer **„RTR-A“** + Kennwort (so wie auf RTR-B angelegt; Domäne nicht erforderlich) → Fertig.
5. **RTR-A**: Computerverwaltung → Lokale Benutzer → Benutzer **„RTR-B“** wurde angelegt (Eigenschaften → Einwählen → „Zugriff gestatten“ bzw. über NPS steuern).
6. **RTR-B**: Schritte 1–5 spiegelbildlich (Schnittstelle „RTR-A“, Ziel 203.0.113.1, Route 192.168.1.0/24).
7. **Clients** in beiden LANs: Standardgateway = eigener Router (sonst Routen auf den Clients eintragen).
8. Schnittstelle auf RTR-A → Rechtsklick **Verbinden** → Status „Verbunden“ → von einem Client in LAN A einen Client in LAN B anpingen.

### GUI – End-to-Site (VPN-Server VPN01, Client CL01)
1. **VPN01**: Rolle Remotezugriff (DirectAccess und VPN) installieren.
2. **VPN01**: Routing und RAS → Konfigurieren und aktivieren → **RAS (DFÜ oder VPN)** → **VPN** → **Schnittstelle ins Internet** wählen → Adresszuweisung **automatisch (DHCP)** oder **aus Adressbereich** (statischer Pool, mindestens 2 Adressen) → **Kein RADIUS-Server** → Fertig stellen. (Alternative: Benutzerdefinierte Konfiguration → VPN-Zugriff.)
3. **VPN01**: Tools → **Netzwerkrichtlinienserver (NPS)** → Richtlinien → **Netzwerkrichtlinien** → „Verbindungen mit Microsoft Routing- und RAS-Server“ → Übersicht: **Richtlinie aktiviert**, **Zugriff gewähren**, Typ des Netzwerkzugriffsservers **RAS-Server (VPN-DFÜ)** → OK. (Besser: Bedingung „Windows-Gruppe = VPN-Benutzer“ hinzufügen.)
4. **CL01**: Start → „**VPN**“ eingeben → VPN-Einstellungen → **VPN-Verbindung hinzufügen** → Anbieter Windows (integriert) → Verbindungsname → Servername/IP von VPN01 → VPN-Typ **Automatisch** → Anmeldeinformationen Benutzername + Kennwort → Speichern → **Verbinden**.
5. **CL01**: `ipconfig` → zusätzliche PPP-/VPN-Schnittstelle mit Adresse aus dem Pool; Ressourcen im Firmen-LAN testen.

### PowerShell
```powershell
# Auf VPN01 – VPN-Server (End-to-Site)
Install-WindowsFeature RemoteAccess, DirectAccess-VPN, Routing -IncludeManagementTools
Install-RemoteAccess -VpnType Vpn
Set-VpnIPAddressAssignment -IPAddressRange "192.168.1.240","192.168.1.245"   # statischer Pool
Get-RemoteAccess

# Auf CL01 – VPN-Verbindung anlegen
Add-VpnConnection -Name "Firma-VPN" -ServerAddress "vpn01.contoso.local" -TunnelType Automatic -AuthenticationMethod MSChapv2 -RememberCredential
rasdial "Firma-VPN" benutzer kennwort
Get-VpnConnection

# Auf RTR-A – Site-to-Site mit IKEv2 und PSK (moderne Variante)
Install-RemoteAccess -VpnType VpnS2S
Add-VpnS2SInterface -Name "RTR-B" -Destination 203.0.113.2 -Protocol IKEv2 -AuthenticationMethod PSKOnly -SharedSecret "LangesGeheimnis!" -IPv4Subnet "192.168.2.0/24:1" -Persistent
Connect-VpnS2SInterface -Name "RTR-B"
Get-VpnS2SInterface

# Windows-Firewall: IPsec-Verbindungssicherheitsregel (Domänenisolierung, Beispiel)
New-NetIPsecRule -DisplayName "Domänenisolierung" -InboundSecurity Request -OutboundSecurity Request
```

## Übungen
- A: Vier VPN-Anwendungsbereiche | L: End-to-Site (Homeoffice), Site-to-Site (Filialen), End-to-End (Rechner zu Rechner), Site-to-End (Firma zu entferntem Server)
- A: Je zwei Vor- und Nachteile von VPN | L: Pro: kostengünstig, sicher, flexibel. Contra: abhängig von fremden Netzen, Kompatibilitätsprobleme, Sicherheitsaufwand
- A: Unterschied AH und ESP | L: AH: Integrität/Authentizität per Hash über das ganze Paket, keine Verschlüsselung. ESP: zusätzlich Verschlüsselung
- A: Unterschied Transport- und Tunnelmodus | L: Transport: IP-Header bleibt unverschlüsselt (Host zu Host). Tunnel: ganzes Paket inkl. Header verschlüsselt und neu gekapselt (Gateway zu Gateway)
- A: Welcher Port für IKE? | L: UDP 500 (NAT-Traversal UDP 4500)
- A: Warum muss der Name der Wählen-bei-Bedarf-Schnittstelle dem Benutzernamen entsprechen? | L: RRAS ordnet eingehende Router-Einwahlen anhand des Benutzernamens der passenden Schnittstelle (und damit den Routen) zu

## Einfach

Stell dir vor, du willst deinem Freund in einer anderen Stadt **geheime Briefe** schicken – aber die Post (das Internet) ist nicht vertrauenswürdig, jeder Postbote könnte reinschauen.

**VPN** ist ein **geheimer, gepanzerter Tunnel** durch diese unsichere Post: Du steckst deinen Brief in einen **verschlossenen Tresor-Umschlag**, nur dein Freund hat den Schlüssel. Für den Postboten ist es nur ein grauer Kasten.

**Arten**:
- **End-to-Site**: Du sitzt **zu Hause** und verbindest dich mit dem **Firmennetz** – als wärst du im Büro.
- **Site-to-Site**: Zwei **Firmenstandorte** sind dauerhaft verbunden – die Mitarbeiter merken gar nicht, dass dazwischen das Internet liegt.

**IPsec** ist ein besonders sicheres Tunnel-System:
- **AH** ist ein **Siegel**: Man sieht, ob jemand den Brief verändert hat – aber lesen kann man ihn trotzdem.
- **ESP** ist **Siegel plus Tresor**: verändert? Merkt man. Lesen? Unmöglich.
- **Transportmodus**: Der Brief ist verschlossen, aber die **Adresse außen** ist lesbar.
- **Tunnelmodus**: Der ganze Brief **mit Adresse** kommt in einen neuen Umschlag – außen steht nur die Adresse der beiden Tunnel-Enden.

**Wie tauschen zwei Fremde einen geheimen Schlüssel aus, ohne ihn zu verraten?** Mit dem **Farbentrick (Diffie-Hellman)**: Beide mischen eine gemeinsame Grundfarbe mit ihrer geheimen Farbe und schicken sich das Ergebnis. Jeder mischt das Erhaltene nochmal mit seiner geheimen Farbe – und beide haben am Ende **dieselbe Farbe**, die kein Lauscher nachmischen kann.

**NPS/RADIUS** ist der **Pförtner mit der Mitarbeiterliste**: VPN-Server, WLAN und Switches fragen ihn: „Darf dieser Mensch rein?“ Er schaut im Active Directory nach und sagt Ja oder Nein.

**802.1X** ist eine **Schranke an jeder Netzwerkdose**: Wer ein Kabel einsteckt, kommt erst ins Netz, wenn er sich ausgewiesen hat. Ein fremder Laptop bleibt draußen.

## Merksatz
- VPN = **Tunnel + Verschlüsselung + Authentifizierung**.
- **AH = Siegel**, **ESP = Siegel + Tresor**.
- **Transport = Header sichtbar**, **Tunnel = alles verpackt**.
- IKE **UDP 500/4500**, RADIUS **1812/1813**, SSTP **443**.
- PPTP = **unsicher**, heute **IKEv2**/SSTP/WireGuard.

## Prüfungsfalle
- L2TP allein verschlüsselt nicht – erst L2TP/IPsec.
- AH verschlüsselt nicht.
- Der RADIUS-Client ist das Zugangsgerät (VPN-Server/AP/Switch), nicht der Benutzer-PC.
- NPS-Standardrichtlinien verweigern den Zugriff – ohne Anpassung scheitert jede Einwahl.
- Site-to-Site braucht Routen zu den Gegennetzen auf **beiden** Seiten.

## Grafik
### Der Tunnel
Zwei Standorte mit dem Internet (Wolke mit neugierigen Augen) dazwischen; Pakete werden am Gateway in einen gepanzerten Behälter gepackt, durch einen leuchtenden Tunnel geschickt und am anderen Ende ausgepackt.

### AH vs. ESP, Transport vs. Tunnel
Vier Paketdarstellungen nebeneinander; farbig markiert, welche Teile verschlüsselt (Schloss) und welche integritätsgeschützt (Siegel) sind.

### Diffie-Hellman-Farbmischung
Alice und Bob mischen Farben; der Lauscher Eve sieht nur die öffentlichen Mischungen und scheitert.

### 802.1X
PC steckt ins Netz; Switchport rot; EAP-Dialog mit dem RADIUS-Server; nach Erfolg wird der Port grün und bekommt ein VLAN.

## Karteikarten
- F: Was ist ein VPN? | A: Virtuelles privates Netz: verschlüsselter Tunnel über ein unsicheres Netz zwischen zwei Endpunkten.
- F: Unterschied Site-to-Site und End-to-Site? | A: Site-to-Site verbindet ganze Netze über Gateways; End-to-Site einen einzelnen Client mit einem Netz.
- F: Warum gilt PPTP als unsicher? | A: Schwache Authentifizierung (MS-CHAPv2), kein Schlüsselmanagement – in Server 2025 abgekündigt.
- F: Was fehlt L2TP ohne IPsec? | A: Verschlüsselung und Paket-Integritätsprüfung.
- F: Auf welcher Schicht arbeitet IPsec? | A: OSI-Schicht 3.
- F: Unterschied AH und ESP? | A: AH: Integrität/Authentizität ohne Verschlüsselung. ESP: zusätzlich Verschlüsselung.
- F: Transport- vs. Tunnelmodus? | A: Transport: Header bleibt sichtbar. Tunnel: gesamtes Paket verschlüsselt in neuem Paket.
- F: Was ist eine SA? | A: Security Association – unidirektionale Vereinbarung über Schlüssel, Algorithmen, Partner und Lebensdauer.
- F: Welches Verfahren nutzt IKE zum Schlüsselaustausch? | A: Diffie-Hellman.
- F: Was ist NPS? | A: Network Policy Server – Microsofts RADIUS-Server mit Netzwerkrichtlinien.
- F: Ports von RADIUS? | A: UDP 1812 (Authentifizierung), 1813 (Accounting).
- F: Was ist IEEE 802.1X? | A: Portbasierte Zugangskontrolle – Authentifizierung am Switchport/WLAN vor dem Netzzugang.
- F: Drei Rollen bei 802.1X? | A: Supplicant (Client), Authenticator (Switch/AP), Authentication Server (RADIUS).
- F: Welches VPN-Protokoll geht über TCP 443? | A: SSTP.

## Quiz
? Welches IPsec-Protokoll verschlüsselt die Nutzdaten?
* ESP
- AH
- IKE
- L2TP

? In welchem IPsec-Modus wird auch der ursprüngliche IP-Header verschlüsselt?
* Tunnelmodus
- Transportmodus
- Aggressive Mode
- Main Mode

? Was ist der RADIUS-Client in einem WLAN mit 802.1X?
* Der Access Point
- Der Laptop des Benutzers
- Der Domänencontroller
- Der DNS-Server

? Ein Außendienstmitarbeiter verbindet seinen Laptop mit dem Firmennetz. Welcher VPN-Typ ist das?
* End-to-Site
- Site-to-Site
- End-to-End
- Site-to-End

? Warum scheitert nach der RRAS-Einrichtung jede VPN-Einwahl, obwohl die Zugangsdaten stimmen?
* Die NPS-Netzwerkrichtlinie verweigert standardmäßig den Zugriff
- IPsec ist nicht auf Schicht 3
- Der DHCP-Server ist autorisiert
- Das VPN nutzt IKEv2

? Welches IPsec-Protokoll bietet nur Integrität und Authentizität, aber keine Verschlüsselung?
* AH (Authentication Header)
- ESP
- IKE
- L2TP
! ESP verschlüsselt zusätzlich.

? Welches Protokoll handelt bei IPsec die Schlüssel aus?
* IKE (Internet Key Exchange)
- RADIUS
- TLS
- SNMP
! IKEv2 arbeitet über UDP 500 bzw. 4500 (NAT-Traversal).

? Welche Komponente prüft bei 802.1X die Anmeldedaten?
* Der Authentifizierungsserver (RADIUS, z. B. NPS)
- Der Switch bzw. Access Point
- Der DHCP-Server
- Der Client selbst
! Switch/AP sind nur Authenticator (RADIUS-Client).
