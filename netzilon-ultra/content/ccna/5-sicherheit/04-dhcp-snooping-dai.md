---
id: ccna-dhcp-snooping-dai
bereich: CCNA
block: CCNA 5.7
kapitel: Security Fundamentals
titel: DHCP Snooping, Dynamic ARP Inspection (DAI), IP Source Guard
stufe: Profi
fach: TCP/IP – CCNA – Basic
pruefungen: [CCNA, AP2]
quellen: [CCNA_200-301_Notes_-_Jeremys_IT_Lab.pdf, 200_301_CCNA_v1.0_2.pdf, 200-301.pdf, 13_DHCP.pdf]
verweise: [ccna-dhcp-dns, ccna-port-security, ccna-switching-mac-arp, ccna-security-grundlagen]
---

## Profi

### DHCP Snooping
Layer-2-Sicherheitsfunktion gegen **Rogue DHCP-Server** und **DHCP Starvation**. Der Switch teilt Ports in zwei Klassen:
- **Trusted**: dürfen DHCP-Server-Nachrichten (Offer, ACK, NAK) senden – Uplinks, Port zum legitimen Server.
- **Untrusted** (Standard): dürfen nur Client-Nachrichten (Discover, Request); Server-Nachrichten werden verworfen. Das ist der Standard für alle Access-Ports.
Der Switch baut aus ACKs die **DHCP-Snooping-Binding-Tabelle**: MAC, IP, Lease, VLAN, Port. Weitere Prüfung: Die MAC im Frame muss zur Client-MAC im DHCP-Paket passen (verhindert Starvation mit gefälschter chaddr). **Rate Limiting** (`ip dhcp snooping limit rate 15`) setzt Pakete/s pro untrusted Port; Überschreitung → err-disabled.
```
ip dhcp snooping
ip dhcp snooping vlan 10,20
no ip dhcp snooping information option   (falls Relay/Option 82 Probleme macht)
interface g0/1
 ip dhcp snooping trust
interface range f0/1 - 24
 ip dhcp snooping limit rate 15
```
Kontrolle: `show ip dhcp snooping`, `show ip dhcp snooping binding`.

### Dynamic ARP Inspection (DAI)
Schutz gegen **ARP-Spoofing/Poisoning** (Man-in-the-Middle). DAI prüft ARP-Requests/-Replies auf **untrusted** Ports gegen die DHCP-Snooping-Binding-Tabelle (oder manuelle ARP-ACLs bei statischen IPs). Passt IP↔MAC nicht → Paket verworfen und geloggt. Zusätzliche Validierung: `ip arp inspection validate src-mac dst-mac ip`. Rate Limit Standard 15 ARP-Pakete/s (Violation: err-disabled).
```
ip arp inspection vlan 10,20
interface g0/1
 ip arp inspection trust
```
Voraussetzung: DHCP Snooping aktiv (für die Bindings). Kontrolle: `show ip arp inspection`, `show ip arp inspection statistics`.

### IP Source Guard
Filtert IP-Verkehr am Access-Port nach der Binding-Tabelle (Quell-IP/MAC muss gebunden sein): `ip verify source`.

## Einfach

Stell dir vor, im Klassenzimmer fragt ein neuer Schüler laut: „Welche Zimmernummer bekomme ich?“ (DHCP-Discover). Der Klassensprecher antwortet: „Nummer 12“ (Offer). Jetzt setzt sich ein **Schummler** auf einen Stuhl und ruft auch „Nummer 99, geh mal zu meinem Freund!“ – der Neue folgt ihm und landet bei den Falschen (Rogue DHCP, ein Man-in-the-Middle-Angriff).

**DHCP Snooping** ist der **Lehrer**, der festlegt: „Nur der Klassensprecher und die Tür (Trusted) dürfen Zimmernummern vergeben. Alle anderen Sitzplätze (Untrusted) dürfen nur Fragen stellen.“ Gleichzeitig schreibt der Lehrer auf: „Maria sitzt auf Platz 5, hat Nummer 12.“ Das ist die **Binding-Tabelle**.

