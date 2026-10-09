---
id: pf-netz-szenarien-2
bereich: Prüfung
block: A13
kapitel: Prüfungsfragen Netzwerk (IPv4/IPv6, Routing, DNS, DHCP)
titel: Netzwerk – Szenarien – Teil 2/2
stufe: Fortgeschritten
typ: fragen
quellen: [Windows Server 2022 – Netzwerk, 30 Szenariofragen]
verweise: [az800-dns, az800-dhcp, az800-dhcp-failover, az800-dns-weiterleitung, ap1-a4-routing]
---

## Quiz

? Netzwerk Szenario 16: Im Netz erhalten Clients per Router-Advertisement (SLAAC) IPv6-Adressen, aber keine DNS-Serverinformationen. Frage: Wie lösen Sie das Problem?
- Den IPv6-Stack deaktivieren
* Zustandsloses DHCPv6 einrichten (bzw. RDNSS im Router-Advertisement), damit DNS-Optionen verteilt werden
- Alle Adressen manuell vergeben
- Den Router neu starten
! Bei SLAAC liefert zustandsloses DHCPv6 zusätzliche Optionen wie DNS-Server.

? Netzwerk Szenario 17: Eine Anwendung funktioniert nur mit IPv4, und ein Kollege möchte IPv6 auf dem Server über die Registry deaktivieren. Frage: Was ist die bessere Empfehlung?
- IPv6 vollständig deaktivieren und Komponenten entfernen
- IPv6 deaktivieren und Firewall abschalten
* IPv6 aktiviert lassen und nur die Anwendung/Namensauflösung auf IPv4 ausrichten (ggf. IPv4 bei der Präfixrichtlinie bevorzugen)
- Den Server auf Windows Server 2008 zurücksetzen
! Microsoft rät davon ab, IPv6 vollständig zu deaktivieren; die IPv4-Bevorzugung ist die gezielte Alternative.

? Netzwerk Szenario 18: Ein Windows Server 2022 hat zwei Netzwerkkarten: LAN (10.1.0.5/24) und DMZ (10.2.0.5/24). Er soll den Verkehr zwischen beiden Netzen weiterleiten. Frage: Was tun Sie?
- Nichts, Windows routet standardmäßig
- Zwei Standardgateways auf beiden Karten eintragen
- Die DNS-Rolle installieren
* Routing aktivieren (Set-NetIPInterface -Forwarding Enabled bzw. Rolle Remotezugriff/Routing) und auf den Clients den Server als Gateway bzw. Route eintragen
! IP-Forwarding muss aktiviert werden, und die Clients müssen den Router als Gateway nutzen.

? Netzwerk Szenario 19: Der Server 10.1.0.5 hat als Gateway den Router 10.1.0.1. Im Netz 10.2.0.0/24 liegen weitere Server, die über den Router 10.1.0.254 erreichbar sind. Ein Ping dorthin scheitert. Frage: Wie lösen Sie es?
- Die Subnetzmaske ändern
* Eine statische Route hinzufügen, z. B. New-NetRoute -DestinationPrefix 10.2.0.0/24 -NextHop 10.1.0.254 -InterfaceAlias Ethernet
- Den DNS-Server neu starten
- DHCP-Bereich erweitern
! Für spezielle Zielnetze wird eine statische Route über den passenden Router benötigt.

? Netzwerk Szenario 20: Ein Multihomed-Server (LAN und WAN) hat auf beiden Netzwerkkarten ein Standardgateway eingetragen. Die Verbindungen sind unregelmäßig. Frage: Was ist zu tun?
- Beide Standardgateways belassen
- Die WAN-Karte deaktivieren
* Nur ein Standardgateway konfigurieren und für andere Netze statische Routen verwenden
- Die Metrik auf 0 setzen
! Ein Host sollte nur eine Standardroute haben; weitere Ziele werden über statische Routen erreicht.

? Netzwerk Szenario 21: Clients im Firmennetz haben als DNS-Server 8.8.8.8 eingetragen. Interne Servernamen wie fileserver.contoso.local lassen sich nicht auflösen, Internetnamen schon. Frage: Wie beheben Sie das?
* Als DNS-Server den internen DNS-Server (z. B. den DC) eintragen und dort Weiterleitungen für das Internet konfigurieren
- Die Hosts-Datei aller Clients pflegen
- Den DHCP-Server neu installieren
- IPv6 deaktivieren
! Interne Zonen werden nur vom internen DNS aufgelöst; externe Namen erhalten die Clients über Weiterleitungen.

? Netzwerk Szenario 22: Der Webserver web01 (A-Eintrag) soll zusätzlich unter dem Namen intranet.contoso.local erreichbar sein, ohne eine zweite IP-Adresse zu verwenden. Frage: Was legen Sie in DNS an?
- Einen zweiten A-Eintrag mit anderer IP
* Einen CNAME-Eintrag intranet, der auf web01.contoso.local verweist
- Einen MX-Eintrag
- Einen PTR-Eintrag intranet
! Ein CNAME ist ein Alias auf einen bestehenden Namen.

