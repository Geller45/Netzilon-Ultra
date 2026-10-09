---
id: schule-vpn-radius-2
bereich: Prüfung
block: Schule
kapitel: Schule – Klausurfragen
titel: Windows Server 2022 – VPN, RADIUS und RADIUS-Proxy (Teil 2: 10 Szenarien)
stufe: Profi
typ: fragen
pruefungen: [Schule]
fach: Windows Server / AZ-800
quellen: [Prüfungsfragen.pdf, Prüfungsfragen_Antworten.pdf]
verweise: []
---

## Quiz

? Ein mittelständisches Unternehmen möchte Außendienstmitarbeitern einen VPN-Zugang aus dem Internet ermöglichen. Viele Mitarbeiter sitzen in Netzwerken mit restriktiven Firewalls, die nur HTTPS zulassen. Welches VPN-Protokoll ist am besten geeignet?
- PPTP, da es am einfachsten einzurichten ist
* SSTP, da es TCP 443 nutzt und restriktive Firewalls meist durchdringt
- L2TP ohne IPsec, da es schneller ist
- GRE-Tunneling
! SSTP tunnelt über TLS auf Port 443 und funktioniert daher auch dort, wo nur HTTPS erlaubt ist.
@ Schule VPN/RADIUS Szenario 1

? Mobile Mitarbeiter wechseln häufig zwischen WLAN und Mobilfunknetz; die VPN-Verbindung soll dabei möglichst ohne erneute Anmeldung bestehen bleiben. Welches Protokoll empfehlen Sie?
- PPTP
* IKEv2-VPN mit aktiviertem VPN Reconnect
- SSTP ohne Zertifikat
- L2TP ohne IPsec
! IKEv2 unterstützt nahtloses Wiederverbinden bei Netzwerkwechsel (VPN Reconnect).
@ Schule VPN/RADIUS Szenario 2

? Zwei Standorte eines Unternehmens (Berlin und München) sollen dauerhaft und verschlüsselt verbunden werden, ohne dass einzelne Benutzer sich jedes Mal anmelden. Welche Lösung passt?
* Ein Site-to-Site-VPN zwischen den RRAS-Routern beider Standorte
- Für jeden Mitarbeiter ein eigenes Client-VPN
- Ein DHCP-Relay zwischen den Standorten
- Eine DNS-Weiterleitung
! Site-to-Site-VPNs verbinden Netzwerke dauerhaft über die Gateway-Router, unabhängig vom einzelnen Benutzer.
@ Schule VPN/RADIUS Szenario 3

? Nach der Einrichtung eines VPN-Servers (RRAS) können sich Benutzer zwar verbinden, erhalten aber keine Berechtigung, und die Verbindung wird abgelehnt, obwohl das Benutzerkonto gültig ist. Was prüfen Sie zuerst?
- Die DHCP-Lease-Dauer
* Die Netzwerkrichtlinien (NPS) bzw. die Einwahlberechtigung des Benutzerkontos
- Die DNS-Zone
- Die Größe der Auslagerungsdatei
! Netzwerkrichtlinien und die Einwahlberechtigung im Benutzerkonto bestimmen, ob der Zugriff gewährt wird.
@ Schule VPN/RADIUS Szenario 4

? Ein Unternehmen möchte WLAN-Zugänge und VPN-Einwahlen zentral über 802.1X mit Benutzername und Kennwort gegen Active Directory authentifizieren. Die WLAN-Controller unterstützen RADIUS. Welche Serverrolle richten Sie ein?
* Netzwerkrichtlinien- und Zugriffsdienste mit der Rolle Network Policy Server (NPS) als RADIUS- Server
- Active Directory-Zertifikatdienste als alleinige Lösung
- DHCP-Server mit Reservierungen
- WSUS
! NPS übernimmt als RADIUS-Server die zentrale Authentifizierung und Autorisierung für WLAN und VPN.
@ Schule VPN/RADIUS Szenario 5