**DAI** ist ein Lehrer, der Hände hochnimmt, wenn jemand ruft: „Ich bin Maria!“ – und dann in seinem Buch nachschaut: Maria sitzt auf Platz 5 mit Nummer 12. Wenn dieser Schüler auf Platz 8 sitzt und behauptet, er sei Maria, bekommt er keine Antwort. So können Angreifer ihre Adresse nicht mehr fälschen (ARP-Spoofing).

Zusammen: erst Snooping aufbauen (das „Buch“ schreiben), dann DAI einschalten (das Buch benutzen). Server und Uplink-Kabel werden als „vertrauenswürdig“ gekennzeichnet; alle Anschlüsse für Computer nicht.

Praktisch heißt das: Die Netzwerkdose im Besprechungsraum ist untrusted. Wenn dort jemand einen kleinen Router einsteckt, der selbst Adressen verteilen will, verwirft der Switch dessen Angebote einfach und schreibt einen Hinweis ins Logbuch. Dein Laptop merkt davon nichts und bekommt seine Adresse vom richtigen Server. Genau deshalb ist DHCP Snooping eine der ersten Dinge, die ein Administrator im Firmennetz einschaltet.

## Merksatz
- **Snooping: Server-Ports = trusted, alle anderen untrusted.**
- **Snooping baut die Binding-Tabelle (MAC-IP-Port-VLAN).**
- **DAI braucht Snooping – prüft ARP gegen die Bindings.**
- **Uplinks und Switch-Switch-Verbindungen = trusted.**
- **Rate Limit: 15 pps, danach err-disabled.**

## Prüfungsfalle
- DHCP Snooping muss **global und pro VLAN** aktiviert werden (`ip dhcp snooping` + `ip dhcp snooping vlan`).
- **Alle Ports sind standardmäßig untrusted** – auch der Port zum DHCP-Server muss manuell trusted werden, sonst bekommt keiner eine Adresse.
- DAI **ohne Snooping** kennt keine Bindings → bei statischen IPs entstehen Verwerfungen; dann ARP-ACL.
- Option 82 (Relay Information) kann bei Relay-Konstellationen zu Verwerfungen führen.
- ARP-Spoofing wird **nicht** durch Port Security allein verhindert.
- Trusted-Port heißt: keine Prüfung, nicht „zufällig sicher“.

## Grafik
### Rogue DHCP
1. Client -> Switch: DHCPDISCOVER
2. Rogue-Server -> Switch: DHCPOFFER (falsches Gateway) – untrusted
3. Switch: verwirft Offer am untrusted Port
4. DHCP-Server -> Switch: DHCPOFFER – trusted
5. Switch -> Client: Offer und ACK; Binding-Eintrag wird geschrieben

### DAI
1. Angreifer -> Switch: ARP-Reply "10.0.0.1 ist bei MAC E:E:E" (gefälscht)
2. Switch: Binding-Tabelle: 10.0.0.1 gehört zu MAC A:A:A, Port 1
3. Switch: IP/MAC passt nicht – ARP verworfen, Log
4. Text: ARP-Cache der Opfer bleibt sauber

## Lab
**Packet Tracer: SW1 mit g0/1 (Uplink zu DHCP-Server), f0/1 (PC1), f0/2 (Rogue-Server)**

### Cisco IOS
```
SW1(config)# ip dhcp snooping
SW1(config)# ip dhcp snooping vlan 10
SW1(config)# interface g0/1
SW1(config-if)# ip dhcp snooping trust
SW1(config-if)# exit
SW1(config)# interface range f0/1 - 2
SW1(config-if-range)# ip dhcp snooping limit rate 15
SW1(config)# ip arp inspection vlan 10
SW1(config)# interface g0/1
SW1(config-if)# ip arp inspection trust
SW1# show ip dhcp snooping binding
SW1# show ip arp inspection
```
1. PC1 neu per DHCP – Binding-Eintrag prüfen.
2. Rogue-Server f0/2: Offers werden verworfen (`show ip dhcp snooping statistics`).
3. Statische IP an PC testen – DAI wirft Frames weg, wenn kein Binding.

