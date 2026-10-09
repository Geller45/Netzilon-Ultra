---
id: pf-netz-szenarien-1
bereich: Prüfung
block: A13
kapitel: Prüfungsfragen Netzwerk (IPv4/IPv6, Routing, DNS, DHCP)
titel: Netzwerk – Szenarien – Teil 1/2
stufe: Fortgeschritten
typ: fragen
quellen: [Windows Server 2022 – Netzwerk, 30 Szenariofragen]
verweise: [az800-dns, az800-dhcp, az800-dhcp-failover, az800-dns-weiterleitung, ap1-a4-routing]
---

## Quiz

? Netzwerk Szenario 1: Ein Server hat zwei Netzwerkkarten: LAN (192.168.1.0/24) und WAN mit öffentlicher IP-Adresse. Alle LAN-Clients sollen über diesen Server ins Internet gelangen. Eine separate Hardware-Firewall ist nicht vorhanden. Frage: Was konfigurieren Sie?
- Einen DHCP-Relay-Agent auf der WAN-Karte
* Die Rolle Remotezugriff mit dem Rollendienst Routing installieren, NAT auf der WAN-Schnittstelle einrichten und den Server als Standardgateway der Clients eintragen
- Eine DNS-Weiterleitung auf 127.0.0.1
- IP-Forwarding auf allen Karten deaktivieren
! Ein Router mit NAT übersetzt die privaten Adressen in die öffentliche Adresse; die Clients nutzen ihn als Gateway.

? Netzwerk Szenario 2: Ein Server (10.5.0.20/24) erreicht andere Server im selben Subnetz, aber weder das Internet noch andere Subnetze. route print zeigt keine Route zu 0.0.0.0. Frage: Was fehlt?
* Ein Standardgateway bzw. eine Standardroute 0.0.0.0/0 zum Router
- Ein DHCP-Bereich
- Eine Reverse-Lookupzone
- Ein Serverzertifikat
! Ohne Standardroute weiß der Host nicht, wohin Pakete für Ziele außerhalb des Subnetzes gesendet werden sollen.

? Netzwerk Szenario 3: Auf einem Server existieren zwei Routen: 10.3.0.0/16 über Gateway A (Metrik 10) und 10.3.5.0/24 über Gateway B (Metrik 50). Der Server sendet ein Paket an 10.3.5.7. Frage: Über welches Gateway wird das Paket gesendet?
- Gateway A, weil die Metrik niedriger ist
- Zufällig über eines der beiden
- Über das Standardgateway
* Gateway B, weil die spezifischere Route (längerer Präfix) Vorrang vor der Metrik hat
! Windows wählt zuerst die Route mit der längsten Präfixübereinstimmung; die Metrik entscheidet nur bei gleichem Präfix.

? Netzwerk Szenario 4: Ein Administrator legt mit "route add 10.4.0.0 mask 255.255.0.0 10.1.0.254" eine Route an. Nach dem Neustart des Servers ist die Route verschwunden. Frage: Wie legen Sie die Route dauerhaft an?
- Den Server nie mehr neu starten
- Die Route in den Ordner SYSVOL kopieren
* Mit dem Parameter -p (route add ... -p) oder mit New-NetRoute (persistenter Speicher) anlegen
- Einen DNS-Eintrag für das Zielnetz anlegen
! route add ohne -p gilt nur bis zum Neustart; mit -p bzw. New-NetRoute wird die Route dauerhaft gespeichert.

? Netzwerk Szenario 5: Die Vertriebsabteilung betreibt einen eigenen DNS-Server (dns.sales.contoso.com, 10.20.0.53) und soll die Subdomäne sales.contoso.com selbst verwalten. Die Zone contoso.com liegt auf dem zentralen DNS-Server. Frage: Wie richten Sie das ein?
- Eine sekundäre Zone contoso.com auf dem Vertriebsserver
* In der Zone contoso.com die Subdomäne sales delegieren (NS-Eintrag und A-Eintrag für dns.sales.contoso.com)
- Einen DHCP-Bereich für den Vertrieb
- Einen CNAME sales, der auf dns verweist
! Eine Delegierung überträgt die Verwaltung der Subdomäne an einen anderen DNS-Server.

? Netzwerk Szenario 6: Die Domäne contoso.com wird öffentlich von einem Provider aufgelöst. Intern soll intranet.contoso.com auf 10.0.0.5 zeigen, extern auf die öffentliche Adresse. Frage: Welche Lösung setzen Sie um?
* Split-DNS: Auf den internen DNS-Servern eine Zone contoso.com mit den internen Einträgen führen; die externe Zone bleibt beim Provider
- Auf jedem Client die Hosts-Datei pflegen
- Nur einen CNAME anlegen
- Einen DHCP-Bereich mit Domänenoption anlegen
! Bei Split-DNS liefern interne und externe DNS-Server für denselben Namen unterschiedliche Antworten.

? Netzwerk Szenario 7: Drei Webserver (10.0.0.11 bis 10.0.0.13) sollen unter dem Namen www.contoso.com erreichbar sein und Anfragen möglichst gleichmäßig verteilt bekommen. Eine Lastenausgleichslösung steht nicht zur Verfügung. Frage: Was tun Sie im DNS?
- Nur einen A-Eintrag für den ersten Server anlegen
- Einen MX-Eintrag anlegen
* Drei A-Einträge mit dem Namen www anlegen (Round Robin)
- Einen SRV-Eintrag anlegen
! DNS Round Robin liefert die Adressen abwechselnd zurück; eine Ausfallerkennung erfolgt dabei nicht.