? Netzwerk Szenario 23: Der Server app01 hat nach einem Umzug die neue Adresse 10.0.0.50, doch einige Clients verbinden sich weiterhin mit der alten IP. Frage: Was ist die wahrscheinlichste Ursache und Lösung?
- Der DHCP-Server ist defekt
- Die Domäne ist nicht funktionsfähig
- Die Firewall blockiert Port 53
* Veraltete Einträge im DNS-Client-/Servercache; Eintrag prüfen, ipconfig /flushdns und Clear-DnsServerCache ausführen (TTL beachten)
! Gecachte Antworten gelten bis zum Ablauf der TTL; Caches lassen sich manuell leeren.

? Netzwerk Szenario 24: Zwei DNS-Server verwalten die Zone contoso.local: DNS01 (primär) und DNS02 (sekundär). Änderungen am Primärserver erscheinen auf DNS02 nicht. Frage: Was prüfen Sie?
- Die Uhrzeit der Clients
- Die DHCP-Lease-Dauer
* Die Zonenübertragung (Übertragung an DNS02 erlaubt?) und die Seriennummer der Zone
- Die Größe der Auslagerungsdatei
! Sekundärserver erhalten Änderungen per Zonenübertragung; die Seriennummer muss erhöht werden.

? Netzwerk Szenario 25: Ein Administrator fragt mit nslookup 10.1.0.5 den Namen eines Servers ab und erhält "Unknown", obwohl der A-Eintrag existiert. Frage: Was fehlt?
* Eine Reverse-Lookupzone 0.1.10.in-addr.arpa mit PTR-Eintrag für den Host
- Ein MX-Eintrag
- Ein zweiter DHCP-Bereich
- Ein SRV-Eintrag
! Für die Namensauflösung von IP-Adressen werden Reverse-Lookupzonen und PTR-Einträge benötigt.

? Netzwerk Szenario 26: Ihre Firma arbeitet mit dem Partner fabrikam.com zusammen. Anfragen für partner.fabrikam.com sollen direkt an dessen DNS-Server 203.0.113.53 gehen; alle anderen Anfragen wie bisher. Frage: Welche Funktion richten Sie ein?
- Eine sekundäre Zone für das Internet
* Eine bedingte Weiterleitung (Conditional Forwarder) für fabrikam.com an 203.0.113.53
- Einen zusätzlichen DHCP-Bereich
- Ein neues Standardgateway
! Bedingte Weiterleitungen leiten Anfragen für bestimmte Domänen gezielt weiter.

? Netzwerk Szenario 27: Ein DHCP-Bereich umfasst 192.168.10.1 bis 192.168.10.254. Die Adressen .1 bis .20 sind für Server mit statischer Konfiguration reserviert. Frage: Wie verhindern Sie Adresskonflikte?
- Nichts, DHCP prüft automatisch
- Den Bereich löschen
- Die Lease-Dauer auf 1 Stunde setzen
* Einen Ausschlussbereich 192.168.10.1–192.168.10.20 definieren
! Ausschlussbereiche werden nicht vergeben und schützen statische Adressen.

? Netzwerk Szenario 28: Ein Netzwerkdrucker soll immer die Adresse 192.168.10.150 erhalten, aber weiterhin per DHCP konfiguriert werden (Gateway, DNS). Frage: Was konfigurieren Sie?
* Eine DHCP-Reservierung für die MAC-Adresse des Druckers auf 192.168.10.150
- Einen Ausschlussbereich für den Drucker
- Eine zweite Domäne
- Einen Forwarder
! Reservierungen liefern feste Adressen inklusive der Bereichsoptionen.

? Netzwerk Szenario 29: Der DHCP-Server steht im Subnetz 192.168.10.0/24. Clients im Subnetz 192.168.20.0/24 erhalten keine Adresse, im Subnetz 10 funktioniert alles. Ein Router trennt beide Netze. Frage: Was fehlt?
- Ein zweiter DNS-Server
* Ein DHCP-Bereich für 192.168.20.0/24 und ein DHCP-Relay-Agent (IP-Helper) auf dem Router
- Ein WINS-Server
- Ein neuer Domänencontroller
! Broadcasts passieren Router nicht; ein Relay leitet sie an den DHCP-Server weiter, und dieser braucht den passenden Bereich.

? Netzwerk Szenario 30: Der einzige DHCP-Server fällt aus, und Clients erhalten keine Adressen mehr. Sie sollen die Verfügbarkeit erhöhen, ohne die Konfiguration zweimal manuell zu pflegen. Frage: Was implementieren Sie?
- Einen zweiten, unabhängigen DHCP-Server mit identischen Bereichen ohne Verbindung
- Statische IP-Adressen für alle Clients
* DHCP-Failover (Hot-Standby oder Lastenausgleich) zwischen zwei Servern
- Eine APIPA-Konfiguration
! DHCP-Failover repliziert Bereiche und Leases zwischen zwei Servern und vermeidet Adresskonflikte.