## Befehle
- `ip dhcp snooping` – global an
- `ip dhcp snooping vlan 10` – für VLAN
- `ip dhcp snooping trust` – Port vertrauen
- `ip arp inspection vlan 10` – DAI aktivieren
- `ip arp inspection trust` – DAI-Trust
- `show ip dhcp snooping binding` – Bindings
- `ip verify source` – IP Source Guard

## Übungen
- A: Welche Ports werden bei DHCP Snooping trusted? | L: Uplinks, Verbindungen zu Switches/Routern und zum legitimen DHCP-Server.
- A: Welche Tabelle bildet DHCP Snooping? | L: DHCP-Snooping-Binding-Tabelle (MAC, IP, VLAN, Port, Lease).
- A: Wogegen schützt DAI? | L: ARP-Spoofing/Poisoning.
- A: Warum bekommt kein Client eine Adresse nach Aktivierung von Snooping? | L: Der Port zum DHCP-Server wurde nicht als trusted markiert.
- A: Reihenfolge der Einführung? | L: Erst DHCP Snooping, dann DAI (braucht Bindings).
- A: Was geschieht bei Überschreiten des Rate Limits? | L: Port wird err-disabled.

## Karteikarten
- F: Zweck von DHCP Snooping? | A: Schutz vor Rogue-DHCP-Servern und Starvation.
- F: Standardzustand der Ports? | A: Untrusted.
- F: Was ist die Binding-Tabelle? | A: Zuordnung MAC–IP–VLAN–Port aus gesnoopten DHCP-ACKs.
- F: Was prüft DAI? | A: ARP-Pakete gegen die Binding-Tabelle.
- F: Wogegen schützt DAI? | A: ARP-Poisoning / MITM.
- F: Welche Voraussetzung hat DAI? | A: DHCP Snooping oder ARP-ACLs.
- F: Rate Limit Standard bei DAI? | A: 15 Pakete/s.
- F: Befehl für Snooping-Trust? | A: ip dhcp snooping trust
- F: Was ist IP Source Guard? | A: Filtert Quell-IP/MAC nach Binding-Tabelle.
- F: DHCP Starvation? | A: Erschöpfen des Pools durch viele gefälschte Requests.

## Quiz
? Welche Ports sind bei DHCP Snooping standardmäßig vertrauenswürdig?
* Keine
- Alle
- Nur Trunks
- Nur Uplinks
? Wogegen schützt DAI?
* ARP-Spoofing
- DNS-Spoofing
- VLAN-Hopping
- SYN-Flood
? Woher bezieht DAI seine Vergleichsdaten?
* Aus der DHCP-Snooping-Binding-Tabelle
- Aus der Routingtabelle
- Aus dem MAC-Adress-Table
- Aus dem DNS
? Welcher Befehl markiert einen Server-Port?
* ip dhcp snooping trust
- ip dhcp trust
- ip arp trust
- ip snooping server
? Was passiert mit DHCP-Offers an untrusted Ports?
* Sie werden verworfen
- Sie werden weitergeleitet
- Sie werden gespeichert
- Sie werden umgeleitet
? Welcher Angriff erschöpft den DHCP-Pool?
* DHCP Starvation
- MAC Spoofing
- Teardrop
- Smurf
? Wie aktiviert man Snooping für VLAN 10?
* ip dhcp snooping vlan 10
- vlan 10 snooping
- ip dhcp vlan 10 enable
- snoop vlan 10
? Was zeigt show ip dhcp snooping binding?
* Zuordnung von MAC, IP, VLAN und Port
- Die NAT-Tabelle
- Die Routingtabelle
- Die Spanning-Tree-Rolle
? Was gilt für Uplinks?
* Sie sollten trusted sein
- Sie sollten untrusted sein
- Sie müssen shutdown sein
- Sie brauchen Port Security
