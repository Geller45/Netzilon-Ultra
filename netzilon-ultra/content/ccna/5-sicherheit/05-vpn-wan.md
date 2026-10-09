---
id: ccna-vpn-wan
bereich: CCNA
block: CCNA 1.x / 2.x
kapitel: Network Fundamentals
titel: WAN und VPN – Site-to-Site, Remote-Access, IPsec, GRE, SD-WAN
stufe: Fortgeschritten
fach: TCP/IP – CCNA – Basic
pruefungen: [CCNA, AP2]
quellen: [CCNA_200-301_Notes_-_Jeremys_IT_Lab.pdf, 200_301_CCNA_v1.0_2.pdf, VPN.md, DSL.md, Mobilfunknetz.md]
verweise: [ccna-security-grundlagen, ccna-architekturen, netz-datenuebertragung-switching, ccna-nat]
---

## Profi

### WAN-Technologien
- **Leased Line** (Mietleitung, Punkt-zu-Punkt, z. B. 2 Mbit/s E1/T1): dediziert, teuer, garantierte Bandbreite.
- **MPLS-VPN (Provider-Netz)**: Provider transportiert Kundennetze über Labels getrennt (L3VPN), QoS möglich.
- **Metro Ethernet** (E-Line, E-LAN): WAN über Ethernet-Schnittstellen.
- **Internet-Anbindung**: DSL/VDSL (Kupfer, ADSL asymmetrisch), Kabel (DOCSIS), Glasfaser (FTTH/GPON), **Mobilfunk 4G/5G**, Satellit.
- **WAN-Topologien**: Punkt-zu-Punkt, **Hub-and-Spoke**, Full Mesh, Partial Mesh.
- **Redundanz**: Dual-Homing (zwei Provider/Links), BGP, Floating Static.

### VPN – Virtual Private Network
Verschlüsselter **Tunnel** über ein unsicheres Netz (Internet).
- **Site-to-Site-VPN**: verbindet zwei Netze (Router/Firewalls, dauerhaft), Clients merken nichts. Typisch **IPsec**.
- **Remote-Access-VPN**: einzelner Benutzer/Gerät → Firmennetz; Client-Software (Cisco AnyConnect/Secure Client, OpenVPN, WireGuard), **TLS/SSL-VPN** (Port 443) oder IPsec/IKEv2.
- **Clientless SSL-VPN**: Browserzugriff auf Webanwendungen.

### IPsec
Framework (IETF) für Schicht-3-Sicherheit: **Vertraulichkeit** (Encryption: AES, 3DES), **Integrität** (Hash: SHA-256, HMAC), **Authentifizierung** (Pre-Shared Key oder Zertifikate/RSA), **Anti-Replay**, Schlüsselaustausch **Diffie-Hellman**.
- **IKE Phase 1** (ISAKMP SA, UDP 500, NAT-T UDP 4500): Verhandlung von Verschlüsselung, Hash, DH-Gruppe, Authentifizierung → sicherer Kanal.
- **IKE Phase 2** (IPsec SA): Verhandlung des Datenverkehrs-Schutzes (Transformset).
- **Protokolle**: **ESP** (IP-Protokoll 50: Verschlüsselung + Integrität + Auth.), **AH** (51: nur Integrität + Auth., **keine** Verschlüsselung, nicht NAT-tauglich).
- **Modi**: **Tunnelmodus** (ganzes IP-Paket verpackt, neuer Header – Site-to-Site), **Transportmodus** (nur Payload – Host-zu-Host).
- **IKEv2** ist der Nachfolger (schneller, robuster).

### GRE und GRE über IPsec
**GRE** (IP-Protokoll 47) kapselt beliebige Protokolle (Multicast, Routing-Protokolle wie OSPF) in einen Tunnel – **ohne Verschlüsselung**. Kombination **GRE over IPsec** liefert Routing + Sicherheit. **DMVPN** baut dynamisch Spoke-to-Spoke-Tunnel.

### SD-WAN
Software-definiertes WAN: zentrale Steuerung (Controller), Transportunabhängigkeit (MPLS, Internet, LTE), Anwendungsbasierte Pfadwahl.

## Einfach

Ein **VPN** ist ein **Geheimtunnel durch eine öffentliche Straße**. Das Internet ist wie eine Straße, auf der jeder deine Pakete sehen kann. Mit einem VPN stopfst du alles in einen undurchsichtigen, versiegelten Container, der nur am anderen Ende wieder aufgemacht wird. Von außen sieht man nur: „Da fährt ein Container von A nach B.“

