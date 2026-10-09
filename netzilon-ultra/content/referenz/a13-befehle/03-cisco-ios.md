---
id: ref-cisco-ios
bereich: Referenz
block: A13
kapitel: Befehlsreferenz
titel: Cisco-IOS-Befehlsreferenz (CCNA-Basis)
stufe: Fortgeschritten
typ: referenz
quellen: [Eigene Zusammenstellung, Cisco-IOS-Grundlagen]
verweise: [ap1-a4-vlan, ap1-a4-routing, ap1-a5-firewall, legacy-klartextprotokolle]
---

## Profi

Die Cisco-IOS-Kommandozeile hat **Modi**, erkennbar am Prompt: `Switch>` (**Benutzermodus**), `Switch#` (**privilegierter Modus**), `Switch(config)#` (**globale Konfiguration**), `Switch(config-if)#` (Schnittstelle), `Switch(config-line)#` (Leitung), `Switch(config-vlan)#`, `Router(config-router)#`. Mit `?` bekommt man Hilfe, mit **Tab** wird ergänzt, Befehle dürfen abgekürzt werden (`conf t`, `sh run`). Ein vorangestelltes **`no`** macht einen Befehl rückgängig.

**Wichtig**: Die **running-config** liegt im **RAM** und geht beim Neustart verloren; erst `copy running-config startup-config` (bzw. `write memory`) speichert sie im **NVRAM**. **Wildcard-Masken** (OSPF, ACL) sind **invertierte** Subnetzmasken (`255.255.255.0` → `0.0.0.255`). Für **Router-on-a-Stick** wird pro VLAN ein Subinterface mit `encapsulation dot1Q <VLAN>` angelegt; ein **Layer-3-Switch** nutzt `ip routing` und **SVIs** (`interface vlan X`).

## Einfach

Die IOS-Kommandozeile ist wie ein **Haus mit Stockwerken**. Unten im Erdgeschoss (`>`) darfst du nur **schauen**. Im ersten Stock (`#`) darfst du **alles anschauen**. Im Dachgeschoss (`(config)#`) darfst du **umbauen**. Für jedes Zimmer (Schnittstelle, VLAN, Leitung) gehst du in einen eigenen Raum. Alles, was du umbaust, steht erst mal **nur auf einem Notizzettel im RAM**. Wenn der Strom ausfällt, ist der Zettel weg. Erst wenn du **speicherst** (`copy run start`), wandert die Änderung in den **Tresor** (NVRAM).

## Merksatz
- **`>` → `enable` → `#` → `conf t` → `(config)#`**.
- **`copy run start`** nicht vergessen (RAM ≠ NVRAM).
- **`no shutdown`** schaltet eine Schnittstelle ein.
- **Wildcard = invertierte Subnetzmaske** (0.0.0.255 für /24).
- **Router-on-a-Stick:** `interface g0/0.10` + `encapsulation dot1Q 10`.
- **SSH statt Telnet:** Domain, RSA-Schlüssel, `transport input ssh`.

## Prüfungsfalle
- **Ohne `ip domain-name`** lässt sich der RSA-Schlüssel nicht erzeugen.
- Ein **Trunk** braucht auf **beiden** Seiten dasselbe **native VLAN**.
- **`enable password`** speichert im Klartext, **`enable secret`** gehasht (hat Vorrang).
- **ACL** enden mit einem **impliziten `deny any`**; ohne `permit` ist alles gesperrt.
- **Standard-ACL** filtert nur nach **Quelle**, **erweiterte** nach Quelle, Ziel, Protokoll, Port.
- **Portfast** nur an Endgeräte-Ports, nie zwischen Switches.

## Grafik