? Ein WLAN-Controller ist als RADIUS-Client auf dem NPS-Server konfiguriert, Anmeldungen schlagen jedoch mit einem Authentifizierungsfehler fehl. Die Benutzeranmeldedaten sind korrekt. Was ist die wahrscheinlichste Ursache?
* Der Shared Secret auf WLAN-Controller und NPS-Server stimmt nicht überein
- Der DHCP-Bereich ist erschöpft
- Die DNS-Zone ist nicht autorisiert
- Der Globale Katalog ist nicht erreichbar
! Ein falsches oder nicht übereinstimmendes gemeinsames Geheimnis führt zu RADIUS- Authentifizierungsfehlern.
@ Schule VPN/RADIUS Szenario 6

? Ein Unternehmen hat mehrere Standorte mit jeweils eigener Active Directory-Gesamtstruktur. Alle VPN- Einwahlen sollen über einen zentralen RADIUS-Punkt laufen, der Anfragen abhängig vom Realm (z. B. @standort1.com) an den jeweils zuständigen NPS-Server weiterleitet. Wie konfigurieren Sie das?
* Einen NPS-Server als RADIUS-Proxy mit Verbindungsanforderungsrichtlinien und Remote- RADIUS-Servergruppen je Standort
- Jeden VPN-Server direkt mit jedem NPS-Server verbinden
- Eine gemeinsame Gesamtstruktur ohne Vertrauensstellung einrichten
- Einen DHCP-Relay-Agent je Standort
! Ein RADIUS-Proxy leitet Anfragen je nach Bedingung (z. B. Realm) über Remote-RADIUS- Servergruppen an das passende Backend weiter.
@ Schule VPN/RADIUS Szenario 7

? Ein Partnerunternehmen soll seinen Mitarbeitern VPN-Zugriff auf gemeinsame Ressourcen ermöglichen; die Authentifizierung soll jedoch weiterhin gegen das AD des Partners erfolgen, nicht gegen die eigene Domäne. Welche Architektur passt?
* Der eigene NPS-Server agiert als RADIUS-Proxy und leitet die Anfragen an den RADIUS-Server des Partners weiter
- Alle Partnerbenutzer werden in die eigene Domäne aufgenommen
- Ein gemeinsamer DHCP-Server wird eingerichtet
- Die eigene CA stellt Zertifikate für den Partner aus
! RADIUS-Proxys ermöglichen föderierte Authentifizierung, ohne Konten in die eigene Domäne aufzunehmen.
@ Schule VPN/RADIUS Szenario 8

? In den RADIUS-Abrechnungsprotokollen (Accounting) auf dem NPS-Server fehlen Einträge, obwohl Benutzer sich erfolgreich per VPN verbinden. Was ist zu prüfen?
- Die DNS-Reverse-Lookupzone
* Ob RADIUS-Accounting (Port UDP 1813) auf dem VPN-Server bzw. RADIUS-Client aktiviert und korrekt auf den NPS-Server konfiguriert ist
- Die Kennwortrichtlinie
- Die Lease-Dauer des DHCP-Bereichs
! Ohne aktiviertes und korrekt konfiguriertes Accounting werden keine Protokolleinträge auf UDP 1813 gesendet.
@ Schule VPN/RADIUS Szenario 9

? Für eine Hochverfügbarkeitslösung sollen VPN-Einwahlen weiterhin funktionieren, auch wenn der primäre NPS-Server ausfällt. Was konfigurieren Sie auf dem RADIUS-Client (z. B. VPN-Server)?
- Nur einen einzigen RADIUS-Server ohne Backup
* Mehrere RADIUS-Server mit Priorität/Gewichtung (primär und sekundär) bzw. eine Remote- RADIUS-Servergruppe mit Failover
- Eine DHCP-Reservierung für den NPS-Server
- Eine statische Route zum NPS-Server
! RADIUS-Clients und -Proxys unterstützen mehrere Zielserver mit Priorität und Gewichtung für Lastverteilung und Ausfallsicherung.
@ Schule VPN/RADIUS Szenario 10