Es gibt zwei Sorten:
- **Site-to-Site**: Zwei Firmenstandorte bauen **einen festen Tunnel** zwischen ihren Routern. Die Mitarbeiter merken gar nichts, sie arbeiten, als wären beide Büros nebeneinander.
- **Remote-Access**: Du arbeitest im Home-Office und startest ein Programm auf dem Laptop. Es baut einen Tunnel zur Firma, und plötzlich bist du „im Firmennetz“.

Der Tunnel wird in zwei Schritten gebaut (**IPsec**): Erst treffen sich die Router und einigen sich auf die Geheimsprache und beweisen, dass sie wirklich die richtigen sind (Phase 1). Dann bauen sie den eigentlichen Tunnel (Phase 2). **ESP** ist der Container mit Schloss; **AH** nur ein Siegel (zeigt, dass nichts verändert wurde, aber man kann hineinsehen).

**GRE** ist ein Tunnel ohne Schloss – der Container ist durchsichtig, aber dafür passt auch ein Spezialtransport (z. B. Routing-Nachrichten) hinein. Man packt oft GRE in IPsec.

Zum Verbinden von Standorten gab es früher **Mietleitungen** (eigene Straße, sehr teuer) und **MPLS** (eine gemietete, abgetrennte Fahrspur beim Provider). Heute nutzt man zunehmend normales Internet plus VPN, gesteuert per **SD-WAN**.

## Merksatz
- **Site-to-Site = Standorte (IPsec), Remote-Access = Nutzer (TLS/IPsec).**
- **IKE Phase 1: sicherer Kanal, Phase 2: Datentunnel.**
- **ESP (50) verschlüsselt, AH (51) nicht, GRE (47) nicht.**
- **Tunnelmodus = ganzes Paket neu verpackt.**
- **IKE UDP 500, NAT-T UDP 4500.**

## Prüfungsfalle
- **GRE verschlüsselt nicht** – oft mit IPsec kombinieren, wenn Routing-Protokolle gebraucht werden.
- **AH und NAT** vertragen sich nicht (Header-Integrität).
- IPsec-Protokollnummern **50/51** sind IP-Protokolle, **keine** TCP/UDP-Ports.
- **Hub-and-Spoke** → Spoke-zu-Spoke-Verkehr läuft über den Hub.
- Ein **VPN ersetzt keine Firewall** und garantiert nicht die Sicherheit des Endgeräts.
- Remote-Access mit **SSL/TLS** = TCP 443.
- **PSK** muss auf beiden Seiten identisch sein.

## Grafik
### IPsec-Aufbau
1. Router1 -> Router2: IKE Phase 1 (UDP 500) – Parameter-Vorschlag
2. Router2 -> Router1: Auswahl, DH-Austausch, Authentifizierung
3. Text: ISAKMP SA steht (verschlüsselter Kanal)
4. Router1 -> Router2: IKE Phase 2 – Transformset, Proxy-ID
5. Text: IPsec SAs stehen
6. PC1 -> Router1: Klartextpaket 192.168.1.5 → 192.168.2.5
7. Router1 -> Router2: ESP-Paket mit neuem IP-Header (Tunnelmodus)
8. Router2 -> PC2: entschlüsselt und zugestellt

### Remote-Access
1. Laptop -> VPN-Gateway: TLS-Handshake (TCP 443)
2. VPN-Gateway -> Laptop: Zertifikat, Authentifizierung (MFA)
3. VPN-Gateway -> Laptop: Interne IP 10.8.0.15 zugewiesen
4. Laptop -> VPN-Gateway: Verschlüsselter Datenverkehr in das Firmennetz

## Lab
**Packet Tracer: R1 (HQ) und R2 (Filiale) über ISP, Site-to-Site IPsec**

