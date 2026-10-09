---
id: schule-vpn-radius-1
bereich: Prüfung
block: Schule
kapitel: Schule – Klausurfragen
titel: Windows Server 2022 – VPN, RADIUS und RADIUS-Proxy (Teil 1: 15 Prüfungsfragen)
stufe: Profi
typ: fragen
pruefungen: [Schule]
fach: Windows Server / AZ-800
quellen: [Prüfungsfragen.pdf, Prüfungsfragen_Antworten.pdf]
verweise: []
---

## Quiz

? Welche Rolle unter Windows Server 2022 stellt VPN-Dienste (z. B. für Remotezugriff) bereit?
- DHCP-Server
* Remotezugriff (RAS), Rollendienst Routing und RAS
- Webserver (IIS)
- Hyper-V
! Die Rolle Remotezugriff enthält unter anderem den VPN-/RAS-Dienst (DirectAccess und VPN) sowie Routing.
@ Schule VPN/RADIUS Frage 1

? Welches VPN-Protokoll gilt unter Windows als das sicherste und nutzt TLS für den Tunnelaufbau?
- PPTP
- L2TP/IPsec
* SSTP
- GRE
! SSTP kapselt PPP-Verkehr über eine TLS-Verbindung (Port 443) und durchdringt leicht Firewalls/Proxys.
@ Schule VPN/RADIUS Frage 2

? Über welchen Standardport läuft SSTP (Secure Socket Tunneling Protocol)?
- TCP 1723
* TCP 443
- UDP 500
- UDP 1701
! SSTP nutzt TCP 443, denselben Port wie HTTPS.
@ Schule VPN/RADIUS Frage 3

? Welche Protokollkombination verwendet L2TP typischerweise zur Verschlüsselung?
* L2TP mit IPsec (ESP)
- L2TP mit SSL
- L2TP ohne Verschlüsselung
- L2TP mit Kerberos
! L2TP bietet selbst keine Verschlüsselung; IPsec übernimmt Verschlüsselung und Integritätsschutz.
@ Schule VPN/RADIUS Frage 4

? Welches moderne VPN-Protokoll basiert auf IKEv2 und bietet eine gute automatische Wiederverbindung bei Netzwerkwechsel (z. B. WLAN zu Mobilfunk)?
- PPTP
* IKEv2-VPN
- SSTP
- GRE-Tunnel
! IKEv2/IPsec unterstützt VPN Reconnect und eignet sich gut für mobile Geräte.
@ Schule VPN/RADIUS Frage 5

? Welches VPN-Protokoll gilt wegen schwacher Verschlüsselung (MS-CHAPv2) als veraltet und sollte vermieden werden?
- SSTP
- IKEv2
* PPTP
- L2TP/IPsec
! PPTP gilt als unsicher und wird für neue Implementierungen nicht mehr empfohlen.
@ Schule VPN/RADIUS Frage 6

? Was ist ein Site-to-Site-VPN?
- Eine Verbindung eines Einzelclients zum Firmennetz
* Eine dauerhafte, verschlüsselte Verbindung zwischen zwei Netzwerkstandorten, meist über Router oder RRAS-Server
- Ein VPN nur für Mobiltelefone
- Ein Protokoll zur Namensauflösung
! Site-to-Site-VPNs verbinden zwei Standorte dauerhaft, im Gegensatz zum Client-VPN für Einzelbenutzer.
@ Schule VPN/RADIUS Frage 7

? Welche Komponente ist für die Autorisierung eingehender VPN-Verbindungen unter Windows Server zentral zuständig?
* Netzwerkrichtlinien (Network Policy Server, NPS) bzw. Netzwerkrichtlinien des RAS-Servers
- Der DHCP-Server
- Der Druckerserver
- Die Zertifikatvorlage Computer
! NPS wertet Netzwerkrichtlinien aus und entscheidet, ob eine Verbindung zugelassen wird.
@ Schule VPN/RADIUS Frage 8

? Was ist ein RADIUS-Server?
- Ein Server für die Namensauflösung
* Ein Authentifizierungs-, Autorisierungs- und Abrechnungsdienst (AAA) für Netzwerkzugriffe, z. B. VPN, WLAN und 802.1X
- Ein Dateifreigabedienst
- Ein Backup-Dienst für AD
! RADIUS (Remote Authentication Dial-In User Service) ist ein AAA-Protokoll.
@ Schule VPN/RADIUS Frage 9

? Welche Serverrolle stellt unter Windows Server 2022 die RADIUS-Funktionalität bereit?
* Netzwerkrichtlinien- und Zugriffsdienste (NPAS) mit der Rolle Network Policy Server (NPS)
- Active Directory-Zertifikatdienste
- DHCP-Server
- Druck- und Dokumentdienste
! NPAS/NPS implementiert RADIUS-Server- und Proxy-Funktionen unter Windows Server.
@ Schule VPN/RADIUS Frage 10

? Über welche Standardports kommuniziert RADIUS laut RFC 2865/2866 (moderne Implementierung)?
* UDP 1812 (Authentifizierung) und UDP 1813 (Abrechnung)
- TCP 1812 und TCP 1813
- UDP 1645 und UDP 1646 ausschließlich
- TCP 389 und TCP 636
! Die aktuellen Standardports sind UDP 1812 und 1813; 1645/1646 sind ältere, teils noch unterstützte Ports.
@ Schule VPN/RADIUS Frage 11

? Was muss auf dem NPS-Server und auf dem RADIUS-Client (z. B. VPN-Server, WLAN-Controller) übereinstimmen, damit die Kommunikation funktioniert?
* Der freigegebene geheime Schlüssel (Shared Secret)
- Der Computername
- Die Zeitzone
- Die MAC-Adresse
! Das gemeinsame Geheimnis authentifiziert RADIUS-Client und -Server gegeneinander.
@ Schule VPN/RADIUS Frage 12

? Welche Funktion erfüllt ein RADIUS-Proxy?
- Er speichert Benutzerkennwörter dauerhaft
* Er leitet RADIUS-Anforderungen anhand von Regeln (z. B. Realm/Domäne) an einen oder mehrere RADIUS-Server weiter, etwa in Partnernetzen oder bei mehreren Domänen
- Er vergibt IP-Adressen per DHCP
- Er ersetzt den DNS-Server
! Ein RADIUS-Proxy routet Anfragen anhand von Verbindungsanforderungsrichtlinien an das passende Backend weiter.
@ Schule VPN/RADIUS Frage 13

? Wie wird unter NPS festgelegt, ob eine eingehende RADIUS-Anfrage lokal verarbeitet oder an einen anderen Server weitergeleitet wird?
* Über eine Verbindungsanforderungsrichtlinie (Connection Request Policy)
- Über eine DHCP-Reservierung
- Über eine DNS-Zone
- Über eine Firewallregel allein
! Verbindungsanforderungsrichtlinien entscheiden anhand von Bedingungen, ob NPS selbst authentifiziert oder an eine Remote-RADIUS-Servergruppe weiterleitet.
@ Schule VPN/RADIUS Frage 14

? Wie werden mehrere RADIUS-Zielserver für die Weiterleitung durch einen NPS-Proxy organisiert?
* In einer Remote-RADIUS-Servergruppe
- In einer Organisationseinheit
- In einem DHCP-Bereich
- In einer DNS-Zone
! Remote-RADIUS-Servergruppen fassen Zielserver inklusive Lastverteilung und Failover zusammen.
@ Schule VPN/RADIUS Frage 15