? Netzwerk Szenario 8: Ein neu installierter DHCP-Server in einer AD-Domäne hat einen aktivierten Bereich, vergibt aber keine Adressen. Im DHCP-Manager erscheint ein roter Pfeil am Servernamen. Frage: Was ist die Ursache und Lösung?
- Die Subnetzmaske ist falsch
- Der DNS-Server fehlt
- Der Bereich ist zu groß
* Der DHCP-Server ist in Active Directory nicht autorisiert; Autorisierung durchführen (z. B. Add-DhcpServerInDC)
! In AD-Umgebungen müssen DHCP-Server autorisiert werden; der rote Pfeil zeigt einen nicht autorisierten Server.

? Netzwerk Szenario 9: Im Gästenetz (192.168.50.0/24) ist der DHCP-Bereich (.10 bis .60, Lease-Dauer 8 Tage) durch wechselnde Geräte täglich erschöpft, neue Geräte erhalten keine Adresse. Frage: Was ist sinnvoll?
- Alle Geräte statisch konfigurieren
* Den Bereich vergrößern und die Lease-Dauer für das Gästenetz deutlich verkürzen (z. B. auf wenige Stunden)
- Den Server neu autorisieren
- APIPA aktivieren
! Kurze Leases geben Adressen schneller frei; ein größerer Bereich schafft zusätzliche Kapazität.

? Netzwerk Szenario 10: Clients im Büro erhalten plötzlich das Standardgateway 192.168.0.1 und einen unbekannten DNS-Server, obwohl der zentrale DHCP-Server (10.0.0.1) andere Werte verteilt. Ein Mitarbeiter hat einen privaten WLAN-Router am Netzwerk angeschlossen. Frage: Was ist die Ursache und Gegenmaßnahme?
- Der DNS-Cache der Clients ist beschädigt
- Der Bereich des zentralen Servers ist zu klein
* Ein nicht autorisierter DHCP-Server (Rogue-DHCP) im Netz; Gerät entfernen und DHCP-Snooping auf den Switches aktivieren
- Die Kerberos-Zeit weicht ab
! Ein privater Router mit aktivem DHCP antwortet schneller und verteilt falsche Einstellungen.

? Netzwerk Szenario 11: Ein Unternehmen plant Subnetze für Abteilungen mit je bis zu 100 Hosts. Verfügbar ist das Netz 10.10.0.0/16. Frage: Welche Präfixlänge ist am besten geeignet?
* /25 (126 nutzbare Hosts)
- /26 (62 nutzbare Hosts)
- /27 (30 nutzbare Hosts)
- /28 (14 nutzbare Hosts)
! Für 100 Hosts werden mindestens 7 Hostbits benötigt; /25 bietet 126 nutzbare Adressen.

? Netzwerk Szenario 12: Ein Windows-11-Client zeigt die IP-Adresse 169.254.33.12 und hat keinen Zugriff auf das Netzwerk. Im Netz gibt es einen DHCP-Server. Frage: Was ist die wahrscheinlichste Ursache?
- Der DNS-Server ist offline
* Der Client hat keine Antwort vom DHCP-Server erhalten (kein erreichbarer DHCP-Server, Bereich erschöpft oder fehlender Relay)
- Das Standardgateway ist falsch eingetragen
- Die Domäne ist gesperrt
! 169.254.x.x ist APIPA und entsteht, wenn kein DHCP-Server antwortet.

? Netzwerk Szenario 13: Zwei PCs hängen am selben Switch: PC1 hat 192.168.1.10/24, PC2 hat 192.168.2.20/24. Ein Ping von PC1 zu PC2 schlägt fehl. Frage: Warum?
- Der Switch blockiert ICMP
- Die MAC-Adressen sind identisch
* Die Geräte liegen in unterschiedlichen IP-Subnetzen; ohne Router oder Layer-3-Switch besteht keine Verbindung
- DHCP ist deaktiviert
! Unterschiedliche Subnetze kommunizieren nur über einen Router.

? Netzwerk Szenario 14: Sie konfigurieren einen neuen Server: IP 10.0.0.10/24, Gateway 10.0.0.1, DNS 10.0.0.2. Die Schnittstelle heißt "Ethernet". Sie möchten dies per PowerShell tun. Frage: Welche Befehle sind korrekt?
- Set-IPConfig 10.0.0.10; Set-Gateway 10.0.0.1
- New-NetRoute 10.0.0.10; Add-DnsServer 10.0.0.2
- netsh set ip 10.0.0.10
* New-NetIPAddress -InterfaceAlias Ethernet -IPAddress 10.0.0.10 -PrefixLength 24 -DefaultGateway 10.0.0.1 sowie Set-DnsClientServerAddress -InterfaceAlias Ethernet -ServerAddresses 10.0.0.2
! New-NetIPAddress setzt IP und Gateway, Set-DnsClientServerAddress den DNS-Server.

? Netzwerk Szenario 15: Ein Server soll die statische IPv6-Adresse 2001:db8:10::10 mit einem 64-Bit-Präfix erhalten (Schnittstelle "Ethernet"). Frage: Welcher Befehl ist korrekt?
* New-NetIPAddress -InterfaceAlias Ethernet -IPAddress 2001:db8:10::10 -PrefixLength 64
- New-NetIPAddress -IPAddress 2001:db8:10::10/32
- Set-NetIPv6Address 2001:db8:10::10 255.255.255.0
- Add-IPv6 -Address 2001:db8:10::10
! IPv6 wird mit Präfixlänge konfiguriert, nicht mit einer Subnetzmaske.
