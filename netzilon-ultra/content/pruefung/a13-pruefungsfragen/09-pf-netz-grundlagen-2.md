---
id: pf-netz-grundlagen-2
bereich: Prüfung
block: A13
kapitel: Prüfungsfragen Netzwerk (IPv4/IPv6, Routing, DNS, DHCP)
titel: Netzwerk – Grundlagen (IPv4, IPv6, Routing, DNS, DHCP) – Teil 2/2
stufe: Fortgeschritten
typ: fragen
quellen: [Windows Server 2022 – Netzwerk, 30 Prüfungsfragen]
verweise: [ap1-a4-ipv4, ap1-a4-ipv6, ap1-a4-routing, ap1-a5-dns, ap1-a5-dhcp]
---

## Quiz

? Netzwerk Frage 16: Wie lautet die Standardroute in IPv4?
- 127.0.0.1/32
- 255.255.255.255/32
* 0.0.0.0/0
- 169.254.0.0/16
! 0.0.0.0/0 (IPv6: ::/0) passt auf alle Ziele ohne spezifischere Route.

? Netzwerk Frage 17: Nach welcher Regel wählt Windows bei mehreren passenden Routen zum selben Ziel die Route aus?
- Die zuletzt hinzugefügte Route
- Die Route mit der höchsten Metrik
- Zufällig
* Längste Präfixübereinstimmung, bei Gleichstand die niedrigste Metrik
! Zuerst zählt die spezifischste Route (längster Präfix), dann die niedrigste Metrik.

? Netzwerk Frage 18: Wie aktivieren Sie die Paketweiterleitung (IP-Forwarding) auf einer Netzwerkschnittstelle per PowerShell?
- Set-NetFirewallProfile -Enabled False
* Set-NetIPInterface -Forwarding Enabled
- Enable-NetAdapter
- Disable-NetAdapterBinding -ComponentID ms_tcpip
! Set-NetIPInterface -Forwarding Enabled aktiviert das Weiterleiten.

? Netzwerk Frage 19: Welchen Standardport nutzt DNS für Abfragen?
- 25
- 67
* 53
- 443
! DNS nutzt Port 53 (UDP für Abfragen, TCP für Zonenübertragungen und große Antworten).

? Netzwerk Frage 20: Welcher DNS-Ressourceneintrag ordnet einem Namen eine IPv4-Adresse zu?
* A-Eintrag
- MX-Eintrag
- PTR-Eintrag
- SOA-Eintrag
! Der A-Eintrag (Host) verknüpft einen Namen mit einer IPv4-Adresse.

? Netzwerk Frage 21: Welcher DNS-Ressourceneintrag ordnet einem Namen eine IPv6-Adresse zu?
- CNAME
- NS
- SRV
* AAAA
! Der AAAA-Eintrag (Quad-A) enthält die IPv6-Adresse.

? Netzwerk Frage 22: Wofür wird ein PTR-Eintrag verwendet?
- Zur Vergabe von IP-Adressen
* Zur Auflösung einer IP-Adresse in einen Namen (Reverse-Lookup)
- Zur Zuordnung eines Aliasnamens
- Zur Definition des Mailservers
! PTR-Einträge liegen in Reverse-Lookupzonen (in-addr.arpa, ip6.arpa).

? Netzwerk Frage 23: Was kennzeichnet eine sekundäre DNS-Zone?
* Eine schreibgeschützte Kopie einer Primärzone, die per Zonenübertragung aktualisiert wird
- Eine beschreibbare Zone auf jedem DC
- Eine Zone nur für Weiterleitungen
- Eine Zone für DHCP-Daten
! Sekundärzonen erhalten ihre Daten per Zonenübertragung vom Primärserver.

? Netzwerk Frage 24: Wozu dient eine DNS-Weiterleitung (Forwarder)?
- Zur Spiegelung der Zonendatei
- Zur Vergabe von IP-Adressen
- Zur Kerberos-Authentifizierung
* Anfragen für Namen, die der Server nicht selbst auflösen kann, an einen anderen DNS-Server zu senden
! Forwarder leiten nicht lokal auflösbare Anfragen weiter, z. B. an den DNS des Providers.

? Netzwerk Frage 25: Welche vier Schritte umfasst die dynamische IP-Vergabe per DHCP (DORA)?
- Discover, Offer, Reply, Ack
* Discover, Offer, Request, Acknowledge
- Detect, Offer, Renew, Accept
- Discover, Order, Request, Accept
! DORA: Discover, Offer, Request, Acknowledge.

? Netzwerk Frage 26: Was ist in einer Active Directory-Umgebung vor dem produktiven Betrieb eines DHCP-Servers erforderlich?
- Ein Neustart des Clients
- Ein statisches Gateway
* Die Autorisierung des DHCP-Servers in AD
- Ein Schreibzugriff auf SYSVOL
! Nicht autorisierte DHCP-Server vergeben in AD-Domänen keine Adressen (Schutz vor Rogue-DHCP).

? Netzwerk Frage 27: Wie lange beträgt die Standard-Lease-Dauer eines DHCP-Bereichs (kabelgebunden) unter Windows Server?
- 1 Tag
* 8 Tage
- 30 Tage
- 1 Stunde
! Der Standardwert für Bereiche beträgt 8 Tage.

? Netzwerk Frage 28: Wozu dient eine DHCP-Reservierung?
- Zum Sperren eines Bereichs
- Zum Erhöhen der Lease-Dauer
- Zur Autorisierung des Servers
* Um einem Gerät anhand der MAC-Adresse immer dieselbe IP-Adresse zuzuweisen
! Reservierungen binden eine IP-Adresse an eine MAC-Adresse.

? Netzwerk Frage 29: Was bietet DHCP-Failover ab Windows Server 2012?
* Hochverfügbarkeit für einen Bereich zwischen zwei DHCP-Servern (Lastenausgleich oder Hot-Standby)
- Automatische IP-Vergabe ohne Server
- Verschlüsselung von DHCP-Paketen
- Ersatz für DNS
! Zwei Server können einen Bereich gemeinsam bereitstellen, im Lastenausgleich oder als Hot-Standby.

? Netzwerk Frage 30: Wozu dient ein DHCP-Relay-Agent?
- Zur Erhöhung der Bandbreite
- Zur Namensauflösung
* Zur Weiterleitung von DHCP-Broadcasts über Router in andere Subnetze zum DHCP-Server
- Zur Verwaltung von Reservierungen
! Der Relay-Agent (IP-Helper) leitet Discover-Broadcasts als Unicast an den DHCP-Server weiter.