### Cisco IOS
```
R1(config)# crypto isakmp policy 10
R1(config-isakmp)# encryption aes 256
R1(config-isakmp)# hash sha256
R1(config-isakmp)# authentication pre-share
R1(config-isakmp)# group 14
R1(config)# crypto isakmp key LabKey address 203.0.113.2
R1(config)# crypto ipsec transform-set TS esp-aes 256 esp-sha256-hmac
R1(config)# access-list 110 permit ip 192.168.1.0 0.0.0.255 192.168.2.0 0.0.0.255
R1(config)# crypto map CMAP 10 ipsec-isakmp
R1(config-crypto-map)# set peer 203.0.113.2
R1(config-crypto-map)# set transform-set TS
R1(config-crypto-map)# match address 110
R1(config)# interface g0/1
R1(config-if)# crypto map CMAP
R1# show crypto isakmp sa
R1# show crypto ipsec sa
```
1. R2 spiegelbildlich konfigurieren (Peer 203.0.113.1, ACL vertauscht).
2. Ping PC1 → PC2: erster Ping Timeout (Tunnelaufbau), danach OK. (Schlüssel nur im Lab.)
3. Variante GRE: `interface tunnel 0` / `tunnel source g0/1` / `tunnel destination …` / `ip address 10.9.9.1 255.255.255.252`.

## Befehle
- `crypto isakmp policy 10` – IKE-Phase-1-Richtlinie
- `crypto ipsec transform-set TS esp-aes esp-sha-hmac` – Phase 2
- `crypto map NAME 10 ipsec-isakmp` – Crypto-Map
- `show crypto isakmp sa` – Phase-1-Status
- `show crypto ipsec sa` – Phase-2-Status und Zähler
- `interface tunnel 0` – GRE-Tunnel

## Übungen
- A: Unterschied Site-to-Site und Remote-Access? | L: Site-to-Site verbindet Netze dauerhaft über Gateways; Remote-Access verbindet einen Benutzer per Client.
- A: ESP vs. AH? | L: ESP (Proto 50) verschlüsselt + Integrität; AH (51) nur Integrität/Authentisierung.
- A: Welche Ports/Protokolle nutzt IPsec? | L: IKE UDP 500, NAT-T UDP 4500, ESP IP-Proto 50, AH 51.
- A: Warum GRE over IPsec? | L: GRE transportiert Multicast/Routing, IPsec liefert Verschlüsselung.
- A: Tunnel- vs. Transportmodus? | L: Tunnelmodus verpackt das ganze Paket (Site-to-Site), Transportmodus nur die Nutzdaten (Host-zu-Host).
- A: Nennen Sie drei WAN-Anschlussarten. | L: Mietleitung, MPLS-VPN, Metro Ethernet, DSL/Kabel/FTTH, Mobilfunk.

## Karteikarten
- F: Was ist ein VPN? | A: Verschlüsselter Tunnel über ein öffentliches Netz.
- F: Site-to-Site-VPN? | A: Dauerhafte Verbindung zweier Netze über Gateways.
- F: IKE-Port? | A: UDP 500 (NAT-T: 4500).
- F: ESP-Protokollnummer? | A: 50.
- F: AH-Protokollnummer? | A: 51.
- F: GRE-Protokollnummer? | A: 47, ohne Verschlüsselung.
- F: Phase 1 vs. Phase 2? | A: Aufbau des sicheren Kanals vs. des IPsec-Datentunnels.
- F: Was ist SD-WAN? | A: Software-definiertes WAN mit zentraler Steuerung und flexibler Pfadwahl.
- F: Was ist Hub-and-Spoke? | A: Zentrale (Hub) verbindet Außenstellen (Spokes).
- F: Welches VPN nutzt Port 443? | A: SSL/TLS-VPN.

## Quiz
? Welches Protokoll verschlüsselt in IPsec?
* ESP
- AH
- GRE
- ICMP
? Welche UDP-Portnummer nutzt IKE?
* 500
- 443
- 22
- 161
? Verschlüsselt GRE?
* Nein
- Ja, AES
- Ja, 3DES
- Nur bei IPv6
? Welcher VPN-Typ verbindet zwei Standorte dauerhaft?
* Site-to-Site
- Remote-Access
- Clientless
- Proxy
? Was verpackt der IPsec-Tunnelmodus?
* Das gesamte ursprüngliche IP-Paket
- Nur die Nutzdaten
- Nur den Header
- Nur das TCP-Segment
? Welche IP-Protokollnummer hat AH?
* 51
- 50
- 47
- 89
? Welche Topologie leitet Spoke-zu-Spoke über die Zentrale?
* Hub-and-Spoke
- Full Mesh
- Bus
- Stern ohne Hub
? Wofür wird Diffie-Hellman genutzt?
* Schlüsselaustausch
- Hashing
- Paketfilter
- Routing
? Was bietet SD-WAN?
* Zentrale Steuerung und Pfadwahl über mehrere Transporte
- Verschlüsselte DNS-Anfragen
- Layer-2-Loop-Schutz
- Nur MPLS