### Prompt-Treppe
Ein Haus mit drei Stockwerken (>, #, (config)#); ein Klick auf `enable` bzw. `configure terminal` lässt den Mauszeiger die Treppe hochlaufen. Die Zimmer im Dachgeschoss (config-if, config-line, config-vlan) leuchten auf.

### RAM oder NVRAM
Ein Notizzettel (running-config) und ein Tresor (startup-config); ein Stromausfall-Knopf lässt den Zettel verbrennen, wenn nicht vorher gespeichert wurde.

## Befehle

### Modi und Grundlagen
- `enable` – Wechsel in den privilegierten Modus (Router#)
- `configure terminal` – Wechsel in den globalen Konfigurationsmodus
- `exit` – Eine Ebene zurück
- `end` – Direkt zurück in den privilegierten Modus (Strg+Z)
- `hostname SW1` – Gerätenamen festlegen
- `no ip domain-lookup` – Verhindert DNS-Suche bei Tippfehlern
- `banner motd #Nur für Berechtigte#` – Warnbanner beim Anmelden
- `show running-config` – Aktive Konfiguration (RAM) anzeigen
- `copy running-config startup-config` – Konfiguration dauerhaft speichern (NVRAM)
- `erase startup-config` – Gespeicherte Konfiguration löschen (dann reload)
- `reload` – Gerät neu starten
- `show version` – IOS-Version, Uptime, Seriennummer

### Zugang und Sicherheit
- `enable secret Passwort` – Privilegiertes Kennwort (gehasht) setzen
- `service password-encryption` – Klartext-Kennwörter in der Konfiguration verschleiern
- `line console 0` – Konsolenzugang konfigurieren
- `line vty 0 15` – Remotezugänge (Telnet/SSH) konfigurieren
- `transport input ssh` – Nur SSH auf den VTY-Leitungen erlauben
- `login local` – Anmeldung mit lokalem Benutzerkonto
- `username admin secret Geheim#1` – Lokalen Benutzer anlegen
- `ip domain-name firma.local` – Domänennamen setzen (für SSH-Schlüssel nötig)
- `crypto key generate rsa modulus 2048` – RSA-Schlüssel für SSH erzeugen
- `ip ssh version 2` – SSH Version 2 erzwingen
- `switchport port-security` – Port Security am Access-Port aktivieren
- `switchport port-security maximum 2` – Maximal 2 MAC-Adressen pro Port erlauben
- `switchport port-security violation shutdown` – Port bei Verstoß abschalten (err-disabled)
- `switchport port-security mac-address sticky` – Gelernte MAC-Adressen dauerhaft merken
- `spanning-tree portfast` – Access-Port geht sofort in den Forwarding-Zustand
- `spanning-tree bpduguard enable` – Port abschalten, wenn BPDUs ankommen
- `ip dhcp snooping` – DHCP-Snooping aktivieren (gegen Rogue-DHCP)

### Schnittstellen und VLANs
- `interface gigabitEthernet 0/0` – Schnittstelle zur Konfiguration wählen
- `interface range fa0/1 - 24` – Mehrere Schnittstellen gleichzeitig konfigurieren
- `ip address 192.168.10.1 255.255.255.0` – IPv4-Adresse mit Maske setzen
- `no shutdown` – Schnittstelle einschalten
- `description Uplink zu Core` – Beschreibung an der Schnittstelle
- `speed 100 / duplex full` – Geschwindigkeit und Duplex fest einstellen
- `vlan 10` – VLAN 10 anlegen
- `name Verwaltung` – VLAN benennen
- `switchport mode access` – Port als Access-Port festlegen
- `switchport access vlan 10` – Access-Port dem VLAN 10 zuordnen
- `switchport mode trunk` – Port als Trunk festlegen
- `switchport trunk allowed vlan 10,20` – Erlaubte VLANs auf dem Trunk begrenzen
- `switchport trunk native vlan 99` – Natives (untagged) VLAN auf dem Trunk setzen
- `interface g0/0.10` – Subinterface für Router-on-a-Stick
- `encapsulation dot1Q 10` – 802.1Q-Tag für VLAN 10 am Subinterface
- `ip routing` – Layer-3-Switch: Routing aktivieren
- `interface vlan 10` – SVI (virtuelle Schnittstelle) für VLAN 10
- `channel-group 1 mode active` – Port in einen EtherChannel (LACP) aufnehmen

### Routing, DHCP, NAT, ACL
- `ip route 192.168.20.0 255.255.255.0 10.0.0.2` – Statische Route zum Netz 192.168.20.0/24 über 10.0.0.2
- `ip route 0.0.0.0 0.0.0.0 10.0.0.1` – Standardroute über 10.0.0.1
- `router ospf 1` – OSPF-Prozess 1 starten
- `network 192.168.10.0 0.0.0.255 area 0` – Netz mit Wildcard-Maske in OSPF Area 0 aufnehmen
- `router rip` – RIP starten (mit version 2 und no auto-summary nutzen)
- `ip dhcp excluded-address 192.168.10.1 192.168.10.10` – Adressen vom DHCP-Bereich ausnehmen
- `ip dhcp pool LAN` – DHCP-Pool anlegen
- `default-router 192.168.10.1` – Gateway im DHCP-Pool festlegen
- `ip helper-address 10.0.0.5` – DHCP-Relay: leitet Broadcasts an den DHCP-Server weiter
- `ip nat inside source list 1 interface g0/1 overload` – PAT: viele private Adressen hinter einer öffentlichen IP
- `access-list 1 permit 192.168.10.0 0.0.0.255` – Standard-ACL: Quellnetz erlauben
- `ip access-list extended WEB` – Benannte erweiterte ACL anlegen
- `permit tcp any host 10.0.0.5 eq 443` – ACL-Eintrag: HTTPS zum Server erlauben
- `ip access-group WEB in` – ACL eingehend an die Schnittstelle binden

### Diagnose (show-Befehle)
- `show ip interface brief` – Kurzübersicht: IP, Status, Protokoll aller Schnittstellen
- `show interfaces status` – Port, Status, VLAN, Duplex, Speed am Switch
- `show vlan brief` – VLANs und zugeordnete Ports
- `show interfaces trunk` – Trunk-Ports mit erlaubten VLANs
- `show ip route` – Routingtabelle
- `show mac address-table` – MAC-Adresstabelle des Switches
- `show cdp neighbors` – Direkt angeschlossene Cisco-Nachbarn
- `show spanning-tree` – STP-Status (Root Bridge, Portrollen)
- `show access-lists` – ACLs mit Trefferzählern
- `show ip dhcp binding` – Vergebene DHCP-Adressen
- `show port-security interface fa0/1` – Port-Security-Status eines Ports
- `show etherchannel summary` – Status der EtherChannels
- `ping 192.168.10.1` – Erreichbarkeit testen (Ausrufezeichen = Erfolg)
- `traceroute 8.8.8.8` – Weg der Pakete anzeigen

## Karteikarten
- F: Wofür steht/was bewirkt enable? | A: Wechsel in den privilegierten Modus (Router#)
- F: Wofür steht/was bewirkt configure terminal? | A: Wechsel in den globalen Konfigurationsmodus
- F: Wofür steht/was bewirkt exit? | A: Eine Ebene zurück
- F: Wofür steht/was bewirkt end? | A: Direkt zurück in den privilegierten Modus (Strg+Z)
- F: Wofür steht/was bewirkt hostname SW1? | A: Gerätenamen festlegen
- F: Wofür steht/was bewirkt no ip domain-lookup? | A: Verhindert DNS-Suche bei Tippfehlern
- F: Wofür steht/was bewirkt banner motd #Nur für Berechtigte#? | A: Warnbanner beim Anmelden
- F: Wofür steht/was bewirkt show running-config? | A: Aktive Konfiguration (RAM) anzeigen
- F: Wofür steht/was bewirkt copy running-config startup-config? | A: Konfiguration dauerhaft speichern (NVRAM)
- F: Wofür steht/was bewirkt erase startup-config? | A: Gespeicherte Konfiguration löschen (dann reload)
- F: Wofür steht/was bewirkt reload? | A: Gerät neu starten
- F: Wofür steht/was bewirkt show version? | A: IOS-Version, Uptime, Seriennummer
- F: Wofür steht/was bewirkt enable secret Passwort? | A: Privilegiertes Kennwort (gehasht) setzen
- F: Wofür steht/was bewirkt service password-encryption? | A: Klartext-Kennwörter in der Konfiguration verschleiern
- F: Wofür steht/was bewirkt line console 0? | A: Konsolenzugang konfigurieren
- F: Wofür steht/was bewirkt line vty 0 15? | A: Remotezugänge (Telnet/SSH) konfigurieren
- F: Wofür steht/was bewirkt transport input ssh? | A: Nur SSH auf den VTY-Leitungen erlauben
- F: Wofür steht/was bewirkt login local? | A: Anmeldung mit lokalem Benutzerkonto
- F: Wofür steht/was bewirkt username admin secret Geheim#1? | A: Lokalen Benutzer anlegen
- F: Wofür steht/was bewirkt ip domain-name firma.local? | A: Domänennamen setzen (für SSH-Schlüssel nötig)
- F: Wofür steht/was bewirkt crypto key generate rsa modulus 2048? | A: RSA-Schlüssel für SSH erzeugen
- F: Wofür steht/was bewirkt ip ssh version 2? | A: SSH Version 2 erzwingen
- F: Wofür steht/was bewirkt switchport port-security? | A: Port Security am Access-Port aktivieren
- F: Wofür steht/was bewirkt switchport port-security maximum 2? | A: Maximal 2 MAC-Adressen pro Port erlauben
- F: Wofür steht/was bewirkt switchport port-security violation shutdown? | A: Port bei Verstoß abschalten (err-disabled)
- F: Wofür steht/was bewirkt switchport port-security mac-address sticky? | A: Gelernte MAC-Adressen dauerhaft merken
- F: Wofür steht/was bewirkt spanning-tree portfast? | A: Access-Port geht sofort in den Forwarding-Zustand
- F: Wofür steht/was bewirkt spanning-tree bpduguard enable? | A: Port abschalten, wenn BPDUs ankommen
- F: Wofür steht/was bewirkt ip dhcp snooping? | A: DHCP-Snooping aktivieren (gegen Rogue-DHCP)
- F: Wofür steht/was bewirkt interface gigabitEthernet 0/0? | A: Schnittstelle zur Konfiguration wählen
- F: Wofür steht/was bewirkt interface range fa0/1 - 24? | A: Mehrere Schnittstellen gleichzeitig konfigurieren
- F: Wofür steht/was bewirkt ip address 192.168.10.1 255.255.255.0? | A: IPv4-Adresse mit Maske setzen
- F: Wofür steht/was bewirkt no shutdown? | A: Schnittstelle einschalten
- F: Wofür steht/was bewirkt description Uplink zu Core? | A: Beschreibung an der Schnittstelle
- F: Wofür steht/was bewirkt speed 100 / duplex full? | A: Geschwindigkeit und Duplex fest einstellen
- F: Wofür steht/was bewirkt vlan 10? | A: VLAN 10 anlegen
- F: Wofür steht/was bewirkt name Verwaltung? | A: VLAN benennen
- F: Wofür steht/was bewirkt switchport mode access? | A: Port als Access-Port festlegen
- F: Wofür steht/was bewirkt switchport access vlan 10? | A: Access-Port dem VLAN 10 zuordnen
- F: Wofür steht/was bewirkt switchport mode trunk? | A: Port als Trunk festlegen
- F: Wofür steht/was bewirkt switchport trunk allowed vlan 10,20? | A: Erlaubte VLANs auf dem Trunk begrenzen
- F: Wofür steht/was bewirkt switchport trunk native vlan 99? | A: Natives (untagged) VLAN auf dem Trunk setzen
- F: Wofür steht/was bewirkt interface g0/0.10? | A: Subinterface für Router-on-a-Stick
- F: Wofür steht/was bewirkt encapsulation dot1Q 10? | A: 802.1Q-Tag für VLAN 10 am Subinterface
- F: Wofür steht/was bewirkt ip routing? | A: Layer-3-Switch: Routing aktivieren
- F: Wofür steht/was bewirkt interface vlan 10? | A: SVI (virtuelle Schnittstelle) für VLAN 10
- F: Wofür steht/was bewirkt channel-group 1 mode active? | A: Port in einen EtherChannel (LACP) aufnehmen
- F: Wofür steht/was bewirkt ip route 192.168.20.0 255.255.255.0 10.0.0.2? | A: Statische Route zum Netz 192.168.20.0/24 über 10.0.0.2
- F: Wofür steht/was bewirkt ip route 0.0.0.0 0.0.0.0 10.0.0.1? | A: Standardroute über 10.0.0.1
- F: Wofür steht/was bewirkt router ospf 1? | A: OSPF-Prozess 1 starten
- F: Wofür steht/was bewirkt network 192.168.10.0 0.0.0.255 area 0? | A: Netz mit Wildcard-Maske in OSPF Area 0 aufnehmen
- F: Wofür steht/was bewirkt router rip? | A: RIP starten (mit version 2 und no auto-summary nutzen)
- F: Wofür steht/was bewirkt ip dhcp excluded-address 192.168.10.1 192.168.10.10? | A: Adressen vom DHCP-Bereich ausnehmen
- F: Wofür steht/was bewirkt ip dhcp pool LAN? | A: DHCP-Pool anlegen
- F: Wofür steht/was bewirkt default-router 192.168.10.1? | A: Gateway im DHCP-Pool festlegen
- F: Wofür steht/was bewirkt ip helper-address 10.0.0.5? | A: DHCP-Relay: leitet Broadcasts an den DHCP-Server weiter
- F: Wofür steht/was bewirkt ip nat inside source list 1 interface g0/1 overload? | A: PAT: viele private Adressen hinter einer öffentlichen IP
- F: Wofür steht/was bewirkt access-list 1 permit 192.168.10.0 0.0.0.255? | A: Standard-ACL: Quellnetz erlauben
- F: Wofür steht/was bewirkt ip access-list extended WEB? | A: Benannte erweiterte ACL anlegen
- F: Wofür steht/was bewirkt permit tcp any host 10.0.0.5 eq 443? | A: ACL-Eintrag: HTTPS zum Server erlauben
- F: Wofür steht/was bewirkt ip access-group WEB in? | A: ACL eingehend an die Schnittstelle binden
- F: Wofür steht/was bewirkt show ip interface brief? | A: Kurzübersicht: IP, Status, Protokoll aller Schnittstellen
- F: Wofür steht/was bewirkt show interfaces status? | A: Port, Status, VLAN, Duplex, Speed am Switch
- F: Wofür steht/was bewirkt show vlan brief? | A: VLANs und zugeordnete Ports
- F: Wofür steht/was bewirkt show interfaces trunk? | A: Trunk-Ports mit erlaubten VLANs
- F: Wofür steht/was bewirkt show ip route? | A: Routingtabelle
- F: Wofür steht/was bewirkt show mac address-table? | A: MAC-Adresstabelle des Switches
- F: Wofür steht/was bewirkt show cdp neighbors? | A: Direkt angeschlossene Cisco-Nachbarn
- F: Wofür steht/was bewirkt show spanning-tree? | A: STP-Status (Root Bridge, Portrollen)
- F: Wofür steht/was bewirkt show access-lists? | A: ACLs mit Trefferzählern
- F: Wofür steht/was bewirkt show ip dhcp binding? | A: Vergebene DHCP-Adressen
- F: Wofür steht/was bewirkt show port-security interface fa0/1? | A: Port-Security-Status eines Ports
- F: Wofür steht/was bewirkt show etherchannel summary? | A: Status der EtherChannels
- F: Wofür steht/was bewirkt ping 192.168.10.1? | A: Erreichbarkeit testen (Ausrufezeichen = Erfolg)
- F: Wofür steht/was bewirkt traceroute 8.8.8.8? | A: Weg der Pakete anzeigen

## Quiz

? Was bewirkt `erase startup-config`?
* Gespeicherte Konfiguration löschen (dann reload)
- Routingtabelle
- Kurzübersicht: IP, Status, Protokoll aller Schnittstellen
- Remotezugänge (Telnet/SSH) konfigurieren

? Was bewirkt `ip ssh version 2`?
* SSH Version 2 erzwingen
- IPv4-Adresse mit Maske setzen
- ACLs mit Trefferzählern
- Eine Ebene zurück

? Was bewirkt `show spanning-tree`?
* STP-Status (Root Bridge, Portrollen)
- RIP starten (mit version 2 und no auto-summary nutzen)
- RSA-Schlüssel für SSH erzeugen
- Gelernte MAC-Adressen dauerhaft merken

? Was bewirkt `ip address 192.168.10.1 255.255.255.0`?
* IPv4-Adresse mit Maske setzen
- Anmeldung mit lokalem Benutzerkonto
- Gerätenamen festlegen
- Klartext-Kennwörter in der Konfiguration verschleiern

? Was bewirkt `crypto key generate rsa modulus 2048`?
* RSA-Schlüssel für SSH erzeugen
- DHCP-Pool anlegen
- Erreichbarkeit testen (Ausrufezeichen = Erfolg)
- Port, Status, VLAN, Duplex, Speed am Switch

? Was bewirkt `permit tcp any host 10.0.0.5 eq 443`?
* ACL-Eintrag: HTTPS zum Server erlauben
- RSA-Schlüssel für SSH erzeugen
- Klartext-Kennwörter in der Konfiguration verschleiern
- Natives (untagged) VLAN auf dem Trunk setzen

? Was bewirkt `ip route 0.0.0.0 0.0.0.0 10.0.0.1`?
* Standardroute über 10.0.0.1
- IPv4-Adresse mit Maske setzen
- Gelernte MAC-Adressen dauerhaft merken
- Vergebene DHCP-Adressen

? Was bewirkt `speed 100 / duplex full`?
* Geschwindigkeit und Duplex fest einstellen
- ACL-Eintrag: HTTPS zum Server erlauben
- Statische Route zum Netz 192.168.20.0/24 über 10.0.0.2
- Gespeicherte Konfiguration löschen (dann reload)

? Was bewirkt `ip dhcp snooping`?
* DHCP-Snooping aktivieren (gegen Rogue-DHCP)
- Beschreibung an der Schnittstelle
- Konfiguration dauerhaft speichern (NVRAM)
- Schnittstelle einschalten

? Was bewirkt `switchport trunk native vlan 99`?
* Natives (untagged) VLAN auf dem Trunk setzen
- Routingtabelle
- DHCP-Pool anlegen
- Adressen vom DHCP-Bereich ausnehmen
